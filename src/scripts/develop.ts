// 顯影：影像板載入完成才從模糊底浮現（含已快取的 complete 情況）。
export function init() {
  function develop() {
    document
      .querySelectorAll<HTMLImageElement>('img.plate__img:not(.is-loaded)')
      .forEach((img) => {
        if (img.complete && img.naturalWidth) {
          img.classList.add('is-loaded');
        } else {
          const done = () => img.classList.add('is-loaded');
          img.addEventListener('load', done, { once: true });
          img.addEventListener('error', done, { once: true });
        }
      });
  }
  develop();
  document.addEventListener('astro:page-load', develop);
}
