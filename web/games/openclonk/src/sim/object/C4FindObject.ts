// @ts-nocheck
// OpenClonk 36de799: src/object/C4FindObject.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $u64n } from '../../rt/int.ts';
import { Random } from '../../rt/native.ts';
import { P } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete } from '../../rt/std.ts';

export class C4FindObject {
  pSort = null;

  $dtor() {
    $delete(this.pSort);
  }

  static CreateByValue(DataVal, ppSortObj = null, context = null, has_layer_check = null) {
    let $t1;
    let pArray = new $.C4Value().$copy(DataVal).getArray();
    if (pArray == null) {
      return null;
    }
    const Data = pArray;
    let iType = Data.op_index$i32$c(0).getInt();
    if ($.Inside$i32$i32$i32$2(iType, 30 /*C4SO_First*/, 50 /*C4SO_Last*/)) {
      if (ppSortObj == null) {
        return null;
      }
      ppSortObj.a[ppSortObj.o] = C4SortObject.CreateByValue$i32$C4ValueArray$pC4Object(iType, Data, context);
      return null;
    }
    switch (iType) {
      case 1:
        {
          let pCond = C4FindObject.CreateByValue(Data.op_index$i32$c(1), null, context, has_layer_check);
          if (pCond == null) {
            return null;
          }
          return new C4FindObjectNot().init(pCond);
        }
      case 2:
      case 3:
        {
          if (Data.GetSize() === 2) {
            return C4FindObject.CreateByValue(Data.op_index$i32$c(1), null, context, has_layer_check);
          }
          let i = 0;
          let ppConds = P(new Array($u64n(Data.GetSize() - 1 | 0)).fill(null), 0);
          for (i = 0; i < (Data.GetSize() - 1 | 0); i = i + 1 | 0) {
            ppConds.a[ppConds.o + i] = C4FindObject.CreateByValue(Data.op_index$i32$c(i + 1 | 0), null, context, has_layer_check);
          }
          let iSize = 0;
          for (i = 0; i < (Data.GetSize() - 1 | 0); i = i + 1 | 0) {
            if (ppConds.a[ppConds.o + i] != null) {
              if (($t1 = iSize, iSize = iSize + 1 | 0, $t1) !== i) {
                ppConds.a[ppConds.o + (iSize - 1 | 0)] = ppConds.a[ppConds.o + i];
              }
            }
          }
          if (iType === 2) {
            return new C4FindObjectAnd().init(iSize, ppConds);
          } else {
            return new C4FindObjectOr().init(iSize, ppConds);
          }
        }
      case 4:
        {
          let obj = Data.op_index$i32$c(1).getObj();
          if (obj == null) {
            return null;
          }
          return new C4FindObjectExclude().init(obj);
        }
      case 10:
        return new C4FindObjectDef().init(Data.op_index$i32$c(1).getPropList());
      case 5:
        {
          let x = Data.op_index$i32$c(1).getInt();
          let y = Data.op_index$i32$c(2).getInt();
          let w = Data.op_index$i32$c(3).getInt();
          let h = Data.op_index$i32$c(4).getInt();
          if (context != null) {
            x = x + context.GetX() | 0;
            y = y + context.GetY() | 0;
          }
          return new C4FindObjectInRect().init(new $.C4Rect().init$i32$i32$i32$i32(x, y, w, h));
        }
      case 6:
        {
          let x = Data.op_index$i32$c(1).getInt();
          let y = Data.op_index$i32$c(2).getInt();
          if (context != null) {
            x = x + context.GetX() | 0;
            y = y + context.GetY() | 0;
          }
          return new C4FindObjectAtPoint().init(x, y);
        }
      case 7:
        {
          let x = Data.op_index$i32$c(1).getInt();
          let y = Data.op_index$i32$c(2).getInt();
          let w = Data.op_index$i32$c(3).getInt();
          let h = Data.op_index$i32$c(4).getInt();
          if (context != null) {
            x = x + context.GetX() | 0;
            y = y + context.GetY() | 0;
          }
          return new C4FindObjectAtRect().init(x, y, w, h);
        }
      case 8:
        {
          let x1 = Data.op_index$i32$c(1).getInt();
          let y1 = Data.op_index$i32$c(2).getInt();
          let x2 = Data.op_index$i32$c(3).getInt();
          let y2 = Data.op_index$i32$c(4).getInt();
          if (context != null) {
            x1 = x1 + context.GetX() | 0;
            x2 = x2 + context.GetX() | 0;
            y1 = y1 + context.GetY() | 0;
            y2 = y2 + context.GetY() | 0;
          }
          return new C4FindObjectOnLine().init(x1, y1, x2, y2);
        }
      case 9:
        {
          let x = Data.op_index$i32$c(1).getInt();
          let y = Data.op_index$i32$c(2).getInt();
          if (context != null) {
            x = x + context.GetX() | 0;
            y = y + context.GetY() | 0;
          }
          return new C4FindObjectDistance().init(x, y, Data.op_index$i32$c(3).getInt());
        }
      case 25:
        {
          let x = Data.op_index$i32$c(1).getInt();
          let y = Data.op_index$i32$c(2).getInt();
          if (context != null) {
            x = x + context.GetX() | 0;
            y = y + context.GetY() | 0;
          }
          return new C4FindObjectCone().init(x, y, Data.op_index$i32$c(3).getInt(), Data.op_index$i32$c(4).getInt(), Data.op_index$i32$c(5).getInt(), Data.op_index$i32$c(6).getInt());
        }
      case 11:
        return new C4FindObjectOCF().init(Data.op_index$i32$c(1).getInt());
      case 12:
        return new C4FindObjectCategory().init(Data.op_index$i32$c(1).getInt());
      case 13:
        {
          let pStr = Data.op_index$i32$c(1).getStr();
          if (pStr == null) {
            return null;
          }
          return new C4FindObjectAction().init(pStr.GetCStr());
        }
      case 20:
        {
          let pStr = Data.op_index$i32$c(1).getStr();
          if (pStr == null) {
            return null;
          }
          let pFO = new C4FindObjectFunc().init(pStr);
          for (let i = 2; i < Data.GetSize(); i = i + 1 | 0) {
            pFO.SetPar(i - 2 | 0, Data.op_index$i32$c(i));
          }
          return pFO;
        }
      case 14:
        {
          let index = 0;
          if (Data.GetSize() >= 3) {
            index = $.Clamp$i32$i32$i32(Data.op_index$i32$c(2).getInt(), 0, 1);
          }
          return new C4FindObjectActionTarget().init(Data.op_index$i32$c(1).getObj(), index);
        }
      case 15:
        return new C4FindObjectProcedure().init(Data.op_index$i32$c(1).getStr());
      case 16:
        return new C4FindObjectContainer().init(Data.op_index$i32$c(1).getObj());
      case 17:
        return new C4FindObjectAnyContainer();
      case 18:
        return new C4FindObjectOwner().init(Data.op_index$i32$c(1).getInt());
      case 19:
        return new C4FindObjectController().init(Data.op_index$i32$c(1).getInt());
      case 21:
        if (has_layer_check != null) {
          has_layer_check.a[has_layer_check.o] = true;
        }
        return new C4FindObjectLayer().init(Data.op_index$i32$c(1).getObj());
      case 22:
        return new C4FindObjectInArray().init(Data.op_index$i32$c(1).getArray());
      case 23:
        {
          let pStr = Data.op_index$i32$c(1).getStr();
          if (pStr == null) {
            return null;
          }
          let pFO = Data.GetSize() >= 3 ? new C4FindObjectProperty().init$pC4String$C4Value(pStr, Data.op_index$i32$c(2)) : new C4FindObjectProperty().init$pC4String(pStr);
          return pFO;
        }
      case 24:
        if (has_layer_check != null) {
          has_layer_check.a[has_layer_check.o] = true;
        }
        return null;
    }
    return null;
  }

