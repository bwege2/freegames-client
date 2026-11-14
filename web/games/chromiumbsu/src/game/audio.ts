// Chromium B.S.U. port (GPL-3.0-or-later; translated in 2026 by the freegames project from the original by Mark B. Allan, Clarified Artistic License; LICENSE.md): src/Audio.cpp and src/AudioOpenAL.cpp,
// the sound the Linux build makes (OpenAL, no CD audio, no playlist). The OpenAL calls go to an
// AudioBackend: render/sound.ts plays them with Web Audio, the test records them.
import type { Global } from './global.ts';

const f = Math.fround;

export const HeroAmmo00 = 0, PowerUp = 1, Explosion = 2, ExploPop = 3, ExploBig = 4, AddLife = 5,
  LoseLife = 6, MusicGame = 7, MusicMenu = 8, NumSoundTypes = 9;
const NUM_EXPLO = 2, NUM_EXPLO_POP = 6;

/** the sound files (Audio::Audio) */
export const SOUND_FILES = ['boom.wav', 'power.wav', 'exploStd.wav', 'exploPop.wav', 'exploBig.wav',
  'life_add.wav', 'life_lose.wav', 'music_game.wav', 'music_menu.wav'];

/** what AudioOpenAL asks of OpenAL */
export interface AudioBackend {
  /** alGenSources: new source ids */
  genSources(n: number): number[];
  /** alSourcei(AL_BUFFER): the source plays this sound */
  buffer(source: number, sound: number): void;
  position(source: number, x: number, y: number, z: number): void;
  looping(source: number, on: boolean): void;
  gain(source: number, v: number): void;
  play(source: number): void;
  stop(source: number): void;
  pause(source: number): void;
}

class SoundInfo {
  type: number;
  pos = new Float32Array(3);
  age: number;
  constructor(t: number, p: ArrayLike<number>, a: number) {
    this.type = t;
    this.pos[0] = p[0]; this.pos[1] = p[1]; this.pos[2] = p[2];
    this.age = a;
  }
}

export class AudioOpenAL {
  /** delayed sounds, newest first */
  soundQueue: SoundInfo[] = [];
  source: number[] = [];
  sourceExplosion: number[] = [];
  sourceExploPop: number[] = [];
  gain = new Float32Array(NumSoundTypes);
  numReqThisFrame = new Int32Array(NumSoundTypes);
  explosionIndex = 0;
  exploPopIndex = 0;
  audioScale = new Float32Array(3);
  soundVolume = 0;
  musicVolume = 0;
  musicMax = 1;
  musicIndex = 0;
  private readonly game: Global;
  private readonly al: AudioBackend;

  constructor(game: Global, al: AudioBackend) {
    this.game = game;
    this.al = al;
    if (game.config.audioEnabled()) {
      this.initSound();
      // no alAttenuationScale_LOKI extension in OpenAL Soft: "Kludge it."
      this.audioScale[0] = 0.5;
      this.audioScale[1] = 0.3;
      this.audioScale[2] = 0.3;
      if (game.config.swapStereo()) this.audioScale[0] = -this.audioScale[0];
    }
  }

  private initSound(): void {
    const al = this.al;
    const config = this.game.config;
    const r = this.game.rand;
    const pos = [0.0, -5.0, 25.0];
    this.source = al.genSources(NumSoundTypes);
    for (let i = 0; i < NumSoundTypes; i++) {
      switch (i) {
        case PowerUp: this.gain[PowerUp] = 0.7; break;
        case ExploPop: this.gain[ExploPop] = 0.8; break;
        case MusicGame: this.gain[MusicGame] = 0.7; break;
        case MusicMenu: this.gain[MusicMenu] = 0.7; break;
        default: this.gain[i] = 1.0; break;
      }
    }
    for (let i = 0; i < NumSoundTypes; i++) {
      al.position(this.source[i], pos[0], pos[1], pos[2]);
      al.looping(this.source[i], false);
      al.buffer(this.source[i], i);
      al.gain(this.source[i], this.gain[i]);
    }
    // overlapped explosions
    this.sourceExplosion = al.genSources(NUM_EXPLO - 1);
    this.sourceExplosion[NUM_EXPLO - 1] = this.source[Explosion];
    for (let i = 0; i < NUM_EXPLO - 1; i++) {
      al.position(this.sourceExplosion[i], pos[0], pos[1], pos[2]);
      al.looping(this.sourceExplosion[i], false);
      al.buffer(this.sourceExplosion[i], Explosion);
      al.gain(this.sourceExplosion[i], f(this.gain[Explosion] * (0.7 + 0.3 * r.F)));
    }
    this.sourceExploPop = al.genSources(NUM_EXPLO_POP - 1);
    this.sourceExploPop[NUM_EXPLO_POP - 1] = this.source[ExploPop];
    for (let i = 0; i < NUM_EXPLO_POP - 1; i++) {
      al.position(this.sourceExploPop[i], pos[0], pos[1], pos[2]);
      al.looping(this.sourceExploPop[i], false);
      al.buffer(this.sourceExploPop[i], ExploPop);
      al.gain(this.sourceExploPop[i], f(0.0 * this.gain[ExploPop] * (0.1 + 0.9 * r.F)));
    }
    this.setSoundVolume(config.volSound());
    this.setMusicVolume(config.volMusic());
  }

