// @ts-nocheck
// OpenClonk 36de799: src/platform/StdFile.cpp, src/platform/StdFile.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $u64n } from '../../rt/int.ts';
import { c$__errno_location, c$access, c$chdir, c$chmod, c$close, c$closedir, c$fclose, c$fopen, c$fprintf, c$fputs, c$fstat, c$getcwd, c$mkdir, c$open, c$opendir, c$read, c$readdir, c$realpath, c$remove, c$rename, c$rmdir, c$sscanf, c$stat, c$stderr, c$strerror, c$strlen, c$tolower, c$write } from '../../rt/libc.ts';
import { $padd, $peq, $rd, $wr, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $begin, $delete, $end, $itcopy, $missing, StdPair, StdString, std_sort } from '../../rt/std.ts';

export class DirectoryIterator {
  p = null;
  iter = null;

  init$pi8(dirname) {
    this.p = new DirectoryIteratorP().init();
    this.iter = $end(this.p.files);
    DirectoryIterator.prototype.Read.call(this, dirname);
    return this;
  }

  init$v() {
    this.p = new DirectoryIteratorP().init();
    this.iter = $end(this.p.files);
    return this;
  }

  $dtor() {
    if ((this.p.ref = this.p.ref - 1 | 0) === 0) {
      $delete(this.p);
    }
  }

  op_mul() {
    if (this.iter.eq($end(this.p.files))) {
      return null;
    }
    return this.iter.v.first.c_str();
  }

  GetName() {
    return this.op_mul();
  }

  GetFileSize() {
    return FileSize$pi8(this.iter.v.first.c_str());
  }

  op_inc$v() {
    if (!this.iter.eq($end(this.p.files))) {
      this.iter.inc();
    }
    return this;
  }

  op_inc$i32(_0) {
    let tmp = new DirectoryIterator().$copy(this);
    this.op_inc$v();
    return tmp;
  }

  Clear() {
    if (this.p.ref > 1) {
      this.p.ref = this.p.ref - 1 | 0;
      this.p = new DirectoryIteratorP().init();
    }
    this.p.directory.clear();
    this.p.files.length = 0;
    this.iter = $end(this.p.files).copy();
  }

  Reset$pi8$b(dirname, force_reread = false) {
    if (this.p.directory.eq(dirname) && !force_reread) {
      this.iter = $begin(this.p.files).copy();
      return;
    }
    if (this.p.ref > 1) {
      this.p.ref = this.p.ref - 1 | 0;
      this.p = new DirectoryIteratorP().init();
    }
    this.p.files.length = 0;
    this.iter = $end(this.p.files).copy();
    this.Read(dirname);
  }

  Reset$v() {
    this.iter = $begin(this.p.files).copy();
  }

  Read(dirname) {
    0;
    0;
    let search_path = StdString.of(dirname);
    if (!search_path.empty() && search_path.back() !== 47) {
      search_path.push_back(47);
    }
    let fh = c$opendir(dirname);
    if (fh == null) {
      switch ($rd(c$__errno_location())) {
        case 2:
        case 20:
          return;
        default:
          $.LogF(S("DirectoryIterator::Read(\"%s\"): %s"), dirname, c$strerror($rd(c$__errno_location())));
          return;
      }
    }
    let file = null;
    while ((file = c$readdir(fh)) != null) {
      if (file.d_name[0] === 46 && (file.d_name[1] === 0 || file.d_name[1] === 46 && file.d_name[2] === 0)) {
        continue;
      }
      this.p.files.push(new StdPair(StdString.of(file.d_name), 0));
    }
    c$closedir(fh);
    std_sort($begin(this.p.files), $end(this.p.files));
    for (const file of this.p.files) {
      file.first.insert(0, search_path);
    }
    this.iter = $begin(this.p.files).copy();
    this.p.directory.assign(dirname);
  }

  $copy(other) {
    this.p = other.p;
    this.iter = $itcopy(other.iter);
    this.p.ref = this.p.ref + 1 | 0;
    return this;
  }
  $clone() { return new DirectoryIterator().$copy(this); }
  $assign(other) {
    this.p = other.p;
    this.iter = other.iter.copy();
    this.p.ref = this.p.ref + 1 | 0;
    return this;
  }
}

