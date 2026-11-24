// @ts-nocheck
// OpenClonk 36de799: src/gui/C4GameOptions.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { Control, ListBox } from './C4Gui.ts';
import { c$atoi } from '../../rt/libc.ts';
import { P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete, $min, $mixin } from '../../rt/std.ts';

export class C4GameOptionsList$Option extends Control {
  pForDlg = null;
  pPrimarySubcomponent = null;

  IsFocused(pCtrl) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4GameOptionsList$Option && C4GameOptionsList$Option.prototype instanceof $c) return $c.prototype.IsFocused.apply(this, arguments); }
    return $.Container.prototype.IsFocused.call(this, pCtrl) || this.HasFocus() && this.pPrimarySubcomponent === pCtrl;
  }

  init(pForDlg) {
    super.init(new $.C4Rect().init$i32$i32$i32$i32(0, 0, 0, 0));
    this.pForDlg = pForDlg;
    this.pPrimarySubcomponent = null;
    this.$dyn = C4GameOptionsList$Option;
    return this;
  }

  InitOption(pForDlg) {
    pForDlg.AddElement$pElement$i32(this);
    this.Update$v();
  }

  Update$v() {
  }

  GetNext$v() {
    return $.Element.prototype.GetNext$v$c.call(this);
  }

  $clone() { return new C4GameOptionsList$Option().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pForDlg = o.pForDlg;
    this.pPrimarySubcomponent = o.pPrimarySubcomponent;
    return this;
  }
}

export class C4GameOptionsList extends ListBox {
  source = 0;
  param_defs = null;
  params = null;
  tLastTimer = new $.C4TimeMilliseconds();
  iDelay = 0;
  scheduler = null;

  init(rcBounds, fActive, source, param_defs = null, params = null) {
    super.init(rcBounds);
    $.C4ApplicationSec1Timer.prototype.init.call(this);
    this.source = source;
    this.param_defs = param_defs;
    this.params = params;
    this.$dyn = C4GameOptionsList;
    if (!C4GameOptionsList.prototype.IsPreGame.call(this)) {
      if (this.param_defs == null) {
        this.param_defs = $.Game.ScenarioParameterDefs;
      }
      if (this.params == null) {
        this.params = $.Game.Parameters.ScenarioParameters;
      }
    }
    C4GameOptionsList.prototype.InitOptions.call(this);
    if (fActive) {
      C4GameOptionsList.prototype.Activate.call(this);
    }
    return this;
  }

  $dtor() {
    C4GameOptionsList.prototype.Deactivate.call(this);
    super.$dtor();
  }

  InitOptions() {
    let $t1;
    if (this.param_defs != null) {
      let idx = 0;
      let def = null;
      while ((def = this.param_defs.GetParameterDefByIndex(($t1 = idx, idx = idx + 1, $t1))) != null) {
        if (!def.IsAchievement()) {
          new C4GameOptionsList$OptionScenarioParameter().init(this, def);
        }
      }
    }
    if (!this.IsPreGame()) {
      new C4GameOptionsList$OptionControlMode().init(this);
      new C4GameOptionsList$OptionControlRate().init(this);
      if ($.Network.isHost()) {
        new C4GameOptionsList$OptionRuntimeJoin().init(this);
      }
      if (!this.IsRuntime()) {
        if ($.Game.Teams.HasTeamDistOptions()) {
          new C4GameOptionsList$OptionTeamDist().init(this);
        }
        if ($.Game.Teams.IsMultiTeams()) {
          new C4GameOptionsList$OptionTeamColors().init(this);
        }
      }
    }
  }

  ClearOptions() {
    let pFirst = null;
    while ((pFirst = this.GetFirst()) != null) {
      $delete(pFirst);
    }
  }

  Update$v() {
    for (let pItem = $.Container.prototype.GetFirst.call(this.pClientWindow); pItem != null; pItem = pItem.GetNext$v()) {
      pItem.Update$v();
    }
  }

  OnSec1Timer() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4GameOptionsList && C4GameOptionsList.prototype instanceof $c) return $c.prototype.OnSec1Timer.apply(this, arguments); }
    this.Update$v();
  }

  SetParameters(param_defs, params) {
    this.ClearOptions();
    this.param_defs = param_defs;
    this.params = params;
    this.InitOptions();
  }

  Activate() {
    $.StdScheduler.prototype.Add$pStdSchedulerProc.call($.Application, this);
    this.Update$v();
  }

  Deactivate() {
    $.StdScheduler.prototype.Remove.call($.Application, this);
  }

  IsRuntime() {
    return this.source === 3;
  }

  IsTabular() {
    return this.IsRuntime() || this.IsPreGame();
  }

  IsPreGame() {
    return this.source === 0 || this.source === 1;
  }

  IsPreGameSingle() {
    return this.source === 0;
  }

  GetParameters() {
    return this.params;
  }

  $clone() { return new C4GameOptionsList().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.source = o.source;
    this.param_defs = o.param_defs;
    this.params = o.params;
    this.tLastTimer.$assign(o.tLastTimer);
    this.iDelay = o.iDelay;
    this.scheduler = o.scheduler;
    return this;
  }
}

