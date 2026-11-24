// @ts-nocheck
// OpenClonk 36de799: src/gui/C4GameOverDlg.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { Dialog, Window } from './C4Gui.ts';
import { $spawn } from '../../rt/coro.ts';
import { $u64n } from '../../rt/int.ts';
import { P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete, $max, $min, $mixin } from '../../rt/std.ts';

export class C4GoalDisplay extends Window {

  init(rcBounds) {
    super.init();
    this.$dyn = C4GoalDisplay;
    this.SetBounds(rcBounds);
    return this;
  }

  $dtor() {
    super.$dtor();
  }

  SetGoals(rAllGoals, rFulfilledGoals, iGoalSymbolHeight) {
    this.ClearChildren$v();
    let iGoalSymbolMargin = 4;
    let iGoalSymbolAreaHeight = Math.imul(2, iGoalSymbolMargin) + iGoalSymbolHeight | 0;
    let iGoalAreaWdt = this.GetClientRect().Wdt;
    let iGoalsPerRow = $max(1, iGoalAreaWdt / iGoalSymbolAreaHeight | 0);
    let iGoalCount = rAllGoals.GetNumberOfIDs$v();
    let iRowCount = ((iGoalCount - 1 | 0) / iGoalsPerRow | 0) + 1 | 0;
    let rcNewBounds = this.GetBounds().$clone();
    rcNewBounds.Hgt = (this.GetMarginTop() + this.GetMarginBottom() | 0) + Math.imul(iRowCount, iGoalSymbolAreaHeight) | 0;
    this.SetBounds(rcNewBounds);
    let caAll = new $.ComponentAligner().init(this.GetClientRect(), 0, 0, true);
    let iGoal = 0;
    for (let iRow = 0; iRow < iRowCount; iRow = iRow + 1 | 0) {
      let iColCount = $min(iGoalCount - iGoal | 0, iGoalsPerRow);
      let caGoalArea = new $.ComponentAligner().init(caAll.GetFromTop$i32$i32(iGoalSymbolAreaHeight, Math.imul(iColCount, iGoalSymbolAreaHeight)), iGoalSymbolMargin, iGoalSymbolMargin, false);
      for (let iCol = 0; iCol < iColCount; iCol = iCol + 1 | 0, iGoal = iGoal + 1 | 0) {
        let idGoal = rAllGoals.GetID$u64$pi32($u64n(iGoal));
        let fFulfilled = !!(rFulfilledGoals.GetIDCount(idGoal.$clone(), 1) !== 0);
        $.Container.prototype.AddElement$pElement.call(this, new C4GoalDisplay$GoalPicture().init(caGoalArea.GetGridCell(iCol, iColCount, iRow, iRowCount), idGoal.$clone(), fFulfilled));
      }
    }
  }

