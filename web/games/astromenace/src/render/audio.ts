// AstroMenace 1.4.3 (Mikhail Kurinnoi, Viewizard; GPL-3.0-or-later): the sound and music of
// src/assets/audio.cpp (which file, which volume) played with Web Audio instead of OpenAL (src/core/sound).
// Game sounds are placed in 3D with a PannerNode at the camera; the music fades as the original's
// (fade-in and fade-out in milliseconds, intro and loop files). Changed for the browser by the freegames
// project, 2026.
import { Vec3 } from '../core/math.ts';
import { getCameraLocation } from '../core/camera.ts';
import { audio, MusicTheme } from '../game/globals.ts';
import { GameConfig } from '../game/config.ts';

const MENU: [string, number, boolean][] = [
  ['sfx/menu_onbutton2.wav', 0.15, false], ['sfx/menu_onbutton.wav', 0.4, false], ['sfx/menu_click.wav', 0.6, false],
  ['sfx/menu_new.wav', 1, true], ['sfx/menu_taping.wav', 0.8, true], ['sfx/menu_online.wav', 0.75, true],
  ['sfx/menu_selectline.wav', 1, true], ['sfx/menu_nclick.wav', 1, false], ['sfx/drag_error.wav', 1, true],
  ['sfx/drag_offslot.wav', 0.65, true], ['sfx/drag_onslot.wav', 0.82, true], ['sfx/drag_release.wav', 0.6, true],
  ['sfx/game_showmenu.wav', 1, false], ['sfx/game_hidemenu.wav', 1, false], ['sfx/lowlife.wav', 1, true],
];
const GAME: [string, number][] = [
  ['', 1], ['sfx/weapon1probl.wav', 1], ['sfx/weapon2probl.wav', 1], ['sfx/weapon3probl.wav', 1], ['sfx/weapon4probl.wav', 1],
  ['sfx/weapon5probl.wav', 1], ['sfx/explosion4.wav', 1], ['sfx/explosion1.wav', 1], ['sfx/explosion2.wav', 1],
  ['sfx/explosion3.wav', 1], ['sfx/weaponfire1.wav', 0.7], ['sfx/weaponfire2.wav', 0.65], ['sfx/weaponfire3.wav', 0.7],
  ['sfx/weaponfire4.wav', 1], ['sfx/weaponfire5.wav', 1], ['sfx/weaponfire6.wav', 1], ['sfx/weaponfire7.wav', 0.7],
  ['sfx/weaponfire8.wav', 0.85], ['sfx/weaponfire9.wav', 0.95], ['sfx/weaponfire10.wav', 0.9], ['sfx/weaponfire11.wav', 0.6],
  ['sfx/weaponfire12.wav', 0.55], ['sfx/weaponfire13.wav', 0.9], ['sfx/weaponfire14.wav', 0.8], ['sfx/weaponfire15.wav', 0.8],
  ['sfx/weaponfire16.wav', 1], ['sfx/weaponfire17.wav', 1], ['sfx/weaponfire18.wav', 1], ['sfx/weaponfire19.wav', 1],
  ['sfx/kinetichit.wav', 1], ['sfx/ionhit.wav', 1], ['sfx/plasmahit.wav', 1], ['sfx/antimaterhit.wav', 1], ['sfx/gausshit.wav', 1],
];
const VOICE = ['Attention', 'EngineMalfunction', 'MissileDetected', 'PowerSupplyReestablished', 'PrepareForAction',
  'ReactorMalfunction', 'Warning', 'WeaponDamaged', 'WeaponDestroyed', 'WeaponMalfunction'].map((n) => `lang/en/voice/${n}.wav`);
const MUSIC: Record<number, [string, string, number, boolean]> = {
  [MusicTheme.MENU]: ['music/menu.ogg', '', 1, false],
  [MusicTheme.GAME]: ['music/game.ogg', '', 1, true],
  [MusicTheme.BOSS]: ['music/boss-loop.ogg', '', 1, false],
  [MusicTheme.FAILED]: ['music/missionfailed.ogg', '', 0.7, false],
  [MusicTheme.CREDITS]: ['music/boss-intro.ogg', 'music/boss-loop.ogg', 1, false],
};

export const SOUND_FILES = [...MENU.map((m) => m[0]), ...GAME.slice(1).map((g) => g[0]), ...VOICE];
export const MUSIC_FILES = ['music/menu.ogg', 'music/game.ogg', 'music/boss-loop.ogg', 'music/missionfailed.ogg', 'music/boss-intro.ogg'];

interface Playing { file: string; src: AudioBufferSourceNode; gain: GainNode; panner: PannerNode | null; ended: boolean; allowStop: boolean }
interface Music { file: string; src: AudioBufferSourceNode | null; gain: GainNode; ended: boolean }

export class WebAudio {
  private ctx: AudioContext;
  private buffers: Map<string, AudioBuffer>;
  private sounds = new Map<number, Playing>();
  private nextId = 1;
  private music: Music[] = [];
  private theme = MusicTheme.NONE;
  private loadMusic: (file: string) => Promise<AudioBuffer | null>;
  private musicBuffers = new Map<string, AudioBuffer | null>();

