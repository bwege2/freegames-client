// Frozen Bubble 2.2.0's main program (the Perl script `frozen-bubble`), line by line. Each Perl sub
// is a method of the same name (snake_case kept, so the original can be read alongside). Blocking
// calls (SDL_Delay, waiting for a key, the network) are awaited; Perl's die 'quit' / die 'new_game'
// are thrown Die objects; `local` variables of iter_players are saved and restored around the loop.
import { App, newSurface, Rect } from '../sdl/app.ts';
import { KEYDOWN, KEYUP, JOYBUTTONUP, QUIT, SDLK, type SDLEvent } from '../sdl/events.ts';
import { blitSurface, displayFormat, displayFormatInPlace, setAlpha, SRCALPHA, type Surface } from '../sdl/video.ts';
import type { Chunk, Music } from '../sdl/mixer.ts';
import { MIX_MAX_VOLUME } from '../sdl/mixer.ts';
import { CStuff } from './cstuff.ts';
import { PerlRand } from './rand.ts';
import { cos, sin } from './libm.ts';
import {
  ALL_PLAYERS, BUBBLE_SIZE0, BUBBLE_SPEED0, CANON_ROTATIONS_NB, FREE_FALL_CONSTANT0, LAUNCHER_SPEED,
  MALUS_BUBBLE_SPEED, PI, POS_1P, POS_2P, POS_MP, ROW_SIZE0, TARGET_ANIM_SPEED, TIMEOUT_PINGUIN_SLEEP,
  type Player, type PlayerPos, type PosTable,
} from './data.ts';
import { any, difference2, every, evenn, fastuniq, fixed, int, member, odd, oddn, pmod, pnum, pstr, sqr } from './perl.ts';
import { Bare, dump, parseAssignments, PBool, type PValue } from './dumper.ts';

/** Perl's truth of a value read from the rc file */
function truthy(v: PValue): boolean {
  if (v instanceof PBool) return v.v;
  return !!v && v !== '0';
}
import type { FBLE } from './fble.ts';

export class Die extends Error {
  readonly why: string;
  constructor(why: string) { super(why); this.why = why; }
}
export const isDie = (e: unknown, why?: string): e is Die => e instanceof Die && (why === undefined || e.why.startsWith(why));

export interface Bubble {
  img: Surface;
  neighbours: Bubble[];
  x: number; y: number;
  cx: number; cy: number;
  x_old?: number; y_old?: number;
  direction?: number;
  speedx?: number; speedy?: number; speed?: number;
  distance_to_root?: number;
  chaindestx?: number; chaindesty?: number; chaindestcx?: number; chaindestcy?: number; chaingoingup?: number;
  wait_fall?: number;
  mark?: number;
  num?: number;
  stick_y?: number;
  freeze?: number;
  mp_stick?: number;
}

type Key = number | string;

/** one in-game network message: the sender's id byte and the text */
export interface NetMsg { id: string; msg: string }

/** what the game needs from the network (fb_net.pm's in-game part, over the server) */
export interface FbNet {
  isconnected(): boolean;
  gsend(msg: string): void;
  grecv(): NetMsg[];
  grecv_get1msg(): Promise<NetMsg>;
  grecv_get1msg_ifdata(): NetMsg | undefined;
  gdelay_messages(...m: NetMsg[]): void;
  setmyid(id: string): void;
  disconnect(): void;
}

/** text rendering (SDL_Pango through fb_c_stuff): a surface with the text, and the layout size */
export interface TextEngine {
  draw(kind: string, color: 'fg' | 'bg', text: string, width: number, align: string): Surface;
  size(kind: string, text: string, width: number): [number, number];
}

/** ~/.frozen-bubble: the original's files (rc, highscores, highscores-mptrain, highlevelshistory,
 *  levels/<levelset>, records/<record>) */
export interface FbHome {
  read(path: string): string | null;
  write(path: string, data: string): void;
  append(path: string, data: string): void;
  remove(path: string): boolean;
  list(dir: string): string[];
  exists(path: string): boolean;
}

/** the game's data files (gfx/, snd/, data/ of the original) */
export interface FbData {
  image(path: string): Surface;
  file(path: string): Uint8Array;
  has(path: string): boolean;
  glob(prefix: string): string[];
}

/** online play: the lobby and what it decided (replaces fb_net's server connection and smg_choose_game) */
export interface FbOnline {
  /** shows the lobby; resolves with the game's setup, or null if the player leaves */
  chooseGame(firstTime: boolean): Promise<OnlineSetup | null>;
  net: FbNet;
  /** after a game: show it to the server (results), leave the room */
  ended(scores: { nick: string; score: number }[], why: string): Promise<void>;
}

export interface OnlineSetup {
  /** GAME_CAN_START's mapping, in seat order */
  mapping: { id: string; nick: string }[];
  mynick: string;
  chainreaction: boolean;
  continuegamewhenplayersleave: boolean;
  singleplayertargetting: boolean;
  scorelimit: number;
}

export interface FbHost {
  app: App;
  text: TextEngine;
  home: FbHome;
  data: FbData;
  /** the trace of the tests: called after each game frame (maingame) */
  frameHook?: (g: FrozenBubble) => void;
  /** called whenever print_ draws (trace) */
  textHook?: (kind: string, surface: Surface, x: number, y: number, text: string, size: number, align: string) => void;
  online?: FbOnline;
  /** command line options of the original (tests) */
  args?: string[];
  /** the original's "quit": back to the website */
  exit(): void;
  /** the level editor (FBLE.pm) */
  makeEditor(g: FrozenBubble): FBLE;
  /** the user name the original took from $ENV{USER} */
  user: string;
  /** every srand (trace) */
  srandHook?: (seed: number) => void;
  /** a hint for the page (loading steps) */
  status?: (s: string) => void;
}

interface Actions { left: number; right: number; fire: number; center: number; mp_fire?: number; mp_stick?: number; hadfire?: number; [k: string]: number | undefined }

interface PingRight { state: string; img: number; movelatency?: number }

interface PData {
  score: number | string;
  state: string;
  left?: number;
  ping_right: PingRight;
  newroot: number; newroot_prelight: number; newroot_prelight_step: number; oddswap: number; hurry: number;
  newrootlevel: number;
  malus: number[];
  nextcolor: number;
  nextcolors?: number[];
  hurry_save_img: Surface | null;
  hurry_oddness?: number | boolean;
  sticking_step: number; sticking_step_slowdown: number;
  sleeping: number;
  freezelaunchedbubble?: number;
  stickcx?: number; stickcy?: number; stickcol?: number;
  newrootlast?: number;
  still_game_messages?: number;
  ready4newgame?: number;
  barrier4newgame?: number;
  chat_msg_delay?: number;
  id?: string;
  nick?: string;
  chatting?: number;
}

function newPData(): PData {
  return {
    score: 0, state: '', ping_right: { state: 'normal', img: 0 }, newroot: 0, newroot_prelight: 0, newroot_prelight_step: 0,
    oddswap: 0, hurry: 0, newrootlevel: 0, malus: [], nextcolor: 0, hurry_save_img: null, sticking_step: 0,
    sticking_step_slowdown: 0, sleeping: 0,
  };
}

type PerPlayer<T> = Record<string, T>;

export class FrozenBubble {
  readonly host: FbHost;
  readonly app: App;
  readonly c: CStuff;
  readonly rand = new PerlRand();
  fble: FBLE | null = null;

  // constants that iter_players localizes for the small fields
  BUBBLE_SIZE = BUBBLE_SIZE0;
  ROW_SIZE = ROW_SIZE0;
  BUBBLE_SPEED = BUBBLE_SPEED0;
  FREE_FALL_CONSTANT = FREE_FALL_CONSTANT0;
  TIME_APPEARS_NEW_ROOT = 11;
  TIME_HURRY_WARN = 250;
  TIME_HURRY_MAX = 375;

  KEYS: Record<string, Record<string, Key>> = {
    p1: { left: SDLK.LEFT, right: SDLK.RIGHT, fire: SDLK.UP, center: SDLK.DOWN },
    p2: { left: SDLK.x, right: SDLK.v, fire: SDLK.c, center: SDLK.d },
    misc: {
      fs: SDLK.f, chat: SDLK.RETURN, send_malus_to_rp1: SDLK.F1, send_malus_to_rp2: SDLK.F2, send_malus_to_rp3: SDLK.F3,
      send_malus_to_rp4: SDLK.F4, send_malus_to_all: SDLK.F10, next_playlist_elem: SDLK.TAB, save_record: SDLK.PRINT,
      toggle_music: SDLK.F11, toggle_sound: SDLK.F12, raise_volume: SDLK.KP_PLUS, lower_volume: SDLK.KP_MINUS,
    },
  };
  mixer = 0 as number | string;
  mixer_enabled: number | undefined = undefined;
  music_disabled: number | undefined = undefined;
  sfx_disabled = 0;
  no_echo = 0;
  graphics_level = 3;
  PLAYERS: Player[] = ['p1', 'p2'];
  playermalus = 0;
  mptrainingdiff = 30;
  chainreaction = 0;
  colourblind = 0;
  mynick = '';
  HISCORES: Record<string, PValue>[] = [];
  HISCORES_MPTRAIN: Record<string, PValue>[] = [];
  HISCORES_MPTRAIN_CHAINREACTION: Record<string, PValue>[] = [];
  fullscreen: PValue = null;
  mylatitude: PValue = null;
  mylongitude: PValue = null;
  direct = 0;
  no_time_limit = 0;
  continuegamewhenplayersleave = 0;
  singleplayertargetting = 0;
  autorecord = 0;
  /** tests only: a deliberate change of one rule (oracle.test.ts, mutation) */
  mutation: '' | 'malus' | 'stick' = '';

  POS: PosTable = POS_2P;
  MENUPOS = { xpos_panel: 0, ypos_panel: 0 };
  actions: PerPlayer<Actions> = {};
  angle: PerPlayer<number> = {};
  pdata: PerPlayer<PData> & Record<string, unknown> = {} as PerPlayer<PData> & Record<string, unknown>;
  gstate = '';
  gametype = '';
  sendmalustoone: Player | null = null;
  attackingme: Player[] = [];
  id2p: Record<string, Player> = {};
  current_chat_messages: PerPlayer<string | null> = {};
  scorelimit = 0;
  protocollevel = 0;
  demo = 0;
  inconsistency = 0;
  cursor_img: Record<string, number> = {};

  apprects: Record<string, Rect> = {};
  rects = new Map<Surface, Rect>();
  background!: Surface;
  background_orig!: Surface;
  bubbles_images: Surface[] = [];
  bubbles_anim: { white?: Surface; lose?: Surface; on_top_next?: Surface; stick: Surface[] } = { stick: [] };
  img_mini = new Map<Surface, Surface>();
  imgbin: Record<string, any> = {};
  pinguin: PerPlayer<Record<string, Surface[]>> = {};
  canon: { img: Map<number, Surface>; data: Map<number, number[]>; img_mini: Map<number, Surface>; data_mini: Map<number, number[]> } =
    { img: new Map(), data: new Map(), img_mini: new Map(), data_mini: new Map() };
  malus_gfx: { banane?: Surface; tomate?: Surface } = {};
  shooter_lowgfx!: Surface;
  sound: Record<string, Chunk> = {};
  music: Record<string, string> = {};

  sticked_bubbles: PerPlayer<Bubble[]> = {};
  root_bubbles: PerPlayer<Bubble[]> = {};
  malus_bubble: PerPlayer<Bubble[]> = {};
  falling_bubble: PerPlayer<Bubble[]> = {};
  exploding_bubble: PerPlayer<Bubble[]> = {};
  launched_bubble: PerPlayer<Bubble | null> = {};
  tobe_launched: PerPlayer<Bubble | null> = {};
  next_bubble: PerPlayer<Bubble> = {};
  sticking_bubble: PerPlayer<Bubble | null> = {};
  chains: PerPlayer<{ falling_chained: Bubble[]; chained_bubbles: Map<Bubble, Bubble[]> }> = {};

  levels: { current: number | string | null; sets: Map<number, { cx: number; cy: number; img_num: string }[]> } = { current: null, sets: new Map() };
  lev_number = 0;
  loaded_levelset = '';
  direct_levelset = '';
  frame = 0;
  update_rects: Rect[] = [];
  display_on_app_disabled = 0;
  start_time = 0;
  addicted_time = 0;
  time_1pgame = 0;
  time_netgame = 0;
  recorddata: { frame?: number; data?: any[]; save?: number; lastactions?: PerPlayer<Record<string, number | undefined>>; mp_messages?: NetMsg[]; pdatas?: { bubbles?: number[]; mp_result?: string } } = {};
  playdata: [number, { actions?: PerPlayer<Record<string, string>>; mp_messages?: NetMsg[] }][] | null = null;
  recordnumber = 0;
  current_theoretical_music = '';
  musicObj: Music | null = null;
  p: Player = 'p1';
  p_: Player | '' = '';
  /** the current game state is drawn or not */
  private iterDepth = 0;
  private iterDepth_ = 0;

  // menu statics
  logo_candy_index = 0;
  logo_candy_method = 0;
  logox = 0; logoy = 0;
  candy: Surface | null | undefined = undefined;
  blink_green = 0;
  blink_purple = 0;
  cursor_save_bg: Record<string, Surface | null> = {};
  cursor_tmp: Surface | null = null;
  broken_cursors: Record<string, number> = {};
  current_pos = 0;
  banner_pos = 0;
  choose1pSave: Surface | null = null;
  // callback_entry
  entry_typed: string[] = [];
  entry_position = 0;
  entry_echo_blink_counter = 0;
  // net status
  smg_status_messages: string[] = [];
  smg_status_message_offsetpage = 1;

  constructor(host: FbHost) {
    this.host = host;
    this.app = host.app;
    this.c = new CStuff({
      ticks: () => this.app.ticks(),
      delay: (ms) => this.app.delay(ms),
      flip: () => this.app.flip(),
      time: () => this.app.time(),
    });
    this.mynick = this.sanitize_nick(host.user);
    this.rand.onSrand = (seed) => host.srandHook?.(seed);
    for (const p of ALL_PLAYERS) this.pdata[p] = newPData();
  }

  get POSp(): Record<string, PlayerPos> { return this.POS as unknown as Record<string, PlayerPos>; }

  // ------------------------------------------------------------------------------- sound

  play_sound(name: string): void {
    if (this.mixer_enabled && this.mixer && !this.sfx_disabled && this.sound[name]) this.app.mixer.playChannel(-1, this.sound[name], 0);
  }

  async play_music(name: string): Promise<void> {
    this.current_theoretical_music = name;
    if (!(this.mixer_enabled && this.mixer && !this.music_disabled)) return;
    const mx = this.app.mixer;
    while (mx.fadingMusic()) await this.app.delay(10);
    if (mx.playingMusic()) mx.fadeOutMusic(500);
    await this.app.delay(400);
    while (mx.playingMusic()) await this.app.delay(10);
    const musics: Record<string, string> = { intro: 'snd/introzik.ogg', main1p: 'snd/frozen-mainzik-1p.ogg', main2p: 'snd/frozen-mainzik-2p.xm' };
    this.musicObj = mx.loadMUS(musics[name]);
    await mx.playMusic(this.musicObj, -1, (ms) => this.app.delay(ms));
    this.music.current = name;
  }

  init_sound(): number {
    this.mixer = 1;
    this.app.mixer.openAudio(44100, 0x8010, 2, 1024);
    for (const s of ['stick', 'destroy_group', 'newroot', 'newroot_solo', 'lose', 'hurry', 'pause', 'menu_change', 'menu_selected',
      'rebound', 'launch', 'malus', 'noh', 'snore', 'cancel', 'typewriter', 'applause', 'chatted']) {
      this.sound[s] = this.app.mixer.loadWAV(`snd/${s}.ogg`);
      this.app.mixer.volumeChunk(this.sound[s], 80);
    }
    return 1;
  }

  // ------------------------------------------------------------------------------- graphics

  add_default_rect(s: Surface): void { this.rects.set(s, new Rect(0, 0, s.w, s.h)); }

  mini_graphics(p: string): boolean { return this.PLAYERS.length >= 3 && /rp/.test(p); }

  translate_mini_image(image: Surface): Surface {
    if (this.mini_graphics(this.p_) || (this.p_ === '' && this.mini_graphics(this.p))) {
      const m = this.img_mini.get(image);
      if (m) return m;
    }
    return image;
  }

  put_image(image: Surface, x: number, y: number): void {
    image = this.translate_mini_image(image);
    const r = this.rects.get(image);
    if (!r) throw new Error("please don't call me with no rects");
    const drect = new Rect(x, y, image.w, image.h);
    blitSurface(image, r, this.app.screen, drect);
    this.update_rects.push(drect);
  }

  erase_image_from(image: Surface, x: number, y: number, img: Surface): void {
    image = this.translate_mini_image(image);
    const drect = new Rect(x, y, image.w, image.h);
    blitSurface(img, drect, this.app.screen, drect);
    this.update_rects.push(drect);
  }

  erase_image(image: Surface, x: number, y: number): void { this.erase_image_from(image, x, y, this.background); }

  put_image_to_background(image: Surface, x: number, y: number): void {
    let drect: Rect;
    image = this.translate_mini_image(image);
    if (y > 0) {
      drect = new Rect(x, y, image.w, image.h);
      if (!this.display_on_app_disabled) blitSurface(image, this.rects.get(image) ?? null, this.app.screen, drect);
      blitSurface(image, this.rects.get(image) ?? null, this.background, drect);
    } else {
      drect = new Rect(x, 0, image.w, image.h + y);
      const irect = new Rect(0, -y, image.w, image.h + y);
      if (!this.display_on_app_disabled) blitSurface(image, irect, this.app.screen, drect);
      blitSurface(image, irect, this.background, drect);
    }
    this.update_rects.push(drect);
  }

  remove_image_from_background(image: Surface, x: number, y: number): void {
    image = this.translate_mini_image(image);
    const drect = new Rect(x, y, image.w, image.h);
    blitSurface(this.background_orig, drect, this.background, drect);
    blitSurface(this.background_orig, drect, this.app.screen, drect);
    this.update_rects.push(drect);
  }

  remove_images_from_background(_player: string, images: Bubble[]): void {
    for (const image of images) {
      const img = this.translate_mini_image(image.img);
      const drect = new Rect(image.x, image.y, img.w, img.h);
      blitSurface(this.background_orig, drect, this.background, drect);
      blitSurface(this.background_orig, drect, this.app.screen, drect);
      this.update_rects.push(drect);
    }
  }

  put_allimages_to_background(player: string): void {
    for (const b of this.sticked_bubbles[player]) this.put_image_to_background(b.img, b.x, b.y);
  }

  switch_image_on_background(image: Surface, x: number, y: number, save?: number): Surface | null {
    const drect = new Rect(x, y, image.w, image.h);
    let saved: Surface | null = null;
    if (save) {
      saved = newSurface(image.w, image.h, 32, true);
      blitSurface(this.background, drect, saved, this.rects.get(image) ?? null);
    }
    blitSurface(image, this.rects.get(image) ?? new Rect(0, 0, image.w, image.h), this.background, drect);
    blitSurface(this.background, drect, this.app.screen, drect);
    this.update_rects.push(drect);
    return saved;
  }

  add_image_file(file: string): Surface {
    const img = this.host.data.image(file);
    this.add_default_rect(img);
    return img;
  }
  add_image(f: string): Surface { return this.add_image_file(`gfx/${f}`); }
  add_bubble_image(f: string): Surface {
    const b = this.add_image(f);
    this.bubbles_images.push(b);
    return b;
  }

  // ------------------------------------------------------------------------------- generic game stuff

  /** iter_players: $::p over the players, with the small field's sizes for rp players in 3+ games */
  iter_players(f: () => void, players?: Player[]): void {
    if (this.iterDepth) throw new Error("iter_players: assert failed -- iter_players can't be called recursively sorry");
    this.iterDepth++;
    const saveP = this.p;
    try {
      for (const p of players ?? [...this.PLAYERS]) {
        this.p = p;
        if (this.mini_graphics(p)) {
          const save = [this.BUBBLE_SIZE, this.BUBBLE_SPEED, this.ROW_SIZE, this.FREE_FALL_CONSTANT];
          this.BUBBLE_SIZE /= 2; this.BUBBLE_SPEED /= 2; this.ROW_SIZE /= 2; this.FREE_FALL_CONSTANT /= 2;
          try { f(); } finally { [this.BUBBLE_SIZE, this.BUBBLE_SPEED, this.ROW_SIZE, this.FREE_FALL_CONSTANT] = save; }
        } else f();
      }
    } finally {
      this.p = saveP;
      this.iterDepth--;
    }
  }

  /** the same with awaits inside (the body may block) */
  async iter_players_async(f: () => Promise<void>, players?: Player[]): Promise<void> {
    if (this.iterDepth) throw new Error("iter_players: assert failed -- iter_players can't be called recursively sorry");
    this.iterDepth++;
    const saveP = this.p;
    try {
      for (const p of players ?? [...this.PLAYERS]) {
        this.p = p;
        if (this.mini_graphics(p)) {
          const save = [this.BUBBLE_SIZE, this.BUBBLE_SPEED, this.ROW_SIZE, this.FREE_FALL_CONSTANT];
          this.BUBBLE_SIZE /= 2; this.BUBBLE_SPEED /= 2; this.ROW_SIZE /= 2; this.FREE_FALL_CONSTANT /= 2;
          try { await f(); } finally { [this.BUBBLE_SIZE, this.BUBBLE_SPEED, this.ROW_SIZE, this.FREE_FALL_CONSTANT] = save; }
        } else await f();
      }
    } finally {
      this.p = saveP;
      this.iterDepth--;
    }
  }

  iter_players_(f: () => void, players?: Player[]): void {
    if (this.iterDepth_) throw new Error("iter_players_: assert failed -- iter_players_ can't be called recursively sorry");
    this.iterDepth_++;
    const save = this.p_;
    try {
      for (const p of players ?? [...this.PLAYERS]) { this.p_ = p; f(); }
    } finally {
      this.p_ = save;
      this.iterDepth_--;
    }
  }

  iter_players_but_first(f: () => void): void { this.iter_players(f, this.PLAYERS.slice(1)); }
  iter_local_players(f: () => void): void { this.iter_players(f, this.PLAYERS.filter((p) => !/rp/.test(p))); }
  iter_distant_players(f: () => void): void { this.iter_players(f, this.PLAYERS.filter((p) => /rp/.test(p))); }
  iter_distant_players_(f: () => void): void { this.iter_players_(f, this.PLAYERS.filter((p) => /rp/.test(p))); }

  is_1p_game(): boolean { return this.PLAYERS.length === 1; }
  is_mp_game(): boolean { return this.PLAYERS.some((p) => /rp/.test(p)); }
  is_2p_game(): boolean { return this.PLAYERS.length === 2 && !this.is_mp_game(); }

  is_leader(): boolean {
    const me = this.pdata.p1.id!.charCodeAt(0);
    let leader = true;
    this.iter_players_but_first(() => {
      if (!this.pdata[this.p].left) leader = leader && this.pdata[this.p].id!.charCodeAt(0) > me;
    });
    return leader;
  }
  is_local_player(p: string): boolean { return !/rp/.test(p); }
  is_distant_player(p: string): boolean { return /rp/.test(p); }

