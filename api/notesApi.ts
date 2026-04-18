import { Note } from '@/types';

const STORAGE_KEY = 'stickyboard_notes';

function delay(): Promise<void> {
  return new Promise((resolve) =>
    setTimeout(resolve, 150 + Math.random() * 150)
  );
}

function readStorage(): Note[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Note[]) : [];
  } catch {
    return [];
  }
}

function writeStorage(notes: Note[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

export const notesApi = {
  async getNotes(): Promise<Note[]> {
    await delay();
    return readStorage();
  },

  async createNote(note: Omit<Note, 'id'>): Promise<Note> {
    await delay();
    const notes = readStorage();
    const newNote: Note = { ...note, id: crypto.randomUUID() };
    writeStorage([...notes, newNote]);
    return newNote;
  },

  async updateNote(id: string, changes: Partial<Note>): Promise<Note | null> {
    await delay();
    const notes = readStorage();
    const index = notes.findIndex((n) => n.id === id);
    if (index === -1) return null;
    const updated: Note = { ...notes[index], ...changes, id };
    notes[index] = updated;
    writeStorage(notes);
    return updated;
  },

  async deleteNote(id: string): Promise<void> {
    await delay();
    const notes = readStorage();
    writeStorage(notes.filter((n) => n.id !== id));
  },
};
