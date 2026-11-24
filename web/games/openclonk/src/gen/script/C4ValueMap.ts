// @ts-nocheck
// OpenClonk 36de799: src/script/C4ValueMap.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $u64n } from '../../rt/int.ts';
import { c$free } from '../../rt/libc.ts';
import { $oadd, $oarr, $oat, $oidx, P } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete, $throw } from '../../rt/std.ts';

export class C4ValueMapData {
  pData = null;
  pNames = null;
  bTempNameList = false;
  pNext = null;

  $dtor() {
    C4ValueMapData.prototype.Reset.call(this);
  }

  op_eq(Data) {
    if (this.pNames !== Data.pNames) {
      return false;
    }
    if (this.pNames != null) {
      for (let i = 0; i < this.pNames.iSize; i = i + 1 | 0) {
        if ($oidx(this.pData, i).op_ne($oidx(Data.pData, i))) {
          return false;
        }
      }
    }
    return true;
  }

  GetItem$pi8(strName) {
    0;
    if (this.pNames == null) {
      return null;
    }
    let iNr = this.pNames.GetItemNr(strName);
    0;
    if (iNr === -1) {
      return null;
    }
    return $oadd(this.pData, iNr);
  }

  GetItem$i32(iNr) {
    0;
    0;
    0;
    if (this.pNames == null) {
      return null;
    }
    if (iNr >= this.pNames.iSize) {
      return null;
    }
    return $oadd(this.pData, iNr);
  }

  SetNameList(pnNames) {
    if (this.pNames === pnNames) {
      return;
    }
    if (this.pNames != null) {
      let pOldNames = this.pNames.pNames;
      let iOldSize = this.pNames.iSize;
      let pNames = this.pNames;
      pNames.UnRegister(this);
      pnNames.Register(this);
      this.OnNameListChanged(pOldNames, iOldSize);
      if (this.bTempNameList) {
        $delete(pNames);
      }
      this.bTempNameList = false;
    } else {
      this.Register(pnNames);
    }
  }

  CreateTempNameList() {
    let pTempNames = new C4ValueMapNames();
    this.Register(pTempNames);
    if (this.pNames !== pTempNames) {
      $delete(pTempNames);
      return null;
    }
    this.bTempNameList = true;
    return pTempNames;
  }

  Reset() {
    if (this.pNames != null) {
      this.UnRegister();
    }
    this.pNames = null;
    $delete(this.pData);
    this.pData = null;
  }

  ResetContent() {
    if (this.pNames != null) {
      this.ReAllocList();
    } else {
      $delete(this.pData);
      this.pData = null;
    }
  }

  GetAnzItems() {
    if (this.pNames == null) {
      return 0;
    }
    return this.pNames.iSize;
  }

  op_index$i32(iNr) {
    return this.GetItem$i32(iNr);
  }

  op_index$pi8(strName) {
    return this.GetItem$pi8(strName);
  }

  Denumerate(numbers) {
    if (this.pNames == null) {
      return;
    }
    for (let i = 0; i < this.pNames.iSize; i = i + 1 | 0) {
      $oidx(this.pData, i).Denumerate(numbers);
    }
  }

