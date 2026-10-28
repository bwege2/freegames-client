// (c) Magnus Auvinen. See licence.txt in the root of the distribution for more information.
// If you are missing that file, acquire a complete release at teeworlds.com.
// Altered: game/client/gameclient.h and gameclient.cpp of Teeworlds 0.7.5 in TypeScript. Left out: demos
// (recording and playback), the editor, the server browser; the rest is the original's.
import { vec2, mix, clamp, f } from '../../base/vmath.ts';
import { str_comp, str_format, str_copy } from '../../base/system.ts';
import * as P from '../../generated/protocol.ts';
import { g_pData } from '../../generated/content.ts';
import { CFGFLAG_CLIENT, type CConfig } from '../../generated/config.ts';
import { MAX_CLIENTS, MSGFLAG_FLUSH, MSGFLAG_NORECORD, MSGFLAG_VITAL, GAME_NETVERSION, CLIENT_VERSION } from '../../engine/shared/protocol.ts';
import type { CUnpacker, CMsgPacker } from '../../engine/shared/packer.ts';
import { SANITIZE_CC } from '../../engine/shared/packer.ts';
import { CLayers } from '../../game/layers.ts';
import { CCollision } from '../../game/collision.ts';
import { CCharacterCore, CTuningParams, CWorldCore } from '../../game/gamecore.ts';
import { CClient, STATE_DEMOPLAYBACK, STATE_ONLINE, SNAP_CURRENT, SNAP_PREV, type IGameClient, type CSnapItem } from '../engine/client.ts';
import type { CGraphics } from '../engine/graphics.ts';
import { CQuadItem, FORMAT_AUTO, TEXLOAD_LINEARMIPMAPS } from '../engine/graphics.ts';
import type { CTextRender } from '../engine/text.ts';
import type { CSound } from '../engine/sound.ts';
import type { CInput } from '../engine/input.ts';
import type { CStorage } from '../engine/storage.ts';
import { CConsole, OUTPUT_LEVEL_ADDINFO, OUTPUT_LEVEL_DEBUG, OUTPUT_LEVEL_STANDARD, type CResult, type FCommandCallback } from '../engine/console.ts';
import { CContacts } from '../engine/contacts.ts';
import { CUI } from './ui.ts';
import { CRenderTools, CTeeRenderInfo, v4 } from './render.ts';
import { Localize } from './localization.ts';
import type { CComponent } from './component.ts';
import { CBinds } from './components/binds.ts';
import { CBroadcast } from './components/broadcast.ts';
import { CCamera } from './components/camera.ts';
import { CChat, CHAT_CLIENT_MSG } from './components/chat.ts';
import { CGameConsole, CONSOLETYPE_REMOTE } from './components/console.ts';
import { CControls } from './components/controls.ts';
import { CCountryFlags } from './components/countryflags.ts';
import { CDamageInd } from './components/damageind.ts';
import { CDebugHud } from './components/debughud.ts';
import { CEffects } from './components/effects.ts';
import { CEmoticon } from './components/emoticon.ts';
import { CFlow } from './components/flow.ts';
import { CHud } from './components/hud.ts';
import { CItems } from './components/items.ts';
import { CInfoMessages } from './components/infomessages.ts';
import { CMapImages } from './components/mapimages.ts';
import { CMapLayers, TYPE_BACKGROUND, TYPE_FOREGROUND } from './components/maplayers.ts';
import { CMenus } from './components/menus.ts';
import { CMotd } from './components/motd.ts';
import { CNotifications } from './components/notifications.ts';
import { CParticles } from './components/particles.ts';
import { CPlayers } from './components/players.ts';
import { CNamePlates } from './components/nameplates.ts';
import { CScoreboard } from './components/scoreboard.ts';
import { CSkins, HAT_NUM, HAT_OFFSET_SIDE } from './components/skins.ts';
import { CSounds, CHN_GLOBAL, CHN_WORLD } from './components/sounds.ts';
import { CSpectator } from './components/spectator.ts';
import { CStats } from './components/stats.ts';
import { CVoting } from './components/voting.ts';

/** a game message as CNetObjHandler::SecureUnpackMsg gives it (the component casts it to its CNetMsg_*) */
export type CNetMsg = unknown;

export function FormatTime(Time: number, Precision: number): string {
  let s = Time < 0 ? '-:--' : str_format(32, '%02d:%02d', Math.trunc(Time / (60 * 1000)), Math.trunc(Time / 1000) % 60);
  return s + AppendDecimals(Time, Precision);
}
function AppendDecimals(Time: number, Precision: number): string {
  if (Precision <= 0) return '';
  const d = Time < 0 ? '.---' : '.' + String(Math.trunc(Time / 100) % 10) + String(Math.trunc(Time / 10) % 10) + String(Time % 10);
  return d.slice(0, Math.min(Precision, 3) + 1);
}
export function FormatTimeDiff(Time: number, Precision: number, ForceSign = true): string {
  const pSign = Time < 0 ? '-' : ForceSign ? '+' : '';
  Time = Math.abs(Time);
  return str_format(32, '%s%d', pSign, Math.trunc(Time / 1000)) + AppendDecimals(Time, Precision);
}

const STR_TEAM_GAME = 0, STR_TEAM_RED = 1, STR_TEAM_BLUE = 2, STR_TEAM_SPECTATORS = 3;
function GetStrTeam(Team: number, Teamplay: boolean): number {
  if (Teamplay) {
    if (Team === P.TEAM_RED) return STR_TEAM_RED;
    if (Team === P.TEAM_BLUE) return STR_TEAM_BLUE;
  } else if (Team === 0) return STR_TEAM_GAME;
  return STR_TEAM_SPECTATORS;
}

const DO_CHAT = 0, DO_BROADCAST = 1, DO_SPECIAL = 2;
const PARA_NONE = 0, PARA_I = 1, PARA_III = 3; // PARA_II = 2 is used by no message
const gs_GameMsgList: { m_Action: number; m_ParaType: number; m_pText: string }[] = [
  { m_Action: DO_CHAT, m_ParaType: PARA_NONE, m_pText: 'Teams were swapped' },
  { m_Action: DO_CHAT, m_ParaType: PARA_NONE, m_pText: 'Invalid spectator id used' },
  { m_Action: DO_CHAT, m_ParaType: PARA_NONE, m_pText: 'Teams were shuffled' },
  { m_Action: DO_CHAT, m_ParaType: PARA_NONE, m_pText: 'Teams have been balanced' },
  { m_Action: DO_SPECIAL, m_ParaType: PARA_NONE, m_pText: '' },
  { m_Action: DO_SPECIAL, m_ParaType: PARA_NONE, m_pText: '' },
  { m_Action: DO_SPECIAL, m_ParaType: PARA_I, m_pText: '' },
  { m_Action: DO_SPECIAL, m_ParaType: PARA_I, m_pText: '' },
  { m_Action: DO_SPECIAL, m_ParaType: PARA_I, m_pText: '' },
  { m_Action: DO_SPECIAL, m_ParaType: PARA_III, m_pText: '' },
  { m_Action: DO_SPECIAL, m_ParaType: PARA_I, m_pText: '' },
];

export const SERVERMODE_PURE = 0, SERVERMODE_MOD = 1, SERVERMODE_PUREMOD = 2;

export interface CPlayerInfoItem { m_pPlayerInfo: P.CNetObj_PlayerInfo | null; m_ClientID: number }
export interface CCharacterInfo { m_Active: boolean; m_Prev: P.CNetObj_Character; m_Cur: P.CNetObj_Character; m_Position: vec2 }

function emptyCharacter(): P.CNetObj_Character {
  return {
    m_Tick: 0, m_X: 0, m_Y: 0, m_VelX: 0, m_VelY: 0, m_Angle: 0, m_Direction: 0, m_Jumped: 0, m_HookedPlayer: 0, m_HookState: 0, m_HookTick: 0,
    m_HookX: 0, m_HookY: 0, m_HookDx: 0, m_HookDy: 0, m_Health: 0, m_Armor: 0, m_AmmoCount: 0, m_Weapon: 0, m_Emote: 0, m_AttackTick: 0, m_TriggeredEvents: 0,
  };
}

/** CGameClient::CSnapState */
export class CSnapState {
  m_pLocalCharacter: P.CNetObj_Character | null = null;
  m_pLocalPrevCharacter: P.CNetObj_Character | null = null;
  m_pLocalInfo: P.CNetObj_PlayerInfo | null = null;
  m_pSpectatorInfo: P.CNetObj_SpectatorInfo | null = null;
  m_pPrevSpectatorInfo: P.CNetObj_SpectatorInfo | null = null;
  m_paFlags: (P.CNetObj_Flag | null)[] = [null, null];
  m_pGameData: P.CNetObj_GameData | null = null;
  m_pGameDataTeam: P.CNetObj_GameDataTeam | null = null;
  m_pGameDataFlag: P.CNetObj_GameDataFlag | null = null;
  m_pGameDataRace: P.CNetObj_GameDataRace | null = null;
  m_GameDataFlagSnapID = 0;
  m_NotReadyCount = 0;
  m_AliveCount = [0, 0];
  m_paPlayerInfos: (P.CNetObj_PlayerInfo | null)[] = new Array(MAX_CLIENTS).fill(null);
  m_paPlayerInfosRace: (P.CNetObj_PlayerInfoRace | null)[] = new Array(MAX_CLIENTS).fill(null);
  m_aInfoByScore: CPlayerInfoItem[] = Array.from({ length: MAX_CLIENTS }, () => ({ m_pPlayerInfo: null, m_ClientID: 0 }));
  m_SpecInfo = { m_Active: false, m_SpecMode: 0, m_SpectatorID: 0, m_UsePosition: false, m_Position: new vec2(0, 0) };
  m_aCharacters: CCharacterInfo[] = Array.from({ length: MAX_CLIENTS }, () => ({ m_Active: false, m_Prev: emptyCharacter(), m_Cur: emptyCharacter(), m_Position: new vec2(0, 0) }));
}