  /** fb_net; a replay replaces gsend and grecv_get1msg_ifdata by nothing (replay's local *fb_net::...) */
  net(): FbNet { return this.playdata || !this.host.online ? NULL_NET : this.host.online.net; }

  mp_ping_if_needed(ticks: { v: number }): void {
    if (this.app.ticks() - ticks.v > 1000) {
      this.net().gsend('p');
      ticks.v = this.app.ticks();
    }
  }

  async mp_propagate(key: string, value: number, ticks: { v: number }): Promise<number> {
    // the server's module decides what the leader sent in the original (README: online)
    const m = await this.net().grecv_get1msg();
    this.mp_ping_if_needed(ticks);
    if (!m.msg.startsWith(key) || m.msg.length === key.length) {
      throw new Die('quit');
    }
    void value;
    return pnum(m.msg.slice(key.length));
  }

  living_players(): Player[] {
    const living: Player[] = [];
    this.iter_players_(() => {
      const p = this.p_ as Player;
      if (!this.pdata[p].left && this.pdata[p].state === 'ingame') living.push(p);
    });
    return living;
  }

  notleft_players(): number {
    let n = 0;
    this.iter_players_(() => { if (!this.pdata[this.p_].left) n++; });
    return n;
  }

  // ------------------------------------------------------------------------------- bubble game stuff

  calc_real_pos_given_arraypos(cx: number, cy: number, player: string): [number, number] {
    const P = this.POSp[player];
    return [P.left_limit + cx * this.BUBBLE_SIZE + oddn(cy + this.pdata[player].oddswap) * this.BUBBLE_SIZE / 2,
      P.top_limit + cy * this.ROW_SIZE];
  }

  calc_real_pos(b: Bubble, player: string): void {
    [b.x, b.y] = this.calc_real_pos_given_arraypos(b.cx, b.cy, player);
  }

  get_array_yclosest(y: number, player: string): number {
    return int((y - this.POSp[player].top_limit + this.ROW_SIZE / 2) / this.ROW_SIZE);
  }

  get_array_closest_pos(x: number, y: number, player: string): [number, number] {
    const ny = this.get_array_yclosest(y, player);
    const nx = int((x - this.POSp[player].left_limit + this.BUBBLE_SIZE / 2 - oddn(ny + this.pdata[player].oddswap) * this.BUBBLE_SIZE / 2) / this.BUBBLE_SIZE);
    return [nx, ny];
  }

  is_collision(bub: Bubble, x: number, y: number): boolean {
    const D = sqr(this.BUBBLE_SIZE * (this.mutation === 'stick' ? 0.8 : 0.82));
    const xs = sqr(bub.x - x);
    if (xs > D) return false;
    return (xs + sqr(bub.y - y)) < D;
  }

  create_bubble_given_img(img: Surface): Bubble {
    return { img, neighbours: [], x: 0, y: 0, cx: 0, cy: 0 };
  }
  create_bubble_given_img_num(num: number): Bubble { return this.create_bubble_given_img(this.bubbles_images[num]); }

  validate_nextcolor(num: number, player: string): boolean {
    return !this.is_1p_game() || member(num, this.sticked_bubbles[player].map((b) => this.get_bubble_num(b)));
  }

  get_bubble_num(b: Bubble): number {
    let num = -1;
    this.bubbles_images.forEach((img, i) => { if (img === b.img) num = i; });
    return num;
  }

  bubble_next_to(x1: number, y1: number, x2: number, y2: number, player: string): boolean {
    if (x1 === x2 && y1 === y2) {
      this.inconsistency = 1;
      throw new Die('quit');
    }
    const os = this.pdata[player].oddswap;
    return (sqr(x1 + oddn(y1 + os) * 0.5 - (x2 + oddn(y2 + os) * 0.5)) + sqr(y1 - y2)) < 3;
  }

  next_positions(b: Bubble, player: string): [number, number][] {
    const os = this.pdata[player].oddswap;
    const nrl = this.pdata[player].newrootlevel;
    const out: [number, number][] = [];
    const v = (x: number, y: number): void => {
      if (x >= 0 && x + oddn(y + os) <= 7 && y >= 0 && y >= nrl && y <= 11) out.push([x, y]);
    };
    const e = evenn(b.cy + os);
    v(b.cx - 1, b.cy);
    v(b.cx + 1, b.cy);
    v(b.cx - e, b.cy - 1);
    v(b.cx - e, b.cy + 1);
    v(b.cx - e + 1, b.cy - 1);
    v(b.cx - e + 1, b.cy + 1);
    return out;
  }

  real_stick_bubble(bubble: Bubble, xpos: number, ypos: number, player: string, neighbours_ok: number): void {
    bubble.cx = xpos;
    bubble.cy = ypos;
    for (const b of this.sticked_bubbles[player]) {
      if (this.bubble_next_to(b.cx, b.cy, bubble.cx, bubble.cy, player)) {
        b.neighbours.push(bubble);
        if (!neighbours_ok) bubble.neighbours.push(b);
      }
    }
    this.sticked_bubbles[player].push(bubble);
    if (bubble.cy === this.pdata[player].newrootlevel) this.root_bubbles[player].push(bubble);
    this.calc_real_pos(bubble, player);
    this.put_image_to_background(bubble.img, bubble.x, bubble.y);
  }

  destroy_bubbles(player: string, bubz: Bubble[]): void {
    if (this.graphics_level === 1) return;
    for (const b of bubz) {
      b.speedx = (this.rand.rand(3) - 1.5) / (this.mini_graphics(player) ? 2 : 1);
      b.speedy = (-this.rand.rand(4) - 2) / (this.mini_graphics(player) ? 2 : 1);
    }
    this.exploding_bubble[player].push(...bubz);
  }

  find_bubble_group(b: Bubble): Bubble[] {
    let neighbours: Bubble[] = [b];
    const group: Bubble[] = [];
    for (;;) {
      group.push(...neighbours);
      const gs = new Set(group);
      neighbours = fastuniq(neighbours.flatMap((n) => n.neighbours)).filter((n) => b.img === n.img && !gs.has(n));
      if (!neighbours.length) break;
    }
    return group;
  }

  stick_bubble(bubble: Bubble, xpos: number, ypos: number, player: string, count_for_root: number): void {
    let falling: Bubble[] = [];
    let need_redraw = 0;
    bubble.neighbours = this.sticked_bubbles[player].filter((b) => this.bubble_next_to(b.cx, b.cy, xpos, ypos, player));

    // in multiple chain reactions, it's possible that the group doesn't exist anymore in some rare situations
    if (bubble.chaindestx !== undefined && !bubble.neighbours.length) return;

    const will_destroy = difference2(this.find_bubble_group(bubble), [bubble]);

    if (will_destroy.length <= 1) {
      this.play_sound('stick');
      this.real_stick_bubble(bubble, xpos, ypos, player, 1);
      this.sticking_bubble[player] = bubble;
      this.pdata[player].sticking_step = 0;
    } else {
      this.play_sound('destroy_group');
      for (const b of difference2(fastuniq(will_destroy.flatMap((w) => w.neighbours)), will_destroy)) {
        b.neighbours = difference2(b.neighbours, will_destroy);
      }
      this.sticked_bubbles[player] = difference2(this.sticked_bubbles[player], will_destroy);
      this.root_bubbles[player] = difference2(this.root_bubbles[player], will_destroy);

      bubble.cx = xpos;
      bubble.cy = ypos;
      this.calc_real_pos(bubble, player);
      this.destroy_bubbles(player, [...will_destroy, bubble]);

      // find falling bubbles
      for (const b of this.sticked_bubbles[player]) b.distance_to_root = 0;
      const still_sticked: Bubble[] = [];
      let neighbours = [...this.root_bubbles[player]];
      let distance_to_root = 0;
      for (;;) {
        distance_to_root++;
        for (const n of neighbours) n.distance_to_root = distance_to_root;
        still_sticked.push(...neighbours);
        neighbours = neighbours.flatMap((n) => n.neighbours).filter((n) => n.distance_to_root === 0);
        if (!neighbours.length) break;
      }
      falling = difference2(this.sticked_bubbles[player], still_sticked);
      this.sticked_bubbles[player] = difference2(this.sticked_bubbles[player], falling);

      // chain-reaction on falling bubbles
      if (this.chainreaction) this.chain_reaction(player, falling);

      // prepare falling bubbles
      if (this.graphics_level > 1 || this.chainreaction) {
        let max_cy_falling = 0;
        for (const b of falling) max_cy_falling = b.cy > max_cy_falling ? b.cy : max_cy_falling;
        let shift_on_same_line = 0, line = max_cy_falling;
        const sorted = [...falling].sort((a, b) => (b.cy * 8 + b.cx) - (a.cy * 8 + a.cx));
        for (const b of sorted) {
          if (line !== b.cy) shift_on_same_line = 0;
          line = b.cy;
          b.wait_fall = (max_cy_falling - b.cy) * 5 + shift_on_same_line;
          shift_on_same_line++;
          b.speed = 0;
        }
        this.falling_bubble[player].push(...falling);
      }

      this.remove_images_from_background(player, [...will_destroy, ...falling]);
      // redraw neighbours because parts of neighbours have been erased by previous statement
      const wf = new Set([...will_destroy, ...falling]);
      for (const b of fastuniq([...will_destroy, ...falling].flatMap((n) => n.neighbours)).filter((n) => !wf.has(n))) {
        this.put_image_to_background(b.img, b.x, b.y);
      }
      need_redraw = 1;
    }

    if (count_for_root) {
      const pd = this.pdata[player];
      pd.newroot++;
      if (pd.newroot === this.TIME_APPEARS_NEW_ROOT - 1) { pd.newroot_prelight = 2; pd.newroot_prelight_step = 0; }
      if (pd.newroot === this.TIME_APPEARS_NEW_ROOT) { pd.newroot_prelight = 1; pd.newroot_prelight_step = 0; }
      if (pd.newroot > this.TIME_APPEARS_NEW_ROOT) {
        const mode_1p = this.is_1p_game() && this.levels.current !== 'mp_train';
        need_redraw = 1;
        pd.newroot_prelight = 0;
        this.play_sound(mode_1p ? 'newroot_solo' : 'newroot');
        pd.newroot = 0;
        pd.oddswap = pd.oddswap ? 0 : 1;
        this.remove_images_from_background(player, this.sticked_bubbles[player]);
        for (const b of this.sticked_bubbles[player]) { b.cy++; this.calc_real_pos(b, player); }
        for (const b of this.falling_bubble[player]) {
          if (b.chaindestx === undefined) continue;
          b.chaindestcy!++;
          b.chaindesty! += this.ROW_SIZE;
        }
        this.put_allimages_to_background(player);
        if (mode_1p) {
          pd.newrootlevel++;
          this.print_compressor();
        } else {
          this.root_bubbles[player] = [];
          for (let i = 0; i <= 7 - pd.oddswap; i++) {
            this.real_stick_bubble(this.create_bubble_given_img_num(pd.nextcolors![i]), i, 0, player, 0);
          }
          delete pd.nextcolors;
        }
      }
    }

    if (need_redraw) {
      let malus_val = will_destroy.length + falling.length - 2 + (this.mutation === 'malus' ? 1 : 0);
      if (malus_val > 0 && !this.is_mp_game()) malus_val += player === 'p1' ? this.playermalus : -this.playermalus;
      if (malus_val < 0) malus_val = 0;
      blitSurface(this.background, this.apprects[player], this.app.screen, this.apprects[player]);
      this.malus_change(malus_val, player);
    }
  }

  private chain_reaction(player: string, falling: Bubble[]): void {
    const ch = this.chains[player];
    const falling_colors = falling.map((b) => b.img);
    const grouped = this.sticked_bubbles[player].filter((b) => member(b.img, falling_colors) && b.neighbours.some((n) => b.img === n.img));
    if (grouped.length) {
      const occupied = this.sticked_bubbles[player].map((b) => b.cy * 8 + b.cx);
      occupied.push(...ch.falling_chained.map((b) => b.chaindestcy! * 8 + b.chaindestcx!));
      const byDist = [...grouped].sort((a, b) => a.distance_to_root! - b.distance_to_root!);
      for (const pos of byDist) {
        for (const npos of this.next_positions(pos, player)) {
          const chained = [...ch.chained_bubbles.values()].flat();
          if (chained.some((c) => pos.cx === c.cx && pos.cy === c.cy)) continue;
          if (!member(npos[1] * 8 + npos[0], occupied)) {
            for (const f of falling) {
              if (member(f, ch.falling_chained)) continue;
              if (pos.img === f.img) {
                [f.chaindestcx, f.chaindestcy] = [npos[0], npos[1]];
                [f.chaindestx, f.chaindesty] = this.calc_real_pos_given_arraypos(npos[0], npos[1], player);
                ch.falling_chained.push(f);
                occupied.push(npos[1] * 8 + npos[0]);
                f.neighbours = this.sticked_bubbles[player].filter((b) => this.bubble_next_to(b.cx, b.cy, npos[0], npos[1], player));
                const chained_bubbles = this.find_bubble_group(f);
                for (const b of this.sticked_bubbles[player]) b.mark = 0;
                const still: Bubble[] = [];
                let nb = difference2(this.root_bubbles[player], chained_bubbles);
                for (;;) {
                  for (const b of nb) b.mark = 1;
                  still.push(...nb);
                  nb = difference2(nb.flatMap((b) => b.neighbours).filter((b) => b.mark === 0), chained_bubbles);
                  if (!nb.length) break;
                }
                ch.chained_bubbles.set(f, difference2(this.sticked_bubbles[player], still));
                break;
              }
            }
          }
        }
      }
      // now examine all chaining bubbles; for each one, check that consequences of all other
      // chaining bubbles do not cancel it
      for (const f of [...falling].sort((a, b) => b.cy - a.cy)) {
        if (f.chaindestx === undefined) continue;
        const other: Bubble[] = [];
        for (const f2 of falling) {
          if (f === f2 || f2.chaindestx === undefined) continue;
          other.push(...this.find_bubble_group(f2));
        }
        for (const b of this.sticked_bubbles[player]) b.mark = 0;
        const still: Bubble[] = [];
        let nb = difference2(this.root_bubbles[player], other);
        for (;;) {
          for (const b of nb) b.mark = 1;
          still.push(...nb);
          nb = difference2(nb.flatMap((b) => b.neighbours).filter((b) => b.mark === 0), other);
          if (!nb.length) break;
        }
        const ss = new Set(still);
        const chained = this.find_bubble_group(f).filter((b) => ss.has(b));
        if (chained.length < 2) delete f.chaindestx;
      }
    }
  }
  redraw_chat_message_if_needed(player: string): void {
    const msg = this.current_chat_messages[player];
    if (msg) {
      const img = this.PLAYERS.length === 2 ? this.imgbin.void_chat_small_p2 : member(player, ['rp1', 'rp3']) ? this.imgbin.void_chat_small_rp1_rp3 : this.imgbin.void_chat_small_rp2_rp4;
      const P = this.POSp[player];
      this.put_image_to_background(img, P.chatting!.x, P.chatting!.y);
      this.print_('ingame_small_chat', this.background, P.chatting!.x + 3, P.chatting!.y + 3, msg, img.w - 6, 'center');
      this.erase_image(img, P.chatting!.x, P.chatting!.y);
    }
  }

  print_next_bubble(img: Surface, player: string, not_on_top_next?: number): void {
    if (this.is_mp_game() && player === 'p1' && this.pdata.p1.chatting) return;
    const nb = this.next_bubble[player];
    this.put_image_to_background(img, nb.x, nb.y);
    const P = this.POSp[player];
    if (!not_on_top_next) {
      this.put_image_to_background(this.bubbles_anim.on_top_next!, P.left_limit + P.next_bubble.x + P.on_top_next_relpos.x,
        P.next_bubble.y + P.on_top_next_relpos.y);
    }
    this.redraw_chat_message_if_needed(player);
  }

  generate_new_bubble(player: string, num: number): void {
    const P = this.POSp[player];
    const t = this.next_bubble[player];
    this.tobe_launched[player] = t;
    t.x = (P.left_limit + P.right_limit) / 2 - this.BUBBLE_SIZE / 2;
    t.y = P.initial_bubble_y;
    const nb = this.create_bubble_given_img_num(num);
    this.next_bubble[player] = nb;
    nb.x = P.left_limit + P.next_bubble.x;
    nb.y = P.next_bubble.y;
    this.print_next_bubble(nb.img, player);
  }

  // ------------------------------------------------------------------------------- game stuff

  readonly smg_lineheight = 16;
  readonly mp_train_xpos = 32;
  readonly mp_train_ypos = 177;

  mp_train_time_left(): number {
    let seconds = 120.99 - (((this.recorddata.frame ?? 0) * TARGET_ANIM_SPEED) / 1000);
    if (seconds < 0) seconds = 0;
    return seconds;
  }

  mp_train_print_time(): void {
    const seconds = this.mp_train_time_left();
    const m = int(seconds / 60);
    let s = String(int(seconds - m * 60));
    if (s.length === 1) s = `0${s}`;
    this.print_('ingame', this.background, this.mp_train_xpos, this.mp_train_ypos, `${m}'${s}"`, this.imgbin.void_mp_training.w, 'center');
  }

  handle_progress(p: string): void {
    const pd = this.pdata[p];
    const P = this.POSp[p];
    if (pd.newrootlast !== undefined) {
      if (pd.newroot !== pd.newrootlast) {
        const height = this.imgbin.progress_red.h + 1;
        this.put_image_to_background(this.imgbin.progress_green, P.progress.x, P.progress.y + pd.newrootlast * height);
        this.put_image_to_background(this.imgbin.progress_red, P.progress.x, P.progress.y + pd.newroot * height);
        pd.newrootlast = pd.newroot;
      }
    } else {
      const height = this.imgbin.progress_red.h + 1;
      pd.newrootlast = 0;
      this.update_rects.push(new Rect(P.progress.x, P.progress.y, this.imgbin.progress_red.w, height * (1 + this.TIME_APPEARS_NEW_ROOT)));
      for (let i = 0; i <= this.TIME_APPEARS_NEW_ROOT; i++) {
        this.put_image_to_background(this.imgbin[i ? 'progress_green' : 'progress_red'], P.progress.x, P.progress.y + i * height);
      }
    }
  }

  async handle_graphics(kind: 'erase' | 'put'): Promise<void> {
    const fun = kind === 'erase' ? (i: Surface, x: number, y: number) => this.erase_image(i, x, y) : (i: Surface, x: number, y: number) => this.put_image(i, x, y);
    this.iter_players(() => {
      const p = this.p;
      const pd = this.pdata[p];
      if (pd.state === 'left') return;
      const P = this.POSp[p];
      // bubbles
      for (const b of kind === 'erase' ? [this.launched_bubble[p]] : [this.launched_bubble[p], this.tobe_launched[p]]) {
        if (b) fun(b.img, b.x, b.y);
      }
      if (kind === 'put' && pd.newroot_prelight) {
        if (pd.newroot_prelight_step++ > 30 * pd.newroot_prelight) pd.newroot_prelight_step = 0;
        if (pd.newroot_prelight_step <= 8) {
          let hurry_overwritten = 0;
          for (const b of this.sticked_bubbles[p]) {
            if (this.graphics_level === 1 && b.cy > 0) continue;
            if (b.cx + 1 === pd.newroot_prelight_step) this.put_image(b.img, b.x, b.y);
            if (b.cx === pd.newroot_prelight_step) this.put_image(this.bubbles_anim.white!, b.x, b.y);
            if (b.cy > 6) hurry_overwritten = 1;
          }
          if (hurry_overwritten && pd.hurry_save_img) this.print_hurry(p, 1);
        }
      }
      if (this.sticking_bubble[p] && this.graphics_level > 1) {
        const b = this.sticking_bubble[p]!;
        if (kind === 'erase') {
          this.put_image(b.img, b.x, b.y);
        } else if (pd.sticking_step === this.bubbles_anim.stick.length) {
          this.sticking_bubble[p] = null;
        } else {
          this.put_image(this.bubbles_anim.stick[pd.sticking_step], b.x, b.y);
          if (pd.sticking_step_slowdown) { pd.sticking_step++; pd.sticking_step_slowdown = 0; } else pd.sticking_step_slowdown++;
        }
      }

      // shooter
      if (this.graphics_level > 1) {
        const num = int(this.angle[p] * CANON_ROTATIONS_NB / (PI / 2) + 0.5) - CANON_ROTATIONS_NB;
        const mini = this.mini_graphics(p);
        const img = (mini ? this.canon.img_mini : this.canon.img).get(num)!;
        const data = (mini ? this.canon.data_mini : this.canon.data).get(num)!;
        fun(img, P.canon.x + data[0], P.canon.y + data[1]);
      } else {
        fun(this.shooter_lowgfx, P.simpleshooter.x + P.simpleshooter.diameter * cos(this.angle[p]),
          P.simpleshooter.y - P.simpleshooter.diameter * sin(this.angle[p]));
      }

      // penguins
      if (!this.is_mp_game() || p !== 'p1' || !this.pdata.p1.chatting) {
        if (this.graphics_level === 3) {
          const player = this.PLAYERS.length === 2 && p === 'rp1' ? 'p2' : p;
          const PP = this.POSp[player];
          fun(this.pinguin[player][pd.ping_right.state][pd.ping_right.img], PP.left_limit + PP.pinguin.x, PP.pinguin.y);
        }
      }

      this.handle_progress(p);

      // chat message in mp
      if (this.is_mp_game() && pd.chat_msg_delay) {
        pd.chat_msg_delay--;
        if (!pd.chat_msg_delay) {
          const img = this.PLAYERS.length === 2 ? this.imgbin.void_chat_small_p2 : member(p, ['rp1', 'rp3']) ? this.imgbin.void_chat_small_rp1_rp3 : this.imgbin.void_chat_small_rp2_rp4;
          this.remove_image_from_background(img, P.chatting!.x, P.chatting!.y);
          this.current_chat_messages[p] = null;
          this.print_next_bubble(this.next_bubble[p].img, p);
          if (member(p, ['rp3', 'rp4'])) {
            this.print_scores(this.background);
            this.print_scores(this.app.screen);
          }
        }
      }

      // moving bubbles --> I want them on top of the rest
      for (const b of [...this.malus_bubble[p], ...this.falling_bubble[p], ...this.exploding_bubble[p]]) fun(b.img, b.x, b.y);
    });

    if (this.levels.current === 'mp_train' && this.gstate === 'game') {
      if (kind !== 'erase') {
        const drect = new Rect(this.mp_train_xpos, this.mp_train_ypos, this.imgbin.void_mp_training.w, 30);
        blitSurface(this.background_orig, drect, this.background, drect);
        this.mp_train_print_time();
        blitSurface(this.background, drect, this.app.screen, drect);
        this.update_rects.push(drect);
        const seconds = this.mp_train_time_left();
        if (seconds === 0) {
          this.put_image(this.imgbin.void_panel, this.MENUPOS.xpos_panel, this.MENUPOS.ypos_panel);
          let y = this.MENUPOS.ypos_panel + 30;
          for (const m of ['', '', '', '', 'Your score after two minutes:', '', pstr(this.pdata.p1.score), '', 'Press any key.']) {
            this.print_('menu', this.app.screen, this.MENUPOS.xpos_panel, y, m, this.imgbin.void_panel.w, 'center');
            y += this.smg_lineheight;
          }
          this.app.flip();
          this.play_sound('cancel');
          await this.c.fbdelay(1000);
          while (this.app.events.pollEvent()) { /* $event->pump while $event->poll != 0 */ }
          if (await this.grab_key() === SDLK.ESCAPE) throw new Die('quit');
          await this.handle_new_hiscores();
          throw new Die('new_game');
        }
      }
    }
  }

