// @ts-nocheck
// OpenClonk 36de799: src/gui/C4FileSelDlg.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { Control, Dialog } from './C4Gui.ts';
import { StdThread } from '../platform/StdScheduler.ts';
import { $spawn } from '../../rt/coro.ts';
import { $u64n } from '../../rt/int.ts';
import { c$getenv } from '../../rt/libc.ts';
import { $oarr, $oat, $oidx, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $begin, $delete, $max, seq_erase } from '../../rt/std.ts';

export class C4FileSel_BaseCB {

  $clone() { return new C4FileSel_BaseCB().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class C4FileSelDlg$Location {
  sName = new $.StdCopyStrBuf();
  sPath = new $.StdCopyStrBuf();

  None() {
    this.sName = new $.StdCopyStrBuf();
    this.sPath = new $.StdCopyStrBuf();
    return this;
  }

  $clone() { return new C4FileSelDlg$Location().$assign(this); }
  $assign(o) {
    this.sName.$assign(o.sName);
    this.sPath.$assign(o.sPath);
    return this;
  }
}

export class C4FileSel_CBEx$MainDlg extends C4FileSel_BaseCB {
  pCBClass = null;
  SelFunc = null;
  idToken = 0;

  OnFileSelected(szFilename) {
    if (this.pCBClass != null && this.SelFunc != null) {
      $spawn(this.pCBClass[this.SelFunc](szFilename, this.idToken));
    }
  }

  init(pCBClass, SelFunc, idToken) {
    this.pCBClass = pCBClass;
    this.SelFunc = SelFunc;
    this.idToken = idToken;
    return this;
  }

  $clone() { return new C4FileSel_CBEx$MainDlg().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pCBClass = o.pCBClass;
    this.SelFunc = o.SelFunc;
    this.idToken = o.idToken;
    return this;
  }
}

export class C4PortraitSelDlg$LoaderThread extends StdThread {
  LoadItems = [];

  init() {
    this.LoadItems = [];
    return this;
  }

  $dtor() {
    this.Stop();
    super.$dtor();
  }

  ClearLoadItems() {
    this.Stop();
    this.LoadItems.length = 0;
  }

  AddLoadItem(pItem) {
    0;
    this.LoadItems.push(pItem);
  }

  Execute() {
    if (this.LoadItems.length === 0) {
      this.SignalStop();
      return;
    }
    let pLoadItem = this.LoadItems[0];
    pLoadItem.Load$v();
    seq_erase(this.LoadItems, $begin(this.LoadItems));
  }

  $clone() { return new C4PortraitSelDlg$LoaderThread().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.LoadItems = o.LoadItems.slice();
    return this;
  }
}

export class C4FileSelDlg extends Dialog {
  pKeyRefresh = null;
  pKeyEnterOverride = null;
  pLocationComboBox = null;
  pFileListBox = null;
  pSelectionInfoBox = null;
  btnOK = null;
  sTitle = new $.StdCopyStrBuf();
  sPath = new $.StdCopyStrBuf();
  pLocations = null;
  iLocationCount = 0;
  iCurrentLocationIndex = 0;
  pSelection = null;
  pSelCallback = null;

  UpdateFileList() {
    this.BeginFileListUpdate();
    let pEl = null;
    while ((pEl = this.pFileListBox.GetFirst()) != null) {
      $delete(pEl);
    }
    let sSearch = new $.StdStrBuf();
    let szFileMask = this.GetFileMask();
    for (let iter = new $.DirectoryIterator().init$pi8(this.sPath.getData()); iter.op_mul() != null; iter.op_inc$v()) {
      if (szFileMask == null || $.WildcardListMatch(szFileMask, iter.op_mul())) {
        this.pFileListBox.AddElement$pElement$i32(this.CreateListItem(iter.op_mul()));
      }
    }
    if (this.HasNoneItem()) {
      this.pFileListBox.AddElement$pElement$i32(this.CreateListItem(null));
    }
    this.EndFileListUpdate();
    let szPath = this.sPath.getData();
    this.SetTitle$pi8$b(szPath.a[szPath.o] !== 0 ? $.FormatString(S("%s [%s]"), this.sTitle.getData(), szPath).getData() : this.sTitle.getData());
    this.UpdateSelection$v();
  }

  OnShown$v() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4FileSelDlg && C4FileSelDlg.prototype instanceof $c) return $c.prototype.OnShown$v.apply(this, arguments); }
    $spawn($.Dialog.prototype.OnShown$v.call(this));
    this.UpdateFileList();
  }

  UserClose$b(fOK) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4FileSelDlg && C4FileSelDlg.prototype instanceof $c) return $c.prototype.UserClose$b.apply(this, arguments); }
    if (!fOK || this.pSelection != null) {
      this.Close$b(fOK);
    } else {
      this.GetScreen().ShowErrorMessage($.LoadResStr(S("IDS_ERR_PLEASESELECTAFILEFIRST")));
    }
  }

  OnClosed(fOK) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4FileSelDlg && C4FileSelDlg.prototype instanceof $c) return $c.prototype.OnClosed.apply(this, arguments); }
    if (fOK && this.pSelection != null && this.pSelCallback != null) {
      this.pSelCallback.OnFileSelected(this.pSelection.GetFilename$v());
    }
    $.Dialog.prototype.OnClosed.call(this, fOK);
  }

  GetFileMask() {
    return null;
  }

  IsMultiSelection() {
    return false;
  }

  IsItemGrayed(_szFilename) {
    return false;
  }

  UpdateSelection$v() {
    this.pSelection = this.pFileListBox.GetSelectedItem();
    if (this.pSelectionInfoBox != null) {
      this.pSelectionInfoBox.ClearText$b(false);
      if (this.pSelection == null) {
        this.pSelectionInfoBox.UpdateHeight();
        return;
      }
      if (this.pSelection.GetFilename$v() != null) {
        this.pSelectionInfoBox.AddTextLine$pi8$pCStdFont$u32$b$b$pCStdFont(this.pSelection.GetFilename$v(), $.GraphicsResource.TextFont, 0xffffffff, true, false);
      }
    }
  }

  HasNoneItem() {
    return false;
  }

  HasPreviewArea() {
    return true;
  }

  HasExtraOptions() {
    return false;
  }

  AddExtraOptions(_rcOptionsRect) {
  }

  GetFileItemIcon() {
    return -1 /*Ico_None*/;
  }

  GetFileSelColWidth() {
    return 0;
  }

  OnSelChange(_pEl) {
    this.UpdateSelection$v();
  }

  OnSelDblClick(pEl) {
    if (this.IsMultiSelection()) {
      let pItem = pEl;
      pItem.UserToggleCheck();
    } else {
      this.UserClose$b(true);
    }
  }

  KeyRefresh() {
    this.UpdateFileList();
    return true;
  }

  OnLocationComboFill(pFiller) {
    for (let i = 0; i < this.iLocationCount; i = i + 1 | 0) {
      pFiller.AddEntry($oidx(this.pLocations, i).sName.getData(), i);
    }
  }

  OnLocationComboSelChange(_pForCombo, idNewSelection) {
    this.SetCurrentLocation(idNewSelection, true);
    return true;
  }

  AddLocation(szName, szPath) {
    let iNewLocCount = this.iLocationCount + 1 | 0;
    let pNewLocations = $oat($oarr($u64n(iNewLocCount), () => new C4FileSelDlg$Location().None()), 0);
    for (let i = 0; i < this.iLocationCount; i = i + 1 | 0) {
      $oidx(pNewLocations, i).$assign($oidx(this.pLocations, i));
    }
    $oidx(pNewLocations, this.iLocationCount).sName.Copy$pi8(szName);
    $oidx(pNewLocations, this.iLocationCount).sPath.Copy$pi8(szPath);
    $delete(this.pLocations);
    this.pLocations = pNewLocations;
    this.iLocationCount = iNewLocCount;
    if (this.iLocationCount === 1) {
      this.SetPath(szPath, false);
    }
  }

  AddCheckedLocation(szName, szPath) {
    if (szPath == null || szPath.a[szPath.o] === 0) {
      return;
    }
    if (!$.DirectoryExists(szPath)) {
      return;
    }
    for (let i = 0; i < this.iLocationCount; i = i + 1 | 0) {
      if ($.ItemIdentical(szPath, $oidx(this.pLocations, i).sPath.getData())) {
        return;
      }
    }
    this.AddLocation(szName, szPath);
  }

  GetCurrentLocationIndex() {
    return this.iCurrentLocationIndex;
  }

  SetCurrentLocation(idx, fRefresh) {
    if (!$.Inside$i32$i32$i32$3(idx, 0, this.iLocationCount)) {
      return;
    }
    this.iCurrentLocationIndex = idx;
    if (this.pLocationComboBox != null) {
      this.pLocationComboBox.SetText$pi8($oidx(this.pLocations, idx).sName.getData());
    }
    this.SetPath($oidx(this.pLocations, idx).sPath.getData(), fRefresh);
  }

  CreateListItem(szFilename) {
    if (szFilename != null) {
      return new C4FileSelDlg$DefaultListItem().init(szFilename, !!(this.GetFileMask() != null), this.IsMultiSelection(), this.IsItemGrayed(szFilename), this.GetFileItemIcon());
    } else {
      return new C4FileSelDlg$DefaultListItem().init(null, false, this.IsMultiSelection(), false, this.GetFileItemIcon());
    }
  }

  BeginFileListUpdate() {
  }

  EndFileListUpdate() {
  }

  init(szRootPath, szTitle, pSelCallback, fInitElements = true) {
    super.init($.Clamp$i32$i32$i32((Math.imul($.GetScreenWdt(), 2) / 3 | 0) + 10 | 0, 300, 600), $.Clamp$i32$i32$i32((Math.imul($.GetScreenHgt(), 2) / 3 | 0) + 10 | 0, 220, 500), szTitle, false);
    this.pLocationComboBox = null;
    this.pFileListBox = null;
    this.pSelectionInfoBox = null;
    this.btnOK = null;
    this.sTitle = new $.StdCopyStrBuf();
    this.sPath = new $.StdCopyStrBuf();
    this.pLocations = null;
    this.iLocationCount = 0;
    this.pSelection = null;
    this.pSelCallback = pSelCallback;
    this.$dyn = C4FileSelDlg;
    this.sTitle.Copy$pi8(szTitle);
    this.pKeyRefresh = new $.C4KeyBinding().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(63), S("FileSelReload"), 2 /*KEYSCOPE_Gui*/, new $.DlgKeyCB$C4FileSelDlg().init(this, "KeyRefresh"), 4);
    this.pKeyEnterOverride = new $.C4KeyBinding().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(28), S("FileSelConfirm"), 2 /*KEYSCOPE_Gui*/, new $.DlgKeyCB$C4FileSelDlg().init(this, "KeyEnter"), 4);
    if (fInitElements) {
      C4FileSelDlg.prototype.InitElements.call(this);
    }
    this.sPath.Copy$pi8(szRootPath);
    return this;
  }

  $dtor() {
    $delete(this.pLocations);
    if (this.pSelCallback != null) {
      $delete(this.pSelCallback);
    }
    $delete(this.pKeyEnterOverride);
    $delete(this.pKeyRefresh);
    super.$dtor();
  }

  InitElements() {
    this.UpdateSize();
    let pUseFont = $.GraphicsResource.TextFont;
    let fHasOptions = this.HasExtraOptions();
    let caMain = new $.ComponentAligner().init(this.GetClientRect(), 0, 0, true);
    let rcOptions = new $.C4Rect();
    let caButtonArea = new $.ComponentAligner().init(caMain.GetFromBottom$i32$i32(40, 280), 10, 4);
    if (fHasOptions) {
      rcOptions.$assign(caMain.GetFromBottom$i32$i32(pUseFont.GetLineHeight() + 8 | 0));
    }
    let caUpperArea = new $.ComponentAligner().init(caMain.GetAll$v(), 10, 10, true);
    if (this.iLocationCount !== 0) {
      let caLocations = new $.ComponentAligner().init(caUpperArea.GetFromTop$i32$i32($.ComboBox.GetDefaultHeight$v() + 8 | 0), 10, 4, false);
      let sText = new $.StdStrBuf().init$pi8$b($.LoadResStr(S("IDS_TEXT_LOCATION")));
      $.Container.prototype.AddElement$pElement.call(this, new $.Label().init$pi8$C4Rect$i32$u32$pCStdFont$b$b$b(sText.getData(), caLocations.GetFromLeft$i32$i32(pUseFont.GetTextWidth(sText.getData())), 0));
      this.pLocationComboBox = new $.ComboBox().init(caLocations.GetAll$v());
      this.pLocationComboBox.SetComboCB(new $.ComboBox_FillCallback$C4FileSelDlg().init(this, "OnLocationComboFill", "OnLocationComboSelChange"));
      this.pLocationComboBox.SetText$pi8(this.pLocations.sName.getData());
    }
    let fHasPreview = this.HasPreviewArea();
    this.pFileListBox = new $.ListBox().init(fHasPreview ? caUpperArea.GetFromLeft$i32$i32(caUpperArea.GetWidth() / 2 | 0) : caUpperArea.GetAll$v(), this.GetFileSelColWidth());
    this.pFileListBox.SetSelectionChangeCallbackFn(new $.CallbackHandler$C4FileSelDlg().init(this, "OnSelChange"));
    this.pFileListBox.SetSelectionDblClickFn(new $.CallbackHandler$C4FileSelDlg().init(this, "OnSelDblClick"));
    if (fHasPreview) {
      caUpperArea.ExpandLeft(10);
      this.pSelectionInfoBox = new $.TextWindow().init(caUpperArea.GetAll$v());
      this.pSelectionInfoBox.SetDecoration$b$b$pScrollBarFacets$b(true, true, null, true);
    }
    let btnAbort = new $.CancelButton().init(caButtonArea.GetFromRight$i32$i32(120));
    this.btnOK = new $.OKButton().init(caButtonArea.GetFromRight$i32$i32(120));
    if (this.pLocationComboBox != null) {
      $.Container.prototype.AddElement$pElement.call(this, this.pLocationComboBox);
    }
    $.Container.prototype.AddElement$pElement.call(this, this.pFileListBox);
    if (this.pSelectionInfoBox != null) {
      $.Container.prototype.AddElement$pElement.call(this, this.pSelectionInfoBox);
    }
    if (fHasOptions) {
      this.AddExtraOptions(rcOptions);
    }
    $.Container.prototype.AddElement$pElement.call(this, this.btnOK);
    $.Container.prototype.AddElement$pElement.call(this, btnAbort);
    this.SetFocus(this.pFileListBox, false);
    this.UpdateSelection$v();
  }

  SetPath(szNewPath, fRefresh = true) {
    this.sPath.Copy$pi8(szNewPath);
    if (fRefresh && $.Dialog.prototype.IsShown.call(this)) {
      this.UpdateFileList();
    }
  }

  SetSelection$pi8$b(szNewSelection, fFilenameOnly) {
    for (let pFileItem = this.pFileListBox.GetFirst(); pFileItem != null; pFileItem = $.Element.prototype.GetNext$v$c.call(pFileItem)) {
      let szFileItemFilename = pFileItem.GetFilename$v();
      if (fFilenameOnly) {
        szFileItemFilename = $.GetFilename(szFileItemFilename);
      }
      pFileItem.SetChecked($.SIsModule(szNewSelection, szFileItemFilename));
    }
  }

  GetSelection$pi8$b(szFixedSelection, fFilenameOnly) {
    let sResult = new $.StdStrBuf();
    if (!this.IsMultiSelection()) {
      if (this.pSelection != null) {
        sResult.Copy$pi8(fFilenameOnly ? $.GetFilename(this.pSelection.GetFilename$v()) : this.pSelection.GetFilename$v());
      }
    } else {
      if (szFixedSelection != null) {
        sResult.Append$pi8(szFixedSelection);
      }
      for (let pFileItem = this.pFileListBox.GetFirst(); pFileItem != null; pFileItem = $.Element.prototype.GetNext$v$c.call(pFileItem)) {
        if (pFileItem.IsChecked()) {
          let szAppendFilename = pFileItem.GetFilename$v();
          if (fFilenameOnly) {
            szAppendFilename = $.GetFilename(szAppendFilename);
          }
          if (!$.SIsModule(sResult.getData(), szAppendFilename)) {
            if (sResult.getLength() !== 0) {
              sResult.AppendChar(59);
            }
            sResult.Append$pi8(szAppendFilename);
          }
        }
      }
    }
    return sResult;
  }

  $clone() { return new C4FileSelDlg().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pKeyRefresh = o.pKeyRefresh;
    this.pKeyEnterOverride = o.pKeyEnterOverride;
    this.pLocationComboBox = o.pLocationComboBox;
    this.pFileListBox = o.pFileListBox;
    this.pSelectionInfoBox = o.pSelectionInfoBox;
    this.btnOK = o.btnOK;
    this.sTitle.$assign(o.sTitle);
    this.sPath.$assign(o.sPath);
    this.pLocations = o.pLocations;
    this.iLocationCount = o.iLocationCount;
    this.iCurrentLocationIndex = o.iCurrentLocationIndex;
    this.pSelection = o.pSelection;
    this.pSelCallback = o.pSelCallback;
    return this;
  }
}

