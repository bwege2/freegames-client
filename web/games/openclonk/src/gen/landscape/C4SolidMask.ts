// @ts-nocheck
// OpenClonk 36de799: src/landscape/C4SolidMask.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { C4DensityProvider } from '../object/C4Shape.ts';
import { $u64n, ftoi32 } from '../../rt/int.ts';
import { c$memcpy, c$memset, c$sqrt } from '../../rt/libc.ts';
import { $padd, $rd, $reinterpVoid, P } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete, $min } from '../../rt/std.ts';

export class C4SolidMask {
  static First;
  static Last;
  MaskPut = false;
  MaskPutRotation = 0;
  MatBuffPitch = 0;
  MaskRemovalX = new $.C4Fixed();
  MaskRemovalY = 0;
  ppAttachingObjects = null;
  iAttachingObjectsCount = 0;
  iAttachingObjectsCapacity = 0;
  MaskPutRect = new $.C4TargetRect();
  pSolidMaskMatBuff = null;
  MaskMaterial = 0;
  pForObject = null;
  Prev = null;
  Next = null;

  RemoveTemporary(where) {
    if (!this.MaskPut || this.pSolidMaskMatBuff == null) {
      return;
    }
    where.Intersect(this.MaskPutRect);
    for (let y = where.y; y < (where.y + where.Hgt | 0); y = y + 1 | 0) {
      for (let x = where.x; x < (where.x + where.Wdt | 0); x = x + 1 | 0) {
        let pPix = $padd($padd($padd($padd(this.pSolidMaskMatBuff, Math.imul((y - this.MaskPutRect.y | 0) + this.MaskPutRect.ty | 0, this.MatBuffPitch)), x), -this.MaskPutRect.x), this.MaskPutRect.tx);
        if (!$.IsSomeVehicle(pPix.a[pPix.o])) {
          0;
          $.Landscape._SetPix2Tmp(x, y, pPix.a[pPix.o], $.C4Landscape.Transparent);
        }
      }
    }
  }

  PutTemporary(where) {
    if (!this.MaskPut || this.pSolidMaskMatBuff == null) {
      return;
    }
    where.Intersect(this.MaskPutRect);
    for (let y = where.y; y < (where.y + where.Hgt | 0); y = y + 1 | 0) {
      for (let x = where.x; x < (where.x + where.Wdt | 0); x = x + 1 | 0) {
        let pPix = $padd($padd($padd($padd(this.pSolidMaskMatBuff, Math.imul((y - this.MaskPutRect.y | 0) + this.MaskPutRect.ty | 0, this.MatBuffPitch)), x), -this.MaskPutRect.x), this.MaskPutRect.tx);
        if (!$.IsSomeVehicle(pPix.a[pPix.o])) {
          0;
          $.Landscape._SetPix2Tmp(x, y, this.MaskMaterial, $.C4Landscape.Transparent);
        }
      }
    }
  }

  Repair(where) {
    if (!this.MaskPut || this.pSolidMaskMatBuff == null) {
      return;
    }
    where.Intersect(this.MaskPutRect);
    for (let y = where.y; y < (where.y + where.Hgt | 0); y = y + 1 | 0) {
      for (let x = where.x; x < (where.x + where.Wdt | 0); x = x + 1 | 0) {
        let pPix = $padd($padd($padd($padd(this.pSolidMaskMatBuff, Math.imul((y - this.MaskPutRect.y | 0) + this.MaskPutRect.ty | 0, this.MatBuffPitch)), x), -this.MaskPutRect.x), this.MaskPutRect.tx);
        if (!$.IsSomeVehicle(pPix.a[pPix.o])) {
          pPix.a[pPix.o] = $.Landscape.GetPix(x, y);
          $.Landscape.SetPix2(x, y, this.MaskMaterial, $.C4Landscape.Transparent);
        }
      }
    }
  }

