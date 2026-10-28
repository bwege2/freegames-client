// (c) Magnus Auvinen. See licence.txt in the root of the distribution for more information.
// If you are missing that file, acquire a complete release at teeworlds.com.
// Altered: game/client/components/menus_ingame.cpp of Teeworlds 0.7.5 in TypeScript (the CMenus methods are functions
// of the menu). Left out: the Record button (no demos) and the Favorite check box (no server browser).
import { vec2, str_format, str_find_nocase, Localize, ImageTex, v4 } from './common.ts';
import * as C from '../../../generated/content.ts';
import * as P from '../../../generated/protocol.ts';
import { MAX_CLIENTS } from '../../../engine/shared/protocol.ts';
import { CQuadItem } from '../../engine/graphics.ts';
import { CTextCursor, TEXTFLAG_RENDER } from '../../engine/text.ts';
import { FLAG_PASSWORD, CServerInfo } from '../../engine/serverbrowser.ts';
import { CUIRect, CORNER_ALL, CORNER_B, CORNER_L, CORNER_R, CORNER_T, ALIGN_CENTER, ALIGN_LEFT } from '../ui.ts';
import { CAnimState } from '../render.ts';
import type { CMenus } from './menus.ts';
import { CButtonContainer, CScrollRegion, CScrollRegionParams, CListBox, ms_FontmodHeight, type CNumRef, type CStrRef } from './menus_ui.ts';

const FontmodHeight = ms_FontmodHeight;

const s_SpectateButton = new CButtonContainer(), s_RedButton = new CButtonContainer(), s_BlueButton = new CButtonContainer(),
  s_JoinButton = new CButtonContainer(), s_DisconnectButton = new CButtonContainer();

