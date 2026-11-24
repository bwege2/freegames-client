// @ts-nocheck
// OpenClonk 36de799: src/landscape/C4PXS.cpp, src/landscape/C4PXS.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $shr64n, $u64n, ftoi32 } from '../../rt/int.ts';
import { Random } from '../../rt/native.ts';
import { $bytesView, $oadd, $oarr, $oat, $oidx, $own, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $max, $vpush, StdMap } from '../../rt/std.ts';

export class C4PXS {
  Mat = -1;
  x = $.Fix0$C4Real.$clone();
  y = $.Fix0$C4Real.$clone();
  xdir = $.Fix0$C4Real.$clone();
  ydir = $.Fix0$C4Real.$clone();

  Execute() {
    if (true && $.Config.General.DebugRec !== 0) {
      let rc = new $.C4RCExecPXS().None();
      rc.x.$assign(this.x);
      rc.y.$assign(this.y);
      rc.iMat = this.Mat;
      rc.pos = 0;
      $.AddDbgRec(142 /*RCT_ExecPXS*/, $bytesView(rc, [["x.val", 0, "i32", 0], ["y.val", 4, "i32", 0], ["iMat", 8, "i32", 0], ["pos", 12, "i32", 0]], 16), 16);
    }
    let inmat = 0;
    if (!$.MatValid(this.Mat)) {
      this.Deactivate();
      return false;
    }
    if (this.x.op_lt$i32(0) || this.x.op_ge$i32($.Landscape.GetWidth()) || this.y.op_lt$i32(-10) || this.y.op_ge$i32($.Landscape.GetHeight())) {
      this.Deactivate();
      return false;
    }
    const iX = [$.fixtoi$C4Fixed(this.x)];
    const iY = [$.fixtoi$C4Fixed(this.y)];
    inmat = $.GBackMat(iX[0], iY[0]);
    let pReact = $.MaterialMap.GetReactionUnsafe(this.Mat, inmat);
    if (pReact != null && pReact.pFunc(pReact, P(iX, 0), P(iY, 0), iX[0], iY[0], this.xdir, this.ydir, P(this, "Mat"), inmat, 0 /*meePXSPos*/, null)) {
      this.Deactivate();
      return false;
    }
    this.ydir.op_addAssign$C4Fixed($.Landscape.GetGravity());
    if ($.GBackDensity(iX[0], iY[0] + 1 | 0) < $oidx($.MaterialMap.Map, this.Mat).Density) {
      let iWind = $.Weather.GetWind(iX[0], iY[0]);
      let txdir = $.itofix$i32$i32(iWind, 15).op_add$C4Fixed($.C4REAL256(Random(1200) - 600 >>> 0 | 0));
      let tydir = $.C4REAL256(Random(1200) - 600 >>> 0 | 0);
      let iWindDrift = $max($oidx($.MaterialMap.Map, this.Mat).WindDrift - 20 | 0, 0);
      this.xdir.op_addAssign$C4Fixed(txdir.op_sub$C4Fixed(this.xdir).op_mul$i32(iWindDrift).op_mul$C4Fixed($.WindDrift_Factor$C4PXS));
      this.ydir.op_addAssign$C4Fixed(tydir.op_sub$C4Fixed(this.ydir).op_mul$i32(iWindDrift).op_mul$C4Fixed($.WindDrift_Factor$C4PXS));
    }
    let ctcox = this.x.op_add$C4Fixed(this.xdir);
    let ctcoy = this.y.op_add$C4Fixed(this.ydir);
    let iToX = $.fixtoi$C4Fixed(ctcox);
    let iToY = $.fixtoi$C4Fixed(ctcoy);
    if ($.Inside$i32$i32$i32$3(iToX, 0, $.Landscape.GetWidth() - 1 | 0) && $.Inside$i32$i32$i32$3(iToY, 0, $.Landscape.GetHeight() - 1 | 0)) {
      if ($.Landscape._PathFree(iX[0], iY[0], iToX, iToY)) {
        this.x.$assign(ctcox);
        this.y.$assign(ctcoy);
        return true;
      }
    }
    let iX0 = iX[0];
    let iY0 = iY[0];
    const fStopMovement = [false];
    do {
      let inX = iX[0] + $.Sign$i32(iToX - iX[0] | 0) | 0;
      let inY = iY[0] + $.Sign$i32(iToY - iY[0] | 0) | 0;
      inmat = $.GBackMat(inX, inY);
      let pReact$2 = $.MaterialMap.GetReactionUnsafe(this.Mat, inmat);
      if (pReact$2 != null) {
        if (pReact$2.pFunc(pReact$2, P(iX, 0), P(iY, 0), inX, inY, this.xdir, this.ydir, P(this, "Mat"), inmat, 1 /*meePXSMove*/, P(fStopMovement, 0))) {
          this.Deactivate();
          return false;
        } else {
          if (fStopMovement[0]) {
            if (iX[0] !== iX0) {
              this.x.$assign($.itofix$i32(iX[0]));
            }
            if (iY[0] !== iY0) {
              this.y.$assign($.itofix$i32(iY[0]));
            }
            return true;
          }
        }
      }
      iX[0] = inX;
      iY[0] = inY;
    } while (iX[0] !== iToX || iY[0] !== iToY);
    this.x.$assign(ctcox);
    this.y.$assign(ctcoy);
    if (true && $.Config.General.DebugRec !== 0) {
      let rc = new $.C4RCExecPXS().None();
      rc.x.$assign(this.x);
      rc.y.$assign(this.y);
      rc.iMat = this.Mat;
      rc.pos = 1;
      $.AddDbgRec(142 /*RCT_ExecPXS*/, $bytesView(rc, [["x.val", 0, "i32", 0], ["y.val", 4, "i32", 0], ["iMat", 8, "i32", 0], ["pos", 12, "i32", 0]], 16), 16);
    }
    return true;
  }

