// @ts-nocheck
// OpenClonk 36de799: src/landscape/C4MapScript.cpp, src/landscape/C4MapScript.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { C4PropListNumbered } from '../script/C4PropList.ts';
import { C4ScriptHost } from '../script/C4ScriptHost.ts';
import { $u64n, i64, u64 } from '../../rt/int.ts';
import { Random } from '../../rt/native.ts';
import { $oarr, $oat, $padd, $rd, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete, $filled, $throw, StdPair, StdString, resize, seq_remove } from '../../rt/std.ts';

export class C4MapScriptMatTexMask {
  sky_mask = [];
  tunnel_mask = [];

  UnmaskSpec(spec) {
    if (spec == null || !(spec.GetCStr() != null)) {
      return;
    }
    let cspec = spec.GetCStr();
    let invert = false;
    let bgsky = false;
    let bgtunnel = false;
    let prefix_done = false;
    while (cspec.a[cspec.o] !== 0) {
      switch (cspec.a[cspec.o]) {
        case 126:
          invert = !invert;
          break;
        case 94:
          bgsky = true;
          break;
        case 38:
          bgtunnel = true;
          break;
        default:
          prefix_done = true;
          break;
      }
      if (prefix_done) {
        break;
      }
      cspec = cspec.add(1);
    }
    let mat_mask = $filled(256, () => false);
    if ($.SEqual(cspec, $.DrawFn_Transparent_Name$C4MapScript)) {
      mat_mask[0] = true;
    } else if ($.SEqual(cspec, $.DrawFn_Sky_Name$C4MapScript)) {
      mat_mask[255] = true;
    } else if ($.SEqual(cspec, $.DrawFn_Background_Name$C4MapScript)) {
      for (let i = 1; i < 255; i = i + 1 | 0) {
        if (!$.DensitySemiSolid($.Landscape.GetPixDensity(i & 0xff))) {
          mat_mask[$u64n(i)] = true;
        }
      }
      mat_mask[255] = true;
    } else if ($.SEqual(cspec, $.DrawFn_Liquid_Name$C4MapScript)) {
      for (let i = 1; i < 255; i = i + 1 | 0) {
        if ($.DensityLiquid($.Landscape.GetPixDensity(i & 0xff))) {
          mat_mask[$u64n(i)] = true;
        }
      }
    } else if ($.SEqual(cspec, $.DrawFn_Solid_Name$C4MapScript)) {
      for (let i = 1; i < 255; i = i + 1 | 0) {
        if ($.DensitySolid($.Landscape.GetPixDensity(i & 0xff))) {
          mat_mask[$u64n(i)] = true;
        }
      }
    } else if ($.SEqual(cspec, S("*"))) {
      for (let i = 1; i < 255; i = i + 1 | 0) {
        mat_mask[$u64n(i)] = true;
      }
      mat_mask[255] = true;
    } else {
      if ($.SCharCount(45, cspec) !== 0) {
        let col = $.MapScript.pTexMap.GetIndexMatTex(cspec, null, false);
        if (col !== 0) {
          mat_mask[$u64n(col)] = true;
        }
      } else {
        let mat = $.MapScript.pMatMap.Get(cspec);
        if (mat !== -1) {
          let tex_name = null;
          let col = 0;
          for (let itex = 0; (tex_name = $.MapScript.pTexMap.GetTexture$i32(itex)) != null; itex = itex + 1 | 0) {
            if ((col = $.MapScript.pTexMap.GetIndex(cspec, tex_name, false)) !== 0) {
              mat_mask[$u64n(col)] = true;
            }
          }
        }
      }
    }
    for (let i = 0; i < 256; i = i + 1 | 0) {
      if ((!!mat_mask[$u64n(i)] && (bgsky || !bgtunnel) ? 1 : 0) !== (invert ? 1 : 0)) {
        this.sky_mask[$u64n(i)] = true;
      }
      if ((!!mat_mask[$u64n(i)] && (!bgsky || bgtunnel) ? 1 : 0) !== (invert ? 1 : 0)) {
        this.tunnel_mask[$u64n(i)] = true;
      }
    }
  }

  init$v() {
    this.sky_mask = $filled(256, () => false);
    this.tunnel_mask = $filled(256, () => false);
    return this;
  }

  init$C4Value(spec) {
    this.sky_mask = $filled(256, () => false);
    this.tunnel_mask = $filled(256, () => false);
    C4MapScriptMatTexMask.prototype.Init.call(this, spec);
    return this;
  }

  Init(spec) {
    let arr = spec.getArray();
    if (arr != null) {
      for (let i = 0; i < arr.GetSize(); i = i + 1 | 0) {
        let smask = arr.GetItem(i).getStr();
        if (smask == null) {
          $throw(new $.C4AulExecError().init($.FormatString(S("MatTexMask expected string as %dth element in array."), i).getData()));
        }
        this.UnmaskSpec(smask);
      }
    } else {
      let smask = spec.getStr();
      if (smask != null) {
        this.UnmaskSpec(smask);
      } else {
        if (spec.op_const_void_() != null) {
          $throw(new $.C4AulExecError().init(S("MatTexMask expected string or array of strings.")));
        }
        this.sky_mask = $filled(256, () => true).slice();
        this.tunnel_mask = $filled(256, () => true).slice();
        this.sky_mask[0] = false;
        this.tunnel_mask[0] = false;
      }
    }
  }

  op_call(fg, bg) {
    if (bg === 255) {
      return this.sky_mask[fg];
    } else {
      return this.tunnel_mask[fg];
    }
  }

  $clone() { return new C4MapScriptMatTexMask().$assign(this); }
  $assign(o) {
    this.sky_mask = o.sky_mask.slice();
    this.tunnel_mask = o.tunnel_mask.slice();
    return this;
  }
}

export class C4MapScriptAlgo {

  GetXYProps(props, k, out_xy, zero_defaults) {
    if (!props.HasProperty($oat($.Strings.P, k))) {
      if (zero_defaults) {
        out_xy.a[out_xy.o + 0] = out_xy.a[out_xy.o + 1] = 0;
      }
      return false;
    }
    let val = new $.C4Value().init$v();
    let arr = null;
    props.GetProperty(k, val);
    if ((arr = val.getArray()) != null) {
      if (arr.GetSize() !== 2) {
        $throw(new $.C4AulExecError().init($.FormatString(S("C4MapScriptAlgo: Expected either integer or array with two integer elements in property \"%s\"."), $.Strings.P[k].GetCStr()).getData()));
      }
      out_xy.a[out_xy.o + 0] = arr.GetItem(0).getInt();
      out_xy.a[out_xy.o + 1] = arr.GetItem(1).getInt();
    } else {
      out_xy.a[out_xy.o + 0] = out_xy.a[out_xy.o + 1] = val.getInt();
    }
    return true;
  }

