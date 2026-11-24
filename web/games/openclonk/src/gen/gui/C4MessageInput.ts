// @ts-nocheck
// OpenClonk 36de799: src/gui/C4MessageInput.cpp, src/gui/C4MessageInput.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { InputDialog } from './C4Gui.ts';
import { $u64n } from '../../rt/int.ts';
import { c$atof, c$atoi, c$sscanf } from '../../rt/libc.ts';
import { $oarr, $own, $padd, $rd, $wr, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete, $min } from '../../rt/std.ts';

export class C4MessageBoardCommand {
  Name = new Int8Array(31);
  Script = new Int8Array(286);
  Next = null;

  init() {
    this.Name[0] = 0;
    this.Script[0] = 0;
    this.Next = null;
    return this;
  }

  $clone() { return new C4MessageBoardCommand().$assign(this); }
  $assign(o) {
    this.Name = o.Name.slice();
    this.Script = o.Script.slice();
    this.Next = o.Next;
    return this;
  }
}

export class C4MessageInput {
  BackBuffer = $oarr(20, () => new Int8Array(256));
  pCommands = null;

  init() {
    this.pCommands = null;
    C4MessageInput.prototype.Default.call(this);
    return this;
  }

  $dtor() {
    C4MessageInput.prototype.Clear.call(this);
  }

  Default() {
    for (const cnt of this.BackBuffer) {
      cnt[0] = 0;
    }
  }

  Clear() {
    this.CloseTypeIn();
    let pCmd = null;
    while ((pCmd = this.pCommands) != null) {
      this.pCommands = pCmd.Next;
      $delete(pCmd);
    }
  }

  Init() {
    if (this.pCommands == null) {
      this.AddCommand(S("speed"), S("SetGameSpeed(%d)"));
    }
    return true;
  }

  AddCommand(strCommand, strScript) {
    if (this.GetCommand(strCommand) != null) {
      return;
    }
    let pCmd = new C4MessageBoardCommand().init();
    $.SCopy$pi8$pi8$u64(strCommand, P(pCmd.Name, 0), 30);
    $.SCopy$pi8$pi8$u64(strScript, P(pCmd.Script, 0), 285);
    pCmd.Next = this.pCommands;
    this.pCommands = pCmd;
  }

  GetCommand(strName) {
    for (let pCmd = this.pCommands; pCmd != null; pCmd = pCmd.Next) {
      if ($.SEqual(P(pCmd.Name, 0), strName)) {
        return pCmd;
      }
    }
    return null;
  }

  CloseTypeIn() {
    let pDlg = this.GetTypeIn();
    if (pDlg == null) {
      return false;
    }
    pDlg.Close$b(false);
    return true;
  }

  StartTypeIn(fObjInput = false, pObj = null, fUpperCase = false, fTeam = false, iPlr = -1, rsInputQuery = new $.StdStrBuf()) {
    if (this.IsTypeIn()) {
      this.CloseTypeIn();
    }
    return $.pGUI.ShowRemoveDlg(new C4ChatInputDialog().init(fObjInput, pObj, fUpperCase, fTeam, iPlr, rsInputQuery));
  }

  KeyStartTypeIn(fTeam) {
    if ($.Application.isEditor !== 0) {
      return false;
    }
    return this.StartTypeIn(false, null, false, fTeam);
  }

  ToggleTypeIn() {
    if (this.IsTypeIn()) {
      if (this.GetTypeIn().IsScriptQueried()) {
        return false;
      }
      return this.CloseTypeIn();
    } else {
      return this.StartTypeIn();
    }
  }

  IsTypeIn() {
    return C4ChatInputDialog.IsShown();
  }

  GetTypeIn() {
    return C4ChatInputDialog.GetInstance();
  }

  StoreBackBuffer(szMessage) {
    if (szMessage == null || szMessage.a[szMessage.o + 0] === 0) {
      return;
    }
    let i = 0;
    let cnt = 0;
    for (i = 0; i < 19; i = i + 1 | 0) {
      if ($.SEqual(P(this.BackBuffer[i], 0), szMessage)) {
        break;
      }
    }
    for (cnt = i; cnt > 0; cnt = cnt - 1 | 0) {
      $.SCopy$pi8$pi8(P(this.BackBuffer[cnt - 1 | 0], 0), P(this.BackBuffer[cnt], 0));
    }
    $.SCopy$pi8$pi8$u64(szMessage, P(this.BackBuffer[0], 0), 256);
  }

  GetBackBuffer(iIndex) {
    if (!$.Inside$i32$i32$i32$3(iIndex, 0, 19)) {
      return null;
    }
    return P(this.BackBuffer[iIndex], 0);
  }

