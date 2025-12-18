import React, { useState } from 'react';
import { UserStats, UserSettings, AppView, SportMode } from '../../types';
import { XPBar, TrophyCase } from '../Gamification';
import { Play, Trophy, Zap, Target, Activity as ActivityIcon, CircleDot, Bike, Armchair } from 'lucide-react';
import { SoundEngine } from '../../services/audioService';
import { SportModeSelector } from '../SportModeSelector';
import { FlexibilityTracker } from '../FlexibilityTracker';

interface HomeViewProps {
    userStats: UserStats;
    settings: UserSettings;
    setView: (view: AppView) => void;
    startWorkout: () => void;
    newUnlockedBadge: string | null;
    updateSettings: (settings: UserSettings) => void;
}

// Sport mode icon and gradient helper
const getSportModeConfig = (mode: SportMode): { icon: React.ReactNode; gradient: string } => {
    const configs: Record<SportMode, { icon: React.ReactNode; gradient: string }> = {
        'FOOTBALL': { icon: <CircleDot size={16} />, gradient: 'from-green-600 to-emerald-700' },
        'RUGBY': { icon: <Trophy size={16} />, gradient: 'from-amber-600 to-orange-700' },
        'RUNNER': { icon: <ActivityIcon size={16} />, gradient: 'from-blue-600 to-cyan-700' },
        'CYCLIST': { icon: <Bike size={16} />, gradient: 'from-purple-600 to-pink-700' },
        'DESK': { icon: <Armchair size={16} />, gradient: 'from-slate-600 to-gray-700' },
    };
    return configs[mode] || configs['FOOTBALL'];
};



import { useLocalization } from '../../services/localization/LocalizationContext';

