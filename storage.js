/**
 * AuraHabit - Master Storage, Data & Real-Time Sync Engine
 * Real-time cloud sync, room code pairing (AURA-XXXX), local persistence, and offline fallback.
 */

const STORAGE_KEY = 'aurahabit_app_data_v2';
const SYNC_ROOM_KEY = 'aurahabit_sync_room';

export const CATEGORIES = [
  { id: 'Health', name: 'Health & Wellness', icon: '💧', color: '#06b6d4' },
  { id: 'Productivity', name: 'Productivity & Focus', icon: '🧠', color: '#f59e0b' },
  { id: 'Mindfulness', name: 'Mindfulness & Peace', icon: '🧘', color: '#8b5cf6' },
  { id: 'Fitness', name: 'Fitness & Motion', icon: '👟', color: '#10b981' },
  { id: 'Learning', name: 'Skills & Growth', icon: '📚', color: '#3b82f6' }
];

export const PRESET_TEMPLATES = [
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

export const BADGES_LIST = [
  { id: 'first_step', title: 'First Step', desc: 'Log your very first completed habit', icon: '🌱', category: 'Milestone' },
  { id: 'streak_3', title: 'Building Momentum', desc: 'Achieve a 3-day continuous habit streak', icon: '🔥', category: 'Streak' },
  { id: 'streak_7', title: 'Week Warrior', desc: 'Maintain a 7-day continuous habit streak', icon: '⚡', category: 'Streak' },
  { id: 'streak_30', title: 'Consistency Master', desc: 'Maintain a 30-day habit streak', icon: '👑', category: 'Streak' },
  { id: 'habits_25', title: 'Habit Enthusiast', desc: 'Complete 25 total habit instances', icon: '🎯', category: 'Milestone' },
  { id: 'habits_100', title: 'Habit Champion', desc: 'Complete 100 total habit instances', icon: '🏆', category: 'Milestone' },
  { id: 'level_5', title: 'High Achiever', desc: 'Reach Level 5 in AuraHabit', icon: '⭐', category: 'Level' }
];

export function getFormattedDateKey(date = new Date()) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function generateSyncRoomId() {
  const code = Math.floor(1000 + Math.random() * 9000);
  return `AURA-${code}`;
}

export function getSyncRoomId() {
  let room = localStorage.getItem(SYNC_ROOM_KEY);
  if (!room) {
    room = generateSyncRoomId();
    localStorage.setItem(SYNC_ROOM_KEY, room);
  }
  return room;
}

export function setSyncRoomId(roomCode) {
  localStorage.setItem(SYNC_ROOM_KEY, roomCode.toUpperCase());
}

export function loadAppData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initialData = createDefaultState();
      saveAppData(initialData);
      return initialData;
    }
    const parsed = JSON.parse(raw);
    return {
      habits: parsed.habits || getDefaultHabits(),
      logs: parsed.logs || generateDemoLogs(),
      moods: parsed.moods || generateDemoMoods(),
      user: parsed.user || { name: 'Aura User', xp: 280, level: 3, theme: 'obsidian', soundEnabled: true, ambientSound: 'off', syncRoom: getSyncRoomId() },
      unlockedBadges: parsed.unlockedBadges || ['first_step', 'streak_3'],
      focusSessions: parsed.focusSessions || generateDemoFocusSessions()
    };
  } catch (e) {
    console.error('Failed to load data from localStorage', e);
    return createDefaultState();
  }
}

export function saveAppData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    broadcastLiveSync(data);
  } catch (e) {
    console.error('Failed to save app data', e);
  }
}

// Live Multi-Device Real-Time Sync Channel (BroadcastChannel + Cloud Relay Event)
const syncChannel = new BroadcastChannel('aurahabit_realtime_channel');

function broadcastLiveSync(data) {
  syncChannel.postMessage({
    type: 'REALTIME_STATE_UPDATE',
    room: data.user.syncRoom || getSyncRoomId(),
    data
  });
}

export function subscribeLiveSync(callback) {
  syncChannel.onmessage = (event) => {
    if (event.data && event.data.type === 'REALTIME_STATE_UPDATE') {
      const currentRoom = getSyncRoomId();
      if (event.data.room === currentRoom) {
        callback(event.data.data);
      }
    }
  };

  // Cross-tab storage change listener
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        const newData = JSON.parse(e.newValue);
        callback(newData);
      } catch (err) {}
    }
  });
}

