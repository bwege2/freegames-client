// @ts-nocheck
// OpenClonk 36de799: src/gui/C4Startup.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { FullscreenDialog } from './C4Gui.ts';
import { ftoi32 } from '../../rt/int.ts';
import { $padd, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete } from '../../rt/std.ts';

export class C4StartupGraphics {
  fctPlrPropBG = new $.C4FacetID().init();
  fctAboutTitles = new $.C4FacetID().init();
  fctDlgPaper = new $.C4FacetID().init();
  fctStartupLogo = new $.C4FacetID().init();
  fctMainButtons = new $.C4FacetID().init();
  fctMainButtonsDown = new $.C4FacetID().init();
  barMainButtons = new $.DynBarFacet().None();
  barMainButtonsDown = new $.DynBarFacet().None();
  fctBookScroll = new $.C4FacetID().init();
  sfctBookScroll = new $.ScrollBarFacets().None();
  sfctBookScrollR = new $.ScrollBarFacets().None();
  sfctBookScrollG = new $.ScrollBarFacets().None();
  sfctBookScrollB = new $.ScrollBarFacets().None();
  fctCrew = new $.C4FacetID().init();
  fctCrewClr = new $.C4FacetID().init();
  fctScenSelIcons = new $.C4FacetID().init();
  fctScenSelTitleOverlay = new $.C4FacetID().init();
  BookFontCapt = new $.CStdFont().init();
  BookFont = new $.CStdFont().init();
  BookFontTitle = new $.CStdFont().init();
  BookSmallFont = new $.CStdFont().init();
  fctContext = new $.C4FacetID().init();
  fctOptionsIcons = new $.C4FacetID().init();
  fctOptionsTabClip = new $.C4FacetID().init();
  fctNetGetRef = new $.C4FacetID().init();

  LoadFile(rToFct, szFilename) {
    return $.GraphicsResource.LoadFile$rC4FacetID$pi8$rC4GroupSet$i32$i32$b$i32(rToFct, szFilename, $.GraphicsResource.Files, -1, -1, false, 0);
  }

  Init() {
    $.GraphicsResource.ProgressStart = Math.fround(50);
    $.GraphicsResource.ProgressIncrement = Math.fround(8);
    $.Game.SetInitProgress(38);
    if (!this.LoadFile(this.fctDlgPaper, S("StartupDlgPaper"))) {
      return false;
    }
    if (!this.LoadFile(this.fctPlrPropBG, S("StartupPlrPropBG"))) {
      return false;
    }
    if (!this.LoadFile(this.fctAboutTitles, S("StartupAboutTitles"))) {
      return false;
    }
    this.fctAboutTitles.Set$pC4Surface$i32$i32$i32$i32(this.fctAboutTitles.Surface, 0, 0, this.fctAboutTitles.Surface.Wdt, this.fctAboutTitles.Surface.Hgt / 6 | 0);
    if (!this.LoadFile(this.fctStartupLogo, S("StartupLogo"))) {
      return false;
    }
    $.GraphicsResource.ProgressStart = Math.fround(92);
    $.GraphicsResource.ProgressIncrement = Math.fround(0.5);
    if (!this.LoadFile(this.fctMainButtons, S("StartupBigButton"))) {
      return false;
    }
    this.barMainButtons.SetHorizontal$rC4Facet$i32(this.fctMainButtons);
    if (!this.LoadFile(this.fctMainButtonsDown, S("StartupBigButtonDown"))) {
      return false;
    }
    this.barMainButtonsDown.SetHorizontal$rC4Facet$i32(this.fctMainButtonsDown);
    if (!this.LoadFile(this.fctBookScroll, S("StartupBookScroll"))) {
      return false;
    }
    this.sfctBookScroll.Set(this.fctBookScroll);
    this.sfctBookScrollR.Set(this.fctBookScroll, 1);
    this.sfctBookScrollG.Set(this.fctBookScroll, 2);
    this.sfctBookScrollB.Set(this.fctBookScroll, 3);
    if (!this.LoadFile(this.fctContext, S("StartupContext"))) {
      return false;
    }
    this.fctContext.Set$pC4Surface$i32$i32$i32$i32(this.fctContext.Surface, 0, 0, ftoi32(this.fctContext.Hgt), ftoi32(this.fctContext.Hgt));
    if (!this.LoadFile(this.fctScenSelIcons, S("StartupScenSelIcons"))) {
      return false;
    }
    this.fctScenSelIcons.Wdt = this.fctScenSelIcons.Hgt;
    if (!this.LoadFile(this.fctScenSelTitleOverlay, S("StartupScenSelTitleOv"))) {
      return false;
    }
    if (!this.LoadFile(this.fctOptionsIcons, S("StartupOptionIcons"))) {
      return false;
    }
    this.fctOptionsIcons.Set$pC4Surface$i32$i32$i32$i32(this.fctOptionsIcons.Surface, 0, 0, ftoi32(this.fctOptionsIcons.Hgt), ftoi32(this.fctOptionsIcons.Hgt));
    if (!this.LoadFile(this.fctOptionsTabClip, S("StartupTabClip"))) {
      return false;
    }
    if (!this.LoadFile(this.fctNetGetRef, S("StartupNetGetRef"))) {
      return false;
    }
    this.fctNetGetRef.Wdt = Math.fround(40);
    if (!this.InitFonts()) {
      return false;
    }
    $.Game.SetInitProgress(Math.fround(100));
    return true;
  }

