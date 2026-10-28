// (c) Magnus Auvinen. See licence.txt in the root of the distribution for more information.
// If you are missing that file, acquire a complete release at teeworlds.com.
// Altered: game/client/components/hud.h and hud.cpp of Teeworlds 0.7.5 in TypeScript.
import { vec2, clamp, f, v4, str_format, round_to_int, Localize, ImageTex } from './common.ts';
import * as C from '../../../generated/content.ts';
import * as P from '../../../generated/protocol.ts';
import { MAX_CLIENTS, SERVER_TICK_SPEED } from '../../../engine/shared/protocol.ts';
import { TIME_FREQ } from '../../../engine/shared/network.ts';
import { CQuadItem } from '../../engine/graphics.ts';
import { STATE_DEMOPLAYBACK } from '../../engine/client.ts';
import { CTextCursor, TEXTFLAG_RENDER, TEXTFLAG_STOP_AT_END } from '../../engine/text.ts';
import { CUIRect, CORNER_L, CORNER_TL, ALIGN_LEFT, ALIGN_RIGHT } from '../ui.ts';
import { CAnimState } from '../render.ts';
import { CComponent } from '../component.ts';
import { FormatTime, FormatTimeDiff, type CNetMsg, type CPlayerInfoItem } from '../gameclient.ts';

const idiv = (a: number, b: number): number => Math.trunc(a / b);

export class CHud extends CComponent {
  private m_Width = 0;
  private m_Height = 0;
  private m_AverageFPS = 1;
  private m_WarmupHideTick = 0;
  private m_CheckpointDiff = 0;
  private m_CheckpointTime = 0;

  override OnReset(): void {
    this.m_WarmupHideTick = 0;
    this.m_CheckpointTime = 0;
  }

  private now(): number { return this.Client().time_get(); }
  private gd(): P.CNetObj_GameData { return this.m_pClient.m_Snap.m_pGameData!; }
  private text(x: number, y: number, size: number, s: string): void { this.TextRender().Text(0, x, y, size, s, -1); }
  private width(size: number, s: string): number { return this.TextRender().TextWidth(0, size, s, -1, -1); }
  private centered(y: number, size: number, s: string): void { this.text(150 * this.Graphics().ScreenAspect() - this.width(size, s) / 2, y, size, s); }

  IsLargeWarmupTimerShown(): boolean {
    const gc = this.m_pClient;
    return !gc.m_pMotd.IsActive() && !gc.m_pScoreboard.IsActive() && !gc.m_pStats.IsActive() &&
      (this.m_WarmupHideTick === 0 || idiv(this.now() - this.m_WarmupHideTick, TIME_FREQ) < 10);
  }

  private RenderGameTimer(): void {
    const Half = (300 * this.Graphics().ScreenAspect()) / 2;
    const gd = this.gd(), gi = this.m_pClient.m_GameInfo, Cl = this.Client();
    if (gd.m_GameStateFlags & P.GAMESTATEFLAG_SUDDENDEATH) return;
    let Time = 0;
    if (gi.m_TimeLimit && !(gd.m_GameStateFlags & P.GAMESTATEFLAG_WARMUP)) {
      Time = gi.m_TimeLimit * 60 - idiv(Cl.GameTick() - gd.m_GameStartTick, Cl.GameTickSpeed());
      if (gd.m_GameStateFlags & (P.GAMESTATEFLAG_ROUNDOVER | P.GAMESTATEFLAG_GAMEOVER)) Time = 0;
    } else if (gd.m_GameStateFlags & (P.GAMESTATEFLAG_ROUNDOVER | P.GAMESTATEFLAG_GAMEOVER)) Time = idiv(gd.m_GameStateEndTick, Cl.GameTickSpeed());
    else Time = idiv(Cl.GameTick() - gd.m_GameStartTick, Cl.GameTickSpeed());
    const aBuf = str_format(32, '%d:%02d', idiv(Time, 60), Time % 60);
    const FontSize = 10;
    const w = this.width(FontSize, aBuf);
    if (gi.m_TimeLimit && Time <= 60 && !(gd.m_GameStateFlags & P.GAMESTATEFLAG_WARMUP)) {
      const Alpha = Time <= 10 && idiv(2 * this.now(), TIME_FREQ) % 2 ? 0.5 : 1;
      this.TextRender().TextColor(1, 0.25, 0.25, Alpha);
    }
    this.text(Half - w / 2, 2, FontSize, aBuf);
    this.TextRender().TextColor(1, 1, 1, 1);
  }

