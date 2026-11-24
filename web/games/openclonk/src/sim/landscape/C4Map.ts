// @ts-nocheck
// OpenClonk 36de799: src/landscape/C4Map.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { ftoi32 } from '../../rt/int.ts';
import { c$sin, c$sqrt } from '../../rt/libc.ts';
import { Random } from '../../rt/native.ts';
import { P } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $min } from '../../rt/std.ts';

export class C4MapCreator {
  MapBuf = null;
  MapBkgBuf = null;
  MapWdt = 0;
  MapHgt = 0;
  Exclusive = 0;

  init() {
    C4MapCreator.prototype.Reset.call(this);
    return this;
  }

  Create(sfcMap, rLScape, rTexMap, iPlayerNum = 1) {
    let fullperiod = 20 * 3.141592653589793;
    let ccol = 0;
    let cx = 0;
    let cy = 0;
    if (sfcMap == null) {
      return;
    }
    iPlayerNum = $.Clamp$i32$i32$i32(iPlayerNum, 1, 4);
    this.MapBuf = sfcMap;
    this.MapWdt = this.MapBuf.Wdt;
    this.MapHgt = this.MapBuf.Hgt;
    this.MapBuf.ClearBox8Only(0, 0, this.MapBuf.Wdt, this.MapBuf.Hgt);
    ccol = rTexMap.GetIndexMatTex(rLScape.Material.c_str()) & 0xff;
    let amplitude = Math.fround(rLScape.Amplitude.Evaluate());
    let phase = Math.fround(rLScape.Phase.Evaluate());
    let period = Math.fround(rLScape.Period.Evaluate());
    if (rLScape.MapPlayerExtend !== 0) {
      period = Math.fround(period * Math.fround($min(iPlayerNum, $.C4S_MaxMapPlayerExtend$C4Scenario)));
    }
    let natural = Math.fround(rLScape.Random.Evaluate());
    let level0 = $min(this.MapWdt, this.MapHgt) / 2 | 0;
    let maxrange = Math.imul(level0, 3) / 4 | 0;
    let cy_curve = 0;
    let cy_natural = 0;
    let rnd_cy = 0;
    let rnd_tend = 0;
    rnd_cy = (Random(2001) - 1000 >>> 0) / 1000;
    rnd_tend = (Random(201) - 100 >>> 0) / 20000;
    for (cx = 0; cx < this.MapWdt; cx = cx + 1 | 0) {
      rnd_cy += rnd_tend;
      rnd_tend += (Random(101) - 50 >>> 0) / 10000;
      if (rnd_tend > 0.05) {
        rnd_tend = 0.05;
      }
      if (rnd_tend < -0.05) {
        rnd_tend = -0.05;
      }
      if (rnd_cy < -0.5) {
        rnd_tend += 0.01;
      }
      if (rnd_cy > 0.5) {
        rnd_tend -= 0.01;
      }
      cy_natural = rnd_cy * natural / 100;
      cy_curve = c$sin(fullperiod * period / 100 * Math.fround(cx) / Math.fround(this.MapWdt) + 2 * 3.141592653589793 * phase / 100) * amplitude / 100;
      cy = level0 + $.Clamp$i32$i32$i32(ftoi32(Math.fround(maxrange) * (cy_curve + cy_natural)), -maxrange | 0, maxrange) | 0;
      this.SetPix(cx, cy, ccol);
    }
    for (cx = 0; cx < this.MapWdt; cx = cx + 1 | 0) {
      for (cy = this.MapHgt - 1 | 0; cy >= 0 && !(this.GetPix(cx, cy) !== 0); cy = cy - 1 | 0) {
        this.SetPix(cx, cy, ccol);
      }
    }
    this.Exclusive = 0;
    ccol = rTexMap.GetIndexMatTex(rLScape.Liquid.c_str()) & 0xff;
    let wtr_level = rLScape.LiquidLevel.Evaluate();
    for (cx = 0; cx < this.MapWdt; cx = cx + 1 | 0) {
      for (cy = Math.imul(this.MapHgt, 100 - wtr_level | 0) / 100 | 0; cy < this.MapHgt; cy = cy + 1 | 0) {
        this.SetPix(cx, cy, ccol);
      }
    }
    this.Exclusive = -1;
    this.Exclusive = rTexMap.GetIndexMatTex(rLScape.Material.c_str());
    let cnt = 0;
    let clayer = 0;
    let layer_num = 0;
    let sptx = 0;
    let spty = 0;
    for (clayer = 0; clayer < 10; clayer = clayer + 1 | 0) {
      if (rLScape.Layers.Name[clayer][0] !== 0) {
        ccol = rTexMap.GetIndexMatTex(P(rLScape.Layers.Name[clayer], 0)) & 0xff;
        layer_num = rLScape.Layers.Count[clayer];
        layer_num = Math.imul(Math.imul(layer_num, this.MapWdt), this.MapHgt) / 15000 | 0;
        for (cnt = 0; cnt < layer_num; cnt = cnt + 1 | 0) {
          sptx = Random(this.MapWdt >>> 0) | 0;
          for (spty = 0; spty < this.MapHgt && this.GetPix(sptx, spty) !== this.Exclusive; spty = spty + 1 | 0) {
          }
          spty = (spty >>> 0) + (5 + Random(((this.MapHgt - spty | 0) - 10 | 0) >>> 0) >>> 0) >>> 0 | 0;
          this.DrawLayer(sptx, spty, Random(15) | 0, ccol);
        }
      }
    }
    this.Exclusive = -1;
  }

