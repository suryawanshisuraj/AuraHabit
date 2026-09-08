/**
 * AuraHabit - Unified Master Bundle Script
 * Self-Contained Offline Engine + Web Audio Synthesizer + Particle Confetti + BroadcastChannel Sync + 6 Pro Features
 */

// --- 1. Storage & Data Engine ---
const STORAGE_KEY = 'aurahabit_app_data_v3';
const SYNC_ROOM_KEY = 'aurahabit_sync_room';

const CATEGORIES = [
  { id: 'Health', name: 'Health & Wellness', icon: '💧', color: '#06b6d4' },
  { id: 'Productivity', name: 'Productivity & Focus', icon: '🧠', color: '#f59e0b' },
  { id: 'Mindfulness', name: 'Mindfulness & Peace', icon: '🧘', color: '#8b5cf6' },
  { id: 'Fitness', name: 'Fitness & Motion', icon: '👟', color: '#10b981' },
  { id: 'Learning', name: 'Skills & Growth', icon: '📚', color: '#3b82f6' }
];

const PRESET_TEMPLATES = [
  {
    id: 'preset_morning',
    title: '☀️ Morning Power Routine',
    category: 'Health',
    description: 'Start your morning with high vitality, hydration, and mental clarity.',
    habits: [
      { name: 'Hydrate 500ml Water', category: 'Health', icon: '💧', color: '#06b6d4', type: 'boolean', timeOfDay: 'Morning', difficulty: 'Easy', xpValue: 10, targetValue: 1, unit: 'check' },
      { name: 'Morning Body Stretch', category: 'Fitness', icon: '🧘', color: '#10b981', type: 'duration', targetValue: 10, unit: 'mins', timeOfDay: 'Morning', difficulty: 'Easy', xpValue: 10 },
      { name: 'No Social Media First 30m', category: 'Mindfulness', icon: '📵', color: '#8b5cf6', type: 'boolean', timeOfDay: 'Morning', difficulty: 'Medium', xpValue: 25, targetValue: 1, unit: 'check' }
    ]
  },
  {
    id: 'preset_coder',
    title: '💻 High-Performance Coder',
    category: 'Productivity',
    description: 'Structure your day for deep work sessions, skill building, and physical posture care.',
    habits: [
      { name: 'Deep Coding Focus Session', category: 'Productivity', icon: '🧠', color: '#3b82f6', type: 'duration', targetValue: 50, unit: 'mins', timeOfDay: 'Afternoon', difficulty: 'Hard', xpValue: 50 },
      { name: 'Read Documentation or Tech Book', category: 'Learning', icon: '📚', color: '#f59e0b', type: 'duration', targetValue: 20, unit: 'mins', timeOfDay: 'Evening', difficulty: 'Medium', xpValue: 25 },
      { name: 'Postural Reset & Wrist Stretch', category: 'Health', icon: '🧍', color: '#ec4899', type: 'boolean', timeOfDay: 'Afternoon', difficulty: 'Easy', xpValue: 10, targetValue: 1, unit: 'check' }
    ]
  },
  {
    id: 'preset_evening',
    title: '🌙 Mindful Evening Reset',
    category: 'Mindfulness',
    description: 'Wind down effectively to maximize sleep quality and mental recovery.',
    habits: [
      { name: 'Screen Free 45m Before Bed', category: 'Mindfulness', icon: '🌙', color: '#8b5cf6', type: 'boolean', timeOfDay: 'Evening', difficulty: 'Medium', xpValue: 25, targetValue: 1, unit: 'check' },
      { name: 'Evening Gratitude Journal', category: 'Productivity', icon: '📝', color: '#f59e0b', type: 'boolean', timeOfDay: 'Evening', difficulty: 'Easy', xpValue: 10, targetValue: 1, unit: 'check' },
      { name: 'Target 8 Hours Sleep', category: 'Health', icon: '🛌', color: '#6366f1', type: 'duration', targetValue: 8, unit: 'hrs', timeOfDay: 'Evening', difficulty: 'Medium', xpValue: 25 }
    ]
  }
];

const BADGES_LIST = [
  { id: 'first_step', title: 'First Step', desc: 'Log your very first completed habit', icon: '🌱', category: 'Milestone' },
  { id: 'streak_3', title: 'Building Momentum', desc: 'Achieve a 3-day continuous habit streak', icon: '🔥', category: 'Streak' },
  { id: 'streak_7', title: 'Week Warrior', desc: 'Maintain a 7-day continuous habit streak', icon: '⚡', category: 'Streak' },
  { id: 'streak_30', title: 'Consistency Master', desc: 'Maintain a 30-day habit streak', icon: '👑', category: 'Streak' },
  { id: 'habits_25', title: 'Habit Enthusiast', desc: 'Complete 25 total habit instances', icon: '🎯', category: 'Milestone' },
  { id: 'habits_100', title: 'Habit Champion', desc: 'Complete 100 total habit instances', icon: '🏆', category: 'Milestone' },
  { id: 'level_5', title: 'High Achiever', desc: 'Reach Level 5 in AuraHabit', icon: '⭐', category: 'Level' }
];

