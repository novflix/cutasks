import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CartLargeMinimalistic ,
  Book,
  Phone,
  Leaf,
  TeaCup,
  Dumbbell,
  ClipboardList,
  CalendarMinimalistic,
  Letter,
  Pen2,
  Sun,
} from '@solar-icons/react';

const CHIPS: { Icon: React.FC<{ size?: number; color?: string }>; text: string; rotate: number }[] = [
  { Icon: CartLargeMinimalistic,text: 'Buy oat milk',      rotate: 8 },
  { Icon: Phone,                text: 'Call mom',           rotate:  -11 },
  { Icon: Book,                 text: 'Read 20 pages',      rotate: -4 },
  { Icon: Leaf,                 text: 'Water plants',       rotate:  7 },
  { Icon: TeaCup,                  text: 'Make some tea',      rotate: 5 },
  { Icon: Dumbbell,             text: 'Morning workout',    rotate:  4 },
  { Icon: ClipboardList,        text: 'Plan the week',      rotate: 7 },
  { Icon: CalendarMinimalistic, text: 'Team meeting',       rotate:  -9 },
  { Icon: Letter,               text: 'Reply to emails',    rotate: -5 },
  { Icon: Pen2,                 text: 'Write journal',      rotate:  8 },
  { Icon: Sun,                  text: 'Take a walk',        rotate: -7 },
];

