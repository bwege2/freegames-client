// C-Dogs SDL 2.5.0 on the website (cdogs.c main): the data, the loading screen, the main menu and the screen loop.
// The game draws at its own resolution (640x480 window / scale 2 with the DOS pixel aspect: 320x200) onto a
// PixelScreen; sound and music go through Web Audio; options, autosave, player templates and high scores are the
// original's files in the player's server storage. Online play: online.ts.
import type { GameContext, StartGame } from '../../../src/sdk/index.ts';
import { PixelScreen } from '../../../src/sdk/index.ts';
import { srand } from './core/base.ts';
import { ConfigFromJSON, ConfigGet, ConfigGetBool, ConfigGetInt } from './core/config.ts';
import { CampaignEntryTryLoad, GameDataLoad, type DataFS } from './core/data.ts';
import { gSoundDevice } from './core/sounds.ts';
import { HandleGameEvents } from './core/handle.ts';
import { localPlayers, PlayerDataDefault } from './core/player.ts';
import { GAME_EVENT_PLAYER_DATA, GameEventNew, GameEventsEnqueue, GameEventsInit, gGameEvents } from './core/events.ts';
import { CampaignAndMissionSetup } from './ui/prep.ts';
import { RunGame } from './ui/rungame.ts';
import { musicPlayer } from './core/music.ts';
import { PicLoad, PicShrink, PicTrim } from './core/pics.ts';
import { AutosaveLoadText, autosaveHooks } from './core/autosave.ts';
import { PlayerTemplatesLoadText } from './core/templates.ts';
import { INPUT_DEVICE_KEYBOARD } from './core/types.ts';
import { gCampaign, gPlayerDatas } from './core/state.ts';
import { CampaignLoad } from './core/data.ts';
import { SetupQuickPlayCampaign } from './core/quickplay.ts';
import { assetFS } from './platform/assets.ts';
import { Audio } from './platform/audio.ts';
import { ev, mouseButton, mouseMove, mouseWheel, onKey, onText } from './platform/input.ts';
import { FontLoad, Gfx, setGfx, gGfx } from './render/gfx.ts';
import { LoopRunner } from './ui/loop.ts';
import { LoadingScreenDrawInner, ScreenLoading } from './ui/loading.ts';
import { LoadAllCampaigns, MainMenu } from './ui/mainmenu.ts';
import { applyHooks, configStore } from './ui/options.ts';
import { briefingHooks } from './ui/briefing.ts';
import { templateStore } from './ui/playerselect.ts';
import { scoreStore } from './ui/hiscores.ts';
import { setupOnline } from './online.ts';

const CONFIG_FILE = 'options.cnf';
const AUTOSAVE_FILE = 'autosave.json';
const PLAYERS_FILE = 'players.cnf';
const SCORES_FILE = 'scores.json';

/** GraphicsConfigSet: the game's resolution and the shape of its pixels */
function resolution(): { w: number; h: number; aspect: number } {
  const ww = ConfigGetInt('Graphics.WindowWidth');
  const wh = ConfigGetInt('Graphics.WindowHeight');
  const s = ConfigGetInt('Graphics.ScaleFactor');
  const dos = ConfigGetBool('Graphics.DOSPAR');
  const w = Math.trunc(ww / s);
  const h = dos ? Math.trunc(Math.trunc((wh * 5) / s) / 6) : Math.trunc(wh / s);
  return { w, h, aspect: ww / w / (wh / h) };
}

class CDogs {
  private frames = 0;
  private screen: PixelScreen | null = null;
  private screenAbort: AbortController | null = null;
  private image: ImageData | null = null;
  private loop = new LoopRunner();
  private audio: Audio;
  private fs: DataFS & { url(path: string): string | null };

  constructor(private host: HTMLElement, private ctx: GameContext) {
    this.fs = assetFS(ctx.signal);
    this.audio = new Audio(ctx.audio, (p) => this.fs.read(p));
  }