  ProcessInput(szText) {
    const OSTR = new Int8Array(402);
    let eMsgType = 0;
    let szMsg = null;
    let iToPlayer = -1;
    if (szText.a[szText.o + 0] === 94 || $.SEqual2NoCase(szText, S("team:")) || $.SEqual2NoCase(szText, S("/team "))) {
      if (!$.Game.Teams.IsTeamVisible()) {
        $.Log($.LoadResStr(S("IDS_MSG_CANTSENDTEAMMESSAGETEAMSN")));
        return false;
      } else {
        eMsgType = 3 /*C4CMT_Team*/;
        szMsg = szText.a[szText.o + 0] === 94 ? $padd(szText, 1) : szText.a[szText.o + 0] === 47 ? $padd(szText, 6) : $padd(szText, 5);
      }
    } else if ($.Game.IsRunning && $.SEqual2NoCase(szText, S("/private "))) {
      const szTargetPlr = new Int8Array(31);
      $.SCopyUntil$pi8$pi8$i8$i32$i32($padd(szText, 9), P(szTargetPlr, 0), 32, 30);
      let pToPlr = $.Players.GetByName(P(szTargetPlr, 0));
      if (pToPlr == null) {
        return false;
      }
      eMsgType = 4 /*C4CMT_Private*/;
      iToPlayer = pToPlr.Number;
      szMsg = $padd($padd(szText, 10), $.SLen(szText));
      if (szMsg.o > $padd(szText, $.SLen(szText)).o) {
        return false;
      }
    } else if ($.SEqual2NoCase(szText, S("/me "))) {
      eMsgType = 1 /*C4CMT_Me*/;
      szMsg = $padd(szText, 4);
    } else if ($.SEqual2NoCase(szText, S("/sound "))) {
      eMsgType = 5 /*C4CMT_Sound*/;
      szMsg = $padd(szText, 7);
    } else if ($.SEqual2NoCase(szText, S("/alert ")) || $.SEqualNoCase(szText, S("/alert"))) {
      eMsgType = 6 /*C4CMT_Alert*/;
      szMsg = $padd(szText, 6);
      if (szMsg.a[szMsg.o] !== 0) {
        szMsg = szMsg.add(1);
      }
    } else if ($.Game.IsRunning && szText.a[szText.o + 0] === 34) {
      eMsgType = 2 /*C4CMT_Say*/;
      let text = new $.StdStrBuf().init$pi8$b(szText);
      $.SCopy$pi8$pi8$u64(szText, P(OSTR, 0), 400);
      let pEnd = $padd($padd(P(OSTR, 0), $.SLen(P(OSTR, 0))), -1);
      if (pEnd.a[pEnd.o] !== 34) {
        $wr((pEnd = pEnd.add(1)), 0, 34);
        $wr((pEnd = pEnd.add(1)), 0, 0);
      }
      szMsg = P(OSTR, 0);
    } else if (szText.a[szText.o + 0] === 47) {
      return this.ProcessCommand(szText);
    } else {
      eMsgType = 0 /*C4CMT_Normal*/;
      szMsg = szText;
    }
    if (szMsg != null) {
      const szMessage = new Int8Array(257);
      while ($.IsWhiteSpace(szMsg.a[szMsg.o])) {
        szMsg = szMsg.add(1);
      }
      if (szMsg.a[szMsg.o] === 0) {
        if (eMsgType !== 6) {
          return true;
        }
        $wr(P(szMessage, 0), 0, 0);
      } else {
        let szEnd = $padd($padd(szMsg, $.SLen(szMsg)), -1);
        while ($.IsWhiteSpace(szEnd.a[szEnd.o]) && szEnd.o >= szMsg.o) {
          szEnd = szEnd.add(-1);
        }
        if ($.Game.C4S.Head.Film === 2) {
          if (eMsgType === 2) {
            szMsg = szMsg.add(1);
            szEnd = szEnd.add(-1);
          }
        }
        $.SCopy$pi8$pi8$u64(szMsg, P(szMessage, 0), $u64n($min(256, szEnd.o - szMsg.o + 1)));
      }
      let pPlr = $.Game.IsRunning ? $.Players.GetLocalByIndex(0) : null;
      $.Control$2.DoInput(163 /*CID_Message*/, new $.C4ControlMessage().init$i32$pi8$i32$i32(eMsgType, P(szMessage, 0), pPlr != null ? pPlr.Number : -1, iToPlayer), 3 /*CDT_Private*/);
    }
    return true;
  }

