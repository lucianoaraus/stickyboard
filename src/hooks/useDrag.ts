import { useCallback, useRef } from 'react';

export interface DragConstraints {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

interface UseDragOptions {
  onDragStart?: () => void;
  onDrag?: (x: number, y: number) => void;
  onDragEnd?: (x: number, y: number) => void;
  getConstraints: () => DragConstraints;
}

interface UseDragReturn {
  startDrag: (e: React.MouseEvent, currentX: number, currentY: number) => void;
  isDragging: React.MutableRefObject<boolean>;
}

export function useDrag({
  onDragStart,
  onDrag,
  onDragEnd,
  getConstraints,
}: UseDragOptions): UseDragReturn {
  const isDragging = useRef(false);
  const origin = useRef({ mouseX: 0, mouseY: 0, noteX: 0, noteY: 0 });

  const clamp = useCallback(
    (value: number, min: number, max: number) =>
      Math.min(Math.max(value, min), max),
    []
  );

  const startDrag = useCallback(
    (e: React.MouseEvent, currentX: number, currentY: number) => {
      e.preventDefault();
      e.stopPropagation();

      isDragging.current = true;
      origin.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        noteX: currentX,
        noteY: currentY,
      };

      onDragStart?.();

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!isDragging.current) return;
        const constraints = getConstraints();
        const dx = moveEvent.clientX - origin.current.mouseX;
        const dy = moveEvent.clientY - origin.current.mouseY;
        const x = clamp(
          origin.current.noteX + dx,
          constraints.minX,
          constraints.maxX
        );
        const y = clamp(
          origin.current.noteY + dy,
          constraints.minY,
          constraints.maxY
        );
        onDrag?.(x, y);
      };

      const handleMouseUp = (upEvent: MouseEvent) => {
        if (!isDragging.current) return;
        isDragging.current = false;
        const constraints = getConstraints();
        const dx = upEvent.clientX - origin.current.mouseX;
        const dy = upEvent.clientY - origin.current.mouseY;
        const x = clamp(
          origin.current.noteX + dx,
          constraints.minX,
          constraints.maxX
        );
        const y = clamp(
          origin.current.noteY + dy,
          constraints.minY,
          constraints.maxY
        );
        onDragEnd?.(x, y);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [clamp, getConstraints, onDrag, onDragEnd, onDragStart]
  );

  return { startDrag, isDragging };
}
