import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ClockSquare } from '@solar-icons/react';
import '../styles/templates.css';

export default function TemplatesPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <>
      <div className="page-hero">
        <button className="btn-icon project-back-btn" onClick={() => navigate('/app/home')} aria-label={t('common.back')}>
          <ArrowLeft size={22} />
        </button>
        <h1 className="page-hero-title">{t('home.banners.templates.title')}</h1>
      </div>
      <main className="main">
        <div className="templates-page templates-coming-soon">
          <ClockSquare size={48} strokeWidth={1.5} />
          <h2>{t('tpl.comingSoon.title')}</h2>
          <p>{t('tpl.comingSoon.description')}</p>
        </div>
      </main>
    </>
  );
}
