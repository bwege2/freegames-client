// No Gravity port (GPL-3.0-or-later; translated in 2026 by the freegames project from realtech VR's
// No Gravity 2.0, GPL-2.0-or-later; LICENSE.md): the game's structures and globals (src/lt_struc.h,
// lt_cmx.h, _nginfo.h, lt_data.c).
import type { OVI, Scene, Material, Key } from '../v3x/vmx.ts';
import type { SpriteGroup, Sprite } from '../gx/gx.ts';
import { vec, mtx, type Vec, type Mtx } from '../v3x/math.ts';

export const MAX_EPISODE = 8, MAX_GAME_EPISODE = 5, MAX_SAVE_GAMES = 10, MAX_POWERUP = 6, MAX_PLAYER = 64,
  MAX_WEAPONS = 64, MAX_ENEMYS = 256, MAX_COM_DELAY = 256, MAX_DEBRIS = 32, MAX_BLASTS = 16, REFRESH_FNF = 7, MAX_TEXT_MENUS = 200;

export const GODMODE = 0x1, STEALTHMODE = 0x2, DOOMEDMODE = 0x4, TURBOMODE = 0x8, FROZENMODE = 0x10;
export const SGNET_HASMOVED = 0x1, SGNET_HASTURN = 0x2, SGNET_HASLEFT = 0x10, SGNET_HASDIE = 0x20, SGNET_HASWARP = 0x40,
  SGNET_NEWSHOOT = 0x80, SGNET_COMMUNICATE = 0x100, SGNET_CHAT = 0x200, SGNET_HASWON = 0x400, SGNET_SHIELDCHANGE = 0x800,
  SGNET_HASRESPAWN = 0x1000, SGNET_UPDATEAIM = 0x2000, SGNET_SHIP = 0x4000, SGNET_MODECHANGE = 1 << 12;

export const GAMESTATE_PLAY = 0, GAMESTATE_DEAD = 1, GAMESTATE_WON = 2, GAMESTATE_FAIL = 3, GAMESTATE_FAILED = 4,
  GAMESTATE_QUIT = 5, GAMESTATE_PAUSE = 6, GAMESTATE_HELP = 7, GAMESTATE_ABORT = 8, GAMESTATE_RETRY = 9;
export const FX_CUSTOM = 0, FX_EXPLODE_1 = 1, FX_IMPACT = 2, FX_SHIELD_1 = 3, FX_DEBRIS = 4, FX_FLARE = 5, FX_FINISH = 6,
  FX_WARPIN = 7, FX_SMOKE = 8, FX_SMOKE2 = 9;
export const ART_NONE = 0, ART_CLOAK = 1, ART_SUPERPOWER = 2, ART_STEALTH = 3, ART_POWER = 4, ART_INVICIBLITY = 5, ART_MEGABANG = 6;
export const CAMERA_SHIP = 5, CAMERA_NAV = 7, CAMERA_DEATH = 8, CAMERA_NEWNAV = 10, CAMERA_START = 12, CAMERA_MISSILE = 14;
export const ORDER_Status = 0, ORDER_AttackTarget = 1, ORDER_Protect = 2, ORDER_StayAlert = 3, ORDER_Attack = 4,
  ORDER_TargetWeakest = 5, ORDER_TargetStrongest = 6, ORDER_Retreat = 7;
export const COM_ShipAttacked = 1, COM_HelpMe = 2, COM_Complete = 3, COM_FindWarp = 4, COM_FriendDead = 5, COM_Failed = 6,
  COM_TimeShort = 7, COM_NearBy = 8, COM_TooFar = 9, COM_EscortOk = 10, COM_Status = 11, COM_Bonus = 15, COM_Weapon = 21,
  COM_Request = 27, COM_Chat = 33;
