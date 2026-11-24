// @ts-nocheck
// OpenClonk 36de799: src/script/C4Script.cpp, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $and64n, $or64n, $shl64n, $shr64n, $u64n } from '../../rt/int.ts';
import { c$acos, c$asin, c$floor, c$isalnum, c$isdigit, c$sqrt } from '../../rt/libc.ts';
import { Random } from '../../rt/native.ts';
import { $oadd, $oat, $oidx, $own, $padd, $peq, $rd, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $iptr, $max, $min, $regex_replace, $regex_search, $rx, $throw, Regex, RegexMatch, StdPair, StdString } from '../../rt/std.ts';

export function FnStringFormat(__this, szFormatPar, Pars, ParCount) {
  let $t1, $t2, $t3, $t4;
  let cPar = 0;
  let StringBuf = new $.StdStrBuf().init$pi8$b(S(""), false);
  let cpFormat = $.FnStringPar(szFormatPar);
  let cpType = null;
  const szField = new Int8Array(20);
  while (cpFormat.a[cpFormat.o] !== 0) {
    while (cpFormat.a[cpFormat.o] !== 0 && cpFormat.a[cpFormat.o] !== 37) {
      StringBuf.AppendChar($rd(($t1 = cpFormat, cpFormat = cpFormat.add(1), $t1)));
    }
    if (cpFormat.a[cpFormat.o] === 37) {
      for (cpType = $padd(cpFormat, 1); cpType.a[cpType.o] !== 0 && (cpType.a[cpType.o] === 43 || cpType.a[cpType.o] === 45 || cpType.a[cpType.o] === 46 || cpType.a[cpType.o] === 35 || cpType.a[cpType.o] === 32 || $.Inside$i8$i8$i8(cpType.a[cpType.o], 48, 57)); cpType = cpType.add(1)) {
      }
      $.SCopy$pi8$pi8$u64(cpFormat, P(szField, 0), $min(19, cpType.o - cpFormat.o + 1 >>> 0));
      switch (cpType.a[cpType.o]) {
        case 100:
        case 120:
        case 88:
          {
            if (cPar >= ParCount) {
              $throw(new $.C4AulExecError().init(S("format placeholder without parameter")));
            }
            StringBuf.AppendFormat(P(szField, 0), $oidx(Pars, ($t2 = cPar, cPar = cPar + 1 | 0, $t2)).getInt());
            cpFormat = cpFormat.add($.SLen(P(szField, 0)));
            break;
          }
        case 99:
          {
            if (cPar >= ParCount) {
              $throw(new $.C4AulExecError().init(S("format placeholder without parameter")));
            }
            StringBuf.AppendCharacter($oidx(Pars, ($t3 = cPar, cPar = cPar + 1 | 0, $t3)).getInt() >>> 0);
            cpFormat = cpFormat.add($.SLen(P(szField, 0)));
            break;
          }
        case 105:
        case 118:
          {
            if (cPar >= ParCount) {
              $throw(new $.C4AulExecError().init(S("format placeholder without parameter")));
            }
            StringBuf.Append$StdStrBuf($oidx(Pars, ($t4 = cPar, cPar = cPar + 1 | 0, $t4)).GetDataString(10));
            cpFormat = cpFormat.add($.SLen(P(szField, 0)));
            break;
          }
        case 115:
          {
            if (cPar >= ParCount) {
              $throw(new $.C4AulExecError().init(S("format placeholder without parameter")));
            }
            let szStr = S("(null)");
            if ($oidx(Pars, cPar).GetData().op_void_() != null) {
              let pStr = $oidx(Pars, cPar).getStr();
              if (pStr == null) {
                $throw(new $.C4AulExecError().init(S("string format placeholder without string")));
              }
              szStr = pStr.GetCStr();
            }
            cPar = cPar + 1 | 0;
            StringBuf.AppendFormat(P(szField, 0), szStr);
            cpFormat = cpFormat.add($.SLen(P(szField, 0)));
            break;
          }
        case 37:
          StringBuf.AppendChar(37);
          cpFormat = cpFormat.add($.SLen(P(szField, 0)));
          break;
        default:
          StringBuf.AppendChar(37);
          cpFormat = cpFormat.add(1);
          break;
      }
    }
  }
  return StringBuf;
}

function FnTrans_Identity(__this) {
  const values = new Float64Array([1000, 0, 0, 0, 0, 1000, 0, 0, 0, 0, 1000, 0]);
  do {
    let matrix = new $.C4ValueArray().init$i32(12);
    for (let i = 0; i < 12; i = i + 1) {
      matrix.op_index$i32(i | 0).$assign($.C4VInt(values[i] | 0));
    }
    return matrix;
  } while (false);
}

function FnTrans_Translate(__this, dx, dy, dz) {
  const values = new Float64Array([1000, 0, 0, dx, 0, 1000, 0, dy, 0, 0, 1000, dz]);
  do {
    let matrix = new $.C4ValueArray().init$i32(12);
    for (let i = 0; i < 12; i = i + 1) {
      matrix.op_index$i32(i | 0).$assign($.C4VInt(values[i] | 0));
    }
    return matrix;
  } while (false);
}

function FnTrans_Scale(__this, sx, sy, sz) {
  if (sy === 0 && sz === 0) {
    sy = sz = sx;
  }
  const values = new Float64Array([sx, 0, 0, 0, 0, sy, 0, 0, 0, 0, sz, 0]);
  do {
    let matrix = new $.C4ValueArray().init$i32(12);
    for (let i = 0; i < 12; i = i + 1) {
      matrix.op_index$i32(i | 0).$assign($.C4VInt(values[i] | 0));
    }
    return matrix;
  } while (false);
}

function FnTrans_Rotate(__this, angle, rx, ry, rz) {
  let c = $.fixtoi$C4Fixed$i32($.Cos($.itofix$i32$i32(angle | 0, 1)), 1000);
  let s = $.fixtoi$C4Fixed$i32($.Sin($.itofix$i32$i32(angle | 0, 1)), 1000);
  let sqrt_val = rx * rx + ry * ry + rz * rz;
  let n = Math.trunc(c$sqrt(sqrt_val));
  if (n * n < sqrt_val) {
    n = n + 1;
  } else if (n * n > sqrt_val) {
    n = n - 1;
  }
  if (n === 0) {
    $throw(new $.C4AulExecError().init(S("cannot rotate around a null vector")));
  }
  rx = Math.trunc(1000 * rx / n);
  ry = Math.trunc(1000 * ry / n);
  rz = Math.trunc(1000 * rz / n);
  const values = new Float64Array([Math.trunc(rx * rx * (1000 - c) / 0xf4240) + c, Math.trunc(rx * ry * (1000 - c) / 0xf4240) - Math.trunc(rz * s / 1000), Math.trunc(rx * rz * (1000 - c) / 0xf4240) + Math.trunc(ry * s / 1000), 0, Math.trunc(ry * rx * (1000 - c) / 0xf4240) + Math.trunc(rz * s / 1000), Math.trunc(ry * ry * (1000 - c) / 0xf4240) + c, Math.trunc(ry * rz * (1000 - c) / 0xf4240) - Math.trunc(rx * s / 1000), 0, Math.trunc(rz * rx * (1000 - c) / 0xf4240) - Math.trunc(ry * s / 1000), Math.trunc(ry * rz * (1000 - c) / 0xf4240) + Math.trunc(rx * s / 1000), Math.trunc(rz * rz * (1000 - c) / 0xf4240) + c, 0]);
  do {
    let matrix = new $.C4ValueArray().init$i32(12);
    for (let i = 0; i < 12; i = i + 1) {
      matrix.op_index$i32(i | 0).$assign($.C4VInt(values[i] | 0));
    }
    return matrix;
  } while (false);
}

