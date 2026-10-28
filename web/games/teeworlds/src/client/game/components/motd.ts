// (c) Magnus Auvinen. See licence.txt in the root of the distribution for more information.
// If you are missing that file, acquire a complete release at teeworlds.com.
// Altered: game/client/components/motd.h and motd.cpp of Teeworlds 0.7.5 in TypeScript.
import { v4 } from './common.ts';
import * as P from '../../../generated/protocol.ts';
import { TIME_FREQ } from '../../../engine/shared/network.ts';
import { STATE_OFFLINE, STATE_ONLINE } from '../../engine/client.ts';
import { CTextCursor, TEXTFLAG_RENDER } from '../../engine/text.ts';
import { FLAG_PRESS, type CEvent } from '../../engine/input.ts';
import { KEY_ESCAPE } from '../../engine/keys.ts';
import { CUIRect } from '../ui.ts';
import { CComponent } from '../component.ts';
import type { CNetMsg } from '../gameclient.ts';

export class CMotd extends CComponent {
  private m_ServerMotdTime = 0;
  private m_aServerMotd = '';

  Clear(): void { this.m_ServerMotdTime = 0; }
  GetMotd(): string { return this.m_aServerMotd; }
  IsActive(): boolean {
    if (this.m_pClient.m_pMenus.IsActive()) return false;
    return this.Client().time_get() < this.m_ServerMotdTime;
  }

  override OnStateChange(_NewState: number, OldState: number): void {
    if (OldState === STATE_ONLINE || OldState === STATE_OFFLINE) this.Clear();
  }

  override OnRender(): void {
    if (!this.IsActive()) return;
    const G = this.Graphics();
    const Width = 400 * 3 * G.ScreenAspect(), Height = 400 * 3;
    G.MapScreen(0, 0, Width, Height);
    const h = 800, w = 650;
    const Rect = new CUIRect(Width / 2 - w / 2, 150, w, h);
    G.BlendNormal();
    this.RenderTools().DrawRoundRect(Rect, v4(0, 0, 0, 0.5), 30);
    Rect.Margin(30, Rect);
    const TextSize = 32;
    const Cursor = new CTextCursor();
    this.TextRender().SetCursor(Cursor, Rect.x, Rect.y, TextSize, TEXTFLAG_RENDER);
    Cursor.m_LineWidth = Rect.w;
    Cursor.m_MaxLines = Math.ceil(Rect.h / TextSize);
    this.TextRender().TextEx(Cursor, this.m_aServerMotd, -1);
  }

  override OnMessage(MsgType: number, pRawMsg: CNetMsg): void {
    if (MsgType !== P.NETMSGTYPE_SV_MOTD) return;
    const pMsg = pRawMsg as P.CNetMsg_Sv_Motd;
    const s = pMsg.m_pMessage.slice(0, 1023).split('');
    for (let i = 0; i < s.length; i++) {
      if (s[i] === '\\' && s[i + 1] === 'n') {
        s[i] = ' ';
        s[i + 1] = '\n';
        i++;
      }
    }
    this.m_aServerMotd = s.join('');
    if (this.m_aServerMotd && this.Config().m_ClMotdTime) this.m_ServerMotdTime = this.Client().time_get() + TIME_FREQ * this.Config().m_ClMotdTime;
    else this.m_ServerMotdTime = 0;
  }

  override OnInput(Event: CEvent): boolean {
    if (this.IsActive() && Event.m_Flags & FLAG_PRESS && Event.m_Key === KEY_ESCAPE) {
      this.Clear();
      return true;
    }
    return false;
  }
}
