import { useRef, useEffect } from 'react';
import { CloseCircle } from '@solar-icons/react';
import { useTranslation } from 'react-i18next';

interface SectionFormModalProps {
  sectionName: string;
  onNameChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  isClosing?: boolean;
  editing?: boolean;
}

export default function SectionFormModal({ sectionName, onNameChange, onSubmit, onClose, isClosing, editing }: SectionFormModalProps) {
  const { t } = useTranslation();
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => nameRef.current?.focus(), 100);
  }, []);

  const overlayClass = `modal-overlay${isClosing ? ' closing' : ''}`;
  const modalClass = `modal form-modal${isClosing ? ' closing' : ''}`;

  return (
    <div className={overlayClass} onClick={onClose}>
      <div className={modalClass} onClick={(e) => e.stopPropagation()}>
        <div className="fm-header">
          <h2 className="fm-title">{editing ? t('modals.sectionForm.edit') : t('modals.sectionForm.create')}</h2>
          <button className="btn-icon fm-close" onClick={onClose}>
            <CloseCircle size={20} />
          </button>
        </div>

        <form id="section-form" onSubmit={onSubmit} className="fm-body">
          <div className="fm-scroll">
          <div className="fm-field">
            <label className="fm-label">{t('modals.sectionForm.name')}</label>
            <input
              ref={nameRef}
              type="text"
              placeholder={t('modals.sectionForm.placeholder')}
              value={sectionName}
              onChange={(e) => onNameChange(e.target.value)}
              className="fm-input"
              maxLength={50}
              required
            />
          </div>
          </div>
        </form>

        <div className="fm-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            {t('common.cancel')}
          </button>
          <button type="submit" className="btn btn-primary" disabled={!sectionName.trim()} form="section-form">
            {editing ? t('common.save') : t('common.create')}
          </button>
        </div>
      </div>
    </div>
  );
}
