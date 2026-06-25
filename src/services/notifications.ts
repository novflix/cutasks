export type NotificationType =
  | 'deadlineTomorrow'
  | 'overdue'
  | 'habitReminder'
  | 'streakAtRisk'
  | 'streakCelebration'
  | 'morningGreeting'
  | 'eveningSummary'
  | 'inactivity';

const NOTIFICATION_STORAGE_KEY = 'cutasks_notifications_enabled';
const NOTIFICATION_PERMISSION_KEY = 'cutasks_notification_permission';
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer;
}

export function isNotificationsSupported(): boolean {
  return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

export function setNotificationsEnabled(enabled: boolean) {
  localStorage.setItem(NOTIFICATION_STORAGE_KEY, enabled ? '1' : '0');
}

export function isNotificationsEnabled(): boolean {
  return localStorage.getItem(NOTIFICATION_STORAGE_KEY) === '1';
}

export async function requestPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied';
  const result = await Notification.requestPermission();
  localStorage.setItem(NOTIFICATION_PERMISSION_KEY, result);
  return result;
}

export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (!isNotificationsSupported()) return null;
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
    return subscription;
  } catch {
    return null;
  }
}

export async function unsubscribeFromPush(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export async function getPushSubscription(): Promise<PushSubscription | null> {
  try {
    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.getSubscription();
  } catch {
    return null;
  }
}

export interface NotificationPayload {
  title: string;
  body: string;
  type: NotificationType;
  tag?: string;
}

export async function sendNotification(payload: NotificationPayload) {
  if (!isNotificationsSupported()) return;
  if (Notification.permission !== 'granted') return;
  if (!isNotificationsEnabled()) return;

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      tag: payload.tag || `cutasks-${payload.type}`,
    });
  } catch {
    const notification = new Notification(payload.title, {
      body: payload.body,
      icon: '/icons/icon-192x192.png',
    } as NotificationOptions);
    notification.onclick = () => { window.focus(); notification.close(); };
  }
}