  $clone() { return new C4GoalDisplay().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class C4GoalDisplay$GoalPicture extends Window {
  idGoal = new $.C4ID().init$v();
  fFulfilled = false;
  Picture = new $.C4FacetSurface().init();

  init(rcBounds, idGoal, fFulfilled) {
    super.init();
    this.idGoal = idGoal.$clone();
    this.fFulfilled = fFulfilled;
    this.Picture = new $.C4FacetSurface().init();
    this.$dyn = C4GoalDisplay$GoalPicture;
    this.SetBounds(rcBounds);
    let strGoalName = new $.StdStrBuf();
    let pGoalDef = $.Definitions.ID2Def(idGoal.$clone());
    if (pGoalDef != null) {
      strGoalName.Copy$pi8(pGoalDef.GetName());
    }
    let sToolTip = new $.StdStrBuf();
    if (fFulfilled) {
      sToolTip.Format($.LoadResStr(S("IDS_DESC_GOALFULFILLED")), strGoalName.getData());
    } else {
      sToolTip.Format($.LoadResStr(S("IDS_DESC_GOALNOTFULFILLED")), strGoalName.getData());
    }
    this.SetToolTip(sToolTip.getData());
    let pDrawDef = $.Definitions.ID2Def(idGoal.$clone());
    if (pDrawDef != null) {
      this.Picture.Create(64, 64);
      let pGoalObj = $.Objects.Find(pDrawDef);
      pDrawDef.Draw$rC4Facet$b$u32$pC4Object$i32$i32$pC4DrawTransform$pi8(this.Picture, false, 0, pGoalObj);
    }
    if (!fFulfilled) {
      this.Picture.Grayscale(30);
    }
    return this;
  }

  DrawElement(cgo) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4GoalDisplay$GoalPicture && C4GoalDisplay$GoalPicture.prototype instanceof $c) return $c.prototype.DrawElement.apply(this, arguments); }
    let cgoDraw = new $.C4Facet().init$v();
    cgoDraw.Set$pC4Surface$f32$f32$f32$f32(cgo.Surface, Math.fround(Math.fround(cgo.X + Math.fround(this.rcBounds.x)) + cgo.TargetX), Math.fround(Math.fround(cgo.Y + Math.fround(this.rcBounds.y)) + cgo.TargetY), Math.fround(this.rcBounds.Wdt), Math.fround(this.rcBounds.Hgt));
    this.Picture.Draw$rC4Facet$b$i32$i32$b(cgoDraw);
    if (this.fFulfilled) {
      cgoDraw.Set$pC4Surface$f32$f32$f32$f32(cgoDraw.Surface, Math.fround(cgoDraw.X + Math.fround(Math.fround(cgoDraw.Wdt * Math.fround(1)) / Math.fround(2))), Math.fround(cgoDraw.Y + Math.fround(Math.fround(cgoDraw.Hgt * Math.fround(1)) / Math.fround(2))), Math.fround(cgoDraw.Wdt / Math.fround(2)), Math.fround(cgoDraw.Hgt / Math.fround(2)));
      $.Icon.GetIconFacet$i32(48 /*Ico_Star*/).Draw$rC4Facet$b$i32$i32$b(cgoDraw);
    }
  }

  $clone() { return new C4GoalDisplay$GoalPicture().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.idGoal.$assign(o.idGoal);
    this.fFulfilled = o.fFulfilled;
    this.Picture.$assign(o.Picture);
    return this;
  }
}

export class C4GameOverDlg extends Dialog {
  static is_shown;
  iPlrListCount = 0;
  ppPlayerLists = null;
  pNetResultLabel = null;
  pBtnExit = null;
  pBtnContinue = null;
  fIsNetDone = false;
  fIsQuitBtnVisible = false;
  fHasNextMissionButton = false;
  tLastTimer = new $.C4TimeMilliseconds();
  iDelay = 0;
  scheduler = null;

  OnExitBtn(_btn) {
    $.Application.QuitGame();
    this.Close$b(false);
  }

  OnContinueBtn(_btn) {
    if (this.fHasNextMissionButton) {
      $.Application.SetNextMission($.Game.NextMission.getData());
      $.Application.QuitGame();
    }
    this.Close$b(true);
  }

  Update$v() {
    for (let i = 0; i < this.iPlrListCount; i = i + 1 | 0) {
      this.ppPlayerLists.a[this.ppPlayerLists.o + i].Update$v();
    }
    if (this.pNetResultLabel != null) {
      this.SetNetResult($.Game.RoundResults.GetNetResultString(), $.Game.RoundResults.GetNetResult(), $.Network.getPendingStreamData(), $.Network.isStreaming());
    }
    let fBtnsVisible = this.fIsNetDone || !$.Network.isHost();
    if ((fBtnsVisible ? 1 : 0) !== (this.fIsQuitBtnVisible ? 1 : 0)) {
      this.fIsQuitBtnVisible = fBtnsVisible;
      this.pBtnExit.SetVisibility(fBtnsVisible);
      this.pBtnContinue.SetVisibility(fBtnsVisible);
      if (this.fIsQuitBtnVisible) {
        this.SetFocus(this.pBtnExit, false);
      }
    }
  }

