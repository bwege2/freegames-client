// @ts-nocheck
// OpenClonk 36de799: src/c4group/C4GroupSet.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $u64n } from '../../rt/int.ts';
import { $padd, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete } from '../../rt/std.ts';

export class C4GroupSetNode {
  pParent = null;
  pPrev = null;
  pNext = null;
  pGroup = null;
  fGrpOwned = false;
  id = 0;
  Priority = 0;
  Contents = 0;

  init(rParent, pPrev, rGroup, fGrpOwned, id) {
    this.pParent = rParent;
    this.pPrev = pPrev;
    if (pPrev != null) {
      this.pNext = pPrev.pNext;
      pPrev.pNext = this;
    } else {
      this.pNext = this.pParent.pFirst;
      this.pParent.pFirst = this;
    }
    if (this.pNext != null) {
      this.pNext.pPrev = this;
    } else {
      this.pParent.pLast = this;
    }
    this.pGroup = rGroup;
    this.fGrpOwned = fGrpOwned;
    this.id = id;
    return this;
  }

  $dtor() {
    if (this.fGrpOwned) {
      $delete(this.pGroup);
    }
    (($v) => this.pPrev != null ? (this.pPrev.pNext = $v) : (this.pParent.pFirst = $v))(this.pNext);
    (($v) => this.pNext != null ? (this.pNext.pPrev = $v) : (this.pParent.pLast = $v))(this.pPrev);
  }

  $clone() { return new C4GroupSetNode().$assign(this); }
  $assign(o) {
    this.pParent = o.pParent;
    this.pPrev = o.pPrev;
    this.pNext = o.pNext;
    this.pGroup = o.pGroup;
    this.fGrpOwned = o.fGrpOwned;
    this.id = o.id;
    this.Priority = o.Priority;
    this.Contents = o.Contents;
    return this;
  }
}

export class C4GroupSet {
  pFirst = null;
  pLast = null;
  iIndex = 0;

  UnregisterGroup(iIndex) {
    if (iIndex < 0) {
      return false;
    }
    for (let pNode = this.pFirst; pNode != null; pNode = pNode.pNext) {
      if (iIndex === 0) {
        $delete(pNode);
        return true;
      } else {
        iIndex = iIndex - 1 | 0;
      }
    }
    return false;
  }

  Clear() {
    while (this.pFirst != null) {
      $delete(this.pFirst);
    }
    this.pFirst = null;
  }

  Default() {
    this.pFirst = this.pLast = null;
  }

  init() {
    C4GroupSet.prototype.Default.call(this);
    this.iIndex = 0;
    return this;
  }

  $dtor() {
    C4GroupSet.prototype.Clear.call(this);
  }

  RegisterGroup(rGroup, fOwnGrp, Priority, Contents, fCheckContent = true) {
    let pNode = null;
    for (pNode = this.pLast; pNode != null; pNode = pNode.pPrev) {
      if (pNode.Priority > Priority) {
        break;
      }
    }
    let pNewNode = new C4GroupSetNode().init(this, pNode, rGroup, fOwnGrp, (this.iIndex = this.iIndex + 1 | 0));
    if (fCheckContent) {
      Contents = C4GroupSet.CheckGroupContents(rGroup, Contents);
    }
    pNewNode.Priority = Priority;
    pNewNode.Contents = Contents;
    return true;
  }

  RegisterGroups(rCopy, Contents, szFilename = null, iMaxSkipID = 0) {
    let Contents2 = 0;
    for (let pNode = rCopy.pFirst; pNode != null; pNode = pNode.pNext) {
      if ((Contents2 = pNode.Contents & Contents) !== 0) {
        if (pNode.id > iMaxSkipID) {
          if (szFilename == null) {
            this.RegisterGroup(pNode.pGroup, false, pNode.Priority, Contents2, false);
          } else {
            let pGroup = new $.C4Group().init();
            if (!pGroup.OpenAsChild(pNode.pGroup, szFilename)) {
              $delete(pGroup);
              continue;
            }
            if (!this.RegisterGroup(pGroup, true, pNode.Priority, Contents2, false)) {
              $delete(pGroup);
            }
          }
        }
      }
    }
    return true;
  }

  FindGroup(Contents, pAfter = null, fSamePrio = false) {
    let iPriority = -1;
    for (let pNode = this.pFirst; pNode != null; pNode = pNode.pNext) {
      if (pAfter == null && (pNode.Contents & Contents) !== 0) {
        if (iPriority === -1 || iPriority === pNode.Priority) {
          return pNode.pGroup;
        }
      }
      if (pNode.pGroup === pAfter) {
        pAfter = null;
        if (fSamePrio) {
          iPriority = pNode.Priority;
        }
      }
    }
    return null;
  }

