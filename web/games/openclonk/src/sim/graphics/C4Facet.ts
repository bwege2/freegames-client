// @ts-nocheck
// OpenClonk 36de799: src/graphics/C4Facet.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { ftoi32 } from '../../rt/int.ts';
import { c$ceilf, c$floorf, c$sscanf } from '../../rt/libc.ts';
import { P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $max } from '../../rt/std.ts';
import { C4BltTransform } from './C4BltTransform.ts';

export class C4Vec2D {
  x = 0;
  y = 0;

  init(x = 0, y = 0) {
    this.x = x;
    this.y = y;
    return this;
  }

  $clone() { return new C4Vec2D().$assign(this); }
  $assign(o) {
    this.x = o.x;
    this.y = o.y;
    return this;
  }
}

export class C4Facet {
  Surface = null;
  X = 0;
  Y = 0;
  Wdt = 0;
  Hgt = 0;

  init$v() {
    C4Facet.prototype.Default.call(this);
    return this;
  }

  init$pC4Surface$f32$f32$f32$f32(pSfc, iX, iY, iWdt, iHgt) {
    this.Surface = pSfc;
    this.X = iX;
    this.Y = iY;
    this.Wdt = iWdt;
    this.Hgt = iHgt;
    return this;
  }

  Default() {
    this.Set$pC4Surface$f32$f32$f32$f32(null, Math.fround(0), Math.fround(0), Math.fround(0), Math.fround(0));
  }

  Set$rC4Surface(rSfc) {
    this.Set$pC4Surface$f32$f32$f32$f32(rSfc, Math.fround(0), Math.fround(0), Math.fround(rSfc.Wdt), Math.fround(rSfc.Hgt));
  }

  Set$pC4Surface$f32$f32$f32$f32(nsfc, nx, ny, nwdt, nhgt) {
    this.Surface = nsfc;
    this.X = nx;
    this.Y = ny;
    this.Wdt = nwdt;
    this.Hgt = nhgt;
  }

  Set$C4Facet(cpy) {
    C4Facet.prototype.$assign.call(this, cpy);
  }

  Expand(iLeft = 0, iRight = 0, iTop = 0, iBottom = 0) {
    this.X = Math.fround(this.X - Math.fround(iLeft));
    this.Wdt = Math.fround(this.Wdt + Math.fround(iLeft));
    this.Wdt = Math.fround(this.Wdt + Math.fround(iRight));
    this.Y = Math.fround(this.Y - Math.fround(iTop));
    this.Hgt = Math.fround(this.Hgt + Math.fround(iTop));
    this.Hgt = Math.fround(this.Hgt + Math.fround(iBottom));
  }

  DrawEnergyLevelEx(iLevel, iRange, gfx, bar_idx) {
    if ($.pDraw == null || gfx.Surface == null) {
      return;
    }
    let h = ftoi32(gfx.Hgt);
    let yBar = ftoi32(Math.fround(this.Hgt - Math.fround(Math.fround(Math.fround($.Clamp$i32$i32$i32(iLevel, 0, iRange)) * this.Hgt) / Math.fround($max(iRange, 1)))));
    let iY = 0;
    let vidx = 0;
    let gfx_draw = gfx.$clone();
    let filled = false;
    while (Math.fround(iY) < this.Hgt) {
      let dy = iY % h;
      let dh = ftoi32(Math.fround(iY) >= Math.fround(this.Hgt - Math.fround(h)) ? Math.fround(this.Hgt - Math.fround(iY)) : Math.fround(h - dy | 0));
      if (!filled) {
        if (iY >= yBar) {
          filled = true;
        } else if ((iY + h | 0) >= yBar) {
          dh = yBar - iY | 0;
        }
      }
      if (vidx === 0 && iY !== 0 && (iY + dh | 0) > h) {
        if (iY < h) {
          dh = h - iY | 0;
        } else {
          vidx = vidx + 1 | 0;
        }
      }
      if (Math.fround(iY + dh | 0) >= Math.fround(this.Hgt - Math.fround(h))) {
        if (Math.fround(iY) >= Math.fround(this.Hgt - Math.fround(h))) {
          vidx = 2;
          dy = ftoi32(Math.fround(Math.fround(iY + h | 0) - this.Hgt));
        } else {
          dh = ftoi32(Math.fround(Math.fround(this.Hgt - Math.fround(h)) - Math.fround(iY)));
        }
      }
      gfx_draw.Y = Math.fround(Math.fround(gfx.Y + Math.fround(Math.imul(vidx, h))) + Math.fround(dy));
      gfx_draw.Hgt = Math.fround(dh);
      gfx_draw.Draw$pC4Surface$f32$f32$i32$i32(this.Surface, this.X, Math.fround(this.Y + Math.fround(iY)), (bar_idx + bar_idx | 0) + (!filled ? 1 : 0) | 0);
      iY = iY + dh | 0;
    }
  }

