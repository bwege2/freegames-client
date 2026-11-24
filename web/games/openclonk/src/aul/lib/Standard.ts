// @ts-nocheck
// OpenClonk 36de799: src/lib/Standard.cpp, src/lib/Standard.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $u64n, ftoi32, i64 } from '../../rt/int.ts';
import { c$atan2, c$isspace, c$memmove, c$sqrt, c$strchr, c$strcmp, c$strcpy, c$strcspn, c$strlen, c$strncpy, c$toupper, c$vsnprintf, c$vsprintf } from '../../rt/libc.ts';
import { $padd, $peq, $rd, $view8, $wr, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $min, $throw, StdException, StdString } from '../../rt/std.ts';

export function Abs$i32(val) {
  return val > 0 ? val : -val | 0;
}

export function Abs$i64(val) {
  return val > 0 ? val : -val;
}

export function Clamp$i32$i32$i32(bval, lbound, rbound) {
  return bval < lbound ? lbound : bval > rbound ? rbound : bval;
}

export function Clamp$u32$u32$u32(bval, lbound, rbound) {
  return bval < lbound ? lbound : bval > rbound ? rbound : bval;
}

export function Clamp$i64$i64$i64(bval, lbound, rbound) {
  return bval < lbound ? lbound : bval > rbound ? rbound : bval;
}

export function Inside$i8$i8$i8(ival, lbound, rbound) {
  return ival >= lbound && ival <= rbound;
}

export function Inside$u8$u64$u64(ival, lbound, rbound) {
  return ival >= lbound && ival <= rbound;
}

export function Inside$i32$i32$i32(ival, lbound, rbound) {
  return ival >= lbound && ival <= rbound;
}

export function Inside$i64$i64$i64(ival, lbound, rbound) {
  return ival >= lbound && ival <= rbound;
}

export function Distance(iX1, iY1, iX2, iY2) {
  let dx = BigInt(iX1) - BigInt(iX2);
  let dy = BigInt(iY1) - BigInt(iY2);
  let d2 = i64(i64(dx * dx) + i64(dy * dy));
  if (d2 < 0n) {
    return -1;
  }
  let dist = ftoi32(c$sqrt(Number(d2)));
  if (BigInt(dist) * BigInt(dist) < d2) {
    dist = dist + 1 | 0;
  }
  if (BigInt(dist) * BigInt(dist) > d2) {
    dist = dist - 1 | 0;
  }
  return dist;
}

export function Angle(iX1, iY1, iX2, iY2, iPrec = 1) {
  let iAngle = 0;
  let dx = iX2 - iX1 | 0;
  let dy = iY2 - iY1 | 0;
  if (dx === 0) {
    if (dy > 0) {
      return Math.imul(180, iPrec);
    } else {
      return 0;
    }
  }
  if (dy === 0) {
    if (dx > 0) {
      return Math.imul(90, iPrec);
    } else {
      return Math.imul(270, iPrec);
    }
  }
  iAngle = ftoi32(180 * iPrec * c$atan2(Abs$i32(dy), Abs$i32(dx)) / 3.141592653589793);
  if (iX2 > iX1) {
    if (iY2 < iY1) {
      iAngle = Math.imul(90, iPrec) - iAngle | 0;
    } else {
      iAngle = Math.imul(90, iPrec) + iAngle | 0;
    }
  } else {
    if (iY2 < iY1) {
      iAngle = Math.imul(270, iPrec) + iAngle | 0;
    } else {
      iAngle = Math.imul(270, iPrec) - iAngle | 0;
    }
  }
  return iAngle;
}

export function DWordAligned(val) {
  if (val % 4 !== 0) {
    val >>= 2;
    val <<= 2;
    val = val + 4 | 0;
  }
  return val;
}

export function MemCopy(lpMem1, lpMem2, dwSize) {
  c$memmove(lpMem2, lpMem1, dwSize);
}

export function Pow(base, exponent) {
  if (exponent < 0) {
    return 0;
  }
  let result = 1;
  if ((exponent & 1) !== 0) {
    result = base;
  }
  exponent >>= 1;
  while (exponent !== 0) {
    base = Math.imul(base, base);
    if ((exponent & 1) !== 0) {
      result = Math.imul(result, base);
    }
    exponent >>= 1;
  }
  return result;
}

export function CharCapital(cChar) {
  return c$toupper(cChar) << 24 >> 24;
}

export function IsWhiteSpace(cChar) {
  return !!(c$isspace(cChar & 0xff) !== 0);
}

export function SLen(sptr) {
  return sptr != null ? c$strlen(sptr) : 0;
}