export class C4FileSelDlg$ListItem extends Control {
  sFilename = new $.StdStrBuf();

  IsFocusOnClick() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4FileSelDlg$ListItem && C4FileSelDlg$ListItem.prototype instanceof $c) return $c.prototype.IsFocusOnClick.apply(this, arguments); }
    return false;
  }

  init(szFilename) {
    super.init(new $.C4Rect().init$i32$i32$i32$i32(0, 0, 0, 0));
    this.sFilename = new $.StdStrBuf();
    this.$dyn = C4FileSelDlg$ListItem;
    if (szFilename != null) {
      this.sFilename.Copy$pi8(szFilename);
    } else {
      this.sFilename.Clear();
    }
    return this;
  }

  $dtor() {
    super.$dtor();
  }

  GetFilename$v() {
    return this.sFilename.getData();
  }

  IsChecked() {
    return false;
  }

  SetChecked(_fChecked) {
  }

  UserToggleCheck() {
    return false;
  }

  $clone() { return new C4FileSelDlg$ListItem().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.sFilename.$assign(o.sFilename);
    return this;
  }
}

export class C4FileSelDlg$DefaultListItem extends C4FileSelDlg$ListItem {
  pLbl = null;
  pCheck = null;
  pKeyCheck = null;
  fGrayed = false;

