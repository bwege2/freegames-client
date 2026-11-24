// @ts-nocheck
// OpenClonk 36de799: src/gui/C4StartupScenSelDlg.cpp, src/gui/C4StartupScenSelDlg.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { Picture, Window } from './C4Gui.ts';
import { C4StartupDlg } from './C4Startup.ts';
import { $co, $spawn } from '../../rt/coro.ts';
import { $u64n, ftoi32 } from '../../rt/int.ts';
import { c$floorf, c$memset, c$qsort, c$strlen, c$strncmp, c$toupper } from '../../rt/libc.ts';
import { $oarr, $own, $peq, $rd, $wr, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $begin, $delete, $end, $max, $min, StdSet, StdString } from '../../rt/std.ts';

export class C4ScenarioListLoader {
  pRootFolder = null;
  pCurrFolder = null;
  iLoading = 0;
  iProgress = 0;
  iMaxProgress = 0;
  current_load_info = new $.StdCopyStrBuf();
  fAbortThis = false;
  fAbortPrevious = false;
  Achievements = null;

  init(Achievements) {
    this.pRootFolder = null;
    this.pCurrFolder = null;
    this.iLoading = 0;
    this.iProgress = 0;
    this.iMaxProgress = 0;
    this.current_load_info = new $.StdCopyStrBuf();
    this.fAbortThis = false;
    this.fAbortPrevious = false;
    this.Achievements = Achievements;
    return this;
  }

  $dtor() {
    if (this.pRootFolder != null) {
      $delete(this.pRootFolder);
    }
  }

  BeginActivity(fAbortPrevious) {
    if (this.iLoading !== 0 && fAbortPrevious) {
      this.fAbortPrevious = true;
    }
    this.iLoading = this.iLoading + 1 | 0;
    this.iProgress = this.iMaxProgress = 0;
    this.current_load_info.Clear();
    return true;
  }

  EndActivity() {
    0;
    if (!((this.iLoading = this.iLoading - 1 | 0) !== 0)) {
      this.fAbortThis = false;
      this.fAbortPrevious = false;
      this.iProgress = this.iMaxProgress = 0;
      this.current_load_info.Clear();
    } else {
      this.fAbortThis = this.fAbortPrevious;
    }
  }

  DoProcessCallback(iProgress, iMaxProgress, current_load_info) {
    this.iProgress = iProgress;
    this.iMaxProgress = iMaxProgress;
    this.current_load_info.Copy$pi8(current_load_info);
    if (C4StartupScenSelDlg.pInstance != null) {
      C4StartupScenSelDlg.pInstance.ProcessCallback$v();
    }
    if (!$.Application.ScheduleProcs(1) || C4StartupScenSelDlg.pInstance == null || !$.Dialog.prototype.IsShown.call(C4StartupScenSelDlg.pInstance)) {
      return false;
    }
    return !this.fAbortThis;
  }

  Load$StdStrBuf(sRootFolder) {
    let $t1, $t2, $t3;
    if (!this.BeginActivity(true)) {
      return false;
    }
    if (this.pRootFolder != null) {
      $delete(this.pRootFolder);
      this.pRootFolder = null;
    }
    this.pCurrFolder = this.pRootFolder = new C4ScenarioListLoader$RegularFolder().init(this, null);
    if (!(sRootFolder.getData() != null)) {
      $t1 = $.Reloc;
      $t2 = $t1.begin();
      $t3 = $t1.end();
      for (; $.op_ne$C4Reloc$const_iterator$C4Reloc$const_iterator($t2, $t3); $t2.op_inc()) {
        const iter = $t2.op_mul();
        this.pRootFolder.Merge(iter.strBuf.getData());
      }
    }
    let fSuccess = this.pRootFolder.LoadContents(this, null, sRootFolder, false, false);
    this.EndActivity();
    return fSuccess;
  }

  Load$pFolder$b(pSpecifiedFolder, fReload) {
    if (this.pRootFolder == null || pSpecifiedFolder == null) {
      return false;
    }
    if (!this.BeginActivity(true)) {
      return false;
    }
    this.pCurrFolder = pSpecifiedFolder;
    let fSuccess = this.pCurrFolder.LoadContents(this, null, null, false, fReload);
    this.EndActivity();
    return fSuccess;
  }

  LoadExtended(pEntry) {
    if (this.pRootFolder == null || pEntry == null) {
      return false;
    }
    if (!this.BeginActivity(false)) {
      return false;
    }
    let fSuccess = pEntry.Load(null, null, true);
    this.EndActivity();
    return fSuccess;
  }

  FolderBack() {
    if (this.pRootFolder == null || this.pCurrFolder == null) {
      return false;
    }
    if (this.pCurrFolder === this.pRootFolder) {
      return false;
    }
    return this.Load$pFolder$b(this.pCurrFolder.GetParent(), false);
  }

  ReloadCurrent() {
    if (this.pRootFolder == null || this.pCurrFolder == null) {
      return false;
    }
    return this.Load$pFolder$b(this.pCurrFolder, true);
  }

  IsLoading() {
    return !(this.iLoading === 0);
  }

  GetFirstEntry() {
    return this.pCurrFolder != null ? this.pCurrFolder.GetFirstEntry() : null;
  }

  GetCurrFolder() {
    return this.pCurrFolder;
  }

  GetRootFolder() {
    return this.pRootFolder;
  }

  GetProgress() {
    return this.iProgress;
  }

  GetMaxProgress() {
    return this.iMaxProgress;
  }

  GetProgressPercent() {
    return Math.imul(this.iProgress, 100) / $max(this.iMaxProgress, 1) | 0;
  }

  GetProgressInfo() {
    return this.current_load_info.getData();
  }

  GetAchievements() {
    return this.Achievements;
  }

  $clone() { return new C4ScenarioListLoader().$assign(this); }
  $assign(o) {
    this.pRootFolder = o.pRootFolder;
    this.pCurrFolder = o.pCurrFolder;
    this.iLoading = o.iLoading;
    this.iProgress = o.iProgress;
    this.iMaxProgress = o.iMaxProgress;
    this.current_load_info.$assign(o.current_load_info);
    this.fAbortThis = o.fAbortThis;
    this.fAbortPrevious = o.fAbortPrevious;
    this.Achievements = o.Achievements;
    return this;
  }
}

export class C4ScenarioListLoader$Entry {
  pLoader = null;
  pNext = null;
  pParent = null;
  sName = new $.StdCopyStrBuf();
  sFilename = new $.StdCopyStrBuf();
  sDesc = new $.StdCopyStrBuf();
  sVersion = new $.StdCopyStrBuf();
  sAuthor = new $.StdCopyStrBuf();
  fctIcon = new $.C4FacetSurface().init();
  fctTitle = new $.C4FacetSurface().init();
  fBaseLoaded = false;
  fExLoaded = false;
  iIconIndex = 0;
  iDifficulty = 0;
  iFolderIndex = 0;

  init(pLoader, pParent) {
    this.pLoader = pLoader;
    this.pNext = null;
    this.pParent = pParent;
    this.sName = new $.StdCopyStrBuf();
    this.sFilename = new $.StdCopyStrBuf();
    this.sDesc = new $.StdCopyStrBuf();
    this.sVersion = new $.StdCopyStrBuf();
    this.sAuthor = new $.StdCopyStrBuf();
    this.fctIcon = new $.C4FacetSurface().init();
    this.fctTitle = new $.C4FacetSurface().init();
    this.fBaseLoaded = false;
    this.fExLoaded = false;
    if (pParent != null) {
      this.pNext = pParent.pFirst;
      pParent.pFirst = this;
    }
    this.iIconIndex = -1;
    this.iDifficulty = 0;
    this.iFolderIndex = 0;
    return this;
  }

  $dtor() {
    if (this.pParent != null) {
      let ppCheck = P(this.pParent, "pFirst");
      while (ppCheck.a[ppCheck.o] !== this) {
        ppCheck = P(ppCheck.a[ppCheck.o], "pNext");
      }
      ppCheck.a[ppCheck.o] = this.pNext;
    }
  }

  Load(pFromGrp, psFilename, fLoadEx) {
    if (this.fBaseLoaded && (this.fExLoaded || !fLoadEx)) {
      return true;
    }
    let Group = new $.C4Group().init();
    if (pFromGrp != null) {
      0;
      if (!Group.OpenAsChild(pFromGrp, psFilename.getData())) {
        return false;
      }
      this.sFilename.Take$mStdStrBuf(Group.GetFullName());
    } else {
      if (psFilename != null) {
        this.sFilename.Copy$StdStrBuf(psFilename);
      }
      if (!Group.Open(this.sFilename.getData())) {
        return false;
      }
    }
    let fNameLoaded = false;
    let fIconLoaded = false;
    if (this.fBaseLoaded) {
      fNameLoaded = fIconLoaded = true;
    } else {
      this.sName.Copy$pi8($.GetFilename(this.sFilename.getData()));
      let szBuf = this.sName.GrabPointer();
      $.RemoveExtension$pi8(szBuf);
      this.sName.Take$pi8(szBuf);
      if (!this.LoadCustomPre(Group)) {
        return false;
      }
      let DefNames = new $.C4ComponentHost().init();
      if ($.C4Language.LoadComponentHost(DefNames, Group, S("Title%s.txt|Title.txt"), P($.Config.General.LanguageEx, 0))) {
        if (DefNames.GetLanguageString(P($.Config.General.LanguageEx, 0), this.sName)) {
          fNameLoaded = true;
        }
      }
      if (Group.FindEntry$pi8$pStdStrBuf$pu64(S("Icon.png")) && this.fctIcon.Load(Group, S("Icon.png"), -1, -1, false, 0)) {
        fIconLoaded = true;
      } else {
        let fctTemp = new $.C4FacetSurface().init();
        if (Group.FindEntry$pi8$pStdStrBuf$pu64(S("Icon.bmp")) && fctTemp.Load(Group, S("Icon.bmp"), -1, -1, true, 0)) {
          fctTemp.Surface.Lock();
          for (let y = 0; Math.fround(y) < fctTemp.Hgt; y = y + 1 | 0) {
            for (let x = 0; Math.fround(x) < fctTemp.Wdt; x = x + 1 | 0) {
              let dwPix = fctTemp.Surface.GetPixDw(x, y, false);
              if ($.Inside$u8$i32$i32((dwPix & 255) >>> 0 & 0xff, 184, 255)) {
                if ($.Inside$u8$i32$i32((dwPix >>> 8 & 255) >>> 0 & 0xff, 0, 15)) {
                  if ($.Inside$u8$i32$i32((dwPix >>> 16 & 255) >>> 0 & 0xff, 184, 255)) {
                    fctTemp.Surface.SetPixDw(x, y, 0xffffff);
                  }
                }
              }
            }
          }
          fctTemp.Surface.Unlock();
          let iIconSize = ftoi32($.C4Startup.Get().Graphics.fctScenSelIcons.Hgt);
          this.fctIcon.Create(iIconSize, iIconSize, -1, -1);
          $.C4Startup.Get().Graphics.fctScenSelIcons.GetPhase(18).Draw$rC4Facet$b$i32$i32$b(this.fctIcon);
          fctTemp.Draw$pC4Surface$f32$f32$i32$i32(this.fctIcon.Surface, Math.fround(Math.fround(this.fctIcon.Wdt - fctTemp.Wdt) / Math.fround(2)), Math.fround(Math.fround(this.fctIcon.Hgt - fctTemp.Hgt) / Math.fround(2)));
          $.C4FacetSurface.prototype.Clear.call(fctTemp);
          fIconLoaded = true;
        }
      }
      if (!this.LoadCustom(Group, fNameLoaded, fIconLoaded)) {
        return false;
      }
      this.fBaseLoaded = true;
    }
    if (fLoadEx && !this.fExLoaded) {
      let DefDesc = new $.C4ComponentHost().init();
      if ($.C4Language.LoadComponentHost(DefDesc, Group, S("Desc%s.txt"), P($.Config.General.LanguageEx, 0))) {
        this.sDesc.Copy$pi8(DefDesc.GetData());
      }
      this.fctTitle.Load(Group, S("Title"), -1, -1, false, 1);
      this.fExLoaded = true;
      Group.LoadEntryString$pi8$pStdStrBuf(S("Version.txt"), this.sVersion);
    }
    return true;
  }

  LoadCustom(_rGrp, _fNameLoaded, _fIconLoaded) {
    return true;
  }

  LoadCustomPre(_rGrp) {
    return true;
  }

  GetIsFolder() {
    return null;
  }

  GetName() {
    return this.sName;
  }

  GetEntryFilename() {
    return this.sFilename;
  }

  GetVersion() {
    return this.sVersion;
  }

  GetAuthor() {
    return this.sAuthor;
  }

  GetIconFacet() {
    return this.fctIcon;
  }

  GetTitlePicture() {
    return this.fctTitle;
  }

  GetDesc() {
    return this.sDesc;
  }

  GetIconIndex() {
    return this.iIconIndex;
  }

  GetDifficulty() {
    return this.iDifficulty;
  }

  GetFolderIndex() {
    return this.iFolderIndex;
  }

  GetNext() {
    return this.pNext;
  }

  GetParent() {
    return this.pParent;
  }

  GetAchievement(_idx, _out_facet, _out_description) {
    return false;
  }

  static CreateEntryForFile(sFilename, pLoader, pParent) {
    let szFilename = sFilename.getData();
    if (szFilename == null || szFilename.a[szFilename.o] === 0) {
      return null;
    }
    if ($.WildcardMatch(S("*.ocs"), sFilename.getData())) {
      return new C4ScenarioListLoader$Scenario().init(pLoader, pParent);
    }
    if ($.WildcardMatch(S("*.ocf"), sFilename.getData())) {
      return new C4ScenarioListLoader$SubFolder().init(pLoader, pParent);
    }
    let szExt = $.GetExtension(szFilename);
    if ((szExt == null || szExt.a[szExt.o] === 0) && $.DirectoryExists(sFilename.getData())) {
      let modsDirectoryPrefix = P($.Config.General.ModsDataPath, 0);
      if (c$strncmp(szFilename, modsDirectoryPrefix, c$strlen(modsDirectoryPrefix) - 1) === 0) {
        return null;
      }
      if (DirContainsScenarios(szFilename)) {
        return new C4ScenarioListLoader$RegularFolder().init(pLoader, pParent);
      }
    }
    return null;
  }

  CanOpen(_sError, _CanHide) {
    return true;
  }

  IsGrayed() {
    return false;
  }

  IsHidden() {
    return false;
  }

  HasMissionAccess() {
    return true;
  }

  GetDefaultExtension() {
    return null;
  }

