// @ts-nocheck
// OpenClonk 36de799: src/lib/StdMeshMath.cpp, src/lib/StdMeshMath.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { c$acos, c$cos, c$sin, c$sqrt } from '../../rt/libc.ts';
import { $oarr, $own, $rd, $rowp, $wr } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { std_begin, std_end, std_uninitialized_fill } from '../../rt/std.ts';

export class StdMeshVector {
  static $layout = [["x", 0, "f32", 0], ["y", 4, "f32", 0], ["z", 8, "f32", 0]];
  static $size = 12;
  x = 0;
  y = 0;
  z = 0;

  static Zero() {
    let v = new StdMeshVector();
    v.x = 0;
    v.y = 0;
    v.z = 0;
    return v;
  }

  static UnitScale() {
    let v = new StdMeshVector();
    v.x = 1;
    v.y = 1;
    v.z = 1;
    return v;
  }

  static Translate(dx, dy, dz) {
    let v = new StdMeshVector();
    v.x = dx;
    v.y = dy;
    v.z = dz;
    return v;
  }

  static Cross(lhs, rhs) {
    let v = new StdMeshVector();
    v.x = Math.fround(Math.fround(lhs.y * rhs.z) - Math.fround(lhs.z * rhs.y));
    v.y = Math.fround(Math.fround(lhs.z * rhs.x) - Math.fround(lhs.x * rhs.z));
    v.z = Math.fround(Math.fround(lhs.x * rhs.y) - Math.fround(lhs.y * rhs.x));
    return v;
  }

  Normalize() {
    let len = Math.fround(c$sqrt(Math.fround(Math.fround(Math.fround(this.x * this.x) + Math.fround(this.y * this.y)) + Math.fround(this.z * this.z))));
    this.x = Math.fround(this.x / len);
    this.y = Math.fround(this.y / len);
    this.z = Math.fround(this.z / len);
  }

  $clone() { return new StdMeshVector().$assign(this); }
  $assign(o) {
    this.x = o.x;
    this.y = o.y;
    this.z = o.z;
    return this;
  }
}

export class StdMeshVertex {
  static $layout = [["u", 0, "f32", 0], ["v", 4, "f32", 0], ["nx", 8, "f32", 0], ["ny", 12, "f32", 0], ["nz", 16, "f32", 0], ["x", 20, "f32", 0], ["y", 24, "f32", 0], ["z", 28, "f32", 0], ["bone_weight", 32, "f32", 8], ["bone_index", 64, "u16", 8], ["_padding", 80, "i8", 16]];
  static $size = 96;
  static MaxBoneWeightCount;
  u = Math.fround(0);
  v = Math.fround(0);
  nx = Math.fround(0);
  ny = Math.fround(0);
  nz = Math.fround(0);
  x = Math.fround(0);
  y = Math.fround(0);
  z = Math.fround(0);
  bone_weight = new Float32Array(8);
  bone_index = new Uint16Array(8);
  _padding = new Int8Array(16);

  init() {
    this.u = Math.fround(0);
    this.v = Math.fround(0);
    this.nx = Math.fround(0);
    this.ny = Math.fround(0);
    this.nz = Math.fround(0);
    this.x = Math.fround(0);
    this.y = Math.fround(0);
    this.z = Math.fround(0);
    std_uninitialized_fill(std_begin(this.bone_weight), std_end(this.bone_weight), 0);
    std_uninitialized_fill(std_begin(this.bone_index), std_end(this.bone_index), 0);
    std_uninitialized_fill(std_begin(this._padding), std_end(this._padding), 0);
    return this;
  }

  $clone() { return new StdMeshVertex().$assign(this); }
  $assign(o) {
    this.u = o.u;
    this.v = o.v;
    this.nx = o.nx;
    this.ny = o.ny;
    this.nz = o.nz;
    this.x = o.x;
    this.y = o.y;
    this.z = o.z;
    this.bone_weight = o.bone_weight.slice();
    this.bone_index = o.bone_index.slice();
    this._padding = o._padding.slice();
    return this;
  }
}

export class StdMeshQuaternion {
  static $layout = [["w", 0, "f32", 0], ["x", 4, "f32", 0], ["y", 8, "f32", 0], ["z", 12, "f32", 0]];
  static $size = 16;
  w = 0;
  x = 0;
  y = 0;
  z = 0;

  static Zero() {
    let q = new StdMeshQuaternion();
    q.w = 0;
    q.x = 0;
    q.y = 0;
    q.z = 0;
    return q;
  }

  static AngleAxis(theta, axis) {
    let q = new StdMeshQuaternion();
    let theta2 = Math.fround(theta / 2);
    let s = Math.fround(c$sin(theta2));
    q.w = Math.fround(c$cos(theta2));
    q.x = Math.fround(s * axis.x);
    q.y = Math.fround(s * axis.y);
    q.z = Math.fround(s * axis.z);
    return q;
  }

  LenSqr() {
    return Math.fround(Math.fround(Math.fround(Math.fround(this.w * this.w) + Math.fround(this.x * this.x)) + Math.fround(this.y * this.y)) + Math.fround(this.z * this.z));
  }

  Normalize() {
    let length = Math.fround(c$sqrt(this.LenSqr()));
    this.w = Math.fround(this.w / length);
    this.x = Math.fround(this.x / length);
    this.y = Math.fround(this.y / length);
    this.z = Math.fround(this.z / length);
  }

  static Nlerp(lhs, rhs, w) {
    let q = new StdMeshQuaternion();
    let c = Math.fround(Math.fround(Math.fround(Math.fround(lhs.w * rhs.w) + Math.fround(lhs.x * rhs.x)) + Math.fround(lhs.y * rhs.y)) + Math.fround(lhs.z * rhs.z));
    if (c < 0) {
      q.$assign(op_add$StdMeshQuaternion$StdMeshQuaternion(lhs, op_mul$f32$StdMeshQuaternion(w, op_sub$StdMeshQuaternion$StdMeshQuaternion(op_neg$StdMeshQuaternion(rhs), lhs))));
    } else {
      q.$assign(op_add$StdMeshQuaternion$StdMeshQuaternion(lhs, op_mul$f32$StdMeshQuaternion(w, op_sub$StdMeshQuaternion$StdMeshQuaternion(rhs, lhs))));
    }
    q.Normalize();
    return q;
  }

  $clone() { return new StdMeshQuaternion().$assign(this); }
  $assign(o) {
    this.w = o.w;
    this.x = o.x;
    this.y = o.y;
    this.z = o.z;
    return this;
  }
}

export class StdMeshTransformation {
  static $layout = [["scale.x", 0, "f32", 0], ["scale.y", 4, "f32", 0], ["scale.z", 8, "f32", 0], ["rotate.w", 12, "f32", 0], ["rotate.x", 16, "f32", 0], ["rotate.y", 20, "f32", 0], ["rotate.z", 24, "f32", 0], ["translate.x", 28, "f32", 0], ["translate.y", 32, "f32", 0], ["translate.z", 36, "f32", 0]];
  static $size = 40;
  scale = new StdMeshVector();
  rotate = new StdMeshQuaternion();
  translate = new StdMeshVector();

  static Zero() {
    let t = new StdMeshTransformation().None();
    t.scale.$assign(StdMeshVector.Zero());
    t.rotate.$assign(StdMeshQuaternion.Zero());
    t.translate.$assign(StdMeshVector.Zero());
    return t;
  }

  static Identity() {
    let t = new StdMeshTransformation().None();
    t.scale.$assign(StdMeshVector.UnitScale());
    t.rotate.w = 1;
    t.rotate.x = t.rotate.y = t.rotate.z = 0;
    t.translate.$assign(StdMeshVector.Zero());
    return t;
  }

  static Inverse(transform) {
    let t = new StdMeshTransformation().None();
    t.scale.$assign(op_div$f32$StdMeshVector(1, transform.scale));
    t.rotate.w = transform.rotate.w;
    t.rotate.x = -transform.rotate.x;
    t.rotate.y = -transform.rotate.y;
    t.rotate.z = -transform.rotate.z;
    t.translate.$assign(op_mul$StdMeshQuaternion$StdMeshVector(t.rotate, op_mul$StdMeshVector$StdMeshVector(t.scale, op_neg$StdMeshVector(transform.translate))));
    return t;
  }

  static Translate(dx, dy, dz) {
    let t = new StdMeshTransformation().None();
    t.scale.$assign(StdMeshVector.UnitScale());
    t.rotate.w = 1;
    t.rotate.x = t.rotate.y = t.rotate.z = 0;
    t.translate.$assign(StdMeshVector.Translate(dx, dy, dz));
    return t;
  }

  static Scale(sx, sy, sz) {
    let t = new StdMeshTransformation().None();
    t.scale.$assign(StdMeshVector.Translate(sx, sy, sz));
    t.rotate.w = 1;
    t.rotate.x = t.rotate.y = t.rotate.z = 0;
    t.translate.$assign(StdMeshVector.Zero());
    return t;
  }

