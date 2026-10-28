// (c) Magnus Auvinen. See licence.txt in the root of the distribution for more information.
// If you are missing that file, acquire a complete release at teeworlds.com.
// Altered: game/client/components/voting.h, voting.cpp and game/voting.h of Teeworlds 0.7.5 in TypeScript. The
// option list is an array (the original's linked list with its recycling).
import { v4, str_comp, str_comp_nocase, str_format, Localize } from './common.ts';
import * as P from '../../../generated/protocol.ts';
import { CFGFLAG_CLIENT } from '../../../generated/config.ts';
import { MSGFLAG_VITAL } from '../../../engine/shared/protocol.ts';
import { TIME_FREQ } from '../../../engine/shared/network.ts';
import { STATE_LOADING, STATE_OFFLINE, STATE_ONLINE } from '../../engine/client.ts';
import { CUIRect, CORNER_ALL, ALIGN_CENTER } from '../ui.ts';
import { CComponent } from '../component.ts';
import type { CNetMsg } from '../gameclient.ts';

export const VOTE_DESC_LENGTH = 64, VOTE_CMD_LENGTH = 512, VOTE_SEARCH_LENGTH = 64, VOTE_REASON_LENGTH = 16, MAX_VOTE_OPTIONS = 128,
  MAX_VOTE_OPTION_ADD = 21, VOTE_COOLDOWN = 60;

export class CVoting extends CComponent {
  private m_Closetime = 0;
  private m_aDescription = '';
  private m_aReason = '';
  private m_Voted = 0;
  private m_Yes = 0;
  private m_No = 0;
  private m_Pass = 0;
  private m_Total = 0;
  private m_CallvoteBlockTick = 0;
  /** the vote options, in order (m_pFirst … m_pLast) */
  m_aOptions: string[] = [];

  get m_NumVoteOptions(): number { return this.m_aOptions.length; }

  private Callvote(pType: string, pValue: string, pReason: string, ForceVote: boolean): void {
    this.m_pClient.SendMsg(P.NETMSGTYPE_CL_CALLVOTE, P.pack_CNetMsg_Cl_CallVote, { m_Type: pType, m_Value: pValue, m_Reason: pReason, m_Force: ForceVote ? 1 : 0 }, MSGFLAG_VITAL);
  }
  CallvoteSpectate(ClientID: number, pReason: string, ForceVote = false): void { this.Callvote('spectate', String(ClientID), pReason, ForceVote); }
  CallvoteKick(ClientID: number, pReason: string, ForceVote = false): void { this.Callvote('kick', String(ClientID), pReason, ForceVote); }
  CallvoteOption(OptionID: number, pReason: string, ForceVote = false): void {
    if (OptionID >= 0 && OptionID < this.m_aOptions.length) this.Callvote('option', this.m_aOptions[OptionID], pReason, ForceVote);
  }
  RemovevoteOption(OptionID: number): void {
    if (OptionID >= 0 && OptionID < this.m_aOptions.length) this.Client().Rcon(str_format(128, 'remove_vote "%s"', this.m_aOptions[OptionID]));
  }
  AddvoteOption(pDescription: string, pCommand: string): void { this.Client().Rcon(str_format(128, 'add_vote "%s" %s', pDescription, pCommand)); }
  Vote(v: number): void { this.m_pClient.SendMsg(P.NETMSGTYPE_CL_VOTE, P.pack_CNetMsg_Cl_Vote, { m_Vote: v }, MSGFLAG_VITAL); }

  AddOption(pDescription: string): void { this.m_aOptions.push(pDescription.slice(0, VOTE_DESC_LENGTH - 1)); }

  private Clear(): void {
    this.m_Closetime = 0;
    this.m_aDescription = '';
    this.m_aReason = '';
    this.m_Yes = this.m_No = this.m_Pass = this.m_Total = 0;
    this.m_Voted = 0;
    this.m_CallvoteBlockTick = 0;
  }
  private ClearOptions(): void { this.m_aOptions = []; }

  SecondsLeft(): number { return Math.trunc((this.m_Closetime - this.Client().time_get()) / TIME_FREQ); }
  IsVoting(): boolean { return this.m_Closetime !== 0; }
  TakenChoice(): number { return this.m_Voted; }
  VoteDescription(): string { return this.m_aDescription; }
  VoteReason(): string { return this.m_aReason; }
  CallvoteBlockTime(): number {
    const Cl = this.Client();
    return this.m_CallvoteBlockTick > Cl.GameTick() ? Math.trunc((this.m_CallvoteBlockTick - Cl.GameTick()) / Cl.GameTickSpeed()) : 0;
  }

  override OnReset(): void {
    if (this.Client().State() === STATE_LOADING) return;
    this.Clear();
  }

  override OnStateChange(_NewState: number, OldState: number): void {
    if (OldState === STATE_ONLINE || OldState === STATE_OFFLINE) this.Clear();
  }

  override OnConsoleInit(): void {
    this.Console().Register('vote', "r['yes'|'no']", CFGFLAG_CLIENT, (r) => {
      if (str_comp_nocase(r.GetString(0), 'yes') === 0) this.Vote(1);
      else if (str_comp_nocase(r.GetString(0), 'no') === 0) this.Vote(-1);
    }, this, 'Vote yes/no');
  }