function FnTrans_Mul(__this, pars) {
  let $t1;
  let matrixSize = 12;
  const values = new Float64Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  let first = true;
  for (let i = 0; i < 10; i = i + 1 | 0) {
    let Data = new $.C4Value().$copy(($t1 = pars, pars = $oadd(pars, 1), $t1));
    if (Data.op_not()) {
      break;
    }
    let factorArray = Data.getArray();
    if (factorArray == null || factorArray.GetSize() !== 12) {
      continue;
    }
    if (first) {
      first = false;
      for (let c = 0; c < 12; c = c + 1 | 0) {
        values[c] = factorArray.op_index$i32(c).getInt();
      }
      continue;
    }
    const values_rhs = new Float64Array(12);
    const values_result = new Float64Array(12);
    for (let c = 0; c < 12; c = c + 1 | 0) {
      values_rhs[c] = factorArray.op_index$i32(c).getInt();
    }
    values_result[0] = Math.trunc(values[0] * values_rhs[0] / 1000) + Math.trunc(values[1] * values_rhs[4] / 1000) + Math.trunc(values[2] * values_rhs[8] / 1000);
    values_result[1] = Math.trunc(values[0] * values_rhs[1] / 1000) + Math.trunc(values[1] * values_rhs[5] / 1000) + Math.trunc(values[2] * values_rhs[9] / 1000);
    values_result[2] = Math.trunc(values[0] * values_rhs[2] / 1000) + Math.trunc(values[1] * values_rhs[6] / 1000) + Math.trunc(values[2] * values_rhs[10] / 1000);
    values_result[3] = Math.trunc(values[0] * values_rhs[3] / 1000) + Math.trunc(values[1] * values_rhs[7] / 1000) + Math.trunc(values[2] * values_rhs[11] / 1000) + values[3];
    values_result[4] = Math.trunc(values[4] * values_rhs[0] / 1000) + Math.trunc(values[5] * values_rhs[4] / 1000) + Math.trunc(values[6] * values_rhs[8] / 1000);
    values_result[5] = Math.trunc(values[4] * values_rhs[1] / 1000) + Math.trunc(values[5] * values_rhs[5] / 1000) + Math.trunc(values[6] * values_rhs[9] / 1000);
    values_result[6] = Math.trunc(values[4] * values_rhs[2] / 1000) + Math.trunc(values[5] * values_rhs[6] / 1000) + Math.trunc(values[6] * values_rhs[10] / 1000);
    values_result[7] = Math.trunc(values[4] * values_rhs[3] / 1000) + Math.trunc(values[5] * values_rhs[7] / 1000) + Math.trunc(values[6] * values_rhs[11] / 1000) + values[7];
    values_result[8] = Math.trunc(values[8] * values_rhs[0] / 1000) + Math.trunc(values[9] * values_rhs[4] / 1000) + Math.trunc(values[10] * values_rhs[8] / 1000);
    values_result[9] = Math.trunc(values[8] * values_rhs[1] / 1000) + Math.trunc(values[9] * values_rhs[5] / 1000) + Math.trunc(values[10] * values_rhs[9] / 1000);
    values_result[10] = Math.trunc(values[8] * values_rhs[2] / 1000) + Math.trunc(values[9] * values_rhs[6] / 1000) + Math.trunc(values[10] * values_rhs[10] / 1000);
    values_result[11] = Math.trunc(values[8] * values_rhs[3] / 1000) + Math.trunc(values[9] * values_rhs[7] / 1000) + Math.trunc(values[10] * values_rhs[11] / 1000) + values[11];
    for (let c = 0; c < 12; c = c + 1 | 0) {
      values[c] = values_result[c];
    }
  }
  let matrix = new $.C4ValueArray().init$i32(12);
  for (let i = 0; i < 12; i = i + 1) {
    matrix.op_index$i32(i | 0).$assign($.C4VInt(values[i] | 0));
  }
  return $.C4VArray(matrix);
}

function FnCreatePropList(__this, prototype) {
  return $.C4PropList.New$pC4PropList(prototype);
}

function FnGetProperty(_this, key, pObj) {
  if (pObj == null) {
    pObj = _this;
  }
  if (pObj == null) {
    return new $.C4Value().$copy($.C4VNull);
  }
  if (key == null) {
    return new $.C4Value().$copy($.C4VNull);
  }
  let r = new $.C4Value().init$v();
  pObj.GetPropertyByS(key, r);
  return r;
}

function FnSetProperty(_this, key, to, pObj) {
  if (pObj == null) {
    pObj = _this;
  }
  if (pObj == null) {
    return false;
  }
  if (key == null) {
    return false;
  }
  if (pObj.IsFrozen()) {
    $throw(new $.C4AulExecError().init(S("proplist write: proplist is readonly")));
  }
  pObj.SetPropertyByS(key, to);
  return true;
}

function FnResetProperty(_this, key, pObj) {
  if (pObj == null) {
    pObj = _this;
  }
  if (pObj == null) {
    return false;
  }
  if (key == null) {
    return false;
  }
  if (!pObj.HasProperty(key)) {
    return false;
  }
  if (pObj.IsFrozen()) {
    $throw(new $.C4AulExecError().init(S("proplist write: proplist is readonly")));
  }
  pObj.ResetProperty(key);
  return true;
}

function FnGetProperties(_this, p) {
  if (p == null) {
    p = _this;
  }
  if (p == null) {
    $throw(new $.NeedNonGlobalContext().init(S("GetProperties")));
  }
  let r = p.GetProperties();
  r.SortStrings();
  return r;
}

function FnGetPrototype(_this, p) {
  if (p == null) {
    p = _this;
  }
  if (p == null) {
    $throw(new $.NeedNonGlobalContext().init(S("GetPrototype")));
  }
  return p.GetPrototype();
}

function FnSetPrototype(_this, prototype, p) {
  if (p == null) {
    p = _this;
  }
  if (p == null) {
    $throw(new $.NeedNonGlobalContext().init(S("GetPrototype")));
  }
  p.SetProperty(0 /*P_Prototype*/, new $.C4Value().init$pC4PropList(prototype));
}

