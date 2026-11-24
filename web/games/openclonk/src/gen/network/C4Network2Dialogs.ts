// @ts-nocheck
// OpenClonk 36de799: src/network/C4Network2Dialogs.cpp, src/network/C4Network2Dialogs.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { Dialog, Element, InfoDialog, ListBox, Window } from '../gui/C4Gui.ts';
import { ftoi32 } from '../../rt/int.ts';
import { c$time } from '../../rt/libc.ts';
import { $rd, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete, $max, $min, $missing, $mixin } from '../../rt/std.ts';

export class C4Chart extends Element {
  pDisplayGraph = null;
  fOwnGraph = false;

  DrawElement(cgo) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4Chart && C4Chart.prototype instanceof $c) return $c.prototype.DrawElement.apply(this, arguments); }
    let $t1, $t2, $t3;
    if (this.pDisplayGraph == null) {
      return;
    }
    let iSeriesCount = this.pDisplayGraph.GetSeriesCount();
    if (iSeriesCount === 0) {
      return;
    }
    0;
    let sbuf = new $.StdStrBuf();
    this.pDisplayGraph.Update();
    const rFont = $.GraphicsResource.MiniFont;
    let YAxisWdt = 5;
    let XAxisHgt = 15;
    let AxisArrowLen = 6;
    let AxisMarkerLen = 5;
    let AxisArrowThickness = 3;
    let AxisArrowIndent = 2;
    const YAxisMinStepHgt = [0];
    const XAxisMinStepWdt = [0];
    let iMinTime = this.pDisplayGraph.GetStartTime();
    let iMaxTime = this.pDisplayGraph.GetEndTime() - 1 | 0;
    if (iMinTime >= iMaxTime) {
      return;
    }
    let iMinVal = this.pDisplayGraph.GetMinValue();
    let iMaxVal = this.pDisplayGraph.GetMaxValue();
    if (iMinVal === iMaxVal) {
      iMaxVal = Math.fround(iMaxVal + 1);
    }
    if (iMinVal > Math.fround(0) && Math.fround(iMaxVal / iMinVal) >= Math.fround(2)) {
      iMinVal = Math.fround(0);
    } else if (iMaxVal < Math.fround(0) && Math.fround(iMinVal / iMaxVal) >= Math.fround(2)) {
      iMaxVal = Math.fround(0);
    }
    let ddv = 0;
    if (iMaxVal > Math.fround(0) && (ddv = GetValueDecade(ftoi32(iMaxVal)) / 50 | 0) !== 0) {
      iMaxVal = Math.fround(Math.fround(Math.fround(Math.fround(iMaxVal - Math.fround(iMaxVal > Math.fround(0) ? 1 : 0)) / Math.fround(ddv)) + Math.fround(iMaxVal > Math.fround(0) ? 1 : 0)) * Math.fround(ddv));
    }
    if (iMinVal !== 0 && (ddv = GetValueDecade(ftoi32(iMinVal)) / 50 | 0) !== 0) {
      iMinVal = Math.fround(Math.fround(Math.fround(Math.fround(iMinVal - Math.fround(iMinVal < Math.fround(0) ? 1 : 0)) / Math.fround(ddv)) + Math.fround(iMinVal < Math.fround(0) ? 1 : 0)) * Math.fround(ddv));
    }
    let dv = Math.fround(iMaxVal - iMinVal);
    let dt = iMaxTime - iMinTime | 0;
    sbuf.Format(S("-%d"), ftoi32($max($.Abs$f32(iMaxVal), $.Abs$f32(iMinVal))));
    rFont.GetTextExtent(sbuf.getData(), P(XAxisMinStepWdt, 0), P(YAxisMinStepHgt, 0), false);
    YAxisWdt = YAxisWdt + XAxisMinStepWdt[0] | 0;
    XAxisHgt = XAxisHgt + YAxisMinStepHgt[0] | 0;
    XAxisMinStepWdt[0] = XAxisMinStepWdt[0] + 2 | 0;
    YAxisMinStepHgt[0] = YAxisMinStepHgt[0] + 2 | 0;
    let tw = this.rcBounds.Wdt - YAxisWdt | 0;
    let th = this.rcBounds.Hgt - XAxisHgt | 0;
    let tx = (this.rcBounds.x + ftoi32(cgo.TargetX) | 0) + YAxisWdt | 0;
    let ty = this.rcBounds.y + ftoi32(cgo.TargetY) | 0;
    if (iSeriesCount > 1) {
      let iSeries = 0;
      let pSeries = null;
      let iLegendWdt = 0;
      const Q = [0];
      const W = [0];
      while ((pSeries = this.pDisplayGraph.GetSeries(($t1 = iSeries, iSeries = iSeries + 1 | 0, $t1))) != null) {
        rFont.GetTextExtent(pSeries.GetTitle(), P(W, 0), P(Q, 0), true);
        iLegendWdt = $max(iLegendWdt, W[0]);
      }
      tw = tw - (iLegendWdt + 1 | 0) | 0;
      iSeries = 0;
      let iYLegendDraw = ((th - Math.imul(iSeriesCount, Q[0]) | 0) / 2 | 0) + ty | 0;
      while ((pSeries = this.pDisplayGraph.GetSeries(($t2 = iSeries, iSeries = iSeries + 1 | 0, $t2))) != null) {
        $.pDraw.TextOut(pSeries.GetTitle(), rFont, 1, cgo.Surface, Math.fround(tx + tw | 0), Math.fround(iYLegendDraw), (pSeries.GetColorDw() | 0xff000000) >>> 0, 0, true);
        iYLegendDraw = iYLegendDraw + Q[0] | 0;
      }
    }
    if (tw < 10 || th < 10) {
      return;
    }
    $.pDraw.DrawLineDw(cgo.Surface, Math.fround(tx), Math.fround(ty + th | 0), Math.fround((tx + tw | 0) - 1 | 0), Math.fround(ty + th | 0), 0xff919191);
    $.pDraw.DrawLineDw(cgo.Surface, Math.fround((tx + tw | 0) - 1 | 0), Math.fround(ty + th | 0), Math.fround(((tx + tw | 0) - 1 | 0) - 6 | 0), Math.fround((ty + th | 0) - 3 | 0), 0xff919191);
    $.pDraw.DrawLineDw(cgo.Surface, Math.fround((tx + tw | 0) - 1 | 0), Math.fround(ty + th | 0), Math.fround(((tx + tw | 0) - 1 | 0) - 6 | 0), Math.fround((ty + th | 0) + 3 | 0), 0xff919191);
    $.pDraw.DrawLineDw(cgo.Surface, Math.fround(tx), Math.fround(ty), Math.fround(tx), Math.fround(ty + th | 0), 0xff919191);
    $.pDraw.DrawLineDw(cgo.Surface, Math.fround(tx), Math.fround(ty), Math.fround(tx - 3 | 0), Math.fround(ty + 6 | 0), 0xff919191);
    $.pDraw.DrawLineDw(cgo.Surface, Math.fround(tx), Math.fround(ty), Math.fround(tx + 3 | 0), Math.fround(ty + 6 | 0), 0xff919191);
    tw = tw - 8 | 0;
    th = th - 8 | 0;
    ty = ty + 8 | 0;
    let iXAxisSteps = GetAxisStepRange(dt, tw / XAxisMinStepWdt[0] | 0);
    let iYAxisSteps = GetAxisStepRange(ftoi32(dv), th / YAxisMinStepHgt[0] | 0);
    let iX = 0;
    let iY = 0;
    let iTime = 0;
    let iVal = 0;
    iY = 0;
    iTime = Math.imul(((iMinTime - (iMinTime > 0 ? 1 : 0) | 0) / iXAxisSteps | 0) + (iMinTime > 0 ? 1 : 0) | 0, iXAxisSteps);
    for (; iTime <= iMaxTime; iTime = iTime + iXAxisSteps | 0) {
      iX = tx + (Math.imul(tw, iTime - iMinTime | 0) / dt | 0) | 0;
      $.pDraw.DrawLineDw(cgo.Surface, Math.fround(iX), Math.fround((ty + th | 0) + 1 | 0), Math.fround(iX), Math.fround((ty + th | 0) + 5 | 0), 0xff919191);
      sbuf.Format(S("%d"), iTime);
      $.pDraw.TextOut(sbuf.getData(), rFont, 1, cgo.Surface, Math.fround(iX), Math.fround((ty + th | 0) + 5 | 0), 0xff7f7f7f, 1, false);
    }
    iVal = ftoi32(Math.fround(Math.fround(Math.fround(Math.fround(iMinVal - Math.fround(iMinVal > Math.fround(0) ? 1 : 0)) / Math.fround(iYAxisSteps)) + Math.fround(iMinVal > Math.fround(0) ? 1 : 0)) * Math.fround(iYAxisSteps)));
    for (; Math.fround(iVal) <= iMaxVal; iVal = iVal + iYAxisSteps | 0) {
      iY = (ty + th | 0) - ftoi32(Math.fround(Math.fround(Math.fround(Math.fround(iVal) - iMinVal) / dv) * Math.fround(th))) | 0;
      $.pDraw.DrawLineDw(cgo.Surface, Math.fround(tx - 5 | 0), Math.fround(iY), Math.fround(tx - 1 | 0), Math.fround(iY), 0xff919191);
      sbuf.Format(S("%d"), iVal);
      $.pDraw.TextOut(sbuf.getData(), rFont, 1, cgo.Surface, Math.fround(tx - 5 | 0), Math.fround(iY - (rFont.GetLineHeight() / 2 | 0) | 0), 0xff7f7f7f, 2, false);
    }
    let iSeries = 0;
    while (true) {
      let pSeries = this.pDisplayGraph.GetSeries(($t3 = iSeries, iSeries = iSeries + 1 | 0, $t3));
      if (!(pSeries != null)) break;
      let iThisMinTime = $max(iMinTime, pSeries.GetStartTime());
      let iThisMaxTime = $min(iMaxTime, pSeries.GetEndTime());
      let fAnyVal = false;
      for (iX = 0; iX < tw; iX = iX + 1 | 0) {
        iTime = iMinTime + (Math.imul(dt, iX) / tw | 0) | 0;
        if (!$.Inside$i32$i32$i32$3(iTime, iThisMinTime, iThisMaxTime)) {
          continue;
        }
        let iY2 = (ftoi32(Math.fround(Math.fround(Math.fround(-pSeries.GetValue(iTime) + iMinVal) * Math.fround(th)) / dv)) + ty | 0) + th | 0;
        if (fAnyVal) {
          $.pDraw.DrawLineDw(cgo.Surface, Math.fround((tx + iX | 0) - 1 | 0), Math.fround(iY), Math.fround(tx + iX | 0), Math.fround(iY2), (pSeries.GetColorDw() | 0xff000000) >>> 0);
        }
        iY = iY2;
        fAnyVal = true;
      }
    }
  }

  init(rcBounds) {
    super.init();
    this.pDisplayGraph = null;
    this.fOwnGraph = false;
    this.$dyn = C4Chart;
    this.rcBounds.$assign(rcBounds);
    return this;
  }

  $dtor() {
    if (this.fOwnGraph && this.pDisplayGraph != null) {
      $delete(this.pDisplayGraph);
    }
    super.$dtor();
  }

  SetGraph(pNewGraph, fOwn) {
    this.pDisplayGraph = pNewGraph;
    this.fOwnGraph = fOwn;
  }

  $clone() { return new C4Chart().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pDisplayGraph = o.pDisplayGraph;
    this.fOwnGraph = o.fOwnGraph;
    return this;
  }
}