export function RenderGame(m: CMenus, MainView: CUIRect): void {
  const gc = m.m_pClient, UI = m.UI(), RT = m.RenderTools(), Cfg = m.Config();
  if (gc.m_LocalClientID === -1) return;
  let aBuf: string;
  const Info = m.GetSwitchTeamInfo();
  const Button = new CUIRect(), ButtonRow = new CUIRect(), Label = new CUIRect();
  const Spacing = 3;
  const ButtonWidth = MainView.w / 6 - (Spacing * 5) / 6;
  // cut view
  MainView.HSplitTop(20, null, MainView);
  const NoteHeight = !Info.m_aNotification ? 0 : 45;
  MainView.HSplitTop(20 + 20 + 2 * Spacing + NoteHeight, MainView, null);
  RT.DrawUIRect(MainView, v4(0, 0, 0, Cfg.m_ClMenuAlpha / 100), CORNER_ALL, 5);
  // game options
  MainView.HSplitTop(20, Label, MainView);
  Label.y += 2;
  UI.DoLabel(Label, Localize('Game options'), 20 * FontmodHeight * 0.8, ALIGN_CENTER);
  RT.DrawUIRect(MainView, v4(0, 0, 0, 0.25), CORNER_ALL, 5);
  if (Info.m_aNotification) {
    // print notice
    const Bar = new CUIRect();
    MainView.HSplitBottom(NoteHeight, MainView, Bar);
    Bar.HMargin(15, Bar);
    UI.DoLabel(Bar, Info.m_aNotification, 14, ALIGN_CENTER);
  }
  // buttons
  MainView.HSplitTop(Spacing, null, MainView);
  MainView.HSplitTop(20, ButtonRow, null);
  ButtonRow.VMargin(Spacing, ButtonRow);
  // specator button
  const Team = gc.m_aClients[gc.m_LocalClientID].m_Team;
  const Locked = (): string => (Info.m_TimeLeft ? str_format(128, '(%d)', Info.m_TimeLeft) : Localize('locked'));
  if (!Info.m_AllowSpec && Team !== P.TEAM_SPECTATORS) aBuf = Locked();
  else aBuf = Localize(Team !== P.TEAM_SPECTATORS ? 'Spectate' : 'Spectating');
  ButtonRow.VSplitLeft(ButtonWidth, Button, ButtonRow);
  ButtonRow.VSplitLeft(Spacing, null, ButtonRow);
  if (m.DoButton_Menu(s_SpectateButton, aBuf, Team === P.TEAM_SPECTATORS, Button) && Team !== P.TEAM_SPECTATORS && Info.m_AllowSpec) {
    gc.SendSwitchTeam(P.TEAM_SPECTATORS);
    m.SetActive(false);
  }
  // team button
  if (gc.m_GameInfo.m_GameFlags & P.GAMEFLAG_TEAMS) {
    let RedTeamSizeNew = gc.m_GameInfo.m_aTeamSize[P.TEAM_RED];
    if (Team !== P.TEAM_RED) ++RedTeamSizeNew;
    let BlueTeamSizeNew = gc.m_GameInfo.m_aTeamSize[P.TEAM_BLUE];
    if (Team === P.TEAM_BLUE) --BlueTeamSizeNew;
    const BlockRed = gc.m_ServerSettings.m_TeamBalance && RedTeamSizeNew - BlueTeamSizeNew >= P.NUM_TEAMS;
    if ((Info.m_aNotification && Team !== P.TEAM_RED) || BlockRed) aBuf = Locked();
    else aBuf = Localize(Team !== P.TEAM_RED ? 'Join red' : 'Joined red');
    ButtonRow.VSplitLeft(ButtonWidth, Button, ButtonRow);
    ButtonRow.VSplitLeft(Spacing, null, ButtonRow);
    if (m.DoButton_Menu(s_RedButton, aBuf, Team === P.TEAM_RED, Button, null, CORNER_ALL, 5, 0, v4(0.975, 0.17, 0.17, 0.75), false) && Team !== P.TEAM_RED && !Info.m_aNotification && !BlockRed) {
      gc.SendSwitchTeam(P.TEAM_RED);
      m.SetActive(false);
    }
    RedTeamSizeNew = gc.m_GameInfo.m_aTeamSize[P.TEAM_RED];
    if (Team === P.TEAM_RED) --RedTeamSizeNew;
    BlueTeamSizeNew = gc.m_GameInfo.m_aTeamSize[P.TEAM_BLUE];
    if (Team !== P.TEAM_BLUE) ++BlueTeamSizeNew;
    const BlockBlue = gc.m_ServerSettings.m_TeamBalance && BlueTeamSizeNew - RedTeamSizeNew >= P.NUM_TEAMS;
    if ((Info.m_aNotification && Team !== P.TEAM_BLUE) || BlockBlue) aBuf = Locked();
    else aBuf = Localize(Team !== P.TEAM_BLUE ? 'Join blue' : 'Joined blue');
    ButtonRow.VSplitLeft(ButtonWidth, Button, ButtonRow);
    ButtonRow.VSplitLeft(Spacing, null, ButtonRow);
    if (m.DoButton_Menu(s_BlueButton, aBuf, Team === P.TEAM_BLUE, Button, null, CORNER_ALL, 5, 0, v4(0.17, 0.46, 0.975, 0.75), false) && Team !== P.TEAM_BLUE && !Info.m_aNotification && !BlockBlue) {
      gc.SendSwitchTeam(P.TEAM_BLUE);
      m.SetActive(false);
    }
  } else {
    if (Info.m_aNotification && Team !== P.TEAM_RED) aBuf = Locked();
    else aBuf = Localize(Team !== P.TEAM_RED ? 'Join' : 'Joined');
    ButtonRow.VSplitLeft(ButtonWidth, Button, ButtonRow);
    if (m.DoButton_Menu(s_JoinButton, aBuf, Team === P.TEAM_RED, Button) && Team !== P.TEAM_RED && !Info.m_aNotification) {
      gc.SendSwitchTeam(P.TEAM_RED);
      m.SetActive(false);
    }
  }
  // disconnect button
  ButtonRow.VSplitRight(ButtonWidth, ButtonRow, Button);
  if (m.DoButton_Menu(s_DisconnectButton, Localize('Disconnect'), 0, Button)) m.Client().Disconnect();
}

let s_PlayersScrollRegion: CScrollRegion | null = null;
const s_aPlayerIDs = Array.from({ length: MAX_CLIENTS }, () => [{}, {}]);

