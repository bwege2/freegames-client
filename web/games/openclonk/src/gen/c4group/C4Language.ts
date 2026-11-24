// @ts-nocheck
// OpenClonk 36de799: src/c4group/C4Language.cpp, src/c4group/C4Language.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { c$strncpy } from '../../rt/libc.ts';
import { GetResStr } from '../../rt/native.ts';
import { $padd, $peq, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete, StdString } from '../../rt/std.ts';

export class C4LanguageInfo {
  Code = new Int8Array(3);
  Name = new Int8Array(1025);
  Info = new Int8Array(1025);
  Fallback = new Int8Array(1025);
  Next = null;

  $clone() { return new C4LanguageInfo().$assign(this); }
  $assign(o) {
    this.Code = o.Code.slice();
    this.Name = o.Name.slice();
    this.Info = o.Info.slice();
    this.Fallback = o.Fallback.slice();
    this.Next = o.Next;
    return this;
  }
}

export class C4Language {
  PackDirectory = new $.C4Group().init();
  Packs = new $.C4GroupSet().init();
  PackGroups = new $.C4GroupSet().init();
  Infos = null;
  PackGroupLocation = new Int8Array(256);

  init() {
    this.PackDirectory = new $.C4Group().init();
    this.Packs = new $.C4GroupSet().init();
    this.PackGroups = new $.C4GroupSet().init();
    this.Infos = null;
    this.PackGroupLocation[0] = 0;
    return this;
  }

  $dtor() {
    C4Language.prototype.Clear.call(this);
  }

  CloseGroup(strPath) {
    let pPack = null;
    for (let iPack = 0; (pPack = this.Packs.GetGroup(iPack)) != null; iPack = iPack + 1 | 0) {
      if ($.ItemIdentical(strPath, pPack.GetFullName().getData())) {
        this.Packs.UnregisterGroup(iPack);
        return true;
      }
    }
    return false;
  }

  ClearLanguage() {
    $.C4ComponentHost.prototype.Clear.call($.C4LangStringTable.GetSystemStringTable());
  }

  Init() {
    this.Clear();
    let langPath = new $.StdStrBuf();
    let iter = new $.C4Reloc$const_iterator().init();
    for (iter.$assign($.Reloc.begin()); $.op_ne$C4Reloc$const_iterator$C4Reloc$const_iterator(iter, $.Reloc.end()); iter.op_inc()) {
      langPath.Copy$StdStrBuf(iter.op_arrow().strBuf.op_add$pi8(S("/")).op_add$pi8(S("Language.ocg")));
      if ($.ItemExists(langPath.getData())) {
        if ($.DirectoryExists(langPath.getData())) {
          break;
        }
        if ($.C4Group_UnpackDirectory(langPath.getData())) {
          break;
        }
      }
    }
    if ($.op_ne$C4Reloc$const_iterator$C4Reloc$const_iterator(iter, $.Reloc.end())) {
      let pPack = null;
      const strPackFilename = new Int8Array(256);
      const strEntry = new Int8Array(256);
      if (this.PackDirectory.Open(langPath.getData())) {
        while (this.PackDirectory.FindNextEntry$pi8$pi8$pu64$b(S("*.ocg"), P(strEntry, 0))) {
          $.ssprintf$10(strPackFilename, S("%s/%s"), S("Language.ocg"), P(strEntry, 0));
          pPack = new $.C4Group().init();
          if (pPack.Open(P(strPackFilename, 0))) {
            this.Packs.RegisterGroup(pPack, true, 64, 0);
          } else {
            $delete(pPack);
          }
        }
      }
      for (let iPack = 0; (pPack = this.Packs.GetGroup(iPack)) != null; iPack = iPack + 1 | 0) {
        this.PackGroups.RegisterGroup(new $.C4Group().init(), true, 0, 64);
      }
    }
    this.InitInfos();
    return true;
  }

  Clear() {
    this.PackGroups.Clear();
    this.Packs.Clear();
    this.PackDirectory.Close$v();
    let pNext = null;
    while (this.Infos != null) {
      pNext = this.Infos.Next;
      $delete(this.Infos);
      this.Infos = pNext;
    }
    this.Infos = null;
  }

  GetPackCount() {
    return this.Packs.GetGroupCount();
  }

