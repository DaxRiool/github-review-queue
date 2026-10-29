(() => {
  // Search qualifiers GitHub understands natively, so pagination and counts stay correct.
  const FILTER_TERMS = ["draft:false", "-review:approved", "-reviewed-by:@me"];
  const DEFAULT_QUERY = "is:pr state:open";

  const tokenize = (query) => (query || "").trim().split(/\s+/).filter(Boolean);
  const sameTerm = (a, b) => a.toLowerCase() === b.toLowerCase();

  function isActive(query) {
    const tokens = tokenize(query);
    return FILTER_TERMS.every((term) => tokens.some((token) => sameTerm(token, term)));
  }

  // Adds the filter terms, or removes them when they are all already in the query.
  function toggleQuery(query) {
    const tokens = tokenize(query ?? DEFAULT_QUERY);
    if (isActive(query)) {
      return tokens.filter((token) => !FILTER_TERMS.some((term) => sameTerm(token, term))).join(" ");
    }
    // Closed PRs can't be reviewed anymore, so only add state:open when no state is chosen yet.
    if (!tokens.some((token) => /^(is|state):(open|closed|merged)$/i.test(token))) tokens.push("state:open");
    if (!tokens.some((token) => /^is:pr$/i.test(token))) tokens.unshift("is:pr");
    for (const term of FILTER_TERMS) {
      if (!tokens.some((token) => sameTerm(token, term))) tokens.push(term);
    }
    return tokens.join(" ");
  }

  // "/owner/repo/pulls" and "/pulls" are pull request lists; "/owner/repo/pull/1" is not.
  function isPullListPath(pathname) {
    return /^\/(?:[^/]+\/[^/]+\/)?pulls\/?$/.test(pathname);
  }

  const api = { FILTER_TERMS, DEFAULT_QUERY, isActive, toggleQuery, isPullListPath };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  globalThis.GitHubReviewQueue = api;
})();
