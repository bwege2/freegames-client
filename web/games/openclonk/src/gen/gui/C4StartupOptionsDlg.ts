// @ts-nocheck
// OpenClonk 36de799: src/gui/C4StartupOptionsDlg.cpp, src/gui/C4StartupOptionsDlg.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { Button, CheckBox, Dialog, Label, LabeledEdit, ListBox, MessageDialog, Window } from './C4Gui.ts';
import { C4StartupDlg } from './C4Startup.ts';
import { $co, $spawn } from '../../rt/coro.ts';
import { $u64n, ftoi32 } from '../../rt/int.ts';
import { c$atoi, c$strlen } from '../../rt/libc.ts';
import { $padd, $rd, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $begin, $delete, $dyncast, $end, $max, $min, $mixin, $vpush, std_sort, std_stable_sort } from '../../rt/std.ts';

export class C4StartupOptionsDlg$ControlConfigListBox$ControlAssignmentLabel extends Label {
  assignment = null;
  assignment_set = null;

  UpdateAssignmentString() {
    let strKey = new $.StdStrBuf();
    let key = new $.C4KeyCodeEx().init(0);
    if (this.assignment != null) {
      this.SetText$pi8$b(this.assignment.GetKeysAsString(true, false).getData());
    } else {
      this.SetText$pi8$b(S(""));
    }
    let color = 0xffffffff;
    if (this.assignment != null) {
      if (this.assignment.IsGUIDisabled()) {
        color = 0xffafafaf;
      } else if (this.assignment.IsKeyChanged()) {
        color = 0xffffff00;
      }
    }
    this.SetColor$u32$b(color);
  }

  *MouseInput$rCMouse$i32$i32$i32$u32(rMouse, iButton, iX, iY, dwKeyParam) {
    if (iButton === 1 && this.assignment != null) {
      if (!this.assignment.IsGUIDisabled()) {
        let dlg = new C4StartupOptionsDlg$KeySelDialog().init(this.assignment, this.assignment_set);
        dlg.SetDelOnClose(false);
        let success = (yield* this.GetScreen().ShowModalDlg(dlg, false));
        let key = dlg.GetKeyCode();
        $delete(dlg);
        if (success) {
          C4StartupOptionsDlg$ControlConfigListBox.SetUserKey(this.assignment_set, this.assignment, key);
          this.UpdateAssignmentString();
        }
      }
    }
    (yield* $co($.Element.prototype.MouseInput$rCMouse$i32$i32$i32$u32.call(this, rMouse, iButton, iX, iY, dwKeyParam)));
  }

  init(assignment, assignment_set, bounds) {
    super.init$pi8$C4Rect$i32$u32$pCStdFont$b$b$b(S(""), bounds, 0, 0xffffffff, null, false, false, true);
    this.assignment = assignment;
    this.assignment_set = assignment_set;
    this.$dyn = C4StartupOptionsDlg$ControlConfigListBox$ControlAssignmentLabel;
    C4StartupOptionsDlg$ControlConfigListBox$ControlAssignmentLabel.prototype.UpdateAssignmentString.call(this);
    return this;
  }

  $clone() { return new C4StartupOptionsDlg$ControlConfigListBox$ControlAssignmentLabel().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.assignment = o.assignment;
    this.assignment_set = o.assignment_set;
    return this;
  }
}

export class C4StartupOptionsDlg$ControlConfigListBox$ListItem extends Window {
  assignment_label = null;
  has_extra_spacing = false;

  GetListItemTopSpacing() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4StartupOptionsDlg$ControlConfigListBox$ListItem && C4StartupOptionsDlg$ControlConfigListBox$ListItem.prototype instanceof $c) return $c.prototype.GetListItemTopSpacing.apply(this, arguments); }
    return $.Element.prototype.GetListItemTopSpacing.call(this) + (Math.imul(this.has_extra_spacing ? 1 : 0, this.GetBounds().Hgt) / 2 | 0) | 0;
  }

  init(parent_list, assignment, assignment_set, has_extra_spacing) {
    super.init();
    this.assignment_label = null;
    this.has_extra_spacing = has_extra_spacing;
    this.$dyn = C4StartupOptionsDlg$ControlConfigListBox$ListItem;
    let margin = 2;
    let height = $.GraphicsResource.TextFont.GetLineHeight() + Math.imul(2, margin) | 0;
    this.SetBounds(new $.C4Rect().init$i32$i32$i32$i32(0, 0, 42, height));
    parent_list.InsertElement$pElement$pElement$i32(this, null);
    let name_col_width = Math.imul(this.GetBounds().Wdt, 2) / 3 | 0;
    let gui_name = assignment.GetGUIName($.Game.PlayerControlDefs);
    let gui_desc = assignment.GetGUIDesc($.Game.PlayerControlDefs);
    let name_label = new $.Label().init$pi8$i32$i32$i32$u32$pCStdFont$b$b(gui_name != null ? gui_name : S("?undefined?"), margin, margin);
    let assignment_label_bounds = new $.C4Rect().init$i32$i32$i32$i32(name_col_width + margin | 0, margin, (this.GetBounds().Wdt - name_col_width | 0) - margin | 0, this.GetBounds().Hgt - Math.imul(2, margin) | 0);
    this.assignment_label = new C4StartupOptionsDlg$ControlConfigListBox$ControlAssignmentLabel().init(assignment, assignment_set, assignment_label_bounds);
    $.Container.prototype.AddElement$pElement.call(this, name_label);
    $.Container.prototype.AddElement$pElement.call(this, this.assignment_label);
    if (gui_desc != null && gui_desc.a[gui_desc.o] !== 0) {
      this.SetToolTip(gui_desc);
    }
    return this;
  }

  $clone() { return new C4StartupOptionsDlg$ControlConfigListBox$ListItem().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.assignment_label = o.assignment_label;
    this.has_extra_spacing = o.has_extra_spacing;
    return this;
  }
}

export class C4StartupOptionsDlg$ControlConfigArea extends Window {
  fGamepad = false;
  iMaxControlSets = 0;
  iSelectedCtrlSet = 0;
  ppKeyControlSetBtns = null;
  KeyControlBtns = new Array(12).fill(null);
  pOptionsDlg = null;
  control_list = null;
  pGUICtrl = null;

  init(rcArea, iHMargin, iVMargin, fGamepad, pOptionsDlg) {
    super.init();
    this.fGamepad = fGamepad;
    this.pOptionsDlg = pOptionsDlg;
    this.pGUICtrl = null;
    this.$dyn = C4StartupOptionsDlg$ControlConfigArea;
    let pUseFontSmall = $.C4Startup.Get().Graphics.BookSmallFont;
    this.SetBounds(rcArea);
    let caArea = new $.ComponentAligner().init(rcArea, iHMargin, iVMargin, true);
    const assignment_sets = $.Game.PlayerControlUserAssignmentSets;
    this.iMaxControlSets = $max(assignment_sets.GetSetCount(), 1) | 0;
    this.ppKeyControlSetBtns = P(new Array($u64n(this.iMaxControlSets)).fill(null), 0);
    let fctCtrlDefPic = $.GraphicsResource.fctKeyboard.$clone();
    let iCtrlSetWdt = caArea.GetWidth() - Math.imul(caArea.GetHMargin(), 2) | 0;
    let iCtrlSetHMargin = 5;
    let iCtrlSetVMargin = 5;
    let iCtrlSetBtnWdt = $.Clamp$i32$i32$i32((iCtrlSetWdt - Math.imul(Math.imul(this.iMaxControlSets, iCtrlSetHMargin), 2) | 0) / this.iMaxControlSets | 0, 5, ftoi32(fctCtrlDefPic.Wdt));
    let iCtrlSetBtnHgt = fctCtrlDefPic.GetHeightByWidth(iCtrlSetBtnWdt);
    iCtrlSetHMargin = (iCtrlSetWdt - Math.imul(iCtrlSetBtnWdt, this.iMaxControlSets) | 0) / Math.imul(this.iMaxControlSets, 2) | 0;
    let caKeyboardSetSel = new $.ComponentAligner().init(caArea.GetFromTop$i32$i32(Math.imul(2, iCtrlSetVMargin) + iCtrlSetBtnHgt | 0), iCtrlSetHMargin, iCtrlSetVMargin);
    let szCtrlSetHotkeys = S("1234567890");
    let i = 0;
    for (i = 0; i < assignment_sets.GetSetCount(); i = i + 1 >>> 0) {
      let assignment_set = assignment_sets.GetSetByIndex(i | 0);
      let cCtrlSetHotkey = 0;
      if (i <= c$strlen(szCtrlSetHotkeys)) {
        cCtrlSetHotkey = szCtrlSetHotkeys.a[szCtrlSetHotkeys.o + i];
      }
      let pBtn = new $.CallbackButton$ControlConfigArea$IconButton().init$i32$C4Rect$i8$x$pControlConfigArea(-1 /*Ico_None*/, caKeyboardSetSel.GetFromLeft$i32$i32(iCtrlSetBtnWdt), cCtrlSetHotkey, "OnCtrlSetBtn", this);
      let fctCtrlPic = assignment_set.GetPicture();
      pBtn.SetFacet$C4Facet$u32(fctCtrlPic);
      $.Container.prototype.AddElement$pElement.call(this, this.ppKeyControlSetBtns.a[this.ppKeyControlSetBtns.o + i] = pBtn);
      pBtn.SetText$pi8(assignment_set.GetGUIName());
      pBtn.SetFont$pCStdFont$u32(pUseFontSmall, 0xff000000);
      pBtn.SetToolTip($.LoadResStr(S("IDS_DLGTIP_CHANGECTRL")));
    }
    this.iSelectedCtrlSet = 0;
    caArea.ExpandTop(caArea.GetVMargin());
    $.Container.prototype.AddElement$pElement.call(this, new $.HorizontalLine().init(caArea.GetFromTop$i32$i32(2)));
    caArea.ExpandTop(caArea.GetVMargin());
    this.control_list = new C4StartupOptionsDlg$ControlConfigListBox().init(caArea.GetFromLeft$i32$i32(caArea.GetInnerWidth()), null);
    $.Container.prototype.AddElement$pElement.call(this, this.control_list);
    C4StartupOptionsDlg$ControlConfigArea.prototype.UpdateCtrlSet.call(this);
    return this;
  }

  $dtor() {
    $delete(this.ppKeyControlSetBtns);
    super.$dtor();
  }

  UpdateCtrlSet() {
    let i = 0;
    for (i = 0; i < this.iMaxControlSets; i = i + 1 | 0) {
      this.ppKeyControlSetBtns.a[this.ppKeyControlSetBtns.o + i].SetHighlight(i === this.iSelectedCtrlSet);
    }
    this.control_list.SetAssignmentSet($.Game.PlayerControlUserAssignmentSets.GetSetByIndex(this.iSelectedCtrlSet));
  }

  OnCtrlSetBtn(btn) {
    let i = 0;
    for (i = 0; i < this.iMaxControlSets; i = i + 1 | 0) {
      if (btn === this.ppKeyControlSetBtns.a[this.ppKeyControlSetBtns.o + i]) {
        this.iSelectedCtrlSet = i;
        break;
      }
    }
    this.UpdateCtrlSet();
  }

  $clone() { return new C4StartupOptionsDlg$ControlConfigArea().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.fGamepad = o.fGamepad;
    this.iMaxControlSets = o.iMaxControlSets;
    this.iSelectedCtrlSet = o.iSelectedCtrlSet;
    this.ppKeyControlSetBtns = o.ppKeyControlSetBtns;
    this.KeyControlBtns = o.KeyControlBtns.slice();
    this.pOptionsDlg = o.pOptionsDlg;
    this.control_list = o.control_list;
    this.pGUICtrl = o.pGUICtrl;
    return this;
  }
}

export class C4StartupOptionsDlg$NetworkPortConfig extends Window {
  pConfigValue = null;
  pEnableCheck = null;
  pPortEdit = null;

  init(rcBounds, szName, pConfigValue, iDefault) {
    super.init();
    this.pConfigValue = pConfigValue;
    this.$dyn = C4StartupOptionsDlg$NetworkPortConfig;
    let pUseFont = $.C4Startup.Get().Graphics.BookFont;
    this.SetBounds(rcBounds);
    let caMain = new $.ComponentAligner().init(this.GetClientRect(), 0, 2, true);
    let fEnabled = pConfigValue.a[pConfigValue.o] !== -1;
    let pLbl = new $.Label().init$pi8$C4Rect$i32$u32$pCStdFont$b$b$b(szName, caMain.GetFromTop$i32$i32(pUseFont.GetLineHeight()), 0, 0xff000000, pUseFont, false);
    $.Container.prototype.AddElement$pElement.call(this, pLbl);
    let caBottomLine = new $.ComponentAligner().init(caMain.GetAll$v(), 2, 0, false);
    let szText = $.LoadResStr(S("IDS_CTL_ACTIVE"));
    const iWdt = [100];
    const iHgt = [12];
    $.CheckBox.GetStandardCheckBoxSize(P(iWdt, 0), P(iHgt, 0), szText, pUseFont);
    this.pEnableCheck = new $.CheckBox().init(caBottomLine.GetFromLeft$i32$i32(iWdt[0], iHgt[0]), szText, fEnabled);
    this.pEnableCheck.SetFont$pCStdFont$u32$u32(pUseFont, 0xff000000, 0xff7f7f7f);
    this.pEnableCheck.SetOnChecked(new $.CallbackHandler$NetworkPortConfig().init(this, "OnEnabledCheckChange"));
    $.Container.prototype.AddElement$pElement.call(this, this.pEnableCheck);
    this.pPortEdit = new $.Edit().init(caBottomLine.GetAll$v(), true);
    this.pPortEdit.SetColors(0, 0xff000000, 0xffa4947a);
    this.pPortEdit.SetFont$pCStdFont(pUseFont);
    this.pPortEdit.InsertText($.FormatString(S("%d"), fEnabled ? pConfigValue.a[pConfigValue.o] : iDefault).getData(), false);
    this.pPortEdit.SetMaxText(10);
    this.pPortEdit.SetVisibility(fEnabled);
    $.Container.prototype.AddElement$pElement.call(this, this.pPortEdit);
    return this;
  }