  DrawX(sfcTarget, iX, iY, iWdt, iHgt, iSectionX = 0, iSectionY = 0) {
    if ($.pDraw == null || this.Surface == null || sfcTarget == null || this.Wdt === 0 || this.Hgt === 0) {
      return;
    }
    $.pDraw.Blit(this.Surface, Math.fround(this.X + Math.fround(this.Wdt * Math.fround(iSectionX))), Math.fround(this.Y + Math.fround(this.Hgt * Math.fround(iSectionY))), this.Wdt, this.Hgt, sfcTarget, iX, iY, iWdt, iHgt, true);
  }

  DrawXFloat(sfcTarget, fX, fY, fWdt, fHgt) {
    if ($.pDraw == null || this.Surface == null || sfcTarget == null || this.Wdt === 0 || this.Hgt === 0 || fWdt <= Math.fround(0) || fHgt <= Math.fround(0)) {
      return;
    }
    let zx = Math.fround(fWdt / this.Wdt);
    let zy = Math.fround(fHgt / this.Hgt);
    let iX = ftoi32(c$ceilf(fX));
    let iY = ftoi32(c$ceilf(fY));
    let iX2 = ftoi32(c$floorf(Math.fround(fX + fWdt)));
    let iY2 = ftoi32(c$floorf(Math.fround(fY + fHgt)));
    let ox = Math.fround(Math.fround(-fX + Math.fround(iX)) / zx);
    let oy = Math.fround(Math.fround(-fY + Math.fround(iY)) / zy);
    let oxs = Math.fround(Math.fround(Math.fround(fX + fWdt) - Math.fround(iX2)) / zx);
    let oys = Math.fround(Math.fround(Math.fround(fY + fHgt) - Math.fround(iY2)) / zy);
    $.pDraw.Blit(this.Surface, Math.fround(this.X + ox), Math.fround(this.Y + oy), Math.fround(Math.fround(this.Wdt - ox) - oxs), Math.fround(Math.fround(this.Hgt - oy) - oys), sfcTarget, Math.fround(iX), Math.fround(iY), Math.fround(iX2 - iX | 0), Math.fround(iY2 - iY | 0), true);
    zx = Math.fround(Math.fround(iX2 - iX | 0) / Math.fround(Math.fround(this.Wdt - ox) - oxs));
    zy = Math.fround(Math.fround(iY2 - iY | 0) / Math.fround(Math.fround(this.Hgt - oy) - oys));
  }

  DrawValue(cgo, iValue, iSectionX = 0, iSectionY = 0, iAlign = 16) {
    if ($.pDraw == null) {
      return;
    }
    const ostr = new Int8Array(25);
    $.ssprintf$9(ostr, S("%i"), iValue);
    switch (iAlign) {
      case 16:
        this.Draw$rC4Facet$b$i32$i32$b(cgo, true, iSectionX, iSectionY);
        $.pDraw.TextOut(P(ostr, 0), $.GraphicsResource.FontRegular, Math.fround(1), cgo.Surface, Math.fround(Math.fround(cgo.X + cgo.Wdt) - Math.fround(1)), Math.fround(Math.fround(cgo.Y + cgo.Hgt) - Math.fround(1)), 0xffffffff, 2);
        break;
      case 2:
        {
          const textwdt = [0];
          const texthgt = [0];
          $.GraphicsResource.FontRegular.GetTextExtent(P(ostr, 0), P(textwdt, 0), P(texthgt, 0), false);
          $.pDraw.TextOut(P(ostr, 0), $.GraphicsResource.FontRegular, Math.fround(1), cgo.Surface, Math.fround(Math.fround(cgo.X + cgo.Wdt) - Math.fround(1)), cgo.Y, 0xffffffff, 2);
          cgo.Set$pC4Surface$f32$f32$f32$f32(cgo.Surface, Math.fround(Math.fround(Math.fround(Math.fround(cgo.X + cgo.Wdt) - Math.fround(1)) - Math.fround(textwdt[0])) - Math.fround(Math.fround(2) * cgo.Hgt)), cgo.Y, Math.fround(Math.fround(2) * cgo.Hgt), cgo.Hgt);
          this.Draw$rC4Facet$b$i32$i32$b(cgo, true, iSectionX, iSectionY);
          break;
        }
    }
  }

  DrawValue2(cgo, iValue1, iValue2, iSectionX = 0, iSectionY = 0, iAlign = 16, piUsedWidth = null) {
    if ($.pDraw == null) {
      return;
    }
    const ostr = new Int8Array(25);
    $.ssprintf$9(ostr, S("%i/%i"), iValue1, iValue2);
    switch (iAlign) {
      case 16:
        this.Draw$rC4Facet$b$i32$i32$b(cgo, true, iSectionX, iSectionY);
        $.pDraw.TextOut(P(ostr, 0), $.GraphicsResource.FontRegular, Math.fround(1), cgo.Surface, Math.fround(Math.fround(cgo.X + cgo.Wdt) - Math.fround(1)), Math.fround(Math.fround(cgo.Y + cgo.Hgt) - Math.fround(1)), 0xffffffff, 2);
        break;
      case 2:
        {
          const textwdt = [0];
          const texthgt = [0];
          $.GraphicsResource.FontRegular.GetTextExtent(P(ostr, 0), P(textwdt, 0), P(texthgt, 0), false);
          textwdt[0] = ftoi32(Math.fround(Math.fround(textwdt[0]) + Math.fround(this.Wdt + Math.fround(3))));
          $.pDraw.TextOut(P(ostr, 0), $.GraphicsResource.FontRegular, Math.fround(1), cgo.Surface, Math.fround(Math.fround(cgo.X + cgo.Wdt) - Math.fround(1)), cgo.Y, 0xffffffff, 2);
          cgo.Set$pC4Surface$f32$f32$f32$f32(cgo.Surface, Math.fround(Math.fround(cgo.X + cgo.Wdt) - Math.fround(textwdt[0])), cgo.Y, Math.fround(Math.fround(2) * cgo.Hgt), cgo.Hgt);
          this.Draw$rC4Facet$b$i32$i32$b(cgo, true, iSectionX, iSectionY);
          if (piUsedWidth != null) {
            piUsedWidth.a[piUsedWidth.o] = textwdt[0];
          }
        }
        break;
    }
  }

