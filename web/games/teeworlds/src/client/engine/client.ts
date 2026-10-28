// (c) Magnus Auvinen. See licence.txt in the root of the distribution for more information.
// If you are missing that file, acquire a complete release at teeworlds.com.
// Altered: engine/client/client.cpp of Teeworlds 0.7.5 in TypeScript: the connection, the map, snapshots,
// the game and prediction time, the input. Left out: the server browser, master servers, demos, the editor,
// the remote console, the version check; the main loop is the browser's frame callback (Frame()).
import { f, toInt } from '../../base/vmath.ts';
import { str_comp, str_format } from '../../base/system.ts';
import {
  CNetClient, CNetChunk, NETADDR, NETSENDFLAG_VITAL, NETSENDFLAG_FLUSH, NETSENDFLAG_CONNLESS, NETSTATE_OFFLINE, NETSTATE_ONLINE,
  NET_CHUNKFLAG_VITAL, TIME_FREQ, type NetHost,
} from '../../engine/shared/network.ts';
import { CMsgPacker, CUnpacker, SANITIZE_CC, SKIP_START_WHITESPACES, varintDecompress } from '../../engine/shared/packer.ts';
import { CSnapshot, CSnapshotDelta, CSnapshotStorage, MAX_PARTS, MAX_SIZE, type CSnapshotHolder } from '../../engine/shared/snapshot.ts';
import * as PR from '../../engine/shared/protocol.ts';
import type { CDataFileReader } from '../../engine/shared/datafile.ts';
import { CMapStore } from './map.ts';
import { CServerInfo, FLAG_PASSWORD, FLAG_TIMESCORE, str_clean_whitespaces } from './serverbrowser.ts';
import type { CConsole } from './console.ts';
import { OUTPUT_LEVEL_ADDINFO, OUTPUT_LEVEL_DEBUG, OUTPUT_LEVEL_STANDARD } from './console.ts';
import type { CConfig } from '../../generated/config.ts';

export const STATE_OFFLINE = 0, STATE_CONNECTING = 1, STATE_LOADING = 2, STATE_ONLINE = 3, STATE_DEMOPLAYBACK = 4, STATE_QUITING = 5;
export const SNAP_CURRENT = 0, SNAP_PREV = 1;
export const PREDICTION_MARGIN = Math.trunc(1000 / 50 / 2);

/** what the engine calls in the game (IGameClient) */
export interface IGameClient {
  OnStateChange(NewState: number, OldState: number): void;
  OnConnected(): void;
  OnMessage(MsgId: number, pUnpacker: CUnpacker): void;
  OnNewSnapshot(): void;
  OnPredict(): void;
  OnSnapInput(pData: Int32Array): number;
  OnUpdate(): void;
  OnRender(): void;
  OnRconLine(pLine: string): void;
  NetVersion(): string;
  ClientVersion(): number;
}

/** CGraph: only the API (the debug graphs are not drawn) */
export class CGraph {
  Init(_min: number, _max: number): void {}
  Add(_v: number, _r: number, _g: number, _b: number): void {}
}

/** CSmoothTime: a time that follows a target smoothly */
export class CSmoothTime {
  m_Snap = 0;
  m_Current = 0;
  m_Target = 0;
  m_SpikeCounter = 0;
  m_aAdjustSpeed = [0, 0];
  m_Graph = new CGraph();
  private time_get: () => number;
  constructor(time_get: () => number) { this.time_get = time_get; }

  Init(Target: number): void {
    this.m_Snap = this.time_get();
    this.m_Current = Target;
    this.m_Target = Target;
    this.m_aAdjustSpeed[0] = f(0.3);
    this.m_aAdjustSpeed[1] = f(0.3);
    this.m_Graph.Init(0, 0.5);
  }
  SetAdjustSpeed(Direction: number, Value: number): void { this.m_aAdjustSpeed[Direction] = f(Value); }
  Get(Now: number): number {
    const c = this.m_Current + (Now - this.m_Snap);
    const t = this.m_Target + (Now - this.m_Snap);
    let AdjustSpeed = this.m_aAdjustSpeed[0];
    if (t > c) AdjustSpeed = this.m_aAdjustSpeed[1];
    let a = f(f(f(Now - this.m_Snap) / f(TIME_FREQ)) * AdjustSpeed);
    if (a > 1) a = 1;
    return c + Math.trunc(f(f(t - c) * a));
  }
  UpdateInt(Target: number): void {
    const Now = this.time_get();
    this.m_Current = this.Get(Now);
    this.m_Snap = Now;
    this.m_Target = Target;
  }
  Update(pGraph: CGraph, Target: number, TimeLeft: number, AdjustDirection: number): void {
    let UpdateTimer = true;
    if (TimeLeft < 0) {
      let IsSpike = false;
      if (TimeLeft < -50) {
        IsSpike = true;
        this.m_SpikeCounter += 5;
        if (this.m_SpikeCounter > 50) this.m_SpikeCounter = 50;
      }
      if (IsSpike && this.m_SpikeCounter < 15) {
        UpdateTimer = false;
        pGraph.Add(TimeLeft, 1, 1, 0);
      } else {
        pGraph.Add(TimeLeft, 1, 0, 0);
        if (this.m_aAdjustSpeed[AdjustDirection] < 30) this.m_aAdjustSpeed[AdjustDirection] = f(this.m_aAdjustSpeed[AdjustDirection] * 2);
      }
    } else {
      if (this.m_SpikeCounter) this.m_SpikeCounter--;
      pGraph.Add(TimeLeft, 0, 1, 0);
      this.m_aAdjustSpeed[AdjustDirection] = f(this.m_aAdjustSpeed[AdjustDirection] * f(0.95));
      if (this.m_aAdjustSpeed[AdjustDirection] < 2) this.m_aAdjustSpeed[AdjustDirection] = 2;
    }
    if (UpdateTimer) this.UpdateInt(Target);
  }
}