  CompileFunc(pComp, numbers$) {
    const numbers = [numbers$];
    let deserializing = pComp.isDeserializer();
    let pOldNames = this.pNames;
    if (deserializing) {
      this.Reset();
    }
    const iValueCnt = [0];
    if (!deserializing) {
      iValueCnt[0] = this.pNames != null ? this.pNames.iSize : 0;
    }
    pComp.Value$StdDefaultAdapt$i32$i32($.mkDefaultAdapt$ri32$i32(P(iValueCnt, 0), 0));
    if (iValueCnt[0] === 0) {
      return;
    }
    pComp.Separator(2 /*SEP_SEP2*/);
    let ppNames = !deserializing ? this.pNames.pNames : P(new Array($u64n(iValueCnt[0])).fill(null), 0);
    if (deserializing) {
      for (let i = 0; i < iValueCnt[0]; i = i + 1 | 0) {
        ppNames.a[ppNames.o + i] = null;
      }
    }
    let pValues = !deserializing ? this.pData : $oat($oarr($u64n(iValueCnt[0]), () => new $.C4Value().init$v()), 0);
    try {
      for (let i$2 = 0; i$2 < iValueCnt[0]; i$2 = i$2 + 1 | 0) {
        if (i$2 !== 0) {
          pComp.Separator();
        }
        let Name = new $.StdStrBuf();
        if (!deserializing) {
          Name.Ref$pi8(ppNames.a[ppNames.o + i$2]);
        }
        pComp.Value$StdParameterAdapt$StdStrBuf$i32$2($.mkParAdapt$rStdStrBuf$mi32(Name, 2 /*RCT_Idtf*/));
        if (deserializing) {
          ppNames.a[ppNames.o + i$2] = Name.GrabPointer();
        }
        pComp.Separator(3 /*SEP_SET*/);
        pComp.Value$StdParameterAdapt$C4Value$pC4ValueNumbers($.mkParAdapt$rC4Value$rpC4ValueNumbers($oidx(pValues, i$2), P(numbers, 0)));
      }
    } catch ($e1) {
      {
        if (deserializing) {
          for (let i$2 = 0; i$2 < iValueCnt[0]; i$2 = i$2 + 1 | 0) {
            if (ppNames.a[ppNames.o + i$2] != null) {
              c$free(ppNames.a[ppNames.o + i$2]);
            }
          }
          $delete(ppNames);
          $delete(pValues);
        }
        $throw($e1);
      }
    }
    if (deserializing) {
      this.CreateTempNameList();
      this.pNames.SetNameArray(ppNames, iValueCnt[0]);
      for (let i$2 = 0; i$2 < iValueCnt[0]; i$2 = i$2 + 1 | 0) {
        c$free(ppNames.a[ppNames.o + i$2]);
      }
      $delete(ppNames);
      $delete(this.pData);
      this.pData = pValues;
      if (pOldNames != null) {
        this.SetNameList(pOldNames);
      }
    }
  }

  Register(pnNames) {
    if (this.pNames != null) {
      this.UnRegister();
    }
    if (pnNames != null) {
      pnNames.Register(this);
    }
    this.pNames = pnNames;
    this.ReAllocList();
  }

  UnRegister() {
    if (this.pNames == null) {
      return;
    }
    let pNames = this.pNames;
    pNames.UnRegister(this);
    if (this.bTempNameList) {
      $delete(pNames);
    }
    this.bTempNameList = false;
    $delete(this.pData);
    this.pData = null;
  }

  OnNameListChanged(pOldNames, iOldSize) {
    if (this.pNames == null) {
      this.Reset();
      return;
    }
    let pOldData = this.pData;
    this.pData = $oat($oarr($u64n(this.pNames.iSize), () => new $.C4Value().init$v()), 0);
    let i = 0;
    let j = 0;
    for (i = 0; i < iOldSize; i = i + 1 | 0) {
      if (i < this.pNames.iSize && $.SEqual(this.pNames.pNames.a[this.pNames.pNames.o + i], pOldNames.a[pOldNames.o + i])) {
        $oidx(this.pData, i).$assign($oidx(pOldData, i));
      } else {
        for (j = 0; j < this.pNames.iSize; j = j + 1 | 0) {
          if ($.SEqual(this.pNames.pNames.a[this.pNames.pNames.o + j], pOldNames.a[pOldNames.o + i])) {
            $oidx(this.pData, j).$assign($oidx(pOldData, i));
            break;
          }
        }
      }
    }
    $delete(pOldData);
  }

  ReAllocList() {
    if (this.pNames == null) {
      this.Reset();
      return;
    }
    $delete(this.pData);
    this.pData = $oat($oarr($u64n(this.pNames.iSize), () => new $.C4Value().init$v()), 0);
  }

  $copy(DataToCopy) {
    this.pData = null;
    this.pNames = null;
    this.bTempNameList = false;
    this.pNext = null;
    C4ValueMapData.prototype.SetNameList.call(this, DataToCopy.pNames);
    if (this.pNames != null) {
      for (let i = 0; i < this.pNames.iSize; i = i + 1 | 0) {
        $oidx(this.pData, i).Set$C4Value($oidx(DataToCopy.pData, i));
      }
    }
    return this;
  }
  $clone() { return new C4ValueMapData().$copy(this); }
  $assign(DataToCopy) {
    this.SetNameList(DataToCopy.pNames);
    if (this.pNames != null) {
      for (let i = 0; i < this.pNames.iSize; i = i + 1 | 0) {
        $oidx(this.pData, i).Set$C4Value($oidx(DataToCopy.pData, i));
      }
    }
    return this;
  }
}

