// The model router — "router, not vendor." Every model call in the fleet goes
// through here. It resolves a task class to a registered model, enforces the
// provenance policy structurally, and speaks the OpenAI-compatible chat API so
// the backend (Ollama local, vLLM, or a hosted gateway) is swappable without
// touching workflow code. Zero dependencies: Node 18+ global fetch.
import { readFileSync, mkdirSync, appendFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { assertProvenance } from './provenance.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const REGISTRY = JSON.parse(readFileSync(join(HERE, 'models.json'), 'utf8'))

// Resolve a task class (or a bare model id, or an alias) to a concrete,
// vetted, callable model spec. Refuses anything unregistered or Chinese-origin.
export function resolveModel(taskClassOrId) {
  const viaClass = REGISTRY.task_classes[taskClassOrId]
  const viaAlias = REGISTRY.aliases[viaClass ?? taskClassOrId]
  const id = viaAlias ?? viaClass ?? taskClassOrId
  const spec = REGISTRY.models[id]
  if (!spec) throw new Error(`unregistered model "${id}" (from "${taskClassOrId}") — add it to models.json first, only registered models are callable`)
  assertProvenance(id) // hard gate: blocklist + approved-family allowlist
  const baseUrl = process.env[spec.base_url_env] || spec.base_url_default
  const apiKey = spec.api_key_env ? process.env[spec.api_key_env] : undefined
  return { id, baseUrl, apiKey, supportsJsonSchema: !!spec.supports_json_schema, tier: spec.tier, origin: spec.origin, priceIn: spec.price_in ?? 0, priceOut: spec.price_out ?? 0 }
}

// USD cost of one call from the provider's usage counts and the registered
// per-Mtok price. Local models price to 0. Ledgered to costs.jsonl so a batch
// can be summed — the number that decides whether owning hardware beats renting.
function accountCost(spec, usage) {
  const inTok = usage?.prompt_tokens ?? 0
  const outTok = usage?.completion_tokens ?? 0
  const costUSD = (inTok / 1e6) * spec.priceIn + (outTok / 1e6) * spec.priceOut
  if (process.env.BARTLE_COST !== '0') {
    try {
      appendFileSync(join(HERE, 'costs.jsonl'), JSON.stringify({ ts: new Date().toISOString(), model: spec.id, tier: spec.tier, in: inTok, out: outTok, usd: round4(costUSD) }) + '\n')
    } catch { /* ledger is best-effort */ }
  }
  return { inTok, outTok, costUSD }
}
const round4 = (n) => Math.round(n * 1e4) / 1e4

// One chat completion. If `schema` is given, requests JSON output and returns
// the parsed object; otherwise returns the assistant text. Retries transient
// failures. `mock` short-circuits the network for offline structure testing.
export async function chat({ taskClass, model, messages, schema, temperature = 0.2, maxTokens = 4096, mock }) {
  const spec = resolveModel(model ?? taskClass)
  if (mock) return mock(spec, messages)

  const body = {
    model: spec.id,
    messages,
    temperature,
    max_tokens: maxTokens,
  }
  if (schema) {
    body.response_format = spec.supportsJsonSchema
      ? { type: 'json_schema', json_schema: { name: 'result', schema, strict: false } }
      : { type: 'json_object' }
  }

  let lastErr
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(`${spec.baseUrl.replace(/\/$/, '')}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(spec.apiKey ? { Authorization: `Bearer ${spec.apiKey}` } : {}) },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error(`${spec.id} HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`)
      const data = await res.json()
      const text = data.choices?.[0]?.message?.content ?? ''
      const cost = accountCost(spec, data.usage)
      if (!schema) return { text, model: spec.id, ...cost }
      return { data: parseJson(text), text, model: spec.id, ...cost }
    } catch (err) {
      lastErr = err
      if (attempt < 3) await sleep(500 * attempt)
    }
  }
  throw new Error(`router.chat failed for ${spec.id} after 3 attempts: ${lastErr?.message}`)
}

// Agentic tool loop — the model drives the tools. Give it `tools` (OpenAI tool
// schemas) and `runners` ({name: async(args)=>result}); it emits tool_calls, we
// execute and feed results back, repeat until it returns content. The final turn
// is constrained to `schema` (JSON) when given. Every model turn is trace-
// captured (BARTLE_TRACE=1) so the tool-call corpus accumulates for a future
// Tinker LoRA — the reason we don't fine-tune first: no corpus yet, so build it.
export async function chatAgentic({ taskClass, model, messages, tools, runners, schema, temperature = 0.2, maxRounds = 5, mock }) {
  const spec = resolveModel(model ?? taskClass)
  if (mock) return mock(spec, messages)
  const convo = [...messages]
  let inTok = 0, outTok = 0, costUSD = 0 // accumulate across tool rounds

  for (let round = 1; round <= maxRounds; round++) {
    const finalTurn = round === maxRounds
    const body = {
      model: spec.id,
      messages: convo,
      temperature,
      // offer tools until the final turn, where we force the structured answer
      ...(finalTurn ? {} : { tools, tool_choice: 'auto' }),
      ...(schema && finalTurn ? { response_format: jsonFormat(spec, schema) } : {}),
    }
    const data = await post(spec, body)
    const msg = data.choices?.[0]?.message ?? {}
    trace(spec, body, msg, round)
    const c = accountCost(spec, data.usage)
    inTok += c.inTok; outTok += c.outTok; costUSD += c.costUSD
    convo.push(msg)

    const calls = msg.tool_calls ?? []
    if (!calls.length || finalTurn) {
      const acc = { rounds: round, model: spec.id, inTok, outTok, costUSD }
      if (schema) return { data: parseJson(msg.content ?? ''), ...acc }
      return { text: msg.content ?? '', ...acc }
    }
    for (const call of calls) {
      const name = call.function?.name
      let out
      try {
        out = await runners[name]?.(JSON.parse(call.function?.arguments || '{}'))
      } catch (err) {
        out = { error: err.message }
      }
      convo.push({ role: 'tool', tool_call_id: call.id, name, content: JSON.stringify(out ?? { error: `no runner for ${name}` }) })
    }
  }
}

const jsonFormat = (spec, schema) =>
  spec.supportsJsonSchema ? { type: 'json_schema', json_schema: { name: 'result', schema, strict: false } } : { type: 'json_object' }

async function post(spec, body) {
  let lastErr
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(`${spec.baseUrl.replace(/\/$/, '')}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(spec.apiKey ? { Authorization: `Bearer ${spec.apiKey}` } : {}) },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error(`${spec.id} HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`)
      return await res.json()
    } catch (err) {
      lastErr = err
      if (attempt < 3) await sleep(500 * attempt)
    }
  }
  throw new Error(`router request failed for ${spec.id} after 3 attempts: ${lastErr?.message}`)
}

// Append one model turn to the trace corpus — raw material for a later LoRA.
function trace(spec, body, msg, round) {
  if (process.env.BARTLE_TRACE !== '1') return
  try {
    const dir = join(HERE, 'traces')
    mkdirSync(dir, { recursive: true })
    appendFileSync(join(dir, 'toolcalls.jsonl'), JSON.stringify({ model: spec.id, round, sent: body.messages.at(-1), got: msg }) + '\n')
  } catch { /* tracing is best-effort */ }
}

// Tolerant JSON extraction — open models sometimes wrap JSON in prose or fences.
export function parseJson(text) {
  try {
    return JSON.parse(text)
  } catch {
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (fenced) try { return JSON.parse(fenced[1]) } catch { /* fall through */ }
    const span = text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1)
    return JSON.parse(span)
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

export { REGISTRY }
