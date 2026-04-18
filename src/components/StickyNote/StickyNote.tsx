'use client';

import { useCallback, useEffect, useRef } from 'react';
import { Note } from '@/types';
import { useNotesContext } from '@/context/NotesContext';
import { useDrag, DragConstraints } from '@/hooks/useDrag';
import { useResize, ResizeHandle, ResizeConstraints } from '@/hooks/useResize';
import { FloatingToolbar } from '../FloatingToolbar/FloatingToolbar';
import styles from './StickyNote.module.scss';

const RESIZE_HANDLES: { handle: ResizeHandle; className: string; isCorner: boolean }[] = [
  { handle: 'nw', className: styles.nw, isCorner: true },
  { handle: 'ne', className: styles.ne, isCorner: true },
  { handle: 'sw', className: styles.sw, isCorner: true },
  { handle: 'se', className: styles.se, isCorner: true },
  { handle: 'n', className: styles.n, isCorner: false },
  { handle: 's', className: styles.s, isCorner: false },
  { handle: 'w', className: styles.w, isCorner: false },
  { handle: 'e', className: styles.e, isCorner: false },
];

const MAX_FONT = 24;
const MIN_FONT = 10;
const DRAG_THRESHOLD = 5;
const MAX_CHARS = 365;

function isOverTrashZone(noteEl: HTMLElement): boolean {
  const trash = document.querySelector<HTMLElement>('[data-trash-zone]');
  if (!trash) return false;
  const tr = trash.getBoundingClientRect();
  const nr = noteEl.getBoundingClientRect();
  return nr.right > tr.left && nr.left < tr.right && nr.bottom > tr.top && nr.top < tr.bottom;
}

interface StickyNoteProps {
  note: Note;
  isSelected: boolean;
  boardRef: React.RefObject<HTMLDivElement | null>;
  onSelect: (id: string) => void;
  onTrashHover: (isOver: boolean) => void;
  onDropOnTrash: (id: string) => void;
}

