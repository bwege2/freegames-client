// Chromium B.S.U. port (GPL-3.0-or-later; translated in 2026 by the freegames project from the original by Mark B. Allan, Clarified Artistic License; LICENSE.md): src/Global.cpp, src/Config.cpp,
// src/HiScore.cpp and src/MainGL.cpp. The singletons of the original are one Global object here.
import { sin } from '../libm.ts';
import {
  GL_ALPHA_TEST, GL_BLEND, GL_CULL_FACE, GL_DEPTH_TEST, GL_LEQUAL, GL_MODELVIEW, GL_NORMALIZE, GL_ONE,
  GL_ONE_MINUS_SRC_ALPHA, GL_PROJECTION, GL_SRC_ALPHA, GL_TEXTURE_2D, type GL, type Images, type Text,
} from '../gl.ts';
import { GlibcRand, RandTables } from '../rand.ts';
import { EnemyAmmo, HeroAmmo } from './ammo.ts';
import { AudioOpenAL, MusicGame, MusicMenu, type AudioBackend } from './audio.ts';
import { EnemyFleet } from './enemies.ts';
import { Explosions } from './explosions.ts';
import { GroundMetal } from './ground.ts';
import { DEATH_TIME, HeroAircraft } from './hero.ts';
import { ScreenItemAdd } from './itemadd.ts';
import { MenuGL } from './menu.ts';
import { PowerUps } from './powerups.ts';
import { StatusDisplay } from './status.ts';

const f = Math.fround;

export const Game = 0, Menu = 1, LevelOver = 2, HeroDead = 3;
export const HI_SCORE_HIST = 5;
export const MIN_SCREEN_SIZE = 0, MAX_SCREEN_SIZE = 4;
export const CONFIG_FILE = '.chromium-bsu';
export const CONFIG_SCORE_FILE = '.chromium-bsu-score';

/** the player's files (the original's $HOME) */
export interface Files {
  read(name: string): string | null;
  write(name: string, text: string): void;
}

/** what MainSDL is for the game (src/MainToolkit.h) */
export interface Toolkit {
  grabMouse(status: boolean, warp?: boolean): void;
  setVideoMode(): boolean;
}

/** what the browser (or the test) provides */
export interface Platform {
  gl: GL;
  images: Images;
  /** a new text renderer (MainGL::loadTextures makes one) */
  makeText(): Text;
  audio: AudioBackend;
  files: Files;
  /** time(NULL) */
  now(): number;
  /** the player's name for the high scores (getenv("USER")) */
  user: string;
}

/** printf("%g") */
export function fmtG(v: number): string {
  if (v === 0) return '0';
  const exp = Math.floor(Math.log10(Math.abs(v)));
  let s: string;
  if (exp < -4 || exp >= 6) {
    s = v.toExponential(5);
    let [m, e] = s.split('e');
    if (m.includes('.')) m = m.replace(/0+$/, '').replace(/\.$/, '');
    const n = Number(e);
    e = (n < 0 ? '-' : '+') + String(Math.abs(n)).padStart(2, '0');
    return `${m}e${e}`;
  }
  s = v.toPrecision(6);
  if (s.includes('e')) return fmtG(Number(s));
  if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, '');
  return s;
}

// ---- src/Config.cpp ------------------------------------------------------------------------------
export class Config {
  private screenW_ = 800;
  private screenH_ = 600;
  private screenA_ = f(1.3333333);
  private screenFOV_ = f(30.0);
  private screenNear_ = f(10.0);
  private screenFar_ = f(70.0);
  private fullScreen_ = false;
  private screenBound = new Float32Array([11.0, 9.0]);
  private zTrans_ = f(-56.5);
  private blend_ = true;
  private texBorder_ = true;
  private audio_ = true;
  private swapStereo_ = false;
  private showFPS_ = true;
  private autoSpeed_ = false;
  private trueColor_ = false;
  private usePlayList_ = false;
  private debug_ = false;
  private maxLevel_ = 1;
  private gfxLevel_ = 2;
  private movementSpeed_ = f(0.03);
  private gameSkillBase_ = f(0.5);
  private viewGamma_ = f(1.1);
  private volSound_ = f(0.9);
  private volMusic_ = f(0.5);
  private audioType_ = 0;
  private textType_ = 0;
  private readonly files: Files;

