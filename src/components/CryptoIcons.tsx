import type { ComponentType } from 'react';

const SiCircle: ComponentType<{ size?: number }> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="10" />
  </svg>
);

const SiTether: ComponentType<{ size?: number }> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
  </svg>
);

const SiSolana: ComponentType<{ size?: number }> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M4.27 7.62a.5.5 0 0 1 .5-.04l11.55 6.05a.5.5 0 0 1 .02.87l-6.45 3.58a.5.5 0 0 1-.72-.19L4.25 8.15a.5.5 0 0 1 .02-.53zm.5 2.81a.5.5 0 0 1 .69-.17l7.12 4.56a.5.5 0 0 1 .02.83l-4.55 2.77a.5.5 0 0 1-.73-.15L4.8 10.4a.5.5 0 0 1-.03-.97zm.5 3.32a.5.5 0 0 1 .69-.15l4.23 2.92a.5.5 0 0 1 .02.79l-2.72 1.8a.5.5 0 0 1-.72-.14L5.3 13.75zm.5 3.02a.5.5 0 0 1 .69-.13l2.62 1.82a.5.5 0 0 1 .02.74l-1.3 1a.5.5 0 0 1-.72-.13L5.8 16.77z" />
  </svg>
);

const SiLitecoin: ComponentType<{ size?: number }> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="10" fillOpacity="0.2" />
    <text x="12" y="16" textAnchor="middle" fontSize="12" fontWeight="bold" fill="currentColor">L</text>
  </svg>
);

const SiTon: ComponentType<{ size?: number }> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const CRYPTO_ICONS: Record<string, ComponentType<{ size?: number }>> = {
  usdc: SiCircle,
  usdt: SiTether,
  ton: SiTon,
  sol: SiSolana,
  ltc: SiLitecoin,
};