interface CInput {
  m_aData: Int32Array;
  m_Tick: number;
  m_PredictedTime: number;
  m_Time: number;
}

export interface CSnapItem { m_Type: number; m_ID: number; m_DataSize: number }

export class CClient {
  readonly m_NetClient = new CNetClient();
  readonly m_SnapshotDelta = new CSnapshotDelta();
  readonly m_SnapshotStorage = new CSnapshotStorage();
  readonly maps = new CMapStore();
  m_pGameClient!: IGameClient;
  m_pConsole: CConsole | null = null;
  m_pConfig!: CConfig;
  time_get: () => number;

  m_State = STATE_OFFLINE;
  m_GameTickSpeed = PR.SERVER_TICK_SPEED;
  m_ServerAddress = new NETADDR();
  m_aServerAddressStr = '';
  m_aServerPassword = '';

  // map
  m_pMap: CDataFileReader | null = null;
  m_aCurrentMap = '';
  m_CurrentMapCrc = 0;
  m_MapdownloadChunk = 0;
  m_MapdownloadChunkNum = 0;
  m_MapDownloadChunkSize = 0;
  m_MapdownloadCrc = 0;
  m_MapdownloadTotalsize = -1;
  m_MapdownloadAmount = 0;
  m_aMapdownloadName = '';
  /** the map being downloaded (the original's temporary file), or null */
  m_MapdownloadFileTemp: Uint8Array[] | null = null;
  /** a downloaded map is opened asynchronously; until then the loading waits */
  pendingMapLoad: Promise<void> | null = null;

  // snapshots
  m_aSnapshots: (CSnapshotHolder | null)[] = [null, null];
  m_CurrentRecvTick = 0;
  m_RecivedSnapshots = 0;
  m_ReceivedSnapshots = 0;
  m_SnapshotParts = 0;
  readonly m_aSnapshotIncomingData = new Uint8Array(MAX_SIZE);
  m_SnapCrcErrors = 0;
  m_AckGameTick = -1;
  m_CurGameTick = 0;
  m_PrevGameTick = 0;
  m_GameIntraTick = 0;
  m_GameTickTime = 0;
  m_PredTick = 0;
  m_PredIntraTick = 0;
  m_CurMenuTick = 0;
  m_LocalStartTime = 0;
  m_LocalTime = 0;
  m_MenuStartTime = 0;
  m_RenderFrameTime = 0.0001;
  m_LastRenderTime = 0;

  m_GameTime: CSmoothTime;
  m_PredictedTime: CSmoothTime;
  m_InputtimeMarginGraph = new CGraph();
  m_GametimeMarginGraph = new CGraph();
  readonly m_aInputs: CInput[] = [];
  m_CurrentInput = 0;
  m_PingStartTime = 0;
  m_RconAuthed = 0;

  /** counters for the e2e test */
  stats = { snapshots: 0, msgs: 0 };
  /** called with every game message decoded (the tests) */
  onSnapshotDecoded: ((tick: number, delta: number, snap: CSnapshot) => void) | null = null;
  /** called with every system message the client handled (the tests) */
  onSys: ((what: string, info: Record<string, unknown>) => void) | null = null;

  constructor(time_get: () => number) {
    this.time_get = time_get;
    this.m_GameTime = new CSmoothTime(time_get);
    this.m_PredictedTime = new CSmoothTime(time_get);
    for (let i = 0; i < 200; i++) this.m_aInputs.push({ m_aData: new Int32Array(PR.MAX_INPUT_SIZE), m_Tick: -1, m_PredictedTime: 0, m_Time: 0 });
  }

  // ---------------------------------------------------------------- IClient
  State(): number { return this.m_State; }
  GameTick(): number { return this.m_CurGameTick; }
  PredGameTick(): number { return this.m_PredTick; }
  PrevGameTick(): number { return this.m_PrevGameTick; }
  IntraGameTick(): number { return this.m_GameIntraTick; }
  PredIntraGameTick(): number { return this.m_PredIntraTick; }
  GameTickTime(): number { return this.m_GameTickTime; }
  GameTickSpeed(): number { return this.m_GameTickSpeed; }
  LocalTime(): number { return this.m_LocalTime; }
  RenderFrameTime(): number { return this.m_RenderFrameTime; }
  MapData(): CDataFileReader | null { return this.m_pMap; }
  ConnectionProblems(): boolean { return this.m_NetClient.GotProblems(); }
  RconAuthed(): boolean { return !!this.m_RconAuthed; }

