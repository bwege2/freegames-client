// @ts-nocheck
// OpenClonk 36de799: src/lib/StdCompiler.cpp, src/lib/StdCompiler.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $u64n } from '../../rt/int.ts';
import { c$isalnum, c$isalpha, c$iscntrl, c$isdigit, c$isprint, c$isxdigit, c$malloc, c$memcpy, c$strlen, c$strnlen, c$strtol, c$strtoul } from '../../rt/libc.ts';
import { $padd, $peq, $rd, $tmp, $view8, $wr, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $begin, $delete, $end, $throw, std_distance, std_lower_bound } from '../../rt/std.ts';

export class StdCompiler {
  pWarnCB = null;
  pWarnData = null;

  isDoublePass() {
    return false;
  }

  isDeserializer() {
    return false;
  }

  isSerializer() {
    return !this.isDeserializer();
  }

  hasNaming() {
    return false;
  }

  isVerbose() {
    return this.hasNaming();
  }

  isRegistry() {
    return false;
  }

  setRuntimeWritesAllowed(_iChange) {
  }

  Name(_szName) {
    return true;
  }

  NameEnd(_fBreak = false) {
  }

  GetNameByIndex(_idx) {
    return null;
  }

  FollowName(szName) {
    this.NameEnd();
    return this.Name(szName);
  }

  Default(_szName) {
    return true;
  }

  NameCount(_szName = null) {
    0;
    return 0;
  }

  Separator(_eSep = 1 /*SEP_SEP*/) {
    return true;
  }

  NoSeparator() {
  }

  getPosition$v$c() {
    return new $.StdStrBuf();
  }

  Begin() {
  }

  BeginSecond() {
  }

  End() {
  }

