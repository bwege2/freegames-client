// OpenClonk online (milestone 4): the place of the original's network/C4Network2 (left out: its connections, its lobby,
// its resources) in a game whose host is the site's server module (server/.../games/openclonk/OpenclonkModule.java,
// protocol/games/openclonk.capnp, the messages in src/online.ts). The original's control queue runs as on any client of a
// network game in central mode: C4GameControl in CM_Network with its network part, C4GameControlNetwork, both translated
// (src/gen). What C4Network2 does for such a client is done here, against the site's rooms:
//
//   * C4GameControlNetwork sends this client's control for each control tick to the host (Clients.SendMsgToHost,
//     PID_Control with a C4GameControlPacket); here its C4Control goes to the module (Control {tick, ctrl}).
//   * The host sends the complete control of each tick (C4GameControlPacket for C4ClientIDAll, the clients' control in
//     client ID order); here the module's Tick is made into that packet and handed to C4GameControlNetwork::HandleControl,
//     each seat's control executed as client seat + 1's: packets that claim another client are dropped.
//   * The host's own actions on clients (C4ControlClientJoin, C4ControlClientUpdate CUT_Activate, C4ControlClientRemove,
//     its sync control) come from the module's seat events, executed as the host's control (client 0) at their tick
//     through C4GameControlNetwork's sync control queue (AddSyncCtrlToQueue, ExecQueuedSyncCtrl).
//   * The host decides the players' IDs, teams and colours (C4Network2Players::HandlePlayerInfoUpdRequest). The module
//     does not run the game, so every browser decides them alike when it executes a seat's join request at its tick (below,
//     `Players`), and the player's own client sends the join with the player file inline (C4ControlJoinPlayer, fByRes
//     false) instead of the host sending a join by network resource.
//   * The clients' sync checks (C4ControlSyncCheck, made by C4GameControl::DoSyncCheck every 100 frames) go to the module,
//     which compares them (the host's check is compared in the original); on a difference the original's
//     C4ControlSyncCheck::Execute runs with the other check, as on a client that got a different check from its host.
//   * After the evaluation (C4Game::Evaluate) the round's results (C4RoundResults) go to the module.
import { $ } from './rt/registry.ts';
import { P, S, $str } from './rt/ptr.ts';
import type { RoundStart, GameMessage } from '../../../src/sdk/index.ts';
import { SERVER_SEAT } from '../../../src/sdk/index.ts';
import {
  packControl, packSyncCheck, packRoundResults, readServerMsg, readOptions, readResults, clientId, randomSeed,
  CONTROL_BYTES, SYNC_RATE, type TickControl, type SyncCheck, type RoundResultsData, type OnlineOptions, type RoomsLike,
  type Outcome, type ServerMsg, type SeatEvent,
} from './online.ts';

// network/C4PacketBase.h C4PacketType
const PID_Control = 0x40;
const CID_First = 0x80, CID_ClientJoin = 0x80, CID_ClientUpdate = 0x81, CID_ClientRemove = 0x82, CID_SyncCheck = 0x85,
  CID_PlrInfo = 0x90, CID_JoinPlr = 0x91;
// network/C4Client.h, C4GameControlNetwork.h
const C4ClientIDHost = 0, C4ClientIDAll = -1;
// control/C4Control.h C4ControlClientUpdType, C4ControlDeliveryType; C4GameControlNetworkMode
const CUT_Activate = 0;
const CDT_Queue = 0, CDT_Direct = 2;
const CNM_Central = 1, CNM_Async = 2;
// control/C4PlayerInfo.h C4PlayerType
const C4PT_Script = 2;
// game/C4Application.h C4AppState
export const C4AS_Startup = 2, C4AS_StartGame = 3;

/** a StdBuf's bytes */
function bufBytes(buf: any): Uint8Array {
  const n = buf.getSize();
  if (!n) return new Uint8Array(0);
  const p = buf.getData();
  const out = new Uint8Array(n);
  for (let i = 0; i < n; i++) out[i] = p.a[p.o + i] & 0xff;
  return out;
}

