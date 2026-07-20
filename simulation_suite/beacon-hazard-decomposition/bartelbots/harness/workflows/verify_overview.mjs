#!/usr/bin/env node
// Workflow: verify one subhazard overview with the researcher + skeptic loop,
// on open models, writing the app's inbox format. This is the open-source
// twin of the Claude verification fleet — same skill, same schema, same inbox.
//
//   node workflows/verify_overview.mjs FR2
//   node workflows/verify_overview.mjs FR2 --researcher gpt-oss-20b --skeptic mistral-small
//   node workflows/verify_overview.mjs FR2 --mock          # offline structure test
//
// Context is file-based (Bartlebrain), so nothing here is model-specific:
//   BARTLE_BRAIN  overviews dir  (default: mathison-app/src/hazards/overviews)
//   BARTLE_INBOX  output inbox   (default: mathison-app/verification-inbox)
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chat, chatAgentic } from '../router.mjs'
import { webSearch, WEB_SEARCH_TOOL } from '../tools/web_search.mjs'
import { RESULT_SCHEMA, validateResult } from '../schema.mjs'
import { logSPO } from '../../../consideration_engine/engine/lib/log.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const HARNESS = join(HERE, '..')
// The app (Bartlebrain host) and this harness live in unrelated trees on this
// machine, so the default is an absolute path — override with env on any other.
const APP = process.env.BARTLE_APP || '/Users/kristinmullaney/miniconda3/envs/mathison/mathison-app'
const BRAIN = process.env.BARTLE_BRAIN || join(APP, 'src', 'hazards', 'overviews')
const INBOX = process.env.BARTLE_INBOX || join(APP, 'verification-inbox')
const SKILL = readFileSync(join(HARNESS, 'skills', 'verify_overview.md'), 'utf8')

const FAMFILE = { FR: 'fire', FL: 'flood', FF: 'flash-flood', EQ: 'earthquake', TS: 'tsunami', VO: 'volcanic', L: 'landslide', WD: 'extreme-wind', CV: 'severe-convective', SN: 'extreme-snow', CD: 'extreme-cold', HT: 'extreme-heat', DR: 'drought', CO: 'coastal', GS: 'ground-failure', DS: 'dust', AQ: 'air-quality', SW: 'space-weather' }

function loadFields(code) {
  const fam = FAMFILE[code.match(/^[A-Z]+/)?.[0]]
  if (!fam) throw new Error(`no family for code "${code}"`)
  const doc = JSON.parse(readFileSync(join(BRAIN, `${fam}.json`), 'utf8'))
  const entry = doc.subhazards[code]
  if (!entry) throw new Error(`${code} not found in ${fam}.json`)
  return { fam, fields: entry.fields, name: doc.subhazards[code].name }
}

// Deterministic grounding: the harness runs the searches (scripts-first), the
// model interprets. Query the fabrication-prone fields with the hazard name.
async function gather(code, fields) {
  const risky = ['key_papers', 'researchers', 'major_events', 'traditional_models', 'current_alerting']
  const evidence = []
  for (const f of risky) {
    if (!fields[f]) continue
    const q = `${code} ${fields.what_is?.slice(0, 60) || ''} ${f.replace('_', ' ')}`.trim()
    const r = await webSearch(q, { maxResults: 4 })
    evidence.push({ field: f, query: r.query, configured: r.configured, results: r.results })
  }
  return evidence
}

const evidenceBlock = (ev) =>
  ev.some((e) => e.configured && e.results.length)
    ? ev.map((e) => `# evidence for ${e.field}\n` + e.results.map((r) => `- ${r.title} <${r.url}> — ${r.snippet?.slice(0, 200)}`).join('\n')).join('\n\n')
    : '(no web-search provider configured — verify from your own knowledge and mark low-confidence claims as needing a source)'