export function SLenUntil(szStr, cUntil) {
  if (szStr == null) {
    return 0;
  }
  let end = c$strchr(szStr, cUntil);
  return end != null ? $u64n(end.o - szStr.o) : c$strlen(szStr);
}

export function GetNextCharacter(pszString) {
  let c = pszString.a[pszString.o].a[pszString.a[pszString.o].o] & 0xff;
  if (c < 128) {
    pszString.a[pszString.o] = pszString.a[pszString.o].add(1);
    return c;
  } else {
    return GetNextUTF8Character(pszString);
  }
}

export function IsIdentifier(cChar) {
  if (Inside$i8$i8$i8(cChar, 65, 90)) {
    return true;
  }
  if (Inside$i8$i8$i8(cChar, 97, 122)) {
    return true;
  }
  if (Inside$i8$i8$i8(cChar, 48, 57)) {
    return true;
  }
  if (cChar === 95) {
    return true;
  }
  if (cChar === 126) {
    return true;
  }
  if (cChar === 43) {
    return true;
  }
  if (cChar === 45) {
    return true;
  }
  return false;
}

export function SEqual(szStr1, szStr2) {
  return szStr1 != null && szStr2 != null ? !(c$strcmp(szStr1, szStr2) !== 0) : false;
}

function IsNumber(c, base) {
  return c >= 48 && c <= 57 && c < (48 + base | 0) || c >= 97 && c <= 122 && c < ((97 + base | 0) - 10 | 0) || c >= 65 && c <= 90 && c < ((65 + base | 0) - 10 | 0);
}

function ToNumber(c) {
  if (c >= 48 && c <= 57) {
    return c - 48 | 0;
  }
  if (c >= 97 && c <= 122) {
    return (10 + c | 0) - 97 | 0;
  }
  if (c >= 65 && c <= 90) {
    return (10 + c | 0) - 65 | 0;
  }
  0;
  return 0;
}

export function StrToI32(str, base, scan_end) {
  let $t1;
  let s = str;
  let sign = 1;
  let result = 0;
  if (s.a[s.o] === 45) {
    sign = -1;
    s = s.add(1);
  } else if (s.a[s.o] === 43) {
    s = s.add(1);
  }
  if (s.a[s.o] === 0) {
    if (scan_end != null) {
      scan_end.a[scan_end.o] = str;
    }
    return 0;
  }
  while (IsNumber(s.a[s.o], base)) {
    let value = ToNumber($rd(($t1 = s, s = s.add(1), $t1)));
    0;
    result = Math.imul(result, base);
    result = result + value | 0;
  }
  if (scan_end != null) {
    scan_end.a[scan_end.o] = s;
  }
  result = Math.imul(result, sign);
  return result;
}

export function SCopy$pi8$pi8$u64(szSource, sTarget, iMaxL) {
  if ($peq(szSource, sTarget)) {
    return;
  }
  if (sTarget == null) {
    return;
  }
  sTarget.a[sTarget.o] = 0;
  if (szSource == null) {
    return;
  }
  while (szSource.a[szSource.o] !== 0 && iMaxL > 0) {
    sTarget.a[sTarget.o] = szSource.a[szSource.o];
    iMaxL = iMaxL - 1;
    szSource = szSource.add(1);
    sTarget = sTarget.add(1);
  }
  sTarget.a[sTarget.o] = 0;
}

export function osprintf(str, fmt, ...$va) {
  let args = null;
  args = { a: $va, i: 0 };
  return c$vsprintf(str, fmt, args);
}

export function SCopy$pi8$pi8(szSource, sTarget) {
  if ($peq(szSource, sTarget)) {
    return;
  }
  if (sTarget == null) {
    return;
  }
  sTarget.a[sTarget.o] = 0;
  if (szSource == null) {
    return;
  }
  c$strcpy(sTarget, szSource);
}

export function ssprintf(str, fmt, ...$va) {
  let args = null;
  args = { a: $va, i: 0 };
  let m = c$vsnprintf(P(str, 0), 101, fmt, args);
  if (m < 0) {
    return m;
  }
  if ($u64n(m) >= 101) {
    m = 100;
    str[m] = 0;
  }
  return m;
}

export function ssprintf$2(str, fmt, ...$va) {
  let args = null;
  args = { a: $va, i: 0 };
  let m = c$vsnprintf(P(str, 0), 3, fmt, args);
  if (m < 0) {
    return m;
  }
  if ($u64n(m) >= 3) {
    m = 2;
    str[m] = 0;
  }
  return m;
}