  *SetTitleInGroup(rGrp, szNewTitle) {
    if (!this.IsScenario()) {
      let sNameByFile = new $.StdStrBuf();
      sNameByFile.Copy$pi8($.GetFilename(this.sFilename.getData()));
      let szBuf = sNameByFile.GrabPointer();
      $.RemoveExtension$pi8(szBuf);
      sNameByFile.Take$pi8(szBuf);
      if ($.SEqual(szNewTitle, sNameByFile.getData())) {
        return true;
      }
    }
    let sTitle = new $.StdStrBuf();
    sTitle.Format(S("%s:%s"), P($.Config.General.Language, 0), szNewTitle);
    if (!rGrp.Add$pi8$rStdStrBuf$b$b$b(S("Title.txt"), sTitle, false, true)) {
      let sMsg = new $.StdStrBuf();
      sMsg.Format($.LoadResStr(S("IDS_ERR_ERRORADDINGNEWTITLEFORFIL")), this.sFilename.getData(), rGrp.GetError());
      (yield* $.pGUI.ShowMessageModal(sMsg.getData(), $.LoadResStr(S("IDS_FAIL_RENAME")), 1, 11 /*Ico_Error*/));
      return false;
    }
    return true;
  }

  *RenameTo(szNewName) {
    if (szNewName == null || szNewName.a[szNewName.o] === 0) {
      return false;
    }
    if ($.SEqual(szNewName, this.sName.getData())) {
      return true;
    }
    const fn = new Int8Array(4097);
    $.SCopy$pi8$pi8$u64(szNewName, P(fn, 0), 4096);
    $.MakeFilenameFromTitle(P(fn, 0));
    if (!($rd(P(fn, 0)) !== 0)) {
      return false;
    }
    let szExt = this.GetDefaultExtension();
    if (szExt != null) {
      $.SAppend(S("."), P(fn, 0), 4096);
      $.SAppend(szExt, P(fn, 0), 4096);
    }
    const fullfn = new Int8Array(4097);
    $.SCopy$pi8$pi8$u64(this.sFilename.getData(), P(fullfn, 0), 4096);
    let fullfn_fn = $.GetFilename$2(P(fullfn, 0));
    $.SCopy$pi8$pi8$u64(P(fn, 0), fullfn_fn, $u64n(4096 - (fullfn_fn.o - P(fullfn, 0).o)));
    let strErr = new $.StdCopyStrBuf().init$pi8$b($.LoadResStr(S("IDS_FAIL_RENAME")));
    if (!$.ItemIdentical(this.sFilename.getData(), P(fullfn, 0))) {
      if ($.ItemExists(P(fullfn, 0))) {
        let sMsg = new $.StdStrBuf();
        sMsg.Format($.LoadResStr(S("IDS_ERR_FILEEXISTS")), P(fullfn, 0));
        (yield* $.pGUI.ShowMessageModal(sMsg.getData(), strErr.getData(), 1, 11 /*Ico_Error*/));
        return false;
      }
      if (!$.C4Group_MoveItem(this.sFilename.getData(), P(fullfn, 0), true)) {
        let sMsg = new $.StdStrBuf();
        sMsg.Format($.LoadResStr(S("IDS_ERR_RENAMEFILE")), this.sFilename.getData(), P(fullfn, 0));
        (yield* $.pGUI.ShowMessageModal(sMsg.getData(), strErr.getData(), 1, 11 /*Ico_Error*/));
        return false;
      }
      this.sFilename.Copy$pi8(P(fullfn, 0));
    }
    if ($.C4Group_IsGroup(P(fullfn, 0))) {
      let Grp = new $.C4Group().init();
      if (!Grp.Open(P(fullfn, 0))) {
        let sMsg = new $.StdStrBuf();
        sMsg.Format($.LoadResStr(S("IDS_ERR_OPENFILE")), this.sFilename.getData(), Grp.GetError());
        (yield* $.pGUI.ShowMessageModal(sMsg.getData(), strErr.getData(), 1, 11 /*Ico_Error*/));
        return false;
      }
      if (!Grp.Delete(S("Title%s.txt|Title.txt"))) {
        let sMsg = new $.StdStrBuf();
        sMsg.Format($.LoadResStr(S("IDS_ERR_DELOLDTITLE")), this.sFilename.getData(), Grp.GetError());
        (yield* $.pGUI.ShowMessageModal(sMsg.getData(), strErr.getData(), 1, 11 /*Ico_Error*/));
        return false;
      }
      if (!(yield* $co(this.SetTitleInGroup(Grp, szNewName)))) {
        return false;
      }
      if (!Grp.Close$v()) {
        let sMsg = new $.StdStrBuf();
        sMsg.Format($.LoadResStr(S("IDS_ERR_WRITENEWTITLE")), this.sFilename.getData(), Grp.GetError());
        (yield* $.pGUI.ShowMessageModal(sMsg.getData(), strErr.getData(), 1, 11 /*Ico_Error*/));
        return false;
      }
    }
    this.sName.Copy$pi8(szNewName);
    return true;
  }

  IsScenario() {
    return false;
  }

  GetParameterDefs() {
    return null;
  }

  GetParameters() {
    return null;
  }

  $clone() { return new C4ScenarioListLoader$Entry().$assign(this); }
  $assign(o) {
    this.pLoader = o.pLoader;
    this.pNext = o.pNext;
    this.pParent = o.pParent;
    this.sName.$assign(o.sName);
    this.sFilename.$assign(o.sFilename);
    this.sDesc.$assign(o.sDesc);
    this.sVersion.$assign(o.sVersion);
    this.sAuthor.$assign(o.sAuthor);
    this.fctIcon.$assign(o.fctIcon);
    this.fctTitle.$assign(o.fctTitle);
    this.fBaseLoaded = o.fBaseLoaded;
    this.fExLoaded = o.fExLoaded;
    this.iIconIndex = o.iIconIndex;
    this.iDifficulty = o.iDifficulty;
    this.iFolderIndex = o.iFolderIndex;
    return this;
  }
}

export class C4MapFolderData {
  fctBackgroundPicture = new $.C4FacetSurface().init();
  rcfBG = new $.FLOAT_RECT();
  fCoordinatesAdjusted = false;
  rcScenInfoArea = new $.C4Rect();
  pScenarioFolder = null;
  pSelectedEntry = null;
  pSelectionInfoBox = null;
  MinResX = 0;
  MinResY = 0;
  fUseFullscreenMap = false;
  ppScenList = null;
  iScenCount = 0;
  ppAccessGfxList = null;
  iAccessGfxCount = 0;
  pMainDlg = null;

  init() {
    this.fctBackgroundPicture = new $.C4FacetSurface().init();
    this.rcfBG = new $.FLOAT_RECT();
    this.fCoordinatesAdjusted = false;
    this.rcScenInfoArea = new $.C4Rect();
    this.ppScenList = null;
    this.iScenCount = 0;
    this.ppAccessGfxList = null;
    this.iAccessGfxCount = 0;
    this.pMainDlg = null;
    return this;
  }

  $dtor() {
    C4MapFolderData.prototype.Clear.call(this);
  }

  ConvertFacet2ScreenCoord$C4Rect$pFLOAT_RECT$f32$f32$i32$i32(rc, pfrc, fBGZoomX, fBGZoomY, iOffX, iOffY) {
    pfrc.left = Math.fround(Math.fround(fBGZoomX * Math.fround(rc.x)) + Math.fround(iOffX));
    pfrc.top = Math.fround(Math.fround(fBGZoomY * Math.fround(rc.y)) + Math.fround(iOffY));
    pfrc.right = Math.fround(pfrc.left + Math.fround(fBGZoomX * Math.fround(rc.Wdt)));
    pfrc.bottom = Math.fround(pfrc.top + Math.fround(fBGZoomY * Math.fround(rc.Hgt)));
  }

  ConvertFacet2ScreenCoord$pi32$f32$i32(piValue, fBGZoom, iOff) {
    piValue.a[piValue.o] = ftoi32(c$floorf(Math.fround(Math.fround(fBGZoom * Math.fround(piValue.a[piValue.o])) + 0.5))) + iOff | 0;
  }

  ConvertFacet2ScreenCoord$rC4Rect$b(rcMapArea, fAspect) {
    if (this.fctBackgroundPicture.Wdt === 0 || this.fctBackgroundPicture.Hgt === 0) {
      return;
    }
    let fBGZoomX = 1;
    let fBGZoomY = 1;
    let iOffX = 0;
    let iOffY = 0;
    if (fAspect) {
      if (Math.fround(this.fctBackgroundPicture.Wdt * Math.fround(rcMapArea.Hgt)) > Math.fround(Math.fround(rcMapArea.Wdt) * this.fctBackgroundPicture.Hgt)) {
        fBGZoomX = fBGZoomY = Math.fround(Math.fround(rcMapArea.Wdt) / this.fctBackgroundPicture.Wdt);
        iOffY = $max(0, ftoi32(Math.fround(Math.fround(rcMapArea.Hgt) - Math.fround(fBGZoomX * this.fctBackgroundPicture.Hgt)))) / 2 | 0;
      } else {
        fBGZoomX = fBGZoomY = Math.fround(Math.fround(rcMapArea.Hgt) / this.fctBackgroundPicture.Hgt);
        iOffX = $max(0, ftoi32(Math.fround(Math.fround(rcMapArea.Wdt) - Math.fround(fBGZoomY * this.fctBackgroundPicture.Wdt)))) / 2 | 0;
      }
    } else {
      fBGZoomX = Math.fround(Math.fround(rcMapArea.Wdt) / this.fctBackgroundPicture.Wdt);
      ;
      fBGZoomY = Math.fround(Math.fround(rcMapArea.Hgt) / this.fctBackgroundPicture.Hgt);
      ;
    }
    iOffX = iOffX - rcMapArea.x | 0;
    iOffY = iOffY - rcMapArea.y | 0;
    let rcBG = new $.C4Rect();
    rcBG.Set$i32$i32$i32$i32(0, 0, ftoi32(this.fctBackgroundPicture.Wdt), ftoi32(this.fctBackgroundPicture.Hgt));
    this.ConvertFacet2ScreenCoord$C4Rect$pFLOAT_RECT$f32$f32$i32$i32(rcBG, this.rcfBG, fBGZoomX, fBGZoomY, iOffX, iOffY);
    if (this.rcScenInfoArea.Wdt === 0) {
      this.rcScenInfoArea.Set$i32$i32$i32$i32(ftoi32(Math.fround(Math.fround(this.fctBackgroundPicture.Wdt * Math.fround(2)) / Math.fround(3))), ftoi32(Math.fround(this.fctBackgroundPicture.Hgt / Math.fround(16))), ftoi32(Math.fround(this.fctBackgroundPicture.Wdt / Math.fround(3))), ftoi32(Math.fround(Math.fround(this.fctBackgroundPicture.Hgt * Math.fround(7)) / Math.fround(8))));
    }
    let rcfScenInfoArea = new $.FLOAT_RECT();
    this.ConvertFacet2ScreenCoord$C4Rect$pFLOAT_RECT$f32$f32$i32$i32(this.rcScenInfoArea, rcfScenInfoArea, fBGZoomX, fBGZoomY, iOffX, iOffY);
    this.rcScenInfoArea.x = ftoi32(rcfScenInfoArea.left);
    this.rcScenInfoArea.y = ftoi32(rcfScenInfoArea.top);
    this.rcScenInfoArea.Wdt = ftoi32(Math.fround(rcfScenInfoArea.right - rcfScenInfoArea.left));
    this.rcScenInfoArea.Hgt = ftoi32(Math.fround(rcfScenInfoArea.bottom - rcfScenInfoArea.top));
    let i = 0;
    for (i = 0; i < this.iScenCount; i = i + 1 | 0) {
      let pScen = this.ppScenList.a[this.ppScenList.o + i];
      this.ConvertFacet2ScreenCoord$C4Rect$pFLOAT_RECT$f32$f32$i32$i32(pScen.rcOverlayPos, pScen.rcfOverlayPos, fBGZoomX, fBGZoomY, iOffX, iOffY);
      this.ConvertFacet2ScreenCoord$pi32$f32$i32(P(pScen, "iTitleFontSize"), fBGZoomY, 0);
      this.ConvertFacet2ScreenCoord$pi32$f32$i32(P(pScen, "iTitleOffX"), fBGZoomX, 0);
      this.ConvertFacet2ScreenCoord$pi32$f32$i32(P(pScen, "iTitleOffY"), fBGZoomY, 0);
    }
    for (i = 0; i < this.iAccessGfxCount; i = i + 1 | 0) {
      this.ConvertFacet2ScreenCoord$C4Rect$pFLOAT_RECT$f32$f32$i32$i32(this.ppAccessGfxList.a[this.ppAccessGfxList.o + i].rcOverlayPos, this.ppAccessGfxList.a[this.ppAccessGfxList.o + i].rcfOverlayPos, fBGZoomX, fBGZoomY, iOffX, iOffY);
    }
    this.fCoordinatesAdjusted = true;
  }

  OnButtonScenario(pEl) {
    let i = 0;
    for (i = 0; i < this.iScenCount; i = i + 1 | 0) {
      if (pEl === this.ppScenList.a[this.ppScenList.o + i].pBtn) {
        break;
      }
    }
    if (i === this.iScenCount) {
      return;
    }
    this.pSelectedEntry = this.ppScenList.a[this.ppScenList.o + i].pScenEntry;
  }

  Clear() {
    this.fCoordinatesAdjusted = false;
    $.C4FacetSurface.prototype.Clear.call(this.fctBackgroundPicture);
    this.pScenarioFolder = null;
    this.pSelectedEntry = null;
    this.pSelectionInfoBox = null;
    this.rcScenInfoArea.Set$i32$i32$i32$i32(0, 0, 0, 0);
    this.MinResX = this.MinResY = 0;
    this.fUseFullscreenMap = false;
    let i = 0;
    for (i = 0; i < this.iScenCount; i = i + 1 | 0) {
      $delete(this.ppScenList.a[this.ppScenList.o + i]);
    }
    this.iScenCount = 0;
    $delete(this.ppScenList);
    this.ppScenList = null;
    for (i = 0; i < this.iAccessGfxCount; i = i + 1 | 0) {
      $delete(this.ppAccessGfxList.a[this.ppAccessGfxList.o + i]);
    }
    this.iAccessGfxCount = 0;
    $delete(this.ppAccessGfxList);
    this.ppAccessGfxList = null;
    this.pMainDlg = null;
  }

