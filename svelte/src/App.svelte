<script>
  import { timer, formattedTime, darkMode, MODES } from './stores.js';
  import { onDestroy } from 'svelte';

  // Watch for timer completion to auto-switch modes
  let previousTimeRemaining = $timer.timeRemaining;
  
  $: {
    if (previousTimeRemaining > 0 && $timer.timeRemaining === 0) {
      handleTimerComplete();
    }
    previousTimeRemaining = $timer.timeRemaining;
  }

  function handleTimerComplete() {
    // Play notification sound
    playNotificationSound();
    
    if ($timer.mode === MODES.WORK) {
      timer.incrementPomodoros();
      // Every 4 pomodoros, suggest a long break
      const nextMode = ($timer.completedPomodoros + 1) % 4 === 0 
        ? MODES.LONG_BREAK 
        : MODES.SHORT_BREAK;
      timer.setMode(nextMode);
    } else {
      timer.setMode(MODES.WORK);
    }
  }

  function playNotificationSound() {
    // Create a simple beep sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
      console.log('Audio notification not available');
    }
  }

  function handleStartPause() {
    if ($timer.isRunning) {
      timer.pause();
    } else {
      timer.start();
    }
  }

  function handleReset() {
    timer.reset();
  }

  function handleModeChange(mode) {
    timer.setMode(mode);
  }

  function toggleDarkMode() {
    darkMode.toggle();
  }

  // Calculate progress percentage for the circular progress
  $: progress = (() => {
    let totalDuration;
    switch ($timer.mode) {
      case MODES.WORK:
        totalDuration = 25 * 60;
        break;
      case MODES.SHORT_BREAK:
        totalDuration = 5 * 60;
        break;
      case MODES.LONG_BREAK:
        totalDuration = 15 * 60;
        break;
      default:
        totalDuration = 25 * 60;
    }
    return (($timer.timeRemaining / totalDuration) * 100);
  })();

  // Calculate stroke dashoffset for circular progress
  $: circumference = 2 * Math.PI * 120;
  $: strokeDashoffset = circumference - (progress / 100) * circumference;

  // Get mode label
  $: modeLabel = (() => {
    switch ($timer.mode) {
      case MODES.WORK:
        return 'Focus Time';
      case MODES.SHORT_BREAK:
        return 'Short Break';
      case MODES.LONG_BREAK:
        return 'Long Break';
      default:
        return 'Focus Time';
    }
  })();
</script>