export function SCopyUntil$pi8$pi8$i8$i32$i32(szSource, sTarget, cUntil, iMaxL = -1, iIndex = 0) {
  if ($peq(szSource, sTarget)) {
    return;
  }
  if (sTarget == null) {
    return;
  }
  sTarget.a[sTarget.o] = 0;
  if (szSource == null) {
    return;
  }
  while (szSource.a[szSource.o] !== 0 && (szSource.a[szSource.o] !== cUntil || iIndex > 0) && iMaxL !== 0) {
    sTarget.a[sTarget.o] = szSource.a[szSource.o];
    if (szSource.a[szSource.o] === cUntil) {
      iIndex = iIndex - 1 | 0;
    }
    szSource = szSource.add(1);
    sTarget = sTarget.add(1);
    iMaxL = iMaxL - 1 | 0;
  }
  sTarget.a[sTarget.o] = 0;
}

export function SCopyUntil$pi8$pi8$pi8$u64(szSource, sTarget, sUntil, iMaxL) {
  let n = $min(c$strcspn(szSource, sUntil), iMaxL - 1);
  c$strncpy(sTarget, szSource, n);
  sTarget.a[sTarget.o + n] = 0;
}

export function SEqualUntil(szStr1, szStr2, cWild) {
  if (szStr1 == null || szStr2 == null) {
    return false;
  }
  while (szStr1.a[szStr1.o] !== 0 || szStr2.a[szStr2.o] !== 0) {
    if (szStr1.a[szStr1.o] === cWild || szStr2.a[szStr2.o] === cWild) {
      return true;
    }
    if (szStr1.a[szStr1.o] !== szStr2.a[szStr2.o]) {
      return false;
    }
    szStr1 = szStr1.add(1);
    szStr2 = szStr2.add(1);
  }
  return true;
}

export function SEqual2(szStr1, szStr2) {
  let $t1, $t2;
  if (szStr1 == null || szStr2 == null) {
    return false;
  }
  while (szStr1.a[szStr1.o] !== 0 && szStr2.a[szStr2.o] !== 0) {
    if ($rd(($t1 = szStr1, szStr1 = szStr1.add(1), $t1)) !== $rd(($t2 = szStr2, szStr2 = szStr2.add(1), $t2))) {
      return false;
    }
  }
  if (szStr2.a[szStr2.o] !== 0) {
    return false;
  }
  return true;
}

export function SEqualNoCase(szStr1, szStr2, iLen = -1) {
  let $t1, $t2;
  if (szStr1 == null || szStr2 == null) {
    return false;
  }
  if (iLen === 0) {
    return true;
  }
  while (szStr1.a[szStr1.o] !== 0 && szStr2.a[szStr2.o] !== 0) {
    if (CharCapital($rd(($t1 = szStr1, szStr1 = szStr1.add(1), $t1))) !== CharCapital($rd(($t2 = szStr2, szStr2 = szStr2.add(1), $t2)))) {
      return false;
    }
    if (iLen > 0) {
      iLen = iLen - 1 | 0;
      if (iLen === 0) {
        return true;
      }
    }
  }
  if (szStr1.a[szStr1.o] !== 0 || szStr2.a[szStr2.o] !== 0) {
    return false;
  }
  return true;
}

export function SEqual2NoCase(szStr1, szStr2, iLen = -1) {
  let $t1, $t2;
  if (szStr1 == null || szStr2 == null) {
    return false;
  }
  if (iLen === 0) {
    return true;
  }
  while (szStr1.a[szStr1.o] !== 0 && szStr2.a[szStr2.o] !== 0) {
    if (CharCapital($rd(($t1 = szStr1, szStr1 = szStr1.add(1), $t1))) !== CharCapital($rd(($t2 = szStr2, szStr2 = szStr2.add(1), $t2)))) {
      return false;
    }
    if (iLen > 0) {
      iLen = iLen - 1 | 0;
      if (iLen === 0) {
        return true;
      }
    }
  }
  if (szStr2.a[szStr2.o] !== 0) {
    return false;
  }
  return true;
}

export function SCharPos(cTarget, szInStr, iIndex = 0) {
  let cpos = null;
  let ccpos = 0;
  if (szInStr == null) {
    return -1;
  }
  for (cpos = szInStr, ccpos = 0; cpos.a[cpos.o] !== 0; cpos = cpos.add(1), ccpos = ccpos + 1 | 0) {
    if (cpos.a[cpos.o] === cTarget) {
      if (iIndex === 0) {
        return ccpos;
      } else {
        iIndex = iIndex - 1 | 0;
      }
    }
  }
  return -1;
}

