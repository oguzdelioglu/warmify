import React, { useEffect, useState } from 'react';
import { WorkoutResultData } from '../types';
import { Trophy, RotateCcw, CheckCircle2 } from 'lucide-react';
import { SoundEngine } from '../services/audioService';

interface WorkoutResultsProps {
    data: WorkoutResultData;
    onClaim: () => void;
    onRestart: () => void;
}

import { useLocalization } from '../services/localization/LocalizationContext';

const WorkoutResults: React.FC<WorkoutResultsProps> = ({ data, onClaim, onRestart }) => {
    const { t } = useLocalization();
    const [displayScore, setDisplayScore] = useState(0);

    useEffect(() => {
        SoundEngine.playLevelUp(); // Success sound

        let start = 0;
        const end = data.score;
        const duration = 1500;
        const increment = end / (duration / 16);

        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                setDisplayScore(end);
                clearInterval(timer);
            } else {
                setDisplayScore(Math.floor(start));
            }
        }, 16);

        return () => clearInterval(timer);
    }, [data.score]);

    const handleClaim = () => {
        SoundEngine.playUI('click');
        onClaim();
    };

    return (
        <div className="absolute inset-0 z-50 bg-[#0f172a] flex flex-col items-center justify-center p-6 overflow-hidden pt-[env(safe-area-inset-top)] pb-[calc(env(safe-area-inset-bottom)+2rem)]">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-900 to-slate-900"></div>
            <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100"></div>

            <div className="relative z-10 w-full max-w-sm animate-[slideUp_0.5s_ease-out] flex flex-col h-full">

                <div className="flex-1 flex flex-col items-center justify-center">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="inline-block p-5 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-[0_0_50px_rgba(251,191,36,0.4)] mb-6 animate-[bounce_1.5s_infinite]">
                            <Trophy size={64} className="text-white" fill="currentColor" />
                        </div>
                        <h1 className="text-5xl font-black italic text-white tracking-tighter drop-shadow-xl uppercase mb-2">
                            {t('results.complete_title')}
                        </h1>
                        <p className="text-indigo-200 font-medium tracking-wide">{t('results.complete_desc')}</p>
                    </div>

                    {/* Score & Stats */}
                    <div className="w-full bg-slate-800/60 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl">
                        <div className="text-center border-b border-white/10 pb-8 mb-8">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">{t('results.total_score')}</span>
                            <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 font-mono mt-4 tracking-tight">
                                {displayScore.toLocaleString()}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-indigo-900/30 p-4 rounded-2xl border border-indigo-500/20 text-center">
                                <div className="text-[10px] text-indigo-300 font-bold uppercase mb-1">{t('results.xp_gained')}</div>
                                <div className="text-3xl font-bold text-white">+{data.xpGained}</div>
                            </div>
                            <div className="bg-emerald-900/30 p-4 rounded-2xl border border-emerald-500/20 text-center">
                                <div className="text-[10px] text-emerald-300 font-bold uppercase mb-1">{t('results.level_progress')}</div>
                                {data.isLevelUp ? (
                                    <div className="text-xs font-bold text-emerald-400 animate-pulse mt-2">{t('results.level_up_anim')}</div>
                                ) : (
                                    <div className="w-full bg-slate-700 h-2 rounded-full mt-3 overflow-hidden">
                                        <div className="bg-emerald-500 h-full animate-[shine_2s_infinite]" style={{ width: '70%' }}></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4 pt-6 shrink-0">
                    <button onClick={() => { SoundEngine.playUI('back'); onRestart(); }} className="py-4 rounded-2xl bg-slate-800 font-bold text-slate-300 hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
                        <RotateCcw size={18} /> {t('results.retry')}
                    </button>
                    <button onClick={handleClaim} className="py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 font-black text-white shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:scale-105 transition-transform flex items-center justify-center gap-2 relative overflow-hidden group">
                        <div className="absolute top-0 -left-[100%] w-[50%] h-full bg-white/20 skew-x-[-20deg] animate-[shine_3s_infinite]"></div>
                        <CheckCircle2 size={18} /> {t('results.claim')}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default WorkoutResults;