  InitFonts() {
    let szFont = P($.Config.General.RXFontName, 0);
    if (!$.FontLoader.InitFont(this.BookFontCapt, szFont, 3 /*C4FT_Caption*/, $.Config.General.RXFontSize, $.GraphicsResource.Files, false)) {
      $.LogFatal(S("Font Error (1)"));
      return false;
    }
    $.Game.SetInitProgress(Math.fround(97));
    if (!$.FontLoader.InitFont(this.BookFont, szFont, 2 /*C4FT_Main*/, $.Config.General.RXFontSize, $.GraphicsResource.Files, false)) {
      $.LogFatal(S("Font Error (2)"));
      return false;
    }
    $.Game.SetInitProgress(Math.fround(98));
    if (!$.FontLoader.InitFont(this.BookFontTitle, szFont, 4 /*C4FT_Title*/, $.Config.General.RXFontSize, $.GraphicsResource.Files, false)) {
      $.LogFatal(S("Font Error (3)"));
      return false;
    }
    $.Game.SetInitProgress(Math.fround(99));
    if (!$.FontLoader.InitFont(this.BookSmallFont, szFont, 1 /*C4FT_MainSmall*/, $.Config.General.RXFontSize, $.GraphicsResource.Files, false)) {
      $.LogFatal(S("Font Error (4)"));
      return false;
    }
    return true;
  }

  GetBlackFontByHeight(iHgt, pfZoom) {
    let pUseFont = null;
    if (iHgt <= this.BookSmallFont.GetLineHeight()) {
      pUseFont = this.BookSmallFont;
    } else if (iHgt <= this.BookFont.GetLineHeight()) {
      pUseFont = this.BookFont;
    } else if (iHgt <= this.BookFontCapt.GetLineHeight()) {
      pUseFont = this.BookFontCapt;
    } else {
      pUseFont = this.BookFontTitle;
    }
    if (pfZoom != null) {
      let iLineHgt = pUseFont.GetLineHeight();
      if (iLineHgt !== 0) {
        pfZoom.a[pfZoom.o] = Math.fround(Math.fround(iHgt) / Math.fround(iLineHgt));
      } else {
        pfZoom.a[pfZoom.o] = 1;
      }
    }
    return pUseFont;
  }