  Load(hGroup, pScenLoaderFolder) {
    this.Clear();
    let LangTable = new $.C4LangStringTable().init();
    let fHasLangTable = $.C4Language.LoadComponentHost(LangTable, hGroup, S("StringTbl.txt|StringTbl%s.txt"), P($.Config.General.LanguageEx, 0));
    let Buf = new $.StdStrBuf();
    if (!hGroup.LoadEntryString$pi8$pStdStrBuf(S("FolderMap.txt"), Buf)) {
      return false;
    }
    if (fHasLangTable) {
      LangTable.ReplaceStrings$rStdStrBuf(Buf);
    }
    if (!$.CompileFromBuf_LogWarn$mStdNamingAdapt$C4MapFolderData$x$pi8($.mkNamingAdapt$rC4MapFolderData$pi8(this, S("FolderMap")), Buf, S("FolderMap.txt"))) {
      return false;
    }
    if (this.MinResX !== 0 && this.MinResX > $.GetScreenWdt()) {
      return false;
    }
    if (this.MinResY !== 0 && this.MinResY > $.GetScreenHgt()) {
      return false;
    }
    if (!this.fctBackgroundPicture.Load(hGroup, S("FolderMap"), -1, -1, false, 0)) {
      $.DebugLogF(S("C4MapFolderData::Load(%s): Could not load background graphic \"%s\""), hGroup.GetName(), S("FolderMap"));
      return false;
    }
    let i = 0;
    for (i = 0; i < this.iScenCount; i = i + 1 | 0) {
      let pScen = this.ppScenList.a[this.ppScenList.o + i];
      pScen.pScenEntry = pScenLoaderFolder.FindEntryByName(pScen.sFilename.getData());
      pScen.pBtn = null;
      pScen.sTitle.Replace(S("TITLE"), pScen.pScenEntry != null ? pScen.pScenEntry.GetName().getData() : S("<c ff0000>ERROR</c>"));
      if (pScen.fImgDump) {
        let fctDump = new $.C4FacetSurface().init();
        let fSuccess = false;
        if (fctDump.Create(pScen.rcOverlayPos.Wdt, pScen.rcOverlayPos.Hgt, -1, -1)) {
          $.pDraw.Blit(this.fctBackgroundPicture.Surface, Math.fround(pScen.rcOverlayPos.x), Math.fround(pScen.rcOverlayPos.y), Math.fround(pScen.rcOverlayPos.Wdt), Math.fround(pScen.rcOverlayPos.Hgt), fctDump.Surface, Math.fround(0), Math.fround(0), fctDump.Wdt, fctDump.Hgt);
          fSuccess = fctDump.Surface.SavePNG$pi8$b$b$b(pScen.sBaseImage.getData(), true, false, false);
        }
        if (!fSuccess) {
          $.DebugLogF(S("C4MapFolderData::Load(%s): Could not dump graphic \"%s\""), hGroup.GetName(), pScen.sBaseImage.getData());
        }
        continue;
      }
      if (pScen.sBaseImage.getLength() > 0) {
        if (!pScen.fctBase.Load(hGroup, pScen.sBaseImage.getData(), -1, -1, false, 0)) {
          $.DebugLogF(S("C4MapFolderData::Load(%s): Could not load base graphic \"%s\""), hGroup.GetName(), pScen.sBaseImage.getData());
          return false;
        }
      }
      if (pScen.sOverlayImage.getLength() > 0) {
        if (!pScen.fctOverlay.Load(hGroup, pScen.sOverlayImage.getData(), -1, -1, false, 0)) {
          $.DebugLogF(S("C4MapFolderData::Load(%s): Could not load graphic \"%s\""), hGroup.GetName(), pScen.sOverlayImage.getData());
          return false;
        }
      }
    }
    for (i = 0; i < this.iAccessGfxCount; i = i + 1 | 0) {
      let pGfx = this.ppAccessGfxList.a[this.ppAccessGfxList.o + i];
      if (pGfx.sOverlayImage.getLength() > 0) {
        if (!pGfx.fctOverlay.Load(hGroup, pGfx.sOverlayImage.getData(), -1, -1, false, 0)) {
          $.DebugLogF(S("C4MapFolderData::Load(%s): Could not load graphic \"%s\""), hGroup.GetName(), pGfx.sOverlayImage.getData());
          return false;
        }
      }
    }
    this.pScenarioFolder = pScenLoaderFolder;
    return true;
  }

  CompileFunc(pComp) {
    let $t1, $t2;
    pComp.Value$StdNamingDefaultAdapt$C4Rect$C4Rect($.mkNamingAdapt$rC4Rect$pi8$C4Rect$b$b(this.rcScenInfoArea, S("ScenInfoArea"), new $.C4Rect().init$i32$i32$i32$i32(0, 0, 0, 0)));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "MinResX"), S("MinResX"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "MinResY"), S("MinResY"), 0));
    pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "fUseFullscreenMap"), S("FullscreenBG"), false));
    let iOldScenCount = this.iScenCount;
    pComp.Value$StdNamingCountAdapt$i32($.mkNamingCountAdapt$ri32$pi8(P(this, "iScenCount"), S("Scenario")));
    if (pComp.isDeserializer()) {
      while (($t1 = iOldScenCount, iOldScenCount = iOldScenCount - 1 | 0, $t1) !== 0) {
        $delete(this.ppScenList.a[this.ppScenList.o + iOldScenCount]);
      }
      $delete(this.ppScenList);
      if (this.iScenCount !== 0) {
        this.ppScenList = P(new Array($u64n(this.iScenCount)).fill(null), 0);
        c$memset(this.ppScenList, 0, 8 * $u64n(this.iScenCount));
      } else {
        this.ppScenList = null;
      }
    }
    if (this.iScenCount !== 0) {
      $.mkPtrAdaptNoNull$rpScenario(this.ppScenList);
      pComp.Value$StdNamingAdapt$StdArrayAdapt$pScenario$StdPtrAdapt$Scenario($.mkNamingAdapt$mStdArrayAdapt$pScenario$StdPtrAdapt$Scenario$pi8($.mkArrayAdaptMap$ppScenario$i32$x(this.ppScenList, this.iScenCount, $.mkPtrAdaptNoNull$rpScenario), S("Scenario")));
    }
    let iOldAccesGfxCount = this.iAccessGfxCount;
    pComp.Value$StdNamingCountAdapt$i32($.mkNamingCountAdapt$ri32$pi8(P(this, "iAccessGfxCount"), S("AccessGfx")));
    if (pComp.isDeserializer()) {
      while (($t2 = iOldAccesGfxCount, iOldAccesGfxCount = iOldAccesGfxCount - 1 | 0, $t2) !== 0) {
        $delete(this.ppAccessGfxList.a[this.ppAccessGfxList.o + iOldAccesGfxCount]);
      }
      $delete(this.ppAccessGfxList);
      if (this.iAccessGfxCount !== 0) {
        this.ppAccessGfxList = P(new Array($u64n(this.iAccessGfxCount)).fill(null), 0);
        c$memset(this.ppAccessGfxList, 0, 8 * $u64n(this.iAccessGfxCount));
      } else {
        this.ppAccessGfxList = null;
      }
    }
    if (this.iAccessGfxCount !== 0) {
      $.mkPtrAdaptNoNull$rpAccessGfx(this.ppAccessGfxList);
      pComp.Value$StdNamingAdapt$StdArrayAdapt$pAccessGfx$StdPtrAdapt$AccessGfx($.mkNamingAdapt$mStdArrayAdapt$pAccessGfx$StdPtrAdapt$AccessGfx$pi8($.mkArrayAdaptMap$ppAccessGfx$i32$x(this.ppAccessGfxList, this.iAccessGfxCount, $.mkPtrAdaptNoNull$rpAccessGfx), S("AccessGfx")));
    }
  }

  CreateGUIElements(pMainDlg, rContainer) {
    this.pMainDlg = pMainDlg;
    if (!this.fCoordinatesAdjusted) {
      if (!this.fUseFullscreenMap) {
        this.ConvertFacet2ScreenCoord$rC4Rect$b(rContainer.GetClientRect(), true);
      } else {
        let rcMapRect = pMainDlg.GetBounds().$clone();
        rContainer.ClientPos2ScreenPos(P(rcMapRect, "x"), P(rcMapRect, "y"));
        this.ConvertFacet2ScreenCoord$rC4Rect$b(rcMapRect, false);
      }
    }
    while ($.Container.prototype.GetFirst.call(rContainer) != null) {
      $delete($.Container.prototype.GetFirst.call(rContainer));
    }
    if (!this.fUseFullscreenMap) {
      $.Container.prototype.AddElement$pElement.call(rContainer, new C4MapFolderData$MapPic().init(this.rcfBG, this.fctBackgroundPicture));
    } else {
      pMainDlg.SetBackground(this.fctBackgroundPicture);
    }
    let i = 0;
    for (i = 0; i < this.iAccessGfxCount; i = i + 1 | 0) {
      let pGfx = this.ppAccessGfxList.a[this.ppAccessGfxList.o + i];
      let szPassword = pGfx.sPassword.getData();
      if (szPassword == null || szPassword.a[szPassword.o] === 0 || $.SIsModule(P($.Config.General.MissionAccess, 0), szPassword)) {
        $.Container.prototype.AddElement$pElement.call(rContainer, new C4MapFolderData$MapPic().init(pGfx.rcfOverlayPos, pGfx.fctOverlay));
      }
    }
    let pBtnFirst = null;
    for (i = 0; i < this.iScenCount; i = i + 1 | 0) {
      let pScen = this.ppScenList.a[this.ppScenList.o + i];
      if (pScen.pScenEntry != null && !pScen.pScenEntry.HasMissionAccess()) {
      } else {
        let pBtn = new $.CallbackButtonEx$C4StartupScenSelDlg$FacetButton().init$C4Facet$C4Facet$FLOAT_RECT$i8$pC4StartupScenSelDlg$x(pScen.fctBase, pScen.fctOverlay, pScen.rcfOverlayPos, 0, pMainDlg, "OnButtonScenario");
        this.ppScenList.a[this.ppScenList.o + i].pBtn = pBtn;
        if (pScen.pScenEntry != null) {
          pBtn.SetToolTip($.FormatString($.LoadResStr(S("IDS_MSG_MAP_STARTSCEN")), pScen.pScenEntry.GetName().getData()).getData());
        }
        if (pScen.sTitle.getLength() > 0) {
          pBtn.SetText$pi8(pScen.sTitle.getData());
          pBtn.SetTextColors(pScen.dwTitleInactClr, pScen.dwTitleActClr);
          pBtn.SetTextPos(pScen.iTitleOffX, pScen.iTitleOffY, pScen.byTitleAlign);
          let pUseFont = null;
          const fFontZoom = [1];
          if (pScen.fTitleBookFont) {
            pUseFont = $.C4Startup.Get().Graphics.GetBlackFontByHeight(pScen.iTitleFontSize, P(fFontZoom, 0));
          } else {
            pUseFont = $.GraphicsResource.GetFontByHeight(pScen.iTitleFontSize, P(fFontZoom, 0));
          }
          if ($.Inside$f32$f32$f32(fFontZoom[0], Math.fround(0.800000011), 1.25)) {
            fFontZoom[0] = 1;
          }
          pBtn.SetTextFont(pUseFont, fFontZoom[0]);
        }
        $.Container.prototype.AddElement$pElement.call(rContainer, pBtn);
        if (pBtnFirst == null) {
          pBtnFirst = pBtn;
        }
      }
    }
    this.pSelectionInfoBox = new $.TextWindow().init(this.rcScenInfoArea, 680, 520, 10, 100, 4096, null, true, $.C4Startup.Get().Graphics.fctScenSelTitleOverlay, 20);
    this.pSelectionInfoBox.SetDecoration$b$b$pScrollBarFacets$b(false, false, $.C4Startup.Get().Graphics.sfctBookScroll, true);
    $.Container.prototype.AddElement$pElement.call(rContainer, this.pSelectionInfoBox);
  }

  ResetSelection() {
    this.pSelectedEntry = null;
  }

  GetSelectionInfoBox() {
    return this.pSelectionInfoBox;
  }

  GetSelectedEntry() {
    return this.pSelectedEntry;
  }

  $clone() { return new C4MapFolderData().$assign(this); }
  $assign(o) {
    this.fctBackgroundPicture.$assign(o.fctBackgroundPicture);
    this.rcfBG.$assign(o.rcfBG);
    this.fCoordinatesAdjusted = o.fCoordinatesAdjusted;
    this.rcScenInfoArea.$assign(o.rcScenInfoArea);
    this.pScenarioFolder = o.pScenarioFolder;
    this.pSelectedEntry = o.pSelectedEntry;
    this.pSelectionInfoBox = o.pSelectionInfoBox;
    this.MinResX = o.MinResX;
    this.MinResY = o.MinResY;
    this.fUseFullscreenMap = o.fUseFullscreenMap;
    this.ppScenList = o.ppScenList;
    this.iScenCount = o.iScenCount;
    this.ppAccessGfxList = o.ppAccessGfxList;
    this.iAccessGfxCount = o.iAccessGfxCount;
    this.pMainDlg = o.pMainDlg;
    return this;
  }
}

export class C4MapFolderData$Scenario {
  sFilename = new $.StdStrBuf();
  sBaseImage = new $.StdStrBuf();
  sOverlayImage = new $.StdStrBuf();
  sTitle = new $.StdStrBuf();
  iTitleFontSize = 0;
  dwTitleInactClr = 0;
  dwTitleActClr = 0;
  iTitleOffX = 0;
  iTitleOffY = 0;
  byTitleAlign = 0;
  fTitleBookFont = false;
  fImgDump = false;
  rcOverlayPos = new $.C4Rect();
  rcfOverlayPos = new $.FLOAT_RECT();
  fctBase = new $.C4FacetSurface().init();
  fctOverlay = new $.C4FacetSurface().init();
  pScenEntry = null;
  pBtn = null;

