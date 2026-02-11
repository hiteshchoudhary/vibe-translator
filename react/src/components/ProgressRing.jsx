export default function ProgressRing({ progress, mode }) {
  const radius = 140;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const modeColors = {
    pomodoro: '#ef4444',
    shortBreak: '#22c55e',
    longBreak: '#3b82f6',
  };

  return (
    <svg
      height={radius * 2}
      width={radius * 2}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-90"
    >
      <circle
        stroke="currentColor"
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
        className="text-gray-200 dark:text-gray-700"
      />
      <circle
        stroke={modeColors[mode]}
        fill="transparent"
        strokeWidth={stroke}
        strokeDasharray={circumference + ' ' + circumference}
        style={{ strokeDashoffset }}
        strokeLinecap="round"
        r={normalizedRadius}
        cx={radius}
        cy={radius}
        className="transition-all duration-1000 ease-linear"
      />
    </svg>
  );
}
