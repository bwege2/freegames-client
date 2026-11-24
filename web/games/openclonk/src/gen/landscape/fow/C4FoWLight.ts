// @ts-nocheck
// OpenClonk 36de799: src/landscape/fow/C4FoWLight.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { ftoi32 } from '../../../rt/int.ts';
import { c$sqrt } from '../../../rt/libc.ts';
import { $rd, P } from '../../../rt/ptr.ts';
import { $ } from '../../../rt/registry.ts';
import { $begin, $delete, $end, $filled, $itcopy, $max, $min, $rbegin, seq_splice } from '../../../rt/std.ts';

export class C4FoWLight {
  iX = 0;
  iY = 0;
  iReach = 0;
  iFadeout = 0;
  iSize = 0;
  gBright = 0;
  colorR = 0;
  colorG = 0;
  colorB = 0;
  colorV = 0;
  colorL = 0;
  pNext = null;
  pObj = null;
  sections = [];
  OnScreenStrategy = null;
  OffScreenStrategy = null;

  init(pObj) {
    this.iX = $.fixtoi$C4Fixed(pObj.fix_x);
    this.iY = $.fixtoi$C4Fixed(pObj.fix_y);
    this.iReach = pObj.lightRange;
    this.iFadeout = pObj.lightFadeoutRange;
    this.iSize = 20;
    this.gBright = Math.fround(0.5);
    this.colorR = Math.fround(1);
    this.colorG = Math.fround(1);
    this.colorB = Math.fround(1);
    this.colorV = Math.fround(1);
    this.colorL = Math.fround(1);
    this.pNext = null;
    this.pObj = pObj;
    this.sections = $filled(4, () => null);
    this.OnScreenStrategy = null;
    this.OffScreenStrategy = null;
    this.sections[0] = new $.C4FoWLightSection().init(this, 0);
    this.sections[1] = new $.C4FoWLightSection().init(this, 90);
    this.sections[2] = new $.C4FoWLightSection().init(this, 180);
    this.sections[3] = new $.C4FoWLightSection().init(this, 270);
    return this;
  }

  $dtor() {
    let $t1;
    $t1 = this.sections;
    for (let $i1 = 0; $i1 < $t1.length; $i1++) {
      const section = P($t1, $i1);
      $delete(section.a[section.o]);
    }
  }

  getX() {
    return this.iX;
  }

  getY() {
    return this.iY;
  }

  getReach() {
    return this.iReach;
  }

  getFadeout() {
    return this.iFadeout;
  }

  getTotalReach() {
    return this.iReach + this.iFadeout | 0;
  }

  getSize() {
    return this.iSize;
  }

  getNormalSize() {
    return Math.imul(this.iSize, 2);
  }

  getBrightness() {
    return Math.fround(this.colorV * this.gBright);
  }

  getR() {
    return this.colorR;
  }

  getG() {
    return this.colorG;
  }

  getB() {
    return this.colorB;
  }

  getValue() {
    return this.colorV;
  }

  getLightness() {
    return this.colorL;
  }

  getNext() {
    return this.pNext;
  }

  getObj() {
    return this.pObj;
  }

  SetReach(iReach2, iFadeout2) {
    let $t1, $t2;
    this.iFadeout = iFadeout2;
    if (this.iReach === iReach2) {
      return;
    }
    if (iReach2 < this.iReach) {
      this.iReach = iReach2;
      $t1 = this.sections;
      for (let $i2 = 0; $i2 < $t1.length; $i2++) {
        const section = P($t1, $i2);
        section.a[section.o].Prune(this.iReach);
      }
    } else {
      this.iReach = iReach2;
      $t2 = this.sections;
      for (let $i2 = 0; $i2 < $t2.length; $i2++) {
        const section = P($t2, $i2);
        section.a[section.o].Dirty(this.iReach);
      }
    }
  }

  SetColor(iValue) {
    this.colorR = Math.fround(Math.fround(iValue >>> 16 & 0xff) / 255);
    this.colorG = Math.fround(Math.fround((iValue & 0xffff) >> 8 & 0xff) / 255);
    this.colorB = Math.fround(Math.fround(iValue & 0xff) / 255);
    let min = $min(this.colorR, $min(this.colorG, this.colorB));
    this.colorV = $max($max(this.colorR, $max(this.colorG, this.colorB)), Math.fround(0.00100000005));
    this.colorL = Math.fround(Math.fround(min + this.colorV) / 2);
    this.colorR = $min(Math.fround(this.colorR / this.colorV), 1);
    this.colorG = $min(Math.fround(this.colorG / this.colorV), 1);
    this.colorB = $min(Math.fround(this.colorB / this.colorV), 1);
  }

