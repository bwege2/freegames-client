// (c) Magnus Auvinen. See licence.txt in the root of the distribution for more information.
// If you are missing that file, acquire a complete release at teeworlds.com.
// Altered: game/client/components/infomessages.h and infomessages.cpp of Teeworlds 0.7.5 in TypeScript.
import { vec2, str_format, Localize, ImageTex } from './common.ts';
import * as C from '../../../generated/content.ts';
import * as P from '../../../generated/protocol.ts';
import { CQuadItem } from '../../engine/graphics.ts';
import { STATE_ONLINE } from '../../engine/client.ts';
import { CTextCursor, TEXTFLAG_RENDER } from '../../engine/text.ts';
import { OUTPUT_LEVEL_STANDARD } from '../../engine/console.ts';
import { CAnimState, CTeeRenderInfo, SPRITE_FLAG_FLIP_X } from '../render.ts';
import { CComponent } from '../component.ts';
import { FormatTime, FormatTimeDiff, type CNetMsg } from '../gameclient.ts';

const MAX_INFOMSGS = 5, INFOMSG_KILL = 0, INFOMSG_FINISH = 1;

class CInfoMsg {
  m_Type = 0;
  m_Tick = -100000;
  m_Player1ID = 0;
  m_aPlayer1Name = '';
  m_Player1RenderInfo = new CTeeRenderInfo();
  m_Player2ID = 0;
  m_aPlayer2Name = '';
  m_Player2RenderInfo = new CTeeRenderInfo();
  m_Weapon = 0;
  m_ModeSpecial = 0;
  m_FlagCarrierBlue = 0;
  m_Time = 0;
  m_Diff = 0;
  m_RecordPersonal = 0;
  m_RecordServer = 0;
}

export class CInfoMessages extends CComponent {
  private m_aInfoMsgs: CInfoMsg[] = Array.from({ length: MAX_INFOMSGS }, () => new CInfoMsg());
  private m_InfoMsgCurrent = 0;

  override OnReset(): void {
    this.m_InfoMsgCurrent = 0;
    for (const m of this.m_aInfoMsgs) m.m_Tick = -100000;
  }

  private AddInfoMsg(Type: number, NewMsg: CInfoMsg): void {
    NewMsg.m_Type = Type;
    NewMsg.m_Tick = this.Client().GameTick();
    this.m_InfoMsgCurrent = (this.m_InfoMsgCurrent + 1) % MAX_INFOMSGS;
    this.m_aInfoMsgs[this.m_InfoMsgCurrent] = NewMsg;
  }

