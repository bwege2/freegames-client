// @ts-nocheck
// OpenClonk 36de799: src/lib/StdBuf.cpp, src/lib/StdBuf.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $i64n, $u64n } from '../../rt/int.ts';
import { c$close, c$crc32, c$free, c$isspace, c$malloc, c$memcmp, c$memcpy, c$memmove, c$open, c$read, c$realloc, c$strchr, c$strcmp, c$strcpy, c$strlen, c$strncmp, c$tolower, c$vasprintf, c$write } from '../../rt/libc.ts';
import { FileSize$i32 } from '../../rt/native.ts';
import { $padd, $peq, $rd, $wr, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $min, StdString } from '../../rt/std.ts';

export class StdBuf {
  fRef = true;
  $u1 = new StdBuf$$anon1();
  iSize = 0;

  init$rStdBuf$b(Buf2, fCopy = false) {
    this.fRef = true;
    this.$u1.pData = null;
    this.iSize = 0;
    if (fCopy) {
      this.Copy$StdBuf(Buf2);
    } else if (!StdBuf.prototype.isRef.call(Buf2)) {
      this.Take$mStdBuf(Buf2);
    } else {
      this.Ref$StdBuf(Buf2);
    }
    return this;
  }

  init$StdBuf$b(Buf2, fCopy = true) {
    this.fRef = true;
    this.$u1.pData = null;
    this.iSize = 0;
    if (fCopy) {
      this.Copy$StdBuf(Buf2);
    } else {
      this.Ref$StdBuf(Buf2);
    }
    return this;
  }

  init$px$u64$b(pData, iSize, fCopy = false) {
    this.fRef = true;
    this.$u1.pData = pData;
    this.iSize = iSize >>> 0;
    if (fCopy) {
      StdBuf.prototype.Copy$v.call(this);
    }
    return this;
  }

  $dtor() {
    StdBuf.prototype.Clear.call(this);
  }

  isNull() {
    return !(StdBuf.prototype.getData.call(this) != null);
  }

  getData() {
    return this.fRef ? this.$u1.pData : this.$u1.pMData;
  }

  getMData() {
    0;
    return this.$u1.pMData;
  }

  getSize() {
    return this.iSize;
  }

  isRef() {
    return this.fRef;
  }

  getPtr(i) {
    return $padd(StdBuf.prototype.getData.call(this), i);
  }

  getMPtr(i) {
    return $padd(StdBuf.prototype.getMData.call(this), i);
  }

  getPart(iStart, inSize) {
    0;
    return new StdBuf().init$px$u64$b(StdBuf.prototype.getPtr.call(this, iStart), inSize);
  }

  Ref$px$u64(pnData, inSize) {
    StdBuf.prototype.Clear.call(this);
    this.fRef = true;
    this.$u1.pData = pnData;
    this.iSize = inSize >>> 0;
  }

  Take$px$u64(pnData, inSize) {
    StdBuf.prototype.Clear.call(this);
    if (pnData != null) {
      this.fRef = false;
      this.$u1.pMData = pnData;
      this.iSize = inSize >>> 0;
    }
  }

  GrabPointer() {
    if (StdBuf.prototype.isNull.call(this)) {
      return null;
    }
    if (this.fRef) {
      StdBuf.prototype.Copy$v.call(this);
    }
    let pMData = StdBuf.prototype.getMData.call(this);
    this.$u1.pData = pMData;
    this.fRef = true;
    return pMData;
  }

  New(inSize) {
    StdBuf.prototype.Clear.call(this);
    this.$u1.pMData = c$malloc(this.iSize = inSize >>> 0);
    this.fRef = false;
  }

  Write$px$u64$u64(pnData, inSize, iAt = 0) {
    0;
    if (pnData != null && inSize !== 0) {
      c$memcpy(StdBuf.prototype.getMPtr.call(this, iAt), pnData, inSize);
    }
  }

  Move(iFrom, inSize, iTo = 0) {
    0;
    0;
    c$memmove(StdBuf.prototype.getMPtr.call(this, iTo), StdBuf.prototype.getPtr.call(this, iFrom), inSize);
  }

  Compare$px$u64$u64(pCData, iCSize, iAt = 0) {
    0;
    return c$memcmp(StdBuf.prototype.getPtr.call(this, iAt), pCData, iCSize);
  }

  Grow(iGrow) {
    if (this.fRef) {
      this.Copy$u64(this.iSize + iGrow);
      return;
    }
    if (iGrow === 0) {
      return;
    }
    this.$u1.pMData = c$realloc(this.$u1.pMData, this.iSize = this.iSize + iGrow >>> 0);
  }

  Shrink(iShrink) {
    0;
    if (this.fRef) {
      this.Copy$u64(this.iSize - iShrink);
      return;
    }
    if (iShrink === 0) {
      return;
    }
    this.$u1.pMData = c$realloc(this.$u1.pMData, this.iSize = this.iSize - iShrink >>> 0);
  }