function FnCall(_this, Pars) {
  if (_this == null) {
    _this = $.ScriptEngine.GetPropList();
  }
  let ParSet = new $.C4AulParSet().init$v();
  ParSet.Copy($oadd(Pars, 1), 9);
  let fn = Pars.getFunction();
  let name = null;
  if (fn == null) {
    name = Pars.getStr();
    if (name != null) {
      fn = _this.GetFunc$pC4String(name);
    }
  }
  if (fn == null) {
    let s = $.FnStringPar(name);
    if (s.a[s.o + 0] === 126) {
      fn = _this.GetFunc$pi8($padd(s, 1));
      if (fn == null) {
        return new $.C4Value().init$v();
      }
    }
  }
  if (fn == null) {
    $throw(new $.C4AulExecError().init($.FormatString(S("Call: no function %s"), Pars.GetDataString().getData()).getData()));
  }
  return fn.Exec$pC4PropList$pC4AulParSet$b(_this, ParSet.op_and(), true);
}

function FnGetName(_this, truename) {
  if (_this == null) {
    $throw(new $.NeedNonGlobalContext().init(S("GetName")));
  } else if (truename) {
    return _this.IsStatic$v() != null ? _this.IsStatic$v().GetParentKeyName() : null;
  } else {
    return $.String_(_this.GetName());
  }
}

function FnAddEffect(__this, szEffect, pTarget, iPrio, iTimerInterval, pCmdTarget, idCmdTarget, Val1, Val2, Val3, Val4) {
  if (pTarget != null && pTarget.Status === 0) {
    return new $.C4Value().init$v();
  }
  if (szEffect == null || !($rd(szEffect.GetCStr()) !== 0) || iPrio === 0) {
    return new $.C4Value().init$v();
  }
  let p = pCmdTarget;
  if (p == null) {
    p = idCmdTarget;
  }
  if (p == null) {
    p = $.ScriptEngine.GetPropList();
  }
  let pEffect = $.C4Effect.New$pC4PropList$ppC4Effect$pC4String$i32$i32$pC4PropList$C4Value$C4Value$C4Value$C4Value(pTarget, $.FnGetEffectsFor(pTarget), szEffect, iPrio, iTimerInterval, p, Val1, Val2, Val3, Val4);
  if (pEffect == null) {
    return new $.C4Value().init$v();
  }
  return $.C4VPropList(pEffect);
}

function FnCreateEffect(_this, prototype, iPrio, iTimerInterval, Val1, Val2, Val3, Val4) {
  if (prototype == null || !($rd(prototype.GetName(), 0) !== 0)) {
    $throw(new $.C4AulExecError().init(S("CreateEffect needs a prototype with a name")));
  }
  if (iPrio === 0) {
    $throw(new $.C4AulExecError().init(S("CreateEffect needs a nonzero priority")));
  }
  let pEffect = $.C4Effect.New$pC4PropList$ppC4Effect$pC4PropList$i32$i32$C4Value$C4Value$C4Value$C4Value(_this, $.FnGetEffectsFor(_this), prototype, iPrio, iTimerInterval, Val1, Val2, Val3, Val4);
  return pEffect;
}

function FnGetEffect(__this, psEffectName, pTarget, index, iMaxPriority) {
  let szEffect = $.FnStringPar(psEffectName);
  let pEffect = $rd($.FnGetEffectsFor(pTarget));
  if (pEffect == null) {
    return null;
  }
  if (szEffect != null && szEffect.a[szEffect.o] !== 0) {
    return pEffect.Get(szEffect, index, iMaxPriority);
  }
  return null;
}

function FnRemoveEffect(__this, psEffectName, pTarget, pEffect2, fDoNoCalls) {
  let szEffect = $.FnStringPar(psEffectName);
  let pEffect = pEffect2;
  if (pEffect == null) {
    pEffect = $rd($.FnGetEffectsFor(pTarget));
    if (pEffect == null) {
      return false;
    }
    if (szEffect != null && szEffect.a[szEffect.o] !== 0) {
      pEffect = pEffect.Get(szEffect, 0);
    }
  }
  if (pEffect == null) {
    return false;
  }
  if (fDoNoCalls) {
    pEffect.SetDead();
  } else {
    pEffect.Kill();
  }
  return true;
}

function FnCheckEffect(__this, psEffectName, pTarget, iPrio, iTimerInterval, Val1, Val2, Val3, Val4) {
  let szEffect = $.FnStringPar(psEffectName);
  if (pTarget != null && pTarget.Status === 0) {
    return new $.C4Value().init$v();
  }
  if (szEffect == null || szEffect.a[szEffect.o] === 0) {
    return new $.C4Value().init$v();
  }
  let pEffect = $rd($.FnGetEffectsFor(pTarget));
  if (pEffect == null) {
    return new $.C4Value().init$v();
  }
  let r = pEffect.Check(szEffect, iPrio, iTimerInterval, Val1, Val2, Val3, Val4);
  if (r === $iptr(-1)) {
    return $.C4VInt(-1);
  }
  if (r === $iptr(-2)) {
    return $.C4VInt(-2);
  }
  return $.C4VPropList(r);
}

function FnGetEffectCount(__this, psEffectName, pTarget, iMaxPriority) {
  let szEffect = $.FnStringPar(psEffectName);
  let pEffect = $rd($.FnGetEffectsFor(pTarget));
  if (pEffect == null) {
    return 0;
  }
  if (szEffect.a[szEffect.o] === 0) {
    szEffect = null;
  }
  return pEffect.GetCount(szEffect, iMaxPriority | 0);
}

function FnEffectCall(__this, Pars) {
  let pTarget = Pars.getPropList();
  let pEffect = $oidx(Pars, 1).getPropList() != null ? $oidx(Pars, 1).getPropList().GetEffect() : null;
  let szCallFn = $.FnStringPar($oidx(Pars, 2).getStr());
  if (pTarget != null && pTarget.Status === 0) {
    return new $.C4Value().init$v();
  }
  if (szCallFn == null || szCallFn.a[szCallFn.o] === 0) {
    return new $.C4Value().init$v();
  }
  if (pEffect == null) {
    return new $.C4Value().init$v();
  }
  return pEffect.DoCall(pTarget, szCallFn, $oidx(Pars, 3), $oidx(Pars, 4), $oidx(Pars, 5), $oidx(Pars, 6), $oidx(Pars, 7), $oidx(Pars, 8), $oidx(Pars, 9));
}



function C4IntToSyntaxOption(flags) {
  let out = $rx.ECMAScript;
  if ($and64n(flags, 1) !== 0) {
    out |= $rx.icase;
  }
  return out;
}

