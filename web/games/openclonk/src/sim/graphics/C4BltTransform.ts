// @ts-nocheck
// OpenClonk 36de799: src/graphics/C4BltTransform.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { c$cosf, c$sinf } from '../../rt/libc.ts';
import { $ } from '../../rt/registry.ts';

export class C4BltTransform {
  mat = new Float32Array(9);

  Set(fA, fB, fC, fD, fE, fF, fG, fH, fI) {
    this.mat[0] = fA;
    this.mat[1] = fB;
    this.mat[2] = fC;
    this.mat[3] = fD;
    this.mat[4] = fE;
    this.mat[5] = fF;
    this.mat[6] = fG;
    this.mat[7] = fH;
    this.mat[8] = fI;
  }

  SetRotate(iAngle, fOffX, fOffY) {
    let fAngle = Math.fround(iAngle * -Math.fround(0.0174532924));
    let fsin = c$sinf(fAngle);
    let fcos = c$cosf(fAngle);
    this.mat[0] = fcos;
    this.mat[1] = fsin;
    this.mat[2] = Math.fround(Math.fround(Math.fround(Math.fround(1) - fcos) * fOffX) - Math.fround(fsin * fOffY));
    this.mat[3] = -fsin;
    this.mat[4] = fcos;
    this.mat[5] = Math.fround(Math.fround(Math.fround(Math.fround(1) - fcos) * fOffY) + Math.fround(fsin * fOffX));
    this.mat[6] = Math.fround(0);
    this.mat[7] = Math.fround(0);
    this.mat[8] = Math.fround(1);
  }

  SetAsInv(r) {
    let det = Math.fround(Math.fround(Math.fround(Math.fround(Math.fround(Math.fround(Math.fround(r.mat[0] * r.mat[4]) * r.mat[8]) + Math.fround(Math.fround(r.mat[1] * r.mat[5]) * r.mat[6])) + Math.fround(Math.fround(r.mat[2] * r.mat[3]) * r.mat[7])) - Math.fround(Math.fround(r.mat[2] * r.mat[4]) * r.mat[6])) - Math.fround(Math.fround(r.mat[0] * r.mat[5]) * r.mat[7])) - Math.fround(Math.fround(r.mat[1] * r.mat[3]) * r.mat[8]));
    if (det === 0) {
      C4BltTransform.prototype.Set.call(this, Math.fround(1), Math.fround(0), Math.fround(0), Math.fround(0), Math.fround(1), Math.fround(0), Math.fround(0), Math.fround(0), Math.fround(1));
      return false;
    }
    this.mat[0] = Math.fround(Math.fround(Math.fround(r.mat[4] * r.mat[8]) - Math.fround(r.mat[5] * r.mat[7])) / det);
    this.mat[1] = Math.fround(Math.fround(Math.fround(r.mat[2] * r.mat[7]) - Math.fround(r.mat[1] * r.mat[8])) / det);
    this.mat[2] = Math.fround(Math.fround(Math.fround(r.mat[1] * r.mat[5]) - Math.fround(r.mat[2] * r.mat[4])) / det);
    this.mat[3] = Math.fround(Math.fround(Math.fround(r.mat[5] * r.mat[6]) - Math.fround(r.mat[3] * r.mat[8])) / det);
    this.mat[4] = Math.fround(Math.fround(Math.fround(r.mat[0] * r.mat[8]) - Math.fround(r.mat[2] * r.mat[6])) / det);
    this.mat[5] = Math.fround(Math.fround(Math.fround(r.mat[2] * r.mat[3]) - Math.fround(r.mat[0] * r.mat[5])) / det);
    this.mat[6] = Math.fround(Math.fround(Math.fround(r.mat[3] * r.mat[7]) - Math.fround(r.mat[4] * r.mat[6])) / det);
    this.mat[7] = Math.fround(Math.fround(Math.fround(r.mat[1] * r.mat[6]) - Math.fround(r.mat[0] * r.mat[7])) / det);
    this.mat[8] = Math.fround(Math.fround(Math.fround(r.mat[0] * r.mat[4]) - Math.fround(r.mat[1] * r.mat[3])) / det);
    return true;
  }