  private Print(level: number, from: string, s: string): void { this.m_pConsole?.Print(level, from, s); }

  Init(host: NetHost, game: IGameClient, config: CConfig, console: CConsole | null): void {
    this.m_pGameClient = game;
    this.m_pConfig = config;
    this.m_pConsole = console;
    this.m_NetClient.Open(host, 0);
    this.m_LocalStartTime = this.time_get();
    this.m_MenuStartTime = this.time_get();
    this.m_SnapshotParts = 0;
  }

  SendMsg(pMsg: CMsgPacker, Flags: number): number {
    if (this.m_State === STATE_OFFLINE) return 0;
    const p = new CNetChunk();
    p.m_ClientID = 0;
    p.m_pData = pMsg.Data();
    p.m_DataSize = pMsg.Size();
    if (Flags & PR.MSGFLAG_VITAL) p.m_Flags |= NETSENDFLAG_VITAL;
    if (Flags & PR.MSGFLAG_FLUSH) p.m_Flags |= NETSENDFLAG_FLUSH;
    if (!(Flags & PR.MSGFLAG_NOSEND)) this.m_NetClient.Send(p);
    return 0;
  }

  /** SendPackMsg: a game message (generated pack function) */
  SendPackMsg(id: number, pack: (p: CMsgPacker) => boolean, Flags: number): number {
    const p = new CMsgPacker(id);
    if (pack(p)) return -1;
    return this.SendMsg(p, Flags);
  }

  SendInfo(): void {
    this.m_aServerPassword = this.m_pConfig.m_Password;
    const Msg = new CMsgPacker(PR.NETMSG_INFO, true);
    Msg.AddString(this.m_pGameClient.NetVersion(), 128);
    Msg.AddString(this.m_aServerPassword, 128);
    Msg.AddInt(this.m_pGameClient.ClientVersion());
    this.SendMsg(Msg, PR.MSGFLAG_VITAL | PR.MSGFLAG_FLUSH);
  }
  RconAuth(_pName: string, pPassword: string): void {
    if (this.RconAuthed()) return;
    const Msg = new CMsgPacker(PR.NETMSG_RCON_AUTH, true);
    Msg.AddString(pPassword, 32);
    this.SendMsg(Msg, PR.MSGFLAG_VITAL);
  }
  Rcon(pCmd: string): void {
    const Msg = new CMsgPacker(PR.NETMSG_RCON_CMD, true);
    Msg.AddString(pCmd, 256);
    this.SendMsg(Msg, PR.MSGFLAG_VITAL);
  }
  SendEnterGame(): void { this.SendMsg(new CMsgPacker(PR.NETMSG_ENTERGAME, true), PR.MSGFLAG_VITAL | PR.MSGFLAG_FLUSH); }
  SendReady(): void { this.SendMsg(new CMsgPacker(PR.NETMSG_READY, true), PR.MSGFLAG_VITAL | PR.MSGFLAG_FLUSH); }

  SendInput(): void {
    const Now = this.time_get();
    if (this.m_PredTick <= 0) return;
    const inp = this.m_aInputs[this.m_CurrentInput];
    const Size = this.m_pGameClient.OnSnapInput(inp.m_aData);
    if (!Size) return;
    const Msg = new CMsgPacker(PR.NETMSG_INPUT, true);
    Msg.AddInt(this.m_AckGameTick);
    Msg.AddInt(this.m_PredTick);
    Msg.AddInt(Size);
    inp.m_Tick = this.m_PredTick;
    inp.m_PredictedTime = this.m_PredictedTime.Get(Now);
    inp.m_Time = Now;
    for (let i = 0; i < Size / 4; i++) Msg.AddInt(inp.m_aData[i]);
    let PingCorrection = 0;
    const h = this.m_SnapshotStorage.Get(this.m_AckGameTick);
    if (h) PingCorrection = Math.trunc(((Now - h.m_Tagtime) * 1000) / TIME_FREQ);
    Msg.AddInt(PingCorrection);
    this.m_CurrentInput = (this.m_CurrentInput + 1) % 200;
    this.SendMsg(Msg, PR.MSGFLAG_FLUSH);
  }

  GetInput(Tick: number): Int32Array | null {
    let Best = -1;
    for (let i = 0; i < 200; i++) {
      if (this.m_aInputs[i].m_Tick <= Tick && (Best === -1 || this.m_aInputs[Best].m_Tick < this.m_aInputs[i].m_Tick)) Best = i;
    }
    return Best !== -1 ? this.m_aInputs[Best].m_aData : null;
  }