  update_malus(fun: 'remove' | 'put', p: string): void {
    let malus_nb = this.pdata[p].malus.length;
    let y_shift = 0;
    const P = this.POSp[p];
    while (malus_nb > 0) {
      const print = (type: Surface): void => {
        const real = this.translate_mini_image(type);
        // 1-player training has no malus position: Perl reads undef as 0
        const x = (P.malus?.x ?? 0) - real.w / 2, y = (P.malus?.y ?? 0) - y_shift - real.h;
        if (fun === 'remove') this.remove_image_from_background(type, x, y); else this.put_image_to_background(type, x, y);
        y_shift += real.h - 1;
      };
      if (malus_nb >= 7) { print(this.malus_gfx.tomate!); malus_nb -= 7; } else { print(this.malus_gfx.banane!); malus_nb--; }
    }
  }

  malus_change(numb: number, player: string): void {
    if (numb === 0 || (this.is_1p_game() && this.levels.current !== 'mp_train')) return;
    if (this.levels.current === 'mp_train' && numb > 0) {
      this.pdata.p1.score = pnum(this.pdata.p1.score) + numb;
      this.print_scores(this.app.screen);
      this.print_scores(this.background);
      return;
    }
    const add = (p: string, n: number): void => {
      this.update_malus('remove', p);
      for (let i = 0; i < n; i++) this.pdata[p].malus.push(this.frame);
      this.update_malus('put', p);
    };
    if (numb > 0) {
      if (!this.is_mp_game()) {
        this.iter_players_(() => { if (this.p_ !== player) add(this.p_, numb); });
      } else if (this.is_local_player(player)) {
        if (!this.sendmalustoone) {
          const living = this.living_players();
          if (living.length > 1) {
            numb = int(numb / (living.length - 1) + 0.99);
            this.iter_players_(() => {
              const q = this.p_ as Player;
              if (q !== player && member(q, living)) {
                if (this.is_mp_game()) this.net().gsend(`g${this.pdata[q].nick}:${numb}`);
                add(q, numb);
              }
            });
          }
        } else {
          const p = this.sendmalustoone;
          if (this.is_mp_game()) this.net().gsend(`g${this.pdata[p].nick}:${numb}`);
          this.iter_players_(() => { if (this.p_ === p) add(p, numb); });
        }
      }
    } else {
      // malus are decreasing
      this.update_malus('remove', player);
      while (numb++) this.pdata[player].malus.shift();
      this.update_malus('put', player);
    }
  }

  print_compressor(): void {
    const x = this.POS.compressor_xpos!;
    let y = this.POSp.p1.top_limit + this.pdata[this.PLAYERS[0]].newrootlevel * this.ROW_SIZE;
    const main = this.imgbin.compressor_main, ext = this.imgbin.compressor_ext;
    const drect = new Rect(x - main.w / 2, 0, main.w, y);
    blitSurface(this.background_orig, drect, this.background, drect);
    if (!this.display_on_app_disabled) blitSurface(this.background_orig, drect, this.app.screen, drect);
    this.update_rects.push(drect);
    this.put_image_to_background(main, x - main.w / 2, y - main.h);
    y -= main.h - 3;
    while (y > 0) {
      this.put_image_to_background(ext, x - ext.w / 2, y - ext.h);
      y -= ext.h;
    }
  }

  print_(kind: string, surface: Surface, x: number, y: number, text: string, size?: number, alignment?: string,
    callback?: (action: string, s: Surface) => boolean): void {
    this.host.textHook?.(kind, surface, x, y, text, size ?? -1, alignment ?? 'left');
    if (size) {
      const minsize = this.width(kind, text);
      if (minsize > size) size = minsize;
    }
    let surf = this.host.text.draw(kind, 'bg', text, size || -1, alignment || 'left');
    if (callback && !callback('about-to-draw', surf)) return;
    blitSurface(surf, null, surface, new Rect(x + 1, y + 1));
    surf = this.host.text.draw(kind, 'fg', text, size || -1, alignment || 'left');
    blitSurface(surf, null, surface, new Rect(x, y));
  }

  width(kind: string, text: string): number { return this.host.text.size(kind, text, -1)[0]; }

  async mp_disconnect_with_reason(...messages: string[]): Promise<never> {
    this.put_image(this.imgbin.void_panel, this.MENUPOS.xpos_panel, this.MENUPOS.ypos_panel);
    let y = this.MENUPOS.ypos_panel + 30;
    for (const m of messages) {
      this.print_('menu', this.app.screen, this.MENUPOS.xpos_panel + 10, y, m, this.imgbin.void_panel.w - 20, 'center');
      y += this.smg_lineheight;
    }
    this.app.flip();
    this.play_sound('cancel');
    await this.c.fbdelay(2000);
    while (this.app.events.pollEvent()) { /* drain */ }
    await this.grab_key();
    throw new Die('quit');
  }

  async check_mp_connection(): Promise<void> {
    if (this.playdata) return; // replays have no connection
    if (!this.net().isconnected()) {
      await this.mp_disconnect_with_reason('', '', '', '', 'Lost connection to server!', '', 'Your lag is probably too high.');
    }
  }

  update_say_mp(): void {
    const P = this.POSp.p1;
    this.put_image(this.imgbin.void_chat, P.chatting!.x, P.chatting!.y);
    this.callback_entry('print', { xpos: P.chatting!.x + 15, ypos: P.chatting!.y + 5, font: 'ingame_chat', maxlen: this.imgbin.void_chat.w - 30 });
    this.update_rects.push(this.apprects.main);
  }

  cleanup_chatting(): void {
    this.pdata.p1.chatting = 0;
    this.app.events.enableKeyRepeat(0, 0);
    const P = this.POSp.p1;
    this.remove_image_from_background(this.imgbin.void_chat, P.chatting!.x, P.chatting!.y);
    this.print_next_bubble(this.next_bubble.p1.img, 'p1');
    this.redraw_attackingme();
  }

  set_sendmalustoone(whoto: Player | null): void {
    this.sendmalustoone = null;
    this.iter_distant_players_(() => {
      const q = this.p_;
      this.remove_image_from_background(this.imgbin.attack[q], this.POSp[q].attack!.x, this.POSp[q].attack!.y);
    });
    if (whoto && member(whoto, this.living_players()) && this.pdata.p1.state !== 'lost') {
      this.sendmalustoone = whoto;
      this.put_image_to_background(this.imgbin.attack[whoto], this.POSp[whoto].attack!.x, this.POSp[whoto].attack!.y);
    }
    if (this.protocollevel >= 1) this.net().gsend(`A${this.sendmalustoone ? this.pdata[this.sendmalustoone].nick ?? '' : ''}`);
  }

  redraw_attackingme(): void {
    if (this.pdata.p1.chatting) return;
    let xpos = this.POSp.p1.attackme!.x;
    const drect = new Rect(xpos, this.POSp.p1.attackme!.y, 3 * 24 + this.imgbin.attackme.rp1.w, this.imgbin.attackme.rp1.h);
    blitSurface(this.background_orig, drect, this.background, drect);
    blitSurface(this.background_orig, drect, this.app.screen, drect);
    this.update_rects.push(drect);
    for (const a of this.attackingme) {
      this.put_image_to_background(this.imgbin.attackme[a], xpos, this.POSp.p1.attackme!.y);
      xpos += 24;
    }
  }

  handle_mp_messages(msg: NetMsg[]): void {
    // in order to keep ordering of actions executed in update_game, we must tolerate only one action at a time
    const check = (m: NetMsg, player: Player): boolean => {
      if (this.actions[player].mp_fire || this.actions[player].mp_stick || this.malus_bubble[player].length
          || (this.chainreaction && this.falling_bubble[player].some((b) => b.chaindestx !== undefined))) {
        msg.unshift(m);
        return false;
      }
      return true;
    };
    const latestangle = new Map<Player, string>();
    while (msg.length) {
      const m = msg.shift()!;
      const player = this.id2p[m.id];
      if (!player) throw new Die('quit');
      if (this.pdata[player].left) continue;
      const command = m.msg.charAt(0), params = m.msg.slice(1);
      if (command === 'l') {
        this.iter_players(() => {
          if (this.p === player) {
            this.pdata[this.p].left = 1;
            this.pdata[this.p].still_game_messages = 0;
            this.lose(this.p);
          }
        });
      } else if (command === 'f') {
        if (!check(m, player)) break;
        this.actions[player].mp_fire = 1;
        const r = /(.+):(.+)/.exec(params);
        if (r) { this.angle[player] = pnum(r[1]); this.pdata[player].nextcolor = pnum(r[2]); }
      } else if (command === 'r') {
        const a = this.actions[player];
        a.left = 0; a.right = 0; a.center = 0;
        if (params === 'l') a.left = 1; else if (params === 'r') a.right = 1; else if (params === 'c') a.center = 1;
      } else if (command === 'a') {
        latestangle.set(player, params);
      } else if (command === 's') {
        if (!check(m, player)) break;
        this.actions[player].mp_stick = 1;
        const r = /(.+):(.+):(.+):(.*)/.exec(params);
        if (r) {
          const pd = this.pdata[player];
          pd.stickcx = pnum(r[1]); pd.stickcy = pnum(r[2]); pd.stickcol = pnum(r[3]);
          pd.nextcolors = r[4].split(/ /).filter((s, i, a) => !(s === '' && i === a.length - 1)).map(pnum);
        }
      } else if (command === 'g') {
        const r = /(.+):(.+)/.exec(params);
        if (r) {
          const dest = r[1], numb = pnum(r[2]);
          this.iter_players(() => {
            if (this.pdata[this.p].nick === dest) {
              this.update_malus('remove', this.p);
              for (let i = 0; i < numb; i++) this.pdata[this.p].malus.push(this.frame);
              this.update_malus('put', this.p);
            }
          });
        }
      } else if (command === 'm') {
        if (this.pdata[player].state === 'ingame') {
          const r = /(.+):(.+):(.+):(.+)/.exec(params);
          if (r) {
            const b = this.create_bubble_given_img_num(pnum(r[1]));
            b.cx = pnum(r[2]);
            b.cy = pnum(r[3]);
            b.stick_y = pnum(r[4]);
            this.iter_players(() => {
              if (this.p === player) {
                this.calc_real_pos(b, this.p);
                this.malus_bubble[player].push(b);
                this.malus_change(-1, player);
              }
            });
          }
        }
      } else if (command === 'M') {
        const r = /(.+):(.+)/.exec(params);
        if (r && this.pdata[player].state === 'ingame') {
          const cx = pnum(r[1]), sticky = pnum(r[2]);
          const b = this.malus_bubble[player].find((x) => x.cx === cx && x.stick_y === sticky);
          if (!b) throw new Error('could not find malus bubble to malusstick!');
          b.mp_stick = 1;
        }
      } else if (command === 'F') {
        // this is coming too soon. it needs to be collected in the algo to restart a game.
        msg.unshift(m);
        break;
      } else if (command === 't') {
        this.current_chat_messages[player] = params;
        this.pdata[player].chat_msg_delay = 500;
        this.play_sound('chatted');
        this.redraw_chat_message_if_needed(player);
        this.update_rects.push(this.apprects.main);
      } else if (command === 'A') {
        if (params === '') this.attackingme = difference2(this.attackingme, [player]);
        else if (params === this.pdata.p1.nick) { if (!member(player, this.attackingme)) this.attackingme.push(player); }
        else this.attackingme = difference2(this.attackingme, [player]);
        this.redraw_attackingme();
      }
    }
    for (const [player, a] of latestangle) {
      // try to smoothen on network lag
      const difference = pnum(a) - this.angle[player];
      if (!(Math.abs(difference) > 0.15)) this.angle[player] += difference / 2;
    }
  }

  async handle_whenever_events(keypressed: Key | undefined): Promise<void> {
    const misc = this.KEYS.misc;
    if (keypressed === misc.fs) {
      this.fullscreen = new PBool(!truthy(this.fullscreen));
      this.app.fullscreen();
    }
    if (keypressed === misc.toggle_sound) {
      if (!this.mixer_enabled) {
        if (this.mixer || this.init_sound()) {
          this.mixer_enabled = 1;
          await this.play_music(this.current_theoretical_music);
        }
      } else {
        const mx = this.app.mixer;
        if (this.mixer_enabled && this.mixer && mx.playingMusic()) {
          while (mx.fadingMusic()) await this.app.delay(10);
          if (mx.playingMusic()) mx.haltMusic();
          while (mx.playingMusic()) await this.app.delay(10);
        }
        this.mixer_enabled = 0;
      }
    }
    if (this.mixer_enabled && this.mixer && keypressed === misc.toggle_music) {
      if (this.music_disabled) {
        this.music_disabled = undefined;
        await this.play_music(this.current_theoretical_music);
      } else {
        this.music_disabled = 1;
        this.app.mixer.haltMusic();
      }
    }
    if (this.mixer_enabled && this.mixer && keypressed === misc.raise_volume) {
      const to = int(Math.min(this.app.mixer.volumeMusic(-1) + MIX_MAX_VOLUME / 10, MIX_MAX_VOLUME));
      this.app.mixer.volumeMusic(to);
      this.app.mixer.volume(-1, to);
    }
    if (this.mixer_enabled && this.mixer && keypressed === misc.lower_volume) {
      const to = int(Math.max(this.app.mixer.volumeMusic(-1) - MIX_MAX_VOLUME / 10, 0));
      this.app.mixer.volumeMusic(to);
      this.app.mixer.volume(-1, to);
    }
  }

  extended_keypress(e: SDLEvent): Key | undefined {
    if (e.type === KEYDOWN) return e.sym;
    return undefined;
  }

  async handle_game_events(): Promise<void> {
    if (this.levels.current === 'mp_train' && this.malus_bubble.p1.length === 0 && this.pdata.p1.malus.length === 0) {
      if (int(this.rand.rand(this.mptrainingdiff * (1000 / TARGET_ANIM_SPEED))) === 0) {
        const n = 1 + int(this.rand.rand(6));
        for (let i = 0; i < n; i++) this.pdata.p1.malus.push(this.frame);
      }
    }
    const ev = this.app.events;

    if (this.playdata) {
      this.play();
      ev.pumpEvents();
      for (let e = ev.pollEvent(); e; e = ev.pollEvent()) {
        if (e.type === QUIT) await this.cleanup_and_exit();
        const keypressed = this.extended_keypress(e);
        await this.handle_whenever_events(keypressed);
        if (keypressed === SDLK.ESCAPE) throw new Die('quit');
        if (keypressed === SDLK.PAUSE) {
          const time_pause = this.app.ticks();
          while (ev.pollEvent()) { /* drain */ }
          for (;;) {
            let e2: SDLEvent | null;
            while ((e2 = ev.pollEvent())) {
              if (e2.type === QUIT) await this.cleanup_and_exit();
              if (this.extended_keypress(e2) !== undefined) { this.start_time += this.app.ticks() - time_pause; return; }
            }
            await this.app.delay(1); // the original spins here; the browser must breathe
          }
        }
        if (keypressed !== undefined && this.demo) throw new Die('quit');
      }
      return;
    }

    ev.pumpEvents();
    for (let e = ev.pollEvent(); e; e = ev.pollEvent()) {
      let keypressed = this.extended_keypress(e);
      if (keypressed !== undefined) {
        if (this.is_mp_game() && this.pdata.p1.chatting) {
          if (keypressed === SDLK.RETURN || keypressed === SDLK.KP_ENTER) {
            if (this.callback_entry('gettext').length > 0) this.net().gsend(`t${this.callback_entry('gettext').join('')}`);
            this.cleanup_chatting();
          } else if (e.type === KEYDOWN && !member(keypressed, [SDLK.RETURN, SDLK.KP_ENTER, SDLK.TAB])) {
            await this.callback_entry_async('keypressed', { event: e, maxlen: this.imgbin.void_chat.w - 30, font: 'ingame_chat' });
            this.callback_entry('moved');
            this.update_say_mp();
          }
        } else {
          this.iter_local_players(() => {
            for (const action of ['left', 'right', 'fire', 'center']) {
              if (keypressed === this.KEYS[this.p][action]) {
                this.actions[this.p][action] = 1;
                if (this.is_mp_game() && action !== 'fire') this.net().gsend(`r${action.charAt(0)}`);
                break;
              }
            }
          });

          if (keypressed === this.KEYS.misc.chat && this.is_mp_game()) {
            this.callback_entry('reset');
            this.pdata.p1.chatting = 1;
            ev.enableKeyRepeat(200, 50);
            this.put_image_to_background(this.imgbin.void_chat, this.POSp.p1.chatting!.x, this.POSp.p1.chatting!.y);
          }

          if (keypressed === SDLK.PAUSE && !this.is_mp_game()) {
            const time_pause = this.app.ticks();
            this.play_sound('pause');
            if (this.mixer_enabled && this.mixer) this.app.mixer.pauseMusic();
            const back_saved = this.switch_image_on_background(this.imgbin.back_paused, 0, 0, 1)!;
            let index = 0;
            pause: for (;;) {
              const ticks = this.app.ticks();
              const pi = this.imgbin.paused[index] as Surface;
              this.erase_image(pi, 320 - pi.w / 2 - 5, 240 - pi.h / 2 - 4);
              this.put_image(pi, 320 - pi.w / 2 - 5, 240 - pi.h / 2 - 4);
              this.app.update(this.update_rects);
              this.update_rects = [];
              await this.app.delay(20);
              ev.pumpEvents();
              for (let e2 = ev.pollEvent(); e2; e2 = ev.pollEvent()) {
                if (e2.type === QUIT) await this.cleanup_and_exit();
                const k = this.extended_keypress(e2);
                if (k !== undefined) {
                  await this.handle_whenever_events(k);
                  if (member(k, [SDLK.PAUSE, SDLK.ESCAPE, SDLK.RETURN, SDLK.SPACE])) break pause;
                }
              }
              if (++index === this.imgbin.paused.length) index = 11;
              const to_wait = TARGET_ANIM_SPEED - (this.app.ticks() - ticks);
              if (to_wait > 0) await this.c.fbdelay(to_wait);
            }
            this.switch_image_on_background(back_saved, 0, 0);
            this.iter_local_players(() => { this.actions[this.p].left = 0; this.actions[this.p].right = 0; });
            if (this.mixer_enabled && this.mixer) this.app.mixer.resumeMusic();
            while (ev.pollEvent()) { /* drain */ }
            this.app.flip();
            this.start_time += this.app.ticks() - time_pause;
            if (this.is_1p_game()) this.time_1pgame += this.app.ticks() - time_pause;
            return;
          }

          if (this.is_mp_game() && this.PLAYERS.length >= 3 && this.singleplayertargetting) {
            for (const rp of ['rp1', 'rp2', 'rp3', 'rp4'] as Player[]) {
              if (keypressed === this.KEYS.misc[`send_malus_to_${rp}`]) this.set_sendmalustoone(rp);
            }
            if (keypressed === this.KEYS.misc.send_malus_to_all) this.set_sendmalustoone(null);
          }

          if (!/^\d+$/.test(pstr(this.levels.current)) && keypressed === this.KEYS.misc.save_record) {
            this.recorddata.save = 1;
          }

          await this.handle_whenever_events(keypressed);
        }
      }

      keypressed = undefined;
      if (e.type === KEYUP) keypressed = e.sym;
      if (keypressed !== undefined) {
        this.iter_local_players(() => {
          for (const action of ['left', 'right', 'fire', 'center']) {
            if (keypressed === this.KEYS[this.p][action]) {
              this.actions[this.p][action] = 0;
              if (this.is_mp_game() && action !== 'fire') this.net().gsend('r');
              break;
            }
          }
        });
      }

      if (e.type === KEYDOWN && e.sym === SDLK.ESCAPE) {
        if (this.is_mp_game()) {
          if (this.pdata.p1.chatting) {
            this.cleanup_chatting();
            this.play_sound('cancel');
          } else {
            this.pdata.p1.left = 1;
            this.lose('p1');
            throw new Die('quit');
          }
        } else {
          this.pdata.p1.left = 1;
          throw new Die('quit');
        }
      }
      if (e.type === QUIT) await this.cleanup_and_exit();
    }

    if (this.is_mp_game()) {
      if (this.pdata.p1.chatting && this.callback_entry('ping').length) this.update_say_mp();
      const messages = this.net().grecv();
      await this.check_mp_connection();
      this.recorddata.mp_messages = messages.map((m) => ({ ...m }));
      this.handle_mp_messages(messages);
      this.net().gdelay_messages(...messages);
    }

    this.record();
  }

  record(): void {
    const rd = this.recorddata;
    rd.frame = (rd.frame ?? 0) + 1;
    const newdata: { actions?: PerPlayer<Record<string, number | undefined>>; mp_messages?: NetMsg[] } = {};
    rd.lastactions ??= {};
    this.iter_players(() => {
      const a = this.actions[this.p];
      for (const k of Object.keys(a)) {
        if (/^mp/.test(k)) continue;
        if ((rd.lastactions![this.p]?.[k] ?? '') !== (a[k] ?? '')) {
          newdata.actions ??= {};
          (newdata.actions[this.p] ??= {})[k] = a[k];
        }
      }
    });
    if (newdata.actions || (rd.mp_messages ?? []).length) {
      if ((rd.mp_messages ?? []).length) newdata.mp_messages = [...rd.mp_messages!];
      (rd.data ??= []).push([rd.frame, newdata]);
    }
    this.iter_players(() => {
      const a = this.actions[this.p];
      for (const k of Object.keys(a)) (rd.lastactions![this.p] ??= {})[k] = a[k];
    });
  }

  save_record_if_needed(): number {
    const rd = this.recorddata;
    if ((rd.save || this.autorecord) && !/^\d+$/.test(pstr(this.levels.current)) && (rd.data?.length ?? 0) > 1 && !this.pdata.p1.left) {
      const name = (n: number): string => `records/fb_record_${String(n).padStart(8, '0')}`;
      while (this.host.home.exists(name(this.recordnumber))) this.recordnumber++;
      const filename = name(this.recordnumber++);
      const record = rd.data!.shift();
      let data = 'record_protocol:0\n'
        + `players:${this.PLAYERS.join(',')}\n`
        + `gametype:${this.gametype}\n`
        + `current_level:${pstr(this.levels.current)}\n`
        + `chainreaction:${this.chainreaction}\n`
        + `time:${int(this.app.time())}\n`
        + `srand:${record.srand}\n`;
      if (record.bubbles) data += `bubbles:${record.bubbles.join(',')}\n`;
      if (this.is_mp_game()) {
        data += `mp_result:${this.gstate}\n`;
        this.iter_players(() => { data += `player_id:${this.p}|${this.pdata[this.p].id}\nplayer_nick:${this.p}|${this.pdata[this.p].nick}\n`; });
      }
      for (const [frame, item] of rd.data!) {
        for (const [p, acts] of Object.entries(item.actions ?? {})) {
          for (const [action, v] of Object.entries(acts as Record<string, number>)) data += `frame_action:${frame}|${p}|${action}|${v}\n`;
        }
        for (const m of item.mp_messages ?? []) data += `frame_mpmessage:${frame}|${m.id}|${m.msg}\n`;
      }
      this.host.home.write(filename, data);
      return 1;
    }
    return 0;
  }

