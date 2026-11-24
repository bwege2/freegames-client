// @ts-nocheck
// OpenClonk 36de799: src/object/C4Movement.cpp, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $minBy } from '../../rt/std.ts';












export function RedirectForce(from, to, tdir) {
  let force_redirected = $minBy($.Abs$C4Fixed(from.$clone()), $.FRedirect$C4Movement, (x, y) => x.op_lt$C4Fixed(y)).$clone();
  from.op_subAssign$C4Fixed(force_redirected.op_mul$i32($.Sign$C4Fixed(from.$clone())));
  to.op_addAssign$C4Fixed(force_redirected.op_mul$i32(tdir));
}

export function ApplyFriction(tval, percent) {
  let ffric = $.FFriction$C4Movement.op_mul$i32(percent).op_div$i32(100);
  if (tval.op_gt$C4Fixed(ffric.op_pos())) {
    tval.op_subAssign$C4Fixed(ffric);
  } else if (tval.op_lt$C4Fixed(ffric.op_neg())) {
    tval.op_addAssign$C4Fixed(ffric);
  } else {
    tval.op_assign(0);
  }
}

export function ContactVtxCNAT(object, cnat_dir) {
  for (let index = 0; index < object.Shape.VtxNum; index = index + 1 | 0) {
    if ((object.Shape.VtxContactCNAT[index] & cnat_dir) !== 0) {
      return true;
    }
  }
  return false;
}

export function ContactVtxWeight(object) {
  for (let index = 0; index < object.Shape.VtxNum; index = index + 1 | 0) {
    if (object.Shape.VtxContactCNAT[index] !== 0) {
      if (object.Shape.VtxX[index] < 0) {
        return -1;
      }
      if (object.Shape.VtxX[index] > 0) {
        return 1;
      }
    }
  }
  return 0;
}

export function ContactVtxFriction(object) {
  for (let index = 0; index < object.Shape.VtxNum; index = index + 1 | 0) {
    if (object.Shape.VtxContactCNAT[index] !== 0) {
      return object.Shape.VtxFriction[index];
    }
  }
  return 0;
}

export function CNATName(cnat) {
  switch (cnat) {
    case 0:
      return S("None");
    case 1:
      return S("Left");
    case 2:
      return S("Right");
    case 4:
      return S("Top");
    case 8:
      return S("Bottom");
    case 16:
      return S("Center");
  }
  return S("Undefined");
}

export function SimFlight(x, y, xdir, ydir, min_density, max_density, iterations) {
  let hit_on_time = true;
  let break_main_loop = false;
  let target_x = 0;
  let target_y = 0;
  let current_x = $.fixtoi$C4Fixed(x);
  let current_y = $.fixtoi$C4Fixed(y);
  let index = iterations.a[iterations.o];
  do {
    if (!((index = index - 1 | 0) !== 0)) {
      hit_on_time = false;
      break;
    }
    if (xdir.op_eq$i32(0) && ydir.op_eq$i32(0) && $.Landscape.GetGravity().op_eq$i32(0)) {
      return false;
    }
    if (ydir.op_le$i32(0) && $.Landscape.GetGravity().op_le$i32(0) && current_y < 0) {
      return false;
    }
    x.op_addAssign$C4Fixed(xdir);
    y.op_addAssign$C4Fixed(ydir);
    target_x = $.fixtoi$C4Fixed(x);
    target_y = $.fixtoi$C4Fixed(y);
    if (!$.Inside$i32$i32$i32$3(target_x, 0, $.Landscape.GetWidth()) || target_y >= $.Landscape.GetHeight()) {
      return false;
    }
    do {
      current_x = current_x + $.Sign$i32(target_x - current_x | 0) | 0;
      current_y = current_y + $.Sign$i32(target_y - current_y | 0) | 0;
      if ($.Inside$i32$i32$i32$3($.GBackDensity(current_x, current_y), min_density, max_density)) {
        break_main_loop = true;
        break;
      }
    } while (current_x !== target_x || current_y !== target_y);
    ydir.op_addAssign$C4Fixed($.Landscape.GetGravity());
  } while (!break_main_loop);
  x.$assign($.itofix$i32(current_x));
  y.$assign($.itofix$i32(current_y));
  iterations.a[iterations.o] = iterations.a[iterations.o] - index | 0;
  return hit_on_time;
}

export function SimFlightHitsLiquid(start_x, start_y, xdir, ydir) {
  if ($.DensityLiquid($.GBackDensity($.fixtoi$C4Fixed(start_x), $.fixtoi$C4Fixed(start_y)))) {
    const temp = [10];
    if (!SimFlight(start_x, start_y, xdir, ydir, 0, 24, P(temp, 0))) {
      return false;
    }
  }
  const temp = [-1];
  if (!SimFlight(start_x, start_y, xdir, ydir, 25, 100, P(temp, 0))) {
    return false;
  }
  return $.GBackLiquid($.fixtoi$C4Fixed(start_x), $.fixtoi$C4Fixed(start_y)) && $.GBackLiquid($.fixtoi$C4Fixed(start_x), $.fixtoi$C4Fixed(start_y) + 9 | 0);
}

export function $init(): void {
  $.FRedirect$C4Movement = $.C4REAL100(50);
  $.FFriction$C4Movement = $.C4REAL100(30);
  $.FixFullCircle$C4Movement = $.itofix$i32(360);
  $.FixHalfCircle$C4Movement = $.FixFullCircle$C4Movement.op_div$i32(2);
  $.FloatFriction = $.C4REAL100(2);
  $.RotateAccel = $.C4REAL100(20);
  $.HitSpeed1 = $.C4REAL100(150);
  $.HitSpeed2 = $.itofix$i32(2);
  $.HitSpeed3 = $.itofix$i32(6);
  $.HitSpeed4 = $.itofix$i32(8);
  $.DefaultGravAccel = $.C4REAL100(20);
}

Object.assign($, { ApplyFriction, CNATName, ContactVtxCNAT, ContactVtxFriction, ContactVtxWeight, RedirectForce, SimFlight, SimFlightHitsLiquid });