  UpdateOwnPos() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4FileSelDlg$DefaultListItem && C4FileSelDlg$DefaultListItem.prototype instanceof $c) return $c.prototype.UpdateOwnPos.apply(this, arguments); }
    $.Window.prototype.UpdateOwnPos.call(this);
    if (this.pLbl == null) {
      return;
    }
    let caMain = new $.ComponentAligner().init(this.GetContainedClientRect(), 0, 0);
    caMain.GetFromLeft$i32$i32(Math.imul(caMain.GetInnerHeight(), 1 + (!(this.pCheck == null) ? 1 : 0) | 0));
    this.pLbl.SetBounds(caMain.GetAll$v());
  }

  init(szFilename, fTruncateExtension, fCheckbox, fGrayed, eIcon) {
    super.init(szFilename);
    this.pLbl = null;
    this.pCheck = null;
    this.pKeyCheck = null;
    this.fGrayed = fGrayed;
    this.$dyn = C4FileSelDlg$DefaultListItem;
    let sLabel = new $.StdStrBuf();
    if (szFilename != null) {
      sLabel.Ref$pi8($.GetFilename(szFilename));
    } else {
      sLabel.Ref$pi8($.LoadResStr(S("IDS_CTL_NONE")));
    }
    if (szFilename != null && fTruncateExtension) {
      sLabel.Copy$v();
      let szFilename$2 = sLabel.GrabPointer();
      $.RemoveExtension$pi8(szFilename$2);
      sLabel.Take$pi8(szFilename$2);
    }
    this.rcBounds.Hgt = $.GraphicsResource.TextFont.GetLineHeight();
    this.UpdateSize();
    let caMain = new $.ComponentAligner().init(this.GetContainedClientRect(), 0, 0);
    let iHeight = caMain.GetInnerHeight();
    if (fCheckbox) {
      this.pCheck = new $.CheckBox().init(caMain.GetFromLeft$i32$i32(iHeight), null, false);
      if (fGrayed) {
        this.pCheck.SetEnabled(false);
      }
      $.Container.prototype.AddElement$pElement.call(this, this.pCheck);
      this.pKeyCheck = new $.C4KeyBinding().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(57), S("FileSelToggleFileActive"), 2 /*KEYSCOPE_Gui*/, new $.ControlKeyCB$ListItem().init(this, "UserToggleCheck"), 3);
    }
    let pIco = new $.Icon().init(caMain.GetFromLeft$i32$i32(iHeight), eIcon);
    $.Container.prototype.AddElement$pElement.call(this, pIco);
    this.pLbl = new $.Label().init$pi8$C4Rect$i32$u32$pCStdFont$b$b$b(sLabel.getData(), caMain.GetAll$v(), 0, fGrayed ? 0xffafafaf : 0xffffffff);
    $.Container.prototype.AddElement$pElement.call(this, this.pLbl);
    return this;
  }

  $dtor() {
    if (this.pKeyCheck != null) {
      $delete(this.pKeyCheck);
    }
    super.$dtor();
  }

  IsChecked() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4FileSelDlg$DefaultListItem && C4FileSelDlg$DefaultListItem.prototype instanceof $c) return $c.prototype.IsChecked.apply(this, arguments); }
    return this.pCheck != null ? this.pCheck.GetChecked() : false;
  }

  SetChecked(fChecked) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4FileSelDlg$DefaultListItem && C4FileSelDlg$DefaultListItem.prototype instanceof $c) return $c.prototype.SetChecked.apply(this, arguments); }
    if (this.pCheck != null) {
      this.pCheck.SetChecked(fChecked);
    }
  }

  IsGrayed() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4FileSelDlg$DefaultListItem && C4FileSelDlg$DefaultListItem.prototype instanceof $c) return $c.prototype.IsGrayed.apply(this, arguments); }
    return this.fGrayed;
  }

  UserToggleCheck() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4FileSelDlg$DefaultListItem && C4FileSelDlg$DefaultListItem.prototype instanceof $c) return $c.prototype.UserToggleCheck.apply(this, arguments); }
    if (this.pCheck != null && !this.IsGrayed()) {
      this.pCheck.ToggleCheck(true);
      return true;
    }
    return false;
  }

  $clone() { return new C4FileSelDlg$DefaultListItem().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pLbl = o.pLbl;
    this.pCheck = o.pCheck;
    this.pKeyCheck = o.pKeyCheck;
    this.fGrayed = o.fGrayed;
    return this;
  }
}