  constructor(files: Files) {
    this.files = files;
    this.readFile();
  }

  screenW(): number { return this.screenW_; }
  screenH(): number { return this.screenH_; }
  screenA(): number { return this.screenA_; }
  screenFOV(): number { return this.screenFOV_; }
  screenNear(): number { return this.screenNear_; }
  screenFar(): number { return this.screenFar_; }
  screenBoundX(): number { return this.screenBound[0]; }
  screenBoundY(): number { return this.screenBound[1]; }
  zTrans(): number { return this.zTrans_; }
  fullScreen(): boolean { return this.fullScreen_; }
  blend(): boolean { return this.blend_; }
  texBorder(): boolean { return this.texBorder_; }
  audioEnabled(): boolean { return this.audio_; }
  swapStereo(): boolean { return this.swapStereo_; }
  autoSpeed(): boolean { return this.autoSpeed_; }
  showFPS(): boolean { return this.showFPS_; }
  setFullScreen(s: boolean): void { this.fullScreen_ = s; }
  setAudio(s: boolean): void { this.audio_ = s; }
  gfxLevel(): number { return this.gfxLevel_; }
  maxLevel(): number { return this.maxLevel_; }
  setGfxLevel(a: number): void { this.gfxLevel_ = a; if (a < 0) this.gfxLevel_ = 0; if (a > 2) this.gfxLevel_ = 2; }
  setMaxLevel(a: number): void { this.maxLevel_ = a; if (a > 10) this.maxLevel_ = 10; }
  movementSpeed(): number { return this.movementSpeed_; }
  gameSkillBase(): number { return this.gameSkillBase_; }
  volSound(): number { return this.volSound_; }
  volMusic(): number { return this.volMusic_; }
  setMovementSpeed(v: number): void {
    this.movementSpeed_ = f(v);
    if (this.movementSpeed_ < 0.01) this.movementSpeed_ = f(0.01);
    if (this.movementSpeed_ > 0.1) this.movementSpeed_ = f(0.1);
  }
  setGameSkillBase(v: number): void {
    this.gameSkillBase_ = f(v);
    if (this.gameSkillBase_ > 0.9) this.gameSkillBase_ = f(0.9);
    if (this.gameSkillBase_ < 0.2) this.gameSkillBase_ = f(0.2);
  }
  setVolSound(v: number): void { this.volSound_ = f(v); if (this.volSound_ < 0.0) this.volSound_ = 0.0; if (this.volSound_ > 1.0) this.volSound_ = 1.0; }
  setVolMusic(v: number): void { this.volMusic_ = f(v); if (this.volMusic_ < 0.0) this.volMusic_ = 0.0; if (this.volMusic_ > 1.0) this.volMusic_ = 1.0; }
  intSkill(): number { return Math.trunc((this.gameSkillBase_ + 0.05) * 10.0); }

