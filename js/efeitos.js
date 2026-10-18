// Efeitos cinematográficos da página pública do evento (evento.html):
// abertura "A muralha cai" com som e vibração, título que cai letra a letra,
// brasas, entrada suave das seções e botão fixo de inscrição.
// Sem bibliotecas: Web Animations API + Web Audio API (sons sintetizados) + Vibration API.
const reduz = matchMedia("(prefers-reduced-motion: reduce)").matches;
const CHAVE = "evento-intro-vista";

/* ============================== SOM E VIBRAÇÃO ============================== */
let ctx = null, master = null, mudo = false;

function audio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = mudo ? 0 : 1;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}
const vibra = (padrao) => { if (!mudo && navigator.vibrate) try { navigator.vibrate(padrao); } catch { /* sem suporte */ } };
const rand = (a, b) => a + Math.random() * (b - a);

function envelope(vol, dur, atraso) {
  const t = ctx.currentTime + atraso;
  const g = ctx.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  g.connect(master);
  return { g, t };
}
// ruído filtrado (estalos, estrondo, pedras)
function rajada({ tipo, freq, dur, vol, atraso = 0, q = 1 }) {
  if (!audio()) return;
  const n = Math.ceil(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, n, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const f = ctx.createBiquadFilter();
  f.type = tipo; f.frequency.value = freq; f.Q.value = q;
  const { g, t } = envelope(vol, dur, atraso);
  src.connect(f); f.connect(g);
  src.start(t);
}
// nota/oscilador (grave do estrondo, brilho)
function tom({ tipo = "sine", f0, f1 = f0, dur, vol, atraso = 0 }) {
  if (!audio()) return;
  const o = ctx.createOscillator();
  o.type = tipo;
  const { g, t } = envelope(vol, dur, atraso);
  o.frequency.setValueAtTime(f0, t);
  if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  o.connect(g);
  o.start(t); o.stop(t + dur + 0.05);
}

function somEstalos() {
  rajada({ tipo: "lowpass", freq: 180, dur: 1.1, vol: 0.9 });
  for (let i = 0; i < 6; i++) rajada({ tipo: "bandpass", freq: rand(2500, 4500), dur: 0.08, vol: 0.5, atraso: 0.1 + rand(0, 0.8), q: 2 });
}
function somEstrondo() {
  tom({ f0: 110, f1: 30, dur: 1.4, vol: 0.9 });
  rajada({ tipo: "lowpass", freq: 400, dur: 2.2, vol: 0.8 });
  rajada({ tipo: "lowpass", freq: 900, dur: 1.2, vol: 0.35 });
  for (let i = 0; i < 18; i++) rajada({ tipo: "bandpass", freq: rand(1200, 4200), dur: 0.07, vol: 0.35, atraso: rand(0, 1.6), q: 2 });
}
function somBrilho() {
  [523, 659, 784, 1046].forEach((f, i) => tom({ tipo: "triangle", f0: f, dur: 0.5, vol: 0.18, atraso: i * 0.08 }));
}
// chamado quando a inscrição é concluída
export function somSucesso() {
  somBrilho();
  vibra([60, 40, 60, 40, 200]);
}

/* ============================== BOTÃO DE SOM ============================== */
function botaoSom() {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "e-som";
  b.setAttribute("aria-label", "Ligar ou desligar o som");
  b.textContent = "🔊";
  b.addEventListener("click", () => {
    mudo = !mudo;
    b.textContent = mudo ? "🔇" : "🔊";
    if (master) master.gain.value = mudo ? 0 : 1;
    if (mudo && navigator.vibrate) navigator.vibrate(0);
  });
  document.body.appendChild(b);
}

/* ============================== ABERTURA: A MURALHA CAI ============================== */
const SVG = "http://www.w3.org/2000/svg";
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

function montarMuralha(wall) {
  const W = innerWidth, H = innerHeight, mobile = W < 700;
  const bw = mobile ? 64 : 110, bh = mobile ? 36 : 54;
  wall.style.setProperty("--bw", bw + "px");
  wall.style.setProperty("--bh", bh + "px");
  const linhas = Math.ceil(H / bh) + 1, colunas = Math.ceil(W / bw) + 1;
  const frag = document.createDocumentFragment();
  const tijolos = [];
  for (let r = 0; r < linhas; r++) {
    const desloc = r % 2 ? -bw / 2 : 0;
    for (let c = 0; c <= colunas; c++) {
      const el = document.createElement("i");
      const x = c * bw + desloc, y = r * bh;
      el.style.transform = `translate(${x}px,${y}px)`;
      frag.appendChild(el);
      tijolos.push({ el, x, y, cx: x + bw / 2, cy: y + bh / 2 });
    }
  }
  wall.appendChild(frag);
  return { tijolos, W, H };
}

// seis rachaduras que partem do centro (coordenadas em % da tela)
function montarRachaduras(W, H) {
  const svg = document.createElementNS(SVG, "svg");
  svg.setAttribute("class", "e-cracks");
  svg.setAttribute("width", W); svg.setAttribute("height", H);
  const px = (x, y) => `${(x / 100) * W} ${(y / 100) * H}`;
  const rotas = [
    [[50, 45], [38, 30], [30, 20], [14, 8], [8, 4]],
    [[50, 45], [62, 28], [70, 22], [84, 12], [92, 8]],
    [[50, 45], [36, 52], [24, 56], [12, 62], [4, 60]],
    [[50, 45], [64, 54], [76, 60], [88, 68], [96, 72]],
    [[50, 45], [44, 62], [40, 76], [33, 88], [30, 99]],
    [[50, 45], [57, 64], [62, 78], [69, 90], [72, 98]],
  ];
  return {
    svg,
    linhas: rotas.map((rota) => {
      const p = document.createElementNS(SVG, "path");
      p.setAttribute("d", "M" + rota.map(([x, y]) => px(x, y)).join(" L"));
      p.setAttribute("pathLength", "1");
      p.style.strokeDasharray = "1";
      p.style.strokeDashoffset = "1";
      svg.appendChild(p);
      return p;
    }),
  };
}

function abertura(aoTitulo) {
  return new Promise((resolve) => {
    const ov = document.createElement("div");
    ov.className = "e-intro";
    ov.innerHTML = `<div class="e-wall"></div><div class="e-luz"></div>
      <div class="e-gate"><p class="e-gate-t">A muralha<br />vai cair</p>
        <button type="button" class="e-gate-b"><span>Toque para<br />entrar</span></button>
        <p class="e-gate-c">🔊 ative o som · 📳 sinta a vibração</p></div>`;
    document.body.appendChild(ov);
    document.documentElement.style.overflow = "hidden";

    const wall = ov.querySelector(".e-wall"), luz = ov.querySelector(".e-luz"), gate = ov.querySelector(".e-gate");
    const { tijolos, W, H } = montarMuralha(wall);
    const { svg, linhas } = montarRachaduras(W, H);
    ov.insertBefore(svg, luz);

    const alvo = document.getElementById("evento");
    const tremer = (el) => el.animate(
      [{ translate: "0 0" }, { translate: "-5px 3px" }, { translate: "5px -3px" }, { translate: "0 0" }],
      { duration: 120, iterations: 5 });

    ov.querySelector(".e-gate-b").addEventListener("click", async () => {
      audio();                                   // o toque libera áudio e vibração no navegador
      gate.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 350, fill: "forwards" });

      await esperar(300);                        // t 0,3s · rachaduras
      somEstalos();
      vibra([30, 40, 30, 40, 60, 40, 30]);
      linhas.forEach((p, i) => p.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }],
        { duration: 900, delay: i * 50, easing: "cubic-bezier(.22,.61,.36,1)", fill: "forwards" }));

      await esperar(800);                        // t 1,1s · a tela treme
      tremer(ov); if (alvo) tremer(alvo);
      vibra(250);

      await esperar(150);                        // t 1,25s · luz e queda dos tijolos
      svg.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: "forwards" });
      luz.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1200, fill: "forwards" });
      somEstrondo();
      vibra([400, 60, 200, 60, 150, 60, 100, 60, 60]);
      const mx = W / 2, my = H * 0.45;
      tijolos.forEach((t) => {
        const dist = Math.hypot(t.cx - mx, t.cy - my);
        const dx = (t.cx - mx) * 0.5 + rand(-60, 60);
        const dy = H + rand(200, 500);
        const rot = rand(-80, 80);
        t.el.animate([
          { transform: `translate(${t.x}px,${t.y}px) rotate(0deg)`, opacity: 1 },
          { transform: `translate(${t.x + dx}px,${t.y + dy}px) rotate(${rot}deg)`, opacity: 0.2 },
        ], { duration: 1400, delay: dist * 1.1 + rand(0, 120), easing: "cubic-bezier(.55,.085,.68,.53)", fill: "forwards" });
      });

      await esperar(1050);                       // t 2,3s · entra o título
      aoTitulo();
      somBrilho();
      vibra([20, 30, 20]);

      await esperar(500);                        // t 2,8s · a abertura some
      ov.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 800, fill: "forwards" });
      await esperar(800);
      ov.remove();
      document.documentElement.style.overflow = "";
      try { sessionStorage.setItem(CHAVE, "1"); } catch { /* modo privado */ }
      resolve();
    }, { once: true });
  });
}