  Put(fCauseInstability, pClipRect, fRestoreAttachment) {
    if (this.pForObject == null || this.pForObject.Def == null || this.pForObject.Def.pSolidMask == null || this.pSolidMaskMatBuff == null) {
      this.iAttachingObjectsCount = 0;
      return;
    }
    if (this.pForObject.Contained.op_C4Object_() != null) {
      this.iAttachingObjectsCount = 0;
      return;
    }
    if (fCauseInstability) {
      C4SolidMask.CheckConsistency();
    }
    let RegularPut = false;
    if (pClipRect == null) {
      this.MaskPutRotation = this.pForObject.GetR();
      pClipRect = this.MaskPutRect;
      RegularPut = true;
    } else {
      if (!pClipRect.ClipBy(this.MaskPutRect)) {
        return;
      }
      RegularPut = false;
    }
    let pSolidMask = this.pForObject.Def.pSolidMask;
    let xcnt = 0;
    let ycnt = 0;
    let iTx = 0;
    let iTy = 0;
    let byPixel = 0;
    if (this.MaskPutRotation === 0) {
      if (RegularPut) {
        let ox = 0;
        let oy = 0;
        ox = (this.pForObject.GetX() + this.pForObject.Def.Shape.x | 0) + this.pForObject.SolidMask.tx | 0;
        oy = (this.pForObject.GetY() + this.pForObject.Def.Shape.y | 0) + this.pForObject.SolidMask.ty | 0;
        this.MaskPutRect.x = ox;
        if (this.MaskPutRect.x < 0) {
          this.MaskPutRect.tx = -this.MaskPutRect.x | 0;
          this.MaskPutRect.x = 0;
        } else {
          this.MaskPutRect.tx = 0;
        }
        this.MaskPutRect.y = oy;
        if (this.MaskPutRect.y < 0) {
          this.MaskPutRect.ty = -this.MaskPutRect.y | 0;
          this.MaskPutRect.y = 0;
        } else {
          this.MaskPutRect.ty = 0;
        }
        this.MaskPutRect.Wdt = $min(ox + this.pForObject.SolidMask.Wdt | 0, $.Landscape.GetWidth()) - this.MaskPutRect.x | 0;
        this.MaskPutRect.Hgt = $min(oy + this.pForObject.SolidMask.Hgt | 0, $.Landscape.GetHeight()) - this.MaskPutRect.y | 0;
      }
      for (ycnt = 0; ycnt < pClipRect.Hgt; ycnt = ycnt + 1 | 0) {
        let pPix = $padd($padd($padd(pSolidMask.Bits, Math.imul((ycnt + pClipRect.ty | 0) + this.pForObject.SolidMask.y | 0, pSolidMask.Pitch)), pClipRect.tx), this.pForObject.SolidMask.x);
        for (xcnt = 0; xcnt < pClipRect.Wdt; xcnt = xcnt + 1 | 0, pPix = pPix.add(1)) {
          if (pPix.a[pPix.o] !== 0) {
            iTx = pClipRect.x + xcnt | 0;
            iTy = pClipRect.y + ycnt | 0;
            if (!this.MaskPut) {
              byPixel = $.Landscape.GetPix(iTx, iTy);
              if (!$.IsSomeVehicle(byPixel) || RegularPut) {
                this.pSolidMaskMatBuff.a[this.pSolidMaskMatBuff.o + ((Math.imul(ycnt + pClipRect.ty | 0, this.MatBuffPitch) + xcnt | 0) + pClipRect.tx | 0)] = byPixel;
              }
            }
            $.Landscape.SetPix2(iTx, iTy, this.MaskMaterial, $.C4Landscape.Transparent);
          } else if (!this.MaskPut) {
            this.pSolidMaskMatBuff.a[this.pSolidMaskMatBuff.o + ((Math.imul(ycnt + pClipRect.ty | 0, this.MatBuffPitch) + xcnt | 0) + pClipRect.tx | 0)] = $.MCVehic;
          }
        }
      }
    } else {
      let Ma1 = $.Cos($.itofix$i32(-this.MaskPutRotation | 0));
      let Ma2 = $.Sin($.itofix$i32(-this.MaskPutRotation | 0)).op_neg();
      let Mb1 = $.Sin($.itofix$i32(-this.MaskPutRotation | 0));
      let Mb2 = $.Cos($.itofix$i32(-this.MaskPutRotation | 0));
      let centerx = (this.pForObject.Def.Shape.x + this.pForObject.SolidMask.tx | 0) + (this.pForObject.SolidMask.Wdt / 2 | 0) | 0;
      let centery = (this.pForObject.Def.Shape.y + this.pForObject.SolidMask.ty | 0) + (this.pForObject.SolidMask.Hgt / 2 | 0) | 0;
      let xstart = (this.pForObject.GetX() + $.fixtoi$C4Fixed(Ma1.op_mul$C4Fixed($.itofix$i32(centerx)).op_sub$C4Fixed(Ma2.op_mul$C4Fixed($.itofix$i32(centery)))) | 0) - (this.MatBuffPitch / 2 | 0) | 0;
      let ystart = (this.pForObject.GetY() + $.fixtoi$C4Fixed(Mb1.op_neg().op_mul$C4Fixed($.itofix$i32(centerx)).op_add$C4Fixed(Mb2.op_mul$C4Fixed($.itofix$i32(centery)))) | 0) - (this.MatBuffPitch / 2 | 0) | 0;
      if (RegularPut) {
        this.MaskPutRect.x = xstart;
        if (this.MaskPutRect.x < 0) {
          this.MaskPutRect.tx = -this.MaskPutRect.x | 0;
          this.MaskPutRect.Wdt = this.MaskPutRect.x;
          this.MaskPutRect.x = 0;
        } else {
          this.MaskPutRect.tx = 0;
          this.MaskPutRect.Wdt = 0;
        }
        this.MaskPutRect.y = ystart;
        if (this.MaskPutRect.y < 0) {
          this.MaskPutRect.ty = -this.MaskPutRect.y | 0;
          this.MaskPutRect.Hgt = this.MaskPutRect.y;
          this.MaskPutRect.y = 0;
        } else {
          this.MaskPutRect.ty = 0;
          this.MaskPutRect.Hgt = 0;
        }
        this.MaskPutRect.Wdt = $min(xstart + this.MatBuffPitch | 0, $.Landscape.GetWidth()) - this.MaskPutRect.x | 0;
        this.MaskPutRect.Hgt = $min(ystart + this.MatBuffPitch | 0, $.Landscape.GetHeight()) - this.MaskPutRect.y | 0;
      }
      let y0 = $.itofix$i32(pClipRect.ty - (this.MatBuffPitch / 2 | 0) | 0);
      let x0 = $.itofix$i32(pClipRect.tx - (this.MatBuffPitch / 2 | 0) | 0);
      iTy = pClipRect.y;
      let w = this.pForObject.SolidMask.Wdt;
      let h = this.pForObject.SolidMask.Hgt;
      let mx0 = this.pForObject.SolidMask.x;
      let my0 = this.pForObject.SolidMask.y;
      let ya = y0.op_mul$C4Fixed(Ma2);
      let yb = y0.op_mul$C4Fixed(Mb2);
      for (ycnt = 0; ycnt < pClipRect.Hgt; ycnt = ycnt + 1 | 0) {
        iTx = pClipRect.x;
        let i = Math.imul(ycnt + pClipRect.ty | 0, this.MatBuffPitch) + pClipRect.tx | 0;
        let xa = x0.op_mul$C4Fixed(Ma1);
        let xb = x0.op_mul$C4Fixed(Mb1);
        for (xcnt = 0; xcnt < pClipRect.Wdt; xcnt = xcnt + 1 | 0) {
          let iMx = $.fixtoi$C4Fixed(xa.op_add$C4Fixed(ya)) + (w / 2 | 0) | 0;
          let iMy = $.fixtoi$C4Fixed(xb.op_add$C4Fixed(yb)) + (h / 2 | 0) | 0;
          if (iMx >= 0 && iMy >= 0 && iMx < w && iMy < h && pSolidMask._GetPix(iMx + mx0 | 0, iMy + my0 | 0) !== 0) {
            if (!this.MaskPut) {
              byPixel = $.Landscape._GetPix(iTx, iTy);
              if (!$.IsSomeVehicle(byPixel) || RegularPut) {
                this.pSolidMaskMatBuff.a[this.pSolidMaskMatBuff.o + (i + xcnt | 0)] = byPixel;
              }
            }
            $.Landscape.SetPix2(iTx, iTy, this.MaskMaterial, $.C4Landscape.Transparent);
          } else if (!this.MaskPut) {
            this.pSolidMaskMatBuff.a[this.pSolidMaskMatBuff.o + (i + xcnt | 0)] = $.MCVehic;
          }
          xa.op_addAssign$C4Fixed(Ma1);
          xb.op_addAssign$C4Fixed(Mb1);
          iTx = iTx + 1 | 0;
        }
        ya.op_addAssign$C4Fixed(Ma2);
        yb.op_addAssign$C4Fixed(Mb2);
        iTy = iTy + 1 | 0;
      }
    }
    this.MaskPut = true;
    if (fRestoreAttachment && this.iAttachingObjectsCount !== 0) {
      let dx = this.pForObject.GetFixedX().op_sub$C4Fixed(this.MaskRemovalX);
      let dy = this.pForObject.GetY() - this.MaskRemovalY | 0;
      if (dx.op_ne$C4Fixed($.Fix0$C4Real) || dy !== 0) {
        for (let i = 0; i < this.iAttachingObjectsCount; i = i + 1 | 0) {
          let pObj = this.ppAttachingObjects.a[this.ppAttachingObjects.o + i];
          if (pObj.IsMoveableBySolidMask(this.pForObject.GetSolidMaskPlane())) {
            if (!pObj.Shape.ContactCheck($.fixtoi$C4Fixed(pObj.GetFixedX().op_add$C4Fixed(dx)), $.fixtoi$C4Fixed(pObj.GetFixedY().op_add$i32(dy)))) {
              if (pObj.iLastAttachMovementFrame !== $.Game.FrameCounter) {
                pObj.iLastAttachMovementFrame = $.Game.FrameCounter;
                pObj.MovePosition$C4Fixed$C4Fixed(dx.$clone(), $.itofix$i32(dy));
              }
            }
          }
        }
      }
      this.iAttachingObjectsCount = 0;
    }
    if (fCauseInstability) {
      C4SolidMask.CheckConsistency();
    }
  }