const s_aBotColors = [
  [0xff, 0x00, 0x00], [0xff, 0x66, 0x00], [0x4d, 0x9f, 0x45], [0xd5, 0x9e, 0x29], [0x9f, 0xd3, 0xa9], [0xbd, 0xd8, 0x5e],
  [0xc0, 0x7f, 0x94], [0xc3, 0xa2, 0x67], [0xf8, 0xa8, 0x3b], [0xcc, 0xe2, 0xbf], [0xe6, 0xb4, 0x98], [0x74, 0xc7, 0xa3],
];

/** CGameClient::CClientData */
export class CClientData {
  m_aName = '';
  m_aClan = '';
  m_Country = -1;
  m_aaSkinPartNames: string[] = new Array(P.NUM_SKINPARTS).fill('');
  m_aUseCustomColors: number[] = new Array(P.NUM_SKINPARTS).fill(0);
  m_aSkinPartColors: number[] = new Array(P.NUM_SKINPARTS).fill(0);
  m_SkinPartIDs: number[] = new Array(P.NUM_SKINPARTS).fill(0);
  m_Team = 0;
  m_Emoticon = 0;
  m_EmoticonStart = -1;
  m_Predicted = new CCharacterCore();
  m_SkinInfo = new CTeeRenderInfo();
  m_RenderInfo = new CTeeRenderInfo();
  m_Angle = 0;
  m_Active = false;
  m_ChatIgnore = false;
  m_Friend = false;

  UpdateBotRenderInfo(pGameClient: CGameClient, ClientID: number): void {
    const pi = pGameClient.m_Snap.m_paPlayerInfos[ClientID];
    if (pi && pi.m_PlayerFlags & P.PLAYERFLAG_BOT) {
      this.m_RenderInfo.m_BotTexture = pGameClient.m_pSkins.m_BotTexture;
      if (!this.m_RenderInfo.m_BotColor.a) {
        const c = s_aBotColors[Math.floor(Math.random() * s_aBotColors.length)];
        this.m_RenderInfo.m_BotColor = v4(c[0] / 255, c[1] / 255, c[2] / 255, 1);
      }
    } else {
      this.m_RenderInfo.m_BotTexture = new CTeeRenderInfo().m_BotTexture;
      this.m_RenderInfo.m_BotColor = v4(0, 0, 0, 0);
    }
  }

  UpdateRenderInfo(pGameClient: CGameClient, ClientID: number, UpdateSkinInfo: boolean): void {
    const skins = pGameClient.m_pSkins;
    if (UpdateSkinInfo) {
      skins.ValidateSkinParts(this.m_aaSkinPartNames, this.m_aUseCustomColors, this.m_aSkinPartColors, pGameClient.m_GameInfo.m_GameFlags);
      this.m_SkinInfo.m_Size = 64;
      if (pGameClient.IsXmas()) {
        this.m_SkinInfo.m_HatTexture = skins.m_XmasHatTexture;
        this.m_SkinInfo.m_HatSpriteIndex = ClientID % HAT_NUM;
      } else this.m_SkinInfo.m_HatTexture = new CTeeRenderInfo().m_HatTexture;
      for (let p = 0; p < P.NUM_SKINPARTS; p++) {
        let ID = skins.FindSkinPart(p, this.m_aaSkinPartNames[p], false);
        if (ID < 0) {
          if (p === P.SKINPART_MARKING || p === P.SKINPART_DECORATION) ID = skins.FindSkinPart(p, '', false);
          else ID = skins.FindSkinPart(p, 'standard', false);
          this.m_SkinPartIDs[p] = ID < 0 ? 0 : ID;
        } else {
          if (this.m_SkinInfo.m_HatTexture.IsValid()) {
            if (p === P.SKINPART_BODY && str_comp(this.m_aaSkinPartNames[p], 'standard')) this.m_SkinInfo.m_HatSpriteIndex = HAT_OFFSET_SIDE + (ClientID % HAT_NUM);
            if (p === P.SKINPART_DECORATION && !str_comp(this.m_aaSkinPartNames[p], 'twinbopp')) this.m_SkinInfo.m_HatSpriteIndex = HAT_OFFSET_SIDE + (ClientID % HAT_NUM);
          }
          this.m_SkinPartIDs[p] = ID;
        }
        const pSkinPart = skins.GetSkinPart(p, this.m_SkinPartIDs[p]);
        if (this.m_aUseCustomColors[p]) {
          this.m_SkinInfo.m_aTextures[p] = pSkinPart.m_ColorTexture;
          this.m_SkinInfo.m_aColors[p] = skins.GetColorV4(this.m_aSkinPartColors[p], p === P.SKINPART_MARKING);
        } else {
          this.m_SkinInfo.m_aTextures[p] = pSkinPart.m_OrgTexture;
          this.m_SkinInfo.m_aColors[p] = v4(1, 1, 1, 1);
        }
      }
    }
    this.m_RenderInfo = this.m_SkinInfo.copy();
    if (pGameClient.m_GameInfo.m_GameFlags & P.GAMEFLAG_TEAMS) {
      for (let p = 0; p < P.NUM_SKINPARTS; p++) {
        this.m_RenderInfo.m_aTextures[p] = skins.GetSkinPart(p, this.m_SkinPartIDs[p]).m_ColorTexture;
        const ColorVal = skins.GetTeamColor(this.m_aUseCustomColors[p], this.m_aSkinPartColors[p], this.m_Team, p);
        this.m_RenderInfo.m_aColors[p] = skins.GetColorV4(ColorVal, p === P.SKINPART_MARKING);
      }
    }
  }

  Reset(pGameClient: CGameClient, ClientID: number): void {
    this.m_aName = '';
    this.m_aClan = '';
    this.m_Country = -1;
    this.m_Team = 0;
    this.m_Angle = 0;
    this.m_Emoticon = 0;
    this.m_EmoticonStart = -1;
    this.m_Active = false;
    this.m_ChatIgnore = false;
    this.m_Friend = false;
    for (let p = 0; p < P.NUM_SKINPARTS; p++) {
      this.m_SkinPartIDs[p] = 0;
      this.m_SkinInfo.m_aTextures[p] = pGameClient.m_pSkins.GetSkinPart(p, 0).m_ColorTexture;
      this.m_SkinInfo.m_aColors[p] = v4(1, 1, 1, 1);
    }
    this.m_RenderInfo = new CTeeRenderInfo();
    this.UpdateRenderInfo(pGameClient, ClientID, false);
  }
}

export interface CGameInfo { m_GameFlags: number; m_ScoreLimit: number; m_TimeLimit: number; m_MatchNum: number; m_MatchCurrent: number; m_NumPlayers: number; m_aTeamSize: number[] }
const emptyGameInfo = (): CGameInfo => ({ m_GameFlags: 0, m_ScoreLimit: 0, m_TimeLimit: 0, m_MatchNum: 0, m_MatchCurrent: 0, m_NumPlayers: 0, m_aTeamSize: [0, 0] });

function CompareScore(Pl1: P.CNetObj_PlayerInfo, Pl2: P.CNetObj_PlayerInfo): boolean { return Pl1.m_Score < Pl2.m_Score; }
function CompareTime(Pl1: P.CNetObj_PlayerInfo, Pl2: P.CNetObj_PlayerInfo): boolean {
  if (Pl1.m_Score < 0) return true;
  if (Pl2.m_Score < 0) return false;
  return Pl1.m_Score > Pl2.m_Score;
}

/** the engine parts the game client uses */
export interface CEngineParts {
  client: CClient;
  graphics: CGraphics;
  text: CTextRender;
  sound: CSound;
  input: CInput;
  storage: CStorage;
  console: CConsole;
  config: CConfig;
}

export class CGameClient implements IGameClient {
  private m_All: CComponent[] = [];
  private m_Input: CComponent[] = [];
  private m_NetObjHandler = new P.CNetObjHandler();
  private m_pClient: CClient;
  private m_pGraphics: CGraphics;
  private m_pTextRender: CTextRender;
  private m_pSound: CSound;
  private m_pInput: CInput;
  private m_pStorage: CStorage;
  private m_pConsole: CConsole;
  private m_pConfig: CConfig;
  private m_Layers = new CLayers();
  private m_Collision = new CCollision();
  private m_UI = new CUI();
  m_RenderTools = new CRenderTools();
  m_Friends: CContacts;
  /** the skin files the player saved (skins/*.json of the save directory), kept with settings.cfg */
  m_SavedSkins = new Map<string, Uint8Array>();
  /** the saved skins changed (host.ts writes them) */
  onSkinsChanged: (() => void) | null = null;
  m_Blacklist: CContacts;

