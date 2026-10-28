// (c) Magnus Auvinen. See licence.txt in the root of the distribution for more information.
// If you are missing that file, acquire a complete release at teeworlds.com.
// Altered: game/client/components/emoticon.h and emoticon.cpp of Teeworlds 0.7.5 in TypeScript. While the
// pointer is not locked, the selector follows the system cursor.
import { vec2, length, normalize, angle, pi, cosf, sinf, ImageTex } from './common.ts';
import * as C from '../../../generated/content.ts';
import * as P from '../../../generated/protocol.ts';
import { CFGFLAG_CLIENT } from '../../../generated/config.ts';
import { MSGFLAG_VITAL } from '../../../engine/shared/protocol.ts';
import { CQuadItem, CFreeformItem } from '../../engine/graphics.ts';
import { STATE_ONLINE } from '../../engine/client.ts';
import { CComponent } from '../component.ts';

export class CEmoticon extends CComponent {
  private m_WasActive = false;
  private m_Active = false;
  private m_SelectorMouse = new vec2(0, 0);
  private m_SelectedEmote = -1;

  override OnConsoleInit(): void {
    this.Console().Register('+emote', '', CFGFLAG_CLIENT, (r) => {
      if (!this.m_pClient.m_Snap.m_SpecInfo.m_Active) this.m_Active = r.GetInteger(0) !== 0;
    }, this, 'Open emote selector');
    this.Console().Register('emote', 'i[emote-id]', CFGFLAG_CLIENT, (r) => this.Emote(r.GetInteger(0)), this, 'Use emote');
  }

  override OnReset(): void {
    this.m_WasActive = false;
    this.m_Active = false;
    this.m_SelectedEmote = -1;
  }
  override OnRelease(): void { this.m_Active = false; }

  override OnMouseMove(x: number, y: number): boolean {
    if (!this.m_Active) return false;
    const m = { x, y };
    this.UI().ConvertMouseMove(m);
    this.m_SelectorMouse = this.m_SelectorMouse.add(new vec2(m.x, m.y));
    return true;
  }

  private DrawCircle(x: number, y: number, r: number, Segments: number): void {
    const A: CFreeformItem[] = [];
    for (let i = 0; i < Segments; i += 2) {
      const a1 = (i / Segments) * 2 * pi, a2 = ((i + 1) / Segments) * 2 * pi, a3 = ((i + 2) / Segments) * 2 * pi;
      A.push(new CFreeformItem(x, y, x + Math.cos(a1) * r, y + Math.sin(a1) * r, x + Math.cos(a3) * r, y + Math.sin(a3) * r, x + Math.cos(a2) * r, y + Math.sin(a2) * r));
    }
    this.Graphics().QuadsDrawFreeform(A);
  }

  override OnRender(): void {
    const gc = this.m_pClient, G = this.Graphics();
    if (this.Client().State() < STATE_ONLINE) {
      this.m_Active = false;
      this.m_WasActive = false;
      return;
    }
    if (!this.m_Active) {
      if (this.m_WasActive && this.m_SelectedEmote !== -1) this.Emote(this.m_SelectedEmote);
      this.m_WasActive = false;
      return;
    }
    if (gc.m_Snap.m_SpecInfo.m_Active || (gc.m_Snap.m_pGameData && gc.m_Snap.m_pGameData.m_GameStateFlags & P.GAMESTATEFLAG_GAMEOVER)) {
      this.m_Active = false;
      this.m_WasActive = false;
      return;
    }
    if (!this.m_WasActive && !this.Input().locked()) this.m_SelectorMouse = new vec2(0, 0);
    this.m_WasActive = true;
    const Screen = this.UI().Screen();
    if (!this.Input().locked()) {
      const p = this.Input().AbsolutePos();
      this.m_SelectorMouse = new vec2((p.x / G.ScreenWidth() - 0.5) * Screen.w, (p.y / G.ScreenHeight() - 0.5) * Screen.h);
    }
    if (length(this.m_SelectorMouse) > 170) this.m_SelectorMouse = normalize(this.m_SelectorMouse).mul(170);
    let SelectedAngle = angle(this.m_SelectorMouse) + (2 * pi) / 24;
    if (SelectedAngle < 0) SelectedAngle += 2 * pi;
    this.m_SelectedEmote = length(this.m_SelectorMouse) > 110 ? Math.trunc((SelectedAngle / (2 * pi)) * P.NUM_EMOTICONS) : -1;
    G.MapScreen(Screen.x, Screen.y, Screen.w, Screen.h);
    G.BlendNormal();
    G.TextureClear();
    G.QuadsBegin();
    G.SetColor(0, 0, 0, 0.3);
    this.DrawCircle(Screen.w / 2, Screen.h / 2, 190, 64);
    G.QuadsEnd();
    G.TextureSet(ImageTex(C.IMAGE_EMOTICONS));
    G.QuadsBegin();
    for (let i = 0; i < P.NUM_EMOTICONS; i++) {
      let Angle = (2 * pi * i) / P.NUM_EMOTICONS;
      if (Angle > pi) Angle -= 2 * pi;
      const Size = this.m_SelectedEmote === i ? 80 : 50;
      this.RenderTools().SelectSprite(C.SPRITE_OOP + i);
      G.QuadsDraw([new CQuadItem(Screen.w / 2 + 150 * cosf(Angle), Screen.h / 2 + 150 * sinf(Angle), Size, Size)], 1);
    }
    G.QuadsEnd();
    G.TextureSet(ImageTex(C.IMAGE_CURSOR));
    G.WrapClamp();
    G.QuadsBegin();
    G.SetColor(1, 1, 1, 1);
    G.QuadsDrawTL([new CQuadItem(this.m_SelectorMouse.x + Screen.w / 2, this.m_SelectorMouse.y + Screen.h / 2, 24, 24)], 1);
    G.QuadsEnd();
    G.WrapNormal();
  }

  Emote(Emoticon: number): void { this.m_pClient.SendMsg(P.NETMSGTYPE_CL_EMOTICON, P.pack_CNetMsg_Cl_Emoticon, { m_Emoticon: Emoticon }, MSGFLAG_VITAL); }
}
