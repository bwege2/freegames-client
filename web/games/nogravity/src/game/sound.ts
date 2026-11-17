// No Gravity port (GPL-3.0-or-later; translated in 2026 by the freegames project from realtech VR's
// No Gravity 2.0, GPL-2.0-or-later; LICENSE.md): the game's sound (src/lt_sound.c) on the SDL_mixer
// driver of the Linux build (sys/audio.ts): the sound list voix\soundfx.lst, the music list
// voix\track.lst, positional sounds by panning and distance (V3XSND_GetPosition, cue distance 4096).
import { Mixer, type Sample } from '../sys/audio.ts';
import { fgetsLines } from '../sys/ini.ts';
import { fileText, sysRand } from '../sys/sys.ts';
import * as m from '../v3x/math.ts';
import { V3X } from '../v3x/scene.ts';
import { G, g_SGSettings, g_SGGame, Ms_INTRO } from './state.ts';

interface SoundInfo { name: string; randomPitch: number; defaultVol: number; priority: number; samplingRate: number }
const soundList: SoundInfo[] = [];
const musicInfo: { filename: string; track: number; mode: number }[] = [];
let fxTable: Sample[] = [];

export const audio = {
  mixer: new Mixer(null),
  /** loads a sample (WAV) or a music track (OGG) of the data */
  decode: async (_path: string): Promise<AudioBuffer | null> => null,
  enabled: false,
};

/** NG_AudioLoadList */
export function NG_AudioLoadList(): void {
  const t = fgetsLines(fileText('voix/track.lst'), 80);
  let i = -1;
  for (let l = 1; l < t.length; l++) {
    const tex = t[l];
    i++;
    const v = tex.indexOf('=');
    if (v >= 0) {
      const parts = tex.slice(v + 2).trim().split(/\s+/);
      musicInfo[i] = { filename: parts[0].slice(0, 16), track: parseInt(parts[1], 10) || 0, mode: parseInt(parts[2], 10) || 0 };
    }
    if (tex.includes('*')) break;
  }
  soundList.length = 0;
  for (const tmp of fgetsLines(fileText('voix/soundfx.lst'), 128)) {
    const p = tmp.trim().split(/\s+/);
    const name = p[0] ?? '';
    if (name.includes('*')) break;
    soundList.push({ name, randomPitch: parseInt(p[1], 10) || 0, defaultVol: parseInt(p[2], 10) || 0, priority: parseInt(p[3], 10) || 0, samplingRate: 0 });
  }
}
/** NG_AudioGetByName: 1-based index (0: not found), the extension is ignored */
export function NG_AudioGetByName(s: string): number {
  const n = s.split('.')[0].toLowerCase();
  const i = soundList.findIndex((x) => x.name.toLowerCase() === n);
  return i + 1;
}
/** NG_AudioLoadWave: voix\<name>.WAV for every sound */
export async function NG_AudioLoadWave(): Promise<void> {
  fxTable = await Promise.all(soundList.map(async (sinfo, id) => ({ buffer: await audio.decode(`voix/${sinfo.name}.wav`), loopend: 0, sampleID: id })));
}