export class C4PlayerSelDlg extends C4FileSelDlg {

  GetFileMask() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4PlayerSelDlg && C4PlayerSelDlg.prototype instanceof $c) return $c.prototype.GetFileMask.apply(this, arguments); }
    return S("*.ocp");
  }

  GetFileItemIcon() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4PlayerSelDlg && C4PlayerSelDlg.prototype instanceof $c) return $c.prototype.GetFileItemIcon.apply(this, arguments); }
    return 9 /*Ico_Player*/;
  }

  init(pSelCallback) {
    super.init(P($.Config.General.UserDataPath, 0), $.LoadResStr(S("IDS_MSG_SELECTPLR")), pSelCallback);
    this.$dyn = C4PlayerSelDlg;
    return this;
  }

  $clone() { return new C4PlayerSelDlg().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class C4DefinitionSelDlg extends C4FileSelDlg {
  sFixedSelection = new $.StdStrBuf();

  OnShown$v() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4DefinitionSelDlg && C4DefinitionSelDlg.prototype instanceof $c) return $c.prototype.OnShown$v.apply(this, arguments); }
    C4FileSelDlg.prototype.OnShown$v.call(this);
    if (this.sFixedSelection.op_const_void_() != null) {
      this.SetSelection$pi8$b(this.sFixedSelection.getData(), true);
    }
  }

  GetFileMask() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4DefinitionSelDlg && C4DefinitionSelDlg.prototype instanceof $c) return $c.prototype.GetFileMask.apply(this, arguments); }
    return S("*.ocd");
  }

  IsMultiSelection() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4DefinitionSelDlg && C4DefinitionSelDlg.prototype instanceof $c) return $c.prototype.IsMultiSelection.apply(this, arguments); }
    return true;
  }

  IsItemGrayed(szFilename) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4DefinitionSelDlg && C4DefinitionSelDlg.prototype instanceof $c) return $c.prototype.IsItemGrayed.apply(this, arguments); }
    if (this.sFixedSelection.op_not()) {
      return false;
    }
    return $.SIsModule(this.sFixedSelection.getData(), $.GetFilename(szFilename));
  }

  GetFileItemIcon() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4DefinitionSelDlg && C4DefinitionSelDlg.prototype instanceof $c) return $c.prototype.GetFileItemIcon.apply(this, arguments); }
    return 29 /*Ico_Definition*/;
  }

  init(pSelCallback, szFixedSelection) {
    super.init(P($.Config.General.UserDataPath, 0), $.FormatString($.LoadResStr(S("IDS_MSG_SELECT")), $.LoadResStr(S("IDS_DLG_DEFINITIONS"))).getData(), pSelCallback);
    this.sFixedSelection = new $.StdStrBuf();
    this.$dyn = C4DefinitionSelDlg;
    if (szFixedSelection != null) {
      this.sFixedSelection.Copy$pi8(szFixedSelection);
    }
    return this;
  }

  static *SelectDefinitions(pOnScreen, pSelection) {
    let pDlg = new C4DefinitionSelDlg().init(null, pSelection.getData());
    let fResult = false;
    if (fResult = (yield* pOnScreen.ShowModalDlg(pDlg, false))) {
      pSelection.Copy$StdStrBuf(pDlg.GetSelection$pi8$b(pSelection.getData(), true));
    }
    $delete(pDlg);
    return fResult;
  }

  $clone() { return new C4DefinitionSelDlg().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.sFixedSelection.$assign(o.sFixedSelection);
    return this;
  }
}

