// @ts-nocheck
// OpenClonk 36de799: src/graphics/C4Draw.cpp, src/graphics/C4Draw.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $u64n, ftoi32 } from '../../rt/int.ts';
import { c$ceil, c$cos, c$floor, c$memcpy, c$pow, c$sin, c$sqrt } from '../../rt/libc.ts';
import { $oarr, $oat, $oidx, $own, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete, $max, $min } from '../../rt/std.ts';

export class C4Pattern {
  sfcPattern32 = null;
  CachedPattern = null;
  Wdt = 0;
  Hgt = 0;
  Zoom = 0;

  getSurface() {
    return this.sfcPattern32;
  }

  PatternClr(iX, iY) {
    if (this.CachedPattern == null) {
      return 0;
    }
    iX = iX % (this.Wdt >>> 0);
    iY = iY % (this.Hgt >>> 0);
    return this.CachedPattern.a[this.CachedPattern.o + ((Math.imul(iY, this.Wdt >>> 0) >>> 0) + iX >>> 0)];
  }

  Set(sfcSource, iZoom = 0) {
    if (sfcSource == null) {
      return false;
    }
    this.Clear();
    this.sfcPattern32 = sfcSource;
    this.sfcPattern32.Lock();
    this.Wdt = this.sfcPattern32.Wdt;
    this.Hgt = this.sfcPattern32.Hgt;
    this.Zoom = iZoom;
    this.CachedPattern = P(new Uint32Array($u64n(Math.imul(this.Wdt, this.Hgt))), 0);
    if (this.CachedPattern == null) {
      return false;
    }
    for (let y = 0; y < this.Hgt; y = y + 1 | 0) {
      for (let x = 0; x < this.Wdt; x = x + 1 | 0) {
        this.CachedPattern.a[this.CachedPattern.o + (Math.imul(y, this.Wdt) + x | 0)] = this.sfcPattern32.GetPixDw(x, y, false);
      }
    }
    return true;
  }

  SetZoom(iZoom) {
    this.Zoom = iZoom;
  }

  Clear() {
    if (this.sfcPattern32 != null) {
      this.sfcPattern32.Unlock();
      this.sfcPattern32 = null;
    }
    $delete(this.CachedPattern);
    this.CachedPattern = null;
  }

  init() {
    this.sfcPattern32 = null;
    this.CachedPattern = null;
    this.Zoom = 0;
    return this;
  }

  $dtor() {
    C4Pattern.prototype.Clear.call(this);
  }

  $clone() { return new C4Pattern().$assign(this); }
  $assign(nPattern) {
    this.sfcPattern32 = nPattern.sfcPattern32;
    if (this.sfcPattern32 != null) {
      this.sfcPattern32.Lock();
    }
    $delete(this.CachedPattern);
    if (nPattern.CachedPattern != null) {
      this.CachedPattern = P(new Uint32Array($u64n(Math.imul(this.sfcPattern32.Wdt, this.sfcPattern32.Hgt))), 0);
      c$memcpy(this.CachedPattern, nPattern.CachedPattern, $u64n(Math.imul(Math.imul(this.sfcPattern32.Wdt, this.sfcPattern32.Hgt), 4)));
    } else {
      this.CachedPattern = null;
    }
    this.Wdt = nPattern.Wdt;
    this.Hgt = nPattern.Hgt;
    this.Zoom = nPattern.Zoom;
    return this;
  }
}

export class C4BltVertex {
  static $layout = [["tx", 0, "f32", 0], ["ty", 4, "f32", 0], ["color", 8, "u8", 4], ["ftx", 12, "f32", 0], ["fty", 16, "f32", 0], ["ftz", 20, "f32", 0]];
  static $size = 24;
  tx = 0;
  ty = 0;
  color = new Uint8Array(4);
  ftx = 0;
  fty = 0;
  ftz = 0;

  $clone() { return new C4BltVertex().$assign(this); }
  $assign(o) {
    this.tx = o.tx;
    this.ty = o.ty;
    this.color = o.color.slice();
    this.ftx = o.ftx;
    this.fty = o.fty;
    this.ftz = o.ftz;
    return this;
  }
}

export class ZoomData {
  static $layout = [["Zoom", 0, "f32", 0], ["X", 4, "f32", 0], ["Y", 8, "f32", 0]];
  static $size = 12;
  Zoom = 0;
  X = 0;
  Y = 0;

  $clone() { return new ZoomData().$assign(this); }
  $assign(o) {
    this.Zoom = o.Zoom;
    this.X = o.X;
    this.Y = o.Y;
    return this;
  }
}

export class C4Draw {
  static COLOR_DEPTH;
  static COLOR_DEPTH_BYTES;
  pApp = null;
  Active = false;
  gamma = $oarr(9, () => new Float32Array(3));
  gammaOut = new Float32Array(3);
  MaxTexSize = 0;
  scriptUniform = new $.C4ScriptUniform().init();
  fClipX1 = 0;
  fClipY1 = 0;
  fClipX2 = 0;
  fClipY2 = 0;
  fStClipX1 = 0;
  fStClipY1 = 0;
  fStClipX2 = 0;
  fStClipY2 = 0;
  iClipX1 = 0;
  iClipY1 = 0;
  iClipX2 = 0;
  iClipY2 = 0;
  ClipAll = false;
  PrimaryLocked = false;
  RenderTarget = null;
  BlitModulated = false;
  BlitModulateClr = 0;
  dwBlitMode = 0;
  pFoW = null;
  ZoomX = 0;
  ZoomY = 0;
  MeshTransform = null;
  fUsePerspective = false;
  Zoom = 0;

  init() {
    this.MaxTexSize = 0;
    this.scriptUniform = new $.C4ScriptUniform().init();
    return this;
  }

  $dtor() {
    $.pDraw = null;
  }