  Count$C4ObjectList(Objs) {
    let $t1, $t2, $t3;
    if (this.IsImpossible()) {
      return 0;
    }
    if (this.IsEnsured()) {
      return Objs.ObjectCount();
    }
    let iCount = 0;
    $t1 = Objs;
    $t2 = $t1.begin();
    $t3 = $t1.end();
    try {
      for (; $t2.op_ne($t3); $t2.op_inc$v()) {
        const obj = $t2.op_mul();
        if (obj.Status !== 0 && this.Check(obj)) {
          iCount = iCount + 1 | 0;
        }
      }
    } finally { $t2.$dtor(); $t3.$dtor(); }
    return iCount;
  }

  Find$C4ObjectList(Objs) {
    let $t1, $t2, $t3;
    if (this.IsImpossible()) {
      return null;
    }
    let pBestResult = null;
    $t1 = Objs;
    $t2 = $t1.begin();
    $t3 = $t1.end();
    try {
      for (; $t2.op_ne($t3); $t2.op_inc$v()) {
        const obj = $t2.op_mul();
        if (obj.Status !== 0) {
          if (this.Check(obj)) {
            if (obj.Status !== 0) {
              if (this.pSort == null) {
                return obj;
              }
              if (pBestResult == null || this.pSort.Compare(obj, pBestResult) > 0) {
                if (obj.Status !== 0) {
                  pBestResult = obj;
                }
              }
            }
          }
        }
      }
    } finally { $t2.$dtor(); $t3.$dtor(); }
    return pBestResult;
  }

  FindMany$C4ObjectList(Objs) {
    let $t1, $t2, $t3, $t4;
    if (this.IsImpossible()) {
      return new $.C4ValueArray();
    }
    let pArray = new $.C4ValueArray().init$i32(32);
    let iSize = 0;
    $t1 = Objs;
    $t2 = $t1.begin();
    $t3 = $t1.end();
    try {
      for (; $t2.op_ne($t3); $t2.op_inc$v()) {
        const obj = $t2.op_mul();
        if (obj.Status !== 0) {
          if (this.Check(obj)) {
            if (iSize >= pArray.GetSize()) {
              pArray.SetSize(Math.imul(iSize, 2));
            }
            pArray.op_index$i32(($t4 = iSize, iSize = iSize + 1 | 0, $t4)).$assign($.C4VObj(obj));
          }
        }
      }
    } finally { $t2.$dtor(); $t3.$dtor(); }
    pArray.SetSize(iSize);
    this.CheckObjectStatus(pArray);
    if (this.pSort != null) {
      this.pSort.SortObjects(pArray);
    }
    return pArray;
  }

  Count$C4ObjectList$C4LSectors(Objs, _Sct) {
    let $t1, $t2, $t3;
    if (this.IsImpossible()) {
      return 0;
    }
    if (this.IsEnsured()) {
      return Objs.ObjectCount();
    }
    let pBounds = this.GetBounds();
    if (pBounds == null) {
      return this.Count$C4ObjectList(Objs);
    } else if (this.UseShapes()) {
      let Area = new $.C4LArea().init$pC4LSectors$C4Rect($.Objects.Sectors, pBounds);
      const pSct = [null];
      let pLst = Area.FirstObjectShapes(P(pSct, 0));
      if (!(Area.Next(pSct[0]) != null)) {
        return this.Count$C4ObjectList(pSct[0].ObjectShapes);
      }
      let iMarker = $.Objects.GetNextMarker();
      let iCount = 0;
      for (; pLst != null; pLst = Area.NextObjectShapes(pLst, P(pSct, 0))) {
        $t1 = Objs;
        $t2 = $t1.begin();
        $t3 = $t1.end();
        try {
          for (; $t2.op_ne($t3); $t2.op_inc$v()) {
            const obj = $t2.op_mul();
            if (obj.Status !== 0) {
              if (obj.Marker !== iMarker) {
                obj.Marker = iMarker;
                if (this.Check(obj)) {
                  iCount = iCount + 1 | 0;
                }
              }
            }
          }
        } finally { $t2.$dtor(); $t3.$dtor(); }
      }
      return iCount;
    } else {
      let Area = new $.C4LArea().init$pC4LSectors$C4Rect($.Objects.Sectors, pBounds);
      const pSct = [null];
      let iCount = 0;
      for (let pLst = Area.FirstObjects(P(pSct, 0)); pLst != null; pLst = Area.NextObjects(pLst, P(pSct, 0))) {
        iCount = iCount + this.Count$C4ObjectList(pLst) | 0;
      }
      return iCount;
    }
  }

