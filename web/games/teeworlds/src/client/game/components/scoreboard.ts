// (c) Magnus Auvinen. See licence.txt in the root of the distribution for more information.
// If you are missing that file, acquire a complete release at teeworlds.com.
// Altered: game/client/components/scoreboard.h and scoreboard.cpp of Teeworlds 0.7.5 in TypeScript. No demo
// recorder, so no recording notification.
import { vec2, clamp, v4, str_comp, str_format, Localize, ImageTex } from './common.ts';
import * as C from '../../../generated/content.ts';
import * as P from '../../../generated/protocol.ts';
import { CFGFLAG_CLIENT } from '../../../generated/config.ts';
import { MAX_CLIENTS } from '../../../engine/shared/protocol.ts';
import { CQuadItem } from '../../engine/graphics.ts';
import { CTextCursor, TEXTFLAG_ALLOW_NEWLINE, TEXTFLAG_RENDER, TEXTFLAG_STOP_AT_END } from '../../engine/text.ts';
import { CUIRect } from '../ui.ts';
import { CAnimState, SPRITE_FLAG_FLIP_X } from '../render.ts';
import { CComponent } from '../component.ts';
import { FormatTime } from '../gameclient.ts';

const UTF8_CHECK = '\xE2\x9C\x93', UTF8_DOTS = '\xe2\x8b\x85\xe2\x8b\x85\xe2\x8b\x85';

export class CScoreboard extends CComponent {
  private m_Active = false;
  private m_Activate = false;
  private m_TotalRect = new CUIRect();

  GetScoreboardRect(): CUIRect { return this.m_TotalRect; }

  override OnReset(): void {
    this.m_Active = false;
    this.m_Activate = false;
  }
  override OnRelease(): void { this.m_Active = false; }

  override OnConsoleInit(): void {
    this.Console().Register('+scoreboard', '', CFGFLAG_CLIENT, (r) => {
      if (!r.GetInteger(0)) {
        this.m_Activate = false;
        this.m_Active = false;
      } else if (!this.m_Active) this.m_Activate = true;
    }, this, 'Show scoreboard');
  }

  private RenderGoals(x: number, y: number, w: number): void {
    const gi = this.m_pClient.m_GameInfo, T = this.TextRender();
    this.Graphics().BlendNormal();
    this.RenderTools().DrawRoundRect(new CUIRect(x, y, w, 20), v4(0, 0, 0, 0.25), 5);
    y += 2;
    if (gi.m_ScoreLimit) T.Text(0, x + 10, y, 12, str_format(64, '%s: %d', Localize('Score limit'), gi.m_ScoreLimit), -1);
    if (gi.m_TimeLimit) {
      const aBuf = str_format(64, Localize('Time limit: %d min'), gi.m_TimeLimit);
      T.Text(0, x + w / 2 - T.TextWidth(0, 12, aBuf, -1, -1) / 2, y, 12, aBuf, -1);
    }
    if (gi.m_MatchNum && gi.m_MatchCurrent) {
      const aBuf = str_format(64, '%s %d/%d', Localize('Match', 'rounds (scoreboard)'), gi.m_MatchCurrent, gi.m_MatchNum);
      T.Text(0, x + w - T.TextWidth(0, 12, aBuf, -1, -1) - 10, y, 12, aBuf, -1);
    }
  }