  OnEnabledCheckChange(_pCheckBox) {
    this.pPortEdit.SetVisibility(this.pEnableCheck.GetChecked());
  }

  SavePort() {
    this.pConfigValue.a[this.pConfigValue.o] = this.GetPort();
  }

  GetPort() {
    if (!this.pEnableCheck.GetChecked()) {
      return -1;
    } else {
      return c$atoi(this.pPortEdit.GetText$v());
    }
  }

  static GetControlSize$pi32$pi32(piWdt, piHgt) {
    let pUseFont = $.C4Startup.Get().Graphics.BookFont;
    if (piWdt != null) {
      let szText = $.LoadResStr(S("IDS_CTL_ACTIVE"));
      if (!$.CheckBox.GetStandardCheckBoxSize(piWdt, piHgt, szText, pUseFont)) {
        return false;
      }
      piWdt.a[piWdt.o] = Math.imul(piWdt.a[piWdt.o], 2);
    }
    if (piHgt != null) {
      piHgt.a[piHgt.o] = ($.Edit.GetCustomEditHeight(pUseFont) + pUseFont.GetLineHeight() | 0) + 8 | 0;
    }
    return true;
  }

  $clone() { return new C4StartupOptionsDlg$NetworkPortConfig().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pConfigValue = o.pConfigValue;
    this.pEnableCheck = o.pEnableCheck;
    this.pPortEdit = o.pPortEdit;
    return this;
  }
}

export class C4StartupOptionsDlg$NetworkServerAddressConfig extends Window {
  piConfigEnableValue = null;
  szConfigAddressValue = null;
  pEnableCheck = null;
  pAddressEdit = null;

  init(rcBounds, szName, piConfigEnableValue, szConfigAddressValue, iTabWidth) {
    super.init();
    this.piConfigEnableValue = piConfigEnableValue;
    this.szConfigAddressValue = szConfigAddressValue;
    this.$dyn = C4StartupOptionsDlg$NetworkServerAddressConfig;
    let pUseFont = $.C4Startup.Get().Graphics.BookFont;
    this.SetBounds(rcBounds);
    let caMain = new $.ComponentAligner().init(this.GetClientRect(), 0, 2, true);
    this.pEnableCheck = new $.CheckBox().init(caMain.GetFromLeft$i32$i32(iTabWidth, pUseFont.GetLineHeight()), szName, !(piConfigEnableValue.a[piConfigEnableValue.o] === 0));
    this.pEnableCheck.SetFont$pCStdFont$u32$u32(pUseFont, 0xff000000, 0xff7f7f7f);
    this.pEnableCheck.SetOnChecked(new $.CallbackHandler$NetworkServerAddressConfig().init(this, "OnEnabledCheckChange"));
    $.Container.prototype.AddElement$pElement.call(this, this.pEnableCheck);
    caMain.ExpandLeft(-2);
    this.pAddressEdit = new $.Edit().init(caMain.GetAll$v(), true);
    this.pAddressEdit.SetColors(0, 0xff000000, 0xffa4947a);
    this.pAddressEdit.SetFont$pCStdFont(pUseFont);
    this.pAddressEdit.InsertText(szConfigAddressValue, false);
    this.pAddressEdit.SetMaxText(1024);
    this.pAddressEdit.SetVisibility(!(piConfigEnableValue.a[piConfigEnableValue.o] === 0));
    $.Container.prototype.AddElement$pElement.call(this, this.pAddressEdit);
    return this;
  }

  $dtor() {
    super.$dtor();
  }

  OnEnabledCheckChange(_pCheckBox) {
    if (this.pEnableCheck.GetChecked()) {
      this.GetScreen().ShowMessage($.LoadResStr(S("IDS_NET_NOOFFICIALLEAGUE")), $.LoadResStr(S("IDS_NET_QUERY_MASTERSRV")), 1 /*Ico_Notify*/, P($.Config.Startup, "HideMsgNoOfficialLeague"));
    }
    this.pAddressEdit.SetVisibility(this.pEnableCheck.GetChecked());
  }

  Save2Config() {
    this.piConfigEnableValue.a[this.piConfigEnableValue.o] = this.pEnableCheck.GetChecked() ? 1 : 0;
    $.SCopy$pi8$pi8$u64(this.pAddressEdit.GetText$v(), this.szConfigAddressValue, 1024);
  }

  static GetControlSize$pi32$pi32$pi32$pi8(piWdt, piHgt, piTabPos, szForText) {
    let pUseFont = $.C4Startup.Get().Graphics.BookFont;
    const iWdt = [120];
    $.CheckBox.GetStandardCheckBoxSize(P(iWdt, 0), piHgt, szForText, pUseFont);
    const iEdtWdt = [120];
    const iEdtHgt = [24];
    pUseFont.GetTextExtent(S("sorgentelefon@treffpunktclonk.net"), P(iEdtWdt, 0), P(iEdtHgt, 0), false);
    if (piWdt != null) {
      piWdt.a[piWdt.o] = (iWdt[0] + iEdtWdt[0] | 0) + 2 | 0;
    }
    if (piTabPos != null) {
      piTabPos.a[piTabPos.o] = iWdt[0] + 2 | 0;
    }
    if (piHgt != null) {
      piHgt.a[piHgt.o] = $.Edit.GetCustomEditHeight(pUseFont) + 4 | 0;
    }
    return true;
  }

  $clone() { return new C4StartupOptionsDlg$NetworkServerAddressConfig().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.piConfigEnableValue = o.piConfigEnableValue;
    this.szConfigAddressValue = o.szConfigAddressValue;
    this.pEnableCheck = o.pEnableCheck;
    this.pAddressEdit = o.pAddressEdit;
    return this;
  }
}

export class C4StartupOptionsDlg$EditConfig extends LabeledEdit {
  psConfigVal = null;
  piConfigVal = null;

  init(rcBounds, szName, psConfigVal, piConfigVal, fMultiline) {
    super.init(rcBounds, szName, fMultiline, psConfigVal != null ? psConfigVal.getData() : null, $.C4Startup.Get().Graphics.BookFont, 0xff000000);
    this.psConfigVal = psConfigVal;
    this.piConfigVal = piConfigVal;
    this.$dyn = C4StartupOptionsDlg$EditConfig;
    this.GetEdit().SetColors(0, 0xff000000, 0xffa4947a);
    if (piConfigVal != null) {
      C4StartupOptionsDlg$EditConfig.prototype.SetIntVal.call(this, piConfigVal.a[piConfigVal.o]);
    }
    this.GetEdit().SetMaxText(1024);
    return this;
  }

  Save2Config() {
    if (this.psConfigVal != null) {
      this.psConfigVal.CopyValidated$pi8(this.GetEdit().GetText$v());
    }
    if (this.piConfigVal != null) {
      this.piConfigVal.a[this.piConfigVal.o] = this.GetIntVal();
    }
  }

  static GetControlSize$pi32$pi32$pi8$b(piWdt, piHgt, szForText, fMultiline) {
    let pUseFont = $.C4Startup.Get().Graphics.BookFont;
    return $.LabeledEdit.GetControlSize$pi32$pi32$pi8$pCStdFont$b(piWdt, piHgt, szForText, pUseFont, fMultiline);
  }

  GetIntVal() {
    return c$atoi(this.GetEdit().GetText$v());
  }

  SetIntVal(iToVal) {
    this.GetEdit().SetText$pi8$b($.FormatString(S("%d"), iToVal).getData(), false);
  }

  $clone() { return new C4StartupOptionsDlg$EditConfig().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.psConfigVal = o.psConfigVal;
    this.piConfigVal = o.piConfigVal;
    return this;
  }
}

export class C4StartupOptionsDlg$ResChangeConfirmDlg extends Dialog {
  pOperationCancelLabel = null;
  iResChangeSwitchTime = 0;
  tLastTimer = new $.C4TimeMilliseconds();
  iDelay = 0;
  scheduler = null;

  init() {
    super.init(500, 100, $.LoadResStr(S("IDS_MNU_SWITCHRESOLUTION")), false);
    $.C4ApplicationSec1Timer.prototype.init.call(this);
    this.$dyn = C4StartupOptionsDlg$ResChangeConfirmDlg;
    $.StdScheduler.prototype.Add$pStdSchedulerProc.call($.Application, this);
    this.iResChangeSwitchTime = 12;
    if ($.SEqualNoCase($.Config.GetRegistrationData(S("Nick")), S("flgr"))) {
      this.iResChangeSwitchTime = Math.imul(this.iResChangeSwitchTime, 10);
    }
    let caMain = new $.ComponentAligner().init(this.GetClientRect(), 10, 10, true);
    let rcIcon = caMain.GetFromLeft$i32$i32(40).$clone();
    rcIcon.Hgt = 40;
    let pIcon = new $.Icon().init(rcIcon, 18 /*Ico_Confirm*/);
    $.Container.prototype.AddElement$pElement.call(this, pIcon);
    let sMsgBroken = new $.StdStrBuf();
    let iMsgHeight = $.GraphicsResource.TextFont.BreakMessage$pi8$i32$pStdStrBuf$b$f32($.LoadResStr(S("IDS_MNU_SWITCHRESOLUTION_LIKEIT")), caMain.GetInnerWidth(), sMsgBroken, true);
    let pLblMessage = new $.Label().init$pi8$C4Rect$i32$u32$pCStdFont$b$b$b(sMsgBroken.getData(), caMain.GetFromTop$i32$i32(iMsgHeight), 1, 0xffffffff, $.GraphicsResource.TextFont, false);
    $.Container.prototype.AddElement$pElement.call(this, pLblMessage);
    iMsgHeight = $.GraphicsResource.TextFont.BreakMessage$pi8$i32$pStdStrBuf$b$f32($.FormatString($.LoadResStr(S("IDS_MNU_SWITCHRESOLUTION_UNDO")), this.iResChangeSwitchTime).getData(), caMain.GetInnerWidth(), sMsgBroken, true);
    this.pOperationCancelLabel = new $.Label().init$pi8$C4Rect$i32$u32$pCStdFont$b$b$b(sMsgBroken.getData(), caMain.GetFromTop$i32$i32(iMsgHeight), 1, 0xffffffff, $.GraphicsResource.TextFont, false, false);
    $.Container.prototype.AddElement$pElement.call(this, this.pOperationCancelLabel);
    let caButtonArea = new $.ComponentAligner().init(caMain.GetFromTop$i32$i32(40), 0, 0);
    let iButtonCount = 2;
    let rcBtn = caButtonArea.GetCentered$i32$i32(Math.imul(iButtonCount, 120) + Math.imul(iButtonCount - 1 | 0, 10) | 0, 32).$clone();
    rcBtn.Wdt = 120;
    let pBtnYes = new $.YesButton().init(rcBtn);
    $.Container.prototype.AddElement$pElement.call(this, pBtnYes);
    rcBtn.x = rcBtn.x + 130 | 0;
    let pBtnNo = new $.NoButton().init(rcBtn);
    $.Container.prototype.AddElement$pElement.call(this, pBtnNo);
    this.SetFocus(pBtnNo, false);
    this.SetClientSize(this.GetClientRect().Wdt, this.GetClientRect().Hgt - caMain.GetHeight() | 0);
    return this;
  }

  $dtor() {
    $.StdScheduler.prototype.Remove.call($.Application, this);
    super.$dtor();
  }