  static Rotate(angle, rx, ry, rz) {
    let t = new StdMeshTransformation().None();
    t.scale.$assign(StdMeshVector.UnitScale());
    t.rotate.$assign(StdMeshQuaternion.AngleAxis(angle, StdMeshVector.Translate(rx, ry, rz)));
    t.translate.$assign(StdMeshVector.Zero());
    return t;
  }

  static Nlerp(lhs, rhs, w) {
    let t = new StdMeshTransformation().None();
    t.translate.$assign(op_add$StdMeshVector$StdMeshVector(op_mul$f32$StdMeshVector(Math.fround(Math.fround(1) - w), lhs.translate), op_mul$f32$StdMeshVector(w, rhs.translate)));
    t.rotate.$assign(StdMeshQuaternion.Nlerp(lhs.rotate, rhs.rotate, w));
    t.scale.$assign(op_add$StdMeshVector$StdMeshVector(op_mul$f32$StdMeshVector(Math.fround(Math.fround(1) - w), lhs.scale), op_mul$f32$StdMeshVector(w, rhs.scale)));
    return t;
  }

  None() {
    this.scale = new StdMeshVector();
    this.rotate = new StdMeshQuaternion();
    this.translate = new StdMeshVector();
    return this;
  }

  $clone() { return new StdMeshTransformation().$assign(this); }
  $assign(o) {
    this.scale.$assign(o.scale);
    this.rotate.$assign(o.rotate);
    this.translate.$assign(o.translate);
    return this;
  }
}

export class StdMeshMatrix {
  static NColumns;
  static NRows;
  a = $oarr(3, () => new Float32Array(4));

  static Zero() {
    let m = new StdMeshMatrix();
    m.a[0][0] = 0;
    m.a[0][1] = 0;
    m.a[0][2] = 0;
    m.a[0][3] = 0;
    m.a[1][0] = 0;
    m.a[1][1] = 0;
    m.a[1][2] = 0;
    m.a[1][3] = 0;
    m.a[2][0] = 0;
    m.a[2][1] = 0;
    m.a[2][2] = 0;
    m.a[2][3] = 0;
    return m;
  }

  static Identity() {
    let m = new StdMeshMatrix();
    m.a[0][0] = 1;
    m.a[0][1] = 0;
    m.a[0][2] = 0;
    m.a[0][3] = 0;
    m.a[1][0] = 0;
    m.a[1][1] = 1;
    m.a[1][2] = 0;
    m.a[1][3] = 0;
    m.a[2][0] = 0;
    m.a[2][1] = 0;
    m.a[2][2] = 1;
    m.a[2][3] = 0;
    return m;
  }

  static Inverse(mat) {
    let m = new StdMeshMatrix();
    let det = mat.Determinant();
    0;
    m.a[0][0] = Math.fround(Math.fround(Math.fround(mat.a[1][1] * mat.a[2][2]) - Math.fround(mat.a[1][2] * mat.a[2][1])) / det);
    m.a[1][0] = Math.fround(Math.fround(Math.fround(mat.a[1][2] * mat.a[2][0]) - Math.fround(mat.a[1][0] * mat.a[2][2])) / det);
    m.a[2][0] = Math.fround(Math.fround(Math.fround(mat.a[1][0] * mat.a[2][1]) - Math.fround(mat.a[1][1] * mat.a[2][0])) / det);
    m.a[0][1] = Math.fround(Math.fround(Math.fround(mat.a[0][2] * mat.a[2][1]) - Math.fround(mat.a[0][1] * mat.a[2][2])) / det);
    m.a[1][1] = Math.fround(Math.fround(Math.fround(mat.a[0][0] * mat.a[2][2]) - Math.fround(mat.a[0][2] * mat.a[2][0])) / det);
    m.a[2][1] = Math.fround(Math.fround(Math.fround(mat.a[0][1] * mat.a[2][0]) - Math.fround(mat.a[0][0] * mat.a[2][1])) / det);
    m.a[0][2] = Math.fround(Math.fround(Math.fround(mat.a[0][1] * mat.a[1][2]) - Math.fround(mat.a[0][2] * mat.a[1][1])) / det);
    m.a[1][2] = Math.fround(Math.fround(Math.fround(mat.a[0][2] * mat.a[1][0]) - Math.fround(mat.a[0][0] * mat.a[1][2])) / det);
    m.a[2][2] = Math.fround(Math.fround(Math.fround(mat.a[0][0] * mat.a[1][1]) - Math.fround(mat.a[0][1] * mat.a[1][0])) / det);
    m.a[0][3] = Math.fround(Math.fround(Math.fround(Math.fround(Math.fround(Math.fround(Math.fround(Math.fround(mat.a[0][1] * mat.a[1][3]) * mat.a[2][2]) + Math.fround(Math.fround(mat.a[0][2] * mat.a[1][1]) * mat.a[2][3])) + Math.fround(Math.fround(mat.a[0][3] * mat.a[1][2]) * mat.a[2][1])) - Math.fround(Math.fround(mat.a[0][1] * mat.a[1][2]) * mat.a[2][3])) - Math.fround(Math.fround(mat.a[0][2] * mat.a[1][3]) * mat.a[2][1])) - Math.fround(Math.fround(mat.a[0][3] * mat.a[1][1]) * mat.a[2][2])) / det);
    m.a[1][3] = Math.fround(Math.fround(Math.fround(Math.fround(Math.fround(Math.fround(Math.fround(Math.fround(mat.a[0][0] * mat.a[1][2]) * mat.a[2][3]) + Math.fround(Math.fround(mat.a[0][2] * mat.a[1][3]) * mat.a[2][0])) + Math.fround(Math.fround(mat.a[0][3] * mat.a[1][0]) * mat.a[2][2])) - Math.fround(Math.fround(mat.a[0][0] * mat.a[1][3]) * mat.a[2][2])) - Math.fround(Math.fround(mat.a[0][2] * mat.a[1][0]) * mat.a[2][3])) - Math.fround(Math.fround(mat.a[0][3] * mat.a[1][2]) * mat.a[2][0])) / det);
    m.a[2][3] = Math.fround(Math.fround(Math.fround(Math.fround(Math.fround(Math.fround(Math.fround(Math.fround(mat.a[0][0] * mat.a[1][3]) * mat.a[2][1]) + Math.fround(Math.fround(mat.a[0][1] * mat.a[1][0]) * mat.a[2][3])) + Math.fround(Math.fround(mat.a[0][3] * mat.a[1][1]) * mat.a[2][0])) - Math.fround(Math.fround(mat.a[0][0] * mat.a[1][1]) * mat.a[2][3])) - Math.fround(Math.fround(mat.a[0][1] * mat.a[1][3]) * mat.a[2][0])) - Math.fround(Math.fround(mat.a[0][3] * mat.a[1][0]) * mat.a[2][1])) / det);
    return m;
  }

  static Translate(dx, dy, dz) {
    let m = new StdMeshMatrix();
    m.a[0][0] = 1;
    m.a[0][1] = 0;
    m.a[0][2] = 0;
    m.a[0][3] = dx;
    m.a[1][0] = 0;
    m.a[1][1] = 1;
    m.a[1][2] = 0;
    m.a[1][3] = dy;
    m.a[2][0] = 0;
    m.a[2][1] = 0;
    m.a[2][2] = 1;
    m.a[2][3] = dz;
    return m;
  }

  static Scale(sx, sy, sz) {
    let m = new StdMeshMatrix();
    m.a[0][0] = sx;
    m.a[0][1] = 0;
    m.a[0][2] = 0;
    m.a[0][3] = 0;
    m.a[1][0] = 0;
    m.a[1][1] = sy;
    m.a[1][2] = 0;
    m.a[1][3] = 0;
    m.a[2][0] = 0;
    m.a[2][1] = 0;
    m.a[2][2] = sz;
    m.a[2][3] = 0;
    return m;
  }

  static Rotate(angle, rx, ry, rz) {
    let m = new StdMeshMatrix();
    let abs = Math.fround(c$sqrt(Math.fround(Math.fround(Math.fround(rx * rx) + Math.fround(ry * ry)) + Math.fround(rz * rz))));
    rx = Math.fround(rx / abs);
    ry = Math.fround(ry / abs);
    rz = Math.fround(rz / abs);
    let c = Math.fround(c$cos(angle));
    let s = Math.fround(c$sin(angle));
    m.a[0][0] = Math.fround(Math.fround(Math.fround(rx * rx) * Math.fround(Math.fround(1) - c)) + c);
    m.a[0][1] = Math.fround(Math.fround(Math.fround(rx * ry) * Math.fround(Math.fround(1) - c)) - Math.fround(rz * s));
    m.a[0][2] = Math.fround(Math.fround(Math.fround(rx * rz) * Math.fround(Math.fround(1) - c)) + Math.fround(ry * s));
    m.a[0][3] = 0;
    m.a[1][0] = Math.fround(Math.fround(Math.fround(ry * rx) * Math.fround(Math.fround(1) - c)) + Math.fround(rz * s));
    m.a[1][1] = Math.fround(Math.fround(Math.fround(ry * ry) * Math.fround(Math.fround(1) - c)) + c);
    m.a[1][2] = Math.fround(Math.fround(Math.fround(ry * rz) * Math.fround(Math.fround(1) - c)) - Math.fround(rx * s));
    m.a[1][3] = 0;
    m.a[2][0] = Math.fround(Math.fround(Math.fround(rz * rx) * Math.fround(Math.fround(1) - c)) - Math.fround(ry * s));
    m.a[2][1] = Math.fround(Math.fround(Math.fround(ry * rz) * Math.fround(Math.fround(1) - c)) + Math.fround(rx * s));
    m.a[2][2] = Math.fround(Math.fround(Math.fround(rz * rz) * Math.fround(Math.fround(1) - c)) + c);
    m.a[2][3] = 0;
    return m;
  }