  Invalidate(r) {
    let $t1;
    $t1 = this.sections;
    for (let $i1 = 0; $i1 < $t1.length; $i1++) {
      const section = P($t1, $i1);
      section.a[section.o].Invalidate(r.$clone());
    }
  }

  Update(Rec) {
    let $t1, $t2;
    let iNX = $.fixtoi$C4Fixed(this.pObj.fix_x);
    let iNY = $.fixtoi$C4Fixed(this.pObj.fix_y);
    let light_offset = this.pObj.GetPropertyArray(174 /*P_LightOffset*/);
    if (light_offset != null) {
      iNX = iNX + light_offset.GetItem(0).getInt() | 0;
      iNY = iNY + light_offset.GetItem(1).getInt() | 0;
    }
    if (iNX !== this.iX || iNY !== this.iY) {
      $t1 = this.sections;
      for (let $i2 = 0; $i2 < $t1.length; $i2++) {
        const section = P($t1, $i2);
        section.a[section.o].Prune(0);
      }
      this.iX = iNX;
      this.iY = iNY;
    }
    $t2 = this.sections;
    for (let $i1 = 0; $i1 < $t2.length; $i1++) {
      const section = P($t2, $i1);
      section.a[section.o].Update(Rec.$clone());
    }
  }

  Render(region, onScreen, call) {
    let $t1, $t2, $t3;
    let triangles = [];
    let clip = false;
    $t1 = this.sections;
    for (let $i1 = 0; $i1 < $t1.length; $i1++) {
      const section = P($t1, $i1);
      let sectionTriangles = section.a[section.o].CalculateTriangles(region);
      if (!(triangles.length === 0)) {
        ($t2 = P($rbegin(triangles).v, "clipRight"), $t2.a[$t2.o] = (($t2.a[$t2.o] ? 1 : 0) | (clip ? 1 : 0)) !== 0);
      }
      if (!(sectionTriangles.length === 0)) {
        ($t3 = P($begin(sectionTriangles).v, "clipLeft"), $t3.a[$t3.o] = (($t3.a[$t3.o] ? 1 : 0) | (clip ? 1 : 0)) !== 0);
      }
      clip = sectionTriangles.length === 0;
      seq_splice(triangles, $end(triangles), sectionTriangles);
    }
    this.CalculateFanMaxed(triangles);
    this.CalculateIntermediateFadeTriangles(triangles);
    const strategy = (onScreen != null ? P(this, "OnScreenStrategy") : P(this, "OffScreenStrategy"));
    if (strategy.a[strategy.o] == null) {
      if (onScreen != null) {
        strategy.a[strategy.o] = new $.C4FoWDrawWireframeStrategy().init(this, onScreen);
      } else {
        strategy.a[strategy.o] = new $.C4FoWDrawLightTextureStrategy().init(this);
      }
    }
    strategy.a[strategy.o].Begin(region);
    this.DrawFan(strategy.a[strategy.o], triangles);
    this.DrawFanMaxed(strategy.a[strategy.o], triangles);
    this.DrawFade(strategy.a[strategy.o], triangles);
    this.DrawIntermediateFadeTriangles(strategy.a[strategy.o], triangles);
    strategy.a[strategy.o].End(call);
  }

  IsVisibleForPlayer(player) {
    if (this.pObj == null || player == null) {
      return true;
    }
    return !($.Hostile(this.pObj.Owner, player.Number) !== 0);
  }

  CalculateFanMaxed(triangles) {
    for (const tri of triangles) {
      let dist = Math.fround(c$sqrt(this.GetSquaredDistanceTo(ftoi32(tri.fanLX), ftoi32(tri.fanLY))));
      if (dist <= Math.fround(this.getNormalSize())) {
        tri.nfanLX = tri.fanLX;
        tri.nfanLY = tri.fanLY;
      } else {
        let f = Math.fround(Math.fround(this.getNormalSize()) / dist);
        tri.nfanLX = Math.fround(Math.fround(f * tri.fanLX) + Math.fround(Math.fround(1 - f) * Math.fround(this.getX())));
        tri.nfanLY = Math.fround(Math.fround(f * tri.fanLY) + Math.fround(Math.fround(1 - f) * Math.fround(this.getY())));
      }
      dist = Math.fround(c$sqrt(this.GetSquaredDistanceTo(ftoi32(tri.fanRX), ftoi32(tri.fanRY))));
      if (dist <= Math.fround(this.getNormalSize())) {
        tri.nfanRX = tri.fanRX;
        tri.nfanRY = tri.fanRY;
      } else {
        let f = Math.fround(Math.fround(this.getNormalSize()) / dist);
        tri.nfanRX = Math.fround(Math.fround(f * tri.fanRX) + Math.fround(Math.fround(1 - f) * Math.fround(this.getX())));
        tri.nfanRY = Math.fround(Math.fround(f * tri.fanRY) + Math.fround(Math.fround(1 - f) * Math.fround(this.getY())));
      }
    }
  }