  Find$C4ObjectList$C4LSectors(Objs, _Sct) {
    if (this.IsImpossible()) {
      return null;
    }
    let pBestResult = null;
    let pBounds = this.GetBounds();
    if (pBounds == null) {
      return this.Find$C4ObjectList(Objs);
    } else if (this.UseShapes()) {
      let Area = new $.C4LArea().init$pC4LSectors$C4Rect($.Objects.Sectors, pBounds);
      const pSct = [null];
      let pObj = null;
      for (let pLst = Area.FirstObjectShapes(P(pSct, 0)); pLst != null; pLst = Area.NextObjectShapes(pLst, P(pSct, 0))) {
        if ((pObj = this.Find$C4ObjectList(pLst)) != null) {
          if (this.pSort == null) {
            return pObj;
          } else if (pBestResult == null || this.pSort.Compare(pObj, pBestResult) > 0) {
            if (pObj.Status !== 0) {
              pBestResult = pObj;
            }
          }
        }
      }
    } else {
      let Area = new $.C4LArea().init$pC4LSectors$C4Rect($.Objects.Sectors, pBounds);
      const pSct = [null];
      let pObj = null;
      for (let pLst = Area.FirstObjects(P(pSct, 0)); pLst != null; pLst = Area.NextObjects(pLst, P(pSct, 0))) {
        if ((pObj = this.Find$C4ObjectList(pLst)) != null) {
          if (this.pSort == null) {
            return pObj;
          } else if (pBestResult == null || this.pSort.Compare(pObj, pBestResult) > 0) {
            if (pObj.Status !== 0) {
              pBestResult = pObj;
            }
          }
        }
      }
    }
    return pBestResult;
  }

  FindMany$C4ObjectList$C4LSectors(Objs, _Sct) {
    let $t1, $t2, $t3, $t4, $t5, $t6, $t7, $t8;
    if (this.IsImpossible()) {
      return new $.C4ValueArray();
    }
    let pBounds = this.GetBounds();
    if (pBounds == null) {
      return this.FindMany$C4ObjectList(Objs);
    }
    let pArray = null;
    let iSize = 0;
    if (this.UseShapes()) {
      let Area = new $.C4LArea().init$pC4LSectors$C4Rect($.Objects.Sectors, pBounds);
      const pSct = [null];
      let pLst = Area.FirstObjectShapes(P(pSct, 0));
      if (!(Area.Next(pSct[0]) != null)) {
        return this.FindMany$C4ObjectList(pSct[0].ObjectShapes);
      }
      pArray = new $.C4ValueArray().init$i32(32);
      iSize = 0;
      let iMarker = $.Objects.GetNextMarker();
      for (; pLst != null; pLst = Area.NextObjectShapes(pLst, P(pSct, 0))) {
        $t1 = pLst;
        $t2 = $t1.begin();
        $t3 = $t1.end();
        try {
          for (; $t2.op_ne($t3); $t2.op_inc$v()) {
            const obj = $t2.op_mul();
            if (obj.Status !== 0) {
              if (obj.Marker !== iMarker) {
                obj.Marker = iMarker;
                if (this.Check(obj)) {
                  if (iSize >= pArray.GetSize()) {
                    pArray.SetSize(Math.imul(iSize, 2));
                  }
                  pArray.op_index$i32(($t4 = iSize, iSize = iSize + 1 | 0, $t4)).$assign($.C4VObj(obj));
                }
              }
            }
          }
        } finally { $t2.$dtor(); $t3.$dtor(); }
      }
    } else {
      pArray = new $.C4ValueArray().init$i32(32);
      iSize = 0;
      let Area = new $.C4LArea().init$pC4LSectors$C4Rect($.Objects.Sectors, pBounds);
      const pSct = [null];
      for (let pLst = Area.FirstObjects(P(pSct, 0)); pLst != null; pLst = Area.NextObjects(pLst, P(pSct, 0))) {
        $t5 = pLst;
        $t6 = $t5.begin();
        $t7 = $t5.end();
        try {
          for (; $t6.op_ne($t7); $t6.op_inc$v()) {
            const obj = $t6.op_mul();
            if (obj.Status !== 0) {
              if (this.Check(obj)) {
                if (iSize >= pArray.GetSize()) {
                  pArray.SetSize(Math.imul(iSize, 2));
                }
                pArray.op_index$i32(($t8 = iSize, iSize = iSize + 1 | 0, $t8)).$assign($.C4VObj(obj));
              }
            }
          }
        } finally { $t6.$dtor(); $t7.$dtor(); }
      }
    }
    pArray.SetSize(iSize);
    this.CheckObjectStatus(pArray);
    if (this.pSort != null) {
      this.pSort.SortObjects(pArray);
    }
    return pArray;
  }

  SetSort(pToSort) {
    $delete(this.pSort);
    this.pSort = pToSort;
  }

  GetBounds() {
    return null;
  }

  UseShapes() {
    return false;
  }

  IsImpossible() {
    return false;
  }

  IsEnsured() {
    return false;
  }

  CheckObjectStatus(pArray) {
    let $t1;
    for (let i = 0; i < pArray.GetSize(); i = i + 1 | 0) {
      if (!(pArray.GetItem(i).getObj().Status !== 0)) {
        let j = i;
        i = i + 1 | 0;
        for (; i < pArray.GetSize(); i = i + 1 | 0) {
          if (pArray.GetItem(i).getObj().Status !== 0) {
            pArray.op_index$i32(($t1 = j, j = j + 1 | 0, $t1)).$assign(pArray.GetItem(i));
          }
        }
        pArray.SetSize(j);
        break;
      }
    }
  }

  $clone() { return new C4FindObject().$assign(this); }
  $assign(o) {
    this.pSort = o.pSort;
    return this;
  }
}

export class C4SortObject {

  PrepareCache(_pObjs) {
    return false;
  }

  CompareCache(_iObj1, _iObj2, pObj1, pObj2) {
    return this.Compare(pObj1, pObj2);
  }

