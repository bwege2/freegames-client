// @ts-nocheck
// OpenClonk 36de799: src/gui/C4StartupPlrSelDlg.cpp, src/gui/C4StartupPlrSelDlg.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { Control, Dialog } from './C4Gui.ts';
import { C4StartupDlg } from './C4Startup.ts';
import { StdStrBuf } from '../lib/StdBuf.ts';
import { ftoi32, ftou32 } from '../../rt/int.ts';
import { c$fmod, c$localtime, c$strlen, c$toupper } from '../../rt/libc.ts';
import { UnsyncedRandom$u32 } from '../../rt/native.ts';
import { $rd, $wr, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $begin, $delete, $end, $max, $min, $throw, $vpush, std_find_if } from '../../rt/std.ts';

export class C4StartupPlrSelDlg$CrewListItem$RenameParams {

  $clone() { return new C4StartupPlrSelDlg$CrewListItem$RenameParams().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class C4StartupPlrSelDlg$CurrPlayer_t {
  Core = new $.C4PlayerInfoCore().init();
  Grp = new $.C4Group().init();

  None() {
    this.Core = new $.C4PlayerInfoCore().init();
    this.Grp = new $.C4Group().init();
    return this;
  }

  $clone() { return new C4StartupPlrSelDlg$CurrPlayer_t().$assign(this); }
  $assign(o) {
    this.Core.$assign(o.Core);
    this.Grp.$assign(o.Grp);
    return this;
  }
}

export class C4StartupPlrSelDlg_CrewSortDataEntry {
  iMaxExp = 0;
  idType = new $.C4ID().init$v();

  init(iMaxExp, idType) {
    this.iMaxExp = iMaxExp;
    this.idType = idType.$clone();
    return this;
  }

  $clone() { return new C4StartupPlrSelDlg_CrewSortDataEntry().$assign(this); }
  $assign(o) {
    this.iMaxExp = o.iMaxExp;
    this.idType.$assign(o.idType);
    return this;
  }
}

export class C4StartupPlrSelDlg_CrewSortDataMatchType {
  idType = new $.C4ID().init$v();

  init(idType) {
    this.idType = idType.$clone();
    return this;
  }

  op_call(Check) {
    return Check.idType.op_eq(this.idType);
  }

  $clone() { return new C4StartupPlrSelDlg_CrewSortDataMatchType().$assign(this); }
  $assign(o) {
    this.idType.$assign(o.idType);
    return this;
  }
}

export class C4StartupPlrSelDlg$ListItem$LoadError extends StdStrBuf {

  init(rTakeFrom) {
    this.Take$mStdStrBuf(rTakeFrom);
    return this;
  }

  $clone() { return new C4StartupPlrSelDlg$ListItem$LoadError().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class C4StartupPlrSelDlg$ListItem extends Control {
  pCheck = null;
  pNameLabel = null;
  pPlrSelDlg = null;
  pIcon = null;
  pKeyCheck = null;
  Filename = new $.StdStrBuf();

  init(pForDlg, pForListBox, pInsertBeforeElement = null, fActivated = false) {
    super.init(new $.C4Rect().init$i32$i32$i32$i32(0, 0, 0, 0));
    this.pCheck = null;
    this.pNameLabel = null;
    this.pPlrSelDlg = pForDlg;
    this.pIcon = null;
    this.Filename = new $.StdStrBuf();
    this.$dyn = C4StartupPlrSelDlg$ListItem;
    const rUseFont = $.GraphicsResource.FontRegular;
    let iHeight = rUseFont.GetLineHeight() + 4 | 0;
    this.pCheck = new $.CheckBox().init(new $.C4Rect().init$i32$i32$i32$i32(0, 0, iHeight, iHeight), null, fActivated);
    this.pCheck.SetOnChecked(new $.CallbackHandler$C4StartupPlrSelDlg().init(pForDlg, "OnItemCheckChange"));
    this.pKeyCheck = new $.C4KeyBinding().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(57), S("StartupPlrSelTogglePlayerActive"), 2 /*KEYSCOPE_Gui*/, new $.ControlKeyCB$ListItem$2().init(this, "KeyCheck"), 3);
    this.pIcon = new $.Icon().init(new $.C4Rect().init$i32$i32$i32$i32(iHeight + 2 | 0, 0, iHeight, iHeight), 9 /*Ico_Player*/);
    this.pNameLabel = new $.Label().init$pi8$i32$i32$i32$u32$pCStdFont$b$b(S("Q"), Math.imul(iHeight + 2 | 0, 2), 2, 0, 0xffffffff, rUseFont, false, false);
    this.pNameLabel.SetAutosize(false);
    this.SetBounds(this.pIcon.GetBounds());
    $.Container.prototype.AddElement$pElement.call(this, this.pCheck);
    $.Container.prototype.AddElement$pElement.call(this, this.pIcon);
    $.Container.prototype.AddElement$pElement.call(this, this.pNameLabel);
    pForListBox.InsertElement$pElement$pElement$i32(this, pInsertBeforeElement, 0);
    let rcNameLabelBounds = this.pNameLabel.GetBounds().$clone();
    rcNameLabelBounds.Wdt = (this.GetClientRect().Wdt - rcNameLabelBounds.x | 0) - 2 | 0;
    this.pNameLabel.SetBounds(rcNameLabelBounds);
    this.SetContextHandler(new $.CBContextHandler$ListItem().init(this, "ContextMenu$pElement$i32$i32"));
    return this;
  }

  $dtor() {
    $delete(this.pKeyCheck);
    super.$dtor();
  }

  ContextMenu$pElement$i32$i32(_pEl, _iX, _iY) {
    return this.ContextMenu$v();
  }

  UpdateOwnPos() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4StartupPlrSelDlg$ListItem && C4StartupPlrSelDlg$ListItem.prototype instanceof $c) return $c.prototype.UpdateOwnPos.apply(this, arguments); }
    $.Window.prototype.UpdateOwnPos.call(this);
    let caBounds = new $.ComponentAligner().init(this.GetContainedClientRect(), 2, 2);
  }

  KeyCheck() {
    this.pCheck.ToggleCheck(true);
    return true;
  }

  IsFocusOnClick() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4StartupPlrSelDlg$ListItem && C4StartupPlrSelDlg$ListItem.prototype instanceof $c) return $c.prototype.IsFocusOnClick.apply(this, arguments); }
    return false;
  }

  SetName(szNewName) {
    this.pNameLabel.SetText$pi8$b(szNewName);
    this.SetToolTip(szNewName);
  }

  SetIcon$i32(icoNew) {
    this.pIcon.SetIcon$i32(icoNew);
  }

  SetFilename(sNewFN) {
    this.Filename.Copy$StdStrBuf(sNewFN);
  }

  GetCheckBox() {
    return this.pCheck;
  }

  GetNext$v$c() {
    return $.Element.prototype.GetNext$v$c.call(this);
  }

  IsActivated() {
    return this.pCheck.GetChecked();
  }

  SetActivated(fToVal) {
    this.pCheck.SetChecked(fToVal);
  }

  GetName() {
    return this.pNameLabel.GetText$v();
  }

  GetFilename$v$c() {
    return this.Filename;
  }

  GrabIcon(rFromFacet) {
    if (rFromFacet.Surface != null) {
      this.pIcon.GetMFacet().GrabFrom(rFromFacet);
    } else {
      $.C4FacetSurface.prototype.Clear.call(this.pIcon.GetMFacet());
    }
  }

  CheckNameHotkey(c) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4StartupPlrSelDlg$ListItem && C4StartupPlrSelDlg$ListItem.prototype instanceof $c) return $c.prototype.CheckNameHotkey.apply(this, arguments); }
    if (this.pNameLabel == null) {
      return false;
    }
    let szName = this.pNameLabel.GetText$v();
    return szName != null && c$toupper(szName.a[szName.o]) === c$toupper(c.a[c.o + 0]);
  }

  $clone() { return new C4StartupPlrSelDlg$ListItem().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pCheck = o.pCheck;
    this.pNameLabel = o.pNameLabel;
    this.pPlrSelDlg = o.pPlrSelDlg;
    this.pIcon = o.pIcon;
    this.pKeyCheck = o.pKeyCheck;
    this.Filename.$assign(o.Filename);
    return this;
  }
}

export class C4StartupPlrPropertiesDlg extends Dialog {
  pMainDlg = null;
  pForPlayer = null;
  pNameEdit = null;
  pAutoStopControl = null;
  pClrPreview = null;
  pCtrlImg = null;
  pSkinImg = null;
  pMouseBtn = null;
  pJumpNRunBtn = null;
  pClassicBtn = null;
  pPictureBtn = null;
  ctrl_name_lbl = null;
  C4P = new $.C4PlayerInfoCore().init();
  fctOldBigIcon = new $.C4FacetSurface().init();
  fctNewBigIcon = new $.C4FacetSurface().init();
  fClearBigIcon = false;

