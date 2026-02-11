import { writable, derived } from 'svelte/store';

// Timer durations in seconds
export const WORK_DURATION = 25 * 60; // 25 minutes
export const SHORT_BREAK_DURATION = 5 * 60; // 5 minutes
export const LONG_BREAK_DURATION = 15 * 60; // 15 minutes

// Timer modes
export const MODES = {
  WORK: 'work',
  SHORT_BREAK: 'shortBreak',
  LONG_BREAK: 'longBreak'
};

// Create timer store
function createTimerStore() {
  const { subscribe, set, update } = writable({
    timeRemaining: WORK_DURATION,
    isRunning: false,
    mode: MODES.WORK,
    completedPomodoros: 0
  });

  let intervalId = null;

  return {
    subscribe,
    
    start: () => {
      update(state => {
        if (!state.isRunning && state.timeRemaining > 0) {
          intervalId = setInterval(() => {
            update(s => {
              if (s.timeRemaining <= 1) {
                clearInterval(intervalId);
                intervalId = null;
                return { ...s, timeRemaining: 0, isRunning: false };
              }
              return { ...s, timeRemaining: s.timeRemaining - 1 };
            });
          }, 1000);
          return { ...state, isRunning: true };
        }
        return state;
      });
    },

    pause: () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      update(state => ({ ...state, isRunning: false }));
    },

    reset: () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      update(state => {
        const duration = getDurationForMode(state.mode);
        return { ...state, timeRemaining: duration, isRunning: false };
      });
    },

    setMode: (mode) => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      const duration = getDurationForMode(mode);
      update(state => ({
        ...state,
        mode,
        timeRemaining: duration,
        isRunning: false
      }));
    },

    incrementPomodoros: () => {
      update(state => ({
        ...state,
        completedPomodoros: state.completedPomodoros + 1
      }));
    }
  };
}

function getDurationForMode(mode) {
  switch (mode) {
    case MODES.WORK:
      return WORK_DURATION;
    case MODES.SHORT_BREAK:
      return SHORT_BREAK_DURATION;
    case MODES.LONG_BREAK:
      return LONG_BREAK_DURATION;
    default:
      return WORK_DURATION;
  }
}

export const timer = createTimerStore();

// Derived store for formatted time display
export const formattedTime = derived(timer, ($timer) => {
  const minutes = Math.floor($timer.timeRemaining / 60);
  const seconds = $timer.timeRemaining % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
});

// Dark mode store with persistence
function createDarkModeStore() {
  // Check for saved preference or system preference
  const savedPreference = typeof localStorage !== 'undefined' 
    ? localStorage.getItem('darkMode') 
    : null;
  
  const systemPreference = typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-color-scheme: dark)').matches
    : false;

  const initialValue = savedPreference !== null 
    ? savedPreference === 'true' 
    : systemPreference;

  const { subscribe, set, update } = writable(initialValue);

  return {
    subscribe,
    toggle: () => {
      update(value => {
        const newValue = !value;
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('darkMode', String(newValue));
        }
        return newValue;
      });
    },
    set: (value) => {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('darkMode', String(value));
      }
      set(value);
    }
  };
}

export const darkMode = createDarkModeStore();
