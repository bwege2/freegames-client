// @ts-nocheck
// OpenClonk 36de799: src/landscape/fow/C4FoWLightSection.cpp, src/landscape/fow/C4FoWLightSection.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { ftoi32 } from '../../../rt/int.ts';
import { c$fabs, c$sqrt } from '../../../rt/libc.ts';
import { P, S } from '../../../rt/ptr.ts';
import { $ } from '../../../rt/registry.ts';
import { $begin, $delete, $end, $itcopy, $max, $min, $vpush, seq_erase, seq_insert } from '../../../rt/std.ts';

export class C4FoWLightSection {
  pLight = null;
  iRot = 0;
  a = 0;
  b = 0;
  c = 0;
  d = 0;
  ra = 0;
  rb = 0;
  rc = 0;
  rd = 0;
  pBeams = null;

  init(pLight, r) {
    this.pLight = pLight;
    this.iRot = r;
    this.iRot = r % 360;
    switch (this.iRot % 360) {
      default:
        0;
      case 0:
        this.a = 1;
        this.b = 0;
        this.c = 0;
        this.d = 1;
        this.ra = 1;
        this.rb = 0;
        this.rc = 0;
        this.rd = 1;
        break;
      case 90:
        this.a = 0;
        this.b = 1;
        this.c = -1;
        this.d = 0;
        this.ra = 0;
        this.rb = -1;
        this.rc = 1;
        this.rd = 0;
        break;
      case 180:
        this.a = -1;
        this.b = 0;
        this.c = 0;
        this.d = -1;
        this.ra = -1;
        this.rb = 0;
        this.rc = 0;
        this.rd = -1;
        break;
      case 270:
        this.a = 0;
        this.b = -1;
        this.c = 1;
        this.d = 0;
        this.ra = 0;
        this.rb = 1;
        this.rc = -1;
        this.rd = 0;
        break;
    }
    this.pBeams = new $.C4FoWBeam().init(-1, 1, 1, 1);
    return this;
  }

  $dtor() {
    C4FoWLightSection.prototype.ClearBeams.call(this);
  }

  Invalidate(r) {
    0;
    let ly = this.RectLeftMostY(r);
    let lx = this.RectLeftMostX(r);
    let ry = this.RectRightMostY(r);
    let rx = this.RectRightMostX(r);
    let lastBeam = this.FindBeamLeftOf(lx, ly);
    let beam = lastBeam != null ? lastBeam.getNext() : this.pBeams;
    while (beam != null && !beam.isLeft(rx, ry)) {
      if (beam.getLeftEndY() > r.y || beam.getRightEndY() > r.y) {
        beam.Dirty(r.y);
      }
      if (lastBeam != null && lastBeam.isDirty() && beam.isDirty()) {
        lastBeam.MergeDirty();
        beam = lastBeam.getNext();
      } else {
        lastBeam = beam;
        beam = beam.getNext();
      }
    }
    if (lastBeam != null && beam != null && lastBeam.isDirty() && beam.isDirty()) {
      lastBeam.MergeDirty();
    }
  }

