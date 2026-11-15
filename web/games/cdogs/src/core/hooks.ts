// Late-bound calls between the translated modules (the C files call each other freely; these break the import
// cycles that would otherwise run module code before its dependencies exist). Each is set by the module that
// implements it (objs.ts, actors.ts, handle.ts).
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Vec2 } from './base.ts';
import type { Character, PlayerData } from './types.ts';
import type { GameEvent } from './events.ts';

export interface ObjAddMsg {
  UID: number;
  MapObjectClass: string;
  Pos: Vec2;
  ThingFlags: number;
  Health: number;
  Mask: { r: number; g: number; b: number; a: number };
}

export const buildHooks = {
  objAdd: (_m: ObjAddMsg): void => {},
  objsGetNextUID: (): number => 0,
  gameEventNewActorAdd: (_pos: Vec2, _c: Character, _p: PlayerData | null): GameEvent => ({ Type: 0, Delay: 0, u: {} as any }),
  actorsPilotVehicles: (): void => {},
  handleGameEvents: (): void => {},
};

/** what the simulation asks of the platform (input.c, joystick.c): lock the keys after a pickup menu, the name of
 * a player's button for the "to pick up" chatter, rumble */
export const platformHooks = {
  lockInput: (): void => {},
  buttonName: (_p: PlayerData, _cmd: number): string => '',
  joyImpact: (_deviceIndex: number): void => {},
  hasGrenadeButton: (_p: PlayerData): boolean => false,
};


/** the camera and HUD the events reach (camera.c, hud.c); the simulation only passes the camera through */
export type CameraRef = object;
export const cameraHooks = {
  followNextPlayer: (_c: CameraRef): void => {},
  numPopup: (_c: CameraRef, _type: number, _idx: number, _amount: number): void => {},
  shake: (_c: CameraRef, _amount: number, _subjectOnly: boolean, _actorUID: number): void => {},
  message: (_c: CameraRef, _msg: string, _ticks: number): void => {},
  showExit: (_c: CameraRef): void => {},
};