  FindEntry(szWildcard, pPriority = null, pID = null) {
    for (let pNode = this.pFirst; pNode != null; pNode = pNode.pNext) {
      if (pNode.pGroup.FindEntry$pi8$pStdStrBuf$pu64(szWildcard)) {
        if (pPriority != null) {
          pPriority.a[pPriority.o] = pNode.Priority;
        }
        if (pID != null) {
          pID.a[pID.o] = pNode.id;
        }
        return pNode.pGroup;
      }
    }
    return null;
  }

  FindSuitableFile(szName, extensions, szFileName, pID = null) {
    let pGrp = null;
    let pGrp2 = null;
    let iPrio = -1;
    const iPrio2 = [0];
    const GroupID = [0];
    const FileName = new Int8Array(255);
    $.SCopy$pi8$pi8(szName, P(FileName, 0));
    for (let i = 0; extensions.a[extensions.o + i] != null; i = i + 1 | 0) {
      $.EnforceExtension$pi8$pi8(P(FileName, 0), extensions.a[extensions.o + i]);
      pGrp2 = this.FindEntry(P(FileName, 0), P(iPrio2, 0), P(GroupID, 0));
      if ((pGrp == null || iPrio2[0] >= iPrio) && pGrp2 != null) {
        if (pID != null) {
          pID.a[pID.o] = GroupID[0];
        }
        pGrp = pGrp2;
        $.SCopy$pi8$pi8(P(FileName, 0), szFileName);
      }
    }
    return pGrp;
  }

  GetGroupCount() {
    let iCount = 0;
    for (let pNode = this.pFirst; pNode != null; pNode = pNode.pNext) {
      iCount = iCount + 1 | 0;
    }
    return iCount;
  }

  GetGroup(iIndex) {
    if (iIndex < 0) {
      return null;
    }
    for (let pNode = this.pFirst; pNode != null; pNode = pNode.pNext) {
      if (iIndex === 0) {
        return pNode.pGroup;
      } else {
        iIndex = iIndex - 1 | 0;
      }
    }
    return null;
  }

  LoadEntry(szEntryName, lpbpBuf, ipSize = null, iAppendZeros = 0) {
    let pGroup = null;
    if ((pGroup = this.FindEntry(szEntryName)) != null) {
      return pGroup.LoadEntry$pi8$ppi8$pu64$i32(szEntryName, lpbpBuf, ipSize, iAppendZeros);
    }
    return false;
  }

  LoadEntryString$pi8$pStdStrBuf(szEntryName, rBuf) {
    let pGroup = null;
    if ((pGroup = this.FindEntry(szEntryName)) != null) {
      return pGroup.LoadEntryString$pi8$pStdStrBuf(szEntryName, rBuf);
    }
    return false;
  }

  LoadEntryString$StdStrBuf$pStdStrBuf(name, Buf) {
    return this.LoadEntryString$pi8$pStdStrBuf(name.getData(), Buf);
  }

  RegisterParentFolders(szScenFilename) {
    let $t1, $t2;
    let pParentGroup = null;
    let fParentC4F = false;
    const szParentfolder = new Int8Array(4097);
    if ($.SEqualNoCase($.GetExtension(szScenFilename), S("ocf"))) {
      fParentC4F = true;
      $.SCopy$pi8$pi8$u64(szScenFilename, P(szParentfolder, 0), 4096);
    } else {
      $.GetParentPath$pi8$pi8(szScenFilename, P(szParentfolder, 0));
      fParentC4F = $.SEqualNoCase($.GetExtension$2(P(szParentfolder, 0)), S("ocf"));
    }
    if (fParentC4F) {
      let iOriginalLen = $.SLen(P(szParentfolder, 0)) | 0;
      for (let i = 0; i < iOriginalLen; i = i + 1 | 0) {
        if (szParentfolder[i] === 47 || szParentfolder[i] === 47) {
          szParentfolder[i] = 0;
        }
      }
      let iPos = iOriginalLen - 1 | 0;
      while (iPos !== 0) {
        while (iPos !== 0 && szParentfolder[iPos] === 0) {
          iPos = iPos - 1 | 0;
        }
        if (iPos === 0) {
          break;
        }
        while (iPos !== 0 && szParentfolder[iPos] !== 0) {
          iPos = iPos - 1 | 0;
        }
        if (!$.SEqualNoCase($.GetExtension$2($padd($padd(P(szParentfolder, 0), iPos), 1)), S("ocf"), 3)) {
          break;
        }
      }
      if (iPos !== 0) {
        szParentfolder[$u64n(iPos + 1 | 0) + $.SLen($padd($padd(P(szParentfolder, 0), iPos), 1))] = szParentfolder[iPos] = 47;
        while (($t1 = iPos, iPos = iPos - 1 | 0, $t1) !== 0) {
          if (szParentfolder[iPos] === 0) {
            szParentfolder[iPos] = 47;
          }
        }
        iPos = iPos + 1 | 0;
      }
      let iGroupIndex = 0;
      while (iPos < iOriginalLen) {
        while (iPos < iOriginalLen && szParentfolder[iPos] === 0) {
          iPos = iPos + 1 | 0;
        }
        if (iPos >= iOriginalLen) {
          break;
        }
        let pGroup = new $.C4Group().init();
        if (pParentGroup != null) {
          if (!pGroup.OpenAsChild(pParentGroup, $padd(P(szParentfolder, 0), iPos))) {
            $.LogFatal($.FormatString(S("%s: %s"), $.LoadResStr(S("IDS_PRC_FILENOTFOUND")), $padd(P(szParentfolder, 0), iPos)).getData());
            $delete(pGroup);
            return null;
          }
        } else if (!$.Reloc.Open(pGroup, $padd(P(szParentfolder, 0), iPos))) {
          $.LogFatal($.FormatString(S("%s: %s"), $.LoadResStr(S("IDS_PRC_FILENOTFOUND")), $padd(P(szParentfolder, 0), iPos)).getData());
          $delete(pGroup);
          return null;
        }
        pParentGroup = pGroup;
        let iContentsMask = 0;
        if ($.WildcardMatch(S("*.ocf"), pParentGroup.GetName())) {
          iContentsMask = 47;
        } else {
          iContentsMask = 10;
        }
        if (!this.RegisterGroup(pParentGroup, true, 100 + ($t2 = iGroupIndex, iGroupIndex = iGroupIndex + 1 | 0, $t2) | 0, iContentsMask)) {
          $delete(pParentGroup);
          $.LogFatal(S("RegGrp: internal error"));
          return null;
        }
        iPos = $u64n(iPos) + $.SLen($padd(P(szParentfolder, 0), iPos)) | 0;
      }
    }
    return pParentGroup;
  }