  CompileFunc(pComp) {
    pComp.Value$StdNamingDefaultAdapt$StdStrBuf$StdStrBuf($.mkNamingAdapt$rStdStrBuf$pi8$StdStrBuf$b$b(this.sFilename, S("File"), new $.StdStrBuf()));
    pComp.Value$StdNamingDefaultAdapt$StdStrBuf$StdStrBuf($.mkNamingAdapt$rStdStrBuf$pi8$StdStrBuf$b$b(this.sBaseImage, S("BaseImage"), new $.StdStrBuf()));
    pComp.Value$StdNamingDefaultAdapt$StdStrBuf$StdStrBuf($.mkNamingAdapt$rStdStrBuf$pi8$StdStrBuf$b$b(this.sOverlayImage, S("OverlayImage"), new $.StdStrBuf()));
    pComp.Value$StdNamingDefaultAdapt$C4Rect$C4Rect($.mkNamingAdapt$rC4Rect$pi8$C4Rect$b$b(this.rcOverlayPos, S("Area"), new $.C4Rect()));
    pComp.Value$StdNamingDefaultAdapt$StdStrBuf$StdStrBuf($.mkNamingAdapt$rStdStrBuf$pi8$StdStrBuf$b$b(this.sTitle, S("Title"), new $.StdStrBuf()));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "iTitleFontSize"), S("TitleFontSize"), 20));
    pComp.Value$StdNamingDefaultAdapt$u32$u32($.mkNamingAdapt$ru32$pi8$u32$b$b(P(this, "dwTitleInactClr"), S("TitleColorInactive"), 0x7fffffff));
    pComp.Value$StdNamingDefaultAdapt$u32$u32($.mkNamingAdapt$ru32$pi8$u32$b$b(P(this, "dwTitleActClr"), S("TitleColorActive"), 0xfffffff));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "iTitleOffX"), S("TitleOffX"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "iTitleOffY"), S("TitleOffY"), 0));
    pComp.Value$StdNamingDefaultAdapt$u8$i32($.mkNamingAdapt$ru8$pi8$i32$b$b(P(this, "byTitleAlign"), S("TitleAlign"), $.ACenter$C4Surface));
    pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "fTitleBookFont"), S("TitleUseBookFont"), true));
    pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "fImgDump"), S("ImageDump"), false));
  }

  None() {
    this.sFilename = new $.StdStrBuf();
    this.sBaseImage = new $.StdStrBuf();
    this.sOverlayImage = new $.StdStrBuf();
    this.sTitle = new $.StdStrBuf();
    this.rcOverlayPos = new $.C4Rect();
    this.rcfOverlayPos = new $.FLOAT_RECT();
    this.fctBase = new $.C4FacetSurface().init();
    this.fctOverlay = new $.C4FacetSurface().init();
    return this;
  }

  $clone() { return new C4MapFolderData$Scenario().$assign(this); }
  $assign(o) {
    this.sFilename.$assign(o.sFilename);
    this.sBaseImage.$assign(o.sBaseImage);
    this.sOverlayImage.$assign(o.sOverlayImage);
    this.sTitle.$assign(o.sTitle);
    this.iTitleFontSize = o.iTitleFontSize;
    this.dwTitleInactClr = o.dwTitleInactClr;
    this.dwTitleActClr = o.dwTitleActClr;
    this.iTitleOffX = o.iTitleOffX;
    this.iTitleOffY = o.iTitleOffY;
    this.byTitleAlign = o.byTitleAlign;
    this.fTitleBookFont = o.fTitleBookFont;
    this.fImgDump = o.fImgDump;
    this.rcOverlayPos.$assign(o.rcOverlayPos);
    this.rcfOverlayPos.$assign(o.rcfOverlayPos);
    this.fctBase.$assign(o.fctBase);
    this.fctOverlay.$assign(o.fctOverlay);
    this.pScenEntry = o.pScenEntry;
    this.pBtn = o.pBtn;
    return this;
  }
}

export class C4MapFolderData$AccessGfx {
  sPassword = new $.StdStrBuf();
  sOverlayImage = new $.StdStrBuf();
  rcOverlayPos = new $.C4Rect();
  rcfOverlayPos = new $.FLOAT_RECT();
  fctOverlay = new $.C4FacetSurface().init();

  CompileFunc(pComp) {
    pComp.Value$StdNamingDefaultAdapt$StdStrBuf$StdStrBuf($.mkNamingAdapt$rStdStrBuf$pi8$StdStrBuf$b$b(this.sPassword, S("Access"), new $.StdStrBuf()));
    pComp.Value$StdNamingDefaultAdapt$StdStrBuf$StdStrBuf($.mkNamingAdapt$rStdStrBuf$pi8$StdStrBuf$b$b(this.sOverlayImage, S("OverlayImage"), new $.StdStrBuf()));
    pComp.Value$StdNamingDefaultAdapt$C4Rect$C4Rect($.mkNamingAdapt$rC4Rect$pi8$C4Rect$b$b(this.rcOverlayPos, S("Area"), new $.C4Rect()));
  }

  None() {
    this.sPassword = new $.StdStrBuf();
    this.sOverlayImage = new $.StdStrBuf();
    this.rcOverlayPos = new $.C4Rect();
    this.rcfOverlayPos = new $.FLOAT_RECT();
    this.fctOverlay = new $.C4FacetSurface().init();
    return this;
  }

  $clone() { return new C4MapFolderData$AccessGfx().$assign(this); }
  $assign(o) {
    this.sPassword.$assign(o.sPassword);
    this.sOverlayImage.$assign(o.sOverlayImage);
    this.rcOverlayPos.$assign(o.rcOverlayPos);
    this.rcfOverlayPos.$assign(o.rcfOverlayPos);
    this.fctOverlay.$assign(o.fctOverlay);
    return this;
  }
}

export class C4StartupScenSelDlg$ScenListItem$RenameParams {

