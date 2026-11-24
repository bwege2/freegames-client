// @ts-nocheck
// OpenClonk 36de799: src/landscape/C4MapScriptAlgo.cpp, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $throw } from '../../rt/std.ts';

function divD(a, b) {
  return (a / b | 0) - (a % b < 0 ? 1 : 0) | 0;
}

function modD(a, b) {
  return a >= 0 ? a % b : b - (-a | 0) % b | 0;
}

export function QuerySeededRandomField(seed, x, y, scale) {
  return modD(Math.imul(seed ^ Math.imul(x, 214013), 214013) ^ Math.imul(y, 214013), scale);
}

function FnParAlgoInner(algo_par) {
  let algo_layer = algo_par.GetMapScriptLayer();
  if (algo_layer != null) {
    return new $.C4MapScriptAlgoLayer().init$pC4MapScriptLayer(algo_layer);
  }
  switch (algo_par.GetPropertyInt(106 /*P_Algo*/)) {
    case 1:
      return new $.C4MapScriptAlgoLayer().init$pC4PropList(algo_par);
    case 10:
      return new $.C4MapScriptAlgoRndChecker().init(algo_par);
    case 30:
      return new $.C4MapScriptAlgoAnd().init(algo_par);
    case 31:
      return new $.C4MapScriptAlgoOr().init(algo_par);
    case 33:
      return new $.C4MapScriptAlgoXor().init(algo_par);
    case 32:
      return new $.C4MapScriptAlgoNot().init(algo_par);
    case 40:
      return new $.C4MapScriptAlgoOffset().init(algo_par);
    case 41:
      return new $.C4MapScriptAlgoScale().init(algo_par);
    case 42:
      return new $.C4MapScriptAlgoRotate().init(algo_par);
    case 20:
      return new $.C4MapScriptAlgoRect().init(algo_par);
    case 21:
      $.DebugLog(S("WARNING: MAPALGO_Ellipsis is deprecated. Use MAPALGO_Ellipse instead."));
    case 24:
      return new $.C4MapScriptAlgoEllipse().init(algo_par);
    case 22:
      return new $.C4MapScriptAlgoPolygon().init(algo_par);
    case 23:
      return new $.C4MapScriptAlgoLines().init(algo_par);
    case 43:
      return new $.C4MapScriptAlgoTurbulence().init(algo_par);
    case 50:
      return new $.C4MapScriptAlgoBorder().init(algo_par);
    case 51:
      return new $.C4MapScriptAlgoFilter().init(algo_par);
    default:
      $throw(new $.C4AulExecError().init($.FormatString(S("got invalid algo: %d"), algo_par.GetPropertyInt(106 /*P_Algo*/)).getData()));
  }
  return null;
}

export function FnParAlgo(algo_par) {
  if (algo_par == null) {
    return null;
  }
  let inner = FnParAlgoInner(algo_par);
  let material = algo_par.GetPropertyStr(44 /*P_Material*/);
  if (material != null) {
    const fg = [0];
    const bg = [0];
    if (!$.FnParTexCol(material, P(fg, 0), P(bg, 0))) {
      $throw(new $.C4AulExecError().init(S("Invalid Material in map script algorithm.")));
    }
    return new $.C4MapScriptAlgoSetMaterial().init(inner, fg[0], bg[0]);
  }
  return inner;
}

export function $init(): void {
}

Object.assign($, { FnParAlgo, FnParAlgoInner, QuerySeededRandomField, divD, modD });