  None() {
    this.fctPlrPropBG = new $.C4FacetID().init();
    this.fctAboutTitles = new $.C4FacetID().init();
    this.fctDlgPaper = new $.C4FacetID().init();
    this.fctStartupLogo = new $.C4FacetID().init();
    this.fctMainButtons = new $.C4FacetID().init();
    this.fctMainButtonsDown = new $.C4FacetID().init();
    this.barMainButtons = new $.DynBarFacet().None();
    this.barMainButtonsDown = new $.DynBarFacet().None();
    this.fctBookScroll = new $.C4FacetID().init();
    this.sfctBookScroll = new $.ScrollBarFacets().None();
    this.sfctBookScrollR = new $.ScrollBarFacets().None();
    this.sfctBookScrollG = new $.ScrollBarFacets().None();
    this.sfctBookScrollB = new $.ScrollBarFacets().None();
    this.fctCrew = new $.C4FacetID().init();
    this.fctCrewClr = new $.C4FacetID().init();
    this.fctScenSelIcons = new $.C4FacetID().init();
    this.fctScenSelTitleOverlay = new $.C4FacetID().init();
    this.BookFontCapt = new $.CStdFont().init();
    this.BookFont = new $.CStdFont().init();
    this.BookFontTitle = new $.CStdFont().init();
    this.BookSmallFont = new $.CStdFont().init();
    this.fctContext = new $.C4FacetID().init();
    this.fctOptionsIcons = new $.C4FacetID().init();
    this.fctOptionsTabClip = new $.C4FacetID().init();
    this.fctNetGetRef = new $.C4FacetID().init();
    return this;
  }

  $clone() { return new C4StartupGraphics().$assign(this); }
  $assign(o) {
    this.fctPlrPropBG.$assign(o.fctPlrPropBG);
    this.fctAboutTitles.$assign(o.fctAboutTitles);
    this.fctDlgPaper.$assign(o.fctDlgPaper);
    this.fctStartupLogo.$assign(o.fctStartupLogo);
    this.fctMainButtons.$assign(o.fctMainButtons);
    this.fctMainButtonsDown.$assign(o.fctMainButtonsDown);
    this.barMainButtons.$assign(o.barMainButtons);
    this.barMainButtonsDown.$assign(o.barMainButtonsDown);
    this.fctBookScroll.$assign(o.fctBookScroll);
    this.sfctBookScroll.$assign(o.sfctBookScroll);
    this.sfctBookScrollR.$assign(o.sfctBookScrollR);
    this.sfctBookScrollG.$assign(o.sfctBookScrollG);
    this.sfctBookScrollB.$assign(o.sfctBookScrollB);
    this.fctCrew.$assign(o.fctCrew);
    this.fctCrewClr.$assign(o.fctCrewClr);
    this.fctScenSelIcons.$assign(o.fctScenSelIcons);
    this.fctScenSelTitleOverlay.$assign(o.fctScenSelTitleOverlay);
    this.BookFontCapt.$assign(o.BookFontCapt);
    this.BookFont.$assign(o.BookFont);
    this.BookFontTitle.$assign(o.BookFontTitle);
    this.BookSmallFont.$assign(o.BookSmallFont);
    this.fctContext.$assign(o.fctContext);
    this.fctOptionsIcons.$assign(o.fctOptionsIcons);
    this.fctOptionsTabClip.$assign(o.fctOptionsTabClip);
    this.fctNetGetRef.$assign(o.fctNetGetRef);
    return this;
  }
}

export class C4Startup {
  static pInstance;
  static eLastDlgID;
  static sSubDialog;
  Graphics = new C4StartupGraphics().None();
  fInStartup = false;
  fLastDlgWasBack = false;
  pLastDlg = null;
  pCurrDlg = null;

  init() {
    this.Graphics = new C4StartupGraphics().None();
    this.fInStartup = false;
    this.pLastDlg = null;
    this.pCurrDlg = null;
    0;
    C4Startup.pInstance = this;
    return this;
  }

  $dtor() {
    C4Startup.pInstance = null;
    $delete(this.pLastDlg);
    $delete(this.pCurrDlg);
  }

