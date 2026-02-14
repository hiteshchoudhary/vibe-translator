<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

// Timer modes
const MODES = {
  work: { name: 'Work', duration: 25 * 60, color: 'rose' },
  shortBreak: { name: 'Short Break', duration: 5 * 60, color: 'emerald' },
  longBreak: { name: 'Long Break', duration: 15 * 60, color: 'blue' }
}

// Reactive state
const currentMode = ref('work')
const timeRemaining = ref(MODES.work.duration)
const isRunning = ref(false)
const completedPomodoros = ref(0)
const isDarkMode = ref(true)

let intervalId = null

// Computed properties
const currentModeConfig = computed(() => MODES[currentMode.value])

const formattedTime = computed(() => {
  const minutes = Math.floor(timeRemaining.value / 60)
  const seconds = timeRemaining.value % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

const progress = computed(() => {
  const total = currentModeConfig.value.duration
  return ((total - timeRemaining.value) / total) * 100
})

const circumference = computed(() => 2 * Math.PI * 120)

const strokeDashoffset = computed(() => {
  return circumference.value - (progress.value / 100) * circumference.value
})

// Methods
const toggleTimer = () => {
  if (isRunning.value) {
    pauseTimer()
  } else {
    startTimer()
  }
}

const startTimer = () => {
  isRunning.value = true
  intervalId = setInterval(() => {
    if (timeRemaining.value > 0) {
      timeRemaining.value--
    } else {
      completeSession()
    }
  }, 1000)
}

const pauseTimer = () => {
  isRunning.value = false
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}

const resetTimer = () => {
  pauseTimer()
  timeRemaining.value = currentModeConfig.value.duration
}

const completeSession = () => {
  pauseTimer()
  playNotification()
  
  if (currentMode.value === 'work') {
    completedPomodoros.value++
    // Every 4 pomodoros, suggest a long break
    if (completedPomodoros.value % 4 === 0) {
      switchMode('longBreak')
    } else {
      switchMode('shortBreak')
    }
  } else {
    switchMode('work')
  }
}

const switchMode = (mode) => {
  pauseTimer()
  currentMode.value = mode
  timeRemaining.value = MODES[mode].duration
}

const playNotification = () => {
  // Create a simple beep using Web Audio API
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.value = 800
    oscillator.type = 'sine'
    gainNode.gain.value = 0.3
    
    oscillator.start()
    oscillator.stop(audioContext.currentTime + 0.3)
  } catch (e) {
    console.log('Audio notification not available')
  }
}

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
  localStorage.setItem('pomodoro-dark-mode', isDarkMode.value)
}

// Lifecycle
onMounted(() => {
  const savedDarkMode = localStorage.getItem('pomodoro-dark-mode')
  if (savedDarkMode !== null) {
    isDarkMode.value = savedDarkMode === 'true'
  }
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})

// Update document title with timer
watch(formattedTime, (newTime) => {
  document.title = `${newTime} - ${currentModeConfig.value.name} | Pomodoro`
})
</script>

<template>
  <div
    :class="[
      'min-h-screen transition-colors duration-300 flex flex-col items-center justify-center p-4',
      isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'
    ]"
  >
    <!-- Dark Mode Toggle -->
    <button
      @click="toggleDarkMode"
      :class="[
        'absolute top-4 right-4 p-3 rounded-full transition-all duration-300 hover:scale-110',
        isDarkMode ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-200 shadow-md'
      ]"
      aria-label="Toggle dark mode"
    >
      <svg v-if="isDarkMode" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    </button>

    <!-- Main Container -->
    <div
      :class="[
        'w-full max-w-md rounded-3xl p-8 shadow-2xl transition-all duration-300',
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      ]"
    >
      <!-- Header -->
      <h1 class="text-3xl font-bold text-center mb-2">🍅 Pomodoro Timer</h1>
      <p :class="['text-center mb-6', isDarkMode ? 'text-gray-400' : 'text-gray-500']">
        Stay focused, be productive
      </p>

      <!-- Mode Selector -->
      <div class="flex gap-2 mb-8">
        <button
          v-for="(config, mode) in MODES"
          :key="mode"
          @click="switchMode(mode)"
          :class="[
            'flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-all duration-200',
            currentMode === mode
              ? mode === 'work'
                ? 'bg-rose-500 text-white'
                : mode === 'shortBreak'
                ? 'bg-emerald-500 text-white'
                : 'bg-blue-500 text-white'
              : isDarkMode
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          ]"
        >
          {{ config.name }}
        </button>
      </div>

      <!-- Timer Display -->
      <div class="relative flex items-center justify-center mb-8">
        <svg class="w-64 h-64 transform -rotate-90">
          <!-- Background Circle -->
          <circle
            cx="128"
            cy="128"
            r="120"
            :class="isDarkMode ? 'stroke-gray-700' : 'stroke-gray-200'"
            stroke-width="8"
            fill="none"
          />
          <!-- Progress Circle -->
          <circle
            cx="128"
            cy="128"
            r="120"
            :class="[
              currentMode === 'work'
                ? 'stroke-rose-500'
                : currentMode === 'shortBreak'
                ? 'stroke-emerald-500'
                : 'stroke-blue-500'
            ]"
            stroke-width="8"
            fill="none"
            stroke-linecap="round"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="strokeDashoffset"
            class="transition-all duration-1000 ease-linear"
          />
        </svg>
        <div class="absolute flex flex-col items-center">
          <span class="text-6xl font-mono font-bold tracking-wider">{{ formattedTime }}</span>
          <span :class="['text-lg mt-2', isDarkMode ? 'text-gray-400' : 'text-gray-500']">
            {{ currentModeConfig.name }}
          </span>
        </div>
      </div>

      <!-- Controls -->
      <div class="flex gap-4 justify-center mb-8">
        <button
          @click="toggleTimer"
          :class="[
            'px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 active:scale-95',
            isRunning
              ? isDarkMode
                ? 'bg-gray-600 hover:bg-gray-500 text-white'
                : 'bg-gray-400 hover:bg-gray-500 text-white'
              : currentMode === 'work'
              ? 'bg-rose-500 hover:bg-rose-600 text-white'
              : currentMode === 'shortBreak'
              ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          ]"
        >
          {{ isRunning ? 'Pause' : 'Start' }}
        </button>
        <button
          @click="resetTimer"
          :class="[
            'px-6 py-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95',
            isDarkMode
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          ]"
        >
          Reset
        </button>
      </div>

      <!-- Stats -->
      <div
        :class="[
          'rounded-xl p-4 text-center',
          isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'
        ]"
      >
        <p :class="['text-sm', isDarkMode ? 'text-gray-400' : 'text-gray-500']">
          Completed Pomodoros
        </p>
        <div class="flex items-center justify-center gap-2 mt-2">
          <span v-for="n in Math.min(completedPomodoros, 8)" :key="n" class="text-2xl">🍅</span>
          <span v-if="completedPomodoros === 0" :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'">
            No pomodoros yet
          </span>
          <span v-else-if="completedPomodoros > 8" class="text-lg font-semibold">
            +{{ completedPomodoros - 8 }}
          </span>
        </div>
        <p :class="['text-2xl font-bold mt-2', isDarkMode ? 'text-white' : 'text-gray-900']">
          {{ completedPomodoros }}
        </p>
      </div>
    </div>

    <!-- Footer -->
    <p :class="['mt-6 text-sm', isDarkMode ? 'text-gray-500' : 'text-gray-400']">
      Press Start to begin your focus session
    </p>
  </div>
</template>
