// Site settings (db.settings) — defaults only; pure module, safe for client bundles.
// Every key has a real consumer: siteName/tagline/contact → Header/Footer brand (components),
// maintenanceMode → layout banner + POST /api/posts gate, notifyPostModeration → moderate route,
// notifyAdminOnPending → posts route staff alert, sirenHomeBanner → home LIVE alerts section.
export const SETTINGS_DEFAULTS={siteName:'বোয়ালখালী কানেক্ট',tagline:'বোয়ালখালী শহরের ডিজিটাল সিটিজেন প্ল্যাটফর্ম',contactEmail:'',contactPhone:'',maintenanceMode:false,notifyPostModeration:true,notifyAdminOnPending:true,sirenHomeBanner:true,cmsContentsPerPage:12,cmsEditorDefaultStatus:'DRAFT'};
export const SETTING_STRING_KEYS=['siteName','tagline','contactEmail','contactPhone'];
export const SETTING_BOOL_KEYS=['maintenanceMode','notifyPostModeration','notifyAdminOnPending','sirenHomeBanner'];
