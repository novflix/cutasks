import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import LanguagePicker from '../components/LanguagePicker';
import {
  ClipboardCheck,
  Folder,
  SettingsMinimalistic,
  HomeSmile,
  ClockCircle,
  ListCheck,
  FolderOpen,
  BookBookmark,
  ClockSquare,
  CalendarSearch,
  Shield,
  Palette,
  ArrowRight,
  CheckCircle,
  Lightning,
  WindowFrame,
  ArrowDown,
} from '@solar-icons/react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const deepRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const scrollTo = useCallback((el: HTMLElement | null) => {
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.l-reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="lp">
      {/* ── Navigation ── */}
      <nav className={`lp-nav${scrolled ? ' scrolled' : ''}`}>
        <div className="lp-nav-inner">
          <div className="lp-nav-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ cursor: 'pointer' }}>
            <img src="/logo.svg" alt="CuTasks" className="lp-nav-logo" />
          </div>
          <div className="lp-nav-actions">
            <LanguagePicker compact />
            {user ? (
              <button className="lp-nav-btn" onClick={() => navigate('/app/home')}>{t('landing.openApp')}</button>
            ) : (
              <>
                <button className="lp-nav-link" onClick={() => navigate('/auth')}>{t('landing.signIn')}</button>
                <button className="lp-nav-btn" onClick={() => navigate('/auth')}>{t('landing.getStarted')}</button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="lp-hero" ref={heroRef}>
        <div className="lp-hero-orbs">
          <div className="lp-orb lp-orb-1" />
          <div className="lp-orb lp-orb-2" />
          <div className="lp-orb lp-orb-3" />
        </div>
        <div className="lp-hero-content">
          <div className="lp-hero-badge">
            <Lightning size={13} />
            <span>{t('landing.freeForever')}</span>
          </div>
          <h1 className="lp-hero-title">
            <span className="lp-hero-gradient">{t('landing.heroTitle')}</span><br />
            {t('landing.heroSubtitle')}
          </h1>
          <p className="lp-hero-desc">
            {t('landing.heroDesc')}
          </p>
          <div className="lp-hero-actions">
            <button className="lp-btn lp-btn-primary" onClick={() => navigate(user ? '/app/home' : '/auth')}>
              <span>{user ? t('landing.openApp') : t('landing.startForFree')}</span>
              <ArrowRight size={16} />
            </button>
            <button className="lp-btn lp-btn-ghost" onClick={() => scrollTo(featuresRef.current)}>
              {t('landing.seeFeatures')}
              <ArrowDown size={14} />
            </button>
          </div>
          <div className="lp-hero-proof">
            <div className="lp-hero-proof-avatars">
              <div className="lp-hero-avatar" style={{ background: '#ed9b6d' }}>A</div>
              <div className="lp-hero-avatar" style={{ background: '#66bb6a' }}>M</div>
              <div className="lp-hero-avatar" style={{ background: '#64b5f6' }}>K</div>
              <div className="lp-hero-avatar" style={{ background: '#ba68c8' }}>R</div>
            </div>
            <span className="lp-hero-proof-text">{t('landing.proofText')}</span>
          </div>
        </div>
        <div className="lp-hero-mockup">
          <div className="lp-mockup">
            {/* ── Sidebar (matches real app sidebar.css) ── */}
            <div className="lp-mockup-sidebar">
              <div className="lp-mockup-sidebar-logo">
                <img src="/logo-mini.svg" alt="" />
              </div>
              <div className="lp-mockup-sidebar-divider" />
              <div className="lp-mockup-sidebar-nav">
                {[
                  { icon: <HomeSmile size={20} strokeWidth={1.8} />, label: t('landing.mockup.home'), active: false },
                  { icon: <ClipboardCheck size={20} strokeWidth={1.8} />, label: t('landing.mockup.tasks'), active: true },
                  { icon: <Folder size={20} strokeWidth={1.8} />, label: t('landing.mockup.projects'), active: false },
                  { icon: <SettingsMinimalistic size={20} strokeWidth={1.8} />, label: t('landing.mockup.settings'), active: false },
                ].map((item) => (
                  <div key={item.label} className={`lp-mockup-sidebar-btn${item.active ? ' active' : ''}`}>
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Main content (matches real app layout) ── */}
            <div className="lp-mockup-main">
              {/* Page hero */}
              <div className="lp-mockup-page-hero">
                <h1>{t('tasks.title')}</h1>
              </div>

              {/* Stats header */}
              <div className="lp-mockup-header">
                <div className="lp-mockup-stats">
                  <span className="lp-mockup-stat">
                    <span className="lp-mockup-stat-dot" style={{ background: '#777' }} /> <strong>12</strong> {t('landing.mockup.total')}
                  </span>
                  <span className="lp-mockup-stat lp-mockup-stat-active">
                    <span className="lp-mockup-stat-dot" style={{ background: '#ed9b6d', color: '#ed9b6d' }} /> <strong>8</strong> {t('landing.mockup.active')}
                  </span>
                  <span className="lp-mockup-stat lp-mockup-stat-done">
                    <span className="lp-mockup-stat-dot" style={{ background: '#66bb6a', color: '#66bb6a' }} /> <strong>4</strong> {t('landing.mockup.done')}
                  </span>
                </div>
                <button className="lp-mockup-btn-add">+ {t('landing.mockup.newTask')}</button>
              </div>

              {/* Search + filters */}
              <div className="lp-mockup-toolbar">
                <div className="lp-mockup-search">
                  <svg className="lp-mockup-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                  <span className="lp-mockup-search-placeholder">{t('landing.mockup.searchPlaceholder')}</span>
                </div>
                <div className="lp-mockup-filters">
                  <span className="lp-mockup-filter active">{t('landing.mockup.all')}</span>
                   <span className="lp-mockup-filter">{t('common.active')}</span>
                   <span className="lp-mockup-filter">{t('common.done')}</span>
                </div>
              </div>

              {/* Task list */}
              <div className="lp-mockup-task-list">
                {[
                  { title: t('landing.mockup.task1Title'), priority: 'high', desc: t('landing.mockup.task1Desc'), tags: ['design', 'ui'], deadline: 'Jun 25' },
                  { title: t('landing.mockup.task2Title'), priority: 'medium', desc: t('landing.mockup.task2Desc'), tags: ['docs'], deadline: '' },
                  { title: t('landing.mockup.task3Title'), priority: 'low', desc: '', tags: ['bugfix'], deadline: 'Jun 22' },
                  { title: t('landing.mockup.task4Title'), priority: 'medium', desc: t('landing.mockup.task4Desc'), tags: [], deadline: '' },
                ].map((task, i) => (
                  <div key={i} className={`lp-mockup-task task-stripe-${task.priority}`} style={{ animationDelay: `${i * 0.1}s` }}>
                    <div className="lp-mockup-task-check" />
                    <div className="lp-mockup-task-body">
                      <span className="lp-mockup-task-title">{task.title}</span>
                      {task.desc && <span className="lp-mockup-task-desc">{task.desc}</span>}
                      <div className="lp-mockup-task-tags">
                        <span className={`lp-mockup-badge lp-mockup-badge-${task.priority}`}>{task.priority}</span>
                        {task.deadline && (
                          <span className="lp-mockup-badge lp-mockup-deadline">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                              <line x1="16" x2="16" y1="2" y2="6" />
                              <line x1="8" x2="8" y1="2" y2="6" />
                              <line x1="3" x2="21" y1="10" y2="10" />
                            </svg>
                            {task.deadline}
                          </span>
                        )}
                        {task.tags.map((tag) => (
                          <span key={tag} className="lp-mockup-user-tag">#{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="lp-mockup-glow" />
        </div>
      </section>

      {/* ── Feature highlights ── */}
      <section className="lp-features" ref={featuresRef}>
        <div className="lp-features-inner">
          <span className="lp-section-label l-reveal">{t('landing.featuresTitle')}</span>
          <h2 className="lp-section-title l-reveal">
            {t('landing.featuresSubtitle1')}<br />
            {t('landing.featuresSubtitle2')}
          </h2>
          <div className="lp-features-grid">
            {[
              { icon: <ListCheck size={24} />, title: t('landing.feature1Title'), desc: t('landing.feature1Desc') },
              { icon: <FolderOpen size={24} />, title: t('landing.feature2Title'), desc: t('landing.feature2Desc') },
              { icon: <BookBookmark size={24} />, title: t('landing.feature3Title'), desc: t('landing.feature3Desc') },
              { icon: <ClockSquare size={24} />, title: t('landing.feature4Title'), desc: t('landing.feature4Desc') },
              { icon: <CalendarSearch size={24} />, title: t('landing.feature5Title'), desc: t('landing.feature5Desc') },
              { icon: <Shield size={24} />, title: t('landing.feature6Title'), desc: t('landing.feature6Desc') },
            ].map((f, i) => (
              <div key={i} className="lp-feature-card l-reveal" style={{ transitionDelay: `${i * 0.06}s` }}>
                <div className="lp-feature-icon">{f.icon}</div>
                <h3 className="lp-feature-title">{f.title}</h3>
                <p className="lp-feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Deep-dive sections ── */}
      <section className="lp-deep" ref={deepRef}>
        {/* ── Tasks ── */}
        <div className="lp-deep-section">
          <div className="lp-deep-content l-reveal">
            <span className="lp-section-label">{t('landing.tasksSection')}</span>
            <h2 className="lp-deep-title">{t('landing.tasksTitle')}</h2>
            <ul className="lp-deep-points">
              {(t('landing.tasksPoints', { returnObjects: true }) as string[]).map((p, j) => (
                <li key={j} className="lp-deep-point l-reveal" style={{ transitionDelay: `${j * 0.05}s` }}>
                  <CheckCircle size={17} style={{ color: '#ed9b6d', flexShrink: 0 }} />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="lp-deep-visual l-reveal" style={{ transitionDelay: '0.15s' }}>
            <div className="lp-deep-mockup">
              {/* toolbar-like search + filters */}
              <div className="lp-demo-toolbar">
                <div className="lp-demo-search-row">
                  <svg className="lp-demo-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                  <div className="lp-demo-search-input" />
                </div>
                <div className="lp-demo-filter-row">
                  <span className="lp-demo-pill active">All</span>
                   <span className="lp-demo-pill">{t('common.active')}</span>
                   <span className="lp-demo-pill">{t('common.done')}</span>
                </div>
              </div>
              {/* task items */}
              <div className="lp-demo-task">
                <div className="lp-demo-check" />
                <div className="lp-demo-task-body">
                  <span className="lp-demo-task-title">{t('landing.mockup.task1Title')}</span>
                  <div className="lp-demo-task-meta">
                    <span className="lp-demo-prio high">high</span>
                    <span className="lp-demo-dl">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
                      Jun 25
                    </span>
                    <span className="lp-demo-utag">#design</span>
                    <span className="lp-demo-utag">#ui</span>
                  </div>
                </div>
              </div>
              <div className="lp-demo-task">
                <div className="lp-demo-check" />
                <div className="lp-demo-task-body">
                  <span className="lp-demo-task-title">{t('landing.mockup.task2Title')}</span>
                  <div className="lp-demo-task-meta">
                    <span className="lp-demo-prio medium">medium</span>
                    <span className="lp-demo-utag">#docs</span>
                  </div>
                </div>
              </div>
              <div className="lp-demo-task done">
                <div className="lp-demo-check checked">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width="11" height="11"><polyline points="5 12 10 17 19 7" /></svg>
                </div>
                <div className="lp-demo-task-body">
                  <span className="lp-demo-task-title">{t('landing.mockup.task3Title')}</span>
                  <div className="lp-demo-task-meta">
                    <span className="lp-demo-prio low">low</span>
                    <span className="lp-demo-utag">#bugfix</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Projects ── */}
        <div className="lp-deep-section">
          <div className="lp-deep-content l-reveal">
            <span className="lp-section-label">{t('landing.projectsSection')}</span>
            <h2 className="lp-deep-title">{t('landing.projectsTitle')}</h2>
            <ul className="lp-deep-points">
              {(t('landing.projectsPoints', { returnObjects: true }) as string[]).map((p, j) => (
                <li key={j} className="lp-deep-point l-reveal" style={{ transitionDelay: `${j * 0.05}s` }}>
                  <CheckCircle size={17} style={{ color: '#64b5f6', flexShrink: 0 }} />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="lp-deep-visual l-reveal" style={{ transitionDelay: '0.15s' }}>
            <div className="lp-deep-mockup">
              <div className="lp-demo-project-card">
                <div className="lp-demo-proj-icon" style={{ background: 'rgba(237,155,109,0.12)', color: '#ed9b6d' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" /></svg>
                </div>
                <div className="lp-demo-proj-info">
                  <span className="lp-demo-proj-name">{t('landing.mockup.project1Name')}</span>
                  <div className="lp-demo-proj-bar"><div className="lp-demo-proj-fill" style={{ width: '65%', background: '#ed9b6d' }} /></div>
                  <span className="lp-demo-proj-stat">{t('landing.mockup.project1Tasks')}</span>
                </div>
                <span className="lp-demo-proj-status active">{t('landing.mockup.project1Status')}</span>
              </div>
              <div className="lp-demo-project-card">
                <div className="lp-demo-proj-icon" style={{ background: 'rgba(102,187,106,0.12)', color: '#66bb6a' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" /></svg>
                </div>
                <div className="lp-demo-proj-info">
                  <span className="lp-demo-proj-name">{t('landing.mockup.project2Name')}</span>
                  <div className="lp-demo-proj-bar"><div className="lp-demo-proj-fill" style={{ width: '100%', background: '#66bb6a' }} /></div>
                  <span className="lp-demo-proj-stat">{t('landing.mockup.project2Tasks')}</span>
                </div>
                <span className="lp-demo-proj-status done">{t('landing.mockup.project2Status')}</span>
              </div>
              <div className="lp-demo-project-card">
                <div className="lp-demo-proj-icon" style={{ background: 'rgba(100,181,246,0.12)', color: '#64b5f6' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" /></svg>
                </div>
                <div className="lp-demo-proj-info">
                  <span className="lp-demo-proj-name">{t('landing.mockup.project3Name')}</span>
                  <div className="lp-demo-proj-bar"><div className="lp-demo-proj-fill" style={{ width: '30%', background: '#64b5f6' }} /></div>
                  <span className="lp-demo-proj-stat">{t('landing.mockup.project3Tasks')}</span>
                </div>
                <span className="lp-demo-proj-status paused">{t('landing.mockup.project3Status')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Habits ── */}
        <div className="lp-deep-section">
          <div className="lp-deep-content l-reveal">
            <span className="lp-section-label">{t('landing.habitsSection')}</span>
            <h2 className="lp-deep-title">{t('landing.habitsTitle')}</h2>
            <ul className="lp-deep-points">
              {(t('landing.habitsPoints', { returnObjects: true }) as string[]).map((p, j) => (
                <li key={j} className="lp-deep-point l-reveal" style={{ transitionDelay: `${j * 0.05}s` }}>
                  <CheckCircle size={17} style={{ color: '#66bb6a', flexShrink: 0 }} />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="lp-deep-visual l-reveal" style={{ transitionDelay: '0.15s' }}>
            <div className="lp-deep-mockup">
              {/* week calendar */}
              <div className="lp-demo-habits-week">
                {[
                  { day: 'Mon', num: 16, done: true },
                  { day: 'Tue', num: 17, done: true },
                  { day: 'Wed', num: 18, done: true },
                  { day: 'Thu', num: 19, done: true },
                  { day: 'Fri', num: 20, done: true },
                  { day: 'Sat', num: 21, today: true },
                  { day: 'Sun', num: 22, done: false },
                ].map((d, i) => (
                  <div key={i} className={`lp-demo-hday${d.done ? ' done' : ''}${d.today ? ' today' : ''}`}>
                    <span className="lp-demo-hday-name">{d.day}</span>
                    <div className="lp-demo-hday-pill">
                      <span className="lp-demo-hday-num">{d.num}</span>
                    </div>
                  </div>
                ))}
              </div>
              {/* habit items */}
              <div className="lp-demo-habit-item">
                <div className="lp-demo-hcheck">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><polyline points="5 12 10 17 19 7" /></svg>
                </div>
                <div className="lp-demo-habit-icon" style={{ background: 'rgba(237,155,109,0.12)', color: '#ed9b6d' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" /></svg>
                </div>
                <span className="lp-demo-habit-name">{t('landing.mockup.habit1Name')}</span>
                <div className="lp-demo-habit-streak">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#ff8c42" stroke="none"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" /></svg>
                  <span>12</span>
                </div>
              </div>
              <div className="lp-demo-habit-item">
                <div className="lp-demo-hcheck">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><polyline points="5 12 10 17 19 7" /></svg>
                </div>
                <div className="lp-demo-habit-icon" style={{ background: 'rgba(102,187,106,0.12)', color: '#66bb6a' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
                </div>
                <span className="lp-demo-habit-name">{t('landing.mockup.habit2Name')}</span>
                <div className="lp-demo-habit-streak">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#ff8c42" stroke="none"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" /></svg>
                  <span>5</span>
                </div>
              </div>
              <div className="lp-demo-habit-item">
                <div className="lp-demo-hcheck">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><polyline points="5 12 10 17 19 7" /></svg>
                </div>
                <div className="lp-demo-habit-icon" style={{ background: 'rgba(100,181,246,0.12)', color: '#64b5f6' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                </div>
                <span className="lp-demo-habit-name">{t('landing.mockup.habit3Name')}</span>
                <div className="lp-demo-habit-streak">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#ff8c42" stroke="none"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" /></svg>
                  <span>3</span>
                </div>
              </div>
              <div className="lp-demo-habit-item">
                <div className="lp-demo-hcheck">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><polyline points="5 12 10 17 19 7" /></svg>
                </div>
                <div className="lp-demo-habit-icon" style={{ background: 'rgba(186,104,200,0.12)', color: '#ba68c8' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="m9 12 2 2 4-4" /></svg>
                </div>
                <span className="lp-demo-habit-name">{t('landing.mockup.habit4Name')}</span>
                <div className="lp-demo-habit-streak">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#ff8c42" stroke="none"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" /></svg>
                  <span>8</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Pomodoro ── */}
        <div className="lp-deep-section">
          <div className="lp-deep-content l-reveal">
            <span className="lp-section-label">{t('landing.pomodoroSection')}</span>
            <h2 className="lp-deep-title">{t('landing.pomodoroTitle')}</h2>
            <ul className="lp-deep-points">
              {(t('landing.pomodoroPoints', { returnObjects: true }) as string[]).map((p, j) => (
                <li key={j} className="lp-deep-point l-reveal" style={{ transitionDelay: `${j * 0.05}s` }}>
                  <CheckCircle size={17} style={{ color: '#ba68c8', flexShrink: 0 }} />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="lp-deep-visual l-reveal" style={{ transitionDelay: '0.15s' }}>
            <div className="lp-demo-pomo-container">
              {/* mode tabs */}
              <div className="lp-demo-pomo-tabs">
                <span className="lp-demo-pomo-tab active">{t('pomodoro.focus')}</span>
                <span className="lp-demo-pomo-tab">{t('landing.pomodoroShortBreak')}</span>
                <span className="lp-demo-pomo-tab">{t('landing.pomodoroLongBreak')}</span>
              </div>
              {/* ring */}
              <div className="lp-demo-pomo-ring-wrap">
                <svg className="lp-demo-pomo-ring" viewBox="0 0 220 220">
                  <circle cx="110" cy="110" r="100" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
                  <circle cx="110" cy="110" r="100" fill="none" stroke="#ed9b6d" strokeWidth="8" strokeLinecap="round" strokeDasharray="628" strokeDashoffset="157" style={{ filter: 'drop-shadow(0 0 8px rgba(237,155,109,0.4))' }} />
                </svg>
                <div className="lp-demo-pomo-display">
                  <span className="lp-demo-pomo-time">18:42</span>
                  <span className="lp-demo-pomo-label">{t('pomodoro.focus')}</span>
                </div>
              </div>
              {/* session dots */}
              <div className="lp-demo-pomo-dots">
                <div className="lp-demo-pdot filled" />
                <div className="lp-demo-pdot filled" />
                <div className="lp-demo-pdot filled" />
                <div className="lp-demo-pdot" />
                <span className="lp-demo-pomo-count">3 / 4</span>
              </div>
              {/* controls */}
              <div className="lp-demo-pomo-controls">
                <div className="lp-demo-pctrl secondary">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
                </div>
                <div className="lp-demo-pctrl main">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="6 3 20 12 6 21" /></svg>
                </div>
                <div className="lp-demo-pctrl secondary">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 4 15 12 5 20" /><line x1="19" x2="19" y1="5" y2="19" /></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Why CuTasks ── */}
      <section className="lp-why">
        <div className="lp-why-inner">
          <span className="lp-section-label l-reveal">{t('landing.whyTitle')}</span>
          <h2 className="lp-section-title l-reveal">{t('landing.whySubtitle')}</h2>
          <div className="lp-why-grid">
            {[
              { icon: <WindowFrame size={22} />, title: t('landing.why1Title'), desc: t('landing.why1Desc') },
              { icon: <Palette size={22} />, title: t('landing.why2Title'), desc: t('landing.why2Desc') },
              { icon: <ClockCircle size={22} />, title: t('landing.why3Title'), desc: t('landing.why3Desc') },
              { icon: <Shield size={22} />, title: t('landing.why4Title'), desc: t('landing.why4Desc') },
            ].map((item, i) => (
              <div key={i} className="lp-why-card l-reveal" style={{ transitionDelay: `${i * 0.08}s` }}>
                <div className="lp-why-icon">{item.icon}</div>
                <h3 className="lp-why-title">{item.title}</h3>
                <p className="lp-why-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="lp-stats" ref={statsRef}>
        <div className="lp-stats-inner">
            {[
              { value: '6', label: t('landing.stat1Label') },
              { value: '3', label: t('landing.stat2Label') },
              { value: '100%', label: t('landing.stat3Label') },
              { value: '0', label: t('landing.stat4Label') },
            ].map((s, i) => (
            <div key={i} className="lp-stat l-reveal" style={{ transitionDelay: `${i * 0.08}s` }}>
              <span className="lp-stat-value">{s.value}</span>
              <span className="lp-stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="lp-cta" ref={ctaRef}>
        <div className="lp-cta-inner l-reveal">
          <h2 className="lp-cta-title">{t('landing.ctaTitle')}</h2>
          <p className="lp-cta-desc">
            {t('landing.ctaDesc')}
          </p>
          <button className="lp-btn lp-btn-primary lp-btn-lg" onClick={() => navigate(user ? '/app/home' : '/auth')}>
            <span>{user ? t('landing.openApp') : t('landing.ctaButton')}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-brand">
            <img src="/logo.svg" alt="CuTasks" className="lp-footer-logo" />
          </div>
          <p className="lp-footer-copy">&copy; {new Date().getFullYear()} {t('landing.footer')}</p>
          <div className="lp-footer-legal">
            <a href="/terms" target="_blank" rel="noopener noreferrer">{t('legal.termsShort')}</a>
            <span className="lp-footer-legal-dot">·</span>
            <a href="/privacy" target="_blank" rel="noopener noreferrer">{t('legal.privacyShort')}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