  private RenderPauseTimer(): void {
    const gd = this.gd();
    if ((gd.m_GameStateFlags & (P.GAMESTATEFLAG_STARTCOUNTDOWN | P.GAMESTATEFLAG_PAUSED)) !== P.GAMESTATEFLAG_PAUSED) return;
    this.centered(50, 20, Localize('Game paused'));
    let aBuf: string;
    if (gd.m_GameStateEndTick === 0) {
      const n = this.m_pClient.m_Snap.m_NotReadyCount;
      if (n === 1) aBuf = str_format(256, Localize('%d player not ready'), n);
      else if (n > 1) aBuf = str_format(256, Localize('%d players not ready'), n);
      else return;
      this.RenderReadyUpNotification();
    } else {
      const Seconds = f((gd.m_GameStateEndTick - this.Client().GameTick()) / SERVER_TICK_SPEED);
      aBuf = Seconds < 5 ? str_format(256, '%.1f', Seconds) : str_format(256, '%d', round_to_int(Seconds));
    }
    this.centered(75, 16, aBuf);
  }

  private RenderStartCountdown(): void {
    const gd = this.gd();
    if (!(gd.m_GameStateFlags & P.GAMESTATEFLAG_STARTCOUNTDOWN)) return;
    this.centered(50, 20, Localize('Game starts in'));
    if (gd.m_GameStateEndTick === 0) return;
    const Seconds = idiv(gd.m_GameStateEndTick - this.Client().GameTick() + SERVER_TICK_SPEED - 1, SERVER_TICK_SPEED);
    this.centered(75, 16, str_format(32, '%d', Seconds));
  }

  private RenderDeadNotification(): void {
    const gc = this.m_pClient, S = gc.m_Snap;
    if (S.m_pGameData!.m_GameStateFlags === 0 && gc.m_LocalClientID >= 0 && gc.m_aClients[gc.m_LocalClientID].m_Team !== P.TEAM_SPECTATORS &&
      S.m_pLocalInfo && S.m_pLocalInfo.m_PlayerFlags & P.PLAYERFLAG_DEAD)
      this.centered(50, 16, Localize('Wait for next round'));
  }

  private RenderSuddenDeath(): void {
    if (!(this.gd().m_GameStateFlags & P.GAMESTATEFLAG_SUDDENDEATH)) return;
    const Half = (300 * this.Graphics().ScreenAspect()) / 2;
    const t = Localize('Sudden Death');
    this.text(Half - this.width(12, t) / 2, 2, 12, t);
  }