  Reset() {
    this.MapBuf = null;
    this.Exclusive = -1;
  }

  SetPix(x, y, col) {
    if (!$.Inside$i32$i32$i32$3(x, 0, this.MapWdt - 1 | 0) || !$.Inside$i32$i32$i32$3(y, 0, this.MapHgt - 1 | 0)) {
      return;
    }
    if (this.Exclusive > -1) {
      if (this.GetPix(x, y) !== this.Exclusive) {
        return;
      }
    }
    this.MapBuf.SetPix(x, y, col);
  }

  SetSpot(x, y, rad, col) {
    let ycnt = 0;
    let xcnt = 0;
    let lwdt = 0;
    let dpy = 0;
    for (ycnt = -rad | 0; ycnt <= rad; ycnt = ycnt + 1 | 0) {
      lwdt = ftoi32(c$sqrt(Math.imul(rad, rad) - Math.imul(ycnt, ycnt) | 0));
      dpy = y + ycnt | 0;
      for (xcnt = -lwdt | 0; xcnt < (lwdt + (lwdt === 0 ? 1 : 0) | 0); xcnt = xcnt + 1 | 0) {
        this.SetPix(x + xcnt | 0, dpy, col);
      }
    }
  }

  DrawLayer(x, y, size, col) {
    let cnt = 0;
    let cnt2 = 0;
    for (cnt = 0; cnt < size; cnt = cnt + 1 | 0) {
      x = (x >>> 0) + (Random(9) - 4 >>> 0) >>> 0 | 0;
      y = (y >>> 0) + (Random(3) - 1 >>> 0) >>> 0 | 0;
      for (cnt2 = Random(3) | 0; cnt2 < 5; cnt2 = cnt2 + 1 | 0) {
        this.SetPix(x + cnt2 | 0, y, col);
        this.SetPix((x + cnt2 | 0) + 1 | 0, y + 1 | 0, col);
      }
    }
  }

  ValidateTextureIndices(rTextureMap) {
    let iX = 0;
    let iY = 0;
    for (iY = 0; iY < this.MapHgt; iY = iY + 1 | 0) {
      for (iX = 0; iX < this.MapWdt; iX = iX + 1 | 0) {
        if (!(rTextureMap.GetEntry(this.GetPix(iX, iY)) != null)) {
          this.SetPix(iX, iY, 0);
        }
      }
    }
  }

  GetPix(x, y) {
    if (!$.Inside$i32$i32$i32$3(x, 0, this.MapWdt - 1 | 0) || !$.Inside$i32$i32$i32$3(y, 0, this.MapHgt - 1 | 0)) {
      return 0;
    }
    return this.MapBuf.GetPix(x, y);
  }

  $clone() { return new C4MapCreator().$assign(this); }
  $assign(o) {
    this.MapBuf = o.MapBuf;
    this.MapBkgBuf = o.MapBkgBuf;
    this.MapWdt = o.MapWdt;
    this.MapHgt = o.MapHgt;
    this.Exclusive = o.Exclusive;
    return this;
  }
}

export function $init(): void {
}

Object.assign($, { C4MapCreator });
