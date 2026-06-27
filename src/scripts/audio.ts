// 克制音景（WebAudio・程序生成，無音檔）：暗房環境底噪＋準星鎖定音。
// 聲音＝綠的聽覺對等物：稀少、是「機器還活著」的訊號。預設關、絕不自動播放。
import { onPage } from './lifecycle';

export function init() {
  const KEY = 'sound-on';
  let ctx: AudioContext | null = null;
  let master: GainNode;
  let started = false;
  let enabled = false;
  try {
    enabled = localStorage.getItem(KEY) === '1';
  } catch (_) {}

  const isDark = () =>
    document.documentElement.getAttribute('data-room') === 'dark';

  function build() {
    const AC =
      (window as any).AudioContext || (window as any).webkitAudioContext;
    ctx = new AC();
    master = ctx!.createGain();
    master.gain.value = 0; // 起手靜默，依房間淡入
    master.connect(ctx!.destination);

    const filter = ctx!.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 300;
    filter.Q.value = 0.6;
    filter.connect(master);

    const bed = ctx!.createGain();
    bed.gain.value = 0.5;
    bed.connect(filter);

    // 低頻失諧堆疊＝美術館空間嗡鳴（Eliasson／Turrell room tone）
    const freqs = [55, 55.4, 82.5, 110.3];
    freqs.forEach((f, i) => {
      const o = ctx!.createOscillator();
      o.type = i % 2 ? 'sine' : 'triangle';
      o.frequency.value = f;
      const g = ctx!.createGain();
      g.gain.value = i === 0 ? 0.22 : 0.1;
      o.connect(g);
      g.connect(bed);
      o.start();
    });

    // 極慢 LFO 掃 filter＝呼吸（~20s 週期）
    const lfo = ctx!.createOscillator();
    lfo.frequency.value = 0.05;
    const lfoGain = ctx!.createGain();
    lfoGain.gain.value = 110;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    started = true;
  }

  function ramp() {
    if (!ctx) return;
    const t = ctx.currentTime;
    const tgt = enabled && isDark() ? 0.05 : 0; // 極輕；閱讀房靜默
    master.gain.cancelScheduledValues(t);
    master.gain.setTargetAtTime(tgt, t, 1.2); // 慢淡
  }

  function reflect() {
    document.querySelectorAll('.sound-toggle').forEach((b) => {
      b.setAttribute('aria-pressed', enabled ? 'true' : 'false');
      (b as HTMLElement).toggleAttribute('data-on', enabled);
    });
  }

  function enable() {
    enabled = true;
    try {
      localStorage.setItem(KEY, '1');
    } catch (_) {}
    if (!started) build();
    if (ctx && ctx.state === 'suspended') ctx.resume();
    ramp();
    reflect();
  }
  function disable() {
    enabled = false;
    try {
      localStorage.setItem(KEY, '0');
    } catch (_) {}
    ramp();
    reflect();
  }

  // 委派點擊（撐過 view transition swap）
  document.addEventListener('click', (e) => {
    const btn = (e.target as Element)?.closest?.('.sound-toggle');
    if (!btn) return;
    e.preventDefault();
    enabled ? disable() : enable();
  });

  // 準星鎖定音：對焦/快門式短 blip（唯一互動音效）
  document.addEventListener('reticle:lock', () => {
    if (!enabled || !ctx || ctx.state !== 'running') return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(820, t);
    o.frequency.exponentialRampToValueAtTime(1280, t + 0.04);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.05, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
    o.connect(g);
    g.connect(master);
    o.start(t);
    o.stop(t + 0.18);
  });

  // 房間切換：底噪暗房淡入／亮房淡出。每頁同步走 onPage 契約（reflect 開關鈕狀態 ＋ 依房間 ramp）。
  onPage(() => {
    reflect();
    ramp();
  });

  // 自動播放政策：預設不播；若曾啟用，待首次手勢再 resume。
  if (enabled) {
    const kick = () => {
      enable();
      window.removeEventListener('pointerdown', kick);
      window.removeEventListener('keydown', kick);
    };
    window.addEventListener('pointerdown', kick, { once: true });
    window.addEventListener('keydown', kick, { once: true });
  }
  reflect();
}