  override OnMessage(MsgType: number, pRawMsg: CNetMsg): void {
    const gc = this.m_pClient, cfg = this.Config();
    const Race = (gc.m_GameInfo.m_GameFlags & P.GAMEFLAG_RACE) !== 0;
    if (MsgType === P.NETMSGTYPE_SV_KILLMSG) {
      if (Race && gc.m_Snap.m_pGameDataRace && gc.m_Snap.m_pGameDataRace.m_RaceFlags & P.RACEFLAG_HIDE_KILLMSG) return;
      const pMsg = pRawMsg as P.CNetMsg_Sv_KillMsg;
      const Kill = new CInfoMsg();
      Kill.m_Player1ID = pMsg.m_Victim;
      Kill.m_aPlayer1Name = cfg.m_ClShowsocial ? gc.m_aClients[Kill.m_Player1ID].m_aName : '';
      Kill.m_Player1RenderInfo = gc.m_aClients[Kill.m_Player1ID].m_RenderInfo.copy();
      Kill.m_Player2ID = pMsg.m_Killer;
      if (Kill.m_Player2ID >= 0) {
        Kill.m_aPlayer2Name = cfg.m_ClShowsocial ? gc.m_aClients[Kill.m_Player2ID].m_aName : '';
        Kill.m_Player2RenderInfo = gc.m_aClients[Kill.m_Player2ID].m_RenderInfo.copy();
      } else {
        const IsTeamplay = (gc.m_GameInfo.m_GameFlags & P.GAMEFLAG_TEAMS) !== 0;
        const KillerTeam = -1 - Kill.m_Player2ID;
        const Skin = gc.m_pSkins.Find('dummy', false);
        if (Skin !== -1) {
          const pDummy = gc.m_pSkins.Get(Skin);
          for (let p = 0; p < P.NUM_SKINPARTS; p++) {
            Kill.m_Player2RenderInfo.m_aTextures[p] = pDummy.m_apParts[p].m_OrgTexture;
            const c = IsTeamplay ? gc.m_pSkins.GetColorV4(gc.m_pSkins.GetTeamColor(0, 0, KillerTeam, p), p === P.SKINPART_MARKING) : gc.m_pSkins.GetColorV4(0, p === P.SKINPART_MARKING);
            c.a *= 0.5;
            Kill.m_Player2RenderInfo.m_aColors[p] = c;
          }
          Kill.m_Player2RenderInfo.m_Size = 64;
        }
      }
      Kill.m_Weapon = pMsg.m_Weapon;
      Kill.m_ModeSpecial = pMsg.m_ModeSpecial;
      Kill.m_FlagCarrierBlue = gc.m_Snap.m_pGameDataFlag ? gc.m_Snap.m_pGameDataFlag.m_FlagCarrierBlue : -1;
      this.AddInfoMsg(INFOMSG_KILL, Kill);
    } else if (MsgType === P.NETMSGTYPE_SV_RACEFINISH && Race) {
      const pMsg = pRawMsg as P.CNetMsg_Sv_RaceFinish;
      let aTime = FormatTime(pMsg.m_Time, gc.RacePrecision());
      const aLabel = gc.GetPlayerLabel(pMsg.m_ClientID, gc.m_aClients[pMsg.m_ClientID].m_aName);
      this.Console().Print(OUTPUT_LEVEL_STANDARD, 'race', str_format(256, '%2d: %s: finished in %s', pMsg.m_ClientID, gc.m_aClients[pMsg.m_ClientID].m_aName, aTime));
      if (pMsg.m_RecordPersonal || pMsg.m_RecordServer) {
        let aBuf = pMsg.m_RecordServer ? str_format(256, Localize("'%s' has set a new map record: %s"), aLabel, aTime) : str_format(256, Localize("'%s' has set a new personal record: %s"), aLabel, aTime);
        if (pMsg.m_Diff < 0) {
          aTime = FormatTimeDiff(Math.abs(pMsg.m_Diff), gc.RacePrecision(), false);
          aBuf = (aBuf + str_format(64, Localize(' (%s seconds faster)'), aTime)).slice(0, 255);
        }
        gc.m_pChat.AddLine(aBuf);
      }
      if (gc.m_Snap.m_pGameDataRace && gc.m_Snap.m_pGameDataRace.m_RaceFlags & P.RACEFLAG_FINISHMSG_AS_CHAT) {
        if (!pMsg.m_RecordPersonal && !pMsg.m_RecordServer) gc.m_pChat.AddLine(str_format(256, Localize("'%s' finished in: %s"), aLabel, aTime));
      } else {
        const Finish = new CInfoMsg();
        Finish.m_Player1ID = pMsg.m_ClientID;
        Finish.m_aPlayer1Name = cfg.m_ClShowsocial ? gc.m_aClients[pMsg.m_ClientID].m_aName : '';
        Finish.m_Player1RenderInfo = gc.m_aClients[Finish.m_Player1ID].m_RenderInfo.copy();
        Finish.m_Time = pMsg.m_Time;
        Finish.m_Diff = pMsg.m_Diff;
        Finish.m_RecordPersonal = pMsg.m_RecordPersonal;
        Finish.m_RecordServer = pMsg.m_RecordServer;
        this.AddInfoMsg(INFOMSG_FINISH, Finish);
      }
    }
  }

  override OnRender(): void {
    if (!this.Config().m_ClShowhud || this.Client().State() < STATE_ONLINE) return;
    const G = this.Graphics();
    const Width = 400 * 3 * G.ScreenAspect(), Height = 400 * 3;
    G.MapScreen(0, 0, Width * 1.5, Height * 1.5);
    const StartX = Width * 1.5 - 10;
    let y = 20;
    for (let i = 1; i <= MAX_INFOMSGS; i++) {
      const m = this.m_aInfoMsgs[(this.m_InfoMsgCurrent + i) % MAX_INFOMSGS];
      if (this.Client().GameTick() > m.m_Tick + 50 * 10) continue;
      if (m.m_Type === INFOMSG_KILL) this.RenderKillMsg(m, StartX, y);
      else if (m.m_Type === INFOMSG_FINISH) this.RenderFinishMsg(m, StartX, y);
      y += 46;
    }
  }

  private flag(blue: boolean, flip: number, x: number, y: number): void {
    const G = this.Graphics();
    G.BlendNormal();
    G.TextureSet(ImageTex(C.IMAGE_GAME));
    G.QuadsBegin();
    this.RenderTools().SelectSprite(blue ? C.SPRITE_FLAG_BLUE : C.SPRITE_FLAG_RED, flip);
    G.QuadsDrawTL([new CQuadItem(x, y - 16, 56 / 2, 56)], 1);
    G.QuadsEnd();
  }