  GetID$v() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4StartupPlrPropertiesDlg && C4StartupPlrPropertiesDlg.prototype instanceof $c) return $c.prototype.GetID$v.apply(this, arguments); }
    return S("PlrPropertiesDlg");
  }

  DrawElement(cgo) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4StartupPlrPropertiesDlg && C4StartupPlrPropertiesDlg.prototype instanceof $c) return $c.prototype.DrawElement.apply(this, arguments); }
    $.C4Startup.Get().Graphics.fctPlrPropBG.Draw$pC4Surface$f32$f32$i32$i32(cgo.Surface, Math.fround(Math.fround(this.rcBounds.x) + cgo.TargetX), Math.fround(Math.fround(this.rcBounds.y) + cgo.TargetY));
  }

  GetMarginTop() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4StartupPlrPropertiesDlg && C4StartupPlrPropertiesDlg.prototype instanceof $c) return $c.prototype.GetMarginTop.apply(this, arguments); }
    return 16;
  }

  GetMarginLeft() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4StartupPlrPropertiesDlg && C4StartupPlrPropertiesDlg.prototype instanceof $c) return $c.prototype.GetMarginLeft.apply(this, arguments); }
    return 45;
  }

  GetMarginRight() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4StartupPlrPropertiesDlg && C4StartupPlrPropertiesDlg.prototype instanceof $c) return $c.prototype.GetMarginRight.apply(this, arguments); }
    return 55;
  }

  GetMarginBottom() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4StartupPlrPropertiesDlg && C4StartupPlrPropertiesDlg.prototype instanceof $c) return $c.prototype.GetMarginBottom.apply(this, arguments); }
    return 30;
  }

  *UserClose$b(fOK) {
    if (fOK) {
      let PlrName = new $.StdStrBuf().init$pi8$b(this.pNameEdit.GetText$v());
      let Filename = new $.StdStrBuf();
      if (!C4StartupPlrSelDlg.CheckPlayerName(PlrName, Filename, this.pForPlayer != null ? this.pForPlayer.GetFilename$v$c() : null, true)) {
        return;
      }
      let control_set = $.Game.PlayerControlUserAssignmentSets.GetSetByName(this.C4P.PrefControl.getData());
      if (control_set != null && control_set.HasGamepad()) {
        (yield* this.GetScreen().ShowMessageModal($.LoadResStr(S("IDS_DLG_GAMEPADEXPERIMENTAL")), $.LoadResStr(S("IDS_DLG_GAMEPADEXPTITLE")), 1, 25 /*Ico_Gamepad*/));
      }
    }
    this.Close$b(fOK);
  }

  IsComponentOutsideClientArea() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4StartupPlrPropertiesDlg && C4StartupPlrPropertiesDlg.prototype instanceof $c) return $c.prototype.IsComponentOutsideClientArea.apply(this, arguments); }
    return true;
  }

  OnClrChangeLeft(_pBtn) {
    this.C4P.PrefColor = this.C4P.PrefColor !== 0 ? this.C4P.PrefColor - 1 | 0 : 11;
    this.C4P.PrefColorDw = $.C4PlayerInfoCore.GetPrefColorValue(this.C4P.PrefColor);
    this.UpdatePlayerColor(true);
  }

  OnClrChangeRight(_pBtn) {
    this.C4P.PrefColor = (this.C4P.PrefColor + 1 | 0) % 12;
    this.C4P.PrefColorDw = $.C4PlayerInfoCore.GetPrefColorValue(this.C4P.PrefColor);
    this.UpdatePlayerColor(true);
  }

  *OnClrChangeCustom(_pBtn) {
    (yield* this.GetScreen().ShowModalDlg(new C4StartupPlrColorPickerDlg().init(this.C4P)));
    this.UpdatePlayerColor(true);
  }

  OnCtrlChangeLeft(_pBtn) {
    let $t1;
    let control_set = $.Game.PlayerControlUserAssignmentSets.GetSetByName(this.C4P.PrefControl.getData());
    let index = $.Game.PlayerControlUserAssignmentSets.GetSetIndex(control_set);
    if (index < 0) {
      index = 0;
    }
    if (!(($t1 = index, index = index - 1 | 0, $t1) !== 0)) {
      index = $.Game.PlayerControlUserAssignmentSets.GetSetCount() - 1 | 0;
    }
    control_set = $.Game.PlayerControlUserAssignmentSets.GetSetByIndex(index);
    if (control_set != null) {
      this.C4P.PrefControl.op_assign$pi8(control_set.GetName());
    }
    this.UpdatePlayerControl();
  }

  OnCtrlChangeRight(_pBtn) {
    let control_set = $.Game.PlayerControlUserAssignmentSets.GetSetByName(this.C4P.PrefControl.getData());
    let index = $.Game.PlayerControlUserAssignmentSets.GetSetIndex(control_set);
    if (index < 0) {
      index = 0;
    }
    if ((index = index + 1 | 0) >= ($.Game.PlayerControlUserAssignmentSets.GetSetCount() | 0)) {
      index = 0;
    }
    control_set = $.Game.PlayerControlUserAssignmentSets.GetSetByIndex(index);
    if (control_set != null) {
      this.C4P.PrefControl.op_assign$pi8(control_set.GetName());
    }
    this.UpdatePlayerControl();
  }

  OnSkinChangeLeft(_pBtn) {
    this.C4P.PrefClonkSkin = this.C4P.PrefClonkSkin !== 0 ? this.C4P.PrefClonkSkin - 1 | 0 : 3;
    this.UpdatePlayerSkin();
  }

  OnSkinChangeRight(_pBtn) {
    this.C4P.PrefClonkSkin = (this.C4P.PrefClonkSkin + 1 | 0) % 4;
    this.UpdatePlayerSkin();
  }

  *OnPictureBtn(_pBtn) {
    let sNewPic = new $.StdStrBuf();
    if ((yield* $.C4PortraitSelDlg.SelectPortrait(this.GetScreen(), sNewPic))) {
      this.SetNewPicture$pi8(sNewPic.getData());
    }
  }

  UpdatePlayerColor(_fUpdateSliders) {
    this.C4P.PrefColorDw = (this.C4P.PrefColorDw | 0xff000000) >>> 0;
    this.pClrPreview.SetColor$u32(this.C4P.PrefColorDw);
    this.pPictureBtn.SetColor$u32(this.C4P.PrefColorDw);
  }

  UpdatePlayerControl() {
    let control_set = $.Game.PlayerControlUserAssignmentSets.GetSetByName(this.C4P.PrefControl.getData());
    if (control_set == null) {
      control_set = $.Game.PlayerControlUserAssignmentSets.GetDefaultSet();
    }
    let fctCtrlPic = new $.C4Facet().init$v();
    if (control_set != null) {
      fctCtrlPic.$assign(control_set.GetPicture());
    }
    this.pCtrlImg.SetFacet$C4Facet(fctCtrlPic);
    if (control_set != null) {
      this.ctrl_name_lbl.SetText$pi8$b(control_set.GetGUIName());
    } else {
      this.ctrl_name_lbl.SetText$pi8$b(S("???"));
    }
  }

  UpdatePlayerSkin() {
    this.pSkinImg.SetFacet$C4Facet($.GraphicsResource.fctClonkSkin.GetPhase(this.C4P.PrefClonkSkin));
  }

  UpdateBigIcon() {
    let fHasIcon = false;
    if (this.fctNewBigIcon.Surface != null) {
      this.pPictureBtn.SetFacet$C4Facet$u32(this.fctNewBigIcon);
      fHasIcon = true;
    } else if (!this.fClearBigIcon && this.pForPlayer != null) {
      let PlrGroup = new $.C4Group().init();
      if (PlrGroup.Open($.Config.AtUserDataPath(this.pForPlayer.GetFilename$v$c().getData()))) {
        if (PlrGroup.FindEntry$pi8$pStdStrBuf$pu64(S("BigIcon.png"))) {
          if (this.fctOldBigIcon.Load(PlrGroup, S("BigIcon.png"), -1, -1, false, 0)) {
            this.pPictureBtn.SetFacet$C4Facet$u32(this.fctOldBigIcon);
            fHasIcon = true;
          }
        }
      }
    }
    if (!fHasIcon) {
      this.pPictureBtn.SetFacet$C4Facet$u32($.GraphicsResource.fctPlayerClr);
    }
  }

  SetNewPicture$rC4Surface$pC4FacetSurface$i32$b(srcSfc, trgFct, iMaxSize, fColorize) {
    if (fColorize) {
      let srcSfcClr = new $.C4Surface().init$v();
      if (!srcSfcClr.CreateColorByOwner(srcSfc)) {
        return false;
      }
      return trgFct.CopyFromSfcMaxSize(srcSfcClr, iMaxSize, this.C4P.PrefColorDw);
    } else {
      return trgFct.CopyFromSfcMaxSize(srcSfc, iMaxSize);
    }
  }

  SetNewPicture$pi8(szFromFilename) {
    if (szFromFilename == null) {
      this.fClearBigIcon = true;
      $.C4FacetSurface.prototype.Clear.call(this.fctNewBigIcon);
    } else {
      let sfcNewPic = new $.C4Surface().init$v();
      let SrcGrp = new $.C4Group().init();
      let sParentPath = new $.StdStrBuf();
      $.GetParentPath$pi8$pStdStrBuf(szFromFilename, sParentPath);
      let fSucc = false;
      if (SrcGrp.Open(sParentPath.getData())) {
        if (sfcNewPic.Load(SrcGrp, $.GetFilename(szFromFilename), false, false, 0)) {
          fSucc = true;
          if (!this.SetNewPicture$rC4Surface$pC4FacetSurface$i32$b(sfcNewPic, this.fctNewBigIcon, 64, true)) {
            fSucc = false;
          }
        }
      }
      if (!fSucc) {
        this.GetScreen().ShowErrorMessage($.FormatString($.LoadResStr(S("IDS_PRC_NOGFXFILE")), szFromFilename, SrcGrp.GetError()).getData());
      }
    }
    this.UpdateBigIcon();
  }

  init(pForPlayer, pParentDlg) {
    super.init(ftoi32($.C4Startup.Get().Graphics.fctPlrPropBG.Wdt), ftoi32($.C4Startup.Get().Graphics.fctPlrPropBG.Hgt), S(""), false);
    this.pMainDlg = pParentDlg;
    this.pForPlayer = pForPlayer;
    this.C4P = new $.C4PlayerInfoCore().init();
    this.fctOldBigIcon = new $.C4FacetSurface().init();
    this.fctNewBigIcon = new $.C4FacetSurface().init();
    this.fClearBigIcon = false;
    this.$dyn = C4StartupPlrPropertiesDlg;
    if (pForPlayer != null) {
      this.C4P.$assign(pForPlayer.GetCore());
    } else {
      this.C4P.Default($.DefaultRanks);
      $.SCopy$pi8$pi8$u64($.LoadResStr(S("IDS_PLR_NEWCOMMENT")), P(this.C4P.Comment, 0), 256);
      this.C4P.PrefColor = UnsyncedRandom$u32(8) | 0;
      this.C4P.PrefColorDw = $.C4PlayerInfoCore.GetPrefColorValue(this.C4P.PrefColor);
      this.C4P.OldPrefControlStyle = 1;
      this.C4P.OldPrefAutoContextMenu = 1;
      this.C4P.OldPrefControl = 0;
    }
    let BetweenElementDist = 2;
    let pUseFont = $.C4Startup.Get().Graphics.BookFont;
    let pSmallFont = $.C4Startup.Get().Graphics.BookSmallFont;
    this.UpdateSize();
    let caMain = new $.ComponentAligner().init(this.GetClientRect(), 0, 1, true);
    let caButtonArea = new $.ComponentAligner().init(caMain.GetFromBottom$i32$i32(40), 0, 0);
    let szTitle = null;
    if (pForPlayer != null) {
      szTitle = $.LoadResStr(S("IDS_DLG_PLAYER2"));
    } else {
      szTitle = $.LoadResStr(S("IDS_PLR_NEWPLAYER"));
    }
    let pLbl = new $.Label().init$pi8$C4Rect$i32$u32$pCStdFont$b$b$b(szTitle, caMain.GetFromTop$i32$i32(pUseFont.GetLineHeight()), 0, 0xff000000, pUseFont, false);
    $.Container.prototype.AddElement$pElement.call(this, pLbl);
    caMain.ExpandTop(-2);
    $.Container.prototype.AddElement$pElement.call(this, new $.Label().init$pi8$C4Rect$i32$u32$pCStdFont$b$b$b($.LoadResStr(S("IDS_CTL_NAME2")), caMain.GetFromTop$i32$i32(pSmallFont.GetLineHeight()), 0, 0xff000000, pSmallFont, false));
    this.pNameEdit = new $.Edit().init(caMain.GetFromTop$i32$i32($.Edit.GetCustomEditHeight(pUseFont)));
    this.pNameEdit.SetFont$pCStdFont(pUseFont);
    this.pNameEdit.SetColors(0, 0xff000000, 0xffa4947a);
    this.pNameEdit.InsertText(P(this.C4P.PrefName, 0), false);
    this.pNameEdit.SetMaxText(30);
    $.Container.prototype.AddElement$pElement.call(this, this.pNameEdit);
    this.SetFocus(this.pNameEdit, false);
    caMain.ExpandTop(-2);
    let iControlPicSize = $.ArrowButton.GetDefaultHeight$v();
    let label_hgt = pSmallFont.GetLineHeight();
    let caColorArea = new $.ComponentAligner().init(caMain.GetFromTop$i32$i32((iControlPicSize + 2 | 0) + label_hgt | 0), 2, 0);
    let caPictureArea = new $.ComponentAligner().init(caColorArea.GetFromRight$i32$i32(iControlPicSize, (iControlPicSize + 2 | 0) + label_hgt | 0), 2, 0);
    caColorArea.ExpandLeft(2);
    $.Container.prototype.AddElement$pElement.call(this, new $.Label().init$pi8$C4Rect$i32$u32$pCStdFont$b$b$b($.FormatString(S("%s:"), $.LoadResStr(S("IDS_CTL_COLOR"))).getData(), caColorArea.GetFromTop$i32$i32(label_hgt), 0, 0xff000000, pSmallFont, false));
    caColorArea.ExpandTop(-2);
    $.Container.prototype.AddElement$pElement.call(this, new $.Label().init$pi8$C4Rect$i32$u32$pCStdFont$b$b$b($.LoadResStr(S("IDS_CTL_PICTURE")), caPictureArea.GetFromTop$i32$i32(label_hgt), 0, 0xff000000, pSmallFont, false));
    caPictureArea.ExpandTop(-2);
    let pBtn = null;
    let szTip = null;
    szTip = $.LoadResStr(S("IDS_DLGTIP_PLAYERCOLORS"));
    $.Container.prototype.AddElement$pElement.call(this, pBtn = new $.CallbackButton$C4StartupPlrPropertiesDlg$ArrowButton().init$i32$C4Rect$x$pC4StartupPlrPropertiesDlg(0 /*Left*/, caColorArea.GetFromLeft$i32$i32($.ArrowButton.GetDefaultWidth()), "OnClrChangeLeft"));
    pBtn.SetToolTip(szTip);
    const rfctClrPreviewPic = $.GraphicsResource.fctFlagClr;
    this.pClrPreview = new $.CallbackButton$C4StartupPlrPropertiesDlg$IconButton().init$i32$C4Rect$i8$x$pC4StartupPlrPropertiesDlg(-1 /*Ico_None*/, caColorArea.GetFromLeft$i32$i32(rfctClrPreviewPic.GetWidthByHeight(caColorArea.GetHeight())), 67, "OnClrChangeCustom");
    this.pClrPreview.SetFacet$C4Facet$u32(rfctClrPreviewPic);
    $.Container.prototype.AddElement$pElement.call(this, this.pClrPreview);
    $.Container.prototype.AddElement$pElement.call(this, pBtn = new $.CallbackButton$C4StartupPlrPropertiesDlg$ArrowButton().init$i32$C4Rect$x$pC4StartupPlrPropertiesDlg(1 /*Right*/, caColorArea.GetFromLeft$i32$i32($.ArrowButton.GetDefaultWidth()), "OnClrChangeRight"));
    pBtn.SetToolTip(szTip);
    if (this.C4P.PrefColorDw === 0) {
      this.C4P.PrefColorDw = 255;
    }
    $.Container.prototype.AddElement$pElement.call(this, this.pPictureBtn = new $.CallbackButton$C4StartupPlrPropertiesDlg$IconButton().init$i32$C4Rect$i8$x$pC4StartupPlrPropertiesDlg(9 /*Ico_Player*/, caPictureArea.GetAll$v(), 80, "OnPictureBtn"));
    this.pPictureBtn.SetToolTip($.LoadResStr(S("IDS_DESC_SELECTAPICTUREANDORLOBBYI")));
    C4StartupPlrPropertiesDlg.prototype.UpdateBigIcon.call(this);
    C4StartupPlrPropertiesDlg.prototype.UpdatePlayerColor.call(this, true);
    caMain.ExpandTop(-2);
    let caControlArea = new $.ComponentAligner().init(caMain.GetFromTop$i32$i32((iControlPicSize + label_hgt | 0) + 2 | 0), 0, 0, false);
    let caSkinArea = new $.ComponentAligner().init(caControlArea.GetFromRight$i32$i32((iControlPicSize + label_hgt | 0) + 2 | 0), 0, 0, false);
    $.Container.prototype.AddElement$pElement.call(this, new $.Label().init$pi8$C4Rect$i32$u32$pCStdFont$b$b$b($.FormatString(S("%s:"), $.LoadResStr(S("IDS_CTL_CONTROL"))).getData(), caControlArea.GetFromTop$i32$i32(label_hgt), 0, 0xff000000, pSmallFont, false));
    caControlArea.ExpandTop(-2);
    $.Container.prototype.AddElement$pElement.call(this, new $.Label().init$pi8$C4Rect$i32$u32$pCStdFont$b$b$b($.LoadResStr(S("IDS_CTL_CLONKSKIN")), caSkinArea.GetFromTop$i32$i32(label_hgt), 0, 0xff000000, pSmallFont, false));
    caSkinArea.ExpandTop(-2);
    let caControl = new $.ComponentAligner().init(caControlArea.GetFromTop$i32$i32(iControlPicSize), 2, 0);
    szTip = $.LoadResStr(S("IDS_DLGTIP_PLAYERCONTROL"));
    $.Container.prototype.AddElement$pElement.call(this, pBtn = new $.CallbackButton$C4StartupPlrPropertiesDlg$ArrowButton().init$i32$C4Rect$x$pC4StartupPlrPropertiesDlg(0 /*Left*/, caControl.GetFromLeft$i32$i32($.ArrowButton.GetDefaultWidth()), "OnCtrlChangeLeft"));
    pBtn.SetToolTip(szTip);
    caControl.ExpandBottom(label_hgt);
    let ctrl_name_rect = caControl.GetFromBottom$i32$i32(label_hgt).$clone();
    const rfctCtrlPic = $.GraphicsResource.fctKeyboard;
    $.Container.prototype.AddElement$pElement.call(this, this.pCtrlImg = new $.Picture().init(caControl.GetFromLeft$i32$i32(rfctCtrlPic.GetWidthByHeight(caControl.GetHeight())), true));
    this.pCtrlImg.SetToolTip(szTip);
    $.Container.prototype.AddElement$pElement.call(this, pBtn = new $.CallbackButton$C4StartupPlrPropertiesDlg$ArrowButton().init$i32$C4Rect$x$pC4StartupPlrPropertiesDlg(1 /*Right*/, caControl.GetFromLeft$i32$i32($.ArrowButton.GetDefaultWidth()), "OnCtrlChangeRight"));
    pBtn.SetToolTip(szTip);
    caControl.ExpandLeft(-10);
    this.C4P.OldPrefControl = $.Clamp$i32$i32$i32(this.C4P.OldPrefControl, 0, 7);
    this.ctrl_name_lbl = new $.Label().init$pi8$C4Rect$i32$u32$pCStdFont$b$b$b(S("CtrlName"), ctrl_name_rect, 0, 0xff000000, pSmallFont, false, false, true);
    $.Container.prototype.AddElement$pElement.call(this, this.ctrl_name_lbl);
    C4StartupPlrPropertiesDlg.prototype.UpdatePlayerControl.call(this);
    let caSkin = new $.ComponentAligner().init(caSkinArea.GetFromTop$i32$i32(iControlPicSize), 2, 0);
    szTip = $.LoadResStr(S("IDS_DLGTIP_PLAYERCREWSKIN"));
    $.Container.prototype.AddElement$pElement.call(this, pBtn = new $.CallbackButton$C4StartupPlrPropertiesDlg$ArrowButton().init$i32$C4Rect$x$pC4StartupPlrPropertiesDlg(0 /*Left*/, caSkin.GetFromLeft$i32$i32($.ArrowButton.GetDefaultWidth()), "OnSkinChangeLeft"));
    pBtn.SetToolTip(szTip);
    let rfctSkinPic = $.GraphicsResource.fctClonkSkin.GetPhase(0);
    $.Container.prototype.AddElement$pElement.call(this, this.pSkinImg = new $.Picture().init(caSkin.GetFromLeft$i32$i32(rfctSkinPic.GetWidthByHeight(caSkin.GetHeight())), true));
    this.pSkinImg.SetToolTip(szTip);
    this.pSkinImg.SetFacet$C4Facet($.GraphicsResource.fctClonkSkin.GetPhase(0));
    $.Container.prototype.AddElement$pElement.call(this, pBtn = new $.CallbackButton$C4StartupPlrPropertiesDlg$ArrowButton().init$i32$C4Rect$x$pC4StartupPlrPropertiesDlg(1 /*Right*/, caSkin.GetFromLeft$i32$i32($.ArrowButton.GetDefaultWidth()), "OnSkinChangeRight"));
    pBtn.SetToolTip(szTip);
    caSkin.ExpandLeft(-10);
    C4StartupPlrPropertiesDlg.prototype.UpdatePlayerSkin.call(this);
    caMain.ExpandTop(-2);
    let pBtnOK = new $.OKIconButton().init(new $.C4Rect().init$i32$i32$i32$i32(147 - C4StartupPlrPropertiesDlg.prototype.GetMarginLeft.call(this) | 0, 330 - C4StartupPlrPropertiesDlg.prototype.GetMarginTop.call(this) | 0, 54, 33), -1 /*Ico_None*/);
    $.Container.prototype.AddElement$pElement.call(this, pBtnOK);
    let pBtnAbort = new $.CancelIconButton().init(new $.C4Rect().init$i32$i32$i32$i32(317 - C4StartupPlrPropertiesDlg.prototype.GetMarginLeft.call(this) | 0, 16 - C4StartupPlrPropertiesDlg.prototype.GetMarginTop.call(this) | 0, 21, 21), -1 /*Ico_None*/);
    $.Container.prototype.AddElement$pElement.call(this, pBtnAbort);
    if (this.pMainDlg != null) {
      this.SetDelOnClose();
    }
    return this;
  }

  $dtor() {
    super.$dtor();
  }

  OnClosed(fOK) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4StartupPlrPropertiesDlg && C4StartupPlrPropertiesDlg.prototype instanceof $c) return $c.prototype.OnClosed.apply(this, arguments); }
    if (fOK) {
      let PlrName = new $.StdStrBuf().init$pi8$b(this.pNameEdit.GetText$v());
      let Filename = new $.StdStrBuf();
      if (C4StartupPlrSelDlg.CheckPlayerName(PlrName, Filename, this.pForPlayer != null ? this.pForPlayer.GetFilename$v$c() : null, true)) {
        $.SCopy$pi8$pi8$u64(PlrName.getData(), P(this.C4P.PrefName, 0), 30);
        let PlrGroup = new $.C4Group().init();
        let fSucc = false;
        if (this.pForPlayer != null) {
          if (!this.pForPlayer.MoveFilename(Filename.getData())) {
            this.GetScreen().ShowMessage($.LoadResStr(S("IDS_FAIL_RENAME")), S(""), 11 /*Ico_Error*/);
          }
          if (this.fClearBigIcon || this.fctNewBigIcon.Surface != null) {
            let PlrGroup$2 = new $.C4Group().init();
            if (PlrGroup$2.Open($.Config.AtUserDataPath(Filename.getData()))) {
              if (this.fClearBigIcon || this.fctNewBigIcon.Surface != null) {
                PlrGroup$2.Delete(S("BigIcon.png"));
              }
              if (this.fctNewBigIcon.Surface != null) {
                this.fctNewBigIcon.GetFace().SavePNG$rC4Group$pi8$b$b(PlrGroup$2, S("BigIcon.png"));
              }
              if (PlrGroup$2.Close$v()) {
                fSucc = true;
              }
              if (this.fClearBigIcon || this.fctNewBigIcon.Surface != null) {
                this.pForPlayer.GrabCustomIcon(this.fctNewBigIcon);
              }
            }
          } else {
            fSucc = true;
          }
          this.pForPlayer.UpdateCore$rC4PlayerInfoCore(this.C4P);
          if (this.pMainDlg != null) {
            this.pMainDlg.UpdateActivatedPlayers();
          }
        } else {
          if (PlrGroup.Open($.Config.AtUserDataPath(Filename.getData()), true)) {
            if (PlrGroup.FindEntry$pi8$pStdStrBuf$pu64(S("Player.txt"))) {
              return;
            }
            this.C4P.Save$rC4Group(PlrGroup);
            if (this.fctNewBigIcon.Surface != null) {
              this.fctNewBigIcon.GetFace().SavePNG$rC4Group$pi8$b$b(PlrGroup, S("BigIcon.png"));
            }
            if (PlrGroup.Close$v()) {
              fSucc = true;
            }
            if (this.pMainDlg != null) {
              this.pMainDlg.UpdatePlayerList();
              this.pMainDlg.SelectItem$StdStrBuf$b(Filename, true);
            } else {
              $.SCopy$pi8$pi8$u64($.Config.AtRelativePath(Filename.getData()), P($.Config.General.Participants, 0), 1025);
            }
          }
        }
        if (!fSucc) {
          this.GetScreen().ShowErrorMessage(PlrGroup.GetError());
        }
      }
    }
    $.Dialog.prototype.OnClosed.call(this, fOK);
  }

  $clone() { return new C4StartupPlrPropertiesDlg().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pMainDlg = o.pMainDlg;
    this.pForPlayer = o.pForPlayer;
    this.pNameEdit = o.pNameEdit;
    this.pAutoStopControl = o.pAutoStopControl;
    this.pClrPreview = o.pClrPreview;
    this.pCtrlImg = o.pCtrlImg;
    this.pSkinImg = o.pSkinImg;
    this.pMouseBtn = o.pMouseBtn;
    this.pJumpNRunBtn = o.pJumpNRunBtn;
    this.pClassicBtn = o.pClassicBtn;
    this.pPictureBtn = o.pPictureBtn;
    this.ctrl_name_lbl = o.ctrl_name_lbl;
    this.C4P.$assign(o.C4P);
    this.fctOldBigIcon.$assign(o.fctOldBigIcon);
    this.fctNewBigIcon.$assign(o.fctNewBigIcon);
    this.fClearBigIcon = o.fClearBigIcon;
    return this;
  }
}