  ProcessCommand(szCommand) {
    let pLobby = $.Network.GetLobby();
    let MaxCommandLen = 20;
    const szCmdName = new Int8Array(21);
    $.SCopyUntil$pi8$pi8$i8$i32$i32($padd(szCommand, 1), P(szCmdName, 0), 32, 20);
    let pCmdPar = $.SSearch(szCommand, S(" "));
    if (pCmdPar == null) {
      pCmdPar = S("");
    }
    if (!$.Game.IsRunning && $.SEqualNoCase(P(szCmdName, 0), S("joinplr"))) {
      let plrPath = new $.StdStrBuf();
      plrPath.Format(S("%s%s"), P($.Config.General.UserDataPath, 0), pCmdPar);
      if (!$.ItemExists(plrPath.getData())) {
        $.LobbyError($.FormatString($.LoadResStr(S("IDS_MSG_CMD_JOINPLR_NOFILE")), plrPath.getData()).getData());
      } else {
        $.Network.Players.JoinLocalPlayer(plrPath.getData());
      }
      return true;
    }
    if (!$.Game.IsRunning && $.SEqualNoCase(P(szCmdName, 0), S("plrclr"))) {
      let iSepPos = $.SCharPos(32, pCmdPar, 0);
      let pNfo = null;
      let idLocalClient = -1;
      if ($.Network.Clients.GetLocal() != null) {
        idLocalClient = $.Network.Clients.GetLocal().getID();
      }
      if (iSepPos > 0) {
        let sPlrName = new $.StdStrBuf();
        sPlrName.Copy$pi8$u64(pCmdPar, $u64n(iSepPos));
        pCmdPar = pCmdPar.add(iSepPos + 1 | 0);
        let id = 0;
        while ((pNfo = $.Game.PlayerInfos.GetNextPlayerInfoByID(id)) != null) {
          id = pNfo.GetID();
          if ($.WildcardMatch(sPlrName.getData(), pNfo.GetName())) {
            break;
          }
        }
      } else {
        pNfo = $.Game.PlayerInfos.GetPrimaryInfoByClientID(idLocalClient);
      }
      let pCltNfo = null;
      if (pNfo != null) {
        pCltNfo = $.Game.PlayerInfos.GetClientInfoByPlayerID(pNfo.GetID());
      }
      if (pCltNfo == null) {
        $.LobbyError($.LoadResStr(S("IDS_MSG_CMD_PLRCLR_NOPLAYER")));
      } else {
        if (pCltNfo.GetClientID() !== idLocalClient && !$.Network.isHost()) {
          $.LobbyError($.LoadResStr(S("IDS_MSG_CMD_PLRCLR_NOACCESS")));
        } else {
          const dwNewClr = [0];
          if (c$sscanf(pCmdPar, S("%x"), P(dwNewClr, 0)) !== 1) {
            $.LobbyError($.LoadResStr(S("IDS_MSG_CMD_PLRCLR_USAGE")));
          } else {
            dwNewClr[0] = (dwNewClr[0] | 0xff000000) >>> 0;
            if (dwNewClr[0] === 0) {
              dwNewClr[0] = dwNewClr[0] + 1 >>> 0;
            }
            let LocalInfoRequest = new $.C4ClientPlayerInfos().$copy(pCltNfo);
            let pPlrInfo = LocalInfoRequest.GetPlayerInfoByID(pNfo.GetID());
            0;
            if (pPlrInfo != null) {
              pPlrInfo.SetOriginalColor(dwNewClr[0]);
              $.Network.Players.RequestPlayerInfoUpdate(LocalInfoRequest);
            }
          }
        }
      }
      return true;
    }
    if (!$.Game.IsRunning && $.SEqualNoCase(P(szCmdName, 0), S("start"))) {
      const iTimeout = [$.Config.Lobby.CountdownTime];
      if (!$.Network.isHost()) {
        $.LobbyError($.LoadResStr(S("IDS_MSG_CMD_HOSTONLY")));
      } else if (pCmdPar != null && pCmdPar.a[pCmdPar.o] !== 0 && (!(c$sscanf(pCmdPar, S("%d"), P(iTimeout, 0)) !== 0) || iTimeout[0] < 0)) {
        $.LobbyError($.LoadResStr(S("IDS_MSG_CMD_START_USAGE")));
      } else if (pLobby != null) {
        if ($.Network.isLobbyCountDown()) {
          $.Network.AbortLobbyCountdown();
        }
        pLobby.Start$i32(iTimeout[0]);
      } else {
        if (iTimeout[0] !== 0) {
          $.Network.StartLobbyCountdown(iTimeout[0]);
        } else {
          $.Network.Start$v();
        }
      }
      return true;
    }
    if (!$.Game.IsRunning && $.SEqualNoCase(P(szCmdName, 0), S("abort"))) {
      if (!$.Network.isHost()) {
        $.LobbyError($.LoadResStr(S("IDS_MSG_CMD_HOSTONLY")));
      } else if ($.Network.isLobbyCountDown()) {
        $.Network.AbortLobbyCountdown();
      } else {
        $.LobbyError($.LoadResStr(S("IDS_MSG_CMD_ABORT_NOCOUNTDOWN")));
      }
      return true;
    }
    if ($.SEqual(P(szCmdName, 0), S("help"))) {
      $.Log($.LoadResStr(P(pLobby != null ? S("IDS_TEXT_COMMANDSAVAILABLEDURINGLO") : S("IDS_TEXT_COMMANDSAVAILABLEDURINGGA"), 0)));
      if (!$.Game.IsRunning) {
        $.LogF(S("/start [time] - %s"), $.LoadResStr(S("IDS_TEXT_STARTTHEROUNDWITHSPECIFIE")));
        $.LogF(S("/abort - %s"), $.LoadResStr(S("IDS_TEXT_ABORTSTARTCOUNTDOWN")));
        $.LogF(S("/alert - %s"), $.LoadResStr(S("IDS_TEXT_ALERTTHEHOSTIFTHEHOSTISAW")));
        $.LogF(S("/joinplr [filename] - %s"), $.LoadResStr(S("IDS_TEXT_JOINALOCALPLAYERFROMTHESP")));
        $.LogF(S("/plrclr [player] [RGB] - %s"), $.LoadResStr(S("IDS_TEXT_CHANGETHECOLOROFTHESPECIF")));
        $.LogF(S("/plrclr [RGB] - %s"), $.LoadResStr(S("IDS_TEXT_CHANGEYOUROWNPLAYERCOLOR")));
      } else {
        $.LogF(S("/fast [x] - %s"), $.LoadResStr(S("IDS_TEXT_SETTOFASTMODESKIPPINGXFRA")));
        $.LogF(S("/slow - %s"), $.LoadResStr(S("IDS_TEXT_SETTONORMALSPEEDMODE")));
        $.LogF(S("/chart - %s"), $.LoadResStr(S("IDS_TEXT_DISPLAYNETWORKSTATISTICS")));
        $.LogF(S("/nodebug - %s"), $.LoadResStr(S("IDS_TEXT_PREVENTDEBUGMODEINTHISROU")));
        $.LogF(S("/script [script] - %s"), $.LoadResStr(S("IDS_TEXT_EXECUTEASCRIPTCOMMAND")));
        $.LogF(S("/screenshot [zoom] - %s"), $.LoadResStr(S("IDS_TEXT_SAFEZOOMEDFULLSCREENSHOT")));
      }
      $.LogF(S("/kick [client] - %s"), $.LoadResStr(S("IDS_TEXT_KICKTHESPECIFIEDCLIENT")));
      $.LogF(S("/observer [client] - %s"), $.LoadResStr(S("IDS_TEXT_SETTHESPECIFIEDCLIENTTOOB")));
      $.LogF(S("/me [action] - %s"), $.LoadResStr(S("IDS_TEXT_PERFORMANACTIONINYOURNAME")));
      $.LogF(S("/sound [sound] - %s"), $.LoadResStr(S("IDS_TEXT_PLAYASOUNDFROMTHEGLOBALSO")));
      if ($.Game.IsRunning) {
        $.LogF(S("/private [player] [message] - %s"), $.LoadResStr(S("IDS_MSG_SENDAPRIVATEMESSAGETOTHES")));
      }
      $.LogF(S("/team [message] - %s"), $.LoadResStr(S("IDS_MSG_SENDAPRIVATEMESSAGETOYOUR")));
      $.LogF(S("/set comment [comment] - %s"), $.LoadResStr(S("IDS_TEXT_SETANEWNETWORKCOMMENT")));
      $.LogF(S("/set password [password] - %s"), $.LoadResStr(S("IDS_TEXT_SETANEWNETWORKPASSWORD")));
      $.LogF(S("/set maxplayer [number] - %s"), $.LoadResStr(S("IDS_TEXT_SETANEWMAXIMUMNUMBEROFPLA")));
      $.LogF(S("/todo [text] - %s"), $.LoadResStr(S("IDS_TEXT_ADDTODO")));
      $.LogF(S("/clear - %s"), $.LoadResStr(S("IDS_MSG_CLEARTHEMESSAGEBOARD")));
      return true;
    }
    if ($.SEqual(P(szCmdName, 0), S("script"))) {
      if (!$.Game.IsRunning) {
        return false;
      }
      if (!$.Game.DebugMode) {
        return false;
      }
      $.Control$2.DoInput(136 /*CID_Script*/, new $.C4ControlScript().init$pi8$i32$b$b(pCmdPar, -2), 4 /*CDT_Decide*/);
      return true;
    }
    if ($.SEqual(P(szCmdName, 0), S("set"))) {
      if ($.SEqual2(pCmdPar, S("maxplayer "))) {
        if ($.Control$2.isCtrlHost()) {
          if (c$atoi($padd(pCmdPar, 10)) === 0 && !$.SEqual($padd(pCmdPar, 10), S("0"))) {
            $.Log(S("Syntax: /set maxplayer count"));
            return false;
          }
          $.Control$2.DoInput(135 /*CID_Set*/, new $.C4ControlSet().init$i32$i32(2 /*C4CVT_MaxPlayer*/, c$atoi($padd(pCmdPar, 10))), 4 /*CDT_Decide*/);
          return true;
        }
      }
      if ($.SEqual2(pCmdPar, S("comment ")) || $.SEqual(pCmdPar, S("comment"))) {
        if (!$.Network.isEnabled() || !$.Network.isHost()) {
          return false;
        }
        $.Config.Network.Comment.CopyValidated$pi8(pCmdPar.a[pCmdPar.o + 7] !== 0 ? $padd(pCmdPar, 8) : S(""));
        $.Network.InvalidateReference();
        $.Log($.LoadResStr(S("IDS_NET_COMMENTCHANGED")));
        return true;
      }
      if ($.SEqual2(pCmdPar, S("password ")) || $.SEqual(pCmdPar, S("password"))) {
        if (!$.Network.isEnabled() || !$.Network.isHost()) {
          return false;
        }
        $.Network.SetPassword(pCmdPar.a[pCmdPar.o + 8] !== 0 ? $padd(pCmdPar, 9) : null);
        if (pLobby != null) {
          pLobby.UpdatePassword();
        }
        return true;
      }
      return false;
    }
    if ($.SEqual(P(szCmdName, 0), S("netgetscen"))) {
      if ($.Network.isEnabled() && !$.Network.isHost() && pLobby == null) {
        let pResCoreScen = $.Game.Parameters.Scenario.getResCore();
        if (pResCoreScen != null) {
          let pScenario = $.Network.ResList.getRefRes$i32(pResCoreScen.getID());
          if (pScenario.op_C4Network2Res_() != null) {
            if ($.C4Group_CopyItem(pScenario.op_arrow().getFile(), $.Config.AtUserDataPath($.GetFilename$2(P($.Game.ScenarioFilename, 0))))) {
              $.LogF($.LoadResStr(S("IDS_MSG_CMD_NETGETSCEN_SAVED")), $.Config.AtUserDataPath($.GetFilename$2(P($.Game.ScenarioFilename, 0))));
              return true;
            }
          }
        }
      }
      return false;
    }
    if ($.SEqual(P(szCmdName, 0), S("clear"))) {
      if (pLobby != null) {
        pLobby.ClearLog();
      } else if ($.GraphicsSystem.MessageBoard != null) {
        $.GraphicsSystem.MessageBoard.ClearLog();
      } else {
        $.Console.ClearLog();
      }
      return true;
    }
    if ($.SEqual(P(szCmdName, 0), S("kick"))) {
      if ($.Network.isEnabled() && $.Network.isHost()) {
        let pClient = $.Game.Clients.getClientByName(pCmdPar);
        if (pClient == null) {
          $.LogF($.LoadResStr(S("IDS_MSG_CMD_NOCLIENT")), pCmdPar);
          return false;
        }
        if ($.Game.Parameters.isLeague() && $.Players.GetAtClient$i32$i32(pClient.getID()) != null) {
          $.Network.Vote(1 /*VT_Kick*/, true, pClient.getID());
        } else {
          $.Game.Clients.CtrlRemove(pClient, $.LoadResStr(S("IDS_MSG_KICKFROMMSGBOARD")));
        }
      }
      return true;
    }
    if ($.SEqual(P(szCmdName, 0), S("fast"))) {
      if (!$.Game.IsRunning) {
        return false;
      }
      let iFS = 0;
      if ((iFS = c$atoi(pCmdPar)) === 0) {
        return false;
      }
      $.Game.FrameSkip = $.Clamp$i32$i32$i32(iFS, 1, 500);
      $.Game.FullSpeed = true;
      $.Application.NextTick();
      return true;
    }
    if ($.SEqual(P(szCmdName, 0), S("slow"))) {
      if (!$.Game.IsRunning) {
        return false;
      }
      $.Game.FullSpeed = false;
      $.Game.FrameSkip = 1;
      return true;
    }
    if ($.SEqual(P(szCmdName, 0), S("nodebug"))) {
      if (!$.Game.IsRunning) {
        return false;
      }
      $.Control$2.DoInput(135 /*CID_Set*/, new $.C4ControlSet().init$i32$i32(1 /*C4CVT_DisableDebug*/, 0), 4 /*CDT_Decide*/);
      return true;
    }
    if ($.SEqual(P(szCmdName, 0), S("activate")) || $.SEqual(P(szCmdName, 0), S("deactivate")) || $.SEqual(P(szCmdName, 0), S("observer"))) {
      if (!$.Network.isEnabled() || !$.Network.isHost()) {
        $.Log($.LoadResStr(S("IDS_MSG_CMD_HOSTONLY")));
        return false;
      }
      let pClient = $.Game.Clients.getClientByName(pCmdPar);
      if (pClient == null) {
        $.LogF($.LoadResStr(S("IDS_MSG_CMD_NOCLIENT")), pCmdPar);
        return false;
      }
      let pCtrl = null;
      if (szCmdName[0] === 97) {
        pCtrl = new $.C4ControlClientUpdate().init$i32$i32$i32(pClient.getID(), 0 /*CUT_Activate*/, 1);
      } else if (szCmdName[0] === 100 && !$.Game.Parameters.isLeague()) {
        pCtrl = new $.C4ControlClientUpdate().init$i32$i32$i32(pClient.getID(), 0 /*CUT_Activate*/, 0);
      } else if (szCmdName[0] === 111 && !$.Game.Parameters.isLeague()) {
        pCtrl = new $.C4ControlClientUpdate().init$i32$i32$i32(pClient.getID(), 1 /*CUT_SetObserver*/);
      }
      if (pCtrl != null) {
        $.Control$2.DoInput(129 /*CID_ClientUpdate*/, pCtrl, 1 /*CDT_Sync*/);
      } else {
        $.Log($.LoadResStr(S("IDS_LOG_COMMANDNOTALLOWEDINLEAGUE")));
      }
      return true;
    }
    if ($.SEqual(P(szCmdName, 0), S("centralctrl")) || $.SEqual(P(szCmdName, 0), S("decentralctrl")) || $.SEqual(P(szCmdName, 0), S("asyncctrl"))) {
      if (!$.Network.isEnabled() || !$.Network.isHost()) {
        $.Log($.LoadResStr(S("IDS_MSG_CMD_HOSTONLY")));
        return false;
      }
      $.Network.SetCtrlMode($rd(P(szCmdName, 0)) === 99 ? 1 /*CNM_Central*/ : $rd(P(szCmdName, 0)) === 100 ? 0 /*CNM_Decentral*/ : 2 /*CNM_Async*/);
      return true;
    }
    if ($.Game.IsRunning) {
      if ($.SEqual(P(szCmdName, 0), S("chart"))) {
        return $.Game.ToggleChart();
      }
    }
    if ($.SEqual(P(szCmdName, 0), S("screenshot"))) {
      let zoom = c$atof(pCmdPar);
      if (zoom <= 0) {
        zoom = 2;
      }
      $.GraphicsSystem.SaveScreenshot(true, Math.fround(zoom));
      return true;
    }
    if ($.SEqual(P(szCmdName, 0), S("todo"))) {
      if (pCmdPar == null || pCmdPar.a[pCmdPar.o] === 0) {
        return false;
      }
      const todo_filenames = [P($.Config.Developer.TodoFilename, 0), P($.Config.Developer.AltTodoFilename, 0)];
      let success = false;
      for (const i of todo_filenames) {
        let todo_filename = new $.StdCopyStrBuf().init$pi8$b(i);
        todo_filename.Replace(S("{USERPATH}"), P($.Config.General.UserDataPath, 0));
        let replacements = todo_filename.Replace(S("{SCENARIO}"), $.Game.ScenarioFile.GetFullName().getData());
        if (replacements !== 0) {
          if (!$.Game.ScenarioFile.IsOpen()) {
            continue;
          }
          if ($.Game.ScenarioFile.IsPacked()) {
            continue;
          }
          if ($.Control$2.isNetwork() && !$.Control$2.isCtrlHost()) {
            continue;
          }
        }
        let todo_file = new $.CStdFile().init();
        if (!todo_file.Append(todo_filename.getData())) {
          continue;
        }
        if (!todo_file.WriteString(pCmdPar)) {
          continue;
        }
        if (!todo_file.Close$ppStdBuf()) {
          continue;
        }
        success = true;
        break;
      }
      if (!success) {
        $.Log($.LoadResStr(S("IDS_ERR_TODO")));
      }
      return true;
    }
    let pCmd = null;
    if ($.Game.IsRunning) {
      if ((pCmd = this.GetCommand(P(szCmdName, 0))) != null) {
        let player_num = -1;
        let player = $.Players.GetLocalByIndex(0);
        if (player != null) {
          player_num = player.Number;
        }
        $.Control$2.DoInput(138 /*CID_MsgBoardCmd*/, new $.C4ControlMsgBoardCmd().init$pi8$pi8$i32(P(szCmdName, 0), pCmdPar, player_num), 4 /*CDT_Decide*/);
        return true;
      }
    }
    let sErr = new $.StdStrBuf();
    sErr.Format($.LoadResStr(S("IDS_ERR_UNKNOWNCMD")), P(szCmdName, 0));
    if (pLobby != null) {
      pLobby.OnError$pi8(sErr.getData());
    } else {
      $.Log(sErr.getData());
    }
    return false;
  }