export class C4GameOptionsList$OptionDropdown extends C4GameOptionsList$Option {
  pCaption = null;
  pDropdownList = null;
  fReadOnly = false;

  init(pForDlg, szCaption, fReadOnly) {
    super.init(pForDlg);
    this.fReadOnly = fReadOnly;
    this.$dyn = C4GameOptionsList$OptionDropdown;
    let fIsPreGame = pForDlg.IsPreGame();
    const rUseFont = fIsPreGame ? $.C4Startup.Get().Graphics.BookFont : $.GraphicsResource.TextFont;
    let dwFontClr = fIsPreGame ? 0xff000000 : 0xffffffff;
    let fTabular = pForDlg.IsTabular();
    const iCaptWidth = [0];
    const iCaptHeight = [0];
    if (fTabular) {
      rUseFont.GetTextExtent($.LoadResStr(S("IDS_NET_RUNTIMEJOIN")), P(iCaptWidth, 0), P(iCaptHeight, 0), true);
      if (pForDlg.IsPreGame()) {
        iCaptWidth[0] = Math.imul(pForDlg.GetItemWidth(), 1) / 3 | 0;
      } else {
        iCaptWidth[0] = Math.imul(iCaptWidth[0], 5) / 4 | 0;
      }
    } else {
      rUseFont.GetTextExtent(szCaption, P(iCaptWidth, 0), P(iCaptHeight, 0), true);
    }
    let iHorizontalMargin = 1;
    let iVerticalMargin = 1;
    let iComboMargin = 5;
    let iSelComboHgt = $.ComboBox.GetDefaultHeight$v();
    this.SetBounds(new $.C4Rect().init$i32$i32$i32$i32(0, 0, pForDlg.GetItemWidth(), (Math.imul(!fTabular ? 1 : 0, iCaptHeight[0] + Math.imul(iVerticalMargin, 2) | 0) + Math.imul(iVerticalMargin, 2) | 0) + iSelComboHgt | 0));
    let ca = new $.ComponentAligner().init(this.GetContainedClientRect(), iHorizontalMargin, iVerticalMargin);
    $.Container.prototype.AddElement$pElement.call(this, this.pCaption = new $.Label().init$pi8$C4Rect$i32$u32$pCStdFont$b$b$b($.FormatString(S("%s:"), szCaption).getData(), fTabular ? ca.GetFromLeft$i32$i32(iCaptWidth[0], iCaptHeight[0]) : ca.GetFromTop$i32$i32(iCaptHeight[0]), 0, dwFontClr, rUseFont, false, false));
    ca.ExpandLeft(-iComboMargin | 0);
    $.Container.prototype.AddElement$pElement.call(this, this.pPrimarySubcomponent = this.pDropdownList = new $.ComboBox().init(ca.GetAll$v()));
    this.pDropdownList.SetReadOnly(fReadOnly);
    this.pDropdownList.SetComboCB(new $.ComboBox_FillCallback$OptionDropdown().init(this, "OnDropdownFill", "OnDropdownSelChange"));
    if (fIsPreGame) {
      this.pDropdownList.SetColors(0xff000000, 0, 0xffa4947a);
      this.pDropdownList.SetFont$pCStdFont(rUseFont);
      this.pDropdownList.SetDecoration$pC4Facet($.C4Startup.Get().Graphics.fctContext);
    }
    this.InitOption(pForDlg);
    return this;
  }

  OnDropdownFill(pFiller) {
    this.DoDropdownFill(pFiller);
  }

  OnDropdownSelChange(_pForCombo, idNewSelection) {
    this.DoDropdownSelChange(idNewSelection);
    this.Update$v();
    return true;
  }

  $clone() { return new C4GameOptionsList$OptionDropdown().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pCaption = o.pCaption;
    this.pDropdownList = o.pDropdownList;
    this.fReadOnly = o.fReadOnly;
    return this;
  }
}

export class C4GameOptionsList$OptionScenarioParameter extends C4GameOptionsList$OptionDropdown {
  ParameterDef = null;
  LastValue = 0;
  LastValueValid = false;

