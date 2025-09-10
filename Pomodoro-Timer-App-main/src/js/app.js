import Timer from "./timer.js";
import SettingUi from "./settingUi.js";
import Statistics from "./statistics.js";
import Storage from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
  const askNotificationPermission = () => {
    if (Notification.permission !== "granted") {
      const enable = confirm("Enable notifications for timer alerts?");
      if (enable) {
        Notification.requestPermission();
      }
    }
  };

  // Call it after DOM is ready (optional: you can also call it when the user starts the first timer)
  askNotificationPermission();
  Storage.setApp();
  Timer.setApp();
  SettingUi.setApp();
  Storage.trackDateLogic();
});