  GetPackGroups(hGroup) {
    const strRelativePath = new Int8Array(4097);
    const strTargetLocation = new Int8Array(4097);
    const strPackPath = new Int8Array(4097);
    const strPackGroupLocation = new Int8Array(4097);
    const strAdvance = new Int8Array(4097);
    $.SCopy$pi8$pi8$u64($.Config.AtRelativePath(hGroup.GetFullName().getData()), P(strRelativePath, 0), 4096);
    $.SCopy$pi8$pi8$u64(P(strRelativePath, 0), P(strTargetLocation, 0), 4096);
    if ($.Game.C4S.Head.Origin.getLength() !== 0 && $.SEqualNoCase($.GetExtension($.Game.C4S.Head.Origin.getData()), S("ocs"))) {
      let szScenarioRelativePath = $.GetRelativePathS(P(strRelativePath, 0), $.Config.AtRelativePath(P($.Game.ScenarioFilename, 0)));
      if (!$peq(szScenarioRelativePath, P(strRelativePath, 0))) {
        let iRestPathLen = $.SLen(szScenarioRelativePath);
        if ($.Game.C4S.Head.Origin.getLength() + 1 + iRestPathLen <= 4096) {
          $.SCopy$pi8$pi8($.Game.C4S.Head.Origin.getData(), P(strTargetLocation, 0));
          if (iRestPathLen !== 0) {
            $.SAppendChar(47, P(strTargetLocation, 0));
            $.SAppend(szScenarioRelativePath, P(strTargetLocation, 0));
          }
        }
      }
    }
    let pPack = null;
    let pPackGroup = null;
    for (let iPack = 0; (pPack = this.Packs.GetGroup(iPack)) != null && (pPackGroup = this.PackGroups.GetGroup(iPack)) != null; iPack = iPack + 1 | 0) {
      $.SCopy$pi8$pi8$u64(pPack.GetFullName().getData(), P(strPackPath, 0), 4096);
      GetRelativePath(pPackGroup.GetFullName().getData(), P(strPackPath, 0), strPackGroupLocation);
      if ($.SEqualNoCase(P(strPackGroupLocation, 0), P(strTargetLocation, 0))) {
        continue;
      }
      while (strPackGroupLocation[0] !== 0 && !GetRelativePath(P(strTargetLocation, 0), P(strPackGroupLocation, 0), strAdvance) && pPackGroup.OpenMother()) {
        GetRelativePath(pPackGroup.GetFullName().getData(), P(strPackPath, 0), strPackGroupLocation);
      }
      if (strPackGroupLocation[0] !== 0 && GetRelativePath(P(strTargetLocation, 0), P(strPackGroupLocation, 0), strAdvance)) {
        pPackGroup.OpenChild(P(strAdvance, 0));
      } else {
        pPackGroup.Close$v();
        pPackGroup.OpenAsChild(pPack, P(strTargetLocation, 0));
      }
    }
    $.SCopy$pi8$pi8$u64(P(strTargetLocation, 0), P(this.PackGroupLocation, 0), 255);
    let r = new $.C4GroupSet().init();
    r.RegisterGroup(hGroup, false, 1000, 128);
    r.RegisterGroups(this.PackGroups, 64);
    return r;
  }

  static LoadComponentHost(host, hGroup, szFilename, szLanguage) {
    0;
    if (host == null) {
      return false;
    }
    let hGroups = $.Languages.GetPackGroups(hGroup);
    return host.Load$rC4GroupSet$pi8$pi8(hGroups, szFilename, szLanguage);
  }

  GetInfoCount() {
    let iCount = 0;
    for (let pInfo = this.Infos; pInfo != null; pInfo = pInfo.Next) {
      iCount = iCount + 1 | 0;
    }
    return iCount;
  }

  GetInfo(iIndex) {
    for (let pInfo = this.Infos; pInfo != null; pInfo = pInfo.Next) {
      if (iIndex <= 0) {
        return pInfo;
      } else {
        iIndex = iIndex - 1 | 0;
      }
    }
    return null;
  }

  FindInfo(strCode) {
    for (let pInfo = this.Infos; pInfo != null; pInfo = pInfo.Next) {
      if ($.SEqualNoCase(P(pInfo.Code, 0), strCode, 2)) {
        return pInfo;
      }
    }
    return null;
  }

  LoadLanguage(strLanguages) {
    this.ClearLanguage();
    const strLanguageCode = new Int8Array(3);
    for (let i = 0; $.SCopySegment(strLanguages, i, P(strLanguageCode, 0), 44, 2, true); i = i + 1 | 0) {
      if (this.InitStringTable(P(strLanguageCode, 0))) {
        return true;
      }
    }
    if (this.InitStringTable(S("US"))) {
      return true;
    }
    $.Log(S("Error loading language string table."));
    return false;
  }

  HasStringTable() {
    return !$.C4LangStringTable.GetSystemStringTable().GetDataBuf().isNull();
  }

