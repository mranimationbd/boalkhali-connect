'use client';
// SiteSettings (F2): server layout reads db.settings and hands the public brand fields to
// client components (Header/Footer) through this context. Defaults = SETTINGS_DEFAULTS.
import {createContext,useContext} from 'react'; import {SETTINGS_DEFAULTS} from '@/lib/settings';
const SiteCtx=createContext<any>(SETTINGS_DEFAULTS);
export function SiteSettingsProvider({value,children}:{value:any;children:any}){ return <SiteCtx.Provider value={{...SETTINGS_DEFAULTS,...(value||{})}}>{children}</SiteCtx.Provider>; }
export function useSiteSettings(){ return useContext(SiteCtx); }