  ClearPointers(pObj) {
    let pDlg = this.GetTypeIn();
    if (pDlg != null && pDlg.GetScriptTargetObject() === pObj) {
      this.CloseTypeIn();
    }
  }

  AbortMsgBoardQuery(pObj, iPlr) {
    let pDlg = this.GetTypeIn();
    if (pDlg != null && pDlg.IsScriptQueried() && pDlg.GetScriptTargetObject() === pObj && pDlg.GetScriptTargetPlayer() === iPlr) {
      this.CloseTypeIn();
    }
  }

  $clone() { return new C4MessageInput().$assign(this); }
  $assign(o) {
    this.BackBuffer = $own(o.BackBuffer.map(($e0) => $e0.slice()));
    this.pCommands = o.pCommands;
    return this;
  }
}

export class C4MessageBoardQuery {
  CallbackObj = new $.C4ObjectPtr().init$v();
  sInputQuery = new $.StdStrBuf();
  fAnswered = false;
  fIsUppercase = false;
  pNext = null;

  init$pC4Object$StdStrBuf$b(pCallbackObj, rsInputQuery, fIsUppercase) {
    this.CallbackObj = new $.C4ObjectPtr().init$pC4Object(pCallbackObj);
    this.sInputQuery = new $.StdStrBuf();
    this.fAnswered = false;
    this.fIsUppercase = fIsUppercase;
    this.pNext = null;
    this.sInputQuery.Copy$StdStrBuf(rsInputQuery);
    return this;
  }