export const Ms_MENU1 = 0, Ms_FINAL = 1, Ms_OVERTURE = 2, Ms_INTRO = 3, Ms_CREDITS = 4, Ms_FAILED = 5, Ms_SUCCESS = 6;
export const HIND_MODE_PHASE_0 = 0, HIND_MODE_PHASE_1 = 1, HIND_MODE_PHASE_2 = 2, HIND_MAXPLAYER = 16;
export const VCfg_behind = 5, VCfg_led = 12, VCfg_radar = 4, VCfg_sp_radar = 14, VCfg_sp_rear = 5, VCfg_sp_camis = 6,
  VCfg_win_radar = 36, VCfg_win_rear = 28, VCfg_win_camis = 29;
export const CTRL_Mouse = 0, CTRL_Keyb = 1, CTRL_Joystick = 2;

// lt_cmx.h
export const m_MORPH = 1, m_TRACK = 2, m_LOOP = 4, m_OFF = 8, m_REVERSE = 16, m_PINGPONG = 32;
export const t_ET_SHOOT = 1, t_ET_DESTROY = 2, t_ET_SIGHT = 3;
export const t_EC_ENABLE = 1, t_EC_APPEAR = 2, t_EC_SHIELDOFF = 3, t_EC_TRACK_TOGGLE = 4, t_EC_TRACKON = 5, t_EC_TRACKOFF = 6,
  t_EC_MORPHLOOP = 7, t_EC_MORPHON = 8, t_EC_MORPHOFF = 9, t_EC_SHIELDOFFDIE = 10;
export const t_ET_WARP = 1;
export const t_ENEMY = 0, t_FRIEND = 1, t_SPECIAL = 2, t_PIRAT = 3, t_PLAYER = 4, t_OBSTACLE = 5, t_DECOR = 6, t_ACCESSOIRE = 7,
  t_NEUTRAL = 8, t_FIXE = 16, t_TURN_RANDOM = 17, t_TURN_AROUND_X = 18, t_TURN_AROUND_Y = 19, t_TURN_AROUND_Z = 20, t_GIANT = 21,
  t_TRACK = 22, t_MPLAYER = 23, t_TAC_NONE = 32, t_TAC_RANDOM_PATROL = 33, t_TAC_PATROL_FIGHT1 = 34, t_TAC_ATTACK1 = 35,
  t_TAC_TRACK = 36, t_TAC_ATTACK0 = 37, t_TAC_MINE = 38, t_TAC_TRACKSTOP = 39, t_TAC_TRACKFREE = 40, t_TAC_DROID = 41,
  t_TAC_TRACKFULL = 42, t_TAC_HIND = 43, t_COL_NONE = 48, t_COL_AUTOSPHERE = 49, t_COL_AUTOSPHERE2 = 50, t_CS_BUMP = 64,
  t_CS_BUMP_LOSE_SHIELD = 65, t_CS_LOSE_SHIELD = 66, t_CS_ADD_SCORE = 67, t_CS_WARP = 68, t_CS_NAV = 69, t_CS_NAVWARP = 70,
  t_CS_ADD_SCORE_HIDE = 71, t_CS_BONUS = 72, t_AD_ADD_AIM = 73, t_AD_FAILED = 74, t_AD_EXPLODE = 75, t_AD_SUCCESS = 76;

