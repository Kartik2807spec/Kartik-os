const breakfasts = [
  {
    name: "Masala Idli",
    time: "15 min",
    ingredients: "Idli batter, Oil, Mustard seeds, Curry leaves, Onions, Green chilies",
    prep: "Steam idlis, temper with spices, serve hot",
    video: "https://www.youtube.com/watch?v=4vJc5W5b3nE"
  },
  {
    name: "Poha (Flattened Rice)",
    time: "10 min",
    ingredients: "Poha, Oil, Mustard seeds, Peanuts, Onions, Potatoes, Turmeric, Lemon",
    prep: "Rinse poha, sauté ingredients, mix and serve",
    video: "https://www.youtube.com/watch?v=5vJc6W6b4nF"
  },
  {
    name: "Upma",
    time: "15 min",
    ingredients: "Semolina, Oil, Mustard seeds, Urad dal, Onions, Vegetables, Curry leaves",
    prep: "Roast semolina, sauté spices and veggies, cook together",
    video: "https://www.youtube.com/watch?v=6vJc7W7b5nG"
  },
  {
    name: "Aloo Paratha",
    time: "20 min",
    ingredients: "Wheat flour, Potatoes, Spices, Oil",
    prep: "Make dough, stuff with spiced potatoes, cook on tawa",
    video: "https://www.youtube.com/watch?v=7vJc8W8b6nH"
  },
  {
    name: "Dosa",
    time: "20 min",
    ingredients: "Dosa batter, Oil, Potato filling (optional)",
    prep: "Spread batter on hot tawa, cook, serve with chutney",
    video: "https://www.youtube.com/watch?v=8vJc9W9b7nI"
  }
];

function getRandomItem(list) {
  return list[Math.floor(Math.random() * list.length)];
}

const CHANNEL_TOP_VIDEOS = {
  "icooklean": {
    displayName: "Icooklean",
    url: "https://www.youtube.com/watch?v=aRn4w5Ev2ic"
  },
  "ladleandlovebyridhima": {
    displayName: "Ladle and Love by Ridhima",
    url: "https://www.youtube.com/watch?v=dMrPeSj9FFo"
  },
  "ladle and love by ridhima": {
    displayName: "Ladle and Love by Ridhima",
    url: "https://www.youtube.com/watch?v=dMrPeSj9FFo"
  },
  "kaustubhlifestyle": {
    displayName: "kaustubhlifestyle",
    url: "https://www.youtube.com/watch?v=WY1OcmD0qCU"
  },
  "wethinkfusion": {
    displayName: "WE THINK FUSION",
    url: "https://www.youtube.com/watch?v=sA0GlXxGKek"
  }
};

function getYouTubeId(url) {
  const match = url.match(/(?:v=|\/youtu\.be\/|\/embed\/)([^&?/]+)/);
  return match ? match[1] : null;
}

function showRandomBreakfast() {
  const random = getRandomItem(breakfasts);
  document.getElementById('rbName').textContent = random.name;
  document.getElementById('rbTime').textContent = random.time;
  document.getElementById('rbIngredients').textContent = random.ingredients;
  document.getElementById('rbPrep').textContent = random.prep;
  const videoId = getYouTubeId(random.video);
  document.getElementById('rbVideo').src = `https://www.youtube.com/embed/${videoId}`;
  document.getElementById('randomBreakfast').style.display = 'block';
}