  Value$StdParameterAdapt$StdStrBuf$i32$2(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdParameterAdapt$StdCopyStrBuf$i32(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdCastAdapt$C4Fixed$i32(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$ri32(rInt) {
    this.DWord$ri32(rInt);
  }

  Value$ru32(rInt) {
    this.DWord$ru32(rInt);
  }

  Value$ri16(rInt) {
    this.Word$ri16(rInt);
  }

  Value$ru16(rInt) {
    this.Word$ru16(rInt);
  }

  Value$ri8(rInt) {
    this.Byte$ri8(rInt);
  }

  Value$ru8(rInt) {
    this.Byte$ru8(rInt);
  }

  Value$rb(rBool) {
    this.Boolean(rBool);
  }

  excNotFound(szMessage, ...$va) {
    let args = null;
    args = { a: $va, i: 0 };
    $throw(new StdCompiler$NotFoundException().init(this.getPosition$v$c(), $.FormatStringV(szMessage, args)));
  }

  excEOF(szMessage = S("EOF"), ...$va) {
    let args = null;
    args = { a: $va, i: 0 };
    $throw(new StdCompiler$EOFException().init(this.getPosition$v$c(), $.FormatStringV(szMessage, args)));
  }

  excCorrupt(szMessage, ...$va) {
    let args = null;
    args = { a: $va, i: 0 };
    $throw(new StdCompiler$CorruptException().init(this.getPosition$v$c(), $.FormatStringV(szMessage, args)));
  }

  setWarnCallback(pnWarnCB, pData) {
    this.pWarnCB = pnWarnCB;
    this.pWarnData = pData;
  }

  Warn(szWarning, ...$va) {
    if (this.pWarnCB == null) {
      return;
    }
    let args = null;
    args = { a: $va, i: 0 };
    let Msg = new $.StdStrBuf();
    Msg.FormatV(szWarning, args);
    this.pWarnCB(this.pWarnData, this.getPosition$v$c().getData(), Msg.getData());
  }

  static SeparatorToChar(eSep) {
    switch (eSep) {
      case 1:
        return 44;
      case 2:
        return 59;
      case 3:
        return 61;
      case 4:
        return 46;
      case 5:
        return 58;
      case 6:
        return 43;
      case 7:
        return 40;
      case 8:
        return 41;
      case 9:
        return 91;
      case 10:
        return 93;
      case 11:
        return 124;
      case 12:
        return 36;
      default:
        0;
    }
    return 32;
  }

  static IsStringEnd(c, eType) {
    switch (eType) {
      case 0:
        return c === 34 || c === 0 || c === 10 || c === 13;
      case 1:
        return c === 0 || c === 10 || c === 13;
      case 2:
      case 3:
      case 4:
        return !(c$isalnum(c & 0xff) !== 0) && c !== 95 && c !== 45;
    }
    return true;
  }

  Value$StdIntPackAdapt$u32(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdParameter2Adapt$StdPtrAdapt$C4Effect$pC4PropList$pC4ValueNumbers$2(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$StdParameterAdapt$C4ValueMapData$pC4ValueNumbers$C4ValueMapData(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$StdParameterAdapt$C4PropList$pC4ValueNumbers(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdParameter2Adapt$StdPtrAdapt$C4Effect$pC4AulScriptEngine$pC4ValueNumbers(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdParameter2Adapt$StdPtrAdapt$C4Effect$pC4PropList$pC4ValueNumbers(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$C4ValueNumbers(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdParameter2Adapt$C4Effect$pC4PropList$pC4ValueNumbers$2(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdParameter2Adapt$StdDecompileAdapt$C4Effect$pC4PropList$pC4ValueNumbers$2(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdParameterAdapt$C4ValueMapData$pC4ValueNumbers$C4ValueMapData(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdParameterAdapt$C4PropList$pC4ValueNumbers$2(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdParameter2Adapt$C4Effect$pC4AulScriptEngine$pC4ValueNumbers(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdParameter2Adapt$StdDecompileAdapt$C4Effect$pC4AulScriptEngine$pC4ValueNumbers(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdParameter2Adapt$C4Effect$pC4PropList$pC4ValueNumbers(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdParameter2Adapt$StdDecompileAdapt$C4Effect$pC4PropList$pC4ValueNumbers(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$rStdParameterAdapt$C4ValueMapData$pC4ValueNumbers(rStruct) {
    CompileFunc$rStdParameterAdapt$C4ValueMapData$pC4ValueNumbers$pStdCompiler(rStruct, this);
  }

  Value$rStdParameterAdapt$C4PropList$pC4ValueNumbers$2(rStruct) {
    CompileFunc$rStdParameterAdapt$C4PropList$pC4ValueNumbers$pStdCompiler(rStruct, this);
  }

  Value$rC4ValueNumbers(rStruct) {
    CompileFunc$rC4ValueNumbers$pStdCompiler(rStruct, this);
  }

  Value$rStdCopyStrBuf(rStruct) {
    CompileFunc$rStdCopyStrBuf$pStdCompiler(rStruct, this);
  }

  Value$StdParameterAdapt$StdStrBuf$i32(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdParameterAdapt$C4Value$pC4ValueNumbers(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdParameterAdapt$C4Set$C4Property$pC4ValueNumbers(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdParameterAdapt$C4Property$pC4ValueNumbers(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$rStdParameterAdapt$C4Value$pC4ValueNumbers(rStruct) {
    CompileFunc$rStdParameterAdapt$C4Value$pC4ValueNumbers$pStdCompiler(rStruct, this);
  }

  Value$rStdStrBuf(rStruct) {
    CompileFunc$rStdStrBuf$pStdCompiler(rStruct, this);
  }

  Value$StdParameterAdapt$StdPtrAdapt$C4PropList$pC4ValueNumbers(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdParameterAdapt$StdPtrAdapt$C4ValueArray$pC4ValueNumbers(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdParameterAdapt$StdDecompileAdapt$C4PropList$pC4ValueNumbers(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdParameterAdapt$C4PropList$pC4ValueNumbers(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdParameterAdapt$C4ValueArray$pC4ValueNumbers(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdParameterAdapt$StdDecompileAdapt$C4ValueArray$pC4ValueNumbers(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdArrayDefaultAdapt$C4Value$C4Value$StdParameterAdaptMaker$pC4ValueNumbers(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdParameterAdapt$C4Value$pC4ValueNumbers$C4Value(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$i32$i32(rStruct) {
    rStruct.CompileFunc(this);
  }

  $clone() { return new StdCompiler().$assign(this); }
  $assign(o) {
    this.pWarnCB = o.pWarnCB;
    this.pWarnData = o.pWarnData;
    return this;
  }
}

export class StdCompiler$Exception {
  Pos = new $.StdStrBuf();
  Msg = new $.StdStrBuf();

  init(Pos, Msg) {
    this.Pos = Pos.$clone();
    this.Msg = Msg.$clone();
    return this;
  }

  $copy(_Exc) {
    this.Pos = new $.StdStrBuf();
    this.Msg = new $.StdStrBuf();
    return this;
  }
  $clone() { return new StdCompiler$Exception().$copy(this); }
  $assign(o) {
    this.Pos.$assign(o.Pos);
    this.Msg.$assign(o.Msg);
    return this;
  }
}

export class StdCompilerINIWrite$Naming {
  Name = new $.StdStrBuf();
  Parent = null;

  None() {
    this.Name = new $.StdStrBuf();
    return this;
  }

  $clone() { return new StdCompilerINIWrite$Naming().$assign(this); }
  $assign(o) {
    this.Name.$assign(o.Name);
    this.Parent = o.Parent;
    return this;
  }
}

export class StdCompilerINIRead$NameNode {
  Name = new $.StdStrBuf();
  Section = false;
  Parent = null;
  FirstChild = null;
  PrevChild = null;
  NextChild = null;
  LastChild = null;
  Indent = -1;
  Pos = null;

  init(pParent = null) {
    this.Name = new $.StdStrBuf();
    this.Section = false;
    this.Parent = pParent;
    this.FirstChild = null;
    this.PrevChild = null;
    this.NextChild = null;
    this.LastChild = null;
    this.Indent = -1;
    this.Pos = null;
    return this;
  }

  $clone() { return new StdCompilerINIRead$NameNode().$assign(this); }
  $assign(o) {
    this.Name.$assign(o.Name);
    this.Section = o.Section;
    this.Parent = o.Parent;
    this.FirstChild = o.FirstChild;
    this.PrevChild = o.PrevChild;
    this.NextChild = o.NextChild;
    this.LastChild = o.LastChild;
    this.Indent = o.Indent;
    this.Pos = o.Pos;
    return this;
  }
}

export class StdCompiler$NotFoundException extends StdCompiler$Exception {

  init(Pos, Msg) {
    super.init(new $.StdStrBuf().init$rStdStrBuf$b(Pos), new $.StdStrBuf().init$rStdStrBuf$b(Msg));
    return this;
  }

  $clone() { return new StdCompiler$NotFoundException().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class StdCompiler$EOFException extends StdCompiler$Exception {

  init(Pos, Msg) {
    super.init(new $.StdStrBuf().init$rStdStrBuf$b(Pos), new $.StdStrBuf().init$rStdStrBuf$b(Msg));
    return this;
  }

  $clone() { return new StdCompiler$EOFException().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class StdCompiler$CorruptException extends StdCompiler$Exception {

  init(Pos, Msg) {
    super.init(new $.StdStrBuf().init$rStdStrBuf$b(Pos), new $.StdStrBuf().init$rStdStrBuf$b(Msg));
    return this;
  }

  $clone() { return new StdCompiler$CorruptException().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class StdCompilerNull extends StdCompiler {

  isDeserializer() {
    return true;
  }

  hasNaming() {
    return true;
  }

  Name(_szName) {
    return false;
  }

  NameCount(_szName = null) {
    return 0;
  }

  DWord$ri32(_rInt) {
  }

  DWord$ru32(_rInt) {
  }

  Word$ri16(_rShort) {
  }

  Word$ru16(_rShort) {
  }

  Byte$ri8(_rByte) {
  }

  Byte$ru8(_rByte) {
  }

  Boolean(_rBool) {
  }

  Character(_rChar) {
  }

  String$pi8$u64$i32(_szString, _iMaxLength, _eType = 0 /*RCT_Escaped*/) {
  }

  String$ppi8$i32(_pszString, _eType = 0 /*RCT_Escaped*/) {
  }

  String$rstring$i32(_str, _eType = 0 /*RCT_Escaped*/) {
  }

  Raw(_pData, _iSize, _eType = 0 /*RCT_Escaped*/) {
  }

  $clone() { return new StdCompilerNull().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class StdCompilerBinWrite extends StdCompiler {
  fSecondPass = false;
  iPos = 0;
  Buf = new $.StdBuf();

  getOutput() {
    return new $.StdBuf().init$rStdBuf$b(this.Buf);
  }

  isDoublePass() {
    return true;
  }

  DWord$ri32(rInt) {
    this.WriteValue$i32(rInt.a[rInt.o]);
  }

  DWord$ru32(rInt) {
    this.WriteValue$u32(rInt.a[rInt.o]);
  }

  Word$ri16(rShort) {
    this.WriteValue$i16(rShort.a[rShort.o]);
  }

  Word$ru16(rShort) {
    this.WriteValue$u16(rShort.a[rShort.o]);
  }

  Byte$ri8(rByte) {
    this.WriteValue$i8(rByte.a[rByte.o]);
  }

  Byte$ru8(rByte) {
    this.WriteValue$u8(rByte.a[rByte.o]);
  }

  Boolean(rBool) {
    this.WriteValue$b(rBool.a[rBool.o]);
  }

  Character(rChar) {
    this.WriteValue$i8$2(rChar.a[rChar.o]);
  }

  String$pi8$u64$i32(szString, _iMaxLength, _eType = 0 /*RCT_Escaped*/) {
    this.WriteData(szString, c$strlen(szString) + 1);
  }

  String$ppi8$i32(pszString, _eType = 0 /*RCT_Escaped*/) {
    if (pszString.a[pszString.o] != null) {
      this.WriteData(pszString.a[pszString.o], c$strlen(pszString.a[pszString.o]) + 1);
    } else {
      this.WriteValue$i8$2(0);
    }
  }

  String$rstring$i32(str, _type = 0 /*RCT_Escaped*/) {
    this.WriteData(str.c_str(), str.size() + 1);
  }

  Raw(pData, iSize, _eType = 0 /*RCT_Escaped*/) {
    if (this.fSecondPass) {
      this.Buf.Write$px$u64$u64(pData, iSize, $u64n(this.iPos));
    }
    this.iPos = $u64n(this.iPos) + iSize | 0;
  }

  Begin() {
    this.fSecondPass = false;
    this.iPos = 0;
  }

  BeginSecond() {
    this.Buf.New($u64n(this.iPos));
    this.fSecondPass = true;
    this.iPos = 0;
  }

  WriteData(pData, iSize) {
    if (this.fSecondPass) {
      this.Buf.Write$px$u64$u64(pData, iSize, $u64n(this.iPos));
    }
    this.iPos = $u64n(this.iPos) + iSize | 0;
  }

  WriteValue$i32(rValue) {
    if (this.fSecondPass) {
      $wr($.getMBufPtr$5(this.Buf, $u64n(this.iPos)), 0, rValue);
    }
    this.iPos = $u64n(this.iPos) + 4 | 0;
  }

  WriteValue$u32(rValue) {
    if (this.fSecondPass) {
      $wr($.getMBufPtr$6(this.Buf, $u64n(this.iPos)), 0, rValue);
    }
    this.iPos = $u64n(this.iPos) + 4 | 0;
  }

  WriteValue$i16(rValue) {
    if (this.fSecondPass) {
      $wr($.getMBufPtr$7(this.Buf, $u64n(this.iPos)), 0, rValue);
    }
    this.iPos = $u64n(this.iPos) + 2 | 0;
  }

  WriteValue$u16(rValue) {
    if (this.fSecondPass) {
      $wr($.getMBufPtr$8(this.Buf, $u64n(this.iPos)), 0, rValue);
    }
    this.iPos = $u64n(this.iPos) + 2 | 0;
  }

  WriteValue$i8(rValue) {
    if (this.fSecondPass) {
      $wr($.getMBufPtr(this.Buf, $u64n(this.iPos)), 0, rValue);
    }
    this.iPos = $u64n(this.iPos) + 1 | 0;
  }

  WriteValue$u8(rValue) {
    if (this.fSecondPass) {
      $wr($.getMBufPtr$4(this.Buf, $u64n(this.iPos)), 0, rValue);
    }
    this.iPos = $u64n(this.iPos) + 1 | 0;
  }

  WriteValue$b(rValue) {
    if (this.fSecondPass) {
      $wr($.getMBufPtr$2(this.Buf, $u64n(this.iPos)), 0, rValue);
    }
    this.iPos = $u64n(this.iPos) + 1 | 0;
  }

  WriteValue$i8$2(rValue) {
    if (this.fSecondPass) {
      $wr($.getMBufPtr$3(this.Buf, $u64n(this.iPos)), 0, rValue);
    }
    this.iPos = $u64n(this.iPos) + 1 | 0;
  }

  $clone() { return new StdCompilerBinWrite().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.fSecondPass = o.fSecondPass;
    this.iPos = o.iPos;
    this.Buf.$assign(o.Buf);
    return this;
  }
}

export class StdCompilerBinRead extends StdCompiler {
  iPos = 0;
  Buf = new $.StdBuf();

  setInput$mInT(In) {
    this.Buf.op_assign$mStdBuf(In);
  }

  isDeserializer() {
    return true;
  }

  DWord$ri32(rInt) {
    this.ReadValue$ri32(rInt);
  }

  DWord$ru32(rInt) {
    this.ReadValue$ru32(rInt);
  }

  Word$ri16(rShort) {
    this.ReadValue$ri16(rShort);
  }

  Word$ru16(rShort) {
    this.ReadValue$ru16(rShort);
  }

  Byte$ri8(rByte) {
    this.ReadValue$ri8(rByte);
  }

  Byte$ru8(rByte) {
    this.ReadValue$ru8(rByte);
  }

  Boolean(rBool) {
    this.ReadValue$rb(rBool);
  }

  Character(rChar) {
    this.ReadValue$ri8$2(rChar);
  }

  String$pi8$u64$i32(szString, iMaxLength, _eType = 0 /*RCT_Escaped*/) {
    let $t1, $t2;
    if (this.iPos >= $.StdBuf.prototype.getSize.call(this.Buf)) {
      this.excEOF();
      return;
    }
    let pPos = szString;
    while ($wr(($t1 = pPos, pPos = pPos.add(1), $t1), 0, $rd($.getBufPtr$3(this.Buf, ($t2 = this.iPos, this.iPos = this.iPos + 1, $t2)))) !== 0) {
      if (this.iPos >= $.StdBuf.prototype.getSize.call(this.Buf)) {
        this.excEOF();
        return;
      } else if (pPos.o > $padd(szString, iMaxLength).o) {
        this.excCorrupt(S("string too long"));
        return;
      }
    }
  }

  String$ppi8$i32(pszString, _eType = 0 /*RCT_Escaped*/) {
    let $t1;
    if (this.iPos >= $.StdBuf.prototype.getSize.call(this.Buf)) {
      this.excEOF();
      return;
    }
    let iStart = this.iPos | 0;
    while ($rd($.getBufPtr$3(this.Buf, ($t1 = this.iPos, this.iPos = this.iPos + 1, $t1))) !== 0) {
      if (this.iPos >= $.StdBuf.prototype.getSize.call(this.Buf)) {
        this.excEOF();
        return;
      }
    }
    pszString.a[pszString.o] = c$malloc(this.iPos - $u64n(iStart));
    c$memcpy(pszString.a[pszString.o], $.StdBuf.prototype.getPtr.call(this.Buf, $u64n(iStart)), this.iPos - $u64n(iStart));
  }

  String$rstring$i32(str, _type = 0 /*RCT_Escaped*/) {
    let $t1;
    if (this.iPos >= $.StdBuf.prototype.getSize.call(this.Buf)) {
      this.excEOF();
      return;
    }
    let iStart = this.iPos | 0;
    while ($rd($.getBufPtr$3(this.Buf, ($t1 = this.iPos, this.iPos = this.iPos + 1, $t1))) !== 0) {
      if (this.iPos >= $.StdBuf.prototype.getSize.call(this.Buf)) {
        this.excEOF();
        return;
      }
    }
    str.assign($.getBufPtr$3(this.Buf, $u64n(iStart)), $.getBufPtr$3(this.Buf, this.iPos));
  }

  Raw(pData, iSize, _eType = 0 /*RCT_Escaped*/) {
    if (this.iPos + iSize > $.StdBuf.prototype.getSize.call(this.Buf)) {
      this.excEOF();
      return;
    }
    c$memcpy(pData, $.StdBuf.prototype.getPtr.call(this.Buf, this.iPos), iSize);
    this.iPos = this.iPos + iSize;
  }

  getPosition$v$c() {
    return $.FormatString(S("byte %ld"), this.iPos);
  }

  Begin() {
    this.iPos = 0;
  }

  getPosition$v() {
    return this.iPos;
  }

  getRemainingBytes() {
    return $.StdBuf.prototype.getSize.call(this.Buf) - this.iPos;
  }

  ReadValue$ri32(rValue) {
    if (this.iPos + 4 > $.StdBuf.prototype.getSize.call(this.Buf)) {
      this.excEOF();
      return;
    }
    rValue.a[rValue.o] = $rd($.getBufPtr$5(this.Buf, this.iPos));
    this.iPos = this.iPos + 4;
  }

  ReadValue$ru32(rValue) {
    if (this.iPos + 4 > $.StdBuf.prototype.getSize.call(this.Buf)) {
      this.excEOF();
      return;
    }
    rValue.a[rValue.o] = $rd($.getBufPtr$6(this.Buf, this.iPos));
    this.iPos = this.iPos + 4;
  }

  ReadValue$ri16(rValue) {
    if (this.iPos + 2 > $.StdBuf.prototype.getSize.call(this.Buf)) {
      this.excEOF();
      return;
    }
    rValue.a[rValue.o] = $rd($.getBufPtr$7(this.Buf, this.iPos));
    this.iPos = this.iPos + 2;
  }

  ReadValue$ru16(rValue) {
    if (this.iPos + 2 > $.StdBuf.prototype.getSize.call(this.Buf)) {
      this.excEOF();
      return;
    }
    rValue.a[rValue.o] = $rd($.getBufPtr$8(this.Buf, this.iPos));
    this.iPos = this.iPos + 2;
  }

  ReadValue$ri8(rValue) {
    if (this.iPos + 1 > $.StdBuf.prototype.getSize.call(this.Buf)) {
      this.excEOF();
      return;
    }
    rValue.a[rValue.o] = $rd($.getBufPtr(this.Buf, this.iPos));
    this.iPos = this.iPos + 1;
  }

  ReadValue$ru8(rValue) {
    if (this.iPos + 1 > $.StdBuf.prototype.getSize.call(this.Buf)) {
      this.excEOF();
      return;
    }
    rValue.a[rValue.o] = $rd($.getBufPtr$4(this.Buf, this.iPos));
    this.iPos = this.iPos + 1;
  }

  ReadValue$rb(rValue) {
    if (this.iPos + 1 > $.StdBuf.prototype.getSize.call(this.Buf)) {
      this.excEOF();
      return;
    }
    rValue.a[rValue.o] = $rd($.getBufPtr$2(this.Buf, this.iPos));
    this.iPos = this.iPos + 1;
  }

  ReadValue$ri8$2(rValue) {
    if (this.iPos + 1 > $.StdBuf.prototype.getSize.call(this.Buf)) {
      this.excEOF();
      return;
    }
    rValue.a[rValue.o] = $rd($.getBufPtr$3(this.Buf, this.iPos));
    this.iPos = this.iPos + 1;
  }

  $clone() { return new StdCompilerBinRead().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.iPos = o.iPos;
    this.Buf.$assign(o.Buf);
    return this;
  }
}

export class StdCompilerINIWrite extends StdCompiler {
  Buf = new $.StdStrBuf();
  pNaming = null;
  iDepth = 0;
  fPutName = false;
  fInSection = false;

  getOutput() {
    return new $.StdStrBuf().init$rStdStrBuf$b(this.Buf);
  }

  hasNaming() {
    return true;
  }

  Name(szName) {
    if (this.fPutName) {
      this.PutName(true);
    }
    let pnNaming = new StdCompilerINIWrite$Naming().None();
    pnNaming.Name.Copy$pi8(szName);
    pnNaming.Parent = this.pNaming;
    this.pNaming = pnNaming;
    this.iDepth = this.iDepth + 1 | 0;
    this.fPutName = true;
    this.fInSection = false;
    return true;
  }

  NameEnd(_fBreak = false) {
    if (!this.fPutName && !this.fInSection) {
      this.Buf.Append$pi8(S("\n"));
    }
    this.fPutName = false;
    0;
    let poNaming = this.pNaming;
    this.pNaming = poNaming.Parent;
    $delete(poNaming);
    this.iDepth = this.iDepth - 1 | 0;
    this.fInSection = true;
  }

  Separator(eSep) {
    if (this.fInSection) {
      this.PutName(true);
    } else {
      this.PrepareForValue();
      this.Buf.AppendChar(StdCompiler.SeparatorToChar(eSep));
    }
    return true;
  }

  DWord$ri32(rInt) {
    this.PrepareForValue();
    this.Buf.AppendFormat(S("%d"), rInt.a[rInt.o]);
  }

  DWord$ru32(rInt) {
    this.PrepareForValue();
    this.Buf.AppendFormat(S("%u"), rInt.a[rInt.o]);
  }

  Word$ri16(rInt) {
    this.PrepareForValue();
    this.Buf.AppendFormat(S("%d"), rInt.a[rInt.o]);
  }

  Word$ru16(rInt) {
    this.PrepareForValue();
    this.Buf.AppendFormat(S("%u"), rInt.a[rInt.o]);
  }

  Byte$ri8(rByte) {
    this.PrepareForValue();
    this.Buf.AppendFormat(S("%d"), rByte.a[rByte.o]);
  }

  Byte$ru8(rInt) {
    this.PrepareForValue();
    this.Buf.AppendFormat(S("%u"), rInt.a[rInt.o]);
  }

  Boolean(rBool) {
    this.PrepareForValue();
    this.Buf.Append$pi8(rBool.a[rBool.o] ? S("true") : S("false"));
  }

  Character(rChar) {
    this.PrepareForValue();
    this.Buf.AppendFormat(S("%c"), rChar.a[rChar.o]);
  }

  StringN(szString, iLength, eType = 0 /*RCT_Escaped*/) {
    this.PrepareForValue();
    switch (eType) {
      case 0:
        this.WriteEscaped(szString, $padd(szString, iLength));
        break;
      case 1:
      case 2:
      case 3:
      case 4:
        this.Buf.Append$pi8(szString);
    }
  }

  String$pi8$u64$i32(szString, iMaxLength, eType = 0 /*RCT_Escaped*/) {
    this.StringN(szString, c$strnlen(szString, iMaxLength), eType);
  }

  String$ppi8$i32(pszString, eType = 0 /*RCT_Escaped*/) {
    0;
    const cNull = [0];
    let szString = pszString.a[pszString.o] != null ? pszString.a[pszString.o] : P(cNull, 0);
    this.String$pi8$u64$i32(szString, c$strlen(szString), eType);
  }

  String$rstring$i32(str, type = 0 /*RCT_Escaped*/) {
    this.StringN(str.c_str(), str.size(), type);
  }

  Raw(pData, iSize, eType = 0 /*RCT_Escaped*/) {
    switch (eType) {
      case 0:
        this.WriteEscaped(pData, $padd(pData, iSize));
        break;
      case 1:
      case 2:
      case 3:
      case 4:
        this.Buf.Append$pi8$u64(pData, iSize);
    }
  }

  Begin() {
    this.pNaming = null;
    this.fPutName = false;
    this.iDepth = 0;
    this.fInSection = false;
    this.Buf.Clear();
  }

  End() {
    0;
  }

  PrepareForValue() {
    if (this.fPutName) {
      this.PutName(false);
    }
    0;
    0;
  }

  WriteEscaped(szString, pEnd) {
    this.Buf.AppendChar(34);
    let pStart = null;
    let pPos = null;
    pStart = pPos = szString;
    let fLastNumEscape = false;
    for (; pPos.o < pEnd.o; pPos = pPos.add(1)) {
      if (!(c$isprint(pPos.a[pPos.o] & 0xff) !== 0) || pPos.a[pPos.o] === 92 || pPos.a[pPos.o] === 34 || fLastNumEscape && c$isdigit(pPos.a[pPos.o] & 0xff) !== 0) {
        if (pPos.o - pStart.o !== 0) {
          this.Buf.Append$pi8$u64(pStart, $u64n(pPos.o - pStart.o));
        }
        fLastNumEscape = false;
        switch (pPos.a[pPos.o]) {
          case 7:
            this.Buf.Append$pi8(S("\\a"));
            break;
          case 8:
            this.Buf.Append$pi8(S("\\b"));
            break;
          case 12:
            this.Buf.Append$pi8(S("\\f"));
            break;
          case 10:
            this.Buf.Append$pi8(S("\\n"));
            break;
          case 13:
            this.Buf.Append$pi8(S("\\r"));
            break;
          case 9:
            this.Buf.Append$pi8(S("\\t"));
            break;
          case 11:
            this.Buf.Append$pi8(S("\\v"));
            break;
          case 34:
            this.Buf.Append$pi8(S("\\\""));
            break;
          case 92:
            this.Buf.Append$pi8(S("\\\\"));
            break;
          default:
            this.Buf.AppendFormat(S("\\%o"), $rd($view8(pPos, false)));
            fLastNumEscape = true;
        }
        pStart = $padd(pPos, 1);
      } else {
        fLastNumEscape = false;
      }
    }
    if (pEnd.o - pStart.o !== 0) {
      this.Buf.Append$pi8$u64(pStart, $u64n(pEnd.o - pStart.o));
    }
    this.Buf.AppendChar(34);
  }

  WriteIndent(fSection) {
    let iIndent = this.iDepth - 1 | 0;
    if (!fSection) {
      iIndent = iIndent - 1 | 0;
    }
    if (iIndent <= 0) {
      return;
    }
    this.Buf.AppendChars(32, $u64n(Math.imul(iIndent, 2)));
  }

  PutName(fSection) {
    if (fSection && this.Buf.getLength() !== 0) {
      this.Buf.Append$pi8(S("\n"));
    }
    this.WriteIndent(fSection);
    if (fSection) {
      this.Buf.AppendFormat(S("[%s]\n"), this.pNaming.Name.getData());
    } else {
      this.Buf.AppendFormat(S("%s="), this.pNaming.Name.getData());
    }
    this.fPutName = false;
  }

  $clone() { return new StdCompilerINIWrite().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.Buf.$assign(o.Buf);
    this.pNaming = o.pNaming;
    this.iDepth = o.iDepth;
    this.fPutName = o.fPutName;
    this.fInSection = o.fInSection;
    return this;
  }
}

export class StdCompilerINIRead extends StdCompiler {
  pNameRoot = null;
  pName = null;
  iDepth = 0;
  iRealDepth = 0;
  Buf = new $.StdStrBuf();
  pPos = null;
  pReenter = null;
  NotFoundName = new $.StdCopyStrBuf();
  lineBreaks = [];

  init() {
    this.pNameRoot = null;
    this.iDepth = 0;
    this.iRealDepth = 0;
    this.Buf = new $.StdStrBuf();
    this.NotFoundName = new $.StdCopyStrBuf();
    this.lineBreaks = [];
    return this;
  }

  $dtor() {
    this.FreeNameTree();
  }

  setInput$InT(In) {
    this.Buf.Ref$StdStrBuf(In);
    this.lineBreaks.length = 0;
  }

  isDeserializer() {
    return true;
  }

  hasNaming() {
    return true;
  }

  Name(szName) {
    this.iDepth = this.iDepth + 1 | 0;
    if ((this.iDepth - 1 | 0) > this.iRealDepth) {
      return false;
    }
    if (!(c$isalpha(szName.a[szName.o] & 0xff) !== 0)) {
      0;
      return false;
    }
    for (let p = $padd(szName, 1); p.a[p.o] !== 0; p = p.add(1)) {
      if (!(c$isalnum(p.a[p.o] & 0xff) !== 0) && p.a[p.o] !== 32 && p.a[p.o] !== 95 && p.a[p.o] !== 42) {
        0;
        return false;
      }
    }
    let pNode = null;
    for (pNode = this.pName.FirstChild; pNode != null; pNode = pNode.NextChild) {
      if (pNode.Pos != null && pNode.Name.op_eq$pi8(szName)) {
        break;
      }
    }
    if (pNode == null) {
      this.NotFoundName.op_assign$pi8(szName);
      return false;
    }
    this.pName = pNode;
    this.pPos = this.pName.Pos;
    this.pReenter = null;
    this.iRealDepth = this.iRealDepth + 1 | 0;
    return true;
  }

  NameEnd(fBreak = false) {
    0;
    if (this.iRealDepth === this.iDepth) {
      for (let pNode = this.pName.FirstChild, pNext = null; pNode != null; pNode = pNext) {
        if (pNode.Pos != null && !fBreak) {
          this.Warn(S("Unexpected %s \"%s\"!"), pNode.Section ? S("section") : S("value"), pNode.Name.getData());
        }
        pNext = pNode.NextChild;
        $delete(pNode);
      }
      let pParent = this.pName.Parent;
      this.pName.PrevChild != null ? this.pName.PrevChild.NextChild : pParent.FirstChild = this.pName.NextChild;
      this.pName.NextChild != null ? this.pName.NextChild.PrevChild : pParent.LastChild = this.pName.PrevChild;
      $delete(this.pName);
      this.pName = pParent;
      this.iRealDepth = this.iRealDepth - 1 | 0;
    }
    this.iDepth = this.iDepth - 1 | 0;
    this.pPos = null;
    this.pReenter = null;
  }

  FollowName(szName) {
    if (this.iDepth > this.iRealDepth) {
      return false;
    }
    if (this.pName.NextChild == null || this.pName.NextChild.Name.op_ne$pi8(szName)) {
      this.NameEnd();
      this.iDepth = this.iDepth + 1 | 0;
      return false;
    }
    this.NameEnd();
    this.Name(szName);
    return true;
  }

  GetNameByIndex(idx) {
    let $t1;
    if (this.iDepth > this.iRealDepth || this.pName == null) {
      return null;
    }
    let pNode = null;
    for (pNode = this.pName.FirstChild; pNode != null; pNode = pNode.NextChild) {
      if (pNode.Pos != null) {
        if (!(($t1 = idx, idx = idx - 1, $t1) !== 0)) {
          return pNode.Name.getData();
        }
      }
    }
    return null;
  }

  Separator(eSep) {
    if (this.iDepth > this.iRealDepth) {
      return false;
    }
    if (this.pName.Section) {
      let CurrName = new $.StdStrBuf().init$rStdStrBuf$b(this.pName.Name);
      this.NameEnd();
      return this.Name(CurrName.getData());
    }
    if (this.pReenter != null) {
      this.pPos = this.pReenter;
      this.pReenter = null;
    }
    if (this.pPos == null) {
      return false;
    }
    this.SkipWhitespace();
    if (this.pPos.a[this.pPos.o] !== StdCompiler.SeparatorToChar(eSep)) {
      this.pReenter = this.pPos;
      this.pPos = null;
      return false;
    }
    this.pPos = this.pPos.add(1);
    return true;
  }

  NoSeparator() {
    if (this.pReenter != null) {
      this.pPos = this.pReenter;
      this.pReenter = null;
    }
  }

  NameCount(szName = null) {
    if (this.iDepth > this.iRealDepth || this.pName == null) {
      return 0;
    }
    let iCount = 0;
    let pNode = null;
    for (pNode = this.pName.FirstChild; pNode != null; pNode = pNode.NextChild) {
      if (pNode.Pos != null && (szName == null || pNode.Name.op_eq$pi8(szName))) {
        iCount = iCount + 1 | 0;
      }
    }
    return iCount;
  }

  DWord$ri32(rInt) {
    rInt.a[rInt.o] = this.ReadNum() | 0;
  }

  DWord$ru32(rInt) {
    rInt.a[rInt.o] = this.ReadUNum() >>> 0;
  }

  Word$ri16(rShort) {
    let MIN = -32768;
    let MAX = 32767;
    let iNum = this.ReadNum() | 0;
    if (iNum < MIN || iNum > MAX) {
      this.Warn(S("number out of range (%d to %d): %d "), MIN, MAX, iNum);
    }
    rShort.a[rShort.o] = $.Clamp$i32$i32$i32(iNum, MIN, MAX) << 16 >> 16;
  }

  Word$ru16(rShort) {
    let MIN = 0;
    let MAX = 65535;
    let iNum = this.ReadUNum() >>> 0;
    if (iNum > MAX) {
      this.Warn(S("number out of range (%u to %u): %u "), MIN, MAX, iNum);
    }
    rShort.a[rShort.o] = $.Clamp$u32$u32$u32(iNum, MIN, MAX) & 0xffff;
  }

  Byte$ri8(rByte) {
    let MIN = -128;
    let MAX = 127;
    let iNum = this.ReadNum() | 0;
    if (iNum < MIN || iNum > MAX) {
      this.Warn(S("number out of range (%d to %d): %d "), MIN, MAX, iNum);
    }
    rByte.a[rByte.o] = $.Clamp$i32$i32$i32(iNum, MIN, MAX) << 24 >> 24;
  }

  Byte$ru8(rByte) {
    let MIN = 0;
    let MAX = 255;
    let iNum = this.ReadUNum() >>> 0;
    if (iNum > MAX) {
      this.Warn(S("number out of range (%u to %u): %u "), MIN, MAX, iNum);
    }
    rByte.a[rByte.o] = $.Clamp$u32$u32$u32(iNum, MIN, MAX) & 0xff;
  }

  Boolean(rBool) {
    if (this.pPos == null) {
      this.notFound(S("Boolean"));
      return;
    }
    if (this.pPos.a[this.pPos.o] === 49 && !(c$isdigit($rd($padd(this.pPos, 1)) & 0xff) !== 0)) {
      rBool.a[rBool.o] = true;
      this.pPos = this.pPos.add(1);
    } else if (this.pPos.a[this.pPos.o] === 48 && !(c$isdigit($rd($padd(this.pPos, 1)) & 0xff) !== 0)) {
      rBool.a[rBool.o] = false;
      this.pPos = this.pPos.add(1);
    } else if ($.SEqual2(this.pPos, S("true"))) {
      rBool.a[rBool.o] = true;
      this.pPos = this.pPos.add(4);
    } else if ($.SEqual2(this.pPos, S("false"))) {
      rBool.a[rBool.o] = false;
      this.pPos = this.pPos.add(5);
    } else {
      this.notFound(S("Boolean"));
      return;
    }
  }

  Character(rChar) {
    let $t1;
    if (this.pPos == null || !(c$isalpha(this.pPos.a[this.pPos.o] & 0xff) !== 0)) {
      this.notFound(S("Character"));
      return;
    }
    rChar.a[rChar.o] = $rd(($t1 = this.pPos, this.pPos = this.pPos.add(1), $t1));
  }

  String$pi8$u64$i32(szString, iMaxLength, eType = 0 /*RCT_Escaped*/) {
    let Buf = this.ReadString(iMaxLength, eType, true);
    $.SCopy$pi8$pi8$u64($.getBufPtr$3(Buf), szString, iMaxLength);
  }

  String$ppi8$i32(pszString, eType = 0 /*RCT_Escaped*/) {
    let iLength = this.GetStringLength(eType);
    let Buf = this.ReadString(iLength, eType, true);
    pszString.a[pszString.o] = $.StdBuf.prototype.GrabPointer.call(Buf);
  }

  String$rstring$i32(str, type = 0 /*RCT_Escaped*/) {
    let iLength = this.GetStringLength(type);
    let Buf = this.ReadString(iLength, type, true);
    str.assign($.getBufPtr$3(Buf));
  }

  Raw(pData, iSize, eType = 0 /*RCT_Escaped*/) {
    let Buf = this.ReadString(iSize, eType, false);
    if ($.StdBuf.prototype.getSize.call(Buf) !== iSize) {
      this.Warn(S("got %u bytes raw data, but %u bytes expected!"), $.StdBuf.prototype.getSize.call(Buf), iSize);
    }
    $.MemCopy($.StdBuf.prototype.getData.call(Buf), pData, iSize);
  }

  getPosition$v$c() {
    if (this.pPos != null) {
      return $.FormatString(S("line %d"), this.getLineNumberOfPos(this.pPos));
    } else if (this.iDepth === this.iRealDepth) {
      return $.FormatString(this.pName.Section ? S("section \"%s\", after line %d") : S("value \"%s\", line %d"), this.pName.Name.getData(), this.getLineNumberOfPos(this.pName.Pos));
    } else if (this.iRealDepth !== 0) {
      return $.FormatString(S("missing value/section \"%s\" inside section \"%s\" (line %d)"), this.NotFoundName.getData(), this.pName.Name.getData(), this.getLineNumberOfPos(this.pName.Pos));
    } else {
      return $.FormatString(S("missing value/section \"%s\""), this.NotFoundName.getData());
    }
  }

  Begin() {
    0;
    this.CreateNameTree();
    this.iDepth = this.iRealDepth = 0;
    this.pPos = null;
    this.pReenter = null;
  }

  End() {
    0;
    this.FreeNameTree();
  }

  CreateNameTree() {
    let $t1;
    this.FreeNameTree();
    this.pName = this.pNameRoot = new StdCompilerINIRead$NameNode().init();
    if (this.Buf.op_not()) {
      return;
    }
    this.pPos = this.Buf.getPtr(0);
    while (this.pPos.a[this.pPos.o] !== 0) {
      let iIndent = 0;
      while (this.pPos.a[this.pPos.o] === 32 || this.pPos.a[this.pPos.o] === 9) {
        this.pPos = this.pPos.add(1);
        iIndent = iIndent + 1 | 0;
      }
      let fSection = this.pPos.a[this.pPos.o] === 91 && c$isalpha($rd($padd(this.pPos, 1)) & 0xff) !== 0;
      if (fSection || c$isalpha(this.pPos.a[this.pPos.o] & 0xff) !== 0) {
        if (!fSection) {
          iIndent = iIndent + 1 | 0;
        } else {
          this.pPos = this.pPos.add(1);
        }
        while (this.pName.Parent != null && this.pName.Indent >= iIndent) {
          this.pName = this.pName.Parent;
        }
        let Name = new $.StdStrBuf();
        while (c$isalnum(this.pPos.a[this.pPos.o] & 0xff) !== 0 || this.pPos.a[this.pPos.o] === 32 || this.pPos.a[this.pPos.o] === 95) {
          Name.AppendChar($rd(($t1 = this.pPos, this.pPos = this.pPos.add(1), $t1)));
        }
        while (this.pPos.a[this.pPos.o] === 32 || this.pPos.a[this.pPos.o] === 9) {
          this.pPos = this.pPos.add(1);
        }
        if (this.pPos.a[this.pPos.o] !== (fSection ? 93 : 61)) {
          this.Warn(c$isprint(this.pPos.a[this.pPos.o] & 0xff) !== 0 ? S("Unexpected character ('%c'): %s ignored") : S("Unexpected character ('0x%02x'): %s ignored"), this.pPos.a[this.pPos.o] >>> 0, fSection ? S("section") : S("value"));
        } else {
          this.pPos = this.pPos.add(1);
          let pPrev = this.pName.LastChild;
          this.pName = this.pName.LastChild = this.pName.LastChild != null ? this.pName.LastChild.NextChild : this.pName.FirstChild = new StdCompilerINIRead$NameNode().init(this.pName);
          this.pName.PrevChild = pPrev;
          this.pName.Name.Take$mStdStrBuf(Name);
          this.pName.Pos = this.pPos;
          this.pName.Indent = iIndent;
          this.pName.Section = fSection;
          if (!fSection) {
            this.pName = this.pName.Parent;
          }
        }
      }
      while (this.pPos.a[this.pPos.o] !== 0 && (this.pPos.a[this.pPos.o] !== 10 && this.pPos.a[this.pPos.o] !== 13)) {
        this.pPos = this.pPos.add(1);
      }
      while (this.pPos.a[this.pPos.o] === 10 || this.pPos.a[this.pPos.o] === 13) {
        this.pPos = this.pPos.add(1);
      }
    }
    this.pName = this.pNameRoot;
  }

  FreeNameTree() {
    this.FreeNameNode(this.pNameRoot);
    this.pName = this.pNameRoot = null;
  }

  FreeNameNode(pDelNode) {
    let pNode = pDelNode;
    while (pNode != null) {
      if (pNode.FirstChild != null) {
        pNode = pNode.FirstChild;
      } else {
        let pDelete = pNode;
        if (pDelete === pDelNode) {
          $delete(pDelete);
          break;
        }
        if (pNode.NextChild != null) {
          pNode = pNode.NextChild;
        } else {
          pNode = pNode.Parent;
          if (pNode != null) {
            pNode.FirstChild = null;
          }
        }
        $delete(pDelete);
      }
    }
  }

  SkipWhitespace() {
    while (this.pPos.a[this.pPos.o] === 32 || this.pPos.a[this.pPos.o] === 9) {
      this.pPos = this.pPos.add(1);
    }
  }

  SkipNum() {
    while (this.pPos.a[this.pPos.o] === 43 || this.pPos.a[this.pPos.o] === 45 || c$isdigit(this.pPos.a[this.pPos.o] & 0xff) !== 0) {
      this.pPos = this.pPos.add(1);
    }
  }

  ReadNum() {
    if (this.pPos == null) {
      this.notFound(S("Number"));
      return 0;
    }
    this.SkipWhitespace();
    const pnPos = [this.pPos];
    let iNum = c$strtol(this.pPos, P(pnPos, 0), 10);
    if (iNum === 0 && $peq(pnPos[0], this.pPos)) {
      this.notFound(S("Number"));
      return 0;
    }
    this.pPos = pnPos[0];
    return iNum;
  }

  GetStringLength(eRawType) {
    let $t1;
    if (this.pPos == null) {
      this.notFound(S("String"));
      return 0;
    }
    this.SkipWhitespace();
    let pStart = this.pPos;
    if (eRawType === 0 && $rd(($t1 = this.pPos, this.pPos = this.pPos.add(1), $t1)) !== 34) {
      this.notFound(S("Escaped string"));
      return 0;
    }
    let iLength = 0;
    while (!this.TestStringEnd(eRawType)) {
      if (eRawType === 0) {
        this.ReadEscapedChar();
      } else {
        this.pPos = this.pPos.add(1);
      }
      iLength = iLength + 1;
    }
    this.pPos = pStart;
    return iLength;
  }

  ReadString(iLength, eRawType, fAppendNull = true) {
    let $t1, $t2, $t3, $t4;
    if (this.pPos == null) {
      this.notFound(S("String"));
      return new $.StdBuf();
    }
    this.SkipWhitespace();
    if (eRawType === 0 && $rd(($t1 = this.pPos, this.pPos = this.pPos.add(1), $t1)) !== 34) {
      this.notFound(S("Escaped string"));
      return new $.StdBuf();
    }
    let OutBuf = new $.StdBuf();
    OutBuf.New(iLength + (fAppendNull ? 1 : 0));
    let pOut = $.getMBufPtr$3(OutBuf);
    while (iLength !== 0 && !this.TestStringEnd(eRawType)) {
      if (eRawType === 0) {
        $wr(($t2 = pOut, pOut = pOut.add(1), $t2), 0, this.ReadEscapedChar());
      } else {
        $wr(($t3 = pOut, pOut = pOut.add(1), $t3), 0, $rd(($t4 = this.pPos, this.pPos = this.pPos.add(1), $t4)));
      }
      iLength = iLength - 1;
    }
    if (eRawType === 0) {
      while (this.pPos.a[this.pPos.o] !== 34) {
        if (this.pPos.a[this.pPos.o] === 0 || this.pPos.a[this.pPos.o] === 10 || this.pPos.a[this.pPos.o] === 13) {
          this.Warn(S("string not terminated!"));
          this.pPos = this.pPos.add(-1);
          break;
        }
        this.pPos = this.pPos.add(1);
      }
      this.pPos = this.pPos.add(1);
    }
    if (pOut === $.StdBuf.prototype.getData.call(OutBuf) && (eRawType === 2 || eRawType === 4)) {
      this.notFound(S("String"));
      return new $.StdBuf();
    }
    if (fAppendNull) {
      pOut.a[pOut.o] = 0;
    }
    $.StdBuf.prototype.Shrink.call(OutBuf, iLength);
    return OutBuf;
  }

  TestStringEnd(eType) {
    return StdCompiler.IsStringEnd(this.pPos.a[this.pPos.o], eType);
  }

  ReadEscapedChar() {
    let $t1, $t2;
    if (this.pPos.a[this.pPos.o] >= 0 && c$iscntrl(this.pPos.a[this.pPos.o] & 0xff) !== 0) {
      this.Warn(S("Nonprintable character found in string: %02x"), this.pPos.a[this.pPos.o] & 0xff);
      return this.pPos.a[this.pPos.o];
    }
    if (this.pPos.a[this.pPos.o] !== 92) {
      return $rd(($t1 = this.pPos, this.pPos = this.pPos.add(1), $t1));
    }
    switch ($rd((this.pPos = this.pPos.add(1)))) {
      case 97:
        this.pPos = this.pPos.add(1);
        return 7;
      case 98:
        this.pPos = this.pPos.add(1);
        return 8;
      case 102:
        this.pPos = this.pPos.add(1);
        return 12;
      case 110:
        this.pPos = this.pPos.add(1);
        return 10;
      case 114:
        this.pPos = this.pPos.add(1);
        return 13;
      case 116:
        this.pPos = this.pPos.add(1);
        return 9;
      case 118:
        this.pPos = this.pPos.add(1);
        return 11;
      case 39:
        this.pPos = this.pPos.add(1);
        return 39;
      case 34:
        this.pPos = this.pPos.add(1);
        return 34;
      case 92:
        this.pPos = this.pPos.add(1);
        return 92;
      case 63:
        this.pPos = this.pPos.add(1);
        return 63;
      case 120:
        if (!(c$isxdigit($rd((this.pPos = this.pPos.add(1))) & 0xff) !== 0)) {
          return 120;
        } else {
          let iCode = 0;
          do {
            iCode = Math.imul(iCode, 16) + (c$isdigit(this.pPos.a[this.pPos.o] & 0xff) !== 0 ? this.pPos.a[this.pPos.o] - 48 | 0 : (this.pPos.a[this.pPos.o] - 97 | 0) + 10 | 0) | 0;
            this.pPos = this.pPos.add(1);
          } while (c$isxdigit(this.pPos.a[this.pPos.o] & 0xff) !== 0);
          return iCode << 24 >> 24;
        }
      default:
        if (!(c$isdigit(this.pPos.a[this.pPos.o] & 0xff) !== 0) || this.pPos.a[this.pPos.o] >= 56) {
          return $rd(($t2 = this.pPos, this.pPos = this.pPos.add(1), $t2));
        } else {
          let iCode = 0;
          do {
            iCode = Math.imul(iCode, 8) + (this.pPos.a[this.pPos.o] - 48 | 0) | 0;
            this.pPos = this.pPos.add(1);
          } while (c$isdigit(this.pPos.a[this.pPos.o] & 0xff) !== 0 && this.pPos.a[this.pPos.o] < 56);
          return iCode << 24 >> 24;
        }
    }
    0;
  }

  ReadUNum() {
    if (this.pPos == null) {
      this.notFound(S("Number"));
      return 0;
    }
    this.SkipWhitespace();
    const pnPos = [this.pPos];
    let iNum = c$strtoul(this.pPos, P(pnPos, 0), 10);
    if (iNum === 0 && $peq(pnPos[0], this.pPos)) {
      this.notFound(S("Number"));
      return 0;
    }
    this.pPos = pnPos[0];
    return iNum;
  }

  notFound(szWhat) {
    this.excNotFound(S("%s expected"), szWhat);
  }

  getLineNumberOfPos(pos) {
    let entry = std_lower_bound($begin(this.lineBreaks), $end(this.lineBreaks), pos);
    if (!entry.eq($end(this.lineBreaks))) {
      return std_distance($begin(this.lineBreaks), entry) + 1 >>> 0;
    }
    let cursor = this.Buf.getData();
    if (!(this.lineBreaks.length === 0)) {
      cursor = $padd($end(this.lineBreaks).add(-1).v, 1);
    }
    for (; ; ) {
      if (cursor.a[cursor.o] === 0 || cursor.a[cursor.o] === 10) {
        this.lineBreaks.push(cursor);
        if (cursor.a[cursor.o] === 0 || pos.o < cursor.o) {
          break;
        }
      }
      cursor = cursor.add(1);
    }
    return std_distance($begin(this.lineBreaks), std_lower_bound($begin(this.lineBreaks), $end(this.lineBreaks), pos)) + 1 >>> 0;
  }

  $clone() { return new StdCompilerINIRead().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pNameRoot = o.pNameRoot;
    this.pName = o.pName;
    this.iDepth = o.iDepth;
    this.iRealDepth = o.iRealDepth;
    this.Buf.$assign(o.Buf);
    this.pPos = o.pPos;
    this.pReenter = o.pReenter;
    this.NotFoundName.$assign(o.NotFoundName);
    this.lineBreaks = o.lineBreaks.slice();
    return this;
  }
}

export function CompileFunc$rStdCopyStrBuf$pStdCompiler(rStruct, pComp) {
  $.StdStrBuf.prototype.CompileFunc.call(rStruct, pComp);
}

export function CompileFunc$rC4ValueNumbers$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdParameterAdapt$C4PropList$pC4ValueNumbers$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdParameterAdapt$C4ValueMapData$pC4ValueNumbers$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdParameterAdapt$C4Value$pC4ValueNumbers$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdStrBuf$pStdCompiler(rStruct, pComp) {
  $.StdStrBuf.prototype.CompileFunc.call(rStruct, pComp);
}

export function CompileFunc$rstring$pStdCompiler(s, comp) {
  comp.String$rstring$i32(s);
}

export function CompileNewFunc$rpC4ValueArray$pStdCompiler$mpC4ValueNumbers(pStruct, pComp, pars) {
  let $t1;
  let temp = new $.C4ValueArray();
  pComp.Value$StdParameterAdapt$C4ValueArray$pC4ValueNumbers($.mkParAdapt$rC4ValueArray$mpC4ValueNumbers(temp, pars));
  pStruct.a[pStruct.o] = ($t1 = temp, temp = null, $t1);
}

export function CompileNewFunc$rpC4Effect$pStdCompiler$mpC4PropList$rpC4ValueNumbers(pStruct, pComp, pars, pars$2) {
  let $t1;
  let temp = new $.C4Effect().init$v();
  pComp.Value$StdParameter2Adapt$C4Effect$pC4PropList$pC4ValueNumbers($.mkParAdapt$rC4Effect$mpC4PropList$rpC4ValueNumbers(temp, pars, $tmp(pars$2.a[pars$2.o])));
  pStruct.a[pStruct.o] = ($t1 = temp, temp = null, $t1);
}

export function CompileNewFunc$rpC4Effect$pStdCompiler$mpC4AulScriptEngine$rpC4ValueNumbers(pStruct, pComp, pars, pars$2) {
  let $t1;
  let temp = new $.C4Effect().init$v();
  pComp.Value$StdParameter2Adapt$C4Effect$pC4AulScriptEngine$pC4ValueNumbers($.mkParAdapt$rC4Effect$mpC4AulScriptEngine$rpC4ValueNumbers(temp, pars, $tmp(pars$2.a[pars$2.o])));
  pStruct.a[pStruct.o] = ($t1 = temp, temp = null, $t1);
}

export function CompileNewFunc$rpC4Effect$pStdCompiler$rpC4PropList$rpC4ValueNumbers(pStruct, pComp, pars, pars$2) {
  let $t1;
  let temp = new $.C4Effect().init$v();
  pComp.Value$StdParameter2Adapt$C4Effect$pC4PropList$pC4ValueNumbers$2($.mkParAdapt$rC4Effect$rpC4PropList$rpC4ValueNumbers(temp, $tmp(pars.a[pars.o]), $tmp(pars$2.a[pars$2.o])));
  pStruct.a[pStruct.o] = ($t1 = temp, temp = null, $t1);
}

export function StdCompilerWarnCallback(pData, szPosition, szError) {
  let szName = pData;
  if (szPosition == null || szPosition.a[szPosition.o] === 0) {
    $.DebugLogF(S("WARNING: %s (in %s)"), szError, szName);
  } else {
    $.DebugLogF(S("WARNING: %s (in %s, %s)"), szError, szPosition, szName);
  }
}

export function $init(): void {
}

Object.assign($, { CompileFunc$rC4ValueNumbers$pStdCompiler, CompileFunc$rStdCopyStrBuf$pStdCompiler, CompileFunc$rStdParameterAdapt$C4PropList$pC4ValueNumbers$pStdCompiler, CompileFunc$rStdParameterAdapt$C4Value$pC4ValueNumbers$pStdCompiler, CompileFunc$rStdParameterAdapt$C4ValueMapData$pC4ValueNumbers$pStdCompiler, CompileFunc$rStdStrBuf$pStdCompiler, CompileFunc$rstring$pStdCompiler, CompileNewFunc$rpC4Effect$pStdCompiler$mpC4AulScriptEngine$rpC4ValueNumbers, CompileNewFunc$rpC4Effect$pStdCompiler$mpC4PropList$rpC4ValueNumbers, CompileNewFunc$rpC4Effect$pStdCompiler$rpC4PropList$rpC4ValueNumbers, CompileNewFunc$rpC4ValueArray$pStdCompiler$mpC4ValueNumbers, StdCompiler, StdCompiler$CorruptException, StdCompiler$EOFException, StdCompiler$Exception, StdCompiler$NotFoundException, StdCompilerBinRead, StdCompilerBinWrite, StdCompilerINIRead, StdCompilerINIRead$NameNode, StdCompilerINIWrite, StdCompilerINIWrite$Naming, StdCompilerNull, StdCompilerWarnCallback });