export class C4StartupPlrColorPickerDlg extends Dialog {
  plrcore = null;
  picker = null;

  init(plrcore) {
    super.init(400, 336, $.LoadResStr(S("IDS_DLG_PLAYERCOLORSELECTION")), false);
    this.plrcore = plrcore;
    this.$dyn = C4StartupPlrColorPickerDlg;
    let caMain = new $.ComponentAligner().init(this.GetClientRect(), 0, 1, true);
    this.picker = new C4StartupPlrColorPickerDlg$Picker().init(caMain.GetFromTop$i32$i32(280));
    this.picker.SetColor$u32(plrcore.PrefColorDw);
    $.Container.prototype.AddElement$pElement.call(this, this.picker);
    let caButtonArea = new $.ComponentAligner().init(caMain.GetFromBottom$i32$i32(40), 0, 0);
    caButtonArea.$assign(new $.ComponentAligner().init(caButtonArea.GetCentered$i32$i32(288, 40), 8, 8));
    let cancelButton = new $.CancelButton().init(caButtonArea.GetFromRight$i32$i32(128));
    let okButton = new $.OKButton().init(caButtonArea.GetFromRight$i32$i32(128));
    $.Container.prototype.AddElement$pElement.call(this, okButton);
    $.Container.prototype.AddElement$pElement.call(this, cancelButton);
    return this;
  }

  OnClosed(commit) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4StartupPlrColorPickerDlg && C4StartupPlrColorPickerDlg.prototype instanceof $c) return $c.prototype.OnClosed.apply(this, arguments); }
    if (commit) {
      this.plrcore.PrefColorDw = this.picker.GetColor();
    }
  }

  static HSV2RGB(hsv) {
    let h = Math.fround(Math.fround(Math.fround(hsv >>> 16 & 0xff) / 255) * 6);
    let s = Math.fround(Math.fround((hsv & 0xffff) >> 8 & 0xff) / 255);
    let v = Math.fround(Math.fround(hsv & 0xff) / 255);
    let chroma = Math.fround(s * v);
    let x = Math.fround(chroma * Math.fround(1 - (Math.abs(Math.fround(Math.fround(c$fmod(h, 2)) - 1)) | 0)));
    let r = Math.fround(0);
    let g = Math.fround(0);
    let b = Math.fround(0);
    switch (ftoi32(h)) {
      case 0:
      case 6:
        r = chroma;
        g = x;
        break;
      case 1:
        r = x;
        g = chroma;
        break;
      case 2:
        g = chroma;
        b = x;
        break;
      case 3:
        g = x;
        b = chroma;
        break;
      case 4:
        b = chroma;
        r = x;
        break;
      case 5:
        b = x;
        r = chroma;
        break;
    }
    r = Math.fround(r + Math.fround(v - chroma));
    g = Math.fround(g + Math.fround(v - chroma));
    b = Math.fround(b + Math.fround(v - chroma));
    return $.RGBA(ftou32(Math.fround(r * 255)), ftou32(Math.fround(g * 255)), ftou32(Math.fround(b * 255)), hsv >>> 24);
  }

  static RGB2HSV(rgb) {
    let r = Math.fround(Math.fround(rgb >>> 16 & 0xff) / 255);
    let g = Math.fround(Math.fround((rgb & 0xffff) >> 8 & 0xff) / 255);
    let b = Math.fround(Math.fround(rgb & 0xff) / 255);
    let min = $min(r, $min(g, b));
    let max = $max(r, $max(g, b));
    let chroma = Math.fround(max - min);
    let hue = Math.fround(0);
    if (r === max) {
      hue = Math.fround(c$fmod(Math.fround(Math.fround(g - b) / chroma), 6));
    } else if (g === max) {
      hue = Math.fround(Math.fround(Math.fround(b - r) / chroma) + 2);
    } else {
      hue = Math.fround(Math.fround(Math.fround(r - g) / chroma) + 4);
    }
    let h = Math.fround(hue / 6);
    let s = max === Math.fround(0) ? 0 : Math.fround(chroma / max);
    let v = max;
    return $.RGBA(ftou32(Math.fround(h * 255)), ftou32(Math.fround(s * 255)), ftou32(Math.fround(v * 255)), rgb >>> 24);
  }

  $clone() { return new C4StartupPlrColorPickerDlg().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.plrcore = o.plrcore;
    this.picker = o.picker;
    return this;
  }
}

