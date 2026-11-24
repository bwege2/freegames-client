// @ts-nocheck
// OpenClonk 36de799: src/object/C4Sector.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $u64n } from '../../rt/int.ts';
import { $bytesView, $oadd, $oarr, $oat, $oidx, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete } from '../../rt/std.ts';

export class C4LSector {
  x = 0;
  y = 0;
  Objects = new $.C4ObjectList().init();
  ObjectShapes = new $.C4ObjectList().init();

  init() {
    this.Objects = new $.C4ObjectList().init();
    this.ObjectShapes = new $.C4ObjectList().init();
    return this;
  }

  $dtor() {
    C4LSector.prototype.Clear.call(this);
  }

  Init(ix, iy) {
    this.Clear();
    this.x = ix;
    this.y = iy;
  }

  Clear() {
    this.ClearObjects();
  }

  CompileFunc(pComp, numbers$) {
    const numbers = [numbers$];
    pComp.Value$StdNamingAdapt$StdIntAdapt$i32$i32$2($.mkNamingAdapt$mStdIntAdapt$i32$i32$pi8$2($.mkIntAdapt$ri32$4(P(this, "x")), S("x")));
    pComp.Value$StdNamingAdapt$StdIntAdapt$i32$i32$2($.mkNamingAdapt$mStdIntAdapt$i32$i32$pi8$2($.mkIntAdapt$ri32$4(P(this, "y")), S("y")));
    pComp.Value$StdNamingAdapt$StdParameterAdapt$C4ObjectList$pC4ValueNumbers($.mkNamingAdapt$mStdParameterAdapt$C4ObjectList$pC4ValueNumbers$pi8($.mkParAdapt$rC4ObjectList$rpC4ValueNumbers(this.Objects, P(numbers, 0)), S("Objects")));
    pComp.Value$StdNamingAdapt$StdParameterAdapt$C4ObjectList$pC4ValueNumbers($.mkNamingAdapt$mStdParameterAdapt$C4ObjectList$pC4ValueNumbers$pi8($.mkParAdapt$rC4ObjectList$rpC4ValueNumbers(this.ObjectShapes, P(numbers, 0)), S("ObjectShapes")));
  }

  ClearObjects() {
    this.Objects.Clear$v();
    this.ObjectShapes.Clear$v();
  }

  $clone() { return new C4LSector().$assign(this); }
  $assign(o) {
    this.x = o.x;
    this.y = o.y;
    this.Objects.$assign(o.Objects);
    this.ObjectShapes.$assign(o.ObjectShapes);
    return this;
  }
}

export class C4LSectors {
  Sectors = null;
  PxWdt = 0;
  PxHgt = 0;
  Wdt = 0;
  Hgt = 0;
  Size = 0;
  SectorOut = new C4LSector().init();

  Init(iWdt, iHgt) {
    this.Clear();
    this.Wdt = (((this.PxWdt = iWdt) - 1 | 0) / 50 | 0) + 1 | 0;
    this.Hgt = (((this.PxHgt = iHgt) - 1 | 0) / 50 | 0) + 1 | 0;
    this.Sectors = $oat($oarr($u64n(this.Size = Math.imul(this.Wdt, this.Hgt)), () => new C4LSector().init()), 0);
    let sct = this.Sectors;
    for (let cnt = 0; cnt < this.Size; cnt = cnt + 1 | 0, sct = $oadd(sct, 1)) {
      sct.Init(cnt % this.Wdt, cnt / this.Wdt | 0);
    }
    this.SectorOut.Init(-1, -1);
  }

  Clear() {
    this.SectorOut.Clear();
    $delete(this.Sectors);
    this.Sectors = null;
  }

  SectorAt(ix, iy) {
    if (ix < 0 || iy < 0 || ix >= this.PxWdt || iy >= this.PxHgt) {
      return this.SectorOut;
    }
    return $oadd($oadd(this.Sectors, Math.imul(iy / 50 | 0, this.Wdt)), ix / 50 | 0);
  }

