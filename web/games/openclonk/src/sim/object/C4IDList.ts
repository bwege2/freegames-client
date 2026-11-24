// @ts-nocheck
// OpenClonk 36de799: src/object/C4IDList.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $u64n } from '../../rt/int.ts';
import { c$memcmp, c$memcpy } from '../../rt/libc.ts';
import { $oarr, $oat, $own, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete, $max, $min } from '../../rt/std.ts';

export class C4IDListChunk {
  id = $oarr(5, () => new $.C4ID().init$v());
  Count = new Int32Array(5);
  pNext = null;

  init() {
    this.id = $oarr(5, () => new $.C4ID().init$v());
    this.pNext = null;
    return this;
  }

  $dtor() {
    C4IDListChunk.prototype.Clear.call(this);
  }

  Clear() {
    let pChunk = this.pNext;
    let pChunk2 = null;
    while (pChunk != null) {
      pChunk2 = pChunk.pNext;
      pChunk.pNext = null;
      $delete(pChunk);
      pChunk = pChunk2;
    }
    this.pNext = null;
  }

  $clone() { return new C4IDListChunk().$assign(this); }
  $assign(o) {
    this.id = $own(o.id.map(($e0) => $e0.$clone()));
    this.Count = o.Count.slice();
    this.pNext = o.pNext;
    return this;
  }
}

export class C4IDList extends C4IDListChunk {
  Count$C4IDList = 0;

  init() {
    super.init();
    C4IDList.prototype.Default.call(this);
    return this;
  }

  $dtor() {
    super.$dtor();
  }

  op_eq(rhs) {
    if (this.Count$C4IDList !== rhs.Count$C4IDList) {
      return false;
    }
    let pChunk1 = this;
    let pChunk2 = rhs;
    let cnt = this.Count$C4IDList | 0;
    while (pChunk1 != null && pChunk2 != null) {
      if (c$memcmp($oat(pChunk1.id, 0), $oat(pChunk2.id, 0), 8 * $u64n($min(cnt, 5))) !== 0) {
        return false;
      }
      if (c$memcmp(P(pChunk1.Count, 0), P(pChunk2.Count, 0), 4 * $u64n($min(cnt, 5))) !== 0) {
        return false;
      }
      pChunk1 = pChunk1.pNext;
      pChunk2 = pChunk2.pNext;
      cnt = $u64n(cnt) - 5 | 0;
    }
    return true;
  }

  Default() {
    this.Clear();
  }

  Clear() {
    C4IDListChunk.prototype.Clear.call(this);
    this.Count$C4IDList = 0;
  }

  IsClear() {
    return this.Count$C4IDList === 0;
  }

  GetID$u64$pi32(index, ipCount = null) {
    if (!$.Inside$u64$u32$u64(index + 1, 1, this.Count$C4IDList)) {
      return $.C4ID.None.$clone();
    }
    let pQueryChunk = this;
    while (index >= 5) {
      pQueryChunk = pQueryChunk.pNext;
      index = index - 5;
    }
    if (ipCount != null) {
      ipCount.a[ipCount.o] = pQueryChunk.Count[index];
    }
    return pQueryChunk.id[index].$clone();
  }

  GetCount$u64(index) {
    if (!$.Inside$u64$u32$u64(index + 1, 1, this.Count$C4IDList)) {
      return 0;
    }
    let pQueryChunk = this;
    while (index >= 5) {
      pQueryChunk = pQueryChunk.pNext;
      index = index - 5;
    }
    return pQueryChunk.Count[index];
  }

  SetCount$u64$i32(index, iCount) {
    if (!$.Inside$u64$u32$u64(index + 1, 1, this.Count$C4IDList)) {
      return false;
    }
    let pQueryChunk = this;
    while (index >= 5) {
      pQueryChunk = pQueryChunk.pNext;
      index = index - 5;
    }
    pQueryChunk.Count[index] = iCount;
    return true;
  }

  GetIDCount(c_id, iZeroDefVal = 0) {
    let $t1;
    let pQueryChunk = this;
    let cnt = this.Count$C4IDList;
    let cntl = 0;
    while (($t1 = cnt, cnt = cnt - 1, $t1) !== 0) {
      if (pQueryChunk.id[cntl].op_eq(c_id)) {
        let iCount = pQueryChunk.Count[cntl];
        return iCount !== 0 ? iCount : iZeroDefVal;
      }
      if ((cntl = cntl + 1) === 5) {
        pQueryChunk = pQueryChunk.pNext;
        cntl = 0;
      }
    }
    return 0;
  }

