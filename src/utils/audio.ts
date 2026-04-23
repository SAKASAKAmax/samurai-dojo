class AudioEngine {
  ctx: AudioContext | null = null;
  isEnabled: boolean = false;

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.isEnabled = true;
  }

  // 素振りの風切り音（ホワイトノイズ＋バンドパスフィルター）
  playSwing() {
    if (!this.isEnabled || !this.ctx) return;

    const ctx = this.ctx;
    const bufferSize = ctx.sampleRate * 0.3; // 300ms
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.2);
    filter.Q.value = 1.5;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.8, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
  }

  // ガラスが割れるヒット音（高音域のノイズ＋鋭い減衰）
  playHit() {
    if (!this.isEnabled || !this.ctx) return;

    const ctx = this.ctx;
    
    // 複数のノイズを重ねて複雑な割れ音を作る
    const playShard = (freq: number, delay: number, duration: number) => {
      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = freq;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(1, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + duration - 0.05);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(ctx.currentTime + delay);
    };

    // メインの衝撃音
    playShard(4000, 0, 0.2);
    // 遅れて鳴る破片の音
    playShard(6000, 0.02, 0.15);
    playShard(8000, 0.05, 0.1);
  }
}

export const audio = new AudioEngine();
