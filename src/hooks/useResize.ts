import { useCallback, useRef } from 'react';

export type ResizeHandle =
  | 'n' | 's' | 'e' | 'w'
  | 'ne' | 'nw' | 'se' | 'sw';

export interface ResizeConstraints {
  boardWidth: number;
  boardHeight: number;
  minSize: number;
}

interface NoteRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface UseResizeOptions {
  onResize?: (rect: NoteRect) => void;
  onResizeEnd?: (rect: NoteRect) => void;
  getConstraints: () => ResizeConstraints;
}

interface UseResizeReturn {
  startResize: (
    e: React.MouseEvent,
    handle: ResizeHandle,
    current: NoteRect
  ) => void;
}

export function useResize({
  onResize,
  onResizeEnd,
  getConstraints,
}: UseResizeOptions): UseResizeReturn {
  const state = useRef<{
    handle: ResizeHandle;
    startMouse: { x: number; y: number };
    startRect: NoteRect;
  } | null>(null);

  const clamp = (v: number, min: number, max: number) =>
    Math.min(Math.max(v, min), max);

  const compute = useCallback(
    (
      mouseX: number,
      mouseY: number,
      handle: ResizeHandle,
      startRect: NoteRect,
      startMouse: { x: number; y: number },
      constraints: ResizeConstraints
    ): NoteRect => {
      const { boardWidth, boardHeight, minSize } = constraints;
      const dx = mouseX - startMouse.x;
      const dy = mouseY - startMouse.y;

      let { x, y, width, height } = startRect;

      if (handle.includes('e')) {
        width = Math.max(minSize, startRect.width + dx);
        width = Math.min(width, boardWidth - x);
      }
      if (handle.includes('s')) {
        height = Math.max(minSize, startRect.height + dy);
        height = Math.min(height, boardHeight - y);
      }
      if (handle.includes('w')) {
        const newWidth = Math.max(minSize, startRect.width - dx);
        const maxDx = startRect.width - minSize;
        x = clamp(startRect.x + dx, 0, startRect.x + maxDx);
        width = startRect.x + startRect.width - x;
      }
      if (handle.includes('n')) {
        const newHeight = Math.max(minSize, startRect.height - dy);
        const maxDy = startRect.height - minSize;
        y = clamp(startRect.y + dy, 0, startRect.y + maxDy);
        height = startRect.y + startRect.height - y;
      }

      return { x, y, width, height };
    },
    []
  );

  const startResize = useCallback(
    (e: React.MouseEvent, handle: ResizeHandle, current: NoteRect) => {
      e.preventDefault();
      e.stopPropagation();

      state.current = {
        handle,
        startMouse: { x: e.clientX, y: e.clientY },
        startRect: { ...current },
      };

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!state.current) return;
        const constraints = getConstraints();
        const rect = compute(
          moveEvent.clientX,
          moveEvent.clientY,
          state.current.handle,
          state.current.startRect,
          state.current.startMouse,
          constraints
        );
        onResize?.(rect);
      };

      const handleMouseUp = (upEvent: MouseEvent) => {
        if (!state.current) return;
        const constraints = getConstraints();
        const rect = compute(
          upEvent.clientX,
          upEvent.clientY,
          state.current.handle,
          state.current.startRect,
          state.current.startMouse,
          constraints
        );
        onResizeEnd?.(rect);
        state.current = null;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [compute, getConstraints, onResize, onResizeEnd]
  );

  return { startResize };
}