  init$v() {
    this.CallbackObj = new $.C4ObjectPtr().init$pC4Object(null);
    this.sInputQuery = new $.StdStrBuf();
    this.fAnswered = false;
    this.fIsUppercase = false;
    this.pNext = null;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Separator(7 /*SEP_START*/);
    pComp.Value$rC4ObjectPtr(this.CallbackObj);
    pComp.Separator();
    pComp.Value$rStdStrBuf(this.sInputQuery);
    pComp.Separator();
    pComp.Value$rb(P(this, "fIsUppercase"));
    pComp.Separator(8 /*SEP_END*/);
  }

  $clone() { return new C4MessageBoardQuery().$assign(this); }
  $assign(o) {
    this.CallbackObj.$assign(o.CallbackObj);
    this.sInputQuery.$assign(o.sInputQuery);
    this.fAnswered = o.fAnswered;
    this.fIsUppercase = o.fIsUppercase;
    this.pNext = o.pNext;
    return this;
  }
}

export class C4ChatInputDialog extends InputDialog {
  static pInstance;
  pKeyHistoryUp = null;
  pKeyHistoryDown = null;
  pKeyAbort = null;
  pKeyNickComplete = null;
  pKeyPlrControl = null;
  pKeyGamepadControl = null;
  pKeyBackClose = null;
  fObjInput = false;
  fUppercase = false;
  pTarget = null;
  iPlr = 0;
  BackIndex = 0;
  fProcessed = false;