export function RenderPlayers(m: CMenus, MainView: CUIRect): void {
  const gc = m.m_pClient, UI = m.UI(), RT = m.RenderTools(), G = m.Graphics(), Cfg = m.Config();
  const ButtonHeight = 20, Spacing = 2, NameWidth = 250, ClanWidth = 250;
  const Label = new CUIRect(), Row = new CUIRect();
  MainView.HSplitBottom(80, MainView, null);
  MainView.HSplitTop(20, null, MainView);
  RT.DrawUIRect(MainView, v4(0, 0, 0, Cfg.m_ClMenuAlpha / 100), CORNER_ALL, 5);
  // player options
  MainView.HSplitTop(ButtonHeight, Label, MainView);
  Label.y += 2;
  UI.DoLabel(Label, Localize('Player options'), ButtonHeight * FontmodHeight * 0.8, ALIGN_CENTER);
  RT.DrawUIRect(MainView, v4(0, 0, 0, 0.25), CORNER_ALL, 5);
  // prepare headline
  MainView.HSplitTop(ButtonHeight, Row, MainView);
  // background
  RT.DrawUIRect(MainView, v4(0, 0, 0, 0.25), CORNER_ALL, 5);
  MainView.Margin(5, MainView);
  // prepare scroll
  const s_ScrollRegion = (s_PlayersScrollRegion ??= new CScrollRegion(m));
  const ScrollParams = new CScrollRegionParams();
  ScrollParams.m_ClipBgColor = v4(0, 0, 0, 0);
  ScrollParams.m_ScrollbarBgColor = v4(0, 0, 0, 0);
  ScrollParams.m_ScrollSpeed = 15;
  if (s_ScrollRegion.IsScrollbarShown()) Row.VSplitRight(ScrollParams.m_ScrollbarWidth, Row, null);
  // headline
  Row.VSplitLeft(ButtonHeight + Spacing, null, Row);
  Row.VSplitLeft(NameWidth, Label, Row);
  Label.y += 2;
  UI.DoLabel(Label, Localize('Player'), ButtonHeight * FontmodHeight * 0.8, ALIGN_LEFT);
  const icon = (Sprite: number): void => {
    G.TextureSet(ImageTex(C.IMAGE_GUIICONS));
    G.QuadsBegin();
    RT.SelectSprite(Sprite);
    G.QuadsDrawTL([new CQuadItem(Label.x, Label.y, Label.w, Label.h)], 1);
    G.QuadsEnd();
  };
  Row.VSplitRight(2 * ButtonHeight, Row, Label);
  icon(C.SPRITE_GUIICON_MUTE);
  Row.VSplitRight(2 * Spacing, Row, null);
  Row.VSplitRight(2 * ButtonHeight, Row, Label);
  icon(C.SPRITE_GUIICON_FRIEND);
  // scroll, ignore margins
  MainView.Margin(-5, MainView);
  const ScrollOffset = s_ScrollRegion.Begin(MainView, ScrollParams);
  MainView.Margin(5, MainView);
  MainView.y += ScrollOffset.y;
  // options
  const Teams = [P.TEAM_RED, P.TEAM_BLUE, P.TEAM_SPECTATORS];
  for (let Team = 0, Count = 0; Team < 3; ++Team) {
    for (let i = 0; i < MAX_CLIENTS; ++i) {
      const c = gc.m_aClients[i];
      if (i === gc.m_LocalClientID || !c.m_Active || c.m_Team !== Teams[Team]) continue;
      MainView.HSplitTop(ButtonHeight, Row, MainView);
      s_ScrollRegion.AddRect(Row);
      if (Count++ % 2 === 0) RT.DrawUIRect(Row, v4(1, 1, 1, 0.25), CORNER_ALL, 5);
      // player info
      Row.VSplitLeft(ButtonHeight, Label, Row);
      Label.y += 2;
      const Info = c.m_RenderInfo.copy();
      Info.m_Size = Label.h;
      RT.RenderTee(CAnimState.GetIdle(), Info, P.EMOTE_NORMAL, new vec2(1, 0), new vec2(Label.x + Label.h / 2, Label.y + Label.h / 2));
      Row.VSplitLeft(2 * Spacing, null, Row);
      Row.VSplitLeft(NameWidth, Label, Row);
      Label.y += 2;
      if (Cfg.m_ClShowUserId) {
        const Cursor = new CTextCursor();
        m.TextRender().SetCursor(Cursor, Label.x, Label.y, ButtonHeight * FontmodHeight * 0.8, TEXTFLAG_RENDER);
        RT.DrawClientID(m.TextRender(), Cursor, i);
        Label.VSplitLeft(ButtonHeight, null, Label);
      }
      UI.DoLabel(Label, Cfg.m_ClShowsocial ? c.m_aName : '', ButtonHeight * FontmodHeight * 0.8, ALIGN_LEFT);
      Row.VSplitLeft(Spacing, null, Row);
      Row.VSplitLeft(ClanWidth, Label, Row);
      Label.y += 2;
      UI.DoLabel(Label, Cfg.m_ClShowsocial ? c.m_aClan : '', ButtonHeight * FontmodHeight * 0.8, ALIGN_LEFT);
      // ignore button
      Row.VSplitRight(ButtonHeight / 2, Row, null);
      Row.VSplitRight(ButtonHeight, Row, Label);
      if (Cfg.m_ClFilterchat === 2 || (Cfg.m_ClFilterchat === 1 && !c.m_Friend)) m.DoButton_Toggle(s_aPlayerIDs[i][0], 1, Label, false);
      else if (m.DoButton_Toggle(s_aPlayerIDs[i][0], c.m_ChatIgnore, Label, true)) {
        if (c.m_ChatIgnore) gc.Blacklist().RemoveIgnoredPlayer(c.m_aName, c.m_aClan);
        else gc.Blacklist().AddIgnoredPlayer(c.m_aName, c.m_aClan);
        c.m_ChatIgnore = !c.m_ChatIgnore;
      }
      // friend button
      Row.VSplitRight(2 * Spacing + ButtonHeight, Row, null);
      Row.VSplitRight(ButtonHeight, Row, Label);
      if (m.DoButton_Toggle(s_aPlayerIDs[i][1], c.m_Friend, Label, true)) {
        if (c.m_Friend) gc.Friends().RemoveFriend(c.m_aName, c.m_aClan);
        else gc.Friends().AddFriend(c.m_aName, c.m_aClan);
        c.m_Friend = !c.m_Friend;
      }
    }
  }
  s_ScrollRegion.End();
}