  m_PredictedTick = 0;
  private m_LastNewPredictedTick = -1;
  private m_LastGameStartTick = -1;
  private m_LastFlagCarrierRed = P.FLAG_MISSING;
  private m_LastFlagCarrierBlue = P.FLAG_MISSING;
  private s_LastGameFlags = 0;

  m_SuppressEvents = false;
  m_Tuning = new CTuningParams();
  m_ServerMode = SERVERMODE_PURE;
  m_DemoSpecMode = P.SPEC_FREEVIEW;
  m_DemoSpecID = -1;
  m_LocalCharacterPos = new vec2(0, 0);
  m_PredictedPrevChar = new CCharacterCore();
  m_PredictedChar = new CCharacterCore();
  m_Snap = new CSnapState();
  m_aClients: CClientData[] = Array.from({ length: MAX_CLIENTS }, () => new CClientData());
  m_LocalClientID = -1;
  m_TeamCooldownTick = 0;
  m_MuteServerBroadcast = false;
  m_TeamChangeTime = 0;
  m_IsXmasDay = false;
  m_LastSkinChangeTime = 0;
  m_IsEasterDay = false;
  m_InitComplete = false;
  m_GameInfo: CGameInfo = emptyGameInfo();
  m_ServerSettings = { m_KickVote: false, m_KickMin: 0, m_SpecVote: false, m_TeamLock: false, m_TeamBalance: false, m_PlayerSlots: 0 };

  // the components
  m_pGameConsole = new CGameConsole();
  m_pBinds = new CBinds();
  m_pBroadcast = new CBroadcast();
  m_pParticles = new CParticles();
  m_pMenus = new CMenus();
  m_pSkins = new CSkins();
  m_pCountryFlags = new CCountryFlags();
  m_pFlow = new CFlow();
  m_pChat = new CChat();
  m_pDamageind = new CDamageInd();
  m_pCamera = new CCamera();
  m_pControls = new CControls();
  m_pEffects = new CEffects();
  m_pSounds = new CSounds();
  m_pMotd = new CMotd();
  m_pMapimages = new CMapImages();
  m_pVoting = new CVoting();
  m_pScoreboard = new CScoreboard();
  m_pStats = new CStats();
  m_pItems = new CItems();
  m_pMapLayersBackGround = new CMapLayers(TYPE_BACKGROUND);
  m_pMapLayersForeGround = new CMapLayers(TYPE_FOREGROUND);
  m_pInfoMessages = new CInfoMessages();
  m_pHud = new CHud();
  m_pDebugHud = new CDebugHud();
  m_pNotifications = new CNotifications();
  m_pEmoticon = new CEmoticon();
  m_pSpectator = new CSpectator();
  m_pPlayers = new CPlayers();
  m_pNamePlates = new CNamePlates();

  constructor(e: CEngineParts) {
    this.m_pClient = e.client;
    this.m_pGraphics = e.graphics;
    this.m_pTextRender = e.text;
    this.m_pSound = e.sound;
    this.m_pInput = e.input;
    this.m_pStorage = e.storage;
    this.m_pConsole = e.console;
    this.m_pConfig = e.config;
    this.m_Friends = new CContacts(e.config, e.console, 'friend');
    this.m_Blacklist = new CContacts(e.config, e.console, 'ignore');
  }

  Graphics(): CGraphics { return this.m_pGraphics; }
  Client(): CClient { return this.m_pClient; }
  UI(): CUI { return this.m_UI; }
  Sound(): CSound { return this.m_pSound; }
  Input(): CInput { return this.m_pInput; }
  Storage(): CStorage { return this.m_pStorage; }
  Config(): CConfig { return this.m_pConfig; }
  Console(): CConsole { return this.m_pConsole; }
  TextRender(): CTextRender { return this.m_pTextRender; }
  RenderTools(): CRenderTools { return this.m_RenderTools; }
  Layers(): CLayers { return this.m_Layers; }
  Collision(): CCollision { return this.m_Collision; }
  Friends(): CContacts { return this.m_Friends; }
  Blacklist(): CContacts { return this.m_Blacklist; }

  NetVersion(): string { return GAME_NETVERSION; }
  ClientVersion(): number { return CLIENT_VERSION; }
  Version(): string { return '0.7.5'; }
  GetItemName(Type: number): string { return this.m_NetObjHandler.GetObjName(Type); }
  NetmsgFailedOn(): string { return this.m_NetObjHandler.FailedMsgOn() ?? ''; }
  NetobjFailedOn(): string { return this.m_NetObjHandler.FailedObjOn() ?? ''; }
  NetobjNumFailures(): number { return this.m_NetObjHandler.NumObjFailures(); }
  IsXmas(): boolean { return this.Config().m_ClShowXmasHats === 2 || (this.Config().m_ClShowXmasHats === 1 && this.m_IsXmasDay); }
  IsEaster(): boolean { return this.Config().m_ClShowEasterEggs === 2 || (this.Config().m_ClShowEasterEggs === 1 && this.m_IsEasterDay); }
  RacePrecision(): number { return this.m_Snap.m_pGameDataRace ? this.m_Snap.m_pGameDataRace.m_Precision : 3; }

  GetPlayerLabel(ClientID: number, ClientName: string): string {
    if (!this.Config().m_ClShowsocial) return str_format(64, '%2d:', ClientID);
    if (this.Config().m_ClShowUserId) return str_format(64, '%2d: %s', ClientID, ClientName);
    return str_format(64, '%s', ClientName);
  }

  /** SendPackMsg of a generated message */
  SendMsg<T>(id: number, pack: (m: T, p: CMsgPacker) => boolean, m: T, Flags: number): void {
    this.Client().SendPackMsg(id, (p) => pack(m, p), Flags);
  }

  OnConsoleInit(): void {
    this.m_InitComplete = false;
    const s = this.m_pSpectator, b = this.m_pBinds, m = this.m_pMenus, pa = this.m_pParticles;
    this.m_All = [
      this.m_pSkins, this.m_pCountryFlags, this.m_pMapimages, this.m_pEffects, pa, b, b.m_SpecialBinds, this.m_pControls, this.m_pCamera,
      this.m_pSounds, this.m_pVoting,
      this.m_pMapLayersBackGround, pa.m_RenderTrail, this.m_pItems, this.m_pPlayers, this.m_pMapLayersForeGround, pa.m_RenderExplosions,
      this.m_pNamePlates, pa.m_RenderGeneral, this.m_pDamageind, this.m_pHud, s, this.m_pEmoticon, this.m_pInfoMessages, this.m_pChat,
      this.m_pBroadcast, this.m_pDebugHud, this.m_pNotifications, this.m_pScoreboard, this.m_pStats, this.m_pMotd, m, m.m_Binder,
      this.m_pGameConsole,
    ];
    this.m_Input = [m.m_Binder, b.m_SpecialBinds, this.m_pGameConsole, this.m_pChat, this.m_pMotd, m, s, this.m_pEmoticon, this.m_pControls, b];

    const C = this.Console();
    C.Register('team', 'i[team]', CFGFLAG_CLIENT, (r) => this.ConTeam(r), this, 'Switch team');
    C.Register('kill', '', CFGFLAG_CLIENT, () => { if (this.Client().State() === STATE_ONLINE) this.SendKill(); }, this, 'Kill yourself');
    C.Register('ready_change', '', CFGFLAG_CLIENT, () => { if (this.Client().State() === STATE_ONLINE) this.SendReadyChange(); }, this, 'Change ready state');
    this.m_Friends.OnConsoleInit();
    this.m_Blacklist.OnConsoleInit();
    const chain = (name: string, after: () => void): void => C.Chain(name, (r: CResult, _u: unknown, cb: FCommandCallback, cbUser: unknown) => {
      cb(r, cbUser);
      after();
    }, this);
    const friendUpdate = (): void => {
      for (const c of this.m_aClients) if (c.m_Active) c.m_Friend = this.Friends().IsFriend(c.m_aName, c.m_aClan, true);
    };
    const blacklistUpdate = (): void => {
      for (const c of this.m_aClients) if (c.m_Active) c.m_ChatIgnore = this.Blacklist().IsIgnored(c.m_aName, c.m_aClan, true);
    };
    chain('add_friend', friendUpdate);
    chain('remove_friend', friendUpdate);
    chain('add_ignore', blacklistUpdate);
    chain('remove_ignore', blacklistUpdate);
    C.Chain('cl_show_xmas_hats', (r, _u, cb, cbUser) => {
      cb(r, cbUser);
      if (this.Client().State() !== STATE_ONLINE) return;
      for (let i = 0; i < MAX_CLIENTS; ++i) if (this.m_aClients[i].m_Active) this.m_aClients[i].UpdateRenderInfo(this, i, true);
    }, this);
    for (const part of ['body', 'marking', 'decoration', 'hands', 'feet', 'eyes']) {
      for (const v of [`player_color_${part}`, `player_use_custom_color_${part}`, `player_skin_${part}`]) {
        C.Chain(v, (r, _u, cb, cbUser) => {
          cb(r, cbUser);
          if (this.Client().State() === STATE_ONLINE && r.NumArguments()) this.SendSkinChange();
        }, this);
      }
    }
    C.Chain('player_skin', (r, _u, cb, cbUser) => {
      cb(r, cbUser);
      if (this.Client().State() === STATE_ONLINE && r.NumArguments()) this.SendSkinChange();
    }, this);
    for (const c of this.m_All) c.m_pClient = this;
    for (const c of this.m_All) c.OnConsoleInit();
    this.m_SuppressEvents = false;
  }