  SetState(s: number): void {
    if (this.m_State === STATE_QUITING) return;
    const Old = this.m_State;
    this.m_State = s;
    if (Old !== s) this.m_pGameClient.OnStateChange(this.m_State, Old);
  }

  OnEnterGame(): void {
    for (let i = 0; i < 200; i++) this.m_aInputs[i].m_Tick = -1;
    this.m_CurrentInput = 0;
    this.m_aSnapshots[SNAP_CURRENT] = null;
    this.m_aSnapshots[SNAP_PREV] = null;
    this.m_SnapshotStorage.PurgeAll();
    this.m_ReceivedSnapshots = 0;
    this.m_SnapshotParts = 0;
    this.m_PredTick = 0;
    this.m_CurrentRecvTick = 0;
    this.m_CurGameTick = 0;
    this.m_PrevGameTick = 0;
    this.m_CurMenuTick = 0;
  }

  EnterGame(): void {
    if (this.m_State === STATE_DEMOPLAYBACK) return;
    this.SendEnterGame();
    this.OnEnterGame();
  }

  Connect(addr: NETADDR, addrStr: string): void {
    this.Disconnect();
    this.m_aServerAddressStr = addrStr;
    this.Print(OUTPUT_LEVEL_STANDARD, 'client', str_format(512, "connecting to '%s'", addrStr));
    this.m_ServerAddress = addr.copy();
    this.m_RconAuthed = 0;
    this.m_CurrentServerInfo = new CServerInfo();
    this.m_NetClient.Connect(this.m_ServerAddress);
    this.SetState(STATE_CONNECTING);
    this.m_InputtimeMarginGraph.Init(-150, 150);
    this.m_GametimeMarginGraph.Init(-150, 150);
  }

  DisconnectWithReason(pReason: string | null): void {
    this.Print(OUTPUT_LEVEL_STANDARD, 'client', str_format(512, "disconnecting. reason='%s'", pReason ?? 'unknown'));
    this.m_RconAuthed = 0;
    this.m_NetClient.Disconnect(pReason);
    this.SetState(STATE_OFFLINE);
    this.m_pMap = null;
    this.m_MapdownloadChunk = 0;
    this.m_MapdownloadFileTemp = null;
    this.m_MapdownloadCrc = 0;
    this.m_MapdownloadTotalsize = -1;
    this.m_MapdownloadAmount = 0;
    this.m_ServerAddress = new NETADDR();
    this.m_aServerAddressStr = '';
    this.m_aServerPassword = '';
    this.m_CurrentServerInfo = new CServerInfo();
    this.m_aSnapshots[SNAP_CURRENT] = null;
    this.m_aSnapshots[SNAP_PREV] = null;
    this.m_ReceivedSnapshots = 0;
  }

  Disconnect(): void { this.DisconnectWithReason(null); }

  ErrorString(): string { return this.m_NetClient.ErrorString(); }

  // ---------------------------------------------------------------- snapshot access
  private alt(SnapID: number): CSnapshot { return this.m_aSnapshots[SnapID]!.m_pAltSnap!; }
  SnapNumItems(SnapID: number): number {
    const s = this.m_aSnapshots[SnapID];
    return s ? s.m_pSnap.NumItems() : 0;
  }
  /** SnapGetItem: the item's data ints (a view), its type, id and size in item */
  SnapGetItem(SnapID: number, Index: number, item: CSnapItem): Int32Array {
    const a = this.alt(SnapID);
    item.m_DataSize = a.GetItemSize(Index);
    item.m_Type = a.ItemType(Index);
    item.m_ID = a.ItemID(Index);
    return a.ItemDataView(Index);
  }
  SnapInvalidateItem(SnapID: number, Index: number): void { this.alt(SnapID).InvalidateItem(Index); }
  SnapFindItem(SnapID: number, Type: number, ID: number): Int32Array | null {
    const s = this.m_aSnapshots[SnapID];
    if (!s) return null;
    const a = s.m_pAltSnap!;
    const i = a.GetItemIndex((Type << 16) | (ID & 0xffff));
    return i !== -1 ? a.ItemDataView(i) : null;
  }
  SnapSetStaticsize(ItemType: number, Size: number): void { this.m_SnapshotDelta.SetStaticsize(ItemType, Size); }

  // ---------------------------------------------------------------- the map
  LoadMap(pName: string, WantedCrc: number): string | null {
    this.SetState(STATE_LOADING);
    const r = this.maps.load(pName, WantedCrc);
    if (!r) return str_format(512, "map '%s' not found", pName);
    this.Print(OUTPUT_LEVEL_ADDINFO, 'client', str_format(256, "loaded map '%s'", pName));
    this.m_ReceivedSnapshots = 0;
    this.m_pMap = r;
    this.m_aCurrentMap = pName;
    this.m_CurrentMapCrc = WantedCrc;
    return null;
  }

  LoadMapSearch(pMapName: string, WantedCrc: number): string | null {
    this.Print(OUTPUT_LEVEL_ADDINFO, 'client', str_format(512, 'loading map, map=%s wanted crc=%08x', pMapName, WantedCrc));
    this.SetState(STATE_LOADING);
    return this.LoadMap(pMapName, WantedCrc);
  }