  $clone() { return new C4MapScriptAlgo().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class C4MapScriptAlgoPolygon$Pt {
  static $layout = [["x", 0, "i32", 0], ["y", 4, "i32", 0]];
  static $size = 8;
  x = 0;
  y = 0;

  $clone() { return new C4MapScriptAlgoPolygon$Pt().$assign(this); }
  $assign(o) {
    this.x = o.x;
    this.y = o.y;
    return this;
  }
}

export class C4MapScriptAlgoLayer extends C4MapScriptAlgo {
  layer = null;

  init$pC4MapScriptLayer(layer) {
    this.layer = layer;
    return this;
  }

  init$pC4PropList(props) {
    let layer_pl = props.GetPropertyPropList(107 /*P_Layer*/);
    if (layer_pl == null || !((this.layer = layer_pl.GetMapScriptLayer()) != null)) {
      $throw(new $.C4AulExecError().init(S("C4MapScriptAlgoLayer: Expected layer in \"Layer\" property.")));
    }
    return this;
  }

  op_call(x, y, fg, bg) {
    fg.a[fg.o] = this.layer.GetPix(x, y, 0);
    bg.a[bg.o] = this.layer.GetBackPix(x, y, 0);
    return fg.a[fg.o] !== 0 || bg.a[bg.o] !== 0;
  }

  $clone() { return new C4MapScriptAlgoLayer().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.layer = o.layer;
    return this;
  }
}

export class C4MapScriptAlgoRndChecker extends C4MapScriptAlgo {
  seed = 0;
  set_percentage = 0;
  checker_wdt = 0;
  checker_hgt = 0;
  is_fixed_offset = false;

  init(props) {
    this.seed = props.GetPropertyInt(108 /*P_Seed*/);
    if (this.seed === 0) {
      this.seed = Random(65536) | 0;
    }
    this.set_percentage = $.Clamp$i32$i32$i32(props.GetPropertyInt(109 /*P_Ratio*/), 0, 100);
    if (this.set_percentage === 0) {
      this.set_percentage = 50;
    }
    this.checker_wdt = $.Abs$i32(props.GetPropertyInt(35 /*P_Wdt*/));
    if (this.checker_wdt === 0) {
      this.checker_wdt = 10;
    }
    this.checker_hgt = $.Abs$i32(props.GetPropertyInt(36 /*P_Hgt*/));
    if (this.checker_hgt === 0) {
      this.checker_hgt = 10;
    }
    let is_fixed_offset_v = new $.C4Value().init$v();
    if (props.GetProperty(110 /*P_FixedOffset*/, is_fixed_offset_v)) {
      this.is_fixed_offset = is_fixed_offset_v.getBool();
    } else {
      this.is_fixed_offset = false;
    }
    return this;
  }

  op_call(x, y, _fg, _bg) {
    if (!this.is_fixed_offset) {
      x = x + this.seed % this.checker_wdt | 0;
      y = y + Math.imul(this.seed, 214013) % this.checker_hgt | 0;
    }
    x = $.divD(x, this.checker_wdt);
    y = $.divD(y, this.checker_hgt);
    return $.QuerySeededRandomField(this.seed, x, y, 100) < this.set_percentage;
  }

  $clone() { return new C4MapScriptAlgoRndChecker().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.seed = o.seed;
    this.set_percentage = o.set_percentage;
    this.checker_wdt = o.checker_wdt;
    this.checker_hgt = o.checker_hgt;
    this.is_fixed_offset = o.is_fixed_offset;
    return this;
  }
}

export class C4MapScriptAlgoRect extends C4MapScriptAlgo {
  rect = new $.C4Rect();

  init(props) {
    this.rect = new $.C4Rect();
    this.rect.$assign(new $.C4Rect().init$i32$i32$i32$i32(props.GetPropertyInt(31 /*P_X*/), props.GetPropertyInt(32 /*P_Y*/), props.GetPropertyInt(35 /*P_Wdt*/), props.GetPropertyInt(36 /*P_Hgt*/)));
    return this;
  }

  op_call(x, y, _fg, _bg) {
    return this.rect.Contains$i32$i32(x, y);
  }

  $clone() { return new C4MapScriptAlgoRect().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.rect.$assign(o.rect);
    return this;
  }
}

export class C4MapScriptAlgoEllipse extends C4MapScriptAlgo {
  cx = 0;
  cy = 0;
  wdt = 0;
  hgt = 0;

  init(props) {
    this.cx = props.GetPropertyInt(31 /*P_X*/);
    this.cy = props.GetPropertyInt(32 /*P_Y*/);
    this.wdt = $.Abs$i32(props.GetPropertyInt(35 /*P_Wdt*/));
    this.hgt = $.Abs$i32(props.GetPropertyInt(36 /*P_Hgt*/));
    if (this.wdt === 0) {
      this.wdt = 10;
    }
    if (this.hgt === 0) {
      this.hgt = this.wdt;
    }
    return this;
  }

  op_call(x, y, _fg, _bg) {
    let dx = u64(BigInt($.Abs$i32(Math.imul(this.cx - x | 0, this.hgt))));
    let dy = u64(BigInt($.Abs$i32(Math.imul(this.cy - y | 0, this.wdt))));
    return u64(u64(dx * dx) + u64(dy * dy)) < u64(u64(u64(u64(BigInt(this.wdt)) * u64(BigInt(this.wdt))) * u64(BigInt(this.hgt))) * u64(BigInt(this.hgt)));
  }

  $clone() { return new C4MapScriptAlgoEllipse().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.cx = o.cx;
    this.cy = o.cy;
    this.wdt = o.wdt;
    this.hgt = o.hgt;
    return this;
  }
}

export class C4MapScriptAlgoPolygon extends C4MapScriptAlgo {
  poly = [];
  wdt = 0;
  empty = false;
  open = false;

  init(props) {
    this.poly = [];
    let vptx = new $.C4Value().init$v();
    let vpty = new $.C4Value().init$v();
    props.GetProperty(31 /*P_X*/, vptx);
    props.GetProperty(32 /*P_Y*/, vpty);
    let ptx = vptx.getArray();
    let pty = vpty.getArray();
    if (ptx == null || pty == null || ptx.GetSize() !== pty.GetSize()) {
      $throw(new $.C4AulExecError().init(S("C4MapScriptAlgoPolygon: Expected two equally sized int arrays in properties \"X\" and \"Y\".")));
    }
    resize(this.poly, $u64n(ptx.GetSize()), () => new C4MapScriptAlgoPolygon$Pt());
    for (let i = 0; i < ptx.GetSize(); i = i + 1 | 0) {
      this.poly[$u64n(i)].x = ptx.GetItem(i).getInt();
      this.poly[$u64n(i)].y = pty.GetItem(i).getInt();
    }
    this.wdt = props.GetPropertyInt(35 /*P_Wdt*/);
    if (this.wdt === 0) {
      this.wdt = 1;
    }
    this.empty = !!(props.GetPropertyInt(116 /*P_Empty*/) !== 0);
    this.open = !!(props.GetPropertyInt(117 /*P_Open*/) !== 0);
    if (this.open && !this.empty) {
      $throw(new $.C4AulExecError().init(S("C4MapScriptAlgoPolygon: Only empty polygons may be open.")));
    }
    return this;
  }

  op_call(x, y, _fg, _bg) {
    let crossings = 0;
    for (let i = 0; i < this.poly.length; i = i + 1) {
      let pt1 = this.poly[i].$clone();
      let pt2 = this.poly[(i + 1) % this.poly.length].$clone();
      let pdx = pt2.x - pt1.x | 0;
      let pdy = pt2.y - pt1.y | 0;
      let dx = x - pt1.x | 0;
      let dy = y - pt1.y | 0;
      if (i !== this.poly.length - 1 || !this.open) {
        let d = BigInt(Math.imul(dx, pdy) - Math.imul(dy, pdx) | 0);
        let lsq = Math.imul(pdx, pdx) + Math.imul(pdy, pdy) | 0;
        if (i64(d * d) < BigInt(Math.imul(Math.imul(this.wdt, this.wdt), lsq))) {
          if ($.Inside$i32$i32$i32$3(Math.imul(dx, pdx) + Math.imul(dy, pdy) | 0, 0, lsq)) {
            return true;
          }
        }
      }
      if ((Math.imul(dx, dx) + Math.imul(dy, dy) | 0) < Math.imul(this.wdt, this.wdt)) {
        return true;
      }
      if (!this.empty && (pt1.y <= y ? 1 : 0) !== (pt2.y <= y ? 1 : 0)) {
        crossings = crossings + (dx > (Math.imul(dy, pdx) / pdy | 0) ? 1 : 0) | 0;
      }
    }
    return crossings % 2 === 1;
  }

  $clone() { return new C4MapScriptAlgoPolygon().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.poly = o.poly.slice();
    this.wdt = o.wdt;
    this.empty = o.empty;
    this.open = o.open;
    return this;
  }
}

export class C4MapScriptAlgoLines extends C4MapScriptAlgo {
  lx = 0;
  ly = 0;
  distance = 0;
  ox = 0;
  oy = 0;
  ll = 0n;
  dl = 0n;

  init(props) {
    this.lx = props.GetPropertyInt(31 /*P_X*/);
    this.ly = props.GetPropertyInt(32 /*P_Y*/);
    if (this.lx === 0 && this.ly === 0) {
      $throw(new $.C4AulExecError().init(S("C4MapScriptAlgoLines: Invalid direction vector. Either \"X\" or \"Y\" must be nonzero!")));
    }
    this.ox = props.GetPropertyInt(42 /*P_OffX*/);
    this.oy = props.GetPropertyInt(43 /*P_OffY*/);
    let l = $.Distance(0, 0, this.lx, this.ly);
    this.distance = props.GetPropertyInt(138 /*P_Distance*/);
    if (this.distance === 0) {
      this.distance = l + l | 0;
    }
    this.ll = BigInt(this.lx) * BigInt(this.lx) + BigInt(this.ly) * BigInt(this.ly);
    this.dl = BigInt(this.distance) * BigInt(l);
    return this;
  }

  op_call(x, y, _fg, _bg) {
    let ax = BigInt(x) - BigInt(this.ox);
    let ay = BigInt(y) - BigInt(this.oy);
    let line_pos = i64(i64(ax * BigInt(this.lx)) + i64(ay * BigInt(this.ly))) % this.dl;
    if (line_pos < 0n) {
      line_pos = i64(line_pos + this.dl);
    }
    return line_pos < this.ll;
  }

  $clone() { return new C4MapScriptAlgoLines().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.lx = o.lx;
    this.ly = o.ly;
    this.distance = o.distance;
    this.ox = o.ox;
    this.oy = o.oy;
    this.ll = o.ll;
    this.dl = o.dl;
    return this;
  }
}

export class C4MapScriptAlgoModifier extends C4MapScriptAlgo {
  operands = [];

  init(props, min_ops = 0, max_ops = 0) {
    this.operands = [];
    let vops = new $.C4Value().init$v();
    let n = 0;
    let temp_ops = new $.C4ValueArray();
    props.GetProperty(111 /*P_Op*/, vops);
    let ops = vops.getArray();
    if (ops == null) {
      let op = vops.getPropList();
      if (op != null) {
        temp_ops.SetItem(0, vops);
        ops = temp_ops;
        n = 1;
      }
    } else {
      n = ops.GetSize();
    }
    if (ops == null || n < min_ops || max_ops !== 0 && n > max_ops) {
      $throw(new $.C4AulExecError().init($.FormatString(S("C4MapScriptAlgo: Expected between %d and %d operands in property \"Op\"."), min_ops, max_ops).getData()));
    }
    resize(this.operands, $u64n(n), () => null);
    try {
      for (let i = 0; i < n; i = i + 1 | 0) {
        let new_algo = $.FnParAlgo(ops.GetItem(i).getPropList());
        if (new_algo == null) {
          $throw(new $.C4AulExecError().init($.FormatString(S("C4MapScriptAlgo: Operand %d in property \"Op\" not valid."), i).getData()));
        }
        this.operands[$u64n(i)] = new_algo;
      }
    } catch ($e1) {
      {
        C4MapScriptAlgoModifier.prototype.Clear.call(this);
        $throw($e1);
      }
    }
    return this;
  }

  $dtor() {
    C4MapScriptAlgoModifier.prototype.Clear.call(this);
  }

  Clear() {
    let $t1;
    $t1 = this.operands;
    for (let $i1 = 0; $i1 < $t1.length; $i1++) {
      const operand = P($t1, $i1);
      $delete(operand.a[operand.o]);
    }
    this.operands.length = 0;
  }

  $clone() { return new C4MapScriptAlgoModifier().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.operands = o.operands.slice();
    return this;
  }
}

export class C4MapScriptAlgoSetMaterial extends C4MapScriptAlgo {
  inner = null;
  fg = 0;
  bg = 0;

  init(inner, fg, bg) {
    this.inner = inner;
    this.fg = fg & 0xff;
    this.bg = bg & 0xff;
    0;
    return this;
  }

  $dtor() {
    $delete(this.inner);
  }

  op_call(x, y, fg, bg) {
    let result = this.inner.op_call(x, y, fg, bg);
    fg.a[fg.o] = this.fg;
    bg.a[bg.o] = this.bg;
    return result;
  }

  $clone() { return new C4MapScriptAlgoSetMaterial().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.inner = o.inner;
    this.fg = o.fg;
    this.bg = o.bg;
    return this;
  }
}

export class C4MapScriptAlgoAnd extends C4MapScriptAlgoModifier {

  init(props) {
    super.init(props);
    return this;
  }

  op_call(x, y, fg, bg) {
    let val = false;
    for (const operand of this.operands) {
      if (!(val = operand.op_call(x, y, fg, bg))) {
        return false;
      }
    }
    return val;
  }

  $clone() { return new C4MapScriptAlgoAnd().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class C4MapScriptAlgoOr extends C4MapScriptAlgoModifier {

  init(props) {
    super.init(props);
    return this;
  }

  op_call(x, y, fg, bg) {
    let val = false;
    for (const operand of this.operands) {
      if (val = operand.op_call(x, y, fg, bg)) {
        return val;
      }
    }
    return false;
  }

  $clone() { return new C4MapScriptAlgoOr().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class C4MapScriptAlgoNot extends C4MapScriptAlgoModifier {

  init(props) {
    super.init(props, 1, 1);
    return this;
  }

  op_call(x, y, fg, bg) {
    0;
    return !this.operands[0].op_call(x, y, fg, bg);
  }

  $clone() { return new C4MapScriptAlgoNot().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class C4MapScriptAlgoXor extends C4MapScriptAlgoModifier {

  init(props) {
    super.init(props, 2, 2);
    return this;
  }

  op_call(x, y, fg, bg) {
    0;
    const fg1 = [0];
    const bg1 = [0];
    const fg2 = [0];
    const bg2 = [0];
    let v1 = this.operands[0].op_call(x, y, P(fg1, 0), P(bg1, 0));
    let v2 = this.operands[1].op_call(x, y, P(fg2, 0), P(bg2, 0));
    if (v1 && v2 || !v1 && !v2) {
      return false;
    }
    if (v1) {
      fg.a[fg.o] = fg1[0];
      bg.a[bg.o] = bg1[0];
      return true;
    }
    fg.a[fg.o] = fg2[0];
    bg.a[bg.o] = bg2[0];
    return true;
  }

  $clone() { return new C4MapScriptAlgoXor().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class C4MapScriptAlgoOffset extends C4MapScriptAlgoModifier {
  ox = 0;
  oy = 0;

  init(props) {
    super.init(props, 1, 1);
    this.ox = props.GetPropertyInt(42 /*P_OffX*/);
    this.oy = props.GetPropertyInt(43 /*P_OffY*/);
    return this;
  }

  op_call(x, y, fg, bg) {
    0;
    return this.operands[0].op_call(x - this.ox | 0, y - this.oy | 0, fg, bg);
  }

  $clone() { return new C4MapScriptAlgoOffset().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.ox = o.ox;
    this.oy = o.oy;
    return this;
  }
}

export class C4MapScriptAlgoScale extends C4MapScriptAlgoModifier {
  sx = 0;
  sy = 0;
  cx = 0;
  cy = 0;

  init(props) {
    super.init(props, 1, 1);
    this.sx = props.GetPropertyInt(31 /*P_X*/);
    this.sy = props.GetPropertyInt(32 /*P_Y*/);
    if (this.sx === 0) {
      this.sx = 100;
    }
    if (this.sy === 0) {
      this.sy = 100;
    }
    this.cx = props.GetPropertyInt(42 /*P_OffX*/);
    this.cy = props.GetPropertyInt(43 /*P_OffY*/);
    return this;
  }

  op_call(x, y, fg, bg) {
    0;
    return this.operands[0].op_call(((Math.imul(Math.imul(x - this.cx | 0, 2) + 1 | 0, 50) - (this.sx / 2 | 0) | 0) / this.sx | 0) + this.cx | 0, ((Math.imul(Math.imul(y - this.cy | 0, 2) + 1 | 0, 50) - (this.sy / 2 | 0) | 0) / this.sy | 0) + this.cy | 0, fg, bg);
  }

  $clone() { return new C4MapScriptAlgoScale().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.sx = o.sx;
    this.sy = o.sy;
    this.cx = o.cx;
    this.cy = o.cy;
    return this;
  }
}

export class C4MapScriptAlgoRotate extends C4MapScriptAlgoModifier {
  sr = 0;
  cr = 0;
  ox = 0;
  oy = 0;

  init(props) {
    super.init(props, 1, 1);
    let r = props.GetPropertyInt(112 /*P_R*/);
    this.sr = $.fixtoi$C4Fixed$i32($.Sin($.itofix$i32(r)), 1000);
    this.cr = $.fixtoi$C4Fixed$i32($.Cos($.itofix$i32(r)), 1000);
    this.ox = props.GetPropertyInt(42 /*P_OffX*/);
    this.oy = props.GetPropertyInt(43 /*P_OffY*/);
    return this;
  }

  op_call(x, y, fg, bg) {
    0;
    x = x - this.ox | 0;
    y = y - this.oy | 0;
    return this.operands[0].op_call(((Math.imul(x, this.cr) / 1000 | 0) - (Math.imul(y, this.sr) / 1000 | 0) | 0) + this.ox | 0, ((Math.imul(x, this.sr) / 1000 | 0) + (Math.imul(y, this.cr) / 1000 | 0) | 0) + this.oy | 0, fg, bg);
  }

  $clone() { return new C4MapScriptAlgoRotate().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.sr = o.sr;
    this.cr = o.cr;
    this.ox = o.ox;
    this.oy = o.oy;
    return this;
  }
}

export class C4MapScriptAlgoTurbulence extends C4MapScriptAlgoModifier {
  amp = new Int32Array(2);
  scale = new Int32Array(2);
  seed = 0;
  iterations = 0;

  init(props) {
    super.init(props, 1, 1);
    this.seed = props.GetPropertyInt(108 /*P_Seed*/);
    if (this.seed === 0) {
      this.seed = Random(65536) | 0;
    }
    this.GetXYProps(props, 114 /*P_Amplitude*/, P(this.amp, 0), true);
    this.GetXYProps(props, 113 /*P_Scale*/, P(this.scale, 0), true);
    if (this.scale[0] === 0) {
      this.scale[0] = 10;
    }
    if (this.scale[1] === 0) {
      this.scale[1] = 10;
    }
    if (this.amp[0] === 0 && this.amp[1] === 0) {
      this.amp[0] = this.amp[1] = 10;
    }
    this.iterations = props.GetPropertyInt(115 /*P_Iterations*/);
    if (this.iterations === 0) {
      this.iterations = 2;
    }
    return this;
  }

  op_call(x, y, fg, bg) {
    0;
    const xy = new Int32Array([x, y]);
    for (let iter = 0; iter < this.iterations; iter = iter + 1 | 0) {
      const s = new Int32Array(2);
      const p = new Int32Array(2);
      for (let dim = 0; dim < 2; dim = dim + 1 | 0) {
        s[dim] = $.divD(xy[dim], this.scale[dim]);
        p[dim] = $.modD(xy[dim], this.scale[dim]);
      }
      const a = $oarr(2, () => new Int32Array(2));
      for (let dim = 0; dim < 2; dim = dim + 1 | 0) {
        let aamp = this.amp[dim] / (iter + 1 | 0) | 0;
        if (aamp === 0) {
          continue;
        }
        for (let dx = 0; dx < 2; dx = dx + 1 | 0) {
          for (let dy = 0; dy < 2; dy = dy + 1 | 0) {
            a[dx][dy] = $.QuerySeededRandomField(this.seed + dim | 0, s[0] + dx | 0, s[1] + dy | 0, aamp) - (aamp / 2 | 0) | 0;
          }
        }
        let a_interp = ((Math.imul(Math.imul(a[0][0], this.scale[0] - p[0] | 0), this.scale[1] - p[1] | 0) + Math.imul(Math.imul(a[1][0], p[0]), this.scale[1] - p[1] | 0) | 0) + Math.imul(Math.imul(a[0][1], this.scale[0] - p[0] | 0), p[1]) | 0) + Math.imul(Math.imul(a[1][1], p[0]), p[1]) | 0;
        xy[dim] = xy[dim] + (a_interp / Math.imul(this.scale[0], this.scale[1]) | 0) | 0;
      }
    }
    return this.operands[0].op_call(xy[0], xy[1], fg, bg);
  }

  $clone() { return new C4MapScriptAlgoTurbulence().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.amp = o.amp.slice();
    this.scale = o.scale.slice();
    this.seed = o.seed;
    this.iterations = o.iterations;
    return this;
  }
}

export class C4MapScriptAlgoBorder extends C4MapScriptAlgoModifier {
  left = new Int32Array(2);
  top = new Int32Array(2);
  right = new Int32Array(2);
  bottom = new Int32Array(2);

  ResolveBorderProps(p) {
    let inner = 0;
    let outer = 0;
    for (let i = 0; i < 2; i = i + 1 | 0) {
      if (p.a[p.o + i] > 0) {
        inner = p.a[p.o + i];
      } else if (p.a[p.o + i] < 0) {
        outer = -p.a[p.o + i] | 0;
      }
    }
    p.a[p.o + 0] = inner;
    p.a[p.o + 1] = outer;
  }

  init(props) {
    super.init(props, 1, 1);
    const wdt = new Int32Array([0, 0]);
    let n_borders = 0;
    n_borders = n_borders + (this.GetXYProps(props, 35 /*P_Wdt*/, P(wdt, 0), false) ? 1 : 0) | 0;
    for (let i = 0; i < 2; i = i + 1 | 0) {
      this.left[i] = this.top[i] = this.right[i] = this.bottom[i] = wdt[i];
    }
    n_borders = n_borders + (this.GetXYProps(props, 118 /*P_Left*/, P(this.left, 0), false) ? 1 : 0) | 0;
    n_borders = n_borders + (this.GetXYProps(props, 119 /*P_Top*/, P(this.top, 0), false) ? 1 : 0) | 0;
    n_borders = n_borders + (this.GetXYProps(props, 120 /*P_Right*/, P(this.right, 0), false) ? 1 : 0) | 0;
    n_borders = n_borders + (this.GetXYProps(props, 121 /*P_Bottom*/, P(this.bottom, 0), false) ? 1 : 0) | 0;
    C4MapScriptAlgoBorder.prototype.ResolveBorderProps.call(this, P(this.left, 0));
    C4MapScriptAlgoBorder.prototype.ResolveBorderProps.call(this, P(this.top, 0));
    C4MapScriptAlgoBorder.prototype.ResolveBorderProps.call(this, P(this.right, 0));
    C4MapScriptAlgoBorder.prototype.ResolveBorderProps.call(this, P(this.bottom, 0));
    if (n_borders === 0) {
      this.left[1] = this.top[1] = this.right[1] = this.bottom[1] = 1;
    }
    return this;
  }

  op_call(x, y, fg, bg) {
    const l = this.operands[0];
    let inside = l.op_call(x, y, fg, bg);
    const ymove = [P(this.top, 0), P(this.bottom, 0)];
    const xmove = [P(this.left, 0), P(this.right, 0)];
    const d = new Int32Array([-1, 1]);
    for (let dir = 0; dir < 2; dir = dir + 1 | 0) {
      const fake_fg = [0];
      const fake_bg = [0];
      let hgt = $rd(ymove[((inside ? 1 : 0) !== (dir === 0 ? 1 : 0) ? 1 : 0)], (!inside ? 1 : 0));
      for (let dy = 0; dy < hgt; dy = dy + 1 | 0) {
        if ((inside ? 1 : 0) === (!l.op_call(x, y + Math.imul(d[dir], dy + 1 | 0) | 0, P(fake_fg, 0), P(fake_bg, 0)) ? 1 : 0)) {
          return true;
        }
      }
      let wdt = $rd(xmove[((inside ? 1 : 0) !== (dir === 0 ? 1 : 0) ? 1 : 0)], (!inside ? 1 : 0));
      for (let dx = 0; dx < wdt; dx = dx + 1 | 0) {
        if ((inside ? 1 : 0) === (!l.op_call(x + Math.imul(d[dir], dx + 1 | 0) | 0, y, P(fake_fg, 0), P(fake_bg, 0)) ? 1 : 0)) {
          return true;
        }
      }
    }
    return false;
  }

  $clone() { return new C4MapScriptAlgoBorder().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.left = o.left.slice();
    this.top = o.top.slice();
    this.right = o.right.slice();
    this.bottom = o.bottom.slice();
    return this;
  }
}

export class C4MapScriptAlgoFilter extends C4MapScriptAlgoModifier {
  filter = new C4MapScriptMatTexMask().init$v();

  init(props) {
    super.init(props, 1, 1);
    this.filter = new C4MapScriptMatTexMask().init$v();
    let spec = new $.C4Value().init$v();
    if (!props.GetProperty(122 /*P_Filter*/, spec)) {
      $throw(new $.C4AulExecError().init(S("MapScriptAlgoFilter without Filter property.")));
    }
    this.filter.Init(spec);
    return this;
  }

  op_call(x, y, fg, bg) {
    let col = this.operands[0].op_call(x, y, fg, bg);
    if (!col) {
      fg.a[fg.o] = bg.a[bg.o] = 0;
    }
    return this.filter.op_call(fg.a[fg.o], bg.a[bg.o]);
  }

  $clone() { return new C4MapScriptAlgoFilter().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.filter.$assign(o.filter);
    return this;
  }
}

export class C4MapScriptLayer extends C4PropListNumbered {
  fg_surface = null;
  bg_surface = null;
  map = null;

  init(prototype, map) {
    super.init(prototype);
    this.fg_surface = null;
    this.bg_surface = null;
    this.map = map;
    this.AcquireNumber();
    return this;
  }

  $dtor() {
    C4MapScriptLayer.prototype.ClearSurface.call(this);
    super.$dtor();
  }

  GetMapScriptLayer() {
    return this;
  }

  GetMap() {
    return this.map;
  }

  CreateSurface(wdt, hgt) {
    this.ClearSurface();
    if (wdt <= 0 || hgt <= 0) {
      return false;
    }
    this.fg_surface = new $.CSurface8().init$v();
    this.bg_surface = new $.CSurface8().init$v();
    if (!this.fg_surface.Create(wdt, hgt) || !this.bg_surface.Create(wdt, hgt)) {
      this.ClearSurface();
      return false;
    }
    this.UpdateSurfaceSize();
    return true;
  }

  ClearSurface() {
    this.fg_surface = null;
    this.bg_surface = null;
  }

  SetSurfaces(fg, bg) {
    (this.fg_surface = fg, fg = null);
    (this.bg_surface = bg, bg = null);
    this.UpdateSurfaceSize();
  }

  ReleaseSurfaces() {
    return new StdPair(this.fg_surface, this.bg_surface);
  }

  HasSurface() {
    return this.fg_surface != null && this.fg_surface.Bits != null && this.bg_surface != null && this.bg_surface.Bits != null;
  }

  UpdateSurfaceSize() {
    if (this.fg_surface != null) {
      this.SetProperty(35 /*P_Wdt*/, $.C4VInt(this.fg_surface.Wdt));
      this.SetProperty(36 /*P_Hgt*/, $.C4VInt(this.fg_surface.Hgt));
    }
  }

  GetBounds() {
    return this.fg_surface != null ? new $.C4Rect().init$i32$i32$i32$i32(0, 0, this.fg_surface.Wdt, this.fg_surface.Hgt) : new $.C4Rect();
  }

  GetWdt() {
    return this.fg_surface != null ? this.fg_surface.Wdt : 0;
  }

  GetHgt() {
    return this.fg_surface != null ? this.fg_surface.Hgt : 0;
  }

  GetPix(x, y, outside_col) {
    return !this.HasSurface() || x < 0 || y < 0 || x >= this.fg_surface.Wdt || y >= this.fg_surface.Hgt ? outside_col : this.fg_surface._GetPix(x, y);
  }

  GetBackPix(x, y, outside_col) {
    return !this.HasSurface() || x < 0 || y < 0 || x >= this.bg_surface.Wdt || y >= this.bg_surface.Hgt ? outside_col : this.bg_surface._GetPix(x, y);
  }

  SetPix(x, y, fg, bg) {
    if (!this.HasSurface() || x < 0 || y < 0 || x >= this.bg_surface.Wdt || y >= this.bg_surface.Hgt) {
      return false;
    }
    this.fg_surface._SetPix(x, y, fg);
    this.bg_surface._SetPix(x, y, bg);
    return true;
  }

  IsPixMasked(x, y) {
    return this.GetPix(x, y, 0) !== 0 || this.GetBackPix(x, y, 0) !== 0;
  }

  ConvertSkyToTransparent() {
    if (!this.HasSurface()) {
      return;
    }
    for (let y = 0; y < this.fg_surface.Hgt; y = y + 1 | 0) {
      for (let x = 0; x < this.fg_surface.Wdt; x = x + 1 | 0) {
        if (this.fg_surface._GetPix(x, y) === 255) {
          this.fg_surface._SetPix(x, y, 0);
        }
        if (this.bg_surface._GetPix(x, y) === 255) {
          this.bg_surface._SetPix(x, y, 0);
        }
      }
    }
  }

  GetPixCount(rcBounds, col_mask) {
    if (!this.HasSurface()) {
      return 0;
    }
    0;
    let count = 0;
    for (let y = rcBounds.y; y < (rcBounds.y + rcBounds.Hgt | 0); y = y + 1 | 0) {
      for (let x = rcBounds.x; x < (rcBounds.x + rcBounds.Wdt | 0); x = x + 1 | 0) {
        count = count + (col_mask.op_call(this.fg_surface._GetPix(x, y), this.bg_surface._GetPix(x, y)) ? 1 : 0) | 0;
      }
    }
    return count;
  }

  Fill(fg, bg, rcBounds, algo) {
    const temp_fg = [0];
    const temp_bg = [0];
    if (!this.HasSurface()) {
      return false;
    }
    0;
    for (let y = rcBounds.y; y < (rcBounds.y + rcBounds.Hgt | 0); y = y + 1 | 0) {
      for (let x = rcBounds.x; x < (rcBounds.x + rcBounds.Wdt | 0); x = x + 1 | 0) {
        if (algo == null || algo.op_call(x, y, P(temp_fg, 0), P(temp_bg, 0))) {
          this.fg_surface._SetPix(x, y, fg);
          this.bg_surface._SetPix(x, y, bg);
        }
      }
    }
    return true;
  }

  Blit$C4Rect$pC4MapScriptAlgo(rcBounds, algo) {
    if (!this.HasSurface()) {
      return false;
    }
    0;
    0;
    const fg = [0];
    const bg = [0];
    for (let y = rcBounds.y; y < (rcBounds.y + rcBounds.Hgt | 0); y = y + 1 | 0) {
      for (let x = rcBounds.x; x < (rcBounds.x + rcBounds.Wdt | 0); x = x + 1 | 0) {
        if (algo.op_call(x, y, P(fg, 0), P(bg, 0))) {
          if (fg[0] !== 0) {
            this.fg_surface._SetPix(x, y, fg[0]);
          }
          if (bg[0] !== 0) {
            this.bg_surface._SetPix(x, y, bg[0]);
          }
        }
      }
    }
    return true;
  }

  Blit$pC4MapScriptLayer$C4Rect$C4MapScriptMatTexMask$i32$i32(src, src_rect, col_mask, tx, ty) {
    0;
    if (!this.HasSurface() || !src.HasSurface()) {
      return false;
    }
    let fg = 0;
    let bg = 0;
    for (let y = src_rect.y; y < (src_rect.y + src_rect.Hgt | 0); y = y + 1 | 0) {
      for (let x = src_rect.x; x < (src_rect.x + src_rect.Wdt | 0); x = x + 1 | 0) {
        fg = src.fg_surface._GetPix(x, y);
        bg = src.bg_surface._GetPix(x, y);
        if (col_mask.op_call(fg, bg)) {
          this.fg_surface._SetPix((x - src_rect.x | 0) + tx | 0, (y - src_rect.y | 0) + ty | 0, fg);
          this.bg_surface._SetPix((x - src_rect.x | 0) + tx | 0, (y - src_rect.y | 0) + ty | 0, bg);
        }
      }
    }
    return true;
  }

  FindPos(search_rect, col_mask, out_x, out_y, max_tries) {
    if (!this.HasSurface() || search_rect.Wdt <= 0 || search_rect.Hgt <= 0) {
      return false;
    }
    for (let i = 0; i < max_tries; i = i + 1 | 0) {
      let x = (search_rect.x >>> 0) + Random(search_rect.Wdt >>> 0) >>> 0 | 0;
      let y = (search_rect.y >>> 0) + Random(search_rect.Hgt >>> 0) >>> 0 | 0;
      if (col_mask.op_call(this.fg_surface._GetPix(x, y), this.bg_surface._GetPix(x, y))) {
        out_x.a[out_x.o] = x;
        out_y.a[out_y.o] = y;
        return true;
      }
    }
    let sx = (search_rect.x >>> 0) + Random(search_rect.Wdt >>> 0) >>> 0 | 0;
    let sy = (search_rect.y >>> 0) + Random(search_rect.Hgt >>> 0) >>> 0 | 0;
    for (let x = sx; x < (search_rect.x + search_rect.Wdt | 0); x = x + 1 | 0) {
      if (col_mask.op_call(this.fg_surface._GetPix(x, sy), this.bg_surface._GetPix(x, sy))) {
        out_x.a[out_x.o] = x;
        out_y.a[out_y.o] = sy;
        return true;
      }
    }
    for (let y = sy + 1 | 0; y < (search_rect.y + search_rect.Hgt | 0); y = y + 1 | 0) {
      for (let x = search_rect.x; x < (search_rect.x + search_rect.Wdt | 0); x = x + 1 | 0) {
        if (col_mask.op_call(this.fg_surface._GetPix(x, y), this.bg_surface._GetPix(x, y))) {
          out_x.a[out_x.o] = x;
          out_y.a[out_y.o] = y;
          return true;
        }
      }
    }
    for (let y = search_rect.y; y < sy; y = y + 1 | 0) {
      for (let x = search_rect.x; x < (search_rect.x + search_rect.Wdt | 0); x = x + 1 | 0) {
        if (col_mask.op_call(this.fg_surface._GetPix(x, y), this.bg_surface._GetPix(x, y))) {
          out_x.a[out_x.o] = x;
          out_y.a[out_y.o] = y;
          return true;
        }
      }
    }
    for (let x = search_rect.x; x < sx; x = x + 1 | 0) {
      if (col_mask.op_call(this.fg_surface._GetPix(x, sy), this.bg_surface._GetPix(x, sy))) {
        out_x.a[out_x.o] = x;
        out_y.a[out_y.o] = sy;
        return true;
      }
    }
    return false;
  }

  $clone() { return new C4MapScriptLayer().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.fg_surface = o.fg_surface;
    this.bg_surface = o.bg_surface;
    this.map = o.map;
    return this;
  }
}

export class C4MapScriptHost extends C4ScriptHost {
  LayerPrototype = null;
  MapPrototype = null;
  pTexMap = null;
  pMatMap = null;

  CreateMap() {
    return new C4MapScriptMap().init(this.MapPrototype);
  }

  init() {
    super.init();
    this.LayerPrototype = null;
    this.MapPrototype = null;
    this.pTexMap = null;
    this.pMatMap = null;
    return this;
  }

  $dtor() {
    C4MapScriptHost.prototype.Clear.call(this);
    super.$dtor();
  }

  InitFunctionMap(pEngine) {
    0;
    this.Clear();
    this.LayerPrototype = new $.C4PropListStaticMember().init(null, null, $.Strings.RegString$pi8(S("MapLayer")));
    this.MapPrototype = new $.C4PropListStaticMember().init(this.LayerPrototype, null, $.Strings.RegString$pi8(S("Map")));
    this.LayerPrototype.SetName(S("MapLayer"));
    this.MapPrototype.SetName(S("Map"));
    $.ScriptEngine.RegisterGlobalConstant(S("MapLayer"), $.C4VPropList(this.LayerPrototype));
    $.ScriptEngine.RegisterGlobalConstant(S("Map"), $.C4VPropList(this.MapPrototype));
    $.ScriptEngine.RegisterGlobalConstant(S("MAPALGO_Layer"), $.C4VInt(1));
    $.ScriptEngine.RegisterGlobalConstant(S("MAPALGO_RndChecker"), $.C4VInt(10));
    $.ScriptEngine.RegisterGlobalConstant(S("MAPALGO_And"), $.C4VInt(30));
    $.ScriptEngine.RegisterGlobalConstant(S("MAPALGO_Or"), $.C4VInt(31));
    $.ScriptEngine.RegisterGlobalConstant(S("MAPALGO_Xor"), $.C4VInt(33));
    $.ScriptEngine.RegisterGlobalConstant(S("MAPALGO_Not"), $.C4VInt(32));
    $.ScriptEngine.RegisterGlobalConstant(S("MAPALGO_Scale"), $.C4VInt(41));
    $.ScriptEngine.RegisterGlobalConstant(S("MAPALGO_Rotate"), $.C4VInt(42));
    $.ScriptEngine.RegisterGlobalConstant(S("MAPALGO_Offset"), $.C4VInt(40));
    $.ScriptEngine.RegisterGlobalConstant(S("MAPALGO_Rect"), $.C4VInt(20));
    $.ScriptEngine.RegisterGlobalConstant(S("MAPALGO_Ellipsis"), $.C4VInt(21));
    $.ScriptEngine.RegisterGlobalConstant(S("MAPALGO_Polygon"), $.C4VInt(22));
    $.ScriptEngine.RegisterGlobalConstant(S("MAPALGO_Lines"), $.C4VInt(23));
    $.ScriptEngine.RegisterGlobalConstant(S("MAPALGO_Ellipse"), $.C4VInt(24));
    $.ScriptEngine.RegisterGlobalConstant(S("MAPALGO_Turbulence"), $.C4VInt(43));
    $.ScriptEngine.RegisterGlobalConstant(S("MAPALGO_Border"), $.C4VInt(50));
    $.ScriptEngine.RegisterGlobalConstant(S("MAPALGO_Filter"), $.C4VInt(51));
    this.Reg2List(pEngine);
    this.AddEngineFunctions();
  }

  AddEngineFunctions() {
    let p = this.GetPropList$v();
    $.AddFunc$97(p, S("Draw"), FnLayerDraw);
    $.AddFunc$111(p, S("Blit"), FnLayerBlit);
    $.AddFunc$42(p, S("CreateLayer"), FnCreateLayer);
    $.AddFunc$43(p, S("Duplicate"), FnLayerDuplicate);
    $.AddFunc$168(p, S("GetMaterialTextureIndex"), FnLayerGetMaterialTextureIndex);
    $.AddFunc$170(p, S("GetDefaultBackgroundIndex"), FnLayerGetDefaultBackgroundIndex);
    $.AddFunc$172(p, S("GetPixel"), FnLayerGetPixel);
    $.AddFunc$172(p, S("GetBackPixel"), FnLayerGetBackPixel);
    $.AddFunc$121(p, S("SetPixel"), FnLayerSetPixel);
    $.AddFunc$171(p, S("GetPixelCount"), FnLayerGetPixelCount);
    $.AddFunc$119(p, S("Resize"), FnLayerResize);
    $.AddFunc$112(p, S("FindPosition"), FnLayerFindPosition);
    $.AddFunc$53(p, S("CreateMatTexMask"), FnLayerCreateMatTexMask);
  }

  Load$rC4Group$pi8$pi8$pC4LangStringTable(g, f, l, t) {
    0;
    return $.C4ScriptHost.prototype.Load$rC4Group$pi8$pi8$pC4LangStringTable.call(this, g, f, l, t);
  }

  LoadData(f, d, t) {
    0;
    return $.C4ScriptHost.prototype.LoadData.call(this, f, d, t);
  }

  Clear() {
    $.C4ScriptHost.prototype.Clear.call(this);
    $delete(this.LayerPrototype);
    $delete(this.MapPrototype);
    this.LayerPrototype = this.MapPrototype = null;
  }

  GetPropList$v() {
    return this.LayerPrototype;
  }

  InitializeMap(pLandscape, pTexMap, pMatMap, iPlayerCount, pmap_fg_surface, pmap_bg_surface) {
    let $t1;
    0;
    0;
    this.pTexMap = pTexMap;
    this.pMatMap = pMatMap;
    if (!(this.LayerPrototype.GetFunc$pi8(S("~InitializeMap")) != null)) {
      let scen_proplist = $.GameScript.ScenPropList._getPropList();
      if (scen_proplist == null || !(scen_proplist.GetFunc$pi8(S("~InitializeMap")) != null)) {
        return false;
      }
    }
    let map = this.CreateMap();
    if (pmap_fg_surface.a[pmap_fg_surface.o] != null && pmap_bg_surface.a[pmap_bg_surface.o] != null) {
      map.SetSurfaces(pmap_fg_surface.a[pmap_fg_surface.o], pmap_bg_surface.a[pmap_bg_surface.o]);
    } else {
      0;
      const map_wdt = [0];
      const map_hgt = [0];
      pLandscape.GetMapSize(P(map_wdt, 0), P(map_hgt, 0), iPlayerCount | 0);
      if (!map.CreateSurface(map_wdt[0], map_hgt[0])) {
        return false;
      }
    }
    let Pars = new $.C4AulParSet().init$mC4Value($.C4VPropList(map));
    let result = map.Call$pi8$pC4AulParSet$b(S("~InitializeMap"), Pars.op_and());
    if (result.op_not()) {
      result.$assign($.GameScript.Call(S("~InitializeMap"), Pars.op_and()));
    }
    if (result.op_const_void_() != null) {
      map.ConvertSkyToTransparent();
    }
    ($t1 = map.ReleaseSurfaces(), pmap_fg_surface.a[pmap_fg_surface.o] = $t1.first, pmap_bg_surface.a[pmap_bg_surface.o] = $t1.second);
    return !result.op_not();
  }

  GetLayerPrototype() {
    return this.LayerPrototype;
  }

  $clone() { return new C4MapScriptHost().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.LayerPrototype = o.LayerPrototype;
    this.MapPrototype = o.MapPrototype;
    this.pTexMap = o.pTexMap;
    this.pMatMap = o.pMatMap;
    return this;
  }
}

export class C4MapScriptMap extends C4MapScriptLayer {
  layers = [];

  init(prototype) {
    super.init(prototype, null);
    this.layers = [];
    this.map = this;
    return this;
  }

  $dtor() {
    C4MapScriptMap.prototype.Clear.call(this);
    super.$dtor();
  }

  Clear() {
    let $t1;
    $t1 = this.layers;
    for (let $i1 = 0; $i1 < $t1.length; $i1++) {
      const layer = P($t1, $i1);
      $delete(layer.a[layer.o]);
    }
    this.layers.length = 0;
  }

  GetMapScriptMap() {
    return this;
  }

  CreateLayer(wdt, hgt) {
    let new_layer = new C4MapScriptLayer().init($.MapScript.GetLayerPrototype(), this);
    this.layers.push(new_layer);
    if (!new_layer.CreateSurface(wdt, hgt)) {
      seq_remove(this.layers, new_layer);
      $delete(new_layer);
      return null;
    }
    return new_layer;
  }

  $clone() { return new C4MapScriptMap().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.layers = o.layers.slice();
    return this;
  }
}






export function TexColSingle(mattex, col) {
  if ($.SEqual(mattex, $.DrawFn_Transparent_Name$C4MapScript)) {
    col.a[col.o] = 0;
    return true;
  }
  if ($.SEqual(mattex, $.DrawFn_Sky_Name$C4MapScript)) {
    col.a[col.o] = 255;
    return true;
  }
  col.a[col.o] = $.MapScript.pTexMap.GetIndexMatTex(mattex) & 0xff;
  if (col.a[col.o] === 0) {
    return false;
  }
  return true;
}

export function FnParTexCol(mattex, fg, bg) {
  if (mattex == null || !(mattex.GetCStr() != null)) {
    return false;
  }
  let sep_pos = $.SCharPos(58, mattex.GetCStr());
  if (sep_pos === -1) {
    let cmattex = mattex.GetCStr();
    let ift = true;
    if (cmattex.a[cmattex.o] === 94) {
      ift = false;
      cmattex = cmattex.add(1);
    }
    const col = [0];
    if (!TexColSingle(cmattex, P(col, 0))) {
      return false;
    }
    fg.a[fg.o] = col[0];
    if (ift) {
      bg.a[bg.o] = $.MapScript.pTexMap.DefaultBkgMatTex(fg.a[fg.o]);
    } else {
      bg.a[bg.o] = 255;
    }
    return true;
  } else {
    let cmattex = mattex.GetCStr();
    let fg_mattex = StdString.of(cmattex, $padd(cmattex, sep_pos));
    let bg_mattex = StdString.of($padd($padd(cmattex, sep_pos), 1));
    const fg_col = [0];
    const bg_col = [0];
    if (!TexColSingle(fg_mattex.c_str(), P(fg_col, 0))) {
      return false;
    }
    if (!TexColSingle(bg_mattex.c_str(), P(bg_col, 0))) {
      return false;
    }
    fg.a[fg.o] = fg_col[0];
    bg.a[bg.o] = bg_col[0];
    return true;
  }
}

export function FnParRect(layer, rect, rc_bounds) {
  rc_bounds.$assign(layer.GetBounds());
  if (rect == null) {
    return true;
  }
  if (rect.GetSize() !== 4) {
    return false;
  }
  rc_bounds.Intersect(new $.C4Rect().init$i32$i32$i32$i32(rect.GetItem(0).getInt(), rect.GetItem(1).getInt(), rect.GetItem(2).getInt(), rect.GetItem(3).getInt()));
  return true;
}

function FnLayerDraw(_this, mattex, mask_algo, rect) {
  let layer = _this.GetMapScriptLayer();
  const fg = [0];
  const bg = [0];
  if (layer == null || !FnParTexCol(mattex, P(fg, 0), P(bg, 0))) {
    return false;
  }
  let rcBounds = new $.C4Rect();
  if (!FnParRect(layer, rect, rcBounds)) {
    return false;
  }
  let algo = $.FnParAlgo(mask_algo);
  return layer.Fill(fg[0], bg[0], rcBounds, algo);
}

function FnLayerBlit(_this, mask_algo, rect) {
  let layer = _this.GetMapScriptLayer();
  if (layer == null) {
    return false;
  }
  let rcBounds = new $.C4Rect();
  if (!FnParRect(layer, rect, rcBounds)) {
    return false;
  }
  let algo = $.FnParAlgo(mask_algo);
  if (algo == null) {
    return false;
  }
  return layer.Blit$C4Rect$pC4MapScriptAlgo(rcBounds, algo);
}

function FnCreateLayer(_this, mattex_fill, width, height) {
  const fg = [0];
  const bg = [0];
  if (mattex_fill != null && mattex_fill.GetCStr() != null) {
    if (!FnParTexCol(mattex_fill, P(fg, 0), P(bg, 0))) {
      $throw(new $.C4AulExecError().init($.FormatString(S("CreateLayer: Invalid fill material.")).getData()));
    }
  }
  let layer = _this.GetMapScriptLayer();
  if (layer == null) {
    return null;
  }
  if (width === 0 && height === 0) {
    width = layer.GetWdt();
    height = layer.GetHgt();
  }
  if (width <= 0 || height <= 0) {
    $throw(new $.C4AulExecError().init($.FormatString(S("CreateLayer: Invalid size (%d*%d)."), width, height).getData()));
  }
  let map = layer.GetMap();
  if (map == null) {
    return null;
  }
  layer = map.CreateLayer(width, height);
  if (fg[0] !== 0 || bg[0] !== 0) {
    layer.Fill(fg[0], bg[0], layer.GetBounds(), null);
  }
  return layer;
}

function FnLayerDuplicate(_this, mask_spec, rect) {
  let layer = _this.GetMapScriptLayer();
  if (layer == null) {
    return null;
  }
  let map = layer.GetMap();
  if (map == null) {
    return null;
  }
  let mat_mask = new C4MapScriptMatTexMask().init$C4Value(mask_spec);
  let src_rect = new $.C4Rect();
  if (!FnParRect(layer, rect, src_rect)) {
    return null;
  }
  if (src_rect.Wdt === 0 || src_rect.Hgt === 0) {
    return null;
  }
  let new_layer = map.CreateLayer(src_rect.Wdt, src_rect.Hgt);
  new_layer.Blit$pC4MapScriptLayer$C4Rect$C4MapScriptMatTexMask$i32$i32(layer, src_rect, mat_mask, 0, 0);
  return new_layer;
}

function FnLayerGetMaterialTextureIndex(__this, mattex) {
  if (mattex == null) {
    return -1;
  }
  const col = [0];
  if (!TexColSingle(mattex.GetCStr(), P(col, 0))) {
    return -1;
  }
  return col[0];
}

function FnLayerGetDefaultBackgroundIndex(__this, value) {
  const fg = [0];
  let str = null;
  if ((str = value.getStr()) != null) {
    if (!TexColSingle(str.GetCStr(), P(fg, 0))) {
      return -1;
    }
  } else {
    if (!$.Inside$i32$i32$i32$3(value.getInt(), 0, 255)) {
      return -1;
    }
    fg[0] = value.getInt() & 0xff;
  }
  return $.MapScript.pTexMap.DefaultBkgMatTex(fg[0]);
}

function FnLayerGetPixel(_this, x, y) {
  let layer = _this.GetMapScriptLayer();
  if (layer == null) {
    return 0;
  }
  return layer.GetPix(x, y, 0);
}

function FnLayerGetBackPixel(_this, x, y) {
  let layer = _this.GetMapScriptLayer();
  if (layer == null) {
    return 0;
  }
  return layer.GetBackPix(x, y, 0);
}

function FnLayerSetPixel(_this, x, y, fg_value_c4v, bg_value_c4v) {
  let layer = _this.GetMapScriptLayer();
  if (layer == null) {
    return false;
  }
  const fg = [0];
  const bg = [0];
  if (fg_value_c4v.GetType() === 0) {
    fg[0] = layer.GetPix(x, y, 0);
  } else {
    const val = fg_value_c4v;
    let str = val.getStr();
    if (str != null) {
      if (!TexColSingle(str.GetCStr(), P(fg, 0))) {
        $throw(new $.C4AulExecError().init(S("MapLayer::SetPixel: Trying to set invalid pixel value.")));
      }
    } else {
      if (!$.Inside$i32$i32$i32$3(val.getInt(), 0, 255)) {
        $throw(new $.C4AulExecError().init(S("MapLayer::SetPixel: Trying to set invalid pixel value.")));
      }
      fg[0] = val.getInt() & 0xff;
    }
  }
  if (bg_value_c4v.GetType() === 0) {
    bg[0] = layer.GetBackPix(x, y, 0);
  } else {
    const val = bg_value_c4v;
    let str = val.getStr();
    if (str != null) {
      if (!TexColSingle(str.GetCStr(), P(bg, 0))) {
        $throw(new $.C4AulExecError().init(S("MapLayer::SetPixel: Trying to set invalid pixel value.")));
      }
    } else {
      if (!$.Inside$i32$i32$i32$3(val.getInt(), 0, 255)) {
        $throw(new $.C4AulExecError().init(S("MapLayer::SetPixel: Trying to set invalid pixel value.")));
      }
      bg[0] = val.getInt() & 0xff;
    }
  }
  return layer.SetPix(x, y, fg[0], bg[0]);
}

function FnLayerGetPixelCount(_this, mask_spec, rect) {
  let layer = _this.GetMapScriptLayer();
  if (layer == null) {
    return -1;
  }
  let mat_mask = new C4MapScriptMatTexMask().init$C4Value(mask_spec);
  let check_rect = new $.C4Rect();
  if (!FnParRect(layer, rect, check_rect)) {
    return -1;
  }
  return layer.GetPixCount(check_rect, new C4MapScriptMatTexMask().init$C4Value(mask_spec));
}

function FnLayerResize(_this, new_wdt, new_hgt) {
  let layer = _this.GetMapScriptLayer();
  if (layer == null || new_wdt <= 0 || new_hgt <= 0) {
    return false;
  }
  layer.ClearSurface();
  return layer.CreateSurface(new_wdt, new_hgt);
}

function FnLayerFindPosition(_this, out_pos, mask_spec, rect, max_tries) {
  let layer = _this.GetMapScriptLayer();
  if (layer == null) {
    return false;
  }
  let mat_mask = new C4MapScriptMatTexMask().init$C4Value(mask_spec);
  let search_rect = new $.C4Rect();
  if (!FnParRect(layer, rect, search_rect)) {
    return false;
  }
  const x = [0];
  const y = [0];
  let result = false;
  if (max_tries === 0) {
    max_tries = 500;
  }
  if (result = layer.FindPos(search_rect, mat_mask, P(x, 0), P(y, 0), max_tries)) {
    if (out_pos != null && !out_pos.IsFrozen()) {
      out_pos.SetProperty(31 /*P_X*/, $.C4VInt(x[0]));
      out_pos.SetProperty(32 /*P_Y*/, $.C4VInt(y[0]));
    }
  }
  return result;
}

function FnLayerCreateMatTexMask(__this, mask_spec) {
  let mat_mask = new C4MapScriptMatTexMask().init$C4Value(mask_spec);
  let result = new $.C4ValueArray().init$i32(256);
  for (let i = 0; i < 256; i = i + 1 | 0) {
    result.SetItem(i, $.C4VBool(mat_mask.op_call(i & 0xff, 255)));
  }
  return result;
}


export function $init(): void {
  $.DrawFn_Transparent_Name$C4MapScript = S("Transparent");
  $.DrawFn_Sky_Name$C4MapScript = S("Sky");
  $.DrawFn_Background_Name$C4MapScript = S("Background");
  $.DrawFn_Liquid_Name$C4MapScript = S("Liquid");
  $.DrawFn_Solid_Name$C4MapScript = S("Solid");
  $.MapScript = new C4MapScriptHost(); $.MapScript.init();
}

Object.assign($, { C4MapScriptAlgo, C4MapScriptAlgoAnd, C4MapScriptAlgoBorder, C4MapScriptAlgoEllipse, C4MapScriptAlgoFilter, C4MapScriptAlgoLayer, C4MapScriptAlgoLines, C4MapScriptAlgoModifier, C4MapScriptAlgoNot, C4MapScriptAlgoOffset, C4MapScriptAlgoOr, C4MapScriptAlgoPolygon, C4MapScriptAlgoPolygon$Pt, C4MapScriptAlgoRect, C4MapScriptAlgoRndChecker, C4MapScriptAlgoRotate, C4MapScriptAlgoScale, C4MapScriptAlgoSetMaterial, C4MapScriptAlgoTurbulence, C4MapScriptAlgoXor, C4MapScriptHost, C4MapScriptLayer, C4MapScriptMap, C4MapScriptMatTexMask, FnCreateLayer, FnLayerBlit, FnLayerCreateMatTexMask, FnLayerDraw, FnLayerDuplicate, FnLayerFindPosition, FnLayerGetBackPixel, FnLayerGetDefaultBackgroundIndex, FnLayerGetMaterialTextureIndex, FnLayerGetPixel, FnLayerGetPixelCount, FnLayerResize, FnLayerSetPixel, FnParRect, FnParTexCol, TexColSingle });
