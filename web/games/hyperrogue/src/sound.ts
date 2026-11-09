// sound.cpp of HyperRogue 13.1o: sound effects and music (stage 3). The music of each land comes from
// hyperrogue-music.txt (read as the original reads it: `[##] */file`, `[##] LAST`, `[##] L=length`, comments, and
// the license text it shows in the help); handlemusic fades between the lands' tracks with the original's timing
// (2 s for a new track, 0.5 s back to one already started, 3 s on resetmusic) and remembers where each track
// was; playSound plays sounds/<name>.ogg at effvolume * vol / 100. The SDL_mixer calls run on Web Audio
// (src/sdlmixer.ts, on the website's AudioContext); index.ts gives the files (sound_attach).
// (C) Zeno Rogue, GPL-2.0-or-later; TypeScript port.
import { G } from './globals.ts';
import { hookset, callhandlers, callhooks, addHook, among } from './hyper.ts';
import type { Ref } from './cpp.ts';
import type { cell } from './locations.ts';
import { changes } from './pcmove.ts';
import {
  type eLand, landtypes, laNone, laHaunted, laWarpSea, laWarpCoast, laMercuryRiver, laTerracotta, laDungeon,
  moEagle, moWindCrow, moAcidBird, moEarthElemental, moAirElemental, moPhaser, moFrog, moVaulter, moWaterElemental,
  moFireElemental, moDragonHead, moWorm, moSkeleton, moHexSnake, moWolf, moRedFox, moNecromancer, moGhost,
  moRoseBeauty, moVizier, moFireFairy, moCultist, moPyroCultist, moCultistLeader,
} from './content.ts';
import { isHaunted, isTroll } from './flags.ts';
import { in_line_of_sight } from './environment.ts';
import { princessgender } from './config.ts';
import { get_superland } from './landlock.ts';
import { memory_issues, memory_for_lib } from './savemem.ts';
import { SDL_GetTicks } from './util.ts';
import { dnameof_l } from './language.ts';
import { arg_argis, arg_shift, arg_args, arg_argcs, arg_argi, PHASE, PHASEFROM } from './commandline.ts';
import {
  type Mix_Music, type Mix_Chunk, type MixAudioContext, type MixLoader,
  Mix_OpenAudio, Mix_CloseAudio, Mix_AllocateChannels, Mix_GetError, Mix_LoadMUS, Mix_MusicReady, Mix_FreeMusic,
  Mix_PlayingMusic, Mix_VolumeMusic, Mix_FadeOutMusic, Mix_FadeInMusicPos, Mix_LoadWAV, Mix_VolumeChunk,
  Mix_PlayChannel, Mix_GetChunk, Mix_FreeChunk,
} from './sdlmixer.ts';

/** RogueViz may be used for situations where music does not correspond to lands, so we allow extra IDs */
export const MUSIC_MAX = 500;

/** the files of the browser build: the text files the original reads (hyperrogue-music.txt) and the URLs of
 *  the music and sound files, by their path in the original's directory ("music/hr3-caves.ogg"); and the
 *  website's AudioContext with the loader of the files (index.ts sound_attach; the tests pass fakes) */
export const soundfiles = {
  texts: new Map<string, string>(),
  urls: new Map<string, string>(),
  ctx: null as MixAudioContext | null,
  loader: null as MixLoader | null,
};

/** index.ts: the files and the AudioContext (before hyper_main_init, whose initgraph calls initAudio) */
export function sound_attach(ctx: MixAudioContext | null, loader: MixLoader | null, texts: Map<string, string>, urls: Map<string, string>): void {
  soundfiles.ctx = ctx;
  soundfiles.loader = loader;
  soundfiles.texts = texts;
  soundfiles.urls = urls;
}

/** find_file(path) for the sound files: the path if the build has the file, "" otherwise */
function find_file(path: string): string {
  return soundfiles.texts.has(path) || soundfiles.urls.has(path) ? path : '';
}

/** fopen + fgets: the lines of a text file as fgets(buf, 800, f) reads them (with their newlines), or null */
function read_lines(path: string): string[] | null {
  const text = soundfiles.texts.get(path);
  if (text === undefined) return null;
  const lines: string[] = [];
  let i = 0;
  while (i < text.length) {
    let j = i;
    while (j < text.length && j - i < 799) { j++; if (text[j - 1] === '\n') break; }
    lines.push(text.slice(i, j));
    i = j;
  }
  return lines;
}