export class C4StartupPlrColorPickerDlg$Picker extends Control {
  static HSPickerCursorSize;
  static VPickerCursorSize;
  hsFacet = new $.C4FacetSurface().init();
  vFacet = new $.C4FacetSurface().init();
  hsPickerRect = new $.C4Rect();
  vPickerRect = new $.C4Rect();
  flagPreview = null;
  crewPreview = null;
  hsv = 0;
  state = 0;

  init(bounds) {
    super.init(bounds);
    this.hsFacet = new $.C4FacetSurface().init();
    this.vFacet = new $.C4FacetSurface().init();
    this.hsPickerRect = new $.C4Rect();
    this.vPickerRect = new $.C4Rect();
    this.state = 0 /*PS_Idle*/;
    this.$dyn = C4StartupPlrColorPickerDlg$Picker;
    let caMain = new $.ComponentAligner().init(bounds, 8, 8, true);
    caMain.ExpandBottom(-(caMain.GetInnerHeight() - 256 | 0) | 0);
    this.hsPickerRect.$assign(caMain.GetFromLeft$i32$i32(256));
    this.vPickerRect.$assign(caMain.GetFromLeft$i32$i32(23));
    this.vPickerRect.Hgt = 192;
    const flagPreviewPic = $.GraphicsResource.fctFlagClr;
    let preview_width = $min(ftoi32(flagPreviewPic.Wdt), caMain.GetInnerWidth());
    this.flagPreview = new $.Picture().init(caMain.GetFromTop$i32$i32(flagPreviewPic.GetHeightByWidth(preview_width), preview_width), true);
    this.flagPreview.SetFacet$C4Facet(flagPreviewPic);
    $.Container.prototype.AddElement$pElement.call(this, this.flagPreview);
    const crewPreviewPic = $.GraphicsResource.fctCrewClr;
    preview_width = $min(ftoi32(crewPreviewPic.Wdt), caMain.GetInnerWidth());
    this.crewPreview = new $.Picture().init(caMain.GetFromTop$i32$i32(crewPreviewPic.GetHeightByWidth(preview_width), preview_width), true);
    this.crewPreview.SetFacet$C4Facet(crewPreviewPic);
    $.Container.prototype.AddElement$pElement.call(this, this.crewPreview);
    this.hsFacet.Create(this.hsPickerRect.Wdt, this.hsPickerRect.Hgt);
    this.hsFacet.Surface.Lock();
    for (let y = 0; Math.fround(y) < this.hsFacet.Hgt; y = y + 1 | 0) {
      for (let x = 0; Math.fround(x) < this.hsFacet.Wdt; x = x + 1 | 0) {
        this.hsFacet.Surface.SetPixDw(x, y, C4StartupPlrColorPickerDlg.HSV2RGB((((0xff000000 | ((x >>> 0 & 255) >>> 0 << 16) >>> 0) >>> 0 | (((255 - y | 0) >>> 0 & 255) >>> 0 << 8) >>> 0) >>> 0 | 255) >>> 0));
      }
    }
    this.hsFacet.Surface.Unlock();
    this.vFacet.Create((this.vPickerRect.Wdt >>> 0) - 7 >>> 0 | 0, this.vPickerRect.Hgt);
    C4StartupPlrColorPickerDlg$Picker.prototype.UpdateVFacet.call(this, 255, 255);
    return this;
  }

  SetColor$u32(rgb) {
    this.hsv = C4StartupPlrColorPickerDlg.RGB2HSV(rgb);
    this.UpdateVFacet(this.hsv >>> 16 & 0xff, (this.hsv & 0xffff) >> 8 & 0xff);
    this.UpdatePreview();
  }

  GetColor() {
    return C4StartupPlrColorPickerDlg.HSV2RGB(this.hsv);
  }

  DrawElement(cgo) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4StartupPlrColorPickerDlg$Picker && C4StartupPlrColorPickerDlg$Picker.prototype instanceof $c) return $c.prototype.DrawElement.apply(this, arguments); }
    let cgoPicker = new $.C4Facet().init$pC4Surface$f32$f32$f32$f32(cgo.Surface, Math.fround(cgo.TargetX + Math.fround(this.hsPickerRect.x)), Math.fround(cgo.TargetY + Math.fround(this.hsPickerRect.y)), Math.fround(this.hsPickerRect.Wdt), Math.fround(this.hsPickerRect.Hgt));
    this.hsFacet.Draw$pC4Surface$f32$f32$i32$i32(cgoPicker.Surface, cgoPicker.X, cgoPicker.Y);
    cgoPicker.Wdt = cgoPicker.Hgt = Math.fround(5);
    cgoPicker.X = Math.fround(cgoPicker.X + Math.fround(Math.fround(this.hsv >>> 16 & 0xff) - Math.fround(cgoPicker.Wdt / Math.fround(2))));
    cgoPicker.Y = Math.fround(cgoPicker.Y + Math.fround(Math.fround(255 - ((this.hsv & 0xffff) >> 8 & 0xff) | 0) - Math.fround(cgoPicker.Hgt / Math.fround(2))));
    $.pDraw.DrawLineDw(cgoPicker.Surface, cgoPicker.X, cgoPicker.Y, Math.fround(cgoPicker.X + cgoPicker.Wdt), Math.fround(cgoPicker.Y + cgoPicker.Hgt), 0xff000000);
    $.pDraw.DrawLineDw(cgoPicker.Surface, Math.fround(cgoPicker.X + cgoPicker.Wdt), cgoPicker.Y, cgoPicker.X, Math.fround(cgoPicker.Y + cgoPicker.Hgt), 0xff000000);
    cgoPicker.Set$pC4Surface$f32$f32$f32$f32(cgo.Surface, Math.fround(Math.fround(cgo.TargetX + Math.fround(this.vPickerRect.x)) + Math.fround(7)), Math.fround(cgo.TargetY + Math.fround(this.vPickerRect.y)), Math.fround((this.vPickerRect.Wdt >>> 0) - 7 >>> 0), Math.fround(this.vPickerRect.Hgt));
    this.vFacet.Draw$pC4Surface$f32$f32$i32$i32(cgoPicker.Surface, cgoPicker.X, cgoPicker.Y);
    cgoPicker.Wdt = cgoPicker.Hgt = Math.fround(7);
    cgoPicker.X = Math.fround(cgoPicker.X - Math.fround(Math.fround(cgoPicker.Wdt / Math.fround(2)) + Math.fround(1)));
    cgoPicker.Y = Math.fround(cgoPicker.Y + Math.fround(Math.fround(255 - (this.hsv & 0xff) | 0) - Math.fround(cgoPicker.Hgt / Math.fround(2))));
    for (let i = 0; Math.fround(i) < Math.fround(Math.fround(cgoPicker.Hgt / Math.fround(2)) + Math.fround(1)); i = i + 1 | 0) {
      $.pDraw.DrawLineDw(cgoPicker.Surface, Math.fround(cgoPicker.X + Math.fround(i)), Math.fround(cgoPicker.Y + Math.fround(i)), Math.fround(cgoPicker.X + Math.fround(i)), Math.fround(Math.fround(cgoPicker.Y + cgoPicker.Hgt) - Math.fround(i)), 0xffffffff);
    }
  }

  MouseInput$rCMouse$i32$i32$i32$u32(rMouse, iButton, iX, iY, dwKeyParam) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4StartupPlrColorPickerDlg$Picker && C4StartupPlrColorPickerDlg$Picker.prototype instanceof $c) return $c.prototype.MouseInput$rCMouse$i32$i32$i32$u32.apply(this, arguments); }
    $.Control.prototype.MouseInput$rCMouse$i32$i32$i32$u32.call(this, rMouse, iButton, iX, iY, dwKeyParam);
    if (!rMouse.IsLDown()) {
      this.state = 0 /*PS_Idle*/;
    }
    if (rMouse.pDragElement != null) {
      return;
    }
    if (rMouse.IsLDown()) {
      if (this.HandleMouseDown(iX, iY)) {
        rMouse.pDragElement = this;
        $.GUISound(S("UI::Select"));
      } else {
        rMouse.pDragElement = null;
      }
    }
  }

  DoDragging(_rMouse, iX, iY, _dwKeyParam) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4StartupPlrColorPickerDlg$Picker && C4StartupPlrColorPickerDlg$Picker.prototype instanceof $c) return $c.prototype.DoDragging.apply(this, arguments); }
    this.HandleMouseDown(iX, iY);
  }

  HandleMouseDown(x, y) {
    if ((this.state | 0) === 1) {
      return false;
    } else if ((this.state | 0) === 2 || (this.state | 0) === 0 && this.hsPickerRect.Contains$i32$i32(x, y)) {
      let h = $.Clamp$i32$i32$i32(x - this.hsPickerRect.x | 0, 0, this.hsPickerRect.Wdt - 1 | 0);
      0;
      let s = 255 - $.Clamp$i32$i32$i32(y - this.hsPickerRect.y | 0, 0, this.hsPickerRect.Hgt - 1 | 0) | 0;
      0;
      this.hsv = (((0xff000000 | ((h >>> 0 & 255) >>> 0 << 16) >>> 0) >>> 0 | ((s >>> 0 & 255) >>> 0 << 8) >>> 0) >>> 0 | (this.hsv & 0xff & 255) >>> 0) >>> 0;
      this.UpdateVFacet(h >>> 0, s >>> 0);
      this.UpdatePreview();
      this.state = 2 /*PS_DragHS*/;
      return true;
    } else if ((this.state | 0) === 3 || (this.state | 0) === 0 && this.vPickerRect.Contains$i32$i32(x, y)) {
      let v = 255 - $.Clamp$i32$i32$i32(y - this.vPickerRect.y | 0, 0, this.vPickerRect.Hgt - 1 | 0) | 0;
      0;
      this.hsv = ((this.hsv & 0xffffff00) >>> 0 | v >>> 0) >>> 0;
      this.UpdatePreview();
      this.state = 3 /*PS_DragV*/;
      return true;
    } else {
      this.state = 1 /*PS_IdleDragging*/;
      return false;
    }
  }

  UpdateVFacet(h, s) {
    this.vFacet.Surface.Lock();
    for (let y = 0; y < this.vPickerRect.Hgt; y = y + 1 | 0) {
      for (let x = 0; Math.fround(x) < this.vFacet.Wdt; x = x + 1 | 0) {
        this.vFacet.Surface.SetPixDw(x, y, C4StartupPlrColorPickerDlg.HSV2RGB((((0xff000000 | ((h & 255) >>> 0 << 16) >>> 0) >>> 0 | ((s & 255) >>> 0 << 8) >>> 0) >>> 0 | ((255 - y | 0) & 255) >>> 0) >>> 0));
      }
    }
    this.vFacet.Surface.Unlock();
  }

  UpdatePreview() {
    this.flagPreview.SetDrawColor(C4StartupPlrColorPickerDlg.HSV2RGB(this.hsv));
    this.crewPreview.SetDrawColor(C4StartupPlrColorPickerDlg.HSV2RGB(this.hsv));
  }

  $clone() { return new C4StartupPlrColorPickerDlg$Picker().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.hsFacet.$assign(o.hsFacet);
    this.vFacet.$assign(o.vFacet);
    this.hsPickerRect.$assign(o.hsPickerRect);
    this.vPickerRect.$assign(o.vPickerRect);
    this.flagPreview = o.flagPreview;
    this.crewPreview = o.crewPreview;
    this.hsv = o.hsv;
    this.state = o.state;
    return this;
  }
}

export class C4StartupPlrSelDlg$PlayerListItem extends C4StartupPlrSelDlg$ListItem {
  Core = new $.C4PlayerInfoCore().init();
  fHasCustomIcon = false;

