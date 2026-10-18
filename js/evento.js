// Página pública de um evento: evento.html?e=<endereço-do-evento>
import {
  db, configurado, collection, doc, query, where, getDocs, writeBatch, increment, serverTimestamp,
} from "./firebase.js";
import { esc } from "./comum.js";
import { renderEvento, atualizarContagem, youtubeId, EVENTO_FORTALEZAS, LOGO } from "./evento-site.js";
import { iniciarEfeitos, somSucesso } from "./efeitos.js";

const root = document.getElementById("evento");
const modal = document.getElementById("videoModal");
const tela = document.getElementById("videoTela");
const slug = (new URLSearchParams(location.search).get("e") || "").trim().toLowerCase();
let ev = null;
let evId = null;
const demo = !configurado;

function aviso(titulo, texto) {
  root.classList.remove("carregando");
  root.innerHTML = `<div class="e-aviso"><img src="${LOGO}" alt="" style="width:90px;border-radius:50%;background:#f6efe0;padding:6px" />
    <h1 class="gold">${esc(titulo)}</h1><p>${esc(texto)}</p><a class="e-btn" href="index.html">Ir para o site da Pastora Simone</a></div>`;
}

async function buscar() {
  // As regras do Firestore só mostram eventos publicados ou encerrados,
  // então cada consulta precisa pedir exatamente um desses status.
  for (const status of ["publicado", "encerrado"]) {
    const r = await getDocs(query(collection(db, "eventos"), where("slug", "==", slug), where("status", "==", status)));
    if (!r.empty) return r.docs[0];
  }
  return null;
}

async function carregar() {
  if (demo) {
    document.getElementById("demo").hidden = false;
    ev = { ...EVENTO_FORTALEZAS, status: "publicado", inscritos: 0 };
  } else {
    if (!slug) return aviso("Evento não informado", "Confira o link que você recebeu.");
    try {
      const d = await buscar();
      if (!d) return aviso("Evento não encontrado", "Este evento não existe ou ainda não foi publicado.");
      evId = d.id;
      ev = d.data();
    } catch (e) {
      console.error(e);
      return aviso("Não foi possível abrir o evento", "Verifique sua internet e tente de novo.");
    }
  }
  document.title = `${ev.nome} · Pastora Simone`;
  document.querySelector('meta[name="description"]').content = ev.frase || `${ev.nome} com a Pastora Simone.`;
  document.querySelector('meta[name="theme-color"]').content = ev.corFundo || "#1a1510";
  document.body.style.background = ev.corFundo || "#1a1510";
  root.classList.remove("carregando");
  renderEvento(root, ev, { prefixo: "ev", onVideo: abrirVideo, onInscrever: inscrever });
  setInterval(() => atualizarContagem(root, ev), 1000);
  // o vídeo do convite só abre depois da abertura "A muralha cai"
  iniciarEfeitos(root, ev).then(() => {
    if (ev.videoAuto && youtubeId(ev) && ev.status === "publicado") abrirVideo();
  });
}

async function inscrever(dados) {
  if (demo) {
    await new Promise((r) => setTimeout(r, 400));
    somSucesso();
    return "";
  }
  try {
    const evRef = doc(db, "eventos", evId);
    const insRef = doc(collection(db, "eventos", evId, "inscricoes"));
    const batch = writeBatch(db);
    batch.set(insRef, { ...dados, noGrupo: false, criadoEm: serverTimestamp() });
    batch.update(evRef, { inscritos: increment(1), ultimaInscricao: insRef.id });
    await batch.commit();
    ev.inscritos = (Number(ev.inscritos) || 0) + 1;
    somSucesso();
    return "";
  } catch (e) {
    console.error(e);
    if ((e.code || "").includes("permission-denied")) return "Não foi possível concluir: as inscrições podem ter sido encerradas ou as vagas acabaram. Atualize a página.";
    if ((e.code || "").includes("unavailable")) return "Sem conexão. Verifique sua internet e tente de novo.";
    return "Não foi possível concluir a inscrição. Tente novamente.";
  }
}

// Vídeo do convite: abre por cima do site. Começa sem som, porque os navegadores
// bloqueiam vídeo com som tocando sozinho; a pessoa liga o som no próprio player.
function abrirVideo() {
  const id = youtubeId(ev);
  if (!id) return;
  tela.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&rel=0&playsinline=1&modestbranding=1" title="Convite: ${esc(ev.nome)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
  modal.hidden = false;
}
function fecharVideo() {
  modal.hidden = true;
  tela.innerHTML = "";
}
document.getElementById("videoFechar").addEventListener("click", fecharVideo);
modal.addEventListener("click", (e) => { if (e.target === modal) fecharVideo(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !modal.hidden) fecharVideo(); });

carregar();
