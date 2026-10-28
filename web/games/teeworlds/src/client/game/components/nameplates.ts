// (c) Magnus Auvinen. See licence.txt in the root of the distribution for more information.
// If you are missing that file, acquire a complete release at teeworlds.com.
// Altered: game/client/components/nameplates.h and nameplates.cpp of Teeworlds 0.7.5 in TypeScript.
import { vec2, mix, clamp, distance, powf, f, v4 } from './common.ts';
import * as P from '../../../generated/protocol.ts';
import { MAX_CLIENTS } from '../../../engine/shared/protocol.ts';
import { SNAP_CURRENT, STATE_ONLINE } from '../../engine/client.ts';
import { CTextCursor, TEXTFLAG_RENDER } from '../../engine/text.ts';
import { CComponent } from '../component.ts';

export class CNamePlates extends CComponent {
  private RenderNameplate(pPrevChar: P.CNetObj_Character, pPlayerChar: P.CNetObj_Character, ClientID: number): void {
    const gc = this.m_pClient, cfg = this.Config(), T = this.TextRender();
    const IntraTick = this.Client().IntraGameTick();
    const Position = new vec2(mix(pPrevChar.m_X, pPlayerChar.m_X, IntraTick), mix(pPrevChar.m_Y, pPlayerChar.m_Y, IntraTick));
    const FontSize = 18 + (20 * cfg.m_ClNameplatesSize) / 100;
    if (gc.m_LocalClientID === ClientID) return;
    let a = 1;
    if (cfg.m_ClNameplatesAlways === 0) a = clamp(1 - powf(f(distance(gc.m_pControls.m_TargetPos, Position) / 200), 16), 0, 1);
    const aName = cfg.m_ClShowsocial ? gc.m_aClients[ClientID].m_aName : '';
    const Cursor = new CTextCursor();
    const tw = T.TextWidth(0, FontSize, aName, -1, -1) + this.RenderTools().GetClientIdRectSize(FontSize);
    T.SetCursor(Cursor, Position.x - tw / 2, Position.y - FontSize - 38, FontSize, TEXTFLAG_RENDER);
    T.TextOutlineColor(0, 0, 0, 0.5 * a);
    T.TextColor(1, 1, 1, a);
    const team = cfg.m_ClNameplatesTeamcolors && gc.m_GameInfo.m_GameFlags & P.GAMEFLAG_TEAMS ? gc.m_aClients[ClientID].m_Team : null;
    if (team === P.TEAM_RED) T.TextColor(1, 0.5, 0.5, a);
    else if (team === P.TEAM_BLUE) T.TextColor(0.7, 0.7, 1, a);
    const IdTextColor = v4(0.1, 0.1, 0.1, a);
    let BgIdColor = v4(1, 1, 1, a * 0.5);
    if (team === P.TEAM_RED) BgIdColor = v4(1, 0.5, 0.5, a * 0.5);
    else if (team === P.TEAM_BLUE) BgIdColor = v4(0.7, 0.7, 1, a * 0.5);
    if (a > 0.001) {
      this.RenderTools().DrawClientID(T, Cursor, ClientID, BgIdColor, IdTextColor);
      T.TextEx(Cursor, aName, -1);
    }
    T.TextColor(1, 1, 1, 1);
    T.TextOutlineColor(0, 0, 0, 0.3);
  }

  override OnRender(): void {
    if (!this.Config().m_ClNameplates || this.Client().State() < STATE_ONLINE) return;
    for (let i = 0; i < MAX_CLIENTS; i++) {
      const c = this.m_pClient.m_Snap.m_aCharacters[i];
      if (!c.m_Active) continue;
      if (this.Client().SnapFindItem(SNAP_CURRENT, P.NETOBJTYPE_PLAYERINFO, i)) this.RenderNameplate(c.m_Prev, c.m_Cur, i);
    }
  }
}