  KeyHistoryUpDown(fUp) {
    this.pEdit.SelectAll();
    this.pEdit.DeleteSelection();
    let szPrevInput = $.MessageInput.GetBackBuffer(fUp ? (this.BackIndex = this.BackIndex + 1 | 0) : (this.BackIndex = this.BackIndex - 1 | 0));
    if (szPrevInput == null || szPrevInput.a[szPrevInput.o] === 0) {
      this.BackIndex = -1;
    } else {
      this.pEdit.InsertText(szPrevInput, true);
      this.pEdit.SelectAll();
    }
    return true;
  }

  KeyCompleteNick() {
    if (this.pEdit == null) {
      return false;
    }
    const IncompleteNick = new Int8Array(257);
    if (!this.pEdit.GetCurrentWord(P(IncompleteNick, 0), 256)) {
      return false;
    }
    if (!($rd(P(IncompleteNick, 0)) !== 0)) {
      return false;
    }
    let plr = $.Players.First;
    while (plr != null) {
      if ($.SEqualNoCase(plr.GetName(), P(IncompleteNick, 0), $.SLen(P(IncompleteNick, 0)) | 0)) {
        this.pEdit.InsertText($padd(plr.GetName(), $.SLen(P(IncompleteNick, 0))), true);
        return true;
      } else {
        plr = plr.Next;
      }
    }
    return false;
  }

