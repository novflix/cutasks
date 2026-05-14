import React, { useEffect, useRef } from 'react';

interface Props {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * ConfirmDialog — shared overlay for any "are you sure?" prompt.
 *
 * Provides:
 *  - same overlay as Modal (fixed inset-0, backdrop blur, z-50)
 *  - close on outside click or Escape
 *  - optional destructive (red) confirm button
 */
export const ConfirmDialog: React.FC<Props> = ({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onCancel(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
      style={{ background: 'rgba(26,22,20,0.35)' }}
    >
      <div
        className="w-full max-w-sm animate-slide-up rounded-2xl p-6 flex flex-col gap-4"
        style={{
          background: 'var(--bg-card)',
          border: '1.5px solid var(--border)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.16)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-1">
          <p className="font-display text-base font-semibold" style={{ color: 'var(--text-main)' }}>
            {title}
          </p>
          <p className="text-sm font-body" style={{ color: 'var(--text-muted)' }}>
            {message}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium font-body transition-all hover:opacity-80 active:scale-95"
            style={{
              background: 'var(--bg-panel)',
              color: 'var(--text-muted)',
              border: '1.5px solid var(--border)',
            }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium font-body transition-all hover:opacity-90 active:scale-95"
            style={
              destructive
                ? { background: '#c45a69', color: '#fff' }
                : { background: 'var(--text-main)', color: 'var(--bg-main)' }
            }
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
