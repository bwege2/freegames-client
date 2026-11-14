// PokerTH 1.1.2: src/gui/qt/sound/soundevents.cpp and sdlplayer.cpp. The original plays the WAV files with
// SDL_mixer at volume SoundVolume*10 (of 128) and places the sound of player 0..6 with Mix_SetPosition
// (angle, distance); the port does the same with Web Audio (a StereoPanner for the angle, a gain for the
// distance: SDL_mixer's distance 0..255 is attenuation). AGPL-3.0-or-later, see ../LICENSE.md.
import { soundUrl } from './assets.ts';

const POSITION: Record<number, [number, number]> = {
  0: [180, 10], 1: [281, 50], 2: [315, 120], 3: [338, 160], 4: [23, 160], 5: [45, 120], 6: [79, 50],
};

export class Sound {
  private buffers = new Map<string, Promise<AudioBuffer | null>>();
  private lastSBValue = 0;
  private lastSBLevel = 0;
  private newGameNow = false;
  enabled = true;
  /** SoundVolume, 0..10 (default 8) */
  volume = 8;

  constructor(private audio: AudioContext | null, private signal: AbortSignal) {}

  private load(name: string): Promise<AudioBuffer | null> {
    let b = this.buffers.get(name);
    if (!b) {
      const audio = this.audio;
      b = audio
        ? fetch(soundUrl(name), { signal: this.signal })
          .then((r) => r.arrayBuffer())
          .then((d) => audio.decodeAudioData(d))
          .catch(() => null)
        : Promise.resolve(null);
      this.buffers.set(name, b);
    }
    return b;
  }

  preload(names: string[]): void {
    for (const n of names) void this.load(n);
  }

  /** SDLPlayer::playSound(audioString, playerID) */
  playSound(name: string, playerID: number): void {
    if (!this.enabled || !this.audio) return;
    const audio = this.audio;
    void this.load(name).then((buf) => {
      if (!buf || this.signal.aborted || audio.state === 'closed') return;
      const src = audio.createBufferSource();
      src.buffer = buf;
      const [angle, distance] = POSITION[playerID] ?? [0, 0];
      const gain = audio.createGain();
      gain.gain.value = ((this.volume * 10) / 128) * (1 - distance / 255);
      const pan = audio.createStereoPanner();
      pan.pan.value = Math.sin((angle * Math.PI) / 180);
      src.connect(gain).connect(pan).connect(audio.destination);
      src.start();
    });
  }

  /** SoundEvents::blindsWereSet */
  blindsWereSet(sB: number): void {
    if (this.newGameNow) {
      this.lastSBLevel = 0;
      this.lastSBValue = sB;
      this.newGameNow = false;
    }
    if (sB > this.lastSBValue) {
      this.lastSBValue = sB;
      ++this.lastSBLevel;
      if (this.lastSBLevel === 1 || this.lastSBLevel === 2) this.playSound('blinds_raises_level1', 0);
      if (this.lastSBLevel === 3 || this.lastSBLevel === 4) this.playSound('blinds_raises_level2', 0);
      if (this.lastSBLevel >= 5) this.playSound('blinds_raises_level3', 0);
    }
  }

  newGameStarts(): void {
    this.newGameNow = true;
  }
}