export class C4PortraitSelDlg extends C4FileSelDlg {
  ImageLoader = new C4PortraitSelDlg$LoaderThread().init();

  OnClosed(fOK) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4PortraitSelDlg && C4PortraitSelDlg.prototype instanceof $c) return $c.prototype.OnClosed.apply(this, arguments); }
    $.Config.Startup.LastPortraitFolderIdx = this.GetCurrentLocationIndex();
    C4FileSelDlg.prototype.OnClosed.call(this, fOK);
  }

  GetFileMask() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4PortraitSelDlg && C4PortraitSelDlg.prototype instanceof $c) return $c.prototype.GetFileMask.apply(this, arguments); }
    return S("*.png|*.bmp|*.jpeg|*.jpg");
  }

  HasNoneItem() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4PortraitSelDlg && C4PortraitSelDlg.prototype instanceof $c) return $c.prototype.HasNoneItem.apply(this, arguments); }
    return true;
  }

  HasPreviewArea() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4PortraitSelDlg && C4PortraitSelDlg.prototype instanceof $c) return $c.prototype.HasPreviewArea.apply(this, arguments); }
    return false;
  }

  GetFileSelColWidth() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4PortraitSelDlg && C4PortraitSelDlg.prototype instanceof $c) return $c.prototype.GetFileSelColWidth.apply(this, arguments); }
    return 100;
  }

  CreateListItem(szFilename) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4PortraitSelDlg && C4PortraitSelDlg.prototype instanceof $c) return $c.prototype.CreateListItem.apply(this, arguments); }
    let pNew = new C4PortraitSelDlg$ListItem().init(szFilename);
    ;
    this.ImageLoader.AddLoadItem(pNew);
    return pNew;
  }

  BeginFileListUpdate() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4PortraitSelDlg && C4PortraitSelDlg.prototype instanceof $c) return $c.prototype.BeginFileListUpdate.apply(this, arguments); }
    this.ImageLoader.ClearLoadItems();
  }

  EndFileListUpdate() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4PortraitSelDlg && C4PortraitSelDlg.prototype instanceof $c) return $c.prototype.EndFileListUpdate.apply(this, arguments); }
  }

  OnIdle() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4PortraitSelDlg && C4PortraitSelDlg.prototype instanceof $c) return $c.prototype.OnIdle.apply(this, arguments); }
    let $t1;
    if (!('C4PortraitSelDlg$OnIdle$i' in $)) $.C4PortraitSelDlg$OnIdle$i = 0;
    if (!(($t1 = $.C4PortraitSelDlg$OnIdle$i, $.C4PortraitSelDlg$OnIdle$i = $.C4PortraitSelDlg$OnIdle$i + 1 | 0, $t1) % 10 !== 0)) {
      this.ImageLoader.Execute();
    }
  }

  init(pSelCallback) {
    super.init(P($.Config.General.SystemDataPath, 0), $.FormatString($.LoadResStr(S("IDS_MSG_SELECT")), $.LoadResStr(S("IDS_TYPE_PORTRAIT"))).getData(), pSelCallback, false);
    this.ImageLoader = new C4PortraitSelDlg$LoaderThread().init();
    this.$dyn = C4PortraitSelDlg;
    const path = new Int8Array(4097);
    let strLocation = new $.StdStrBuf();
    $.SCopy$pi8$pi8$u64(P($.Config.General.UserDataPath, 0), P(path, 0), 4096);
    $.TruncateBackslash(P(path, 0));
    strLocation.Format(S("%s %s"), S("OpenClonk"), $.LoadResStr(S("IDS_TEXT_USERPATH")));
    this.AddLocation(strLocation.getData(), P(path, 0));
    $.SCopy$pi8$pi8$u64(P($.Config.General.SystemDataPath, 0), P(path, 0), 4096);
    $.TruncateBackslash(P(path, 0));
    strLocation.Format(S("%s %s"), S("OpenClonk"), $.LoadResStr(S("IDS_TEXT_PROGRAMDIRECTORY")));
    this.AddCheckedLocation(strLocation.getData(), P(path, 0));
    this.AddCheckedLocation($.LoadResStr(S("IDS_TEXT_HOMEFOLDER")), c$getenv(S("HOME")));
    $.ssprintf$17(path, S("%s%c%s"), c$getenv(S("HOME")), 47, S("Desktop"));
    this.AddCheckedLocation($.LoadResStr(S("IDS_TEXT_DESKTOP")), P(path, 0));
    this.InitElements();
    this.SetCurrentLocation($.Config.Startup.LastPortraitFolderIdx, false);
    return this;
  }

  static *SelectPortrait(pOnScreen, pSelection) {
    let pDlg = new C4PortraitSelDlg().init(null);
    let fResult = false;
    if (fResult = (yield* pOnScreen.ShowModalDlg(pDlg, false))) {
      pSelection.Take$mStdStrBuf(pDlg.GetSelection$pi8$b(null, false));
    }
    $delete(pDlg);
    return fResult;
  }

  $clone() { return new C4PortraitSelDlg().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.ImageLoader.$assign(o.ImageLoader);
    return this;
  }
}

