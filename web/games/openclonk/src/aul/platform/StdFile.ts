// @ts-nocheck
// OpenClonk 36de799: src/platform/StdFile.cpp, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { c$fprintf, c$stderr, c$tolower } from '../../rt/libc.ts';
import { RealPath } from '../../rt/native.ts';
import { $padd, $rd, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';

export function GetFilename$2(szPath) {
  if (szPath == null) {
    return null;
  }
  let pPos = null;
  let pFilename = szPath;
  for (pPos = szPath; pPos.a[pPos.o] !== 0; pPos = pPos.add(1)) {
    if (pPos.a[pPos.o] === 47 || pPos.a[pPos.o] === 47) {
      pFilename = $padd(pPos, 1);
    }
  }
  return pFilename;
}

export function GetFilename(szPath) {
  if (szPath == null) {
    return null;
  }
  let pPos = null;
  let pFilename = szPath;
  for (pPos = szPath; pPos.a[pPos.o] !== 0; pPos = pPos.add(1)) {
    if (pPos.a[pPos.o] === 47 || pPos.a[pPos.o] === 47) {
      pFilename = $padd(pPos, 1);
    }
  }
  return pFilename;
}

export function GetExtension$2(szFilename) {
  let pos = 0;
  let end = 0;
  for (end = 0; szFilename.a[szFilename.o + end] !== 0; end = end + 1 | 0) {
  }
  pos = end;
  while (pos > 0 && szFilename.a[szFilename.o + (pos - 1 | 0)] !== 46 && szFilename.a[szFilename.o + (pos - 1 | 0)] !== 47) {
    pos = pos - 1 | 0;
  }
  if (pos > 0 && szFilename.a[szFilename.o + (pos - 1 | 0)] === 46) {
    return $padd(szFilename, pos);
  }
  return $padd(szFilename, end);
}

export function GetExtension(szFilename) {
  let pos = 0;
  let end = 0;
  for (end = 0; szFilename.a[szFilename.o + end] !== 0; end = end + 1 | 0) {
  }
  pos = end;
  while (pos > 0 && szFilename.a[szFilename.o + (pos - 1 | 0)] !== 46 && szFilename.a[szFilename.o + (pos - 1 | 0)] !== 47) {
    pos = pos - 1 | 0;
  }
  if (pos > 0 && szFilename.a[szFilename.o + (pos - 1 | 0)] === 46) {
    return $padd(szFilename, pos);
  }
  return $padd(szFilename, end);
}

export function GetParentPath$pi8$pi8(szFilename, szBuffer) {
  $.SCopy$pi8$pi8$u64(szFilename, szBuffer, 4096);
  if (!($.SCharCount(47, szFilename) !== 0)) {
    RealPath(szFilename, szBuffer);
  }
  return TruncatePath(szBuffer);
}

export function TruncatePath(szPath) {
  if (szPath == null) {
    return false;
  }
  let iBSPos = 0;
  iBSPos = $.SCharLastPos(47, szPath);
  let iBSPos2 = 0;
  iBSPos2 = $.SCharLastPos(92, szPath);
  if (iBSPos2 > iBSPos) {
    c$fprintf(c$stderr, S("Warning: TruncatePath with a \\ (%s)\n"), szPath);
  }
  if (iBSPos < 0) {
    return false;
  }
  szPath.a[szPath.o + iBSPos] = 0;
  return true;
}

function WildcardMatchCharacterClass(charclass, matchchar) {
  let $t1;
  let cc = charclass.a[charclass.o];
  if ($rd(($t1 = cc, cc = cc.add(1), $t1)) !== 91) {
    return false;
  }
  let match = false;
  do {
    if (cc.a[cc.o + 1] === 45 && cc.a[cc.o + 2] !== 93) {
      if (matchchar >= cc.a[cc.o + 0] && matchchar <= cc.a[cc.o + 2]) {
        match = true;
      }
      cc = cc.add(2);
    } else if (cc.a[cc.o] === matchchar) {
      match = true;
    }
  } while ($rd((cc = cc.add(1))) !== 0 && cc.a[cc.o] !== 93);
  charclass.a[charclass.o] = cc;
  return match;
}

export function WildcardMatch(szWildcard, szString) {
  if (szString == null || szWildcard == null) {
    return false;
  }
  const pWild = [szWildcard];
  let pPos = szString;
  let pLWild = null;
  let pLPos = null;
  while (pWild[0].a[pWild[0].o] !== 0 || pLWild != null) {
    if (pWild[0].a[pWild[0].o] === 42) {
      pLWild = (pWild[0] = pWild[0].add(1));
      pLPos = pPos;
    } else if (pPos.a[pPos.o] === 0) {
      break;
    } else if (pWild[0].a[pWild[0].o] === 91 && WildcardMatchCharacterClass(P(pWild, 0), pPos.a[pPos.o]) || pWild[0].a[pWild[0].o] === 63 || c$tolower(pWild[0].a[pWild[0].o]) === c$tolower(pPos.a[pPos.o])) {
      pWild[0] = pWild[0].add(1);
      pPos = pPos.add(1);
    } else if (pLPos != null) {
      pWild[0] = pLWild;
      pPos = (pLPos = pLPos.add(1));
    } else {
      return false;
    }
  }
  return pWild[0].a[pWild[0].o] === 0 && pPos.a[pPos.o] === 0;
}

export function $init(): void {
}

Object.assign($, { GetExtension, GetExtension$2, GetFilename, GetFilename$2, GetParentPath$pi8$pi8, TruncatePath, WildcardMatch, WildcardMatchCharacterClass });
