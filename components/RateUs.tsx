import React, { useState } from 'react';
import { InAppReview } from '@capacitor-community/in-app-review';
import { Star, ThumbsUp, MessageSquare } from 'lucide-react';
import { SoundEngine } from '../services/audioService';

interface RateUsProps {
    onComplete: () => void;
}

export const RateUs: React.FC<RateUsProps> = ({ onComplete }) => {
    const [rating, setRating] = useState(0);
    const [feedbackSent, setFeedbackSent] = useState(false);

    const handleRate = async (stars: number) => {
        setRating(stars);
        SoundEngine.playUI('click');

        if (stars === 5) {
            try {
                // Trigger Native Review Prompt
                await InAppReview.requestReview();
                // We don't get a callback if they actually submitted, so we just assume success/completion of the flow
                setFeedbackSent(true);
            } catch (error) {
                console.error("Rate Us Error:", error);
                // Fallback or just continue
                setFeedbackSent(true);
            }
        }
    };

    if (feedbackSent) {
        return (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/95 backdrop-blur-md p-6 animate-fadeIn">
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(34,197,94,0.6)] animate-bounce">
                        <ThumbsUp size={40} className="text-white" />
                    </div>
                    <h2 className="text-3xl font-black italic text-white">THANK YOU!</h2>
                    <p className="text-slate-300">Your support helps us keep the fire burning!</p>
                    <button
                        onClick={onComplete}
                        className="mt-8 w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl transition-all border border-slate-700"
                    >
                        CONTINUE
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/95 backdrop-blur-md p-6 animate-fadeIn">
            <div className="w-full max-w-sm bg-slate-800/50 border border-slate-700 rounded-3xl p-8 text-center relative overflow-hidden shadow-2xl">
                {/* Background Decor */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-purple-500"></div>
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl"></div>

                <h2 className="text-2xl font-black italic text-white mb-2 relative z-10">
                    ENJOYING WARMIFY?
                </h2>
                <p className="text-slate-400 text-sm mb-8 relative z-10">
                    Your feedback helps us make the workout experience even better.
                </p>

                <div className="flex justify-center gap-2 mb-8 relative z-10">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            onClick={() => handleRate(star)}
                            className={`transition-all duration-300 transform hover:scale-110 ${star <= rating ? 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]' : 'text-slate-600'}`}
                        >
                            <Star size={36} fill={star <= rating ? "currentColor" : "none"} strokeWidth={star <= rating ? 0 : 2} />
                        </button>
                    ))}
                </div>

                {rating > 0 && rating < 5 && (
                    <div className="animate-fadeIn">
                        <textarea
                            className="w-full bg-slate-900/80 border border-slate-600 rounded-xl p-3 text-white text-sm mb-4 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
                            placeholder="Tell us what we can improve..."
                            rows={3}
                        />
                        <button
                            onClick={() => setFeedbackSent(true)}
                            className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-black py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2"
                        >
                            <MessageSquare size={18} /> SEND FEEDBACK
                        </button>
                    </div>
                )}

                <button
                    onClick={onComplete}
                    className="mt-6 text-slate-500 text-xs font-bold hover:text-white transition-colors uppercase tracking-widest"
                >
                    No thanks, maybe later
                </button>
            </div>
        </div>
    );
};