  OnSec1Timer() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4StartupOptionsDlg$ResChangeConfirmDlg && C4StartupOptionsDlg$ResChangeConfirmDlg.prototype instanceof $c) return $c.prototype.OnSec1Timer.apply(this, arguments); }
    if (!((this.iResChangeSwitchTime = this.iResChangeSwitchTime - 1 | 0) !== 0)) {
      this.Close$b(false);
      return;
    }
    let sTimerText = new $.StdStrBuf();
    $.GraphicsResource.TextFont.BreakMessage$pi8$i32$pStdStrBuf$b$f32($.FormatString($.LoadResStr(S("IDS_MNU_SWITCHRESOLUTION_UNDO")), this.iResChangeSwitchTime).getData(), this.pOperationCancelLabel.GetBounds().Wdt, sTimerText, true);
    this.pOperationCancelLabel.SetText$pi8$b(sTimerText.getData());
  }

  OnEnter() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4StartupOptionsDlg$ResChangeConfirmDlg && C4StartupOptionsDlg$ResChangeConfirmDlg.prototype instanceof $c) return $c.prototype.OnEnter.apply(this, arguments); }
    return true;
  }

  GetID$v() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4StartupOptionsDlg$ResChangeConfirmDlg && C4StartupOptionsDlg$ResChangeConfirmDlg.prototype instanceof $c) return $c.prototype.GetID$v.apply(this, arguments); }
    return S("ResChangeConfirmDialog");
  }

  $clone() { return new C4StartupOptionsDlg$ResChangeConfirmDlg().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pOperationCancelLabel = o.pOperationCancelLabel;
    this.iResChangeSwitchTime = o.iResChangeSwitchTime;
    this.tLastTimer.$assign(o.tLastTimer);
    this.iDelay = o.iDelay;
    this.scheduler = o.scheduler;
    return this;
  }
}

export class C4StartupOptionsDlg$NetworkModDatabaseServerAddressConfig extends C4StartupOptionsDlg$NetworkServerAddressConfig {

  init(rcBounds, szName, piConfigEnableValue, szConfigAddressValue, iTabWidth) {
    super.init(rcBounds, szName, piConfigEnableValue, szConfigAddressValue, iTabWidth);
    this.$dyn = C4StartupOptionsDlg$NetworkModDatabaseServerAddressConfig;
    return this;
  }

  OnEnabledCheckChange(_pCheckBox) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4StartupOptionsDlg$NetworkModDatabaseServerAddressConfig && C4StartupOptionsDlg$NetworkModDatabaseServerAddressConfig.prototype instanceof $c) return $c.prototype.OnEnabledCheckChange.apply(this, arguments); }
    this.pAddressEdit.SetVisibility(this.pEnableCheck.GetChecked());
  }

  $clone() { return new C4StartupOptionsDlg$NetworkModDatabaseServerAddressConfig().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class C4StartupOptionsDlg$SmallButton extends Button {

  DrawElement(cgo) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4StartupOptionsDlg$SmallButton && C4StartupOptionsDlg$SmallButton.prototype instanceof $c) return $c.prototype.DrawElement.apply(this, arguments); }
    const rUseFont = $.C4Startup.Get().Graphics.BookFont;
    let x0 = Math.fround(cgo.TargetX + Math.fround(this.rcBounds.x));
    let y0 = Math.fround(cgo.TargetY + Math.fround(this.rcBounds.y));
    let x1 = Math.fround(Math.fround(cgo.TargetX + Math.fround(this.rcBounds.x)) + Math.fround(this.rcBounds.Wdt));
    let y1 = Math.fround(Math.fround(cgo.TargetY + Math.fround(this.rcBounds.y)) + Math.fround(this.rcBounds.Hgt));
    let iTextHgt = rUseFont.GetLineHeight();
    let dwClrHigh = 0xffccc3b4;
    let dwClrLow = 0xff94846a;
    if (this.fDown) {
      [dwClrHigh, dwClrLow] = [dwClrLow, dwClrHigh];
    }
    let iIndent = $.Clamp$i32$i32$i32((this.rcBounds.Hgt - iTextHgt | 0) / 3 | 0, 2, 5);
    const iDrawQuadTop = new Float32Array([x0, y0, x1, y0, Math.fround(x1 - Math.fround(iIndent)), Math.fround(y0 + Math.fround(iIndent)), x0, Math.fround(y0 + Math.fround(iIndent))]);
    const iDrawQuadLeft = new Float32Array([x0, y0, Math.fround(x0 + Math.fround(iIndent)), y0, Math.fround(x0 + Math.fround(iIndent)), Math.fround(y1 - Math.fround(iIndent)), x0, y1]);
    const iDrawQuadRight = new Float32Array([x1, y0, x1, y1, Math.fround(x1 - Math.fround(iIndent)), y1, Math.fround(x1 - Math.fround(iIndent)), Math.fround(y0 + Math.fround(iIndent))]);
    const iDrawQuadBottom = new Float32Array([x1, y1, x0, y1, Math.fround(x0 + Math.fround(iIndent)), Math.fround(y1 - Math.fround(iIndent)), x1, Math.fround(y1 - Math.fround(iIndent))]);
    $.pDraw.DrawQuadDw(cgo.Surface, P(iDrawQuadTop, 0), dwClrHigh, dwClrHigh, dwClrHigh, dwClrHigh, null);
    $.pDraw.DrawQuadDw(cgo.Surface, P(iDrawQuadLeft, 0), dwClrHigh, dwClrHigh, dwClrHigh, dwClrHigh, null);
    $.pDraw.DrawQuadDw(cgo.Surface, P(iDrawQuadRight, 0), dwClrLow, dwClrLow, dwClrLow, dwClrLow, null);
    $.pDraw.DrawQuadDw(cgo.Surface, P(iDrawQuadBottom, 0), dwClrLow, dwClrLow, dwClrLow, dwClrLow, null);
    let iTxtOff = this.fDown ? iIndent : 0;
    if (this.fEnabled) {
      if (this.HasDrawFocus() || this.fMouseOver && this.IsInActiveDlg(false)) {
        $.pDraw.SetBlitMode(1);
        $.GraphicsResource.fctButtonHighlight.DrawX(cgo.Surface, Math.fround(Math.fround(x0 + Math.fround(5)) + Math.fround(iTxtOff)), Math.fround(Math.fround(y0 + Math.fround(3)) + Math.fround(iTxtOff)), Math.fround(this.rcBounds.Wdt - 10 | 0), Math.fround(this.rcBounds.Hgt - 6 | 0));
        $.pDraw.ResetBlitMode();
      }
    }
    $.pDraw.TextOut(this.sText.getData(), rUseFont, 1, cgo.Surface, Math.fround(Math.fround(Math.fround(x0 + x1) / Math.fround(2)) + Math.fround(iTxtOff)), Math.fround(Math.fround(Math.fround(Math.fround(y0 + y1) - Math.fround(iTextHgt)) / Math.fround(2)) + Math.fround(iTxtOff)), 0xff202020, 1, true);
  }

  init(szText, rtBounds) {
    super.init(szText, rtBounds);
    this.$dyn = C4StartupOptionsDlg$SmallButton;
    return this;
  }

  static GetDefaultButtonHeight() {
    let pUseFont = $.C4Startup.Get().Graphics.BookFont;
    return (Math.imul(pUseFont.GetLineHeight(), 6) / 5 | 0) + 6 | 0;
  }

  $clone() { return new C4StartupOptionsDlg$SmallButton().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class C4StartupOptionsDlg$BoolConfig extends CheckBox {
  pbVal = null;
  fInvert = false;
  piVal = null;
  piRestartChangeCfgVal = null;

  OnCheckChange(_pCheckBox) {
    if (this.pbVal != null) {
      this.pbVal.a[this.pbVal.o] = (this.GetChecked() ? 1 : 0) !== (this.fInvert ? 1 : 0);
    }
    if (this.piVal != null) {
      this.piVal.a[this.piVal.o] = (this.GetChecked() ? 1 : 0) !== (this.fInvert ? 1 : 0) ? 1 : 0;
    }
    if (this.piRestartChangeCfgVal != null) {
      this.GetScreen().ShowMessage($.LoadResStr(S("IDS_MSG_RESTARTCHANGECFG")), this.GetText$v(), 1 /*Ico_Notify*/, this.piRestartChangeCfgVal);
    }
  }

  init(rcBounds, szName, pbVal, piVal, fInvert = false, piRestartChangeCfgVal = null) {
    super.init(rcBounds, szName, (fInvert ? 1 : 0) !== ((pbVal != null ? pbVal.a[pbVal.o] : !(piVal.a[piVal.o] === 0)) ? 1 : 0));
    this.pbVal = pbVal;
    this.fInvert = fInvert;
    this.piVal = piVal;
    this.piRestartChangeCfgVal = piRestartChangeCfgVal;
    this.$dyn = C4StartupOptionsDlg$BoolConfig;
    this.SetOnChecked(new $.CallbackHandler$BoolConfig().init(this, "OnCheckChange"));
    return this;
  }

  $clone() { return new C4StartupOptionsDlg$BoolConfig().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pbVal = o.pbVal;
    this.fInvert = o.fInvert;
    this.piVal = o.piVal;
    this.piRestartChangeCfgVal = o.piRestartChangeCfgVal;
    return this;
  }
}

export class C4StartupOptionsDlg$KeySelDialog extends MessageDialog {
  KeyListeners = null;
  key = new $.C4KeyCodeEx().init();
  assignment = null;
  assignment_set = null;

  static GetDlgMessage(assignment, assignment_set) {
    if (assignment == null || assignment_set == null) {
      return new $.StdStrBuf().init$pi8$b(S("err"));
    }
    let result_string = new $.StdStrBuf();
    if (assignment_set.HasGamepad()) {
      result_string.Take$mStdStrBuf($.FormatString($.LoadResStr(S("IDS_MSG_PRESSBTN")), assignment.GetGUIName($.Game.PlayerControlDefs)));
    } else {
      result_string.Take$mStdStrBuf($.FormatString($.LoadResStr(S("IDS_MSG_PRESSKEY")), assignment.GetGUIName($.Game.PlayerControlDefs)));
    }
    let ctrl_desc = assignment.GetGUIDesc($.Game.PlayerControlDefs);
    if (ctrl_desc != null && ctrl_desc.a[ctrl_desc.o] !== 0) {
      result_string.Append$pi8(S("||"));
      result_string.Append$pi8(ctrl_desc);
    }
    return result_string;
  }

  static GetDlgIcon(assignment_set) {
    if (assignment_set == null) {
      return 11 /*Ico_Error*/;
    }
    if (assignment_set.HasGamepad()) {
      return 25 /*Ico_Gamepad*/;
    }
    return 24 /*Ico_Keyboard*/;
  }

  KeyDown$C4KeyCodeEx(key) {
    return this.KeyPress(key, true);
  }

  KeyUp$C4KeyCodeEx(key) {
    return this.KeyPress(key, false);
  }

  KeyPress(key, fDown) {
    if (this.assignment == null || this.assignment_set == null) {
      return false;
    }
    if ($.Key_IsGamepad(key.Key)) {
      if (!this.assignment_set.HasGamepad()) {
        return false;
      }
    } else if ($.Key_IsMouse(key.Key)) {
      if (!this.assignment_set.HasMouse()) {
        return false;
      }
    } else {
      if (!this.assignment_set.HasKeyboard()) {
        return false;
      }
    }
    if ($.KEY_IsModifier(key.Key) && fDown || !$.KEY_IsModifier(key.Key) && !fDown) {
      return false;
    }
    this.key.$assign(key);
    this.Close$b(true);
    return true;
  }

  MouseInput$rCMouse$i32$i32$i32$u32(rMouse, iButton, iX, iY, dwKeyParam) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4StartupOptionsDlg$KeySelDialog && C4StartupOptionsDlg$KeySelDialog.prototype instanceof $c) return $c.prototype.MouseInput$rCMouse$i32$i32$i32$u32.apply(this, arguments); }
    $.Dialog.prototype.MouseInput$rCMouse$i32$i32$i32$u32.call(this, rMouse, iButton, iX, iY, dwKeyParam);
    const rcClientRect = this.GetClientRect();
    const rcBounds = this.GetBounds();
    iX = iX - (rcClientRect.x - rcBounds.x | 0) | 0;
    iY = iY - (rcClientRect.y - rcBounds.y | 0) | 0;
    for (let pChild = this.pLast; pChild != null; pChild = pChild.GetPrev()) {
      if (pChild.fVisible && pChild.GetBounds().Contains$i32$i32(iX, iY)) {
        if ($dyncast(pChild, $.Label) != null) {
          break;
        } else {
          return;
        }
      }
    }
    if (iButton === 0) {
      return;
    }
    const down = [false];
    let key = $.C4KeyCodeEx.FromC4MC(0, iButton, dwKeyParam, P(down, 0));
    this.KeyPress(key, down[0]);
  }

  init(assignment, assignment_set) {
    super.init(C4StartupOptionsDlg$KeySelDialog.GetDlgMessage(assignment, assignment_set).getData(), $.LoadResStr(S("IDS_MSG_DEFINEKEY")), 34, C4StartupOptionsDlg$KeySelDialog.GetDlgIcon(assignment_set), 500 /*dsRegular*/);
    this.KeyListeners = null;
    this.key = new $.C4KeyCodeEx().init(0xfffffffffffffffe);
    this.assignment = assignment;
    this.assignment_set = assignment_set;
    this.$dyn = C4StartupOptionsDlg$KeySelDialog;
    let KEYS_Allmod = 7;
    let keys = [];
    for (let k = 0; k <= 7; k = k + 1 >>> 0) {
      if ((0xfffffff8 & k) >>> 0 !== 0) {
        continue;
      }
      $vpush(keys, new $.C4KeyCodeEx().init($.KEY_Any$C4KeyboardInput, k));
    }
    this.KeyListeners = new $.C4KeyBinding().init$vector$pi8$i32$pC4KeyboardCallbackInterface$u32(keys, S("DefineKey"), 2 /*KEYSCOPE_Gui*/, new $.DlgKeyCBPassKey$KeySelDialog().init(this, "KeyDown$C4KeyCodeEx", "KeyUp$C4KeyCodeEx"), 7 /*PRIO_PlrControl*/);
    return this;
  }

  $dtor() {
    super.$dtor();
  }

  GetKeyCode() {
    return this.key.$clone();
  }

  $clone() { return new C4StartupOptionsDlg$KeySelDialog().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.KeyListeners = o.KeyListeners;
    this.key.$assign(o.key);
    this.assignment = o.assignment;
    this.assignment_set = o.assignment_set;
    return this;
  }
}

