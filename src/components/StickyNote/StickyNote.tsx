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

  const getResizeConstraints = useCallback((): ResizeConstraints => {
    const board = boardRef.current;
    return {
      boardWidth: board?.offsetWidth ?? 1400,
      boardHeight: board?.offsetHeight ?? 900,
      minSize: 100,
    };
  }, [boardRef]);

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

  const { startDrag, isDragging } = useDrag({
    onDragStart: handleDragStart,
    onDrag: handleDrag,
    onDragEnd: handleDragEnd,
    getConstraints: getDragConstraints,
  });

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
      updateNote(note.id, rect);
    },
    [note.id, updateNote]
  );

  const { startResize } = useResize({
    onResize: handleResize,
    onResizeEnd: handleResizeEnd,
    getConstraints: getResizeConstraints,
  });

  const handleNoteMouseDown = useCallback(
    (e: React.MouseEvent) => {
      onSelect(note.id);
      startDrag(e, note.x, note.y);
    },
    [note.id, note.x, note.y, onSelect, startDrag]
  );

  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent, handle: ResizeHandle) => {
      e.stopPropagation();
      startResize(e, handle, {
        x: note.x,
        y: note.y,
        width: note.width,
        height: note.height,
      });
    },
    [note, startResize]
  );

  const handleBlur = useCallback(() => {
    if (editorRef.current) {
      updateNote(note.id, { content: editorRef.current.innerHTML });
    }
  }, [note.id, updateNote]);

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (document.activeElement !== el) {
      el.innerHTML = note.content;
    }
  }, [note.content]);

  const boardRect = boardRef.current?.getBoundingClientRect() ?? null;

  return (
    <>
      {isSelected && (
        <FloatingToolbar note={note} boardRect={boardRect} noteRef={noteRef} />
      )}
      <div
        ref={noteRef}
        className={`${styles.note} ${styles[note.color]} ${isSelected ? styles.selected : ''} ${
          isDragging.current ? styles.dragging : ''
        }`}
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
        <div className={styles.dragHandle}>
          <span className={styles.handleDots}>
            <span /><span /><span />
          </span>
        </div>

        <div className={styles.content}>
          <div
            ref={editorRef}
            className={styles.editor}
            contentEditable
            suppressContentEditableWarning
            data-placeholder="Write something..."
            onBlur={handleBlur}
            onMouseDown={(e) => e.stopPropagation()}
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
