// @ts-nocheck
// OpenClonk 36de799: src/landscape/fow/C4FoWBeam.cpp, src/landscape/fow/C4FoWBeam.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { ftoi32 } from '../../../rt/int.ts';
import { P, S } from '../../../rt/ptr.ts';
import { $ } from '../../../rt/registry.ts';
import { $delete, $min } from '../../../rt/std.ts';

export class C4FoWBeam {
  iLeftX = 0;
  iLeftY = 0;
  iRightX = 0;
  iRightY = 0;
  iLeftEndY = 0;
  iRightEndY = 0;
  iError = 0;
  fDirty = false;
  pNext = null;

  init(iLeftX, iLeftY, iRightX, iRightY) {
    this.iLeftX = iLeftX;
    this.iLeftY = iLeftY;
    this.iRightX = iRightX;
    this.iRightY = iRightY;
    this.iLeftEndY = 0;
    this.iRightEndY = 0;
    this.iError = 0;
    this.fDirty = true;
    this.pNext = null;
    return this;
  }

  isDirty() {
    return this.fDirty;
  }

  isClean() {
    return !this.fDirty;
  }

  getNext() {
    return this.pNext;
  }

  setNext(next) {
    this.pNext = next;
  }

  getLeftX(y) {
    return Math.imul(this.iLeftX, y) / this.iLeftY | 0;
  }

  getRightX(y) {
    return Math.imul(this.iRightX, y) / this.iRightY | 0;
  }

  getLeftXf(y) {
    return Math.fround(Math.fround(Math.imul(this.iLeftX, y)) / Math.fround(this.iLeftY));
  }

  getRightXf(y) {
    return Math.fround(Math.fround(Math.imul(this.iRightX, y)) / Math.fround(this.iRightY));
  }

  getLeftEndY() {
    return this.iLeftEndY;
  }

  getLeftEndX() {
    return this.getLeftX(this.iLeftEndY);
  }

  getLeftEndXf() {
    return this.getLeftXf(this.iLeftEndY);
  }

  getRightEndY() {
    return this.iRightEndY;
  }

  getRightEndX() {
    return this.getRightX(this.iRightEndY);
  }

  getRightEndXf() {
    return this.getRightXf(this.iRightEndY);
  }

  getDesc() {
    return $.FormatString(S("%d:%d@%d:%d%s"), this.getLeftX(1000), this.getRightX(1000), this.getLeftEndY(), this.getRightEndY(), this.fDirty ? S("*") : S(""));
  }

  isLeft(x, y) {
    return Math.imul(this.iLeftX, y) > Math.imul(x, this.iLeftY);
  }

  isRight(x, y) {
    return Math.imul(this.iRightX, y) < Math.imul(x, this.iRightY);
  }

  isInside(x, y) {
    return !this.isLeft(x, y) && !this.isRight(x, y);
  }

  SetLeft(x, y) {
    this.iLeftX = x;
    this.iLeftY = y;
  }

  SetRight(x, y) {
    this.iRightX = x;
    this.iRightY = y;
  }

  MergeRight(x, y) {
    0;
    0;
    let iErr = getDoubleTriangleSurface(this.getLeftEndX(), this.iLeftEndY, this.getRightEndX(), this.iRightEndY, x, y);
    if ((this.iError + iErr | 0) > 10) {
      return false;
    }
    this.iRightX = x;
    this.iRightY = y;
    this.iRightEndY = y;
    this.iError = this.iError + iErr | 0;
    return true;
  }

  MergeLeft(x, y) {
    0;
    0;
    let iErr = Math.fround(getDoubleTriangleSurface(this.getLeftEndX(), this.iLeftEndY, this.getRightEndX(), this.iRightEndY, x, y));
    if (Math.fround(Math.fround(this.iError) + iErr) > Math.fround(10)) {
      return false;
    }
    this.iLeftX = x;
    this.iLeftY = y;
    this.iLeftEndY = y;
    this.iError = ftoi32(Math.fround(Math.fround(this.iError) + iErr));
    return true;
  }

