// @ts-nocheck
// OpenClonk 36de799: src/lib/StdCompiler.cpp, src/lib/StdCompiler.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $u64n } from '../../rt/int.ts';
import { c$isalnum, c$isalpha, c$iscntrl, c$isdigit, c$isprint, c$isxdigit, c$malloc, c$memcpy, c$strlen, c$strnlen, c$strtol, c$strtoul } from '../../rt/libc.ts';
import { $padd, $peq, $rd, $reinterpVoid, $tmp, $view8, $wr, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $begin, $delete, $end, $itcopy, $missing, $throw, std_distance, std_lower_bound } from '../../rt/std.ts';

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

  Value$StdParameterAdapt$StdCopyStrBuf$i32$2(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$i32$i32(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$i32$i32(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$rStdParameterAdapt$StdStrBuf$i32$2(rStruct) {
    CompileFunc$rStdParameterAdapt$StdStrBuf$i32$pStdCompiler(rStruct, this);
  }

  Value$rStdCopyStrBuf(rStruct) {
    CompileFunc$rStdCopyStrBuf$pStdCompiler(rStruct, this);
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

  Value$StdNamingDefaultAdapt$StdStringAdapt$x$5(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$StdStrBuf$x(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$StdStrBuf$x$3(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$StdStringAdapt$x(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$b$b(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$StdStringAdapt$x$6(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$StdStringAdapt$x$13(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$ValidatedStdCopyStrBuf$10$x(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$i32$i16(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$ValidatedStdCopyStrBuf$3$x(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$StdStringAdapt$x$10(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$StdStringAdapt$x$9(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$StdStringAdapt$x$11(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$StdStringAdapt$x$8(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$x$2(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$StdStringAdapt$x$4(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$StdStringAdapt$x$2(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$StdStringAdapt$x$7(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$u32$u32(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$C4PlayerControlAssignmentSets$C4PlayerControlAssignmentSets(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$C4ConfigGeneral(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$C4ConfigControls(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$C4ConfigGamepad(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$C4ConfigGraphics(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$C4ConfigSound(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$C4ConfigNetwork(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$C4ConfigLobby(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$C4ConfigIRC(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$C4ConfigDeveloper(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$C4ConfigStartup(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$C4ConfigSecurity(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdStringAdapt$x$6(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdStringAdapt(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdStrBuf$x(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdStrBuf$x$3(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdStringAdapt$x$2(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$b$b(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdStringAdapt$x$7(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdStringAdapt$x$14(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$ValidatedStdCopyStrBuf$10$x(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$i32$i16(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$ValidatedStdCopyStrBuf$3$x(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdStringAdapt$x$11(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdStringAdapt$x$10(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdStringAdapt$x$12(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdStringAdapt$x$9(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$x$2(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdParameterAdapt$StdCopyStrBuf$i32(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdStringAdapt$x$5(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdStringAdapt$x$3(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdStringAdapt$x$8(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$u32$u32(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$C4PlayerControlAssignmentSets$C4PlayerControlAssignmentSets(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$rStdStringAdapt(rStruct) {
    CompileFunc$rStdStringAdapt$pStdCompiler(rStruct, this);
  }

  Value$rStdStrBuf(rStruct) {
    CompileFunc$rStdStrBuf$pStdCompiler(rStruct, this);
  }

  Value$rValidatedStdCopyStrBuf$10(rStruct) {
    CompileFunc$rValidatedStdCopyStrBuf$10$pStdCompiler(rStruct, this);
  }

  Value$rValidatedStdCopyStrBuf$3(rStruct) {
    CompileFunc$rValidatedStdCopyStrBuf$3$pStdCompiler(rStruct, this);
  }

  Value$rStdParameterAdapt$StdCopyStrBuf$i32(rStruct) {
    CompileFunc$rStdParameterAdapt$StdCopyStrBuf$i32$pStdCompiler(rStruct, this);
  }

  Value$rStdParameterAdapt$C4ConfigGamepad$b(rStruct) {
    CompileFunc$rStdParameterAdapt$C4ConfigGamepad$b$pStdCompiler(rStruct, this);
  }

  Value$rC4PlayerControlAssignmentSets(rStruct) {
    CompileFunc$rC4PlayerControlAssignmentSets$pStdCompiler(rStruct, this);
  }

  Value$rC4Config(rStruct) {
    CompileFunc$rC4Config$pStdCompiler(rStruct, this);
  }

  Value$rC4ConfigGeneral(rStruct) {
    CompileFunc$rC4ConfigGeneral$pStdCompiler(rStruct, this);
  }

  Value$rC4ConfigControls(rStruct) {
    CompileFunc$rC4ConfigControls$pStdCompiler(rStruct, this);
  }

  Value$rC4ConfigGamepad(rStruct) {
    CompileFunc$rC4ConfigGamepad$pStdCompiler(rStruct, this);
  }

  Value$rC4ConfigGraphics(rStruct) {
    CompileFunc$rC4ConfigGraphics$pStdCompiler(rStruct, this);
  }

  Value$rC4ConfigSound(rStruct) {
    CompileFunc$rC4ConfigSound$pStdCompiler(rStruct, this);
  }

  Value$rC4ConfigNetwork(rStruct) {
    CompileFunc$rC4ConfigNetwork$pStdCompiler(rStruct, this);
  }

  Value$rC4ConfigLobby(rStruct) {
    CompileFunc$rC4ConfigLobby$pStdCompiler(rStruct, this);
  }

  Value$rC4ConfigIRC(rStruct) {
    CompileFunc$rC4ConfigIRC$pStdCompiler(rStruct, this);
  }

  Value$rC4ConfigDeveloper(rStruct) {
    CompileFunc$rC4ConfigDeveloper$pStdCompiler(rStruct, this);
  }

  Value$rC4ConfigStartup(rStruct) {
    CompileFunc$rC4ConfigStartup$pStdCompiler(rStruct, this);
  }

  Value$rC4ConfigSecurity(rStruct) {
    CompileFunc$rC4ConfigSecurity$pStdCompiler(rStruct, this);
  }

  Compile$mStdParameterAdapt$C4ConfigGamepad$b(rStruct) {
    0;
    this.DoCompilation$rStdParameterAdapt$C4ConfigGamepad$b(rStruct);
  }

  Compile$rC4Config(rStruct) {
    0;
    this.DoCompilation$rC4Config(rStruct);
  }

  Decompile$C4Config(rStruct) {
    0;
    this.DoCompilation$rC4Config(rStruct);
  }

  DoCompilation$rStdParameterAdapt$C4ConfigGamepad$b(rStruct) {
    this.Begin();
    this.Value$rStdParameterAdapt$C4ConfigGamepad$b(rStruct);
    if (this.isDoublePass()) {
      this.BeginSecond();
      this.Value$rStdParameterAdapt$C4ConfigGamepad$b(rStruct);
    }
    this.End();
  }

  DoCompilation$rC4Config(rStruct) {
    this.Begin();
    this.Value$rC4Config(rStruct);
    if (this.isDoublePass()) {
      this.BeginSecond();
      this.Value$rC4Config(rStruct);
    }
    this.End();
  }

  Value$StdNamingDefaultAdapt$StdIntPackAdapt$i32$i32$2(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$StdIntAdapt$i32$i32$i32(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$StdStrBuf$x$2(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$StdCopyStrBuf$x$2(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$StdCopyStrBuf(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$StdArrayAdapt$i32$_IdFuncClass$i32$i32(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$StdIntAdapt$i32$i32$i32$2(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$C4KeyEventData$C4KeyEventData(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$StdSTLContainerAdapt$vector$ControlItem$vector$ControlItem(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$i32(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$StdEnumAdapt$i32$i32$i32$3(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$C4ClientCore(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$StdIntAdapt$i32$u8$i32$6(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$StdIntPackAdapt$i32$i32(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$StdCopyStrBuf$x(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$C4NetFilenameAdapt$x(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$C4Network2ResCore(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$StdBuf(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$StdIntAdapt$i32$u8$2(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$C4Fixed$i32(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$StdIntAdapt$i32$u8(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$StdIntAdapt$i32$u8$i32$2(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$StdIntAdapt$i32$u8$i32$4(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$StdIntAdapt$i32$u8$i32$3(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$StdCopyStrBuf$StdCopyStrBuf(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$StdIntAdapt$i32$u8$i32$7(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdIntPackAdapt$i32$i32$2(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdIntPackAdapt$i32(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdIntAdapt$i32$i32$i32(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdStrBuf$x$2(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdCopyStrBuf$x$2(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdArrayAdapt$i32$_IdFuncClass$i32$i32(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdIntAdapt$i32$i32$i32$2(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$C4KeyEventData$C4KeyEventData(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdSTLContainerAdapt$vector$ControlItem$vector$ControlItem(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdEnumAdapt$i32$i32$i32$3(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdIntAdapt$i32$i32$6(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdIntAdapt$i32$u8$i32$6(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdIntPackAdapt$i32$i32(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdCopyStrBuf$x(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$C4NetFilenameAdapt$x(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$C4Fixed$i32(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdIntAdapt$i32$u8$i32$2(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdIntAdapt$i32$u8$i32$4(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdIntAdapt$i32$u8$i32$3(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdCopyStrBuf$StdCopyStrBuf(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdIntAdapt$i32$u8$i32$7(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$rC4PacketList(rStruct) {
    CompileFunc$rC4PacketList$pStdCompiler(rStruct, this);
  }

  Value$rC4ClientPlayerInfos(rStruct) {
    CompileFunc$rC4ClientPlayerInfos$pStdCompiler(rStruct, this);
  }

  Value$rStdBuf(rStruct) {
    CompileFunc$rStdBuf$pStdCompiler(rStruct, this);
  }

  Value$rStdIntPackAdapt$i32(rStruct) {
    CompileFunc$rStdIntPackAdapt$i32$pStdCompiler(rStruct, this);
  }

  Value$rStdIntAdapt$i32$i32(rStruct) {
    CompileFunc$rStdIntAdapt$i32$i32$pStdCompiler(rStruct, this);
  }

  Value$rStdArrayAdapt$i32$_IdFuncClass$i32(rStruct) {
    CompileFunc$rStdArrayAdapt$i32$_IdFuncClass$i32$pStdCompiler(rStruct, this);
  }

  Value$rStdIntAdapt$i32$i32$7(rStruct) {
    CompileFunc$rStdIntAdapt$i32$i32$pStdCompiler$3(rStruct, this);
  }

  Value$rC4KeyEventData(rStruct) {
    CompileFunc$rC4KeyEventData$pStdCompiler(rStruct, this);
  }

  Value$rStdSTLContainerAdapt$vector$ControlItem(rStruct) {
    CompileFunc$rStdSTLContainerAdapt$vector$ControlItem$pStdCompiler(rStruct, this);
  }

  Value$rC4ControlPlayerControl$ControlItem(rStruct) {
    CompileFunc$rC4ControlPlayerControl$ControlItem$pStdCompiler(rStruct, this);
  }

  Value$rStdEnumAdapt$i32$i32$3(rStruct) {
    CompileFunc$rStdEnumAdapt$i32$i32$pStdCompiler$3(rStruct, this);
  }

  Value$rC4ClientCore(rStruct) {
    CompileFunc$rC4ClientCore$pStdCompiler(rStruct, this);
  }

  Value$rStdIntAdapt$i32$u8$10(rStruct) {
    CompileFunc$rStdIntAdapt$i32$u8$pStdCompiler$7(rStruct, this);
  }

  Value$rC4NetFilenameAdapt(rStruct) {
    CompileFunc$rC4NetFilenameAdapt$pStdCompiler(rStruct, this);
  }

  Value$rC4Network2ResCore(rStruct) {
    CompileFunc$rC4Network2ResCore$pStdCompiler(rStruct, this);
  }

  Value$rStdIntAdapt$i32$u8$11(rStruct) {
    CompileFunc$rStdIntAdapt$i32$u8$pStdCompiler$8(rStruct, this);
  }

  Value$rC4Fixed(rStruct) {
    $.CompileFunc$rC4Fixed$pStdCompiler(rStruct, this);
  }

  Value$rStdIntAdapt$i32$u8$9(rStruct) {
    CompileFunc$rStdIntAdapt$i32$u8$pStdCompiler$6(rStruct, this);
  }

  Value$rStdIntAdapt$i32$u8$3(rStruct) {
    CompileFunc$rStdIntAdapt$i32$u8$pStdCompiler$2(rStruct, this);
  }

  Value$rStdIntAdapt$i32$u8$7(rStruct) {
    CompileFunc$rStdIntAdapt$i32$u8$pStdCompiler$4(rStruct, this);
  }

  Value$rStdIntAdapt$i32$u8$5(rStruct) {
    CompileFunc$rStdIntAdapt$i32$u8$pStdCompiler$3(rStruct, this);
  }

  Value$rStdIntAdapt$i32$u8$14(rStruct) {
    CompileFunc$rStdIntAdapt$i32$u8$pStdCompiler$9(rStruct, this);
  }

  Value$rC4PktDebugRec(rStruct) {
    CompileFunc$rC4PktDebugRec$pStdCompiler(rStruct, this);
  }

  Decompile$C4PktDebugRec(rStruct) {
    0;
    this.DoCompilation$rC4PktDebugRec(rStruct);
  }

  DoCompilation$rC4PktDebugRec(rStruct) {
    this.Begin();
    this.Value$rC4PktDebugRec(rStruct);
    if (this.isDoublePass()) {
      this.BeginSecond();
      this.Value$rC4PktDebugRec(rStruct);
    }
    this.End();
  }

  Value$StdPtrAdapt$C4Network2ResCore(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingCountAdapt$i32(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$StdArrayAdapt$pC4GameRes$StdPtrAdapt$C4GameRes(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$C4IDList$C4IDList(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$StdCopyStrBuf$StdStrBuf(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$C4GameRes(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$C4PlayerInfoList(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$C4TeamList(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$C4ScenarioParameters(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDecompileAdapt$C4Network2ResCore(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdPtrAdapt$C4GameRes(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDecompileAdapt$C4GameRes(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$C4IDList$C4IDList(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdCopyStrBuf$StdStrBuf(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$rC4GameResList(rStruct) {
    CompileFunc$rC4GameResList$pStdCompiler(rStruct, this);
  }

  Value$rStdNamingAdapt$C4PlayerInfoList(rStruct) {
    CompileFunc$rStdNamingAdapt$C4PlayerInfoList$pStdCompiler(rStruct, this);
  }

  Value$rStdNamingAdapt$C4TeamList(rStruct) {
    CompileFunc$rStdNamingAdapt$C4TeamList$pStdCompiler(rStruct, this);
  }

  Value$rC4ClientList(rStruct) {
    CompileFunc$rC4ClientList$pStdCompiler(rStruct, this);
  }

  Value$rStdArrayAdapt$pC4GameRes$StdPtrAdapt$C4GameRes(rStruct) {
    CompileFunc$rStdArrayAdapt$pC4GameRes$StdPtrAdapt$C4GameRes$pStdCompiler(rStruct, this);
  }

  Value$rC4GameRes(rStruct) {
    CompileFunc$rC4GameRes$pStdCompiler(rStruct, this);
  }

  Value$rStdNamingAdapt$StdParameterAdapt$C4GameParameters$pC4Scenario(rStruct) {
    CompileFunc$rStdNamingAdapt$StdParameterAdapt$C4GameParameters$pC4Scenario$pStdCompiler(rStruct, this);
  }

  Value$rStdParameterAdapt$C4GameParameters$pC4Scenario(rStruct) {
    CompileFunc$rStdParameterAdapt$C4GameParameters$pC4Scenario$pStdCompiler(rStruct, this);
  }

  Value$rC4IDList(rStruct) {
    CompileFunc$rC4IDList$pStdCompiler(rStruct, this);
  }

  Value$rC4PlayerInfoList(rStruct) {
    CompileFunc$rC4PlayerInfoList$pStdCompiler(rStruct, this);
  }

  Value$rC4TeamList(rStruct) {
    CompileFunc$rC4TeamList$pStdCompiler(rStruct, this);
  }

  Value$rC4ScenarioParameters(rStruct) {
    CompileFunc$rC4ScenarioParameters$pStdCompiler(rStruct, this);
  }

  Compile$mStdParameterAdapt$C4GameParameters$pC4Scenario(rStruct) {
    0;
    this.DoCompilation$rStdParameterAdapt$C4GameParameters$pC4Scenario(rStruct);
  }

  Compile$rStdNamingAdapt$StdParameterAdapt$C4GameParameters$pC4Scenario(rStruct) {
    0;
    this.DoCompilation$rStdNamingAdapt$StdParameterAdapt$C4GameParameters$pC4Scenario(rStruct);
  }

  Decompile$StdNamingAdapt$StdParameterAdapt$C4GameParameters$pC4Scenario(rStruct) {
    0;
    this.DoCompilation$rStdNamingAdapt$StdParameterAdapt$C4GameParameters$pC4Scenario(rStruct);
  }

  DoCompilation$rStdNamingAdapt$StdParameterAdapt$C4GameParameters$pC4Scenario(rStruct) {
    this.Begin();
    this.Value$rStdNamingAdapt$StdParameterAdapt$C4GameParameters$pC4Scenario(rStruct);
    if (this.isDoublePass()) {
      this.BeginSecond();
      this.Value$rStdNamingAdapt$StdParameterAdapt$C4GameParameters$pC4Scenario(rStruct);
    }
    this.End();
  }

  DoCompilation$rStdParameterAdapt$C4GameParameters$pC4Scenario(rStruct) {
    this.Begin();
    this.Value$rStdParameterAdapt$C4GameParameters$pC4Scenario(rStruct);
    if (this.isDoublePass()) {
      this.BeginSecond();
      this.Value$rStdParameterAdapt$C4GameParameters$pC4Scenario(rStruct);
    }
    this.End();
  }

  Value$StdNamingDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$x$3(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$C4ID$C4ID(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$StdEnumAdapt$i32$i32$i32(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$StdEnumAdapt$i32$i32$i32$2(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdSTLContainerAdapt$vector$C4PlayerControlDef(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdParameterAdapt$C4KeyCodeEx$pStdCopyStrBuf(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$StdSTLContainerAdapt$vector$KeyComboItem$vector$KeyComboItem(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$StdBitfieldAdapt$i32$i32(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$x(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdSTLContainerAdapt$vector$C4PlayerControlAssignment(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdSTLContainerAdapt$list$C4PlayerControlAssignmentSet(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$C4PlayerControlDefs$C4PlayerControlDefs(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$StdSTLContainerAdapt$vector$ControlDownState$vector$ControlDownState(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$StdSTLContainerAdapt$vector$i32$vector$i32(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$CSync$CSync(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$x$3(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$C4ID$C4ID(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdEnumAdapt$i32$i32$i32(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdIntAdapt$i32$i32$4(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdEnumAdapt$i32$i32$i32$2(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdIntAdapt$i32$i32$5(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdSTLContainerAdapt$vector$KeyComboItem$vector$KeyComboItem(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdBitfieldAdapt$i32$i32$2(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$x(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$C4PlayerControlDefs$C4PlayerControlDefs(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdSTLContainerAdapt$vector$ControlDownState$vector$ControlDownState(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdSTLContainerAdapt$vector$i32$vector$i32(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$CSync$CSync(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$rC4ID(rStruct) {
    CompileFunc$rC4ID$pStdCompiler(rStruct, this);
  }

  Value$rStdEnumAdapt$i32$i32(rStruct) {
    CompileFunc$rStdEnumAdapt$i32$i32$pStdCompiler(rStruct, this);
  }

  Value$rStdEnumAdapt$i32$i32$2(rStruct) {
    CompileFunc$rStdEnumAdapt$i32$i32$pStdCompiler$2(rStruct, this);
  }

  Value$rC4PlayerControlDef(rStruct) {
    CompileFunc$rC4PlayerControlDef$pStdCompiler(rStruct, this);
  }

  Value$rStdSTLContainerAdapt$vector$KeyComboItem(rStruct) {
    CompileFunc$rStdSTLContainerAdapt$vector$KeyComboItem$pStdCompiler(rStruct, this);
  }

  Value$rC4PlayerControlAssignment$KeyComboItem(rStruct) {
    CompileFunc$rC4PlayerControlAssignment$KeyComboItem$pStdCompiler(rStruct, this);
  }

  Value$rStdBitfieldAdapt$i32(rStruct) {
    CompileFunc$rStdBitfieldAdapt$i32$pStdCompiler(rStruct, this);
  }

  Value$rC4PlayerControlAssignment(rStruct) {
    CompileFunc$rC4PlayerControlAssignment$pStdCompiler(rStruct, this);
  }

  Value$rC4PlayerControlAssignmentSet(rStruct) {
    CompileFunc$rC4PlayerControlAssignmentSet$pStdCompiler(rStruct, this);
  }

  Value$rC4PlayerControlDefs(rStruct) {
    CompileFunc$rC4PlayerControlDefs$pStdCompiler(rStruct, this);
  }

  Value$rC4PlayerControlFile(rStruct) {
    CompileFunc$rC4PlayerControlFile$pStdCompiler(rStruct, this);
  }

  Value$rStdSTLContainerAdapt$vector$ControlDownState(rStruct) {
    CompileFunc$rStdSTLContainerAdapt$vector$ControlDownState$pStdCompiler(rStruct, this);
  }

  Value$rC4PlayerControl$CSync$ControlDownState(rStruct) {
    CompileFunc$rC4PlayerControl$CSync$ControlDownState$pStdCompiler(rStruct, this);
  }

  Value$rStdSTLContainerAdapt$vector$i32(rStruct) {
    CompileFunc$rStdSTLContainerAdapt$vector$i32$pStdCompiler(rStruct, this);
  }

  Value$rC4PlayerControl$CSync(rStruct) {
    CompileFunc$rC4PlayerControl$CSync$pStdCompiler(rStruct, this);
  }

  Compile$rC4PlayerControlFile(rStruct) {
    0;
    this.DoCompilation$rC4PlayerControlFile(rStruct);
  }

  Decompile$C4PlayerControlFile(rStruct) {
    0;
    this.DoCompilation$rC4PlayerControlFile(rStruct);
  }

  DoCompilation$rC4PlayerControlFile(rStruct) {
    this.Begin();
    this.Value$rC4PlayerControlFile(rStruct);
    if (this.isDoublePass()) {
      this.BeginSecond();
      this.Value$rC4PlayerControlFile(rStruct);
    }
    this.End();
  }

  Value$StdNamingDefaultAdapt$ValidatedStdCopyStrBuf$4$x(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$StdBitfieldAdapt$u16$u32(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$StdEnumAdapt$i32$u8$i32(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$StdParameterAdapt$ValidatedStdCopyStrBuf$3$i32$x(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$StdBitfieldAdapt$u32$u32(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$StdArrayAdapt$pC4PlayerInfo$StdPtrAdapt$C4PlayerInfo(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$StdArrayAdapt$pC4ClientPlayerInfos$StdPtrAdapt$C4ClientPlayerInfos(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$C4ClientPlayerInfos(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$ValidatedStdCopyStrBuf$4$x(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdBitfieldAdapt$u16$u32(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdEnumAdapt$i32$u8$i32(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdIntAdapt$i32$u8$2(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdParameterAdapt$ValidatedStdCopyStrBuf$3$i32$x(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdBitfieldAdapt$u32$u32(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdPtrAdapt$C4PlayerInfo(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDecompileAdapt$C4PlayerInfo(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdPtrAdapt$C4ClientPlayerInfos(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDecompileAdapt$C4ClientPlayerInfos(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$rValidatedStdCopyStrBuf$4(rStruct) {
    CompileFunc$rValidatedStdCopyStrBuf$4$pStdCompiler(rStruct, this);
  }

  Value$rStdBitfieldAdapt$u16(rStruct) {
    CompileFunc$rStdBitfieldAdapt$u16$pStdCompiler(rStruct, this);
  }

  Value$rStdEnumAdapt$i32$u8(rStruct) {
    CompileFunc$rStdEnumAdapt$i32$u8$pStdCompiler(rStruct, this);
  }

  Value$rStdParameterAdapt$ValidatedStdCopyStrBuf$3$i32(rStruct) {
    CompileFunc$rStdParameterAdapt$ValidatedStdCopyStrBuf$3$i32$pStdCompiler(rStruct, this);
  }

  Value$rStdBitfieldAdapt$u32(rStruct) {
    CompileFunc$rStdBitfieldAdapt$u32$pStdCompiler(rStruct, this);
  }

  Value$rStdArrayAdapt$pC4PlayerInfo$StdPtrAdapt$C4PlayerInfo(rStruct) {
    CompileFunc$rStdArrayAdapt$pC4PlayerInfo$StdPtrAdapt$C4PlayerInfo$pStdCompiler(rStruct, this);
  }

  Value$rC4PlayerInfo(rStruct) {
    CompileFunc$rC4PlayerInfo$pStdCompiler(rStruct, this);
  }

  Value$rStdArrayAdapt$pC4ClientPlayerInfos$StdPtrAdapt$C4ClientPlayerInfos(rStruct) {
    CompileFunc$rStdArrayAdapt$pC4ClientPlayerInfos$StdPtrAdapt$C4ClientPlayerInfos$pStdCompiler(rStruct, this);
  }

  Compile$rStdNamingAdapt$C4PlayerInfoList(rStruct) {
    0;
    this.DoCompilation$rStdNamingAdapt$C4PlayerInfoList(rStruct);
  }

  Decompile$StdNamingAdapt$C4PlayerInfoList(rStruct) {
    0;
    this.DoCompilation$rStdNamingAdapt$C4PlayerInfoList(rStruct);
  }

  DoCompilation$rStdNamingAdapt$C4PlayerInfoList(rStruct) {
    this.Begin();
    this.Value$rStdNamingAdapt$C4PlayerInfoList(rStruct);
    if (this.isDoublePass()) {
      this.BeginSecond();
      this.Value$rStdNamingAdapt$C4PlayerInfoList(rStruct);
    }
    this.End();
  }

  Value$StdNamingAdapt$StdIntAdapt$i32$i32(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$StdIntAdapt$u8$i32(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdPtrAdapt$C4Control(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdPtrAdapt$C4IDPacket(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdPtrAdapt$StdBuf(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdPtrAdapt$C4PktDebugRec(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDecompileAdapt$C4Control(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDecompileAdapt$C4IDPacket(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDecompileAdapt$StdBuf(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDecompileAdapt$C4PktDebugRec(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$C4IDPacket(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$rStdIntAdapt$i32$i32$2(rStruct) {
    CompileFunc$rStdIntAdapt$i32$i32$pStdCompiler$2(rStruct, this);
  }

  Value$rStdIntAdapt$u8$i32(rStruct) {
    CompileFunc$rStdIntAdapt$u8$i32$pStdCompiler(rStruct, this);
  }

  Value$rC4Control(rStruct) {
    CompileFunc$rC4Control$pStdCompiler(rStruct, this);
  }

  Value$rC4IDPacket(rStruct) {
    CompileFunc$rC4IDPacket$pStdCompiler(rStruct, this);
  }

  Value$rStdInsertAdapt$StdStrBuf$StdBuf(rStruct) {
    CompileFunc$rStdInsertAdapt$StdStrBuf$StdBuf$pStdCompiler(rStruct, this);
  }

  Value$rStdNamingAdapt$StdSTLContainerAdapt$list$C4RecordChunk(rStruct) {
    CompileFunc$rStdNamingAdapt$StdSTLContainerAdapt$list$C4RecordChunk$pStdCompiler(rStruct, this);
  }

  Value$rStdSTLContainerAdapt$list$C4RecordChunk(rStruct) {
    CompileFunc$rStdSTLContainerAdapt$list$C4RecordChunk$pStdCompiler(rStruct, this);
  }

  Value$rC4RecordChunk(rStruct) {
    CompileFunc$rC4RecordChunk$pStdCompiler(rStruct, this);
  }

  Value$rStdNamingAdapt$StdDecompileAdapt$C4RecordChunk(rStruct) {
    CompileFunc$rStdNamingAdapt$StdDecompileAdapt$C4RecordChunk$pStdCompiler(rStruct, this);
  }

  Value$rStdDecompileAdapt$C4RecordChunk(rStruct) {
    CompileFunc$rStdDecompileAdapt$C4RecordChunk$pStdCompiler(rStruct, this);
  }

  Value$rStdNamingAdapt$C4IDPacket(rStruct) {
    CompileFunc$rStdNamingAdapt$C4IDPacket$pStdCompiler(rStruct, this);
  }

  Compile$rStdNamingAdapt$StdSTLContainerAdapt$list$C4RecordChunk(rStruct) {
    0;
    this.DoCompilation$rStdNamingAdapt$StdSTLContainerAdapt$list$C4RecordChunk(rStruct);
  }

  Decompile$C4Control(rStruct) {
    0;
    this.DoCompilation$rC4Control(rStruct);
  }

  Decompile$C4IDPacket(rStruct) {
    0;
    this.DoCompilation$rC4IDPacket(rStruct);
  }

  Decompile$StdInsertAdapt$StdStrBuf$StdBuf(rStruct) {
    0;
    this.DoCompilation$rStdInsertAdapt$StdStrBuf$StdBuf(rStruct);
  }

  Decompile$StdNamingAdapt$StdDecompileAdapt$C4RecordChunk(rStruct) {
    0;
    this.DoCompilation$rStdNamingAdapt$StdDecompileAdapt$C4RecordChunk(rStruct);
  }

  Decompile$StdNamingAdapt$C4IDPacket(rStruct) {
    0;
    this.DoCompilation$rStdNamingAdapt$C4IDPacket(rStruct);
  }

  DoCompilation$rC4Control(rStruct) {
    this.Begin();
    this.Value$rC4Control(rStruct);
    if (this.isDoublePass()) {
      this.BeginSecond();
      this.Value$rC4Control(rStruct);
    }
    this.End();
  }

  DoCompilation$rC4IDPacket(rStruct) {
    this.Begin();
    this.Value$rC4IDPacket(rStruct);
    if (this.isDoublePass()) {
      this.BeginSecond();
      this.Value$rC4IDPacket(rStruct);
    }
    this.End();
  }

  DoCompilation$rStdInsertAdapt$StdStrBuf$StdBuf(rStruct) {
    this.Begin();
    this.Value$rStdInsertAdapt$StdStrBuf$StdBuf(rStruct);
    if (this.isDoublePass()) {
      this.BeginSecond();
      this.Value$rStdInsertAdapt$StdStrBuf$StdBuf(rStruct);
    }
    this.End();
  }

  DoCompilation$rStdNamingAdapt$StdSTLContainerAdapt$list$C4RecordChunk(rStruct) {
    this.Begin();
    this.Value$rStdNamingAdapt$StdSTLContainerAdapt$list$C4RecordChunk(rStruct);
    if (this.isDoublePass()) {
      this.BeginSecond();
      this.Value$rStdNamingAdapt$StdSTLContainerAdapt$list$C4RecordChunk(rStruct);
    }
    this.End();
  }

  DoCompilation$rStdNamingAdapt$StdDecompileAdapt$C4RecordChunk(rStruct) {
    this.Begin();
    this.Value$rStdNamingAdapt$StdDecompileAdapt$C4RecordChunk(rStruct);
    if (this.isDoublePass()) {
      this.BeginSecond();
      this.Value$rStdNamingAdapt$StdDecompileAdapt$C4RecordChunk(rStruct);
    }
    this.End();
  }

  DoCompilation$rStdNamingAdapt$C4IDPacket(rStruct) {
    this.Begin();
    this.Value$rStdNamingAdapt$C4IDPacket(rStruct);
    if (this.isDoublePass()) {
      this.BeginSecond();
      this.Value$rStdNamingAdapt$C4IDPacket(rStruct);
    }
    this.End();
  }

  Value$StdNamingDefaultAdapt$StdEnumAdapt$i32$u8$i32$5(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$StdArrayAdapt$pC4RoundResultsPlayer$StdPtrAdapt$C4RoundResultsPlayer(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$C4RoundResultsPlayers$C4RoundResultsPlayers(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$StdEnumAdapt$i32$u8$i32$4(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdEnumAdapt$i32$u8$i32$5(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdIntAdapt$i32$u8$15(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdPtrAdapt$C4RoundResultsPlayer(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDecompileAdapt$C4RoundResultsPlayer(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$C4RoundResultsPlayers$C4RoundResultsPlayers(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdEnumAdapt$i32$u8$i32$4(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdIntAdapt$i32$u8$13(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$rC4RoundResultsPlayers(rStruct) {
    CompileFunc$rC4RoundResultsPlayers$pStdCompiler(rStruct, this);
  }

  Value$rStdEnumAdapt$i32$u8$6(rStruct) {
    CompileFunc$rStdEnumAdapt$i32$u8$pStdCompiler$5(rStruct, this);
  }

  Value$rStdArrayAdapt$pC4RoundResultsPlayer$StdPtrAdapt$C4RoundResultsPlayer(rStruct) {
    CompileFunc$rStdArrayAdapt$pC4RoundResultsPlayer$StdPtrAdapt$C4RoundResultsPlayer$pStdCompiler(rStruct, this);
  }

  Value$rC4RoundResultsPlayer(rStruct) {
    CompileFunc$rC4RoundResultsPlayer$pStdCompiler(rStruct, this);
  }

  Value$rStdEnumAdapt$i32$u8$5(rStruct) {
    CompileFunc$rStdEnumAdapt$i32$u8$pStdCompiler$4(rStruct, this);
  }

  Value$rStdNamingAdapt$C4RoundResults(rStruct) {
    CompileFunc$rStdNamingAdapt$C4RoundResults$pStdCompiler(rStruct, this);
  }

  Value$rC4RoundResults(rStruct) {
    CompileFunc$rC4RoundResults$pStdCompiler(rStruct, this);
  }

  Compile$rStdNamingAdapt$C4RoundResults(rStruct) {
    0;
    this.DoCompilation$rStdNamingAdapt$C4RoundResults(rStruct);
  }

  Decompile$StdNamingAdapt$C4RoundResults(rStruct) {
    0;
    this.DoCompilation$rStdNamingAdapt$C4RoundResults(rStruct);
  }

  DoCompilation$rStdNamingAdapt$C4RoundResults(rStruct) {
    this.Begin();
    this.Value$rStdNamingAdapt$C4RoundResults(rStruct);
    if (this.isDoublePass()) {
      this.BeginSecond();
      this.Value$rStdNamingAdapt$C4RoundResults(rStruct);
    }
    this.End();
  }

  Value$StdNamingAdapt$StdArrayDefaultAdapt$i32$i32$_IdFuncClass$i32(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$StdCopyStrBuf(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$StdEnumAdapt$i32$u8$i32$3(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$StdParameterAdapt$StdStrBuf$i32$StdStrBuf(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$StdArrayAdapt$pC4Team$StdPtrAdapt$C4Team(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdArrayDefaultAdapt$i32$i32$_IdFuncClass$i32(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$StdCopyStrBuf(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdEnumAdapt$i32$u8$i32$3(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdIntAdapt$i32$u8$12(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdParameterAdapt$StdStrBuf$i32$StdStrBuf(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdPtrAdapt$C4Team(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDecompileAdapt$C4Team(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$rStdArrayDefaultAdapt$i32$i32$_IdFuncClass$i32(rStruct) {
    CompileFunc$rStdArrayDefaultAdapt$i32$i32$_IdFuncClass$i32$pStdCompiler(rStruct, this);
  }

  Value$rStdEnumAdapt$i32$u8$4(rStruct) {
    CompileFunc$rStdEnumAdapt$i32$u8$pStdCompiler$3(rStruct, this);
  }

  Value$rStdArrayAdapt$pC4Team$StdPtrAdapt$C4Team(rStruct) {
    CompileFunc$rStdArrayAdapt$pC4Team$StdPtrAdapt$C4Team$pStdCompiler(rStruct, this);
  }

  Value$rC4Team(rStruct) {
    CompileFunc$rC4Team$pStdCompiler(rStruct, this);
  }

  Compile$rStdNamingAdapt$C4TeamList(rStruct) {
    0;
    this.DoCompilation$rStdNamingAdapt$C4TeamList(rStruct);
  }

  Decompile$StdNamingAdapt$C4TeamList(rStruct) {
    0;
    this.DoCompilation$rStdNamingAdapt$C4TeamList(rStruct);
  }

  DoCompilation$rStdNamingAdapt$C4TeamList(rStruct) {
    this.Begin();
    this.Value$rStdNamingAdapt$C4TeamList(rStruct);
    if (this.isDoublePass()) {
      this.BeginSecond();
      this.Value$rStdNamingAdapt$C4TeamList(rStruct);
    }
    this.End();
  }

  Value$StdNamingDefaultAdapt$StdParameterAdapt$C4Value$pC4ValueNumbers$C4Value(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$C4MusicSystem(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$C4Scoreboard(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$C4Weather(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$C4Landscape(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$C4Sky(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$StdParameterAdapt$C4Player$pC4ValueNumbers$2(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdParameter2Adapt$C4GameObjects$b$pC4ValueNumbers(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$StdParameter2Adapt$C4AulScriptEngine$b$pC4ValueNumbers(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdParameterAdapt$C4Value$pC4ValueNumbers$C4Value$2(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdParameterAdapt$C4Value$pC4ValueNumbers(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$rStdMeshInstance$SerializableValueProvider(rStruct) {
    CompileFunc$rStdMeshInstance$SerializableValueProvider$pStdCompiler(rStruct, this);
  }

  Value$rStdNamingAdapt$StdParameterAdapt$C4Player$pC4ValueNumbers$2(rStruct) {
    CompileFunc$rStdNamingAdapt$StdParameterAdapt$C4Player$pC4ValueNumbers$pStdCompiler$2(rStruct, this);
  }

  Value$rStdParameterAdapt$C4Value$pC4ValueNumbers(rStruct) {
    CompileFunc$rStdParameterAdapt$C4Value$pC4ValueNumbers$pStdCompiler(rStruct, this);
  }

  Value$rC4MusicSystem(rStruct) {
    CompileFunc$rC4MusicSystem$pStdCompiler(rStruct, this);
  }

  Value$rC4Scoreboard(rStruct) {
    CompileFunc$rC4Scoreboard$pStdCompiler(rStruct, this);
  }

  Value$rC4Weather(rStruct) {
    CompileFunc$rC4Weather$pStdCompiler(rStruct, this);
  }

  Value$rC4Landscape(rStruct) {
    CompileFunc$rC4Landscape$pStdCompiler(rStruct, this);
  }

  Value$rC4Sky(rStruct) {
    CompileFunc$rC4Sky$pStdCompiler(rStruct, this);
  }

  Value$rStdParameterAdapt$C4Player$pC4ValueNumbers$2(rStruct) {
    CompileFunc$rStdParameterAdapt$C4Player$pC4ValueNumbers$pStdCompiler$2(rStruct, this);
  }

  Value$rStdParameter2Adapt$C4AulScriptEngine$b$pC4ValueNumbers(rStruct) {
    CompileFunc$rStdParameter2Adapt$C4AulScriptEngine$b$pC4ValueNumbers$pStdCompiler(rStruct, this);
  }

  Value$rStdParameter2Adapt$C4Game$CompileSettings$pC4ValueNumbers$2(rStruct) {
    CompileFunc$rStdParameter2Adapt$C4Game$CompileSettings$pC4ValueNumbers$pStdCompiler$2(rStruct, this);
  }

  Value$rStdParameter2Adapt$C4Game$CompileSettings$pC4ValueNumbers(rStruct) {
    CompileFunc$rStdParameter2Adapt$C4Game$CompileSettings$pC4ValueNumbers$pStdCompiler(rStruct, this);
  }

  Value$rStdNamingAdapt$C4Network2Reference(rStruct) {
    CompileFunc$rStdNamingAdapt$C4Network2Reference$pStdCompiler(rStruct, this);
  }

  Value$rC4Network2Reference(rStruct) {
    CompileFunc$rC4Network2Reference$pStdCompiler(rStruct, this);
  }

  Compile$rStdParameter2Adapt$C4Game$CompileSettings$pC4ValueNumbers(rStruct) {
    0;
    this.DoCompilation$rStdParameter2Adapt$C4Game$CompileSettings$pC4ValueNumbers$2(rStruct);
  }

  Compile$rStdNamingAdapt$C4Network2Reference(rStruct) {
    0;
    this.DoCompilation$rStdNamingAdapt$C4Network2Reference(rStruct);
  }

  Decompile$StdParameter2Adapt$C4Game$CompileSettings$pC4ValueNumbers(rStruct) {
    0;
    this.DoCompilation$rStdParameter2Adapt$C4Game$CompileSettings$pC4ValueNumbers(rStruct);
  }

  DoCompilation$rStdParameter2Adapt$C4Game$CompileSettings$pC4ValueNumbers$2(rStruct) {
    this.Begin();
    this.Value$rStdParameter2Adapt$C4Game$CompileSettings$pC4ValueNumbers$2(rStruct);
    if (this.isDoublePass()) {
      this.BeginSecond();
      this.Value$rStdParameter2Adapt$C4Game$CompileSettings$pC4ValueNumbers$2(rStruct);
    }
    this.End();
  }

  DoCompilation$rStdParameter2Adapt$C4Game$CompileSettings$pC4ValueNumbers(rStruct) {
    this.Begin();
    this.Value$rStdParameter2Adapt$C4Game$CompileSettings$pC4ValueNumbers(rStruct);
    if (this.isDoublePass()) {
      this.BeginSecond();
      this.Value$rStdParameter2Adapt$C4Game$CompileSettings$pC4ValueNumbers(rStruct);
    }
    this.End();
  }

  DoCompilation$rStdNamingAdapt$C4Network2Reference(rStruct) {
    this.Begin();
    this.Value$rStdNamingAdapt$C4Network2Reference(rStruct);
    if (this.isDoublePass()) {
      this.BeginSecond();
      this.Value$rStdNamingAdapt$C4Network2Reference(rStruct);
    }
    this.End();
  }

  Value$rStdNamingAdapt$C4Def(rStruct) {
    CompileFunc$rStdNamingAdapt$C4Def$pStdCompiler(rStruct, this);
  }

  Value$rC4Def(rStruct) {
    CompileFunc$rC4Def$pStdCompiler(rStruct, this);
  }

  Value$rStdNamingAdapt$StdParameterAdapt$C4Object$pC4ValueNumbers(rStruct) {
    CompileFunc$rStdNamingAdapt$StdParameterAdapt$C4Object$pC4ValueNumbers$pStdCompiler(rStruct, this);
  }

  Value$rStdParameterAdapt$C4Object$pC4ValueNumbers(rStruct) {
    CompileFunc$rStdParameterAdapt$C4Object$pC4ValueNumbers$pStdCompiler(rStruct, this);
  }

  Value$rStdNamingAdapt$C4ObjectInfoCore(rStruct) {
    CompileFunc$rStdNamingAdapt$C4ObjectInfoCore$pStdCompiler(rStruct, this);
  }

  Value$rC4ObjectInfoCore(rStruct) {
    CompileFunc$rC4ObjectInfoCore$pStdCompiler(rStruct, this);
  }

  Value$rStdParameterAdapt$C4Scenario$b$2(rStruct) {
    CompileFunc$rStdParameterAdapt$C4Scenario$b$pStdCompiler$2(rStruct, this);
  }

  Value$rStdNamingAdapt$StdParameterAdapt$C4Player$pC4ValueNumbers(rStruct) {
    CompileFunc$rStdNamingAdapt$StdParameterAdapt$C4Player$pC4ValueNumbers$pStdCompiler(rStruct, this);
  }

  Value$rStdParameterAdapt$C4Player$pC4ValueNumbers(rStruct) {
    CompileFunc$rStdParameterAdapt$C4Player$pC4ValueNumbers$pStdCompiler(rStruct, this);
  }

  Value$rC4PlayerInfoCore(rStruct) {
    CompileFunc$rC4PlayerInfoCore$pStdCompiler(rStruct, this);
  }

  Value$rC4MaterialCore(rStruct) {
    CompileFunc$rC4MaterialCore$pStdCompiler(rStruct, this);
  }

  Decompile$StdNamingAdapt$C4Def(rStruct) {
    0;
    this.DoCompilation$rStdNamingAdapt$C4Def(rStruct);
  }

  Decompile$StdNamingAdapt$StdParameterAdapt$C4Object$pC4ValueNumbers(rStruct) {
    0;
    this.DoCompilation$rStdNamingAdapt$StdParameterAdapt$C4Object$pC4ValueNumbers(rStruct);
  }

  Decompile$StdNamingAdapt$C4ObjectInfoCore(rStruct) {
    0;
    this.DoCompilation$rStdNamingAdapt$C4ObjectInfoCore(rStruct);
  }

  Decompile$StdParameterAdapt$C4Scenario$b$2(rStruct) {
    0;
    this.DoCompilation$rStdParameterAdapt$C4Scenario$b$2(rStruct);
  }

  Decompile$StdNamingAdapt$StdParameterAdapt$C4Player$pC4ValueNumbers(rStruct) {
    0;
    this.DoCompilation$rStdNamingAdapt$StdParameterAdapt$C4Player$pC4ValueNumbers(rStruct);
  }

  Decompile$C4PlayerInfoCore(rStruct) {
    0;
    this.DoCompilation$rC4PlayerInfoCore(rStruct);
  }

  Decompile$C4MaterialCore(rStruct) {
    0;
    this.DoCompilation$rC4MaterialCore(rStruct);
  }

  DoCompilation$rStdNamingAdapt$C4Def(rStruct) {
    this.Begin();
    this.Value$rStdNamingAdapt$C4Def(rStruct);
    if (this.isDoublePass()) {
      this.BeginSecond();
      this.Value$rStdNamingAdapt$C4Def(rStruct);
    }
    this.End();
  }

  DoCompilation$rStdNamingAdapt$StdParameterAdapt$C4Object$pC4ValueNumbers(rStruct) {
    this.Begin();
    this.Value$rStdNamingAdapt$StdParameterAdapt$C4Object$pC4ValueNumbers(rStruct);
    if (this.isDoublePass()) {
      this.BeginSecond();
      this.Value$rStdNamingAdapt$StdParameterAdapt$C4Object$pC4ValueNumbers(rStruct);
    }
    this.End();
  }

  DoCompilation$rStdNamingAdapt$C4ObjectInfoCore(rStruct) {
    this.Begin();
    this.Value$rStdNamingAdapt$C4ObjectInfoCore(rStruct);
    if (this.isDoublePass()) {
      this.BeginSecond();
      this.Value$rStdNamingAdapt$C4ObjectInfoCore(rStruct);
    }
    this.End();
  }

  DoCompilation$rStdParameterAdapt$C4Scenario$b$2(rStruct) {
    this.Begin();
    this.Value$rStdParameterAdapt$C4Scenario$b$2(rStruct);
    if (this.isDoublePass()) {
      this.BeginSecond();
      this.Value$rStdParameterAdapt$C4Scenario$b$2(rStruct);
    }
    this.End();
  }

  DoCompilation$rStdNamingAdapt$StdParameterAdapt$C4Player$pC4ValueNumbers(rStruct) {
    this.Begin();
    this.Value$rStdNamingAdapt$StdParameterAdapt$C4Player$pC4ValueNumbers(rStruct);
    if (this.isDoublePass()) {
      this.BeginSecond();
      this.Value$rStdNamingAdapt$StdParameterAdapt$C4Player$pC4ValueNumbers(rStruct);
    }
    this.End();
  }

  DoCompilation$rC4PlayerInfoCore(rStruct) {
    this.Begin();
    this.Value$rC4PlayerInfoCore(rStruct);
    if (this.isDoublePass()) {
      this.BeginSecond();
      this.Value$rC4PlayerInfoCore(rStruct);
    }
    this.End();
  }

  DoCompilation$rC4MaterialCore(rStruct) {
    this.Begin();
    this.Value$rC4MaterialCore(rStruct);
    if (this.isDoublePass()) {
      this.BeginSecond();
      this.Value$rC4MaterialCore(rStruct);
    }
    this.End();
  }

  Value$StdNamingAdapt$C4FolderHead(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$rC4FolderHead(rStruct) {
    CompileFunc$rC4FolderHead$pStdCompiler(rStruct, this);
  }

  Value$rC4Folder(rStruct) {
    CompileFunc$rC4Folder$pStdCompiler(rStruct, this);
  }

  Compile$rC4Folder(rStruct) {
    0;
    this.DoCompilation$rC4Folder(rStruct);
  }

  DoCompilation$rC4Folder(rStruct) {
    this.Begin();
    this.Value$rC4Folder(rStruct);
    if (this.isDoublePass()) {
      this.BeginSecond();
      this.Value$rC4Folder(rStruct);
    }
    this.End();
  }

  Value$StdDecompileAdapt$StdStrBuf(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$StdSTLContainerAdapt$vector$C4KeyCodeEx$vector$C4KeyCodeEx(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdSTLContainerAdapt$vector$C4KeyCodeEx$vector$C4KeyCodeEx(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$rC4CustomKey(rStruct) {
    CompileFunc$rC4CustomKey$pStdCompiler(rStruct, this);
  }

  Value$rStdSTLContainerAdapt$vector$C4KeyCodeEx(rStruct) {
    CompileFunc$rStdSTLContainerAdapt$vector$C4KeyCodeEx$pStdCompiler(rStruct, this);
  }

  Value$rC4KeyCodeEx(rStruct) {
    CompileFunc$rC4KeyCodeEx$pStdCompiler(rStruct, this);
  }

  Value$rC4KeyboardInput(rStruct) {
    CompileFunc$rC4KeyboardInput$pStdCompiler(rStruct, this);
  }

  Compile$rC4KeyboardInput(rStruct) {
    0;
    this.DoCompilation$rC4KeyboardInput(rStruct);
  }

  DoCompilation$rC4KeyboardInput(rStruct) {
    this.Begin();
    this.Value$rC4KeyboardInput(rStruct);
    if (this.isDoublePass()) {
      this.BeginSecond();
      this.Value$rC4KeyboardInput(rStruct);
    }
    this.End();
  }

  Value$rC4ObjectPtr(rStruct) {
    CompileFunc$rC4ObjectPtr$pStdCompiler(rStruct, this);
  }

  Value$StdNamingAdapt$StdStrBuf(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$StdStrBuf$StdStrBuf(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$C4Rect$C4Rect(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$u8$i32(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$StdArrayAdapt$pScenario$StdPtrAdapt$Scenario(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$StdArrayAdapt$pAccessGfx$StdPtrAdapt$AccessGfx(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdStrBuf$StdStrBuf(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$C4Rect$C4Rect(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$u8$i32(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdPtrAdapt$Scenario(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDecompileAdapt$Scenario(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdPtrAdapt$AccessGfx(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDecompileAdapt$AccessGfx(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$rC4Rect(rStruct) {
    CompileFunc$rC4Rect$pStdCompiler(rStruct, this);
  }

  Value$rStdNamingAdapt$C4MapFolderData(rStruct) {
    CompileFunc$rStdNamingAdapt$C4MapFolderData$pStdCompiler(rStruct, this);
  }

  Value$rC4MapFolderData(rStruct) {
    CompileFunc$rC4MapFolderData$pStdCompiler(rStruct, this);
  }

  Value$rStdArrayAdapt$pScenario$StdPtrAdapt$Scenario(rStruct) {
    CompileFunc$rStdArrayAdapt$pScenario$StdPtrAdapt$Scenario$pStdCompiler(rStruct, this);
  }

  Value$rC4MapFolderData$Scenario(rStruct) {
    CompileFunc$rC4MapFolderData$Scenario$pStdCompiler(rStruct, this);
  }

  Value$rStdArrayAdapt$pAccessGfx$StdPtrAdapt$AccessGfx(rStruct) {
    CompileFunc$rStdArrayAdapt$pAccessGfx$StdPtrAdapt$AccessGfx$pStdCompiler(rStruct, this);
  }

  Value$rC4MapFolderData$AccessGfx(rStruct) {
    CompileFunc$rC4MapFolderData$AccessGfx$pStdCompiler(rStruct, this);
  }

  Compile$rStdNamingAdapt$C4MapFolderData(rStruct) {
    0;
    this.DoCompilation$rStdNamingAdapt$C4MapFolderData(rStruct);
  }

  Compile$rStdParameterAdapt$C4Scenario$b$2(rStruct) {
    0;
    this.DoCompilation$rStdParameterAdapt$C4Scenario$b$2(rStruct);
  }

  DoCompilation$rStdNamingAdapt$C4MapFolderData(rStruct) {
    this.Begin();
    this.Value$rStdNamingAdapt$C4MapFolderData(rStruct);
    if (this.isDoublePass()) {
      this.BeginSecond();
      this.Value$rStdNamingAdapt$C4MapFolderData(rStruct);
    }
    this.End();
  }

  Value$StdNamingDefaultAdapt$StdCastAdapt$C4Fixed$i32$C4Fixed(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$StdCastAdapt$i32$i32$i32(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdCastAdapt$C4Fixed$i32$C4Fixed(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdCastAdapt$C4Fixed$i32(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdCastAdapt$i32$i32$i32(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$rStdCastAdapt$C4Fixed$i32(rStruct) {
    CompileFunc$rStdCastAdapt$C4Fixed$i32$pStdCompiler(rStruct, this);
  }

  Value$rStdCastAdapt$i32$i32(rStruct) {
    CompileFunc$rStdCastAdapt$i32$i32$pStdCompiler(rStruct, this);
  }

  Value$StdNamingDefaultAdapt$StdParameterAdapt$StdStrBuf$i32$StdCopyStrBuf(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$StdEnumAdapt$i32$u8$i32$2(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$C4TargetRect$C4TargetRect(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$StdSTLContainerAdapt$vector$C4MaterialReaction$vector$C4MaterialReaction(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdParameterAdapt$StdStrBuf$i32$StdCopyStrBuf(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdEnumAdapt$i32$u8$i32$2(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdIntAdapt$i32$u8$6(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$C4TargetRect$C4TargetRect(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdSTLContainerAdapt$vector$C4MaterialReaction$vector$C4MaterialReaction(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$rStdEnumAdapt$i32$u8$3(rStruct) {
    CompileFunc$rStdEnumAdapt$i32$u8$pStdCompiler$2(rStruct, this);
  }

  Value$rC4TargetRect(rStruct) {
    CompileFunc$rC4TargetRect$pStdCompiler(rStruct, this);
  }

  Value$rStdSTLContainerAdapt$vector$C4MaterialReaction(rStruct) {
    CompileFunc$rStdSTLContainerAdapt$vector$C4MaterialReaction$pStdCompiler(rStruct, this);
  }

  Value$rC4MaterialReaction(rStruct) {
    CompileFunc$rC4MaterialReaction$pStdCompiler(rStruct, this);
  }

  Compile$rC4MaterialCore(rStruct) {
    0;
    this.DoCompilation$rC4MaterialCore(rStruct);
  }

  Value$StdNamingDefaultAdapt$StdParameterAdapt$StdStrBuf$i32$x(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$C4Rect(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdParameterAdapt$StdStrBuf$i32$x$2(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$rStdNamingAdapt$C4ParticleDefCore(rStruct) {
    CompileFunc$rStdNamingAdapt$C4ParticleDefCore$pStdCompiler(rStruct, this);
  }

  Value$rC4ParticleDefCore(rStruct) {
    CompileFunc$rC4ParticleDefCore$pStdCompiler(rStruct, this);
  }

  Compile$rStdNamingAdapt$C4ParticleDefCore(rStruct) {
    0;
    this.DoCompilation$rStdNamingAdapt$C4ParticleDefCore(rStruct);
  }

  DoCompilation$rStdNamingAdapt$C4ParticleDefCore(rStruct) {
    this.Begin();
    this.Value$rStdNamingAdapt$C4ParticleDefCore(rStruct);
    if (this.isDoublePass()) {
      this.BeginSecond();
      this.Value$rStdNamingAdapt$C4ParticleDefCore(rStruct);
    }
    this.End();
  }

  Value$StdNamingAdapt$StdParameterAdapt$C4SHead$b(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$C4SDefinitions(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$StdParameterAdapt$C4SGame$b(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$C4SPlrStart(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$C4SLandscape(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$C4SAnimals(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$C4SWeather(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$C4SEnvironment(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$StdStdStringAdapt$x(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$StdStdStringAdapt$x$2(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$C4StrValAdapt$StdParameterAdapt$StdCopyStrBuf$i32$StdCopyStrBuf(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$StdRuntimeValueAdapt$b$b(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$C4SVal$C4SVal(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$StdStdStringAdapt$x$3(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$C4NameList$C4NameList(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$StdStringAdapt$x$3(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdStdStringAdapt$x(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdStdStringAdapt$x$2(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$C4StrValAdapt$StdParameterAdapt$StdCopyStrBuf$i32$StdCopyStrBuf(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdRuntimeValueAdapt$b$b(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$C4SVal$C4SVal(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdStdStringAdapt$x$3(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$C4NameList$C4NameList(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdStringAdapt$x$4(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$rStdParameterAdapt$C4Scenario$b(rStruct) {
    CompileFunc$rStdParameterAdapt$C4Scenario$b$pStdCompiler(rStruct, this);
  }

  Value$rStdParameterAdapt$C4SHead$b(rStruct) {
    CompileFunc$rStdParameterAdapt$C4SHead$b$pStdCompiler(rStruct, this);
  }

  Value$rC4SDefinitions(rStruct) {
    CompileFunc$rC4SDefinitions$pStdCompiler(rStruct, this);
  }

  Value$rStdParameterAdapt$C4SGame$b(rStruct) {
    CompileFunc$rStdParameterAdapt$C4SGame$b$pStdCompiler(rStruct, this);
  }

  Value$rC4SPlrStart(rStruct) {
    CompileFunc$rC4SPlrStart$pStdCompiler(rStruct, this);
  }

  Value$rC4SLandscape(rStruct) {
    CompileFunc$rC4SLandscape$pStdCompiler(rStruct, this);
  }

  Value$rC4SAnimals(rStruct) {
    CompileFunc$rC4SAnimals$pStdCompiler(rStruct, this);
  }

  Value$rC4SWeather(rStruct) {
    CompileFunc$rC4SWeather$pStdCompiler(rStruct, this);
  }

  Value$rC4SEnvironment(rStruct) {
    CompileFunc$rC4SEnvironment$pStdCompiler(rStruct, this);
  }

  Value$rStdStdStringAdapt(rStruct) {
    CompileFunc$rStdStdStringAdapt$pStdCompiler(rStruct, this);
  }

  Value$rC4StrValAdapt$StdParameterAdapt$StdCopyStrBuf$i32(rStruct) {
    CompileFunc$rC4StrValAdapt$StdParameterAdapt$StdCopyStrBuf$i32$pStdCompiler(rStruct, this);
  }

  Value$rStdRuntimeValueAdapt$b(rStruct) {
    CompileFunc$rStdRuntimeValueAdapt$b$pStdCompiler(rStruct, this);
  }

  Value$rC4SVal(rStruct) {
    CompileFunc$rC4SVal$pStdCompiler(rStruct, this);
  }

  Value$rC4NameList(rStruct) {
    CompileFunc$rC4NameList$pStdCompiler(rStruct, this);
  }

  Compile$rStdParameterAdapt$C4Scenario$b(rStruct) {
    0;
    this.DoCompilation$rStdParameterAdapt$C4Scenario$b(rStruct);
  }

  Decompile$StdParameterAdapt$C4Scenario$b(rStruct) {
    0;
    this.DoCompilation$rStdParameterAdapt$C4Scenario$b(rStruct);
  }

  DoCompilation$rStdParameterAdapt$C4Scenario$b(rStruct) {
    this.Begin();
    this.Value$rStdParameterAdapt$C4Scenario$b(rStruct);
    if (this.isDoublePass()) {
      this.BeginSecond();
      this.Value$rStdParameterAdapt$C4Scenario$b(rStruct);
    }
    this.End();
  }

  Value$StdNamingDefaultAdapt$StdArrayAdapt$i32$_IdFuncClass$i32$x(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdArrayAdapt$i32$_IdFuncClass$i32$x(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$b(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$C4FoWBeam(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$rC4FoWBeam(rStruct) {
    CompileFunc$rC4FoWBeam$pStdCompiler(rStruct, this);
  }

  Value$StdDefaultAdapt$StdStringAdapt$x(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdIntPackAdapt$u32(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$rStdIntPackAdapt$u32(rStruct) {
    CompileFunc$rStdIntPackAdapt$u32$pStdCompiler(rStruct, this);
  }

  Value$StdContextPtrAdapt$SerializableValueProvider$IDBase(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$u32(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$StdEnumAdapt$i32$u8(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$StdParameterAdapt$StdCopyStrBuf$i32(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$StdParameterAdapt$StdDecompileAdapt$StdCopyStrBuf$i32(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$ValueProviderAdapt(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$TransformAdapt(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdParameterAdapt$StdPtrAdapt$StdMeshInstanceAnimationNode$pStdMesh(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$MatrixAdapt(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$StdBitfieldAdapt$u8$u32(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdParameterAdapt$Denumerator$pAttachedMesh(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$StdSubMeshInstance(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$StdParameterAdapt$AttachedMesh$x(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDecompileAdapt$SerializableValueProvider(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdIntAdapt$i32$u8$17(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdParameterAdapt$StdMeshInstanceAnimationNode$pStdMesh(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdParameterAdapt$StdDecompileAdapt$StdMeshInstanceAnimationNode$pStdMesh(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdBitfieldAdapt$u8$u32(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$rStdEnumAdapt$i32$u8$8(rStruct) {
    CompileFunc$rStdEnumAdapt$i32$u8$pStdCompiler$7(rStruct, this);
  }

  Value$rStdParameterAdapt$StdDecompileAdapt$StdCopyStrBuf$i32(rStruct) {
    CompileFunc$rStdParameterAdapt$StdDecompileAdapt$StdCopyStrBuf$i32$pStdCompiler(rStruct, this);
  }

  Value$rValueProviderAdapt(rStruct) {
    CompileFunc$rValueProviderAdapt$pStdCompiler(rStruct, this);
  }

  Value$rTransformAdapt(rStruct) {
    CompileFunc$rTransformAdapt$pStdCompiler(rStruct, this);
  }

  Value$rMatrixAdapt(rStruct) {
    CompileFunc$rMatrixAdapt$pStdCompiler(rStruct, this);
  }

  Value$rStdBitfieldAdapt$u8(rStruct) {
    CompileFunc$rStdBitfieldAdapt$u8$pStdCompiler(rStruct, this);
  }

  Value$rStdSubMeshInstance(rStruct) {
    CompileFunc$rStdSubMeshInstance$pStdCompiler(rStruct, this);
  }

  Value$rStdParameterAdapt$AttachedMesh$x(rStruct) {
    CompileFunc$rStdParameterAdapt$AttachedMesh$x$pStdCompiler(rStruct, this);
  }

  Value$StdNamingCountAdapt$u32(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$C4Client(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$rC4Client(rStruct) {
    CompileFunc$rC4Client$pStdCompiler(rStruct, this);
  }

  Value$StdNamingAdapt$C4Control(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$StdCopyBuf(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$StdIntAdapt$i32$u8$i32(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$C4PacketBase(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$StdIntPackAdapt$u32$u32(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$StdArrayAdapt$i32$StdIntPackAdapt$i32$i32(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$StdParameterAdapt$C4Network2Status$b(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$C4ScenarioParameterDefs(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$C4Network2ResChunkData(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$StdIntAdapt$i32$u8$i32$5(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdIntAdapt$i32$u8$i32(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdIntPackAdapt$u32$u32(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdArrayAdapt$i32$StdIntPackAdapt$i32$i32(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdIntAdapt$i32$u8$i32$5(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$rC4GameParameters(rStruct) {
    CompileFunc$rC4GameParameters$pStdCompiler(rStruct, this);
  }

  Value$rC4PacketConn(rStruct) {
    CompileFunc$rC4PacketConn$pStdCompiler(rStruct, this);
  }

  Value$rC4PacketConnRe(rStruct) {
    CompileFunc$rC4PacketConnRe$pStdCompiler(rStruct, this);
  }

  Value$rC4PacketPing(rStruct) {
    CompileFunc$rC4PacketPing$pStdCompiler(rStruct, this);
  }

  Value$rC4PacketFwd(rStruct) {
    CompileFunc$rC4PacketFwd$pStdCompiler(rStruct, this);
  }

  Value$rC4PacketPostMortem(rStruct) {
    CompileFunc$rC4PacketPostMortem$pStdCompiler(rStruct, this);
  }

  Value$rC4Network2Status(rStruct) {
    CompileFunc$rC4Network2Status$pStdCompiler(rStruct, this);
  }

  Value$rC4PacketActivateReq(rStruct) {
    CompileFunc$rC4PacketActivateReq$pStdCompiler(rStruct, this);
  }

  Value$rC4PacketJoinData(rStruct) {
    CompileFunc$rC4PacketJoinData$pStdCompiler(rStruct, this);
  }

  Value$rC4PacketPlayerInfoUpdRequest(rStruct) {
    CompileFunc$rC4PacketPlayerInfoUpdRequest$pStdCompiler(rStruct, this);
  }

  Value$rC4PacketLeagueRoundResults(rStruct) {
    CompileFunc$rC4PacketLeagueRoundResults$pStdCompiler(rStruct, this);
  }

  Value$rC4PacketCountdown(rStruct) {
    CompileFunc$rC4PacketCountdown$pStdCompiler(rStruct, this);
  }

  Value$rC4PacketSetScenarioParameter(rStruct) {
    CompileFunc$rC4PacketSetScenarioParameter$pStdCompiler(rStruct, this);
  }

  Value$rC4PacketAddr(rStruct) {
    CompileFunc$rC4PacketAddr$pStdCompiler(rStruct, this);
  }

  Value$rC4PacketTCPSimOpen(rStruct) {
    CompileFunc$rC4PacketTCPSimOpen$pStdCompiler(rStruct, this);
  }

  Value$rC4PacketResDiscover(rStruct) {
    CompileFunc$rC4PacketResDiscover$pStdCompiler(rStruct, this);
  }

  Value$rC4PacketResStatus(rStruct) {
    CompileFunc$rC4PacketResStatus$pStdCompiler(rStruct, this);
  }

  Value$rC4PacketResRequest(rStruct) {
    CompileFunc$rC4PacketResRequest$pStdCompiler(rStruct, this);
  }

  Value$rC4Network2ResChunk(rStruct) {
    CompileFunc$rC4Network2ResChunk$pStdCompiler(rStruct, this);
  }

  Value$rC4GameControlPacket(rStruct) {
    CompileFunc$rC4GameControlPacket$pStdCompiler(rStruct, this);
  }

  Value$rC4PacketControlReq(rStruct) {
    CompileFunc$rC4PacketControlReq$pStdCompiler(rStruct, this);
  }

  Value$rC4PacketControlPkt(rStruct) {
    CompileFunc$rC4PacketControlPkt$pStdCompiler(rStruct, this);
  }

  Value$rC4PacketExecSyncCtrl(rStruct) {
    CompileFunc$rC4PacketExecSyncCtrl$pStdCompiler(rStruct, this);
  }

  Value$rC4ControlClientJoin(rStruct) {
    CompileFunc$rC4ControlClientJoin$pStdCompiler(rStruct, this);
  }

  Value$rC4ControlClientUpdate(rStruct) {
    CompileFunc$rC4ControlClientUpdate$pStdCompiler(rStruct, this);
  }

  Value$rC4ControlClientRemove(rStruct) {
    CompileFunc$rC4ControlClientRemove$pStdCompiler(rStruct, this);
  }

  Value$rC4ControlVote(rStruct) {
    CompileFunc$rC4ControlVote$pStdCompiler(rStruct, this);
  }

  Value$rC4ControlVoteEnd(rStruct) {
    CompileFunc$rC4ControlVoteEnd$pStdCompiler(rStruct, this);
  }

  Value$rC4ControlSyncCheck(rStruct) {
    CompileFunc$rC4ControlSyncCheck$pStdCompiler(rStruct, this);
  }

  Value$rC4ControlSynchronize(rStruct) {
    CompileFunc$rC4ControlSynchronize$pStdCompiler(rStruct, this);
  }

  Value$rC4ControlSet(rStruct) {
    CompileFunc$rC4ControlSet$pStdCompiler(rStruct, this);
  }

  Value$rC4ControlScript(rStruct) {
    CompileFunc$rC4ControlScript$pStdCompiler(rStruct, this);
  }

  Value$rC4ControlMsgBoardReply(rStruct) {
    CompileFunc$rC4ControlMsgBoardReply$pStdCompiler(rStruct, this);
  }

  Value$rC4ControlMsgBoardCmd(rStruct) {
    CompileFunc$rC4ControlMsgBoardCmd$pStdCompiler(rStruct, this);
  }

  Value$rC4ControlPlayerInfo(rStruct) {
    CompileFunc$rC4ControlPlayerInfo$pStdCompiler(rStruct, this);
  }

  Value$rC4ControlJoinPlayer(rStruct) {
    CompileFunc$rC4ControlJoinPlayer$pStdCompiler(rStruct, this);
  }

  Value$rC4ControlRemovePlr(rStruct) {
    CompileFunc$rC4ControlRemovePlr$pStdCompiler(rStruct, this);
  }

  Value$rC4ControlPlayerSelect(rStruct) {
    CompileFunc$rC4ControlPlayerSelect$pStdCompiler(rStruct, this);
  }

  Value$rC4ControlPlayerControl(rStruct) {
    CompileFunc$rC4ControlPlayerControl$pStdCompiler(rStruct, this);
  }

  Value$rC4ControlPlayerAction(rStruct) {
    CompileFunc$rC4ControlPlayerAction$pStdCompiler(rStruct, this);
  }

  Value$rC4ControlPlayerMouse(rStruct) {
    CompileFunc$rC4ControlPlayerMouse$pStdCompiler(rStruct, this);
  }

  Value$rC4ControlMessage(rStruct) {
    CompileFunc$rC4ControlMessage$pStdCompiler(rStruct, this);
  }

  Value$rC4ControlMenuCommand(rStruct) {
    CompileFunc$rC4ControlMenuCommand$pStdCompiler(rStruct, this);
  }

  Value$rC4ControlEMMoveObject(rStruct) {
    CompileFunc$rC4ControlEMMoveObject$pStdCompiler(rStruct, this);
  }

  Value$rC4ControlEMDrawTool(rStruct) {
    CompileFunc$rC4ControlEMDrawTool$pStdCompiler(rStruct, this);
  }

  Value$rC4ControlReInitScenario(rStruct) {
    CompileFunc$rC4ControlReInitScenario$pStdCompiler(rStruct, this);
  }

  Value$rC4ControlEditGraph(rStruct) {
    CompileFunc$rC4ControlEditGraph$pStdCompiler(rStruct, this);
  }

  Value$rC4ControlDebugRec(rStruct) {
    CompileFunc$rC4ControlDebugRec$pStdCompiler(rStruct, this);
  }

  Value$rC4PacketBase(rStruct) {
    CompileFunc$rC4PacketBase$pStdCompiler(rStruct, this);
  }

  Value$rStdInsertAdapt$StdDecompileAdapt$C4PacketBase$u8(rStruct) {
    CompileFunc$rStdInsertAdapt$StdDecompileAdapt$C4PacketBase$u8$pStdCompiler(rStruct, this);
  }

  Value$rStdDecompileAdapt$C4PacketBase(rStruct) {
    CompileFunc$rStdDecompileAdapt$C4PacketBase$pStdCompiler(rStruct, this);
  }

  Value$rStdCopyBuf(rStruct) {
    CompileFunc$rStdCopyBuf$pStdCompiler(rStruct, this);
  }

  Value$rStdIntAdapt$i32$u8(rStruct) {
    CompileFunc$rStdIntAdapt$i32$u8$pStdCompiler(rStruct, this);
  }

  Value$rStdArrayAdapt$i32$StdIntPackAdapt$i32(rStruct) {
    CompileFunc$rStdArrayAdapt$i32$StdIntPackAdapt$i32$pStdCompiler(rStruct, this);
  }

  Value$rStdParameterAdapt$C4Network2Status$b(rStruct) {
    CompileFunc$rStdParameterAdapt$C4Network2Status$b$pStdCompiler(rStruct, this);
  }

  Value$rC4ScenarioParameterDefs(rStruct) {
    CompileFunc$rC4ScenarioParameterDefs$pStdCompiler(rStruct, this);
  }

  Value$rC4Network2ResChunkData(rStruct) {
    CompileFunc$rC4Network2ResChunkData$pStdCompiler(rStruct, this);
  }

  Value$rStdIntAdapt$i32$u8$8(rStruct) {
    CompileFunc$rStdIntAdapt$i32$u8$pStdCompiler$5(rStruct, this);
  }

  Compile$rC4PacketBase(rStruct) {
    0;
    this.DoCompilation$rC4PacketBase(rStruct);
  }

  Decompile$C4PacketBase(rStruct) {
    0;
    this.DoCompilation$rC4PacketBase(rStruct);
  }

  Decompile$StdInsertAdapt$StdDecompileAdapt$C4PacketBase$u8(rStruct) {
    0;
    this.DoCompilation$rStdInsertAdapt$StdDecompileAdapt$C4PacketBase$u8(rStruct);
  }

  DoCompilation$rC4PacketBase(rStruct) {
    this.Begin();
    this.Value$rC4PacketBase(rStruct);
    if (this.isDoublePass()) {
      this.BeginSecond();
      this.Value$rC4PacketBase(rStruct);
    }
    this.End();
  }

  DoCompilation$rStdInsertAdapt$StdDecompileAdapt$C4PacketBase$u8(rStruct) {
    this.Begin();
    this.Value$rStdInsertAdapt$StdDecompileAdapt$C4PacketBase$u8(rStruct);
    if (this.isDoublePass()) {
      this.BeginSecond();
      this.Value$rStdInsertAdapt$StdDecompileAdapt$C4PacketBase$u8(rStruct);
    }
    this.End();
  }

  Value$StdEnumAdapt$i32$u8$9(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdIntAdapt$i32$u8$18(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$StdParameterAdapt$C4IDList$b$C4IDList(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$StdBitfieldAdapt$i32$i32$2(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdParameterAdapt$C4Shape$pC4Shape(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdParameterAdapt$C4IDList$b$C4IDList(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdBitfieldAdapt$i32$i32$3(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$rStdParameterAdapt$C4IDList$b(rStruct) {
    CompileFunc$rStdParameterAdapt$C4IDList$b$pStdCompiler(rStruct, this);
  }

  Compile$rStdNamingAdapt$C4Def(rStruct) {
    0;
    this.DoCompilation$rStdNamingAdapt$C4Def(rStruct);
  }

  Value$StdDefaultAdapt$StdParameterAdapt$StdStrBuf$i32$x(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$C4DefGraphicsAdapt$pC4DefGraphics(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdIntAdapt$i32$i32$3(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdIntAdapt$u32$i32(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$rC4DrawTransform(rStruct) {
    CompileFunc$rC4DrawTransform$pStdCompiler(rStruct, this);
  }

  Value$rC4GraphicsOverlay(rStruct) {
    CompileFunc$rC4GraphicsOverlay$pStdCompiler(rStruct, this);
  }

  Value$rC4DefGraphicsAdapt(rStruct) {
    CompileFunc$rC4DefGraphicsAdapt$pStdCompiler(rStruct, this);
  }

  Value$StdNamingDefaultAdapt$StdStringAdapt$pi8(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$StdParameterAdapt$C4ValueMapData$pC4ValueNumbers$C4ValueMapData(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$C4ValueNumbers(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$C4RoundResult(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$StdStringAdapt$x$12(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$StdStrBuf$x$4(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdStringAdapt$pi8(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdParameterAdapt$C4ValueMapData$pC4ValueNumbers$C4ValueMapData(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdStringAdapt$x$13(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdStrBuf$x$4(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$rStdNamingAdapt$C4ValueNumbers(rStruct) {
    CompileFunc$rStdNamingAdapt$C4ValueNumbers$pStdCompiler(rStruct, this);
  }

  Value$rStdParameterAdapt$C4ValueMapData$pC4ValueNumbers(rStruct) {
    CompileFunc$rStdParameterAdapt$C4ValueMapData$pC4ValueNumbers$pStdCompiler(rStruct, this);
  }

  Value$rC4ValueNumbers(rStruct) {
    CompileFunc$rC4ValueNumbers$pStdCompiler(rStruct, this);
  }

  Value$rC4RoundResult(rStruct) {
    CompileFunc$rC4RoundResult$pStdCompiler(rStruct, this);
  }

  Compile$rC4PlayerInfoCore(rStruct) {
    0;
    this.DoCompilation$rC4PlayerInfoCore(rStruct);
  }

  Compile$rStdNamingAdapt$C4ObjectInfoCore(rStruct) {
    0;
    this.DoCompilation$rStdNamingAdapt$C4ObjectInfoCore(rStruct);
  }

  Value$StdEnumAdapt$i32$u8$2(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdIntAdapt$i32$u8$4(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$C4DefGraphicsAdapt(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdParameterAdapt$StdContextPtrAdapt$StdMeshInstance$StdMesh$x(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$C4ObjectPtr(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdParameterAdapt$StdMeshInstance$x(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdParameterAdapt$StdDecompileAdapt$StdMeshInstance$x(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$rStdParameterAdapt$StdMeshInstance$x(rStruct) {
    CompileFunc$rStdParameterAdapt$StdMeshInstance$x$pStdCompiler(rStruct, this);
  }

  Value$StdNamingAdapt$StdParameterAdapt$C4PropListNumbered$pC4ValueNumbers(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$C4Fixed$C4Fixed(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$C4ObjectPtr$C4ObjectPtr(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$StdParameterAdapt$C4NotifyingObjectList$pC4ValueNumbers(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$C4DefGraphicsAdapt$pC4DefGraphics(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdPtrAdapt$C4DrawTransform(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdParameter2Adapt$StdPtrAdapt$C4Effect$pC4Object$pC4ValueNumbers(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$C4GraphicsOverlayListAdapt$pC4GraphicsOverlay(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$StdParameterAdapt$StdMeshInstance$x(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdParameterAdapt$StdPtrAdapt$C4Command$pC4ValueNumbers(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$StdParameterAdapt$C4Command$pC4ValueNumbers(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$C4Fixed$C4Fixed(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$C4ObjectPtr$C4ObjectPtr(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$C4DefGraphicsAdapt$pC4DefGraphics$2(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDecompileAdapt$C4DrawTransform(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdParameter2Adapt$C4Effect$pC4Object$pC4ValueNumbers(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdParameter2Adapt$StdDecompileAdapt$C4Effect$pC4Object$pC4ValueNumbers(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$C4GraphicsOverlayListAdapt$pC4GraphicsOverlay(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdParameterAdapt$C4Command$pC4ValueNumbers(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdParameterAdapt$StdDecompileAdapt$C4Command$pC4ValueNumbers(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$rC4Action(rStruct) {
    CompileFunc$rC4Action$pStdCompiler(rStruct, this);
  }

  Value$rStdNamingAdapt$StdInsertAdapt$StdParameterAdapt$C4Object$pC4ValueNumbers$StdNamingAdapt$C4ValueNumbers(rStruct) {
    CompileFunc$rStdNamingAdapt$StdInsertAdapt$StdParameterAdapt$C4Object$pC4ValueNumbers$StdNamingAdapt$C4ValueNumbers$pStdCompiler(rStruct, this);
  }

  Value$rStdInsertAdapt$StdParameterAdapt$C4Object$pC4ValueNumbers$StdNamingAdapt$C4ValueNumbers(rStruct) {
    CompileFunc$rStdInsertAdapt$StdParameterAdapt$C4Object$pC4ValueNumbers$StdNamingAdapt$C4ValueNumbers$pStdCompiler(rStruct, this);
  }

  Value$rStdParameterAdapt$C4PropListNumbered$pC4ValueNumbers(rStruct) {
    CompileFunc$rStdParameterAdapt$C4PropListNumbered$pC4ValueNumbers$pStdCompiler(rStruct, this);
  }

  Value$rStdParameterAdapt$C4NotifyingObjectList$pC4ValueNumbers(rStruct) {
    CompileFunc$rStdParameterAdapt$C4NotifyingObjectList$pC4ValueNumbers$pStdCompiler(rStruct, this);
  }

  Value$rC4GraphicsOverlayListAdapt(rStruct) {
    CompileFunc$rC4GraphicsOverlayListAdapt$pStdCompiler(rStruct, this);
  }

  Value$rStdParameterAdapt$C4Command$pC4ValueNumbers(rStruct) {
    CompileFunc$rStdParameterAdapt$C4Command$pC4ValueNumbers$pStdCompiler(rStruct, this);
  }

  Decompile$StdNamingAdapt$StdInsertAdapt$StdParameterAdapt$C4Object$pC4ValueNumbers$StdNamingAdapt$C4ValueNumbers(rStruct) {
    0;
    this.DoCompilation$rStdNamingAdapt$StdInsertAdapt$StdParameterAdapt$C4Object$pC4ValueNumbers$StdNamingAdapt$C4ValueNumbers(rStruct);
  }

  DoCompilation$rStdNamingAdapt$StdInsertAdapt$StdParameterAdapt$C4Object$pC4ValueNumbers$StdNamingAdapt$C4ValueNumbers(rStruct) {
    this.Begin();
    this.Value$rStdNamingAdapt$StdInsertAdapt$StdParameterAdapt$C4Object$pC4ValueNumbers$StdNamingAdapt$C4ValueNumbers(rStruct);
    if (this.isDoublePass()) {
      this.BeginSecond();
      this.Value$rStdNamingAdapt$StdInsertAdapt$StdParameterAdapt$C4Object$pC4ValueNumbers$StdNamingAdapt$C4ValueNumbers(rStruct);
    }
    this.End();
  }

  Value$StdNamingAdapt$StdParameterAdapt$C4Object$pC4ValueNumbers$2(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$StdParameterAdapt$StdPtrAdapt$C4Object$pC4ValueNumbers(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdSTLContainerAdapt$list$i32(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$StdParameterAdapt$C4ObjectList$pC4ValueNumbers(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdParameterAdapt$C4Object$pC4ValueNumbers$2(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdParameterAdapt$StdDecompileAdapt$C4Object$pC4ValueNumbers(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$rStdParameterAdapt$C4Object$pC4ValueNumbers$2(rStruct) {
    CompileFunc$rStdParameterAdapt$C4Object$pC4ValueNumbers$pStdCompiler$2(rStruct, this);
  }

  Value$rStdParameterAdapt$StdPtrAdapt$C4Object$pC4ValueNumbers(rStruct) {
    CompileFunc$rStdParameterAdapt$StdPtrAdapt$C4Object$pC4ValueNumbers$pStdCompiler(rStruct, this);
  }

  Value$rStdParameterAdapt$C4ObjectList$pC4ValueNumbers(rStruct) {
    CompileFunc$rStdParameterAdapt$C4ObjectList$pC4ValueNumbers$pStdCompiler(rStruct, this);
  }

  Value$rStdNamingAdapt$C4ObjectListDumpHelper(rStruct) {
    CompileFunc$rStdNamingAdapt$C4ObjectListDumpHelper$pStdCompiler(rStruct, this);
  }

  Value$rC4ObjectListDumpHelper(rStruct) {
    CompileFunc$rC4ObjectListDumpHelper$pStdCompiler(rStruct, this);
  }

  Decompile$StdNamingAdapt$C4ObjectListDumpHelper(rStruct) {
    0;
    this.DoCompilation$rStdNamingAdapt$C4ObjectListDumpHelper(rStruct);
  }

  DoCompilation$rStdNamingAdapt$C4ObjectListDumpHelper(rStruct) {
    this.Begin();
    this.Value$rStdNamingAdapt$C4ObjectListDumpHelper(rStruct);
    if (this.isDoublePass()) {
      this.BeginSecond();
      this.Value$rStdNamingAdapt$C4ObjectListDumpHelper(rStruct);
    }
    this.End();
  }

  Value$StdNamingAdapt$StdIntAdapt$i32$i32$2(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdParameterAdapt$C4LSector$pC4ValueNumbers(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$rStdNamingAdapt$StdArrayAdapt$C4LSector$StdParameterAdaptMaker$pC4ValueNumbers(rStruct) {
    CompileFunc$rStdNamingAdapt$StdArrayAdapt$C4LSector$StdParameterAdaptMaker$pC4ValueNumbers$pStdCompiler(rStruct, this);
  }

  Value$rStdArrayAdapt$C4LSector$StdParameterAdaptMaker$pC4ValueNumbers(rStruct) {
    CompileFunc$rStdArrayAdapt$C4LSector$StdParameterAdaptMaker$pC4ValueNumbers$pStdCompiler(rStruct, this);
  }

  Decompile$StdNamingAdapt$StdArrayAdapt$C4LSector$StdParameterAdaptMaker$pC4ValueNumbers(rStruct) {
    0;
    this.DoCompilation$rStdNamingAdapt$StdArrayAdapt$C4LSector$StdParameterAdaptMaker$pC4ValueNumbers(rStruct);
  }

  DoCompilation$rStdNamingAdapt$StdArrayAdapt$C4LSector$StdParameterAdaptMaker$pC4ValueNumbers(rStruct) {
    this.Begin();
    this.Value$rStdNamingAdapt$StdArrayAdapt$C4LSector$StdParameterAdaptMaker$pC4ValueNumbers(rStruct);
    if (this.isDoublePass()) {
      this.BeginSecond();
      this.Value$rStdNamingAdapt$StdArrayAdapt$C4LSector$StdParameterAdaptMaker$pC4ValueNumbers(rStruct);
    }
    this.End();
  }

  Value$StdNamingDefaultAdapt$StdArrayDefaultArrayAdapt$i32$pi32$_IdFuncClass$i32$pi32(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$StdArrayDefaultArrayAdapt$i32$x$_IdFuncClass$i32$x(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$StdArrayDefaultArrayAdapt$i32$x$lambda$x(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdArrayDefaultArrayAdapt$i32$pi32$_IdFuncClass$i32$pi32(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdArrayDefaultArrayAdapt$i32$x$_IdFuncClass$i32$x(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdArrayDefaultArrayAdapt$i32$x$lambda$x(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdBitfieldAdapt$i32$i32(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$rStdArrayDefaultArrayAdapt$i32$pi32$_IdFuncClass$i32(rStruct) {
    CompileFunc$rStdArrayDefaultArrayAdapt$i32$pi32$_IdFuncClass$i32$pStdCompiler(rStruct, this);
  }

  Value$rStdArrayDefaultArrayAdapt$i32$x$_IdFuncClass$i32(rStruct) {
    CompileFunc$rStdArrayDefaultArrayAdapt$i32$x$_IdFuncClass$i32$pStdCompiler(rStruct, this);
  }

  Value$rStdArrayDefaultArrayAdapt$i32$x$lambda(rStruct) {
    CompileFunc$rStdArrayDefaultArrayAdapt$i32$x$lambda$pStdCompiler(rStruct, this);
  }

  Value$StdNamingAdapt$HostilitySet(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$C4IDList(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdPtrAdapt$C4MessageBoardQuery(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDecompileAdapt$C4MessageBoardQuery(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$rC4PlayerControl(rStruct) {
    CompileFunc$rC4PlayerControl$pStdCompiler(rStruct, this);
  }

  Value$rC4Player$HostilitySet(rStruct) {
    CompileFunc$rC4Player$HostilitySet$pStdCompiler(rStruct, this);
  }

  Value$rC4MessageBoardQuery(rStruct) {
    CompileFunc$rC4MessageBoardQuery$pStdCompiler(rStruct, this);
  }

  Compile$rStdNamingAdapt$StdParameterAdapt$C4Player$pC4ValueNumbers(rStruct) {
    0;
    this.DoCompilation$rStdNamingAdapt$StdParameterAdapt$C4Player$pC4ValueNumbers$2(rStruct);
  }

  DoCompilation$rStdNamingAdapt$StdParameterAdapt$C4Player$pC4ValueNumbers$2(rStruct) {
    this.Begin();
    this.Value$rStdNamingAdapt$StdParameterAdapt$C4Player$pC4ValueNumbers$2(rStruct);
    if (this.isDoublePass()) {
      this.BeginSecond();
      this.Value$rStdNamingAdapt$StdParameterAdapt$C4Player$pC4ValueNumbers$2(rStruct);
    }
    this.End();
  }

  Value$StdNamingDefaultAdapt$StdEnumAdapt$i32$u8$i32$6(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingAdapt$StdSTLContainerAdapt$vector$Option(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdSTLContainerAdapt$vector$C4ScenarioParameterDef(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdEnumAdapt$i32$u8$i32$6(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdIntAdapt$i32$u8$16(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$rStdEnumAdapt$i32$u8$7(rStruct) {
    CompileFunc$rStdEnumAdapt$i32$u8$pStdCompiler$6(rStruct, this);
  }

  Value$rStdSTLContainerAdapt$vector$Option(rStruct) {
    CompileFunc$rStdSTLContainerAdapt$vector$Option$pStdCompiler(rStruct, this);
  }

  Value$rC4ScenarioParameterDef$Option(rStruct) {
    CompileFunc$rC4ScenarioParameterDef$Option$pStdCompiler(rStruct, this);
  }

  Value$rC4ScenarioParameterDef(rStruct) {
    CompileFunc$rC4ScenarioParameterDef$pStdCompiler(rStruct, this);
  }

  Compile$rC4ScenarioParameterDefs(rStruct) {
    0;
    this.DoCompilation$rC4ScenarioParameterDefs(rStruct);
  }

  DoCompilation$rC4ScenarioParameterDefs(rStruct) {
    this.Begin();
    this.Value$rC4ScenarioParameterDefs(rStruct);
    if (this.isDoublePass()) {
      this.BeginSecond();
      this.Value$rC4ScenarioParameterDefs(rStruct);
    }
    this.End();
  }

  Value$StdParameter2Adapt$StdPtrAdapt$C4Effect$pC4PropList$pC4ValueNumbers$2(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdNamingDefaultAdapt$StdParameterAdapt$C4ValueMapData$pC4ValueNumbers$C4ValueMapData$2(rStruct) {
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

  Value$StdParameter2Adapt$C4Effect$pC4PropList$pC4ValueNumbers$2(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdParameter2Adapt$StdDecompileAdapt$C4Effect$pC4PropList$pC4ValueNumbers$2(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdDefaultAdapt$StdParameterAdapt$C4ValueMapData$pC4ValueNumbers$C4ValueMapData$2(rStruct) {
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

  Value$rStdParameterAdapt$C4ValueMapData$pC4ValueNumbers$2(rStruct) {
    CompileFunc$rStdParameterAdapt$C4ValueMapData$pC4ValueNumbers$pStdCompiler$2(rStruct, this);
  }

  Value$rStdParameterAdapt$C4PropList$pC4ValueNumbers$2(rStruct) {
    CompileFunc$rStdParameterAdapt$C4PropList$pC4ValueNumbers$pStdCompiler(rStruct, this);
  }

  Value$StdParameterAdapt$StdStrBuf$i32(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdParameterAdapt$C4Set$C4Property$pC4ValueNumbers(rStruct) {
    rStruct.CompileFunc(this);
  }

  Value$StdParameterAdapt$C4Property$pC4ValueNumbers(rStruct) {
    rStruct.CompileFunc(this);
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

  None() {
    this.Buf = new $.StdBuf();
    return this;
  }

  WriteValue$i32(rValue) {
    if (this.fSecondPass) {
      $wr($.getMBufPtr$6(this.Buf, $u64n(this.iPos)), 0, rValue);
    }
    this.iPos = $u64n(this.iPos) + 4 | 0;
  }

  WriteValue$u32(rValue) {
    if (this.fSecondPass) {
      $wr($.getMBufPtr$7(this.Buf, $u64n(this.iPos)), 0, rValue);
    }
    this.iPos = $u64n(this.iPos) + 4 | 0;
  }

  WriteValue$i16(rValue) {
    if (this.fSecondPass) {
      $wr($.getMBufPtr$8(this.Buf, $u64n(this.iPos)), 0, rValue);
    }
    this.iPos = $u64n(this.iPos) + 2 | 0;
  }

  WriteValue$u16(rValue) {
    if (this.fSecondPass) {
      $wr($.getMBufPtr$9(this.Buf, $u64n(this.iPos)), 0, rValue);
    }
    this.iPos = $u64n(this.iPos) + 2 | 0;
  }

  WriteValue$i8(rValue) {
    if (this.fSecondPass) {
      $wr($.getMBufPtr$2(this.Buf, $u64n(this.iPos)), 0, rValue);
    }
    this.iPos = $u64n(this.iPos) + 1 | 0;
  }

  WriteValue$u8(rValue) {
    if (this.fSecondPass) {
      $wr($.getMBufPtr$5(this.Buf, $u64n(this.iPos)), 0, rValue);
    }
    this.iPos = $u64n(this.iPos) + 1 | 0;
  }

  WriteValue$b(rValue) {
    if (this.fSecondPass) {
      $wr($.getMBufPtr$3(this.Buf, $u64n(this.iPos)), 0, rValue);
    }
    this.iPos = $u64n(this.iPos) + 1 | 0;
  }

  WriteValue$i8$2(rValue) {
    if (this.fSecondPass) {
      $wr($.getMBufPtr$4(this.Buf, $u64n(this.iPos)), 0, rValue);
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
    while ($wr(($t1 = pPos, pPos = pPos.add(1), $t1), 0, $rd($.getBufPtr$4(this.Buf, ($t2 = this.iPos, this.iPos = this.iPos + 1, $t2)))) !== 0) {
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
    while ($rd($.getBufPtr$4(this.Buf, ($t1 = this.iPos, this.iPos = this.iPos + 1, $t1))) !== 0) {
      if (this.iPos >= $.StdBuf.prototype.getSize.call(this.Buf)) {
        this.excEOF();
        return;
      }
    }
    pszString.a[pszString.o] = $reinterpVoid(c$malloc(this.iPos - $u64n(iStart)), "i8");
    c$memcpy(pszString.a[pszString.o], $.StdBuf.prototype.getPtr.call(this.Buf, $u64n(iStart)), this.iPos - $u64n(iStart));
  }

  String$rstring$i32(str, _type = 0 /*RCT_Escaped*/) {
    let $t1;
    if (this.iPos >= $.StdBuf.prototype.getSize.call(this.Buf)) {
      this.excEOF();
      return;
    }
    let iStart = this.iPos | 0;
    while ($rd($.getBufPtr$4(this.Buf, ($t1 = this.iPos, this.iPos = this.iPos + 1, $t1))) !== 0) {
      if (this.iPos >= $.StdBuf.prototype.getSize.call(this.Buf)) {
        this.excEOF();
        return;
      }
    }
    str.assign($.getBufPtr$4(this.Buf, $u64n(iStart)), $.getBufPtr$4(this.Buf, this.iPos));
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

  None() {
    this.Buf = new $.StdBuf();
    return this;
  }

  ReadValue$ri32(rValue) {
    if (this.iPos + 4 > $.StdBuf.prototype.getSize.call(this.Buf)) {
      this.excEOF();
      return;
    }
    rValue.a[rValue.o] = $rd($.getBufPtr$6(this.Buf, this.iPos));
    this.iPos = this.iPos + 4;
  }

  ReadValue$ru32(rValue) {
    if (this.iPos + 4 > $.StdBuf.prototype.getSize.call(this.Buf)) {
      this.excEOF();
      return;
    }
    rValue.a[rValue.o] = $rd($.getBufPtr$7(this.Buf, this.iPos));
    this.iPos = this.iPos + 4;
  }

  ReadValue$ri16(rValue) {
    if (this.iPos + 2 > $.StdBuf.prototype.getSize.call(this.Buf)) {
      this.excEOF();
      return;
    }
    rValue.a[rValue.o] = $rd($.getBufPtr$8(this.Buf, this.iPos));
    this.iPos = this.iPos + 2;
  }

  ReadValue$ru16(rValue) {
    if (this.iPos + 2 > $.StdBuf.prototype.getSize.call(this.Buf)) {
      this.excEOF();
      return;
    }
    rValue.a[rValue.o] = $rd($.getBufPtr$9(this.Buf, this.iPos));
    this.iPos = this.iPos + 2;
  }

  ReadValue$ri8(rValue) {
    if (this.iPos + 1 > $.StdBuf.prototype.getSize.call(this.Buf)) {
      this.excEOF();
      return;
    }
    rValue.a[rValue.o] = $rd($.getBufPtr$2(this.Buf, this.iPos));
    this.iPos = this.iPos + 1;
  }

  ReadValue$ru8(rValue) {
    if (this.iPos + 1 > $.StdBuf.prototype.getSize.call(this.Buf)) {
      this.excEOF();
      return;
    }
    rValue.a[rValue.o] = $rd($.getBufPtr$5(this.Buf, this.iPos));
    this.iPos = this.iPos + 1;
  }

  ReadValue$rb(rValue) {
    if (this.iPos + 1 > $.StdBuf.prototype.getSize.call(this.Buf)) {
      this.excEOF();
      return;
    }
    rValue.a[rValue.o] = $rd($.getBufPtr$3(this.Buf, this.iPos));
    this.iPos = this.iPos + 1;
  }

  ReadValue$ri8$2(rValue) {
    if (this.iPos + 1 > $.StdBuf.prototype.getSize.call(this.Buf)) {
      this.excEOF();
      return;
    }
    rValue.a[rValue.o] = $rd($.getBufPtr$4(this.Buf, this.iPos));
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

  Separator(eSep = 1 /*SEP_SEP*/) {
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
        this.WriteEscaped($reinterpVoid(pData, "i8"), $padd($reinterpVoid(pData, "i8"), iSize));
        break;
      case 1:
      case 2:
      case 3:
      case 4:
        this.Buf.Append$pi8$u64($reinterpVoid(pData, "i8"), iSize);
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

  None() {
    this.Buf = new $.StdStrBuf();
    return this;
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
    StdCompilerINIRead.prototype.FreeNameTree.call(this);
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
      (($v) => this.pName.PrevChild != null ? (this.pName.PrevChild.NextChild = $v) : (pParent.FirstChild = $v))(this.pName.NextChild);
      (($v) => this.pName.NextChild != null ? (this.pName.NextChild.PrevChild = $v) : (pParent.LastChild = $v))(this.pName.PrevChild);
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

  Separator(eSep = 1 /*SEP_SEP*/) {
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
    if (iNum < -32768 || iNum > 32767) {
      this.Warn(S("number out of range (%d to %d): %d "), -32768, 32767, iNum);
    }
    rShort.a[rShort.o] = $.Clamp$i32$i32$i32(iNum, -32768, 32767) << 16 >> 16;
  }

  Word$ru16(rShort) {
    let MIN = 0;
    let MAX = 65535;
    let iNum = this.ReadUNum() >>> 0;
    if (iNum > 65535) {
      this.Warn(S("number out of range (%u to %u): %u "), 0, 65535, iNum);
    }
    rShort.a[rShort.o] = $.Clamp$u32$u32$u32(iNum, 0, 65535) & 0xffff;
  }

  Byte$ri8(rByte) {
    let MIN = -128;
    let MAX = 127;
    let iNum = this.ReadNum() | 0;
    if (iNum < -128 || iNum > 127) {
      this.Warn(S("number out of range (%d to %d): %d "), -128, 127, iNum);
    }
    rByte.a[rByte.o] = $.Clamp$i32$i32$i32(iNum, -128, 127) << 24 >> 24;
  }

  Byte$ru8(rByte) {
    let MIN = 0;
    let MAX = 255;
    let iNum = this.ReadUNum() >>> 0;
    if (iNum > 255) {
      this.Warn(S("number out of range (%u to %u): %u "), 0, 255, iNum);
    }
    rByte.a[rByte.o] = $.Clamp$u32$u32$u32(iNum, 0, 255) & 0xff;
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
    $.SCopy$pi8$pi8$u64($.getBufPtr$4(Buf), szString, iMaxLength);
  }

  String$ppi8$i32(pszString, eType = 0 /*RCT_Escaped*/) {
    let iLength = this.GetStringLength(eType);
    let Buf = this.ReadString(iLength, eType, true);
    pszString.a[pszString.o] = $reinterpVoid($.StdBuf.prototype.GrabPointer.call(Buf), "i8");
  }

  String$rstring$i32(str, type = 0 /*RCT_Escaped*/) {
    let iLength = this.GetStringLength(type);
    let Buf = this.ReadString(iLength, type, true);
    str.assign($.getBufPtr$4(Buf));
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
          this.pName = this.pName.LastChild = (($v) => this.pName.LastChild != null ? (this.pName.LastChild.NextChild = $v) : (this.pName.FirstChild = $v))(new StdCompilerINIRead$NameNode().init(this.pName));
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
    let pOut = $.getMBufPtr$4(OutBuf);
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
      return std_distance($begin(this.lineBreaks), $itcopy(entry)) + 1 >>> 0;
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

export function CompileNewFunc$rpC4IDPacket$pStdCompiler$2(..._) { return $missing("CompileNewFunc"); }

export function CompileNewFunc$rpC4PktDebugRec$pStdCompiler$2(..._) { return $missing("CompileNewFunc"); }

export function CompileNewFunc$rpC4ClientPlayerInfos$pStdCompiler$2(..._) { return $missing("CompileNewFunc"); }

export function CompileNewFunc$rpStdBuf$pStdCompiler$2(..._) { return $missing("CompileNewFunc"); }

export function CompileNewFunc$rpC4Effect$pStdCompiler$mpC4Object$rpC4ValueNumbers(pStruct, pComp, pars, pars$2) {
  let $t1;
  let temp = new $.C4Effect().init$v();
  pComp.Value$StdParameter2Adapt$C4Effect$pC4Object$pC4ValueNumbers($.mkParAdapt$rC4Effect$mpC4Object$rpC4ValueNumbers(temp, pars, $tmp(pars$2.a[pars$2.o])));
  pStruct.a[pStruct.o] = ($t1 = temp, temp = null, $t1);
}

export function CompileNewFunc$rpC4GameRes$pStdCompiler$2(..._) { return $missing("CompileNewFunc"); }

export function CompileNewFunc$rpAccessGfx$pStdCompiler$2(..._) { return $missing("CompileNewFunc"); }

export function CompileFunc$rC4IDPacket$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc$pStdCompiler(pComp);
}

export function CompileFunc$rC4NameList$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4SAnimals$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4SWeather$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4TeamList$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdCopyBuf$pStdCompiler(rStruct, pComp) {
  $.StdBuf.prototype.CompileFunc.call(rStruct, pComp);
}

export function CompileFunc$rC4ConfigIRC$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4CustomKey$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4KeyCodeEx$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4Landscape$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4ObjectPtr$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4PacketFwd$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc$pStdCompiler(pComp);
}

export function CompileFunc$rC4SPlrStart$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdIntAdapt$i32$u8$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdIntAdapt$i32$u8$pStdCompiler$2(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdIntAdapt$i32$i32$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdIntAdapt$i32$u8$pStdCompiler$3(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdIntAdapt$i32$i32$pStdCompiler$2(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdIntAdapt$i32$u8$pStdCompiler$4(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdIntAdapt$i32$u8$pStdCompiler$5(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdIntAdapt$i32$u8$pStdCompiler$6(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdIntAdapt$i32$u8$pStdCompiler$7(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdIntAdapt$i32$u8$pStdCompiler$8(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdIntAdapt$i32$u8$pStdCompiler$9(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdIntAdapt$u8$i32$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdIntAdapt$i32$i32$pStdCompiler$3(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4ClientCore$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc$pStdCompiler(pComp);
}

export function CompileFunc$rC4ClientList$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4ControlSet$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc$pStdCompiler(pComp);
}

export function CompileFunc$rC4FolderHead$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4PacketAddr$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc$pStdCompiler(pComp);
}

export function CompileFunc$rC4PacketBase$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc$pStdCompiler(pComp);
}

export function CompileFunc$rC4PacketConn$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc$pStdCompiler(pComp);
}

export function CompileFunc$rC4PacketList$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc$pStdCompiler(pComp);
}

export function CompileFunc$rC4PacketPing$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc$pStdCompiler(pComp);
}

export function CompileFunc$rC4PlayerInfo$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4SLandscape$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4Scoreboard$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4TargetRect$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc$pStdCompiler(pComp);
}

export function CompileFunc$rStdCastAdapt$i32$i32$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdCastAdapt$C4Fixed$i32$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdEnumAdapt$i32$u8$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdEnumAdapt$i32$u8$pStdCompiler$2(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdEnumAdapt$i32$u8$pStdCompiler$3(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdEnumAdapt$i32$u8$pStdCompiler$4(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdEnumAdapt$i32$i32$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdEnumAdapt$i32$i32$pStdCompiler$2(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdEnumAdapt$i32$u8$pStdCompiler$5(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdEnumAdapt$i32$i32$pStdCompiler$3(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdEnumAdapt$i32$u8$pStdCompiler$6(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdEnumAdapt$i32$u8$pStdCompiler$7(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4ConfigLobby$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4ConfigSound$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4ControlVote$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc$pStdCompiler(pComp);
}

export function CompileFunc$rC4GameResList$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4MusicSystem$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4PktDebugRec$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc$pStdCompiler(pComp);
}

export function CompileFunc$rC4RecordChunk$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4RoundResult$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4StrValAdapt$StdParameterAdapt$StdCopyStrBuf$i32$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdArrayAdapt$C4LSector$StdParameterAdaptMaker$pC4ValueNumbers$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdArrayAdapt$pC4PlayerInfo$StdPtrAdapt$C4PlayerInfo$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdArrayAdapt$pC4ClientPlayerInfos$StdPtrAdapt$C4ClientPlayerInfos$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdArrayAdapt$pC4RoundResultsPlayer$StdPtrAdapt$C4RoundResultsPlayer$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdArrayAdapt$pC4Team$StdPtrAdapt$C4Team$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdArrayAdapt$pC4GameRes$StdPtrAdapt$C4GameRes$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdArrayAdapt$pScenario$StdPtrAdapt$Scenario$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdArrayAdapt$pAccessGfx$StdPtrAdapt$AccessGfx$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdArrayAdapt$i32$_IdFuncClass$i32$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdArrayAdapt$i32$StdIntPackAdapt$i32$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdCopyStrBuf$pStdCompiler(rStruct, pComp) {
  $.StdStrBuf.prototype.CompileFunc.call(rStruct, pComp);
}

export function CompileFunc$rC4KeyEventData$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4MaterialCore$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4PacketConnRe$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc$pStdCompiler(pComp);
}

export function CompileFunc$rC4RoundResults$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4SDefinitions$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4SEnvironment$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4ValueNumbers$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdInsertAdapt$StdDecompileAdapt$C4PacketBase$u8$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdInsertAdapt$StdParameterAdapt$C4Object$pC4ValueNumbers$StdNamingAdapt$C4ValueNumbers$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdInsertAdapt$StdStrBuf$StdBuf$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdNamingAdapt$StdArrayAdapt$C4LSector$StdParameterAdaptMaker$pC4ValueNumbers$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdNamingAdapt$StdInsertAdapt$StdParameterAdapt$C4Object$pC4ValueNumbers$StdNamingAdapt$C4ValueNumbers$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdNamingAdapt$StdDecompileAdapt$C4RecordChunk$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdNamingAdapt$StdParameterAdapt$C4GameParameters$pC4Scenario$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdNamingAdapt$StdParameterAdapt$C4Object$pC4ValueNumbers$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdNamingAdapt$StdParameterAdapt$C4Player$pC4ValueNumbers$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdNamingAdapt$StdParameterAdapt$C4Player$pC4ValueNumbers$pStdCompiler$2(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdNamingAdapt$StdSTLContainerAdapt$list$C4RecordChunk$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdNamingAdapt$C4ObjectListDumpHelper$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdNamingAdapt$C4IDPacket$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdNamingAdapt$C4TeamList$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdNamingAdapt$C4RoundResults$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdNamingAdapt$C4ValueNumbers$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdNamingAdapt$C4MapFolderData$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdNamingAdapt$C4ObjectInfoCore$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdNamingAdapt$C4PlayerInfoList$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdNamingAdapt$C4ParticleDefCore$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdNamingAdapt$C4Network2Reference$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdNamingAdapt$C4Def$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdStringAdapt$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4ConfigGamepad$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4ConfigGeneral$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4ConfigNetwork$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4ConfigStartup$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4ControlScript$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc$pStdCompiler(pComp);
}

export function CompileFunc$rC4DrawTransform$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4KeyboardInput$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4MapFolderData$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4PlayerControl$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdIntPackAdapt$i32$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdIntPackAdapt$u32$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4ConfigControls$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4ConfigGraphics$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4ConfigSecurity$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4ControlMessage$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc$pStdCompiler(pComp);
}

export function CompileFunc$rC4ControlVoteEnd$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc$pStdCompiler(pComp);
}

export function CompileFunc$rC4GameParameters$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4Network2Status$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc$pStdCompiler(pComp);
}

export function CompileFunc$rC4ObjectInfoCore$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4PacketJoinData$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc$pStdCompiler(pComp);
}

export function CompileFunc$rC4PlayerInfoCore$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc$pStdCompiler(pComp);
}

export function CompileFunc$rC4PlayerInfoList$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdBitfieldAdapt$u8$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdBitfieldAdapt$i32$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdBitfieldAdapt$u32$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdBitfieldAdapt$u16$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4ConfigDeveloper$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4ControlDebugRec$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc$pStdCompiler(pComp);
}

export function CompileFunc$rC4GraphicsOverlay$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4Network2ResCore$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc$pStdCompiler(pComp);
}

export function CompileFunc$rC4PacketResStatus$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc$pStdCompiler(pComp);
}

export function CompileFunc$rC4ParticleDefCore$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdDecompileAdapt$C4PacketBase$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdDecompileAdapt$C4RecordChunk$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdParameterAdapt$StdPtrAdapt$C4Object$pC4ValueNumbers$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdParameterAdapt$StdDecompileAdapt$StdCopyStrBuf$i32$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdParameterAdapt$C4PropList$pC4ValueNumbers$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdParameterAdapt$C4Scenario$b$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdParameterAdapt$C4Scenario$b$pStdCompiler$2(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdParameterAdapt$C4ObjectList$pC4ValueNumbers$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdParameterAdapt$StdCopyStrBuf$i32$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdParameterAdapt$C4ValueMapData$pC4ValueNumbers$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdParameterAdapt$C4ValueMapData$pC4ValueNumbers$pStdCompiler$2(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdParameterAdapt$C4ConfigGamepad$b$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdParameterAdapt$StdMeshInstance$x$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdParameterAdapt$C4GameParameters$pC4Scenario$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdParameterAdapt$C4Network2Status$b$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdParameterAdapt$C4PropListNumbered$pC4ValueNumbers$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdParameterAdapt$C4NotifyingObjectList$pC4ValueNumbers$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdParameterAdapt$ValidatedStdCopyStrBuf$3$i32$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdParameterAdapt$C4SGame$b$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdParameterAdapt$C4SHead$b$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdParameterAdapt$C4Value$pC4ValueNumbers$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdParameterAdapt$C4IDList$b$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdParameterAdapt$C4Object$pC4ValueNumbers$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdParameterAdapt$C4Object$pC4ValueNumbers$pStdCompiler$2(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdParameterAdapt$C4Player$pC4ValueNumbers$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdParameterAdapt$C4Player$pC4ValueNumbers$pStdCompiler$2(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdParameterAdapt$C4Command$pC4ValueNumbers$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdParameterAdapt$StdStrBuf$i32$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdParameterAdapt$AttachedMesh$x$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdStdStringAdapt$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4ControlEditGraph$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc$pStdCompiler(pComp);
}

export function CompileFunc$rC4ControlRemovePlr$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc$pStdCompiler(pComp);
}

export function CompileFunc$rC4ControlSyncCheck$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc$pStdCompiler(pComp);
}

export function CompileFunc$rC4DefGraphicsAdapt$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4MaterialReaction$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4NetFilenameAdapt$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4Network2ResChunk$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc$pStdCompiler(pComp);
}

export function CompileFunc$rC4PacketControlPkt$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc$pStdCompiler(pComp);
}

export function CompileFunc$rC4PacketControlReq$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc$pStdCompiler(pComp);
}

export function CompileFunc$rC4PacketPostMortem$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc$pStdCompiler(pComp);
}

export function CompileFunc$rC4PacketResRequest$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc$pStdCompiler(pComp);
}

export function CompileFunc$rC4PacketTCPSimOpen$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc$pStdCompiler(pComp);
}

export function CompileFunc$rC4PlayerControlDef$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdParameter2Adapt$C4AulScriptEngine$b$pC4ValueNumbers$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdParameter2Adapt$C4Game$CompileSettings$pC4ValueNumbers$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdParameter2Adapt$C4Game$CompileSettings$pC4ValueNumbers$pStdCompiler$2(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdSubMeshInstance$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4ClientPlayerInfos$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4ControlClientJoin$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc$pStdCompiler(pComp);
}

export function CompileFunc$rC4ControlEMDrawTool$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc$pStdCompiler(pComp);
}

export function CompileFunc$rC4ControlJoinPlayer$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc$pStdCompiler(pComp);
}

export function CompileFunc$rC4ControlPlayerInfo$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc$pStdCompiler(pComp);
}

export function CompileFunc$rC4GameControlPacket$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc$pStdCompiler(pComp);
}

export function CompileFunc$rC4MessageBoardQuery$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4Network2Reference$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4PacketActivateReq$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc$pStdCompiler(pComp);
}

export function CompileFunc$rC4PacketResDiscover$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc$pStdCompiler(pComp);
}

export function CompileFunc$rC4PlayerControlDefs$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4PlayerControlFile$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4ControlMenuCommand$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc$pStdCompiler(pComp);
}

export function CompileFunc$rC4ControlMsgBoardCmd$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc$pStdCompiler(pComp);
}

export function CompileFunc$rC4ControlPlayerMouse$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc$pStdCompiler(pComp);
}

export function CompileFunc$rC4ControlSynchronize$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc$pStdCompiler(pComp);
}

export function CompileFunc$rC4PacketExecSyncCtrl$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc$pStdCompiler(pComp);
}

export function CompileFunc$rC4RoundResultsPlayer$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4ScenarioParameters$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdArrayDefaultAdapt$i32$i32$_IdFuncClass$i32$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdRuntimeValueAdapt$b$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdSTLContainerAdapt$list$C4RecordChunk$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdSTLContainerAdapt$vector$C4KeyCodeEx$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdSTLContainerAdapt$vector$C4MaterialReaction$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdSTLContainerAdapt$vector$ControlDownState$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdSTLContainerAdapt$vector$ControlItem$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdSTLContainerAdapt$vector$Option$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdSTLContainerAdapt$vector$KeyComboItem$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdSTLContainerAdapt$vector$i32$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4ControlClientRemove$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc$pStdCompiler(pComp);
}

export function CompileFunc$rC4ControlClientUpdate$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc$pStdCompiler(pComp);
}

export function CompileFunc$rC4ControlEMMoveObject$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc$pStdCompiler(pComp);
}

export function CompileFunc$rC4ControlPlayerAction$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc$pStdCompiler(pComp);
}

export function CompileFunc$rC4ControlPlayerSelect$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc$pStdCompiler(pComp);
}

export function CompileFunc$rC4RoundResultsPlayers$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4ControlMsgBoardReply$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc$pStdCompiler(pComp);
}

export function CompileFunc$rC4ControlPlayerControl$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc$pStdCompiler(pComp);
}

export function CompileFunc$rC4Network2ResChunkData$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc$pStdCompiler(pComp);
}

export function CompileFunc$rC4ObjectListDumpHelper$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4ScenarioParameterDef$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rValidatedStdCopyStrBuf$10$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rValidatedStdCopyStrBuf$3$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rValidatedStdCopyStrBuf$4$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4ControlReInitScenario$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc$pStdCompiler(pComp);
}

export function CompileFunc$rC4ScenarioParameterDefs$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4PlayerControlAssignment$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdArrayDefaultArrayAdapt$i32$x$_IdFuncClass$i32$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdArrayDefaultArrayAdapt$i32$x$lambda$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdArrayDefaultArrayAdapt$i32$pi32$_IdFuncClass$i32$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4GraphicsOverlayListAdapt$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4PacketLeagueRoundResults$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc$pStdCompiler(pComp);
}

export function CompileFunc$rC4PacketPlayerInfoUpdRequest$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc$pStdCompiler(pComp);
}

export function CompileFunc$rC4PlayerControlAssignmentSet$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4PlayerControlAssignmentSets$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4ID$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4Def$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc$pStdCompiler(pComp);
}

export function CompileFunc$rC4Sky$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4Rect$pStdCompiler(rStruct, pComp) {
  $.C4Rect.prototype.CompileFunc$pStdCompiler.call(rStruct, pComp);
}

export function CompileFunc$rC4SVal$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4Team$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdBuf$pStdCompiler(rStruct, pComp) {
  $.StdBuf.prototype.CompileFunc.call(rStruct, pComp);
}

export function CompileFunc$rC4Action$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4Client$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4Config$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4Folder$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4IDList$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4Control$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc$pStdCompiler(pComp);
}

export function CompileFunc$rC4FoWBeam$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4GameRes$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4Weather$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdStrBuf$pStdCompiler(rStruct, pComp) {
  $.StdStrBuf.prototype.CompileFunc.call(rStruct, pComp);
}

export function CompileFunc$rC4PacketCountdown$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc$pStdCompiler(pComp);
}

export function CompileFunc$rC4PacketSetScenarioParameter$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc$pStdCompiler(pComp);
}

export function CompileFunc$rMatrixAdapt$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rTransformAdapt$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rValueProviderAdapt$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4MapFolderData$Scenario$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4MapFolderData$AccessGfx$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4PlayerControl$CSync$ControlDownState$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4PlayerControl$CSync$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rStdMeshInstance$SerializableValueProvider$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4ControlPlayerControl$ControlItem$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4ScenarioParameterDef$Option$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4PlayerControlAssignment$KeyComboItem$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rC4Player$HostilitySet$pStdCompiler(rStruct, pComp) {
  rStruct.CompileFunc(pComp);
}

export function CompileFunc$rstring$pStdCompiler(s, comp) {
  comp.String$rstring$i32(s);
}

export function CompileNewFunc$rpC4IDPacket$pStdCompiler(pStruct, pComp) {
  let $t1;
  let temp = new $.C4IDPacket();
  pComp.Value$rC4IDPacket(temp);
  pStruct.a[pStruct.o] = ($t1 = temp, temp = null, $t1);
}

export function CompileNewFunc$rpC4PlayerInfo$pStdCompiler(pStruct, pComp) {
  let $t1;
  let temp = new $.C4PlayerInfo().init();
  pComp.Value$rC4PlayerInfo(temp);
  pStruct.a[pStruct.o] = ($t1 = temp, temp = null, $t1);
}

export function CompileNewFunc$rpC4PktDebugRec$pStdCompiler(pStruct, pComp) {
  let $t1;
  let temp = new $.C4PktDebugRec().init$v();
  pComp.Value$rC4PktDebugRec(temp);
  pStruct.a[pStruct.o] = ($t1 = temp, temp = null, $t1);
}

export function CompileNewFunc$rpC4DrawTransform$pStdCompiler(pStruct, pComp) {
  let $t1;
  let temp = new $.C4DrawTransform().init$v();
  pComp.Value$rC4DrawTransform(temp);
  pStruct.a[pStruct.o] = ($t1 = temp, temp = null, $t1);
}

export function CompileNewFunc$rpC4Network2ResCore$pStdCompiler(pStruct, pComp) {
  let $t1;
  let temp = new $.C4Network2ResCore().init();
  pComp.Value$rC4Network2ResCore(temp);
  pStruct.a[pStruct.o] = ($t1 = temp, temp = null, $t1);
}

export function CompileNewFunc$rpC4ClientPlayerInfos$pStdCompiler(pStruct, pComp) {
  let $t1;
  let temp = new $.C4ClientPlayerInfos().init();
  pComp.Value$rC4ClientPlayerInfos(temp);
  pStruct.a[pStruct.o] = ($t1 = temp, temp = null, $t1);
}

export function CompileNewFunc$rpC4MessageBoardQuery$pStdCompiler(pStruct, pComp) {
  let $t1;
  let temp = new $.C4MessageBoardQuery().init$v();
  pComp.Value$rC4MessageBoardQuery(temp);
  pStruct.a[pStruct.o] = ($t1 = temp, temp = null, $t1);
}

export function CompileNewFunc$rpC4RoundResultsPlayer$pStdCompiler(pStruct, pComp) {
  let $t1;
  let temp = new $.C4RoundResultsPlayer().init();
  pComp.Value$rC4RoundResultsPlayer(temp);
  pStruct.a[pStruct.o] = ($t1 = temp, temp = null, $t1);
}

export function CompileNewFunc$rpC4Team$pStdCompiler(pStruct, pComp) {
  let $t1;
  let temp = new $.C4Team().init();
  pComp.Value$rC4Team(temp);
  pStruct.a[pStruct.o] = ($t1 = temp, temp = null, $t1);
}

export function CompileNewFunc$rpStdBuf$pStdCompiler(pStruct, pComp) {
  let $t1;
  let temp = new $.StdBuf();
  pComp.Value$rStdBuf(temp);
  pStruct.a[pStruct.o] = ($t1 = temp, temp = null, $t1);
}

export function CompileNewFunc$rpC4Control$pStdCompiler(pStruct, pComp) {
  let $t1;
  let temp = new $.C4Control().init();
  pComp.Value$rC4Control(temp);
  pStruct.a[pStruct.o] = ($t1 = temp, temp = null, $t1);
}

export function CompileNewFunc$rpC4GameRes$pStdCompiler(pStruct, pComp) {
  let $t1;
  let temp = new $.C4GameRes().init();
  pComp.Value$rC4GameRes(temp);
  pStruct.a[pStruct.o] = ($t1 = temp, temp = null, $t1);
}

export function CompileNewFunc$rpScenario$pStdCompiler(pStruct, pComp) {
  let $t1;
  let temp = new $.C4MapFolderData$Scenario().None();
  pComp.Value$rC4MapFolderData$Scenario(temp);
  pStruct.a[pStruct.o] = ($t1 = temp, temp = null, $t1);
}

export function CompileNewFunc$rpAccessGfx$pStdCompiler(pStruct, pComp) {
  let $t1;
  let temp = new $.C4MapFolderData$AccessGfx().None();
  pComp.Value$rC4MapFolderData$AccessGfx(temp);
  pStruct.a[pStruct.o] = ($t1 = temp, temp = null, $t1);
}

export function CompileNewFunc$rpC4PlayerInfo$pStdCompiler$2(..._) { return $missing("CompileNewFunc"); }

export function CompileNewFunc$rpC4ValueArray$pStdCompiler$mpC4ValueNumbers(pStruct, pComp, pars) {
  let $t1;
  let temp = new $.C4ValueArray();
  pComp.Value$StdParameterAdapt$C4ValueArray$pC4ValueNumbers($.mkParAdapt$rC4ValueArray$mpC4ValueNumbers(temp, pars));
  pStruct.a[pStruct.o] = ($t1 = temp, temp = null, $t1);
}

export function CompileNewFunc$rpC4DrawTransform$pStdCompiler$2(..._) { return $missing("CompileNewFunc"); }

export function CompileNewFunc$rpC4Network2ResCore$pStdCompiler$2(..._) { return $missing("CompileNewFunc"); }

export function CompileNewFunc$rpC4MessageBoardQuery$pStdCompiler$2(..._) { return $missing("CompileNewFunc"); }

export function CompileNewFunc$rpC4RoundResultsPlayer$pStdCompiler$2(..._) { return $missing("CompileNewFunc"); }

export function CompileNewFunc$rpStdMeshInstanceAnimationNode$pStdCompiler$pStdMesh(pStruct, pComp, pars) {
  let $t1;
  let temp = new $.StdMeshInstanceAnimationNode().init$v();
  pComp.Value$StdParameterAdapt$StdMeshInstanceAnimationNode$pStdMesh($.mkParAdapt$rStdMeshInstanceAnimationNode$pStdMesh(temp, pars));
  pStruct.a[pStruct.o] = ($t1 = temp, temp = null, $t1);
}

export function CompileNewFunc$rpC4Team$pStdCompiler$2(..._) { return $missing("CompileNewFunc"); }

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

export function CompileNewFunc$rpC4Object$pStdCompiler$rpC4ValueNumbers(pStruct, pComp, pars) {
  let $t1;
  let temp = new $.C4Object().init();
  pComp.Value$StdParameterAdapt$C4Object$pC4ValueNumbers$2($.mkParAdapt$rC4Object$rpC4ValueNumbers(temp, $tmp(pars.a[pars.o])));
  pStruct.a[pStruct.o] = ($t1 = temp, temp = null, $t1);
}

export function CompileNewFunc$rpC4Command$pStdCompiler$rpC4ValueNumbers(pStruct, pComp, pars) {
  let $t1;
  let temp = new $.C4Command().init();
  pComp.Value$StdParameterAdapt$C4Command$pC4ValueNumbers($.mkParAdapt$rC4Command$rpC4ValueNumbers(temp, $tmp(pars.a[pars.o])));
  pStruct.a[pStruct.o] = ($t1 = temp, temp = null, $t1);
}

export function CompileNewFunc$rpC4Control$pStdCompiler$2(..._) { return $missing("CompileNewFunc"); }

export function CompileNewFunc$rpScenario$pStdCompiler$2(..._) { return $missing("CompileNewFunc"); }

export function CompileNewFuncCtx$rpStdMeshInstance$pStdCompiler$StdMesh$x(pStruct, pComp, rCtx, rPar) {
  let $t1;
  let temp = new $.StdMeshInstance().init(rCtx);
  pComp.Value$StdParameterAdapt$StdMeshInstance$x($.mkParAdapt$rStdMeshInstance$x(temp, rPar));
  pStruct.a[pStruct.o] = ($t1 = temp, temp = null, $t1);
}

export function CompileFromBuf$rC4PacketBase$x(TargetStruct, SrcBuf) {
  let Compiler = new StdCompilerBinRead().None();
  Compiler.setInput$mInT($.StdBuf.prototype.getRef.call(SrcBuf));
  Compiler.Compile$rC4PacketBase(TargetStruct);
}

export function CompileFromBuf$mStdNamingAdapt$C4Network2Reference$x(TargetStruct, SrcBuf) {
  let Compiler = new StdCompilerINIRead().init();
  Compiler.setInput$InT(SrcBuf.getRef());
  Compiler.Compile$rStdNamingAdapt$C4Network2Reference(TargetStruct);
}

export function CompileFromBuf$rStdParameterAdapt$C4Scenario$b$x(TargetStruct, SrcBuf) {
  let Compiler = new StdCompilerINIRead().init();
  Compiler.setInput$InT(SrcBuf.getRef());
  Compiler.Compile$rStdParameterAdapt$C4Scenario$b(TargetStruct);
}

export function DecompileToBuf$C4IDPacket(SrcStruct) {
  let Compiler = new StdCompilerBinWrite().None();
  Compiler.Decompile$C4IDPacket(SrcStruct);
  return Compiler.getOutput();
}

export function DecompileToBuf$C4PacketBase(SrcStruct) {
  let Compiler = new StdCompilerBinWrite().None();
  Compiler.Decompile$C4PacketBase(SrcStruct);
  return Compiler.getOutput();
}

export function DecompileToBuf$C4PktDebugRec(SrcStruct) {
  let Compiler = new StdCompilerBinWrite().None();
  Compiler.Decompile$C4PktDebugRec(SrcStruct);
  return Compiler.getOutput();
}

export function DecompileToBuf$StdInsertAdapt$StdDecompileAdapt$C4PacketBase$u8(SrcStruct) {
  let Compiler = new StdCompilerBinWrite().None();
  Compiler.Decompile$StdInsertAdapt$StdDecompileAdapt$C4PacketBase$u8(SrcStruct);
  return Compiler.getOutput();
}

export function DecompileToBuf$StdInsertAdapt$StdStrBuf$StdBuf(SrcStruct) {
  let Compiler = new StdCompilerBinWrite().None();
  Compiler.Decompile$StdInsertAdapt$StdStrBuf$StdBuf(SrcStruct);
  return Compiler.getOutput();
}

export function DecompileToBuf$C4Control(SrcStruct) {
  let Compiler = new StdCompilerBinWrite().None();
  Compiler.Decompile$C4Control(SrcStruct);
  return Compiler.getOutput();
}

export function DecompileToBuf$StdNamingAdapt$StdArrayAdapt$C4LSector$StdParameterAdaptMaker$pC4ValueNumbers(SrcStruct) {
  let Compiler = new StdCompilerINIWrite().None();
  Compiler.Decompile$StdNamingAdapt$StdArrayAdapt$C4LSector$StdParameterAdaptMaker$pC4ValueNumbers(SrcStruct);
  return Compiler.getOutput();
}

export function DecompileToBuf$StdNamingAdapt$StdInsertAdapt$StdParameterAdapt$C4Object$pC4ValueNumbers$StdNamingAdapt$C4ValueNumbers(SrcStruct) {
  let Compiler = new StdCompilerINIWrite().None();
  Compiler.Decompile$StdNamingAdapt$StdInsertAdapt$StdParameterAdapt$C4Object$pC4ValueNumbers$StdNamingAdapt$C4ValueNumbers(SrcStruct);
  return Compiler.getOutput();
}

export function DecompileToBuf$StdNamingAdapt$StdDecompileAdapt$C4RecordChunk(SrcStruct) {
  let Compiler = new StdCompilerINIWrite().None();
  Compiler.Decompile$StdNamingAdapt$StdDecompileAdapt$C4RecordChunk(SrcStruct);
  return Compiler.getOutput();
}

export function DecompileToBuf$StdNamingAdapt$StdParameterAdapt$C4GameParameters$pC4Scenario(SrcStruct) {
  let Compiler = new StdCompilerINIWrite().None();
  Compiler.Decompile$StdNamingAdapt$StdParameterAdapt$C4GameParameters$pC4Scenario(SrcStruct);
  return Compiler.getOutput();
}

export function DecompileToBuf$StdNamingAdapt$C4ObjectListDumpHelper(SrcStruct) {
  let Compiler = new StdCompilerINIWrite().None();
  Compiler.Decompile$StdNamingAdapt$C4ObjectListDumpHelper(SrcStruct);
  return Compiler.getOutput();
}

export function DecompileToBuf$StdNamingAdapt$C4IDPacket(SrcStruct) {
  let Compiler = new StdCompilerINIWrite().None();
  Compiler.Decompile$StdNamingAdapt$C4IDPacket(SrcStruct);
  return Compiler.getOutput();
}

export function DecompileToBuf$StdNamingAdapt$C4TeamList(SrcStruct) {
  let Compiler = new StdCompilerINIWrite().None();
  Compiler.Decompile$StdNamingAdapt$C4TeamList(SrcStruct);
  return Compiler.getOutput();
}

export function DecompileToBuf$StdNamingAdapt$C4RoundResults(SrcStruct) {
  let Compiler = new StdCompilerINIWrite().None();
  Compiler.Decompile$StdNamingAdapt$C4RoundResults(SrcStruct);
  return Compiler.getOutput();
}

export function DecompileToBuf$StdNamingAdapt$C4ObjectInfoCore(SrcStruct) {
  let Compiler = new StdCompilerINIWrite().None();
  Compiler.Decompile$StdNamingAdapt$C4ObjectInfoCore(SrcStruct);
  return Compiler.getOutput();
}

export function DecompileToBuf$StdNamingAdapt$C4PlayerInfoList(SrcStruct) {
  let Compiler = new StdCompilerINIWrite().None();
  Compiler.Decompile$StdNamingAdapt$C4PlayerInfoList(SrcStruct);
  return Compiler.getOutput();
}

export function DecompileToBuf$StdNamingAdapt$C4Def(SrcStruct) {
  let Compiler = new StdCompilerINIWrite().None();
  Compiler.Decompile$StdNamingAdapt$C4Def(SrcStruct);
  return Compiler.getOutput();
}

export function DecompileToBuf$C4PlayerInfoCore(SrcStruct) {
  let Compiler = new StdCompilerINIWrite().None();
  Compiler.Decompile$C4PlayerInfoCore(SrcStruct);
  return Compiler.getOutput();
}

export function DecompileToBuf$StdParameterAdapt$C4Scenario$b(SrcStruct) {
  let Compiler = new StdCompilerINIWrite().None();
  Compiler.Decompile$StdParameterAdapt$C4Scenario$b(SrcStruct);
  return Compiler.getOutput();
}

export function DecompileToBuf$StdParameter2Adapt$C4Game$CompileSettings$pC4ValueNumbers(SrcStruct) {
  let Compiler = new StdCompilerINIWrite().None();
  Compiler.Decompile$StdParameter2Adapt$C4Game$CompileSettings$pC4ValueNumbers(SrcStruct);
  return Compiler.getOutput();
}

export function DecompileToBuf$C4PlayerControlFile(SrcStruct) {
  let Compiler = new StdCompilerINIWrite().None();
  Compiler.Decompile$C4PlayerControlFile(SrcStruct);
  return Compiler.getOutput();
}

export function CompileFromBuf_Log(TargetStruct, SrcBuf, szName) {
  try {
    CompileFromBuf$rStdParameterAdapt$C4Scenario$b$x(TargetStruct, SrcBuf);
    return true;
  } catch ($e1) {
    if ($e1 instanceof StdCompiler$Exception) {
      const pExc = $e1;
      if (!(pExc.Pos.getLength() !== 0)) {
        $.LogF(S("ERROR: %s (in %s)"), pExc.Msg.getData(), szName);
      } else {
        $.LogF(S("ERROR: %s (in %s, %s)"), pExc.Msg.getData(), pExc.Pos.getData(), szName);
      }
      $delete(pExc);
      return false;
    } else {
      throw $e1;
    }
  }
}

export function CompileFromBuf_LogWarn$mStdNamingAdapt$StdParameterAdapt$C4GameParameters$pC4Scenario$x$pi8(TargetStruct, SrcBuf, szName) {
  try {
    let Compiler = new StdCompilerINIRead().init();
    Compiler.setInput$InT(SrcBuf.getRef());
    Compiler.setWarnCallback(StdCompilerWarnCallback, szName);
    Compiler.Compile$rStdNamingAdapt$StdParameterAdapt$C4GameParameters$pC4Scenario(TargetStruct);
    return true;
  } catch ($e1) {
    if ($e1 instanceof StdCompiler$Exception) {
      const pExc = $e1;
      if (!(pExc.Pos.getLength() !== 0)) {
        $.LogF(S("ERROR: %s (in %s)"), pExc.Msg.getData(), szName);
      } else {
        $.LogF(S("ERROR: %s (in %s, %s)"), pExc.Msg.getData(), pExc.Pos.getData(), szName);
      }
      $delete(pExc);
      return false;
    } else {
      throw $e1;
    }
  }
}

export function CompileFromBuf_LogWarn$mStdNamingAdapt$StdParameterAdapt$C4Player$pC4ValueNumbers$x$pi8(TargetStruct, SrcBuf, szName) {
  try {
    let Compiler = new StdCompilerINIRead().init();
    Compiler.setInput$InT(SrcBuf.getRef());
    Compiler.setWarnCallback(StdCompilerWarnCallback, szName);
    Compiler.Compile$rStdNamingAdapt$StdParameterAdapt$C4Player$pC4ValueNumbers(TargetStruct);
    return true;
  } catch ($e1) {
    if ($e1 instanceof StdCompiler$Exception) {
      const pExc = $e1;
      if (!(pExc.Pos.getLength() !== 0)) {
        $.LogF(S("ERROR: %s (in %s)"), pExc.Msg.getData(), szName);
      } else {
        $.LogF(S("ERROR: %s (in %s, %s)"), pExc.Msg.getData(), pExc.Pos.getData(), szName);
      }
      $delete(pExc);
      return false;
    } else {
      throw $e1;
    }
  }
}

export function CompileFromBuf_LogWarn$mStdNamingAdapt$StdSTLContainerAdapt$list$C4RecordChunk$x$pi8(TargetStruct, SrcBuf, szName) {
  try {
    let Compiler = new StdCompilerINIRead().init();
    Compiler.setInput$InT(SrcBuf.getRef());
    Compiler.setWarnCallback(StdCompilerWarnCallback, szName);
    Compiler.Compile$rStdNamingAdapt$StdSTLContainerAdapt$list$C4RecordChunk(TargetStruct);
    return true;
  } catch ($e1) {
    if ($e1 instanceof StdCompiler$Exception) {
      const pExc = $e1;
      if (!(pExc.Pos.getLength() !== 0)) {
        $.LogF(S("ERROR: %s (in %s)"), pExc.Msg.getData(), szName);
      } else {
        $.LogF(S("ERROR: %s (in %s, %s)"), pExc.Msg.getData(), pExc.Pos.getData(), szName);
      }
      $delete(pExc);
      return false;
    } else {
      throw $e1;
    }
  }
}

export function CompileFromBuf_LogWarn$mStdNamingAdapt$C4TeamList$x$pi8(TargetStruct, SrcBuf, szName) {
  try {
    let Compiler = new StdCompilerINIRead().init();
    Compiler.setInput$InT(SrcBuf.getRef());
    Compiler.setWarnCallback(StdCompilerWarnCallback, szName);
    Compiler.Compile$rStdNamingAdapt$C4TeamList(TargetStruct);
    return true;
  } catch ($e1) {
    if ($e1 instanceof StdCompiler$Exception) {
      const pExc = $e1;
      if (!(pExc.Pos.getLength() !== 0)) {
        $.LogF(S("ERROR: %s (in %s)"), pExc.Msg.getData(), szName);
      } else {
        $.LogF(S("ERROR: %s (in %s, %s)"), pExc.Msg.getData(), pExc.Pos.getData(), szName);
      }
      $delete(pExc);
      return false;
    } else {
      throw $e1;
    }
  }
}

export function CompileFromBuf_LogWarn$mStdNamingAdapt$C4RoundResults$x$pi8(TargetStruct, SrcBuf, szName) {
  try {
    let Compiler = new StdCompilerINIRead().init();
    Compiler.setInput$InT(SrcBuf.getRef());
    Compiler.setWarnCallback(StdCompilerWarnCallback, szName);
    Compiler.Compile$rStdNamingAdapt$C4RoundResults(TargetStruct);
    return true;
  } catch ($e1) {
    if ($e1 instanceof StdCompiler$Exception) {
      const pExc = $e1;
      if (!(pExc.Pos.getLength() !== 0)) {
        $.LogF(S("ERROR: %s (in %s)"), pExc.Msg.getData(), szName);
      } else {
        $.LogF(S("ERROR: %s (in %s, %s)"), pExc.Msg.getData(), pExc.Pos.getData(), szName);
      }
      $delete(pExc);
      return false;
    } else {
      throw $e1;
    }
  }
}

export function CompileFromBuf_LogWarn$mStdNamingAdapt$C4MapFolderData$x$pi8(TargetStruct, SrcBuf, szName) {
  try {
    let Compiler = new StdCompilerINIRead().init();
    Compiler.setInput$InT(SrcBuf.getRef());
    Compiler.setWarnCallback(StdCompilerWarnCallback, szName);
    Compiler.Compile$rStdNamingAdapt$C4MapFolderData(TargetStruct);
    return true;
  } catch ($e1) {
    if ($e1 instanceof StdCompiler$Exception) {
      const pExc = $e1;
      if (!(pExc.Pos.getLength() !== 0)) {
        $.LogF(S("ERROR: %s (in %s)"), pExc.Msg.getData(), szName);
      } else {
        $.LogF(S("ERROR: %s (in %s, %s)"), pExc.Msg.getData(), pExc.Pos.getData(), szName);
      }
      $delete(pExc);
      return false;
    } else {
      throw $e1;
    }
  }
}

export function CompileFromBuf_LogWarn$mStdNamingAdapt$C4ObjectInfoCore$x$pi8(TargetStruct, SrcBuf, szName) {
  try {
    let Compiler = new StdCompilerINIRead().init();
    Compiler.setInput$InT(SrcBuf.getRef());
    Compiler.setWarnCallback(StdCompilerWarnCallback, szName);
    Compiler.Compile$rStdNamingAdapt$C4ObjectInfoCore(TargetStruct);
    return true;
  } catch ($e1) {
    if ($e1 instanceof StdCompiler$Exception) {
      const pExc = $e1;
      if (!(pExc.Pos.getLength() !== 0)) {
        $.LogF(S("ERROR: %s (in %s)"), pExc.Msg.getData(), szName);
      } else {
        $.LogF(S("ERROR: %s (in %s, %s)"), pExc.Msg.getData(), pExc.Pos.getData(), szName);
      }
      $delete(pExc);
      return false;
    } else {
      throw $e1;
    }
  }
}

export function CompileFromBuf_LogWarn$mStdNamingAdapt$C4PlayerInfoList$x$pi8(TargetStruct, SrcBuf, szName) {
  try {
    let Compiler = new StdCompilerINIRead().init();
    Compiler.setInput$InT(SrcBuf.getRef());
    Compiler.setWarnCallback(StdCompilerWarnCallback, szName);
    Compiler.Compile$rStdNamingAdapt$C4PlayerInfoList(TargetStruct);
    return true;
  } catch ($e1) {
    if ($e1 instanceof StdCompiler$Exception) {
      const pExc = $e1;
      if (!(pExc.Pos.getLength() !== 0)) {
        $.LogF(S("ERROR: %s (in %s)"), pExc.Msg.getData(), szName);
      } else {
        $.LogF(S("ERROR: %s (in %s, %s)"), pExc.Msg.getData(), pExc.Pos.getData(), szName);
      }
      $delete(pExc);
      return false;
    } else {
      throw $e1;
    }
  }
}

export function CompileFromBuf_LogWarn$mStdNamingAdapt$C4ParticleDefCore$x$pi8(TargetStruct, SrcBuf, szName) {
  try {
    let Compiler = new StdCompilerINIRead().init();
    Compiler.setInput$InT(SrcBuf.getRef());
    Compiler.setWarnCallback(StdCompilerWarnCallback, szName);
    Compiler.Compile$rStdNamingAdapt$C4ParticleDefCore(TargetStruct);
    return true;
  } catch ($e1) {
    if ($e1 instanceof StdCompiler$Exception) {
      const pExc = $e1;
      if (!(pExc.Pos.getLength() !== 0)) {
        $.LogF(S("ERROR: %s (in %s)"), pExc.Msg.getData(), szName);
      } else {
        $.LogF(S("ERROR: %s (in %s, %s)"), pExc.Msg.getData(), pExc.Pos.getData(), szName);
      }
      $delete(pExc);
      return false;
    } else {
      throw $e1;
    }
  }
}

export function CompileFromBuf_LogWarn$mStdNamingAdapt$C4Def$x$pi8(TargetStruct, SrcBuf, szName) {
  try {
    let Compiler = new StdCompilerINIRead().init();
    Compiler.setInput$InT(SrcBuf.getRef());
    Compiler.setWarnCallback(StdCompilerWarnCallback, szName);
    Compiler.Compile$rStdNamingAdapt$C4Def(TargetStruct);
    return true;
  } catch ($e1) {
    if ($e1 instanceof StdCompiler$Exception) {
      const pExc = $e1;
      if (!(pExc.Pos.getLength() !== 0)) {
        $.LogF(S("ERROR: %s (in %s)"), pExc.Msg.getData(), szName);
      } else {
        $.LogF(S("ERROR: %s (in %s, %s)"), pExc.Msg.getData(), pExc.Pos.getData(), szName);
      }
      $delete(pExc);
      return false;
    } else {
      throw $e1;
    }
  }
}

export function CompileFromBuf_LogWarn$mStdParameterAdapt$C4Scenario$b$x$pi8(TargetStruct, SrcBuf, szName) {
  try {
    let Compiler = new StdCompilerINIRead().init();
    Compiler.setInput$InT(SrcBuf.getRef());
    Compiler.setWarnCallback(StdCompilerWarnCallback, szName);
    Compiler.Compile$rStdParameterAdapt$C4Scenario$b(TargetStruct);
    return true;
  } catch ($e1) {
    if ($e1 instanceof StdCompiler$Exception) {
      const pExc = $e1;
      if (!(pExc.Pos.getLength() !== 0)) {
        $.LogF(S("ERROR: %s (in %s)"), pExc.Msg.getData(), szName);
      } else {
        $.LogF(S("ERROR: %s (in %s, %s)"), pExc.Msg.getData(), pExc.Pos.getData(), szName);
      }
      $delete(pExc);
      return false;
    } else {
      throw $e1;
    }
  }
}

export function CompileFromBuf_LogWarn$mStdParameterAdapt$C4Scenario$b$x$pi8$2(TargetStruct, SrcBuf, szName) {
  try {
    let Compiler = new StdCompilerINIRead().init();
    Compiler.setInput$InT(SrcBuf.getRef());
    Compiler.setWarnCallback(StdCompilerWarnCallback, szName);
    Compiler.Compile$rStdParameterAdapt$C4Scenario$b$2(TargetStruct);
    return true;
  } catch ($e1) {
    if ($e1 instanceof StdCompiler$Exception) {
      const pExc = $e1;
      if (!(pExc.Pos.getLength() !== 0)) {
        $.LogF(S("ERROR: %s (in %s)"), pExc.Msg.getData(), szName);
      } else {
        $.LogF(S("ERROR: %s (in %s, %s)"), pExc.Msg.getData(), pExc.Pos.getData(), szName);
      }
      $delete(pExc);
      return false;
    } else {
      throw $e1;
    }
  }
}

export function CompileFromBuf_LogWarn$mStdParameter2Adapt$C4Game$CompileSettings$pC4ValueNumbers$x$pi8(TargetStruct, SrcBuf, szName) {
  try {
    let Compiler = new StdCompilerINIRead().init();
    Compiler.setInput$InT(SrcBuf.getRef());
    Compiler.setWarnCallback(StdCompilerWarnCallback, szName);
    Compiler.Compile$rStdParameter2Adapt$C4Game$CompileSettings$pC4ValueNumbers(TargetStruct);
    return true;
  } catch ($e1) {
    if ($e1 instanceof StdCompiler$Exception) {
      const pExc = $e1;
      if (!(pExc.Pos.getLength() !== 0)) {
        $.LogF(S("ERROR: %s (in %s)"), pExc.Msg.getData(), szName);
      } else {
        $.LogF(S("ERROR: %s (in %s, %s)"), pExc.Msg.getData(), pExc.Pos.getData(), szName);
      }
      $delete(pExc);
      return false;
    } else {
      throw $e1;
    }
  }
}

export function CompileFromBuf_LogWarn$rC4MaterialCore$x$pi8(TargetStruct, SrcBuf, szName) {
  try {
    let Compiler = new StdCompilerINIRead().init();
    Compiler.setInput$InT(SrcBuf.getRef());
    Compiler.setWarnCallback(StdCompilerWarnCallback, szName);
    Compiler.Compile$rC4MaterialCore(TargetStruct);
    return true;
  } catch ($e1) {
    if ($e1 instanceof StdCompiler$Exception) {
      const pExc = $e1;
      if (!(pExc.Pos.getLength() !== 0)) {
        $.LogF(S("ERROR: %s (in %s)"), pExc.Msg.getData(), szName);
      } else {
        $.LogF(S("ERROR: %s (in %s, %s)"), pExc.Msg.getData(), pExc.Pos.getData(), szName);
      }
      $delete(pExc);
      return false;
    } else {
      throw $e1;
    }
  }
}

export function CompileFromBuf_LogWarn$rC4KeyboardInput$x$pi8(TargetStruct, SrcBuf, szName) {
  try {
    let Compiler = new StdCompilerINIRead().init();
    Compiler.setInput$InT(SrcBuf.getRef());
    Compiler.setWarnCallback(StdCompilerWarnCallback, szName);
    Compiler.Compile$rC4KeyboardInput(TargetStruct);
    return true;
  } catch ($e1) {
    if ($e1 instanceof StdCompiler$Exception) {
      const pExc = $e1;
      if (!(pExc.Pos.getLength() !== 0)) {
        $.LogF(S("ERROR: %s (in %s)"), pExc.Msg.getData(), szName);
      } else {
        $.LogF(S("ERROR: %s (in %s, %s)"), pExc.Msg.getData(), pExc.Pos.getData(), szName);
      }
      $delete(pExc);
      return false;
    } else {
      throw $e1;
    }
  }
}

export function CompileFromBuf_LogWarn$rC4PlayerInfoCore$x$pi8(TargetStruct, SrcBuf, szName) {
  try {
    let Compiler = new StdCompilerINIRead().init();
    Compiler.setInput$InT(SrcBuf.getRef());
    Compiler.setWarnCallback(StdCompilerWarnCallback, szName);
    Compiler.Compile$rC4PlayerInfoCore(TargetStruct);
    return true;
  } catch ($e1) {
    if ($e1 instanceof StdCompiler$Exception) {
      const pExc = $e1;
      if (!(pExc.Pos.getLength() !== 0)) {
        $.LogF(S("ERROR: %s (in %s)"), pExc.Msg.getData(), szName);
      } else {
        $.LogF(S("ERROR: %s (in %s, %s)"), pExc.Msg.getData(), pExc.Pos.getData(), szName);
      }
      $delete(pExc);
      return false;
    } else {
      throw $e1;
    }
  }
}

export function CompileFromBuf_LogWarn$rC4PlayerControlFile$x$pi8(TargetStruct, SrcBuf, szName) {
  try {
    let Compiler = new StdCompilerINIRead().init();
    Compiler.setInput$InT(SrcBuf.getRef());
    Compiler.setWarnCallback(StdCompilerWarnCallback, szName);
    Compiler.Compile$rC4PlayerControlFile(TargetStruct);
    return true;
  } catch ($e1) {
    if ($e1 instanceof StdCompiler$Exception) {
      const pExc = $e1;
      if (!(pExc.Pos.getLength() !== 0)) {
        $.LogF(S("ERROR: %s (in %s)"), pExc.Msg.getData(), szName);
      } else {
        $.LogF(S("ERROR: %s (in %s, %s)"), pExc.Msg.getData(), pExc.Pos.getData(), szName);
      }
      $delete(pExc);
      return false;
    } else {
      throw $e1;
    }
  }
}

export function CompileFromBuf_LogWarn$rC4ScenarioParameterDefs$x$pi8(TargetStruct, SrcBuf, szName) {
  try {
    let Compiler = new StdCompilerINIRead().init();
    Compiler.setInput$InT(SrcBuf.getRef());
    Compiler.setWarnCallback(StdCompilerWarnCallback, szName);
    Compiler.Compile$rC4ScenarioParameterDefs(TargetStruct);
    return true;
  } catch ($e1) {
    if ($e1 instanceof StdCompiler$Exception) {
      const pExc = $e1;
      if (!(pExc.Pos.getLength() !== 0)) {
        $.LogF(S("ERROR: %s (in %s)"), pExc.Msg.getData(), szName);
      } else {
        $.LogF(S("ERROR: %s (in %s, %s)"), pExc.Msg.getData(), pExc.Pos.getData(), szName);
      }
      $delete(pExc);
      return false;
    } else {
      throw $e1;
    }
  }
}

export function CompileFromBuf_LogWarn$rC4Folder$x$pi8(TargetStruct, SrcBuf, szName) {
  try {
    let Compiler = new StdCompilerINIRead().init();
    Compiler.setInput$InT(SrcBuf.getRef());
    Compiler.setWarnCallback(StdCompilerWarnCallback, szName);
    Compiler.Compile$rC4Folder(TargetStruct);
    return true;
  } catch ($e1) {
    if ($e1 instanceof StdCompiler$Exception) {
      const pExc = $e1;
      if (!(pExc.Pos.getLength() !== 0)) {
        $.LogF(S("ERROR: %s (in %s)"), pExc.Msg.getData(), szName);
      } else {
        $.LogF(S("ERROR: %s (in %s, %s)"), pExc.Msg.getData(), pExc.Pos.getData(), szName);
      }
      $delete(pExc);
      return false;
    } else {
      throw $e1;
    }
  }
}

export function DecompileToBuf_Log$mStdNamingAdapt$StdInsertAdapt$StdParameterAdapt$C4Object$pC4ValueNumbers$StdNamingAdapt$C4ValueNumbers$px$pi8(TargetStruct, pOut, szName) {
  if (pOut == null) {
    return false;
  }
  try {
    pOut.Take$mStdStrBuf(DecompileToBuf$StdNamingAdapt$StdInsertAdapt$StdParameterAdapt$C4Object$pC4ValueNumbers$StdNamingAdapt$C4ValueNumbers(TargetStruct));
    return true;
  } catch ($e1) {
    if ($e1 instanceof StdCompiler$Exception) {
      const pExc = $e1;
      $.LogF(S("ERROR: %s (in %s)"), pExc.Msg.getData(), szName);
      $delete(pExc);
      return false;
    } else {
      throw $e1;
    }
  }
}

export function DecompileToBuf_Log$mStdNamingAdapt$C4ObjectInfoCore$px$pi8(TargetStruct, pOut, szName) {
  if (pOut == null) {
    return false;
  }
  try {
    pOut.Take$mStdStrBuf(DecompileToBuf$StdNamingAdapt$C4ObjectInfoCore(TargetStruct));
    return true;
  } catch ($e1) {
    if ($e1 instanceof StdCompiler$Exception) {
      const pExc = $e1;
      $.LogF(S("ERROR: %s (in %s)"), pExc.Msg.getData(), szName);
      $delete(pExc);
      return false;
    } else {
      throw $e1;
    }
  }
}

export function DecompileToBuf_Log$mStdNamingAdapt$C4Def$px$pi8(TargetStruct, pOut, szName) {
  if (pOut == null) {
    return false;
  }
  try {
    pOut.Take$mStdStrBuf(DecompileToBuf$StdNamingAdapt$C4Def(TargetStruct));
    return true;
  } catch ($e1) {
    if ($e1 instanceof StdCompiler$Exception) {
      const pExc = $e1;
      $.LogF(S("ERROR: %s (in %s)"), pExc.Msg.getData(), szName);
      $delete(pExc);
      return false;
    } else {
      throw $e1;
    }
  }
}

export function DecompileToBuf_Log$mStdParameter2Adapt$C4Game$CompileSettings$pC4ValueNumbers$px$pi8(TargetStruct, pOut, szName) {
  if (pOut == null) {
    return false;
  }
  try {
    pOut.Take$mStdStrBuf(DecompileToBuf$StdParameter2Adapt$C4Game$CompileSettings$pC4ValueNumbers(TargetStruct));
    return true;
  } catch ($e1) {
    if ($e1 instanceof StdCompiler$Exception) {
      const pExc = $e1;
      $.LogF(S("ERROR: %s (in %s)"), pExc.Msg.getData(), szName);
      $delete(pExc);
      return false;
    } else {
      throw $e1;
    }
  }
}

export function DecompileToBuf_Log$rC4PlayerInfoCore$px$pi8(TargetStruct, pOut, szName) {
  if (pOut == null) {
    return false;
  }
  try {
    pOut.Take$mStdStrBuf(DecompileToBuf$C4PlayerInfoCore(TargetStruct));
    return true;
  } catch ($e1) {
    if ($e1 instanceof StdCompiler$Exception) {
      const pExc = $e1;
      $.LogF(S("ERROR: %s (in %s)"), pExc.Msg.getData(), szName);
      $delete(pExc);
      return false;
    } else {
      throw $e1;
    }
  }
}

export function DecompileToBuf_Log$rC4PlayerControlFile$px$pi8(TargetStruct, pOut, szName) {
  if (pOut == null) {
    return false;
  }
  try {
    pOut.Take$mStdStrBuf(DecompileToBuf$C4PlayerControlFile(TargetStruct));
    return true;
  } catch ($e1) {
    if ($e1 instanceof StdCompiler$Exception) {
      const pExc = $e1;
      $.LogF(S("ERROR: %s (in %s)"), pExc.Msg.getData(), szName);
      $delete(pExc);
      return false;
    } else {
      throw $e1;
    }
  }
}

export function StdCompilerWarnCallback(pData, szPosition, szError) {
  let szName = $reinterpVoid(pData, "i8");
  if (szPosition == null || szPosition.a[szPosition.o] === 0) {
    $.DebugLogF(S("WARNING: %s (in %s)"), szError, szName);
  } else {
    $.DebugLogF(S("WARNING: %s (in %s, %s)"), szError, szPosition, szName);
  }
}

export function $init(): void {
}

Object.assign($, { CompileFromBuf$mStdNamingAdapt$C4Network2Reference$x, CompileFromBuf$rC4PacketBase$x, CompileFromBuf$rStdParameterAdapt$C4Scenario$b$x, CompileFromBuf_Log, CompileFromBuf_LogWarn$mStdNamingAdapt$C4Def$x$pi8, CompileFromBuf_LogWarn$mStdNamingAdapt$C4MapFolderData$x$pi8, CompileFromBuf_LogWarn$mStdNamingAdapt$C4ObjectInfoCore$x$pi8, CompileFromBuf_LogWarn$mStdNamingAdapt$C4ParticleDefCore$x$pi8, CompileFromBuf_LogWarn$mStdNamingAdapt$C4PlayerInfoList$x$pi8, CompileFromBuf_LogWarn$mStdNamingAdapt$C4RoundResults$x$pi8, CompileFromBuf_LogWarn$mStdNamingAdapt$C4TeamList$x$pi8, CompileFromBuf_LogWarn$mStdNamingAdapt$StdParameterAdapt$C4GameParameters$pC4Scenario$x$pi8, CompileFromBuf_LogWarn$mStdNamingAdapt$StdParameterAdapt$C4Player$pC4ValueNumbers$x$pi8, CompileFromBuf_LogWarn$mStdNamingAdapt$StdSTLContainerAdapt$list$C4RecordChunk$x$pi8, CompileFromBuf_LogWarn$mStdParameter2Adapt$C4Game$CompileSettings$pC4ValueNumbers$x$pi8, CompileFromBuf_LogWarn$mStdParameterAdapt$C4Scenario$b$x$pi8, CompileFromBuf_LogWarn$mStdParameterAdapt$C4Scenario$b$x$pi8$2, CompileFromBuf_LogWarn$rC4Folder$x$pi8, CompileFromBuf_LogWarn$rC4KeyboardInput$x$pi8, CompileFromBuf_LogWarn$rC4MaterialCore$x$pi8, CompileFromBuf_LogWarn$rC4PlayerControlFile$x$pi8, CompileFromBuf_LogWarn$rC4PlayerInfoCore$x$pi8, CompileFromBuf_LogWarn$rC4ScenarioParameterDefs$x$pi8, CompileFunc$rC4Action$pStdCompiler, CompileFunc$rC4Client$pStdCompiler, CompileFunc$rC4ClientCore$pStdCompiler, CompileFunc$rC4ClientList$pStdCompiler, CompileFunc$rC4ClientPlayerInfos$pStdCompiler, CompileFunc$rC4Config$pStdCompiler, CompileFunc$rC4ConfigControls$pStdCompiler, CompileFunc$rC4ConfigDeveloper$pStdCompiler, CompileFunc$rC4ConfigGamepad$pStdCompiler, CompileFunc$rC4ConfigGeneral$pStdCompiler, CompileFunc$rC4ConfigGraphics$pStdCompiler, CompileFunc$rC4ConfigIRC$pStdCompiler, CompileFunc$rC4ConfigLobby$pStdCompiler, CompileFunc$rC4ConfigNetwork$pStdCompiler, CompileFunc$rC4ConfigSecurity$pStdCompiler, CompileFunc$rC4ConfigSound$pStdCompiler, CompileFunc$rC4ConfigStartup$pStdCompiler, CompileFunc$rC4Control$pStdCompiler, CompileFunc$rC4ControlClientJoin$pStdCompiler, CompileFunc$rC4ControlClientRemove$pStdCompiler, CompileFunc$rC4ControlClientUpdate$pStdCompiler, CompileFunc$rC4ControlDebugRec$pStdCompiler, CompileFunc$rC4ControlEMDrawTool$pStdCompiler, CompileFunc$rC4ControlEMMoveObject$pStdCompiler, CompileFunc$rC4ControlEditGraph$pStdCompiler, CompileFunc$rC4ControlJoinPlayer$pStdCompiler, CompileFunc$rC4ControlMenuCommand$pStdCompiler, CompileFunc$rC4ControlMessage$pStdCompiler, CompileFunc$rC4ControlMsgBoardCmd$pStdCompiler, CompileFunc$rC4ControlMsgBoardReply$pStdCompiler, CompileFunc$rC4ControlPlayerAction$pStdCompiler, CompileFunc$rC4ControlPlayerControl$ControlItem$pStdCompiler, CompileFunc$rC4ControlPlayerControl$pStdCompiler, CompileFunc$rC4ControlPlayerInfo$pStdCompiler, CompileFunc$rC4ControlPlayerMouse$pStdCompiler, CompileFunc$rC4ControlPlayerSelect$pStdCompiler, CompileFunc$rC4ControlReInitScenario$pStdCompiler, CompileFunc$rC4ControlRemovePlr$pStdCompiler, CompileFunc$rC4ControlScript$pStdCompiler, CompileFunc$rC4ControlSet$pStdCompiler, CompileFunc$rC4ControlSyncCheck$pStdCompiler, CompileFunc$rC4ControlSynchronize$pStdCompiler, CompileFunc$rC4ControlVote$pStdCompiler, CompileFunc$rC4ControlVoteEnd$pStdCompiler, CompileFunc$rC4CustomKey$pStdCompiler, CompileFunc$rC4Def$pStdCompiler, CompileFunc$rC4DefGraphicsAdapt$pStdCompiler, CompileFunc$rC4DrawTransform$pStdCompiler, CompileFunc$rC4FoWBeam$pStdCompiler, CompileFunc$rC4Folder$pStdCompiler, CompileFunc$rC4FolderHead$pStdCompiler, CompileFunc$rC4GameControlPacket$pStdCompiler, CompileFunc$rC4GameParameters$pStdCompiler, CompileFunc$rC4GameRes$pStdCompiler, CompileFunc$rC4GameResList$pStdCompiler, CompileFunc$rC4GraphicsOverlay$pStdCompiler, CompileFunc$rC4GraphicsOverlayListAdapt$pStdCompiler, CompileFunc$rC4ID$pStdCompiler, CompileFunc$rC4IDList$pStdCompiler, CompileFunc$rC4IDPacket$pStdCompiler, CompileFunc$rC4KeyCodeEx$pStdCompiler, CompileFunc$rC4KeyEventData$pStdCompiler, CompileFunc$rC4KeyboardInput$pStdCompiler, CompileFunc$rC4Landscape$pStdCompiler, CompileFunc$rC4MapFolderData$AccessGfx$pStdCompiler, CompileFunc$rC4MapFolderData$Scenario$pStdCompiler, CompileFunc$rC4MapFolderData$pStdCompiler, CompileFunc$rC4MaterialCore$pStdCompiler, CompileFunc$rC4MaterialReaction$pStdCompiler, CompileFunc$rC4MessageBoardQuery$pStdCompiler, CompileFunc$rC4MusicSystem$pStdCompiler, CompileFunc$rC4NameList$pStdCompiler, CompileFunc$rC4NetFilenameAdapt$pStdCompiler, CompileFunc$rC4Network2Reference$pStdCompiler, CompileFunc$rC4Network2ResChunk$pStdCompiler, CompileFunc$rC4Network2ResChunkData$pStdCompiler, CompileFunc$rC4Network2ResCore$pStdCompiler, CompileFunc$rC4Network2Status$pStdCompiler, CompileFunc$rC4ObjectInfoCore$pStdCompiler, CompileFunc$rC4ObjectListDumpHelper$pStdCompiler, CompileFunc$rC4ObjectPtr$pStdCompiler, CompileFunc$rC4PacketActivateReq$pStdCompiler, CompileFunc$rC4PacketAddr$pStdCompiler, CompileFunc$rC4PacketBase$pStdCompiler, CompileFunc$rC4PacketConn$pStdCompiler, CompileFunc$rC4PacketConnRe$pStdCompiler, CompileFunc$rC4PacketControlPkt$pStdCompiler, CompileFunc$rC4PacketControlReq$pStdCompiler, CompileFunc$rC4PacketCountdown$pStdCompiler, CompileFunc$rC4PacketExecSyncCtrl$pStdCompiler, CompileFunc$rC4PacketFwd$pStdCompiler, CompileFunc$rC4PacketJoinData$pStdCompiler, CompileFunc$rC4PacketLeagueRoundResults$pStdCompiler, CompileFunc$rC4PacketList$pStdCompiler, CompileFunc$rC4PacketPing$pStdCompiler, CompileFunc$rC4PacketPlayerInfoUpdRequest$pStdCompiler, CompileFunc$rC4PacketPostMortem$pStdCompiler, CompileFunc$rC4PacketResDiscover$pStdCompiler, CompileFunc$rC4PacketResRequest$pStdCompiler, CompileFunc$rC4PacketResStatus$pStdCompiler, CompileFunc$rC4PacketSetScenarioParameter$pStdCompiler, CompileFunc$rC4PacketTCPSimOpen$pStdCompiler, CompileFunc$rC4ParticleDefCore$pStdCompiler, CompileFunc$rC4PktDebugRec$pStdCompiler, CompileFunc$rC4Player$HostilitySet$pStdCompiler, CompileFunc$rC4PlayerControl$CSync$ControlDownState$pStdCompiler, CompileFunc$rC4PlayerControl$CSync$pStdCompiler, CompileFunc$rC4PlayerControl$pStdCompiler, CompileFunc$rC4PlayerControlAssignment$KeyComboItem$pStdCompiler, CompileFunc$rC4PlayerControlAssignment$pStdCompiler, CompileFunc$rC4PlayerControlAssignmentSet$pStdCompiler, CompileFunc$rC4PlayerControlAssignmentSets$pStdCompiler, CompileFunc$rC4PlayerControlDef$pStdCompiler, CompileFunc$rC4PlayerControlDefs$pStdCompiler, CompileFunc$rC4PlayerControlFile$pStdCompiler, CompileFunc$rC4PlayerInfo$pStdCompiler, CompileFunc$rC4PlayerInfoCore$pStdCompiler, CompileFunc$rC4PlayerInfoList$pStdCompiler, CompileFunc$rC4RecordChunk$pStdCompiler, CompileFunc$rC4Rect$pStdCompiler, CompileFunc$rC4RoundResult$pStdCompiler, CompileFunc$rC4RoundResults$pStdCompiler, CompileFunc$rC4RoundResultsPlayer$pStdCompiler, CompileFunc$rC4RoundResultsPlayers$pStdCompiler, CompileFunc$rC4SAnimals$pStdCompiler, CompileFunc$rC4SDefinitions$pStdCompiler, CompileFunc$rC4SEnvironment$pStdCompiler, CompileFunc$rC4SLandscape$pStdCompiler, CompileFunc$rC4SPlrStart$pStdCompiler, CompileFunc$rC4SVal$pStdCompiler, CompileFunc$rC4SWeather$pStdCompiler, CompileFunc$rC4ScenarioParameterDef$Option$pStdCompiler, CompileFunc$rC4ScenarioParameterDef$pStdCompiler, CompileFunc$rC4ScenarioParameterDefs$pStdCompiler, CompileFunc$rC4ScenarioParameters$pStdCompiler, CompileFunc$rC4Scoreboard$pStdCompiler, CompileFunc$rC4Sky$pStdCompiler, CompileFunc$rC4StrValAdapt$StdParameterAdapt$StdCopyStrBuf$i32$pStdCompiler, CompileFunc$rC4TargetRect$pStdCompiler, CompileFunc$rC4Team$pStdCompiler, CompileFunc$rC4TeamList$pStdCompiler, CompileFunc$rC4ValueNumbers$pStdCompiler, CompileFunc$rC4Weather$pStdCompiler, CompileFunc$rMatrixAdapt$pStdCompiler, CompileFunc$rStdArrayAdapt$C4LSector$StdParameterAdaptMaker$pC4ValueNumbers$pStdCompiler, CompileFunc$rStdArrayAdapt$i32$StdIntPackAdapt$i32$pStdCompiler, CompileFunc$rStdArrayAdapt$i32$_IdFuncClass$i32$pStdCompiler, CompileFunc$rStdArrayAdapt$pAccessGfx$StdPtrAdapt$AccessGfx$pStdCompiler, CompileFunc$rStdArrayAdapt$pC4ClientPlayerInfos$StdPtrAdapt$C4ClientPlayerInfos$pStdCompiler, CompileFunc$rStdArrayAdapt$pC4GameRes$StdPtrAdapt$C4GameRes$pStdCompiler, CompileFunc$rStdArrayAdapt$pC4PlayerInfo$StdPtrAdapt$C4PlayerInfo$pStdCompiler, CompileFunc$rStdArrayAdapt$pC4RoundResultsPlayer$StdPtrAdapt$C4RoundResultsPlayer$pStdCompiler, CompileFunc$rStdArrayAdapt$pC4Team$StdPtrAdapt$C4Team$pStdCompiler, CompileFunc$rStdArrayAdapt$pScenario$StdPtrAdapt$Scenario$pStdCompiler, CompileFunc$rStdArrayDefaultAdapt$i32$i32$_IdFuncClass$i32$pStdCompiler, CompileFunc$rStdArrayDefaultArrayAdapt$i32$pi32$_IdFuncClass$i32$pStdCompiler, CompileFunc$rStdArrayDefaultArrayAdapt$i32$x$_IdFuncClass$i32$pStdCompiler, CompileFunc$rStdArrayDefaultArrayAdapt$i32$x$lambda$pStdCompiler, CompileFunc$rStdBitfieldAdapt$i32$pStdCompiler, CompileFunc$rStdBitfieldAdapt$u16$pStdCompiler, CompileFunc$rStdBitfieldAdapt$u32$pStdCompiler, CompileFunc$rStdBitfieldAdapt$u8$pStdCompiler, CompileFunc$rStdBuf$pStdCompiler, CompileFunc$rStdCastAdapt$C4Fixed$i32$pStdCompiler, CompileFunc$rStdCastAdapt$i32$i32$pStdCompiler, CompileFunc$rStdCopyBuf$pStdCompiler, CompileFunc$rStdCopyStrBuf$pStdCompiler, CompileFunc$rStdDecompileAdapt$C4PacketBase$pStdCompiler, CompileFunc$rStdDecompileAdapt$C4RecordChunk$pStdCompiler, CompileFunc$rStdEnumAdapt$i32$i32$pStdCompiler, CompileFunc$rStdEnumAdapt$i32$i32$pStdCompiler$2, CompileFunc$rStdEnumAdapt$i32$i32$pStdCompiler$3, CompileFunc$rStdEnumAdapt$i32$u8$pStdCompiler, CompileFunc$rStdEnumAdapt$i32$u8$pStdCompiler$2, CompileFunc$rStdEnumAdapt$i32$u8$pStdCompiler$3, CompileFunc$rStdEnumAdapt$i32$u8$pStdCompiler$4, CompileFunc$rStdEnumAdapt$i32$u8$pStdCompiler$5, CompileFunc$rStdEnumAdapt$i32$u8$pStdCompiler$6, CompileFunc$rStdEnumAdapt$i32$u8$pStdCompiler$7, CompileFunc$rStdInsertAdapt$StdDecompileAdapt$C4PacketBase$u8$pStdCompiler, CompileFunc$rStdInsertAdapt$StdParameterAdapt$C4Object$pC4ValueNumbers$StdNamingAdapt$C4ValueNumbers$pStdCompiler, CompileFunc$rStdInsertAdapt$StdStrBuf$StdBuf$pStdCompiler, CompileFunc$rStdIntAdapt$i32$i32$pStdCompiler, CompileFunc$rStdIntAdapt$i32$i32$pStdCompiler$2, CompileFunc$rStdIntAdapt$i32$i32$pStdCompiler$3, CompileFunc$rStdIntAdapt$i32$u8$pStdCompiler, CompileFunc$rStdIntAdapt$i32$u8$pStdCompiler$2, CompileFunc$rStdIntAdapt$i32$u8$pStdCompiler$3, CompileFunc$rStdIntAdapt$i32$u8$pStdCompiler$4, CompileFunc$rStdIntAdapt$i32$u8$pStdCompiler$5, CompileFunc$rStdIntAdapt$i32$u8$pStdCompiler$6, CompileFunc$rStdIntAdapt$i32$u8$pStdCompiler$7, CompileFunc$rStdIntAdapt$i32$u8$pStdCompiler$8, CompileFunc$rStdIntAdapt$i32$u8$pStdCompiler$9, CompileFunc$rStdIntAdapt$u8$i32$pStdCompiler, CompileFunc$rStdIntPackAdapt$i32$pStdCompiler, CompileFunc$rStdIntPackAdapt$u32$pStdCompiler, CompileFunc$rStdMeshInstance$SerializableValueProvider$pStdCompiler, CompileFunc$rStdNamingAdapt$C4Def$pStdCompiler, CompileFunc$rStdNamingAdapt$C4IDPacket$pStdCompiler, CompileFunc$rStdNamingAdapt$C4MapFolderData$pStdCompiler, CompileFunc$rStdNamingAdapt$C4Network2Reference$pStdCompiler, CompileFunc$rStdNamingAdapt$C4ObjectInfoCore$pStdCompiler, CompileFunc$rStdNamingAdapt$C4ObjectListDumpHelper$pStdCompiler, CompileFunc$rStdNamingAdapt$C4ParticleDefCore$pStdCompiler, CompileFunc$rStdNamingAdapt$C4PlayerInfoList$pStdCompiler, CompileFunc$rStdNamingAdapt$C4RoundResults$pStdCompiler, CompileFunc$rStdNamingAdapt$C4TeamList$pStdCompiler, CompileFunc$rStdNamingAdapt$C4ValueNumbers$pStdCompiler, CompileFunc$rStdNamingAdapt$StdArrayAdapt$C4LSector$StdParameterAdaptMaker$pC4ValueNumbers$pStdCompiler, CompileFunc$rStdNamingAdapt$StdDecompileAdapt$C4RecordChunk$pStdCompiler, CompileFunc$rStdNamingAdapt$StdInsertAdapt$StdParameterAdapt$C4Object$pC4ValueNumbers$StdNamingAdapt$C4ValueNumbers$pStdCompiler, CompileFunc$rStdNamingAdapt$StdParameterAdapt$C4GameParameters$pC4Scenario$pStdCompiler, CompileFunc$rStdNamingAdapt$StdParameterAdapt$C4Object$pC4ValueNumbers$pStdCompiler, CompileFunc$rStdNamingAdapt$StdParameterAdapt$C4Player$pC4ValueNumbers$pStdCompiler, CompileFunc$rStdNamingAdapt$StdParameterAdapt$C4Player$pC4ValueNumbers$pStdCompiler$2, CompileFunc$rStdNamingAdapt$StdSTLContainerAdapt$list$C4RecordChunk$pStdCompiler, CompileFunc$rStdParameter2Adapt$C4AulScriptEngine$b$pC4ValueNumbers$pStdCompiler, CompileFunc$rStdParameter2Adapt$C4Game$CompileSettings$pC4ValueNumbers$pStdCompiler, CompileFunc$rStdParameter2Adapt$C4Game$CompileSettings$pC4ValueNumbers$pStdCompiler$2, CompileFunc$rStdParameterAdapt$AttachedMesh$x$pStdCompiler, CompileFunc$rStdParameterAdapt$C4Command$pC4ValueNumbers$pStdCompiler, CompileFunc$rStdParameterAdapt$C4ConfigGamepad$b$pStdCompiler, CompileFunc$rStdParameterAdapt$C4GameParameters$pC4Scenario$pStdCompiler, CompileFunc$rStdParameterAdapt$C4IDList$b$pStdCompiler, CompileFunc$rStdParameterAdapt$C4Network2Status$b$pStdCompiler, CompileFunc$rStdParameterAdapt$C4NotifyingObjectList$pC4ValueNumbers$pStdCompiler, CompileFunc$rStdParameterAdapt$C4Object$pC4ValueNumbers$pStdCompiler, CompileFunc$rStdParameterAdapt$C4Object$pC4ValueNumbers$pStdCompiler$2, CompileFunc$rStdParameterAdapt$C4ObjectList$pC4ValueNumbers$pStdCompiler, CompileFunc$rStdParameterAdapt$C4Player$pC4ValueNumbers$pStdCompiler, CompileFunc$rStdParameterAdapt$C4Player$pC4ValueNumbers$pStdCompiler$2, CompileFunc$rStdParameterAdapt$C4PropList$pC4ValueNumbers$pStdCompiler, CompileFunc$rStdParameterAdapt$C4PropListNumbered$pC4ValueNumbers$pStdCompiler, CompileFunc$rStdParameterAdapt$C4SGame$b$pStdCompiler, CompileFunc$rStdParameterAdapt$C4SHead$b$pStdCompiler, CompileFunc$rStdParameterAdapt$C4Scenario$b$pStdCompiler, CompileFunc$rStdParameterAdapt$C4Scenario$b$pStdCompiler$2, CompileFunc$rStdParameterAdapt$C4Value$pC4ValueNumbers$pStdCompiler, CompileFunc$rStdParameterAdapt$C4ValueMapData$pC4ValueNumbers$pStdCompiler, CompileFunc$rStdParameterAdapt$C4ValueMapData$pC4ValueNumbers$pStdCompiler$2, CompileFunc$rStdParameterAdapt$StdCopyStrBuf$i32$pStdCompiler, CompileFunc$rStdParameterAdapt$StdDecompileAdapt$StdCopyStrBuf$i32$pStdCompiler, CompileFunc$rStdParameterAdapt$StdMeshInstance$x$pStdCompiler, CompileFunc$rStdParameterAdapt$StdPtrAdapt$C4Object$pC4ValueNumbers$pStdCompiler, CompileFunc$rStdParameterAdapt$StdStrBuf$i32$pStdCompiler, CompileFunc$rStdParameterAdapt$ValidatedStdCopyStrBuf$3$i32$pStdCompiler, CompileFunc$rStdRuntimeValueAdapt$b$pStdCompiler, CompileFunc$rStdSTLContainerAdapt$list$C4RecordChunk$pStdCompiler, CompileFunc$rStdSTLContainerAdapt$vector$C4KeyCodeEx$pStdCompiler, CompileFunc$rStdSTLContainerAdapt$vector$C4MaterialReaction$pStdCompiler, CompileFunc$rStdSTLContainerAdapt$vector$ControlDownState$pStdCompiler, CompileFunc$rStdSTLContainerAdapt$vector$ControlItem$pStdCompiler, CompileFunc$rStdSTLContainerAdapt$vector$KeyComboItem$pStdCompiler, CompileFunc$rStdSTLContainerAdapt$vector$Option$pStdCompiler, CompileFunc$rStdSTLContainerAdapt$vector$i32$pStdCompiler, CompileFunc$rStdStdStringAdapt$pStdCompiler, CompileFunc$rStdStrBuf$pStdCompiler, CompileFunc$rStdStringAdapt$pStdCompiler, CompileFunc$rStdSubMeshInstance$pStdCompiler, CompileFunc$rTransformAdapt$pStdCompiler, CompileFunc$rValidatedStdCopyStrBuf$10$pStdCompiler, CompileFunc$rValidatedStdCopyStrBuf$3$pStdCompiler, CompileFunc$rValidatedStdCopyStrBuf$4$pStdCompiler, CompileFunc$rValueProviderAdapt$pStdCompiler, CompileFunc$rstring$pStdCompiler, CompileNewFunc$rpAccessGfx$pStdCompiler, CompileNewFunc$rpAccessGfx$pStdCompiler$2, CompileNewFunc$rpC4ClientPlayerInfos$pStdCompiler, CompileNewFunc$rpC4ClientPlayerInfos$pStdCompiler$2, CompileNewFunc$rpC4Command$pStdCompiler$rpC4ValueNumbers, CompileNewFunc$rpC4Control$pStdCompiler, CompileNewFunc$rpC4Control$pStdCompiler$2, CompileNewFunc$rpC4DrawTransform$pStdCompiler, CompileNewFunc$rpC4DrawTransform$pStdCompiler$2, CompileNewFunc$rpC4Effect$pStdCompiler$mpC4AulScriptEngine$rpC4ValueNumbers, CompileNewFunc$rpC4Effect$pStdCompiler$mpC4Object$rpC4ValueNumbers, CompileNewFunc$rpC4Effect$pStdCompiler$mpC4PropList$rpC4ValueNumbers, CompileNewFunc$rpC4Effect$pStdCompiler$rpC4PropList$rpC4ValueNumbers, CompileNewFunc$rpC4GameRes$pStdCompiler, CompileNewFunc$rpC4GameRes$pStdCompiler$2, CompileNewFunc$rpC4IDPacket$pStdCompiler, CompileNewFunc$rpC4IDPacket$pStdCompiler$2, CompileNewFunc$rpC4MessageBoardQuery$pStdCompiler, CompileNewFunc$rpC4MessageBoardQuery$pStdCompiler$2, CompileNewFunc$rpC4Network2ResCore$pStdCompiler, CompileNewFunc$rpC4Network2ResCore$pStdCompiler$2, CompileNewFunc$rpC4Object$pStdCompiler$rpC4ValueNumbers, CompileNewFunc$rpC4PktDebugRec$pStdCompiler, CompileNewFunc$rpC4PktDebugRec$pStdCompiler$2, CompileNewFunc$rpC4PlayerInfo$pStdCompiler, CompileNewFunc$rpC4PlayerInfo$pStdCompiler$2, CompileNewFunc$rpC4RoundResultsPlayer$pStdCompiler, CompileNewFunc$rpC4RoundResultsPlayer$pStdCompiler$2, CompileNewFunc$rpC4Team$pStdCompiler, CompileNewFunc$rpC4Team$pStdCompiler$2, CompileNewFunc$rpC4ValueArray$pStdCompiler$mpC4ValueNumbers, CompileNewFunc$rpScenario$pStdCompiler, CompileNewFunc$rpScenario$pStdCompiler$2, CompileNewFunc$rpStdBuf$pStdCompiler, CompileNewFunc$rpStdBuf$pStdCompiler$2, CompileNewFunc$rpStdMeshInstanceAnimationNode$pStdCompiler$pStdMesh, CompileNewFuncCtx$rpStdMeshInstance$pStdCompiler$StdMesh$x, DecompileToBuf$C4Control, DecompileToBuf$C4IDPacket, DecompileToBuf$C4PacketBase, DecompileToBuf$C4PktDebugRec, DecompileToBuf$C4PlayerControlFile, DecompileToBuf$C4PlayerInfoCore, DecompileToBuf$StdInsertAdapt$StdDecompileAdapt$C4PacketBase$u8, DecompileToBuf$StdInsertAdapt$StdStrBuf$StdBuf, DecompileToBuf$StdNamingAdapt$C4Def, DecompileToBuf$StdNamingAdapt$C4IDPacket, DecompileToBuf$StdNamingAdapt$C4ObjectInfoCore, DecompileToBuf$StdNamingAdapt$C4ObjectListDumpHelper, DecompileToBuf$StdNamingAdapt$C4PlayerInfoList, DecompileToBuf$StdNamingAdapt$C4RoundResults, DecompileToBuf$StdNamingAdapt$C4TeamList, DecompileToBuf$StdNamingAdapt$StdArrayAdapt$C4LSector$StdParameterAdaptMaker$pC4ValueNumbers, DecompileToBuf$StdNamingAdapt$StdDecompileAdapt$C4RecordChunk, DecompileToBuf$StdNamingAdapt$StdInsertAdapt$StdParameterAdapt$C4Object$pC4ValueNumbers$StdNamingAdapt$C4ValueNumbers, DecompileToBuf$StdNamingAdapt$StdParameterAdapt$C4GameParameters$pC4Scenario, DecompileToBuf$StdParameter2Adapt$C4Game$CompileSettings$pC4ValueNumbers, DecompileToBuf$StdParameterAdapt$C4Scenario$b, DecompileToBuf_Log$mStdNamingAdapt$C4Def$px$pi8, DecompileToBuf_Log$mStdNamingAdapt$C4ObjectInfoCore$px$pi8, DecompileToBuf_Log$mStdNamingAdapt$StdInsertAdapt$StdParameterAdapt$C4Object$pC4ValueNumbers$StdNamingAdapt$C4ValueNumbers$px$pi8, DecompileToBuf_Log$mStdParameter2Adapt$C4Game$CompileSettings$pC4ValueNumbers$px$pi8, DecompileToBuf_Log$rC4PlayerControlFile$px$pi8, DecompileToBuf_Log$rC4PlayerInfoCore$px$pi8, StdCompiler, StdCompiler$CorruptException, StdCompiler$EOFException, StdCompiler$Exception, StdCompiler$NotFoundException, StdCompilerBinRead, StdCompilerBinWrite, StdCompilerINIRead, StdCompilerINIRead$NameNode, StdCompilerINIWrite, StdCompilerINIWrite$Naming, StdCompilerNull, StdCompilerWarnCallback });
