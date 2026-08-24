/**
 * AuraHabit - Master Application Controller & Router with Real-Time Multi-Device Sync
 */

import {
  loadAppData,
  saveAppData,
  getFormattedDateKey,
  calculateLevel,
  calculateHabitStreak,
  subscribeLiveSync,
  getSyncRoomId,
  setSyncRoomId,
  PRESET_TEMPLATES,
  BADGES_LIST,
  CATEGORIES
} from './storage.js';

import { soundFx } from './audio.js';
import { triggerConfettiBurst, showXPToast } from './effects.js';

class AppController {
  constructor() {
    this.data = loadAppData();
    this.selectedDate = new Date();
    this.activeFilter = 'all';
    this.currentView = 'dashboard';
    
    this.pomodoro = {
      interval: null,
      secondsLeft: 25 * 60,
      totalSeconds: 25 * 60,
      isRunning: false,
      mode: 'work'
    };

    this.initUI();
  }

  initUI() {
    this.applyTheme(this.data.user.theme || 'obsidian');
    soundFx.setEnabled(this.data.user.soundEnabled !== false);

    this.bindNavigationRouter();
    this.bindEvents();
    
    // Subscribe to Real-Time Cross-Device Sync
    subscribeLiveSync((newData) => {
      this.data = newData;
      this.showLiveSyncBadge();
      this.renderAll();
    });

    const initialHash = window.location.hash.replace('#', '') || 'dashboard';
    this.switchView(initialHash);
  }

  showLiveSyncBadge() {
    const badge = document.getElementById('liveSyncBadge');
    if (badge) {
      badge.style.display = 'inline-flex';
      badge.classList.add('pulse');
      setTimeout(() => badge.classList.remove('pulse'), 1500);
    }
  }