  static Transform(transform) {
    let m = new StdMeshMatrix();
    let tx = Math.fround(Math.fround(2) * transform.rotate.x);
    let ty = Math.fround(Math.fround(2) * transform.rotate.y);
    let tz = Math.fround(Math.fround(2) * transform.rotate.z);
    let twx = Math.fround(tx * transform.rotate.w);
    let twy = Math.fround(ty * transform.rotate.w);
    let twz = Math.fround(tz * transform.rotate.w);
    let txx = Math.fround(tx * transform.rotate.x);
    let txy = Math.fround(ty * transform.rotate.x);
    let txz = Math.fround(tz * transform.rotate.x);
    let tyy = Math.fround(ty * transform.rotate.y);
    let tyz = Math.fround(tz * transform.rotate.y);
    let tzz = Math.fround(tz * transform.rotate.z);
    m.a[0][0] = Math.fround(Math.fround(1 - Math.fround(tyy + tzz)) * transform.scale.x);
    m.a[0][1] = Math.fround(Math.fround(txy - twz) * transform.scale.y);
    m.a[0][2] = Math.fround(Math.fround(txz + twy) * transform.scale.z);
    m.a[1][0] = Math.fround(Math.fround(txy + twz) * transform.scale.x);
    m.a[1][1] = Math.fround(Math.fround(1 - Math.fround(txx + tzz)) * transform.scale.y);
    m.a[1][2] = Math.fround(Math.fround(tyz - twx) * transform.scale.z);
    m.a[2][0] = Math.fround(Math.fround(txz - twy) * transform.scale.x);
    m.a[2][1] = Math.fround(Math.fround(tyz + twx) * transform.scale.y);
    m.a[2][2] = Math.fround(Math.fround(1 - Math.fround(txx + tyy)) * transform.scale.z);
    m.a[0][3] = transform.translate.x;
    m.a[1][3] = transform.translate.y;
    m.a[2][3] = transform.translate.z;
    return m;
  }

  static TransformInverse(transform) {
    let m = new StdMeshMatrix();
    let tx = Math.fround(Math.fround(2) * transform.rotate.x);
    let ty = Math.fround(Math.fround(2) * transform.rotate.y);
    let tz = Math.fround(Math.fround(2) * transform.rotate.z);
    let twx = Math.fround(-tx * transform.rotate.w);
    let twy = Math.fround(-ty * transform.rotate.w);
    let twz = Math.fround(-tz * transform.rotate.w);
    let txx = Math.fround(tx * transform.rotate.x);
    let txy = Math.fround(ty * transform.rotate.x);
    let txz = Math.fround(tz * transform.rotate.x);
    let tyy = Math.fround(ty * transform.rotate.y);
    let tyz = Math.fround(tz * transform.rotate.y);
    let tzz = Math.fround(tz * transform.rotate.z);
    m.a[0][0] = Math.fround(Math.fround(1 - Math.fround(tyy + tzz)) / transform.scale.x);
    m.a[0][1] = Math.fround(Math.fround(txy - twz) / transform.scale.x);
    m.a[0][2] = Math.fround(Math.fround(txz + twy) / transform.scale.x);
    m.a[1][0] = Math.fround(Math.fround(txy + twz) / transform.scale.y);
    m.a[1][1] = Math.fround(Math.fround(1 - Math.fround(txx + tzz)) / transform.scale.y);
    m.a[1][2] = Math.fround(Math.fround(tyz - twx) / transform.scale.y);
    m.a[2][0] = Math.fround(Math.fround(txz - twy) / transform.scale.z);
    m.a[2][1] = Math.fround(Math.fround(tyz + twx) / transform.scale.z);
    m.a[2][2] = Math.fround(Math.fround(1 - Math.fround(txx + tyy)) / transform.scale.z);
    let invtranslate = op_mul$StdMeshQuaternion$StdMeshVector(op_neg$StdMeshQuaternion(transform.rotate), op_div$StdMeshVector$StdMeshVector(op_neg$StdMeshVector(transform.translate), transform.scale));
    m.a[0][3] = invtranslate.x;
    m.a[1][3] = invtranslate.y;
    m.a[2][3] = invtranslate.z;
    return m;
  }

  static LookAt(eye, center, up) {
    let z = op_sub$StdMeshVector$StdMeshVector(eye, center);
    z.Normalize();
    let x = StdMeshVector.Cross(up, z);
    x.Normalize();
    let y = StdMeshVector.Cross(z, x);
    let m = new StdMeshMatrix();
    m.a[0][0] = x.x;
    m.a[0][1] = x.y;
    m.a[0][2] = x.z;
    m.a[0][3] = Math.fround(Math.fround(Math.fround(-x.x * eye.x) - Math.fround(x.y * eye.y)) - Math.fround(x.z * eye.z));
    m.a[1][0] = y.x;
    m.a[1][1] = y.y;
    m.a[1][2] = y.z;
    m.a[1][3] = Math.fround(Math.fround(Math.fround(-y.x * eye.x) - Math.fround(y.y * eye.y)) - Math.fround(y.z * eye.z));
    m.a[2][0] = z.x;
    m.a[2][1] = z.y;
    m.a[2][2] = z.z;
    m.a[2][3] = Math.fround(Math.fround(Math.fround(-z.x * eye.x) - Math.fround(z.y * eye.y)) - Math.fround(z.z * eye.z));
    return m;
  }

  op_call$i32$i32(i, j) {
    return $rowp(this, "a", i, j);
  }

  op_call$i32$i32$c(i, j) {
    return this.a[i][j];
  }

  Determinant() {
    return Math.fround(Math.fround(Math.fround(Math.fround(Math.fround(Math.fround(Math.fround(this.a[0][0] * this.a[1][1]) * this.a[2][2]) + Math.fround(Math.fround(this.a[0][1] * this.a[1][2]) * this.a[2][0])) + Math.fround(Math.fround(this.a[0][2] * this.a[1][0]) * this.a[2][1])) - Math.fround(Math.fround(this.a[0][0] * this.a[1][2]) * this.a[2][1])) - Math.fround(Math.fround(this.a[0][1] * this.a[1][0]) * this.a[2][2])) - Math.fround(Math.fround(this.a[0][2] * this.a[1][1]) * this.a[2][0]));
  }

  Decompose() {
    let sx = Math.fround(c$sqrt(Math.fround(Math.fround(Math.fround(this.a[0][0] * this.a[0][0]) + Math.fround(this.a[1][0] * this.a[1][0])) + Math.fround(this.a[2][0] * this.a[2][0]))));
    let sy = Math.fround(c$sqrt(Math.fround(Math.fround(Math.fround(this.a[0][1] * this.a[0][1]) + Math.fround(this.a[1][1] * this.a[1][1])) + Math.fround(this.a[2][1] * this.a[2][1]))));
    let sz = Math.fround(c$sqrt(Math.fround(Math.fround(Math.fround(this.a[0][2] * this.a[0][2]) + Math.fround(this.a[1][2] * this.a[1][2])) + Math.fround(this.a[2][2] * this.a[2][2]))));
    let rot = op_mul$StdMeshMatrix$StdMeshMatrix(StdMeshMatrix.Scale(Math.fround(1 / sx), Math.fround(1 / sy), Math.fround(1 / sz)), this);
    let cos_angle = Math.fround(0.5 * Math.fround(Math.fround(Math.fround(rot.a[0][0] + rot.a[1][1]) + rot.a[2][2]) - 1));
    let rdx = Math.fround(rot.a[2][1] - rot.a[1][2]);
    let rdy = Math.fround(rot.a[0][2] - rot.a[2][0]);
    let rdz = Math.fround(rot.a[1][0] - rot.a[0][1]);
    let det = Math.fround(c$sqrt(Math.fround(Math.fround(Math.fround(rdx * rdx) + Math.fround(rdy * rdy)) + Math.fround(rdz * rdz))));
    let rx = Math.fround(Math.fround(rot.a[2][1] - rot.a[1][2]) / det);
    let ry = Math.fround(Math.fround(rot.a[0][2] - rot.a[2][0]) / det);
    let rz = Math.fround(Math.fround(rot.a[1][0] - rot.a[0][1]) / det);
    let trans = new StdMeshTransformation().None();
    trans.scale.x = sx;
    trans.scale.y = sy;
    trans.scale.z = sz;
    trans.rotate.$assign(StdMeshQuaternion.AngleAxis(Math.fround(c$acos(cos_angle)), StdMeshVector.Translate(rx, ry, rz)));
    trans.translate.x = this.a[0][3];
    trans.translate.y = this.a[1][3];
    trans.translate.z = this.a[2][3];
    return trans;
  }

