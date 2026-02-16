import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";

interface Point {
  x: number;
  y: number;
}

type PositionInput = Point | ((current: Point) => Point);

interface UseDraggableWindowOptions {
  initialPosition: Point;
  minTop?: number;
  minLeft?: number;
}

interface UseDraggableWindowReturn {
  containerRef: React.RefObject<HTMLDivElement | null>;
  isDragging: boolean;
  dragHandleProps: DragHandleProps;
  windowStyle: CSSProperties;
  setWindowPosition: (position: PositionInput) => void;
}

export interface DragHandleProps {
  onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerCancel: (event: ReactPointerEvent<HTMLDivElement>) => void;
}

interface DragState {
  pointerId: number;
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
}

const DRAG_IGNORE_SELECTOR =
  "button,a,input,textarea,select,[data-drag-ignore='true']";

export const useDraggableWindow = ({
  initialPosition,
  minTop = 34,
  minLeft = 0,
}: UseDraggableWindowOptions): UseDraggableWindowReturn => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef<DragState | null>(null);

  const [position, setPosition] = useState<Point>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);

  const clampPosition = useCallback(
    (next: Point, width: number, height: number): Point => {
      const maxX = Math.max(minLeft, window.innerWidth - width);
      const maxY = Math.max(minTop, window.innerHeight - height);

      return {
        x: Math.min(maxX, Math.max(minLeft, next.x)),
        y: Math.min(maxY, Math.max(minTop, next.y)),
      };
    },
    [minLeft, minTop],
  );

  const clearDragState = useCallback(() => {
    setIsDragging(false);
    dragStateRef.current = null;
  }, []);

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      const dragState = dragStateRef.current;
      if (!dragState || event.pointerId !== dragState.pointerId) {
        return;
      }

      setPosition(
        clampPosition(
          {
            x: event.clientX - dragState.offsetX,
            y: event.clientY - dragState.offsetY,
          },
          dragState.width,
          dragState.height,
        ),
      );
    },
    [clampPosition],
  );

  const onPointerUp = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (
        !dragStateRef.current ||
        event.pointerId !== dragStateRef.current.pointerId
      ) {
        return;
      }
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      clearDragState();
    },
    [clearDragState],
  );

  const onPointerDown = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    if (event.button !== 0) {
      return;
    }

    const target = event.target as HTMLElement;
    if (target.closest(DRAG_IGNORE_SELECTOR)) {
      return;
    }

    const container = containerRef.current;
    if (!container) {
      return;
    }

    const rect = container.getBoundingClientRect();
    dragStateRef.current = {
      pointerId: event.pointerId,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      width: rect.width,
      height: rect.height,
    };
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  }, []);

  useEffect(() => clearDragState, [clearDragState]);

  useEffect(() => {
    const onResize = () => {
      const container = containerRef.current;
      if (!container) {
        return;
      }
      const rect = container.getBoundingClientRect();
      setPosition((current) => clampPosition(current, rect.width, rect.height));
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [clampPosition]);

  const windowStyle: CSSProperties = {
    left: `${position.x}px`,
    top: `${position.y}px`,
  };

  const setWindowPosition = useCallback(
    (next: PositionInput) => {
      setPosition((current) => {
        const resolved = typeof next === "function" ? next(current) : next;
        const container = containerRef.current;
        const rect = container?.getBoundingClientRect();

        const finalPosition = !rect
          ? resolved
          : clampPosition(resolved, rect.width, rect.height);

        if (finalPosition.x === current.x && finalPosition.y === current.y) {
          return current;
        }

        return finalPosition;
      });
    },
    [clampPosition],
  );

  return {
    containerRef,
    dragHandleProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
    },
    windowStyle,
    isDragging,
    setWindowPosition,
  };
};