  Split(x, y) {
    0;
    0;
    let pBeam = new C4FoWBeam().init(x, y, this.iRightX, this.iRightY);
    pBeam.Dirty(this.iLeftEndY);
    this.iRightX = x;
    this.iRightY = y;
    pBeam.pNext = this.pNext;
    this.pNext = pBeam;
    return pBeam;
  }

  EliminateRight(x, y) {
    let pElim = this.pNext;
    let pMerge = this.pNext.pNext;
    0;
    0;
    0;
    0;
    let iErr = getDoubleTriangleSurface(this.getLeftEndX(), this.getLeftEndY(), pMerge.getRightEndX(), pMerge.getRightEndY(), x, y);
    iErr = iErr + pMerge.iError | 0;
    if ((this.iError + iErr | 0) > 10) {
      return false;
    }
    this.iRightX = pMerge.iRightX;
    this.iRightY = pMerge.iRightY;
    this.iRightEndY = pMerge.iRightEndY;
    this.pNext = pMerge.pNext;
    this.iError = this.iError + iErr | 0;
    $delete(pElim);
    $delete(pMerge);
    return true;
  }

  MergeDirty() {
    let pWith = this.pNext;
    0;
    0;
    0;
    this.Dirty($min(this.getLeftEndY(), pWith.getLeftEndY()));
    this.iRightX = pWith.iRightX;
    this.iRightY = pWith.iRightY;
    this.pNext = pWith.getNext();
    $delete(pWith);
  }

  Clean(y) {
    this.iLeftEndY = y;
    this.iRightEndY = y;
    this.fDirty = false;
  }

  Dirty(y) {
    this.iLeftEndY = y;
    this.iRightEndY = y;
    this.fDirty = true;
  }

  Prune(y) {
    let fLeft = this.iLeftEndY >= y;
    let fRight = this.iRightEndY >= y;
    if (fLeft && fRight) {
      this.Clean(y);
    } else if (fLeft) {
      this.iLeftEndY = y;
    }
    if (fRight) {
      this.iRightEndY = y;
    }
  }

  CompileFunc(pComp) {
    pComp.Value$StdNamingAdapt$i32($.mkNamingAdapt$ri32$pi8(P(this, "iLeftX"), S("iLeftX")));
    pComp.Value$StdNamingAdapt$i32($.mkNamingAdapt$ri32$pi8(P(this, "iLeftY"), S("iLeftY")));
    pComp.Value$StdNamingAdapt$i32($.mkNamingAdapt$ri32$pi8(P(this, "iRightX"), S("iRightX")));
    pComp.Value$StdNamingAdapt$i32($.mkNamingAdapt$ri32$pi8(P(this, "iRightY"), S("iRightY")));
    pComp.Value$StdNamingAdapt$i32($.mkNamingAdapt$ri32$pi8(P(this, "iLeftEndY"), S("iLeftEndY")));
    pComp.Value$StdNamingAdapt$i32($.mkNamingAdapt$ri32$pi8(P(this, "iRightEndY"), S("iRightEndY")));
    pComp.Value$StdNamingAdapt$i32($.mkNamingAdapt$ri32$pi8(P(this, "iError"), S("iError")));
    pComp.Value$StdNamingAdapt$b($.mkNamingAdapt$rb$pi8(P(this, "fDirty"), S("fDirty")));
  }

  $clone() { return new C4FoWBeam().$assign(this); }
  $assign(o) {
    this.iLeftX = o.iLeftX;
    this.iLeftY = o.iLeftY;
    this.iRightX = o.iRightX;
    this.iRightY = o.iRightY;
    this.iLeftEndY = o.iLeftEndY;
    this.iRightEndY = o.iRightEndY;
    this.iError = o.iError;
    this.fDirty = o.fDirty;
    this.pNext = o.pNext;
    return this;
  }
}


function getDoubleTriangleSurface(x1, y1, x2, y2, x3, y3) {
  let ax = x2 - x1 | 0;
  let ay = y2 - y1 | 0;
  let bx = x3 - x1 | 0;
  let by = y3 - y1 | 0;
  return Math.abs(Math.imul(ax, by) - Math.imul(ay, bx) | 0) | 0;
}

export function $init(): void {
  $.C4FoWMergeThreshold$C4FoWBeam = 10;
}

Object.assign($, { C4FoWBeam, getDoubleTriangleSurface });
