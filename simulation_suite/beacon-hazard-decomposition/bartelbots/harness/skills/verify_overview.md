# Skill: verify a hazard overview (researcher + skeptic)

Portable, model-agnostic instructions for the two-pass overview verification the
Claude fleet ran on 2026-07-19. Any approved model can execute these roles; the
skill lives in the Bartlebrain, not in a model, so the work survives a model
swap. The workflow (`workflows/verify_overview.mjs`) injects the corner's field
data and the web-search results, then asks the model to fill the RESULT schema.

## Roles

**Researcher** — establish what is true.
Given the 42-field overview draft for one subhazard, find the falsifiable
claims and check them against sources. Spend your searches on the
fabrication-prone fields first:
- `key_papers` — do the papers exist? correct authors, venue, year? (drafts
  invent citations)
- `researchers` — real people, working on *this* topic, correct affiliation?
- `major_events` — event names, dates, magnitudes/sizes, death tolls
- `media` — do the named documentaries / books exist?
- `traditional_models`, `monitoring`, `current_alerting`, `coverage_sources`,
  `baseline_attribution`, `insurance_claims`, `hazard_tech` — named systems,
  agencies, statistics real and correctly described?
Also sanity-check the safety-critical fields (`evacuate_or_shelter`,
`warning_time`, `common_traps`, `immediate_risk`, `car_destruction`) for wrong
or dangerous guidance — err toward the conservative published threshold.

For each field that is wrong, fabricated, or rests on an unverifiable
load-bearing claim, write a correction whose `corrected_text` is the FULL
replacement for that field, in the same concise prose style, no inline
citations. If a whole field is fine, do not include it.

**Skeptic** — a different model from the researcher. Assume the researcher is
overconfident. Two jobs:
1. Audit each proposed correction against the sources: is the replacement text
   itself accurate? Fix or drop any that overcorrect or introduce new errors.
2. Attack the survivors: pick the riskiest claims the researcher did NOT flag
   (fabrication-prone fields first) and try to refute them. An LLM always lists
   something plausible — volume is not evidence. Anything you refute becomes a
   new correction.
Deliver the final merged result: the definitive corrections list, the strongest
confirmations with sources, and a verdict.

## Verdict rule

`verified` only if, after the corrections are applied, you would stake the
registry's credibility on the document. Otherwise `needs_revision`.

## Output — RESULT schema (return JSON only)

```
{
  "code": "<SUBHAZARD CODE>",
  "verdict": "verified" | "needs_revision",
  "corrections": [
    { "field": "<field id>", "issue": "<what was wrong>",
      "corrected_text": "<full replacement text>", "sources": ["<url>", ...] }
  ],
  "confirmations": [
    { "field": "<field id>", "claim": "<what you positively confirmed>", "source": "<url>" }
  ],
  "summary": "<2-3 sentences: quality + what changed>"
}
```

This is the same schema the Claude-run fleet produced, so results from either
side drop into `verification-inbox/<CODE>.json` and are applied by the app's
`scripts/apply-inbox.mjs` unchanged.