  /** Config::readValues: up to 32 fgets() pieces of 63 characters, each matched by its first 8 */
  private readValues(text: string): void {
    const pieces: string[] = [];
    let at = 0;
    while (at < text.length && pieces.length < 32) {
      const nl = text.indexOf('\n', at);
      const end = Math.min(nl < 0 ? text.length : nl + 1, at + 63);
      pieces.push(text.slice(at, end));
      at = end;
    }
    const num = (s: string) => { const m = /^\S+\s+([-+]?[0-9.eE+-]+)/.exec(s); return m ? m[1] : null; };
    const fl = (s: string, set: (v: number) => void) => { const v = num(s); if (v !== null && !Number.isNaN(parseFloat(v))) set(f(parseFloat(v))); };
    const int = (s: string, set: (v: number) => void) => { const v = num(s); if (v !== null && !Number.isNaN(parseInt(v, 10))) set(parseInt(v, 10)); };
    for (const s of pieces) {
      const k = s.slice(0, 8);
      if (k === 'screenSi') int(s, (v) => this.setScreenSize(v));
      if (k === 'screenWi') int(s, (v) => { this.screenW_ = v; });
      if (k === 'screenHe') int(s, (v) => { this.screenH_ = v; });
      if (k === 'mouseSpe' || k === 'movement') fl(s, (v) => { this.movementSpeed_ = v; });
      if (k === 'gameSkil') fl(s, (v) => { this.gameSkillBase_ = v; });
      if (k === 'gfxLevel') int(s, (v) => { this.gfxLevel_ = v; });
      if (k === 'volSound') fl(s, (v) => { this.volSound_ = v; });
      if (k === 'volMusic') fl(s, (v) => { this.volMusic_ = v; });
      if (k === 'full_scr') int(s, (v) => { this.fullScreen_ = !!v; });
      if (k === 'true_col') int(s, (v) => { this.trueColor_ = !!v; });
      if (k === 'swap_ste') int(s, (v) => { this.swapStereo_ = !!v; });
      if (k === 'auto_spe') int(s, (v) => { this.autoSpeed_ = !!v; });
      if (k === 'show_fps') int(s, (v) => { this.showFPS_ = !!v; });
      if (k === 'use_play') int(s, (v) => { this.usePlayList_ = !!v; });
      if (s.slice(0, 5) === 'debug') int(s, (v) => { this.debug_ = !!v; });
      if (k === 'audioTyp') int(s, (v) => { this.audioType_ = v; });
      if (k === 'textType') int(s, (v) => { this.textType_ = v; });
      if (k === 'maxLevel') int(s, (v) => { this.maxLevel_ = v; });
      if (k === 'viewGamm') fl(s, (v) => { this.viewGamma_ = v; });
    }
  }

  readFile(): boolean {
    const text = this.files.read(CONFIG_FILE);
    if (text === null) return false;
    this.readValues(text);
    return true;
  }

  /** Config::saveFile, in the original's text format */
  text(): string {
    const b = (v: boolean) => (v ? 1 : 0);
    return '# Chromium B.S.U. configuration file\n'
      + '# Please read the documentation for more info\n'
      + '# Only modifications to option values are preserved.\n'
      + `use_playList ${b(this.usePlayList_)}\n`
      + `debug ${b(this.debug_)}\n`
      + `full_screen ${b(this.fullScreen_)}\n`
      + `true_color ${b(this.trueColor_)}\n`
      + `swap_stereo ${b(this.swapStereo_)}\n`
      + `auto_speed ${b(this.autoSpeed_)}\n`
      + `show_fps ${b(this.showFPS_)}\n`
      + `screenWidth ${this.screenW_}\n`
      + `screenHeight ${this.screenH_}\n`
      + `gfxLevel ${this.gfxLevel_}\n`
      + `gameSkillBase ${fmtG(this.gameSkillBase_)}\n`
      + `movementSpeed ${fmtG(this.movementSpeed_)}\n`
      + `maxLevel ${this.maxLevel_}\n`
      + `volSound ${fmtG(this.volSound_)}\n`
      + `volMusic ${fmtG(this.volMusic_)}\n`
      + `viewGamma ${fmtG(this.viewGamma_)}\n`
      + `audioType ${this.audioType_}\n`
      + `textType ${this.textType_}\n`;
  }

  saveFile(): void {
    this.files.write(CONFIG_FILE, this.text());
  }

  setScreenSize(m: number): void {
    if (m > MAX_SCREEN_SIZE) m = MAX_SCREEN_SIZE;
    if (m < MIN_SCREEN_SIZE) m = MIN_SCREEN_SIZE;
    const sizes = [[512, 384], [640, 480], [800, 600], [1024, 768], [1280, 960]];
    [this.screenW_, this.screenH_] = sizes[m] ?? [640, 480];
    this.screenA_ = f(f(this.screenW_) / f(this.screenH_));
  }

  approxScreenSize(): number {
    const w = this.screenW_, h = this.screenH_;
    if (w >= 1280 && h >= 960) return 4;
    if (w >= 1024 && h >= 768) return 3;
    if (w >= 800 && h >= 600) return 2;
    if (w >= 640 && h >= 480) return 1;
    return 0;
  }
}

// ---- src/HiScore.cpp -----------------------------------------------------------------------------
const HEADER = '# Chromium B.S.U. high scores file: skill rank score date time(UTC) name (do not remove this comment line)\n';

