import { useCallback, useEffect, useRef, useState } from "react";

export function formatElapsed(ms: number): string {
  return (ms / 1000).toFixed(1);
}

export function useTrainingTimer() {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isTimerRunning) {
      return;
    }

    if (startTimeRef.current === null) {
      startTimeRef.current = performance.now();
    }

    const intervalId = window.setInterval(() => {
      if (startTimeRef.current === null) {
        return;
      }

      setElapsedMs(Math.round(performance.now() - startTimeRef.current));
    }, 50);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isTimerRunning]);

  const restart = useCallback(() => {
    startTimeRef.current = performance.now();
    setElapsedMs(0);
    setIsTimerRunning(true);
  }, []);

  const stop = useCallback(() => {
    setIsTimerRunning(false);
  }, []);

  return {
    elapsedMs,
    isTimerRunning,
    restart,
    stop,
  };
}
