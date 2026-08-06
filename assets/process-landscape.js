(() => {
  const stages = [
    ["archive-process-001.webp", "archive-process-002.webp", "archive-process-003.webp", "archive-process-004.webp"],
    ["archive-process-005.webp", "archive-process-006.webp", "archive-process-007.webp", "archive-process-008.webp"],
    ["archive-process-014.webp"],
    ["archive-process-018.webp"],
    ["archive-process-024.webp"],
    ["archive-process-030.webp"],
    ["archive-process-032.webp", "archive-process-033.webp", "archive-process-034.webp", "archive-process-035.webp"],
    ["archive-process-038.webp"],
    ["archive-process-041.webp"],
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
      frame.classList.toggle("is-collage", files.length > 1);
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
