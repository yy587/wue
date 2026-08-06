(function () {
  const scriptUrl = new URL(document.currentScript.src);
  const siteRoot = new URL("../", scriptUrl);
  const dataUrl = new URL("archive-gallery-data.json", scriptUrl);
  let dataPromise;
  let currentPath = "";
  let mountTimer;
  let slideTimer;

  const copy = {
    zh: {
      title: "奖项与媒体",
      tabsLabel: "奖项资料分类",
      all: "全部",
      awards: "主要获奖",
      media: "媒体刊登",
      award: "奖项",
      publication: "刊登",
      mediaGroup: "媒体报道",
      archiveLabel: "浏览全部图像档案"
    },
    en: {
      title: "Awards & Media",
      tabsLabel: "Recognition archive categories",
      all: "All",
      awards: "Awards",
      media: "Publications",
      award: "Award",
      publication: "Publication",
      mediaGroup: "Media Coverage",
      archiveLabel: "Browse the complete image archive"
    }
  };

  function getLanguage() {
    const awardsLink = [...document.querySelectorAll("#site-navigation a")]
      .find((link) => link.getAttribute("href")?.replace(/\/$/, "").endsWith("/awards"));
    return awardsLink?.textContent.trim() === "Awards" ? "en" : "zh";
  }

  function englishCaption(value) {
    return String(value)
      .replaceAll("ELLEDECO 家居廊", "ELLE DECORATION")
      .replaceAll("IDEAT理想家", "IDEAT")
      .replaceAll("安邸 AD100Young", "Architectural Digest AD100 Young")
      .replaceAll("gooood谷德设计网", "gooood")
      .replaceAll("家居廊", "ELLE DECORATION")
      .replaceAll("中国室内建筑设计大奖", "China Interior Architecture Design Annual Award")
      .replaceAll("中国室内建筑设计年鉴", "China Interior Architecture Design Annual")
      .replaceAll("沙沙冷萃园", "Shasha Coffee")
      .replaceAll("横窗之家", "The Horizontal Window House")
      .replaceAll("鸢尾花之家", "Irises House")
      .replaceAll("自造宅", "Self-built House")
      .replaceAll("屋己设计", "WUE Design")
      .replaceAll("非传统性的流动空间", "A Non-traditional Flowing Space")
      .replaceAll("开放而具流动性的工作室兼住宅", "An Open and Fluid Live-work Studio")
      .replaceAll("工作与生活空间", "Work and Living Space")
      .replaceAll("帘幕与收纳空间", "Curtains and Storage")
      .replaceAll("起居空间", "Living Space")
      .replaceAll("项目介绍", "Project Feature")
      .replaceAll("项目收录", "Project Feature")
      .replaceAll("由“窗”至“居”", "From Window to Home")
      .replaceAll("二十周年刊", "20th Anniversary Issue")
      .replaceAll("年度小户型空间设计奖", "Small Residence of the Year")
      .replaceAll("私宅设计大奖", "Private Residence Design Award")
      .replaceAll("非凡设计大奖", "Design for the Extraordinary Award")
      .replaceAll("新势力榜", "New Talent List")
      .replaceAll("10W+阅读量报道", "100K+ Read Feature")
      .replaceAll("奖状及奖杯", "Certificate and Trophy")
      .replaceAll("颁奖现场", "Award Ceremony")
      .replaceAll("奖状", "Certificate")
      .replaceAll("内页", "Inside Page ")
      .replaceAll("海报", "Poster")
      .replaceAll("网站", "Website")
      .replaceAll("时尚家居", "Trends Home")
      .replaceAll("理想家", "IDEAT")
      .replaceAll("安邸", "AD")
      .replaceAll("一条", "Yitiao")
      .replaceAll("有方", "Youfang")
      .replaceAll("印际", "YinjiSpace")
      .replaceAll("谷德设计网", "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function itemCaption(item, language) {
    return language === "en" ? englishCaption(item.caption) : item.caption;
  }

  function itemKind(item, language) {
    if (language !== "en") return item.kind;
    return item.kind === "奖项" ? copy.en.award : copy.en.publication;
  }

  function itemGroup(item, language) {
    if (language === "en" && item.group === "媒体报道") return copy.en.mediaGroup;
    return item.group;
  }

  window.WUEAwardsI18n = { itemCaption, itemKind, itemGroup };

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

  function makePage(items, initialLanguage) {
    let language = initialLanguage;
    let labels = copy[language];
    const section = document.createElement("section");
    section.id = "wue-awards-redesign";
    section.className = "wue-awards-page";
    section.innerHTML = `
      <div class="wue-awards-container">
        <header class="wue-awards-intro">
          <div>
            <p>WUE DESIGN / RECOGNITION</p>
            <h1>${labels.title}</h1>
          </div>
          <div class="wue-awards-intro-copy">
            <nav class="wue-awards-tabs" aria-label="${labels.tabsLabel}">
              <button type="button" class="is-active" data-kind="全部">${labels.all}</button><span>/</span>
              <button type="button" data-kind="奖项">${labels.awards}</button><span>/</span>
              <button type="button" data-kind="刊登">${labels.media}</button>
            </nav>
          </div>
        </header>
        <div class="wue-awards-archive">
          <aside class="wue-awards-preview">
            <div class="wue-awards-preview-image" aria-live="polite">
              <img alt="" decoding="async">
            </div>
            <div class="wue-awards-preview-meta"><span></span><p></p><button type="button" class="wue-awards-open-archive" aria-label="${labels.archiveLabel}"><small>46 ITEMS&nbsp; →</small></button></div>
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
      section.style.setProperty("--wue-preview-image-left", `${imageBox.left - frameBox.left}px`);
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
        previewImage.alt = itemCaption(item, language);
        previewImage.width = item.width;
        previewImage.height = item.height;
        previewGroup.textContent = `${itemGroup(item, language)} / ${itemKind(item, language)}`;
        previewCaption.textContent = itemCaption(item, language);
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
        const displayGroup = language === "en" && group === "媒体报道" ? labels.mediaGroup : group;
        article.innerHTML = `<header><h2>${escapeHtml(displayGroup)}</h2><span>${String(groupItems.length).padStart(2, "0")}</span></header><div></div>`;
        const rows = article.querySelector("div");
        groupItems.forEach((item) => {
          sequence += 1;
          const row = document.createElement("div");
          row.className = "wue-awards-row";
          row.title = itemCaption(item, language);
          row.innerHTML = `<span>${String(sequence).padStart(2, "0")}</span><p>${escapeHtml(itemCaption(item, language))}</p><small>${escapeHtml(itemKind(item, language))}</small>`;
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

    section.querySelector(".wue-awards-open-archive").addEventListener("click", () => window.WUEArchive?.open("awards"));
    addEventListener("resize", alignArchiveButton);
    section.__wueSetLanguage = (nextLanguage) => {
      if (nextLanguage === language) return;
      language = nextLanguage;
      labels = copy[language];
      section.querySelector(".wue-awards-intro h1").textContent = labels.title;
      const tabs = section.querySelectorAll(".wue-awards-tabs button");
      section.querySelector(".wue-awards-tabs").setAttribute("aria-label", labels.tabsLabel);
      tabs[0].textContent = labels.all;
      tabs[1].textContent = labels.awards;
      tabs[2].textContent = labels.media;
      section.querySelector(".wue-awards-open-archive").setAttribute("aria-label", labels.archiveLabel);
      const activeKind = section.querySelector(".wue-awards-tabs button.is-active")?.dataset.kind || "全部";
      render(activeKind);
      setPreview(previewItems[slideIndex]);
    };
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
    const existingPage = document.getElementById("wue-awards-redesign");
    if (existingPage) {
      existingPage.__wueSetLanguage?.(getLanguage());
      return;
    }
    const originalSection = document.querySelector("#root main section");
    if (!originalSection) return;
    const data = await loadData();
    if (!isAwardsPage() || document.getElementById("wue-awards-redesign")) return;
    document.body.classList.add("wue-awards-redesign-active");
    document.body.appendChild(makePage(data.awards, getLanguage()));
  }

  function scheduleMount() {
    clearTimeout(mountTimer);
    mountTimer = setTimeout(() => mount().catch(console.error), 40);
  }

  new MutationObserver(scheduleMount).observe(document.getElementById("root"), { childList: true, subtree: true });
  window.addEventListener("popstate", scheduleMount);
  scheduleMount();
})();
