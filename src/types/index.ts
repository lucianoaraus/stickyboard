export type NoteColor = 'yellow' | 'teal' | 'purple' | 'pink';
export type NoteSize = 'S' | 'M' | 'L';

export interface Note {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: NoteColor;
  size: NoteSize;
  content: string;
  zIndex: number;
  createdAt: string;
  updatedAt: string;
}
