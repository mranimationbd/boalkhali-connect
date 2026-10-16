// Category thumbnail map — slug → public image path.
// Flat-vector illustrations at public/images/categories/<slug>.webp (800x600).
// Client.tsx renders next/image when an entry exists, and falls back to the catIcon/emoji tile otherwise.
export const CATEGORY_THUMBS: Record<string, string> = {
  house: '/images/categories/house.webp',
  market: '/images/categories/market.webp',
  doctor: '/images/categories/doctor.webp',
  blood: '/images/categories/blood.webp',
  secret: '/images/categories/secret.webp',
  food: '/images/categories/food.webp',
  transport: '/images/categories/transport.webp',
  jobs: '/images/categories/jobs.webp',
  lost: '/images/categories/lost.webp',
  legal: '/images/categories/legal.webp',
  event: '/images/categories/event.webp',
  electrician: '/images/categories/electrician.webp',
  plumber: '/images/categories/plumber.webp',
  ac: '/images/categories/ac.webp',
  driver: '/images/categories/driver.webp',
  tutor: '/images/categories/tutor.webp',
  vet: '/images/categories/vet.webp',
  mason: '/images/categories/mason.webp',
  mobile: '/images/categories/mobile.webp',
};