  init(pForDlg, pForListBox, pInsertBeforeElement = null, fActivated = false) {
    super.init(pForDlg, pForListBox, pInsertBeforeElement, fActivated);
    this.Core = new $.C4PlayerInfoCore().init();
    this.fHasCustomIcon = false;
    this.$dyn = C4StartupPlrSelDlg$PlayerListItem;
    return this;
  }

  $dtor() {
    super.$dtor();
  }

  Load$StdStrBuf(rsFilename) {
    let iHeight = this.GetBounds().Hgt;
    this.SetFilename(rsFilename);
    let PlrGroup = new $.C4Group().init();
    if (!PlrGroup.Open($.Config.AtUserDataPath(rsFilename.getData()))) {
      $throw(new C4StartupPlrSelDlg$ListItem$LoadError().init($.FormatString(S("Error loading player file from %s: Error opening group: %s"), rsFilename.getData(), PlrGroup.GetError())));
    }
    if (!this.Core.Load$rC4Group(PlrGroup)) {
      $throw(new C4StartupPlrSelDlg$ListItem$LoadError().init($.FormatString(S("Error loading player file from %s: Core data invalid or missing (Group: %s)!"), rsFilename.getData(), PlrGroup.GetError())));
    }
    let fctIcon = new $.C4FacetSurface().init();
    if (PlrGroup.FindEntry$pi8$pStdStrBuf$pu64(S("BigIcon.png")) && fctIcon.Load(PlrGroup, S("BigIcon.png"), -1, -1, false, 0)) {
      this.fHasCustomIcon = true;
    } else {
      fctIcon.Create(iHeight, iHeight);
      $.GraphicsResource.fctPlayerClr.DrawClr(fctIcon, true, this.Core.PrefColorDw);
    }
    this.GrabIcon(fctIcon);
    if (!PlrGroup.Close$v()) {
      $throw(new C4StartupPlrSelDlg$ListItem$LoadError().init($.FormatString(S("Error loading player file from %s: Error closing group: %s"), rsFilename.getData(), PlrGroup.GetError())));
    }
    if (!($rd(P(this.Core.PrefName, 0)) !== 0)) {
      $.SCopy$pi8$pi8$u64($.GetFilenameOnly(rsFilename.getData()), P(this.Core.PrefName, 0), 30);
    }
    C4StartupPlrSelDlg$ListItem.prototype.SetName.call(this, P(this.Core.PrefName, 0));
  }

  ContextMenu$v() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4StartupPlrSelDlg$PlayerListItem && C4StartupPlrSelDlg$PlayerListItem.prototype instanceof $c) return $c.prototype.ContextMenu$v.apply(this, arguments); }
    this.pPlrSelDlg.SetSelection$pListItem(this);
    let pCtx = new $.ContextMenu().init();
    pCtx.AddItem$pi8$pi8$i32$pMenuHandler$pContextHandler($.LoadResStr(S("IDS_BTN_PROPERTIES")), $.LoadResStr(S("IDS_DLGTIP_PLAYERPROPERTIES")), -1 /*Ico_None*/, new $.CBMenuHandler$C4StartupPlrSelDlg().init(this.pPlrSelDlg, "OnPropertyCtx"));
    pCtx.AddItem$pi8$pi8$i32$pMenuHandler$pContextHandler($.LoadResStr(S("IDS_BTN_DELETE")), $.LoadResStr(S("IDS_DLGTIP_PLAYERDELETE")), -1 /*Ico_None*/, new $.CBMenuHandler$C4StartupPlrSelDlg().init(this.pPlrSelDlg, "OnDelCtx"));
    return pCtx;
  }

  GetCore() {
    return this.Core;
  }

  UpdateCore$rC4PlayerInfoCore(NewCore) {
    let PlrGroup = new $.C4Group().init();
    if (!PlrGroup.Open($.Config.AtUserDataPath(this.GetFilename$v$c().getData())) || !NewCore.Save$rC4Group(PlrGroup) || !PlrGroup.Close$v()) {
      this.GetScreen().ShowMessage($.LoadResStr(S("IDS_FAIL_MODIFY")), S(""), 11 /*Ico_Error*/);
      return;
    }
    this.Core.$assign(NewCore);
    C4StartupPlrSelDlg$ListItem.prototype.SetName.call(this, P(this.Core.PrefName, 0));
    if (!this.fHasCustomIcon) {
      this.fHasCustomIcon = false;
      let iHeight = this.GetBounds().Hgt;
      let fctIcon = new $.C4FacetSurface().init();
      fctIcon.Create(iHeight, iHeight);
      $.GraphicsResource.fctPlayerClr.DrawClr(fctIcon, true, this.Core.PrefColorDw);
      this.GrabIcon(fctIcon);
    }
    let pDlg = this.GetDlg();
    if (pDlg != null && pDlg.GetSelection$v() === this) {
      pDlg.UpdateSelection$v();
    }
  }

  GrabCustomIcon(fctGrabFrom) {
    this.fHasCustomIcon = !(fctGrabFrom.Surface == null);
    this.GrabIcon(fctGrabFrom);
  }

  SetSelectionInfo(pSelectionInfo) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4StartupPlrSelDlg$PlayerListItem && C4StartupPlrSelDlg$PlayerListItem.prototype instanceof $c) return $c.prototype.SetSelectionInfo.apply(this, arguments); }
    pSelectionInfo.ClearText$b(false);
    pSelectionInfo.AddTextLine$pi8$pCStdFont$u32$b$b$pCStdFont($.FormatString(S("%s"), P(this.Core.PrefName, 0)).getData(), $.C4Startup.Get().Graphics.BookFontCapt, 0xffffffff, false, false);
    pSelectionInfo.AddTextLine$pi8$pCStdFont$u32$b$b$pCStdFont($.FormatString($.LoadResStr(S("IDS_DESC_PLAYER")), this.Core.TotalScore, this.Core.Rounds, this.Core.RoundsWon, this.Core.RoundsLost, TimeString(this.Core.TotalPlayingTime).getData(), P(this.Core.Comment, 0)).getData(), $.C4Startup.Get().Graphics.BookFont, 0xffffffff, false, false);
    if (this.Core.LastRound.Title.op_index(0) !== 0) {
      pSelectionInfo.AddTextLine$pi8$pCStdFont$u32$b$b$pCStdFont($.FormatString($.LoadResStr(S("IDS_DESC_LASTGAME")), this.Core.LastRound.Title.getData(), DateString(this.Core.LastRound.Date | 0).getData(), TimeString(this.Core.LastRound.Duration).getData(), this.Core.LastRound.FinalScore).getData(), $.C4Startup.Get().Graphics.BookFont, 0xffffffff, false, false);
    }
    pSelectionInfo.UpdateHeight();
  }

  GetDelWarning() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4StartupPlrSelDlg$PlayerListItem && C4StartupPlrSelDlg$PlayerListItem.prototype instanceof $c) return $c.prototype.GetDelWarning.apply(this, arguments); }
    let sWarning = new $.StdStrBuf();
    sWarning.Format($.LoadResStr(S("IDS_MSG_DELETEPLR")), P(this.Core.PrefName, 0));
    let iPlrTime = this.Core.TotalPlayingTime;
    if (iPlrTime > 36000) {
      sWarning.Append$pi8($.FormatString($.LoadResStr(S("IDS_MSG_DELETEPLR_PLAYTIME")), TimeString(iPlrTime).getData()).getData());
    }
    return sWarning;
  }

  MoveFilename(szToFilename) {
    if ($.ItemIdentical(this.GetFilename$v$c().getData(), szToFilename)) {
      return true;
    }
    let PathFrom = new $.StdStrBuf().init$pi8$b(P($.Config.General.UserDataPath, 0));
    PathFrom.Append$StdStrBuf(this.GetFilename$v$c());
    let PathTo = new $.StdStrBuf().init$pi8$b(P($.Config.General.UserDataPath, 0));
    PathTo.Append$pi8(szToFilename);
    if (!$.MoveItem(PathFrom.getData(), PathTo.getData())) {
      return false;
    }
    this.SetFilename(new $.StdStrBuf().init$pi8$b(szToFilename));
    return true;
  }

  $clone() { return new C4StartupPlrSelDlg$PlayerListItem().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.Core.$assign(o.Core);
    this.fHasCustomIcon = o.fHasCustomIcon;
    return this;
  }
}

export class C4StartupPlrSelDlg$CrewListItem extends C4StartupPlrSelDlg$ListItem {
  fLoaded = false;
  Core = new $.C4ObjectInfoCore().init();
  dwPlrClr = 0;
  pParentGrp = null;

  init(pForDlg, pForListBox, dwPlrClr) {
    super.init(pForDlg, pForListBox, null, false);
    this.fLoaded = false;
    this.Core = new $.C4ObjectInfoCore().init();
    this.dwPlrClr = dwPlrClr;
    this.pParentGrp = null;
    this.$dyn = C4StartupPlrSelDlg$CrewListItem;
    this.SetIcon$i32(2 /*Ico_Wait*/);
    return this;
  }

  $dtor() {
    super.$dtor();
  }

  Load$rC4Group$StdStrBuf(rGrp, rsFilename) {
    this.SetFilename(rsFilename);
    let CrewGroup = new $.C4Group().init();
    if (!CrewGroup.OpenAsChild(rGrp, rsFilename.getData())) {
      $throw(new C4StartupPlrSelDlg$ListItem$LoadError().init($.FormatString(S("Error loading crew file from %s in %s: Error opening group: %s"), rsFilename.getData(), rGrp.GetFullName().getData(), CrewGroup.GetError())));
    }
    if (!$.C4ObjectInfoCore.prototype.Load$rC4Group.call(this.Core, CrewGroup)) {
      $throw(new C4StartupPlrSelDlg$ListItem$LoadError().init($.FormatString(S("Error loading crew file from %s: Core data invalid or missing (Group: %s)!"), CrewGroup.GetFullName().getData(), CrewGroup.GetError())));
    }
    C4StartupPlrSelDlg$ListItem.prototype.SetName.call(this, P(this.Core.Name, 0));
    this.pCheck.SetChecked(!(this.Core.Participation === 0));
    let fctIcon = new $.C4FacetSurface().init();
    if (fctIcon.Load(CrewGroup, S("Rank.png"), -1, -1, false, 1)) {
      this.GrabIcon(fctIcon);
    } else {
      if ($.C4RankSystem.DrawRankSymbol(fctIcon, this.Core.Rank, $.GraphicsResource.fctRank, $.GraphicsResource.iNumRanks, true)) {
        this.GrabIcon(fctIcon);
      }
    }
    this.pParentGrp = rGrp;
    this.fLoaded = true;
  }

