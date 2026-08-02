const mappingPath = "/wue/assets/contact-campus-sketch-white-ecfcf96a.png";

function replaceContactMapping() {
  document
    .querySelectorAll('img[src*="contact-campus-sketch"]')
    .forEach((image) => {
      if (image.getAttribute("src") !== mappingPath) {
        image.setAttribute("src", mappingPath);
      }
    });
}

new MutationObserver(replaceContactMapping).observe(document.documentElement, {
  childList: true,
  subtree: true,
});

replaceContactMapping();
