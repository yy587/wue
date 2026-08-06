(function () {
  const scriptUrl = new URL(document.currentScript.src);
  const siteRoot = new URL("../", scriptUrl);
  const dataUrl = new URL("archive-gallery-data.json", scriptUrl);
  let dataPromise;
  let currentPath = "";
  let mountTimer;
  let slideTimer;

  function isAwardsPage() {
    return window.location.pathname.replace(/\/$/, "").endsWith("/awards");
  }

  function loadData() {
    if (!dataPromise) {
      dataPromise = fetch(dataUrl).then((response) => {
        if (!response.ok) throw new Error(`Awards data failed: ${response.status}`);
        return response.json();
      });
    }
    return dataPromise;
  }

  function assetUrl(item) {
    return new URL(item.asset, siteRoot).href;
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function cleanup() {
    clearInterval(slideTimer);
    slideTimer = null;
    document.getElementById("wue-awards-redesign")?.remove();
    document.body.classList.remove("wue-awards-redesign-active");
  }

  function makePage(items) {
    const section = document.createElement("section");
    section.id = "wue-awards-redesign";
    section.className = "wue-awards-page";
    section.innerHTML = `
      <div class="wue-awards-container">
        <header class="wue-awards-intro">
          <div>
            <p>WUE DESIGN / RECOGNITION</p>
            <h1>奖项与媒体</h1>
          </div>
          <div class="wue-awards-intro-copy">
            <nav class="wue-awards-tabs" aria-label="奖项资料分类">
              <button type="button" class="is-active" data-kind="全部">全部</button><span>/</span>
              <button type="button" data-kind="奖项">主要获奖</button><span>/</span>
              <button type="button" data-kind="刊登">媒体刊登</button>
            </nav>
          </div>
        </header>
        <div class="wue-awards-archive">
          <aside class="wue-awards-preview">
            <button type="button" class="wue-awards-preview-image" aria-label="浏览当前分类全部图像">
              <img alt="" decoding="async">
            </button>
            <div class="wue-awards-preview-meta"><span></span><p></p><button type="button" class="wue-awards-open-archive" aria-label="浏览全部图像档案"><small>46 ITEMS&nbsp; →</small></button></div>
          </aside>
          <div class="wue-awards-list" aria-live="polite"></div>
        </div>
      </div>
    `;

    const list = section.querySelector(".wue-awards-list");
    const previewImage = section.querySelector(".wue-awards-preview-image img");
    const previewButton = section.querySelector(".wue-awards-preview-image");
    const previewGroup = section.querySelector(".wue-awards-preview-meta span");
    const previewCaption = section.querySelector(".wue-awards-preview-meta p");
    const previewItems = items;
    let activeGroup = items[0]?.group || "全部";
    let previewToken = 0;
    let slideIndex = 0;

    function alignArchiveButton() {
      const frameBox = previewButton.getBoundingClientRect();
      const imageBox = previewImage.getBoundingClientRect();
      if (!imageBox.width || !frameBox.width) return;
      section.style.setProperty("--wue-preview-image-right", `${imageBox.right - frameBox.left}px`);
    }

    function setPreview(item) {
      if (!item) return;
      const token = ++previewToken;
      const loader = new Image();
      previewImage.classList.add("is-changing");
      loader.onload = () => {
        if (token !== previewToken) return;
        previewImage.src = loader.src;
        previewImage.alt = item.caption;
        previewImage.width = item.width;
        previewImage.height = item.height;
        previewGroup.textContent = `${item.group} / ${item.kind}`;
        previewCaption.textContent = item.caption;
        activeGroup = item.group;
        requestAnimationFrame(() => {
          previewImage.classList.remove("is-changing");
          alignArchiveButton();
        });
      };
      loader.src = assetUrl(item);
    }

    function render(kind) {
      const filtered = kind === "全部" ? items : items.filter((item) => item.kind === kind);
      const groups = [...new Set(filtered.map((item) => item.group))];
      list.innerHTML = "";
      const columns = [document.createElement("div"), document.createElement("div")];
      columns.forEach((column) => {
        column.className = "wue-awards-list-column";
        list.appendChild(column);
      });
      const splitIndex = Math.ceil(groups.length / 2);
      let sequence = 0;
      groups.forEach((group, groupIndex) => {
        const groupItems = filtered.filter((item) => item.group === group);
        const article = document.createElement("article");
        article.className = "wue-awards-year";
        article.innerHTML = `<header><h2>${escapeHtml(group)}</h2><span>${String(groupItems.length).padStart(2, "0")}</span></header><div></div>`;
        const rows = article.querySelector("div");
        groupItems.forEach((item) => {
          sequence += 1;
          const row = document.createElement("div");
          row.className = "wue-awards-row";
          row.title = item.caption;
          row.innerHTML = `<span>${String(sequence).padStart(2, "0")}</span><p>${escapeHtml(item.caption)}</p><small>${escapeHtml(item.kind)}</small>`;
          rows.appendChild(row);
        });
        columns[groupIndex < splitIndex ? 0 : 1].appendChild(article);
      });
    }

    section.querySelectorAll(".wue-awards-tabs button").forEach((button) => {
      button.addEventListener("click", () => {
        section.querySelectorAll(".wue-awards-tabs button").forEach((tab) => tab.classList.toggle("is-active", tab === button));
        render(button.dataset.kind);
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });

    function openArchive() {
      window.WUEArchive?.open("awards");
    }
    previewButton.addEventListener("click", openArchive);
    section.querySelector(".wue-awards-open-archive").addEventListener("click", () => window.WUEArchive?.open("awards"));
    addEventListener("resize", alignArchiveButton);
    render("全部");
    setPreview(previewItems[0]);
    clearInterval(slideTimer);
    slideTimer = setInterval(() => {
      slideIndex = (slideIndex + 1) % previewItems.length;
      setPreview(previewItems[slideIndex]);
    }, 3600);
    return section;
  }

  async function mount() {
    const path = window.location.pathname;
    if (!isAwardsPage()) {
      if (currentPath !== path) cleanup();
      currentPath = path;
      return;
    }
    currentPath = path;
    if (document.getElementById("wue-awards-redesign")) return;
    const originalSection = document.querySelector("#root main section");
    if (!originalSection) return;
    const data = await loadData();
    if (!isAwardsPage() || document.getElementById("wue-awards-redesign")) return;
    document.body.classList.add("wue-awards-redesign-active");
    document.body.appendChild(makePage(data.awards));
  }

  function scheduleMount() {
    clearTimeout(mountTimer);
    mountTimer = setTimeout(() => mount().catch(console.error), 40);
  }

  new MutationObserver(scheduleMount).observe(document.getElementById("root"), { childList: true, subtree: true });
  window.addEventListener("popstate", scheduleMount);
  scheduleMount();
})();