let s_MotdScrollRegion: CScrollRegion | null = null;
const s_MuteBroadcast = {};

export function RenderServerInfo(m: CMenus, MainView: CUIRect): void {
  const gc = m.m_pClient, UI = m.UI(), RT = m.RenderTools(), Cfg = m.Config();
  if (!gc.m_Snap.m_pLocalInfo) return;
  // fetch server info
  const CurrentServerInfo: CServerInfo = m.Client().GetServerInfo();
  // render background
  MainView.HSplitBottom(80, MainView, null);
  MainView.HSplitTop(20, null, MainView);
  RT.DrawUIRect(MainView, v4(0, 0, 0, Cfg.m_ClMenuAlpha / 100), CORNER_ALL, 5);
  const ServerInfo = new CUIRect(), GameInfo = new CUIRect(), Motd = new CUIRect(), Label = new CUIRect();
  const ButtonHeight = 20;
  const FontSize = ButtonHeight * FontmodHeight * 0.8;
  const line = (r: CUIRect, s: string): void => {
    r.HSplitTop(ButtonHeight, Label, r);
    Label.y += 2;
    UI.DoLabel(Label, s, FontSize, ALIGN_LEFT);
  };
  // serverinfo
  MainView.HSplitBottom(250, ServerInfo, Motd);
  ServerInfo.VSplitMid(ServerInfo, GameInfo, 2);
  RT.DrawUIRect(ServerInfo, v4(0, 0, 0, 0.25), CORNER_ALL, 5);
  ServerInfo.HSplitTop(ButtonHeight, Label, ServerInfo);
  Label.y += 2;
  UI.DoLabel(Label, Localize('Server info'), FontSize, ALIGN_CENTER);
  RT.DrawUIRect(ServerInfo, v4(0, 0, 0, 0.25), CORNER_ALL, 5);
  ServerInfo.Margin(5, ServerInfo);
  ServerInfo.HSplitTop(2 * ButtonHeight, Label, ServerInfo);
  Label.y += 2;
  UI.DoLabel(Label, CurrentServerInfo.m_aName, FontSize, ALIGN_LEFT, Label.w);
  line(ServerInfo, str_format(128, '%s: %s', Localize('Address'), CurrentServerInfo.m_aHostname));
  line(ServerInfo, str_format(128, '%s: %d', Localize('Ping'), gc.m_Snap.m_pLocalInfo.m_Latency));
  line(ServerInfo, str_format(128, '%s: %s', Localize('Version'), CurrentServerInfo.m_aVersion));
  line(ServerInfo, str_format(128, '%s: %s', Localize('Password'), CurrentServerInfo.m_Flags & FLAG_PASSWORD ? Localize('Yes') : Localize('No')));
  {
    const Button = new CUIRect();
    ServerInfo.HSplitBottom(ButtonHeight, ServerInfo, null); // the place of the Favorite check box
    ServerInfo.HSplitBottom(20, ServerInfo, Button);
    if (m.DoButton_CheckBox(s_MuteBroadcast, Localize('Mute broadcasts'), gc.m_MuteServerBroadcast, Button)) gc.m_MuteServerBroadcast = !gc.m_MuteServerBroadcast;
  }
  // gameinfo
  RT.DrawUIRect(GameInfo, v4(0, 0, 0, 0.25), CORNER_ALL, 5);
  GameInfo.HSplitTop(ButtonHeight, Label, GameInfo);
  Label.y += 2;
  UI.DoLabel(Label, Localize('Game info'), FontSize, ALIGN_CENTER);
  RT.DrawUIRect(GameInfo, v4(0, 0, 0, 0.25), CORNER_ALL, 5);
  GameInfo.Margin(5, GameInfo);
  line(GameInfo, str_format(128, '%s: %s', Localize('Game type'), CurrentServerInfo.m_aGameType));
  line(GameInfo, str_format(128, '%s: %s', Localize('Map'), CurrentServerInfo.m_aMap));
  let pLevelName = '';
  switch (CurrentServerInfo.m_ServerLevel) {
    case CServerInfo.LEVEL_CASUAL: pLevelName = Localize('Casual'); break;
    case CServerInfo.LEVEL_NORMAL: pLevelName = Localize('Normal'); break;
    case CServerInfo.LEVEL_COMPETITIVE: pLevelName = Localize('Competitive'); break;
  }
  line(GameInfo, str_format(128, '%s: %s', Localize('Difficulty'), pLevelName));
  line(GameInfo, str_format(128, '%s: %d', Localize('Score limit'), gc.m_GameInfo.m_ScoreLimit));
  line(GameInfo, str_format(128, '%s: %d', Localize('Time limit'), gc.m_GameInfo.m_TimeLimit));
  GameInfo.HSplitBottom(ButtonHeight, GameInfo, Label);
  Label.y += 2;
  UI.DoLabel(Label, str_format(128, '%s: %d/%d', Localize('Players'), gc.m_GameInfo.m_NumPlayers, CurrentServerInfo.m_MaxClients), FontSize, ALIGN_LEFT);
  // motd
  Motd.HSplitTop(2, null, Motd);
  RT.DrawUIRect(Motd, v4(0, 0, 0, 0.25), CORNER_ALL, 5);
  Motd.HSplitTop(ButtonHeight, Label, Motd);
  Label.y += 2;
  UI.DoLabel(Label, Localize('MOTD'), FontSize, ALIGN_CENTER);
  RT.DrawUIRect(Motd, v4(0, 0, 0, 0.25), CORNER_ALL, 5);
  Motd.Margin(5, Motd);
  const s_ScrollRegion = (s_MotdScrollRegion ??= new CScrollRegion(m));
  const ScrollOffset = s_ScrollRegion.Begin(Motd);
  Motd.y += ScrollOffset.y;
  const Cursor = new CTextCursor();
  m.TextRender().SetCursor(Cursor, Motd.x, Motd.y, FontSize, TEXTFLAG_RENDER);
  Cursor.m_LineWidth = Motd.w;
  m.TextRender().TextEx(Cursor, gc.m_pMotd.GetMotd(), -1);
  // define the MOTD text area and make it scrollable
  const MotdTextArea = new CUIRect();
  Motd.HSplitTop(Cursor.m_Y - Motd.y + FontSize + 5, MotdTextArea, Motd);
  s_ScrollRegion.AddRect(MotdTextArea);
  s_ScrollRegion.End();
}

