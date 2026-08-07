(() => {
  let activeStrip;

  function isProcessPage() {
    return location.pathname.replace(/\/+$/, "").endsWith("/process");
  }

  function findStrip() {
    return document.querySelector("main section div.grid:has(> div > article)");
  }

  function mount() {
    if (!isProcessPage()) {
      activeStrip = null;
      return;
    }
    const strip = findStrip();
    if (!strip || strip.dataset.wueHorizontalReady === "true") return;
    strip.dataset.wueHorizontalReady = "true";
    strip.tabIndex = 0;
    strip.setAttribute("aria-label", "设计流程横向浏览");
    strip.addEventListener("wheel", (event) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      const maxScroll = strip.scrollWidth - strip.clientWidth;
      if (maxScroll <= 0) return;
      const next = Math.max(0, Math.min(maxScroll, strip.scrollLeft + event.deltaY));
      if (next === strip.scrollLeft) return;
      event.preventDefault();
      strip.scrollLeft = next;
    }, { passive: false });
    activeStrip = strip;
  }

  new MutationObserver(mount).observe(document.documentElement, { childList: true, subtree: true });
  addEventListener("popstate", mount);
  addEventListener("resize", () => activeStrip?.scrollTo({ left: activeStrip.scrollLeft }));
  mount();
})();
