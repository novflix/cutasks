import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import ArrowLeft from '@solar-icons/react/icons/arrows/ArrowLeft';
import ClipboardCheck from '@solar-icons/react/icons/notes/ClipboardCheck';
import Folder from '@solar-icons/react/icons/folders/Folder';
import Star from '@solar-icons/react/icons/like/Star';
import CheckCircle from '@solar-icons/react/icons/ui/CheckCircle';
import Calendar from '@solar-icons/react/icons/time/Calendar';
import '../styles/notfound.css';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`nf ${visible ? 'nf--visible' : ''}`}>
      <div className="nf-orbs">
        <div className="nf-orb nf-orb-1" />
        <div className="nf-orb nf-orb-2" />
        <div className="nf-orb nf-orb-3" />
      </div>

      <div className="nf-content">
        <div className="nf-float-icons">
          <span className="nf-icon nf-icon-1"><ClipboardCheck size={22} strokeWidth={1.6} /></span>
          <span className="nf-icon nf-icon-2"><Folder size={20} strokeWidth={1.6} /></span>
          <span className="nf-icon nf-icon-3"><Star size={18} strokeWidth={1.6} /></span>
          <span className="nf-icon nf-icon-4"><CheckCircle size={20} strokeWidth={1.6} /></span>
          <span className="nf-icon nf-icon-5"><Calendar size={18} strokeWidth={1.6} /></span>
        </div>

        <div className="nf-number">
          <span className="nf-digit">4</span>
          <div className="nf-lost-task">
            <div className="nf-task-card">
              <div className="nf-task-check" />
              <div className="nf-task-lines">
                <div className="nf-task-line nf-task-line-1" />
                <div className="nf-task-line nf-task-line-2" />
              </div>
            </div>
          </div>
          <span className="nf-digit">4</span>
        </div>

        <h1 className="nf-title">{t('notFound.title')}</h1>
        <p className="nf-desc">{t('notFound.description')}</p>

        <div className="nf-actions">
          <button className="btn btn-primary nf-btn" onClick={() => navigate('/app/home')}>
            <ArrowLeft size={16} />
            {t('notFound.goBack')}
          </button>
          <button className="btn btn-secondary nf-btn-secondary" onClick={() => navigate(-1)}>
            {t('notFound.previousPage')}
          </button>
        </div>
      </div>

      <div className="nf-ground-tasks">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="nf-ghost-task" style={{ animationDelay: `${i * 0.8}s`, left: `${10 + i * 15}%` }} />
        ))}
      </div>
    </div>
  );
}
