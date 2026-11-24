// @ts-nocheck
// OpenClonk 36de799: src/graphics/C4FacetEx.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { C4Facet } from './C4Facet.ts';

export class C4FacetSurface extends C4Facet {
  Face = new $.C4Surface();

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

  $clone() { return new C4FacetSurface().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.Face.$assign(o.Face);
    return this;
  }
}

export function $init(): void {
}

Object.assign($, { C4FacetSurface });