export class HiScore {
  hiScore: Float64Array[] = [];
  hiScoreName: string[][] = [];
  hiScoreDate: number[][] = [];
  private readonly files: Files;
  private readonly now: () => number;
  private readonly user: string;

  constructor(files: Files, now: () => number, user: string) {
    this.files = files;
    this.now = now;
    this.user = user;
    for (let i = 0; i < 10; i++) {
      this.hiScore[i] = new Float64Array([250000.0, 200000.0, 150000.0, 100000.0, 50000.0]);
      this.hiScoreName[i] = ['nobody', 'nobody', 'nobody', 'nobody', 'nobody'];
      this.hiScoreDate[i] = [946713600, 946713600, 946713600, 946713600, 946713600];
    }
    this.readFile();
  }

  getScore(skill: number, index: number): number {
    if (skill > 0 && skill < 10 && index >= 0 && index < HI_SCORE_HIST) return this.hiScore[skill][index];
    return -1.0;
  }

  getName(skill: number, index: number): string {
    if (skill > 0 && skill < 10 && index >= 0 && index < HI_SCORE_HIST) return this.hiScoreName[skill][index];
    return 'OUT_OF_RANGE';
  }

  getDate(skill: number, index: number): number {
    if (skill > 0 && skill < 10 && index >= 0 && index < HI_SCORE_HIST) return this.hiScoreDate[skill][index] | 0;
    return 0;
  }

  /** the text file (HiScore::saveFile) */
  text(): string {
    let out = HEADER;
    const p2 = (n: number) => String(n).padStart(2, '0');
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < HI_SCORE_HIST; j++) {
        const t = new Date(this.hiScoreDate[i][j] * 1000);
        out += `${i} ${j} ${this.hiScore[i][j].toFixed(6)} ${String(t.getUTCFullYear()).padStart(4, '0')}-${p2(t.getUTCMonth() + 1)}-${p2(t.getUTCDate())}`
          + ` ${p2(t.getUTCHours())}:${p2(t.getUTCMinutes())}:${p2(t.getUTCSeconds())} ${this.hiScoreName[i][j]}\n`;
      }
    }
    return out;
  }

  saveFile(): void {
    this.files.write(CONFIG_SCORE_FILE, this.text());
  }

  readFile(): boolean {
    const text = this.files.read(CONFIG_SCORE_FILE);
    if (text === null || !text.length || text[0] !== '#') return false;
    const lines = text.split('\n').slice(1);
    const re = /^\s*(-?\d+)\s+(-?\d+)\s+([-+0-9.eE]+)\s+(-?\d+)-(-?\d+)-(-?\d+)\s+(-?\d+):(-?\d+):(-?\d+)\s+(\S{1,99})/;
    for (const line of lines) {
      const m = re.exec(line);
      if (!m) continue;
      const i = Number(m[1]), j = Number(m[2]);
      if (i >= 0 && i < 10 && j >= 0 && j < HI_SCORE_HIST) {
        this.hiScore[i][j] = parseFloat(m[3]);
        this.hiScoreDate[i][j] = Date.UTC(Number(m[4]), Number(m[5]) - 1, Number(m[6]), Number(m[7]), Number(m[8]), Number(m[9])) / 1000;
        this.hiScoreName[i][j] = m[10];
      }
    }
    return true;
  }

  private insertScore(skill: number, rank: number, score: number): void {
    for (let i = HI_SCORE_HIST - 2; i >= rank; i--) {
      this.hiScore[skill][i + 1] = this.hiScore[skill][i];
      this.hiScoreName[skill][i + 1] = this.hiScoreName[skill][i];
      this.hiScoreDate[skill][i + 1] = this.hiScoreDate[skill][i];
    }
    this.hiScore[skill][rank] = score;
    this.hiScoreName[skill][rank] = this.user || 'player';
    this.hiScoreDate[skill][rank] = this.now();
  }

  /** inserts the score if it is one; the file is read before and written after (HiScore::set) */
  set(skill: number, score: number): number {
    if (skill > 0 && skill < 10) {
      this.readFile();
      const rank = this.rank(skill, score);
      if (rank > -1) {
        this.insertScore(skill, rank, score);
        this.saveFile();
        return rank + 1;
      }
    }
    return 0;
  }

  check(skill: number, score: number): number {
    if (skill > 0 && skill < 10) return this.rank(skill, score) + 1;
    return 0;
  }

  private rank(skill: number, score: number): number {
    let rank = -1;
    for (let i = HI_SCORE_HIST - 1; i >= 0; i--) if (score > this.hiScore[skill][i]) rank = i;
    return rank;
  }
}