async function run() {
  const args = process.argv.slice(2)
  const code = args.find((a) => !a.startsWith('--'))
  if (!code) { console.error('usage: node workflows/verify_overview.mjs <CODE> [--researcher M] [--skeptic M] [--mock]'); process.exit(2) }
  const opt = (k, d) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : d }
  const mock = args.includes('--mock')
  // --tools: the model drives web_search agentically (needs a tool-calling model,
  // e.g. --researcher local-tools). Default: the harness runs the searches
  // deterministically (scripts-first) and hands results in — works on any model.
  const agentic = args.includes('--tools')
  const researcher = opt('researcher', 'verify.researcher')
  const skeptic = opt('skeptic', 'verify.skeptic')

  const { fam, fields } = loadFields(code)
  const fieldsJson = JSON.stringify(fields, null, 1)
  const evidence = mock || agentic ? [] : await gather(code, fields)
  const ev = evidenceBlock(evidence)

  const runners = { web_search: (a) => webSearch(a.query, { maxResults: 4 }) }
  const mockResult = (spec) => ({
    data: { code, verdict: 'needs_revision', corrections: [], confirmations: [{ field: 'what_is', claim: `mock run via ${spec.id}`, source: 'mock://' }], summary: `Mock ${spec.id} run — pipeline + schema + inbox verified, no model called.` },
    inTok: 0, outTok: 0, costUSD: 0,
  })

  // One verification pass. In --tools mode the model drives web_search itself;
  // otherwise it reads the harness-gathered evidence (scripts-first default).
  const turn = (taskClass, sys, user) => {
    const messages = [{ role: 'system', content: sys }, { role: 'user', content: user }]
    if (mock) return chat({ taskClass, mock: mockResult, schema: RESULT_SCHEMA, messages })
    if (agentic) return chatAgentic({ taskClass, tools: [WEB_SEARCH_TOOL], runners, schema: RESULT_SCHEMA, messages })
    return chat({ taskClass, schema: RESULT_SCHEMA, messages })
  }

  // Pass 1 — researcher
  const r1 = await turn(
    researcher,
    SKILL + '\n\nYou are the RESEARCHER. Return only the RESULT JSON.',
    `Subhazard ${code} (family ${fam}). Overview fields:\n${fieldsJson}\n\nWeb evidence:\n${ev}`,
  )
  logSPO(code, { subject: `harness.verify`, predicate: 'ran', object: 'researcher', context: `model=${r1.model || 'mock'} corrections=${r1.data.corrections.length}` })

  // Pass 2 — skeptic (different lineage): audit + attack, produce the final merge
  const r2 = await turn(
    skeptic,
    SKILL + '\n\nYou are the SKEPTIC. Audit the researcher, attack unflagged claims, return the FINAL merged RESULT JSON.',
    `Subhazard ${code}. Overview fields:\n${fieldsJson}\n\nWeb evidence:\n${ev}\n\nResearcher result:\n${JSON.stringify(r1.data, null, 1)}`,
  )
  const final = r2.data
  final.code = code

  const { ok, errors } = validateResult(final, code)
  if (!ok) { console.error(`schema validation failed: ${errors.join('; ')}`); process.exit(1) }

  mkdirSync(INBOX, { recursive: true })
  const out = join(INBOX, `${code}.json`)
  writeFileSync(out, JSON.stringify(final, null, 2) + '\n')
  logSPO(code, { subject: `harness.verify`, predicate: 'wrote', object: `inbox/${code}.json`, context: `verdict=${final.verdict} corrections=${final.corrections.length} researcher=${r1.model || 'mock'} skeptic=${r2.model || 'mock'}` })
  const tokens = (r1.inTok || 0) + (r1.outTok || 0) + (r2.inTok || 0) + (r2.outTok || 0)
  const costUSD = (r1.costUSD || 0) + (r2.costUSD || 0)
  logSPO(code, { subject: 'harness.verify', predicate: 'cost', object: `$${costUSD.toFixed(4)}`, context: `tokens=${tokens} researcher=${r1.model || 'mock'} skeptic=${r2.model || 'mock'}` })
  console.log(`${code}: ${final.verdict}, ${final.corrections.length} corrections -> ${out}`)
  console.log(`  researcher=${r1.model || 'mock'} skeptic=${r2.model || 'mock'} evidence=${evidence.filter((e) => e.configured && e.results.length).length}/${evidence.length} fields grounded`)
  console.log(`  cost: $${costUSD.toFixed(4)} (${tokens.toLocaleString()} tokens) — ledger: harness/costs.jsonl · × ~144 draft subhazards left`)
  console.log(`  apply with: cd ${APP} && node scripts/apply-inbox.mjs`)
}

run().catch((e) => { console.error(e.message); process.exit(1) })