/* ============================== TÍTULO: LETRAS QUE CAEM ============================== */
// Divide o <h1> em palavras (que nunca quebram no meio) e letras. Retorna a função que dispara a queda.
function prepararTitulo(root) {
  const h1 = root.querySelector(".e-hero h1");
  if (!h1) return () => {};
  const letras = [];
  let linha = 0, n = 0;
  const novo = document.createDocumentFragment();
  h1.childNodes.forEach((no) => {
    if (no.nodeName === "BR") { linha++; n = 0; novo.appendChild(no.cloneNode()); return; }
    String(no.textContent).split(/(\s+)/).forEach((parte) => {
      if (!parte) return;
      if (/^\s+$/.test(parte)) { novo.appendChild(document.createTextNode(" ")); return; }
      const pal = document.createElement("span");
      pal.className = "pal";
      [...parte].forEach((ch) => {
        const l = document.createElement("span");
        l.className = "letra";
        l.textContent = ch;
        l.style.opacity = "0";
        pal.appendChild(l);
        letras.push({ el: l, atraso: linha * 500 + n * 60 });
        n++;
      });
      novo.appendChild(pal);
    });
  });
  h1.setAttribute("aria-label", h1.textContent.replace(/\s+/g, " ").trim());
  h1.replaceChildren(novo);
  h1.classList.add("com-letras");
  return () => letras.forEach(({ el, atraso }) => {
    const a = el.animate([
      { opacity: 0, transform: "translateY(-120px) rotate(-14deg)", filter: "blur(8px)" },
      { opacity: 1, transform: "none", filter: "blur(0)" },
    ], { duration: 750, delay: atraso, easing: "cubic-bezier(.34,1.56,.64,1)", fill: "backwards" });
    el.style.opacity = "1";                      // com fill "backwards" a letra fica invisível durante o atraso
    a.onfinish = () => a.cancel();
  });
}

