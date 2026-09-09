// =============================================================
// APIForge X — Motion system
// One IntersectionObserver for every scroll reveal in the product.
//
// Contract:
//   [data-motion]        reveals once when it scrolls into view
//   [data-motion-group]  container; children are staggered by the
//                        --motion-i nth-child rules in _motion.scss
//
// Safety rules baked in:
//   • Nothing is ever hidden unless JS has actively "armed" it, so a
//     page without JS (or with an error) shows all of its content.
//   • Overlays (modal / offcanvas / collapse) are never armed — their
//     contents must never depend on an intersection to become visible.
//   • prefers-reduced-motion skips the observer entirely: every element
//     is marked visible and CSS disables the animation.
// =============================================================

const ARMED = 'motion-armed';
const INVIEW = 'is-inview';
const SETTLED = 'is-settled';
// Anything living inside one of these must never wait for an intersection:
// its visibility is controlled by a component, not by the scroll position.
const OVERLAY = '.modal, .offcanvas, .collapse, [hidden], .tab-pane:not(.show):not(.active)';
const TARGET = '[data-motion]';

let observer = null;

function reduced() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function settle(el) {
  el.addEventListener(
    'animationend',
    () => {
      el.classList.add(SETTLED);
      el.style.willChange = '';
    },
    { once: true }
  );
}

function reveal(el) {
  el.classList.add(INVIEW);
  if (!reduced()) settle(el);
}

function getObserver() {
  if (observer) return observer;
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        reveal(entry.target);
        observer.unobserve(entry.target);
      });
    },
    // Start a touch before the element is fully on screen so the motion
    // finishes as it arrives rather than after.
    { rootMargin: '0px 0px -10% 0px', threshold: 0.05 }
  );
  return observer;
}

/**
 * Arm + observe every [data-motion] inside `root` (defaults to the whole
 * document). Safe to call again after a page renders content dynamically.
 */
export function observeMotion(root = document) {
  const scope = root instanceof Element ? root : document;
  const targets = scope.querySelectorAll(TARGET);
  if (!targets.length) return;

  if (reduced() || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add(INVIEW));
    return;
  }

  const io = getObserver();
  targets.forEach((el) => {
    if (el.classList.contains(INVIEW)) return;
    // Overlay content is always visible — never gate it on an intersection.
    if (el.closest(OVERLAY)) {
      el.classList.add(INVIEW);
      return;
    }
    el.classList.add(ARMED);
    io.observe(el);
  });
}

/** Reveal immediately, ignoring the observer (used by QA / demo pages). */
export function revealNow(el) {
  if (!el) return;
  el.classList.remove(ARMED);
  reveal(el);
}

export function initMotion() {
  observeMotion(document);

  // Follow the OS setting live: turning reduced motion on un-hides
  // everything that is still waiting to be revealed.
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener?.('change', (e) => {
    if (!e.matches) return;
    document.querySelectorAll(`${TARGET}:not(.${INVIEW})`).forEach((el) => {
      el.classList.add(INVIEW);
    });
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  });
}