  SetIDCount(c_id, iCount, fAddNewID = false) {
    let $t1;
    let pQueryChunk = this;
    let cnt = this.Count$C4IDList;
    let cntl = 0;
    while (($t1 = cnt, cnt = cnt - 1, $t1) !== 0) {
      if (pQueryChunk.id[cntl].op_eq(c_id)) {
        pQueryChunk.Count[cntl] = iCount;
        return true;
      }
      if ((cntl = cntl + 1) === 5) {
        pQueryChunk = pQueryChunk.pNext;
        cntl = 0;
      }
    }
    if (fAddNewID) {
      if (pQueryChunk == null) {
        let pLast = this;
        while (pLast.pNext != null) {
          pLast = pLast.pNext;
        }
        pQueryChunk = new C4IDListChunk().init();
        pLast.pNext = pQueryChunk;
      }
      pQueryChunk.id[cntl].$assign(c_id);
      pQueryChunk.Count[cntl] = iCount;
      this.Count$C4IDList = this.Count$C4IDList + 1;
      return true;
    }
    return false;
  }

  IncreaseIDCount(c_id, fAddNewID = true, IncreaseBy = 1, fRemoveEmpty = false) {
    let $t1;
    let pQueryChunk = this;
    let cnt = this.Count$C4IDList;
    let cntl = 0;
    while (($t1 = cnt, cnt = cnt - 1, $t1) !== 0) {
      if (pQueryChunk.id[cntl].op_eq(c_id)) {
        pQueryChunk.Count[cntl] = pQueryChunk.Count[cntl] + IncreaseBy | 0;
        if (fRemoveEmpty && pQueryChunk.Count[cntl] === 0) {
          this.DeleteItem(this.Count$C4IDList - cnt - 1);
        }
        return true;
      }
      if ((cntl = cntl + 1) === 5) {
        pQueryChunk = pQueryChunk.pNext;
        cntl = 0;
      }
    }
    if (!fAddNewID) {
      return true;
    }
    if (pQueryChunk == null) {
      let pLast = this;
      while (pLast.pNext != null) {
        pLast = pLast.pNext;
      }
      pQueryChunk = new C4IDListChunk().init();
      pLast.pNext = pQueryChunk;
    }
    pQueryChunk.id[cntl].$assign(c_id);
    pQueryChunk.Count[cntl] = IncreaseBy;
    this.Count$C4IDList = this.Count$C4IDList + 1;
    return true;
  }

  DecreaseIDCount(c_id, fRemoveEmptyID = true) {
    return this.IncreaseIDCount(c_id.$clone(), false, -1, fRemoveEmptyID);
  }

  GetNumberOfIDs$v() {
    return this.Count$C4IDList | 0;
  }

  GetIndex(c_id) {
    let $t1;
    let pQueryChunk = this;
    let cnt = this.Count$C4IDList;
    let cntl = 0;
    while (($t1 = cnt, cnt = cnt - 1, $t1) !== 0) {
      if (pQueryChunk.id[cntl].op_eq(c_id)) {
        return this.Count$C4IDList - cnt - 1 | 0;
      }
      if ((cntl = cntl + 1) === 5) {
        pQueryChunk = pQueryChunk.pNext;
        cntl = 0;
      }
    }
    return -1;
  }

  GetID$rC4DefList$i32$i32$pi32(rDefs, dwCategory, index, ipCount = null) {
    let $t1;
    let cindex = -1;
    let cDef = null;
    if (ipCount != null) {
      ipCount.a[ipCount.o] = 0;
    }
    let pQueryChunk = this;
    let cnt = this.Count$C4IDList;
    let cntl = 0;
    while (($t1 = cnt, cnt = cnt - 1, $t1) !== 0) {
      if (dwCategory === -1 || (cDef = rDefs.ID2Def(pQueryChunk.id[cntl].$clone())) != null && (cDef.Category & dwCategory) !== 0) {
        cindex = cindex + 1 | 0;
        if (cindex === index) {
          if (ipCount != null) {
            ipCount.a[ipCount.o] = pQueryChunk.Count[cntl];
          }
          return pQueryChunk.id[cntl].$clone();
        }
      }
      if ((cntl = cntl + 1) === 5) {
        pQueryChunk = pQueryChunk.pNext;
        cntl = 0;
      }
    }
    return $.C4ID.None.$clone();
  }

