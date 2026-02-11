import { useState, useMemo } from 'react';
import { useTimer } from './hooks/useTimer';
import Header from './components/Header';
import Timer from './components/Timer';
import TimerControls from './components/TimerControls';
import ModeSelector from './components/ModeSelector';
import SettingsModal from './components/SettingsModal';
import ProgressRing from './components/ProgressRing';

function App() {
  const [showSettings, setShowSettings] = useState(false);
  const {
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
  } = useTimer();

  const totalTime = useMemo(() => {
    const times = {
      [TIMER_MODES.POMODORO]: settings.pomodoro * 60,
      [TIMER_MODES.SHORT_BREAK]: settings.shortBreak * 60,
      [TIMER_MODES.LONG_BREAK]: settings.longBreak * 60,
    };
    return times[mode];
  }, [mode, settings, TIMER_MODES]);

  const progress = useMemo(() => {
    return (timeLeft / totalTime) * 100;
  }, [timeLeft, totalTime]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Header
          onSettingsClick={() => setShowSettings(true)}
          completedPomodoros={completedPomodoros}
        />

        <main className="flex flex-col items-center">
          <ModeSelector
            mode={mode}
            onModeChange={switchMode}
            TIMER_MODES={TIMER_MODES}
          />

          <div className="relative w-72 h-72 flex items-center justify-center mb-4">
            <ProgressRing progress={progress} mode={mode} />
            <Timer timeLeft={timeLeft} mode={mode} />
          </div>

          <TimerControls
            isRunning={isRunning}
            onStart={start}
            onPause={pause}
            onReset={reset}
          />

          <p className="mt-8 text-sm text-gray-500 dark:text-gray-400 text-center">
            {mode === TIMER_MODES.POMODORO
              ? 'Time to focus!'
              : mode === TIMER_MODES.SHORT_BREAK
              ? 'Take a short break'
              : 'Take a long break, you earned it!'}
          </p>
        </main>

        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          settings={settings}
          onSave={updateSettings}
        />
      </div>
    </div>
  );
}

export default App;
