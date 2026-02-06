import { useEffect, useState } from 'react';

interface TimerProps {
  isActive: boolean;
  duration?: number; // in seconds
  onComplete?: () => void;
}

export default function Timer({ isActive, duration = 30, onComplete }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (isActive && !isRunning) {
      setTimeLeft(duration);
      setIsRunning(true);
    } else if (!isActive && isRunning) {
      setIsRunning(false);
      setTimeLeft(duration);
    }
  }, [isActive, duration, isRunning]);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) {
      if (timeLeft === 0 && onComplete) {
        onComplete();
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, timeLeft, onComplete]);

  return <span className="font-black">{timeLeft}</span>;
}