  $clone() { return new C4StartupScenSelDlg$ScenListItem$RenameParams().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class C4ScenarioListLoader$Scenario extends C4ScenarioListLoader$Entry {
  C4S = new $.C4Scenario().init();
  ParameterDefs = new $.C4ScenarioParameterDefs().init();
  Parameters = new $.C4ScenarioParameters().init();
  fctAchievements = $oarr(3, () => new $.C4FacetSurface().init());
  sAchievementDescriptions = $oarr(3, () => new $.StdCopyStrBuf());
  nAchievements = 0;
  fNoMissionAccess = false;
  iMinPlrCount = 0;

  init(pLoader, pParent) {
    super.init(pLoader, pParent);
    this.C4S = new $.C4Scenario().init();
    this.ParameterDefs = new $.C4ScenarioParameterDefs().init();
    this.Parameters = new $.C4ScenarioParameters().init();
    this.fctAchievements = $oarr(3, () => new $.C4FacetSurface().init());
    this.sAchievementDescriptions = $oarr(3, () => new $.StdCopyStrBuf());
    this.nAchievements = 0;
    this.fNoMissionAccess = false;
    this.iMinPlrCount = 0;
    return this;
  }

  $dtor() {
    super.$dtor();
  }

  LoadCustom(_rGrp, fNameLoaded, fIconLoaded) {
    if (!fIconLoaded) {
      this.iIconIndex = this.C4S.Head.Icon;
      this.fctIcon.Set$C4Facet($.C4Startup.Get().Graphics.fctScenSelIcons.GetSection(this.C4S.Head.Icon));
    }
    if (!fNameLoaded) {
      this.sName.op_assign$string(this.C4S.Head.Title);
    }
    if (!this.C4S.Head.SaveGame && !this.C4S.Head.Replay) {
      this.iDifficulty = this.C4S.Head.Difficulty;
    } else {
      this.iDifficulty = 0;
    }
    this.iMinPlrCount = this.C4S.GetMinPlayer();
    return true;
  }

  LoadCustomPre(rGrp) {
    let $t1;
    let sFileContents = new $.StdStrBuf();
    if (!rGrp.LoadEntryString$pi8$pStdStrBuf(S("Scenario.txt"), sFileContents)) {
      return false;
    }
    if (!$.CompileFromBuf_LogWarn$mStdParameterAdapt$C4Scenario$b$x$pi8$2($.mkParAdapt$rC4Scenario$mb(this.C4S, false), sFileContents, rGrp.GetFullName().op_add$pi8(S("/Scenario.txt")).getData())) {
      return false;
    }
    this.fNoMissionAccess = !this.C4S.Head.MissionAccess.empty() && !$.SIsModule(P($.Config.General.MissionAccess, 0), this.C4S.Head.MissionAccess.c_str());
    if (!this.C4S.Head.SaveGame && !this.C4S.Head.Replay) {
      rGrp.PreCacheEntries(S("StringTbl*.txt"), true);
      rGrp.PreCacheEntries(S("ParameterDefs.txt"), true);
      let ScenarioLangStringTable = new $.C4LangStringTable().init();
      $.C4Language.LoadComponentHost(ScenarioLangStringTable, rGrp, S("StringTbl.txt|StringTbl%s.txt"), P($.Config.General.LanguageEx, 0));
      this.ParameterDefs.Load(rGrp, ScenarioLangStringTable);
      this.nAchievements = 0;
      const deflists = [this.pParent != null ? this.pParent.GetAchievementDefs() : null, this.ParameterDefs];
      for (const deflist of deflists) {
        if (deflist == null) {
          continue;
        }
        let def = null;
        let idx = 0;
        while ((def = deflist.GetParameterDefByIndex(($t1 = idx, idx = idx + 1, $t1))) != null) {
          if (def.IsAchievement()) {
            let val = this.pLoader.GetAchievements().GetValueByID($.C4ScenarioParameters.AddFilename2ID(rGrp.GetFullName().getData(), def.GetID()).getData(), def.GetDefault());
            if (val !== 0) {
              let achievement_gfx = def.GetAchievement();
              let sAchievementFilename = new $.StdStrBuf().init$pi8$b(S("Achv*.png"));
              sAchievementFilename.Replace(S("*"), achievement_gfx);
              if (!this.fctAchievements[this.nAchievements].Load(rGrp, sAchievementFilename.getData(), -2, -1, false, 1)) {
                let fct = null;
                let parent_achv_gfx = null;
                if (this.pParent != null && (parent_achv_gfx = this.pParent.GetAchievementGfx()) != null) {
                  fct = parent_achv_gfx.FindByName(achievement_gfx);
                }
                if (fct == null) {
                  fct = $.GraphicsResource.Achievements.FindByName(achievement_gfx);
                }
                if (fct == null) {
                  continue;
                }
                this.fctAchievements[this.nAchievements].Set$C4Facet(fct);
              }
              if (val > 1) {
                this.fctAchievements[this.nAchievements].X = Math.fround(this.fctAchievements[this.nAchievements].X + Math.fround(this.fctAchievements[this.nAchievements].Wdt * Math.fround(val - 1 | 0)));
              }
              let opt = def.GetOptionByValue(val);
              if (opt != null) {
                this.sAchievementDescriptions[this.nAchievements].$assign(opt.Description);
              }
              this.nAchievements = this.nAchievements + 1 | 0;
              if (this.nAchievements === 3) {
                break;
              }
            }
          }
        }
      }
    }
    return true;
  }

  *Start() {
    if (C4StartupScenSelDlg.pInstance == null) {
      return false;
    }
    return (yield* C4StartupScenSelDlg.pInstance.StartScenario(this));
  }

  CanOpen(sErrOut, CanHide) {
    let pDlg = C4StartupScenSelDlg.pInstance;
    if (pDlg == null) {
      return false;
    }
    if (!this.HasMissionAccess()) {
      sErrOut.Copy$pi8($.LoadResStr(S("IDS_PRC_NOMISSIONACCESS")));
      return false;
    }
    if (this.C4S.Head.Replay) {
      if (pDlg.IsNetworkStart()) {
        sErrOut.Copy$pi8($.LoadResStr(S("IDS_PRC_NONETREPLAY")));
        return false;
      }
    } else {
      let iPlrCount = $.SModuleCount(P($.Config.General.Participants, 0));
      let iMaxPlrCount = this.C4S.Head.MaxPlayer;
      if (this.C4S.Head.SaveGame) {
        iMaxPlrCount = $max(this.iMinPlrCount, iMaxPlrCount);
        if (this.C4S.Head.C4XVer[0] !== 9 || this.C4S.Head.C4XVer[1] !== 0) {
          sErrOut.Format($.LoadResStr(S("IDS_MSG_SAVEGAMEVERSIONMISMATCH")), this.C4S.Head.C4XVer[0], this.C4S.Head.C4XVer[1]);
          CanHide.a[CanHide.o] = false;
        }
      }
      if (iPlrCount < this.iMinPlrCount) {
        if (pDlg.IsNetworkStart()) {
          sErrOut.Format($.LoadResStr(S("IDS_MSG_TOOFEWPLAYERSNET")), this.iMinPlrCount);
          CanHide.a[CanHide.o] = true;
        } else {
          sErrOut.Format($.LoadResStr(S("IDS_MSG_TOOFEWPLAYERS")), this.iMinPlrCount);
          return false;
        }
      }
      if (iPlrCount > iMaxPlrCount) {
        sErrOut.Format($.LoadResStr(S("IDS_MSG_TOOMANYPLAYERS")), this.C4S.Head.MaxPlayer);
        return false;
      }
    }
    return true;
  }

  IsGrayed() {
    return false;
  }

  IsHidden() {
    return this.C4S.Head.Secret && !this.HasMissionAccess();
  }

  HasMissionAccess() {
    return !this.fNoMissionAccess;
  }

  GetOpenText() {
    return new $.StdCopyStrBuf().init$pi8$b($.LoadResStr(S("IDS_BTN_STARTGAME")));
  }

  GetOpenTooltip() {
    return new $.StdCopyStrBuf().init$pi8$b($.LoadResStr(S("IDS_DLGTIP_SCENSELNEXT")));
  }

  GetC4S() {
    return this.C4S;
  }

  GetAchievement(idx, out_facet, out_description) {
    if (idx < 0 || idx >= this.nAchievements) {
      return false;
    }
    out_facet.$assign(this.fctAchievements[idx]);
    out_description.a[out_description.o] = this.sAchievementDescriptions[idx].getData();
    return true;
  }

  GetTypeName() {
    return new $.StdCopyStrBuf().init$pi8$b($.LoadResStr(S("IDS_TYPE_SCENARIO")), true);
  }

  GetDefaultExtension() {
    return S("ocs");
  }

  GetParameterDefs() {
    return this.ParameterDefs;
  }

  GetParameters() {
    return this.Parameters;
  }

  IsScenario() {
    return true;
  }

  $clone() { return new C4ScenarioListLoader$Scenario().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.C4S.$assign(o.C4S);
    this.ParameterDefs.$assign(o.ParameterDefs);
    this.Parameters.$assign(o.Parameters);
    this.fctAchievements = $own(o.fctAchievements.map(($e0) => $e0.$clone()));
    this.sAchievementDescriptions = $own(o.sAchievementDescriptions.map(($e0) => $e0.$clone()));
    this.nAchievements = o.nAchievements;
    this.fNoMissionAccess = o.fNoMissionAccess;
    this.iMinPlrCount = o.iMinPlrCount;
    return this;
  }
}

export class C4ScenarioListLoader$Folder extends C4ScenarioListLoader$Entry {
  C4F = new $.C4Folder().init();
  fContentsLoaded = false;
  pFirst = null;
  pMapData = null;

  init(pLoader, pParent) {
    super.init(pLoader, pParent);
    this.C4F = new $.C4Folder().init();
    this.fContentsLoaded = false;
    this.pFirst = null;
    this.pMapData = null;
    return this;
  }

  $dtor() {
    if (this.pMapData != null) {
      $delete(this.pMapData);
    }
    C4ScenarioListLoader$Folder.prototype.ClearChildren.call(this);
    super.$dtor();
  }

  LoadCustomPre(rGrp) {
    let sFileContents = new $.StdStrBuf();
    if (rGrp.LoadEntryString$pi8$pStdStrBuf(S("Folder.txt"), sFileContents)) {
      if (!$.CompileFromBuf_LogWarn$rC4Folder$x$pi8(this.C4F, sFileContents, rGrp.GetFullName().op_add$pi8(S("/Folder.txt")).getData())) {
        return false;
      }
    }
    return true;
  }

  LoadContents(pLoader, pFromGrp, psFilename, fLoadEx, fReload) {
    if (this.fContentsLoaded && !fReload) {
      return true;
    }
    if (this.pMapData != null) {
      $delete(this.pMapData);
      this.pMapData = null;
    }
    if (psFilename == null) {
      psFilename = this.sFilename;
    } else {
      this.sFilename.op_assign$StdStrBuf(psFilename);
    }
    if (!this.DoLoadContents(pLoader, pFromGrp, psFilename, fLoadEx)) {
      return false;
    }
    this.Sort();
    return true;
  }

  GetEntryCount() {
    let iCount = 0;
    for (let i = this.pFirst; i != null; i = i.pNext) {
      iCount = iCount + 1 >>> 0;
    }
    return iCount;
  }

  ClearChildren() {
    let pDelFolder = this;
    let pCheckFolder = null;
    for (; ; ) {
      let pChild = null;
      while ((pChild = pDelFolder.pFirst) != null) {
        if ((pCheckFolder = pChild.GetIsFolder()) != null) {
          pDelFolder = pCheckFolder;
        } else {
          $delete(pChild);
        }
      }
      if (pDelFolder === this) {
        break;
      }
      pDelFolder = (pCheckFolder = pDelFolder).pParent;
      0;
      $delete(pCheckFolder);
    }
  }

  Sort() {
    let $t1, $t2, $t3, $t4;
    if (this.pFirst == null) {
      return;
    }
    let iCount = 0;
    let i = 0;
    let ppEntries = P(new Array(i = iCount = this.GetEntryCount()).fill(null), 0);
    let ppI = null;
    let pI = this.pFirst;
    let ppIThis = null;
    for (ppI = ppEntries; ($t1 = i, i = i - 1 >>> 0, $t1) !== 0; pI = pI.pNext) {
      $wr(($t2 = ppI, ppI = ppI.add(1), $t2), 0, pI);
    }
    c$qsort(ppEntries, iCount, 8, EntrySortFunc);
    ppIThis = P(this, "pFirst");
    for (ppI = ppEntries; ($t3 = iCount, iCount = iCount - 1 >>> 0, $t3) !== 0; ppIThis = P(ppIThis.a[ppIThis.o], "pNext")) {
      ppIThis.a[ppIThis.o] = $rd(($t4 = ppI, ppI = ppI.add(1), $t4));
    }
    ppIThis.a[ppIThis.o] = null;
    $delete(ppEntries);
  }

  Start() {
    if (C4StartupScenSelDlg.pInstance == null) {
      return false;
    }
    return C4StartupScenSelDlg.pInstance.OpenFolder(this);
  }

  GetIsFolder() {
    return this;
  }

  GetFirstEntry() {
    return this.pFirst;
  }

  Resort() {
    this.Sort();
  }

  FindEntryByName(szFilename) {
    for (let pEntry = this.pFirst; pEntry != null; pEntry = pEntry.GetNext()) {
      if ($.SEqualNoCase(szFilename, $.GetFilename(pEntry.GetEntryFilename().getData()))) {
        return pEntry;
      }
    }
    return null;
  }

  CanOpen(_sError, _CanHide) {
    return true;
  }

  IsGrayed() {
    return false;
  }

  GetOpenText() {
    return new $.StdCopyStrBuf().init$pi8$b($.LoadResStr(S("IDS_BTN_OPEN")));
  }

  GetOpenTooltip() {
    return new $.StdCopyStrBuf().init$pi8$b($.LoadResStr(S("IDS_DLGTIP_SCENSELNEXT")));
  }

  GetMapData() {
    return this.pMapData;
  }

  GetAchievementDefs() {
    return null;
  }

  GetAchievementGfx() {
    return null;
  }

  $clone() { return new C4ScenarioListLoader$Folder().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.C4F.$assign(o.C4F);
    this.fContentsLoaded = o.fContentsLoaded;
    this.pFirst = o.pFirst;
    this.pMapData = o.pMapData;
    return this;
  }
}

export class C4ScenarioListLoader$SubFolder extends C4ScenarioListLoader$Folder {
  AchievementDefs = new $.C4ScenarioParameterDefs().init();
  AchievementGfx = new $.C4AchievementGraphics().init();

  init(pLoader, pParent) {
    super.init(pLoader, pParent);
    this.AchievementDefs = new $.C4ScenarioParameterDefs().init();
    this.AchievementGfx = new $.C4AchievementGraphics().init();
    return this;
  }

  $dtor() {
    super.$dtor();
  }

  GetDefaultExtension() {
    return S("ocf");
  }

  GetTypeName() {
    return new $.StdCopyStrBuf().init$pi8$b($.LoadResStr(S("IDS_TYPE_FOLDER")), true);
  }

  GetAchievementDefs() {
    return this.AchievementDefs;
  }

  GetAchievementGfx() {
    return this.AchievementGfx;
  }

  LoadCustom(_rGrp, _fNameLoaded, fIconLoaded) {
    if (!fIconLoaded) {
      if ($.WildcardMatch(S("Savegames.ocf"), $.GetFilename(this.sFilename.getData()))) {
        this.iIconIndex = 29;
      } else {
        this.iIconIndex = 0;
      }
      this.fctIcon.Set$C4Facet($.C4Startup.Get().Graphics.fctScenSelIcons.GetSection(this.iIconIndex));
    }
    this.iFolderIndex = this.C4F.Head.Index;
    return true;
  }

  DoLoadContents(pLoader, pFromGrp, sFilename, fLoadEx) {
    0;
    this.ClearChildren();
    let Group = new $.C4Group().init();
    if (pFromGrp != null) {
      if (!Group.OpenAsChild(pFromGrp, sFilename.getData())) {
        return false;
      }
    } else if (!Group.Open(sFilename.getData())) {
      return false;
    }
    let FolderLangStringTable = new $.C4LangStringTable().init();
    $.C4Language.LoadComponentHost(FolderLangStringTable, Group, S("StringTbl.txt|StringTbl%s.txt"), P($.Config.General.LanguageEx, 0));
    this.AchievementDefs.Load(Group, FolderLangStringTable);
    this.AchievementGfx.Init$rC4Group(Group);
    let szC4CFN_ScenarioFiles = S("*.ocs");
    let szSearchMask = null;
    let iEntryCount = 0;
    for (szSearchMask = szC4CFN_ScenarioFiles; szSearchMask != null; ) {
      Group.ResetSearch();
      while (Group.FindNextEntry$pi8$pStdStrBuf$pu64$b(szSearchMask)) {
        iEntryCount = iEntryCount + 1 | 0;
      }
      if ($peq(szSearchMask, szC4CFN_ScenarioFiles)) {
        szSearchMask = S("*.ocf");
      } else {
        szSearchMask = null;
      }
    }
    if (!pLoader.DoProcessCallback(0, iEntryCount, null)) {
      return false;
    }
    const ChildFilename = new Int8Array(256);
    let sChildFilename = new $.StdStrBuf();
    let iLoadCount = 0;
    for (szSearchMask = szC4CFN_ScenarioFiles; szSearchMask != null; ) {
      Group.ResetSearch();
      while (Group.FindNextEntry$pi8$pi8$pu64$b(szSearchMask, P(ChildFilename, 0))) {
        if (!pLoader.DoProcessCallback(iLoadCount, iEntryCount, P(ChildFilename, 0))) {
          return false;
        }
        sChildFilename.Ref$pi8(P(ChildFilename, 0));
        let pNewEntry = C4ScenarioListLoader$Entry.CreateEntryForFile(sChildFilename, pLoader, this);
        if (pNewEntry != null) {
          if (!pNewEntry.Load(Group, sChildFilename, fLoadEx)) {
            $.DebugLogF(S("Error loading entry \"%s\" in SubFolder \"%s\"!"), sChildFilename.getData(), Group.GetFullName().getData());
            $delete(pNewEntry);
          }
        }
        iLoadCount = iLoadCount + 1 | 0;
      }
      if ($peq(szSearchMask, szC4CFN_ScenarioFiles)) {
        szSearchMask = S("*.ocf");
      } else {
        szSearchMask = null;
      }
    }
    if (Group.FindEntry$pi8$pStdStrBuf$pu64(S("FolderMap.txt"))) {
      this.pMapData = new C4MapFolderData().init();
      if (!this.pMapData.Load(Group, this)) {
        $delete(this.pMapData);
        this.pMapData = null;
      }
    }
    this.fContentsLoaded = true;
    return true;
  }

  $clone() { return new C4ScenarioListLoader$SubFolder().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.AchievementDefs.$assign(o.AchievementDefs);
    this.AchievementGfx.$assign(o.AchievementGfx);
    return this;
  }
}

export class C4ScenarioListLoader$RegularFolder extends C4ScenarioListLoader$Folder {
  contents = [];

  init(pLoader, pParent) {
    super.init(pLoader, pParent);
    this.contents = [];
    return this;
  }

  $dtor() {
    super.$dtor();
  }

  GetTypeName() {
    return new $.StdCopyStrBuf().init$pi8$b($.LoadResStr(S("IDS_TYPE_DIRECTORY")), true);
  }

  Merge(szPath) {
    this.contents.push(StdString.of(szPath));
  }

  LoadCustom(_rGrp, _fNameLoaded, fIconLoaded) {
    if (!fIconLoaded) {
      this.fctIcon.Set$C4Facet($.C4Startup.Get().Graphics.fctScenSelIcons.GetSection(44));
    }
    this.iFolderIndex = this.C4F.Head.Index;
    return true;
  }

  DoLoadContents(pLoader, _pFromGrp, sFilename, fLoadEx) {
    this.ClearChildren();
    0;
    if (sFilename.getData() != null && sFilename.op_index(0) !== 0) {
      this.Merge(sFilename.getData());
    }
    let iCountLoaded = 0;
    let iCountTotal = 0;
    let it = null;
    for (it = $begin(this.contents).copy(); !it.eq($end(this.contents)); it.inc()) {
      if (!$.DirectoryExists(it.v.c_str())) {
        continue;
      }
      let DirIter = new $.DirectoryIterator().init$pi8(it.v.c_str());
      let szChildFilename = null;
      for (; (szChildFilename = DirIter.op_mul()) != null; DirIter.op_inc$v()) {
        if (szChildFilename.a[szChildFilename.o] === 0 || $rd($.GetFilename(szChildFilename)) === 46) {
          continue;
        }
        iCountTotal = iCountTotal + 1 | 0;
      }
    }
    if (!pLoader.DoProcessCallback(iCountLoaded, iCountTotal, null)) {
      return false;
    }
    let names = new StdSet();
    let szChildFilename = null;
    for (it = $begin(this.contents).copy(); !it.eq($end(this.contents)); it.inc()) {
      if (!pLoader.DoProcessCallback(iCountLoaded, iCountTotal, $.GetFilename(it.v.c_str()))) {
        return false;
      }
      for (let DirIter = new $.DirectoryIterator().init$pi8(it.v.c_str()); (szChildFilename = DirIter.op_mul()) != null; DirIter.op_inc$v()) {
        let sChildFilename = new $.StdStrBuf().init$pi8$b(szChildFilename);
        szChildFilename = $.GetFilename(szChildFilename);
        if (!pLoader.DoProcessCallback(iCountLoaded, iCountTotal, szChildFilename)) {
          return false;
        }
        if ($.C4Group_TestIgnore(szChildFilename)) {
          continue;
        }
        if (!names.find(StdString.of(szChildFilename)).eq(names.end())) {
          continue;
        }
        names.insert(StdString.of(szChildFilename));
        let pNewEntry = C4ScenarioListLoader$Entry.CreateEntryForFile(sChildFilename, pLoader, this);
        if (pNewEntry != null) {
          if (!pNewEntry.Load(null, sChildFilename, fLoadEx)) {
            $.DebugLogF(S("Error loading entry \"%s\" in Folder \"%s\"!"), szChildFilename, it.v.c_str());
            $delete(pNewEntry);
          }
        }
        iCountLoaded = iCountLoaded + 1 | 0;
      }
    }
    this.fContentsLoaded = true;
    return true;
  }

  $clone() { return new C4ScenarioListLoader$RegularFolder().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.contents = o.contents.slice();
    return this;
  }
}

export class C4MapFolderData$MapPic extends Picture {
  rcfBounds = new $.FLOAT_RECT();

  init(rcfBounds, rfct) {
    super.init(new $.C4Rect().init$FLOAT_RECT(rcfBounds), false);
    this.rcfBounds = rcfBounds.$clone();
    this.$dyn = C4MapFolderData$MapPic;
    this.SetFacet$C4Facet(rfct);
    this.SetToolTip($.LoadResStr(S("IDS_MSG_MAP_DESC")));
    return this;
  }

  MouseInput$rCMouse$i32$i32$i32$u32(rMouse, iButton, iX, iY, dwKeyParam) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4MapFolderData$MapPic && C4MapFolderData$MapPic.prototype instanceof $c) return $c.prototype.MouseInput$rCMouse$i32$i32$i32$u32.apply(this, arguments); }
    $spawn($.Element.prototype.MouseInput$rCMouse$i32$i32$i32$u32.call(this, rMouse, iButton, iX, iY, dwKeyParam));
    if (iButton === 1 && C4StartupScenSelDlg.pInstance != null) {
      C4StartupScenSelDlg.pInstance.DeselectAll();
    }
  }

  DrawElement(cgo) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4MapFolderData$MapPic && C4MapFolderData$MapPic.prototype instanceof $c) return $c.prototype.DrawElement.apply(this, arguments); }
    let x0 = Math.fround(this.rcfBounds.left + cgo.TargetX);
    let y0 = Math.fround(this.rcfBounds.top + cgo.TargetY);
    this.GetFacet().DrawXFloat(cgo.Surface, x0, y0, Math.fround(this.rcfBounds.right - this.rcfBounds.left), Math.fround(this.rcfBounds.bottom - this.rcfBounds.top));
  }

  $clone() { return new C4MapFolderData$MapPic().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.rcfBounds.$assign(o.rcfBounds);
    return this;
  }
}

export class C4StartupScenSelDlg$ScenListItem extends Window {
  pIcon = null;
  pNameLabel = null;
  ppAchievements = new Array(3).fill(null);
  pScenListEntry = null;

