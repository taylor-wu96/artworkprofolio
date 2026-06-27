// 閱讀進度：追蹤 [data-read-progress] 文章捲動，綠色填充（亮房長文）。
import { onPage } from './lifecycle';

export function init() {
  // 模組級 handler 參照：重綁前先移除上一頁的，避免換頁累積 window 監聽（洩漏）。
  let onScroll: (() => void) | null = null;

  function bindReadProgress() {
    if (onScroll) {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      onScroll = null;
    }
    const fill = document.querySelector<HTMLElement>('.read-progress > span');
    const article = document.querySelector<HTMLElement>('[data-read-progress]');
    if (!fill) return;
    if (!article) {
      fill.style.width = '0';
      return;
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const start = article.offsetTop;
      const span = article.offsetHeight - window.innerHeight;
      const p = span > 0 ? (window.scrollY - start) / span : 0;
      fill.style.width = `${Math.min(Math.max(p, 0), 1) * 100}%`;
    };
    onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
  }
  onPage(bindReadProgress);
}
