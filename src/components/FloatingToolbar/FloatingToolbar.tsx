"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Note, NoteColor, NoteSize } from "@/types";
import { useNotesContext } from "@/context/NotesContext";
import styles from "./FloatingToolbar.module.scss";

type Panel = "format" | "size" | "color" | "arrange" | null;

const COLORS: { key: NoteColor; hex: string; label: string }[] = [
  { key: "yellow", hex: "#ffcc25", label: "Yellow" },
  { key: "teal", hex: "#0ab78d", label: "Teal" },
  { key: "purple", hex: "#9f61ff", label: "Purple" },
  { key: "pink", hex: "#ff7b6c", label: "Pink" },
];

const SIZES: { key: NoteSize; dim: number }[] = [
  { key: "S", dim: 160 },
  { key: "M", dim: 220 },
  { key: "L", dim: 300 },
];

const FORMAT_ACTIONS = [
  { cmd: "bold", label: "B", title: "Bold" },
  { cmd: "italic", label: "I", title: "Italic" },
  { cmd: "underline", label: "U", title: "Underline" },
  { cmd: "strikeThrough", label: "S̶", title: "Strikethrough" },
  { cmd: "insertUnorderedList", label: "•", title: "Unordered List" },
  { cmd: "insertOrderedList", label: "1.", title: "Ordered List" },
];

interface FloatingToolbarProps {
  note: Note;
  boardRect: DOMRect | null;
}

const STATEFUL_CMDS = ["bold", "italic", "underline", "strikeThrough"];

function queryActiveFormats(): Set<string> {
  const active = new Set<string>();
  STATEFUL_CMDS.forEach((cmd) => {
    try {
      if (document.queryCommandState(cmd)) active.add(cmd);
    } catch {}
  });
  return active;
}

export function FloatingToolbar({ note, boardRect }: FloatingToolbarProps) {
  const {
    updateNote,
    deleteNote,
    duplicateNote,
    bringForward,
    bringToFront,
    sendBackward,
    sendToBack,
  } = useNotesContext();
  const [openPanel, setOpenPanel] = useState<Panel>(null);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => setActiveFormats(queryActiveFormats());
    document.addEventListener("selectionchange", update);
    return () => document.removeEventListener("selectionchange", update);
  }, []);

  useEffect(() => {
    if (!openPanel) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpenPanel(null);
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [openPanel]);

  const togglePanel = useCallback((panel: Panel) => {
    setOpenPanel((prev) => (prev === panel ? null : panel));
  }, []);

  const handleFormat = useCallback((e: React.MouseEvent, cmd: string) => {
    e.preventDefault();
    document.execCommand(cmd, false);
    setActiveFormats(queryActiveFormats());
    setOpenPanel(null);
  }, []);

  const handleSize = useCallback(
    (size: NoteSize, dim: number) => {
      updateNote(note.id, { size, width: dim, height: dim });
      setOpenPanel(null);
    },
    [note.id, updateNote],
  );

  const handleColor = useCallback(
    (color: NoteColor) => {
      updateNote(note.id, { color });
      setOpenPanel(null);
    },
    [note.id, updateNote],
  );

  const handleDuplicate = useCallback(() => {
    duplicateNote(note);
    setOpenPanel(null);
  }, [note, duplicateNote]);

  const handleDelete = useCallback(() => {
    deleteNote(note.id);
    setOpenPanel(null);
  }, [note.id, deleteNote]);

  const handleArrange = useCallback(
    (action: "forward" | "front" | "backward" | "back") => {
      if (action === "forward") bringForward(note.id);
      if (action === "front") bringToFront(note.id);
      if (action === "backward") sendBackward(note.id);
      if (action === "back") sendToBack(note.id);
      setOpenPanel(null);
    },
    [note.id, bringForward, bringToFront, sendBackward, sendToBack],
  );

  if (!boardRect) return null;

  const TOOLBAR_H = 48;
  const TOOLBAR_HALF_W = 200;
  const MARGIN = 8;
  const boardWidth = boardRect.width;

  const showAbove = note.y >= TOOLBAR_H + MARGIN;
  const toolbarTop = showAbove
    ? note.y - TOOLBAR_H - MARGIN
    : note.y + note.height + MARGIN;
  const rawLeft = note.x + note.width / 2;
  const toolbarLeft = Math.max(
    TOOLBAR_HALF_W,
    Math.min(rawLeft, boardWidth - TOOLBAR_HALF_W),
  );

  return (
    <div
      ref={wrapperRef}
      className={styles.wrapper}
      style={{
        top: toolbarTop,
        left: toolbarLeft,
        transform: "translateX(-50%)",
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      {/* Main toolbar row */}
      <div className={styles.toolbar}>
        <button
          className={`${styles.btn} ${openPanel === "format" ? styles.active : ""}`}
          onClick={() => togglePanel("format")}
          title="Format text"
        >
          Aa
        </button>
        <div className={styles.divider} />
        <button
          className={`${styles.btn} ${openPanel === "size" ? styles.active : ""}`}
          onClick={() => togglePanel("size")}
          title="Change size"
        >
          {note.size ?? "⤢"}
        </button>
        <div className={styles.divider} />
        <button
          className={`${styles.btn} ${openPanel === "color" ? styles.active : ""}`}
          onClick={() => togglePanel("color")}
          title="Change color"
        >
          <span
            style={{
              display: "inline-block",
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: COLORS.find((c) => c.key === note.color)?.hex,
              border: "1.5px solid rgba(0,0,0,0.15)",
            }}
          />
          Color
        </button>
        <div className={styles.divider} />
        <button
          className={`${styles.btn} ${openPanel === "arrange" ? styles.active : ""}`}
          onClick={() => togglePanel("arrange")}
          title="Arrange"
        >
          Arrange
        </button>
        <div className={styles.divider} />
        <button
          className={styles.btn}
          onClick={handleDuplicate}
          title="Duplicate note"
        >
          Duplicate
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
      {openPanel === "format" && (
        <div className={styles.secondary}>
          {FORMAT_ACTIONS.map(({ cmd, label, title }) => (
            <button
              key={cmd}
              className={`${styles.formatBtn} ${activeFormats.has(cmd) ? styles.active : ""}`}
              onMouseDown={(e) => handleFormat(e, cmd)}
              title={title}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {openPanel === "size" && (
        <div className={styles.secondary}>
          {SIZES.map(({ key, dim }) => (
            <button
              key={key}
              className={`${styles.sizeBtn} ${note.size === key ? styles.active : ""}`}
              onClick={() => handleSize(key, dim)}
            >
              {key}
            </button>
          ))}
        </div>
      )}

      {openPanel === "color" && (
        <div className={styles.secondary}>
          {COLORS.map(({ key, hex, label }) => (
            <button
              key={key}
              className={`${styles.colorSwatch} ${note.color === key ? styles.active : ""}`}
              style={{ background: hex }}
              onClick={() => handleColor(key)}
              title={label}
              aria-label={label}
            />
          ))}
        </div>
      )}

      {openPanel === "arrange" && (
        <div className={styles.secondary}>
          <button
            className={styles.arrangeBtn}
            onClick={() => handleArrange("front")}
          >
            Bring to Front
          </button>
          <button
            className={styles.arrangeBtn}
            onClick={() => handleArrange("forward")}
          >
            Bring Forward
          </button>
          <button
            className={styles.arrangeBtn}
            onClick={() => handleArrange("backward")}
          >
            Send Backward
          </button>
          <button
            className={styles.arrangeBtn}
            onClick={() => handleArrange("back")}
          >
            Send to Back
          </button>
        </div>
      )}
    </div>
  );
}