  data() {
    return $rowp(this, "a", 0, 0);
  }

  $clone() { return new StdMeshMatrix().$assign(this); }
  $assign(o) {
    this.a = $own(o.a.map(($e0) => $e0.slice()));
    return this;
  }
}

export class StdProjectionMatrix {
  static NColumns;
  static NRows;
  a = $oarr(4, () => new Float32Array(4));

  static Identity() {
    let m = new StdProjectionMatrix();
    m.a[0][0] = 1;
    m.a[0][1] = 0;
    m.a[0][2] = 0;
    m.a[0][3] = 0;
    m.a[1][0] = 0;
    m.a[1][1] = 1;
    m.a[1][2] = 0;
    m.a[1][3] = 0;
    m.a[2][0] = 0;
    m.a[2][1] = 0;
    m.a[2][2] = 1;
    m.a[2][3] = 0;
    m.a[3][0] = 0;
    m.a[3][1] = 0;
    m.a[3][2] = 0;
    m.a[3][3] = 1;
    return m;
  }

  static Translate(dx, dy, dz) {
    let m = new StdProjectionMatrix();
    m.a[0][0] = 1;
    m.a[0][1] = 0;
    m.a[0][2] = 0;
    m.a[0][3] = dx;
    m.a[1][0] = 0;
    m.a[1][1] = 1;
    m.a[1][2] = 0;
    m.a[1][3] = dy;
    m.a[2][0] = 0;
    m.a[2][1] = 0;
    m.a[2][2] = 1;
    m.a[2][3] = dz;
    m.a[3][0] = 0;
    m.a[3][1] = 0;
    m.a[3][2] = 0;
    m.a[3][3] = 1;
    return m;
  }

  static Scale(sx, sy, sz) {
    let m = new StdProjectionMatrix();
    m.a[0][0] = sx;
    m.a[0][1] = 0;
    m.a[0][2] = 0;
    m.a[0][3] = 0;
    m.a[1][0] = 0;
    m.a[1][1] = sy;
    m.a[1][2] = 0;
    m.a[1][3] = 0;
    m.a[2][0] = 0;
    m.a[2][1] = 0;
    m.a[2][2] = sz;
    m.a[2][3] = 0;
    m.a[3][0] = 0;
    m.a[3][1] = 0;
    m.a[3][2] = 0;
    m.a[3][3] = 1;
    return m;
  }

  static Rotate(angle, rx, ry, rz) {
    let m = new StdProjectionMatrix();
    let abs = Math.fround(c$sqrt(Math.fround(Math.fround(Math.fround(rx * rx) + Math.fround(ry * ry)) + Math.fround(rz * rz))));
    rx = Math.fround(rx / abs);
    ry = Math.fround(ry / abs);
    rz = Math.fround(rz / abs);
    let c = Math.fround(c$cos(angle));
    let s = Math.fround(c$sin(angle));
    m.a[0][0] = Math.fround(Math.fround(Math.fround(rx * rx) * Math.fround(Math.fround(1) - c)) + c);
    m.a[0][1] = Math.fround(Math.fround(Math.fround(rx * ry) * Math.fround(Math.fround(1) - c)) - Math.fround(rz * s));
    m.a[0][2] = Math.fround(Math.fround(Math.fround(rx * rz) * Math.fround(Math.fround(1) - c)) + Math.fround(ry * s));
    m.a[0][3] = 0;
    m.a[1][0] = Math.fround(Math.fround(Math.fround(ry * rx) * Math.fround(Math.fround(1) - c)) + Math.fround(rz * s));
    m.a[1][1] = Math.fround(Math.fround(Math.fround(ry * ry) * Math.fround(Math.fround(1) - c)) + c);
    m.a[1][2] = Math.fround(Math.fround(Math.fround(ry * rz) * Math.fround(Math.fround(1) - c)) - Math.fround(rx * s));
    m.a[1][3] = 0;
    m.a[2][0] = Math.fround(Math.fround(Math.fround(rz * rx) * Math.fround(Math.fround(1) - c)) - Math.fround(ry * s));
    m.a[2][1] = Math.fround(Math.fround(Math.fround(ry * rz) * Math.fround(Math.fround(1) - c)) + Math.fround(rx * s));
    m.a[2][2] = Math.fround(Math.fround(Math.fround(rz * rz) * Math.fround(Math.fround(1) - c)) + c);
    m.a[2][3] = 0;
    m.a[3][0] = 0;
    m.a[3][1] = 0;
    m.a[3][2] = 0;
    m.a[3][3] = 1;
    return m;
  }

  static Orthographic(left, right, bottom, top) {
    let matrix = new StdProjectionMatrix();
    $wr(matrix.op_call$i32$i32(0, 0), 0, Math.fround(2 / Math.fround(right - left)));
    $wr(matrix.op_call$i32$i32(0, 1), 0, 0);
    $wr(matrix.op_call$i32$i32(0, 2), 0, 0);
    $wr(matrix.op_call$i32$i32(0, 3), 0, Math.fround(-Math.fround(right + left) / Math.fround(right - left)));
    $wr(matrix.op_call$i32$i32(1, 0), 0, 0);
    $wr(matrix.op_call$i32$i32(1, 1), 0, Math.fround(2 / Math.fround(top - bottom)));
    $wr(matrix.op_call$i32$i32(1, 2), 0, 0);
    $wr(matrix.op_call$i32$i32(1, 3), 0, Math.fround(-Math.fround(top + bottom) / Math.fround(top - bottom)));
    $wr(matrix.op_call$i32$i32(2, 0), 0, 0);
    $wr(matrix.op_call$i32$i32(2, 1), 0, 0);
    $wr(matrix.op_call$i32$i32(2, 2), 0, -1);
    $wr(matrix.op_call$i32$i32(2, 3), 0, 0);
    $wr(matrix.op_call$i32$i32(3, 0), 0, 0);
    $wr(matrix.op_call$i32$i32(3, 1), 0, 0);
    $wr(matrix.op_call$i32$i32(3, 2), 0, 0);
    $wr(matrix.op_call$i32$i32(3, 3), 0, 1);
    return matrix;
  }

  static Upper3x4(matrix) {
    let m = new StdMeshMatrix();
    $wr(m.op_call$i32$i32(0, 0), 0, matrix.a[0][0]);
    $wr(m.op_call$i32$i32(0, 1), 0, matrix.a[0][1]);
    $wr(m.op_call$i32$i32(0, 2), 0, matrix.a[0][2]);
    $wr(m.op_call$i32$i32(0, 3), 0, matrix.a[0][3]);
    $wr(m.op_call$i32$i32(1, 0), 0, matrix.a[1][0]);
    $wr(m.op_call$i32$i32(1, 1), 0, matrix.a[1][1]);
    $wr(m.op_call$i32$i32(1, 2), 0, matrix.a[1][2]);
    $wr(m.op_call$i32$i32(1, 3), 0, matrix.a[1][3]);
    $wr(m.op_call$i32$i32(2, 0), 0, matrix.a[2][0]);
    $wr(m.op_call$i32$i32(2, 1), 0, matrix.a[2][1]);
    $wr(m.op_call$i32$i32(2, 2), 0, matrix.a[2][2]);
    $wr(m.op_call$i32$i32(2, 3), 0, matrix.a[2][3]);
    return m;
  }

  op_call$i32$i32(i, j) {
    return $rowp(this, "a", i, j);
  }

  op_call$i32$i32$c(i, j) {
    return this.a[i][j];
  }

  data() {
    return $rowp(this, "a", 0, 0);
  }

  $clone() { return new StdProjectionMatrix().$assign(this); }
  $assign(o) {
    this.a = $own(o.a.map(($e0) => $e0.slice()));
    return this;
  }
}

export function Translate(mat, dx, dy, dz) {
  for (let i = 0; i < 4; i = i + 1 | 0) {
    $wr(mat.op_call$i32$i32(i, 3), 0, Math.fround($rd(mat.op_call$i32$i32(i, 3)) + Math.fround(Math.fround(Math.fround($rd(mat.op_call$i32$i32(i, 0)) * dx) + Math.fround($rd(mat.op_call$i32$i32(i, 1)) * dy)) + Math.fround($rd(mat.op_call$i32$i32(i, 2)) * dz))));
  }
}

export function Scale(mat, sx, sy, sz) {
  for (let i = 0; i < 4; i = i + 1 | 0) {
    $wr(mat.op_call$i32$i32(i, 0), 0, Math.fround($rd(mat.op_call$i32$i32(i, 0)) * sx));
    $wr(mat.op_call$i32$i32(i, 1), 0, Math.fround($rd(mat.op_call$i32$i32(i, 1)) * sy));
    $wr(mat.op_call$i32$i32(i, 2), 0, Math.fround($rd(mat.op_call$i32$i32(i, 2)) * sz));
  }
}

export function Rotate(mat, angle, x, y, z) {
  op_mulAssign$rStdProjectionMatrix$StdProjectionMatrix(mat, StdProjectionMatrix.Rotate(angle, x, y, z));
}

