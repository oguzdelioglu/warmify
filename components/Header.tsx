import React from 'react';
import { AppView, UserStats } from '../types';
import { Settings as SettingsIcon } from 'lucide-react';
import { SoundEngine } from '../services/audioService';
import { WarmifyLogo } from './Branding';

interface HeaderProps {
    view: AppView;
    setView: (view: AppView) => void;
    userStats: UserStats;
}

export const Header: React.FC<HeaderProps> = ({ view, setView, userStats }) => {
    // Hide header on certain views
    if (view === AppView.WORKOUT || view === AppView.RESULTS || view === AppView.BADGE_REVEAL || view === AppView.LEVELING) {
        return null;
    }

    return (
        <header className="flex justify-between items-center py-2 flex-shrink-0 z-50">
            <div onClick={() => setView(AppView.HOME)} className="cursor-pointer flex items-center">
                <WarmifyLogo />
                <h1 className="text-2xl font-black italic bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 drop-shadow-lg tracking-tight">
                    Warmify
                </h1>
            </div>
            <div className="flex gap-2">
                <button onClick={() => { SoundEngine.playUI('click'); setView(AppView.SETTINGS); }} className="w-8 h-8 rounded-full bg-slate-800/80 border border-slate-600 flex items-center justify-center hover:bg-slate-700 transition-colors">
                    <SettingsIcon size={16} className="text-slate-300" />
                </button>
                {!userStats.isPremium && (
                    <button onClick={() => { SoundEngine.playUI('click'); setView(AppView.PAYWALL); }} className="h-8 px-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 border border-amber-400/50 flex items-center justify-center text-[10px] font-black text-white shadow-lg animate-pulse">
                        PRO
                    </button>
                )}
                {/* LEVEL BADGE - CLICK TO OPEN LEVELING PAGE */}
                <button
                    onClick={() => { SoundEngine.playUI('click'); setView(AppView.LEVELING); }}
                    className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 hover:scale-105 transition-all px-2 h-8 rounded-full border border-slate-700 shadow-md group"
                >
                    <span className="text-[10px] font-bold text-emerald-400 group-hover:text-emerald-300">Lvl {userStats.level}</span>
                    <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[10px]">🦁</div>
                </button>
            </div>
        </header>
    );
};