  private RenderScoreHud(): void {
    const gc = this.m_pClient, S = gc.m_Snap, G = this.Graphics(), RT = this.RenderTools(), T = this.TextRender(), cfg = this.Config();
    if (S.m_pGameData!.m_GameStateFlags & (P.GAMESTATEFLAG_ROUNDOVER | P.GAMESTATEFLAG_GAMEOVER)) return;
    const GameFlags = gc.m_GameInfo.m_GameFlags;
    const Whole = 300 * G.ScreenAspect();
    let StartY = 229;
    const TeamOffset = 20;
    const drawName = (ID: number, x: number, y: number): void => {
      const aName = cfg.m_ClShowsocial ? gc.m_aClients[ID].m_aName : '';
      const Cursor = new CTextCursor();
      T.SetCursor(Cursor, x, y, 8, TEXTFLAG_RENDER);
      RT.DrawClientID(T, Cursor, ID);
      T.TextEx(Cursor, aName, -1);
    };
    const nameWidth = (ID: number): number => this.width(8, cfg.m_ClShowsocial ? gc.m_aClients[ID].m_aName : '') + RT.GetClientIdRectSize(8);
    const drawTee = (ID: number, x: number, y: number): void => {
      const Info = gc.m_aClients[ID].m_RenderInfo.copy();
      Info.m_Size = 18;
      RT.RenderTee(CAnimState.GetIdle(), Info, P.EMOTE_NORMAL, new vec2(1, 0), new vec2(x, y));
    };
    if (GameFlags & P.GAMEFLAG_TEAMS && S.m_pGameDataTeam && !(GameFlags & P.GAMEFLAG_RACE)) {
      const aScoreTeam = [str_format(32, '%d', S.m_pGameDataTeam.m_TeamscoreRed), str_format(32, '%d', S.m_pGameDataTeam.m_TeamscoreBlue)];
      const aScoreTeamWidth = [this.width(14, aScoreTeam[0]), this.width(14, aScoreTeam[1])];
      const ScoreWidthMax = Math.max(Math.max(aScoreTeamWidth[0], aScoreTeamWidth[1]), this.width(14, '100'));
      const Split = 3;
      const ImageSize = GameFlags & P.GAMEFLAG_FLAGS ? 16 : Split;
      for (let t = 0; t < P.NUM_TEAMS; t++) {
        const Rect = new CUIRect(Whole - ScoreWidthMax - ImageSize - 2 * Split, StartY + t * TeamOffset, ScoreWidthMax + ImageSize + 2 * Split, 18);
        G.BlendNormal();
        RT.DrawUIRect(Rect, t === 0 ? v4(1, 0, 0, 0.25) : v4(0, 0, 1, 0.25), CORNER_L, 5);
        this.text(Whole - ScoreWidthMax + (ScoreWidthMax - aScoreTeamWidth[t]) / 2 - Split, StartY + t * TeamOffset, 14, aScoreTeam[t]);
        if (GameFlags & P.GAMEFLAG_SURVIVAL) {
          const aBuf = str_format(32, S.m_AliveCount[t] === 1 ? Localize('%d player left') : Localize('%d players left'), S.m_AliveCount[t]);
          const w = this.width(8, aBuf);
          this.text(Math.min(Whole - w - 1, Whole - ScoreWidthMax - ImageSize - 2 * Split), StartY + (t + 1) * TeamOffset - 3, 8, aBuf);
        }
        StartY += 8;
      }
      if (GameFlags & P.GAMEFLAG_FLAGS && S.m_pGameDataFlag) {
        const FlagCarrier = [S.m_pGameDataFlag.m_FlagCarrierRed, S.m_pGameDataFlag.m_FlagCarrierBlue];
        const FlagDropTick = [S.m_pGameDataFlag.m_FlagDropTickRed, S.m_pGameDataFlag.m_FlagDropTickBlue];
        StartY = 229;
        for (let t = 0; t < 2; t++) {
          const BlinkTimer = FlagDropTick[t] !== 0 && idiv(this.Client().GameTick() - FlagDropTick[t], this.Client().GameTickSpeed()) >= 25 ? 10 : 20;
          if (FlagCarrier[t] === P.FLAG_ATSTAND || (FlagCarrier[t] === P.FLAG_TAKEN && idiv(this.Client().GameTick(), BlinkTimer) & 1)) {
            G.BlendNormal();
            G.TextureSet(ImageTex(C.IMAGE_GAME));
            G.QuadsBegin();
            RT.SelectSprite(t === 0 ? C.SPRITE_FLAG_RED : C.SPRITE_FLAG_BLUE);
            G.QuadsDrawTL([new CQuadItem(Whole - ScoreWidthMax - ImageSize, StartY + 1 + t * TeamOffset, ImageSize / 2, ImageSize)], 1);
            G.QuadsEnd();
          } else if (FlagCarrier[t] >= 0) {
            const ID = FlagCarrier[t] % MAX_CLIENTS;
            drawName(ID, Math.min(Whole - nameWidth(ID) - 1, Whole - ScoreWidthMax - ImageSize - 2 * Split), StartY + (t + 1) * TeamOffset - 3);
            drawTee(ID, Whole - ScoreWidthMax - 18 / 2 - Split, StartY + 1 + 18 / 2 + t * TeamOffset);
          }
          StartY += 8;
        }
      }
    } else {
      let Local = -1;
      const aPos = [1, 2];
      const aPlayerInfo: CPlayerInfoItem[] = [{ m_pPlayerInfo: null, m_ClientID: 0 }, { m_pPlayerInfo: null, m_ClientID: 0 }];
      let i = 0;
      const IBS = S.m_aInfoByScore;
      for (let t = 0; t < 2 && i < MAX_CLIENTS && IBS[i].m_pPlayerInfo; ++i) {
        if (gc.m_aClients[IBS[i].m_ClientID].m_Team !== P.TEAM_SPECTATORS) {
          aPlayerInfo[t] = IBS[i];
          if (aPlayerInfo[t].m_ClientID === gc.m_LocalClientID) Local = t;
          ++t;
        }
      }
      if (Local === -1 && gc.m_LocalClientID >= 0 && gc.m_aClients[gc.m_LocalClientID].m_Team !== P.TEAM_SPECTATORS) {
        for (; i < MAX_CLIENTS && IBS[i].m_pPlayerInfo; ++i) {
          if (gc.m_aClients[IBS[i].m_ClientID].m_Team !== P.TEAM_SPECTATORS) ++aPos[1];
          if (IBS[i].m_ClientID === gc.m_LocalClientID) {
            aPlayerInfo[1] = IBS[i];
            Local = 1;
            break;
          }
        }
      }
      const aScore = aPlayerInfo.map((pi) => (pi.m_pPlayerInfo ? (GameFlags & P.GAMEFLAG_RACE ? FormatTime(pi.m_pPlayerInfo.m_Score, gc.RacePrecision()) : str_format(32, '%d', pi.m_pPlayerInfo.m_Score)) : ''));
      const FontSize = GameFlags & P.GAMEFLAG_RACE ? 10 : 14;
      const aScoreWidth = [this.width(FontSize, aScore[0]), this.width(FontSize, aScore[1])];
      const ScoreWidthMax = Math.max(Math.max(aScoreWidth[0], aScoreWidth[1]), this.width(FontSize, '10'));
      const Split = 3, ImageSize = 16, PosSize = 16;
      if (GameFlags & P.GAMEFLAG_SURVIVAL) {
        const aBuf = str_format(32, S.m_AliveCount[0] === 1 ? Localize('%d player left') : Localize('%d players left'), S.m_AliveCount[0]);
        const w = this.width(8, aBuf);
        this.text(Math.min(Whole - w - 1, Whole - ScoreWidthMax - ImageSize - 2 * Split), StartY - 12, 8, aBuf);
      }
      for (let t = 0; t < 2; t++) {
        const Rect = new CUIRect(Whole - ScoreWidthMax - ImageSize - 2 * Split - PosSize, StartY + t * TeamOffset, ScoreWidthMax + ImageSize + 2 * Split + PosSize, 18);
        G.BlendNormal();
        RT.DrawUIRect(Rect, t === Local ? v4(1, 1, 1, 0.25) : v4(0, 0, 0, 0.25), CORNER_L, 5);
        const Spacing = GameFlags & P.GAMEFLAG_RACE ? 2 : 0;
        this.text(Whole - ScoreWidthMax + (ScoreWidthMax - aScoreWidth[t]) / 2 - Split, StartY + t * TeamOffset + Spacing, FontSize, aScore[t]);
        if (aPlayerInfo[t].m_pPlayerInfo) {
          const ID = aPlayerInfo[t].m_ClientID;
          drawName(ID, Math.min(Whole - nameWidth(ID) - 1, Whole - ScoreWidthMax - ImageSize - 2 * Split - PosSize), StartY + (t + 1) * TeamOffset - 3);
          drawTee(ID, Whole - ScoreWidthMax - 18 / 2 - Split, StartY + 1 + 18 / 2 + t * TeamOffset);
        }
        this.text(Whole - ScoreWidthMax - ImageSize - Split - PosSize, StartY + 2 + t * TeamOffset, 10, str_format(32, '%d.', aPos[t]));
        StartY += 8;
      }
    }
  }