  SetNetResult(szResultString, eResultType, iPendingStreamingData, fIsStreaming) {
    let sResult = new $.StdStrBuf().init$pi8$b(szResultString);
    if (fIsStreaming) {
      sResult.AppendChar(124);
      sResult.AppendFormat(S("[!]Transmitting record to league server... (%d kb remaining)"), Math.trunc(iPendingStreamingData / 1024) | 0);
    }
    let sBrokenResult = new $.StdStrBuf();
    $.GraphicsResource.TextFont.BreakMessage$pi8$i32$pStdStrBuf$b$f32(sResult.getData(), this.pNetResultLabel.GetBounds().Wdt, sBrokenResult, true);
    this.pNetResultLabel.SetText$pi8$b(sBrokenResult.getData(), false);
    if (eResultType !== 0 && !fIsStreaming) {
      this.fIsNetDone = true;
    }
    if (eResultType === 3) {
      for (let i = 0; i < this.iPlrListCount; i = i + 1 | 0) {
        this.ppPlayerLists.a[this.ppPlayerLists.o + i].SetMode(3 /*PILBM_EvaluationNoWinners*/);
      }
    }
  }

  OnShown$v() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4GameOverDlg && C4GameOverDlg.prototype instanceof $c) return $c.prototype.OnShown$v.apply(this, arguments); }
    $.Game.Scoreboard.HideDlg();
    $.FullScreen.CloseMenu();
    for (let plr = $.Players.First; plr != null; plr = plr.Next) {
      plr.CloseMenu();
    }
    $.Game.Pause();
  }

  OnClosed(fOK) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4GameOverDlg && C4GameOverDlg.prototype instanceof $c) return $c.prototype.OnClosed.apply(this, arguments); }
    $.Game.Unpause();
    $.Dialog.prototype.OnClosed.call(this, fOK);
  }

  OnEnter() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4GameOverDlg && C4GameOverDlg.prototype instanceof $c) return $c.prototype.OnEnter.apply(this, arguments); }
    if (this.fIsQuitBtnVisible) {
      this.OnExitBtn(null);
    }
    return true;
  }

  OnEscape() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4GameOverDlg && C4GameOverDlg.prototype instanceof $c) return $c.prototype.OnEscape.apply(this, arguments); }
    if (this.fIsQuitBtnVisible) {
      $spawn(this.UserClose$b(false));
    }
    return true;
  }

  IsFreePlaceDialog() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4GameOverDlg && C4GameOverDlg.prototype instanceof $c) return $c.prototype.IsFreePlaceDialog.apply(this, arguments); }
    return true;
  }

  IsExclusiveDialog() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4GameOverDlg && C4GameOverDlg.prototype instanceof $c) return $c.prototype.IsExclusiveDialog.apply(this, arguments); }
    return true;
  }

  OnSec1Timer() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4GameOverDlg && C4GameOverDlg.prototype instanceof $c) return $c.prototype.OnSec1Timer.apply(this, arguments); }
    this.Update$v();
  }

  init() {
    super.init($.GetScreenWdt() < 800 ? $.GetScreenWdt() - 10 | 0 : $min($.GetScreenWdt() - 150 | 0, 800), $.GetScreenHgt() < 600 ? $.GetScreenHgt() - 10 | 0 : $min($.GetScreenHgt() - 150 | 0, 600), $.LoadResStr(S("IDS_TEXT_EVALUATION")), false);
    $.C4ApplicationSec1Timer.prototype.init.call(this);
    this.pNetResultLabel = null;
    this.fIsNetDone = false;
    this.fHasNextMissionButton = false;
    this.$dyn = C4GameOverDlg;
    C4GameOverDlg.is_shown = true;
    this.UpdateOwnPos();
    let iDefBtnHeight = 32;
    let iIndentX1 = 10;
    let iIndentY1 = 6;
    let iIndentY2 = 0;
    let caMain = new $.ComponentAligner().init(this.GetClientRect(), 0, iIndentY1, true);
    let iMainTextWidth = caMain.GetWidth() - Math.imul(6, iIndentX1) | 0;
    caMain.GetFromBottom$i32$i32(iIndentY2);
    let caBottom = new $.ComponentAligner().init(caMain.GetFromBottom$i32$i32(iDefBtnHeight + Math.imul(iIndentY1, 2) | 0), iIndentX1, 0);
    let iBottomButtonSize = caBottom.GetInnerWidth();
    iBottomButtonSize = $min((iBottomButtonSize / 2 | 0) - Math.imul(2, iIndentX1) | 0, Math.imul($.GraphicsResource.CaptionFont.GetTextWidth(S("Quit it, baby! And some.")), 2));
    const rGoals = $.Game.RoundResults.GetGoals();
    const rFulfilledGoals = $.Game.RoundResults.GetFulfilledGoals();
    if (rGoals.GetNumberOfIDs$v() !== 0) {
      let pGoalDisplay = new C4GoalDisplay().init(caMain.GetFromTop$i32$i32(64));
      pGoalDisplay.SetGoals(rGoals, rFulfilledGoals, 64);
      $.Container.prototype.AddElement$pElement.call(this, pGoalDisplay);
      caMain.ExpandTop(64 - pGoalDisplay.GetBounds().Hgt | 0);
    }
    this.fIsNetDone = false;
    let fHasNetResult = $.Game.RoundResults.HasNetResult();
    let szNetResult = null;
    if ($.Game.Parameters.isLeague() || fHasNetResult) {
      if (fHasNetResult) {
        szNetResult = $.Game.RoundResults.GetNetResultString();
      } else {
        szNetResult = $.LoadResStr(S("IDS_TEXT_LEAGUEWAITINGFOREVALUATIO"));
      }
      this.pNetResultLabel = new $.Label().init$pi8$C4Rect$i32$u32$pCStdFont$b$b$b(szNetResult, caMain.GetFromTop$i32$i32(Math.imul($.GraphicsResource.TextFont.GetLineHeight(), 2), iMainTextWidth), 1, 0xffffff00, null, false, false, true);
      $.Container.prototype.AddElement$pElement.call(this, this.pNetResultLabel);
    } else {
      this.fIsNetDone = true;
    }
    let szCustomEvaluationStrings = $.Game.RoundResults.GetCustomEvaluationStrings();
    if (szCustomEvaluationStrings != null && szCustomEvaluationStrings.a[szCustomEvaluationStrings.o] !== 0) {
      let iMaxHgt = caMain.GetInnerHeight() / 3 | 0;
      let pCustomStrings = new $.MultilineLabel().init(caMain.GetFromTop$i32$i32(0, iMainTextWidth), 0, 0, S("    "), true, true);
      pCustomStrings.AddLine$pi8$pCStdFont$u32$b$b$pCStdFont(szCustomEvaluationStrings, $.GraphicsResource.TextFont, 0xffffffff, true, false, null);
      let rcCustomStringBounds = pCustomStrings.GetBounds().$clone();
      if (rcCustomStringBounds.Hgt > iMaxHgt) {
        $delete(pCustomStrings);
        rcCustomStringBounds.Hgt = iMaxHgt;
        let pCustomStringsWin = new $.TextWindow().init(rcCustomStringBounds, 0, 0, 0, 0, 0, S("    "), true, null, 0, true);
        pCustomStringsWin.SetDecoration$b$b$pScrollBarFacets$b(false, false, null, false);
        pCustomStringsWin.AddTextLine$pi8$pCStdFont$u32$b$b$pCStdFont(szCustomEvaluationStrings, $.GraphicsResource.TextFont, 0xffffffff, true, false, null);
        caMain.ExpandTop(-iMaxHgt | 0);
        $.Container.prototype.AddElement$pElement.call(this, pCustomStringsWin);
      } else {
        caMain.ExpandTop(-rcCustomStringBounds.Hgt | 0);
        $.Container.prototype.AddElement$pElement.call(this, pCustomStrings);
      }
    }
    let caPlayerArea = new $.ComponentAligner().init(caMain.GetAll$v(), iIndentX1, 0);
    this.iPlrListCount = 1;
    let fSepTeamLists = false;
    if ($.Game.Teams.GetTeamCount() === 2 && !$.Game.Teams.IsAutoGenerateTeams()) {
      this.iPlrListCount = 2;
      fSepTeamLists = true;
    }
    this.ppPlayerLists = P(new Array($u64n(this.iPlrListCount)).fill(null), 0);
    for (let i = 0; i < this.iPlrListCount; i = i + 1 | 0) {
      this.ppPlayerLists.a[this.ppPlayerLists.o + i] = new $.C4PlayerInfoListBox().init(caPlayerArea.GetGridCell(i, this.iPlrListCount, 0, 1), 2 /*PILBM_Evaluation*/, fSepTeamLists ? $.Game.Teams.GetTeamByIndex(i).GetID() : 0);
      this.ppPlayerLists.a[this.ppPlayerLists.o + i].SetSelectionDiabled(true);
      this.ppPlayerLists.a[this.ppPlayerLists.o + i].SetDecoration$b$pScrollBarFacets$b$b(false, null, true, false);
      $.Container.prototype.AddElement$pElement.call(this, this.ppPlayerLists.a[this.ppPlayerLists.o + i]);
    }
    let btnExit = null;
    this.pBtnExit = btnExit = new $.CallbackButton$C4GameOverDlg$Button().init$pi8$rC4Rect$x$pC4GameOverDlg($.LoadResStr(S("IDS_BTN_ENDROUND")), caBottom.GetGridCell(0, 2, 0, 1, iBottomButtonSize, -1, true), "OnExitBtn");
    btnExit.SetToolTip($.LoadResStr(S("IDS_DESC_ENDTHEROUND")));
    $.Container.prototype.AddElement$pElement.call(this, btnExit);
    let btnContinue = null;
    this.pBtnContinue = btnContinue = new $.CallbackButton$C4GameOverDlg$Button().init$pi8$rC4Rect$x$pC4GameOverDlg($.LoadResStr(S("IDS_BTN_CONTINUEGAME")), caBottom.GetGridCell(1, 2, 0, 1, iBottomButtonSize, -1, true), "OnContinueBtn");
    btnContinue.SetToolTip($.LoadResStr(S("IDS_DESC_CONTINUETHEROUNDWITHNOFUR")));
    $.Container.prototype.AddElement$pElement.call(this, btnContinue);
    if ($.Game.NextMission.op_const_void_() != null) {
      if ($.Control$2.isCtrlHost() || $.Game.C4S.Head.Film === 2) {
        this.fHasNextMissionButton = true;
        btnContinue.SetText$pi8($.Game.NextMissionText.getData());
        btnContinue.SetToolTip($.Game.NextMissionDesc.getData());
      }
    }
    this.fIsQuitBtnVisible = this.fIsNetDone || !$.Network.isHost();
    $.StdScheduler.prototype.Add$pStdSchedulerProc.call($.Application, this);
    C4GameOverDlg.prototype.Update$v.call(this);
    if (this.fIsQuitBtnVisible) {
      this.SetFocus(btnExit, false);
    }
    return this;
  }

  $dtor() {
    $.StdScheduler.prototype.Remove.call($.Application, this);
    $delete(this.ppPlayerLists);
    C4GameOverDlg.is_shown = false;
    super.$dtor();
  }

  static IsShown() {
    return C4GameOverDlg.is_shown;
  }

  $clone() { return new C4GameOverDlg().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.iPlrListCount = o.iPlrListCount;
    this.ppPlayerLists = o.ppPlayerLists;
    this.pNetResultLabel = o.pNetResultLabel;
    this.pBtnExit = o.pBtnExit;
    this.pBtnContinue = o.pBtnContinue;
    this.fIsNetDone = o.fIsNetDone;
    this.fIsQuitBtnVisible = o.fIsQuitBtnVisible;
    this.fHasNextMissionButton = o.fHasNextMissionButton;
    this.tLastTimer.$assign(o.tLastTimer);
    this.iDelay = o.iDelay;
    this.scheduler = o.scheduler;
    return this;
  }
}

export function $init(): void {
  C4GameOverDlg.is_shown = false;
  $mixin(C4GameOverDlg, $.C4ApplicationSec1Timer);
}

Object.assign($, { C4GameOverDlg, C4GoalDisplay, C4GoalDisplay$GoalPicture });
