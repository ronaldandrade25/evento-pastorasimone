// Funções compartilhadas entre o site, o superadmin, a área do aluno e o site dos eventos

export const $ = (s, el = document) => el.querySelector(s);
export const $$ = (s, el = document) => [...el.querySelectorAll(s)];

export const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export const brl = (v) => Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const fmtDate = (d) => (d ? d.split("-").reverse().join("/") : "—");

export function hojeISO(somarDias = 0) {
  const d = new Date();
  d.setDate(d.getDate() + somarDias);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export const initials = (nome) =>
  String(nome || "?").split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase();

export const thumb = (yt) => (yt ? `https://img.youtube.com/vi/${yt}/hqdefault.jpg` : "");

export function extractYoutubeId(input) {
  const v = String(input || "").trim();
  if (/^[\w-]{11}$/.test(v)) return v;
  const m = v.match(/(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([\w-]{11})/);
  return m ? m[1] : "";
}

export const formaLabel = { pix: "Pix", cartao: "Cartão", boleto: "Boleto", outro: "Outro" };

const badgeCor = {
  ativo: "b-green", pendente: "b-yellow", bloqueado: "b-red",
  pago: "b-green", reembolsado: "b-gray", cancelado: "b-red",
  publicada: "b-green", rascunho: "b-yellow",
  completo: "b-gold", todos: "b-blue", basico: "b-blue",
  publicado: "b-green", encerrado: "b-gray",
};
export const capitalizar = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");
export const badge = (s, label) => `<span class="badge ${badgeCor[s] || "b-gray"}">${esc(label || capitalizar(s))}</span>`;

// Ordena aulas pela ordem dos módulos e depois pela ordem dentro do módulo
export function ordenarAulas(aulas, modulos = []) {
  const pos = (m) => (modulos.includes(m) ? modulos.indexOf(m) : 999);
  return [...aulas].sort((a, b) => pos(a.modulo) - pos(b.modulo) || (a.ordem || 0) - (b.ordem || 0));
}

// Materiais: cada linha "Nome | link"
export function materiaisParaTexto(lista = []) {
  return lista.map((m) => `${m.nome} | ${m.url}`).join("\n");
}
export function textoParaMateriais(texto = "") {
  return texto
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [nome, ...resto] = l.split("|");
      const url = resto.join("|").trim();
      return url ? { nome: nome.trim(), url } : { nome: nome.trim(), url: nome.trim() };
    });
}

export function toast(msg, erro = false) {
  let t = $("#toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "toast";
    t.className = "toast";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.toggle("erro", erro);
  t.classList.add("show");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove("show"), 3000);
}

export function abrirModal(sel) {
  $(sel).classList.add("active");
}
export function fecharModais() {
  $$(".modal").forEach((m) => m.classList.remove("active"));
  document.dispatchEvent(new CustomEvent("modais-fechados"));
}
document.addEventListener("click", (e) => {
  if (e.target.closest("[data-close-modal]")) fecharModais();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") fecharModais();
});

export function baixarCsv(nome, linhas) {
  const csv = linhas.map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(";")).join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
  a.download = nome;
  a.click();
}

export function mensagemErroAuth(err) {
  const c = err?.code || "";
  if (c.includes("invalid-credential") || c.includes("wrong-password") || c.includes("user-not-found"))
    return "E-mail ou senha incorretos.";
  if (c.includes("invalid-email")) return "E-mail inválido.";
  if (c.includes("too-many-requests")) return "Muitas tentativas. Aguarde alguns minutos e tente de novo.";
  if (c.includes("network")) return "Sem conexão. Verifique sua internet.";
  if (c.includes("email-already-in-use")) return "Este e-mail já tem uma conta de login.";
  if (c.includes("permission-denied")) return "Sem permissão. Confira as regras do Firestore.";
  return "Não foi possível concluir. Tente novamente.";
}

