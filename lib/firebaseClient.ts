// Firebase Auth client (browser only). Enabled solely when NEXT_PUBLIC_FIREBASE_* config is present;
// without config nothing is initialized and auth falls back to the app's own email/phone+password flow.
import {initializeApp,getApps,type FirebaseApp} from 'firebase/app';
import {getAuth,GoogleAuthProvider,signInWithPopup,createUserWithEmailAndPassword,sendEmailVerification,signInWithEmailAndPassword,type Auth} from 'firebase/auth';
const config={apiKey:process.env.NEXT_PUBLIC_FIREBASE_API_KEY||'',authDomain:process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN||'',projectId:process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID||'',appId:process.env.NEXT_PUBLIC_FIREBASE_APP_ID||''};
export const firebaseEnabled=!!config.apiKey;
let app:FirebaseApp|null=null; let auth:Auth|null=null;
function ensureAuth():Auth{ if(!firebaseEnabled) throw new Error('FIREBASE_NOT_CONFIGURED'); if(!app){ app=getApps().length?getApps()[0]:initializeApp(config); } if(!auth){ auth=getAuth(app); } return auth; }
export async function signInWithGoogle(){ const a=ensureAuth(); const cred=await signInWithPopup(a,new GoogleAuthProvider()); return cred.user.getIdToken(); }
export async function registerWithEmail(email:string,password:string){ const a=ensureAuth(); const cred=await createUserWithEmailAndPassword(a,email,password); await sendEmailVerification(cred.user); return cred.user.getIdToken(); }
export async function signInWithEmail(email:string,password:string){ const a=ensureAuth(); const cred=await signInWithEmailAndPassword(a,email,password); return cred.user.getIdToken(); }
