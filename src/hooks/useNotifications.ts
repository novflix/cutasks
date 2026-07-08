import { useRef, useEffect } from 'react';
import type { Task, ProjectTask, Habit } from '../types';
import { isNotificationsEnabled, sendNotification, getLocalizedMessage } from '../services/notifications';
import { dateKey } from '../utils';
import { useTranslation } from 'react-i18next';

export function useNotifications(
  user: { uid: string } | null,
  dataLoading: boolean,
  tasks: Task[],
  projectTasks: ProjectTask[],
  habits: Habit[],
) {
  const { t, i18n } = useTranslation();
  const tasksRef = useRef(tasks);
  const projectTasksRef = useRef(projectTasks);
  const habitsRef = useRef(habits);

  useEffect(() => { tasksRef.current = tasks; }, [tasks]);
  useEffect(() => { projectTasksRef.current = projectTasks; }, [projectTasks]);
  useEffect(() => { habitsRef.current = habits; }, [habits]);

  useEffect(() => {
    if (!user || !dataLoading) return;

    function checkNotifications() {
      if (!isNotificationsEnabled()) return;
      if (Notification.permission !== 'granted') return;

      const now = new Date();
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      const tomorrowStart = new Date(todayStart);
      tomorrowStart.setDate(tomorrowStart.getDate() + 1);
      const dayAfterTomorrow = new Date(tomorrowStart);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

      const allTasks = [...tasksRef.current, ...projectTasksRef.current];
      const lang = i18n.language;
      const hour = now.getHours();

      const overdueTasks = allTasks.filter((t) =>
        !t.completed && t.deadline && new Date(t.deadline) < todayStart
      );
      if (overdueTasks.length > 0) {
        const task = overdueTasks[0];
        const title = t('notifications.overdue.title');
        const body = getLocalizedMessage('overdue', lang, { title: task.title });
        sendNotification({ title, body, type: 'overdue', tag: 'overdue-check' });
      }

      const tomorrowTasks = allTasks.filter((t) =>
        !t.completed && t.deadline &&
        new Date(t.deadline) >= tomorrowStart &&
        new Date(t.deadline) < dayAfterTomorrow
      );
      if (tomorrowTasks.length > 0) {
        const task = tomorrowTasks[0];
        const title = t('notifications.deadlineTomorrow.title');
        const body = getLocalizedMessage('deadlineTomorrow', lang, { title: task.title });
        sendNotification({ title, body, type: 'deadlineTomorrow', tag: 'deadline-tomorrow-check' });
      }

      if (hour >= 7 && hour <= 9) {
        const activeTasks = allTasks.filter((t) => !t.completed);
        if (activeTasks.length > 0) {
          const title = t('notifications.morningGreeting.title');
          const body = getLocalizedMessage('morningGreeting', lang, { count: activeTasks.length });
          sendNotification({ title, body, type: 'morningGreeting', tag: 'morning-greeting' });
        }
      }

      if (hour >= 19 && hour <= 21) {
        const completedToday = allTasks.filter((t) =>
          t.completed && t.completedAt && t.completedAt >= todayStart.getTime()
        ).length;
        const totalToday = allTasks.filter((t) =>
          t.createdAt >= todayStart.getTime() || !t.completed
        ).length;
        if (totalToday > 0) {
          const title = t('notifications.eveningSummary.title');
          const body = getLocalizedMessage('eveningSummary', lang, { done: completedToday, total: totalToday });
          sendNotification({ title, body, type: 'eveningSummary', tag: 'evening-summary' });
        }
      }

      const jsDay = now.getDay();
      const habitDay = jsDay === 0 ? 6 : jsDay - 1;
      const todayHabits = habitsRef.current.filter((h) => h.weekdays.includes(habitDay));
      const uncompletedHabits = todayHabits.filter((h) => (h.completions[dateKey(now)] || 0) < (h.targetReps || 1));
      if (uncompletedHabits.length > 0 && hour >= 18) {
        const habit = uncompletedHabits[0];
        const title = t('notifications.streakAtRisk.title');
        const body = getLocalizedMessage('streakAtRisk', lang, { habit: habit.name, streak: habit.streak });
        sendNotification({ title, body, type: 'streakAtRisk', tag: `streak-risk-${habit.id}` });
      }
    }

    const timer = setTimeout(checkNotifications, 3000);
    const interval = setInterval(checkNotifications, 30 * 60 * 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [user, dataLoading, t, i18n]);
}