  CalculateIntermediateFadeTriangles(triangles) {
    for (let it = $begin(triangles), nextIt = $itcopy(it); !it.eq($end(triangles)); it.inc()) {
      nextIt.inc();
      if (nextIt.eq($end(triangles))) {
        nextIt = $begin(triangles).copy();
      }
      const tri = it.v;
      const nextTri = nextIt.v;
      if (tri.clipRight || nextTri.clipLeft) {
        continue;
      }
      let distFadeR = this.GetSquaredDistanceTo(ftoi32(tri.fadeRX), ftoi32(tri.fadeRY));
      let distNextFadeL = this.GetSquaredDistanceTo(ftoi32(nextTri.fadeLX), ftoi32(nextTri.fadeLY));
      let distFanR = this.GetSquaredDistanceTo(ftoi32(tri.fanRX), ftoi32(tri.fanRY));
      let distNextFanL = this.GetSquaredDistanceTo(ftoi32(nextTri.fanLX), ftoi32(nextTri.fanLY));
      tri.descending = distFanR > distNextFanL;
      if (tri.descending) {
        if (distFanR < distNextFadeL) {
          tri.fadeIX = nextTri.fadeLX;
          tri.fadeIY = nextTri.fadeLY;
        } else {
          tri.fadeIX = Math.fround(Math.fround(tri.fanRX + nextTri.fadeLX) / Math.fround(2));
          tri.fadeIY = Math.fround(Math.fround(tri.fanRY + nextTri.fadeLY) / Math.fround(2));
          this.ProjectPointOutward(P(tri, "fadeIX"), P(tri, "fadeIY"), Math.fround(c$sqrt(distFadeR)));
        }
      } else {
        if (distNextFanL < distFadeR) {
          tri.fadeIX = tri.fadeRX;
          tri.fadeIY = tri.fadeRY;
        } else {
          tri.fadeIX = Math.fround(Math.fround(tri.fadeRX + nextTri.fanLX) / Math.fround(2));
          tri.fadeIY = Math.fround(Math.fround(tri.fadeRY + nextTri.fanLY) / Math.fround(2));
          this.ProjectPointOutward(P(tri, "fadeIX"), P(tri, "fadeIY"), Math.fround(c$sqrt(distNextFadeL)));
        }
      }
    }
  }

  ProjectPointOutward(x, y, maxDistance) {
    let distanceDifference = Math.fround($min(maxDistance, Math.fround(this.getTotalReach())) / Math.fround(c$sqrt(Math.fround(Math.fround(Math.fround(x.a[x.o] - Math.fround(this.getX())) * Math.fround(x.a[x.o] - Math.fround(this.getX()))) + Math.fround(Math.fround(y.a[y.o] - Math.fround(this.getY())) * Math.fround(y.a[y.o] - Math.fround(this.getY())))))));
    x.a[x.o] = Math.fround(Math.fround(this.getX()) + Math.fround(distanceDifference * Math.fround(x.a[x.o] - Math.fround(this.getX()))));
    y.a[y.o] = Math.fround(Math.fround(this.getY()) + Math.fround(distanceDifference * Math.fround(y.a[y.o] - Math.fround(this.getY()))));
  }

  DrawFan(pen, triangles) {
    pen.BeginFan();
    if (!(triangles.length === 0)) {
      pen.DrawLightVertex(Math.fround(this.getX()), Math.fround(this.getY()));
    }
    for (let it = $begin(triangles), nextIt = $itcopy(it); !it.eq($end(triangles)); it.inc()) {
      nextIt.inc();
      if (nextIt.eq($end(triangles))) {
        nextIt = $begin(triangles).copy();
      }
      const tri = it.v;
      const nextTri = nextIt.v;
      pen.DrawLightVertex(tri.nfanLX, tri.nfanLY);
      if (nextIt.eq($begin(triangles)) || nextTri.nfanLX !== tri.nfanRX || nextTri.nfanLY !== tri.nfanRY) {
        pen.DrawLightVertex(tri.nfanRX, tri.nfanRY);
      }
    }
    pen.EndFan();
  }

