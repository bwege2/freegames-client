// @ts-nocheck
// OpenClonk 36de799: src/object/C4Shape.cpp, src/object/C4Shape.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $u64n } from '../../rt/int.ts';
import { c$memcpy } from '../../rt/libc.ts';
import { $bytesView, $fields, $oarr, $oat, $own, $padd, $ta, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $min } from '../../rt/std.ts';
import { C4Rect } from '../lib/C4Rect.ts';

export class C4DensityProvider {

  GetDensity(x, y) {
    return $.GBackDensity(x, y);
  }

  $clone() { return new C4DensityProvider().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class C4Shape extends C4Rect {
  VtxNum = 0;
  VtxX = $ta(Int32Array, 30, [0]);
  VtxY = $ta(Int32Array, 30, [0]);
  VtxCNAT = $ta(Int32Array, 30, [0]);
  VtxFriction = $ta(Int32Array, 30, [0]);
  ContactDensity = 50;
  ContactCNAT = 0;
  ContactCount = 0;
  AttachMat = -1;
  VtxContactCNAT = $ta(Int32Array, 30, [0]);
  VtxContactMat = $ta(Int32Array, 30, [0]);
  iAttachX = 0;
  iAttachY = 0;
  iAttachVtx = 0;

  Default() {
    $.InplaceReconstruct$pC4Shape(this);
  }

  Rotate(angle, update_vertices) {
    if ($.Config.General.DebugRec !== 0) {
      let rc = new $.C4RCRotVtx();
      rc.x = this.x;
      rc.y = this.y;
      rc.wdt = this.Wdt;
      rc.hgt = this.Hgt;
      rc.r = $.fixtoi$C4Fixed(angle);
      for (let i = 0; i < 4; i = i + 1 | 0) {
        rc.VtxX[i] = this.VtxX[i];
        rc.VtxY[i] = this.VtxY[i];
      }
      $.AddDbgRec(140 /*RCT_RotVtx1*/, $bytesView(rc, [["x", 0, "i32", 0], ["y", 4, "i32", 0], ["wdt", 8, "i32", 0], ["hgt", 12, "i32", 0], ["r", 16, "i32", 0], ["VtxX", 20, "i32", 4], ["VtxY", 36, "i32", 4]], 52), 52);
    }
    const rot_matrix = $oarr(4, () => new $.C4Fixed());
    rot_matrix[0].$assign($.Cos(angle));
    rot_matrix[1].$assign($.Sin(angle).op_neg());
    rot_matrix[2].$assign(rot_matrix[1].op_neg());
    rot_matrix[3].$assign(rot_matrix[0]);
    if (update_vertices) {
      for (let cnt = 0; cnt < this.VtxNum; cnt = cnt + 1 | 0) {
        let old_x = this.VtxX[cnt];
        let old_y = this.VtxY[cnt];
        this.VtxX[cnt] = $.fixtoi$C4Fixed(rot_matrix[0].op_mul$i32(old_x).op_add$C4Fixed(rot_matrix[1].op_mul$i32(old_y)));
        this.VtxY[cnt] = $.fixtoi$C4Fixed(rot_matrix[2].op_mul$i32(old_x).op_add$C4Fixed(rot_matrix[3].op_mul$i32(old_y)));
      }
    }
    let new_x = $.fixtoi$C4Fixed(rot_matrix[0].op_mul$i32(this.x).op_add$C4Fixed(rot_matrix[1].op_mul$i32(this.y)));
    let new_y = $.fixtoi$C4Fixed(rot_matrix[2].op_mul$i32(this.x).op_add$C4Fixed(rot_matrix[3].op_mul$i32(this.y)));
    let new_wdt = 0;
    let new_hgt = 0;
    if (rot_matrix[0].op_gt$i32(0)) {
      if (rot_matrix[1].op_gt$i32(0)) {
        new_wdt = $.fixtoi$C4Fixed(rot_matrix[0].op_mul$i32(this.Wdt).op_add$C4Fixed(rot_matrix[1].op_mul$i32(this.Hgt)));
        new_hgt = $.fixtoi$C4Fixed(rot_matrix[1].op_mul$i32(this.Wdt).op_add$C4Fixed(rot_matrix[0].op_mul$i32(this.Hgt)));
        this.x = new_x;
        this.y = new_y - $.fixtoi$C4Fixed(rot_matrix[1].op_mul$i32(this.Wdt)) | 0;
      } else {
        new_wdt = $.fixtoi$C4Fixed(rot_matrix[0].op_mul$i32(this.Wdt).op_sub$C4Fixed(rot_matrix[1].op_mul$i32(this.Hgt)));
        new_hgt = $.fixtoi$C4Fixed(rot_matrix[1].op_neg().op_mul$i32(this.Wdt).op_add$C4Fixed(rot_matrix[0].op_mul$i32(this.Hgt)));
        this.x = new_x + $.fixtoi$C4Fixed(rot_matrix[1].op_mul$i32(this.Hgt)) | 0;
        this.y = new_y;
      }
    } else {
      if (rot_matrix[1].op_gt$i32(0)) {
        new_wdt = $.fixtoi$C4Fixed(rot_matrix[0].op_neg().op_mul$i32(this.Wdt).op_add$C4Fixed(rot_matrix[1].op_mul$i32(this.Hgt)));
        new_hgt = $.fixtoi$C4Fixed(rot_matrix[1].op_mul$i32(this.Wdt).op_sub$C4Fixed(rot_matrix[0].op_mul$i32(this.Hgt)));
        this.x = new_x + $.fixtoi$C4Fixed(rot_matrix[0].op_mul$i32(this.Wdt)) | 0;
        this.y = new_y - new_hgt | 0;
      } else {
        new_wdt = $.fixtoi$C4Fixed(rot_matrix[0].op_neg().op_mul$i32(this.Wdt).op_sub$C4Fixed(rot_matrix[1].op_mul$i32(this.Hgt)));
        new_hgt = $.fixtoi$C4Fixed(rot_matrix[1].op_neg().op_mul$i32(this.Wdt).op_sub$C4Fixed(rot_matrix[0].op_mul$i32(this.Hgt)));
        this.x = new_x - new_wdt | 0;
        this.y = new_y + $.fixtoi$C4Fixed(rot_matrix[0].op_mul$i32(this.Hgt)) | 0;
      }
    }
    this.Wdt = new_wdt;
    this.Hgt = new_hgt;
    if ($.Config.General.DebugRec !== 0) {
      let rc = new $.C4RCRotVtx();
      rc.x = this.x;
      rc.y = this.y;
      rc.wdt = this.Wdt;
      rc.hgt = this.Hgt;
      for (let i = 0; i < 4; i = i + 1 | 0) {
        rc.VtxX[i] = this.VtxX[i];
        rc.VtxY[i] = this.VtxY[i];
      }
      $.AddDbgRec(141 /*RCT_RotVtx2*/, $bytesView(rc, [["x", 0, "i32", 0], ["y", 4, "i32", 0], ["wdt", 8, "i32", 0], ["hgt", 12, "i32", 0], ["r", 16, "i32", 0], ["VtxX", 20, "i32", 4], ["VtxY", 36, "i32", 4]], 52), 52);
    }
  }

  Stretch(iCon, update_vertices) {
    this.x = ScaledByCon(this.x, iCon);
    this.y = ScaledByCon(this.y, iCon);
    this.Wdt = ScaledByCon(this.Wdt, iCon);
    this.Hgt = ScaledByCon(this.Hgt, iCon);
    if (update_vertices) {
      for (let i = 0; i < this.VtxNum; i = i + 1 | 0) {
        this.VtxX[i] = ScaledByCon(this.VtxX[i], iCon);
        this.VtxY[i] = ScaledByCon(this.VtxY[i], iCon);
      }
    }
  }

  Jolt(iCon, update_vertices) {
    this.y = ScaledByCon(this.y, iCon);
    this.Hgt = ScaledByCon(this.Hgt, iCon);
    if (update_vertices) {
      for (let i = 0; i < this.VtxNum; i = i + 1 | 0) {
        this.VtxY[i] = ScaledByCon(this.VtxY[i], iCon);
      }
    }
  }

  GetVertexOutline(rRect) {
    rRect.x = 0;
    rRect.y = 0;
    rRect.Wdt = 0;
    rRect.Hgt = 0;
    for (let i = 0; i < this.VtxNum; i = i + 1 | 0) {
      if (this.VtxX[i] < rRect.x) {
        rRect.Wdt = rRect.Wdt + (rRect.x - this.VtxX[i] | 0) | 0;
        rRect.x = this.VtxX[i];
      } else if (this.VtxX[i] > (rRect.x + rRect.Wdt | 0)) {
        rRect.Wdt = this.VtxX[i] - rRect.x | 0;
      }
      if (this.VtxY[i] < rRect.y) {
        rRect.Hgt = rRect.Hgt + (rRect.y - this.VtxY[i] | 0) | 0;
        rRect.y = this.VtxY[i];
      } else if (this.VtxY[i] > (rRect.y + rRect.Hgt | 0)) {
        rRect.Hgt = this.VtxY[i] - rRect.y | 0;
      }
    }
    rRect.Hgt = rRect.Hgt + (rRect.y - this.y | 0) | 0;
    rRect.y = this.y;
  }

  GetVertexY(iVertex) {
    if (!$.Inside$i32$i32$i32$3(iVertex, 0, this.VtxNum - 1 | 0)) {
      return 0;
    }
    return this.VtxY[iVertex];
  }

  GetVertexX(iVertex) {
    if (!$.Inside$i32$i32$i32$3(iVertex, 0, this.VtxNum - 1 | 0)) {
      return 0;
    }
    return this.VtxX[iVertex];
  }

  GetX() {
    return this.x;
  }

  GetY() {
    return this.y;
  }

  AddVertex(iX, iY) {
    if (this.VtxNum >= 30) {
      return false;
    }
    this.VtxX[this.VtxNum] = iX;
    this.VtxY[this.VtxNum] = iY;
    this.VtxNum = this.VtxNum + 1 | 0;
    return true;
  }

  CheckContact(at_x, at_y) {
    for (let i = 0; i < this.VtxNum; i = i + 1 | 0) {
      if (!((this.VtxCNAT[i] & 64) !== 0)) {
        if (this.CheckTouchableMaterial(at_x + this.VtxX[i] | 0, at_y + this.VtxY[i] | 0, i)) {
          return true;
        }
      }
    }
    return false;
  }

  ContactCheck(at_x, at_y, border_hack_contacts = null, collide_halfvehic = false) {
    this.ContactCNAT = 0;
    this.ContactCount = 0;
    for (let vertex = 0; vertex < this.VtxNum; vertex = vertex + 1 | 0) {
      if (!((this.VtxCNAT[vertex] & 64) !== 0)) {
        this.VtxContactCNAT[vertex] = 0;
        let x = at_x + this.VtxX[vertex] | 0;
        let y = at_y + this.VtxY[vertex] | 0;
        this.VtxContactMat[vertex] = $.GBackMat(x, y);
        if (this.CheckTouchableMaterial(x, y, vertex, collide_halfvehic ? 1 : 0)) {
          this.ContactCNAT |= this.VtxCNAT[vertex];
          this.VtxContactCNAT[vertex] |= 16;
          this.ContactCount = this.ContactCount + 1 | 0;
          if (this.CheckTouchableMaterial(x, y - 1 | 0, vertex, collide_halfvehic ? 1 : 0)) {
            this.VtxContactCNAT[vertex] |= 4;
          }
          if (this.CheckTouchableMaterial(x, y + 1 | 0, vertex, collide_halfvehic ? 1 : 0)) {
            this.VtxContactCNAT[vertex] |= 8;
          }
          if (this.CheckTouchableMaterial(x - 1 | 0, y, vertex, collide_halfvehic ? 1 : 0)) {
            this.VtxContactCNAT[vertex] |= 1;
          }
          if (this.CheckTouchableMaterial(x + 1 | 0, y, vertex, collide_halfvehic ? 1 : 0)) {
            this.VtxContactCNAT[vertex] |= 2;
          }
        }
        if (border_hack_contacts != null) {
          if (x === 0 && this.CheckTouchableMaterial(x - 1 | 0, y, vertex)) {
            border_hack_contacts.a[border_hack_contacts.o] = (border_hack_contacts.a[border_hack_contacts.o] | 1) >>> 0;
          } else if (x === $.Landscape.GetWidth() && this.CheckTouchableMaterial(x + 1 | 0, y, vertex)) {
            border_hack_contacts.a[border_hack_contacts.o] = (border_hack_contacts.a[border_hack_contacts.o] | 2) >>> 0;
          }
        }
      }
    }
    return !(this.ContactCount === 0);
  }

  Attach(cx, cy, cnat_pos) {
    this.AttachMat = -1;
    let xcd = 0;
    let ycd = 0;
    switch (cnat_pos & -225) {
      case 4:
        ycd = -1;
        break;
      case 8:
        ycd = 1;
        break;
      case 1:
        xcd = -1;
        break;
      case 2:
        xcd = 1;
        break;
      default:
        return false;
    }
    let testx = cx.a[cx.o];
    let testy = cy.a[cy.o];
    let increase_distance = true;
    let any_contact = false;
    while ($.Abs$i32(testx - cx.a[cx.o] | 0) < 5 && $.Abs$i32(testy - cy.a[cy.o] | 0) < 5) {
      let found = false;
      for (let i = 0; i < this.VtxNum; i = i + 1 | 0) {
        if ((this.VtxCNAT[i] & cnat_pos) !== 0) {
          let ax = testx + this.VtxX[i] | 0;
          let ay = testy + this.VtxY[i] | 0;
          if (this.CheckTouchableMaterial(ax, ay, i)) {
            found = false;
            break;
          }
          if (this.CheckTouchableMaterial(ax + xcd | 0, ay + ycd | 0, i, ycd)) {
            found = true;
            any_contact = true;
            this.AttachMat = $.GBackMat(ax + xcd | 0, ay + ycd | 0);
            this.iAttachX = ax + xcd | 0;
            this.iAttachY = ay + ycd | 0;
            this.iAttachVtx = i;
          }
        }
      }
      if (found) {
        cx.a[cx.o] = testx;
        cy.a[cy.o] = testy;
        return true;
      }
      testx = cx.a[cx.o] - (testx - cx.a[cx.o] | 0) | 0;
      testy = cy.a[cy.o] - (testy - cy.a[cy.o] | 0) | 0;
      if (increase_distance) {
        testx = testx + xcd | 0;
        testy = testy + ycd | 0;
      }
      increase_distance = !increase_distance;
    }
    return any_contact;
  }

  LineConnect(tx, ty, cvtx, ld, oldx, oldy) {
    if (this.VtxNum < 2) {
      return false;
    }
    if (this.VtxX[cvtx] === tx && this.VtxY[cvtx] === ty) {
      return true;
    }
    const ix = [0];
    const iy = [0];
    if ($.PathFree$i32$i32$i32$i32$pi32$pi32(tx, ty, this.VtxX[cvtx + ld | 0], this.VtxY[cvtx + ld | 0], P(ix, 0), P(iy, 0))) {
      this.VtxX[cvtx] = tx;
      this.VtxY[cvtx] = ty;
      return true;
    } else {
      let found = false;
      let cix = 0;
      let ciy = 0;
      $L_out: {
        for (let irange = 4; irange <= 12; irange = irange + 4 | 0) {
          for (cix = ix[0] - (irange / 2 | 0) | 0; cix <= (ix[0] + irange | 0); cix = cix + irange | 0) {
            for (ciy = iy[0] - (irange / 2 | 0) | 0; ciy <= (iy[0] + irange | 0); ciy = ciy + irange | 0) {
              if ($.PathFree$i32$i32$i32$i32(cix, ciy, tx, ty) && $.PathFree$i32$i32$i32$i32(cix, ciy, this.VtxX[cvtx + ld | 0], this.VtxY[cvtx + ld | 0])) {
                found = true;
                break $L_out;
              }
            }
          }
        }
      }
      if (!found) {
        cix = oldx;
        ciy = oldy;
        if (!$.PathFreeIgnoreVehicle(cix, ciy, tx, ty) || !$.PathFreeIgnoreVehicle(cix, ciy, this.VtxX[cvtx + ld | 0], this.VtxY[cvtx + ld | 0])) {
          return false;
        }
      }
      if (ld > 0) {
        if (!this.InsertVertex(cvtx + 1 | 0, cix, ciy)) {
          return false;
        }
      } else {
        if (!this.InsertVertex(cvtx, cix, ciy)) {
          return false;
        }
        cvtx = cvtx + 1 | 0;
      }
      this.VtxX[cvtx] = tx;
      this.VtxY[cvtx] = ty;
      return true;
    }
    return false;
  }

  InsertVertex(index_position, tx, ty) {
    if ((this.VtxNum + 1 | 0) > 30) {
      return false;
    }
    if (!$.Inside$i32$i32$i32$3(index_position, 0, this.VtxNum)) {
      return false;
    }
    for (let i = this.VtxNum; i > index_position; i = i - 1 | 0) {
      this.VtxX[i] = this.VtxX[i - 1 | 0];
      this.VtxY[i] = this.VtxY[i - 1 | 0];
    }
    this.VtxX[index_position] = tx;
    this.VtxY[index_position] = ty;
    this.VtxNum = this.VtxNum + 1 | 0;
    return true;
  }

  RemoveVertex(index_position) {
    if (!$.Inside$i32$i32$i32$3(index_position, 0, this.VtxNum - 1 | 0)) {
      return false;
    }
    for (let i = index_position; (i + 1 | 0) < this.VtxNum; i = i + 1 | 0) {
      this.VtxX[i] = this.VtxX[i + 1 | 0];
      this.VtxY[i] = this.VtxY[i + 1 | 0];
    }
    this.VtxNum = this.VtxNum - 1 | 0;
    return true;
  }

  CopyFrom(source, copy_vertices, copy_vertices_from_self) {
    if (copy_vertices) {
      this.VtxNum = copy_vertices_from_self ? $min(this.VtxNum, 15) : source.VtxNum;
      let iCopyPos = copy_vertices_from_self ? 15 : 0;
      const vertices_from = copy_vertices_from_self ? this : source;
      c$memcpy(P(this.VtxX, 0), $padd(P(vertices_from.VtxX, 0), iCopyPos), $u64n(this.VtxNum) * 4);
      c$memcpy(P(this.VtxY, 0), $padd(P(vertices_from.VtxY, 0), iCopyPos), $u64n(this.VtxNum) * 4);
      c$memcpy(P(this.VtxCNAT, 0), $padd(P(vertices_from.VtxCNAT, 0), iCopyPos), $u64n(this.VtxNum) * 4);
      c$memcpy(P(this.VtxFriction, 0), $padd(P(vertices_from.VtxFriction, 0), iCopyPos), $u64n(this.VtxNum) * 4);
      c$memcpy(P(this.VtxContactCNAT, 0), $padd(P(vertices_from.VtxContactCNAT, 0), iCopyPos), $u64n(this.VtxNum) * 4);
      c$memcpy(P(this.VtxContactMat, 0), $padd(P(vertices_from.VtxContactMat, 0), iCopyPos), $u64n(this.VtxNum) * 4);
    }
    this.$assign(source);
    this.AttachMat = source.AttachMat;
    this.ContactCNAT = source.ContactCNAT;
    this.ContactCount = source.ContactCount;
  }

  GetBottomVertex() {
    let iMax = -1;
    for (let i = 0; i < this.VtxNum; i = i + 1 | 0) {
      if ((this.VtxCNAT[i] & 8) !== 0) {
        if (iMax === -1 || this.VtxY[i] < this.VtxY[iMax]) {
          iMax = i;
        }
      }
    }
    return iMax;
  }

  GetBottom$v() {
    let b = -0x80000000;
    for (let i = 0; i < this.VtxNum; i = i + 1 | 0) {
      if ((~this.VtxCNAT[i] & 64) !== 0) {
        if (this.VtxY[i] > b) {
          b = this.VtxY[i];
        }
      }
    }
    if (b === -0x80000000) {
      return this.y + this.Hgt | 0;
    }
    return b;
  }

  GetVertexContact(iVertex, dwCheckMask, tx, ty, rDensityProvider = $.DefaultDensityProvider) {
    let contact_bits = 0;
    if (!$.Inside$i32$i32$i32$3(iVertex, 0, this.VtxNum - 1 | 0)) {
      return contact_bits;
    }
    if (dwCheckMask === 0) {
      dwCheckMask = this.VtxCNAT[iVertex] >>> 0;
    }
    tx = tx + this.VtxX[iVertex] | 0;
    ty = ty + this.VtxY[iVertex] | 0;
    if ((~this.VtxCNAT[iVertex] & 64) !== 0) {
      if ((dwCheckMask & 16) >>> 0 !== 0) {
        if (this.CheckTouchableMaterial(tx, ty, iVertex, 0, rDensityProvider)) {
          contact_bits |= 16;
        }
      }
      if ((dwCheckMask & 1) >>> 0 !== 0) {
        if (this.CheckTouchableMaterial(tx - 1 | 0, ty, iVertex, 0, rDensityProvider)) {
          contact_bits |= 1;
        }
      }
      if ((dwCheckMask & 2) >>> 0 !== 0) {
        if (this.CheckTouchableMaterial(tx + 1 | 0, ty, iVertex, 0, rDensityProvider)) {
          contact_bits |= 2;
        }
      }
      if ((dwCheckMask & 4) >>> 0 !== 0) {
        if (this.CheckTouchableMaterial(tx, ty - 1 | 0, iVertex, 0, rDensityProvider)) {
          contact_bits |= 4;
        }
      }
      if ((dwCheckMask & 8) >>> 0 !== 0) {
        if (this.CheckTouchableMaterial(tx, ty + 1 | 0, iVertex, 1, rDensityProvider)) {
          contact_bits |= 8;
        }
      }
    }
    return contact_bits;
  }

  CheckScaleToWalk(x, y) {
    for (let i = 0; i < this.VtxNum; i = i + 1 | 0) {
      if ((this.VtxCNAT[i] & 64) !== 0) {
        continue;
      }
      if ((this.VtxCNAT[i] & 8) !== 0) {
        if (this.CheckTouchableMaterial(x + this.VtxX[i] | 0, (y + this.VtxY[i] | 0) + 1 | 0, i)) {
          return false;
        }
      } else {
        if (this.CheckTouchableMaterial((x + this.VtxX[i] | 0) - 1 | 0, y + this.VtxY[i] | 0, i)) {
          return false;
        }
        if (this.CheckTouchableMaterial((x + this.VtxX[i] | 0) + 1 | 0, y + this.VtxY[i] | 0, i)) {
          return false;
        }
      }
    }
    return true;
  }

  CreateOwnOriginalCopy(source) {
    this.VtxNum = $min(source.VtxNum, 15);
    c$memcpy($padd(P(this.VtxX, 0), 15), P(source.VtxX, 0), $u64n(this.VtxNum) * 4);
    c$memcpy($padd(P(this.VtxY, 0), 15), P(source.VtxY, 0), $u64n(this.VtxNum) * 4);
    c$memcpy($padd(P(this.VtxCNAT, 0), 15), P(source.VtxCNAT, 0), $u64n(this.VtxNum) * 4);
    c$memcpy($padd(P(this.VtxFriction, 0), 15), P(source.VtxFriction, 0), $u64n(this.VtxNum) * 4);
    c$memcpy($padd(P(this.VtxContactCNAT, 0), 15), P(source.VtxContactCNAT, 0), $u64n(this.VtxNum) * 4);
    c$memcpy($padd(P(this.VtxContactMat, 0), 15), P(source.VtxContactMat, 0), $u64n(this.VtxNum) * 4);
  }

  CompileFunc$pStdCompiler$pC4Shape(pComp, default_shape) {
    const ContactDirections = $own([
  ((($o) => ($o.Name = S("CNAT_None"), $o.Val = 0, $o))(new $.StdBitfieldEntry$i32())),
  ((($o) => ($o.Name = S("CNAT_Left"), $o.Val = 1, $o))(new $.StdBitfieldEntry$i32())),
  ((($o) => ($o.Name = S("CNAT_Right"), $o.Val = 2, $o))(new $.StdBitfieldEntry$i32())),
  ((($o) => ($o.Name = S("CNAT_Top"), $o.Val = 4, $o))(new $.StdBitfieldEntry$i32())),
  ((($o) => ($o.Name = S("CNAT_Bottom"), $o.Val = 8, $o))(new $.StdBitfieldEntry$i32())),
  ((($o) => ($o.Name = S("CNAT_Center"), $o.Val = 16, $o))(new $.StdBitfieldEntry$i32())),
  ((($o) => ($o.Name = S("CNAT_MultiAttach"), $o.Val = 32, $o))(new $.StdBitfieldEntry$i32())),
  ((($o) => ($o.Name = S("CNAT_NoCollision"), $o.Val = 64, $o))(new $.StdBitfieldEntry$i32())),
  ((($o) => ($o.Name = S("CNAT_PhaseHalfVehicle"), $o.Val = 128, $o))(new $.StdBitfieldEntry$i32())),
  ((($o) => ($o.Name = null, $o.Val = 0, $o))(new $.StdBitfieldEntry$i32())),
]);
    let fRuntime = !(default_shape == null);
    let default_def_shape = new C4Shape();
    if (default_shape == null) {
      default_shape = default_def_shape;
    }
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Wdt"), S("Width"), default_shape.Wdt));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Hgt"), S("Height"), default_shape.Hgt));
    pComp.Value$StdNamingDefaultAdapt$StdArrayDefaultArrayAdapt$i32$pi32$_IdFuncClass$i32$pi32($.mkNamingAdapt$mStdArrayDefaultArrayAdapt$i32$pi32$_IdFuncClass$i32$pi8$pi32$b$b($.mkArrayAdaptDefArr($fields(this, ["x", "y"]), 2, $fields(default_shape, ["x", "y"])), S("Offset"), $fields(default_shape, ["x", "y"])));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "VtxNum"), S("Vertices"), default_shape.VtxNum));
    pComp.Value$StdNamingDefaultAdapt$StdArrayDefaultArrayAdapt$i32$x$_IdFuncClass$i32$x($.mkNamingAdapt$mStdArrayDefaultArrayAdapt$i32$x$_IdFuncClass$i32$pi8$x$b$b($.mkArrayAdaptDMA(this.VtxX, default_shape.VtxX), S("VertexX"), default_shape.VtxX));
    pComp.Value$StdNamingDefaultAdapt$StdArrayDefaultArrayAdapt$i32$x$_IdFuncClass$i32$x($.mkNamingAdapt$mStdArrayDefaultArrayAdapt$i32$x$_IdFuncClass$i32$pi8$x$b$b($.mkArrayAdaptDMA(this.VtxY, default_shape.VtxY), S("VertexY"), default_shape.VtxY));
    pComp.Value$StdNamingDefaultAdapt$StdArrayDefaultArrayAdapt$i32$x$lambda$x($.mkNamingAdapt$mStdArrayDefaultArrayAdapt$i32$x$lambda$pi8$x$b$b($.mkArrayAdaptDMAM(this.VtxCNAT, default_shape.VtxCNAT, ((elem) => {
  return $.mkBitfieldAdapt$ri32$pStdBitfieldEntry(elem, $oat(ContactDirections, 0));
})), S("VertexCNAT"), default_shape.VtxCNAT));
    pComp.Value$StdNamingDefaultAdapt$StdArrayDefaultArrayAdapt$i32$x$_IdFuncClass$i32$x($.mkNamingAdapt$mStdArrayDefaultArrayAdapt$i32$x$_IdFuncClass$i32$pi8$x$b$b($.mkArrayAdaptDMA(this.VtxFriction, default_shape.VtxFriction), S("VertexFriction"), default_shape.VtxFriction));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "ContactDensity"), S("ContactDensity"), default_shape.ContactDensity));
    if (fRuntime) {
      pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "iAttachX"), S("AttachX"), 0));
      pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "iAttachY"), S("AttachY"), 0));
      pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "iAttachVtx"), S("AttachVtx"), 0));
    }
  }

  CheckTouchableMaterial(x, y, vtx_i, ydir = 0, rDensityProvider = $.DefaultDensityProvider) {
    return rDensityProvider.GetDensity(x, y) >= this.ContactDensity && (ydir > 0 && !((128 & this.VtxCNAT[vtx_i]) !== 0) || !$.IsMCHalfVehicle($.Landscape.GetPix(x, y)));
  }

  $clone() { return new C4Shape().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.VtxNum = o.VtxNum;
    this.VtxX = o.VtxX.slice();
    this.VtxY = o.VtxY.slice();
    this.VtxCNAT = o.VtxCNAT.slice();
    this.VtxFriction = o.VtxFriction.slice();
    this.ContactDensity = o.ContactDensity;
    this.ContactCNAT = o.ContactCNAT;
    this.ContactCount = o.ContactCount;
    this.AttachMat = o.AttachMat;
    this.VtxContactCNAT = o.VtxContactCNAT.slice();
    this.VtxContactMat = o.VtxContactMat.slice();
    this.iAttachX = o.iAttachX;
    this.iAttachY = o.iAttachY;
    this.iAttachVtx = o.iAttachVtx;
    return this;
  }
}

function ScaledByCon(value, con) {
  return Math.imul(value, con) / 100000 | 0;
}


export function $init(): void {
  $.DefaultDensityProvider = new C4DensityProvider();
}

Object.assign($, { C4DensityProvider, C4Shape, ScaledByCon });
