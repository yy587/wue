(() => {
  const isProjectsIndex = () => /\/(?:wue\/)?projects\/?$/.test(window.location.pathname);
  const interiorCover = new URL("22-B61pTDli.webp", document.currentScript.src).href;

  const updateShashaCover = () => {
    if (!isProjectsIndex()) return;

    document
      .querySelectorAll('a[href$="/projects/shasha-coffee"] > div:first-child img')
      .forEach((image) => {
        if (image.src !== interiorCover) image.src = interiorCover;
      });
  };

  updateShashaCover();
  new MutationObserver(updateShashaCover).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
})();