  ContextMenu$v() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4StartupPlrSelDlg$CrewListItem && C4StartupPlrSelDlg$CrewListItem.prototype instanceof $c) return $c.prototype.ContextMenu$v.apply(this, arguments); }
    this.pPlrSelDlg.SetSelection$pListItem(this);
    let pCtx = new $.ContextMenu().init();
    pCtx.AddItem$pi8$pi8$i32$pMenuHandler$pContextHandler($.LoadResStr(S("IDS_BTN_RENAME")), $.LoadResStr(S("IDS_DESC_CREWRENAME")), -1 /*Ico_None*/, new $.CBMenuHandler$C4StartupPlrSelDlg().init(this.pPlrSelDlg, "OnPropertyCtx"));
    pCtx.AddItem$pi8$pi8$i32$pMenuHandler$pContextHandler($.LoadResStr(S("IDS_BTN_DELETE")), $.LoadResStr(S("IDS_MSG_DELETECLONK_DESC")), -1 /*Ico_None*/, new $.CBMenuHandler$C4StartupPlrSelDlg().init(this.pPlrSelDlg, "OnDelCtx"));
    pCtx.AddItem$pi8$pi8$i32$pMenuHandler$pContextHandler($.LoadResStr(S("IDS_MSG_SETDEATHMESSAGE")), $.LoadResStr(S("IDS_MSG_SETTHEMESSAGETHATAPPEARWH")), -1 /*Ico_None*/, new $.CBMenuHandler$CrewListItem().init(this, "OnDeathMessageCtx"));
    return pCtx;
  }

  RewriteCore() {
    if (!this.fLoaded) {
      return;
    }
    let CrewGroup = new $.C4Group().init();
    if (!CrewGroup.OpenAsChild(this.pParentGrp, this.GetFilename$v$c().getData()) || !this.Core.Save$rC4Group$pC4DefList(CrewGroup, null) || !CrewGroup.Close$v() || !this.pParentGrp.Save(true)) {
      this.GetScreen().ShowMessage($.LoadResStr(S("IDS_FAIL_MODIFY")), S(""), 11 /*Ico_Error*/);
      return;
    }
  }

  AbortRenaming$C4StartupPlrSelDlg$CrewListItem$RenameParams(_par) {
    this.pPlrSelDlg.pRenameEdit = null;
  }

  *DoRenaming$C4StartupPlrSelDlg$CrewListItem$RenameParams$pi8(_par, szNewName) {
    if (!(yield* this.SetName(szNewName))) {
      return 0 /*RR_Invalid*/;
    }
    this.pPlrSelDlg.pRenameEdit = null;
    let pDlg = this.GetDlg();
    if (pDlg != null && pDlg.GetSelection$v() === this) {
      pDlg.UpdateSelection$v();
    }
    return 1 /*RR_Accepted*/;
  }

  UpdateClonkEnabled() {
    if (!this.fLoaded) {
      return;
    }
    this.Core.Participation = this.pCheck.GetChecked() ? 1 : 0;
    this.RewriteCore();
  }

  SetSelectionInfo(pSelectionInfo) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4StartupPlrSelDlg$CrewListItem && C4StartupPlrSelDlg$CrewListItem.prototype instanceof $c) return $c.prototype.SetSelectionInfo.apply(this, arguments); }
    pSelectionInfo.ClearText$b(false);
    pSelectionInfo.AddTextLine$pi8$pCStdFont$u32$b$b$pCStdFont($.FormatString(S("%s %s"), this.Core.sRankName.getData(), P(this.Core.Name, 0)).getData(), $.C4Startup.Get().Graphics.BookFontCapt, 0xffffffff, false, false);
    let sPromo = new $.StdStrBuf();
    const iNextRankExp = [0];
    let sNextRankName = new $.StdStrBuf();
    if (this.Core.GetNextRankInfo($.DefaultRanks, P(iNextRankExp, 0), sNextRankName)) {
      sPromo.Format($.LoadResStr(S("IDS_DESC_PROMO")), sNextRankName.getData(), iNextRankExp[0]);
    } else {
      sPromo.Copy$pi8($.LoadResStr(S("IDS_DESC_NOPROMO")));
    }
    pSelectionInfo.AddTextLine$pi8$pCStdFont$u32$b$b$pCStdFont($.FormatString($.LoadResStr(S("IDS_DESC_OBJECT")), P(this.Core.TypeName, 0), this.Core.Experience, this.Core.Rounds, this.Core.DeathCount, sPromo.getData(), TimeString(this.Core.TotalPlayingTime).getData(), DateString(this.Core.Birthday).getData()).getData(), $.C4Startup.Get().Graphics.BookFont, 0xffffffff, false, false);
    pSelectionInfo.UpdateHeight();
  }

  GetDelWarning() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4StartupPlrSelDlg$CrewListItem && C4StartupPlrSelDlg$CrewListItem.prototype instanceof $c) return $c.prototype.GetDelWarning.apply(this, arguments); }
    let sWarning = new $.StdStrBuf();
    sWarning.Format($.LoadResStr(S("IDS_MSG_DELETECLONK")), this.Core.sRankName.getData(), P(this.Core.Name, 0), this.GetFilename$v$c().getData());
    let iPlrTime = this.Core.TotalPlayingTime;
    if (iPlrTime > 36000) {
      sWarning.Append$StdStrBuf($.FormatString($.LoadResStr(S("IDS_MSG_DELETECLONK_PLAYTIME")), TimeString(iPlrTime).getData()));
    }
    return sWarning;
  }

  GetCore() {
    return this.Core;
  }

  GetNext$v$c() {
    return C4StartupPlrSelDlg$ListItem.prototype.GetNext$v$c.call(this);
  }

  CrewRename() {
    if (this.pPlrSelDlg.pRenameEdit != null) {
      return;
    }
    this.pPlrSelDlg.pRenameEdit = new $.CallbackRenameEdit$CrewListItem$RenameParams().init(this.pNameLabel, this, new C4StartupPlrSelDlg$CrewListItem$RenameParams(), "DoRenaming$C4StartupPlrSelDlg$CrewListItem$RenameParams$pi8", "AbortRenaming$C4StartupPlrSelDlg$CrewListItem$RenameParams");
  }

  *SetName(szNewName) {
    if (!this.fLoaded) {
      return false;
    }
    if (szNewName == null || szNewName.a[szNewName.o] === 0) {
      return false;
    }
    if ($.SEqual(szNewName, P(this.Core.Name, 0))) {
      return true;
    }
    const fn = new Int8Array(4097);
    $.SCopy$pi8$pi8$u64(szNewName, P(fn, 0), 4096);
    $.MakeFilenameFromTitle(P(fn, 0));
    if (!($rd(P(fn, 0)) !== 0)) {
      return false;
    }
    $.SAppend(S(".oci"), P(fn, 0), 4096);
    if (!$.ItemIdentical(P(fn, 0), this.GetFilename$v$c().getData())) {
      if (this.pParentGrp.FindEntry$pi8$pStdStrBuf$pu64(P(fn, 0))) {
        let sMsg = new $.StdStrBuf();
        sMsg.Format($.LoadResStr(S("IDS_ERR_CLONKCOLLISION")), P(fn, 0));
        (yield* $.pGUI.ShowMessageModal(sMsg.getData(), $.LoadResStr(S("IDS_FAIL_RENAME")), 1, 11 /*Ico_Error*/));
        return false;
      }
      if (!this.pParentGrp.Rename(this.GetFilename$v$c().getData(), P(fn, 0)) || !this.pParentGrp.Save(true)) {
        let sMsg = new $.StdStrBuf();
        sMsg.Format($.LoadResStr(S("IDS_ERR_RENAMEFILE")), this.GetFilename$v$c().getData(), P(fn, 0));
        (yield* $.pGUI.ShowMessageModal(sMsg.getData(), $.LoadResStr(S("IDS_FAIL_RENAME")), 1, 11 /*Ico_Error*/));
        return false;
      }
      let szConstFn = P(fn, 0);
      this.SetFilename(new $.StdStrBuf().init$pi8$b(szConstFn));
    }
    C4StartupPlrSelDlg$ListItem.prototype.SetName.call(this, szNewName);
    $.SCopy$pi8$pi8$u64(szNewName, P(this.Core.Name, 0), 30);
    this.RewriteCore();
    return true;
  }

  OnDeathMessageCtx(_el) {
    let pDlg = null;
    this.GetScreen().ShowRemoveDlg(pDlg = new $.InputDialog().init($.LoadResStr(S("IDS_MSG_ENTERNEWDEATHMESSAGE")), $.LoadResStr(S("IDS_MSG_SETDEATHMESSAGE")), 273 /*Ico_Ex_Comment*/, new $.InputCallback$CrewListItem().init(this, "OnDeathMessageSet"), false));
    pDlg.SetMaxText(75);
    pDlg.SetInputText(P(this.Core.DeathMessage, 0));
  }

  OnDeathMessageSet(rsNewMessage) {
    if (rsNewMessage.op_not()) {
      $wr(P(this.Core.DeathMessage, 0), 0, 0);
    } else {
      $.SCopy$pi8$pi8$u64(rsNewMessage.getData(), P(this.Core.DeathMessage, 0), 75);
    }
    this.RewriteCore();
    $.GUISound(S("UI::Confirmed"));
  }

  $clone() { return new C4StartupPlrSelDlg$CrewListItem().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.fLoaded = o.fLoaded;
    this.Core.$assign(o.Core);
    this.dwPlrClr = o.dwPlrClr;
    this.pParentGrp = o.pParentGrp;
    return this;
  }
}

export class C4StartupPlrSelDlg extends C4StartupDlg {
  pKeyBack = null;
  pKeyProperties = null;
  pKeyCrew = null;
  pKeyDelete = null;
  pKeyRename = null;
  pKeyNew = null;
  pPlrListBox = null;
  pSelectionInfo = null;
  eMode = 0 /*PSDM_Player*/;
  CurrPlayer = new C4StartupPlrSelDlg$CurrPlayer_t().None();
  rcBottomButtons = new $.C4Rect();
  iBottomButtonWidth = 0;
  btnActivatePlr = null;
  btnCrew = null;
  btnProperties = null;
  btnDelete = null;
  btnBack = null;
  btnNew = null;
  pRenameEdit = null;