  Update(RectIn) {
    let Rect = this.rtransRect(RectIn.$clone());
    let Bounds = this.rtransRect(new $.C4Rect().init$i32$i32$i32$i32(0, 0, $.Landscape.GetWidth(), $.Landscape.GetHeight()));
    if (Rect.y > this.pLight.getTotalReach()) {
      return;
    }
    if ((Rect.y + Rect.Hgt | 0) < 0) {
      return;
    }
    let ly = this.RectLeftMostY(Rect);
    let lx = this.RectLeftMostX(Rect);
    let ry = this.RectRightMostY(Rect);
    let rx = this.RectRightMostX(Rect);
    let startBeam = this.FindBeamLeftOf(lx, ly);
    while (true) {
      let nextBeam = startBeam != null ? startBeam.getNext() : this.pBeams;
      if (!(nextBeam != null)) break;
      if (nextBeam.isDirty()) {
        break;
      }
      startBeam = nextBeam;
    }
    let beam = startBeam != null ? startBeam.getNext() : this.pBeams;
    let endBeam = null;
    let startY = Rect.GetBottom$v$c();
    while (beam != null && !beam.isLeft(rx, ry)) {
      if (beam.isDirty() && beam.getLeftEndY() <= (Rect.y + Rect.Hgt | 0)) {
        endBeam = beam;
        startY = $min(startY, beam.getLeftEndY());
      }
      beam = beam.getNext();
    }
    if (endBeam == null) {
      return;
    }
    if (endBeam.isRight(rx, ry)) {
      rx = endBeam.getRightEndX() + 1 | 0;
      ry = endBeam.getRightEndY();
    }
    let endY = $min(Rect.GetBottom$v$c(), this.pLight.getReach());
    let y = 0;
    for (y = $max(0, startY); y < endY; y = y + 1 | 0) {
      let ignoreX = 0;
      if (y < this.pLight.getSize()) {
        ignoreX = ftoi32(c$sqrt(Math.imul(this.pLight.getSize(), this.pLight.getSize()) - Math.imul(y, y) | 0));
      }
      let lastBeam = startBeam;
      let dirty = 0;
      for (let beam$2 = startBeam != null ? startBeam.getNext() : this.pBeams; beam$2 != null; lastBeam = beam$2, beam$2 = beam$2.getNext()) {
        0;
        if (!beam$2.isDirty() || y < beam$2.getLeftEndY()) {
          continue;
        }
        if (beam$2.isRight(lx, ly)) {
          continue;
        }
        if (beam$2.isLeft(rx, ry)) {
          break;
        }
        dirty = dirty + 1 | 0;
        beam$2.Dirty(y + 1 | 0);
        let xl = $max(beam$2.getLeftX(y), Bounds.x);
        let xr = $min(beam$2.getRightX(y), (Bounds.x + Bounds.Wdt | 0) - 1 | 0);
        for (let x = xl; x <= xr; x = x + 1 | 0) {
          if ((Math.abs(x) | 0) < ignoreX) {
            continue;
          }
          if (!$.Landscape._FastSolidCheck(this.transX$i32$i32(x, y), this.transY$i32$i32(x, y))) {
            if (this.a === 1) {
              x = this.rtransX($.C4Landscape.FastSolidCheckNextX(this.transX$i32$i32(x, y)) - 1 | 0, 0);
            }
            continue;
          }
          if (!$.GBackSolid(this.transX$i32$i32(x, y), this.transY$i32$i32(x, y))) {
            continue;
          }
          let x1 = x - 1 | 0;
          let x2 = x + 1 | 0;
          let splitLeft = !beam$2.isLeft(x1, y);
          let splitRight = !beam$2.isRight(x2, y);
          if (!splitLeft && !splitRight && lastBeam != null && beam$2.getNext() != null) {
            if (lastBeam.EliminateRight(x, y)) {
              beam$2 = lastBeam;
              break;
            }
          }
          if (!splitLeft && splitRight && lastBeam != null) {
            if (lastBeam.MergeRight(x2, y)) {
              beam$2.SetLeft(x2, y);
              0;
              continue;
            }
          }
          if (splitLeft && !splitRight && beam$2.getNext() != null) {
            if (beam$2.getNext().MergeLeft(x1, y)) {
              beam$2.SetRight(x1, y);
              break;
            }
          }
          if (splitLeft) {
            lastBeam = beam$2;
            beam$2 = lastBeam.Split(x1, y);
            0;
          }
          if (splitRight) {
            lastBeam = beam$2;
            beam$2 = lastBeam.Split(x2, y);
            0;
            lastBeam.Clean(y);
            0;
          } else {
            beam$2.Clean(y);
            break;
          }
        }
      }
      if (dirty === 0) {
        break;
      }
    }
    if (y >= this.pLight.getReach()) {
      for (let beam$2 = startBeam != null ? startBeam.getNext() : this.pBeams; beam$2 != null; beam$2 = beam$2.getNext()) {
        if (beam$2.isDirty() && beam$2.getLeftEndY() > this.pLight.getReach()) {
          beam$2.Clean(this.pLight.getReach());
        }
      }
    }
  }

