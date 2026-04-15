# 🧬 GitHub DNA Visualizer

GitHubユーザー名を入力すると、その開発者のGitHub活動データを美しく可視化する Web アプリケーションです。「DNA」の比喩で、その人の開発スタイル・個性が一目でわかるビジュアルを生成します。

Enter a GitHub username to generate a beautiful visualization of that developer's activity — revealing their unique "development DNA": coding style, personality traits, and contribution patterns.

---

## ✨ Features

- 🔬 **Language DNA** — Donut chart of language distribution across all repos
- 📊 **Activity Rhythm** — GitHub-style contribution heatmap for the past year
- ⭐ **Star Distribution** — Horizontal bar chart of top 10 starred repos
- 🎯 **Personality Score** — 5-axis radar chart (Creator / Collaborator / Communicator / Maintainer / Explorer)
- 📈 **Development Timeline** — Year-by-year repo creation and star growth
- 🖼️ **Share Card** — Download a 1200×630 SVG card (perfect for social sharing)
- 📄 **README Generator** — Auto-generate a GitHub profile README
- 🔗 **URL Sharing** — Load any user directly via `/?user=torvalds`
- ⚖️ **Compare Mode** — Side-by-side view at `/compare?a=user1&b=user2`
- 🌍 **Bilingual UI** — Japanese / English toggle

---

## 🚀 Quick Start (Docker Compose)

**Prerequisites:** Docker + Docker Compose

```bash
# 1. Clone the repository
git clone https://github.com/lingmulongtai/github-dna-visualizer.git
cd github-dna-visualizer

# 2. Configure the backend
cp backend/.env.example backend/.env
# (Optional but recommended) Edit backend/.env and set your GITHUB_TOKEN

# 3. Start the application
docker compose up --build

# 4. Open in your browser
open http://localhost
```

The frontend runs at **http://localhost** and the backend API at **http://localhost:3001**.

---

## 🛠️ Development Setup

### Prerequisites

- Node.js 20+
- GitHub Personal Access Token (recommended — see [Environment Variables](#environment-variables))

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env and set GITHUB_TOKEN (optional but recommended)
npm install
npm run dev    # http://localhost:3001
```

### Frontend

```bash
cd frontend
npm install
npm run dev    # http://localhost:5173
```

The Vite dev server automatically proxies `/api` requests to the backend.

### Running Tests

```bash
# Backend tests (Jest + Supertest)
cd backend && npm test

# Frontend tests (Vitest)
cd frontend && npm test
```

---

## 📁 Project Structure

```
github-dna-visualizer/
├── frontend/                  # React + Vite + TypeScript SPA
│   ├── src/
│   │   ├── components/        # UI components (charts, heatmap, etc.)
│   │   ├── hooks/             # Custom React hooks
│   │   ├── utils/             # Pure utility functions
│   │   ├── i18n.ts            # Japanese / English translations
│   │   ├── types.ts           # TypeScript interfaces
│   │   └── App.tsx            # Main app + routing
│   ├── Dockerfile
│   └── nginx.conf
├── backend/                   # Node.js + Express REST API
│   ├── src/
│   │   ├── routes/            # Express route handlers
│   │   ├── services/          # GitHub API client + SVG card generator
│   │   ├── __tests__/         # Jest tests
│   │   ├── index.ts           # Express app (no listen — importable by tests)
│   │   └── server.ts          # Entry point (calls app.listen)
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## 🔧 Environment Variables

### `backend/.env`

| Variable | Required | Default | Description |
|---|---|---|---|
| `GITHUB_TOKEN` | No | — | GitHub PAT. Without it: 60 req/h. With it: 5000 req/h. [Create here](https://github.com/settings/tokens) — no scopes needed for public repos. |
| `PORT` | No | `3001` | Backend listen port |
| `NODE_ENV` | No | `development` | Set to `production` in Docker |
| `CORS_ORIGIN` | No | `http://localhost:5173,http://localhost:4173` | Comma-separated allowed origins |

### `frontend/.env`

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_API_URL` | No | `""` | Backend URL. Leave empty in development (Vite proxy handles it). Set to backend URL in production (e.g. `http://localhost:3001`). |

---

## 🌐 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check — returns `{ status: "ok", timestamp }` |
| `GET` | `/api/user/:username` | Aggregated GitHub data (REST + GraphQL) |
| `POST` | `/api/card/generate` | Generate SVG card from user data |

### Rate Limiting

- General API: 100 requests / 15 minutes / IP
- User lookup endpoint: 10 requests / minute / IP (each call makes ~30 GitHub API calls internally)
- Server-side in-memory cache: 10-minute TTL (reduces GitHub API load)

---

## 🏗️ Tech Stack

### Frontend
- React 18 + TypeScript
- Vite 5
- Tailwind CSS 3 (GitHub dark theme)
- Framer Motion (animations)
- Recharts (charts)
- React Router 6

### Backend
- Node.js 20 + Express 4 + TypeScript
- Helmet (security headers)
- express-rate-limit
- Morgan (HTTP logging)
- node-fetch (GitHub API)

---

## ディレクトリ構成（日本語）

```
github-dna-visualizer/
├── frontend/          # React + Vite + TypeScript フロントエンド
│   ├── src/
│   │   ├── components/   # UIコンポーネント
│   │   ├── hooks/        # カスタムフック
│   │   ├── utils/        # ユーティリティ関数
│   │   ├── i18n.ts       # 多言語定義
│   │   ├── types.ts      # 型定義
│   │   └── App.tsx       # メインアプリ
│   └── package.json
├── backend/           # Node.js + Express バックエンドAPI
│   ├── src/
│   │   ├── routes/       # APIルート
│   │   ├── services/     # GitHub API・カード生成サービス
│   │   └── index.ts      # Expressアプリ（テスト可能な形で分離）
│   └── package.json
└── docker-compose.yml
```

## セットアップ（日本語）

### バックエンドの起動

```bash
cd backend
cp .env.example .env
# .env に GITHUB_TOKEN を設定（オプションだが推奨）
npm install
npm run dev
```

### フロントエンドの起動

```bash
cd frontend
npm install
npm run dev
```

フロントエンドは http://localhost:5173 で起動します（API は自動的にバックエンドにプロキシされます）。

### GitHub Token なしでも動作しますが、レート制限（60 req/h）に引っかかりやすくなります。Token あり: 5000 req/h。
