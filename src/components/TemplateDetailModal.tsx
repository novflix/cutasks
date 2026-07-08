import { useTranslation } from 'react-i18next';
import ArrowLeft from '@solar-icons/react/icons/arrows/ArrowLeft';
import CheckCircle from '@solar-icons/react/icons/ui/CheckCircle';
import type { Template } from '../constants/templates';
import { PROJECT_ICONS } from '../constants/projects';
import { priorityOrder } from '../utils';

interface TemplateDetailModalProps {
  template: Template;
  isClosing: boolean;
  onClose: () => void;
  onCopy?: (template: Template) => void;
}

export default function TemplateDetailModal({ template, isClosing, onClose, onCopy }: TemplateDetailModalProps) {
  const { t } = useTranslation();
  const iconDef = PROJECT_ICONS.find((i) => i.name === template.icon) ?? PROJECT_ICONS[0];
  const Icon = iconDef.icon;
  const taskCount = template.sections.reduce((sum, s) => sum + s.tasks.length, 0);
  const tplKey = `tpl.${template.tplKey}`;

  return (
    <div className={`modal-overlay${isClosing ? ' closing' : ''}`} onClick={onClose}>
      <div className={`modal template-modal${isClosing ? ' closing' : ''}`} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="template-modal-header">
          <button className="btn-icon" onClick={onClose} title={t('common.back')}>
            <ArrowLeft size={22} />
          </button>
          <div className="template-modal-title-wrap">
            <div className="template-modal-icon" style={{ background: `${template.color}15`, color: template.color }}>
              <Icon size={20} strokeWidth={1.8} />
            </div>
            <h2 className="template-modal-title" style={{ color: template.color }}>
              {t(`${tplKey}.name`)}
            </h2>
          </div>
        </div>

        <div className="template-modal-desc">
          <p>{t(`${tplKey}.desc`)}</p>
          <span className="template-modal-count">
            {template.sections.length} {t('tpl.cards.sections')} · {taskCount} {t('tpl.cards.tasks')}
          </span>
        </div>

        {/* Sections */}
        <div className="template-modal-body">
          {template.sections.map((section) => (
            <div key={section.key} className="template-section">
              <div className="template-section-header">
                <h3 className="template-section-name">{t(`${tplKey}.${section.key}`)}</h3>
                <span className="template-section-count">{section.tasks.length}</span>
              </div>
              <div className="template-section-tasks">
                {[...section.tasks]
                  .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
                  .map((task, i) => (
                    <div key={i} className="template-task">
                      <div className="template-task-check" style={{ borderColor: template.color }} />
                      <div className="template-task-body">
                        <span className="template-task-title">{t(`${tplKey}.${task.key}`)}</span>
                        <div className="template-task-tags">
                          <span className={`template-task-priority priority-${task.priority}`}>
                            {t(`common.${task.priority}`)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="template-modal-footer">
          <button
            className="btn btn-primary template-copy-btn"
            style={{ background: template.color }}
            onClick={() => onCopy?.(template)}
          >
            <CheckCircle size={18} />
            {t('templates.copyToProjects')}
          </button>
        </div>
      </div>
    </div>
  );
}