/** NG_AllocSoundChannel */
function allocChannel(index: number): number {
  if (index < 0 || index >= fxTable.length) return -1;
  const info = soundList[index];
  const pitch = info.randomPitch + 1;
  info.samplingRate = info.samplingRate + sysRand(pitch) - (pitch >> 1); // computed and unused, as in the original
  const ch = audio.mixer.channelGetFree();
  if (ch === -1) return -1;
  G.g_ubSampleUsed[ch] = index;
  return ch;
}
export function NG_AudioPlaySound(index: number, pan: number): number {
  if (!audio.enabled) return 0;
  const ch = allocChannel(index);
  if (ch >= 0) audio.mixer.channelPlay(ch, g_SGSettings.VolFX / 100, pan, fxTable[index]);
  return ch;
}
export function NG_AudioStopSound(ch: number): void {
  if (!audio.enabled) return;
  audio.mixer.channelStop(ch);
  if (ch >= 0 && ch < 32) G.g_ubSampleUsed[ch] = 0;
}
/** NG_AudioKickSound: plays index looping on a free channel (its loopend is set) */
export function NG_AudioKickSound(_ch: number, index: number, pan: number): void {
  if (!audio.enabled) return;
  const ch = allocChannel(index);
  if (ch >= 0) {
    fxTable[index].loopend = 1;
    audio.mixer.channelPlay(ch, g_SGSettings.VolFX / 100, pan, fxTable[index]);
  }
}
function getPosition(v: Float32Array, cue: number): { pan: number; volume: number } {
  const VV = m.vec();
  m.dif(VV, v, m.Pos(V3X.Camera.M));
  const n = m.normalize(VV, VV);
  return { pan: m.dot(VV, m.I(V3X.Camera.M)), volume: n < cue ? 1 : cue / n };
}
export function NG_Audio3DUpdate(pos: Float32Array, _speed: Float32Array | null, ch: number, index: number): number {
  if (!audio.enabled || ch < 0) return 0;
  if (G.g_ubSampleUsed[ch] !== index) return 0;
  if (!audio.mixer.channelGetStatus(ch)) { NG_AudioStopSound(ch); return 0; }
  const { pan, volume } = getPosition(pos, 4096);
  const Vol = (volume * g_SGSettings.VolFX) / 100;
  audio.mixer.channelSetVolume(ch, Vol);
  audio.mixer.channelSetPanning(ch, pan);
  return Vol > 8 / 100 ? 1 : 0;
}
export function NG_Audio3DPlay(index: number, pos: Float32Array, _speed: Float32Array | null): number {
  if (!audio.enabled) return 0;
  const ch = allocChannel(index);
  if (ch < 0) return -1;
  const { pan, volume } = getPosition(pos, 4096);
  audio.mixer.channelPlay(ch, (volume * g_SGSettings.VolFX) / 100, pan, fxTable[index]);
  return ch;
}
/** NG_AudioSetFreq: SDL_mixer cannot change the rate (ChannelSetSamplingRate is empty) */
export function NG_AudioSetFreq(_ch: number, _f: number): void { /* as the Linux build: nothing */ }
export function NG_AudioSay(_name: string): void { /* empty in the original: release 2.0 has no voices */ }
export function NG_AudioBeep(code: number): void {
  const names = ['bridge1', 'bridge2', 'door', 'message', 'incoming', 'select'];
  if (code >= 0 && code < names.length) NG_AudioPlaySound(NG_AudioGetByName(names[code]) - 1, 0);
}

// ---------------------------------------------------------------- music
let musicToken = 0;
export function NG_AudioSetMusicVolume(): void {
  audio.mixer.setMusicVolume(g_SGSettings.VolMusic / 100);
  audio.mixer.setVolume(g_SGSettings.VolDIG / 100);
}
async function playStream(path: string, loop: boolean): Promise<void> {
  const token = ++musicToken;
  const buf = await audio.decode(path);
  if (token !== musicToken) return;
  audio.mixer.playMusic(buf, loop);
  NG_AudioSetMusicVolume();
}
/** NG_AudioPlayTrack: MUSIC\<file>, looping except the intro */
export function NG_AudioPlayTrack(i: number): void {
  if (!audio.enabled || !musicInfo[i]) return;
  void playStream(`music/${musicInfo[i].filename}`, i !== Ms_INTRO);
}
export function NG_AudioPlayMusic(world: { Track: number }): void {
  let track = G.g_pCurrentGame.episode === 7 ? 7 : world.Track + 7;
  if (track < 7) track = 7;
  if (track > 17) track = 7;
  NG_AudioPlayTrack(track);
}
/** NG_AudioStopMusic: the original fades the stream out over VolMusic steps, blocking */
export function NG_AudioStopMusic(): void {
  if (!audio.enabled) return;
  musicToken++;
  audio.mixer.stopMusic();
  audio.mixer.flushAll();
}
export const NG_AudioStopTrack = NG_AudioStopMusic;
export function NG_AudioPauseMusic(): void { if (audio.enabled) for (let i = 0; i < audio.mixer.count; i++) audio.mixer.channelStop(i); }
export function NG_AudioResumeMusic(): void {
  if (!audio.enabled) return;
  for (let i = 0; i < audio.mixer.count; i++) audio.mixer.channelSetVolume(i, g_SGSettings.VolFX / 100);
  G.g_ubSampleUsed.fill(0);
}
export function channelGetFree(): number { return audio.mixer.channelGetFree(); }
export function flushAll(): void { audio.mixer.flushAll(); }
/** NG_AudioPlayWarp's stream */
export function playWarpMusic(): void { if (audio.enabled) void playStream('music/warp03.ogg', false); }
export function stopWarpMusic(): void { musicToken++; audio.mixer.stopMusic(); }
export { g_SGGame };