function C4IntToMatchFlag(flags) {
  let out = $rx.match_default;
  if ($and64n(flags, 2) !== 0) {
    out |= $rx.format_first_only;
  }
  return out;
}

function FnRegexReplace(__this, source, regex, replacement, flags) {
  if (source == null || regex == null || replacement == null) {
    return new $.Nillable$pC4String().init$C4Void(new $.C4Void());
  }
  try {
    let re = new Regex(regex.GetCStr(), C4IntToSyntaxOption(flags));
    let out = $regex_replace(source.GetCStr(), re, replacement.GetCStr(), C4IntToMatchFlag(flags));
    return new $.Nillable$pC4String().init$rpC4String($.Strings.RegString$pi8(out.c_str()));
  } catch ($e1) {
    if ($e1 instanceof Error || ($e1 && $e1.$stdexception)) {
      const e = $e1;
      $throw(new $.C4AulExecError().init($.FormatString(S("RegexReplace: %s"), e.what()).getData()));
    } else {
      throw $e1;
    }
  }
}

function FnRegexSearch(__this, source, regex, flags) {
  let $t1;
  if (source == null || regex == null) {
    return new $.Nillable$pC4ValueArray().init$C4Void(new $.C4Void());
  }
  try {
    let re = new Regex(regex.GetCStr(), C4IntToSyntaxOption(flags));
    let out = new $.C4ValueArray();
    const data = source.GetData();
    let pos = 0;
    let m = new RegexMatch();
    let i = 0;
    while (pos <= data.getLength() && $regex_search($padd(data.getData(), pos), $padd(data.getData(), data.getLength()), m, re)) {
      let char_pos = $.GetCharacterCount(StdString.of(data.getData(), pos + $u64n(m.position())).c_str());
      out.op_index$i32(($t1 = i, i = i + 1, $t1) | 0).$assign($.C4VInt(char_pos));
      if ($and64n(flags, 2) !== 0) {
        break;
      }
      pos = pos + ($u64n(m.position()) + $max($u64n(m.length()), 1));
    }
    return new $.Nillable$pC4ValueArray().init$rpC4ValueArray(out);
  } catch ($e1) {
    if ($e1 instanceof Error || ($e1 && $e1.$stdexception)) {
      const e = $e1;
      $throw(new $.C4AulExecError().init($.FormatString(S("RegexSearch: %s"), e.what()).getData()));
    } else {
      throw $e1;
    }
  }
}

function FnRegexMatch(__this, source, regex, flags) {
  let $t1, $t2;
  if (source == null || regex == null) {
    return new $.Nillable$pC4ValueArray().init$C4Void(new $.C4Void());
  }
  try {
    let re = new Regex(regex.GetCStr(), C4IntToSyntaxOption(flags));
    let out = new $.C4ValueArray();
    const data = source.GetData();
    let pos = 0;
    let m = new RegexMatch();
    let i = 0;
    while (pos <= data.getLength() && $regex_search($padd(data.getData(), pos), $padd(data.getData(), data.getLength()), m, re)) {
      let match = new $.C4ValueArray().init$i32(m.size() | 0);
      let j = 0;
      for (const sm of m) {
        match.op_index$i32(($t1 = j, j = j + 1, $t1) | 0).$assign($.C4VString$pC4String($.String_(sm.str().c_str())));
      }
      out.op_index$i32(($t2 = i, i = i + 1, $t2) | 0).$assign($.C4VArray(match));
      if ($and64n(flags, 2) !== 0) {
        break;
      }
      pos = pos + ($u64n(m.position()) + $max($u64n(m.length()), 1));
    }
    return new $.Nillable$pC4ValueArray().init$rpC4ValueArray(out);
  } catch ($e1) {
    if ($e1 instanceof Error || ($e1 && $e1.$stdexception)) {
      const e = $e1;
      $throw(new $.C4AulExecError().init($.FormatString(S("RegexMatch: %s"), e.what()).getData()));
    } else {
      throw $e1;
    }
  }
}

function FnRegexSplit(__this, source, regex, flags) {
  let $t1, $t2;
  if (source == null || regex == null) {
    return new $.Nillable$pC4ValueArray().init$C4Void(new $.C4Void());
  }
  try {
    let re = new Regex(regex.GetCStr(), C4IntToSyntaxOption(flags));
    let out = new $.C4ValueArray();
    const data = source.GetData();
    let pos = 0;
    let m = new RegexMatch();
    let i = 0;
    while (pos <= data.getLength() && $regex_search($padd(data.getData(), pos), $padd(data.getData(), data.getLength()), m, re)) {
      let substr = StdString.of($padd(data.getData(), pos), $max($u64n(m.position()), 1));
      out.op_index$i32(($t1 = i, i = i + 1, $t1) | 0).$assign($.C4VString$pC4String($.String_(substr.c_str())));
      if ($and64n(flags, 2) !== 0) {
        break;
      }
      pos = pos + ($u64n(m.position()) + $max($u64n(m.length()), 1));
    }
    if (pos <= data.getLength()) {
      let substr = StdString.of($padd(data.getData(), pos), data.getLength() - pos);
      out.op_index$i32(($t2 = i, i = i + 1, $t2) | 0).$assign($.C4VString$pC4String($.String_(substr.c_str())));
    }
    return new $.Nillable$pC4ValueArray().init$rpC4ValueArray(out);
  } catch ($e1) {
    if ($e1 instanceof Error || ($e1 && $e1.$stdexception)) {
      const e = $e1;
      $throw(new $.C4AulExecError().init($.FormatString(S("RegexSplit: %s"), e.what()).getData()));
    } else {
      throw $e1;
    }
  }
}

function FnLog(_this, Pars) {
  $.Log(FnStringFormat(_this, Pars.getStr(), $oadd(Pars, 1), 9).getData());
  return $.C4VBool(true);
}

function FnDebugLog(_this, Pars) {
  $.DebugLog(FnStringFormat(_this, Pars.getStr(), $oadd(Pars, 1), 9).getData());
  return $.C4VBool(true);
}

function FnFormat(_this, Pars) {
  return $.C4VString$StdStrBuf(FnStringFormat(_this, Pars.getStr(), $oadd(Pars, 1), 9));
}

function FnParseInt(__this, str) {
  let cstr = str.GetCStr();
  const end = [null];
  let result = $.StrToI32(cstr, 10, P(end, 0));
  if ($peq(end[0], cstr) || end[0].a[end[0].o] !== 0) {
    return new $.Nillable$i32().init$C4Void(new $.C4Void());
  }
  return new $.Nillable$i32().init$i32(result);
}

function FnAbs(__this, iVal) {
  return $.Abs$i64(iVal);
}

function FnSin(__this, iAngle, iRadius, iPrec) {
  if (iPrec === 0) {
    iPrec = 1;
  }
  iAngle = iAngle % (360 * iPrec);
  return $.fixtoi$C4Fixed$i32($.Sin($.itofix$i32$i32(iAngle | 0, iPrec | 0)), iRadius | 0);
}

