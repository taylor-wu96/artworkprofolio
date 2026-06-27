// 機器視覺準星（觀看的機器 v3）：暗房專屬，跟隨游標、hover 作品時框選鎖定。
// 凝視/監視母題（Steyerl・Lozano-Hemmer・Paglen）＋ net-art 反應手勢。
import { onPage } from './lifecycle';

export function init() {
  const fine = window.matchMedia('(pointer: fine)').matches;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!fine || reduce) return; // 觸控/減少動態：不啟用

  const SEL = '.entry__plate, .work__cover, .gallery-item__media, .plates figure';
  const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const pos = { x: target.x, y: target.y };
  let el: HTMLElement | null = null;
  let lockEl: Element | null = null;
  let active = false;
  let raf = 0;

  const isDark = () =>
    document.documentElement.getAttribute('data-room') === 'dark';

  function ensureEl() {
    if (el && document.body.contains(el)) return;
    el = document.createElement('div');
    el.className = 'reticle';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML =
      '<i class="reticle__x"></i><i class="reticle__y"></i>' +
      '<b class="reticle__c tl"></b><b class="reticle__c tr"></b>' +
      '<b class="reticle__c bl"></b><b class="reticle__c br"></b>';
    document.body.appendChild(el);
  }

  function frame() {
    raf = requestAnimationFrame(frame);
    if (!el) return;
    if (lockEl && document.contains(lockEl)) {
      const r = (lockEl as HTMLElement).getBoundingClientRect();
      const pad = 8;
      el.style.width = r.width + pad * 2 + 'px';
      el.style.height = r.height + pad * 2 + 'px';
      el.style.transform =
        'translate3d(' + (r.left - pad) + 'px,' + (r.top - pad) + 'px,0)';
    } else {
      pos.x += (target.x - pos.x) * 0.25;
      pos.y += (target.y - pos.y) * 0.25;
      if (el.style.width !== '26px') {
        el.style.width = '26px';
        el.style.height = '26px';
      }
      el.style.transform =
        'translate3d(' + (pos.x - 13) + 'px,' + (pos.y - 13) + 'px,0)';
    }
  }

  document.addEventListener(
    'pointermove',
    (e) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!active && el && isDark()) {
        active = true;
        el.setAttribute('data-active', '');
      }
    },
    { passive: true }
  );
  document.addEventListener(
    'pointerover',
    (e) => {
      if (!el || !isDark()) return;
      const t = (e.target as Element)?.closest?.(SEL);
      if (t && t !== lockEl) {
        lockEl = t;
        el.setAttribute('data-lock', '');
        // 解耦：音景模組監聽此事件，鎖定瞬間發對焦音。
        document.dispatchEvent(new CustomEvent('reticle:lock'));
      }
    },
    { passive: true }
  );
  document.addEventListener(
    'pointerout',
    (e) => {
      if (!el) return;
      const t = (e.target as Element)?.closest?.(SEL);
      if (t) {
        lockEl = null;
        el.removeAttribute('data-lock');
      }
    },
    { passive: true }
  );
  window.addEventListener('blur', () => {
    active = false;
    lockEl = null;
    if (el) {
      el.removeAttribute('data-active');
      el.removeAttribute('data-lock');
    }
  });

  function sync() {
    if (isDark()) {
      ensureEl();
      if (!raf) raf = requestAnimationFrame(frame);
    } else if (el) {
      el.remove();
      el = null;
      lockEl = null;
      active = false;
    }
  }
  // pointer/blur 委派監聽在上方一次性綁定（撐過換頁）；每頁的暗/亮房同步走 onPage 契約。
  onPage(sync);
}