  constructor(ctx: AudioContext, buffers: Map<string, AudioBuffer>, loadMusic: (file: string) => Promise<AudioBuffer | null>) {
    this.ctx = ctx;
    this.buffers = buffers;
    this.loadMusic = loadMusic;
    audio.playMenuSFX = (id, vol) => this.playMenu(id, vol);
    audio.playGameSFX = (id, vol, loc) => this.playGame(id, vol, loc);
    audio.playVoicePhrase = (id, vol) => this.play(VOICE[id], vol, GameConfig().VoiceVolume / 10, null, true);
    audio.playMusicTheme = (t, fi, fo) => { this.playMusic(t, fi, fo); };
    audio.isSoundAvailable = (id) => { const s = this.sounds.get(id); return !!s && !s.ended; };
    audio.stopSound = (id, fade) => this.stop(id, fade);
    audio.setSoundLocation = (id, x, y, z) => {
      const s = this.sounds.get(id);
      if (s?.panner) this.place(s.panner, new Vec3(x, y, z));
    };
  }

  private playMenu(id: number, vol: number): number {
    const m = MENU[id];
    if (!m || !GameConfig().SoundVolume) return 0;
    // vw_ReplayFirstFoundSound: a menu sound that still plays starts again
    for (const [k, s] of this.sounds) {
      if (s.file === m[0] && !s.ended) {
        this.stop(k, 0);
        return this.play(m[0], vol * m[1], GameConfig().SoundVolume / 10, null, m[2], k);
      }
    }
    return this.play(m[0], vol * m[1], GameConfig().SoundVolume / 10, null, m[2]);
  }

  private playGame(id: number, vol: number, loc: Vec3): number {
    const g = GAME[id];
    if (!g || !g[0] || !GameConfig().SoundVolume) return 0;
    return this.play(g[0], vol * g[1], GameConfig().SoundVolume / 10, loc, true);
  }

  private place(p: PannerNode, loc: Vec3): void {
    const c = getCameraLocation();
    p.positionX.value = loc.x - c.x;
    p.positionY.value = loc.y - c.y;
    p.positionZ.value = -(loc.z - c.z);
  }

  private play(file: string, local: number, global: number, loc: Vec3 | null, allowStop: boolean, reuseId = 0): number {
    const buf = this.buffers.get(file);
    if (!buf || this.ctx.state === 'closed') return 0;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const gain = this.ctx.createGain();
    gain.gain.value = Math.max(0, local * global);
    let panner: PannerNode | null = null;
    if (loc) {
      panner = this.ctx.createPanner();
      panner.distanceModel = 'inverse';
      panner.refDistance = 30;
      panner.rolloffFactor = 1;
      this.place(panner, loc);
      src.connect(panner).connect(gain);
    } else {
      src.connect(gain);
    }
    gain.connect(this.ctx.destination);
    const id = reuseId || this.nextId++;
    const p: Playing = { file, src, gain, panner, ended: false, allowStop };
    src.onended = () => { p.ended = true; if (this.sounds.get(id) === p) this.sounds.delete(id); };
    src.start();
    this.sounds.set(id, p);
    return id;
  }

  private stop(id: number, fadeMs: number): void {
    const s = this.sounds.get(id);
    if (!s || s.ended) return;
    const t = this.ctx.currentTime;
    s.gain.gain.setValueAtTime(s.gain.gain.value, t);
    s.gain.gain.linearRampToValueAtTime(0, t + fadeMs / 1000);
    s.src.stop(t + fadeMs / 1000);
    s.ended = true;
  }

  /** vw_StopAllSoundsIfAllowed */
  stopAllIfAllowed(): void {
    for (const [k, s] of this.sounds) if (s.allowStop) this.stop(k, 0);
  }

  private async buffer(file: string): Promise<AudioBuffer | null> {
    if (!this.musicBuffers.has(file)) this.musicBuffers.set(file, await this.loadMusic(file));
    return this.musicBuffers.get(file) ?? null;
  }

  private playMusic(theme: number, fadeIn: number, fadeOut: number): void {
    const m = MUSIC[theme];
    if (!m) return;
    this.theme = theme;
    const t = this.ctx.currentTime;
    for (const x of this.music) {
      if (x.file === m[0] && !m[3] && !x.ended) continue;
      x.gain.gain.setValueAtTime(x.gain.gain.value, t);
      x.gain.gain.linearRampToValueAtTime(0, t + fadeOut / 1000);
      x.src?.stop(t + fadeOut / 1000);
      x.ended = true;
    }
    this.music = this.music.filter((x) => !x.ended);
    if (!GameConfig().MusicVolume || this.music.some((x) => x.file === m[0])) return;
    const vol = m[2] * (GameConfig().MusicVolume / 10);
    const gain = this.ctx.createGain();
    gain.gain.value = 0;
    gain.connect(this.ctx.destination);
    const entry: Music = { file: m[0], src: null, gain, ended: false };
    this.music.push(entry);
    void (async () => {
      const intro = await this.buffer(m[0]);
      const loop = m[1] ? await this.buffer(m[1]) : null;
      if (!intro || entry.ended || this.ctx.state === 'closed') return;
      const start = (buf: AudioBuffer, looping: boolean): void => {
        const src = this.ctx.createBufferSource();
        src.buffer = buf;
        src.loop = looping;
        src.connect(gain);
        src.onended = () => {
          if (entry.ended) return;
          if (loop && buf === intro) start(loop, true);
        };
        entry.src = src;
        src.start();
      };
      start(intro, !m[1]);
      const now = this.ctx.currentTime;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(vol, now + fadeIn / 1000);
    })();
  }

  /** the music and sound volumes changed in the options */
  setMusicVolume(): void {
    const m = MUSIC[this.theme];
    if (!m) return;
    for (const x of this.music) if (!x.ended) x.gain.gain.value = m[2] * (GameConfig().MusicVolume / 10);
    if (GameConfig().MusicVolume && !this.music.length) this.playMusic(this.theme, 0, 0);
  }
}
