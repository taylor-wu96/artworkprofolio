// 互動作品載入器（Works Runtime・階段 J）。
//
// 引擎無關：只認 SketchModule 契約，不認 shader/R3F/p5。職責——
//   1. 掃 [data-sketch]，IntersectionObserver 進視口才動態下載＋掛載（重作品不拖慢首頁）。
//   2. 離屏 pause（省電省效能）；data-sketch-persist（如 hero）不暫停。
//   3. astro:before-swap 銷毀所有實例（釋放 WebGL context，杜絕 view-transition 洩漏）。
//   4. 維護全站捲動 ref，餵給作品（承接 Hero3D 捲動樂章語彙）。
// window.__sketchRuntime 暴露各實例狀態，供生命週期 eval 驗證（非表面：能量測暫停/銷毀）。

import { registry, resolveModule } from '../sketches/registry';
import type { SketchContext, SketchInstance } from '../sketches/types';

interface Tracked {
  host: HTMLElement;
  id: string;
  persist: boolean;
  io: IntersectionObserver;
  instance: SketchInstance | null;
  state: 'idle' | 'loading' | 'running' | 'paused' | 'error';
}

export function init() {
  const tracked = new Map<HTMLElement, Tracked>();

  // 全站捲動進度（0..1，以視窗高為尺）——所有作品共用，rAF 節流。
  const scroll = { current: 0 };
  let scrollRaf = 0;
  const updateScroll = () => {
    scrollRaf = 0;
    const vh = window.innerHeight || 1;
    scroll.current = Math.min(Math.max(window.scrollY / vh, 0), 1);
  };
  const onScroll = () => {
    if (!scrollRaf) scrollRaf = requestAnimationFrame(updateScroll);
  };
  updateScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function context(host: HTMLElement): SketchContext {
    let params: Record<string, unknown> = {};
    const raw = host.dataset.params;
    if (raw) {
      try {
        params = JSON.parse(raw);
      } catch {
        /* 容錯：壞 JSON 視為無參數 */
      }
    }
    return {
      reducedMotion,
      mobile: window.innerWidth < 768,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
      params,
      scroll,
    };
  }

  function expose() {
    (window as any).__sketchRuntime = [...tracked.values()].map((t) => ({
      id: t.id,
      state: t.state,
    }));
    // 把狀態反映到 host：CSS 據此在作品掛載後淡出封面 fallback。
    for (const t of tracked.values()) t.host.setAttribute('data-sketch-state', t.state);
  }

  async function mount(t: Tracked) {
    if (t.instance || t.state === 'loading') return;
    if (!registry[t.id]) {
      t.state = 'error';
      console.warn(`[sketches] 未登錄的作品 id：${t.id}`);
      expose();
      return;
    }
    t.state = 'loading';
    expose();
    try {
      const mod = resolveModule(await registry[t.id]());
      // 非同步下載期間 host 可能已被銷毀/移除：放棄掛載。
      if (!tracked.has(t.host) || !document.body.contains(t.host)) return;
      t.instance = mod.mount(t.host, context(t.host));
      t.state = 'running';
    } catch (err) {
      t.state = 'error';
      console.error(`[sketches] 作品 ${t.id} 掛載失敗：`, err);
    }
    expose();
  }

  function pause(t: Tracked) {
    if (t.instance && t.state === 'running') {
      t.instance.pause();
      t.state = 'paused';
      expose();
    }
  }
  function resume(t: Tracked) {
    if (t.instance && t.state === 'paused') {
      t.instance.resume();
      t.state = 'running';
      expose();
    } else if (!t.instance) {
      mount(t);
    }
  }

  function track(host: HTMLElement) {
    if (tracked.has(host)) return;
    const id = host.dataset.sketchId || '';
    const persist = host.hasAttribute('data-sketch-persist');
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const rec = tracked.get(host);
          if (!rec) continue;
          if (e.isIntersecting) resume(rec);
          else if (!rec.persist) pause(rec);
        }
      },
      { rootMargin: '120px' }
    );
    const rec: Tracked = { host, id, persist, io, instance: null, state: 'idle' };
    tracked.set(host, rec);
    io.observe(host);
    expose();
  }

  function teardownAll() {
    for (const t of tracked.values()) {
      t.io.disconnect();
      if (t.instance) {
        try {
          t.instance.destroy();
        } catch (err) {
          console.warn(`[sketches] 作品 ${t.id} 銷毀時出錯：`, err);
        }
      }
    }
    tracked.clear();
    expose();
  }

  function scan() {
    document.querySelectorAll<HTMLElement>('[data-sketch]').forEach(track);
  }

  scan();
  // view-transition：換頁前銷毀（釋放資源），換頁後重掃新頁作品。
  document.addEventListener('astro:before-swap', teardownAll);
  document.addEventListener('astro:page-load', scan);
}
