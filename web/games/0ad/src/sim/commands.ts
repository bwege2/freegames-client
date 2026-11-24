// The commands a human player issues in one turn, as the lockstep carries them (protocol/games/0ad.capnp
// `Command`). The same executor runs a command in single-player (at once, for the local player) and in
// online play (on both clients, for the seat that sent it), so both paths have exactly one meaning.
//
// A command names entities by id; ids are identical on every client because every client creates the
// map, spawns the same entities and applies the same commands in the same order. Ownership is checked
// here, not trusted from the sender: a command may only touch the sender's own units and buildings.
import type { World } from './world.ts';
import type { Stance } from './types.ts';
import type { Command as CommandMsg, Turn as TurnMsg } from '../proto/0ad.ts';

export const STANCES: readonly Stance[] = ['aggressive', 'defensive', 'standground', 'passive'];

export type PlayerCommand =
  | { type: 'move'; units: number[]; x: number; z: number }
  | { type: 'gather'; units: number[]; target: number }
  | { type: 'attack'; units: number[]; target: number }
  | { type: 'build'; units: number[]; target: number }
  | { type: 'train'; building: number; template: string }
  | { type: 'place'; template: string; x: number; z: number; yaw: number; builders: number[] }
  | { type: 'stop'; units: number[] }
  | { type: 'stance'; units: number[]; stance: number }
  | { type: 'rally'; building: number; x: number; z: number };

export interface TurnCommands {
  turn: number;
  commands: PlayerCommand[];
}

/** The ids of the entities among `ids` that the player owns and that are alive. */
function own(world: World, player: number, ids: readonly number[]): number[] {
  const out: number[] = [];
  for (const id of ids) {
    const e = world.entity(id);
    if (e && e.alive && e.player === player) out.push(id);
  }
  return out;
}

/**
 * Runs one command for `player` (1 or 2) on `world`. Returns true when it reached the simulation; false
 * for a command that is not the player's, names nothing, or the world refuses (resources, place, ...).
 */
export function applyCommand(world: World, player: number, c: PlayerCommand): boolean {
  switch (c.type) {
    case 'move': {
      const units = own(world, player, c.units);
      if (!units.length) return false;
      world.orderMove(units, c.x, c.z);
      return true;
    }
    case 'gather': {
      const units = own(world, player, c.units);
      return units.length > 0 && world.orderGather(units, c.target);
    }
    case 'attack': {
      const units = own(world, player, c.units);
      const target = world.entity(c.target);
      return units.length > 0 && !!target && target.player !== player && world.orderAttack(units, c.target);
    }
    case 'build': {
      const units = own(world, player, c.units);
      return units.length > 0 && world.orderBuild(units, c.target);
    }
    case 'train': {
      const b = world.entity(c.building);
      if (!b || b.player !== player) return false;
      return world.queueTraining(c.building, c.template);
    }
    case 'place': {
      const b = world.placeBuilding(player, c.template, c.x, c.z, c.yaw);
      if (!b) return false;
      const builders = own(world, player, c.builders);
      if (builders.length) world.orderBuild(builders, b.id);
      return true;
    }
    case 'stop': {
      let any = false;
      for (const id of own(world, player, c.units)) {
        const e = world.entity(id);
        if (!e || e.kind !== 'unit') continue;
        world.setOrder(e, null);
        any = true;
      }
      return any;
    }
    case 'stance': {
      const stance = STANCES[c.stance];
      if (!stance) return false;
      let any = false;
      for (const id of own(world, player, c.units)) {
        const e = world.entity(id);
        if (!e || e.kind !== 'unit') continue;
        e.stance = stance;
        any = true;
      }
      return any;
    }
    case 'rally': {
      const b = world.entity(c.building);
      if (!b || b.player !== player || b.kind !== 'building') return false;
      b.rally = { x: c.x, z: c.z };
      return true;
    }
  }
}

/** Fills one schema `Command` from a command. */
export function writeCommand(c: PlayerCommand, out: CommandMsg): void {
  const ids = (list: readonly number[]) => (init: (n: number) => { set(i: number, value: number): void }) => {
    const l = init(list.length);
    list.forEach((id, i) => l.set(i, id));
  };
  switch (c.type) {
    case 'move': {
      const m = out._initMove();
      ids(c.units)((n) => m._initUnits(n));
      m.x = c.x;
      m.z = c.z;
      break;
    }
    case 'gather':
    case 'attack':
    case 'build': {
      const t = c.type === 'gather' ? out._initGather() : c.type === 'attack' ? out._initAttack() : out._initBuild();
      ids(c.units)((n) => t._initUnits(n));
      t.target = c.target;
      break;
    }
    case 'train': {
      const t = out._initTrain();
      t.building = c.building;
      t.template = c.template;
      break;
    }
    case 'place': {
      const p = out._initPlace();
      p.template = c.template;
      p.x = c.x;
      p.z = c.z;
      p.yaw = c.yaw;
      ids(c.builders)((n) => p._initBuilders(n));
      break;
    }
    case 'stop': {
      const u = out._initStop();
      ids(c.units)((n) => u._initUnits(n));
      break;
    }
    case 'stance': {
      const s = out._initStance();
      ids(c.units)((n) => s._initUnits(n));
      s.stance = c.stance;
      break;
    }
    case 'rally': {
      const r = out._initRally();
      r.building = c.building;
      r.x = c.x;
      r.z = c.z;
      break;
    }
  }
}

/** Reads one schema `Turn` into plain data (the reader dies with its message). */
export function readTurn(t: TurnMsg): TurnCommands {
  const commands: PlayerCommand[] = [];
  const list = t.commands;
  for (let i = 0; i < list.length; i++) {
    const c = list.get(i);
    const nums = (l: { length: number; get(i: number): number }) => {
      const out: number[] = [];
      for (let j = 0; j < l.length; j++) out.push(l.get(j));
      return out;
    };
    if (c._isMove) {
      const m = c.move;
      commands.push({ type: 'move', units: nums(m.units), x: m.x, z: m.z });
    } else if (c._isGather) {
      const g = c.gather;
      commands.push({ type: 'gather', units: nums(g.units), target: g.target });
    } else if (c._isAttack) {
      const a = c.attack;
      commands.push({ type: 'attack', units: nums(a.units), target: a.target });
    } else if (c._isBuild) {
      const b = c.build;
      commands.push({ type: 'build', units: nums(b.units), target: b.target });
    } else if (c._isTrain) {
      const tr = c.train;
      commands.push({ type: 'train', building: tr.building, template: tr.template });
    } else if (c._isPlace) {
      const p = c.place;
      commands.push({ type: 'place', template: p.template, x: p.x, z: p.z, yaw: p.yaw, builders: nums(p.builders) });
    } else if (c._isStop) {
      commands.push({ type: 'stop', units: nums(c.stop.units) });
    } else if (c._isStance) {
      const s = c.stance;
      commands.push({ type: 'stance', units: nums(s.units), stance: s.stance });
    } else if (c._isRally) {
      const r = c.rally;
      commands.push({ type: 'rally', building: r.building, x: r.x, z: r.z });
    }
  }
  return { turn: t.turn, commands };
}