  play(): void {
    const rd = this.recorddata;
    rd.frame = (rd.frame ?? 0) + 1;
    const next = this.playdata![0];
    if (next) {
      if (next[0] === rd.frame) {
        for (const [p, pnew] of Object.entries(next[1].actions ?? {})) {
          for (const [k, v] of Object.entries(pnew)) this.actions[p][k] = pnum(v);
        }
        if (next[1].mp_messages) this.handle_mp_messages(next[1].mp_messages);
        this.playdata!.shift();
      }
    } else if (this.demo) {
      throw new Die('quit');
    }
  }

  print_scores(surface: Surface): void {
    this.iter_players_(() => {
      const q = this.p_;
      const pd = this.pdata[q];
      let score = this.PLAYERS.length === 1
        ? (pd.score === 'random' ? 'Random level' : this.levels.current === 'mp_train' ? `Score: ${pstr(pd.score)}` : `Level ${pstr(pd.score)}`)
        : pstr(pd.score);
      if (this.is_mp_game()) score = `${pd.nick}: ${score}`;
      const mini = this.mini_graphics(q);
      const width = this.width(mini ? 'ingame_small' : 'ingame', score);
      const P = this.POSp[q];
      const xpos = P.scores.x - width / 2;
      const drect = new Rect(xpos, P.scores.y, width, mini ? 12 : 24);
      blitSurface(this.background_orig, drect, surface, drect);
      this.update_rects.push(drect);
      this.print_(mini ? 'ingame_small' : 'ingame', surface, xpos, P.scores.y, score);
      this.redraw_chat_message_if_needed(q);
    });
  }

  cleanup_player_bubbles(player: string): void {
    this.malus_bubble[player] = [];
    // reverse sort for freezing effect and win effect
    this.sticked_bubbles[player] = [...this.sticked_bubbles[player]].sort((a, b) => (b.cx + b.cy * 10) - (a.cx + a.cy * 10));
    this.remove_hurry(player);
    this.falling_bubble[player] = this.falling_bubble[player].filter((b) => b.chaindestx === undefined);
    this.sticking_bubble[player] = null;
    if (this.launched_bubble[player]) this.destroy_bubbles(player, [this.launched_bubble[player]!]);
    this.launched_bubble[player] = null;
    this.pdata[player].newroot_prelight = 0;
  }

  win(player: string): void {
    const pd = this.pdata[player];
    if (!this.continuegamewhenplayersleave) {
      if (every(this.PLAYERS, (q) => !this.pdata[q].left)) pd.score = pnum(pd.score) + 1;
    } else pd.score = pnum(pd.score) + 1;
    pd.ping_right.state = 'win';
    pd.ping_right.img = 0;
    this.print_scores(this.background);
    this.print_scores(this.app.screen);
    this.cleanup_player_bubbles(player);
  }

  lose(player: string): void {
    const pd = this.pdata[player];
    pd.ping_right.state = 'lose_to';
    pd.ping_right.img = 0;
    if (!pd.left) {
      for (const b of [this.launched_bubble[player], this.tobe_launched[player], ...this.malus_bubble[player]]) {
        if (!b) continue;
        b.img = this.bubbles_anim.lose!;
        b.x--;
        b.y--;
      }
      this.print_next_bubble(this.bubbles_anim.lose!, player, 1);
    }
    this.cleanup_player_bubbles(player);

    if (this.is_mp_game()) {
      pd.state = 'lost';
      const living = this.living_players();
      if (living.length === 1) {
        if ((!this.continuegamewhenplayersleave && any(this.PLAYERS, (q) => this.pdata[q].left))
            || every(this.PLAYERS, (q) => (this.pdata[q].still_game_messages ?? 0) === 0)) {
          this.win(living[0]);
          this.gstate = `won ${living[0]}`;
        } else {
          const winnernick = this.pdata[living[0]].nick;
          this.gstate = `finished ${living[0]}:${winnernick} 0`;
          if (!this.pdata.p1.left) this.net().gsend(`F${winnernick}`);
        }
      } else if (this.sendmalustoone === player || player === 'p1') {
        this.set_sendmalustoone(null);
      }
      if (pd.left) {
        if (this.is_distant_player(player)) {
          this.put_image_to_background(this.mini_graphics(player) ? this.imgbin[`left_${player}_mini`] : this.imgbin.left_rp1,
            this.POSp[player].left!.x, this.POSp[player].left!.y);
        }
        this.sticked_bubbles[player] = [];
        this.play_sound('cancel');
      } else {
        this.play_sound('lose');
      }
    } else {
      this.play_sound('lose');
      this.gstate = `lost ${player}`;
      if (this.is_2p_game()) this.win(player === 'p1' ? 'p2' : 'p1');
    }
  }

  verify_if_end(): void {
    this.iter_players(() => {
      if (this.gstate === 'game' && this.sticked_bubbles[this.p].some((b) => b.cy > 11)) this.lose(this.p);
    });
    if (this.is_1p_game() && this.levels.current !== 'mp_train' && this.sticked_bubbles[this.PLAYERS[0]].length === 0) {
      this.put_image_to_background(this.imgbin.win_panel_1player, this.POS.centerpanel.x, this.POS.centerpanel.y);
      this.gstate = `won ${this.PLAYERS[0]}`;
      this.pdata[this.PLAYERS[0]].ping_right.state = 'win';
      this.pdata[this.PLAYERS[0]].ping_right.img = 0;
      if (this.levels.current !== 'random') {
        if (this.levels.current) this.levels.current = pnum(this.levels.current) + 1;
        if (this.levels.current && !this.levels.sets.has(this.levels.current as number)) {
          this.levels.current = 'WON';
          this.falling_bubble[this.PLAYERS[0]] = [];
          this.exploding_bubble[this.PLAYERS[0]] = [];
          throw new Die('quit');
        }
      }
    }
  }

  print_hurry(player: string, dont_save_background?: number): void {
    player = this.PLAYERS.length === 2 && player === 'rp1' ? 'p2' : player;
    const P = this.POSp[player];
    const t = this.switch_image_on_background(this.imgbin.hurry[player], P.left_limit + P.hurry.x, P.hurry.y, 1);
    if (!dont_save_background) this.pdata[player].hurry_save_img = t;
  }

  remove_hurry(player: string): void {
    player = this.PLAYERS.length === 2 && player === 'rp1' ? 'p2' : player;
    const P = this.POSp[player];
    const s = this.pdata[player].hurry_save_img;
    if (s) this.switch_image_on_background(s, P.left_limit + P.hurry.x, P.hurry.y);
    this.pdata[player].hurry_save_img = null;
  }

  update_lost(player: string): void {
    if (odd(this.frame)) return;
    if (this.sticked_bubbles[player].length) {
      const b = this.sticked_bubbles[player].shift()!;
      this.put_image_to_background(this.bubbles_anim.lose!, --b.x, --b.y);
      if (this.sticked_bubbles[player].length === 0) {
        if (this.graphics_level === 1 && /^lost (.*)/.test(this.gstate) && !this.is_1p_game()) {
          this.put_image_to_background(this.imgbin.win[player === 'p1' ? 'p2' : 'p1'], this.POS.centerpanel.x, this.POS.centerpanel.y);
        }
        if (this.is_1p_game()) {
          this.put_image_to_background(this.imgbin.lose, this.POS.centerpanel.x, this.POS.centerpanel.y);
          this.play_sound('noh');
        }
      }
    }
    if (!this.is_mp_game()) {
      const ev = this.app.events;
      ev.pumpEvents();
      for (let e = ev.pollEvent(); e; e = ev.pollEvent()) {
        if (e.type === QUIT) throw new Die('exit');
        if (e.type === KEYDOWN && e.sym === SDLK.ESCAPE) throw new Die('new_game');
        if (!this.sticked_bubbles[player].length && (e.type === KEYDOWN || e.type === JOYBUTTONUP)) throw new Die('new_game');
      }
    }
    let still = 0;
    for (const q of this.PLAYERS) still += this.sticked_bubbles[q].length;
    if (this.gstate === 'won ' && still === 1) {
      this.put_image(this.imgbin.void_panel, this.MENUPOS.xpos_panel, this.MENUPOS.ypos_panel);
      this.print_('menu', this.app.screen, this.MENUPOS.xpos_panel, this.MENUPOS.ypos_panel + 30, 'Draw game!', this.imgbin.void_panel.w - 20, 'center');
      this.app.flip();
    }
  }

  update_won(player: string): void {
    if (odd(this.frame)) return;
    this.iter_players(() => {
      if (this.p === player) {
        if (this.sticked_bubbles[this.p].length && this.graphics_level > 1) {
          const b = this.sticked_bubbles[this.p].shift()!;
          this.destroy_bubbles(this.p, [b]);
          this.remove_image_from_background(b.img, b.x, b.y);
          for (const n of b.neighbours) {
            if (!member(n, this.sticked_bubbles[this.p])) continue;
            this.put_image_to_background(n.img, n.x, n.y);
          }
        } else {
          this.sticked_bubbles[this.p] = [];
        }
      }
    });
  }

  decode_postgame_message(m: NetMsg): string {
    const player = this.id2p[m.id] ?? 'UNKNOWN';
    const pd = this.pdata[player] ?? ({} as PData);
    const f = /^F(.*)/s.exec(m.msg);
    if (f) { pd.still_game_messages = 0; return `${player} finished ${f[1]}`; }
    if (pd.still_game_messages) return `${player} gamemsg`;
    if (m.msg === 'n') { pd.ready4newgame = 1; return `${player} newgame`; }
    return `${player} other`;
  }
  // ------------------------------------------------------------------------------- mainloop helper

  async update_game(): Promise<void> {
    if (this.gstate === 'game') {
      await this.handle_game_events();
      this.iter_players(() => {
        const p = this.p;
        const pd = this.pdata[p];
        const act = this.actions[p];
        const P = this.POSp[p];
        if (pd.state === 'lost') {
          this.update_lost(p);
        } else if (pd.state === 'ingame') {
          if (act.left) this.angle[p] += LAUNCHER_SPEED;
          if (act.right) this.angle[p] -= LAUNCHER_SPEED;
          if (act.center) {
            if (this.angle[p] >= PI / 2 - LAUNCHER_SPEED && this.angle[p] <= PI / 2 + LAUNCHER_SPEED) this.angle[p] = PI / 2;
            else this.angle[p] += this.angle[p] < PI / 2 ? LAUNCHER_SPEED : -LAUNCHER_SPEED;
          }
          if (this.angle[p] < 0.1) this.angle[p] = 0.1;
          if (this.angle[p] > PI - 0.1) this.angle[p] = PI - 0.1;
          if (this.is_mp_game() && this.is_local_player(p) && (act.left || act.right || act.center)) {
            this.net().gsend(`a${fixed(this.angle[p], 2)}`);
          }
          if (every(this.falling_bubble[p], (b) => b.chaindestx === undefined)) pd.hurry++;
          if ((!this.no_time_limit || this.is_mp_game()) && pd.hurry > this.TIME_HURRY_WARN) {
            const oddness = odd(int((pd.hurry - this.TIME_HURRY_WARN) / (500 / TARGET_ANIM_SPEED)) + 1);
            if (!!pd.hurry_oddness !== oddness) {
              if (oddness) { this.play_sound('hurry'); this.print_hurry(p); } else this.remove_hurry(p);
            }
            pd.hurry_oddness = oddness;
          }

          if (act.mp_fire
              || (this.is_local_player(p)
                && (act.fire || ((!this.no_time_limit || this.is_mp_game()) && pd.hurry === this.TIME_HURRY_MAX))
                && !this.launched_bubble[p]
                && !this.falling_bubble[p].some((b) => b.chaindestx !== undefined)
                && !this.malus_bubble[p].length)) {
            this.play_sound('launch');
            this.launched_bubble[p] = this.tobe_launched[p];
            this.launched_bubble[p]!.direction = this.angle[p];
            this.tobe_launched[p] = null;
            act.fire = 0;
            act.hadfire = 1;
            pd.hurry = 0;
            this.remove_hurry(p);
            if (this.is_local_player(p)) {
              do { pd.nextcolor = int(this.rand.rand(this.bubbles_images.length)); }
              while (!this.validate_nextcolor(pd.nextcolor, p) && this.sticked_bubbles[p].length);
            }
            if (this.is_mp_game()) {
              if (this.is_local_player(p)) this.net().gsend(`f${fixed(this.angle[p], 3)}:${pd.nextcolor}`);
              else act.mp_fire = 0;
            }
          }

          const lb = this.launched_bubble[p];
          if (lb) {
            if (!pd.freezelaunchedbubble) {
              lb.x_old = lb.x;
              lb.y_old = lb.y;
              lb.x += this.BUBBLE_SPEED * cos(lb.direction!);
              lb.y -= this.BUBBLE_SPEED * sin(lb.direction!);
              if (lb.x < P.left_limit) {
                this.play_sound('rebound');
                lb.x = 2 * P.left_limit - lb.x;
                lb.direction! -= 2 * (lb.direction! - PI / 2);
              }
              if (lb.x > P.right_limit - this.BUBBLE_SIZE) {
                this.play_sound('rebound');
                lb.x = 2 * (P.right_limit - this.BUBBLE_SIZE) - lb.x;
                lb.direction! += 2 * (PI / 2 - lb.direction!);
              }
            }
            if (pd.nextcolors === undefined) {
              pd.nextcolors = [];
              for (let i = 0; i <= 7; i++) pd.nextcolors.push(int(this.rand.rand(this.bubbles_images.length)));
            }
            if (act.mp_stick) {
              act.mp_stick = 0;
              this.stick_bubble(lb, pd.stickcx!, pd.stickcy!, p, 1);
              this.launched_bubble[p] = null;
              pd.freezelaunchedbubble = 0;
            } else if (lb.y <= P.top_limit + pd.newrootlevel * this.ROW_SIZE) {
              const [cx, cy] = this.get_array_closest_pos(lb.x, lb.y, p);
              if (this.is_local_player(p)) {
                const col = this.get_bubble_num(lb);
                if (this.is_mp_game()) this.net().gsend(`s${cx}:${cy}:${col}:${pd.nextcolors.join(' ')}`);
                this.stick_bubble(lb, cx, cy, p, 1);
                this.launched_bubble[p] = null;
              } else pd.freezelaunchedbubble = 1;
            } else {
              for (const b of this.sticked_bubbles[p]) {
                if (this.is_collision(lb, b.x, b.y)) {
                  const [cx, cy] = this.get_array_closest_pos((lb.x_old! + lb.x) / 2, (lb.y_old! + lb.y) / 2, p);
                  if (this.is_local_player(p)) {
                    const col = this.get_bubble_num(lb);
                    if (this.is_mp_game()) this.net().gsend(`s${cx}:${cy}:${col}:${pd.nextcolors.join(' ')}`);
                    this.stick_bubble(lb, cx, cy, p, 1);
                    this.launched_bubble[p] = null;
                    // malus generation
                    if (!this.falling_bubble[p].some((x) => x.chaindestx)) {
                      const freeze = 20;
                      if (pd.malus.length > 0 && this.frame > pd.malus[0] + freeze) this.play_sound('malus');
                      while (pd.malus.length > 0 && this.frame > pd.malus[0] + freeze && this.malus_bubble[p].length < 7) {
                        const num = int(this.rand.rand(this.bubbles_images.length));
                        const mb = this.create_bubble_given_img_num(num);
                        mb.num = num;
                        do { mb.cx = int(this.rand.rand(7)); } while (member(mb.cx, this.malus_bubble[p].map((x) => x.cx)));
                        mb.cy = 12;
                        mb.stick_y = -1;
                        for (const s of this.sticked_bubbles[p]) {
                          if (s.cy > mb.stick_y!) {
                            if (s.cx === mb.cx || (odd(s.cy + pd.oddswap) && (s.cx + 1) === mb.cx)) mb.stick_y = s.cy;
                          }
                        }
                        mb.stick_y!++;
                        this.calc_real_pos(mb, p);
                        this.malus_bubble[p].push(mb);
                        this.malus_change(-1, p);
                      }
                      // sort them and shift them
                      this.malus_bubble[p] = [...this.malus_bubble[p]].sort((a, b2) => a.cx - b2.cx);
                      let shifting = 0;
                      for (const mb of this.malus_bubble[p]) mb.y += (shifting += 7) + int(this.rand.rand(20));
                      if (this.is_mp_game()) {
                        for (const mb of this.malus_bubble[p]) this.net().gsend(`m${mb.num}:${mb.cx}:${mb.cy}:${mb.stick_y}`);
                      }
                    }
                  } else pd.freezelaunchedbubble = 1;
                  break;
                }
              }
            }
          }

          if (!this.tobe_launched[p]) this.generate_new_bubble(p, pd.nextcolor);

          if (!act.left && !act.right && !act.hadfire) pd.sleeping++;
          else { pd.sleeping = 0; pd.ping_right.movelatency = -20; }
          if (pd.sleeping > TIMEOUT_PINGUIN_SLEEP && !/wait/.test(pd.ping_right.state)) { pd.ping_right.state = 'wait_to'; pd.ping_right.img = 0; }
          if (pd.sleeping <= TIMEOUT_PINGUIN_SLEEP && /wait/.test(pd.ping_right.state)) pd.ping_right.state = 'normal';
          for (const direction of ['left', 'right']) {
            const pr = pd.ping_right;
            if (pr.state === `${direction}_to` && !act[direction]) {
              pr.state = `${direction}_from`;
              pr.img = this.pinguin[p][pr.state].length - pr.img;
            }
            if (pr.state === direction && !act[direction]) { pr.state = `${direction}_from`; pr.img = 0; }
            if (act[direction]) {
              if (pr.state === `${direction}_to`) { /* animating towards */ }
              else if (pr.state === direction) { /* there */ }
              else if (pr.state === `${direction}_from`) pr.state = direction;
              else { pr.state = `${direction}_to`; pr.img = 0; }
            }
          }
          if (act.hadfire) { pd.ping_right.state = 'action'; pd.ping_right.img = 0; act.hadfire = 0; }
          if (pd.ping_right.img >= this.pinguin[p][pd.ping_right.state].length) pd.ping_right.img = 0;
        }
      });
      this.verify_if_end();

    } else if (/^lost (.*)/.test(this.gstate)) {
      // 1p and 2p game only state
      const loser = /^lost (.*)/.exec(this.gstate)![1];
      this.update_lost(loser);
      if (this.is_2p_game()) this.update_won(loser === 'p1' ? 'p2' : 'p1');

    } else if (/^finished (\S+):(\S+) (\S+)/.test(this.gstate)) {
      const [, supposed_winner_player, supposed_winner_nick, tc] = /^finished (\S+):(\S+) (\S+)/.exec(this.gstate)!;
      let timeout_counter = pnum(tc);
      if (this.playdata) {
        this.gstate = this.recorddata.pdatas!.mp_result!;
        if (this.gstate === 'won ') this.lose(supposed_winner_player); else this.win(supposed_winner_player);
      } else {
        while (this.app.events.pollEvent()) { /* $event->pump while $event->poll */ }
        const msg = this.net().grecv_get1msg_ifdata();
        if (msg) {
          const result = this.decode_postgame_message(msg);
          const fm = /^(\S+) finished (\S+)/.exec(result);
          if (fm) {
            if (fm[2] !== supposed_winner_nick) {
              this.lose(supposed_winner_player);
              this.gstate = 'won ';
            } else if (every(this.PLAYERS, (q) => (this.pdata[q].still_game_messages ?? 0) === 0)) {
              this.win(supposed_winner_player);
              this.gstate = `won ${supposed_winner_player}`;
            }
          } else if (/^(\S+) other/.test(result)) {
            this.pdata[this.id2p[msg.id]].left = 1;
            this.win(supposed_winner_player);
            this.gstate = `won ${supposed_winner_player}`;
          } else if (!/^(\S+) gamemsg/.test(result)) {
            this.net().gdelay_messages(msg);
          }
        } else {
          await this.check_mp_connection();
          timeout_counter++;
          if (timeout_counter > 10 * (1000 / TARGET_ANIM_SPEED)) await this.mp_disconnect_with_reason('', '', '', '', '', 'Lost synchronization 1!');
          else this.gstate = `finished ${supposed_winner_player}:${supposed_winner_nick} ${timeout_counter}`;
        }
      }

    } else if (/^won (.*)/.test(this.gstate)) {
      let events_pumped = false;
      const winner = /^won (.*)/.exec(this.gstate)![1];
      if (this.is_mp_game()) {
        if (winner) this.update_won(winner);
        this.iter_players(() => { if (this.p !== winner) this.update_lost(this.p); });
        await this.check_mp_connection();
        if (pmod(this.frame, 1000 / TARGET_ANIM_SPEED) === 0) this.net().gsend('p');
      }
      if (!winner || this.exploding_bubble[winner].length === 0) {
        let still_needwait = 0;
        this.iter_players(() => { still_needwait += this.sticked_bubbles[this.p].length; });
        if (!still_needwait) {
          const ev = this.app.events;
          ev.pumpEvents();
          events_pumped = true;
          const mp_newgame = async (): Promise<never> => {
            if ((!this.continuegamewhenplayersleave && any(this.PLAYERS, (q) => this.pdata[q].left))
                || (this.continuegamewhenplayersleave && this.notleft_players() <= 1)
                || (this.scorelimit && any(this.PLAYERS, (q) => pnum(this.pdata[q].score) === this.scorelimit))) {
              throw new Die('quit');
            }
            this.net().gsend('n');
            let timeout_counter = 0;
            for (;;) {
              const msg = this.net().grecv_get1msg_ifdata();
              if (msg) {
                const result = this.decode_postgame_message(msg);
                if (/^(\S+) other/.test(result)) {
                  this.pdata[this.id2p[msg.id]].left = 1;
                  if (!this.continuegamewhenplayersleave || this.notleft_players() <= 1) throw new Die('quit');
                }
              }
              let waiting = false;
              this.iter_distant_players(() => { if (!this.pdata[this.p].left && (this.pdata[this.p].ready4newgame ?? 0) === 0) waiting = true; });
              if (!waiting) throw new Die('new_game');
              ev.pumpEvents();
              for (let e = ev.pollEvent(); e; e = ev.pollEvent()) {
                if (e.type === KEYDOWN && e.sym === SDLK.ESCAPE) throw new Die('quit');
              }
              await this.check_mp_connection();
              await this.c.fbdelay(TARGET_ANIM_SPEED);
              this.frame++;
              if (pmod(this.frame, 1000 / TARGET_ANIM_SPEED) === 0) this.net().gsend('p');
              timeout_counter++;
              if (timeout_counter > 10 * (1000 / TARGET_ANIM_SPEED)) await this.mp_disconnect_with_reason('', '', '', '', '', 'Lost synchronization 2!');
            }
          };
          for (let e = ev.pollEvent(); e; e = ev.pollEvent()) {
            if (e.type === QUIT) await this.cleanup_and_exit();
            if (e.type === KEYDOWN && e.sym === SDLK.ESCAPE) throw new Die('quit');
            if (e.type === KEYDOWN || e.type === JOYBUTTONUP) {
              if (this.playdata) throw new Die('quit');
              else if (this.is_mp_game()) await mp_newgame();
              else throw new Die('new_game');
            }
          }
          if (this.is_mp_game()) {
            const msg = this.net().grecv_get1msg_ifdata();
            if (msg) {
              const result = this.decode_postgame_message(msg);
              if (/^(\S+) newgame/.test(result)) await mp_newgame();
              else if (/^(\S+) other/.test(result)) {
                this.pdata[this.id2p[msg.id]].left = 1;
                if (!this.continuegamewhenplayersleave || this.notleft_players() <= 1) throw new Die('quit');
              }
            }
            await this.check_mp_connection();
          }
        }
      }
      if (!events_pumped) {
        const ev = this.app.events;
        ev.pumpEvents();
        for (let e = ev.pollEvent(); e; e = ev.pollEvent()) {
          if (e.type === QUIT) await this.cleanup_and_exit();
          if (e.type === KEYDOWN && e.sym === SDLK.ESCAPE) throw new Die('quit');
        }
      }
    } else {
      throw new Error(`oops unhandled game state (${this.gstate})`);
    }

    if (this.is_mp_game() && pmod(this.frame, 1000 / TARGET_ANIM_SPEED) === 0) this.net().gsend('p');

    // things that need to be updated in all states of the game
    this.iter_players(() => {
      const p = this.p;
      const pd = this.pdata[p];
      const malus_end: Bubble[] = [];
      for (const b of this.malus_bubble[p]) {
        if (!b.freeze) b.y -= MALUS_BUBBLE_SPEED;
        if (this.get_array_yclosest(b.y, p) <= b.stick_y!) {
          if (this.is_local_player(p)) {
            this.real_stick_bubble(b, b.cx, b.stick_y!, p, 0);
            malus_end.push(b);
            if (this.is_mp_game() && this.gstate === 'game') this.net().gsend(`M${b.cx}:${b.stick_y}`);
          } else b.freeze = 1;
        }
        if (b.mp_stick) {
          this.real_stick_bubble(b, b.cx, b.stick_y!, p, 0);
          malus_end.push(b);
        }
      }
      if (malus_end.length) this.malus_bubble[p] = difference2(this.malus_bubble[p], malus_end);

      const falling_end: Bubble[] = [];
      for (const b of this.falling_bubble[p]) {
        if (b.wait_fall) b.wait_fall--;
        else {
          const maxy = this.PLAYERS.length === 2 ? 380 : member(p, ['rp1', 'rp2']) ? 185 : member(p, ['rp3', 'rp4']) ? 415 : 380;
          if (b.chaindestx !== undefined && (b.y > maxy || b.chaingoingup)) {
            const acceleration = this.FREE_FALL_CONSTANT * 3;
            if (!b.chaingoingup) {
              const time_to_zero = b.speed! / acceleration;
              const distance_to_zero = b.speed! * (b.speed! / acceleration + 1) / 2;
              const tobe_sqrted = 1 + 8 / acceleration * (b.y - b.chaindesty! + distance_to_zero);
              if (tobe_sqrted < 0) b.speedx = 0;
              else {
                const time_to_destination = (-1 + Math.sqrt(tobe_sqrted)) / 2;
                if (time_to_zero + time_to_destination === 0) b.speedx = 0;
                else b.speedx = (b.chaindestx - b.x) / (time_to_zero + time_to_destination);
              }
              b.chaingoingup = 1;
            }
            b.speed! -= acceleration;
            b.x += b.speedx!;
            if (Math.abs(b.x - b.chaindestx) < Math.abs(b.speedx!)) { b.x = b.chaindestx; b.speedx = 0; }
            b.y += b.speed!;
            if (b.y < b.chaindesty!) falling_end.push(b);
          } else {
            b.y += b.speed!;
            b.speed! += this.FREE_FALL_CONSTANT;
          }
        }
        if (b.y > 470 && b.chaindestx === undefined) falling_end.push(b);
      }
      if (falling_end.length) this.falling_bubble[p] = difference2(this.falling_bubble[p], falling_end);
      for (const b of falling_end) {
        if (b.chaindestx === undefined) continue;
        this.chains[p].falling_chained = difference2(this.chains[p].falling_chained, [b]);
        this.chains[p].chained_bubbles.delete(b);
        this.stick_bubble(b, b.chaindestcx!, b.chaindestcy!, p, 0);
      }

      const exploding_end: Bubble[] = [];
      for (const b of this.exploding_bubble[p]) {
        b.x += b.speedx!;
        b.y += b.speedy!;
        b.speedy! += this.FREE_FALL_CONSTANT;
        if (b.y > 470) exploding_end.push(b);
      }
      if (exploding_end.length) {
        this.exploding_bubble[p] = difference2(this.exploding_bubble[p], exploding_end);
        if (!this.exploding_bubble[p].length && !this.sticked_bubbles[p].length) {
          const lm = /^lost (.*)/.exec(this.gstate);
          if (lm && p !== lm[1] && !this.is_1p_game()) this.put_image(this.imgbin.win[p], this.POS.centerpanel.x, this.POS.centerpanel.y);
          const wm = /^won (.*)/.exec(this.gstate);
          if (this.is_mp_game() && wm) {
            const winner = wm[1];
            const img = winner === 'p1' ? this.imgbin.win_panel_p1_net : this.PLAYERS.length === 2 ? this.imgbin.win.rp3 : this.imgbin.win[winner];
            this.put_image(img, this.POS.centerpanel.x, this.POS.centerpanel.y);
            this.print_('ingame', this.app.screen, 264, 300, this.pdata[winner]?.nick ?? '', 198, 'center');
            let xpos = this.PLAYERS.length <= 3 ? 352 : this.PLAYERS.length === 4 ? 348 : 322;
            this.iter_players_(() => {
              if (this.p_ !== winner) {
                const img2 = this.PLAYERS.length === 2 && this.p_ === 'rp1' ? this.imgbin.net_lose.rp3 : this.imgbin.net_lose[this.p_];
                this.put_image(img2, xpos, 264);
                xpos += 32;
              }
            });
          }
        }
      }

      const pr = pd.ping_right;
      if (member(pr.state, ['action', 'right_to', 'right_from', 'left_to', 'left_from', 'wait_to', 'wait', 'win', 'lose_to', 'lose'])) {
        pr.img++;
        if (pr.img === this.pinguin[p][pr.state].length) {
          if (pr.state === 'right_to') pr.state = 'right';
          else if (pr.state === 'left_to') pr.state = 'left';
          else if (pr.state === 'wait_to') pr.state = 'wait';
          else if (pr.state === 'wait' || pr.state === 'win' || pr.state === 'lose') { /* loops */ }
          else if (pr.state === 'lose_to') pr.state = 'lose';
          else pr.state = 'normal';
          pr.img = 0;
        }
      }
    });
  }

