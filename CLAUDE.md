# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run setup        # First-time setup: install deps, generate Prisma client, run migrations
npm run dev          # Start dev server with Turbopack at http://localhost:3000
npm run dev:daemon   # Start dev server in background, logs written to logs.txt
npm run build        # Build for production
npm run lint         # Run ESLint
npm run test         # Run all Vitest tests
npm run db:reset     # Reset the SQLite database
```

All commands require `NODE_OPTIONS='--require ./node-compat.cjs'` (injected automatically via `package.json`). This fixes a Node.js 25+ incompatibility where Web Storage APIs break SSR.

To run a single test file: `npx vitest run src/lib/transform/__tests__/jsx-transformer.test.ts`

## Architecture

UIGen is an AI-powered React component generator. Users describe components in natural language; Claude generates/edits them in a **virtual file system** (in-memory only, no disk writes) and a live preview renders the result.

### Request Flow

1. User sends a message → `POST /api/chat` (`src/app/api/chat/route.ts`)
2. Server streams Claude AI responses via Vercel AI SDK
3. Claude uses two tools to modify files:
   - `str_replace_editor` — precise string replacement in files
   - `file_manager` — create/delete/list files
4. Tool results update the virtual file system on the client via `FileSystemContext`
5. Preview iframe re-renders the changed component

### Virtual File System

`src/lib/file-system.ts` — in-memory tree structure. Serialized to JSON and stored in the `Project.data` DB column for authenticated users. The AI always creates `/App.jsx` as the component entrypoint.

### AI Provider

`src/lib/provider.ts` — uses `claude-haiku-4-5` (Anthropic) when `ANTHROPIC_API_KEY` is set in `.env`. Without a key, falls back to a `MockLanguageModel` that returns static component templates (useful for UI development without API costs).

### State Management

- `src/lib/contexts/file-system-context.tsx` — owns virtual FS state; executes tool calls from AI
- `src/lib/contexts/chat-context.tsx` — owns conversation history; wraps Vercel AI SDK's `useChat`

### Authentication

JWT-based, stored in httpOnly cookies. Server actions in `src/actions/` handle session management. Middleware (`src/middleware.ts`) protects API routes. Users can use the app anonymously (limited by `anon-work-tracker.ts`).

### Database

SQLite via Prisma. Schema is defined in `prisma/schema.prisma` — reference it whenever you need to understand the structure of data stored in the database. Two models: `User` and `Project`. `Project.messages` stores chat history as JSON; `Project.data` stores the virtual file system as JSON.

### Key Directories

| Path | Purpose |
|------|---------|
| `src/app/api/chat/route.ts` | Main AI streaming endpoint |
| `src/lib/tools/` | AI tool definitions (`str-replace.ts`, `file-manager.ts`) |
| `src/lib/prompts/generation.tsx` | System prompt sent to Claude |
| `src/lib/transform/jsx-transformer.ts` | Compiles JSX/TS for the preview iframe |
| `src/components/preview/PreviewFrame.tsx` | Renders the live component preview |
| `src/actions/` | Next.js server actions for project CRUD |

### Path Aliases

`@/*` maps to `./src/*` (configured in `tsconfig.json`).

### UI Components

Shadcn/ui with Radix UI primitives, Tailwind CSS v4, New York style variant. Component config in `components.json`.

## Code Style

Use comments sparingly. Only comment complex code.