  Remove(fBackupAttachment) {
    let $t1, $t2, $t3, $t4;
    if (!this.MaskPut || this.pSolidMaskMatBuff == null) {
      return;
    }
    C4SolidMask.CheckConsistency();
    for (let ycnt = 0; ycnt < this.MaskPutRect.Hgt; ycnt = ycnt + 1 | 0) {
      let pPix = $padd($padd(this.pSolidMaskMatBuff, Math.imul(ycnt + this.MaskPutRect.ty | 0, this.MatBuffPitch)), this.MaskPutRect.tx);
      for (let xcnt = 0; xcnt < this.MaskPutRect.Wdt; xcnt = xcnt + 1 | 0, pPix = pPix.add(1)) {
        if (pPix.a[pPix.o] !== $.MCVehic) {
          let iTx = this.MaskPutRect.x + xcnt | 0;
          let iTy = this.MaskPutRect.y + ycnt | 0;
          0;
          if ($.IsSomeVehicle($.Landscape._GetPix(iTx, iTy))) {
            $.Landscape._SetPix2(iTx, iTy, pPix.a[pPix.o], $.C4Landscape.Transparent);
          }
          $.Landscape.CheckInstabilityRange(iTx, iTy);
        }
      }
    }
    this.MaskPut = false;
    let ClipRect = new $.C4TargetRect();
    for (let pSolid = C4SolidMask.Last; pSolid != null; pSolid = pSolid.Prev) {
      if (pSolid.MaskPut) {
        if (pSolid.MaskPutRect.Overlap(this.MaskPutRect)) {
          ClipRect.Set$i32$i32$i32$i32$i32$i32(this.MaskPutRect.x, this.MaskPutRect.y, this.MaskPutRect.Wdt, this.MaskPutRect.Hgt, 0, 0);
          pSolid.MaskPut = false;
          pSolid.Put(false, ClipRect, false);
        }
      }
    }
    if (fBackupAttachment) {
      this.MaskRemovalX.$assign(this.pForObject.GetFixedX());
      this.MaskRemovalY = this.pForObject.GetY();
      this.iAttachingObjectsCount = 0;
      let SolidArea = new $.C4LArea().init$pC4LSectors$i32$i32$i32$i32($.Objects.Sectors, this.MaskPutRect.x - 1 | 0, this.MaskPutRect.y - 4 | 0, this.MaskPutRect.Wdt + 2 | 0, this.MaskPutRect.Hgt + 2 | 0);
      const pSct = [null];
      for (let pLst = SolidArea.FirstObjectShapes(P(pSct, 0)); pLst != null; pLst = SolidArea.NextObjectShapes(pLst, P(pSct, 0))) {
        $t1 = pLst;
        $t2 = $t1.begin();
        $t3 = $t1.end();
        try {
          for (; $t2.op_ne($t3); $t2.op_inc$v()) {
            const pObj = $t2.op_mul();
            if (pObj != null && pObj !== this.pForObject && pObj.IsMoveableBySolidMask(this.pForObject.GetSolidMaskPlane()) && !pObj.Shape.CheckContact(pObj.GetX(), pObj.GetY())) {
              let has_dup = false;
              for (let i_dup = 0; i_dup < this.iAttachingObjectsCount; i_dup = i_dup + 1 | 0) {
                if (this.ppAttachingObjects.a[this.ppAttachingObjects.o + i_dup] === pObj) {
                  has_dup = true;
                  break;
                }
              }
              if (has_dup) {
                continue;
              }
              let iVtx = 0;
              for (; iVtx < pObj.Shape.VtxNum; iVtx = iVtx + 1 | 0) {
                if (pObj.Shape.GetVertexContact(iVtx, (pObj.Action.t_attach | 8) >>> 0, pObj.GetX(), pObj.GetY(), new C4SolidMask$DensityProvider().init(this)) !== 0) {
                  break;
                }
              }
              if (iVtx === pObj.Shape.VtxNum) {
                continue;
              }
              if (this.iAttachingObjectsCapacity === this.iAttachingObjectsCount) {
                this.iAttachingObjectsCapacity = this.iAttachingObjectsCapacity + 4 | 0;
                let ppNewAttachingObjects = P(new Array($u64n(this.iAttachingObjectsCapacity)).fill(null), 0);
                if (this.iAttachingObjectsCount !== 0) {
                  c$memcpy(ppNewAttachingObjects, this.ppAttachingObjects, 8 * $u64n(this.iAttachingObjectsCount));
                }
                $delete(this.ppAttachingObjects);
                this.ppAttachingObjects = ppNewAttachingObjects;
              }
              this.ppAttachingObjects.a[this.ppAttachingObjects.o + ($t4 = this.iAttachingObjectsCount, this.iAttachingObjectsCount = this.iAttachingObjectsCount + 1 | 0, $t4)] = pObj;
            }
          }
        } finally { $t2.$dtor(); $t3.$dtor(); }
      }
    }
    C4SolidMask.CheckConsistency();
  }