<div class="app" class:dark={$darkMode}>
  <header>
    <h1>Pomodoro Timer</h1>
    <button 
      class="theme-toggle" 
      on:click={toggleDarkMode}
      aria-label={$darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {#if $darkMode}
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      {:else}
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      {/if}
    </button>
  </header>

  <main>
    <div class="mode-selector">
      <button 
        class="mode-btn" 
        class:active={$timer.mode === MODES.WORK}
        on:click={() => handleModeChange(MODES.WORK)}
      >
        Focus
      </button>
      <button 
        class="mode-btn" 
        class:active={$timer.mode === MODES.SHORT_BREAK}
        on:click={() => handleModeChange(MODES.SHORT_BREAK)}
      >
        Short Break
      </button>
      <button 
        class="mode-btn" 
        class:active={$timer.mode === MODES.LONG_BREAK}
        on:click={() => handleModeChange(MODES.LONG_BREAK)}
      >
        Long Break
      </button>
    </div>

    <div class="timer-container">
      <svg class="progress-ring" width="280" height="280">
        <circle
          class="progress-ring-bg"
          cx="140"
          cy="140"
          r="120"
          fill="none"
          stroke-width="8"
        />
        <circle
          class="progress-ring-progress"
          cx="140"
          cy="140"
          r="120"
          fill="none"
          stroke-width="8"
          stroke-dasharray={circumference}
          stroke-dashoffset={strokeDashoffset}
          transform="rotate(-90 140 140)"
        />
      </svg>
      <div class="timer-display">
        <span class="mode-label">{modeLabel}</span>
        <span class="time">{$formattedTime}</span>
      </div>
    </div>

    <div class="controls">
      <button class="control-btn secondary" on:click={handleReset} aria-label="Reset timer">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="1 4 1 10 7 10"></polyline>
          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
        </svg>
      </button>
      <button class="control-btn primary" on:click={handleStartPause}>
        {#if $timer.isRunning}
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16"></rect>
            <rect x="14" y="4" width="4" height="16"></rect>
          </svg>
        {:else}
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        {/if}
      </button>
      <button class="control-btn secondary" on:click={() => timer.setMode($timer.mode === MODES.WORK ? MODES.SHORT_BREAK : MODES.WORK)} aria-label="Switch mode">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="17 1 21 5 17 9"></polyline>
          <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
          <polyline points="7 23 3 19 7 15"></polyline>
          <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
        </svg>
      </button>
    </div>

    <div class="stats">
      <div class="stat">
        <span class="stat-value">{$timer.completedPomodoros}</span>
        <span class="stat-label">Pomodoros Completed</span>
      </div>
    </div>
  </main>

  <footer>
    <p>Stay focused and take breaks!</p>
  </footer>
</div>

<style>
  :root {
    --bg-primary: #f5f7fa;
    --bg-secondary: #ffffff;
    --text-primary: #2d3748;
    --text-secondary: #718096;
    --accent-work: #e53e3e;
    --accent-short-break: #38a169;
    --accent-long-break: #3182ce;
    --border-color: #e2e8f0;
    --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }

  .dark {
    --bg-primary: #1a202c;
    --bg-secondary: #2d3748;
    --text-primary: #f7fafc;
    --text-secondary: #a0aec0;
    --border-color: #4a5568;
    --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2);
  }

  :global(*) {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :global(body) {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  }

  .app {
    min-height: 100vh;
    background-color: var(--bg-primary);
    color: var(--text-primary);
    transition: background-color 0.3s ease, color 0.3s ease;
    display: flex;
    flex-direction: column;
  }

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 2rem;
    background-color: var(--bg-secondary);
    box-shadow: var(--shadow);
  }

  h1 {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
  }

  .theme-toggle {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 0.5rem;
    color: var(--text-secondary);
    transition: background-color 0.2s ease, color 0.2s ease;
  }

  .theme-toggle:hover {
    background-color: var(--border-color);
    color: var(--text-primary);
  }

  main {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    gap: 2rem;
  }

  .mode-selector {
    display: flex;
    gap: 0.5rem;
    background-color: var(--bg-secondary);
    padding: 0.5rem;
    border-radius: 1rem;
    box-shadow: var(--shadow);
  }

  .mode-btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 0.75rem;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    background-color: transparent;
    color: var(--text-secondary);
    transition: all 0.2s ease;
  }

  .mode-btn:hover {
    background-color: var(--border-color);
    color: var(--text-primary);
  }

  .mode-btn.active {
    color: white;
  }

  .mode-btn.active:nth-child(1) {
    background-color: var(--accent-work);
  }

  .mode-btn.active:nth-child(2) {
    background-color: var(--accent-short-break);
  }

  .mode-btn.active:nth-child(3) {
    background-color: var(--accent-long-break);
  }

  .timer-container {
    position: relative;
    width: 280px;
    height: 280px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .progress-ring {
    position: absolute;
    top: 0;
    left: 0;
  }

  .progress-ring-bg {
    stroke: var(--border-color);
  }

  .progress-ring-progress {
    stroke: var(--accent-work);
    stroke-linecap: round;
    transition: stroke-dashoffset 0.5s ease;
  }

  .dark .progress-ring-progress {
    stroke: var(--accent-work);
  }

  :global(.app) .progress-ring-progress {
    stroke: var(--accent-work);
  }

  .timer-display {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    z-index: 1;
  }

  .mode-label {
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .time {
    font-size: 4rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: var(--text-primary);
  }

  .controls {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .control-btn {
    border: none;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .control-btn.primary {
    width: 80px;
    height: 80px;
    background-color: var(--accent-work);
    color: white;
    box-shadow: var(--shadow-lg);
  }

  .control-btn.primary:hover {
    transform: scale(1.05);
  }

  .control-btn.primary:active {
    transform: scale(0.95);
  }

  .control-btn.secondary {
    width: 50px;
    height: 50px;
    background-color: var(--bg-secondary);
    color: var(--text-secondary);
    box-shadow: var(--shadow);
  }

  .control-btn.secondary:hover {
    color: var(--text-primary);
    transform: scale(1.05);
  }

  .stats {
    display: flex;
    gap: 2rem;
    margin-top: 1rem;
  }

  .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    padding: 1rem 2rem;
    background-color: var(--bg-secondary);
    border-radius: 1rem;
    box-shadow: var(--shadow);
  }

  .stat-value {
    font-size: 2rem;
    font-weight: 700;
    color: var(--accent-work);
  }

  .stat-label {
    font-size: 0.8rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  footer {
    padding: 1.5rem;
    text-align: center;
    color: var(--text-secondary);
    font-size: 0.9rem;
  }

  @media (max-width: 480px) {
    header {
      padding: 1rem;
    }

    h1 {
      font-size: 1.25rem;
    }

    .mode-selector {
      flex-wrap: wrap;
      justify-content: center;
    }

    .mode-btn {
      padding: 0.5rem 1rem;
      font-size: 0.8rem;
    }

    .time {
      font-size: 3rem;
    }

    .timer-container {
      width: 240px;
      height: 240px;
    }

    .progress-ring {
      width: 240px;
      height: 240px;
    }

    .stat {
      padding: 0.75rem 1.5rem;
    }

    .stat-value {
      font-size: 1.5rem;
    }
  }
</style>