/** SGScript: the behaviour of a kind of object (a "case" of a .cmx) */
export interface SGScript {
  Basename: string; Realname: string;
  Shield: number; ShieldMax: number; Scoring: number; Sight: number; Poids: number;
  Wait: number; ShootOk: number; Appear: number; AfterDeath: number;
  fSpeed: number; fFrozen: number; fSpeedMax: number;
  SifCode: number; AfterDestroy: number; ExplodeMode: number; SoundExplode: number;
  FinisHim: number; Type: number; DebrisMode2: number; AmbiantChannel: number;
  Collision: number; Tactic: number; Attack: number; Animation: number;
  AmbiantSound: number; StartSound: number; Doppler: number; CollisionStyle: number;
  Mission: number; NeverHide: number; ColorRadar: number; Doppling: number;
  Locked: number; Protect: number; LockTime: number; ShootAxe: number;
  Code: number; Avary: number; AppearMode: number; SoundAppear: number;
  Stealth: number; AfterTrack: number; Event: number; EventCode: number;
  BigExplode: number; EventType: number; DebrisMode: number; AnimMode: number;
  Replace: number; NeverShock: number; ColorNav: number; EndTrack: number;
  PlayerNearby: number; NoFog: number; ModeX: number; SpeedTurn: number;
}
export function newScript(): SGScript {
  return {
    Basename: '', Realname: '', Shield: 0, ShieldMax: 0, Scoring: 0, Sight: 0, Poids: 0, Wait: 0, ShootOk: 0, Appear: 0,
    AfterDeath: 0, fSpeed: 0, fFrozen: 0, fSpeedMax: 0, SifCode: 0, AfterDestroy: 0, ExplodeMode: 0, SoundExplode: 0,
    FinisHim: 0, Type: 0, DebrisMode2: 0, AmbiantChannel: 0, Collision: 0, Tactic: 0, Attack: 0, Animation: 0, AmbiantSound: 0,
    StartSound: 0, Doppler: 0, CollisionStyle: 0, Mission: 0, NeverHide: 0, ColorRadar: 0, Doppling: 0, Locked: 0, Protect: 0,
    LockTime: 0, ShootAxe: 0, Code: 0, Avary: 0, AppearMode: 0, SoundAppear: 0, Stealth: 0, AfterTrack: 0, Event: 0,
    EventCode: 0, BigExplode: 0, EventType: 0, DebrisMode: 0, AnimMode: 0, Replace: 0, NeverShock: 0, ColorNav: 0, EndTrack: 0,
    PlayerNearby: 0, NoFog: 0, ModeX: 0, SpeedTurn: 0,
  };
}
export const copyScript = (s: SGScript): SGScript => ({ ...s });

export interface SGDesiredMotion { vel: Vec; aim: Vec; OldAim: Vec; NewAim: Vec; Dist: number; k: number; Ang: number; Reg: number; Id: number }
/** SGActor; OVI.data of an enemy, a friend, an obstacle (and the player's J) */
export interface SGActor { kind: 'actor'; pInf: SGScript; Mv: SGDesiredMotion; OVI: OVI | null; OVItarget: OVI | null; pEffect: SGEffect | null }
export function newActor(): SGActor {
  return { kind: 'actor', pInf: newScript(), Mv: { vel: vec(), aim: vec(), OldAim: vec(), NewAim: vec(), Dist: 0, k: 0, Ang: 0, Reg: 0, Id: 0 }, OVI: null, OVItarget: null, pEffect: null };
}
/** SGWeapon; OVI.data of a shot */
export interface SGWeapon {
  kind: 'weapon'; pInf: SGScript; OVI: OVI; TargetLock: OVI | null; Attacker: SGActor | null; vel: Vec; Target: Vec;
  fTime: number; Delay: number; Available: number; Camera: number; Freeze: number; TagFX: number;
}
export type OviData = SGActor | SGWeapon;

export interface SGWeaponInfo { cur: number; max: number; reload: number; lockTime: number; loadTime: number }
export interface SGShip { defShoot: number; maxWeapons: number; name: string; code: number; wea: SGWeaponInfo[] }
const w = (cur: number, max: number, reload: number, lockTime: number): SGWeaponInfo => ({ cur, max, reload, lockTime, loadTime: 0 });
/** g_pShip (lt_data.c): the three ships and their weapons */
export const g_pShip: SGShip[] = [
  { defShoot: 1, maxWeapons: 6, name: 'viper', code: 0, wea: [w(50, 60, 15, 0), w(40, 60, 31, 0), w(30, 60, 63, 0), w(0, 30, 0, 10), w(30, 60, 0, 0), w(0, 30, 0, 40)] },
  { defShoot: 1, maxWeapons: 6, name: 'raiden', code: 1, wea: [w(30, 60, 63, 0), w(50, 60, 31, 0), w(40, 60, 31, 0), w(5, 30, 0, 30), w(30, 60, 0, 0), w(20, 30, 0, 80)] },
  { defShoot: 2, maxWeapons: 6, name: 'raptor', code: 2, wea: [w(20, 60, 0, 0), w(30, 60, 0, 0), w(50, 60, 63, 0), w(30, 30, 0, 60), w(30, 60, 0, 0), w(40, 40, 0, 100)] },
];
export const copyShip = (s: SGShip): SGShip => ({ ...s, wea: s.wea.map((x) => ({ ...x })) });

