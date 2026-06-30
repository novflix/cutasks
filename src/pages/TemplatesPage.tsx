import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from '@solar-icons/react';

export default function TemplatesPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <>
      <div className="page-hero">
        <button className="btn-icon project-back-btn" onClick={() => navigate('/app/home')}>
          <ArrowLeft size={22} />
        </button>
        <h1 className="page-hero-title">{t('home.banners.templates.title')}</h1>
      </div>
      <main className="main">
        <div className="empty">
          <p className="empty-title">Coming soon</p>
        </div>
      </main>
    </>
  );
}