// ---- src/Global.cpp ------------------------------------------------------------------------------
export class Global {
  readonly gl: GL;
  readonly images: Images;
  readonly platform: Platform;
  readonly config: Config;
  readonly hiScore: HiScore;
  readonly rand = new RandTables();
  toolkit!: Toolkit;
  text!: Text;
  fps = f(50.0);
  frame = 0;
  gameFrame = 0;
  gameSpeed = f(0.5);
  gameSkill = f(1.0);
  gameLevel = 1;
  speedAdj = f(1.0);
  scrollSpeed = f(-0.045);
  gameMode = Menu;
  gamePause = false;
  gameQuit = false;
  heroDeath = 0;
  heroSuccess = 0;
  tipShipPast = 0;
  tipSuperShield = 0;
  cursorPos = new Float32Array([0.0, 0.0, 25.0]);
  hero!: HeroAircraft;
  enemyFleet!: EnemyFleet;
  heroAmmo!: HeroAmmo;
  enemyAmmo!: EnemyAmmo;
  itemAdd!: ScreenItemAdd;
  explosions!: Explosions;
  powerUps!: PowerUps;
  audio!: AudioOpenAL;
  ground!: GroundMetal;
  menu!: MenuGL;
  mainGL!: MainGL;
  statusDisplay!: StatusDisplay;
  /** gettext: the port is in English, as the original without a translation */
  tr = (s: string): string => s;

  /** main.cpp: Config::init, Global::init, HiScore::init, srand(seed), generateRandom() */
  constructor(platform: Platform, seed: number) {
    this.platform = platform;
    this.gl = platform.gl;
    this.images = platform.images;
    this.config = new Config(platform.files);
    this.hiScore = new HiScore(platform.files, platform.now, platform.user);
    this.rand.generate(new GlibcRand(seed));
  }

  now(): number { return this.platform.now(); }

  newGame(): void {
    const config = this.config;
    this.hiScore.set(config.intSkill(), this.hero.getScore());
    this.gameSkill = f(config.gameSkillBase() + 0.5);
    this.gameSkill = f(this.gameSkill + (this.gameLevel - 1) * 0.05);
    this.gameFrame = 0;
    this.enemyFleet.clear();
    this.powerUps.clear();
    this.enemyAmmo.clear();
    this.heroAmmo.clear();
    this.itemAdd.clear();
    this.explosions.clear();
    this.hero.newGame();
    this.hero.setLives(4);
    this.gamePause = false;
    this.itemAdd.loadScreenItems();
    this.ground.setVariation(this.gameLevel - 1);
    this.audio.setMusicIndex(this.gameLevel - 1);
  }

  gotoNextLevel(): void {
    const config = this.config;
    this.gameLevel++;
    if (config.maxLevel() < this.gameLevel) config.setMaxLevel(this.gameLevel);
    this.gameSkill = f(this.gameSkill + 0.05);
    if (this.gameSkill > 1.9) this.gameSkill = f(1.9);
    this.gameFrame = 0;
    this.enemyFleet.clear();
    this.powerUps.clear();
    this.enemyAmmo.clear();
    this.heroAmmo.clear();
    this.itemAdd.clear();
    this.hero.fullHealth();
    this.itemAdd.loadScreenItems();
    this.ground.nextVariation();
    this.audio.nextMusicIndex();
  }

  createGame(): void {
    this.mainGL = new MainGL(this);
    this.explosions = new Explosions(this);
    this.enemyFleet = new EnemyFleet(this);
    this.hero = new HeroAircraft(this);
    this.heroAmmo = new HeroAmmo(this);
    this.enemyAmmo = new EnemyAmmo(this);
    this.statusDisplay = new StatusDisplay(this);
    this.powerUps = new PowerUps(this);
    this.ground = new GroundMetal(this);
    this.menu = new MenuGL(this);
    this.itemAdd = new ScreenItemAdd(this);
    this.audio = new AudioOpenAL(this, this.platform.audio);
    this.newGame();
    this.audio.setMusicMode(MusicMenu);
  }