export interface SGPowerUp { val: number; MAX_val: number; Time_val: number }
export interface SGPlayer {
  J: SGActor; Rot: Key; Mat: Mtx; Si: SGShip;
  Mv: { x: number; y: number; z: number; inert: number };
  Mx: { but: number; Mat: Mtx };
  Art: SGPowerUp[]; fBooster: number; Notify: number; NetRetry: number; mode: number; CurArt: number;
}
export function newPlayer(): SGPlayer {
  return {
    J: newActor(), Rot: new Float32Array(7), Mat: mtx(), Si: g_pShip[0], Mv: { x: 0, y: 0, z: 0, inert: 0 }, Mx: { but: 0, Mat: mtx() },
    Art: Array.from({ length: 8 }, () => ({ val: 0, MAX_val: 0, Time_val: 0 })), fBooster: 0, Notify: 0, NetRetry: 0, mode: 0, CurArt: 0,
  };
}

/** SGEffect: an explosion, impact, debris, smoke... (an FLC drawn as a sprite) */
export interface SGEffect {
  OVI: OVI | null; Sphere: OVI | null; Sprite: SpriteGroup | null; pos: Vec;
  Step: [number, number]; Nloop: number; LastFrame: number; Size: number;
  keep: Vec; cent: Vec; pos2D: [Vec, Vec]; size2D: [Vec, Vec];
  visible: number; diffuse: [number, number, number]; transparency: number;
  angle: Vec; radius: number; FadeStart: number; TagFx: number; FxCode: number; type: number; Dispo: number;
  useKeep: number; frame: number; PlaySample: number; Light: number;
}
export function newEffect(): SGEffect {
  return {
    OVI: null, Sphere: null, Sprite: null, pos: vec(), Step: [0, 0], Nloop: 0, LastFrame: 0, Size: 0, keep: vec(), cent: vec(),
    pos2D: [vec(), vec()], size2D: [vec(), vec()], visible: 0, diffuse: [0, 0, 0], transparency: 0, angle: new Float32Array(3).fill(0) as Vec,
    radius: 0, FadeStart: 0, TagFx: 0, FxCode: 0, type: 0, Dispo: 1, useKeep: 0, frame: 0, PlaySample: 0, Light: 0,
  };
}

export interface SGENVIRONMENT { SunFlare: number; SpaceDebris: number; Skybox: number; Check: number }
export interface SGWORLD {
  scene_name: string; path_name: string; Nav: SGENVIRONMENT[]; FinCode: number; Focal: number; ZClip: number;
  FogFactor: number; Track: number; Time: number;
}
export interface SGMISSION {
  World: SGWORLD; Nav: SGENVIRONMENT; Sky: OVI | null; Ship: OVI | null; Laser: OVI | null; NavCam: OVI | null; Shield: OVI | null; Cam: OVI | null;
  defTarget: [Vec | null, Vec | null]; Time: number; ParTime: number; IsTimed: number; quit: number; MaxNAV: number; NAV: number;
  CallMode: [number, number]; FinCode: number;
}
export interface SGGameStat {
  time_start: number; time_end: number; killed_nmy: number; total_nmy: number; killed_amy: number; total_amy: number;
  bonus: number; total_bonus: number; shooted: number; hitted: number; newlevel: number; frag: number;
}
export interface SGLevelItem { name: string; tex: string[]; WeaponMax: number; Bonus: number; Time: number; Level: number }
export interface SGEpisodeItem { numLevel: number; LI: SGLevelItem[] }
/** SGPlayerSave: a pilot of the roster (nogravity.pts) or of the hall of fame (nogravity.hsc), 72 bytes */
export interface SGPlayerSave { name: string; level: number[]; episode: number; score: number; life: number; rank: number; last_time: number; active: number; ship: number }
export function newSave(): SGPlayerSave { return { name: '', level: new Array(16).fill(0), episode: 0, score: 0, life: 0, rank: 0, last_time: 0, active: 0, ship: 0 }; }

