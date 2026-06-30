import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import {
  ClipboardCheck, Fire, Folder, DangerTriangle,
  CheckCircle, Lock, Target, AltArrowRight,
} from '@solar-icons/react';
import type { Task, Project, Habit, ProjectTask } from '../types';
import { getDeadlineStatus, dateKey } from '../utils';

interface HomePageProps {
  tasks: Task[];
  projects: Project[];
  habits: Habit[];
  projectTasks: ProjectTask[];
}

export default function HomePage({ tasks, projects, habits, projectTasks }: HomePageProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);
  const todayKey = dateKey(today);

  const firstName = useMemo(() => {
    const name = user?.displayName || user?.email?.split('@')[0] || 'there';
    return name.split(' ')[0];
  }, [user]);

  const taskStats = useMemo(() => {
    const active = tasks.filter(t => !t.completed).length;
    const completed = tasks.filter(t => t.completed).length;
    const overdue = tasks.filter(t => !t.completed && getDeadlineStatus(t.deadline, t.completed) === 'overdue').length;
    const dueToday = tasks.filter(t => !t.completed && t.deadline === todayKey).length;
    const total = tasks.length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { active, completed, overdue, dueToday, total, pct };
  }, [tasks, todayKey]);

  const projectStats = useMemo(() => {
    const active = projects.filter(p => p.status === 'active').length;
    const totalPt = projectTasks.length;
    const donePt = projectTasks.filter(t => t.completed).length;
    return { active, totalPt, donePt };
  }, [projects, projectTasks]);

  const habitStats = useMemo(() => {
    const todayDow = today.getDay();
    const todayDowIdx = todayDow === 0 ? 6 : todayDow - 1;
    const todayHabits = habits.filter(h => h.weekdays.includes(todayDowIdx));
    const todayDone = todayHabits.filter(h => h.completions[todayKey]).length;
    const bestStreak = habits.reduce((max, h) => Math.max(max, h.streak), 0);
    return { total: habits.length, todayTotal: todayHabits.length, todayDone, bestStreak };
  }, [habits, todayKey]);

  const ringR = 34;
  const ringCirc = 2 * Math.PI * ringR;
  const ringOffset = ringCirc * (1 - taskStats.pct / 100);

  const greetingText = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return t('home.greeting.morning');
    if (h < 18) return t('home.greeting.afternoon');
    return t('home.greeting.evening');
  }, [t]);

  const motivationalText = useMemo(() => {
    if (taskStats.overdue > 0) return t('home.motivation.overdue', { count: taskStats.overdue });
    if (taskStats.dueToday > 0) return t('home.motivation.dueToday', { count: taskStats.dueToday });
    if (taskStats.pct >= 80) return t('home.motivation.highCompletion');
    if (taskStats.active > 0) return t('home.motivation.active', { count: taskStats.active });
    return t('home.motivation.allDone');
  }, [taskStats, t]);

  return (
    <>
      <div className="page-hero">
        <h1 className="page-hero-title">{t('common.home')}</h1>
      </div>

      {/* ── Dashboard Card ── */}
      <div className="dash-card">
        <div className="dash-card-deco">
          <svg width="100%" height="100%" viewBox="0 0 400 200" fill="none" preserveAspectRatio="none">
            <circle cx="350" cy="30" r="60" fill="rgba(255,255,255,0.04)" />
            <circle cx="380" cy="160" r="40" fill="rgba(255,255,255,0.03)" />
            <circle cx="50" cy="170" r="50" fill="rgba(255,255,255,0.03)" />
            <rect x="20" y="20" width="8" height="8" rx="2" fill="rgba(255,255,255,0.06)" />
            <rect x="300" y="100" width="6" height="6" rx="1.5" fill="rgba(255,255,255,0.05)" />
            <rect x="150" y="15" width="5" height="5" rx="1" fill="rgba(255,255,255,0.04)" />
          </svg>
        </div>

        {/* Header */}
        <div className="dash-header">
          <div className="dash-header-text">
            <h2 className="dash-title">{greetingText}, {firstName}</h2>
            <p className="dash-sub">{motivationalText}</p>
          </div>
          <div className="dash-ring-wrap">
            <svg className="dash-ring" viewBox="0 0 80 80">
              <circle className="dash-ring-bg" cx="40" cy="40" r={ringR} fill="none" strokeWidth="6" />
              <circle
                className="dash-ring-progress"
                cx="40" cy="40" r={ringR}
                fill="none" strokeWidth="6" strokeLinecap="round"
                strokeDasharray={ringCirc}
                strokeDashoffset={ringOffset}
                transform="rotate(-90 40 40)"
              />
            </svg>
            <div className="dash-ring-label">
              <span className="dash-ring-num">{taskStats.pct}%</span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="dash-stats">
          <div className="dash-stat">
            <div className="dash-stat-icon dash-stat-icon--orange">
              <ClipboardCheck size={18} strokeWidth={2} />
            </div>
            <div className="dash-stat-info">
              <span className="dash-stat-num">{taskStats.active}</span>
              <span className="dash-stat-label">{t('home.stats.active')}</span>
            </div>
          </div>

          <div className="dash-stat">
            <div className="dash-stat-icon dash-stat-icon--green">
              <CheckCircle size={18} strokeWidth={2} />
            </div>
            <div className="dash-stat-info">
              <span className="dash-stat-num">{taskStats.completed}</span>
              <span className="dash-stat-label">{t('home.stats.completed')}</span>
            </div>
          </div>

          <div className="dash-stat">
            <div className="dash-stat-icon dash-stat-icon--red">
              <DangerTriangle size={18} strokeWidth={2} />
            </div>
            <div className="dash-stat-info">
              <span className="dash-stat-num">{taskStats.overdue}</span>
              <span className="dash-stat-label">{t('home.stats.overdue')}</span>
            </div>
          </div>

          <div className="dash-stat">
            <div className="dash-stat-icon dash-stat-icon--blue">
              <Lock size={18} strokeWidth={2} />
            </div>
            <div className="dash-stat-info">
              <span className="dash-stat-num">{taskStats.dueToday}</span>
              <span className="dash-stat-label">{t('common.today')}</span>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="dash-bottom">
          {habitStats.total > 0 && (
            <button className="dash-bottom-item" onClick={() => navigate('/app/habits')}>
              <Fire size={16} strokeWidth={2.2} className="dash-bottom-icon dash-bottom-icon--fire" />
              <span className="dash-bottom-text">
                {habitStats.todayDone}/{habitStats.todayTotal} {t('home.stats.habitsToday')}
              </span>
              {habitStats.bestStreak > 0 && (
                <span className="dash-bottom-streak">{habitStats.bestStreak}d {t('home.stats.streak')}</span>
              )}
            </button>
          )}
          {projectStats.totalPt > 0 && (
            <button className="dash-bottom-item" onClick={() => navigate('/app/projects')}>
              <Folder size={16} strokeWidth={2.2} className="dash-bottom-icon dash-bottom-icon--blue" />
              <span className="dash-bottom-text">
                {projectStats.active} {t('home.stats.activeProjects')}
              </span>
              {projectStats.totalPt > 0 && (
                <span className="dash-bottom-streak">{projectStats.donePt}/{projectStats.totalPt} {t('common.tasks')}</span>
              )}
            </button>
          )}
          {habitStats.total === 0 && projectStats.donePt === 0 && projectStats.active === 0 && (
            <button className="dash-bottom-item dash-bottom-item--center" onClick={() => navigate('/app/tasks')}>
              <Target size={16} strokeWidth={2.2} className="dash-bottom-icon" />
              <span className="dash-bottom-text">{t('home.motivation.empty')}</span>
              <AltArrowRight size={14} strokeWidth={2.2} className="dash-bottom-icon" />
            </button>
          )}
        </div>
      </div>

      <div className="banner-divider" />

      {/* ── Banners ── */}
      <div className="home-banners">
        <button className="banner-card banner-habits" onClick={() => navigate('/app/habits')}>
          <div className="banner-visual banner-visual-habits">
            <svg className="banner-deco" width="100%" height="100%" viewBox="0 0 200 120" fill="none" preserveAspectRatio="none">
              <circle cx="170" cy="20" r="40" fill="rgba(255,255,255,0.06)" />
              <circle cx="180" cy="90" r="25" fill="rgba(255,255,255,0.04)" />
              <circle cx="30" cy="100" r="35" fill="rgba(255,255,255,0.05)" />
              <rect x="10" y="10" width="6" height="6" rx="1.5" fill="rgba(255,255,255,0.08)" />
              <rect x="160" y="60" width="4" height="4" rx="1" fill="rgba(255,255,255,0.1)" />
              <rect x="90" y="15" width="5" height="5" rx="1" fill="rgba(255,255,255,0.07)" />
            </svg>
            <div className="banner-bubbles">
              <span className="bubble h-bubble-1" />
              <span className="bubble h-bubble-2" />
              <span className="bubble h-bubble-3" />
              <span className="bubble h-bubble-4" />
              <span className="bubble h-bubble-5" />
              <span className="bubble h-bubble-6" />
            </div>
            <div className="banner-icon-big">
              <img src="/icons/habits.svg" alt="" width="44" height="44" />
            </div>
          </div>
          <div className="banner-content">
            <h2 className="banner-title">{t('home.banners.habits.title')}</h2>
            <p className="banner-desc">{t('home.banners.habits.desc')}</p>
            <div className="banner-arrow">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10m0 0L9 4m4 4L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </button>

        <button className="banner-card banner-pomodoro" onClick={() => navigate('/app/pomodoro')}>
          <div className="banner-visual banner-visual-pomodoro">
            <svg className="banner-deco" width="100%" height="100%" viewBox="0 0 200 120" fill="none" preserveAspectRatio="none">
              <circle cx="30" cy="25" r="45" fill="rgba(255,255,255,0.04)" />
              <circle cx="180" cy="80" r="30" fill="rgba(255,255,255,0.05)" />
              <circle cx="90" cy="110" r="25" fill="rgba(255,255,255,0.03)" />
              <rect x="140" y="15" width="4" height="4" rx="1" fill="rgba(255,255,255,0.08)" />
              <rect x="50" y="70" width="3" height="3" rx="0.75" fill="rgba(255,255,255,0.1)" />
              <rect x="170" y="50" width="5" height="5" rx="1.5" fill="rgba(255,255,255,0.06)" />
            </svg>
            <div className="banner-bubbles">
              <span className="bubble p-bubble-1" />
              <span className="bubble p-bubble-2" />
              <span className="bubble p-bubble-3" />
              <span className="bubble p-bubble-4" />
            </div>
            <div className="banner-icon-big">
              <img src="/icons/timer.svg" alt="" width="44" height="44" />
            </div>
          </div>
          <div className="banner-content">
            <h2 className="banner-title">{t('home.banners.pomodoro.title')}</h2>
            <p className="banner-desc">{t('home.banners.pomodoro.desc')}</p>
            <div className="banner-arrow">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10m0 0L9 4m4 4L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </button>

        <button className="banner-card banner-calendar" onClick={() => navigate('/app/calendar')}>
          <div className="banner-visual banner-visual-calendar">
            <svg className="banner-deco" width="100%" height="100%" viewBox="0 0 200 120" fill="none" preserveAspectRatio="none">
              <circle cx="60" cy="15" r="42" fill="rgba(255,255,255,0.04)" />
              <circle cx="170" cy="95" r="32" fill="rgba(255,255,255,0.05)" />
              <circle cx="120" cy="40" r="18" fill="rgba(255,255,255,0.06)" />
              <rect x="10" y="80" width="5" height="5" rx="1" fill="rgba(255,255,255,0.09)" />
              <rect x="90" y="10" width="3" height="3" rx="0.75" fill="rgba(255,255,255,0.08)" />
              <rect x="150" y="55" width="4" height="4" rx="1" fill="rgba(255,255,255,0.07)" />
            </svg>
            <div className="banner-bubbles banner-bubbles-calendar">
              <span className="cal-dot cal-dot-1" />
              <span className="cal-dot cal-dot-2" />
              <span className="cal-dot cal-dot-3" />
              <span className="cal-dot cal-dot-4" />
              <span className="cal-dot cal-dot-5" />
              <span className="cal-dot cal-dot-6" />
              <span className="cal-dot cal-dot-7" />
            </div>
            <div className="banner-icon-big">
              <img src="/icons/calendar.svg" alt="" width="44" height="44" />
            </div>
          </div>
          <div className="banner-content">
            <h2 className="banner-title">{t('home.banners.calendar.title')}</h2>
            <p className="banner-desc">{t('home.banners.calendar.desc')}</p>
            <div className="banner-arrow">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10m0 0L9 4m4 4L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </button>

        <div className="banner-divider" />

        <button className="banner-card banner-templates" onClick={() => navigate('/app/templates')}>
          <div className="banner-visual banner-visual-templates">
            <svg className="banner-deco" width="100%" height="100%" viewBox="0 0 200 120" fill="none" preserveAspectRatio="none">
              <circle cx="170" cy="60" r="50" fill="rgba(255,255,255,0.03)" />
              <circle cx="20" cy="100" r="35" fill="rgba(255,255,255,0.05)" />
              <circle cx="100" cy="20" r="22" fill="rgba(255,255,255,0.04)" />
              <rect x="60" y="80" width="6" height="6" rx="1.5" fill="rgba(255,255,255,0.07)" />
              <rect x="130" y="10" width="3" height="3" rx="0.75" fill="rgba(255,255,255,0.09)" />
              <rect x="180" y="100" width="4" height="4" rx="1" fill="rgba(255,255,255,0.06)" />
            </svg>
            <div className="banner-bubbles">
              <span className="bubble t-bubble-1" />
              <span className="bubble t-bubble-2" />
              <span className="bubble t-bubble-3" />
              <span className="bubble t-bubble-4" />
              <span className="bubble t-bubble-5" />
            </div>
            <div className="banner-icon-big">
              <img src="/icons/templates.svg" alt="" width="44" height="44" />
            </div>
          </div>
          <div className="banner-content">
            <h2 className="banner-title">{t('home.banners.templates.title')}</h2>
            <p className="banner-desc">{t('home.banners.templates.desc')}</p>
            <div className="banner-arrow">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10m0 0L9 4m4 4L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </button>
      </div>
    </>
  );
}