function showRandomChannelVideo() {
  const raw = document.getElementById('channelNamesInput').value;
  const channels = raw.split(',').map(c => c.trim()).filter(Boolean);
  if (!channels.length) {
    alert('Enter one or more channel names separated by commas.');
    return;
  }

  const normalized = channels.map(ch => ch.toLowerCase().replace(/\s+/g, ' ').trim());
  const matched = normalized.filter(ch => CHANNEL_TOP_VIDEOS[ch]);
  if (!matched.length) {
    const supported = Object.values(CHANNEL_TOP_VIDEOS).map(c => c.displayName).join(', ');
    alert(`No top videos found for those channels. Supported channel names: ${supported}`);
    return;
  }

  const chosenKey = getRandomItem(matched);
  const config = CHANNEL_TOP_VIDEOS[chosenKey];
  const videoId = getYouTubeId(config.url);
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

// MOTIVATION VIDEOS - SADHGURU CHANNEL
const SADHGURU_VIDEOS = [
  { id: 'Z9L-l_gVh5c', title: 'Be Happy for No Reason' },
  { id: '8DfN-6g7IXs', title: 'The Power of Your Breath' },
  { id: 'I_eYxJ1D82U', title: 'Why Do We Suffer?' },
  { id: 'zaMEr5NQECY', title: 'The Secret to Inner Peace' },
  { id: 'uPVSyidCZ3A', title: 'How to Live a Stress-Free Life' },
  { id: '6tAQUjEHbX0', title: 'Meditation for Beginners' },
  { id: 'B0u5h0gSEOo', title: 'The Essence of Success' },
  { id: 'mQGvhXNKfbs', title: 'Transform Your Life' },
  { id: 'L8iBe0gzrDE', title: 'Finding Your Purpose' },
  { id: 'V0qjQKwt17o', title: 'The Science of Yoga' },
  { id: 'c_yKw3nWvB4', title: 'What is Life?' },
  { id: 'FOiZWYFU8-8', title: 'The Art of Living' },
];

let currentMotivationIndex = null;

function getDayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

function getTodaysMotivationIndex() {
  const dayOfYear = getDayOfYear();
  return dayOfYear % SADHGURU_VIDEOS.length;
}

function loadMotivationVideo(index) {
  if (index < 0) {
    index = SADHGURU_VIDEOS.length - 1;
  } else if (index >= SADHGURU_VIDEOS.length) {
    index = 0;
  }
  
  currentMotivationIndex = index;
  const video = SADHGURU_VIDEOS[index];
  
  // Update iframe
  const iframe = document.getElementById('motivationVideo');
  if (iframe) {
    iframe.src = `https://www.youtube.com/embed/${video.id}?autoplay=0`;
  }
  
  // Update title
  const titleEl = document.getElementById('videoTitle');
  if (titleEl) {
    titleEl.textContent = video.title;
  }
  
  // Update date
  const dateEl = document.getElementById('videoDate');
  if (dateEl) {
    const isToday = index === getTodaysMotivationIndex();
    dateEl.textContent = isToday ? 'Today' : `Video ${index + 1} of ${SADHGURU_VIDEOS.length}`;
  }
  
  // Update list highlighting
  updateMotivationVideoList(index);
}

function updateMotivationVideoList(activeIndex) {
  const listEl = document.getElementById('videoList');
  if (!listEl) return;
  
  let html = '';
  const todayIndex = getTodaysMotivationIndex();
  
  SADHGURU_VIDEOS.forEach((video, idx) => {
    const isToday = idx === todayIndex;
    const isActive = idx === activeIndex;
    const icon = isToday ? '⭐' : '▶️';
    
    html += `<div class="video-list-item ${isActive ? 'active' : ''}" onclick="loadMotivationVideo(${idx})">
      <div class="video-list-icon">${icon}</div>
      <div class="video-list-info">
        <div class="video-list-title">${video.title}</div>
        <div class="video-list-day">${isToday ? '📅 Today' : `Video ${idx + 1}`}</div>
      </div>
    </div>`;
  });
  
  listEl.innerHTML = html;
}

function refreshMotivationVideo() {
  const todayIndex = getTodaysMotivationIndex();
  loadMotivationVideo(todayIndex);
  window.scrollTo(0, 0);
}

function previousMotivationVideo() {
  if (currentMotivationIndex === null) {
    currentMotivationIndex = getTodaysMotivationIndex();
  }
  loadMotivationVideo(currentMotivationIndex - 1);
}

function nextMotivationVideo() {
  if (currentMotivationIndex === null) {
    currentMotivationIndex = getTodaysMotivationIndex();
  }
  loadMotivationVideo(currentMotivationIndex + 1);
}

function initMotivationVideos() {
  refreshMotivationVideo();
}

// ===== BREAK SYSTEM END =====