function FnCos(__this, iAngle, iRadius, iPrec) {
  if (iPrec === 0) {
    iPrec = 1;
  }
  iAngle = iAngle % (360 * iPrec);
  return $.fixtoi$C4Fixed$i32($.Cos($.itofix$i32$i32(iAngle | 0, iPrec | 0)), iRadius | 0);
}

function FnSqrt(__this, iValue) {
  if (iValue < 0) {
    return 0;
  }
  let iSqrt = Math.trunc(c$sqrt(iValue));
  if (iSqrt * iSqrt < iValue) {
    iSqrt = iSqrt + 1;
  }
  if (iSqrt * iSqrt > iValue) {
    iSqrt = iSqrt - 1;
  }
  return iSqrt;
}

function FnAngle(__this, iX1, iY1, iX2, iY2, iPrec) {
  if (iPrec === 0) {
    iPrec = 1;
  }
  return $.Angle(iX1 | 0, iY1 | 0, iX2 | 0, iY2 | 0, iPrec | 0);
}

function FnArcSin(__this, iVal, iRadius) {
  if (iRadius === 0) {
    return 0;
  }
  if (iVal > iRadius) {
    return 0;
  }
  let f1 = iVal;
  f1 = c$asin(f1 / iRadius) * 180 / 3.141592653589793;
  return Math.trunc(c$floor(f1 + 0.5));
}

function FnArcCos(__this, iVal, iRadius) {
  if (iRadius === 0) {
    return 0;
  }
  if (iVal > iRadius) {
    return 0;
  }
  let f1 = iVal;
  f1 = c$acos(f1 / iRadius) * 180 / 3.141592653589793;
  return Math.trunc(c$floor(f1 + 0.5));
}

function minmax(func, a_val, b_opt) {
  if (a_val.CheckConversion(1 /*C4V_Int*/)) {
    let a = a_val.getInt();
    let b = b_opt.op_int();
    if (a > b) {
      [a, b] = [b, a];
    }
    return (($p) => new StdPair(new $.Nillable$i32().init$i32($p.first), new $.Nillable$i32().init$i32($p.second)))(new StdPair(a, b));
  } else if (a_val.CheckConversion(5 /*C4V_Array*/)) {
    let a = a_val.getArray();
    if (a.GetSize() === 0) {
      return (($p) => new StdPair(new $.Nillable$i32().init$x($p.first), new $.Nillable$i32().init$x($p.second)))(new StdPair(null, null));
    }
    if (!a.GetItem(0).CheckConversion(1 /*C4V_Int*/)) {
      $throw(new $.C4AulExecError().init($.FormatString(S("%s: argument 1 must be int or array-of-int, but element %d of array is of type %s"), func, 0, a.GetItem(0).GetTypeName()).getData()));
    }
    let min = 0;
    let max = 0;
    min = max = a.GetItem(0).getInt();
    for (let i = 1; i < a.GetSize(); i = i + 1 | 0) {
      if (!a.GetItem(i).CheckConversion(1 /*C4V_Int*/)) {
        $throw(new $.C4AulExecError().init($.FormatString(S("%s: argument 1 must be int or array-of-int, but element %d of array is of type %s"), func, i, a.GetItem(i).GetTypeName()).getData()));
      }
      let value = a.GetItem(i).getInt();
      min = $min(min, value);
      max = $max(max, value);
    }
    return (($p) => new StdPair(new $.Nillable$i32().init$i32($p.first), new $.Nillable$i32().init$i32($p.second)))(new StdPair(min, max));
  } else {
    $throw(new $.C4AulExecError().init($.FormatString(S("%s: argument 1 must be int or array-of-int, but is of type %s"), func, a_val.GetTypeName()).getData()));
  }
}

function FnMin(__this, a, b) {
  return new $.Nillable$i32().$copy(minmax(S("Min"), a, b).first);
}

function FnMax(__this, a, b) {
  return new $.Nillable$i32().$copy(minmax(S("Max"), a, b).second);
}

function FnDistance(__this, iX1, iY1, iX2, iY2) {
  return $.Distance(iX1 | 0, iY1 | 0, iX2 | 0, iY2 | 0);
}

function FnBoundBy(__this, iVal, iRange1, iRange2) {
  return $.Clamp$i64$i64$i64(iVal, iRange1, iRange2);
}

function FnInside(__this, iVal, iRange1, iRange2) {
  return $.Inside$i64$i64$i64(iVal, iRange1, iRange2);
}

function FnRandom(__this, iRange) {
  return Random(iRange >>> 0);
}

function FnGetType(__this, Value) {
  if (Value.CheckConversion(11 /*C4V_Object*/)) {
    return 11;
  }
  if (Value.CheckConversion(12 /*C4V_Def*/)) {
    return 12;
  }
  if (Value.CheckConversion(13 /*C4V_Effect*/)) {
    return 13;
  }
  return Value.GetType();
}

function FnCreateArray(__this, iSize) {
  return new $.C4ValueArray().init$i32(iSize);
}

function FnGetLength(__this, Par) {
  let pArray = Par.getArray();
  if (pArray != null) {
    return pArray.GetSize();
  }
  let pStr = Par.getStr();
  if (pStr != null) {
    return $.GetCharacterCount(pStr.GetData().getData());
  }
  $throw(new $.C4AulExecError().init(S("GetLength: parameter 0 cannot be converted to string or array")));
}

function FnGetIndexOf(__this, pArray, Needle) {
  if (pArray == null) {
    return -1;
  }
  let iSize = pArray.GetSize();
  for (let i = 0; i < iSize; i = i + 1 | 0) {
    if (Needle.IsIdenticalTo(pArray.GetItem(i))) {
      return i;
    }
  }
  return -1;
}

function FnDeepEqual(__this, v1, v2) {
  return v1.op_eq(v2);
}

function FnSetLength(__this, pArray, iNewSize) {
  if (pArray == null) {
    $throw(new $.C4AulExecError().init($.strprintf(S("call to \"%s\" parameter %d: passed %s, but expected %s"), S("SetLength"), 1, $.GetC4VName(0 /*C4V_Nil*/), $.GetC4VName(5 /*C4V_Array*/)).c_str()));
  }
  if (iNewSize < 0 || iNewSize > 0xf4240) {
    $throw(new $.C4AulExecError().init($.strprintf(S("call to \"SetLength\": parameter 2: invalid array size (expected value between 0 and %d, but got %d"), 0xf4240, iNewSize).c_str()));
  }
  pArray.SetSize(iNewSize);
}

