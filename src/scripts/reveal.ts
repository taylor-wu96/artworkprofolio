// 緩慢、克制的入場揭示：元素進入視窗才現形。
export function init() {
  function observe() {
    const els = document.querySelectorAll('[data-reveal]:not(.is-visible)');
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );
    els.forEach((el) => io.observe(el));
  }
  observe();
  document.addEventListener('astro:after-swap', observe);
}
