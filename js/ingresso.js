// Ingresso do inscrito (cartão) e arte para os Stories do Instagram, desenhados em <canvas>.
// Tudo acontece no navegador: a foto da pessoa não é enviada a nenhum servidor.
import { LOGO, dataLonga } from "./evento-site.js";

const SERIF = '"Cinzel", Georgia, serif';
const SANS = '"Jost", system-ui, sans-serif';

// Link "Adicionar ao Google Agenda" com a data e a hora do evento (duração padrão: 3 horas)
export function googleAgendaUrl(ev) {
  const [y, m, d] = String(ev.data || "").split("-").map(Number);
  if (!y) return "";
  const [hh, mm] = String(ev.hora || "19:00").split(":").map(Number);
  const ini = new Date(y, m - 1, d, hh || 0, mm || 0);
  const fim = new Date(ini.getTime() + 3 * 36e5);
  const f = (t) => `${t.getFullYear()}${String(t.getMonth() + 1).padStart(2, "0")}${String(t.getDate()).padStart(2, "0")}T${String(t.getHours()).padStart(2, "0")}${String(t.getMinutes()).padStart(2, "0")}00`;
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: `${ev.nome} · Pastora Simone`,
    dates: `${f(ini)}/${f(fim)}`,
    details: [ev.frase, ev.ministra ? `Ministração: ${ev.ministra}` : ""].filter(Boolean).join("\n"),
    location: [ev.local, ev.endereco, ev.cidade].filter(Boolean).join(", "),
    ctz: Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Sao_Paulo",
  });
  return "https://calendar.google.com/calendar/render?" + p.toString();
}

// "14:00" vira "14h"; "14:30" vira "14h30"
const horaCurta = (h) => { const [hh, mm] = String(h).split(":").map(Number); return Number.isNaN(hh) ? String(h) : `${hh}h${mm ? String(mm).padStart(2, "0") : ""}`; };

const carregarImg = (src) => new Promise((ok) => {
  if (!src) return ok(null);
  const i = new Image();
  i.onload = () => ok(i);
  i.onerror = () => ok(null);
  i.src = src;
});
// Só imagens do próprio site ou data URL: imagem de outro domínio "contamina" o canvas e impede o download
const mesmaOrigem = (u) => (/^(data:image\/|img\/)/i.test(String(u || "")) ? u : "");

export function lerFoto(arquivo) {
  return new Promise((ok) => {
    if (!arquivo || !/^image\//.test(arquivo.type)) return ok(null);
    const r = new FileReader();
    r.onload = () => carregarImg(r.result).then(ok);
    r.onerror = () => ok(null);
    r.readAsDataURL(arquivo);
  });
}

function cobrir(ctx, img, x, y, w, h) {
  const k = Math.max(w / img.width, h / img.height);
  const sw = w / k, sh = h / k;
  ctx.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, x, y, w, h);
}
function fotoRedonda(ctx, img, cx, cy, r, ouro) {
  ctx.save();
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
  if (img) cobrir(ctx, img, cx - r, cy - r, r * 2, r * 2);
  else { ctx.fillStyle = "#2a2118"; ctx.fill(); }
  ctx.restore();
  ctx.lineWidth = 8; ctx.strokeStyle = ouro;
  ctx.beginPath(); ctx.arc(cx, cy, r + 6, 0, Math.PI * 2); ctx.stroke();
}
function quebrar(ctx, texto, largura, maxLinhas) {
  const palavras = String(texto).split(/\s+/), linhas = [];
  let atual = "";
  for (const p of palavras) {
    const t = atual ? atual + " " + p : p;
    if (ctx.measureText(t).width > largura && atual) { linhas.push(atual); atual = p; } else atual = t;
  }
  if (atual) linhas.push(atual);
  if (linhas.length > maxLinhas) { linhas.length = maxLinhas; linhas[maxLinhas - 1] = linhas[maxLinhas - 1].replace(/.{1,2}$/, "…"); }
  return linhas;
}
const centro = (ctx, t, x, y) => { ctx.textAlign = "center"; ctx.fillText(t, x, y); };

