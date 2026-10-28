// (c) Magnus Auvinen. See licence.txt in the root of the distribution for more information.
// If you are missing that file, acquire a complete release at teeworlds.com.
// Altered: game/client/components/spectator.h and spectator.cpp of Teeworlds 0.7.5 in TypeScript. While the
// pointer is not locked, the selector follows the system cursor.
import { vec2, clamp, v4, Localize, ImageTex } from './common.ts';
import * as C from '../../../generated/content.ts';
import * as P from '../../../generated/protocol.ts';
import { CFGFLAG_CLIENT } from '../../../generated/config.ts';
import { MAX_CLIENTS, MSGFLAG_VITAL } from '../../../engine/shared/protocol.ts';
import { CQuadItem } from '../../engine/graphics.ts';
import { CTextCursor, TEXTFLAG_RENDER } from '../../engine/text.ts';
import { CUIRect } from '../ui.ts';
import { CAnimState, SPRITE_FLAG_FLIP_X } from '../render.ts';
import { CComponent } from '../component.ts';

const NO_SELECTION = -1;

export class CSpectator extends CComponent {
  private m_Active = false;
  private m_WasActive = false;
  private m_SelectedSpectatorID = -1;
  private m_SelectedSpecMode = NO_SELECTION;
  private m_SelectorMouse = new vec2(0, 0);

  private localTeam(): number {
    const gc = this.m_pClient;
    return gc.m_LocalClientID >= 0 ? gc.m_aClients[gc.m_LocalClientID].m_Team : P.TEAM_SPECTATORS;
  }

  private SpecModePossible(SpecMode: number, i: number): boolean {
    const gc = this.m_pClient;
    switch (SpecMode) {
      case P.SPEC_PLAYER: {
        if (!gc.m_aClients[i].m_Active || gc.m_aClients[i].m_Team === P.TEAM_SPECTATORS) return false;
        const pi = gc.m_Snap.m_paPlayerInfos[i];
        if (this.localTeam() !== P.TEAM_SPECTATORS && (i === gc.m_LocalClientID || this.localTeam() !== gc.m_aClients[i].m_Team || (pi && pi.m_PlayerFlags & P.PLAYERFLAG_DEAD)))
          return false;
        return true;
      }
      case P.SPEC_FLAGRED:
      case P.SPEC_FLAGBLUE: return (gc.m_GameInfo.m_GameFlags & P.GAMEFLAG_FLAGS) !== 0;
      case P.SPEC_FREEVIEW: return this.localTeam() === P.TEAM_SPECTATORS;
      default: return false;
    }
  }

  private HandleSpectateNextPrev(Direction: number): void {
    const S = this.m_pClient.m_Snap.m_SpecInfo;
    if (!S.m_Active) return;
    let NewSpecMode = S.m_SpecMode;
    let NewSpectatorID = NewSpecMode === P.SPEC_PLAYER ? S.m_SpectatorID : -1;
    for (let i = 0; i < P.NUM_SPECMODES + MAX_CLIENTS; i++) {
      // IterateSpecMode
      let done = false;
      if (NewSpecMode === P.SPEC_PLAYER) {
        NewSpectatorID += Direction;
        if (NewSpectatorID >= 0 && NewSpectatorID < MAX_CLIENTS) done = true;
        else NewSpectatorID = -1;
      }
      if (!done) {
        NewSpecMode = (NewSpecMode + Direction + P.NUM_SPECMODES) % P.NUM_SPECMODES;
        if (NewSpecMode === P.SPEC_PLAYER) NewSpectatorID = Direction === -1 ? MAX_CLIENTS - 1 : 0;
      }
      if (this.SpecModePossible(NewSpecMode, NewSpectatorID)) {
        this.Spectate(NewSpecMode, NewSpectatorID);
        return;
      }
    }
  }

  override OnConsoleInit(): void {
    const Co = this.Console();
    Co.Register('+spectate', '', CFGFLAG_CLIENT, (r) => { if (this.m_pClient.m_Snap.m_SpecInfo.m_Active) this.m_Active = r.GetInteger(0) !== 0; }, this, 'Open spectator mode selector');
    Co.Register('spectate', 'i[mode] i[target]', CFGFLAG_CLIENT, (r) => { if (this.m_pClient.m_Snap.m_SpecInfo.m_Active) this.Spectate(r.GetInteger(0), r.GetInteger(1)); }, this, 'Switch spectator mode');
    Co.Register('spectate_next', '', CFGFLAG_CLIENT, () => this.HandleSpectateNextPrev(1), this, 'Spectate the next player');
    Co.Register('spectate_previous', '', CFGFLAG_CLIENT, () => this.HandleSpectateNextPrev(-1), this, 'Spectate the previous player');
  }