export class C4Network2ClientListBox$ListItem extends Window {
  iClientID = 0;
  pForDlg = null;

  init(pForDlg, iClientID) {
    super.init();
    this.iClientID = iClientID;
    this.pForDlg = pForDlg;
    this.$dyn = C4Network2ClientListBox$ListItem;
    return this;
  }

  GetClientID() {
    return this.iClientID;
  }

  GetConnectionID() {
    return -1;
  }

  $clone() { return new C4Network2ClientListBox$ListItem().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.iClientID = o.iClientID;
    this.pForDlg = o.pForDlg;
    return this;
  }
}

export class C4GameOptionButtons extends Window {
  btnInternet = null;
  btnLeague = null;
  btnPassword = null;
  btnComment = null;
  btnRecord = null;
  fNetwork = false;
  fHost = false;
  fLobby = false;
  fCountdown = false;

  init(rcBounds, fNetwork, fHost, fLobby) {
    super.init();
    this.fNetwork = fNetwork;
    this.fHost = fHost;
    this.fLobby = fLobby;
    this.fCountdown = false;
    this.$dyn = C4GameOptionButtons;
    this.SetBounds(rcBounds);
    let iButtonCount = fNetwork ? fHost ? 6 : 3 : 2;
    let iIconSize = $min(64, rcBounds.Hgt);
    let iIconSpacing = rcBounds.Wdt / (rcBounds.Wdt >= 400 ? 64 : 128) | 0;
    if (Math.imul(iIconSize + Math.imul(iIconSpacing, 2) | 0, iButtonCount) > rcBounds.Wdt) {
      if (Math.imul(iIconSize, iButtonCount) <= rcBounds.Wdt) {
        iIconSpacing = $max(0, ((rcBounds.Wdt - Math.imul(iIconSize, iButtonCount) | 0) / Math.imul(iButtonCount, 2) | 0) - 1 | 0);
      } else {
        iIconSpacing = 0;
        iIconSize = rcBounds.Wdt / iButtonCount | 0;
      }
    }
    let caButtonArea = new $.ComponentAligner().init(rcBounds, 0, 0, true);
    let caButtons = new $.ComponentAligner().init(caButtonArea.GetCentered$i32$i32(Math.imul(iIconSize + Math.imul(2, iIconSpacing) | 0, iButtonCount), iIconSize), iIconSpacing, 0);
    if (fNetwork && fHost) {
      let fIsInternet = !($.Config.Network.MasterServerSignUp === 0);
      let fIsDisabled = false;
      if (fLobby && $.Game.Parameters.isLeague()) {
        fIsInternet = true;
        fIsDisabled = true;
      }
      this.btnInternet = new $.CallbackButton$C4GameOptionButtons$IconButton().init$i32$C4Rect$pi8$x$pC4GameOptionButtons(fIsInternet ? 263 /*Ico_Ex_InternetOn*/ : 262 /*Ico_Ex_InternetOff*/, caButtons.GetFromLeft$i32$i32(iIconSize, iIconSize), $.LoadResStr(S("IDS_DLGTIP_STARTINTERNETGAME")), "OnBtnInternet", this);
      this.btnInternet.SetEnabled(!fIsDisabled);
      $.Container.prototype.AddElement$pElement.call(this, this.btnInternet);
    } else {
      this.btnInternet = null;
    }
    let fIsLeague = false;
    if (fNetwork) {
      let eLeagueIcon = 0;
      fIsLeague = fLobby ? $.Game.Parameters.isLeague() : !($.Config.Network.LeagueServerSignUp === 0);
      eLeagueIcon = fIsLeague ? 261 /*Ico_Ex_LeagueOn*/ : 260 /*Ico_Ex_LeagueOff*/;
      this.btnLeague = new $.CallbackButton$C4GameOptionButtons$IconButton().init$i32$C4Rect$pi8$x$pC4GameOptionButtons(eLeagueIcon, caButtons.GetFromLeft$i32$i32(iIconSize, iIconSize), $.LoadResStr(S("IDS_DLGTIP_STARTLEAGUEGAME")), "OnBtnLeague", this);
      this.btnLeague.SetEnabled(fHost && !fLobby);
      $.Container.prototype.AddElement$pElement.call(this, this.btnLeague);
    } else {
      this.btnLeague = null;
    }
    if (fNetwork && fHost) {
      this.btnPassword = new $.CallbackButton$C4GameOptionButtons$IconButton().init$i32$C4Rect$pi8$x$pC4GameOptionButtons($.Network.isPassworded() ? 267 /*Ico_Ex_Locked*/ : 268 /*Ico_Ex_Unlocked*/, caButtons.GetFromLeft$i32$i32(iIconSize, iIconSize), $.LoadResStr(S("IDS_NET_PASSWORD_DESC")), "OnBtnPassword", this);
      $.Container.prototype.AddElement$pElement.call(this, this.btnPassword);
      this.btnComment = new $.CallbackButton$C4GameOptionButtons$IconButton().init$i32$C4Rect$pi8$x$pC4GameOptionButtons(273 /*Ico_Ex_Comment*/, caButtons.GetFromLeft$i32$i32(iIconSize, iIconSize), $.LoadResStr(S("IDS_DESC_COMMENTDESCRIPTIONFORTHIS")), "OnBtnComment", this);
      $.Container.prototype.AddElement$pElement.call(this, this.btnComment);
    } else {
      this.btnPassword = this.btnComment = null;
    }
    this.btnRecord = new $.CallbackButton$C4GameOptionButtons$IconButton().init$i32$C4Rect$pi8$x$pC4GameOptionButtons($.Game.Record || fIsLeague ? 257 /*Ico_Ex_RecordOn*/ : 256 /*Ico_Ex_RecordOff*/, caButtons.GetFromLeft$i32$i32(iIconSize, iIconSize), $.LoadResStr(S("IDS_DLGTIP_RECORD")), "OnBtnRecord", this);
    this.btnRecord.SetEnabled(!fIsLeague);
    $.Container.prototype.AddElement$pElement.call(this, this.btnRecord);
    return this;
  }

