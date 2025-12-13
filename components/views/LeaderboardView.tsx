import React from 'react';
import { LeaderboardList } from '../Gamification';
import { AppView, LeaderboardEntry, UserStats } from '../../types';
import { ArrowLeft } from 'lucide-react';
import { SoundEngine } from '../../services/audioService';
import { useLocalization } from '../../services/localization/LocalizationContext';

interface LeaderboardViewProps {
    entries: LeaderboardEntry[];
    userStats: UserStats;
    userRank: number;
    setView: (view: AppView) => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ entries, userStats, userRank, setView }) => {
    const { t } = useLocalization();
    const isUserInTop = entries.some(e => e.id === userStats.userId);

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden animate-[fadeIn_0.3s_ease-out]">
            {/* Header */}
            <div className="flex items-center mb-4 shrink-0">
                <button onClick={() => { SoundEngine.playUI('back'); setView(AppView.HOME); }} className="p-2 bg-slate-800 rounded-full mr-4 hover:bg-slate-700 transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h2 className="text-2xl font-bold">{t('leaderboard.title')}</h2>
                    <p className="text-xs text-slate-400">{t('leaderboard.subtitle')}</p>
                </div>
            </div>

            {/* Scrollable List */}
            <div className="flex-1 overflow-y-auto px-1 pb-4 no-scrollbar">
                <LeaderboardList entries={entries} />

                {entries.length === 0 && (
                    <div className="text-center py-10 text-slate-500">
                        {t('leaderboard.empty')}
                    </div>
                )}
            </div>

            {/* Pinned User Stats (if not in top list) */}
            {!isUserInTop && (
                <div className="shrink-0 pt-2 border-t border-slate-700/50">
                    <div className="relative flex items-center p-3 rounded-xl border border-indigo-500/50 bg-indigo-900/40 ring-1 ring-indigo-500 shadow-xl">
                        {/* RANK */}
                        <div className="flex-shrink-0 w-10 flex items-center justify-center font-black text-lg italic text-slate-400">
                            #{userRank > 0 ? userRank : '-'}
                        </div>

                        {/* AVATAR */}
                        <div className="relative mx-3">
                            <div className="w-10 h-10 rounded-full bg-slate-700 border-2 border-white/20 flex items-center justify-center text-xl shadow-lg">
                                {/* Simple avatar logic or from a map if available */}
                                🦸
                            </div>
                        </div>

                        {/* INFO */}
                        <div className="flex-grow flex flex-col justify-center overflow-hidden">
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-bold truncate text-indigo-300">
                                    {userStats.username || t('leaderboard.you')}
                                </h3>
                                <span className="text-[8px] bg-indigo-600 text-white px-1.5 py-0.5 rounded font-bold tracking-wider">{t('leaderboard.you')}</span>
                            </div>
                            <div className="flex items-center gap-1 mt-0.5">
                                <span className="text-[9px] bg-slate-900/50 px-1.5 py-0.5 rounded text-slate-400 font-mono">Lvl {userStats.level}</span>
                            </div>
                        </div>

                        {/* POINTS */}
                        <div className="flex-shrink-0 text-right pl-2">
                            <div className="text-base font-black font-mono tracking-tight text-white leading-none">
                                {userStats.totalPoints.toLocaleString()}
                            </div>
                            <div className="text-[8px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">{t('header.points')}</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