  init() {
    super.init(S("W"));
    this.eMode = 0 /*PSDM_Player*/;
    this.CurrPlayer = new C4StartupPlrSelDlg$CurrPlayer_t().None();
    this.rcBottomButtons = new $.C4Rect();
    this.pRenameEdit = null;
    this.$dyn = C4StartupPlrSelDlg;
    this.UpdateSize();
    let iButtonHeight = 32;
    let iButtonXSpacing = this.GetClientRect().Wdt > 700 ? this.GetClientRect().Wdt / 58 | 0 : 2;
    let iButtonCount = 6;
    let caMain = new $.ComponentAligner().init(this.GetClientRect(), 0, 0, true);
    let caButtonArea = new $.ComponentAligner().init(caMain.GetFromBottom$i32$i32($max(caMain.GetHeight() / 15 | 0, iButtonHeight)), 0, 0);
    this.rcBottomButtons.$assign(caButtonArea.GetCentered$i32$i32(caMain.GetWidth(), iButtonHeight));
    this.iBottomButtonWidth = (caButtonArea.GetWidth() - Math.imul(iButtonXSpacing, iButtonCount - 1 | 0) | 0) / iButtonCount | 0;
    let rcMain = caMain.GetAll$v().$clone();
    let rcPlrList = new $.C4Rect().init$i32$i32$i32$i32(rcMain.Wdt / 8 | 0, rcMain.Hgt / 8 | 0, Math.imul(rcMain.Wdt, 5) / 16 | 0, Math.imul(rcMain.Hgt, 6) / 8 | 0);
    let rcInfoWindow = new $.C4Rect().init$i32$i32$i32$i32(Math.imul(rcMain.Wdt, 9) / 16 | 0, rcMain.Hgt / 8 | 0, Math.imul(rcMain.Wdt, 5) / 16 | 0, Math.imul(rcMain.Hgt, 6) / 8 | 0);
    $.Container.prototype.AddElement$pElement.call(this, this.pPlrListBox = new $.ListBox().init(rcPlrList));
    this.pPlrListBox.SetToolTip($.LoadResStr(S("IDS_DLGTIP_PLAYERFILES")));
    this.pPlrListBox.SetDecoration$b$pScrollBarFacets$b$b(true, $.C4Startup.Get().Graphics.sfctBookScroll, true);
    this.pPlrListBox.UpdateElementPositions();
    this.pPlrListBox.SetSelectionChangeCallbackFn(new $.CallbackHandler$C4StartupPlrSelDlg().init(this, "OnSelChange"));
    this.pPlrListBox.SetSelectionDblClickFn(new $.CallbackHandler$C4StartupPlrSelDlg().init(this, "OnSelDblClick"));
    $.Container.prototype.AddElement$pElement.call(this, this.pSelectionInfo = new $.TextWindow().init(rcInfoWindow, 0, 0, 0, 100, 4096, S("  "), false, null, 0, true));
    this.pSelectionInfo.SetDecoration$b$b$pScrollBarFacets$b(true, true, $.C4Startup.Get().Graphics.sfctBookScroll, true);
    this.pSelectionInfo.UpdateHeight();
    let rcDefault = new $.C4Rect().init$i32$i32$i32$i32(0, 0, 10, 10);
    $.Container.prototype.AddElement$pElement.call(this, this.btnBack = new $.CallbackButton$C4StartupPlrSelDlg$Button().init$pi8$rC4Rect$x$pC4StartupPlrSelDlg($.LoadResStr(S("IDS_BTN_BACK")), rcDefault, "OnBackBtn"));
    $.Container.prototype.AddElement$pElement.call(this, this.btnNew = new $.CallbackButton$C4StartupPlrSelDlg$Button().init$pi8$rC4Rect$x$pC4StartupPlrSelDlg($.LoadResStr(S("IDS_BTN_NEW")), rcDefault, "OnNewBtn"));
    this.btnNew.SetToolTip($.LoadResStr(S("IDS_DLGTIP_NEWPLAYER")));
    $.Container.prototype.AddElement$pElement.call(this, this.btnActivatePlr = new $.CallbackButton$C4StartupPlrSelDlg$Button().init$pi8$rC4Rect$x$pC4StartupPlrSelDlg(null, rcDefault, "OnActivateBtn"));
    $.Container.prototype.AddElement$pElement.call(this, this.btnDelete = new $.CallbackButton$C4StartupPlrSelDlg$Button().init$pi8$rC4Rect$x$pC4StartupPlrSelDlg($.LoadResStr(S("IDS_BTN_DELETE")), rcDefault, "OnDelBtn"));
    $.Container.prototype.AddElement$pElement.call(this, this.btnProperties = new $.CallbackButton$C4StartupPlrSelDlg$Button().init$pi8$rC4Rect$x$pC4StartupPlrSelDlg(null, rcDefault, "OnPropertyBtn"));
    $.Container.prototype.AddElement$pElement.call(this, this.btnCrew = new $.CallbackButton$C4StartupPlrSelDlg$Button().init$pi8$rC4Rect$x$pC4StartupPlrSelDlg($.LoadResStr(S("IDS_SELECT_CREW")), rcDefault, "OnCrewBtn"));
    this.btnCrew.SetToolTip($.LoadResStr(S("IDS_DLGTIP_PLAYERCREW")));
    C4StartupPlrSelDlg.prototype.UpdatePlayerList.call(this);
    if (!(this.pPlrListBox.GetFirst() != null)) {
      C4StartupPlrSelDlg.prototype.UpdateSelection$v.call(this);
    }
    this.SetFocus(this.pPlrListBox, false);
    let keys = [];
    $vpush(keys, new $.C4KeyCodeEx().init(14));
    $vpush(keys, new $.C4KeyCodeEx().init(105));
    $vpush(keys, new $.C4KeyCodeEx().init(1));
    if ($.Config.Controls.GamepadGuiControl !== 0) {
      $.Cancel(keys);
    }
    this.pKeyBack = new $.C4KeyBinding().init$vector$pi8$i32$pC4KeyboardCallbackInterface$u32(keys, S("StartupPlrSelBack"), 2 /*KEYSCOPE_Gui*/, new $.DlgKeyCB$C4StartupPlrSelDlg().init(this, "KeyBack"), 4);
    this.pKeyProperties = new $.C4KeyBinding().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(60), S("StartupPlrSelProp"), 2 /*KEYSCOPE_Gui*/, new $.DlgKeyCB$C4StartupPlrSelDlg().init(this, "KeyProperties"), 4);
    this.pKeyCrew = new $.C4KeyBinding().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(106), S("StartupPlrSelCrew"), 2 /*KEYSCOPE_Gui*/, new $.ControlKeyDlgCB$C4StartupPlrSelDlg().init(this.pPlrListBox, this, "KeyCrew"), 4);
    this.pKeyDelete = new $.C4KeyBinding().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(111), S("StartupPlrSelDelete"), 2 /*KEYSCOPE_Gui*/, new $.DlgKeyCB$C4StartupPlrSelDlg().init(this, "KeyDelete"), 4);
    this.pKeyNew = new $.C4KeyBinding().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(110), S("StartupPlrSelNew"), 2 /*KEYSCOPE_Gui*/, new $.DlgKeyCB$C4StartupPlrSelDlg().init(this, "KeyNew"), 4);
    return this;
  }

  $dtor() {
    $delete(this.pKeyDelete);
    $delete(this.pKeyCrew);
    $delete(this.pKeyProperties);
    $delete(this.pKeyBack);
    $delete(this.pKeyNew);
    super.$dtor();
  }

  UpdateBottomButtons() {
    let caBottomButtons = new $.ComponentAligner().init(this.rcBottomButtons, 0, 0);
    switch (this.eMode) {
      case 0:
        {
          this.btnProperties.SetText$pi8($.LoadResStr(S("IDS_BTN_PROPERTIES")));
          this.btnProperties.SetToolTip($.LoadResStr(S("IDS_DLGTIP_PLAYERPROPERTIES")));
          this.btnNew.SetVisibility(true);
          this.btnCrew.SetVisibility(true);
          this.btnDelete.SetToolTip($.LoadResStr(S("IDS_DLGTIP_PLAYERDELETE")));
          this.btnBack.SetToolTip($.LoadResStr(S("IDS_DLGTIP_BACKMAIN")));
          this.btnBack.SetBounds(caBottomButtons.GetGridCell(0, 6, 0, 1, this.iBottomButtonWidth, 32, true));
          this.btnNew.SetBounds(caBottomButtons.GetGridCell(1, 6, 0, 1, this.iBottomButtonWidth, 32, true));
          this.btnActivatePlr.SetBounds(caBottomButtons.GetGridCell(2, 6, 0, 1, this.iBottomButtonWidth, 32, true));
          this.btnDelete.SetBounds(caBottomButtons.GetGridCell(3, 6, 0, 1, this.iBottomButtonWidth, 32, true));
          this.btnProperties.SetBounds(caBottomButtons.GetGridCell(4, 6, 0, 1, this.iBottomButtonWidth, 32, true));
          this.btnCrew.SetBounds(caBottomButtons.GetGridCell(5, 6, 0, 1, this.iBottomButtonWidth, 32, true));
        }
        break;
      case 1:
        {
          this.btnProperties.SetText$pi8($.LoadResStr(S("IDS_BTN_RENAME")));
          this.btnProperties.SetToolTip($.LoadResStr(S("IDS_DESC_CREWRENAME")));
          this.btnNew.SetVisibility(false);
          this.btnCrew.SetVisibility(false);
          this.btnDelete.SetToolTip($.LoadResStr(S("IDS_MSG_DELETECLONK_DESC")));
          this.btnBack.SetToolTip($.LoadResStr(S("IDS_MSG_BACKTOPLAYERDLG")));
          this.btnBack.SetBounds(caBottomButtons.GetGridCell(0, 4, 0, 1, this.iBottomButtonWidth, 32, true));
          this.btnActivatePlr.SetBounds(caBottomButtons.GetGridCell(1, 4, 0, 1, this.iBottomButtonWidth, 32, true));
          this.btnDelete.SetBounds(caBottomButtons.GetGridCell(2, 4, 0, 1, this.iBottomButtonWidth, 32, true));
          this.btnProperties.SetBounds(caBottomButtons.GetGridCell(3, 4, 0, 1, this.iBottomButtonWidth, 32, true));
        }
        break;
    }
    ;
  }

  UpdatePlayerList() {
    this.AbortRenaming$v();
    let pEl = null;
    while ((pEl = this.pPlrListBox.GetFirst()) != null) {
      $delete(pEl);
    }
    this.UpdateBottomButtons();
    switch (this.eMode) {
      case 0:
        {
          this.SetTitle$pi8($.LoadResStrNoAmp(S("IDS_DLG_PLAYERSELECTION")));
          let szFn = null;
          let sSearchPath = new $.StdStrBuf().init$pi8$b(P($.Config.General.UserDataPath, 0));
          let pFirstActivatedPlrItem = null;
          let pFirstDeactivatedPlrItem = null;
          let pPlrItem = null;
          for (let i = new $.DirectoryIterator().init$pi8(sSearchPath.getData()); (szFn = i.op_mul()) != null; i.op_inc$i32(0)) {
            szFn = $.Config.AtRelativePath(szFn);
            if ($rd($.GetFilename(szFn)) === 46) {
              continue;
            }
            if (!$.WildcardMatch(S("*.ocp"), $.GetFilename(szFn))) {
              continue;
            }
            let fIsParticipating = !!$.SIsModule(P($.Config.General.Participants, 0), szFn, null, false);
            pPlrItem = new C4StartupPlrSelDlg$PlayerListItem().init(this, this.pPlrListBox, null, fIsParticipating);
            try {
              pPlrItem.Load$StdStrBuf(new $.StdStrBuf().init$pi8$b(szFn));
            } catch ($e5) {
              if ($e5 instanceof C4StartupPlrSelDlg$ListItem$LoadError) {
                const e = $e5;
                $.DebugLog(e.getData());
                $delete(pPlrItem);
                continue;
              } else {
                throw $e5;
              }
            }
            if (fIsParticipating) {
              if (pFirstActivatedPlrItem == null) {
                pFirstActivatedPlrItem = pPlrItem;
              }
            } else if (pFirstDeactivatedPlrItem == null) {
              pFirstDeactivatedPlrItem = pPlrItem;
            }
          }
          if (!((pPlrItem = pFirstActivatedPlrItem) != null)) {
            pPlrItem = pFirstDeactivatedPlrItem;
          }
          if (pPlrItem != null) {
            this.pPlrListBox.SelectEntry(pPlrItem, false);
          }
          this.UpdateActivatedPlayers();
          break;
        }
      case 1:
        {
          this.SetTitle$pi8($.FormatString(S("%s %s"), $.LoadResStrNoAmp(S("IDS_CTL_CREW")), P(this.CurrPlayer.Core.PrefName, 0)).getData());
          let fSucc = false;
          const szFn = new Int8Array(4097);
          for (fSucc = this.CurrPlayer.Grp.FindEntry$pi8$pi8(S("*.oci"), P(szFn, 0)); fSucc; fSucc = this.CurrPlayer.Grp.FindNextEntry$pi8$pi8$pu64$b(S("*.oci"), P(szFn, 0), null, true)) {
            let pCrewItem = new C4StartupPlrSelDlg$CrewListItem().init(this, this.pPlrListBox, this.CurrPlayer.Core.PrefColorDw);
            try {
              pCrewItem.Load$rC4Group$StdStrBuf(this.CurrPlayer.Grp, new $.StdStrBuf().init$pi8$b(P(szFn, 0)));
            } catch ($e5) {
              if ($e5 instanceof C4StartupPlrSelDlg$ListItem$LoadError) {
                const e = $e5;
                $.DebugLog(e.getData());
                $delete(pCrewItem);
                continue;
              } else {
                throw $e5;
              }
            }
          }
          this.ResortCrew();
          this.pPlrListBox.SelectFirstEntry(false);
          break;
        }
    }
  }

  UpdateSelection$v() {
    this.AbortRenaming$v();
    let pSel = this.GetSelection$v();
    if (pSel != null && pSel.IsActivated()) {
      this.btnActivatePlr.SetText$pi8($.LoadResStr(S("IDS_BTN_DEACTIVATE")));
      this.btnActivatePlr.SetToolTip($.FormatString($.LoadResStr(S("IDS_MSG_NOPARTICIPATE_DESC")), pSel.GetName()).getData());
    } else {
      this.btnActivatePlr.SetText$pi8($.LoadResStr(S("IDS_BTN_ACTIVATE")));
      this.btnActivatePlr.SetToolTip($.FormatString($.LoadResStr(S("IDS_MSG_PARTICIPATE_DESC")), pSel != null ? pSel.GetName() : S("")).getData());
    }
    if (pSel == null) {
      this.pSelectionInfo.ClearText$b(true);
      return;
    }
    pSel.SetSelectionInfo(this.pSelectionInfo);
  }

  OnSelChange(_pEl) {
    this.UpdateSelection$v();
  }

  OnSelDblClick(_pEl) {
    $.GUISound(S("UI::Click"));
    this.OnPropertyBtn(null);
  }

  UpdateActivatedPlayers() {
    0;
    $wr(P($.Config.General.Participants, 0), 0, 0);
    for (let pPlrItem = this.pPlrListBox.GetFirst(); pPlrItem != null; pPlrItem = C4StartupPlrSelDlg$ListItem.prototype.GetNext$v$c.call(pPlrItem)) {
      if (pPlrItem.IsActivated()) {
        let szAddFilename = pPlrItem.GetFilename$v$c().getData();
        if (c$strlen(P($.Config.General.Participants, 0)) + 1 + c$strlen(szAddFilename) < 1025) {
          $.SAddModule(P($.Config.General.Participants, 0), szAddFilename);
        } else {
          pPlrItem.SetActivated(false);
          this.GetScreen().ShowMessage($.FormatString($.LoadResStr(S("IDS_ERR_PLAYERSTOOLONG")), pPlrItem.GetName()).getData(), $.LoadResStr(S("IDS_ERR_TITLE")), 11 /*Ico_Error*/);
        }
      }
    }
  }

  SelectItem$StdStrBuf$b(Filename, fActivate) {
    for (let pPlrItem = this.pPlrListBox.GetFirst(); pPlrItem != null; pPlrItem = C4StartupPlrSelDlg$ListItem.prototype.GetNext$v$c.call(pPlrItem)) {
      if ($.ItemIdentical(pPlrItem.GetFilename$v$c().getData(), Filename.getData())) {
        this.pPlrListBox.SelectEntry(pPlrItem, false);
        if (fActivate) {
          pPlrItem.SetActivated(true);
          this.OnItemCheckChange(pPlrItem.GetCheckBox());
        }
        return;
      }
    }
  }

  SetPlayerMode() {
    $.GUISound(S("UI::Close"));
    let LastPlrFilename = new $.StdStrBuf();
    LastPlrFilename.Copy$StdStrBuf(this.CurrPlayer.Grp.GetFullName());
    this.CurrPlayer.Grp.Close$v();
    this.eMode = 0 /*PSDM_Player*/;
    this.UpdatePlayerList();
    this.SelectItem$StdStrBuf$b(LastPlrFilename, false);
    this.UpdateSelection$v();
  }

  SetCrewMode(pSel) {
    this.CurrPlayer.Core.$assign(pSel.GetCore());
    let Path = new $.StdStrBuf().init$pi8$b(P($.Config.General.UserDataPath, 0));
    Path.Append$StdStrBuf(pSel.GetFilename$v$c());
    if (!this.CurrPlayer.Grp.Open(Path.getData())) {
      return;
    }
    if (!this.CurrPlayer.Grp.FindEntry$pi8$pStdStrBuf$pu64(S("*.oci"))) {
      let strCrew = new $.StdCopyStrBuf().init$mStdStrBuf($.FormatString(S("%s %s"), $.LoadResStrNoAmp(S("IDS_CTL_CREW")), P(this.CurrPlayer.Core.PrefName, 0)));
      this.GetScreen().ShowMessage($.FormatString($.LoadResStr(S("IDS_ERR_PLRNOCREW")), P(this.CurrPlayer.Core.PrefName, 0)).getData(), strCrew.getData(), 9 /*Ico_Player*/);
      return;
    }
    $.GUISound(S("UI::Open"));
    this.eMode = 1 /*PSDM_Crew*/;
    this.UpdatePlayerList();
    this.UpdateSelection$v();
  }

  static CrewSortFunc(pEl1, pEl2, par) {
    let pItem1 = pEl1;
    let pItem2 = pEl2;
    const rSortData = par;
    let i = std_find_if($begin(rSortData), $end(rSortData), new C4StartupPlrSelDlg_CrewSortDataMatchType().init(pItem1.GetCore().id.$clone()));
    let j = std_find_if($begin(rSortData), $end(rSortData), new C4StartupPlrSelDlg_CrewSortDataMatchType().init(pItem2.GetCore().id.$clone()));
    if (!i.eq(j)) {
      if (i.eq($end(rSortData))) {
        return -1;
      } else if (j.eq($end(rSortData))) {
        return 1;
      }
      return i.v.iMaxExp - j.v.iMaxExp | 0;
    }
    return pItem1.GetCore().Experience - pItem2.GetCore().Experience | 0;
  }

  ResortCrew() {
    0;
    let SortData = [];
    for (let pCrewItem = this.pPlrListBox.GetFirst(); pCrewItem != null; pCrewItem = pCrewItem.GetNext$v$c()) {
      let i = std_find_if($begin(SortData), $end(SortData), new C4StartupPlrSelDlg_CrewSortDataMatchType().init(pCrewItem.GetCore().id.$clone()));
      if (i.eq($end(SortData))) {
        $vpush(SortData, new C4StartupPlrSelDlg_CrewSortDataEntry().init(pCrewItem.GetCore().Experience, pCrewItem.GetCore().id));
      } else {
        i.v.iMaxExp = $max(i.v.iMaxExp, pCrewItem.GetCore().Experience);
      }
    }
    this.pPlrListBox.SortElements(C4StartupPlrSelDlg.CrewSortFunc, SortData);
  }

  OnItemCheckChange(pCheckBox) {
    switch (this.eMode) {
      case 0:
        for (let pEl = this.pPlrListBox.GetFirst(); pEl != null; pEl = C4StartupPlrSelDlg$ListItem.prototype.GetNext$v$c.call(pEl)) {
          if (pCheckBox != null && pEl !== pCheckBox.GetParent()) {
            pEl.SetActivated(false);
          }
        }
        this.UpdateActivatedPlayers();
        break;
      case 1:
        if (pCheckBox != null) {
          pCheckBox.GetParent().UpdateClonkEnabled();
        }
        break;
    }
    this.UpdateSelection$v();
  }

  static CheckPlayerName(Playername, Filename, pPrevFilename, fWarnEmpty) {
    if (!(Playername.getLength() !== 0)) {
      if (fWarnEmpty) {
        $.Screen.GetScreenS().ShowMessage($.LoadResStr(S("IDS_ERR_PLRNAME_EMPTY")), S(""), 11 /*Ico_Error*/);
      }
      return false;
    }
    Filename.Copy$StdStrBuf(Playername);
    $.SReplaceChar(Filename.getMData(), 92, 95);
    $.SReplaceChar(Filename.getMData(), 47, 95);
    $.SReplaceChar(Filename.getMData(), 58, 95);
    $.SReplaceChar(Filename.getMData(), 42, 95);
    $.SReplaceChar(Filename.getMData(), 63, 95);
    $.SReplaceChar(Filename.getMData(), 34, 95);
    $.SReplaceChar(Filename.getMData(), 60, 95);
    $.SReplaceChar(Filename.getMData(), 62, 95);
    $.SReplaceChar(Filename.getMData(), 124, 95);
    if ($rd(Filename.getData()) === 46) {
      $wr(Filename.getMData(), 0, 95);
    }
    Filename.Append$pi8(S(".ocp"));
    let Path = new $.StdStrBuf().init$pi8$b(P($.Config.General.UserDataPath, 0));
    Path.Append$StdStrBuf(Filename);
    if (pPrevFilename == null || !$.ItemIdentical(Path.getData(), $.Config.AtUserDataPath(pPrevFilename.getData()))) {
      if ($.ItemExists(Path.getData())) {
        $.Screen.GetScreenS().ShowMessage($.FormatString($.LoadResStr(S("IDS_ERR_PLRNAME_TAKEN")), Playername.getData()).getData(), S(""), 11 /*Ico_Error*/);
        return false;
      }
    }
    return true;
  }

  GetSelection$v() {
    return this.pPlrListBox.GetSelectedItem();
  }

  SetSelection$pListItem(pNewItem) {
    this.pPlrListBox.SelectEntry(pNewItem, false);
  }

  AbortRenaming$v() {
    if (this.pRenameEdit != null) {
      this.pRenameEdit.Abort$v();
    }
  }

  GetMarginTop() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4StartupPlrSelDlg && C4StartupPlrSelDlg.prototype instanceof $c) return $c.prototype.GetMarginTop.apply(this, arguments); }
    return this.rcBounds.Hgt / 7 | 0;
  }

  HasBackground() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4StartupPlrSelDlg && C4StartupPlrSelDlg.prototype instanceof $c) return $c.prototype.HasBackground.apply(this, arguments); }
    return false;
  }

  DrawElement(cgo) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4StartupPlrSelDlg && C4StartupPlrSelDlg.prototype instanceof $c) return $c.prototype.DrawElement.apply(this, arguments); }
    $.FullscreenDialog.prototype.DrawElement.call(this, cgo);
  }

  OnEnter() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4StartupPlrSelDlg && C4StartupPlrSelDlg.prototype instanceof $c) return $c.prototype.OnEnter.apply(this, arguments); }
    return false;
  }

  OnEscape() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4StartupPlrSelDlg && C4StartupPlrSelDlg.prototype instanceof $c) return $c.prototype.OnEscape.apply(this, arguments); }
    this.DoBack$v();
    return true;
  }

  KeyBack() {
    this.DoBack$v();
    return true;
  }

  KeyProperties() {
    this.OnPropertyBtn(null);
    return true;
  }

  KeyCrew() {
    this.OnCrewBtn(null);
    return true;
  }

  KeyDelete() {
    this.OnDelBtn(null);
    return true;
  }

  KeyNew() {
    this.OnNewBtn(null);
    return true;
  }

  OnNewBtn(_btn) {
    if (this.eMode !== 0) {
      return;
    }
    let pDlg = null;
    this.GetScreen().ShowRemoveDlg(pDlg = new C4StartupPlrPropertiesDlg().init(null, this));
    pDlg.SetPos($min(this.GetBounds().Wdt / 10 | 0, this.GetBounds().Wdt - pDlg.GetBounds().Wdt | 0), $min(this.GetBounds().Hgt / 4 | 0, this.GetBounds().Hgt - pDlg.GetBounds().Hgt | 0));
  }

  OnActivateBtn(_btn) {
    let pSel = this.GetSelection$v();
    if (pSel == null) {
      return;
    }
    pSel.SetActivated(!pSel.IsActivated());
    this.OnItemCheckChange(pSel.GetCheckBox());
  }

  OnPropertyBtn(_btn) {
    this.AbortRenaming$v();
    switch (this.eMode) {
      case 0:
        {
          let pSel = this.GetSelection$v();
          if (pSel == null) {
            return;
          }
          let pDlg = null;
          this.GetScreen().ShowRemoveDlg(pDlg = new C4StartupPlrPropertiesDlg().init(pSel, this));
          pDlg.SetPos($min(this.GetBounds().Wdt / 10 | 0, this.GetBounds().Wdt - pDlg.GetBounds().Wdt | 0), (this.GetBounds().Hgt - pDlg.GetBounds().Hgt | 0) / 2 | 0);
        }
        break;
      case 1:
        let pSel = this.GetSelection$v();
        if (pSel == null) {
          return;
        }
        pSel.CrewRename();
        break;
    }
  }

  OnPropertyCtx(_el) {
    this.OnPropertyBtn(null);
  }

  OnCrewBtn(_btn) {
    if (this.eMode !== 0) {
      return;
    }
    let pSel = this.GetSelection$v();
    if (pSel == null) {
      return;
    }
    this.SetCrewMode(pSel);
  }

  OnDelBtn(_btn) {
    this.AbortRenaming$v();
    let pSel = this.GetSelection$v();
    if (pSel == null) {
      return;
    }
    let sWarning = new $.StdStrBuf();
    sWarning.Take$mStdStrBuf(pSel.GetDelWarning());
    this.GetScreen().ShowRemoveDlg(new $.ConfirmationDialog().init(sWarning.getData(), $.LoadResStr(S("IDS_BTN_DELETE")), new $.CallbackHandlerExPar$C4StartupPlrSelDlg$pListItem().init(this, "OnDelBtnConfirm", pSel), 12));
  }

  OnDelCtx(_el) {
    this.OnDelBtn(null);
  }

  OnDelBtnConfirm(pSel) {
    let Path = new $.StdStrBuf();
    switch (this.eMode) {
      case 0:
        Path.Append$pi8(P($.Config.General.UserDataPath, 0));
        Path.Append$StdStrBuf(pSel.GetFilename$v$c());
        if (!$.C4Group_DeleteItem(Path.getData())) {
          let sMsg = new $.StdStrBuf();
          sMsg.Copy$pi8($.LoadResStr(S("IDS_FAIL_DELETE")));
          this.GetScreen().ShowMessage(sMsg.getData(), $.LoadResStr(S("IDS_DLG_CLEAR")), 11 /*Ico_Error*/);
        }
        break;
      case 1:
        if (!this.CurrPlayer.Grp.DeleteEntry(pSel.GetFilename$v$c().getData())) {
          let sMsg = new $.StdStrBuf();
          sMsg.Copy$pi8($.LoadResStr(S("IDS_FAIL_DELETE")));
          this.GetScreen().ShowMessage(sMsg.getData(), $.LoadResStr(S("IDS_DLG_CLEAR")), 11 /*Ico_Error*/);
        }
        break;
    }
    this.UpdatePlayerList();
  }

  OnBackBtn(_btn) {
    this.DoBack$v();
  }

  DoBack$v() {
    switch (this.eMode) {
      case 0:
        {
          $.C4Startup.Get().SwitchDialog(9 /*SDID_Back*/);
          break;
        }
      case 1:
        this.SetPlayerMode();
        break;
    }
  }

  $clone() { return new C4StartupPlrSelDlg().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pKeyBack = o.pKeyBack;
    this.pKeyProperties = o.pKeyProperties;
    this.pKeyCrew = o.pKeyCrew;
    this.pKeyDelete = o.pKeyDelete;
    this.pKeyRename = o.pKeyRename;
    this.pKeyNew = o.pKeyNew;
    this.pPlrListBox = o.pPlrListBox;
    this.pSelectionInfo = o.pSelectionInfo;
    this.eMode = o.eMode;
    this.CurrPlayer.$assign(o.CurrPlayer);
    this.rcBottomButtons.$assign(o.rcBottomButtons);
    this.iBottomButtonWidth = o.iBottomButtonWidth;
    this.btnActivatePlr = o.btnActivatePlr;
    this.btnCrew = o.btnCrew;
    this.btnProperties = o.btnProperties;
    this.btnDelete = o.btnDelete;
    this.btnBack = o.btnBack;
    this.btnNew = o.btnNew;
    this.pRenameEdit = o.pRenameEdit;
    return this;
  }
}