  init(pForListBox, pForEntry, pInsertBeforeElement = null) {
    super.init();
    this.pIcon = null;
    this.pNameLabel = null;
    this.pScenListEntry = pForEntry;
    this.$dyn = C4StartupScenSelDlg$ScenListItem;
    let $t1;
    0;
    const rUseFont = $.C4Startup.Get().Graphics.BookFont;
    let sIgnore = new $.StdStrBuf();
    const bIgnore = [false];
    let fEnabled = this.pScenListEntry.CanOpen(sIgnore, P(bIgnore, 0)) && !this.pScenListEntry.IsGrayed();
    let iHeight = rUseFont.GetLineHeight() + 4 | 0;
    this.pIcon = new $.Picture().init(new $.C4Rect().init$i32$i32$i32$i32(0, 0, iHeight, iHeight), true);
    this.pIcon.SetFacet$C4Facet(this.pScenListEntry.GetIconFacet());
    this.pNameLabel = new $.Label().init$pi8$i32$i32$i32$u32$pCStdFont$b$b(this.pScenListEntry.GetName().getData(), iHeight + 2 | 0, 2, 0, fEnabled ? $.ClrScenarioItem$C4StartupScenSelDlg : $.ClrScenarioItemDisabled$C4StartupScenSelDlg, rUseFont, false, false);
    for (let i = 0; i < 3; i = i + 1 | 0) {
      let fct = new $.C4Facet().init$v();
      const desc = [null];
      if (pForEntry.GetAchievement(i, fct, P(desc, 0))) {
        this.ppAchievements[i] = new $.Picture().init(new $.C4Rect().init$i32$i32$i32$i32(Math.imul(iHeight, i + 2 | 0), 0, iHeight, iHeight), true);
        this.ppAchievements[i].SetFacet$C4Facet(fct);
        this.ppAchievements[i].SetToolTip(desc[0]);
      } else {
        this.ppAchievements[i] = null;
      }
    }
    this.SetBounds(this.pIcon.GetBounds());
    $.Container.prototype.AddElement$pElement.call(this, this.pIcon);
    $.Container.prototype.AddElement$pElement.call(this, this.pNameLabel);
    $t1 = this.ppAchievements;
    for (let $i1 = 0; $i1 < $t1.length; $i1++) {
      const ppAchievement = P($t1, $i1);
      if (ppAchievement.a[ppAchievement.o] != null) {
        $.Container.prototype.AddElement$pElement.call(this, ppAchievement.a[ppAchievement.o]);
      }
    }
    this.SetToolTip(this.pScenListEntry.GetName().getData());
    pForListBox.InsertElement$pElement$pElement$i32(this, pInsertBeforeElement, 0);
    this.pNameLabel.SetAutosize(false);
    let rcNLB = this.pNameLabel.GetBounds().$clone();
    rcNLB.Wdt = (this.GetClientRect().Wdt - rcNLB.x | 0) - 2 | 0;
    this.pNameLabel.SetBounds(rcNLB);
    return this;
  }

  AbortRenaming$C4StartupScenSelDlg$ScenListItem$RenameParams(_par) {
    C4StartupScenSelDlg.pInstance.SetRenamingDone();
  }

  *DoRenaming$C4StartupScenSelDlg$ScenListItem$RenameParams$pi8(_par, szNewName) {
    if (!(yield* this.GetEntry().RenameTo(szNewName))) {
      return 0 /*RR_Invalid*/;
    }
    this.pNameLabel.SetText$pi8$b(this.GetEntry().GetName().getData());
    C4StartupScenSelDlg.pInstance.SetRenamingDone();
    C4StartupScenSelDlg.pInstance.ResortFolder();
    C4StartupScenSelDlg.pInstance.UpdateSelection$v();
    C4StartupScenSelDlg.pInstance.FocusScenList();
    return 2 /*RR_Deleted*/;
  }

  KeyRename() {
    C4StartupScenSelDlg.pInstance.StartRenaming(new $.CallbackRenameEdit$ScenListItem$RenameParams().init(this.pNameLabel, this, new C4StartupScenSelDlg$ScenListItem$RenameParams(), "DoRenaming$C4StartupScenSelDlg$ScenListItem$RenameParams$pi8", "AbortRenaming$C4StartupScenSelDlg$ScenListItem$RenameParams"));
    return true;
  }

  UpdateOwnPos() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4StartupScenSelDlg$ScenListItem && C4StartupScenSelDlg$ScenListItem.prototype instanceof $c) return $c.prototype.UpdateOwnPos.apply(this, arguments); }
    let $t1;
    $.Window.prototype.UpdateOwnPos.call(this);
    let caBounds = new $.ComponentAligner().init(this.GetContainedClientRect(), 2, 2);
    $t1 = this.ppAchievements;
    for (let $i1 = 0; $i1 < $t1.length; $i1++) {
      const ppAchievement = P($t1, $i1);
      if (ppAchievement.a[ppAchievement.o] != null) {
        ppAchievement.a[ppAchievement.o].SetBounds(caBounds.GetFromRight$i32$i32(caBounds.GetHeight()));
      }
    }
  }

  MouseInput$rCMouse$i32$i32$i32$u32(rMouse, iButton, iX, iY, dwKeyParam) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4StartupScenSelDlg$ScenListItem && C4StartupScenSelDlg$ScenListItem.prototype instanceof $c) return $c.prototype.MouseInput$rCMouse$i32$i32$i32$u32.apply(this, arguments); }
    $.Window.prototype.MouseInput$rCMouse$i32$i32$i32$u32.call(this, rMouse, iButton, iX, iY, dwKeyParam);
  }

  GetEntry() {
    return this.pScenListEntry;
  }

  GetNext$v() {
    return $.Element.prototype.GetNext$v$c.call(this);
  }

  CheckNameHotkey(c) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4StartupScenSelDlg$ScenListItem && C4StartupScenSelDlg$ScenListItem.prototype instanceof $c) return $c.prototype.CheckNameHotkey.apply(this, arguments); }
    if (this.pScenListEntry == null) {
      return false;
    }
    let szName = this.pScenListEntry.GetName().getData();
    return szName != null && c$toupper(szName.a[szName.o]) === c$toupper(c.a[c.o + 0]);
  }

  $clone() { return new C4StartupScenSelDlg$ScenListItem().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pIcon = o.pIcon;
    this.pNameLabel = o.pNameLabel;
    this.ppAchievements = o.ppAchievements.slice();
    this.pScenListEntry = o.pScenListEntry;
    return this;
  }
}

export class C4StartupScenSelDlg extends C4StartupDlg {
  static pInstance;
  pScenSelCaption = null;
  pScenSelList = null;
  pScenSelProgressLabel = null;
  pScenSelProgressInfoLabel = null;
  pSelectionInfo = null;
  pSelectionOptions = null;
  pKeyRefresh = null;
  pKeyBack = null;
  pKeyForward = null;
  pKeyRename = null;
  pKeyDelete = null;
  pKeyCheat = null;
  pGameOptionButtons = null;
  pOpenBtn = null;
  pScenSelStyleTabular = null;
  searchBar = null;
  pScenLoader = null;
  pMapData = null;
  pfctBackground = null;
  fIsInitialLoading = false;
  fStartNetworkGame = false;
  pRenameEdit = null;
  Achievements = new $.C4ScenarioParameters().init();