  CalculateTriangles(region) {
    const startBeam = [null];
    const endBeam = [null];
    let beamCount = this.FindBeamsClipped(this.rtransRect(region.getRegion().$clone()), P(startBeam, 0), P(endBeam, 0));
    let result = [];
    const crossX = [0];
    const crossY = [0];
    if (beamCount === 0) {
      return result;
    }
    let isStartClipped = startBeam[0] !== this.pBeams;
    let isEndClipped = !(endBeam[0] == null);
    let beam = startBeam[0];
    for (let i = 0; i < beamCount; i = i + 1 | 0, beam = beam.getNext()) {
      let tri = new $.C4FoWBeamTriangle();
      tri.fanLX = beam.getLeftEndXf();
      tri.fanLY = Math.fround(beam.getLeftEndY());
      tri.fanRX = beam.getRightEndXf();
      tri.fanRY = Math.fround(beam.getRightEndY());
      if (i === 0 && isStartClipped) {
        tri.clipLeft = true;
      }
      if (i === (beamCount - 1 | 0) && isEndClipped) {
        tri.clipRight = true;
      }
      if (tri.fanLX !== tri.fanRX || tri.fanLY !== tri.fanRY) {
        $vpush(result, tri.$clone());
      }
    }
    if (result.length === 0) {
      return result;
    }
    let scanLevel = Math.fround(0);
    for (let step = 0; step < 100000; step = step + 1 | 0) {
      let bestLevel = Math.fround(3.40282347e+38);
      for (let it = $begin(result), nextIt = null; !it.eq($end(result).dec()); it.inc()) {
        nextIt = it.copy();
        nextIt.inc();
        let level = $min(it.v.fanRY, nextIt.v.fanLY);
        if (level <= scanLevel || level >= bestLevel) {
          continue;
        }
        bestLevel = level;
      }
      if (bestLevel === Math.fround(3.40282347e+38)) {
        break;
      }
      scanLevel = bestLevel;
      for (let it = $begin(result), nextIt = null; !it.eq($end(result).dec()); it = nextIt.copy()) {
        nextIt = it.copy();
        nextIt.inc();
        let tri = it.v.$clone();
        let nextTri = nextIt.v.$clone();
        let level = $min(tri.fanRY, nextTri.fanLY);
        if (level !== bestLevel) {
          continue;
        }
        const lightLX = [0];
        const lightLY = [0];
        const lightRX = [0];
        const lightRY = [0];
        this.LightBallLeftMostPoint(tri.fanRX, tri.fanRY, P(lightLX, 0), P(lightLY, 0));
        this.LightBallRightMostPoint(nextTri.fanLX, nextTri.fanLY, P(lightRX, 0), P(lightRY, 0));
        let descendCollision = false;
        let ascendDescendDelta = Math.fround(0.100000001);
        if (tri.fanRY > nextTri.fanLY) {
          if (Math.fround(Math.fround(tri.fanRY - tri.fanLY) * Math.fround(nextTri.fanLX - lightRX[0])) >= Math.fround(Math.fround(tri.fanRX - tri.fanLX) * Math.fround(nextTri.fanLY - lightRY[0]))) {
            0;
            tri.fanLX = tri.fanRX;
            tri.fanLY = tri.fanRY;
            it.v.$assign(tri);
          }
          let threshold = 1;
          let fanWidth = Math.fround(Math.fround(c$fabs(Math.fround(tri.fanRX - tri.fanLX))) + Math.fround(c$fabs(Math.fround(tri.fanRY - tri.fanLY))));
          threshold = Math.fround(threshold - Math.fround(ascendDescendDelta / fanWidth));
          let fanRXp = tri.fanRX;
          if (tri.fanRX === tri.fanLX && tri.fanRY === tri.fanLY) {
            fanRXp = Math.fround(fanRXp + 1);
            threshold = Math.fround(0);
          }
          const b = [0];
          let f = find_cross(lightRX[0], lightRY[0], nextTri.fanLX, nextTri.fanLY, tri.fanLX, tri.fanLY, fanRXp, tri.fanRY, P(crossX, 0), P(crossY, 0), P(b, 0));
          0;
          f;
          if (b[0] >= threshold) {
            if (it.eq($begin(result))) {
              continue;
            }
            it = (nextIt = seq_erase(result, $itcopy(it)).copy()).copy();
            tri.$assign(it.dec().v);
            if (tri.fanRY > nextTri.fanLY) {
              nextIt = it.copy();
              continue;
            }
            descendCollision = true;
            this.LightBallLeftMostPoint(tri.fanLX, tri.fanLY, P(lightLX, 0), P(lightLY, 0));
          } else if (b[0] < 0) {
            descendCollision = true;
          } else {
            tri.fanRX = crossX[0];
            tri.fanRY = crossY[0];
            0;
            it.v.$assign(tri);
            continue;
          }
        } else if (tri.fanRY < nextTri.fanLY) {
          if (Math.fround(Math.fround(nextTri.fanRY - nextTri.fanLY) * Math.fround(tri.fanRX - lightLX[0])) >= Math.fround(Math.fround(nextTri.fanRX - nextTri.fanLX) * Math.fround(tri.fanRY - lightLY[0]))) {
            0;
            nextTri.fanRX = nextTri.fanLX;
            nextTri.fanRY = nextTri.fanLY;
            nextIt.v.$assign(nextTri);
          }
          let fanRXp = nextTri.fanRX;
          let threshold = 0;
          let fanWidth = Math.fround(Math.fround(c$fabs(Math.fround(nextTri.fanRX - nextTri.fanLX))) + Math.fround(c$fabs(Math.fround(nextTri.fanRY - nextTri.fanLY))));
          threshold = Math.fround(threshold + Math.fround(ascendDescendDelta / fanWidth));
          if (nextTri.fanRX === nextTri.fanLX && nextTri.fanRY === nextTri.fanLY) {
            fanRXp = Math.fround(fanRXp + 1);
          }
          const b = [0];
          let f = find_cross(lightLX[0], lightLY[0], tri.fanRX, tri.fanRY, nextTri.fanLX, nextTri.fanLY, fanRXp, nextTri.fanRY, P(crossX, 0), P(crossY, 0), P(b, 0));
          0;
          f;
          if (b[0] <= threshold) {
            if (nextIt.eq($end(result).dec())) {
              continue;
            }
            nextIt = seq_erase(result, $itcopy(nextIt)).copy();
            nextTri.$assign(nextIt.v);
            if (nextTri.fanLY > tri.fanRY) {
              nextIt = it.copy();
              continue;
            }
            descendCollision = true;
            this.LightBallRightMostPoint(nextTri.fanLX, nextTri.fanLY, P(lightRX, 0), P(lightRY, 0));
          } else if (b[0] > 1) {
            descendCollision = true;
          } else {
            nextTri.fanLX = crossX[0];
            nextTri.fanLY = crossY[0];
            0;
            nextIt.v.$assign(nextTri);
            continue;
          }
        } else {
          if (Math.fround(nextTri.fanLX - tri.fanRX) > 0.5) {
            descendCollision = true;
          } else {
            continue;
          }
        }
        0;
        descendCollision;
        let f = find_cross(lightLX[0], lightLY[0], tri.fanRX, tri.fanRY, lightRX[0], lightRY[0], nextTri.fanLX, nextTri.fanLY, P(crossX, 0), P(crossY, 0));
        0;
        f;
        let descendEta = Math.fround(3);
        if (crossY[0] <= Math.fround(tri.fanRY + descendEta) || crossY[0] <= Math.fround(nextTri.fanLY + descendEta)) {
          continue;
        }
        0;
        let newTriangle = new $.C4FoWBeamTriangle();
        newTriangle.fanLX = crossX[0];
        newTriangle.fanLY = crossY[0];
        newTriangle.fanRX = crossX[0];
        newTriangle.fanRY = crossY[0];
        nextIt = seq_insert(result, $itcopy(nextIt), newTriangle.$clone()).copy();
        nextIt.inc();
      }
    }
    for (const tri of result) {
      const lightLX = [0];
      const lightLY = [0];
      const lightRX = [0];
      const lightRY = [0];
      this.LightBallLeftMostPoint(tri.fanLX, tri.fanLY, P(lightLX, 0), P(lightLY, 0));
      this.LightBallRightMostPoint(tri.fanRX, tri.fanRY, P(lightRX, 0), P(lightRY, 0));
      let dx = Math.fround(tri.fanLX - lightLX[0]);
      let dy = Math.fround(tri.fanLY - lightLY[0]);
      let d = Math.fround(Math.fround(this.pLight.getFadeout()) / Math.fround(c$sqrt(Math.fround(Math.fround(dx * dx) + Math.fround(dy * dy)))));
      tri.fadeLX = Math.fround(tri.fanLX + Math.fround(d * dx));
      tri.fadeLY = Math.fround(tri.fanLY + Math.fround(d * dy));
      dx = Math.fround(tri.fanRX - lightRX[0]);
      dy = Math.fround(tri.fanRY - lightRY[0]);
      d = Math.fround(Math.fround(this.pLight.getFadeout()) / Math.fround(c$sqrt(Math.fround(Math.fround(dx * dx) + Math.fround(dy * dy)))));
      tri.fadeRX = Math.fround(tri.fanRX + Math.fround(d * dx));
      tri.fadeRY = Math.fround(tri.fanRY + Math.fround(d * dy));
      let fadeCrossEta = 0.01;
      if (Math.fround(Math.fround(tri.fadeRX - lightRX[0]) / Math.fround(tri.fadeRY - lightRY[0])) < Math.fround(Math.fround(tri.fadeLX - lightRX[0]) / Math.fround(tri.fadeLY - lightRY[0])) + fadeCrossEta) {
        tri.fadeLX = tri.fadeRX = Math.fround(Math.fround(tri.fadeLX + tri.fadeRX) / Math.fround(2));
        tri.fadeLY = tri.fadeRY = Math.fround(Math.fround(tri.fadeLY + tri.fadeRY) / Math.fround(2));
      }
    }
    this.transTriangles(result);
    return result;
  }