  private RenderWarmupTimer(): void {
    const gd = this.gd(), S = this.m_pClient.m_Snap, T = this.TextRender();
    if (gd.m_GameStateFlags & P.GAMESTATEFLAG_WARMUP) {
      const pText = Localize('Warmup');
      const LargeTimer = this.IsLargeWarmupTimerShown();
      const FontSizeTitle = LargeTimer ? 20 : 8, FontSizeMessage = LargeTimer ? 16 : 6;
      if (LargeTimer) this.centered(50, FontSizeTitle, pText);
      else {
        T.TextColor(1, 1, 0.5, 1);
        this.text(10, 45, FontSizeTitle, pText);
      }
      let aBuf: string;
      if (gd.m_GameStateEndTick === 0) {
        if (S.m_NotReadyCount === 1) {
          aBuf = str_format(256, Localize('%d player not ready'), S.m_NotReadyCount);
          this.RenderReadyUpNotification();
        } else if (S.m_NotReadyCount > 1) {
          aBuf = str_format(256, Localize('%d players not ready'), S.m_NotReadyCount);
          this.RenderReadyUpNotification();
        } else {
          aBuf = Localize('wait for more players');
          if (this.m_WarmupHideTick === 0) this.m_WarmupHideTick = this.now();
        }
      } else {
        const Seconds = f((gd.m_GameStateEndTick - this.Client().GameTick()) / SERVER_TICK_SPEED);
        aBuf = Seconds < 5 ? str_format(256, '%.1f', Seconds) : str_format(256, '%d', round_to_int(Seconds));
      }
      if (LargeTimer) this.centered(75, FontSizeMessage, aBuf);
      else {
        this.text(10, 54, FontSizeMessage, aBuf);
        T.TextColor(1, 1, 1, 1);
      }
    } else if ((gd.m_GameStateEndTick === 0 && S.m_NotReadyCount > 0) || gd.m_GameStateEndTick !== 0) this.m_WarmupHideTick = 0;
  }

