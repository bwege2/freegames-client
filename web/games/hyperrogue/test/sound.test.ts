// Stage 3: sound.cpp headless, with a fake AudioContext and fake <audio> elements (src/sdlmixer.ts is SDL_mixer
// on Web Audio): hyperrogue-music.txt read as the original reads it (the ids, `*/`, LAST, L=, comments, the
// license text), the land -> track mapping, handlemusic's fades and positions with the original's timing (2 s for
// a new track, 0.5 s back to a track already started, 3 s on resetmusic), the out-of-focus silence, music_reset,
// and playSound's volume rule (effvolume * vol / 100 of 128, linear) and its 16 channels.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { G } from '../src/globals.ts';
import { ticks_source } from '../src/util.ts';
import { apply_memory_reserve } from '../src/savemem.ts';
import {
  S, soundfiles, sound_attach, sound_shutdown, initAudio, loadMusicInfo_file, getCurrentLandForMusic, handlemusic,
  resetmusic, playSound, music_reset_t, MUSIC_MAX,
} from '../src/sound.ts';
import {
  type MixAudioContext, type MixLoader, type MixMediaElement, mix_music_gain, Mix_PlayingMusic, Mix_GetChunk,
} from '../src/sdlmixer.ts';
import {
  landtypes, laNone, laCrossroads, laCrossroads2, laDesert, laIce, laCocytus, laCamelot, laHunting, laMemory, laHaunted,
  laHauntedWall, laHauntedBorder, laWarpSea, laWarpCoast, laMercuryRiver, laTerracotta, laOceanWall, laMirror,
} from '../src/content.ts';
import type { cell } from '../src/locations.ts';

const assets = new URL('../assets/', import.meta.url);
const musictxt = readFileSync(new URL('hyperrogue-music.txt', assets), 'latin1');

// --- the fakes ---
let now = 0; // ms: SDL_GetTicks and the AudioContext's clock
ticks_source.get = () => now;

class FakeParam {
  value = 1;
  setValueAtTime(v: number): void { this.value = v; }
  linearRampToValueAtTime(): void { }
  cancelScheduledValues(): void { }
}
class FakeNode { connect(): void { } disconnect(): void { } }
class FakeGain extends FakeNode { gain = new FakeParam(); }
const started: FakeSource[] = [];
class FakeSource extends FakeNode {
  buffer: unknown = null;
  onended: (() => void) | null = null;
  start(): void { started.push(this); }
  stop(): void { this.onended?.(); }
}
const elements: FakeElement[] = [];
class FakeElement implements MixMediaElement {
  src = '';
  loop = false;
  preload = '';
  currentTime = 0;
  duration = 180; // s
  playing = false;
  private listeners = new Map<string, (() => void)[]>();
  play(): Promise<void> { this.playing = true; return Promise.resolve(); }
  pause(): void { this.playing = false; }
  load(): void { }
  removeAttribute(): void { this.src = ''; }
  addEventListener(type: string, f: () => void): void {
    const l = this.listeners.get(type) ?? [];
    l.push(f);
    this.listeners.set(type, l);
  }
  fire(type: string): void { for (const f of this.listeners.get(type) ?? []) f(); this.listeners.delete(type); }
}
const fakectx: MixAudioContext = {
  get currentTime() { return now / 1000; },
  destination: new FakeNode(),
  createGain: () => new FakeGain(),
  createBufferSource: () => new FakeSource(),
  createMediaElementSource: () => new FakeNode(),
  decodeAudioData: () => Promise.resolve({ decoded: true }),
};
const fetched: string[] = [];
const loader: MixLoader = {
  media: (url) => { const e = new FakeElement(); e.src = url; elements.push(e); return e; },
  fetch: (url) => { fetched.push(url); return Promise.resolve(new ArrayBuffer(8)); },
};