/** the sound.cpp globals (EX; musicvolume, effvolume, music_out_of_focus and music_reset are G.*) */
export const S = {
  musicfile: '', // EX const char *musicfile = "" (-m)
  audio: false, // EX bool audio
  musiclicense: '', // EX string musiclicense
  musfname: new Array<string>(MUSIC_MAX).fill(''), // EX string musfname[MUSIC_MAX]
  music_available: false, // EX bool music_available
  musiclength: new Array<number>(MUSIC_MAX).fill(0), // EX int musiclength[MUSIC_MAX]
  // CAP_SDLAUDIO
  loaded: new Array<boolean>(MUSIC_MAX).fill(false), // bool loaded[MUSIC_MAX]
  music: new Array<Mix_Music | null>(MUSIC_MAX).fill(null), // Mix_Music* music[MUSIC_MAX]
  musicpos: new Array<number>(MUSIC_MAX).fill(0), // EX int musicpos[MUSIC_MAX]
  musstart: 0, // EX int musstart
  musfadeval: 2000, // int musfadeval = 2000
  cid: laNone as eLand, // eLand cid = laNone
  chunks: new Map<string, Mix_Chunk | null>(), // map<string, Mix_Chunk*> chunks
  wheresounds: 'sounds/', // EX string wheresounds = "sounds/"
};

/** enum class music_reset_t { always, subland, never } */
export const music_reset_t = { always: 0, subland: 1, never: 2 } as const;

/** EX eLand getCurrentLandForMusic() */
export function getCurrentLandForMusic(): eLand {
  // anims::center_music(): among(ma, maParabolic, maTranslation); the animation recorder is not ported (ma is
  // maNone), so it is false
  const center_music = false;
  const centerover = G.current_display?.precise_center ?? null;
  let id: eLand = (center_music && centerover) ? centerover.land : G.cwt.at.land;
  if (isHaunted(id)) id = laHaunted;
  if (id === laWarpSea) id = laWarpCoast;
  if (id === laMercuryRiver) id = laTerracotta;
  return id;
}

/** EX void playSeenSound(cell *c) */
export function playSeenSound(c: cell): void {
  if (!c.monst) return;
  let nearme = c.cpdist <= 7;
  for (let i = 0; i < c.type; i++) { const c2 = c.move(i); if (c2 && c2.cpdist <= 7) nearme = true; } // forCellEx(c2, c)
  if (!nearme) return;
  if (!in_line_of_sight(c)) return;
  if (among(c.monst, moEagle, moWindCrow, moAcidBird))
    playSound(c, 'seen-eagle');
  else if (c.monst === moEarthElemental)
    playSound(c, 'seen-earth');
  else if (c.monst === moAirElemental)
    playSound(c, 'seen-air');
  else if (c.monst === moPhaser)
    playSound(c, 'seen-frog1');
  else if (c.monst === moFrog)
    playSound(c, 'seen-frog2');
  else if (c.monst === moVaulter)
    playSound(c, 'seen-frog3');
  else if (c.monst === moWaterElemental)
    playSound(c, 'seen-water');
  else if (c.monst === moFireElemental)
    playSound(c, 'fire');
  else if (c.monst === moDragonHead)
    playSound(c, 'seen-dragon');
  else if (c.monst === moWorm)
    playSound(c, 'seen-sandworm');
  else if (c.monst === moSkeleton && c.land !== laDungeon)
    playSound(c, 'seen-skeleton');
  else if (c.monst === moHexSnake)
    playSound(c, 'seen-snake');
  else if (c.monst === moWolf || c.monst === moRedFox)
    playSound(c, 'seen-woof');
  else if (isTroll(c.monst))
    playSound(c, 'seen-troll');
  else if (c.monst === moNecromancer)
    playSound(c, 'seen-necromancer');
  else if (c.monst === moGhost)
    playSound(c, 'seen-ghost');
  else if (c.monst === moRoseBeauty)
    playSound(c, princessgender() ? 'seen-rosebeauty' : 'seen-gardener');
  else if (c.monst === moVizier)
    playSound(c, 'seen-vizier');
  else if (c.monst === moFireFairy)
    playSound(c, 'seen-fairy');
  else if (c.monst === moCultist)
    playSound(c, 'seen-cultist');
  else if (c.monst === moPyroCultist)
    playSound(c, 'seen-cultistfire');
  else if (c.monst === moCultistLeader)
    playSound(c, 'seen-cultistleader');
}

// --- CAP_SDLAUDIO ---

export const hooks_music = new hookset<(id: Ref<eLand>) => boolean>(); // EX hookset<bool(eLand&)> hooks_music
export const hooks_sync_music = new hookset<(id: Ref<eLand>) => void>(); // EX hookset<void(eLand&)> hooks_sync_music

// EX bool music_out_of_focus = false: G.music_out_of_focus
// EX debugflag debug_music = {"music"}, debug_music_error = {"music_error"}: the debug log is left out