  // ---------------------------------------------------------------- packets
  ProcessServerPacket(pPacket: CNetChunk): void {
    const Unpacker = new CUnpacker();
    Unpacker.Reset(pPacket.m_pData, 0, pPacket.m_DataSize);
    let Msg = Unpacker.GetInt();
    const Sys = Msg & 1;
    Msg >>= 1;
    if (Unpacker.Error()) return;
    const Vital = (pPacket.m_Flags & NET_CHUNKFLAG_VITAL) !== 0;
    if (Sys) {
      if (Vital && Msg === PR.NETMSG_MAP_CHANGE) {
        const pMap = Unpacker.GetString(SANITIZE_CC | SKIP_START_WHITESPACES);
        const MapCrc = Unpacker.GetInt();
        const MapSize = Unpacker.GetInt();
        const MapChunkNum = Unpacker.GetInt();
        const MapChunkSize = Unpacker.GetInt();
        if (Unpacker.Error()) return;
        Unpacker.GetRaw(32); // the sha256: this port checks the crc and the size, as the original's fallback does
        let pError: string | null = null;
        for (let i = 0; i < pMap.length; i++) if (pMap[i] === '/' || pMap[i] === '\\') pError = 'strange character in map name';
        if (MapSize <= 0) pError = 'invalid map size';
        this.onSys?.('map_change', { map: pMap, crc: MapCrc, size: MapSize });
        if (pError) this.DisconnectWithReason(pError);
        else {
          pError = this.LoadMapSearch(pMap, MapCrc);
          if (!pError) {
            this.Print(OUTPUT_LEVEL_ADDINFO, 'client/network', 'loading done');
            this.SendReady();
          } else {
            this.Print(OUTPUT_LEVEL_ADDINFO, 'client/network', str_format(256, "starting to download map '%s'", pMap));
            this.m_aMapdownloadName = pMap;
            this.m_MapdownloadFileTemp = [];
            this.m_MapdownloadChunk = 0;
            this.m_MapdownloadChunkNum = MapChunkNum;
            this.m_MapDownloadChunkSize = MapChunkSize;
            this.m_MapdownloadCrc = MapCrc;
            this.m_MapdownloadTotalsize = MapSize;
            this.m_MapdownloadAmount = 0;
            this.SendMsg(new CMsgPacker(PR.NETMSG_REQUEST_MAP_DATA, true), PR.MSGFLAG_VITAL | PR.MSGFLAG_FLUSH);
          }
        }
      } else if (Vital && Msg === PR.NETMSG_MAP_DATA) {
        if (!this.m_MapdownloadFileTemp) return;
        const Size = Math.min(this.m_MapDownloadChunkSize, this.m_MapdownloadTotalsize - this.m_MapdownloadAmount);
        const pData = Unpacker.GetRaw(Size);
        if (Unpacker.Error() || !pData) return;
        this.m_MapdownloadFileTemp.push(pData.slice());
        ++this.m_MapdownloadChunk;
        this.m_MapdownloadAmount += Size;
        if (this.m_MapdownloadAmount === this.m_MapdownloadTotalsize) {
          this.Print(OUTPUT_LEVEL_ADDINFO, 'client/network', 'download complete, loading map');
          const all = new Uint8Array(this.m_MapdownloadTotalsize);
          let o = 0;
          for (const c of this.m_MapdownloadFileTemp) {
            all.set(c, o);
            o += c.length;
          }
          this.m_MapdownloadFileTemp = null;
          this.m_MapdownloadAmount = 0;
          this.m_MapdownloadTotalsize = -1;
          const name = this.m_aMapdownloadName, crc = this.m_MapdownloadCrc;
          this.onSys?.('map_done', { bytes: all.length });
          // the map is opened (inflated) asynchronously, then loaded as the original loads it
          this.pendingMapLoad = this.maps.add(name, all).then(() => {
            this.pendingMapLoad = null;
            if (this.m_State !== STATE_LOADING) return;
            const pError = this.LoadMap(name, crc);
            if (!pError) {
              this.Print(OUTPUT_LEVEL_ADDINFO, 'client/network', 'loading done');
              this.SendReady();
            } else this.DisconnectWithReason(pError);
          });
        } else if (this.m_MapdownloadChunk % this.m_MapdownloadChunkNum === 0) {
          this.SendMsg(new CMsgPacker(PR.NETMSG_REQUEST_MAP_DATA, true), PR.MSGFLAG_VITAL | PR.MSGFLAG_FLUSH);
        }
      } else if (Vital && Msg === PR.NETMSG_SERVERINFO) {
        this.onSys?.('serverinfo', {});
        const Info = new CServerInfo();
        Info.m_aAddress = this.m_aServerAddressStr;
        if (!this.UnpackServerInfo(Unpacker, Info) && !Unpacker.Error()) this.m_CurrentServerInfo = Info;
      } else if (Vital && Msg === PR.NETMSG_CON_READY) {
        this.onSys?.('con_ready', {});
        this.m_pGameClient.OnConnected();
      } else if (Msg === PR.NETMSG_PING) {
        this.SendMsg(new CMsgPacker(PR.NETMSG_PING_REPLY, true), 0);
      } else if (Vital && Msg === PR.NETMSG_RCON_AUTH_ON) {
        this.m_RconAuthed = 1;
      } else if (Vital && Msg === PR.NETMSG_RCON_AUTH_OFF) {
        this.m_RconAuthed = 0;
      } else if (Vital && Msg === PR.NETMSG_RCON_LINE) {
        const pLine = Unpacker.GetString();
        if (!Unpacker.Error()) this.m_pGameClient.OnRconLine(pLine);
      } else if (Msg === PR.NETMSG_PING_REPLY) {
        this.Print(OUTPUT_LEVEL_STANDARD, 'client/network', str_format(256, 'latency %.2f', ((this.time_get() - this.m_PingStartTime) * 1000) / TIME_FREQ));
      } else if (Msg === PR.NETMSG_INPUTTIMING) {
        const InputPredTick = Unpacker.GetInt();
        const TimeLeft = Unpacker.GetInt();
        this.onSys?.('inputtiming', { tick: InputPredTick, left: TimeLeft });
        let Target = 0;
        for (let k = 0; k < 200; k++) {
          if (this.m_aInputs[k].m_Tick === InputPredTick) {
            Target = this.m_aInputs[k].m_PredictedTime + (this.time_get() - this.m_aInputs[k].m_Time);
            Target = Target - Math.trunc(f(f(f(TimeLeft - PREDICTION_MARGIN) / 1000) * TIME_FREQ));
            break;
          }
        }
        if (Target) this.m_PredictedTime.Update(this.m_InputtimeMarginGraph, Target, TimeLeft, 1);
      } else if (Msg === PR.NETMSG_SNAP || Msg === PR.NETMSG_SNAPSINGLE || Msg === PR.NETMSG_SNAPEMPTY) {
        this.ProcessSnap(Msg, Unpacker);
      }
    } else if (Vital) {
      this.stats.msgs++;
      this.m_pGameClient.OnMessage(Msg, Unpacker);
    }
  }

