// @ts-nocheck
// OpenClonk 36de799: src/gui/C4MainMenu.cpp, src/gui/C4MainMenu.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { C4Menu } from './C4Menu.ts';
import { $u64n } from '../../rt/int.ts';
import { c$atoi, c$sscanf, c$strlen } from '../../rt/libc.ts';
import { $cs, $padd, $peq, $rd, $wr, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { StdString } from '../../rt/std.ts';

export class C4MainMenu extends C4Menu {
  Player = 0;

  init() {
    super.init();
    this.$dyn = C4MainMenu;
    this.Clear$v();
    return this;
  }

  Default() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4MainMenu && C4MainMenu.prototype instanceof $c) return $c.prototype.Default.apply(this, arguments); }
    $.C4Menu.prototype.Default.call(this);
    this.Player = -1;
  }

  Init$rC4FacetSurface$pi8$i32$i32$i32$i32$i32(fctSymbol, szEmpty, iPlayer, iExtra = 0, iExtraData = 0, iId = 0, iStyle = 0) {
    if (!this.DoInit$rC4FacetSurface$pi8$i32$i32$i32$i32(fctSymbol, szEmpty, iExtra, iExtraData, iId, iStyle)) {
      return false;
    }
    this.Player = iPlayer;
    return true;
  }

  InitRefSym$C4Facet$pi8$i32$i32$i32$i32$i32(fctSymbol, szEmpty, iPlayer, iExtra = 0, iExtraData = 0, iId = 0, iStyle = 0) {
    if (!this.DoInitRefSym(fctSymbol, szEmpty, iExtra, iExtraData, iId, iStyle)) {
      return false;
    }
    this.Player = iPlayer;
    return true;
  }

  ActivateMain(iPlayer) {
    let pPlr = $.Players.Get(iPlayer);
    let fctSymbol = new $.C4FacetSurface().init();
    fctSymbol.Create(35, 35);
    $.GraphicsResource.fctOKCancel.Draw$rC4Facet$b$i32$i32$b(fctSymbol, true, 1, 1);
    this.Init$rC4FacetSurface$pi8$i32$i32$i32$i32$i32(fctSymbol, $.LoadResStr(pPlr != null ? S("IDS_MENU_CPMAIN") : S("IDS_MENU_OBSERVER")), iPlayer, 0, 0, 0, 1);
    this.SetAlignment(9);
    if (pPlr != null) {
      this.AddRefSym($.LoadResStr(S("IDS_MENU_CPGOALS")), $.GraphicsResource.fctMenu.GetPhase(4), S("ActivateMenu:Goals"), 0xbc614e, null, $.LoadResStr(S("IDS_MENU_CPGOALSINFO")));
      this.AddRefSym($.LoadResStr(S("IDS_MENU_CPRULES")), $.GraphicsResource.fctMenu.GetPhase(5), S("ActivateMenu:Rules"), 0xbc614e, null, $.LoadResStr(S("IDS_MENU_CPRULESINFO")));
    }
    if (pPlr == null) {
      this.AddRefSym($.LoadResStr(S("IDS_TEXT_VIEW")), $.Icon.GetIconFacet$i32(50 /*Ico_View*/), S("ActivateMenu:Observer"), 0xbc614e, null, $.LoadResStr(S("IDS_TEXT_DETERMINEPLAYERVIEWTOFOLL")));
    }
    if (pPlr != null && $.Players.GetCount$v() > 1) {
      $.GraphicsResource.fctFlagClr.Surface.SetClr(0xff0000);
      this.AddRefSym($.LoadResStr(S("IDS_MENU_CPATTACK")), $.GraphicsResource.fctMenu.GetPhase(7), S("ActivateMenu:Hostility"), 0xbc614e, null, $.LoadResStr(S("IDS_MENU_CPATTACKINFO")));
    }
    if (pPlr != null && $.Game.Teams.IsTeamSwitchAllowed()) {
      let fctTeams = new $.C4Facet().init$v();
      fctTeams.$assign($.Icon.GetIconFacet$i32(19 /*Ico_Team*/));
      this.AddRefSym($.LoadResStr(S("IDS_MSG_SELTEAM")), fctTeams, S("ActivateMenu:TeamSel"), 0xbc614e, null, $.LoadResStr(S("IDS_MSG_ALLOWSYOUTOJOINADIFFERENT")));
    }
    if ($.Players.GetCount$v() < $.Game.Parameters.MaxPlayers && !$.Game.Parameters.isLeague()) {
      this.AddRefSym($.LoadResStr(S("IDS_MENU_CPNEWPLAYER")), $.GraphicsResource.fctPlayerClr.GetPhase(), S("ActivateMenu:NewPlayer"), 0xbc614e, null, $.LoadResStr(S("IDS_MENU_CPNEWPLAYERINFO")));
    }
    if (pPlr != null && (!$.Network.isEnabled() || $.Network.isHost())) {
      this.AddRefSym($.LoadResStr(S("IDS_MENU_CPSAVEGAME")), $.GraphicsResource.fctMenu.GetPhase(0), S("ActivateMenu:Save:Game"), 0xbc614e, null, $.LoadResStr(S("IDS_MENU_CPSAVEGAMEINFO")));
    }
    this.AddRefSym($.LoadResStr(S("IDS_MNU_OPTIONS")), $.GraphicsResource.fctOptions.GetPhase(0), S("ActivateMenu:Options"), 0xbc614e, null, $.LoadResStr(S("IDS_MNU_OPTIONSINFO")));
    if ($.Network.isEnabled()) {
      if ($.Network.isHost() && $.Game.Clients.getClient(null) != null) {
        this.AddRefSym($.LoadResStr(S("IDS_MENU_DISCONNECT")), $.Icon.GetIconFacet$i32(49 /*Ico_Disconnect*/), S("ActivateMenu:Host"), 0xbc614e, null, $.LoadResStr(S("IDS_TEXT_KICKCERTAINCLIENTSFROMTHE")));
      }
      if (!$.Network.isHost()) {
        this.AddRefSym($.LoadResStr(S("IDS_MENU_DISCONNECT")), $.Icon.GetIconFacet$i32(49 /*Ico_Disconnect*/), S("ActivateMenu:Client"), 0xbc614e, null, $.LoadResStr(S("IDS_TEXT_DISCONNECTTHEGAMEFROMTHES")));
      }
    }
    if (pPlr != null) {
      this.AddRefSym($.LoadResStr(S("IDS_MENU_CPSURRENDER")), $.Icon.GetIconFacet$i32(45 /*Ico_Surrender*/), S("ActivateMenu:Surrender"), 0xbc614e, null, $.LoadResStr(S("IDS_MENU_CPSURRENDERINFO")));
    }
    if ($.Application.isEditor === 0) {
      this.AddRefSym($.LoadResStr(S("IDS_MENU_ABORT")), $.Icon.GetIconFacet$i32(33 /*Ico_Exit*/), S("Abort"), 0xbc614e, null, $.LoadResStr(S("IDS_MENU_ABORT_DESC")));
    }
    if (this.GetItemCount() === 0) {
      this.Close$b(false);
    }
    return true;
  }

  ActivateNewPlayer(iPlayer) {
    if ($.Game.Parameters.isLeague() || $.Game.C4S.Head.Replay) {
      return false;
    }
    if ($.Players.GetCount$v() >= $.Game.Parameters.MaxPlayers) {
      return false;
    }
    if ($.GraphicsResource.fctPlayerClr.Surface != null) {
      $.GraphicsResource.fctPlayerClr.Surface.SetClr(255);
    }
    this.InitRefSym$C4Facet$pi8$i32$i32$i32$i32$i32($.GraphicsResource.fctPlayerClr, $.LoadResStr(S("IDS_MENU_NOPLRFILES")), iPlayer);
    for (let iter = new $.DirectoryIterator().init$pi8(P($.Config.General.UserDataPath, 0)); iter.op_mul() != null; iter.op_inc$v()) {
      if ($.WildcardMatch(S("*.ocp"), iter.op_mul())) {
        const szFilename = new Int8Array(4097);
        const szCommand = new Int8Array(4127);
        $.SCopy$pi8$pi8$u64(iter.op_mul(), P(szFilename, 0), 4096);
        if ($.DirectoryExists(P(szFilename, 0))) {
          continue;
        }
        if ($.Players.FileInUse(P(szFilename, 0))) {
          continue;
        }
        let hGroup = new $.C4Group().init();
        if (!hGroup.Open(P(szFilename, 0))) {
          continue;
        }
        let C4P = new $.C4PlayerInfoCore().init();
        if (!C4P.Load$rC4Group(hGroup)) {
          hGroup.Close$v();
          continue;
        }
        hGroup.Close$v();
        $.ssprintf$18(szCommand, S("JoinPlayer:%s"), P(szFilename, 0));
        let sItemText = new $.StdStrBuf();
        sItemText.Format($.LoadResStr(S("IDS_MENU_NEWPLAYER")), P(C4P.PrefName, 0));
        let fctSymbol = new $.C4FacetSurface().init();
        this.Add$pi8$rC4FacetSurface$pi8$i32$pC4Object$pi8$C4ID$pi8$b$i32$b(sItemText.getData(), fctSymbol, P(szCommand, 0));
        $.C4FacetSurface.prototype.Default.call(fctSymbol);
      }
    }
    this.SetAlignment(9);
    this.SetCloseCommand(S("ActivateMenu:Main"));
    return true;
  }

  ActivateHostility(iPlayer) {
    let fctSymbol = new $.C4FacetSurface().init();
    fctSymbol.Create(35, 35);
    $.GraphicsResource.fctMenu.GetPhase(7).Draw$rC4Facet$b$i32$i32$b(fctSymbol);
    this.Init$rC4FacetSurface$pi8$i32$i32$i32$i32$i32(fctSymbol, $.LoadResStr(S("IDS_MENU_CPATTACK")), iPlayer, 0, 0, 1);
    this.SetAlignment(9);
    this.SetPermanent(true);
    this.Refill();
    this.SetCloseCommand(S("ActivateMenu:Main"));
    return true;
  }

  ActivateGoals(iPlayer, fDoActivate) {
    let fctSymbol = new $.C4FacetSurface().init();
    let fctGF = new $.C4Facet().init$v();
    if (fDoActivate) {
      this.InitRefSym$C4Facet$pi8$i32$i32$i32$i32$i32($.GraphicsResource.fctMenu.GetPhase(4), $.LoadResStr(S("IDS_MENU_CPGOALS")), iPlayer);
      this.SetAlignment(9);
      this.SetPermanent(false);
      fctGF.Set$pC4Surface$f32$f32$f32$f32(null, Math.fround(Math.fround(Math.fround(35) - $.GraphicsResource.fctCaptain.Wdt) - Math.fround(2)), Math.fround(2), $.GraphicsResource.fctCaptain.Wdt, $.GraphicsResource.fctCaptain.Hgt);
    }
    let GoalList = new $.C4IDList().init();
    let FulfilledGoalList = new $.C4IDList().init();
    $.C4RoundResults.EvaluateGoals(GoalList, FulfilledGoalList, iPlayer);
    if (fDoActivate) {
      let iNumGoals = GoalList.GetNumberOfIDs$v();
      const cnt = [0];
      let idGoal = new $.C4ID().init$v();
      let pDef = null;
      for (let i = 0; i < iNumGoals; i = i + 1 | 0) {
        if (idGoal.$assign(GoalList.GetID$u64$pi32($u64n(i), P(cnt, 0))).op_unsigned_long_C4ID_() != null) {
          if ((pDef = $.C4Id2Def(idGoal.$clone())) != null) {
            fctSymbol.Create(35, 35);
            pDef.Draw$rC4Facet$b$u32$pC4Object$i32$i32$pC4DrawTransform$pi8(fctSymbol);
            if (FulfilledGoalList.GetIDCount(idGoal.$clone()) !== 0) {
              fctGF.Surface = fctSymbol.Surface;
              $.GraphicsResource.fctCaptain.Draw$rC4Facet$b$i32$i32$b(fctGF);
            }
            let Command = new $.StdStrBuf();
            Command.Format(S("Player:Goal:%s"), idGoal.ToString());
            this.Add$pi8$rC4FacetSurface$pi8$i32$pC4Object$pi8$C4ID$pi8$b$i32$b(pDef.GetName(), fctSymbol, Command.getData(), 0xbc614e, null, S(""));
          }
        }
      }
      this.SetCloseCommand(S("ActivateMenu:Main"));
    }
    return true;
  }

  ActivateRules(iPlayer) {
    const Command = new Int8Array(256);
    let fctSymbol = new $.C4FacetSurface().init();
    this.InitRefSym$C4Facet$pi8$i32$i32$i32$i32$i32($.GraphicsResource.fctMenu.GetPhase(5), $.LoadResStr(S("IDS_MENU_CPRULES")), iPlayer);
    this.SetAlignment(9);
    this.SetPermanent(false);
    let cnt = 0;
    let idGoal = new $.C4ID().init$v();
    let pDef = null;
    for (cnt = 0; idGoal.$assign($.Objects.GetListID(64, cnt)).op_unsigned_long_C4ID_() != null; cnt = cnt + 1 | 0) {
      if ((pDef = $.C4Id2Def(idGoal.$clone())) != null) {
        fctSymbol.Create(35, 35);
        pDef.Draw$rC4Facet$b$u32$pC4Object$i32$i32$pC4DrawTransform$pi8(fctSymbol);
        $.ssprintf$10(Command, S("Player:Rule:%s"), idGoal.ToString());
        this.Add$pi8$rC4FacetSurface$pi8$i32$pC4Object$pi8$C4ID$pi8$b$i32$b(pDef.GetName(), fctSymbol, P(Command, 0), 0xbc614e, null, S(""));
      }
    }
    this.SetCloseCommand(S("ActivateMenu:Main"));
    return true;
  }

  ActivateSavegame(iPlayer) {
    if (!$.Game.CanQuickSave()) {
      return false;
    }
    const DirPath = new Int8Array(4097);
    const ScenName = new Int8Array(4097);
    $wr(P(ScenName, 0), 0, 0);
    this.InitRefSym$C4Facet$pi8$i32$i32$i32$i32$i32($.GraphicsResource.fctMenu.GetPhase(0), $.LoadResStr(S("IDS_MENU_CPSAVEGAME")), iPlayer);
    this.SetAlignment(9);
    this.SetPermanent(true);
    $.SCopy$pi8$pi8($.GetFilename$2(P($.Game.ScenarioFilename, 0)), P(DirPath, 0));
    if (DirPath[c$strlen(P(DirPath, 0)) - 1] === 92) {
      DirPath[c$strlen(P(DirPath, 0)) - 1] = 0;
    }
    $.RemoveExtension$pi8(P(DirPath, 0));
    if (LooksLikeInteger(P(DirPath, 0))) {
      if ($.Game.pParentGroup != null) {
        $.SCopy$pi8$pi8($.GetFilenameOnly($.Game.pParentGroup.GetName()), P(ScenName, 0));
      } else {
        $.SCopy$pi8$pi8($.GetFilenameOnly(P($.Game.ScenarioFilename, 0)), P(ScenName, 0));
      }
    } else {
      $.SCopy$pi8$pi8(P(DirPath, 0), P(ScenName, 0));
      let pScenNameEnd = $padd(P(ScenName, 0), $.SLen(P(ScenName, 0)));
      while ($.Inside$i8$i8$i8($rd((pScenNameEnd = pScenNameEnd.add(-1))), 48, 57)) {
        if ($peq(pScenNameEnd, P(ScenName, 0))) {
          $.SCopy$pi8$pi8(S("dbg_error!"), P(ScenName, 0));
          pScenNameEnd = $padd($padd(P(ScenName, 0), $.SLen(P(ScenName, 0))), -1);
        }
      }
      pScenNameEnd.a[pScenNameEnd.o + 1] = 0;
    }
    let strFilename = new $.StdStrBuf();
    let strTitle = new $.StdStrBuf();
    strFilename.Format(S("%s.ocf%c%s%%d.ocs"), P(ScenName, 0), 47, P(ScenName, 0));
    strTitle.$assign($.Game.ScenarioTitle);
    let strFilenameIndexed = new $.StdStrBuf();
    let strCommand = new $.StdStrBuf();
    let strCaption = new $.StdStrBuf();
    let strSavePath = new $.StdStrBuf();
    for (let i = 1; i <= 10; i = i + 1 | 0) {
      strFilenameIndexed.Format(strFilename.getData(), i);
      strCommand.Format(S("Save:Game:%s:%s"), strFilenameIndexed.getData(), strTitle.getData());
      strSavePath.Format(S("%s%c%s"), $.Config.AtUserDataPath(S("Savegames.ocf")), 47, strFilenameIndexed.getData());
      let fFree = !$.C4Group_IsGroup(strSavePath.getData());
      $.StdStrBuf.prototype.op_assign$pi8.call(strCaption, $.LoadResStr(S("IDS_MENU_CPSAVEGAME")));
      this.AddRefSym(strCaption.getData(), $.GraphicsResource.fctMenu.GetPhase(i - 1 | 0, fFree ? 2 : 1), strCommand.getData(), 0xbc614e, null, $.LoadResStr(S("IDS_MENU_CPSAVEGAMEINFO")));
    }
    this.SetCloseCommand(S("ActivateMenu:Main"));
    return true;
  }

  ActivateHost(iPlayer) {
    this.InitRefSym$C4Facet$pi8$i32$i32$i32$i32$i32($.Icon.GetIconFacet$i32(49 /*Ico_Disconnect*/), $.LoadResStr(S("IDS_MENU_DISCONNECTCLIENT")), iPlayer, 0, 0, 0, 1);
    this.SetAlignment(9);
    this.SetPermanent(true);
    for (let pClient = $.Network.Clients.GetNextClient(null); pClient != null; pClient = $.Network.Clients.GetNextClient(pClient)) {
      let fHost = pClient.getID() === 0;
      let strText = new $.StdStrBuf();
      let strCommand = new $.StdStrBuf();
      strText.Format(S("%s (%s)"), pClient.getName(), pClient.getCore().getNick());
      strCommand.Format(S("Host:Kick:%d"), pClient.getID());
      let iIcon = fHost ? 4 /*Ico_Host*/ : pClient.isActivated() ? 5 /*Ico_Client*/ : 8 /*Ico_ObserverClient*/;
      this.AddRefSym(strText.getData(), $.Icon.GetIconFacet$i32(iIcon), strCommand.getData());
    }
    this.SetCloseCommand(S("ActivateMenu:Main"));
    return true;
  }

  ActivateClient(iPlayer) {
    let fctSymbol = new $.C4FacetSurface().init();
    this.InitRefSym$C4Facet$pi8$i32$i32$i32$i32$i32($.Icon.GetIconFacet$i32(49 /*Ico_Disconnect*/), $.LoadResStr(S("IDS_MENU_DISCONNECTFROMSERVER")), iPlayer, 0, 0, 0, 1);
    this.SetAlignment(9);
    fctSymbol.Create(35, 35);
    $.GraphicsResource.fctOKCancel.Draw$rC4Facet$b$i32$i32$b(fctSymbol, true, 3, 0);
    this.Add$pi8$rC4FacetSurface$pi8$i32$pC4Object$pi8$C4ID$pi8$b$i32$b($.LoadResStr(S("IDS_BTN_YES")), fctSymbol, S("Part"));
    fctSymbol.Create(35, 35);
    $.GraphicsResource.fctOKCancel.Draw$rC4Facet$b$i32$i32$b(fctSymbol, true, 1, 0);
    this.Add$pi8$rC4FacetSurface$pi8$i32$pC4Object$pi8$C4ID$pi8$b$i32$b($.LoadResStr(S("IDS_BTN_NO")), fctSymbol, S(""));
    this.SetCloseCommand(S("ActivateMenu:Main"));
    return true;
  }

  ActivateOptions(iPlayer, selection = 0) {
    this.InitRefSym$C4Facet$pi8$i32$i32$i32$i32$i32($.GraphicsResource.fctOptions.GetPhase(0), $.LoadResStr(S("IDS_MNU_OPTIONS")), iPlayer, 0, 0, 0, 1);
    this.SetAlignment(9);
    this.SetPermanent(true);
    this.AddRefSym($.LoadResStr(S("IDS_DLG_SOUND")), $.GraphicsResource.fctOptions.GetPhase(17 + $.Config.Sound.RXSound | 0), S("Options:Sound"), 0xbc614e);
    this.AddRefSym($.LoadResStr(S("IDS_MNU_MUSIC")), $.GraphicsResource.fctOptions.GetPhase(1 + $.Config.Sound.RXMusic | 0), S("Options:Music"), 0xbc614e);
    this.AddRefSym($.LoadResStr(S("IDS_MENU_DISPLAY")), $.GraphicsResource.fctMenu.GetPhase(8), S("ActivateMenu:Display"));
    this.SetSelection$i32$b$b(selection, false, true);
    this.SetCloseCommand(S("ActivateMenu:Main"));
    return true;
  }

  ActivateDisplay(iPlayer, selection = 0) {
    this.InitRefSym$C4Facet$pi8$i32$i32$i32$i32$i32($.GraphicsResource.fctMenu.GetPhase(8), $.LoadResStr(S("IDS_MENU_DISPLAY")), iPlayer, 0, 0, 0, 1);
    this.SetAlignment(9);
    this.SetPermanent(true);
    this.AddRefSym($.LoadResStr(S("IDS_MNU_PLAYERNAMES")), $.GraphicsResource.fctOptions.GetPhase(7 + $.Config.Graphics.ShowCrewNames | 0), S("Display:PlayerNames"), 0xbc614e, null, $.LoadResStr(S("IDS_MENU_PLAYERNAMES_DESC")));
    this.AddRefSym($.LoadResStr(S("IDS_MNU_CLONKNAMES")), $.GraphicsResource.fctOptions.GetPhase(9 + $.Config.Graphics.ShowCrewCNames | 0), S("Display:ClonkNames"), 0xbc614e, null, $.LoadResStr(S("IDS_MENU_CLONKNAMES_DESC")));
    if ($.Application.isEditor === 0) {
      this.AddRefSym($.LoadResStr(S("IDS_MNU_UPPERBOARD")), $.GraphicsResource.fctOptions.GetPhase(3 + $.Config.Graphics.UpperBoard | 0), S("Display:UpperBoard"), 0xbc614e);
    }
    if ($.Application.isEditor === 0) {
      this.AddRefSym($.LoadResStr(S("IDS_MNU_FPS")), $.GraphicsResource.fctOptions.GetPhase(5 + $.Config.General.FPS | 0), S("Display:FPS"), 0xbc614e);
    }
    if ($.Application.isEditor === 0) {
      this.AddRefSym($.LoadResStr(S("IDS_MNU_CLOCK")), $.GraphicsResource.fctOptions.GetPhase(15 + $.Config.Graphics.ShowClock | 0), S("Display:Clock"), 0xbc614e);
    }
    this.SetSelection$i32$b$b(selection, false, true);
    this.SetCloseCommand(S("ActivateMenu:Options"));
    return true;
  }

  ActivateSurrender(iPlayer) {
    let fctSymbol = new $.C4FacetSurface().init();
    this.InitRefSym$C4Facet$pi8$i32$i32$i32$i32$i32($.Icon.GetIconFacet$i32(45 /*Ico_Surrender*/), $.LoadResStr(S("IDS_MENU_SURRENDER")), iPlayer, 0, 0, 0, 1);
    this.SetAlignment(9);
    fctSymbol.Create(35, 35);
    $.GraphicsResource.fctOKCancel.Draw$rC4Facet$b$i32$i32$b(fctSymbol, true, 3, 0);
    this.Add$pi8$rC4FacetSurface$pi8$i32$pC4Object$pi8$C4ID$pi8$b$i32$b($.LoadResStr(S("IDS_BTN_YES")), fctSymbol, S("Surrender"));
    fctSymbol.Create(35, 35);
    $.GraphicsResource.fctOKCancel.Draw$rC4Facet$b$i32$i32$b(fctSymbol, true, 1, 0);
    this.Add$pi8$rC4FacetSurface$pi8$i32$pC4Object$pi8$C4ID$pi8$b$i32$b($.LoadResStr(S("IDS_BTN_NO")), fctSymbol, S(""));
    this.SetCloseCommand(S("ActivateMenu:Main"));
    return true;
  }

  ActivateObserver() {
    if (!($.Viewports.GetViewport(-1) != null)) {
      return false;
    }
    this.InitRefSym$C4Facet$pi8$i32$i32$i32$i32$i32($.Icon.GetIconFacet$i32(50 /*Ico_View*/), $.LoadResStr(S("IDS_TEXT_VIEW")), -1, 0, 0, 5, 1);
    this.SetAlignment(9);
    this.Refill();
    this.SetCloseCommand(S("ActivateMenu:Main"));
    return true;
  }

  MenuCommand(szCommand, _fIsCloseCommand) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4MainMenu && C4MainMenu.prototype instanceof $c) return $c.prototype.MenuCommand.apply(this, arguments); }
    let pPlr = $.Players.Get(this.Player);
    if ($.SEqual2(szCommand, S("ActivateMenu:"))) {
      if ($.C4GameOverDlg.IsShown()) {
        return false;
      }
      if ($.SEqual($padd(szCommand, 13), S("Main"))) {
        return this.ActivateMain(this.Player);
      }
      if ($.SEqual($padd(szCommand, 13), S("Hostility"))) {
        return this.ActivateHostility(this.Player);
      }
      if ($.SEqual($padd(szCommand, 13), S("NewPlayer"))) {
        return this.ActivateNewPlayer(this.Player);
      }
      if ($.SEqual($padd(szCommand, 13), S("Goals"))) {
        $.Control$2.DoInput(164 /*CID_PlrAction*/, $.C4ControlPlayerAction.ActivateGoalMenu($.Players.Get(this.Player)), 0 /*CDT_Queue*/);
        return true;
      }
      if ($.SEqual($padd(szCommand, 13), S("Rules"))) {
        return this.ActivateRules(this.Player);
      }
      if ($.SEqual($padd(szCommand, 13), S("Host"))) {
        return this.ActivateHost(this.Player);
      }
      if ($.SEqual($padd(szCommand, 13), S("Client"))) {
        return this.ActivateClient(this.Player);
      }
      if ($.SEqual($padd(szCommand, 13), S("Options"))) {
        return this.ActivateOptions(this.Player);
      }
      if ($.SEqual($padd(szCommand, 13), S("Display"))) {
        return this.ActivateDisplay(this.Player);
      }
      if ($.SEqual($padd(szCommand, 13), S("Save:Game"))) {
        return this.ActivateSavegame(this.Player);
      }
      if ($.SEqual($padd(szCommand, 13), S("TeamSel"))) {
        return pPlr != null ? pPlr.ActivateMenuTeamSelection(true) : false;
      }
      if ($.SEqual($padd(szCommand, 13), S("Surrender"))) {
        return this.ActivateSurrender(this.Player);
      }
      if ($.SEqual($padd(szCommand, 13), S("Observer"))) {
        return this.ActivateObserver();
      }
    }
    if ($.SEqual2(szCommand, S("JoinPlayer:"))) {
      if ($.Game.Parameters.isLeague() || $.Game.C4S.Head.Replay) {
        return false;
      }
      $.Players.JoinNew($padd(szCommand, 11));
      return true;
    }
    if ($.SEqual2(szCommand, S("SetHostility:"))) {
      if (!$.Game.Teams.IsHostilityChangeAllowed()) {
        return false;
      }
      const iOpponent = [0];
      c$sscanf($padd(szCommand, 13), S("%i"), P(iOpponent, 0));
      let pOpponent = $.Players.Get(iOpponent[0]);
      if (pOpponent == null || pOpponent.GetType() !== 1) {
        return false;
      }
      $.Control$2.DoInput(164 /*CID_PlrAction*/, $.C4ControlPlayerAction.SetHostility($.Players.Get(this.Player), pOpponent, !$.Players.HostilityDeclared(this.Player, pOpponent.Number)), 0 /*CDT_Queue*/);
      return true;
    }
    if ($.SEqual2(szCommand, S("Abort"))) {
      $.FullScreen.ShowAbortDlg();
      return true;
    }
    if ($.SEqual2(szCommand, S("Surrender"))) {
      $.Control$2.DoInput(164 /*CID_PlrAction*/, $.C4ControlPlayerAction.Surrender($.Players.Get(this.Player)), 0 /*CDT_Queue*/);
      return true;
    }
    if ($.SEqual2(szCommand, S("Save:Game:"))) {
      const strFilename = new Int8Array(4097);
      $.SCopySegment(szCommand, 2, P(strFilename, 0), 58, 4096);
      const strTitle = new Int8Array(4097);
      $.SCopy$pi8$pi8$u64($padd($padd(szCommand, $.SCharPos(58, szCommand, 2)), 1), P(strTitle, 0), 4096);
      $.Game.QuickSave(P(strFilename, 0), P(strTitle, 0));
      this.ActivateSavegame(this.Player);
      return true;
    }
    if ($.SEqual2(szCommand, S("Host:Kick:"))) {
      let iClientID = c$atoi($padd(szCommand, 10));
      if (iClientID !== 0 && $.Network.isEnabled()) {
        if ($.Game.Parameters.isLeague() && $.Players.GetAtClient$i32$i32(iClientID) != null) {
          $.Network.Vote(1 /*VT_Kick*/, true, iClientID);
        } else {
          let pClient = $.Game.Clients.getClientByID(iClientID);
          if (pClient != null) {
            $.Game.Clients.CtrlRemove(pClient, $.LoadResStr(S("IDS_MSG_KICKBYMENU")));
          }
          this.Close$b(true);
        }
      }
      return true;
    }
    if ($.SEqual2(szCommand, S("Part"))) {
      if ($.Network.isEnabled()) {
        if ($.Game.Parameters.isLeague() && $.Players.GetLocalByIndex(0) != null) {
          $.Network.Vote(1 /*VT_Kick*/, true, $.Control$2.ClientID());
        } else {
          $.Game.RoundResults.EvaluateNetwork(3 /*NR_NetError*/, $.LoadResStr(S("IDS_ERR_GAMELEFTVIAPLAYERMENU")));
          $.Network.Clear$v();
        }
      }
      return true;
    }
    if ($.SEqual2(szCommand, S("Options:"))) {
      if ($.SEqual($padd(szCommand, 8), S("Music"))) {
        $.Application.MusicSystem.ToggleOnOff();
      }
      if ($.SEqual($padd(szCommand, 8), S("Sound"))) {
        if ($.Config.Sound.RXSound !== 0) {
          $.Application.SoundSystem.Clear();
          $.Config.Sound.RXSound = 0;
        } else {
          $.Config.Sound.RXSound = 1;
          if (!$.Application.SoundSystem.Init()) {
            $.Log($.LoadResStr(S("IDS_PRC_NOSND")));
          }
        }
      }
      this.ActivateOptions(this.Player, this.GetSelection$v());
      return true;
    }
    if ($.SEqual2(szCommand, S("Display:"))) {
      if ($.SEqual($padd(szCommand, 8), S("UpperBoard"))) {
        $.Config.Graphics.UpperBoard = $.Config.Graphics.UpperBoard === 0 ? 1 : 0;
        $.Viewports.RecalculateViewports();
      }
      if ($.SEqual($padd(szCommand, 8), S("FPS"))) {
        $.Config.General.FPS = $.Config.General.FPS === 0 ? 1 : 0;
      }
      if ($.SEqual($padd(szCommand, 8), S("PlayerNames"))) {
        $.Config.Graphics.ShowCrewNames = $.Config.Graphics.ShowCrewNames === 0 ? 1 : 0;
      }
      if ($.SEqual($padd(szCommand, 8), S("ClonkNames"))) {
        $.Config.Graphics.ShowCrewCNames = $.Config.Graphics.ShowCrewCNames === 0 ? 1 : 0;
      }
      if ($.SEqual($padd(szCommand, 8), S("Clock"))) {
        $.Config.Graphics.ShowClock = $.Config.Graphics.ShowClock === 0 ? 1 : 0;
      }
      this.ActivateDisplay(this.Player, this.GetSelection$v());
      return true;
    }
    if ($.SEqual2(szCommand, S("Player:Goal:")) || $.SEqual2(szCommand, S("Player:Rule:"))) {
      if (!($.ValidPlr(this.Player) !== 0)) {
        return false;
      }
      this.Close$b(true);
      let pObj = null;
      let idItem = new $.C4ID().init$string(StdString.of($padd(szCommand, 12)));
      let pDef = $.C4Id2Def(idItem.$clone());
      if (pDef != null && (pObj = $.Objects.Find(pDef)) != null) {
        $.Control$2.DoInput(164 /*CID_PlrAction*/, $.C4ControlPlayerAction.ActivateGoal($.Players.Get(this.Player), pObj), 0 /*CDT_Queue*/);
      } else {
        return false;
      }
      return true;
    }
    if ($.SEqual2(szCommand, S("TeamSel:"))) {
      this.Close$b(true);
      let idTeam = c$atoi($padd(szCommand, 8));
      if (pPlr != null) {
        pPlr.DoTeamSelection(idTeam);
      }
      return true;
    }
    if ($.SEqual2(szCommand, S("TeamSwitch:"))) {
      this.Close$b(true);
      let idTeam = c$atoi($padd(szCommand, 11));
      if (!$.Game.Teams.IsTeamSwitchAllowed()) {
        return false;
      }
      $.Control$2.DoInput(164 /*CID_PlrAction*/, $.C4ControlPlayerAction.SetTeam($.Players.Get(this.Player), idTeam), 0 /*CDT_Queue*/);
      return true;
    }
    if ($.SEqual2(szCommand, S("Observe:"))) {
      let szObserverTarget = $padd(szCommand, 8);
      let pVP = $.Viewports.GetViewport(-1);
      if (pVP != null) {
        if ($.SEqual(szObserverTarget, S("Free"))) {
          pVP.Init(-1, true);
          return true;
        } else {
          let iPlr = c$atoi(szObserverTarget);
          if ($.ValidPlr(iPlr) !== 0) {
            pVP.Init(iPlr, true);
            return true;
          }
        }
      }
      return false;
    }
    return false;
  }

  DoRefillInternal(rfRefilled) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4MainMenu && C4MainMenu.prototype instanceof $c) return $c.prototype.DoRefillInternal.apply(this, arguments); }
    let fctSymbol = new $.C4FacetSurface().init();
    let pPlayer = null;
    let ListItems = new $.C4IDList().init();
    let fctTarget = new $.C4Facet().init$v();
    let fWasEmpty = !(this.GetItemCount() !== 0);
    switch (this.Identification) {
      case 1:
        {
          this.ClearItems();
          if (!((pPlayer = $.Players.Get(this.Player)) != null)) {
            return false;
          }
          let pPlr = null;
          let iIndex = 0;
          for (iIndex = 0; (pPlr = $.Players.GetByIndex$i32(iIndex)) != null; iIndex = iIndex + 1 | 0) {
            if (pPlr !== pPlayer) {
              if (!pPlr.IsInvisible()) {
                fctSymbol.Create(35, 35);
                pPlayer.DrawHostility(fctSymbol, iIndex);
                let sMsg = new $.StdStrBuf();
                let isFriendly = pPlayer.Hostility.find(pPlr).eq(pPlayer.Hostility.end());
                if (isFriendly) {
                  sMsg.Format($.LoadResStr(S("IDS_MENU_ATTACK")), pPlr.GetName());
                } else {
                  sMsg.Format($.LoadResStr(S("IDS_MENU_NOATTACK")), pPlr.GetName());
                }
                const szCommand = new Int8Array(1000);
                $.ssprintf(szCommand, S("SetHostility:%i"), pPlr.Number);
                const szInfoCaption = new Int8Array(513);
                const szFriendly = new Int8Array(50);
                const szNot = $cs(S(""), 30);
                $.SCopy$pi8$pi8($.LoadResStr(isFriendly ? S("IDS_MENU_ATTACKHOSTILE") : S("IDS_MENU_ATTACKFRIENDLY")), P(szFriendly, 0));
                if (!isFriendly) {
                  $.SCopy$pi8$pi8($.LoadResStr(S("IDS_MENU_ATTACKNOT")), P(szNot, 0));
                }
                $.ssprintf$20(szInfoCaption, $.LoadResStr(S("IDS_MENU_ATTACKINFO")), pPlr.GetName(), P(szFriendly, 0), P(szNot, 0));
                if (iIndex === pPlayer.Number) {
                  $.SCopy$pi8$pi8($.LoadResStr(S("IDS_MENU_ATTACKSELF")), P(szInfoCaption, 0));
                }
                this.Add$pi8$rC4FacetSurface$pi8$i32$pC4Object$pi8$C4ID$pi8$b$i32$b(sMsg.getData(), fctSymbol, P(szCommand, 0), 0xbc614e, null, P(szInfoCaption, 0));
                $.C4FacetSurface.prototype.Default.call(fctSymbol);
              }
            }
          }
          break;
        }
      case 3:
      case 4:
        {
          this.ClearItems();
          let pTeam = null;
          let i = 0;
          let fAddNewTeam = $.Game.Teams.IsAutoGenerateTeams();
          for (; ; ) {
            pTeam = $.Game.Teams.GetTeamByIndex(i);
            if (pTeam != null) {
              i = i + 1 | 0;
              if (!(pTeam.GetPlayerCount() !== 0)) {
                fAddNewTeam = false;
              }
            } else if (fAddNewTeam) {
              fAddNewTeam = false;
            } else {
              break;
            }
            fctSymbol.Create(35, 35);
            let szIconSpec = pTeam != null ? pTeam.GetIconSpec() : null;
            let fHasIcon = false;
            if (szIconSpec != null && szIconSpec.a[szIconSpec.o] !== 0) {
              fHasIcon = $.Game.DrawTextSpecImage(fctSymbol, szIconSpec, null, pTeam.GetColor());
            }
            if (!fHasIcon) {
              if (pTeam != null && pTeam.GetPlayerCount() !== 0) {
                $.GraphicsResource.fctCrewClr.DrawClr(fctSymbol, true, pTeam.GetColor());
              } else {
                $.Icon.GetIconFacet$i32(19 /*Ico_Team*/).Draw$rC4Facet$b$i32$i32$b(fctSymbol, true);
              }
            }
            let sTeamName = new $.StdStrBuf();
            if (pTeam != null) {
              sTeamName.Take$mStdStrBuf(pTeam.GetNameWithParticipants());
            } else {
              sTeamName.Ref$pi8($.LoadResStr(S("IDS_PRC_NEWTEAM")));
            }
            let szOperation = this.Identification === 4 ? S("TeamSwitch") : S("TeamSel");
            this.Add$pi8$rC4FacetSurface$pi8$i32$pC4Object$pi8$C4ID$pi8$b$i32$b(sTeamName.getData(), fctSymbol, $.FormatString(S("%s:%d"), szOperation, pTeam != null ? pTeam.GetID() : -1).getData(), 0xbc614e, null, $.FormatString($.LoadResStr(S("IDS_MSG_JOINTEAM")), sTeamName.getData()).getData(), new $.C4ID().init$u64($u64n(pTeam != null ? pTeam.GetID() : 0)));
            $.C4FacetSurface.prototype.Default.call(fctSymbol);
          }
          break;
        }
      case 5:
        {
          this.ClearItems();
          let pVP = $.Viewports.GetViewport(-1);
          if (pVP == null) {
            return false;
          }
          let iInitialSelection = 0;
          this.AddRefSym($.LoadResStr(S("IDS_MSG_FREEVIEW")), $.Icon.GetIconFacet$i32(48 /*Ico_Star*/), S("Observe:Free"), 0xbc614e, null, $.LoadResStr(S("IDS_MSG_FREELYSCROLLAROUNDTHEMAP")));
          let pPlr = null;
          let iIndex = 0;
          for (iIndex = 0; (pPlr = $.Players.GetByIndex$i32(iIndex)) != null; iIndex = iIndex + 1 | 0) {
            if (!pPlr.IsInvisible()) {
              fctSymbol.Create(35, 35);
              $.GraphicsResource.fctPlayerClr.DrawClr(fctSymbol, true, pPlr.ColorDw);
              let sMsg = new $.StdStrBuf();
              const dwClr = [pPlr.ColorDw];
              sMsg.Format(S("<c %x>%s</c>"), $.MakeColorReadableOnBlack(P(dwClr, 0)), pPlr.GetName());
              let sCommand = new $.StdStrBuf();
              sCommand.Format(S("Observe:%d"), pPlr.Number);
              let sInfo = new $.StdStrBuf();
              sInfo.Format($.LoadResStr(S("IDS_TEXT_FOLLOWVIEWOFPLAYER")), pPlr.GetName());
              this.Add$pi8$rC4FacetSurface$pi8$i32$pC4Object$pi8$C4ID$pi8$b$i32$b(sMsg.getData(), fctSymbol, sCommand.getData(), 0xbc614e, null, sInfo.getData());
              $.C4FacetSurface.prototype.Default.call(fctSymbol);
              if (pVP.GetPlayer() === pPlr.Number) {
                iInitialSelection = this.GetItemCount() - 1 | 0;
              }
            }
            if (fWasEmpty) {
              this.SetSelection$i32$b$b(iInitialSelection, false, true);
            }
          }
        }
        break;
      default:
        return true;
    }
    rfRefilled.a[rfRefilled.o] = true;
    return true;
  }

  OnSelectionChanged(_iNewSelection) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4MainMenu && C4MainMenu.prototype instanceof $c) return $c.prototype.OnSelectionChanged.apply(this, arguments); }
    if (this.Identification === 5) {
      let pItem = this.GetSelectedItem();
      if (pItem != null) {
        if ($.SEqual2(pItem.GetCommand(), S("Observe:"))) {
          this.MenuCommand(pItem.GetCommand(), false);
        }
      }
    }
  }

  OnUserSelectItem(_Player, iIndex) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4MainMenu && C4MainMenu.prototype instanceof $c) return $c.prototype.OnUserSelectItem.apply(this, arguments); }
    this.SetSelection$i32$b$b(iIndex, true, true);
  }

  OnUserEnter(_Player, iIndex, fRight) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4MainMenu && C4MainMenu.prototype instanceof $c) return $c.prototype.OnUserEnter.apply(this, arguments); }
    this.SetSelection$i32$b$b(iIndex, true, false);
    this.Enter(fRight);
  }

  OnUserClose$v() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4MainMenu && C4MainMenu.prototype instanceof $c) return $c.prototype.OnUserClose$v.apply(this, arguments); }
    this.TryClose(false, true);
  }

  GetControllingPlayer() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4MainMenu && C4MainMenu.prototype instanceof $c) return $c.prototype.GetControllingPlayer.apply(this, arguments); }
    return this.Player;
  }

  ActivateCommand(iPlayer, szCommand) {
    this.Player = iPlayer;
    return this.MenuCommand(szCommand, false);
  }

  $clone() { return new C4MainMenu().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.Player = o.Player;
    return this;
  }
}

export function LooksLikeInteger(szInt) {
  let $t1;
  if (szInt == null) {
    return false;
  }
  if (szInt.a[szInt.o] === 43 || szInt.a[szInt.o] === 45) {
    szInt = szInt.add(1);
  }
  if (szInt.a[szInt.o] === 0) {
    return false;
  }
  let c = 0;
  while ((c = $rd(($t1 = szInt, szInt = szInt.add(1), $t1))) !== 0) {
    if (!$.Inside$i8$i8$i8(c, 48, 57)) {
      return false;
    }
  }
  return true;
}

export function $init(): void {
}

Object.assign($, { C4MainMenu, LooksLikeInteger });
