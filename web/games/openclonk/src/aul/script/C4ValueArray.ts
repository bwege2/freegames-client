// @ts-nocheck
// OpenClonk 36de799: src/script/C4ValueArray.cpp, src/script/C4ValueArray.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { C4RefCnt } from './C4StringTable.ts';
import { $u64n } from '../../rt/int.ts';
import { c$strcmp } from '../../rt/libc.ts';
import { $oadd, $oarr, $oat, $oidx, $padd, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete, $max, $min, $throw, std_reverse, std_stable_sort } from '../../rt/std.ts';

export class C4SortObjectSTL {
  rSorter = null;

  init(rSorter) {
    this.rSorter = rSorter;
    return this;
  }

  op_call(v1, v2) {
    return this.rSorter.Compare(v1._getObj(), v2._getObj()) > 0;
  }

  $clone() { return new C4SortObjectSTL().$assign(this); }
  $assign(o) {
    this.rSorter = o.rSorter;
    return this;
  }
}

export class C4SortObjectSTLCache {
  rSorter = null;
  pVals = null;

  init(rSorter, pVals) {
    this.rSorter = rSorter;
    this.pVals = pVals;
    return this;
  }

  op_call(n1, n2) {
    return this.rSorter.CompareCache(n1, n2, $oidx(this.pVals, n1)._getObj(), $oidx(this.pVals, n2)._getObj()) > 0;
  }

  $clone() { return new C4SortObjectSTLCache().$assign(this); }
  $assign(o) {
    this.rSorter = o.rSorter;
    this.pVals = o.pVals;
    return this;
  }
}

export class C4ValueArraySortStringscomp {

  op_call(v1, v2) {
    if (v1.getStr() != null && v2.getStr() != null) {
      return c$strcmp(v1._getStr().GetCStr(), v2._getStr().GetCStr()) < 0;
    }
    return v2.getStr() != null;
  }

