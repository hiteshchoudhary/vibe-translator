# 🍅 Pomodoro Timer

A beautiful, fully-functional Pomodoro timer built with Vue 3, Tailwind CSS, and Vite.

## Features

- **Three Timer Modes**: Work (25 min), Short Break (5 min), Long Break (15 min)
- **Dark Mode**: Toggle between light and dark themes with persistent preference
- **Visual Progress**: Circular progress indicator showing time remaining
- **Audio Notifications**: Sound alert when timer completes
- **Pomodoro Counter**: Track completed work sessions
- **Auto-transition**: Automatically suggests breaks after work sessions
- **Dynamic Title**: Browser tab shows current timer state

## Tech Stack

- Vue 3 with Composition API (`<script setup>`)
- Tailwind CSS v4 for styling
- Vite for fast development and building

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## How to Use

1. Click **Start** to begin a 25-minute work session
2. Focus on your task until the timer completes
3. Take a short break when prompted
4. After 4 pomodoros, take a longer break
5. Repeat and stay productive!

## The Pomodoro Technique

The Pomodoro Technique is a time management method that uses a timer to break work into intervals (traditionally 25 minutes) separated by short breaks. This app follows the classic pattern:

- 🍅 Work for 25 minutes
- ☕ Short break for 5 minutes
- 🔄 Repeat 4 times
- 🌴 Long break for 15 minutes
