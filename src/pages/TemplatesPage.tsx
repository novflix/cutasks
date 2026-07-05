import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from '@solar-icons/react';
import { TEMPLATES, TEMPLATE_CATEGORIES, type Template } from '../constants/templates';
import { PROJECT_ICONS } from '../constants/projects';
import TemplateDetailModal from '../components/TemplateDetailModal';
import '../styles/templates.css';

interface TemplatesPageProps {
  onCopyTemplate?: (template: Template) => void;
}

export default function TemplatesPage({ onCopyTemplate }: TemplatesPageProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [modalClosing, setModalClosing] = useState(false);

  function openTemplate(template: Template) {
    setSelectedTemplate(template);
    setModalClosing(false);
  }

  function closeTemplate() {
    setModalClosing(true);
    setTimeout(() => {
      setSelectedTemplate(null);
      setModalClosing(false);
    }, 200);
  }

  const templatesByCategory = TEMPLATE_CATEGORIES.map((cat) => ({
    ...cat,
    label: t(`tpl.categories.${cat.key}`),
    items: TEMPLATES.filter((tpl) => tpl.category === cat.key),
  })).filter((cat) => cat.items.length > 0);

  return (
    <>
      <div className="page-hero">
        <button className="btn-icon project-back-btn" onClick={() => navigate('/app/home')}>
          <ArrowLeft size={22} />
        </button>
        <h1 className="page-hero-title">{t('home.banners.templates.title')}</h1>
      </div>
      <main className="main">
        <div className="templates-page">
          {templatesByCategory.map((cat) => (
            <div key={cat.key} className="templates-category">
              <h2 className="templates-category-title">{cat.label}</h2>
              <div className="templates-grid">
                {cat.items.map((template) => {
                  const iconDef = PROJECT_ICONS.find((i) => i.name === template.icon) ?? PROJECT_ICONS[0];
                  const Icon = iconDef.icon;
                  const taskCount = template.sections.reduce((sum, s) => sum + s.tasks.length, 0);
                  return (
                    <button
                      key={template.id}
                      className="template-card"
                      style={{ '--template-color': template.color } as React.CSSProperties}
                      onClick={() => openTemplate(template)}
                    >
                      <div className="template-card-icon" style={{ background: `${template.color}15`, color: template.color }}>
                        <Icon size={22} strokeWidth={1.8} />
                      </div>
                      <div className="template-card-content">
                        <h3 className="template-card-name" style={{ color: template.color }}>
                          {t(`tpl.${template.tplKey}.name`)}
                        </h3>
                        <p className="template-card-desc">
                          {t(`tpl.${template.tplKey}.desc`)}
                        </p>
                        <div className="template-card-meta">
                          <span className="template-card-sections">
                            {template.sections.length} {t('tpl.cards.sections')}
                          </span>
                          <span className="template-card-dot">·</span>
                          <span className="template-card-tasks">
                            {taskCount} {t('tpl.cards.tasks')}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </main>

      {(selectedTemplate || modalClosing) && (
        <TemplateDetailModal
          template={selectedTemplate!}
          isClosing={modalClosing}
          onClose={closeTemplate}
          onCopy={(tpl) => {
            closeTemplate();
            onCopyTemplate?.(tpl);
          }}
        />
      )}
    </>
  );
}