  // ------------------------------------------------------------------------------- init stuff

  init_step = 0;
  print_step(_txt: string): void {
    const ev = this.app.events;
    ev.pumpEvents();
    for (let e = ev.pollEvent(); e; e = ev.pollEvent()) {
      if (e.type === QUIT || (e.type === KEYDOWN && e.sym === SDLK.ESCAPE)) throw new Die('exit');
    }
    this.put_image(this.imgbin.loading_step, 100 + this.init_step * 12, 10);
    if (this.init_step === 0) for (let i = 1; i <= 11; i++) this.put_image(this.imgbin.loading_step_initial, 100 + i * 12, 10);
    this.app.flip();
    this.init_step++;
  }

  levelsetText(name: string): string | null {
    if (name === 'data/levels') return new TextDecoder().decode(this.host.data.file('data/levels'));
    return this.host.home.read(name);
  }

  load_levelset(name: string): void {
    const text = this.levelsetText(name);
    if (text === null) throw new Error(`No such levelset (${name}).`);
    this.loaded_levelset = name;
    let row = 0;
    const cur = this.levels.current;
    this.levels = { current: cur, sets: new Map() };
    this.lev_number = 1;
    for (const line of splitLines(text)) {
      if (!/\S/.test(line)) {
        if (row) { this.lev_number++; row = 0; }
      } else {
        let col = 0;
        for (const tok of line.trim().split(/\s+/)) {
          if (!/-/.test(tok)) {
            if (!this.levels.sets.has(this.lev_number)) this.levels.sets.set(this.lev_number, []);
            this.levels.sets.get(this.lev_number)!.push({ cx: col, cy: row, img_num: tok });
          }
          col++;
        }
        row++;
      }
    }
  }

  async init_game(): Promise<void> {
    this.app.events.unicode = true;
    this.platformShowCursor(false);
    this.apprects.main = new Rect(0, 0, 640, 480);
    this.frame = 0;
    this.imgbin.loading = this.add_image('loading.png');
    this.put_image(this.imgbin.loading, 10, 10);
    this.app.flip();
    this.imgbin.loading_step = this.add_image('loading_step.png');
    this.imgbin.loading_step_initial = this.add_image('loading_step_initial.png');

    this.print_step('[Graphics');
    this.imgbin.back_2p = this.host.data.image('gfx/backgrnd.png');
    this.imgbin.back_1p = this.host.data.image('gfx/back_one_player.png');
    this.imgbin.back_mp = this.host.data.image('gfx/back_multiplayer.png');
    this.background = newSurface(640, 480, 32, true);
    this.background.name = 'background';
    this.background_orig = newSurface(640, 480, 32, true);
    this.background_orig.name = 'background_orig';

    for (let ball = 1; ball <= 8; ball++) {
      const img = this.add_bubble_image(`balls/bubble-${this.colourblind ? 'colourblind-' : ''}${ball}.gif`);
      this.img_mini.set(img, this.add_image(`balls/bubble-${this.colourblind ? 'colourblind-' : ''}${ball}-mini.png`));
    }
    this.bubbles_anim.white = this.add_image('balls/bubble_prelight.png');
    this.img_mini.set(this.bubbles_anim.white, this.add_image('balls/bubble_prelight-mini.png'));
    this.bubbles_anim.lose = this.add_image('balls/bubble_lose.png');
    this.img_mini.set(this.bubbles_anim.lose, this.add_image('balls/bubble_lose-mini.png'));
    this.bubbles_anim.on_top_next = this.add_image('on_top_next.png');
    this.img_mini.set(this.bubbles_anim.on_top_next, this.add_image('on_top_next-mini.png'));
    for (let step = 0; step <= 6; step++) {
      const img = this.add_image(`balls/stick_effect_${step}.png`);
      this.bubbles_anim.stick.push(img);
      this.img_mini.set(img, this.add_image(`balls/stick_effect_${step}-mini.png`));
    }

    this.shooter_lowgfx = this.add_image('shooter-lowgfx.png');
    const shooter = this.add_image('shooter.png');
    const shooter_mini = this.add_image('shooter-mini.png');
    for (let number = -CANON_ROTATIONS_NB; number <= CANON_ROTATIONS_NB; number++) {
      const angle = number * (PI / 2) / CANON_ROTATIONS_NB;
      for (const [imgKey, dataKey, src] of [['img', 'data', shooter], ['img_mini', 'data_mini', shooter_mini]] as const) {
        const tmp = newSurface(src.w, src.h, 32);
        this.c.rotateBicubic(tmp, src, angle);
        const data = this.c.autopseudocrop(tmp);
        this.canon[dataKey].set(number, data);
        const replace = newSurface(data[2], data[3], 32);
        setAlpha(tmp, 0, 0);
        blitSurface(tmp, new Rect(data[0], data[1], data[2], data[3]), replace, null);
        this.canon[imgKey].set(number, replace);
        this.add_default_rect(replace);
      }
      if (number === -CANON_ROTATIONS_NB / 2 || number === 0 || number === CANON_ROTATIONS_NB / 2) {
        this.print_step('.');
        await this.app.delay(0);
      }
    }

    this.print_step('.');
    this.malus_gfx.banane = this.add_image('banane.png');
    this.img_mini.set(this.malus_gfx.banane, this.add_image('banane-mini.png'));
    this.malus_gfx.tomate = this.add_image('tomate.png');
    this.img_mini.set(this.malus_gfx.tomate, this.add_image('tomate-mini.png'));

    const ib = this.imgbin;
    ib.back_paused = this.add_image('back_paused.png');
    ib.paused = [];
    for (let i = 1; i <= 35; i++) ib.paused.push(this.add_image(`pause_00${String(i).padStart(2, '0')}.png`));
    ib.lose = this.add_image('lose_panel.png');
    ib.progress_red = this.add_image('dot_red.png');
    ib.progress_green = this.add_image('dot_green.png');
    ib.win_panel_1player = this.add_image('win_panel_1player.png');
    ib.win_panel_p1_net = this.add_image('win_panel_p1_net.png');
    ib.compressor_main = this.add_image('compressor_main.png');
    ib.compressor_ext = this.add_image('compressor_ext.png');

    ib.back_menu = this.host.data.image('gfx/menu/back_start.png');
    ib.stamp = this.add_image('menu/stamp.png');
    ib.menu_closedeye_green_left = this.add_image('menu/backgrnd-closedeye-left-green.png');
    ib.menu_closedeye_green_right = this.add_image('menu/backgrnd-closedeye-right-green.png');
    ib.menu_closedeye_purple_left = this.add_image('menu/backgrnd-closedeye-left-purple.png');
    ib.menu_closedeye_purple_right = this.add_image('menu/backgrnd-closedeye-right-purple.png');
    ib.menu_logo = this.add_image('menu/fblogo.png');
    ib.menu_logo_mask = this.add_image('menu/fblogo-mask.png');
    for (const t of ['1pgame', '2pgame', 'netgame', 'langame', 'editor', 'keys', 'graphics', 'highscores']) {
      ib[`txt_${t}_off`] = this.add_image(`menu/txt_${t}_off.png`);
      ib[`txt_${t}_over`] = this.add_image(`menu/txt_${t}_over.png`);
    }
    ib.void_panel = this.add_image('menu/void_panel.png');
    ib['1p_panel'] = this.add_image('menu/1p_panel.png');
    ib.void_chat = this.add_image('void_chat.png');
    ib.void_chat_small_p2 = this.add_image('void_chat_small_p2.png');
    ib.void_chat_small_rp1_rp3 = this.add_image('void_chat_small_rp1_rp3.png');
    ib.void_chat_small_rp2_rp4 = this.add_image('void_chat_small_rp2_rp4.png');
    ib.void_mp_training = this.add_image('void_mp_training.png');
    ib.ping_low = this.add_image('menu/ping-low.png');
    ib.ping_mid = this.add_image('menu/ping-mid.png');
    ib.ping_high = this.add_image('menu/ping-high.png');
    const seq = (prefix: string, from: number, to: number): Surface[] => {
      const out: Surface[] = [];
      for (let i = from; i <= to; i++) out.push(this.add_image(`${prefix}${String(i).padStart(4, '0')}.png`));
      return out;
    };
    ib.menu_cursor = {
      '1pgame': seq('menu/anims/1pgame_', 1, 30),
      '2pgame': seq('menu/anims/p1p2_', 1, 30),
      langame: seq('menu/anims/langame_', 1, 70),
      netgame: seq('menu/anims/netgame_', 1, 89),
      editor: seq('menu/anims/editor_', 1, 67),
      graphics3: seq('menu/anims/gfx-l1_', 1, 30),
      graphics2: seq('menu/anims/gfx-l2_', 1, 30),
      graphics1: [this.add_image('menu/anims/gfx-l3_0001.png')],
      keys: seq('menu/anims/keys_', 1, 80),
      highscores: seq('menu/anims/highscore_', 1, 89),
    };
    // the hash keys' order of %{$imgbin{menu_cursor}} does not matter: each type gets its alpha list
    for (const type of Object.keys(ib.menu_cursor)) {
      const alphas: Surface[] = [];
      for (const img of ib.menu_cursor[type] as Surface[]) {
        const alpha = newSurface(img.w, img.h, 32);
        setAlpha(img, 0, 0);
        blitSurface(img, null, alpha, null);
        this.c.alphaize(alpha);
        alphas.push(alpha);
        setAlpha(img, SRCALPHA, 0);
      }
      ib.menu_cursor[`${type}alpha`] = alphas;
    }
    ib.left_rp1 = this.add_image('left-rp1.png');
    for (const q of ['rp1', 'rp2', 'rp3', 'rp4']) ib[`left_${q}_mini`] = this.add_image(`left-${q}-mini.png`);
    ib.highlight_server = this.add_image('menu/highlight-server.png');

    ib.banner_artwork = this.add_image('menu/banner_artwork.png');
    ib.banner_soundtrack = this.add_image('menu/banner_soundtrack.png');
    ib.banner_cpucontrol = this.add_image('menu/banner_cpucontrol.png');
    ib.banner_leveleditor = this.add_image('menu/banner_leveleditor.png');

    this.MENUPOS.xpos_panel = (640 - ib.void_panel.w) / 2;
    this.MENUPOS.ypos_panel = (480 - ib.void_panel.h) / 2;

    ib.txt_1pmenu_off = this.add_image('menu/txt_menu_1p_off.png');
    ib.txt_1pmenu_over = this.add_image('menu/txt_menu_1p_over.png');
    for (const n of ['play_all_levels', 'pick_start_level', 'play_random_levels']) {
      ib[`txt_1pmenu_${n}_text`] = this.add_image(`menu/txt_${n}_text.png`);
      ib[`txt_1pmenu_${n}_outlined_text`] = this.add_image(`menu/txt_${n}_outlined_text.png`);
    }
    ib.txt_1pmenu_mp_train_text = this.add_image('menu/txt_multiplayer_training_text.png');
    ib.txt_1pmenu_mp_train_outlined_text = this.add_image('menu/txt_multiplayer_training_outlined_text.png');

    ib.back_netgame = this.add_image('back_netgame.png');

    ib.back_hiscores = this.add_image('back_hiscores.png');
    ib.hiscore_frame = this.add_image('hiscore_frame.png');
    ib.hiscore_levelset = this.add_image('hiscore-levelset.png');
    ib.hiscore_mptraining = this.add_image('hiscore-mptraining.png');

    const savePlayers = this.PLAYERS;
    this.PLAYERS = [...ALL_PLAYERS];
    try {
      ib.hurry = {}; ib.win = {}; ib.net_lose = {}; ib.attack = {}; ib.attackme = {};
      for (const p of ALL_PLAYERS) {
        this.p = p;
        this.print_step('.');
        await this.app.delay(0);
        ib.hurry[p] = this.add_image(`hurry_${p}.png`);
        ib.win[p] = this.add_image(`win_panel_${p}.png`);
        if (p !== 'p2') ib.net_lose[p] = this.add_image(`net_lose_${p}.png`);
        if (/^r/.test(p)) {
          ib.attack[p] = this.add_image(`attack_${p}.png`);
          ib.attackme[p] = this.add_image(`attackme_${p}.png`);
        }
        this.pdata[p].score = 0;
        const n = (i: number): string => String(i).padStart(4, '0');
        const pg = (kind: string, from: number, to: number, rev = false): Surface[] => {
          const out: Surface[] = [];
          for (let i = from; i <= to; i++) out.push(this.add_image(`pinguins/${kind}_${p}_${n(i)}.png`));
          return rev ? out.reverse() : out;
        };
        this.pinguin[p] = {
          normal: pg('anime-shooter', 20, 20),
          action: pg('anime-shooter', 21, 50),
          left_to: pg('anime-shooter', 2, 19, true),
          left: pg('anime-shooter', 1, 1),
          left_from: pg('anime-shooter', 2, 19),
          right_to: pg('anime-shooter', 51, 70),
          right: pg('anime-shooter', 71, 71),
          right_from: pg('anime-shooter', 51, 71, true),
          wait_to: pg('wait', 1, 74),
          wait: pg('wait', 75, 97),
          win: pg('win', 1, 68),
          lose_to: pg('loose', 1, 64),
          lose: pg('loose', 65, 158),
        };
      }
    } finally {
      this.PLAYERS = savePlayers;
      this.p = 'p1';
    }

    this.print_step('] ');

    if (this.mixer === 'SOUND_DISABLED') {
      this.mixer_enabled = 0;
      this.mixer = 0;
    } else if (this.mixer_enabled === undefined || this.mixer_enabled) {
      this.mixer_enabled = this.init_sound();
    }

    // the RGBA effects algorithms assume little endian RGBA surfaces
    const replace = newSurface(ib.menu_logo.w, ib.menu_logo.h, 32);
    setAlpha(ib.menu_logo, 0, 0);
    blitSurface(ib.menu_logo, null, replace, null);
    ib.menu_logo = replace;
    this.add_default_rect(replace);

    this.lev_number = 0;
    this.load_levelset('data/levels');

    this.c.initEffects(this.host.data.file('data/plasma.raw'));
    this.addicted_time = 0;
    this.start_time = 0;
  }

  open_level(level: number | string): void {
    if (level === 'WON') level = this.lev_number;
    const lv = this.levels.sets.get(pnum(level));
    if (!lv) throw new Error(`No such level or void level (${level}).`);
    for (const l of lv) {
      this.iter_players(() => {
        const img = /^\d+$/.test(l.img_num) ? this.bubbles_images[pnum(l.img_num)] : this.bubbles_anim.lose!;
        this.real_stick_bubble(this.create_bubble_given_img(img), l.cx, l.cy, this.p, 0);
      });
    }
  }

  async grab_key(): Promise<Key> {
    let keyp: Key | undefined;
    do {
      const e = await this.app.events.waitEvent();
      if (e.type === KEYDOWN) keyp = e.sym;
    } while (keyp === undefined);
    if (keyp === SDLK.LSHIFT || keyp === SDLK.RSHIFT) return this.grab_key();
    return keyp;
  }
  platformShowCursor(on: boolean): void { this.app.platform.showCursor(on); }

