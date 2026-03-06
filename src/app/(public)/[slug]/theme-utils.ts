export function isDarkColor(hex: string | null | undefined): boolean {
  if (!hex || !hex.startsWith('#') || hex.length < 7) return false;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return r * 0.299 + g * 0.587 + b * 0.114 < 128;
}

export function getTextColors(bgHex: string | null | undefined) {
  const dark = isDarkColor(bgHex);
  return {
    isDark: dark,
    text: dark ? '#F9FAFB' : '#111827',
    textMuted: dark ? 'rgba(255,255,255,0.6)' : '#6B7280',
    border: dark ? 'rgba(255,255,255,0.12)' : '#E5E2DD',
    subtleBg: dark ? 'rgba(255,255,255,0.08)' : '#F0EFEB',
  };
}

export function getAccentTextColor(accentHex: string | null | undefined): string {
  return isDarkColor(accentHex) ? '#FFFFFF' : '#FFFFFF';
  // Accent buttons always use white text — override below if needed for light accents
}

export function getAccentColors(accentHex: string | null | undefined) {
  const accent = accentHex || null;
  const dark = isDarkColor(accent);
  return {
    bg: accent,
    text: dark ? '#FFFFFF' : '#FFFFFF',
    hoverBg: accent ? (dark ? lighten(accent, 15) : darken(accent, 10)) : null,
  };
}

function lighten(hex: string, percent: number): string {
  const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + Math.round(255 * percent / 100));
  const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + Math.round(255 * percent / 100));
  const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + Math.round(255 * percent / 100));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function darken(hex: string, percent: number): string {
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - Math.round(255 * percent / 100));
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - Math.round(255 * percent / 100));
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - Math.round(255 * percent / 100));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