  Clear() {
    if (!this.fRef) {
      c$free(this.$u1.pMData);
    }
    this.$u1.pMData = null;
    this.fRef = true;
    this.iSize = 0;
  }

  static DeletePointer(data) {
    c$free(data);
  }

  SetSize(inSize) {
    if (inSize > this.iSize) {
      StdBuf.prototype.Grow.call(this, inSize - this.iSize);
    } else {
      StdBuf.prototype.Shrink.call(this, this.iSize - inSize);
    }
  }

  Write$StdBuf$u64(Buf2, iAt = 0) {
    this.Write$px$u64$u64(StdBuf.prototype.getData.call(Buf2), StdBuf.prototype.getSize.call(Buf2), iAt);
  }

  Compare$StdBuf$u64(Buf2, iAt = 0) {
    return this.Compare$px$u64$u64(StdBuf.prototype.getData.call(Buf2), StdBuf.prototype.getSize.call(Buf2), iAt);
  }

  Copy$u64(inSize) {
    if (StdBuf.prototype.isNull.call(this) && inSize === 0) {
      return;
    }
    let pOldData = StdBuf.prototype.getData.call(this);
    let iOldSize = this.iSize;
    this.New(inSize);
    this.Write$px$u64$u64(pOldData, $min(iOldSize, inSize));
  }

  Copy$v() {
    this.Copy$u64(this.iSize);
  }

  Copy$px$u64(pnData, inSize) {
    this.Ref$px$u64(pnData, inSize);
    StdBuf.prototype.Copy$v.call(this);
  }

  Copy$StdBuf(Buf2) {
    this.Copy$px$u64(StdBuf.prototype.getData.call(Buf2), StdBuf.prototype.getSize.call(Buf2));
  }

  Duplicate() {
    let Buf = new StdBuf();
    Buf.Copy$StdBuf(this);
    return Buf;
  }

  Append$px$u64(pnData, inSize) {
    StdBuf.prototype.Grow.call(this, inSize);
    this.Write$px$u64$u64(pnData, inSize, this.iSize - inSize);
  }

  Append$StdBuf(Buf2) {
    this.Append$px$u64(StdBuf.prototype.getData.call(Buf2), StdBuf.prototype.getSize.call(Buf2));
  }

  Ref$StdBuf(Buf2) {
    this.Ref$px$u64(StdBuf.prototype.getData.call(Buf2), StdBuf.prototype.getSize.call(Buf2));
  }

  getRef() {
    return new StdBuf().init$px$u64$b(StdBuf.prototype.getData.call(this), StdBuf.prototype.getSize.call(this));
  }

  Take$rStdBuf(Buf2) {
    this.Take$px$u64(StdBuf.prototype.GrabPointer.call(Buf2), StdBuf.prototype.getSize.call(Buf2));
  }

  Take$mStdBuf(Buf2) {
    this.Take$px$u64(StdBuf.prototype.GrabPointer.call(Buf2), StdBuf.prototype.getSize.call(Buf2));
  }

  LoadFromFile(szFile) {
    let fh = c$open(szFile, 524288, 384);
    if (fh < 0) {
      return false;
    }
    this.New(FileSize$i32(fh));
    if (c$read(fh, StdBuf.prototype.getMData.call(this), StdBuf.prototype.getSize.call(this)) !== (StdBuf.prototype.getSize.call(this) | 0)) {
      c$close(fh);
      return false;
    }
    c$close(fh);
    return true;
  }

  SaveToFile(szFile) {
    let fh = c$open(szFile, 524865, 384);
    if (fh < 0) {
      return false;
    }
    if (c$write(fh, StdBuf.prototype.getData.call(this), StdBuf.prototype.getSize.call(this)) !== (StdBuf.prototype.getSize.call(this) | 0)) {
      c$close(fh);
      return false;
    }
    c$close(fh);
    return true;
  }

  op_not() {
    return StdBuf.prototype.isNull.call(this);
  }

  op_addAssign$StdBuf(Buf2) {
    this.Append$StdBuf(Buf2);
    return new StdBuf().init$rStdBuf$b(this);
  }

  op_add$StdBuf(Buf2) {
    let Buf = StdBuf.prototype.getRef.call(this);
    Buf.Append$StdBuf(Buf2);
    return Buf;
  }

  op_eq$StdBuf(Buf2) {
    return StdBuf.prototype.getSize.call(this) === StdBuf.prototype.getSize.call(Buf2) && !(this.Compare$StdBuf$u64(Buf2) !== 0);
  }

  op_ne$StdBuf(Buf2) {
    return !this.op_eq$StdBuf(Buf2);
  }

