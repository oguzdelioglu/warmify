import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
    onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
    const [isFading, setIsFading] = useState(false);

    useEffect(() => {
        // Start fade out after 2 seconds
        const timer = setTimeout(() => {
            setIsFading(true);
            // Notify parent to unmount after fade completes
            setTimeout(onComplete, 500);
        }, 2000);

        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-900 transition-opacity duration-500 ${isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <div className="relative w-48 h-48 animate-bounce" style={{ animationDuration: '2s' }}>
                {/* Glow effect */}
                <div className="absolute inset-0 bg-cyan-400/20 blur-3xl rounded-full animate-pulse"></div>
                <img src="/logo.png" alt="Warmify Logo" className="relative z-10 w-full h-full drop-shadow-2xl rounded-3xl" />
            </div>
            <h1 className="mt-8 text-4xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500 tracking-tighter animate-[fadeUp_1s_ease-out]">
                Warmify
            </h1>
            <p className="mt-2 text-slate-400 font-mono text-xs uppercase tracking-[0.2em] animate-[fadeUp_1s_ease-out_0.2s_both]">
                System Initializing
            </p>
        </div>
    );
};
