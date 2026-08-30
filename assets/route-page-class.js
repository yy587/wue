(function () {
  "use strict";

  function syncPageClass() {
    var path = window.location.pathname.replace(/\/+$/, "");
    var isAbout = /\/about$/.test(path);
    document.documentElement.classList.toggle("wue-about-page", isAbout);
    document.documentElement.classList.toggle("wue-contact-page", /\/contact$/.test(path));
    if (!isAbout) document.documentElement.classList.remove("wue-about-ready");
    formatAboutTitle();
  }

  function formatAboutTitle() {
    if (!document.documentElement.classList.contains("wue-about-page")) return;

    var aside = document.querySelector("main aside");
    var heading = aside && aside.querySelector("h1");
    var eyebrow = aside && aside.querySelector("p");
    if (!heading || !eyebrow || !/WUE\s+DESIGN\s*\/\s*(关于|About)/i.test(eyebrow.textContent)) return;

    if (heading.querySelector(".wue-about-title-en")) {
      document.documentElement.classList.add("wue-about-ready");
      return;
    }

    var text = heading.textContent.trim();
    var match = text.match(/^(.*?)[（(]\s*(WUE\s+Design)\s*[）)]$/i);
    if (!match) {
      document.documentElement.classList.add("wue-about-ready");
      return;
    }

    heading.textContent = match[1].trim();
    var englishTitle = document.createElement("span");
    englishTitle.className = "wue-about-title-en";
    englishTitle.textContent = "（" + match[2] + "）";
    heading.appendChild(englishTitle);
    document.documentElement.classList.add("wue-about-ready");
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