  $dtor() {
    super.$dtor();
  }

  SetCountdown(fToVal) {
    this.fCountdown = fToVal;
  }

  OnBtnInternet(_btn) {
    if (!this.fNetwork || !this.fHost) {
      return;
    }
    let fCheck = ($.Config.Network.MasterServerSignUp = $.Config.Network.MasterServerSignUp === 0 ? 1 : 0) !== 0;
    if (this.fLobby) {
      if (fCheck) {
        fCheck = $.Network.LeagueSignupEnable();
      } else {
        $.Network.LeagueSignupDisable();
      }
    }
    this.btnInternet.SetIcon$i32(fCheck ? 263 /*Ico_Ex_InternetOn*/ : 262 /*Ico_Ex_InternetOff*/);
    if (!fCheck) {
      $.Config.Network.LeagueServerSignUp = 0;
      if (this.btnLeague != null) {
        this.btnLeague.SetIcon$i32(260 /*Ico_Ex_LeagueOff*/);
      }
    }
    $.Config.Network.MasterServerSignUp = fCheck ? 1 : 0;
  }

  OnBtnLeague(_btn) {
    if (!this.fNetwork || !this.fHost) {
      return;
    }
    let fCheck = ($.Config.Network.LeagueServerSignUp = $.Config.Network.LeagueServerSignUp === 0 ? 1 : 0) !== 0;
    this.btnLeague.SetIcon$i32(fCheck ? 261 /*Ico_Ex_LeagueOn*/ : 260 /*Ico_Ex_LeagueOff*/);
    if (!$.Game.Record) {
      this.OnBtnRecord(this.btnRecord);
    }
    this.btnRecord.SetEnabled(!fCheck);
    if (fCheck && $.Config.Network.MasterServerSignUp === 0) {
      this.OnBtnInternet(this.btnInternet);
    }
    if ($.C4Startup.Get() != null) {
      $.C4Startup.Get().OnLeagueOptionChanged();
    }
  }

  OnBtnRecord(_btn) {
    $.Game.Record = !$.Game.Record;
    $.Config.General.DefRec = $.Game.Record ? 1 : 0;
    this.btnRecord.SetIcon$i32($.Game.Record ? 257 /*Ico_Ex_RecordOn*/ : 256 /*Ico_Ex_RecordOff*/);
  }

  OnBtnPassword(_btn) {
    if (!this.fNetwork || !this.fHost) {
      return;
    }
    if ($.Network.GetPassword() != null && $rd($.Network.GetPassword()) !== 0) {
      let empty = new $.StdStrBuf();
      this.OnPasswordSet(empty);
      return;
    }
    let pDlg = null;
    this.GetScreen().ShowRemoveDlg(pDlg = new $.InputDialog().init($.LoadResStr(S("IDS_MSG_ENTERPASSWORD")), $.LoadResStr(S("IDS_DLG_PASSWORD")), 269 /*Ico_Ex_LockedFrontal*/, new $.InputCallback$C4GameOptionButtons().init(this, "OnPasswordSet"), false));
    pDlg.SetMaxText(1024);
    let szPassPreset = $.Network.GetPassword();
    if (szPassPreset == null || szPassPreset.a[szPassPreset.o] === 0) {
      szPassPreset = P($.Config.Network.LastPassword, 0);
    }
    if (szPassPreset.a[szPassPreset.o] !== 0) {
      pDlg.SetInputText(szPassPreset);
    }
  }

