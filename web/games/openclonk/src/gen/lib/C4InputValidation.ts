// @ts-nocheck
// OpenClonk 36de799: src/lib/C4InputValidation.cpp, src/lib/C4InputValidation.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { StdCopyStrBuf } from './StdBuf.ts';
import { c$isalpha } from '../../rt/libc.ts';
import { $rd, $wr, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $begin, $end, $missing, $vpush } from '../../rt/std.ts';

export class C4StrValAdapt$StdParameterAdapt$StdCopyStrBuf$i32 {
  rValue = null;
  eValType = 0;

  init(rValue, eValType) {
    this.eValType = eValType;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Value$rStdParameterAdapt$StdCopyStrBuf$i32(this.rValue);
    if (pComp.isDeserializer()) {
      ValidateString$rStdStrBuf$i32(this.rValue.GetObj(), this.eValType);
    }
  }

  op_eq(nValue) {
    return this.rValue.op_eq$StdCopyStrBuf(nValue);
  }

  op_assign(nValue) {
    this.rValue.op_assign$StdCopyStrBuf(nValue);
    return this;
  }

  $clone() { return new C4StrValAdapt$StdParameterAdapt$StdCopyStrBuf$i32().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.eValType = o.eValType;
    return this;
  }
}

export class ValidatedStdCopyStrBufBase extends StdCopyStrBuf {

  init$pi8(szCopy) {
    super.init$pi8$b(szCopy);
    return this;
  }

  init$v() {
    return this;
  }

  CompileFunc(pComp, iRawType$ = 0) {
    const iRawType = [iRawType$];
    pComp.Value$StdParameterAdapt$StdCopyStrBuf$i32$2($.mkParAdapt$rStdCopyStrBuf$ri32(this, P(iRawType, 0)));
    if (pComp.isDeserializer()) {
      this.Validate();
    }
  }

  CopyValidated$pi8(szFromVal) {
    this.Copy$pi8(szFromVal);
    this.Validate();
  }

  CopyValidated$StdStrBuf(sFromVal) {
    this.Copy$StdStrBuf(sFromVal);
    this.Validate();
  }

  $dtor() {
    super.$dtor();
  }