  private RenderFps(): void {
    if (!this.Config().m_ClShowfps) return;
    const FPS = 1 / this.Client().RenderFrameTime();
    this.m_AverageFPS = this.m_AverageFPS * (1 - 1 / this.m_AverageFPS) + FPS * (1 / this.m_AverageFPS);
    const aBuf = str_format(32, '%d', Math.trunc(this.m_AverageFPS));
    this.text(this.m_Width - 10 - this.width(12, aBuf), 5, 12, aBuf);
  }

  private RenderConnectionWarning(): void {
    if (this.Client().ConnectionProblems()) this.centered(50, 24, Localize('Connection Problems...'));
  }

  private RenderTeambalanceWarning(): void {
    const gc = this.m_pClient;
    if (gc.m_GameInfo.m_GameFlags & P.GAMEFLAG_TEAMS && this.Config().m_ClWarningTeambalance && gc.m_ServerSettings.m_TeamBalance &&
      Math.abs(gc.m_GameInfo.m_aTeamSize[P.TEAM_RED] - gc.m_GameInfo.m_aTeamSize[P.TEAM_BLUE]) >= P.NUM_TEAMS) {
      const Flash = idiv(this.now(), TIME_FREQ / 2) % 2 === 0;
      if (Flash) this.TextRender().TextColor(1, 1, 0.5, 1);
      else this.TextRender().TextColor(0.7, 0.7, 0.2, 1);
      this.text(5, 50, 6, Localize('Please balance teams!'));
      this.TextRender().TextColor(1, 1, 1, 1);
    }
  }

  private RenderVoting(): void {
    const V = this.m_pClient.m_pVoting, T = this.TextRender();
    if (!V.IsVoting()) return;
    this.RenderTools().DrawRoundRect(new CUIRect(-10, 58, 119, 46), v4(0, 0, 0, 0.4), 5);
    T.TextColor(1, 1, 1, 1);
    const Cursor = new CTextCursor();
    let aBuf = str_format(512, Localize('%ds left'), V.SecondsLeft());
    const tw = T.TextWidth(0, 6, aBuf, -1, -1);
    T.SetCursor(Cursor, 5 + 100 - tw, 60, 6, TEXTFLAG_RENDER);
    T.TextEx(Cursor, aBuf, -1);
    T.SetCursor(Cursor, 5, 60, 6, TEXTFLAG_RENDER);
    Cursor.m_LineWidth = 100 - tw;
    Cursor.m_MaxLines = 3;
    T.TextEx(Cursor, V.VoteDescription(), -1);
    aBuf = str_format(512, '%s %s', Localize('Reason:'), V.VoteReason());
    T.SetCursor(Cursor, 5, 79, 6, TEXTFLAG_RENDER | TEXTFLAG_STOP_AT_END);
    Cursor.m_LineWidth = 100;
    T.TextEx(Cursor, aBuf, -1);
    const Base = new CUIRect(5, 88, 100, 4);
    V.RenderBars(Base, false);
    const aBufYes = this.m_pClient.m_pBinds.GetKey('vote yes'), aBufNo = this.m_pClient.m_pBinds.GetKey('vote no');
    Base.y += Base.h + 1;
    this.UI().DoLabel(Base, str_format(512, '%s - %s', aBufYes, Localize('Vote yes')), 6, ALIGN_LEFT);
    this.UI().DoLabel(Base, str_format(512, '%s - %s', Localize('Vote no'), aBufNo), 6, ALIGN_RIGHT);
  }