  Draw$rC4Facet$b$i32$i32$b(cgo, fAspect = true, iPhaseX = 0, iPhaseY = 0, fTransparent = true) {
    if ($.pDraw == null || this.Surface == null || cgo.Surface == null || this.Wdt === 0 || this.Hgt === 0) {
      return;
    }
    let ccgo = cgo.$clone();
    if (fAspect) {
      if (Math.fround(cgo.Wdt / this.Wdt) < Math.fround(cgo.Hgt / this.Hgt)) {
        ccgo.Hgt = Math.fround(Math.fround(this.Hgt * cgo.Wdt) / this.Wdt);
        ccgo.Y = Math.fround(ccgo.Y + Math.fround(Math.fround(cgo.Hgt - ccgo.Hgt) / Math.fround(2)));
      } else if (Math.fround(cgo.Hgt / this.Hgt) < Math.fround(cgo.Wdt / this.Wdt)) {
        ccgo.Wdt = Math.fround(Math.fround(this.Wdt * cgo.Hgt) / this.Hgt);
        ccgo.X = Math.fround(ccgo.X + Math.fround(Math.fround(cgo.Wdt - ccgo.Wdt) / Math.fround(2)));
      }
    }
    $.pDraw.Blit(this.Surface, Math.fround(this.X + Math.fround(this.Wdt * Math.fround(iPhaseX))), Math.fround(this.Y + Math.fround(this.Hgt * Math.fround(iPhaseY))), this.Wdt, this.Hgt, ccgo.Surface, ccgo.X, ccgo.Y, ccgo.Wdt, ccgo.Hgt, fTransparent);
  }

  DrawFullScreen(cgo) {
    if ($.pDraw == null || this.Surface == null || cgo.Surface == null || this.Wdt === 0 || this.Hgt === 0) {
      return;
    }
    let ccgo = cgo.$clone();
    if (cgo.Wdt > Math.fround(this.Wdt + Math.fround(2)) || cgo.Hgt > Math.fround(this.Wdt + Math.fround(2))) {
      ccgo.X = Math.fround(ccgo.X - Math.fround(1));
      ccgo.Y = Math.fround(ccgo.Y - Math.fround(1));
      ccgo.Wdt = Math.fround(ccgo.Wdt + Math.fround(2));
      ccgo.Hgt = Math.fround(ccgo.Hgt + Math.fround(2));
    }
    if (Math.fround(cgo.Wdt / this.Wdt) < Math.fround(cgo.Hgt / this.Hgt)) {
      ccgo.Wdt = Math.fround(Math.fround(this.Wdt * cgo.Hgt) / this.Hgt);
      ccgo.X = Math.fround(ccgo.X + Math.fround(Math.fround(cgo.Wdt - ccgo.Wdt) / Math.fround(2)));
    } else if (Math.fround(cgo.Hgt / this.Hgt) < Math.fround(cgo.Wdt / this.Wdt)) {
      ccgo.Hgt = Math.fround(Math.fround(this.Hgt * cgo.Wdt) / this.Wdt);
      ccgo.Y = Math.fround(ccgo.Y + Math.fround(Math.fround(cgo.Hgt - ccgo.Hgt) / Math.fround(2)));
    }
    $.pDraw.Blit(this.Surface, this.X, this.Y, this.Wdt, this.Hgt, ccgo.Surface, ccgo.X, ccgo.Y, ccgo.Wdt, ccgo.Hgt);
  }

  DrawT$pC4Surface$f32$f32$i32$i32$pC4DrawTransform(sfcTarget, iX, iY, iPhaseX, iPhaseY, pTransform) {
    if ($.pDraw == null || this.Surface == null || sfcTarget == null || this.Wdt === 0 || this.Hgt === 0) {
      return;
    }
    $.pDraw.Blit(this.Surface, Math.fround(this.X + Math.fround(this.Wdt * Math.fround(iPhaseX))), Math.fround(this.Y + Math.fround(this.Hgt * Math.fround(iPhaseY))), this.Wdt, this.Hgt, sfcTarget, iX, iY, this.Wdt, this.Hgt, true, pTransform);
  }