  KeyPlrControl(key) {
    $.Game.DoKeyboardInput$u64$i32$b$b$b$b$pDialog$b$i32(key.Key & 0xffff, 1 /*KEYEV_Down*/, !!((key.dwShift & 1) >>> 0 !== 0), false, !!((key.dwShift & 4) >>> 0 !== 0), key.IsRepeated(), null, true);
    return true;
  }

  KeyGamepadControlDown(key) {
    if (!$.Key_IsGamepad(key.Key)) {
      return false;
    }
    $.Game.DoKeyboardInput$u64$i32$b$b$b$b$pDialog$b$i32(key.Key, 1 /*KEYEV_Down*/, false, false, false, key.IsRepeated(), null, true);
    return true;
  }

  KeyGamepadControlUp(key) {
    if (!$.Key_IsGamepad(key.Key)) {
      return false;
    }
    $.Game.DoKeyboardInput$u64$i32$b$b$b$b$pDialog$b$i32(key.Key, 2 /*KEYEV_Up*/, false, false, false, key.IsRepeated(), null, true);
    return true;
  }

  KeyGamepadControlPressed(key) {
    if (!$.Key_IsGamepad(key.Key)) {
      return false;
    }
    $.Game.DoKeyboardInput$u64$i32$b$b$b$b$pDialog$b$i32(key.Key, 3 /*KEYEV_Pressed*/, false, false, false, key.IsRepeated(), null, true);
    return true;
  }

  KeyBackspaceClose() {
    if (this.pEdit.GetText$v() != null && $rd(this.pEdit.GetText$v()) !== 0) {
      return false;
    }
    this.Close$b(false);
    return true;
  }

  OnChatInput(edt, _fPasting, fPastingMore) {
    if (this.fProcessed) {
      return 1 /*IR_CloseDlg*/;
    }
    let pEdt = edt;
    let szInputText = pEdt.GetText$v();
    $.MessageInput.StoreBackBuffer(szInputText);
    if (this.fObjInput) {
      this.fProcessed = true;
      let pPlr = $.Players.Get(this.iPlr);
      if (pPlr == null) {
        return 1 /*IR_CloseDlg*/;
      }
      if (!pPlr.MarkMessageBoardQueryAnswered(this.pTarget)) {
        return 1 /*IR_CloseDlg*/;
      }
      if (this.fUppercase) {
        $.SCapitalize(szInputText);
      }
      $.Control$2.DoInput(137 /*CID_MsgBoardReply*/, new $.C4ControlMsgBoardReply().init$pi8$i32$i32(szInputText, this.pTarget != null ? this.pTarget.Number : 0, this.iPlr), 4 /*CDT_Decide*/);
      return 1 /*IR_CloseDlg*/;
    } else {
      $.MessageInput.ProcessInput(szInputText);
    }
    if (this !== C4ChatInputDialog.pInstance) {
      return 3 /*IR_Abort*/;
    }
    pEdt.SelectAll();
    if (fPastingMore) {
      return 0 /*IR_None*/;
    }
    this.fProcessed = true;
    return 1 /*IR_CloseDlg*/;
  }

  OnChatCancel() {
    this.fProcessed = true;
    if (this.fObjInput) {
      let pPlr = $.Players.Get(this.iPlr);
      if (pPlr == null) {
        return;
      }
      if (pPlr.MarkMessageBoardQueryAnswered(this.pTarget)) {
        $.Control$2.DoInput(137 /*CID_MsgBoardReply*/, new $.C4ControlMsgBoardReply().init$pi8$i32$i32(null, this.pTarget != null ? this.pTarget.Number : 0, this.iPlr), 4 /*CDT_Decide*/);
      }
    }
  }

