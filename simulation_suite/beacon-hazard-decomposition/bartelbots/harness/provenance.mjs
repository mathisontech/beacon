// Provenance policy — the single source of truth for which model families may
// ever be called, fleet-wide. Hard constraint (Kristin, 2026-07-18): no
// Chinese-origin models, ever — not chat, not embeddings, not rerankers, not
// fine-tune bases. This is not a cost trade-off. See BARTELBOTS_ARCHITECTURE.md
// "Design principles" and STATUS.md "PROVENANCE POLICY".
//
// consider.mjs carries the same lists as a static plan-gate; this module is the
// runtime enforcement the router calls before every model request. Keep the two
// in sync (or import this from consider.mjs in a later pass).

// Substring match, case-insensitive, on the model id. Any hit = hard refusal.
export const BLOCKLIST = [
  'qwen', 'kimi', 'glm', 'deepseek', 'minimax', 'hunyuan', 'ernie',
  'internlm', 'yi-', 'bge', 'gte-', 'baai', 'moonshot', 'zhipu', '01-ai', '01ai',
]

// Approved US/EU (+ allied) families. A model must match one of these AND be
// registered in models.json to be callable. Inkling ruled IN 2026-07-18
// (US-trained-from-scratch weights; Kimi-bootstrapped post-training reviewed).
export const ALLOWLIST = [
  'gpt-oss', 'llama', 'granite', 'gemma', 'mistral', 'mixtral', 'nemotron',
  'inkling', 'olmo', 'phi-', 'phi3', 'phi4', 'smollm', 'lfm', 'liquid',
  'nomic', 'embeddinggemma', 'granite-embedding',
]

export class ProvenanceError extends Error {}

// Throws on any Chinese-origin model (blocklist) and on any model not on the
// approved-family allowlist. Structural enforcement: unknown provenance is
// refused, not silently allowed — a human must add the family to ALLOWLIST.
export function assertProvenance(modelId) {
  const m = String(modelId).toLowerCase()
  const hit = BLOCKLIST.find((b) => m.includes(b))
  if (hit)
    throw new ProvenanceError(
      `provenance_violation: "${modelId}" matches blocked family "${hit}" — no Chinese-origin models, ever.`,
    )
  if (!ALLOWLIST.some((a) => m.includes(a)))
    throw new ProvenanceError(
      `unknown_provenance: "${modelId}" is not on the approved-family allowlist — a human must vet and register it before use.`,
    )
  return true
}