export interface SGMenu { szTitle: string | (() => string); ptr: { get(): number; set(v: number): void } | null; min: number; max: number; Val: (string | (() => string))[] }

export interface LockInfo { szText: string; color: number; dist: number; dmode: number; shield: number; x: number; y: number; x0: number; y0: number }

/** NG_GameSettings */
export const g_SGSettings = {
  key: new Uint8Array(32), joy: new Uint8Array(32), mou: new Uint8Array(32), joyPOV: new Uint8Array(4),
  WorldUnit: 1, sp_inert: 0, maxCase: 0, player: 0, ResolutionX: 640, ResolutionY: 480, ColorDepth: 32,
  ComNumber: 0, ComTime: 0, ComFTime: 0, VolDIG: 100, VolFX: 100, VolMusic: 100, VisualsFx: 4, Interlaced: 0, ZBuffer: 1, Flip: 0,
  TexFiltering: 1, TexPOT: 0, VerticalSync: 1, Multisampling: 0, Stereo: 0, Language: 0, LangCode: 101 /* 'e' */, LensFX: 1,
  Palette: 0, Dithering: 1, Sky: 1, Shade: 0, Wide: 0, Cheater: 0, Difficulty: 1, CamDisp: 0, TexCompression: 0, bClearView: 0,
  showInf: 1, ticker: 0, cursor: 0, DemoMode: 0, SerialGame: 0, Intro: 0, DuoGame: 0, NextMenu: 0, GoToBrief: 0, RecTime: 15,
  Menu: 1, DemoDelay: 30, rearview: 0, HalfSize: 0, OS: 0, AddOn: 0, FlipYMouse: 0, FrameSkip: 0, Ctrl: CTRL_Mouse,
  MouseSensitivity: 12, ComPlayer: 0, DisplayIndex: 0, AxisThrottle: 0, AxisRoll: 0, AltMouse: 0,
};
export const LK_MAX = 22;
export const LK = {
  THROTTLE: 0, SPEEDPLUS: 1, SPEEDLESS: 2, THRUST: 3, ANTITHRUST: 4, ROLLLEFT: 5, ROLLRIGHT: 6, STOP: 7, NEXTWEAPON: 8, FIRE: 9,
  LOCK: 10, ITEM: 11, NEXTITEM: 12, PREVITEM: 13, NEXTNAV: 14, HUD: 15, RADAR: 16, COM: 17, UP: 18, DOWN: 19, RIGHT: 20, LEFT: 21, TALK: 22,
} as const;
export const lk = (i: number): number => g_SGSettings.key[i];

export interface SGAI { OVI: OVI[]; Target: OVI | null; mode: number; nHind: number; fTime: number }

/** g_SGGame */
export const g_SGGame = {
  Scene: null as Scene | null,
  numWeapons: 0, pWea: [] as SGWeapon[],
  numEffects: 128, pExpl: [] as SGEffect[],
  numPlayer: 1, pPlayer: [] as SGPlayer[],
  numEnemies: 0, pEnemy: [] as SGActor[],
  CameraMode: 0, MaxAim: new Int32Array(8), MaxProtect: new Int32Array(8), Count: 0, oldTimer: 0, Shock: 0,
  RadarRange: 0, DeathDist: 0, pReactorMaterial: null as Material | null, PlayersName: [] as string[], Missile: null as OVI | null,
  CI_COL2: 0, CI_BLACK: 0, CI_YELLOW: 0, CI_RED: 0, CI_WHITE: 0, CI_GREEN: 0, CI_BLUE: 0, CI_BLUELIGHT: 0,
  pColorRadar: new Array<number>(8).fill(0), LockMAX: 0, FlashAlpha: 0, RadarMode: 0, ComMode: 0, MaxDetect: [0, 0],
  WarpOk: 0, IdPlayer: 0, IsHost: 1, Demo: 0, Session: 0, FlashColor: [0, 0, 0] as [number, number, number],
};