  Prune(reach) {
    if (reach === 0) {
      this.ClearBeams();
      this.pBeams = new $.C4FoWBeam().init(-1, 1, 1, 1);
      return;
    }
    for (let beam = this.pBeams; beam != null; beam = beam.getNext()) {
      beam.Prune(reach);
    }
  }

  Dirty(reach) {
    for (let beam = this.pBeams; beam != null; beam = beam.getNext()) {
      if (beam.getLeftEndY() >= reach || beam.getRightEndY() >= reach) {
        beam.Dirty($min(beam.getLeftEndY(), beam.getRightEndY()));
      }
    }
  }

  ClearBeams() {
    while (true) {
      let beam = this.pBeams;
      if (!(beam != null)) break;
      this.pBeams = beam.getNext();
      $delete(beam);
    }
  }

  rtransDX(dx, dy) {
    return Math.imul(this.ra, dx) + Math.imul(this.rb, dy) | 0;
  }

  rtransDY(dx, dy) {
    return Math.imul(this.rc, dx) + Math.imul(this.rd, dy) | 0;
  }

  rtransX(x, y) {
    return this.rtransDX(x - this.pLight.getX() | 0, y - this.pLight.getY() | 0);
  }

  rtransY(x, y) {
    return this.rtransDY(x - this.pLight.getX() | 0, y - this.pLight.getY() | 0);
  }

