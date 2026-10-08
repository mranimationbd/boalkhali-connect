// Category icons: Google Noto Emoji PNG artwork shipped as inline data URIs
// (lib/catIconDataA/B/C.ts, 128px) so icons travel as text — binary upload to
// GitHub corrupted PNGs, data URIs do not. catIcon returns a data: URI, or
// undefined so callers can fall back to the emoji char.
import { CAT_ICON_DATA as ICON_A } from './catIconDataA';
import { CAT_ICON_DATA as ICON_B } from './catIconDataB';
import { CAT_ICON_DATA as ICON_C } from './catIconDataC';

export const CAT_ICONS: Record<string, string> = { ...ICON_A, ...ICON_B, ...ICON_C };

export const CAT_EMOJI: Record<string, string> = {
  house: '🏠',
  market: '🛍️',
  doctor: '🩺',
  blood: '🩸',
  secret: '🤫',
  food: '🍽️',
  transport: '🚌',
  jobs: '💼',
  lost: '🔍',
  legal: '⚖️',
  event: '🎉',
  electrician: '⚡',
  plumber: '🔧',
  ac: '❄️',
  driver: '🚗',
  tutor: '📚',
  vet: '🐾',
  mason: '🔨',
  mobile: '📱',
};

export function catIcon(slug: string): string | undefined {
  return CAT_ICONS[slug];
}

export function catEmoji(slug: string): string {
  return CAT_EMOJI[slug] || '📌';
}
