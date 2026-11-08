/**
 * Web Audio API synthesizer for Neema Dispensary Emergency Sirens
 * Supports dual-tone ambulance wail and rapid police yelp with volume control
 */

class EmergencyAudioSiren {
  private audioCtx: AudioContext | null = null;
  private isPlaying = false;
  private oscillator: OscillatorNode | null = null;
  private lfo: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private lfoGain: GainNode | null = null;
  private volume = 0.6;
  private isMuted = false;

  private initContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public startSiren(type: 'ambulance' | 'police' = 'police') {
    try {
      this.initContext();
      if (!this.audioCtx) return;

      if (this.isPlaying) {
        this.stopSiren();
      }

      const now = this.audioCtx.currentTime;

      // Master gain
      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.setValueAtTime(this.isMuted ? 0 : this.volume * 0.4, now);
      this.gainNode.connect(this.audioCtx.destination);

      // Main tone oscillator
      this.oscillator = this.audioCtx.createOscillator();
      this.oscillator.type = type === 'police' ? 'sawtooth' : 'triangle';

      // Low frequency modulation oscillator for siren wail/yelp
      this.lfo = this.audioCtx.createOscillator();
      this.lfoGain = this.audioCtx.createGain();

      if (type === 'police') {
        // High urgency 2-3 Hz modulation between 650Hz and 1200Hz
        this.oscillator.frequency.setValueAtTime(800, now);
        this.lfo.frequency.setValueAtTime(2.4, now);
        this.lfo.type = 'sawtooth';
        this.lfoGain.gain.setValueAtTime(350, now);
      } else {
        // Classic European / African two-tone ambulance wail
        this.oscillator.frequency.setValueAtTime(650, now);
        this.lfo.frequency.setValueAtTime(0.8, now);
        this.lfo.type = 'sine';
        this.lfoGain.gain.setValueAtTime(280, now);
      }

      this.lfo.connect(this.lfoGain);
      this.lfoGain.connect(this.oscillator.frequency);

      this.oscillator.connect(this.gainNode);

      this.lfo.start(now);
      this.oscillator.start(now);
      this.isPlaying = true;
    } catch (e) {
      console.warn('AudioContext autoplay or init issue:', e);
    }
  }

  public stopSiren() {
    try {
      if (this.oscillator) {
        this.oscillator.stop();
        this.oscillator.disconnect();
        this.oscillator = null;
      }
      if (this.lfo) {
        this.lfo.stop();
        this.lfo.disconnect();
        this.lfo = null;
      }
      if (this.lfoGain) {
        this.lfoGain.disconnect();
        this.lfoGain = null;
      }
      if (this.gainNode) {
        this.gainNode.disconnect();
        this.gainNode = null;
      }
      this.isPlaying = false;
    } catch {
      this.isPlaying = false;
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.gainNode && this.audioCtx && !this.isMuted) {
      this.gainNode.gain.setValueAtTime(this.volume * 0.4, this.audioCtx.currentTime);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.gainNode && this.audioCtx) {
      this.gainNode.gain.setValueAtTime(this.isMuted ? 0 : this.volume * 0.4, this.audioCtx.currentTime);
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const emergencyAudio = new EmergencyAudioSiren();