export function Perspective(mat, cot_fovy2, aspect, nearVal, farVal) {
  let fa = Math.fround(cot_fovy2 / aspect);
  let fb = cot_fovy2;
  let z1 = Math.fround(Math.fround(nearVal + farVal) / Math.fround(nearVal - farVal));
  let z2 = Math.fround(Math.fround(Math.fround(Math.fround(2) * nearVal) * farVal) / Math.fround(nearVal - farVal));
  for (let i = 0; i < 4; i = i + 1 | 0) {
    let mat2 = $rd(mat.op_call$i32$i32(i, 2));
    $wr(mat.op_call$i32$i32(i, 0), 0, Math.fround($rd(mat.op_call$i32$i32(i, 0)) * fa));
    $wr(mat.op_call$i32$i32(i, 1), 0, Math.fround($rd(mat.op_call$i32$i32(i, 1)) * fb));
    $wr(mat.op_call$i32$i32(i, 2), 0, Math.fround(Math.fround(mat2 * z1) - $rd(mat.op_call$i32$i32(i, 3))));
    $wr(mat.op_call$i32$i32(i, 3), 0, Math.fround(mat2 * z2));
  }
}

export function op_mul$StdMeshMatrix$StdMeshMatrix(lhs, rhs) {
  let m = new StdMeshMatrix();
  $wr(m.op_call$i32$i32(0, 0), 0, Math.fround(Math.fround(Math.fround(lhs.op_call$i32$i32$c(0, 0) * rhs.op_call$i32$i32$c(0, 0)) + Math.fround(lhs.op_call$i32$i32$c(0, 1) * rhs.op_call$i32$i32$c(1, 0))) + Math.fround(lhs.op_call$i32$i32$c(0, 2) * rhs.op_call$i32$i32$c(2, 0))));
  $wr(m.op_call$i32$i32(1, 0), 0, Math.fround(Math.fround(Math.fround(lhs.op_call$i32$i32$c(1, 0) * rhs.op_call$i32$i32$c(0, 0)) + Math.fround(lhs.op_call$i32$i32$c(1, 1) * rhs.op_call$i32$i32$c(1, 0))) + Math.fround(lhs.op_call$i32$i32$c(1, 2) * rhs.op_call$i32$i32$c(2, 0))));
  $wr(m.op_call$i32$i32(2, 0), 0, Math.fround(Math.fround(Math.fround(lhs.op_call$i32$i32$c(2, 0) * rhs.op_call$i32$i32$c(0, 0)) + Math.fround(lhs.op_call$i32$i32$c(2, 1) * rhs.op_call$i32$i32$c(1, 0))) + Math.fround(lhs.op_call$i32$i32$c(2, 2) * rhs.op_call$i32$i32$c(2, 0))));
  $wr(m.op_call$i32$i32(0, 1), 0, Math.fround(Math.fround(Math.fround(lhs.op_call$i32$i32$c(0, 0) * rhs.op_call$i32$i32$c(0, 1)) + Math.fround(lhs.op_call$i32$i32$c(0, 1) * rhs.op_call$i32$i32$c(1, 1))) + Math.fround(lhs.op_call$i32$i32$c(0, 2) * rhs.op_call$i32$i32$c(2, 1))));
  $wr(m.op_call$i32$i32(1, 1), 0, Math.fround(Math.fround(Math.fround(lhs.op_call$i32$i32$c(1, 0) * rhs.op_call$i32$i32$c(0, 1)) + Math.fround(lhs.op_call$i32$i32$c(1, 1) * rhs.op_call$i32$i32$c(1, 1))) + Math.fround(lhs.op_call$i32$i32$c(1, 2) * rhs.op_call$i32$i32$c(2, 1))));
  $wr(m.op_call$i32$i32(2, 1), 0, Math.fround(Math.fround(Math.fround(lhs.op_call$i32$i32$c(2, 0) * rhs.op_call$i32$i32$c(0, 1)) + Math.fround(lhs.op_call$i32$i32$c(2, 1) * rhs.op_call$i32$i32$c(1, 1))) + Math.fround(lhs.op_call$i32$i32$c(2, 2) * rhs.op_call$i32$i32$c(2, 1))));
  $wr(m.op_call$i32$i32(0, 2), 0, Math.fround(Math.fround(Math.fround(lhs.op_call$i32$i32$c(0, 0) * rhs.op_call$i32$i32$c(0, 2)) + Math.fround(lhs.op_call$i32$i32$c(0, 1) * rhs.op_call$i32$i32$c(1, 2))) + Math.fround(lhs.op_call$i32$i32$c(0, 2) * rhs.op_call$i32$i32$c(2, 2))));
  $wr(m.op_call$i32$i32(1, 2), 0, Math.fround(Math.fround(Math.fround(lhs.op_call$i32$i32$c(1, 0) * rhs.op_call$i32$i32$c(0, 2)) + Math.fround(lhs.op_call$i32$i32$c(1, 1) * rhs.op_call$i32$i32$c(1, 2))) + Math.fround(lhs.op_call$i32$i32$c(1, 2) * rhs.op_call$i32$i32$c(2, 2))));
  $wr(m.op_call$i32$i32(2, 2), 0, Math.fround(Math.fround(Math.fround(lhs.op_call$i32$i32$c(2, 0) * rhs.op_call$i32$i32$c(0, 2)) + Math.fround(lhs.op_call$i32$i32$c(2, 1) * rhs.op_call$i32$i32$c(1, 2))) + Math.fround(lhs.op_call$i32$i32$c(2, 2) * rhs.op_call$i32$i32$c(2, 2))));
  $wr(m.op_call$i32$i32(0, 3), 0, Math.fround(Math.fround(Math.fround(Math.fround(lhs.op_call$i32$i32$c(0, 0) * rhs.op_call$i32$i32$c(0, 3)) + Math.fround(lhs.op_call$i32$i32$c(0, 1) * rhs.op_call$i32$i32$c(1, 3))) + Math.fround(lhs.op_call$i32$i32$c(0, 2) * rhs.op_call$i32$i32$c(2, 3))) + lhs.op_call$i32$i32$c(0, 3)));
  $wr(m.op_call$i32$i32(1, 3), 0, Math.fround(Math.fround(Math.fround(Math.fround(lhs.op_call$i32$i32$c(1, 0) * rhs.op_call$i32$i32$c(0, 3)) + Math.fround(lhs.op_call$i32$i32$c(1, 1) * rhs.op_call$i32$i32$c(1, 3))) + Math.fround(lhs.op_call$i32$i32$c(1, 2) * rhs.op_call$i32$i32$c(2, 3))) + lhs.op_call$i32$i32$c(1, 3)));
  $wr(m.op_call$i32$i32(2, 3), 0, Math.fround(Math.fround(Math.fround(Math.fround(lhs.op_call$i32$i32$c(2, 0) * rhs.op_call$i32$i32$c(0, 3)) + Math.fround(lhs.op_call$i32$i32$c(2, 1) * rhs.op_call$i32$i32$c(1, 3))) + Math.fround(lhs.op_call$i32$i32$c(2, 2) * rhs.op_call$i32$i32$c(2, 3))) + lhs.op_call$i32$i32$c(2, 3)));
  return m;
}

export function op_mul$f32$StdMeshMatrix(lhs, rhs) {
  let m = new StdMeshMatrix();
  $wr(m.op_call$i32$i32(0, 0), 0, Math.fround(lhs * rhs.op_call$i32$i32$c(0, 0)));
  $wr(m.op_call$i32$i32(1, 0), 0, Math.fround(lhs * rhs.op_call$i32$i32$c(1, 0)));
  $wr(m.op_call$i32$i32(2, 0), 0, Math.fround(lhs * rhs.op_call$i32$i32$c(2, 0)));
  $wr(m.op_call$i32$i32(0, 1), 0, Math.fround(lhs * rhs.op_call$i32$i32$c(0, 1)));
  $wr(m.op_call$i32$i32(1, 1), 0, Math.fround(lhs * rhs.op_call$i32$i32$c(1, 1)));
  $wr(m.op_call$i32$i32(2, 1), 0, Math.fround(lhs * rhs.op_call$i32$i32$c(2, 1)));
  $wr(m.op_call$i32$i32(0, 2), 0, Math.fround(lhs * rhs.op_call$i32$i32$c(0, 2)));
  $wr(m.op_call$i32$i32(1, 2), 0, Math.fround(lhs * rhs.op_call$i32$i32$c(1, 2)));
  $wr(m.op_call$i32$i32(2, 2), 0, Math.fround(lhs * rhs.op_call$i32$i32$c(2, 2)));
  $wr(m.op_call$i32$i32(0, 3), 0, Math.fround(lhs * rhs.op_call$i32$i32$c(0, 3)));
  $wr(m.op_call$i32$i32(1, 3), 0, Math.fround(lhs * rhs.op_call$i32$i32$c(1, 3)));
  $wr(m.op_call$i32$i32(2, 3), 0, Math.fround(lhs * rhs.op_call$i32$i32$c(2, 3)));
  return m;
}

export function op_mul$StdMeshMatrix$f32(lhs, rhs) {
  return op_mul$f32$StdMeshMatrix(rhs, lhs);
}