  Deactivate() {
    if (true && $.Config.General.DebugRec !== 0) {
      let rc = new $.C4RCExecPXS().None();
      rc.x.$assign(this.x);
      rc.y.$assign(this.y);
      rc.iMat = this.Mat;
      rc.pos = 2;
      $.AddDbgRec(142 /*RCT_ExecPXS*/, $bytesView(rc, [["x.val", 0, "i32", 0], ["y.val", 4, "i32", 0], ["iMat", 8, "i32", 0], ["pos", 12, "i32", 0]], 16), 16);
    }
    this.Mat = -1;
  }

  $clone() { return new C4PXS().$assign(this); }
  $assign(o) {
    this.Mat = o.Mat;
    this.x.$assign(o.x);
    this.y.$assign(o.y);
    this.xdir.$assign(o.xdir);
    this.ydir.$assign(o.ydir);
    return this;
  }
}

export class C4PXSSystem {
  Count = 0;
  PXS = $oarr(10000, () => new C4PXS());

  init() {
    this.PXS = $oarr(10000, () => new C4PXS());
    C4PXSSystem.prototype.Default.call(this);
    return this;
  }

  $dtor() {
    C4PXSSystem.prototype.Clear.call(this);
  }

  Default() {
    this.Count = 0;
  }

  Clear() {
    this.Count = 0;
  }

  Execute() {
    let $t1;
    for (let i = 0; i < this.Count; i = i + 1) {
      if (!this.PXS[i].Execute()) {
        0;
        this.PXS[($t1 = i, i = i - 1, $t1)].$assign(this.PXS[(this.Count = this.Count - 1)]);
      }
    }
  }

