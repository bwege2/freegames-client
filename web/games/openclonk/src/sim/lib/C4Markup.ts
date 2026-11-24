// @ts-nocheck
// OpenClonk 36de799: src/lib/C4Markup.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $padd, $peq, $rd, $wr, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete, StdString } from '../../rt/std.ts';

export class C4MarkupTag {
  pPrev = null;
  pNext = null;

  OpeningTag() { /* not translated: C++ user-defined literal in the markup parser; GUI text only */ }

  ClosingTag() { /* not translated: C++ user-defined literal in the markup parser; GUI text only */ }

  $clone() { return new C4MarkupTag().$assign(this); }
  $assign(o) {
    this.pPrev = o.pPrev;
    this.pNext = o.pNext;
    return this;
  }
}

export class C4Markup {
  pTags = null;
  pLast = null;
  fDoClr = false;

  Push(pTag) {
    if ((pTag.pPrev = this.pLast) != null) {
      this.pLast.pNext = pTag;
    } else {
      this.pTags = pTag;
    }
    this.pLast = pTag;
  }

  Pop() {
    let pL = this.pLast;
    if (pL == null) {
      return null;
    }
    if ((this.pLast = pL.pPrev) != null) {
      this.pLast.pNext = null;
    } else {
      this.pTags = null;
    }
    return pL;
  }

  init(fDoClr) {
    this.pTags = this.pLast = null;
    this.fDoClr = fDoClr;
    return this;
  }

  $dtor() {
    let pTag = this.pTags;
    let pNext = null;
    while (pTag != null) {
      pNext = pTag.pNext;
      $delete(pTag);
      pTag = pNext;
    }
  }

  Read(ppText, fSkip = false) {
    const Tag = new Int8Array(50);
    let pNewTag = null;
    let iTagLen = 0;
    let iParLen = 0;
    if (!$.SCopyEnclosed(ppText.a[ppText.o], 60, 62, P(Tag, 0), 49)) {
      return false;
    }
    iTagLen = $.SLen(P(Tag, 0)) | 0;
    let szPars = null;
    let iSPos = 0;
    if ((iSPos = $.SCharPos(32, P(Tag, 0))) > -1) {
      Tag[iSPos] = 0;
      szPars = $padd($padd(P(Tag, 0), iSPos), 1);
    }
    if (Tag[0] === 47) {
      if (szPars != null) {
        return false;
      }
      if (!fSkip) {
        if (this.pLast == null) {
          return false;
        }
        if (!$.SEqual(this.pLast.TagName(), $padd(P(Tag, 0), 1))) {
          return false;
        }
        $delete(this.Pop());
      }
    } else if ($.SEqual(P(Tag, 0), S("i"))) {
      if (szPars != null) {
        return false;
      }
      if (!fSkip) {
        pNewTag = new C4MarkupTagItalic().init();
      }
    } else if ($.SEqual(P(Tag, 0), S("c"))) {
      if (szPars == null) {
        return false;
      }
      if ((iParLen = $.SLen(szPars) | 0) > 8) {
        return false;
      }
      if (!fSkip) {
        let dwClr = 0;
        for (let i = 0; i < iParLen; i = i + 1 | 0) {
          let b = 0;
          if (szPars.a[szPars.o + i] >= 48 && szPars.a[szPars.o + i] <= 57) {
            b = (szPars.a[szPars.o + i] - 48 | 0) & 0xff;
          } else if (szPars.a[szPars.o + i] >= 97 && szPars.a[szPars.o + i] <= 102) {
            b = ((szPars.a[szPars.o + i] - 97 | 0) + 10 | 0) & 0xff;
          } else {
            return false;
          }
          dwClr = (dwClr | (b << Math.imul((iParLen - i | 0) - 1 | 0, 4) | 0) >>> 0) >>> 0;
        }
        if (iParLen <= 6) {
          dwClr = (dwClr | 0xff000000) >>> 0;
        }
        pNewTag = new C4MarkupTagColor().init(dwClr);
      }
    } else {
      return false;
    }
    if (pNewTag != null) {
      this.Push(pNewTag);
    }
    ppText.a[ppText.o] = ppText.a[ppText.o].add(iTagLen + 2 | 0);
    return true;
  }

