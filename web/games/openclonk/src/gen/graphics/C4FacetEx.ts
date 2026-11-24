// @ts-nocheck
// OpenClonk 36de799: src/graphics/C4FacetEx.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { C4Facet } from './C4Facet.ts';
import { ftoi32 } from '../../rt/int.ts';
import { P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';

export class C4FacetSurface extends C4Facet {
  Face = new $.C4Surface().init$v();

  init() {
    super.init$v();
    this.Face = new $.C4Surface().init$v();
    C4FacetSurface.prototype.Default.call(this);
    return this;
  }

  $dtor() {
    C4FacetSurface.prototype.Clear.call(this);
  }

  Default() {
    this.Face.Default();
    $.C4Facet.prototype.Default.call(this);
  }

  Clear() {
    this.Face.Clear();
  }

  Set$C4Facet(cpy) {
    C4FacetSurface.prototype.Clear.call(this);
    $.C4Facet.prototype.Set$C4Facet.call(this, cpy);
  }

  Set$pC4Surface$i32$i32$i32$i32(nsfc, nx, ny, nwdt, nhgt) {
    $.C4Facet.prototype.Set$pC4Surface$f32$f32$f32$f32.call(this, nsfc, Math.fround(nx), Math.fround(ny), Math.fround(nwdt), Math.fround(nhgt));
  }

  Grayscale(iOffset = 0) {
    if ($.pDraw == null || this.Surface == null || this.Wdt === 0 || this.Hgt === 0) {
      return;
    }
    $.pDraw.Grayscale(this.Surface, iOffset);
  }

  Create(iWdt, iHgt, iWdt2 = -1, iHgt2 = -1) {
    C4FacetSurface.prototype.Clear.call(this);
    this.Face.Default();
    if (!this.Face.Create(iWdt, iHgt)) {
      return false;
    }
    if (iWdt2 === -1 || iWdt2 === -3) {
      iWdt2 = this.Face.Wdt;
    } else if (iWdt2 === -2) {
      iWdt2 = this.Face.Hgt;
    }
    if (iHgt2 === -1 || iHgt2 === -2) {
      iHgt2 = this.Face.Hgt;
    } else if (iHgt2 === -3) {
      iHgt2 = this.Face.Wdt;
    }
    this.Set$pC4Surface$i32$i32$i32$i32(this.Face, 0, 0, iWdt2, iHgt2);
    return true;
  }

  GetFace() {
    return this.Face;
  }

  CreateClrByOwner(pBySurface) {
    C4FacetSurface.prototype.Clear.call(this);
    if (!this.Face.CreateColorByOwner(pBySurface)) {
      return false;
    }
    this.Set$pC4Surface$i32$i32$i32$i32(this.Face, 0, 0, this.Face.Wdt, this.Face.Hgt);
    return true;
  }

  EnsureOwnSurface() {
    if (this.Surface !== this.Face) {
      let fctOld = this.$clone();
      if (!this.Create(ftoi32(fctOld.Wdt), ftoi32(fctOld.Hgt))) {
        return false;
      }
      fctOld.Draw$rC4Facet$b$i32$i32$b(this);
    }
    return true;
  }

  Load(hGroup, szName, iWdt, iHgt, fNoErrIfNotFound, iFlags) {
    let $t1;
    C4FacetSurface.prototype.Clear.call(this);
    const szFilename = new Int8Array(256);
    $.SCopy$pi8$pi8$u64(szName, P(szFilename, 0), 255);
    let szExt = $.GetExtension$2(P(szFilename, 0));
    if (szExt.a[szExt.o] === 0) {
      const extensions = [
  S("png"),
  S("bmp"),
  S("jpeg"),
  S("jpg"),
  null,
];
      let i = 0;
      let szExt$2 = null;
      while ((szExt$2 = extensions[($t1 = i, i = i + 1 | 0, $t1)]) != null) {
        $.EnforceExtension$pi8$pi8(P(szFilename, 0), szExt$2);
        if (hGroup.FindEntry$pi8$pStdStrBuf$pu64(P(szFilename, 0))) {
          break;
        }
      }
    }
    if (!this.Face.Load(hGroup, P(szFilename, 0), false, fNoErrIfNotFound, iFlags)) {
      return false;
    }
    if (iWdt === -1 || iWdt === -3) {
      iWdt = this.Face.Wdt;
    } else if (iWdt === -2) {
      iWdt = this.Face.Hgt;
    }
    if (iHgt === -1 || iHgt === -2) {
      iHgt = this.Face.Hgt;
    } else if (iHgt === -3) {
      iHgt = this.Face.Wdt;
    }
    this.Set$pC4Surface$i32$i32$i32$i32(this.Face, 0, 0, iWdt, iHgt);
    return true;
  }

  GrabFrom(rSource) {
    C4FacetSurface.prototype.Clear.call(this);
    C4FacetSurface.prototype.Default.call(this);
    this.Face.MoveFrom(rSource.Face);
    this.Set$pC4Surface$i32$i32$i32$i32(rSource.Surface === rSource.Face ? this.Face : rSource.Surface, ftoi32(rSource.X), ftoi32(rSource.Y), ftoi32(rSource.Wdt), ftoi32(rSource.Hgt));
    C4FacetSurface.prototype.Default.call(rSource);
  }

  CopyFromSfcMaxSize(srcSfc, iMaxSize, dwColor = 0) {
    if (srcSfc.Wdt === 0 || srcSfc.Hgt === 0) {
      return false;
    }
    C4FacetSurface.prototype.Clear.call(this);
    let fNeedsScale = !(srcSfc.Wdt <= iMaxSize && srcSfc.Hgt <= iMaxSize);
    if (!fNeedsScale && dwColor === 0) {
      this.Face.Copy(srcSfc);
    } else {
      let fctSource = new $.C4Facet().init$v();
      fctSource.Set$pC4Surface$f32$f32$f32$f32(srcSfc, Math.fround(0), Math.fround(0), Math.fround(srcSfc.Wdt), Math.fround(srcSfc.Hgt));
      let iTargetWdt = 0;
      let iTargetHgt = 0;
      if (fNeedsScale) {
        if (fctSource.Wdt > fctSource.Hgt) {
          iTargetWdt = iMaxSize;
          iTargetHgt = ftoi32(Math.fround(Math.fround(fctSource.Hgt * Math.fround(iTargetWdt)) / fctSource.Wdt));
        } else {
          iTargetHgt = iMaxSize;
          iTargetWdt = ftoi32(Math.fround(Math.fround(fctSource.Wdt * Math.fround(iTargetHgt)) / fctSource.Hgt));
        }
      } else {
        iTargetWdt = ftoi32(fctSource.Wdt);
        iTargetHgt = ftoi32(fctSource.Hgt);
      }
      if (dwColor !== 0) {
        srcSfc.SetClr(dwColor);
      }
      this.Create(iTargetWdt, iTargetHgt);
      $.pDraw.Blit(srcSfc, 0, 0, fctSource.Wdt, fctSource.Hgt, this.Face, Math.fround(0), Math.fround(0), Math.fround(iTargetWdt), Math.fround(iTargetHgt));
    }
    this.Set$pC4Surface$i32$i32$i32$i32(this.Face, 0, 0, this.Face.Wdt, this.Face.Hgt);
    return true;
  }

  $clone() { return new C4FacetSurface().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.Face.$assign(o.Face);
    return this;
  }
}

export class C4FacetID extends C4FacetSurface {
  idSourceGroup = 0;

  init() {
    super.init();
    this.idSourceGroup = 0;
    return this;
  }

  Default() {
    C4FacetSurface.prototype.Default.call(this);
    this.idSourceGroup = 0;
  }

  Clear() {
    C4FacetSurface.prototype.Clear.call(this);
    this.idSourceGroup = 0;
  }

  $clone() { return new C4FacetID().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.idSourceGroup = o.idSourceGroup;
    return this;
  }
}




export function $init(): void {
  $.C4FCT_Full$C4FacetEx = -1;
  $.C4FCT_Height$C4FacetEx = -2;
  $.C4FCT_Width$C4FacetEx = -3;
}

Object.assign($, { C4FacetID, C4FacetSurface });
