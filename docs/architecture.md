# Architecture

## Overview

StickyBoard is a single-page Next.js application (App Router, TypeScript) that renders a fixed-size whiteboard where users can create, edit, move, resize, and delete sticky notes.

## Data Flow

```
localStorage
     ↑↓
notesApi.ts   ← async mock REST (150–300ms delay)
     ↑↓
NotesContext  ← React Context, source of truth for all components
     ↑↓
Board → StickyNote / FloatingToolbar / TrashZone / Header
```

## State Management

`NotesContext` holds the full `Note[]` array. All mutations go through context methods (`addNote`, `updateNote`, `deleteNote`, `bringToFront`, etc.), which call the mock API and optimistically update local state.

## Component Tree

```
page.tsx
└── NotesProvider
    ├── Header
    └── Board
        ├── StickyNote (×N)
        │   └── FloatingToolbar (when selected)
        └── TrashZone
```

## Custom Hooks

| Hook | Responsibility |
|------|---------------|
| `useDrag` | Mouse-based drag logic with board-boundary clamping |
| `useResize` | Edge/corner resize logic with min-size and board-boundary clamping |
| `useNotes` | Re-exports `useNotesContext` for ergonomic imports |

## Persistence

All note data is persisted in `localStorage` under the key `stickyboard_notes`. The mock API layer (`notesApi.ts`) handles all reads and writes; components never access `localStorage` directly.
