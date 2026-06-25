// drift-light — 原生 WebGL fragment shader 光場（階段 J 首發引擎範本）。
//
// 母題承接 DESIGN：灰階 FBM 噪聲光帶緩慢漂移＝光在暗室裡游移；一粒地衣綠慢脈動
// ＝唯一還活著的訊號；隨捲動（u_scroll）整體消融＝衰敗。無任何外部依賴——
// 「一台觀看光的精密儀器」用最底層的 GPU 像素自己畫光，不靠框架。
//
// 這是作者可複製的範本：複製本檔、改 fragment shader，於 registry 加一行、Studio 建一筆，
// 即成一件新的生成式作品。實作 SketchModule 契約（src/sketches/types.ts）。

import type { SketchModule, SketchContext, SketchInstance } from './types';

const VERT = `
attribute vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }
`;

// 灰階漂移光場 ＋ 一粒綠 ＋ 隨捲動消融。低成本 FBM（4 階）。
const FRAG = `
precision highp float;
uniform vec2  u_res;
uniform float u_time;
uniform float u_scroll;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  float a = hash(i), b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.02; a *= 0.5; }
  return v;
}

void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  float t = u_time * 0.06;

  // 漂移的光帶：噪聲場緩慢平移、起伏。
  vec2 q = uv * 1.6 + vec2(t * 0.4, -t * 0.25);
  float light = fbm(q + fbm(q * 0.7 + t));
  light = pow(smoothstep(0.18, 0.92, light), 1.5);
  // 中央略亮的光核（暗室裡的投影感）。
  light *= 1.0 - 0.45 * length(uv * vec2(0.7, 1.0));

  vec3 col = vec3(light) * 1.15; // 灰階光（克制但可讀）

  // 一粒地衣綠：在光海某處慢脈動的活訊號（DESIGN：唯一還活著的東西）。
  vec2 gp = vec2(sin(u_time * 0.11) * 0.3, cos(u_time * 0.08) * 0.18);
  float gd = length(uv - gp);
  float pulse = 0.6 + 0.4 * sin(u_time * 0.5);
  vec3 life = vec3(0.576, 0.643, 0.498); // --life-dark #93a47f
  col += life * smoothstep(0.16, 0.0, gd) * pulse * 0.9;

  // 隨捲動消融進暗房共用的黑（衰敗母題；承接 Hero3D 第二樂章）。
  col *= clamp(1.0 - u_scroll * 1.1, 0.0, 1.0);

  gl_FragColor = vec4(col, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(sh);
    gl.deleteShader(sh);
    throw new Error('[drift-light] shader 編譯失敗：' + log);
  }
  return sh;
}

export const sketch: SketchModule = {
  mount(host: HTMLElement, ctx: SketchContext): SketchInstance {
    const canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    host.appendChild(canvas);

    const gl = canvas.getContext('webgl', { alpha: false, antialias: true, depth: false });
    if (!gl) throw new Error('[drift-light] 無法取得 WebGL context');

    const prog = gl.createProgram()!;
    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    // 全螢幕三角形。
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, 'u_res');
    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uScroll = gl.getUniformLocation(prog, 'u_scroll');

    // 隨全站捲動消融＝hero 專屬語彙（捲過即淡出）。inline / 詳情頁作品在頁面中段，
    // 全站捲動進度恆為 1 會整片變黑，故預設關閉；需要時以 params.dissolve 開啟。
    const dissolve = ctx.params.dissolve === true;
    const dpr = Math.min(ctx.dpr, ctx.mobile ? 1.5 : 2);
    function resize() {
      const w = Math.max(1, Math.round(host.clientWidth * dpr));
      const h = Math.max(1, Math.round(host.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl!.viewport(0, 0, w, h);
      }
    }
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();

    let raf = 0;
    let running = false;
    const t0 = performance.now();

    function draw(now: number) {
      // reduced-motion：時間凍結，呈現單一靜態光場（仍隨捲動消融）。
      const time = ctx.reducedMotion ? 8.0 : (now - t0) / 1000;
      gl!.uniform2f(uRes, canvas.width, canvas.height);
      gl!.uniform1f(uTime, time);
      gl!.uniform1f(uScroll, dissolve ? ctx.scroll.current : 0);
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);
      // 除錯計數器：供生命週期 eval 驗證「離屏暫停＝不再遞增」。
      (window as any).__driftFrames = ((window as any).__driftFrames || 0) + 1;
    }

    function loop(now: number) {
      if (!running) return;
      draw(now);
      // reduced-motion 只需一幀靜態畫面（隨捲動更新交給 resume/scroll 也行，但此處保持極簡）。
      if (ctx.reducedMotion) {
        running = false;
        return;
      }
      raf = requestAnimationFrame(loop);
    }

    function start() {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(loop);
    }
    start();

    return {
      pause() {
        running = false;
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
      },
      resume() {
        start();
      },
      destroy() {
        running = false;
        if (raf) cancelAnimationFrame(raf);
        ro.disconnect();
        // 釋放 GPU 資源、強制丟棄 context，杜絕 view-transition 累積洩漏。
        gl!.deleteProgram(prog);
        gl!.deleteShader(vs);
        gl!.deleteShader(fs);
        gl!.deleteBuffer(buf);
        const ext = gl!.getExtension('WEBGL_lose_context');
        if (ext) ext.loseContext();
        canvas.remove();
      },
    };
  },
};

export default sketch;