  bindNavigationRouter() {
    const navButtons = document.querySelectorAll('.nav-tab-btn');
    navButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetView = e.currentTarget.dataset.view;
        window.location.hash = targetView;
      });
    });

    window.addEventListener('hashchange', () => {
      const targetView = window.location.hash.replace('#', '') || 'dashboard';
      this.switchView(targetView);
    });
  }

  switchView(viewId) {
    this.currentView = viewId;
    soundFx.playClick();

    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
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

    const soundBtn = document.getElementById('soundToggleBtn');
    if (soundBtn) soundBtn.innerText = this.data.user.soundEnabled ? '🔊' : '🔇';

    const syncRoomEl = document.getElementById('syncRoomCodeDisplay');
    if (syncRoomEl) syncRoomEl.innerText = getSyncRoomId();
  }

  renderHeroStats() {
    const dateKey = getFormattedDateKey(this.selectedDate);
    const dayLogs = this.data.logs[dateKey] || {};
    const activeHabits = this.data.habits.filter(h => !h.archived);

    if (activeHabits.length === 0) return;

    let completedCount = 0;
    activeHabits.forEach(h => {
      if (dayLogs[h.id] && dayLogs[h.id].completed) completedCount++;
    });

    const percentage = Math.round((completedCount / activeHabits.length) * 100);

    const ringPercentageEl = document.getElementById('heroRingPercentage');
    if (ringPercentageEl) ringPercentageEl.innerText = `${percentage}%`;

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

      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.getDate();

      const btn = document.createElement('button');
      btn.className = `week-day-btn ${dateKey === getFormattedDateKey(this.selectedDate) ? 'active' : ''}`;

      const dayLog = this.data.logs[dateKey] || {};
      const activeHabits = this.data.habits.filter(h => !h.archived);
      const allDone = activeHabits.length > 0 && activeHabits.every(h => dayLog[h.id] && dayLog[h.id].completed);

      if (allDone) btn.classList.add('completed-all');

      btn.innerHTML = `
        <span class="week-day-name">${dayName}</span>
        <span class="week-day-num">${dayNum}</span>
        <div class="week-dot-indicator"></div>
      `;

      btn.addEventListener('click', () => {
        soundFx.playClick();
        this.selectedDate = d;
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
          <div style="font-size: 3rem; margin-bottom: 12px;">🌟</div>
          <h3>No habits found for this filter</h3>
          <p style="font-size: 0.9rem; margin-top: 6px;">Click <b>"+ Add Custom Habit"</b> or <b>"✨ Presets"</b> to build your routine.</p>
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
            <div class="habit-icon-badge" style="border-left: 3px solid ${habit.color}">${habit.icon}</div>
            <div>
              <div class="habit-name">${habit.name}</div>
              <div class="habit-category-tag">
                <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${habit.color}"></span>
                ${habit.category} • ${habit.timeOfDay}
              </div>
            </div>
          </div>
          <button class="icon-btn edit-habit-btn" data-id="${habit.id}" style="width:30px; height:30px; font-size:0.8rem;">✏️</button>
        </div>

        <div class="habit-card-body">
          <div class="habit-desc">${habit.description || ''}</div>
          <div class="habit-meta-row">
            <div class="habit-meta-pill streak-pill">🔥 ${streakData.currentStreak} Streak</div>
            <div class="habit-meta-pill">+${habit.xpValue} XP (${habit.difficulty})</div>
          </div>
        </div>

        <div class="habit-card-footer">
          <div>${bodyControlsHTML}</div>
          <button class="check-toggle-btn" data-id="${habit.id}">✓</button>
        </div>
      `;

      card.querySelector('.check-toggle-btn').addEventListener('click', (e) => {
        this.toggleHabitCompletion(habit.id, e.target);
      });

      const stepPlus = card.querySelector('.step-plus');
      if (stepPlus) stepPlus.addEventListener('click', () => this.adjustNumericHabit(habit.id, 1));

      const stepMinus = card.querySelector('.step-minus');
      if (stepMinus) stepMinus.addEventListener('click', () => this.adjustNumericHabit(habit.id, -1));

      const timerBtn = card.querySelector('.timer-quick-btn');
      if (timerBtn) {
        timerBtn.addEventListener('click', () => {
          this.switchView('timer');
        });
      }

      const editBtn = card.querySelector('.edit-habit-btn');
      if (editBtn) editBtn.addEventListener('click', () => this.openAddEditModal(habit));

      habitsGrid.appendChild(card);
    });
  }

  toggleHabitCompletion(habitId, targetEl) {
    const dateKey = getFormattedDateKey(this.selectedDate);
    if (!this.data.logs[dateKey]) this.data.logs[dateKey] = {};

    const habit = this.data.habits.find(h => h.id === habitId);
    if (!habit) return;

    const currentStatus = this.data.logs[dateKey][habitId] ? this.data.logs[dateKey][habitId].completed : false;
    const newStatus = !currentStatus;

    this.data.logs[dateKey][habitId] = {
      completed: newStatus,
      value: newStatus ? (habit.targetValue || 1) : 0,
      timestamp: new Date().toISOString()
    };

    if (newStatus) {
      soundFx.playSuccess();
      triggerConfettiBurst(window.innerWidth / 2, window.innerHeight / 2);
      
      const xpGained = habit.xpValue || 15;
      this.data.user.xp += xpGained;
      showXPToast(xpGained, targetEl);

      this.checkBadgesUnlock();
    } else {
      soundFx.playClick();
      this.data.user.xp = Math.max(0, this.data.user.xp - (habit.xpValue || 15));
    }

    saveAppData(this.data);
    this.renderAll();
  }

  adjustNumericHabit(habitId, delta) {
    const dateKey = getFormattedDateKey(this.selectedDate);
    if (!this.data.logs[dateKey]) this.data.logs[dateKey] = {};

    const habit = this.data.habits.find(h => h.id === habitId);
    if (!habit) return;

    const currentVal = this.data.logs[dateKey][habitId] ? (this.data.logs[dateKey][habitId].value || 0) : 0;
    const newVal = Math.max(0, currentVal + delta);
    const isDone = newVal >= habit.targetValue;

    this.data.logs[dateKey][habitId] = {
      completed: isDone,
      value: newVal,
      timestamp: new Date().toISOString()
    };

    soundFx.playClick();
    if (isDone && !currentVal) {
      soundFx.playSuccess();
      triggerConfettiBurst();
      this.data.user.xp += habit.xpValue || 15;
    }

    saveAppData(this.data);
    this.renderAll();
  }

  renderMoodSection() {
    const dateKey = getFormattedDateKey(this.selectedDate);
    const moodEntry = this.data.moods[dateKey] || { mood: '', note: '' };

    const moodBtns = document.querySelectorAll('.mood-btn');
    moodBtns.forEach(btn => {
      if (btn.dataset.mood === moodEntry.mood) btn.classList.add('active');
      else btn.classList.remove('active');
    });

    const noteArea = document.getElementById('journalNoteArea');
    if (noteArea) noteArea.value = moodEntry.note || '';
  }

  saveMoodAndNote(selectedMood) {
    const dateKey = getFormattedDateKey(this.selectedDate);
    const noteArea = document.getElementById('journalNoteArea');
    const noteText = noteArea ? noteArea.value : '';

    this.data.moods[dateKey] = {
      mood: selectedMood || (this.data.moods[dateKey] ? this.data.moods[dateKey].mood : 'happy'),
      note: noteText,
      updatedAt: new Date().toISOString()
    };

    saveAppData(this.data);
    soundFx.playClick();
    this.checkBadgesUnlock();
  }

  renderInsights() {
    const container = document.getElementById('insightsList');
    if (!container) return;

    let totalCompletions = 0;
    Object.keys(this.data.logs).forEach(dateKey => {
      Object.values(this.data.logs[dateKey]).forEach(entry => {
        if (entry.completed) totalCompletions++;
      });
    });

    container.innerHTML = `
      <div class="insight-item">
        <div class="insight-icon">🔥</div>
        <div class="insight-text">
          <b>Consistency Record:</b> You have logged a total of <b>${totalCompletions} habit completions</b>!
        </div>
      </div>
      <div class="insight-item">
        <div class="insight-icon">💡</div>
        <div class="insight-text">
          <b>Peak Time Recommendation:</b> Your highest completion rates occur during <b>Morning routines</b>. Keep momentum strong early!
        </div>
      </div>
    `;
  }

  renderAnalyticsPage() {
    const container = document.getElementById('analyticsPageContent');
    if (!container) return;

    let totalCompletions = 0;
    Object.keys(this.data.logs).forEach(dk => {
      Object.values(this.data.logs[dk]).forEach(e => {
        if (e.completed) totalCompletions++;
      });
    });

    const categoryStats = {};
    CATEGORIES.forEach(c => categoryStats[c.id] = 0);
    this.data.habits.forEach(h => {
      Object.keys(this.data.logs).forEach(dk => {
        if (this.data.logs[dk][h.id] && this.data.logs[dk][h.id].completed) {
          categoryStats[h.category] = (categoryStats[h.category] || 0) + 1;
        }
      });
    });

    let catBarsHTML = '';
    CATEGORIES.forEach(c => {
      const count = categoryStats[c.id] || 0;
      const pct = Math.min(100, Math.round((count / Math.max(1, totalCompletions)) * 100));
      catBarsHTML += `
        <div style="margin-bottom: 14px;">
          <div style="display:flex; justify-content:space-between; font-size:0.88rem; margin-bottom:4px;">
            <span>${c.icon} ${c.name}</span>
            <span style="font-weight:700;">${count} (${pct}%)</span>
          </div>
          <div style="height:8px; background:rgba(255,255,255,0.06); border-radius:10px; overflow:hidden;">
            <div style="height:100%; width:${pct}%; background:${c.color}; border-radius:10px;"></div>
          </div>
        </div>
      `;
    });

    container.innerHTML = `
      <div class="analytics-section">
        <h3 class="section-title" style="margin-bottom:16px;">📈 Overall Consistency & Stats Summary</h3>
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:16px; margin-bottom:24px;">
          <div style="background:rgba(255,255,255,0.03); padding:16px; border-radius:14px; text-align:center;">
            <div style="font-size:2rem; font-weight:800; color:var(--primary);">${totalCompletions}</div>
            <div style="font-size:0.8rem; color:var(--text-muted);">TOTAL LOGGED HABITS</div>
          </div>
          <div style="background:rgba(255,255,255,0.03); padding:16px; border-radius:14px; text-align:center;">
            <div style="font-size:2rem; font-weight:800; color:var(--accent-emerald);">${this.data.habits.length}</div>
            <div style="font-size:0.8rem; color:var(--text-muted);">ACTIVE HABITS</div>
          </div>
          <div style="background:rgba(255,255,255,0.03); padding:16px; border-radius:14px; text-align:center;">
            <div style="font-size:2rem; font-weight:800; color:var(--accent-amber);">${this.data.unlockedBadges.length}</div>
            <div style="font-size:0.8rem; color:var(--text-muted);">UNLOCKED BADGES</div>
          </div>
        </div>

        <h4 style="margin-bottom:12px; font-size:1.1rem;">Category Completion Breakdown</h4>
        ${catBarsHTML}
      </div>

      <div class="analytics-section">
        <h3 class="section-title" style="margin-bottom:16px;">📊 28-Day Consistency Heatmap Grid</h3>
        <div class="heatmap-container" id="pageActivityHeatmap"></div>
      </div>
    `;

    this.renderHeatmapGrid('pageActivityHeatmap');
  }

  renderHeatmapGrid(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.innerHTML = '';

    const today = new Date();
    for (let i = 27; i >= 0; i--) {
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
            <div style="font-size:0.8rem; color:var(--text-muted);">${h.category} • ${h.timeOfDay} • Target: ${h.targetValue} ${h.unit}</div>
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

  togglePomodoro() {
    const btn = document.getElementById('chamberStartBtn');
    if (this.pomodoro.isRunning) {
      clearInterval(this.pomodoro.interval);
      this.pomodoro.isRunning = false;
      if (btn) btn.innerText = '▶️ Resume Focus';
      soundFx.stopAmbient();
    } else {
      this.pomodoro.isRunning = true;
      if (btn) btn.innerText = '⏸️ Pause';

      if (this.data.user.ambientSound && this.data.user.ambientSound !== 'off') {
        soundFx.startAmbient(this.data.user.ambientSound);
      }

      this.pomodoro.interval = setInterval(() => {
        if (this.pomodoro.secondsLeft > 0) {
          this.pomodoro.secondsLeft--;
          this.renderFocusChamberPage();
        } else {
          clearInterval(this.pomodoro.interval);
          this.pomodoro.isRunning = false;
          soundFx.stopAmbient();
          soundFx.playTimerAlarm();
          triggerConfettiBurst();

          this.data.user.xp += 30;
          this.data.focusSessions.push({
            date: getFormattedDateKey(),
            minutes: Math.round(this.pomodoro.totalSeconds / 60),
            habitName: 'Focus Session'
          });
          saveAppData(this.data);
          this.renderAll();
        }
      }, 1000);
    }
  }

  setPomodoroTime(minutes) {
    clearInterval(this.pomodoro.interval);
    this.pomodoro.isRunning = false;
    soundFx.stopAmbient();
    this.pomodoro.totalSeconds = minutes * 60;
    this.pomodoro.secondsLeft = this.pomodoro.totalSeconds;
    const btn = document.getElementById('chamberStartBtn');
    if (btn) btn.innerText = '▶️ Start Focus';
    this.renderFocusChamberPage();
  }

  renderJournalTimelinePage() {
    const timeline = document.getElementById('journalTimelineList');
    if (!timeline) return;

    timeline.innerHTML = '';
    const moodKeys = Object.keys(this.data.moods).sort().reverse();

    if (moodKeys.length === 0) {
      timeline.innerHTML = '<div style="color:var(--text-muted); padding:20px;">No journal entries logged yet. Log your daily thoughts on the Dashboard!</div>';
      return;
    }

    moodKeys.forEach(dateKey => {
      const entry = this.data.moods[dateKey];
      const moodEmojis = { energized: '⚡', happy: '😊', calm: '🧘', neutral: '😐', low: '🌧️' };

      const card = document.createElement('div');
      card.className = 'insight-item';
      card.style.flexDirection = 'column';
      card.style.alignItems = 'flex-start';
      card.style.marginBottom = '16px';

      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; width:100%; margin-bottom:6px;">
          <div style="font-weight:700; font-size:1rem; color:var(--primary);">
            ${moodEmojis[entry.mood] || '📝'} ${dateKey}
          </div>
          <span style="font-size:0.8rem; color:var(--text-muted); text-transform:capitalize;">Mood: ${entry.mood}</span>
        </div>
        <div style="font-size:0.92rem; color:var(--text-main); line-height:1.4;">
          ${entry.note || '<i>No notes recorded for this date.</i>'}
        </div>
      `;

      timeline.appendChild(card);
    });
  }

  renderProfilePage() {
    const nameInput = document.getElementById('profileUsernameInput');
    if (nameInput) nameInput.value = this.data.user.name || '';

    const syncRoomInput = document.getElementById('syncRoomCodeInput');
    if (syncRoomInput) syncRoomInput.value = getSyncRoomId();

    const badgesGrid = document.getElementById('profileBadgesGrid');
    if (badgesGrid) {
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
  }

  checkBadgesUnlock() {
    let unlockedAny = false;
    let totalCompletions = 0;
    Object.keys(this.data.logs).forEach(dk => {
      Object.values(this.data.logs[dk]).forEach(e => {
        if (e.completed) totalCompletions++;
      });
    });

    if (totalCompletions >= 1 && !this.data.unlockedBadges.includes('first_step')) {
      this.data.unlockedBadges.push('first_step');
      unlockedAny = true;
    }

    if (unlockedAny) {
      soundFx.playBadgeUnlock();
      triggerConfettiBurst();
      saveAppData(this.data);
    }
  }

  openAddEditModal(habitToEdit = null) {
    const modal = document.getElementById('addHabitModal');
    const form = document.getElementById('addHabitForm');
    form.reset();

    if (habitToEdit) {
      form.dataset.editId = habitToEdit.id;
      document.getElementById('habitNameInput').value = habitToEdit.name;
      document.getElementById('habitDescInput').value = habitToEdit.description || '';
      document.getElementById('habitCategorySelect').value = habitToEdit.category;
      document.getElementById('habitIconInput').value = habitToEdit.icon;
      document.getElementById('habitTypeSelect').value = habitToEdit.type;
      document.getElementById('habitTargetInput').value = habitToEdit.targetValue;
      document.getElementById('habitUnitInput').value = habitToEdit.unit;
      document.getElementById('habitTimeOfDaySelect').value = habitToEdit.timeOfDay;
      document.getElementById('habitDifficultySelect').value = habitToEdit.difficulty || 'Medium';
    } else {
      delete form.dataset.editId;
    }

    modal.classList.add('active');
  }

  saveHabitFromForm() {
    const form = document.getElementById('addHabitForm');
    const editId = form.dataset.editId;

    const name = document.getElementById('habitNameInput').value.trim();
    if (!name) return;

    const category = document.getElementById('habitCategorySelect').value;
    const difficulty = document.getElementById('habitDifficultySelect').value;
    const xpMap = { Easy: 10, Medium: 25, Hard: 50 };

    const habitObj = {
      id: editId || `h_${Date.now()}`,
      name,
      description: document.getElementById('habitDescInput').value.trim(),
      category,
      icon: document.getElementById('habitIconInput').value.trim() || '✨',
      color: category === 'Health' ? '#06b6d4' : category === 'Fitness' ? '#10b981' : category === 'Mindfulness' ? '#8b5cf6' : '#f59e0b',
      type: document.getElementById('habitTypeSelect').value,
      targetValue: parseInt(document.getElementById('habitTargetInput').value) || 1,
      unit: document.getElementById('habitUnitInput').value.trim() || 'times',
      timeOfDay: document.getElementById('habitTimeOfDaySelect').value,
      difficulty,
      xpValue: xpMap[difficulty] || 25,
      archived: false,
      createdAt: new Date().toISOString()
    };

    if (editId) {
      const index = this.data.habits.findIndex(h => h.id === editId);
      if (index !== -1) this.data.habits[index] = habitObj;
    } else {
      this.data.habits.push(habitObj);
    }

    saveAppData(this.data);
    soundFx.playClick();
    document.getElementById('addHabitModal').classList.remove('active');
    this.renderAll();
  }

  openPresetModal() {
    const modal = document.getElementById('presetModal');
    const list = document.getElementById('presetListContainer');
    list.innerHTML = '';

    PRESET_TEMPLATES.forEach(p => {
      const box = document.createElement('div');
      box.className = 'insight-item';
      box.style.cursor = 'pointer';
      box.style.marginBottom = '14px';

      box.innerHTML = `
        <div style="flex:1;">
          <div style="font-weight:700; font-size:1.05rem; margin-bottom:4px;">${p.title}</div>
          <div style="font-size:0.85rem; color:var(--text-muted); margin-bottom:8px;">${p.description}</div>
          <div style="font-size:0.8rem; color:var(--accent-cyan); font-weight:600;">+ ${p.habits.length} Habits Bundle</div>
        </div>
        <button class="btn-primary" style="padding:6px 14px; font-size:0.8rem;">Apply</button>
      `;

      box.addEventListener('click', () => {
        p.habits.forEach(h => {
          this.data.habits.push({
            id: `h_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            description: '',
            targetValue: h.targetValue || 1,
            unit: h.unit || 'check',
            archived: false,
            createdAt: new Date().toISOString(),
            ...h
          });
        });

        saveAppData(this.data);
        soundFx.playSuccess();
        triggerConfettiBurst();
        modal.classList.remove('active');
        this.renderAll();
      });

      list.appendChild(box);
    });

    modal.classList.add('active');
  }

  applyTheme(themeName) {
    document.documentElement.setAttribute('data-theme', themeName);
    this.data.user.theme = themeName;
    saveAppData(this.data);
  }

  generateShareCard() {
    const modal = document.getElementById('shareModal');
    const previewContainer = document.getElementById('sharePreviewBox');
    previewContainer.innerHTML = '';

    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 380;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 600, 380);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 600, 380);

    ctx.fillStyle = 'rgba(99, 102, 241, 0.15)';
    ctx.beginPath();
    ctx.arc(500, 80, 150, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 28px Outfit, sans-serif';
    ctx.fillText('⚡ AuraHabit Daily Digest', 40, 60);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '16px Inter, sans-serif';
    ctx.fillText(`Achiever: ${this.data.user.name || 'User'} • Level ${calculateLevel(this.data.user.xp).level}`, 40, 95);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(40, 130, 520, 170, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#6366f1';
    ctx.font = 'bold 36px Outfit, sans-serif';
    ctx.fillText(`${this.data.user.xp}`, 80, 190);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px Inter, sans-serif';
    ctx.fillText('TOTAL XP EARNED', 80, 220);

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 36px Outfit, sans-serif';
    ctx.fillText(`🔥 Active`, 260, 190);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px Inter, sans-serif';
    ctx.fillText('CONSISTENCY MODE', 260, 220);

    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 36px Outfit, sans-serif';
    ctx.fillText(`${this.data.unlockedBadges.length}`, 440, 190);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px Inter, sans-serif';
    ctx.fillText('BADGES UNLOCKED', 440, 220);

    ctx.fillStyle = '#64748b';
    ctx.font = 'italic 14px Inter, sans-serif';
    ctx.fillText('Tracked with AuraHabit • Daily Habit Mastery', 40, 340);

    const img = document.createElement('img');
    img.src = canvas.toDataURL('image/png');
    img.style.width = '100%';
    img.style.borderRadius = '14px';
    previewContainer.appendChild(img);

    const downloadBtn = document.getElementById('downloadShareCardBtn');
    if (downloadBtn) {
      downloadBtn.onclick = () => {
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/png');
        a.download = `AuraHabit_Streak_Card_${getFormattedDateKey()}.png`;
        a.click();
      };
    }

    modal.classList.add('active');
  }

  bindEvents() {
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

    document.getElementById('saveHabitSubmitBtn')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.saveHabitFromForm();
    });

    document.getElementById('presetTemplatesBtn')?.addEventListener('click', () => {
      soundFx.playClick();
      this.openPresetModal();
    });

    document.getElementById('shareCardBtn')?.addEventListener('click', () => {
      soundFx.playClick();
      this.generateShareCard();
    });

    const handleUpdateCheck = () => {
      soundFx.playSuccess();
      triggerConfettiBurst();
      alert('⚡ Checking for latest live updates... App will refresh with the newest features!');
      window.location.reload(true);
    };

    document.getElementById('checkForUpdatesBtn')?.addEventListener('click', handleUpdateCheck);
    document.getElementById('profileCheckUpdatesBtn')?.addEventListener('click', handleUpdateCheck);

    // Pair Sync Room Code
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

    // Focus Chamber Buttons
    document.getElementById('chamberStartBtn')?.addEventListener('click', () => {
      soundFx.playClick();
      this.togglePomodoro();
    });

    document.querySelectorAll('.preset-timer-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mins = parseInt(e.target.dataset.mins);
        soundFx.playClick();
        this.setPomodoroTime(mins);
      });
    });

    document.getElementById('ambientSoundSelect')?.addEventListener('change', (e) => {
      this.data.user.ambientSound = e.target.value;
      saveAppData(this.data);
      if (this.pomodoro.isRunning) {
        if (e.target.value === 'off') soundFx.stopAmbient();
        else soundFx.startAmbient(e.target.value);
      }
    });

    // Profile Settings Handlers
    document.getElementById('saveProfileBtn')?.addEventListener('click', () => {
      const nameInput = document.getElementById('profileUsernameInput');
      if (nameInput) this.data.user.name = nameInput.value.trim() || 'Aura User';
      saveAppData(this.data);
      soundFx.playSuccess();
      alert('Profile updated successfully!');
      this.renderHeader();
    });

    document.querySelectorAll('.theme-option-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.applyTheme(e.target.dataset.theme);
      });
    });

    // Data Export & Import Handlers
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