  op_assign$mStdBuf(Buf2) {
    if (StdBuf.prototype.isRef.call(Buf2)) {
      this.Ref$StdBuf(Buf2);
    } else {
      this.Take$mStdBuf(Buf2);
    }
    return this;
  }

  GetHash() {
    if (StdBuf.prototype.isNull.call(this)) {
      return 0;
    }
    return c$crc32(0, StdBuf.prototype.getData.call(this), StdBuf.prototype.getSize.call(this) >>> 0) | 0;
  }

  CompileFunc(pComp, iType = 0) {
    const tmp = [this.iSize];
    pComp.Value$StdIntPackAdapt$u32($.mkIntPackAdapt(P(tmp, 0)));
    this.iSize = tmp[0];
    pComp.Separator(5 /*SEP_PART2*/);
    if (pComp.isDeserializer()) {
      this.New(this.iSize);
      pComp.Raw(StdBuf.prototype.getMData.call(this), this.iSize, iType);
    } else {
      pComp.Raw(StdBuf.prototype.getData.call(this), this.iSize, iType);
    }
  }

  $clone() { return new StdBuf().$assign(this); }
  $assign(Buf2) {
    if (StdBuf.prototype.isRef.call(Buf2)) {
      this.Ref$StdBuf(Buf2);
    } else {
      this.Take$mStdBuf(Buf2);
    }
    return this;
  }
}

export class StdBuf$$anon1 {
  $v = null;
  get pData() { const v = this.$v; return v === 0 ? null : v; }
  set pData(v) { this.$v = v; }
  get pMData() { const v = this.$v; return v === 0 ? null : v; }
  set pMData(v) { this.$v = v; }
  $clone() { const u = new StdBuf$$anon1(); u.$v = this.$v; return u; }
  $assign(o) { this.$v = o.$v; return this; }
}

export class StdCopyBuf extends StdBuf {

  init$StdBuf$b(Buf2, fCopy = true) {
    super.init$StdBuf$b(StdBuf.prototype.getRef.call(Buf2), fCopy);
    return this;
  }

  init$StdCopyBuf$b(Buf2, fCopy = true) {
    super.init$StdBuf$b(StdBuf.prototype.getRef.call(Buf2), fCopy);
    return this;
  }

  init$rStdBuf(Buf2) {
    super.$assign(Buf2);
    return this;
  }

  init$px$u64$b(pData, iSize, fCopy = true) {
    super.init$px$u64$b(pData, iSize, fCopy);
    return this;
  }

  op_assign$StdBuf(Buf2) {
    this.Copy$StdBuf(Buf2);
    return this;
  }

  $clone() { return new StdCopyBuf().$assign(this); }
  $assign(Buf2) {
    this.Copy$StdBuf(Buf2);
    return this;
  }
}

export class StdStrBuf extends StdBuf {

  init$rStdStrBuf$b(Buf2, fCopy = false) {
    super.init$rStdBuf$b(Buf2, fCopy);
    return this;
  }

  init$StdStrBuf$b(Buf2, fCopy = true) {
    super.init$StdBuf$b(Buf2, fCopy);
    return this;
  }

  init$pi8$b(pData, fCopy = false) {
    super.init$px$u64$b(pData, pData != null ? c$strlen(pData) + 1 : 0, fCopy);
    return this;
  }

  init$pi8$i64(pData, iLength) {
    super.init$px$u64$b(pData, $u64n(pData != null ? iLength + 1 : 0), false);
    return this;
  }

  init$pi8$u64$b(pData, iLength, fCopy = false) {
    super.init$px$u64$b(pData, pData != null ? iLength + 1 : 0, fCopy);
    return this;
  }

  isNull() {
    return StdBuf.prototype.isNull.call(this);
  }

  getData() {
    return getBufPtr$3(this);
  }

  getMData() {
    return getMBufPtr$3(this);
  }

  getSize() {
    return StdBuf.prototype.getSize.call(this);
  }

  getLength() {
    return this.getSize() !== 0 ? this.getSize() - 1 : 0;
  }

  isRef() {
    return StdBuf.prototype.isRef.call(this);
  }

  getPtr(i) {
    return getBufPtr$3(this, i);
  }

  getMPtr(i) {
    return getMBufPtr$3(this, i);
  }

  op_index(i) {
    return $rd(this.getPtr(i));
  }

  Ref$pi8(pnData) {
    StdBuf.prototype.Ref$px$u64.call(this, pnData, pnData != null ? c$strlen(pnData) + 1 : 0);
  }

  Ref$pi8$u64(pnData, iLength) {
    0;
    StdBuf.prototype.Ref$px$u64.call(this, pnData, iLength + 1);
  }

  Take$pi8(pnData) {
    StdBuf.prototype.Take$px$u64.call(this, pnData, pnData != null ? c$strlen(pnData) + 1 : 0);
  }

  Take$pi8$u64(pnData, iLength) {
    0;
    StdBuf.prototype.Take$px$u64.call(this, pnData, iLength + 1);
  }

