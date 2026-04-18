'use client';

import { useCallback, useRef, useState } from 'react';
import { Note, NoteColor, NoteSize } from '@/types';
import { useNotesContext } from '@/context/NotesContext';
import styles from './FloatingToolbar.module.scss';

type Panel = 'format' | 'size' | 'color' | 'arrange' | null;

const COLORS: { key: NoteColor; hex: string; label: string }[] = [
  { key: 'yellow', hex: '#fef08a', label: 'Yellow' },
  { key: 'teal', hex: '#99f6e4', label: 'Teal' },
  { key: 'purple', hex: '#e9d5ff', label: 'Purple' },
  { key: 'pink', hex: '#fecdd3', label: 'Pink' },
];

const SIZES: { key: NoteSize; dim: number }[] = [
  { key: 'S', dim: 160 },
  { key: 'M', dim: 220 },
  { key: 'L', dim: 300 },
];

const FORMAT_ACTIONS = [
  { cmd: 'bold', label: 'B', title: 'Bold' },
  { cmd: 'italic', label: 'I', title: 'Italic' },
  { cmd: 'underline', label: 'U', title: 'Underline' },
  { cmd: 'strikeThrough', label: 'S̶', title: 'Strikethrough' },
  { cmd: 'insertUnorderedList', label: '•', title: 'Unordered List' },
  { cmd: 'insertOrderedList', label: '1.', title: 'Ordered List' },
];

interface FloatingToolbarProps {
  note: Note;
  boardRect: DOMRect | null;
  noteRef: React.RefObject<HTMLDivElement | null>;
}

export function FloatingToolbar({ note, boardRect, noteRef }: FloatingToolbarProps) {
  const { updateNote, deleteNote, bringForward, bringToFront, sendBackward, sendToBack } =
    useNotesContext();
  const [openPanel, setOpenPanel] = useState<Panel>(null);

  const togglePanel = useCallback(
    (panel: Panel) => {
      setOpenPanel((prev) => (prev === panel ? null : panel));
    },
    []
  );

  const handleFormat = useCallback((cmd: string) => {
    document.execCommand(cmd, false);
    setOpenPanel(null);
  }, []);

  const handleSize = useCallback(
    (size: NoteSize, dim: number) => {
      updateNote(note.id, { size, width: dim, height: dim });
      setOpenPanel(null);
    },
    [note.id, updateNote]
  );

  const handleColor = useCallback(
    (color: NoteColor) => {
      updateNote(note.id, { color });
      setOpenPanel(null);
    },
    [note.id, updateNote]
  );

  const handleDelete = useCallback(() => {
    deleteNote(note.id);
    setOpenPanel(null);
  }, [note.id, deleteNote]);

  const handleArrange = useCallback(
    (action: 'forward' | 'front' | 'backward' | 'back') => {
      if (action === 'forward') bringForward(note.id);
      if (action === 'front') bringToFront(note.id);
      if (action === 'backward') sendBackward(note.id);
      if (action === 'back') sendToBack(note.id);
      setOpenPanel(null);
    },
    [note.id, bringForward, bringToFront, sendBackward, sendToBack]
  );

  // Position: above the note, horizontally centered
  if (!boardRect) return null;

  const toolbarTop = note.y - 52;
  const toolbarLeft = note.x + note.width / 2;

  return (
    <div
      className={styles.wrapper}
      style={{ top: toolbarTop, left: toolbarLeft, transform: 'translateX(-50%)' }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Main toolbar row */}
      <div className={styles.toolbar}>
        <button
          className={`${styles.btn} ${openPanel === 'format' ? styles.active : ''}`}
          onClick={() => togglePanel('format')}
          title="Format text"
        >
          Aa
        </button>
        <div className={styles.divider} />
        <button
          className={`${styles.btn} ${openPanel === 'size' ? styles.active : ''}`}
          onClick={() => togglePanel('size')}
          title="Change size"
        >
          {note.size}
        </button>
        <div className={styles.divider} />
        <button
          className={`${styles.btn} ${openPanel === 'color' ? styles.active : ''}`}
          onClick={() => togglePanel('color')}
          title="Change color"
        >
          <span
            style={{
              display: 'inline-block',
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: COLORS.find((c) => c.key === note.color)?.hex,
              border: '1.5px solid rgba(0,0,0,0.15)',
            }}
          />
          Color
        </button>
        <div className={styles.divider} />
        <button
          className={`${styles.btn} ${openPanel === 'arrange' ? styles.active : ''}`}
          onClick={() => togglePanel('arrange')}
          title="Arrange"
        >
          Arrange
        </button>
        <div className={styles.divider} />
        <button
          className={`${styles.btn} ${styles.danger}`}
          onClick={handleDelete}
          title="Delete note"
        >
          Delete
        </button>
      </div>

      {/* Secondary panels */}
      {openPanel === 'format' && (
        <div className={styles.secondary}>
          {FORMAT_ACTIONS.map(({ cmd, label, title }) => (
            <button
              key={cmd}
              className={styles.formatBtn}
              onClick={() => handleFormat(cmd)}
              title={title}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {openPanel === 'size' && (
        <div className={styles.secondary}>
          {SIZES.map(({ key, dim }) => (
            <button
              key={key}
              className={`${styles.sizeBtn} ${note.size === key ? styles.active : ''}`}
              onClick={() => handleSize(key, dim)}
            >
              {key}
            </button>
          ))}
        </div>
      )}

      {openPanel === 'color' && (
        <div className={styles.secondary}>
          {COLORS.map(({ key, hex, label }) => (
            <button
              key={key}
              className={`${styles.colorSwatch} ${note.color === key ? styles.active : ''}`}
              style={{ background: hex }}
              onClick={() => handleColor(key)}
              title={label}
              aria-label={label}
            />
          ))}
        </div>
      )}

      {openPanel === 'arrange' && (
        <div className={styles.secondary}>
          <button className={styles.arrangeBtn} onClick={() => handleArrange('front')}>
            Bring to Front
          </button>
          <button className={styles.arrangeBtn} onClick={() => handleArrange('forward')}>
            Bring Forward
          </button>
          <button className={styles.arrangeBtn} onClick={() => handleArrange('backward')}>
            Send Backward
          </button>
          <button className={styles.arrangeBtn} onClick={() => handleArrange('back')}>
            Send to Back
          </button>
        </div>
      )}
    </div>
  );
}
