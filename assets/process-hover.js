const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
let pendingExpansion;

function getProcessRow(target) {
  if (!(target instanceof Element)) return null;
  const row = target.closest("aside div.border-b");
  return row?.querySelector(":scope > button[aria-expanded]") ? row : null;
}

document.addEventListener("pointerover", (event) => {
  if (!finePointer.matches) return;

  const row = getProcessRow(event.target);
  if (!row || row.contains(event.relatedTarget)) return;

  const button = row.querySelector(":scope > button[aria-expanded]");
  if (button.getAttribute("aria-expanded") === "true") return;

  window.clearTimeout(pendingExpansion);
  pendingExpansion = window.setTimeout(() => {
    if (
      row.matches(":hover") &&
      button.getAttribute("aria-expanded") === "false"
    ) {
      button.click();
    }
  }, 80);
});

document.addEventListener("pointerout", (event) => {
  const row = getProcessRow(event.target);
  if (row && !row.contains(event.relatedTarget)) {
    window.clearTimeout(pendingExpansion);
  }
});