// Orbiting around the central block — not glued to edges, not overlapping center
const POSITIONS: React.CSSProperties[] = [
  { top: '11%', left: '20%'  },   // top-left
  { top:  '9%', right: '23%' },   // top-right
  { top: '22%', left: '7%'   },   // mid-left upper
  { top: '22%', right: '8%'  },   // mid-right upper
  { top: '42%', left: '15%'   },   // center-left
  { top: '42%', right: '14%'  },   // center-right
  { top: '62%', left: '8%'   },   // mid-left lower
  { top: '62%', right: '18%'  },   // mid-right lower
  { top: '78%', left: '19%'  },   // bottom-left
  { top: '87%', right: '24%' },   // bottom-right
  { top: '90%', left: '35%'  },   // bottom center
];

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-main)',
        position: 'relative',
        overflow: 'hidden',
        padding: '24px',
      }}
    >
      <style>{`
        @keyframes floatY {
          0%, 100% { transform: translateY(0px)  rotate(var(--chip-r)); }
          50%       { transform: translateY(-9px) rotate(var(--chip-r)); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(26px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes grainMove {
          0%   { transform: translate(0, 0); }
          25%  { transform: translate(-2%, 2%); }
          50%  { transform: translate(2%, -1%); }
          75%  { transform: translate(-1%, -2%); }
          100% { transform: translate(0, 0); }
        }
        .nf-chip-wrap {
          position: absolute;
          pointer-events: none;
          z-index: 0;
          animation: floatY var(--chip-dur, 3s) ease-in-out infinite;
          animation-delay: var(--chip-delay, 0s);
          transition: opacity 0.5s ease var(--chip-delay, 0s);
        }
        .nf-chip-inner {
          display: flex;
          align-items: center;
          gap: 7px;
          background: var(--bg-card);
          border: 1.5px solid var(--border);
          border-radius: 12px;
          padding: 7px 13px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12.5px;
          font-weight: 500;
          color: var(--text-muted);
          white-space: nowrap;
          box-shadow: 0 3px 16px rgba(0,0,0,0.06);
          transform: rotate(var(--chip-r));
        }
        .nf-card {
          position: relative;
          z-index: 1;
          animation: fadeSlideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        .nf-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 13px 28px;
          border-radius: 14px;
          border: none;
          background: var(--accent);
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.18s ease, box-shadow 0.18s ease;
          box-shadow: 0 4px 16px rgba(237,155,109,0.22);
          letter-spacing: 0.01em;
        }
        .nf-btn:hover  { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(237,155,109,0.30); }
        .nf-btn:active { transform: translateY(0) scale(0.97); }
        .nf-grain {
          position: fixed; inset: -50%;
          width: 200%; height: 200%;
          opacity: 0.025;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 160px;
          pointer-events: none;
          animation: grainMove 0.4s steps(1) infinite;
          z-index: 0;
        }
      `}</style>

      <div className="nf-grain" />

      {/* Floating chips — screen edges only */}
      {CHIPS.map((chip, i) => (
        <div
          key={i}
          className="nf-chip-wrap"
          style={{
            ...POSITIONS[i],
            '--chip-r':     `${chip.rotate}deg`,
            '--chip-dur':   `${2.6 + i * 0.35}s`,
            '--chip-delay': `${i * 0.18}s`,
            opacity: mounted ? 0.82 : 0,
          } as React.CSSProperties}
        >
          <div className="nf-chip-inner">
            <chip.Icon size={14} color="var(--accent)" />
            {chip.text}
          </div>
        </div>
      ))}

      {/* Central content — z-index: 1, chips can't bleed through */}
      <div className="nf-card" style={{ textAlign: 'center', maxWidth: '340px', width: '100%' }}>

        {/* Checkbox icon */}
        <div style={{
          width: 76, height: 76, borderRadius: 22,
          background: 'var(--bg-panel)',
          border: '2px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px',
          boxShadow: '0 4px 24px rgba(237,155,109,0.10)',
        }}>
          <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
            <rect x="5" y="5" width="32" height="32" rx="9"
              stroke="var(--border)" strokeWidth="2.5"/>
            <text
              x="21" y="28"
              textAnchor="middle"
              fontFamily="Fraunces, serif"
              fontSize="18" fontWeight="500"
              fill="var(--accent)"
            >?</text>
          </svg>
        </div>

        {/* 404 with task-strikethrough */}
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <span style={{
            fontFamily: 'Fraunces, serif',
            fontSize: '90px', fontWeight: 400,
            lineHeight: 0.9, letterSpacing: '-4px',
            color: 'var(--text-main)',
          }}>404</span>
          <div style={{
            position: 'absolute',
            top: '50%', left: '-6px', right: '-6px',
            height: '3px', borderRadius: '2px',
            background: 'var(--accent)', opacity: 0.65,
            transform: 'translateY(-50%) rotate(-1.5deg)',
          }} />
        </div>

        <p style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '11.5px', fontWeight: 600,
          textTransform: 'uppercase', letterSpacing: '0.14em',
          color: 'var(--accent)',
          marginTop: '20px', marginBottom: '10px',
        }}>
          Task not found
        </p>

        <h2 style={{
          fontFamily: 'Fraunces, serif',
          fontSize: '24px', fontWeight: 400,
          color: 'var(--text-main)',
          lineHeight: 1.3, marginBottom: '12px',
        }}>
          This page slipped off<br />your to-do list.
        </h2>

        <p style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '13.5px', color: 'var(--text-muted)',
          lineHeight: 1.65, marginBottom: '30px',
        }}>
          Looks like this page was never added to the backlog —
          or someone marked it deleted. Let's get you back to
          what matters.
        </p>

        <button className="nf-btn" onClick={() => navigate('/tasks')}>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <rect x="1" y="1" width="13" height="13" rx="4"
              stroke="rgba(255,255,255,0.45)" strokeWidth="1.5"/>
            <path d="M4.5 7.5l2 2L10.5 5"
              stroke="#fff" strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to my tasks
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', marginTop: '28px' }}>
          {[false, true, false].map((active, i) => (
            <div key={i} style={{
              width: active ? '20px' : '6px',
              height: '6px', borderRadius: '3px',
              background: active ? 'var(--accent)' : 'var(--border)',
              opacity: active ? 0.75 : 1,
            }} />
          ))}
        </div>
      </div>
    </div>
  );
};