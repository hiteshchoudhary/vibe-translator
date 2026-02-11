// DOM Elements
const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const themeToggle = document.getElementById('theme-toggle');
const modeBtns = document.querySelectorAll('.mode-btn');
const sessionCount = document.getElementById('session-count');
const timerCircle = document.querySelector('.timer-circle');
const progressCircle = document.querySelector('.progress-ring-circle');

// Timer State
let timeLeft = 25 * 60; // in seconds
let totalTime = 25 * 60;
let timerInterval = null;
let isRunning = false;
let sessions = 0;

// Progress circle circumference (2 * PI * radius)
const circumference = 2 * Math.PI * 130;
progressCircle.style.strokeDasharray = circumference;

// Initialize
function init() {
    loadTheme();
    loadSessions();
    updateDisplay();
    updateProgress();
}

// Theme Management
function loadTheme() {
    const savedTheme = localStorage.getItem('pomodoro-theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('pomodoro-theme', newTheme);
}

// Session Management
function loadSessions() {
    const savedSessions = localStorage.getItem('pomodoro-sessions');
    if (savedSessions) {
        sessions = parseInt(savedSessions, 10);
        sessionCount.textContent = sessions;
    }
}

function incrementSession() {
    sessions++;
    sessionCount.textContent = sessions;
    localStorage.setItem('pomodoro-sessions', sessions);
}

// Timer Functions
function updateDisplay() {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    minutesDisplay.textContent = mins.toString().padStart(2, '0');
    secondsDisplay.textContent = secs.toString().padStart(2, '0');
    
    // Update page title
    document.title = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')} - Pomodoro Timer`;
}

function updateProgress() {
    const progress = timeLeft / totalTime;
    const offset = circumference * (1 - progress);
    progressCircle.style.strokeDashoffset = offset;
}

function startTimer() {
    if (isRunning) {
        // Pause
        clearInterval(timerInterval);
        isRunning = false;
        startBtn.textContent = 'Resume';
        timerCircle.classList.remove('running');
    } else {
        // Start/Resume
        isRunning = true;
        startBtn.textContent = 'Pause';
        timerCircle.classList.add('running');
        
        timerInterval = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                updateDisplay();
                updateProgress();
            } else {
                // Timer completed
                clearInterval(timerInterval);
                isRunning = false;
                timerCircle.classList.remove('running');
                startBtn.textContent = 'Start';
                
                // Check if it was a pomodoro session
                const activeMode = document.querySelector('.mode-btn.active');
                if (activeMode.dataset.mode === 'pomodoro') {
                    incrementSession();
                }
                
                // Play notification sound (using Web Audio API)
                playNotification();
                
                // Show browser notification if permitted
                showNotification();
            }
        }, 1000);
    }
}

function resetTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    timerCircle.classList.remove('running');
    startBtn.textContent = 'Start';
    
    const activeMode = document.querySelector('.mode-btn.active');
    const minutes = parseInt(activeMode.dataset.time, 10);
    totalTime = minutes * 60;
    timeLeft = totalTime;
    
    updateDisplay();
    updateProgress();
}

function setMode(btn) {
    // Update active state
    modeBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    // Reset timer with new duration
    clearInterval(timerInterval);
    isRunning = false;
    timerCircle.classList.remove('running');
    startBtn.textContent = 'Start';
    
    const minutes = parseInt(btn.dataset.time, 10);
    totalTime = minutes * 60;
    timeLeft = totalTime;
    
    updateDisplay();
    updateProgress();
}

// Notification Functions
function playNotification() {
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
        
        // Play a second beep
        setTimeout(() => {
            const osc2 = audioContext.createOscillator();
            const gain2 = audioContext.createGain();
            
            osc2.connect(gain2);
            gain2.connect(audioContext.destination);
            
            osc2.frequency.value = 1000;
            osc2.type = 'sine';
            
            gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
            gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            osc2.start(audioContext.currentTime);
            osc2.stop(audioContext.currentTime + 0.5);
        }, 200);
    } catch (e) {
        console.log('Audio notification not supported');
    }
}

function showNotification() {
    if ('Notification' in window && Notification.permission === 'granted') {
        const activeMode = document.querySelector('.mode-btn.active');
        const title = activeMode.dataset.mode === 'pomodoro' 
            ? 'Pomodoro Complete!' 
            : 'Break Over!';
        const body = activeMode.dataset.mode === 'pomodoro'
            ? 'Time for a break!'
            : 'Ready to focus again?';
        
        new Notification(title, { body, icon: '🍅' });
    }
}

// Request notification permission on first interaction
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

// Event Listeners
startBtn.addEventListener('click', () => {
    requestNotificationPermission();
    startTimer();
});

resetBtn.addEventListener('click', resetTimer);

themeToggle.addEventListener('click', toggleTheme);

modeBtns.forEach(btn => {
    btn.addEventListener('click', () => setMode(btn));
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        requestNotificationPermission();
        startTimer();
    }
    if (e.code === 'KeyR' && e.target === document.body) {
        resetTimer();
    }
});

// Initialize the app
init();