/** the build's files as index.ts gives them: the original's paths -> URLs */
function urls(): Map<string, string> {
  const m = new Map<string, string>();
  for (const f of readdirSync(new URL('music/', assets))) m.set('music/' + f, 'url:music/' + f);
  for (const f of readdirSync(new URL('sounds/', assets))) if (f.endsWith('.ogg')) m.set('sounds/' + f, 'url:sounds/' + f);
  return m;
}

function reset_sound(text = musictxt): void {
  sound_shutdown();
  S.musiclicense = '';
  S.musfname.fill('');
  S.musiclength.fill(0);
  S.music_available = false;
  elements.length = 0;
  sound_attach(fakectx, loader, new Map([['hyperrogue-music.txt', text]]), urls());
  initAudio();
  apply_memory_reserve(); // the main loop's memory reserve (memory_issues() is false with it)
  G.musicvolume = 60;
  G.effvolume = 60;
  G.outoffocus = false;
  G.music_out_of_focus = false;
  G.music_reset = music_reset_t.always;
}

/** the player stands in land l */
function at(l: number): void { G.cwt.at = { land: l } as unknown as cell; }

/** the element of a music file */
const el = (file: string): FakeElement => {
  const e = elements.find((x) => x.src === 'url:music/' + file);
  assert.ok(e, file);
  return e;
};

const near = (a: number, b: number): void => { assert.ok(Math.abs(a - b) < 1e-9, `${a} != ${b}`); };

test('hyperrogue-music.txt: ids, */ paths, comments, the license text', () => {
  reset_sound();
  assert.equal(S.audio, true);
  assert.equal(S.music_available, true);
  assert.equal(S.musfname[laCrossroads], 'music/hr3-crossroads.ogg');
  assert.equal(S.musfname[laCamelot], 'music/hr-savino-palace.ogg');
  assert.equal(S.musfname[laHunting], 'music/hr-domina-hunting.ogg');
  assert.equal(S.musfname[laCocytus], 'music/hr3-icyland.ogg');
  assert.equal(S.musfname[29], 'music/hr-savino-ocean.ogg'); // "# Living Fjord [39]" is a comment; [29] counts
  assert.equal(S.musfname[laNone], ''); // used when the window is out of focus: no music
  assert.equal(S.musfname[laOceanWall], ''); // [37] (useless) is only a comment
  assert.equal(S.musfname[laMemory], ''); // Lost Memory needs no music
  assert.equal(S.musfname[94], 'music/hr3-crossroads.ogg');
  // every track named is shipped
  const files = urls();
  for (let i = 0; i < MUSIC_MAX; i++) if (S.musfname[i]) assert.ok(files.has(S.musfname[i]), S.musfname[i]);
  // the lines that are neither [##] nor # comments: two empty lines and the license
  assert.equal(S.musiclicense,
    '\n\nHyperRogue soundtrack under the Creative Commons BY-SA 3.0 license, http://creativecommons.org/licenses/by-sa/3.0/\n' +
    'Crossroads, Graveyard, Land of Eternal Motion, Hall of Mirrors, Hell, R\'Lyeh, Living Caves, Jungle, Desert, Icy Lands by Shawn Parrotte (http://www.shawnparrotte.com)\n' +
    'Caribbean, Ivory Tower, Ocean, Palace by Will Savino (http://www.willsavino.net/)\n' +
    'Hunting Grounds and Lost Mountain by Lincoln Domina\n');
});

test('loadMusicInfo: LAST, L=, plain names, the directory of the file, CR LF, bad ids', () => {
  reset_sound();
  S.musiclicense = '';
  soundfiles.texts.set('music/hyperrogue-music.txt',
    '[02] */a.ogg\r\n[03] LAST\r\n[04] L=12345\n[05] plain/b.ogg\n[x1] bad\n[] short\n#comment\nlicense line');
  assert.equal(loadMusicInfo_file('music/hyperrogue-music.txt'), true);
  assert.equal(S.musfname[2], 'music/a.ogg'); // */ is the directory of the list
  assert.equal(S.musfname[3], 'LAST');
  assert.equal(S.musiclength[4], 12345);
  assert.equal(S.musfname[5], 'plain/b.ogg');
  assert.equal(S.musiclicense, '[] short\nlicense line\n');
  assert.equal(loadMusicInfo_file('nothing.txt'), false);
  assert.equal(loadMusicInfo_file(''), false);
});