  OnPasswordSet(rsNewPassword) {
    let szPass = null;
    $.Network.SetPassword(szPass = rsNewPassword.getData());
    this.UpdatePasswordBtn();
    let fHasPassword = szPass != null && szPass.a[szPass.o] !== 0;
    if (fHasPassword) {
      $.SCopy$pi8$pi8$u64(szPass, P($.Config.Network.LastPassword, 0), 1024);
    }
    $.GUISound(S("UI::Confirmed"));
  }

  OnBtnComment(_btn) {
    let pDlg = null;
    this.GetScreen().ShowRemoveDlg(pDlg = new $.InputDialog().init($.LoadResStr(S("IDS_CTL_ENTERCOMMENT")), $.LoadResStr(S("IDS_CTL_COMMENT")), 273 /*Ico_Ex_Comment*/, new $.InputCallback$C4GameOptionButtons().init(this, "OnCommentSet"), false));
    pDlg.SetMaxText(256);
    pDlg.SetInputText($.Config.Network.Comment.getData());
  }

  OnCommentSet(rsNewComment) {
    if (rsNewComment.op_eq$StdStrBuf($.Config.Network.Comment)) {
      return;
    }
    $.Config.Network.Comment.CopyValidated$pi8(rsNewComment.getData());
    $.Network.InvalidateReference();
    $.Log($.LoadResStr(S("IDS_NET_COMMENTCHANGED")));
    $.GUISound(S("UI::Confirmed"));
  }

  UpdatePasswordBtn() {
    let szPass = $.Network.GetPassword();
    let fHasPassword = szPass != null && szPass.a[szPass.o] !== 0;
    this.btnPassword.SetIcon$i32(fHasPassword ? 267 /*Ico_Ex_Locked*/ : 268 /*Ico_Ex_Unlocked*/);
  }

  $clone() { return new C4GameOptionButtons().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.btnInternet = o.btnInternet;
    this.btnLeague = o.btnLeague;
    this.btnPassword = o.btnPassword;
    this.btnComment = o.btnComment;
    this.btnRecord = o.btnRecord;
    this.fNetwork = o.fNetwork;
    this.fHost = o.fHost;
    this.fLobby = o.fLobby;
    this.fCountdown = o.fCountdown;
    return this;
  }
}

export class C4Network2ClientListBox$ClientListItem extends C4Network2ClientListBox$ListItem {
  pStatusIcon = null;
  pName = null;
  pPing = null;
  pActivateBtn = null;
  pKickBtn = null;
  fShownActive = false;
  last_sound_time = 0;

  init(pForDlg, iClientID) {
    super.init(pForDlg, iClientID);
    this.pStatusIcon = null;
    this.pName = null;
    this.pPing = null;
    this.pActivateBtn = null;
    this.pKickBtn = null;
    this.last_sound_time = 0;
    this.$dyn = C4Network2ClientListBox$ClientListItem;
    let pClient = C4Network2ClientListBox$ClientListItem.prototype.GetClient.call(this);
    let iIconSize = $.GraphicsResource.TextFont.GetLineHeight();
    if (pForDlg.IsStartup()) {
      iIconSize = Math.imul(iIconSize, 2);
    }
    let iWidth = pForDlg.GetItemWidth();
    let iVerticalIndent = 2;
    this.SetBounds(new $.C4Rect().init$i32$i32$i32$i32(0, 0, iWidth, iIconSize + Math.imul(2, iVerticalIndent) | 0));
    let ca = new $.ComponentAligner().init(this.GetContainedClientRect(), 0, iVerticalIndent);
    let fIsHost = pClient != null && pClient.isHost();
    this.pStatusIcon = new $.Icon().init(ca.GetFromLeft$i32$i32(iIconSize), fIsHost ? 4 /*Ico_Host*/ : 5 /*Ico_Client*/);
    let sNameLabel = new $.StdStrBuf();
    if (pClient != null) {
      if (pForDlg.IsStartup()) {
        sNameLabel.Ref$pi8(pClient.getName());
      } else {
        sNameLabel.Format(S("%s:%s"), pClient.getName(), pClient.getNick());
      }
    } else {
      sNameLabel.Ref$pi8(S("???"));
    }
    this.pName = new $.Label().init$pi8$i32$i32$i32$u32$pCStdFont$b$b(sNameLabel.getData(), iIconSize + 2 | 0, iVerticalIndent, 0);
    let iPingRightPos = this.GetBounds().Wdt - 2 | 0;
    if ($.Network.isHost()) {
      iPingRightPos = iPingRightPos - 48 | 0;
    }
    if ($.Network.isHost() && pClient != null && !pClient.isHost()) {
      if (!pForDlg.IsStartup()) {
        this.pActivateBtn = new $.CallbackButtonEx$ClientListItem$IconButton().init$i32$C4Rect$i8$pClientListItem$x(14 /*Ico_Active*/, this.GetToprightCornerRect($max(iIconSize, 16), $max(iIconSize, 16), 2, 1, 1), 0, this, "OnButtonActivate");
        this.fShownActive = true;
      }
      this.pKickBtn = new $.CallbackButtonEx$ClientListItem$IconButton().init$i32$C4Rect$i8$pClientListItem$x(16 /*Ico_Kick*/, this.GetToprightCornerRect($max(iIconSize, 16), $max(iIconSize, 16), 2, 1, 0), 0, this, "OnButtonKick");
      this.pKickBtn.SetToolTip($.LoadResStrNoAmp(S("IDS_NET_KICKCLIENT")));
    }
    if (!pForDlg.IsStartup()) {
      if (pClient != null && !pClient.isLocal()) {
        this.pPing = new $.Label().init$pi8$i32$i32$i32$u32$pCStdFont$b$b(S("???"), iPingRightPos, iVerticalIndent, 2);
        this.pPing.SetToolTip($.LoadResStr(S("IDS_DESC_CONTROLWAITTIME")));
      }
    }
    $.Container.prototype.AddElement$pElement.call(this, this.pStatusIcon);
    $.Container.prototype.AddElement$pElement.call(this, this.pName);
    if (this.pPing != null) {
      $.Container.prototype.AddElement$pElement.call(this, this.pPing);
    }
    if (this.pActivateBtn != null) {
      $.Container.prototype.AddElement$pElement.call(this, this.pActivateBtn);
    }
    if (this.pKickBtn != null) {
      $.Container.prototype.AddElement$pElement.call(this, this.pKickBtn);
    }
    pForDlg.AddElement$pElement$i32(this);
    C4Network2ClientListBox$ClientListItem.prototype.Update$v.call(this);
    return this;
  }