function FnGetChar(__this, pString, iIndex) {
  const szText = [$.FnStringPar(pString)];
  if (szText[0] == null) {
    return new $.Nillable$i64().init$C4Void(new $.C4Void());
  }
  let c = $.GetNextCharacter(P(szText, 0));
  for (let i = 0; i < iIndex; i = i + 1 | 0) {
    c = $.GetNextCharacter(P(szText, 0));
    if (c === 0) {
      return new $.Nillable$i64().init$C4Void(new $.C4Void());
    }
  }
  return new $.Nillable$i64().init$i64(c);
}

function FnStringToIdentifier(__this, pString) {
  const text = [$.FnStringPar(pString)];
  if (text[0] == null) {
    return null;
  }
  let result = new $.StdStrBuf();
  let had_valid = false;
  let had_invalid = false;
  let ptext = text[0];
  let t0 = text[0];
  let c = $.GetNextCharacter(P(text, 0));
  while (c !== 0) {
    if (c$isalnum(c | 0) !== 0 || c === 95) {
      if (c$isdigit(c | 0) !== 0 && !had_valid) {
        result.Append$pi8(S("_"));
        had_invalid = true;
      }
      if (had_invalid) {
        result.Append$pi8$u64(ptext, $u64n(text[0].o - ptext.o));
      }
      had_valid = true;
    } else {
      if (!had_invalid) {
        result.Copy$pi8$u64(t0, $u64n(ptext.o - t0.o));
        had_invalid = true;
      }
    }
    ptext = text[0];
    c = $.GetNextCharacter(P(text, 0));
  }
  if (!had_valid) {
    return $.Strings.RegString$pi8(S("_"));
  }
  return had_invalid ? $.Strings.RegString$StdStrBuf(new $.StdStrBuf().init$rStdStrBuf$b(result)) : pString;
}

function Fneval(_this, strScript, dont_pass_errors) {
  return $.AulExec.DirectExec(_this, $.FnStringPar(strScript), S("eval"), !dont_pass_errors);
}

function FnLocateFunc(_this, funcname, p) {
  if (funcname == null || !(funcname.GetCStr() != null)) {
    $.Log(S("No func name"));
    return false;
  }
  if (p == null) {
    p = _this;
  }
  let pFunc = p.GetFunc$pC4String(funcname);
  if (pFunc == null) {
    $.LogF(S("Func %s not found"), funcname.GetCStr());
  } else {
    let szPrefix = S("");
    while (pFunc != null) {
      let pSFunc = pFunc.SFunc();
      if (pSFunc == null) {
        $.LogF(S("%s%s (engine)"), szPrefix, pFunc.GetName());
      } else if (pSFunc.pOrgScript == null) {
        $.LogF(S("%s%s (no owner)"), szPrefix, pSFunc.GetName());
      } else {
        let iLine = $.SGetLine(pSFunc.pOrgScript.GetScript(), pSFunc.Script);
        $.LogF(S("%s%s (%s:%d)"), szPrefix, pFunc.GetName(), pSFunc.pOrgScript.ScriptName.getData(), iLine);
      }
      pFunc = pSFunc != null ? pSFunc.OwnerOverloaded : null;
      szPrefix = S("overloads ");
    }
  }
  return true;
}

function FnModulateColor(__this, iClr1, iClr2) {
  let dwClr1 = iClr1 >>> 0;
  let dwClr2 = iClr2 >>> 0;
  if (dwClr1 === 0) {
    dwClr1 = 0xffffff;
  }
  let iA1 = dwClr1 >>> 24;
  let iA2 = dwClr2 >>> 24;
  let r = $or64n(((Math.imul((dwClr1 & 255) >>> 0, (dwClr2 & 255) >>> 0) >>> 0 >>> 8 | (Math.imul((dwClr1 >>> 8 & 255) >>> 0, (dwClr2 >>> 8 & 255) >>> 0) >>> 0 & 65280) >>> 0) >>> 0 | (Math.imul((dwClr1 >>> 16 & 255) >>> 0, (dwClr2 >>> 8 & 65280) >>> 0) >>> 0 & 0xff0000) >>> 0) >>> 0, $shl64n($min(iA1 + iA2 - $shr64n(iA1 * iA2, 8), 255), 24)) >>> 0;
  return r;
}

function FnWildcardMatch(__this, psString, psWildcard) {
  return $.SWildcardMatchEx($.FnStringPar(psString), $.FnStringPar(psWildcard)) ? 1 : 0;
}

function FnFatalError(_this, Pars) {
  $throw(new $.C4AulExecError().init($.FormatString(S("script: %s"), FnStringFormat(_this, Pars.getStr(), $oadd(Pars, 1), 9).getData()).getData()));
}

function FnStartCallTrace(__this) {
  $.AulExec.StartTrace();
  return true;
}

function FnStartScriptProfiler(__this, pDef) {
  let pScript = null;
  if (pDef != null) {
    pScript = pDef.Script;
  } else {
    pScript = null;
  }
  $.C4AulProfiler.StartProfiling(pScript);
  return true;
}

function FnStopScriptProfiler(__this) {
  $.C4AulProfiler.StopProfiling();
  return true;
}

function FnGetConstantNameByValue(__this, value, name_prefix, idx) {
  let $t1;
  let name_prefix_s = name_prefix.op_C4String_();
  for (let i = 0; i < $.ScriptEngine.GlobalConsts.GetAnzItems(); i = i + 1 | 0) {
    if ($.ScriptEngine.GlobalConsts.op_index$i32(i).getInt() === value) {
      let const_name = $.ScriptEngine.GlobalConstNames.GetItemUnsafe(i);
      if (name_prefix_s == null || $.SEqual2(const_name, name_prefix_s.GetCStr())) {
        if (!(($t1 = idx, idx = idx - 1 | 0, $t1) !== 0)) {
          return new $.Nillable$pC4String().init$rpC4String($.String_($padd(const_name, name_prefix_s != null ? name_prefix_s.GetData().getLength() : 0)));
        }
      }
    }
  }
  return new $.Nillable$pC4String().init$C4Void(new $.C4Void());
}

function FnReplaceString(__this, source, from, to) {
  if (from == null) {
    return new $.Nillable$pC4String().init$rpC4String(source);
  }
  if (source == null) {
    return new $.Nillable$pC4String().init$C4Void(new $.C4Void());
  }
  let szto = to != null ? to.GetCStr() : S("");
  let szfrom = from.GetCStr();
  let s = new $.StdStrBuf().init$StdStrBuf$b(source.GetData(), true);
  if (s.Replace(szfrom, szto) !== 0) {
    return new $.Nillable$pC4String().init$rpC4String($.Strings.RegString$pi8(s.getData()));
  } else {
    return new $.Nillable$pC4String().init$rpC4String(source);
  }
}

function FnSortArray(__this, pArray, descending) {
  if (pArray == null) {
    $throw(new $.C4AulExecError().init(S("SortArray: no array given")));
  }
  if (pArray.IsFrozen()) {
    $throw(new $.C4AulExecError().init(S("array sort: array is readonly")));
  }
  pArray.Sort$b(descending);
  return true;
}

