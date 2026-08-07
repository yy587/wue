(function () {
  const scriptUrl = new URL(document.currentScript.src);
  const siteRoot = new URL("../", scriptUrl);
  const dataUrl = new URL("archive-gallery-data.json", scriptUrl);
  let dataPromise;
  let currentPath = "";
  let mountTimer;

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
      external: "打开相关官网"
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
      external: "Open official source"
    }
  };

  const sourceUrls = {
    youfang: "https://www.archiposition.com/items/20230202110856",
    yinji: "https://www.yinjispace.com/article/WUE-Studio-Self-Built-House-A-Non-Traditional-Fluent-Space.html",
    archdaily: "https://www.archdaily.cn/cn/998346/zi-zao-zhai-fei-chuan-tong-xing-de-liu-dong-kong-jian-wu-yi-she-ji-gong-zuo-shi",
    dezeen: "https://www.dezeen.com/",
    gooood: "https://www.gooood.cn/en/the-horizontal-window-house-by-wue-design.htm",
    elle: "https://www.elledeco.cn/",
    elleAwards: "https://ida.elledeco.cn/",
    ideat: "https://www.ideatchina.com/",
    pchouse: "https://www.pchouse.com.cn/mda/pchouseaward/2024/dsjs/",
    ad100: "https://ad100.adstyle.com.cn/",
    yitiao: "https://www.yit.com/",
    trends: "https://www.trendsgroup.com.cn/"
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

  function itemUrl(item) {
    const caption = item.caption;
    if (caption.includes("有方")) return sourceUrls.youfang;
    if (caption.includes("印际")) return sourceUrls.yinji;
    if (caption.includes("ArchDaily")) return sourceUrls.archdaily;
    if (caption.includes("Dezeen")) return sourceUrls.dezeen;
    if (caption.includes("gooood")) return sourceUrls.gooood;
    if (caption.includes("ELLEDECO") && caption.includes("中国室内建筑设计")) return sourceUrls.elleAwards;
    if (caption.includes("ELLEDECO")) return sourceUrls.elle;
    if (caption.includes("IDEAT")) return sourceUrls.ideat;
    if (caption.includes("PChouse")) return sourceUrls.pchouse;
    if (caption.includes("AD100Young")) return sourceUrls.ad100;
    if (caption.includes("一条")) return sourceUrls.yitiao;
    if (caption.includes("TRENDSHOME")) return sourceUrls.trends;
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
            <p>WUE DESIGN / RECOGNITION</p>
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
      gallery.innerHTML = "";
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
          gallery.appendChild(card);
        });
        list.appendChild(article);
      });
      list.scrollTop = 0;
      gallery.scrollTop = 0;
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