  init(pForDlg, parameter_def) {
    super.init(pForDlg, parameter_def.GetName(), !pForDlg.IsPreGame() && (!$.Control$2.isCtrlHost() || $.Game.C4S.Head.SaveGame));
    this.ParameterDef = parameter_def;
    this.LastValue = 0;
    this.LastValueValid = false;
    this.$dyn = C4GameOptionsList$OptionScenarioParameter;
    this.SetToolTip(parameter_def.GetDescription());
    return this;
  }

  DoDropdownFill(pFiller) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4GameOptionsList$OptionScenarioParameter && C4GameOptionsList$OptionScenarioParameter.prototype instanceof $c) return $c.prototype.DoDropdownFill.apply(this, arguments); }
    let $t1;
    let idx = 0;
    let option = null;
    while ((option = this.ParameterDef.GetOptionByIndex(($t1 = idx, idx = idx + 1, $t1))) != null) {
      pFiller.AddEntry(option.Name.getData(), option.Value);
    }
  }

  DoDropdownSelChange(idNewSelection) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4GameOptionsList$OptionScenarioParameter && C4GameOptionsList$OptionScenarioParameter.prototype instanceof $c) return $c.prototype.DoDropdownSelChange.apply(this, arguments); }
    if (!this.pForDlg.IsPreGame()) {
      if (!$.Control$2.isCtrlHost()) {
        return;
      }
      let pck = new $.C4PacketSetScenarioParameter().init$pi8$i32(this.ParameterDef.GetID(), idNewSelection);
      $.Network.Clients.BroadcastMsgToClients($.MkC4NetIOPacket(33, pck));
    }
    this.pForDlg.GetParameters().SetValue(this.ParameterDef.GetID(), idNewSelection, false);
    if (this.pForDlg.IsPreGame()) {
      this.Update$v();
    }
  }

  Update$v() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4GameOptionsList$OptionScenarioParameter && C4GameOptionsList$OptionScenarioParameter.prototype instanceof $c) return $c.prototype.Update$v.apply(this, arguments); }
    let val = 0;
    let fLeagueReadOnly = false;
    if ($.Config.Network.LeagueServerSignUp !== 0 && !this.fReadOnly && !this.pForDlg.IsPreGameSingle()) {
      val = this.ParameterDef.GetLeagueValue();
    }
    if (val !== 0) {
      fLeagueReadOnly = true;
    } else {
      val = this.pForDlg.GetParameters().GetValueByID(this.ParameterDef.GetID(), this.ParameterDef.GetDefault());
    }
    if (!this.fReadOnly) {
      this.pDropdownList.SetReadOnly(fLeagueReadOnly);
    }
    if (this.LastValueValid && val === this.LastValue) {
      return;
    }
    let option = this.ParameterDef.GetOptionByValue(val);
    if (option != null) {
      this.pDropdownList.SetText$pi8(option.Name.getData());
    } else {
      this.pDropdownList.SetText$pi8($.FormatString(S("%d"), val).getData());
    }
    this.LastValueValid = true;
    this.LastValue = val;
  }

  $clone() { return new C4GameOptionsList$OptionScenarioParameter().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.ParameterDef = o.ParameterDef;
    this.LastValue = o.LastValue;
    this.LastValueValid = o.LastValueValid;
    return this;
  }
}

export class C4GameOptionsList$OptionControlMode extends C4GameOptionsList$OptionDropdown {

  init(pForDlg) {
    super.init(pForDlg, $.LoadResStr(S("IDS_TEXT_CONTROLMODE")), !$.Control$2.isCtrlHost() || !$.Control$2.isNetwork() || !$.Control$2.Network.IsEnabled());
    this.$dyn = C4GameOptionsList$OptionControlMode;
    this.SetToolTip($.LoadResStr(S("IDS_DESC_CHANGESTHEWAYCONTROLDATAI")));
    return this;
  }