export class C4StartupOptionsDlg$ControlConfigListBox extends ListBox {
  set = null;

  static sort_by_group(i, j) {
    return i.GetGUIGroup() < j.GetGUIGroup();
  }

  init(rcBounds, set) {
    super.init(rcBounds);
    this.set = null;
    this.$dyn = C4StartupOptionsDlg$ControlConfigListBox;
    C4StartupOptionsDlg$ControlConfigListBox.prototype.SetAssignmentSet.call(this, set);
    return this;
  }

  SetAssignmentSet(new_set) {
    let $t1;
    this.set = new_set;
    if (this.pClientWindow != null) {
      this.pClientWindow.ClearChildren$v();
    }
    if (this.set != null) {
      let assignment = null;
      let grouped_assignments = [];
      for (let i = 0; (assignment = this.set.GetAssignmentByIndex(i)) != null; i = i + 1 | 0) {
        grouped_assignments.push(assignment);
      }
      std_stable_sort($begin(grouped_assignments), $end(grouped_assignments), C4StartupOptionsDlg$ControlConfigListBox.sort_by_group);
      let current_group = 0;
      $t1 = grouped_assignments;
      for (let $i2 = 0; $i2 < $t1.length; $i2++) {
        const grouped_assignment = P($t1, $i2);
        assignment = grouped_assignment.a[grouped_assignment.o];
        let first_element_of_group = assignment.GetGUIGroup() > current_group;
        current_group = assignment.GetGUIGroup();
        let gui_name = assignment.GetGUIName($.Game.PlayerControlDefs);
        if (gui_name != null && gui_name.a[gui_name.o] !== 0) {
          let element = new C4StartupOptionsDlg$ControlConfigListBox$ListItem().init(this, assignment, this.set, first_element_of_group);
          this.AddElement$pElement$i32(element);
        }
      }
    }
  }

  static SetUserKey(assignment_set, assignment, key) {
    if (assignment == null || assignment_set == null) {
      return;
    }
    let config_set = $.Config.Controls.UserSets.GetSetByName(assignment_set.GetName());
    if (key.Key === 0xfffffffffffffffe) {
      assignment.ResetKeyToInherited();
      if (config_set != null) {
        config_set.RemoveAssignmentByControlName(assignment.GetControlName());
        if (!(config_set.GetAssignmentByIndex(0) != null)) {
          if ($.Game.PlayerControlDefaultAssignmentSets.GetSetByName(config_set.GetName()) != null) {
            $.Config.Controls.UserSets.RemoveSetByName(assignment_set.GetName());
          }
        }
      }
    } else {
      assignment.SetKey(key);
      if (config_set == null) {
        config_set = $.Config.Controls.UserSets.CreateEmptySetByTemplate(assignment_set);
      }
      let config_assignment = config_set.GetAssignmentByControlName(assignment.GetControlName());
      if (config_assignment == null) {
        config_assignment = config_set.CreateAssignmentForControl(assignment.GetControlName());
      }
      config_assignment.SetKey(key);
      let other_assignment = null;
      for (let i = 0; (other_assignment = assignment_set.GetAssignmentByIndex(i)) != null; i = i + 1 | 0) {
        if (other_assignment !== assignment) {
          if (other_assignment.GetTriggerKey().op_eq(key)) {
            let gui_name = other_assignment.GetGUIName($.Game.PlayerControlDefs);
            if (gui_name != null && gui_name.a[gui_name.o] !== 0) {
              $.TheScreen.ShowMessage($.FormatString($.LoadResStr(S("IDS_MSG_DEFINEKEYDUPLICATE")), key.ToString(true, false).getData(), gui_name).getData(), $.LoadResStr(S("IDS_MSG_DEFINEKEY")), 11 /*Ico_Error*/);
            }
          }
        }
      }
    }
  }

  $clone() { return new C4StartupOptionsDlg$ControlConfigListBox().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.set = o.set;
    return this;
  }
}

export class CallbackButton$C4StartupOptionsDlg$SmallButton extends C4StartupOptionsDlg$SmallButton {
  pCB = null;
  pCallbackFn = null;

  OnPress() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== CallbackButton$C4StartupOptionsDlg$SmallButton && CallbackButton$C4StartupOptionsDlg$SmallButton.prototype instanceof $c) return $c.prototype.OnPress.apply(this, arguments); }
    if (this.pCallbackFn != null) {
      let pC = this.pCB;
      if (pC == null) {
        if (!((pC = $.Element.prototype.GetDlg.call(this)) != null)) {
          return;
        }
      }
      $spawn(pC[this.pCallbackFn](this));
    }
  }

  init$pi8$rC4Rect$x$pC4StartupOptionsDlg(szBtnText, rtBounds, pFn, pCB) {
    super.init(szBtnText, rtBounds);
    this.pCB = pCB;
    this.pCallbackFn = pFn;
    this.$dyn = CallbackButton$C4StartupOptionsDlg$SmallButton;
    return this;
  }

  $clone() { return new CallbackButton$C4StartupOptionsDlg$SmallButton().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pCB = o.pCB;
    this.pCallbackFn = o.pCallbackFn;
    return this;
  }
}

export class C4StartupOptionsDlg extends C4StartupDlg {
  pKeyBack = null;
  fConfigSaved = false;
  fCanGoBack = true;
  pOptionsTabular = null;
  pLangCombo = null;
  pLangInfoLabel = null;
  pFontFaceCombo = null;
  pFontSizeCombo = null;
  pNetworkNickEdit = null;
  iGfxTexIndent = 0;
  pKeyToggleMusic = null;
  pFESoundCheck = null;
  pFEMusicCheck = null;
  pControlConfigArea = null;
  GamePadCon = null;
  pPortCfgTCP = null;
  pPortCfgUDP = null;
  pPortCfgRef = null;
  pPortCfgDsc = null;
  pLeagueServerCfg = null;
  pModDatabaseServerCfg = null;

