(() => {
  const core = globalThis.GitHubReviewQueue;

  // GitHub's class names are hashed, so the state tabs are found by what they link to.
  const STATE_TAB_SELECTOR = 'a[href*="state%3Aclosed"], a[href*="is%3Aclosed"]';
  const TOGGLE_CLASS = "grq-toggle";
  const LABEL = "To review";
  const TITLE = "Open, non-draft pull requests you haven't reviewed and that aren't approved";

  const currentQuery = () => new URL(location.href).searchParams.get("q");

  function targetUrl() {
    const url = new URL(location.href);
    url.searchParams.set("q", core.toggleQuery(currentQuery()));
    url.searchParams.delete("page");
    return url.toString();
  }

  function buildToggle(template) {
    const link = document.createElement("a");
    link.className = template ? `${template.className.replace(/\bselected\S*/g, "")} ${TOGGLE_CLASS}` : `${TOGGLE_CLASS} grq-floating`;
    link.title = TITLE;
    link.textContent = LABEL;
    // A full load instead of GitHub's client-side router, which keeps its own copy of the query.
    link.addEventListener("click", (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
      event.preventDefault();
      event.stopPropagation();
      location.assign(link.href);
    });
    return link;
  }

  function update() {
    const existing = document.querySelector(`.${TOGGLE_CLASS}`);
    if (!core.isPullListPath(location.pathname)) {
      existing?.remove();
      return;
    }
    const closedTab = document.querySelector(STATE_TAB_SELECTOR);
    let toggle = existing;
    // Re-anchor when GitHub re-renders the tabs or they show up after the floating fallback.
    if (toggle && closedTab && toggle.previousElementSibling !== closedTab) {
      toggle.remove();
      toggle = null;
    }
    if (!toggle) {
      toggle = buildToggle(closedTab);
      if (closedTab) closedTab.after(toggle);
      else document.body.appendChild(toggle);
    }
    const active = core.isActive(currentQuery());
    const href = targetUrl();
    if (toggle.getAttribute("href") !== href) toggle.setAttribute("href", href);
    toggle.toggleAttribute("data-grq-active", active);
    if (active) toggle.setAttribute("aria-current", "true");
    else toggle.removeAttribute("aria-current");
  }

  let scheduled = false;
  function scheduleUpdate() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      update();
    });
  }

  new MutationObserver(scheduleUpdate).observe(document.body, { childList: true, subtree: true });
  document.addEventListener("turbo:render", scheduleUpdate);
  window.addEventListener("popstate", scheduleUpdate);
  update();
})();