  $clone() { return new C4ValueArraySortStringscomp().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class C4ValueArraySortcomp {

  op_call(v1, v2) {
    if (v1.getStr() != null && v2.getStr() != null) {
      return v1._getStr().GetData().op_lt(v2._getStr().GetData());
    }
    if (v1.CheckConversion(1 /*C4V_Int*/) && v2.CheckConversion(1 /*C4V_Int*/)) {
      return v1._getInt() < v2._getInt();
    }
    return false;
  }

  $clone() { return new C4ValueArraySortcomp().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class C4ValueArraySortPropertycomp {
  prop_name = null;
  value_sort = new C4ValueArraySortcomp();

  init(prop_name) {
    this.prop_name = prop_name;
    this.value_sort = new C4ValueArraySortcomp();
    return this;
  }

  op_call(v1, v2) {
    let p1 = new $.C4Value().init$v();
    let p2 = new $.C4Value().init$v();
    if (!v1._getPropList().GetPropertyByS(this.prop_name, p1)) {
      p1.Set0();
    }
    if (!v2._getPropList().GetPropertyByS(this.prop_name, p2)) {
      p2.Set0();
    }
    return this.value_sort.op_call(p1, p2);
  }

  $clone() { return new C4ValueArraySortPropertycomp().$assign(this); }
  $assign(o) {
    this.prop_name = o.prop_name;
    this.value_sort.$assign(o.value_sort);
    return this;
  }
}

export class C4ValueArraySortArrayElementcomp {
  element_idx = 0;
  value_sort = new C4ValueArraySortcomp();

  init(element_idx) {
    this.element_idx = element_idx;
    this.value_sort = new C4ValueArraySortcomp();
    return this;
  }

  op_call(v1, v2) {
    return this.value_sort.op_call(v1._getArray().GetItem(this.element_idx), v2._getArray().GetItem(this.element_idx));
  }

  $clone() { return new C4ValueArraySortArrayElementcomp().$assign(this); }
  $assign(o) {
    this.element_idx = o.element_idx;
    this.value_sort.$assign(o.value_sort);
    return this;
  }
}

export class C4ValueArray extends C4RefCnt {
  static MaxSize;
  pData = null;
  iSize = 0;
  iCapacity = 0;
  constant = false;

  init$i32(inSize) {
    this.pData = null;
    this.iSize = 0;
    this.iCapacity = 0;
    this.constant = false;
    this.SetSize(inSize);
    return this;
  }

  $dtor() {
    $delete(this.pData);
    this.pData = null;
    this.iSize = this.iCapacity = 0;
  }

  GetSize() {
    return this.iSize;
  }

  GetItem(iElem) {
    if ((-this.iSize | 0) <= iElem && iElem < 0) {
      return $oidx(this.pData, this.iSize + iElem | 0);
    } else if (0 <= iElem && iElem < this.iSize) {
      return $oidx(this.pData, iElem);
    } else {
      return $.C4VNull;
    }
  }

  _GetItem(iElem) {
    return $oidx(this.pData, iElem);
  }

  op_index$i32$c(iElem) {
    return new $.C4Value().$copy(this.GetItem(iElem));
  }

  op_index$i32(iElem) {
    0;
    0;
    0;
    if (iElem >= this.iSize && iElem < C4ValueArray.MaxSize) {
      this.SetSize(iElem + 1 | 0);
    }
    0;
    return $oidx(this.pData, iElem);
  }

  Reset() {
    $delete(this.pData);
    this.pData = null;
    this.iSize = this.iCapacity = 0;
  }

  SetItem(iElem, Value) {
    0;
    if (iElem < (-this.iSize | 0)) {
      $throw(new $.C4AulExecError().init(S("array access: index out of range")));
    } else if (iElem < 0) {
      iElem = this.iSize + iElem | 0;
    } else if (iElem >= this.iSize && iElem < C4ValueArray.MaxSize) {
      this.SetSize(iElem + 1 | 0);
    }
    if (iElem >= this.iSize) {
      $throw(new $.C4AulExecError().init(S("array access: index too large")));
    }
    $oidx(this.pData, iElem).$assign(Value);
  }

  SetSize(inSize) {
    if (inSize === this.iSize) {
      return;
    }
    0;
    if (inSize <= this.iCapacity) {
      for (let i = inSize; i < this.iSize; i = i + 1 | 0) {
        $oidx(this.pData, i).Set0();
      }
      this.iSize = inSize;
      return;
    }
    if (inSize > C4ValueArray.MaxSize) {
      return;
    }
    let pnData = $oat($oarr($u64n(inSize), () => new $.C4Value().init$v()), 0);
    if (pnData == null) {
      return;
    }
    let i = 0;
    for (i = 0; i < this.iSize; i = i + 1 | 0) {
      $oidx(pnData, i).$assign($oidx(this.pData, i));
    }
    $delete(this.pData);
    this.pData = pnData;
    this.iSize = this.iCapacity = inSize;
  }

  Freeze() {
    this.constant = true;
  }

  Thaw() {
    this.constant = false;
  }

  IsFrozen() {
    return this.constant;
  }

  Denumerate(numbers) {
    for (let i = 0; i < this.iSize; i = i + 1 | 0) {
      $oidx(this.pData, i).Denumerate(numbers);
    }
  }

  op_eq(IntList2) {
    for (let i = 0; i < $max(this.iSize, IntList2.GetSize()); i = i + 1 | 0) {
      if (this.GetItem(i).op_ne(IntList2.GetItem(i))) {
        return false;
      }
    }
    return true;
  }

  CompileFunc(pComp, numbers$) {
    const numbers = [numbers$];
    const inSize = [this.iSize];
    try {
      pComp.Value$ri32(P(inSize, 0));
    } catch ($e1) {
      if ($e1 instanceof $.StdCompiler$NotFoundException) {
        const pExc = $e1;
        this.Reset();
        $delete(pExc);
        return;
      } else {
        throw $e1;
      }
    }
    pComp.Separator(2 /*SEP_SEP2*/);
    if (pComp.isDeserializer()) {
      this.SetSize(inSize[0]);
    }
    pComp.Value$StdArrayDefaultAdapt$C4Value$C4Value$StdParameterAdaptMaker$pC4ValueNumbers($.mkArrayAdaptMap(this.pData, $u64n(this.iSize), new $.C4Value().init$v(), $.mkParAdaptMaker(P(numbers, 0))));
  }

  GetSlice(startIndex, endIndex) {
    if (startIndex > this.iSize) {
      startIndex = this.iSize;
    } else if (startIndex < (-this.iSize | 0)) {
      $throw(new $.C4AulExecError().init(S("array slice: start index out of range")));
    } else if (startIndex < 0) {
      startIndex = startIndex + this.iSize | 0;
    }
    if (endIndex > this.iSize) {
      endIndex = this.iSize;
    } else if (endIndex < (-this.iSize | 0)) {
      $throw(new $.C4AulExecError().init(S("array slice: end index out of range")));
    } else if (endIndex < 0) {
      endIndex = endIndex + this.iSize | 0;
    }
    let NewArray = new C4ValueArray().init$i32($max(0, endIndex - startIndex | 0));
    for (let i = startIndex; i < endIndex; i = i + 1 | 0) {
      $oidx(NewArray.pData, i - startIndex | 0).$assign($oidx(this.pData, i));
    }
    return NewArray;
  }

  SetSlice(startIndex, endIndex, Val) {
    if (startIndex >= C4ValueArray.MaxSize) {
      $throw(new $.C4AulExecError().init(S("array slice: start index exceeds maximum capacity")));
    }
    if (startIndex < 0) {
      startIndex = startIndex + this.iSize | 0;
    }
    if (endIndex < 0) {
      endIndex = endIndex + this.iSize | 0;
    }
    if (startIndex < 0) {
      $throw(new $.C4AulExecError().init(S("array slice: start index out of range")));
    }
    if (endIndex < 0) {
      $throw(new $.C4AulExecError().init(S("array slice: end index out of range")));
    }
    if (endIndex < startIndex) {
      endIndex = startIndex;
    }
    if (Val.GetType() === 5) {
      const Other = Val._getArray();
      let iNewEnd = $min(startIndex + Other.GetSize() | 0, C4ValueArray.MaxSize);
      let iNewSize = iNewEnd;
      if (endIndex < this.iSize) {
        iNewSize = iNewSize + (this.iSize - endIndex | 0) | 0;
      }
      iNewSize = $min(iNewSize, C4ValueArray.MaxSize);
      let iOtherSize = Other.GetSize();
      if (iNewSize !== this.iSize) {
        let i = 0;
        let j = 0;
        let pnData = this.pData;
        if (iNewSize > this.iCapacity) {
          pnData = $oat($oarr($u64n(iNewSize), () => new $.C4Value().init$v()), 0);
          for (i = 0; i < startIndex && i < this.iSize; i = i + 1 | 0) {
            $oidx(pnData, i).$assign($oidx(this.pData, i));
          }
        }
        for (i = iNewEnd, j = endIndex; i < iNewSize; i = i + 1 | 0, j = j + 1 | 0) {
          0;
          $oidx(pnData, i).$assign($oidx(this.pData, j));
        }
        for (i = iNewEnd - 1 | 0, j = (iNewEnd - startIndex | 0) - 1 | 0; i >= startIndex; i = i - 1 | 0, j = j - 1 | 0) {
          0;
          $oidx(pnData, i).$assign($oidx(Other.pData, j));
        }
        if (this.pData !== pnData) {
          $delete(this.pData);
          this.pData = pnData;
          this.iCapacity = this.iSize = iNewSize;
        } else {
          for (i = iNewSize; i < this.iSize; i = i + 1 | 0) {
            $oidx(this.pData, i).Set0();
          }
          this.iSize = iNewSize;
        }
      } else {
        for (let i = startIndex, j = 0; j < iOtherSize; i = i + 1 | 0, j = j + 1 | 0) {
          $oidx(this.pData, i).$assign($oidx(Other.pData, j));
        }
      }
    } else {
      if (endIndex > C4ValueArray.MaxSize) {
        endIndex = this.iSize;
      }
      if (endIndex > this.iSize) {
        this.SetSize(endIndex);
      }
      for (let i = startIndex; i < endIndex; i = i + 1 | 0) {
        $oidx(this.pData, i).$assign(Val);
      }
    }
  }

  Sort$rC4SortObject(rSort) {
    0;
    if (rSort.PrepareCache(this)) {
      let i = 0;
      let pPos = P(new BigInt64Array($u64n(this.iSize)), 0);
      for (i = 0; i < this.iSize; i = i + 1 | 0) {
        pPos.a[pPos.o + i] = i;
      }
      std_stable_sort(pPos, $padd(pPos, this.iSize), new C4SortObjectSTLCache().init(rSort, this.pData));
      for (i = 0; i < this.iSize; i = i + 1 | 0) {
        pPos.a[pPos.o + i] = $oidx(this.pData, pPos.a[pPos.o + i])._getObj();
      }
      for (i = 0; i < this.iSize; i = i + 1 | 0) {
        $oidx(this.pData, i).SetPropList(pPos.a[pPos.o + i]);
      }
      $delete(pPos);
    } else {
      std_stable_sort(this.pData, $oadd(this.pData, this.iSize), new C4SortObjectSTL().init(rSort));
    }
  }

  SortStrings() {
    0;
    std_stable_sort(this.pData, $oadd(this.pData, this.iSize), new C4ValueArraySortStringscomp());
  }

  Sort$b(descending = false) {
    0;
    std_stable_sort(this.pData, $oadd(this.pData, this.iSize), new C4ValueArraySortcomp());
    if (descending) {
      std_reverse(this.pData, $oadd(this.pData, this.iSize));
    }
  }

  SortByProperty(prop_name, descending = false) {
    0;
    for (let i = 0; i < this.iSize; i = i + 1 | 0) {
      if (!($oidx(this.pData, i).getPropList() != null)) {
        return false;
      }
    }
    std_stable_sort(this.pData, $oadd(this.pData, this.iSize), new C4ValueArraySortPropertycomp().init(prop_name));
    if (descending) {
      std_reverse(this.pData, $oadd(this.pData, this.iSize));
    }
    return true;
  }

  SortByArrayElement(element_idx, descending = false) {
    0;
    0;
    for (let i = 0; i < this.iSize; i = i + 1 | 0) {
      if (!($oidx(this.pData, i).getArray() != null)) {
        return false;
      }
      if ($oidx(this.pData, i)._getArray().GetSize() <= element_idx) {
        return false;
      }
    }
    std_stable_sort(this.pData, $oadd(this.pData, this.iSize), new C4ValueArraySortArrayElementcomp().init(element_idx));
    if (descending) {
      std_reverse(this.pData, $oadd(this.pData, this.iSize));
    }
    return true;
  }

  $copy(ValueArray2) {
    this.pData = null;
    this.iSize = 0;
    this.iCapacity = 0;
    this.constant = false;
    this.SetSize(ValueArray2.GetSize());
    for (let i = 0; i < this.iSize; i = i + 1 | 0) {
      $oidx(this.pData, i).Set$C4Value(ValueArray2.GetItem(i));
    }
    return this;
  }
  $clone() { return new C4ValueArray().$copy(this); }
  $assign(ValueArray2) {
    this.SetSize(ValueArray2.GetSize());
    for (let i = 0; i < this.iSize; i = i + 1 | 0) {
      $oidx(this.pData, i).Set$C4Value(ValueArray2.GetItem(i));
    }
    return this;
  }
}

export function $init(): void {
  C4ValueArray.MaxSize = 0xf4240;
}

Object.assign($, { C4SortObjectSTL, C4SortObjectSTLCache, C4ValueArray, C4ValueArraySortArrayElementcomp, C4ValueArraySortPropertycomp, C4ValueArraySortStringscomp, C4ValueArraySortcomp });