  init() {
    super.init($.LoadResStrNoAmp(S("IDS_DLG_OPTIONS")));
    this.fConfigSaved = false;
    this.fCanGoBack = true;
    this.$dyn = C4StartupOptionsDlg;
    let $t1, $t2, $t3;
    this.UpdateSize();
    let fSmall = this.GetClientRect().Wdt < 750;
    let pUseFont = $.C4Startup.Get().Graphics.BookFont;
    let keys = [];
    $vpush(keys, new $.C4KeyCodeEx().init(14));
    $vpush(keys, new $.C4KeyCodeEx().init(105));
    this.pKeyBack = new $.C4KeyBinding().init$vector$pi8$i32$pC4KeyboardCallbackInterface$u32(keys, S("StartupOptionsBack"), 2 /*KEYSCOPE_Gui*/, new $.DlgKeyCB$C4StartupOptionsDlg().init(this, "KeyBack"), 2);
    keys.length = 0;
    $vpush(keys, new $.C4KeyCodeEx().init(61));
    this.pKeyToggleMusic = new $.C4KeyBinding().init$vector$pi8$i32$pC4KeyboardCallbackInterface$u32(keys, S("OptionsMusicToggle"), 2 /*KEYSCOPE_Gui*/, new $.DlgKeyCB$C4StartupOptionsDlg().init(this, "KeyMusicToggle"), 2);
    const iButtonWidth = [0];
    const iCaptionFontHgt = [0];
    const iButtonHeight = [32];
    $.GraphicsResource.CaptionFont.GetTextExtent(S("<< BACK"), P(iButtonWidth, 0), P(iCaptionFontHgt, 0), true);
    iButtonWidth[0] = Math.imul(iButtonWidth[0], 3);
    let iIndentX1 = 0;
    let iIndentY1 = 0;
    let iIndentY2 = 0;
    if (fSmall) {
      iIndentX1 = 20;
    } else {
      iIndentX1 = this.GetClientRect().Wdt / 40 | 0;
    }
    if (fSmall) {
      iIndentY1 = 1;
      iIndentY2 = 1;
    } else {
      iIndentY1 = this.GetClientRect().Hgt / 200 | 0;
      iIndentY2 = $max(1, iIndentY1 / 2 | 0);
    }
    let caMain = new $.ComponentAligner().init(this.GetClientRect(), 0, 0, true);
    let caButtonArea = new $.ComponentAligner().init(caMain.GetFromBottom$i32$i32(caMain.GetHeight() / (fSmall ? 20 : 7) | 0), 0, 0);
    let caButtons = new $.ComponentAligner().init(caButtonArea.GetCentered$i32$i32(Math.imul(caMain.GetWidth(), 7) / 8 | 0, iButtonHeight[0]), 0, 0);
    let caConfigArea = new $.ComponentAligner().init(caMain.GetAll$v(), fSmall ? 0 : Math.imul(caMain.GetWidth(), 69) / 1730 | 0, fSmall ? 0 : caMain.GetHeight() / 200 | 0);
    let btn = null;
    $.Container.prototype.AddElement$pElement.call(this, btn = new $.CallbackButton$C4StartupOptionsDlg$Button().init$pi8$rC4Rect$x$pC4StartupOptionsDlg($.LoadResStr(S("IDS_BTN_BACK")), caButtons.GetFromLeft$i32$i32(iButtonWidth[0]), "OnBackBtn"));
    btn.SetToolTip($.LoadResStr(S("IDS_DLGTIP_BACKMAIN")));
    this.pOptionsTabular = new $.Tabular().init(caConfigArea.GetAll$v(), 2 /*tbLeft*/);
    this.pOptionsTabular.SetGfx($.C4Startup.Get().Graphics.fctDlgPaper, $.C4Startup.Get().Graphics.fctOptionsTabClip, $.C4Startup.Get().Graphics.fctOptionsIcons, $.C4Startup.Get().Graphics.BookSmallFont, true);
    $.Container.prototype.AddElement$pElement.call(this, this.pOptionsTabular);
    let pSheetGeneral = this.pOptionsTabular.AddSheet($.LoadResStr(S("IDS_DLG_PROGRAM")), 0);
    let pSheetGraphics = this.pOptionsTabular.AddSheet($.LoadResStr(S("IDS_DLG_GRAPHICS")), 1);
    let pSheetSound = this.pOptionsTabular.AddSheet($.LoadResStr(S("IDS_DLG_SOUND")), 2);
    let pSheetControls = this.pOptionsTabular.AddSheet($.LoadResStr(S("IDS_DLG_CONTROLS")), 3);
    let pSheetNetwork = this.pOptionsTabular.AddSheet($.LoadResStr(S("IDS_DLG_NETWORK")), 5);
    let pCheck = null;
    let pLbl = null;
    const iCheckWdt = [100];
    const iCheckHgt = [20];
    const iEdit2Wdt = [100];
    const iEdit2Hgt = [40];
    $.CheckBox.GetStandardCheckBoxSize(P(iCheckWdt, 0), P(iCheckHgt, 0), S("Default text"), pUseFont);
    C4StartupOptionsDlg$EditConfig.GetControlSize$pi32$pi32$pi8$b(P(iEdit2Wdt, 0), P(iEdit2Hgt, 0), S("Default text"), false);
    let caSheetProgram = new $.ComponentAligner().init(pSheetGeneral.GetClientRect(), caMain.GetWidth() / 20 | 0, caMain.GetHeight() / 20 | 0, true);
    let szLangTip = $.LoadResStr(S("IDS_MSG_SELECTLANG"));
    let caLanguage = new $.ComponentAligner().init(caSheetProgram.GetGridCell(0, 1, 0, 7, -1, -1, true, 1, 2), 0, 4, false);
    let caLanguageBox = new $.ComponentAligner().init(caLanguage.GetFromTop$i32$i32($.ComboBox.GetDefaultHeight$v()), 0, 0, false);
    let sLangStr = new $.StdStrBuf();
    sLangStr.Copy$pi8($.LoadResStr(S("IDS_CTL_LANGUAGE")));
    sLangStr.AppendChar(58);
    const w = [0];
    const q = [0];
    pUseFont.GetTextExtent(sLangStr.getData(), P(w, 0), P(q, 0), true);
    pLbl = new $.Label().init$pi8$C4Rect$i32$u32$pCStdFont$b$b$b(sLangStr.getData(), caLanguageBox.GetFromLeft$i32$i32(w[0] + 4 | 0), 0, 0xff000000, pUseFont, false);
    pLbl.SetToolTip(szLangTip);
    $.Container.prototype.AddElement$pElement.call(pSheetGeneral, pLbl);
    pUseFont.GetTextExtent(S("XX: Top Secret Language"), P(w, 0), P(q, 0), true);
    this.pLangCombo = new $.ComboBox().init(caLanguageBox.GetFromLeft$i32$i32($min(w[0], caLanguageBox.GetWidth())));
    this.pLangCombo.SetToolTip(szLangTip);
    this.pLangCombo.SetComboCB(new $.ComboBox_FillCallback$C4StartupOptionsDlg().init(this, "OnLangComboFill", "OnLangComboSelChange"));
    this.pLangCombo.SetColors(0xff000000, 0, 0xffa4947a);
    this.pLangCombo.SetFont$pCStdFont(pUseFont);
    this.pLangCombo.SetDecoration$pC4Facet($.C4Startup.Get().Graphics.fctContext);
    $.Container.prototype.AddElement$pElement.call(pSheetGeneral, this.pLangCombo);
    this.pLangInfoLabel = new $.Label().init$pi8$C4Rect$i32$u32$pCStdFont$b$b$b(null, caLanguage.GetFromTop$i32$i32(Math.imul($.GraphicsResource.TextFont.GetLineHeight(), 3)), 0, 0xff000000, pUseFont, false);
    this.pLangInfoLabel.SetToolTip(szLangTip);
    $.Container.prototype.AddElement$pElement.call(pSheetGeneral, this.pLangInfoLabel);
    C4StartupOptionsDlg.prototype.UpdateLanguage.call(this);
    let szFontTip = $.LoadResStr(S("IDS_DESC_SELECTFONT"));
    let caFontBox = new $.ComponentAligner().init(caSheetProgram.GetGridCell(0, 1, 2, 7, -1, $.ComboBox.GetDefaultHeight$v(), true), 0, 0, false);
    let sFontStr = new $.StdStrBuf();
    sFontStr.Copy$pi8($.LoadResStr(S("IDS_CTL_FONT")));
    sFontStr.AppendChar(58);
    pUseFont.GetTextExtent(sFontStr.getData(), P(w, 0), P(q, 0), true);
    pLbl = new $.Label().init$pi8$C4Rect$i32$u32$pCStdFont$b$b$b(sFontStr.getData(), caFontBox.GetFromLeft$i32$i32(w[0] + 4 | 0), 0, 0xff000000, pUseFont, false);
    pLbl.SetToolTip(szFontTip);
    $.Container.prototype.AddElement$pElement.call(pSheetGeneral, pLbl);
    pUseFont.GetTextExtent(S("Comic Sans MS"), P(w, 0), P(q, 0), true);
    this.pFontFaceCombo = new $.ComboBox().init(caFontBox.GetFromLeft$i32$i32($min(Math.imul(caFontBox.GetInnerWidth(), 3) / 4 | 0, Math.imul(w[0], 3))));
    this.pFontFaceCombo.SetToolTip(szFontTip);
    this.pFontFaceCombo.SetComboCB(new $.ComboBox_FillCallback$C4StartupOptionsDlg().init(this, "OnFontFaceComboFill", "OnFontComboSelChange"));
    this.pFontFaceCombo.SetColors(0xff000000, 0, 0xffa4947a);
    this.pFontFaceCombo.SetFont$pCStdFont(pUseFont);
    this.pFontFaceCombo.SetDecoration$pC4Facet($.C4Startup.Get().Graphics.fctContext);
    caFontBox.ExpandLeft(-4);
    $.Container.prototype.AddElement$pElement.call(pSheetGeneral, this.pFontFaceCombo);
    this.pFontSizeCombo = new $.ComboBox().init(caFontBox.GetFromLeft$i32$i32($min(caFontBox.GetInnerWidth(), w[0])));
    this.pFontSizeCombo.SetToolTip($.LoadResStr(S("IDS_DESC_FONTSIZE")));
    this.pFontSizeCombo.SetComboCB(new $.ComboBox_FillCallback$C4StartupOptionsDlg().init(this, "OnFontSizeComboFill", "OnFontComboSelChange"));
    this.pFontSizeCombo.SetColors(0xff000000, 0, 0xffa4947a);
    this.pFontSizeCombo.SetFont$pCStdFont(pUseFont);
    this.pFontSizeCombo.SetDecoration$pC4Facet($.C4Startup.Get().Graphics.fctContext);
    $.Container.prototype.AddElement$pElement.call(pSheetGeneral, this.pFontSizeCombo);
    C4StartupOptionsDlg.prototype.UpdateFontControls.call(this);
    pCheck = new C4StartupOptionsDlg$BoolConfig().init(caSheetProgram.GetGridCell(0, 1, 3, 7, -1, iCheckHgt[0], true), $.LoadResStr(S("IDS_CTL_MMTIMER")), null, P($.Config.General, "MMTimer"), true, P($.Config.Startup, "HideMsgMMTimerChange"));
    pCheck.SetToolTip($.LoadResStr(S("IDS_MSG_MMTIMER_DESC")));
    pCheck.SetFont$pCStdFont$u32$u32(pUseFont, 0xff000000, 0xff7f7f7f);
    $.Container.prototype.AddElement$pElement.call(pSheetGeneral, pCheck);
    let szBtnText = $.LoadResStr(S("IDS_BTN_RESETCONFIG"));
    let pSmallBtn = null;
    $.GraphicsResource.CaptionFont.GetTextExtent(szBtnText, P(iButtonWidth, 0), P(iButtonHeight, 0), true);
    let rcResetBtn = caSheetProgram.GetGridCell(1, 2, 6, 7, $min(iButtonWidth[0] + Math.imul(iButtonHeight[0], 4) | 0, Math.imul(caSheetProgram.GetInnerWidth(), 2) / 5 | 0), C4StartupOptionsDlg$SmallButton.GetDefaultButtonHeight(), true).$clone();
    pSmallBtn = new CallbackButton$C4StartupOptionsDlg$SmallButton().init$pi8$rC4Rect$x$pC4StartupOptionsDlg(szBtnText, rcResetBtn, "OnResetConfigBtn", this);
    $.Container.prototype.AddElement$pElement.call(pSheetGeneral, pSmallBtn);
    pSmallBtn.SetToolTip($.LoadResStr(S("IDS_DESC_RESETCONFIG")));
    let caSheetGraphics = new $.ComponentAligner().init(pSheetGraphics.GetClientRect(), iIndentX1, iIndentY1, true);
    let pGroupResolution = new $.GroupBox().init(caSheetGraphics.GetGridCell(0, 1, 0, 2));
    pGroupResolution.SetTitle$pi8($.LoadResStrNoAmp(S("IDS_CTL_DISPLAY")));
    pGroupResolution.SetFont$pCStdFont(pUseFont);
    pGroupResolution.SetColors(0xffa4947a, 0xff000000);
    $.Container.prototype.AddElement$pElement.call(pSheetGraphics, pGroupResolution);
    let caGroupResolution = new $.ComponentAligner().init(pGroupResolution.GetClientRect(), iIndentX1, iIndentY2, true);
    let iNumGfxOptions = 3;
    let iOpt = 0;
    let resBox = new $.ComponentAligner().init(caGroupResolution.GetGridCell(0, 1, ($t1 = iOpt, iOpt = iOpt + 1 | 0, $t1), iNumGfxOptions), 0, 0, false);
    w[0] = 20;
    q[0] = 12;
    pUseFont.GetTextExtent($.LoadResStr(S("IDS_CTL_RESOLUTION")), P(w, 0), P(q, 0), true);
    $.Container.prototype.AddElement$pElement.call(pGroupResolution, new $.Label().init$pi8$C4Rect$i32$u32$pCStdFont$b$b$b($.LoadResStr(S("IDS_CTL_RESOLUTION")), resBox.GetFromLeft$i32$i32(w[0] + 4 | 0, q[0]), 0, 0xff000000, pUseFont, false, false));
    pUseFont.GetTextExtent(S("1600 x 1200"), P(w, 0), P(q, 0), true);
    w[0] = $min(caGroupResolution.GetInnerWidth(), w[0] + 40 | 0);
    let pGfxResCombo = new $.ComboBox().init(resBox.GetFromLeft$i32$i32(w[0] + 40 | 0, $.ComboBox.GetDefaultHeight$v()));
    pGfxResCombo.SetToolTip($.LoadResStr(S("IDS_MSG_RESOLUTION_DESC")));
    pGfxResCombo.SetComboCB(new $.ComboBox_FillCallback$C4StartupOptionsDlg().init(this, "OnGfxResComboFill", "OnGfxResComboSelChange"));
    pGfxResCombo.SetColors(0xff000000, 0, 0xffa4947a);
    pGfxResCombo.SetFont$pCStdFont(pUseFont);
    pGfxResCombo.SetDecoration$pC4Facet($.C4Startup.Get().Graphics.fctContext);
    pGfxResCombo.SetText$pi8(C4StartupOptionsDlg.prototype.GetGfxResString.call(this, $.Config.Graphics.ResX, $.Config.Graphics.ResY).getData());
    $.Container.prototype.AddElement$pElement.call(pGroupResolution, pGfxResCombo);
    let fsBox = new $.ComponentAligner().init(caGroupResolution.GetGridCell(0, 1, ($t2 = iOpt, iOpt = iOpt + 1 | 0, $t2), iNumGfxOptions), 0, 0, false);
    w[0] = 20;
    q[0] = 12;
    pUseFont.GetTextExtent($.LoadResStr(S("IDS_CTL_FULLSCREENMODE")), P(w, 0), P(q, 0), true);
    $.Container.prototype.AddElement$pElement.call(pGroupResolution, new $.Label().init$pi8$C4Rect$i32$u32$pCStdFont$b$b$b($.LoadResStr(S("IDS_CTL_FULLSCREENMODE")), fsBox.GetFromLeft$i32$i32(w[0] + 4 | 0, q[0]), 0, 0xff000000, pUseFont, false, false));
    let wmax = 0;
    for (let i = 0; i < 3; i = i + 1 | 0) {
      pUseFont.GetTextExtent(C4StartupOptionsDlg.prototype.GetWindowedName.call(this, i), P(w, 0), P(q, 0), true);
      wmax = $max(w[0], wmax | 0) >>> 0;
    }
    let pCombo = new $.ComboBox().init(fsBox.GetFromLeft$i32$i32(w[0] + 40 | 0, $.ComboBox.GetDefaultHeight$v()));
    pCombo.SetComboCB(new $.ComboBox_FillCallback$C4StartupOptionsDlg().init(this, "OnWindowedModeComboFill", "OnWindowedModeComboSelChange"));
    pCombo.SetToolTip($.LoadResStr(S("IDS_MSG_FULLSCREEN_DESC")));
    pCombo.SetColors(0xff000000, 0, 0xffa4947a);
    pCombo.SetFont$pCStdFont(pUseFont);
    pCombo.SetDecoration$pC4Facet($.C4Startup.Get().Graphics.fctContext);
    pCombo.SetText$pi8(C4StartupOptionsDlg.prototype.GetWindowedName.call(this));
    $.Container.prototype.AddElement$pElement.call(pGroupResolution, pCombo);
    iNumGfxOptions = 5, iOpt = 0;
    let pGroupOptions = new $.GroupBox().init(caSheetGraphics.GetGridCell(0, 1, 1, 2));
    pGroupOptions.SetTitle$pi8($.LoadResStrNoAmp(S("IDS_DLG_OPTIONS")));
    pGroupOptions.SetFont$pCStdFont(pUseFont);
    pGroupOptions.SetColors(0xffa4947a, 0xff000000);
    $.Container.prototype.AddElement$pElement.call(pSheetGraphics, pGroupOptions);
    let caGroupOptions = new $.ComponentAligner().init(pGroupOptions.GetClientRect(), iIndentX1, iIndentY2, true);
    let msBox = new $.ComponentAligner().init(caGroupOptions.GetFromTop$i32$i32($.ComboBox.GetDefaultHeight$v()), 0, 0, false);
    w[0] = 20;
    q[0] = 12;
    pUseFont.GetTextExtent($.LoadResStr(S("IDS_CTL_ANTIALIASING")), P(w, 0), P(q, 0), true);
    $.Container.prototype.AddElement$pElement.call(pGroupOptions, new $.Label().init$pi8$C4Rect$i32$u32$pCStdFont$b$b$b($.LoadResStr(S("IDS_CTL_ANTIALIASING")), msBox.GetFromLeft$i32$i32(w[0] + 4 | 0), 0, 0xff000000, pUseFont, false, false));
    pUseFont.GetTextExtent(S("Off"), P(w, 0), P(q, 0), true);
    let pGfxMSCombo = new $.ComboBox().init(msBox.GetFromLeft$i32$i32(w[0] + 40 | 0, $.ComboBox.GetDefaultHeight$v()));
    pGfxMSCombo.SetToolTip($.LoadResStr(S("IDS_MSG_ANTIALIASING_DESC")));
    pGfxMSCombo.SetComboCB(new $.ComboBox_FillCallback$C4StartupOptionsDlg().init(this, "OnGfxMSComboFill", "OnGfxMSComboSelChange"));
    pGfxMSCombo.SetColors(0xff000000, 0, 0xffa4947a);
    pGfxMSCombo.SetFont$pCStdFont(pUseFont);
    pGfxMSCombo.SetDecoration$pC4Facet($.C4Startup.Get().Graphics.fctContext);
    let Current = new $.StdStrBuf();
    if ($.Config.Graphics.MultiSampling !== 0) {
      Current.Format(S("%dx"), $.Config.Graphics.MultiSampling);
    } else {
      Current.Copy$pi8(S("Off"));
    }
    pGfxMSCombo.SetText$pi8(Current.getData());
    let multisamples = [];
    $.Application.pWindow.EnumerateMultiSamples(multisamples);
    pGfxMSCombo.SetReadOnly(multisamples.length === 0);
    $.Container.prototype.AddElement$pElement.call(pGroupOptions, pGfxMSCombo);
    pCheck = new C4StartupOptionsDlg$BoolConfig().init(caGroupOptions.GetGridCell(0, 1, ($t3 = iOpt, iOpt = iOpt + 1 | 0, $t3), iNumGfxOptions, -1, iCheckHgt[0], true), $.LoadResStr(S("IDS_MSG_AUTOFRAMESKIP")), null, P($.Config.Graphics, "AutoFrameSkip"));
    pCheck.SetToolTip($.LoadResStr(S("IDS_DESC_AUTOFRAMESKIP")));
    pCheck.SetFont$pCStdFont$u32$u32(pUseFont, 0xff000000, 0xff7f7f7f);
    $.Container.prototype.AddElement$pElement.call(pGroupOptions, pCheck);
    let caSheetSound = new $.ComponentAligner().init(pSheetSound.GetClientRect(), iIndentX1, iIndentY1, true);
    if (!$.CheckBox.GetStandardCheckBoxSize(P(iCheckWdt, 0), P(iCheckHgt, 0), S("Lorem ipsum"), pUseFont)) {
      iCheckWdt[0] = 100;
      iCheckHgt[0] = 20;
    }
    let iGridWdt = Math.imul(iCheckWdt[0], 2);
    let iGridHgt = Math.imul(iCheckHgt[0], 5) / 2 | 0;
    let pGroupFESound = new $.GroupBox().init(caSheetSound.GetGridCell(0, 2, 0, 5, iGridWdt, iGridHgt, false, 1, 2));
    pGroupFESound.SetTitle$pi8($.LoadResStrNoAmp(S("IDS_CTL_FRONTEND")));
    pGroupFESound.SetFont$pCStdFont(pUseFont);
    pGroupFESound.SetColors(0xffa4947a, 0xff000000);
    $.Container.prototype.AddElement$pElement.call(pSheetSound, pGroupFESound);
    let caGroupFESound = new $.ComponentAligner().init(pGroupFESound.GetClientRect(), iIndentX1, iIndentY2, true);
    pCheck = this.pFEMusicCheck = new $.CheckBox().init(caGroupFESound.GetGridCell(0, 1, 0, 2, -1, iCheckHgt[0], true), $.LoadResStr(S("IDS_CTL_MUSIC")), !($.Config.Sound.FEMusic === 0));
    pCheck.SetToolTip($.LoadResStr(S("IDS_DESC_MENUMUSIC")));
    pCheck.SetFont$pCStdFont$u32$u32(pUseFont, 0xff000000, 0xff7f7f7f);
    pCheck.SetOnChecked(new $.CallbackHandler$C4StartupOptionsDlg().init(this, "OnFEMusicCheck"));
    $.Container.prototype.AddElement$pElement.call(pGroupFESound, pCheck);
    pCheck = this.pFESoundCheck = new C4StartupOptionsDlg$BoolConfig().init(caGroupFESound.GetGridCell(0, 1, 1, 2, -1, iCheckHgt[0], true), $.LoadResStr(S("IDS_CTL_SOUNDFX")), null, P($.Config.Sound, "FESamples"));
    pCheck.SetToolTip($.LoadResStr(S("IDS_DESC_MENUSOUND")));
    pCheck.SetFont$pCStdFont$u32$u32(pUseFont, 0xff000000, 0xff7f7f7f);
    $.Container.prototype.AddElement$pElement.call(pGroupFESound, pCheck);
    let pGroupRXSound = new $.GroupBox().init(caSheetSound.GetGridCell(1, 2, 0, 5, iGridWdt, iGridHgt, false, 1, 2));
    pGroupRXSound.SetTitle$pi8($.LoadResStrNoAmp(S("IDS_CTL_GAME")));
    pGroupRXSound.SetFont$pCStdFont(pUseFont);
    pGroupRXSound.SetColors(0xffa4947a, 0xff000000);
    $.Container.prototype.AddElement$pElement.call(pSheetSound, pGroupRXSound);
    let caGroupRXSound = new $.ComponentAligner().init(pGroupRXSound.GetClientRect(), iIndentX1, iIndentY2, true);
    pCheck = new C4StartupOptionsDlg$BoolConfig().init(caGroupRXSound.GetGridCell(0, 1, 0, 2, -1, iCheckHgt[0], true), $.LoadResStr(S("IDS_CTL_MUSIC")), null, P($.Config.Sound, "RXMusic"));
    pCheck.SetToolTip($.LoadResStr(S("IDS_DESC_GAMEMUSIC")));
    pCheck.SetFont$pCStdFont$u32$u32(pUseFont, 0xff000000, 0xff7f7f7f);
    $.Container.prototype.AddElement$pElement.call(pGroupRXSound, pCheck);
    pCheck = new $.CheckBox().init(caGroupRXSound.GetGridCell(0, 1, 1, 2, -1, iCheckHgt[0], true), $.LoadResStr(S("IDS_CTL_SOUNDFX")), !($.Config.Sound.RXSound === 0));
    pCheck.SetToolTip($.LoadResStr(S("IDS_DESC_GAMESOUND")));
    pCheck.SetFont$pCStdFont$u32$u32(pUseFont, 0xff000000, 0xff7f7f7f);
    pCheck.SetOnChecked(new $.CallbackHandler$C4StartupOptionsDlg().init(this, "OnRXSoundCheck"));
    $.Container.prototype.AddElement$pElement.call(pGroupRXSound, pCheck);
    let pGroupVolume = new $.GroupBox().init(caSheetSound.GetGridCell(0, 2, 2, 5, iGridWdt, iGridHgt, false, 2, 3));
    pGroupVolume.SetTitle$pi8($.LoadResStrNoAmp(S("IDS_BTN_VOLUME")));
    pGroupVolume.SetFont$pCStdFont(pUseFont);
    pGroupVolume.SetColors(0xffa4947a, 0xff000000);
    $.Container.prototype.AddElement$pElement.call(pSheetSound, pGroupVolume);
    let caGroupVolume = new $.ComponentAligner().init(pGroupVolume.GetClientRect(), iIndentX1, iIndentY2, true);
    let i = 0;
    for (i = 0; i < 2; i = i + 1 | 0) {
      let sLabelTxt = new $.StdStrBuf();
      let caVolumeSlider = new $.ComponentAligner().init(caGroupVolume.GetGridCell(0, 1, i, 2, -1, (pUseFont.GetLineHeight() + Math.imul(iIndentY2, 2) | 0) + 16 | 0, true), 1, 0, false);
      $.Container.prototype.AddElement$pElement.call(pGroupVolume, new $.Label().init$pi8$C4Rect$i32$u32$pCStdFont$b$b$b($.FormatString(S("%s:"), $.LoadResStr(i !== 0 ? S("IDS_CTL_SOUNDFX") : S("IDS_CTL_MUSIC"))).getData(), caVolumeSlider.GetFromTop$i32$i32(pUseFont.GetLineHeight()), 0, 0xff000000, pUseFont, false, false));
      sLabelTxt.Copy$pi8($.LoadResStr(S("IDS_CTL_SILENT")));
      w[0] = 20;
      q[0] = 12;
      pUseFont.GetTextExtent(sLabelTxt.getData(), P(w, 0), P(q, 0), true);
      $.Container.prototype.AddElement$pElement.call(pGroupVolume, new $.Label().init$pi8$C4Rect$i32$u32$pCStdFont$b$b$b(sLabelTxt.getData(), caVolumeSlider.GetFromLeft$i32$i32(w[0], q[0]), 1, 0xff000000, pUseFont, false, false));
      sLabelTxt.Copy$pi8($.LoadResStr(S("IDS_CTL_LOUD")));
      pUseFont.GetTextExtent(sLabelTxt.getData(), P(w, 0), P(q, 0), true);
      $.Container.prototype.AddElement$pElement.call(pGroupVolume, new $.Label().init$pi8$C4Rect$i32$u32$pCStdFont$b$b$b(sLabelTxt.getData(), caVolumeSlider.GetFromRight$i32$i32(w[0], q[0]), 1, 0xff000000, pUseFont, false, false));
      let pCB = new $.ParCallbackHandler$C4StartupOptionsDlg$i32().init(this, i !== 0 ? "OnSoundVolumeSliderChange" : "OnMusicVolumeSliderChange");
      let pSlider = new $.ScrollBar().init$rC4Rect$b$pBaseParCallbackHandler$i32(caVolumeSlider.GetCentered$i32$i32(caVolumeSlider.GetInnerWidth(), 16), true, pCB, 101);
      pSlider.SetDecoration$pScrollBarFacets$b($.C4Startup.Get().Graphics.sfctBookScroll, false);
      pSlider.SetToolTip(i !== 0 ? $.LoadResStr(S("IDS_DESC_VOLUMESOUND")) : $.LoadResStr(S("IDS_DESC_VOLUMEMUSIC")));
      pSlider.SetScrollPos(i !== 0 ? $.Config.Sound.SoundVolume : $.Config.Sound.MusicVolume);
      $.Container.prototype.AddElement$pElement.call(pGroupVolume, pSlider);
    }
    $.Container.prototype.AddElement$pElement.call(pSheetControls, this.pControlConfigArea = new C4StartupOptionsDlg$ControlConfigArea().init(pSheetControls.GetClientRect(), caMain.GetWidth() / 20 | 0, caMain.GetHeight() / 40 | 0, false, this));
    const iPortCfgWdt = [200];
    const iPortCfgHgt = [48];
    C4StartupOptionsDlg$NetworkPortConfig.GetControlSize$pi32$pi32(P(iPortCfgWdt, 0), P(iPortCfgHgt, 0));
    const iServerCfgWdt = [120];
    const iServerCfgHgt = [20];
    const iServerCfgWdtMid = [0];
    let sServerText = new $.StdStrBuf();
    sServerText.Copy$pi8($.LoadResStr(S("IDS_CTL_USEOTHERSERVER")));
    C4StartupOptionsDlg$NetworkServerAddressConfig.GetControlSize$pi32$pi32$pi32$pi8(P(iServerCfgWdt, 0), P(iServerCfgHgt, 0), P(iServerCfgWdtMid, 0), sServerText.getData());
    let net_component_hgt = (Math.imul(iPortCfgHgt[0], 4) + Math.imul(2, iServerCfgHgt[0]) | 0) + Math.imul(3, pUseFont.GetLineHeight()) | 0;
    let caSheetNetwork = new $.ComponentAligner().init(pSheetNetwork.GetClientRect(), caMain.GetWidth() / 20 | 0, $max(0, (caMain.GetHeight() - net_component_hgt | 0) / 20 | 0), true);
    this.pPortCfgTCP = new C4StartupOptionsDlg$NetworkPortConfig().init(caSheetNetwork.GetGridCell(0, 2, 0, 2, iPortCfgWdt[0], iPortCfgHgt[0]), $.LoadResStr(S("IDS_NET_PORT_TCP")), P($.Config.Network, "PortTCP"), 11112);
    this.pPortCfgUDP = new C4StartupOptionsDlg$NetworkPortConfig().init(caSheetNetwork.GetGridCell(1, 2, 0, 2, iPortCfgWdt[0], iPortCfgHgt[0]), $.LoadResStr(S("IDS_NET_PORT_UDP")), P($.Config.Network, "PortUDP"), 11113);
    this.pPortCfgRef = new C4StartupOptionsDlg$NetworkPortConfig().init(caSheetNetwork.GetGridCell(0, 2, 1, 2, iPortCfgWdt[0], iPortCfgHgt[0]), $.LoadResStr(S("IDS_NET_PORT_REFERENCE")), P($.Config.Network, "PortRefServer"), 11111);
    this.pPortCfgDsc = new C4StartupOptionsDlg$NetworkPortConfig().init(caSheetNetwork.GetGridCell(1, 2, 1, 2, iPortCfgWdt[0], iPortCfgHgt[0]), $.LoadResStr(S("IDS_NET_PORT_DISCOVERY")), P($.Config.Network, "PortDiscovery"), 11114);
    this.pPortCfgTCP.SetToolTip($.LoadResStr(S("IDS_NET_PORT_TCP_DESC")));
    this.pPortCfgUDP.SetToolTip($.LoadResStr(S("IDS_NET_PORT_UDP_DESC")));
    this.pPortCfgRef.SetToolTip($.LoadResStr(S("IDS_NET_PORT_REFERENCE_DESC")));
    this.pPortCfgDsc.SetToolTip($.LoadResStr(S("IDS_NET_PORT_DISCOVERY_DESC")));
    $.Container.prototype.AddElement$pElement.call(pSheetNetwork, this.pPortCfgTCP);
    $.Container.prototype.AddElement$pElement.call(pSheetNetwork, this.pPortCfgUDP);
    $.Container.prototype.AddElement$pElement.call(pSheetNetwork, this.pPortCfgRef);
    $.Container.prototype.AddElement$pElement.call(pSheetNetwork, this.pPortCfgDsc);
    let iNetHgt0 = this.pPortCfgDsc.GetBounds().GetBottom$v$c();
    caSheetNetwork.ExpandTop(-iNetHgt0 | 0);
    this.pLeagueServerCfg = new C4StartupOptionsDlg$NetworkServerAddressConfig().init(caSheetNetwork.GetFromTop$i32$i32(iServerCfgHgt[0]), sServerText.getData(), P($.Config.Network, "UseAlternateServer"), P($.Config.Network.AlternateServerAddress, 0), iServerCfgWdtMid[0]);
    this.pLeagueServerCfg.SetToolTip($.LoadResStr(S("IDS_NET_MASTERSRV_DESC")));
    $.Container.prototype.AddElement$pElement.call(pSheetNetwork, this.pLeagueServerCfg);
    this.pModDatabaseServerCfg = new C4StartupOptionsDlg$NetworkModDatabaseServerAddressConfig().init(caSheetNetwork.GetFromTop$i32$i32(iServerCfgHgt[0]), $.LoadResStr(S("IDS_CTL_USEOTHERMODSDATABASESERVER")), P($.Config.Network, "UseAlternateModDatabaseServer"), P($.Config.Network.AlternateModDatabaseServerAddress, 0), iServerCfgWdtMid[0]);
    this.pModDatabaseServerCfg.SetToolTip($.LoadResStr(S("IDS_NET_USEOTHERMODSDATABASESERVER_DESC")));
    $.Container.prototype.AddElement$pElement.call(pSheetNetwork, this.pModDatabaseServerCfg);
    pCheck = new C4StartupOptionsDlg$BoolConfig().init(caSheetNetwork.GetFromTop$i32$i32(pUseFont.GetLineHeight()), $.LoadResStr(S("IDS_CTL_UPNP")), null, P($.Config.Network, "EnableUPnP"), false);
    pCheck.SetToolTip($.LoadResStr(S("IDS_DESC_UPNP")));
    pCheck.SetFont$pCStdFont$u32$u32(pUseFont, 0xff000000, 0xff7f7f7f);
    $.Container.prototype.AddElement$pElement.call(pSheetNetwork, pCheck);
    pCheck = new C4StartupOptionsDlg$BoolConfig().init(caSheetNetwork.GetFromTop$i32$i32(pUseFont.GetLineHeight()), $.LoadResStr(S("IDS_CTL_PACKETLOGGING")), null, P($.Config.Network, "PacketLogging"), false);
    pCheck.SetToolTip($.LoadResStr(S("IDS_DESC_PACKETLOGGING")));
    pCheck.SetFont$pCStdFont$u32$u32(pUseFont, 0xff000000, 0xff7f7f7f);
    $.Container.prototype.AddElement$pElement.call(pSheetNetwork, pCheck);
    let szNameCfgText = $.LoadResStr(S("IDS_NET_USERNAME"));
    const iNameCfgWdt = [200];
    const iNameCfgHgt = [48];
    C4StartupOptionsDlg$EditConfig.GetControlSize$pi32$pi32$pi8$b(P(iNameCfgWdt, 0), P(iNameCfgHgt, 0), szNameCfgText, false);
    iNameCfgWdt[0] = iNameCfgWdt[0] + 5 | 0;
    this.pNetworkNickEdit = new C4StartupOptionsDlg$EditConfig().init(caSheetNetwork.GetFromTop$i32$i32(iNameCfgHgt[0]), szNameCfgText, $.Config.Network.Nick, null, false);
    this.pNetworkNickEdit.SetToolTip($.LoadResStr(S("IDS_NET_USERNAME_DESC")));
    $.Container.prototype.AddElement$pElement.call(pSheetNetwork, this.pNetworkNickEdit);
    let NickBuf = new $.StdCopyStrBuf().init$StdCopyStrBuf$b($.Config.Network.Nick);
    if (!(NickBuf.getLength() !== 0)) {
      NickBuf.Copy$pi8($.Config.GetRegistrationData(S("Nick")));
    }
    this.pNetworkNickEdit.GetEdit().SetText$pi8$b(NickBuf.getData(), false);
    this.SetFocus(this.pOptionsTabular, false);
    return this;
  }