export class DirectoryIteratorP {
  files = [];
  directory = new StdString();
  ref = 1;

  init() {
    this.files = [];
    this.directory = new StdString();
    this.ref = 1;
    return this;
  }

  $clone() { return new DirectoryIteratorP().$assign(this); }
  $assign(o) {
    this.files = o.files.slice();
    this.directory = o.directory.$clone();
    this.ref = o.ref;
    return this;
  }
}


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

export function GetFilenameOnly(strFilename) {
  if (!('GetFilenameOnly$strBuffer' in $)) $.GetFilenameOnly$strBuffer = new Int8Array(4097);
  $.SCopy$pi8$pi8(GetFilename(strFilename), P($.GetFilenameOnly$strBuffer, 0));
  RemoveExtension$pi8(P($.GetFilenameOnly$strBuffer, 0));
  return P($.GetFilenameOnly$strBuffer, 0);
}

export function GetC4Filename(szPath) {
  if (szPath == null) {
    return null;
  }
  let pPos = null;
  let pFilename = szPath;
  for (pPos = szPath; pPos.a[pPos.o] !== 0; pPos = pPos.add(1)) {
    if (pPos.a[pPos.o] === 47 || pPos.a[pPos.o] === 47) {
      if (pPos.o >= $padd(szPath, 4).o && $.SEqual2NoCase($padd(pPos, -4), S(".oc"))) {
        return pFilename;
      }
      pFilename = $padd(pPos, 1);
    }
  }
  return pFilename;
}

export function ItemAttributes(..._) { return $missing("ItemAttributes"); }

export function ItemExists(szItemName) {
  return FileExists(szItemName);
}

export function GetTrailingNumber(strString) {
  const iNumber = [0];
  let cpPos = $padd(strString, $.SLen(strString));
  while (cpPos.o > strString.o && $.Inside$i8$i8$i8($rd($padd(cpPos, -1)), 48, 57)) {
    cpPos = cpPos.add(-1);
  }
  c$sscanf(cpPos, S("%d"), P(iNumber, 0));
  return iNumber[0];
}

export function GetFilenameWeb$2(szPath) {
  if (szPath == null) {
    return null;
  }
  let pPos = null;
  let pFilename = szPath;
  for (pPos = szPath; pPos.a[pPos.o] !== 0; pPos = pPos.add(1)) {
    if (pPos.a[pPos.o] === 47) {
      pFilename = $padd(pPos, 1);
    }
  }
  return pFilename;
}

