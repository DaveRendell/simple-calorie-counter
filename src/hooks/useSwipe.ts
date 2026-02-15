import { useRef, useEffect } from "react";

type SwipeDirection = "left" | "right";

interface UseSwipeOptions {
  onSwipe: (direction: SwipeDirection) => void;
  threshold?: number;
}

export function useSwipe<T extends HTMLElement>({
  onSwipe,
  threshold = 50,
}: UseSwipeOptions) {
  const ref = useRef<T>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStart.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStart.current) return;
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStart.current.x;
      const deltaY = touch.clientY - touchStart.current.y;
      touchStart.current = null;

      if (Math.abs(deltaX) < threshold || Math.abs(deltaY) > Math.abs(deltaX)) {
        return;
      }

      onSwipe(deltaX < 0 ? "left" : "right");
    };

    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, [onSwipe, threshold]);

  return ref;
}
