class AudioService {
    private ctx: AudioContext | null = null;
    private isMuted: boolean = false;
  
    constructor() {
      // Lazy init to comply with browser autoplay policies
    }
  
    private getCtx() {
      if (!this.ctx) {
        this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      return this.ctx;
    }
  
    setMuted(muted: boolean) {
      this.isMuted = muted;
    }
  
    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }
  
    // --- SFX GENERATORS ---
  
    playUI(type: 'click' | 'back' | 'toggle') {
      if (this.isMuted) return;
      const ctx = this.getCtx();
      this.resume();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
  
      if (type === 'click') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
          gain.gain.setValueAtTime(0.1, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
          osc.start();
          osc.stop(ctx.currentTime + 0.1);
      } else if (type === 'back') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(600, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
          gain.gain.setValueAtTime(0.1, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
          osc.start();
          osc.stop(ctx.currentTime + 0.1);
      }
    }
  
    playHit(quality: 'PERFECT' | 'GOOD') {
        if (this.isMuted) return;
        const ctx = this.getCtx();
        this.resume();
  
        const t = ctx.currentTime;
        
        // Main tone
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
  
        if (quality === 'PERFECT') {
            // High shimmer chord
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(880, t); // A5
            osc.frequency.exponentialRampToValueAtTime(1760, t + 0.1);
            gain.gain.setValueAtTime(0.2, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
            osc.start(t);
            osc.stop(t + 0.4);
  
            // Harmony
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(1108, t); // C#6
            gain2.gain.setValueAtTime(0.1, t);
            gain2.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
            osc2.start(t);
            osc2.stop(t + 0.3);
        } else {
            // Good hit
            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, t);
            osc.frequency.linearRampToValueAtTime(660, t + 0.1);
            gain.gain.setValueAtTime(0.2, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
            osc.start(t);
            osc.stop(t + 0.2);
        }
    }
  
    playMiss() {
        if (this.isMuted) return;
        const ctx = this.getCtx();
        this.resume();
        const t = ctx.currentTime;
  
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
  
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.linearRampToValueAtTime(100, t + 0.3);
        
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.linearRampToValueAtTime(0, t + 0.3);
        
        osc.start(t);
        osc.stop(t + 0.3);
    }
  
    playLevelUp() {
        if (this.isMuted) return;
        const ctx = this.getCtx();
        this.resume();
        const t = ctx.currentTime;
  
        // Fanfare
        [440, 554, 659, 880].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.type = 'square';
            osc.frequency.value = freq;
            
            const start = t + i * 0.1;
            gain.gain.setValueAtTime(0, start);
            gain.gain.linearRampToValueAtTime(0.1, start + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, start + 0.5);
            
            osc.start(start);
            osc.stop(start + 0.5);
        });
    }

    playUnlock() {
        if (this.isMuted) return;
        const ctx = this.getCtx();
        this.resume();
        const t = ctx.currentTime;
        
        // Magical sweep
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, t);
        osc.frequency.exponentialRampToValueAtTime(2000, t + 0.5);
        
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.2, t + 0.25);
        gain.gain.linearRampToValueAtTime(0, t + 0.5);
        
        osc.start(t);
        osc.stop(t + 0.5);
    }
  }
  
  export const SoundEngine = new AudioService();
  