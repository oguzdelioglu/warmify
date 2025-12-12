// import { PoseLandmark } from '@mediapipe/pose';

// Type definitions for landmarks (simplified for Readability)
// MediaPipe Body 33 Keypoints
// 11=L_Shoulder, 12=R_Shoulder, 13=L_Elbow, 14=R_Elbow, 15=L_Wrist, 16=R_Wrist

export interface EvaluationResult {
    score: number; // 0-100
    feedback: string;
    incorrectJoints: string[]; // List of joint names to color RED
    isMatch: boolean;
}

// Helper to calculate angle between three points (A, B, C)
function calculateAngle(a: any, b: any, c: any): number {
    if (!a || !b || !c) return 0;
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs((radians * 180.0) / Math.PI);
    if (angle > 180.0) angle = 360 - angle;
    return angle;
}

// Evaluators for specific moves
const Evaluators: Record<string, (landmarks: any[], prevLandmarks?: any[] | null) => EvaluationResult> = {

    'Overhead Reach': (lm) => {
        const leftArmAngle = calculateAngle(lm[11], lm[13], lm[15]);
        const rightArmAngle = calculateAngle(lm[12], lm[14], lm[16]);
        const leftShoulderAngle = calculateAngle(lm[23], lm[11], lm[13]); // Hip-Shoulder-Elbow
        const rightShoulderAngle = calculateAngle(lm[24], lm[12], lm[14]);

        const handsAboveHead = lm[15].y < lm[0].y && lm[16].y < lm[0].y; // Wrists above nose
        const armsStraight = leftArmAngle > 150 && rightArmAngle > 150;

        const incorrect: string[] = [];
        if (!processArmsCheck(leftArmAngle, 150)) incorrect.push('left_elbow');
        if (!processArmsCheck(rightArmAngle, 150)) incorrect.push('right_elbow');
        if (!handsAboveHead) incorrect.push('wrists');

        const score = (handsAboveHead ? 50 : 0) + (armsStraight ? 50 : 20);

        return {
            score,
            isMatch: score > 80,
            feedback: !handsAboveHead ? "Reach Higher!" : !armsStraight ? "Straighten Arms!" : "PERFECT!",
            incorrectJoints: incorrect
        };
    },

    'T-Pose Pulses': (lm) => {
        const leftArmAng = calculateAngle(lm[11], lm[13], lm[15]);
        const rightArmAng = calculateAngle(lm[12], lm[14], lm[16]);
        const leftShoulderHeight = Math.abs(lm[11].y - lm[13].y); // Elbow should be close to shoulder Y
        const rightShoulderHeight = Math.abs(lm[12].y - lm[14].y);

        const armsStraight = leftArmAng > 160 && rightArmAng > 160;
        const armsHorizontal = leftShoulderHeight < 0.15 && rightShoulderHeight < 0.15; // Tolerance

        const incorrect: string[] = [];
        if (!armsStraight) incorrect.push('elbows');
        if (!armsHorizontal) incorrect.push('shoulders');

        const score = (armsStraight ? 50 : 10) + (armsHorizontal ? 50 : 10);
        return {
            score,
            isMatch: score > 80,
            feedback: !armsStraight ? "Extend Arms!" : !armsHorizontal ? "Level Your Arms!" : "HOLD IT!",
            incorrectJoints: incorrect
        };
    },

    'Hooks': (lm) => {
        // Boxing Hook: Elbow is bent ~90 deg, arm is horizontal
        const leftArmAng = calculateAngle(lm[11], lm[13], lm[15]);
        const rightArmAng = calculateAngle(lm[12], lm[14], lm[16]);

        // Detect if EITHER arm is in a hook position
        const isLeftHook = leftArmAng > 70 && leftArmAng < 110 && Math.abs(lm[11].y - lm[13].y) < 0.2;
        const isRightHook = rightArmAng > 70 && rightArmAng < 110 && Math.abs(lm[12].y - lm[14].y) < 0.2;

        if (isLeftHook || isRightHook) {
            return { score: 100, isMatch: true, feedback: "NICE HOOK!", incorrectJoints: [] };
        }
        return { score: 30, isMatch: false, feedback: "Keep Elbows High!", incorrectJoints: ['elbows'] };
    },

    'Uppercuts': (lm) => {
        // Uppercut: Wrist is close to shoulder X, below shoulder Y, elbow bent < 90
        // Simplified: Detect fast upward motion usually, but here checking static pose snapshot availability
        // Static pose: Elbow tucket, wrist high.
        const leftArmAng = calculateAngle(lm[11], lm[13], lm[15]);
        const rightArmAng = calculateAngle(lm[12], lm[14], lm[16]);

        const isLeftCut = leftArmAng < 60 && lm[15].y < lm[11].y; // Hand above shoulder
        const isRightCut = rightArmAng < 60 && lm[16].y < lm[12].y;

        if (isLeftCut || isRightCut) {
            return { score: 100, isMatch: true, feedback: "POWER!", incorrectJoints: [] };
        }
        return { score: 20, isMatch: false, feedback: "Punch Up!", incorrectJoints: ['wrists'] };
    },

    'Shoulder Press': (lm) => {
        // Goal post position -> Up
        // Check for "Goal Post" (start) OR "Up" (end)
        const leftArmAng = calculateAngle(lm[11], lm[13], lm[15]);
        const rightArmAng = calculateAngle(lm[12], lm[14], lm[16]);

        // Check if hands are above shoulders
        const handsUp = lm[15].y < lm[11].y && lm[16].y < lm[12].y;

        if (handsUp) {
            if (leftArmAng > 150 && rightArmAng > 150) return { score: 100, isMatch: true, feedback: "FULL EXTENSION!", incorrectJoints: [] };
            if (leftArmAng > 80 && rightArmAng > 80) return { score: 80, isMatch: true, feedback: "PUSH UP!", incorrectJoints: [] };
        }

        return { score: 30, isMatch: false, feedback: "Hands Up!", incorrectJoints: ['shoulders'] };
    },

    'Shadow Box': (lm, prevLm) => {
        if (!prevLm) return { score: 50, isMatch: true, feedback: "Move Fast!", incorrectJoints: [] };

        // Calculate average velocity of wrists
        const leftWristV = Math.abs(lm[15].x - prevLm[15].x) + Math.abs(lm[15].y - prevLm[15].y);
        const rightWristV = Math.abs(lm[16].x - prevLm[16].x) + Math.abs(lm[16].y - prevLm[16].y);

        const movement = (leftWristV + rightWristV) * 100; // Scale up

        if (movement > 2) {
            return { score: 100, isMatch: true, feedback: "Keep it up!", incorrectJoints: [] };
        }
        return { score: 20, isMatch: false, feedback: "Faster!", incorrectJoints: ['wrists'] };
    },

    // Default fallback
    'Freestyle': () => ({ score: 100, isMatch: true, feedback: "Keep Moving!", incorrectJoints: [] })
};

function processArmsCheck(angle: number, target: number): boolean {
    return angle > target;
}

export class MoveEvaluator {
    static evaluate(exerciseName: string, landmarks: any[], prevLandmarks: any[] | null = null): EvaluationResult {
        if (!landmarks || landmarks.length < 33) {
            return { score: 0, feedback: "No Pose Detected", incorrectJoints: [], isMatch: false };
        }

        const evaluator = Evaluators[exerciseName] || Evaluators['Freestyle'];
        return evaluator(landmarks, prevLandmarks);
    }
}