  OnInit(): void {
    this.m_UI.Init(this.Config(), this.Graphics(), this.TextRender());
    this.m_RenderTools.Init(this.Config(), this.Graphics(), this.UI());
    // only the items of the first 0.7 release have static sizes
    const OLD_NUM_NETOBJTYPES = 23;
    for (let i = 0; i < OLD_NUM_NETOBJTYPES; i++) this.Client().SnapSetStaticsize(i, this.m_NetObjHandler.GetObjSize(i));
    let TotalWorkAmount = g_pData.m_NumImages + 2;
    for (let i = this.m_All.length - 1; i >= 0; --i) TotalWorkAmount += this.m_All[i].GetInitAmount();
    this.m_pMenus.InitLoading(TotalWorkAmount);
    for (let i = this.m_All.length - 1; i >= 0; --i) this.m_All[i].OnInit();
    for (let i = 0; i < g_pData.m_NumImages; i++) {
      const img = g_pData.m_aImages[i];
      img.m_Id = this.Graphics().LoadTexture(img.m_pFilename, 0, FORMAT_AUTO, img.m_Flag ? TEXLOAD_LINEARMIPMAPS : 0).Id();
    }
    this.OnReset();
    this.m_ServerMode = SERVERMODE_PURE;
    const now = new Date();
    this.m_IsXmasDay = now.getMonth() === 11 && now.getDate() >= 24 && now.getDate() <= 26;
    this.m_IsEasterDay = time_iseasterday(now);
    this.m_InitComplete = true;
  }

  OnUpdate(): void {
    const m = this.Input().MouseRelative();
    if (m.x !== 0 || m.y !== 0) {
      for (const h of this.m_Input) if (h.OnMouseMove(m.x, m.y)) break;
    }
    for (let i = 0; i < this.Input().NumEvents(); i++) {
      const e = this.Input().GetEvent(i);
      if (!this.Input().IsEventValid(e)) continue;
      for (const h of this.m_Input) if (h.OnInput(e)) break;
    }
  }

  OnSnapInput(pData: Int32Array): number { return this.m_pControls.SnapInput(pData); }

  OnConnected(): void {
    this.m_Layers.Init(this.Client().MapData()!);
    this.m_Collision.Init(this.m_Layers);
    for (const c of this.m_All) {
      c.OnMapLoad();
      c.OnReset();
    }
    this.m_ServerMode = SERVERMODE_PURE;
    this.SendStartInfo();
  }

  OnReset(): void {
    this.m_LastNewPredictedTick = -1;
    this.m_Snap = new CSnapState();
    for (let i = 0; i < MAX_CLIENTS; i++) this.m_aClients[i].Reset(this, i);
    for (const c of this.m_All) c.OnReset();
    this.m_LocalClientID = -1;
    this.m_TeamCooldownTick = 0;
    this.m_TeamChangeTime = 0;
    this.m_LastSkinChangeTime = this.Client().LocalTime();
    this.m_GameInfo = emptyGameInfo();
    this.m_DemoSpecMode = P.SPEC_FREEVIEW;
    this.m_DemoSpecID = -1;
    this.m_Tuning = new CTuningParams();
    this.m_MuteServerBroadcast = false;
    this.m_LastGameStartTick = -1;
    this.m_LastFlagCarrierRed = P.FLAG_MISSING;
    this.m_LastFlagCarrierBlue = P.FLAG_MISSING;
  }

  private UpdatePositions(): void {
    const S = this.m_Snap;
    if (this.Config().m_ClPredict && this.Client().State() !== STATE_DEMOPLAYBACK) {
      if (!S.m_pLocalCharacter || (S.m_pGameData && S.m_pGameData.m_GameStateFlags & (P.GAMESTATEFLAG_PAUSED | P.GAMESTATEFLAG_ROUNDOVER | P.GAMESTATEFLAG_GAMEOVER))) {
        // don't use predicted
      } else this.m_LocalCharacterPos = vmix(this.m_PredictedPrevChar.m_Pos, this.m_PredictedChar.m_Pos, this.Client().PredIntraGameTick());
    } else if (S.m_pLocalCharacter && S.m_pLocalPrevCharacter) {
      this.m_LocalCharacterPos = vmix(new vec2(S.m_pLocalPrevCharacter.m_X, S.m_pLocalPrevCharacter.m_Y), new vec2(S.m_pLocalCharacter.m_X, S.m_pLocalCharacter.m_Y), this.Client().IntraGameTick());
    }
    if (S.m_SpecInfo.m_Active) {
      if (S.m_pSpectatorInfo && (S.m_SpecInfo.m_SpecMode !== P.SPEC_FREEVIEW || (S.m_pLocalInfo && S.m_pLocalInfo.m_PlayerFlags & P.PLAYERFLAG_DEAD && S.m_SpecInfo.m_SpecMode !== P.SPEC_FREEVIEW))) {
        if (S.m_pPrevSpectatorInfo)
          S.m_SpecInfo.m_Position = vmix(new vec2(S.m_pPrevSpectatorInfo.m_X, S.m_pPrevSpectatorInfo.m_Y), new vec2(S.m_pSpectatorInfo.m_X, S.m_pSpectatorInfo.m_Y), this.Client().IntraGameTick());
        else S.m_SpecInfo.m_Position = new vec2(S.m_pSpectatorInfo.m_X, S.m_pSpectatorInfo.m_Y);
        this.m_LocalCharacterPos = S.m_SpecInfo.m_Position;
        S.m_SpecInfo.m_UsePosition = true;
      }
    }
  }

  private EvolveCharacter(pCharacter: P.CNetObj_Character, Tick: number): void {
    const TempWorld = new CWorldCore();
    const TempCore = new CCharacterCore();
    TempCore.Init(TempWorld, this.Collision());
    TempCore.Read(pCharacter);
    while (pCharacter.m_Tick < Tick) {
      pCharacter.m_Tick++;
      TempCore.Tick(false);
      TempCore.Move();
      TempCore.Quantize();
    }
    TempCore.Write(pCharacter);
  }

  private StartRendering(): void {
    if (this.Config().m_GfxClear) {
      if (this.m_pMenus.IsBackgroundNeeded()) this.Graphics().Clear(0.45, 0.45, 0.45);
      else this.Graphics().Clear(1, 1, 0);
    } else if (this.m_pMenus.IsBackgroundNeeded()) {
      const sw = 300 * this.Graphics().ScreenAspect(), sh = 300;
      this.Graphics().MapScreen(0, 0, sw, sh);
      this.Graphics().TextureClear();
      this.Graphics().QuadsBegin();
      this.Graphics().SetColor(0.45, 0.45, 0.45, 1);
      this.Graphics().QuadsDrawTL([new CQuadItem(0, 0, sw, sh)], 1);
      this.Graphics().QuadsEnd();
    }
  }

  OnRender(): void {
    this.UpdatePositions();
    this.StartRendering();
    for (const c of this.m_All) c.OnRender();
    this.Input().Clear();
  }

  OnRelease(): void { for (const c of this.m_All) c.OnRelease(); }