let s_ServerListBox: CListBox | null = null;
function RenderServerControlServer(m: CMenus, MainView: CUIRect): boolean {
  const s_ListBox = (s_ServerListBox ??= new CListBox(m));
  const Voting = m.m_pClient.m_pVoting;
  s_ListBox.DoHeader(MainView.copy(), Localize('Option'), m.GetListHeaderHeight());
  s_ListBox.DoStart(20, Voting.m_aOptions.length, 1, m.m_CallvoteSelectedOption, null, true);
  for (let i = 0; i < Voting.m_aOptions.length; i++) {
    const pOption = Voting.m_aOptions[i];
    if (m.m_aFilterString.v && str_find_nocase(pOption, m.m_aFilterString.v) < 0) continue; // no match found
    const Item = s_ListBox.DoNextItem(s_aOptionIDs[i] ??= {});
    if (Item.m_Visible) {
      Item.m_Rect.VMargin(5, Item.m_Rect);
      Item.m_Rect.y += 2;
      m.UI().DoLabel(Item.m_Rect, pOption, Item.m_Rect.h * FontmodHeight * 0.8, ALIGN_LEFT);
    }
  }
  m.m_CallvoteSelectedOption = s_ListBox.DoEnd();
  return s_ListBox.WasItemActivated();
}
const s_aOptionIDs: object[] = [];