  private RenderCursor(): void {
    const gc = this.m_pClient, G = this.Graphics(), RT = this.RenderTools();
    if (!gc.m_Snap.m_pLocalCharacter) return;
    const Pos = gc.m_pCamera.GetCenter();
    RT.MapScreenToGroup(Pos.x, Pos.y, this.Layers().Map().items, this.Layers().m_pGameGroup, gc.m_pCamera.GetZoom());
    G.TextureSet(ImageTex(C.IMAGE_GAME));
    G.QuadsBegin();
    RT.SelectSprite(C.g_pData.m_Weapons.m_aId[gc.m_Snap.m_pLocalCharacter.m_Weapon % P.NUM_WEAPONS].m_pSpriteCursor);
    RT.DrawSprite(gc.m_pControls.m_TargetPos.x, gc.m_pControls.m_TargetPos.y, 64);
    G.QuadsEnd();
  }

  private RenderNinjaBar(x: number, y: number, Progress: number): void {
    const G = this.Graphics(), RT = this.RenderTools();
    Progress = clamp(Progress, 0, 1);
    const EndWidth = 6, BarHeight = 12, WholeBarWidth = 120, MiddleBarWidth = WholeBarWidth - EndWidth * 2;
    RT.SelectSprite(C.g_pData.m_aSprites[C.SPRITE_NINJA_BAR_FULL_LEFT]);
    G.QuadsDrawTL([new CQuadItem(x, y, EndWidth, BarHeight)], 1);
    x += EndWidth;
    const FullBarWidth = MiddleBarWidth * Progress, EmptyBarWidth = MiddleBarWidth - FullBarWidth;
    const SpriteBarFull = C.g_pData.m_aSprites[C.SPRITE_NINJA_BAR_FULL];
    const sub = (spx: number, spy: number, w: number, h: number, cx: number, cy: number): void =>
      G.QuadsSetSubset(spx / cx, spy / cy, (spx + w - 1 / 32) / cx, (spy + h - 1 / 32) / cy);
    if (Progress < 0.1) sub(SpriteBarFull.m_X, SpriteBarFull.m_Y, SpriteBarFull.m_W * 0.1, SpriteBarFull.m_H, SpriteBarFull.m_pSet.m_Gridx, SpriteBarFull.m_pSet.m_Gridy);
    else RT.SelectSprite(SpriteBarFull);
    G.QuadsDrawTL([new CQuadItem(x, y, FullBarWidth, BarHeight)], 1);
    const E = C.g_pData.m_aSprites[C.SPRITE_NINJA_BAR_EMPTY];
    sub(E.m_X + 0.1, E.m_Y, E.m_W * 0.5, E.m_H, E.m_pSet.m_Gridx, E.m_pSet.m_Gridy);
    G.QuadsDrawTL([new CQuadItem(x + FullBarWidth, y, EmptyBarWidth, BarHeight)], 1);
    x += MiddleBarWidth;
    RT.SelectSprite(C.g_pData.m_aSprites[C.SPRITE_NINJA_BAR_EMPTY_RIGHT]);
    G.QuadsDrawTL([new CQuadItem(x, y, EndWidth, BarHeight)], 1);
  }

  private RenderHealthAndAmmo(pCharacter: P.CNetObj_Character | null): void {
    if (!pCharacter) return;
    const G = this.Graphics(), RT = this.RenderTools();
    const x = 5, y = 5;
    G.TextureSet(ImageTex(C.IMAGE_GAME));
    G.WrapClamp();
    G.QuadsBegin();
    G.SetColor(1, 1, 1, 1);
    if (pCharacter.m_Weapon === P.WEAPON_NINJA) {
      const Max = idiv(C.g_pData.m_Weapons.m_Ninja.m_Duration * this.Client().GameTickSpeed(), 1000);
      this.RenderNinjaBar(x, y + 24, clamp(pCharacter.m_AmmoCount - this.Client().GameTick(), 0, Max) / Max);
    } else {
      RT.SelectSprite(C.g_pData.m_Weapons.m_aId[pCharacter.m_Weapon % P.NUM_WEAPONS].m_pSpriteProj);
      const A: CQuadItem[] = [];
      for (let i = 0; i < Math.min(pCharacter.m_AmmoCount, 10); i++)
        A.push(pCharacter.m_Weapon === P.WEAPON_GRENADE ? new CQuadItem(x + 1 + i * 12, y + 24, 10, 10) : new CQuadItem(x + i * 12, y + 24, 12, 12));
      G.QuadsDrawTL(A, A.length);
    }
    const row = (full: number, empty: number, n: number, yy: number): void => {
      let h = 0;
      const A: CQuadItem[] = [];
      RT.SelectSprite(full);
      for (; h < Math.min(n, 10); h++) A.push(new CQuadItem(x + h * 12, yy, 12, 12));
      G.QuadsDrawTL(A, A.length);
      const B: CQuadItem[] = [];
      RT.SelectSprite(empty);
      for (; h < 10; h++) B.push(new CQuadItem(x + h * 12, yy, 12, 12));
      G.QuadsDrawTL(B, B.length);
    };
    row(C.SPRITE_HEALTH_FULL, C.SPRITE_HEALTH_EMPTY, pCharacter.m_Health, y);
    row(C.SPRITE_ARMOR_FULL, C.SPRITE_ARMOR_EMPTY, pCharacter.m_Armor, y + 12);
    G.QuadsEnd();
    G.WrapNormal();
  }

