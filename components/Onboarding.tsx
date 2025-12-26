import React, { useState } from 'react';
import { ChevronRight, Camera, Trophy, Sparkles, Activity, Target, Zap, Shield, Mic } from 'lucide-react';
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
  const [permissionStatus, setPermissionStatus] = useState<'idle' | 'granted' | 'denied'>('idle');
  const [showPermissionAlert, setShowPermissionAlert] = useState(false);

  // --- SLIDES & QUESTIONS ---
  const introSlides = [
    {
      icon: <Sparkles size={56} className="text-blue-400" />,
      title: t('onboarding.welcome.title'),
      desc: t('onboarding.welcome.desc'),
      color: "from-blue-600 to-indigo-600"
    },
    {
      icon: <Trophy size={56} className="text-yellow-400" />,
      title: t('onboarding.gamify.title'),
      desc: t('onboarding.gamify.desc'),
      color: "from-yellow-600 to-orange-600"
    }
  ];

  // Store guidelines require explicit context before requesting camera
  const permissionSlide = {
    title: t('onboarding.permission.title'),
    desc: t('onboarding.permission.desc'),
  };

  const questions = [
    {
      id: 'goal',
      title: t('onboarding.goal.q'),
      options: [
        { label: t('onboarding.goal.opt1'), icon: "🔥" },
        { label: t('onboarding.goal.opt2'), icon: "💪" },
        { label: t('onboarding.goal.opt3'), icon: "🧘" },
        { label: t('onboarding.goal.opt4'), icon: "🏃" }
      ]
    },
    {
      id: 'level',
      title: t('onboarding.level.q'),
      options: [
        { label: t('onboarding.level.opt1'), icon: "🌱" },
        { label: t('onboarding.level.opt2'), icon: "⚔️" },
        { label: t('onboarding.level.opt3'), icon: "🏆" }
      ]
    },
    {
      id: 'frequency',
      title: t('onboarding.freq.q'),
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

  const requestPermissions = async () => {
    SoundEngine.playUI('click');
    try {
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setPermissionStatus('granted');
      SoundEngine.playLevelUp();
      setTimeout(() => setStep(step + 1), 500);
    } catch (err) {
      console.error(err);
      setPermissionStatus('denied');
      setShowPermissionAlert(true);
    }
  };

  const handleOptionSelect = async (option: string) => {
    SoundEngine.playUI('click');
    const questionIndex = step - (introSlides.length + 1); // +1 for permission slide
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
  const isPermission = step === introSlides.length;
  const isQuestion = step > introSlides.length;

  const currentSlide = isIntro ? introSlides[step] : null;
  const currentQuestion = isQuestion ? questions[step - (introSlides.length + 1)] : null;

  return (
    <div className="absolute inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-900 to-slate-900 animate-pulse"></div>
      </div>

      <div className="w-full max-w-sm relative z-10">

        {isIntro && currentSlide && (
          <div className="animate-[fadeIn_0.5s_ease-out]">
            <div className="mb-12 flex justify-center">
              <div className="p-8 bg-slate-800/80 backdrop-blur-xl rounded-[2rem] shadow-[0_0_40px_rgba(79,70,229,0.3)] border border-white/10 ring-1 ring-white/20">
                {currentSlide.icon}
              </div>
            </div>

            <h2 className="text-4xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-br from-white to-slate-400">
              {currentSlide.title}
            </h2>

            <p className="text-slate-400 text-lg mb-12 leading-relaxed font-medium">
              {currentSlide.desc}
            </p>

            <button
              onClick={handleNext}
              className={`w-full py-4 rounded-2xl font-black text-lg text-white shadow-2xl bg-gradient-to-r ${currentSlide.color} hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 group`}
            >
              {t('onboarding.next')} <ChevronRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        {isPermission && (
          <div className="animate-[fadeIn_0.5s_ease-out]">
            <div className="mb-10 flex justify-center gap-4">
              <div className={`p-6 rounded-full border-2 transition-all ${permissionStatus === 'granted' ? 'bg-emerald-500/20 border-emerald-500' : 'bg-slate-800 border-indigo-500'}`}>
                <Camera size={40} className={permissionStatus === 'granted' ? 'text-emerald-400' : 'text-white'} />
              </div>
              <div className={`p-6 rounded-full border-2 transition-all ${permissionStatus === 'granted' ? 'bg-emerald-500/20 border-emerald-500' : 'bg-slate-800 border-indigo-500'}`}>
                <Mic size={40} className={permissionStatus === 'granted' ? 'text-emerald-400' : 'text-white'} />
              </div>
            </div>

            <h2 className="text-3xl font-black mb-4 text-white">
              {permissionSlide.title}
            </h2>
            <p className="text-slate-400 text-sm mb-12 leading-relaxed bg-slate-800/50 p-4 rounded-xl border border-white/5">
              {permissionSlide.desc}
            </p>

            <button
              onClick={requestPermissions}
              disabled={permissionStatus === 'granted'}
              className={`w-full py-4 rounded-2xl font-black text-lg text-white shadow-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 group`}
            >
              {permissionStatus === 'idle' && <>{t('onboarding.permission.grant')} <Shield size={18} /></>}
              {permissionStatus === 'granted' && <>{t('onboarding.permission.granted')} <Zap size={18} /></>}
              {permissionStatus === 'denied' && <>{t('onboarding.permission.denied')}</>}
            </button>
          </div>
        )}

        {isQuestion && currentQuestion && (
          <div className="animate-[slideUp_0.4s_ease-out]">
            <div className="mb-8">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2 block">{t('onboarding.step_counter')} {step - (introSlides.length + 1)}/{questions.length}</span>
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
          {Array.from({ length: introSlides.length + 1 + questions.length }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-indigo-500' : 'w-1.5 bg-slate-700'}`}
            />
          ))}
        </div>
      </div>

      {showPermissionAlert && (
        <div className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 fade-in">
          <div className="bg-slate-800 border border-slate-600 rounded-2xl p-6 max-w-sm w-full shadow-2xl transform scale-100 animate-slide-up">
            <div className="flex justify-center mb-4 text-red-400">
              <Shield size={48} />
            </div>
            <h3 className="text-xl font-black text-white text-center mb-2">{t('onboarding.permission.required_title')}</h3>
            <div className="text-slate-300 text-center mb-6 leading-relaxed space-y-4">
              <p>{t('onboarding.permission.required_desc')}</p>

              <div className="bg-slate-900/50 p-3 rounded-xl border border-white/10 text-sm text-left">
                <p className="font-bold text-indigo-400 mb-1">How to fix:</p>
                <ol className="list-decimal list-inside space-y-1 text-slate-400">
                  <li>Click the <span className="text-white"><Shield size={12} className="inline" /> Lock Icon</span> in your address bar (top left).</li>
                  <li>Find <span className="text-white">Camera & Microphone</span>.</li>
                  <li>Click <span className="text-white">Reset Permission</span> or Toggle On.</li>
                  <li>Click the button below to refresh.</li>
                </ol>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-colors shadow-lg"
              >
                Refresh Page
              </button>
              <button
                onClick={() => setShowPermissionAlert(false)}
                className="w-full py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Onboarding;