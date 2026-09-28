// No environment reads here: the protected server route supplies the key.
export async function checkTavily(key: string | undefined, fetcher: typeof fetch = fetch) {
  if (!key?.trim()) return { ok: false, message: "TAVILY_API_KEY is missing from this deployment. Set it for the correct Vercel environment and redeploy." };
  try {
    const response = await fetcher("https://api.tavily.com/search", {
      method: "POST", redirect: "error", signal: AbortSignal.timeout(15000),
      headers: { Authorization: `Bearer ${key.trim()}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query: "Tavily Search API documentation", topic: "general", search_depth: "basic", max_results: 1, include_domains: ["docs.tavily.com"], auto_parameters: false, include_answer: false, include_raw_content: false, include_images: false }),
    });
    if (!response.ok) {
      await response.body?.cancel();
      const message = response.status === 401 || response.status === 403 ? "Tavily rejected authentication. Check the server-side key and account access."
        : [429, 432, 433].includes(response.status) ? "Tavily reported a rate or usage limit. Check the Tavily account before retrying."
        : "Tavily could not complete the check. Try again later.";
      return { ok: false, message };
    }
    const body: unknown = await response.json();
    if (!body || typeof body !== "object" || !("results" in body) || !Array.isArray(body.results) || body.results.length > 1) return { ok: false, message: "Tavily returned an unexpected response." };
    return { ok: true, message: body.results.length ? "Tavily connection verified: the fixed public search returned a result." : "Tavily accepted the search but returned no results. Authentication succeeded; search relevance is not verified.", resultCount: body.results.length };
  } catch { return { ok: false, message: "Tavily check timed out or the connection failed. No sensitive details were logged." }; }
}