  GrabPointer() {
    return StdBuf.prototype.GrabPointer.call(this);
  }

  Ref$StdStrBuf(Buf2) {
    StdBuf.prototype.Ref$px$u64.call(this, Buf2.getData(), Buf2.getSize());
  }

  getRef() {
    return new StdStrBuf().init$pi8$u64$b(this.getData(), this.getLength());
  }

  Take$rStdStrBuf(Buf2) {
    StdBuf.prototype.Take$rStdBuf.call(this, Buf2);
  }

  Take$mStdStrBuf(Buf2) {
    StdBuf.prototype.Take$mStdBuf.call(this, Buf2);
  }

  Clear() {
    StdBuf.prototype.Clear.call(this);
  }

  Copy$v() {
    StdBuf.prototype.Copy$v.call(this);
  }

  Copy$pi8(pnData) {
    StdBuf.prototype.Copy$px$u64.call(this, pnData, pnData != null ? c$strlen(pnData) + 1 : 0);
  }

  Copy$StdStrBuf(Buf2) {
    StdBuf.prototype.Copy$StdBuf.call(this, Buf2);
  }

  Duplicate() {
    let Buf = new StdStrBuf();
    Buf.Copy$StdStrBuf(this);
    return Buf;
  }

  Move(iFrom, inSize, iTo = 0) {
    StdBuf.prototype.Move.call(this, iFrom, inSize, iTo);
  }

  Compare$StdStrBuf$u64(Buf2, iAt = 0) {
    0;
    let result = StdBuf.prototype.Compare$px$u64$u64.call(this, Buf2.getData(), $min(this.getLength() - iAt, Buf2.getLength()), iAt);
    if (result !== 0) {
      return result;
    }
    if (this.getLength() < Buf2.getLength() + iAt) {
      return -1;
    } else if (this.getLength() > Buf2.getLength() + iAt) {
      return 1;
    }
    return 0;
  }

  Compare_(pCData, iAt = 0) {
    let str = new StdStrBuf().init$pi8$b(pCData);
    return this.Compare$StdStrBuf$u64(str, iAt);
  }

  BeginsWith(beginning) {
    return c$strncmp(this.$u1.pData, beginning, c$strlen(beginning)) === 0;
  }

  Grow(iGrow) {
    StdBuf.prototype.Grow.call(this, this.getSize() !== 0 ? iGrow : iGrow + 1);
    $wr(this.getMPtr(this.getLength()), 0, 0);
  }

  Shrink(iShrink) {
    0;
    StdBuf.prototype.Shrink.call(this, iShrink);
    $wr(this.getMPtr(this.getLength()), 0, 0);
  }

  SetLength(iLength) {
    if (iLength === this.getLength() && !this.isNull()) {
      return;
    }
    if (iLength >= this.getLength()) {
      this.Grow(iLength - this.getLength());
    } else {
      this.Shrink(this.getLength() - iLength);
    }
  }

  Append$pi8$u64(pnData, iChars) {
    this.Grow(iChars);
    this.Write$px$u64$u64(pnData, iChars, this.iSize - iChars - 1);
  }

  Append$pi8(pnData) {
    this.Append$pi8$u64(pnData, c$strlen(pnData));
  }

  Append$StdStrBuf(Buf2) {
    this.Append$pi8$u64(Buf2.getData(), Buf2.getLength());
  }

  Copy$pi8$u64(pnData, iChars) {
    this.Clear();
    this.Append$pi8$u64(pnData, iChars);
  }

  LoadFromFile(szFile) {
    let fh = c$open(szFile, 524288, 384);
    if (fh < 0) {
      return false;
    }
    this.SetLength(FileSize$i32(fh));
    if (c$read(fh, this.getMData(), this.getLength()) !== $i64n(this.getLength())) {
      c$close(fh);
      return false;
    }
    c$close(fh);
    return true;
  }

  SaveToFile(szFile) {
    let fh = c$open(szFile, 524865, 384);
    if (fh < 0) {
      return false;
    }
    if (c$write(fh, this.getData(), this.getLength()) !== $i64n(this.getLength())) {
      c$close(fh);
      return false;
    }
    c$close(fh);
    return true;
  }

  op_not() {
    return this.isNull();
  }

  op_addAssign$StdStrBuf(Buf2) {
    this.Append$StdStrBuf(Buf2);
    return this;
  }

  op_addAssign$pi8(szString) {
    this.Append$pi8(szString);
    return this;
  }

  op_add$StdStrBuf(Buf2) {
    let Buf = this.getRef();
    Buf.Append$StdStrBuf(Buf2);
    return Buf;
  }

  op_add$pi8(szString) {
    let Buf = this.getRef();
    Buf.Append$pi8(szString);
    return Buf;
  }

  op_add$i8(c) {
    let Buf = this.getRef();
    Buf.AppendChar(c);
    return Buf;
  }