export class C4PortraitSelDlg$ListItem extends C4FileSelDlg$ListItem {
  fError = false;
  fLoaded = false;
  fctImage = new $.C4FacetSurface().init();
  fctLoadedImage = new $.C4FacetSurface().init();
  sFilenameLabelText = new $.StdCopyStrBuf();

  DrawElement(cgo) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4PortraitSelDlg$ListItem && C4PortraitSelDlg$ListItem.prototype instanceof $c) return $c.prototype.DrawElement.apply(this, arguments); }
    if (this.fLoaded) {
      this.fLoaded = false;
      if (!this.fctImage.CopyFromSfcMaxSize(this.fctLoadedImage.GetFace(), 100)) {
        this.fError = true;
      }
      this.fctLoadedImage.GetFace().Clear();
      $.C4FacetSurface.prototype.Clear.call(this.fctLoadedImage);
    }
    let pUseFont = $.GraphicsResource.MiniFont;
    let cgoPicture = new $.C4Facet().init$pC4Surface$f32$f32$f32$f32(cgo.Surface, Math.fround(cgo.TargetX + Math.fround(this.rcBounds.x)), Math.fround(cgo.TargetY + Math.fround(this.rcBounds.y)), Math.fround(100 /*ImagePreviewSize*/), Math.fround(100 /*ImagePreviewSize*/));
    if (this.fError || this.sFilename.op_not()) {
      const fctNoneImg = $.GraphicsResource.fctOKCancel;
      fctNoneImg.Draw$pC4Surface$f32$f32$i32$i32(cgoPicture.Surface, Math.fround(cgoPicture.X + Math.fround(Math.fround(cgoPicture.Wdt - fctNoneImg.Wdt) / Math.fround(2))), Math.fround(cgoPicture.Y + Math.fround(Math.fround(cgoPicture.Hgt - fctNoneImg.Hgt) / Math.fround(2))), 1, 0);
    } else {
      if (this.fctImage.Surface == null) {
        $.pDraw.TextOut($.LoadResStr(S("IDS_PRC_INITIALIZE")), $.GraphicsResource.MiniFont, 1, cgo.Surface, Math.fround(cgoPicture.X + Math.fround(cgoPicture.Wdt / Math.fround(2))), Math.fround(cgoPicture.Y + Math.fround(Math.fround(cgoPicture.Hgt - Math.fround($.GraphicsResource.MiniFont.GetLineHeight())) / Math.fround(2))), 0xffffffff, 1, false);
      } else {
        this.fctImage.Draw$rC4Facet$b$i32$i32$b(cgoPicture);
      }
    }
    $.pDraw.TextOut(this.sFilenameLabelText.getData(), pUseFont, 1, cgo.Surface, Math.fround(cgoPicture.X + Math.fround(this.rcBounds.Wdt / 2 | 0)), Math.fround(cgoPicture.Y + cgoPicture.Hgt), 0xffffffff, 1, false);
  }

  init(szFilename) {
    super.init(szFilename);
    this.fError = false;
    this.fLoaded = false;
    this.fctImage = new $.C4FacetSurface().init();
    this.fctLoadedImage = new $.C4FacetSurface().init();
    this.sFilenameLabelText = new $.StdCopyStrBuf();
    this.$dyn = C4PortraitSelDlg$ListItem;
    let pUseFont = $.GraphicsResource.MiniFont;
    let sDisplayLabel = new $.StdStrBuf();
    if (szFilename != null) {
      sDisplayLabel.Copy$pi8($.GetFilename(szFilename));
      $.RemoveExtension$pStdStrBuf(sDisplayLabel);
    } else {
      sDisplayLabel.Ref$pi8($.LoadResStr(S("IDS_MSG_NOPORTRAIT")));
    }
    let iLineHgt = $max(pUseFont.BreakMessage$pi8$i32$pStdStrBuf$b$f32(sDisplayLabel.getData(), 94, this.sFilenameLabelText, false), 1);
    this.SetBounds(new $.C4Rect().init$i32$i32$i32$i32(0, 0, 100, 100 + iLineHgt | 0));
    return this;
  }

  Load$v() {
    if (this.sFilename.op_const_void_() != null) {
      this.fLoaded = false;
      let SrcGrp = new $.C4Group().init();
      let sParentPath = new $.StdStrBuf();
      $.GetParentPath$pi8$pStdStrBuf(this.sFilename.getData(), sParentPath);
      let fLoadError = true;
      if (SrcGrp.Open(sParentPath.getData())) {
        if (this.fctLoadedImage.Load(SrcGrp, $.GetFilename(this.sFilename.getData()), -1, -1, false, 0)) {
          this.fLoaded = true;
          fLoadError = false;
        }
      }
      SrcGrp.Close$v();
      this.fError = fLoadError;
    }
  }

  $clone() { return new C4PortraitSelDlg$ListItem().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.fError = o.fError;
    this.fLoaded = o.fLoaded;
    this.fctImage.$assign(o.fctImage);
    this.fctLoadedImage.$assign(o.fctLoadedImage);
    this.sFilenameLabelText.$assign(o.sFilenameLabelText);
    return this;
  }
}

export function $init(): void {
}

Object.assign($, { C4DefinitionSelDlg, C4FileSelDlg, C4FileSelDlg$DefaultListItem, C4FileSelDlg$ListItem, C4FileSelDlg$Location, C4FileSel_BaseCB, C4FileSel_CBEx$MainDlg, C4PlayerSelDlg, C4PortraitSelDlg, C4PortraitSelDlg$ListItem, C4PortraitSelDlg$LoaderThread });
