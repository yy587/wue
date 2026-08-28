(function () {
  "use strict";

  function syncPageClass() {
    var path = window.location.pathname.replace(/\/+$/, "");
    document.documentElement.classList.toggle("wue-about-page", /\/about$/.test(path));
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
})();
