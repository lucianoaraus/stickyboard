# StickyBoard

A single-page sticky notes board built with Next.js (App Router), TypeScript, and SASS Modules.

## Features

- Click anywhere on the board to create a new sticky note
- Drag notes freely across the board
- Resize notes by dragging any edge or corner (8 handles)
- Rich text formatting: bold, italic, underline, strikethrough, lists
- 4 note colors: yellow, teal, purple, pink
- 3 note sizes: S (160px), M (220px), L (300px)
- Layer control: Bring to Front, Bring Forward, Send Backward, Send to Back
- Drag notes onto the trash icon to delete them
- All notes persisted in `localStorage`

## Tech Stack

- **Next.js 16** (App Router)
- **TypeScript** (strict mode)
- **SASS Modules** (no Tailwind, no CSS-in-JS)
- **React Context** for state management
- Custom hooks: `useDrag`, `useResize`, `useNotes`
- Mock REST API with simulated network latency

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Docker

```bash
docker-compose up
```

## Project Structure

```
src/
  agents/        # Placeholder for future AI agent modules
  skills/        # Placeholder for future AI skill modules
  api/           # Mock REST API (notesApi.ts)
  components/    # Board, Header, StickyNote, FloatingToolbar, TrashZone
  context/       # NotesContext (React Context)
  hooks/         # useDrag, useResize, useNotes
  styles/        # _variables.scss, _reset.scss, globals.scss
  types/         # Note interface and related types
  app/           # Next.js App Router (layout.tsx, page.tsx)
docs/            # Architecture and component documentation
```

## Docs

- [Architecture](docs/architecture.md)
- [Components](docs/components.md)
