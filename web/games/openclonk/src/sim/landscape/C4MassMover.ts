// @ts-nocheck
// OpenClonk 36de799: src/landscape/C4MassMover.cpp, src/landscape/C4MassMover.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $u64n } from '../../rt/int.ts';
import { Random } from '../../rt/native.ts';
import { $bytesView, $oadd, $oarr, $oat, $own, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';

export class C4MassMover {
  Mat = 0;
  x = 0;
  y = 0;

  Cease() {
    if ($.Config.General.DebugRec !== 0) {
      let rc = new $.C4RCMassMover();
      rc.x = this.x;
      rc.y = this.y;
      $.AddDbgRec(136 /*RCT_MMD*/, $bytesView(rc, [["x", 0, "i32", 0], ["y", 4, "i32", 0]], 8), 8);
    }
    $.MassMover.Count = $.MassMover.Count - 1 | 0;
    this.Mat = -1;
  }

  Execute() {
    const tx = [0];
    const ty = [0];
    if ($.GBackMat(this.x, this.y) !== this.Mat) {
      this.Cease();
      return false;
    }
    let pMat = $oadd($.MaterialMap.Map, this.Mat);
    tx[0] = this.x;
    ty[0] = this.y;
    if (!$.Landscape.FindMatPath(P(tx, 0), P(ty, 0), 1, pMat.Density, pMat.MaxSlide)) {
      if (this.Corrosion(0, 1) || this.Corrosion(-1, 0) || this.Corrosion(1, 0)) {
        $.Landscape.ExtractMaterial(this.x, this.y, false);
        return true;
      }
      this.Cease();
      return false;
    }
    let mat = $.Landscape.ExtractMaterial(this.x, this.y, false);
    if (Random(10) !== 0) {
      $.Landscape.InsertDeadMaterial(mat, tx[0], ty[0]);
    } else {
      $.Landscape.InsertMaterial(mat, P(tx, 0), P(ty, 0), 0, 1);
    }
    $.MassMover.Create(tx[0], ty[0], !(Random(3) !== 0));
    return true;
  }

  Init(tx, ty) {
    if (!$.Inside$i32$i32$i32$3(tx, 0, $.Landscape.GetWidth() - 1 | 0) || !$.Inside$i32$i32$i32$3(ty, 0, $.Landscape.GetHeight() - 1 | 0)) {
      return false;
    }
    this.Mat = $.GBackMat(tx, ty);
    this.x = tx;
    this.y = ty;
    $.MassMover.Count = $.MassMover.Count + 1 | 0;
    return this.Mat !== -1;
  }

  Corrosion(dx, dy) {
    let tmat = $.GBackMat(this.x + dx | 0, this.y + dy | 0);
    let pReact = $.MaterialMap.GetReactionUnsafe(this.Mat, tmat);
    if (pReact != null) {
      let xdir = $.Fix0$C4Real.$clone();
      let ydir = $.Fix0$C4Real.$clone();
      if (pReact.pFunc(pReact, P(this, "x"), P(this, "y"), this.x + dx | 0, this.y + dy | 0, xdir, ydir, P(this, "Mat"), tmat, 2 /*meeMassMove*/, null)) {
        return true;
      }
    }
    return false;
  }

  $clone() { return new C4MassMover().$assign(this); }
  $assign(o) {
    this.Mat = o.Mat;
    this.x = o.x;
    this.y = o.y;
    return this;
  }
}

export class C4MassMoverSet {
  Count = 0;
  CreatePtr = 0;
  Set = $oarr(10000, () => new C4MassMover());

  init() {
    this.Set = $oarr(10000, () => new C4MassMover());
    C4MassMoverSet.prototype.Default.call(this);
    return this;
  }

  $dtor() {
    C4MassMoverSet.prototype.Clear.call(this);
  }

  Copy(rSet) {
    this.Clear();
    this.Count = rSet.Count;
    this.CreatePtr = rSet.CreatePtr;
    for (let cnt = 0; cnt < 10000; cnt = cnt + 1 | 0) {
      this.Set[cnt].$assign(rSet.Set[cnt]);
    }
  }

  Synchronize() {
    this.Consolidate();
  }

  Default() {
    let cnt = 0;
    for (cnt = 0; cnt < 10000; cnt = cnt + 1 | 0) {
      this.Set[cnt].Mat = -1;
    }
    this.Count = 0;
    this.CreatePtr = 0;
  }

  Clear() {
  }

  Draw() {
  }

  Execute() {
    let cmm = null;
    this.Count = 0;
    for (let speed = 2; speed > 0; speed = speed - 1 | 0) {
      cmm = this.Set[9999];
      for (let cnt = 0; cnt < 10000; cnt = cnt + 1 | 0, cmm = $oadd(cmm, -1)) {
        if (cmm.Mat !== -1) {
          this.Count = this.Count + 1 | 0;
          cmm.Execute();
        }
      }
    }
  }

  Create(x, y, fExecute = false) {
    if (this.Count === 10000) {
      return false;
    }
    if ($.Config.General.DebugRec !== 0) {
      let rc = new $.C4RCMassMover();
      rc.x = x;
      rc.y = y;
      $.AddDbgRec(135 /*RCT_MMC*/, $bytesView(rc, [["x", 0, "i32", 0], ["y", 4, "i32", 0]], 8), 8);
    }
    let cptr = this.CreatePtr;
    do {
      cptr = cptr + 1 | 0;
      if (cptr >= 10000) {
        cptr = 0;
      }
      if (this.Set[cptr].Mat === -1) {
        if (!this.Set[cptr].Init(x, y)) {
          return false;
        }
        this.CreatePtr = cptr;
        if (fExecute) {
          this.Set[cptr].Execute();
        }
        return true;
      }
    } while (cptr !== this.CreatePtr);
    return false;
  }

  Load(hGroup) {
    this.Clear();
    this.Default();
    const iBinSize = [0];
    let iMoverSize = 12;
    if (!hGroup.AccessEntry(S("MassMover.ocb"), P(iBinSize, 0))) {
      return false;
    }
    if (iBinSize[0] % iMoverSize !== 0) {
      return false;
    }
    this.Count = Math.trunc(iBinSize[0] / iMoverSize) | 0;
    if (!hGroup.Read$px$u64($bytesView($oat(this.Set, 0), [["Mat", 0, "i32", 0], ["x", 4, "i32", 0], ["y", 8, "i32", 0]], 12), iBinSize[0])) {
      return false;
    }
    return true;
  }

  Save(hGroup) {
    let cnt = 0;
    this.Consolidate();
    this.Count = 0;
    for (cnt = 0; cnt < 10000; cnt = cnt + 1 | 0) {
      if (this.Set[cnt].Mat !== -1) {
        this.Count = this.Count + 1 | 0;
      }
    }
    if (this.Count === 0) {
      hGroup.Delete(S("MassMover.ocb"));
      return true;
    }
    if (!hGroup.Add$pi8$px$i32$b$b$b(S("MassMover.ocb"), $bytesView($oat(this.Set, 0), [["Mat", 0, "i32", 0], ["x", 4, "i32", 0], ["y", 8, "i32", 0]], 12), $u64n(this.Count) * 12 | 0)) {
      return false;
    }
    return true;
  }

  Consolidate() {
    let iSpot = 0;
    let iPtr = 0;
    let iConsolidated = 0;
    for (iSpot = -1, iPtr = 0, iConsolidated = 0; iPtr < 10000; iPtr = iPtr + 1 | 0) {
      if (this.Set[iPtr].Mat === -1) {
        if (iSpot === -1) {
          iSpot = iPtr;
        }
      } else if (iSpot !== -1) {
        this.Set[iSpot].$assign(this.Set[iPtr]);
        this.Set[iPtr].Mat = -1;
        iConsolidated = iConsolidated + 1 | 0;
        for (; iSpot < iPtr; iSpot = iSpot + 1 | 0) {
          if (this.Set[iSpot].Mat === -1) {
            break;
          }
        }
        if (iSpot === iPtr) {
          iSpot = -1;
        }
      }
    }
    this.CreatePtr = 0;
  }

  $clone() { return new C4MassMoverSet().$assign(this); }
  $assign(o) {
    this.Count = o.Count;
    this.CreatePtr = o.CreatePtr;
    this.Set = $own(o.Set.map(($e0) => $e0.$clone()));
    return this;
  }
}



export function $init(): void {
  $.C4MassMoverChunk$C4MassMover = 10000;
  $.MassMover = new C4MassMoverSet(); $.MassMover.init();
}

Object.assign($, { C4MassMover, C4MassMoverSet });