export function SCharLastPos(cTarget, szInStr) {
  let cpos = null;
  let ccpos = 0;
  let lcpos = 0;
  if (szInStr == null) {
    return -1;
  }
  for (cpos = szInStr, ccpos = 0, lcpos = -1; cpos.a[cpos.o] !== 0; cpos = cpos.add(1), ccpos = ccpos + 1 | 0) {
    if (cpos.a[cpos.o] === cTarget) {
      lcpos = ccpos;
    }
  }
  return lcpos;
}

export function SAppend(szSource, szTarget, iMaxL = -1) {
  if (iMaxL === -1) {
    SCopy$pi8$pi8(szSource, $padd(szTarget, SLen(szTarget)));
  } else {
    SCopy$pi8$pi8$u64(szSource, $padd(szTarget, SLen(szTarget)), $u64n(iMaxL) - SLen(szTarget));
  }
}

export function SAppendChar(cChar, szStr) {
  if (szStr == null) {
    return;
  }
  let cPos = null;
  for (cPos = szStr; cPos.a[cPos.o] !== 0; cPos = cPos.add(1)) {
  }
  cPos.a[cPos.o] = cChar;
  $wr($padd(cPos, 1), 0, 0);
}

export function SCopySegment(szString, iSegment, sTarget, cSeparator = 59, iMaxL = -1, fSkipWhitespace = false) {
  while (iSegment > 0) {
    if (SCharPos(cSeparator, szString) === -1) {
      sTarget.a[sTarget.o + 0] = 0;
      return false;
    }
    szString = szString.add(SCharPos(cSeparator, szString) + 1 | 0);
    iSegment = iSegment - 1 | 0;
  }
  if (fSkipWhitespace) {
    szString = SAdvanceSpace(szString);
  }
  SCopyUntil$pi8$pi8$i8$i32$i32(szString, sTarget, cSeparator, iMaxL);
  return true;
}

export function SCopySegmentEx(szString, iSegment, sTarget, cSep1, cSep2, iMaxL = -1, fSkipWhitespace = false) {
  while (iSegment > 0) {
    let iPos1 = SCharPos(cSep1, szString);
    let iPos2 = SCharPos(cSep2, szString);
    if (iPos1 === -1) {
      if (iPos2 === -1) {
        sTarget.a[sTarget.o + 0] = 0;
        return false;
      } else {
        iPos1 = iPos2;
      }
    } else if (iPos2 !== -1 && iPos2 < iPos1) {
      iPos1 = iPos2;
    }
    szString = szString.add(iPos1 + 1 | 0);
    iSegment = iSegment - 1 | 0;
  }
  if (fSkipWhitespace) {
    szString = SAdvanceSpace(szString);
  }
  let iPos1 = SCharPos(cSep1, szString);
  let iPos2 = SCharPos(cSep2, szString);
  if (iPos2 !== -1 && (iPos2 < iPos1 || iPos1 === -1)) {
    cSep1 = cSep2;
  }
  SCopyUntil$pi8$pi8$i8$i32$i32(szString, sTarget, cSep1, iMaxL);
  return true;
}

export function SCharCount(cTarget, szInStr, cpUntil = null) {
  let iResult = 0;
  while (szInStr.a[szInStr.o] !== 0) {
    if ($peq(szInStr, cpUntil)) {
      return iResult;
    }
    if (szInStr.a[szInStr.o] === cTarget) {
      iResult = iResult + 1 >>> 0;
    }
    szInStr = szInStr.add(1);
  }
  return iResult;
}

export function SCharCountEx(szString, szCharList) {
  let iResult = 0;
  while (szCharList.a[szCharList.o] !== 0) {
    iResult = iResult + SCharCount(szCharList.a[szCharList.o], szString) >>> 0;
    szCharList = szCharList.add(1);
  }
  return iResult;
}

export function SReplaceChar(str, fc, tc) {
  while (str != null && str.a[str.o] !== 0) {
    if (str.a[str.o] === fc) {
      str.a[str.o] = tc;
    }
    str = str.add(1);
  }
}

export function SCapitalize(str) {
  while (str != null && str.a[str.o] !== 0) {
    str.a[str.o] = CharCapital(str.a[str.o]);
    str = str.add(1);
  }
}

