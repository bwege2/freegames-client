// The game's messages (protocol/games/xpilot.capnp) as plain objects: what the server sends (a
// frame, the reliable stream's packets, the setup) decoded for netclient.ts, and what the client
// sends (one flush of its send buffer, a list of ClientPackets) encoded from the bytes netclient.ts
// collected in the original's wire format.
import type * as $ from 'capnp-es';
import { packGame, unpackGame } from '../../../../src/sdk/index.ts';
import * as P from '../proto/xpilot.ts';

type L<T> = $.List<T>;
const each = <T, R>(l: L<T>, f: (e: T) => R): R[] => {
  const out: R[] = [];
  for (let i = 0; i < l.length; i++) out.push(f(l.get(i)));
  return out;
};

export interface XY { x: number; y: number }
export interface FrameMsg {
  start: { frameLoops: number; lastKeyChange: number };
  timeLeft: { sec: number } | null;
  damaged: { damaged: number } | null;
  self: {
    x: number; y: number; vx: number; vy: number; dir: number; power: number; turnspeed: number; turnresistance: number;
    lockId: number; lockDist: number; lockDir: number; check: number; fuelCurrent: number; fuelSum: number; fuelMax: number;
    viewWidth: number; viewHeight: number; debrisColors: number; status: number; autopilotlight: number;
  } | null;
  selfItems: { itemMask: number; counts: number[] } | null;
  modifiers: { mods: string } | null;
  thrusttime: { count: number; max: number } | null;
  shieldtime: { count: number; max: number } | null;
  destruct: { count: number } | null;
  phasingtime: { count: number; max: number } | null;
  shutdown: { count: number; delay: number } | null;
  targets: { num: number; deadTicks: number; damage: number }[];
  cannons: { num: number; deadTicks: number }[];
  fuels: { num: number; fuel: number }[];
  polystyles: { polyind: number; newstyle: number }[];
  wreckages: { x: number; y: number; wrtype: number; size: number; rot: number }[];
  asteroids: { x: number; y: number; typeSize: number; rot: number }[];
  missiles: { x: number; y: number; len: number; dir: number }[];
  balls: { x: number; y: number; id: number; style: number }[];
  mines: { x: number; y: number; teammine: number; id: number }[];
  items: { x: number; y: number; type: number }[];
  lasers: { color: number; x: number; y: number; len: number; dir: number }[];
  ecms: { x: number; y: number; size: number }[];
  trans: { x1: number; y1: number; x2: number; y2: number }[];
  connectors: { x1: number; y1: number; x2: number; y2: number; tractor: number }[];
  paused: { x: number; y: number; count: number }[];
  appearing: { x: number; y: number; id: number; count: number }[];
  ships: { x: number; y: number; id: number; dir: number; flags: number }[];
  refuels: { x1: number; y1: number; x2: number; y2: number }[];
  radar: { x: number; y: number; size: number }[];
  fastradar: { x: number; y: number; size: number }[];
  loseitem: { loseItemIndex: number } | null;
  debris: { type: number; xy: XY[] }[];
  fastshots: { type: number; xy: XY[] }[];
  audio: { type: number; vol: number }[];
  eyes: { id: number } | null;
  wormholes: { x: number; y: number }[];
  rounddelay: { count: number; max: number } | null;
  end: { frameLoops: number };
  packetSize: number;
}

export type ReliableMsg =
  | { kind: 'reply'; replyto: number; result: number }
  | { kind: 'message'; msg: string }
  | { kind: 'player'; id: number; team: number; mychar: number; name: string; username: string; hostname: string; shape: string; ext: string; himself: number }
  | { kind: 'team'; id: number; team: number }
  | { kind: 'score'; id: number; score: number; life: number; mychar: number; alliance: number }
  | { kind: 'timing'; id: number; timing: number }
  | { kind: 'leave'; id: number }
  | { kind: 'base'; id: number; num: number }
  | { kind: 'scoreObject'; score: number; x: number; y: number; string: string }
  | { kind: 'talkAck'; seq: number }
  | { kind: 'motd'; off: number; data: string; size: number }
  | { kind: 'quit'; reason: string }
  | { kind: 'teamScore'; team: number; score: number }
  | { kind: 'war'; robotId: number; killerId: number }
  | { kind: 'seek'; programmerId: number; robotId: number; soughtId: number }
  | { kind: 'string'; type: number; arg1: number; arg2: number };