  private RenderSpectators(x: number, y: number, w: number): number {
    const gc = this.m_pClient, T = this.TextRender(), cfg = this.Config();
    const h = 20;
    let NumSpectators = 0;
    for (const c of gc.m_aClients) if (c.m_Active && c.m_Team === P.TEAM_SPECTATORS) NumSpectators++;
    const SpectatorBuf = str_format(64, '%s (%d):', Localize('Spectators'), NumSpectators);
    const tw = T.TextWidth(0, 12, SpectatorBuf, -1, -1);
    const Cursor = new CTextCursor();
    const pass = (render: boolean): void => {
      let Multiple = false;
      for (let i = 0; i < MAX_CLIENTS; ++i) {
        const pInfo = gc.m_Snap.m_paPlayerInfos[i];
        if (!pInfo || gc.m_aClients[i].m_Team !== P.TEAM_SPECTATORS) continue;
        if (Multiple) T.TextEx(Cursor, ', ', -1);
        if (cfg.m_ClShowUserId && Cursor.m_LineCount <= Cursor.m_MaxLines) {
          if (render) this.RenderTools().DrawClientID(T, Cursor, i);
          else Cursor.m_X += Cursor.m_FontSize;
        }
        const watching = pInfo.m_PlayerFlags & P.PLAYERFLAG_WATCHING ? 0 : 1;
        if (gc.m_aClients[i].m_aClan) {
          if (render) T.TextColor(1, 1, watching, 0.7);
          T.TextEx(Cursor, gc.m_aClients[i].m_aClan + ' ', -1);
        }
        if (render) T.TextColor(1, 1, watching, 1);
        T.TextEx(Cursor, gc.m_aClients[i].m_aName, -1);
        if (render) T.TextColor(1, 1, 1, 1);
        Multiple = true;
      }
    };
    T.SetCursor(Cursor, x, y, 12, TEXTFLAG_ALLOW_NEWLINE);
    Cursor.m_LineWidth = w - 17;
    Cursor.m_StartX -= tw + 3;
    Cursor.m_MaxLines = 4;
    pass(false);
    const RectHeight = 3 * h + (Cursor.m_Y - Cursor.m_StartY);
    this.Graphics().BlendNormal();
    this.RenderTools().DrawRoundRect(new CUIRect(x, y, w, RectHeight), v4(0, 0, 0, 0.25), 5);
    y += 30;
    T.Text(0, x + 10, y, 12, SpectatorBuf, w - 20);
    x += tw + 2 + 10;
    T.SetCursor(Cursor, x, y, 12, TEXTFLAG_RENDER | TEXTFLAG_ALLOW_NEWLINE);
    Cursor.m_LineWidth = w - 17;
    Cursor.m_StartX -= tw + 3;
    Cursor.m_MaxLines = 4;
    pass(true);
    return RectHeight;
  }

