// @ts-nocheck
// OpenClonk 36de799: src/lib/C4Rect.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $u64n, ftoi32 } from '../../rt/int.ts';
import { c$ceilf, c$floorf } from '../../rt/libc.ts';
import { P } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $vpush } from '../../rt/std.ts';

export class FLOAT_RECT {
  left = 0;
  right = 0;
  top = 0;
  bottom = 0;

  $clone() { return new FLOAT_RECT().$assign(this); }
  $assign(o) {
    this.left = o.left;
    this.right = o.right;
    this.top = o.top;
    this.bottom = o.bottom;
    return this;
  }
}

export class C4Rect {
  x = 0;
  y = 0;
  Wdt = 0;
  Hgt = 0;

  Set$i32$i32$i32$i32(iX, iY, iWdt, iHgt) {
    this.x = iX;
    this.y = iY;
    this.Wdt = iWdt;
    this.Hgt = iHgt;
  }

  Default() {
    this.x = this.y = this.Wdt = this.Hgt = 0;
  }

  Overlap(rTarget) {
    if ((this.x + this.Wdt | 0) <= rTarget.x) {
      return false;
    }
    if (this.x >= (rTarget.x + rTarget.Wdt | 0)) {
      return false;
    }
    if ((this.y + this.Hgt | 0) <= rTarget.y) {
      return false;
    }
    if (this.y >= (rTarget.y + rTarget.Hgt | 0)) {
      return false;
    }
    return true;
  }

  Intersect(r2) {
    if (r2.x > this.x) {
      if ((r2.x + r2.Wdt | 0) < (this.x + this.Wdt | 0)) {
        this.x = r2.x;
        this.Wdt = r2.Wdt;
      } else {
        this.Wdt = this.Wdt - (r2.x - this.x | 0) | 0;
        this.x = r2.x;
      }
    } else if ((r2.x + r2.Wdt | 0) < (this.x + this.Wdt | 0)) {
      this.Wdt = (r2.x + r2.Wdt | 0) - this.x | 0;
    }
    if (r2.y > this.y) {
      if ((r2.y + r2.Hgt | 0) < (this.y + this.Hgt | 0)) {
        this.y = r2.y;
        this.Hgt = r2.Hgt;
      } else {
        this.Hgt = this.Hgt - (r2.y - this.y | 0) | 0;
        this.y = r2.y;
      }
    } else if ((r2.y + r2.Hgt | 0) < (this.y + this.Hgt | 0)) {
      this.Hgt = (r2.y + r2.Hgt | 0) - this.y | 0;
    }
    if (this.Wdt < 0) {
      this.Wdt = 0;
    }
    if (this.Hgt < 0) {
      this.Hgt = 0;
    }
  }

  Add(r2) {
    if (r2.Wdt === 0 || r2.Hgt === 0) {
      return;
    }
    if (this.Wdt === 0 || this.Hgt === 0) {
      C4Rect.prototype.$assign.call(this, r2);
      return;
    }
    if (r2.x < this.x) {
      if ((r2.x + r2.Wdt | 0) > (this.x + this.Wdt | 0)) {
        this.x = r2.x;
        this.Wdt = r2.Wdt;
      } else {
        this.Wdt = this.Wdt + (this.x - r2.x | 0) | 0;
        this.x = r2.x;
      }
    } else if ((r2.x + r2.Wdt | 0) > (this.x + this.Wdt | 0)) {
      this.Wdt = (r2.x + r2.Wdt | 0) - this.x | 0;
    }
    if (r2.y < this.y) {
      if ((r2.y + r2.Hgt | 0) > (this.y + this.Hgt | 0)) {
        this.y = r2.y;
        this.Hgt = r2.Hgt;
      } else {
        this.Hgt = this.Hgt + (this.y - r2.y | 0) | 0;
        this.y = r2.y;
      }
    } else if ((r2.y + r2.Hgt | 0) > (this.y + this.Hgt | 0)) {
      this.Hgt = (r2.y + r2.Hgt | 0) - this.y | 0;
    }
  }

  op_eq(r2) {
    return !((this.x - r2.x | 0 | (this.y - r2.y | 0) | (this.Wdt - r2.Wdt | 0) | (this.Hgt - r2.Hgt | 0)) !== 0);
  }

  op_ne(r2) {
    return 0 !== (this.x - r2.x | 0 | (this.y - r2.y | 0) | (this.Wdt - r2.Wdt | 0) | (this.Hgt - r2.Hgt | 0));
  }

