(function () {
  const scriptUrl = new URL(document.currentScript.src);
  const siteRoot = new URL("../", scriptUrl);
  const dataUrl = new URL("archive-gallery-data.json", scriptUrl);
  const processGroups = [
    "01 初次沟通",
    "02 设计前期",
    "03 第一阶段 · 概念设计",
    "04 第二阶段 · 方案设计",
    "05 第三阶段 · 施工图",
    "06 预算规划与软装清单",
    "07 落地阶段",
    "08 采买阶段",
    "09 收尾阶段",
  ];

  let archiveData;
  let archiveModal;
  let preview;
  let visibleItems = [];
  let selectedIndex = -1;
  let previousOverflow = "";
  let mountQueued = false;

  function currentKind() {
    const pathname = window.location.pathname.replace(/\/$/, "");
    if (pathname.endsWith("/process")) return "process";
    if (pathname.endsWith("/awards")) return "awards";
    return null;
  }

  async function loadArchive() {
    if (!archiveData) {
      const response = await fetch(dataUrl);
      if (!response.ok) throw new Error(`Archive data failed: ${response.status}`);
      archiveData = await response.json();
    }
    return archiveData;
  }

  function assetUrl(item) {
    return new URL(item.asset, siteRoot).href;
  }

  function closePreview() {
    if (!preview) return;
    preview.remove();
    preview = null;
    selectedIndex = -1;
  }

  function closeArchive() {
    closePreview();
    if (!archiveModal) return;
    archiveModal.remove();
    archiveModal = null;
    document.body.style.overflow = previousOverflow;
  }

  function movePreview(step) {
    if (!preview || !visibleItems.length) return;
    openPreview((selectedIndex + step + visibleItems.length) % visibleItems.length);
  }

  function openPreview(index) {
    closePreview();
    selectedIndex = index;
    const item = visibleItems[index];
    preview = document.createElement("div");
    preview.className = "wue-archive-preview";
    preview.setAttribute("role", "dialog");
    preview.setAttribute("aria-modal", "true");
    preview.setAttribute("aria-label", item.caption);
    preview.innerHTML = `
      <button class="wue-archive-preview-close" type="button" aria-label="关闭预览">×</button>
      <button class="wue-archive-preview-nav is-prev" type="button" aria-label="上一张">←</button>
      <figure>
        <img src="${assetUrl(item)}" alt="${escapeHtml(item.caption)}" width="${item.width}" height="${item.height}">
        <figcaption><span>${escapeHtml(item.group)}</span>${escapeHtml(item.caption)}</figcaption>
      </figure>
      <button class="wue-archive-preview-nav is-next" type="button" aria-label="下一张">→</button>
    `;
    preview.addEventListener("click", (event) => {
      if (event.target === preview) closePreview();
    });
    preview.querySelector(".wue-archive-preview-close").addEventListener("click", closePreview);
    preview.querySelector(".is-prev").addEventListener("click", () => movePreview(-1));
    preview.querySelector(".is-next").addEventListener("click", () => movePreview(1));
    archiveModal.appendChild(preview);
    preview.querySelector(".wue-archive-preview-close").focus();
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function renderItems(items, grid, count) {
    visibleItems = items;
    count.textContent = `${items.length} 项资料`;
    grid.innerHTML = "";
    const fragment = document.createDocumentFragment();
    items.forEach((item, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "wue-archive-item";
      button.innerHTML = `
        <span class="wue-archive-thumb">
          <img src="${assetUrl(item)}" alt="${escapeHtml(item.caption)}" loading="lazy" decoding="async" width="${item.width}" height="${item.height}">
        </span>
        <span class="wue-archive-item-meta"><small>${escapeHtml(item.group)}</small>${escapeHtml(item.caption)}</span>
      `;
      button.addEventListener("click", () => openPreview(index));
      fragment.appendChild(button);
    });
    grid.appendChild(fragment);
  }

  async function openArchive(kind, initialGroup = "全部") {
    closeArchive();
    const data = await loadArchive();
    const allItems = data[kind];
    const groups = [...new Set(allItems.map((item) => item.group))];
    const title = kind === "process" ? "设计流程资料档案" : "奖项与媒体资料档案";

    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    archiveModal = document.createElement("div");
    archiveModal.className = "wue-archive-modal";
    archiveModal.setAttribute("role", "dialog");
    archiveModal.setAttribute("aria-modal", "true");
    archiveModal.setAttribute("aria-label", title);
    archiveModal.innerHTML = `
      <div class="wue-archive-shell">
        <header class="wue-archive-header">
          <div><p>WUE DESIGN / ARCHIVE</p><h2>${title}</h2></div>
          <div class="wue-archive-header-actions"><span class="wue-archive-count"></span><button type="button" aria-label="关闭资料档案">×</button></div>
        </header>
        <nav class="wue-archive-filters" aria-label="资料分类"></nav>
        <div class="wue-archive-grid"></div>
      </div>
    `;
    document.body.appendChild(archiveModal);

    const filters = archiveModal.querySelector(".wue-archive-filters");
    const grid = archiveModal.querySelector(".wue-archive-grid");
    const count = archiveModal.querySelector(".wue-archive-count");
    const filterNames = ["全部", ...groups];

    function selectGroup(group) {
      filters.querySelectorAll("button").forEach((button) => {
        const selected = button.dataset.group === group;
        button.classList.toggle("is-active", selected);
        button.setAttribute("aria-pressed", String(selected));
      });
      renderItems(group === "全部" ? allItems : allItems.filter((item) => item.group === group), grid, count);
      archiveModal.querySelector(".wue-archive-shell").scrollTop = 0;
    }

    filterNames.forEach((group) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.group = group;
      button.textContent = group;
      button.addEventListener("click", () => selectGroup(group));
      filters.appendChild(button);
    });

    archiveModal.querySelector(".wue-archive-header-actions button").addEventListener("click", closeArchive);
    archiveModal.addEventListener("click", (event) => {
      if (event.target === archiveModal) closeArchive();
    });
    selectGroup(groups.includes(initialGroup) ? initialGroup : "全部");
    archiveModal.querySelector(".wue-archive-header-actions button").focus();
  }

  function mountTrigger() {
    mountQueued = false;
    const kind = currentKind();
    document.body.classList.toggle("wue-process-page", kind === "process");
    if (!kind) return;
    const aside = document.querySelector("main aside");
    if (!aside || aside.querySelector(".wue-archive-trigger")) return;
    const content = aside.querySelector("div.grid") || aside;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "wue-archive-trigger";
    button.innerHTML = `<span>${kind === "process" ? "浏览全部流程资料" : "浏览全部获奖与媒体资料"}</span><small>${kind === "process" ? "44" : "46"} ITEMS&nbsp; →</small>`;
    button.addEventListener("click", () => openArchive(kind));
    content.appendChild(button);

    if (kind === "process") {
      document.querySelectorAll("main article").forEach((article, index) => {
        if (!processGroups[index] || article.dataset.wueArchiveReady) return;
        article.dataset.wueArchiveReady = "true";
        article.tabIndex = 0;
        article.setAttribute("role", "button");
        article.setAttribute("aria-label", `浏览${processGroups[index]}全部资料`);
        article.addEventListener("click", () => openArchive("process", processGroups[index]));
        article.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openArchive("process", processGroups[index]);
          }
        });
      });
    }
  }

  function queueMount() {
    if (mountQueued) return;
    mountQueued = true;
    requestAnimationFrame(mountTrigger);
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (preview) closePreview();
      else closeArchive();
    } else if (preview && event.key === "ArrowLeft") movePreview(-1);
    else if (preview && event.key === "ArrowRight") movePreview(1);
  });

  new MutationObserver(queueMount).observe(document.getElementById("root"), {
    childList: true,
    subtree: true,
  });
  window.addEventListener("popstate", () => {
    closeArchive();
    queueMount();
  });
  window.WUEArchive = { open: openArchive, close: closeArchive };
  queueMount();
})();