  DrawT$rC4Facet$b$i32$i32$pC4DrawTransform(cgo, fAspect, iPhaseX, iPhaseY, pTransform) {
    if ($.pDraw == null || this.Surface == null || cgo.Surface == null || this.Wdt === 0 || this.Hgt === 0) {
      return;
    }
    let ccgo = cgo.$clone();
    if (fAspect) {
      if (Math.fround(Math.fround(Math.fround(100) * cgo.Wdt) / this.Wdt) < Math.fround(Math.fround(Math.fround(100) * cgo.Hgt) / this.Hgt)) {
        ccgo.Hgt = Math.fround(Math.fround(this.Hgt * cgo.Wdt) / this.Wdt);
        ccgo.Y = Math.fround(ccgo.Y + Math.fround(Math.fround(cgo.Hgt - ccgo.Hgt) / Math.fround(2)));
      } else if (Math.fround(Math.fround(Math.fround(100) * cgo.Hgt) / this.Hgt) < Math.fround(Math.fround(Math.fround(100) * cgo.Wdt) / this.Wdt)) {
        ccgo.Wdt = Math.fround(Math.fround(this.Wdt * cgo.Hgt) / this.Hgt);
        ccgo.X = Math.fround(ccgo.X + Math.fround(Math.fround(cgo.Wdt - ccgo.Wdt) / Math.fround(2)));
      }
    }
    $.pDraw.Blit(this.Surface, Math.fround(this.X + Math.fround(this.Wdt * Math.fround(iPhaseX))), Math.fround(this.Y + Math.fround(this.Hgt * Math.fround(iPhaseY))), this.Wdt, this.Hgt, ccgo.Surface, ccgo.X, ccgo.Y, ccgo.Wdt, ccgo.Hgt, true, pTransform);
  }

  DrawTUnscaled$pC4Surface$f32$f32$i32$i32$pC4DrawTransform(sfcTarget, iX, iY, iPhaseX, iPhaseY, pTransform) {
    if ($.pDraw == null || this.Surface == null || sfcTarget == null || this.Wdt === 0 || this.Hgt === 0) {
      return;
    }
    $.pDraw.BlitUnscaled(this.Surface, Math.fround(this.X + Math.fround(this.Wdt * Math.fround(iPhaseX))), Math.fround(this.Y + Math.fround(this.Hgt * Math.fround(iPhaseY))), this.Wdt, this.Hgt, sfcTarget, iX, iY, this.Wdt, this.Hgt, true, pTransform);
  }

  DrawTUnscaled$rC4Facet$b$i32$i32$pC4DrawTransform(cgo, fAspect, iPhaseX, iPhaseY, pTransform) {
    if ($.pDraw == null || this.Surface == null || cgo.Surface == null || this.Wdt === 0 || this.Hgt === 0) {
      return;
    }
    let ccgo = cgo.$clone();
    if (fAspect) {
      if (Math.fround(Math.fround(Math.fround(100) * cgo.Wdt) / this.Wdt) < Math.fround(Math.fround(Math.fround(100) * cgo.Hgt) / this.Hgt)) {
        ccgo.Hgt = Math.fround(Math.fround(this.Hgt * cgo.Wdt) / this.Wdt);
        ccgo.Y = Math.fround(ccgo.Y + Math.fround(Math.fround(cgo.Hgt - ccgo.Hgt) / Math.fround(2)));
      } else if (Math.fround(Math.fround(Math.fround(100) * cgo.Hgt) / this.Hgt) < Math.fround(Math.fround(Math.fround(100) * cgo.Wdt) / this.Wdt)) {
        ccgo.Wdt = Math.fround(Math.fround(this.Wdt * cgo.Hgt) / this.Hgt);
        ccgo.X = Math.fround(ccgo.X + Math.fround(Math.fround(cgo.Wdt - ccgo.Wdt) / Math.fround(2)));
      }
    }
    $.pDraw.BlitUnscaled(this.Surface, Math.fround(this.X + Math.fround(this.Wdt * Math.fround(iPhaseX))), Math.fround(this.Y + Math.fround(this.Hgt * Math.fround(iPhaseY))), this.Wdt, this.Hgt, ccgo.Surface, ccgo.X, ccgo.Y, ccgo.Wdt, ccgo.Hgt, true, pTransform);
  }

  DrawXT(sfcTarget, iX, iY, iWdt, iHgt, iPhaseX, iPhaseY, pTransform) {
    if ($.pDraw == null || this.Surface == null || sfcTarget == null || this.Wdt === 0 || this.Hgt === 0) {
      return;
    }
    $.pDraw.Blit(this.Surface, Math.fround(this.X + Math.fround(this.Wdt * Math.fround(iPhaseX))), Math.fround(this.Y + Math.fround(this.Hgt * Math.fround(iPhaseY))), this.Wdt, this.Hgt, sfcTarget, iX, iY, Math.fround(iWdt), Math.fround(iHgt), true, pTransform);
  }

  DrawClr(cgo, fAspect = true, dwClr = 0) {
    if (this.Surface == null) {
      return;
    }
    this.Surface.SetClr(dwClr);
    this.Draw$rC4Facet$b$i32$i32$b(cgo, fAspect);
  }

