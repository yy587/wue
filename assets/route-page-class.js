(function () {
  "use strict";

  function syncPageClass() {
    var path = window.location.pathname.replace(/\/+$/, "");
    document.documentElement.classList.toggle("wue-about-page", /\/about$/.test(path));
    document.documentElement.classList.toggle("wue-contact-page", /\/contact$/.test(path));
    formatAboutTitle();
  }

  function formatAboutTitle() {
    if (!document.documentElement.classList.contains("wue-about-page")) return;

    var heading = document.querySelector("main aside h1");
    if (!heading || heading.querySelector(".wue-about-title-en")) return;

    var text = heading.textContent.trim();
    var match = text.match(/^(.*?)[（(]\s*(WUE\s+Design)\s*[）)]$/i);
    if (!match) return;

    heading.textContent = match[1].trim();
    var englishTitle = document.createElement("span");
    englishTitle.className = "wue-about-title-en";
    englishTitle.textContent = "（" + match[2] + "）";
    heading.appendChild(englishTitle);
  }

  ["pushState", "replaceState"].forEach(function (method) {
    var original = history[method];
    history[method] = function () {
      var result = original.apply(this, arguments);
      syncPageClass();
      return result;
    };
  });

  window.addEventListener("popstate", syncPageClass);
  syncPageClass();

  new MutationObserver(function () {
    formatAboutTitle();
  }).observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true
  });
})();