  stopMusic(): void {
    if (this.game.config.audioEnabled()) {
      this.al.stop(this.source[MusicMenu]);
      this.al.stop(this.source[MusicGame]);
    }
  }

  pauseGameMusic(status: boolean): void {
    if (this.game.config.audioEnabled()) {
      if (status) this.al.pause(this.source[MusicGame]);
      else this.al.play(this.source[MusicGame]);
    }
  }

  setMusicMode(mode: number): void {
    const al = this.al;
    if (!this.game.config.audioEnabled()) return;
    switch (mode) {
      default:
      case MusicGame:
        al.stop(this.source[MusicMenu]);
        al.looping(this.source[MusicGame], true);
        if (!this.game.gamePause) al.play(this.source[MusicGame]);
        break;
      case MusicMenu:
        al.pause(this.source[MusicGame]);
        al.looping(this.source[MusicMenu], true);
        al.play(this.source[MusicMenu]);
        break;
    }
  }

  setSoundVolume(vol: number): void {
    const al = this.al;
    const r = this.game.rand;
    if (!this.game.config.audioEnabled()) return;
    vol = f(vol);
    if (vol > 1.0) vol = 1.0;
    if (vol < 0.0) vol = 0.0;
    this.soundVolume = vol;
    for (let i = 0; i < MusicGame; i++) al.gain(this.source[i], f(this.gain[i] * vol));
    for (let i = 0; i < NUM_EXPLO; i++) al.gain(this.sourceExplosion[i], f((0.5 + r.F * 0.5) * this.gain[Explosion] * this.soundVolume));
    for (let i = 0; i < NUM_EXPLO_POP; i++) al.gain(this.sourceExploPop[i], f((0.2 + r.F * 0.8) * this.gain[Explosion] * this.soundVolume));
  }

  setMusicVolume(vol: number): void {
    if (!this.game.config.audioEnabled()) return;
    vol = f(vol);
    if (vol > 1.0) vol = 1.0;
    if (vol < 0.0) vol = 0.0;
    this.musicVolume = vol;
    this.al.gain(this.source[MusicGame], f(this.gain[MusicGame] * this.musicVolume));
    this.al.gain(this.source[MusicMenu], f(this.gain[MusicGame] * this.musicVolume));
  }

  /** without CD audio or a playlist this only counts (AudioOpenAL::setMusicIndex -> Audio::setMusicIndex) */
  setMusicIndex(index: number): void {
    if (this.musicMax) this.musicIndex = index % this.musicMax;
  }

  nextMusicIndex(): void {
    let i = this.musicIndex + 1;
    if (i >= this.musicMax) i = 0;
    this.setMusicIndex(i);
  }

  update(): void {
    // play any delayed sounds
    for (let k = 0; k < this.soundQueue.length;) {
      const s = this.soundQueue[k];
      s.age++;
      if (s.age >= 0) {
        this.soundQueue.splice(k, 1);
        this.playSound(s.type, s.pos);
      } else k++;
    }
    this.numReqThisFrame.fill(0);
  }

  playSound(type: number, pos: ArrayLike<number>, age = 0): void {
    const al = this.al;
    if (!this.game.config.audioEnabled()) return;
    const p = new Float32Array([pos[0] * this.audioScale[0], pos[1] * this.audioScale[1], pos[2] * this.audioScale[2]]);
    if (age >= 0) {
      this.numReqThisFrame[type]++;
      // only play one sound of any given type per frame...
      if (this.numReqThisFrame[type] < 2) {
        switch (type) {
          case Explosion:
            this.explosionIndex = (this.explosionIndex + 1) % NUM_EXPLO;
            al.stop(this.sourceExplosion[this.explosionIndex]);
            al.position(this.sourceExplosion[this.explosionIndex], p[0], p[1], p[2]);
            al.play(this.sourceExplosion[this.explosionIndex]);
            break;
          case ExploPop:
            p[0] *= 1.5;
            this.exploPopIndex = (this.exploPopIndex + 1) % NUM_EXPLO_POP;
            al.stop(this.sourceExploPop[this.exploPopIndex]);
            al.position(this.sourceExploPop[this.exploPopIndex], p[0], p[1], p[2]);
            al.play(this.sourceExploPop[this.exploPopIndex]);
            break;
          default:
            al.stop(this.source[type]);
            al.position(this.source[type], p[0], p[1], p[2]);
            al.play(this.source[type]);
            break;
        }
      }
    } else {
      this.soundQueue.unshift(new SoundInfo(type, pos, age));
    }
  }
}
