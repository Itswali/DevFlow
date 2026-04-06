# DevFlow

A developer-focused task and project management platform built with **Next.js 15**, **TypeScript**, **Tailwind CSS**, **MongoDB (Mongoose)**, and **better-auth**.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database | MongoDB via Mongoose |
| Auth | better-auth |
| State | Zustand |
| UI Icons | lucide-react |
| Utilities | clsx, tailwind-merge |

## Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/        # Login page
│   │   └── register/     # Register page
│   ├── globals.css       # Global styles + dark brutalist theme
│   ├── layout.tsx        # Root layout (Syne + JetBrains Mono fonts)
│   └── page.tsx          # Home page
├── actions/              # Next.js Server Actions
├── components/
│   └── ui/               # Shadcn/UI components
├── lib/
│   ├── auth.ts           # better-auth configuration
│   └── db.ts             # MongoDB connection (with HMR-safe cache)
├── models/               # Mongoose schemas
└── store/                # Zustand stores
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the example env file and fill in your values:

```bash
cp .env.local.example .env.local
```

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `BETTER_AUTH_SECRET` | Random secret for better-auth (min 32 chars) |
| `NEXT_PUBLIC_APP_URL` | Public URL of the app (e.g. `http://localhost:3000`) |

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

You can start editing the home page by modifying `src/app/page.tsx`.

## Fonts

This project uses **[Syne](https://fonts.google.com/specimen/Syne)** for headings and body text, and **[JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono)** for monospace/code blocks. Both are loaded at runtime via a CSS `@import` from Google Fonts in `globals.css`.

## Theme

The UI follows a **Dark Brutalist** aesthetic:

- Background: `#0a0a0f`
- Card background: `#16161f`
- Accent Purple: `#7c6aff`
- Accent Pink: `#ff6a8a`
- Accent Teal: `#6affd4`

A `.glass-card` utility class is available for frosted-glass panels.

## Deploy

The easiest way to deploy is via [Vercel](https://vercel.com/new). See the [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying) for details.
