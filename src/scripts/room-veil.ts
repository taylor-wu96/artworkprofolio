// 光揭示房間轉場（Turrell）：暗↔亮切換時，以目標房間表面色覆蓋再淡出。
export function init() {
  const veil = document.getElementById('room-veil');
  if (!veil) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SURFACE: Record<'dark' | 'light', string> = { dark: '#0c0c0b', light: '#f4f4f2' };
  let pending: 'dark' | 'light' | null = null;

  document.addEventListener('astro:before-swap', (e: any) => {
    if (reduce) return;
    const from = document.documentElement.getAttribute('data-room') || 'light';
    const to = e.newDocument?.documentElement?.getAttribute('data-room') || 'light';
    if (from === to) return;
    pending = to as 'dark' | 'light';
    veil.style.background = SURFACE[pending] || SURFACE.light;
    veil.classList.toggle('is-light', pending === 'light');
    // 瞬間覆蓋（無過渡），把 DOM 交換藏在純色場後。
    veil.style.transition = 'none';
    veil.style.opacity = '1';
    // 強制 reflow 讓 opacity:1 立即生效，再恢復過渡供之後淡出。
    void veil.offsetWidth;
    veil.style.transition = '';
  });

  document.addEventListener('astro:after-swap', () => {
    if (!pending) return;
    pending = null;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        veil.classList.add('is-revealing');
        veil.style.opacity = '0';
      });
    });
  });

  veil.addEventListener('transitionend', () => {
    veil.classList.remove('is-revealing', 'is-light');
  });
}
