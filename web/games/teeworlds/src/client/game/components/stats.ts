// (c) Magnus Auvinen. See licence.txt in the root of the distribution for more information.
// If you are missing that file, acquire a complete release at teeworlds.com.
// Altered: game/client/components/stats.h and stats.cpp of Teeworlds 0.7.5 in TypeScript. No automatic
// screenshot of the statboard (cl_auto_statboard_screenshot only forces the board open).
import { vec2, v4, str_format, f, Localize, ImageTex } from './common.ts';
import * as C from '../../../generated/content.ts';
import * as P from '../../../generated/protocol.ts';
import { CFGFLAG_CLIENT } from '../../../generated/config.ts';
import { MAX_CLIENTS } from '../../../engine/shared/protocol.ts';
import { TIME_FREQ } from '../../../engine/shared/network.ts';
import { CTextCursor, TEXTFLAG_RENDER, TEXTFLAG_STOP_AT_END } from '../../engine/text.ts';
import { CUIRect } from '../ui.ts';
import { CAnimState, SPRITE_FLAG_FLIP_X } from '../render.ts';
import { CComponent } from '../component.ts';
import type { CNetMsg } from '../gameclient.ts';

export const TC_STATS_FRAGS = 1, TC_STATS_DEATHS = 2, TC_STATS_SUICIDES = 4, TC_STATS_RATIO = 8, TC_STATS_NET = 16, TC_STATS_FPM = 32,
  TC_STATS_SPREE = 64, TC_STATS_BESTSPREE = 128, TC_STATS_FLAGGRABS = 256, TC_STATS_WEAPS = 512, TC_STATS_FLAGCAPTURES = 1024;

export class CPlayerStats {
  m_IngameTicks = 0;
  m_aFragsWith = new Array(P.NUM_WEAPONS).fill(0);
  m_aDeathsFrom = new Array(P.NUM_WEAPONS).fill(0);
  m_Frags = 0;
  m_Deaths = 0;
  m_Suicides = 0;
  m_BestSpree = 0;
  m_CurrentSpree = 0;
  m_FlagGrabs = 0;
  m_FlagCaptures = 0;
  m_CarriersKilled = 0;
  m_KillsCarrying = 0;
  m_DeathsCarrying = 0;
  Reset(): void { Object.assign(this, new CPlayerStats()); }
}

const WEAPON_COLORS = [[201, 197, 205], [156, 158, 100], [98, 80, 46], [163, 51, 56], [65, 97, 161], [182, 137, 40]].map(([r, g, b]) => v4(r / 255, g / 255, b / 255, 1));

export class CStats extends CComponent {
  private m_aStats: CPlayerStats[] = Array.from({ length: MAX_CLIENTS }, () => new CPlayerStats());
  private m_Active = false;
  private m_Activate = false;
  private m_ScreenshotTime = -1;

  override OnReset(): void {
    for (const s of this.m_aStats) s.Reset();
    this.m_Active = false;
    this.m_Activate = false;
    this.m_ScreenshotTime = -1;
  }

  IsActive(): boolean {
    if (this.Config().m_ClAutoStatScreenshot && this.m_ScreenshotTime > -1 && this.m_ScreenshotTime < this.Client().time_get()) return true;
    return this.m_Active;
  }
  override OnRelease(): void { this.m_Active = false; }

  override OnConsoleInit(): void {
    this.Console().Register('+stats', '', CFGFLAG_CLIENT, (r) => {
      if (!r.GetInteger(0)) {
        this.m_Activate = false;
        this.m_Active = false;
      } else if (!this.m_Active) this.m_Activate = true;
    }, this, 'Show stats');
  }

  override OnMessage(MsgType: number, pRawMsg: CNetMsg): void {
    if (MsgType !== P.NETMSGTYPE_SV_KILLMSG) return;
    const m = pRawMsg as P.CNetMsg_Sv_KillMsg;
    const V = this.m_aStats[m.m_Victim];
    if (m.m_Weapon !== -3) V.m_Deaths++;
    V.m_CurrentSpree = 0;
    if (m.m_Weapon >= 0) V.m_aDeathsFrom[m.m_Weapon]++;
    if (m.m_ModeSpecial & 1 && m.m_Weapon !== -3) V.m_DeathsCarrying++;
    if (m.m_Victim !== m.m_Killer) {
      const K = this.m_aStats[m.m_Killer];
      if (!K) return;
      K.m_Frags++;
      K.m_CurrentSpree++;
      if (K.m_CurrentSpree > K.m_BestSpree) K.m_BestSpree = K.m_CurrentSpree;
      if (m.m_Weapon >= 0) K.m_aFragsWith[m.m_Weapon]++;
      if (m.m_ModeSpecial & 1) K.m_CarriersKilled++;
      if (m.m_ModeSpecial & 2) K.m_KillsCarrying++;
    } else if (m.m_Weapon !== -3) V.m_Suicides++;
  }