  /** textures are reloaded after a new video mode; WebGL keeps them, nothing to delete */
  deleteTextures(): void {}

  loadTextures(): void {
    this.mainGL.loadTextures();
    this.enemyAmmo.loadTextures();
    this.enemyFleet.loadTextures();
    this.explosions.loadTextures();
    this.hero.loadTextures();
    this.heroAmmo.loadTextures();
    this.ground.loadTextures();
    this.menu.loadTextures();
    this.powerUps.loadTextures();
    this.statusDisplay.loadTextures();
  }
}

// ---- src/MainGL.cpp ------------------------------------------------------------------------------
export class MainGL {
  private readonly game: Global;

  constructor(game: Global) {
    this.game = game;
    this.initGL();
    this.loadTextures();
  }

  initGL(): void {
    const gl = this.game.gl;
    const config = this.game.config;
    this.reshapeGL();
    gl.disable(GL_DEPTH_TEST);
    gl.depthFunc(GL_LEQUAL);
    gl.enable(GL_TEXTURE_2D);
    gl.enable(GL_BLEND);
    gl.blendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
    if (config.blend()) {
      gl.blendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
      gl.enable(GL_BLEND);
      gl.disable(GL_ALPHA_TEST);
    } else {
      gl.disable(GL_BLEND);
      gl.enable(GL_ALPHA_TEST);
    }
    gl.enable(GL_CULL_FACE);
    gl.disable(GL_NORMALIZE);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
  }

  loadTextures(): void {
    this.game.text = this.game.platform.makeText();
  }

  drawGL(): void {
    switch (this.game.gameMode) {
      case Game: this.drawGameGL(); break;
      case HeroDead: this.drawDeadGL(); break;
      case LevelOver: this.drawSuccessGL(); break;
      case Menu: this.game.menu.drawGL(); break;
    }
  }

  private drawGameGL(): void {
    const g = this.game;
    const gl = g.gl;
    gl.clear();
    gl.loadIdentity();
    gl.translatef(0.0, 0.0, g.config.zTrans());
    if (!g.gamePause) {
      g.itemAdd.putScreenItems();
      g.enemyFleet.update();
      g.powerUps.update();
      g.heroAmmo.updateAmmo();
      g.enemyAmmo.updateAmmo();
      g.heroAmmo.checkForHits(g.enemyFleet);
      if (g.gameMode === Game) {
        g.enemyAmmo.checkForHits(g.hero);
        g.hero.checkForCollisions(g.enemyFleet);
        g.hero.checkForPowerUps(g.powerUps);
      }
      g.explosions.update();
      g.audio.update();
      g.hero.update();
      g.gameFrame++;
    }
    gl.blendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
    g.ground.drawGL();
    g.enemyFleet.drawGL();
    g.hero.drawGL();
    if (g.config.gfxLevel() > 0) g.statusDisplay.darkenGL();
    gl.blendFunc(GL_SRC_ALPHA, GL_ONE);
    g.powerUps.drawGL();
    g.heroAmmo.drawGL();
    g.enemyAmmo.drawGL();
    g.explosions.drawGL();
    g.statusDisplay.drawGL(g.hero);
  }

