import React, { useEffect } from 'react';
import { BadgeCheck, Sparkles, ChevronRight } from 'lucide-react';
import { SoundEngine } from '../services/audioService';

interface BadgeRevealProps {
  badges: string[];
  onClose: () => void;
}

const BADGE_INFO: Record<string, { name: string; icon: string; desc: string }> = {
    'first_step': { name: 'Rookie', icon: '👟', desc: 'First workout complete!' },
    'on_fire': { name: 'Ignited', icon: '🔥', desc: '3 Day Streak achieved!' },
    'champion': { name: 'Legend', icon: '🏆', desc: '1000 Points in one go!' },
    'combo_king': { name: 'Volt', icon: '⚡', desc: 'Max combo reached!' },
    'survivor': { name: 'Tank', icon: '🛡️', desc: 'Survived with low health' },
    'ninja': { name: 'Ninja', icon: '🥷', desc: 'Perfect precision' },
};

const BadgeReveal: React.FC<BadgeRevealProps> = ({ badges, onClose }) => {
  
  useEffect(() => {
    SoundEngine.playUnlock();
  }, []);

  const badgeId = badges[0]; // Show first new badge (simplify for now, or loop)
  const info = BADGE_INFO[badgeId] || { name: 'Unknown', icon: '❓', desc: 'Mystery Badge' };

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
                <h2 className="text-sm font-bold text-yellow-400 uppercase tracking-[0.3em] animate-pulse">New Accolade</h2>
                <h1 className="text-5xl font-black text-white uppercase italic">{info.name}</h1>
                <p className="text-slate-300 font-medium text-lg">{info.desc}</p>
            </div>

            <button 
                onClick={() => { SoundEngine.playUI('click'); onClose(); }}
                className="px-10 py-4 bg-white text-black font-black rounded-full text-lg hover:scale-105 transition-transform flex items-center gap-2 mx-auto"
            >
                CONTINUE <ChevronRight />
            </button>
        </div>
    </div>
  );
};

export default BadgeReveal;