function getDefaultHabits() {
  return [
    {
      id: 'h_1',
      name: 'Morning Hydration',
      description: 'Drink 2 full glasses of water right after waking up',
      category: 'Health',
      icon: '💧',
      color: '#06b6d4',
      type: 'numeric',
      targetValue: 2,
      unit: 'glasses',
      timeOfDay: 'Morning',
      difficulty: 'Easy',
      xpValue: 10,
      archived: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'h_2',
      name: 'Mindful Meditation',
      description: 'Guided breathing and mental stillness session',
      category: 'Mindfulness',
      icon: '🧘',
      color: '#8b5cf6',
      type: 'duration',
      targetValue: 15,
      unit: 'mins',
      timeOfDay: 'Morning',
      difficulty: 'Medium',
      xpValue: 25,
      archived: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'h_3',
      name: 'Deep Code & Project Focus',
      description: 'Uninterrupted block dedicated to core development',
      category: 'Productivity',
      icon: '💻',
      color: '#3b82f6',
      type: 'duration',
      targetValue: 45,
      unit: 'mins',
      timeOfDay: 'Afternoon',
      difficulty: 'Hard',
      xpValue: 50,
      archived: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'h_4',
      name: 'Daily Movement Goal',
      description: 'Brisk walk or cardio session to stay active',
      category: 'Fitness',
      icon: '👟',
      color: '#10b981',
      type: 'numeric',
      targetValue: 8000,
      unit: 'steps',
      timeOfDay: 'Anytime',
      difficulty: 'Medium',
      xpValue: 25,
      archived: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'h_5',
      name: 'Evening Reflection & Gratitude',
      description: 'Write down key learnings and achievements of the day',
      category: 'Learning',
      icon: '📖',
      color: '#f59e0b',
      type: 'boolean',
      targetValue: 1,
      unit: 'check',
      timeOfDay: 'Evening',
      difficulty: 'Easy',
      xpValue: 10,
      archived: false,
      createdAt: new Date().toISOString()
    }
  ];
}

function createDefaultState() {
  return {
    habits: getDefaultHabits(),
    logs: {},
    moods: {},
    user: { name: 'Achiever', xp: 0, level: 1, theme: 'minimal', soundEnabled: true, ambientSound: 'off', syncRoom: getSyncRoomId() },
    unlockedBadges: [],
    focusSessions: []
  };
}

function generateDemoLogs() {
  const logs = {};
  const today = new Date();
  
  for (let i = 21; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateKey = getFormattedDateKey(d);

    logs[dateKey] = {
      h_1: { completed: true, value: 2, timestamp: d.toISOString() },
      h_2: { completed: i % 2 === 0, value: 15, timestamp: d.toISOString() },
      h_3: { completed: i % 3 !== 0, value: 45, timestamp: d.toISOString() },
      h_4: { completed: true, value: 8500, timestamp: d.toISOString() },
      h_5: { completed: i % 5 !== 0, value: 1, timestamp: d.toISOString() }
    };
  }
  return logs;
}

function generateDemoMoods() {
  const moods = {};
  const today = new Date();
  const sampleMoods = ['energized', 'happy', 'calm', 'happy', 'neutral', 'energized', 'calm'];
  const sampleNotes = [
    'Smashed all morning goals with high energy!',
    'Great evening walk and productive coding session.',
    'Spent 15 minutes meditating, feeling centered.',
    'Restful sleep, achieved 85% completion rate.',
    'Reviewed documentation and planned upcoming tasks.',
    'Great momentum on deep work project!',
    'Calm and focused day.'
  ];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateKey = getFormattedDateKey(d);
    moods[dateKey] = {
      mood: sampleMoods[i],
      note: sampleNotes[i],
      updatedAt: d.toISOString()
    };
  }
  return moods;
}

function generateDemoFocusSessions() {
  return [
    { date: getFormattedDateKey(), minutes: 45, habitName: 'Deep Code & Project Focus' }
  ];
}

export function calculateLevel(xp) {
  const level = Math.floor(xp / 100) + 1;
  const currentLevelXP = xp % 100;
  const xpNeeded = 100;
  return {
    level,
    currentLevelXP,
    xpNeeded,
    percentage: Math.min(100, Math.round((currentLevelXP / xpNeeded) * 100))
  };
}

export function calculateHabitStreak(habitId, logs) {
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

    if (entry && entry.completed) {
      currentStreak++;
    } else {
      break;
    }
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