  transTriangles(triangles) {
    for (const tri of triangles) {
      let x = 0;
      let y = 0;
      x = tri.fanRX, y = tri.fanRY;
      tri.fanRX = this.transX$f32$f32(x, y);
      tri.fanRY = this.transY$f32$f32(x, y);
      x = tri.fanLX, y = tri.fanLY;
      tri.fanLX = this.transX$f32$f32(x, y);
      tri.fanLY = this.transY$f32$f32(x, y);
      x = tri.fadeRX, y = tri.fadeRY;
      tri.fadeRX = this.transX$f32$f32(x, y);
      tri.fadeRY = this.transY$f32$f32(x, y);
      x = tri.fadeLX, y = tri.fadeLY;
      tri.fadeLX = this.transX$f32$f32(x, y);
      tri.fadeLY = this.transY$f32$f32(x, y);
    }
  }

  rtransRect(r) {
    let Rect = new $.C4Rect().init$i32$i32$i32$i32(this.rtransX(r.x, r.y), this.rtransY(r.x, r.y), this.rtransDX(r.Wdt, r.Hgt), this.rtransDY(r.Wdt, r.Hgt));
    Rect.Normalize();
    return Rect;
  }

  isConsistent() {
    return (Math.imul(this.a, this.c) + Math.imul(this.b, this.d) | 0) === 1 && (Math.imul(this.ra, this.rc) + Math.imul(this.rb, this.rd) | 0) === 1 && (Math.imul(this.a, this.ra) + Math.imul(this.b, this.rc) | 0) === 1 && (Math.imul(this.a, this.rb) + Math.imul(this.b, this.rd) | 0) === 0 && (Math.imul(this.c, this.ra) + Math.imul(this.d, this.rc) | 0) === 0 && (Math.imul(this.c, this.rb) + Math.imul(this.d, this.rd) | 0) === 1;
  }