  Update$v() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4Network2ClientListBox$ClientListItem && C4Network2ClientListBox$ClientListItem.prototype instanceof $c) return $c.prototype.Update$v.apply(this, arguments); }
    if (this.pPing != null) {
      let iWait = $.Control$2.Network.ClientPerfStat(this.iClientID);
      this.pPing.SetText$pi8$b($.FormatString(S("%d ms"), iWait).getData());
      this.pPing.SetColor$u32$b((((0xff000000 | (($.Clamp$i32$i32$i32(255 - Math.imul($.Abs$i32(iWait), 5) | 0, 0, 255) >>> 0 & 255) >>> 0 << 16) >>> 0) >>> 0 | (($.Clamp$i32$i32$i32(255 - Math.imul(iWait, 5) | 0, 0, 255) >>> 0 & 255) >>> 0 << 8) >>> 0) >>> 0 | ($.Clamp$i32$i32$i32(255 + Math.imul(iWait, 5) | 0, 0, 255) & 255) >>> 0) >>> 0);
    }
    let pClient = this.GetClient();
    if (pClient == null) {
      return;
    }
    let fIsActive = pClient.isActivated();
    if ((fIsActive ? 1 : 0) !== (this.fShownActive ? 1 : 0)) {
      this.fShownActive = fIsActive;
      if (!pClient.isHost()) {
        this.pStatusIcon.SetIcon$i32(fIsActive ? 5 /*Ico_Client*/ : 8 /*Ico_ObserverClient*/);
      }
      if (this.pActivateBtn != null) {
        this.pActivateBtn.SetIcon$i32(fIsActive ? 14 /*Ico_Active*/ : 15 /*Ico_Inactive*/);
        this.pActivateBtn.SetToolTip($.LoadResStrNoAmp(fIsActive ? S("IDS_NET_DEACTIVATECLIENT") : S("IDS_NET_ACTIVATECLIENT")));
      }
    }
    let sCltPlrs = $.Game.PlayerInfos.GetActivePlayerNames(false, this.iClientID);
    this.pName.SetToolTip(sCltPlrs.getData());
    let icoStatus = 6 /*Ico_UnknownClient*/;
    let pClt = pClient.getNetClient();
    if (pClt != null) {
      switch (pClt.getStatus()) {
        case 0:
        case 1:
        case 2:
          icoStatus = 17 /*Ico_Loading*/;
          break;
        case 3:
          icoStatus = 47 /*Ico_Ready*/;
          break;
        case 4:
          icoStatus = 16 /*Ico_Kick*/;
          break;
        default:
          0;
          icoStatus = 17 /*Ico_Loading*/;
          break;
      }
    }
    if (this.last_sound_time !== 0) {
      let dt = c$time(null) - this.last_sound_time;
      if (dt >= 1) {
        this.last_sound_time = 0;
      } else {
        icoStatus = 23 /*Ico_Sound*/;
      }
    }
    if (!this.pForDlg.IsStartup() && icoStatus === 47) {
      if (!$.Control$2.Network.ClientReady(this.iClientID, $.Control$2.ControlTick)) {
        icoStatus = 3 /*Ico_NetWait*/;
      }
    }
    this.pStatusIcon.SetIcon$i32(icoStatus);
  }

  GetClient() {
    return $.Game.Clients.getClientByID(this.iClientID);
  }

  OnButtonActivate(_pButton) {
    if ($.Game.Parameters.isLeague() && $.Players.GetAtClient$i32$i32(this.iClientID) != null) {
      $.Log($.LoadResStr(S("IDS_LOG_COMMANDNOTALLOWEDINLEAGUE")));
      return;
    }
    $.Control$2.DoInput(129 /*CID_ClientUpdate*/, new $.C4ControlClientUpdate().init$i32$i32$i32(this.iClientID, 0 /*CUT_Activate*/, !this.fShownActive ? 1 : 0), 1 /*CDT_Sync*/);
  }

  OnButtonKick(_pButton) {
    if ($.Game.Parameters.isLeague() && $.Players.GetAtClient$i32$i32(this.iClientID) != null) {
      $.Network.Vote(1 /*VT_Kick*/, true, this.iClientID);
    } else {
      $.Game.Clients.CtrlRemove(this.GetClient(), $.LoadResStr(P(this.pForDlg.IsStartup() ? S("IDS_MSG_KICKFROMSTARTUPDLG") : S("IDS_MSG_KICKFROMCLIENTLIST"), 0)));
    }
  }

  SetSoundIcon() {
    this.last_sound_time = c$time(null);
    this.Update$v();
  }

  $clone() { return new C4Network2ClientListBox$ClientListItem().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pStatusIcon = o.pStatusIcon;
    this.pName = o.pName;
    this.pPing = o.pPing;
    this.pActivateBtn = o.pActivateBtn;
    this.pKickBtn = o.pKickBtn;
    this.fShownActive = o.fShownActive;
    this.last_sound_time = o.last_sound_time;
    return this;
  }
}

export class C4Network2ClientListBox$ConnectionListItem extends C4Network2ClientListBox$ListItem {
  iConnID = 0;
  pDesc = null;
  pPing = null;
  pDisconnectBtn = null;

  init(pForDlg, iClientID, iConnectionID) {
    super.init(pForDlg, iClientID);
    this.iConnID = iConnectionID;
    this.pDesc = null;
    this.pPing = null;
    this.pDisconnectBtn = null;
    this.$dyn = C4Network2ClientListBox$ConnectionListItem;
    const rUseFont = $.GraphicsResource.TextFont;
    let iIconSize = rUseFont.GetLineHeight();
    let iWidth = pForDlg.GetItemWidth();
    let iVerticalIndent = 2;
    this.SetBounds(new $.C4Rect().init$i32$i32$i32$i32(0, 0, iWidth, iIconSize + Math.imul(2, iVerticalIndent) | 0));
    let ca = new $.ComponentAligner().init(this.GetContainedClientRect(), 0, iVerticalIndent);
    ca.ExpandLeft(Math.imul(-iIconSize | 0, 2));
    if (!$.Game.Parameters.isLeague()) {
      this.pDisconnectBtn = new $.CallbackButtonEx$ConnectionListItem$IconButton().init$i32$C4Rect$i8$pConnectionListItem$x(49 /*Ico_Disconnect*/, ca.GetFromRight$i32$i32(iIconSize, iIconSize), 0, this, "OnButtonDisconnect");
      this.pDisconnectBtn.SetToolTip($.LoadResStr(S("IDS_MENU_DISCONNECT")));
    }
    const sx = [40];
    const sy = [iIconSize];
    rUseFont.GetTextExtent(S("???? ms"), P(sx, 0), P(sy, 0), true);
    this.pPing = new $.Label().init$pi8$C4Rect$i32$u32$pCStdFont$b$b$b(S("???"), ca.GetFromRight$i32$i32(sx[0], sy[0]), 2);
    this.pPing.SetToolTip($.LoadResStr(S("IDS_NET_CONTROL_PING")));
    this.pDesc = new $.Label().init$pi8$C4Rect$i32$u32$pCStdFont$b$b$b(S("???"), ca.GetAll$v(), 0);
    $.Container.prototype.AddElement$pElement.call(this, this.pDesc);
    $.Container.prototype.AddElement$pElement.call(this, this.pPing);
    if (this.pDisconnectBtn != null) {
      $.Container.prototype.AddElement$pElement.call(this, this.pDisconnectBtn);
    }
    pForDlg.AddElement$pElement$i32(this);
    C4Network2ClientListBox$ConnectionListItem.prototype.Update$v.call(this);
    return this;
  }