  Contains$i32$i32(iX, iY) {
    return iX >= this.x && iX < (this.x + this.Wdt | 0) && iY >= this.y && iY < (this.y + this.Hgt | 0);
  }

  Contains$i32$i32$i32$i32(iX, iY, iWdt, iHgt) {
    return iX >= this.x && (iX + iWdt | 0) < (this.x + this.Wdt | 0) && iY >= this.y && (iY + iHgt | 0) < (this.y + this.Hgt | 0);
  }

  Contains$C4Rect(rect) {
    return this.Contains$i32$i32$i32$i32(rect.x, rect.y, rect.Wdt, rect.Hgt);
  }

  IntersectsLine(iX, iY, iX2, iY2) {
    if (this.Contains$i32$i32(iX, iY)) {
      return true;
    }
    if (this.Contains$i32$i32(iX2, iY2)) {
      return true;
    }
    if (iX < this.x && iX2 < this.x) {
      return false;
    }
    if (iY < this.y && iY2 < this.y) {
      return false;
    }
    if (iX >= (this.x + this.Wdt | 0) && iX2 >= (this.x + this.Wdt | 0)) {
      return false;
    }
    if (iY >= (this.y + this.Hgt | 0) && iY2 >= (this.y + this.Hgt | 0)) {
      return false;
    }
    if (iX === iX2 || iY === iY2) {
      return true;
    }
    let iXI = 0;
    let iYI = 0;
    iXI = iX < this.x ? this.x : this.x + this.Wdt | 0;
    iYI = iY + (Math.imul(iY2 - iY | 0, iXI - iX | 0) / (iX2 - iX | 0) | 0) | 0;
    if (iYI >= this.y && iYI < (this.y + this.Hgt | 0)) {
      return true;
    }
    iYI = iY < this.y ? this.y : this.y + this.Hgt | 0;
    iXI = iX + (Math.imul(iX2 - iX | 0, iYI - iY | 0) / (iY2 - iY | 0) | 0) | 0;
    return iXI >= this.x && iXI < (this.x + this.Wdt | 0);
  }

  Normalize() {
    if (this.Wdt < 0) {
      this.x = this.x + (this.Wdt + 1 | 0) | 0;
      this.Wdt = -this.Wdt | 0;
    }
    if (this.Hgt < 0) {
      this.y = this.y + (this.Hgt + 1 | 0) | 0;
      this.Hgt = -this.Hgt | 0;
    }
  }

  Enlarge$i32$i32(iByX, iByY) {
    this.x = this.x - iByX | 0;
    this.y = this.y - iByY | 0;
    this.Wdt = this.Wdt + Math.imul(2, iByX) | 0;
    this.Hgt = this.Hgt + Math.imul(2, iByY) | 0;
  }

  Enlarge$i32(iBy) {
    this.Enlarge$i32$i32(iBy, iBy);
  }

  GetMiddleX() {
    return this.x + (this.Wdt / 2 | 0) | 0;
  }

  GetMiddleY() {
    return this.y + (this.Hgt / 2 | 0) | 0;
  }

  GetBottom$v$c() {
    return this.y + this.Hgt | 0;
  }

  GetTop() {
    return this.y;
  }

  GetLeft() {
    return this.x;
  }

  GetRight() {
    return this.x + this.Wdt | 0;
  }

  init$i32$i32$i32$i32(tx, ty, twdt, thgt) {
    this.x = 0;
    this.y = 0;
    this.Wdt = 0;
    this.Hgt = 0;
    this.x = tx;
    this.y = ty;
    this.Wdt = twdt;
    this.Hgt = thgt;
    return this;
  }

  init$FLOAT_RECT(rcfOuter) {
    this.x = 0;
    this.y = 0;
    this.Wdt = 0;
    this.Hgt = 0;
    this.x = ftoi32(rcfOuter.left);
    this.y = ftoi32(rcfOuter.top);
    this.Wdt = ftoi32(Math.fround(c$ceilf(rcfOuter.right) - c$floorf(rcfOuter.left)));
    this.Hgt = ftoi32(Math.fround(c$ceilf(rcfOuter.bottom) - c$floorf(rcfOuter.top)));
    return this;
  }