  async display_highscores(type?: string, new_entry?: Record<string, PValue>): Promise<void> {
    this.display_on_app_disabled = 1;
    this.PLAYERS = ['p1'];
    this.POS = POS_1P;
    const ib = this.imgbin;
    if (type === 'levels' || type === undefined) {
      blitSurface(ib.back_hiscores, this.apprects.main, this.app.screen, this.apprects.main);
      this.put_image(ib.hiscore_levelset, 640 - 10 - ib.hiscore_levelset.w, 8);
      const initial_high_posx = 90;
      let high_posx = initial_high_posx, high_posy = 68;
      const P = this.POSp.p1;
      const high_rect = new Rect(P.left_limit & 0xfffffffc, P.top_limit & 0xfffffffc, (P.right_limit - P.left_limit) & 0xfffffffc,
        (P.initial_bubble_y - P.top_limit - 10) & 0xfffffffc);
      const centered_print = (x: number, y: number, txt: string, bold: boolean): void => {
        this.print_(bold ? 'bold_menu' : 'menu', this.app.screen, x, y + ib.hiscore_frame.h - 8, txt, ib.hiscore_frame.w + 12, 'center');
      };
      const old_levelset = this.loaded_levelset;
      for (const high of this.ordered_highscores()) {
        this.sticked_bubbles.p1 = [];
        this.root_bubbles.p1 = [];
        this.pdata.p1.newrootlevel = 0;
        this.pdata.p1.oddswap = 0;
        blitSurface(ib.back_1p, high_rect, this.background, high_rect);
        if (!high.piclevel) {
          if (this.loaded_levelset !== 'data/levels') this.load_levelset('data/levels');
          if (pnum(high.level as number) > this.lev_number) this.open_level(this.lev_number); else this.open_level(high.level as number | string);
        } else {
          if (this.loaded_levelset !== 'highlevelshistory') this.load_levelset('highlevelshistory');
          this.open_level(high.piclevel as number);
        }
        this.put_image(ib.hiscore_frame, high_posx - 7, high_posy - 6);
        const tmp = displayFormat(newSurface(high_rect.w / 4, high_rect.h / 4, 32, true), this.app.screen);
        this.c.shrink(tmp, displayFormatInPlace(this.background, this.app.screen), 0, 0, high_rect, 4);
        blitSurface(tmp, null, this.app.screen, new Rect(high_posx, high_posy));
        const isNew = new_entry === high;
        centered_print(high_posx - 15, high_posy, pstr(high.name as string), isNew);
        centered_print(high_posx - 15, high_posy + 20, high.level === 'WON' ? 'won!' : `level ${pstr(high.level as number)}`, isNew);
        const min = int(pnum(high.time as number) / 60);
        let sec = String(int(pnum(high.time as number) - min * 60));
        if (sec.length === 1) sec = `0${sec}`;
        centered_print(high_posx - 15, high_posy + 40, `${min}'${sec}"`, isNew);
        high_posx += 98;
        if (high_posx > 550) { high_posx = initial_high_posx; high_posy += 175; }
        if (high_posy > 440) break;
      }
      this.load_levelset(old_levelset);
      this.app.flip();
      while (this.app.events.pollEvent()) { /* drain */ }
      if (await this.grab_key() === SDLK.ESCAPE) { this.display_on_app_disabled = 0; return; }
    }

    if ((type === 'mptrain' || type === undefined) && (this.HISCORES_MPTRAIN.length || this.HISCORES_MPTRAIN_CHAINREACTION.length)) {
      blitSurface(ib.back_hiscores, this.apprects.main, this.app.screen, this.apprects.main);
      this.put_image(ib.hiscore_mptraining, 640 - 10 - ib.hiscore_mptraining.w, 8);
      const table = (title: string, tx: number, rankx: number, namex: number, list: Record<string, PValue>[]): void => {
        this.print_('menu', this.app.screen, tx, 50, title, 320, 'center');
        let y = 80, counter = 1;
        let lastvalue: PValue | undefined;
        for (const high of list) {
          const font = new_entry === high ? 'bold_menu' : 'menu';
          if (pstr(high.score as number) !== pstr(lastvalue as number)) this.print_(font, this.app.screen, rankx, y, `${counter}. `, 40, 'right');
          this.print_(font, this.app.screen, namex, y, `${pstr(high.name as string)}: ${pstr(high.score as number)}`, 150);
          y += this.smg_lineheight + 2;
          counter++;
          lastvalue = high.score;
        }
      };
      table('Regular', 0, 80, 120, this.ordered_mptrain_highscores());
      table('Chain-reaction enabled', 320, 420, 460, this.ordered_mptrain_highscores_chainreaction());
      this.app.flip();
      while (this.app.events.pollEvent()) { /* drain */ }
      if (await this.grab_key() === SDLK.ESCAPE) throw new Die('quit');
    }
    this.display_on_app_disabled = 0;
  }

  keysym_to_char(key: Key): string {
    for (const [name, v] of KEYSYMS) if (pstr(key) === pstr(v)) return name.toUpperCase();
    const k = pnum(key);
    if (k >= 160 && k <= 255) return `WORLD_${k - 160}`;
    return '';
  }

  async ask_from(w: { intro: string[]; entries: { q?: string; a?: (v: Key | string) => void; f?: string; answer?: Key | string }[]; outro: string; erase_background?: Surface }): Promise<number> {
    const ib = this.imgbin;
    const MP = this.MENUPOS;
    this.put_image(ib.void_panel, MP.xpos_panel, MP.ypos_panel);
    let ypos = MP.ypos_panel + 12;
    const lineheight = 18;
    const xpos = { questions: MP.xpos_panel, echo: MP.xpos_panel + ib.void_panel.w * 2 / 3 };
    for (const i of w.intro) {
      if (i) this.print_('menu', this.app.screen, MP.xpos_panel, ypos, i, ib.void_panel.w, 'center');
      ypos += lineheight;
    }
    ypos += 10;
    let ok = 1;
    const ev = this.app.events;
    ev.enableKeyRepeat(200, 50);
    entries: for (const entry of w.entries) {
      // in case wrapping occurred
      blitSurface(ib.void_panel, new Rect(10, ypos - MP.ypos_panel, ib.void_panel.w - 20, 30), this.app.screen, new Rect(MP.xpos_panel + 10, ypos));
      this.print_('menu', this.app.screen, xpos.questions, ypos, entry.q ?? '', ib.void_panel.w * 2 / 3 - 10, w.entries.length === 1 ? 'center' : 'right');
      this.app.flip();
      const srect = new Rect(xpos.echo - 3 - MP.xpos_panel, ypos - MP.ypos_panel, ib.void_panel.w * 1 / 3, 30);
      const drect = new Rect(xpos.echo - 3, ypos);
      const x_echo = xpos.echo;
      let txt: Key | string | undefined;
      if (entry.f !== 'SPACE') {
        if (entry.f === 'ONE_CHAR') {
          let k: Key | undefined;
          while (k === undefined) k = await this.grab_key();
          if (!this.no_echo) this.play_sound('typewriter');
          if (k === SDLK.ESCAPE) { ok = 0; break entries; }
          txt = k;
          const shown = this.keysym_to_char(k);
          this.print_('menu', this.app.screen, x_echo, ypos, shown, 100, 'left');
        } else {
          this.callback_entry('reset');
          main: for (;;) {
            if (this.callback_entry('ping').length) {
              blitSurface(ib.void_panel, srect, this.app.screen, drect);
              this.callback_entry('print', { xpos: x_echo, ypos, maxlen: 100, font: 'menu' });
            }
            this.app.flip();
            ev.pumpEvents();
            for (let e = ev.pollEvent(); e; e = ev.pollEvent()) {
              if (e.type === KEYDOWN) {
                const k = e.sym;
                if (k === SDLK.ESCAPE) { ok = 0; break entries; }
                else if (k === SDLK.RETURN || k === SDLK.KP_ENTER) { txt = this.callback_entry('gettext').join(''); break main; }
                else {
                  await this.callback_entry_async('keypressed', { event: e, maxlen: 100, font: 'menu' });
                  blitSurface(ib.void_panel, srect, this.app.screen, drect);
                  this.callback_entry('moved');
                  this.callback_entry('print', { xpos: x_echo, ypos, maxlen: 100, font: 'menu' });
                }
              }
            }
            await this.c.fbdelay(TARGET_ANIM_SPEED);
          }
        }
      }
      entry.answer = txt;
      ypos += entry.f === 'SPACE' ? lineheight / 2 : lineheight;
    }
    ev.enableKeyRepeat(0, 0);
    if (ok) {
      for (const e of w.entries) e.a?.(e.answer as Key);
      this.print_('menu', this.app.screen, MP.xpos_panel, MP.ypos_panel + ib.void_panel.h - 35, w.outro, ib.void_panel.w, 'center');
      this.app.flip();
      this.play_sound('menu_selected');
      await this.app.sleep(2);
    } else this.play_sound('cancel');
    if (w.erase_background) this.erase_image_from(ib.void_panel, MP.xpos_panel, MP.ypos_panel, w.erase_background);
    this.app.flip();
    while (ev.pollEvent()) { /* drain */ }
    return ok;
  }

  async new_game(): Promise<number> {
    const ticks = { v: this.app.ticks() };
    this.display_on_app_disabled = 1;
    this.TIME_APPEARS_NEW_ROOT = 11;
    this.TIME_HURRY_WARN = 250;
    this.TIME_HURRY_MAX = 375;
    for (const p of ALL_PLAYERS) this.current_chat_messages[p] = null;

    let backgr: Surface;
    if (this.is_mp_game()) {
      if (this.pdata.p1.chatting) this.cleanup_chatting();
      if (this.PLAYERS.length === 2) { backgr = this.imgbin.back_2p; this.POS = POS_2P; } else { backgr = this.imgbin.back_mp; this.POS = POS_MP; }
      this.inconsistency = 0;
    } else if (this.is_2p_game()) {
      backgr = this.imgbin.back_2p;
      this.POS = POS_2P;
    } else if (this.is_1p_game()) {
      backgr = this.imgbin.back_1p;
      this.POS = POS_1P;
      if (this.levels.current === 'mp_train') this.pdata[this.PLAYERS[0]].score = 0;
      else {
        if (this.levels.current !== 'random') this.chainreaction = 0;
        this.TIME_APPEARS_NEW_ROOT = 8;
        this.TIME_HURRY_WARN = 400;
        this.TIME_HURRY_MAX = 525;
        this.pdata[this.PLAYERS[0]].score = this.levels.current as number | string;
      }
    } else throw new Error('oops');

    blitSurface(backgr, this.apprects.main, this.background_orig, this.apprects.main);
    if (this.levels.current === 'mp_train') {
      blitSurface(this.imgbin.void_mp_training, this.rects.get(this.imgbin.void_mp_training) ?? null, this.background_orig, new Rect(32, 152));
    }
    blitSurface(this.background_orig, this.apprects.main, this.background, this.apprects.main);

    this.iter_players(() => {
      const p = this.p;
      this.actions[p] = { left: 0, right: 0, fire: 0, center: 0 };
      this.angle[p] = PI / 2;
      this.sticked_bubbles[p] = [];
      this.malus_bubble[p] = [];
      this.root_bubbles[p] = [];
      this.falling_bubble[p] = [];
      this.exploding_bubble[p] = [];
      const pd = this.pdata[p];
      delete pd.nextcolors;
      this.chains[p] = { falling_chained: [], chained_bubbles: new Map() };
      this.launched_bubble[p] = null;
      this.sticking_bubble[p] = null;
      pd.newroot = 0; pd.newroot_prelight = 0; pd.oddswap = 0; pd.hurry = 0; pd.newrootlevel = 0;
      pd.malus = [];
      pd.state = 'ingame';
      pd.ping_right.img = 0;
      pd.ping_right.state = 'normal';
      pd.hurry_save_img = null;
      const P = this.POSp[p];
      this.apprects[p] = new Rect(P.left_limit, P.top_limit, P.right_limit - P.left_limit, P.initial_bubble_y - P.top_limit);
      if (this.is_distant_player(p) && !pd.left) {
        pd.still_game_messages = 1;
        pd.ready4newgame = 0;
      }
    });

    this.print_scores(this.background);
    if (this.levels.current === 'mp_train') this.mp_train_print_time();

    this.iter_players(() => {
      const p = this.p;
      delete this.pdata[p].newrootlast;
      if (this.pdata[p].left) {
        this.put_image_to_background(this.mini_graphics(p) ? this.imgbin[`left_${p}_mini`] : this.imgbin.left_rp1, this.POSp[p].left!.x, this.POSp[p].left!.y);
        this.pdata[p].state = 'left';
      } else this.handle_progress(p);
    });

    if (this.is_1p_game()) this.print_compressor();

    if (!this.playdata) {
      this.recorddata = {};
      const srand = this.app.ticks();
      this.rand.srand(srand);
      this.recorddata.data = [{ srand }];
    }
    if (/^\d+$/.test(pstr(this.levels.current))) {
      this.open_level(this.levels.current!);
    } else {
      for (let cy = 0; cy <= 4; cy++) {
        for (let cx = 0; cx <= 6 + evenn(cy); cx++) {
          let num = int(this.rand.rand(this.bubbles_images.length));
          if (this.is_mp_game()) {
            if (!this.playdata) {
              await this.check_mp_connection();
              try { num = await this.mp_propagate(`b|${cx}|${cy}`, num, ticks); } catch (e) { if (isDie(e, 'quit')) return 0; throw e; }
              ((this.recorddata.data![0].bubbles ??= []) as number[]).push(num);
            } else num = this.recorddata.pdatas!.bubbles!.shift()!;
          }
          const b = this.create_bubble_given_img_num(num);
          this.real_stick_bubble(b, cx, cy, this.PLAYERS[0], 0);
          if (!this.is_1p_game()) {
            this.iter_players_but_first(() => {
              if (!this.pdata[this.p].left) this.real_stick_bubble(this.create_bubble_given_img(b.img), cx, cy, this.p, 0);
            });
          }
        }
      }
    }

    let next_num: number, tobe_num: number;
    do { next_num = int(this.rand.rand(this.bubbles_images.length)); } while (!this.validate_nextcolor(next_num, this.PLAYERS[0]));
    do { tobe_num = int(this.rand.rand(this.bubbles_images.length)); } while (!this.validate_nextcolor(tobe_num, this.PLAYERS[0]));
    if (this.is_mp_game()) {
      if (!this.playdata) {
        await this.check_mp_connection();
        try {
          next_num = await this.mp_propagate('N', next_num, ticks);
          tobe_num = await this.mp_propagate('T', tobe_num, ticks);
        } catch (e) { if (isDie(e, 'quit')) return 0; throw e; }
        (this.recorddata.data![0].bubbles as number[]).push(next_num, tobe_num);
      } else {
        next_num = this.recorddata.pdatas!.bubbles!.shift()!;
        tobe_num = this.recorddata.pdatas!.bubbles!.shift()!;
      }
    }
    this.next_bubble[this.PLAYERS[0]] = this.create_bubble_given_img_num(next_num);
    this.generate_new_bubble(this.PLAYERS[0], tobe_num);
    if (!this.is_1p_game()) {
      this.iter_players_but_first(() => {
        if (!this.pdata[this.p].left) {
          this.next_bubble[this.p] = this.create_bubble_given_img_num(next_num);
          this.generate_new_bubble(this.p, tobe_num);
        }
      });
    }

    if (this.graphics_level === 1) {
      blitSurface(this.background, this.apprects.main, this.app.screen, this.apprects.main);
      this.app.flip();
    } else {
      await this.c.effect(this.app.screen, displayFormatInPlace(this.background, this.app.screen));
    }

    this.display_on_app_disabled = 0;
    while (this.app.events.pollEvent()) { /* drain */ }
    this.gstate = 'game';
    this.direct = 0;

    if (this.is_mp_game() && !this.playdata) {
      this.mp_ping_if_needed(ticks);
      // 1. first wait on a common barrier with others
      this.net().gsend('n');
      await this.check_mp_connection();
      this.iter_distant_players(() => { this.pdata[this.p].barrier4newgame = 0; });
      const keep: NetMsg[] = [];
      for (;;) {
        let m: NetMsg;
        try { m = await this.net().grecv_get1msg(); } catch (e) { if (isDie(e, 'quit')) return 0; throw e; }
        this.mp_ping_if_needed(ticks);
        if (m.msg === 'n') {
          this.pdata[this.id2p[m.id]].barrier4newgame = 1;
          let waiting = false;
          this.iter_distant_players(() => { if (!this.pdata[this.p].left && this.pdata[this.p].barrier4newgame === 0) waiting = true; });
          if (!waiting) break;
        } else keep.push(m);
      }
      // 2. a unique synchro message, the leader and others all wait on it
      if (this.is_leader()) this.net().gsend('!');
      await this.check_mp_connection();
      for (;;) {
        let m: NetMsg;
        try { m = await this.net().grecv_get1msg(); } catch (e) { if (isDie(e, 'quit')) return 0; throw e; }
        this.mp_ping_if_needed(ticks);
        if (m.msg === '!') break;
        keep.push(m);
      }
      this.net().gdelay_messages(...keep);
      this.attackingme = [];
    }

    this.start_time = this.app.ticks();
    return 1;
  }

  async choose_1p_game_mode(): Promise<number> {
    const ib = this.imgbin;
    const MP = this.MENUPOS;
    const ordered = ['play_all_levels', 'pick_start_level', 'play_random_levels', 'mp_train'];
    let active = 0;
    const menu_xpos = MP.xpos_panel + (ib['1p_panel'].w - ib.txt_1pmenu_over.w) / 2;
    const menu_ypos = MP.ypos_panel + 90;
    const spacer = ib.txt_1pmenu_over.h + 4;
    const name2ypos: Record<string, number> = {
      play_all_levels: menu_ypos, pick_start_level: menu_ypos + spacer, play_random_levels: menu_ypos + 2 * spacer, mp_train: menu_ypos + 3 * spacer,
    };
    let overlook_index = 0;
    const overlook = newSurface(ib.txt_1pmenu_pick_start_level_text.w, ib.txt_1pmenu_pick_start_level_text.h, 32);
    const redraw = (): void => {
      const draw_element = (name: string, mode: string): void => {
        this.put_image(ib[`txt_1pmenu_${mode}`], menu_xpos, name2ypos[name]);
        blitSurface(ib[`txt_1pmenu_${name}_outlined_text`], null, this.app.screen, new Rect(menu_xpos, name2ypos[name]));
      };
      const img = ib['1p_panel'];
      const drect = new Rect(MP.xpos_panel, MP.ypos_panel, img.w, img.h);
      if (this.choose1pSave) {
        blitSurface(this.choose1pSave, null, this.app.screen, drect);
      } else {
        this.choose1pSave = newSurface(img.w, img.h, 32, true);
        blitSurface(this.app.screen, drect, this.choose1pSave, this.rects.get(img)!);
      }
      this.put_image(img, MP.xpos_panel, MP.ypos_panel);
      this.print_('menu', this.app.screen, MP.xpos_panel, MP.ypos_panel + 16, 'Start 1-player game menu', img.w, 'center');
      for (const n of ordered) if (n !== ordered[active]) draw_element(n, 'off');
      draw_element(ordered[active], 'over');
      this.c.overlookInit(overlook);
      overlook_index = 0;
      this.app.flip();
    };
    const draw_overlook = (): void => {
      const pivots: Record<string, number> = { play_all_levels: 90, pick_start_level: 135, play_random_levels: 82, mp_train: 105 };
      const name = ordered[active];
      this.put_image(ib.txt_1pmenu_over, menu_xpos, name2ypos[name]);
      this.c.overlook(overlook, ib[`txt_1pmenu_${name}_text`], overlook_index, pivots[name]);
      blitSurface(overlook, null, this.app.screen, new Rect(menu_xpos, name2ypos[name]));
      overlook_index++;
      if (overlook_index === 70) overlook_index = 0;
      blitSurface(ib[`txt_1pmenu_${name}_outlined_text`], null, this.app.screen, new Rect(menu_xpos, name2ypos[name]));
    };
    redraw();
    const ev = this.app.events;
    for (;;) {
      const synchro = this.app.ticks();
      if (this.graphics_level > 1) {
        draw_overlook();
        this.app.update(this.update_rects);
        this.update_rects = [];
      }
      ev.pumpEvents();
      for (let e = ev.pollEvent(); e; e = ev.pollEvent()) {
        if (e.type !== KEYDOWN) continue;
        const k = e.sym;
        if (k === SDLK.RETURN || k === SDLK.KP_ENTER) {
          let cancel = 0;
          if (ordered[active] === 'pick_start_level') {
            if (this.levels.current) { if (!await this.choose_levelset(1)) cancel = 1; }
          } else if (ordered[active] === 'play_random_levels') {
            this.levels.current = 'random';
            let answ: Key = 0;
            if (!await this.ask_from({ intro: ['Random level', '', '', 'Enable chain-reaction?', ''], entries: [{ q: 'Y or N?', a: (v) => { answ = v; }, f: 'ONE_CHAR' }], outro: 'Enjoy the game!' })) return 0;
            this.chainreaction = answ === SDLK.y ? 1 : 0;
          } else if (ordered[active] === 'mp_train') {
            this.levels.current = 'mp_train';
            let answ: Key = 0;
            if (!await this.ask_from({ intro: ['Multiplayer training', '', '', 'Enable chain-reaction?', ''], entries: [{ q: 'Y or N?', a: (v) => { answ = v; }, f: 'ONE_CHAR' }], outro: 'Enjoy the game!' })) return 0;
            this.chainreaction = answ === SDLK.y ? 1 : 0;
          }
          if (!cancel) return 1;
        } else if (k === SDLK.ESCAPE) {
          this.levels.current = null;
          return 0;
        } else if (k === SDLK.DOWN) {
          active = active < ordered.length - 1 ? active + 1 : 0;
          this.play_sound('menu_change');
        } else if (k === SDLK.UP) {
          active = active > 0 ? active - 1 : ordered.length - 1;
          this.play_sound('menu_change');
        }
        redraw();
      }
      const to_wait = TARGET_ANIM_SPEED - (this.app.ticks() - synchro);
      if (to_wait > 0) await this.c.fbdelay(to_wait);
    }
  }

  // ------------------------------------------------------------------------------- text entry

  callback_entry(action: string, params?: { event?: SDLEvent; maxlen?: number; font?: string; xpos?: number; ypos?: number; prefix?: string }, ...rest: string[]): string[] {
    if (action === 'reset') { this.entry_typed = []; this.entry_position = 0; this.entry_echo_blink_counter = 51; }
    if (action === 'moved') this.entry_echo_blink_counter = 75;
    if (action === 'gettext') return this.entry_typed;
    if (action === 'settext') {
      this.entry_typed = rest;
      this.entry_position = this.entry_typed.length;
      this.entry_echo_blink_counter = 51;
      if (!this.no_echo) this.play_sound('typewriter');
    }
    if (action === 'print') {
      const p = params!;
      this.print_(p.font!, this.app.screen, p.xpos!, p.ypos!, (p.prefix ?? '') + this.entry_typed.join(''), p.maxlen);
      if (this.entry_echo_blink_counter > 25) {
        const before = this.entry_typed.slice(0, this.entry_position);
        const width = this.width(p.font!, (p.prefix ?? '') + before.join('')) - 3;
        this.print_(p.font!, this.app.screen, p.xpos! + width, p.ypos!, '|');
      }
    }
    if (action === 'ping') {
      this.entry_echo_blink_counter--;
      if (!this.entry_echo_blink_counter) this.entry_echo_blink_counter = 50;
      return this.entry_echo_blink_counter === 50 || this.entry_echo_blink_counter === 25 ? ['1'] : [];
    }
    return [];
  }