  GetCount$rC4DefList$i32$i32(rDefs, dwCategory, index) {
    let $t1;
    let cindex = -1;
    let cDef = null;
    let pQueryChunk = this;
    let cnt = this.Count$C4IDList;
    let cntl = 0;
    while (($t1 = cnt, cnt = cnt - 1, $t1) !== 0) {
      if (dwCategory === -1 || (cDef = rDefs.ID2Def(pQueryChunk.id[cntl].$clone())) != null && (cDef.Category & dwCategory) !== 0) {
        cindex = cindex + 1 | 0;
        if (cindex === index) {
          return pQueryChunk.Count[cntl];
        }
      }
      if ((cntl = cntl + 1) === 5) {
        pQueryChunk = pQueryChunk.pNext;
        cntl = 0;
      }
    }
    return 0;
  }

  SetCount$rC4DefList$i32$i32$i32(rDefs, dwCategory, index, iCount) {
    let $t1;
    let cindex = -1;
    let cDef = null;
    let pQueryChunk = this;
    let cnt = this.Count$C4IDList;
    let cntl = 0;
    while (($t1 = cnt, cnt = cnt - 1, $t1) !== 0) {
      if (dwCategory === -1 || (cDef = rDefs.ID2Def(pQueryChunk.id[cntl].$clone())) != null && (cDef.Category & dwCategory) !== 0) {
        cindex = cindex + 1 | 0;
        if (cindex === index) {
          pQueryChunk.Count[cntl] = iCount;
          return true;
        }
      }
      if ((cntl = cntl + 1) === 5) {
        pQueryChunk = pQueryChunk.pNext;
        cntl = 0;
      }
    }
    return false;
  }

  GetNumberOfIDs$rC4DefList$i32(rDefs, dwCategory) {
    let $t1;
    let idnum = 0;
    let cDef = null;
    let pQueryChunk = this;
    let cnt = this.Count$C4IDList;
    let cntl = 0;
    while (($t1 = cnt, cnt = cnt - 1, $t1) !== 0) {
      if (dwCategory === -1 || (cDef = rDefs.ID2Def(pQueryChunk.id[cntl].$clone())) != null && (cDef.Category & dwCategory) !== 0) {
        idnum = idnum + 1 | 0;
      }
      if ((cntl = cntl + 1) === 5) {
        pQueryChunk = pQueryChunk.pNext;
        cntl = 0;
      }
    }
    return idnum;
  }

  Add(rList) {
    let $t1;
    let pQueryChunk = rList;
    let cnt = rList.Count$C4IDList;
    let cntl = 0;
    while (($t1 = cnt, cnt = cnt - 1, $t1) !== 0) {
      this.IncreaseIDCount(pQueryChunk.id[cntl].$clone(), true, pQueryChunk.Count[cntl]);
      if ((cntl = cntl + 1) === 5) {
        pQueryChunk = pQueryChunk.pNext;
        cntl = 0;
      }
    }
    return true;
  }

  ConsolidateValids(rDefs, dwCategory = 0) {
    let $t1;
    let fIDsRemoved = false;
    let pQueryChunk = this;
    let cnt = this.Count$C4IDList;
    let cntl = 0;
    let pDef = null;
    while (($t1 = cnt, cnt = cnt - 1, $t1) !== 0) {
      if (!((pDef = rDefs.ID2Def(pQueryChunk.id[cntl].$clone())) != null) || dwCategory !== 0 && !((pDef.Category & dwCategory) !== 0)) {
        this.DeleteItem(this.Count$C4IDList - cnt - 1);
        cntl = cntl - 1;
        fIDsRemoved = true;
      }
      if ((cntl = cntl + 1) === 5) {
        pQueryChunk = pQueryChunk.pNext;
        cntl = 0;
      }
    }
    return fIDsRemoved;
  }

  DeleteItem(iIndex) {
    let $t1;
    if (!$.Inside$u64$u32$u64(iIndex + 1, 1, this.Count$C4IDList)) {
      return false;
    }
    let index = iIndex;
    let pQueryChunk = this;
    while (index >= 5) {
      pQueryChunk = pQueryChunk.pNext;
      index = index - 5;
    }
    let cnt = (this.Count$C4IDList = this.Count$C4IDList - 1) - iIndex;
    let cntl = index;
    let cntl2 = cntl;
    let pNextChunk = pQueryChunk;
    while (($t1 = cnt, cnt = cnt - 1, $t1) !== 0) {
      if ((cntl2 = cntl2 + 1) === 5) {
        pNextChunk = pQueryChunk.pNext;
        cntl2 = 0;
      }
      pQueryChunk.id[cntl].$assign(pNextChunk.id[cntl2]);
      pQueryChunk.Count[cntl] = pNextChunk.Count[cntl2];
      pQueryChunk = pNextChunk;
      cntl = cntl2;
    }
    return true;
  }

