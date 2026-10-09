// RBAC permission matrix (Admin separation batch S1). Single source of truth for what each
// back-office role may see/do. Pages enforce via requireAdminPage(perm) in lib/auth.ts;
// APIs keep their requireRole lists, aligned to these assignments (no widening).
export const ALL_PERMISSIONS=['dashboard.view','users.view','users.manage','business.manage','content.moderate','approvals.view','reports.view','reports.manage','secret.view','blood.manage','ads.manage','broadcast.send','siren.manage','transport.manage','volunteers.manage','categories.manage','analytics.view','analytics.ip.view','analytics.ip.export','health.view','audit.view','roles.manage','export.data','settings.manage'];
export const ROLE_PERMISSIONS:Record<string,string[]>={ SUPER_ADMIN:[...ALL_PERMISSIONS],
 // roles.manage (রোল ও নিরাপত্তা) and export.data (full DB dump incl. password hashes) are SUPER_ADMIN-only.
 // analytics.ip.* (raw visitor IP logs, §41) are intentionally NOT granted to ADMIN by default —
 // an authorized grant is added here explicitly; SUPER_ADMIN always has both.
 ADMIN:ALL_PERMISSIONS.filter(p=>p!=='roles.manage'&&p!=='export.data'&&p!=='analytics.ip.view'&&p!=='analytics.ip.export'),
 MODERATOR:['dashboard.view','content.moderate','approvals.view','reports.view','blood.manage','analytics.view'],
 CITIZEN:[],BUSINESS:[],SERVICE_PROVIDER:[] };
export function hasPermission(role:string,perm:string){ return (ROLE_PERMISSIONS[role]||[]).includes(perm); }
export const PERMISSION_LABELS:Record<string,string>={ 'dashboard.view':'ড্যাশবোর্ড দেখা','users.view':'ইউজার তালিকা দেখা','users.manage':'ইউজার পরিচালনা (রোল/ব্লক/মুছে ফেলা)','business.manage':'ব্যবসা ও সেবা (ডাক্তার ডিরেক্টরি) পরিচালনা','content.moderate':'পোস্ট মডারেশন','approvals.view':'অনুমোদন কেন্দ্র দেখা','reports.view':'নাগরিক অভিযোগ দেখা','reports.manage':'নাগরিক অভিযোগ পরিচালনা (দেখা হয়েছে/সমাধান/মুছে ফেলা)','secret.view':'গোপন তথ্য ডেস্ক','blood.manage':'রক্তদান ও রক্তের আবেদন পরিচালনা','ads.manage':'বিজ্ঞাপন পরিচালনা','broadcast.send':'ব্রডকাস্ট/পুশ পাঠানো','siren.manage':'জরুরি সাইরেন পরিচালনা','transport.manage':'পরিবহন তথ্য পরিচালনা','volunteers.manage':'স্বেচ্ছাসেবী পরিচালনা','categories.manage':'ক্যাটাগরি পরিচালনা','analytics.view':'অ্যানালিটিক্স দেখা','analytics.ip.view':'ভিজিটর IP লগ দেখা (সংবেদনশীল)','analytics.ip.export':'ভিজিটর IP লগ এক্সপোর্ট (CSV)','health.view':'সিস্টেম হেলথ দেখা','audit.view':'অডিট লগ দেখা','roles.manage':'রোল ও নিরাপত্তা পরিচালনা','export.data':'ডেটা এক্সপোর্ট (সংবেদনশীল)','settings.manage':'সিস্টেম সেটিংস পরিচালনা' };
export const ROLE_LABELS:Record<string,string>={ SUPER_ADMIN:'সুপার অ্যাডমিন',ADMIN:'অ্যাডমিন',MODERATOR:'মডারেটর' };
