import Storage from "./api.js";
import ThemeChange from "./uiThemeChange.js";

// -------------------- Selecting Media Controls ------------------------
const startBtn = document.querySelector(".main__controls__start");
const nextBtn = document.querySelector(".main__controls__next");

// -------------------- Selecting Timer Control -------------------------
const timerMin = document.querySelector(".main__timer__min");
const timerSec = document.querySelector(".main__timer__sec");

// ------------------  Selecting the Play/Pause Icon  -------------------
const playIcon = document.querySelector(".main__controls__start__icon");

// --------------------   Sound Selecting -------------------------------
const clickSound = document.querySelector(".click-sound");
const ringSound = document.querySelector(".end-sound");

// -----------------  Different Modes Area Selecting ---------------------
const maimModeText = document.querySelector(".main__mode__text");

// -------------------- Default Globals Values -----------------------
let totalTime = 0;
let isActive = false;
let intervalReference = 0;
let currentModeIndex = 0;
let numberOfFocusSessions = 0;
let allModes = Storage.getSetting();

// -------------------- Notification Flag ----------------------------
let notificationRequested = false; // Track if permission has been asked

// -------------------- Notification Function -------------------------
function sendNotification(title, message) {
  if (Notification.permission === "granted") {
    new Notification(title, {
      body: message,
      icon: "../assets/images/notification-icon.png", // Optional icon
    });
  }
}

// -------------------- Ask Permission On First Timer Start -----------
function askNotificationPermission() {
  if (!notificationRequested && Notification.permission !== "granted") {
    notificationRequested = true;
    const enable = confirm("Enable notifications for timer alerts?");
    if (enable) {
      Notification.requestPermission();
    }
  }
}

// ------------------------ Timer Class -------------------------------
class Timer {
  constructor() {
    clickSound.load();

    startBtn.addEventListener("click", this.startCounter);
    nextBtn.addEventListener("click", Timer.nextModeManual);
    document.addEventListener("keydown", (event) => {
      if (event.code === "Space") {
        this.startCounter();
      }
    });
  }

  setApp() {
    currentModeIndex = 0;
    numberOfFocusSessions = 0;
    Timer.changeToFocusMode();
  }

  // ------------------ Different Modes Logic ---------------------------
  static changeToFocusMode() {
    maimModeText.textContent = "Focus";
    Timer.setDefaultValues();
    ThemeChange.setRedTheme();
  }

  static changeToShortBreak() {
    maimModeText.textContent = "Short Break";
    Timer.setDefaultValues();
    ThemeChange.setGreenTheme();
  }

  static changeToLongBreak() {
    maimModeText.textContent = "Long Break";
    Timer.setDefaultValues();
    ThemeChange.setBlueTheme();
  }

  // Toggle the timer state (start/stop)
  startCounter() {
    clickSound.play();

    // Ask for notifications on first start
    askNotificationPermission();

    isActive = !isActive;
    Timer.changePlayIcon();

    if (isActive) {
      const second = 1000;
      intervalReference = setInterval(Timer.timerLogic, second);
    } else {
      clearInterval(intervalReference);
    }
  }

  static changePlayIcon() {
    if (isActive) {
      playIcon.setAttribute("xlink:href", "../assets/images/sprite.svg#pause");
    } else {
      playIcon.setAttribute("xlink:href", "../assets/images/sprite.svg#start");
    }
  }

  static timerLogic() {
    if (totalTime == 0) {
      if (currentModeIndex == 0) {
        numberOfFocusSessions += 1;
        Storage.updateNumberOfFocus(1);
      }
      ringSound.play();

      // Send notifications based on mode
      if (currentModeIndex === 0) {
        sendNotification("Pomodoro Timer", "Focus session complete! Time for a break.");
      } else {
        sendNotification("Pomodoro Timer", "Break is over! Time to focus.");
      }

      Timer.nextModeAuto();
    } else {
      totalTime -= 1;
      Timer.updateTheTimerInHtml();
    }
  }

  static formatTime(time) {
    return String(time).padStart(2, "0");
  }

  static nextModeAuto() {
    const numberOfSessions = Number(Storage.getSetting()[3].number);
    if (numberOfFocusSessions >= numberOfSessions) {
      currentModeIndex = 2;
      numberOfFocusSessions = 0;
      Timer.changeToLongBreak();
    } else if (currentModeIndex == 0) {
      currentModeIndex = 1;
      Timer.changeToShortBreak();
    } else {
      currentModeIndex = 0;
      Timer.changeToFocusMode();
    }
  }

  static nextModeManual() {
    currentModeIndex += 1;
    switch (currentModeIndex) {
      case 1:
        Timer.changeToShortBreak();
        break;
      case 2:
        Timer.changeToLongBreak();
        break;
      default:
        currentModeIndex = 0;
        Timer.changeToFocusMode();
        break;
    }
  }

  static setDefaultValues() {
    isActive = false;
    allModes = Storage.getSetting();
    totalTime = allModes[currentModeIndex].time;
    clearInterval(intervalReference);
    Timer.changePlayIcon();
    Timer.updateTheTimerInHtml();
  }

  static updateTheTimerInHtml() {
    timerMin.textContent = Timer.formatTime(Math.floor(totalTime / 60));
    timerSec.textContent = Timer.formatTime(Math.floor(totalTime % 60));
  }
}

export default new Timer();
