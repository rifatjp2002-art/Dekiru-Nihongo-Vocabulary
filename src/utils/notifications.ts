/**
 * Notification management utility with Service Worker support for mobile & desktop
 */

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) return false;
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (err) {
    console.error('Failed to request notification permission:', err);
    return false;
  }
}

export async function sendNotification(title: string, body: string): Promise<boolean> {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  const options: Record<string, any> = {
    body,
    icon: 'https://cdn-icons-png.flaticon.com/512/188/188333.png',
    badge: 'https://cdn-icons-png.flaticon.com/512/188/188333.png',
    vibrate: [200, 100, 200],
    tag: 'dekiru-daily-reminder',
    renotify: true,
    data: {
      url: window.location.href
    }
  };

  // Try Service Worker registration first (standard and essential for Android Chrome)
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification(title, options);
      return true;
    } catch (swErr) {
      console.warn('Service worker showNotification fallback:', swErr);
    }
  }

  // Fallback to Notification constructor (Desktop browsers)
  try {
    new Notification(title, options);
    return true;
  } catch (err) {
    console.warn('Notification constructor error (expected on mobile without SW):', err);
    return false;
  }
}

/**
 * Checks if the current time matches the scheduled reminder time.
 * Includes a 5-minute tolerance window in case the device was briefly asleep.
 */
export function checkAndTriggerReminder(): void {
  const isEnabled = localStorage.getItem('notificationsEnabled') === 'true';
  if (!isEnabled) return;
  if (!isNotificationSupported() || Notification.permission !== 'granted') return;

  const reminderTime = localStorage.getItem('reminderTime') || '21:00';
  const parts = reminderTime.split(':');
  if (parts.length !== 2) return;

  const targetHours = parseInt(parts[0], 10);
  const targetMinutes = parseInt(parts[1], 10);

  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();

  // Current time in minutes from start of day
  const currentTotalMinutes = currentHours * 60 + currentMinutes;
  const targetTotalMinutes = targetHours * 60 + targetMinutes;

  const diffMinutes = currentTotalMinutes - targetTotalMinutes;

  // Trigger if we are within 0 to 4 minutes after the scheduled time
  if (diffMinutes >= 0 && diffMinutes <= 4) {
    const todayDate = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
    const triggerKey = `notif_triggered_${todayDate}_${reminderTime}`;

    if (!localStorage.getItem(triggerKey)) {
      localStorage.setItem(triggerKey, 'true');
      sendNotification(
        'Dekiru Nihongo (できる日本語) 🌸',
        'আজকের জাপানি শব্দগুলো রিভিশন দেওয়ার সময় হয়েছে! আপনার প্রতিদিনের প্র্যাকটিস চালিয়ে যান।'
      );
    }
  }
}

/**
 * Initializes a global interval that checks the reminder schedule every 10 seconds.
 * Returns an unmount/cleanup function.
 */
export function startReminderScheduler(): () => void {
  // Run an immediate check on startup
  checkAndTriggerReminder();

  const intervalId = window.setInterval(() => {
    checkAndTriggerReminder();
  }, 10000); // 10 seconds ensures we never miss a scheduled minute

  return () => {
    window.clearInterval(intervalId);
  };
}