// Configuração padrão do site (usada até o superadmin salvar a dele)
export const CONFIG_PADRAO = {
  nome: "Pastora Simone · Escola Bíblica",
  videoApresentacao: "",
  precoBasico: 97,
  precoBasicoDe: 0,
  precoCompleto: 197,
  precoCompletoDe: 0,
  checkoutBasico: "",
  checkoutCompleto: "",
  whatsapp: "",
  whatsappSuporte: "",
  heroPrefixo: "Cresça na Palavra com",
  heroDestaque: "propósito",
  heroSufixo: "e profundidade",
  heroDescricao: "Aulas gravadas com a Pastora Simone para quem quer conhecer as Escrituras, fortalecer a vida de oração e servir melhor na igreja e em casa. Estude no seu tempo, pelo celular ou computador.",
  versiculoHero: "Lâmpada para os meus pés é tua palavra, e luz para o meu caminho.",
  referenciaHero: "Salmos 119:105",
  corPrimaria: "#a8740f",
  corFundo: "#fbf6ea",
  corFundoSecundario: "#f3ead6",
  corTexto: "#2b2115",
  planos: [],
  fotoProfessor: "",
  nomeProfessor: "Pastora Simone",
  cargoProfessor: "Professora e pastora",
  textoProfessor: "Professora e pastora, dedica a vida ao ensino da Palavra e à formação de mulheres e líderes.\n\nNa Escola Bíblica, reúne anos de ministério em aulas claras, com base nas Escrituras e aplicação para o dia a dia.",
  suporte: "",
  modulos: ["Panorama Bíblico", "Oração e Intimidade", "Mulheres de Propósito", "Fundamentos da Fé", "Família segundo Deus", "Liderança Cristã"],
};

// ===================== PLANOS =====================
// Rótulos dos planos (id -> nome). É preenchido por aplicarPlanos().
export const planoLabel = {};

// Planos vêm de config.planos. Se o superadmin ainda não criou nenhum,
// monta os dois planos antigos (Básico e Completo) a partir dos campos antigos.
export function planosDe(cfg) {
  if (Array.isArray(cfg.planos) && cfg.planos.length) return cfg.planos;
  return [
    {
      id: "semente", nome: "Semente", preco: 97, precoDe: 0, checkout: "", destaque: false, tag: "", acessoTotal: false,
      beneficios: ["Cursos liberados para todos os planos", "Apostilas desses cursos", "Área do aluno com progresso"],
    },
    {
      id: "discipula", nome: "Discípula", preco: 197, precoDe: 0, checkout: "", destaque: true, tag: "MAIS ESCOLHIDO", acessoTotal: true,
      beneficios: ["Todos os cursos", "Todas as apostilas", "Grupo de oração", "Certificado de conclusão"],
    },
    {
      id: "ministerio", nome: "Ministério", preco: 397, precoDe: 0, checkout: "", destaque: false, tag: "", acessoTotal: true,
      beneficios: ["Tudo do plano Discípula", "Cursos futuros inclusos", "Encontro ao vivo mensal", "Material para líderes"],
    },
  ];
}

export function aplicarPlanos(cfg) {
  const planos = planosDe(cfg);
  Object.keys(planoLabel).forEach((k) => delete planoLabel[k]);
  planos.forEach((p) => (planoLabel[p.id] = p.nome));
  return planos;
}

// O aluno vê todas as aulas se o plano dele tem "acesso total"
// (alunos antigos: o plano "completo").
export const temAcessoTotal = (al) => (al.acessoTotal ?? al.plano === "completo") === true;

// ===================== TEMA E WHATSAPP =====================
export const CORES_PADRAO = {
  corPrimaria: "#a8740f",
  corFundo: "#fbf6ea",
  corFundoSecundario: "#f3ead6",
  corTexto: "#2b2115",
};

function escurecer(hex, f = 0.8) {
  const n = parseInt(hex.slice(1), 16);
  const c = (v) => Math.round(v * f).toString(16).padStart(2, "0");
  return "#" + c(n >> 16) + c((n >> 8) & 255) + c(n & 255);
}