  override OnMouseMove(x: number, y: number): boolean {
    if (!this.m_Active) return false;
    const m = { x, y };
    this.UI().ConvertMouseMove(m);
    this.m_SelectorMouse = this.m_SelectorMouse.add(new vec2(m.x, m.y));
    return true;
  }

  override OnRelease(): void { this.OnReset(); }

  override OnRender(): void {
    const gc = this.m_pClient, S = gc.m_Snap, G = this.Graphics(), T = this.TextRender(), RT = this.RenderTools();
    if (!this.m_Active) {
      if (this.m_WasActive) {
        if (this.m_SelectedSpecMode !== NO_SELECTION) this.Spectate(this.m_SelectedSpecMode, this.m_SelectedSpectatorID);
        this.m_WasActive = false;
      }
      return;
    }
    if (!S.m_SpecInfo.m_Active) {
      this.m_Active = false;
      this.m_WasActive = false;
      return;
    }
    this.m_WasActive = true;
    this.m_SelectedSpecMode = NO_SELECTION;
    this.m_SelectedSpectatorID = -1;
    const LocalTeam = this.localTeam();
    let TotalCount = 0;
    for (let i = 0; i < MAX_CLIENTS; ++i) {
      const pi = S.m_paPlayerInfos[i];
      if (!pi || gc.m_aClients[i].m_Team === P.TEAM_SPECTATORS ||
        (LocalTeam !== P.TEAM_SPECTATORS && (pi.m_PlayerFlags & P.PLAYERFLAG_DEAD || LocalTeam !== gc.m_aClients[i].m_Team || i === gc.m_LocalClientID))) continue;
      TotalCount++;
    }
    let ColumnSize = 8, ScaleX = 1, ScaleY = 1;
    if (TotalCount > 16) {
      ColumnSize = 16;
      ScaleY = 0.5;
    }
    if (TotalCount > 48) ScaleX = 2;
    else if (TotalCount > 32) ScaleX = 1.5;
    const Width = 400 * 3 * G.ScreenAspect(), Height = 400 * 3;
    G.MapScreen(0, 0, Width, Height);
    const Rect = new CUIRect(Width / 2 - 300 * ScaleX, Height / 2 - 300, 600 * ScaleX, 600);
    G.BlendNormal();
    RT.DrawRoundRect(Rect, v4(0, 0, 0, 0.3), 20);
    if (!this.Input().locked()) {
      const p = this.Input().AbsolutePos();
      this.m_SelectorMouse = new vec2((p.x / G.ScreenWidth() - 0.5) * Width, (p.y / G.ScreenHeight() - 0.5) * Height);
    }
    this.m_SelectorMouse = new vec2(clamp(this.m_SelectorMouse.x, -300 * ScaleX + 20, 300 * ScaleX - 20), clamp(this.m_SelectorMouse.y, -280, 280));
    const M = this.m_SelectorMouse;
    const FontSize = 20, StartY = -210 + 20 * ScaleY, LineHeight = 60 * ScaleY;
    let Selected = false;
    if (LocalTeam === P.TEAM_SPECTATORS) {
      if (S.m_SpecInfo.m_SpecMode === P.SPEC_FREEVIEW) RT.DrawRoundRect(new CUIRect(Width / 2 - 280, Height / 2 - 280, 270, 60), v4(1, 1, 1, 0.25), 20);
      if (M.x >= -280 && M.x <= -10 && M.y >= -280 && M.y <= -220) {
        this.m_SelectedSpecMode = P.SPEC_FREEVIEW;
        Selected = true;
      }
      T.TextColor(1, 1, 1, Selected ? 1 : 0.5);
      T.Text(0, Width / 2 - 240, Height / 2 - 265, FontSize, Localize('Free-View'), -1);
    }
    let x = 20, y = -270;
    if (gc.m_GameInfo.m_GameFlags & P.GAMEFLAG_FLAGS) {
      for (let Flag = P.SPEC_FLAGRED; Flag <= P.SPEC_FLAGBLUE; ++Flag) {
        if (S.m_SpecInfo.m_SpecMode === Flag) RT.DrawRoundRect(new CUIRect(Width / 2 + x - 10, Height / 2 + y - 10, 120, 60), v4(1, 1, 1, 0.25), 20);
        Selected = false;
        if (M.x >= x - 10 && M.x <= x + 110 && M.y >= y - 10 && M.y <= y + 50) {
          this.m_SelectedSpecMode = Flag;
          Selected = true;
        }
        G.BlendNormal();
        G.TextureSet(ImageTex(C.IMAGE_GAME));
        G.QuadsBegin();
        RT.SelectSprite(Flag === P.SPEC_FLAGRED ? C.SPRITE_FLAG_RED : C.SPRITE_FLAG_BLUE);
        const Size = 60 / 1.5 + (Selected ? 12 : 8);
        G.QuadsDrawTL([new CQuadItem(Width / 2 + x + 40 + (Selected ? -3 : -2), Height / 2 + y + (Selected ? -6 : -4), Size / 2, Size)], 1);
        G.QuadsEnd();
        x += 140;
      }
    }
    x = -300 * ScaleX + 30;
    y = StartY;
    for (let i = 0, Count = 0; i < MAX_CLIENTS; ++i) {
      const pi = S.m_paPlayerInfos[i];
      if (!pi || gc.m_aClients[i].m_Team === P.TEAM_SPECTATORS || pi.m_PlayerFlags & P.PLAYERFLAG_DEAD ||
        (LocalTeam !== P.TEAM_SPECTATORS && (LocalTeam !== gc.m_aClients[i].m_Team || i === gc.m_LocalClientID))) continue;
      if (Count !== 0 && Count % ColumnSize === 0) {
        x += 290;
        y = StartY;
      }
      Count++;
      if (S.m_SpecInfo.m_SpecMode === P.SPEC_PLAYER && S.m_SpecInfo.m_SpectatorID === i)
        RT.DrawRoundRect(new CUIRect(Width / 2 + x - 10, Height / 2 + y + 10 - 20 * ScaleY, 270, 20 + 40 * ScaleY), v4(1, 1, 1, 0.25), 20);
      Selected = false;
      if (M.x >= x - 10 && M.x <= x + 260 && M.y >= y - 10 && M.y <= y - 10 + LineHeight) {
        this.m_SelectedSpecMode = P.SPEC_PLAYER;
        this.m_SelectedSpectatorID = i;
        Selected = true;
      }
      T.TextColor(1, 1, 1, Selected ? 1 : 0.5);
      const Cursor = new CTextCursor();
      T.SetCursor(Cursor, Width / 2 + x + 50, Height / 2 + y + 5, FontSize, TEXTFLAG_RENDER);
      RT.DrawClientID(T, Cursor, i);
      T.TextEx(Cursor, this.Config().m_ClShowsocial ? gc.m_aClients[i].m_aName : '', -1);
      const gf = S.m_pGameDataFlag;
      if (gc.m_GameInfo.m_GameFlags & P.GAMEFLAG_FLAGS && gf && (gf.m_FlagCarrierRed === i || gf.m_FlagCarrierBlue === i)) {
        G.BlendNormal();
        G.TextureSet(ImageTex(C.IMAGE_GAME));
        G.QuadsBegin();
        RT.SelectSprite(i === gf.m_FlagCarrierBlue ? C.SPRITE_FLAG_BLUE : C.SPRITE_FLAG_RED, SPRITE_FLAG_FLIP_X);
        const Size = LineHeight;
        G.QuadsDrawTL([new CQuadItem(Width / 2 + x + 20 - Size / 4, Height / 2 + y + 20 - Size / 1.5, Size / 2, Size)], 1);
        G.QuadsEnd();
      }
      const TeeInfo = gc.m_aClients[i].m_RenderInfo.copy();
      TeeInfo.m_Size *= ScaleY;
      RT.RenderTee(CAnimState.GetIdle(), TeeInfo, P.EMOTE_NORMAL, new vec2(1, 0), new vec2(Width / 2 + x + 20, Height / 2 + y + 20));
      y += LineHeight;
    }
    T.TextColor(1, 1, 1, 1);
    G.TextureSet(ImageTex(C.IMAGE_CURSOR));
    G.WrapClamp();
    G.QuadsBegin();
    G.SetColor(1, 1, 1, 1);
    G.QuadsDrawTL([new CQuadItem(M.x + Width / 2, M.y + Height / 2, 48, 48)], 1);
    G.QuadsEnd();
    G.WrapNormal();
  }

  override OnReset(): void {
    this.m_WasActive = false;
    this.m_Active = false;
    this.m_SelectedSpecMode = NO_SELECTION;
    this.m_SelectedSpectatorID = -1;
  }

  Spectate(SpecMode: number, SpectatorID: number): void {
    const S = this.m_pClient.m_Snap.m_SpecInfo;
    if (S.m_SpecMode === SpecMode && (SpecMode !== P.SPEC_PLAYER || S.m_SpectatorID === SpectatorID)) return;
    this.m_pClient.SendMsg(P.NETMSGTYPE_CL_SETSPECTATORMODE, P.pack_CNetMsg_Cl_SetSpectatorMode, { m_SpecMode: SpecMode, m_SpectatorID: SpectatorID }, MSGFLAG_VITAL);
  }
}
