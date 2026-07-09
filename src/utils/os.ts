export type Platform = 'windows' | 'macos' | 'linux' | 'ios' | 'android' | 'unknown';

export interface PlatformInfo {
  id: Platform;
  name: string;
  icon: string;
  available: boolean;
}

export function detectPlatform(): Platform {
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return 'ios';
  if (/android/.test(ua)) return 'android';
  if (/win/.test(ua)) return 'windows';
  if (/mac/.test(ua)) return 'macos';
  if (/linux/.test(ua)) return 'linux';
  return 'unknown';
}

export const PLATFORMS: PlatformInfo[] = [
  { id: 'windows', name: 'Windows', icon: '/windows.svg', available: true },
  { id: 'macos', name: 'macOS', icon: '/icons/macos.svg', available: false },
  { id: 'linux', name: 'Linux', icon: '/icons/linux.svg', available: false },
  { id: 'ios', name: 'iOS', icon: '/icons/ios.svg', available: false },
  { id: 'android', name: 'Android', icon: '/icons/android.svg', available: false },
];

export interface DownloadFile {
  platform: Platform;
  label: string;
  filename: string;
  url: string;
  arch?: string;
}

export const DOWNLOAD_FILES: DownloadFile[] = [
  {
    platform: 'windows',
    label: 'Windows: Portable',
    filename: 'CuTasks_Portable.zip',
    url: 'https://github.com/novflix/cutasks/releases/download/v0.9.2/CuTasks_Portable.zip',
  },
  {
    platform: 'windows',
    label: 'Windows 64 bit: Installer',
    filename: 'CuTasks_0.9.2_x64-setup.exe',
    url: 'https://github.com/novflix/cutasks/releases/download/v0.9.2/CuTasks_0.9.2_x64-setup.exe',
    arch: 'x64',
  },
  {
    platform: 'windows',
    label: 'Windows 32 bit: Installer',
    filename: 'CuTasks_0.9.2_x86-setup.exe',
    url: 'https://github.com/novflix/cutasks/releases/download/v0.9.2/CuTasks_0.9.2_x86-setup.exe',
    arch: 'x86',
  },
];
