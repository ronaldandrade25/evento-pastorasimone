// =====================================================================
// CONFIGURAÇÃO DO FIREBASE · Pastora Simone
// 1. Firebase Console > Configurações do projeto > Seus apps > Web (</>)
// 2. Copie o objeto firebaseConfig e cole abaixo (substituindo os COLE_...)
// =====================================================================
export const firebaseConfig = {
  apiKey: "AIzaSyB07An-508yXHvoCApjt9WZBvcU5vF1ABQ",
  authDomain: "pastorasimone-82def.firebaseapp.com",
  projectId: "pastorasimone-82def",
  storageBucket: "pastorasimone-82def.firebasestorage.app",
  messagingSenderId: "1092633207838",
  appId: "1:1092633207838:web:669ab6145bea697edd3a0f"
};

// E-mail do SUPERADMIN (sempre em letras minúsculas).
// Quem fizer login com este e-mail entra no painel da Pastora (admin.html).
// IMPORTANTE: use o MESMO e-mail no arquivo firestore.rules.
export const SUPERADMIN_EMAIL = "pastorasimone@gmail.com";
