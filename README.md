# Irmãos do Asfalto — Clube de Benefícios

Sistema web responsivo para um motoclube focado em motoboys entregadores, com identidade Dark/Premium inspirada em asfalto, aço, patches de colete e sinalização de pista.

## Stack

- Frontend: React + Vite + Tailwind CSS + React Router DOM
- Backend: Node.js + Express
- Banco: MongoDB + Mongoose
- Autenticação: JWT em cookies HTTP-Only
- Deploy: Render

## Versão atual

**v1.3.0 — Estrada Premium**

Esta versão adiciona a nova Home pública, Escudo Digital redesenhado como patch de motoclube, navegação mobile refinada, microinterações e base PWA instalável. O QR continua dependente de conexão para preservar a validação antifraude.

## Módulos implementados

### Associado

- cadastro;
- login/logout;
- perfil com moto, placa e patente;
- assinatura ativa/inativa;
- Escudo Digital;
- QR Code dinâmico com HMAC-SHA256 e expiração curta;
- área de benefícios;
- carteira/assinatura;
- área SOS 24H preparada para integração real.

### Parceiro comercial

- autenticação própria em `/parceiro`;
- sessão separada do associado;
- leitura de QR pela câmera usando `BarcodeDetector` quando disponível;
- fallback de entrada manual;
- validação do status do associado;
- histórico das últimas validações.

### Diretoria

- visão geral com membros ativos, parceiros, benefícios e validações do dia;
- listagem de membros;
- alteração de patente;
- ativação/suspensão de assinatura;
- cadastro visual de parceiros e benefícios pelo painel;
- busca de membros;
- endpoints administrativos correspondentes.

## Estrutura principal

```text
motoclube-beneficios/
├─ backend/
│  ├─ scripts/
│  │  └─ seed-demo.js
│  └─ src/
│     ├─ config/
│     ├─ controllers/
│     ├─ middlewares/
│     ├─ models/
│     ├─ routes/
│     ├─ services/
│     └─ utils/
├─ frontend/
│  └─ src/
│     ├─ components/
│     ├─ contexts/
│     ├─ pages/
│     └─ services/
└─ render.yaml
```

## Rotas principais

### Associado

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/qr/me`
- `GET /api/benefits`

### Parceiro

- `POST /api/partner/auth/login`
- `GET /api/partner/auth/me`
- `POST /api/partner/auth/logout`
- `GET /api/partner/auth/validations`
- `POST /api/partner/qr/validate`

### Diretoria

- `GET /api/admin/overview`
- `GET /api/admin/members`
- `GET /api/admin/partners`
- `PATCH /api/admin/members/:id/patente`
- `PATCH /api/admin/members/:id/status`
- `POST /api/admin/partners`
- `POST /api/admin/benefits`

### Pagamento

- `POST /api/payments/webhook`

## Como rodar

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Seed de demonstração

Defina `DEMO_ADMIN_PASSWORD` e `DEMO_PARTNER_PASSWORD` no `.env` do backend e execute:

```bash
npm run seed:demo
```

O seed cria um usuário Diretoria, um parceiro comercial e um benefício de demonstração. Ele é bloqueado em produção por padrão.

## Cookies no Render

Quando frontend e API estiverem em hosts diferentes, o Blueprint usa `COOKIE_SAME_SITE=none` e produção exige HTTPS (`Secure`). Para uma implantação comercial, prefira domínio próprio com frontend e API sob o mesmo domínio organizacional, por exemplo:

```text
app.seumotoclube.com.br
api.seumotoclube.com.br
```

Isso reduz problemas de cookies de terceiros e deixa a arquitetura mais previsível.

## Próximas evoluções recomendadas

- checkout real PIX/cartão;
- criação visual de parceiros e benefícios pelo painel Diretoria;
- geolocalização e distância real até parceiros;
- push notifications;
- recuperação de senha;
- MFA para Diretoria;
- auditoria administrativa completa;
- regras de uso por benefício e limite de resgates;
- checkout real PIX/cartão;
- geolocalização e distância real até parceiros;
- push notifications;
- testes automatizados e observabilidade.


## Experiência visual v1.3

- Home pública com identidade de estrada;
- Escudo Digital com rockers, rebites, patente, estrelas e lema;
- estado ativo/inativo visualmente distinto;
- navegação inferior com SOS central destacado;
- animação de pista leve e respeitando `prefers-reduced-motion`;
- PWA com manifest e service worker;
- fallback offline informando que o QR precisa de internet;
- aba ativa preservada durante a sessão;
- QR e endpoints de API não entram no cache do service worker.
