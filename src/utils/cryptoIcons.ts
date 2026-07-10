import type { ComponentType } from 'react';
import { Usdc, Usdt, TonIcon, Sol, Ltc } from '../components/CryptoIcons';

type IconProps = { size?: number | string; color?: string };

export const CRYPTO_ICONS: Record<string, ComponentType<IconProps>> = {
  usdc: Usdc,
  usdt: Usdt,
  ton: TonIcon,
  sol: Sol,
  ltc: Ltc,
};
