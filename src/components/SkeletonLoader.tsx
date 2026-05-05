import React from 'react';

const Pulse: React.FC<{ w?: string; h?: string; radius?: string; style?: React.CSSProperties }> = ({
  w = '100%', h = '20px', radius = '10px', style,
}) => (
  <div
    style={{
      width: w,
      height: h,
      borderRadius: radius,
      background: 'var(--bg-panel)',
      animation: 'skeletonPulse 1.4s ease-in-out infinite',
      ...style,
    }}
  />
);

const TaskSkeleton: React.FC = () => (
  <div
    style={{
      padding: '14px 16px',
      borderRadius: '16px',
      border: '1px solid var(--border)',
      background: 'var(--bg-card)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    }}
  >
    <Pulse w="20px" h="20px" radius="50%" style={{ flexShrink: 0 }} />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <Pulse w="60%" h="14px" />
      <Pulse w="35%" h="11px" />
    </div>
    <Pulse w="48px" h="20px" radius="8px" style={{ flexShrink: 0 }} />
  </div>
);

const ProjectSkeleton: React.FC = () => (
  <div
    style={{
      padding: '18px',
      borderRadius: '20px',
      border: '1px solid var(--border)',
      background: 'var(--bg-card)',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <Pulse w="32px" h="32px" radius="10px" style={{ flexShrink: 0 }} />
      <Pulse w="50%" h="16px" />
    </div>
    <Pulse w="80%" h="12px" />
    <Pulse w="40%" h="11px" />
  </div>
);


export const TasksPageSkeleton: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
    {[...Array(5)].map((_, i) => <TaskSkeleton key={i} />)}
  </div>
);

export const ProjectsPageSkeleton: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
    {[...Array(4)].map((_, i) => <ProjectSkeleton key={i} />)}
  </div>
);

export const ProjectDetailSkeleton: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
    {/* Header */}
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
      <Pulse w="28px" h="28px" radius="8px" style={{ flexShrink: 0 }} />
      <Pulse w="45%" h="22px" />
    </div>
    {/* Section header */}
    <Pulse w="30%" h="13px" />
    {/* Tasks */}
    {[...Array(4)].map((_, i) => <TaskSkeleton key={i} />)}
  </div>
);

export const SkeletonStyles: React.FC = () => (
  <style>{`
    @keyframes skeletonPulse {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.4; }
    }
  `}</style>
);