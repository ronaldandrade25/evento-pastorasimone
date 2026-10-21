// Monta o site de um evento a partir dos dados do Firestore.
// É o MESMO código na página pública (evento.html) e na prévia do celular no Superadmin,
// então o que a Pastora vê no editor é exatamente o que vai ao ar.
import { esc, extractYoutubeId } from "./comum.js";
import { googleAgendaUrl } from "./ingresso.js";

export const LOGO = "img/logo-simone.png";

// Evento em branco (botão "+ Novo evento")
export const EVENTO_PADRAO = {
  nome: "Novo evento",
  chamada: "Entre no *Grupo VIP*",
  slug: "novo-evento",
  status: "rascunho",
  data: "", hora: "19:00",
  frase: "",
  corFundo: "#1a1510", corOuro: "#e0b25a", corDestaque: "#25d366",
  banner: "", arte: "", qrCode: "",
  videoUrl: "", videoAuto: true,
  sobre: "",
  versiculo: "", referencia: "",
  ministra: "Pastora Simone",
  ministraDesc: "Professora e pastora, dedicada ao ensino da Palavra e à formação de mulheres e líderes.",
  depoimentos: [],
  local: "", endereco: "", cidade: "",
  vagas: 100, valor: "Entrada gratuita",
  campos: { email: false, cidade: true, igreja: true },
  pagamento: { pix: false, cartao: false, boleto: false, dinheiro: false, info: "" },
  grupoVip: "", mostrarQr: false,
  inscritos: 0,
};

export const FORMAS_PAGAMENTO = { pix: "Pix", cartao: "Cartão", boleto: "Boleto", dinheiro: "Dinheiro" };
export const formasAceitas = (ev) => Object.keys(FORMAS_PAGAMENTO).filter((k) => ev.pagamento?.[k]).map((k) => FORMAS_PAGAMENTO[k]);

// Primeiro evento, feito a partir da arte de divulgação.
// Data, local, vagas, vídeo e depoimentos são de EXEMPLO: a Pastora troca no painel.
export const EVENTO_FORTALEZAS = {
  ...EVENTO_PADRAO,
  nome: "Derrubando as Fortalezas",
  slug: "derrubando-as-fortalezas",
  chamada: "Entre no *Grupo VIP*",
  data: "2026-11-21", hora: "19:00",
  frase: "Algumas fortalezas não caem com força. Caem quando descobrimos o segredo.",
  corFundo: "#1a1510", corOuro: "#e0b25a", corDestaque: "#25d366",
  banner: "img/eventos/derrubando-banner.jpg",
  arte: "img/eventos/derrubando-arte.jpg",
  qrCode: "img/eventos/derrubando-qr.png",
  videoUrl: "", videoAuto: true,
  sobre: "Uma noite de ministração da Palavra com a Pastora Simone sobre as batalhas que travamos na mente, na família e na fé.\n\nAssim como as muralhas de Jericó caíram pela obediência e não pela força, vamos aprender a identificar as fortalezas que nos prendem e a vencê-las com as armas que Deus nos deu: a Palavra, a oração e a fé.",
  versiculo: "Porque as armas da nossa milícia não são carnais, mas sim poderosas em Deus, para destruição das fortalezas.",
  referencia: "2 Coríntios 10:4",
  depoimentos: [
    { nome: "Luciana M. (exemplo)", texto: "Saí da última ministração com uma direção clara para a minha família. Foi uma noite que marcou minha vida." },
    { nome: "Sandra R. (exemplo)", texto: "A Pastora Simone fala com autoridade e com carinho. Entendi coisas na Palavra que eu lia havia anos." },
    { nome: "Cristiane A. (exemplo)", texto: "Levei minha mãe e minha filha. Três gerações saindo transformadas da mesma noite." },
  ],
  local: "Templo Sede (troque pelo local)", endereco: "Rua Exemplo, 123 · Centro", cidade: "Sua cidade · UF",
  vagas: 300, valor: "Entrada gratuita",
  campos: { email: false, cidade: true, igreja: true },
  grupoVip: "", mostrarQr: true,
};