  m_CurrentServerInfo = new CServerInfo();
  GetServerInfo(): CServerInfo { return this.m_CurrentServerInfo; }

  /** CClient::UnpackServerInfo, the short version (no token, no clients) as NETMSG_SERVERINFO carries it */
  private UnpackServerInfo(u: CUnpacker, pInfo: CServerInfo): number {
    const S = SANITIZE_CC | SKIP_START_WHITESPACES;
    pInfo.m_aVersion = u.GetString(S).slice(0, 15);
    pInfo.m_aName = str_clean_whitespaces(u.GetString(S).slice(0, 63));
    pInfo.m_aHostname = u.GetString(S).slice(0, 63);
    if (!pInfo.m_aHostname) pInfo.m_aHostname = pInfo.m_aAddress;
    pInfo.m_aMap = u.GetString(S).slice(0, 31);
    pInfo.m_aGameType = u.GetString(S).slice(0, 15);
    const Flags = u.GetInt();
    pInfo.m_Flags = 0;
    if (Flags & PR.SERVERINFO_FLAG_PASSWORD) pInfo.m_Flags |= FLAG_PASSWORD;
    if (Flags & PR.SERVERINFO_FLAG_TIMESCORE) pInfo.m_Flags |= FLAG_TIMESCORE;
    pInfo.m_ServerLevel = Math.min(Math.max(u.GetInt(), PR.SERVERINFO_LEVEL_MIN), PR.SERVERINFO_LEVEL_MAX);
    pInfo.m_NumPlayers = u.GetInt();
    pInfo.m_MaxPlayers = u.GetInt();
    pInfo.m_NumClients = u.GetInt();
    pInfo.m_MaxClients = u.GetInt();
    if (pInfo.m_NumClients < 0 || pInfo.m_NumClients > pInfo.m_MaxClients || pInfo.m_MaxClients < 0 || pInfo.m_MaxClients > PR.MAX_CLIENTS || pInfo.m_MaxPlayers < pInfo.m_NumPlayers ||
      pInfo.m_NumPlayers < 0 || pInfo.m_NumPlayers > pInfo.m_NumClients || pInfo.m_MaxPlayers < 0 || pInfo.m_MaxPlayers > pInfo.m_MaxClients) return -1;
    return 0;
  }

