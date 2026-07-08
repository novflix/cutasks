import { useState, useEffect } from 'react';

interface LogoProps {
  mini?: boolean;
  className?: string;
}

function isLightTheme() {
  return document.documentElement.getAttribute('data-theme') === 'light';
}

export default function Logo({ mini, className }: LogoProps) {
  const [light, setLight] = useState(isLightTheme);

  useEffect(() => {
    const el = document.documentElement;
    const observer = new MutationObserver(() => setLight(isLightTheme()));
    observer.observe(el, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  const src = mini
    ? (light ? '/logo-mini-light.svg' : '/logo-mini.svg')
    : (light ? '/logo-light.svg' : '/logo.svg');

  if (mini) {
    return <img src={src} alt="CuTasks" className={className} width="150" height="150" />;
  }
  return <img src={src} alt="CuTasks" className={className} width="450" height="150" />;
}
