// @ts-nocheck
// OpenClonk 36de799: src/lib/StdAdaptors.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { c$memcpy } from '../../rt/libc.ts';
import { $oidx, $tmp, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete, $throw } from '../../rt/std.ts';

export class StdBasicPtrAdapt$C4ValueArray {
  rpObj = null;
  fAllowNull = false;
  szNaming = null;

  init(rpObj, fAllowNull, szNaming) {
    this.rpObj = rpObj;
    this.fAllowNull = fAllowNull;
    this.szNaming = szNaming;
    return this;
  }

  $clone() { return new StdBasicPtrAdapt$C4ValueArray().$assign(this); }
  $assign(o) {
    this.rpObj = o.rpObj;
    this.fAllowNull = o.fAllowNull;
    this.szNaming = o.szNaming;
    return this;
  }
}

export class StdDecompileAdapt$C4ValueArray {
  rValue = null;

  init(rValue) {
    this.rValue = rValue;
    return this;
  }

  CompileFunc$pStdCompiler$mpC4ValueNumbers(pComp, pars) {
    0;
    pComp.Value$StdParameterAdapt$C4ValueArray$pC4ValueNumbers(mkParAdapt$rC4ValueArray$mpC4ValueNumbers(this.rValue, pars));
  }

  $clone() { return new StdDecompileAdapt$C4ValueArray().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    return this;
  }
}