  OnClosed(fOK) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4ChatInputDialog && C4ChatInputDialog.prototype instanceof $c) return $c.prototype.OnClosed.apply(this, arguments); }
    if (!this.fProcessed) {
      if (fOK) {
        this.OnChatInput(this.pEdit, false, false);
      } else {
        this.OnChatCancel();
      }
    } else {
      this.OnChatCancel();
    }
    $.InputDialog.prototype.OnClosed.call(this, fOK);
  }

  GetID$v() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4ChatInputDialog && C4ChatInputDialog.prototype instanceof $c) return $c.prototype.GetID$v.apply(this, arguments); }
    return S("ChatDialog");
  }

  init(fObjInput, pScriptTarget, fUppercase, fTeam, iPlr, rsInputQuery) {
    super.init(fObjInput ? rsInputQuery.getData() : $.LoadResStrNoAmp(S("IDS_CTL_CHAT")), null, -1 /*Ico_None*/, null, !fObjInput || IsSmallInputQuery(rsInputQuery.getData()));
    this.fObjInput = fObjInput;
    this.fUppercase = fUppercase;
    this.pTarget = pScriptTarget;
    this.iPlr = iPlr;
    this.BackIndex = -1;
    this.fProcessed = false;
    this.$dyn = C4ChatInputDialog;
    C4ChatInputDialog.pInstance = this;
    this.SetCustomEdit(new $.CallbackEdit$C4ChatInputDialog().init(new $.C4Rect().init$i32$i32$i32$i32(0, 0, 10, 10), this, "OnChatInput", "OnChatCancel"));
    this.pKeyHistoryUp = new $.C4KeyBinding().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(103), S("ChatHistoryUp"), 2 /*KEYSCOPE_Gui*/, new $.DlgKeyCBEx$C4ChatInputDialog$b().init(this, true, "KeyHistoryUpDown"), 4);
    this.pKeyHistoryDown = new $.C4KeyBinding().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(108), S("ChatHistoryDown"), 2 /*KEYSCOPE_Gui*/, new $.DlgKeyCBEx$C4ChatInputDialog$b().init(this, false, "KeyHistoryUpDown"), 4);
    this.pKeyAbort = new $.C4KeyBinding().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(60), S("ChatAbort"), 2 /*KEYSCOPE_Gui*/, new $.DlgKeyCB$Dialog().init(this, "KeyEscape"), 4);
    this.pKeyNickComplete = new $.C4KeyBinding().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(15), S("ChatNickComplete"), 2 /*KEYSCOPE_Gui*/, new $.DlgKeyCB$C4ChatInputDialog().init(this, "KeyCompleteNick"), 4);
    this.pKeyPlrControl = new $.C4KeyBinding().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(0xffffffffffffffff, 2), S("ChatForwardPlrCtrl"), 2 /*KEYSCOPE_Gui*/, new $.DlgKeyCBPassKey$C4ChatInputDialog().init(this, "KeyPlrControl"), 2);
    this.pKeyGamepadControl = new $.C4KeyBinding().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(0xffffffffffffffff), S("ChatForwardGamepadCtrl"), 2 /*KEYSCOPE_Gui*/, new $.DlgKeyCBPassKey$C4ChatInputDialog().init(this, "KeyGamepadControlDown", "KeyGamepadControlUp", "KeyGamepadControlPressed"), 7);
    this.pKeyBackClose = new $.C4KeyBinding().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(14), S("ChatBackspaceClose"), 2 /*KEYSCOPE_Gui*/, new $.DlgKeyCB$C4ChatInputDialog().init(this, "KeyBackspaceClose"), 4);
    this.SetDelOnClose();
    if (fTeam) {
      this.pEdit.InsertText(S("/team "), true);
    }
    return this;
  }

  $dtor() {
    $delete(this.pKeyHistoryUp);
    $delete(this.pKeyHistoryDown);
    $delete(this.pKeyAbort);
    $delete(this.pKeyNickComplete);
    $delete(this.pKeyPlrControl);
    $delete(this.pKeyGamepadControl);
    $delete(this.pKeyBackClose);
    if (this === C4ChatInputDialog.pInstance) {
      C4ChatInputDialog.pInstance = null;
    }
    super.$dtor();
  }

  GetZOrdering() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4ChatInputDialog && C4ChatInputDialog.prototype instanceof $c) return $c.prototype.GetZOrdering.apply(this, arguments); }
    return 2;
  }

  IsFreePlaceDialog() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4ChatInputDialog && C4ChatInputDialog.prototype instanceof $c) return $c.prototype.IsFreePlaceDialog.apply(this, arguments); }
    return true;
  }

  IsBottomPlacementDialog() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4ChatInputDialog && C4ChatInputDialog.prototype instanceof $c) return $c.prototype.IsBottomPlacementDialog.apply(this, arguments); }
    return true;
  }

  IsExclusiveDialog() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4ChatInputDialog && C4ChatInputDialog.prototype instanceof $c) return $c.prototype.IsExclusiveDialog.apply(this, arguments); }
    return true;
  }

  IsMouseControlled() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4ChatInputDialog && C4ChatInputDialog.prototype instanceof $c) return $c.prototype.IsMouseControlled.apply(this, arguments); }
    return false;
  }

  OnEnter() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4ChatInputDialog && C4ChatInputDialog.prototype instanceof $c) return $c.prototype.OnEnter.apply(this, arguments); }
    this.OnChatInput(this.pEdit, false, false);
    return true;
  }

  static IsShown() {
    return !(C4ChatInputDialog.pInstance == null);
  }

  static GetInstance() {
    return C4ChatInputDialog.pInstance;
  }

  IsScriptQueried() {
    return this.fObjInput;
  }

  GetScriptTargetObject() {
    return this.pTarget;
  }

  GetScriptTargetPlayer() {
    return this.iPlr;
  }

  $clone() { return new C4ChatInputDialog().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pKeyHistoryUp = o.pKeyHistoryUp;
    this.pKeyHistoryDown = o.pKeyHistoryDown;
    this.pKeyAbort = o.pKeyAbort;
    this.pKeyNickComplete = o.pKeyNickComplete;
    this.pKeyPlrControl = o.pKeyPlrControl;
    this.pKeyGamepadControl = o.pKeyGamepadControl;
    this.pKeyBackClose = o.pKeyBackClose;
    this.fObjInput = o.fObjInput;
    this.fUppercase = o.fUppercase;
    this.pTarget = o.pTarget;
    this.iPlr = o.iPlr;
    this.BackIndex = o.BackIndex;
    this.fProcessed = o.fProcessed;
    return this;
  }
}


export function IsSmallInputQuery(szInputQuery) {
  if (szInputQuery == null) {
    return true;
  }
  const w = [0];
  const h = [0];
  if ($.SCharCount(124, szInputQuery) !== 0) {
    return false;
  }
  if (!$.GraphicsResource.TextFont.GetTextExtent(szInputQuery, P(w, 0), P(h, 0), true)) {
    return false;
  }
  return w[0] < ($.GetScreenWdt() / 5 | 0);
}


export function $init(): void {
  C4ChatInputDialog.pInstance = null;
  $.C4MSGB_BackBufferMax$C4MessageInput = 20;
  $.MessageInput = new C4MessageInput(); $.MessageInput.init();
}

Object.assign($, { C4ChatInputDialog, C4MessageBoardCommand, C4MessageBoardQuery, C4MessageInput, IsSmallInputQuery });
