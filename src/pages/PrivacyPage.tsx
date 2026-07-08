import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ArrowLeft from '@solar-icons/react/icons/arrows/ArrowLeft';
import LanguagePicker from '../components/LanguagePicker';
import '../styles/documents.css';

export default function PrivacyPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="doc-page">
      <div className="doc-nav">
        <button className="btn-icon" onClick={() => navigate(-1)}>
          <ArrowLeft size={22} />
        </button>
        <LanguagePicker compact />
      </div>
      <div className="doc-content">
        <h1 className="doc-title">{t('legal.privacy.title')}</h1>
        <p className="doc-updated">{t('legal.lastUpdated')}</p>

        <p>{t('legal.privacy.intro')}</p>

        <h2>{t('legal.privacy.s1Title')}</h2>
        <h3>{t('legal.privacy.s1aTitle')}</h3>
        <p>{t('legal.privacy.s1a')}</p>
        <ul>
          <li>{t('legal.privacy.s1a1')}</li>
          <li>{t('legal.privacy.s1a2')}</li>
          <li>{t('legal.privacy.s1a3')}</li>
        </ul>

        <h3>{t('legal.privacy.s1bTitle')}</h3>
        <p>{t('legal.privacy.s1b')}</p>
        <ul>
          <li>{t('legal.privacy.s1b1')}</li>
          <li>{t('legal.privacy.s1b2')}</li>
          <li>{t('legal.privacy.s1b3')}</li>
          <li>{t('legal.privacy.s1b4')}</li>
          <li>{t('legal.privacy.s1b5')}</li>
          <li>{t('legal.privacy.s1b6')}</li>
        </ul>

        <h3>{t('legal.privacy.s1cTitle')}</h3>
        <p>{t('legal.privacy.s1c')}</p>
        <ul>
          <li>{t('legal.privacy.s1c1')}</li>
          <li>{t('legal.privacy.s1c2')}</li>
          <li>{t('legal.privacy.s1c3')}</li>
        </ul>

        <h3>{t('legal.privacy.s1dTitle')}</h3>
        <p>{t('legal.privacy.s1d')}</p>
        <ul>
          <li>{t('legal.privacy.s1d1')}</li>
          <li>{t('legal.privacy.s1d2')}</li>
          <li>{t('legal.privacy.s1d3')}</li>
        </ul>

        <h2>{t('legal.privacy.s2Title')}</h2>
        <h3>{t('legal.privacy.s2aTitle')}</h3>
        <ul>
          <li>{t('legal.privacy.s2a1')}</li>
          <li>{t('legal.privacy.s2a2')}</li>
          <li>{t('legal.privacy.s2a3')}</li>
          <li>{t('legal.privacy.s2a4')}</li>
        </ul>

        <h3>{t('legal.privacy.s2bTitle')}</h3>
        <ul>
          <li>{t('legal.privacy.s2b1')}</li>
          <li>{t('legal.privacy.s2b2')}</li>
          <li>{t('legal.privacy.s2b3')}</li>
        </ul>

        <h3>{t('legal.privacy.s2cTitle')}</h3>
        <ul>
          <li>{t('legal.privacy.s2c1')}</li>
          <li>{t('legal.privacy.s2c2')}</li>
          <li>{t('legal.privacy.s2c3')}</li>
        </ul>

        <h2>{t('legal.privacy.s3Title')}</h2>
        <h3>{t('legal.privacy.s3aTitle')}</h3>
        <ul>
          <li>{t('legal.privacy.s3a1')}</li>
          <li>{t('legal.privacy.s3a2')}</li>
          <li>{t('legal.privacy.s3a3')}</li>
          <li>{t('legal.privacy.s3a4')}</li>
        </ul>

        <h3>{t('legal.privacy.s3bTitle')}</h3>
        <ul>
          <li>{t('legal.privacy.s3b1')}</li>
          <li>{t('legal.privacy.s3b2')}</li>
          <li>{t('legal.privacy.s3b3')}</li>
        </ul>

        <h3>{t('legal.privacy.s3cTitle')}</h3>
        <ul>
          <li>{t('legal.privacy.s3c1')}</li>
          <li>{t('legal.privacy.s3c2')}</li>
          <li>{t('legal.privacy.s3c3')}</li>
          <li>{t('legal.privacy.s3c4')}</li>
        </ul>

        <h3>{t('legal.privacy.s3dTitle')}</h3>
        <ul>
          <li>{t('legal.privacy.s3d1')}</li>
          <li>{t('legal.privacy.s3d2')}</li>
          <li>{t('legal.privacy.s3d3')}</li>
          <li>{t('legal.privacy.s3d4')}</li>
        </ul>

        <h2>{t('legal.privacy.s4Title')}</h2>
        <h3>{t('legal.privacy.s4aTitle')}</h3>
        <p>{t('legal.privacy.s4a')}</p>

        <h3>{t('legal.privacy.s4bTitle')}</h3>
        <ul>
          <li>{t('legal.privacy.s4b1')}</li>
          <li>{t('legal.privacy.s4b2')}</li>
          <li>{t('legal.privacy.s4b3')}</li>
          <li>{t('legal.privacy.s4b4')}</li>
        </ul>

        <h3>{t('legal.privacy.s4cTitle')}</h3>
        <p>{t('legal.privacy.s4c')}</p>

        <h2>{t('legal.privacy.s5Title')}</h2>
        <h3>{t('legal.privacy.s5aTitle')}</h3>
        <ul>
          <li>{t('legal.privacy.s5a1')}</li>
          <li>{t('legal.privacy.s5a2')}</li>
          <li>{t('legal.privacy.s5a3')}</li>
        </ul>

        <h3>{t('legal.privacy.s5bTitle')}</h3>
        <ul>
          <li>{t('legal.privacy.s5b1')}</li>
          <li>{t('legal.privacy.s5b2')}</li>
          <li>{t('legal.privacy.s5b3')}</li>
        </ul>

        <h2>{t('legal.privacy.s6Title')}</h2>
        <h3>{t('legal.privacy.s6aTitle')}</h3>
        <ul>
          <li>{t('legal.privacy.s6a1')}</li>
          <li>{t('legal.privacy.s6a2')}</li>
          <li>{t('legal.privacy.s6a3')}</li>
        </ul>

        <h3>{t('legal.privacy.s6bTitle')}</h3>
        <p>{t('legal.privacy.s6b')}</p>

        <h3>{t('legal.privacy.s6cTitle')}</h3>
        <p>{t('legal.privacy.s6c')}</p>

        <h3>{t('legal.privacy.s6dTitle')}</h3>
        <ul>
          <li>{t('legal.privacy.s6d1')}</li>
          <li>{t('legal.privacy.s6d2')}</li>
          <li>{t('legal.privacy.s6d3')}</li>
        </ul>

        <h3>{t('legal.privacy.s6eTitle')}</h3>
        <p>{t('legal.privacy.s6e')}</p>

        <h2>{t('legal.privacy.s7Title')}</h2>
        <ul>
          <li>{t('legal.privacy.s7a')}</li>
          <li>{t('legal.privacy.s7b')}</li>
          <li>{t('legal.privacy.s7c')}</li>
        </ul>

        <h2>{t('legal.privacy.s8Title')}</h2>
        <ul>
          <li>{t('legal.privacy.s8a')}</li>
          <li>{t('legal.privacy.s8b')}</li>
          <li>{t('legal.privacy.s8c')}</li>
        </ul>

        <h2>{t('legal.privacy.s9Title')}</h2>
        <ul>
          <li>{t('legal.privacy.s9a')}</li>
          <li>{t('legal.privacy.s9b')}</li>
          <li>{t('legal.privacy.s9c')}</li>
        </ul>

        <h2>{t('legal.privacy.s10Title')}</h2>
        <ul>
          <li>{t('legal.privacy.s10a')}</li>
          <li>{t('legal.privacy.s10b')}</li>
          <li>{t('legal.privacy.s10c')}</li>
        </ul>

        <h2>{t('legal.privacy.s11Title')}</h2>
        <h3>{t('legal.privacy.s11aTitle')}</h3>
        <p>{t('legal.privacy.s11a')}</p>

        <h3>{t('legal.privacy.s11bTitle')}</h3>
        <p>{t('legal.privacy.s11b')}</p>

        <h3>{t('legal.privacy.s11cTitle')}</h3>
        <p>{t('legal.privacy.s11c')}</p>

        <h2>{t('legal.privacy.s12Title')}</h2>
        <p>{t('legal.privacy.s12')}</p>

        <h2>{t('legal.privacy.s13Title')}</h2>
        <p>{t('legal.privacy.s13a')}</p>
        <p>{t('legal.privacy.s13b')}</p>
        <p>{t('legal.privacy.s13c')}</p>

        <h2>{t('legal.privacy.s14Title')}</h2>
        <h3>{t('legal.privacy.s14aTitle')}</h3>
        <p>{t('legal.privacy.s14a')}</p>

        <h3>{t('legal.privacy.s14bTitle')}</h3>
        <p>{t('legal.privacy.s14b')}</p>

        <h3>{t('legal.privacy.s14cTitle')}</h3>
        <p>{t('legal.privacy.s14c')}</p>

        <p className="doc-closing">{t('legal.privacy.closing')}</p>
      </div>
    </div>
  );
}