/* ============================== BRASAS E RUÍNAS NO HERO ============================== */
function decorarHero(root) {
  const hero = root.querySelector(".e-hero");
  if (!hero) return;
  const fx = document.createElement("div");
  fx.className = "e-fx";
  fx.setAttribute("aria-hidden", "true");
  const pontos = reduz ? 0 : 28;
  for (let i = 0; i < pontos; i++) {
    const b = document.createElement("i");
    const t = rand(2, 4);
    b.style.cssText = `left:${rand(0, 100)}%;width:${t}px;height:${t}px;--dx:${rand(-40, 40)}px;animation-duration:${rand(5, 12)}s;animation-delay:${-rand(0, 12)}s`;
    fx.appendChild(b);
  }
  fx.insertAdjacentHTML("beforeend", `<svg class="ruinas" viewBox="0 0 1200 90" preserveAspectRatio="none"><path fill="#0a0806" d="M0 90V58h38V40h26v18h30V34h28V16h22v18h24v26h40V46h30V30h24v16h34v22h46V50h24V26h26v24h40V62h60V44h28V28h22v16h30v20h50V52h26V36h24v16h36v24h60V54h30V38h24V22h26v16h22v22h46V48h28V30h24v18h38v26h54V60h26V42h26v18h48V90z"/></svg>`);
  hero.appendChild(fx);
}

/* ============================== ENTRADA SUAVE DAS SEÇÕES ============================== */
function revelarAoRolar(root) {
  if (reduz || !("IntersectionObserver" in window)) return;
  const io = new IntersectionObserver((itens) => itens.forEach((i) => {
    if (!i.isIntersecting) return;
    i.target.classList.add("rv-in");
    io.unobserve(i.target);
  }), { threshold: 0.12 });
  root.querySelectorAll(".e-sec").forEach((sec) => {
    [...sec.querySelector(".e-wrap").children].forEach((el, k) => {
      el.classList.add("rv");
      el.style.transitionDelay = k * 80 + "ms";
      io.observe(el);
    });
  });
}

/* ============================== BOTÃO FIXO DE INSCRIÇÃO ============================== */
// Aparece depois do hero e some quando o formulário está na tela.
function botaoFixo(root, ev) {
  if (!root.querySelector("[data-reg]") || !("IntersectionObserver" in window)) return () => {};
  const hero = root.querySelector(".e-hero"), form = root.querySelector("[data-reg-slot]");
  const a = document.createElement("a");
  a.className = "e-cta";
  a.href = "#ev-insc";
  a.textContent = "Garantir minha vaga" + (ev.valor ? " · " + ev.valor : "");
  document.body.appendChild(a);
  const vis = { hero: true, form: false };
  let liberado = false;
  const atualizar = () => a.classList.toggle("on", liberado && !vis.hero && !vis.form);
  const io = new IntersectionObserver((itens) => itens.forEach((i) => {
    vis[i.target === hero ? "hero" : "form"] = i.isIntersecting;
    atualizar();
  }));
  io.observe(hero); io.observe(form);
  return () => { liberado = true; atualizar(); };
}

/* ============================== ENTRADA ============================== */
// Liga todos os efeitos. A promessa resolve quando a abertura termina (ou já de cara, se for pulada).
export function iniciarEfeitos(root, ev) {
  botaoSom();
  decorarHero(root);
  const titulo = reduz ? () => {} : prepararTitulo(root);
  revelarAoRolar(root);
  const liberarCta = botaoFixo(root, ev);

  let vista = false;
  try { vista = sessionStorage.getItem(CHAVE) === "1"; } catch { /* modo privado */ }
  if (reduz || vista) {
    titulo();
    liberarCta();
    return Promise.resolve();
  }
  return abertura(titulo).then(liberarCta);
}