let s_KickListBox: CListBox | null = null;
const s_aKickPlayerIDs = Array.from({ length: MAX_CLIENTS }, () => ({}));
function RenderServerControlKick(m: CMenus, MainView: CUIRect, FilterSpectators: boolean): void {
  const gc = m.m_pClient, UI = m.UI(), RT = m.RenderTools(), Cfg = m.Config();
  let NumOptions = 0, Selected = -1;
  const aPlayerIDs: number[] = [];
  const Teams = [P.TEAM_RED, P.TEAM_BLUE, P.TEAM_SPECTATORS];
  for (let Team = 0; Team < 3; ++Team) {
    for (let i = 0; i < MAX_CLIENTS; i++) {
      const c = gc.m_aClients[i], pi = gc.m_Snap.m_paPlayerInfos[i];
      if (i === gc.m_LocalClientID || !c.m_Active || c.m_Team !== Teams[Team] || (FilterSpectators && c.m_Team === P.TEAM_SPECTATORS) ||
        (!FilterSpectators && pi && pi.m_PlayerFlags & P.PLAYERFLAG_ADMIN)) continue;
      if (m.m_CallvoteSelectedPlayer === i) Selected = NumOptions;
      aPlayerIDs[NumOptions++] = i;
    }
  }
  const Spacing = 2, NameWidth = 250, ClanWidth = 250;
  const s_ListBox = (s_KickListBox ??= new CListBox(m));
  s_ListBox.DoHeader(MainView.copy(), Localize('Player'), m.GetListHeaderHeight());
  s_ListBox.DoStart(20, NumOptions, 1, Selected, null, true);
  for (let i = 0; i < NumOptions; i++) {
    const Item = s_ListBox.DoNextItem(s_aKickPlayerIDs[i]);
    if (Item.m_Visible) {
      const c = gc.m_aClients[aPlayerIDs[i]];
      const Label = new CUIRect(), Row = new CUIRect();
      Item.m_Rect.VMargin(5, Row);
      // player info
      Row.VSplitLeft(Row.h, Label, Row);
      Label.y += 2;
      const Info = c.m_RenderInfo.copy();
      Info.m_Size = Label.h;
      RT.RenderTee(CAnimState.GetIdle(), Info, P.EMOTE_NORMAL, new vec2(1, 0), new vec2(Label.x + Label.h / 2, Label.y + Label.h / 2));
      Row.VSplitLeft(2 * Spacing, null, Row);
      if (Cfg.m_ClShowUserId) {
        Row.VSplitLeft(Row.h, Label, Row);
        Label.y += 2;
        const Cursor = new CTextCursor();
        m.TextRender().SetCursor(Cursor, Label.x, Label.y, Label.h * FontmodHeight * 0.8, TEXTFLAG_RENDER);
        RT.DrawClientID(m.TextRender(), Cursor, aPlayerIDs[i]);
      }
      Row.VSplitLeft(Spacing, null, Row);
      Row.VSplitLeft(NameWidth, Label, Row);
      Label.y += 2;
      UI.DoLabel(Label, Cfg.m_ClShowsocial ? c.m_aName : '', Label.h * FontmodHeight * 0.8, ALIGN_LEFT);
      Row.VSplitLeft(Spacing, null, Row);
      Row.VSplitLeft(ClanWidth, Label, Row);
      Label.y += 2;
      UI.DoLabel(Label, Cfg.m_ClShowsocial ? c.m_aClan : '', Label.h * FontmodHeight * 0.8, ALIGN_LEFT);
    }
  }
  Selected = s_ListBox.DoEnd();
  m.m_CallvoteSelectedPlayer = Selected !== -1 ? aPlayerIDs[Selected] : -1;
}

function HandleCallvote(m: CMenus, Page: number, Force: boolean): void {
  const gc = m.m_pClient;
  if (Page === 0) {
    // find the correct index within the filtered list
    let RealIndex = 0, FilteredIndex = 0;
    for (; RealIndex < gc.m_pVoting.m_aOptions.length; RealIndex++) {
      if (m.m_aFilterString.v && str_find_nocase(gc.m_pVoting.m_aOptions[RealIndex], m.m_aFilterString.v) < 0) continue; // no match found
      if (FilteredIndex === m.m_CallvoteSelectedOption) break;
      FilteredIndex++;
    }
    gc.m_pVoting.CallvoteOption(RealIndex, m.m_aCallvoteReason.v, Force);
  } else if (Page === 1) {
    if (m.m_CallvoteSelectedPlayer >= 0 && m.m_CallvoteSelectedPlayer < MAX_CLIENTS && gc.m_aClients[m.m_CallvoteSelectedPlayer].m_Active) {
      gc.m_pVoting.CallvoteKick(m.m_CallvoteSelectedPlayer, m.m_aCallvoteReason.v, Force);
      m.SetActive(false);
    }
  } else if (Page === 2) {
    if (m.m_CallvoteSelectedPlayer >= 0 && m.m_CallvoteSelectedPlayer < MAX_CLIENTS && gc.m_aClients[m.m_CallvoteSelectedPlayer].m_Active) {
      gc.m_pVoting.CallvoteSpectate(m.m_CallvoteSelectedPlayer, m.m_aCallvoteReason.v, Force);
      m.SetActive(false);
    }
  }
}

let s_ControlPage = 0;
const s_Button0 = new CButtonContainer(), s_Button1 = new CButtonContainer(), s_Button2 = new CButtonContainer();
const s_SearchOffset: CNumRef = { v: 0 }, s_ReasonOffset: CNumRef = { v: 0 }, s_OffsetDesc: CNumRef = { v: 0 }, s_OffsetCmd: CNumRef = { v: 0 };
const s_ClearButton = new CButtonContainer(), s_CallVoteButton = new CButtonContainer(), s_ForceVoteButton = new CButtonContainer(),
  s_RemoveVoteButton = new CButtonContainer(), s_AddVoteButton = new CButtonContainer();
const s_aVoteDescription: CStrRef = { v: '' }, s_aVoteCommand: CStrRef = { v: '' };