  Draw(cgo) {
    let VisibleRect = new $.C4Rect().init$i32$i32$i32$i32(ftoi32(cgo.TargetX), ftoi32(cgo.TargetY), ftoi32(cgo.Wdt), ftoi32(cgo.Hgt));
    VisibleRect.Enlarge$i32(20);
    let pixVtx = [];
    let lineVtx = [];
    let bltVtx = new StdMap();
    let cgox = Math.fround(cgo.X - cgo.TargetX);
    let cgoy = Math.fround(cgo.Y - cgo.TargetY);
    for (let i = 0; i < this.Count; i = i + 1) {
      let pxp = $oat(this.PXS, i);
      if (pxp.Mat !== -1 && VisibleRect.Contains$i32$i32($.fixtoi$C4Fixed(pxp.x), $.fixtoi$C4Fixed(pxp.y))) {
        let pMat = $oadd($.MaterialMap.Map, pxp.Mat);
        let dwMatClr = $.Landscape.GetPal().GetClr($.Mat2PixColDefault(pxp.Mat));
        if (pMat.PXSFace.Surface != null) {
          const pnx = [0];
          const pny = [0];
          pMat.PXSFace.GetPhaseNum(P(pnx, 0), P(pny, 0));
          let fcWdt = ftoi32(pMat.PXSFace.Wdt);
          let fcHgt = ftoi32(pMat.PXSFace.Hgt);
          let size = $shr64n(0x41c64e6d * i + 12345, 3) >>> 0;
          let z = Math.fround(Math.fround(pMat.PXSGfxSize) * Math.fround(0.625 + Math.fround(Math.fround(0.0500000007) * Math.fround(size % 16 | 0))));
          pny[0] = Math.trunc(i / $u64n(pnx[0])) % $u64n(pny[0]) | 0;
          pnx[0] = i % $u64n(pnx[0]) | 0;
          let w = z;
          let h = Math.fround(Math.fround(z * Math.fround(fcHgt)) / Math.fround(fcWdt));
          let x1 = Math.fround(Math.fround($.fixtof(pxp.x) + cgox) + Math.fround(Math.fround(z * Math.fround(pMat.PXSGfxRt.tx)) / Math.fround(fcWdt)));
          let y1 = Math.fround(Math.fround($.fixtof(pxp.y) + cgoy) + Math.fround(Math.fround(z * Math.fround(pMat.PXSGfxRt.ty)) / Math.fround(fcHgt)));
          let x2 = Math.fround(x1 + w);
          let y2 = Math.fround(y1 + h);
          let sfcWdt = Math.fround(pMat.PXSFace.Surface.Wdt);
          let sfcHgt = Math.fround(pMat.PXSFace.Surface.Hgt);
          const vtx = $oarr(6, () => new $.C4BltVertex());
          vtx[0].tx = Math.fround(Math.fround(Math.fround(Math.fround(pnx[0]) + 0) * Math.fround(fcWdt)) / sfcWdt);
          vtx[0].ty = Math.fround(Math.fround(Math.fround(Math.fround(pny[0]) + 0) * Math.fround(fcHgt)) / sfcHgt);
          vtx[0].ftx = x1;
          vtx[0].fty = y1;
          vtx[1].tx = Math.fround(Math.fround(Math.fround(Math.fround(pnx[0]) + 1) * Math.fround(fcWdt)) / sfcWdt);
          vtx[1].ty = Math.fround(Math.fround(Math.fround(Math.fround(pny[0]) + 0) * Math.fround(fcHgt)) / sfcHgt);
          vtx[1].ftx = x2;
          vtx[1].fty = y1;
          vtx[2].tx = Math.fround(Math.fround(Math.fround(Math.fround(pnx[0]) + 1) * Math.fround(fcWdt)) / sfcWdt);
          vtx[2].ty = Math.fround(Math.fround(Math.fround(Math.fround(pny[0]) + 1) * Math.fround(fcHgt)) / sfcHgt);
          vtx[2].ftx = x2;
          vtx[2].fty = y2;
          vtx[3].tx = Math.fround(Math.fround(Math.fround(Math.fround(pnx[0]) + 0) * Math.fround(fcWdt)) / sfcWdt);
          vtx[3].ty = Math.fround(Math.fround(Math.fround(Math.fround(pny[0]) + 1) * Math.fround(fcHgt)) / sfcHgt);
          vtx[3].ftx = x1;
          vtx[3].fty = y2;
          $.DwTo4UB(0xffffffff, vtx[0].color);
          $.DwTo4UB(0xffffffff, vtx[1].color);
          $.DwTo4UB(0xffffffff, vtx[2].color);
          $.DwTo4UB(0xffffffff, vtx[3].color);
          vtx[4].$assign(vtx[2]);
          vtx[5].$assign(vtx[0]);
          const vec = bltVtx.entry(pxp.Mat, () => []).second;
          $vpush(vec, vtx[0].$clone());
          $vpush(vec, vtx[1].$clone());
          $vpush(vec, vtx[2].$clone());
          $vpush(vec, vtx[3].$clone());
          $vpush(vec, vtx[4].$clone());
          $vpush(vec, vtx[5].$clone());
        } else {
          if ($.fixtoi$C4Fixed(pxp.xdir) !== 0 || $.fixtoi$C4Fixed(pxp.ydir) !== 0) {
            let len = $.fixtoi$C4Fixed($.Abs$C4Fixed(pxp.xdir.$clone()).op_add$C4Fixed($.Abs$C4Fixed(pxp.ydir.$clone())));
            let dwMatClrLen = (($max(dwMatClr >>> 24 | 0, 195 - ((195 - (dwMatClr >>> 24) >>> 0) / (len >>> 0) >>> 0) >>> 0 | 0) >>> 0 << 24) >>> 0 | (dwMatClr & 0xffffff) >>> 0) >>> 0;
            let begin = new $.C4BltVertex();
            let end = new $.C4BltVertex();
            begin.ftx = Math.fround($.fixtof(pxp.x.op_sub$C4Fixed(pxp.xdir)) + cgox);
            begin.fty = Math.fround($.fixtof(pxp.y.op_sub$C4Fixed(pxp.ydir)) + cgoy);
            end.ftx = Math.fround($.fixtof(pxp.x) + cgox);
            end.fty = Math.fround($.fixtof(pxp.y) + cgoy);
            $.DwTo4UB(dwMatClrLen, begin.color);
            $.DwTo4UB(dwMatClrLen, end.color);
            $vpush(lineVtx, begin.$clone());
            $vpush(lineVtx, end.$clone());
          } else {
            let vtx = new $.C4BltVertex();
            vtx.ftx = Math.fround($.fixtof(pxp.x) + cgox);
            vtx.fty = Math.fround($.fixtof(pxp.y) + cgoy);
            $.DwTo4UB(dwMatClr, vtx.color);
            $vpush(pixVtx, vtx.$clone());
          }
        }
      }
    }
    if (!(pixVtx.length === 0)) {
      $.pDraw.PerformMultiPix(cgo.Surface, pixVtx[0], pixVtx.length >>> 0, null);
    }
    if (!(lineVtx.length === 0)) {
      $.pDraw.PerformMultiLines(cgo.Surface, lineVtx[0], lineVtx.length >>> 0, 1, null);
    }
    if ($.Config.Graphics.PXSGfx === 0) {
      return;
    }
    for (let iter = bltVtx.begin(); !iter.eq(bltVtx.end()); iter.inc()) {
      let pMat = $oadd($.MaterialMap.Map, iter.v.first);
      $.pDraw.PerformMultiTris(cgo.Surface, iter.v.second[0], iter.v.second.length >>> 0, null, pMat.PXSFace.Surface.texture, null, null, 0, null);
    }
  }

