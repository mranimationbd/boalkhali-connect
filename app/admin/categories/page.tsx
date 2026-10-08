import {readDBAsync} from '@/lib/db'; import {requireAdminPage} from '@/lib/auth'; import CategoriesClient from './CategoriesClient'; export const dynamic='force-dynamic';
// ক্যাটাগরি পরিচালনা: db.categories-এর enabled পতাকা — বন্ধ করলে পাবলিক ক্যাটাগরি
// তালিকা, হোম ও পোস্ট-তৈরির ধাপ থেকে লুকিয়ে থাকে (পাবলিক পেজগুলো enabled ফিল্টার করে)।
// মুছে ফেলার অপশন ইচ্ছাকৃতভাবে নেই — বিদ্যমান পোস্ট যেন অনাথ না হয়।
export default async function P(){ await requireAdminPage('categories.manage'); const db=await readDBAsync(); const counts:any={}; db.posts.forEach((p:any)=>{ counts[p.categorySlug]=(counts[p.categorySlug]||0)+1; });
 const rows=[...db.categories].sort((a:any,b:any)=>(a.order||0)-(b.order||0)).map((c:any)=>({slug:c.slug,name:c.name,color:c.color||'',order:c.order||0,enabled:c.enabled!==false,posts:counts[c.slug]||0}));
 return <div><h1 className="font-black text-xl">📂 ক্যাটাগরি</h1><p className="text-sm text-gray-500">মোট {rows.length}টি ক্যাটাগরি। বন্ধ করা ক্যাটাগরি পাবলিক সাইটে দেখায় না, তবে পুরনো পোস্ট থেকে ডেটা মুছে যায় না।</p><div className="mt-4"><CategoriesClient rows={rows}/></div></div>; }