  Add(pObj, pMainList) {
    0;
    let pSct = this.SectorAt(pObj.GetX(), pObj.GetY());
    pSct.Objects.Add$pC4Object$i32$pC4ObjectList(pObj, 1 /*stMain*/, pMainList);
    pObj.old_x = pObj.GetX();
    pObj.old_y = pObj.GetY();
    pObj.Area.Set$pC4LSectors$pC4Object(this, pObj);
    for (pSct = pObj.Area.First(); pSct != null; pSct = pObj.Area.Next(pSct)) {
      pSct.ObjectShapes.Add$pC4Object$i32$pC4ObjectList(pObj, 1 /*stMain*/, pMainList);
    }
    if ($.Config.General.DebugRec !== 0) {
      pObj.Area.DebugRec(pObj, 65);
    }
  }

  Update(pObj, pMainList) {
    0;
    if (pObj.Area.IsNull()) {
      this.Add(pObj, pMainList);
      return;
    }
    let pOld = null;
    let pNew = null;
    if (pObj.old_x !== pObj.GetX() || pObj.old_y !== pObj.GetY()) {
      pOld = this.SectorAt(pObj.old_x, pObj.old_y);
      pNew = this.SectorAt(pObj.GetX(), pObj.GetY());
      if (pOld !== pNew) {
        pOld.Objects.Remove(pObj);
        pNew.Objects.Add$pC4Object$i32$pC4ObjectList(pObj, 1 /*stMain*/, pMainList);
      }
      pObj.old_x = pObj.GetX();
      pObj.old_y = pObj.GetY();
    }
    let NewArea = new C4LArea().init$pC4LSectors$pC4Object(this, pObj);
    if (pObj.Area.op_eq(NewArea)) {
      return;
    }
    for (pOld = pObj.Area.First(); pOld != null; pOld = pObj.Area.Next(pOld)) {
      if (!NewArea.Contains(pOld)) {
        pOld.ObjectShapes.Remove(pObj);
      }
    }
    for (pNew = NewArea.First(); pNew != null; pNew = NewArea.Next(pNew)) {
      if (!pObj.Area.Contains(pNew)) {
        pNew.ObjectShapes.Add$pC4Object$i32$pC4ObjectList(pObj, 1 /*stMain*/, pMainList);
      }
    }
    pObj.Area.$assign(NewArea);
    if ($.Config.General.DebugRec !== 0) {
      pObj.Area.DebugRec(pObj, 85);
    }
  }

  Remove(pObj) {
    0;
    0;
    let pSct = this.SectorAt(pObj.old_x, pObj.old_y);
    if (!pSct.Objects.Remove(pObj)) {
      let fFound = false;
      for (pSct = pObj.Area.First(); pSct != null; pSct = pObj.Area.Next(pSct)) {
        if (pSct.Objects.Remove(pObj)) {
          fFound = true;
          break;
        }
      }
      if (!fFound) {
        fFound = !!this.SectorOut.Objects.Remove(pObj);
        if (!fFound) {
          pSct = this.Sectors;
          for (let cnt = 0; cnt < this.Size; cnt = cnt + 1 | 0, pSct = $oadd(pSct, 1)) {
            if (pSct.Objects.Remove(pObj)) {
              fFound = true;
              break;
            }
          }
        }
        0;
      }
    }
    for (pSct = pObj.Area.First(); pSct != null; pSct = pObj.Area.Next(pSct)) {
      pSct.ObjectShapes.Remove(pObj);
    }
    if ($.Config.General.DebugRec !== 0) {
      pObj.Area.DebugRec(pObj, 82);
    }
  }

  ClearObjects() {
    if (this.Sectors != null) {
      for (let cnt = 0; cnt < this.Size; cnt = cnt + 1 | 0) {
        $oidx(this.Sectors, cnt).ClearObjects();
      }
    }
    this.SectorOut.ClearObjects();
  }

