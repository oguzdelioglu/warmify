
import React, { useState, useEffect } from 'react';
import { X, Check, Zap, Crown, Star, ShieldCheck, Activity } from 'lucide-react';
import { AdaptyService, AdaptyProduct } from '../services/adaptyService';
import { SoundEngine } from '../services/audioService';

interface PaywallProps {
    onClose: () => void;
    onPurchaseSuccess: () => void;
}

import { useLocalization } from '../services/localization/LocalizationContext';

const Paywall: React.FC<PaywallProps> = ({ onClose, onPurchaseSuccess }) => {
    const { t } = useLocalization();
    const [isLoading, setIsLoading] = useState(false);
    const [product, setProduct] = useState<AdaptyProduct | null>(null);
    const [isFetching, setIsFetching] = useState(true);

    useEffect(() => {
        const loadPaywall = async () => {
            try {
                const placementId = import.meta.env.VITE_ADAPTY_PLACEMENT_ID || 'default_placement';
                const paywall = await AdaptyService.getPaywall(placementId);

                if (paywall && paywall.products.length > 0) {
                    // Find annual product or take first
                    const annual = paywall.products.find(p => p.vendorProductId === 'warmify_annually') || paywall.products[0];
                    setProduct(annual);
                }
            } catch (err) {
                console.error("Failed to load paywall", err);
            } finally {
                setIsFetching(false);
            }
        };
        loadPaywall();
    }, []);

    const handlePurchase = async () => {
        SoundEngine.playUI('click');
        setIsLoading(true);
        // Use fetched ID or fallback
        const productId = product?.vendorProductId || 'warmify_annually';
        const success = await AdaptyService.makePurchase(productId);
        setIsLoading(false);
        if (success) {
            SoundEngine.playLevelUp();
            onPurchaseSuccess();
        }
    };

    const handleClose = () => {
        SoundEngine.playUI('back');
        onClose();
    };

    const benefits = [
        { icon: Activity, text: t('paywall.benefit1.title'), sub: t('paywall.benefit1.sub') },
        { icon: ShieldCheck, text: t('paywall.benefit2.title'), sub: t('paywall.benefit2.sub') },
        { icon: Crown, text: t('paywall.benefit3.title'), sub: t('paywall.benefit3.sub') },
        { icon: Star, text: t('paywall.benefit4.title'), sub: t('paywall.benefit4.sub') },
    ];

    // Defaults if fetch fails (fallback UI)
    const priceDisplay = product?.localizedPrice || "$59.99";
    const periodDisplay = product?.subscriptionPeriod === 'year' ? '/year' : '/month';
    const offerText = product?.introductoryOffer || t('paywall.save_percent');

    return (
        <div className="absolute inset-0 z-[60] bg-[#0f172a] text-white flex flex-col items-center justify-center overflow-hidden">

            {/* BACKGROUND FX */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[80%] bg-[radial-gradient(circle_at_center,_#4f46e5_0%,_transparent_60%)] opacity-40 animate-pulse duration-[4000ms]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[100%] h-[60%] bg-[radial-gradient(circle_at_center,_#db2777_0%,_transparent_60%)] opacity-20"></div>
                <div className="absolute inset-0 bg-[url('/assets/noise.svg')] opacity-20"></div>
            </div>

            {/* CLOSE BTN */}
            <button
                onClick={handleClose}
                className="absolute top-[max(env(safe-area-inset-top),16px)] right-5 z-50 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors backdrop-blur-md"
            >
                <X size={20} className="text-white/90" />
            </button>

            {/* MAIN LAYOUT: Flex Column */}
            <div className="relative z-10 w-full h-full max-w-md md:max-w-3xl mx-auto flex flex-col">

                {/* SCROLLABLE CONTENT (Top Part) */}
                <div className="flex-1 overflow-y-auto no-scrollbar px-6 pt-[calc(env(safe-area-inset-top,20px)+40px)] pb-4">

                    {/* 1. HEADER SECTION (Compacted) */}
                    <div className="flex flex-col items-center text-center animate-[fadeIn_0.5s_ease-out]">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 mb-4 backdrop-blur-md shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                            <Crown size={12} className="text-amber-400" fill="currentColor" />
                            <span className="text-[10px] font-black text-amber-300 uppercase tracking-widest">{t('paywall.badge')}</span>
                        </div>

                        <h1 className="text-4xl font-black leading-[0.9] tracking-tighter mb-2">
                            <span className="block text-white">{t('paywall.hero_start')}</span>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-cyan-400">
                                {t('paywall.hero_end')}
                            </span>
                        </h1>

                        <p className="text-slate-400 font-medium text-xs leading-relaxed max-w-[250px]">
                            {t('paywall.subtitle')}
                        </p>
                    </div>

                    {/* 2. BENEFITS LIST (Compacted) */}
                    <div className="flex flex-col justify-center gap-2 mt-6">
                        {benefits.map((b, i) => (
                            <div key={i} className="flex items-center gap-3 bg-white/5 p-2.5 rounded-xl border border-white/5 backdrop-blur-sm animate-[slideUp_0.5s_ease-out]" style={{ animationDelay: `${i * 100} ms`, opacity: 0, animationFillMode: 'forwards' }}>
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center shrink-0 shadow-lg">
                                    <b.icon size={16} className="text-white" />
                                </div>
                                <div>
                                    <div className="font-bold text-white text-xs">{b.text}</div>
                                    <div className="text-slate-400 text-[9px]">{b.sub}</div>
                                </div>
                                <div className="ml-auto">
                                    <Check size={14} className="text-emerald-400" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3. FIXED BOTTOM CTA (Sticky) */}
                <div className="w-full bg-[#0f172a]/95 backdrop-blur-xl border-t border-white/10 px-6 pt-4 pb-[calc(env(safe-area-inset-bottom,20px)+10px)] z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] animate-[slideUp_0.5s_ease-out_0.4s] opacity-0 [animation-fill-mode:forwards]">
                    {/* Price Tag */}
                    <div className="flex justify-between items-end px-1 mb-3">
                        <div className="text-left leading-none">
                            {/* Fake Strikethrough for psychology? Or just show price */}
                            <div className="text-xs text-slate-500 line-through decoration-red-500 mb-0.5">$99.99</div>
                            <div className="text-2xl font-black text-white">
                                {isFetching ? <span className="animate-pulse">...</span> : priceDisplay}
                                <span className="text-xs font-medium text-slate-400 ml-1">{periodDisplay}</span>
                            </div>
                        </div>
                        <div className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                            {offerText}
                        </div>
                    </div>

                    <button
                        onClick={handlePurchase}
                        disabled={isLoading || isFetching}
                        className="group relative w-full py-3.5 rounded-xl bg-white overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] active:scale-95 transition-all"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                        <div className="absolute top-0 -left-[100%] w-[50%] h-full bg-white/30 skew-x-[-20deg] animate-[shine_3s_infinite]"></div>

                        <span className="relative z-10 text-black font-black text-base tracking-wide flex items-center justify-center gap-2">
                            {isLoading ? (
                                <span className="animate-pulse">{t('paywall.cta_loading')}</span>
                            ) : (
                                <>{t('paywall.cta_default')} <Zap size={18} fill="black" /></>
                            )}
                        </span>
                    </button>

                    <div className="flex justify-center gap-6 text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-3">
                        <button onClick={() => AdaptyService.restorePurchases().then(s => s && onPurchaseSuccess())} className="hover:text-white transition-colors">{t('paywall.restore')}</button>
                        <button className="hover:text-white transition-colors">{t('paywall.terms')}</button>
                        <button className="hover:text-white transition-colors">{t('paywall.privacy')}</button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Paywall;