  private RenderSpectatorHud(): void {
    const gc = this.m_pClient, T = this.TextRender();
    const Width = this.m_Width * 0.25 - 2;
    this.RenderTools().DrawUIRect(new CUIRect(this.m_Width - Width, this.m_Height - 15, Width, 15), v4(0, 0, 0, 0.4), CORNER_TL, 5);
    const SpecID = gc.m_Snap.m_SpecInfo.m_SpectatorID, SpecMode = gc.m_Snap.m_SpecInfo.m_SpecMode;
    const aName = this.Config().m_ClShowsocial && SpecID >= 0 ? gc.m_aClients[SpecID].m_aName : '';
    const Cursor = new CTextCursor();
    T.SetCursor(Cursor, this.m_Width - Width + 6, this.m_Height - 13, 8, TEXTFLAG_RENDER);
    T.TextEx(Cursor, str_format(128, '%s: ', Localize('Spectate')), -1);
    let aBuf = '';
    switch (SpecMode) {
      case P.SPEC_FREEVIEW: aBuf = Localize('Free-View'); break;
      case P.SPEC_PLAYER: aBuf = aName; break;
      case P.SPEC_FLAGRED:
      case P.SPEC_FLAGBLUE: {
        const aFlag = SpecMode === P.SPEC_FLAGRED ? Localize('red flag') : Localize('blue flag');
        aBuf = SpecID !== -1 ? str_format(128, '%s (%s)', aFlag, aName) : aFlag;
        break;
      }
    }
    if (SpecMode === P.SPEC_PLAYER || SpecID !== -1) this.RenderTools().DrawClientID(T, Cursor, SpecID);
    T.TextEx(Cursor, aBuf, -1);
  }

  private RenderSpectatorNotification(): void {
    const gc = this.m_pClient;
    if (gc.m_LocalClientID < 0) return;
    if (gc.m_aClients[gc.m_LocalClientID].m_Team === P.TEAM_SPECTATORS && gc.m_TeamChangeTime + 5 >= this.Client().LocalTime()) {
      let NumPlayers = 0;
      for (const c of gc.m_aClients) if (c.m_Active && c.m_Team !== P.TEAM_SPECTATORS) NumPlayers++;
      if (NumPlayers > 0) this.centered(30, 16, Localize('Click on a player or a flag to follow it'));
    }
  }

  private RenderReadyUpNotification(): void {
    const gc = this.m_pClient;
    const pi = gc.m_LocalClientID >= 0 ? gc.m_Snap.m_paPlayerInfos[gc.m_LocalClientID] : null;
    if (pi && !(pi.m_PlayerFlags & P.PLAYERFLAG_READY)) this.centered(30, 16, str_format(128, Localize('When ready, press <%s>'), gc.m_pBinds.GetKey('ready_change')));
  }

