/**
 * useCountdown - Ticks a "mm:ss" label down to an ISO timestamp.
 * Returns null when there is nothing to count down to, or once it has expired.
 */

import { useEffect, useState } from "react";
import { formatCountdown } from "@/utils/shop";

export function useCountdown(
  expiresAt: string | null | undefined,
): string | null {
  const [label, setLabel] = useState<string | null>(() =>
    expiresAt
      ? formatCountdown(new Date(expiresAt).getTime() - Date.now())
      : null,
  );

  useEffect(() => {
    if (!expiresAt) {
      setLabel((prev) => (prev === null ? prev : null));
      return;
    }

    const target = new Date(expiresAt).getTime();
    if (Number.isNaN(target)) {
      setLabel((prev) => (prev === null ? prev : null));
      return;
    }

    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) {
        setLabel((prev) => (prev === null ? prev : null));
        return null;
      }
      const next = formatCountdown(diff);
      setLabel((prev) => (prev === next ? prev : next));
      return next;
    };

    if (tick() === null) return;

    const interval = setInterval(() => {
      if (tick() === null) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  return label;
}
