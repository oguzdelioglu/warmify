import React, { useEffect } from 'react';
import { BadgeCheck, Sparkles, ChevronRight } from 'lucide-react';
import { SoundEngine } from '../services/audioService';

interface BadgeRevealProps {
  badges: string[];
  onClose: () => void;
}

import { TranslationKeys } from '../services/localization/types';
import { useLocalization } from '../services/localization/LocalizationContext';

const BADGE_INFO: Record<string, { nameKey: keyof TranslationKeys; icon: string; descKey: keyof TranslationKeys }> = {
  'first_step': { nameKey: 'badge.first_step.name', icon: '👟', descKey: 'badge.first_step.desc' },
  'on_fire': { nameKey: 'badge.on_fire.name', icon: '🔥', descKey: 'badge.on_fire.desc' },
  'champion': { nameKey: 'badge.champion.name', icon: '🏆', descKey: 'badge.champion.desc' },
  'combo_king': { nameKey: 'badge.combo_king.name', icon: '⚡', descKey: 'badge.combo_king.desc' },
  'survivor': { nameKey: 'badge.survivor.name', icon: '🛡️', descKey: 'badge.survivor.desc' },
  'ninja': { nameKey: 'badge.ninja.name', icon: '🥷', descKey: 'badge.ninja.desc' },
};

const BadgeReveal: React.FC<BadgeRevealProps> = ({ badges, onClose }) => {
  const { t } = useLocalization();

  useEffect(() => {
    SoundEngine.playUnlock();
  }, []);

  const badgeId = badges[0]; // Show first new badge (simplify for now, or loop)
  const info = BADGE_INFO[badgeId] || { nameKey: 'badge.unknown.name', icon: '❓', descKey: 'badge.unknown.desc' };

  return (
    <div className="absolute inset-0 z-[60] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center animate-[fadeIn_0.5s_ease-out]">

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#4f46e5_0%,_transparent_70%)] opacity-30"></div>

      <div className="relative z-10 animate-badge-reveal">
        <div className="w-48 h-48 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl rotate-3 flex items-center justify-center shadow-[0_0_60px_rgba(251,191,36,0.5)] border-4 border-white mb-8 relative">
          <div className="absolute -inset-4 border border-yellow-500/30 rounded-[2rem] animate-ping opacity-20"></div>
          <div className="text-8xl filter drop-shadow-xl">{info.icon}</div>
          <div className="absolute -top-4 -right-4 bg-white text-black p-2 rounded-full shadow-lg">
            <Sparkles size={24} className="text-yellow-500 animate-spin-slow" />
          </div>
        </div>

        <div className="space-y-2 mb-12">
          <h2 className="text-sm font-bold text-yellow-400 uppercase tracking-[0.3em] animate-pulse">{t('badge.new_accolade')}</h2>
          <h1 className="text-5xl font-black text-white uppercase italic">{t(info.nameKey as any)}</h1>
          <p className="text-slate-300 font-medium text-lg">{t(info.descKey as any)}</p>
        </div>

        <button
          onClick={() => { SoundEngine.playUI('click'); onClose(); }}
          className="px-10 py-4 bg-white text-black font-black rounded-full text-lg hover:scale-105 transition-transform flex items-center gap-2 mx-auto"
        >
          {t('badge.continue')} <ChevronRight />
        </button>
      </div>
    </div>
  );
};

export default BadgeReveal;