  DoStartup() {
    0;
    0;
    this.fInStartup = true;
    this.fLastDlgWasBack = false;
    $.GraphicsSystem.EnableLoaderDrawing();
    if (this.pLastDlg != null) {
      $delete(this.pLastDlg);
      this.pLastDlg = null;
    }
    if (this.pCurrDlg != null) {
      $delete(this.pCurrDlg);
      this.pCurrDlg = null;
    }
    this.SwitchDialog(C4Startup.eLastDlgID, true, C4Startup.sSubDialog.getData());
    if ($.Game.fQuitWithError || $.GetFatalError() != null) {
      $.Game.fQuitWithError = false;
      let szErr = $.GetFatalError();
      if (szErr != null) {
        $.pGUI.ShowMessage(szErr, $.LoadResStr(S("IDS_DLG_LOG")), 11 /*Ico_Error*/);
      } else {
        let sLastLog = new $.StdStrBuf();
        if ($.GetLogSection($.Game.StartupLogPos, $.Game.QuitLogPos - $.Game.StartupLogPos, sLastLog)) {
          if (!sLastLog.isNull()) {
            $.pGUI.ShowRemoveDlg(new $.InfoDialog().init$pi8$i32$StdStrBuf($.LoadResStr(S("IDS_DLG_LOG")), 10, sLastLog));
          }
        }
      }
      $.ResetFatalError();
    }
  }

  DontStartup() {
    $delete(this.pLastDlg);
    this.pLastDlg = null;
    if (this.pCurrDlg != null) {
      if ($.Dialog.prototype.IsShown.call(this.pCurrDlg)) {
        this.pCurrDlg.Close$b(true);
      }
      $delete(this.pCurrDlg);
      this.pCurrDlg = null;
    }
    this.fInStartup = false;
    $.pGUI.CloseAllDialogs(true);
  }

  SwitchDialog(eToDlg, fFade = true, szSubDialog = null) {
    if (eToDlg === 9 && (this.fLastDlgWasBack || this.pLastDlg == null)) {
      eToDlg = 0 /*SDID_Main*/;
    }
    this.fLastDlgWasBack = false;
    let pToDlg = null;
    switch (eToDlg) {
      case 0:
        pToDlg = new $.C4StartupMainDlg().init();
        break;
      case 1:
        pToDlg = new $.C4StartupScenSelDlg().init(false);
        break;
      case 2:
        pToDlg = new $.C4StartupScenSelDlg().init(true);
        break;
      case 3:
        pToDlg = new $.C4StartupNetDlg().init();
        break;
      case 4:
        pToDlg = new $.C4StartupOptionsDlg().init();
        break;
      case 5:
        pToDlg = new $.C4StartupAboutDlg().init();
        break;
      case 6:
        pToDlg = new $.C4StartupLegalDlg().init();
        break;
      case 7:
        pToDlg = new $.C4StartupPlrSelDlg().init();
        break;
      case 8:
        pToDlg = new $.C4StartupModsDlg().init();
        break;
      case 9:
        pToDlg = this.pLastDlg;
        this.fLastDlgWasBack = true;
        break;
    }
    ;
    0;
    if (pToDlg == null) {
      return null;
    }
    if (pToDlg !== this.pLastDlg) {
      C4Startup.eLastDlgID = eToDlg;
      if (this.pLastDlg != null) {
        $delete(this.pLastDlg);
      }
    }
    if ((this.pLastDlg = this.pCurrDlg) != null) {
      if (fFade) {
        if (!$.Dialog.prototype.IsShown.call(this.pLastDlg)) {
          this.pLastDlg.Show($.pGUI, false);
        }
        this.pLastDlg.FadeOut(true);
      } else {
        $delete(this.pLastDlg);
        this.pLastDlg = null;
      }
    }
    this.pCurrDlg = pToDlg;
    if (szSubDialog != null) {
      this.pCurrDlg.SetSubscreen(szSubDialog);
    }
    if (fFade) {
      if (!pToDlg.FadeIn($.pGUI)) {
        $delete(pToDlg);
        this.pCurrDlg = null;
        return null;
      }
    } else {
      if (!pToDlg.Show($.pGUI, true)) {
        $delete(pToDlg);
        this.pCurrDlg = null;
        return null;
      }
    }
    return pToDlg;
  }

  static EnsureLoaded() {
    0;
    if (C4Startup.pInstance == null) {
      $.Game.SetInitProgress(36);
      let pStartup = new C4Startup().init();
      $.Game.SetInitProgress(37);
      if (!pStartup.Graphics.Init()) {
        $.LogFatal($.LoadResStr(S("IDS_ERR_NOGFXSYS")));
        $delete(pStartup);
        return null;
      }
    }
    return C4Startup.pInstance;
  }

  static Unload() {
    if (C4Startup.pInstance != null) {
      $delete(C4Startup.pInstance);
      C4Startup.pInstance = null;
    }
  }

