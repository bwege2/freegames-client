// @ts-nocheck
// OpenClonk 36de799: src/config/C4Reloc.cpp, src/config/C4Reloc.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $begin, $end, $vpush, std_find } from '../../rt/std.ts';

export class C4Reloc {
  Paths = [];

  Init() {
    this.Paths.length = 0;
    let planet = new $.StdCopyStrBuf().init$StdCopyStrBuf$b($.Config.General.ExePath);
    planet.AppendBackslash();
    planet.Append$pi8(S("planet"));
    if ($.DirectoryExists(planet.getData())) {
      let planet_system_check = new $.StdCopyStrBuf().init$StdCopyStrBuf$b(planet);
      planet_system_check.AppendBackslash();
      planet_system_check.Append$pi8(S("System.ocg"));
      if ($.ItemExists(planet_system_check.getData())) {
        this.AddPath(planet.getData());
      }
    }
    if (this.Paths.length === 0) {
      this.AddPath(P($.Config.General.SystemDataPath, 0));
    }
    this.AddPath(P($.Config.General.ModsDataPath, 0), 2 /*PATH_IncludingSubdirectories*/);
    this.AddPath(P($.Config.General.UserDataPath, 0), 1 /*PATH_PreferredInstallationLocation*/);
  }

  AddPath(path, pathType = 0 /*PATH_Regular*/) {
    if (!$.IsGlobalPath(path)) {
      return false;
    }
    if (!std_find($begin(this.Paths), $end(this.Paths), path).eq($end(this.Paths))) {
      return false;
    }
    $vpush(this.Paths, new C4Reloc$PathInfo().init(new $.StdCopyStrBuf().init$pi8$b(path), pathType));
    return true;
  }

  begin() {
    let iter = new C4Reloc$const_iterator().init();
    iter.pathListIter = $begin(this.Paths).copy();
    return iter.$clone();
  }

  end() {
    let iter = new C4Reloc$const_iterator().init();
    iter.pathListIter = $end(this.Paths).copy();
    return iter.$clone();
  }

  Open(group, filename) {
    let $t1, $t2, $t3;
    if ($.IsGlobalPath(filename)) {
      return group.Open(filename);
    }
    $t1 = this;
    $t2 = $t1.begin();
    $t3 = $t1.end();
    for (; op_ne$C4Reloc$const_iterator$C4Reloc$const_iterator($t2, $t3); $t2.op_inc()) {
      const iter = $t2.op_mul();
      if (group.Open(iter.strBuf.op_add$pi8(S("/")).op_add$pi8(filename).getData())) {
        return true;
      }
    }
    return false;
  }

  LocateItem(filename, str) {
    let $t1, $t2, $t3;
    if ($.IsGlobalPath(filename)) {
      str.Copy$pi8(filename);
      return true;
    }
    $t1 = this;
    $t2 = $t1.begin();
    $t3 = $t1.end();
    for (; op_ne$C4Reloc$const_iterator$C4Reloc$const_iterator($t2, $t3); $t2.op_inc()) {
      const iter = $t2.op_mul();
      str.Copy$StdStrBuf(iter.strBuf.op_add$pi8(S("/")).op_add$pi8(filename));
      if ($.ItemExists(str.getData())) {
        return true;
      }
    }
    return false;
  }

  None() {
    this.Paths = [];
    return this;
  }

  $clone() { return new C4Reloc().$assign(this); }
  $assign(o) {
    this.Paths = o.Paths.slice();
    return this;
  }
}

export class C4Reloc$PathInfo {
  strBuf = new $.StdCopyStrBuf();
  pathType = 0;

  init(buf, pathType) {
    this.strBuf = new $.StdCopyStrBuf().init$StdCopyStrBuf$b(buf);
    this.pathType = pathType;
    return this;
  }

  $clone() { return new C4Reloc$PathInfo().$assign(this); }
  $assign(o) {
    this.strBuf.$assign(o.strBuf);
    this.pathType = o.pathType;
    return this;
  }
}

export class C4Reloc$const_iterator {
  temporaryPathInfo = null;
  pathListIter = null;
  subdirIters = [];

  init() {
    this.temporaryPathInfo = null;
    this.pathListIter = null;
    this.subdirIters = [];
    return this;
  }

  op_inc() {
    if (this.subdirIters.length === 0) {
      if (this.pathListIter.v.pathType === 2) {
        let subdir = new $.DirectoryIterator().init$pi8(this.pathListIter.v.strBuf.getData());
        if (subdir.op_mul() != null) {
          this.subdirIters.push(subdir.$clone());
        } else {
          this.pathListIter.inc();
        }
      } else {
        this.pathListIter.inc();
      }
    } else {
      const currentSubdir = this.subdirIters[this.subdirIters.length - 1];
      if (!(currentSubdir.op_mul() != null) || !(currentSubdir.op_inc$v().op_mul() != null)) {
        this.subdirIters.pop();
        if (this.subdirIters.length === 0) {
          this.pathListIter.inc();
        }
      } else {
        if ($.DirectoryExists(currentSubdir.op_mul())) {
          let subdir = new $.DirectoryIterator().init$pi8(currentSubdir.op_mul());
          if (subdir.op_mul() != null) {
            this.subdirIters.push(subdir.$clone());
          }
        }
      }
    }
    return this;
  }

  op_mul() {
    if (!(this.subdirIters.length === 0)) {
      const currentSubdir = this.subdirIters[this.subdirIters.length - 1];
      this.temporaryPathInfo = new C4Reloc$PathInfo().init(new $.StdCopyStrBuf().init$mStdStrBuf(new $.StdStrBuf().init$pi8$b(currentSubdir.op_mul())), 0 /*PATH_Regular*/);
      return this.temporaryPathInfo;
    }
    return this.pathListIter.v;
  }

  op_arrow() {
    return this.op_mul();
  }

  $clone() { return new C4Reloc$const_iterator().$assign(this); }
  $assign(other) {
    this.pathListIter = other.pathListIter.copy();
    this.subdirIters = other.subdirIters.slice();
    return this;
  }
}


export function op_eq$C4Reloc$const_iterator$C4Reloc$const_iterator(a, b) {
  if (!(a.subdirIters.length === 0)) {
    return false;
  }
  if (!(b.subdirIters.length === 0)) {
    return false;
  }
  return a.pathListIter.eq(b.pathListIter);
}

export function op_ne$C4Reloc$const_iterator$C4Reloc$const_iterator(a, b) {
  return !op_eq$C4Reloc$const_iterator$C4Reloc$const_iterator(a, b);
}

export function $init(): void {
  $.Reloc = new C4Reloc(); $.Reloc.None();
}

Object.assign($, { C4Reloc, C4Reloc$PathInfo, C4Reloc$const_iterator, op_eq$C4Reloc$const_iterator$C4Reloc$const_iterator, op_ne$C4Reloc$const_iterator$C4Reloc$const_iterator });
