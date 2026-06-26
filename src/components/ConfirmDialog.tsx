import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DangerTriangle } from '@solar-icons/react';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
  danger?: boolean;
}

export default function ConfirmDialog({ title, message, confirmLabel, onConfirm, onClose, danger = true }: ConfirmDialogProps) {
  const { t } = useTranslation();
  const [closing, setClosing] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, []);

  function handleClose() {
    setClosing(true);
    timer.current = setTimeout(onClose, 200);
  }

  function handleConfirm() {
    onConfirm();
  }

  return (
    <div className={`modal-overlay${closing ? ' closing' : ''}`} onClick={handleClose}>
      <div className={`modal confirm-dialog${closing ? ' closing' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="confirm-dialog-icon">
          <DangerTriangle size={28} />
        </div>
        <h2 className="confirm-dialog-title">{title}</h2>
        <p className="confirm-dialog-message">{message}</p>
        <div className="confirm-dialog-actions">
          <button className="btn btn-secondary" onClick={handleClose}>{t('common.cancel')}</button>
          <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={handleConfirm}>
            {confirmLabel || t('common.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