  RectLeftMostX(r) {
    return r.x;
  }

  RectLeftMostY(r) {
    return $max(0, r.x >= 0 ? r.y + r.Hgt | 0 : r.y);
  }

  RectRightMostX(r) {
    return r.x + r.Wdt | 0;
  }

  RectRightMostY(r) {
    return $max(0, (r.x + r.Wdt | 0) <= 0 ? r.y + r.Hgt | 0 : r.y);
  }

  LightBallExtremePoint(x, y, dir, lightX, lightY) {
    let d = Math.fround(c$sqrt(Math.fround(Math.fround(x * x) + Math.fround(y * y))));
    let s = $min(Math.fround(this.pLight.getSize()), Math.fround(d / 5));
    lightX.a[lightX.o] = Math.fround(Math.fround(Math.fround(dir * y) * s) / d);
    lightY.a[lightY.o] = Math.fround(Math.fround(Math.fround(dir * -x) * s) / d);
  }

  LightBallRightMostPoint(x, y, lightX, lightY) {
    this.LightBallExtremePoint(x, y, 1, lightX, lightY);
  }

  LightBallLeftMostPoint(x, y, lightX, lightY) {
    this.LightBallExtremePoint(x, y, -1, lightX, lightY);
  }

  FindBeamLeftOf(x, y) {
    y = $max(y, 0);
    if (this.pBeams == null || !this.pBeams.isRight(x, y)) {
      return null;
    }
    let beam = this.pBeams;
    while (beam.getNext() != null && beam.getNext().isRight(x, y)) {
      beam = beam.getNext();
    }
    return beam;
  }

  FindBeamsClipped(rect, firstBeam, endBeam) {
    if ((rect.y + rect.Hgt | 0) < 0) {
      return 0;
    }
    let ly = this.RectLeftMostY(rect);
    let lx = this.RectLeftMostX(rect);
    let ry = this.RectRightMostY(rect);
    let rx = this.RectRightMostX(rect);
    let pPrev = this.FindBeamLeftOf(lx, ly);
    firstBeam.a[firstBeam.o] = pPrev != null ? pPrev.getNext() : this.pBeams;
    let beam = firstBeam.a[firstBeam.o];
    let beamCount = 0;
    while (beam != null && !beam.isLeft(rx, ry)) {
      beam = beam.getNext();
      beamCount = beamCount + 1 | 0;
    }
    endBeam.a[endBeam.o] = beam;
    return beamCount;
  }

