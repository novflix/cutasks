import React, { useEffect, useRef } from 'react';
import { CloseCircle } from '@solar-icons/react';

interface Props {
  /** Modal title shown in the header */
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  /** Max card width, defaults to 'max-w-md' */
  maxWidth?: string;
}

/**
 * Modal — shared overlay primitive used by all full-screen dialogs.
 *
 * Provides:
 *  - fixed inset-0 overlay with backdrop blur
 *  - consistent z-index (z-50)
 *  - close on outside click
 *  - close on Escape key
 *  - mobile: slides up from bottom; desktop: centered
 *  - header with title + close button
 */
export const Modal: React.FC<Props> = ({ title, onClose, children, maxWidth = 'max-w-md' }) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
      style={{ background: 'rgba(26,22,20,0.35)' }}
    >
      <div
        className={`w-full ${maxWidth} animate-slide-up rounded-3xl shadow-cozy overflow-hidden`}
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 pt-6 pb-4"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <h2 className="font-display text-xl font-semibold" style={{ color: 'var(--text-main)' }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl transition-all hover:scale-105 active:scale-90"
            style={{ color: 'var(--text-muted)' }}
            aria-label="Close"
          >
            <CloseCircle size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};
