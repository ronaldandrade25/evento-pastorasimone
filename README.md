# Pastora Simone · Escola Bíblica

Plataforma de aulas da Pastora Simone: site de vendas, área do aluno, painel da Pastora e
**sites de eventos com inscrição**. Usa **Firebase** (Authentication + Firestore).
HTML, CSS e JavaScript puros, sem build.

## Estrutura

```
index.html          → Site de vendas (cursos, próximos eventos, planos, sobre, dúvidas)
login.html          → Tela de login (é por onde o app instalado abre)
aluno.html          → Área de estudos do aluno (aulas, progresso, materiais, perfil, versículo do dia)
admin.html          → Painel da Pastora (aulas, alunos, materiais, EVENTOS, gestão, financeiro, configurações)
evento.html         → Site público de cada evento: evento.html?e=<endereço-do-evento>
css/plataforma.css  → Visual da plataforma (ouro e marfim)
css/evento.css      → Visual dos sites de eventos
js/firebase-config.js → SEUS dados do Firebase e o e-mail da administradora
js/firebase.js      → Inicialização do Firebase
js/comum.js         → Funções compartilhadas e textos padrão
js/evento-site.js   → Monta o site do evento (usado na página pública e na prévia do painel)
js/vendas.js | js/aluno.js | js/admin.js | js/evento.js | js/login.js | js/acesso.js | js/player.js | js/pwa.js
img/                → Logo e imagens do primeiro evento
firestore.rules     → Regras de segurança do banco
firebase.json       → Para publicar com o Firebase CLI
```

## Configuração (uma vez só)

1. **Crie um projeto novo** em https://console.firebase.google.com (ex.: `pastora-simone`).
2. **Authentication** → Começar → em *Método de login*, ative **E-mail/senha**.
3. **Authentication → Usuários → Adicionar usuário**: crie a conta da **administradora** (e-mail e senha).
   > Faça isso **antes** de publicar o site.
4. **Firestore Database** → Criar banco de dados (modo produção, região `southamerica-east1`).
5. **Regras do Firestore**: abra `firestore.rules`, troque `admin@seudominio.com` pelo e-mail da
   administradora (em minúsculas) e cole tudo em *Firestore → Regras → Publicar*.
6. **Configurações do projeto → Seus apps → Web (</>)**: registre o app e copie o `firebaseConfig`.
   Cole em `js/firebase-config.js` e troque também o `SUPERADMIN_EMAIL` (o mesmo e-mail do passo 5).
7. **Authentication → Configurações → Domínios autorizados**: adicione o domínio do site
   (ex.: `pastorasimone.com.br`). `localhost` já vem liberado.
8. Opcional: em **Authentication → Modelos → Redefinição de senha**, mude o idioma para português.

## Primeiro uso

1. Abra o site, clique em **Entrar** e entre com o e-mail da administradora.
2. **Configurações**: crie os **planos** (se não criar, aparecem Semente, Discípula e Ministério),
   envie a **foto da Pastora**, ajuste textos, versículo do topo e o **WhatsApp**.
3. **Aulas**: em **Módulos**, confira os cursos (já vêm Panorama Bíblico, Oração e Intimidade,
   Mulheres de Propósito, Fundamentos da Fé, Família segundo Deus e Liderança Cristã) e cadastre as
   aulas com o link do YouTube (deixe os vídeos como **Não listado**).
4. **Materiais**: cadastre apostilas e arquivos (nome + link do Google Drive).
5. **Alunos → Novo aluno**: cadastre um aluno de teste com e-mail e senha e entre com ele.

## Eventos

No painel, menu **Eventos**:

- Na primeira vez, clique em **Criar evento “Derrubando as Fortalezas”**: o evento já vem montado
  com a arte, as cores, a frase e o versículo. **Data, local, vagas e depoimentos são de exemplo**:
  troque antes de publicar.
- O editor tem as abas **Geral, Cores e imagens, Vídeo, Sobre, Depoimentos, Localização,
  Inscrição e Inscritos**. Ao lado, a **prévia no celular** mostra o site enquanto você edita.
- **Vídeo**: cole o link do YouTube e marque “Abrir o vídeo assim que o site carregar”. O vídeo
  começa sem som (regra dos navegadores) e a pessoa liga o som no player.
- **Grupo VIP**: cole o link do grupo do WhatsApp e envie a imagem do QR Code.
- Clique em **Salvar alterações** e depois em **Publicar**. Use **Copiar** para pegar o link e
  divulgar. Eventos publicados também aparecem em “Próximos eventos” no site de vendas.
- **Encerrar inscrições**: o site continua no ar, mas o formulário fecha.
  **Voltar para rascunho**: o site sai do ar.
- **Inscritos**: a lista atualiza sozinha. Marque quem já entrou no grupo, chame no WhatsApp,
  exporte a planilha (CSV) ou exclua uma inscrição (a vaga volta a ficar livre).

Segurança (já nas regras): quem não está logado só vê eventos publicados e só consegue **criar**
uma inscrição, somando 1 no contador, sem passar do número de vagas. A lista de inscritos só a
administradora vê.

> As imagens enviadas no painel são reduzidas automaticamente e guardadas no próprio evento
> (não precisa de Firebase Storage). Se o evento passar de 1 MB, o painel avisa para usar imagens menores.

## Rodando no computador

Os arquivos usam módulos JavaScript, então **não funcionam abrindo o HTML direto** (`file://`).
Use um servidor local:

- VS Code: extensão **Live Server** → botão "Go Live"; ou
- Terminal, dentro da pasta: `npx serve .`

Sem o `js/firebase-config.js` preenchido, o site mostra um aviso, e `evento.html` abre em
**modo demonstração** com o evento “Derrubando as Fortalezas”.

## Publicando

Qualquer hospedagem de arquivos estáticos serve (Firebase Hosting, Netlify, Vercel, GitHub Pages).
Com o Firebase CLI: `npm i -g firebase-tools`, `firebase login`, `firebase use --add` e
`firebase deploy` (publica o site e as regras do Firestore).

## App no celular

O site pode ser instalado como app (botão **Instalar app**). O app abre direto na tela de login.
