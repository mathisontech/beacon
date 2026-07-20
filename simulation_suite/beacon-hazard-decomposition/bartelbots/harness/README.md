# Bartelbots harness — model-agnostic runtime

The runtime that makes the harness *run on models of our own*. The taxonomy,
cognitive architecture, and the consideration engine's gates already existed;
what was missing was the layer that actually calls a model. This is it — and it
calls open, US/EU-provenance models (gpt-oss-20b local by default), not Claude.

It is the open-source twin of the Claude verification fleet: same skill, same
result schema, same inbox, same apply step. Run a corner through Claude or
through gpt-oss and the output is interchangeable.

## Why this shape

Three of Kristin's principles, made concrete:

- **Router, not vendor.** Every model call goes through `router.mjs`, which
  resolves a *task class* (`verify.researcher`) to a registered model and speaks
  the OpenAI-compatible chat API. The backend — Ollama on the spare machine,
  vLLM, or a hosted gateway — is swappable without touching workflow code.
- **No Chinese-origin models, ever — enforced structurally.** `provenance.mjs`
  is the runtime gate: a model must be on the approved-family allowlist AND
  registered in `models.json` to be callable; any blocklisted family hard-throws.
  Two layers, so an accidental registry edit still can't slip a blocked model
  through. (`consider.mjs` carries the same policy as a static plan-gate.)
- **Context that survives a model swap (Bartlebrain).** Nothing here holds state
  in a model. The corner's field data is read from files; the skill is a
  markdown doc; results are written as files; activity is logged as SPO lines.
  Change the model and the context, skills, and history are all still there.

## Anatomy

```
provenance.mjs        the hard gate: approved-family allowlist + Chinese blocklist
models.json           the registry — the ONLY callable models, with tiers + endpoints
router.mjs            resolveModel(taskClass) + chat({messages, schema}) over OpenAI API
schema.mjs            the RESULT interchange schema + a zero-dep validator
tools/web_search.mjs  a grounding tool (Tavily / Brave / SearXNG; degrades gracefully)
skills/verify_overview.md   portable researcher+skeptic instructions (model-agnostic)
workflows/verify_overview.mjs   researcher -> skeptic -> merge -> inbox, per corner
```

A **task class** maps to a **model tier** in `models.json`. The skeptic
deliberately runs a *different lineage* from the researcher (gpt-oss researcher,
Mistral skeptic) so the adversarial pass has genuine diversity, not an echo.

## Run it

```bash
# 1. Serve an approved local model (spare machine):
ollama serve && ollama pull gpt-oss:20b     # OpenAI-compatible at :11434/v1

# 2. (optional) grounding search + a different-lineage skeptic:
export WEBSEARCH_PROVIDER=tavily TAVILY_API_KEY=...
export MISTRAL_API_KEY=...                   # skeptic = mistral-small

# 3. Verify a corner — writes verification-inbox/<CODE>.json:
node workflows/verify_overview.mjs FR2
node workflows/verify_overview.mjs FR2 --researcher gpt-oss-20b --skeptic mistral-small

# 4. Apply — the SAME step the Claude fleet used:
cd /Users/kristinmullaney/miniconda3/envs/mathison/mathison-app
node scripts/apply-inbox.mjs && node scripts/validate-overviews.mjs
```

`--tools` lets the model drive `web_search` itself (needs a tool-calling model,
e.g. `--researcher local-tools`); the default runs searches deterministically
and hands results in (works on any model). `--mock` runs the whole pipeline
(Bartlebrain read → schema validate → inbox write → SPO log) with no model or
network, for structure testing.

## Rent and measure cost (current plan, 2026-07-20)

No local hardware yet (the spare machine is 8GB — too small). The data at this
stage is public hazard science, not customer data, so there's no privacy reason
to run local: rent hosted open-model compute, measure the real cost, then decide
hardware. Everything runs hosted, US/EU-provenance only:

```bash
export HOSTED_BASE_URL=https://api.together.xyz/v1   # or Groq / Fireworks
export HOSTED_API_KEY=...                             # your rented endpoint
export MISTRAL_API_KEY=...                            # skeptic (different lineage)
export WEBSEARCH_PROVIDER=tavily TAVILY_API_KEY=...   # grounding

# researcher + skeptic both hosted:
node workflows/verify_overview.mjs FR2 --researcher gpt-oss-120b --skeptic mistral-small

# after a few, see what it actually costs:
node cost_report.mjs      # totals by model + projects the 144-subhazard backlog
```

The router reads `price_in`/`price_out` from `models.json` (editable estimates —
set them to your provider's real rates), computes USD per call from the API
`usage` counts, ledgers every call to `costs.jsonl`, and each run prints its
cost. `cost_report.mjs` sums the ledger and extrapolates the backlog — the
number that decides rent vs. buy. (Sensitive customer data is the later trigger
to re-judge local hardware with real cost numbers in hand.)

## Model choice & fine-tuning (decided 2026-07-20)

**Pick a tool-trained model now; do NOT fine-tune yet.**

- *Reliability comes from constrained decoding + a tool-trained model, not from
  weights.* The router constrains the final answer with `response_format`
  json_schema (a script constraining the model — scripts-first), and the agentic
  loop feeds real tool results back. That makes tool calls valid on any decent
  model today, no training.
- *Local pick:* **granite-3.3-8b** (IBM, post-trained for function calling + RAG,
  Apache 2.0, spare-machine-sized) is the `local-tools` alias; **gpt-oss-20b**
  and **llama3.1-8b** are the alternates. Skeptic stays a different lineage
  (**mistral-small**) for real adversarial diversity.
- *Why not fine-tune now:* you have no trace corpus yet — the harness only just
  began producing tool-call traces. Fine-tuning to call *our* tools needs *our*
  calls as data. So we log them (`BARTLE_TRACE=1` → `traces/toolcalls.jsonl`) and
  fine-tune later: **Tinker LoRA on llama3.1-8b**, gated by a Bartle-eval +
  canaries, and only once a measured gap survives prompting + constrained
  decoding. NVIDIA Nemotron is a strong *out-of-the-box* hosted option, not a
  fine-tune base; Thinking Machines' Inkling stays hosted boss-tier, Tinker is
  the LoRA workflow for the base above.

Config (all optional, sensible defaults):
`LOCAL_BASE_URL` (default Ollama `:11434/v1`), `MISTRAL_API_KEY`,
`HOSTED_BASE_URL`/`HOSTED_API_KEY`, `WEBSEARCH_PROVIDER` (+ its key),
`BARTLE_APP` / `BARTLE_BRAIN` / `BARTLE_INBOX` to point at the app on another
machine.

## Verified working (2026-07-20)

- Provenance gate: `qwen`, `kimi`, `glm`, `deepseek` refused at both layers;
  `gpt-oss-20b`, `mistral-small` resolve to the right tier.
- Full `--mock` run on FR2: read Bartlebrain → researcher → skeptic → schema
  validate → wrote schema-valid `inbox/FR2.json` → SPO-logged both passes.

## Where this fits the phase plan

This is the first slice of the **router** (STATUS.md decision "Router not
vendor") and the runtime home for the **appraiser** corner-role's two-LLM loop.
Next bricks reuse all four primitives (router, tool, skill, workflow):
event-census gathering, technique appraisal (the existing `prompts/` loop wired
to the router), and the natal-mode wiki seeding — each a new `workflows/*.mjs`
plus a `skills/*.md`, no new plumbing.
