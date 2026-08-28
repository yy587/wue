(() => {
  let activeStrip;
  const descriptions = {
    zh: [
      "主案设计师1V1对接设计需求，提供概念手绘图。\n展示作品集及往期案例的交付文件。",
      "签订合同后现场量房，提供房屋原始平面图。\n提供详细的调查问卷，清晰全面了解业主需求。\n安排设计时间，提供设计周期计划表与施工流程表。",
      "15个工作日左右，视项目排期而定。\n概念方案阶段，提供至少两版平面规划与空间方案。\n搭建概念模型，带业主漫游在3D空间内感知设计方案。",
      "15个工作日左右，视项目排期而定。\n模型深化阶段，完善材质、色彩、软装等细节。\n提供空间多角度的效果图，帮助业主感受空间氛围。",
      "10个工作日左右，视项目排期而定。\n施工图深化阶段，完善电位、灯位、开关等点位。\n全套施工图纸包括平面、立面及施工节点等。",
      "5个工作日左右，视项目排期而定。\n根据方案分配预算，包括施工、主材、门窗和定制等。\n根据方案提供软装采买清单。",
      "设计师全程跟进落地，包括拆除、新建墙、空调暖气、水电及木瓦油等交底。\n指导施工方按照设计还原落地。",
      "设计师陪同业主进行采买，提供主材、全屋定制、软装家具等供应商。\n协助业主审阅图纸，指导供应商按照设计还原落地。",
      "硬装结束软装进场后，设计师进行软装摆场。\n摄影师拍摄毕业照，赠送业主全套照片。"
    ],
    en: [
      "One-on-one briefing with the lead designer and concept sketches.\nPortfolio and documentation from previous deliveries are presented.",
      "Site measurement and the original floor plan follow contract signing.\nA detailed questionnaire, design schedule, and workflow clarify the brief.",
      "About 15 working days. At least two planning options are developed,\nwith a 3D concept model for experiencing the proposed space.",
      "About 15 working days. Materials, colors, and furnishings are refined.\nMulti-angle renderings communicate the complete spatial atmosphere.",
      "About 10 working days. Electrical, lighting, and switch points are resolved,\nwith a full set of plans, elevations, and construction details.",
      "About 5 working days. Budgets cover construction, materials, openings, and custom work,\nfollowed by a complete FF&E procurement list.",
      "The designer follows demolition, wall, equipment, MEP, and finish handovers,\nguiding contractors to realize the design accurately.",
      "The designer accompanies procurement and recommends material, cabinetry, and furniture suppliers,\nthen reviews drawings and guides accurate implementation.",
      "After hard finishes and furnishings are complete, the designer styles the space.\nA photographer documents and delivers the finished project."
    ]
  };

  function isProcessPage() {
    return location.pathname.replace(/\/+$/, "").endsWith("/process");
  }

  function findStrip() {
    return document.querySelector("main section div.grid:has(> div > article)");
  }

  function currentLanguage(strip) {
    const awardsLink = [...document.querySelectorAll("#site-navigation a")]
      .find((link) => link.getAttribute("href")?.replace(/\/$/, "").endsWith("/awards"));
    return awardsLink?.textContent.trim() === "Awards" ? "en" : "zh";
  }

  function applyDescriptions(strip) {
    const language = currentLanguage(strip);
    strip.querySelectorAll(":scope > div > article").forEach((article, index) => {
      let description = article.querySelector(":scope > .wue-process-description");
      if (!description) {
        description = document.createElement("p");
        description.className = "wue-process-description";
        article.append(description);
      }
      const nextText = descriptions[language][index] || "";
      if (description.textContent !== nextText) description.textContent = nextText;
    });
  }

  function mount() {
    if (!isProcessPage()) {
      document.querySelectorAll(".wue-process-drag-zone").forEach((element) => {
        element.classList.remove("wue-process-drag-zone", "is-dragging");
      });
      activeStrip = null;
      return;
    }
    const strip = findStrip();
    if (!strip) return;
    document.querySelectorAll(".wue-process-drag-zone").forEach((element) => {
      if (element !== strip) element.classList.remove("wue-process-drag-zone", "is-dragging");
    });
    strip.classList.add("wue-process-drag-zone");
    applyDescriptions(strip);
    if (strip.dataset.wueHorizontalReady === "true") return;
    strip.dataset.wueHorizontalReady = "true";
    strip.tabIndex = 0;
    strip.setAttribute("aria-label", "设计流程横向浏览");
    strip.addEventListener("wheel", (event) => {
      const maxScroll = strip.scrollWidth - strip.clientWidth;
      if (maxScroll <= 0) return;
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (!delta) return;
      const next = Math.max(0, Math.min(maxScroll, strip.scrollLeft + delta));
      if (next === strip.scrollLeft) return;
      event.preventDefault();
      strip.scrollLeft = next;
    }, { passive: false });

    let dragStartX = 0;
    let dragStartScroll = 0;
    let dragging = false;
    strip.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      dragging = true;
      dragStartX = event.clientX;
      dragStartScroll = strip.scrollLeft;
      strip.classList.add("is-dragging");
      strip.setPointerCapture(event.pointerId);
    });
    strip.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      event.preventDefault();
      strip.scrollLeft = dragStartScroll - (event.clientX - dragStartX);
    });
    const stopDragging = (event) => {
      if (!dragging) return;
      dragging = false;
      strip.classList.remove("is-dragging");
      if (strip.hasPointerCapture(event.pointerId)) strip.releasePointerCapture(event.pointerId);
    };
    strip.addEventListener("pointerup", stopDragging);
    strip.addEventListener("pointercancel", stopDragging);
    strip.addEventListener("dragstart", (event) => event.preventDefault());
    strip.addEventListener("click", (event) => {
      if (!event.target.closest("article")) return;
      event.preventDefault();
      event.stopPropagation();
    }, true);
    strip.addEventListener("keydown", (event) => {
      const step = Math.max(240, strip.clientWidth * 0.72);
      const direction = event.key === "ArrowRight" || event.key === "PageDown" ? 1
        : event.key === "ArrowLeft" || event.key === "PageUp" ? -1 : 0;
      if (!direction) return;
      event.preventDefault();
      strip.scrollBy({ left: direction * step, behavior: "smooth" });
    });
    activeStrip = strip;
  }

  new MutationObserver(mount).observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ["lang"]
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest?.("button")?.textContent.includes("中文 | EN")) return;
    setTimeout(mount, 80);
    setTimeout(mount, 320);
  }, true);
  addEventListener("popstate", mount);
  addEventListener("resize", () => activeStrip?.scrollTo({ left: activeStrip.scrollLeft }));
  mount();
})();
