// Web search — a tool the research/skeptic bots call to ground claims in
// sources. Provider-agnostic: set WEBSEARCH_PROVIDER + its key. Supported:
//   tavily   (TAVILY_API_KEY)         — US, research-oriented
//   brave    (BRAVE_API_KEY)          — US, independent index
//   searxng  (SEARXNG_URL)            — self-hosted meta-search, no third party
// With no provider configured it returns [] and a `configured:false` flag so
// the workflow still runs (the bot then works from parametric knowledge and
// says so) — structure stays testable without a key. Returns
// [{ title, url, snippet }].
const PROVIDER = process.env.WEBSEARCH_PROVIDER

export async function webSearch(query, { maxResults = 6 } = {}) {
  if (!PROVIDER) return { configured: false, provider: null, query, results: [] }
  try {
    const results = await PROVIDERS[PROVIDER]?.(query, maxResults)
    if (!results) throw new Error(`unknown WEBSEARCH_PROVIDER "${PROVIDER}"`)
    return { configured: true, provider: PROVIDER, query, results: results.slice(0, maxResults) }
  } catch (err) {
    return { configured: true, provider: PROVIDER, query, results: [], error: err.message }
  }
}

const PROVIDERS = {
  async tavily(query, n) {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: process.env.TAVILY_API_KEY, query, max_results: n }),
    })
    if (!res.ok) throw new Error(`tavily HTTP ${res.status}`)
    const d = await res.json()
    return (d.results || []).map((r) => ({ title: r.title, url: r.url, snippet: r.content }))
  },
  async brave(query, n) {
    const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${n}`
    const res = await fetch(url, { headers: { 'X-Subscription-Token': process.env.BRAVE_API_KEY, Accept: 'application/json' } })
    if (!res.ok) throw new Error(`brave HTTP ${res.status}`)
    const d = await res.json()
    return (d.web?.results || []).map((r) => ({ title: r.title, url: r.url, snippet: r.description }))
  },
  async searxng(query, n) {
    const base = process.env.SEARXNG_URL?.replace(/\/$/, '')
    const res = await fetch(`${base}/search?q=${encodeURIComponent(query)}&format=json`)
    if (!res.ok) throw new Error(`searxng HTTP ${res.status}`)
    const d = await res.json()
    return (d.results || []).slice(0, n).map((r) => ({ title: r.title, url: r.url, snippet: r.content }))
  },
}

// A compact tool schema the router can hand to a model that supports tool use.
export const WEB_SEARCH_TOOL = {
  type: 'function',
  function: {
    name: 'web_search',
    description: 'Search the web for sources to verify or refute a factual claim. Returns titles, URLs, and snippets.',
    parameters: {
      type: 'object',
      required: ['query'],
      properties: { query: { type: 'string', description: 'A focused search query targeting one claim.' } },
    },
  },
}
