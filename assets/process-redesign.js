(function () {
  const scriptUrl = new URL(document.currentScript.src);
  const siteRoot = new URL("../", scriptUrl);
  const dataUrl = new URL("archive-gallery-data.json", scriptUrl);
  const featuredIds = [
    "process-001",
    "process-007",
    "process-009",
    "process-017",
    "process-027",
    "process-030",
    "process-033",
    "process-037",
    "process-041",
  ];
  const titles = [
    "初次沟通",
    "设计前期",
    "第一阶段 · 概念设计",
    "第二阶段 · 方案设计",
    "第三阶段 · 施工图绘制",
    "预算规划与软装清单",
    "落地阶段",
    "采买阶段",
    "收尾阶段",
  ];
  let dataPromise;
  let mountTimer;
  let currentPath = "";
  let relocatedAside;
  let asidePlaceholder;

  function isProcessPage() {
    return window.location.pathname.replace(/\/$/, "").endsWith("/process");
  }

  function loadData() {
    if (!dataPromise) {
      dataPromise = fetch(dataUrl).then((response) => {
        if (!response.ok) throw new Error(`Process data failed: ${response.status}`);
        return response.json();
      });
    }
    return dataPromise;
  }

  function assetUrl(item) {
    return new URL(item.asset, siteRoot).href;
  }

  function restoreHoverInteraction(rail) {
    let expansionTimer;
    rail.addEventListener("mouseover", (event) => {
      const row = event.target.closest?.("aside div.border-b");
      if (!row || row.contains(event.relatedTarget)) return;
      window.clearTimeout(expansionTimer);
      expansionTimer = window.setTimeout(() => {
        const button = row.querySelector(":scope > button[aria-expanded]");
        if (button?.getAttribute("aria-expanded") === "false") button.click();
      }, 80);
    });
    rail.addEventListener("mouseout", (event) => {
      const row = event.target.closest?.("aside div.border-b");
      if (row && !row.contains(event.relatedTarget)) window.clearTimeout(expansionTimer);
    });
  }

  function cleanup() {
    if (relocatedAside && asidePlaceholder?.parentNode) {
      asidePlaceholder.parentNode.insertBefore(relocatedAside, asidePlaceholder);
      asidePlaceholder.remove();
    }
    relocatedAside = null;
    asidePlaceholder = null;
    document.getElementById("wue-process-redesign")?.remove();
    document.body.classList.remove("wue-process-redesign-active");
  }

  function makePage(processItems, originalAside) {
    const byId = new Map(processItems.map((item) => [item.id, item]));
    const featured = featuredIds.map((id) => byId.get(id)).filter(Boolean);
    const section = document.createElement("section");
    section.id = "wue-process-redesign";
    section.className = "wue-process-editorial";
    section.innerHTML = `
      <div class="wue-process-editorial-container">
        <div class="wue-process-layout">
          <div class="wue-process-visual">
            <p class="wue-process-visual-kicker">WUE DESIGN / PROCESS ARCHIVE</p>
            <div class="wue-process-collage">
              <div class="wue-process-poster-type" aria-hidden="true"><span>WUE</span><span>PROCESS</span></div>
              <i class="wue-process-poster-band is-upper" aria-hidden="true"></i>
              <i class="wue-process-poster-band is-lower" aria-hidden="true"></i>
            </div>
          </div>
          <div class="wue-process-original-rail"></div>
        </div>
      </div>
    `;
    const collage = section.querySelector(".wue-process-collage");
    featured.forEach((item, index) => {
      const figure = document.createElement("figure");
      figure.className = `wue-process-feature is-${String(index + 1).padStart(2, "0")}`;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "wue-process-feature-image";
      button.setAttribute("aria-label", `浏览${titles[index]}全部资料`);
      button.innerHTML = `<img src="${assetUrl(item)}" alt="${item.caption}" width="${item.width}" height="${item.height}" loading="${index < 3 ? "eager" : "lazy"}" decoding="async">`;
      button.addEventListener("click", () => window.WUEArchive?.open("process", item.group));
      const caption = document.createElement("figcaption");
      caption.innerHTML = `<span>${String(index + 1).padStart(2, "0")}</span><p>${titles[index]}</p><small>VIEW ARCHIVE</small>`;
      figure.append(button, caption);
      collage.appendChild(figure);
    });
    const rail = section.querySelector(".wue-process-original-rail");
    rail.appendChild(originalAside);
    restoreHoverInteraction(rail);
    return section;
  }

  async function mount() {
    const path = window.location.pathname;
    if (!isProcessPage()) {
      if (currentPath !== path) cleanup();
      currentPath = path;
      return;
    }
    currentPath = path;
    if (document.getElementById("wue-process-redesign")) return;
    const originalAside = document.querySelector("#root main aside");
    if (!document.querySelector("#root main section") || !originalAside) return;
    const data = await loadData();
    if (!isProcessPage() || document.getElementById("wue-process-redesign")) return;
    relocatedAside = originalAside;
    asidePlaceholder = document.createComment("wue-process-aside");
    originalAside.parentNode.insertBefore(asidePlaceholder, originalAside);
    document.body.classList.add("wue-process-redesign-active");
    document.getElementById("root").appendChild(makePage(data.process, originalAside));
  }

  function scheduleMount() {
    clearTimeout(mountTimer);
    mountTimer = setTimeout(() => mount().catch(console.error), 40);
  }

  new MutationObserver(scheduleMount).observe(document.getElementById("root"), { childList: true, subtree: true });
  window.addEventListener("popstate", scheduleMount);
  scheduleMount();
})();