  OnMessage(MsgId: number, pUnpacker: CUnpacker): void {
    if (MsgId === P.NETMSGTYPE_SV_TUNEPARAMS && this.Client().State() !== STATE_DEMOPLAYBACK) {
      const NewTuning = new CTuningParams();
      for (let i = 0; i < CTuningParams.Num(); i++) NewTuning.v[i] = pUnpacker.GetInt();
      if (pUnpacker.Error()) return;
      this.m_ServerMode = SERVERMODE_PURE;
      this.m_Tuning = NewTuning;
      return;
    } else if (MsgId === P.NETMSGTYPE_SV_VOTEOPTIONLISTADD) {
      const NumOptions = pUnpacker.GetInt();
      for (let i = 0; i < NumOptions; i++) {
        const pDescription = pUnpacker.GetString(SANITIZE_CC);
        if (pUnpacker.Error()) return;
        this.m_pVoting.AddOption(pDescription);
      }
    } else if (MsgId === P.NETMSGTYPE_SV_GAMEMSG) {
      const GameMsgID = pUnpacker.GetInt();
      if (GameMsgID < 0 || GameMsgID >= P.NUM_GAMEMSGS) return;
      const aParaI = [0, 0, 0];
      const NumParaI = [0, 1, 2, 3][gs_GameMsgList[GameMsgID].m_ParaType];
      for (let i = 0; i < NumParaI; i++) aParaI[i] = pUnpacker.GetInt();
      if (pUnpacker.Error()) return;
      const TeamPlay = (this.m_GameInfo.m_GameFlags & P.GAMEFLAG_TEAMS) !== 0;
      if (gs_GameMsgList[GameMsgID].m_Action === DO_SPECIAL) {
        switch (GameMsgID) {
          case P.GAMEMSG_CTF_DROP:
            if (this.m_SuppressEvents) return;
            this.m_pSounds.Enqueue(CHN_GLOBAL, P.SOUND_CTF_DROP);
            break;
          case P.GAMEMSG_CTF_RETURN:
            if (this.m_SuppressEvents) return;
            this.m_pSounds.Enqueue(CHN_GLOBAL, P.SOUND_CTF_RETURN);
            break;
          case P.GAMEMSG_TEAM_ALL: {
            let pMsg = '';
            switch (GetStrTeam(aParaI[0], TeamPlay)) {
              case STR_TEAM_GAME: pMsg = Localize('All players were moved to the game'); break;
              case STR_TEAM_RED: pMsg = Localize('All players were moved to the red team'); break;
              case STR_TEAM_BLUE: pMsg = Localize('All players were moved to the blue team'); break;
              case STR_TEAM_SPECTATORS: pMsg = Localize('All players were moved to the spectators'); break;
            }
            this.m_pBroadcast.DoBroadcast(pMsg);
            break;
          }
          case P.GAMEMSG_TEAM_BALANCE_VICTIM: {
            let pMsg = '';
            switch (GetStrTeam(aParaI[0], TeamPlay)) {
              case STR_TEAM_RED: pMsg = Localize('You were moved to the red team due to team balancing'); break;
              case STR_TEAM_BLUE: pMsg = Localize('You were moved to the blue team due to team balancing'); break;
            }
            this.m_pBroadcast.DoBroadcast(pMsg);
            break;
          }
          case P.GAMEMSG_CTF_GRAB: {
            if (this.m_SuppressEvents) return;
            const S = this.m_Snap.m_SpecInfo;
            if (this.m_LocalClientID !== -1 && (this.m_aClients[this.m_LocalClientID].m_Team !== aParaI[0] || (S.m_Active &&
              ((S.m_SpectatorID !== -1 && this.m_aClients[S.m_SpectatorID].m_Team !== aParaI[0]) ||
                (S.m_SpecMode === P.SPEC_FLAGRED && aParaI[0] !== P.TEAM_RED) || (S.m_SpecMode === P.SPEC_FLAGBLUE && aParaI[0] !== P.TEAM_BLUE)))))
              this.m_pSounds.Enqueue(CHN_GLOBAL, P.SOUND_CTF_GRAB_PL);
            else this.m_pSounds.Enqueue(CHN_GLOBAL, P.SOUND_CTF_GRAB_EN);
            break;
          }
          case P.GAMEMSG_GAME_PAUSED: {
            const ClientID = clamp(aParaI[0], 0, MAX_CLIENTS - 1);
            const aLabel = this.GetPlayerLabel(ClientID, this.m_aClients[ClientID].m_aName);
            this.m_pChat.AddLine(str_format(256, Localize("'%s' initiated a pause"), aLabel));
            break;
          }
          case P.GAMEMSG_CTF_CAPTURE: {
            this.m_pSounds.Enqueue(CHN_GLOBAL, P.SOUND_CTF_CAPTURE);
            const ClientID = clamp(aParaI[1], 0, MAX_CLIENTS - 1);
            this.m_pStats.OnFlagCapture(ClientID);
            const aLabel = this.GetPlayerLabel(ClientID, this.m_aClients[ClientID].m_aName);
            const Time = f(aParaI[2] / this.Client().GameTickSpeed());
            let aBuf: string;
            if (Time <= 60) {
              aBuf = aParaI[0] ? str_format(256, Localize("The blue flag was captured by '%s' (%.2f seconds)"), aLabel, Time)
                : str_format(256, Localize("The red flag was captured by '%s' (%.2f seconds)"), aLabel, Time);
            } else {
              aBuf = aParaI[0] ? str_format(256, Localize("The blue flag was captured by '%s'"), aLabel) : str_format(256, Localize("The red flag was captured by '%s'"), aLabel);
            }
            this.m_pChat.AddLine(aBuf);
            break;
          }
        }
        return;
      }
      const pText = NumParaI === 0 ? Localize(gs_GameMsgList[GameMsgID].m_pText) : '';
      switch (gs_GameMsgList[GameMsgID].m_Action) {
        case DO_CHAT: this.m_pChat.AddLine(pText); break;
        case DO_BROADCAST: this.m_pBroadcast.DoBroadcast(pText); break;
      }
    }

    const pRawMsg = this.m_NetObjHandler.SecureUnpackMsg(MsgId, pUnpacker);
    if (!pRawMsg) {
      this.Console().Print(OUTPUT_LEVEL_ADDINFO, 'client', str_format(256, "dropped weird message '%s' (%d), failed on '%s'", this.m_NetObjHandler.GetMsgName(MsgId), MsgId, this.m_NetObjHandler.FailedMsgOn() ?? ''));
      return;
    }
    for (const c of this.m_All) c.OnMessage(MsgId, pRawMsg);

    if (MsgId === P.NETMSGTYPE_SV_CLIENTINFO && this.Client().State() !== STATE_DEMOPLAYBACK) {
      const pMsg = pRawMsg as P.CNetMsg_Sv_ClientInfo;
      if (pMsg.m_Local) {
        if (this.m_LocalClientID !== -1) {
          if (this.Config().m_Debug) this.Console().Print(OUTPUT_LEVEL_ADDINFO, 'client', 'invalid local clientinfo');
          return;
        }
        this.m_LocalClientID = pMsg.m_ClientID;
        this.m_TeamChangeTime = this.Client().LocalTime();
      } else {
        if (this.m_aClients[pMsg.m_ClientID].m_Active) {
          if (this.Config().m_Debug) this.Console().Print(OUTPUT_LEVEL_ADDINFO, 'client', 'invalid clientinfo');
          return;
        }
        if (this.m_LocalClientID !== -1 && !pMsg.m_Silent) this.DoEnterMessage(pMsg.m_pName, pMsg.m_ClientID, pMsg.m_Team);
      }
      const c = this.m_aClients[pMsg.m_ClientID];
      c.m_Active = true;
      c.m_Team = pMsg.m_Team;
      c.m_aName = str_copy(pMsg.m_pName, P_MAX_NAME_LENGTH);
      c.m_aClan = str_copy(pMsg.m_pClan, P_MAX_CLAN_LENGTH);
      c.m_Country = pMsg.m_Country;
      for (let i = 0; i < P.NUM_SKINPARTS; i++) {
        c.m_aaSkinPartNames[i] = str_copy(pMsg.m_apSkinPartNames[i], 24);
        c.m_aUseCustomColors[i] = pMsg.m_aUseCustomColors[i];
        c.m_aSkinPartColors[i] = pMsg.m_aSkinPartColors[i];
      }
      c.m_Friend = this.Friends().IsFriend(c.m_aName, c.m_aClan, true);
      c.m_ChatIgnore = this.Blacklist().IsIgnored(c.m_aName, c.m_aClan, true);
      if (c.m_ChatIgnore) {
        const aLabel = this.GetPlayerLabel(pMsg.m_ClientID, c.m_aName);
        this.m_pChat.AddLine(str_format(128, Localize('%s is muted by you'), aLabel), CHAT_CLIENT_MSG);
      }
      c.UpdateRenderInfo(this, pMsg.m_ClientID, true);
      this.m_GameInfo.m_NumPlayers++;
      if (c.m_Team !== P.TEAM_SPECTATORS) this.m_GameInfo.m_aTeamSize[c.m_Team]++;
      this.m_pStats.OnPlayerEnter(pMsg.m_ClientID, pMsg.m_Team);
    } else if (MsgId === P.NETMSGTYPE_SV_CLIENTDROP && this.Client().State() !== STATE_DEMOPLAYBACK) {
      const pMsg = pRawMsg as P.CNetMsg_Sv_ClientDrop;
      const c = this.m_aClients[pMsg.m_ClientID];
      if (this.m_LocalClientID === pMsg.m_ClientID || !c.m_Active) {
        if (this.Config().m_Debug) this.Console().Print(OUTPUT_LEVEL_ADDINFO, 'client', 'invalid clientdrop');
        return;
      }
      if (!pMsg.m_Silent) this.DoLeaveMessage(c.m_aName, pMsg.m_ClientID, pMsg.m_pReason);
      this.m_GameInfo.m_NumPlayers--;
      if (c.m_Team !== P.TEAM_SPECTATORS) this.m_GameInfo.m_aTeamSize[c.m_Team]--;
      c.Reset(this, pMsg.m_ClientID);
      this.m_pStats.OnPlayerLeave(pMsg.m_ClientID);
    } else if (MsgId === P.NETMSGTYPE_SV_SKINCHANGE && this.Client().State() !== STATE_DEMOPLAYBACK) {
      const pMsg = pRawMsg as P.CNetMsg_Sv_SkinChange;
      const c = this.m_aClients[pMsg.m_ClientID];
      if (!c.m_Active) {
        if (this.Config().m_Debug) this.Console().Print(OUTPUT_LEVEL_ADDINFO, 'client', 'invalid skin info');
        return;
      }
      for (let i = 0; i < P.NUM_SKINPARTS; i++) {
        c.m_aaSkinPartNames[i] = str_copy(pMsg.m_apSkinPartNames[i], 24);
        c.m_aUseCustomColors[i] = pMsg.m_aUseCustomColors[i];
        c.m_aSkinPartColors[i] = pMsg.m_aSkinPartColors[i];
      }
      c.UpdateRenderInfo(this, pMsg.m_ClientID, true);
    } else if (MsgId === P.NETMSGTYPE_SV_GAMEINFO && this.Client().State() !== STATE_DEMOPLAYBACK) {
      const pMsg = pRawMsg as P.CNetMsg_Sv_GameInfo;
      this.m_GameInfo.m_GameFlags = pMsg.m_GameFlags;
      this.m_GameInfo.m_ScoreLimit = pMsg.m_ScoreLimit;
      this.m_GameInfo.m_TimeLimit = pMsg.m_TimeLimit;
      this.m_GameInfo.m_MatchNum = pMsg.m_MatchNum;
      this.m_GameInfo.m_MatchCurrent = pMsg.m_MatchCurrent;
    } else if (MsgId === P.NETMSGTYPE_SV_SERVERSETTINGS && this.Client().State() !== STATE_DEMOPLAYBACK) {
      const pMsg = pRawMsg as P.CNetMsg_Sv_ServerSettings;
      if (!this.m_ServerSettings.m_TeamLock && pMsg.m_TeamLock) this.m_pChat.AddLine(Localize('Teams were locked'));
      else if (this.m_ServerSettings.m_TeamLock && !pMsg.m_TeamLock) this.m_pChat.AddLine(Localize('Teams were unlocked'));
      this.m_ServerSettings = { m_KickVote: !!pMsg.m_KickVote, m_KickMin: pMsg.m_KickMin, m_SpecVote: !!pMsg.m_SpecVote, m_TeamLock: !!pMsg.m_TeamLock,
        m_TeamBalance: !!pMsg.m_TeamBalance, m_PlayerSlots: pMsg.m_PlayerSlots };
    } else if (MsgId === P.NETMSGTYPE_SV_TEAM) {
      const pMsg = pRawMsg as P.CNetMsg_Sv_Team;
      const c = this.m_aClients[pMsg.m_ClientID];
      if (this.Client().State() !== STATE_DEMOPLAYBACK) {
        if (c.m_Team !== P.TEAM_SPECTATORS) this.m_GameInfo.m_aTeamSize[c.m_Team]--;
        c.m_Team = pMsg.m_Team;
        if (c.m_Team !== P.TEAM_SPECTATORS) this.m_GameInfo.m_aTeamSize[c.m_Team]++;
        c.UpdateRenderInfo(this, pMsg.m_ClientID, false);
        if (pMsg.m_ClientID === this.m_LocalClientID) {
          this.m_TeamCooldownTick = pMsg.m_CooldownTick;
          this.m_TeamChangeTime = this.Client().LocalTime();
        }
      }
      if (pMsg.m_Silent === 0) this.DoTeamChangeMessage(c.m_aName, pMsg.m_ClientID, pMsg.m_Team);
    } else if (MsgId === P.NETMSGTYPE_SV_READYTOENTER) {
      this.Client().EnterGame();
    } else if (MsgId === P.NETMSGTYPE_SV_EMOTICON) {
      const pMsg = pRawMsg as P.CNetMsg_Sv_Emoticon;
      this.m_aClients[pMsg.m_ClientID].m_Emoticon = pMsg.m_Emoticon;
      this.m_aClients[pMsg.m_ClientID].m_EmoticonStart = this.Client().GameTick();
    }
  }

