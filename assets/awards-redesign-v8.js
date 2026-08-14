(function () {
  const scriptUrl = new URL(document.currentScript.src);
  const siteRoot = new URL("../", scriptUrl);
  const dataUrl = new URL("archive-gallery-data.json?v=4", scriptUrl);
  let dataPromise;
  let currentPath = "";
  let mountTimer;

  const copy = {
    zh: {
      eyebrow: "WUE DESIGN / 奖项与刊登",
      title: "奖项与媒体",
      tabsLabel: "奖项资料分类",
      all: "全部",
      awards: "主要获奖",
      media: "媒体刊登",
      award: "奖项",
      publication: "刊登",
      mediaGroup: "媒体报道",
      external: "打开相关官网"
    },
    en: {
      eyebrow: "WUE DESIGN / RECOGNITION",
      title: "Awards & Media",
      tabsLabel: "Recognition archive categories",
      all: "All",
      awards: "Awards",
      media: "Publications",
      award: "Award",
      publication: "Publication",
      mediaGroup: "Media Coverage",
      external: "Open official source"
    }
  };

  const sourceUrls = {
    youfang: "https://www.archiposition.com/items/20230202110856",
    yinji: "https://www.yinjispace.com/article/WUE-Studio-Self-Built-House-A-Non-Traditional-Fluent-Space.html",
    archdaily: "https://www.archdaily.cn/cn/998346/zi-zao-zhai-fei-chuan-tong-xing-de-liu-dong-kong-jian-wu-yi-she-ji-gong-zuo-shi",
    dezeen: "https://www.dezeen.com/",
    gooood: "https://www.gooood.cn/en/the-horizontal-window-house-by-wue-design.htm",
    goooodFuelGallery: "https://www.gooood.cn/fuel-gallery-by-wue-design.htm",
    elle: "https://www.elledeco.cn/",
    elleShortWall: "https://mp.weixin.qq.com/s/AekPlJDrL3awqV75OaKmcA",
    elleAwards: "https://ida.elledeco.cn/",
    ideat: "https://mp.weixin.qq.com/s/8KvCyW-uCW4T3RkDTHdz3w?scene=1",
    pchouse: "https://www.pchouse.com.cn/mda/pchouseaward/2024/dsjs/",
    ad100: "https://www.adstyle.com.cn/ad100-young/2024/designer_14123c80e3958cdd.html",
    yitiao: "https://36kr.com/p/2970354219602179",
    trends: "https://www.trendshome.com.cn/jiaju/",
    trendsSelfBuilt: "https://mp.weixin.qq.com/s/yrPWw0HQFd1J3QMEYdZkvA",
    goooodHorizontalWechat: "https://mp.weixin.qq.com/s/gUMOs4rKz6q44tZPlhLfew",
    goooodFuelWechat: "https://mp.weixin.qq.com/s/X0rWJi22DI4ftWwcnVIwXw"
  };

  const exactItemUrls = {
    "award-022": sourceUrls.ideat,
    "award-016": sourceUrls.trendsSelfBuilt,
    "award-046": sourceUrls.goooodHorizontalWechat,
    "award-047": sourceUrls.elleShortWall,
    "award-048": sourceUrls.trends,
    "award-049": sourceUrls.goooodFuelWechat
  };

  const consolidationGroups = [
    { ids: ["award-032", "award-033", "award-034", "award-035", "award-036"], cover: "award-034", caption: "2025 ELLEDECO 家居廊 The A-List Young Talents" },
    { ids: ["award-018", "award-019", "award-020"], cover: "award-019", caption: "2024 ELLEDECO 家居廊 中国室内建筑设计大奖｜横窗之家" },
    { ids: ["award-021"], caption: "2024 ELLEDECO 家居廊 中国室内建筑设计年鉴" },
    { ids: ["award-022"], caption: "2024 IDEAT理想家 非凡设计大奖" },
    { ids: ["award-023", "award-024"], cover: "award-023", caption: "2024 PChouse 私宅设计大奖｜年度小户型空间设计奖、新势力榜" },
    { ids: ["award-025"], caption: "2024 一条｜鸢尾花之家 10W+阅读量报道" },
    { ids: ["award-026", "award-027", "award-028", "award-029", "award-030", "award-031"], cover: "award-026", caption: "2024 安邸 AD100Young" },
    { ids: ["award-001", "award-002"], cover: "award-001", caption: "2023 ELLEDECO 家居廊 NO.222" },
    { ids: ["award-003", "award-004", "award-005"], cover: "award-003", caption: "2023 ELLEDECO 家居廊 NO.237 二十周年刊" },
    { ids: ["award-006", "award-007", "award-008", "award-009", "award-010"], cover: "award-009", caption: "2023 ELLEDECO 家居廊 中国室内建筑设计大奖｜沙沙冷萃园" },
    { ids: ["award-011", "award-012", "award-013", "award-014"], cover: "award-013", caption: "2023 ELLEDECO 家居廊 中国室内建筑设计大奖｜自造宅" },
    { ids: ["award-015"], caption: "2023 ELLEDECO 家居廊 中国室内建筑设计年鉴" },
    { ids: ["award-016", "award-017"], cover: "award-016", caption: "2023 TRENDSHOME 时尚家居｜自造宅" },
    { ids: ["award-037"], caption: "有方｜自造宅：非传统性的流动空间" },
    { ids: ["award-038", "award-039", "award-040", "award-041", "award-042", "award-045"], cover: "award-038", caption: "印际｜自造宅：非传统性的流动空间" },
    { ids: ["award-043"], caption: "ArchDaily｜自造宅，非传统性的流动空间" },
    { ids: ["award-044"], caption: "Dezeen｜开放而具流动性的工作室兼住宅" },
    { ids: ["award-046"], caption: "gooood谷德设计网｜横窗之家" },
    { ids: ["award-047"], caption: "2024 ELLEDECO 家居廊｜设计廊145 首发｜短墙之家" },
    { ids: ["award-048"], caption: "2024 时尚家居｜海盐味的75㎡小家，就像一个“海边甜品站”" },
    { ids: ["award-049"], caption: "gooood谷德设计网｜燃画廊：灵活的复合型模块化展厅" }
  ];

  function consolidateItems(items) {
    const byId = new Map(items.map((item) => [item.id, item]));
    return consolidationGroups.map((group) => {
      const members = group.ids.map((id) => byId.get(id)).filter(Boolean);
      const representative = byId.get(group.cover || group.ids[0]) || members[0];
      return {
        ...representative,
        id: group.ids.join("+"),
        caption: group.caption,
        sourceCount: members.length
      };
    }).filter((item) => item.asset);
  }

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
      .replaceAll("短墙之家", "Short Wall House")
      .replaceAll("设计廊145 首发", "Design Gallery 145 Debut")
      .replaceAll("燃画廊", "Fuel Gallery")
      .replaceAll("灵活的复合型模块化展厅", "A Flexible Hybrid Modular Gallery")
      .replaceAll("海盐味的75㎡小家，就像一个“海边甜品站”", "A 75㎡ Sea-salt Home, Like a Seaside Dessert Station")
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
      .replaceAll("｜", " / ")
      .replaceAll("、", ", ")
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

  function itemUrl(item) {
    const caption = item.caption;
    const exact = String(item.id || "")
      .split("+")
      .map((id) => exactItemUrls[id])
      .find(Boolean);
    if (exact) return exact;
    if (caption.includes("有方")) return sourceUrls.youfang;
    if (caption.includes("印际")) return sourceUrls.yinji;
    if (caption.includes("ArchDaily")) return sourceUrls.archdaily;
    if (caption.includes("Dezeen")) return sourceUrls.dezeen;
    if (caption.includes("燃画廊")) return sourceUrls.goooodFuelGallery;
    if (caption.includes("gooood")) return sourceUrls.gooood;
    if (caption.includes("ELLEDECO") && caption.includes("中国室内建筑设计")) return sourceUrls.elleAwards;
    if (caption.includes("短墙之家")) return sourceUrls.elleShortWall;
    if (caption.includes("ELLEDECO")) return sourceUrls.elle;
    if (caption.includes("IDEAT")) return sourceUrls.ideat;
    if (caption.includes("PChouse")) return sourceUrls.pchouse;
    if (caption.includes("AD100Young")) return sourceUrls.ad100;
    if (caption.includes("一条")) return sourceUrls.yitiao;
    if (caption.includes("TRENDSHOME") || caption.includes("时尚家居")) return sourceUrls.trends;
    return sourceUrls.elle;
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
    document.getElementById("wue-awards-redesign")?.remove();
    document.body.classList.remove("wue-awards-redesign-active");
    document.documentElement.classList.remove("wue-awards-preload");
  }

  function makePage(items, initialLanguage) {
    let language = initialLanguage;
    let labels = copy[language];
    let activeKind = "全部";
    const section = document.createElement("section");
    section.id = "wue-awards-redesign";
    section.className = "wue-awards-page wue-awards-split-page";
    section.innerHTML = `
      <div class="wue-awards-container">
        <aside class="wue-awards-directory">
          <header class="wue-awards-intro">
            <p>${labels.eyebrow}</p>
            <h1>${labels.title}</h1>
            <nav class="wue-awards-tabs" aria-label="${labels.tabsLabel}">
              <button type="button" class="is-active" data-kind="全部">${labels.all}</button><span>/</span>
              <button type="button" data-kind="奖项">${labels.awards}</button><span>/</span>
              <button type="button" data-kind="刊登">${labels.media}</button>
            </nav>
          </header>
          <div class="wue-awards-list" aria-live="polite"></div>
        </aside>
        <div class="wue-awards-gallery" aria-live="polite"></div>
      </div>
    `;

    const list = section.querySelector(".wue-awards-list");
    const gallery = section.querySelector(".wue-awards-gallery");

    function render(kind) {
      activeKind = kind;
      const filtered = kind === "全部" ? items : items.filter((item) => item.kind === kind);
      const groups = [...new Set(filtered.map((item) => item.group))];
      list.innerHTML = "";
      gallery.innerHTML = `
        <div class="wue-awards-column" data-column="0"></div>
        <div class="wue-awards-column" data-column="1"></div>
      `;
      const galleryColumns = [...gallery.querySelectorAll(".wue-awards-column")];
      let sequence = 0;

      groups.forEach((group) => {
        const groupItems = filtered.filter((item) => item.group === group);
        const article = document.createElement("article");
        article.className = "wue-awards-year";
        article.innerHTML = `<header><h2>${escapeHtml(itemGroup(groupItems[0], language))}</h2><span>${String(groupItems.length).padStart(2, "0")}</span></header><div></div>`;
        const rows = article.querySelector("div");

        groupItems.forEach((item) => {
          sequence += 1;
          const number = String(sequence).padStart(2, "0");
          const caption = itemCaption(item, language);
          const row = document.createElement("div");
          row.className = "wue-awards-row";
          row.innerHTML = `<span>${number}</span><p>${escapeHtml(caption)}</p><small>${escapeHtml(itemKind(item, language))}</small>`;
          rows.appendChild(row);

          const card = document.createElement("a");
          card.className = "wue-awards-card";
          card.href = itemUrl(item);
          card.target = "_blank";
          card.rel = "noopener noreferrer";
          card.setAttribute("aria-label", `${caption} — ${labels.external}`);
          card.innerHTML = `
            <figure>
              <img src="${assetUrl(item)}" alt="${escapeHtml(caption)}" width="${item.width}" height="${item.height}" loading="lazy" decoding="async">
            </figure>
            <div><span>${number}</span><p>${escapeHtml(caption)}</p><small>↗</small></div>
          `;
          galleryColumns[(sequence - 1) % galleryColumns.length].appendChild(card);
        });
        list.appendChild(article);
      });
      list.scrollTop = 0;
      galleryColumns.forEach((column) => { column.scrollTop = 0; });
    }

    section.querySelectorAll(".wue-awards-tabs button").forEach((button) => {
      button.addEventListener("click", () => {
        section.querySelectorAll(".wue-awards-tabs button").forEach((tab) => tab.classList.toggle("is-active", tab === button));
        render(button.dataset.kind);
      });
    });

    section.__wueSetLanguage = (nextLanguage) => {
      if (nextLanguage === language) return;
      language = nextLanguage;
      labels = copy[language];
      section.querySelector(".wue-awards-intro > p").textContent = labels.eyebrow;
      section.querySelector(".wue-awards-intro h1").textContent = labels.title;
      const tabs = section.querySelectorAll(".wue-awards-tabs button");
      section.querySelector(".wue-awards-tabs").setAttribute("aria-label", labels.tabsLabel);
      tabs[0].textContent = labels.all;
      tabs[1].textContent = labels.awards;
      tabs[2].textContent = labels.media;
      render(activeKind);
    };

    render("全部");
    return section;
  }

  async function mount() {
    const path = window.location.pathname;
    if (!isAwardsPage()) {
      if (currentPath !== path) cleanup();
      currentPath = path;
      return;
    }
    document.documentElement.classList.add("wue-awards-preload");
    currentPath = path;
    const existingPage = document.getElementById("wue-awards-redesign");
    if (existingPage) {
      existingPage.__wueSetLanguage?.(getLanguage());
      document.documentElement.classList.remove("wue-awards-preload");
      return;
    }
    const originalSection = document.querySelector("#root main section");
    if (!originalSection) return;
    const data = await loadData();
    if (!isAwardsPage() || document.getElementById("wue-awards-redesign")) return;
    document.body.classList.add("wue-awards-redesign-active");
    document.body.appendChild(makePage(consolidateItems(data.awards), getLanguage()));
    document.documentElement.classList.remove("wue-awards-preload");
  }

  function scheduleMount() {
    clearTimeout(mountTimer);
    mountTimer = setTimeout(() => mount().catch(console.error), 40);
  }

  new MutationObserver(scheduleMount).observe(document.getElementById("root"), { childList: true, subtree: true });
  document.addEventListener("click", (event) => {
    const link = event.target.closest?.("a[href]");
    if (!link) return;
    const url = new URL(link.getAttribute("href"), window.location.href);
    if (url.pathname.replace(/\/$/, "").endsWith("/awards")) {
      document.documentElement.classList.add("wue-awards-preload");
    }
  }, true);
  window.addEventListener("popstate", scheduleMount);
  scheduleMount();
})();