export interface SetupMsg {
  mode: number; lives: number; width: number; height: number; framesPerSecond: number;
  name: string; author: string; dataUrl: string;
  pstyles: { color: number; textureId: number; defedgeId: number; flags: number }[];
  estyles: { width: number; color: number; style: number }[];
  bstyles: { filename: string; flags: number }[];
  polygons: { style: number; x: number; y: number; edges: { dx: number; dy: number }[]; estyles: { point: number; style: number }[] }[];
  bases: { team: number; x: number; y: number; dir: number }[];
  fuels: XY[];
  checks: XY[];
}

export type ServerMsg =
  | { which: 'frame'; frame: FrameMsg }
  | { which: 'reliable'; packets: ReliableMsg[] }
  | { which: 'setup'; setup: SetupMsg }
  | { which: 'other' };

function decodeFrame(f: P.Frame): FrameMsg {
  const s = f._hasSelf() ? f.self : null;
  return {
    start: { frameLoops: f.start.frameLoops, lastKeyChange: f.start.lastKeyChange },
    timeLeft: f._hasTimeLeft() ? { sec: f.timeLeft.sec } : null,
    damaged: f._hasDamaged() ? { damaged: f.damaged.damaged } : null,
    self: s ? {
      x: s.x, y: s.y, vx: s.vx, vy: s.vy, dir: s.dir, power: s.power, turnspeed: s.turnspeed, turnresistance: s.turnresistance,
      lockId: s.lockId, lockDist: s.lockDist, lockDir: s.lockDir, check: s.check, fuelCurrent: s.fuelCurrent, fuelSum: s.fuelSum,
      fuelMax: s.fuelMax, viewWidth: s.viewWidth, viewHeight: s.viewHeight, debrisColors: s.debrisColors, status: s.status,
      autopilotlight: s.autopilotlight,
    } : null,
    selfItems: f._hasSelfItems() ? { itemMask: f.selfItems.itemMask, counts: each(f.selfItems.counts, (c) => c) } : null,
    modifiers: f._hasModifiers() ? { mods: f.modifiers.mods } : null,
    thrusttime: f._hasThrusttime() ? { count: f.thrusttime.count, max: f.thrusttime.max } : null,
    shieldtime: f._hasShieldtime() ? { count: f.shieldtime.count, max: f.shieldtime.max } : null,
    destruct: f._hasDestruct() ? { count: f.destruct.count } : null,
    phasingtime: f._hasPhasingtime() ? { count: f.phasingtime.count, max: f.phasingtime.max } : null,
    shutdown: f._hasShutdown() ? { count: f.shutdown.count, delay: f.shutdown.delay } : null,
    targets: each(f.targets, (e) => ({ num: e.num, deadTicks: e.deadTicks, damage: e.damage })),
    cannons: each(f.cannons, (e) => ({ num: e.num, deadTicks: e.deadTicks })),
    fuels: each(f.fuels, (e) => ({ num: e.num, fuel: e.fuel })),
    polystyles: each(f.polystyles, (e) => ({ polyind: e.polyind, newstyle: e.newstyle })),
    wreckages: each(f.wreckages, (e) => ({ x: e.x, y: e.y, wrtype: e.wrtype, size: e.size, rot: e.rot })),
    asteroids: each(f.asteroids, (e) => ({ x: e.x, y: e.y, typeSize: e.typeSize, rot: e.rot })),
    missiles: each(f.missiles, (e) => ({ x: e.x, y: e.y, len: e.len, dir: e.dir })),
    balls: each(f.balls, (e) => ({ x: e.x, y: e.y, id: e.id, style: e.style })),
    mines: each(f.mines, (e) => ({ x: e.x, y: e.y, teammine: e.teammine, id: e.id })),
    items: each(f.items, (e) => ({ x: e.x, y: e.y, type: e.type })),
    lasers: each(f.lasers, (e) => ({ color: e.color, x: e.x, y: e.y, len: e.len, dir: e.dir })),
    ecms: each(f.ecms, (e) => ({ x: e.x, y: e.y, size: e.size })),
    trans: each(f.trans, (e) => ({ x1: e.x1, y1: e.y1, x2: e.x2, y2: e.y2 })),
    connectors: each(f.connectors, (e) => ({ x1: e.x1, y1: e.y1, x2: e.x2, y2: e.y2, tractor: e.tractor })),
    paused: each(f.paused, (e) => ({ x: e.x, y: e.y, count: e.count })),
    appearing: each(f.appearing, (e) => ({ x: e.x, y: e.y, id: e.id, count: e.count })),
    ships: each(f.ships, (e) => ({ x: e.x, y: e.y, id: e.id, dir: e.dir, flags: e.flags })),
    refuels: each(f.refuels, (e) => ({ x1: e.x1, y1: e.y1, x2: e.x2, y2: e.y2 })),
    radar: each(f.radar, (e) => ({ x: e.x, y: e.y, size: e.size })),
    fastradar: each(f.fastradar, (e) => ({ x: e.x, y: e.y, size: e.size })),
    loseitem: f._hasLoseitem() ? { loseItemIndex: f.loseitem.loseItemIndex } : null,
    debris: each(f.debris, (e) => ({ type: e.type, xy: each(e.xy, (p) => ({ x: p.x, y: p.y })) })),
    fastshots: each(f.fastshots, (e) => ({ type: e.type, xy: each(e.xy, (p) => ({ x: p.x, y: p.y })) })),
    audio: each(f.audio, (e) => ({ type: e.type, vol: e.vol })),
    eyes: f._hasEyes() ? { id: f.eyes.id } : null,
    wormholes: each(f.wormholes, (e) => ({ x: e.x, y: e.y })),
    rounddelay: f._hasRounddelay() ? { count: f.rounddelay.count, max: f.rounddelay.max } : null,
    end: { frameLoops: f._hasEnd() ? f.end.frameLoops : f.start.frameLoops },
    packetSize: f.packetSize,
  };
}