  op_eq$StdStrBuf(Buf2) {
    return this.getLength() === Buf2.getLength() && !(this.Compare$StdStrBuf$u64(Buf2) !== 0);
  }

  op_ne$StdStrBuf(Buf2) {
    return !this.op_eq$StdStrBuf(Buf2);
  }

  op_eq$pi8(szString) {
    return new StdStrBuf().init$pi8$b(szString).op_eq$StdStrBuf(this);
  }

  op_ne$pi8(szString) {
    return !this.op_eq$pi8(szString);
  }

  op_assign$pi8(szString) {
    this.Ref$pi8(szString);
    return this;
  }

  op_const_void_() {
    return this.getData();
  }

  op_lt(v2) {
    let iLen = this.getLength();
    let iLen2 = v2.getLength();
    if (iLen === iLen2) {
      return iLen !== 0 ? c$strcmp(this.getData(), v2.getData()) < 0 : false;
    } else {
      return iLen < iLen2;
    }
  }

  AppendChars(cChar, iCnt) {
    this.Grow(iCnt);
    for (let i = this.getLength() - iCnt; i < this.getLength(); i = i + 1) {
      $wr(this.getMPtr(i), 0, cChar);
    }
  }

  AppendChar(cChar) {
    this.AppendChars(cChar, 1);
  }

  AppendCharacter(unicodechar) {
    if (unicodechar < 128) {
      this.AppendChar(unicodechar << 24 >> 24);
    } else if (unicodechar < 2048) {
      this.Grow(2);
      $wr(this.getMPtr(this.getLength() - 2), 0, ((192 | unicodechar >>> 6) >>> 0) << 24 >> 24);
      $wr(this.getMPtr(this.getLength() - 1), 0, ((128 | (unicodechar & 63) >>> 0) >>> 0) << 24 >> 24);
    } else if (unicodechar < 65536) {
      this.Grow(3);
      $wr(this.getMPtr(this.getLength() - 3), 0, ((224 | unicodechar >>> 12) >>> 0) << 24 >> 24);
      $wr(this.getMPtr(this.getLength() - 2), 0, ((128 | (unicodechar >>> 6 & 63) >>> 0) >>> 0) << 24 >> 24);
      $wr(this.getMPtr(this.getLength() - 1), 0, ((128 | (unicodechar & 63) >>> 0) >>> 0) << 24 >> 24);
    } else if (unicodechar < 0x110000) {
      this.Grow(4);
      $wr(this.getMPtr(this.getLength() - 4), 0, ((240 | unicodechar >>> 18) >>> 0) << 24 >> 24);
      $wr(this.getMPtr(this.getLength() - 3), 0, ((128 | (unicodechar >>> 12 & 63) >>> 0) >>> 0) << 24 >> 24);
      $wr(this.getMPtr(this.getLength() - 2), 0, ((128 | (unicodechar >>> 6 & 63) >>> 0) >>> 0) << 24 >> 24);
      $wr(this.getMPtr(this.getLength() - 1), 0, ((128 | (unicodechar & 63) >>> 0) >>> 0) << 24 >> 24);
    } else {
    }
  }

  AppendBackslash() {
    if (this.getLength() !== 0 && $rd(this.getPtr(this.getLength() - 1)) === 47) {
      return;
    }
    this.AppendChar(47);
  }

  InsertChar(cChar, insert_before) {
    0;
    this.Grow(1);
    for (let i = this.getLength() - 1; i > insert_before; i = i - 1) {
      $wr(this.getMPtr(i), 0, $rd(this.getPtr(i - 1)));
    }
    $wr(this.getMPtr(insert_before), 0, cChar);
  }

  AppendUntil(szString, cUntil) {
    let pPos = c$strchr(szString, cUntil);
    if (pPos != null) {
      this.Append$pi8$u64(szString, $u64n(pPos.o - szString.o));
    } else {
      this.Append$pi8(szString);
    }
  }

  CopyUntil(szString, cUntil) {
    this.Clear();
    this.AppendUntil(szString, cUntil);
  }

  SplitAtChar(cSplit, psSplit) {
    if (!(this.getData() != null)) {
      return false;
    }
    let pPos = c$strchr(this.getData(), cSplit);
    if (pPos == null) {
      return false;
    }
    let iPos = $u64n(pPos.o - this.getData().o);
    if (psSplit != null) {
      psSplit.Take$mStdStrBuf(this.copyPart(iPos + 1, this.getLength() - iPos - 1));
    }
    this.Shrink(this.getLength() - iPos);
    return true;
  }

  Format(szFmt, ...$va) {
    let args = null;
    args = { a: $va, i: 0 };
    this.FormatV(szFmt, args);
  }

  FormatV(szFmt, args) {
    this.Clear();
    this.AppendFormatV(szFmt, args);
  }

