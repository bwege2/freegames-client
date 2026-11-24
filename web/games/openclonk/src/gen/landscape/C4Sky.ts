// @ts-nocheck
// OpenClonk 36de799: src/landscape/C4Sky.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { ftoi32, u64 } from '../../rt/int.ts';
import { SeededRandom } from '../../rt/native.ts';
import { P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete, Regex, RegexTokenIterator, StdString, std_back_inserter, std_copy } from '../../rt/std.ts';

export class C4Sky {
  Width = 0;
  Height = 0;
  Modulation = 0;
  BackClr = 0;
  BackClrEnabled = false;
  Surface = null;
  Shader = new $.C4Shader().init();
  ShaderLight = new $.C4Shader().init();
  xdir = new $.C4Fixed();
  ydir = new $.C4Fixed();
  x = new $.C4Fixed();
  y = new $.C4Fixed();
  ParX = 0;
  ParY = 0;
  FadeClr1 = 0;
  FadeClr2 = 0;
  ParallaxMode = 0;

  init() {
    this.Shader = new $.C4Shader().init();
    this.ShaderLight = new $.C4Shader().init();
    this.xdir = new $.C4Fixed();
    this.ydir = new $.C4Fixed();
    this.x = new $.C4Fixed();
    this.y = new $.C4Fixed();
    C4Sky.prototype.Default.call(this);
    return this;
  }

  $dtor() {
    C4Sky.prototype.Clear.call(this);
  }

  Default() {
    this.Width = this.Height = 0;
    this.Surface = null;
    this.x.$assign(this.y.$assign(this.xdir.$assign(this.ydir.op_assign(0))));
    this.Modulation = 0xffffffff;
    this.ParX = this.ParY = 10;
    this.ParallaxMode = 0;
    this.BackClr = 0;
    this.BackClrEnabled = false;
  }

  Init(fSavegame, names = StdString.of(S(""))) {
    if (!fSavegame) {
      this.x.$assign(this.y.$assign(this.xdir.$assign(this.ydir.op_assign(0))));
      this.ParX = this.ParY = 10;
      this.ParallaxMode = 0;
    }
    this.Surface = new $.C4Surface().init$v();
    let loaded = false;
    if (names.empty()) {
      loaded = !!this.Surface.LoadAny$rC4Group$pi8$b$b$i32($.Game.ScenarioFile, S("Sky"), true, true, 3);
    }
    if (!loaded) {
      if (names.empty()) {
        names.assign($.Game.C4S.Landscape.SkyDef);
      }
      if (!('C4Sky$Init$separator' in $)) $.C4Sky$Init$separator = new Regex(S("[,;\\s]+"));
      let parts = [];
      std_copy(new RegexTokenIterator(names.begin(), names.end(), $.C4Sky$Init$separator, -1), new RegexTokenIterator(), std_back_inserter(parts));
      let name = parts[SeededRandom(u64(BigInt($.Game.RandomSeed)), parts.length >>> 0)].$clone();
      if (name.ne(S("Default"))) {
        loaded = !!this.Surface.LoadAny$rC4Group$pi8$b$b$i32($.Game.ScenarioFile, name.c_str(), true, true, 3);
        if (!loaded) {
          loaded = !!this.Surface.LoadAny$rC4GroupSet$pi8$b$b$i32($.GraphicsResource.Files, name.c_str(), true, false, 3);
        }
      }
    }
    if (loaded) {
      this.FadeClr1 = this.FadeClr2 = 0xffffffff;
      switch ($.Game.C4S.Landscape.SkyScrollMode) {
        case 0:
          break;
        case 1:
          this.ParallaxMode = 1;
          this.ParY = 20;
          break;
        case 2:
          this.ParX = this.ParY = 20;
          break;
      }
    }
    if (!loaded) {
      this.SetFadePalette(P($.Game.C4S.Landscape.SkyDefFade, 0));
      $delete(this.Surface);
      this.Surface = null;
    }
    const SkyDefines = [S("OC_SKY"), null];
    if (!$.pDraw.PrepareSpriteShader(this.Shader, S("Sky"), this.Surface != null ? 2 : 0, $.GraphicsResource.Files, P(SkyDefines, 0), null)) {
      return false;
    }
    if (!$.pDraw.PrepareSpriteShader(this.ShaderLight, S("SkyLight"), (this.Surface != null ? 2 : 0) | 8, $.GraphicsResource.Files, P(SkyDefines, 0), null)) {
      return false;
    }
    if (this.Surface == null) {
      return true;
    }
    if (this.Surface != null) {
      const iWdt = [0];
      const iHgt = [0];
      if (this.Surface.GetSurfaceSize(P(iWdt, 0), P(iHgt, 0))) {
        this.Width = iWdt[0];
        this.Height = iHgt[0];
      }
    }
    return true;
  }

