export interface SidebarColorPreset {
  id: string;
  name: string;
  hex: string;
}

export interface SidebarSurfaceTokens {
  bg: string;
  text: string;
  textMuted: string;
  border: string;
  hoverBg: string;
  activeBg: string;
  activeText: string;
  activeRing: string;
  iconBg: string;
  iconColor: string;
  isLight: boolean;
}

export const DEFAULT_LIGHT_SIDEBAR_COLOR = '#ffffff';
export const DEFAULT_DARK_SIDEBAR_COLOR = '#1e1b4b';

export const SIDEBAR_COLOR_PRESETS: SidebarColorPreset[] = [
  { id: 'indigo-night', name: 'Índigo Noturno', hex: '#1e1b4b' },
  { id: 'ocean-blue', name: 'Azul Petróleo', hex: '#0c4a6e' },
  { id: 'deep-emerald', name: 'Esmeralda Escuro', hex: '#064e3b' },
  { id: 'deep-purple', name: 'Roxo Profundo', hex: '#3b0764' },
  { id: 'burgundy', name: 'Vinho Escuro', hex: '#4c0519' },
  { id: 'deep-teal', name: 'Turquesa Escuro', hex: '#134e4a' },
  { id: 'warm-coffee', name: 'Café Escuro', hex: '#451a03' },
  { id: 'graphite', name: 'Grafite', hex: '#1f2937' },
  { id: 'pure-white', name: 'Branco', hex: '#ffffff' },
  { id: 'cool-slate', name: 'Cinza Gelo', hex: '#f1f5f9' },
  { id: 'soft-indigo', name: 'Índigo Suave', hex: '#eef2ff' },
  { id: 'soft-emerald', name: 'Esmeralda Suave', hex: '#ecfdf5' },
];

const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;

export function isValidHexColor(value: unknown): value is string {
  return typeof value === 'string' && HEX_COLOR_REGEX.test(value.trim());
}

export function normalizeHexColor(value: string): string {
  return value.trim().toLowerCase();
}

function srgbToLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/**
 * Computes WCAG 2.1 relative luminance in [0, 1] for a #rrggbb color.
 */
export function getRelativeLuminance(hex: string): number {
  const normalized = isValidHexColor(hex)
    ? normalizeHexColor(hex)
    : DEFAULT_DARK_SIDEBAR_COLOR;
  const r = parseInt(normalized.slice(1, 3), 16);
  const g = parseInt(normalized.slice(3, 5), 16);
  const b = parseInt(normalized.slice(5, 7), 16);
  return (
    0.2126 * srgbToLinear(r) +
    0.7152 * srgbToLinear(g) +
    0.0722 * srgbToLinear(b)
  );
}

/**
 * Returns true when dark foreground ink provides stronger contrast than white.
 */
export function isLightColor(hex: string): boolean {
  return getRelativeLuminance(hex) > 0.22;
}

export function getSidebarSurfaceTokens(hex: string): SidebarSurfaceTokens {
  const bg = isValidHexColor(hex)
    ? normalizeHexColor(hex)
    : DEFAULT_DARK_SIDEBAR_COLOR;
  const light = isLightColor(bg);

  if (light) {
    return {
      bg,
      text: '#0f172a',
      textMuted: '#475569',
      border: 'rgba(15, 23, 42, 0.12)',
      hoverBg: 'rgba(15, 23, 42, 0.07)',
      activeBg: '#4f46e5',
      activeText: '#ffffff',
      activeRing: 'rgba(79, 70, 229, 0.35)',
      iconBg: 'rgba(79, 70, 229, 0.12)',
      iconColor: '#4f46e5',
      isLight: true,
    };
  }

  return {
    bg,
    text: '#f8fafc',
    textMuted: 'rgba(248, 250, 252, 0.76)',
    border: 'rgba(255, 255, 255, 0.12)',
    hoverBg: 'rgba(255, 255, 255, 0.10)',
    activeBg: 'rgba(255, 255, 255, 0.18)',
    activeText: '#ffffff',
    activeRing: 'rgba(255, 255, 255, 0.24)',
    iconBg: 'rgba(255, 255, 255, 0.15)',
    iconColor: '#ffffff',
    isLight: false,
  };
}