/** bytes as a StdBuf (what C4PacketBase::unpack reads through getRef) */
function toBuf(bytes: Uint8Array): any {
  const buf = new $.StdBuf();
  buf.New(bytes.length);
  const p = buf.getMData();
  for (let i = 0; i < bytes.length; i++) p.a[p.o + i] = p.a instanceof Int8Array ? (bytes[i] << 24) >> 24 : bytes[i];
  return buf;
}

/** a packet's StdCompilerBinWrite form (C4PacketBase::pack) */
export function packetBytes(pkt: any): Uint8Array {
  return bufBytes(pkt.pack$addr_t());
}

/** a C4Control from its StdCompilerBinWrite form; null if it does not compile (StdCompiler's exceptions) */
export function readControl(bytes: Uint8Array): any {
  const ctrl = new $.C4Control().init();
  try {
    ctrl.unpack({ getRef: () => toBuf(bytes) });
  } catch {
    return null;
  }
  return ctrl;
}

/** what the page sees of a round */
export interface OnlineState {
  /** the module's ticks received so far */
  received: number;
  /** sync checks sent */
  checks: number;
  desync: Extract<ServerMsg, { t: 'desync' }> | null;
  /** the round ended (RoomFinished): the module's results, null when the server stopped it */
  outcome: Outcome | null;
  finished: boolean;
  stopped: string;
  /** control packets executed per seat (and dropped ones) */
  packets: Record<number, number>;
  dropped: number;
}

export interface OnlineRound {
  rooms: RoomsLike;
  round: RoundStart;
  /** round-trip time to the server, ms (the SDK's GameClient.rtt): the host connection's ping */
  rtt: () => number;
  log?: (line: string) => void;
  /** a C4ControlSyncCheck before it goes to the module (tests alter one to see the desync) */
  checkHook?: (c: SyncCheck) => SyncCheck;
  /** each frame of C4Game::Execute before its control, with Game.FrameCounter (tests look at the state there) */
  frameHook?: (frame: number) => void;
}

/**
 * C4Network2 of a client in the site's room (`$.Network` while the round runs). The game calls the members below; what a
 * client of the original never calls in a game answers like a game without the network (null, false, nothing).
 */
export class RoomsNetwork {
  readonly seat: number;
  readonly client: number;
  readonly options: OnlineOptions;
  readonly state: OnlineState = { received: 0, checks: 0, desync: null, outcome: null, finished: false, stopped: '', packets: {}, dropped: 0 };
  /** isEnabled(): from InitHost until Clear */
  private enabled = false;
  /** while false, isEnabled() answers false: player infos are made without the network's resources (Players.Init) */
  private resources = true;
  private running = false;
  /** the first tick whose control the module has not had from this seat (History.resume after coming back) */
  private resume = 0;
  /** the last tick this seat sent control for */
  private lastSent = -1;
  private lastCheck = 0;
  private reported = false;
  private readonly offs: (() => void)[] = [];
  private readonly r: OnlineRound;
  private readonly names = new Map<number, string>();

  constructor(r: OnlineRound) {
    this.r = r;
    this.seat = r.round.you;
    this.client = clientId(this.seat);
    this.options = readOptions(r.round.options);
    for (const s of r.round.seats) this.names.set(s.seat, s.name);
    this.offs.push(
      r.rooms.on('message', (m) => this.onMessage(m)),
      r.rooms.on('finished', (f) => {
        this.state.finished = true;
        this.state.stopped = f.stopped;
        this.state.outcome = f.stopped ? null : readResults(f.results);
        // the host ended the network game
        this.Clear$v();
      }),
    );
  }

  /** the last tick this seat sent control for */
  get sent(): number { return this.lastSent; }

  /** the round is over or left: no more traffic */
  stop(): void {
    for (const off of this.offs) off();
    this.offs.length = 0;
    this.enabled = false;
    this.running = false;
  }

  // ------------------------------------------------------------------------------------------- C4Network2's status

