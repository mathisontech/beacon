#!/usr/bin/env node
// Sum the cost ledger — the number that decides rent vs. buy.
//   node cost_report.mjs
// Reads costs.jsonl (written by the router), totals by model and overall, and
// projects the remaining 144 draft subhazards from the average cost per run.
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
let lines
try {
  lines = readFileSync(join(HERE, 'costs.jsonl'), 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l))
} catch {
  console.log('no costs.jsonl yet — run a verification first')
  process.exit(0)
}

const byModel = {}
let usd = 0, inTok = 0, outTok = 0, calls = 0
for (const r of lines) {
  const m = (byModel[r.model] ||= { calls: 0, usd: 0, in: 0, out: 0 })
  m.calls++; m.usd += r.usd; m.in += r.in; m.out += r.out
  usd += r.usd; inTok += r.in; outTok += r.out; calls++
}

console.log(`calls: ${calls}  tokens: ${(inTok + outTok).toLocaleString()} (${inTok.toLocaleString()} in / ${outTok.toLocaleString()} out)`)
for (const [model, m] of Object.entries(byModel).sort((a, b) => b[1].usd - a[1].usd))
  console.log(`  ${model.padEnd(16)} ${m.calls} calls  $${m.usd.toFixed(4)}`)
console.log(`TOTAL SPENT: $${usd.toFixed(4)}`)

// A verification run = 2 calls (researcher + skeptic). Project the backlog.
const runs = calls / 2
if (runs >= 1) {
  const perRun = usd / runs
  console.log(`\nper subhazard (2 calls): $${perRun.toFixed(4)}`)
  console.log(`144 draft subhazards left -> ~$${(perRun * 144).toFixed(2)} to finish the registry at this rate`)
}