  static InitStartup() {
    let pStartup = C4Startup.EnsureLoaded();
    if (pStartup == null) {
      $.Application.Quit$v();
      return;
    }
    pStartup.DoStartup();
  }

  static CloseStartup() {
    if (C4Startup.pInstance != null) {
      C4Startup.pInstance.DontStartup();
    }
  }

  static SetStartScreen(szScreen, szSubDialog = null) {
    C4Startup.sSubDialog.Clear();
    if (szSubDialog != null) {
      C4Startup.sSubDialog.op_assign$pi8(szSubDialog);
    }
    if ($.SEqualNoCase(szScreen, S("main"))) {
      C4Startup.eLastDlgID = 0 /*SDID_Main*/;
    }
    if ($.SEqualNoCase(szScreen, S("scen"))) {
      C4Startup.eLastDlgID = 1 /*SDID_ScenSel*/;
    }
    if ($.SEqualNoCase(szScreen, S("netscen"))) {
      C4Startup.eLastDlgID = 2 /*SDID_ScenSelNetwork*/;
    } else if ($.SEqualNoCase(szScreen, S("net"))) {
      C4Startup.eLastDlgID = 3 /*SDID_NetJoin*/;
    } else if ($.SEqualNoCase(szScreen, S("mods"))) {
      C4Startup.eLastDlgID = 8 /*SDID_Mods*/;
    } else if ($.SEqualNoCase(szScreen, S("options"))) {
      C4Startup.eLastDlgID = 4 /*SDID_Options*/;
    } else if ($.SEqual2NoCase(szScreen, S("options-"))) {
      C4Startup.eLastDlgID = 4 /*SDID_Options*/;
      C4Startup.sSubDialog.Copy$pi8($padd(szScreen, 8));
    } else if ($.SEqualNoCase(szScreen, S("plrsel"))) {
      C4Startup.eLastDlgID = 7 /*SDID_PlrSel*/;
    } else if ($.SEqualNoCase(szScreen, S("about"))) {
      C4Startup.eLastDlgID = 5 /*SDID_About*/;
    } else {
      return false;
    }
    return true;
  }

  OnKeyboardLayoutChanged() {
    if (this.pCurrDlg != null) {
      this.pCurrDlg.OnKeyboardLayoutChanged();
    }
  }

  OnLeagueOptionChanged() {
    if (this.pCurrDlg != null) {
      this.pCurrDlg.OnLeagueOptionChanged();
    }
  }

  static Get() {
    0;
    return C4Startup.pInstance;
  }

  $clone() { return new C4Startup().$assign(this); }
  $assign(o) {
    this.Graphics.$assign(o.Graphics);
    this.fInStartup = o.fInStartup;
    this.fLastDlgWasBack = o.fLastDlgWasBack;
    this.pLastDlg = o.pLastDlg;
    this.pCurrDlg = o.pCurrDlg;
    return this;
  }
}

export class C4StartupDlg extends FullscreenDialog {

  init(szTitle) {
    super.init(szTitle, null);
    this.$dyn = C4StartupDlg;
    return this;
  }

  SetSubscreen(_szToScreen) {
    return false;
  }

  OnKeyboardLayoutChanged() {
  }

  OnLeagueOptionChanged() {
  }

  $clone() { return new C4StartupDlg().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}








export function $init(): void {
  C4Startup.pInstance = null;
  C4Startup.eLastDlgID = 0 /*SDID_Main*/;
  C4Startup.sSubDialog = new $.StdCopyStrBuf();
  $.C4StartupFontClr$C4Startup = -0x1000000;
  $.C4StartupFontClrDisabled$C4Startup = -0x808081;
  $.C4StartupEditBGColor$C4Startup = 0;
  $.C4StartupEditBorderColor$C4Startup = -0x5b6b86;
  $.C4StartupBtnFontClr$C4Startup = -0xdfdfe0;
  $.C4StartupBtnBorderColor1$C4Startup = -0x333c4c;
  $.C4StartupBtnBorderColor2$C4Startup = -0x6b7b96;
}

Object.assign($, { C4Startup, C4StartupDlg, C4StartupGraphics });
