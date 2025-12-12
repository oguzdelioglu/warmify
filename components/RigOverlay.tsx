import React, { useEffect, useRef } from 'react';
import { ExerciseType, CharacterArchetype, CharacterSkinId } from '../types';

interface RigOverlayProps {
    exercise: string;
    mode: 'INSTRUCTION' | 'TRACKER';
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
            // Floating orbs at joints
            [11, 12, 13, 14, 15, 16, 23, 24].forEach(idx => {
                drawPoint(ctx, joints[idx], '#ffffff', 3, w, h);
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

            // Servos
            [13, 14, 25, 26].forEach(idx => {
                if (seatedMode && idx > 20) return;
                drawPoint(ctx, joints[idx], secondary, 6, w, h);
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
            drawPoint(ctx, joints[0], 'white', 15, w, h);
        };

        // 5. ALIEN: Curvy/Organic
        const drawAlien = (ctx: CanvasRenderingContext2D, joints: any, colors: string[]) => {
            const [primary, secondary] = colors;
            ctx.shadowBlur = 10;
            ctx.shadowColor = secondary;
            const w = canvas.width;
            const h = canvas.height;

            // Basic lines for now, curving needs complex bezier logic relative to frame history which is expensive here
            const connections = [[11, 13], [13, 15], [12, 14], [14, 16], [11, 12], [23, 24], [11, 23], [12, 24]];
            if (!seatedMode) connections.push([23, 25], [25, 27], [24, 26], [26, 28]);

            connections.forEach(([s, e]) => {
                drawLine(ctx, joints[s], joints[e], primary, 4, w, h);
            });

            // Eyes
            drawPoint(ctx, joints[2], secondary, 3, w, h); // Eye L
            drawPoint(ctx, joints[5], secondary, 3, w, h); // Eye R
        };


        // --- PROCEDURAL ANIMATION (Fallback for Instruction/Preview) ---
        const getProceduralJoints = (w: number, h: number, tickVal: number) => {
            // Map standard MediaPipe indices to our procedural logic
            // 0:Nose, 11:LShoulder, 12:RShoulder, 13:LElbow, 14:RElbow, 15:LWrist, 16:RWrist, 23:LHip, 24:RHip, 25:LKnee, 26:RKnee, 27:LAnkle, 28:RAnkle

            const isHud = mode === 'INSTRUCTION';
            let scale, cy, cx;
            cx = 0.5; // Normalized 0-1

            if (isHud) {
                scale = 0.20; // smaller
                cy = 0.65;
            } else {
                scale = 0.35;
                cy = 0.55;
            }

            // Adjust for canvas aspect ratio to keep puppet proportional
            const aspect = w / h;
            // X coordinates need to be scaled by (h/w) to stay square if we use Y as reference
            // Simplified: work in normalized space

            const speed = 0.15;
            let armAngle = 0;
            let legAngle = 0;
            let bodyY = cy;
            let lArmA = Math.PI / 2 + 0.3; // Default
            let rArmA = Math.PI / 2 - 0.3; // Default

            const animEx = mode === 'PREVIEW' ? 'Jumping Jacks' : exercise;

            if (animEx === 'Jumping Jacks') {
                const phase = Math.sin(tickVal * speed);
                armAngle = Math.PI / 2.5 * (phase > 0 ? phase : 0) + 0.2;
                if (!seatedMode) legAngle = Math.PI / 6 * (phase > 0 ? phase : 0);
            } else if (animEx === 'Squats') {
                const phase = Math.sin(tickVal * speed * 0.5);
                const squatDepth = phase > 0 ? phase : 0;
                bodyY = cy + (squatDepth * scale * 0.4);
                if (!seatedMode) legAngle = squatDepth * 1.5;
            } else if (animEx === 'High Knees') {
                if (!seatedMode) legAngle = Math.sin(tickVal * speed * 1.5);
            } else if (animEx === 'Shadow Boxing') {
                armAngle = Math.sin(tickVal * speed * 1.5);
            } else if (animEx === 'Overhead Reach') {
                const phase = Math.sin(tickVal * speed * 0.8);
                // Arms go from T-pose (0) to Up (PI/2)
                const reach = (phase + 1) / 2; // 0 to 1
                armAngle = (Math.PI / 2) * reach;
                // Side bend?
            } else if (animEx === 'T-Pose Pulses') {
                const phase = Math.sin(tickVal * speed * 2); // Fast pulses
                armAngle = 0.1 * phase; // Small movement around horizontal
            } else if (animEx === 'Shoulder Press') {
                const phase = Math.sin(tickVal * speed);
                // Hands from shoulder height to full extension
                const press = (phase + 1) / 2;
                // Complex to keyframe joints perfectly, simplifying angle
                armAngle = (Math.PI / 2.2) * press;
            } else if (animEx === 'Hooks') {
                // Alternating hooks
                const punch = Math.sin(tickVal * speed * 1.5);
                if (punch > 0) lArmA = Math.PI / 2 + 1.5; // Hook shape
                else rArmA = Math.PI / 2 - 1.5;
            } else if (animEx === 'Uppercuts') {
                const punch = Math.sin(tickVal * speed * 2);
                // Vertical motion simulation
                if (punch > 0) lArmA = Math.PI / 2 + 0.5;
                else rArmA = Math.PI / 2 - 0.5;
            }

            const neckY = bodyY - scale * 0.8;
            const hipY = bodyY + scale * 0.1;
            const shoulderY = neckY + scale * 0.1;
            const shoulderWidth = scale * 0.35 * (h / w); // Correct aspect
            const armLen = scale * 0.45;
            const legLen = scale * 0.5;

            // Adjust arm angles based on calculation
            if (animEx !== 'Hooks' && animEx !== 'Uppercuts' && animEx !== 'Shadow Boxing') {
                lArmA = Math.PI / 2 + 0.3 - armAngle;
                rArmA = Math.PI / 2 - 0.3 + armAngle;
            }

            // Helper to project polar to cartesian normalized
            const polar = (ox: number, oy: number, angle: number, len: number) => {
                return {
                    x: ox - Math.sin(angle) * len * (h / w),
                    y: oy + Math.cos(angle) * len
                };
            };
            const polarR = (ox: number, oy: number, angle: number, len: number) => {
                return {
                    x: ox + Math.sin(angle) * len * (h / w),
                    y: oy + Math.cos(angle) * len // approx
                };
            };

            const cxVal = 0.5;
            const lShoulder = { x: cxVal - shoulderWidth, y: shoulderY };
            const rShoulder = { x: cxVal + shoulderWidth, y: shoulderY };
            const lElbow = polar(lShoulder.x, lShoulder.y, lArmA, armLen);
            const lWrist = polar(lElbow.x, lElbow.y, lArmA, armLen);
            const rElbow = { x: rShoulder.x + Math.sin(Math.PI - rArmA) * armLen * (h / w), y: shoulderY + Math.cos(Math.PI - rArmA) * armLen };
            const rWrist = { x: rElbow.x + Math.sin(Math.PI - rArmA) * armLen * (h / w), y: rElbow.y + Math.cos(Math.PI - rArmA) * armLen };

            const hips = { x: cxVal, y: hipY };
            const lHip = { x: cxVal - shoulderWidth * 0.5, y: hipY };
            const rHip = { x: cxVal + shoulderWidth * 0.5, y: hipY };

            const lKnee = { x: lHip.x - Math.sin(legAngle) * legLen * 0.5 * (h / w), y: hipY + legLen };
            const lAnkle = { x: lKnee.x, y: lKnee.y + legLen };

            const rKnee = { x: rHip.x + Math.sin(legAngle) * legLen * 0.5 * (h / w), y: hipY + legLen };
            const rAnkle = { x: rKnee.x, y: rKnee.y + legLen };

            // Construct Fake Landmarks Object (Sparse)
            const lm: any = [];
            lm[0] = { x: cxVal, y: neckY - 0.05, visibility: 1 }; // Nose
            lm[11] = { ...lShoulder, visibility: 1 };
            lm[12] = { ...rShoulder, visibility: 1 };
            lm[13] = { ...lElbow, visibility: 1 };
            lm[14] = { ...rElbow, visibility: 1 };
            lm[15] = { ...lWrist, visibility: 1 };
            lm[16] = { ...rWrist, visibility: 1 };
            lm[23] = { ...lHip, visibility: 1 };
            lm[24] = { ...rHip, visibility: 1 };
            lm[25] = { ...lKnee, visibility: 1 };
            lm[26] = { ...rKnee, visibility: 1 };
            lm[27] = { ...lAnkle, visibility: 1 };
            lm[28] = { ...rAnkle, visibility: 1 };

            // Fill gaps roughly for others if needed
            for (let i = 0; i < 33; i++) { if (!lm[i]) lm[i] = { x: 0.5, y: 0.5, visibility: 0 }; }

            return lm;
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
                // Use Procedural Animation
                try {
                    jointsToDraw = getProceduralJoints(w, h, tick);
                } catch (e) {
                    console.error("Procedural Animation Error:", e);
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