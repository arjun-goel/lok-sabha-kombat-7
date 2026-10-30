import { GameSettings } from '../types';

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private bgmInterval: number | null = null;
  private isPlayingBgm = false;
  private step = 0;
  private settings: GameSettings;
  private currentMemeAudio: HTMLAudioElement | null = null;
  private lastMemeTime = 0;
  private audioCache = new Map<string, HTMLAudioElement>();

  constructor(settings: GameSettings) {
    this.settings = settings;
    this.preloadMemeClips();
  }

  private preloadMemeClips(): void {
    const urls = [
      '/sounds/modi_bhojyam.mp3',
      '/sounds/modi_lavden_bhojyam.mp3',
      '/sounds/modi_wah.mp3',
      '/sounds/modi_kya_takleef.mp3',
      '/sounds/modi_sab_changasi.mp3',
      '/sounds/modi_bkl.mp3',
      '/sounds/mamata_humba_rumba.mp3',
      '/sounds/mamata_ei_bosun.mp3',
      '/sounds/mamata_clip.mp3',
      '/sounds/rahul_khatam_tata.mp3',
      '/sounds/rahul_maza_aaya.mp3',
      '/sounds/rahul_khatam_short.mp3',
      '/sounds/kejriwal_toh_kar_na.mp3',
      '/sounds/yogi_meme.mp3',
      '/sounds/yogi_bulldozer.mp3',
      '/sounds/yogi_system.mp3'
    ];
    for (const url of urls) {
      const audio = new Audio(url);
      audio.preload = 'auto';
      this.audioCache.set(url, audio);
    }
  }

  public playMemeClip(url: string, forceInterrupt = false): void {
    if (!this.settings.announcerEnabled) return;
    const vol = this.getEffectiveSfxGain();
    if (vol <= 0 || !url) return;

    const now = performance.now();
    // Prevent rapid overlapping spam unless forced (e.g., Rage Art, KO, Launcher, Character Select)
    if (!forceInterrupt && now - this.lastMemeTime < 1400) {
      return;
    }

    if (this.currentMemeAudio) {
      if (forceInterrupt) {
        this.currentMemeAudio.pause();
        this.currentMemeAudio.currentTime = 0;
      } else if (!this.currentMemeAudio.paused && !this.currentMemeAudio.ended) {
        return;
      }
    }

    this.lastMemeTime = now;

    // Clone or reuse cached audio element
    let audio = this.audioCache.get(url);
    if (!audio) {
      audio = new Audio(url);
      this.audioCache.set(url, audio);
    }

    audio.currentTime = 0;
    audio.volume = Math.min(1, vol * 1.0);
    this.currentMemeAudio = audio;
    audio.play().catch(() => {});
  }

  public updateSettings(settings: GameSettings): void {
    this.settings = settings;
    if (this.settings.bgmVolume <= 0 || this.settings.masterVolume <= 0) {
      this.stopBGM();
    } else if (!this.isPlayingBgm) {
      this.startBGM();
    }
  }

  private ensureContext(): AudioContext | null {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private getEffectiveSfxGain(): number {
    return (this.settings.masterVolume / 100) * (this.settings.sfxVolume / 100);
  }

  private getEffectiveBgmGain(): number {
    return (this.settings.masterVolume / 100) * (this.settings.bgmVolume / 100);
  }

  public playUIClick(pitch = 620): void {
    const ctx = this.ensureContext();
    const vol = this.getEffectiveSfxGain();
    if (!ctx || vol <= 0) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(pitch, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(pitch * 1.45, ctx.currentTime + 0.065);

    gain.gain.setValueAtTime(0.18 * vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.075);
  }

  public playWhoosh(heavy = false): void {
    const ctx = this.ensureContext();
    const vol = this.getEffectiveSfxGain();
    if (!ctx || vol <= 0) return;

    const dur = heavy ? 0.19 : 0.11;
    const bufferSize = ctx.sampleRate * dur;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(heavy ? 380 : 680, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(heavy ? 140 : 260, ctx.currentTime + dur);
    filter.Q.value = 1.8;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.24 * vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
  }

  public playHitImpact(type: 'light' | 'medium' | 'heavy' | 'electric' | 'rage' | 'throw' | 'block'): void {
    const ctx = this.ensureContext();
    const vol = this.getEffectiveSfxGain();
    if (!ctx || vol <= 0) return;

    const now = ctx.currentTime;

    if (type === 'block') {
      // Crisp metallic guard clang
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(170, now + 0.09);
      gain.gain.setValueAtTime(0.28 * vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
      return;
    }

    // Sub punch bass thump
    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    sub.type = type === 'electric' || type === 'rage' ? 'sawtooth' : 'sine';

    const startFreq = type === 'light' ? 190 : type === 'medium' ? 150 : 120;
    const dur = type === 'light' ? 0.12 : type === 'medium' ? 0.18 : 0.32;

    sub.frequency.setValueAtTime(startFreq, now);
    sub.frequency.exponentialRampToValueAtTime(32, now + dur);

    subGain.gain.setValueAtTime((type === 'light' ? 0.35 : 0.55) * vol, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    sub.connect(subGain);
    subGain.connect(ctx.destination);
    sub.start(now);
    sub.stop(now + dur);

    // High-energy slap / chappal / burst noise
    const noiseDur = type === 'rage' ? 0.42 : type === 'electric' ? 0.28 : 0.14;
    const bufSize = Math.floor(ctx.sampleRate * noiseDur);
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const ch = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufSize, 1.4);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buf;

    const filter = ctx.createBiquadFilter();
    filter.type = type === 'electric' || type === 'rage' ? 'highpass' : 'lowpass';
    filter.frequency.setValueAtTime(type === 'electric' ? 1400 : 1900, now);

    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(0.42 * vol, now);
    nGain.gain.exponentialRampToValueAtTime(0.005, now + noiseDur);

    noise.connect(filter);
    filter.connect(nGain);
    nGain.connect(ctx.destination);
    noise.start(now);

    // Electric crackle arpeggio for Electric / Rage moves (Tekken EWGF DORYA feel!)
    if (type === 'electric' || type === 'rage') {
      const zap = ctx.createOscillator();
      const zapGain = ctx.createGain();
      zap.type = 'sawtooth';
      zap.frequency.setValueAtTime(880, now);
      zap.frequency.setValueAtTime(1320, now + 0.04);
      zap.frequency.setValueAtTime(640, now + 0.08);
      zap.frequency.setValueAtTime(1680, now + 0.12);
      zap.frequency.exponentialRampToValueAtTime(220, now + 0.26);

      zapGain.gain.setValueAtTime(0.26 * vol, now);
      zapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.27);

      zap.connect(zapGain);
      zapGain.connect(ctx.destination);
      zap.start(now);
      zap.stop(now + 0.27);
    }
  }

  public playCrowdCheer(): void {
    const ctx = this.ensureContext();
    const vol = this.getEffectiveSfxGain();
    if (!ctx || vol <= 0) return;

    const now = ctx.currentTime;
    // Play a comedic "Breaking News" brass fanfare + crowd roar
    const notes = [261.63, 329.63, 392.0, 523.25];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      g.gain.setValueAtTime(0.16 * vol, now + idx * 0.08);
      g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.36);
    });
  }

  public speakAnnouncer(text: string, pitch = 0.85, rate = 1.05): void {
    if (!this.settings.announcerEnabled) return;
    const vol = this.getEffectiveSfxGain();
    if (vol <= 0) return;

    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.pitch = pitch;
        utter.rate = rate;
        utter.volume = Math.min(1, vol * 1.1);
        window.speechSynthesis.speak(utter);
      } catch {
        // Ignore speech synthesis errors on restricted platforms
      }
    }
  }

  public startBGM(): void {
    if (this.isPlayingBgm) return;
    const vol = this.getEffectiveBgmGain();
    if (vol <= 0) return;

    this.isPlayingBgm = true;
    this.step = 0;

    // Energetic Desi-Cyber Dhol + Tekken Synth Bassline @ 136 BPM
    const bassNotes = [110, 110, 130.81, 146.83, 110, 110, 164.81, 146.83];
    const leadMelody = [440, 0, 523.25, 587.33, 659.25, 587.33, 523.25, 493.88];

    this.bgmInterval = window.setInterval(() => {
      const ctx = this.ensureContext();
      const bgmVol = this.getEffectiveBgmGain();
      if (!ctx || bgmVol <= 0 || ctx.state !== 'running') return;

      const now = ctx.currentTime;
      const idx = this.step % 8;

      // Dhol / Kick beat on 0, 2, 3, 5, 6
      if (idx === 0 || idx === 2 || idx === 3 || idx === 5 || idx === 6) {
        const kick = ctx.createOscillator();
        const kGain = ctx.createGain();
        kick.type = 'sine';
        kick.frequency.setValueAtTime(idx % 2 === 0 ? 135 : 175, now);
        kick.frequency.exponentialRampToValueAtTime(42, now + 0.13);
        kGain.gain.setValueAtTime(0.18 * bgmVol, now);
        kGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
        kick.connect(kGain);
        kGain.connect(ctx.destination);
        kick.start(now);
        kick.stop(now + 0.14);
      }

      // Driving Cyber Bass
      const bass = ctx.createOscillator();
      const bGain = ctx.createGain();
      bass.type = 'sawtooth';
      bass.frequency.setValueAtTime(bassNotes[idx], now);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(460, now);

      bGain.gain.setValueAtTime(0.09 * bgmVol, now);
      bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      bass.connect(filter);
      filter.connect(bGain);
      bGain.connect(ctx.destination);
      bass.start(now);
      bass.stop(now + 0.19);

      // Shehnai / Synth Lead Riff every other bar
      if (Math.floor(this.step / 8) % 2 === 1 && leadMelody[idx] > 0) {
        const lead = ctx.createOscillator();
        const lGain = ctx.createGain();
        lead.type = 'triangle';
        lead.frequency.setValueAtTime(leadMelody[idx], now);
        lGain.gain.setValueAtTime(0.055 * bgmVol, now);
        lGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
        lead.connect(lGain);
        lGain.connect(ctx.destination);
        lead.start(now);
        lead.stop(now + 0.17);
      }

      this.step++;
    }, 210);
  }

  public stopBGM(): void {
    if (this.bgmInterval !== null) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
    this.isPlayingBgm = false;
  }
}