  Draw(cgo) {
    if (!this.MaskPut) {
      return;
    }
    let fct = new $.C4Facet().init$v();
    fct.Set$pC4Surface$f32$f32$f32$f32(this.pForObject.GetGraphics().GetBitmap(), Math.fround(this.pForObject.SolidMask.x), Math.fround(this.pForObject.SolidMask.y), Math.fround(this.pForObject.SolidMask.Wdt), Math.fround(this.pForObject.SolidMask.Hgt));
    if (this.MaskPutRotation !== 0) {
      fct.DrawXR(cgo.Surface, ftoi32(Math.fround(Math.fround(Math.fround(Math.fround(this.pForObject.GetX() + this.pForObject.Shape.x | 0) + cgo.X) - cgo.TargetX) + Math.fround(this.pForObject.SolidMask.tx))), ftoi32(Math.fround(Math.fround(Math.fround(Math.fround(this.pForObject.GetY() + this.pForObject.Shape.y | 0) + cgo.Y) - cgo.TargetY) + Math.fround(this.pForObject.SolidMask.ty))), ftoi32(fct.Wdt), ftoi32(fct.Hgt), 0, 0, this.MaskPutRotation);
    } else {
      fct.DrawX(cgo.Surface, Math.fround(Math.fround(Math.fround(Math.fround(this.pForObject.GetX() + this.pForObject.Shape.x | 0) + cgo.X) - cgo.TargetX) + Math.fround(this.pForObject.SolidMask.tx)), Math.fround(Math.fround(Math.fround(Math.fround(this.pForObject.GetY() + this.pForObject.Shape.y | 0) + cgo.Y) - cgo.TargetY) + Math.fround(this.pForObject.SolidMask.ty)), fct.Wdt, fct.Hgt, 0, 0);
    }
  }

