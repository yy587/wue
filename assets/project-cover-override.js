(() => {
  const isProjectsIndex = () => /\/(?:wue\/)?projects\/?$/.test(window.location.pathname);
  const isProjectDetail = () => /\/(?:wue\/)?projects\/[^/]+\/?$/.test(window.location.pathname);
  document.documentElement.classList.toggle("wue-project-detail", isProjectDetail());
  const interiorCover = new URL("22-B61pTDli.webp", document.currentScript.src).href;
  const titles = {
    zh: {
      "": "WUE DESIGN 屋已设计工作室",
      about: "关于 | WUE DESIGN",
      projects: "作品 | WUE DESIGN",
      process: "设计流程 | WUE DESIGN",
      awards: "奖项与媒体 | WUE DESIGN",
      contact: "联系 | WUE DESIGN",
      "projects/blue-residence": "蓝宅 | WUE DESIGN",
      "projects/cube-house": "方块宅 | WUE DESIGN",
      "projects/fuel-gallery": "燃画廊 | WUE DESIGN",
      "projects/horizontal-window-house": "横窗之家 | WUE DESIGN",
      "projects/irises-house": "鸢尾花之家 | WUE DESIGN",
      "projects/ribbon-house": "飘带宅 | WUE DESIGN",
      "projects/self-built-house": "自造宅 | WUE DESIGN",
      "projects/shasha-coffee": "沙沙冷萃园 | WUE DESIGN",
      "projects/short-wall-house": "短墙之家 | WUE DESIGN",
      "projects/studio-office": "屋已设计办公室 | WUE DESIGN"
    },
    en: {
      "": "WUE DESIGN Studio",
      about: "About | WUE DESIGN",
      projects: "Projects | WUE DESIGN",
      process: "Design Process | WUE DESIGN",
      awards: "Awards & Media | WUE DESIGN",
      contact: "Contact | WUE DESIGN",
      "projects/blue-residence": "Blue Residence | WUE DESIGN",
      "projects/cube-house": "Cube House | WUE DESIGN",
      "projects/fuel-gallery": "Fuel Gallery | WUE DESIGN",
      "projects/horizontal-window-house": "Horizontal Window House | WUE DESIGN",
      "projects/irises-house": "Irises House | WUE DESIGN",
      "projects/ribbon-house": "Ribbon House | WUE DESIGN",
      "projects/self-built-house": "Self-built House | WUE DESIGN",
      "projects/shasha-coffee": "Shasha Coffee | WUE DESIGN",
      "projects/short-wall-house": "Short Wall House | WUE DESIGN",
      "projects/studio-office": "WUE Design Office | WUE DESIGN"
    }
  };

  const routeKey = () => window.location.pathname
    .replace(/^\/wue\/?/, "")
    .replace(/^\/+|\/+$/g, "");

  const getLanguage = () => {
    const awardsLink = [...document.querySelectorAll("#site-navigation a")]
      .find((link) => link.getAttribute("href")?.replace(/\/$/, "").endsWith("/awards"));
    return awardsLink?.textContent.trim() === "Awards" ? "en" : "zh";
  };

  const updatePageMetadata = () => {
    const language = getLanguage();
    const nextTitle = titles[language][routeKey()] || titles[language][""];
    if (document.title !== nextTitle) document.title = nextTitle;

    if (language !== "en") return;
    const replacements = [
      ["一层", "First Floor"],
      ["二层", "Second Floor"],
      ["屋已设计工作室", "WUE Design Studio"]
    ];
    document.querySelectorAll("main span, main p, main small, main div").forEach((element) => {
      if (element.childElementCount > 0) return;
      const source = element.textContent;
      const replacement = replacements.reduce(
        (value, [from, to]) => value.replaceAll(from, to),
        source
      );
      if (source !== replacement) element.textContent = replacement;
    });
  };

  const updateShashaCover = () => {
    if (!isProjectsIndex()) return;

    document
      .querySelectorAll('a[href$="/projects/shasha-coffee"] > div:first-child img')
      .forEach((image) => {
        if (image.src !== interiorCover) image.src = interiorCover;
      });
  };

  const updatePage = () => {
    updateShashaCover();
    updatePageMetadata();
  };

  updatePage();
  new MutationObserver(updatePage).observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest?.("button")?.textContent.includes("中文 | EN")) return;
    setTimeout(updatePage, 80);
    setTimeout(updatePage, 320);
  }, true);
  addEventListener("popstate", updatePage);
})();