  Init(pApp, iXRes, iYRes, _iMonitor) {
    this.pApp = pApp;
    pApp.pWindow.pSurface = new $.C4Surface().init$pC4AbstractApp$pC4Window(pApp, pApp.pWindow);
    if (!this.RestoreDeviceObjects()) {
      return false;
    }
    if (!this.CreatePrimaryClipper(iXRes, iYRes)) {
      return this.Error_(S("  Clipper failure."));
    }
    return true;
  }

  Clear() {
    this.ResetGamma();
    this.Active = this.BlitModulated = false;
    this.dwBlitMode = 0;
  }

  Default() {
    this.RenderTarget = null;
    this.ClipAll = false;
    this.Active = false;
    this.BlitModulated = false;
    this.dwBlitMode = 0;
    this.ResetGamma();
    this.pFoW = null;
    this.ZoomX = Math.fround(0);
    this.ZoomY = Math.fround(0);
    this.Zoom = Math.fround(1);
    this.MeshTransform = null;
    this.fUsePerspective = false;
    this.scriptUniform.Clear();
  }

  CreateContext(_0, _1) {
    return null;
  }

  GetPrimaryClipper(rX1, rY1, rX2, rY2) {
    rX1.a[rX1.o] = ftoi32(this.fClipX1);
    rY1.a[rY1.o] = ftoi32(this.fClipY1);
    rX2.a[rX2.o] = ftoi32(this.fClipX2);
    rY2.a[rY2.o] = ftoi32(this.fClipY2);
    return true;
  }

  SetPrimaryClipper(iX1, iY1, iX2, iY2) {
    this.fClipX1 = Math.fround(iX1);
    this.fClipY1 = Math.fround(iY1);
    this.fClipX2 = Math.fround(iX2);
    this.fClipY2 = Math.fround(iY2);
    this.iClipX1 = iX1;
    this.iClipY1 = iY1;
    this.iClipX2 = iX2;
    this.iClipY2 = iY2;
    this.UpdateClipper();
    return true;
  }

  SubPrimaryClipper(iX1, iY1, iX2, iY2) {
    this.SetPrimaryClipper($max(iX1, this.iClipX1), $max(iY1, this.iClipY1), $min(iX2, this.iClipX2), $min(iY2, this.iClipY2));
    return true;
  }

  GetClipRect() {
    let iWdt = ($min(this.iClipX2, this.RenderTarget.Wdt - 1 | 0) - this.iClipX1 | 0) + 1 | 0;
    let iHgt = ($min(this.iClipY2, this.RenderTarget.Hgt - 1 | 0) - this.iClipY1 | 0) + 1 | 0;
    let iX = this.iClipX1;
    if (iX < 0) {
      iWdt = iWdt + iX | 0;
      iX = 0;
    }
    let iY = this.iClipY1;
    if (iY < 0) {
      iHgt = iHgt + iY | 0;
      iY = 0;
    }
    return new $.C4Rect().init$i32$i32$i32$i32(iX, iY, iWdt, iHgt);
  }

  GetOutRect() {
    return new $.C4Rect().init$i32$i32$i32$i32(0, 0, this.RenderTarget.Wdt, this.RenderTarget.Hgt);
  }

  StorePrimaryClipper() {
    this.fStClipX1 = this.fClipX1;
    this.fStClipY1 = this.fClipY1;
    this.fStClipX2 = this.fClipX2;
    this.fStClipY2 = this.fClipY2;
    return true;
  }

  RestorePrimaryClipper() {
    this.SetPrimaryClipper(ftoi32(this.fStClipX1), ftoi32(this.fStClipY1), ftoi32(this.fStClipX2), ftoi32(this.fStClipY2));
    return true;
  }

  NoPrimaryClipper() {
    this.SetPrimaryClipper(0, 0, 439832, 439832);
    return true;
  }

  ApplyPrimaryClipper(_sfcSurface) {
    return true;
  }

  DetachPrimaryClipper(_sfcSurface) {
    return true;
  }

  GetSurfaceSize(sfcSurface, iWdt, iHgt) {
    return sfcSurface.GetSurfaceSize(iWdt, iHgt);
  }

  Grayscale(sfcSfc, iOffset = 0) {
    if (sfcSfc == null) {
      return;
    }
    let xcnt = 0;
    let ycnt = 0;
    let wdt = sfcSfc.Wdt;
    let hgt = sfcSfc.Hgt;
    if (!sfcSfc.Lock()) {
      return;
    }
    for (ycnt = 0; ycnt < hgt; ycnt = ycnt + 1 | 0) {
      for (xcnt = 0; xcnt < wdt; xcnt = xcnt + 1 | 0) {
        let dwColor = sfcSfc.GetPixDw(xcnt, ycnt, false);
        let r = dwColor >>> 16 & 0xff;
        let g = (dwColor & 0xffff) >> 8 & 0xff;
        let b = dwColor & 0xff;
        let a = dwColor >>> 24;
        let gray = $.Clamp$i32$i32$i32((((r + g >>> 0) + b >>> 0) / 3 >>> 0) + (iOffset >>> 0) >>> 0 | 0, 0, 255);
        sfcSfc.SetPixDw(xcnt, ycnt, $.RGBA(gray >>> 0, gray >>> 0, gray >>> 0, a));
      }
    }
    sfcSfc.Unlock();
  }

  LockingPrimary() {
    this.PrimaryLocked = true;
  }

  PrimaryUnlocked() {
    this.PrimaryLocked = false;
  }

  BlitLandscape(sfcSource, fx, fy, sfcTarget, tx, ty, wdt, hgt) {
    this.Blit(sfcSource, fx, fy, wdt, hgt, sfcTarget, tx, ty, wdt, hgt, false);
  }