  Clear() {
    this.Shader.Clear();
    this.ShaderLight.Clear();
    $delete(this.Surface);
    this.Surface = null;
    this.Modulation = 0xffffffff;
  }

  SetFadePalette(ipColors) {
    if ((((((ipColors.a[ipColors.o + 0] + ipColors.a[ipColors.o + 1] | 0) + ipColors.a[ipColors.o + 2] | 0) + ipColors.a[ipColors.o + 3] | 0) + ipColors.a[ipColors.o + 4] | 0) + ipColors.a[ipColors.o + 5] | 0) === 0) {
      this.FadeClr1 = 0xff1c4099;
      this.FadeClr2 = 0xffc2c6ff;
    } else {
      this.FadeClr1 = (((0xff000000 | ((ipColors.a[ipColors.o + 0] >>> 0 & 255) >>> 0 << 16) >>> 0) >>> 0 | ((ipColors.a[ipColors.o + 1] >>> 0 & 255) >>> 0 << 8) >>> 0) >>> 0 | (ipColors.a[ipColors.o + 2] & 255) >>> 0) >>> 0;
      this.FadeClr2 = (((0xff000000 | ((ipColors.a[ipColors.o + 3] >>> 0 & 255) >>> 0 << 16) >>> 0) >>> 0 | ((ipColors.a[ipColors.o + 4] >>> 0 & 255) >>> 0 << 8) >>> 0) >>> 0 | (ipColors.a[ipColors.o + 5] & 255) >>> 0) >>> 0;
    }
  }

  Draw(cgo) {
    if (this.BackClrEnabled) {
      $.pDraw.DrawBoxDw(cgo.Surface, ftoi32(cgo.X), ftoi32(cgo.Y), ftoi32(Math.fround(cgo.X + cgo.Wdt)), ftoi32(Math.fround(cgo.Y + cgo.Hgt)), this.BackClr >>> 0);
    }
    if (this.Modulation !== 0xffffffff) {
      $.pDraw.ActivateBlitModulation(this.Modulation);
    }
    let call = new $.C4ShaderCall().init($.pDraw.GetFoW() != null ? this.ShaderLight : this.Shader);
    try {
      if (this.Surface != null) {
        let zoom = cgo.Zoom;
        let targetx = cgo.TargetX;
        let targety = cgo.TargetY;
        let parx = Math.fround(10 / Math.fround(this.ParX));
        let pary = Math.fround(10 / Math.fround(this.ParY));
        let par = parx;
        let resultzoom = Math.fround(1 / (1 - Math.fround(par - Math.fround(par / zoom))));
        let rx = Math.fround(Math.fround(Math.fround(Math.fround(Math.fround(1) - parx) * targetx) * resultzoom) + Math.fround($.fixtof(this.x) / Math.fround(Math.fround(parx + zoom) - Math.fround(parx * zoom))));
        let ry = Math.fround(Math.fround(Math.fround(Math.fround(Math.fround(1) - pary) * targety) * resultzoom) + Math.fround($.fixtof(this.y) / Math.fround(Math.fround(pary + zoom) - Math.fround(pary * zoom))));
        let resultx = Math.fround(Math.fround(Math.fround(rx - targetx) * zoom) / resultzoom);
        let resulty = Math.fround(Math.fround(Math.fround(ry - targety) * zoom) / resultzoom);
        let zdsi = new $.ZoomDataStackItem().init$f32(resultzoom);
        try {
          $.pDraw.BlitSurfaceTile(this.Surface, cgo.Surface, cgo.X, cgo.Y, Math.fround(Math.fround(cgo.Wdt * zoom) / resultzoom), Math.fround(Math.fround(cgo.Hgt * zoom) / resultzoom), -resultx, -resulty, call);
        } finally { zdsi && zdsi.$dtor(); }
      } else {
        let dwClr1 = this.GetSkyFadeClr(ftoi32(cgo.TargetY));
        let dwClr2 = this.GetSkyFadeClr(ftoi32(Math.fround(cgo.TargetY + cgo.Hgt)));
        $.pDraw.DrawBoxFade(cgo.Surface, cgo.X, cgo.Y, cgo.Wdt, cgo.Hgt, dwClr1, dwClr1, dwClr2, dwClr2, call);
      }
      if (this.Modulation !== 0xffffffff) {
        $.pDraw.DeactivateBlitModulation();
      }
    } finally { call && call.$dtor(); }
  }