export class C4ValueMapNames {
  pNames = null;
  iSize = 0;
  pFirst = null;

  $dtor() {
    C4ValueMapNames.prototype.Reset.call(this);
  }

  SetNameArray(pnNames, nSize) {
    this.ChangeNameList(pnNames, nSize);
  }

  AddName(pnName) {
    let iNr = 0;
    if ((iNr = this.GetItemNr(pnName)) !== -1) {
      return iNr;
    }
    let pDummyNames = P(new Array($u64n(this.iSize + 1 | 0)).fill(null), 0);
    let i = 0;
    for (i = 0; i < this.iSize; i = i + 1 | 0) {
      pDummyNames.a[pDummyNames.o + i] = this.pNames.a[this.pNames.o + i];
    }
    pDummyNames.a[pDummyNames.o + i] = pnName;
    this.ChangeNameList(pDummyNames, this.iSize + 1 | 0);
    $delete(pDummyNames);
    return this.iSize - 1 | 0;
  }

  GetItemNr(strName) {
    for (let i = 0; i < this.iSize; i = i + 1 | 0) {
      if ($.SEqual(this.pNames.a[this.pNames.o + i], strName)) {
        return i;
      }
    }
    return -1;
  }

  GetItemUnsafe(idx) {
    return this.pNames.a[this.pNames.o + idx];
  }

  Reset() {
    while (this.pFirst != null) {
      this.UnRegister(this.pFirst);
    }
    for (let i = 0; i < this.iSize; i = i + 1 | 0) {
      $delete(this.pNames.a[this.pNames.o + i]);
    }
    $delete(this.pNames);
    this.pNames = null;
    this.iSize = 0;
  }

  Register(pData) {
    pData.pNext = this.pFirst;
    this.pFirst = pData;
    pData.pNames = this;
  }

  UnRegister(pData) {
    let pAktData = this.pFirst;
    let pLastData = null;
    while (pAktData != null && pAktData !== pData) {
      pLastData = pAktData;
      pAktData = pAktData.pNext;
    }
    if (pAktData == null) {
      return;
    }
    if (pLastData != null) {
      pLastData.pNext = pData.pNext;
    } else {
      this.pFirst = pData.pNext;
    }
    pData.pNext = null;
    pData.pNames = null;
  }

  ChangeNameList(pnNames, nSize) {
    let pOldNames = this.pNames;
    let iOldSize = this.iSize;
    this.pNames = P(new Array($u64n(nSize)).fill(null), 0);
    let i = 0;
    for (i = 0; i < nSize; i = i + 1 | 0) {
      this.pNames.a[this.pNames.o + i] = P(new Int8Array($.SLen(pnNames.a[pnNames.o + i]) + 1), 0);
      $.SCopy$pi8$pi8$u64(pnNames.a[pnNames.o + i], this.pNames.a[this.pNames.o + i], $.SLen(pnNames.a[pnNames.o + i]) + 1);
    }
    this.iSize = nSize;
    let pAktData = this.pFirst;
    while (pAktData != null) {
      pAktData.OnNameListChanged(pOldNames, iOldSize);
      pAktData = pAktData.pNext;
    }
    for (i = 0; i < iOldSize; i = i + 1 | 0) {
      $delete(pOldNames.a[pOldNames.o + i]);
    }
    $delete(pOldNames);
  }

  $copy(NamesToCopy) {
    this.pNames = null;
    this.iSize = 0;
    this.pFirst = null;
    C4ValueMapNames.prototype.ChangeNameList.call(this, NamesToCopy.pNames, NamesToCopy.iSize);
    return this;
  }
  $clone() { return new C4ValueMapNames().$copy(this); }
  $assign(NamesToCopy) {
    this.ChangeNameList(NamesToCopy.pNames, NamesToCopy.iSize);
    return this;
  }
}

export function $init(): void {
}

Object.assign($, { C4ValueMapData, C4ValueMapNames });