/** EX void handlemusic() */
export function handlemusic(): void {
  // indenter_finish hm(debug_music, "handlemusic");
  if (S.audio && G.musicvolume) {
    const ref: Ref<eLand> = { v: getCurrentLandForMusic() };
    if (callhandlers(false, hooks_music, ref)) return;
    let id = ref.v;
    if (G.outoffocus && !G.music_out_of_focus) id = 0 as eLand;
    if (S.musfname[id] === 'LAST') id = S.cid;
    if (!S.loaded[id] && !memory_issues()) {
      S.loaded[id] = true;
      // reuse music
      if (S.musfname[id] !== '') {
        for (let i = 0; i < landtypes; i++)
          if (S.music[i] && S.musfname[i] === S.musfname[id])
            S.music[id] = S.music[i];
      }
      if (!S.music[id]) {
        memory_for_lib();
        S.music[id] = Mix_LoadMUS(soundfiles.urls.get(S.musfname[id]) ?? null);
        // if(!music[id] && debug_music_error) printf("Mix_LoadMUS: %s\n", Mix_GetError());
      }
    }
    if (id !== S.cid && S.musfname[id] === S.musfname[S.cid]) {
      if (G.music_reset === music_reset_t.never) id = S.cid;
      if (G.music_reset === music_reset_t.subland && get_superland(id) === get_superland(S.cid))
        id = S.cid;
    }
    if (S.cid !== id && !S.musfadeval) {
      S.musicpos[S.cid] = SDL_GetTicks() - S.musstart;
      S.musfadeval = S.musicpos[id] ? 500 : 2000;
      Mix_FadeOutMusic(S.musfadeval);
    }
    // music[id]: the browser loads it in the background; it plays once it can (Mix_MusicReady)
    if (S.music[id] && Mix_MusicReady(S.music[id]) && !Mix_PlayingMusic()) {
      const r: Ref<eLand> = { v: id };
      callhooks(hooks_sync_music, r);
      id = r.v;
      S.cid = id;
      Mix_VolumeMusic(G.musicvolume);
      Mix_FadeInMusicPos(S.music[id], -1, S.musfadeval, S.musicpos[id] / 1000.0);
      S.musstart = SDL_GetTicks() - S.musicpos[id];
      S.musicpos[id] = 0;
      S.musfadeval = 0;
    }
  }
}

export const hooks_resetmusic = new hookset<(id: Ref<eLand>) => boolean>(); // hookset<bool(eLand&)> hooks_resetmusic

/** EX void resetmusic() */
export function resetmusic(): void {
  if (S.audio && G.musicvolume) {
    Mix_FadeOutMusic(3000);
    S.cid = laNone;
    for (let i = 0; i < landtypes; i++) S.musicpos[i] = 0;
    S.musfadeval = 2000;
  }
}

/** constexpr eLand mfcode(const char* buf) */
export function mfcode(buf: string): eLand { return ((buf.charCodeAt(0) - 48) * 10 + buf.charCodeAt(1) - 48) as eLand; }

/** atoi */
function atoi(s: string): number {
  const m = /^[ \t\n\v\f\r]*([+-]?\d+)/.exec(s);
  return m ? parseInt(m[1], 10) | 0 : 0;
}

/** EX bool loadMusicInfo(string dir) */
export function loadMusicInfo_file(dir: string): boolean {
  // indenter_finish hm(debug_init_music, "loadMusicInfo");
  if (dir === '') return false;
  const f = read_lines(dir);
  if (f) {
    let dir2 = '';
    for (let i = 0; i < dir.length; i++) if (dir[i] === '/' || dir[i] === '\\')
      dir2 = dir.substring(0, i + 1);
    for (let line of f) {
      // for(int i=0; buf[i]; i++) if(buf[i] == 10 || buf[i] == 13) buf[i] = 0;
      const cut = line.search(/[\n\r\0]/);
      if (cut >= 0) line = line.slice(0, cut);
      const buf = (i: number): string => i < line.length ? line[i] : '\0';
      if (buf(0) === '[' && buf(3) === ']') {
        const id = (line.charCodeAt(1) - 48) * 10 + line.charCodeAt(2) - 48;
        if (id >= 0 && id < MUSIC_MAX) {
          if (buf(5) === 'L' && buf(6) === '=') S.musiclength[id] = atoi(line.slice(7));
          else if (buf(5) === '*' && buf(6) === '/') S.musfname[id] = dir2 + line.slice(7);
          else S.musfname[id] = line.slice(5);
          S.music_available = true;
        }
        // else if(debug_music_error): the warning about the format of the ids (the debug log is left out)
      }
      else if (buf(0) === '#') {
      }
      else {
        S.musiclicense += line;
        S.musiclicense += '\n';
      }
    }
    return true;
  }
  return false;
}