  override OnRender(): void {
    const gc = this.m_pClient, cfg = this.Config(), G = this.Graphics(), T = this.TextRender(), RT = this.RenderTools();
    if (cfg.m_ClAutoStatScreenshot) {
      if (this.m_ScreenshotTime < 0 && gc.m_Snap.m_pGameData && gc.m_Snap.m_pGameData.m_GameStateFlags & P.GAMESTATEFLAG_GAMEOVER)
        this.m_ScreenshotTime = this.Client().time_get() + TIME_FREQ * 3;
    }
    if (gc.m_pMenus.IsActive()) return;
    if (this.m_Activate) {
      this.m_Active = true;
      this.m_Activate = false;
    }
    if (!this.IsActive()) return;
    const Width = 400 * 3 * G.ScreenAspect(), Height = 400 * 3;
    let w = 250;
    const h = 750;
    const apPlayers: number[] = [];
    for (let i = 0; i < MAX_CLIENTS; i++) if (gc.m_aClients[i].m_Active && gc.m_aClients[i].m_Team !== P.TEAM_SPECTATORS) apPlayers.push(i);
    const NumPlayers = apPlayers.length;
    const inf = cfg.m_ClStatboardInfos;
    const flags = (gc.m_GameInfo.m_GameFlags & P.GAMEFLAG_FLAGS) !== 0;
    for (let i = 0; i < 9; i++)
      if (inf & (1 << i)) {
        if (1 << i === TC_STATS_DEATHS && inf & TC_STATS_FRAGS) {
          w += 60;
          continue;
        } else if (1 << i === TC_STATS_BESTSPREE) {
          w += !(inf & TC_STATS_SPREE) ? 140 : 40;
          continue;
        } else if (1 << i === TC_STATS_FLAGGRABS && !flags) continue;
        w += 100;
      }
    if (flags && inf & TC_STATS_FLAGCAPTURES) w += 100;
    const aDisplayWeapon = new Array(P.NUM_WEAPONS).fill(false);
    let NoDisplayedWeapon = true;
    if (inf & TC_STATS_WEAPS) {
      for (const p of apPlayers) for (let j = 0; j < P.NUM_WEAPONS; j++) aDisplayWeapon[j] = aDisplayWeapon[j] || this.m_aStats[p].m_aFragsWith[j] || this.m_aStats[p].m_aDeathsFrom[j];
      for (let i = 0; i < P.NUM_WEAPONS; i++)
        if (aDisplayWeapon[i]) {
          w += 80;
          NoDisplayedWeapon = false;
        }
      if (!NoDisplayedWeapon) w += 10;
    }
    const x = Width / 2 - w / 2;
    let y = 200;
    G.MapScreen(0, 0, Width, Height);
    G.BlendNormal();
    RT.DrawRoundRect(new CUIRect(x - 10, y - 10, w, h), v4(0, 0, 0, 0.5), 17);
    let px = 325;
    T.Text(0, x + 10, y - 5, 20, Localize('Name'), -1);
    const apHeaders = ['K', 'D', Localize('Suicides'), Localize('Ratio'), Localize('Net', 'Net score'), Localize('FPM'), Localize('Spree'), Localize('Best spree'), Localize('Grabs', 'Flag grabs')];
    for (let i = 0; i < 9; i++)
      if (inf & (1 << i)) {
        let pText = apHeaders[i];
        if (1 << i === TC_STATS_FRAGS && inf & TC_STATS_DEATHS) {
          pText = 'K:D';
          px += 60;
        } else if (1 << i === TC_STATS_DEATHS && inf & TC_STATS_FRAGS) continue;
        if (1 << i === TC_STATS_BESTSPREE) {
          if (inf & TC_STATS_SPREE) continue;
          px += 40;
        } else if (1 << i === TC_STATS_SPREE && inf & TC_STATS_BESTSPREE) px += 40;
        if (1 << i === TC_STATS_FLAGGRABS && !(gc.m_Snap.m_pGameData && flags)) continue;
        T.Text(0, x + px - T.TextWidth(0, 20, pText, -1, -1), y - 5, 20, pText, -1);
        px += 100;
      }
    if (inf & TC_STATS_WEAPS) {
      G.TextureSet(ImageTex(C.IMAGE_GAME));
      G.QuadsBegin();
      for (let i = 0; i < P.NUM_WEAPONS; i++) {
        if (!aDisplayWeapon[i]) continue;
        const W = C.g_pData.m_Weapons.m_aId[i];
        RT.SelectSprite(W.m_pSpriteBody);
        RT.DrawSprite(x + px - 40, y + 10, i === 0 ? W.m_VisualSize * 0.8 : W.m_VisualSize);
        px += 80;
      }
      G.QuadsEnd();
      if (!NoDisplayedWeapon) px += 10;
    }
    if (gc.m_Snap.m_pGameData && flags && inf & TC_STATS_FLAGCAPTURES) {
      px -= 40;
      G.TextureSet(ImageTex(C.IMAGE_GAME));
      G.QuadsBegin();
      G.QuadsSetRotation(-0.39);
      RT.SelectSprite(C.SPRITE_FLAG_BLUE, SPRITE_FLAG_FLIP_X);
      RT.DrawSprite(x + px - 10, y + 12.5, 48);
      G.QuadsSetRotation(0.39);
      RT.SelectSprite(C.SPRITE_FLAG_RED);
      RT.DrawSprite(x + px + 10, y + 12.5, 48);
      G.QuadsEnd();
    }
    y += 29;
    let FontSize = 30, LineHeight = 50, TeeSizemod = 1, TeeOffset = 0;
    if (NumPlayers > 14) {
      FontSize = 30;
      LineHeight = 40;
      TeeSizemod = 0.8;
      TeeOffset = -5;
    }
    const right = (s: string): void => T.Text(0, x - T.TextWidth(0, FontSize, s, -1, -1) + px, y, FontSize, s, -1);
    for (let j = 0; j < NumPlayers; j++) {
      if (j === 16) {
        T.Text(0, x + 64, y, FontSize, str_format(128, '... %d other players', NumPlayers - j), -1);
        px += 100;
        break;
      }
      const s = this.m_aStats[apPlayers[j]];
      const HighlightedLine = apPlayers[j] === gc.m_LocalClientID || (gc.m_Snap.m_SpecInfo.m_Active && apPlayers[j] === gc.m_Snap.m_SpecInfo.m_SpectatorID);
      if (HighlightedLine) RT.DrawRoundRect(new CUIRect(x, y, w - 20, LineHeight * 0.95), v4(1, 1, 1, 0.25), 17);
      const Teeinfo = gc.m_aClients[apPlayers[j]].m_RenderInfo.copy();
      Teeinfo.m_Size *= TeeSizemod;
      RT.RenderTee(CAnimState.GetIdle(), Teeinfo, P.EMOTE_NORMAL, new vec2(1, 0), new vec2(x + 28, y + 28 + TeeOffset));
      const Cursor = new CTextCursor();
      T.SetCursor(Cursor, x + 64, y, FontSize, TEXTFLAG_RENDER | TEXTFLAG_STOP_AT_END);
      Cursor.m_LineWidth = 220;
      T.TextEx(Cursor, gc.m_aClients[apPlayers[j]].m_aName, -1);
      px = 325;
      if (inf & TC_STATS_FRAGS) {
        let aBuf: string;
        if (inf & TC_STATS_DEATHS) {
          px += 60;
          aBuf = `${s.m_Frags}:${s.m_Deaths}`;
        } else aBuf = String(s.m_Frags);
        right(aBuf);
        px += 100;
      } else if (inf & TC_STATS_DEATHS) {
        right(String(s.m_Deaths));
        px += 100;
      }
      if (inf & TC_STATS_SUICIDES) {
        right(String(s.m_Suicides));
        px += 100;
      }
      if (inf & TC_STATS_RATIO) {
        right(s.m_Deaths === 0 ? '--' : str_format(128, '%.2f', f(s.m_Frags / s.m_Deaths)));
        px += 100;
      }
      if (inf & TC_STATS_NET) {
        right(str_format(128, '%+d', s.m_Frags - s.m_Deaths));
        px += 100;
      }
      if (inf & TC_STATS_FPM) {
        const Fpm = s.m_IngameTicks > 0 ? f((s.m_Frags * this.Client().GameTickSpeed() * 60) / s.m_IngameTicks) : 0;
        right(str_format(128, '%.1f', Fpm));
        px += 100;
      }
      if (inf & TC_STATS_SPREE) {
        let aBuf: string;
        if (inf & TC_STATS_BESTSPREE) {
          px += 40;
          aBuf = `${s.m_CurrentSpree} (${s.m_BestSpree})`;
        } else aBuf = String(s.m_CurrentSpree);
        right(aBuf);
        px += 100;
      } else if (inf & TC_STATS_BESTSPREE) {
        px += 40;
        right(String(s.m_BestSpree));
        px += 100;
      }
      if (gc.m_Snap.m_pGameData && flags && inf & TC_STATS_FLAGGRABS) {
        right(String(s.m_FlagGrabs));
        px += 100;
      }
      px -= 40;
      if (inf & TC_STATS_WEAPS) {
        const BarHeight = 0.3 * LineHeight, Offset = 40;
        const StartX = px - Offset, RoundSize = BarHeight / 2;
        let EndX = StartX, TotalFrags = 0;
        for (let i = 0; i < P.NUM_WEAPONS; i++)
          if (aDisplayWeapon[i]) {
            EndX += 80;
            TotalFrags += s.m_aFragsWith[i];
          }
        const ExploitableLength = EndX - StartX - RoundSize;
        const Rect = new CUIRect(x + StartX, y + 0.3 * LineHeight, 0, BarHeight);
        for (let i = 0; i < P.NUM_WEAPONS; i++) {
          if (s.m_aFragsWith[i]) {
            Rect.w = (ExploitableLength * s.m_aFragsWith[i]) / TotalFrags + RoundSize;
            RT.DrawRoundRect(Rect, WEAPON_COLORS[i], RoundSize);
            Rect.w -= RoundSize;
            Rect.x += Rect.w;
          }
        }
        px = EndX + Offset;
        if (!NoDisplayedWeapon) px += 10;
      }
      if (gc.m_Snap.m_pGameData && flags && inf & TC_STATS_FLAGCAPTURES) {
        if (s.m_FlagCaptures <= 0) T.Text(0, x - T.TextWidth(0, FontSize, '--', -1, -1) / 2 + px, y, FontSize, '--', -1);
        else {
          const DigitalDisplay = s.m_FlagCaptures > 5;
          const DisplayedFlagsCount = !DigitalDisplay ? s.m_FlagCaptures : 1;
          const Space = 15;
          let TempX = Math.trunc(px - ((DisplayedFlagsCount - 1) * Space) / 2);
          TempX = Math.trunc(TempX + 2.5);
          if (DigitalDisplay) TempX -= 20;
          G.TextureSet(ImageTex(C.IMAGE_GAME));
          G.QuadsBegin();
          for (let n = 0; n < DisplayedFlagsCount; n++) {
            G.QuadsSetRotation(0.18);
            RT.SelectSprite(gc.m_aClients[apPlayers[j]].m_Team === P.TEAM_RED ? C.SPRITE_FLAG_BLUE : C.SPRITE_FLAG_RED);
            RT.DrawSprite(x + TempX, y + 25, 48);
            TempX += Space;
          }
          G.QuadsEnd();
          if (DigitalDisplay) T.Text(0, x + TempX, y, FontSize, `x${s.m_FlagCaptures}`, -1);
        }
        px += 100;
      }
      y += LineHeight;
    }
  }

  UpdatePlayTime(Ticks: number): void {
    for (let i = 0; i < MAX_CLIENTS; i++) {
      const c = this.m_pClient.m_aClients[i];
      if (c.m_Active && c.m_Team !== P.TEAM_SPECTATORS) this.m_aStats[i].m_IngameTicks += Ticks;
    }
  }
  OnMatchStart(): void { this.OnReset(); }
  OnFlagGrab(ClientID: number): void { this.m_aStats[ClientID].m_FlagGrabs++; }
  OnFlagCapture(ClientID: number): void { this.m_aStats[ClientID].m_FlagCaptures++; }
  OnPlayerEnter(ClientID: number, _Team: number): void { this.m_aStats[ClientID].Reset(); }
  OnPlayerLeave(ClientID: number): void { this.m_aStats[ClientID].Reset(); }
  GetPlayerStats(ClientID: number): CPlayerStats { return this.m_aStats[ClientID]; }
}
