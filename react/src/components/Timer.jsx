import { useMemo } from 'react';

export default function Timer({ timeLeft, mode }) {
  const { minutes, seconds } = useMemo(() => ({
    minutes: Math.floor(timeLeft / 60),
    seconds: timeLeft % 60,
  }), [timeLeft]);

  const formattedTime = useMemo(() => 
    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
    [minutes, seconds]
  );

  const modeColors = {
    pomodoro: 'text-red-500 dark:text-red-400',
    shortBreak: 'text-green-500 dark:text-green-400',
    longBreak: 'text-blue-500 dark:text-blue-400',
  };

  return (
    <div className="flex flex-col items-center">
      <div 
        className={`text-8xl md:text-9xl font-bold font-mono tracking-tight ${modeColors[mode]} transition-colors duration-300`}
      >
        {formattedTime}
      </div>
    </div>
  );
}