  Update$v() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4Network2ClientListBox$ConnectionListItem && C4Network2ClientListBox$ConnectionListItem.prototype instanceof $c) return $c.prototype.Update$v.apply(this, arguments); }
    let pConn = this.GetConnection$v();
    if (pConn == null) {
      this.pDesc.SetText$pi8$b(S("???"));
      this.pPing.SetText$pi8$b(S("???"));
      return;
    }
    let iPing = pConn.getLag();
    this.pPing.SetText$pi8$b($.FormatString(S("%d ms"), iPing).getData());
    let szConnType = null;
    let pNetClient = $.Network.Clients.GetClientByID(this.iClientID);
    if (pNetClient.getDataConn() === pNetClient.getMsgConn()) {
      szConnType = S("Data/Msg");
    } else if (this.iConnID !== 0) {
      szConnType = S("Msg");
    } else {
      szConnType = S("Data");
    }
    this.pDesc.SetText$pi8$b($.FormatString(S("%s: %s (%s l%d)"), szConnType, $.Network.NetIO.getNetIOName(pConn.getNetClass()), pConn.getPeerAddr().ToString().getData(), pConn.getPacketLoss()).getData());
  }

  GetConnection$v() {
    let pNetClient = $.Network.Clients.GetClientByID(this.iClientID);
    if (pNetClient == null) {
      return null;
    }
    if (this.iConnID === 0) {
      return pNetClient.getDataConn();
    }
    if (this.iConnID === 1) {
      return pNetClient.getMsgConn();
    }
    return null;
  }

  GetConnectionID() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4Network2ClientListBox$ConnectionListItem && C4Network2ClientListBox$ConnectionListItem.prototype instanceof $c) return $c.prototype.GetConnectionID.apply(this, arguments); }
    return this.iConnID;
  }

  OnButtonDisconnect(_pButton) {
    let pConn = this.GetConnection$v();
    if (pConn != null) {
      pConn.Close();
    }
  }

  $clone() { return new C4Network2ClientListBox$ConnectionListItem().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.iConnID = o.iConnID;
    this.pDesc = o.pDesc;
    this.pPing = o.pPing;
    this.pDisconnectBtn = o.pDisconnectBtn;
    return this;
  }
}

export class C4Network2ClientListDlg extends Dialog {
  static pInstance;
  pGameOptions = null;
  pStatusLabel = null;
  pListBox = null;
  tLastTimer = new $.C4TimeMilliseconds();
  iDelay = 0;
  scheduler = null;

  GetID$v() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4Network2ClientListDlg && C4Network2ClientListDlg.prototype instanceof $c) return $c.prototype.GetID$v.apply(this, arguments); }
    return S("ClientListDialog");
  }

  init() {
    super.init(Math.imul($.pGUI.GetPreferredDlgRect().Wdt, 3) / 4 | 0, Math.imul($.pGUI.GetPreferredDlgRect().Hgt, 3) / 4 | 0, $.LoadResStr(S("IDS_NET_CAPTION")), false);
    $.C4ApplicationSec1Timer.prototype.init.call(this);
    this.$dyn = C4Network2ClientListDlg;
    let pUseFont = $.GraphicsResource.TextFont;
    let caAll = new $.ComponentAligner().init(this.GetContainedClientRect(), 0, 0);
    let rcStatus = caAll.GetFromBottom$i32$i32(pUseFont.GetLineHeight()).$clone();
    this.pGameOptions = new $.C4GameOptionsList().init(caAll.GetFromTop$i32$i32(caAll.GetInnerHeight() / 2 | 0), true, 3 /*GOLS_Runtime*/);
    this.pGameOptions.SetDecoration$b$pScrollBarFacets$b$b(false, null, true, false);
    this.pGameOptions.SetSelectionDiabled();
    let iFreedHeight = this.pGameOptions.ContractToElementHeight();
    caAll.ExpandTop(iFreedHeight);
    $.Container.prototype.AddElement$pElement.call(this, this.pGameOptions);
    $.Container.prototype.AddElement$pElement.call(this, this.pListBox = new C4Network2ClientListBox().init(caAll.GetAll$v(), false));
    $.Container.prototype.AddElement$pElement.call(this, this.pStatusLabel = new $.Label().init$pi8$C4Rect$i32$u32$pCStdFont$b$b$b(S(""), rcStatus));
    $.StdScheduler.prototype.Add$pStdSchedulerProc.call($.Application, this);
    C4Network2ClientListDlg.prototype.Update$v.call(this);
    return this;
  }

  $dtor() {
    if (this === C4Network2ClientListDlg.pInstance) {
      C4Network2ClientListDlg.pInstance = null;
    }
    $.StdScheduler.prototype.Remove.call($.Application, this);
    super.$dtor();
  }

  OnSec1Timer() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4Network2ClientListDlg && C4Network2ClientListDlg.prototype instanceof $c) return $c.prototype.OnSec1Timer.apply(this, arguments); }
    this.Update$v();
  }

  Update$v() {
    let sStatusText = new $.StdStrBuf();
    sStatusText.Format(S("Tick %d, Behind %d, Rate %d, PreSend %d, ACT: %d"), $.Control$2.ControlTick, $.Control$2.Network.GetBehind($.Control$2.ControlTick), $.Control$2.ControlRate, $.Control$2.Network.getControlPreSend(), $.Control$2.Network.getAvgControlSendTime());
    this.pStatusLabel.SetText$pi8$b(sStatusText.getData());
  }

  OnSound(singer) {
    if (singer != null) {
      this.pListBox.SetClientSoundIcon(singer.getID());
    }
  }

  static Toggle() {
    if (C4Network2ClientListDlg.pInstance != null) {
      C4Network2ClientListDlg.pInstance.Close$b(true);
      return true;
    }
    return $.pGUI.ShowRemoveDlg(C4Network2ClientListDlg.pInstance = new C4Network2ClientListDlg().init());
  }

  static GetInstance() {
    return C4Network2ClientListDlg.pInstance;
  }

  $clone() { return new C4Network2ClientListDlg().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pGameOptions = o.pGameOptions;
    this.pStatusLabel = o.pStatusLabel;
    this.pListBox = o.pListBox;
    this.tLastTimer.$assign(o.tLastTimer);
    this.iDelay = o.iDelay;
    this.scheduler = o.scheduler;
    return this;
  }
}

export class C4Network2StartWaitDlg extends Dialog {
  pClientListBox = null;