  DrawXClr(sfcTarget, iX, iY, iWdt, iHgt, dwClr) {
    this.Surface.SetClr(dwClr);
    this.DrawX(sfcTarget, Math.fround(iX), Math.fround(iY), Math.fround(iWdt), Math.fround(iHgt));
  }

  DrawValue2Clr(cgo, iValue1, iValue2, dwClr) {
    this.Surface.SetClr(dwClr);
    this.DrawValue2(cgo, iValue1, iValue2);
  }

  DrawXR(sfcTarget, iX, iY, iWdt, iHgt, iSectionX = 0, iSectionY = 0, r = 0) {
    if ($.pDraw == null || this.Surface == null || sfcTarget == null || this.Wdt === 0 || this.Hgt === 0) {
      return;
    }
    let rot = new $.C4BltTransform();
    rot.SetRotate(Math.fround(Math.fround(r) / 100), Math.fround(Math.fround((iX + iX | 0) + iWdt | 0) / Math.fround(2)), Math.fround(Math.fround((iY + iY | 0) + iHgt | 0) / Math.fround(2)));
    $.pDraw.Blit(this.Surface, Math.fround(this.X + Math.fround(this.Wdt * Math.fround(iSectionX))), Math.fround(this.Y + Math.fround(this.Hgt * Math.fround(iSectionY))), this.Wdt, this.Hgt, sfcTarget, Math.fround(iX), Math.fround(iY), Math.fround(iWdt), Math.fround(iHgt), true, rot);
  }

  Draw$pC4Surface$f32$f32$i32$i32(sfcTarget, iX, iY, iPhaseX = 0, iPhaseY = 0) {
    if ($.pDraw == null || this.Surface == null || sfcTarget == null || this.Wdt === 0 || this.Hgt === 0) {
      return;
    }
    $.pDraw.Blit(this.Surface, Math.fround(this.X + Math.fround(this.Wdt * Math.fround(iPhaseX))), Math.fround(this.Y + Math.fround(this.Hgt * Math.fround(iPhaseY))), this.Wdt, this.Hgt, sfcTarget, iX, iY, this.Wdt, this.Hgt, true);
  }

  GetPhaseNum(rX, rY) {
    if (this.Surface == null) {
      return false;
    }
    rX.a[rX.o] = ftoi32(Math.fround(Math.fround(this.Surface.Wdt) / this.Wdt));
    rY.a[rY.o] = ftoi32(Math.fround(Math.fround(this.Surface.Hgt) / this.Hgt));
    return true;
  }

  GetSection(iSection) {
    let rval = new C4Facet().init$v();
    rval.Set$pC4Surface$f32$f32$f32$f32(this.Surface, Math.fround(this.X + Math.fround(this.Hgt * Math.fround(iSection))), this.Y, this.Hgt, this.Hgt);
    return rval;
  }

  GetPhase(iPhaseX = 0, iPhaseY = 0) {
    let fctResult = new C4Facet().init$v();
    fctResult.Set$pC4Surface$f32$f32$f32$f32(this.Surface, Math.fround(this.X + Math.fround(this.Wdt * Math.fround(iPhaseX))), Math.fround(this.Y + Math.fround(this.Hgt * Math.fround(iPhaseY))), this.Wdt, this.Hgt);
    return fctResult;
  }

  GetFraction(percentWdt, percentHgt = 0, alignX = 1, alignY = 4) {
    let rval = new C4Facet().init$v();
    if (percentHgt === 0) {
      percentHgt = percentWdt;
    }
    let iX = ftoi32(this.X);
    let iY = ftoi32(this.Y);
    let iWdt = ftoi32($max(Math.fround(Math.fround(this.Wdt * Math.fround(percentWdt)) / Math.fround(100)), 1));
    let iHgt = ftoi32($max(Math.fround(Math.fround(this.Hgt * Math.fround(percentHgt)) / Math.fround(100)), 1));
    if ((alignX & 2) !== 0) {
      iX = ftoi32(Math.fround(Math.fround(iX) + Math.fround(this.Wdt - Math.fround(iWdt))));
    }
    if ((alignX & 16) !== 0) {
      iX = ftoi32(Math.fround(Math.fround(iX) + Math.fround(Math.fround(this.Wdt / Math.fround(2)) - Math.fround(iWdt / 2 | 0))));
    }
    if ((alignY & 8) !== 0) {
      iY = ftoi32(Math.fround(Math.fround(iY) + Math.fround(this.Hgt - Math.fround(iHgt))));
    }
    if ((alignY & 16) !== 0) {
      iY = ftoi32(Math.fround(Math.fround(iY) + Math.fround(Math.fround(this.Hgt / Math.fround(2)) - Math.fround(iHgt / 2 | 0))));
    }
    rval.Set$pC4Surface$f32$f32$f32$f32(this.Surface, Math.fround(iX), Math.fround(iY), Math.fround(iWdt), Math.fround(iHgt));
    return rval;
  }

