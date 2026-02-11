export default function TimerControls({ isRunning, onStart, onPause, onReset }) {
  return (
    <div className="flex gap-4 mt-8">
      {!isRunning ? (
        <button
          onClick={onStart}
          className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
        >
          Start
        </button>
      ) : (
        <button
          onClick={onPause}
          className="px-8 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
        >
          Pause
        </button>
      )}
      <button
        onClick={onReset}
        className="px-8 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
      >
        Reset
      </button>
    </div>
  );
}
