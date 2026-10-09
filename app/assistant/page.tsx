import {Shell} from '@/components/ui'; import {AssistantChat} from './Client'; export const dynamic='force-dynamic'; export const metadata={title:'সহায়িকা — বোয়ালখালী কানেক্ট',description:'বোয়ালখালী কানেক্টের তথ্য সহায়িকা — সাইটের সংরক্ষিত তথ্য থেকে ডাক্তার, রক্তদাতা, জায়গা ও সেবার খোঁজ',alternates:{canonical:'/assistant'}};
// AI Local Guide v1 (Wave 3): retrieval-only. It searches the site's own records
// and links to them; where the site has no information it says so plainly. It does
// not invent numbers, hours or credentials (see lib/guide.ts).
export default function P(){ return <Shell><main className="max-w-3xl mx-auto p-4"><h1 className="font-black text-xl">🤖 বোয়ালখালী সহায়িকা</h1><p className="text-sm text-gray-500 mt-1 mb-3">এটি সাইটের সংরক্ষিত তথ্য খুঁজে দেয় — ডাক্তার, রক্তদাতা, দর্শনীয় স্থান, পোস্ট ও সেবা। <b>সাইটে তথ্য না থাকলে তা স্পষ্ট জানিয়ে দেবে; বানিয়ে কোনো ফোন নম্বর বা তথ্য বলবে না।</b></p><AssistantChat/></main></Shell>; }