  TruncateSection(iAlign = 1) {
    let fctResult = new C4Facet().init$v();
    fctResult.Set$pC4Surface$f32$f32$f32$f32(this.Surface, Math.fround(0), Math.fround(0), Math.fround(0), Math.fround(0));
    let iWdt = ftoi32(this.Wdt);
    let iHgt = ftoi32(this.Hgt);
    switch (iAlign & 31) {
      case 1:
      case 2:
        iWdt = ftoi32(this.Hgt);
        if ((iAlign & 128) !== 0) {
          iWdt = Math.imul(iWdt, 3);
        }
        if ((iAlign & 64) !== 0) {
          iWdt = Math.imul(iWdt, 2);
        }
        if ((iAlign & 32) !== 0) {
          iWdt = iWdt / 2 | 0;
        }
        break;
      case 4:
      case 8:
        iHgt = ftoi32(this.Wdt);
        if ((iAlign & 128) !== 0) {
          iHgt = Math.imul(iHgt, 3);
        }
        if ((iAlign & 64) !== 0) {
          iHgt = Math.imul(iHgt, 2);
        }
        if ((iAlign & 32) !== 0) {
          iHgt = iHgt / 2 | 0;
        }
        break;
    }
    if (Math.fround(iWdt) > this.Wdt || Math.fround(iHgt) > this.Hgt) {
      return fctResult;
    }
    switch (iAlign & 31) {
      case 1:
        fctResult.Set$pC4Surface$f32$f32$f32$f32(this.Surface, this.X, this.Y, Math.fround(iWdt), Math.fround(iHgt));
        this.X = Math.fround(this.X + Math.fround(iWdt));
        this.Wdt = Math.fround(this.Wdt - Math.fround(iWdt));
        break;
      case 2:
        fctResult.Set$pC4Surface$f32$f32$f32$f32(this.Surface, Math.fround(Math.fround(this.X + this.Wdt) - Math.fround(iWdt)), this.Y, Math.fround(iWdt), Math.fround(iHgt));
        this.Wdt = Math.fround(this.Wdt - Math.fround(iWdt));
        break;
      case 4:
        fctResult.Set$pC4Surface$f32$f32$f32$f32(this.Surface, this.X, this.Y, Math.fround(iWdt), Math.fround(iHgt));
        this.Y = Math.fround(this.Y + Math.fround(iHgt));
        this.Hgt = Math.fround(this.Hgt - Math.fround(iHgt));
        break;
      case 8:
        fctResult.Set$pC4Surface$f32$f32$f32$f32(this.Surface, this.X, Math.fround(Math.fround(this.Y + this.Hgt) - Math.fround(iHgt)), Math.fround(iWdt), Math.fround(iHgt));
        this.Hgt = Math.fround(this.Hgt - Math.fround(iHgt));
        break;
    }
    return fctResult;
  }

  Truncate(iAlign, iSize) {
    let fctResult = new C4Facet().init$v();
    fctResult.Set$pC4Surface$f32$f32$f32$f32(this.Surface, Math.fround(0), Math.fround(0), Math.fround(0), Math.fround(0));
    let iWdt = ftoi32(this.Wdt);
    let iHgt = ftoi32(this.Hgt);
    switch (iAlign) {
      case 1:
      case 2:
        iWdt = iSize;
        break;
      case 4:
      case 8:
        iHgt = iSize;
        break;
    }
    if (Math.fround(iWdt) > this.Wdt || Math.fround(iHgt) > this.Hgt) {
      return fctResult;
    }
    switch (iAlign) {
      case 1:
        fctResult.Set$pC4Surface$f32$f32$f32$f32(this.Surface, this.X, this.Y, Math.fround(iWdt), Math.fround(iHgt));
        this.X = Math.fround(this.X + Math.fround(iWdt));
        this.Wdt = Math.fround(this.Wdt - Math.fround(iWdt));
        break;
      case 2:
        fctResult.Set$pC4Surface$f32$f32$f32$f32(this.Surface, Math.fround(Math.fround(this.X + this.Wdt) - Math.fround(iWdt)), this.Y, Math.fround(iWdt), Math.fround(iHgt));
        this.Wdt = Math.fround(this.Wdt - Math.fround(iWdt));
        break;
      case 4:
        fctResult.Set$pC4Surface$f32$f32$f32$f32(this.Surface, this.X, this.Y, Math.fround(iWdt), Math.fround(iHgt));
        this.Y = Math.fround(this.Y + Math.fround(iHgt));
        this.Hgt = Math.fround(this.Hgt - Math.fround(iHgt));
        break;
      case 8:
        fctResult.Set$pC4Surface$f32$f32$f32$f32(this.Surface, this.X, Math.fround(Math.fround(this.Y + this.Hgt) - Math.fround(iHgt)), Math.fround(iWdt), Math.fround(iHgt));
        this.Hgt = Math.fround(this.Hgt - Math.fround(iHgt));
        break;
    }
    return fctResult;
  }

  GetSectionCount() {
    if (this.Hgt === Math.fround(0)) {
      return 0;
    }
    return ftoi32(Math.fround(this.Wdt / this.Hgt));
  }

  GetWidthByHeight(iHeight) {
    return ftoi32(Math.fround(Math.fround(Math.fround(iHeight) * this.Wdt) / (this.Hgt !== 0 ? this.Hgt : Math.fround(1))));
  }

  GetHeightByWidth(iWidth) {
    return ftoi32(Math.fround(Math.fround(Math.fround(iWidth) * this.Hgt) / (this.Wdt !== 0 ? this.Wdt : Math.fround(1))));
  }