  OnStateChange(NewState: number, OldState: number): void {
    if (NewState < STATE_ONLINE) this.OnReset();
    for (const c of this.m_All) c.OnStateChange(NewState, OldState);
  }

  OnShutdown(): void { for (const c of this.m_All) c.OnShutdown(); }
  OnRconLine(pLine: string): void { this.m_pGameConsole.PrintLine(CONSOLETYPE_REMOTE, pLine); }

  private ProcessEvents(): void {
    if (this.m_SuppressEvents) return;
    const Num = this.Client().SnapNumItems(SNAP_CURRENT);
    const Item: CSnapItem = { m_Type: 0, m_ID: 0, m_DataSize: 0 };
    for (let Index = 0; Index < Num; Index++) {
      const d = this.Client().SnapGetItem(SNAP_CURRENT, Index, Item);
      if (Item.m_Type === P.NETEVENTTYPE_DAMAGE) {
        const ev = P.read_CNetEvent_Damage(d);
        this.m_pEffects.DamageIndicator(new vec2(ev.m_X, ev.m_Y), ev.m_HealthAmount + ev.m_ArmorAmount);
      } else if (Item.m_Type === P.NETEVENTTYPE_EXPLOSION) {
        const ev = P.read_CNetEvent_Explosion(d);
        this.m_pEffects.Explosion(new vec2(ev.m_X, ev.m_Y));
      } else if (Item.m_Type === P.NETEVENTTYPE_HAMMERHIT) {
        const ev = P.read_CNetEvent_HammerHit(d);
        this.m_pEffects.HammerHit(new vec2(ev.m_X, ev.m_Y));
      } else if (Item.m_Type === P.NETEVENTTYPE_SPAWN) {
        const ev = P.read_CNetEvent_Spawn(d);
        this.m_pEffects.PlayerSpawn(new vec2(ev.m_X, ev.m_Y));
      } else if (Item.m_Type === P.NETEVENTTYPE_DEATH) {
        const ev = P.read_CNetEvent_Death(d);
        this.m_pEffects.PlayerDeath(new vec2(ev.m_X, ev.m_Y), ev.m_ClientID);
      } else if (Item.m_Type === P.NETEVENTTYPE_SOUNDWORLD) {
        const ev = P.read_CNetEvent_SoundWorld(d);
        this.m_pSounds.PlayAt(CHN_WORLD, ev.m_SoundID, 1, new vec2(ev.m_X, ev.m_Y));
      }
    }
  }

  ProcessTriggeredEvents(Events: number, Pos: vec2): void {
    if (this.m_SuppressEvents) return;
    if (Events & P.COREEVENTFLAG_GROUND_JUMP) this.m_pSounds.PlayAt(CHN_WORLD, P.SOUND_PLAYER_JUMP, 1, Pos);
    if (Events & P.COREEVENTFLAG_AIR_JUMP) this.m_pEffects.AirJump(Pos);
    if (Events & P.COREEVENTFLAG_HOOK_ATTACH_PLAYER) this.m_pSounds.PlayAt(CHN_WORLD, P.SOUND_HOOK_ATTACH_PLAYER, 1, Pos);
    if (Events & P.COREEVENTFLAG_HOOK_ATTACH_GROUND) this.m_pSounds.PlayAt(CHN_WORLD, P.SOUND_HOOK_ATTACH_GROUND, 1, Pos);
    if (Events & P.COREEVENTFLAG_HOOK_HIT_NOHOOK) this.m_pSounds.PlayAt(CHN_WORLD, P.SOUND_HOOK_NOATTACH, 1, Pos);
  }