export function SSearch(szString, szIndex) {
  let cscr = null;
  let indexlen = 0;
  let match = 0;
  if (szString == null || szIndex == null) {
    return null;
  }
  indexlen = SLen(szIndex);
  for (cscr = szString; cscr != null && cscr.a[cscr.o] !== 0; cscr = cscr.add(1)) {
    if (cscr.a[cscr.o] === szIndex.a[szIndex.o + match]) {
      match = match + 1;
    } else {
      match = 0;
    }
    if (match >= indexlen) {
      return $padd(cscr, 1);
    }
  }
  return null;
}

export function SSearchNoCase(szString, szIndex) {
  let cscr = null;
  let indexlen = 0;
  let match = 0;
  if (szString == null || szIndex == null) {
    return null;
  }
  indexlen = SLen(szIndex);
  for (cscr = szString; cscr != null && cscr.a[cscr.o] !== 0; cscr = cscr.add(1)) {
    if (CharCapital(cscr.a[cscr.o]) === CharCapital(szIndex.a[szIndex.o + match])) {
      match = match + 1;
    } else {
      match = 0;
    }
    if (match >= indexlen) {
      return $padd(cscr, 1);
    }
  }
  return null;
}

export function SWordWrap(szText, cSpace, cSepa, iMaxLine) {
  if (szText == null) {
    return;
  }
  let cPos = null;
  let cpLastSpace = null;
  let iLineRun = 0;
  for (cPos = szText; cPos.a[cPos.o] !== 0; cPos = cPos.add(1)) {
    if (cPos.a[cPos.o] === cSpace) {
      cpLastSpace = cPos;
    }
    if (cPos.a[cPos.o] === cSepa) {
      iLineRun = 0;
    }
    if (iLineRun >= iMaxLine) {
      if (cpLastSpace != null) {
        cpLastSpace.a[cpLastSpace.o] = cSepa;
        iLineRun = cPos.o - cpLastSpace.o | 0;
      }
    }
    iLineRun = iLineRun + 1 | 0;
  }
}

export function SAdvanceSpace(szSPos) {
  if (szSPos == null) {
    return null;
  }
  while (IsWhiteSpace(szSPos.a[szSPos.o])) {
    szSPos = szSPos.add(1);
  }
  return szSPos;
}

export function SRewindSpace(szSPos, pBegin) {
  if (szSPos == null || pBegin == null) {
    return null;
  }
  while (IsWhiteSpace(szSPos.a[szSPos.o])) {
    szSPos = szSPos.add(-1);
    if (szSPos.o < pBegin.o) {
      return null;
    }
  }
  return szSPos;
}

export function SAdvancePast(szSPos, cPast) {
  if (szSPos == null) {
    return null;
  }
  while (szSPos.a[szSPos.o] !== 0) {
    if (szSPos.a[szSPos.o] === cPast) {
      szSPos = szSPos.add(1);
      break;
    }
    szSPos = szSPos.add(1);
  }
  return szSPos;
}

export function SCopyIdentifier(szSource, sTarget, iMaxL = 0) {
  let $t1, $t2, $t3, $t4;
  if (szSource == null || sTarget == null) {
    return;
  }
  while (IsIdentifier(szSource.a[szSource.o])) {
    if (iMaxL === 1) {
      $wr(($t1 = sTarget, sTarget = sTarget.add(1), $t1), 0, $rd(($t2 = szSource, szSource = szSource.add(1), $t2)));
      break;
    }
    iMaxL = iMaxL - 1 | 0;
    $wr(($t3 = sTarget, sTarget = sTarget.add(1), $t3), 0, $rd(($t4 = szSource, szSource = szSource.add(1), $t4)));
  }
  sTarget.a[sTarget.o] = 0;
}

export function SClearFrontBack(szString, cClear = 32) {
  let cleared = 0;
  let cpos = null;
  if (szString == null) {
    return 0;
  }
  for (cpos = szString; cpos.a[cpos.o] !== 0 && cpos.a[cpos.o] === cClear; cpos = cpos.add(1), cleared = cleared + 1 | 0) {
  }
  if (!$peq(cpos, szString)) {
    c$memmove(szString, cpos, SLen(cpos) + 1);
  }
  for (cpos = $padd($padd(szString, SLen(szString)), -1); cpos.o > szString.o && cpos.a[cpos.o] === cClear; cpos = cpos.add(-1), cleared = cleared + 1 | 0) {
    cpos.a[cpos.o] = 0;
  }
  return cleared;
}

export function SNewSegment(szStr, szSepa = S(";")) {
  if (szStr.a[szStr.o + 0] !== 0) {
    SAppend(szSepa, szStr);
  }
}