  InitInfos() {
    let hGroup = new $.C4Group().init();
    if ($.Reloc.Open(hGroup, S("System.ocg"))) {
      this.LoadInfos(hGroup);
      hGroup.Close$v();
    }
    let pPack = null;
    for (let iPack = 0; (pPack = this.Packs.GetGroup(iPack)) != null; iPack = iPack + 1 | 0) {
      if (hGroup.OpenAsChild(pPack, S("System.ocg"))) {
        this.LoadInfos(hGroup);
        hGroup.Close$v();
      }
    }
  }

  LoadInfos(hGroup) {
    const strEntry = new Int8Array(256);
    const strTable = [null];
    hGroup.ResetSearch();
    while (hGroup.FindNextEntry$pi8$pi8$pu64$b(S("Language*.txt"), P(strEntry, 0))) {
      if (!(this.FindInfo($padd($padd($.GetFilenameOnly(P(strEntry, 0)), $.SLen($.GetFilenameOnly(P(strEntry, 0)))), -2)) != null)) {
        if (hGroup.LoadEntry$pi8$ppi8$pu64$i32(P(strEntry, 0), P(strTable, 0), null, 1)) {
          let pInfo = new C4LanguageInfo();
          $.SCopy$pi8$pi8$u64($padd($padd($.GetFilenameOnly(P(strEntry, 0)), $.SLen($.GetFilenameOnly(P(strEntry, 0)))), -2), P(pInfo.Code, 0), 2);
          $.SCapitalize(P(pInfo.Code, 0));
          CopyResStr(S("IDS_LANG_NAME"), strTable[0], pInfo.Name);
          CopyResStr(S("IDS_LANG_INFO"), strTable[0], pInfo.Info);
          CopyResStr(S("IDS_LANG_FALLBACK"), strTable[0], pInfo.Fallback);
          $.SReplaceChar(P(pInfo.Name, 0), 124, 32);
          $.SReplaceChar(P(pInfo.Info, 0), 124, 32);
          $.SReplaceChar(P(pInfo.Fallback, 0), 124, 32);
          $delete(strTable[0]);
          pInfo.Next = this.Infos;
          this.Infos = pInfo;
        }
      }
    }
  }

  InitStringTable(strCode) {
    let hGroup = new $.C4Group().init();
    if (this.LoadStringTable($.Application.SystemGroup, strCode)) {
      return true;
    }
    let pPack = null;
    for (let iPack = 0; (pPack = this.Packs.GetGroup(iPack)) != null; iPack = iPack + 1 | 0) {
      if (hGroup.OpenAsChild(pPack, S("System.ocg"))) {
        if (this.LoadStringTable(hGroup, strCode)) {
          hGroup.Close$v();
          return true;
        }
        hGroup.Close$v();
      }
    }
    return false;
  }

  LoadStringTable(hGroup, strCode) {
    const strEntry = new Int8Array(256);
    $.ssprintf$10(strEntry, S("Language%s.txt"), strCode);
    if (!$.C4LangStringTable.GetSystemStringTable().Load$rC4Group$pi8$pi8(hGroup, P(strEntry, 0))) {
      return false;
    }
    return true;
  }

  $clone() { return new C4Language().$assign(this); }
  $assign(o) {
    this.PackDirectory.$assign(o.PackDirectory);
    this.Packs.$assign(o.Packs);
    this.PackGroups.$assign(o.PackGroups);
    this.Infos = o.Infos;
    this.PackGroupLocation = o.PackGroupLocation.slice();
    return this;
  }
}


function GetRelativePath(strPath, strRelativeTo, strBuffer) {
  let szCpy = null;
  $.SCopy$pi8$pi8$u64(szCpy = $.GetRelativePathS(strPath, strRelativeTo), P(strBuffer, 0), 4097);
  return !$peq(szCpy, strPath);
}


export function LoadResStr(id) {
  try {
    return $.C4LangStringTable.GetSystemStringTable().Translate(StdString.of(id)).c_str();
  } catch ($e1) {
    if ($e1 instanceof $.C4LangStringTable$NoSuchTranslation) {
      return id;
    } else {
      throw $e1;
    }
  }
}

export function CopyResStr(id, stringtbl, dest) {
  let value = GetResStr(id, stringtbl);
  c$strncpy(P(dest, 0), value.c_str(), 1025);
  dest[1024] = 0;
}

export function $init(): void {
  $.C4MaxLanguageInfo$C4Language = 1024;
  $.Languages = new C4Language(); $.Languages.init();
}

Object.assign($, { C4Language, C4LanguageInfo, CopyResStr, GetRelativePath, LoadResStr });
