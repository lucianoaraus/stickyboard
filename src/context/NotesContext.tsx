"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Note, NoteColor, NoteSize } from "@/types";
import { notesApi } from "../../api/notesApi";

const SIZE_MAP: Record<NoteSize, number> = { S: 160, M: 220, L: 300 };
const DEFAULT_COLOR: NoteColor = "yellow";
const DEFAULT_SIZE: NoteSize = "M";

interface NotesContextValue {
  notes: Note[];
  notesLoaded: boolean;
  clipboardNote: Note | null;
  addNote: (position: { x: number; y: number }) => void;
  copyNote: (note: Note) => void;
  duplicateNote: (source: Note) => void;
  updateNote: (id: string, changes: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  bringForward: (id: string) => void;
  bringToFront: (id: string) => void;
  sendBackward: (id: string) => void;
  sendToBack: (id: string) => void;
}

const NotesContext = createContext<NotesContextValue | null>(null);

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [notesLoaded, setNotesLoaded] = useState(false);
  const [clipboardNote, setClipboardNote] = useState<Note | null>(null);

  const copyNote = useCallback((note: Note) => setClipboardNote(note), []);

  useEffect(() => {
    notesApi.getNotes().then((data) => {
      setNotes(data);
      setNotesLoaded(true);
    });
  }, []);

  const maxZ = useMemo(
    () => (notes.length === 0 ? 0 : Math.max(...notes.map((n) => n.zIndex))),
    [notes],
  );

  const minZ = useMemo(
    () => (notes.length === 0 ? 0 : Math.min(...notes.map((n) => n.zIndex))),
    [notes],
  );

  const addNote = useCallback(
    (position: { x: number; y: number }) => {
      const dim = SIZE_MAP[DEFAULT_SIZE];
      const now = new Date().toISOString();
      const noteData: Omit<Note, "id"> = {
        x: position.x,
        y: position.y,
        width: dim,
        height: dim,
        color: DEFAULT_COLOR,
        size: DEFAULT_SIZE,
        content: "",
        zIndex: maxZ + 1,
        createdAt: now,
        updatedAt: now,
      };
      notesApi
        .createNote(noteData)
        .then((note) => setNotes((prev) => [...prev, note]));
    },
    [maxZ],
  );

  const updateNote = useCallback((id: string, changes: Partial<Note>) => {
    const updatedAt = new Date().toISOString();
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...changes, updatedAt } : n)),
    );
    notesApi.updateNote(id, { ...changes, updatedAt });
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    notesApi.deleteNote(id);
  }, []);

  const bringForward = useCallback(
    (id: string) => {
      const note = notes.find((n) => n.id === id);
      if (!note) return;
      updateNote(id, { zIndex: note.zIndex + 1 });
    },
    [notes, updateNote],
  );

  const bringToFront = useCallback(
    (id: string) => {
      updateNote(id, { zIndex: maxZ + 1 });
    },
    [maxZ, updateNote],
  );

  const sendBackward = useCallback(
    (id: string) => {
      const note = notes.find((n) => n.id === id);
      if (!note) return;
      updateNote(id, { zIndex: Math.max(1, note.zIndex - 1) });
    },
    [notes, updateNote],
  );

  const sendToBack = useCallback(
    (id: string) => {
      updateNote(id, { zIndex: Math.max(1, minZ - 1) });
    },
    [minZ, updateNote],
  );

  const duplicateNote = useCallback(
    (source: Note) => {
      const now = new Date().toISOString();
      const copy: Omit<Note, "id"> = {
        ...source,
        x: source.x + 20,
        y: source.y + 20,
        zIndex: maxZ + 1,
        createdAt: now,
        updatedAt: now,
      };
      notesApi.createNote(copy).then((note) => setNotes((prev) => [...prev, note]));
    },
    [maxZ],
  );

  const value = useMemo<NotesContextValue>(
    () => ({
      notes,
      notesLoaded,
      clipboardNote,
      addNote,
      copyNote,
      duplicateNote,
      updateNote,
      deleteNote,
      bringForward,
      bringToFront,
      sendBackward,
      sendToBack,
    }),
    [
      notes,
      notesLoaded,
      clipboardNote,
      addNote,
      copyNote,
      duplicateNote,
      updateNote,
      deleteNote,
      bringForward,
      bringToFront,
      sendBackward,
      sendToBack,
    ],
  );

  return (
    <NotesContext.Provider value={value}>{children}</NotesContext.Provider>
  );
}

export function useNotesContext(): NotesContextValue {
  const ctx = useContext(NotesContext);
  if (!ctx)
    throw new Error("useNotesContext must be used within NotesProvider");
  return ctx;
}