export function SGetLine(szText, cpPosition) {
  if (szText == null || cpPosition == null) {
    return 0;
  }
  let iLines = 1;
  while (szText.a[szText.o] !== 0 && szText.o < cpPosition.o) {
    if (szText.a[szText.o] === 10) {
      iLines = iLines + 1 | 0;
    }
    szText = szText.add(1);
  }
  return iLines;
}

export function SLineGetCharacters(szText, cpPosition) {
  if (szText == null || cpPosition == null) {
    return 0;
  }
  let iChars = 1;
  while (szText.a[szText.o] !== 0 && szText.o < cpPosition.o) {
    if (szText.a[szText.o] === 10) {
      iChars = 1;
    } else if (szText.a[szText.o] === 9) {
      iChars = (((iChars - 1 | 0) + 8 | 0) & -8) + 1 | 0;
    } else {
      iChars = iChars + 1 | 0;
    }
    szText = szText.add(1);
  }
  return iChars;
}

export function SInsert(szString, szInsert, iPosition = 0, iMaxLen = -1) {
  if (szString == null || szInsert == null || szInsert.a[szInsert.o + 0] === 0) {
    return;
  }
  let insertlen = c$strlen(szInsert);
  if (iMaxLen >= 0 && c$strlen(szString) + insertlen > $u64n(iMaxLen)) {
    return;
  }
  c$memmove($padd($padd(szString, iPosition), insertlen), $padd(szString, iPosition), SLen($padd(szString, iPosition)) + 1);
  MemCopy(szInsert, $padd(szString, iPosition), SLen(szInsert));
}

export function SDelete(szString, iLen, iPosition = 0) {
  if (szString == null) {
    return;
  }
  MemCopy($padd($padd(szString, iPosition), iLen), $padd(szString, iPosition), SLen($padd($padd(szString, iPosition), iLen)) + 1);
}

export function SCopyEnclosed(szSource, cOpen, cClose, sTarget, iSize) {
  let iPos = 0;
  let iLen = 0;
  if (szSource == null || sTarget == null) {
    return false;
  }
  if ((iPos = SCharPos(cOpen, szSource)) < 0) {
    return false;
  }
  if ((iLen = SCharPos(cClose, $padd($padd(szSource, iPos), 1))) < 0) {
    return false;
  }
  SCopy$pi8$pi8$u64($padd($padd(szSource, iPos), 1), sTarget, $u64n($min(iLen, iSize)));
  return true;
}

export function SGetModule(szList, iIndex, sTarget, iSize = -1) {
  if (szList == null || sTarget == null) {
    return false;
  }
  if (!SCopySegment(szList, iIndex, sTarget, 59, iSize)) {
    return false;
  }
  SClearFrontBack(sTarget);
  return true;
}

export function SIsModule(szList, szString, ipIndex = null, fCaseSensitive = false) {
  const szModule = new Int8Array(1025);
  for (let iMod = 0; SGetModule(szList, iMod, P(szModule, 0), 1024); iMod = iMod + 1 | 0) {
    if (fCaseSensitive ? SEqual(szString, P(szModule, 0)) : SEqualNoCase(szString, P(szModule, 0))) {
      if (ipIndex != null) {
        ipIndex.a[ipIndex.o] = iMod;
      }
      return true;
    }
  }
  return false;
}

export function SAddModule(szList, szModule, fCaseSensitive = false) {
  if (szList == null || szModule == null || szModule.a[szModule.o + 0] === 0) {
    return false;
  }
  if (SIsModule(szList, szModule, null, fCaseSensitive)) {
    return false;
  }
  SNewSegment(szList);
  SAppend(szModule, szList);
  return true;
}

export function SAddModules(szList, szModules, fCaseSensitive = false) {
  if (szList == null || szModules == null || szModules.a[szModules.o + 0] === 0) {
    return false;
  }
  const szModule = new Int8Array(1025);
  for (let cnt = 0; SGetModule(szModules, cnt, P(szModule, 0), 1024); cnt = cnt + 1 | 0) {
    SAddModule(szList, P(szModule, 0), fCaseSensitive);
  }
  return true;
}

export function SRemoveModule(szList, szModule, fCaseSensitive = false) {
  const iMod = [0];
  let iPos = 0;
  let iLen = 0;
  if (!SIsModule(szList, szModule, P(iMod, 0), fCaseSensitive)) {
    return false;
  }
  iPos = 0;
  if (iMod[0] > 0) {
    iPos = SCharPos(59, szList, iMod[0] - 1 | 0) + 1 | 0;
  }
  iLen = SCharPos(59, $padd(szList, iPos));
  if (iLen < 0) {
    iLen = SLen(szList) | 0;
  } else {
    iLen = iLen + 1 | 0;
  }
  SDelete(szList, iLen, iPos);
  return true;
}

