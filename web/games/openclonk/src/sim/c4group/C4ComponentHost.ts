// @ts-nocheck
// OpenClonk 36de799: src/c4group/C4ComponentHost.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $u64n } from '../../rt/int.ts';
import { c$strlen } from '../../rt/libc.ts';
import { $cs, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';

export class C4ComponentHost {
  Data = new $.StdCopyStrBuf();
  Filename = new $.StdCopyStrBuf();
  FilePath = new $.StdCopyStrBuf();

  init() {
    this.Data = new $.StdCopyStrBuf();
    this.Filename = new $.StdCopyStrBuf();
    this.FilePath = new $.StdCopyStrBuf();
    return this;
  }

  $dtor() {
    C4ComponentHost.prototype.Clear.call(this);
  }

  GetFilePath() {
    return this.FilePath.getData();
  }

  Clear() {
    this.Data.Clear();
    this.OnLoad();
  }

  GetData() {
    return this.Data.getData();
  }

  GetDataBuf() {
    return this.Data;
  }

  GetDataSize() {
    return this.Data.getLength();
  }

  Load$rC4Group$pi8$pi8(hGroup, fname, szLanguage = null) {
    C4ComponentHost.prototype.Clear.call(this);
    if (fname != null) {
      this.Filename.Copy$pi8(fname);
    }
    const strEntry = new Int8Array(256);
    let strEntryWithLanguage = new $.StdStrBuf();
    for (let iFilename = 0; $.SCopySegment(this.Filename.getData(), iFilename, P(strEntry, 0), 124); iFilename = iFilename + 1 | 0) {
      const strCode = $cs(S(""), 3);
      for (let iLang = 0; $.SCopySegment(szLanguage != null ? szLanguage : S(""), iLang, P(strCode, 0), 44, 2); iLang = iLang + 1 | 0) {
        strEntryWithLanguage.Format(P(strEntry, 0), P(strCode, 0));
        if (hGroup.LoadEntryString$StdStrBuf$pStdStrBuf(strEntryWithLanguage, this.Data)) {
          this.FinishLoad(strEntryWithLanguage, hGroup);
          return true;
        }
        if (!($.SSearch(P(strEntry, 0), S("%s")) != null)) {
          break;
        }
      }
    }
    $.SReplaceChar(this.Filename.getMData(), 124, 0);
    this.CopyFilePathFromGroup(hGroup);
    return false;
  }

  Load$rC4GroupSet$pi8$pi8(hGroupSet, fname, szLanguage = null) {
    C4ComponentHost.prototype.Clear.call(this);
    if (fname != null) {
      this.Filename.Copy$pi8(fname);
    }
    const strEntry = new Int8Array(256);
    let strEntryWithLanguage = new $.StdStrBuf();
    for (let iFilename = 0; $.SCopySegment(this.Filename.getData(), iFilename, P(strEntry, 0), 124); iFilename = iFilename + 1 | 0) {
      const strCode = $cs(S(""), 3);
      for (let iLang = 0; $.SCopySegment(szLanguage != null ? szLanguage : S(""), iLang, P(strCode, 0), 44, 2); iLang = iLang + 1 | 0) {
        strEntryWithLanguage.Format(P(strEntry, 0), P(strCode, 0));
        if (hGroupSet.LoadEntryString$StdStrBuf$pStdStrBuf(strEntryWithLanguage, this.Data)) {
          let pGroup = hGroupSet.FindEntry(strEntryWithLanguage.getData());
          this.FinishLoad(strEntryWithLanguage, pGroup);
          return true;
        }
        if (!($.SSearch(P(strEntry, 0), S("%s")) != null)) {
          break;
        }
      }
    }
    $.SReplaceChar(this.Filename.getMData(), 124, 0);
    this.CopyFilePathFromGroup(hGroupSet.GetGroup(0));
    return false;
  }

  GetLanguageString(szLanguage, rTarget) {
    let cptr = null;
    if (szLanguage == null || this.Data.op_not()) {
      return false;
    }
    const langindex = $cs(S(""), 4);
    for (let clseg = 0; $.SCopySegment(szLanguage != null ? szLanguage : S(""), clseg, P(langindex, 0), 44, 2); clseg = clseg + 1 | 0) {
      $.SAppend(S(":"), P(langindex, 0));
      if ((cptr = $.SSearch(this.Data.getData(), P(langindex, 0))) != null) {
        let iEndPos = $.SCharPos(13, cptr);
        if (iEndPos < 0) {
          iEndPos = $.SCharPos(10, cptr);
        }
        if (iEndPos < 0) {
          iEndPos = c$strlen(cptr) | 0;
        }
        rTarget.Copy$pi8$u64(cptr, $u64n(iEndPos));
        return true;
      }
    }
    return false;
  }

  OnLoad() {
  }

  CopyFilePathFromGroup(hGroup) {
    this.FilePath.Copy$pi8($.Config.AtRelativePath(hGroup.GetFullName().getData()));
    this.FilePath.AppendBackslash();
    this.FilePath.Append$StdStrBuf(this.Filename);
  }

  FinishLoad(name, hGroup) {
    hGroup.FindEntry$pi8$pStdStrBuf$pu64(name.getData(), this.Filename);
    this.CopyFilePathFromGroup(hGroup);
    if (this.Data.EnsureUnicode()) {
      $.LogF(S("WARNING: File is not encoded as UTF-8 (%s)"), this.FilePath.getData());
    }
    if (this.Data.op_index(0) === -17 && this.Data.op_index(1) === -69 && this.Data.op_index(2) === -65) {
      this.Data.Move(3, this.Data.getSize() - 3);
      this.Data.Shrink(3);
    }
    this.OnLoad();
  }

  $clone() { return new C4ComponentHost().$assign(this); }
  $assign(o) {
    this.Data.$assign(o.Data);
    this.Filename.$assign(o.Filename);
    this.FilePath.$assign(o.FilePath);
    return this;
  }
}

export function $init(): void {
}

Object.assign($, { C4ComponentHost });