  Rotate(Angle, fOffX, fOffY) {
    let rot = new C4BltTransform();
    rot.SetRotate(Angle, fOffX, fOffY);
    this.op_mulAssign(rot);
  }

  SetMoveScale(dx, dy, sx, sy) {
    this.mat[0] = sx;
    this.mat[1] = Math.fround(0);
    this.mat[2] = dx;
    this.mat[3] = Math.fround(0);
    this.mat[4] = sy;
    this.mat[5] = dy;
    this.mat[6] = Math.fround(0);
    this.mat[7] = Math.fround(0);
    this.mat[8] = Math.fround(1);
  }

  MoveScale(dx, dy, sx, sy) {
    let move = new C4BltTransform();
    move.SetMoveScale(dx, dy, sx, sy);
    this.op_mulAssign(move);
  }

  ScaleAt(sx, sy, tx, ty) {
    this.MoveScale(Math.fround(-tx * Math.fround(sx - Math.fround(1))), Math.fround(-ty * Math.fround(sy - Math.fround(1))), sx, sy);
  }

  op_mulAssign(r) {
    C4BltTransform.prototype.Set.call(this, Math.fround(Math.fround(Math.fround(this.mat[0] * r.mat[0]) + Math.fround(this.mat[3] * r.mat[1])) + Math.fround(this.mat[6] * r.mat[2])), Math.fround(Math.fround(Math.fround(this.mat[1] * r.mat[0]) + Math.fround(this.mat[4] * r.mat[1])) + Math.fround(this.mat[7] * r.mat[2])), Math.fround(Math.fround(Math.fround(this.mat[2] * r.mat[0]) + Math.fround(this.mat[5] * r.mat[1])) + Math.fround(this.mat[8] * r.mat[2])), Math.fround(Math.fround(Math.fround(this.mat[0] * r.mat[3]) + Math.fround(this.mat[3] * r.mat[4])) + Math.fround(this.mat[6] * r.mat[5])), Math.fround(Math.fround(Math.fround(this.mat[1] * r.mat[3]) + Math.fround(this.mat[4] * r.mat[4])) + Math.fround(this.mat[7] * r.mat[5])), Math.fround(Math.fround(Math.fround(this.mat[2] * r.mat[3]) + Math.fround(this.mat[5] * r.mat[4])) + Math.fround(this.mat[8] * r.mat[5])), Math.fround(Math.fround(Math.fround(this.mat[0] * r.mat[6]) + Math.fround(this.mat[3] * r.mat[7])) + Math.fround(this.mat[6] * r.mat[8])), Math.fround(Math.fround(Math.fround(this.mat[1] * r.mat[6]) + Math.fround(this.mat[4] * r.mat[7])) + Math.fround(this.mat[7] * r.mat[8])), Math.fround(Math.fround(Math.fround(this.mat[2] * r.mat[6]) + Math.fround(this.mat[5] * r.mat[7])) + Math.fround(this.mat[8] * r.mat[8])));
    return this;
  }

  TransformPoint(rX, rY) {
    let fW = Math.fround(Math.fround(Math.fround(this.mat[6] * rX.a[rX.o]) + Math.fround(this.mat[7] * rY.a[rY.o])) + this.mat[8]);
    let fX = Math.fround(Math.fround(Math.fround(Math.fround(this.mat[0] * rX.a[rX.o]) + Math.fround(this.mat[1] * rY.a[rY.o])) + this.mat[2]) / fW);
    rY.a[rY.o] = Math.fround(Math.fround(Math.fround(Math.fround(this.mat[3] * rX.a[rX.o]) + Math.fround(this.mat[4] * rY.a[rY.o])) + this.mat[5]) / fW);
    rX.a[rX.o] = fX;
  }

  $clone() { return new C4BltTransform().$assign(this); }
  $assign(o) {
    this.mat = o.mat.slice();
    return this;
  }
}

export function $init(): void {
}

Object.assign($, { C4BltTransform });