  AppendFormat(szFmt, ...$va) {
    let args = null;
    args = { a: $va, i: 0 };
    this.AppendFormatV(szFmt, args);
  }

  AppendFormatV(szFmt, args) {
    const pStr = [null];
    let iBytes = c$vasprintf(P(pStr, 0), szFmt, args);
    if (iBytes < 0 || pStr[0] == null) {
      return;
    }
    if (this.isNull()) {
      this.Take$pi8$u64(pStr[0], $u64n(iBytes));
    } else {
      this.Append$pi8$u64(pStr[0], $u64n(iBytes));
      c$free(pStr[0]);
    }
  }

  copyPart(iStart, inSize) {
    0;
    if (inSize === 0) {
      return new StdStrBuf();
    }
    let sResult = new StdStrBuf();
    sResult.Copy$pi8$u64(this.getPtr(iStart), inSize);
    return sResult;
  }

  Replace(szOld, szNew, iStartSearch = 0) {
    if (!(this.getPtr(0) != null) || szOld == null) {
      return 0;
    }
    if (szNew == null) {
      szNew = S("");
    }
    let cnt = 0;
    let iOldLen = c$strlen(szOld);
    let iNewLen = c$strlen(szNew);
    if (iOldLen !== iNewLen) {
      let iResultLen = this.getLength();
      let szPos = this.getPtr(iStartSearch);
      while ((szPos = $.SSearch(szPos, szOld)) != null) {
        iResultLen = iResultLen + (iNewLen - iOldLen);
        cnt = cnt + 1 | 0;
      }
      if (cnt === 0) {
        return 0;
      }
      let sResult = new StdStrBuf();
      sResult.New(iResultLen + 1);
      let szRPos = this.getPtr(0);
      let szRNextPos = null;
      let szWrite = sResult.getMPtr(0);
      if (iStartSearch !== 0) {
        c$memcpy(szWrite, szRPos, iStartSearch * 1);
        szRPos = szRPos.add(iStartSearch);
        szWrite = szWrite.add(iStartSearch);
      }
      while ((szRNextPos = $.SSearch(szRPos, szOld)) != null) {
        c$memcpy(szWrite, szRPos, ($u64n(szRNextPos.o - szRPos.o) - iOldLen) * 1);
        szWrite = szWrite.add($u64n(szRNextPos.o - szRPos.o) - iOldLen);
        c$memcpy(szWrite, szNew, iNewLen * 1);
        szWrite = szWrite.add(iNewLen);
        szRPos = szRNextPos;
      }
      c$strcpy(szWrite, szRPos);
      this.Take$mStdStrBuf(sResult);
    } else {
      let szRPos = this.getMPtr(iStartSearch);
      while ((szRPos = $.SSearch(szRPos, szOld)) != null) {
        c$memcpy($padd(szRPos, -iOldLen), szNew, iOldLen * 1);
        cnt = cnt + 1 | 0;
      }
    }
    return cnt;
  }

  ReplaceChar(cOld, cNew) {
    let $t1;
    if (this.isNull()) {
      return 0;
    }
    let szPos = this.getMPtr(0);
    if (cOld === 0) {
      return 0;
    }
    if (cNew === 0) {
      cNew = 95;
    }
    let cnt = 0;
    while ((szPos = c$strchr(szPos, cOld)) != null) {
      $wr(($t1 = szPos, szPos = szPos.add(1), $t1), 0, cNew);
      cnt = cnt + 1 | 0;
    }
    return cnt;
  }

  ReplaceEnd(iPos, szNewEnd) {
    let iLen = this.getLength();
    0;
    if (iPos > iLen) {
      return;
    }
    let iEndLen = c$strlen(szNewEnd);
    if (iLen - iPos !== iEndLen) {
      this.SetLength(iPos + iEndLen);
    }
    c$memcpy(this.getMPtr(iPos), szNewEnd, iEndLen * 1);
  }

  GetSection(idx, psOutSection, cSeparator = 59) {
    0;
    psOutSection.Clear();
    let szStr = this.getData();
    let szSepPos = null;
    if (szStr == null) {
      return false;
    }
    while ((szSepPos = c$strchr(szStr, cSeparator)) != null && idx !== 0) {
      szStr = $padd(szSepPos, 1);
      idx = idx - 1;
    }
    if (idx !== 0) {
      return false;
    }
    if (szSepPos == null) {
      szSepPos = $padd(this.getData(), this.getLength());
    }
    if (!$peq(szSepPos, szStr)) {
      psOutSection.Copy$pi8$u64(szStr, $u64n(szSepPos.o - szStr.o));
    }
    return true;
  }

