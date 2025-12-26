import React from 'react';
import { SportMode } from '../types';
import { useLocalization } from '../services/localization/LocalizationContext';
import { CircleDot, Trophy, Activity, Bike, Armchair } from 'lucide-react';


interface SportModeSelectorProps {
    currentMode: SportMode;
    onSelectMode: (mode: SportMode) => void;
    onClose: () => void;
}

const sportModes: { mode: SportMode; icon: React.ReactNode; gradient: string }[] = [
    { mode: 'FOOTBALL', icon: <CircleDot size={24} />, gradient: 'from-green-600 to-emerald-700' },
    { mode: 'RUGBY', icon: <Trophy size={24} />, gradient: 'from-amber-600 to-orange-700' },
    { mode: 'RUNNER', icon: <Activity size={24} />, gradient: 'from-blue-600 to-cyan-700' },
    { mode: 'CYCLIST', icon: <Bike size={24} />, gradient: 'from-purple-600 to-pink-700' },
    { mode: 'DESK', icon: <Armchair size={24} />, gradient: 'from-slate-600 to-gray-700' },
];


export const SportModeSelector: React.FC<SportModeSelectorProps> = ({ currentMode, onSelectMode, onClose }) => {
    const { t } = useLocalization();

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-[fadeIn_0.3s_ease-out]">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl animate-[slideUp_0.4s_ease-out]">

                {/* Header - Fixed */}
                <div className="text-center px-6 py-4 border-b border-slate-700/50 shrink-0">
                    <h2 className="text-2xl md:text-3xl font-black text-white mb-1">{t('mode.select_title')}</h2>
                    <p className="text-slate-400 text-xs md:text-sm">{t('mode.select_desc')}</p>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto flex-1 px-6 py-4 space-y-2">
                    {sportModes.map(({ mode, icon, gradient }) => (
                        <button
                            key={mode}
                            onClick={() => onSelectMode(mode)}
                            className={`w-full p-3 rounded-xl border-2 transition-all flex items-center gap-3 group ${currentMode === mode
                                ? 'border-white bg-white/10 scale-[1.02]'
                                : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800/50'
                                }`}
                        >
                            <div className={`p-2.5 rounded-lg bg-gradient-to-br ${gradient} text-white group-hover:scale-110 transition-transform`}>
                                {React.cloneElement(icon as React.ReactElement<any>, { size: 20 })}
                            </div>
                            <div className="flex-1 text-left">
                                <h3 className="font-bold text-white text-base md:text-lg">{t(`mode.${mode.toLowerCase()}.name`)}</h3>
                                <p className="text-slate-400 text-[10px] md:text-xs">{t(`mode.${mode.toLowerCase()}.desc`)}</p>
                            </div>
                            {currentMode === mode && (
                                <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Footer - Fixed */}
                <div className="px-6 py-4 border-t border-slate-700/50 shrink-0">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-100 transition-colors text-sm md:text-base"
                    >
                        {t('badge.continue')}
                    </button>
                </div>
            </div>
        </div>
    );
};