  $clone() { return new C4Facet().$assign(this); }
  $assign(o) {
    this.Surface = o.Surface;
    this.X = o.X;
    this.Y = o.Y;
    this.Wdt = o.Wdt;
    this.Hgt = o.Hgt;
    return this;
  }
}

export class C4DrawTransform extends C4BltTransform {
  FlipDir = 0;

  init$rC4DrawTransform$f32$f32(rCopy, iOffX, iOffY) {
    C4DrawTransform.prototype.SetTransformAt.call(this, rCopy, iOffX, iOffY);
    return this;
  }

  init$v() {
    this.FlipDir = 1;
    return this;
  }

  init$i32(iFlipDir) {
    this.FlipDir = iFlipDir;
    C4DrawTransform.prototype.Set.call(this, Math.fround(1), Math.fround(0), Math.fround(0), Math.fround(0), Math.fround(1), Math.fround(0), Math.fround(0), Math.fround(0), Math.fround(1));
    return this;
  }

  SetTransformAt(r, iOffX, iOffY) {
    let A = Math.fround(r.mat[0] + Math.fround(r.mat[6] * iOffX));
    let B = Math.fround(r.mat[1] + Math.fround(r.mat[7] * iOffX));
    let D = Math.fround(r.mat[3] + Math.fround(r.mat[6] * iOffY));
    let E = Math.fround(r.mat[4] + Math.fround(r.mat[7] * iOffY));
    $.C4BltTransform.prototype.Set.call(this, A, B, Math.fround(Math.fround(Math.fround(r.mat[2] - Math.fround(A * iOffX)) - Math.fround(B * iOffY)) + Math.fround(r.mat[8] * iOffX)), D, E, Math.fround(Math.fround(Math.fround(r.mat[5] - Math.fround(D * iOffX)) - Math.fround(E * iOffY)) + Math.fround(r.mat[8] * iOffY)), r.mat[6], r.mat[7], Math.fround(Math.fround(r.mat[8] - Math.fround(r.mat[6] * iOffX)) - Math.fround(r.mat[7] * iOffY)));
  }

  Set(fA, fB, fC, fD, fE, fF, fG, fH, fI) {
    $.C4BltTransform.prototype.Set.call(this, Math.fround(fA * Math.fround(this.FlipDir)), fB, fC, fD, fE, fF, fG, fH, fI);
  }

  SetFlipDir(iNewFlipDir) {
    if (iNewFlipDir === this.FlipDir) {
      return;
    }
    this.FlipDir = iNewFlipDir;
    this.mat[0] = -this.mat[0];
  }

  IsIdentity() {
    return this.mat[0] === 1 && this.mat[1] === 0 && this.mat[2] === 0 && this.mat[3] === 0 && this.mat[4] === 1 && this.mat[5] === 0 && this.mat[6] === 0 && this.mat[7] === 0 && this.mat[8] === 1 && this.FlipDir === 1;
  }

  op_eq(rCmp) {
    return this.mat[0] === rCmp.mat[0] && this.mat[1] === rCmp.mat[1] && this.mat[2] === rCmp.mat[2] && this.mat[3] === rCmp.mat[3] && this.mat[4] === rCmp.mat[4] && this.mat[5] === rCmp.mat[5] && this.mat[6] === rCmp.mat[6] && this.mat[7] === rCmp.mat[7] && this.mat[8] === rCmp.mat[8] && this.FlipDir === rCmp.FlipDir;
  }

  op_and() {
    return this;
  }

  CompileFunc(pComp) {
    let deserializing = pComp.isDeserializer();
    let i = 0;
    for (i = 0; i < 6; i = i + 1 | 0) {
      if (i !== 0) {
        pComp.Separator();
      }
      let val = new $.StdStrBuf();
      if (!deserializing) {
        val.Format(S("%g"), this.mat[i]);
      }
      pComp.Value$StdParameterAdapt$StdStrBuf$i32$2($.mkParAdapt$rStdStrBuf$mi32(val, 2 /*RCT_Idtf*/));
      if (deserializing && pComp.hasNaming()) {
        if (pComp.Separator(4 /*SEP_PART*/)) {
          let val2 = new $.StdStrBuf();
          pComp.Value$StdParameterAdapt$StdStrBuf$i32$2($.mkParAdapt$rStdStrBuf$mi32(val2, 2 /*RCT_Idtf*/));
          val.AppendChar(46);
          val.Append$StdStrBuf(val2);
        }
      }
      if (deserializing) {
        c$sscanf(val.getData(), S("%g"), P(this.mat, i));
      }
    }
    pComp.Separator();
    pComp.Value$ri32(P(this, "FlipDir"));
    if (!deserializing && this.mat[6] === Math.fround(0) && this.mat[7] === Math.fround(0) && this.mat[8] === Math.fround(1)) {
      return;
    }
    for (i = 6; i < 9; i = i + 1 | 0) {
      if (!pComp.Separator()) {
        this.mat[i] = i === 8 ? 1 : 0;
      } else {
        let val = new $.StdStrBuf();
        if (!deserializing) {
          val.Format(S("%g"), this.mat[i]);
        }
        pComp.Value$StdParameterAdapt$StdStrBuf$i32$2($.mkParAdapt$rStdStrBuf$mi32(val, 2 /*RCT_Idtf*/));
        if (deserializing && pComp.hasNaming()) {
          if (pComp.Separator(4 /*SEP_PART*/)) {
            let val2 = new $.StdStrBuf();
            pComp.Value$StdParameterAdapt$StdStrBuf$i32$2($.mkParAdapt$rStdStrBuf$mi32(val2, 2 /*RCT_Idtf*/));
            val.AppendChar(46);
            val.Append$StdStrBuf(val2);
          }
        }
        if (deserializing) {
          c$sscanf(val.getData(), S("%g"), P(this.mat, i));
        }
      }
    }
  }