  EnsureUnicode() {
    let $t1, $t2, $t3;
    if (!$.IsValidUtf8(this.getData(), this.getLength() | 0)) {
      let j = 0;
      let buf = new StdStrBuf();
      buf.Grow(this.getLength());
      for (let i = 0; i < this.getSize(); i = i + 1) {
        let c = $rd(this.getPtr(i)) & 0xff;
        if (c < 128) {
          if (j >= buf.getLength()) {
            buf.Grow(20);
          }
          $wr(buf.getMPtr(($t1 = j, j = j + 1, $t1)), 0, c << 24 >> 24);
          continue;
        }
        if (c === 129 || c === 141 || c === 143 || c === 144 || c === 157 || c >= 160) {
          if (j + 1 >= buf.getLength()) {
            buf.Grow(20);
          }
          $wr(buf.getMPtr(($t2 = j, j = j + 1, $t2)), 0, (192 | c >> 6) << 24 >> 24);
          $wr(buf.getMPtr(($t3 = j, j = j + 1, $t3)), 0, (128 | c & 63) << 24 >> 24);
          continue;
        }
        buf.SetLength(j);
        if (!('StdStrBuf$EnsureUnicode$extra_chars' in $)) $.StdStrBuf$EnsureUnicode$extra_chars = [
  S("€"),
  null,
  S("‚"),
  S("ƒ"),
  S("„"),
  S("…"),
  S("†"),
  S("‡"),
  S("ˆ"),
  S("‰"),
  S("Š"),
  S("‹"),
  S("Œ"),
  null,
  S("Ž"),
  null,
  null,
  S("‘"),
  S("’"),
  S("“"),
  S("”"),
  S("•"),
  S("–"),
  S("—"),
  S("˜"),
  S("™"),
  S("š"),
  S("›"),
  S("œ"),
  null,
  S("ž"),
  S("Ÿ"),
];
        buf.Append$pi8($.StdStrBuf$EnsureUnicode$extra_chars[c - 128 | 0]);
        j = j + c$strlen($.StdStrBuf$EnsureUnicode$extra_chars[c - 128 | 0]);
      }
      buf.SetLength(j);
      this.Take$mStdStrBuf(buf);
      return true;
    }
    return false;
  }

  ToLowerCase() {
    if (!this.isNull()) {
      for (let szPos = this.getMPtr(0); szPos.a[szPos.o] !== 0; szPos = szPos.add(1)) {
        szPos.a[szPos.o] = c$tolower(szPos.a[szPos.o]) << 24 >> 24;
      }
    }
  }

  ValidateChars(szInitialChars, szMidChars) {
    for (let i = 0; i < this.getLength(); i = i + 1) {
      if (!(c$strchr(i !== 0 ? szMidChars : szInitialChars, $rd(this.getData(), i)) != null)) {
        return false;
      }
    }
    return true;
  }

  GetHash() {
    return StdBuf.prototype.GetHash.call(this);
  }

  EscapeString() {
    this.Replace(S("\\"), S("\\\\"));
    this.Replace(S("\""), S("\\\""));
  }

  TrimSpaces() {
    let iSpaceLeftCount = 0;
    let iLength = this.getLength() | 0;
    if (iLength === 0) {
      return false;
    }
    let szStr = this.getData();
    while (iSpaceLeftCount < iLength) {
      if (c$isspace(szStr.a[szStr.o + iSpaceLeftCount] & 0xff) !== 0) {
        iSpaceLeftCount = iSpaceLeftCount + 1 | 0;
      } else {
        break;
      }
    }
    if (iSpaceLeftCount === iLength) {
      this.Clear();
      return true;
    }
    let iSpaceRightCount = 0;
    while (c$isspace(szStr.a[szStr.o + ((iLength - 1 | 0) - iSpaceRightCount | 0)] & 0xff) !== 0) {
      iSpaceRightCount = iSpaceRightCount + 1 | 0;
    }
    if (iSpaceLeftCount === 0 && iSpaceRightCount === 0) {
      return false;
    }
    if (iSpaceLeftCount === 0) {
      this.SetLength($u64n(iLength - iSpaceRightCount | 0));
      return true;
    }
    c$memmove(this.getMPtr(0), $padd(szStr, iSpaceLeftCount), $u64n((iLength - iSpaceLeftCount | 0) - iSpaceRightCount | 0));
    this.SetLength($u64n((iLength - iSpaceLeftCount | 0) - iSpaceRightCount | 0));
    return true;
  }

  CompileFunc(pComp, iRawType = 0) {
    if (pComp.isDeserializer()) {
      const pnData = [null];
      pComp.String$ppi8$i32(P(pnData, 0), iRawType);
      this.Take$pi8(pnData[0]);
    } else {
      const pData = [this.getData()];
      if (pData[0] == null) {
        pData[0] = S("");
      }
      pComp.String$ppi8$i32(P(pData, 0), iRawType);
    }
  }

  $clone() { return new StdStrBuf().$assign(this); }
  $assign(Buf2) {
    this.Ref$StdStrBuf(Buf2);
    return this;
  }
}