  static CreateByValue$C4Value$pC4Object(DataVal, context = null) {
    let pArray = new $.C4Value().$copy(DataVal).getArray();
    if (pArray == null) {
      return null;
    }
    const Data = pArray;
    let iType = Data.op_index$i32$c(0).getInt();
    return C4SortObject.CreateByValue$i32$C4ValueArray$pC4Object(iType, Data, context);
  }

  static CreateByValue$i32$C4ValueArray$pC4Object(iType, Data, context = null) {
    let $t1;
    switch (iType) {
      case 31:
        {
          let pChildSort = C4SortObject.CreateByValue$C4Value$pC4Object(Data.op_index$i32$c(1), context);
          if (pChildSort == null) {
            return null;
          }
          return new C4SortObjectReverse().init(pChildSort);
        }
      case 32:
        {
          if (Data.GetSize() === 2) {
            return C4SortObject.CreateByValue$C4Value$pC4Object(Data.op_index$i32$c(1), context);
          }
          let i = 0;
          let ppSorts = P(new Array($u64n(Data.GetSize() - 1 | 0)).fill(null), 0);
          for (i = 0; i < (Data.GetSize() - 1 | 0); i = i + 1 | 0) {
            ppSorts.a[ppSorts.o + i] = C4SortObject.CreateByValue$C4Value$pC4Object(Data.op_index$i32$c(i + 1 | 0), context);
          }
          let iSize = 0;
          for (i = 0; i < (Data.GetSize() - 1 | 0); i = i + 1 | 0) {
            if (ppSorts.a[ppSorts.o + i] != null) {
              if (($t1 = iSize, iSize = iSize + 1 | 0, $t1) !== i) {
                ppSorts.a[ppSorts.o + (iSize - 1 | 0)] = ppSorts.a[ppSorts.o + i];
              }
            }
          }
          return new C4SortObjectMultiple().init(iSize, ppSorts);
        }
      case 33:
        {
          let x = Data.op_index$i32$c(1).getInt();
          let y = Data.op_index$i32$c(2).getInt();
          if (context != null) {
            x = x + context.GetX() | 0;
            y = y + context.GetY() | 0;
          }
          return new C4SortObjectDistance().init(x, y);
        }
      case 34:
        return new C4SortObjectRandom().init();
      case 35:
        return new C4SortObjectSpeed().init();
      case 36:
        return new C4SortObjectMass().init();
      case 37:
        return new C4SortObjectValue().init();
      case 38:
        {
          let pStr = Data.op_index$i32$c(1).getStr();
          if (pStr == null) {
            return null;
          }
          let pSO = new C4SortObjectFunc().init(pStr);
          for (let i = 2; i < Data.GetSize(); i = i + 1 | 0) {
            pSO.SetPar(i - 2 | 0, Data.op_index$i32$c(i));
          }
          return pSO;
        }
    }
    return null;
  }

  SortObjects(pArray) {
    pArray.Sort$rC4SortObject(this);
  }