  isEnabled(): boolean { return this.enabled && this.resources; }
  isHost(): boolean { return false; }
  isRunning(): boolean { return this.running; }
  isFrozen(): boolean { return false; }
  isLobbyActive(): boolean { return false; }
  isLobbyCountDown(): boolean { return false; }
  isPassworded(): boolean { return false; }
  isStreaming(): boolean { return false; }
  getPendingStreamData(): number { return 0; }
  GetLobby(): null { return null; }
  GetVote(): null { return null; }
  Status = { isPastLobby: () => true, getCtrlMode: () => this.ctrlMode() };

  private ctrlMode(): number { return this.options.mode === 'async' ? CNM_Async : CNM_Central; }

  /** the client's name: the seat's name in the room (the same in every browser) */
  private core(id: number, name: string): any {
    const c = new $.C4ClientCore().init();
    c.SetID(id);
    c.SetName(S(name));
    c.SetActivated(true);
    return c;
  }

  private seatName(seat: number): string {
    return this.names.get(seat) || `Player ${seat + 1}`;
  }

  /**
   * C4Game::InitNetworkHost calls this when the page starts the round's scenario (every browser has the content, where
   * the original's client gets the scenario from its host): it makes this browser a client of the site's host, as
   * C4Network2::InitClient does: the client list (this client, seat + 1, and the host, client 0), the parameters the
   * room decided (C4GameParameters from the host's lobby: ControlRate, MaxPlayers; C4Game::RandomSeed from the round's
   * seed, as the original's client takes it from the host's scenario, C4S.Head.RandomSeed), and the control queue's
   * network part, C4GameControlNetwork::Init as a client in the room's mode.
   */
  InitHost(_lobby: boolean): boolean {
    const G = $.Game;
    G.Clients.Init(this.client);
    G.Clients.getLocal().SetCore(this.core(this.client, this.seatName(this.seat)));
    G.Clients.Add$C4ClientCore(this.core(C4ClientIDHost, 'Server'));
    G.Parameters.ControlRate = this.options.controlRate;
    if (this.options.maxPlayers) G.Parameters.MaxPlayers = this.options.maxPlayers;
    G.RandomSeed = randomSeed(this.r.round);
    const ctl = $.Control$2.Network;
    ctl.Init(this.client, false, 0, true, this);
    ctl.SetCtrlMode(this.ctrlMode());
    this.enabled = true;
    return true;
  }

  InitClient(): number { return 1; /* IR_Fatal: joining by address or reference is the site's lobby */ }
  AllowJoin(): void {}
  /** the round runs (C4Network2's status Go): the control queue's network part packs ticks */
  Start$v(): boolean {
    $.Control$2.Network.SetRunning(true, -1);
    this.running = true;
    return true;
  }
  /** the original's lobby is the site's, before the scenario starts (src/index.ts) */
  DoLobby(): boolean { return this.Start$v(); }
  FinalInit(): boolean { return true; }
  Pause(): boolean { return false; }
  Sync(): boolean { return true; }
  Vote(): void {}
  AddVote(): void {}
  EndVote(): void {}
  InvalidateReference(): void {}
  OnGameSynchronized(): void {}
  LeagueNotifyDisconnect(): void {}
  LeagueGameEvaluate(): boolean { return false; }
  LeagueSignupEnable(): void {}
  LeagueSignupDisable(): void {}
  SetPassword(): void {}
  GetPassword(): null { return null; }
  SetCtrlMode(): void {}
  StartStreaming(): boolean { return false; }
  FinishStreaming(): void {}
  DrawStatus(): void {}
  RetrieveRes(): boolean { return false; }
  RetrieveScenario(): boolean { return false; }
  StartLobbyCountdown(): void {}
  AbortLobbyCountdown(): void {}

  /**
   * C4Network2::Clear: the connection to the host ends (after a synchronization loss, or when the module ended the round);
   * as in the original, the game goes on as a local game (C4GameControl::ChangeToLocal: the remote clients removed)
   */
  Clear$v(): void {
    if (!this.enabled) return;
    this.enabled = false;
    this.running = false;
    if ($.Control$2?.isNetwork()) $.Control$2.ChangeToLocal();
  }