test('getCurrentLandForMusic: haunted lands, Warped Sea and Mercury River share a track', () => {
  for (const [l, m] of [[laHauntedWall, laHaunted], [laHauntedBorder, laHaunted], [laWarpSea, laWarpCoast],
    [laMercuryRiver, laTerracotta], [laIce, laIce], [laCrossroads, laCrossroads]]) {
    at(l);
    assert.equal(getCurrentLandForMusic(), m);
  }
  assert.ok(landtypes < MUSIC_MAX);
});

test('handlemusic: fade in over 2 s, fade out over 2 s, back to a started track over 0.5 s at its position', async () => {
  reset_sound();
  now = 1000;
  at(laCrossroads);
  handlemusic(); // loads the track; nothing plays before the browser can play it
  assert.equal(Mix_PlayingMusic(), 0);
  const cr = el('hr3-crossroads.ogg');
  cr.fire('canplay');
  handlemusic();
  assert.equal(Mix_PlayingMusic(), 1);
  assert.equal(cr.playing, true);
  assert.equal(cr.loop, true);
  assert.equal(S.cid, laCrossroads);
  near(mix_music_gain(), 0);
  now = 2000; near(mix_music_gain(), 60 / 128 * 0.5);
  now = 3000; near(mix_music_gain(), 60 / 128);
  now = 31000;
  near(mix_music_gain(), 60 / 128);

  // to the Desert: the Crossroads track fades out over 2 s (the Desert's has not started yet)
  at(laDesert);
  handlemusic();
  assert.equal(S.musicpos[laCrossroads], 30000);
  assert.equal(S.musfadeval, 2000);
  const de = el('hr3-desert.ogg');
  de.fire('canplay');
  now = 32000; handlemusic(); near(mix_music_gain(), 60 / 128 * 0.5); assert.equal(S.cid, laCrossroads);
  now = 33000; handlemusic(); // the fade-out is over: the Desert fades in over 2 s from its start
  assert.equal(S.cid, laDesert);
  assert.equal(cr.playing, false);
  assert.equal(de.playing, true);
  assert.equal(de.currentTime, 0);
  near(mix_music_gain(), 0);
  now = 34000; near(mix_music_gain(), 60 / 128 * 0.5);
  now = 43000; near(mix_music_gain(), 60 / 128);

  // back to the Crossroads: 0.5 s out, then 0.5 s in, from where it was (30 s)
  at(laCrossroads);
  handlemusic();
  assert.equal(S.musfadeval, 500);
  now = 43250; handlemusic(); near(mix_music_gain(), 60 / 128 * 0.5);
  now = 43500; handlemusic();
  assert.equal(S.cid, laCrossroads);
  assert.equal(cr.currentTime, 30);
  now = 43750; near(mix_music_gain(), 60 / 128 * 0.5);
  now = 44000; near(mix_music_gain(), 60 / 128);
  assert.equal(S.musicpos[laCrossroads], 0);
  assert.equal(S.musstart, 43500 - 30000);
  // lands with the same file share it (music[] reuse): Cocytus uses the Icy Lands' element
  at(laIce); handlemusic(); at(laCocytus); handlemusic();
  assert.equal(S.music[laIce], S.music[laCocytus]);
  // the volume setting applies at once (config's reaction calls Mix_VolumeMusic)
  sound_shutdown();
});

