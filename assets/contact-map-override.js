const mappingPath = "/assets/contact-campus-sketch-c1c96aa8.jpg";

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