export function TimeString(iSeconds) {
  let iHours = iSeconds / 3600 | 0;
  iSeconds = iSeconds - Math.imul(3600, iHours) | 0;
  let iMinutes = iSeconds / 60 | 0;
  iSeconds = iSeconds - Math.imul(60, iMinutes) | 0;
  return $.FormatString(S("%02d:%02d:%02d"), iHours, iMinutes, iSeconds);
}

export function DateString(iTime) {
  if (iTime === 0) {
    return new $.StdStrBuf().init$pi8$b(S(""), true);
  }
  const tTime = [iTime];
  let pLocalTime = null;
  pLocalTime = c$localtime(P(tTime, 0));
  return $.FormatString(S("%02d.%02d.%d %02d:%02d"), pLocalTime.tm_mday, pLocalTime.tm_mon + 1 | 0, pLocalTime.tm_year + 1900 | 0, pLocalTime.tm_hour, pLocalTime.tm_min);
}

export function $init(): void {
  C4StartupPlrColorPickerDlg$Picker.HSPickerCursorSize = 5;
  C4StartupPlrColorPickerDlg$Picker.VPickerCursorSize = 7;
  $.ClrPlayerItem$C4StartupPlrSelDlg = 0xffffffff;
  $.PlayerColorValueLowBound$C4StartupPlrSelDlg = 64;
}

Object.assign($, { C4StartupPlrColorPickerDlg, C4StartupPlrColorPickerDlg$Picker, C4StartupPlrPropertiesDlg, C4StartupPlrSelDlg, C4StartupPlrSelDlg$CrewListItem, C4StartupPlrSelDlg$CrewListItem$RenameParams, C4StartupPlrSelDlg$CurrPlayer_t, C4StartupPlrSelDlg$ListItem, C4StartupPlrSelDlg$ListItem$LoadError, C4StartupPlrSelDlg$PlayerListItem, C4StartupPlrSelDlg_CrewSortDataEntry, C4StartupPlrSelDlg_CrewSortDataMatchType, DateString, TimeString });