export const G = {
  g_pPlayer: null as unknown as SGPlayer,
  g_pPlayerInfo: [] as SGScript[],
  g_SGObjects: {
    World: { scene_name: '', path_name: '', Nav: Array.from({ length: 8 }, () => ({ SunFlare: 0, SpaceDebris: 0, Skybox: 0, Check: 0 })), FinCode: 0, Focal: 0, ZClip: 0, FogFactor: 0, Track: 0, Time: 0 },
    Nav: { SunFlare: 0, SpaceDebris: 0, Skybox: 0, Check: 0 }, Sky: null, Ship: null, Laser: null, NavCam: null, Shield: null, Cam: null,
    defTarget: [null, null], Time: 0, ParTime: 0, IsTimed: 0, quit: 0, MaxNAV: 0, NAV: 0, CallMode: [0, 0], FinCode: 0,
  } as SGMISSION,
  g_pLockTarget: null as OVI | null,
  g_pCamera: null as Key | null,
  g_mtxMissile: mtx(),
  g_cShip: copyShip(g_pShip[0]),
  g_cGameStat: { time_start: 0, time_end: 0, killed_nmy: 0, total_nmy: 0, killed_amy: 0, total_amy: 0, bonus: 0, total_bonus: 0, shooted: 0, hitted: 0, newlevel: 0, frag: 0 } as SGGameStat,
  g_pGameItem: [] as SGEpisodeItem[],
  g_pSaveGames: Array.from({ length: MAX_SAVE_GAMES }, newSave),
  g_pBestGames: Array.from({ length: MAX_SAVE_GAMES }, newSave),
  g_pCurrentGame: null as unknown as SGPlayerSave,
  g_cAI: { OVI: [], Target: null, mode: 0, nHind: 0, fTime: 0 } as SGAI,
  /** g_szGmT: the texts of the language (.msg), 1-based */
  g_szGmT: new Array<string>(MAX_TEXT_MENUS).fill(''),
  g_pszAnimList: [] as string[],
  g_pspFX: [] as SpriteGroup[],
  g_pspFlares: null as SpriteGroup | null,
  g_pspHud: null as unknown as SpriteGroup, g_pspHud2: null as unknown as SpriteGroup, g_pspCat: null as unknown as SpriteGroup,
  g_pFont: null as unknown as SpriteGroup, g_pSmallFont: null as unknown as SpriteGroup, g_pFontMenuLrg: null as unknown as SpriteGroup,
  g_pFontMenuSml: null as unknown as SpriteGroup, g_pspMsg: null as unknown as SpriteGroup, g_pspDispFont: null as unknown as SpriteGroup,
  g_pGameBoard: null as unknown as RWInterface,
  g_cFXTable: { fAlarmTime: 0, Engine: 0, SoundEngine: 0, Alarm: 0, SoundAlarm: 0 },
  g_ubSampleUsed: new Int32Array(32),
  g_SGLockMode: { szText: '', color: 0, dist: 0, dmode: 0, shield: 0, x: 0, y: 0, x0: 0, y0: 0 } as LockInfo,
  g_csPicture: null as Sprite | null,
  /** g_pRecordData: the demo being played */
  rec: { startlevel: 0, version: 0, maxstep: 0, step: 0, pos: [] as { but: number; Mat: Mtx }[], buf: [] as Uint8Array[] },
};

/** RW_Button / RW_Interface (gui_os.h) */
export interface RWButton { LX: number; LY: number; X: number; Y: number; parent: RWButton | null }
export interface RWInterface { numItem: number; item: RWButton[]; keymode: number }
export const RW_BOTH = 0, RW_VERT = 1, RW_HORIZ = 2;

/** g_szWeaponNames, g_szPowerUpNames, g_szCOM, g_szOrder, g_szCamera (lt_data.c): indices into g_szGmT */
export const szCOM = [0, 15, 16, 17, 18, 19, 20, 21, 117, 23, 110, 131, 132, 133, 134, 7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 135, 136, 137, 138, 139, 140, 141];
export const szOrder = [134, 135, 136, 137, 138, 139, 140, 141];
export const szCamera = [-1, 32, 29, 31, 30, 33, 143, 33, 34, 34, 36, 36, 35, -1];