export function op_mulAssign$rStdMeshMatrix$StdMeshMatrix(lhs, rhs) {
  lhs.$assign(op_mul$StdMeshMatrix$StdMeshMatrix(lhs, rhs));
  return lhs;
}

export function op_add$StdMeshMatrix$StdMeshMatrix(lhs, rhs) {
  let m = new StdMeshMatrix();
  $wr(m.op_call$i32$i32(0, 0), 0, Math.fround(lhs.op_call$i32$i32$c(0, 0) + rhs.op_call$i32$i32$c(0, 0)));
  $wr(m.op_call$i32$i32(1, 0), 0, Math.fround(lhs.op_call$i32$i32$c(1, 0) + rhs.op_call$i32$i32$c(1, 0)));
  $wr(m.op_call$i32$i32(2, 0), 0, Math.fround(lhs.op_call$i32$i32$c(2, 0) + rhs.op_call$i32$i32$c(2, 0)));
  $wr(m.op_call$i32$i32(0, 1), 0, Math.fround(lhs.op_call$i32$i32$c(0, 1) + rhs.op_call$i32$i32$c(0, 1)));
  $wr(m.op_call$i32$i32(1, 1), 0, Math.fround(lhs.op_call$i32$i32$c(1, 1) + rhs.op_call$i32$i32$c(1, 1)));
  $wr(m.op_call$i32$i32(2, 1), 0, Math.fround(lhs.op_call$i32$i32$c(2, 1) + rhs.op_call$i32$i32$c(2, 1)));
  $wr(m.op_call$i32$i32(0, 2), 0, Math.fround(lhs.op_call$i32$i32$c(0, 2) + rhs.op_call$i32$i32$c(0, 2)));
  $wr(m.op_call$i32$i32(1, 2), 0, Math.fround(lhs.op_call$i32$i32$c(1, 2) + rhs.op_call$i32$i32$c(1, 2)));
  $wr(m.op_call$i32$i32(2, 2), 0, Math.fround(lhs.op_call$i32$i32$c(2, 2) + rhs.op_call$i32$i32$c(2, 2)));
  $wr(m.op_call$i32$i32(0, 3), 0, Math.fround(lhs.op_call$i32$i32$c(0, 3) + rhs.op_call$i32$i32$c(0, 3)));
  $wr(m.op_call$i32$i32(1, 3), 0, Math.fround(lhs.op_call$i32$i32$c(1, 3) + rhs.op_call$i32$i32$c(1, 3)));
  $wr(m.op_call$i32$i32(2, 3), 0, Math.fround(lhs.op_call$i32$i32$c(2, 3) + rhs.op_call$i32$i32$c(2, 3)));
  return m;
}

export function op_mul$StdProjectionMatrix$StdProjectionMatrix(lhs, rhs) {
  let m = new StdProjectionMatrix();
  $wr(m.op_call$i32$i32(0, 0), 0, Math.fround(Math.fround(Math.fround(Math.fround(lhs.op_call$i32$i32$c(0, 0) * rhs.op_call$i32$i32$c(0, 0)) + Math.fround(lhs.op_call$i32$i32$c(0, 1) * rhs.op_call$i32$i32$c(1, 0))) + Math.fround(lhs.op_call$i32$i32$c(0, 2) * rhs.op_call$i32$i32$c(2, 0))) + Math.fround(lhs.op_call$i32$i32$c(0, 3) * rhs.op_call$i32$i32$c(3, 0))));
  $wr(m.op_call$i32$i32(1, 0), 0, Math.fround(Math.fround(Math.fround(Math.fround(lhs.op_call$i32$i32$c(1, 0) * rhs.op_call$i32$i32$c(0, 0)) + Math.fround(lhs.op_call$i32$i32$c(1, 1) * rhs.op_call$i32$i32$c(1, 0))) + Math.fround(lhs.op_call$i32$i32$c(1, 2) * rhs.op_call$i32$i32$c(2, 0))) + Math.fround(lhs.op_call$i32$i32$c(1, 3) * rhs.op_call$i32$i32$c(3, 0))));
  $wr(m.op_call$i32$i32(2, 0), 0, Math.fround(Math.fround(Math.fround(Math.fround(lhs.op_call$i32$i32$c(2, 0) * rhs.op_call$i32$i32$c(0, 0)) + Math.fround(lhs.op_call$i32$i32$c(2, 1) * rhs.op_call$i32$i32$c(1, 0))) + Math.fround(lhs.op_call$i32$i32$c(2, 2) * rhs.op_call$i32$i32$c(2, 0))) + Math.fround(lhs.op_call$i32$i32$c(2, 3) * rhs.op_call$i32$i32$c(3, 0))));
  $wr(m.op_call$i32$i32(3, 0), 0, Math.fround(Math.fround(Math.fround(Math.fround(lhs.op_call$i32$i32$c(3, 0) * rhs.op_call$i32$i32$c(0, 0)) + Math.fround(lhs.op_call$i32$i32$c(3, 1) * rhs.op_call$i32$i32$c(1, 0))) + Math.fround(lhs.op_call$i32$i32$c(3, 2) * rhs.op_call$i32$i32$c(2, 0))) + Math.fround(lhs.op_call$i32$i32$c(3, 3) * rhs.op_call$i32$i32$c(3, 0))));
  $wr(m.op_call$i32$i32(0, 1), 0, Math.fround(Math.fround(Math.fround(Math.fround(lhs.op_call$i32$i32$c(0, 0) * rhs.op_call$i32$i32$c(0, 1)) + Math.fround(lhs.op_call$i32$i32$c(0, 1) * rhs.op_call$i32$i32$c(1, 1))) + Math.fround(lhs.op_call$i32$i32$c(0, 2) * rhs.op_call$i32$i32$c(2, 1))) + Math.fround(lhs.op_call$i32$i32$c(0, 3) * rhs.op_call$i32$i32$c(3, 1))));
  $wr(m.op_call$i32$i32(1, 1), 0, Math.fround(Math.fround(Math.fround(Math.fround(lhs.op_call$i32$i32$c(1, 0) * rhs.op_call$i32$i32$c(0, 1)) + Math.fround(lhs.op_call$i32$i32$c(1, 1) * rhs.op_call$i32$i32$c(1, 1))) + Math.fround(lhs.op_call$i32$i32$c(1, 2) * rhs.op_call$i32$i32$c(2, 1))) + Math.fround(lhs.op_call$i32$i32$c(1, 3) * rhs.op_call$i32$i32$c(3, 1))));
  $wr(m.op_call$i32$i32(2, 1), 0, Math.fround(Math.fround(Math.fround(Math.fround(lhs.op_call$i32$i32$c(2, 0) * rhs.op_call$i32$i32$c(0, 1)) + Math.fround(lhs.op_call$i32$i32$c(2, 1) * rhs.op_call$i32$i32$c(1, 1))) + Math.fround(lhs.op_call$i32$i32$c(2, 2) * rhs.op_call$i32$i32$c(2, 1))) + Math.fround(lhs.op_call$i32$i32$c(2, 3) * rhs.op_call$i32$i32$c(3, 1))));
  $wr(m.op_call$i32$i32(3, 1), 0, Math.fround(Math.fround(Math.fround(Math.fround(lhs.op_call$i32$i32$c(3, 0) * rhs.op_call$i32$i32$c(0, 1)) + Math.fround(lhs.op_call$i32$i32$c(3, 1) * rhs.op_call$i32$i32$c(1, 1))) + Math.fround(lhs.op_call$i32$i32$c(3, 2) * rhs.op_call$i32$i32$c(2, 1))) + Math.fround(lhs.op_call$i32$i32$c(3, 3) * rhs.op_call$i32$i32$c(3, 1))));
  $wr(m.op_call$i32$i32(0, 2), 0, Math.fround(Math.fround(Math.fround(Math.fround(lhs.op_call$i32$i32$c(0, 0) * rhs.op_call$i32$i32$c(0, 2)) + Math.fround(lhs.op_call$i32$i32$c(0, 1) * rhs.op_call$i32$i32$c(1, 2))) + Math.fround(lhs.op_call$i32$i32$c(0, 2) * rhs.op_call$i32$i32$c(2, 2))) + Math.fround(lhs.op_call$i32$i32$c(0, 3) * rhs.op_call$i32$i32$c(3, 2))));
  $wr(m.op_call$i32$i32(1, 2), 0, Math.fround(Math.fround(Math.fround(Math.fround(lhs.op_call$i32$i32$c(1, 0) * rhs.op_call$i32$i32$c(0, 2)) + Math.fround(lhs.op_call$i32$i32$c(1, 1) * rhs.op_call$i32$i32$c(1, 2))) + Math.fround(lhs.op_call$i32$i32$c(1, 2) * rhs.op_call$i32$i32$c(2, 2))) + Math.fround(lhs.op_call$i32$i32$c(1, 3) * rhs.op_call$i32$i32$c(3, 2))));
  $wr(m.op_call$i32$i32(2, 2), 0, Math.fround(Math.fround(Math.fround(Math.fround(lhs.op_call$i32$i32$c(2, 0) * rhs.op_call$i32$i32$c(0, 2)) + Math.fround(lhs.op_call$i32$i32$c(2, 1) * rhs.op_call$i32$i32$c(1, 2))) + Math.fround(lhs.op_call$i32$i32$c(2, 2) * rhs.op_call$i32$i32$c(2, 2))) + Math.fround(lhs.op_call$i32$i32$c(2, 3) * rhs.op_call$i32$i32$c(3, 2))));
  $wr(m.op_call$i32$i32(3, 2), 0, Math.fround(Math.fround(Math.fround(Math.fround(lhs.op_call$i32$i32$c(3, 0) * rhs.op_call$i32$i32$c(0, 2)) + Math.fround(lhs.op_call$i32$i32$c(3, 1) * rhs.op_call$i32$i32$c(1, 2))) + Math.fround(lhs.op_call$i32$i32$c(3, 2) * rhs.op_call$i32$i32$c(2, 2))) + Math.fround(lhs.op_call$i32$i32$c(3, 3) * rhs.op_call$i32$i32$c(3, 2))));
  $wr(m.op_call$i32$i32(0, 3), 0, Math.fround(Math.fround(Math.fround(Math.fround(lhs.op_call$i32$i32$c(0, 0) * rhs.op_call$i32$i32$c(0, 3)) + Math.fround(lhs.op_call$i32$i32$c(0, 1) * rhs.op_call$i32$i32$c(1, 3))) + Math.fround(lhs.op_call$i32$i32$c(0, 2) * rhs.op_call$i32$i32$c(2, 3))) + Math.fround(lhs.op_call$i32$i32$c(0, 3) * rhs.op_call$i32$i32$c(3, 3))));
  $wr(m.op_call$i32$i32(1, 3), 0, Math.fround(Math.fround(Math.fround(Math.fround(lhs.op_call$i32$i32$c(1, 0) * rhs.op_call$i32$i32$c(0, 3)) + Math.fround(lhs.op_call$i32$i32$c(1, 1) * rhs.op_call$i32$i32$c(1, 3))) + Math.fround(lhs.op_call$i32$i32$c(1, 2) * rhs.op_call$i32$i32$c(2, 3))) + Math.fround(lhs.op_call$i32$i32$c(1, 3) * rhs.op_call$i32$i32$c(3, 3))));
  $wr(m.op_call$i32$i32(2, 3), 0, Math.fround(Math.fround(Math.fround(Math.fround(lhs.op_call$i32$i32$c(2, 0) * rhs.op_call$i32$i32$c(0, 3)) + Math.fround(lhs.op_call$i32$i32$c(2, 1) * rhs.op_call$i32$i32$c(1, 3))) + Math.fround(lhs.op_call$i32$i32$c(2, 2) * rhs.op_call$i32$i32$c(2, 3))) + Math.fround(lhs.op_call$i32$i32$c(2, 3) * rhs.op_call$i32$i32$c(3, 3))));
  $wr(m.op_call$i32$i32(3, 3), 0, Math.fround(Math.fround(Math.fround(Math.fround(lhs.op_call$i32$i32$c(3, 0) * rhs.op_call$i32$i32$c(0, 3)) + Math.fround(lhs.op_call$i32$i32$c(3, 1) * rhs.op_call$i32$i32$c(1, 3))) + Math.fround(lhs.op_call$i32$i32$c(3, 2) * rhs.op_call$i32$i32$c(2, 3))) + Math.fround(lhs.op_call$i32$i32$c(3, 3) * rhs.op_call$i32$i32$c(3, 3))));
  return m;
}

