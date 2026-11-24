// @ts-nocheck
// OpenClonk 36de799: src/gui/C4StartupMainDlg.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { C4StartupDlg } from './C4Startup.ts';
import { ftoi32 } from '../../rt/int.ts';
import { $own, $rd, $wr, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete, $filled, $vpush, StdString } from '../../rt/std.ts';

export class C4StartupMainDlg extends C4StartupDlg {
  pKeyDown = null;
  pKeyUp = null;
  pKeyEnter = null;
  pParticipantsLbl = null;
  pStartButton = null;
  fFirstShown = false;

  DrawElement(cgo) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4StartupMainDlg && C4StartupMainDlg.prototype instanceof $c) return $c.prototype.DrawElement.apply(this, arguments); }
    $.FullscreenDialog.prototype.DrawElement.call(this, cgo);
    let fctStartupLogo = $.C4Startup.Get().Graphics.fctStartupLogo;
    let fLogoZoom = 1;
    fctStartupLogo.DrawX(cgo.Surface, Math.fround(Math.imul(this.rcBounds.Wdt, 1) / 21 | 0), Math.fround(this.rcBounds.Hgt / 28 | 0), Math.fround(ftoi32(Math.fround(fLogoZoom * fctStartupLogo.Wdt))), Math.fround(ftoi32(Math.fround(fLogoZoom * fctStartupLogo.Hgt))));
    let sVer = new $.StdStrBuf();
    sVer.Format($.LoadResStr(S("IDS_DLG_VERSION")), S("9.0-alpha unix"));
    $.pDraw.TextOut(sVer.getData(), $.GraphicsResource.TextFont, 1, cgo.Surface, Math.fround(Math.imul(this.rcBounds.Wdt, 1) / 40 | 0), Math.fround(Math.imul(this.rcBounds.Hgt, 38) / 40 | 0), 0xffffffff, 0, true);
  }

  OnClosed(fOK) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4StartupMainDlg && C4StartupMainDlg.prototype instanceof $c) return $c.prototype.OnClosed.apply(this, arguments); }
    if (!fOK) {
      $.Application.Quit$v();
    }
  }

  OnPlayerSelContext(_pBtn, _iX, _iY) {
    let pCtx = new $.ContextMenu().init();
    pCtx.AddItem$pi8$pi8$i32$pMenuHandler$pContextHandler(S("Add"), S("Add participant"), -1 /*Ico_None*/, null, new $.CBContextHandler$C4StartupMainDlg().init(this, "OnPlayerSelContextAdd"));
    pCtx.AddItem$pi8$pi8$i32$pMenuHandler$pContextHandler(S("Remove"), S("Remove participant"), -1 /*Ico_None*/, null, new $.CBContextHandler$C4StartupMainDlg().init(this, "OnPlayerSelContextRemove"));
    return pCtx;
  }

  OnPlayerSelContextAdd(_pBtn, _iX, _iY) {
    let pCtx = new $.ContextMenu().init();
    let szFn = null;
    let sSearchPath = new $.StdStrBuf().init$pi8$b(P($.Config.General.UserDataPath, 0));
    for (let i = new $.DirectoryIterator().init$pi8(sSearchPath.getData()); (szFn = i.op_mul()) != null; i.op_inc$i32(0)) {
      szFn = $.Config.AtRelativePath(szFn);
      if ($rd($.GetFilename(szFn)) === 46) {
        continue;
      }
      if (!$.WildcardMatch(S("*.ocp"), $.GetFilename(szFn))) {
        continue;
      }
      if (!$.SIsModule(P($.Config.General.Participants, 0), szFn, null, false)) {
        pCtx.AddItem$pi8$pi8$i32$pMenuHandler$pContextHandler($.GetFilenameOnly(szFn), S("Let this player join in next game"), 9 /*Ico_Player*/, new $.CBMenuHandlerEx$C4StartupMainDlg$StdCopyStrBuf().init$pC4StartupMainDlg$x$StdCopyStrBuf(this, "OnPlayerSelContextAddPlr", new $.StdCopyStrBuf().init$pi8$b(szFn)), null);
      }
    }
    return pCtx;
  }

  OnPlayerSelContextRemove(_pBtn, _iX, _iY) {
    let pCtx = new $.ContextMenu().init();
    const szPlayer = new Int8Array(1025);
    for (let i = 0; $.SCopySegment(P($.Config.General.Participants, 0), i, P(szPlayer, 0), 59, 1024, true); i = i + 1 | 0) {
      if ($rd(P(szPlayer, 0)) !== 0) {
        pCtx.AddItem$pi8$pi8$i32$pMenuHandler$pContextHandler($.GetFilenameOnly(P(szPlayer, 0)), S("Remove this player from participation list"), 9 /*Ico_Player*/, new $.CBMenuHandlerEx$C4StartupMainDlg$i32().init$pC4StartupMainDlg$x$i32(this, "OnPlayerSelContextRemovePlr", i), null);
      }
    }
    return pCtx;
  }

  OnPlayerSelContextAddPlr(_pTarget, rsFilename) {
    $.SCopy$pi8$pi8(rsFilename.getData(), P($.Config.General.Participants, 0));
    this.UpdateParticipants();
  }

  OnPlayerSelContextRemovePlr(_pTarget, iIndex) {
    const szPlayer = new Int8Array(1025);
    if ($.SCopySegment(P($.Config.General.Participants, 0), iIndex, P(szPlayer, 0), 59, 1024, true)) {
      $.SRemoveModule(P($.Config.General.Participants, 0), P(szPlayer, 0), false);
    }
    this.UpdateParticipants();
  }

  UpdateParticipants() {
    let strPlayers = StdString.of(P($.Config.General.Participants, 0));
    let strPlayer = $filled(1025, () => 0);
    $wr(P($.Config.General.Participants, 0), 0, 0);
    for (let i = 0; $.SCopySegment(strPlayers.c_str(), i, P(strPlayer, 0), 59, strPlayer.length - 1 | 0, true); i = i + 1 | 0) {
      let szPlayer = P(strPlayer, 0);
      let strPlayerFile = StdString.of(P($.Config.General.UserDataPath, 0));
      strPlayerFile.append(szPlayer);
      if (szPlayer == null || szPlayer.a[szPlayer.o] === 0) {
        continue;
      }
      if (!$.FileExists(strPlayerFile.c_str())) {
        continue;
      }
      if (!$.SEqualNoCase($.GetExtension(szPlayer), S("ocp"))) {
        continue;
      }
      $.SAddModule(P($.Config.General.Participants, 0), szPlayer);
    }
    strPlayers.assign($.LoadResStr(S("IDS_DESC_PLRS")));
    if ($.Config.General.Participants[0] === 0) {
      strPlayers.append($.LoadResStr(S("IDS_DLG_NOPLAYERSSELECTED")));
    } else {
      for (let i = 0; $.SCopySegment(P($.Config.General.Participants, 0), i, P(strPlayer, 0), 59, 1024, true); i = i + 1 | 0) {
        if (i > 0) {
          strPlayers.append(S(", "));
        }
        strPlayers.append($.GetFilenameOnly(P(strPlayer, 0)));
      }
    }
    this.pParticipantsLbl.SetText$pi8$b(strPlayers.c_str());
  }

  OnStartBtn(_btn) {
    $.C4Startup.Get().SwitchDialog(1 /*SDID_ScenSel*/);
  }

  OnPlayerSelectionBtn(_btn) {
    $.C4Startup.Get().SwitchDialog(7 /*SDID_PlrSel*/);
  }

  OnNetJoinBtn(_btn) {
    $.C4Startup.Get().SwitchDialog(3 /*SDID_NetJoin*/);
  }

  OnNetJoin(rsHostAddress) {
    if (rsHostAddress.op_not() || !($rd(rsHostAddress.getData()) !== 0)) {
      return;
    }
    $wr(P($.Game.ScenarioFilename, 0), 0, 0);
    $.SCopy$pi8$pi8(S("Objects.ocd"), P($.Game.DefinitionFilenames, 0));
    $.Game.NetworkActive = true;
    $.Game.fLobby = true;
    $.Game.fObserve = false;
    $.SCopy$pi8$pi8$u64(rsHostAddress.getData(), P($.Game.DirectJoinAddress, 0), 4096);
    $.Application.OpenGame();
  }

  OnOptionsBtn(_btn) {
    $.C4Startup.Get().SwitchDialog(4 /*SDID_Options*/);
  }

  OnEditorBtn(_btn) {
    if (!$.RestartApplication($own([S("--editor")]))) {
      $.TheScreen.ShowErrorMessage($.LoadResStr(S("IDS_ERR_STARTEDITOR")));
    }
  }

  OnModsBtn(_btn) {
    $.C4Startup.Get().SwitchDialog(8 /*SDID_Mods*/);
  }

  OnAboutBtn(_btn) {
    $.C4Startup.Get().SwitchDialog(5 /*SDID_About*/);
  }

  OnExitBtn(_btn) {
    $.Application.Quit$v();
  }

  OnTODO(_btn) {
    this.GetScreen().ShowMessage(S("not yet implemented"), S("2do"), 11 /*Ico_Error*/);
  }

  KeyEnterDown() {
    return $.Game.DoKeyboardInput$u64$i32$b$b$b$b$pDialog$b$i32(57, 1 /*KEYEV_Down*/, false, false, false, false, this);
  }

  KeyEnterUp() {
    return $.Game.DoKeyboardInput$u64$i32$b$b$b$b$pDialog$b$i32(57, 2 /*KEYEV_Up*/, false, false, false, false, this);
  }

  *OnShown$v() {
    if ($.Config.General.FirstStart) {
      $.Config.General.FirstStart = false;
    }
    let fHasPlayer = false;
    let sSearchPath = new $.StdStrBuf().init$pi8$b(P($.Config.General.UserDataPath, 0));
    let szFn = null;
    for (let i = new $.DirectoryIterator().init$pi8(sSearchPath.getData()); (szFn = i.op_mul()) != null; i.op_inc$i32(0)) {
      szFn = $.Config.AtRelativePath(szFn);
      if ($rd($.GetFilename(szFn)) === 46) {
        continue;
      }
      if (!$.WildcardMatch(S("*.ocp"), $.GetFilename(szFn))) {
        continue;
      }
      fHasPlayer = true;
      break;
    }
    if (!fHasPlayer) {
      let pDlg = null;
      (yield* this.GetScreen().ShowModalDlg(pDlg = new $.C4StartupPlrPropertiesDlg().init(null, null), true));
    }
    this.UpdateParticipants();
    if (this.fFirstShown) {
      $.Application.Activate();
      this.SetFocus(this.pStartButton, false);
    }
    this.fFirstShown = false;
  }

  init() {
    super.init(null);
    this.$dyn = C4StartupMainDlg;
    this.fFirstShown = true;
    let iButtonPadding = 2;
    let iButtonHeight = 40;
    let caMain = new $.ComponentAligner().init(this.rcBounds, 0, 0, true);
    let caRightPanel = new $.ComponentAligner().init(caMain.GetFromLeft$i32$i32(Math.imul(this.rcBounds.Wdt, 2) / 5 | 0), this.rcBounds.Wdt / 26 | 0, 40 + (this.rcBounds.Hgt / 5 | 0) | 0);
    let caButtons = new $.ComponentAligner().init(caRightPanel.GetAll$v(), 0, iButtonPadding);
    let btn = null;
    $.Container.prototype.AddElement$pElement.call(this, btn = new $.CallbackButton$C4StartupMainDlg$Button().init$pi8$rC4Rect$x$pC4StartupMainDlg($.LoadResStr(S("IDS_BTN_LOCALGAME")), caButtons.GetFromTop$i32$i32(iButtonHeight), "OnStartBtn"));
    btn.SetToolTip($.LoadResStr(S("IDS_DLGTIP_STARTGAME")));
    btn.SetCustomGraphics($.C4Startup.Get().Graphics.barMainButtons, $.C4Startup.Get().Graphics.barMainButtonsDown);
    this.pStartButton = btn;
    $.Container.prototype.AddElement$pElement.call(this, btn = new $.CallbackButton$C4StartupMainDlg$Button().init$pi8$rC4Rect$x$pC4StartupMainDlg($.LoadResStr(S("IDS_BTN_NETWORKGAME")), caButtons.GetFromTop$i32$i32(iButtonHeight), "OnNetJoinBtn"));
    btn.SetToolTip($.LoadResStr(S("IDS_DLGTIP_NETWORKGAME")));
    btn.SetCustomGraphics($.C4Startup.Get().Graphics.barMainButtons, $.C4Startup.Get().Graphics.barMainButtonsDown);
    $.Container.prototype.AddElement$pElement.call(this, btn = new $.CallbackButton$C4StartupMainDlg$Button().init$pi8$rC4Rect$x$pC4StartupMainDlg($.LoadResStr(S("IDS_DLG_PLAYERSELECTION")), caButtons.GetFromTop$i32$i32(iButtonHeight), "OnPlayerSelectionBtn"));
    btn.SetToolTip($.LoadResStr(S("IDS_DLGTIP_PLAYERSELECTION")));
    btn.SetCustomGraphics($.C4Startup.Get().Graphics.barMainButtons, $.C4Startup.Get().Graphics.barMainButtonsDown);
    $.Container.prototype.AddElement$pElement.call(this, btn = new $.CallbackButton$C4StartupMainDlg$Button().init$pi8$rC4Rect$x$pC4StartupMainDlg($.LoadResStr(S("IDS_DLG_OPTIONS")), caButtons.GetFromTop$i32$i32(iButtonHeight), "OnOptionsBtn"));
    btn.SetToolTip($.LoadResStr(S("IDS_DLGTIP_OPTIONS")));
    btn.SetCustomGraphics($.C4Startup.Get().Graphics.barMainButtons, $.C4Startup.Get().Graphics.barMainButtonsDown);
    $.Container.prototype.AddElement$pElement.call(this, btn = new $.CallbackButton$C4StartupMainDlg$Button().init$pi8$rC4Rect$x$pC4StartupMainDlg($.LoadResStr(S("IDS_DLG_MODS")), caButtons.GetFromTop$i32$i32(iButtonHeight), "OnModsBtn"));
    btn.SetToolTip($.LoadResStr(S("IDS_DLGTIP_MODS")));
    btn.SetCustomGraphics($.C4Startup.Get().Graphics.barMainButtons, $.C4Startup.Get().Graphics.barMainButtonsDown);
    $.Container.prototype.AddElement$pElement.call(this, btn = new $.CallbackButton$C4StartupMainDlg$Button().init$pi8$rC4Rect$x$pC4StartupMainDlg($.LoadResStr(S("IDS_DLG_ABOUT")), caButtons.GetFromTop$i32$i32(iButtonHeight), "OnAboutBtn"));
    btn.SetToolTip($.LoadResStr(S("IDS_DLGTIP_ABOUT")));
    btn.SetCustomGraphics($.C4Startup.Get().Graphics.barMainButtons, $.C4Startup.Get().Graphics.barMainButtonsDown);
    $.Container.prototype.AddElement$pElement.call(this, btn = new $.CallbackButton$C4StartupMainDlg$Button().init$pi8$rC4Rect$x$pC4StartupMainDlg($.LoadResStr(S("IDS_DLG_EXIT")), caButtons.GetFromTop$i32$i32(iButtonHeight), "OnExitBtn"));
    btn.SetToolTip($.LoadResStr(S("IDS_DLGTIP_EXIT")));
    btn.SetCustomGraphics($.C4Startup.Get().Graphics.barMainButtons, $.C4Startup.Get().Graphics.barMainButtonsDown);
    $.Container.prototype.AddElement$pElement.call(this, this.pParticipantsLbl = new $.Label().init$pi8$i32$i32$i32$u32$pCStdFont$b$b(S("test"), Math.imul(this.GetClientRect().Wdt, 39) / 40 | 0, Math.imul(this.GetClientRect().Hgt, 9) / 10 | 0, 2, 0xffffffff, $.GraphicsResource.TitleFont, false));
    this.pParticipantsLbl.SetToolTip($.LoadResStr(S("IDS_DLGTIP_SELECTEDPLAYERS")));
    C4StartupMainDlg.prototype.UpdateParticipants.call(this);
    this.pParticipantsLbl.SetContextHandler(new $.CBContextHandler$C4StartupMainDlg().init(this, "OnPlayerSelContext"));
    let keys = [];
    $vpush(keys, new $.C4KeyCodeEx().init(108));
    $vpush(keys, new $.C4KeyCodeEx().init(106));
    if ($.Config.Controls.GamepadGuiControl !== 0) {
      $.Down(keys);
    }
    this.pKeyDown = new $.C4KeyBinding().init$vector$pi8$i32$pC4KeyboardCallbackInterface$u32(keys, S("StartupMainCtrlNext"), 2 /*KEYSCOPE_Gui*/, new $.DlgKeyCBEx$C4StartupMainDlg$b().init(this, false, "KeyAdvanceFocus"), 4);
    keys.length = 0;
    $vpush(keys, new $.C4KeyCodeEx().init(103));
    $vpush(keys, new $.C4KeyCodeEx().init(105));
    if ($.Config.Controls.GamepadGuiControl !== 0) {
      $.Up(keys);
    }
    this.pKeyUp = new $.C4KeyBinding().init$vector$pi8$i32$pC4KeyboardCallbackInterface$u32(keys, S("StartupMainCtrlPrev"), 2 /*KEYSCOPE_Gui*/, new $.DlgKeyCBEx$C4StartupMainDlg$b().init(this, true, "KeyAdvanceFocus"), 4);
    keys.length = 0;
    $vpush(keys, new $.C4KeyCodeEx().init(28));
    this.pKeyEnter = new $.C4KeyBinding().init$vector$pi8$i32$pC4KeyboardCallbackInterface$u32(keys, S("StartupMainOK"), 2 /*KEYSCOPE_Gui*/, new $.DlgKeyCB$C4StartupMainDlg().init(this, "KeyEnterDown", "KeyEnterUp"), 4);
    return this;
  }

  $dtor() {
    $delete(this.pKeyEnter);
    $delete(this.pKeyUp);
    $delete(this.pKeyDown);
    super.$dtor();
  }

  $clone() { return new C4StartupMainDlg().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pKeyDown = o.pKeyDown;
    this.pKeyUp = o.pKeyUp;
    this.pKeyEnter = o.pKeyEnter;
    this.pParticipantsLbl = o.pParticipantsLbl;
    this.pStartButton = o.pStartButton;
    this.fFirstShown = o.fFirstShown;
    return this;
  }
}

export function $init(): void {
}

Object.assign($, { C4StartupMainDlg });