export function SRemoveModules(szList, szModules, fCaseSensitive = false) {
  if (szList == null || szModules == null || szModules.a[szModules.o + 0] === 0) {
    return false;
  }
  const szModule = new Int8Array(1025);
  for (let cnt = 0; SGetModule(szModules, cnt, P(szModule, 0), 1024); cnt = cnt + 1 | 0) {
    SRemoveModule(szList, P(szModule, 0), fCaseSensitive);
  }
  return true;
}

export function SModuleCount(szList) {
  if (szList == null) {
    return 0;
  }
  let iCount = 0;
  let fNewModule = true;
  while (szList.a[szList.o] !== 0) {
    switch (szList.a[szList.o]) {
      case 32:
        break;
      case 59:
        fNewModule = true;
        break;
      default:
        if (fNewModule) {
          iCount = iCount + 1 | 0;
        }
        fNewModule = false;
        break;
    }
    szList = szList.add(1);
  }
  return iCount;
}

export function SWildcardMatchEx(szString, szWildcard) {
  if (szString == null || szWildcard == null) {
    return false;
  }
  let pWild = szWildcard;
  let pPos = szString;
  let pLWild = null;
  let pLPos = null;
  while (pWild.a[pWild.o] !== 0 || pLWild != null) {
    if (pWild.a[pWild.o] === 42) {
      pLWild = (pWild = pWild.add(1));
      pLPos = pPos;
    } else if (pPos.a[pPos.o] === 0) {
      break;
    } else if (pWild.a[pWild.o] === 63 || pWild.a[pWild.o] === pPos.a[pPos.o]) {
      pWild = pWild.add(1);
      pPos = pPos.add(1);
    } else if (pLPos != null) {
      pWild = pLWild;
      pPos = (pLPos = pLPos.add(1));
    } else {
      return false;
    }
  }
  return pWild.a[pWild.o] === 0 && pPos.a[pPos.o] === 0;
}



export function IsValidUtf8(text, length = -1) {
  let input = $view8(text, false);
  for (let cursor = input; length < 0 ? cursor.a[cursor.o] !== 0 : cursor.o - input.o < length; cursor = cursor.add(1)) {
    let continuation_bytes = $.utf8_continuation_byte_table$Standard[cursor.a[cursor.o]];
    if (continuation_bytes < 0) {
      return false;
    } else if (continuation_bytes === 0) {
      continue;
    } else if (length >= 0 && cursor.o - input.o + continuation_bytes >= length) {
      return false;
    }
    0;
    let value = cursor.a[cursor.o];
    value = (value & (255 >> (continuation_bytes + 1 | 0)) >>> 0) >>> 0;
    for (let byte = 0; byte < continuation_bytes; byte = byte + 1 | 0) {
      if ((cursor.a[cursor.o + (byte + 1 | 0)] & 192) !== 128) {
        return false;
      }
      value = (value << 6) >>> 0;
      value = (value | (cursor.a[cursor.o + (byte + 1 | 0)] & 63) >>> 0) >>> 0;
    }
    if (value < $.utf8_min_char_value$Standard[continuation_bytes]) {
      return false;
    }
    if (value > 0x10ffff) {
      return false;
    }
    if (value >= 55296 && value <= 57343) {
      return false;
    }
    cursor = cursor.add(continuation_bytes);
  }
  return true;
}