  private ProcessSnap(Msg: number, Unpacker: CUnpacker): void {
    let NumParts = 1, Part = 0;
    const GameTick = Unpacker.GetInt();
    const DeltaTick = GameTick - Unpacker.GetInt();
    let PartSize = 0, Crc = 0;
    if (this.m_State < STATE_LOADING) return;
    if (Msg === PR.NETMSG_SNAP) {
      NumParts = Unpacker.GetInt();
      Part = Unpacker.GetInt();
    }
    if (Msg !== PR.NETMSG_SNAPEMPTY) {
      Crc = Unpacker.GetInt();
      PartSize = Unpacker.GetInt();
    }
    const pData = Unpacker.GetRaw(PartSize);
    if (Unpacker.Error() || NumParts < 1 || NumParts > MAX_PARTS || Part < 0 || Part >= NumParts || PartSize < 0 || PartSize > PR.MAX_SNAPSHOT_PACKSIZE) return;
    if (GameTick < this.m_CurrentRecvTick) return;
    if (GameTick !== this.m_CurrentRecvTick) {
      this.m_SnapshotParts = 0;
      this.m_CurrentRecvTick = GameTick;
    }
    if (pData && PartSize) this.m_aSnapshotIncomingData.set(pData, Part * PR.MAX_SNAPSHOT_PACKSIZE);
    this.m_SnapshotParts = (this.m_SnapshotParts | (1 << Part)) >>> 0;
    if (this.m_SnapshotParts !== ((1 << NumParts) - 1) >>> 0) return;

    let pDeltaShot = CSnapshot.empty();
    const CompleteSize = (NumParts - 1) * PR.MAX_SNAPSHOT_PACKSIZE + PartSize;
    this.m_SnapshotParts = 0;
    if (DeltaTick >= 0) {
      const h = this.m_SnapshotStorage.Get(DeltaTick);
      if (!h) {
        this.m_AckGameTick = -1;
        return;
      }
      pDeltaShot = h.m_pSnap;
    }
    let pDeltaData = new Int32Array(3);
    let DeltaSize = 12;
    if (CompleteSize) {
      const buf = new Int32Array(MAX_SIZE / 4);
      const IntSize = varintDecompress(this.m_aSnapshotIncomingData, 0, CompleteSize, buf);
      if (IntSize < 0) return;
      pDeltaData = buf;
      DeltaSize = IntSize;
    }
    const res = this.m_SnapshotDelta.UnpackDelta(pDeltaShot, pDeltaData, DeltaSize);
    if (typeof res === 'number') {
      this.Print(OUTPUT_LEVEL_DEBUG, 'client', 'delta unpack failed!');
      return;
    }
    const snap = res;
    if (Msg !== PR.NETMSG_SNAPEMPTY && snap.Crc() !== Crc) {
      this.m_SnapCrcErrors++;
      this.onSys?.('snaperr', { tick: GameTick });
      if (this.m_SnapCrcErrors > 10) {
        this.m_AckGameTick = -1;
        this.SendInput();
        this.m_SnapCrcErrors = 0;
      }
      return;
    } else if (this.m_SnapCrcErrors) this.m_SnapCrcErrors--;

    let PurgeTick = DeltaTick;
    const prev = this.m_aSnapshots[SNAP_PREV], cur = this.m_aSnapshots[SNAP_CURRENT];
    if (prev && prev.m_Tick < PurgeTick) PurgeTick = prev.m_Tick;
    if (cur && cur.m_Tick < PurgeTick) PurgeTick = cur.m_Tick;
    this.m_SnapshotStorage.PurgeUntil(PurgeTick);
    // the purge may drop the holders SNAP_PREV/SNAP_CURRENT point at only if older than them, as in the original
    this.m_SnapshotStorage.Add(GameTick, this.time_get(), snap.Size(), snap, true);
    this.m_ReceivedSnapshots++;
    this.stats.snapshots++;
    this.onSnapshotDecoded?.(GameTick, DeltaTick, snap);
    this.m_CurrentRecvTick = GameTick;
    if (this.m_ReceivedSnapshots === 2) {
      this.m_PredictedTime.Init((GameTick * TIME_FREQ) / 50);
      this.m_PredictedTime.SetAdjustSpeed(1, 1000);
      this.m_GameTime.Init(((GameTick - 1) * TIME_FREQ) / 50);
      this.m_aSnapshots[SNAP_PREV] = this.m_SnapshotStorage.First();
      this.m_aSnapshots[SNAP_CURRENT] = this.m_SnapshotStorage.Last();
      this.SetState(STATE_ONLINE);
    }
    if (this.m_ReceivedSnapshots > 2) {
      const Now = this.m_GameTime.Get(this.time_get());
      const TickStart = (GameTick * TIME_FREQ) / 50;
      const TimeLeft = Math.trunc(((TickStart - Now) * 1000) / TIME_FREQ);
      this.m_GameTime.Update(this.m_GametimeMarginGraph, ((GameTick - 1) * TIME_FREQ) / 50, TimeLeft, 0);
    }
    this.m_AckGameTick = GameTick;
  }

