// Category icon resolver for CLIENT components: returns a cacheable /api/img/cat/<slug>
// URL. The PNG bytes live in lib/catIconDataA/B/C.ts (Google Noto Emoji artwork as data
// URIs) and are served by that API route — they must never be imported into a client
// bundle again (each inline copy added ~290KB to every page; A-09/B-06).
export function catIcon(slug:string):string|undefined{ return slug?'/api/img/cat/'+slug:undefined; }
export const CAT_EMOJI:Record<string,string>={house:'🏠',market:'🛍️',doctor:'🩺',blood:'🩸',secret:'🤫',food:'🍽️',transport:'🚌',jobs:'💼',lost:'🔍',legal:'⚖️',event:'🎉',electrician:'⚡',plumber:'🔧',ac:'❄️',driver:'🚗',tutor:'📚',vet:'🐾',mason:'🔨',mobile:'📱'};
export function catEmoji(slug:string):string{ return CAT_EMOJI[slug]||'📌'; }