  GetSkyFadeClr(iY) {
    let iPos2 = Math.imul(iY, 256) / $.Landscape.GetHeight() | 0;
    let iPos1 = 256 - iPos2 | 0;
    return ((((Math.imul((this.FadeClr1 & 0xff00ff) >>> 0, iPos1 >>> 0) >>> 0) + (Math.imul((this.FadeClr2 & 0xff00ff) >>> 0, iPos2 >>> 0) >>> 0) >>> 0 & 0xff00ff00) >>> 0 | ((Math.imul((this.FadeClr1 & 65280) >>> 0, iPos1 >>> 0) >>> 0) + (Math.imul((this.FadeClr2 & 65280) >>> 0, iPos2 >>> 0) >>> 0) >>> 0 & 0xff0000) >>> 0) >>> 0 >>> 8 | (this.FadeClr1 & 0xff000000) >>> 0) >>> 0;
  }

  Execute() {
    if (this.Surface == null) {
      return;
    }
    this.x.op_addAssign$C4Fixed(this.xdir);
    this.y.op_addAssign$C4Fixed(this.ydir);
    if (this.x.op_ge$C4Fixed($.itofix$i32(this.Width))) {
      this.x.op_subAssign$C4Fixed($.itofix$i32(this.Width));
    }
    if (this.y.op_ge$C4Fixed($.itofix$i32(this.Height))) {
      this.y.op_subAssign$C4Fixed($.itofix$i32(this.Height));
    }
    if (this.ParallaxMode === 1) {
      this.xdir.$assign($.C4REAL100($.Weather.Wind));
    }
  }

  SetModulation(dwWithClr, dwBackClr) {
    this.Modulation = dwWithClr;
    this.BackClr = dwBackClr | 0;
    this.BackClrEnabled = this.Modulation >>> 24 !== 255 ? true : false;
    return true;
  }

  GetModulation(fBackClr) {
    return fBackClr ? this.BackClr >>> 0 : this.Modulation;
  }

  CompileFunc(pComp) {
    pComp.Value$StdNamingDefaultAdapt$StdCastAdapt$C4Fixed$i32$C4Fixed($.mkNamingAdapt$mStdCastAdapt$C4Fixed$i32$pi8$C4Fixed$b$b($.mkCastIntAdapt$rC4Fixed(this.x), S("X"), $.Fix0$C4Real));
    pComp.Value$StdNamingDefaultAdapt$StdCastAdapt$C4Fixed$i32$C4Fixed($.mkNamingAdapt$mStdCastAdapt$C4Fixed$i32$pi8$C4Fixed$b$b($.mkCastIntAdapt$rC4Fixed(this.y), S("Y"), $.Fix0$C4Real));
    pComp.Value$StdNamingDefaultAdapt$StdCastAdapt$C4Fixed$i32$C4Fixed($.mkNamingAdapt$mStdCastAdapt$C4Fixed$i32$pi8$C4Fixed$b$b($.mkCastIntAdapt$rC4Fixed(this.xdir), S("XDir"), $.Fix0$C4Real));
    pComp.Value$StdNamingDefaultAdapt$StdCastAdapt$C4Fixed$i32$C4Fixed($.mkNamingAdapt$mStdCastAdapt$C4Fixed$i32$pi8$C4Fixed$b$b($.mkCastIntAdapt$rC4Fixed(this.ydir), S("YDir"), $.Fix0$C4Real));
    pComp.Value$StdNamingDefaultAdapt$u32$u32($.mkNamingAdapt$ru32$pi8$u32$b$b(P(this, "Modulation"), S("Modulation"), 0xffffffff));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "ParX"), S("ParX"), 10));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "ParY"), S("ParY"), 10));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "ParallaxMode"), S("ParMode"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "BackClr"), S("BackClr"), 0));
    pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "BackClrEnabled"), S("BackClrEnabled"), false));
  }

  $clone() { return new C4Sky().$assign(this); }
  $assign(o) {
    this.Width = o.Width;
    this.Height = o.Height;
    this.Modulation = o.Modulation;
    this.BackClr = o.BackClr;
    this.BackClrEnabled = o.BackClrEnabled;
    this.Surface = o.Surface;
    this.Shader.$assign(o.Shader);
    this.ShaderLight.$assign(o.ShaderLight);
    this.xdir.$assign(o.xdir);
    this.ydir.$assign(o.ydir);
    this.x.$assign(o.x);
    this.y.$assign(o.y);
    this.ParX = o.ParX;
    this.ParY = o.ParY;
    this.FadeClr1 = o.FadeClr1;
    this.FadeClr2 = o.FadeClr2;
    this.ParallaxMode = o.ParallaxMode;
    return this;
  }
}

export function $init(): void {
}

Object.assign($, { C4Sky });