  PumpNetwork(): void {
    this.m_NetClient.Update();
    if (this.m_State !== STATE_OFFLINE && this.m_State !== STATE_QUITING && this.m_NetClient.State() === NETSTATE_OFFLINE) {
      this.SetState(STATE_OFFLINE);
      const err = this.m_NetClient.ErrorString();
      this.DisconnectWithReason(err);
      this.Print(OUTPUT_LEVEL_STANDARD, 'client', str_format(256, "offline error='%s'", err));
      this.lastError = err;
    }
    if (this.m_State === STATE_CONNECTING && this.m_NetClient.State() === NETSTATE_ONLINE) {
      this.Print(OUTPUT_LEVEL_STANDARD, 'client', 'connected, sending info');
      this.SetState(STATE_LOADING);
      this.SendInfo();
    }
    const p = new CNetChunk();
    while (this.m_NetClient.Recv(p)) {
      if (!(p.m_Flags & NETSENDFLAG_CONNLESS)) this.ProcessServerPacket(p);
    }
  }

  /** the reason the connection was closed (shown to the player) */
  lastError = '';

  /** CClient::Update without the network pump: snapshot switching, ticks, prediction, input */
  UpdateTime(): void {
    if (this.m_State === STATE_ONLINE && this.m_ReceivedSnapshots >= 3) {
      let Repredict = false;
      const Now = this.m_GameTime.Get(this.time_get());
      const PredNow = this.m_PredictedTime.Get(this.time_get());
      for (;;) {
        const pCur = this.m_aSnapshots[SNAP_CURRENT]!;
        const TickStart = (pCur.m_Tick * TIME_FREQ) / 50;
        if (TickStart < Now) {
          const idx = this.m_SnapshotStorage.list.indexOf(pCur);
          const pNext = idx >= 0 ? this.m_SnapshotStorage.list[idx + 1] ?? null : null;
          if (pNext) {
            this.m_aSnapshots[SNAP_PREV] = pCur;
            this.m_aSnapshots[SNAP_CURRENT] = pNext;
            this.m_CurGameTick = pNext.m_Tick;
            this.m_PrevGameTick = pCur.m_Tick;
            this.m_pGameClient.OnNewSnapshot();
            Repredict = true;
          } else break;
        } else break;
      }
      const cur = this.m_aSnapshots[SNAP_CURRENT], prev = this.m_aSnapshots[SNAP_PREV];
      if (cur && prev) {
        let CurtickStart = (cur.m_Tick * TIME_FREQ) / 50;
        let PrevtickStart = (prev.m_Tick * TIME_FREQ) / 50;
        const PrevPredTick = Math.trunc((PredNow * 50) / TIME_FREQ);
        const NewPredTick = PrevPredTick + 1;
        this.m_GameIntraTick = f((Now - PrevtickStart) / f(CurtickStart - PrevtickStart));
        this.m_GameTickTime = f((Now - PrevtickStart) / TIME_FREQ);
        CurtickStart = (NewPredTick * TIME_FREQ) / 50;
        PrevtickStart = (PrevPredTick * TIME_FREQ) / 50;
        this.m_PredIntraTick = f((PredNow - PrevtickStart) / f(CurtickStart - PrevtickStart));
        if (NewPredTick < prev.m_Tick - PR.SERVER_TICK_SPEED || NewPredTick > prev.m_Tick + PR.SERVER_TICK_SPEED) {
          this.Print(OUTPUT_LEVEL_ADDINFO, 'client', 'prediction time reset!');
          this.m_PredictedTime.Init((cur.m_Tick * TIME_FREQ) / 50);
        }
        if (NewPredTick > this.m_PredTick) {
          this.m_PredTick = NewPredTick;
          Repredict = true;
          this.SendInput();
        }
      }
      if (Repredict) {
        if (this.m_PredTick > this.m_CurGameTick && this.m_PredTick < this.m_CurGameTick + 50) this.m_pGameClient.OnPredict();
      }
    }
  }

  /** CClient::Update */
  Update(): void {
    this.UpdateTime();
    this.PumpNetwork();
    this.m_pGameClient.OnUpdate();
  }

  /** one frame of CClient::Run: update, render, the local time */
  Frame(render: boolean): void {
    this.Update();
    if (render) {
      const Now = this.time_get();
      this.m_RenderFrameTime = Math.max(0.0001, (Now - this.m_LastRenderTime) / TIME_FREQ);
      this.m_LastRenderTime = Now;
      this.m_pGameClient.OnRender();
    }
    if (this.m_State === STATE_OFFLINE) {
      const t = this.time_get();
      while (t > this.TickStartTime(this.m_CurMenuTick + 1)) this.m_CurMenuTick++;
    }
    this.m_LocalTime = (this.time_get() - this.m_LocalStartTime) / TIME_FREQ;
  }

  TickStartTime(Tick: number): number { return this.m_MenuStartTime + (TIME_FREQ * Tick) / this.m_GameTickSpeed; }

  /** the map name the client plays (for the HUD and the info) */
  CurrentMap(): string { return this.m_aCurrentMap; }
  MapIsCurrent(name: string): boolean { return str_comp(name, this.m_aCurrentMap) === 0; }
  /** toInt, for callers in this module family */
  static ti(v: number): number { return toInt(v); }
}

export { NETSTATE_ONLINE };