export const HomeView: React.FC<HomeViewProps> = ({ userStats, settings, setView, startWorkout, newUnlockedBadge, updateSettings }) => {
    const { t } = useLocalization();
    const [showModeSelector, setShowModeSelector] = useState(false);

    const handleModeChange = (mode: SportMode) => {
        updateSettings({ ...settings, sportMode: mode });
        SoundEngine.playUI('click');
        setShowModeSelector(false);
    };

    // Initialize flexibility data if not exists
    const flexibilityData = userStats.flexibilityData || {
        shoulderROM: 65,
        hipROM: 70,
        spineROM: 55,
        lastUpdated: new Date().toISOString(),
        history: []
    };

    return (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 lg:grid-rows-[1.3fr_1fr_auto] gap-6 animate-[fadeIn_0.5s_ease-out] overflow-y-auto lg:overflow-hidden no-scrollbar pb-0 relative w-full lg:max-w-7xl mx-auto h-full">

            {/* Background Ambient Blobs */}
            <div className="absolute top-10 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
            <div className="absolute bottom-10 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-700 pointer-events-none"></div>

            {/* 1. HERO CARD - Takes Top-Left (2 cols) & Expands Vertically */}
            <div className="lg:col-span-2 bg-gradient-to-br from-indigo-900/90 to-slate-900/90 backdrop-blur-md border border-indigo-500/30 p-6 rounded-[2rem] shadow-2xl relative overflow-hidden group z-10 flex flex-col justify-between h-full">
                <div className="absolute -right-4 -top-4 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl group-hover:bg-indigo-500/30 transition-all"></div>

                {/* Header Section */}
                <div className="relative z-10 flex justify-between items-start">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-4xl lg:text-5xl font-black italic text-white leading-none tracking-tight drop-shadow-xl">{t('home.daily_mission')}</h2>
                        {(() => {
                            const modeConfig = getSportModeConfig(settings.sportMode || 'FOOTBALL');
                            return (
                                <button
                                    onClick={() => setShowModeSelector(true)}
                                    className="text-white text-sm font-bold mt-2 w-fit flex items-center gap-2 hover:scale-105 transition-all px-4 py-2 rounded-xl border border-white/20 hover:border-white/40 active:scale-95 shadow-lg relative overflow-hidden group/btn"
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-r ${modeConfig.gradient} opacity-80 group-hover:opacity-100 animate-pulse`}></div>
                                    <div className="relative z-10">{modeConfig.icon}</div>
                                    <span className="relative z-10 drop-shadow-md uppercase tracking-widest">{t(`mode.${(settings.sportMode || 'FOOTBALL').toLowerCase()}.name`)}</span>
                                </button>
                            );
                        })()}
                    </div>

                    {/* Streak Badge */}
                    <div className="flex items-center gap-2 text-orange-400 font-bold text-xl bg-orange-500/10 px-4 py-3 rounded-2xl border border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.1)]">
                        <Zap size={24} fill="currentColor" className="animate-[pulse_3s_infinite]" />
                        <span className="font-mono">{userStats.streak}</span>
                    </div>
                </div>

                {/* Bottom Section: XP & Play */}
                <div className="space-y-6 relative z-10 mt-auto">
                    <div onClick={() => setView(AppView.LEVELING)} className="cursor-pointer hover:scale-[1.01] transition-transform">
                        <XPBar xp={userStats.xp} level={userStats.level} />
                    </div>
                    <button onClick={startWorkout} className="w-full py-5 lg:py-6 bg-white text-indigo-950 rounded-2xl font-black text-xl lg:text-2xl shadow-[0_0_30px_rgba(255,255,255,0.25)] active:scale-[0.98] transition-all flex items-center justify-center gap-3 hover:bg-indigo-50 hover:shadow-[0_0_50px_rgba(255,255,255,0.5)] relative overflow-hidden group/play">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent skew-x-[-20deg] animate-[shine_2.5s_infinite] opacity-50 group-hover:opacity-80"></div>
                        <Play fill="currentColor" size={28} className="group-hover/play:scale-110 transition-transform" />
                        <span className="relative z-10">{t('home.start')}</span>
                    </button>
                </div>
            </div>

            {/* 2. STATS COLUMN - Takes Top-Right (1 col) & Expands Vertically */}
            <div className="lg:col-span-1 grid grid-cols-2 lg:grid-cols-1 gap-6 z-10 h-full">
                <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-md p-6 rounded-[2rem] border border-white/5 shadow-xl flex flex-col items-center justify-center relative overflow-hidden group h-full">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-all"></div>
                    <div className="p-4 bg-cyan-500/10 rounded-full mb-4 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                        <Target size={32} className="text-cyan-400" />
                    </div>
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mb-2">Total Score</div>
                    <div className="text-3xl lg:text-5xl font-black text-white font-mono tracking-tighter group-hover:text-cyan-200 transition-colors">{userStats.totalPoints.toLocaleString()}</div>
                </div>

                <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-md p-6 rounded-[2rem] border border-white/5 shadow-xl flex flex-col items-center justify-center relative overflow-hidden group h-full">
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all"></div>
                    <div className="p-4 bg-emerald-500/10 rounded-full mb-4 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_20px_rgba(52,211,153,0.2)]">
                        <ActivityIcon size={32} className="text-emerald-400" />
                    </div>
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mb-2">Workouts</div>
                    <div className="text-3xl lg:text-5xl font-black text-white font-mono tracking-tighter group-hover:text-emerald-200 transition-colors">{userStats.workoutsCompleted}</div>
                </div>
            </div>

            {/* 3. FLEXIBILITY TRACKER - Takes Mid-Left (2 cols) */}
            <div className="lg:col-span-2 z-10 h-full">
                <div className="h-full bg-slate-900/40 rounded-[2rem] border border-white/5 backdrop-blur-sm shadow-lg flex flex-col justify-center p-2">
                    <FlexibilityTracker data={flexibilityData} />
                </div>
            </div>

            {/* 4. TROPHY CASE - Takes Mid-Right (1 col) */}
            <div className="lg:col-span-1 z-10 h-full min-h-0">
                <div className="h-full bg-slate-900/40 rounded-[2rem] border border-white/5 backdrop-blur-sm p-4 flex flex-col shadow-lg overflow-hidden">
                    <TrophyCase badges={userStats.badges} newBadgeId={newUnlockedBadge || undefined} />
                </div>
            </div>

            {/* 5. LEADERBOARD BUTTON - Footer (Full Width) */}
            <button onClick={() => { SoundEngine.playUI('click'); setView(AppView.LEADERBOARD); }} className="lg:col-span-3 w-full h-[60px] lg:h-auto bg-slate-800/40 border border-slate-700/50 rounded-2xl font-bold text-slate-400 hover:bg-slate-700 hover:text-white hover:border-slate-500 transition-all tracking-wide text-sm flex items-center justify-center gap-3 z-10 group mt-auto">
                <Trophy size={18} className="group-hover:scale-110 transition-transform text-amber-400" />
                <span className="group-hover:tracking-widest transition-all duration-300">{t('leaderboard.title')}</span>
            </button>

            {/* Sport Mode Selector Modal */}
            {showModeSelector && (
                <SportModeSelector
                    currentMode={settings.sportMode || 'FOOTBALL'}
                    onSelectMode={handleModeChange}
                    onClose={() => setShowModeSelector(false)}
                />
            )}
        </div>
    );
};