/** EX bool loadMusicInfo() */
export function loadMusicInfo(): boolean {
  return (
    (S.musicfile !== '' && loadMusicInfo_file(find_file(S.musicfile)))
    || loadMusicInfo_file(find_file('hyperrogue-music.txt'))
    || loadMusicInfo_file(find_file('music/hyperrogue-music.txt'))
  );
  // FHS: $HOME/.hyperrogue-music.txt (no home directory in the browser)
}

/** EX void initAudio() */
export function initAudio(): void {
  S.audio = loadMusicInfo();

  if (S.audio) {
    // Mix_OpenAudio(MIX_DEFAULT_FREQUENCY, MIX_DEFAULT_FORMAT, 2, 2048): the website's AudioContext
    if (Mix_OpenAudio(soundfiles.ctx, soundfiles.loader) !== 0) {
      console.warn('Unable to initialize audio: ' + Mix_GetError());
      S.audio = false;
    }
    else {
      S.audio = true;
      Mix_AllocateChannels(16);
    }
  }
}

/** index.ts, when the game stops: the music and the sounds stop (the website closes the AudioContext) */
export function sound_shutdown(): void {
  Mix_CloseAudio();
  for (let i = 0; i < MUSIC_MAX; i++) { S.music[i] = null; S.loaded[i] = false; S.musicpos[i] = 0; }
  S.chunks.clear();
  S.cid = laNone;
  S.musfadeval = 2000;
  S.audio = false;
}

export const hooks_sound = new hookset<(s: string, vol: number) => boolean>(); // hookset<bool(const string& s, int vol)> hooks_sound

/** stage 1's hook, kept: it sees every sound the rules play (after the LATE), e.g. for tests */
export const soundhooks = {
  play: null as ((c: cell | null, name: string, vol: number) => void) | null,
};

/** EX void playSound(cell *c, const string& fname, int vol = 100) */
export function playSound(c: cell | null, fname: string, vol = 100): void {
  if (changes.on) { changes.at_commit(() => playSound(c, fname, vol)); return; } // LATE( hr::playSound(c, fname, vol); )
  if (soundhooks.play) soundhooks.play(c, fname, vol);
  if (G.effvolume === 0) return;
  if (callhandlers(false, hooks_sound, fname, vol)) return;
  if (!S.chunks.has(fname)) {
    const s = find_file(S.wheresounds + fname + '.ogg');
    if (memory_issues()) return;
    memory_for_lib();
    S.chunks.set(fname, Mix_LoadWAV(soundfiles.urls.get(s) ?? null));
  }
  const chunk = S.chunks.get(fname) ?? null;
  if (chunk) {
    Mix_VolumeChunk(chunk, Math.trunc(G.effvolume * vol / 100));
    Mix_PlayChannel(-1, chunk, 0);
  }
}

/** EX void reuse_music_memory() */
export function reuse_music_memory(): void {
  for (let i = 0; i < landtypes; i++)
    if (S.music[i] && S.music[i] !== S.music[S.cid]) {
      const which = S.music[i];
      console.log('freeing music for ', dnameof_l(i as eLand));
      Mix_FreeMusic(which);
      for (let j = 0; j < landtypes; j++) if (S.music[j] === which) {
        console.log('... which equals ', dnameof_l(j as eLand));
        S.music[j] = null;
      }
    }
  const currently_played = new Set<Mix_Chunk | null>();
  for (let ch = 0; ch < 16; ch++) currently_played.add(Mix_GetChunk(ch));
  const to_free = new Set<string>();
  for (const [name, chunk] of S.chunks)
    if (chunk) {
      if (currently_played.has(chunk)) {
        console.log(name, ': currently played');
      }
      else {
        Mix_FreeChunk(chunk);
        to_free.add(name);
        console.log(name, ': freed');
      }
    }
  for (const s of to_free) S.chunks.delete(s);
}

/** int read_sound_args() (CAP_COMMANDLINE) */
export function read_sound_args(): number {
  if (arg_argis('-m')) { if (PHASE(1)) return 2; arg_shift(); S.musicfile = arg_argcs(); }
  // CAP_SDLAUDIO
  else if (arg_argis('-se')) { if (PHASE(1)) return 2; arg_shift(); S.wheresounds = arg_args(); }
  else if (arg_argis('-musicfocus')) { G.music_out_of_focus = true; }
  else if (arg_argis('-svol')) { if (PHASEFROM(2)) return 2; arg_shift(); G.effvolume = arg_argi(); }
  else if (arg_argis('-mvol')) { if (PHASEFROM(2)) return 2; arg_shift(); G.musicvolume = arg_argi(); }
  else return 1;
  return 0;
}

/** the static initializer: auto ah_sound = addHook(hooks_args, 0, read_sound_args) + addHook(hooks_clear_cache, 0,
 *  reuse_music_memory) */
export function register_sound(): void {
  addHook(G.hooks_args, 0, read_sound_args);
  addHook(G.hooks_clear_cache, 0, reuse_music_memory);
}