  Draw(cgo, iSelection, rDefs, dwCategory, fCounts = true, iAlign = 0) {
    let sections = cgo.GetSectionCount();
    let idnum = this.GetNumberOfIDs$rC4DefList$i32(rDefs, dwCategory | 0);
    let firstid = $.Clamp$i32$i32$i32(iSelection - (sections / 2 | 0) | 0, 0, $max(idnum - sections | 0, 0));
    const idcount = [0];
    let c_id = new $.C4ID().init$v();
    let cgo2 = new $.C4Facet().init$v();
    const buf = new Int8Array(10);
    for (let cnt = 0; cnt < sections && c_id.$assign(this.GetID$rC4DefList$i32$i32$pi32(rDefs, dwCategory | 0, firstid + cnt | 0, P(idcount, 0))).op_unsigned_long_C4ID_() != null; cnt = cnt + 1 | 0) {
      cgo2.$assign(cgo.TruncateSection(iAlign));
      rDefs.Draw(c_id.$clone(), cgo2, (firstid + cnt | 0) === iSelection, 0);
      $.ssprintf$3(buf, S("%dx"), idcount[0]);
      if (fCounts) {
        $.pDraw.TextOut(P(buf, 0), $.GraphicsResource.FontRegular, Math.fround(1), cgo2.Surface, Math.fround(Math.fround(cgo2.X + cgo2.Wdt) - Math.fround(1)), Math.fround(Math.fround(Math.fround(cgo2.Y + cgo2.Hgt) - Math.fround(1)) - Math.fround($.GraphicsResource.FontRegular.GetLineHeight())), 0xffffffff, 2);
      }
    }
  }

  CompileFunc(pComp, fValues = true) {
    let deserializing = pComp.isDeserializer();
    let fNaming = pComp.hasNaming();
    if (deserializing) {
      this.Clear();
    }
    let pChunk = this;
    let iNr = 0;
    let iCNr = 0;
    const iCount = [this.Count$C4IDList | 0];
    if (!fNaming) {
      pComp.Value$ri32(P(iCount, 0));
    }
    this.Count$C4IDList = $u64n(iCount[0]);
    for (; ; ) {
      if (!deserializing) {
        if (iNr >= this.Count$C4IDList) {
          break;
        }
        if (iCNr >= 5) {
          pChunk = pChunk.pNext;
          iCNr = 0;
        }
      } else {
        if (!fNaming && iNr >= this.Count$C4IDList) {
          break;
        }
        if (iCNr >= 5) {
          pChunk = pChunk.pNext = new C4IDListChunk().init();
          iCNr = 0;
        }
      }
      if (iNr > 0 && !pComp.Separator(2 /*SEP_SEP2*/)) {
        break;
      }
      pComp.Value$StdDefaultAdapt$C4ID$C4ID($.mkDefaultAdapt$rC4ID$C4ID(pChunk.id[iCNr], $.C4ID.None));
      if (pChunk.id[iCNr].op_eq($.C4ID.None)) {
        break;
      }
      if (fValues) {
        if (pComp.Separator(3 /*SEP_SET*/)) {
          pComp.Value$StdDefaultAdapt$i32$i32($.mkDefaultAdapt$ri32$i32(P(pChunk.Count, iCNr), 0));
        }
      } else if (deserializing) {
        pChunk.Count[iCNr] = 0;
      }
      iNr = iNr + 1;
      iCNr = iCNr + 1;
      if (deserializing && fNaming) {
        this.Count$C4IDList = iNr;
      }
    }
  }

  $copy(rCopy) {
    super.init();
    C4IDList.prototype.Default.call(this);
    C4IDList.prototype.$assign.call(this, rCopy);
    return this;
  }
  $clone() { return new C4IDList().$copy(this); }
  $assign(rCopy) {
    this.Clear();
    c$memcpy(this, rCopy, 80);
    let pTo = this;
    for (let pFrom = rCopy.pNext; pFrom != null; pFrom = pFrom.pNext) {
      let pNew = pFrom.$clone();
      pTo.pNext = pNew;
      pTo = pNew;
    }
    pTo.pNext = null;
    return this;
  }
}


export function $init(): void {
  $.C4IDListChunkSize$C4IDList = 5;
}

Object.assign($, { C4IDList, C4IDListChunk });
