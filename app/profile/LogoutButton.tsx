'use client';
export default function LogoutButton(){ const logout=async()=>{ try{ await fetch('/api/auth/logout',{method:'POST'}); }catch{} location.href='/'; }; return <button onClick={logout} className="w-full bg-red-50 text-red-600 rounded-2xl py-3 font-bold mt-4">সাইন আউট</button>; }
