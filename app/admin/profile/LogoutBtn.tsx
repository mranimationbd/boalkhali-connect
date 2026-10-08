'use client';
export default function LogoutBtn(){ const logout=async()=>{ try{ await fetch('/api/auth/logout',{method:'POST'}); }catch{} location.href='/login'; }; return <button onClick={logout} className="btn !bg-red-600">🚪 লগআউট</button>; }