  AssertObjectNotInList(_pObj) {
  }

  getShapeSum() {
    let iSum = 0;
    for (let cnt = 0; cnt < this.Size; cnt = cnt + 1 | 0) {
      iSum = iSum + $oidx(this.Sectors, cnt).ObjectShapes.ObjectCount() | 0;
    }
    return iSum;
  }

  Dump() {
    let numbers = new $.C4ValueNumbers().init();
    $.LogSilent$pi8($.DecompileToBuf$StdNamingAdapt$StdArrayAdapt$C4LSector$StdParameterAdaptMaker$pC4ValueNumbers($.mkNamingAdapt$mStdArrayAdapt$C4LSector$StdParameterAdaptMaker$pC4ValueNumbers$pi8($.mkArrayAdaptMap$pC4LSector$i32$mStdParameterAdaptMaker$pC4ValueNumbers(this.Sectors, this.Size, $.mkParAdaptMaker$mpC4ValueNumbers(numbers)), S("Sector"))).getData());
  }

  CheckSort() {
    for (let cnt = 0; cnt < this.Size; cnt = cnt + 1 | 0) {
      if (!$oidx(this.Sectors, cnt).Objects.CheckSort($.Objects)) {
        return false;
      }
    }
    if (!this.SectorOut.Objects.CheckSort($.Objects)) {
      return false;
    }
    return true;
  }

  None() {
    this.SectorOut = new C4LSector().init();
    return this;
  }

  $clone() { return new C4LSectors().$assign(this); }
  $assign(o) {
    this.Sectors = o.Sectors;
    this.PxWdt = o.PxWdt;
    this.PxHgt = o.PxHgt;
    this.Wdt = o.Wdt;
    this.Hgt = o.Hgt;
    this.Size = o.Size;
    this.SectorOut.$assign(o.SectorOut);
    return this;
  }
}

export class C4LArea {
  pFirst = null;
  xL = 0;
  yL = 0;
  dpitch = 0;
  pOut = null;

  init$v() {
    C4LArea.prototype.Clear.call(this);
    return this;
  }

  init$pC4LSectors$i32$i32$i32$i32(pSectors, ix, iy, iwdt, ihgt) {
    C4LArea.prototype.Set$pC4LSectors$C4Rect.call(this, pSectors, new $.C4Rect().init$i32$i32$i32$i32(ix, iy, iwdt, ihgt));
    return this;
  }

  init$pC4LSectors$C4Rect(pSectors, rect) {
    C4LArea.prototype.Set$pC4LSectors$C4Rect.call(this, pSectors, rect);
    return this;
  }

  init$pC4LSectors$pC4Object(pSectors, pObj) {
    C4LArea.prototype.Set$pC4LSectors$pC4Object.call(this, pSectors, pObj);
    return this;
  }

  Clear() {
    this.pFirst = this.pOut = null;
  }

  op_eq(Area) {
    return this.pFirst === Area.pFirst && this.xL === Area.xL && this.yL === Area.yL && this.pOut === Area.pOut;
  }

  IsNull() {
    return this.pFirst == null;
  }

  Set$pC4LSectors$C4Rect(pSectors, Rect) {
    this.pFirst = null;
    this.pOut = null;
    let ClippedRect = Rect.$clone();
    let Bounds = new $.C4Rect().init$i32$i32$i32$i32(0, 0, pSectors.PxWdt, pSectors.PxHgt);
    ClippedRect.Normalize();
    if (!Bounds.Contains$C4Rect(ClippedRect)) {
      ClippedRect.Intersect(Bounds);
      this.pOut = pSectors.SectorOut;
    }
    this.pFirst = pSectors.SectorAt(ClippedRect.x, ClippedRect.y);
    if (ClippedRect.Wdt === 0) {
      ClippedRect.Wdt = 1;
    }
    if (ClippedRect.Hgt === 0) {
      ClippedRect.Hgt = 1;
    }
    this.xL = ((ClippedRect.x + ClippedRect.Wdt | 0) - 1 | 0) / 50 | 0;
    this.yL = ((ClippedRect.y + ClippedRect.Hgt | 0) - 1 | 0) / 50 | 0;
    this.dpitch = (pSectors.Wdt - (((ClippedRect.x + ClippedRect.Wdt | 0) - 1 | 0) / 50 | 0) | 0) + (ClippedRect.x / 50 | 0) | 0;
  }