export class StdCopyStrBuf extends StdStrBuf {

  init$StdStrBuf$b(Buf2, fCopy = true) {
    super.init$StdStrBuf$b(Buf2.getRef(), fCopy);
    return this;
  }

  init$StdCopyStrBuf$b(Buf2, fCopy = true) {
    super.init$StdStrBuf$b(Buf2.getRef(), fCopy);
    return this;
  }

  init$mStdStrBuf(Buf2) {
    super.$assign(Buf2);
    return this;
  }

  init$pi8$b(pData, fCopy = true) {
    super.init$pi8$b(pData, fCopy);
    return this;
  }

  init$string(s) {
    super.init$pi8$u64$b(s.c_str(), s.size(), true);
    return this;
  }

  op_assign$StdStrBuf(Buf2) {
    this.Copy$StdStrBuf(Buf2);
    return this;
  }

  op_assign$pi8(szString) {
    this.Copy$pi8(szString);
    return this;
  }

  op_assign$string(s) {
    this.Copy$pi8$u64(s.c_str(), s.size());
    return this;
  }

  op_basic_string() {
    return StdString.of(this.getData(), this.getLength());
  }

  $clone() { return new StdCopyStrBuf().$assign(this); }
  $assign(Buf2) {
    this.Copy$StdStrBuf(Buf2);
    return this;
  }
}

export function FormatString(szFmt, ...$va) {
  let args = null;
  args = { a: $va, i: 0 };
  return FormatStringV(szFmt, args);
}

export function FormatStringV(szFmt, args) {
  let Buf = new StdStrBuf();
  Buf.FormatV(szFmt, args);
  return Buf;
}

export function getBufPtr(Buf, iPos) {
  let pPos = $padd(StdBuf.prototype.getData.call(Buf), iPos);
  return pPos;
}

export function getBufPtr$2(Buf, iPos) {
  let pPos = $padd(StdBuf.prototype.getData.call(Buf), iPos);
  return pPos;
}

export function getBufPtr$3(Buf, iPos = 0) {
  let pPos = $padd(StdBuf.prototype.getData.call(Buf), iPos);
  return pPos;
}

export function getBufPtr$4(Buf, iPos) {
  let pPos = $padd(StdBuf.prototype.getData.call(Buf), iPos);
  return pPos;
}

export function getBufPtr$5(Buf, iPos) {
  let pPos = $padd(StdBuf.prototype.getData.call(Buf), iPos);
  return pPos;
}

export function getBufPtr$6(Buf, iPos) {
  let pPos = $padd(StdBuf.prototype.getData.call(Buf), iPos);
  return pPos;
}

export function getBufPtr$7(Buf, iPos) {
  let pPos = $padd(StdBuf.prototype.getData.call(Buf), iPos);
  return pPos;
}

export function getBufPtr$8(Buf, iPos) {
  let pPos = $padd(StdBuf.prototype.getData.call(Buf), iPos);
  return pPos;
}

export function getMBufPtr(Buf, iPos) {
  let pPos = $padd(StdBuf.prototype.getMData.call(Buf), iPos);
  return pPos;
}

export function getMBufPtr$2(Buf, iPos) {
  let pPos = $padd(StdBuf.prototype.getMData.call(Buf), iPos);
  return pPos;
}

export function getMBufPtr$3(Buf, iPos = 0) {
  let pPos = $padd(StdBuf.prototype.getMData.call(Buf), iPos);
  return pPos;
}

export function getMBufPtr$4(Buf, iPos) {
  let pPos = $padd(StdBuf.prototype.getMData.call(Buf), iPos);
  return pPos;
}

export function getMBufPtr$5(Buf, iPos) {
  let pPos = $padd(StdBuf.prototype.getMData.call(Buf), iPos);
  return pPos;
}

export function getMBufPtr$6(Buf, iPos) {
  let pPos = $padd(StdBuf.prototype.getMData.call(Buf), iPos);
  return pPos;
}

export function getMBufPtr$7(Buf, iPos) {
  let pPos = $padd(StdBuf.prototype.getMData.call(Buf), iPos);
  return pPos;
}

export function getMBufPtr$8(Buf, iPos) {
  let pPos = $padd(StdBuf.prototype.getMData.call(Buf), iPos);
  return pPos;
}

export function $init(): void {
}

Object.assign($, { FormatString, FormatStringV, StdBuf, StdBuf$$anon1, StdCopyBuf, StdCopyStrBuf, StdStrBuf, getBufPtr, getBufPtr$2, getBufPtr$3, getBufPtr$4, getBufPtr$5, getBufPtr$6, getBufPtr$7, getBufPtr$8, getMBufPtr, getMBufPtr$2, getMBufPtr$3, getMBufPtr$4, getMBufPtr$5, getMBufPtr$6, getMBufPtr$7, getMBufPtr$8 });