  SkipTags(ppText) {
    while (ppText.a[ppText.o].a[ppText.a[ppText.o].o] === 60) {
      if (!this.Read(ppText, true)) {
        break;
      }
    }
    return ppText.a[ppText.o].a[ppText.a[ppText.o].o] === 0;
  }

  Apply(rBltTrf, dwClr) {
    for (let pTag = this.pTags; pTag != null; pTag = pTag.pNext) {
      pTag.Apply(rBltTrf, this.fDoClr, dwClr);
    }
  }

  Clean() {
    return this.pTags == null;
  }

  ClosingTags() {
    let result = new StdString();
    for (let tag = this.pLast; tag != null; tag = tag.pPrev) {
      result.append(tag.ClosingTag());
    }
    return result;
  }

  OpeningTags() {
    let result = new StdString();
    for (let tag = this.pTags; tag != null; tag = tag.pNext) {
      result.append(tag.OpeningTag());
    }
    return result;
  }

  static StripMarkup$pi8(szText) {
    let $t1, $t2;
    let mkup = new C4Markup().init(false);
    const szRead = [szText];
    let szPos2 = null;
    do {
      mkup.SkipTags(P(szRead, 0));
      if (szRead[0].a[szRead[0].o + 0] === 123 && szRead[0].a[szRead[0].o + 1] === 123 && szRead[0].a[szRead[0].o + 2] !== 123) {
        if ((szPos2 = $.SSearch($padd(szRead[0], 2), S("}}"))) != null) {
          szRead[0] = szPos2;
        } else {
          szRead[0] = szRead[0].add(2);
        }
      } else if (szRead[0].a[szRead[0].o + 0] === 125 && szRead[0].a[szRead[0].o + 1] === 125) {
        szRead[0] = szRead[0].add(2);
      }
    } while ($wr(($t1 = szText, szText = szText.add(1), $t1), 0, $rd(($t2 = szRead[0], szRead[0] = szRead[0].add(1), $t2))) !== 0);
    return !$peq(szText, szRead[0]);
  }

  static StripMarkup$pStdStrBuf(sText) {
    let buf = sText.GrabPointer();
    if (buf == null) {
      return false;
    }
    let fSuccess = C4Markup.StripMarkup$pi8(buf);
    sText.Take$pi8(buf);
    return fSuccess;
  }

  $clone() { return new C4Markup().$assign(this); }
  $assign(o) {
    this.pTags = o.pTags;
    this.pLast = o.pLast;
    this.fDoClr = o.fDoClr;
    return this;
  }
}

export class C4MarkupTagItalic extends C4MarkupTag {

  init() {
    return this;
  }

  Apply(rBltTrf, _fDoClr, _dwClr) {
    rBltTrf.mat[1] = Math.fround(rBltTrf.mat[1] - Math.fround(0.300000012));
  }

  TagName() {
    return S("i");
  }

  $clone() { return new C4MarkupTagItalic().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class C4MarkupTagColor extends C4MarkupTag {
  dwClr = 0;

  init(dwClr) {
    this.dwClr = dwClr;
    return this;
  }

  Apply(_rBltTrf, fDoClr, dwClr) {
    if (fDoClr) {
      dwClr.a[dwClr.o] = this.dwClr;
    }
  }

  TagName() {
    return S("c");
  }

  OpeningTag() { /* not translated: C++ user-defined literal in the markup parser; GUI text only */ }

  $clone() { return new C4MarkupTagColor().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.dwClr = o.dwClr;
    return this;
  }
}

export function $init(): void {
}

Object.assign($, { C4Markup, C4MarkupTag, C4MarkupTagColor, C4MarkupTagItalic });