  private RenderScoreboard(x: number, y: number, w: number, Team: number, pTitle: string | null, Align: number): number {
    if (Team === P.TEAM_SPECTATORS) return 0;
    const gc = this.m_pClient, Snap = gc.m_Snap, T = this.TextRender(), RT = this.RenderTools(), G = this.Graphics(), cfg = this.Config();
    const ReadyMode = !!Snap.m_pGameData && (Snap.m_pGameData.m_GameStateFlags & (P.GAMESTATEFLAG_STARTCOUNTDOWN | P.GAMESTATEFLAG_PAUSED | P.GAMESTATEFLAG_WARMUP)) !== 0 && Snap.m_pGameData.m_GameStateEndTick === 0;
    const Race = (gc.m_GameInfo.m_GameFlags & P.GAMEFLAG_RACE) !== 0;
    const HeadlineHeight = 40, TitleFontsize = 20, HeadlineFontsize = 12, LineHeight = 20, TeeSizeMod = 1, Spacing = 2;
    const PingOffset = x + Spacing, PingLength = 35;
    const CountryFlagOffset = PingOffset + PingLength, CountryFlagLength = 20;
    const IdSize = cfg.m_ClShowUserId ? LineHeight : 0;
    const ReadyLength = ReadyMode ? 10 : 0;
    const TeeOffset = CountryFlagOffset + CountryFlagLength + 4, TeeLength = 25 * TeeSizeMod;
    const NameOffset = CountryFlagOffset + CountryFlagLength + IdSize, NameLength = 128 - IdSize / 2 - ReadyLength;
    const ClanOffset = NameOffset + NameLength + ReadyLength, ClanLength = 88 - IdSize / 2;
    const KillOffset = ClanOffset + ClanLength, KillLength = Race ? 0 : 24;
    const DeathOffset = KillOffset + KillLength, DeathLength = Race ? 0 : 24;
    const ScoreOffset = DeathOffset + DeathLength, ScoreLength = Race ? 83 : 35;
    let tw = 0;
    const NoTitle = !pTitle;
    const NumPlayers = gc.m_GameInfo.m_aTeamSize[Team];
    let PlayerLines = NumPlayers;
    if (gc.m_GameInfo.m_GameFlags & P.GAMEFLAG_TEAMS) PlayerLines = Math.max(gc.m_GameInfo.m_aTeamSize[Team ^ 1], PlayerLines);
    if (PlayerLines > 16) PlayerLines = 16;
    let aBuf = '';
    G.BlendNormal();
    let Color;
    if (Team === P.TEAM_RED && gc.m_GameInfo.m_GameFlags & P.GAMEFLAG_TEAMS) Color = v4(0.975, 0.17, 0.17, 0.75);
    else if (Team === P.TEAM_BLUE) Color = v4(0.17, 0.46, 0.975, 0.75);
    else Color = v4(0, 0, 0, 0.5);
    RT.DrawRoundRect(new CUIRect(x, y, w, HeadlineHeight), Color, 5);
    if (NoTitle) {
      if (Snap.m_pGameData!.m_GameStateFlags & P.GAMESTATEFLAG_GAMEOVER) pTitle = Localize('Game over');
      else if (Snap.m_pGameData!.m_GameStateFlags & P.GAMESTATEFLAG_ROUNDOVER) pTitle = Localize('Round over');
      else pTitle = Localize('Scoreboard');
    }
    const title = pTitle!;
    if (Align === -1) {
      tw = T.TextWidth(0, TitleFontsize, title, -1, -1);
      T.Text(0, x + 20, y + 5, TitleFontsize, title, -1);
      if (!NoTitle) {
        T.TextColor(1, 1, 1, 0.5);
        T.Text(0, x + 20 + tw, y + 5, TitleFontsize, str_format(128, ' (%d)', NumPlayers), -1);
        T.TextColor(1, 1, 1, 1);
      }
    } else {
      tw = T.TextWidth(0, TitleFontsize, title, -1, -1);
      if (!NoTitle) {
        aBuf = str_format(128, '(%d) ', NumPlayers);
        const PlayersTextWidth = T.TextWidth(0, TitleFontsize, aBuf, -1, -1);
        T.TextColor(1, 1, 1, 0.5);
        T.Text(0, x + w - tw - PlayersTextWidth - 20, y + 5, TitleFontsize, aBuf, -1);
        T.TextColor(1, 1, 1, 1);
      }
      T.Text(0, x + w - tw - 20, y + 5, TitleFontsize, title, -1);
    }
    if (Race) {
      if (Snap.m_pGameDataRace && Team !== P.TEAM_BLUE) {
        const MapRecordFontsize = 16;
        const pMapRecordStr = Localize('Map record');
        aBuf = FormatTime(Snap.m_pGameDataRace.m_BestTime, gc.RacePrecision());
        if (Align === -1) {
          T.Text(0, x + w - T.TextWidth(0, HeadlineFontsize, pMapRecordStr, -1, -1) - 20, y + 3, HeadlineFontsize, pMapRecordStr, -1);
          T.Text(0, x + w - T.TextWidth(0, MapRecordFontsize, aBuf, -1, -1) - 20, y + HeadlineFontsize + 3, MapRecordFontsize, aBuf, -1);
        } else {
          T.Text(0, x + 20, y + 3, HeadlineFontsize, pMapRecordStr, -1);
          T.Text(0, x + 20, y + HeadlineFontsize + 3, MapRecordFontsize, aBuf, -1);
        }
      }
    } else {
      aBuf = '';
      if (gc.m_GameInfo.m_GameFlags & P.GAMEFLAG_TEAMS) aBuf = String(Team === P.TEAM_RED ? Snap.m_pGameDataTeam!.m_TeamscoreRed : Snap.m_pGameDataTeam!.m_TeamscoreBlue);
      else if (Snap.m_SpecInfo.m_Active && Snap.m_SpecInfo.m_SpectatorID >= 0 && Snap.m_paPlayerInfos[Snap.m_SpecInfo.m_SpectatorID])
        aBuf = String(Snap.m_paPlayerInfos[Snap.m_SpecInfo.m_SpectatorID]!.m_Score);
      else if (Snap.m_pLocalInfo) aBuf = String(Snap.m_pLocalInfo.m_Score);
      if (Align === -1) T.Text(0, x + w - T.TextWidth(0, TitleFontsize, aBuf, -1, -1) - 20, y + 5, TitleFontsize, aBuf, -1);
      else T.Text(0, x + 20, y + 5, TitleFontsize, aBuf, -1);
    }
    y += HeadlineHeight;
    G.BlendNormal();
    RT.DrawRoundRect(new CUIRect(x, y, w, LineHeight * (PlayerLines + 1)), v4(0, 0, 0, 0.25), 5);
    if (PlayerLines) RT.DrawRoundRect(new CUIRect(x, y + LineHeight, w, LineHeight * PlayerLines), v4(0, 0, 0, 0.25), 5);
    const pPingStr = Localize('Ping');
    T.TextColor(1, 1, 1, 0.5);
    T.Text(0, PingOffset + PingLength - T.TextWidth(0, HeadlineFontsize, pPingStr, -1, -1), y + Spacing, HeadlineFontsize, pPingStr, -1);
    T.TextColor(1, 1, 1, 1);
    T.Text(0, NameOffset + TeeLength, y + Spacing, HeadlineFontsize, Localize('Name'), -1);
    const pClanStr = Localize('Clan');
    T.Text(0, ClanOffset + ClanLength / 2 - T.TextWidth(0, HeadlineFontsize, pClanStr, -1, -1) / 2, y + Spacing, HeadlineFontsize, pClanStr, -1);
    if (!Race) {
      T.TextColor(1, 1, 1, 0.5);
      T.Text(0, KillOffset + KillLength / 2 - T.TextWidth(0, HeadlineFontsize, 'K', -1, -1) / 2, y + Spacing, HeadlineFontsize, 'K', -1);
      T.Text(0, DeathOffset + DeathLength / 2 - T.TextWidth(0, HeadlineFontsize, 'D', -1, -1) / 2, y + Spacing, HeadlineFontsize, 'D', -1);
    }
    const pScoreStr = Race ? Localize('Time') : Localize('Score');
    T.TextColor(1, 1, 1, 1);
    tw = T.TextWidth(0, HeadlineFontsize, pScoreStr, -1, -1);
    T.Text(0, ScoreOffset + (Race ? ScoreLength - tw - 3 : ScoreLength / 2 - tw / 2), y + Spacing, HeadlineFontsize, pScoreStr, -1);
    T.TextColor(1, 1, 1, 1);
    y += LineHeight;
    const FontSize = HeadlineFontsize;
    const Cursor = new CTextCursor();
    const MAX_IDS = 16;
    const RenderScoreIDs = new Array(MAX_IDS).fill(-1);
    let NumRenderScoreIDs = 0;
    const HoleSizes = [0, 0];
    const IBS = Snap.m_aInfoByScore;
    const matches = (i: number, RenderDead: number): boolean => {
      const pi = IBS[i];
      if (!pi.m_pPlayerInfo || gc.m_aClients[pi.m_ClientID].m_Team !== Team) return false;
      const dead = (pi.m_pPlayerInfo.m_PlayerFlags & P.PLAYERFLAG_DEAD) !== 0;
      return RenderDead ? dead : !dead;
    };
    if (NumPlayers > MAX_IDS) {
      for (let RenderDead = 0; RenderDead < 2 && NumRenderScoreIDs < MAX_IDS - 1; ++RenderDead)
        for (let i = 0; i < MAX_CLIENTS && NumRenderScoreIDs < MAX_IDS - 1; i++) if (matches(i, RenderDead)) RenderScoreIDs[NumRenderScoreIDs++] = i;
      NumRenderScoreIDs = MAX_IDS;
      RenderScoreIDs[MAX_IDS - 1] = -1;
      HoleSizes[0] = gc.m_GameInfo.m_aTeamSize[Team] - (MAX_IDS - 1);
      if (gc.m_LocalClientID !== -1 && (gc.m_aClients[gc.m_LocalClientID].m_Team === Team || Snap.m_SpecInfo.m_Active)) {
        let Classment = -1;
        const TeamScoreIDs: number[] = [];
        for (let RenderDead = 0; RenderDead < 2; ++RenderDead)
          for (let i = 0; i < MAX_CLIENTS; i++) {
            if (!matches(i, RenderDead)) continue;
            if (gc.m_LocalClientID === IBS[i].m_ClientID || (Snap.m_SpecInfo.m_Active && IBS[i].m_ClientID === Snap.m_SpecInfo.m_SpectatorID)) Classment = TeamScoreIDs.length;
            TeamScoreIDs.push(i);
          }
        const n = gc.m_GameInfo.m_aTeamSize[Team];
        if (Classment < MAX_IDS - 1) { /* shown */ } else if (Classment === n - 1) {
          HoleSizes[0] = Classment - MAX_IDS - 2;
          RenderScoreIDs[MAX_IDS - 3] = -1;
          RenderScoreIDs[MAX_IDS - 2] = TeamScoreIDs[Classment - 1];
          RenderScoreIDs[MAX_IDS - 1] = TeamScoreIDs[Classment];
        } else if (Classment === n - 2) {
          HoleSizes[0] = Classment - MAX_IDS - 3;
          RenderScoreIDs[MAX_IDS - 4] = -1;
          RenderScoreIDs[MAX_IDS - 3] = TeamScoreIDs[Classment - 1];
          RenderScoreIDs[MAX_IDS - 2] = TeamScoreIDs[Classment];
          RenderScoreIDs[MAX_IDS - 1] = TeamScoreIDs[Classment + 1];
        } else if (Classment === n - 3) {
          HoleSizes[0] = Classment - MAX_IDS - 4;
          RenderScoreIDs[MAX_IDS - 5] = -1;
          RenderScoreIDs[MAX_IDS - 4] = TeamScoreIDs[Classment - 1];
          RenderScoreIDs[MAX_IDS - 3] = TeamScoreIDs[Classment];
          RenderScoreIDs[MAX_IDS - 2] = TeamScoreIDs[Classment + 1];
          RenderScoreIDs[MAX_IDS - 1] = TeamScoreIDs[Classment + 2];
        } else if (Classment < n - 3) {
          HoleSizes[0] = Classment - MAX_IDS - 4;
          RenderScoreIDs[MAX_IDS - 5] = -1;
          RenderScoreIDs[MAX_IDS - 4] = TeamScoreIDs[Classment - 1];
          RenderScoreIDs[MAX_IDS - 3] = TeamScoreIDs[Classment];
          RenderScoreIDs[MAX_IDS - 2] = TeamScoreIDs[Classment + 1];
          HoleSizes[1] = n - Classment - 2;
          RenderScoreIDs[MAX_IDS - 1] = -2;
        }
      }
    } else {
      for (let RenderDead = 0; RenderDead < 2; ++RenderDead)
        for (let i = 0; i < MAX_CLIENTS && NumRenderScoreIDs < MAX_IDS; i++) if (matches(i, RenderDead)) RenderScoreIDs[NumRenderScoreIDs++] = i;
    }
    for (let i = 0; i < NumRenderScoreIDs; i++) {
      if (RenderScoreIDs[i] >= 0) {
        const pInfo = IBS[RenderScoreIDs[i]];
        const pi = pInfo.m_pPlayerInfo!;
        const cl = gc.m_aClients[pInfo.m_ClientID];
        const RenderDead = (pi.m_PlayerFlags & P.PLAYERFLAG_DEAD) !== 0;
        const ColorAlpha = RenderDead ? 0.5 : 1;
        T.TextColor(1, 1, 1, ColorAlpha);
        let TC = { r: 1, g: 1, b: 1 };
        let OutlineColor = v4(0, 0, 0, 0.3);
        const HighlightedLine = gc.m_LocalClientID === pInfo.m_ClientID || (Snap.m_SpecInfo.m_Active && pInfo.m_ClientID === Snap.m_SpecInfo.m_SpectatorID);
        if (HighlightedLine) {
          RT.DrawRoundRect(new CUIRect(x, y, w, LineHeight), v4(1, 1, 1, 0.75 * ColorAlpha), 5);
          TC = { r: 0, g: 0, b: 0 };
          OutlineColor = v4(1, 1, 1, 0.25);
        }
        T.TextColor(TC.r, TC.g, TC.b, ColorAlpha);
        T.TextOutlineColor(OutlineColor);
        T.TextColor(TC.r, TC.g, TC.b, 0.5 * ColorAlpha);
        aBuf = String(clamp(pi.m_Latency, 0, 999));
        T.SetCursor(Cursor, PingOffset + PingLength - T.TextWidth(0, FontSize, aBuf, -1, -1), y + Spacing, FontSize, TEXTFLAG_RENDER);
        Cursor.m_LineWidth = PingLength;
        T.TextEx(Cursor, aBuf, -1);
        T.TextColor(TC.r, TC.g, TC.b, ColorAlpha);
        gc.m_pCountryFlags.Render(cl.m_Country, v4(1, 1, 1, 0.75 * ColorAlpha), CountryFlagOffset, y + 3, 30, LineHeight - 5);
        const gf = Snap.m_pGameDataFlag;
        if (gc.m_GameInfo.m_GameFlags & P.GAMEFLAG_FLAGS && gf && (gf.m_FlagCarrierRed === pInfo.m_ClientID || gf.m_FlagCarrierBlue === pInfo.m_ClientID)) {
          G.BlendNormal();
          G.TextureSet(ImageTex(C.IMAGE_GAME));
          G.QuadsBegin();
          RT.SelectSprite(pInfo.m_ClientID === gf.m_FlagCarrierBlue ? C.SPRITE_FLAG_BLUE : C.SPRITE_FLAG_RED, SPRITE_FLAG_FLIP_X);
          G.QuadsDrawTL([new CQuadItem(TeeOffset + 4, y - 2 - Spacing / 2, LineHeight / 2, LineHeight)], 1);
          G.QuadsEnd();
        }
        if (RenderDead) {
          G.BlendNormal();
          G.TextureSet(ImageTex(C.IMAGE_DEADTEE));
          G.QuadsBegin();
          if (gc.m_GameInfo.m_GameFlags & P.GAMEFLAG_TEAMS) {
            const c = gc.m_pSkins.GetColorV4(gc.m_pSkins.GetTeamColor(1, 0, cl.m_Team, P.SKINPART_BODY), false);
            G.SetColor(c.r, c.g, c.b, c.a);
          }
          G.QuadsDrawTL([new CQuadItem(TeeOffset + TeeLength / 2 - 10 * TeeSizeMod, y - 2 + Spacing, 20 * TeeSizeMod, 20 * TeeSizeMod)], 1);
          G.QuadsEnd();
        } else {
          const TeeInfo = cl.m_RenderInfo.copy();
          TeeInfo.m_Size = 20 * TeeSizeMod;
          RT.RenderTee(CAnimState.GetIdle(), TeeInfo, P.EMOTE_NORMAL, new vec2(1, 0), new vec2(TeeOffset + TeeLength / 2, y + LineHeight / 2 + Spacing));
        }
        if (RenderDead && pi.m_PlayerFlags & P.PLAYERFLAG_WATCHING) T.TextColor(1, 1, 0, ColorAlpha);
        if (cfg.m_ClShowUserId) {
          T.SetCursor(Cursor, NameOffset + TeeLength - IdSize + Spacing, y + Spacing, FontSize, TEXTFLAG_RENDER);
          RT.DrawClientID(T, Cursor, pInfo.m_ClientID);
        }
        T.SetCursor(Cursor, NameOffset + TeeLength, y + Spacing, FontSize, TEXTFLAG_RENDER | TEXTFLAG_STOP_AT_END);
        Cursor.m_LineWidth = NameLength - TeeLength;
        T.TextEx(Cursor, cl.m_aName, cl.m_aName.length);
        if (ReadyMode && pi.m_PlayerFlags & P.PLAYERFLAG_READY) {
          if (HighlightedLine) T.TextOutlineColor(0, 0.1, 0, 0.5);
          T.TextColor(0.1, 1, 0.1, ColorAlpha);
          T.SetCursor(Cursor, Cursor.m_X, y + Spacing, FontSize, TEXTFLAG_RENDER);
          T.TextEx(Cursor, UTF8_CHECK, UTF8_CHECK.length);
        }
        T.TextColor(TC.r, TC.g, TC.b, ColorAlpha);
        T.TextOutlineColor(OutlineColor);
        tw = T.TextWidth(0, FontSize, cl.m_aClan, -1, -1);
        T.SetCursor(Cursor, ClanOffset + ClanLength / 2 - tw / 2, y + Spacing, FontSize, TEXTFLAG_RENDER | TEXTFLAG_STOP_AT_END);
        Cursor.m_LineWidth = ClanLength;
        T.TextEx(Cursor, cl.m_aClan, -1);
        if (!Race) {
          const st = gc.m_pStats.GetPlayerStats(pInfo.m_ClientID);
          T.TextColor(TC.r, TC.g, TC.b, 0.5 * ColorAlpha);
          aBuf = String(clamp(st.m_Frags, 0, 999));
          T.SetCursor(Cursor, KillOffset + KillLength / 2 - T.TextWidth(0, FontSize, aBuf, -1, -1) / 2, y + Spacing, FontSize, TEXTFLAG_RENDER);
          Cursor.m_LineWidth = KillLength;
          T.TextEx(Cursor, aBuf, -1);
          aBuf = String(clamp(st.m_Deaths, 0, 999));
          T.SetCursor(Cursor, DeathOffset + DeathLength / 2 - T.TextWidth(0, FontSize, aBuf, -1, -1) / 2, y + Spacing, FontSize, TEXTFLAG_RENDER);
          Cursor.m_LineWidth = DeathLength;
          T.TextEx(Cursor, aBuf, -1);
        }
        if (Race) aBuf = pi.m_Score >= 0 ? FormatTime(pi.m_Score, gc.RacePrecision()) : '';
        else aBuf = String(clamp(pi.m_Score, -999, 9999));
        tw = T.TextWidth(0, FontSize, aBuf, -1, -1);
        T.TextColor(TC.r, TC.g, TC.b, ColorAlpha);
        T.SetCursor(Cursor, ScoreOffset + (Race ? ScoreLength - tw - 3 : ScoreLength / 2 - tw / 2), y + Spacing, FontSize, TEXTFLAG_RENDER);
        Cursor.m_LineWidth = ScoreLength;
        T.TextEx(Cursor, aBuf, -1);
        y += LineHeight;
      } else {
        const HoleSize = HoleSizes[-1 - RenderScoreIDs[i]];
        T.TextColor(1, 1, 1, 1);
        T.SetCursor(Cursor, NameOffset + TeeLength, y + Spacing, FontSize, TEXTFLAG_RENDER | TEXTFLAG_STOP_AT_END);
        Cursor.m_LineWidth = NameLength;
        T.TextEx(Cursor, str_format(64, '%s %s', UTF8_DOTS, str_format(64, Localize('%d other players'), HoleSize)), -1);
        y += LineHeight;
      }
    }
    T.TextColor(1, 1, 1, 1);
    T.TextOutlineColor(0, 0, 0, 0.3);
    return HeadlineHeight + LineHeight * (PlayerLines + 1);
  }