function decodeReliable(r: P.Reliable): ReliableMsg {
  const W = P.Reliable_Which;
  switch (r.which()) {
    case W.REPLY: return { kind: 'reply', replyto: r.reply.replyto, result: r.reply.result };
    case W.MESSAGE: return { kind: 'message', msg: r.message.msg };
    case W.PLAYER: {
      const p = r.player;
      return { kind: 'player', id: p.id, team: p.team, mychar: p.mychar, name: p.name, username: p.username, hostname: p.hostname, shape: p.shape, ext: p.ext, himself: p.himself };
    }
    case W.TEAM: return { kind: 'team', id: r.team.id, team: r.team.team };
    case W.SCORE: return { kind: 'score', id: r.score.id, score: r.score.score, life: r.score.life, mychar: r.score.mychar, alliance: r.score.alliance };
    case W.TIMING: return { kind: 'timing', id: r.timing.id, timing: r.timing.timing };
    case W.LEAVE: return { kind: 'leave', id: r.leave.id };
    case W.BASE: return { kind: 'base', id: r.base.id, num: r.base.num };
    case W.SCORE_OBJECT: return { kind: 'scoreObject', score: r.scoreObject.score, x: r.scoreObject.x, y: r.scoreObject.y, string: r.scoreObject.string };
    case W.TALK_ACK: return { kind: 'talkAck', seq: r.talkAck.seq };
    case W.MOTD: return { kind: 'motd', off: r.motd.off, data: r.motd.data, size: r.motd.size };
    case W.QUIT: return { kind: 'quit', reason: r.quit.reason };
    case W.TEAM_SCORE: return { kind: 'teamScore', team: r.teamScore.team, score: r.teamScore.score };
    case W.WAR: return { kind: 'war', robotId: r.war.robotId, killerId: r.war.killerId };
    case W.SEEK: return { kind: 'seek', programmerId: r.seek.programmerId, robotId: r.seek.robotId, soughtId: r.seek.soughtId };
    default: return { kind: 'string', type: r.string.type, arg1: r.string.arg1, arg2: r.string.arg2 };
  }
}

function decodeSetup(s: P.Setup): SetupMsg {
  return {
    mode: s.mode, lives: s.lives, width: s.width, height: s.height, framesPerSecond: s.framesPerSecond,
    name: s.name, author: s.author, dataUrl: s.dataUrl,
    pstyles: each(s.pstyles, (e) => ({ color: e.color, textureId: e.textureId, defedgeId: e.defedgeId, flags: e.flags })),
    estyles: each(s.estyles, (e) => ({ width: e.width, color: e.color, style: e.style })),
    bstyles: each(s.bstyles, (e) => ({ filename: e.filename, flags: e.flags })),
    polygons: each(s.polygons, (p) => ({
      style: p.style, x: p.x, y: p.y, edges: each(p.edges, (e) => ({ dx: e.dx, dy: e.dy })),
      estyles: each(p.estyles, (e) => ({ point: e.point, style: e.style })),
    })),
    bases: each(s.bases, (e) => ({ team: e.team, x: e.x, y: e.y, dir: e.dir })),
    fuels: each(s.fuels, (e) => ({ x: e.x, y: e.y })),
    checks: each(s.checks, (e) => ({ x: e.x, y: e.y })),
  };
}

