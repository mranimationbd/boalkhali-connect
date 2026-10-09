import {MetadataRoute} from 'next';
// Installable PWA manifest (A-07/B-04): real PNG icon FILES at 192/512 (+maskable) served
// by /api/icon/[size]. The old static manifest carried a single 512px data-URI icon
// (~100KB) that browsers cannot use for install. This route replaces public/manifest.webmanifest.
export default function manifest():MetadataRoute.Manifest{ return {name:'বোয়ালখালী কানেক্ট',short_name:'বোয়ালখালী কানেক্ট',description:'বাসা ভাড়া, বাই-সেল, ডাক্তার, রক্তদান, চাকরি ও লোকাল সেবা — বোয়ালখালী, চট্টগ্রাম',start_url:'/',scope:'/',display:'standalone',background_color:'#065f46',theme_color:'#0a7a54',lang:'bn',icons:[{src:'/api/icon/192',sizes:'192x192',type:'image/png',purpose:'any'},{src:'/api/icon/512',sizes:'512x512',type:'image/png',purpose:'any'},{src:'/api/icon/512',sizes:'512x512',type:'image/png',purpose:'maskable'}]}; }