  DrawFanMaxed(pen, triangles) {
    pen.BeginFanMaxed();
    for (let it = $begin(triangles), nextIt = $itcopy(it); !it.eq($end(triangles)); it.inc()) {
      nextIt.inc();
      if (nextIt.eq($end(triangles))) {
        nextIt = $begin(triangles).copy();
      }
      const tri = it.v;
      const nextTri = nextIt.v;
      if (tri.nfanLX !== tri.nfanRX || tri.nfanLY !== tri.nfanRY) {
        pen.DrawLightVertex(tri.nfanLX, tri.nfanLY);
        pen.DrawLightVertex(tri.nfanRX, tri.nfanRY);
        pen.DrawLightVertex(tri.fanRX, tri.fanRY);
        pen.DrawLightVertex(tri.fanLX, tri.fanLY);
      }
      if (tri.nfanRX !== nextTri.nfanLX || tri.nfanRY !== nextTri.nfanLY) {
        pen.DrawLightVertex(tri.nfanRX, tri.nfanRY);
        pen.DrawLightVertex(nextTri.nfanLX, nextTri.nfanLY);
        pen.DrawLightVertex(nextTri.fanLX, nextTri.fanLY);
        pen.DrawLightVertex(tri.fanRX, tri.fanRY);
      }
    }
    pen.EndFanMaxed();
  }

  DrawFade(pen, triangles) {
    pen.BeginFade();
    for (const tri of triangles) {
      if (tri.fanLX === tri.fanRX && tri.fanLY === tri.fanRY) {
        continue;
      }
      pen.DrawLightVertex(tri.fanLX, tri.fanLY);
      pen.DrawLightVertex(tri.fanRX, tri.fanRY);
      pen.DrawDarkVertex(tri.fadeRX, tri.fadeRY);
      pen.DrawDarkVertex(tri.fadeLX, tri.fadeLY);
    }
    pen.EndFade();
  }

  DrawIntermediateFadeTriangles(pen, triangles) {
    for (let it = $begin(triangles), nextIt = $itcopy(it); !it.eq($end(triangles)); it.inc()) {
      nextIt.inc();
      if (nextIt.eq($end(triangles))) {
        nextIt = $begin(triangles).copy();
      }
      const tri = it.v;
      const nextTri = nextIt.v;
      if (tri.clipRight || nextTri.clipLeft) {
        continue;
      }
      pen.BeginIntermediateFade();
      if (tri.descending) {
        pen.DrawLightVertex(tri.fanRX, tri.fanRY);
        pen.DrawLightVertex(nextTri.fanLX, nextTri.fanLY);
        pen.DrawDarkVertex(nextTri.fadeLX, nextTri.fadeLY);
        if (tri.fadeIY !== nextTri.fadeLY || tri.fadeIX !== nextTri.fadeLX) {
          pen.DrawDarkVertex(tri.fadeIX, tri.fadeIY);
        }
        pen.DrawDarkVertex(tri.fadeRX, tri.fadeRY);
      } else {
        pen.DrawLightVertex(nextTri.fanLX, nextTri.fanLY);
        pen.DrawDarkVertex(nextTri.fadeLX, nextTri.fadeLY);
        if (tri.fadeIY !== tri.fadeRY || tri.fadeIX !== tri.fadeRX) {
          pen.DrawDarkVertex(tri.fadeIX, tri.fadeIY);
        }
        pen.DrawDarkVertex(tri.fadeRX, tri.fadeRY);
        pen.DrawLightVertex(tri.fanRX, tri.fanRY);
      }
      pen.EndIntermediateFade();
    }
  }

  GetSquaredDistanceTo(x, y) {
    return Math.fround(Math.imul(x - this.getX() | 0, x - this.getX() | 0) + Math.imul(y - this.getY() | 0, y - this.getY() | 0) | 0);
  }

  $clone() { return new C4FoWLight().$assign(this); }
  $assign(o) {
    this.iX = o.iX;
    this.iY = o.iY;
    this.iReach = o.iReach;
    this.iFadeout = o.iFadeout;
    this.iSize = o.iSize;
    this.gBright = o.gBright;
    this.colorR = o.colorR;
    this.colorG = o.colorG;
    this.colorB = o.colorB;
    this.colorV = o.colorV;
    this.colorL = o.colorL;
    this.pNext = o.pNext;
    this.pObj = o.pObj;
    this.sections = o.sections.slice();
    this.OnScreenStrategy = o.OnScreenStrategy;
    this.OffScreenStrategy = o.OffScreenStrategy;
    return this;
  }
}

export function $init(): void {
}

Object.assign($, { C4FoWLight });
