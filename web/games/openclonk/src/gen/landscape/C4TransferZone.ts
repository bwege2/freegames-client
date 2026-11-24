// @ts-nocheck
// OpenClonk 36de799: src/landscape/C4TransferZone.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { ftoi32 } from '../../rt/int.ts';
import { $ } from '../../rt/registry.ts';
import { $delete } from '../../rt/std.ts';

export class C4TransferZone {
  Object = null;
  X = 0;
  Y = 0;
  Wdt = 0;
  Hgt = 0;
  Used = false;
  Next = null;

  init() {
    this.Object = null;
    this.X = this.Y = this.Wdt = this.Hgt = 0;
    this.Next = null;
    this.Used = false;
    return this;
  }

  GetEntryPoint(rX, rY, iToX, iToY) {
    if ($.Inside$i32$i32$i32$3(iToX - this.X | 0, 0, this.Wdt - 1 | 0) && $.Inside$i32$i32$i32$3(iToY - this.Y | 0, 0, this.Hgt - 1 | 0)) {
      if (iToX < (this.X + (this.Wdt / 2 | 0) | 0)) {
        iToX = this.X - 1 | 0;
      } else {
        iToX = this.X + this.Wdt | 0;
      }
    }
    rX.a[rX.o] = $.Clamp$i32$i32$i32(iToX, this.X - 1 | 0, this.X + this.Wdt | 0);
    rY.a[rY.o] = $.Clamp$i32$i32$i32(iToY, this.Y - 1 | 0, this.Y + this.Hgt | 0);
    let iX1 = rX.a[rX.o];
    let iY1 = rY.a[rY.o];
    let iX2 = rX.a[rX.o];
    let iY2 = rY.a[rY.o];
    let iXIncr1 = 0;
    let iYIncr1 = -1;
    let iXIncr2 = 0;
    let iYIncr2 = 1;
    let cnt = 0;
    for (cnt = 0; cnt < (Math.imul(2, this.Wdt) + Math.imul(2, this.Hgt) | 0); cnt = cnt + 1 | 0) {
      if (!$.GBackSolid(iX1, iY1)) {
        rX.a[rX.o] = iX1;
        rY.a[rY.o] = iY1;
        break;
      }
      if (!$.GBackSolid(iX2, iY2)) {
        rX.a[rX.o] = iX2;
        rY.a[rY.o] = iY2;
        break;
      }
      iX1 = iX1 + iXIncr1 | 0;
      iY1 = iY1 + iYIncr1 | 0;
      iX2 = iX2 + iXIncr2 | 0;
      iY2 = iY2 + iYIncr2 | 0;
      if (iY1 < (this.Y - 1 | 0)) {
        iY1 = this.Y - 1 | 0;
        iXIncr1 = 1;
        iYIncr1 = 0;
      }
      if (iX1 > (this.X + this.Wdt | 0)) {
        iX1 = this.X + this.Wdt | 0;
        iXIncr1 = 0;
        iYIncr1 = 1;
      }
      if (iY1 > (this.Y + this.Hgt | 0)) {
        iY1 = this.Y + this.Hgt | 0;
        iXIncr1 = -1;
        iYIncr1 = 0;
      }
      if (iX1 < (this.X - 1 | 0)) {
        iX1 = this.X - 1 | 0;
        iXIncr1 = 0;
        iYIncr1 = -1;
      }
      if (iY2 < (this.Y - 1 | 0)) {
        iY2 = this.Y - 1 | 0;
        iXIncr2 = -1;
        iYIncr2 = 0;
      }
      if (iX2 > (this.X + this.Wdt | 0)) {
        iX2 = this.X + this.Wdt | 0;
        iXIncr2 = 0;
        iYIncr2 = -1;
      }
      if (iY2 > (this.Y + this.Hgt | 0)) {
        iY2 = this.Y + this.Hgt | 0;
        iXIncr2 = 1;
        iYIncr2 = 0;
      }
      if (iX2 < (this.X - 1 | 0)) {
        iX2 = this.X - 1 | 0;
        iXIncr2 = 0;
        iYIncr2 = 1;
      }
    }
    if (cnt >= (Math.imul(2, this.Wdt) + Math.imul(2, this.Hgt) | 0)) {
      return false;
    }
    if (!$.Inside$i32$i32$i32$3(rX.a[rX.o] - this.X | 0, 0, this.Wdt - 1 | 0)) {
      $.AdjustMoveToTarget(rX, rY, false, 20);
    }
    return true;
  }