  private makeScreen(): void {
    const r = resolution();
    this.screenAbort?.abort();
    this.screenAbort = new AbortController();
    const signal = AbortSignal.any([this.ctx.signal, this.screenAbort.signal]);
    this.screen = new PixelScreen(this.host, { width: r.w, height: r.h, pixelAspect: r.aspect }, signal);
    this.screen.canvas.style.imageRendering = ConfigGetInt('Graphics.ScaleMode') === 1 ? 'auto' : 'pixelated';
    this.image = this.screen.ctx.createImageData(r.w, r.h);
    if (gGfx.w !== r.w || gGfx.h !== r.h) gGfx.resize(r.w, r.h);
    gGfx.brightness = ConfigGetInt('Graphics.Brightness');
    gSoundDevice.screenWidth = r.w;
    const c = this.screen.canvas;
    c.addEventListener('pointermove', (e) => {
      const p = this.screen!.toPixel(e.clientX, e.clientY);
      if (p) mouseMove({ x: Math.floor(p.x), y: Math.floor(p.y) });
    }, { signal });
    c.addEventListener('pointerdown', (e) => mouseButton(e.button === 2 ? 3 : e.button === 1 ? 2 : 1, true), { signal });
    c.addEventListener('pointerup', (e) => mouseButton(e.button === 2 ? 3 : e.button === 1 ? 2 : 1, false), { signal });
    c.addEventListener('contextmenu', (e) => e.preventDefault(), { signal });
    c.addEventListener('wheel', (e) => {
      e.preventDefault();
      mouseWheel(0, -Math.sign(e.deltaY));
    }, { signal, passive: false });
  }

  private present(): void {
    const img = this.image!;
    const src = gGfx.frame;
    const dst = new Uint32Array(img.data.buffer);
    // little-endian ImageData: r | g << 8 | b << 16 | a << 24, as the frame
    dst.set(src.length === dst.length ? src : src.subarray(0, dst.length));
    this.screen!.ctx.putImageData(img, 0, 0);
  }

  private async readText(name: string): Promise<string | null> {
    try {
      const b = await this.ctx.storage.get(name);
      return b ? new TextDecoder().decode(b) : null;
    } catch {
      return null;
    }
  }
  private writeText(name: string, text: string): void {
    void this.ctx.storage.put(name, new TextEncoder().encode(text)).catch(() => {});
  }

  /** a mission straight from a campaign path (the browser tests and the screenshots: the menus are slow) */
  async quickStart(path: string, mode: number, mission: number, players: number): Promise<boolean> {
    const entry = await CampaignEntryTryLoad(this.fs, path, mode);
    if (!entry) return false;
    gCampaign.Entry.Mode = mode;
    if (!(await CampaignLoad(this.fs, gCampaign, entry))) return false;
    gCampaign.IsComplete = false;
    gCampaign.IsQuit = false;
    gCampaign.MissionIndex = mission;
    GameEventsInit(gGameEvents);
    gPlayerDatas.length = 0;
    localPlayers.firstUID = 0;
    localPlayers.ownUIDs = null;
    for (let i = 0; i < players; i++) {
      const e = GameEventNew(GAME_EVENT_PLAYER_DATA);
      e.u = PlayerDataDefault(i);
      e.u.UID = localPlayers.firstUID + i;
      GameEventsEnqueue(gGameEvents, e);
    }
    HandleGameEvents(gGameEvents, null, null, null);
    for (const p of gPlayerDatas) {
      p.inputDevice = INPUT_DEVICE_KEYBOARD;
      p.deviceIndex = 0;
    }
    CampaignAndMissionSetup();
    // the test starts a mission from nothing: the menus below go
    this.loop.reset(ScreenLoading('Starting game...', true, RunGame(), false));
    return true;
  }

  async start(): Promise<void> {
    const { ctx } = this;
    srand(Math.trunc(Date.now() / 1000));
    const [options, autosave, players, scores] = await Promise.all([
      this.readText(CONFIG_FILE), this.readText(AUTOSAVE_FILE), this.readText(PLAYERS_FILE), this.readText(SCORES_FILE),
    ]);
    if (options) ConfigFromJSON(options);
    ConfigGet('Graphics.ShowHUD').value = true;
    ConfigGet('Graphics.ShakeMultiplier').value = 1;
    setGfx(new Gfx(resolution().w, resolution().h));
    this.makeScreen();

    // for the screenshots and the browser tests: what the game is showing, and a mission straight from
    // its campaign entry (the menus are walked with keys in the tests that want to)
    (window as any).__cdogs = {
      frames: () => this.frames,
      loops: () => this.loop.Loops.length,
      top: () => this.loop.top(),
      stack: () => this.loop.stack(),
      players: () => gPlayerDatas.map((p) => ({ own: p.isOwn, local: p.IsLocal, device: p.inputDevice })),
      start: (path: string, mode: number, mission: number, players = 1) => this.quickStart(path, mode, mission, players),
    };
    window.addEventListener('keydown', (e) => {
      if (e.ctrlKey && (e.code === 'KeyR' || e.code === 'KeyW')) return;
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) onText(e.key);
      if (onKey(e.code, true, e.repeat)) e.preventDefault();
    }, { signal: ctx.signal });
    window.addEventListener('keyup', (e) => {
      if (onKey(e.code, false, false)) e.preventDefault();
    }, { signal: ctx.signal });
    window.addEventListener('blur', () => { ev.HasLostFocus = true; }, { signal: ctx.signal });
    window.addEventListener('focus', () => { ev.HasLostFocus = false; }, { signal: ctx.signal });