export function op_mulAssign$rStdProjectionMatrix$StdProjectionMatrix(lhs, rhs) {
  lhs.$assign(op_mul$StdProjectionMatrix$StdProjectionMatrix(lhs, rhs));
  return lhs;
}

export function op_neg$StdMeshQuaternion(rhs) {
  let q = new StdMeshQuaternion();
  q.w = -rhs.w;
  q.x = -rhs.x;
  q.y = -rhs.y;
  q.z = -rhs.z;
  return q;
}

export function op_mul$StdMeshQuaternion$StdMeshQuaternion(lhs, rhs) {
  let q = new StdMeshQuaternion();
  q.w = Math.fround(Math.fround(Math.fround(Math.fround(lhs.w * rhs.w) - Math.fround(lhs.x * rhs.x)) - Math.fround(lhs.y * rhs.y)) - Math.fround(lhs.z * rhs.z));
  q.x = Math.fround(Math.fround(Math.fround(Math.fround(lhs.w * rhs.x) + Math.fround(lhs.x * rhs.w)) + Math.fround(lhs.y * rhs.z)) - Math.fround(lhs.z * rhs.y));
  q.y = Math.fround(Math.fround(Math.fround(Math.fround(lhs.w * rhs.y) + Math.fround(lhs.y * rhs.w)) + Math.fround(lhs.z * rhs.x)) - Math.fround(lhs.x * rhs.z));
  q.z = Math.fround(Math.fround(Math.fround(Math.fround(lhs.w * rhs.z) + Math.fround(lhs.z * rhs.w)) + Math.fround(lhs.x * rhs.y)) - Math.fround(lhs.y * rhs.x));
  return q;
}

export function op_mulAssign$rStdMeshQuaternion$f32(lhs, rhs) {
  lhs.w = Math.fround(lhs.w * rhs);
  lhs.x = Math.fround(lhs.x * rhs);
  lhs.y = Math.fround(lhs.y * rhs);
  lhs.z = Math.fround(lhs.z * rhs);
  return lhs;
}

export function op_mul$StdMeshQuaternion$f32(lhs, rhs) {
  let q = lhs.$clone();
  op_mulAssign$rStdMeshQuaternion$f32(q, rhs);
  return q;
}

export function op_mul$f32$StdMeshQuaternion(lhs, rhs) {
  return op_mul$StdMeshQuaternion$f32(rhs, lhs);
}

export function op_addAssign$rStdMeshQuaternion$StdMeshQuaternion(lhs, rhs) {
  lhs.w = Math.fround(lhs.w + rhs.w);
  lhs.x = Math.fround(lhs.x + rhs.x);
  lhs.y = Math.fround(lhs.y + rhs.y);
  lhs.z = Math.fround(lhs.z + rhs.z);
  return lhs;
}

export function op_add$StdMeshQuaternion$StdMeshQuaternion(lhs, rhs) {
  let q = lhs.$clone();
  op_addAssign$rStdMeshQuaternion$StdMeshQuaternion(q, rhs);
  return q;
}

export function op_sub$StdMeshQuaternion$StdMeshQuaternion(lhs, rhs) {
  let q = new StdMeshQuaternion();
  q.w = Math.fround(lhs.w - rhs.w);
  q.x = Math.fround(lhs.x - rhs.x);
  q.y = Math.fround(lhs.y - rhs.y);
  q.z = Math.fround(lhs.z - rhs.z);
  return q;
}

export function op_mul$StdMeshTransformation$StdMeshTransformation(lhs, rhs) {
  let t = new StdMeshTransformation().None();
  t.rotate.$assign(op_mul$StdMeshQuaternion$StdMeshQuaternion(lhs.rotate, rhs.rotate));
  t.scale.$assign(op_mul$StdMeshVector$StdMeshVector(lhs.scale, rhs.scale));
  t.translate.$assign(op_add$StdMeshVector$StdMeshVector(lhs.translate, op_mul$StdMeshQuaternion$StdMeshVector(lhs.rotate, op_mul$StdMeshVector$StdMeshVector(lhs.scale, rhs.translate))));
  return t;
}

export function op_neg$StdMeshVector(rhs) {
  let v = new StdMeshVector();
  v.x = -rhs.x;
  v.y = -rhs.y;
  v.z = -rhs.z;
  return v;
}

export function op_addAssign$rStdMeshVector$StdMeshVector(lhs, rhs) {
  lhs.x = Math.fround(lhs.x + rhs.x);
  lhs.y = Math.fround(lhs.y + rhs.y);
  lhs.z = Math.fround(lhs.z + rhs.z);
  return lhs;
}

export function op_add$StdMeshVector$StdMeshVector(lhs, rhs) {
  let v = lhs.$clone();
  op_addAssign$rStdMeshVector$StdMeshVector(v, rhs);
  return v;
}

export function op_subAssign(lhs, rhs) {
  lhs.x = Math.fround(lhs.x - rhs.x);
  lhs.y = Math.fround(lhs.y - rhs.y);
  lhs.z = Math.fround(lhs.z - rhs.z);
  return lhs;
}

export function op_sub$StdMeshVector$StdMeshVector(lhs, rhs) {
  let v = lhs.$clone();
  op_subAssign(v, rhs);
  return v;
}

export function op_mul$StdMeshVector$StdMeshVector(lhs, rhs) {
  let v = new StdMeshVector();
  v.x = Math.fround(lhs.x * rhs.x);
  v.y = Math.fround(lhs.y * rhs.y);
  v.z = Math.fround(lhs.z * rhs.z);
  return v;
}

