// Bomberslop: GPL-3.0-or-later (web/games/bomberslop/LICENSE.md).
// The sound effects: ClanBomber 2.2.0's own (src/wavs, by Andreas Hundt and Denis Oliver Kropp, GPL-3.0-or-later,
// unchanged in assets/sounds/), played where the original plays them: the game names them (sim.ts sounds), the
// menus play break (a move), clear (a choice) and whoosh (a menu appears), the end of a match klatsch (applause).
// They load in the background (game.json lazyAssets): the game starts without waiting and is silent until then.
const URLS = import.meta.glob('../assets/sounds/*.wav', { query: '?url', import: 'default', eager: true }) as Record<string, string>;

export class Sound {
  private readonly audio: AudioContext;
  private readonly buffers = new Map<string, AudioBuffer>();
  private readonly gain: GainNode;
  muted = false;

  constructor(audio: AudioContext) {
    this.audio = audio;
    this.gain = audio.createGain();
    this.gain.gain.value = 0.6;
    this.gain.connect(audio.destination);
  }

  /** loads every sound; failures leave that sound silent */
  async load(signal: AbortSignal): Promise<void> {
    await Promise.all(Object.entries(URLS).map(async ([path, url]) => {
      const name = path.replace(/^.*\//, '').replace(/\.wav$/, '');
      try {
        const res = await fetch(url, { signal });
        const data = await res.arrayBuffer();
        this.buffers.set(name, await this.audio.decodeAudioData(data));
      } catch {
        // stays silent
      }
    }));
  }

  play(name: string): void {
    if (this.muted) return;
    const b = this.buffers.get(name);
    if (!b) return;
    try {
      if (this.audio.state === 'suspended') void this.audio.resume();
      const src = this.audio.createBufferSource();
      src.buffer = b;
      src.connect(this.gain);
      src.start();
    } catch {
      // the audio context is closed: the game stopped
    }
  }
}
