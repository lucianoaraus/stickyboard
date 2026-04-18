import { useCallback, useRef } from 'react';

export type ResizeHandle =
  | 'n' | 's' | 'e' | 'w'
  | 'ne' | 'nw' | 'se' | 'sw';

export interface ResizeConstraints {
  boardWidth: number;
  boardHeight: number;
  minSize: number;
  maxSize: number;
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
      const { boardWidth, boardHeight, minSize, maxSize } = constraints;
      const dx = mouseX - startMouse.x;
      const dy = mouseY - startMouse.y;

      let { x, y, width, height } = startRect;

      if (handle.includes('e')) {
        width = clamp(startRect.width + dx, minSize, maxSize);
        width = Math.min(width, boardWidth - x);
      }
      if (handle.includes('s')) {
        height = clamp(startRect.height + dy, minSize, maxSize);
        height = Math.min(height, boardHeight - y);
      }
      if (handle.includes('w')) {
        // maxDx: how far right before minSize; minDx: how far left before maxSize
        const maxDx = startRect.width - minSize;
        const minDx = startRect.width - maxSize;
        x = clamp(startRect.x + dx, Math.max(0, startRect.x + minDx), startRect.x + maxDx);
        width = startRect.x + startRect.width - x;
      }
      if (handle.includes('n')) {
        const maxDy = startRect.height - minSize;
        const minDy = startRect.height - maxSize;
        y = clamp(startRect.y + dy, Math.max(0, startRect.y + minDy), startRect.y + maxDy);
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