  OnNewSnapshot(): void {
    this.m_Snap = new CSnapState();
    const S = this.m_Snap;
    const Cl = this.Client();
    const Item: CSnapItem = { m_Type: 0, m_ID: 0, m_DataSize: 0 };
    {
      const Num = Cl.SnapNumItems(SNAP_CURRENT);
      for (let Index = 0; Index < Num; Index++) {
        const d = Cl.SnapGetItem(SNAP_CURRENT, Index, Item);
        if (this.m_NetObjHandler.ValidateObj(Item.m_Type, d, Item.m_DataSize) !== 0) {
          if (this.Config().m_Debug)
            this.Console().Print(OUTPUT_LEVEL_DEBUG, 'game', str_format(256, 'invalidated index=%d type=%d (%s) size=%d id=%d', Index, Item.m_Type, this.m_NetObjHandler.GetObjName(Item.m_Type), Item.m_DataSize, Item.m_ID));
          Cl.SnapInvalidateItem(SNAP_CURRENT, Index);
        }
      }
    }
    this.ProcessEvents();
    const StandardTuning = new CTuningParams();
    {
      const Num = Cl.SnapNumItems(SNAP_CURRENT);
      for (let i = 0; i < Num; i++) {
        const d = Cl.SnapGetItem(SNAP_CURRENT, i, Item);
        if (Item.m_Type === P.NETOBJTYPE_PLAYERINFO) {
          const pInfo = P.read_CNetObj_PlayerInfo(d);
          const ClientID = Item.m_ID;
          if (ClientID < MAX_CLIENTS && this.m_aClients[ClientID].m_Active) {
            S.m_paPlayerInfos[ClientID] = pInfo;
            S.m_aInfoByScore[ClientID] = { m_pPlayerInfo: pInfo, m_ClientID: ClientID };
            if (this.m_LocalClientID === ClientID) {
              S.m_pLocalInfo = pInfo;
              if (this.m_aClients[ClientID].m_Team === P.TEAM_SPECTATORS) {
                S.m_SpecInfo.m_Active = true;
                S.m_SpecInfo.m_SpecMode = P.SPEC_FREEVIEW;
                S.m_SpecInfo.m_SpectatorID = -1;
              }
            }
            this.m_aClients[ClientID].UpdateBotRenderInfo(this, ClientID);
          }
        } else if (Item.m_Type === P.NETOBJTYPE_PLAYERINFORACE) {
          const ClientID = Item.m_ID;
          if (ClientID < MAX_CLIENTS && this.m_aClients[ClientID].m_Active) S.m_paPlayerInfosRace[ClientID] = P.read_CNetObj_PlayerInfoRace(d);
        } else if (Item.m_Type === P.NETOBJTYPE_CHARACTER) {
          if (Item.m_ID < MAX_CLIENTS) {
            const pOld = Cl.SnapFindItem(SNAP_PREV, P.NETOBJTYPE_CHARACTER, Item.m_ID);
            const c = S.m_aCharacters[Item.m_ID];
            c.m_Cur = P.read_CNetObj_Character(d);
            if (c.m_Cur.m_Weapon !== P.WEAPON_NINJA) c.m_Cur.m_AmmoCount = clamp(c.m_Cur.m_AmmoCount, 0, 10);
            if (pOld) {
              c.m_Active = true;
              c.m_Prev = P.read_CNetObj_Character(pOld);
              if (c.m_Prev.m_Tick) this.EvolveCharacter(c.m_Prev, Cl.PrevGameTick());
              if (c.m_Cur.m_Tick) this.EvolveCharacter(c.m_Cur, Cl.GameTick());
            }
            if (Item.m_ID !== this.m_LocalClientID || Cl.State() === STATE_DEMOPLAYBACK)
              this.ProcessTriggeredEvents(c.m_Cur.m_TriggeredEvents, new vec2(c.m_Cur.m_X, c.m_Cur.m_Y));
          }
        } else if (Item.m_Type === P.NETOBJTYPE_SPECTATORINFO) {
          S.m_pSpectatorInfo = P.read_CNetObj_SpectatorInfo(d);
          const prev = Cl.SnapFindItem(SNAP_PREV, P.NETOBJTYPE_SPECTATORINFO, Item.m_ID);
          S.m_pPrevSpectatorInfo = prev ? P.read_CNetObj_SpectatorInfo(prev) : null;
          S.m_SpecInfo.m_Active = true;
          S.m_SpecInfo.m_SpecMode = S.m_pSpectatorInfo.m_SpecMode;
          S.m_SpecInfo.m_SpectatorID = S.m_pSpectatorInfo.m_SpectatorID;
        } else if (Item.m_Type === P.NETOBJTYPE_GAMEDATA) {
          S.m_pGameData = P.read_CNetObj_GameData(d);
          const GameFlags = S.m_pGameData.m_GameStateFlags;
          const Last = this.s_LastGameFlags;
          if (S.m_pGameData.m_GameStartTick !== this.m_LastGameStartTick && !(Last & P.GAMESTATEFLAG_ROUNDOVER) && !(Last & P.GAMESTATEFLAG_PAUSED) &&
            (!(GameFlags & P.GAMESTATEFLAG_PAUSED) || GameFlags & P.GAMESTATEFLAG_STARTCOUNTDOWN))
            this.m_pStats.OnMatchStart();
          if (!(GameFlags & (P.GAMESTATEFLAG_PAUSED | P.GAMESTATEFLAG_ROUNDOVER | P.GAMESTATEFLAG_GAMEOVER))) this.m_pStats.UpdatePlayTime(Cl.GameTick() - Cl.PrevGameTick());
          this.s_LastGameFlags = GameFlags;
          this.m_LastGameStartTick = S.m_pGameData.m_GameStartTick;
        } else if (Item.m_Type === P.NETOBJTYPE_GAMEDATATEAM) {
          S.m_pGameDataTeam = P.read_CNetObj_GameDataTeam(d);
        } else if (Item.m_Type === P.NETOBJTYPE_GAMEDATAFLAG) {
          const g = (S.m_pGameDataFlag = P.read_CNetObj_GameDataFlag(d));
          S.m_GameDataFlagSnapID = Item.m_ID;
          if (this.m_LastFlagCarrierRed === P.FLAG_ATSTAND && g.m_FlagCarrierRed >= 0) this.m_pStats.OnFlagGrab(g.m_FlagCarrierRed);
          else if (this.m_LastFlagCarrierBlue === P.FLAG_ATSTAND && g.m_FlagCarrierBlue >= 0) this.m_pStats.OnFlagGrab(g.m_FlagCarrierBlue);
          this.m_LastFlagCarrierRed = g.m_FlagCarrierRed;
          this.m_LastFlagCarrierBlue = g.m_FlagCarrierBlue;
        } else if (Item.m_Type === P.NETOBJTYPE_GAMEDATARACE) {
          S.m_pGameDataRace = P.read_CNetObj_GameDataRace(d);
        } else if (Item.m_Type === P.NETOBJTYPE_FLAG) {
          S.m_paFlags[Item.m_ID % 2] = P.read_CNetObj_Flag(d);
        }
      }
    }
    if (this.m_LocalClientID >= 0) {
      const c = S.m_aCharacters[this.m_LocalClientID];
      if (c.m_Active) {
        if (!S.m_SpecInfo.m_Active) {
          S.m_pLocalCharacter = c.m_Cur;
          S.m_pLocalPrevCharacter = c.m_Prev;
          this.m_LocalCharacterPos = new vec2(c.m_Cur.m_X, c.m_Cur.m_Y);
        }
      } else if (Cl.SnapFindItem(SNAP_PREV, P.NETOBJTYPE_CHARACTER, this.m_LocalClientID)) this.m_pControls.OnPlayerDeath();
    } else {
      S.m_SpecInfo.m_Active = true;
      if (this.m_DemoSpecMode === P.SPEC_PLAYER) {
        S.m_SpecInfo.m_SpecMode = P.SPEC_FREEVIEW;
        S.m_SpecInfo.m_SpectatorID = -1;
      } else {
        S.m_SpecInfo.m_SpecMode = this.m_DemoSpecMode;
        S.m_SpecInfo.m_SpectatorID = this.m_DemoSpecID;
      }
    }
    const Compare = this.m_GameInfo.m_GameFlags & P.GAMEFLAG_RACE ? CompareTime : CompareScore;
    const a = S.m_aInfoByScore;
    for (let k = 0; k < MAX_CLIENTS - 1; k++) {
      for (let i = 0; i < MAX_CLIENTS - k - 1; i++) {
        if (a[i + 1].m_pPlayerInfo && (!a[i].m_pPlayerInfo || Compare(a[i].m_pPlayerInfo!, a[i + 1].m_pPlayerInfo!))) {
          const Tmp = a[i];
          a[i] = a[i + 1];
          a[i + 1] = Tmp;
        }
      }
    }
    for (let i = 0; i < MAX_CLIENTS; ++i) {
      const pi = S.m_paPlayerInfos[i];
      if (!pi) continue;
      if (S.m_pGameData && S.m_pGameData.m_GameStateFlags & (P.GAMESTATEFLAG_STARTCOUNTDOWN | P.GAMESTATEFLAG_PAUSED | P.GAMESTATEFLAG_WARMUP) &&
        S.m_pGameData.m_GameStateEndTick === 0 && this.m_aClients[i].m_Team !== P.TEAM_SPECTATORS && !(pi.m_PlayerFlags & P.PLAYERFLAG_READY))
        S.m_NotReadyCount++;
      if (this.m_GameInfo.m_GameFlags & P.GAMEFLAG_SURVIVAL && this.m_aClients[i].m_Team !== P.TEAM_SPECTATORS && !(pi.m_PlayerFlags & P.PLAYERFLAG_DEAD))
        S.m_AliveCount[this.m_aClients[i].m_Team]++;
    }
    const gt = Cl.GetServerInfo().m_aGameType;
    if (gt !== 'DM' && gt !== 'TDM' && gt !== 'CTF' && gt !== 'LMS' && gt !== 'LTS') this.m_ServerMode = SERVERMODE_MOD;
    else if (StandardTuning.equals(this.m_Tuning)) this.m_ServerMode = SERVERMODE_PURE;
    else this.m_ServerMode = SERVERMODE_PUREMOD;
  }