  PreCacheEntries(szEntryMask) {
    let result = 0;
    for (let pNode = this.pFirst; pNode != null; pNode = pNode.pNext) {
      if (pNode.pGroup != null) {
        result = result + pNode.pGroup.PreCacheEntries(szEntryMask) | 0;
      }
    }
    return result;
  }

  static CheckGroupContents(rGroup, Contents) {
    if ((Contents & 1) !== 0) {
      if (!rGroup.FindEntry$pi8$pStdStrBuf$pu64(S("Graphics.ocg"))) {
        Contents = Contents & -2;
      }
    }
    if ((Contents & 2) !== 0) {
      if (!rGroup.FindEntry$pi8$pStdStrBuf$pu64(S("Loader*.bmp")) && !rGroup.FindEntry$pi8$pStdStrBuf$pu64(S("Loader*.png")) && !rGroup.FindEntry$pi8$pStdStrBuf$pu64(S("Loader*.jpg")) && !rGroup.FindEntry$pi8$pStdStrBuf$pu64(S("Loader*.jpeg"))) {
        Contents = Contents & -3;
      }
    }
    if ((Contents & 4) !== 0) {
      if (!rGroup.FindEntry$pi8$pStdStrBuf$pu64(S("Material.ocg"))) {
        Contents = Contents & -5;
      }
    }
    if ((Contents & 8) !== 0) {
      if (!rGroup.FindEntry$pi8$pStdStrBuf$pu64(S("Music.ocg"))) {
        Contents = Contents & -9;
      }
    }
    if ((Contents & 16) !== 0) {
      if (!rGroup.FindEntry$pi8$pStdStrBuf$pu64(S("*.ocd"))) {
        Contents = Contents & -17;
      }
    }
    if ((Contents & 32) !== 0) {
      if (!rGroup.FindEntry$pi8$pStdStrBuf$pu64(S("*.fon|*.fnt|*.ttf|*.ttc|*.fot|*.otf"))) {
        Contents = Contents & -33;
      }
    }
    return Contents;
  }

  GetLastID() {
    return this.iIndex;
  }

  CloseFolders() {
    for (let pNode = this.pFirst, pNext = null; pNode != null; pNode = pNext) {
      pNext = pNode.pNext;
      if ($.Inside$i32$i32$i32$3(pNode.Priority, 100, 199) || pNode.Priority === 200) {
        $delete(pNode);
      }
    }
    return true;
  }

  $copy(rCopy) {
    C4GroupSet.prototype.Default.call(this);
    this.iIndex = 0;
    C4GroupSet.prototype.RegisterGroups.call(this, rCopy, -1);
    return this;
  }
  $clone() { return new C4GroupSet().$copy(this); }
  $assign(o) {
    this.pFirst = o.pFirst;
    this.pLast = o.pLast;
    this.iIndex = o.iIndex;
    return this;
  }
}

export function $init(): void {
}

Object.assign($, { C4GroupSet, C4GroupSetNode });