  Blit8Fast(sfcSource, fx, fy, sfcTarget, tx, ty, wdt, hgt) {
    0;
    let fRender = sfcTarget.IsRenderTarget();
    if (!fRender) {
      if (!sfcTarget.Lock()) {
        return;
      }
    }
    const tfx = [Math.fround(tx)];
    const tfy = [Math.fround(ty)];
    let twdt = Math.fround(wdt);
    let thgt = Math.fround(hgt);
    if (this.Zoom !== 1) {
      this.ApplyZoom(P(tfx, 0), P(tfy, 0));
      twdt = Math.fround(twdt * this.Zoom);
      thgt = Math.fround(thgt * this.Zoom);
    }
    if (!('C4Draw$Blit8Fast$BUF_SIZE' in $)) $.C4Draw$Blit8Fast$BUF_SIZE = 1024;
    let vertices = $oat($oarr(1024, () => new C4BltVertex()), 0);
    let bufcnt = 0;
    for (let ycnt = 0; Math.fround(ycnt) < thgt; ycnt = ycnt + 1 | 0) {
      for (let xcnt = 0; Math.fround(xcnt) < twdt; xcnt = xcnt + 1 | 0) {
        let byPix = sfcSource.GetPix(ftoi32(Math.fround(Math.fround(fx) + Math.fround(Math.fround(Math.imul(wdt, xcnt)) / twdt))), ftoi32(Math.fround(Math.fround(fy) + Math.fround(Math.fround(Math.imul(hgt, ycnt)) / thgt))));
        let dwClr = byPix !== 0 ? sfcSource.pPal.GetClr(byPix) : 0;
        $oidx(vertices, bufcnt).ftx = Math.fround(Math.fround(tx) + Math.fround(Math.fround(xcnt) / this.Zoom));
        $oidx(vertices, bufcnt).fty = Math.fround(Math.fround(ty) + Math.fround(Math.fround(ycnt) / this.Zoom));
        DwTo4UB(dwClr, $oidx(vertices, bufcnt).color);
        bufcnt = bufcnt + 1 | 0;
        if (bufcnt === 1024) {
          this.PerformMultiPix(sfcTarget, vertices, 1024, null);
          bufcnt = 0;
        }
      }
    }
    if (bufcnt > 0) {
      this.PerformMultiPix(sfcTarget, vertices, bufcnt >>> 0, null);
    }
    $delete(vertices);
    if (!fRender) {
      sfcTarget.Unlock();
    }
  }

  Blit(sfcSource, fx, fy, fwdt, fhgt, sfcTarget, tx, ty, twdt, thgt, fSrcColKey = false, pTransform = null) {
    return this.BlitUnscaled(sfcSource, Math.fround(fx * Math.fround(sfcSource.Scale)), Math.fround(fy * Math.fround(sfcSource.Scale)), Math.fround(fwdt * Math.fround(sfcSource.Scale)), Math.fround(fhgt * Math.fround(sfcSource.Scale)), sfcTarget, tx, ty, twdt, thgt, fSrcColKey, pTransform);
  }

  BlitUnscaled(sfcSource, fx, fy, fwdt, fhgt, sfcTarget, tx$, ty$, twdt, thgt, fSrcColKey = false, pTransform = null) {
    const tx = [tx$];
    const ty = [ty$];
    if (sfcSource == null || sfcTarget == null || twdt === 0 || thgt === 0 || fwdt === 0 || fhgt === 0) {
      return false;
    }
    if (!sfcTarget.IsRenderTarget()) {
      let t = new $.C4BltTransform();
      if (pTransform != null && this.Zoom !== 1) {
        $.C4BltTransform.prototype.Set.call(t, Math.fround(pTransform.mat[0] * this.Zoom), Math.fround(pTransform.mat[1] * this.Zoom), Math.fround(Math.fround(pTransform.mat[2] * this.Zoom) + Math.fround(this.ZoomX * Math.fround(Math.fround(1) - this.Zoom))), Math.fround(pTransform.mat[3] * this.Zoom), Math.fround(pTransform.mat[4] * this.Zoom), Math.fround(Math.fround(pTransform.mat[5] * this.Zoom) + Math.fround(this.ZoomY * Math.fround(Math.fround(1) - this.Zoom))), pTransform.mat[6], pTransform.mat[7], pTransform.mat[8]);
        pTransform = t;
      } else if (this.Zoom !== 1) {
        this.ApplyZoom(P(tx, 0), P(ty, 0));
        twdt = Math.fround(twdt * this.Zoom);
        thgt = Math.fround(thgt * this.Zoom);
      }
      return this.Blit8(sfcSource, ftoi32(fx), ftoi32(fy), ftoi32(fwdt), ftoi32(fhgt), sfcTarget, ftoi32(tx[0]), ftoi32(ty[0]), ftoi32(twdt), ftoi32(thgt), fSrcColKey, pTransform);
    }
    if (this.ClipAll) {
      return true;
    }
    if (twdt <= Math.fround(0) || thgt <= Math.fround(0)) {
      return false;
    }
    if (!this.PrepareRendering(sfcTarget)) {
      return false;
    }
    if (sfcSource.texture == null) {
      if (sfcSource.fPrimary) {
        return this.Blit8(sfcSource, ftoi32(fx), ftoi32(fy), ftoi32(fwdt), ftoi32(fhgt), sfcTarget, ftoi32(tx[0]), ftoi32(ty[0]), ftoi32(twdt), ftoi32(thgt), fSrcColKey);
      }
      return false;
    }
    let fBaseSfc = false;
    if (sfcSource.pMainSfc != null) {
      if (sfcSource.pMainSfc.texture != null) {
        fBaseSfc = true;
      }
    }
    let pTex = sfcSource.texture;
    const vertices = $oarr(6, () => new C4BltVertex());
    vertices[0].ftx = tx[0];
    vertices[0].fty = ty[0];
    vertices[1].ftx = Math.fround(tx[0] + twdt);
    vertices[1].fty = ty[0];
    vertices[2].ftx = Math.fround(tx[0] + twdt);
    vertices[2].fty = Math.fround(ty[0] + thgt);
    vertices[3].ftx = tx[0];
    vertices[3].fty = Math.fround(ty[0] + thgt);
    vertices[0].tx = Math.fround(fx / Math.fround(pTex.iSizeX));
    vertices[0].ty = Math.fround(fy / Math.fround(pTex.iSizeY));
    vertices[1].tx = Math.fround(Math.fround(fx + fwdt) / Math.fround(pTex.iSizeX));
    vertices[1].ty = Math.fround(fy / Math.fround(pTex.iSizeY));
    vertices[2].tx = Math.fround(Math.fround(fx + fwdt) / Math.fround(pTex.iSizeX));
    vertices[2].ty = Math.fround(Math.fround(fy + fhgt) / Math.fround(pTex.iSizeY));
    vertices[3].tx = Math.fround(fx / Math.fround(pTex.iSizeX));
    vertices[3].ty = Math.fround(Math.fround(fy + fhgt) / Math.fround(pTex.iSizeY));
    DwTo4UB(0xffffffff, vertices[0].color);
    DwTo4UB(0xffffffff, vertices[1].color);
    DwTo4UB(0xffffffff, vertices[2].color);
    DwTo4UB(0xffffffff, vertices[3].color);
    vertices[4].$assign(vertices[0]);
    vertices[5].$assign(vertices[2]);
    let pBaseTex = pTex;
    if (fBaseSfc) {
      pBaseTex = sfcSource.pMainSfc.texture;
    }
    let pNormalTex = null;
    if (sfcSource.pNormalSfc != null) {
      pNormalTex = sfcSource.pNormalSfc.texture;
    }
    let dwOverlayClrMod = (0xff000000 | sfcSource.ClrByOwnerClr) >>> 0;
    this.PerformMultiTris(sfcTarget, $oat(vertices, 0), 6, pTransform, pBaseTex, fBaseSfc ? pTex : null, pNormalTex, dwOverlayClrMod, null);
    return true;
  }