  /** the host's connection, for C4GameControlNetwork::CalcPerformance's PreSend (its ping time) */
  private readonly host = {
    getID: () => C4ClientIDHost,
    isHost: () => true,
    isLocal: () => false,
    getMsgConn: () => ({ getPingTime: () => Math.max(0, Math.round(this.r.rtt())) }),
  };

  Clients = {
    SendMsgToHost: (pkt: any) => this.toHost(pkt),
    // what the original's host sends every client, every browser here does itself
    BroadcastMsgToClients: () => true,
    // PID_ControlReq (C4GameControlNetwork::Init: "make sure no control has been lost"): the site's transport is reliable
    BroadcastMsgToConnClients: () => true,
    GetClientByID: (id: number) => (id === C4ClientIDHost ? this.host : null),
    GetLocal: () => null,
    GetNextClient: () => null,
  };

  ResList = {
    // no network resources: the player files travel inside the joins
    getRefRes$i32: () => new $.C4Network2Res$Ref().init$pC4Network2Res(null),
    getRefRes$pi8$b: () => new $.C4Network2Res$Ref().init$pC4Network2Res(null),
    AddByCore: () => null,
    AddByGroup: () => null,
    RemoveAtClient: () => {},
  };

  NetIO = new Proxy({}, { get: (_t, k) => (typeof k === 'string' ? () => 0 : undefined) });

  // ------------------------------------------------------------------------------------------------ the control

  /** C4Network2IOConnection::Send to the host: this client's control for a tick, to the module */
  private toHost(pkt: any): boolean {
    if (!this.enabled) return true;
    // a C4NetIOPacket: the status byte, then the packet (C4PacketBase::pack)
    const bytes = bufBytes(pkt);
    if (bytes[0] !== PID_Control) return true;
    const p = new $.C4GameControlPacket().init();
    try {
      p.unpack({ getRef: () => toBuf(bytes.subarray(1)) });
    } catch {
      return false;
    }
    this.sendControl(p.getCtrlTick(), p.getControl());
    return true;
  }

  private sendControl(tick: number, ctrl: any): void {
    // the module has this seat's control for the ticks before resume (sent before the connection dropped)
    if (tick < this.resume) return;
    let bytes = ctrl.firstPkt() ? packetBytes(ctrl) : new Uint8Array(0);
    if (bytes.length > CONTROL_BYTES) {
      this.r.log?.(`Network: control of ${bytes.length} bytes for tick ${tick} is more than the server takes (${CONTROL_BYTES}); not sent`);
      bytes = new Uint8Array(0);
    }
    if (tick <= this.lastSent) {
      // control for a tick sent already (asking to be activated sent ahead): what it holds goes with the next one
      if (!bytes.length) return;
      tick = this.lastSent + 1;
    }
    this.lastSent = tick;
    this.r.rooms.send(packControl(tick, bytes), 'server');
  }

  private onMessage(m: GameMessage): void {
    if (m.from !== SERVER_SEAT || this.state.finished) return;
    const s = readServerMsg(m.data);
    if (!s) return;
    if (s.t === 'tick') this.addTick(s.tick);
    else if (s.t === 'history') {
      // back in the round: the ticks so far (those here already are skipped); its own control for the ticks before resume
      // reached the module before
      this.resume = Math.max(this.resume, s.resume);
      this.lastSent = Math.max(this.lastSent, s.resume - 1);
      for (const t of s.ticks) this.addTick(t);
    } else this.onDesync(s);
  }

