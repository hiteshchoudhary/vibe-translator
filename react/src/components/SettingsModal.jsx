import { useState } from 'react';

export default function SettingsModal({ isOpen, onClose, settings, onSave }) {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const handleChange = (key, value) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 transform transition-all">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
            Time (minutes)
          </h3>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Pomodoro</label>
              <input
                type="number"
                min="1"
                max="60"
                value={localSettings.pomodoro}
                onChange={(e) => handleChange('pomodoro', parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Short Break</label>
              <input
                type="number"
                min="1"
                max="30"
                value={localSettings.shortBreak}
                onChange={(e) => handleChange('shortBreak', parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Long Break</label>
              <input
                type="number"
                min="1"
                max="60"
                value={localSettings.longBreak}
                onChange={(e) => handleChange('longBreak', parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-3">
              Auto Start
            </h3>
            
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.autoStartBreaks}
                  onChange={(e) => handleChange('autoStartBreaks', e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-red-500 focus:ring-red-400 dark:border-gray-600 dark:bg-gray-700"
                />
                <span className="text-gray-700 dark:text-gray-300">Auto start breaks</span>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.autoStartPomodoros}
                  onChange={(e) => handleChange('autoStartPomodoros', e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-red-500 focus:ring-red-400 dark:border-gray-600 dark:bg-gray-700"
                />
                <span className="text-gray-700 dark:text-gray-300">Auto start pomodoros</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