  Draw(cgo, fHighlight = false) {
    if (this.Used) {
      fHighlight = true;
    }
    $.pDraw.DrawFrameDw(cgo.Surface, ftoi32(Math.fround(Math.fround(cgo.X + Math.fround(this.X)) - cgo.TargetX)), ftoi32(Math.fround(Math.fround(cgo.Y + Math.fround(this.Y)) - cgo.TargetY)), ftoi32(Math.fround(Math.fround(Math.fround(Math.fround(cgo.X + Math.fround(this.X)) - cgo.TargetX) + Math.fround(this.Wdt)) - Math.fround(1))), ftoi32(Math.fround(Math.fround(Math.fround(Math.fround(cgo.Y + Math.fround(this.Y)) - cgo.TargetY) + Math.fround(this.Hgt)) - Math.fround(1))), fHighlight ? 0xff00ca00 : 0xffca0000);
  }

  At(iX, iY) {
    return $.Inside$i32$i32$i32$3(iX - this.X | 0, 0, this.Wdt - 1 | 0) && $.Inside$i32$i32$i32$3(iY - this.Y | 0, 0, this.Hgt - 1 | 0);
  }

  $clone() { return new C4TransferZone().$assign(this); }
  $assign(o) {
    this.Object = o.Object;
    this.X = o.X;
    this.Y = o.Y;
    this.Wdt = o.Wdt;
    this.Hgt = o.Hgt;
    this.Used = o.Used;
    this.Next = o.Next;
    return this;
  }
}

export class C4TransferZones {
  First = null;

  init() {
    C4TransferZones.prototype.Default.call(this);
    return this;
  }

  $dtor() {
    C4TransferZones.prototype.Clear.call(this);
  }

  RemoveNullZones() {
    let iResult = 0;
    let pZone = null;
    let pNext = null;
    let pPrev = null;
    for (pZone = this.First; pZone != null; pZone = pNext) {
      pNext = pZone.Next;
      if (pZone.Object == null) {
        $delete(pZone);
        if (pPrev != null) {
          pPrev.Next = pNext;
        } else {
          this.First = pNext;
        }
        iResult = iResult + 1 | 0;
      } else {
        pPrev = pZone;
      }
    }
    return iResult;
  }

  Default() {
    this.First = null;
  }

  Clear() {
    let pZone = null;
    let pNext = null;
    for (pZone = this.First; pZone != null; pZone = pNext) {
      pNext = pZone.Next;
      $delete(pZone);
    }
    this.First = null;
  }

  ClearUsed() {
    for (let pZone = this.First; pZone != null; pZone = pZone.Next) {
      pZone.Used = false;
    }
  }

  ClearPointers(pObj) {
    for (let pZone = this.First; pZone != null; pZone = pZone.Next) {
      if (pZone.Object === pObj) {
        pZone.Object = null;
      }
    }
    this.RemoveNullZones();
  }

  Draw(cgo) {
    for (let pZone = this.First; pZone != null; pZone = pZone.Next) {
      pZone.Draw(cgo);
    }
  }

  Synchronize() {
    this.Clear();
    $.Objects.OnSynchronized();
  }

  Find$pC4Object(pObj) {
    for (let pZone = this.First; pZone != null; pZone = pZone.Next) {
      if (pZone.Object === pObj) {
        return pZone;
      }
    }
    return null;
  }

  Find$i32$i32(iX, iY) {
    for (let pZone = this.First; pZone != null; pZone = pZone.Next) {
      if ($.Inside$i32$i32$i32$3(iX - pZone.X | 0, 0, pZone.Wdt - 1 | 0)) {
        if ($.Inside$i32$i32$i32$3(iY - pZone.Y | 0, 0, pZone.Hgt - 1 | 0)) {
          return pZone;
        }
      }
    }
    return null;
  }

  Add(iX, iY, iWdt, iHgt, pObj) {
    let pZone = null;
    pZone = new C4TransferZone().init();
    pZone.X = iX;
    pZone.Y = iY;
    pZone.Wdt = iWdt;
    pZone.Hgt = iHgt;
    pZone.Object = pObj;
    pZone.Next = this.First;
    this.First = pZone;
    return true;
  }

  Set(iX, iY, iWdt, iHgt, pObj) {
    let pZone = null;
    if (iWdt === 0 || iHgt === 0) {
      this.ClearPointers(pObj);
      return true;
    }
    if ((pZone = this.Find$pC4Object(pObj)) != null) {
      pZone.X = iX;
      pZone.Y = iY;
      pZone.Wdt = iWdt;
      pZone.Hgt = iHgt;
    } else {
      this.Add(iX, iY, iWdt, iHgt, pObj);
    }
    return true;
  }

  $clone() { return new C4TransferZones().$assign(this); }
  $assign(o) {
    this.First = o.First;
    return this;
  }
}

export function $init(): void {
}

Object.assign($, { C4TransferZone, C4TransferZones });