    // the font, then the loading screen as data loads (LoadingScreenDraw: a frame, a click, 70 ms)
    const fontJson = JSON.parse(new TextDecoder().decode(await this.fs.read('graphics/font.json')));
    FontLoad(await this.fs.read('graphics/font.png'), fontJson, PicTrim, PicShrink, (size, off, img) => PicLoad(size, off, img, false));
    const draw = async (text: string, pct: number): Promise<void> => {
      gGfx.preRender();
      LoadingScreenDrawInner(text, pct);
      gGfx.postRender();
      this.present();
      await new Promise((r) => setTimeout(r, 70));
    };
    await draw('Loading graphics...', 0.0);
    await GameDataLoad(this.fs, (text, pct) => (text !== 'Loading graphics...' ? draw(text, pct) : undefined));
    await draw('Loading autosaves...', 0.09);
    autosaveHooks.campaignExists = (path) => this.fs.exists(`${path}/campaign.json`);
    AutosaveLoadText(autosave);
    PlayerTemplatesLoadText(players);
    let scoresText = scores;
    scoreStore.load = () => scoresText;
    scoreStore.save = (t) => {
      scoresText = t;
      this.writeText(SCORES_FILE, t);
    };
    configStore.save = (t) => this.writeText(CONFIG_FILE, t);
    templateStore.save = (t) => this.writeText(PLAYERS_FILE, t);
    briefingHooks.saveAutosave = (t) => this.writeText(AUTOSAVE_FILE, t);
    briefingHooks.load = (entry) => CampaignLoad(this.fs, gCampaign, entry, (s) => SetupQuickPlayCampaign(s, false));

    // sound: every file of the sound directory decoded up front; music when it plays
    gSoundDevice.player = this.audio;
    musicPlayer.exists = (p) => this.fs.exists(p);
    musicPlayer.onPlay = (p) => this.audio.playMusic(p);
    void this.audio.load(this.fs.list('sounds'));
    applyHooks.sound = () => this.audio.reconfigure();
    applyHooks.graphics = () => {
      const r = resolution();
      const resized = r.w !== gGfx.w || r.h !== gGfx.h;
      this.makeScreen();
      if (ConfigGetBool('Graphics.Fullscreen') !== !!document.fullscreenElement) {
        if (ConfigGetBool('Graphics.Fullscreen')) void this.host.requestFullscreen?.().catch(() => {});
        else void document.exitFullscreen?.().catch(() => {});
      }
      return resized;
    };

    gPlayerDatas.length = 0;
    const campaigns = await LoadAllCampaigns(this.fs);
    setupOnline(ctx, this.host, this.fs);
    await draw('Loading main menu...', 1.0);
    this.loop.push(MainMenu(campaigns));
    this.loop.push(ScreenLoading('Loading main menu...', false, null, false));
    this.loop.present = () => {
      if (this.audio.musicReduced !== gSoundDevice.musicReduced) {
        this.audio.musicReduced = gSoundDevice.musicReduced;
        this.audio.reconfigure();
      }
      this.present();
    };
    this.loop.onEmpty = () => ctx.exit();
    ctx.frame((_t, dt) => {
      this.frames++;
      this.loop.tick(dt);
    });
    this.host.tabIndex = 0;
    this.host.focus();
  }

  stop(): void {
    delete (window as any).__cdogs;
    this.audio.playMusic(null);
    gSoundDevice.player = null;
    this.screenAbort?.abort();
  }
}

export const start: StartGame = async (host, ctx) => {
  const game = new CDogs(host, ctx);
  try {
    await game.start();
  } catch (e) {
    console.log('[cd]', (e as Error).stack);
    throw e;
  }
  return { stop: () => game.stop() };
};