  $dtor() {
    $delete(this.pKeyToggleMusic);
    $delete(this.pKeyBack);
    super.$dtor();
  }

  OnEnter() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4StartupOptionsDlg && C4StartupOptionsDlg.prototype instanceof $c) return $c.prototype.OnEnter.apply(this, arguments); }
    return false;
  }

  OnEscape() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4StartupOptionsDlg && C4StartupOptionsDlg.prototype instanceof $c) return $c.prototype.OnEscape.apply(this, arguments); }
    this.DoBack$v();
    return true;
  }

  KeyBack() {
    this.DoBack$v();
    return true;
  }

  OnClosed(fOK) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4StartupOptionsDlg && C4StartupOptionsDlg.prototype instanceof $c) return $c.prototype.OnClosed.apply(this, arguments); }
    this.SaveConfig(true, false);
    $.Dialog.prototype.OnClosed.call(this, fOK);
  }

  UserClose$b(fOK) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4StartupOptionsDlg && C4StartupOptionsDlg.prototype instanceof $c) return $c.prototype.UserClose$b.apply(this, arguments); }
    if (fOK) {
      this.SaveConfig(false, true);
    }
  }

  OnBackBtn(_btn) {
    this.DoBack$v();
  }

  SaveConfig(fForce, fKeepOpen) {
    if (this.fConfigSaved) {
      return true;
    }
    if (!fForce) {
      let strError = new $.StdCopyStrBuf().init$pi8$b($.LoadResStr(S("IDS_ERR_CONFIG")));
      if (this.pPortCfgTCP.GetPort() > 0 && this.pPortCfgTCP.GetPort() === this.pPortCfgRef.GetPort()) {
        this.GetScreen().ShowMessage($.LoadResStr(S("IDS_NET_ERR_PORT_TCPREF")), strError.getData(), 11 /*Ico_Error*/);
        return false;
      }
      if (this.pPortCfgUDP.GetPort() > 0 && this.pPortCfgUDP.GetPort() === this.pPortCfgDsc.GetPort()) {
        this.GetScreen().ShowMessage($.LoadResStr(S("IDS_NET_ERR_PORT_UDPDISC")), strError.getData(), 11 /*Ico_Error*/);
        return false;
      }
    }
    this.pPortCfgTCP.SavePort();
    this.pPortCfgUDP.SavePort();
    this.pPortCfgRef.SavePort();
    this.pPortCfgDsc.SavePort();
    this.pLeagueServerCfg.Save2Config();
    this.pModDatabaseServerCfg.Save2Config();
    this.pNetworkNickEdit.Save2Config();
    let szRegNick = $.Config.GetRegistrationData(S("Nick"));
    if ($.SEqual($.Config.Network.Nick.getData(), szRegNick)) {
      $.Config.Network.Nick.Clear();
    }
    $.Config.Save();
    if (!fKeepOpen) {
      this.fConfigSaved = true;
    }
    return true;
  }

  DoBack$v() {
    if (!this.SaveConfig(false, false)) {
      return;
    }
    $.C4Startup.Get().SwitchDialog(this.fCanGoBack ? 9 : 0);
  }

  SetSubscreen(szToScreen) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4StartupOptionsDlg && C4StartupOptionsDlg.prototype instanceof $c) return $c.prototype.SetSubscreen.apply(this, arguments); }
    const page_names = [
  S("general"),
  S("graphics"),
  S("sound"),
  S("controls"),
  S("network"),
  null,
];
    let i = 0;
    while (page_names[i] != null) {
      if ($.SEqualNoCase(szToScreen, page_names[i])) {
        break;
      }
      i = i + 1 | 0;
    }
    if (page_names[i] == null) {
      return false;
    }
    this.pOptionsTabular.SelectSheet$i32$b(i, false);
    return true;
  }

  OnKeyboardLayoutChanged() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4StartupOptionsDlg && C4StartupOptionsDlg.prototype instanceof $c) return $c.prototype.OnKeyboardLayoutChanged.apply(this, arguments); }
    this.pControlConfigArea.UpdateCtrlSet();
  }

  RecreateDialog(fFade) {
    fFade = true;
    let iPage = this.pOptionsTabular.GetActiveSheetIndex();
    let pNewDlg = $.C4Startup.Get().SwitchDialog(4 /*SDID_Options*/, fFade);
    pNewDlg.pOptionsTabular.SelectSheet$i32$b(iPage, false);
    pNewDlg.fCanGoBack = false;
  }

  OnLangComboFill(pFiller) {
    let pNfo = null;
    for (let i = 0; i < $.Languages.GetInfoCount(); i = i + 1 | 0) {
      if ((pNfo = $.Languages.GetInfo(i)) != null) {
        pFiller.AddEntry($.FormatString(S("%s - %s"), P(pNfo.Code, 0), P(pNfo.Name, 0)).getData(), (pNfo.Code[0] & 0xff) + ((pNfo.Code[1] & 0xff) << 8 | 0) | 0);
      }
    }
  }

  OnLangComboSelChange(_pForCombo, idNewSelection) {
    $.Config.General.Language[0] = (idNewSelection & 255) << 24 >> 24;
    $.Config.General.Language[1] = ((idNewSelection & 65280) >> 8) << 24 >> 24;
    $.Config.General.Language[2] = 0;
    this.UpdateLanguage();
    $.Languages.LoadLanguage(P($.Config.General.LanguageEx, 0));
    $.Game.UpdateLanguage();
    this.RecreateDialog(true);
    return true;
  }

  UpdateLanguage() {
    let pNfo = $.Languages.FindInfo(P($.Config.General.Language, 0));
    if (pNfo != null) {
      this.pLangCombo.SetText$pi8($.FormatString(S("%s - %s"), P(pNfo.Code, 0), P(pNfo.Name, 0)).getData());
      this.pLangInfoLabel.SetText$pi8$b(P(pNfo.Info, 0));
    } else {
      this.pLangCombo.SetText$pi8($.FormatString(S("unknown (%s)"), P($.Config.General.Language, 0)).getData());
      this.pLangInfoLabel.SetText$pi8$b($.LoadResStr(S("IDS_CTL_NOLANGINFO")));
      return;
    }
    let szLang = P($.Config.General.LanguageEx, 0);
    $.SCopy$pi8$pi8(P(pNfo.Code, 0), szLang);
    if ($rd(P(pNfo.Fallback, 0)) !== 0) {
      $.SAppend(S(","), szLang);
      $.C4ConfigGeneral.GetLanguageSequence(P(pNfo.Fallback, 0), $padd(szLang, $.SLen(szLang)));
    }
    if (!($.SSearch(P($.Config.General.LanguageEx, 0), S("US")) != null)) {
      if (szLang.a[szLang.o] !== 0) {
        $.SAppendChar(44, szLang);
      }
      $.SAppend(S("US"), szLang);
    }
    if (!($.SSearch(P($.Config.General.LanguageEx, 0), S("DE")) != null)) {
      if (szLang.a[szLang.o] !== 0) {
        $.SAppendChar(44, szLang);
      }
      $.SAppend(S("DE"), szLang);
    }
  }

  OnFontFaceComboFill(pFiller) {
    for (let i = 0; $.DefaultFonts[i] != null; i = i + 1 | 0) {
      pFiller.AddEntry($.DefaultFonts[i], i);
    }
  }

  OnFontSizeComboFill(pFiller) {
    pFiller.AddEntry(S("10"), 10);
    pFiller.AddEntry(S("12"), 12);
    pFiller.AddEntry(S("14"), 14);
    pFiller.AddEntry(S("16"), 16);
    pFiller.AddEntry(S("18"), 18);
    pFiller.AddEntry(S("20"), 20);
    pFiller.AddEntry(S("22"), 22);
    pFiller.AddEntry(S("24"), 24);
    pFiller.AddEntry(S("26"), 26);
    pFiller.AddEntry(S("28"), 28);
  }

  OnFontComboSelChange(pForCombo, idNewSelection) {
    let szNewFontFace = P($.Config.General.RXFontName, 0);
    let iNewFontSize = $.Config.General.RXFontSize;
    if (pForCombo === this.pFontFaceCombo) {
      szNewFontFace = $.DefaultFonts[idNewSelection];
    } else if (pForCombo === this.pFontSizeCombo) {
      iNewFontSize = idNewSelection;
    } else {
      return true;
    }
    if (!$.Application.SetGameFont(szNewFontFace, iNewFontSize)) {
      this.GetScreen().ShowErrorMessage($.LoadResStr(S("IDS_ERR_INITFONTS")));
      return true;
    }
    this.RecreateDialog(true);
    return true;
  }

  UpdateFontControls() {
    this.pFontFaceCombo.SetText$pi8(P($.Config.General.RXFontName, 0));
    let sSize = new $.StdStrBuf();
    sSize.Format(S("%d"), $.Config.General.RXFontSize);
    this.pFontSizeCombo.SetText$pi8(sSize.getData());
  }

  *OnResetConfigBtn(_btn) {
    let sWarningText = new $.StdStrBuf();
    sWarningText.Copy$pi8($.LoadResStr(S("IDS_MSG_PROMPTRESETCONFIG")));
    sWarningText.AppendChar(124);
    sWarningText.Append$pi8($.LoadResStr(S("IDS_MSG_RESTARTCHANGECFG")));
    if (!(yield* this.GetScreen().ShowMessageModal(sWarningText.getData(), $.LoadResStr(S("IDS_BTN_RESETCONFIG")), 12, 1 /*Ico_Notify*/))) {
      return;
    }
    $.Config.Default();
    $.Config.ConfigLoaded = true;
    $.Application.Quit$v();
  }

  OnWindowedModeComboFill(pFiller) {
    pFiller.ClearEntries();
    for (let i = 0; i < 3; i = i + 1 | 0) {
      pFiller.AddEntry(this.GetWindowedName(i), i);
    }
  }

  OnWindowedModeComboSelChange(pForCombo, idNewSelection) {
    $.Config.Graphics.Windowed = idNewSelection;
    $.Application.SetVideoMode($.Config.Graphics.ResX, $.Config.Graphics.ResY, $.Config.Graphics.RefreshRate >>> 0, $.Config.Graphics.Monitor >>> 0, $.Config.Graphics.Windowed === 0);
    pForCombo.SetText$pi8(this.GetWindowedName(idNewSelection));
    return true;
  }

  OnGfxResComboFill(pFiller) {
    let $t1;
    pFiller.ClearEntries();
    pFiller.AddEntry($.LoadResStr(S("IDS_MNU_DEFAULTRESOLUTION")), -1);
    let idx = 0;
    const iXRes = [0];
    const iYRes = [0];
    const iBitDepth = [0];
    const iRefreshRate = [0];
    while ($.Application.GetIndexedDisplayMode(($t1 = idx, idx = idx + 1 | 0, $t1), P(iXRes, 0), P(iYRes, 0), P(iBitDepth, 0), P(iRefreshRate, 0), $.Config.Graphics.Monitor >>> 0)) {
      let sGfxString = this.GetGfxResString(iXRes[0], iYRes[0]);
      if (!pFiller.FindEntry(sGfxString.getData())) {
        pFiller.AddEntry(sGfxString.getData(), ((iXRes[0] >>> 0) + ((iYRes[0] >>> 0 << 12) >>> 0) >>> 0) + ((iRefreshRate[0] >>> 0 << 24) >>> 0) >>> 0 | 0);
      }
    }
  }

  *OnGfxResComboSelChange(_pForCombo, idNewSelection) {
    let iResX = idNewSelection & 4095;
    let iResY = (idNewSelection >>> 0 >>> 12 & 4095) >>> 0 | 0;
    let iRefreshRate = (idNewSelection >>> 0 >>> 24 & 255) >>> 0 | 0;
    if (idNewSelection === -1) {
      iResX = iResY = -1;
      iRefreshRate = 0;
    }
    if (iResX === $.Config.Graphics.ResX && iResY === $.Config.Graphics.ResY && iRefreshRate === $.Config.Graphics.RefreshRate) {
      return true;
    }
    if (!(yield* this.TryNewResolution(iResX, iResY, iRefreshRate))) {
      return true;
    }
    return true;
  }

  OnGfxMSComboFill(pFiller) {
    pFiller.ClearEntries();
    pFiller.AddEntry(S("Off"), 0);
    let multisamples = [];
    $.Application.pWindow.EnumerateMultiSamples(multisamples);
    std_sort($begin(multisamples), $end(multisamples));
    for (const multisample of multisamples) {
      let text = new $.StdStrBuf();
      text.Format(S("%dx"), multisample);
      pFiller.AddEntry(text.getData(), multisample);
    }
  }

  OnGfxMSComboSelChange(_pForCombo, idNewSelection) {
    if ($.pTexMgr != null) {
      $.pTexMgr.IntLock();
    }
    $.pDraw.InvalidateDeviceObjects();
    if ($.pGL != null) {
      $.pGL.pMainCtx.Clear(true);
    }
    let PrevMultiSampling = $.Config.Graphics.MultiSampling;
    $.Config.Graphics.MultiSampling = idNewSelection;
    let success = $.Application.pWindow.ReInit($.Application);
    if ($.pGL != null) {
      $.pGL.pMainCtx.Init($.Application.pWindow, $.Application);
    }
    $.pDraw.RestoreDeviceObjects();
    if ($.pGL != null) {
      $.pGL.InitShaders($.GraphicsResource.Files);
    }
    if ($.pTexMgr != null) {
      $.pTexMgr.IntUnlock();
    }
    if (!success) {
      $.Config.Graphics.MultiSampling = PrevMultiSampling;
    }
    return !success;
  }

  *TryNewResolution(iResX, iResY, iRefreshRate) {
    let iOldResX = $.Config.Graphics.ResX;
    let iOldResY = $.Config.Graphics.ResY;
    let iOldRefreshRate = $.Config.Graphics.RefreshRate;
    let iOldFontSize = $.Config.General.RXFontSize;
    let pScreen = this.GetScreen();
    let iNewFontSize = 14;
    if (iResY >= 0 && iResY < 600) {
      iNewFontSize = 12;
    } else if (iResY > 800) {
      iNewFontSize = 16;
    }
    if (!$.Application.SetVideoMode(iResX, iResY, iRefreshRate >>> 0, $.Config.Graphics.Monitor >>> 0, $.Config.Graphics.Windowed === 0)) {
      let strChRes = new $.StdCopyStrBuf().init$pi8$b($.LoadResStr(S("IDS_MNU_SWITCHRESOLUTION")));
      pScreen.ShowMessage($.FormatString($.LoadResStr(S("IDS_ERR_SWITCHRES")), $.Application.GetLastError()).getData(), strChRes.getData(), 0 /*Ico_Clonk*/, null);
      return false;
    }
    if (iNewFontSize !== iOldFontSize) {
      if (!$.Application.SetGameFont(P($.Config.General.RXFontName, 0), iNewFontSize)) {
        iNewFontSize = iOldFontSize;
      }
    }
    $.Config.Graphics.ResX = iResX;
    $.Config.Graphics.ResY = iResY;
    $.Config.Graphics.RefreshRate = iRefreshRate;
    this.RecreateDialog(false);
    $.Config.Graphics.ResX = iOldResX;
    $.Config.Graphics.ResY = iOldResY;
    $.Config.Graphics.RefreshRate = iOldRefreshRate;
    let pConfirmDlg = new C4StartupOptionsDlg$ResChangeConfirmDlg().init();
    if (!(yield* pScreen.ShowModalDlg(pConfirmDlg, true))) {
      if ($.Application.SetVideoMode(iOldResX, iOldResY, iOldRefreshRate >>> 0, $.Config.Graphics.Monitor >>> 0, $.Config.Graphics.Windowed === 0)) {
        if (iNewFontSize !== iOldFontSize) {
          $.Application.SetGameFont(P($.Config.General.RXFontName, 0), iOldFontSize);
        }
        this.RecreateDialog(false);
      }
      return false;
    }
    $.Config.Graphics.ResX = iResX;
    $.Config.Graphics.ResY = iResY;
    $.Config.Graphics.RefreshRate = iRefreshRate;
    if ($.Config.Graphics.Windowed !== 0) {
      $.Application.SetVideoMode($.Application.GetConfigWidth(), $.Application.GetConfigHeight(), $.Config.Graphics.RefreshRate >>> 0, $.Config.Graphics.Monitor >>> 0, false);
    }
    return true;
  }

  GetGfxResString(iResX, iResY) {
    if (iResX === -1) {
      return new $.StdStrBuf().init$pi8$b($.LoadResStr(S("IDS_MNU_DEFAULTRESOLUTION")));
    }
    return $.FormatString(S("%d x %d"), iResX, iResY);
  }

  GetWindowedName(mode = -1) {
    if (mode === -1) {
      mode = $.Config.Graphics.Windowed;
    }
    if (mode === 0) {
      return $.LoadResStr(S("IDS_MSG_FULLSCREEN"));
    } else if (mode === 1) {
      return $.LoadResStr(S("IDS_MSG_WINDOWED"));
    } else if (mode === 2) {
      return $.LoadResStr(S("IDS_MSG_AUTOWINDOWED"));
    }
    0;
    return S("ERR: Unknown");
  }

  OnFEMusicCheck(pCheckBox) {
    let fIsOn = pCheckBox.GetChecked();
    if (($.Config.Sound.FEMusic = fIsOn ? 1 : 0) !== 0) {
      $.Application.MusicSystem.Play$pi8$b$i32$f64$b();
    } else {
      $.Application.MusicSystem.Stop();
    }
  }

  OnRXSoundCheck(pCheckBox) {
    let fIsOn = pCheckBox.GetChecked();
    if ((fIsOn ? 1 : 0) === (!($.Config.Sound.RXSound === 0) ? 1 : 0)) {
      return;
    }
    if (fIsOn) {
      $.Config.Sound.RXSound = 1;
      if (!$.Application.SoundSystem.Init()) {
        this.GetScreen().ShowMessage(new $.StdCopyStrBuf().init$pi8$b($.LoadResStr(S("IDS_PRC_NOSND"))).getData(), new $.StdCopyStrBuf().init$pi8$b($.LoadResStr(S("IDS_DLG_LOG"))).getData(), 11 /*Ico_Error*/);
        $.Application.SoundSystem.Clear();
        $.Config.Sound.RXSound = 0;
        pCheckBox.SetChecked(false);
        fIsOn = false;
      }
    } else {
      $.Application.SoundSystem.Clear();
      $.Config.Sound.RXSound = 0;
    }
    this.pFESoundCheck.SetEnabled(fIsOn);
    this.pFESoundCheck.SetChecked(fIsOn ? !($.Config.Sound.FESamples === 0) : false);
  }

  OnMusicVolumeSliderChange(iNewVal) {
    $.Config.Sound.MusicVolume = iNewVal;
    $.Application.MusicSystem.UpdateVolume();
  }

  OnSoundVolumeSliderChange(iNewVal) {
    $.Config.Sound.SoundVolume = iNewVal;
    $.StartSoundEffect(S("Objects::Arrow::HitGround"), false, 100, null);
  }

  KeyMusicToggle() {
    $.Application.MusicSystem.ToggleOnOff();
    this.pFEMusicCheck.SetChecked(!($.Config.Sound.FEMusic === 0));
    return true;
  }

  $clone() { return new C4StartupOptionsDlg().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pKeyBack = o.pKeyBack;
    this.fConfigSaved = o.fConfigSaved;
    this.fCanGoBack = o.fCanGoBack;
    this.pOptionsTabular = o.pOptionsTabular;
    this.pLangCombo = o.pLangCombo;
    this.pLangInfoLabel = o.pLangInfoLabel;
    this.pFontFaceCombo = o.pFontFaceCombo;
    this.pFontSizeCombo = o.pFontSizeCombo;
    this.pNetworkNickEdit = o.pNetworkNickEdit;
    this.iGfxTexIndent = o.iGfxTexIndent;
    this.pKeyToggleMusic = o.pKeyToggleMusic;
    this.pFESoundCheck = o.pFESoundCheck;
    this.pFEMusicCheck = o.pFEMusicCheck;
    this.pControlConfigArea = o.pControlConfigArea;
    this.GamePadCon = o.GamePadCon;
    this.pPortCfgTCP = o.pPortCfgTCP;
    this.pPortCfgUDP = o.pPortCfgUDP;
    this.pPortCfgRef = o.pPortCfgRef;
    this.pPortCfgDsc = o.pPortCfgDsc;
    this.pLeagueServerCfg = o.pLeagueServerCfg;
    this.pModDatabaseServerCfg = o.pModDatabaseServerCfg;
    return this;
  }
}


export function $init(): void {
  $mixin(C4StartupOptionsDlg$ResChangeConfirmDlg, $.C4ApplicationSec1Timer);
  $.DefaultFonts = [S("Endeavour"), null];
}

Object.assign($, { C4StartupOptionsDlg, C4StartupOptionsDlg$BoolConfig, C4StartupOptionsDlg$ControlConfigArea, C4StartupOptionsDlg$ControlConfigListBox, C4StartupOptionsDlg$ControlConfigListBox$ControlAssignmentLabel, C4StartupOptionsDlg$ControlConfigListBox$ListItem, C4StartupOptionsDlg$EditConfig, C4StartupOptionsDlg$KeySelDialog, C4StartupOptionsDlg$NetworkModDatabaseServerAddressConfig, C4StartupOptionsDlg$NetworkPortConfig, C4StartupOptionsDlg$NetworkServerAddressConfig, C4StartupOptionsDlg$ResChangeConfirmDlg, C4StartupOptionsDlg$SmallButton, CallbackButton$C4StartupOptionsDlg$SmallButton });