  override OnMessage(MsgType: number, pRawMsg: CNetMsg): void {
    const gc = this.m_pClient, chat = gc.m_pChat, cfg = this.Config();
    if (MsgType === P.NETMSGTYPE_SV_VOTESET) {
      const pMsg = pRawMsg as P.CNetMsg_Sv_VoteSet;
      const BlockTick = this.m_CallvoteBlockTick;
      if (pMsg.m_Timeout) {
        this.OnReset();
        this.m_aReason = pMsg.m_pReason.slice(0, VOTE_REASON_LENGTH - 1);
        this.m_Closetime = this.Client().time_get() + TIME_FREQ * pMsg.m_Timeout;
        if (pMsg.m_ClientID !== -1) {
          const aLabel = gc.GetPlayerLabel(pMsg.m_ClientID, gc.m_aClients[pMsg.m_ClientID].m_aName);
          const aName = cfg.m_ClShowsocial ? pMsg.m_pDescription : pMsg.m_pDescription.slice(0, 3);
          switch (pMsg.m_Type) {
            case P.VOTE_START_OP:
              chat.AddLine(str_format(128, Localize("'%s' called vote to change server option '%s' (%s)"), aLabel, pMsg.m_pDescription, pMsg.m_pReason));
              this.m_aDescription = pMsg.m_pDescription.slice(0, VOTE_DESC_LENGTH - 1);
              break;
            case P.VOTE_START_KICK:
              chat.AddLine(str_format(128, Localize("'%s' called for vote to kick '%s' (%s)"), aLabel, aName, pMsg.m_pReason));
              this.m_aDescription = str_format(VOTE_DESC_LENGTH, "Kick '%s'", aName);
              break;
            case P.VOTE_START_SPEC:
              chat.AddLine(str_format(128, Localize("'%s' called for vote to move '%s' to spectators (%s)"), aLabel, aName, pMsg.m_pReason));
              this.m_aDescription = str_format(VOTE_DESC_LENGTH, "Move '%s' to spectators", aName);
              break;
          }
          if (pMsg.m_ClientID === gc.m_LocalClientID) this.m_CallvoteBlockTick = this.Client().GameTick() + this.Client().GameTickSpeed() * VOTE_COOLDOWN;
        }
      } else {
        switch (pMsg.m_Type) {
          case P.VOTE_START_OP: chat.AddLine(str_format(128, Localize("Admin forced server option '%s' (%s)"), pMsg.m_pDescription, pMsg.m_pReason)); break;
          case P.VOTE_START_SPEC: chat.AddLine(str_format(128, Localize("Admin moved '%s' to spectator (%s)"), pMsg.m_pDescription, pMsg.m_pReason)); break;
          case P.VOTE_END_ABORT:
            this.OnReset();
            chat.AddLine(Localize('Vote aborted'));
            break;
          case P.VOTE_END_PASS:
            this.OnReset();
            chat.AddLine(pMsg.m_ClientID === -1 ? Localize('Admin forced vote yes') : Localize('Vote passed'));
            break;
          case P.VOTE_END_FAIL:
            this.OnReset();
            chat.AddLine(pMsg.m_ClientID === -1 ? Localize('Admin forced vote no') : Localize('Vote failed'));
            this.m_CallvoteBlockTick = BlockTick;
            break;
        }
      }
    } else if (MsgType === P.NETMSGTYPE_SV_VOTESTATUS) {
      const pMsg = pRawMsg as P.CNetMsg_Sv_VoteStatus;
      this.m_Yes = pMsg.m_Yes;
      this.m_No = pMsg.m_No;
      this.m_Pass = pMsg.m_Pass;
      this.m_Total = pMsg.m_Total;
    } else if (MsgType === P.NETMSGTYPE_SV_VOTECLEAROPTIONS) this.ClearOptions();
    else if (MsgType === P.NETMSGTYPE_SV_VOTEOPTIONADD) this.AddOption((pRawMsg as P.CNetMsg_Sv_VoteOptionAdd).m_pDescription);
    else if (MsgType === P.NETMSGTYPE_SV_VOTEOPTIONREMOVE) {
      const d = (pRawMsg as P.CNetMsg_Sv_VoteOptionRemove).m_pDescription;
      const i = this.m_aOptions.findIndex((o) => str_comp(o, d) === 0);
      if (i >= 0) this.m_aOptions.splice(i, 1);
    }
  }

  RenderBars(Bars: CUIRect, Text: boolean): void {
    const RT = this.RenderTools();
    RT.DrawUIRect(Bars, v4(0.8, 0.8, 0.8, 0.5), CORNER_ALL, Bars.h / 3);
    const Splitter = Bars.copy();
    Splitter.x = Splitter.x + Splitter.w / 2;
    Splitter.w = Splitter.h / 2;
    Splitter.x -= Splitter.w / 2;
    RT.DrawUIRect(Splitter, v4(0.4, 0.4, 0.4, 0.5), CORNER_ALL, Splitter.h / 4);
    if (!this.m_Total) return;
    const PassArea = Bars.copy();
    if (this.m_Yes) {
      const YesArea = Bars.copy();
      YesArea.w *= this.m_Yes / this.m_Total;
      RT.DrawUIRect(YesArea, v4(0.2, 0.9, 0.2, 0.85), CORNER_ALL, Bars.h / 3);
      if (Text) this.UI().DoLabel(YesArea, String(this.m_Yes), Bars.h * 0.75, ALIGN_CENTER);
      PassArea.x += YesArea.w;
      PassArea.w -= YesArea.w;
    }
    if (this.m_No) {
      const NoArea = Bars.copy();
      NoArea.w *= this.m_No / this.m_Total;
      NoArea.x = Bars.x + Bars.w - NoArea.w;
      RT.DrawUIRect(NoArea, v4(0.9, 0.2, 0.2, 0.85), CORNER_ALL, Bars.h / 3);
      if (Text) this.UI().DoLabel(NoArea, String(this.m_No), Bars.h * 0.75, ALIGN_CENTER);
      PassArea.w -= NoArea.w;
    }
    if (Text && this.m_Pass) this.UI().DoLabel(PassArea, String(this.m_Pass), Bars.h * 0.75, ALIGN_CENTER);
  }
}