  RenderMesh(instance, sfcTarget, tx, ty, twdt, thgt, dwPlayerColor, pTransform) {
    if (!sfcTarget.IsRenderTarget()) {
      return false;
    }
    if (!this.PrepareRendering(sfcTarget)) {
      return false;
    }
    instance.UpdateBoneTransforms();
    let mat = $.StdMeshMatrix.Identity();
    if (this.MeshTransform != null) {
      mat.$assign($.op_mul$StdMeshMatrix$StdMeshMatrix(this.MeshTransform, mat));
    }
    instance.ReorderFaces(mat);
    this.PerformMesh(instance, tx, ty, twdt, thgt, dwPlayerColor, pTransform);
    return true;
  }

  Blit8(sfcSource, fx, fy, fwdt, fhgt, sfcTarget, tx, ty, twdt, thgt, fSrcColKey = false, pTransform = null) {
    if (pTransform == null) {
      return this.BlitSimple(sfcSource, fx, fy, fwdt, fhgt, sfcTarget, tx, ty, twdt, thgt, (fSrcColKey ? 1 : 0) !== 0);
    }
    if (fwdt === 0 || fhgt === 0) {
      return true;
    }
    if (!sfcSource.Lock()) {
      return false;
    }
    if (!sfcTarget.Lock()) {
      sfcSource.Unlock();
      return false;
    }
    let Transform = new $.C4BltTransform();
    Transform.SetMoveScale(Math.fround(Math.fround(tx) - Math.fround(Math.fround(Math.fround(fx) * Math.fround(twdt)) / Math.fround(fwdt))), Math.fround(Math.fround(ty) - Math.fround(Math.fround(Math.fround(fy) * Math.fround(thgt)) / Math.fround(fhgt))), Math.fround(Math.fround(twdt) / Math.fround(fwdt)), Math.fround(Math.fround(thgt) / Math.fround(fhgt)));
    Transform.op_mulAssign(pTransform);
    let TransformBack = new $.C4BltTransform();
    TransformBack.SetAsInv(Transform);
    const ttx0 = [Math.fround(tx)];
    const tty0 = [Math.fround(ty)];
    const ttx1 = [Math.fround(tx + twdt | 0)];
    const tty1 = [Math.fround(ty + thgt | 0)];
    const ttx2 = [ttx0[0]];
    const tty2 = [tty1[0]];
    const ttx3 = [ttx1[0]];
    const tty3 = [tty0[0]];
    pTransform.TransformPoint(P(ttx0, 0), P(tty0, 0));
    pTransform.TransformPoint(P(ttx1, 0), P(tty1, 0));
    pTransform.TransformPoint(P(ttx2, 0), P(tty2, 0));
    pTransform.TransformPoint(P(ttx3, 0), P(tty3, 0));
    let ttxMin = $max(ftoi32(Math.fround(c$floor($min($min(ttx0[0], ttx1[0]), $min(ttx2[0], ttx3[0]))))), 0);
    let ttxMax = $min(ftoi32(Math.fround(c$ceil($max($max(ttx0[0], ttx1[0]), $max(ttx2[0], ttx3[0]))))), sfcTarget.Wdt);
    let ttyMin = $max(ftoi32(Math.fround(c$floor($min($min(tty0[0], tty1[0]), $min(tty2[0], tty3[0]))))), 0);
    let ttyMax = $min(ftoi32(Math.fround(c$ceil($max($max(tty0[0], tty1[0]), $max(tty2[0], tty3[0]))))), sfcTarget.Hgt);
    for (let y = ttyMin; y < ttyMax; y = y + 1 | 0) {
      for (let x = ttxMin; x < ttxMax; x = x + 1 | 0) {
        const ffx = [Math.fround(x)];
        const ffy = [Math.fround(y)];
        TransformBack.TransformPoint(P(ffx, 0), P(ffy, 0));
        let ifx = ftoi32(ffx[0]);
        let ify = ftoi32(ffy[0]);
        if (ifx < fx || ify < fy || ifx >= (fx + fwdt | 0) || ify >= (fy + fhgt | 0)) {
          continue;
        }
        sfcTarget.BltPix(x, y, sfcSource, ifx, ify, !!fSrcColKey);
      }
    }
    sfcSource.Unlock();
    sfcTarget.Unlock();
    return true;
  }