  /** a module's complete tick: the host's actions as its sync control, then the seats' control as the complete control */
  private addTick(t: TickControl): void {
    if (t.tick !== this.state.received) return; // again (history and live) or out of order
    this.state.received++;
    const net = $.Control$2.Network;
    const host = new $.C4Control().init();
    for (const e of t.events) {
      const pkt = this.hostAction(e);
      if (pkt) host.Add$i32$pC4ControlPacket(pkt[0], pkt[1]);
    }
    if (host.firstPkt()) net.AddSyncCtrlToQueue(host, t.tick);
    const all = new $.C4Control().init();
    for (const c of t.controls) {
      const ctrl = this.seatControl(c.seat, c.ctrl);
      if (ctrl?.firstPkt()) all.Append$C4Control(ctrl);
    }
    const complete = new $.C4GameControlPacket().init();
    complete.Set$i32$i32$C4Control(C4ClientIDAll, t.tick, all);
    net.HandleControl(C4ClientIDHost, complete);
  }

  /** a seat event as the host's control packet */
  private hostAction(e: SeatEvent): [number, any] | null {
    const id = clientId(e.seat);
    let type: number, pkt: any;
    switch (e.kind) {
      case 'join':
        // this client is in the list since InitHost
        if (e.seat === this.seat) return null;
        type = CID_ClientJoin;
        pkt = new $.C4ControlClientJoin().init$C4ClientCore(this.core(id, this.seatName(e.seat)));
        break;
      case 'deactivate':
      case 'activate':
        type = CID_ClientUpdate;
        pkt = new $.C4ControlClientUpdate().init$i32$i32$i32(id, CUT_Activate, e.kind === 'activate' ? 1 : 0);
        break;
      case 'remove':
        type = CID_ClientRemove;
        pkt = new $.C4ControlClientRemove().init$i32$pi8(id, S('left the round'));
        break;
      default:
        return null;
    }
    pkt.SetByClient(C4ClientIDHost);
    return [type, pkt];
  }

  /**
   * A seat's control, executed as client seat + 1's: packets that are no control, that claim another client (as the
   * original's host checks a direct packet's client against its connection) or that only the host or the module sends
   * (sync checks) are dropped; null if it does not compile.
   */
  private seatControl(seat: number, bytes: Uint8Array): any {
    if (!bytes.length) return null;
    const ctrl = readControl(bytes);
    if (!ctrl) return null;
    const id = clientId(seat);
    for (let p = ctrl.firstPkt(); p; ) {
      const next = ctrl.nextPkt(p);
      if (!this.allowed(id, p)) {
        ctrl.Delete(p);
        this.state.dropped++;
      } else this.state.packets[seat] = (this.state.packets[seat] ?? 0) + 1;
      p = next;
    }
    return ctrl;
  }

  private allowed(id: number, p: any): boolean {
    const type = p.getPktType() & 0xff;
    const pkt = p.getPkt();
    if (!(type & CID_First) || !pkt || typeof pkt.getByClient !== 'function') return false;
    if (pkt.getByClient() !== id) return false;
    switch (type) {
      case CID_SyncCheck:
        return false;
      case CID_PlrInfo: {
        // a join request of its own client, for players without IDs (the IDs are the host's)
        const info = pkt.GetInfo();
        if (info.GetClientID() !== id) return false;
        for (let i = 0; i < info.GetPlayerCount(); i++) if (info.GetPlayerInfo$i32(i).GetID() !== 0) return false;
        return true;
      }
      case CID_JoinPlr:
        return pkt.iAtClient === id && !pkt.fByRes;
      case CID_ClientUpdate:
        return pkt.iID === id;
      default:
        return true;
    }
  }

  // ------------------------------------------------------------------------------------------- C4Network2::Execute

