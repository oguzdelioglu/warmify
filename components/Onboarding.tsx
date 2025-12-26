import React, { useState, useEffect } from 'react';
import { ChevronRight, Camera, Trophy, Sparkles, Activity, Target, Zap, Shield, Mic, Users, Star, Check, X, Clock, Heart } from 'lucide-react';
import { OnboardingAnswers } from '../types';
import { AdaptyService } from '../services/adaptyService';
import { SoundEngine } from '../services/audioService';

interface OnboardingProps {
  onComplete: (username?: string) => void;
}

import { useLocalization } from '../services/localization/LocalizationContext';

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const { t } = useLocalization();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>({ goal: '', level: '', frequency: '' });
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // Animated counter for social proof
  const [userCount, setUserCount] = useState(247);
  useEffect(() => {
    const interval = setInterval(() => {
      setUserCount(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // --- SLIDES & QUESTIONS ---
  const introSlides = [
    {
      type: 'welcome',
      icon: <Sparkles size={56} className="text-blue-400" />,
      title: t('onboarding.welcome.title_personal'),
      desc: t('onboarding.welcome.desc_personal'),
      color: "from-blue-600 to-indigo-600",
      cta: t('onboarding.cta.start_journey')
    },
    {
      type: 'social',
      icon: <Users size={56} className="text-emerald-400" />,
      title: t('onboarding.social.title'),
      desc: t('onboarding.social.subtitle'),
      color: "from-emerald-600 to-teal-600",
      cta: t('onboarding.cta.unlock_plan'),
      extra: {
        rating: t('onboarding.social.rating'),
        countries: t('onboarding.social.countries'),
        joining: t('onboarding.social.joining'),
        count: userCount
      }
    },
    {
      type: 'compare',
      icon: <Zap size={56} className="text-yellow-400" />,
      title: t('onboarding.compare.title'),
      color: "from-yellow-600 to-orange-600",
      cta: t('onboarding.cta.claim'),
      comparison: [
        { old: t('onboarding.compare.setup_old'), new: t('onboarding.compare.setup_new') },
        { old: t('onboarding.compare.feedback_old'), new: t('onboarding.compare.feedback_new') },
        { old: t('onboarding.compare.boring_old'), new: t('onboarding.compare.boring_new') }
      ]
    },
    {
      type: 'promise',
      icon: <Shield size={56} className="text-indigo-400" />,
      title: t('onboarding.promise.title'),
      color: "from-indigo-600 to-purple-600",
      cta: t('onboarding.promise.cta'),
      promises: [
        t('onboarding.promise.no_card'),
        t('onboarding.promise.cancel'),
        t('onboarding.promise.privacy')
      ]
    }
  ];

  const questions = [
    {
      id: 'goal',
      title: t('onboarding.goal.q_personal'),
      options: [
        { label: t('onboarding.goal.opt1'), icon: "🔥" },
        { label: t('onboarding.goal.opt2'), icon: "💪" },
        { label: t('onboarding.goal.opt3'), icon: "🧘" },
        { label: t('onboarding.goal.opt4'), icon: "🏃" }
      ]
    },
    {
      id: 'level',
      title: t('onboarding.level.q_personal'),
      options: [
        { label: t('onboarding.level.opt1'), icon: "🌱" },
        { label: t('onboarding.level.opt2'), icon: "⚔️" },
        { label: t('onboarding.level.opt3'), icon: "🏆" }
      ]
    },
    {
      id: 'frequency',
      title: t('onboarding.freq.q_personal'),
      options: [
        { label: t('onboarding.freq.opt1'), icon: "📅" },
        { label: t('onboarding.freq.opt2'), icon: "⚡" },
        { label: t('onboarding.freq.opt3'), icon: "🔥" }
      ]
    }
  ];

  const handleNext = async () => {
    SoundEngine.playUI('click');
    setStep(step + 1);
  };

  const handleOptionSelect = async (option: string) => {
    SoundEngine.playUI('click');
    const questionIndex = step - introSlides.length;
    const currentQ = questions[questionIndex];

    const newAnswers = { ...answers, [currentQ.id]: option };
    setAnswers(newAnswers);

    if (questionIndex < questions.length - 1) {
      setStep(step + 1);
    } else {
      // Completed all questions
      setIsLoading(true);
      await AdaptyService.saveUserAttributes(newAnswers);
      setIsLoading(false);
      onComplete(); // Pass username back
    }
  };

  const isIntro = step < introSlides.length;
  const isQuestion = step >= introSlides.length;

  const currentSlide = isIntro ? introSlides[step] : null;
  const currentQuestion = isQuestion ? questions[step - introSlides.length] : null;

  return (
    <div className="absolute inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-900 to-slate-900 animate-pulse"></div>
      </div>

      <div className="w-full max-w-sm relative z-10">

        {isIntro && currentSlide && (
          <div className="animate-[fadeIn_0.5s_ease-out]">
            {/* Icon Badge */}
            <div className="mb-8 flex justify-center">
              <div className="p-6 bg-slate-800/80 backdrop-blur-xl rounded-[2rem] shadow-[0_0_40px_rgba(79,70,229,0.3)] border border-white/10 ring-1 ring-white/20">
                {currentSlide.icon}
              </div>
            </div>

            {/* Title */}
            <h2 className="text-3xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-br from-white to-slate-400">
              {currentSlide.title}
            </h2>

            {/* Type-specific content */}
            {currentSlide.type === 'welcome' && (
              <p className="text-slate-400 text-lg mb-8 leading-relaxed font-medium">
                {currentSlide.desc}
              </p>
            )}

            {currentSlide.type === 'social' && currentSlide.extra && (
              <div className="mb-8 space-y-4">
                <p className="text-slate-400 text-base mb-4">{currentSlide.desc}</p>

                {/* Star Rating */}
                <div className="flex items-center justify-center gap-2 text-yellow-400 font-bold">
                  <Star size={20} fill="currentColor" />
                  <span className="text-white">{currentSlide.extra.rating}</span>
                </div>

                {/* Countries */}
                <p className="text-emerald-400 font-medium">{currentSlide.extra.countries}</p>

                {/* Live Counter */}
                <div className="flex items-center justify-center gap-2 bg-slate-800/60 py-2 px-4 rounded-full border border-emerald-500/30">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <span className="text-white font-bold">{currentSlide.extra.count}</span>
                  <span className="text-slate-400">{currentSlide.extra.joining}</span>
                </div>
              </div>
            )}

            {currentSlide.type === 'compare' && currentSlide.comparison && (
              <div className="mb-8 space-y-3">
                {currentSlide.comparison.map((item: { old: string; new: string }, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 text-left">
                    <div className="flex-1 bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm flex items-center gap-2">
                      <X size={16} className="flex-shrink-0" />
                      <span className="line-through opacity-70">{item.old}</span>
                    </div>
                    <div className="flex-1 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-emerald-400 text-sm flex items-center gap-2">
                      <Check size={16} className="flex-shrink-0" />
                      <span className="font-semibold">{item.new}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {currentSlide.type === 'promise' && currentSlide.promises && (
              <div className="mb-8 space-y-3">
                {currentSlide.promises.map((promise: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 bg-slate-800/60 rounded-xl p-4 border border-indigo-500/20">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                      <Check size={18} className="text-indigo-400" />
                    </div>
                    <span className="text-white font-medium text-left">{promise}</span>
                  </div>
                ))}
              </div>
            )}

            {/* CTA Button */}
            <button
              onClick={handleNext}
              className={`w-full py-4 rounded-2xl font-black text-lg text-white shadow-2xl bg-gradient-to-r ${currentSlide.color} hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 group`}
            >
              {currentSlide.cta || t('onboarding.next')} <ChevronRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        {isQuestion && currentQuestion && (
          <div className="animate-[slideUp_0.4s_ease-out]">
            <div className="mb-8">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2 block">{t('onboarding.step_counter')} {step - introSlides.length + 1}/{questions.length}</span>
              <h2 className="text-3xl font-black text-white">{currentQuestion.title}</h2>
            </div>

            <div className="flex flex-col gap-3">
              {currentQuestion.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(opt.label)}
                  disabled={isLoading}
                  className="w-full p-4 rounded-2xl bg-slate-800/60 border border-slate-700 hover:bg-indigo-600/20 hover:border-indigo-500 transition-all flex items-center justify-between group active:scale-95"
                >
                  <span className="font-bold text-slate-200 group-hover:text-white">{opt.label}</span>
                  <span className="text-2xl">{opt.icon}</span>
                </button>
              ))}
            </div>
            {isLoading && <div className="mt-4 text-slate-500 text-sm animate-pulse">{t('onboarding.syncing')}</div>}
          </div>
        )}

        {/* Progress Dots */}
        <div className="absolute -bottom-20 left-0 w-full flex justify-center space-x-2">
          {Array.from({ length: introSlides.length + questions.length }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-indigo-500' : 'w-1.5 bg-slate-700'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );

};

export default Onboarding;