  init(fNetwork) {
    super.init($.LoadResStrNoAmp(fNetwork ? S("IDS_DLG_NETSTART") : S("IDS_DLG_STARTGAME")));
    this.pScenLoader = null;
    this.pMapData = null;
    this.pfctBackground = null;
    this.fIsInitialLoading = false;
    this.fStartNetworkGame = fNetwork;
    this.pRenameEdit = null;
    this.Achievements = new $.C4ScenarioParameters().init();
    this.$dyn = C4StartupScenSelDlg;
    C4StartupScenSelDlg.pInstance = this;
    this.UpdateSize();
    const iButtonWidth = [0];
    const iCaptionFontHgt = [0];
    let iButtonHeight = 32;
    let iBookPageWidth = 0;
    let iExtraHPadding = this.rcBounds.Wdt >= 700 ? this.rcBounds.Wdt / 50 | 0 : 0;
    $.GraphicsResource.CaptionFont.GetTextExtent(S("<< BACK"), P(iButtonWidth, 0), P(iCaptionFontHgt, 0), true);
    iButtonWidth[0] = Math.imul(iButtonWidth[0], 3);
    let caMain = new $.ComponentAligner().init(this.GetClientRect(), 0, 0, true);
    let caButtonArea = new $.ComponentAligner().init(caMain.GetFromBottom$i32$i32(caMain.GetHeight() / 8 | 0), this.rcBounds.Wdt / (this.rcBounds.Wdt >= 700 ? 128 : 256) | 0, 0);
    let rcMap = caMain.GetCentered$i32$i32(caMain.GetWidth(), caMain.GetHeight()).$clone();
    this.pScenSelStyleTabular = new $.Tabular().init(rcMap, 0 /*tbNone*/);
    this.pScenSelStyleTabular.SetSheetMargin(0);
    this.pScenSelStyleTabular.SetGfx($.C4Startup.Get().Graphics.fctDlgPaper, $.C4Startup.Get().Graphics.fctOptionsTabClip, $.C4Startup.Get().Graphics.fctOptionsIcons, $.C4Startup.Get().Graphics.BookSmallFont, false);
    $.Container.prototype.AddElement$pElement.call(this, this.pScenSelStyleTabular);
    let pSheetBook = this.pScenSelStyleTabular.AddSheet(null);
    this.pScenSelStyleTabular.AddSheet(null);
    let caBook = new $.ComponentAligner().init(pSheetBook.GetClientRect(), caMain.GetWidth() / 20 | 0, caMain.GetHeight() / 20 | 0, true);
    let caBookLeft = new $.ComponentAligner().init(caBook.GetFromLeft$i32$i32(iBookPageWidth = ((Math.imul(caBook.GetWidth(), 4) / 9 | 0) + 4 | 0) - Math.imul(iExtraHPadding, 2) | 0), 0, 5);
    const rScenSelCaptionFont = $.C4Startup.Get().Graphics.BookFontTitle;
    this.pScenSelCaption = new $.Label().init$pi8$C4Rect$i32$u32$pCStdFont$b$b$b(S(""), caBookLeft.GetFromTop$i32$i32(rScenSelCaptionFont.GetLineHeight()), 1, 0xff000000, rScenSelCaptionFont, false);
    $.Container.prototype.AddElement$pElement.call(pSheetBook, this.pScenSelCaption);
    this.pScenSelCaption.SetToolTip($.LoadResStr(S("IDS_DLGTIP_SELECTSCENARIO")));
    let labelText = $.LoadResStr(S("IDS_DLG_SEARCH"));
    const width = [100];
    const height = [0];
    $.GraphicsResource.TextFont.GetTextExtent(labelText, P(width, 0), P(height, 0), true);
    let caSearchBar = new $.ComponentAligner().init(caBookLeft.GetFromBottom$i32$i32(height[0]), 0, 0);
    let searchLabel = new $.WoodenLabel().init(labelText, caSearchBar.GetFromLeft$i32$i32(width[0] + 10 | 0), 0xffffff00, $.GraphicsResource.TextFont);
    searchLabel.SetToolTip($.LoadResStr(S("IDS_DLGTIP_SEARCHLIST")));
    $.Container.prototype.AddElement$pElement.call(pSheetBook, searchLabel);
    this.searchBar = new $.CallbackEdit$C4StartupScenSelDlg().init(caSearchBar.GetAll$v(), this, "OnSearchBarEnter");
    this.searchBar.SetToolTip($.LoadResStr(S("IDS_DLGTIP_SEARCHLIST")));
    $.Container.prototype.AddElement$pElement.call(pSheetBook, this.searchBar);
    this.pScenSelList = new $.ListBox().init(caBookLeft.GetAll$v());
    this.pScenSelList.SetToolTip($.LoadResStr(S("IDS_DLGTIP_SELECTSCENARIO")));
    this.pScenSelList.SetDecoration$b$pScrollBarFacets$b$b(false, $.C4Startup.Get().Graphics.sfctBookScroll, true);
    $.Container.prototype.AddElement$pElement.call(pSheetBook, this.pScenSelList);
    this.pScenSelList.SetSelectionChangeCallbackFn(new $.CallbackHandler$C4StartupScenSelDlg().init(this, "OnSelChange"));
    this.pScenSelList.SetSelectionDblClickFn(new $.CallbackHandler$C4StartupScenSelDlg().init(this, "OnSelDblClick"));
    this.pScenSelProgressLabel = new $.Label().init$pi8$i32$i32$i32$u32$pCStdFont$b$b(S(""), this.pScenSelList.GetBounds().GetMiddleX(), this.pScenSelList.GetBounds().GetMiddleY() - iCaptionFontHgt[0] | 0, 1, 0xff000000, $.C4Startup.Get().Graphics.BookFontCapt, false);
    $.Container.prototype.AddElement$pElement.call(pSheetBook, this.pScenSelProgressLabel);
    this.pScenSelProgressInfoLabel = new $.Label().init$pi8$i32$i32$i32$u32$pCStdFont$b$b(S(""), this.pScenSelList.GetBounds().GetMiddleX(), this.pScenSelList.GetBounds().GetMiddleY(), 1, 0x7f000000, $.C4Startup.Get().Graphics.BookFontCapt, false);
    $.Container.prototype.AddElement$pElement.call(pSheetBook, this.pScenSelProgressInfoLabel);
    let bounds = caBook.GetFromRight$i32$i32(iBookPageWidth).$clone();
    let AvailWidth = bounds.Wdt;
    let AvailHeight = Math.imul(2, bounds.Hgt) / 5 | 0;
    let PictureWidth = 0;
    let PictureHeight = 0;
    if (Math.imul(AvailWidth, 480) < Math.imul(AvailHeight, 640)) {
      PictureWidth = Math.imul(640, AvailWidth) / 640 | 0;
      PictureHeight = Math.imul(480, AvailWidth) / 640 | 0;
    } else {
      PictureWidth = Math.imul(640, AvailHeight) / 480 | 0;
      PictureHeight = Math.imul(480, AvailHeight) / 480 | 0;
    }
    this.pSelectionInfo = new $.TextWindow().init(bounds, $u64n(PictureWidth + 40 | 0), $u64n(PictureHeight + 40 | 0), 10, 100, 4096, null, true, $.C4Startup.Get().Graphics.fctScenSelTitleOverlay, 20);
    this.pSelectionInfo.SetDecoration$b$b$pScrollBarFacets$b(false, false, $.C4Startup.Get().Graphics.sfctBookScroll, true);
    $.Container.prototype.AddElement$pElement.call(pSheetBook, this.pSelectionInfo);
    this.pSelectionOptions = new $.C4GameOptionsList().init(new $.C4Rect().init$i32$i32$i32$i32(bounds.x, (bounds.y + bounds.Hgt | 0) - 10 | 0, bounds.Wdt, 10), false, fNetwork ? 1 /*GOLS_PreGameNetwork*/ : 0 /*GOLS_PreGameSingle*/);
    this.pSelectionOptions.SetDecoration$b$pScrollBarFacets$b$b(false, $.C4Startup.Get().Graphics.sfctBookScroll, true);
    this.pSelectionOptions.SetVisibility(false);
    $.Container.prototype.AddElement$pElement.call(pSheetBook, this.pSelectionOptions);
    let btn = null;
    $.Container.prototype.AddElement$pElement.call(this, btn = new $.CallbackButton$C4StartupScenSelDlg$Button().init$pi8$rC4Rect$x$pC4StartupScenSelDlg($.LoadResStr(S("IDS_BTN_BACK")), caButtonArea.GetFromLeft$i32$i32(iButtonWidth[0], iButtonHeight), "OnBackBtn"));
    btn.SetToolTip($.LoadResStr(S("IDS_DLGTIP_BACKMAIN")));
    $.Container.prototype.AddElement$pElement.call(this, btn);
    this.pOpenBtn = new $.CallbackButton$C4StartupScenSelDlg$Button().init$pi8$rC4Rect$x$pC4StartupScenSelDlg($.LoadResStr(S("IDS_BTN_OPEN")), caButtonArea.GetFromRight$i32$i32(iButtonWidth[0], iButtonHeight), "OnNextBtn");
    this.pOpenBtn.SetToolTip($.LoadResStr(S("IDS_DLGTIP_SCENSELNEXT")));
    this.pGameOptionButtons = new $.C4GameOptionButtons().init(caButtonArea.GetAll$v(), fNetwork, true, false);
    $.Container.prototype.AddElement$pElement.call(this, this.pGameOptionButtons);
    $.Container.prototype.AddElement$pElement.call(this, this.pOpenBtn);
    this.SetFocus(this.pScenSelList, false);
    this.pKeyBack = new $.C4KeyBinding().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(105), S("StartupScenSelFolderUp"), 2 /*KEYSCOPE_Gui*/, new $.DlgKeyCB$C4StartupScenSelDlg().init(this, "KeyBack"), 4);
    this.pKeyRefresh = new $.C4KeyBinding().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(63), S("StartupScenSelReload"), 2 /*KEYSCOPE_Gui*/, new $.DlgKeyCB$C4StartupScenSelDlg().init(this, "KeyRefresh"), 4);
    this.pKeyForward = new $.C4KeyBinding().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(106), S("StartupScenSelNext"), 2 /*KEYSCOPE_Gui*/, new $.DlgKeyCB$C4StartupScenSelDlg().init(this, "KeyForward"), 4);
    this.pKeyRename = new $.C4KeyBinding().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(60), S("StartupScenSelRename"), 2 /*KEYSCOPE_Gui*/, new $.ControlKeyDlgCB$C4StartupScenSelDlg().init(this.pScenSelList, this, "KeyRename"), 4);
    this.pKeyDelete = new $.C4KeyBinding().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(111), S("StartupScenSelDelete"), 2 /*KEYSCOPE_Gui*/, new $.ControlKeyDlgCB$C4StartupScenSelDlg().init(this.pScenSelList, this, "KeyDelete"), 4);
    this.pKeyCheat = new $.C4KeyBinding().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(50, 2), S("StartupScenSelCheat"), 2 /*KEYSCOPE_Gui*/, new $.ControlKeyDlgCB$C4StartupScenSelDlg().init(this.pScenSelList, this, "KeyCheat"), 4);
    return this;
  }

  $dtor() {
    if (this.pScenLoader != null) {
      $delete(this.pScenLoader);
    }
    if (this === C4StartupScenSelDlg.pInstance) {
      C4StartupScenSelDlg.pInstance = null;
    }
    $delete(this.pKeyCheat);
    $delete(this.pKeyDelete);
    $delete(this.pKeyRename);
    $delete(this.pKeyForward);
    $delete(this.pKeyRefresh);
    $delete(this.pKeyBack);
    super.$dtor();
  }

  GetMarginTop() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4StartupScenSelDlg && C4StartupScenSelDlg.prototype instanceof $c) return $c.prototype.GetMarginTop.apply(this, arguments); }
    return this.rcBounds.Hgt / 7 | 0;
  }

  HasBackground() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4StartupScenSelDlg && C4StartupScenSelDlg.prototype instanceof $c) return $c.prototype.HasBackground.apply(this, arguments); }
    return false;
  }

  DrawElement(cgo) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4StartupScenSelDlg && C4StartupScenSelDlg.prototype instanceof $c) return $c.prototype.DrawElement.apply(this, arguments); }
    if (this.pfctBackground != null) {
      this.DrawBackground(cgo, this.pfctBackground);
    }
  }

  *OnEnter() {
    (yield* this.DoOK());
    return true;
  }

  OnEscape() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4StartupScenSelDlg && C4StartupScenSelDlg.prototype instanceof $c) return $c.prototype.OnEscape.apply(this, arguments); }
    this.DoBack$b(true);
    return true;
  }

  KeyBack() {
    return this.DoBack$b(true);
  }

  KeyRefresh() {
    this.DoRefresh();
    return true;
  }

  *KeyForward() {
    (yield* this.DoOK());
    return true;
  }

  KeyRename() {
    if (this.pMapData != null) {
      return false;
    }
    if (this.IsRenaming()) {
      return false;
    }
    let pSel = this.GetSelectedItem();
    if (pSel == null) {
      return false;
    }
    return pSel.KeyRename();
  }

  KeyDelete() {
    if (this.pMapData != null) {
      return false;
    }
    this.AbortRenaming$v();
    let pSel = this.GetSelectedItem();
    if (pSel == null) {
      return false;
    }
    let pEnt = pSel.GetEntry();
    let sWarning = new $.StdStrBuf();
    sWarning.Format($.LoadResStr(S("IDS_MSG_PROMPTDELETE")), $.FormatString(S("%s %s"), pEnt.GetTypeName().getData(), pEnt.GetName().getData()).getData(), pEnt.GetEntryFilename().getData());
    this.GetScreen().ShowRemoveDlg(new $.ConfirmationDialog().init(sWarning.getData(), $.LoadResStr(S("IDS_MNU_DELETE")), new $.CallbackHandlerExPar$C4StartupScenSelDlg$pScenListItem().init(this, "DeleteConfirm", pSel), 12));
    return true;
  }

  KeyCheat() {
    return $.pGUI.ShowRemoveDlg(new $.InputDialog().init($.LoadResStr(S("IDS_TEXT_ENTERMISSIONPASSWORD")), $.LoadResStr(S("IDS_DLG_MISSIONACCESS")), 14 /*Ico_Options*/, new $.InputCallback$C4StartupScenSelDlg().init(this, "KeyCheat2"), false));
  }

  KeyCheat2(rsCheatCode) {
    if ($.SEqual2(rsCheatCode.getData(), S("-"))) {
      let szPass = rsCheatCode.getPtr(1);
      if (szPass != null && szPass.a[szPass.o] !== 0) {
        $.SRemoveModules(P($.Config.General.MissionAccess, 0), szPass, false);
        this.UpdateList$v();
        this.UpdateSelection$v();
        return;
      }
    }
    let szPass = rsCheatCode.getPtr(0);
    if (szPass != null && szPass.a[szPass.o] !== 0) {
      $.SAddModules(P($.Config.General.MissionAccess, 0), szPass, false);
      this.UpdateList$v();
      this.UpdateSelection$v();
      return;
    }
  }

  *DeleteConfirm(pSel) {
    let pEnt = pSel.GetEntry();
    if (!$.C4Group_DeleteItem(pEnt.GetEntryFilename().getData(), true)) {
      let sMsg = new $.StdStrBuf();
      sMsg.Format(S("%s"), $.LoadResStr(S("IDS_FAIL_DELETE")));
      (yield* $.pGUI.ShowMessageModal(sMsg.getData(), $.LoadResStr(S("IDS_MNU_DELETE")), 1, 11 /*Ico_Error*/));
      return;
    }
    this.pScenSelList.SelectEntry(pSel.GetNext$v(), false);
    $delete(pEnt);
    $delete(pSel);
  }

  OnShown$v() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4StartupScenSelDlg && C4StartupScenSelDlg.prototype instanceof $c) return $c.prototype.OnShown$v.apply(this, arguments); }
    $spawn($.Dialog.prototype.OnShown$v.call(this));
    this.UpdateAchievements();
    this.fIsInitialLoading = true;
    if (this.pScenLoader == null) {
      this.pScenLoader = new C4ScenarioListLoader().init(this.Achievements);
    }
    this.pScenLoader.Load$StdStrBuf(new $.StdStrBuf());
    this.UpdateList$v();
    this.UpdateSelection$v();
    this.fIsInitialLoading = false;
    $.Game.NetworkActive = this.fStartNetworkGame;
  }

  OnClosed(fOK) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4StartupScenSelDlg && C4StartupScenSelDlg.prototype instanceof $c) return $c.prototype.OnClosed.apply(this, arguments); }
    this.AbortRenaming$v();
    if (this.pScenLoader != null) {
      $delete(this.pScenLoader);
      this.pScenLoader = null;
      this.UpdateList$v();
      this.UpdateSelection$v();
    }
    if (!fOK) {
      $.Network.SetPassword(null);
      $.C4Startup.Get().SwitchDialog(9 /*SDID_Back*/);
    }
  }

  OnBackBtn(_btn) {
    this.DoBack$b(true);
  }

  *OnNextBtn(_btn) {
    (yield* this.DoOK());
  }

  OnSelChange(_pEl) {
    this.UpdateSelection$v();
  }

  *OnSelDblClick(_pEl) {
    (yield* this.DoOK());
  }

  *OnButtonScenario(pEl) {
    if (this.pMapData == null || pEl == null) {
      return;
    }
    let pSel = this.GetSelectedEntry();
    let pSel2 = null;
    this.pMapData.OnButtonScenario(pEl);
    pSel2 = this.GetSelectedEntry();
    if (pSel != null && pSel === pSel2) {
      (yield* this.DoOK());
      return;
    }
    this.SetFocus(pEl, false);
    this.UpdateSelection$v();
  }

  OnSearchBarEnter(_edt, _fPasting, _fPastingMore) {
    this.UpdateList$v();
    return 3 /*IR_Abort*/;
  }

  OnLeagueOptionChanged() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4StartupScenSelDlg && C4StartupScenSelDlg.prototype instanceof $c) return $c.prototype.OnLeagueOptionChanged.apply(this, arguments); }
    if (this.pSelectionOptions != null) {
      this.pSelectionOptions.Update$v();
    }
  }

  UpdateList$v() {
    this.AbortRenaming$v();
    this.pMapData = null;
    this.pScenSelStyleTabular.SelectSheet$i32$b(0, false);
    let pMapSheet = this.pScenSelStyleTabular.GetSheet(1);
    while ($.Container.prototype.GetFirst.call(pMapSheet) != null) {
      $delete($.Container.prototype.GetFirst.call(pMapSheet));
    }
    this.pfctBackground = null;
    let pOldSelection = this.GetSelectedEntry();
    let pEl = null;
    while ((pEl = this.pScenSelList.GetFirst()) != null) {
      $delete(pEl);
    }
    this.pScenSelCaption.SetText$pi8$b(S(""));
    if (this.pScenLoader == null) {
      return;
    }
    if (this.pScenLoader.IsLoading()) {
      let sProgressText = new $.StdStrBuf();
      sProgressText.Format($.LoadResStr(S("IDS_MSG_SCENARIODESC_LOADING")), this.pScenLoader.GetProgressPercent());
      this.pScenSelProgressLabel.SetText$pi8$b(sProgressText.getData());
      this.pScenSelProgressLabel.SetVisibility(true);
      this.pScenSelProgressInfoLabel.SetText$pi8$b(this.pScenLoader.GetProgressInfo());
      this.pScenSelProgressInfoLabel.SetVisibility(true);
      return;
    }
    this.pScenSelProgressLabel.SetVisibility(false);
    this.pScenSelProgressInfoLabel.SetVisibility(false);
    let pFolder = this.pScenLoader.GetCurrFolder();
    if ((this.pMapData = pFolder.GetMapData()) != null) {
      this.pMapData.ResetSelection();
      this.pMapData.CreateGUIElements(this, this.pScenSelStyleTabular.GetSheet(1));
      this.pScenSelStyleTabular.SelectSheet$i32$b(1, false);
    } else {
      for (let pEnt = this.pScenLoader.GetFirstEntry(); pEnt != null; pEnt = pEnt.GetNext()) {
        if (pEnt.IsHidden()) {
          continue;
        }
        if (!($.SLen(this.searchBar.GetText$v()) !== 0) || $.SSearchNoCase(pEnt.GetName().getData(), this.searchBar.GetText$v()) != null) {
          let pEntItem = new C4StartupScenSelDlg$ScenListItem().init(this.pScenSelList, pEnt);
          if (pEnt === pOldSelection) {
            this.pScenSelList.SelectEntry(pEntItem, false);
          }
        } else if (pEnt === pOldSelection) {
          pOldSelection = null;
        }
      }
      if (pFolder != null && pFolder !== this.pScenLoader.GetRootFolder()) {
        this.pScenSelCaption.SetText$pi8$b(pFolder.GetName().getData());
      } else {
        this.pScenSelCaption.SetText$pi8$b($.LoadResStr(S("IDS_DLG_SCENARIOS")));
      }
      if (pOldSelection == null) {
        this.pScenSelList.SelectFirstEntry(false);
      }
    }
  }

  UpdateSelection$v() {
    this.AbortRenaming$v();
    if (this.pScenLoader == null) {
      let fctNoPic = new $.C4Facet().init$v();
      this.pSelectionInfo.SetPicture(fctNoPic);
      this.pSelectionInfo.ClearText$b(false);
      this.SetOpenButtonDefaultText();
      return;
    }
    let pSelectionInfo = this.pMapData != null ? this.pMapData.GetSelectionInfoBox() : this.pSelectionInfo;
    let pSel = this.GetSelectedEntry();
    if (pSel == null) {
      pSel = this.pScenLoader.GetCurrFolder();
      if (pSel === this.pScenLoader.GetRootFolder()) {
        pSel = null;
      }
    }
    let fctTitle = new $.C4Facet().init$v();
    let sTitle = new $.StdStrBuf();
    let sDesc = new $.StdStrBuf();
    let sVersion = new $.StdStrBuf();
    let sAuthor = new $.StdStrBuf();
    if (pSel != null) {
      this.pScenLoader.LoadExtended(pSel);
      fctTitle.$assign(pSel.GetTitlePicture());
      sTitle.Ref$StdStrBuf(pSel.GetName());
      sDesc.Ref$StdStrBuf(pSel.GetDesc());
      sVersion.Ref$StdStrBuf(pSel.GetVersion());
      sAuthor.Ref$StdStrBuf(pSel.GetAuthor());
      if (fctTitle.Surface == null && (sDesc.op_not() || !($rd(sDesc.getData()) !== 0))) {
        sTitle.Clear();
      }
      this.pOpenBtn.SetText$pi8(pSel.GetOpenText().getData());
      this.pOpenBtn.SetToolTip(pSel.GetOpenTooltip().getData());
    } else {
      this.SetOpenButtonDefaultText();
    }
    pSelectionInfo.ClearText$b(false);
    pSelectionInfo.SetPicture(fctTitle);
    if (sTitle.op_const_void_() != null && (sDesc.op_not() || !($rd(sDesc.getData()) !== 0))) {
      pSelectionInfo.AddTextLine$pi8$pCStdFont$u32$b$b$pCStdFont(sTitle.getData(), $.C4Startup.Get().Graphics.BookFontCapt, 0xff000000, false, false);
    }
    if (sDesc.op_const_void_() != null) {
      pSelectionInfo.AddTextLine$pi8$pCStdFont$u32$b$b$pCStdFont(sDesc.getData(), $.C4Startup.Get().Graphics.BookFont, 0xff000000, false, false, $.C4Startup.Get().Graphics.BookFontCapt);
    }
    if (sAuthor.op_const_void_() != null) {
      pSelectionInfo.AddTextLine$pi8$pCStdFont$u32$b$b$pCStdFont($.FormatString($.LoadResStr(S("IDS_CTL_AUTHOR")), sAuthor.getData()).getData(), $.C4Startup.Get().Graphics.BookFont, 0x7f000000, false, false);
    }
    if (sVersion.op_const_void_() != null) {
      pSelectionInfo.AddTextLine$pi8$pCStdFont$u32$b$b$pCStdFont($.FormatString($.LoadResStr(S("IDS_DLG_VERSION")), sVersion.getData()).getData(), $.C4Startup.Get().Graphics.BookFont, 0x7f000000, false, false);
    }
    if (pSel != null) {
      this.pSelectionOptions.SetParameters(pSel.GetParameterDefs(), pSel.GetParameters());
      this.pSelectionOptions.Update$v();
    } else {
      this.pSelectionOptions.SetParameters(null, null);
    }
    let rcSelBounds = pSelectionInfo.GetBounds().$clone();
    let ymax = this.pSelectionOptions.GetBounds().GetBottom$v$c();
    let pLastOption = this.pSelectionOptions.GetLast();
    if (pLastOption != null) {
      let options_hgt = $min((pLastOption.GetBounds().GetBottom$v$c() + this.pSelectionOptions.GetMarginTop() | 0) + this.pSelectionOptions.GetMarginTop() | 0, rcSelBounds.Hgt / 3 | 0);
      rcSelBounds.Hgt = (ymax - options_hgt | 0) - rcSelBounds.y | 0;
      pSelectionInfo.SetBounds(rcSelBounds);
      rcSelBounds.y = ymax - options_hgt | 0;
      rcSelBounds.Hgt = options_hgt;
      this.pSelectionOptions.SetBounds(rcSelBounds);
      this.pSelectionOptions.SetVisibility(true);
    } else {
      this.pSelectionOptions.SetVisibility(false);
      rcSelBounds.Hgt = ymax - rcSelBounds.y | 0;
      pSelectionInfo.SetBounds(rcSelBounds);
    }
    pSelectionInfo.UpdateHeight();
  }

  ResortFolder() {
    if (this.pScenLoader == null || this.pScenLoader.IsLoading()) {
      return;
    }
    let pFolder = this.pScenLoader.GetCurrFolder();
    if (pFolder == null) {
      return;
    }
    pFolder.Resort();
    this.UpdateList$v();
  }

  GetSelectedItem() {
    return this.pScenSelList.GetSelectedItem();
  }

  GetSelectedEntry() {
    if (this.pMapData != null) {
      return this.pMapData.GetSelectedEntry();
    }
    let pSel = this.pScenSelList.GetSelectedItem();
    return pSel != null ? pSel.GetEntry() : null;
  }

  SetOpenButtonDefaultText() {
    this.pOpenBtn.SetText$pi8($.LoadResStr(S("IDS_BTN_OPEN")));
    this.pOpenBtn.SetToolTip($.LoadResStr(S("IDS_DLGTIP_SCENSELNEXT")));
  }

  FocusScenList() {
    this.SetFocus(this.pScenSelList, false);
  }

  UpdateAchievements() {
    this.Achievements.Clear();
    const PlayerFilename = new Int8Array(256);
    let PlayerGrp = new $.C4Group().init();
    for (let i = 0; $.SCopySegment(P($.Config.General.Participants, 0), i, P(PlayerFilename, 0), 59, 255, true); i = i + 1 | 0) {
      let szPlayerFilename = $.Config.AtUserDataPath(P(PlayerFilename, 0));
      if (!$.FileExists(szPlayerFilename)) {
        continue;
      }
      if (!PlayerGrp.Open(szPlayerFilename)) {
        continue;
      }
      let nfo = new $.C4PlayerInfoCore().init();
      if (!nfo.Load$rC4Group(PlayerGrp)) {
        continue;
      }
      this.Achievements.Merge(nfo.Achievements);
    }
  }

  *StartScenario(pStartScen) {
    0;
    if (pStartScen == null) {
      return false;
    }
    if (pStartScen.GetC4S().Definitions.AllowUserChange) {
      let sDefinitions = new $.StdStrBuf();
      if (!pStartScen.GetC4S().Definitions.GetModules(sDefinitions)) {
        sDefinitions.Copy$pi8(S("Objects.ocd"));
      }
      if (!(yield* $.C4DefinitionSelDlg.SelectDefinitions(this.GetScreen(), sDefinitions))) {
        return false;
      }
      $.SCopy$pi8$pi8$u64(sDefinitions.getData(), P($.Game.DefinitionFilenames, 0), 81920);
    } else {
      $.SCopy$pi8$pi8(S("Objects.ocd"), P($.Game.DefinitionFilenames, 0));
    }
    $.Game.fLobby = !!$.Game.NetworkActive;
    $.Game.fObserve = false;
    let custom_params = pStartScen.GetParameters();
    if (custom_params != null) {
      $.Game.StartupScenarioParameters.$assign(custom_params);
    } else {
      $.Game.StartupScenarioParameters.Clear();
    }
    $.Application.OpenGame(pStartScen.GetEntryFilename().getData());
    return true;
  }

  OpenFolder(pNewFolder) {
    if (this.pScenLoader == null) {
      return false;
    }
    this.searchBar.ClearText$v();
    let fSuccess = this.pScenLoader.Load$pFolder$b(pNewFolder, false);
    this.UpdateList$v();
    this.UpdateSelection$v();
    if (this.pMapData == null) {
      this.SetFocus(this.pScenSelList, false);
    }
    return fSuccess;
  }

  ProcessCallback$v() {
    this.UpdateList$v();
  }

  *DoOK() {
    this.AbortRenaming$v();
    let pSel = this.GetSelectedEntry();
    if (pSel == null) {
      return false;
    }
    let sError = new $.StdStrBuf();
    const CanHide = [false];
    if (!pSel.CanOpen(sError, P(CanHide, 0))) {
      this.GetScreen().ShowMessage(sError.getData(), $.LoadResStr(S("IDS_MSG_CANNOTSTARTSCENARIO")), 11 /*Ico_Error*/);
      return false;
    }
    if (sError.getLength() !== 0) {
      if (!(yield* this.GetScreen().ShowMessageModal(sError.getData(), $.LoadResStrNoAmp(S("IDS_DLG_STARTGAME")), 3, 1 /*Ico_Notify*/, CanHide[0] ? P($.Config.Startup, "HideMsgStartDedicated") : null))) {
        return false;
      }
    }
    return (yield* $co(pSel.Start()));
  }

  DoBack$b(fAllowClose) {
    this.AbortRenaming$v();
    if (this.pScenLoader != null && this.pScenLoader.FolderBack()) {
      this.searchBar.ClearText$v();
      this.UpdateList$v();
      this.UpdateSelection$v();
      return true;
    }
    if (this.pScenLoader != null && this.pScenLoader.IsLoading()) {
      return false;
    }
    if (fAllowClose) {
      this.Close$b(false);
      return true;
    }
    return false;
  }

  DoRefresh() {
    if (this.pScenLoader != null && !this.pScenLoader.IsLoading()) {
      this.pScenSelList.SelectNone(false);
      this.pScenLoader.ReloadCurrent();
      this.UpdateList$v();
      this.UpdateSelection$v();
    }
  }

  DeselectAll() {
    if (this.GetFocus() != null) {
      $.GUISound(S("UI::Tick"));
    }
    this.SetFocus(null, true);
    if (this.pMapData != null) {
      this.pMapData.ResetSelection();
    }
    this.UpdateSelection$v();
  }

  StartRenaming(pNewRenameEdit) {
    this.pRenameEdit = pNewRenameEdit;
  }

  AbortRenaming$v() {
    if (this.pRenameEdit != null) {
      this.pRenameEdit.Abort$v();
    }
  }

  IsRenaming() {
    return !(this.pRenameEdit == null);
  }

  SetRenamingDone() {
    this.pRenameEdit = null;
  }

  SetBackground(pNewBG) {
    this.pfctBackground = pNewBG;
  }

  IsNetworkStart() {
    return this.fStartNetworkGame;
  }

  $clone() { return new C4StartupScenSelDlg().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pScenSelCaption = o.pScenSelCaption;
    this.pScenSelList = o.pScenSelList;
    this.pScenSelProgressLabel = o.pScenSelProgressLabel;
    this.pScenSelProgressInfoLabel = o.pScenSelProgressInfoLabel;
    this.pSelectionInfo = o.pSelectionInfo;
    this.pSelectionOptions = o.pSelectionOptions;
    this.pKeyRefresh = o.pKeyRefresh;
    this.pKeyBack = o.pKeyBack;
    this.pKeyForward = o.pKeyForward;
    this.pKeyRename = o.pKeyRename;
    this.pKeyDelete = o.pKeyDelete;
    this.pKeyCheat = o.pKeyCheat;
    this.pGameOptionButtons = o.pGameOptionButtons;
    this.pOpenBtn = o.pOpenBtn;
    this.pScenSelStyleTabular = o.pScenSelStyleTabular;
    this.searchBar = o.searchBar;
    this.pScenLoader = o.pScenLoader;
    this.pMapData = o.pMapData;
    this.pfctBackground = o.pfctBackground;
    this.fIsInitialLoading = o.fIsInitialLoading;
    this.fStartNetworkGame = o.fStartNetworkGame;
    this.pRenameEdit = o.pRenameEdit;
    this.Achievements.$assign(o.Achievements);
    return this;
  }
}