  GetID$v() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4Network2StartWaitDlg && C4Network2StartWaitDlg.prototype instanceof $c) return $c.prototype.GetID$v.apply(this, arguments); }
    return S("NetStartWaitDialog");
  }

  init() {
    super.init(250, 300, $.LoadResStr(S("IDS_NET_CAPTION")), false);
    this.pClientListBox = null;
    this.$dyn = C4Network2StartWaitDlg;
    let caAll = new $.ComponentAligner().init(this.GetContainedClientRect(), 10, 10);
    let caButtonArea = new $.ComponentAligner().init(caAll.GetFromBottom$i32$i32(40), 0, 0);
    let pLbl = null;
    $.Container.prototype.AddElement$pElement.call(this, pLbl = new $.Label().init$pi8$C4Rect$i32$u32$pCStdFont$b$b$b($.LoadResStr(S("IDS_NET_WAITFORSTART")), caAll.GetFromTop$i32$i32(25), 1));
    $.Container.prototype.AddElement$pElement.call(this, this.pClientListBox = new C4Network2ClientListBox().init(caAll.GetAll$v(), true));
    let pBtnAbort = new $.CancelButton().init(caButtonArea.GetCentered$i32$i32(140, 32));
    $.Container.prototype.AddElement$pElement.call(this, pBtnAbort);
    return this;
  }

  $dtor() {
    super.$dtor();
  }

  $clone() { return new C4Network2StartWaitDlg().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pClientListBox = o.pClientListBox;
    return this;
  }
}

export class C4ChartDialog extends Dialog {
  static pChartDlg;
  pChartTabular = null;

  AddChart(rszName) {
    if ($.Game.pNetworkStatistics == null || this.pChartTabular == null) {
      return;
    }
    const fOwnGraph = [false];
    let pGraph = $.Game.pNetworkStatistics.GetGraphByName(rszName, P(fOwnGraph, 0));
    if (pGraph == null) {
      return;
    }
    let pSheet = this.pChartTabular.AddSheet(rszName.getData());
    if (pSheet == null) {
      if (fOwnGraph[0]) {
        $delete(pGraph);
      }
      return;
    }
    let pNewChart = new C4Chart().init(pSheet.GetClientRect());
    pNewChart.SetGraph(pGraph, fOwnGraph[0]);
    $.Container.prototype.AddElement$pElement.call(pSheet, pNewChart);
  }

  GetID$v() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4ChartDialog && C4ChartDialog.prototype instanceof $c) return $c.prototype.GetID$v.apply(this, arguments); }
    return S("ChartDialog");
  }

  init() {
    super.init(400, 300, $.LoadResStr(S("IDS_NET_STATISTICS")), false);
    this.pChartTabular = null;
    this.$dyn = C4ChartDialog;
    C4ChartDialog.pChartDlg = this;
    let caAll = new $.ComponentAligner().init(this.GetContainedClientRect(), 5, 5);
    this.pChartTabular = new $.Tabular().init(caAll.GetAll$v(), 1 /*tbTop*/);
    $.Container.prototype.AddElement$pElement.call(this, this.pChartTabular);
    C4ChartDialog.prototype.AddChart.call(this, new $.StdStrBuf().init$pi8$b(S("oc")));
    C4ChartDialog.prototype.AddChart.call(this, new $.StdStrBuf().init$pi8$b(S("FPS")));
    C4ChartDialog.prototype.AddChart.call(this, new $.StdStrBuf().init$pi8$b(S("NetIO")));
    if ($.Network.isEnabled()) {
      C4ChartDialog.prototype.AddChart.call(this, new $.StdStrBuf().init$pi8$b(S("Pings")));
    }
    C4ChartDialog.prototype.AddChart.call(this, new $.StdStrBuf().init$pi8$b(S("Control")));
    C4ChartDialog.prototype.AddChart.call(this, new $.StdStrBuf().init$pi8$b(S("APM")));
    return this;
  }

  $dtor() {
    if (C4ChartDialog.pChartDlg === this) {
      C4ChartDialog.pChartDlg = null;
    }
    super.$dtor();
  }

  static Toggle() {
    if (C4ChartDialog.pChartDlg != null) {
      C4ChartDialog.pChartDlg.Close$b(false);
      return;
    }
    let pDlg = new C4ChartDialog().init();
    if (!$.pGUI.ShowRemoveDlg(pDlg)) {
      if (C4ChartDialog.pChartDlg != null) {
        $delete(C4ChartDialog.pChartDlg);
      }
    }
  }

  $clone() { return new C4ChartDialog().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pChartTabular = o.pChartTabular;
    return this;
  }
}

export class C4Network2ClientDlg extends InfoDialog {
  iClientID = 0;

  UpdateText() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4Network2ClientDlg && C4Network2ClientDlg.prototype instanceof $c) return $c.prototype.UpdateText.apply(this, arguments); }
    this.BeginUpdateText();
    let pClient = $.Game.Clients.getClientByID(this.iClientID);
    if (pClient == null) {
      this.AddLineFmt($.LoadResStr(S("IDS_NET_CLIENT_INFO_UNKNOWNID")), this.iClientID);
    } else {
      let pNetClient = pClient.getNetClient();
      let strInfo = new $.StdCopyStrBuf();
      if (!pClient.isActivated()) {
        strInfo.Append$pi8($.LoadResStr(S("IDS_MSG_INACTIVE")));
        strInfo.Append$pi8(S(" "));
      }
      if (pClient.isLocal()) {
        strInfo.Append$pi8($.LoadResStr(S("IDS_MSG_LOCAL")));
        strInfo.Append$pi8(S(" "));
      }
      strInfo.AppendFormat(S("%s %s (ID #%d)%s"), $.LoadResStr(pClient.isHost() ? S("IDS_MSG_HOST") : S("IDS_MSG_CLIENT")), pClient.getName(), this.iClientID, $.Network.isHost() && pNetClient != null && !pNetClient.isReady() ? S(" (!ack)") : S(""));
      this.AddLine$pi8(strInfo.getData());
      let iCnt = 0;
      if ((iCnt = pNetClient.getAddrCnt()) !== 0) {
        this.AddLine$pi8($.LoadResStr(S("IDS_NET_CLIENT_INFO_ADDRESSES")));
        for (let i = 0; i < iCnt; i = i + 1 | 0) {
          let addr = new $.C4Network2Address().$copy(pNetClient.getAddr(i));
          this.AddLineFmt(S("  %d: %s"), i, addr.toString().getData());
        }
      } else {
        this.AddLine$pi8($.LoadResStr(S("IDS_NET_CLIENT_INFO_NOADDRESSES")));
      }
      if (pNetClient != null) {
        if (pNetClient.isConnected()) {
          this.AddLineFmt($.LoadResStr(S("IDS_NET_CLIENT_INFO_CONNECTIONS")), pNetClient.getMsgConn() === pNetClient.getDataConn() ? S("Msg/Data") : S("Msg"), $.Network.NetIO.getNetIOName(pNetClient.getMsgConn().getNetClass()), pNetClient.getMsgConn().getPeerAddr().ToString().getData(), pNetClient.getMsgConn().getPingTime());
          if (pNetClient.getMsgConn() !== pNetClient.getDataConn()) {
            this.AddLineFmt($.LoadResStr(S("IDS_NET_CLIENT_INFO_CONNDATA")), $.Network.NetIO.getNetIOName(pNetClient.getDataConn().getNetClass()), pNetClient.getDataConn().getPeerAddr().ToString().getData(), pNetClient.getDataConn().getPingTime());
          }
        } else {
          this.AddLine$pi8($.LoadResStr(S("IDS_NET_CLIENT_INFO_NOCONNECTIONS")));
        }
      }
    }
    this.EndUpdateText();
  }

  GetUpdateInterval() {
    return 500;
  }

  GetID$v() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4Network2ClientDlg && C4Network2ClientDlg.prototype instanceof $c) return $c.prototype.GetID$v.apply(this, arguments); }
    return S("ClientDialog");
  }

  init(iForClientID) {
    super.init$pi8$i32($.LoadResStr(S("IDS_NET_CLIENT_INFO")), 10);
    this.iClientID = iForClientID;
    this.$dyn = C4Network2ClientDlg;
    C4Network2ClientDlg.prototype.UpdateText.call(this);
    return this;
  }

  $clone() { return new C4Network2ClientDlg().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.iClientID = o.iClientID;
    return this;
  }
}