function getFormattedDateKey(date = new Date()) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function generateSyncRoomId() {
  const code = Math.floor(1000 + Math.random() * 9000);
  return `AURA-${code}`;
}

function getSyncRoomId() {
  let room = localStorage.getItem(SYNC_ROOM_KEY);
  if (!room) {
    room = generateSyncRoomId();
    localStorage.setItem(SYNC_ROOM_KEY, room);
  }
  return room;
}

function setSyncRoomId(roomCode) {
  localStorage.setItem(SYNC_ROOM_KEY, roomCode.toUpperCase());
}

function loadAppData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initialData = createDefaultState();
      saveAppData(initialData);
      return initialData;
    }
    const parsed = JSON.parse(raw);
    return {
      habits: parsed.habits || [],
      logs: parsed.logs || {},
      moods: parsed.moods || {},
      user: parsed.user || { name: 'Achiever', xp: 0, level: 1, theme: 'light', soundEnabled: true, ambientSound: 'off', syncRoom: getSyncRoomId(), titles: [] },
      unlockedBadges: parsed.unlockedBadges || [],
      focusSessions: parsed.focusSessions || []
    };
  } catch (e) {
    return createDefaultState();
  }
}

function saveAppData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    broadcastLiveSync(data);
  } catch (e) {
    console.error(e);
  }
}

const syncChannel = new BroadcastChannel('aurahabit_realtime_channel');

function broadcastLiveSync(data) {
  syncChannel.postMessage({
    type: 'REALTIME_STATE_UPDATE',
    room: data.user.syncRoom || getSyncRoomId(),
    data
  });
}

function subscribeLiveSync(callback) {
  syncChannel.onmessage = (event) => {
    if (event.data && event.data.type === 'REALTIME_STATE_UPDATE') {
      const currentRoom = getSyncRoomId();
      if (event.data.room === currentRoom) {
        callback(event.data.data);
      }
    }
  };

  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        callback(JSON.parse(e.newValue));
      } catch (err) {}
    }
  });
}

function getDefaultHabits() {
  return [];
}

function createDefaultState() {
  return {
    habits: [],
    logs: {},
    moods: {},
    user: { name: 'Achiever', xp: 0, level: 1, theme: 'light', soundEnabled: true, ambientSound: 'off', syncRoom: getSyncRoomId(), titles: [] },
    unlockedBadges: [],
    focusSessions: []
  };
}

function calculateLevel(xp) {
  const level = Math.floor(xp / 100) + 1;
  const currentLevelXP = xp % 100;
  const xpNeeded = 100;
  return { level, currentLevelXP, xpNeeded, percentage: Math.min(100, Math.round((currentLevelXP / xpNeeded) * 100)) };
}

function calculateHabitStreak(habitId, logs) {
  let currentStreak = 0;
  let maxStreak = 0;
  let tempStreak = 0;
  const today = new Date();
  const todayKey = getFormattedDateKey(today);
  const todayCompleted = logs[todayKey] && logs[todayKey][habitId] && logs[todayKey][habitId].completed;
  let dayOffset = todayCompleted ? 0 : 1;

  for (let i = dayOffset; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = getFormattedDateKey(d);
    const entry = logs[key] && logs[key][habitId];
    if (entry && entry.completed) currentStreak++;
    else break;
  }

  const sortedDates = Object.keys(logs).sort();
  for (const dateKey of sortedDates) {
    const entry = logs[dateKey] && logs[dateKey][habitId];
    if (entry && entry.completed) {
      tempStreak++;
      if (tempStreak > maxStreak) maxStreak = tempStreak;
    } else {
      tempStreak = 0;
    }
  }

  return { currentStreak, maxStreak };
}

// --- 2. Audio Synthesizer ---
class AudioSynthesizer {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.ambientGain = null;
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setEnabled(val) { this.enabled = val; }

  playClick() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  playSuccess() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, index) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = this.ctx.currentTime + index * 0.08;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.3);
    });
  }
}

const soundFx = new AudioSynthesizer();

function triggerConfettiBurst() {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '99999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const colors = ['#6366f1', '#06b6d4', '#ec4899', '#10b981', '#f59e0b'];

  for (let i = 0; i < 70; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 14,
      vy: (Math.random() - 0.7) * 16,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1
    });
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let active = false;
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.4;
      p.alpha -= 0.015;
      if (p.alpha > 0) {
        active = true;
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    if (active) requestAnimationFrame(animate);
    else document.body.removeChild(canvas);
  }

  requestAnimationFrame(animate);
}

// --- 3. Main App Controller ---
class AppController {
  constructor() {
    this.data = loadAppData();
    this.currentView = 'dashboard';
    this.selectedDate = new Date();
    this.activeFilter = 'all';
    this.pomodoro = { isRunning: false, secondsLeft: 1500, timerId: null };
    this.editingHabitId = null;

    this.init();
  }

