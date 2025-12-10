import { GoogleGenAI, LiveServerMessage, Modality, FunctionDeclaration, Type, LiveSession } from "@google/genai";

// Audio Context Helpers
let audioContext: AudioContext | null = null;
let inputAudioContext: AudioContext | null = null;
let scriptProcessor: ScriptProcessorNode | null = null;
let sourceNode: MediaStreamAudioSourceNode | null = null;
let nextStartTime = 0;
const sources = new Set<AudioBufferSourceNode>();

// --- GAME TOOLS ---

const registerHitTool: FunctionDeclaration = {
  name: 'registerHit',
  description: 'Call this when the user performs a repetition correctly or shows good form.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      quality: { type: Type.STRING, description: 'PERFECT, GOOD, or OK' },
      feedback: { type: Type.STRING, description: 'Short encouraging word like "Nice!", "Exact match!"' }
    },
    required: ['quality', 'feedback']
  }
};

const registerMissTool: FunctionDeclaration = {
  name: 'registerMiss',
  description: 'Call this when the user stops moving, has bad form, or is too slow.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      issue: { type: Type.STRING, description: 'Explanation like "Lower!", "Faster!", "Don\'t stop!"' }
    },
    required: ['issue']
  }
};

interface GeminiCallbacks {
  onHit: (quality: string, feedback: string) => void;
  onMiss: (issue: string) => void;
  onStatusChange: (status: string) => void;
  onAudioData: (visualizerData: Uint8Array) => void;
  onLog: (message: string, type?: 'info' | 'error' | 'success') => void;
}

export class GeminiWorkoutCoach {
  private session: LiveSession | null = null;
  private canvas: HTMLCanvasElement;
  private video: HTMLVideoElement;
  private frameInterval: number | null = null;
  private callbacks: GeminiCallbacks;
  private currentExerciseName: string = "Warmup";

  constructor(videoElement: HTMLVideoElement, callbacks: GeminiCallbacks) {
    this.video = videoElement;
    this.canvas = document.createElement('canvas');
    this.callbacks = callbacks;
  }

  setExercise(name: string) {
    this.currentExerciseName = name;
    this.log(`Switched context to: ${name}`, 'info');
    // We can't send text context mid-stream easily in this version without a text message,
    // so we rely on the system instruction knowing we will change exercises, or sending a hidden prompt.
    // For now, we rely on the continuous video feed context.
  }

  private log(msg: string, type: 'info' | 'error' | 'success' = 'info') {
    this.callbacks.onLog(msg, type);
  }

  async startSession() {
    this.callbacks.onStatusChange("Initializing System...");
    
    // Initialize Audio
    try {
        if (!audioContext) audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        if (!inputAudioContext) inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    } catch (e) {
        this.log(`Audio Init Failed: ${e}`, 'error');
        return;
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      callbacks: {
        onopen: async () => {
          this.callbacks.onStatusChange("SYSTEM ONLINE");
          this.log("Connected to AI Game Engine", 'success');
          this.startAudioStream(sessionPromise);
          this.startVideoStream(sessionPromise);
        },
        onmessage: async (message: LiveServerMessage) => {
          if (message.toolCall) {
            for (const fc of message.toolCall.functionCalls) {
              if (fc.name === 'registerHit') {
                const args = fc.args as any;
                this.callbacks.onHit(args.quality, args.feedback);
                sessionPromise.then(s => s.sendToolResponse({
                    functionResponses: { id: fc.id, name: fc.name, response: { result: "ack" } }
                }));
              } else if (fc.name === 'registerMiss') {
                const args = fc.args as any;
                this.callbacks.onMiss(args.issue);
                sessionPromise.then(s => s.sendToolResponse({
                    functionResponses: { id: fc.id, name: fc.name, response: { result: "ack" } }
                }));
              }
            }
          }

          const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (base64Audio && audioContext) {
            this.playAudio(base64Audio);
          }
        },
        onclose: () => this.callbacks.onStatusChange("Disconnected"),
        onerror: (e) => this.log(`Connection Error: ${JSON.stringify(e)}`, 'error')
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
        systemInstruction: `You are a Strict but Encouraging Rhythm Game Referee.
        
        Your Task:
        1. Watch the user via video.
        2. Verify if they are doing the CURRENT EXERCISE correctly.
        3. TIMING IS KEY. If they match the rhythm/speed, give points.
        
        Tools:
        - Call 'registerHit(quality, feedback)' INSTANTLY when they do a rep correctly. Quality: "PERFECT" for great form, "GOOD" for okay form.
        - Call 'registerMiss(issue)' INSTANTLY if they stop, slow down too much, or do the wrong move.

        Personality:
        - Speak very little. Mostly commands like "Higher!", "Faster!", "Good!", "Keep it up!".
        - Do not give long explanations. This is a fast-paced game.
        
        Current Context: The user is playing 'Warmify'.`,
        tools: [{ functionDeclarations: [registerHitTool, registerMissTool] }]
      }
    });

    this.session = await sessionPromise;
  }

  private async startAudioStream(sessionPromise: Promise<LiveSession>) {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!inputAudioContext) return;
        sourceNode = inputAudioContext.createMediaStreamSource(stream);
        scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
        scriptProcessor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const visualData = new Uint8Array(inputData.length);
            for(let i=0; i<inputData.length; i++) visualData[i] = Math.abs(inputData[i]) * 255; 
            this.callbacks.onAudioData(visualData.slice(0, 64));
            const pcmBlob = this.createBlob(inputData);
            sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
        };
        sourceNode.connect(scriptProcessor);
        scriptProcessor.connect(inputAudioContext.destination);
    } catch (e) { console.error(e); }
  }

  private startVideoStream(sessionPromise: Promise<LiveSession>) {
    const FPS = 2; // Keep low latency
    this.frameInterval = window.setInterval(() => {
        if (!this.video || this.video.paused) return;
        const ctx = this.canvas.getContext('2d');
        if (!ctx) return;
        this.canvas.width = this.video.videoWidth / 4;
        this.canvas.height = this.video.videoHeight / 4;
        ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
        
        // Add overlay text for Gemini context (It reads text in images well)
        ctx.fillStyle = "white";
        ctx.font = "20px sans-serif";
        ctx.fillText(`CURRENT MOVE: ${this.currentExerciseName}`, 10, 30);

        const base64 = this.canvas.toDataURL('image/jpeg', 0.5).split(',')[1];
        sessionPromise.then(s => s.sendRealtimeInput({ media: { mimeType: 'image/jpeg', data: base64 } }));
    }, 1000 / FPS);
  }

  private async playAudio(base64: string) {
    if (!audioContext) return;
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
    const dataInt16 = new Int16Array(bytes.buffer);
    const buffer = audioContext.createBuffer(1, dataInt16.length, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    nextStartTime = Math.max(nextStartTime, audioContext.currentTime);
    source.start(nextStartTime);
    nextStartTime += buffer.duration;
    sources.add(source);
    source.onended = () => sources.delete(source);
  }

  private createBlob(data: Float32Array) {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) int16[i] = data[i] * 32768;
    const bytes = new Uint8Array(int16.buffer);
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
    return { data: btoa(binary), mimeType: 'audio/pcm;rate=16000' };
  }

  stop() {
    this.session = null;
    if (this.frameInterval) clearInterval(this.frameInterval);
    if (scriptProcessor && inputAudioContext) {
        scriptProcessor.disconnect();
        sourceNode?.disconnect();
    }
    sources.forEach(s => s.stop());
    sources.clear();
    nextStartTime = 0;
  }
}