test('the music volume changes the music at once, 0 stops handlemusic', async () => {
  const { Mix_VolumeMusic } = await import('../src/sdlmixer.ts');
  reset_sound();
  now = 100000;
  at(laMirror);
  handlemusic();
  el('hr3-mirror.ogg').fire('canplay');
  handlemusic();
  now = 103000;
  near(mix_music_gain(), 60 / 128);
  G.musicvolume = 128; Mix_VolumeMusic(G.musicvolume);
  near(mix_music_gain(), 1);
  Mix_VolumeMusic(500); // more than MIX_MAX_VOLUME is 128
  near(mix_music_gain(), 1);
  G.musicvolume = 0; Mix_VolumeMusic(0);
  at(laDesert);
  handlemusic(); // does nothing with the volume at 0
  assert.equal(S.loaded[laDesert], false);
});

test('out of focus: the music fades out (land 0 has none) unless "play music when out of focus"', () => {
  reset_sound();
  now = 200000;
  at(laCrossroads);
  handlemusic();
  el('hr3-crossroads.ogg').fire('canplay');
  handlemusic();
  now = 210000;
  G.outoffocus = true;
  handlemusic();
  assert.equal(S.musicpos[laCrossroads], 10000);
  assert.equal(S.musfadeval, 2000); // musicpos[0] is 0
  now = 212000; handlemusic();
  assert.equal(Mix_PlayingMusic(), 0);
  now = 220000; handlemusic();
  assert.equal(Mix_PlayingMusic(), 0); // silent while out of focus
  G.outoffocus = false;
  handlemusic(); // back: from 10 s, fading in over 2 s (musfadeval is still 2000; cid is still the Crossroads)
  assert.equal(Mix_PlayingMusic(), 1);
  assert.equal(el('hr3-crossroads.ogg').currentTime, 10);

  reset_sound();
  G.music_out_of_focus = true;
  now = 300000;
  at(laCrossroads);
  handlemusic();
  el('hr3-crossroads.ogg').fire('canplay');
  handlemusic();
  G.outoffocus = true;
  now = 305000; handlemusic();
  assert.equal(S.musfadeval, 0);
  assert.equal(Mix_PlayingMusic(), 1);
});

test('LAST keeps the current track; music_reset never/subland keep a shared file playing', () => {
  reset_sound(musictxt.replace('[03] */music/hr3-desert.ogg', '[03] LAST'));
  now = 400000;
  at(laCrossroads);
  handlemusic();
  el('hr3-crossroads.ogg').fire('canplay');
  handlemusic();
  at(laDesert); // LAST: the Crossroads go on
  now = 401000; handlemusic();
  assert.equal(S.cid, laCrossroads);
  assert.equal(S.musfadeval, 0);

  // always: Crossroads -> Crossroads II (the same file) restarts it from 0 after a 2 s fade
  for (const [mode, keeps] of [[music_reset_t.always, false], [music_reset_t.never, true]] as const) {
    reset_sound();
    G.music_reset = mode;
    now = 500000;
    at(laCrossroads);
    handlemusic();
    el('hr3-crossroads.ogg').fire('canplay');
    handlemusic();
    at(laCrossroads2);
    now = 505000; handlemusic();
    assert.equal(S.musfadeval, keeps ? 0 : 2000, `music_reset ${mode}`);
    now = 507000; handlemusic();
    assert.equal(S.cid, keeps ? laCrossroads : laCrossroads2);
  }
});

test('resetmusic fades out over 3 s and forgets the positions', () => {
  reset_sound();
  now = 600000;
  at(laCrossroads);
  handlemusic();
  el('hr3-crossroads.ogg').fire('canplay');
  handlemusic();
  now = 610000;
  S.musicpos[laDesert] = 1234;
  resetmusic();
  assert.equal(S.cid, laNone);
  assert.equal(S.musicpos[laDesert], 0);
  assert.equal(S.musfadeval, 2000);
  now = 611500; near(mix_music_gain(), 60 / 128 * 0.5);
  now = 613000; assert.equal(Mix_PlayingMusic(), 0);
  handlemusic(); // starts the land's track again from 0, fading in over 2 s
  assert.equal(S.cid, laCrossroads);
  assert.equal(el('hr3-crossroads.ogg').currentTime, 0);
  near(mix_music_gain(), 0);
});