  /** every frame of C4Game::Execute, before the control: what C4Network2 does each frame for a client */
  Execute$v(): void {
    if (!this.enabled) return;
    const G = $.Game, C = $.Control$2;
    // the sync check of the frame just executed (C4GameControl::DoSyncCheck), to the module
    const frame = G.FrameCounter;
    this.r.frameHook?.(frame);
    if (frame > this.lastCheck && frame % SYNC_RATE === 0) {
      const check = C.GetSyncCheck(frame);
      if (check) {
        this.lastCheck = frame;
        let c = readCheck(check);
        if (this.r.checkHook) c = this.r.checkHook(c);
        this.r.rooms.send(packSyncCheck(c), 'server');
        this.state.checks++;
      }
    }
    // the evaluation (C4Game::Evaluate), to the module
    if (G.Evaluated && !this.reported) {
      this.reported = true;
      this.r.rooms.send(packRoundResults(roundResults(frame)), 'server');
    }
    // deactivated (the connection dropped) and caught up with the ticks: ask to be activated (C4Network2::RequestActivate)
    if (this.running && !G.Clients.getLocal()?.isActivated() && !C.Network.CtrlOverflow(C.ControlTick)) this.RequestActivate();
  }

  /**
   * C4Network2::RequestActivate: a deactivated client asks the host to activate it. The module activates a seat with its
   * control (the activate event in a tick), and a tick waits for an activated seat's control: so this client sends (empty)
   * control for the first tick that is not complete, again for each newer one, until its activation is executed and the
   * control queue sends again; the input meanwhile goes with it. (Control for the complete ticks before would only be late
   * and empty: the module takes the newest as the seat's control so far.)
   */
  RequestActivate(): void {
    if (!this.running || $.Game.Clients.getLocal()?.isObserver()) return;
    const t = Math.max(this.lastSent + 1, this.resume, this.state.received);
    if (t > this.state.received) return;
    const C = $.Control$2;
    const ctrl = new $.C4Control().init();
    if (C.Input.firstPkt()) ctrl.Take$rC4Control(C.Input);
    this.sendControl(t, ctrl);
  }

  private onDesync(d: Extract<ServerMsg, { t: 'desync' }>): void {
    this.state.desync = d;
    // the original's reaction to a check that differs from its own (C4ControlSyncCheck::Execute: "Network:
    // Synchronization loss!", the round's network result, the network cleared), with the check of the other seat
    const [seat, c] = this.seat === d.other ? [d.seat, d.check] : [d.other, d.otherCheck];
    try {
      const pkt = new $.C4ControlSyncCheck().init();
      writeCheck(pkt, c);
      pkt.SetByClient(clientId(seat));
      pkt.Execute();
    } catch (e) {
      this.r.log?.(`desync: ${(e as Error).message}`);
    }
  }

  // ---------------------------------------------------------------------------------------- C4Network2Players

  Players = {
    /** C4Network2Players::Init for a client: join the local players (C4Game::PlayerFilenames) */
    Init: () => { this.joinLocalPlayer($.Game.PlayerFilenames, true); },
    JoinLocalPlayer: (files: any, initial: boolean) => this.joinLocalPlayer(files, initial),
    /** a client's request to change its players (C4StartupPlrSelDlg, team choice): through its control */
    RequestPlayerInfoUpdate: (req: any) => {
      $.Control$2.DoInput(CID_PlrInfo, new $.C4ControlPlayerInfo().init$C4ClientPlayerInfos(req), CDT_Queue);
    },
    HandlePlayerInfo: (info: any) => this.handlePlayerInfo(info),
    SendUpdatedPlayers: () => this.sendUpdatedPlayers(),
    OnClientPart: (client: any) => this.onClientPart(client),
    GetLocalPlayerInfoPacket: () => $.Game.PlayerInfos.GetInfoByClientID($.Game.Clients.getLocalID()),
    GetClientChatColor: () => 0xffffffff,
    Clear: () => {},
  };

  /**
   * C4Network2Players::JoinLocalPlayer of a client: its join request (C4ClientPlayerInfos of its player files), which the
   * original sends to the host (PID_PlayerInfoUpdReq), goes into its control as C4ControlPlayerInfo, so that every browser
   * handles it at the same tick. The player infos are made without the network's resources (the player file goes inline
   * with the join, C4ControlJoinPlayer fByRes false).
   */
  private joinLocalPlayer(files: any, initial: boolean): boolean {
    const G = $.Game;
    if (G.C4S.Head.Replay || G.Clients.getLocal()?.isObserver()) return false;
    this.resources = false;
    let info: any;
    try {
      info = new $.C4ClientPlayerInfos().init(P(files, 0), !initial, null);
    } finally {
      this.resources = true;
    }
    if (!initial && !info.GetPlayerCount()) return false;
    $.Control$2.DoInput(CID_PlrInfo, new $.C4ControlPlayerInfo().init$C4ClientPlayerInfos(info), CDT_Queue);
    return true;
  }