  BlitSimple(sfcSource, fx, fy, fwdt, fhgt, sfcTarget, tx, ty, twdt, thgt, fTransparency = true) {
    if (sfcTarget.IsRenderTarget()) {
      return this.Blit(sfcSource, Math.fround(fx), Math.fround(fy), Math.fround(fwdt), Math.fround(fhgt), sfcTarget, Math.fround(tx), Math.fround(ty), Math.fround(twdt), Math.fround(thgt), true);
    }
    let xcnt = 0;
    let ycnt = 0;
    let tcx = 0;
    let tcy = 0;
    let cpcx = 0;
    let cpcy = 0;
    if (fwdt === 0 || fhgt === 0 || twdt === 0 || thgt === 0) {
      return false;
    }
    if (!sfcSource.Lock()) {
      return false;
    }
    if (!sfcTarget.Lock()) {
      sfcSource.Unlock();
      return false;
    }
    tcx = twdt / 2 | 0;
    tcy = thgt / 2 | 0;
    for (ycnt = 0; ycnt < thgt; ycnt = ycnt + 1 | 0) {
      if ($.Inside$i32$i32$i32$3(cpcy = ((ty + tcy | 0) - (thgt / 2 | 0) | 0) + ycnt | 0, 0, sfcTarget.Hgt - 1 | 0)) {
        for (xcnt = 0; xcnt < twdt; xcnt = xcnt + 1 | 0) {
          if ($.Inside$i32$i32$i32$3(cpcx = ((tx + tcx | 0) - (twdt / 2 | 0) | 0) + xcnt | 0, 0, sfcTarget.Wdt - 1 | 0)) {
            sfcTarget.BltPix(cpcx, cpcy, sfcSource, (Math.imul(xcnt, fwdt) / twdt | 0) + fx | 0, (Math.imul(ycnt, fhgt) / thgt | 0) + fy | 0, fTransparency);
          }
        }
      }
    }
    sfcSource.Unlock();
    sfcTarget.Unlock();
    return true;
  }

  BlitSurface(sfcSurface, sfcTarget, tx, ty, fBlitBase) {
    if (fBlitBase) {
      this.Blit(sfcSurface, 0, 0, Math.fround(sfcSurface.Wdt), Math.fround(sfcSurface.Hgt), sfcTarget, Math.fround(tx), Math.fround(ty), Math.fround(sfcSurface.Wdt), Math.fround(sfcSurface.Hgt), false);
      return true;
    } else {
      if (sfcSurface == null) {
        return false;
      }
      let pSfcBase = sfcSurface.pMainSfc;
      sfcSurface.pMainSfc = null;
      this.Blit(sfcSurface, 0, 0, Math.fround(sfcSurface.Wdt), Math.fround(sfcSurface.Hgt), sfcTarget, Math.fround(tx), Math.fround(ty), Math.fround(sfcSurface.Wdt), Math.fround(sfcSurface.Hgt), false);
      sfcSurface.pMainSfc = pSfcBase;
      return true;
    }
  }

  BlitSurfaceTile(sfcSurface, sfcTarget, iToX, iToY, iToWdt, iToHgt, iOffsetX, iOffsetY, shader_call) {
    if (!sfcTarget.IsRenderTarget()) {
      return false;
    }
    if ((sfcSurface.texture.iFlags & 1) === 0) {
      return false;
    }
    let sourceWdt = Math.fround(sfcSurface.Wdt);
    let sourceHgt = Math.fround(sfcSurface.Hgt);
    const vertices = $oarr(6, () => new C4BltVertex());
    vertices[0].ftx = iToX;
    vertices[0].fty = iToY;
    vertices[0].ftz = 0;
    vertices[0].tx = Math.fround(Math.fround(0 + iOffsetX) / sourceWdt);
    vertices[0].ty = Math.fround(Math.fround(0 + iOffsetY) / sourceHgt);
    DwTo4UB(0xffffffff, vertices[0].color);
    vertices[1].ftx = Math.fround(iToX + iToWdt);
    vertices[1].fty = iToY;
    vertices[1].ftz = 0;
    vertices[1].tx = Math.fround(Math.fround(iToWdt + iOffsetX) / sourceWdt);
    vertices[1].ty = Math.fround(Math.fround(0 + iOffsetY) / sourceHgt);
    DwTo4UB(0xffffffff, vertices[1].color);
    vertices[2].ftx = Math.fround(iToX + iToWdt);
    vertices[2].fty = Math.fround(iToY + iToHgt);
    vertices[2].ftz = 0;
    vertices[2].tx = Math.fround(Math.fround(iToWdt + iOffsetX) / sourceWdt);
    vertices[2].ty = Math.fround(Math.fround(iToHgt + iOffsetY) / sourceHgt);
    DwTo4UB(0xffffffff, vertices[2].color);
    vertices[3].ftx = iToX;
    vertices[3].fty = Math.fround(iToY + iToHgt);
    vertices[3].ftz = 0;
    vertices[3].tx = Math.fround(Math.fround(0 + iOffsetX) / sourceWdt);
    vertices[3].ty = Math.fround(Math.fround(iToHgt + iOffsetY) / sourceHgt);
    DwTo4UB(0xffffffff, vertices[3].color);
    vertices[4].$assign(vertices[0]);
    vertices[5].$assign(vertices[2]);
    this.PerformMultiTris(sfcTarget, $oat(vertices, 0), 6, null, sfcSurface.texture, null, null, 0, shader_call);
    return true;
  }