export function aplicarTema(cfg) {
  const ok = (v, padrao) => (/^#[0-9a-f]{6}$/i.test(v || "") ? v : padrao);
  const r = document.documentElement.style;
  const primaria = ok(cfg.corPrimaria, CORES_PADRAO.corPrimaria);
  r.setProperty("--primary", primaria);
  r.setProperty("--primary-dark", escurecer(primaria));
  r.setProperty("--bg-main", ok(cfg.corFundo, CORES_PADRAO.corFundo));
  r.setProperty("--bg-secondary", ok(cfg.corFundoSecundario, CORES_PADRAO.corFundoSecundario));
  r.setProperty("--text-primary", ok(cfg.corTexto, CORES_PADRAO.corTexto));
}

// Número só com dígitos; 10 ou 11 dígitos = sem DDI, então acrescenta o 55 do Brasil
export function linkWhatsapp(numero, texto = "") {
  let n = String(numero || "").replace(/\D/g, "");
  if (!n) return "";
  if (n.length <= 11) n = "55" + n;
  return `https://wa.me/${n}${texto ? "?text=" + encodeURIComponent(texto) : ""}`;
}

// Ícone flutuante do WhatsApp (suporte) em todas as páginas em que for chamado
export function botaoWhatsapp(cfg) {
  let a = document.getElementById("whatsFlutuante");
  const href = linkWhatsapp(cfg.whatsappSuporte, `Olá! Preciso de ajuda com a ${cfg.nome}.`);
  if (!href) return a?.remove();
  if (!a) {
    a = document.createElement("a");
    a.id = "whatsFlutuante";
    a.className = "whats-flutuante";
    a.target = "_blank";
    a.rel = "noopener";
    a.title = "Fale com o suporte no WhatsApp";
    a.setAttribute("aria-label", "Suporte no WhatsApp");
    a.innerHTML = '<i class="fa-brands fa-whatsapp"></i>';
    document.body.appendChild(a);
  }
  a.href = href;
}

// ===================== MENU LATERAL NO CELULAR =====================
function ligarMenuMobile() {
  const btn = document.getElementById("btnMenu");
  const lateral = document.querySelector(".sidebar");
  const fundo = document.getElementById("menuOverlay");
  if (!btn || !lateral || !fundo) return;
  const alternar = (abrir) => {
    lateral.classList.toggle("aberto", abrir);
    fundo.classList.toggle("aberto", abrir);
  };
  btn.addEventListener("click", () => alternar(!lateral.classList.contains("aberto")));
  fundo.addEventListener("click", () => alternar(false));
  lateral.addEventListener("click", (e) => { if (e.target.closest("button")) alternar(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") alternar(false); });
}
ligarMenuMobile();

// ===================== IMAGENS =====================
// Reduz a imagem no navegador e devolve um data URL (não usamos Firebase Storage).
// maxL/maxA: largura e altura máximas. tipo: "image/jpeg" ou "image/png".
export function reduzirImagem(arquivo, { maxL = 1200, maxA = 1200, tipo = "image/jpeg", qualidade = 0.82 } = {}) {
  return new Promise((ok, falha) => {
    const img = new Image();
    img.onload = () => {
      const f = Math.min(1, maxL / img.width, maxA / img.height);
      const cv = document.createElement("canvas");
      cv.width = Math.round(img.width * f);
      cv.height = Math.round(img.height * f);
      cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
      URL.revokeObjectURL(img.src);
      ok(cv.toDataURL(tipo, qualidade));
    };
    img.onerror = () => falha(new Error("Não foi possível ler esta imagem."));
    img.src = URL.createObjectURL(arquivo);
  });
}

// "Derrubando as Fortalezas" -> "derrubando-as-fortalezas"
export const slugify = (txt) =>
  String(txt || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// ===================== VERSÍCULO DO DIA (área do aluno) =====================
export const VERSICULOS = [
  ["Tudo posso naquele que me fortalece.", "Filipenses 4:13"],
  ["Lâmpada para os meus pés é tua palavra, e luz para o meu caminho.", "Salmos 119:105"],
  ["Buscai primeiro o Reino de Deus, e a sua justiça, e todas estas coisas vos serão acrescentadas.", "Mateus 6:33"],
  ["O Senhor é o meu pastor; nada me faltará.", "Salmos 23:1"],
  ["Esforça-te, e tem bom ânimo; não temas, nem te espantes, porque o Senhor teu Deus é contigo.", "Josué 1:9"],
  ["Entrega o teu caminho ao Senhor; confia nele, e ele tudo fará.", "Salmos 37:5"],
  ["Mas os que esperam no Senhor renovarão as forças.", "Isaías 40:31"],
  ["Orai sem cessar.", "1 Tessalonicenses 5:17"],
  ["A tua palavra é a verdade.", "João 17:17"],
  ["Toda a Escritura é divinamente inspirada, e proveitosa para ensinar.", "2 Timóteo 3:16"],
  ["Porque sou eu que conheço os planos que tenho para vocês, planos de fazê-los prosperar e não de causar dano.", "Jeremias 29:11"],
  ["Lancem sobre ele toda a sua ansiedade, porque ele tem cuidado de vocês.", "1 Pedro 5:7"],
];
export function versiculoDoDia(data = new Date()) {
  const dia = Math.floor((data - new Date(data.getFullYear(), 0, 0)) / 864e5);
  return VERSICULOS[dia % VERSICULOS.length];
}
