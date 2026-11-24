// @ts-nocheck
// OpenClonk 36de799: src/landscape/C4Weather.cpp, src/landscape/C4Weather.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { ftoi32 } from '../../rt/int.ts';
import { P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';

export class C4Weather {
  static $layout = [["Season", 0, "i32", 0], ["YearSpeed", 4, "i32", 0], ["SeasonDelay", 8, "i32", 0], ["Wind", 12, "i32", 0], ["TargetWind", 16, "i32", 0], ["Temperature", 20, "i32", 0], ["TemperatureRange", 24, "i32", 0], ["Climate", 28, "i32", 0], ["NoGamma", 32, "i32", 0]];
  static $size = 36;
  Season = 0;
  YearSpeed = 0;
  SeasonDelay = 0;
  Wind = 0;
  TargetWind = 0;
  Temperature = 0;
  TemperatureRange = 0;
  Climate = 0;
  NoGamma = 0;

  init() {
    C4Weather.prototype.Default.call(this);
    return this;
  }

  $dtor() {
    C4Weather.prototype.Clear.call(this);
  }

  Default() {
    this.Season = 0;
    this.YearSpeed = 0;
    this.SeasonDelay = 0;
    this.Wind = this.TargetWind = 0;
    this.Temperature = this.Climate = 0;
    this.TemperatureRange = 30;
    this.NoGamma = 1;
  }

  Clear() {
  }

  Execute() {
    if ($.Game.iTick35 === 0) {
      this.SeasonDelay = this.SeasonDelay + this.YearSpeed | 0;
      if (this.SeasonDelay >= 200) {
        this.SeasonDelay = 0;
        this.Season = this.Season + 1 | 0;
        if (this.Season > $.Game.C4S.Weather.StartSeason.Max) {
          this.Season = $.Game.C4S.Weather.StartSeason.Min;
        }
        this.SetSeasonGamma();
      }
    }
    if ($.Game.iTick35 === 0) {
      let iTemperature = this.Climate - $.fixtoi$C4Fixed$i32($.Cos($.itofix$i32$i32(Math.imul(36, this.Season), 10)), this.TemperatureRange) | 0;
      if (this.Temperature < iTemperature) {
        this.Temperature = this.Temperature + 1 | 0;
      } else if (this.Temperature > iTemperature) {
        this.Temperature = this.Temperature - 1 | 0;
      }
    }
    if ($.Game.iTick1000 === 0) {
      this.TargetWind = $.Game.C4S.Weather.Wind.Evaluate();
    }
    if ($.Game.iTick10 === 0) {
      this.Wind = $.Clamp$i32$i32$i32(this.Wind + $.Sign$i32(this.TargetWind - this.Wind | 0) | 0, $.Game.C4S.Weather.Wind.Min, $.Game.C4S.Weather.Wind.Max);
    }
  }

  SetClimate(iClimate) {
    this.Climate = $.Clamp$i32$i32$i32(iClimate, -50, 50);
    this.SetSeasonGamma();
  }

  SetSeason(iSeason) {
    this.Season = $.Clamp$i32$i32$i32(iSeason, 0, 100);
    this.SetSeasonGamma();
  }

  SetTemperature(iTemperature) {
    this.Temperature = $.Clamp$i32$i32$i32(iTemperature, -100, 100);
    this.SetSeasonGamma();
  }

  Init(fScenario) {
    if (fScenario) {
      this.Season = $.Game.C4S.Weather.StartSeason.Evaluate();
      this.YearSpeed = $.Game.C4S.Weather.YearSpeed.Evaluate();
      this.Climate = (100 - $.Game.C4S.Weather.Climate.Evaluate() | 0) - 50 | 0;
      this.Temperature = this.Climate;
      this.Wind = this.TargetWind = $.Game.C4S.Weather.Wind.Evaluate();
      this.NoGamma = $.Game.C4S.Weather.NoGamma ? 1 : 0;
    }
    this.SetSeasonGamma();
  }

  SetWind(iWind) {
    this.Wind = $.Clamp$i32$i32$i32(iWind, -100, 100);
    this.TargetWind = $.Clamp$i32$i32$i32(iWind, -100, 100);
  }

  GetWind(x, y) {
    if ($.Landscape.GetBackPix(x, y) !== 0) {
      return 0;
    }
    return this.Wind;
  }

  GetTemperature() {
    return this.Temperature;
  }

  GetSeason() {
    return this.Season;
  }

  GetClimate() {
    return this.Climate;
  }

  SetSeasonGamma() {
    if (this.NoGamma !== 0) {
      return;
    }
    let iSeason1 = (this.Season / 25 | 0) % 4;
    let iSeason2 = (iSeason1 + 1 | 0) % 4;
    let iSeasonOff1 = $.Clamp$i32$i32$i32(this.Season % 25, 5, 19) - 5 | 0;
    let iSeasonOff2 = 15 - iSeasonOff1 | 0;
    const gamma = new Float32Array([0, 0, 0]);
    for (let iChan = 0; iChan < 3; iChan = iChan + 8 | 0) {
      let c1 = $.SeasonColors$C4Weather[iSeason1][iChan];
      let c2 = $.SeasonColors$C4Weather[iSeason2][iChan];
      gamma[iChan] = Math.fround(Math.fround(Math.fround(c1 * Math.fround(iSeasonOff2)) + Math.fround(c2 * Math.fround(iSeasonOff1))) / Math.fround(15));
    }
    $.pDraw.SetGamma(gamma[0], gamma[1], gamma[2], 1);
  }

  CompileFunc(pComp) {
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Season"), S("Season"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "YearSpeed"), S("YearSpeed"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "SeasonDelay"), S("SeasonDelay"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Wind"), S("Wind"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "TargetWind"), S("TargetWind"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Temperature"), S("Temperature"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "TemperatureRange"), S("TemperatureRange"), 30));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Climate"), S("Climate"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "NoGamma"), S("NoGamma"), 0));
    const gamma = new Int32Array(27);
    const gammaDefaults = new Int32Array(27);
    for (let i = 0; i < 9; i = i + 1 | 0) {
      gammaDefaults[Math.imul(i, 3) + 0 | 0] = 100;
      gammaDefaults[Math.imul(i, 3) + 1 | 0] = 100;
      gammaDefaults[Math.imul(i, 3) + 2 | 0] = 100;
      gamma[Math.imul(i, 3) + 0 | 0] = ftoi32(Math.fround($.pDraw.gamma[i][0] * 100));
      gamma[Math.imul(i, 3) + 1 | 0] = ftoi32(Math.fround($.pDraw.gamma[i][1] * 100));
      gamma[Math.imul(i, 3) + 2 | 0] = ftoi32(Math.fround($.pDraw.gamma[i][2] * 100));
    }
    pComp.Value$StdNamingDefaultAdapt$StdArrayAdapt$i32$_IdFuncClass$i32$x($.mkNamingAdapt$mStdArrayAdapt$i32$_IdFuncClass$i32$pi8$x$b$b($.mkArrayAdaptM(gamma), S("Gamma"), gammaDefaults));
    for (let i = 0; i < 9; i = i + 1 | 0) {
      $.pDraw.gamma[i][0] = Math.fround(Math.fround(gamma[Math.imul(i, 3) + 0 | 0]) / 100);
      $.pDraw.gamma[i][1] = Math.fround(Math.fround(gamma[Math.imul(i, 3) + 1 | 0]) / 100);
      $.pDraw.gamma[i][2] = Math.fround(Math.fround(gamma[Math.imul(i, 3) + 2 | 0]) / 100);
    }
  }

  $clone() { return new C4Weather().$assign(this); }
  $assign(o) {
    this.Season = o.Season;
    this.YearSpeed = o.YearSpeed;
    this.SeasonDelay = o.SeasonDelay;
    this.Wind = o.Wind;
    this.TargetWind = o.TargetWind;
    this.Temperature = o.Temperature;
    this.TemperatureRange = o.TemperatureRange;
    this.Climate = o.Climate;
    this.NoGamma = o.NoGamma;
    return this;
  }
}



export function $init(): void {
  $.SeasonColors$C4Weather = [new Float32Array([Math.fround(0.899999976), Math.fround(0.899999976), 1]), new Float32Array([1, Math.fround(1.04999995), Math.fround(0.899999976)]), new Float32Array([1, 1, 1]), new Float32Array([1, Math.fround(0.949999988), Math.fround(0.899999976)])];
  $.Weather = new C4Weather(); $.Weather.init();
}

Object.assign($, { C4Weather });
