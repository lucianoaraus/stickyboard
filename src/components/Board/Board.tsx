'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useNotesContext } from '@/context/NotesContext';
import { StickyNote } from '../StickyNote/StickyNote';
import { TrashZone } from '../TrashZone/TrashZone';
import { LeftPanel, ToolMode } from '../LeftPanel/LeftPanel';
import styles from './Board.module.scss';

export function Board() {
  const { notes, notesLoaded, addNote, deleteNote, copyNote, clipboardNote, duplicateNote } = useNotesContext();
  const boardRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [trashActive, setTrashActive] = useState(false);
  const [toolMode, setToolMode] = useState<ToolMode>('select');

  useEffect(() => {
    if (notesLoaded && notes.length === 0) setToolMode('create');
  }, [notesLoaded, notes.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isEditing = target.isContentEditable || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
      if (isEditing) return;

      if (e.key === 'Delete' && selectedId) {
        deleteNote(selectedId);
        setSelectedId(null);
        return;
      }

      if (!e.ctrlKey && !e.metaKey) return;

      if (e.key === 'c' && selectedId) {
        const note = notes.find((n) => n.id === selectedId);
        if (note) copyNote(note);
      }

      if (e.key === 'v' && clipboardNote) {
        e.preventDefault();
        duplicateNote(clipboardNote);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, notes, deleteNote, copyNote, clipboardNote, duplicateNote]);

  const handleBoardClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target !== boardRef.current) return;
      if (toolMode !== 'create') return;
      const rect = boardRef.current!.getBoundingClientRect();
      const bw = boardRef.current!.offsetWidth;
      const bh = boardRef.current!.offsetHeight;
      const rawX = e.clientX - rect.left;
      const rawY = e.clientY - rect.top;
      const noteSize = 220;
      const x = Math.min(Math.max(rawX - noteSize / 2, 0), bw - noteSize);
      const y = Math.min(Math.max(rawY - noteSize / 2, 0), bh - noteSize);
      addNote({ x, y });
      setSelectedId(null);
      setToolMode('select');
    },
    [addNote, toolMode]
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
    <div className={styles.page}>
      <LeftPanel toolMode={toolMode} onToolModeChange={setToolMode} />
      <div
        ref={boardRef}
        className={`${styles.board} ${toolMode === 'create' ? styles.createMode : ''}`}
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

        <TrashZone isActive={trashActive} />
      </div>
    </div>
  );
}