function FnSortArrayByProperty(__this, pArray, prop_name, descending) {
  if (pArray == null) {
    $throw(new $.C4AulExecError().init(S("SortArrayByProperty: no array given")));
  }
  if (prop_name == null) {
    $throw(new $.C4AulExecError().init(S("SortArrayByProperty: no property name given")));
  }
  if (pArray.IsFrozen()) {
    $throw(new $.C4AulExecError().init(S("array sort: array is readonly")));
  }
  if (!pArray.SortByProperty(prop_name, descending)) {
    $throw(new $.C4AulExecError().init(S("SortArrayByProperty: not all array elements are proplists")));
  }
  return true;
}

function FnSortArrayByArrayElement(__this, pArray, element_index, descending) {
  if (pArray == null) {
    $throw(new $.C4AulExecError().init(S("SortArrayByArrayElement: no array given")));
  }
  if (element_index < 0) {
    $throw(new $.C4AulExecError().init(S("SortArrayByArrayElement: element index must be >=0")));
  }
  if (pArray.IsFrozen()) {
    $throw(new $.C4AulExecError().init(S("array sort: array is readonly")));
  }
  if (!pArray.SortByArrayElement(element_index, descending)) {
    $throw(new $.C4AulExecError().init(S("SortArrayByArrayElement: not all array elements are arrays of sufficient length")));
  }
  return true;
}

function FnFileWrite(__this, file_handle, data) {
  let file = $.ScriptEngine.GetUserFile(file_handle);
  if (file == null) {
    $throw(new $.C4AulExecError().init(S("FileWrite: invalid file handle")));
  }
  if (data == null) {
    return false;
  }
  file.Write(data.GetCStr(), data.GetData().getLength());
  return true;
}



export function InitCoreFunctionMap(pEngine) {
  $.C4ScriptLibrary.InstantiateAllLibraries(pEngine);
  for (let pCDef = $oat($.C4ScriptConstMap, 0); pCDef.Identifier != null; pCDef = $oadd(pCDef, 1)) {
    0;
    pEngine.RegisterGlobalConstant(pCDef.Identifier, $.C4VInt(pCDef.Data | 0));
  }
  let p = pEngine.GetPropList();
  for (let pDef = $oat($.C4ScriptFnMap, 0); pDef.Identifier != null; pDef = $oadd(pDef, 1)) {
    new $.C4AulDefFunc().init(p, pDef);
  }
  $.AddFunc$24(p, S("ParseInt"), FnParseInt);
  $.AddFunc$187(p, S("Abs"), FnAbs);
  $.AddFunc$25(p, S("Min"), FnMin);
  $.AddFunc$25(p, S("Max"), FnMax);
  $.AddFunc$191(p, S("Sin"), FnSin);
  $.AddFunc$191(p, S("Cos"), FnCos);
  $.AddFunc$187(p, S("Sqrt"), FnSqrt);
  $.AddFunc$189(p, S("ArcSin"), FnArcSin);
  $.AddFunc$189(p, S("ArcCos"), FnArcCos);
  $.AddFunc$191(p, S("BoundBy"), FnBoundBy);
  $.AddFunc$133(p, S("Inside"), FnInside);
  $.AddFunc$187(p, S("Random"), FnRandom);
  $.AddFunc$54(p, S("CreateArray"), FnCreateArray);
  $.AddFunc$44(p, S("CreatePropList"), FnCreatePropList);
  $.AddFunc$51(p, S("GetProperties"), FnGetProperties);
  $.AddFunc(p, S("GetProperty"), FnGetProperty);
  $.AddFunc$99(p, S("SetProperty"), FnSetProperty);
  $.AddFunc$44(p, S("GetPrototype"), FnGetPrototype);
  $.AddFunc$207(p, S("SetPrototype"), FnSetPrototype);
  $.AddFunc$96(p, S("ResetProperty"), FnResetProperty);
  $.AddFunc$77(p, S("GetName"), FnGetName);
  $.AddFunc$3(p, S("AddEffect"), FnAddEffect);
  $.AddFunc$61(p, S("CreateEffect"), FnCreateEffect);
  $.AddFunc$2(p, S("CheckEffect"), FnCheckEffect);
  $.AddFunc$98(p, S("RemoveEffect"), FnRemoveEffect);
  $.AddFunc$60(p, S("GetEffect"), FnGetEffect);
  $.AddFunc$181(p, S("GetEffectCount"), FnGetEffectCount);
  $.AddFunc$20(p, S("RegexReplace"), FnRegexReplace);
  $.AddFunc$16(p, S("RegexSearch"), FnRegexSearch);
  $.AddFunc$16(p, S("RegexMatch"), FnRegexMatch);
  $.AddFunc$16(p, S("RegexSplit"), FnRegexSplit);
  $.AddFunc$193(p, S("Distance"), FnDistance);
  $.AddFunc$197(p, S("Angle"), FnAngle);
  $.AddFunc$35(p, S("GetChar"), FnGetChar);
  $.AddFunc$170(p, S("GetType"), FnGetType);
  $.AddFunc$189(p, S("ModulateColor"), FnModulateColor);
  $.AddFunc$182(p, S("WildcardMatch"), FnWildcardMatch);
  $.AddFunc$170(p, S("GetLength"), FnGetLength);
  $.AddFunc$206(p, S("SetLength"), FnSetLength);
  $.AddFunc$167(p, S("GetIndexOf"), FnGetIndexOf);
  $.AddFunc$116(p, S("DeepEqual"), FnDeepEqual);
  $.AddFunc$84(p, S("StartCallTrace"), FnStartCallTrace);
  $.AddFunc$88(p, S("StartScriptProfiler"), FnStartScriptProfiler);
  $.AddFunc$84(p, S("StopScriptProfiler"), FnStopScriptProfiler);
  $.AddFunc$86(p, S("SortArray"), FnSortArray);
  $.AddFunc$85(p, S("SortArrayByProperty"), FnSortArrayByProperty);
  $.AddFunc$87(p, S("SortArrayByArrayElement"), FnSortArrayByArrayElement);
  $.AddFunc$50(p, S("Trans_Identity"), FnTrans_Identity);
  $.AddFunc$57(p, S("Trans_Translate"), FnTrans_Translate);
  $.AddFunc$57(p, S("Trans_Scale"), FnTrans_Scale);
  $.AddFunc$58(p, S("Trans_Rotate"), FnTrans_Rotate);
  $.AddFunc$96(p, S("LocateFunc"), FnLocateFunc);
  $.AddFunc$118(p, S("FileWrite"), FnFileWrite);
  $.AddFunc$6(p, S("eval"), Fneval);
  $.AddFunc$76(p, S("StringToIdentifier"), FnStringToIdentifier);
  $.AddFunc$22(p, S("GetConstantNameByValue"), FnGetConstantNameByValue);
  $.AddFunc$19(p, S("ReplaceString"), FnReplaceString);
  $.AddFunc$76(p, S("Translate"), $.C4AulExec.FnTranslate);
  $.AddFunc$84(p, S("LogCallStack"), $.C4AulExec.FnLogCallStack);
}

