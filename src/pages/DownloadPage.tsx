import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import ArrowLeft from '@solar-icons/react/icons/arrows/ArrowLeft';
import ArrowRight from '@solar-icons/react/icons/arrows/ArrowRight';
import DownloadMinimalistic from '@solar-icons/react/icons/arrows-action/DownloadMinimalistic';
import CheckCircle from '@solar-icons/react/icons/ui/CheckCircle';
import WindowFrame from '@solar-icons/react/icons/it/WindowFrame';
import { detectPlatform, DOWNLOAD_FILES, type Platform } from '../utils/os';
import '../styles/download.css';

const PLATFORM_META: Record<Platform, { icon: string; color: string }> = {
  windows: { icon: '/icons/windows.svg', color: '#ed9b6d' },
  macos:   { icon: '/icons/apple.svg', color: '#999' },
  linux:   { icon: '/icons/linux.svg', color: '#ffb74d' },
  ios:     { icon: '/icons/apple.svg', color: '#999' },
  android: { icon: '/icons/android.svg', color: '#66bb6a' },
  unknown: { icon: '/icons/windows.svg', color: '#ed9b6d' },
};

const PLATFORM_ORDER: Platform[] = ['windows', 'macos', 'linux', 'ios', 'android'];

export default function DownloadPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const detected = useMemo(() => detectPlatform(), []);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(detected === 'unknown' ? 'windows' : detected);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  const currentFiles = useMemo(
    () => DOWNLOAD_FILES.filter((f) => f.platform === selectedPlatform),
    [selectedPlatform]
  );

  const isCurrentPlatform = selectedPlatform === detected;

  function handleDownload(url: string, filename: string) {
    setDownloading(filename);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => setDownloading(null), 2000);
  }

  return (
    <div className={`dl${mounted ? ' dl--mounted' : ''}`}>
      {/* ── Background ── */}
      <div className="dl-bg">
        <div className="dl-bg-orb dl-bg-orb--1" />
        <div className="dl-bg-orb dl-bg-orb--2" />
        <div className="dl-bg-grid" />
      </div>

      {/* ── Content ── */}
      <div className="dl-inner">
        {/* ── Header ── */}
        <header className="dl-header dl-reveal" style={{ transitionDelay: '0s' }}>
          <button className="dl-back" onClick={() => navigate('/landing')}>
            <ArrowLeft size={16} />
            <span>{t('download.back')}</span>
          </button>
        </header>

        {/* ── Hero ── */}
        <section className="dl-hero">
          <h1 className="dl-hero-title dl-reveal" style={{ transitionDelay: '0.05s' }}>
            {t('download.title')}
          </h1>
          <p className="dl-hero-desc dl-reveal" style={{ transitionDelay: '0.15s' }}>
            {t('download.desc')}
          </p>
        </section>

        {/* ── Platform selector ── */}
        <section className="dl-platforms-section dl-reveal" style={{ transitionDelay: '0.2s' }}>
          <div className="dl-platforms">
            {PLATFORM_ORDER.map((p) => {
              const meta = PLATFORM_META[p];
              const active = selectedPlatform === p;
              const detectedThis = p === detectPlatform();
              return (
                <button
                  key={p}
                  className={`dl-platform${active ? ' active' : ''}`}
                  onClick={() => setSelectedPlatform(p)}
                >
                  <div className="dl-platform-icon" style={active ? { background: `${meta.color}20`, borderColor: `${meta.color}40` } : undefined}>
                    <img src={meta.icon} alt="" width="18" height="18" />
                  </div>
                  <span className="dl-platform-name">{t(`download.platforms.${p}`)}</span>
                  {detectedThis && <span className="dl-platform-dot" />}
                </button>
              );
            })}
          </div>
        </section>

        {/* ── Download area ── */}
        <section className="dl-content dl-reveal" style={{ transitionDelay: '0.3s' }}>
          {currentFiles.length > 0 ? (
            <div className="dl-files">
              {currentFiles.map((file, i) => (
                <div
                  key={file.filename}
                  className="dl-file dl-reveal"
                  style={{ transitionDelay: `${0.35 + i * 0.05}s` }}
                >
                  <div className="dl-file-icon">
                    <DownloadMinimalistic size={18} />
                  </div>
                  <div className="dl-file-info">
                    <span className="dl-file-label">{file.label}</span>
                    <span className="dl-file-name">{file.filename}</span>
                  </div>
                  <button
                    className={`dl-file-btn${downloading === file.filename ? ' done' : ''}`}
                    onClick={() => handleDownload(file.url, file.filename)}
                  >
                    {downloading === file.filename ? (
                      <>
                        <CheckCircle size={14} />
                        <span>{t('download.downloaded')}</span>
                      </>
                    ) : (
                      <>
                        <DownloadMinimalistic size={14} />
                        <span>{t('download.download')}</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="dl-empty dl-reveal" style={{ transitionDelay: '0.35s' }}>
              <WindowFrame size={32} strokeWidth={1.5} />
              <h3>{t('download.comingSoon')}</h3>
              <p>{t('download.comingSoonDesc')}</p>
              {isCurrentPlatform && (
                <button className="dl-empty-link" onClick={() => navigate(user ? '/app/home' : '/auth')}>
                  {t('download.openApp')}
                  <ArrowRight size={13} />
                </button>
              )}
            </div>
          )}
        </section>

        {/* ── Footer ── */}
        <footer className="dl-footer dl-reveal" style={{ transitionDelay: '0.45s' }}>
          <p>{t('download.footerText')}</p>
        </footer>
      </div>
    </div>
  );
}
