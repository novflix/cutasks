import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from '@solar-icons/react';
import '../styles/documents.css';

export default function TermsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="doc-page">
      <div className="doc-nav">
        <button className="btn-icon" onClick={() => navigate(-1)}>
          <ArrowLeft size={22} />
        </button>
      </div>
      <div className="doc-content">
        <h1 className="doc-title">{t('legal.terms.title')}</h1>
        <p className="doc-updated">{t('legal.lastUpdated')}</p>

        <p>{t('legal.terms.intro')}</p>

        <h2>{t('legal.terms.s1Title')}</h2>
        <p>{t('legal.terms.s1')}</p>

        <h2>{t('legal.terms.s2Title')}</h2>
        <p>{t('legal.terms.s2')}</p>
        <ul>
          <li>{t('legal.terms.s2a')}</li>
          <li>{t('legal.terms.s2b')}</li>
          <li>{t('legal.terms.s2c')}</li>
          <li>{t('legal.terms.s2d')}</li>
          <li>{t('legal.terms.s2e')}</li>
          <li>{t('legal.terms.s2f')}</li>
          <li>{t('legal.terms.s2g')}</li>
        </ul>

        <h2>{t('legal.terms.s3Title')}</h2>
        <ul>
          <li>{t('legal.terms.s3a')}</li>
          <li>{t('legal.terms.s3b')}</li>
          <li>{t('legal.terms.s3c')}</li>
        </ul>

        <h2>{t('legal.terms.s4Title')}</h2>
        <ul>
          <li>{t('legal.terms.s4a')}</li>
          <li>{t('legal.terms.s4b')}</li>
          <li>{t('legal.terms.s4c')}</li>
        </ul>

        <h2>{t('legal.terms.s5Title')}</h2>
        <p>{t('legal.terms.s5')}</p>
        <ul>
          <li>{t('legal.terms.s5a')}</li>
          <li>{t('legal.terms.s5b')}</li>
          <li>{t('legal.terms.s5c')}</li>
          <li>{t('legal.terms.s5d')}</li>
          <li>{t('legal.terms.s5e')}</li>
          <li>{t('legal.terms.s5f')}</li>
          <li>{t('legal.terms.s5g')}</li>
        </ul>

        <h2>{t('legal.terms.s6Title')}</h2>
        <ul>
          <li>{t('legal.terms.s6a')}</li>
          <li>{t('legal.terms.s6b')}</li>
          <li>{t('legal.terms.s6c')}</li>
          <li>{t('legal.terms.s6d')}</li>
          <li>{t('legal.terms.s6e')}</li>
        </ul>

        <h2>{t('legal.terms.s7Title')}</h2>
        <ul>
          <li>{t('legal.terms.s7a')}</li>
          <li>{t('legal.terms.s7b')}</li>
        </ul>

        <h2>{t('legal.terms.s8Title')}</h2>
        <ul>
          <li>{t('legal.terms.s8a')}</li>
          <li>{t('legal.terms.s8b')}</li>
          <li>{t('legal.terms.s8c')}</li>
        </ul>

        <h2>{t('legal.terms.s9Title')}</h2>
        <ul>
          <li>{t('legal.terms.s9a')}</li>
          <li>{t('legal.terms.s9b')}</li>
          <li>{t('legal.terms.s9c')}</li>
        </ul>

        <h2>{t('legal.terms.s10Title')}</h2>
        <ul>
          <li>{t('legal.terms.s10a')}</li>
          <li>{t('legal.terms.s10b')}</li>
          <li>{t('legal.terms.s10c')}</li>
        </ul>

        <h2>{t('legal.terms.s11Title')}</h2>
        <p>{t('legal.terms.s11')}</p>
        <ul>
          <li>{t('legal.terms.s11a')}</li>
          <li>{t('legal.terms.s11b')}</li>
          <li>{t('legal.terms.s11c')}</li>
        </ul>

        <h2>{t('legal.terms.s12Title')}</h2>
        <ul>
          <li>{t('legal.terms.s12a')}</li>
          <li>{t('legal.terms.s12b')}</li>
          <li>{t('legal.terms.s12c')}</li>
        </ul>

        <h2>{t('legal.terms.s13Title')}</h2>
        <ul>
          <li>{t('legal.terms.s13a')}</li>
          <li>{t('legal.terms.s13b')}</li>
          <li>{t('legal.terms.s13c')}</li>
        </ul>

        <h2>{t('legal.terms.s14Title')}</h2>
        <p>{t('legal.terms.s14')}</p>

        <h2>{t('legal.terms.s15Title')}</h2>
        <ul>
          <li>{t('legal.terms.s15a')}</li>
          <li>{t('legal.terms.s15b')}</li>
        </ul>

        <h2>{t('legal.terms.s16Title')}</h2>
        <p>{t('legal.terms.s16')}</p>

        <h2>{t('legal.terms.s17Title')}</h2>
        <p>{t('legal.terms.s17')}</p>

        <h2>{t('legal.terms.s18Title')}</h2>
        <p>{t('legal.terms.s18a')}</p>
        <p>{t('legal.terms.s18b')}</p>

        <p className="doc-closing">{t('legal.terms.closing')}</p>
      </div>
    </div>
  );
}