test('a position past the end of the track: no fade, it restarts from 0 (ov_time_seek fails)', () => {
  reset_sound();
  now = 700000;
  at(laCrossroads);
  handlemusic();
  const cr = el('hr3-crossroads.ogg');
  cr.fire('canplay');
  handlemusic();
  cr.duration = 100;
  at(laDesert);
  now = 900000; handlemusic(); // 200 s into the looping Crossroads
  el('hr3-desert.ogg').fire('canplay');
  now = 902000; handlemusic(); // the Desert starts
  now = 903000; // the Desert has faded in halfway: it fades out in 0.25 s (half of 0.5 s)
  at(laCrossroads);
  handlemusic();
  assert.equal(S.musfadeval, 500);
  now = 903200; handlemusic(); assert.equal(S.cid, laDesert);
  now = 903250; handlemusic(); // position 200 s >= 100 s: does not start
  assert.equal(Mix_PlayingMusic(), 0);
  assert.equal(S.cid, laCrossroads);
  handlemusic(); // next frame: from 0, at full volume
  assert.equal(Mix_PlayingMusic(), 1);
  assert.equal(cr.currentTime, 0);
  near(mix_music_gain(), 60 / 128);
});

test('playSound: sounds/<name>.ogg at effvolume * vol / 100, 16 channels', async () => {
  reset_sound();
  fetched.length = 0;
  started.length = 0;
  const c = null as unknown as cell;
  playSound(c, 'hit-axe1');
  assert.deepEqual(fetched, ['url:sounds/hit-axe1.ogg']);
  const chunk = S.chunks.get('hit-axe1')!;
  assert.equal(chunk.volume, 60);
  near(chunk.gain!.gain.value, 60 / 128);
  playSound(c, 'hit-axe1', 50);
  assert.equal(chunk.volume, 30); // the chunk's volume: every copy that plays follows it, as in SDL_mixer
  G.effvolume = 128;
  playSound(c, 'hit-axe1', 150);
  assert.equal(chunk.volume, 128); // more than MIX_MAX_VOLUME is 128
  G.effvolume = 33;
  playSound(c, 'hit-axe1', 50);
  assert.equal(chunk.volume, 16); // int arithmetic
  await new Promise((r) => setTimeout(r, 0)); // decoded: the four waiting copies start
  assert.equal(started.length, 4);
  for (let i = 0; i < 20; i++) playSound(c, 'hit-axe1');
  let busy = 0;
  for (let ch = 0; ch < 16; ch++) if (Mix_GetChunk(ch)) busy++;
  assert.equal(busy, 16);
  assert.equal(started.length, 16); // the others find no free channel
  started[0].stop(); // a channel is free again when its sound ends
  playSound(c, 'hit-axe1');
  assert.equal(started.length, 17);
  // a sound that is not shipped stays silent; effvolume 0 loads nothing
  playSound(c, 'no-such-sound');
  assert.equal(S.chunks.get('no-such-sound'), null);
  G.effvolume = 0;
  playSound(c, 'tada');
  assert.equal(S.chunks.has('tada'), false);
});

test('without an AudioContext the game stays silent', () => {
  sound_shutdown();
  sound_attach(null, null, new Map([['hyperrogue-music.txt', musictxt]]), urls());
  initAudio();
  assert.equal(S.audio, false);
  at(laCrossroads);
  handlemusic();
  resetmusic();
  G.effvolume = 60;
  playSound(null as unknown as cell, 'click');
  assert.equal(S.chunks.get('click'), null);
});
