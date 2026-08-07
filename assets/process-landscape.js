(() => {
  const stages = [
    ["process-01-initial-contact.webp?v=2"],
    ["process-02-pre-design.webp"],
    ["process-03-concept-design.webp"],
    ["process-04-schematic-design.webp"],
    ["process-05-construction-drawings.webp"],
    ["process-06-budget-ffe.webp"],
    ["process-07-site-delivery.webp"],
    ["process-08-procurement.webp"],
    ["process-09-final-handover.webp"],
  ];
  const labels = [
    "初次沟通", "设计前期", "第一阶段 - 概念设计", "第二阶段 - 方案设计",
    "第三阶段 - 施工图绘制", "预算规划 & 软装清单", "落地阶段", "采买阶段", "收尾阶段",
  ];
  const ownScript = document.currentScript;
  const assetBase = ownScript?.src.replace(/process-landscape\.js(?:\?.*)?$/, "") || "/assets/";
  let queued = false;

  function isProcessPage() {
    return location.pathname.replace(/\/+$/, "").endsWith("/process");
  }

  function mount() {
    queued = false;
    const active = isProcessPage();
    document.body.classList.toggle("wue-process-landscape", active);
    if (!active) return;

    document.querySelectorAll("main article").forEach((article, stageIndex) => {
      const files = stages[stageIndex];
      const frame = article.firstElementChild;
      if (!files || !frame || frame.dataset.wueLandscapeReady === "true") return;
      frame.dataset.wueLandscapeReady = "true";
      frame.classList.add("wue-process-landscape-frame");
      frame.classList.remove("is-collage");
      frame.replaceChildren(...files.map((file, imageIndex) => {
        const image = document.createElement("img");
        image.src = `${assetBase}${file}`;
        image.alt = files.length > 1
          ? `${labels[stageIndex]} ${String(imageIndex + 1).padStart(2, "0")}`
          : labels[stageIndex];
        image.loading = stageIndex < 3 ? "eager" : "lazy";
        image.decoding = "async";
        return image;
      }));
    });
  }

  function queueMount() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(mount);
  }

  new MutationObserver(queueMount).observe(document.documentElement, { childList: true, subtree: true });
  addEventListener("popstate", queueMount);
  queueMount();
})();