export const TEMAS = [
  { nome: "Fortaleza (ouro)", corFundo: "#1a1510", corOuro: "#e0b25a", corDestaque: "#25d366" },
  { nome: "Noite azul", corFundo: "#0f1424", corOuro: "#d9b56a", corDestaque: "#7cc4ff" },
  { nome: "Mulheres (rosé)", corFundo: "#1e0f14", corOuro: "#e7a3b4", corDestaque: "#f4c14d" },
];

const ICONE_WA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.5-3.9-4.7-4.1-.1-.2-1.1-1.5-1.1-2.8 0-1.3.7-2 1-2.3.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6c-.1.2-.3.3-.1.6.2.3.7 1.2 1.5 1.9 1 .9 1.9 1.2 2.2 1.3.3.1.4.1.6-.1l.8-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.8-.2 1.6z"/></svg>';
const ICONE_PLAY = '<svg viewBox="0 0 10 12" aria-hidden="true"><path d="M0 0l10 6-10 6z"/></svg>';

const corOk = (v, padrao) => (/^#[0-9a-f]{6}$/i.test(v || "") ? v : padrao);
export const urlSegura = (u) => (/^https:\/\//i.test(String(u || "").trim()) ? String(u).trim() : "");
// Imagem: caminho do próprio site (img/...) ou data URL gerado no painel
const imgSegura = (u) => (/^(data:image\/|img\/|https:\/\/)/i.test(String(u || "")) ? String(u) : "");

export function dataLonga(ev) {
  const [y, m, d] = String(ev.data || "").split("-").map(Number);
  if (!y) return "Data a definir";
  return new Date(y, m - 1, d).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}
export const dataCurta = (ev) => (ev.data ? ev.data.split("-").reverse().join("/") : "—");
export const vagasRestantes = (ev) => Math.max(0, (Number(ev.vagas) || 0) - (Number(ev.inscritos) || 0));
export const mapsUrl = (ev) =>
  "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent([ev.local, ev.endereco, ev.cidade].filter(Boolean).join(", "));
export const youtubeId = (ev) => extractYoutubeId(ev.videoUrl);

const chamadaHtml = (ev) => esc(ev.chamada).replace(/\*(.+?)\*/g, "<em>$1</em>");
function tituloHtml(ev) {
  const p = String(ev.nome || "").trim().split(/\s+/);
  return p.length > 1 ? `${esc(p[0])}<br />${esc(p.slice(1).join(" "))}` : esc(ev.nome);
}

function formularioHtml(ev, pre) {
  if (ev.status === "encerrado") return `<div class="e-esgotado"><h3>Inscrições encerradas</h3><p>Obrigado pelo interesse. Fique de olho nos próximos eventos.</p></div>`;
  if (vagasRestantes(ev) <= 0) return `<div class="e-esgotado"><h3>Vagas esgotadas</h3><p>Todas as vagas foram preenchidas.</p></div>`;
  const c = ev.campos || {};
  return `<form class="e-form" data-reg novalidate>
    <label>Nome completo<input type="text" id="${pre}-nome" name="nome" required maxlength="120" autocomplete="name" placeholder="Seu nome" /></label>
    <label>WhatsApp<input type="tel" id="${pre}-whatsapp" name="whatsapp" required maxlength="20" autocomplete="tel" placeholder="(11) 9 0000-0000" /></label>
    ${c.email ? `<label>E-mail<input type="email" id="${pre}-email" name="email" maxlength="120" autocomplete="email" placeholder="voce@email.com" /></label>` : ""}
    ${c.cidade ? `<label>Cidade<input type="text" id="${pre}-cidade" name="cidade" maxlength="120" placeholder="Onde você mora" /></label>` : ""}
    ${c.igreja ? `<label>Igreja<input type="text" id="${pre}-igreja" name="igreja" maxlength="120" placeholder="Igreja que frequenta" /></label>` : ""}
    ${formasAceitas(ev).length ? `<label>Forma de pagamento<select id="${pre}-pagamento" name="formaPagamento" required><option value="">Escolha como vai pagar</option>${formasAceitas(ev).map((f) => `<option value="${esc(f)}">${esc(f)}</option>`).join("")}</select></label>` : ""}
    <p class="err" aria-live="polite"></p>
    <button class="e-btn" type="submit">Confirmar inscrição</button>
  </form>`;
}

// root: elemento .event-site · ev: dados do evento
// opcoes: { prefixo, onVideo(), onInscrever(dados) -> Promise<string|""> (mensagem de erro ou vazio) }
export function renderEvento(root, ev, opcoes = {}) {
  const pre = opcoes.prefixo || "ev";
  const ocup = Math.min(100, Math.round(((Number(ev.inscritos) || 0) / Math.max(1, Number(ev.vagas) || 1)) * 100));
  root.style.setProperty("--e-bg", corOk(ev.corFundo, "#1a1510"));
  root.style.setProperty("--e-gold", corOk(ev.corOuro, "#e0b25a"));
  root.style.setProperty("--e-accent", corOk(ev.corDestaque, "#25d366"));
  const banner = imgSegura(ev.banner), arte = imgSegura(ev.arte) || banner;
  const temVideo = !!youtubeId(ev);
  const depo = (ev.depoimentos || []).filter((d) => d.nome || d.texto);

  root.innerHTML = `
  <header class="e-top">
    <span class="lg"><img src="${LOGO}" alt="" /><span>Pastora Simone</span></span>
    <nav><a href="#${pre}-sobre">Sobre</a>${depo.length ? `<a href="#${pre}-depo">Depoimentos</a>` : ""}<a href="#${pre}-local">Local</a></nav>
    <a class="e-btn" href="#${pre}-insc" style="padding:10px 16px">Inscrever-me</a>
  </header>
  <section class="e-hero">
    <div class="pic" ${banner ? `style="background-image:url('${esc(banner)}')"` : ""} role="img" aria-label="Banner do evento"></div>
    <div class="title">
      <h1 class="gold">${tituloHtml(ev)}</h1>
      <div class="rule"><i></i><b></b></div>
      ${ev.chamada ? `<p class="call">${chamadaHtml(ev)}</p>` : ""}
      <div class="when"><span>${esc(dataLonga(ev))}</span>${ev.hora ? `<span>${esc(ev.hora)}h</span>` : ""}${ev.valor ? `<span>${esc(ev.valor)}</span>` : ""}</div>
      <div class="acts"><a class="e-btn" href="#${pre}-insc">Quero me inscrever</a>${temVideo ? `<button class="e-btn ghost" type="button" data-ev-video>${ICONE_PLAY.replace("<svg", '<svg style="width:12px"')} Assistir convite</button>` : ""}</div>
    </div>
    ${ev.frase ? `<p class="e-quote">“${esc(ev.frase)}”</p>` : ""}
  </section>
  ${ev.data ? `<div class="e-count"><div class="e-wrap"><span class="lbl">Faltam</span><div class="nums" data-count></div></div></div>` : ""}
  ${temVideo ? `<section class="e-sec alt"><div class="e-wrap">
    <div class="e-head c"><span class="e-eyebrow">Convite</span><h2 class="gold">Assista ao convite</h2></div>
    <button class="e-video" type="button" data-ev-video ${arte ? `style="background-image:url('${esc(arte)}')"` : ""}><span class="pl">${ICONE_PLAY}</span><span class="cap">YouTube</span></button>
  </div></section>` : ""}
  <section class="e-sec" id="${pre}-sobre"><div class="e-wrap e-about">
    <div class="txt"><span class="e-eyebrow">Sobre o evento</span><h2 class="gold" style="font-size:clamp(1.6rem,4cqi,2.5rem)">${esc(ev.nome)}</h2>
      ${ev.sobre ? `<p>${esc(ev.sobre)}</p>` : ""}
      ${ev.versiculo ? `<blockquote>“${esc(ev.versiculo)}”${ev.referencia ? `<cite>${esc(ev.referencia)}</cite>` : ""}</blockquote>` : ""}</div>
    <div class="e-who"><img src="${LOGO}" alt="" /><span class="e-eyebrow">Ministração</span><h3>${esc(ev.ministra)}</h3>${ev.ministraDesc ? `<p>${esc(ev.ministraDesc)}</p>` : ""}</div>
  </div></section>
  ${depo.length ? `<section class="e-sec alt" id="${pre}-depo"><div class="e-wrap">
    <div class="e-head c"><span class="e-eyebrow">Depoimentos</span><h2 class="gold">Quem já esteve com a gente</h2></div>
    <div class="e-testis">${depo.map((d) => `<div class="e-testi"><span class="st">★★★★★</span><blockquote>${esc(d.texto)}</blockquote><cite>${esc(d.nome)}</cite></div>`).join("")}</div>
  </div></section>` : ""}
  <section class="e-sec" id="${pre}-local"><div class="e-wrap">
    <div class="e-head"><span class="e-eyebrow">Localização</span><h2 class="gold">Onde vai ser</h2></div>
    <div class="e-loc"><div class="e-map" role="img" aria-label="Mapa"><span class="pin"></span></div>
      <div class="info"><dl>
        <div><dt>Local</dt><dd>${esc(ev.local || "A definir")}</dd></div>
        ${ev.endereco || ev.cidade ? `<div><dt>Endereço</dt><dd>${esc(ev.endereco)}${ev.endereco && ev.cidade ? "<br />" : ""}${esc(ev.cidade)}</dd></div>` : ""}
        <div><dt>Quando</dt><dd>${esc(dataLonga(ev))}${ev.hora ? `, às ${esc(ev.hora)}h` : ""}</dd></div></dl>
      ${ev.local || ev.endereco ? `<div><a class="e-btn ghost" href="${mapsUrl(ev)}" target="_blank" rel="noopener">Como chegar</a></div>` : ""}</div>
    </div>
  </div></section>
  <section class="e-sec alt" id="${pre}-insc"><div class="e-wrap e-reg">
    <div class="side-info"><span class="e-eyebrow">Inscrição</span><h2 class="gold" style="font-size:clamp(1.6rem,4cqi,2.5rem)">Garanta sua vaga</h2>
      <p style="margin:0">${ev.valor ? esc(ev.valor) + ". " : ""}As vagas são limitadas e a inscrição leva menos de um minuto.</p>
      ${formasAceitas(ev).length ? `<p style="margin:0"><span class="e-eyebrow">Formas de pagamento</span><br />${formasAceitas(ev).map((f) => `<span class="e-pag">${f}</span>`).join("")}</p>${ev.pagamento?.info ? `<p style="margin:0;font-size:.86rem;white-space:pre-line">${esc(ev.pagamento.info)}</p>` : ""}` : ""}
      <div class="e-bar"><i data-insc-barra style="width:${ocup}%"></i></div>
      <p style="margin:0;font-size:.86rem"><b style="color:var(--e-text)" data-insc-n>${Number(ev.inscritos) || 0}</b> de ${Number(ev.vagas) || 0} vagas preenchidas</p></div>
    <div data-reg-slot>${formularioHtml(ev, pre)}</div>
  </div></section>
  <footer class="e-foot">${esc(ev.nome)} · Pastora Simone${ev.cidade ? " · " + esc(ev.cidade) : ""}</footer>`;

  root.querySelectorAll("[data-ev-video]").forEach((b) => b.addEventListener("click", () => opcoes.onVideo?.()));
  const form = root.querySelector("[data-reg]");
  if (form) form.addEventListener("submit", (e) => enviarInscricao(e, root, ev, opcoes));
  atualizarContagem(root, ev);
}

async function enviarInscricao(e, root, ev, opcoes) {
  e.preventDefault();
  const f = e.target;
  const erro = f.querySelector(".err");
  const v = (n) => (f.elements[n]?.value || "").trim();
  const dados = { nome: v("nome"), whatsapp: v("whatsapp") };
  ["email", "cidade", "igreja", "formaPagamento"].forEach((k) => { if (f.elements[k] && v(k)) dados[k] = v(k); });
  erro.textContent = "";
  if (f.elements.formaPagamento && !dados.formaPagamento) return (erro.textContent = "Escolha a forma de pagamento.");
  if (dados.nome.length < 3) return (erro.textContent = "Digite seu nome completo.");
  if (dados.whatsapp.replace(/\D/g, "").length < 10) return (erro.textContent = "Digite um WhatsApp com DDD, por exemplo (11) 9 0000-0000.");
  if (dados.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(dados.email)) return (erro.textContent = "Confira o e-mail digitado.");
  if (!opcoes.onInscrever) return;
  const btn = f.querySelector("button[type=submit]");
  btn.disabled = true;
  btn.textContent = "Enviando...";
  const msg = await opcoes.onInscrever(dados);
  if (msg) {
    erro.textContent = msg;
    btn.disabled = false;
    btn.textContent = "Confirmar inscrição";
    return;
  }
  const n = Number(ev.inscritos) || 0;
  const num = root.querySelector("[data-insc-n]"), barra = root.querySelector("[data-insc-barra]");
  if (num) num.textContent = n;
  if (barra) barra.style.width = Math.min(100, Math.round((n / Math.max(1, Number(ev.vagas) || 1)) * 100)) + "%";
  mostrarConfirmacao(root, ev, dados.nome, dados);
}

export function mostrarConfirmacao(root, ev, nome, dados = {}) {
  const grupo = urlSegura(ev.grupoVip);
  const qr = ev.mostrarQr && imgSegura(ev.qrCode);
  const agenda = googleAgendaUrl(ev);
  const slot = root.querySelector("[data-reg-slot]");
  if (!slot) return;
  slot.innerHTML = `<div class="e-ok"><span class="e-eyebrow" style="color:var(--e-accent)">Inscrição confirmada</span>
    <h3>Te esperamos, ${esc(String(nome).split(" ")[0])}!</h3>
    <p>${grupo || qr ? "Entre no Grupo VIP para receber os avisos e o lembrete no dia." : "Guarde a data na sua agenda. Até lá!"}</p>
    ${qr ? `<img src="${esc(qr)}" alt="QR Code do Grupo VIP" />` : ""}
    ${grupo ? `<a class="e-btn wa" href="${esc(grupo)}" target="_blank" rel="noopener">${ICONE_WA} Entrar no Grupo VIP</a>` : ""}
    ${agenda ? `<a class="e-btn ghost" href="${esc(agenda)}" target="_blank" rel="noopener">Adicionar ao Google Agenda</a>` : ""}
    <button class="e-btn ghost" type="button" data-ingresso-abrir>Gerar meu ingresso</button>
    <div class="e-ing" data-ingresso hidden>
      <label>Nome no ingresso<input type="text" name="ing-nome" maxlength="60" value="${esc(nome)}" /></label>
      <label>Igreja<input type="text" name="ing-igreja" maxlength="60" value="${esc(dados.igreja || "")}" placeholder="Qual igreja você frequenta" /></label>
      <label>Sua foto<input type="file" name="ing-foto" accept="image/*" /></label>
      <button class="e-btn" type="button" data-ingresso-gerar>Gerar ingresso</button>
      <p class="err" data-ingresso-msg aria-live="polite"></p>
      <div class="e-ing-res" data-ingresso-res hidden>
        <canvas data-cv-ingresso></canvas>
        <button class="e-btn ghost" type="button" data-baixar="ingresso">Baixar ingresso</button>
        <canvas data-cv-story></canvas>
        <button class="e-btn" type="button" data-baixar="story">Postar no Instagram</button>
        <button class="e-btn ghost" type="button" data-baixar="story-arquivo">Só baixar o Story</button>
      </div>
    </div></div>`;
  const painel = slot.querySelector("[data-ingresso]");
  slot.querySelector("[data-ingresso-abrir]").addEventListener("click", () => { painel.hidden = !painel.hidden; });
  let artes = null;
  slot.querySelector("[data-ingresso-gerar]").addEventListener("click", async (e) => {
    const msg = slot.querySelector("[data-ingresso-msg]");
    const q = (n) => painel.querySelector(`[name="${n}"]`);
    const nomeIng = q("ing-nome").value.trim();
    if (nomeIng.length < 3) return (msg.textContent = "Digite o nome que vai no ingresso.");
    e.target.disabled = true; msg.textContent = "Gerando...";
    const { desenharIngresso, desenharStory, lerFoto } = await import("./ingresso.js");
    const d = { nome: nomeIng, igreja: q("ing-igreja").value.trim(), foto: await lerFoto(q("ing-foto").files[0]) };
    artes = { ingresso: await desenharIngresso(ev, d), story: await desenharStory(ev, d) };
    for (const [k, sel] of [["ingresso", "[data-cv-ingresso]"], ["story", "[data-cv-story]"]]) {
      const cv = slot.querySelector(sel), src = artes[k];
      cv.width = src.width; cv.height = src.height;
      cv.getContext("2d").drawImage(src, 0, 0);
    }
    slot.querySelector("[data-ingresso-res]").hidden = false;
    msg.textContent = d.foto ? "" : "Dica: envie uma foto para o ingresso ficar completo.";
    e.target.disabled = false; e.target.textContent = "Gerar de novo";
  });
  slot.addEventListener("click", async (e) => {
    const b = e.target.closest("[data-baixar]");
    if (!b || !artes) return;
    const { postarInstagram, baixarCanvas } = await import("./ingresso.js");
    const msg = slot.querySelector("[data-ingresso-msg]");
    if (b.dataset.baixar === "ingresso") await baixarCanvas(artes.ingresso, "meu-ingresso.png");
    else if (b.dataset.baixar === "story-arquivo") await baixarCanvas(artes.story, "story-eu-vou.png");
    else msg.textContent = await postarInstagram(artes.story, "story-eu-vou.png");
  });
  slot.scrollIntoView({ behavior: "smooth", block: "center" });
}

export function atualizarContagem(root, ev) {
  const el = root.querySelector("[data-count]");
  if (!el) return;
  const [y, m, d] = String(ev.data || "").split("-").map(Number);
  const [hh, mm] = String(ev.hora || "0:0").split(":").map(Number);
  const diff = y ? new Date(y, m - 1, d, hh || 0, mm || 0) - new Date() : 0;
  if (diff <= 0) {
    el.innerHTML = `<div><strong>${y && new Date(y, m - 1, d).toDateString() === new Date().toDateString() ? "Hoje" : "—"}</strong><small>${y && diff > -864e5 ? "é o dia" : "evento realizado"}</small></div>`;
    return;
  }
  const dd = Math.floor(diff / 864e5), h = Math.floor((diff % 864e5) / 36e5), mi = Math.floor((diff % 36e5) / 6e4), s = Math.floor((diff % 6e4) / 1e3);
  el.innerHTML = [[dd, "dias"], [h, "horas"], [mi, "min"], [s, "seg"]]
    .map(([v, l]) => `<div><strong>${String(v).padStart(2, "0")}</strong><small>${l}</small></div>`).join("");
}