  Cast(mat, num, tx, ty, level) {
    let cnt = 0;
    for (cnt = 0; cnt < num; cnt = cnt + 1 | 0) {
      let xdir = $.itofix$i32(Random((level + 1 | 0) >>> 0) - ((level / 2 | 0) >>> 0) >>> 0 | 0);
      xdir.op_divAssign$i32(10);
      let ydir = $.itofix$i32(Random((level + 1 | 0) >>> 0) - (level >>> 0) >>> 0 | 0);
      ydir.op_divAssign$i32(10);
      this.Create(mat, $.itofix$i32(tx), $.itofix$i32(ty), xdir.$clone(), ydir.$clone());
    }
  }

  Create(mat, ix, iy, ixdir = $.Fix0$C4Real.$clone(), iydir = $.Fix0$C4Real.$clone()) {
    let pxp = null;
    if (!$.MatValid(mat)) {
      return false;
    }
    if (!((pxp = this.New()) != null)) {
      return false;
    }
    pxp.Mat = mat;
    pxp.x.$assign(ix);
    pxp.y.$assign(iy);
    pxp.xdir.$assign(ixdir);
    pxp.ydir.$assign(iydir);
    return true;
  }

  Load(hGroup) {
    const iBinSize = [0];
    let PXSNum = 0;
    if (!hGroup.AccessEntry(S("PXS.ocb"), P(iBinSize, 0))) {
      return false;
    }
    this.Clear();
    const iNumForm = [1];
    if (iBinSize[0] % 20 === 4) {
      if (!hGroup.Read$px$u64(P(iNumForm, 0), 4)) {
        return false;
      }
      if (!$.Inside$i32$i32$i32$3(iNumForm[0], 1, 2)) {
        return false;
      }
      iBinSize[0] = iBinSize[0] - 4;
    } else if (iBinSize[0] % 20 !== 0) {
      return false;
    }
    PXSNum = Math.trunc(iBinSize[0] / 20);
    if (PXSNum > 10000) {
      return false;
    }
    if (!hGroup.Read$px$u64($bytesView($oat(this.PXS, 0), [["Mat", 0, "i32", 0], ["x.val", 4, "i32", 0], ["y.val", 8, "i32", 0], ["xdir.val", 12, "i32", 0], ["ydir.val", 16, "i32", 0]], 20), iBinSize[0])) {
      return false;
    }
    this.Count = PXSNum;
    for (let i = 0; i < this.Count; i = i + 1) {
      let pxp = $oat(this.PXS, i);
      if (pxp.Mat !== -1) {
        if (iNumForm[0] === 2) {
          $.FLOAT_TO_FIXED(pxp.x);
          $.FLOAT_TO_FIXED(pxp.y);
          $.FLOAT_TO_FIXED(pxp.xdir);
          $.FLOAT_TO_FIXED(pxp.ydir);
        }
      }
    }
    return true;
  }