  private drawDeadGL(): void {
    const g = this.game;
    const gl = g.gl;
    const config = g.config;
    g.heroDeath--;
    gl.clear();
    gl.loadIdentity();
    if (g.heroDeath > 0) {
      const z = f((1.0 * g.heroDeath) / DEATH_TIME);
      gl.translatef(0.0, 0.0, f(config.zTrans() - f(z * z)));
    } else gl.translatef(0.0, 0.0, config.zTrans());
    g.itemAdd.putScreenItems();
    g.explosions.update();
    g.powerUps.update();
    g.enemyFleet.update();
    g.heroAmmo.updateAmmo();
    g.enemyAmmo.updateAmmo();
    g.heroAmmo.checkForHits(g.enemyFleet);
    g.audio.update();
    g.hero.update();
    g.gameFrame++;
    gl.blendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
    g.ground.drawGL();
    g.enemyFleet.drawGL();
    if (config.gfxLevel() > 0) g.statusDisplay.darkenGL();
    gl.blendFunc(GL_SRC_ALPHA, GL_ONE);
    g.powerUps.drawGL();
    g.heroAmmo.drawGL();
    g.enemyAmmo.drawGL();
    g.explosions.drawGL();
    g.statusDisplay.drawGL(g.hero);
    const skill = config.intSkill();
    const heroScore = g.hero.getScore();
    const rank = g.hiScore.check(skill, heroScore);
    if (rank === 1) this.drawTextGL(g.tr(`new high score!\n\n${Math.trunc(heroScore)}`), g.heroDeath, 0.15);
    else if (rank > 1) this.drawTextGL(g.tr(`n o t   b a d !\nrank : ${rank}\n\n${Math.trunc(heroScore)}`), g.heroDeath, 0.15);
    else this.drawTextGL(g.tr('l o s e r'), g.heroDeath, 0.25);
  }

  private drawSuccessGL(): void {
    const g = this.game;
    const gl = g.gl;
    const config = g.config;
    g.heroSuccess--;
    if (g.heroSuccess < -500) {
      g.gotoNextLevel();
      g.gameMode = Game;
      g.audio.setMusicMode(MusicGame);
      g.audio.setMusicVolume(config.volMusic());
      return;
    }
    const fr = f(-g.heroSuccess / 450.0);
    if (g.heroSuccess < 0) {
      const vol = f(config.volMusic() - f(config.volMusic() * fr));
      g.audio.setMusicVolume(vol);
    }
    gl.clear();
    gl.loadIdentity();
    gl.translatef(0.0, 0.0, config.zTrans());
    g.enemyFleet.update();
    g.explosions.update();
    g.heroAmmo.updateAmmo();
    g.hero.update();
    g.audio.update();
    gl.blendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
    g.ground.drawGL();
    g.hero.drawGL();
    if (config.gfxLevel() > 0) g.statusDisplay.darkenGL();
    gl.blendFunc(GL_SRC_ALPHA, GL_ONE);
    g.heroAmmo.drawGL();
    g.explosions.drawGL();
    g.statusDisplay.drawGL(g.hero);
    this.drawTextGL(g.tr(`congratulations!\n \nl e v e l\n ${g.gameLevel} \nc o m p l e t e\n \n`), g.heroSuccess, 0.15);
  }

  private drawTextGL(str: string, pulse: number, scale: number): void {
    const g = this.game;
    const gl = g.gl;
    pulse = f(pulse);
    scale = f(scale);
    const tmp = f(0.5 + 0.5 * sin(pulse * 0.02));
    let aa = f(0.7 - 0.5 * tmp);
    if (pulse > -50.0) aa = f(aa * (-pulse / 50.0));
    const ca = f(1.0 - tmp);
    const height = f(1.5 * g.text.lineHeight());
    const lines = str.slice(0, 127).split('\n').slice(0, 10);
    const minY = f(0.5 * height * lines.length);
    for (let l = 0; l < lines.length; l++) {
      const y = f(minY - f(height * (l + 1)));
      if (lines[l].length > 0) {
        for (let i = 0; i < 6; i++) {
          gl.color4f(1.0, f(ca * ca) * 0.3, ca * 0.3, f(aa * aa));
          const xSin = f(1.75 * sin(i + g.frame * 0.06));
          const ySin = f(0.75 * sin(i + g.frame * 0.09));
          gl.pushMatrix();
          gl.scalef(scale, scale * 0.75, 1.0);
          const width = g.text.advance(lines[l]);
          gl.translatef(-(width / 2.0) - xSin, f(y + ySin), 0.0);
          g.text.render(lines[l]);
          gl.popMatrix();
        }
      }
    }
  }

  reshapeGL(): void {
    const gl = this.game.gl;
    const config = this.game.config;
    gl.matrixMode(GL_PROJECTION);
    gl.loadIdentity();
    gl.perspective(config.screenFOV(), config.screenA(), config.screenNear(), config.screenFar());
    gl.matrixMode(GL_MODELVIEW);
    gl.viewport(0, 0, config.screenW(), config.screenH());
  }
}