  CompileFunc(pComp) {
    let $t1;
    pComp.Value$StdNamingAdapt$i32($.mkNamingAdapt$ri32$pi8(P(this, "iRot"), S("iRot")));
    pComp.Value$StdNamingAdapt$i32($.mkNamingAdapt$ri32$pi8(P(this, "a"), S("a")));
    pComp.Value$StdNamingAdapt$i32($.mkNamingAdapt$ri32$pi8(P(this, "b"), S("b")));
    pComp.Value$StdNamingAdapt$i32($.mkNamingAdapt$ri32$pi8(P(this, "c"), S("c")));
    pComp.Value$StdNamingAdapt$i32($.mkNamingAdapt$ri32$pi8(P(this, "d"), S("d")));
    pComp.Value$StdNamingAdapt$i32($.mkNamingAdapt$ri32$pi8(P(this, "ra"), S("ra")));
    pComp.Value$StdNamingAdapt$i32($.mkNamingAdapt$ri32$pi8(P(this, "rb"), S("rb")));
    pComp.Value$StdNamingAdapt$i32($.mkNamingAdapt$ri32$pi8(P(this, "rc"), S("rc")));
    pComp.Value$StdNamingAdapt$i32($.mkNamingAdapt$ri32$pi8(P(this, "rd"), S("rd")));
    if (pComp.isSerializer()) {
      for (let beam = this.pBeams; beam != null; beam = beam.getNext()) {
        pComp.Value$StdNamingAdapt$C4FoWBeam($.mkNamingAdapt$rC4FoWBeam$pi8(beam, S("Beam")));
      }
    } else {
      this.ClearBeams();
      const beam_count = [0];
      pComp.Value$StdNamingCountAdapt$i32($.mkNamingCountAdapt$ri32$pi8(P(beam_count, 0), S("Beam")));
      let last_beam = null;
      for (let i = 0; i < beam_count[0]; i = i + 1 | 0) {
        let beam = new $.C4FoWBeam().init(0, 0, 0, 0);
        pComp.Value$StdNamingAdapt$C4FoWBeam($.mkNamingAdapt$rC4FoWBeam$pi8(beam, S("Beam")));
        let new_beam = ($t1 = beam, beam = null, $t1);
        if (last_beam == null) {
          this.pBeams = new_beam;
        } else {
          last_beam.setNext(new_beam);
        }
        last_beam = new_beam;
      }
    }
  }

  transDX$i32$i32(dx, dy) {
    return Math.imul(this.a, dx) + Math.imul(this.b, dy) | 0;
  }

  transDX$f32$f32(dx, dy) {
    return Math.fround(Math.fround(Math.fround(this.a) * dx) + Math.fround(Math.fround(this.b) * dy));
  }

  transDY$i32$i32(dx, dy) {
    return Math.imul(this.c, dx) + Math.imul(this.d, dy) | 0;
  }

  transDY$f32$f32(dx, dy) {
    return Math.fround(Math.fround(Math.fround(this.c) * dx) + Math.fround(Math.fround(this.d) * dy));
  }

  transX$i32$i32(x, y) {
    return this.transDX$i32$i32(x, y) + this.pLight.getX() | 0;
  }

  transX$f32$f32(x, y) {
    return Math.fround(this.transDX$f32$f32(x, y) + Math.fround(this.pLight.getX()));
  }

  transY$i32$i32(x, y) {
    return this.transDY$i32$i32(x, y) + this.pLight.getY() | 0;
  }

  transY$f32$f32(x, y) {
    return Math.fround(this.transDY$f32$f32(x, y) + Math.fround(this.pLight.getY()));
  }

  $clone() { return new C4FoWLightSection().$assign(this); }
  $assign(o) {
    this.pLight = o.pLight;
    this.iRot = o.iRot;
    this.a = o.a;
    this.b = o.b;
    this.c = o.c;
    this.d = o.d;
    this.ra = o.ra;
    this.rb = o.rb;
    this.rc = o.rc;
    this.rd = o.rd;
    this.pBeams = o.pBeams;
    return this;
  }
}

function find_cross(x1, y1, x2, y2, x3, y3, x4, y4, px, py, pb = null) {
  let d = Math.fround(Math.fround(Math.fround(x3 - x4) * Math.fround(y1 - y2)) - Math.fround(Math.fround(y3 - y4) * Math.fround(x1 - x2)));
  if (d === Math.fround(0)) {
    return false;
  }
  let b = Math.fround(Math.fround(Math.fround(Math.fround(y4 - y2) * Math.fround(x1 - x2)) - Math.fround(Math.fround(x4 - x2) * Math.fround(y1 - y2))) / d);
  px.a[px.o] = Math.fround(Math.fround(b * x3) + Math.fround(Math.fround(Math.fround(1) - b) * x4));
  py.a[py.o] = Math.fround(Math.fround(b * y3) + Math.fround(Math.fround(Math.fround(1) - b) * y4));
  if (pb != null) {
    pb.a[pb.o] = b;
  }
  return true;
}

export function $init(): void {
}

Object.assign($, { C4FoWLightSection, find_cross });