  TextOut(szText, rFont, fZoom, sfcDest, iTx, iTy, dwFCol = 0xffffffff, byForm = 0, fDoMarkup = true) {
    let Markup = new $.C4Markup().init(true);
    if (!('C4Draw$TextOut$szLinebuf' in $)) $.C4Draw$TextOut$szLinebuf = new Int8Array(2501);
    for (let cnt = 0; $.SCopySegmentEx(szText, cnt, P($.C4Draw$TextOut$szLinebuf, 0), fDoMarkup ? 124 : 10, 10, 2500); cnt = cnt + 1 | 0, iTy = Math.fround(iTy + Math.fround(ftoi32(Math.fround(fZoom * Math.fround(rFont.GetLineHeight())))))) {
      if (!this.StringOut$pi8$pC4Surface$f32$f32$u32$u8$b$rC4Markup$pCStdFont$f32(P($.C4Draw$TextOut$szLinebuf, 0), sfcDest, iTx, iTy, dwFCol, byForm, fDoMarkup, Markup, rFont, fZoom)) {
        return false;
      }
    }
    return true;
  }

  StringOut$pi8$rCStdFont$f32$pC4Surface$f32$f32$u32$u8$b(szText, rFont, fZoom, sfcDest, iTx, iTy, dwFCol = 0xffffffff, byForm = 0, fDoMarkup = true) {
    let Markup = new $.C4Markup().init(true);
    return this.StringOut$pi8$pC4Surface$f32$f32$u32$u8$b$rC4Markup$pCStdFont$f32(szText, sfcDest, iTx, iTy, dwFCol, byForm, fDoMarkup, Markup, rFont, fZoom);
  }

  DrawBoxDw(sfcDest, iX1, iY1, iX2, iY2, dwClr) {
    if (!sfcDest.IsRenderTarget()) {
      if (!sfcDest.Lock()) {
        return;
      }
      for (let y = iY1; y <= iY2; y = y + 1 | 0) {
        for (let x = iX1; x <= iX2; x = x + 1 | 0) {
          sfcDest.SetPixDw(x, y, dwClr);
        }
      }
      sfcDest.Unlock();
    } else {
      this.DrawBoxFade(sfcDest, Math.fround(iX1), Math.fround(iY1), Math.fround((iX2 - iX1 | 0) + 1 | 0), Math.fround((iY2 - iY1 | 0) + 1 | 0), dwClr, dwClr, dwClr, dwClr, null);
    }
  }

  DrawBoxFade(sfcDest, iX, iY, iWdt, iHgt, dwClr1, dwClr2, dwClr3, dwClr4, shader_call) {
    const vtx = new Float32Array(8);
    vtx[0] = iX;
    vtx[1] = iY;
    vtx[2] = iX;
    vtx[3] = Math.fround(iY + iHgt);
    vtx[4] = Math.fround(iX + iWdt);
    vtx[5] = Math.fround(iY + iHgt);
    vtx[6] = Math.fround(iX + iWdt);
    vtx[7] = iY;
    this.DrawQuadDw(sfcDest, P(vtx, 0), dwClr1, dwClr3, dwClr4, dwClr2, shader_call);
  }

  DrawPatternedCircle(sfcDest, x, y, r, _col, Pattern, _rPal) {
    let fRenderTarget = sfcDest.IsRenderTarget();
    if (!fRenderTarget) {
      if (!sfcDest.Lock()) {
        return;
      }
    }
    for (let ycnt = -r | 0; ycnt < r; ycnt = ycnt + 1 | 0) {
      let lwdt = ftoi32(Math.fround(c$sqrt(Math.fround(Math.imul(r, r) - Math.imul(ycnt, ycnt) | 0))));
      if (fRenderTarget) {
        for (let xcnt = x - lwdt | 0; xcnt < (x + lwdt | 0); xcnt = xcnt + 1 | 0) {
          this.DrawPix(sfcDest, Math.fround(xcnt), Math.fround(y + ycnt | 0), Pattern.PatternClr(xcnt >>> 0, (y + ycnt | 0) >>> 0));
        }
      } else {
        for (let xcnt = x - lwdt | 0; xcnt < (x + lwdt | 0); xcnt = xcnt + 1 | 0) {
          sfcDest.SetPixDw(xcnt, y + ycnt | 0, Pattern.PatternClr(xcnt >>> 0, (y + ycnt | 0) >>> 0));
        }
      }
    }
    if (!fRenderTarget) {
      sfcDest.Unlock();
    }
  }

  DrawFrameDw(sfcDest, x1, y1, x2, y2, dwClr, width = 1) {
    const vertices = $oarr(8, () => new C4BltVertex());
    vertices[0].ftx = Math.fround(x1);
    vertices[0].fty = Math.fround(y1);
    vertices[1].ftx = Math.fround(x2);
    vertices[1].fty = Math.fround(y1);
    vertices[2].$assign(vertices[1]);
    vertices[3].ftx = Math.fround(x2);
    vertices[3].fty = Math.fround(y2);
    vertices[4].$assign(vertices[3]);
    vertices[5].ftx = Math.fround(x1);
    vertices[5].fty = Math.fround(y2);
    vertices[6].$assign(vertices[5]);
    vertices[7].$assign(vertices[0]);
    for (const vertex of vertices) {
      DwTo4UB(dwClr, vertex.color);
    }
    this.PerformMultiLines(sfcDest, $oat(vertices, 0), 8, width, null);
  }

