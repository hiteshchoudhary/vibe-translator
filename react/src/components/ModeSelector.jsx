export default function ModeSelector({ mode, onModeChange, TIMER_MODES }) {
  const modes = [
    { key: TIMER_MODES.POMODORO, label: 'Pomodoro', color: 'red' },
    { key: TIMER_MODES.SHORT_BREAK, label: 'Short Break', color: 'green' },
    { key: TIMER_MODES.LONG_BREAK, label: 'Long Break', color: 'blue' },
  ];

  const getButtonClasses = (modeKey, color) => {
    const isActive = mode === modeKey;
    const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900';
    
    const colorClasses = {
      red: isActive 
        ? 'bg-red-500 text-white shadow-lg focus:ring-red-400' 
        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900/30 focus:ring-red-400',
      green: isActive 
        ? 'bg-green-500 text-white shadow-lg focus:ring-green-400' 
        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-green-100 dark:hover:bg-green-900/30 focus:ring-green-400',
      blue: isActive 
        ? 'bg-blue-500 text-white shadow-lg focus:ring-blue-400' 
        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 focus:ring-blue-400',
    };

    return `${baseClasses} ${colorClasses[color]}`;
  };

  return (
    <div className="flex flex-wrap justify-center gap-2 mb-8">
      {modes.map(({ key, label, color }) => (
        <button
          key={key}
          onClick={() => onModeChange(key)}
          className={getButtonClasses(key, color)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
