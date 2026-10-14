import {
  auth, db, configurado, avisoConfiguracao, onAuthStateChanged,
  collection, doc, getDoc, getDocs, query, where,
} from "./firebase.js";
import {
  $, $$, esc, brl, thumb, toast, abrirModal, ordenarAulas,
  CONFIG_PADRAO, aplicarPlanos, aplicarTema, botaoWhatsapp, linkWhatsapp,
} from "./comum.js";
import { entrar, redefinirSenha, irParaArea } from "./acesso.js";
import { ligarBotoesInstalar } from "./pwa.js";
import { abrirVideo } from "./player.js";

avisoConfiguracao();
$("#ano").textContent = new Date().getFullYear();

let config = { ...CONFIG_PADRAO };
let vitrine = [];
let eventos = [];
let planos = [];
let playerGratis = null;
let heroAtual = null;

// ===================== CONTEÚDO DO SITE =====================
async function carregarSite() {
  if (configurado) {
    try {
      const snap = await getDoc(doc(db, "config", "site"));
      if (snap.exists()) config = { ...CONFIG_PADRAO, ...snap.data() };
      const aulas = await getDocs(query(collection(db, "vitrine"), where("status", "==", "publicada")));
      vitrine = aulas.docs.map((d) => ({ id: d.id, ...d.data() }));
      const evs = await getDocs(query(collection(db, "eventos"), where("status", "==", "publicado")));
      eventos = evs.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.error("Erro ao carregar o site:", e);
    }
  }
  renderSite();
}

function renderSite() {
  document.title = config.nome;
  $("#secVideo").classList.toggle("hidden", !config.videoApresentacao);
  if (config.videoApresentacao && heroAtual?.id !== config.videoApresentacao) {
    heroAtual?.player.destruir();
    const id = config.videoApresentacao;
    heroAtual = { id, player: { destruir() {} } };
    abrirVideo($("#heroVideo"), id, { autoplay: false }).then((p) => (heroAtual = { id, player: p }));
  }
  if (config.versiculoHero) $("#heroVersiculo").textContent = `“${config.versiculoHero}”`;
  $("#heroReferencia").textContent = config.referenciaHero || "";
  aplicarTema(config);
  botaoWhatsapp(config);
  $("#heroPrefixo").textContent = config.heroPrefixo;
  $("#heroDestaque").textContent = config.heroDestaque;
  $("#heroSufixo").textContent = config.heroSufixo;
  $("#heroDescricao").textContent = config.heroDescricao;
  renderPlanos();
  renderProfessor();
  const zap = linkWhatsapp(config.whatsappSuporte, "Olá, Pastora Simone! Quero saber mais sobre a Escola Bíblica.");
  $("#linkSuporte").href = zap || config.suporte || "#";
  $("#linkSuporte").classList.toggle("hidden", !(zap || config.suporte));
  $("#statCursos").textContent = new Set(vitrine.map((a) => a.modulo)).size || config.modulos.length;
  renderEventos();

  const aulas = ordenarAulas(vitrine, config.modulos);
  $("#gradeAulas").innerHTML = aulas.length
    ? aulas
        .map((a) => {
          const gratis = a.gratuita && a.yt;
          const tag = gratis ? "button" : "div";
          return `<${tag} class="module-card" ${gratis ? `data-gratis="${a.id}"` : ""}>
            <div class="thumb ${gratis ? "" : "thumb-placeholder"}" style="${gratis ? `background-image:url('${thumb(a.yt)}')` : ""}">
              ${gratis ? '<span class="free-tag">GRÁTIS</span>' : '<div class="lock"><i class="fa-solid fa-lock"></i></div>'}
            </div>
            <div class="body"><small>${esc(a.modulo)}</small><h3>${esc(a.titulo)}</h3><p>${esc(a.descricao)}</p></div>
          </${tag}>`;
        })
        .join("")
    : `<div class="empty" style="grid-column:1/-1">Os cursos aparecem aqui assim que as aulas forem cadastradas no painel.</div>`;

  $$("[data-gratis]").forEach((el) =>
    el.addEventListener("click", () => {
      const a = vitrine.find((x) => x.id === el.dataset.gratis);
      $("#aulaGratisTitulo").textContent = a.titulo;
      $("#aulaGratisDesc").textContent = a.descricao || "";
      abrirModal("#aulaGratisModal");
      playerGratis?.destruir();
      abrirVideo($("#aulaGratisFrame"), a.yt).then((p) => {
        if (!$("#aulaGratisModal").classList.contains("active")) p.destruir();
        else playerGratis = p;
      });
    })
  );
}