  $clone() { return new C4SortObject().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class C4FindObjectNot extends C4FindObject {
  pCond = null;

  init(pCond) {
    this.pCond = pCond;
    return this;
  }

  $dtor() {
    $delete(this.pCond);
    super.$dtor();
  }

  Check(pObj) {
    return !this.pCond.Check(pObj);
  }

  IsImpossible() {
    return this.pCond.IsEnsured();
  }

  IsEnsured() {
    return this.pCond.IsImpossible();
  }

  $clone() { return new C4FindObjectNot().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pCond = o.pCond;
    return this;
  }
}

export class C4FindObjectAnd extends C4FindObject {
  iCnt = 0;
  ppConds = null;
  fFreeArray = false;
  fUseShapes = false;
  Bounds = new $.C4Rect();
  fHasBounds = false;

  init(inCnt, ppConds, fFreeArray = true) {
    this.iCnt = inCnt;
    this.ppConds = ppConds;
    this.fFreeArray = fFreeArray;
    this.fUseShapes = false;
    this.Bounds = new $.C4Rect();
    this.fHasBounds = false;
    let i = 0;
    for (i = 0; i < this.iCnt; ) {
      if (ppConds.a[ppConds.o + i].IsEnsured()) {
        $delete(ppConds.a[ppConds.o + i]);
        this.iCnt = this.iCnt - 1 | 0;
        for (let j = i; j < this.iCnt; j = j + 1 | 0) {
          ppConds.a[ppConds.o + j] = ppConds.a[ppConds.o + (j + 1 | 0)];
        }
      } else {
        i = i + 1 | 0;
      }
    }
    for (i = 0; i < this.iCnt; i = i + 1 | 0) {
      let pChildBounds = ppConds.a[ppConds.o + i].GetBounds();
      if (pChildBounds != null) {
        if (!this.fHasBounds) {
          this.fUseShapes = ppConds.a[ppConds.o + i].UseShapes();
          this.Bounds.$assign(pChildBounds);
          this.fHasBounds = true;
        } else if ((this.fUseShapes ? 1 : 0) === (ppConds.a[ppConds.o + i].UseShapes() ? 1 : 0)) {
          this.Bounds.Intersect(pChildBounds);
        }
      }
    }
    return this;
  }

  $dtor() {
    for (let i = 0; i < this.iCnt; i = i + 1 | 0) {
      $delete(this.ppConds.a[this.ppConds.o + i]);
    }
    if (this.fFreeArray) {
      $delete(this.ppConds);
    }
    super.$dtor();
  }

  Check(pObj) {
    for (let i = 0; i < this.iCnt; i = i + 1 | 0) {
      if (!this.ppConds.a[this.ppConds.o + i].Check(pObj)) {
        return false;
      }
    }
    return true;
  }

  GetBounds() {
    return this.fHasBounds ? this.Bounds : null;
  }

  UseShapes() {
    return this.fUseShapes;
  }

  IsEnsured() {
    return this.iCnt === 0;
  }

  IsImpossible() {
    for (let i = 0; i < this.iCnt; i = i + 1 | 0) {
      if (this.ppConds.a[this.ppConds.o + i].IsImpossible()) {
        return true;
      }
    }
    return false;
  }

  ForgetConditions() {
    this.ppConds = null;
    this.iCnt = 0;
  }

  $clone() { return new C4FindObjectAnd().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.iCnt = o.iCnt;
    this.ppConds = o.ppConds;
    this.fFreeArray = o.fFreeArray;
    this.fUseShapes = o.fUseShapes;
    this.Bounds.$assign(o.Bounds);
    this.fHasBounds = o.fHasBounds;
    return this;
  }
}

export class C4FindObjectOr extends C4FindObject {
  iCnt = 0;
  ppConds = null;
  fUseShapes = false;
  Bounds = new $.C4Rect();
  fHasBounds = false;

  init(inCnt, ppConds) {
    this.iCnt = inCnt;
    this.ppConds = ppConds;
    this.Bounds = new $.C4Rect();
    this.fHasBounds = false;
    let i = 0;
    for (i = 0; i < this.iCnt; ) {
      if (ppConds.a[ppConds.o + i].IsImpossible()) {
        $delete(ppConds.a[ppConds.o + i]);
        this.iCnt = this.iCnt - 1 | 0;
        for (let j = i; j < this.iCnt; j = j + 1 | 0) {
          ppConds.a[ppConds.o + j] = ppConds.a[ppConds.o + (j + 1 | 0)];
        }
      } else {
        i = i + 1 | 0;
      }
    }
    for (i = 0; i < this.iCnt; i = i + 1 | 0) {
      let pChildBounds = ppConds.a[ppConds.o + i].GetBounds();
      if (pChildBounds == null) {
        this.fHasBounds = false;
        break;
      }
      if (this.fHasBounds && (this.fUseShapes ? 1 : 0) !== (ppConds.a[ppConds.o + i].UseShapes() ? 1 : 0)) {
        this.fHasBounds = false;
        break;
      }
      if (this.fHasBounds) {
        this.Bounds.Add(pChildBounds);
      } else {
        this.fUseShapes = ppConds.a[ppConds.o + i].UseShapes();
        this.Bounds.$assign(pChildBounds);
        this.fHasBounds = true;
      }
    }
    return this;
  }

  $dtor() {
    for (let i = 0; i < this.iCnt; i = i + 1 | 0) {
      $delete(this.ppConds.a[this.ppConds.o + i]);
    }
    $delete(this.ppConds);
    super.$dtor();
  }

  Check(pObj) {
    for (let i = 0; i < this.iCnt; i = i + 1 | 0) {
      if (this.ppConds.a[this.ppConds.o + i].Check(pObj)) {
        return true;
      }
    }
    return false;
  }

  GetBounds() {
    return this.fHasBounds ? this.Bounds : null;
  }

  UseShapes() {
    return this.fUseShapes;
  }

  IsEnsured() {
    for (let i = 0; i < this.iCnt; i = i + 1 | 0) {
      if (this.ppConds.a[this.ppConds.o + i].IsEnsured()) {
        return true;
      }
    }
    return false;
  }

  IsImpossible() {
    return this.iCnt === 0;
  }

  $clone() { return new C4FindObjectOr().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.iCnt = o.iCnt;
    this.ppConds = o.ppConds;
    this.fUseShapes = o.fUseShapes;
    this.Bounds.$assign(o.Bounds);
    this.fHasBounds = o.fHasBounds;
    return this;
  }
}

export class C4FindObjectExclude extends C4FindObject {
  pExclude = null;

  init(pExclude) {
    this.pExclude = pExclude;
    return this;
  }

  Check(pObj) {
    return pObj !== this.pExclude;
  }

  $clone() { return new C4FindObjectExclude().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pExclude = o.pExclude;
    return this;
  }
}

export class C4FindObjectDef extends C4FindObject {
  def = null;

  init(def) {
    this.def = def;
    return this;
  }

  Check(pObj) {
    return pObj.GetPrototype() === this.def;
  }

  IsImpossible() {
    return this.def == null || !(this.def.GetDef$v() != null) || !(this.def.GetDef$v().Count !== 0);
  }

  $clone() { return new C4FindObjectDef().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.def = o.def;
    return this;
  }
}

export class C4FindObjectInRect extends C4FindObject {
  rect = new $.C4Rect();

  init(rect) {
    this.rect = rect.$clone();
    return this;
  }

  Check(pObj) {
    return this.rect.Contains$i32$i32(pObj.GetX(), pObj.GetY());
  }

  GetBounds() {
    return this.rect;
  }

  IsImpossible() {
    return this.rect.Wdt === 0 || this.rect.Hgt === 0;
  }

  $clone() { return new C4FindObjectInRect().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.rect.$assign(o.rect);
    return this;
  }
}

export class C4FindObjectAtPoint extends C4FindObject {
  bounds = new $.C4Rect();

  init(x, y) {
    this.bounds = new $.C4Rect().init$i32$i32$i32$i32(x, y, 1, 1);
    return this;
  }

  Check(pObj) {
    return pObj.Shape.Contains$i32$i32(this.bounds.x - pObj.GetX() | 0, this.bounds.y - pObj.GetY() | 0);
  }

  GetBounds() {
    return this.bounds;
  }

  UseShapes() {
    return true;
  }

  $clone() { return new C4FindObjectAtPoint().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.bounds.$assign(o.bounds);
    return this;
  }
}

export class C4FindObjectAtRect extends C4FindObject {
  bounds = new $.C4Rect();

  init(x, y, wdt, hgt) {
    this.bounds = new $.C4Rect().init$i32$i32$i32$i32(x, y, wdt, hgt);
    return this;
  }

  Check(pObj) {
    let rcShapeBounds = pObj.Shape.$clone();
    rcShapeBounds.x = rcShapeBounds.x + pObj.GetX() | 0;
    rcShapeBounds.y = rcShapeBounds.y + pObj.GetY() | 0;
    return !!rcShapeBounds.Overlap(this.bounds);
  }

  GetBounds() {
    return this.bounds;
  }

  UseShapes() {
    return true;
  }

  $clone() { return new C4FindObjectAtRect().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.bounds.$assign(o.bounds);
    return this;
  }
}

export class C4FindObjectOnLine extends C4FindObject {
  x = 0;
  y = 0;
  x2 = 0;
  y2 = 0;
  bounds = new $.C4Rect();

  init(x, y, x2, y2) {
    this.x = x;
    this.y = y;
    this.x2 = x2;
    this.y2 = y2;
    this.bounds = new $.C4Rect().init$i32$i32$i32$i32(x, y, 1, 1);
    this.bounds.Add(new $.C4Rect().init$i32$i32$i32$i32(x2, y2, 1, 1));
    return this;
  }

  Check(pObj) {
    return pObj.Shape.IntersectsLine(this.x - pObj.GetX() | 0, this.y - pObj.GetY() | 0, this.x2 - pObj.GetX() | 0, this.y2 - pObj.GetY() | 0);
  }

  GetBounds() {
    return this.bounds;
  }

  UseShapes() {
    return true;
  }

  $clone() { return new C4FindObjectOnLine().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.x = o.x;
    this.y = o.y;
    this.x2 = o.x2;
    this.y2 = o.y2;
    this.bounds.$assign(o.bounds);
    return this;
  }
}

export class C4FindObjectDistance extends C4FindObject {
  x = 0;
  y = 0;
  r2 = 0;
  bounds = new $.C4Rect();

  init(x, y, r) {
    this.x = x;
    this.y = y;
    this.r2 = Math.imul(r, r);
    this.bounds = new $.C4Rect().init$i32$i32$i32$i32(x - r | 0, y - r | 0, Math.imul(2, r) + 1 | 0, Math.imul(2, r) + 1 | 0);
    return this;
  }

  Check(pObj) {
    return (Math.imul(pObj.GetX() - this.x | 0, pObj.GetX() - this.x | 0) + Math.imul(pObj.GetY() - this.y | 0, pObj.GetY() - this.y | 0) | 0) <= this.r2;
  }

  GetBounds() {
    return this.bounds;
  }

  $clone() { return new C4FindObjectDistance().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.x = o.x;
    this.y = o.y;
    this.r2 = o.r2;
    this.bounds.$assign(o.bounds);
    return this;
  }
}

export class C4FindObjectCone extends C4FindObject {
  x = 0;
  y = 0;
  r2 = 0;
  cone_angle = 0;
  cone_width = 0;
  prec_angle = 0;
  bounds = new $.C4Rect();

  init(x, y, r, angle, width, prec = 1) {
    this.x = x;
    this.y = y;
    this.r2 = Math.imul(r, r);
    this.cone_angle = angle % Math.imul(360, prec);
    this.cone_width = width;
    this.prec_angle = prec;
    this.bounds = new $.C4Rect().init$i32$i32$i32$i32(x - r | 0, y - r | 0, Math.imul(2, r) + 1 | 0, Math.imul(2, r) + 1 | 0);
    return this;
  }

  Check(pObj) {
    let in_circle = (Math.imul(pObj.GetX() - this.x | 0, pObj.GetX() - this.x | 0) + Math.imul(pObj.GetY() - this.y | 0, pObj.GetY() - this.y | 0) | 0) <= this.r2;
    let obj_angle = $.Angle(this.x, this.y, pObj.GetX(), pObj.GetY(), this.prec_angle);
    let in_cone = $.Inside$i32$i32$i32$3(obj_angle, this.cone_angle - this.cone_width | 0, this.cone_angle + this.cone_width | 0) || $.Inside$i32$i32$i32$3(obj_angle - Math.imul(360, this.prec_angle) | 0, this.cone_angle - this.cone_width | 0, this.cone_angle + this.cone_width | 0) || $.Inside$i32$i32$i32$3(obj_angle + Math.imul(360, this.prec_angle) | 0, this.cone_angle - this.cone_width | 0, this.cone_angle + this.cone_width | 0);
    return in_circle && in_cone;
  }

  GetBounds() {
    return this.bounds;
  }

  $clone() { return new C4FindObjectCone().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.x = o.x;
    this.y = o.y;
    this.r2 = o.r2;
    this.cone_angle = o.cone_angle;
    this.cone_width = o.cone_width;
    this.prec_angle = o.prec_angle;
    this.bounds.$assign(o.bounds);
    return this;
  }
}

export class C4FindObjectOCF extends C4FindObject {
  ocf = 0;

  init(ocf) {
    this.ocf = ocf;
    return this;
  }

  Check(pObj) {
    return !!((pObj.OCF & this.ocf >>> 0) >>> 0 !== 0);
  }

  IsImpossible() {
    return this.ocf === 0;
  }

  $clone() { return new C4FindObjectOCF().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.ocf = o.ocf;
    return this;
  }
}

export class C4FindObjectCategory extends C4FindObject {
  iCategory = 0;

  init(iCategory) {
    this.iCategory = iCategory;
    return this;
  }

  Check(pObj) {
    return !!((pObj.Category & this.iCategory) !== 0);
  }

  IsEnsured() {
    return this.iCategory === 0;
  }

  $clone() { return new C4FindObjectCategory().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.iCategory = o.iCategory;
    return this;
  }
}

export class C4FindObjectAction extends C4FindObject {
  szAction = null;

  init(szAction) {
    this.szAction = szAction;
    return this;
  }

  Check(pObj) {
    0;
    if (!(pObj.GetAction() != null)) {
      return false;
    }
    return $.SEqual(pObj.GetAction().GetName(), this.szAction);
  }

  $clone() { return new C4FindObjectAction().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.szAction = o.szAction;
    return this;
  }
}

export class C4FindObjectActionTarget extends C4FindObject {
  pActionTarget = null;
  index = 0;

  init(pActionTarget, index) {
    this.pActionTarget = pActionTarget;
    this.index = index;
    return this;
  }

  Check(pObj) {
    0;
    0;
    if (!(pObj.GetAction() != null)) {
      return false;
    }
    if (this.index === 0) {
      return pObj.Action.Target.op_eq$pC4Object(this.pActionTarget);
    } else if (this.index === 1) {
      return pObj.Action.Target2.op_eq$pC4Object(this.pActionTarget);
    } else {
      return false;
    }
  }

  $clone() { return new C4FindObjectActionTarget().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pActionTarget = o.pActionTarget;
    this.index = o.index;
    return this;
  }
}

export class C4FindObjectProcedure extends C4FindObject {
  procedure = null;

  init(procedure) {
    this.procedure = procedure;
    return this;
  }

  Check(pObj) {
    0;
    if (!(pObj.GetAction() != null)) {
      return false;
    }
    let v = new $.C4Value().init$v();
    pObj.GetAction().GetProperty(23 /*P_Procedure*/, v);
    return v.op_ne($.C4VNull) && v.getStr() === this.procedure;
  }

  IsImpossible() {
    return false;
  }

  $clone() { return new C4FindObjectProcedure().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.procedure = o.procedure;
    return this;
  }
}

export class C4FindObjectContainer extends C4FindObject {
  pContainer = null;

  init(pContainer) {
    this.pContainer = pContainer;
    return this;
  }

  Check(pObj) {
    return pObj.Contained.op_eq$pC4Object(this.pContainer);
  }

  $clone() { return new C4FindObjectContainer().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pContainer = o.pContainer;
    return this;
  }
}

export class C4FindObjectAnyContainer extends C4FindObject {

  Check(pObj) {
    return !pObj.Contained.op_not();
  }

  $clone() { return new C4FindObjectAnyContainer().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class C4FindObjectOwner extends C4FindObject {
  iOwner = 0;

  init(iOwner) {
    this.iOwner = iOwner;
    return this;
  }

  Check(pObj) {
    return pObj.Owner === this.iOwner;
  }

  IsImpossible() {
    return this.iOwner !== -1 && !($.ValidPlr(this.iOwner) !== 0);
  }

  $clone() { return new C4FindObjectOwner().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.iOwner = o.iOwner;
    return this;
  }
}

export class C4FindObjectController extends C4FindObject {
  controller = 0;

  init(controller) {
    this.controller = controller;
    return this;
  }

  Check(pObj) {
    return pObj.Controller === this.controller;
  }

  IsImpossible() {
    return this.controller !== -1 && !($.ValidPlr(this.controller) !== 0);
  }

  $clone() { return new C4FindObjectController().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.controller = o.controller;
    return this;
  }
}

export class C4FindObjectFunc extends C4FindObject {
  Name = null;
  Pars = new $.C4AulParSet().init$v();

  init(Name) {
    this.Name = Name;
    this.Pars = new $.C4AulParSet().init$v();
    return this;
  }

  SetPar(i, Par) {
    if (i >= 10) {
      return;
    }
    this.Pars.op_index(i).$assign(Par);
  }

  Check(pObj) {
    0;
    return pObj.Call$pC4String$pC4AulParSet$b(this.Name, this.Pars.op_and()).getBool();
  }

  IsImpossible() {
    return false;
  }

  $clone() { return new C4FindObjectFunc().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.Name = o.Name;
    this.Pars.$assign(o.Pars);
    return this;
  }
}

export class C4FindObjectProperty extends C4FindObject {
  Name = null;
  have_value = false;
  Value = new $.C4Value().init$v();

  init$pC4String(Name) {
    this.Name = Name;
    this.have_value = false;
    this.Value = new $.C4Value().init$v();
    return this;
  }

  init$pC4String$C4Value(Name, Value) {
    this.Name = Name;
    this.have_value = true;
    this.Value = new $.C4Value().$copy(Value);
    return this;
  }

  Check(pObj) {
    0;
    let value = new $.C4Value().init$v();
    return pObj.GetPropertyByS(this.Name, value) && (this.have_value ? value.op_eq(this.Value) : value.getBool());
  }

  IsImpossible() {
    return false;
  }

  $clone() { return new C4FindObjectProperty().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.Name = o.Name;
    this.have_value = o.have_value;
    this.Value.$assign(o.Value);
    return this;
  }
}

export class C4FindObjectLayer extends C4FindObject {
  pLayer = null;

  init(pLayer) {
    this.pLayer = pLayer;
    return this;
  }

  Check(pObj) {
    return pObj.Layer.op_eq$pC4Object(this.pLayer);
  }

  IsImpossible() {
    return false;
  }

  $clone() { return new C4FindObjectLayer().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pLayer = o.pLayer;
    return this;
  }
}

export class C4FindObjectInArray extends C4FindObject {
  pArray = null;

  init(pArray) {
    this.pArray = pArray;
    return this;
  }

  Check(pObj) {
    if (this.pArray == null) {
      return false;
    }
    let sz = this.pArray.GetSize();
    for (let i = 0; i < sz; i = i + 1 | 0) {
      if (this.pArray._GetItem(i).getObj() === pObj) {
        return true;
      }
    }
    return false;
  }

  IsImpossible() {
    return this.pArray == null || !(this.pArray.GetSize() !== 0);
  }

  $clone() { return new C4FindObjectInArray().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pArray = o.pArray;
    return this;
  }
}

export class C4SortObjectByValue extends C4SortObject {
  pVals = null;
  iSize = 0;

  init() {
    this.pVals = null;
    this.iSize = 0;
    return this;
  }

  $dtor() {
    $delete(this.pVals);
    this.pVals = null;
  }

  Compare(pObj1, pObj2) {
    let iValue1 = this.CompareGetValue(pObj1);
    let iValue2 = this.CompareGetValue(pObj2);
    return iValue2 - iValue1 | 0;
  }

  PrepareCache(pObjs) {
    $delete(this.pVals);
    this.pVals = null;
    this.iSize = 0;
    this.iSize = pObjs.GetSize();
    this.pVals = P(new Int32Array($u64n(this.iSize)), 0);
    for (let i = 0; i < this.iSize; i = i + 1 | 0) {
      this.pVals.a[this.pVals.o + i] = this.CompareGetValue(pObjs.GetItem(i)._getObj());
    }
    return true;
  }

  CompareCache(iObj1, iObj2, _pObj1, _pObj2) {
    0;
    0;
    0;
    return this.pVals.a[this.pVals.o + iObj2] - this.pVals.a[this.pVals.o + iObj1] | 0;
  }

  $clone() { return new C4SortObjectByValue().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pVals = o.pVals;
    this.iSize = o.iSize;
    return this;
  }
}

export class C4SortObjectReverse extends C4SortObject {
  pSort = null;

  init(pSort) {
    this.pSort = pSort;
    return this;
  }

  $dtor() {
    $delete(this.pSort);
  }

  Compare(pObj1, pObj2) {
    return this.pSort.Compare(pObj2, pObj1);
  }

  PrepareCache(pObjs) {
    return this.pSort.PrepareCache(pObjs);
  }

  CompareCache(iObj1, iObj2, pObj1, pObj2) {
    return this.pSort.CompareCache(iObj2, iObj1, pObj2, pObj1);
  }

  $clone() { return new C4SortObjectReverse().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pSort = o.pSort;
    return this;
  }
}

export class C4SortObjectMultiple extends C4SortObject {
  fFreeArray = false;
  iCnt = 0;
  ppSorts = null;

  init(iCnt, ppSorts, fFreeArray = true) {
    this.fFreeArray = fFreeArray;
    this.iCnt = iCnt;
    this.ppSorts = ppSorts;
    return this;
  }

  $dtor() {
    for (let i = 0; i < this.iCnt; i = i + 1 | 0) {
      $delete(this.ppSorts.a[this.ppSorts.o + i]);
    }
    if (this.fFreeArray) {
      $delete(this.ppSorts);
    }
  }

  Compare(pObj1, pObj2) {
    let iCmp = 0;
    for (let i = 0; i < this.iCnt; i = i + 1 | 0) {
      if ((iCmp = this.ppSorts.a[this.ppSorts.o + i].Compare(pObj1, pObj2)) !== 0) {
        return iCmp;
      }
    }
    return 0;
  }

  PrepareCache(pObjs) {
    let fCaches = false;
    for (let i = 0; i < this.iCnt; i = i + 1 | 0) {
      fCaches = ((fCaches ? 1 : 0) | (this.ppSorts.a[this.ppSorts.o + i].PrepareCache(pObjs) ? 1 : 0)) !== 0;
    }
    return fCaches;
  }

  CompareCache(iObj1, iObj2, pObj1, pObj2) {
    let iCmp = 0;
    for (let i = 0; i < this.iCnt; i = i + 1 | 0) {
      if ((iCmp = this.ppSorts.a[this.ppSorts.o + i].CompareCache(iObj1, iObj2, pObj1, pObj2)) !== 0) {
        return iCmp;
      }
    }
    return 0;
  }

  $clone() { return new C4SortObjectMultiple().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.fFreeArray = o.fFreeArray;
    this.iCnt = o.iCnt;
    this.ppSorts = o.ppSorts;
    return this;
  }
}

export class C4FindObjectAndStatic extends C4FindObjectAnd {

  init(iCnt, ppConds) {
    super.init(iCnt, ppConds, true);
    return this;
  }

  $dtor() {
    this.ForgetConditions();
    super.$dtor();
  }

  $clone() { return new C4FindObjectAndStatic().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class C4SortObjectDistance extends C4SortObjectByValue {
  iX = 0;
  iY = 0;

  init(iX, iY) {
    super.init();
    this.iX = iX;
    this.iY = iY;
    return this;
  }

  CompareGetValue(pFor) {
    let dx = pFor.GetX() - this.iX | 0;
    let dy = pFor.GetY() - this.iY | 0;
    return Math.imul(dx, dx) + Math.imul(dy, dy) | 0;
  }

  $clone() { return new C4SortObjectDistance().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.iX = o.iX;
    this.iY = o.iY;
    return this;
  }
}

export class C4SortObjectRandom extends C4SortObjectByValue {

  init() {
    super.init();
    return this;
  }

  CompareGetValue(_pFor) {
    return Random(65536) | 0;
  }

  $clone() { return new C4SortObjectRandom().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class C4SortObjectSpeed extends C4SortObjectByValue {

  init() {
    super.init();
    return this;
  }

  CompareGetValue(pFor) {
    return $.fixtoi$C4Fixed(pFor.xdir.op_mul$C4Fixed(pFor.xdir).op_add$C4Fixed(pFor.ydir.op_mul$C4Fixed(pFor.ydir)));
  }

  $clone() { return new C4SortObjectSpeed().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class C4SortObjectMass extends C4SortObjectByValue {

  init() {
    super.init();
    return this;
  }

  CompareGetValue(pFor) {
    return pFor.Mass;
  }

  $clone() { return new C4SortObjectMass().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class C4SortObjectValue extends C4SortObjectByValue {

  init() {
    super.init();
    return this;
  }

  CompareGetValue(pFor) {
    return pFor.GetValue(null, -1);
  }

  $clone() { return new C4SortObjectValue().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class C4SortObjectFunc extends C4SortObjectByValue {
  Name = null;
  Pars = new $.C4AulParSet().init$v();

  init(Name) {
    super.init();
    this.Name = Name;
    this.Pars = new $.C4AulParSet().init$v();
    return this;
  }

  SetPar(i, Par) {
    if (i >= 10) {
      return;
    }
    this.Pars.op_index(i).$assign(Par);
  }

  CompareGetValue(pObj) {
    if (this.Name == null) {
      return 0;
    }
    return pObj.Call$pC4String$pC4AulParSet$b(this.Name, this.Pars.op_and()).getInt();
  }

  $clone() { return new C4SortObjectFunc().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.Name = o.Name;
    this.Pars.$assign(o.Pars);
    return this;
  }
}

export function $init(): void {
}

Object.assign($, { C4FindObject, C4FindObjectAction, C4FindObjectActionTarget, C4FindObjectAnd, C4FindObjectAndStatic, C4FindObjectAnyContainer, C4FindObjectAtPoint, C4FindObjectAtRect, C4FindObjectCategory, C4FindObjectCone, C4FindObjectContainer, C4FindObjectController, C4FindObjectDef, C4FindObjectDistance, C4FindObjectExclude, C4FindObjectFunc, C4FindObjectInArray, C4FindObjectInRect, C4FindObjectLayer, C4FindObjectNot, C4FindObjectOCF, C4FindObjectOnLine, C4FindObjectOr, C4FindObjectOwner, C4FindObjectProcedure, C4FindObjectProperty, C4SortObject, C4SortObjectByValue, C4SortObjectDistance, C4SortObjectFunc, C4SortObjectMass, C4SortObjectMultiple, C4SortObjectRandom, C4SortObjectReverse, C4SortObjectSpeed, C4SortObjectValue });
