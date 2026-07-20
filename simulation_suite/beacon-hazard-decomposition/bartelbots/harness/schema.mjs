// The RESULT interchange schema — the contract shared by the Claude fleet, the
// open-model harness, and the app's apply step. One shape, one inbox, either
// producer. Plus a zero-dependency validator (enough to catch a malformed model
// return without pulling in ajv).

export const RESULT_SCHEMA = {
  type: 'object',
  required: ['code', 'verdict', 'corrections', 'confirmations', 'summary'],
  properties: {
    code: { type: 'string' },
    verdict: { enum: ['verified', 'needs_revision'] },
    corrections: {
      type: 'array',
      items: {
        type: 'object',
        required: ['field', 'issue', 'corrected_text'],
        properties: {
          field: { type: 'string' },
          issue: { type: 'string' },
          corrected_text: { type: 'string' },
          sources: { type: 'array', items: { type: 'string' } },
        },
      },
    },
    confirmations: {
      type: 'array',
      items: {
        type: 'object',
        required: ['field', 'claim'],
        properties: { field: { type: 'string' }, claim: { type: 'string' }, source: { type: 'string' } },
      },
    },
    summary: { type: 'string' },
  },
}

// Returns { ok, errors } — validates the fields apply-inbox.mjs relies on.
export function validateResult(r, expectedCode) {
  const errors = []
  if (!r || typeof r !== 'object') return { ok: false, errors: ['not an object'] }
  if (typeof r.code !== 'string') errors.push('code missing/not a string')
  else if (expectedCode && r.code !== expectedCode) errors.push(`code "${r.code}" != expected "${expectedCode}"`)
  if (!['verified', 'needs_revision'].includes(r.verdict)) errors.push(`verdict "${r.verdict}" invalid`)
  if (!Array.isArray(r.corrections)) errors.push('corrections not an array')
  else
    r.corrections.forEach((c, i) => {
      if (typeof c?.field !== 'string') errors.push(`corrections[${i}].field missing`)
      if (typeof c?.corrected_text !== 'string') errors.push(`corrections[${i}].corrected_text missing`)
    })
  if (!Array.isArray(r.confirmations)) errors.push('confirmations not an array')
  if (typeof r.summary !== 'string') errors.push('summary missing')
  return { ok: errors.length === 0, errors }
}