  DrawQuadDw(sfcTarget, ipVtx, dwClr1, dwClr2, dwClr3, dwClr4, shader_call) {
    const vertices = $oarr(6, () => new C4BltVertex());
    vertices[0].ftx = ipVtx.a[ipVtx.o + 0];
    vertices[0].fty = ipVtx.a[ipVtx.o + 1];
    vertices[1].ftx = ipVtx.a[ipVtx.o + 2];
    vertices[1].fty = ipVtx.a[ipVtx.o + 3];
    vertices[2].ftx = ipVtx.a[ipVtx.o + 4];
    vertices[2].fty = ipVtx.a[ipVtx.o + 5];
    vertices[3].ftx = ipVtx.a[ipVtx.o + 6];
    vertices[3].fty = ipVtx.a[ipVtx.o + 7];
    DwTo4UB(dwClr1, vertices[0].color);
    DwTo4UB(dwClr2, vertices[1].color);
    DwTo4UB(dwClr3, vertices[2].color);
    DwTo4UB(dwClr4, vertices[3].color);
    vertices[4].$assign(vertices[0]);
    vertices[5].$assign(vertices[2]);
    this.PerformMultiTris(sfcTarget, $oat(vertices, 0), 6, null, null, null, null, 0, shader_call);
  }

  DrawPix(sfcDest, tx, ty, dwClr) {
    let vtx = new C4BltVertex();
    vtx.ftx = tx;
    vtx.fty = ty;
    DwTo4UB(dwClr, vtx.color);
    this.PerformMultiPix(sfcDest, vtx, 1, null);
  }

  DrawLineDw(sfcTarget, x1, y1, x2, y2, dwClr, width = 1) {
    const vertices = $oarr(2, () => new C4BltVertex());
    vertices[0].ftx = x1;
    vertices[0].fty = y1;
    vertices[1].ftx = x2;
    vertices[1].fty = y2;
    DwTo4UB(dwClr, vertices[0].color);
    DwTo4UB(dwClr, vertices[1].color);
    this.PerformMultiLines(sfcTarget, $oat(vertices, 0), 2, width, null);
  }

  DrawCircleDw(sfcTarget, cx, cy, r, dwClr, width = 1) {
    let num_lines = 12 + ftoi32(Math.fround(r / Math.fround(10))) | 0;
    let vertices = $oat($oarr($u64n(Math.imul(num_lines, 2)), () => new C4BltVertex()), 0);
    for (let i = 0; i < num_lines; i = i + 1 | 0) {
      let ang = Math.fround(Math.fround(Math.fround(i) * Math.fround(2)) * 3.141592653589793 / num_lines);
      let iv = Math.imul(i, 2) + 1 | 0;
      vertices[$u64n(iv)].ftx = Math.fround(cx + Math.fround(Math.fround(c$sin(ang)) * r));
      vertices[$u64n(iv)].fty = Math.fround(cy + Math.fround(Math.fround(c$cos(ang)) * r));
      DwTo4UB(dwClr, vertices[$u64n(iv)].color);
      vertices[$u64n((iv + 1 | 0) % Math.imul(num_lines, 2))].$assign(vertices[$u64n(iv)]);
    }
    this.PerformMultiLines(sfcTarget, vertices, Math.imul(num_lines, 2) >>> 0, width, null);
  }

  SetGamma(r, g, b, iRampIndex) {
    this.gamma[iRampIndex][0] = r;
    this.gamma[iRampIndex][1] = g;
    this.gamma[iRampIndex][2] = b;
    this.gammaOut[0] = this.gammaOut[1] = this.gammaOut[2] = 1;
    for (const i of this.gamma) {
      this.gammaOut[0] = Math.fround(this.gammaOut[0] / i[0]);
      this.gammaOut[1] = Math.fround(this.gammaOut[1] / i[1]);
      this.gammaOut[2] = Math.fround(this.gammaOut[2] / i[2]);
    }
  }

  ResetGamma() {
    for (const i of this.gamma) {
      i[0] = 1;
      i[1] = 1;
      i[2] = 1;
    }
    this.gammaOut[0] = 1;
    this.gammaOut[1] = 1;
    this.gammaOut[2] = 1;
  }

  ApplyGammaTo(dwClr) {
    return (((0xff000000 | ((ftoi32(Math.fround(c$pow(Math.fround(Math.fround(dwClr >>> 16 & 0xff) / 255), this.gammaOut[0])) * 255) >>> 0 & 255) >>> 0 << 16) >>> 0) >>> 0 | ((ftoi32(Math.fround(c$pow(Math.fround(Math.fround((dwClr & 0xffff) >> 8 & 0xff) / 255), this.gammaOut[1])) * 255) >>> 0 & 255) >>> 0 << 8) >>> 0) >>> 0 | (ftoi32(Math.fround(c$pow(Math.fround(Math.fround(dwClr & 0xff) / 255), this.gammaOut[2])) * 255) & 255) >>> 0) >>> 0;
  }

  ActivateBlitModulation(dwWithClr) {
    this.BlitModulated = true;
    this.BlitModulateClr = dwWithClr;
  }

  DeactivateBlitModulation() {
    this.BlitModulated = false;
  }

  GetBlitModulation(rdwColor) {
    rdwColor.a[rdwColor.o] = this.BlitModulateClr;
    return this.BlitModulated;
  }

  SetBlitMode(dwBlitMode) {
    this.dwBlitMode = (dwBlitMode & 31) >>> 0;
  }

  ResetBlitMode() {
    this.dwBlitMode = 0;
  }

  SetFoW(fow) {
    this.pFoW = fow;
  }

  GetFoW() {
    return this.pFoW;
  }

  SetZoom$f32$f32$f32(X, Y, Zoom) {
    this.ZoomX = X;
    this.ZoomY = Y;
    this.Zoom = Zoom;
  }

  SetZoom$ZoomData(zoom) {
    this.SetZoom$f32$f32$f32(zoom.X, zoom.Y, zoom.Zoom);
  }