export function DirContainsScenarios(szDir) {
  if ($.WildcardMatch(S("*.ocd"), szDir) || $.WildcardMatch(S("*.ocg"), szDir)) {
    return false;
  }
  let pIter = new $.DirectoryIterator().init$pi8(szDir);
  let szChildFilename = null;
  for (; (szChildFilename = pIter.op_mul()) != null; pIter.op_inc$v()) {
    if ($.C4Group_TestIgnore(szChildFilename)) {
      continue;
    }
    if ($.WildcardMatch(S("*.ocs"), szChildFilename) || $.WildcardMatch(S("*.ocf"), szChildFilename)) {
      break;
    }
    if ($.DirectoryExists(szChildFilename)) {
      if (DirContainsScenarios(szChildFilename)) {
        break;
      }
    }
  }
  $delete(pIter);
  return !(szChildFilename == null);
}

export function EntrySortFunc(pEl1, pEl2) {
  let pEntry1 = pEl1.a[pEl1.o];
  let pEntry2 = pEl2.a[pEl2.o];
  let fS1 = !(pEntry1.GetIsFolder() != null);
  let fS2 = !(pEntry2.GetIsFolder() != null);
  if ((fS1 ? 1 : 0) !== (fS2 ? 1 : 0)) {
    return (fS1 ? 1 : 0) - (fS2 ? 1 : 0) | 0;
  }
  if ($.Config.Startup.AlphabeticalSorting === 0) {
    if (pEntry1.GetFolderIndex() !== 0 || pEntry2.GetFolderIndex() !== 0) {
      if (!(pEntry1.GetFolderIndex() !== 0)) {
        return 1;
      }
      if (!(pEntry2.GetFolderIndex() !== 0)) {
        return -1;
      }
      let iDiff = pEntry1.GetFolderIndex() - pEntry2.GetFolderIndex() | 0;
      if (iDiff !== 0) {
        return iDiff;
      }
    }
  }
  if ($.Inside$i32$i32$i32$3(pEntry1.GetIconIndex(), 2, 11)) {
    let iDiff = pEntry1.GetIconIndex() - pEntry2.GetIconIndex() | 0;
    if (iDiff !== 0) {
      return iDiff;
    }
  }
  if ($.Config.Startup.AlphabeticalSorting === 0) {
    if (pEntry1.GetDifficulty() !== 0 || pEntry2.GetDifficulty() !== 0) {
      if (!(pEntry1.GetDifficulty() !== 0)) {
        return 1;
      }
      if (!(pEntry2.GetDifficulty() !== 0)) {
        return -1;
      }
      let iDiff = pEntry1.GetDifficulty() - pEntry2.GetDifficulty() | 0;
      if (iDiff !== 0) {
        return iDiff;
      }
    }
  }
  return $.stricmp(pEntry1.GetName().getData(), pEntry2.GetName().getData());
}




export function $init(): void {
  C4StartupScenSelDlg.pInstance = null;
  $.C4StartupScenSel_DefaultIcon_Scenario$C4StartupScenSelDlg = 14;
  $.C4StartupScenSel_DefaultIcon_Folder$C4StartupScenSelDlg = 0;
  $.C4StartupScenSel_DefaultIcon_SavegamesFolder$C4StartupScenSelDlg = 29;
  $.C4StartupScenSel_DefaultIcon_WinFolder$C4StartupScenSelDlg = 44;
  $.C4StartupScenSel_DefaultIcon_OldIconBG$C4StartupScenSelDlg = 18;
  $.C4StartupScenSel_IconCount$C4StartupScenSelDlg = 45;
  $.C4StartupScenSel_TitlePictureWdt$C4StartupScenSelDlg = 640;
  $.C4StartupScenSel_TitlePictureHgt$C4StartupScenSelDlg = 480;
  $.C4StartupScenSel_TitlePicturePadding$C4StartupScenSelDlg = 10;
  $.C4StartupScenSel_TitleOverlayMargin$C4StartupScenSelDlg = 20;
  $.C4StartupScenSel_MaxAchievements$C4StartupScenSelDlg = 3;
  $.ClrScenarioItem$C4StartupScenSelDlg = 0xff000000;
  $.ClrScenarioItemXtra$C4StartupScenSelDlg = 0x7f000000;
  $.ClrScenarioItemDisabled$C4StartupScenSelDlg = 0x7f000000;
}

Object.assign($, { C4MapFolderData, C4MapFolderData$AccessGfx, C4MapFolderData$MapPic, C4MapFolderData$Scenario, C4ScenarioListLoader, C4ScenarioListLoader$Entry, C4ScenarioListLoader$Folder, C4ScenarioListLoader$RegularFolder, C4ScenarioListLoader$Scenario, C4ScenarioListLoader$SubFolder, C4StartupScenSelDlg, C4StartupScenSelDlg$ScenListItem, C4StartupScenSelDlg$ScenListItem$RenameParams, DirContainsScenarios, EntrySortFunc });