  CompileFunc$pStdCompiler(pComp) {
    pComp.Value$StdDefaultAdapt$i32$i32($.mkDefaultAdapt$ri32$i32(P(this, "x"), 0));
    pComp.Separator();
    pComp.Value$StdDefaultAdapt$i32$i32($.mkDefaultAdapt$ri32$i32(P(this, "y"), 0));
    pComp.Separator();
    pComp.Value$StdDefaultAdapt$i32$i32($.mkDefaultAdapt$ri32$i32(P(this, "Wdt"), 0));
    pComp.Separator();
    pComp.Value$StdDefaultAdapt$i32$i32($.mkDefaultAdapt$ri32$i32(P(this, "Hgt"), 0));
  }

  $clone() { return new C4Rect().$assign(this); }
  $assign(o) {
    this.x = o.x;
    this.y = o.y;
    this.Wdt = o.Wdt;
    this.Hgt = o.Hgt;
    return this;
  }
}

export class C4RectList extends Array {

  AddRect(rNewRect) {
    $vpush(this, rNewRect.$clone());
  }

  RemoveIndexedRect(idx) {
    if (idx < (this.GetCount() - 1 | 0)) {
      this.Get($u64n(idx)).$assign(this.Get(this.GetCount() - 1));
    }
    this.pop();
  }

  Clear() {
    this.length = 0;
  }

  GetCount() {
    return this.length;
  }

  Get(idx) {
    return this[idx];
  }

  ClipByRect(rClip) {
    for (let i = 0; i < this.GetCount(); i = i + 1) {
      let pTarget = this.Get(i);
      if ((rClip.x + rClip.Wdt | 0) <= pTarget.x) {
        continue;
      }
      if ((rClip.y + rClip.Hgt | 0) <= pTarget.y) {
        continue;
      }
      if (rClip.x >= (pTarget.x + pTarget.Wdt | 0)) {
        continue;
      }
      if (rClip.y >= (pTarget.y + pTarget.Hgt | 0)) {
        continue;
      }
      let iSplitCount = 0;
      let iOver = 0;
      let rcThis = pTarget.$clone();
      if ((iOver = ((rcThis.x + rcThis.Wdt | 0) - rClip.x | 0) - rClip.Wdt | 0) > 0) {
        pTarget.x = pTarget.x + (pTarget.Wdt - iOver | 0) | 0;
        pTarget.Wdt = iOver;
        rcThis.Wdt = rcThis.Wdt - iOver | 0;
        iSplitCount = iSplitCount + 1 | 0;
      }
      if ((iOver = ((rcThis.y + rcThis.Hgt | 0) - rClip.y | 0) - rClip.Hgt | 0) > 0) {
        if (iSplitCount !== 0) {
          this.AddRect(rcThis);
          pTarget = this.Get(this.GetCount() - 1);
        }
        pTarget.y = pTarget.y + (pTarget.Hgt - iOver | 0) | 0;
        pTarget.Hgt = iOver;
        rcThis.Hgt = rcThis.Hgt - iOver | 0;
        iSplitCount = iSplitCount + 1 | 0;
      }
      if ((iOver = rClip.x - rcThis.x | 0) > 0) {
        if (iSplitCount !== 0) {
          this.AddRect(rcThis);
          pTarget = this.Get(this.GetCount() - 1);
        }
        pTarget.Wdt = iOver;
        rcThis.Wdt = rcThis.Wdt - iOver | 0;
        rcThis.x = rClip.x;
        iSplitCount = iSplitCount + 1 | 0;
      }
      if ((iOver = rClip.y - rcThis.y | 0) > 0) {
        if (iSplitCount !== 0) {
          this.AddRect(rcThis);
          pTarget = this.Get(this.GetCount() - 1);
        } else {
          iSplitCount = iSplitCount + 1 | 0;
        }
        pTarget.Hgt = iOver;
      }
      if (iSplitCount === 0) {
        this.RemoveIndexedRect(i | 0);
        i = i - 1;
      }
    }
    let fDone = false;
    while (!fDone) {
      fDone = true;
      for (let i$2 = 0, cnt = this.GetCount(); i$2 < cnt && fDone; i$2 = i$2 + 1) {
        const rc1 = this.Get(i$2);
        for (let j = i$2 + 1; j < cnt; j = j + 1) {
          const rc2 = this.Get(j);
          if (rc1.y === rc2.y && rc1.Hgt === rc2.Hgt) {
            if ((rc1.x + rc1.Wdt | 0) === rc2.x) {
              rc1.Wdt = rc1.Wdt + rc2.Wdt | 0;
              this.RemoveIndexedRect(j | 0);
              fDone = false;
              break;
            } else if ((rc2.x + rc2.Wdt | 0) === rc1.x) {
              rc2.Wdt = rc2.Wdt + rc1.Wdt | 0;
              this.RemoveIndexedRect(i$2 | 0);
              fDone = false;
              break;
            }
          } else if (rc1.x === rc2.x && rc1.Wdt === rc2.Wdt) {
            if ((rc1.y + rc1.Hgt | 0) === rc2.y) {
              rc1.Hgt = rc1.Hgt + rc2.Hgt | 0;
              this.RemoveIndexedRect(j | 0);
              fDone = false;
              break;
            } else if ((rc2.y + rc2.Hgt | 0) === rc1.y) {
              rc2.Hgt = rc2.Hgt + rc1.Hgt | 0;
              this.RemoveIndexedRect(i$2 | 0);
              fDone = false;
              break;
            }
          }
        }
      }
    }
  }