  init() {
    this.applyTheme(this.data.user.theme || 'light');
    this.bindEvents();
    this.setupHashRouter();
    this.renderAll();
    this.startReminderCheckerLoop();

    subscribeLiveSync((newData) => {
      this.data = newData;
      this.renderAll();
    });
  }

  applyTheme(theme) {
    this.data.user.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    saveAppData(this.data);
  }

  startReminderCheckerLoop() {
    setInterval(() => {
      this.checkHabitReminders();
    }, 30000);
  }

  checkHabitReminders() {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    const now = new Date();
    const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const todayKey = getFormattedDateKey(now);
    const dayLogs = this.data.logs[todayKey] || {};

    this.data.habits.forEach(h => {
      if (h.reminderTime === currentHHMM && (!dayLogs[h.id] || !dayLogs[h.id].completed)) {
        new Notification(`⏰ Habit Reminder: ${h.name}`, {
          body: `Time to complete your habit "${h.name}"! Stay consistent.`,
          icon: '✨'
        });
      }
    });
  }

  setupHashRouter() {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '') || 'dashboard';
      this.switchView(hash);
    };

    window.addEventListener('hashchange', handleHash);
    handleHash();
  }

  switchView(viewId) {
    this.currentView = viewId;
    document.querySelectorAll('.nav-tab-btn, .mobile-nav-btn').forEach(btn => {
      if (btn.dataset.view === viewId) btn.classList.add('active');
      else btn.classList.remove('active');
    });

    document.querySelectorAll('.page-view').forEach(page => {
      if (page.id === `view-${viewId}`) page.classList.add('active');
      else page.classList.remove('active');
    });

    this.renderAll();
  }

  renderAll() {
    this.renderHeader();

    if (this.currentView === 'dashboard') {
      this.renderHeroStats();
      this.renderWeekStrip();
      this.renderHabits();
      this.renderMoodSection();
      this.renderInsights();
    } else if (this.currentView === 'analytics') {
      this.renderAnalyticsPage();
    } else if (this.currentView === 'habits') {
      this.renderHabitsManagementPage();
    } else if (this.currentView === 'timer') {
      this.renderFocusChamberPage();
    } else if (this.currentView === 'journal') {
      this.renderJournalTimelinePage();
    } else if (this.currentView === 'leaderboard') {
      this.renderLeaderboardPage();
    } else if (this.currentView === 'profile') {
      this.renderProfilePage();
    }
  }

  renderHeader() {
    const levelInfo = calculateLevel(this.data.user.xp);

    const levelTagEl = document.getElementById('userLevelTag');
    if (levelTagEl) levelTagEl.innerText = `LVL ${levelInfo.level}`;

    const xpTextEl = document.getElementById('userXPText');
    if (xpTextEl) xpTextEl.innerText = `${levelInfo.currentLevelXP} / ${levelInfo.xpNeeded} XP`;

    const xpBarEl = document.getElementById('userXPBarFill');
    if (xpBarEl) xpBarEl.style.width = `${levelInfo.percentage}%`;

    const activeTheme = this.data.user.theme || 'light';
    document.documentElement.setAttribute('data-theme', activeTheme);

    const themeBtn = document.getElementById('headerThemeToggleBtn');
    if (themeBtn) {
      themeBtn.innerText = (activeTheme === 'light') ? '☀️ Light Mode' : '🌙 Dark Mode';
    }

    const soundBtn = document.getElementById('soundToggleBtn');
    if (soundBtn) soundBtn.innerText = this.data.user.soundEnabled ? '🔊' : '🔇';

    const syncRoomEl = document.getElementById('syncRoomCodeDisplay');
    if (syncRoomEl) syncRoomEl.innerText = getSyncRoomId();
  }

  renderHeroStats() {
    const dateKey = getFormattedDateKey(this.selectedDate);
    const dayLogs = this.data.logs[dateKey] || {};
    const activeHabits = this.data.habits.filter(h => !h.archived);

    let completedCount = 0;
    activeHabits.forEach(h => {
      if (dayLogs[h.id] && dayLogs[h.id].completed) completedCount++;
    });

    const percentage = activeHabits.length > 0 ? Math.round((completedCount / activeHabits.length) * 100) : 0;

    const ringPctText = document.getElementById('heroRingPct');
    if (ringPctText) ringPctText.innerText = `${percentage}%`;

    const ringCircle = document.getElementById('heroRingProgress');
    if (ringCircle) {
      const circumference = 2 * Math.PI * 54;
      const offset = circumference - (percentage / 100) * circumference;
      ringCircle.style.strokeDashoffset = offset;
    }

    const greetingText = document.getElementById('heroGreeting');
    if (greetingText) {
      const hours = new Date().getHours();
      let timeGreeting = 'Good Morning';
      if (hours >= 12 && hours < 18) timeGreeting = 'Good Afternoon';
      else if (hours >= 18) timeGreeting = 'Good Evening';
      greetingText.innerText = `${timeGreeting}, ${this.data.user.name || 'Achiever'}!`;
    }

    const dateSubtext = document.getElementById('heroDateSubtext');
    if (dateSubtext) {
      const options = { weekday: 'long', month: 'short', day: 'numeric' };
      dateSubtext.innerText = `${this.selectedDate.toLocaleDateString('en-US', options)} • ${completedCount}/${activeHabits.length} Habits Logged`;
    }
  }

  renderWeekStrip() {
    const stripContainer = document.getElementById('weekStripContainer');
    if (!stripContainer) return;

    stripContainer.innerHTML = '';

    const current = new Date(this.selectedDate);
    const dayOfWeek = current.getDay();
    const distanceToMon = (dayOfWeek + 6) % 7;
    const monday = new Date(current);
    monday.setDate(current.getDate() - distanceToMon);

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateKey = getFormattedDateKey(d);

      const isSelected = getFormattedDateKey(d) === getFormattedDateKey(this.selectedDate);
      const dayLogs = this.data.logs[dateKey] || {};
      const activeHabits = this.data.habits.filter(h => !h.archived);
      let completedCount = 0;
      activeHabits.forEach(h => {
        if (dayLogs[h.id] && dayLogs[h.id].completed) completedCount++;
      });
      const allCompleted = activeHabits.length > 0 && completedCount === activeHabits.length;

      const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

      const btn = document.createElement('button');
      btn.className = `week-day-btn ${isSelected ? 'active' : ''} ${allCompleted ? 'completed-all' : ''}`;
      btn.innerHTML = `
        <span class="week-day-name">${dayNames[d.getDay()]}</span>
        <span class="week-day-num">${d.getDate()}</span>
        <span class="week-dot-indicator"></span>
      `;

      btn.addEventListener('click', () => {
        this.selectedDate = d;
        soundFx.playClick();
        this.renderAll();
      });

      stripContainer.appendChild(btn);
    }
  }

  renderHabits() {
    const habitsGrid = document.getElementById('habitsGrid');
    if (!habitsGrid) return;

    habitsGrid.innerHTML = '';
    const dateKey = getFormattedDateKey(this.selectedDate);
    const dayLogs = this.data.logs[dateKey] || {};

    let habitsToDisplay = this.data.habits.filter(h => !h.archived);

    if (this.activeFilter !== 'all') {
      habitsToDisplay = habitsToDisplay.filter(h => h.timeOfDay === this.activeFilter);
    }

    if (habitsToDisplay.length === 0) {
      habitsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
          <div style="font-size: 3rem; margin-bottom: 12px;">✨</div>
          <h3>No habits created yet!</h3>
          <p style="font-size: 0.9rem; margin-top: 6px;">Tap <b>"+ Add Custom Habit"</b> or <b>"✨ Presets"</b> to build your routine.</p>
        </div>
      `;
      return;
    }

    habitsToDisplay.forEach(habit => {
      const logEntry = dayLogs[habit.id] || { completed: false, value: 0 };
      const isCompleted = logEntry.completed;
      const streakData = calculateHabitStreak(habit.id, this.data.logs);

      const card = document.createElement('div');
      card.className = `habit-card ${isCompleted ? 'completed' : ''}`;

      let bodyControlsHTML = '';

      if (habit.type === 'numeric') {
        const currentVal = logEntry.value || 0;
        bodyControlsHTML = `
          <div class="numeric-controls">
            <button class="step-btn step-minus" data-id="${habit.id}">-</button>
            <span class="numeric-display">${currentVal} / ${habit.targetValue} ${habit.unit}</span>
            <button class="step-btn step-plus" data-id="${habit.id}">+</button>
          </div>
        `;
      } else if (habit.type === 'duration') {
        bodyControlsHTML = `
          <button class="timer-quick-btn" data-id="${habit.id}" data-target="${habit.targetValue}">
            ⏱️ Focus Timer (${habit.targetValue} ${habit.unit})
          </button>
        `;
      }

      card.innerHTML = `
        <div class="habit-card-header">
          <div class="habit-title-group">
            <div class="habit-icon-badge">${habit.icon}</div>
            <div>
              <div class="habit-name">${habit.name}</div>
              <div class="habit-category-tag">${habit.category} • ${habit.timeOfDay} ${habit.reminderTime ? '• ⏰ ' + habit.reminderTime : ''}</div>
            </div>
          </div>
        </div>

        <div class="habit-card-body">
          <p class="habit-desc">${habit.description || 'Stay consistent and achieve your goals daily.'}</p>
          <div class="habit-meta-row">
            <span class="habit-meta-pill streak-pill">🔥 ${streakData.currentStreak} Day Streak</span>
            <span class="habit-meta-pill">+${habit.xpValue} XP</span>
          </div>
        </div>

        <div class="habit-card-footer">
          <div>${bodyControlsHTML}</div>
          <button class="check-toggle-btn ${isCompleted ? 'completed' : ''}" data-id="${habit.id}">
            ✓
          </button>
        </div>
      `;

      card.querySelector('.check-toggle-btn').addEventListener('click', (e) => {
        if (navigator.vibrate) navigator.vibrate([15, 30, 25]);
        this.toggleHabitCompletion(habit.id);
      });

      if (habit.type === 'numeric') {
        card.querySelector('.step-minus').addEventListener('click', () => this.stepNumericHabit(habit.id, -1));
        card.querySelector('.step-plus').addEventListener('click', () => this.stepNumericHabit(habit.id, 1));
      } else if (habit.type === 'duration') {
        card.querySelector('.timer-quick-btn').addEventListener('click', () => {
          this.switchView('timer');
          this.setPomodoroTime(habit.targetValue);
        });
      }

      habitsGrid.appendChild(card);
    });
  }

  toggleHabitCompletion(habitId) {
    const dateKey = getFormattedDateKey(this.selectedDate);
    if (!this.data.logs[dateKey]) this.data.logs[dateKey] = {};

    const habit = this.data.habits.find(h => h.id === habitId);
    if (!habit) return;

    const currentEntry = this.data.logs[dateKey][habitId] || { completed: false, value: 0 };
    const newCompleted = !currentEntry.completed;

    this.data.logs[dateKey][habitId] = {
      completed: newCompleted,
      value: newCompleted ? habit.targetValue : 0,
      timestamp: new Date().toISOString()
    };

    if (newCompleted) {
      this.data.user.xp += habit.xpValue;
      soundFx.playSuccess();
      triggerConfettiBurst();
    } else {
      this.data.user.xp = Math.max(0, this.data.user.xp - habit.xpValue);
      soundFx.playClick();
    }

    saveAppData(this.data);
    this.renderAll();
  }

  stepNumericHabit(habitId, step) {
    const dateKey = getFormattedDateKey(this.selectedDate);
    if (!this.data.logs[dateKey]) this.data.logs[dateKey] = {};

    const habit = this.data.habits.find(h => h.id === habitId);
    if (!habit) return;

    const currentEntry = this.data.logs[dateKey][habitId] || { completed: false, value: 0 };
    let newVal = (currentEntry.value || 0) + step;
    if (newVal < 0) newVal = 0;

    const isCompleted = newVal >= habit.targetValue;
    this.data.logs[dateKey][habitId] = {
      completed: isCompleted,
      value: newVal,
      timestamp: new Date().toISOString()
    };

    if (isCompleted && !currentEntry.completed) {
      this.data.user.xp += habit.xpValue;
      soundFx.playSuccess();
      triggerConfettiBurst();
    }

    saveAppData(this.data);
    this.renderHabits();
    this.renderHeroStats();
  }

  renderMoodSection() {
    const dateKey = getFormattedDateKey(this.selectedDate);
    const moodEntry = this.data.moods[dateKey] || { mood: '', note: '' };

    document.querySelectorAll('.mood-btn').forEach(btn => {
      if (btn.dataset.mood === moodEntry.mood) btn.classList.add('active');
      else btn.classList.remove('active');
    });

    const journalArea = document.getElementById('journalNoteArea');
    if (journalArea && document.activeElement !== journalArea) {
      journalArea.value = moodEntry.note || '';
    }
  }

  saveMoodAndNote(moodVal = null) {
    const dateKey = getFormattedDateKey(this.selectedDate);
    const existing = this.data.moods[dateKey] || { mood: '', note: '' };
    const noteVal = document.getElementById('journalNoteArea')?.value || '';

    this.data.moods[dateKey] = {
      mood: moodVal !== null ? moodVal : existing.mood,
      note: noteVal,
      updatedAt: new Date().toISOString()
    };

    saveAppData(this.data);
  }

  renderInsights() {
    const el = document.getElementById('insightsList');
    if (!el) return;

    const totalCompletions = Object.values(this.data.logs).reduce((acc, day) => {
      return acc + Object.values(day).filter(e => e.completed).length;
    }, 0);

    el.innerHTML = `
      <div class="insight-item">
        <span class="insight-icon">🔥</span>
        <div class="insight-text">
          <b>Consistency Engine:</b> You have logged a total of <b>${totalCompletions} habit milestones</b> so far!
        </div>
      </div>
      <div class="insight-item">
        <span class="insight-icon">⚡</span>
        <div class="insight-text">
          <b>Level Progress:</b> Current level: <b>LVL ${calculateLevel(this.data.user.xp).level}</b> with ${this.data.user.xp} total XP.
        </div>
      </div>
    `;
  }

  renderAnalyticsPage() {
    let totalCompletions = 0;
    Object.values(this.data.logs).forEach(day => {
      Object.values(day).forEach(entry => { if (entry.completed) totalCompletions++; });
    });

    const totalCompEl = document.getElementById('statTotalCompletions');
    if (totalCompEl) totalCompEl.innerText = totalCompletions;

    let bestStreak = 0;
    this.data.habits.forEach(h => {
      const s = calculateHabitStreak(h.id, this.data.logs);
      if (s.maxStreak > bestStreak) bestStreak = s.maxStreak;
    });

    const bestStreakEl = document.getElementById('statBestStreak');
    if (bestStreakEl) bestStreakEl.innerText = `${bestStreak} Days`;

    this.renderHeatmap();
  }

  renderHeatmap() {
    const el = document.getElementById('activityHeatmap');
    if (!el) return;

    el.innerHTML = '';
    const today = new Date();

    for (let i = 120; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateKey = getFormattedDateKey(d);

      const dayLog = this.data.logs[dateKey] || {};
      let completedCount = 0;
      Object.values(dayLog).forEach(entry => { if (entry.completed) completedCount++; });

      let level = 0;
      if (completedCount >= 4) level = 4;
      else if (completedCount === 3) level = 3;
      else if (completedCount === 2) level = 2;
      else if (completedCount === 1) level = 1;

      const cell = document.createElement('div');
      cell.className = 'heatmap-cell';
      cell.setAttribute('data-level', level);
      cell.title = `${dateKey}: ${completedCount} Habits`;
      el.appendChild(cell);
    }
  }

  renderHabitsManagementPage() {
    const list = document.getElementById('allHabitsList');
    if (!list) return;

    list.innerHTML = '';

    if (this.data.habits.length === 0) {
      list.innerHTML = `
        <div style="text-align: center; padding: 40px; color: var(--text-muted);">
          <h3>No habits created yet!</h3>
          <p style="margin-top: 6px;">Click <b>"➕ Create New Habit"</b> above to add your first habit.</p>
        </div>
      `;
      return;
    }

    this.data.habits.forEach(h => {
      const item = document.createElement('div');
      item.className = 'insight-item';
      item.style.justifyContent = 'space-between';
      item.style.alignItems = 'center';

      item.innerHTML = `
        <div style="display:flex; align-items:center; gap:14px;">
          <div style="font-size:1.8rem;">${h.icon}</div>
          <div>
            <div style="font-weight:700; font-size:1.05rem;">${h.name}</div>
            <div style="font-size:0.8rem; color:var(--text-muted);">${h.category} • ${h.timeOfDay} ${h.reminderTime ? '• ⏰ ' + h.reminderTime : ''} • Target: ${h.targetValue} ${h.unit}</div>
          </div>
        </div>
        <div style="display:flex; gap:8px;">
          <button class="btn-secondary edit-h-btn" data-id="${h.id}" style="padding:6px 12px; font-size:0.8rem;">✏️ Edit</button>
          <button class="btn-secondary del-h-btn" data-id="${h.id}" style="padding:6px 12px; font-size:0.8rem; color:#ef4444; border-color:rgba(239,68,68,0.3);">🗑️ Delete</button>
        </div>
      `;

      item.querySelector('.edit-h-btn').addEventListener('click', () => this.openAddEditModal(h));
      item.querySelector('.del-h-btn').addEventListener('click', () => {
        if (confirm(`Delete habit "${h.name}"?`)) {
          this.data.habits = this.data.habits.filter(x => x.id !== h.id);
          saveAppData(this.data);
          soundFx.playClick();
          this.renderAll();
        }
      });

      list.appendChild(item);
    });
  }

  renderFocusChamberPage() {
    const timerText = document.getElementById('chamberTimerClock');
    if (!timerText) return;

    const mins = Math.floor(this.pomodoro.secondsLeft / 60);
    const secs = this.pomodoro.secondsLeft % 60;
    timerText.innerText = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  renderJournalTimelinePage() {
    const list = document.getElementById('journalTimelineList');
    if (!list) return;

    list.innerHTML = '';
    const sortedDates = Object.keys(this.data.moods).sort().reverse();

    if (sortedDates.length === 0) {
      list.innerHTML = `<div style="color: var(--text-muted); font-size: 0.9rem; padding: 20px 0;">No journal entries recorded yet.</div>`;
      return;
    }

    sortedDates.forEach(dateKey => {
      const entry = this.data.moods[dateKey];
      if (!entry.note && !entry.mood) return;

      const item = document.createElement('div');
      item.className = 'insight-item';
      item.style.flexDirection = 'column';
      item.style.alignItems = 'flex-start';

      item.innerHTML = `
        <div style="display:flex; justify-content:space-between; width:100%; font-weight:700; margin-bottom:6px;">
          <span>${dateKey}</span>
          <span>${entry.mood ? 'Mood: ' + entry.mood : ''}</span>
        </div>
        <p style="font-size:0.9rem; color:var(--text-muted); line-height:1.4;">${entry.note || 'No text entry.'}</p>
      `;

      list.appendChild(item);
    });
  }

  renderLeaderboardPage() {
    const list = document.getElementById('leaderboardMembersList');
    if (!list) return;

    list.innerHTML = `
      <div class="insight-item" style="justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="font-size: 1.8rem;">🥇</div>
          <div>
            <div style="font-weight: 700; font-size: 1.05rem;">${this.data.user.name || 'Achiever'} <span style="font-size: 0.75rem; background: var(--primary); color: #fff; padding: 2px 8px; border-radius: 10px;">YOU</span></div>
            <div style="font-size: 0.8rem; color: var(--text-muted);">Sync Room: ${getSyncRoomId()} • ${this.data.user.xp} XP</div>
          </div>
        </div>
        <div style="font-weight: 800; font-size: 1.2rem; color: var(--accent-amber);">LVL ${calculateLevel(this.data.user.xp).level}</div>
      </div>
    `;
  }

  renderProfilePage() {
    const badgesGrid = document.getElementById('profileBadgesGrid');
    if (!badgesGrid) return;

    badgesGrid.innerHTML = '';

    BADGES_LIST.forEach(b => {
      const isUnlocked = this.data.unlockedBadges.includes(b.id);
      const card = document.createElement('div');
      card.className = `badge-card ${isUnlocked ? 'unlocked' : ''}`;
      card.innerHTML = `
        <div class="badge-icon">${b.icon}</div>
        <div>
          <div class="badge-title">${b.title}</div>
          <div class="badge-desc">${b.desc}</div>
        </div>
      `;
      badgesGrid.appendChild(card);
    });
  }

  openAddEditModal(habitToEdit = null) {
    this.editingHabitId = habitToEdit ? habitToEdit.id : null;
    const modal = document.getElementById('addHabitModal');
    if (!modal) return;

    const titleEl = modal.querySelector('.modal-title');
    if (titleEl) titleEl.innerText = habitToEdit ? 'Edit Habit' : 'Create New Habit';

    document.getElementById('habitNameInput').value = habitToEdit ? habitToEdit.name : '';
    document.getElementById('habitDescInput').value = habitToEdit ? habitToEdit.description : '';
    document.getElementById('habitCategorySelect').value = habitToEdit ? habitToEdit.category : 'Health';
    document.getElementById('habitIconInput').value = habitToEdit ? habitToEdit.icon : '✨';
    document.getElementById('habitTypeSelect').value = habitToEdit ? habitToEdit.type : 'boolean';
    document.getElementById('habitTimeOfDaySelect').value = habitToEdit ? habitToEdit.timeOfDay : 'Morning';
    document.getElementById('habitReminderTimeInput').value = habitToEdit ? (habitToEdit.reminderTime || '') : '';
    document.getElementById('habitTargetInput').value = habitToEdit ? habitToEdit.targetValue : 1;
    document.getElementById('habitUnitInput').value = habitToEdit ? habitToEdit.unit : 'times';
    document.getElementById('habitDifficultySelect').value = habitToEdit ? habitToEdit.difficulty : 'Easy';

    modal.classList.add('active');
  }

  saveHabitFromForm() {
    const name = document.getElementById('habitNameInput').value.trim();
    if (!name) return;

    const desc = document.getElementById('habitDescInput').value.trim();
    const category = document.getElementById('habitCategorySelect').value;
    const icon = document.getElementById('habitIconInput').value.trim() || '✨';
    const type = document.getElementById('habitTypeSelect').value;
    const timeOfDay = document.getElementById('habitTimeOfDaySelect').value;
    const reminderTime = document.getElementById('habitReminderTimeInput').value;
    const targetValue = parseInt(document.getElementById('habitTargetInput').value) || 1;
    const unit = document.getElementById('habitUnitInput').value.trim() || 'times';
    const difficulty = document.getElementById('habitDifficultySelect').value;

    let xpValue = 10;
    if (difficulty === 'Medium') xpValue = 25;
    else if (difficulty === 'Hard') xpValue = 50;

    if (this.editingHabitId) {
      const idx = this.data.habits.findIndex(h => h.id === this.editingHabitId);
      if (idx !== -1) {
        this.data.habits[idx] = {
          ...this.data.habits[idx],
          name, description: desc, category, icon, type, timeOfDay, reminderTime, targetValue, unit, difficulty, xpValue
        };
      }
    } else {
      const newHabit = {
        id: `h_${Date.now()}`,
        name, description: desc, category, icon, type, timeOfDay, reminderTime, targetValue, unit, difficulty, xpValue,
        archived: false,
        createdAt: new Date().toISOString()
      };
      this.data.habits.push(newHabit);
    }

    saveAppData(this.data);
    soundFx.playSuccess();
    document.getElementById('addHabitModal')?.classList.remove('active');
    this.renderAll();
  }

  bindEvents() {
    document.getElementById('headerThemeToggleBtn')?.addEventListener('click', () => {
      const currentTheme = this.data.user.theme || 'light';
      const newTheme = (currentTheme === 'light') ? 'obsidian' : 'light';
      this.data.user.theme = newTheme;
      document.documentElement.setAttribute('data-theme', newTheme);
      saveAppData(this.data);
      soundFx.playClick();
      this.renderHeader();
    });

    document.getElementById('enableNotificationsBtn')?.addEventListener('click', () => {
      if ("Notification" in window) {
        Notification.requestPermission().then(permission => {
          if (permission === "granted") {
            alert('🔔 Push Notifications Enabled! You will receive daily habit reminder alarms.');
          } else {
            alert('Notification permission denied or blocked.');
          }
        });
      } else {
        alert('Web Notifications not supported in this browser environment.');
      }
    });

    document.getElementById('voiceRecordBtn')?.addEventListener('click', () => {
      const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRec) {
        alert('Voice speech recognition not supported in your browser.');
        return;
      }
      const rec = new SpeechRec();
      rec.onstart = () => alert('🎙️ Listening... Speak your reflection now!');
      rec.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        const area = document.getElementById('journalNoteArea');
        if (area) {
          area.value += (area.value ? ' ' : '') + transcript;
          this.saveMoodAndNote();
        }
      };
      rec.start();
    });

    document.getElementById('soundToggleBtn')?.addEventListener('click', () => {
      this.data.user.soundEnabled = !this.data.user.soundEnabled;
      soundFx.setEnabled(this.data.user.soundEnabled);
      saveAppData(this.data);
      this.renderHeader();
    });

    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.activeFilter = e.target.dataset.filter;
        soundFx.playClick();
        this.renderHabits();
      });
    });

    document.querySelectorAll('.mood-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mood = e.currentTarget.dataset.mood;
        this.saveMoodAndNote(mood);
        this.renderMoodSection();
      });
    });

    document.getElementById('journalNoteArea')?.addEventListener('blur', () => {
      this.saveMoodAndNote();
    });

    document.getElementById('addHabitBtn')?.addEventListener('click', () => {
      soundFx.playClick();
      this.openAddEditModal();
    });

    document.getElementById('manageAddHabitBtn')?.addEventListener('click', () => {
      soundFx.playClick();
      this.openAddEditModal();
    });

    document.getElementById('saveHabitSubmitBtn')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.saveHabitFromForm();
    });

    document.getElementById('exportCsvBtn')?.addEventListener('click', () => {
      let csv = 'Date,Habit ID,Habit Name,Completed,Value\n';
      Object.keys(this.data.logs).forEach(dateKey => {
        const day = this.data.logs[dateKey];
        Object.keys(day).forEach(hid => {
          const h = this.data.habits.find(x => x.id === hid);
          const entry = day[hid];
          csv += `"${dateKey}","${hid}","${h ? h.name : hid}",${entry.completed},${entry.value}\n`;
        });
      });
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `AuraHabit_Logs_${getFormattedDateKey()}.csv`;
      a.click();
    });

    document.getElementById('exportPdfBtn')?.addEventListener('click', () => {
      window.print();
    });

    document.querySelectorAll('.redeem-shop-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const cost = parseInt(e.target.dataset.cost);
        const reward = e.target.dataset.reward;
        if (this.data.user.xp >= cost) {
          this.data.user.xp -= cost;
          if (!this.data.user.titles) this.data.user.titles = [];
          this.data.user.titles.push(reward);
          saveAppData(this.data);
          soundFx.playSuccess();
          triggerConfettiBurst();
          alert(`🎉 Redeemed "${reward}" title for ${cost} XP!`);
          this.renderHeader();
        } else {
          alert(`Not enough XP! You need ${cost} XP to redeem this title.`);
        }
      });
    });

    // Check for App & Code Updates Handlers
    const handleUpdateCheck = () => {
      soundFx.playSuccess();
      triggerConfettiBurst();
      alert('⚡ Checking for latest live updates... App will refresh with the newest features!');
      window.location.reload(true);
    };

    document.getElementById('checkForUpdatesBtn')?.addEventListener('click', handleUpdateCheck);
    document.getElementById('profileCheckUpdatesBtn')?.addEventListener('click', handleUpdateCheck);

    document.getElementById('joinSyncRoomBtn')?.addEventListener('click', () => {
      const roomInput = document.getElementById('syncRoomCodeInput');
      if (roomInput && roomInput.value.trim()) {
        const code = roomInput.value.trim().toUpperCase();
        setSyncRoomId(code);
        this.data.user.syncRoom = code;
        saveAppData(this.data);
        soundFx.playSuccess();
        alert(`Connected to Sync Room ${code}! Real-time synchronization active.`);
        this.renderHeader();
      }
    });

    document.querySelectorAll('.theme-option-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.applyTheme(e.target.dataset.theme);
      });
    });

    document.getElementById('exportDataBtn')?.addEventListener('click', () => {
      const jsonStr = JSON.stringify(this.data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `AuraHabit_Backup_${getFormattedDateKey()}.json`;
      a.click();
    });

    document.getElementById('importDataInput')?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const imported = JSON.parse(evt.target.result);
          this.data = imported;
          saveAppData(this.data);
          soundFx.playSuccess();
          alert('Data imported successfully!');
          this.renderAll();
        } catch (err) {
          alert('Invalid JSON backup file.');
        }
      };
      reader.readAsText(file);
    });

    document.querySelectorAll('.close-modal-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal-overlay');
        if (modal) modal.classList.remove('active');
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.auraApp = new AppController();
});
