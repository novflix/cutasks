import React, { useEffect, useRef, useState } from 'react';
import type { Project, ProjectColor } from '../types';
import { PROJECT_COLORS } from '../types';
<<<<<<< HEAD
import { PROJECT_ICON_OPTIONS, PROJECT_ICON_MAP } from '../projectIcons';
import { CloseCircle } from '@solar-icons/react';
=======
import {
  CloseCircle,
  Rocket,
  Lightbulb,
  Palette,
  Settings,
  Book,
  Target,
  Leaf,
  Bolt,
  Microscope,
  Home2,
  Bag2,
  MusicNote,
  Airplane,
  Waterdrops,
  Heart,
  Star,
  Code,
  Crown,
  Planet,
} from '@solar-icons/react';

// Shared icon registry — also exported for use in other components
export const ICON_OPTIONS: { key: string; Icon: React.FC<{ size?: number }> }[] = [
  { key: 'rocket',      Icon: Rocket },
  { key: 'lightbulb',  Icon: Lightbulb },
  { key: 'palette',    Icon: Palette },
  { key: 'settings',   Icon: Settings },
  { key: 'book',       Icon: Book },
  { key: 'target',     Icon: Target },
  { key: 'leaf',       Icon: Leaf },
  { key: 'bolt',       Icon: Bolt },
  { key: 'microscope', Icon: Microscope },
  { key: 'home',       Icon: Home2 },
  { key: 'bag',        Icon: Bag2 },
  { key: 'music',      Icon: MusicNote },
  { key: 'airplane',   Icon: Airplane },
  { key: 'water',      Icon: Waterdrops },
  { key: 'heart',      Icon: Heart },
  { key: 'star',       Icon: Star },
  { key: 'code',       Icon: Code },
  { key: 'crown',      Icon: Crown },
  { key: 'planet',     Icon: Planet },
];

export const ICON_MAP: Record<string, React.FC<{ size?: number }>> = Object.fromEntries(
  ICON_OPTIONS.map(({ key, Icon }) => [key, Icon]),
);
>>>>>>> d5dae2bc79b8728d6429d3676700c6b0a7160013

const COLOR_KEYS = Object.keys(PROJECT_COLORS) as ProjectColor[];

interface Props {
  mode: 'create' | 'edit';
  initial?: Project;
  onClose: () => void;
  onSubmit: (data: { name: string; description?: string; color: ProjectColor; emoji?: string }) => void;
}

export const ProjectModal: React.FC<Props> = ({ mode, initial, onClose, onSubmit }) => {
  const [name, setName]       = useState(initial?.name ?? '');
  const [desc, setDesc]       = useState(initial?.description ?? '');
  const [color, setColor]     = useState<ProjectColor>(initial?.color ?? 'terracotta');
  const [iconKey, setIconKey] = useState<string | undefined>(initial?.emoji);
  const [shake, setShake]     = useState(false);
  const nameRef    = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setTimeout(() => nameRef.current?.focus(), 100); }, []);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }
    onSubmit({ name, description: desc || undefined, color, emoji: iconKey });
    onClose();
  };

  const selectedColors = PROJECT_COLORS[color];
<<<<<<< HEAD
  const SelectedIcon = iconKey ? PROJECT_ICON_MAP[iconKey] : null;
=======
  const SelectedIcon = iconKey ? ICON_MAP[iconKey] : null;
>>>>>>> d5dae2bc79b8728d6429d3676700c6b0a7160013

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
      style={{ background: 'rgba(26,22,20,0.35)' }}
    >
      <div
        className="w-full max-w-md animate-slide-up rounded-3xl shadow-cozy overflow-hidden"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 pt-6 pb-4"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <h2 className="font-display text-xl font-semibold" style={{ color: 'var(--text-main)' }}>
            {mode === 'create' ? 'New project' : 'Edit project'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl transition-all hover:scale-105 active:scale-90"
            style={{ color: 'var(--text-muted)' }}
          >
            <CloseCircle size={20} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5">
          {/* Icon picker */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Icon</label>
            <div className="flex flex-wrap gap-1.5">
<<<<<<< HEAD
              {PROJECT_ICON_OPTIONS.map(({ key, Icon }) => {
=======
              {ICON_OPTIONS.map(({ key, Icon }) => {
>>>>>>> d5dae2bc79b8728d6429d3676700c6b0a7160013
                const active = iconKey === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setIconKey(active ? undefined : key)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 hover:scale-110 active:scale-95"
                    style={{
                      background: active ? selectedColors.bg : 'var(--bg-panel)',
                      border: `1.5px solid ${active ? selectedColors.dot : 'var(--border)'}`,
                      color: active ? selectedColors.dot : 'var(--text-muted)',
                      boxShadow: active ? `0 0 0 2px ${selectedColors.dot}33` : 'none',
                    }}
                  >
                    <Icon size={16} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLOR_KEYS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full transition-all duration-200"
                  style={{
                    background: PROJECT_COLORS[c].dot,
                    boxShadow: color === c
                      ? `0 0 0 2px var(--bg-card), 0 0 0 4px ${PROJECT_COLORS[c].dot}`
                      : 'none',
                    transform: color === c ? 'scale(1.18)' : 'scale(1)',
                  }}
                  aria-label={c}
                />
              ))}
            </div>
          </div>

          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Project name</label>
            <input
              ref={nameRef}
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
              placeholder="My awesome project"
              className={`input-field ${shake ? 'animate-wiggle' : ''}`}
              maxLength={60}
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
              Description <span className="normal-case opacity-60">(optional)</span>
            </label>
            <textarea
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="What's this project about?"
              rows={2}
              className="input-field resize-none"
              maxLength={200}
            />
          </div>

<<<<<<< HEAD
          {/* Preview */}
=======
          {/* Preview pill */}
>>>>>>> d5dae2bc79b8728d6429d3676700c6b0a7160013
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}
          >
            <span className="text-xs font-body" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>Preview</span>
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-medium"
              style={{
                background: selectedColors.bg,
                color: selectedColors.text,
                border: `1px solid ${selectedColors.border}`,
              }}
            >
              {SelectedIcon && <SelectedIcon size={13} />}
              <span>{name || 'Project name'}</span>
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-2xl text-sm font-medium font-body border transition-all active:scale-95 hover:opacity-80"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', background: 'var(--bg-panel)' }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex-1 py-2.5 rounded-2xl text-sm font-medium font-body transition-all active:scale-95 hover:opacity-90 shadow-soft"
              style={{ background: 'var(--text-main)', color: 'var(--bg-main)' }}
            >
              {mode === 'create' ? 'Create project' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};