// Envia uma notificação push ao painel da Pastora a cada nova inscrição em um evento.
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");

initializeApp();

exports.avisarInscricao = onDocumentCreated("eventos/{eventoId}/inscricoes/{inscricaoId}", async (event) => {
  const db = getFirestore();
  const ins = event.data?.data() || {};
  const ev = (await db.doc(`eventos/${event.params.eventoId}`).get()).data() || {};
  const tokens = (await db.collection("adminPush").get()).docs.map((d) => d.id);
  if (!tokens.length) return;
  const total = Number(ev.inscritos) || 0;
  const resp = await getMessaging().sendEachForMulticast({
    tokens,
    data: {
      titulo: `Nova inscrição · ${ev.nome || "Evento"}`,
      corpo: `${ins.nome || "Alguém"} se inscreveu${total ? `. Total: ${total}${ev.vagas ? " de " + ev.vagas : ""}.` : "."}`,
      url: "admin.html",
    },
    webpush: { headers: { Urgency: "high", TTL: "86400" } },
  });
  // remove aparelhos que não existem mais
  const mortos = [];
  resp.responses.forEach((r, i) => {
    const c = r.error?.code || "";
    if (!r.success && (c.includes("registration-token-not-registered") || c.includes("invalid-argument"))) mortos.push(tokens[i]);
  });
  await Promise.all(mortos.map((t) => db.doc(`adminPush/${t}`).delete()));
});