export function GetFilenameWeb(szPath) {
  if (szPath == null) {
    return null;
  }
  let pPos = null;
  let pFilename = szPath;
  for (pPos = szPath; pPos.a[pPos.o] !== 0; pPos = pPos.add(1)) {
    if (pPos.a[pPos.o] === 47) {
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

export function RealPath(szFilename, pFullFilename) {
  let pSuffix = null;
  const szCopy = new Int8Array(4097);
  for (; ; ) {
    if (c$realpath(szFilename, pFullFilename) != null) {
      break;
    }
    if (pSuffix == null) {
      $.SCopy$pi8$pi8$u64(szFilename, P(szCopy, 0), 4096);
      szFilename = P(szCopy, 0);
      pSuffix = $padd(P(szCopy, 0), $.SLen(P(szCopy, 0)));
    } else {
      pSuffix.a[pSuffix.o] = 47;
    }
    while (pSuffix.o > P(szCopy, 0).o) {
      if ($rd((pSuffix = pSuffix.add(-1))) === 47) {
        break;
      }
    }
    if (pSuffix.o <= P(szCopy, 0).o) {
      $.SCopy$pi8$pi8$u64(szFilename, pFullFilename, 4096);
      return;
    }
    pSuffix.a[pSuffix.o] = 0;
  }
  if (pSuffix != null) {
    pSuffix.a[pSuffix.o] = 47;
    $.SAppend(pSuffix, pFullFilename, 4096);
  }
}

export function GetParentPath$pi8$pi8(szFilename, szBuffer) {
  $.SCopy$pi8$pi8$u64(szFilename, szBuffer, 4096);
  if (!($.SCharCount(47, szFilename) !== 0)) {
    RealPath(szFilename, szBuffer);
  }
  return TruncatePath(szBuffer);
}

export function GetParentPath$pi8$pStdStrBuf(szFilename, outBuf) {
  const buf = new Int8Array(4097);
  $wr(P(buf, 0), 0, 0);
  if (!GetParentPath$pi8$pi8(szFilename, P(buf, 0))) {
    return false;
  }
  outBuf.Copy$pi8(P(buf, 0));
  return true;
}

export function GetRelativePathS(strPath, strRelativeTo) {
  if ($.SEqual2(strPath, strRelativeTo)) {
    return $padd($padd(strPath, $.SLen(strRelativeTo)), strPath.a[strPath.o + $.SLen(strRelativeTo)] === 47 ? 1 : 0);
  }
  return strPath;
}

export function IsGlobalPath(szPath) {
  if (szPath.a[szPath.o] === 47) {
    return true;
  }
  return false;
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

export function AppendBackslash(szFilename) {
  let i = $.SLen(szFilename) | 0;
  if (i > 0) {
    if (szFilename.a[szFilename.o + (i - 1 | 0)] === 47) {
      return;
    }
  }
  $.SAppendChar(47, szFilename);
}

export function TruncateBackslash(szFilename) {
  let i = $.SLen(szFilename) | 0;
  if (i > 0) {
    if (szFilename.a[szFilename.o + (i - 1 | 0)] === 47) {
      szFilename.a[szFilename.o + (i - 1 | 0)] = 0;
    }
  }
}

export function DefaultExtension$pi8$pi8(szFilename, szExtension) {
  if (!($rd(GetExtension$2(szFilename)) !== 0)) {
    $.SAppend(S("."), szFilename);
    $.SAppend(szExtension, szFilename);
  }
}

export function DefaultExtension$pStdStrBuf$pi8(sFilename, szExtension) {
  0;
  if (!($rd(GetExtension(sFilename.getData())) !== 0)) {
    sFilename.AppendChar(46);
    sFilename.Append$pi8(szExtension);
  }
}

export function EnforceExtension$pi8$pi8(szFilename, szExtension) {
  let ext = GetExtension$2(szFilename);
  if (ext.a[ext.o + 0] !== 0) {
    $.SCopy$pi8$pi8(szExtension, ext);
  } else {
    $.SAppend(S("."), szFilename);
    $.SAppend(szExtension, szFilename);
  }
}

export function EnforceExtension$pStdStrBuf$pi8(sFilename, szExtension) {
  0;
  let ext = GetExtension(sFilename.getData());
  if (ext.a[ext.o + 0] !== 0) {
    sFilename.ReplaceEnd($u64n(ext.o - sFilename.getData().o), szExtension);
  } else {
    sFilename.AppendChar(46);
    sFilename.Append$pi8(szExtension);
  }
}

export function RemoveExtension$pi8(szFilename) {
  let ext = GetExtension$2(szFilename);
  if (ext.a[ext.o + 0] !== 0) {
    ext.a[ext.o + -1] = 0;
  }
}

export function RemoveExtension$pStdStrBuf(psFileName) {
  if (psFileName != null && psFileName.op_const_void_() != null) {
    RemoveExtension$pi8(psFileName.getMData());
    psFileName.SetLength(c$strlen(psFileName.getData()));
  }
}

export function MakeTempFilename$pi8(szFilename) {
  DefaultExtension$pi8$pi8(szFilename, S("tmp"));
  let fn_ext = GetExtension$2(szFilename);
  let cnum = -1;
  do {
    cnum = cnum + 1 | 0;
    $.osprintf(fn_ext, S("%03d"), cnum);
  } while (FileExists(szFilename) && cnum < 999);
}

export function MakeTempFilename$pStdStrBuf(sFilename) {
  0;
  if (!(sFilename.getLength() !== 0)) {
    sFilename.Copy$pi8(S("temp.tmp"));
  }
  EnforceExtension$pStdStrBuf$pi8(sFilename, S("tmp"));
  let fn_ext = GetExtension$2(sFilename.getMData());
  let cnum = -1;
  do {
    cnum = cnum + 1 | 0;
    $.osprintf(fn_ext, S("%03d"), cnum);
  } while (FileExists(sFilename.getData()) && cnum < 999);
}

export function WildcardListMatch(szWildcardList, szString) {
  let $t1;
  if (szString == null || szWildcardList == null) {
    return false;
  }
  let sWildcard = new $.StdStrBuf();
  let sWildcardList = new $.StdStrBuf().init$pi8$b(szWildcardList);
  let i = 0;
  while (sWildcardList.GetSection($u64n(($t1 = i, i = i + 1 | 0, $t1)), sWildcard, 124)) {
    if (WildcardMatch(sWildcard.getData(), szString)) {
      return true;
    }
  }
  return false;
}

export function IsWildcardString(szString) {
  if (szString == null) {
    return false;
  }
  return $.SCharCount(63, szString) > 0 || $.SCharCount(42, szString) > 0 || $.SCharCount(91, szString) > 0;
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

export function MakeFilenameFromTitle(szTitle) {
  let $t1;
  let szFilename = szTitle;
  let szTitle2 = szTitle;
  while (szTitle2.a[szTitle2.o] !== 0) {
    let fStrip = false;
    if ($.IsWhiteSpace(szTitle2.a[szTitle2.o])) {
      fStrip = $peq(szFilename, szTitle);
    } else if (szTitle2.a[szTitle2.o] >>> 0 > 127) {
      fStrip = true;
    } else {
      fStrip = $.SCharPos(szTitle2.a[szTitle2.o], S("!\"'%&/=?+*#:;<>\\.")) >= 0;
    }
    if (!fStrip) {
      $wr(($t1 = szFilename, szFilename = szFilename.add(1), $t1), 0, szTitle2.a[szTitle2.o]);
    }
    szTitle2 = szTitle2.add(1);
  }
  while ($.IsWhiteSpace($rd((szFilename = szFilename.add(-1))))) {
    if ($peq(szFilename, szTitle)) {
      szFilename = szFilename.add(-1);
      break;
    }
  }
  $wr((szFilename = szFilename.add(1)), 0, 0);
  if (szTitle.a[szTitle.o] === 0) {
    $.SCopy$pi8$pi8$u64(S("unnamed"), szTitle, 50);
  }
}

export function FileExists(szFilename) {
  return !(c$access(szFilename, 0) !== 0);
}

export function FileSize$pi8(szFilename) {
  let stStats = {};
  if (c$stat(szFilename, stStats) !== 0) {
    return 0;
  }
  return $u64n(stStats.st_size);
}

export function FileSize$i32(fdes) {
  let stStats = {};
  if (c$fstat(fdes, stStats) !== 0) {
    return 0;
  }
  return $u64n(stStats.st_size);
}

export function FileTime(szFilename) {
  let stStats = {};
  if (c$stat(szFilename, stStats) !== 0) {
    return 0;
  }
  return stStats.st_mtim.tv_sec | 0;
}

export function EraseFile(szFilename) {
  if (c$remove(szFilename) !== 0) {
    if ($rd(c$__errno_location()) === 2) {
      return true;
    }
    return false;
  }
  return true;
}

export function CopyFile(szSource, szTarget, FailIfExists) {
  let fds = c$open(szSource, 524288);
  if (fds === 0) {
    return false;
  }
  let info = {};
  c$fstat(fds, info);
  let fdt = c$open(szTarget, 524353 | (FailIfExists ? 128 : 512), info.st_mode);
  if (fdt === 0) {
    c$close(fds);
    return false;
  }
  const buffer = new Int8Array(1024);
  let l = 0;
  while ((l = c$read(fds, P(buffer, 0), 1024)) > 0) {
    if (c$write(fdt, P(buffer, 0), $u64n(l)) < l) {
      l = -1;
      break;
    }
  }
  c$close(fds);
  c$close(fdt);
  return l !== -1;
}

export function RenameFile(szFilename, szNewFilename) {
  if (c$rename(szFilename, szNewFilename) < 0) {
    if ($rd(c$__errno_location()) !== 18) {
      return false;
    }
    if (CopyFile(szFilename, szNewFilename, false)) {
      return EraseFile(szFilename);
    }
    return false;
  }
  return true;
}

export function MakeOriginalFilename(szFilename) {
  if (szFilename == null) {
    return false;
  }
  if ($.SCharPos(42, szFilename) !== -1) {
    c$fputs(S("Warning: MakeOriginalFilename with \""), c$stderr);
    c$fputs(szFilename, c$stderr);
    c$fputs(S("\"!\n"), c$stderr);
  }
  return true;
}

export function GetWorkingDirectory() {
  if (!('GetWorkingDirectory$buf' in $)) $.GetWorkingDirectory$buf = new Int8Array(4097);
  return c$getcwd(P($.GetWorkingDirectory$buf, 0), 4096);
}

export function SetWorkingDirectory(path) {
  return c$chdir(path) === 0;
}

export function CreatePath(path) {
  0;
  if (!(c$mkdir(path.c_str(), 448) !== 0)) {
    return true;
  }
  switch ($rd(c$__errno_location())) {
    case 2:
      break;
    case 17:
      return true;
    default:
      return false;
  }
  let slash = path.find_last_of($.DirectorySeparators$StdFile);
  if (slash === 0 || slash === -1) {
    return false;
  }
  return CreatePath(path.substr(0, slash)) && CreatePath(path);
}

export function DirectoryExists(szFilename) {
  const bufFilename = new Int8Array(4097);
  if (szFilename != null && szFilename.a[szFilename.o + 0] !== 0) {
    let len = $.SLen(szFilename) >>> 0;
    if (len > 1 && (szFilename.a[szFilename.o + (len - 1 >>> 0)] === 92 || szFilename.a[szFilename.o + (len - 1 >>> 0)] === 47)) {
      $.SCopy$pi8$pi8$u64(szFilename, P(bufFilename, 0), 4096);
      bufFilename[$.SLen(P(bufFilename, 0)) - 1] = 0;
      szFilename = P(bufFilename, 0);
    }
  }
  let stStats = {};
  if (c$stat(szFilename, stStats) !== 0) {
    return false;
  }
  return (stStats.st_mode & 61440) >>> 0 === 16384;
  return false;
}

export function CopyDirectory(szSource, szTarget, fResetAttributes = false) {
  if (szSource == null || szTarget == null) {
    return false;
  }
  if (!DirectoryExists(szSource)) {
    return false;
  }
  if ($.SEqual(GetFilename(szSource), S(".")) || $.SEqual(GetFilename(szSource), S(".."))) {
    return true;
  }
  if (!EraseItem(szTarget)) {
    return false;
  }
  let status = true;
  if (c$mkdir(szTarget, 511) !== 0) {
    return false;
  }
  let d = c$opendir(szSource);
  let ent = null;
  const itemsource = new Int8Array(4097);
  const itemtarget = new Int8Array(4097);
  while ((ent = c$readdir(d)) != null) {
    $.SCopy$pi8$pi8(szSource, P(itemsource, 0));
    AppendBackslash(P(itemsource, 0));
    $.SAppend(P(ent.d_name, 0), P(itemsource, 0));
    $.SCopy$pi8$pi8(szTarget, P(itemtarget, 0));
    AppendBackslash(P(itemtarget, 0));
    $.SAppend(P(ent.d_name, 0), P(itemtarget, 0));
    if (!CopyItem(P(itemsource, 0), P(itemtarget, 0), fResetAttributes)) {
      status = false;
    }
  }
  c$closedir(d);
  return status;
}

export function EraseDirectory(szDirName) {
  if ($.SEqual(GetFilename(szDirName), S(".")) || $.SEqual(GetFilename(szDirName), S(".."))) {
    return true;
  }
  const path = new Int8Array(4097);
  let d = c$opendir(szDirName);
  let ent = null;
  while ((ent = c$readdir(d)) != null) {
    $.SCopy$pi8$pi8(szDirName, P(path, 0));
    AppendBackslash(P(path, 0));
    $.SAppend(P(ent.d_name, 0), P(path, 0));
    if (!EraseItem(P(path, 0))) {
      return false;
    }
  }
  c$closedir(d);
  if ($.SEqual(szDirName, GetWorkingDirectory())) {
    $.SCopy$pi8$pi8(GetWorkingDirectory(), P(path, 0));
    let lbacks = $.SCharLastPos(47, P(path, 0));
    if (lbacks > -1) {
      path[lbacks] = 0;
      SetWorkingDirectory(P(path, 0));
    }
  }
  return c$rmdir(szDirName) === 0 || $rd(c$__errno_location()) === 2;
}

export function RenameItem(szItemName, szNewItemName) {
  return RenameFile(szItemName, szNewItemName);
}

export function EraseItem(szItemName) {
  if (!EraseFile(szItemName)) {
    return EraseDirectory(szItemName);
  } else {
    return true;
  }
}

export function CreateItem(szItemname) {
  EraseItem(szItemname);
  let fhnd = null;
  if (!((fhnd = c$fopen(szItemname, S("wb"))) != null)) {
    return false;
  }
  c$fclose(fhnd);
  return true;
}

export function CopyItem(szSource, szTarget, fResetAttributes = false) {
  if (ItemIdentical(szSource, szTarget)) {
    return true;
  }
  if (DirectoryExists(szSource)) {
    return CopyDirectory(szSource, szTarget, fResetAttributes);
  }
  if (!CopyFile(szSource, szTarget, false)) {
    return false;
  }
  if (fResetAttributes) {
    if (c$chmod(szTarget, 448) !== 0) {
      return false;
    }
  }
  return true;
}

export function MoveItem(szSource, szTarget) {
  if (ItemIdentical(szSource, szTarget)) {
    return true;
  }
  return RenameFile(szSource, szTarget);
}

export function ItemIdentical(szFilename1, szFilename2) {
  const szFullFile1 = new Int8Array(4097);
  const szFullFile2 = new Int8Array(4097);
  RealPath(szFilename1, P(szFullFile1, 0));
  RealPath(szFilename2, P(szFullFile2, 0));
  if ($.SEqual(P(szFullFile1, 0), P(szFullFile2, 0))) {
    return true;
  }
  return false;
}

export function ForEachFile(szDirName, fnCallback) {
  if (szDirName == null || fnCallback == null) {
    return 0;
  }
  const szFilename = new Int8Array(4097);
  $.SCopy$pi8$pi8(szDirName, P(szFilename, 0));
  let fHasWildcard = $.SCharPos(42, P(szFilename, 0)) >= 0;
  if (!fHasWildcard) {
    AppendBackslash(P(szFilename, 0));
  }
  let iFileCount = 0;
  if (fHasWildcard) {
    c$fprintf(c$stderr, S("Warning: ForEachFile with * (%s)\n"), szDirName);
  }
  let d = c$opendir(szDirName);
  if (d == null) {
    return 0;
  }
  let ent = null;
  while ((ent = c$readdir(d)) != null) {
    $.SCopy$pi8$pi8(P(ent.d_name, 0), GetFilename$2(P(szFilename, 0)));
    if (fnCallback(P(szFilename, 0))) {
      iFileCount = iFileCount + 1 | 0;
    }
  }
  c$closedir(d);
  return iFileCount;
}

export function $init(): void {
  $.DirectorySeparators$StdFile = S("/");
}

Object.assign($, { AppendBackslash, CopyDirectory, CopyFile, CopyItem, CreateItem, CreatePath, DefaultExtension$pStdStrBuf$pi8, DefaultExtension$pi8$pi8, DirectoryExists, DirectoryIterator, DirectoryIteratorP, EnforceExtension$pStdStrBuf$pi8, EnforceExtension$pi8$pi8, EraseDirectory, EraseFile, EraseItem, FileExists, FileSize$i32, FileSize$pi8, FileTime, ForEachFile, GetC4Filename, GetExtension, GetExtension$2, GetFilename, GetFilename$2, GetFilenameOnly, GetFilenameWeb, GetFilenameWeb$2, GetParentPath$pi8$pStdStrBuf, GetParentPath$pi8$pi8, GetRelativePathS, GetTrailingNumber, GetWorkingDirectory, IsGlobalPath, IsWildcardString, ItemAttributes, ItemExists, ItemIdentical, MakeFilenameFromTitle, MakeOriginalFilename, MakeTempFilename$pStdStrBuf, MakeTempFilename$pi8, MoveItem, RealPath, RemoveExtension$pStdStrBuf, RemoveExtension$pi8, RenameFile, RenameItem, SetWorkingDirectory, TruncateBackslash, TruncatePath, WildcardListMatch, WildcardMatch, WildcardMatchCharacterClass });
