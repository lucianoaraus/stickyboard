# Components

## Header

Floating, centered, fixed-position bar displaying the StickyBoard brand logo and title. Pure presentational — no props.

## Board

The main whiteboard container (1400×900px). Handles:
- Click-to-create notes (clamped to board bounds)
- Deselect on board click
- Passes `boardRef` down to notes for constraint calculations
- Manages `selectedId` state
- Renders `TrashZone` and all `StickyNote` instances

## StickyNote

Renders a single note. Responsibilities:
- Dragging via `useDrag` (clamped to board)
- Resizing via `useResize` (all 8 handles, clamped to board)
- `contenteditable` rich text editor (synced to context on blur)
- Renders `FloatingToolbar` when selected
- Reports drag-over-trash state to Board

## FloatingToolbar

Appears above the selected note. Contains:
- **Format** panel: bold, italic, underline, strikethrough, unordered list, ordered list (via `document.execCommand`)
- **Size** panel: S (160px), M (220px), L (300px)
- **Color** panel: yellow, teal, purple, pink swatches
- **Arrange** panel: Bring to Front, Bring Forward, Send Backward, Send to Back
- **Delete** button: immediate deletion, no confirmation

Only one secondary panel open at a time. Clicking outside the note closes the toolbar.

## TrashZone

Fixed bottom-right icon. Receives `isActive` boolean. When active (note dragged over it), applies a CSS keyframe shake animation and changes color to danger red. Dropping a note on it triggers deletion via Board.