  override OnRender(): void {
    const gc = this.m_pClient, S = gc.m_Snap, G = this.Graphics(), T = this.TextRender();
    if (gc.m_pMenus.IsActive() || gc.m_pStats.IsActive()) return;
    if (this.m_Activate) {
      this.m_Active = true;
      this.m_Activate = false;
    }
    if (this.m_Active) gc.m_pMotd.Clear();
    if (!this.IsActive()) return;
    const Screen = this.UI().Screen();
    G.MapScreen(Screen.x, Screen.y, Screen.w, Screen.h);
    let Width = Screen.w;
    const y = 85, w = 364, FontSize = 86;
    const pRedClanName = this.GetClanName(P.TEAM_RED) ?? Localize('Red team');
    const pBlueClanName = this.GetClanName(P.TEAM_BLUE) ?? Localize('Blue team');
    if (S.m_pGameData) {
      if (!(gc.m_GameInfo.m_GameFlags & P.GAMEFLAG_TEAMS)) {
        const ScoreboardHeight = this.RenderScoreboard(Width / 2 - w / 2, y, w, 0, null, -1);
        const SpectatorHeight = this.RenderSpectators(Width / 2 - w / 2, y + 3 + ScoreboardHeight, w);
        this.RenderGoals(Width / 2 - w / 2, y + 3 + ScoreboardHeight, w);
        this.m_TotalRect = new CUIRect(Width / 2 - w / 2, y, w, ScoreboardHeight + SpectatorHeight + 3);
      } else if (S.m_pGameDataTeam) {
        const ScoreboardHeight = this.RenderScoreboard(Width / 2 - w - 1.5, y, w, P.TEAM_RED, pRedClanName, -1);
        this.RenderScoreboard(Width / 2 + 1.5, y, w, P.TEAM_BLUE, pBlueClanName, 1);
        const SpectatorHeight = this.RenderSpectators(Width / 2 - w - 1.5, y + 3 + ScoreboardHeight, w * 2 + 3);
        this.RenderGoals(Width / 2 - w - 1.5, y + 3 + ScoreboardHeight, w * 2 + 3);
        this.m_TotalRect = new CUIRect(Width / 2 - w - 1.5, y, w * 2 + 3, ScoreboardHeight + SpectatorHeight + 3);
      }
    }
    Width = 400 * 3 * G.ScreenAspect();
    G.MapScreen(0, 0, Width, 400 * 3);
    if (S.m_pGameData && gc.m_GameInfo.m_GameFlags & P.GAMEFLAG_TEAMS && S.m_pGameDataTeam) {
      let aText: string | null = null;
      if (S.m_pGameData.m_GameStateFlags & P.GAMESTATEFLAG_GAMEOVER) {
        if (S.m_pGameDataTeam.m_TeamscoreRed > S.m_pGameDataTeam.m_TeamscoreBlue) aText = str_format(256, Localize('%s wins!'), pRedClanName);
        else if (S.m_pGameDataTeam.m_TeamscoreBlue > S.m_pGameDataTeam.m_TeamscoreRed) aText = str_format(256, Localize('%s wins!'), pBlueClanName);
        else aText = Localize('Draw!');
      } else if (S.m_pGameData.m_GameStateFlags & P.GAMESTATEFLAG_ROUNDOVER) aText = Localize('Round over!');
      if (aText) T.Text(0, Width / 2 - T.TextWidth(0, FontSize, aText, -1, -1) / 2, 39, FontSize, aText, -1);
    }
  }

  IsActive(): boolean {
    const gc = this.m_pClient, S = gc.m_Snap;
    if (this.m_Active) return true;
    if (gc.m_LocalClientID !== -1 && gc.m_aClients[gc.m_LocalClientID].m_Team !== P.TEAM_SPECTATORS) {
      if (!S.m_pLocalCharacter && !S.m_SpecInfo.m_Active && !(S.m_pGameData && S.m_pGameData.m_GameStateFlags & P.GAMESTATEFLAG_PAUSED)) return true;
    }
    if (S.m_pGameData && S.m_pGameData.m_GameStateFlags & (P.GAMESTATEFLAG_ROUNDOVER | P.GAMESTATEFLAG_GAMEOVER)) return true;
    return false;
  }

  private GetClanName(Team: number): string | null {
    let ClanPlayers = 0;
    let pClanName: string | null = null;
    for (const c of this.m_pClient.m_aClients) {
      if (!c.m_Active || c.m_Team !== Team) continue;
      if (pClanName === null) {
        pClanName = c.m_aClan;
        ClanPlayers++;
      } else if (str_comp(c.m_aClan, pClanName) === 0) ClanPlayers++;
      else return null;
    }
    return ClanPlayers > 1 && pClanName ? pClanName : null;
  }
}