export function RenderServerControl(m: CMenus, MainView: CUIRect): void {
  const gc = m.m_pClient, UI = m.UI(), RT = m.RenderTools(), Cfg = m.Config(), T = m.TextRender();
  if (gc.m_LocalClientID === -1) return;
  let pNotification: string | null = null;
  if (gc.m_pVoting.IsVoting()) pNotification = Localize('Wait for current vote to end before calling a new one.');
  else if (gc.m_pVoting.CallvoteBlockTime() !== 0) pNotification = str_format(64, Localize('You must wait %d seconds before making another vote'), gc.m_pVoting.CallvoteBlockTime());
  const Authed = m.Client().RconAuthed();
  MainView.HSplitBottom(80, MainView, null);
  if (pNotification && !Authed) {
    MainView.HSplitTop(20, null, MainView);
    // only print notice
    const Bar = new CUIRect();
    MainView.HSplitTop(45, Bar, MainView);
    RT.DrawUIRect(Bar, v4(0, 0, 0, 0.25 + Cfg.m_ClMenuAlpha / 100), CORNER_ALL, 5);
    Bar.HMargin(15, Bar);
    UI.DoLabel(Bar, pNotification, 14, ALIGN_CENTER);
    return;
  }
  // tab bar
  const NotActiveAlpha = 0.5;
  const Bottom = new CUIRect(), Extended = new CUIRect(), Button = new CUIRect(), Row = new CUIRect(), Note = new CUIRect();
  MainView.HSplitTop(3, null, MainView);
  MainView.HSplitTop(25, Row, MainView);
  Row.VSplitLeft(Row.w / 3 - 1.5, Button, Row);
  if (m.DoButton_MenuTabTop(s_Button0, Localize('Change settings'), false, Button, s_ControlPage === 0 ? 1 : NotActiveAlpha, 1, CORNER_T, 5, 0.25)) s_ControlPage = 0;
  Row.VSplitLeft(1.5, null, Row);
  Row.VSplitMid(Button, Row);
  Button.VMargin(1.5, Button);
  if (m.DoButton_MenuTabTop(s_Button1, Localize('Kick player'), false, Button, s_ControlPage === 1 ? 1 : NotActiveAlpha, 1, CORNER_T, 5, 0.25)) s_ControlPage = 1;
  Row.VSplitLeft(1.5, null, Button);
  if (m.DoButton_MenuTabTop(s_Button2, Localize('Move player to spectators'), false, Button, s_ControlPage === 2 ? 1 : NotActiveAlpha, 1, CORNER_T, 5, 0.25)) s_ControlPage = 2;
  if (s_ControlPage === 1) {
    if (!gc.m_ServerSettings.m_KickVote) pNotification = Localize('Server does not allow voting to kick players');
    else if (gc.m_GameInfo.m_aTeamSize[P.TEAM_RED] + gc.m_GameInfo.m_aTeamSize[P.TEAM_BLUE] < gc.m_ServerSettings.m_KickMin)
      pNotification = str_format(64, Localize('Kick voting requires %d players on the server'), gc.m_ServerSettings.m_KickMin);
  } else if (s_ControlPage === 2 && !gc.m_ServerSettings.m_SpecVote) pNotification = Localize('Server does not allow voting to move players to spectators');
  if (pNotification && !Authed) MainView.HSplitTop(20 + 45, MainView, null);
  RT.DrawUIRect(MainView, v4(0, 0, 0, Cfg.m_ClMenuAlpha / 100), CORNER_B, 5);
  MainView.HSplitTop(20, null, MainView);
  if (pNotification && !Authed) {
    // only print notice
    RT.DrawUIRect(MainView, v4(0, 0, 0, 0.25), CORNER_ALL, 5);
    MainView.HMargin(15, MainView);
    UI.DoLabel(MainView, pNotification, 14, ALIGN_CENTER);
    return;
  }
  if (gc.m_aClients[gc.m_LocalClientID].m_Team === P.TEAM_SPECTATORS) pNotification = Localize("Spectators aren't allowed to start a vote.");
  // render background
  MainView.HSplitBottom(90 + 2 * 20, MainView, Extended);
  RT.DrawUIRect(Extended, v4(0, 0, 0, 0.25), CORNER_ALL, 5);
  let doCallVote = false;
  // render page
  if (s_ControlPage === 0) doCallVote = RenderServerControlServer(m, MainView) && gc.m_aClients[gc.m_LocalClientID].m_Team !== P.TEAM_SPECTATORS; // double click triggers vote if not spectating
  else if (s_ControlPage === 1) RenderServerControlKick(m, MainView, false);
  else if (s_ControlPage === 2) RenderServerControlKick(m, MainView, true);
  // vote menu
  Extended.Margin(5, Extended);
  Extended.HSplitTop(20, Note, Extended);
  Extended.HSplitTop(20, Bottom, Extended);
  if (Authed || gc.m_aClients[gc.m_LocalClientID].m_Team !== P.TEAM_SPECTATORS) {
    const Reason = new CUIRect(), Search = new CUIRect(), ClearButton = new CUIRect(), Label = new CUIRect();
    // render search
    Bottom.VSplitLeft(15, null, Bottom);
    Bottom.VSplitLeft(260, Search, Bottom);
    let w: number;
    if (s_ControlPage === 0) {
      const pSearchLabel = Localize('Search:');
      w = T.TextWidth(0, Search.h * FontmodHeight * 0.8, pSearchLabel, -1, -1);
      Search.VSplitLeft(w + 10, Label, Search);
      Label.y += 2;
      UI.DoLabel(Label, pSearchLabel, Search.h * FontmodHeight * 0.8, ALIGN_LEFT);
      if (m.DoEditBox(m.m_aFilterString, Search, m.m_aFilterString, 64, Search.h * FontmodHeight * 0.8, s_SearchOffset)) m.m_CallvoteSelectedOption = 0;
    }
    // render reason
    Bottom.VSplitRight(120, Bottom, Button);
    Bottom.VSplitRight(40, Bottom, null);
    Bottom.VSplitRight(160, Bottom, Reason);
    Reason.VSplitRight(Reason.h, Reason, ClearButton);
    const pReasonLabel = Localize('Reason:');
    w = T.TextWidth(0, Reason.h * FontmodHeight * 0.8, pReasonLabel, -1, -1);
    Reason.VSplitLeft(w + 10, Label, Reason);
    Label.y += 2;
    UI.DoLabel(Label, pReasonLabel, Reason.h * FontmodHeight * 0.8, ALIGN_LEFT);
    m.DoEditBox(m.m_aCallvoteReason, Reason, m.m_aCallvoteReason, 16, Reason.h * FontmodHeight * 0.8, s_ReasonOffset, false, CORNER_L);
    // clear button
    {
      const Fade = m.ButtonFade(s_ClearButton, 0.6);
      RT.DrawUIRect(ClearButton, v4(1, 1, 1, 0.33 + (Fade / 0.6) * 0.165), CORNER_R, 3);
      const L = ClearButton.copy();
      L.y += 2;
      UI.DoLabel(L, 'x', L.h * FontmodHeight * 0.8, ALIGN_CENTER);
      if (UI.DoButtonLogic(s_ClearButton.GetID(), ClearButton)) m.m_aCallvoteReason.v = '';
    }
  }
  if (pNotification === null) {
    // call vote
    if (m.DoButton_Menu(s_CallVoteButton, Localize('Call vote'), 0, Button) || doCallVote) {
      HandleCallvote(m, s_ControlPage, false);
      m.m_aCallvoteReason.v = '';
    }
  } else if (!Authed) {
    // print notice
    UI.DoLabel(Note, pNotification, Note.h * FontmodHeight * 0.8, ALIGN_CENTER);
  }
  // extended features (only available when authed in rcon)
  if (Authed) {
    // background
    Extended.Margin(10, Extended);
    Extended.HSplitTop(20, Bottom, Extended);
    Extended.HSplitTop(5, null, Extended);
    // force vote
    Bottom.VSplitLeft(5, null, Bottom);
    Bottom.VSplitLeft(120, Button, Bottom);
    if (m.DoButton_Menu(s_ForceVoteButton, Localize('Force vote'), 0, Button)) {
      HandleCallvote(m, s_ControlPage, true);
      m.m_aCallvoteReason.v = '';
    }
    if (s_ControlPage === 0) {
      // remove vote
      Bottom.VSplitRight(10, Bottom, null);
      Bottom.VSplitRight(120, null, Button);
      if (m.DoButton_Menu(s_RemoveVoteButton, Localize('Remove'), 0, Button)) gc.m_pVoting.RemovevoteOption(m.m_CallvoteSelectedOption);
      // add vote
      Extended.HSplitTop(20, Bottom, Extended);
      Bottom.VSplitLeft(5, null, Bottom);
      Bottom.VSplitLeft(250, Button, Bottom);
      UI.DoLabel(Button, Localize('Vote description:'), 14, ALIGN_LEFT);
      Bottom.VSplitLeft(20, null, Button);
      UI.DoLabel(Button, Localize('Vote command:'), 14, ALIGN_LEFT);
      Extended.HSplitTop(20, Bottom, Extended);
      Bottom.VSplitRight(10, Bottom, null);
      Bottom.VSplitRight(120, Bottom, Button);
      if (m.DoButton_Menu(s_AddVoteButton, Localize('Add'), 0, Button))
        if (s_aVoteDescription.v && s_aVoteCommand.v) gc.m_pVoting.AddvoteOption(s_aVoteDescription.v, s_aVoteCommand.v);
      Bottom.VSplitLeft(5, null, Bottom);
      Bottom.VSplitLeft(250, Button, Bottom);
      m.DoEditBox(s_aVoteDescription, Button, s_aVoteDescription, 64, 14, s_OffsetDesc, false, CORNER_ALL);
      Bottom.VMargin(20, Button);
      m.DoEditBox(s_aVoteCommand, Button, s_aVoteCommand, 512, 14, s_OffsetCmd, false, CORNER_ALL);
    }
  }
}