  $clone() { return new C4RectList().$assign(this); }
  $assign(o) {
    this.length = 0;
    for (const x of o) this.push(x && x.$clone ? x.$clone() : x);
    return this;
  }
}

export class C4TargetRect extends C4Rect {
  tx = 0;
  ty = 0;

  init$i32$i32$i32$i32$i32$i32(iX, iY, iWdt, iHgt, iTX, iTY) {
    super.init$i32$i32$i32$i32(iX, iY, iWdt, iHgt);
    this.tx = iTX;
    this.ty = iTY;
    return this;
  }

  Set$i32$i32$i32$i32$i32$i32(iX, iY, iWdt, iHgt, iTX, iTY) {
    C4Rect.prototype.Set$i32$i32$i32$i32.call(this, iX, iY, iWdt, iHgt);
    this.tx = iTX;
    this.ty = iTY;
  }

  Default() {
    C4Rect.prototype.Default.call(this);
    this.tx = this.ty = 0;
  }

  ClipBy(rClip) {
    let d = 0;
    if ((d = this.x - rClip.x | 0) < 0) {
      this.Wdt = this.Wdt + d | 0;
      this.x = rClip.x;
    } else {
      this.tx = this.tx + d | 0;
    }
    if ((d = this.y - rClip.y | 0) < 0) {
      this.Hgt = this.Hgt + d | 0;
      this.y = rClip.y;
    } else {
      this.ty = this.ty + d | 0;
    }
    if ((d = ((this.x + this.Wdt | 0) - rClip.x | 0) - rClip.Wdt | 0) > 0) {
      this.Wdt = this.Wdt - d | 0;
    }
    if ((d = ((this.y + this.Hgt | 0) - rClip.y | 0) - rClip.Hgt | 0) > 0) {
      this.Hgt = this.Hgt - d | 0;
    }
    if (this.Wdt <= 0 || this.Hgt <= 0) {
      return false;
    }
    this.tx = this.tx + rClip.tx | 0;
    this.ty = this.ty + rClip.ty | 0;
    return true;
  }

  Set$C4TargetFacet(rSrc) {
    this.x = ftoi32(rSrc.X);
    this.y = ftoi32(rSrc.Y);
    this.Wdt = ftoi32(rSrc.Wdt);
    this.Hgt = ftoi32(rSrc.Hgt);
    this.tx = ftoi32(rSrc.TargetX);
    this.ty = ftoi32(rSrc.TargetY);
  }

  CompileFunc$pStdCompiler(pComp) {
    C4Rect.prototype.CompileFunc$pStdCompiler.call(this, pComp);
    pComp.Separator();
    pComp.Value$StdDefaultAdapt$i32$i32($.mkDefaultAdapt$ri32$i32(P(this, "tx"), 0));
    pComp.Separator();
    pComp.Value$StdDefaultAdapt$i32$i32($.mkDefaultAdapt$ri32$i32(P(this, "ty"), 0));
  }

  $clone() { return new C4TargetRect().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.tx = o.tx;
    this.ty = o.ty;
    return this;
  }
}



export function $init(): void {
  $.Rect0$C4Rect = new C4Rect(); $.Rect0$C4Rect.init$i32$i32$i32$i32(0, 0, 0, 0);
  $.TargetRect0$C4Rect = new C4TargetRect(); $.TargetRect0$C4Rect.init$i32$i32$i32$i32$i32$i32(0, 0, 0, 0, 0, 0);
}

Object.assign($, { C4Rect, C4RectList, C4TargetRect, FLOAT_RECT });
