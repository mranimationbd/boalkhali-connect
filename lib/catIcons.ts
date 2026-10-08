// Category icons: Google Noto Emoji PNG artwork in public/cat-icons/<slug>.png
// (emoji_u<codepoint>.png from github.com/googlefonts/noto-emoji, 512px).
// catIcon returns the PNG path, or undefined so callers can fall back to the emoji char.
export const CAT_ICONS: Record<string, string> = {
  house: '/cat-icons/house.png',
  market: '/cat-icons/market.png',
  doctor: '/cat-icons/doctor.png',
  blood: '/cat-icons/blood.png',
  secret: '/cat-icons/secret.png',
  food: '/cat-icons/food.png',
  transport: '/cat-icons/transport.png',
  jobs: '/cat-icons/jobs.png',
  lost: '/cat-icons/lost.png',
  legal: '/cat-icons/legal.png',
  event: '/cat-icons/event.png',
  electrician: '/cat-icons/electrician.png',
  plumber: '/cat-icons/plumber.png',
  ac: '/cat-icons/ac.png',
  driver: '/cat-icons/driver.png',
  tutor: '/cat-icons/tutor.png',
  vet: '/cat-icons/vet.png',
  mason: '/cat-icons/mason.png',
  mobile: '/cat-icons/mobile.png',
};

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
