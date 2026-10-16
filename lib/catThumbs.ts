// Category thumbnail map — slug → public image path.
// Filled by the thumbnail-generation agent. Client.tsx renders next/image
// when an entry exists, and falls back to the catIcon/emoji tile otherwise.
export const CATEGORY_THUMBS: Record<string, string> = {};