  private RenderKillMsg(m: CInfoMsg, x: number, y: number): void {
    const T = this.TextRender(), RT = this.RenderTools(), G = this.Graphics(), gc = this.m_pClient;
    const FontSize = 36;
    const KillerNameW = T.TextWidth(0, FontSize, m.m_aPlayer2Name, -1, -1) + RT.GetClientIdRectSize(FontSize);
    const VictimNameW = T.TextWidth(0, FontSize, m.m_aPlayer1Name, -1, -1) + RT.GetClientIdRectSize(FontSize);
    x -= VictimNameW;
    const Cursor = new CTextCursor();
    T.SetCursor(Cursor, x, y, FontSize, TEXTFLAG_RENDER);
    RT.DrawClientID(T, Cursor, m.m_Player1ID);
    T.TextEx(Cursor, m.m_aPlayer1Name, -1);
    x -= 24;
    if (gc.m_GameInfo.m_GameFlags & P.GAMEFLAG_FLAGS && m.m_ModeSpecial & 1) this.flag(m.m_Player1ID === m.m_FlagCarrierBlue, 0, x, y);
    RT.RenderTee(CAnimState.GetIdle(), m.m_Player1RenderInfo, P.EMOTE_PAIN, new vec2(-1, 0), new vec2(x, y + 28));
    x -= 32;
    x -= 44;
    if (m.m_Weapon >= 0) {
      G.TextureSet(ImageTex(C.IMAGE_GAME));
      G.QuadsBegin();
      RT.SelectSprite(C.g_pData.m_Weapons.m_aId[m.m_Weapon].m_pSpriteBody);
      RT.DrawSprite(x, y + 28, 96);
      G.QuadsEnd();
    }
    x -= 52;
    if (m.m_Player1ID !== m.m_Player2ID) {
      if (gc.m_GameInfo.m_GameFlags & P.GAMEFLAG_FLAGS && m.m_ModeSpecial & 2) this.flag(m.m_Player2ID === m.m_FlagCarrierBlue, SPRITE_FLAG_FLIP_X, x - 56, y);
      x -= 24;
      RT.RenderTee(CAnimState.GetIdle(), m.m_Player2RenderInfo, P.EMOTE_ANGRY, new vec2(1, 0), new vec2(x, y + 28));
      x -= 32;
      if (m.m_Player2ID >= 0) {
        x -= KillerNameW;
        T.SetCursor(Cursor, x, y, FontSize, TEXTFLAG_RENDER);
        RT.DrawClientID(T, Cursor, m.m_Player2ID);
        T.TextEx(Cursor, m.m_aPlayer2Name, -1);
      }
    }
  }

  private RenderFinishMsg(m: CInfoMsg, x: number, y: number): void {
    const T = this.TextRender(), RT = this.RenderTools(), G = this.Graphics(), gc = this.m_pClient;
    const FontSize = 36;
    const PlayerNameW = T.TextWidth(0, FontSize, m.m_aPlayer1Name, -1, -1) + RT.GetClientIdRectSize(FontSize);
    if (m.m_Diff !== 0) {
      const aBuf = str_format(32, '(%s)', FormatTimeDiff(m.m_Diff, gc.RacePrecision()));
      x -= T.TextWidth(0, FontSize, aBuf, -1, -1);
      if (m.m_Diff < 0) T.TextColor(0.5, 1, 0.5, 1);
      else T.TextColor(1, 0.5, 0.5, 1);
      T.Text(0, x, y, FontSize, aBuf, -1);
      T.TextColor(1, 1, 1, 1);
      x -= 16;
    }
    const aTime = FormatTime(m.m_Time, gc.RacePrecision());
    x -= T.TextWidth(0, FontSize, aTime, -1, -1);
    if (m.m_RecordServer) T.TextColor(1, 0.5, 0, 1);
    else if (m.m_RecordPersonal) T.TextColor(0.2, 0.6, 1, 1);
    T.Text(0, x, y, FontSize, aTime, -1);
    x -= 52 + 10;
    G.TextureSet(ImageTex(C.IMAGE_RACEFLAG));
    G.QuadsBegin();
    G.QuadsDrawTL([new CQuadItem(x, y, 52, 52)], 1);
    G.QuadsEnd();
    x -= 10;
    x -= PlayerNameW;
    const Cursor = new CTextCursor();
    T.SetCursor(Cursor, x, y, FontSize, TEXTFLAG_RENDER);
    RT.DrawClientID(T, Cursor, m.m_Player1ID);
    T.TextEx(Cursor, m.m_aPlayer1Name, -1);
    T.TextColor(1, 1, 1, 1);
    x -= 28;
    RT.RenderTee(CAnimState.GetIdle(), m.m_Player1RenderInfo, m.m_RecordPersonal || m.m_RecordServer ? P.EMOTE_HAPPY : P.EMOTE_NORMAL, new vec2(-1, 0), new vec2(x, y + 28));
  }
}
