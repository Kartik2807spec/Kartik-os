const breakfasts = [
  {
    name: "Masala Idli",
    time: "15 min",
    ingredients: "Idli batter, Oil, Mustard seeds, Curry leaves, Onions, Green chilies",
    prep: "Steam idlis, temper with spices, serve hot"
  },
  {
    name: "Poha (Flattened Rice)",
    time: "10 min",
    ingredients: "Poha, Oil, Mustard seeds, Peanuts, Onions, Potatoes, Turmeric, Lemon",
    prep: "Rinse poha, sauté ingredients, mix and serve"
  },
  {
    name: "Upma",
    time: "15 min",
    ingredients: "Semolina, Oil, Mustard seeds, Urad dal, Onions, Vegetables, Curry leaves",
    prep: "Roast semolina, sauté spices and veggies, cook together"
  },
  {
    name: "Aloo Paratha",
    time: "20 min",
    ingredients: "Wheat flour, Potatoes, Spices, Oil",
    prep: "Make dough, stuff with spiced potatoes, cook on tawa"
  },
  {
    name: "Dosa",
    time: "20 min",
    ingredients: "Dosa batter, Oil, Potato filling (optional)",
    prep: "Spread batter on hot tawa, cook, serve with chutney"
  }
];

function getRandomItem(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function showRandomBreakfast() {
  const random = getRandomItem(breakfasts);
  document.getElementById('rbName').textContent = random.name;
  document.getElementById('rbTime').textContent = random.time;
  document.getElementById('rbIngredients').textContent = random.ingredients;
  document.getElementById('rbPrep').textContent = random.prep;
  document.getElementById('randomBreakfast').style.display = 'block';
}
  if (!videoId) {
    alert('Invalid video URL configured for channel: ' + config.displayName);
    return;
  }

  document.getElementById('rcvName').textContent = `Top video from ${config.displayName}`;
  document.getElementById('rcvChannel').textContent = config.url;
  document.getElementById('rcvVideo').src = `https://www.youtube.com/embed/${videoId}`;
  document.getElementById('rcvNotice').textContent = 'This selection is based on stored top videos for the channels you enter.';
  document.getElementById('randomChannelVideo').style.display = 'block';
}

let isOnBreak = false;
let breakTimer = null;

function startBreak() {
  if (isOnBreak) return;

  isOnBreak = true;
  let seconds = 10; // change duration if needed

  const status = document.getElementById("break-status");
  if (!status) return;

  status.innerText = "Break started: " + seconds + "s";

  breakTimer = setInterval(() => {
    seconds--;

    status.innerText = "Break: " + seconds + "s remaining";

    if (seconds <= 0) {
      clearInterval(breakTimer);
      isOnBreak = false;
      status.innerText = "Break over. Back to work!";
    }
  }, 1000);
}

// WATER REMINDER FUNCTIONALITY - FIXED SCHEDULE
const WATER_REMINDER_TIMES = [
  { hour: 6, minute: 0 },   // 6 AM
  { hour: 8, minute: 0 },   // 8 AM
  { hour: 11, minute: 0 },  // 11 AM
  { hour: 15, minute: 0 },  // 3 PM
  { hour: 18, minute: 0 },  // 6 PM
  { hour: 19, minute: 30 }, // 7:30 PM
  { hour: 22, minute: 30 }  // 10:30 PM
];

let waterReminderCheckInterval = null;
let waterReminderActive = false;
let waterReminders = JSON.parse(localStorage.getItem('kk_water_reminders') || '[]');
let lastReminderTime = null;

function saveWaterReminders() {
  localStorage.setItem('kk_water_reminders', JSON.stringify(waterReminders));
}

function getNextReminderTime() {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentSeconds = now.getSeconds();
  
  for (let i = 0; i < WATER_REMINDER_TIMES.length; i++) {
    const reminder = WATER_REMINDER_TIMES[i];
    const reminderMinutes = reminder.hour * 60 + reminder.minute;
    const currentMinutes = currentHour * 60 + currentMinute;
    
    if (reminderMinutes > currentMinutes || (reminderMinutes === currentMinutes && currentSeconds < 5)) {
      const nextTime = new Date();
      nextTime.setHours(reminder.hour, reminder.minute, 0, 0);
      return nextTime;
    }
  }
  
  // If no reminder today, next is 6 AM tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(6, 0, 0, 0);
  return tomorrow;
}

