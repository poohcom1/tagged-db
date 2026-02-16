const listenerRegistered = false;
let isTabKeyActive = false;

function handleKeyDown(e: KeyboardEvent) {
  // Only count navigation keys (Tab is the most important)
  if (e.key === "Tab") {
    isTabKeyActive = true;
  }
}

function handlePointerDown() {
  isTabKeyActive = false;
}

export function setupTabFocusDetection() {
  if (listenerRegistered) return;
  window.addEventListener("keydown", handleKeyDown, true);
  window.addEventListener("mousedown", handlePointerDown, true);
  window.addEventListener("pointerdown", handlePointerDown, true);
  window.addEventListener("touchstart", handlePointerDown, true);
}

export function isTabFocus() {
  if (!listenerRegistered) {
    console.error(
      "setupInputModalityListeners() must be called before isKeyboardFocus()!",
    );
  }

  return isTabKeyActive;
}