  $clone() { return new ValidatedStdCopyStrBufBase().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class ValidatedStdCopyStrBuf$3 extends ValidatedStdCopyStrBufBase {

  init$pi8(szCopy) {
    super.init$pi8(szCopy);
    return this;
  }

  init$v() {
    super.init$v();
    return this;
  }

  Validate() {
    return ValidateString$rStdStrBuf$i32(this, 3);
  }

  op_eq$x(nValue) {
    return this.op_eq$pi8(P(nValue, 0));
  }

  op_assign$x(nValue) {
    this.op_assign$pi8(P(nValue, 0));
    return this;
  }

  $clone() { return new ValidatedStdCopyStrBuf$3().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class ValidatedStdCopyStrBuf$4 extends ValidatedStdCopyStrBufBase {

  init$v() {
    super.init$v();
    return this;
  }

  Validate() {
    return ValidateString$rStdStrBuf$i32(this, 4);
  }

  op_eq$x(nValue) {
    return this.op_eq$pi8(P(nValue, 0));
  }

  op_assign$x$2(nValue) {
    this.op_assign$pi8(P(nValue, 0));
    return this;
  }

  op_assign$x(nValue) {
    this.op_assign$pi8(P(nValue, 0));
    return this;
  }

  $clone() { return new ValidatedStdCopyStrBuf$4().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class ValidatedStdCopyStrBuf$6 extends ValidatedStdCopyStrBufBase {

  Validate(..._) { return $missing("ValidatedStdCopyStrBuf<6>::Validate"); }

  $clone() { return new ValidatedStdCopyStrBuf$6().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class ValidatedStdCopyStrBuf$10 extends ValidatedStdCopyStrBufBase {

  init$v() {
    super.init$v();
    return this;
  }

  Validate() {
    return ValidateString$rStdStrBuf$i32(this, 10);
  }

  op_eq$x(nValue) {
    return this.op_eq$pi8(P(nValue, 0));
  }

  op_assign$x(nValue) {
    this.op_assign$pi8(P(nValue, 0));
    return this;
  }

  $clone() { return new ValidatedStdCopyStrBuf$10().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export function mkStrValAdapt(rValue, eValType) {
  return new C4StrValAdapt$StdParameterAdapt$StdCopyStrBuf$i32().init(rValue, eValType);
}




export function ValidateString$pi8$i32$u64(szString, eOption, iMaxSize) {
  let buf = new $.StdStrBuf();
  buf.Copy$pi8(szString);
  let fInvalid = ValidateString$rStdStrBuf$i32(buf, eOption);
  if (fInvalid) {
    $.SCopy$pi8$pi8$u64(buf.getData(), szString, iMaxSize);
  }
  return fInvalid;
}

export function ValidateString$rStdStrBuf$i32(rsString, eOption) {
  let fValid = true;
  if (!(rsString.getLength() !== 0)) {
    if (eOption !== 3 && eOption !== 5 && eOption !== 10) {
      rsString.Copy$pi8(S("empty"));
      fValid = false;
    }
  }
  switch (eOption) {
    case 0:
      if (rsString.ReplaceChar(47, 95) !== 0) {
        fValid = false;
      }
      if (rsString.ReplaceChar(92, 95) !== 0) {
        fValid = false;
      }
    case 1:
      if (rsString.Replace(S(".."), S("__")) !== 0) {
        fValid = false;
      }
      if ($rd(rsString.getData()) === 47 || $rd(rsString.getData()) === 92) {
        $wr(rsString.getMData(), 0, 95);
        fValid = false;
      }
    case 2:
      if (rsString.ReplaceChar(42, 95) !== 0) {
        fValid = false;
      }
      if (rsString.ReplaceChar(63, 95) !== 0) {
        fValid = false;
      }
      if (rsString.ReplaceChar(60, 95) !== 0) {
        fValid = false;
      }
      if (rsString.ReplaceChar(62, 95) !== 0) {
        fValid = false;
      }
      if (rsString.ReplaceChar(59, 95) !== 0) {
        fValid = false;
      }
      if (rsString.ReplaceChar(124, 95) !== 0) {
        fValid = false;
      }
      if (rsString.ReplaceChar(58, 95) !== 0) {
        fValid = false;
      }
      if ($rd(rsString.getData()) === 58) {
        $wr(rsString.getMData(), 0, 95);
        fValid = false;
      }
      if (rsString.getLength() >= 2 && $rd(rsString.getPtr(1)) === 58) {
        if (eOption !== 2) {
          $wr(rsString.getMPtr(1), 0, 95);
          fValid = false;
        } else if (!(c$isalpha($rd(rsString.getData()) & 0xff) !== 0) || $rd(rsString.getPtr(2)) !== 92 && $rd(rsString.getPtr(2)) !== 47) {
          $wr(rsString.getMData(), 0, $wr(rsString.getMPtr(1), 0, 95));
          fValid = false;
        }
      }
      break;
    case 4:
    case 3:
      if ($.C4Markup.StripMarkup$pStdStrBuf(rsString)) {
        fValid = false;
      }
      if (rsString.TrimSpaces()) {
        fValid = false;
      }
      if (eOption === 4) {
        if (!(rsString.getLength() !== 0)) {
          fValid = false;
          rsString.Copy$pi8(S("Unknown"));
        }
      }
      if (rsString.getLength() > 30) {
        fValid = false;
        rsString.SetLength(30);
      }
      break;
    case 6:
    case 5:
      if (rsString.TrimSpaces()) {
        fValid = false;
      }
      if (eOption === 6) {
        if (!(rsString.getLength() !== 0)) {
          fValid = false;
          rsString.Copy$pi8(S("Unknown"));
        }
      }
      if (rsString.getLength() > 120) {
        fValid = false;
        rsString.SetLength(120);
      }
      break;
    case 7:
      if (rsString.getLength() > 30) {
        fValid = false;
      }
      if (rsString.getLength() < 2) {
        fValid = false;
      }
      if (!rsString.ValidateChars(S("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_^{[]}"), S("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_^{[]}0123456789|-"))) {
        fValid = false;
        rsString.Copy$pi8(S("Guest"));
      }
      if ($.SEqualNoCase(rsString.getData(), S("NickServ")) || $.SEqualNoCase(rsString.getData(), S("ChanServ")) || $.SEqualNoCase(rsString.getData(), S("MemoServ")) || $.SEqualNoCase(rsString.getData(), S("OperServ")) || $.SEqualNoCase(rsString.getData(), S("HelpServ"))) {
        fValid = false;
      }
      if (!fValid) {
        rsString.Copy$pi8(S("Guest"));
      }
      break;
    case 8:
      if (rsString.getLength() > 31) {
        fValid = false;
        rsString.SetLength(31);
      }
      if (rsString.getLength() < 2) {
        fValid = false;
        rsString.Copy$pi8(S("secret"));
      }
      if (rsString.ReplaceChar(32, 95) !== 0) {
        fValid = false;
      }
      break;
    case 9:
      {
        let chans = [];
        let SplitPart = new $.StdStrBuf();
        let tmp = new $.StdCopyStrBuf();
        tmp.Copy$StdStrBuf(rsString);
        while (tmp.SplitAtChar(44, SplitPart)) {
          $vpush(chans, tmp.$clone());
          tmp.Copy$StdStrBuf(SplitPart);
        }
        $vpush(chans, tmp.$clone());
        rsString.Clear();
        for (let it = $begin(chans); it.i < $end(chans).i; it.inc()) {
          if (it.v.getLength() > 32) {
            fValid = false;
            it.v.SetLength(32);
          } else if (it.v.getLength() < 2) {
            fValid = false;
            it.v.Clear();
          } else if ($rd(it.v.getData()) !== 35 && $rd(it.v.getData()) !== 43) {
            fValid = false;
            it.v.InsertChar(35, 0);
          }
          if (it.v.ReplaceChar(32, 95) !== 0) {
            fValid = false;
          }
          rsString.Append$StdStrBuf(it.v);
          if (it.add(1).i < $end(chans).i && it.v.getLength() > 0) {
            rsString.Append$pi8(S(","));
          }
        }
        if (rsString.getLength() < 2) {
          rsString.Copy$pi8(S("#openclonk"));
        }
        break;
      }
    case 10:
      if (rsString.getLength() > 256) {
        fValid = false;
        rsString.SetLength(256);
      }
      break;
    default:
      0;
  }
  if (false) {
    if (!fValid) {
      let szOption = S("unknown");
      switch (eOption) {
        case 0:
          szOption = S("filename");
          break;
        case 1:
          szOption = S("(sub-)filename");
          break;
        case 2:
          szOption = S("free filename");
          break;
        case 4:
          szOption = S("strict name");
          break;
        case 6:
          szOption = S("name");
          break;
        case 3:
          szOption = S("strict name*");
          break;
        case 5:
          szOption = S("name*");
          break;
        case 7:
          szOption = S("IRC nick");
          break;
        case 8:
          szOption = S("IRC password");
          break;
        case 9:
          szOption = S("IRC channel");
          break;
        case 10:
          szOption = S("Comment");
          break;
      }
      $.LogF(S("WARNING: Adjusted invalid user input for \"%s\" to \"%s\""), szOption, rsString.getData());
    }
  }
  return !fValid;
}

export function ValidateFilename(szFilename, iMaxSize = 4096) {
  return ValidateString$pi8$i32$u64(szFilename, 0 /*VAL_Filename*/, iMaxSize);
}

export function ValidateInt(riVal, iMinVal, iMaxVal) {
  if (riVal.a[riVal.o] < iMinVal) {
    riVal.a[riVal.o] = iMinVal;
    return false;
  } else if (riVal.a[riVal.o] > iMaxVal) {
    riVal.a[riVal.o] = iMaxVal;
    return false;
  } else {
    return true;
  }
}

export function $init(): void {
  $.C4MaxName$C4InputValidation = 30;
  $.C4MaxLongName$C4InputValidation = 120;
  $.C4MaxComment$C4InputValidation = 256;
}

Object.assign($, { C4StrValAdapt$StdParameterAdapt$StdCopyStrBuf$i32, ValidateFilename, ValidateInt, ValidateString$pi8$i32$u64, ValidateString$rStdStrBuf$i32, ValidatedStdCopyStrBuf$10, ValidatedStdCopyStrBuf$3, ValidatedStdCopyStrBuf$4, ValidatedStdCopyStrBuf$6, ValidatedStdCopyStrBufBase, mkStrValAdapt });