  Set$pC4LSectors$pC4Object(pSectors, pObj) {
    this.Set$pC4LSectors$C4Rect(pSectors, new $.C4Rect().init$i32$i32$i32$i32(pObj.Left(), pObj.Top(), pObj.Width(), pObj.Height()));
  }

  First() {
    return this.pFirst;
  }

  Next(pPrev) {
    if (pPrev === this.pOut) {
      return null;
    }
    if (pPrev.x < this.xL) {
      return $oadd(pPrev, 1);
    }
    if (pPrev.y < this.yL) {
      return $oadd(pPrev, this.dpitch);
    }
    return this.pOut;
  }

  Contains(pSct) {
    0;
    if (this.pFirst == null) {
      return false;
    }
    if (pSct === this.pOut) {
      return true;
    }
    if (this.pFirst === this.pOut) {
      return false;
    }
    return pSct.x >= this.pFirst.x && pSct.y >= this.pFirst.y && pSct.x <= this.xL && pSct.y <= this.yL;
  }

  FirstObjects(ppSct) {
    ppSct.a[ppSct.o] = null;
    return this.NextObjects(null, ppSct);
  }

  NextObjects(_pPrev, ppSct) {
    if (ppSct.a[ppSct.o] == null) {
      ppSct.a[ppSct.o] = this.First();
    } else {
      ppSct.a[ppSct.o] = this.Next(ppSct.a[ppSct.o]);
    }
    if (ppSct.a[ppSct.o] == null) {
      return null;
    }
    return ppSct.a[ppSct.o].Objects;
  }

  FirstObjectShapes(ppSct) {
    ppSct.a[ppSct.o] = null;
    return this.NextObjectShapes(null, ppSct);
  }

  NextObjectShapes(_pPrev, ppSct) {
    if (ppSct.a[ppSct.o] == null) {
      ppSct.a[ppSct.o] = this.First();
    } else {
      ppSct.a[ppSct.o] = this.Next(ppSct.a[ppSct.o]);
    }
    if (ppSct.a[ppSct.o] == null) {
      return null;
    }
    return ppSct.a[ppSct.o].ObjectShapes;
  }

  DebugRec(pObj, cMarker) {
    let rc = new $.C4RCArea();
    rc.op = cMarker;
    rc.obj = pObj != null ? pObj.Number : -1;
    rc.x1 = this.pFirst != null ? this.pFirst.x : -1;
    rc.y1 = this.pFirst != null ? this.pFirst.x : -1;
    rc.xL = this.xL;
    rc.yL = this.yL;
    rc.dpitch = this.dpitch;
    rc.out = !(this.pOut == null);
    $.AddDbgRec(160 /*RCT_Area*/, $bytesView(rc, [["op", 0, "i8", 0], ["obj", 1, "i32", 0], ["x1", 5, "i32", 0], ["y1", 9, "i32", 0], ["xL", 13, "i32", 0], ["yL", 17, "i32", 0], ["dpitch", 21, "i32", 0], ["out", 25, "u8", 0]], 26), 26);
  }

  $clone() { return new C4LArea().$assign(this); }
  $assign(o) {
    this.pFirst = o.pFirst;
    this.xL = o.xL;
    this.yL = o.yL;
    this.dpitch = o.dpitch;
    this.pOut = o.pOut;
    return this;
  }
}



export function $init(): void {
  $.C4LSectorWdt$C4Sector = 50;
  $.C4LSectorHgt$C4Sector = 50;
}

Object.assign($, { C4LArea, C4LSector, C4LSectors });
