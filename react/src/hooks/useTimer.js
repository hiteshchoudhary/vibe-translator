import { useState, useEffect, useCallback, useRef } from 'react';

const TIMER_MODES = {
  POMODORO: 'pomodoro',
  SHORT_BREAK: 'shortBreak',
  LONG_BREAK: 'longBreak',
};

const DEFAULT_TIMES = {
  [TIMER_MODES.POMODORO]: 25 * 60,
  [TIMER_MODES.SHORT_BREAK]: 5 * 60,
  [TIMER_MODES.LONG_BREAK]: 15 * 60,
};

export function useTimer() {
  const [mode, setMode] = useState(TIMER_MODES.POMODORO);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_TIMES[TIMER_MODES.POMODORO]);
  const [isRunning, setIsRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [settings, setSettings] = useState({
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15,
    autoStartBreaks: false,
    autoStartPomodoros: false,
  });

  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleF5Ui9ffcmJHhLTBmImLaWlbdJuvrpFgNzVho9LbqWAaCD+b2Paoepx2Xorh6Vl0NkaGt8GRiItvZWlcda2wpodbMzJkqN7gpmAOAUar4f2kd6N9aIzf3l5yKECIusKMh4xya2lcda+vpo5fOjdlp9zapVoGAVKy5f2icKODbJHc2l9uIUGNwMOHhpB2amlZda6wqZJkPzplp9fYoVUBBF+77/+caaWKcpba1FhrF0KTx8aEhJR8a2lWd7CxrZdpRD5louXfnU8AC2fA8v2XYKiQeJzYzVJkC0WYzMmAg5h/a2lVeLGzsJtvSj9oo+jgnkkAD2vC8/uTWKuVfqHWx0pYAEqdz8t9gZuDbGlTeLS1s6F0T0FqpejfmUMAF2/F8PiPT66dgKXWwEFOAE+j0816fp6HbmlQe7a2taV5VURtpuffkzsAH3PI7vSKRbKkh6rVtz1DAFWp1dB2e6GNcmpNfbi4t6h+WkZxp+jckzUAKHnK7O+FR7iqjq/TrjU3AF+v19N1d6WUeGtJgby7ua2EX0l0qOncjy4AM3/M6emAQLqwlLXSozIuAGe24Ndyc6qbf2xGhsC+u7KKZU14qencii4APYbP5uJ6M7u4nL3RmC4lAHC75dpwb66iiW5Cioy+vLSRbFB9rOzahCYARorS49xzKL2+pcTPji0bAHnC6NxuaLGpk29Ejs7EvLmXc1SCruvYfR8ATY/W4NVsHcDFrcnMgyoPAIHI7N9qYrSwn3FClNPJwL2eerGFsPLWdRgAUpTa3s1jEsTMt8/MeCcDAIvN8OBmW7i2qnNAmuLPw8ChgbSFsvbTbRAAV5nd28ReB8nUwNXKbB0AAKLS8uBjVry8t3U+nut');
  }, []);

  const playNotification = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  }, []);

  const updateSettings = useCallback((newSettings) => {
    setSettings(newSettings);
    const times = {
      [TIMER_MODES.POMODORO]: newSettings.pomodoro * 60,
      [TIMER_MODES.SHORT_BREAK]: newSettings.shortBreak * 60,
      [TIMER_MODES.LONG_BREAK]: newSettings.longBreak * 60,
    };
    if (!isRunning) {
      setTimeLeft(times[mode]);
    }
  }, [mode, isRunning]);

  const switchMode = useCallback((newMode) => {
    setMode(newMode);
    setIsRunning(false);
    const times = {
      [TIMER_MODES.POMODORO]: settings.pomodoro * 60,
      [TIMER_MODES.SHORT_BREAK]: settings.shortBreak * 60,
      [TIMER_MODES.LONG_BREAK]: settings.longBreak * 60,
    };
    setTimeLeft(times[newMode]);
  }, [settings]);

  const handleTimerComplete = useCallback(() => {
    playNotification();
    
    if (mode === TIMER_MODES.POMODORO) {
      const newCount = completedPomodoros + 1;
      setCompletedPomodoros(newCount);
      
      if (newCount % 4 === 0) {
        switchMode(TIMER_MODES.LONG_BREAK);
        if (settings.autoStartBreaks) setIsRunning(true);
      } else {
        switchMode(TIMER_MODES.SHORT_BREAK);
        if (settings.autoStartBreaks) setIsRunning(true);
      }
    } else {
      switchMode(TIMER_MODES.POMODORO);
      if (settings.autoStartPomodoros) setIsRunning(true);
    }
  }, [mode, completedPomodoros, settings, switchMode, playNotification]);

  useEffect(() => {
    let interval = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, handleTimerComplete]);

  const start = () => setIsRunning(true);
  const pause = () => setIsRunning(false);
  const reset = () => {
    setIsRunning(false);
    const times = {
      [TIMER_MODES.POMODORO]: settings.pomodoro * 60,
      [TIMER_MODES.SHORT_BREAK]: settings.shortBreak * 60,
      [TIMER_MODES.LONG_BREAK]: settings.longBreak * 60,
    };
    setTimeLeft(times[mode]);
  };

  return {
    mode,
    timeLeft,
    isRunning,
    completedPomodoros,
    settings,
    start,
    pause,
    reset,
    switchMode,
    updateSettings,
    TIMER_MODES,
  };
}
