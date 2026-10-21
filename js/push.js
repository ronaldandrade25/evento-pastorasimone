// Notificações push do painel: avisam a Pastora de novas inscrições mesmo com o app fechado.
// O aparelho registra um token no Firestore (adminPush); a Cloud Function de /functions envia o aviso.
import { app, db, configurado, doc, setDoc, deleteDoc, serverTimestamp } from "./firebase.js";
import { VAPID_KEY } from "./firebase-config.js";
import { registrarSW } from "./pwa.js";

const CHAVE = "push-token";
export const pushSuportado = () => configurado && "Notification" in window && "serviceWorker" in navigator && "PushManager" in window;
export const pushAtivo = () => {
  try { return Notification.permission === "granted" && !!localStorage.getItem(CHAVE); } catch { return false; }
};

// Retorna "" se deu certo, ou a mensagem de erro para mostrar
export async function ativarPush() {
  if (!pushSuportado()) return "Este aparelho não aceita notificações. No iPhone, instale o app (Compartilhar > Adicionar à Tela de Início) e abra por ele.";
  if (String(VAPID_KEY).startsWith("COLE_")) return "Falta a chave VAPID em js/firebase-config.js.";
  const permissao = Notification.permission === "default" ? await Notification.requestPermission() : Notification.permission;
  if (permissao !== "granted") return "Notificações bloqueadas. Libere nas configurações do navegador/aplicativo e tente de novo.";
  try {
    const { getMessaging, getToken } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging.js");
    const reg = await registrarSW();
    if (!reg) return "Não foi possível iniciar o aplicativo de avisos.";
    await navigator.serviceWorker.ready;
    const token = await getToken(getMessaging(app), { vapidKey: VAPID_KEY, serviceWorkerRegistration: reg });
    if (!token) return "Não foi possível ativar os avisos neste aparelho.";
    await setDoc(doc(db, "adminPush", token), { criadoEm: serverTimestamp(), aparelho: navigator.userAgent.slice(0, 160) });
    try { localStorage.setItem(CHAVE, token); } catch { /* sem armazenamento: o botão só volta a aparecer */ }
    return "";
  } catch (e) {
    console.error("Push:", e);
    return "Não foi possível ativar os avisos. Tente de novo.";
  }
}

export async function desativarPush() {
  let token = "";
  try { token = localStorage.getItem(CHAVE) || ""; localStorage.removeItem(CHAVE); } catch { /* ignora */ }
  if (token) await deleteDoc(doc(db, "adminPush", token)).catch(() => {});
}