export function GetNextUTF8Character(pszString) {
  let $t1, $t2, $t3, $t4, $t5, $t6, $t7;
  let REPLACEMENT_CHARACTER = 65533;
  let szString = pszString.a[pszString.o];
  let c = $rd(($t1 = szString, szString = szString.add(1), $t1)) & 0xff;
  let dwResult = REPLACEMENT_CHARACTER;
  0;
  if (c > 191 && c < 224) {
    let c2 = $rd(($t2 = szString, szString = szString.add(1), $t2)) & 0xff;
    if ((c2 & 192) !== 128) {
      pszString.a[pszString.o] = szString;
      return REPLACEMENT_CHARACTER;
    }
    dwResult = ((c & 31) << 6 | 0 | c2 & 63) >>> 0;
  } else if (c >= 224 && c <= 239) {
    let c2 = $rd(($t3 = szString, szString = szString.add(1), $t3)) & 0xff;
    if ((c2 & 192) !== 128) {
      pszString.a[pszString.o] = szString;
      return REPLACEMENT_CHARACTER;
    }
    let c3 = $rd(($t4 = szString, szString = szString.add(1), $t4)) & 0xff;
    if ((c3 & 192) !== 128) {
      pszString.a[pszString.o] = szString;
      return REPLACEMENT_CHARACTER;
    }
    dwResult = ((c & 15) << 12 | 0 | ((c2 & 63) << 6 | 0) | c3 & 63) >>> 0;
  } else if (c >= 240 && c <= 247) {
    let c2 = $rd(($t5 = szString, szString = szString.add(1), $t5)) & 0xff;
    if ((c2 & 192) !== 128) {
      pszString.a[pszString.o] = szString;
      return REPLACEMENT_CHARACTER;
    }
    let c3 = $rd(($t6 = szString, szString = szString.add(1), $t6)) & 0xff;
    if ((c3 & 192) !== 128) {
      pszString.a[pszString.o] = szString;
      return REPLACEMENT_CHARACTER;
    }
    let c4 = $rd(($t7 = szString, szString = szString.add(1), $t7)) & 0xff;
    if ((c4 & 192) !== 128) {
      pszString.a[pszString.o] = szString;
      return REPLACEMENT_CHARACTER;
    }
    dwResult = ((c & 7) << 18 | 0 | ((c2 & 63) << 12 | 0) | ((c3 & 63) << 6 | 0) | c4 & 63) >>> 0;
  }
  pszString.a[pszString.o] = szString;
  return dwResult;
}

export function GetCharacterCount(s) {
  let l = 0;
  while (s.a[s.o] !== 0) {
    let c = s.a[s.o] & 0xff;
    if (c < 128 || c > 247) {
      l = l + 1 | 0;
      s = s.add(1);
    } else if (c > 191 && c < 224) {
      l = l + 1 | 0;
      s = s.add(2);
    } else if (c >= 224 && c <= 239) {
      l = l + 1 | 0;
      s = s.add(3);
    } else if (c >= 240 && c <= 247) {
      l = l + 1 | 0;
      s = s.add(4);
    } else {
      0;
    }
  }
  return l;
}

export function vstrprintf(format, args) {
  let argcopy = null;
  argcopy = { a: args.a, i: args.i };
  let size = c$vsnprintf(null, 0, format, argcopy);
  if (size < 0) {
    $throw(new StdException(S("invalid argument to strprintf")));
  }
  void 0;
  let s = new StdString();
  s.resize($u64n(size + 1 | 0));
  size = c$vsnprintf(P(s.d, 0), s.size(), format, args);
  0;
  s.resize($u64n(size));
  return s;
}

export function strprintf(format, ...$va) {
  let args = null;
  args = { a: $va, i: 0 };
  let s = vstrprintf(format, args);
  void 0;
  return s;
}

export function $init(): void {
  $.utf8_continuation_byte_table$Standard = new Int32Array([
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  -1, -1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
  3, 3, 3, 3, 3, -3, -3, -3, -4, -4, -4, -4, -5, -5, -1, -1,
]);
  $.utf8_min_char_value$Standard = new Uint32Array([0, 128, 2048, 65536]);
}

Object.assign($, { Abs$i32, Abs$i64, Angle, CharCapital, Clamp$i32$i32$i32, Clamp$i64$i64$i64, Clamp$u32$u32$u32, DWordAligned, Distance, GetCharacterCount, GetNextCharacter, GetNextUTF8Character, Inside$i32$i32$i32, Inside$i64$i64$i64, Inside$i8$i8$i8, Inside$u8$u64$u64, IsIdentifier, IsNumber, IsValidUtf8, IsWhiteSpace, MemCopy, Pow, SAddModule, SAddModules, SAdvancePast, SAdvanceSpace, SAppend, SAppendChar, SCapitalize, SCharCount, SCharCountEx, SCharLastPos, SCharPos, SClearFrontBack, SCopy$pi8$pi8, SCopy$pi8$pi8$u64, SCopyEnclosed, SCopyIdentifier, SCopySegment, SCopySegmentEx, SCopyUntil$pi8$pi8$i8$i32$i32, SCopyUntil$pi8$pi8$pi8$u64, SDelete, SEqual, SEqual2, SEqual2NoCase, SEqualNoCase, SEqualUntil, SGetLine, SGetModule, SInsert, SIsModule, SLen, SLenUntil, SLineGetCharacters, SModuleCount, SNewSegment, SRemoveModule, SRemoveModules, SReplaceChar, SRewindSpace, SSearch, SSearchNoCase, SWildcardMatchEx, SWordWrap, StrToI32, ToNumber, osprintf, ssprintf, ssprintf$2, strprintf, vstrprintf });