  async callback_entry_async(action: 'keypressed', params: { event: SDLEvent; maxlen: number; font: string; prefix?: string }): Promise<void> {
    const e = params.event;
    const typ = (): void => { if (!this.no_echo) this.play_sound('typewriter'); };
    if (e.sym === SDLK.BACKSPACE) {
      if (this.entry_position >= 1) { this.entry_typed.splice(this.entry_position - 1, 1); this.entry_position--; typ(); } else this.play_sound('stick');
    } else if (e.sym === SDLK.DELETE) {
      if (this.entry_position < this.entry_typed.length) { this.entry_typed.splice(this.entry_position, 1); typ(); } else this.play_sound('stick');
    } else if (e.sym === SDLK.LEFT) {
      if (this.entry_position >= 1) { this.entry_position--; typ(); } else this.play_sound('stick');
    } else if (e.sym === SDLK.RIGHT) {
      if (this.entry_position <= this.entry_typed.length - 1) { this.entry_position++; typ(); } else this.play_sound('stick');
    } else if (e.sym === SDLK.HOME) {
      this.entry_position = 0; typ();
    } else if (e.sym === SDLK.END) {
      this.entry_position = this.entry_typed.length; typ();
    } else if (e.sym === SDLK.TAB) {
      // no completion outside the original's lobby
    } else {
      const ch = e.unicode ? String.fromCharCode(e.unicode) : '';
      if (ch !== '' && ch !== '\n' && ch !== '\r') {
        this.entry_typed.splice(this.entry_position, 0, ch);
        if (this.width(params.font, (params.prefix ?? '') + this.entry_typed.join('')) >= params.maxlen) {
          this.entry_typed.splice(this.entry_position, 1);
          this.play_sound('stick');
        } else { this.entry_position++; typ(); }
      } else {
        await this.handle_whenever_events(e.sym);
      }
    }
    void action;
  }

  // ------------------------------------------------------------------------------- online

  smg_printstatus(): void {
    const drect = new Rect(0, 435 - 5 * this.smg_lineheight, 640, 480);
    blitSurface(this.imgbin.back_netgame, drect, this.app.screen, drect);
    let y = 435;
    let i = this.smg_status_message_offsetpage;
    const msgs = this.smg_status_messages;
    while (i < 5 + this.smg_status_message_offsetpage && msgs.length >= i) {
      const m = msgs[msgs.length - i];
      if (m) this.print_(/^\*\*\*/.test(m) ? 'netdialogs_servermsg' : 'netdialogs', this.app.screen, 10, y, m, 620, 'left');
      y -= this.smg_lineheight;
      i++;
    }
    this.app.flip();
  }

  smg_add_status_msg(...m: string[]): void {
    this.smg_status_messages.push(...m);
    this.smg_status_message_offsetpage = 1;
    this.smg_printstatus();
  }

  sanitize_nick(nick: string): string {
    return nick.slice(0, 10).replace(/[^a-zA-Z0-9_-]/g, '');
  }

  show_mp_scores(): void {
    blitSurface(this.imgbin.back_netgame, this.apprects.main, this.app.screen, this.apprects.main);
    if (this.inconsistency) this.smg_add_status_msg('*** Game finished, because an inconsistency in game state was detected - sorry!');
    else if (this.scorelimit && any(this.PLAYERS, (q) => pnum(this.pdata[q].score) === this.scorelimit)) {
      this.smg_add_status_msg(`*** Game finished, because victories limit of ${this.scorelimit} was reached.`);
    } else if (!this.continuegamewhenplayersleave && any(this.PLAYERS, (q) => this.pdata[q].left)) {
      this.smg_add_status_msg(`*** Game finished, because the following player(s) left: ${this.PLAYERS.filter((q) => this.pdata[q].left).map((q) => this.pdata[q].nick).join(', ')}`);
    }
    this.smg_add_status_msg(`*** Addicted for: ${format_addiction((this.app.ticks() - this.time_netgame) / 1000)}`);
    const sorted = [...this.PLAYERS].sort((a, b) => pnum(this.pdata[a].score) - pnum(this.pdata[b].score)).reverse();
    this.PLAYERS = sorted;
    if (pnum(this.pdata[sorted[0]].score) > pnum(this.pdata[sorted[1]].score)) this.smg_add_status_msg(`*** Winner: ${this.pdata[sorted[0]].nick}`);
    else this.smg_add_status_msg('*** Draw game!');
    this.smg_add_status_msg(`*** Scores: ${sorted.map((q) => `${this.pdata[q].nick}: ${pstr(this.pdata[q].score)}`).join(', ')}`);
  }

  /** setup_mp_game: the SDK lobby replaces the server list, the chat room and its games (README) */
  async setup_mp_game(after_game: boolean): Promise<number> {
    blitSurface(this.imgbin.back_netgame, this.apprects.main, this.app.screen, this.apprects.main);
    this.app.flip();
    const setup = await this.host.online!.chooseGame(!after_game);
    if (!setup) return 0;
    // GAME_CAN_START: the mapping of ids to nicks
    this.PLAYERS = ['p1'];
    for (const p of ALL_PLAYERS) { delete this.pdata[p].id; delete this.pdata[p].nick; }
    this.id2p = {};
    this.mynick = setup.mynick;
    for (const m of setup.mapping) {
      let player: Player | undefined;
      if (m.nick === this.mynick) player = 'p1';
      else {
        for (const q of ALL_PLAYERS) {
          if (!/rp/.test(q)) continue;
          if (this.pdata[q].id === undefined) { player ??= q; }
        }
        this.PLAYERS.push(player!);
      }
      this.pdata[player!].id = m.id;
      this.pdata[player!].nick = m.nick;
      this.id2p[m.id] = player!;
    }
    this.net().setmyid(this.pdata.p1.id!);
    for (const q of this.PLAYERS) this.pdata[q].score = 0;
    this.chainreaction = setup.chainreaction ? 1 : 0;
    this.continuegamewhenplayersleave = setup.continuegamewhenplayersleave ? 1 : 0;
    this.singleplayertargetting = setup.singleplayertargetting ? 1 : 0;
    this.scorelimit = setup.scorelimit;
    this.protocollevel = 2;
    this.save_config();
    this.time_netgame = this.app.ticks();
    return 1;
  }

  async new_game_once(): Promise<number> {
    if (this.direct_levelset) {
      this.load_levelset(`levels/${this.direct_levelset}`);
      this.direct_levelset = '';
    }
    if (!this.direct) {
      if (this.is_1p_game()) { if (!await this.choose_1p_game_mode()) return 0; }
      if (this.is_2p_game() && this.graphics_level > 1) {
        let answ: Key = 0;
        if (!await this.ask_from({ intro: ['2-player game', '', '', 'Enable chain-reaction?', ''], entries: [{ q: 'Y or N?', a: (v) => { answ = v; }, f: 'ONE_CHAR' }], outro: 'Enjoy the game!' })) return 0;
        this.chainreaction = answ === SDLK.y ? 1 : 0;
      }
    }
    for (const p of ALL_PLAYERS) this.pdata[p].left = 0;
    if (this.is_mp_game() && !this.playdata) {
      this.app.events.enableKeyRepeat(200, 50);
      let ok = 0;
      try {
        ok = await this.setup_mp_game(this.netAfterGame);
      } catch (e) {
        if (!isDie(e, 'quit')) throw e;
      } finally {
        this.app.events.enableKeyRepeat(0, 0);
      }
      if (!ok) return 0;
    }
    await this.play_music(this.is_1p_game() ? 'main1p' : 'main2p');
    return 1;
  }
  netAfterGame = false;

  // ------------------------------------------------------------------------------- high scores

  ordered_highscores(): Record<string, PValue>[] {
    return [...this.HISCORES].sort((a, b) => lvl_cmp(b.level as number | string, a.level as number | string) || pnum(a.time as number) - pnum(b.time as number));
  }
  ordered_mptrain_highscores(): Record<string, PValue>[] { return [...this.HISCORES_MPTRAIN].sort((a, b) => pnum(b.score as number) - pnum(a.score as number)); }
  ordered_mptrain_highscores_chainreaction(): Record<string, PValue>[] { return [...this.HISCORES_MPTRAIN_CHAINREACTION].sort((a, b) => pnum(b.score as number) - pnum(a.score as number)); }

  async handle_new_hiscores(): Promise<void> {
    if (!(this.is_1p_game() && this.levels.current && this.levels.current !== 'random' && !this.playdata)) return;
    if (this.levels.current !== 'mp_train') {
      const ordered = this.ordered_highscores();
      const worst = ordered.pop();
      const total_seconds = (this.app.ticks() - this.time_1pgame) / 1000;
      if (this.HISCORES.length === 10 && (lvl_cmp(this.levels.current, worst!.level as number | string) === -1
          || (lvl_cmp(this.levels.current, worst!.level as number | string) === 0 && total_seconds > pnum(worst!.time as number)))) return;
      this.play_sound('applause');
      this.append_highscore_level();
      const new_entry: Record<string, PValue> = { level: this.levels.current, time: total_seconds, piclevel: this.count_highscorehistory_levels() };
      await this.ask_from({ intro: ['Congratulations!', 'You have a highscore!', ''], entries: [{ q: 'Your name?', a: (v) => { new_entry.name = String(v); } }],
        outro: 'Great game!', erase_background: this.background });
      if ((new_entry.name ?? '') === '') return;
      this.HISCORES.push(new_entry);
      if (this.HISCORES.length === 11) { const h = this.ordered_highscores(); h.pop(); this.HISCORES = h; }
      this.host.home.write('highscores', dump([this.HISCORES], ['HISCORES']));
      await this.display_highscores('levels', new_entry);
    } else {
      const ordered = this.chainreaction ? this.ordered_mptrain_highscores_chainreaction() : this.ordered_mptrain_highscores();
      const scores = this.chainreaction ? this.HISCORES_MPTRAIN_CHAINREACTION : this.HISCORES_MPTRAIN;
      const worst = ordered.pop();
      if (scores.length === 20 && pnum(this.pdata.p1.score) < pnum(worst!.score as number)) return;
      this.play_sound('applause');
      const new_entry: Record<string, PValue> = { score: this.pdata.p1.score as number };
      await this.ask_from({ intro: ['Congratulations!', 'You have a highscore!', ''], entries: [{ q: 'Your name?', a: (v) => { new_entry.name = String(v); } }],
        outro: 'Great game!', erase_background: this.background });
      if ((new_entry.name ?? '') === '') return;
      scores.push(new_entry);
      if (scores.length === 21) {
        const h = [...scores].sort((a, b) => pnum(b.score as number) - pnum(a.score as number));
        h.pop();
        if (this.chainreaction) this.HISCORES_MPTRAIN_CHAINREACTION = h; else this.HISCORES_MPTRAIN = h;
      }
      this.host.home.write('highscores-mptrain', `${dump([this.HISCORES_MPTRAIN], ['HISCORES_MPTRAIN'])} ${dump([this.HISCORES_MPTRAIN_CHAINREACTION], ['HISCORES_MPTRAIN_CHAINREACTION'])}`);
      await this.display_highscores('mptrain', new_entry);
    }
  }

  append_highscore_level(): void {
    let row = 0, lvl = 1;
    const contents: string[] = [];
    const nlev = this.levels.sets.size + 1; // (keys %levels)-1 with 'current' among the keys
    for (const line of splitLines(this.levelsetText(this.loaded_levelset) ?? '')) {
      if (!/\S/.test(line)) {
        if (row) { lvl++; row = 0; }
      } else {
        row++;
        if (lvl === (this.levels.current === 'WON' ? nlev - 1 : pnum(this.levels.current))) contents.push(`${line}\n`);
      }
    }
    this.host.home.append('highlevelshistory', `${contents.join('')}\n\n`);
  }

  count_highscorehistory_levels(): number {
    let cnt = 0, row = 0;
    for (const line of splitLines(this.host.home.read('highlevelshistory') ?? '')) {
      if (!/\S/.test(line)) { if (row) { cnt++; row = 0; } } else row++;
    }
    return cnt;
  }

  // ------------------------------------------------------------------------------- mainloop

  async maingame(): Promise<void> {
    const synchro = this.app.ticks();
    await this.handle_graphics('erase');
    await this.update_game();
    await this.handle_graphics('put');
    this.frame++;
    this.app.update(this.update_rects);
    this.update_rects = [];
    const to_wait = TARGET_ANIM_SPEED - (this.app.ticks() - synchro);
    if (to_wait > 0) await this.c.fbdelay(to_wait);
    this.host.frameHook?.(this);
  }

  async cleanup_and_exit(): Promise<never> {
    this.save_config();
    throw new Die('exit');
  }

  save_config(): void {
    const keys: Record<string, Record<string, PValue | Bare>> = {};
    for (const [p, ks] of Object.entries(this.KEYS)) {
      keys[p] = {};
      for (const [k, v] of Object.entries(ks)) {
        let out: PValue | Bare = v;
        if (/^\d+$/.test(pstr(v))) {
          for (const [name, val] of KEYSYMS) if (pstr(v) === pstr(val)) { out = new Bare(`SDLK_${name}`); break; }
        }
        keys[p][k] = out;
      }
    }
    let d = dump([this.fullscreen, this.graphics_level, this.mynick, this.music_disabled ?? null, this.mixer_enabled ?? null,
      this.mylatitude || null, this.mylongitude, keys as unknown as PValue],
      ['fullscreen', 'graphics_level', 'mynick', 'music_disabled', 'mixer_enabled', 'mylatitude', 'mylongitude', 'KEYS']);
    d = d.replace(/'SDLK_(\w+)'/g, 'SDLK_$1');
    this.host.home.write('rc', d);
  }

  load_config(): void {
    const rc = this.host.home.read('rc');
    if (rc !== null) {
      const v = parseAssignments(rc);
      if (v.has('fullscreen')) this.fullscreen = v.get('fullscreen')!;
      if (v.has('graphics_level')) this.graphics_level = pnum(v.get('graphics_level') as number);
      if (v.has('mynick')) this.mynick = String(v.get('mynick') ?? '');
      if (v.has('music_disabled')) this.music_disabled = v.get('music_disabled') === null ? undefined : pnum(v.get('music_disabled') as number);
      if (v.has('mixer_enabled')) this.mixer_enabled = v.get('mixer_enabled') === null ? undefined : pnum(v.get('mixer_enabled') as number);
      if (v.has('mylatitude')) this.mylatitude = v.get('mylatitude')!;
      if (v.has('mylongitude')) this.mylongitude = v.get('mylongitude')!;
      const K = v.get('KEYS') as Record<string, Record<string, PValue>> | undefined;
      if (K && typeof K === 'object') {
        const orig = this.KEYS;
        this.KEYS = {};
        for (const [p, ks] of Object.entries(K)) {
          this.KEYS[p] = {};
          for (const [k, val] of Object.entries(ks ?? {})) this.KEYS[p][k] = typeof val === 'number' ? val : String(val);
        }
        if (!this.KEYS.misc?.chat) [this.KEYS.p1, this.KEYS.p2] = [this.KEYS.p2, this.KEYS.p1];
        this.KEYS.misc ??= {};
        for (const [k, val] of Object.entries(orig.misc)) if (!this.KEYS.misc[k]) this.KEYS.misc[k] = val;
      }
    }
    const hs = this.host.home.read('highscores');
    if (hs !== null) {
      const v = parseAssignments(hs);
      if (Array.isArray(v.get('HISCORES'))) this.HISCORES = v.get('HISCORES') as Record<string, PValue>[];
    }
    const hm = this.host.home.read('highscores-mptrain');
    if (hm !== null) {
      const v = parseAssignments(hm);
      if (Array.isArray(v.get('HISCORES_MPTRAIN'))) this.HISCORES_MPTRAIN = v.get('HISCORES_MPTRAIN') as Record<string, PValue>[];
      if (Array.isArray(v.get('HISCORES_MPTRAIN_CHAINREACTION'))) this.HISCORES_MPTRAIN_CHAINREACTION = v.get('HISCORES_MPTRAIN_CHAINREACTION') as Record<string, PValue>[];
    }
  }
  // ------------------------------------------------------------------------------- menu

  /** the logo's effect: chosen once at start (frozen-bubble's file scope) */
  choose_logo_candy(): void {
    this.logo_candy_method = int(this.rand.rand(8));
    if ((this.host.args ?? []).join(' ').match(/winter.season/)) {
      this.logo_candy_method = 8;
    } else {
      const d = new Date(this.app.time() * 1000);
      const day = d.getDate(), month = d.getMonth();
      if (day === 25 && month === 11) this.logo_candy_method = 8;
      else if (this.mylatitude === null || this.mylatitude === '' || pnum(this.mylatitude as number) > 0) {
        if ((day >= 21 && month === 11) || month === 0 || (day <= 21 && month === 1)) { if (this.rand.rand() < 0.3) this.logo_candy_method = 8; }
      } else if ((day >= 21 && month === 4) || month === 5 || (day <= 24 && month === 6)) {
        if (this.rand.rand() < 0.3) this.logo_candy_method = 8;
      }
    }
  }