export function StickyNote({
  note,
  isSelected,
  boardRef,
  onSelect,
  onTrashHover,
  onDropOnTrash,
}: StickyNoteProps) {
  const { updateNote, bringToFront } = useNotesContext();
  const noteRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const overTrashRef = useRef(false);
  const fontSizeRef = useRef(MAX_FONT);
  const isEditorFocused = useRef(false);

  // ── Font size auto-scaling ──────────────────────────────────────────────────
  const recalcFontSize = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    const container = el.parentElement; // .content div
    if (!container) return;

    const available = container.clientHeight;
    let size = MAX_FONT;
    el.style.fontSize = `${size}px`;

    while (size > MIN_FONT && el.scrollHeight > available) {
      size -= 1;
      el.style.fontSize = `${size}px`;
    }

    fontSizeRef.current = size;
  }, []);

  // ── Drag ───────────────────────────────────────────────────────────────────
  const getDragConstraints = useCallback((): DragConstraints => {
    const board = boardRef.current;
    if (!board) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    return {
      minX: 0,
      minY: 0,
      maxX: board.offsetWidth - note.width,
      maxY: board.offsetHeight - note.height,
    };
  }, [boardRef, note.width, note.height]);

  const handleDragStart = useCallback(() => {
    bringToFront(note.id);
  }, [bringToFront, note.id]);

  const handleDrag = useCallback(
    (x: number, y: number) => {
      if (noteRef.current) {
        noteRef.current.style.left = `${x}px`;
        noteRef.current.style.top = `${y}px`;
      }
      const nowOver = noteRef.current ? isOverTrashZone(noteRef.current) : false;
      if (nowOver !== overTrashRef.current) {
        overTrashRef.current = nowOver;
        onTrashHover(nowOver);
      }
    },
    [onTrashHover]
  );

  const handleDragEnd = useCallback(
    (x: number, y: number) => {
      const nowOver = noteRef.current ? isOverTrashZone(noteRef.current) : false;
      onTrashHover(false);
      overTrashRef.current = false;
      if (nowOver) {
        onDropOnTrash(note.id);
        return;
      }
      updateNote(note.id, { x, y });
    },
    [note.id, updateNote, onTrashHover, onDropOnTrash]
  );

  const { startDrag } = useDrag({
    onDragStart: handleDragStart,
    onDrag: handleDrag,
    onDragEnd: handleDragEnd,
    getConstraints: getDragConstraints,
  });

  // ── Resize ─────────────────────────────────────────────────────────────────
  const getResizeConstraints = useCallback((): ResizeConstraints => {
    const board = boardRef.current;
    return {
      boardWidth: board?.offsetWidth ?? 1400,
      boardHeight: board?.offsetHeight ?? 900,
      minSize: 160,
      maxSize: 300,
    };
  }, [boardRef]);

  const handleResize = useCallback(
    (rect: { x: number; y: number; width: number; height: number }) => {
      if (noteRef.current) {
        noteRef.current.style.left = `${rect.x}px`;
        noteRef.current.style.top = `${rect.y}px`;
        noteRef.current.style.width = `${rect.width}px`;
        noteRef.current.style.height = `${rect.height}px`;
      }
    },
    []
  );

  const handleResizeEnd = useCallback(
    (rect: { x: number; y: number; width: number; height: number }) => {
      updateNote(note.id, { ...rect, size: null });
      setTimeout(recalcFontSize, 0);
    },
    [note.id, updateNote, recalcFontSize]
  );

  const { startResize } = useResize({
    onResize: handleResize,
    onResizeEnd: handleResizeEnd,
    getConstraints: getResizeConstraints,
  });

  // ── Interaction handlers ───────────────────────────────────────────────────
  const handleNoteMouseDown = useCallback(
    (e: React.MouseEvent) => {
      onSelect(note.id);

      if (isEditorFocused.current && editorRef.current?.contains(e.target as Node)) return;

      const startMouseX = e.clientX;
      const startMouseY = e.clientY;
      const noteStartX = note.x;
      const noteStartY = note.y;

      const handleUp = () => {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleUp);
      };

      const handleMove = (moveEvent: MouseEvent) => {
        const dx = Math.abs(moveEvent.clientX - startMouseX);
        const dy = Math.abs(moveEvent.clientY - startMouseY);
        if (dx <= DRAG_THRESHOLD && dy <= DRAG_THRESHOLD) return;
        handleUp();
        moveEvent.preventDefault();
        editorRef.current?.blur();
        startDrag(
          {
            clientX: moveEvent.clientX,
            clientY: moveEvent.clientY,
            preventDefault() {},
            stopPropagation() {},
          } as unknown as React.MouseEvent,
          noteStartX,
          noteStartY
        );
      };

      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleUp);
    },
    [note.id, note.x, note.y, onSelect, startDrag]
  );

  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent, handle: ResizeHandle) => {
      e.stopPropagation();
      onSelect(note.id);
      startResize(e, handle, {
        x: note.x,
        y: note.y,
        width: note.width,
        height: note.height,
      });
    },
    [note, onSelect, startResize]
  );

  const handleFocus = useCallback(() => {
    isEditorFocused.current = true;
  }, []);

  const handleBlur = useCallback(() => {
    isEditorFocused.current = false;
    if (editorRef.current) {
      updateNote(note.id, { content: editorRef.current.innerHTML });
    }
  }, [note.id, updateNote]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const el = editorRef.current;
    if (!el) return;
    if ((el.textContent?.length ?? 0) >= MAX_CHARS) {
      const isAllowed =
        e.key === 'Backspace' || e.key === 'Delete' ||
        e.key.startsWith('Arrow') || e.ctrlKey || e.metaKey;
      if (!isAllowed) e.preventDefault();
    }
  }, []);

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const plain = e.clipboardData.getData('text/plain');
      const el = editorRef.current;
      if (!el || !plain) return;
      const remaining = MAX_CHARS - (el.textContent?.length ?? 0);
      if (remaining <= 0) return;
      const text = plain.slice(0, remaining);
      const sel = window.getSelection();
      if (!sel?.rangeCount) return;
      const range = sel.getRangeAt(0);
      range.deleteContents();
      const node = document.createTextNode(text);
      range.insertNode(node);
      range.setStartAfter(node);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
      recalcFontSize();
    },
    [recalcFontSize]
  );

  // ── Sync content from state & recalc font ──────────────────────────────────
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (document.activeElement !== el) {
      el.innerHTML = note.content;
      recalcFontSize();
    }
  }, [note.content, recalcFontSize]);

  useEffect(() => {
    recalcFontSize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const boardRect = boardRef.current?.getBoundingClientRect() ?? null;

  return (
    <>
      {isSelected && (
        <FloatingToolbar note={note} boardRect={boardRect} />
      )}
      <div
        ref={noteRef}
        className={`${styles.note} ${styles[note.color]} ${isSelected ? styles.selected : ''}`}
        style={{
          left: note.x,
          top: note.y,
          width: note.width,
          height: note.height,
          zIndex: note.zIndex,
        }}
        onMouseDown={handleNoteMouseDown}
        data-note-id={note.id}
      >
        <div className={styles.content}>
          <div
            ref={editorRef}
            className={styles.editor}
            contentEditable
            suppressContentEditableWarning
            onInput={recalcFontSize}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>

        {RESIZE_HANDLES.map(({ handle, className, isCorner }) => (
          <div
            key={handle}
            className={`${styles.resizeHandle} ${isCorner ? styles.corner : styles.edge} ${className}`}
            style={{ background: 'transparent' }}
            onMouseDown={(e) => handleResizeMouseDown(e, handle)}
          />
        ))}
      </div>
    </>
  );
}