  private RenderRaceTime(pRaceInfo: P.CNetObj_PlayerInfoRace | null): void {
    if (!pRaceInfo || pRaceInfo.m_RaceStartTick === -1) return;
    const G = this.Graphics();
    const RaceTime = idiv((this.Client().GameTick() - pRaceInfo.m_RaceStartTick) * 1000, this.Client().GameTickSpeed());
    const aBuf = FormatTime(RaceTime, Math.min(this.m_pClient.RacePrecision(), 1));
    const Half = (300 * G.ScreenAspect()) / 2;
    const w = this.width(12, '00:00.0');
    G.TextureSet(ImageTex(C.IMAGE_TIMERCLOCK));
    G.QuadsBegin();
    this.RenderTools().SelectSprite(C.SPRITE_TIMERCLOCK_A);
    G.QuadsDrawTL([new CQuadItem(Half - w / 2 - 18, 20, 15, 15)], 1);
    G.QuadsEnd();
    this.text(Half - w / 2, 20, 12, aBuf);
  }

  private RenderCheckpoint(): void {
    const TimeSinceCheckpoint = this.now() - this.m_CheckpointTime;
    if (this.m_CheckpointTime === 0 || TimeSinceCheckpoint >= TIME_FREQ * 4) return;
    const T = this.TextRender();
    const aBuf = FormatTimeDiff(this.m_CheckpointDiff, 2);
    let a = 1;
    if (TimeSinceCheckpoint > TIME_FREQ * 2) a = (TIME_FREQ * 4 - TimeSinceCheckpoint) / (TIME_FREQ * 2);
    if (this.m_CheckpointDiff > 0) T.TextColor(1, 0.5, 0.5, a);
    else if (this.m_CheckpointDiff < 0) T.TextColor(0.5, 1, 0.5, a);
    else T.TextColor(1, 1, 1, a);
    const Half = (300 * this.Graphics().ScreenAspect()) / 2;
    this.text(Half - this.width(10, aBuf) / 2, 33, 10, aBuf);
    T.TextColor(1, 1, 1, 1);
  }

  override OnMessage(MsgType: number, pRawMsg: CNetMsg): void {
    if (MsgType === P.NETMSGTYPE_SV_CHECKPOINT) {
      this.m_CheckpointDiff = (pRawMsg as P.CNetMsg_Sv_Checkpoint).m_Diff;
      this.m_CheckpointTime = this.now();
    } else if (MsgType === P.NETMSGTYPE_SV_KILLMSG && this.m_pClient.m_GameInfo.m_GameFlags & P.GAMEFLAG_RACE) {
      if ((pRawMsg as P.CNetMsg_Sv_KillMsg).m_Victim === this.m_pClient.m_LocalClientID) this.m_CheckpointTime = 0;
    }
  }

  override OnRender(): void {
    const gc = this.m_pClient, S = gc.m_Snap;
    if (!S.m_pGameData) return;
    if (gc.m_pMenus.IsActive()) return;
    const Race = (gc.m_GameInfo.m_GameFlags & P.GAMEFLAG_RACE) !== 0;
    this.m_Width = 300 * this.Graphics().ScreenAspect();
    this.m_Height = 300;
    this.Graphics().MapScreen(0, 0, this.m_Width, this.m_Height);
    if (this.Config().m_ClShowhud) {
      if (S.m_pLocalCharacter && !(S.m_pGameData.m_GameStateFlags & (P.GAMESTATEFLAG_ROUNDOVER | P.GAMESTATEFLAG_GAMEOVER))) {
        this.RenderHealthAndAmmo(S.m_pLocalCharacter);
        if (Race) {
          this.RenderRaceTime(S.m_paPlayerInfosRace[gc.m_LocalClientID]);
          this.RenderCheckpoint();
        }
      } else if (S.m_SpecInfo.m_Active) {
        if (S.m_SpecInfo.m_SpectatorID !== -1) {
          this.RenderHealthAndAmmo(S.m_aCharacters[S.m_SpecInfo.m_SpectatorID].m_Cur);
          if (Race) {
            this.RenderRaceTime(S.m_paPlayerInfosRace[S.m_SpecInfo.m_SpectatorID]);
            this.RenderCheckpoint();
          }
        }
        this.RenderSpectatorHud();
        this.RenderSpectatorNotification();
      }
      this.RenderGameTimer();
      this.RenderPauseTimer();
      this.RenderStartCountdown();
      this.RenderDeadNotification();
      this.RenderSuddenDeath();
      this.RenderScoreHud();
      this.RenderWarmupTimer();
      this.RenderFps();
      if (this.Client().State() !== STATE_DEMOPLAYBACK) this.RenderConnectionWarning();
      this.RenderTeambalanceWarning();
      this.RenderVoting();
    }
    this.RenderCursor();
  }
}