  Save(hGroup) {
    if (this.Count === 0) {
      hGroup.Delete(S("PXS.ocb"));
      return true;
    }
    let hTempFile = new $.CStdFile().init();
    if (!hTempFile.Create($.Config.AtTempPath(S("~PXS.tmp")))) {
      return false;
    }
    const iNumFormat = [1];
    if (!hTempFile.Write(P(iNumFormat, 0), 4)) {
      return false;
    }
    if (!hTempFile.Write($bytesView($oat(this.PXS, 0), [["Mat", 0, "i32", 0], ["x.val", 4, "i32", 0], ["y.val", 8, "i32", 0], ["xdir.val", 12, "i32", 0], ["ydir.val", 16, "i32", 0]], 20), this.Count * 20 | 0)) {
      return false;
    }
    if (!hTempFile.Close$ppStdBuf()) {
      return false;
    }
    if (!hGroup.Move($.Config.AtTempPath(S("~PXS.tmp")), S("PXS.ocb"))) {
      return false;
    }
    return true;
  }

  GetCount$v() {
    return this.Count | 0;
  }

  GetCount$i32(mat) {
    let result = 0;
    for (let i = 0; i < this.Count; i = i + 1) {
      if (this.PXS[i].Mat === mat) {
        result = result + 1 | 0;
      }
    }
    return result;
  }

  GetCount$i32$i32$i32$i32$i32(mat, x, y, wdt, hgt) {
    let result = 0;
    for (let i = 0; i < this.Count; i = i + 1) {
      let pxp = $oat(this.PXS, i);
      if (pxp.Mat === mat || mat === -1) {
        if ($.Inside$C4Fixed$i32$i32(pxp.x.$clone(), x, (x + wdt | 0) - 1 | 0) && $.Inside$C4Fixed$i32$i32(pxp.y.$clone(), y, (y + hgt | 0) - 1 | 0)) {
          result = result + 1 | 0;
        }
      }
    }
    return result;
  }

  New() {
    let $t1;
    if (this.Count < 10000) {
      return $oat(this.PXS, ($t1 = this.Count, this.Count = this.Count + 1, $t1));
    }
    return null;
  }

  $clone() { return new C4PXSSystem().$assign(this); }
  $assign(o) {
    this.Count = o.Count;
    this.PXS = $own(o.PXS.map(($e0) => $e0.$clone()));
    return this;
  }
}




export function $init(): void {
  $.PXSMax$C4PXS = 10000;
  $.WindDrift_Factor$C4PXS = $.itofix$i32$i32(1, 800);
  $.PXS = new C4PXSSystem(); $.PXS.init();
}

Object.assign($, { C4PXS, C4PXSSystem });
