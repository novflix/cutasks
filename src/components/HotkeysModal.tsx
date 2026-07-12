import { useState, useEffect, useRef } from 'react';
import CloseCircle from '@solar-icons/react/icons/ui/CloseCircle';
import { useTranslation } from 'react-i18next';
import { DEFAULT_HOTKEYS, getDefaultHotkeyConfig, comboToDisplay, type HotkeyAction, type HotkeyCombo } from '../constants/hotkeys';
import { useTaskContext } from '../hooks/useTaskContext';

interface HotkeysModalProps {
  onClose: () => void;
  isClosing: boolean;
}

export default function HotkeysModal({ onClose, isClosing }: HotkeysModalProps) {
  const { t } = useTranslation();
  const { hotkeyConfig, setHotkeyConfig } = useTaskContext();
  const [recordingAction, setRecordingAction] = useState<HotkeyAction | null>(null);
  const recordingRef = useRef<HotkeyAction | null>(null);

  function startRecording(action: HotkeyAction) {
    setRecordingAction(action);
    recordingRef.current = action;
  }

  function cancelRecording() {
    setRecordingAction(null);
    recordingRef.current = null;
  }

  useEffect(() => {
    if (!recordingAction) return;

    function handleKeyDown(e: KeyboardEvent) {
      e.preventDefault();
      e.stopPropagation();

      if (e.key === 'Escape') {
        cancelRecording();
        return;
      }

      if (e.code === 'AltLeft' || e.code === 'AltRight' || e.code === 'ControlLeft' || e.code === 'ControlRight' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') return;

      const action = recordingRef.current;
      if (!action) return;

      const combo: HotkeyCombo = {
        code: e.code,
        alt: e.altKey,
        ctrl: e.ctrlKey || e.metaKey,
        shift: e.shiftKey,
      };

      setHotkeyConfig({ ...hotkeyConfig, [action]: combo });
      setRecordingAction(null);
      recordingRef.current = null;
    }

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [recordingAction, hotkeyConfig, setHotkeyConfig]);

  function handleResetHotkeys() {
    setHotkeyConfig(getDefaultHotkeyConfig());
  }

  return (
    <div className={`modal-overlay${isClosing ? ' closing' : ''}`} onClick={onClose}>
      <div className={`modal hotkeys-modal${isClosing ? ' closing' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{t('hotkeys.title')}</h2>
          <button className="btn-icon" onClick={onClose}>
            <CloseCircle size={22} />
          </button>
        </div>
        <div className="modal-body hotkeys-modal-body">
          <div className="hotkey-list">
            {DEFAULT_HOTKEYS.map((item) => {
              const combo = hotkeyConfig[item.id];
              const isRecording = recordingAction === item.id;
              return (
                <div key={item.id} className="hotkey-row">
                  <span className="hotkey-label">{t(item.labelKey)}</span>
                  <button
                    className={`hotkey-btn${isRecording ? ' recording' : ''}`}
                    onClick={() => isRecording ? cancelRecording() : startRecording(item.id)}
                  >
                    {isRecording ? t('hotkeys.pressKey') : comboToDisplay(combo)}
                  </button>
                </div>
              );
            })}
          </div>
          <div className="hotkey-footer">
            <button className="hotkey-reset-btn" onClick={handleResetHotkeys}>
              {t('hotkeys.resetDefaults')}
            </button>
            <span className="hotkey-hint">{t('hotkeys.hint')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