  IsPut() {
    return this.MaskPut;
  }

  init(pForObject) {
    this.MaskRemovalX = new $.C4Fixed();
    this.MaskPutRect = new $.C4TargetRect();
    this.pForObject = pForObject;
    this.MaskPut = false;
    this.MaskPutRotation = 0;
    this.MaskRemovalX.$assign($.Fix0$C4Real);
    this.MaskRemovalY = 0;
    this.ppAttachingObjects = null;
    this.iAttachingObjectsCount = this.iAttachingObjectsCapacity = 0;
    this.MaskMaterial = $.MCVehic;
    this.Next = null;
    this.Prev = C4SolidMask.Last;
    C4SolidMask.Last = this;
    if (this.Prev != null) {
      this.Prev.Next = this;
    } else {
      C4SolidMask.First = this;
    }
    this.MatBuffPitch = ftoi32(c$sqrt(Math.imul(pForObject.SolidMask.Wdt, pForObject.SolidMask.Wdt) + Math.imul(pForObject.SolidMask.Hgt, pForObject.SolidMask.Hgt) | 0)) + 1 | 0;
    if (!((this.pSolidMaskMatBuff = P(new Uint8Array($u64n(Math.imul(this.MatBuffPitch, this.MatBuffPitch))), 0)) != null)) {
      return this;
    }
    c$memset(this.pSolidMaskMatBuff, 0, $u64n(Math.imul(this.MatBuffPitch, this.MatBuffPitch)));
    return this;
  }

