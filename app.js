/**
 * 個人專屬時間儀表板 (Chrono Identity)
 * 提供即時時鐘、姓名自訂、時區對照與動態問候
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM 元素選取
  const hoursEl = document.getElementById('clock-hours');
  const minutesEl = document.getElementById('clock-minutes');
  const secondsEl = document.getElementById('clock-seconds');
  const ampmEl = document.getElementById('clock-ampm');
  const ampmContainer = document.getElementById('ampm-container');
  const fullDateEl = document.getElementById('full-date-text');
  const dayOfWeekEl = document.getElementById('day-of-week');
  const timezoneEl = document.getElementById('timezone-text');

  const greetingTextEl = document.getElementById('greeting-text');
  const greetingIconEl = document.getElementById('greeting-icon');
  const userNameTextEl = document.getElementById('user-name-text');

  // 指針時鐘元素
  const analogHourHand = document.getElementById('analog-hour');
  const analogMinuteHand = document.getElementById('analog-minute');
  const analogSecondHand = document.getElementById('analog-second');
  const digitalView = document.getElementById('digital-clock-view');
  const analogView = document.getElementById('analog-clock-view');
  const clockModeBtn = document.getElementById('clock-mode-btn');
  const modeLabel = document.getElementById('mode-label');

  // 控制項按鈕
  const formatToggleBtn = document.getElementById('format-toggle-btn');
  const formatBadge = document.getElementById('format-badge');
  const themeBtn = document.getElementById('theme-btn');
  const themeDropdown = document.getElementById('theme-dropdown');
  const themeOptions = document.querySelectorAll('.theme-opt');

  // 今日進度與年度資訊
  const dayProgressPctEl = document.getElementById('day-progress-pct');
  const dayProgressBarEl = document.getElementById('day-progress-bar');
  const dayProgressDetailEl = document.getElementById('day-progress-detail');
  const weekNumberEl = document.getElementById('week-number-val');
  const yearDaysLeftEl = document.getElementById('year-days-left');

  // 姓名彈窗
  const editNameBtn = document.getElementById('edit-name-btn');
  const nameModal = document.getElementById('name-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const cancelNameBtn = document.getElementById('cancel-name-btn');
  const nameForm = document.getElementById('name-form');
  const nameInput = document.getElementById('name-input');
  const tagBtns = document.querySelectorAll('.tag-btn');

  // 世界城市時間元素
  const cityTokyoEl = document.getElementById('city-tokyo');
  const cityLondonEl = document.getElementById('city-london');
  const cityNewYorkEl = document.getElementById('city-newyork');
  const citySfEl = document.getElementById('city-sf');

  // 狀態管理
  let is24HourFormat = localStorage.getItem('chrono_24h') !== 'false'; // 預設 24 小時制
  let isAnalogMode = localStorage.getItem('chrono_clock_mode') === 'analog';
  let currentTheme = localStorage.getItem('chrono_theme') || 'aurora';
  let userName = localStorage.getItem('chrono_user_name') || '親愛的訪客';

  // 初始化主題與狀態
  applyTheme(currentTheme);
  updateClockModeUI();
  updateFormatUI();
  updateUserNameUI(userName);

  // 1. 姓名互動功能
  function updateUserNameUI(name) {
    userNameTextEl.textContent = name;
  }

  function openNameModal() {
    nameInput.value = userName === '親愛的訪客' ? '' : userName;
    nameModal.classList.add('active');
    nameModal.setAttribute('aria-hidden', 'false');
    nameInput.focus();
  }

  function closeNameModal() {
    nameModal.classList.remove('active');
    nameModal.setAttribute('aria-hidden', 'true');
  }

  editNameBtn.addEventListener('click', openNameModal);
  userNameTextEl.addEventListener('click', openNameModal);
  closeModalBtn.addEventListener('click', closeNameModal);
  cancelNameBtn.addEventListener('click', closeNameModal);

  // 點擊彈窗外陰影區域關閉
  nameModal.addEventListener('click', (e) => {
    if (e.target === nameModal) {
      closeNameModal();
    }
  });

  // 快速標籤填入
  tagBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      nameInput.value = btn.dataset.val;
      nameInput.focus();
    });
  });

  // 提交名字表單
  nameForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const enteredName = nameInput.value.trim();
    if (enteredName) {
      userName = enteredName;
      localStorage.setItem('chrono_user_name', userName);
      updateUserNameUI(userName);
      closeNameModal();
    }
  });

  // 2. 時鐘格式與模式切換
  formatToggleBtn.addEventListener('click', () => {
    is24HourFormat = !is24HourFormat;
    localStorage.setItem('chrono_24h', is24HourFormat);
    updateFormatUI();
    renderTime();
  });

  function updateFormatUI() {
    formatBadge.textContent = is24HourFormat ? '24H' : '12H';
    ampmContainer.style.display = is24HourFormat ? 'none' : 'block';
  }

  clockModeBtn.addEventListener('click', () => {
    isAnalogMode = !isAnalogMode;
    localStorage.setItem('chrono_clock_mode', isAnalogMode ? 'analog' : 'digital');
    updateClockModeUI();
  });

  function updateClockModeUI() {
    if (isAnalogMode) {
      digitalView.classList.remove('active');
      analogView.classList.add('active');
      modeLabel.textContent = '數位模式';
    } else {
      analogView.classList.remove('active');
      digitalView.classList.add('active');
      modeLabel.textContent = '指針模式';
    }
  }

  // 3. 主題切換
  themeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    themeDropdown.classList.toggle('show');
  });

  document.addEventListener('click', (e) => {
    if (!themeBtn.contains(e.target) && !themeDropdown.contains(e.target)) {
      themeDropdown.classList.remove('show');
    }
  });

  themeOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      const selectedTheme = opt.dataset.themeVal;
      applyTheme(selectedTheme);
      themeDropdown.classList.remove('show');
    });
  });

  function applyTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('chrono_theme', theme);
    themeOptions.forEach(opt => {
      opt.classList.toggle('active', opt.dataset.themeVal === theme);
    });
  }

  // 4. 動態時間計算與更新邏輯
  const daysOfWeekZh = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

  function padZero(num) {
    return String(num).padStart(2, '0');
  }

  function getWeekNumber(d) {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
  }

  function renderTime() {
    const now = new Date();

    const rawHours = now.getHours();
    const rawMinutes = now.getMinutes();
    const rawSeconds = now.getSeconds();
    const rawMillis = now.getMilliseconds();

    // 數位時間顯示
    let displayHours = rawHours;
    let ampmText = '';

    if (!is24HourFormat) {
      ampmText = rawHours >= 12 ? 'PM' : 'AM';
      displayHours = rawHours % 12 || 12;
      ampmEl.textContent = ampmText;
    }

    hoursEl.textContent = padZero(displayHours);
    minutesEl.textContent = padZero(rawMinutes);
    secondsEl.textContent = padZero(rawSeconds);

    // 指針時鐘更新
    const secondFraction = (rawSeconds + rawMillis / 1000) / 60;
    const minuteFraction = (rawMinutes + secondFraction) / 60;
    const hourFraction = ((rawHours % 12) + minuteFraction) / 12;

    const secondDeg = secondFraction * 360;
    const minuteDeg = minuteFraction * 360;
    const hourDeg = hourFraction * 360;

    analogSecondHand.style.transform = `rotate(${secondDeg}deg)`;
    analogMinuteHand.style.transform = `rotate(${minuteDeg}deg)`;
    analogHourHand.style.transform = `rotate(${hourDeg}deg)`;

    // 完整日期顯示
    const year = now.getFullYear();
    const month = padZero(now.getMonth() + 1);
    const date = padZero(now.getDate());
    const dayOfWeek = daysOfWeekZh[now.getDay()];

    fullDateEl.textContent = `${year}年 ${month}月 ${date}日`;
    dayOfWeekEl.textContent = dayOfWeek;

    // 時區文字
    try {
      const timeZoneName = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Taipei';
      const offsetMinutes = -now.getTimezoneOffset();
      const offsetHours = offsetMinutes / 60;
      const gmtSign = offsetHours >= 0 ? '+' : '';
      timezoneEl.textContent = `GMT${gmtSign}${offsetHours} (${timeZoneName})`;
    } catch {
      timezoneEl.textContent = `GMT+8 (本地時間)`;
    }

    // 問候語更新
    updateGreeting(rawHours);

    // 進度條與年度統計
    updateMetrics(now, rawHours, rawMinutes, rawSeconds);

    // 世界城市時間更新
    updateWorldClocks(now);
  }

  function updateGreeting(hour) {
    let greeting = '';
    let icon = '';

    if (hour >= 0 && hour < 6) {
      greeting = '夜深了，給自己一杯溫水，注意充分休息';
      icon = '🌙';
    } else if (hour >= 6 && hour < 11) {
      greeting = '早安，陽光正好，充滿活力的一天開始了';
      icon = '🌅';
    } else if (hour >= 11 && hour < 14) {
      greeting = '午安，享用美味的午餐，稍作放鬆片刻';
      icon = '☀️';
    } else if (hour >= 14 && hour < 18) {
      greeting = '午後好時光，保持專注，靈感正源源不絕';
      icon = '☕';
    } else if (hour >= 18 && hour < 22) {
      greeting = '晚安，工作辛苦了，享受放鬆愜意的夜晚';
      icon = '🌆';
    } else {
      greeting = '深夜時分，靜謐安詳，準備迎接好夢';
      icon = '✨';
    }

    greetingTextEl.textContent = greeting;
    greetingIconEl.textContent = icon;
  }

  function updateMetrics(now, hours, minutes, seconds) {
    // 今日已度過秒數百分比
    const secondsToday = (hours * 3600) + (minutes * 60) + seconds;
    const dayPct = ((secondsToday / 86400) * 100).toFixed(1);
    dayProgressPctEl.textContent = `${dayPct}%`;
    dayProgressBarEl.style.width = `${dayPct}%`;

    const hoursRemaining = (24 - hours - (minutes / 60)).toFixed(1);
    dayProgressDetailEl.textContent = `今日剩餘約 ${hoursRemaining} 小時`;

    // 當年第幾週
    const weekNum = getWeekNumber(now);
    weekNumberEl.textContent = `第 ${weekNum} 週`;

    // 距新年剩餘天數
    const nextYear = new Date(now.getFullYear() + 1, 0, 1);
    const diffMs = nextYear - now;
    const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    yearDaysLeftEl.textContent = `距離 ${now.getFullYear() + 1} 年還有 ${daysLeft} 天`;
  }

  function updateWorldClocks(now) {
    const timeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: !is24HourFormat
    };

    try {
      cityTokyoEl.textContent = now.toLocaleTimeString('zh-Hant', { ...timeFormatOptions, timeZone: 'Asia/Tokyo' });
      cityLondonEl.textContent = now.toLocaleTimeString('zh-Hant', { ...timeFormatOptions, timeZone: 'Europe/London' });
      cityNewYorkEl.textContent = now.toLocaleTimeString('zh-Hant', { ...timeFormatOptions, timeZone: 'America/New_York' });
      citySfEl.textContent = now.toLocaleTimeString('zh-Hant', { ...timeFormatOptions, timeZone: 'America/Los_Angeles' });
    } catch {
      // 容錯機制
    }
  }

  // 立即執行第一次算繪
  renderTime();

  // 高頻即時刷新 (讓指針平滑或數位精確)
  setInterval(renderTime, 250);
});