export class C4Network2ResDlg extends ListBox {
  tLastTimer = new $.C4TimeMilliseconds();
  iDelay = 0;
  scheduler = null;

  $dtor() {
    C4Network2ResDlg.prototype.Deactivate.call(this);
    super.$dtor();
  }

  Deactivate(..._) { return $missing("C4Network2ResDlg::Deactivate"); }

  OnSec1Timer() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4Network2ResDlg && C4Network2ResDlg.prototype instanceof $c) return $c.prototype.OnSec1Timer.apply(this, arguments); }
    this.Update$v();
  }

  Update$v(..._) { return $missing("C4Network2ResDlg::Update"); }

  $clone() { return new C4Network2ResDlg().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.tLastTimer.$assign(o.tLastTimer);
    this.iDelay = o.iDelay;
    this.scheduler = o.scheduler;
    return this;
  }
}

export class C4Network2ClientListBox extends ListBox {
  fStartup = false;
  tLastTimer = new $.C4TimeMilliseconds();
  iDelay = 0;
  scheduler = null;

  GetClientListItem(client_id) {
    for (let list_item = this.GetFirst(); list_item != null; list_item = $.Element.prototype.GetNext$v$c.call(list_item)) {
      let list_item2 = list_item;
      if (list_item2.GetClientID() === client_id) {
        if (list_item2.GetConnectionID() === -1) {
          return list_item2;
        }
      }
    }
    return null;
  }

  init(rcBounds, fStartup) {
    super.init(rcBounds);
    $.C4ApplicationSec1Timer.prototype.init.call(this);
    this.fStartup = fStartup;
    this.$dyn = C4Network2ClientListBox;
    $.StdScheduler.prototype.Add$pStdSchedulerProc.call($.Application, this);
    C4Network2ClientListBox.prototype.Update$v.call(this);
    return this;
  }

  $dtor() {
    $.StdScheduler.prototype.Remove.call($.Application, this);
    super.$dtor();
  }

  OnSec1Timer() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4Network2ClientListBox && C4Network2ClientListBox.prototype instanceof $c) return $c.prototype.OnSec1Timer.apply(this, arguments); }
    this.Update$v();
  }

  Update$v() {
    let pItem = $.Container.prototype.GetFirst.call(this.pClientWindow);
    let pNext = null;
    let pClient = null;
    while ((pClient = $.Game.Clients.getClient(pClient)) != null) {
      if (this.IsStartup() && pClient.isHost()) {
        continue;
      }
      while (pItem != null && pItem.GetClientID() < pClient.getID()) {
        pNext = $.Element.prototype.GetNext$v$c.call(pItem);
        $delete(pItem);
        pItem = pNext;
      }
      if (pItem != null && pItem.GetClientID() === pClient.getID()) {
        pItem.Update$v();
        pItem = $.Element.prototype.GetNext$v$c.call(pItem);
      } else {
        this.InsertElement$pElement$pElement$i32(new C4Network2ClientListBox$ClientListItem().init(this, pClient.getID()), pItem);
      }
      if (this.IsStartup()) {
        continue;
      }
      let pNetClient = pClient.getNetClient();
      if (pNetClient == null) {
        continue;
      }
      let pLastConn = null;
      for (let i = 0; i < 2; i = i + 1 | 0) {
        let pConn = i !== 0 ? pNetClient.getMsgConn() : pNetClient.getDataConn();
        if (pConn == null) {
          continue;
        }
        if (pConn === pLastConn) {
          continue;
        }
        pLastConn = pConn;
        while (pItem != null && (pItem.GetClientID() < pClient.getID() || pItem.GetClientID() === pClient.getID() && pItem.GetConnectionID() < i)) {
          pNext = $.Element.prototype.GetNext$v$c.call(pItem);
          $delete(pItem);
          pItem = pNext;
        }
        if (pItem != null && pItem.GetClientID() === pClient.getID() && pItem.GetConnectionID() === i) {
          pItem.Update$v();
          pItem = $.Element.prototype.GetNext$v$c.call(pItem);
        } else {
          this.InsertElement$pElement$pElement$i32(new C4Network2ClientListBox$ConnectionListItem().init(this, pClient.getID(), i), pItem);
        }
      }
    }
    while (pItem != null) {
      pNext = $.Element.prototype.GetNext$v$c.call(pItem);
      $delete(pItem);
      pItem = pNext;
    }
  }

  IsStartup() {
    return this.fStartup;
  }

  SetClientSoundIcon(client_id) {
    let item = this.GetClientListItem(client_id);
    if (item != null) {
      item.SetSoundIcon();
    }
  }

  $clone() { return new C4Network2ClientListBox().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.fStartup = o.fStartup;
    this.tLastTimer.$assign(o.tLastTimer);
    this.iDelay = o.iDelay;
    this.scheduler = o.scheduler;
    return this;
  }
}

export function GetValueDecade(iVal) {
  let iDec = 1;
  while (iVal !== 0) {
    iVal = iVal / 10 | 0;
    iDec = Math.imul(iDec, 10);
  }
  return iDec;
}

export function GetAxisStepRange(iRange, iMaxSteps) {
  let iDec = GetValueDecade(iRange);
  if (iDec === 1) {
    return 1;
  }
  let iNextStepDivider = 2;
  while (iDec >= iNextStepDivider && (Math.imul(iNextStepDivider, iRange) / iDec | 0) <= iMaxSteps) {
    iDec = iDec / iNextStepDivider | 0;
    iNextStepDivider = 7 - iNextStepDivider | 0;
  }
  return iDec;
}

export function $init(): void {
  C4ChartDialog.pChartDlg = null;
  $mixin(C4Network2ClientListBox, $.C4ApplicationSec1Timer);
  C4Network2ClientListDlg.pInstance = null;
  $mixin(C4Network2ClientListDlg, $.C4ApplicationSec1Timer);
  $mixin(C4Network2ResDlg, $.C4ApplicationSec1Timer);
}

Object.assign($, { C4Chart, C4ChartDialog, C4GameOptionButtons, C4Network2ClientDlg, C4Network2ClientListBox, C4Network2ClientListBox$ClientListItem, C4Network2ClientListBox$ConnectionListItem, C4Network2ClientListBox$ListItem, C4Network2ClientListDlg, C4Network2ResDlg, C4Network2StartWaitDlg, GetAxisStepRange, GetValueDecade });