export class StdNamingAdapt$C4ValueNumbers {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.rValue = rValue;
    this.szName = szName;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rC4ValueNumbers(this.rValue);
    } catch ($e1) {
      if ($e1 instanceof $.StdCompiler$Exception) {
        pComp.NameEnd(true);
        $throw($e1);
      } else {
        throw $e1;
      }
    }
    pComp.NameEnd();
  }

  $clone() { return new StdNamingAdapt$C4ValueNumbers().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdParameter2Adapt$C4Effect$pC4AulScriptEngine$pC4ValueNumbers {
  rObj = null;
  rPar1 = null;
  rPar2 = null;

  init(rObj, rPar1, rPar2) {
    this.rObj = rObj;
    this.rPar1 = rPar1;
    this.rPar2 = $tmp(rPar2.a[rPar2.o]);
    return this;
  }

  CompileFunc(pComp) {
    this.rObj.CompileFunc$pStdCompiler$pC4PropList$pC4ValueNumbers(pComp, this.rPar1, this.rPar2.a[this.rPar2.o]);
  }

  $clone() { return new StdParameter2Adapt$C4Effect$pC4AulScriptEngine$pC4ValueNumbers().$assign(this); }
  $assign(o) {
    this.rObj = o.rObj;
    this.rPar1 = o.rPar1;
    this.rPar2 = o.rPar2;
    return this;
  }
}

export class StdParameter2Adapt$C4Effect$pC4PropList$pC4ValueNumbers {
  rObj = null;
  rPar1 = null;
  rPar2 = null;

  init(rObj, rPar1, rPar2) {
    this.rObj = rObj;
    this.rPar1 = $tmp(rPar1.a[rPar1.o]);
    this.rPar2 = $tmp(rPar2.a[rPar2.o]);
    return this;
  }

  CompileFunc(pComp) {
    this.rObj.CompileFunc$pStdCompiler$pC4PropList$pC4ValueNumbers(pComp, this.rPar1.a[this.rPar1.o], this.rPar2.a[this.rPar2.o]);
  }

  $clone() { return new StdParameter2Adapt$C4Effect$pC4PropList$pC4ValueNumbers().$assign(this); }
  $assign(o) {
    this.rObj = o.rObj;
    this.rPar1 = o.rPar1;
    this.rPar2 = o.rPar2;
    return this;
  }
}

export class StdParameter2Adapt$C4Effect$pC4PropList$pC4ValueNumbers$2 {
  rObj = null;
  rPar1 = null;
  rPar2 = null;

  init(rObj, rPar1, rPar2) {
    this.rObj = rObj;
    this.rPar1 = rPar1;
    this.rPar2 = $tmp(rPar2.a[rPar2.o]);
    return this;
  }

  CompileFunc(pComp) {
    this.rObj.CompileFunc$pStdCompiler$pC4PropList$pC4ValueNumbers(pComp, this.rPar1, this.rPar2.a[this.rPar2.o]);
  }

  $clone() { return new StdParameter2Adapt$C4Effect$pC4PropList$pC4ValueNumbers$2().$assign(this); }
  $assign(o) {
    this.rObj = o.rObj;
    this.rPar1 = o.rPar1;
    this.rPar2 = o.rPar2;
    return this;
  }
}

export class StdParameter2Adapt$StdDecompileAdapt$C4Effect$pC4AulScriptEngine$pC4ValueNumbers {
  rObj = null;
  rPar1 = null;
  rPar2 = null;

  init(rObj, rPar1, rPar2) {
    this.rObj = rObj;
    this.rPar1 = rPar1;
    this.rPar2 = $tmp(rPar2.a[rPar2.o]);
    return this;
  }

  CompileFunc(pComp) {
    this.rObj.CompileFunc$pStdCompiler$mpC4AulScriptEngine$rpC4ValueNumbers(pComp, this.rPar1, $tmp(this.rPar2.a[this.rPar2.o]));
  }

  $clone() { return new StdParameter2Adapt$StdDecompileAdapt$C4Effect$pC4AulScriptEngine$pC4ValueNumbers().$assign(this); }
  $assign(o) {
    this.rObj = o.rObj;
    this.rPar1 = o.rPar1;
    this.rPar2 = o.rPar2;
    return this;
  }
}

export class StdParameter2Adapt$StdDecompileAdapt$C4Effect$pC4PropList$pC4ValueNumbers {
  rObj = null;
  rPar1 = null;
  rPar2 = null;

  init(rObj, rPar1, rPar2) {
    this.rObj = rObj;
    this.rPar1 = $tmp(rPar1.a[rPar1.o]);
    this.rPar2 = $tmp(rPar2.a[rPar2.o]);
    return this;
  }

  CompileFunc(pComp) {
    this.rObj.CompileFunc$pStdCompiler$rpC4PropList$rpC4ValueNumbers(pComp, $tmp(this.rPar1.a[this.rPar1.o]), $tmp(this.rPar2.a[this.rPar2.o]));
  }

  $clone() { return new StdParameter2Adapt$StdDecompileAdapt$C4Effect$pC4PropList$pC4ValueNumbers().$assign(this); }
  $assign(o) {
    this.rObj = o.rObj;
    this.rPar1 = o.rPar1;
    this.rPar2 = o.rPar2;
    return this;
  }
}

export class StdParameter2Adapt$StdDecompileAdapt$C4Effect$pC4PropList$pC4ValueNumbers$2 {
  rObj = null;
  rPar1 = null;
  rPar2 = null;

  init(rObj, rPar1, rPar2) {
    this.rObj = rObj;
    this.rPar1 = rPar1;
    this.rPar2 = $tmp(rPar2.a[rPar2.o]);
    return this;
  }

  CompileFunc(pComp) {
    this.rObj.CompileFunc$pStdCompiler$mpC4PropList$rpC4ValueNumbers(pComp, this.rPar1, $tmp(this.rPar2.a[this.rPar2.o]));
  }

  $clone() { return new StdParameter2Adapt$StdDecompileAdapt$C4Effect$pC4PropList$pC4ValueNumbers$2().$assign(this); }
  $assign(o) {
    this.rObj = o.rObj;
    this.rPar1 = o.rPar1;
    this.rPar2 = o.rPar2;
    return this;
  }
}

export class StdParameter2Adapt$StdPtrAdapt$C4Effect$pC4AulScriptEngine$pC4ValueNumbers {
  rObj = null;
  rPar1 = null;
  rPar2 = null;

  init(rObj, rPar1, rPar2) {
    this.rObj = rObj;
    this.rPar1 = rPar1;
    this.rPar2 = $tmp(rPar2.a[rPar2.o]);
    return this;
  }

  CompileFunc(pComp) {
    this.rObj.CompileFunc$pStdCompiler$mpC4AulScriptEngine$rpC4ValueNumbers(pComp, this.rPar1, $tmp(this.rPar2.a[this.rPar2.o]));
  }

  $clone() { return new StdParameter2Adapt$StdPtrAdapt$C4Effect$pC4AulScriptEngine$pC4ValueNumbers().$assign(this); }
  $assign(o) {
    this.rObj = o.rObj;
    this.rPar1 = o.rPar1;
    this.rPar2 = o.rPar2;
    return this;
  }
}

export class StdParameter2Adapt$StdPtrAdapt$C4Effect$pC4PropList$pC4ValueNumbers$2 {
  rObj = null;
  rPar1 = null;
  rPar2 = null;

  init(rObj, rPar1, rPar2) {
    this.rObj = rObj;
    this.rPar1 = rPar1;
    this.rPar2 = $tmp(rPar2.a[rPar2.o]);
    return this;
  }

  CompileFunc(pComp) {
    this.rObj.CompileFunc$pStdCompiler$mpC4PropList$rpC4ValueNumbers(pComp, this.rPar1, $tmp(this.rPar2.a[this.rPar2.o]));
  }

  $clone() { return new StdParameter2Adapt$StdPtrAdapt$C4Effect$pC4PropList$pC4ValueNumbers$2().$assign(this); }
  $assign(o) {
    this.rObj = o.rObj;
    this.rPar1 = o.rPar1;
    this.rPar2 = o.rPar2;
    return this;
  }
}

export class StdParameterAdapt$C4PropList$pC4ValueNumbers {
  rObj = null;
  Par = null;

  init(rObj, rPar) {
    this.rObj = rObj;
    this.Par = $tmp(rPar.a[rPar.o]);
    return this;
  }

  CompileFunc(pComp) {
    $.C4PropList.prototype.CompileFunc$pStdCompiler$pC4ValueNumbers.call(this.rObj, pComp, this.Par.a[this.Par.o]);
  }

  $clone() { return new StdParameterAdapt$C4PropList$pC4ValueNumbers().$assign(this); }
  $assign(o) {
    this.rObj = o.rObj;
    this.Par = o.Par;
    return this;
  }
}

export class StdParameterAdapt$C4PropList$pC4ValueNumbers$2 {
  rObj = null;
  Par = null;

  init(rObj, rPar) {
    this.rObj = rObj;
    this.Par = rPar;
    return this;
  }

  CompileFunc(pComp) {
    $.C4PropList.prototype.CompileFunc$pStdCompiler$pC4ValueNumbers.call(this.rObj, pComp, this.Par);
  }

  $clone() { return new StdParameterAdapt$C4PropList$pC4ValueNumbers$2().$assign(this); }
  $assign(o) {
    this.rObj = o.rObj;
    this.Par = o.Par;
    return this;
  }
}

export class StdParameterAdapt$C4Property$pC4ValueNumbers {
  rObj = null;
  Par = null;

  init(rObj, rPar) {
    this.rObj = rObj;
    this.Par = $tmp(rPar.a[rPar.o]);
    return this;
  }

  CompileFunc(pComp) {
    this.rObj.CompileFunc(pComp, this.Par.a[this.Par.o]);
  }

  $clone() { return new StdParameterAdapt$C4Property$pC4ValueNumbers().$assign(this); }
  $assign(o) {
    this.rObj = o.rObj;
    this.Par = o.Par;
    return this;
  }
}

export class StdParameterAdapt$C4Set$C4Property$pC4ValueNumbers {
  rObj = null;
  Par = null;

  init(rObj, rPar) {
    this.rObj = rObj;
    this.Par = $tmp(rPar.a[rPar.o]);
    return this;
  }

  CompileFunc(pComp) {
    this.rObj.CompileFunc(pComp, this.Par.a[this.Par.o]);
  }

  $clone() { return new StdParameterAdapt$C4Set$C4Property$pC4ValueNumbers().$assign(this); }
  $assign(o) {
    this.rObj = o.rObj;
    this.Par = o.Par;
    return this;
  }
}

export class StdParameterAdapt$C4Value$pC4ValueNumbers {
  rObj = null;
  Par = null;

  init(rObj, rPar) {
    this.rObj = rObj;
    this.Par = $tmp(rPar.a[rPar.o]);
    return this;
  }

  CompileFunc(pComp) {
    this.rObj.CompileFunc(pComp, this.Par.a[this.Par.o]);
  }

  op_assign(nValue) {
    this.rObj.$assign(nValue);
    return this;
  }

  $clone() { return new StdParameterAdapt$C4Value$pC4ValueNumbers().$assign(this); }
  $assign(o) {
    this.rObj = o.rObj;
    this.Par = o.Par;
    return this;
  }
}

export class StdParameterAdapt$C4ValueArray$pC4ValueNumbers {
  rObj = null;
  Par = null;

  init(rObj, rPar) {
    this.rObj = rObj;
    this.Par = rPar;
    return this;
  }

  CompileFunc(pComp) {
    this.rObj.CompileFunc(pComp, this.Par);
  }

  $clone() { return new StdParameterAdapt$C4ValueArray$pC4ValueNumbers().$assign(this); }
  $assign(o) {
    this.rObj = o.rObj;
    this.Par = o.Par;
    return this;
  }
}

export class StdParameterAdapt$C4ValueMapData$pC4ValueNumbers {
  rObj = null;
  Par = null;

  init(rObj, rPar) {
    this.rObj = rObj;
    this.Par = $tmp(rPar.a[rPar.o]);
    return this;
  }

  CompileFunc(pComp) {
    this.rObj.CompileFunc(pComp, this.Par.a[this.Par.o]);
  }

  op_eq(nValue) {
    return this.rObj.op_eq(nValue);
  }

  op_assign(nValue) {
    this.rObj.$assign(nValue);
    return this;
  }

  $clone() { return new StdParameterAdapt$C4ValueMapData$pC4ValueNumbers().$assign(this); }
  $assign(o) {
    this.rObj = o.rObj;
    this.Par = o.Par;
    return this;
  }
}

export class StdParameterAdapt$StdDecompileAdapt$C4PropList$pC4ValueNumbers {
  rObj = null;
  Par = null;

  init(rObj, rPar) {
    this.rObj = rObj;
    this.Par = rPar;
    return this;
  }

  CompileFunc(pComp) {
    this.rObj.CompileFunc$pStdCompiler$mpC4ValueNumbers(pComp, this.Par);
  }

  $clone() { return new StdParameterAdapt$StdDecompileAdapt$C4PropList$pC4ValueNumbers().$assign(this); }
  $assign(o) {
    this.rObj = o.rObj;
    this.Par = o.Par;
    return this;
  }
}

export class StdParameterAdapt$StdDecompileAdapt$C4ValueArray$pC4ValueNumbers {
  rObj = null;
  Par = null;

  init(rObj, rPar) {
    this.rObj = rObj;
    this.Par = rPar;
    return this;
  }

  CompileFunc(pComp) {
    this.rObj.CompileFunc$pStdCompiler$mpC4ValueNumbers(pComp, this.Par);
  }

  $clone() { return new StdParameterAdapt$StdDecompileAdapt$C4ValueArray$pC4ValueNumbers().$assign(this); }
  $assign(o) {
    this.rObj = o.rObj;
    this.Par = o.Par;
    return this;
  }
}

export class StdParameterAdapt$StdPtrAdapt$C4PropList$pC4ValueNumbers {
  rObj = null;
  Par = null;

  init(rObj, rPar) {
    this.rObj = rObj;
    this.Par = rPar;
    return this;
  }

  CompileFunc(pComp) {
    this.rObj.CompileFunc$pStdCompiler$mpC4ValueNumbers(pComp, this.Par);
  }

  $clone() { return new StdParameterAdapt$StdPtrAdapt$C4PropList$pC4ValueNumbers().$assign(this); }
  $assign(o) {
    this.rObj = o.rObj;
    this.Par = o.Par;
    return this;
  }
}

export class StdParameterAdapt$StdPtrAdapt$C4ValueArray$pC4ValueNumbers {
  rObj = null;
  Par = null;

  init(rObj, rPar) {
    this.rObj = rObj;
    this.Par = rPar;
    return this;
  }

  CompileFunc(pComp) {
    this.rObj.CompileFunc$pStdCompiler$mpC4ValueNumbers(pComp, this.Par);
  }

  $clone() { return new StdParameterAdapt$StdPtrAdapt$C4ValueArray$pC4ValueNumbers().$assign(this); }
  $assign(o) {
    this.rObj = o.rObj;
    this.Par = o.Par;
    return this;
  }
}

export class StdParameterAdapt$StdStrBuf$i32$2 {
  rObj = null;
  Par = null;

  init(rObj, rPar) {
    this.rObj = rObj;
    this.Par = rPar;
    return this;
  }

  CompileFunc(pComp) {
    $.StdStrBuf.prototype.CompileFunc.call(this.rObj, pComp, this.Par);
  }

  $clone() { return new StdParameterAdapt$StdStrBuf$i32$2().$assign(this); }
  $assign(o) {
    this.rObj = o.rObj;
    this.Par = o.Par;
    return this;
  }
}

export class StdDefaultAdapt$StdParameterAdapt$C4Value$pC4ValueNumbers$C4Value {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdParameterAdapt$C4Value$pC4ValueNumbers(this.rValue);
    } catch ($e1) {
      if ($e1 instanceof $.StdCompiler$NotFoundException) {
        const pEx = $e1;
        this.rValue.op_assign(this.rDefault);
        $delete(pEx);
      } else {
        throw $e1;
      }
    }
  }

  $clone() { return new StdDefaultAdapt$StdParameterAdapt$C4Value$pC4ValueNumbers$C4Value().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdParameterAdapt$C4ValueMapData$pC4ValueNumbers$C4ValueMapData {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdParameterAdapt$C4ValueMapData$pC4ValueNumbers(this.rValue);
    } catch ($e1) {
      if ($e1 instanceof $.StdCompiler$NotFoundException) {
        const pEx = $e1;
        this.rValue.op_assign(this.rDefault);
        $delete(pEx);
      } else {
        throw $e1;
      }
    }
  }

  $clone() { return new StdDefaultAdapt$StdParameterAdapt$C4ValueMapData$pC4ValueNumbers$C4ValueMapData().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$i32$i32 {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$ri32(this.rValue);
    } catch ($e1) {
      if ($e1 instanceof $.StdCompiler$NotFoundException) {
        const pEx = $e1;
        this.rValue.a[this.rValue.o] = this.rDefault;
        $delete(pEx);
      } else {
        throw $e1;
      }
    }
  }

  $clone() { return new StdDefaultAdapt$i32$i32().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdNamingAdapt$StdParameterAdapt$C4PropList$pC4ValueNumbers {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.rValue = rValue;
    this.szName = szName;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rStdParameterAdapt$C4PropList$pC4ValueNumbers$2(this.rValue);
    } catch ($e1) {
      if ($e1 instanceof $.StdCompiler$Exception) {
        pComp.NameEnd(true);
        $throw($e1);
      } else {
        throw $e1;
      }
    }
    pComp.NameEnd();
  }

  $clone() { return new StdNamingAdapt$StdParameterAdapt$C4PropList$pC4ValueNumbers().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdParameterAdapt$C4ValueMapData$pC4ValueNumbers$C4ValueMapData {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.rValue = rValue;
    this.szName = szName;
    this.rDefault = rDefault;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    return this;
  }

  CompileFunc(pComp) {
    if (pComp.hasNaming() && pComp.isSerializer() && this.rValue.op_eq(this.rDefault) && !this.fStoreDefault) {
      if (pComp.Default(this.szName)) {
        return;
      }
    }
    try {
      if (pComp.Name(this.szName)) {
        if (this.fPrefillDefault && pComp.isDeserializer()) {
          this.rValue.op_assign(this.rDefault);
        }
        pComp.Value$StdDefaultAdapt$StdParameterAdapt$C4ValueMapData$pC4ValueNumbers$C4ValueMapData(mkDefaultAdapt$rStdParameterAdapt$C4ValueMapData$pC4ValueNumbers$C4ValueMapData(this.rValue, this.rDefault));
      } else {
        this.rValue.op_assign(this.rDefault);
      }
    } catch ($e1) {
      if ($e1 instanceof $.StdCompiler$Exception) {
        pComp.NameEnd(true);
        $throw($e1);
      } else {
        throw $e1;
      }
    }
    pComp.NameEnd();
  }

  $clone() { return new StdNamingDefaultAdapt$StdParameterAdapt$C4ValueMapData$pC4ValueNumbers$C4ValueMapData().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdDecompileAdapt$C4Effect {
  rValue = null;

  init(rValue) {
    this.rValue = rValue;
    return this;
  }

  CompileFunc$pStdCompiler$rpC4PropList$rpC4ValueNumbers(pComp, pars, pars$2) {
    0;
    pComp.Value$StdParameter2Adapt$C4Effect$pC4PropList$pC4ValueNumbers$2(mkParAdapt$rC4Effect$rpC4PropList$rpC4ValueNumbers(this.rValue, $tmp(pars.a[pars.o]), $tmp(pars$2.a[pars$2.o])));
  }

  CompileFunc$pStdCompiler$mpC4AulScriptEngine$rpC4ValueNumbers(pComp, pars, pars$2) {
    0;
    pComp.Value$StdParameter2Adapt$C4Effect$pC4AulScriptEngine$pC4ValueNumbers(mkParAdapt$rC4Effect$mpC4AulScriptEngine$rpC4ValueNumbers(this.rValue, pars, $tmp(pars$2.a[pars$2.o])));
  }

  CompileFunc$pStdCompiler$mpC4PropList$rpC4ValueNumbers(pComp, pars, pars$2) {
    0;
    pComp.Value$StdParameter2Adapt$C4Effect$pC4PropList$pC4ValueNumbers(mkParAdapt$rC4Effect$mpC4PropList$rpC4ValueNumbers(this.rValue, pars, $tmp(pars$2.a[pars$2.o])));
  }

  $clone() { return new StdDecompileAdapt$C4Effect().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    return this;
  }
}

export class StdDecompileAdapt$C4PropList {
  rValue = null;

  init(rValue) {
    this.rValue = rValue;
    return this;
  }

  CompileFunc$pStdCompiler$mpC4ValueNumbers(pComp, pars) {
    0;
    pComp.Value$StdParameterAdapt$C4PropList$pC4ValueNumbers(mkParAdapt$rC4PropList$mpC4ValueNumbers(this.rValue, pars));
  }

  $clone() { return new StdDecompileAdapt$C4PropList().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    return this;
  }
}

export class StdCastAdapt$C4Fixed$i32 {
  rValue = null;

  init(rValue) {
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    const vVal = [0];
    c$memcpy(P(vVal, 0), this.rValue, 4);
    pComp.Value$ri32(P(vVal, 0));
    c$memcpy(this.rValue, P(vVal, 0), 4);
  }

  $clone() { return new StdCastAdapt$C4Fixed$i32().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    return this;
  }
}

export class StdArrayDefaultAdapt$C4Value$C4Value$StdParameterAdaptMaker$pC4ValueNumbers {
  pArray = null;
  iSize = 0;
  rDefault = null;
  map = new StdParameterAdaptMaker$pC4ValueNumbers();

  init(pArray, iSize, rDefault, map) {
    this.pArray = pArray;
    this.iSize = iSize;
    this.rDefault = rDefault;
    this.map = map.$clone();
    return this;
  }

  CompileFunc(pComp) {
    let i = 0;
    let iWrite = this.iSize;
    let deserializing = pComp.isDeserializer();
    if (!deserializing && pComp.hasNaming()) {
      while (iWrite > 0 && $oidx(this.pArray, iWrite - 1).op_eq(this.rDefault)) {
        iWrite = iWrite - 1;
      }
    }
    for (i = 0; i < iWrite; i = i + 1) {
      if (i !== 0) {
        if (!pComp.Separator(1 /*SEP_SEP*/)) {
          break;
        }
      }
      pComp.Value$StdDefaultAdapt$StdParameterAdapt$C4Value$pC4ValueNumbers$C4Value(mkDefaultAdapt$mStdParameterAdapt$C4Value$pC4ValueNumbers$C4Value(this.map.op_call($oidx(this.pArray, i)), this.rDefault));
    }
    if (deserializing) {
      for (; i < this.iSize; i = i + 1) {
        $oidx(this.pArray, i).$assign(this.rDefault);
      }
    }
  }

  $clone() { return new StdArrayDefaultAdapt$C4Value$C4Value$StdParameterAdaptMaker$pC4ValueNumbers().$assign(this); }
  $assign(o) {
    this.pArray = o.pArray;
    this.iSize = o.iSize;
    this.rDefault = o.rDefault;
    this.map.$assign(o.map);
    return this;
  }
}

export class StdParameterAdapt$StdStrBuf$i32 {
  rObj = null;
  Par = null;

  init(rObj, rPar) {
    this.rObj = rObj;
    this.Par = rPar;
    return this;
  }

  CompileFunc(pComp) {
    $.StdStrBuf.prototype.CompileFunc.call(this.rObj, pComp, this.Par);
  }

  $clone() { return new StdParameterAdapt$StdStrBuf$i32().$assign(this); }
  $assign(o) {
    this.rObj = o.rObj;
    this.Par = o.Par;
    return this;
  }
}

export class StdParameterAdaptMaker$pC4ValueNumbers {
  Par = null;

  init(rPar) {
    this.Par = $tmp(rPar.a[rPar.o]);
    return this;
  }

  op_call(rObj) {
    return new StdParameterAdapt$C4Value$pC4ValueNumbers().init(rObj, $tmp(this.Par.a[this.Par.o]));
  }

  $clone() { return new StdParameterAdaptMaker$pC4ValueNumbers().$assign(this); }
  $assign(o) {
    this.Par = o.Par;
    return this;
  }
}

export class StdParameter2Adapt$StdPtrAdapt$C4Effect$pC4PropList$pC4ValueNumbers {
  rObj = null;
  rPar1 = null;
  rPar2 = null;

  init(rObj, rPar1, rPar2) {
    this.rObj = rObj;
    this.rPar1 = $tmp(rPar1.a[rPar1.o]);
    this.rPar2 = $tmp(rPar2.a[rPar2.o]);
    return this;
  }

  CompileFunc(pComp) {
    this.rObj.CompileFunc$pStdCompiler$rpC4PropList$rpC4ValueNumbers(pComp, $tmp(this.rPar1.a[this.rPar1.o]), $tmp(this.rPar2.a[this.rPar2.o]));
  }

  $clone() { return new StdParameter2Adapt$StdPtrAdapt$C4Effect$pC4PropList$pC4ValueNumbers().$assign(this); }
  $assign(o) {
    this.rObj = o.rObj;
    this.rPar1 = o.rPar1;
    this.rPar2 = o.rPar2;
    return this;
  }
}

export class StdBasicPtrAdapt$C4Effect {
  rpObj = null;
  fAllowNull = false;
  szNaming = null;

  init(rpObj, fAllowNull, szNaming) {
    this.rpObj = rpObj;
    this.fAllowNull = fAllowNull;
    this.szNaming = szNaming;
    return this;
  }

  $clone() { return new StdBasicPtrAdapt$C4Effect().$assign(this); }
  $assign(o) {
    this.rpObj = o.rpObj;
    this.fAllowNull = o.fAllowNull;
    this.szNaming = o.szNaming;
    return this;
  }
}

export class StdBasicPtrAdapt$C4PropList {
  rpObj = null;
  fAllowNull = false;
  szNaming = null;

  init(rpObj, fAllowNull, szNaming) {
    this.rpObj = rpObj;
    this.fAllowNull = fAllowNull;
    this.szNaming = szNaming;
    return this;
  }

  $clone() { return new StdBasicPtrAdapt$C4PropList().$assign(this); }
  $assign(o) {
    this.rpObj = o.rpObj;
    this.fAllowNull = o.fAllowNull;
    this.szNaming = o.szNaming;
    return this;
  }
}

export class StdIntPackAdapt$u32 {
  rVal = null;

  init(rVal) {
    this.rVal = rVal;
    return this;
  }

  clearUpper(x) {
    let CLEARBITS = 25;
    return (x << CLEARBITS) >>> 0 >>> CLEARBITS;
  }

  CompileFunc(pComp) {
    if (pComp.hasNaming()) {
      pComp.Value$ru32(this.rVal);
      return;
    }
    let val = 0;
    const tmp = [0];
    if (!pComp.isDeserializer()) {
      val = this.rVal.a[this.rVal.o];
      for (; ; ) {
        tmp[0] = this.clearUpper(val) & 0xff;
        if (this.clearUpper(val) === val) {
          break;
        }
        tmp[0] = (tmp[0] ^ 128) & 0xff;
        pComp.Value$ru8(P(tmp, 0));
        val = val >>> 7;
      }
      pComp.Value$ru8(P(tmp, 0));
    } else {
      pComp.Value$ru8(P(tmp, 0));
      val = this.clearUpper(tmp[0]);
      let i = 7;
      let data = val;
      while ((data & 0xff) !== tmp[0]) {
        pComp.Value$ru8(P(tmp, 0));
        data = this.clearUpper(tmp[0]);
        val = ((data << i) >>> 0 | (val & ((1 << i | 0) - 1 | 0) >>> 0) >>> 0) >>> 0;
        i = i + 7 | 0;
      }
      this.rVal.a[this.rVal.o] = val;
    }
  }

  $clone() { return new StdIntPackAdapt$u32().$assign(this); }
  $assign(o) {
    this.rVal = o.rVal;
    return this;
  }
}

export class StdPtrAdapt$C4ValueArray extends StdBasicPtrAdapt$C4ValueArray {

  init(rpObj, fAllowNull, szNaming = S("Data")) {
    super.init(rpObj, fAllowNull, szNaming);
    return this;
  }

  CompileFunc$pStdCompiler$mpC4ValueNumbers(pComp, pars) {
    StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$C4ValueArray$mpC4ValueNumbers(pComp, this, pars);
  }

  $clone() { return new StdPtrAdapt$C4ValueArray().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class StdPtrAdapt$C4Effect extends StdBasicPtrAdapt$C4Effect {

  init(rpObj, fAllowNull, szNaming) {
    super.init(rpObj, fAllowNull, szNaming);
    return this;
  }

  CompileFunc$pStdCompiler$rpC4PropList$rpC4ValueNumbers(pComp, pars, pars$2) {
    StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$C4Effect$rpC4PropList$rpC4ValueNumbers(pComp, this, $tmp(pars.a[pars.o]), $tmp(pars$2.a[pars$2.o]));
  }

  CompileFunc$pStdCompiler$mpC4AulScriptEngine$rpC4ValueNumbers(pComp, pars, pars$2) {
    StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$C4Effect$mpC4AulScriptEngine$rpC4ValueNumbers(pComp, this, pars, $tmp(pars$2.a[pars$2.o]));
  }

  CompileFunc$pStdCompiler$mpC4PropList$rpC4ValueNumbers(pComp, pars, pars$2) {
    StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$C4Effect$mpC4PropList$rpC4ValueNumbers(pComp, this, pars, $tmp(pars$2.a[pars$2.o]));
  }

  $clone() { return new StdPtrAdapt$C4Effect().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class StdPtrAdapt$C4PropList extends StdBasicPtrAdapt$C4PropList {

  init(rpObj, fAllowNull, szNaming = S("Data")) {
    super.init(rpObj, fAllowNull, szNaming);
    return this;
  }

  CompileFunc$pStdCompiler$mpC4ValueNumbers(pComp, pars) {
    StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$C4PropList$mpC4ValueNumbers(pComp, this, pars);
  }

  $clone() { return new StdPtrAdapt$C4PropList().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export function mkPtrAdapt$rpC4PropList$b(rpObj, fAllowNull) {
  return new StdPtrAdapt$C4PropList().init(rpObj, fAllowNull);
}

export function mkPtrAdapt$rpC4Effect$b(rpObj, fAllowNull) {
  return new StdPtrAdapt$C4Effect().init(rpObj, fAllowNull);
}

export function mkCastAdapt(rValue) {
  return new StdCastAdapt$C4Fixed$i32().init(rValue);
}

export function mkNamingAdapt$mStdParameterAdapt$C4PropList$pC4ValueNumbers$pi8(rValue, szName) {
  return new StdNamingAdapt$StdParameterAdapt$C4PropList$pC4ValueNumbers().init(rValue, szName);
}

export function mkNamingAdapt$mStdParameterAdapt$C4ValueMapData$pC4ValueNumbers$pi8$C4ValueMapData$b$b(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$StdParameterAdapt$C4ValueMapData$pC4ValueNumbers$C4ValueMapData().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$rC4ValueNumbers$pi8(rValue, szName) {
  return new StdNamingAdapt$C4ValueNumbers().init(rValue, szName);
}

export function mkDefaultAdapt$mStdParameterAdapt$C4Value$pC4ValueNumbers$C4Value(rValue, rDefault) {
  return new StdDefaultAdapt$StdParameterAdapt$C4Value$pC4ValueNumbers$C4Value().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdParameterAdapt$C4ValueMapData$pC4ValueNumbers$C4ValueMapData(rValue, rDefault) {
  return new StdDefaultAdapt$StdParameterAdapt$C4ValueMapData$pC4ValueNumbers$C4ValueMapData().init(rValue, rDefault);
}

export function mkDefaultAdapt$ri32$i32(rValue, rDefault) {
  return new StdDefaultAdapt$i32$i32().init(rValue, rDefault);
}

export function mkIntPackAdapt(rVal) {
  return new StdIntPackAdapt$u32().init(rVal);
}

export function mkArrayAdaptMap(pArray, iSize, rDefault, map) {
  return new StdArrayDefaultAdapt$C4Value$C4Value$StdParameterAdaptMaker$pC4ValueNumbers().init(pArray, iSize, rDefault, map);
}

export function mkParAdaptMaker(rPar) {
  return new StdParameterAdaptMaker$pC4ValueNumbers().init($tmp(rPar.a[rPar.o]));
}

export function mkDecompileAdapt$C4PropList(rValue) {
  return new StdDecompileAdapt$C4PropList().init(rValue);
}

export function mkDecompileAdapt$C4ValueArray(rValue) {
  return new StdDecompileAdapt$C4ValueArray().init(rValue);
}

export function mkDecompileAdapt$C4Effect(rValue) {
  return new StdDecompileAdapt$C4Effect().init(rValue);
}

export function mkNamingPtrAdapt(rpObj, szNaming) {
  return new StdPtrAdapt$C4Effect().init(rpObj, true, szNaming);
}

export function mkPtrAdaptNoNull$rpC4PropList(rpObj) {
  return mkPtrAdapt$rpC4PropList$b(rpObj, false);
}

export function mkPtrAdaptNoNull$rpC4ValueArray(rpObj) {
  return mkPtrAdapt$rpC4ValueArray$b(rpObj, false);
}

export function mkPtrAdaptNoNull$rpC4Effect(rpObj) {
  return mkPtrAdapt$rpC4Effect$b(rpObj, false);
}

export function StdPtrAdaptCompileNewFunc$StdPtrAdapt$C4PropList$pStdCompiler$mpC4ValueNumbers(adapt, pComp, pars) {
  $.CompileNewFunc$rpC4PropList$pStdCompiler$pC4ValueNumbers(adapt.rpObj, pComp, pars);
}

export function StdPtrAdaptCompileNewFunc$StdPtrAdapt$C4ValueArray$pStdCompiler$mpC4ValueNumbers(adapt, pComp, pars) {
  $.CompileNewFunc$rpC4ValueArray$pStdCompiler$mpC4ValueNumbers(adapt.rpObj, pComp, pars);
}

export function StdPtrAdaptCompileNewFunc$StdPtrAdapt$C4Effect$pStdCompiler$mpC4PropList$rpC4ValueNumbers(adapt, pComp, pars, pars$2) {
  $.CompileNewFunc$rpC4Effect$pStdCompiler$mpC4PropList$rpC4ValueNumbers(adapt.rpObj, pComp, pars, $tmp(pars$2.a[pars$2.o]));
}

export function StdPtrAdaptCompileNewFunc$StdPtrAdapt$C4Effect$pStdCompiler$mpC4AulScriptEngine$rpC4ValueNumbers(adapt, pComp, pars, pars$2) {
  $.CompileNewFunc$rpC4Effect$pStdCompiler$mpC4AulScriptEngine$rpC4ValueNumbers(adapt.rpObj, pComp, pars, $tmp(pars$2.a[pars$2.o]));
}

export function StdPtrAdaptCompileNewFunc$StdPtrAdapt$C4Effect$pStdCompiler$rpC4PropList$rpC4ValueNumbers(adapt, pComp, pars, pars$2) {
  $.CompileNewFunc$rpC4Effect$pStdCompiler$rpC4PropList$rpC4ValueNumbers(adapt.rpObj, pComp, $tmp(pars.a[pars.o]), $tmp(pars$2.a[pars$2.o]));
}

export function StdPtrAdaptDecompileNewFunc$StdPtrAdapt$C4PropList$pStdCompiler$mpC4ValueNumbers(adapt, pComp, pars) {
  pComp.Value$StdParameterAdapt$StdDecompileAdapt$C4PropList$pC4ValueNumbers(mkParAdapt$mStdDecompileAdapt$C4PropList$mpC4ValueNumbers(mkDecompileAdapt$C4PropList(adapt.rpObj.a[adapt.rpObj.o]), pars));
}

export function StdPtrAdaptDecompileNewFunc$StdPtrAdapt$C4ValueArray$pStdCompiler$mpC4ValueNumbers(adapt, pComp, pars) {
  pComp.Value$StdParameterAdapt$StdDecompileAdapt$C4ValueArray$pC4ValueNumbers(mkParAdapt$mStdDecompileAdapt$C4ValueArray$mpC4ValueNumbers(mkDecompileAdapt$C4ValueArray(adapt.rpObj.a[adapt.rpObj.o]), pars));
}

export function StdPtrAdaptDecompileNewFunc$StdPtrAdapt$C4Effect$pStdCompiler$mpC4PropList$rpC4ValueNumbers(adapt, pComp, pars, pars$2) {
  pComp.Value$StdParameter2Adapt$StdDecompileAdapt$C4Effect$pC4PropList$pC4ValueNumbers(mkParAdapt$mStdDecompileAdapt$C4Effect$mpC4PropList$rpC4ValueNumbers(mkDecompileAdapt$C4Effect(adapt.rpObj.a[adapt.rpObj.o]), pars, $tmp(pars$2.a[pars$2.o])));
}

export function StdPtrAdaptDecompileNewFunc$StdPtrAdapt$C4Effect$pStdCompiler$mpC4AulScriptEngine$rpC4ValueNumbers(adapt, pComp, pars, pars$2) {
  pComp.Value$StdParameter2Adapt$StdDecompileAdapt$C4Effect$pC4AulScriptEngine$pC4ValueNumbers(mkParAdapt$mStdDecompileAdapt$C4Effect$mpC4AulScriptEngine$rpC4ValueNumbers(mkDecompileAdapt$C4Effect(adapt.rpObj.a[adapt.rpObj.o]), pars, $tmp(pars$2.a[pars$2.o])));
}

export function StdPtrAdaptDecompileNewFunc$StdPtrAdapt$C4Effect$pStdCompiler$rpC4PropList$rpC4ValueNumbers(adapt, pComp, pars, pars$2) {
  pComp.Value$StdParameter2Adapt$StdDecompileAdapt$C4Effect$pC4PropList$pC4ValueNumbers$2(mkParAdapt$mStdDecompileAdapt$C4Effect$rpC4PropList$rpC4ValueNumbers(mkDecompileAdapt$C4Effect(adapt.rpObj.a[adapt.rpObj.o]), $tmp(pars.a[pars.o]), $tmp(pars$2.a[pars$2.o])));
}

export function mkParAdapt$mStdPtrAdapt$C4PropList$mpC4ValueNumbers(rObj, rPar) {
  return new StdParameterAdapt$StdPtrAdapt$C4PropList$pC4ValueNumbers().init(rObj, rPar);
}

export function mkParAdapt$mStdPtrAdapt$C4ValueArray$mpC4ValueNumbers(rObj, rPar) {
  return new StdParameterAdapt$StdPtrAdapt$C4ValueArray$pC4ValueNumbers().init(rObj, rPar);
}

export function mkParAdapt$mStdDecompileAdapt$C4PropList$mpC4ValueNumbers(rObj, rPar) {
  return new StdParameterAdapt$StdDecompileAdapt$C4PropList$pC4ValueNumbers().init(rObj, rPar);
}

export function mkParAdapt$mStdDecompileAdapt$C4ValueArray$mpC4ValueNumbers(rObj, rPar) {
  return new StdParameterAdapt$StdDecompileAdapt$C4ValueArray$pC4ValueNumbers().init(rObj, rPar);
}

export function mkParAdapt$mStdStrBuf$mi32(rObj, rPar) {
  return new StdParameterAdapt$StdStrBuf$i32$2().init(rObj, rPar);
}

export function mkParAdapt$rC4PropList$mpC4ValueNumbers(rObj, rPar) {
  return new StdParameterAdapt$C4PropList$pC4ValueNumbers$2().init(rObj, rPar);
}

export function mkParAdapt$rC4PropList$rpC4ValueNumbers(rObj, rPar) {
  return new StdParameterAdapt$C4PropList$pC4ValueNumbers().init(rObj, $tmp(rPar.a[rPar.o]));
}

export function mkParAdapt$rC4Property$rpC4ValueNumbers(rObj, rPar) {
  return new StdParameterAdapt$C4Property$pC4ValueNumbers().init(rObj, $tmp(rPar.a[rPar.o]));
}

export function mkParAdapt$rC4ValueArray$mpC4ValueNumbers(rObj, rPar) {
  return new StdParameterAdapt$C4ValueArray$pC4ValueNumbers().init(rObj, rPar);
}

export function mkParAdapt$rC4ValueMapData$rpC4ValueNumbers(rObj, rPar) {
  return new StdParameterAdapt$C4ValueMapData$pC4ValueNumbers().init(rObj, $tmp(rPar.a[rPar.o]));
}

export function mkParAdapt$rC4Set$C4Property$rpC4ValueNumbers(rObj, rPar) {
  return new StdParameterAdapt$C4Set$C4Property$pC4ValueNumbers().init(rObj, $tmp(rPar.a[rPar.o]));
}

export function mkParAdapt$rC4Value$rpC4ValueNumbers(rObj, rPar) {
  return new StdParameterAdapt$C4Value$pC4ValueNumbers().init(rObj, $tmp(rPar.a[rPar.o]));
}

export function mkParAdapt$rStdStrBuf$mi32(rObj, rPar) {
  return new StdParameterAdapt$StdStrBuf$i32().init(rObj, rPar);
}

export function mkParAdapt$mStdPtrAdapt$C4Effect$mpC4PropList$rpC4ValueNumbers(rObj, rPar1, rPar2) {
  return new StdParameter2Adapt$StdPtrAdapt$C4Effect$pC4PropList$pC4ValueNumbers$2().init(rObj, rPar1, $tmp(rPar2.a[rPar2.o]));
}

export function mkParAdapt$mStdPtrAdapt$C4Effect$mpC4AulScriptEngine$rpC4ValueNumbers(rObj, rPar1, rPar2) {
  return new StdParameter2Adapt$StdPtrAdapt$C4Effect$pC4AulScriptEngine$pC4ValueNumbers().init(rObj, rPar1, $tmp(rPar2.a[rPar2.o]));
}

export function mkParAdapt$mStdPtrAdapt$C4Effect$rpC4PropList$rpC4ValueNumbers(rObj, rPar1, rPar2) {
  return new StdParameter2Adapt$StdPtrAdapt$C4Effect$pC4PropList$pC4ValueNumbers().init(rObj, $tmp(rPar1.a[rPar1.o]), $tmp(rPar2.a[rPar2.o]));
}

export function mkParAdapt$mStdDecompileAdapt$C4Effect$mpC4PropList$rpC4ValueNumbers(rObj, rPar1, rPar2) {
  return new StdParameter2Adapt$StdDecompileAdapt$C4Effect$pC4PropList$pC4ValueNumbers$2().init(rObj, rPar1, $tmp(rPar2.a[rPar2.o]));
}

export function mkParAdapt$mStdDecompileAdapt$C4Effect$mpC4AulScriptEngine$rpC4ValueNumbers(rObj, rPar1, rPar2) {
  return new StdParameter2Adapt$StdDecompileAdapt$C4Effect$pC4AulScriptEngine$pC4ValueNumbers().init(rObj, rPar1, $tmp(rPar2.a[rPar2.o]));
}

export function mkParAdapt$mStdDecompileAdapt$C4Effect$rpC4PropList$rpC4ValueNumbers(rObj, rPar1, rPar2) {
  return new StdParameter2Adapt$StdDecompileAdapt$C4Effect$pC4PropList$pC4ValueNumbers().init(rObj, $tmp(rPar1.a[rPar1.o]), $tmp(rPar2.a[rPar2.o]));
}

export function mkParAdapt$rC4Effect$mpC4PropList$rpC4ValueNumbers(rObj, rPar1, rPar2) {
  return new StdParameter2Adapt$C4Effect$pC4PropList$pC4ValueNumbers$2().init(rObj, rPar1, $tmp(rPar2.a[rPar2.o]));
}

export function mkParAdapt$rC4Effect$mpC4AulScriptEngine$rpC4ValueNumbers(rObj, rPar1, rPar2) {
  return new StdParameter2Adapt$C4Effect$pC4AulScriptEngine$pC4ValueNumbers().init(rObj, rPar1, $tmp(rPar2.a[rPar2.o]));
}

export function mkParAdapt$rC4Effect$rpC4PropList$rpC4ValueNumbers(rObj, rPar1, rPar2) {
  return new StdParameter2Adapt$C4Effect$pC4PropList$pC4ValueNumbers().init(rObj, $tmp(rPar1.a[rPar1.o]), $tmp(rPar2.a[rPar2.o]));
}

export function StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$C4PropList$mpC4ValueNumbers(pComp, adapt, pars) {
  let deserializing = pComp.isDeserializer();
  let fNaming = pComp.hasNaming();
  if (deserializing) {
    $delete(adapt.rpObj.a[adapt.rpObj.o]);
    adapt.rpObj.a[adapt.rpObj.o] = null;
  }
  if (adapt.fAllowNull) {
    if (fNaming) {
      if (!deserializing && adapt.rpObj.a[adapt.rpObj.o] == null) {
        return;
      }
      if (!pComp.Name(adapt.szNaming)) {
        0;
        pComp.NameEnd();
        return;
      }
    } else {
      const fNull = [!(adapt.rpObj.a[adapt.rpObj.o] == null)];
      pComp.Value$rb(P(fNull, 0));
      if (fNull[0]) {
        return;
      }
    }
  } else if (!deserializing) {
    0;
  }
  if (deserializing) {
    StdPtrAdaptCompileNewFunc$StdPtrAdapt$C4PropList$pStdCompiler$mpC4ValueNumbers(adapt, pComp, pars);
  } else {
    StdPtrAdaptDecompileNewFunc$StdPtrAdapt$C4PropList$pStdCompiler$mpC4ValueNumbers(adapt, pComp, pars);
  }
  if (adapt.fAllowNull && fNaming) {
    pComp.NameEnd();
  }
}

export function StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$C4ValueArray$mpC4ValueNumbers(pComp, adapt, pars) {
  let deserializing = pComp.isDeserializer();
  let fNaming = pComp.hasNaming();
  if (deserializing) {
    $delete(adapt.rpObj.a[adapt.rpObj.o]);
    adapt.rpObj.a[adapt.rpObj.o] = null;
  }
  if (adapt.fAllowNull) {
    if (fNaming) {
      if (!deserializing && adapt.rpObj.a[adapt.rpObj.o] == null) {
        return;
      }
      if (!pComp.Name(adapt.szNaming)) {
        0;
        pComp.NameEnd();
        return;
      }
    } else {
      const fNull = [!(adapt.rpObj.a[adapt.rpObj.o] == null)];
      pComp.Value$rb(P(fNull, 0));
      if (fNull[0]) {
        return;
      }
    }
  } else if (!deserializing) {
    0;
  }
  if (deserializing) {
    StdPtrAdaptCompileNewFunc$StdPtrAdapt$C4ValueArray$pStdCompiler$mpC4ValueNumbers(adapt, pComp, pars);
  } else {
    StdPtrAdaptDecompileNewFunc$StdPtrAdapt$C4ValueArray$pStdCompiler$mpC4ValueNumbers(adapt, pComp, pars);
  }
  if (adapt.fAllowNull && fNaming) {
    pComp.NameEnd();
  }
}

export function StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$C4Effect$mpC4PropList$rpC4ValueNumbers(pComp, adapt, pars, pars$2) {
  let deserializing = pComp.isDeserializer();
  let fNaming = pComp.hasNaming();
  if (deserializing) {
    $delete(adapt.rpObj.a[adapt.rpObj.o]);
    adapt.rpObj.a[adapt.rpObj.o] = null;
  }
  if (adapt.fAllowNull) {
    if (fNaming) {
      if (!deserializing && adapt.rpObj.a[adapt.rpObj.o] == null) {
        return;
      }
      if (!pComp.Name(adapt.szNaming)) {
        0;
        pComp.NameEnd();
        return;
      }
    } else {
      const fNull = [!(adapt.rpObj.a[adapt.rpObj.o] == null)];
      pComp.Value$rb(P(fNull, 0));
      if (fNull[0]) {
        return;
      }
    }
  } else if (!deserializing) {
    0;
  }
  if (deserializing) {
    StdPtrAdaptCompileNewFunc$StdPtrAdapt$C4Effect$pStdCompiler$mpC4PropList$rpC4ValueNumbers(adapt, pComp, pars, $tmp(pars$2.a[pars$2.o]));
  } else {
    StdPtrAdaptDecompileNewFunc$StdPtrAdapt$C4Effect$pStdCompiler$mpC4PropList$rpC4ValueNumbers(adapt, pComp, pars, $tmp(pars$2.a[pars$2.o]));
  }
  if (adapt.fAllowNull && fNaming) {
    pComp.NameEnd();
  }
}

export function StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$C4Effect$mpC4AulScriptEngine$rpC4ValueNumbers(pComp, adapt, pars, pars$2) {
  let deserializing = pComp.isDeserializer();
  let fNaming = pComp.hasNaming();
  if (deserializing) {
    $delete(adapt.rpObj.a[adapt.rpObj.o]);
    adapt.rpObj.a[adapt.rpObj.o] = null;
  }
  if (adapt.fAllowNull) {
    if (fNaming) {
      if (!deserializing && adapt.rpObj.a[adapt.rpObj.o] == null) {
        return;
      }
      if (!pComp.Name(adapt.szNaming)) {
        0;
        pComp.NameEnd();
        return;
      }
    } else {
      const fNull = [!(adapt.rpObj.a[adapt.rpObj.o] == null)];
      pComp.Value$rb(P(fNull, 0));
      if (fNull[0]) {
        return;
      }
    }
  } else if (!deserializing) {
    0;
  }
  if (deserializing) {
    StdPtrAdaptCompileNewFunc$StdPtrAdapt$C4Effect$pStdCompiler$mpC4AulScriptEngine$rpC4ValueNumbers(adapt, pComp, pars, $tmp(pars$2.a[pars$2.o]));
  } else {
    StdPtrAdaptDecompileNewFunc$StdPtrAdapt$C4Effect$pStdCompiler$mpC4AulScriptEngine$rpC4ValueNumbers(adapt, pComp, pars, $tmp(pars$2.a[pars$2.o]));
  }
  if (adapt.fAllowNull && fNaming) {
    pComp.NameEnd();
  }
}

export function StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$C4Effect$rpC4PropList$rpC4ValueNumbers(pComp, adapt, pars, pars$2) {
  let deserializing = pComp.isDeserializer();
  let fNaming = pComp.hasNaming();
  if (deserializing) {
    $delete(adapt.rpObj.a[adapt.rpObj.o]);
    adapt.rpObj.a[adapt.rpObj.o] = null;
  }
  if (adapt.fAllowNull) {
    if (fNaming) {
      if (!deserializing && adapt.rpObj.a[adapt.rpObj.o] == null) {
        return;
      }
      if (!pComp.Name(adapt.szNaming)) {
        0;
        pComp.NameEnd();
        return;
      }
    } else {
      const fNull = [!(adapt.rpObj.a[adapt.rpObj.o] == null)];
      pComp.Value$rb(P(fNull, 0));
      if (fNull[0]) {
        return;
      }
    }
  } else if (!deserializing) {
    0;
  }
  if (deserializing) {
    StdPtrAdaptCompileNewFunc$StdPtrAdapt$C4Effect$pStdCompiler$rpC4PropList$rpC4ValueNumbers(adapt, pComp, $tmp(pars.a[pars.o]), $tmp(pars$2.a[pars$2.o]));
  } else {
    StdPtrAdaptDecompileNewFunc$StdPtrAdapt$C4Effect$pStdCompiler$rpC4PropList$rpC4ValueNumbers(adapt, pComp, $tmp(pars.a[pars.o]), $tmp(pars$2.a[pars$2.o]));
  }
  if (adapt.fAllowNull && fNaming) {
    pComp.NameEnd();
  }
}

export function mkPtrAdapt$rpC4ValueArray$b(rpObj, fAllowNull) {
  return new StdPtrAdapt$C4ValueArray().init(rpObj, fAllowNull);
}

export function $init(): void {
}

Object.assign($, { StdArrayDefaultAdapt$C4Value$C4Value$StdParameterAdaptMaker$pC4ValueNumbers, StdBasicPtrAdapt$C4Effect, StdBasicPtrAdapt$C4PropList, StdBasicPtrAdapt$C4ValueArray, StdCastAdapt$C4Fixed$i32, StdDecompileAdapt$C4Effect, StdDecompileAdapt$C4PropList, StdDecompileAdapt$C4ValueArray, StdDefaultAdapt$StdParameterAdapt$C4Value$pC4ValueNumbers$C4Value, StdDefaultAdapt$StdParameterAdapt$C4ValueMapData$pC4ValueNumbers$C4ValueMapData, StdDefaultAdapt$i32$i32, StdIntPackAdapt$u32, StdNamingAdapt$C4ValueNumbers, StdNamingAdapt$StdParameterAdapt$C4PropList$pC4ValueNumbers, StdNamingDefaultAdapt$StdParameterAdapt$C4ValueMapData$pC4ValueNumbers$C4ValueMapData, StdParameter2Adapt$C4Effect$pC4AulScriptEngine$pC4ValueNumbers, StdParameter2Adapt$C4Effect$pC4PropList$pC4ValueNumbers, StdParameter2Adapt$C4Effect$pC4PropList$pC4ValueNumbers$2, StdParameter2Adapt$StdDecompileAdapt$C4Effect$pC4AulScriptEngine$pC4ValueNumbers, StdParameter2Adapt$StdDecompileAdapt$C4Effect$pC4PropList$pC4ValueNumbers, StdParameter2Adapt$StdDecompileAdapt$C4Effect$pC4PropList$pC4ValueNumbers$2, StdParameter2Adapt$StdPtrAdapt$C4Effect$pC4AulScriptEngine$pC4ValueNumbers, StdParameter2Adapt$StdPtrAdapt$C4Effect$pC4PropList$pC4ValueNumbers, StdParameter2Adapt$StdPtrAdapt$C4Effect$pC4PropList$pC4ValueNumbers$2, StdParameterAdapt$C4PropList$pC4ValueNumbers, StdParameterAdapt$C4PropList$pC4ValueNumbers$2, StdParameterAdapt$C4Property$pC4ValueNumbers, StdParameterAdapt$C4Set$C4Property$pC4ValueNumbers, StdParameterAdapt$C4Value$pC4ValueNumbers, StdParameterAdapt$C4ValueArray$pC4ValueNumbers, StdParameterAdapt$C4ValueMapData$pC4ValueNumbers, StdParameterAdapt$StdDecompileAdapt$C4PropList$pC4ValueNumbers, StdParameterAdapt$StdDecompileAdapt$C4ValueArray$pC4ValueNumbers, StdParameterAdapt$StdPtrAdapt$C4PropList$pC4ValueNumbers, StdParameterAdapt$StdPtrAdapt$C4ValueArray$pC4ValueNumbers, StdParameterAdapt$StdStrBuf$i32, StdParameterAdapt$StdStrBuf$i32$2, StdParameterAdaptMaker$pC4ValueNumbers, StdPtrAdapt$C4Effect, StdPtrAdapt$C4PropList, StdPtrAdapt$C4ValueArray, StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$C4Effect$mpC4AulScriptEngine$rpC4ValueNumbers, StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$C4Effect$mpC4PropList$rpC4ValueNumbers, StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$C4Effect$rpC4PropList$rpC4ValueNumbers, StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$C4PropList$mpC4ValueNumbers, StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$C4ValueArray$mpC4ValueNumbers, StdPtrAdaptCompileNewFunc$StdPtrAdapt$C4Effect$pStdCompiler$mpC4AulScriptEngine$rpC4ValueNumbers, StdPtrAdaptCompileNewFunc$StdPtrAdapt$C4Effect$pStdCompiler$mpC4PropList$rpC4ValueNumbers, StdPtrAdaptCompileNewFunc$StdPtrAdapt$C4Effect$pStdCompiler$rpC4PropList$rpC4ValueNumbers, StdPtrAdaptCompileNewFunc$StdPtrAdapt$C4PropList$pStdCompiler$mpC4ValueNumbers, StdPtrAdaptCompileNewFunc$StdPtrAdapt$C4ValueArray$pStdCompiler$mpC4ValueNumbers, StdPtrAdaptDecompileNewFunc$StdPtrAdapt$C4Effect$pStdCompiler$mpC4AulScriptEngine$rpC4ValueNumbers, StdPtrAdaptDecompileNewFunc$StdPtrAdapt$C4Effect$pStdCompiler$mpC4PropList$rpC4ValueNumbers, StdPtrAdaptDecompileNewFunc$StdPtrAdapt$C4Effect$pStdCompiler$rpC4PropList$rpC4ValueNumbers, StdPtrAdaptDecompileNewFunc$StdPtrAdapt$C4PropList$pStdCompiler$mpC4ValueNumbers, StdPtrAdaptDecompileNewFunc$StdPtrAdapt$C4ValueArray$pStdCompiler$mpC4ValueNumbers, mkArrayAdaptMap, mkCastAdapt, mkDecompileAdapt$C4Effect, mkDecompileAdapt$C4PropList, mkDecompileAdapt$C4ValueArray, mkDefaultAdapt$mStdParameterAdapt$C4Value$pC4ValueNumbers$C4Value, mkDefaultAdapt$rStdParameterAdapt$C4ValueMapData$pC4ValueNumbers$C4ValueMapData, mkDefaultAdapt$ri32$i32, mkIntPackAdapt, mkNamingAdapt$mStdParameterAdapt$C4PropList$pC4ValueNumbers$pi8, mkNamingAdapt$mStdParameterAdapt$C4ValueMapData$pC4ValueNumbers$pi8$C4ValueMapData$b$b, mkNamingAdapt$rC4ValueNumbers$pi8, mkNamingPtrAdapt, mkParAdapt$mStdDecompileAdapt$C4Effect$mpC4AulScriptEngine$rpC4ValueNumbers, mkParAdapt$mStdDecompileAdapt$C4Effect$mpC4PropList$rpC4ValueNumbers, mkParAdapt$mStdDecompileAdapt$C4Effect$rpC4PropList$rpC4ValueNumbers, mkParAdapt$mStdDecompileAdapt$C4PropList$mpC4ValueNumbers, mkParAdapt$mStdDecompileAdapt$C4ValueArray$mpC4ValueNumbers, mkParAdapt$mStdPtrAdapt$C4Effect$mpC4AulScriptEngine$rpC4ValueNumbers, mkParAdapt$mStdPtrAdapt$C4Effect$mpC4PropList$rpC4ValueNumbers, mkParAdapt$mStdPtrAdapt$C4Effect$rpC4PropList$rpC4ValueNumbers, mkParAdapt$mStdPtrAdapt$C4PropList$mpC4ValueNumbers, mkParAdapt$mStdPtrAdapt$C4ValueArray$mpC4ValueNumbers, mkParAdapt$mStdStrBuf$mi32, mkParAdapt$rC4Effect$mpC4AulScriptEngine$rpC4ValueNumbers, mkParAdapt$rC4Effect$mpC4PropList$rpC4ValueNumbers, mkParAdapt$rC4Effect$rpC4PropList$rpC4ValueNumbers, mkParAdapt$rC4PropList$mpC4ValueNumbers, mkParAdapt$rC4PropList$rpC4ValueNumbers, mkParAdapt$rC4Property$rpC4ValueNumbers, mkParAdapt$rC4Set$C4Property$rpC4ValueNumbers, mkParAdapt$rC4Value$rpC4ValueNumbers, mkParAdapt$rC4ValueArray$mpC4ValueNumbers, mkParAdapt$rC4ValueMapData$rpC4ValueNumbers, mkParAdapt$rStdStrBuf$mi32, mkParAdaptMaker, mkPtrAdapt$rpC4Effect$b, mkPtrAdapt$rpC4PropList$b, mkPtrAdapt$rpC4ValueArray$b, mkPtrAdaptNoNull$rpC4Effect, mkPtrAdaptNoNull$rpC4PropList, mkPtrAdaptNoNull$rpC4ValueArray });
