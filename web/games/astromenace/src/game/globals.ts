// AstroMenace 1.4.3 (Mikhail Kurinnoi, Viewizard; GPL-3.0-or-later): the global game variables the
// original keeps in src/game/game.cpp (difficulty penalties, the player's systems, PlayerFighter) and
// the sound entry points of src/assets/audio.h, which the browser's audio backend fills in.
// Changed for the browser by the freegames project, 2026.
import type { Vec3 } from '../core/math.ts';

/** the game's state shared by the object code (game.cpp globals) */
export const G = {
  GameEnemyWeaponPenalty: 1,
  GameEnemyArmorPenalty: 1,
  GameEnemyTargetingSpeedPenalty: 1,
  GameUnlimitedAmmo: 0,
  GameUndestroyableWeapon: 0,
  GameWeaponTargetingMode: 0,
  GameSpaceShipControlMode: 0,
  GameEngineSystem: 0,
  GameTargetingSystem: 0,
  GameAdvancedProtectionSystem: 0,
  GamePowerSystem: 0,
  GameTargetingMechanicSystem: 0,
  /** game_player_ship.cpp */
  PlayerFighterLeftEng: false,
  PlayerFighterRightEng: false,
  /** the profile's ship hull (GameConfig().Profile[CurrentProfile].ShipHull), for GetShipWeaponSlotAngle */
  ShipHull: 1,
  /** the score of the mission, in money and experience (AddBonusForKilledEnemy) */
  GameMoney: 0,
  GameExperience: 0,
  /** "Mission complete" was set (game.cpp SetGameMissionComplete) */
  onMissionComplete: (): void => {},
};

export const GameSFX = {
  none: 0, WeaponMalfunction_Kinetic: 1, WeaponMalfunction_Particle: 2, WeaponMalfunction_Beam: 3, WeaponMalfunction_Energy: 4,
  WeaponMalfunction_Launcher: 5, Explosion_Small: 6, Explosion_Medium: 7, Explosion_Big: 8, Explosion_Big_Energy: 9,
  WeaponFire_Kinetic1: 10, WeaponFire_Kinetic2: 11, WeaponFire_Kinetic3: 12, WeaponFire_Kinetic4: 13, WeaponFire_Ion1: 14,
  WeaponFire_Ion2: 15, WeaponFire_Ion3: 16, WeaponFire_Plasma1: 17, WeaponFire_Plasma2: 18, WeaponFire_Plasma3: 19,
  WeaponFire_Maser1: 20, WeaponFire_Maser2: 21, WeaponFire_Antimatter: 22, WeaponFire_Laser: 23, WeaponFire_Gauss: 24,
  WeaponFire_SmallMissile: 25, WeaponFire_NormalMissile: 26, WeaponFire_Torpedo: 27, WeaponFire_Bomb: 28,
  Hit_Kinetic: 29, Hit_Ion: 30, Hit_Plasma: 31, Hit_Antimatter: 32, Hit_Gauss: 33,
};
export type GameSFX = number;

export const MenuSFX = {
  OverSmallButton: 0, OverBigButton: 1, Click: 2, SwitchToAnotherMenu: 3, TapingClick: 4, OverLine: 5, SelectLine: 6,
  CanNotClick: 7, DragError: 8, DragUninstallFromSlot: 9, DragInstallToSlot: 10, DragRelease: 11, MissionShowMenu: 12,
  MissionHideMenu: 13, WarningLowLife: 14,
};
export type MenuSFX = number;

export const VoicePhrase = {
  Attention: 0, EngineMalfunction: 1, MissileDetected: 2, PowerSupplyReestablished: 3, PrepareForAction: 4,
  ReactorMalfunction: 5, Warning: 6, WeaponDamaged: 7, WeaponDestroyed: 8, WeaponMalfunction: 9,
};
export type VoicePhrase = number;

export const MusicTheme = { NONE: 0, MENU: 1, GAME: 2, BOSS: 3, FAILED: 4, CREDITS: 5 };
export type MusicTheme = number;

/**
 * The parts of the config file (config/config.h) the object code reads. The browser port takes the
 * values the original sets on its first start with an OpenGL 3.0 card (main.cpp CheckOpenGLCapabilities):
 * GLSL 1.20 shaders, all visual effects, 4 point lights; config.ts loads and saves the rest.
 */
export const config = {
  UseGLSL120: true,
  VisualEffectsQuality: 0,
  MaxPointLights: 4,
};

/** the audio functions (assets/audio.cpp); render/audio.ts installs the Web Audio versions */
export const audio = {
  playMenuSFX: (_id: MenuSFX, _vol: number): number => 0,
  playGameSFX: (_id: GameSFX, _vol: number, _loc: Vec3, _atType = 1): number => 0,
  playVoicePhrase: (_id: VoicePhrase, _vol: number): number => 0,
  playMusicTheme: (_theme: MusicTheme, _fadeIn: number, _fadeOut: number): void => {},
  isSoundAvailable: (_id: number): boolean => false,
  stopSound: (_id: number, _fade: number): void => {},
  setSoundLocation: (_id: number, _x: number, _y: number, _z: number): void => {},
};