  OnPredict(): void {
    if (this.m_LocalClientID === -1 || !this.m_Snap.m_aCharacters[this.m_LocalClientID].m_Active) return;
    const S = this.m_Snap;
    if (S.m_pGameData && S.m_pGameData.m_GameStateFlags & (P.GAMESTATEFLAG_PAUSED | P.GAMESTATEFLAG_ROUNDOVER | P.GAMESTATEFLAG_GAMEOVER)) {
      if (S.m_pLocalCharacter) this.m_PredictedChar.Read(S.m_pLocalCharacter);
      if (S.m_pLocalPrevCharacter) this.m_PredictedPrevChar.Read(S.m_pLocalPrevCharacter);
      return;
    }
    const World = new CWorldCore();
    World.m_Tuning = this.m_Tuning;
    for (let i = 0; i < MAX_CLIENTS; i++) {
      if (!S.m_aCharacters[i].m_Active) continue;
      this.m_aClients[i].m_Predicted.Init(World, this.Collision());
      World.m_apCharacters[i] = this.m_aClients[i].m_Predicted;
      this.m_aClients[i].m_Predicted.Read(S.m_aCharacters[i].m_Cur);
    }
    const Cl = this.Client();
    for (let Tick = Cl.GameTick() + 1; Tick <= Cl.PredGameTick(); Tick++) {
      if (Tick === Cl.PredGameTick() && World.m_apCharacters[this.m_LocalClientID]) this.m_PredictedPrevChar = World.m_apCharacters[this.m_LocalClientID]!.clone();
      for (let c = 0; c < MAX_CLIENTS; c++) {
        const ch = World.m_apCharacters[c];
        if (!ch) continue;
        ch.m_Input = { m_Direction: 0, m_TargetX: 0, m_TargetY: 0, m_Jump: 0, m_Fire: 0, m_Hook: 0, m_PlayerFlags: 0, m_WantedWeapon: 0, m_NextWeapon: 0, m_PrevWeapon: 0 };
        if (this.m_LocalClientID === c) {
          const pInput = Cl.GetInput(Tick);
          if (pInput) ch.m_Input = P.read_CNetObj_PlayerInput(pInput);
          ch.Tick(true);
        } else ch.Tick(false);
      }
      for (let c = 0; c < MAX_CLIENTS; c++) {
        const ch = World.m_apCharacters[c];
        if (!ch) continue;
        ch.Move();
        ch.Quantize();
      }
      if (Tick > this.m_LastNewPredictedTick) {
        this.m_LastNewPredictedTick = Tick;
        const lc = World.m_apCharacters[this.m_LocalClientID];
        if (this.m_LocalClientID !== -1 && lc) this.ProcessTriggeredEvents(lc.m_TriggeredEvents, lc.m_Pos);
      }
      if (Tick === Cl.PredGameTick() && World.m_apCharacters[this.m_LocalClientID]) this.m_PredictedChar = World.m_apCharacters[this.m_LocalClientID]!.clone();
    }
    this.m_PredictedTick = Cl.PredGameTick();
  }

  DoEnterMessage(pName: string, ClientID: number, Team: number): void {
    const aLabel = this.GetPlayerLabel(ClientID, pName);
    let aBuf = '';
    switch (GetStrTeam(Team, (this.m_GameInfo.m_GameFlags & P.GAMEFLAG_TEAMS) !== 0)) {
      case STR_TEAM_GAME: aBuf = str_format(128, Localize("'%s' entered and joined the game"), aLabel); break;
      case STR_TEAM_RED: aBuf = str_format(128, Localize("'%s' entered and joined the red team"), aLabel); break;
      case STR_TEAM_BLUE: aBuf = str_format(128, Localize("'%s' entered and joined the blue team"), aLabel); break;
      case STR_TEAM_SPECTATORS: aBuf = str_format(128, Localize("'%s' entered and joined the spectators"), aLabel); break;
    }
    this.m_pChat.AddLine(aBuf);
  }

  DoLeaveMessage(pName: string, ClientID: number, pReason: string): void {
    const aLabel = this.GetPlayerLabel(ClientID, pName);
    this.m_pChat.AddLine(pReason ? str_format(128, Localize("'%s' has left the game (%s)"), aLabel, pReason) : str_format(128, Localize("'%s' has left the game"), aLabel));
  }

  DoTeamChangeMessage(pName: string, ClientID: number, Team: number): void {
    const aLabel = this.GetPlayerLabel(ClientID, pName);
    let aBuf = '';
    switch (GetStrTeam(Team, (this.m_GameInfo.m_GameFlags & P.GAMEFLAG_TEAMS) !== 0)) {
      case STR_TEAM_GAME: aBuf = str_format(128, Localize("'%s' joined the game"), aLabel); break;
      case STR_TEAM_RED: aBuf = str_format(128, Localize("'%s' joined the red team"), aLabel); break;
      case STR_TEAM_BLUE: aBuf = str_format(128, Localize("'%s' joined the blue team"), aLabel); break;
      case STR_TEAM_SPECTATORS: aBuf = str_format(128, Localize("'%s' joined the spectators"), aLabel); break;
    }
    this.m_pChat.AddLine(aBuf);
  }

  SendSwitchTeam(Team: number): void { this.SendMsg(P.NETMSGTYPE_CL_SETTEAM, P.pack_CNetMsg_Cl_SetTeam, { m_Team: Team }, MSGFLAG_VITAL); }

  private skinMsg(): { m_apSkinPartNames: string[]; m_aUseCustomColors: number[]; m_aSkinPartColors: number[] } {
    const names: string[] = [], ucc: number[] = [], col: number[] = [];
    for (let p = 0; p < P.NUM_SKINPARTS; p++) {
      names.push(this.m_pSkins.SkinVariable(p));
      ucc.push(this.m_pSkins.UCCVariable(p));
      col.push(this.m_pSkins.ColorVariable(p));
    }
    return { m_apSkinPartNames: names, m_aUseCustomColors: ucc, m_aSkinPartColors: col };
  }

  SendStartInfo(): void {
    const c = this.Config();
    this.SendMsg(P.NETMSGTYPE_CL_STARTINFO, P.pack_CNetMsg_Cl_StartInfo, { m_pName: c.m_PlayerName, m_pClan: c.m_PlayerClan, m_Country: c.m_PlayerCountry, ...this.skinMsg() },
      MSGFLAG_VITAL | MSGFLAG_FLUSH);
  }
  SendKill(): void { this.SendMsg(P.NETMSGTYPE_CL_KILL, P.pack_CNetMsg_Cl_Kill, {}, MSGFLAG_VITAL); }
  SendReadyChange(): void { this.SendMsg(P.NETMSGTYPE_CL_READYCHANGE, P.pack_CNetMsg_Cl_ReadyChange, {}, MSGFLAG_VITAL); }
  SendSkinChange(): void {
    this.SendMsg(P.NETMSGTYPE_CL_SKINCHANGE, P.pack_CNetMsg_Cl_SkinChange, this.skinMsg(), MSGFLAG_VITAL | MSGFLAG_NORECORD | MSGFLAG_FLUSH);
    this.m_LastSkinChangeTime = this.Client().LocalTime();
  }

  GetClientID(pName: string): number {
    for (let i = 0; i < MAX_CLIENTS; i++) {
      if (!this.m_aClients[i].m_Active || i === this.m_LocalClientID) continue;
      if (!str_comp(this.m_aClients[i].m_aName, pName)) return i;
    }
    return -1;
  }

  private ConTeam(r: CResult): void {
    if (this.Client().State() !== STATE_ONLINE || this.m_LocalClientID === -1) return;
    const Info = this.m_pMenus.GetSwitchTeamInfo();
    const Team = r.GetInteger(0);
    if (this.m_aClients[this.m_LocalClientID].m_Team === Team || (Team === P.TEAM_SPECTATORS && !Info.m_AllowSpec) || (Team !== P.TEAM_SPECTATORS && Info.m_aNotification)) {
      if (Info.m_aNotification) this.Console().Print(OUTPUT_LEVEL_STANDARD, 'gameclient', Info.m_aNotification);
      return;
    }
    this.SendSwitchTeam(Team);
  }
}

const P_MAX_NAME_LENGTH = 16, P_MAX_CLAN_LENGTH = 12;

function vmix(a: vec2, b: vec2, amount: number): vec2 { return new vec2(mix(a.x, b.x, amount), mix(a.y, b.y, amount)); }

/** time_iseasterday (base/system.c): Easter Sunday by the anonymous Gregorian algorithm, the day before to the day after */
function time_iseasterday(now: Date): boolean {
  const Y = now.getFullYear();
  const a = Y % 19, b = Math.trunc(Y / 100), c = Y % 100, d = Math.trunc(b / 4), e = b % 4, ff = Math.trunc((b + 8) / 25), g = Math.trunc((b - ff + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30, i = Math.trunc(c / 4), k = c % 4, L = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.trunc((a + 11 * h + 22 * L) / 451);
  const Month = Math.trunc((h + L - 7 * m + 114) / 31), Day = ((h + L - 7 * m + 114) % 31) + 1;
  const easter = new Date(Y, Month - 1, Day);
  for (let off = -1; off <= 1; off++) {
    const t = new Date(easter);
    t.setDate(t.getDate() + off);
    if (t.getMonth() === now.getMonth() && t.getDate() === now.getDate()) return true;
  }
  return false;
}