export function getLocalizedMessage(type: NotificationType, lang: string, vars?: Record<string, string | number>): string {
  const messages: Record<string, Record<NotificationType, string>> = {
    en: {
      deadlineTomorrow: `Task "${vars?.title}" is due tomorrow!`,
      overdue: `Task "${vars?.title}" is overdue!`,
      habitReminder: `Don't forget to do "${vars?.habit}" today!`,
      streakAtRisk: `Your streak for "${vars?.habit}" (${vars?.streak} days) is at risk!`,
      streakCelebration: `${vars?.streak} days in a row for "${vars?.habit}"! Keep it up!`,
      morningGreeting: `Good morning! You have ${vars?.count} active tasks today.`,
      eveningSummary: `Today you completed ${vars?.done} out of ${vars?.total} tasks. Great job!`,
      inactivity: `It's been a while! You have ${vars?.count} tasks waiting for you.`,
    },
    ru: {
      deadlineTomorrow: `Задача «${vars?.title}» истекает завтра!`,
      overdue: `Задача «${vars?.title}» просрочена!`,
      habitReminder: `Не забудь выполнить «${vars?.habit}» сегодня!`,
      streakAtRisk: `Твой стрик «${vars?.habit}» (${vars?.streak} дней) под угрозой!`,
      streakCelebration: `${vars?.streak} дней подряд! «${vars?.habit}» — так держать!`,
      morningGreeting: `Доброе утро! У тебя ${vars?.count} активных задач на сегодня.`,
      eveningSummary: `Сегодня ты выполнил ${vars?.done} из ${vars?.total} задач. Отличная работа!`,
      inactivity: `Давно не заходил! Тебя ждут ${vars?.count} задач.`,
    },
    fr: {
      deadlineTomorrow: `La tâche «${vars?.title}» est due demain !`,
      overdue: `La tâche «${vars?.title}» est en retard !`,
      habitReminder: `N'oublie pas de faire «${vars?.habit}» aujourd'hui !`,
      streakAtRisk: `Ta série «${vars?.habit}» (${vars?.streak} jours) est en danger !`,
      streakCelebration: `${vars?.streak} jours d'affilée pour «${vars?.habit}» ! Continue !`,
      morningGreeting: `Bonjour ! Tu as ${vars?.count} tâches actives aujourd'hui.`,
      eveningSummary: `Aujourd'hui tu as complété ${vars?.done} sur ${vars?.total} tâches. Bravo !`,
      inactivity: `Cela fait longtemps ! Tu as ${vars?.count} tâches qui t'attendent.`,
    },
    de: {
      deadlineTomorrow: `Aufgabe „${vars?.title}" ist morgen fällig!`,
      overdue: `Aufgabe „${vars?.title}" ist überfällig!`,
      habitReminder: `Vergiss nicht, „${vars?.habit}" heute zu erledigen!`,
      streakAtRisk: `Deine Serie „${vars?.habit}" (${vars?.streak} Tage) ist in Gefahr!`,
      streakCelebration: `${vars?.streak} Tage am Stück für „${vars?.habit}"! Weiter so!`,
      morningGreeting: `Guten Morgen! Du hast heute ${vars?.count} aktive Aufgaben.`,
      eveningSummary: `Heute hast du ${vars?.done} von ${vars?.total} Aufgaben erledigt. Gut gemacht!`,
      inactivity: `Lange nicht gesehen! Du hast ${vars?.count} Aufgaben auf dich warten.`,
    },
    es: {
      deadlineTomorrow: `¡La tarea «${vars?.title}» vence mañana!`,
      overdue: `¡La tarea «${vars?.title}» está atrasada!`,
      habitReminder: `¡No olvides hacer «${vars?.habit}» hoy!`,
      streakAtRisk: `¡Tu racha «${vars?.habit}» (${vars?.streak} días) está en peligro!`,
      streakCelebration: `¡${vars?.streak} días seguidos con «${vars?.habit}»! ¡Sigue así!`,
      morningGreeting: `¡Buenos días! Tienes ${vars?.count} tareas activas hoy.`,
      eveningSummary: `Hoy completaste ${vars?.done} de ${vars?.total} tareas. ¡Buen trabajo!`,
      inactivity: `¡Ha pasado tiempo! Tienes ${vars?.count} tareas esperándote.`,
    },
    it: {
      deadlineTomorrow: `La task «${vars?.title}» scade domani!`,
      overdue: `La task «${vars?.title}» è in ritardo!`,
      habitReminder: `Non dimenticare di fare «${vars?.habit}» oggi!`,
      streakAtRisk: `La tua serie «${vars?.habit}» (${vars?.streak} giorni) è in pericolo!`,
      streakCelebration: `${vars?.streak} giorni di fila per «${vars?.habit}»! Continua così!`,
      morningGreeting: `Buongiorno! Hai ${vars?.count} task attive oggi.`,
      eveningSummary: `Oggi hai completato ${vars?.done} su ${vars?.total} task. Ottimo lavoro!`,
      inactivity: `È passato un po'! Hai ${vars?.count} task che ti aspettano.`,
    },
    pt: {
      deadlineTomorrow: `A tarefa «${vars?.title}» vence amanhã!`,
      overdue: `A tarefa «${vars?.title}» está atrasada!`,
      habitReminder: `Não esqueça de fazer «${vars?.habit}» hoje!`,
      streakAtRisk: `Sua sequência «${vars?.habit}» (${vars?.streak} dias) está em risco!`,
      streakCelebration: `${vars?.streak} dias seguidos com «${vars?.habit}»! Continue assim!`,
      morningGreeting: `Bom dia! Você tem ${vars?.count} tarefas ativas hoje.`,
      eveningSummary: `Hoje você completou ${vars?.done} de ${vars?.total} tarefas. Ótimo trabalho!`,
      inactivity: `Faz tempo! Você tem ${vars?.count} tarefas esperando por você.`,
    },
    tr: {
      deadlineTomorrow: `«${vars?.title}» görevi yarın bitiyor!`,
      overdue: `«${vars?.title}» görevi geçti!`,
      habitReminder: `Bugün «${vars?.habit}» yapmayı unutma!`,
      streakAtRisk: `«${vars?.habit}» serin (${vars?.streak} gün) tehlikede!`,
      streakCelebration: `${vars?.streak} gün art arda «${vars?.habit}»! Devam et!`,
      morningGreeting: `Günaydın! Bugün ${vars?.count} aktif görevin var.`,
      eveningSummary: `Bugün ${vars?.total} görevden ${vars?.done}'ini tamamladın. Harika!`,
      inactivity: `Uzun zaman oldu! Seni ${vars?.count} görev bekliyor.`,
    },
    zh: {
      deadlineTomorrow: `任务「${vars?.title}」明天到期！`,
      overdue: `任务「${vars?.title}」已过期！`,
      habitReminder: `别忘了今天完成「${vars?.habit}」！`,
      streakAtRisk: `你的「${vars?.habit}」连续记录（${vars?.streak}天）有风险！`,
      streakCelebration: `「${vars?.habit}」连续${vars?.streak}天！继续保持！`,
      morningGreeting: `早上好！你今天有${vars?.count}个待办任务。`,
      eveningSummary: `今天完成了${vars?.done}/${vars?.total}个任务。干得漂亮！`,
      inactivity: `好久不见！你有${vars?.count}个任务在等你。`,
    },
    ja: {
      deadlineTomorrow: `タスク「${vars?.title}」の期限は明日です！`,
      overdue: `タスク「${vars?.title}」の期限が過ぎています！`,
      habitReminder: `今日「${vars?.habit}」をすることを忘れずに！`,
      streakAtRisk: `「${vars?.habit}」の連続記録（${vars?.streak}日）が危険です！`,
      streakCelebration: `「${vars?.habit}」${vars?.streak}日連続！この調子！`,
      morningGreeting: `おはよう！今日のタスクは${vars?.count}件です。`,
      eveningSummary: `今日は${vars?.total}件中${vars?.done}件完了。よくできました！`,
      inactivity: `しばらくぶり！${vars?.count}件のタスクがあなたを待っています。`,
    },
  };

  const langMessages = messages[lang] || messages.en;
  return langMessages[type] || '';
}