  /** a request carries players without IDs (the host gives them); the host's infos have all IDs */
  private static isRequest(info: any): boolean {
    for (let i = 0; i < info.GetPlayerCount(); i++) if (!info.GetPlayerInfo$i32(i).GetID()) return true;
    return false;
  }

  /**
   * C4ControlPlayerInfo::Execute in a network game: a seat's join request is handled as the host handles it
   * (C4Network2Players::HandlePlayerInfoUpdRequest: IDs, teams, colours), then the result as every client handles the
   * host's info (HandlePlayerInfo), here by every browser at the same tick.
   */
  private handlePlayerInfo(packet: any): void {
    const G = $.Game, list = G.PlayerInfos;
    if (RoomsNetwork.isRequest(packet)) {
      const own = new $.C4ClientPlayerInfos().$copy(packet);
      // the host's check for duplicates goes by network resource: none here
      if (!list.AssignPlayerIDs(own) && own.IsAddPacket()) return; // probably the maximum of players
      // UpdateSavegameAssignments: an online round starts its scenario, no savegame players
      list.AssignTeams(own, false);
      list.UpdatePlayerAttributes$pC4ClientPlayerInfos$b(own, true);
      list.ResetLeagueProjectedGain(true);
      for (let i = 0; i < own.GetPlayerCount(); i++) own.GetPlayerInfo$i32(i).ResetLeagueProjectedGain();
      this.sendUpdatedPlayers();
      // the host's DoInput(CID_PlrInfo, new C4ControlPlayerInfo(OwnInfoPacket), CDT_Direct): executed at once
      packet = own;
    }
    // C4Network2Players::HandlePlayerInfo
    const ci = list.AddInfo(new $.C4ClientPlayerInfos().$copy(packet));
    G.Teams.RecheckPlayers();
    G.Teams.RecheckTeams();
    if (ci) {
      const client = G.Clients.getClientByID(ci.GetClientID());
      if (this.running && client && client.isActivated()) this.joinUnjoined(ci);
    }
    this.sendUpdatedPlayers();
  }

  /**
   * C4Network2Players::JoinUnjoinedPlayersInControlQueue: the host queues a join for each player not joined yet, by
   * network resource. Here every browser marks the joins issued, and the player's own client queues the join with its
   * player file inline (as C4PlayerInfoList::LocalJoinUnjoinedPlayersInQueue does in a game without the network).
   */
  private joinUnjoined(ci: any): void {
    const C = $.Control$2;
    const own = ci.GetClientID() === C.ClientID();
    for (let i = 0; i < ci.GetPlayerCount(); i++) {
      const info = ci.GetPlayerInfo$i32(i);
      if (info.HasJoinIssued() || info.GetAssociatedSavegamePlayerID()) continue;
      info.SetJoinIssued();
      if (!own) continue;
      const file = info.GetFilename();
      if ((!file || !$str(file)) && info.GetType() !== C4PT_Script) {
        $.LogF(S('Network: failed to join player %s!'), info.GetName());
        continue;
      }
      const join = new $.C4ControlJoinPlayer().init$pi8$i32$i32(file, ci.GetClientID(), info.GetID());
      // C4ControlJoinPlayer::Strip: a big portrait is left out (C4NetResMaxBigicon), as in a record
      join.Strip();
      C.DoInput(CID_JoinPlr, join, CDT_Queue);
    }
  }