/** one message from the server; garbage gives `other` */
export function decodeServerMsg(data: Uint8Array): ServerMsg {
  let m: P.Msg;
  try {
    m = unpackGame(P.Msg, data);
    switch (m.which()) {
      case P.Msg_Which.FRAME: return { which: 'frame', frame: decodeFrame(m.frame) };
      case P.Msg_Which.RELIABLE: return { which: 'reliable', packets: each(m.reliable, decodeReliable) };
      case P.Msg_Which.SETUP: return { which: 'setup', setup: decodeSetup(m.setup) };
      default: return { which: 'other' };
    }
  } catch {
    return { which: 'other' };
  }
}

// ---------------------------------------------------------------- client to server

export type ClientMsg =
  | ['verify', { user: string; nick: string; disp: string; host: string; team: number }]
  | ['play' | 'quit', null]
  | ['keyboard', { change: number; keyv: boolean[] }]
  | ['power' | 'powerS' | 'turnspeed' | 'turnspeedS' | 'turnresistance' | 'turnresistanceS', { value: number }]
  | ['ackCannon' | 'ackFuel' | 'ackTarget' | 'ackPolystyle', { loopsAck: number; num: number }]
  | ['talk', { seq: number; str: string }]
  | ['display', { width: number; height: number; debrisColors: number; sparkRand: number }]
  | ['modifierBank', { bank: number; str: string }]
  | ['motd', { offset: number; nbytes: number }]
  | ['shape', { shape: string; ext: string }]
  | ['pointerMove', { movement: number }]
  | ['requestAudio', { on: number }]
  | ['asyncFps', { fps: number }];

/** a list of client packets as one packed Msg */
export function encodeClientMsg(packets: ClientMsg[]): Uint8Array {
  return packGame(P.Msg, (root) => {
    const l = root._initClient(packets.length);
    packets.forEach(([kind, v], i) => {
      const e = l.get(i);
      switch (kind) {
        case 'verify': {
          const t = e._initVerify(), a = v as { user: string; nick: string; disp: string; host: string; team: number };
          t.user = a.user; t.nick = a.nick; t.disp = a.disp; t.host = a.host; t.team = a.team;
          break;
        }
        case 'play': e.play = true; break;
        case 'quit': e.quit = true; break;
        case 'keyboard': {
          const t = e._initKeyboard(), a = v as { change: number; keyv: boolean[] };
          t.change = a.change;
          const kl = t._initKeyv(a.keyv.length);
          a.keyv.forEach((b, k) => kl.set(k, b));
          break;
        }
        case 'power': e._initPower().value = (v as { value: number }).value; break;
        case 'powerS': e._initPowerS().value = (v as { value: number }).value; break;
        case 'turnspeed': e._initTurnspeed().value = (v as { value: number }).value; break;
        case 'turnspeedS': e._initTurnspeedS().value = (v as { value: number }).value; break;
        case 'turnresistance': e._initTurnresistance().value = (v as { value: number }).value; break;
        case 'turnresistanceS': e._initTurnresistanceS().value = (v as { value: number }).value; break;
        case 'ackCannon': case 'ackFuel': case 'ackTarget': case 'ackPolystyle': {
          const a = v as { loopsAck: number; num: number };
          const t = kind === 'ackCannon' ? e._initAckCannon() : kind === 'ackFuel' ? e._initAckFuel() : kind === 'ackTarget' ? e._initAckTarget() : e._initAckPolystyle();
          t.loopsAck = a.loopsAck; t.num = a.num;
          break;
        }
        case 'talk': { const t = e._initTalk(), a = v as { seq: number; str: string }; t.seq = a.seq; t.str = a.str; break; }
        case 'display': {
          const t = e._initDisplay(), a = v as { width: number; height: number; debrisColors: number; sparkRand: number };
          t.width = a.width; t.height = a.height; t.debrisColors = a.debrisColors; t.sparkRand = a.sparkRand;
          break;
        }
        case 'modifierBank': { const t = e._initModifierBank(), a = v as { bank: number; str: string }; t.bank = a.bank; t.str = a.str; break; }
        case 'motd': { const t = e._initMotd(), a = v as { offset: number; nbytes: number }; t.offset = a.offset; t.nbytes = a.nbytes; break; }
        case 'shape': { const t = e._initShape(), a = v as { shape: string; ext: string }; t.shape = a.shape; t.ext = a.ext; break; }
        case 'pointerMove': e._initPointerMove().movement = (v as { movement: number }).movement; break;
        case 'requestAudio': e._initRequestAudio().on = (v as { on: number }).on; break;
        case 'asyncFps': e._initAsyncFps().fps = (v as { fps: number }).fps; break;
      }
    });
  });
}
