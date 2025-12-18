import React, { useEffect, useRef } from 'react';
import { ExerciseType, CharacterArchetype, CharacterSkinId } from '../types';
import { AnimationService } from '../services/AnimationService';

interface RigOverlayProps {
    exercise: string;
    mode: 'INSTRUCTION' | 'TRACKER' | 'PREVIEW';
    isActive: boolean;
    videoRef?: React.RefObject<HTMLVideoElement>;
    seatedMode?: boolean;
    archetype?: string;
    skinId?: number;
    feedbackType?: 'neutral' | 'good' | 'bad';
    poseLandmarks?: any;
    incorrectJoints?: string[]; // NEW: List of segments to color Red
} // Real-time landmarks from MediaPipe

// --- CONFIGURATION ---
const COLOR_PALETTES = [
    ['#22d3ee', '#0ea5e9'], // Cyan/Blue
    ['#ef4444', '#f97316'], // Red/Orange
    ['#a855f7', '#d946ef'], // Purple/Pink
    ['#22c55e', '#84cc16'], // Green/Lime
    ['#facc15', '#fbbf24'], // Yellow/Amber
];

const RigOverlay: React.FC<RigOverlayProps> = ({
    exercise, mode, isActive, videoRef, seatedMode = false,
    archetype = 'CYBER', skinId = 0, feedbackType = 'neutral',
    poseLandmarks, incorrectJoints = []
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const frameRef = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        const resize = () => {
            const parent = canvas.parentElement;
            if (parent) {
                canvas.width = parent.clientWidth;
                canvas.height = parent.clientHeight;
            }
        };
        window.addEventListener('resize', resize);
        resize();

        let tick = 0;

        // --- UTILS ---
        const getColors = () => {
            if (mode === 'TRACKER' && isActive) {
                if (feedbackType === 'good') return ['#4ade80', '#22c55e'];
                if (feedbackType === 'bad') return ['#f87171', '#ef4444'];
            }
            return COLOR_PALETTES[skinId % COLOR_PALETTES.length];
        };

        // --- DRAWING STRATEGIES ---

        // Helper to draw lines between normalized points
        const drawLine = (ctx: CanvasRenderingContext2D, start: any, end: any, color: string, width: number, widthRatio: number, heightRatio: number) => {
            if (!start || !end || (start.visibility && start.visibility < 0.5) || (end.visibility && end.visibility < 0.5)) return;
            ctx.beginPath();
            ctx.moveTo(start.x * widthRatio, start.y * heightRatio);
            ctx.lineTo(end.x * widthRatio, end.y * heightRatio);
            ctx.lineWidth = width;
            ctx.strokeStyle = color;
            ctx.stroke();
        };

        const drawPoint = (ctx: CanvasRenderingContext2D, pt: any, color: string, size: number, widthRatio: number, heightRatio: number) => {
            if (!pt || (pt.visibility && pt.visibility < 0.5)) return;
            ctx.beginPath();
            ctx.arc(pt.x * widthRatio, pt.y * heightRatio, size, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
        };

        // 1. CYBER: Neon tubes
        const drawCyber = (ctx: CanvasRenderingContext2D, joints: any, colors: string[]) => {
            // Helper to get segment color
            const getSegmentColor = (start: number, end: number, baseColor: string) => {
                if (mode !== 'TRACKER' || !isActive) return baseColor;

                // Default to Green (Good) if active
                let color = '#22c55e';

                if (incorrectJoints && incorrectJoints.length > 0) {
                    const isLeftArm = (start === 11 && end === 13) || (start === 13 && end === 15);
                    const isRightArm = (start === 12 && end === 14) || (start === 14 && end === 16);
                    const isTorso = (start === 11 && end === 12) || (start === 23 && end === 24) || (start === 11 && end === 23) || (start === 12 && end === 24);

                    let isError = false;
                    if (incorrectJoints.includes('elbows') && (isLeftArm || isRightArm)) isError = true;
                    if (incorrectJoints.includes('left_elbow') && isLeftArm) isError = true;
                    if (incorrectJoints.includes('right_elbow') && isRightArm) isError = true;
                    if (incorrectJoints.includes('wrists') && ((start === 13 && end === 15) || (start === 14 && end === 16))) isError = true;
                    if (incorrectJoints.includes('shoulders') && (isTorso || isLeftArm || isRightArm)) isError = true;

                    if (isError) return '#ef4444'; // Red
                }

                return color;
            };

            const [primary] = colors;
            ctx.shadowBlur = 10;
            ctx.shadowColor = primary;
            ctx.lineCap = 'round';

            const w = canvas.width;
            const h = canvas.height;

            // Limbs defined by pairs of landmark indices (MediaPipe Pose)
            const connections = [[11, 13], [13, 15], [12, 14], [14, 16], [11, 12], [23, 24], [11, 23], [12, 24]];
            if (!seatedMode) connections.push([23, 25], [25, 27], [24, 26], [26, 28]);

            connections.forEach(([startIdx, endIdx]) => {
                const start = joints[startIdx];
                const end = joints[endIdx];

                const segColor = getSegmentColor(startIdx, endIdx, primary);
                ctx.shadowColor = segColor;

                // Outer Glow
                drawLine(ctx, start, end, segColor, 6, w, h);
                // Inner Core
                drawLine(ctx, start, end, '#ffffff', 2, w, h);
            });

            // Head
            drawPoint(ctx, joints[0], '#fff', 4, w, h); // Nose
        };

        // 2. SPIRIT: Dashed, ethereal
        const drawSpirit = (ctx: CanvasRenderingContext2D, joints: any, colors: string[]) => {
            const [primary] = colors;
            ctx.shadowBlur = 15;
            ctx.shadowColor = primary;
            ctx.setLineDash([5, 5]);

            const w = canvas.width;
            const h = canvas.height;
            const connections = [[11, 13], [13, 15], [12, 14], [14, 16], [11, 12], [23, 24], [11, 23], [12, 24]];
            if (!seatedMode) connections.push([23, 25], [25, 27], [24, 26], [26, 28]);

            connections.forEach(([startIdx, endIdx]) => {
                drawLine(ctx, joints[startIdx], joints[endIdx], primary, 2, w, h);
            });

            ctx.setLineDash([]);
            // Floating orbs at joints (Added 0 for Head)
            [0, 11, 12, 13, 14, 15, 16, 23, 24].forEach(idx => {
                if (joints[idx]) drawPoint(ctx, joints[idx], '#ffffff', 3, w, h);
            });
        };

        // 3. MECH: Thick, robotic
        const drawMech = (ctx: CanvasRenderingContext2D, joints: any, colors: string[]) => {
            const [primary, secondary] = colors;
            ctx.shadowBlur = 0;
            const w = canvas.width;
            const h = canvas.height;

            const connections = [[11, 13], [13, 15], [12, 14], [14, 16], [23, 25], [25, 27], [24, 26], [26, 28], [11, 23], [12, 24], [11, 12], [23, 24]];

            connections.forEach(([s, e]) => {
                if (seatedMode && (s > 22 || e > 22) && s !== 11 && s !== 12 && e !== 11 && e !== 12) return; // Skip legs if seated, keep torso
                drawLine(ctx, joints[s], joints[e], '#1e293b', 10, w, h); // Background heavy line
                drawLine(ctx, joints[s], joints[e], primary, 4, w, h);
            });

            // Servos (Added 0)
            [0, 13, 14, 25, 26].forEach(idx => {
                if (seatedMode && idx > 20) return;
                if (joints[idx]) drawPoint(ctx, joints[idx], secondary, 6, w, h);
            });
        };

        // 4. STICKMAN: Simple
        const drawStickman = (ctx: CanvasRenderingContext2D, joints: any, colors: string[]) => {
            const [primary] = colors;
            ctx.shadowBlur = 0;
            const w = canvas.width;
            const h = canvas.height;

            const connections = [[11, 13], [13, 15], [12, 14], [14, 16], [11, 12], [23, 24], [11, 23], [12, 24]];
            if (!seatedMode) connections.push([23, 25], [25, 27], [24, 26], [26, 28]);

            connections.forEach(([s, e]) => drawLine(ctx, joints[s], joints[e], 'white', 8, w, h));
            connections.forEach(([s, e]) => drawLine(ctx, joints[s], joints[e], primary, 4, w, h));

            // Head
            if (joints[0]) drawPoint(ctx, joints[0], 'white', 15, w, h);
        };

        // 5. ALIEN: Curvy/Organic
        const drawAlien = (ctx: CanvasRenderingContext2D, joints: any, colors: string[]) => {
            const [primary, secondary] = colors;
            ctx.shadowBlur = 10;
            ctx.shadowColor = secondary;
            const w = canvas.width;
            const h = canvas.height;

            const connections = [[11, 13], [13, 15], [12, 14], [14, 16], [11, 12], [23, 24], [11, 23], [12, 24]];
            if (!seatedMode) connections.push([23, 25], [25, 27], [24, 26], [26, 28]);

            connections.forEach(([s, e]) => {
                drawLine(ctx, joints[s], joints[e], primary, 4, w, h);
            });

            // Head (Added 0)
            if (joints[0]) drawPoint(ctx, joints[0], secondary, 5, w, h);

            // Eyes
            // (Optional: if we want eyes, we need them populated in AnimationService relative to head)
            // For now, removing static eyes 2 & 5 if they are just 0,0
            // drawPoint(ctx, joints[2], secondary, 3, w, h); 
            // drawPoint(ctx, joints[5], secondary, 3, w, h); 
        };


        // --- MAIN RENDER LOOP ---
        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const w = canvas.width;
            const h = canvas.height;
            if (w === 0 || h === 0) {
                frameRef.current = requestAnimationFrame(render);
                return;
            }
            const colors = getColors();

            let jointsToDraw = null;

            // DECIDE SOURCE: Real Pose vs Procedural
            if (poseLandmarks && mode === 'TRACKER') {
                // Use Real MediaPipe Data
                jointsToDraw = poseLandmarks;
            } else {
                // Use Refactored Animation Service for Preview/Instruction
                try {
                    jointsToDraw = AnimationService.getProceduralPose({
                        width: w,
                        height: h,
                        time: tick,
                        exercise: exercise,
                        isSeated: seatedMode
                    });
                } catch (e) {
                    // console.error("Procedural Animation Error:", e);
                }
            }

            // Draw based on Archetype
            if (jointsToDraw) {
                if (archetype === 'CYBER') drawCyber(ctx, jointsToDraw, colors);
                else if (archetype === 'STICKMAN') drawStickman(ctx, jointsToDraw, colors);
                else if (archetype === 'MECH') drawMech(ctx, jointsToDraw, colors);
                else if (archetype === 'ALIEN') drawAlien(ctx, jointsToDraw, colors);
                else if (archetype === 'SPIRIT') drawSpirit(ctx, jointsToDraw, colors);
                else drawCyber(ctx, jointsToDraw, colors); // Fallback
            }

            tick++;
            frameRef.current = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(frameRef.current);
        };
    }, [exercise, mode, videoRef, seatedMode, archetype, skinId, feedbackType, poseLandmarks]);

    return <canvas ref={canvasRef} className="absolute inset-0 z-10 pointer-events-none w-full h-full" />;
};

export default RigOverlay;