  /** C4Network2Players::SendUpdatedPlayers: the host's direct C4ControlPlayerInfo of each changed client info */
  private sendUpdatedPlayers(): void {
    const list = $.Game.PlayerInfos;
    for (let i = 0, info; (info = list.GetIndexedInfo(i)); i++) {
      if (!info.IsUpdated()) continue;
      info.ResetUpdated();
      $.Control$2.DoInput(CID_PlrInfo, new $.C4ControlPlayerInfo().init$C4ClientPlayerInfos(info), CDT_Direct);
    }
  }

  /** C4Network2Players::OnClientPart, the client's part and the host's (done by every browser) */
  private onClientPart(client: any): void {
    const G = $.Game, list = G.PlayerInfos;
    const pp = list.GetInfoPtrByClientID(client.getID());
    if (!pp) return;
    const ci = pp.a[pp.o];
    for (let i = 0; i < ci.GetPlayerCount();) {
      if (!ci.GetPlayerInfo$i32(i).HasJoined()) ci.RemoveIndexedInfo(i);
      else i++;
    }
    if (!ci.GetPlayerCount()) list.RemoveInfo(pp);
    G.Teams.RecheckPlayers();
    list.UpdatePlayerAttributes$v();
    G.Teams.RecheckTeams();
    list.ResetLeagueProjectedGain(true);
    this.sendUpdatedPlayers();
  }
}

/** C4ControlSyncCheck's values */
function readCheck(c: any): SyncCheck {
  return {
    frame: c.Frame, controlTick: c.ControlTick, randomCount: c.RandomCount, allCrewPosX: c.AllCrewPosX,
    pxsCount: c.PXSCount, massMoverIndex: c.MassMoverIndex, objectCount: c.ObjectCount,
    objectEnumerationIndex: c.ObjectEnumerationIndex, sectShapeSum: c.SectShapeSum, hash: 0n,
  };
}

function writeCheck(p: any, c: SyncCheck): void {
  p.Frame = c.frame;
  p.ControlTick = c.controlTick;
  p.RandomCount = c.randomCount;
  p.AllCrewPosX = c.allCrewPosX;
  p.PXSCount = c.pxsCount;
  p.MassMoverIndex = c.massMoverIndex;
  p.ObjectCount = c.objectCount;
  p.ObjectEnumerationIndex = c.objectEnumerationIndex;
  p.SectShapeSum = c.sectShapeSum;
}

const text = (p: any, max = 64): string => {
  const s = p == null ? '' : typeof p === 'string' ? p : $str(p);
  // the module takes at most 64 bytes
  let out = s;
  while (new TextEncoder().encode(out).length > max) out = out.slice(0, -1);
  return out;
};

/** C4RoundResults as C4Game::Evaluate left it, with each player's fate from its C4PlayerInfo */
export function roundResults(frame: number): RoundResultsData {
  const G = $.Game, rr = G.RoundResults;
  const ids = (l: any) => Array.from({ length: Math.min(64, l.GetNumberOfIDs$v()) }, (_, i) => text(l.GetID$u64$pi32(i, null).ToString()));
  const players: RoundResultsData['players'] = [];
  for (let i = 0; i < Math.min(64, rr.Players.GetCount()); i++) {
    const p = rr.Players.GetByIndex(i);
    const at = new Int32Array([-1]);
    const info = G.PlayerInfos.GetPlayerInfoByID$i32$pi32(p.GetID(), P(at, 0));
    const seat = !info || info.GetType() === C4PT_Script || at[0] < 1 || at[0] > 255 ? 255 : at[0] - 1;
    players.push({
      id: p.GetID(), seat, name: info ? text(info.GetName()) : '', won: !!info?.HasTeamWon(),
      totalPlayingTime: p.GetTotalPlayingTime() >>> 0, scoreOld: p.GetScoreOld() | 0, scoreNew: p.GetScoreNew() | 0,
    });
  }
  return { frame, playingTime: rr.iPlayingTime >>> 0, goals: ids(rr.Goals), fulfilledGoals: ids(rr.FulfilledGoals), players };
}

/** the scenario of a round, below the content folder */
export function roundScenario(round: RoundStart): string {
  return readOptions(round.options).scenario;
}