  async menu(_firsttime?: string): Promise<void> {
    if (this.is_1p_game() && this.levels.current !== 'mp_train') await this.handle_new_hiscores();
    await this.play_music('intro');

    const ib = this.imgbin;
    const back_start: Surface = ib.back_menu;
    const display_menu = (): void => {
      blitSurface(back_start, this.apprects.main, this.app.screen, this.apprects.main);
      blitSurface(ib.stamp, null, this.app.screen, new Rect(490, 142));
    };
    display_menu();

    let menu_invalids: number[] = [];
    // keys of %menu_entries in the order Perl's hash gives them is unspecified; the oracle and the port
    // use the menu's order (re/frozenbubble/NOTES.md)
    const order = ['1pgame', '2pgame', 'langame', 'netgame', 'editor', 'graphics', 'keys', 'highscores'];
    let speed_ok = 4;

    const candy_init = (): void => {
      if (this.candy !== undefined && this.candy !== null) {
        this.erase_image_from(ib.menu_logo, this.logox, this.logoy, back_start);
        this.candy = null;
        ib.menu_logo = this.add_image('menu/fblogo.png');
      }
      this.logox = 400; this.logoy = 15;
      // stretch and tilt need a bit more room; snow needs to extend top, and a little more wideness
      const grow = (hf: number | null, yf: number): void => {
        const logo = ib.menu_logo as Surface;
        const ns = newSurface(logo.w * 1.1, hf === null ? logo.h + this.logoy : logo.h * hf, 32);
        setAlpha(logo, 0, 0);
        blitSurface(logo, null, ns, new Rect(logo.w * 0.05, hf === null ? this.logoy : logo.h * yf));
        this.logox -= logo.w * 0.05;
        if (hf === null) this.logoy = 0; else this.logoy -= logo.h * yf;
        ib.menu_logo = ns;
        this.add_default_rect(ns);
      };
      if (this.logo_candy_method === 3) { grow(1.1, 0.05); this.logo_candy_method = 3.1; }
      if (this.logo_candy_method === 4) { grow(1.05, 0.025); this.logo_candy_method = 4.1; }
      if (this.logo_candy_method === 8) { grow(null, 0); this.logo_candy_method = 8.1; }
      this.candy = newSurface(ib.menu_logo.w, ib.menu_logo.h, 32);
    };
    if (this.candy === undefined || this.candy === null) candy_init();

    const draw_logo = (no_update?: boolean): void => {
      this.erase_image_from(ib.menu_logo, this.logox, this.logoy, back_start);
      if (this.graphics_level < 3 || !speed_ok) {
        this.put_image(ib.menu_logo, this.logox, this.logoy);
      } else {
        const m = this.logo_candy_method, c = this.candy!, logo = ib.menu_logo, i = this.logo_candy_index;
        if (m === 0) this.c.rotateBilinear(c, logo, sin(i / 40) / 20);
        if (m === 1) this.c.flipflop(c, logo, i);
        if (m === 2) this.c.enlighten(c, logo, i);
        if (m === 3.1) this.c.stretch(c, logo, i);
        if (m === 4.1) this.c.tilt(c, logo, i);
        if (m === 5) this.c.pointsEffect(c, logo, ib.menu_logo_mask);
        if (m === 6) this.c.waterize(c, logo, i);
        if (m === 7) this.c.brokentv(c, logo, i);
        if (m === 8.1) this.c.snow(c, logo);
        blitSurface(c, null, this.app.screen, new Rect(this.logox, this.logoy));
        this.logo_candy_index++;
      }
      if (!no_update) {
        this.app.update(this.update_rects);
        this.update_rects = [];
      }
    };

    ib.menu_cursor.graphics = ib.menu_cursor[`graphics${this.graphics_level}`];
    ib.menu_cursor.graphicsalpha = ib.menu_cursor[`graphics${this.graphics_level}alpha`];
    const MENU_XPOS = 89, MENU_FIRSTY = 14, SPACING = 56;
    const menu_ypos: Record<string, number> = {};
    order.forEach((m, i) => { menu_ypos[m] = MENU_FIRSTY + i * SPACING; });
    let start_game = 0;
    const entries: Record<string, { pos: number; type: string; run?: () => Promise<void>; value?: number; valuemin?: number; valuemax?: number; change?: (v: number) => void }> = {
      '1pgame': { pos: 1, type: 'rungame', run: async () => { this.PLAYERS = ['p1']; this.levels.current = 1; this.time_1pgame = this.app.ticks(); } },
      '2pgame': { pos: 2, type: 'rungame', run: async () => { this.PLAYERS = ['p1', 'p2']; this.levels.current = null; } },
      langame: { pos: 3, type: 'rungame', run: async () => { this.PLAYERS = ['p1', 'rp1']; this.gametype = 'net'; this.levels.current = null; } },
      netgame: { pos: 4, type: 'rungame', run: async () => { this.PLAYERS = ['p1', 'rp1']; this.gametype = 'net'; this.levels.current = null; } },
      editor: { pos: 5, type: 'run', run: async () => { await launch_editor(); } },
      graphics: {
        pos: 6, type: 'range', valuemin: 1, valuemax: 3, value: this.graphics_level,
        change: (v: number) => {
          this.graphics_level = v;
          if (this.graphics_level < 3) draw_logo(); else speed_ok = 4;
          ib.menu_cursor.graphics = ib.menu_cursor[`graphics${this.graphics_level}`];
          ib.menu_cursor.graphicsalpha = ib.menu_cursor[`graphics${this.graphics_level}alpha`];
          if ((this.cursor_img.graphics ?? 0) >= ib.menu_cursor.graphics.length) this.cursor_img.graphics = 0;
        },
      },
      keys: { pos: 7, type: 'run', run: async () => { await change_keys(); } },
      highscores: { pos: 8, type: 'run', run: async () => { await menu_display_highscores(); } },
    };
    if (!this.current_pos) this.current_pos = 1;
    const invalidate_all = (): void => { for (const m of order) menu_invalids.push(entries[m].pos); };

    const menu_display_highscores = async (): Promise<void> => {
      await this.display_highscores();
      display_menu();
      this.app.flip();
      invalidate_all();
    };
    const change_keys = async (): Promise<void> => {
      const K = this.KEYS;
      const set = (p: string, k: string) => (v: Key | string): void => { K[p][k] = v as Key; };
      await this.ask_from({
        intro: ['Please enter new keys:'],
        entries: [
          { q: 'Player 1; turn left?', a: set('p1', 'left'), f: 'ONE_CHAR' },
          { q: 'Player 1; turn right?', a: set('p1', 'right'), f: 'ONE_CHAR' },
          { q: 'Player 1; fire?', a: set('p1', 'fire'), f: 'ONE_CHAR' },
          { q: 'Player 1; center?', a: set('p1', 'center'), f: 'ONE_CHAR' },
          { f: 'SPACE' },
          { q: 'Player 2; turn left?', a: set('p2', 'left'), f: 'ONE_CHAR' },
          { q: 'Player 2; turn right?', a: set('p2', 'right'), f: 'ONE_CHAR' },
          { q: 'Player 2; fire?', a: set('p2', 'fire'), f: 'ONE_CHAR' },
          { q: 'Player 2; center?', a: set('p2', 'center'), f: 'ONE_CHAR' },
          { f: 'SPACE' },
          { q: 'Toggle fullscreen?', a: set('misc', 'fs'), f: 'ONE_CHAR' },
          { q: 'Chat (net/lan game)?', a: set('misc', 'chat'), f: 'ONE_CHAR' },
        ],
        outro: 'Thanks!',
        erase_background: back_start,
      });
      invalidate_all();
    };
    const launch_editor = async (): Promise<void> => {
      this.platformShowCursor(true);
      const ed = this.fble ??= this.host.makeEditor(this);
      await ed.init_setup('embedded');
      await ed.handle_events();
      this.platformShowCursor(false);
      display_menu();
      this.app.flip();
      invalidate_all();
    };

    const display_cursor = (m: string, alpha?: boolean, pixelize?: boolean): Rect => {
      const imgs = ib.menu_cursor[m] as Surface[];
      const ci = this.cursor_img[m] ?? 0;
      const cursor_rect = new Rect(248, menu_ypos[m] + 8, imgs[ci].w, imgs[ci].h);
      if (!this.cursor_save_bg[m]) {
        const s = newSurface(imgs[0].w, imgs[0].h, 32);
        blitSurface(this.app.screen, cursor_rect, s, new Rect(0, 0, imgs[0].w, imgs[0].h));
        this.cursor_save_bg[m] = s;
      }
      blitSurface(this.cursor_save_bg[m]!, null, this.app.screen, cursor_rect);
      if (alpha) {
        if (pixelize) {
          if (!this.cursor_tmp) this.cursor_tmp = newSurface(imgs[0].w, imgs[0].h, 32);
          this.c.pixelize(this.cursor_tmp, (ib.menu_cursor[`${m}alpha`] as Surface[])[ci]);
          blitSurface(this.cursor_tmp, null, this.app.screen, cursor_rect);
        } else blitSurface((ib.menu_cursor[`${m}alpha`] as Surface[])[ci], null, this.app.screen, cursor_rect);
      } else blitSurface(imgs[ci], null, this.app.screen, cursor_rect);
      return cursor_rect;
    };
    const menu_update = (): void => {
      this.update_rects = [];
      for (const m of order) {
        if (!member(entries[m].pos, menu_invalids)) continue;
        const txt = `txt_${m}${entries[m].pos === this.current_pos ? '_over' : '_off'}`;
        this.erase_image_from(ib[txt], MENU_XPOS, menu_ypos[m], back_start);
        this.put_image(ib[txt], MENU_XPOS, menu_ypos[m]);
        this.cursor_save_bg[m] = null;
        display_cursor(m, entries[m].pos !== this.current_pos);
      }
      menu_invalids = [];
      draw_logo(true);
      this.app.update(this.update_rects);
      this.update_rects = [];
    };

    invalidate_all();
    menu_update();
    this.app.flip();
    const ev = this.app.events;
    while (ev.pollEvent()) { /* drain */ }

    const BANNER_START = 1000, BANNER_SPACING = 80;
    const banners: Record<string, number> = {
      artwork: BANNER_START,
      soundtrack: BANNER_START + ib.banner_artwork.w + BANNER_SPACING,
      cpucontrol: BANNER_START + ib.banner_artwork.w + BANNER_SPACING + ib.banner_soundtrack.w + BANNER_SPACING,
      leveleditor: BANNER_START + ib.banner_artwork.w + BANNER_SPACING + ib.banner_soundtrack.w + BANNER_SPACING + ib.banner_cpucontrol.w + BANNER_SPACING,
    };
    const BANNER_MINX = 304, BANNER_MAXX = 596, BANNER_Y = 243;
    const banners_max = banners.leveleditor - (640 - (BANNER_MAXX - BANNER_MINX)) + BANNER_SPACING;
    const banner_rect = new Rect(BANNER_MINX, BANNER_Y, BANNER_MAXX - BANNER_MINX, 30);
    let time_counter = 0;
    const maxpos = 8;

    while (!start_game) {
      let synchro = this.app.ticks();
      if (this.graphics_level > 1) blitSurface(back_start, banner_rect, this.app.screen, banner_rect);
      ev.pumpEvents();
      for (let e = ev.pollEvent(); e; e = ev.pollEvent()) {
        const keypressed = this.extended_keypress(e);
        if (keypressed !== undefined) {
          if (keypressed === SDLK.PAUSE) {
            const time_pause = this.app.ticks();
            while (ev.pollEvent()) { /* drain */ }
            for (;;) {
              const e2 = await ev.waitEvent();
              if (e2.type === QUIT) await this.cleanup_and_exit();
              if (this.extended_keypress(e2) !== undefined) { this.start_time += this.app.ticks() - time_pause; break; }
            }
          }
          if (ev.keyState[SDLK.LCTRL] === 1 && keypressed === SDLK.n) {
            this.logo_candy_method = pmod(int(this.logo_candy_method) + 1, 9);
            candy_init();
          }
          if (keypressed === SDLK.DOWN || keypressed === SDLK.RIGHT) {
            menu_invalids.push(this.current_pos);
            this.current_pos = this.current_pos < maxpos ? this.current_pos + 1 : 1;
            menu_invalids.push(this.current_pos);
            this.play_sound('menu_change');
            menu_update();
          }
          if (keypressed === SDLK.UP || keypressed === SDLK.LEFT) {
            menu_invalids.push(this.current_pos);
            this.current_pos = this.current_pos > 1 ? this.current_pos - 1 : maxpos;
            menu_invalids.push(this.current_pos);
            this.play_sound('menu_change');
            menu_update();
          }
          if (keypressed === SDLK.RETURN || keypressed === SDLK.SPACE || keypressed === SDLK.KP_ENTER) {
            this.play_sound('menu_selected');
            menu_invalids.push(this.current_pos);
            for (const m of order) {
              const me = entries[m];
              if (me.pos === this.current_pos) {
                if (/^run/.test(me.type)) {
                  await me.run!();
                  if (me.type === 'rungame') start_game = 1;
                }
                if (me.type === 'range') {
                  me.value!++;
                  if (me.value! > me.valuemax!) me.value = me.valuemin;
                  me.change!(me.value!);
                }
              }
            }
            menu_update();
          }
          await this.handle_whenever_events(keypressed);
          if (keypressed === SDLK.ESCAPE) await this.cleanup_and_exit();
          synchro = this.app.ticks();
          time_counter = 0;
        }
        if (e.type === QUIT) await this.cleanup_and_exit();
      }

      if (this.graphics_level > 1) {
        if (!this.banner_pos) this.banner_pos = 670;
        // keys %banners: the banners do not overlap, so the order does not show
        for (const b of ['artwork', 'soundtrack', 'cpucontrol', 'leveleditor']) {
          let xpos = banners[b] - this.banner_pos;
          const image: Surface = ib[`banner_${b}`];
          if (xpos > banners_max / 2) xpos = banners[b] - (this.banner_pos + banners_max);
          if (xpos < BANNER_MAXX && xpos + image.w >= 0) {
            const irect = new Rect(-xpos, 0, Math.min(image.w + xpos, BANNER_MAXX - BANNER_MINX), image.h);
            blitSurface(image, irect, this.app.screen, new Rect(BANNER_MINX, BANNER_Y));
          }
        }
        this.banner_pos++;
        if (this.banner_pos >= banners_max) this.banner_pos = 1;
        this.app.update([banner_rect]);

        // animate and break cursor
        for (const m of order) {
          if (entries[m].pos === this.current_pos) {
            this.cursor_img[m] = (this.cursor_img[m] ?? 0) + 1;
            if (this.cursor_img[m] >= ib.menu_cursor[m].length) this.cursor_img[m] = 0;
            this.app.update([display_cursor(m, false)]);
          } else if (this.broken_cursors[m]) {
            this.broken_cursors[m]--;
            if (this.broken_cursors[m]) this.app.update([display_cursor(m, true, true)]);
            else this.app.update([display_cursor(m, true)]);
          } else if (this.rand.rand() < 0.001) {
            this.broken_cursors[m] = int(20 + 10 * cos(this.rand.rand(2 * PI)));
          }
        }

        // blinking
        const green_left = new Rect(411, 385, ib.menu_closedeye_green_left.w, ib.menu_closedeye_green_left.h);
        const green_right = new Rect(434, 378, ib.menu_closedeye_green_right.w, ib.menu_closedeye_green_right.h);
        const purple_left = new Rect(522, 356, ib.menu_closedeye_purple_left.w, ib.menu_closedeye_purple_left.h);
        const purple_right = new Rect(535, 356, ib.menu_closedeye_purple_right.w, ib.menu_closedeye_purple_right.h);
        const blink = (state: number, left: Rect, right: Rect, imgL: Surface, imgR: Surface): number => {
          if (state > 0) {
            state--;
            if (!state) {
              blitSurface(back_start, left, this.app.screen, left);
              blitSurface(back_start, right, this.app.screen, right);
              this.app.update([left, right]);
              if (this.rand.rand(3) <= 1) state = -5;
            }
          } else if (state < 0) {
            state++;
            if (!state) {
              state = 3;
              blitSurface(imgL, null, this.app.screen, left);
              blitSurface(imgR, null, this.app.screen, right);
              this.app.update([left, right]);
            }
          } else if (this.rand.rand(200) <= 1) {
            state = 3;
            blitSurface(imgL, null, this.app.screen, left);
            blitSurface(imgR, null, this.app.screen, right);
            this.app.update([left, right]);
          }
          return state;
        };
        this.blink_green = blink(this.blink_green, green_left, green_right, ib.menu_closedeye_green_left, ib.menu_closedeye_green_right);
        this.blink_purple = blink(this.blink_purple, purple_left, purple_right, ib.menu_closedeye_purple_left, ib.menu_closedeye_purple_right);
      }

      if (this.graphics_level > 2 && speed_ok) draw_logo();

      const to_wait = TARGET_ANIM_SPEED - (this.app.ticks() - synchro);
      if (to_wait > 0) {
        await this.c.fbdelay(to_wait);
        if (speed_ok) speed_ok = 4;
      } else if (speed_ok) {
        speed_ok--;
        if (!speed_ok) draw_logo();
      }

      if (++time_counter === 1000) {
        this.demo = 1;
        const files = this.host.data.glob('data/demo');
        await this.replay(files[int(this.rand.rand(files.length))]);
        this.demo = 0;
        blacken: for (let step = 1; step <= 35; step++) {
          const ticks = this.app.ticks();
          this.c.blacken(this.app.screen, step);
          this.app.flip();
          const tw = TARGET_ANIM_SPEED - (this.app.ticks() - ticks);
          if (tw > 0) await this.c.fbdelay(tw);
          ev.pumpEvents();
          for (let e = ev.pollEvent(); e; e = ev.pollEvent()) {
            if (e.type === QUIT) await this.cleanup_and_exit();
            if (this.extended_keypress(e) !== undefined) break blacken;
          }
        }
        display_menu();
        invalidate_all();
        menu_update();
        this.app.flip();
        time_counter = 0;
        await this.play_music('intro');
      }
    }

    this.save_config();
    this.iter_players(() => { if (!this.is_1p_game()) this.pdata[this.p].score = 0; });
  }

  // ------------------------------------------------------------------------------- editor stuff

  async choose_levelset(choose_level?: number): Promise<number> {
    const levelsets = this.host.home.list('levels').sort();
    if (!levelsets.length && !choose_level) {
      // no levels directory: the editor was never opened
    } else if (levelsets.length <= 1 && !choose_level) {
      this.load_levelset(`levels/${levelsets[0]}`);
    } else {
      if (choose_level && !this.host.home.exists('levels/default-levelset')) {
        this.host.home.write('levels/default-levelset', new TextDecoder().decode(this.host.data.file('data/levels')));
      }
      const ed = this.fble ??= this.host.makeEditor(this);
      ed.init_app('embedded');
      await ed.create_play_levelset_dialog(choose_level ?? 0, this.levels.current);
      this.platformShowCursor(true);
      const info = await ed.handle_events();
      if (!Array.isArray(info) || !info.length) return 0;
      this.load_levelset(`levels/${info[0]}`);
      this.levels.current = info[1] as number;
      this.platformShowCursor(false);
    }
    return 1;
  }

  async replay(file: string): Promise<void> {
    const text = new TextDecoder().decode(this.host.data.file(file));
    const saveDirect = this.direct;
    try {
      this.recorddata = {};
      this.playdata = [];
      let cur: number | undefined;
      let acts: PerPlayer<Record<string, string>> = {};
      let msgs: NetMsg[] = [];
      const flush = (): void => { this.playdata!.push([cur!, { actions: acts, mp_messages: msgs }]); acts = {}; msgs = []; };
      for (const line of text.split('\n')) {
        const m = /^(.*?):(.*)?$/s.exec(line);
        if (!m) { if (line === '') continue; return; }
        const [, key, value = ''] = m;
        if (key === 'record_protocol') { if (pnum(value) !== 0) return; }
        else if (key === 'players') this.PLAYERS = value.split(',') as Player[];
        else if (key === 'gametype') this.gametype = value;
        else if (key === 'current_level') this.levels.current = /^\d+$/.test(value) ? pnum(value) : value;
        else if (key === 'chainreaction') this.chainreaction = pnum(value);
        else if (key === 'srand') this.rand.srand(pnum(value));
        else if (key === 'bubbles') (this.recorddata.pdatas ??= {}).bubbles = value.split(',').map(pnum);
        else if (key === 'mp_result') (this.recorddata.pdatas ??= {}).mp_result = value;
        else if (key === 'player_id') { const r = /(.*?)\|(.*)/.exec(value); if (r) this.pdata[r[1]].id = r[2]; }
        else if (key === 'player_nick') { const r = /(.*?)\|(.*)/.exec(value); if (r) this.pdata[r[1]].nick = r[2]; }
        else if (key === 'frame_action') {
          const r = /(\d+)\|(\w+)\|(\w+)\|(\w+)/.exec(value)!;
          if (pnum(r[1]) !== cur && cur !== undefined) flush();
          cur = pnum(r[1]);
          (acts[r[2]] ??= {})[r[3]] = r[4];
        } else if (key === 'frame_mpmessage') {
          const r = /(\d+)\|(.)\|(.+)/.exec(value)!;
          if (pnum(r[1]) !== cur && cur !== undefined) flush();
          cur = pnum(r[1]);
          msgs.push({ id: r[2], msg: r[3] });
        }
      }
      flush();
      for (const p of this.PLAYERS) this.pdata[p].score = 0;
      if (this.is_mp_game()) for (const p of this.PLAYERS) this.id2p[this.pdata[p].id!] = p;
      this.direct = 1;
      await this.new_game_once();
      await this.new_game();
      for (;;) {
        try { await this.maingame(); } catch (e) {
          if (isDie(e, 'quit') || isDie(e, 'new_game')) break;
          throw e;
        }
      }
    } finally {
      this.playdata = null;
      this.rand.srand(this.app.ticks());
      this.direct = saveDirect;
    }
  }

  // ------------------------------------------------------------------------------- main

  /** the program: exits (cleanup_and_exit, Escape in the menu) end here; then SDL::Mixer closes the audio */
  async run(): Promise<void> {
    try {
      await this.run_();
    } catch (e) {
      if (!isDie(e, 'exit')) throw e;
    }
    this.app.mixer.closeAudio();
    this.host.exit();
  }

  /** frozen-bubble-editor: the level editor as a program of its own */
  async run_editor(): Promise<void> {
    const args = (this.host.args ?? []).join(' ');
    if (/-cb/.test(args) || /-co/.test(args)) this.colourblind = 1;
    const ed = this.fble = this.host.makeEditor(this);
    let m = /-ls\s*(\S+)/.exec(args) || /-levelset\s*(\S+)/.exec(args);
    ed.levelset_name = m ? m[1] : 'default-levelset';
    m = /-l\s*(\d+)/.exec(args) || /-level\s*(\d+)/.exec(args);
    ed.curr_level = m ? pnum(m[1]) : 1;
    await ed.init_setup('stand-alone');
    await ed.handle_events();
    this.host.exit();
  }

  private async run_(): Promise<void> {
    this.load_config();
    this.choose_logo_candy();
    this.parse_args(this.host.args ?? []);
    await this.init_game();
    if (!this.direct) await this.menu('first time');
    let go_to_menu = false;
    while (!await this.new_game_once()) await this.menu();
    if (!await this.new_game()) go_to_menu = true;
    for (;;) {
      if (go_to_menu) {
        go_to_menu = false;
        do { await this.menu(); } while (!await this.new_game_once());
        if (!await this.new_game()) go_to_menu = true;
        continue;
      }
      try {
        await this.maingame();
      } catch (e) {
        if (!(e instanceof Die)) throw e;
        if (e.why === 'exit') throw e;
        this.save_record_if_needed();
        if (this.start_time !== 0) {
          this.addicted_time += this.app.ticks() - this.start_time;
          this.start_time = 0;
        }
        if (e.why.startsWith('new_game')) {
          if (!await this.new_game()) go_to_menu = true;
        } else if (e.why.startsWith('quit')) {
          if (this.is_mp_game()) {
            await this.online_game_over();
            this.netAfterGame = true;
            if (await this.new_game_once()) { if (!await this.new_game()) go_to_menu = true; } else go_to_menu = true;
            this.netAfterGame = false;
          } else go_to_menu = true;
        }
      }
    }
  }

  /** after a network game: the scores as the original shows them before its game list */
  async online_game_over(): Promise<void> {
    const scores = this.PLAYERS.map((q) => ({ nick: this.pdata[q].nick ?? '', score: pnum(this.pdata[q].score) }));
    const why = this.inconsistency ? 'inconsistency'
      : this.scorelimit && any(this.PLAYERS, (q) => pnum(this.pdata[q].score) === this.scorelimit) ? 'victories'
        : 'left';
    this.show_mp_scores();
    await this.host.online!.ended(scores, why);
  }

  parse_args(args: string[]): void {
    for (let i = 0; i < args.length; i++) {
      const a = args[i];
      if (a === '--solo') { this.direct = 1; this.PLAYERS = ['p1']; }
      else if (a === '--direct') this.direct = 1;
      else if (a === '--chain-reaction') this.chainreaction = 1;
      else if (a === '--no-time-limit') this.no_time_limit = 1;
      else if (a === '--slow-machine') this.graphics_level = 2;
      else if (a === '--very-slow-machine') this.graphics_level = 1;
      else if (a === '--colour-blind' || a === '-cb') this.colourblind = 1;
      else if (a === '--level' || a === '-l') { this.levels.current = pnum(args[++i]); this.direct = 1; this.PLAYERS = ['p1']; }
      else if (a === '--player-malus') this.playermalus = pnum(args[++i]);
      else if (a === '--mp-training-difficulty') this.mptrainingdiff = pnum(args[++i]);
      else if (a === '--no-sound' || a === '-ns') this.mixer = 'SOUND_DISABLED';
      else if (a === '--no-music') this.music_disabled = 1;
      else if (a === '--no-sfx') this.sfx_disabled = 1;
      else if (a === '--no-echo') this.no_echo = 1;
      else if (a === '--auto-record') this.autorecord = 1;
    }
  }
}

const NULL_NET: FbNet = {
  isconnected: () => true,
  gsend: () => {},
  grecv: () => [],
  grecv_get1msg: () => Promise.reject(new Die('quit')),
  grecv_get1msg_ifdata: () => undefined,
  gdelay_messages: () => {},
  setmyid: () => {},
  disconnect: () => {},
};

export function lvl_cmp(a: number | string | null, b: number | string | null): number {
  if (a === 'WON') return b === 'WON' ? 0 : 1;
  if (b === 'WON') return -1;
  const x = pnum(a), y = pnum(b);
  return x < y ? -1 : x > y ? 1 : 0;
}

export function format_addiction(seconds: number): string {
  const h = int(seconds / 3600);
  let m: string | number = int((seconds - h * 3600) / 60);
  let s: string | number = int(seconds - h * 3600 - m * 60);
  if (h) m = String(m).padStart(2, '0');
  if (m && m !== '00') s = String(s).padStart(2, '0');
  if (h) return `${h}h ${m}m ${s}s`;
  if (m && m !== '00') return `${m}m ${s}s`;
  return `${s}s`;
}

/** fbsyms.pm: the key names in their order (for the rc file and the key dialog) */
const FBSYMS = 'UNKNOWN FIRST BACKSPACE TAB CLEAR RETURN PAUSE ESCAPE SPACE EXCLAIM QUOTEDBL HASH DOLLAR AMPERSAND QUOTE LEFTPAREN RIGHTPAREN ASTERISK PLUS COMMA MINUS PERIOD SLASH 0 1 2 3 4 5 6 7 8 9 COLON SEMICOLON LESS EQUALS GREATER QUESTION AT LEFTBRACKET BACKSLASH RIGHTBRACKET CARET UNDERSCORE BACKQUOTE a b c d e f g h i j k l m n o p q r s t u v w x y z DELETE'
  .split(' ').concat(Array.from({ length: 96 }, (_, i) => `WORLD_${i}`))
  .concat('KP0 KP1 KP2 KP3 KP4 KP5 KP6 KP7 KP8 KP9 KP_PERIOD KP_DIVIDE KP_MULTIPLY KP_MINUS KP_PLUS KP_ENTER KP_EQUALS UP DOWN RIGHT LEFT INSERT HOME END PAGEUP PAGEDOWN F1 F2 F3 F4 F5 F6 F7 F8 F9 F10 F11 F12 F13 F14 F15 NUMLOCK CAPSLOCK SCROLLOCK RSHIFT LSHIFT RCTRL LCTRL RALT LALT RMETA LMETA LSUPER RSUPER MODE COMPOSE HELP PRINT SYSREQ BREAK MENU POWER EURO UNDO LAST'.split(' '));
const SDLK_VALUES: Record<string, number> = { ...SDLK as unknown as Record<string, number>, FIRST: 0, LAST: 323 };
for (let i = 0; i < 96; i++) SDLK_VALUES[`WORLD_${i}`] = 160 + i;
export const KEYSYMS: [string, number][] = FBSYMS.map((n) => [n, SDLK_VALUES[n]] as [string, number]);

function splitLines(text: string): string[] {
  // Perl's cat_: lines with their newline; a final line without one counts too
  const out = text.split('\n');
  if (out[out.length - 1] === '') out.pop();
  return out;
}