export function $init(): void {
  $.Regex_CaseInsensitive$C4Script = 1;
  $.Regex_FirstOnly$C4Script = 2;
  $.C4ScriptConstMap = $own([
  ((($o) => ($o.Identifier = S("FX_OK"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 0, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("FX_Effect_Deny"), $o.ValType = 1 /*C4V_Int*/, $o.Data = -1, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("FX_Effect_Annul"), $o.ValType = 1 /*C4V_Int*/, $o.Data = -2, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("FX_Effect_AnnulDoCalls"), $o.ValType = 1 /*C4V_Int*/, $o.Data = -3, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("FX_Execute_Kill"), $o.ValType = 1 /*C4V_Int*/, $o.Data = -1, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("FX_Stop_Deny"), $o.ValType = 1 /*C4V_Int*/, $o.Data = -1, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("FX_Start_Deny"), $o.ValType = 1 /*C4V_Int*/, $o.Data = -1, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("FX_Call_Normal"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 0, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("FX_Call_Temp"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 1, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("FX_Call_TempAddForRemoval"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 2, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("FX_Call_RemoveClear"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 3, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("FX_Call_RemoveDeath"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 4, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("FX_Call_DmgScript"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 0, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("FX_Call_DmgBlast"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 1, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("FX_Call_DmgFire"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 2, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("FX_Call_DmgChop"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 3, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("FX_Call_Energy"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 32, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("FX_Call_EngScript"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 32, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("FX_Call_EngBlast"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 33, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("FX_Call_EngObjHit"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 34, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("FX_Call_EngFire"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 35, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("FX_Call_EngBaseRefresh"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 36, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("FX_Call_EngAsphyxiation"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 37, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("FX_Call_EngCorrosion"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 38, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("FX_Call_EngGetPunched"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 40, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("Regex_CaseInsensitive"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 1, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("Regex_FirstOnly"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 2, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4V_Nil"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 0, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4V_Int"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 1, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4V_Bool"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 2, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4V_C4Object"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 11, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4V_Effect"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 13, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4V_Def"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 12, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4V_String"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 4, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4V_Array"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 5, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4V_Function"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 6, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4V_PropList"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 3, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4X_Ver1"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 9, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = S("C4X_Ver2"), $o.ValType = 1 /*C4V_Int*/, $o.Data = 0, $o))(new $.C4ScriptConstDef())),
  ((($o) => ($o.Identifier = null, $o.ValType = 0 /*C4V_Nil*/, $o.Data = 0, $o))(new $.C4ScriptConstDef())),
]);
  $.C4ScriptFnMap = $own([
  ((($o) => ($o.Identifier = S("Call"), $o.Public = true, $o.RetType = 10 /*C4V_Any*/, $o.ParType = new Int32Array([10, 10, 10, 10, 10, 10, 10, 10, 10, 10]), $o.FunctionC4V = FnCall, $o))(new $.C4ScriptFnDef())),
  ((($o) => ($o.Identifier = S("EffectCall"), $o.Public = true, $o.RetType = 10 /*C4V_Any*/, $o.ParType = new Int32Array([11, 3, 4, 10, 10, 10, 10, 10, 10, 10]), $o.FunctionC4V = FnEffectCall, $o))(new $.C4ScriptFnDef())),
  ((($o) => ($o.Identifier = S("Log"), $o.Public = true, $o.RetType = 2 /*C4V_Bool*/, $o.ParType = new Int32Array([4, 10, 10, 10, 10, 10, 10, 10, 10, 10]), $o.FunctionC4V = FnLog, $o))(new $.C4ScriptFnDef())),
  ((($o) => ($o.Identifier = S("DebugLog"), $o.Public = true, $o.RetType = 2 /*C4V_Bool*/, $o.ParType = new Int32Array([4, 10, 10, 10, 10, 10, 10, 10, 10, 10]), $o.FunctionC4V = FnDebugLog, $o))(new $.C4ScriptFnDef())),
  ((($o) => ($o.Identifier = S("FatalError"), $o.Public = true, $o.RetType = 0 /*C4V_Nil*/, $o.ParType = new Int32Array([4, 10, 10, 10, 10, 10, 10, 10, 10, 10]), $o.FunctionC4V = FnFatalError, $o))(new $.C4ScriptFnDef())),
  ((($o) => ($o.Identifier = S("Format"), $o.Public = true, $o.RetType = 4 /*C4V_String*/, $o.ParType = new Int32Array([4, 10, 10, 10, 10, 10, 10, 10, 10, 10]), $o.FunctionC4V = FnFormat, $o))(new $.C4ScriptFnDef())),
  ((($o) => ($o.Identifier = S("Trans_Mul"), $o.Public = true, $o.RetType = 5 /*C4V_Array*/, $o.ParType = new Int32Array([5, 10, 10, 10, 10, 10, 10, 10, 10, 10]), $o.FunctionC4V = FnTrans_Mul, $o))(new $.C4ScriptFnDef())),
  ((($o) => ($o.Identifier = null, $o.Public = false, $o.RetType = 0 /*C4V_Nil*/, $o.ParType = new Int32Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]), $o.FunctionC4V = null, $o))(new $.C4ScriptFnDef())),
]);
}

Object.assign($, { C4IntToMatchFlag, C4IntToSyntaxOption, FnAbs, FnAddEffect, FnAngle, FnArcCos, FnArcSin, FnBoundBy, FnCall, FnCheckEffect, FnCos, FnCreateArray, FnCreateEffect, FnCreatePropList, FnDebugLog, FnDeepEqual, FnDistance, FnEffectCall, FnFatalError, FnFileWrite, FnFormat, FnGetChar, FnGetConstantNameByValue, FnGetEffect, FnGetEffectCount, FnGetIndexOf, FnGetLength, FnGetName, FnGetProperties, FnGetProperty, FnGetPrototype, FnGetType, FnInside, FnLocateFunc, FnLog, FnMax, FnMin, FnModulateColor, FnParseInt, FnRandom, FnRegexMatch, FnRegexReplace, FnRegexSearch, FnRegexSplit, FnRemoveEffect, FnReplaceString, FnResetProperty, FnSetLength, FnSetProperty, FnSetPrototype, FnSin, FnSortArray, FnSortArrayByArrayElement, FnSortArrayByProperty, FnSqrt, FnStartCallTrace, FnStartScriptProfiler, FnStopScriptProfiler, FnStringFormat, FnStringToIdentifier, FnTrans_Identity, FnTrans_Mul, FnTrans_Rotate, FnTrans_Scale, FnTrans_Translate, FnWildcardMatch, Fneval, InitCoreFunctionMap, minmax });