// Próximos eventos publicados (de hoje em diante), com link para o site de cada um
function renderEventos() {
  const hoje = new Date().toISOString().slice(0, 10);
  const lista = eventos.filter((e) => !e.data || e.data >= hoje).sort((a, b) => (a.data || "9").localeCompare(b.data || "9"));
  $("#eventos").classList.toggle("hidden", !lista.length);
  $("#navEventos").classList.toggle("hidden", !lista.length);
  $("#listaEventos").innerHTML = lista.map((e) => {
    const [y, m, d] = String(e.data || "").split("-").map(Number);
    const quando = y ? new Date(y, m - 1, d).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" }) : "Data a definir";
    const foto = /^(data:image\/|img\/|https:\/\/)/.test(e.banner || "") ? e.banner : "";
    return `<a class="evento-card" href="evento.html?e=${encodeURIComponent(e.slug)}">
      <span class="foto" ${foto ? `style="background-image:url('${esc(foto)}')"` : ""}></span>
      <span class="txt"><span class="eyebrow">${esc(quando)}${e.hora ? " · " + esc(e.hora) + "h" : ""}</span><h3>${esc(e.nome)}</h3>
      <small>${esc([e.local, e.cidade].filter(Boolean).join(" · "))}</small><span class="btn btn-outline btn-sm" style="justify-self:start;margin-top:6px">Ver evento e inscrever-se</span></span></a>`;
  }).join("");
}

function renderProfessor() {
  $("#nomeProfessor").textContent = config.nomeProfessor;
  $("#cargoProfessor").textContent = config.cargoProfessor;
  $("#textoProfessor").innerHTML = String(config.textoProfessor || "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${esc(p)}</p>`)
    .join("");
  $("#fotoProfessor").innerHTML = config.fotoProfessor
    ? `<img src="${esc(config.fotoProfessor)}" alt="${esc(config.nomeProfessor)}" />`
    : '<img class="logo-foto" src="img/logo-simone.png" alt="" />';
}

function renderPlanos() {
  planos = aplicarPlanos(config);
  $("#listaPlanos").innerHTML = planos
    .map((p) => `<div class="price-card ${p.destaque ? "featured" : ""}">
      ${p.destaque && p.tag ? `<div class="tag">${esc(p.tag)}</div>` : ""}
      <h3>${esc(p.nome)}</h3>
      <div class="old">${p.precoDe ? "de " + brl(p.precoDe) : ""}</div>
      <div class="price"><span>${brl(p.preco)}</span><small> à vista</small></div>
      <ul>${(p.beneficios || []).map((b) => `<li><i class="fa-solid fa-diamond"></i> ${esc(b)}</li>`).join("")}</ul>
      <button class="btn ${p.destaque ? "btn-red" : "btn-outline"}" data-comprar="${esc(p.id)}">Escolher ${esc(p.nome)}</button>
    </div>`)
    .join("");
  $$("[data-comprar]").forEach((btn) => btn.addEventListener("click", () => comprar(btn.dataset.comprar)));
}

document.addEventListener("modais-fechados", () => {
  playerGratis?.destruir();
  playerGratis = null;
  $("#aulaGratisFrame").innerHTML = "";
});

// Botão de compra: link de checkout do plano > WhatsApp de vendas > WhatsApp de suporte > grupo
function comprar(id) {
  const p = planos.find((x) => x.id === id);
  if (!p) return;
  if (p.checkout) return window.open(p.checkout, "_blank", "noopener");
  const link = linkWhatsapp(config.whatsapp || config.whatsappSuporte, `Olá! Quero me matricular no plano ${p.nome} da ${config.nome}.`);
  window.open(link || config.suporte, "_blank", "noopener");
}

// ===================== LOGIN =====================
let usuarioAtual = null;

function abrirLogin() {
  if (usuarioAtual) return irParaArea(usuarioAtual);
  $("#loginErro").textContent = "";
  abrirModal("#loginModal");
  setTimeout(() => $("#loginEmail").focus(), 50);
}
$("#btnEntrar").addEventListener("click", abrirLogin);
$$("[data-open-login]").forEach((b) => b.addEventListener("click", abrirLogin));

$("#loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const erro = $("#loginErro");
  erro.textContent = "";
  if (!configurado) {
    erro.textContent = "Firebase ainda não configurado (js/firebase-config.js).";
    return;
  }
  const btn = $("#loginBtn");
  btn.disabled = true;
  btn.textContent = "Entrando...";
  erro.textContent = await entrar($("#loginEmail").value, $("#loginSenha").value);
  btn.disabled = false;
  btn.textContent = "Entrar";
});

$("#esqueciSenha").addEventListener("click", async () => {
  const email = $("#loginEmail").value.trim();
  const erro = $("#loginErro");
  if (!email) {
    erro.textContent = "Digite seu e-mail acima e clique novamente.";
    $("#loginEmail").focus();
    return;
  }
  if (!configurado) return;
  erro.textContent = await redefinirSenha(email);
  if (!erro.textContent) toast("Se o e-mail estiver cadastrado, você vai receber um link para criar sua senha.");
});

if (configurado) {
  onAuthStateChanged(auth, (user) => {
    usuarioAtual = user;
    $("#btnEntrar span").textContent = user ? "Minha área" : "Entrar";
  });
}

ligarBotoesInstalar();
carregarSite();