  GetXOffset() {
    return ftoi32(this.mat[2]);
  }

  GetYOffset() {
    return ftoi32(this.mat[5]);
  }

  $clone() { return new C4DrawTransform().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.FlipDir = o.FlipDir;
    return this;
  }
}

export class C4TargetFacet extends C4Facet {
  TargetX = 0;
  TargetY = 0;
  Zoom = 0;
  ParRefX = 0;
  ParRefY = 0;

  init() {
    super.init$v();
    C4TargetFacet.prototype.Default.call(this);
    return this;
  }

  Default() {
    this.TargetX = this.TargetY = Math.fround(0);
    this.Zoom = Math.fround(1);
    this.ParRefX = this.ParRefY = Math.fround(0);
    C4Facet.prototype.Default.call(this);
  }

  Clear() {
    this.Surface = null;
  }

  Set$C4Facet(cpy) {
    this.TargetX = this.TargetY = Math.fround(0);
    this.Zoom = Math.fround(1);
    this.ParRefX = this.ParRefY = Math.fround(0);
    C4Facet.prototype.Set$C4Facet.call(this, cpy);
  }

  Set$C4TargetFacet(cpy) {
    C4TargetFacet.prototype.$assign.call(this, cpy);
  }

  Set$pC4Surface$f32$f32$f32$f32$f32$f32$f32(nsfc, nx, ny, nwdt, nhgt, ntx = Math.fround(0), nty = Math.fround(0), Zoom = Math.fround(1)) {
    this.Set$pC4Surface$f32$f32$f32$f32$f32$f32$f32$f32$f32(nsfc, nx, ny, nwdt, nhgt, ntx, nty, Zoom, ntx, nty);
  }

  Set$pC4Surface$C4Rect$f32$f32$f32(nsfc, r, ntx = Math.fround(0), nty = Math.fround(0), Zoom = Math.fround(1)) {
    this.Set$pC4Surface$f32$f32$f32$f32$f32$f32$f32(nsfc, Math.fround(r.x), Math.fround(r.y), Math.fround(r.Wdt), Math.fround(r.Hgt), ntx, nty, Zoom);
  }

  Set$pC4Surface$f32$f32$f32$f32$f32$f32$f32$f32$f32(nsfc, nx, ny, nwdt, nhgt, ntx, nty, Zoom, prx, pry) {
    C4Facet.prototype.Set$pC4Surface$f32$f32$f32$f32.call(this, nsfc, nx, ny, nwdt, nhgt);
    this.TargetX = ntx;
    this.TargetY = nty;
    this.Zoom = Zoom;
    this.ParRefX = prx;
    this.ParRefY = pry;
  }

  op_assign$C4Facet(rhs) {
    this.Set$pC4Surface$f32$f32$f32$f32$f32$f32$f32(rhs.Surface, rhs.X, rhs.Y, rhs.Wdt, rhs.Hgt);
    return this;
  }

  SetRect(rSrc) {
    this.X = Math.fround(rSrc.x);
    this.Y = Math.fround(rSrc.y);
    this.Wdt = Math.fround(rSrc.Wdt);
    this.Hgt = Math.fround(rSrc.Hgt);
    this.TargetX = Math.fround(rSrc.tx);
    this.TargetY = Math.fround(rSrc.ty);
    this.ParRefX = Math.fround(rSrc.tx);
    this.TargetY = Math.fround(rSrc.ty);
  }

  $clone() { return new C4TargetFacet().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.TargetX = o.TargetX;
    this.TargetY = o.TargetY;
    this.Zoom = o.Zoom;
    this.ParRefX = o.ParRefX;
    this.ParRefY = o.ParRefY;
    return this;
  }
}











export function $init(): void {
  $.C4FCT_None$C4Facet = 0;
  $.C4FCT_Left$C4Facet = 1;
  $.C4FCT_Right$C4Facet = 2;
  $.C4FCT_Top$C4Facet = 4;
  $.C4FCT_Bottom$C4Facet = 8;
  $.C4FCT_Center$C4Facet = 16;
  $.C4FCT_Alignment$C4Facet = 31;
  $.C4FCT_Half$C4Facet = 32;
  $.C4FCT_Double$C4Facet = 64;
  $.C4FCT_Triple$C4Facet = 128;
}

Object.assign($, { C4DrawTransform, C4Facet, C4TargetFacet, C4Vec2D });