async function base(ev, w, h) {
  await Promise.all(["700 40px Cinzel", "600 30px Jost", "500 30px Jost"].map((f) => document.fonts?.load(f).catch(() => {})));
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const ctx = c.getContext("2d");
  const cor = /^#[0-9a-f]{6}$/i;
  const fundo = cor.test(ev.corFundo || "") ? ev.corFundo : "#1a1510";
  const ouro = cor.test(ev.corOuro || "") ? ev.corOuro : "#e0b25a";
  const [logo, banner] = await Promise.all([carregarImg(LOGO), carregarImg(mesmaOrigem(ev.banner))]);
  ctx.fillStyle = fundo; ctx.fillRect(0, 0, w, h);
  if (banner) {
    ctx.globalAlpha = .28; cobrir(ctx, banner, 0, 0, w, h * .55); ctx.globalAlpha = 1;
    const g = ctx.createLinearGradient(0, 0, 0, h * .55);
    g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, fundo);
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h * .55);
  }
  ctx.strokeStyle = ouro; ctx.lineWidth = 4; ctx.strokeRect(36, 36, w - 72, h - 72);
  ctx.lineWidth = 1.5; ctx.strokeRect(54, 54, w - 108, h - 108);
  return { c, ctx, ouro, logo };
}

function codigo(nome, ev) {
  let h = 7;
  for (const ch of `${nome}|${ev.slug}|${ev.data}`) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return "PS-" + h.toString(36).toUpperCase().padStart(6, "0").slice(-6);
}

// Ingresso (1080x1350, ótimo para o feed)
export async function desenharIngresso(ev, { nome, igreja, foto }) {
  const W = 1080, H = 1350, { c, ctx, ouro, logo } = await base(ev, W, H);
  if (logo) { ctx.save(); ctx.beginPath(); ctx.arc(W / 2, 150, 58, 0, 7); ctx.clip(); ctx.fillStyle = "#f6efe0"; ctx.fillRect(W / 2 - 58, 92, 116, 116); ctx.drawImage(logo, W / 2 - 52, 98, 104, 104); ctx.restore(); }
  ctx.fillStyle = ouro; ctx.font = `600 26px ${SANS}`; ctx.letterSpacing = "8px";
  centro(ctx, "INGRESSO · PASTORA SIMONE", W / 2, 260);
  ctx.letterSpacing = "0px";
  ctx.fillStyle = "#efe6d4"; ctx.font = `700 70px ${SERIF}`;
  quebrar(ctx, ev.nome, W - 200, 2).forEach((l, i) => centro(ctx, l, W / 2, 350 + i * 80));
  fotoRedonda(ctx, foto, W / 2, 640, 170, ouro);
  ctx.fillStyle = "#efe6d4"; ctx.font = `700 60px ${SERIF}`;
  quebrar(ctx, nome, W - 200, 2).forEach((l, i, a) => centro(ctx, l, W / 2, 900 + i * 68 - (a.length - 1) * 20));
  ctx.fillStyle = ouro; ctx.font = `500 34px ${SANS}`;
  if (igreja) centro(ctx, quebrar(ctx, igreja, W - 240, 1)[0], W / 2, 985);
  ctx.strokeStyle = ouro; ctx.setLineDash([10, 10]); ctx.beginPath(); ctx.moveTo(110, 1050); ctx.lineTo(W - 110, 1050); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = "#efe6d4"; ctx.font = `500 34px ${SANS}`;
  centro(ctx, `${dataLonga(ev)}${ev.hora ? " · " + horaCurta(ev.hora) : ""}`, W / 2, 1115);
  ctx.fillStyle = "#b9ab92"; ctx.font = `500 30px ${SANS}`;
  centro(ctx, [ev.local, ev.cidade].filter(Boolean).join(" · "), W / 2, 1165);
  ctx.fillStyle = ouro; ctx.font = `600 28px ${SANS}`; ctx.letterSpacing = "6px";
  centro(ctx, "Nº " + codigo(nome, ev), W / 2, 1245);
  return c;
}