  $dtor() {
    C4SolidMask.prototype.Remove.call(this, false);
    if (this.Next != null) {
      this.Next.Prev = this.Prev;
    }
    if (this.Prev != null) {
      this.Prev.Next = this.Next;
    }
    if (C4SolidMask.First === this) {
      C4SolidMask.First = this.Next;
    }
    if (C4SolidMask.Last === this) {
      C4SolidMask.Last = this.Prev;
    }
    $delete(this.pSolidMaskMatBuff);
    $delete(this.ppAttachingObjects);
  }

  static CheckConsistency() {
    if (true) {
      return true;
    }
    let SolidMaskRect = new $.C4Rect().init$i32$i32$i32$i32(0, 0, $.Landscape.GetWidth(), $.Landscape.GetHeight());
    let pSolid = null;
    for (pSolid = C4SolidMask.Last; pSolid != null; pSolid = pSolid.Prev) {
      pSolid.RemoveTemporary(SolidMaskRect.$clone());
    }
    0;
    for (pSolid = C4SolidMask.First; pSolid != null; pSolid = pSolid.Next) {
      pSolid.PutTemporary(SolidMaskRect.$clone());
    }
    return true;
  }

  static RemoveSolidMasks() {
    let SolidMaskRect = new $.C4Rect().init$i32$i32$i32$i32(0, 0, $.Landscape.GetWidth(), $.Landscape.GetHeight());
    let pSolid = null;
    for (pSolid = C4SolidMask.Last; pSolid != null; pSolid = pSolid.Prev) {
      pSolid.RemoveTemporary(SolidMaskRect.$clone());
    }
  }

  static PutSolidMasks() {
    let SolidMaskRect = new $.C4Rect().init$i32$i32$i32$i32(0, 0, $.Landscape.GetWidth(), $.Landscape.GetHeight());
    let pSolid = null;
    for (pSolid = C4SolidMask.First; pSolid != null; pSolid = pSolid.Next) {
      pSolid.PutTemporary(SolidMaskRect.$clone());
    }
  }

