'use client';

import { useCallback, useRef, useState } from 'react';
import { useNotesContext } from '@/context/NotesContext';
import { StickyNote } from '../StickyNote/StickyNote';
import { TrashZone } from '../TrashZone/TrashZone';
import styles from './Board.module.scss';

const BOARD_WIDTH = 1400;
const BOARD_HEIGHT = 900;

export function Board() {
  const { notes, addNote, deleteNote } = useNotesContext();
  const boardRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [trashActive, setTrashActive] = useState(false);

  const handleBoardClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target !== boardRef.current) return;
      const rect = boardRef.current!.getBoundingClientRect();
      const rawX = e.clientX - rect.left;
      const rawY = e.clientY - rect.top;
      const noteSize = 220;
      const x = Math.min(Math.max(rawX - noteSize / 2, 0), BOARD_WIDTH - noteSize);
      const y = Math.min(Math.max(rawY - noteSize / 2, 0), BOARD_HEIGHT - noteSize);
      addNote({ x, y });
      setSelectedId(null);
    },
    [addNote]
  );

  const handleBoardMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === boardRef.current) setSelectedId(null);
  }, []);

  const handleSelect = useCallback((id: string) => setSelectedId(id), []);

  const handleTrashHover = useCallback((isOver: boolean) => {
    setTrashActive(isOver);
  }, []);

  const handleDropOnTrash = useCallback(
    (id: string) => {
      deleteNote(id);
      if (selectedId === id) setSelectedId(null);
      setTrashActive(false);
    },
    [deleteNote, selectedId]
  );

  return (
    <>
      <div className={styles.page}>
        <div
          ref={boardRef}
          className={styles.board}
          onClick={handleBoardClick}
          onMouseDown={handleBoardMouseDown}
        >
          {notes.length === 0 && (
            <div className={styles.emptyHint}>
              <svg
                className={styles.hintIcon}
                width="48"
                height="48"
                viewBox="0 0 48 48"
                fill="none"
                aria-hidden="true"
              >
                <rect x="8" y="8" width="14" height="14" rx="3" fill="#6b7280" />
                <rect x="26" y="8" width="14" height="14" rx="3" fill="#6b7280" opacity="0.6" />
                <rect x="8" y="26" width="14" height="14" rx="3" fill="#6b7280" opacity="0.6" />
                <rect x="26" y="26" width="14" height="14" rx="3" fill="#6b7280" opacity="0.35" />
              </svg>
              <p>Click anywhere to add a note</p>
            </div>
          )}

          {notes.map((note) => (
            <StickyNote
              key={note.id}
              note={note}
              isSelected={selectedId === note.id}
              boardRef={boardRef}
              onSelect={handleSelect}
              onTrashHover={handleTrashHover}
              onDropOnTrash={handleDropOnTrash}
            />
          ))}
        </div>
      </div>

      <TrashZone isActive={trashActive} />
    </>
  );
}