// Arte para Stories (1080x1920, 9:16)
export async function desenharStory(ev, { nome, igreja, foto }) {
  const W = 1080, H = 1920, { c, ctx, ouro, logo } = await base(ev, W, H);
  if (logo) { ctx.save(); ctx.beginPath(); ctx.arc(W / 2, 250, 70, 0, 7); ctx.clip(); ctx.fillStyle = "#f6efe0"; ctx.fillRect(W / 2 - 70, 180, 140, 140); ctx.drawImage(logo, W / 2 - 63, 187, 126, 126); ctx.restore(); }
  ctx.fillStyle = ouro; ctx.font = `600 34px ${SANS}`; ctx.letterSpacing = "8px";
  centro(ctx, "EU VOU!", W / 2, 400);
  ctx.letterSpacing = "0px";
  fotoRedonda(ctx, foto, W / 2, 750, 230, ouro);
  ctx.fillStyle = "#efe6d4"; ctx.font = `700 74px ${SERIF}`;
  quebrar(ctx, nome, W - 200, 2).forEach((l, i) => centro(ctx, l, W / 2, 1100 + i * 84));
  ctx.fillStyle = ouro; ctx.font = `500 40px ${SANS}`;
  if (igreja) centro(ctx, quebrar(ctx, igreja, W - 240, 1)[0], W / 2, 1265);
  ctx.fillStyle = "#efe6d4"; ctx.font = `700 80px ${SERIF}`;
  quebrar(ctx, ev.nome, W - 180, 2).forEach((l, i) => centro(ctx, l, W / 2, 1450 + i * 92));
  ctx.fillStyle = ouro; ctx.font = `500 42px ${SANS}`;
  centro(ctx, `${dataLonga(ev)}${ev.hora ? " · " + horaCurta(ev.hora) : ""}`, W / 2, 1670);
  ctx.fillStyle = "#b9ab92"; ctx.font = `500 36px ${SANS}`;
  centro(ctx, [ev.local, ev.cidade].filter(Boolean).join(" · "), W / 2, 1735);
  ctx.fillStyle = ouro; ctx.font = `600 30px ${SANS}`;
  centro(ctx, "Com a Pastora Simone", W / 2, 1810);
  return c;
}

const paraBlob = (c) => new Promise((ok) => { try { c.toBlob((b) => ok(b), "image/png"); } catch { ok(null); } });

// Leva a pessoa ao Instagram sem baixar a imagem. Celular: abre o menu de compartilhar com a arte
// anexada. Sem esse menu: copia a arte e abre o Instagram para colar no Story.
// (O Instagram não permite que um site publique sozinho.)
export async function postarInstagram(canvas, nomeArquivo) {
  const blob = await paraBlob(canvas);
  if (!blob) return "Não foi possível preparar a imagem.";
  const arquivo = new File([blob], nomeArquivo, { type: "image/png" });
  if (navigator.canShare?.({ files: [arquivo] })) {
    try {
      await navigator.share({ files: [arquivo], title: "Eu vou!" });
      return "";
    } catch (e) {
      if (e.name === "AbortError") return "";
    }
  }
  let copiada = false;
  try {
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    copiada = true;
  } catch { /* sem permissão: segue só abrindo o Instagram */ }
  if (/android|iphone|ipad|ipod/i.test(navigator.userAgent)) location.href = "instagram://story-camera";
  else window.open("https://www.instagram.com/", "_blank", "noopener");
  return copiada
    ? "Abrindo o Instagram. A imagem foi copiada: crie um Story e cole (Ctrl+V ou segure o dedo na tela)."
    : 'Abrindo o Instagram. Se precisar da imagem, use o botão "Só baixar o Story".';
}

export async function baixarCanvas(canvas, nomeArquivo) {
  const blob = await paraBlob(canvas);
  if (blob) baixar(blob, nomeArquivo);
}
function baixar(blob, nome) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = nome;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