  DoDropdownFill(pFiller) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4GameOptionsList$OptionControlMode && C4GameOptionsList$OptionControlMode.prototype instanceof $c) return $c.prototype.DoDropdownFill.apply(this, arguments); }
    if (!$.Control$2.isNetwork() || !$.Control$2.Network.IsEnabled() || !$.Control$2.isCtrlHost()) {
      return;
    }
    pFiller.AddEntry($.LoadResStr(S("IDS_NET_CTRLMODE_CENTRAL")), 1);
    pFiller.AddEntry($.LoadResStr(S("IDS_NET_CTRLMODE_DECENTRAL")), 0);
  }

  DoDropdownSelChange(idNewSelection) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4GameOptionsList$OptionControlMode && C4GameOptionsList$OptionControlMode.prototype instanceof $c) return $c.prototype.DoDropdownSelChange.apply(this, arguments); }
    if (!$.Control$2.isNetwork() || !$.Control$2.Network.IsEnabled() || !$.Control$2.isCtrlHost()) {
      return;
    }
    $.Network.SetCtrlMode(idNewSelection);
    this.Update$v();
  }

  Update$v() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4GameOptionsList$OptionControlMode && C4GameOptionsList$OptionControlMode.prototype instanceof $c) return $c.prototype.Update$v.apply(this, arguments); }
    let szControlMode = null;
    if (!$.Control$2.isNetwork() || !$.Control$2.Network.IsEnabled()) {
      szControlMode = $.LoadResStr(S("IDS_NET_NONET"));
    } else {
      switch ($.Network.Status.getCtrlMode()) {
        case 1:
          szControlMode = $.LoadResStr(S("IDS_NET_CTRLMODE_CENTRAL"));
          break;
        case 0:
          szControlMode = $.LoadResStr(S("IDS_NET_CTRLMODE_DECENTRAL"));
          break;
        default:
          szControlMode = $.LoadResStr(S("IDS_NET_CTRLMODE_NONE"));
          break;
      }
    }
    this.pDropdownList.SetText$pi8(szControlMode);
  }

  $clone() { return new C4GameOptionsList$OptionControlMode().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class C4GameOptionsList$OptionControlRate extends C4GameOptionsList$OptionDropdown {

  init(pForDlg) {
    super.init(pForDlg, $.LoadResStr(S("IDS_CTL_CONTROLRATE")), !$.Control$2.isCtrlHost());
    this.$dyn = C4GameOptionsList$OptionControlRate;
    this.SetToolTip($.LoadResStr(S("IDS_CTL_CONTROLRATE_DESC")));
    return this;
  }

  DoDropdownFill(pFiller) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4GameOptionsList$OptionControlRate && C4GameOptionsList$OptionControlRate.prototype instanceof $c) return $c.prototype.DoDropdownFill.apply(this, arguments); }
    for (let i = 1; i < $min($.C4MaxControlRate$C4Constants, 10); i = i + 1 | 0) {
      pFiller.AddEntry($.FormatString(S("%d"), i).getData(), i);
    }
  }

  DoDropdownSelChange(idNewSelection) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4GameOptionsList$OptionControlRate && C4GameOptionsList$OptionControlRate.prototype instanceof $c) return $c.prototype.DoDropdownSelChange.apply(this, arguments); }
    let iNewRate = idNewSelection;
    if (iNewRate === 0 || iNewRate === $.Control$2.ControlRate) {
      return;
    }
    $.Control$2.AdjustControlRate(iNewRate - $.Control$2.ControlRate | 0);
  }

  Update$v() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4GameOptionsList$OptionControlRate && C4GameOptionsList$OptionControlRate.prototype instanceof $c) return $c.prototype.Update$v.apply(this, arguments); }
    if (c$atoi(this.pDropdownList.GetText$v().getData()) === $.Control$2.ControlRate) {
      return;
    }
    this.pDropdownList.SetText$pi8($.FormatString(S("%d"), $.Control$2.ControlRate).getData());
  }

  $clone() { return new C4GameOptionsList$OptionControlRate().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class C4GameOptionsList$OptionTeamDist extends C4GameOptionsList$OptionDropdown {

  init(pForDlg) {
    super.init(pForDlg, $.LoadResStr(S("IDS_MSG_TEAMDIST")), !$.Control$2.isCtrlHost());
    this.$dyn = C4GameOptionsList$OptionTeamDist;
    this.SetToolTip($.LoadResStr(S("IDS_MSG_TEAMDIST_DESC")));
    return this;
  }

  DoDropdownFill(pFiller) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4GameOptionsList$OptionTeamDist && C4GameOptionsList$OptionTeamDist.prototype instanceof $c) return $c.prototype.DoDropdownFill.apply(this, arguments); }
    $.Game.Teams.FillTeamDistOptions(pFiller);
  }

  DoDropdownSelChange(idNewSelection) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4GameOptionsList$OptionTeamDist && C4GameOptionsList$OptionTeamDist.prototype instanceof $c) return $c.prototype.DoDropdownSelChange.apply(this, arguments); }
    $.Game.Teams.SendSetTeamDist(idNewSelection);
  }

  Update$v() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4GameOptionsList$OptionTeamDist && C4GameOptionsList$OptionTeamDist.prototype instanceof $c) return $c.prototype.Update$v.apply(this, arguments); }
    let sOption = new $.StdStrBuf();
    sOption.Take$mStdStrBuf($.Game.Teams.GetTeamDistString());
    this.pDropdownList.SetText$pi8(sOption.getData());
  }

  $clone() { return new C4GameOptionsList$OptionTeamDist().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class C4GameOptionsList$OptionTeamColors extends C4GameOptionsList$OptionDropdown {

  init(pForDlg) {
    super.init(pForDlg, $.LoadResStr(S("IDS_MSG_TEAMCOLORS")), !$.Control$2.isCtrlHost());
    this.$dyn = C4GameOptionsList$OptionTeamColors;
    this.SetToolTip($.LoadResStr(S("IDS_MSG_TEAMCOLORS_DESC")));
    return this;
  }

  DoDropdownFill(pFiller) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4GameOptionsList$OptionTeamColors && C4GameOptionsList$OptionTeamColors.prototype instanceof $c) return $c.prototype.DoDropdownFill.apply(this, arguments); }
    pFiller.AddEntry($.LoadResStr(S("IDS_MSG_ENABLED")), 1);
    pFiller.AddEntry($.LoadResStr(S("IDS_MSG_DISABLED")), 0);
  }

  DoDropdownSelChange(idNewSelection) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4GameOptionsList$OptionTeamColors && C4GameOptionsList$OptionTeamColors.prototype instanceof $c) return $c.prototype.DoDropdownSelChange.apply(this, arguments); }
    let fEnabled = !(idNewSelection === 0);
    $.Game.Teams.SendSetTeamColors(fEnabled);
  }

  Update$v() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4GameOptionsList$OptionTeamColors && C4GameOptionsList$OptionTeamColors.prototype instanceof $c) return $c.prototype.Update$v.apply(this, arguments); }
    this.pDropdownList.SetText$pi8($.Game.Teams.IsTeamColors() ? $.LoadResStr(S("IDS_MSG_ENABLED")) : $.LoadResStr(S("IDS_MSG_DISABLED")));
  }

  $clone() { return new C4GameOptionsList$OptionTeamColors().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class C4GameOptionsList$OptionRuntimeJoin extends C4GameOptionsList$OptionDropdown {

  init(pForDlg) {
    super.init(pForDlg, $.LoadResStr(S("IDS_NET_RUNTIMEJOIN")), !$.Network.isHost());
    this.$dyn = C4GameOptionsList$OptionRuntimeJoin;
    this.SetToolTip($.LoadResStr(S("IDS_NET_RUNTIMEJOIN_DESC")));
    return this;
  }

  DoDropdownFill(pFiller) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4GameOptionsList$OptionRuntimeJoin && C4GameOptionsList$OptionRuntimeJoin.prototype instanceof $c) return $c.prototype.DoDropdownFill.apply(this, arguments); }
    pFiller.AddEntry($.LoadResStr(S("IDS_NET_RUNTIMEJOINBARRED")), 0);
    pFiller.AddEntry($.LoadResStr(S("IDS_NET_RUNTIMEJOINFREE")), 1);
  }

  DoDropdownSelChange(idNewSelection) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4GameOptionsList$OptionRuntimeJoin && C4GameOptionsList$OptionRuntimeJoin.prototype instanceof $c) return $c.prototype.DoDropdownSelChange.apply(this, arguments); }
    let fAllowed = !(idNewSelection === 0);
    $.Config.Network.NoRuntimeJoin = !fAllowed ? 1 : 0;
    if ($.Game.IsRunning) {
      $.Network.AllowJoin(fAllowed);
    }
  }

  Update$v() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4GameOptionsList$OptionRuntimeJoin && C4GameOptionsList$OptionRuntimeJoin.prototype instanceof $c) return $c.prototype.Update$v.apply(this, arguments); }
    let szText = null;
    if ($.Config.Network.NoRuntimeJoin !== 0) {
      szText = $.LoadResStr(S("IDS_NET_RUNTIMEJOINBARRED"));
    } else {
      szText = $.LoadResStr(S("IDS_NET_RUNTIMEJOINFREE"));
    }
    this.pDropdownList.SetText$pi8(szText);
  }

  $clone() { return new C4GameOptionsList$OptionRuntimeJoin().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export function $init(): void {
  $mixin(C4GameOptionsList, $.C4ApplicationSec1Timer);
}

Object.assign($, { C4GameOptionsList, C4GameOptionsList$Option, C4GameOptionsList$OptionControlMode, C4GameOptionsList$OptionControlRate, C4GameOptionsList$OptionDropdown, C4GameOptionsList$OptionRuntimeJoin, C4GameOptionsList$OptionScenarioParameter, C4GameOptionsList$OptionTeamColors, C4GameOptionsList$OptionTeamDist });