function startWaterReminder() {
  // Request notification permission
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }

  waterReminderActive = true;
  lastReminderTime = null;
  
  // Update UI
  document.getElementById('startBtn').disabled = true;
  document.getElementById('stopBtn').disabled = false;

  // Clear any existing interval
  if (waterReminderCheckInterval) clearInterval(waterReminderCheckInterval);

  // Add initial log
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  waterReminders.unshift({
    time: timeStr,
    timestamp: now.getTime(),
    type: 'started'
  });
  saveWaterReminders();
  updateWaterHistory();

  // Check every minute for scheduled reminders
  waterReminderCheckInterval = setInterval(() => {
    if (waterReminderActive) {
      checkAndTriggerReminder();
    }
  }, 60 * 1000); // Check every minute

  // Also check immediately
  checkAndTriggerReminder();
  updateWaterCountdown();
}

function stopWaterReminder() {
  waterReminderActive = false;
  if (waterReminderCheckInterval) clearInterval(waterReminderCheckInterval);
  
  // Update UI
  document.getElementById('startBtn').disabled = false;
  document.getElementById('stopBtn').disabled = true;
  document.getElementById('waterCountdown').textContent = '--:--';
  document.getElementById('waterStatus').textContent = 'Reminders disabled';

  // Add log
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  waterReminders.unshift({
    time: timeStr,
    timestamp: now.getTime(),
    type: 'stopped'
  });
  saveWaterReminders();
  updateWaterHistory();
}

function checkAndTriggerReminder() {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  // Check if current time matches any scheduled reminder time
  for (let i = 0; i < WATER_REMINDER_TIMES.length; i++) {
    const reminder = WATER_REMINDER_TIMES[i];
    
    if (currentHour === reminder.hour && currentMinute === reminder.minute) {
      // Create unique key for this reminder time
      const reminderKey = `${currentHour}:${currentMinute}:${now.getDate()}`;
      
      // Only trigger once per scheduled time per day
      if (lastReminderTime !== reminderKey) {
        lastReminderTime = reminderKey;
        triggerWaterReminder(reminder);
      }
      break;
    }
  }
  
  // Reset lastReminderTime when we pass all reminders (at 11 PM or later)
  if (currentHour >= 23 || (currentHour === 0 && currentMinute < 10)) {
    if (lastReminderTime && !lastReminderTime.includes(now.getDate())) {
      lastReminderTime = null;
    }
  }
}

function triggerWaterReminder(reminderTime) {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  
  // Add to history
  waterReminders.unshift({
    time: timeStr,
    timestamp: now.getTime(),
    type: 'reminder'
  });
  saveWaterReminders();
  updateWaterHistory();

  // Show browser notification
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('💧 Drink Water!', {
      body: 'Time to hydrate! Drink a glass of water now.',
      icon: '💧',
      tag: 'water-reminder'
    });
  }

  // Show in-app alert
  showWaterAlert();
}

function showWaterAlert() {
  // Try to play a beep sound
  const audio = new Audio('data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAA');
  audio.play().catch(() => {}); 
  
  alert('💧 Time to drink water! Stay hydrated!');
}

function updateWaterCountdown() {
  if (!waterReminderActive) return;
  
  const countdownInterval = setInterval(() => {
    if (!waterReminderActive) {
      clearInterval(countdownInterval);
      return;
    }
    
    const nextReminder = getNextReminderTime();
    const now = new Date();
    const diff = nextReminder - now;
    
    if (diff <= 0) {
      clearInterval(countdownInterval);
      updateWaterCountdown();
      return;
    }
    
    const totalSeconds = Math.floor(diff / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    const timeStr = String(hours).padStart(2, '0') + ':' + String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
    const countdownEl = document.getElementById('waterCountdown');
    if (countdownEl) countdownEl.textContent = timeStr;
    
    const nextReminderStr = nextReminder.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const statusEl = document.getElementById('waterStatus');
    if (statusEl) statusEl.textContent = 'Next reminder at ' + nextReminderStr;
  }, 1000);
}

function updateWaterHistory() {
  const historyEl = document.getElementById('waterHistory');
  if (!historyEl) return;
  
  if (waterReminders.length === 0) {
    historyEl.innerHTML = '<div style="font-size:.82rem;color:var(--muted);text-align:center;padding:20px;">No reminders yet</div>';
    return;
  }

  let html = '';
  waterReminders.slice(0, 20).forEach(reminder => {
    const icon = reminder.type === 'reminder' ? '💧' : reminder.type === 'started' ? '▶️' : '⏹️';
    const label = reminder.type === 'reminder' ? 'Reminder' : reminder.type === 'started' ? 'Started' : 'Stopped';
    html += `<div class="water-history-item">${icon} ${label}<br><span class="water-history-time">${reminder.time}</span></div>`;
  });
  
  historyEl.innerHTML = html;
}

// Initialize water reminder on page load
function initWaterReminder() {
  updateWaterHistory();
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  if (startBtn) startBtn.disabled = false;
  if (stopBtn) stopBtn.disabled = true;
}

// ===== BREAK SYSTEM END =====