  GetZoom(r) {
    r.Zoom = this.Zoom;
    r.X = this.ZoomX;
    r.Y = this.ZoomY;
  }

  ApplyZoom(X, Y) {
    X.a[X.o] = Math.fround(Math.fround(Math.fround(X.a[X.o] - this.ZoomX) * this.Zoom) + this.ZoomX);
    Y.a[Y.o] = Math.fround(Math.fround(Math.fround(Y.a[Y.o] - this.ZoomY) * this.Zoom) + this.ZoomY);
  }

  RemoveZoom(X, Y) {
    X.a[X.o] = Math.fround(Math.fround(Math.fround(X.a[X.o] - this.ZoomX) / this.Zoom) + this.ZoomX);
    Y.a[Y.o] = Math.fround(Math.fround(Math.fround(Y.a[Y.o] - this.ZoomY) / this.Zoom) + this.ZoomY);
  }

  SetMeshTransform(Transform) {
    this.MeshTransform = Transform;
  }

  SetPerspective(fSet) {
    this.fUsePerspective = fSet;
  }

  StringOut$pi8$pC4Surface$f32$f32$u32$u8$b$rC4Markup$pCStdFont$f32(szText, sfcDest, iTx, iTy, dwFCol, byForm, fDoMarkup, Markup, pFont, fZoom) {
    if (this.ClipAll) {
      return true;
    }
    if (!this.PrepareRendering(sfcDest)) {
      return false;
    }
    let iFlags = 0;
    switch (byForm) {
      case 1:
        iFlags |= 1;
        break;
      case 2:
        iFlags |= 8;
        break;
    }
    if (!fDoMarkup) {
      iFlags |= 32;
    }
    pFont.DrawText(sfcDest, iTx, iTy, dwFCol, szText, iFlags >>> 0, Markup, fZoom);
    return true;
  }

  CreatePrimaryClipper(iXRes, iYRes) {
    0;
    this.SetPrimaryClipper(0, 0, iXRes - 1 >>> 0 | 0, iYRes - 1 >>> 0 | 0);
    this.StorePrimaryClipper();
    return true;
  }

  Error_(szMsg) {
    if (this.pApp != null) {
      this.pApp.Error_(szMsg);
    }
    $.Log(szMsg);
    return false;
  }

  $clone() { return new C4Draw().$assign(this); }
  $assign(o) {
    this.pApp = o.pApp;
    this.Active = o.Active;
    this.gamma = $own(o.gamma.map(($e0) => $e0.slice()));
    this.gammaOut = o.gammaOut.slice();
    this.MaxTexSize = o.MaxTexSize;
    this.scriptUniform.$assign(o.scriptUniform);
    this.fClipX1 = o.fClipX1;
    this.fClipY1 = o.fClipY1;
    this.fClipX2 = o.fClipX2;
    this.fClipY2 = o.fClipY2;
    this.fStClipX1 = o.fStClipX1;
    this.fStClipY1 = o.fStClipY1;
    this.fStClipX2 = o.fStClipX2;
    this.fStClipY2 = o.fStClipY2;
    this.iClipX1 = o.iClipX1;
    this.iClipY1 = o.iClipY1;
    this.iClipX2 = o.iClipX2;
    this.iClipY2 = o.iClipY2;
    this.ClipAll = o.ClipAll;
    this.PrimaryLocked = o.PrimaryLocked;
    this.RenderTarget = o.RenderTarget;
    this.BlitModulated = o.BlitModulated;
    this.BlitModulateClr = o.BlitModulateClr;
    this.dwBlitMode = o.dwBlitMode;
    this.pFoW = o.pFoW;
    this.ZoomX = o.ZoomX;
    this.ZoomY = o.ZoomY;
    this.MeshTransform = o.MeshTransform;
    this.fUsePerspective = o.fUsePerspective;
    this.Zoom = o.Zoom;
    return this;
  }
}

export class ZoomDataStackItem extends ZoomData {

  init$f32(newzoom) {
    $.pDraw.GetZoom(this);
    $.pDraw.SetZoom$f32$f32$f32(this.X, this.Y, newzoom);
    return this;
  }

  init$f32$f32$f32(X, Y, newzoom) {
    $.pDraw.GetZoom(this);
    $.pDraw.SetZoom$f32$f32$f32(X, Y, newzoom);
    return this;
  }

  $dtor() {
    $.pDraw.SetZoom$ZoomData(this);
  }

  $clone() { return new ZoomDataStackItem().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export function DwTo4UB(dwClr, r) {
  r[0] = (dwClr >>> 16 & 255) >>> 0 & 0xff;
  r[1] = (dwClr >>> 8 & 255) >>> 0 & 0xff;
  r[2] = (dwClr & 255) >>> 0 & 0xff;
  r[3] = (dwClr >>> 24 & 255) >>> 0 & 0xff;
}







export function DDrawInit(pApp, iXRes, iYRes, iMonitor) {
  $.pDraw = new $.CStdGL().init();
  if ($.pDraw == null) {
    return false;
  }
  if (!$.pDraw.Init(pApp, iXRes, iYRes, iMonitor)) {
    $delete($.pDraw);
    return false;
  }
  return true;
}

export function $init(): void {
  C4Draw.COLOR_DEPTH = 32;
  C4Draw.COLOR_DEPTH_BYTES = 4;
  $.pDraw = null;
  $.C4SSC_MOD2$C4Draw = 1;
  $.C4SSC_BASE$C4Draw = 2;
  $.C4SSC_OVERLAY$C4Draw = 4;
  $.C4SSC_LIGHT$C4Draw = 8;
  $.C4SSC_NORMAL$C4Draw = 16;
}

Object.assign($, { C4BltVertex, C4Draw, C4Pattern, DDrawInit, DwTo4UB, ZoomData, ZoomDataStackItem });