export function op_mulAssign$rStdMeshVector$f32(lhs, rhs) {
  lhs.x = Math.fround(lhs.x * rhs);
  lhs.y = Math.fround(lhs.y * rhs);
  lhs.z = Math.fround(lhs.z * rhs);
  return lhs;
}

export function op_mul$StdMeshVector$f32(lhs, rhs) {
  let v = lhs.$clone();
  op_mulAssign$rStdMeshVector$f32(v, rhs);
  return v;
}

export function op_mul$f32$StdMeshVector(lhs, rhs) {
  return op_mul$StdMeshVector$f32(rhs, lhs);
}

export function op_div$StdMeshVector$StdMeshVector(lhs, rhs) {
  let v = new StdMeshVector();
  v.x = Math.fround(lhs.x / rhs.x);
  v.y = Math.fround(lhs.y / rhs.y);
  v.z = Math.fround(lhs.z / rhs.z);
  return v;
}

export function op_div$f32$StdMeshVector(lhs, rhs) {
  let v = new StdMeshVector();
  v.x = Math.fround(lhs / rhs.x);
  v.y = Math.fround(lhs / rhs.y);
  v.z = Math.fround(lhs / rhs.z);
  return v;
}

export function op_div$StdMeshVector$f32(lhs, rhs) {
  let v = new StdMeshVector();
  v.x = Math.fround(lhs.x / rhs);
  v.y = Math.fround(lhs.y / rhs);
  v.z = Math.fround(lhs.z / rhs);
  return v;
}

export function op_mul$StdMeshMatrix$StdMeshVector(lhs, rhs) {
  let v = new StdMeshVector();
  v.x = Math.fround(Math.fround(Math.fround(lhs.op_call$i32$i32$c(0, 0) * rhs.x) + Math.fround(lhs.op_call$i32$i32$c(0, 1) * rhs.y)) + Math.fround(lhs.op_call$i32$i32$c(0, 2) * rhs.z));
  v.y = Math.fround(Math.fround(Math.fround(lhs.op_call$i32$i32$c(1, 0) * rhs.x) + Math.fround(lhs.op_call$i32$i32$c(1, 1) * rhs.y)) + Math.fround(lhs.op_call$i32$i32$c(1, 2) * rhs.z));
  v.z = Math.fround(Math.fround(Math.fround(lhs.op_call$i32$i32$c(2, 0) * rhs.x) + Math.fround(lhs.op_call$i32$i32$c(2, 1) * rhs.y)) + Math.fround(lhs.op_call$i32$i32$c(2, 2) * rhs.z));
  return v;
}

export function op_mul$StdMeshQuaternion$StdMeshVector(lhs, rhs) {
  let v = ((($o) => ($o.x = lhs.x, $o.y = lhs.y, $o.z = lhs.z, $o))(new StdMeshVector()));
  let uv = op_mul$f32$StdMeshVector(2, StdMeshVector.Cross(v, rhs));
  let uuv = StdMeshVector.Cross(v, uv);
  return op_add$StdMeshVector$StdMeshVector(op_add$StdMeshVector$StdMeshVector(rhs, op_mul$f32$StdMeshVector(lhs.w, uv)), uuv);
}

export function op_addAssign$rStdMeshVertex$StdMeshVertex(lhs, rhs) {
  lhs.nx = Math.fround(lhs.nx + rhs.nx);
  lhs.ny = Math.fround(lhs.ny + rhs.ny);
  lhs.nz = Math.fround(lhs.nz + rhs.nz);
  lhs.x = Math.fround(lhs.x + rhs.x);
  lhs.y = Math.fround(lhs.y + rhs.y);
  lhs.z = Math.fround(lhs.z + rhs.z);
  return lhs;
}

export function op_add$StdMeshVertex$StdMeshVertex(lhs, rhs) {
  let vtx = lhs.$clone();
  op_addAssign$rStdMeshVertex$StdMeshVertex(vtx, rhs);
  return vtx;
}

export function op_mul$f32$StdMeshVertex(lhs, rhs) {
  let vtx = new StdMeshVertex().init();
  vtx.nx = Math.fround(lhs * rhs.nx);
  vtx.ny = Math.fround(lhs * rhs.ny);
  vtx.nz = Math.fround(lhs * rhs.nz);
  vtx.x = Math.fround(lhs * rhs.x);
  vtx.y = Math.fround(lhs * rhs.y);
  vtx.z = Math.fround(lhs * rhs.z);
  return vtx;
}

export function op_mul$StdMeshVertex$f32(lhs, rhs) {
  return op_mul$f32$StdMeshVertex(rhs, lhs);
}

export function op_mul$StdMeshMatrix$StdMeshVertex(lhs, rhs) {
  let vtx = new StdMeshVertex().init();
  vtx.nx = Math.fround(Math.fround(Math.fround(lhs.op_call$i32$i32$c(0, 0) * rhs.nx) + Math.fround(lhs.op_call$i32$i32$c(0, 1) * rhs.ny)) + Math.fround(lhs.op_call$i32$i32$c(0, 2) * rhs.nz));
  vtx.ny = Math.fround(Math.fround(Math.fround(lhs.op_call$i32$i32$c(1, 0) * rhs.nx) + Math.fround(lhs.op_call$i32$i32$c(1, 1) * rhs.ny)) + Math.fround(lhs.op_call$i32$i32$c(0, 2) * rhs.nz));
  vtx.nz = Math.fround(Math.fround(Math.fround(lhs.op_call$i32$i32$c(2, 0) * rhs.nx) + Math.fround(lhs.op_call$i32$i32$c(2, 1) * rhs.ny)) + Math.fround(lhs.op_call$i32$i32$c(2, 2) * rhs.nz));
  vtx.x = Math.fround(Math.fround(Math.fround(Math.fround(lhs.op_call$i32$i32$c(0, 0) * rhs.x) + Math.fround(lhs.op_call$i32$i32$c(0, 1) * rhs.y)) + Math.fround(lhs.op_call$i32$i32$c(0, 2) * rhs.z)) + lhs.op_call$i32$i32$c(0, 3));
  vtx.y = Math.fround(Math.fround(Math.fround(Math.fround(lhs.op_call$i32$i32$c(1, 0) * rhs.x) + Math.fround(lhs.op_call$i32$i32$c(1, 1) * rhs.y)) + Math.fround(lhs.op_call$i32$i32$c(1, 2) * rhs.z)) + lhs.op_call$i32$i32$c(1, 3));
  vtx.z = Math.fround(Math.fround(Math.fround(Math.fround(lhs.op_call$i32$i32$c(2, 0) * rhs.x) + Math.fround(lhs.op_call$i32$i32$c(2, 1) * rhs.y)) + Math.fround(lhs.op_call$i32$i32$c(2, 2) * rhs.z)) + lhs.op_call$i32$i32$c(2, 3));
  vtx.u = rhs.u;
  vtx.v = rhs.v;
  return vtx;
}

export function $init(): void {
  StdMeshMatrix.NColumns = 4;
  StdMeshMatrix.NRows = 3;
  StdMeshVertex.MaxBoneWeightCount = 8;
  StdProjectionMatrix.NColumns = 4;
  StdProjectionMatrix.NRows = 4;
}

Object.assign($, { Perspective, Rotate, Scale, StdMeshMatrix, StdMeshQuaternion, StdMeshTransformation, StdMeshVector, StdMeshVertex, StdProjectionMatrix, Translate, op_add$StdMeshMatrix$StdMeshMatrix, op_add$StdMeshQuaternion$StdMeshQuaternion, op_add$StdMeshVector$StdMeshVector, op_add$StdMeshVertex$StdMeshVertex, op_addAssign$rStdMeshQuaternion$StdMeshQuaternion, op_addAssign$rStdMeshVector$StdMeshVector, op_addAssign$rStdMeshVertex$StdMeshVertex, op_div$StdMeshVector$StdMeshVector, op_div$StdMeshVector$f32, op_div$f32$StdMeshVector, op_mul$StdMeshMatrix$StdMeshMatrix, op_mul$StdMeshMatrix$StdMeshVector, op_mul$StdMeshMatrix$StdMeshVertex, op_mul$StdMeshMatrix$f32, op_mul$StdMeshQuaternion$StdMeshQuaternion, op_mul$StdMeshQuaternion$StdMeshVector, op_mul$StdMeshQuaternion$f32, op_mul$StdMeshTransformation$StdMeshTransformation, op_mul$StdMeshVector$StdMeshVector, op_mul$StdMeshVector$f32, op_mul$StdMeshVertex$f32, op_mul$StdProjectionMatrix$StdProjectionMatrix, op_mul$f32$StdMeshMatrix, op_mul$f32$StdMeshQuaternion, op_mul$f32$StdMeshVector, op_mul$f32$StdMeshVertex, op_mulAssign$rStdMeshMatrix$StdMeshMatrix, op_mulAssign$rStdMeshQuaternion$f32, op_mulAssign$rStdMeshVector$f32, op_mulAssign$rStdProjectionMatrix$StdProjectionMatrix, op_neg$StdMeshQuaternion, op_neg$StdMeshVector, op_sub$StdMeshQuaternion$StdMeshQuaternion, op_sub$StdMeshVector$StdMeshVector, op_subAssign });