  static LoadMaskFromFile(hGroup, szFilename) {
    let png = new $.CPNGFile().init();
    let png_buf = new $.StdBuf();
    if (!hGroup.LoadEntry$pi8$pStdBuf(szFilename, png_buf)) {
      return null;
    }
    if (!png.Load($reinterpVoid($.StdBuf.prototype.getMData.call(png_buf), "u8"), $.StdBuf.prototype.getSize.call(png_buf) | 0)) {
      return null;
    }
    let result = new $.CSurface8().init$i32$i32(png.iWdt | 0, png.iHgt | 0);
    for (let y = 0; y < png.iHgt; y = y + 1) {
      for (let x = 0; x < png.iWdt; x = x + 1) {
        result.SetPix(x | 0, y | 0, (png.GetPix(x | 0, y | 0) >>> 24 < 128 ? 0 : 255) & 0xff);
      }
    }
    return result;
  }

  SetHalfVehicle(set) {
    this.MaskMaterial = set ? $.MCHalfVehic : $.MCVehic;
  }

  $clone() { return new C4SolidMask().$assign(this); }
  $assign(o) {
    this.MaskPut = o.MaskPut;
    this.MaskPutRotation = o.MaskPutRotation;
    this.MatBuffPitch = o.MatBuffPitch;
    this.MaskRemovalX.$assign(o.MaskRemovalX);
    this.MaskRemovalY = o.MaskRemovalY;
    this.ppAttachingObjects = o.ppAttachingObjects;
    this.iAttachingObjectsCount = o.iAttachingObjectsCount;
    this.iAttachingObjectsCapacity = o.iAttachingObjectsCapacity;
    this.MaskPutRect.$assign(o.MaskPutRect);
    this.pSolidMaskMatBuff = o.pSolidMaskMatBuff;
    this.MaskMaterial = o.MaskMaterial;
    this.pForObject = o.pForObject;
    this.Prev = o.Prev;
    this.Next = o.Next;
    return this;
  }
}

export class C4SolidMask$DensityProvider extends C4DensityProvider {
  rSolidMaskData = null;

  init(rSolidMaskData) {
    this.rSolidMaskData = rSolidMaskData;
    return this;
  }

  GetDensity(x, y) {
    x = x - this.rSolidMaskData.MaskPutRect.x | 0;
    y = y - this.rSolidMaskData.MaskPutRect.y | 0;
    if (!$.Inside$i32$i32$i32$3(x, 0, this.rSolidMaskData.MaskPutRect.Wdt - 1 | 0) || !$.Inside$i32$i32$i32$3(y, 0, this.rSolidMaskData.MaskPutRect.Hgt - 1 | 0)) {
      return 0;
    }
    let pix = 0;
    if (this.rSolidMaskData.MaskPutRotation === 0) {
      let pSolidMask = this.rSolidMaskData.pForObject.Def.pSolidMask;
      if (pSolidMask == null) {
        return 0;
      }
      pix = pSolidMask._GetPix((x + this.rSolidMaskData.pForObject.SolidMask.x | 0) + this.rSolidMaskData.MaskPutRect.tx | 0, (y + this.rSolidMaskData.pForObject.SolidMask.y | 0) + this.rSolidMaskData.MaskPutRect.ty | 0);
      if (pix === 255) {
        return 100;
      } else {
        return 0;
      }
    } else {
      pix = $rd($padd($padd($padd(this.rSolidMaskData.pSolidMaskMatBuff, Math.imul(y + this.rSolidMaskData.MaskPutRect.ty | 0, this.rSolidMaskData.MatBuffPitch)), this.rSolidMaskData.MaskPutRect.tx), x));
      if ($.IsSomeVehicle(pix)) {
        return 0;
      } else {
        return 100;
      }
    }
  }

  $clone() { return new C4SolidMask$DensityProvider().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.rSolidMaskData = o.rSolidMaskData;
    return this;
  }
}

export function $init(): void {
  C4SolidMask.First = null;
  C4SolidMask.Last = null;
}

Object.assign($, { C4SolidMask, C4SolidMask$DensityProvider });
