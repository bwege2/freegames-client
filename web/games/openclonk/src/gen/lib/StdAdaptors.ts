// @ts-nocheck
// OpenClonk 36de799: src/lib/StdAdaptors.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $u64n } from '../../rt/int.ts';
import { c$memcpy } from '../../rt/libc.ts';
import { $bytesView, $oadd, $oidx, $padd, $tmp, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $begin, $delete, $end, $throw, $vpush, seq_equal } from '../../rt/std.ts';

export class StdArrayAdapt$pC4ClientPlayerInfos$StdPtrAdapt$C4ClientPlayerInfos {
  pArray = null;
  iSize = 0;
  map = null;

  init(pArray, iSize, map) {
    this.pArray = pArray;
    this.iSize = iSize;
    this.map = map;
    return this;
  }

  CompileFunc(pComp) {
    for (let i = 0; i < this.iSize; i = i + 1 | 0) {
      if (i !== 0) {
        pComp.Separator(1 /*SEP_SEP*/);
      }
      pComp.Value$StdPtrAdapt$C4ClientPlayerInfos(this.map($padd(this.pArray, i)));
    }
  }

  $clone() { return new StdArrayAdapt$pC4ClientPlayerInfos$StdPtrAdapt$C4ClientPlayerInfos().$assign(this); }
  $assign(o) {
    this.pArray = o.pArray;
    this.iSize = o.iSize;
    this.map = o.map;
    return this;
  }
}

export class StdArrayAdapt$pAccessGfx$StdPtrAdapt$AccessGfx {
  pArray = null;
  iSize = 0;
  map = null;

  init(pArray, iSize, map) {
    this.pArray = pArray;
    this.iSize = iSize;
    this.map = map;
    return this;
  }

  CompileFunc(pComp) {
    for (let i = 0; i < this.iSize; i = i + 1 | 0) {
      if (i !== 0) {
        pComp.Separator(1 /*SEP_SEP*/);
      }
      pComp.Value$StdPtrAdapt$AccessGfx(this.map($padd(this.pArray, i)));
    }
  }

  $clone() { return new StdArrayAdapt$pAccessGfx$StdPtrAdapt$AccessGfx().$assign(this); }
  $assign(o) {
    this.pArray = o.pArray;
    this.iSize = o.iSize;
    this.map = o.map;
    return this;
  }
}

export class StdArrayDefaultArrayAdapt$i32$x$_IdFuncClass$i32 {
  pArray = null;
  iSize = 0;
  rDefault = null;
  map = new _IdFuncClass$i32();

  init(pArray, iSize, rDefault, map = new _IdFuncClass$i32()) {
    this.pArray = pArray;
    this.iSize = iSize;
    this.map = map.$clone();
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    let i = 0;
    let iWrite = this.iSize;
    let deserializing = pComp.isDeserializer();
    if (!deserializing && pComp.hasNaming()) {
      while (iWrite > 0 && this.pArray.a[this.pArray.o + (iWrite - 1)] === this.rDefault[iWrite - 1]) {
        iWrite = iWrite - 1;
      }
    }
    for (i = 0; i < iWrite; i = i + 1) {
      if (i !== 0) {
        if (!pComp.Separator(1 /*SEP_SEP*/)) {
          break;
        }
      }
      pComp.Value$StdDefaultAdapt$i32$i32(mkDefaultAdapt$ri32$i32(this.map.op_call($padd(this.pArray, i)), this.rDefault[i]));
    }
    if (deserializing) {
      for (; i < this.iSize; i = i + 1) {
        this.pArray.a[this.pArray.o + i] = this.rDefault[i];
      }
    }
  }

  op_eq(pDefaults) {
    for (let i = 0; i < this.iSize; i = i + 1) {
      if (this.pArray.a[this.pArray.o + i] !== pDefaults.a[pDefaults.o + i]) {
        return false;
      }
    }
    return true;
  }

  op_assign(pDefaults) {
    for (let i = 0; i < this.iSize; i = i + 1) {
      this.pArray.a[this.pArray.o + i] = pDefaults.a[pDefaults.o + i];
    }
    return this;
  }

  $clone() { return new StdArrayDefaultArrayAdapt$i32$x$_IdFuncClass$i32().$assign(this); }
  $assign(o) {
    this.pArray = o.pArray;
    this.iSize = o.iSize;
    this.rDefault = o.rDefault;
    this.map.$assign(o.map);
    return this;
  }
}

export class StdArrayDefaultArrayAdapt$i32$x$lambda {
  pArray = null;
  iSize = 0;
  rDefault = null;
  map = null;

  init(pArray, iSize, rDefault, map) {
    this.pArray = pArray;
    this.iSize = iSize;
    this.map = map;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    let i = 0;
    let iWrite = this.iSize;
    let deserializing = pComp.isDeserializer();
    if (!deserializing && pComp.hasNaming()) {
      while (iWrite > 0 && this.pArray.a[this.pArray.o + (iWrite - 1)] === this.rDefault[iWrite - 1]) {
        iWrite = iWrite - 1;
      }
    }
    for (i = 0; i < iWrite; i = i + 1) {
      if (i !== 0) {
        if (!pComp.Separator(1 /*SEP_SEP*/)) {
          break;
        }
      }
      pComp.Value$StdDefaultAdapt$StdBitfieldAdapt$i32$i32(mkDefaultAdapt$mStdBitfieldAdapt$i32$i32(this.map($padd(this.pArray, i)), this.rDefault[i]));
    }
    if (deserializing) {
      for (; i < this.iSize; i = i + 1) {
        this.pArray.a[this.pArray.o + i] = this.rDefault[i];
      }
    }
  }

  op_eq(pDefaults) {
    for (let i = 0; i < this.iSize; i = i + 1) {
      if (this.pArray.a[this.pArray.o + i] !== pDefaults.a[pDefaults.o + i]) {
        return false;
      }
    }
    return true;
  }

  op_assign(pDefaults) {
    for (let i = 0; i < this.iSize; i = i + 1) {
      this.pArray.a[this.pArray.o + i] = pDefaults.a[pDefaults.o + i];
    }
    return this;
  }

  $clone() { return new StdArrayDefaultArrayAdapt$i32$x$lambda().$assign(this); }
  $assign(o) {
    this.pArray = o.pArray;
    this.iSize = o.iSize;
    this.rDefault = o.rDefault;
    this.map = o.map;
    return this;
  }
}

export class StdBasicPtrAdapt$C4ClientPlayerInfos {
  rpObj = null;
  fAllowNull = false;
  szNaming = null;

  init(rpObj, fAllowNull, szNaming) {
    this.fAllowNull = fAllowNull;
    this.szNaming = szNaming;
    this.rpObj = rpObj;
    return this;
  }

  $clone() { return new StdBasicPtrAdapt$C4ClientPlayerInfos().$assign(this); }
  $assign(o) {
    this.rpObj = o.rpObj;
    this.fAllowNull = o.fAllowNull;
    this.szNaming = o.szNaming;
    return this;
  }
}

export class StdBasicPtrAdapt$C4Command {
  rpObj = null;
  fAllowNull = false;
  szNaming = null;

  init(rpObj, fAllowNull, szNaming) {
    this.fAllowNull = fAllowNull;
    this.szNaming = szNaming;
    this.rpObj = rpObj;
    return this;
  }

  $clone() { return new StdBasicPtrAdapt$C4Command().$assign(this); }
  $assign(o) {
    this.rpObj = o.rpObj;
    this.fAllowNull = o.fAllowNull;
    this.szNaming = o.szNaming;
    return this;
  }
}

export class StdBasicPtrAdapt$C4Effect {
  rpObj = null;
  fAllowNull = false;
  szNaming = null;

  init(rpObj, fAllowNull, szNaming) {
    this.fAllowNull = fAllowNull;
    this.szNaming = szNaming;
    this.rpObj = rpObj;
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

export class StdBasicPtrAdapt$C4GameRes {
  rpObj = null;
  fAllowNull = false;
  szNaming = null;

  init(rpObj, fAllowNull, szNaming) {
    this.fAllowNull = fAllowNull;
    this.szNaming = szNaming;
    this.rpObj = rpObj;
    return this;
  }

  $clone() { return new StdBasicPtrAdapt$C4GameRes().$assign(this); }
  $assign(o) {
    this.rpObj = o.rpObj;
    this.fAllowNull = o.fAllowNull;
    this.szNaming = o.szNaming;
    return this;
  }
}

export class StdBasicPtrAdapt$C4IDPacket {
  rpObj = null;
  fAllowNull = false;
  szNaming = null;

  init(rpObj, fAllowNull, szNaming) {
    this.fAllowNull = fAllowNull;
    this.szNaming = szNaming;
    this.rpObj = rpObj;
    return this;
  }

  $clone() { return new StdBasicPtrAdapt$C4IDPacket().$assign(this); }
  $assign(o) {
    this.rpObj = o.rpObj;
    this.fAllowNull = o.fAllowNull;
    this.szNaming = o.szNaming;
    return this;
  }
}

export class StdBasicPtrAdapt$AccessGfx {
  rpObj = null;
  fAllowNull = false;
  szNaming = null;

  init(rpObj, fAllowNull, szNaming) {
    this.fAllowNull = fAllowNull;
    this.szNaming = szNaming;
    this.rpObj = rpObj;
    return this;
  }

  $clone() { return new StdBasicPtrAdapt$AccessGfx().$assign(this); }
  $assign(o) {
    this.rpObj = o.rpObj;
    this.fAllowNull = o.fAllowNull;
    this.szNaming = o.szNaming;
    return this;
  }
}

export class StdBasicPtrAdapt$C4PktDebugRec {
  rpObj = null;
  fAllowNull = false;
  szNaming = null;

  init(rpObj, fAllowNull, szNaming) {
    this.fAllowNull = fAllowNull;
    this.szNaming = szNaming;
    this.rpObj = rpObj;
    return this;
  }

  $clone() { return new StdBasicPtrAdapt$C4PktDebugRec().$assign(this); }
  $assign(o) {
    this.rpObj = o.rpObj;
    this.fAllowNull = o.fAllowNull;
    this.szNaming = o.szNaming;
    return this;
  }
}

export class StdBasicPtrAdapt$C4ValueArray {
  rpObj = null;
  fAllowNull = false;
  szNaming = null;

  init(rpObj, fAllowNull, szNaming) {
    this.fAllowNull = fAllowNull;
    this.szNaming = szNaming;
    this.rpObj = rpObj;
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

export class StdBasicPtrAdapt$StdBuf {
  rpObj = null;
  fAllowNull = false;
  szNaming = null;

  init(rpObj, fAllowNull, szNaming) {
    this.fAllowNull = fAllowNull;
    this.szNaming = szNaming;
    this.rpObj = rpObj;
    return this;
  }

  $clone() { return new StdBasicPtrAdapt$StdBuf().$assign(this); }
  $assign(o) {
    this.rpObj = o.rpObj;
    this.fAllowNull = o.fAllowNull;
    this.szNaming = o.szNaming;
    return this;
  }
}

export class StdBasicPtrAdapt$StdMeshInstanceAnimationNode {
  rpObj = null;
  fAllowNull = false;
  szNaming = null;

  init(rpObj, fAllowNull, szNaming) {
    this.fAllowNull = fAllowNull;
    this.szNaming = szNaming;
    this.rpObj = rpObj;
    return this;
  }

  $clone() { return new StdBasicPtrAdapt$StdMeshInstanceAnimationNode().$assign(this); }
  $assign(o) {
    this.rpObj = o.rpObj;
    this.fAllowNull = o.fAllowNull;
    this.szNaming = o.szNaming;
    return this;
  }
}

export class StdBitfieldAdapt$u32 {
  rVal = null;
  pNames = null;

  init(rVal, pNames) {
    this.pNames = pNames;
    this.rVal = rVal;
    0;
    return this;
  }

  CompileFunc(pComp) {
    if (!pComp.isVerbose()) {
      pComp.Value$ru32(this.rVal);
      return;
    }
    if (!pComp.isDeserializer()) {
      const val = [this.rVal.a[this.rVal.o]];
      let orig_val = this.rVal.a[this.rVal.o];
      let fFirst = true;
      for (let pName = this.pNames; pName.Name != null; pName = $oadd(pName, 1)) {
        if ((pName.Val & val[0]) >>> 0 === pName.Val) {
          if (orig_val !== 0 && pName.Val === 0) {
            continue;
          }
          if (!fFirst) {
            pComp.Separator(11 /*SEP_VLINE*/);
          }
          pComp.String$ppi8$i32(P(pName, "Name"), 2 /*RCT_Idtf*/);
          fFirst = false;
          val[0] = (val[0] & ~pName.Val >>> 0) >>> 0;
        }
      }
      if (val[0] !== 0 || fFirst) {
        if (!fFirst) {
          pComp.Separator(11 /*SEP_VLINE*/);
        }
        pComp.Value$ru32(P(val, 0));
      }
    } else {
      let val = 0;
      do {
        try {
          const tmp = [0];
          pComp.Value$ru32(P(tmp, 0));
          val = (val | tmp[0]) >>> 0;
        } catch ($e3) {
          if ($e3 instanceof $.StdCompiler$NotFoundException) {
            const pEx = $e3;
            $delete(pEx);
            let Name = new $.StdStrBuf();
            pComp.Value$StdParameterAdapt$StdStrBuf$i32$2(mkParAdapt$rStdStrBuf$mi32(Name, 2 /*RCT_Idtf*/));
            let pName = this.pNames;
            for (; pName.Name != null; pName = $oadd(pName, 1)) {
              if (Name.op_eq$pi8(pName.Name)) {
                val = (val | pName.Val) >>> 0;
                break;
              }
            }
            if (pName.Name == null) {
              pComp.Warn(S("Unknown bit name: %s"), Name.getData());
            }
          } else {
            throw $e3;
          }
        }
      } while (pComp.Separator(11 /*SEP_VLINE*/));
      this.rVal.a[this.rVal.o] = val;
    }
  }

  op_eq(nValue) {
    return this.rVal.a[this.rVal.o] === nValue;
  }

  op_assign(nValue) {
    this.rVal.a[this.rVal.o] = nValue;
    return this;
  }

  $clone() { return new StdBitfieldAdapt$u32().$assign(this); }
  $assign(o) {
    this.rVal = o.rVal;
    this.pNames = o.pNames;
    return this;
  }
}

export class StdBitfieldEntry$u32 {
  Name = null;
  Val = 0;

  $clone() { return new StdBitfieldEntry$u32().$assign(this); }
  $assign(o) {
    this.Name = o.Name;
    this.Val = o.Val;
    return this;
  }
}

export class StdCastAdapt$i32$i32 {
  static $layout = [["rValue", 0, "i32", 0]];
  static $size = 4;
  rValue = null;

  init(rValue) {
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    const vVal = Int32Array.of(0);
    c$memcpy(P(vVal, 0), this.rValue, 4);
    pComp.Value$ri32(P(vVal, 0));
    c$memcpy(this.rValue, P(vVal, 0), 4);
  }

  op_eq(nValue) {
    return this.rValue.a[this.rValue.o] === nValue;
  }

  op_assign(nValue) {
    this.rValue.a[this.rValue.o] = nValue;
    return this;
  }

  $clone() { return new StdCastAdapt$i32$i32().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    return this;
  }
}

export class StdDecompileAdapt$C4ClientPlayerInfos {
  rValue = null;

  init(rValue) {
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    0;
    pComp.Value$rC4ClientPlayerInfos(this.rValue);
  }

  $clone() { return new StdDecompileAdapt$C4ClientPlayerInfos().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    return this;
  }
}

export class StdDecompileAdapt$C4Command {
  rValue = null;

  init(rValue) {
    this.rValue = rValue;
    return this;
  }

  CompileFunc$pStdCompiler$rpC4ValueNumbers(pComp, pars) {
    0;
    pComp.Value$StdParameterAdapt$C4Command$pC4ValueNumbers(mkParAdapt$rC4Command$rpC4ValueNumbers(this.rValue, $tmp(pars.a[pars.o])));
  }

  $clone() { return new StdDecompileAdapt$C4Command().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    return this;
  }
}

export class StdDecompileAdapt$C4Control {
  rValue = null;

  init(rValue) {
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    0;
    pComp.Value$rC4Control(this.rValue);
  }

  $clone() { return new StdDecompileAdapt$C4Control().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    return this;
  }
}

export class StdDecompileAdapt$C4Effect {
  rValue = null;

  init(rValue) {
    this.rValue = rValue;
    return this;
  }

  CompileFunc$pStdCompiler$mpC4Object$rpC4ValueNumbers(pComp, pars, pars$2) {
    0;
    pComp.Value$StdParameter2Adapt$C4Effect$pC4Object$pC4ValueNumbers(mkParAdapt$rC4Effect$mpC4Object$rpC4ValueNumbers(this.rValue, pars, $tmp(pars$2.a[pars$2.o])));
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

export class StdDecompileAdapt$C4GameRes {
  rValue = null;

  init(rValue) {
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    0;
    pComp.Value$rC4GameRes(this.rValue);
  }

  $clone() { return new StdDecompileAdapt$C4GameRes().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    return this;
  }
}

export class StdDecompileAdapt$C4IDPacket {
  rValue = null;

  init(rValue) {
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    0;
    pComp.Value$rC4IDPacket(this.rValue);
  }

  $clone() { return new StdDecompileAdapt$C4IDPacket().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    return this;
  }
}

export class StdDecompileAdapt$AccessGfx {
  rValue = null;

  init(rValue) {
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    0;
    pComp.Value$rC4MapFolderData$AccessGfx(this.rValue);
  }

  $clone() { return new StdDecompileAdapt$AccessGfx().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    return this;
  }
}

export class StdDecompileAdapt$C4PktDebugRec {
  rValue = null;

  init(rValue) {
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    0;
    pComp.Value$rC4PktDebugRec(this.rValue);
  }

  $clone() { return new StdDecompileAdapt$C4PktDebugRec().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
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

export class StdDecompileAdapt$StdBuf {
  rValue = null;

  init(rValue) {
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    0;
    pComp.Value$rStdBuf(this.rValue);
  }

  $clone() { return new StdDecompileAdapt$StdBuf().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    return this;
  }
}

export class StdDecompileAdapt$SerializableValueProvider {
  rValue = null;

  init(rValue) {
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    0;
    pComp.Value$rStdMeshInstance$SerializableValueProvider(this.rValue);
  }

  $clone() { return new StdDecompileAdapt$SerializableValueProvider().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    return this;
  }
}

export class StdDecompileAdapt$StdMeshInstanceAnimationNode {
  rValue = null;

  init(rValue) {
    this.rValue = rValue;
    return this;
  }

  CompileFunc$pStdCompiler$pStdMesh(pComp, pars) {
    0;
    pComp.Value$StdParameterAdapt$StdMeshInstanceAnimationNode$pStdMesh(mkParAdapt$rStdMeshInstanceAnimationNode$pStdMesh(this.rValue, pars));
  }

  $clone() { return new StdDecompileAdapt$StdMeshInstanceAnimationNode().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    return this;
  }
}

export class StdDefaultAdapt$C4DefGraphicsAdapt$pC4DefGraphics {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rC4DefGraphicsAdapt(this.rValue);
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

  $clone() { return new StdDefaultAdapt$C4DefGraphicsAdapt$pC4DefGraphics().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$C4DefGraphicsAdapt$pC4DefGraphics$2 {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rC4DefGraphicsAdapt(this.rValue);
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

  $clone() { return new StdDefaultAdapt$C4DefGraphicsAdapt$pC4DefGraphics$2().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$C4Fixed$C4Fixed {
  static $layout = [["rValue.val", 0, "i32", 0], ["rDefault.val", 4, "i32", 0]];
  static $size = 8;
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rC4Fixed(this.rValue);
    } catch ($e1) {
      if ($e1 instanceof $.StdCompiler$NotFoundException) {
        const pEx = $e1;
        this.rValue.$assign(this.rDefault);
        $delete(pEx);
      } else {
        throw $e1;
      }
    }
  }

  $clone() { return new StdDefaultAdapt$C4Fixed$C4Fixed().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$C4Fixed$i32 {
  static $layout = [["rValue.val", 0, "i32", 0], ["rDefault", 4, "i32", 0]];
  static $size = 8;
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rC4Fixed(this.rValue);
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

  $clone() { return new StdDefaultAdapt$C4Fixed$i32().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$C4GraphicsOverlayListAdapt$pC4GraphicsOverlay {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rC4GraphicsOverlayListAdapt(this.rValue);
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

  $clone() { return new StdDefaultAdapt$C4GraphicsOverlayListAdapt$pC4GraphicsOverlay().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$C4ID$C4ID {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rC4ID(this.rValue);
    } catch ($e1) {
      if ($e1 instanceof $.StdCompiler$NotFoundException) {
        const pEx = $e1;
        this.rValue.$assign(this.rDefault);
        $delete(pEx);
      } else {
        throw $e1;
      }
    }
  }

  $clone() { return new StdDefaultAdapt$C4ID$C4ID().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$C4IDList$C4IDList {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rC4IDList(this.rValue);
    } catch ($e1) {
      if ($e1 instanceof $.StdCompiler$NotFoundException) {
        const pEx = $e1;
        this.rValue.$assign(this.rDefault);
        $delete(pEx);
      } else {
        throw $e1;
      }
    }
  }

  $clone() { return new StdDefaultAdapt$C4IDList$C4IDList().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$C4KeyEventData$C4KeyEventData {
  static $layout = [["rValue.iStrength", 0, "i32", 0], ["rValue.game_x", 4, "i32", 0], ["rValue.game_y", 8, "i32", 0], ["rValue.vp_x", 12, "i32", 0], ["rValue.vp_y", 16, "i32", 0], ["rDefault.iStrength", 20, "i32", 0], ["rDefault.game_x", 24, "i32", 0], ["rDefault.game_y", 28, "i32", 0], ["rDefault.vp_x", 32, "i32", 0], ["rDefault.vp_y", 36, "i32", 0]];
  static $size = 40;
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rC4KeyEventData(this.rValue);
    } catch ($e1) {
      if ($e1 instanceof $.StdCompiler$NotFoundException) {
        const pEx = $e1;
        this.rValue.$assign(this.rDefault);
        $delete(pEx);
      } else {
        throw $e1;
      }
    }
  }

  $clone() { return new StdDefaultAdapt$C4KeyEventData$C4KeyEventData().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$C4NameList$C4NameList {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rC4NameList(this.rValue);
    } catch ($e1) {
      if ($e1 instanceof $.StdCompiler$NotFoundException) {
        const pEx = $e1;
        this.rValue.$assign(this.rDefault);
        $delete(pEx);
      } else {
        throw $e1;
      }
    }
  }

  $clone() { return new StdDefaultAdapt$C4NameList$C4NameList().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$C4NetFilenameAdapt$x {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rC4NetFilenameAdapt(this.rValue);
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

  $clone() { return new StdDefaultAdapt$C4NetFilenameAdapt$x().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$C4ObjectPtr$C4ObjectPtr {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rC4ObjectPtr(this.rValue);
    } catch ($e1) {
      if ($e1 instanceof $.StdCompiler$NotFoundException) {
        const pEx = $e1;
        this.rValue.$assign(this.rDefault);
        $delete(pEx);
      } else {
        throw $e1;
      }
    }
  }

  $clone() { return new StdDefaultAdapt$C4ObjectPtr$C4ObjectPtr().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$CSync$CSync {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rC4PlayerControl$CSync(this.rValue);
    } catch ($e1) {
      if ($e1 instanceof $.StdCompiler$NotFoundException) {
        const pEx = $e1;
        this.rValue.$assign(this.rDefault);
        $delete(pEx);
      } else {
        throw $e1;
      }
    }
  }

  $clone() { return new StdDefaultAdapt$CSync$CSync().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$C4PlayerControlAssignmentSets$C4PlayerControlAssignmentSets {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rC4PlayerControlAssignmentSets(this.rValue);
    } catch ($e1) {
      if ($e1 instanceof $.StdCompiler$NotFoundException) {
        const pEx = $e1;
        this.rValue.$assign(this.rDefault);
        $delete(pEx);
      } else {
        throw $e1;
      }
    }
  }

  $clone() { return new StdDefaultAdapt$C4PlayerControlAssignmentSets$C4PlayerControlAssignmentSets().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$C4PlayerControlDefs$C4PlayerControlDefs {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rC4PlayerControlDefs(this.rValue);
    } catch ($e1) {
      if ($e1 instanceof $.StdCompiler$NotFoundException) {
        const pEx = $e1;
        this.rValue.$assign(this.rDefault);
        $delete(pEx);
      } else {
        throw $e1;
      }
    }
  }

  $clone() { return new StdDefaultAdapt$C4PlayerControlDefs$C4PlayerControlDefs().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$C4Rect$C4Rect {
  static $layout = [["rValue.x", 0, "i32", 0], ["rValue.y", 4, "i32", 0], ["rValue.Wdt", 8, "i32", 0], ["rValue.Hgt", 12, "i32", 0], ["rDefault.x", 16, "i32", 0], ["rDefault.y", 20, "i32", 0], ["rDefault.Wdt", 24, "i32", 0], ["rDefault.Hgt", 28, "i32", 0]];
  static $size = 32;
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rC4Rect(this.rValue);
    } catch ($e1) {
      if ($e1 instanceof $.StdCompiler$NotFoundException) {
        const pEx = $e1;
        this.rValue.$assign(this.rDefault);
        $delete(pEx);
      } else {
        throw $e1;
      }
    }
  }

  $clone() { return new StdDefaultAdapt$C4Rect$C4Rect().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$C4RoundResultsPlayers$C4RoundResultsPlayers {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rC4RoundResultsPlayers(this.rValue);
    } catch ($e1) {
      if ($e1 instanceof $.StdCompiler$NotFoundException) {
        const pEx = $e1;
        this.rValue.$assign(this.rDefault);
        $delete(pEx);
      } else {
        throw $e1;
      }
    }
  }

  $clone() { return new StdDefaultAdapt$C4RoundResultsPlayers$C4RoundResultsPlayers().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$C4SVal$C4SVal {
  static $layout = [["rValue.Std", 0, "i32", 0], ["rValue.Rnd", 4, "i32", 0], ["rValue.Min", 8, "i32", 0], ["rValue.Max", 12, "i32", 0], ["rDefault.Std", 16, "i32", 0], ["rDefault.Rnd", 20, "i32", 0], ["rDefault.Min", 24, "i32", 0], ["rDefault.Max", 28, "i32", 0]];
  static $size = 32;
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rC4SVal(this.rValue);
    } catch ($e1) {
      if ($e1 instanceof $.StdCompiler$NotFoundException) {
        const pEx = $e1;
        this.rValue.$assign(this.rDefault);
        $delete(pEx);
      } else {
        throw $e1;
      }
    }
  }

  $clone() { return new StdDefaultAdapt$C4SVal$C4SVal().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$C4StrValAdapt$StdParameterAdapt$StdCopyStrBuf$i32$StdCopyStrBuf {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rC4StrValAdapt$StdParameterAdapt$StdCopyStrBuf$i32(this.rValue);
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

  $clone() { return new StdDefaultAdapt$C4StrValAdapt$StdParameterAdapt$StdCopyStrBuf$i32$StdCopyStrBuf().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$C4TargetRect$C4TargetRect {
  static $layout = [["rValue.x", 0, "i32", 0], ["rValue.y", 4, "i32", 0], ["rValue.Wdt", 8, "i32", 0], ["rValue.Hgt", 12, "i32", 0], ["rValue.tx", 16, "i32", 0], ["rValue.ty", 20, "i32", 0], ["rDefault.x", 24, "i32", 0], ["rDefault.y", 28, "i32", 0], ["rDefault.Wdt", 32, "i32", 0], ["rDefault.Hgt", 36, "i32", 0], ["rDefault.tx", 40, "i32", 0], ["rDefault.ty", 44, "i32", 0]];
  static $size = 48;
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rC4TargetRect(this.rValue);
    } catch ($e1) {
      if ($e1 instanceof $.StdCompiler$NotFoundException) {
        const pEx = $e1;
        this.rValue.$assign(this.rDefault);
        $delete(pEx);
      } else {
        throw $e1;
      }
    }
  }

  $clone() { return new StdDefaultAdapt$C4TargetRect$C4TargetRect().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdArrayAdapt$i32$_IdFuncClass$i32$i32 {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdArrayAdapt$i32$_IdFuncClass$i32(this.rValue);
    } catch ($e1) {
      if ($e1 instanceof $.StdCompiler$NotFoundException) {
        const pEx = $e1;
        this.rValue.op_assign$i32(this.rDefault);
        $delete(pEx);
      } else {
        throw $e1;
      }
    }
  }

  $clone() { return new StdDefaultAdapt$StdArrayAdapt$i32$_IdFuncClass$i32$i32().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdArrayAdapt$i32$_IdFuncClass$i32$x {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdArrayAdapt$i32$_IdFuncClass$i32(this.rValue);
    } catch ($e1) {
      if ($e1 instanceof $.StdCompiler$NotFoundException) {
        const pEx = $e1;
        this.rValue.op_assign$pi32(P(this.rDefault, 0));
        $delete(pEx);
      } else {
        throw $e1;
      }
    }
  }

  $clone() { return new StdDefaultAdapt$StdArrayAdapt$i32$_IdFuncClass$i32$x().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdArrayDefaultArrayAdapt$i32$pi32$_IdFuncClass$i32$pi32 {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdArrayDefaultArrayAdapt$i32$pi32$_IdFuncClass$i32(this.rValue);
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

  $clone() { return new StdDefaultAdapt$StdArrayDefaultArrayAdapt$i32$pi32$_IdFuncClass$i32$pi32().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdArrayDefaultArrayAdapt$i32$x$_IdFuncClass$i32$x {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdArrayDefaultArrayAdapt$i32$x$_IdFuncClass$i32(this.rValue);
    } catch ($e1) {
      if ($e1 instanceof $.StdCompiler$NotFoundException) {
        const pEx = $e1;
        this.rValue.op_assign(P(this.rDefault, 0));
        $delete(pEx);
      } else {
        throw $e1;
      }
    }
  }

  $clone() { return new StdDefaultAdapt$StdArrayDefaultArrayAdapt$i32$x$_IdFuncClass$i32$x().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdArrayDefaultArrayAdapt$i32$x$lambda$x {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdArrayDefaultArrayAdapt$i32$x$lambda(this.rValue);
    } catch ($e1) {
      if ($e1 instanceof $.StdCompiler$NotFoundException) {
        const pEx = $e1;
        this.rValue.op_assign(P(this.rDefault, 0));
        $delete(pEx);
      } else {
        throw $e1;
      }
    }
  }

  $clone() { return new StdDefaultAdapt$StdArrayDefaultArrayAdapt$i32$x$lambda$x().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdBitfieldAdapt$i32$i32 {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdBitfieldAdapt$i32(this.rValue);
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

  $clone() { return new StdDefaultAdapt$StdBitfieldAdapt$i32$i32().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdBitfieldAdapt$i32$i32$2 {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdBitfieldAdapt$i32(this.rValue);
    } catch ($e1) {
      if ($e1 instanceof $.StdCompiler$NotFoundException) {
        const pEx = $e1;
        this.rValue.op_assign$2(this.rDefault);
        $delete(pEx);
      } else {
        throw $e1;
      }
    }
  }

  $clone() { return new StdDefaultAdapt$StdBitfieldAdapt$i32$i32$2().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdBitfieldAdapt$i32$i32$3 {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdBitfieldAdapt$i32(this.rValue);
    } catch ($e1) {
      if ($e1 instanceof $.StdCompiler$NotFoundException) {
        const pEx = $e1;
        this.rValue.op_assign$2(this.rDefault);
        $delete(pEx);
      } else {
        throw $e1;
      }
    }
  }

  $clone() { return new StdDefaultAdapt$StdBitfieldAdapt$i32$i32$3().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdBitfieldAdapt$u32$u32 {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdBitfieldAdapt$u32(this.rValue);
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

  $clone() { return new StdDefaultAdapt$StdBitfieldAdapt$u32$u32().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdBitfieldAdapt$u16$u32 {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdBitfieldAdapt$u16(this.rValue);
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

  $clone() { return new StdDefaultAdapt$StdBitfieldAdapt$u16$u32().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdCastAdapt$C4Fixed$i32$C4Fixed {
  static $layout = [["rValue.rValue.val", 0, "i32", 0], ["rDefault.val", 4, "i32", 0]];
  static $size = 8;
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdCastAdapt$C4Fixed$i32(this.rValue);
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

  $clone() { return new StdDefaultAdapt$StdCastAdapt$C4Fixed$i32$C4Fixed().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdCastAdapt$i32$i32$i32 {
  static $layout = [["rValue.rValue", 0, "i32", 0], ["rDefault", 4, "i32", 0]];
  static $size = 8;
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdCastAdapt$i32$i32(this.rValue);
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

  $clone() { return new StdDefaultAdapt$StdCastAdapt$i32$i32$i32().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdCopyStrBuf$StdCopyStrBuf {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdCopyStrBuf(this.rValue);
    } catch ($e1) {
      if ($e1 instanceof $.StdCompiler$NotFoundException) {
        const pEx = $e1;
        this.rValue.$assign(this.rDefault);
        $delete(pEx);
      } else {
        throw $e1;
      }
    }
  }

  $clone() { return new StdDefaultAdapt$StdCopyStrBuf$StdCopyStrBuf().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdCopyStrBuf$StdStrBuf {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdCopyStrBuf(this.rValue);
    } catch ($e1) {
      if ($e1 instanceof $.StdCompiler$NotFoundException) {
        const pEx = $e1;
        this.rValue.op_assign$StdStrBuf(this.rDefault);
        $delete(pEx);
      } else {
        throw $e1;
      }
    }
  }

  $clone() { return new StdDefaultAdapt$StdCopyStrBuf$StdStrBuf().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdCopyStrBuf$x {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdCopyStrBuf(this.rValue);
    } catch ($e1) {
      if ($e1 instanceof $.StdCompiler$NotFoundException) {
        const pEx = $e1;
        this.rValue.op_assign$pi8(P(this.rDefault, 0));
        $delete(pEx);
      } else {
        throw $e1;
      }
    }
  }

  $clone() { return new StdDefaultAdapt$StdCopyStrBuf$x().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdCopyStrBuf$x$2 {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdCopyStrBuf(this.rValue);
    } catch ($e1) {
      if ($e1 instanceof $.StdCompiler$NotFoundException) {
        const pEx = $e1;
        this.rValue.op_assign$pi8(null);
        $delete(pEx);
      } else {
        throw $e1;
      }
    }
  }

  $clone() { return new StdDefaultAdapt$StdCopyStrBuf$x$2().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdEnumAdapt$i32$i32$i32 {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdEnumAdapt$i32$i32$3(this.rValue);
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

  $clone() { return new StdDefaultAdapt$StdEnumAdapt$i32$i32$i32().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdEnumAdapt$i32$u8$i32 {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdEnumAdapt$i32$u8$3(this.rValue);
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

  $clone() { return new StdDefaultAdapt$StdEnumAdapt$i32$u8$i32().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdEnumAdapt$i32$i32$i32$2 {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdEnumAdapt$i32$i32$2(this.rValue);
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

  $clone() { return new StdDefaultAdapt$StdEnumAdapt$i32$i32$i32$2().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdEnumAdapt$i32$i32$i32$3 {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdEnumAdapt$i32$i32(this.rValue);
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

  $clone() { return new StdDefaultAdapt$StdEnumAdapt$i32$i32$i32$3().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdEnumAdapt$i32$u8$i32$2 {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdEnumAdapt$i32$u8(this.rValue);
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

  $clone() { return new StdDefaultAdapt$StdEnumAdapt$i32$u8$i32$2().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdEnumAdapt$i32$u8$i32$3 {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdEnumAdapt$i32$u8$5(this.rValue);
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

  $clone() { return new StdDefaultAdapt$StdEnumAdapt$i32$u8$i32$3().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdEnumAdapt$i32$u8$i32$4 {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdEnumAdapt$i32$u8$6(this.rValue);
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

  $clone() { return new StdDefaultAdapt$StdEnumAdapt$i32$u8$i32$4().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdEnumAdapt$i32$u8$i32$5 {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdEnumAdapt$i32$u8$7(this.rValue);
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

  $clone() { return new StdDefaultAdapt$StdEnumAdapt$i32$u8$i32$5().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdEnumAdapt$i32$u8$i32$6 {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdEnumAdapt$i32$u8$4(this.rValue);
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

  $clone() { return new StdDefaultAdapt$StdEnumAdapt$i32$u8$i32$6().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdIntAdapt$i32$u8$i32 {
  static $layout = [["rValue.rValue", 0, "i32", 0], ["rDefault", 4, "i32", 0]];
  static $size = 8;
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdIntAdapt$i32$u8$10(this.rValue);
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

  $clone() { return new StdDefaultAdapt$StdIntAdapt$i32$u8$i32().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdIntAdapt$i32$u8$i32$2 {
  static $layout = [["rValue.rValue", 0, "i32", 0], ["rDefault", 4, "i32", 0]];
  static $size = 8;
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdIntAdapt$i32$u8$8(this.rValue);
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

  $clone() { return new StdDefaultAdapt$StdIntAdapt$i32$u8$i32$2().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdIntAdapt$i32$u8$i32$3 {
  static $layout = [["rValue.rValue", 0, "i32", 0], ["rDefault", 4, "i32", 0]];
  static $size = 8;
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdIntAdapt$i32$u8$14(this.rValue);
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

  $clone() { return new StdDefaultAdapt$StdIntAdapt$i32$u8$i32$3().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdIntAdapt$i32$u8$i32$4 {
  static $layout = [["rValue.rValue", 0, "i32", 0], ["rDefault", 4, "i32", 0]];
  static $size = 8;
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdIntAdapt$i32$u8$7(this.rValue);
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

  $clone() { return new StdDefaultAdapt$StdIntAdapt$i32$u8$i32$4().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdIntAdapt$i32$u8$i32$5 {
  static $layout = [["rValue.rValue", 0, "i32", 0], ["rDefault", 4, "i32", 0]];
  static $size = 8;
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdIntAdapt$i32$u8$5(this.rValue);
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

  $clone() { return new StdDefaultAdapt$StdIntAdapt$i32$u8$i32$5().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdIntAdapt$i32$i32$i32 {
  static $layout = [["rValue.rValue", 0, "i32", 0], ["rDefault", 4, "i32", 0]];
  static $size = 8;
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdIntAdapt$i32$i32(this.rValue);
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

  $clone() { return new StdDefaultAdapt$StdIntAdapt$i32$i32$i32().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdIntAdapt$i32$u8$i32$6 {
  static $layout = [["rValue.rValue", 0, "i32", 0], ["rDefault", 4, "i32", 0]];
  static $size = 8;
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdIntAdapt$i32$u8(this.rValue);
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

  $clone() { return new StdDefaultAdapt$StdIntAdapt$i32$u8$i32$6().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdIntAdapt$i32$u8$i32$7 {
  static $layout = [["rValue.rValue", 0, "i32", 0], ["rDefault", 4, "i32", 0]];
  static $size = 8;
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdIntAdapt$i32$u8$3(this.rValue);
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

  $clone() { return new StdDefaultAdapt$StdIntAdapt$i32$u8$i32$7().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdIntAdapt$i32$i32$i32$2 {
  static $layout = [["rValue.rValue", 0, "i32", 0], ["rDefault", 4, "i32", 0]];
  static $size = 8;
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdIntAdapt$i32$i32$7(this.rValue);
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

  $clone() { return new StdDefaultAdapt$StdIntAdapt$i32$i32$i32$2().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdIntPackAdapt$i32$i32 {
  static $layout = [["rValue.rVal", 0, "i32", 0], ["rDefault", 4, "i32", 0]];
  static $size = 8;
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdIntPackAdapt$i32(this.rValue);
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

  $clone() { return new StdDefaultAdapt$StdIntPackAdapt$i32$i32().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdIntPackAdapt$i32$i32$2 {
  static $layout = [["rValue.rVal", 0, "i32", 0], ["rDefault", 4, "i32", 0]];
  static $size = 8;
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdIntPackAdapt$i32(this.rValue);
    } catch ($e1) {
      if ($e1 instanceof $.StdCompiler$NotFoundException) {
        const pEx = $e1;
        this.rValue.op_assign$2(this.rDefault);
        $delete(pEx);
      } else {
        throw $e1;
      }
    }
  }

  $clone() { return new StdDefaultAdapt$StdIntPackAdapt$i32$i32$2().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdParameterAdapt$C4IDList$b$C4IDList {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdParameterAdapt$C4IDList$b(this.rValue);
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

  $clone() { return new StdDefaultAdapt$StdParameterAdapt$C4IDList$b$C4IDList().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
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

export class StdDefaultAdapt$StdParameterAdapt$C4ValueMapData$pC4ValueNumbers$C4ValueMapData$2 {
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

  $clone() { return new StdDefaultAdapt$StdParameterAdapt$C4ValueMapData$pC4ValueNumbers$C4ValueMapData$2().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$StdCopyStrBuf {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdParameterAdapt$StdCopyStrBuf$i32(this.rValue);
    } catch ($e1) {
      if ($e1 instanceof $.StdCompiler$NotFoundException) {
        const pEx = $e1;
        this.rValue.op_assign$StdCopyStrBuf(this.rDefault);
        $delete(pEx);
      } else {
        throw $e1;
      }
    }
  }

  $clone() { return new StdDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$StdCopyStrBuf().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$x {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdParameterAdapt$StdCopyStrBuf$i32(this.rValue);
    } catch ($e1) {
      if ($e1 instanceof $.StdCompiler$NotFoundException) {
        const pEx = $e1;
        this.rValue.op_assign$x(this.rDefault);
        $delete(pEx);
      } else {
        throw $e1;
      }
    }
  }

  $clone() { return new StdDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$x().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$x$2 {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdParameterAdapt$StdCopyStrBuf$i32(this.rValue);
    } catch ($e1) {
      if ($e1 instanceof $.StdCompiler$NotFoundException) {
        const pEx = $e1;
        this.rValue.op_assign$x$2(this.rDefault);
        $delete(pEx);
      } else {
        throw $e1;
      }
    }
  }

  $clone() { return new StdDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$x$2().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdParameterAdapt$StdStrBuf$i32$StdStrBuf {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdParameterAdapt$StdStrBuf$i32$2(this.rValue);
    } catch ($e1) {
      if ($e1 instanceof $.StdCompiler$NotFoundException) {
        const pEx = $e1;
        this.rValue.op_assign$StdStrBuf(this.rDefault);
        $delete(pEx);
      } else {
        throw $e1;
      }
    }
  }

  $clone() { return new StdDefaultAdapt$StdParameterAdapt$StdStrBuf$i32$StdStrBuf().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdParameterAdapt$ValidatedStdCopyStrBuf$3$i32$x {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdParameterAdapt$ValidatedStdCopyStrBuf$3$i32(this.rValue);
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

  $clone() { return new StdDefaultAdapt$StdParameterAdapt$ValidatedStdCopyStrBuf$3$i32$x().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdRuntimeValueAdapt$b$b {
  static $layout = [["rValue.rValue", 0, "u8", 0], ["rDefault", 1, "u8", 0]];
  static $size = 2;
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdRuntimeValueAdapt$b(this.rValue);
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

  $clone() { return new StdDefaultAdapt$StdRuntimeValueAdapt$b$b().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdSTLContainerAdapt$vector$ControlItem$vector$ControlItem {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdSTLContainerAdapt$vector$ControlItem(this.rValue);
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

  $clone() { return new StdDefaultAdapt$StdSTLContainerAdapt$vector$ControlItem$vector$ControlItem().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdSTLContainerAdapt$vector$C4MaterialReaction$vector$C4MaterialReaction {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdSTLContainerAdapt$vector$C4MaterialReaction(this.rValue);
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

  $clone() { return new StdDefaultAdapt$StdSTLContainerAdapt$vector$C4MaterialReaction$vector$C4MaterialReaction().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdSTLContainerAdapt$vector$ControlDownState$vector$ControlDownState {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdSTLContainerAdapt$vector$ControlDownState(this.rValue);
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

  $clone() { return new StdDefaultAdapt$StdSTLContainerAdapt$vector$ControlDownState$vector$ControlDownState().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdSTLContainerAdapt$vector$KeyComboItem$vector$KeyComboItem {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdSTLContainerAdapt$vector$KeyComboItem(this.rValue);
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

  $clone() { return new StdDefaultAdapt$StdSTLContainerAdapt$vector$KeyComboItem$vector$KeyComboItem().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdSTLContainerAdapt$vector$i32$vector$i32 {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdSTLContainerAdapt$vector$i32(this.rValue);
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

  $clone() { return new StdDefaultAdapt$StdSTLContainerAdapt$vector$i32$vector$i32().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdStdStringAdapt$x {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdStdStringAdapt(this.rValue);
    } catch ($e1) {
      if ($e1 instanceof $.StdCompiler$NotFoundException) {
        const pEx = $e1;
        this.rValue.op_assign(P(this.rDefault, 0));
        $delete(pEx);
      } else {
        throw $e1;
      }
    }
  }

  $clone() { return new StdDefaultAdapt$StdStdStringAdapt$x().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdStdStringAdapt$x$2 {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdStdStringAdapt(this.rValue);
    } catch ($e1) {
      if ($e1 instanceof $.StdCompiler$NotFoundException) {
        const pEx = $e1;
        this.rValue.op_assign(P(this.rDefault, 0));
        $delete(pEx);
      } else {
        throw $e1;
      }
    }
  }

  $clone() { return new StdDefaultAdapt$StdStdStringAdapt$x$2().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdStdStringAdapt$x$3 {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdStdStringAdapt(this.rValue);
    } catch ($e1) {
      if ($e1 instanceof $.StdCompiler$NotFoundException) {
        const pEx = $e1;
        this.rValue.op_assign(P(this.rDefault, 0));
        $delete(pEx);
      } else {
        throw $e1;
      }
    }
  }

  $clone() { return new StdDefaultAdapt$StdStdStringAdapt$x$3().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdStrBuf$StdStrBuf {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdStrBuf(this.rValue);
    } catch ($e1) {
      if ($e1 instanceof $.StdCompiler$NotFoundException) {
        const pEx = $e1;
        this.rValue.$assign(this.rDefault);
        $delete(pEx);
      } else {
        throw $e1;
      }
    }
  }

  $clone() { return new StdDefaultAdapt$StdStrBuf$StdStrBuf().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdStrBuf$x {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdStrBuf(this.rValue);
    } catch ($e1) {
      if ($e1 instanceof $.StdCompiler$NotFoundException) {
        const pEx = $e1;
        $.StdStrBuf.prototype.op_assign$pi8.call(this.rValue, P(this.rDefault, 0));
        $delete(pEx);
      } else {
        throw $e1;
      }
    }
  }

  $clone() { return new StdDefaultAdapt$StdStrBuf$x().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdStrBuf$x$2 {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdStrBuf(this.rValue);
    } catch ($e1) {
      if ($e1 instanceof $.StdCompiler$NotFoundException) {
        const pEx = $e1;
        $.StdStrBuf.prototype.op_assign$pi8.call(this.rValue, P(this.rDefault, 0));
        $delete(pEx);
      } else {
        throw $e1;
      }
    }
  }

  $clone() { return new StdDefaultAdapt$StdStrBuf$x$2().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdStrBuf$x$3 {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdStrBuf(this.rValue);
    } catch ($e1) {
      if ($e1 instanceof $.StdCompiler$NotFoundException) {
        const pEx = $e1;
        $.StdStrBuf.prototype.op_assign$pi8.call(this.rValue, P(this.rDefault, 0));
        $delete(pEx);
      } else {
        throw $e1;
      }
    }
  }

  $clone() { return new StdDefaultAdapt$StdStrBuf$x$3().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdStrBuf$x$4 {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdStrBuf(this.rValue);
    } catch ($e1) {
      if ($e1 instanceof $.StdCompiler$NotFoundException) {
        const pEx = $e1;
        $.StdStrBuf.prototype.op_assign$pi8.call(this.rValue, P(this.rDefault, 0));
        $delete(pEx);
      } else {
        throw $e1;
      }
    }
  }

  $clone() { return new StdDefaultAdapt$StdStrBuf$x$4().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdStringAdapt$x {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdStringAdapt(this.rValue);
    } catch ($e1) {
      if ($e1 instanceof $.StdCompiler$NotFoundException) {
        const pEx = $e1;
        this.rValue.op_assign(P(this.rDefault, 0));
        $delete(pEx);
      } else {
        throw $e1;
      }
    }
  }

  $clone() { return new StdDefaultAdapt$StdStringAdapt$x().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdStringAdapt$x$2 {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdStringAdapt(this.rValue);
    } catch ($e1) {
      if ($e1 instanceof $.StdCompiler$NotFoundException) {
        const pEx = $e1;
        this.rValue.op_assign(P(this.rDefault, 0));
        $delete(pEx);
      } else {
        throw $e1;
      }
    }
  }

  $clone() { return new StdDefaultAdapt$StdStringAdapt$x$2().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdStringAdapt$x$3 {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdStringAdapt(this.rValue);
    } catch ($e1) {
      if ($e1 instanceof $.StdCompiler$NotFoundException) {
        const pEx = $e1;
        this.rValue.op_assign(P(this.rDefault, 0));
        $delete(pEx);
      } else {
        throw $e1;
      }
    }
  }

  $clone() { return new StdDefaultAdapt$StdStringAdapt$x$3().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdStringAdapt$x$4 {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdStringAdapt(this.rValue);
    } catch ($e1) {
      if ($e1 instanceof $.StdCompiler$NotFoundException) {
        const pEx = $e1;
        this.rValue.op_assign(P(this.rDefault, 0));
        $delete(pEx);
      } else {
        throw $e1;
      }
    }
  }

  $clone() { return new StdDefaultAdapt$StdStringAdapt$x$4().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdStringAdapt$x$6 {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdStringAdapt(this.rValue);
    } catch ($e1) {
      if ($e1 instanceof $.StdCompiler$NotFoundException) {
        const pEx = $e1;
        this.rValue.op_assign(P(this.rDefault, 0));
        $delete(pEx);
      } else {
        throw $e1;
      }
    }
  }

  $clone() { return new StdDefaultAdapt$StdStringAdapt$x$6().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdStringAdapt$x$7 {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdStringAdapt(this.rValue);
    } catch ($e1) {
      if ($e1 instanceof $.StdCompiler$NotFoundException) {
        const pEx = $e1;
        this.rValue.op_assign(P(this.rDefault, 0));
        $delete(pEx);
      } else {
        throw $e1;
      }
    }
  }

  $clone() { return new StdDefaultAdapt$StdStringAdapt$x$7().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdStringAdapt$x$8 {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdStringAdapt(this.rValue);
    } catch ($e1) {
      if ($e1 instanceof $.StdCompiler$NotFoundException) {
        const pEx = $e1;
        this.rValue.op_assign(P(this.rDefault, 0));
        $delete(pEx);
      } else {
        throw $e1;
      }
    }
  }

  $clone() { return new StdDefaultAdapt$StdStringAdapt$x$8().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdStringAdapt$x$9 {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdStringAdapt(this.rValue);
    } catch ($e1) {
      if ($e1 instanceof $.StdCompiler$NotFoundException) {
        const pEx = $e1;
        this.rValue.op_assign(P(this.rDefault, 0));
        $delete(pEx);
      } else {
        throw $e1;
      }
    }
  }

  $clone() { return new StdDefaultAdapt$StdStringAdapt$x$9().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdStringAdapt$x$10 {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdStringAdapt(this.rValue);
    } catch ($e1) {
      if ($e1 instanceof $.StdCompiler$NotFoundException) {
        const pEx = $e1;
        this.rValue.op_assign(P(this.rDefault, 0));
        $delete(pEx);
      } else {
        throw $e1;
      }
    }
  }

  $clone() { return new StdDefaultAdapt$StdStringAdapt$x$10().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdStringAdapt$x$11 {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdStringAdapt(this.rValue);
    } catch ($e1) {
      if ($e1 instanceof $.StdCompiler$NotFoundException) {
        const pEx = $e1;
        this.rValue.op_assign(P(this.rDefault, 0));
        $delete(pEx);
      } else {
        throw $e1;
      }
    }
  }

  $clone() { return new StdDefaultAdapt$StdStringAdapt$x$11().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdStringAdapt$x$12 {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdStringAdapt(this.rValue);
    } catch ($e1) {
      if ($e1 instanceof $.StdCompiler$NotFoundException) {
        const pEx = $e1;
        this.rValue.op_assign(P(this.rDefault, 0));
        $delete(pEx);
      } else {
        throw $e1;
      }
    }
  }

  $clone() { return new StdDefaultAdapt$StdStringAdapt$x$12().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdStringAdapt$x$13 {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdStringAdapt(this.rValue);
    } catch ($e1) {
      if ($e1 instanceof $.StdCompiler$NotFoundException) {
        const pEx = $e1;
        this.rValue.op_assign(P(this.rDefault, 0));
        $delete(pEx);
      } else {
        throw $e1;
      }
    }
  }

  $clone() { return new StdDefaultAdapt$StdStringAdapt$x$13().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdStringAdapt$pi8 {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdStringAdapt(this.rValue);
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

  $clone() { return new StdDefaultAdapt$StdStringAdapt$pi8().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$ValidatedStdCopyStrBuf$10$x {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rValidatedStdCopyStrBuf$10(this.rValue);
    } catch ($e1) {
      if ($e1 instanceof $.StdCompiler$NotFoundException) {
        const pEx = $e1;
        this.rValue.op_assign$x(this.rDefault);
        $delete(pEx);
      } else {
        throw $e1;
      }
    }
  }

  $clone() { return new StdDefaultAdapt$ValidatedStdCopyStrBuf$10$x().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$ValidatedStdCopyStrBuf$3$x {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rValidatedStdCopyStrBuf$3(this.rValue);
    } catch ($e1) {
      if ($e1 instanceof $.StdCompiler$NotFoundException) {
        const pEx = $e1;
        this.rValue.op_assign$x(this.rDefault);
        $delete(pEx);
      } else {
        throw $e1;
      }
    }
  }

  $clone() { return new StdDefaultAdapt$ValidatedStdCopyStrBuf$3$x().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$ValidatedStdCopyStrBuf$4$x {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rValidatedStdCopyStrBuf$4(this.rValue);
    } catch ($e1) {
      if ($e1 instanceof $.StdCompiler$NotFoundException) {
        const pEx = $e1;
        this.rValue.op_assign$x(this.rDefault);
        $delete(pEx);
      } else {
        throw $e1;
      }
    }
  }

  $clone() { return new StdDefaultAdapt$ValidatedStdCopyStrBuf$4$x().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$b$b {
  static $layout = [["rValue", 0, "u8", 0], ["rDefault", 1, "u8", 0]];
  static $size = 2;
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rb(this.rValue);
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

  $clone() { return new StdDefaultAdapt$b$b().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$i32$i16 {
  static $layout = [["rValue", 0, "i32", 0], ["rDefault", 4, "i16", 0]];
  static $size = 8;
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

  $clone() { return new StdDefaultAdapt$i32$i16().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$u8$i32 {
  static $layout = [["rValue", 0, "u8", 0], ["rDefault", 4, "i32", 0]];
  static $size = 8;
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$ru8(this.rValue);
    } catch ($e1) {
      if ($e1 instanceof $.StdCompiler$NotFoundException) {
        const pEx = $e1;
        this.rValue.a[this.rValue.o] = this.rDefault & 0xff;
        $delete(pEx);
      } else {
        throw $e1;
      }
    }
  }

  $clone() { return new StdDefaultAdapt$u8$i32().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$u32$u32 {
  static $layout = [["rValue", 0, "u32", 0], ["rDefault", 4, "u32", 0]];
  static $size = 8;
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$ru32(this.rValue);
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

  $clone() { return new StdDefaultAdapt$u32$u32().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdEnumAdapt$i32$i32$2 {
  rVal = null;
  pNames = null;

  init(rVal, pNames) {
    this.pNames = pNames;
    this.rVal = rVal;
    0;
    return this;
  }

  CompileFunc(pComp) {
    if (!pComp.isVerbose()) {
      pComp.Value$StdIntAdapt$i32$i32$5(mkIntAdaptT$20(this.rVal));
      return;
    }
    if (!pComp.isDeserializer()) {
      let pName = this.pNames;
      for (; pName.Name != null; pName = $oadd(pName, 1)) {
        if (pName.Val === this.rVal.a[this.rVal.o]) {
          pComp.String$ppi8$i32(P(pName, "Name"), 2 /*RCT_Idtf*/);
          break;
        }
      }
      if (pName.Name == null) {
        pComp.Value$StdIntAdapt$i32$i32$5(mkIntAdaptT$20(this.rVal));
      }
    } else {
      const val = [0];
      try {
        pComp.Value$ri32(P(val, 0));
        this.rVal.a[this.rVal.o] = val[0];
      } catch ($e2) {
        if ($e2 instanceof $.StdCompiler$NotFoundException) {
          const pEx = $e2;
          $delete(pEx);
          let Name = new $.StdStrBuf();
          pComp.Value$StdParameterAdapt$StdStrBuf$i32$2(mkParAdapt$rStdStrBuf$mi32(Name, 2 /*RCT_Idtf*/));
          let pName = this.pNames;
          for (; pName.Name != null; pName = $oadd(pName, 1)) {
            if (Name.op_eq$pi8(pName.Name)) {
              this.rVal.a[this.rVal.o] = pName.Val;
              break;
            }
          }
          if (pName.Name == null) {
            pComp.Warn(S("Unknown bit name: %s"), Name.getData());
          }
        } else {
          throw $e2;
        }
      }
    }
  }

  op_eq(nValue) {
    return this.rVal.a[this.rVal.o] === nValue;
  }

  op_assign(nValue) {
    this.rVal.a[this.rVal.o] = nValue;
    return this;
  }

  $clone() { return new StdEnumAdapt$i32$i32$2().$assign(this); }
  $assign(o) {
    this.rVal = o.rVal;
    this.pNames = o.pNames;
    return this;
  }
}

export class StdEnumAdapt$i32$u8$4 {
  rVal = null;
  pNames = null;

  init(rVal, pNames) {
    this.pNames = pNames;
    this.rVal = rVal;
    0;
    return this;
  }

  CompileFunc(pComp) {
    if (!pComp.isVerbose()) {
      pComp.Value$StdIntAdapt$i32$u8$13(mkIntAdaptT$13(this.rVal));
      return;
    }
    if (!pComp.isDeserializer()) {
      let pName = this.pNames;
      for (; pName.Name != null; pName = $oadd(pName, 1)) {
        if (pName.Val === this.rVal.a[this.rVal.o]) {
          pComp.String$ppi8$i32(P(pName, "Name"), 2 /*RCT_Idtf*/);
          break;
        }
      }
      if (pName.Name == null) {
        pComp.Value$StdIntAdapt$i32$u8$13(mkIntAdaptT$13(this.rVal));
      }
    } else {
      const val = [0];
      try {
        pComp.Value$ru8(P(val, 0));
        this.rVal.a[this.rVal.o] = val[0];
      } catch ($e2) {
        if ($e2 instanceof $.StdCompiler$NotFoundException) {
          const pEx = $e2;
          $delete(pEx);
          let Name = new $.StdStrBuf();
          pComp.Value$StdParameterAdapt$StdStrBuf$i32$2(mkParAdapt$rStdStrBuf$mi32(Name, 2 /*RCT_Idtf*/));
          let pName = this.pNames;
          for (; pName.Name != null; pName = $oadd(pName, 1)) {
            if (Name.op_eq$pi8(pName.Name)) {
              this.rVal.a[this.rVal.o] = pName.Val;
              break;
            }
          }
          if (pName.Name == null) {
            pComp.Warn(S("Unknown bit name: %s"), Name.getData());
          }
        } else {
          throw $e2;
        }
      }
    }
  }

  op_eq(nValue) {
    return this.rVal.a[this.rVal.o] === nValue;
  }

  op_assign(nValue) {
    this.rVal.a[this.rVal.o] = nValue;
    return this;
  }

  $clone() { return new StdEnumAdapt$i32$u8$4().$assign(this); }
  $assign(o) {
    this.rVal = o.rVal;
    this.pNames = o.pNames;
    return this;
  }
}

export class StdEnumEntry$i32$2 {
  Name = null;
  Val = 0;

  $clone() { return new StdEnumEntry$i32$2().$assign(this); }
  $assign(o) {
    this.Name = o.Name;
    this.Val = o.Val;
    return this;
  }
}

export class StdEnumEntry$i32$5 {
  Name = null;
  Val = 0;

  $clone() { return new StdEnumEntry$i32$5().$assign(this); }
  $assign(o) {
    this.Name = o.Name;
    this.Val = o.Val;
    return this;
  }
}

export class StdEnumEntry$i32$6 {
  Name = null;
  Val = 0;

  $clone() { return new StdEnumEntry$i32$6().$assign(this); }
  $assign(o) {
    this.Name = o.Name;
    this.Val = o.Val;
    return this;
  }
}

export class StdEnumEntry$i32$7 {
  Name = null;
  Val = 0;

  $clone() { return new StdEnumEntry$i32$7().$assign(this); }
  $assign(o) {
    this.Name = o.Name;
    this.Val = o.Val;
    return this;
  }
}

export class StdEnumEntry$i32$8 {
  Name = null;
  Val = 0;

  $clone() { return new StdEnumEntry$i32$8().$assign(this); }
  $assign(o) {
    this.Name = o.Name;
    this.Val = o.Val;
    return this;
  }
}

export class StdEnumEntry$i32$9 {
  Name = null;
  Val = 0;

  $clone() { return new StdEnumEntry$i32$9().$assign(this); }
  $assign(o) {
    this.Name = o.Name;
    this.Val = o.Val;
    return this;
  }
}

export class StdEnumEntry$i32$11 {
  Name = null;
  Val = 0;

  $clone() { return new StdEnumEntry$i32$11().$assign(this); }
  $assign(o) {
    this.Name = o.Name;
    this.Val = o.Val;
    return this;
  }
}

export class StdIntAdapt$i32$u8$2 {
  static $layout = [["rValue", 0, "i32", 0]];
  static $size = 4;
  rValue = null;

  init(rValue) {
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    const iVal = [this.rValue.a[this.rValue.o] & 0xff];
    pComp.Value$ru8(P(iVal, 0));
    this.rValue.a[this.rValue.o] = iVal[0];
  }

  op_eq(nValue) {
    return this.rValue.a[this.rValue.o] === nValue;
  }

  op_assign(nValue) {
    this.rValue.a[this.rValue.o] = nValue;
    return this;
  }

  $clone() { return new StdIntAdapt$i32$u8$2().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    return this;
  }
}

export class StdIntAdapt$i32$u8$3 {
  static $layout = [["rValue", 0, "i32", 0]];
  static $size = 4;
  rValue = null;

  init(rValue) {
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    const iVal = [this.rValue.a[this.rValue.o] & 0xff];
    pComp.Value$ru8(P(iVal, 0));
    this.rValue.a[this.rValue.o] = iVal[0];
  }

  op_eq(nValue) {
    return this.rValue.a[this.rValue.o] === nValue;
  }

  op_assign(nValue) {
    this.rValue.a[this.rValue.o] = nValue;
    return this;
  }

  $clone() { return new StdIntAdapt$i32$u8$3().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    return this;
  }
}

export class StdIntAdapt$i32$u8$4 {
  static $layout = [["rValue", 0, "i32", 0]];
  static $size = 4;
  rValue = null;

  init(rValue) {
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    const iVal = [this.rValue.a[this.rValue.o] & 0xff];
    pComp.Value$ru8(P(iVal, 0));
    this.rValue.a[this.rValue.o] = iVal[0];
  }

  $clone() { return new StdIntAdapt$i32$u8$4().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    return this;
  }
}

export class StdIntAdapt$i32$u8$5 {
  static $layout = [["rValue", 0, "i32", 0]];
  static $size = 4;
  rValue = null;

  init(rValue) {
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    const iVal = [this.rValue.a[this.rValue.o] & 0xff];
    pComp.Value$ru8(P(iVal, 0));
    this.rValue.a[this.rValue.o] = iVal[0];
  }

  $clone() { return new StdIntAdapt$i32$u8$5().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    return this;
  }
}

export class StdIntAdapt$i32$u8$6 {
  static $layout = [["rValue", 0, "i32", 0]];
  static $size = 4;
  rValue = null;

  init(rValue) {
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    const iVal = [this.rValue.a[this.rValue.o] & 0xff];
    pComp.Value$ru8(P(iVal, 0));
    this.rValue.a[this.rValue.o] = iVal[0];
  }

  op_eq(nValue) {
    return this.rValue.a[this.rValue.o] === nValue;
  }

  op_assign(nValue) {
    this.rValue.a[this.rValue.o] = nValue;
    return this;
  }

  $clone() { return new StdIntAdapt$i32$u8$6().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    return this;
  }
}

export class StdIntAdapt$i32$u8$7 {
  static $layout = [["rValue", 0, "i32", 0]];
  static $size = 4;
  rValue = null;

  init(rValue) {
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    const iVal = [this.rValue.a[this.rValue.o] & 0xff];
    pComp.Value$ru8(P(iVal, 0));
    this.rValue.a[this.rValue.o] = iVal[0];
  }

  op_eq(nValue) {
    return this.rValue.a[this.rValue.o] === nValue;
  }

  op_assign(nValue) {
    this.rValue.a[this.rValue.o] = nValue;
    return this;
  }

  $clone() { return new StdIntAdapt$i32$u8$7().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    return this;
  }
}

export class StdIntAdapt$i32$i32 {
  static $layout = [["rValue", 0, "i32", 0]];
  static $size = 4;
  rValue = null;

  init(rValue) {
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    const iVal = [this.rValue.a[this.rValue.o]];
    pComp.Value$ri32(P(iVal, 0));
    this.rValue.a[this.rValue.o] = iVal[0];
  }

  $clone() { return new StdIntAdapt$i32$i32().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    return this;
  }
}

export class StdIntAdapt$i32$u8$8 {
  static $layout = [["rValue", 0, "i32", 0]];
  static $size = 4;
  rValue = null;

  init(rValue) {
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    const iVal = [this.rValue.a[this.rValue.o] & 0xff];
    pComp.Value$ru8(P(iVal, 0));
    this.rValue.a[this.rValue.o] = iVal[0];
  }

  op_eq(nValue) {
    return this.rValue.a[this.rValue.o] === nValue;
  }

  op_assign(nValue) {
    this.rValue.a[this.rValue.o] = nValue;
    return this;
  }

  $clone() { return new StdIntAdapt$i32$u8$8().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    return this;
  }
}

export class StdIntAdapt$i32$i32$4 {
  static $layout = [["rValue", 0, "i32", 0]];
  static $size = 4;
  rValue = null;

  init(rValue) {
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    const iVal = [this.rValue.a[this.rValue.o]];
    pComp.Value$ri32(P(iVal, 0));
    this.rValue.a[this.rValue.o] = iVal[0];
  }

  $clone() { return new StdIntAdapt$i32$i32$4().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    return this;
  }
}

export class StdIntAdapt$i32$u8$12 {
  static $layout = [["rValue", 0, "i32", 0]];
  static $size = 4;
  rValue = null;

  init(rValue) {
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    const iVal = [this.rValue.a[this.rValue.o] & 0xff];
    pComp.Value$ru8(P(iVal, 0));
    this.rValue.a[this.rValue.o] = iVal[0];
  }

  $clone() { return new StdIntAdapt$i32$u8$12().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    return this;
  }
}

export class StdIntAdapt$i32$u8$16 {
  static $layout = [["rValue", 0, "i32", 0]];
  static $size = 4;
  rValue = null;

  init(rValue) {
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    const iVal = [this.rValue.a[this.rValue.o] & 0xff];
    pComp.Value$ru8(P(iVal, 0));
    this.rValue.a[this.rValue.o] = iVal[0];
  }

  op_eq(nValue) {
    return this.rValue.a[this.rValue.o] === nValue;
  }

  op_assign(nValue) {
    this.rValue.a[this.rValue.o] = nValue;
    return this;
  }

  $clone() { return new StdIntAdapt$i32$u8$16().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    return this;
  }
}

export class StdIntAdapt$i32$i32$7 {
  static $layout = [["rValue", 0, "i32", 0]];
  static $size = 4;
  rValue = null;

  init(rValue) {
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    const iVal = [this.rValue.a[this.rValue.o]];
    pComp.Value$ri32(P(iVal, 0));
    this.rValue.a[this.rValue.o] = iVal[0];
  }

  op_eq(nValue) {
    return this.rValue.a[this.rValue.o] === nValue;
  }

  op_assign(nValue) {
    this.rValue.a[this.rValue.o] = nValue;
    return this;
  }

  $clone() { return new StdIntAdapt$i32$i32$7().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    return this;
  }
}

export class StdIntAdapt$u8$i32 {
  static $layout = [["rValue", 0, "u8", 0]];
  static $size = 1;
  rValue = null;

  init(rValue) {
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    const iVal = [this.rValue.a[this.rValue.o]];
    pComp.Value$ri32(P(iVal, 0));
    this.rValue.a[this.rValue.o] = iVal[0] & 0xff;
  }

  $clone() { return new StdIntAdapt$u8$i32().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    return this;
  }
}

export class StdIntAdapt$u32$i32 {
  static $layout = [["rValue", 0, "u32", 0]];
  static $size = 4;
  rValue = null;

  init(rValue) {
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    const iVal = [this.rValue.a[this.rValue.o] | 0];
    pComp.Value$ri32(P(iVal, 0));
    this.rValue.a[this.rValue.o] = iVal[0] >>> 0;
  }

  $clone() { return new StdIntAdapt$u32$i32().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    return this;
  }
}

export class StdNamingAdapt$C4ClientCore {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rC4ClientCore(this.rValue);
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

  $clone() { return new StdNamingAdapt$C4ClientCore().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$C4ClientPlayerInfos {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rC4ClientPlayerInfos(this.rValue);
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

  $clone() { return new StdNamingAdapt$C4ClientPlayerInfos().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$C4ConfigControls {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rC4ConfigControls(this.rValue);
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

  $clone() { return new StdNamingAdapt$C4ConfigControls().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$C4ConfigDeveloper {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rC4ConfigDeveloper(this.rValue);
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

  $clone() { return new StdNamingAdapt$C4ConfigDeveloper().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$C4ConfigGamepad {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rC4ConfigGamepad(this.rValue);
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

  $clone() { return new StdNamingAdapt$C4ConfigGamepad().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$C4ConfigGraphics {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rC4ConfigGraphics(this.rValue);
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

  $clone() { return new StdNamingAdapt$C4ConfigGraphics().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$C4ConfigIRC {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rC4ConfigIRC(this.rValue);
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

  $clone() { return new StdNamingAdapt$C4ConfigIRC().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$C4ConfigLobby {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rC4ConfigLobby(this.rValue);
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

  $clone() { return new StdNamingAdapt$C4ConfigLobby().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$C4ConfigNetwork {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rC4ConfigNetwork(this.rValue);
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

  $clone() { return new StdNamingAdapt$C4ConfigNetwork().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$C4ConfigSecurity {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rC4ConfigSecurity(this.rValue);
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

  $clone() { return new StdNamingAdapt$C4ConfigSecurity().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$C4ConfigSound {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rC4ConfigSound(this.rValue);
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

  $clone() { return new StdNamingAdapt$C4ConfigSound().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$C4ConfigStartup {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rC4ConfigStartup(this.rValue);
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

  $clone() { return new StdNamingAdapt$C4ConfigStartup().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$C4FoWBeam {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rC4FoWBeam(this.rValue);
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

  $clone() { return new StdNamingAdapt$C4FoWBeam().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$C4GameRes {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rC4GameRes(this.rValue);
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

  $clone() { return new StdNamingAdapt$C4GameRes().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$C4IDList {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rC4IDList(this.rValue);
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

  $clone() { return new StdNamingAdapt$C4IDList().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$C4IDPacket {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rC4IDPacket(this.rValue);
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

  $clone() { return new StdNamingAdapt$C4IDPacket().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$C4Landscape {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rC4Landscape(this.rValue);
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

  $clone() { return new StdNamingAdapt$C4Landscape().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$C4Network2Reference {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rC4Network2Reference(this.rValue);
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

  $clone() { return new StdNamingAdapt$C4Network2Reference().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$C4Network2ResCore {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rC4Network2ResCore(this.rValue);
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

  $clone() { return new StdNamingAdapt$C4Network2ResCore().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$C4ObjectInfoCore {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rC4ObjectInfoCore(this.rValue);
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

  $clone() { return new StdNamingAdapt$C4ObjectInfoCore().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$C4ObjectListDumpHelper {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rC4ObjectListDumpHelper(this.rValue);
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

  $clone() { return new StdNamingAdapt$C4ObjectListDumpHelper().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$C4ObjectPtr {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rC4ObjectPtr(this.rValue);
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

  $clone() { return new StdNamingAdapt$C4ObjectPtr().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$C4PacketBase {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rC4PacketBase(this.rValue);
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

  $clone() { return new StdNamingAdapt$C4PacketBase().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$C4ParticleDefCore {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rC4ParticleDefCore(this.rValue);
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

  $clone() { return new StdNamingAdapt$C4ParticleDefCore().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$C4PlayerInfoList {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rC4PlayerInfoList(this.rValue);
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

  $clone() { return new StdNamingAdapt$C4PlayerInfoList().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$C4RoundResult {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rC4RoundResult(this.rValue);
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

  $clone() { return new StdNamingAdapt$C4RoundResult().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$C4RoundResults {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rC4RoundResults(this.rValue);
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

  $clone() { return new StdNamingAdapt$C4RoundResults().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$C4SAnimals {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rC4SAnimals(this.rValue);
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

  $clone() { return new StdNamingAdapt$C4SAnimals().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$C4SDefinitions {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rC4SDefinitions(this.rValue);
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

  $clone() { return new StdNamingAdapt$C4SDefinitions().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$C4SEnvironment {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rC4SEnvironment(this.rValue);
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

  $clone() { return new StdNamingAdapt$C4SEnvironment().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$C4SLandscape {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rC4SLandscape(this.rValue);
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

  $clone() { return new StdNamingAdapt$C4SLandscape().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$C4SPlrStart {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rC4SPlrStart(this.rValue);
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

  $clone() { return new StdNamingAdapt$C4SPlrStart().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$C4SWeather {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rC4SWeather(this.rValue);
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

  $clone() { return new StdNamingAdapt$C4SWeather().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$C4ScenarioParameters {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rC4ScenarioParameters(this.rValue);
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

  $clone() { return new StdNamingAdapt$C4ScenarioParameters().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$C4Scoreboard {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rC4Scoreboard(this.rValue);
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

  $clone() { return new StdNamingAdapt$C4Scoreboard().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$C4Sky {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rC4Sky(this.rValue);
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

  $clone() { return new StdNamingAdapt$C4Sky().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$C4TeamList {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rC4TeamList(this.rValue);
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

  $clone() { return new StdNamingAdapt$C4TeamList().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$C4Weather {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rC4Weather(this.rValue);
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

  $clone() { return new StdNamingAdapt$C4Weather().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$MatrixAdapt {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rMatrixAdapt(this.rValue);
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

  $clone() { return new StdNamingAdapt$MatrixAdapt().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$StdArrayAdapt$pC4ClientPlayerInfos$StdPtrAdapt$C4ClientPlayerInfos {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rStdArrayAdapt$pC4ClientPlayerInfos$StdPtrAdapt$C4ClientPlayerInfos(this.rValue);
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

  $clone() { return new StdNamingAdapt$StdArrayAdapt$pC4ClientPlayerInfos$StdPtrAdapt$C4ClientPlayerInfos().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$StdArrayAdapt$C4LSector$StdParameterAdaptMaker$pC4ValueNumbers {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rStdArrayAdapt$C4LSector$StdParameterAdaptMaker$pC4ValueNumbers(this.rValue);
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

  $clone() { return new StdNamingAdapt$StdArrayAdapt$C4LSector$StdParameterAdaptMaker$pC4ValueNumbers().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$StdArrayAdapt$pAccessGfx$StdPtrAdapt$AccessGfx {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rStdArrayAdapt$pAccessGfx$StdPtrAdapt$AccessGfx(this.rValue);
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

  $clone() { return new StdNamingAdapt$StdArrayAdapt$pAccessGfx$StdPtrAdapt$AccessGfx().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$StdArrayAdapt$pScenario$StdPtrAdapt$Scenario {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rStdArrayAdapt$pScenario$StdPtrAdapt$Scenario(this.rValue);
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

  $clone() { return new StdNamingAdapt$StdArrayAdapt$pScenario$StdPtrAdapt$Scenario().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$StdArrayAdapt$pC4PlayerInfo$StdPtrAdapt$C4PlayerInfo {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rStdArrayAdapt$pC4PlayerInfo$StdPtrAdapt$C4PlayerInfo(this.rValue);
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

  $clone() { return new StdNamingAdapt$StdArrayAdapt$pC4PlayerInfo$StdPtrAdapt$C4PlayerInfo().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$StdArrayAdapt$pC4Team$StdPtrAdapt$C4Team {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rStdArrayAdapt$pC4Team$StdPtrAdapt$C4Team(this.rValue);
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

  $clone() { return new StdNamingAdapt$StdArrayAdapt$pC4Team$StdPtrAdapt$C4Team().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$StdBuf {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rStdBuf(this.rValue);
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

  $clone() { return new StdNamingAdapt$StdBuf().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$StdDecompileAdapt$C4RecordChunk {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rStdDecompileAdapt$C4RecordChunk(this.rValue);
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

  $clone() { return new StdNamingAdapt$StdDecompileAdapt$C4RecordChunk().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$StdEnumAdapt$i32$u8 {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rStdEnumAdapt$i32$u8$8(this.rValue);
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

  $clone() { return new StdNamingAdapt$StdEnumAdapt$i32$u8().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$StdInsertAdapt$StdParameterAdapt$C4Object$pC4ValueNumbers$StdNamingAdapt$C4ValueNumbers {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rStdInsertAdapt$StdParameterAdapt$C4Object$pC4ValueNumbers$StdNamingAdapt$C4ValueNumbers(this.rValue);
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

  $clone() { return new StdNamingAdapt$StdInsertAdapt$StdParameterAdapt$C4Object$pC4ValueNumbers$StdNamingAdapt$C4ValueNumbers().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$StdIntAdapt$i32$u8 {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rStdIntAdapt$i32$u8$9(this.rValue);
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

  $clone() { return new StdNamingAdapt$StdIntAdapt$i32$u8().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$StdIntAdapt$i32$u8$2 {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rStdIntAdapt$i32$u8$11(this.rValue);
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

  $clone() { return new StdNamingAdapt$StdIntAdapt$i32$u8$2().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$StdIntAdapt$u8$i32 {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rStdIntAdapt$u8$i32(this.rValue);
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

  $clone() { return new StdNamingAdapt$StdIntAdapt$u8$i32().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$StdParameter2Adapt$C4AulScriptEngine$b$pC4ValueNumbers {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rStdParameter2Adapt$C4AulScriptEngine$b$pC4ValueNumbers(this.rValue);
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

  $clone() { return new StdNamingAdapt$StdParameter2Adapt$C4AulScriptEngine$b$pC4ValueNumbers().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$StdParameterAdapt$C4Command$pC4ValueNumbers {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rStdParameterAdapt$C4Command$pC4ValueNumbers(this.rValue);
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

  $clone() { return new StdNamingAdapt$StdParameterAdapt$C4Command$pC4ValueNumbers().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$StdParameterAdapt$C4GameParameters$pC4Scenario {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rStdParameterAdapt$C4GameParameters$pC4Scenario(this.rValue);
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

  $clone() { return new StdNamingAdapt$StdParameterAdapt$C4GameParameters$pC4Scenario().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$StdParameterAdapt$C4NotifyingObjectList$pC4ValueNumbers {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rStdParameterAdapt$C4NotifyingObjectList$pC4ValueNumbers(this.rValue);
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

  $clone() { return new StdNamingAdapt$StdParameterAdapt$C4NotifyingObjectList$pC4ValueNumbers().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$StdParameterAdapt$C4Object$pC4ValueNumbers$2 {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rStdParameterAdapt$C4Object$pC4ValueNumbers(this.rValue);
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

  $clone() { return new StdNamingAdapt$StdParameterAdapt$C4Object$pC4ValueNumbers$2().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$StdParameterAdapt$C4ObjectList$pC4ValueNumbers {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rStdParameterAdapt$C4ObjectList$pC4ValueNumbers(this.rValue);
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

  $clone() { return new StdNamingAdapt$StdParameterAdapt$C4ObjectList$pC4ValueNumbers().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$StdParameterAdapt$C4Player$pC4ValueNumbers {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rStdParameterAdapt$C4Player$pC4ValueNumbers$2(this.rValue);
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

  $clone() { return new StdNamingAdapt$StdParameterAdapt$C4Player$pC4ValueNumbers().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$StdParameterAdapt$C4Player$pC4ValueNumbers$2 {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rStdParameterAdapt$C4Player$pC4ValueNumbers(this.rValue);
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

  $clone() { return new StdNamingAdapt$StdParameterAdapt$C4Player$pC4ValueNumbers$2().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$StdParameterAdapt$C4PropListNumbered$pC4ValueNumbers {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rStdParameterAdapt$C4PropListNumbered$pC4ValueNumbers(this.rValue);
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

  $clone() { return new StdNamingAdapt$StdParameterAdapt$C4PropListNumbered$pC4ValueNumbers().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$StdParameterAdapt$C4SGame$b {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rStdParameterAdapt$C4SGame$b(this.rValue);
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

  $clone() { return new StdNamingAdapt$StdParameterAdapt$C4SGame$b().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$StdParameterAdapt$StdCopyStrBuf$i32 {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rStdParameterAdapt$StdCopyStrBuf$i32(this.rValue);
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

  $clone() { return new StdNamingAdapt$StdParameterAdapt$StdCopyStrBuf$i32().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$StdParameterAdapt$StdDecompileAdapt$StdCopyStrBuf$i32 {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rStdParameterAdapt$StdDecompileAdapt$StdCopyStrBuf$i32(this.rValue);
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

  $clone() { return new StdNamingAdapt$StdParameterAdapt$StdDecompileAdapt$StdCopyStrBuf$i32().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$StdParameterAdapt$StdMeshInstance$x {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rStdParameterAdapt$StdMeshInstance$x(this.rValue);
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

  $clone() { return new StdNamingAdapt$StdParameterAdapt$StdMeshInstance$x().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$StdParameterAdapt$AttachedMesh$x {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rStdParameterAdapt$AttachedMesh$x(this.rValue);
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

  $clone() { return new StdNamingAdapt$StdParameterAdapt$AttachedMesh$x().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$StdParameterAdapt$StdPtrAdapt$C4Object$pC4ValueNumbers {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rStdParameterAdapt$StdPtrAdapt$C4Object$pC4ValueNumbers(this.rValue);
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

  $clone() { return new StdNamingAdapt$StdParameterAdapt$StdPtrAdapt$C4Object$pC4ValueNumbers().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$StdSTLContainerAdapt$list$C4RecordChunk {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rStdSTLContainerAdapt$list$C4RecordChunk(this.rValue);
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

  $clone() { return new StdNamingAdapt$StdSTLContainerAdapt$list$C4RecordChunk().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$StdSubMeshInstance {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rStdSubMeshInstance(this.rValue);
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

  $clone() { return new StdNamingAdapt$StdSubMeshInstance().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$TransformAdapt {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rTransformAdapt(this.rValue);
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

  $clone() { return new StdNamingAdapt$TransformAdapt().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$ValueProviderAdapt {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rValueProviderAdapt(this.rValue);
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

  $clone() { return new StdNamingAdapt$ValueProviderAdapt().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$b {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rb(this.rValue);
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

  $clone() { return new StdNamingAdapt$b().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$i32 {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$ri32(this.rValue);
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

  $clone() { return new StdNamingAdapt$i32().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$u32 {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$ru32(this.rValue);
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

  $clone() { return new StdNamingAdapt$u32().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingDefaultAdapt$C4DefGraphicsAdapt$pC4DefGraphics {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
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
        pComp.Value$StdDefaultAdapt$C4DefGraphicsAdapt$pC4DefGraphics$2(mkDefaultAdapt$rC4DefGraphicsAdapt$rpC4DefGraphics(this.rValue, this.rDefault));
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

  $clone() { return new StdNamingDefaultAdapt$C4DefGraphicsAdapt$pC4DefGraphics().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$C4Fixed$C4Fixed {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    if (pComp.hasNaming() && pComp.isSerializer() && this.rValue.op_eq$C4Fixed(this.rDefault) && !this.fStoreDefault) {
      if (pComp.Default(this.szName)) {
        return;
      }
    }
    try {
      if (pComp.Name(this.szName)) {
        if (this.fPrefillDefault && pComp.isDeserializer()) {
          this.rValue.$assign(this.rDefault);
        }
        pComp.Value$StdDefaultAdapt$C4Fixed$C4Fixed(mkDefaultAdapt$rC4Fixed$C4Fixed(this.rValue, this.rDefault));
      } else {
        this.rValue.$assign(this.rDefault);
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

  $clone() { return new StdNamingDefaultAdapt$C4Fixed$C4Fixed().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$C4Fixed$i32 {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    if (pComp.hasNaming() && pComp.isSerializer() && this.rValue.op_eq$i32(this.rDefault) && !this.fStoreDefault) {
      if (pComp.Default(this.szName)) {
        return;
      }
    }
    try {
      if (pComp.Name(this.szName)) {
        if (this.fPrefillDefault && pComp.isDeserializer()) {
          this.rValue.op_assign(this.rDefault);
        }
        pComp.Value$StdDefaultAdapt$C4Fixed$i32(mkDefaultAdapt$rC4Fixed$i32(this.rValue, this.rDefault));
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

  $clone() { return new StdNamingDefaultAdapt$C4Fixed$i32().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$C4GraphicsOverlayListAdapt$pC4GraphicsOverlay {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
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
        pComp.Value$StdDefaultAdapt$C4GraphicsOverlayListAdapt$pC4GraphicsOverlay(mkDefaultAdapt$rC4GraphicsOverlayListAdapt$rpC4GraphicsOverlay(this.rValue, this.rDefault));
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

  $clone() { return new StdNamingDefaultAdapt$C4GraphicsOverlayListAdapt$pC4GraphicsOverlay().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$C4ID$C4ID {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
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
          this.rValue.$assign(this.rDefault);
        }
        pComp.Value$StdDefaultAdapt$C4ID$C4ID(mkDefaultAdapt$rC4ID$C4ID(this.rValue, this.rDefault));
      } else {
        this.rValue.$assign(this.rDefault);
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

  $clone() { return new StdNamingDefaultAdapt$C4ID$C4ID().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$C4IDList$C4IDList {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
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
          this.rValue.$assign(this.rDefault);
        }
        pComp.Value$StdDefaultAdapt$C4IDList$C4IDList(mkDefaultAdapt$rC4IDList$C4IDList(this.rValue, this.rDefault));
      } else {
        this.rValue.$assign(this.rDefault);
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

  $clone() { return new StdNamingDefaultAdapt$C4IDList$C4IDList().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$C4KeyEventData$C4KeyEventData {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
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
          this.rValue.$assign(this.rDefault);
        }
        pComp.Value$StdDefaultAdapt$C4KeyEventData$C4KeyEventData(mkDefaultAdapt$rC4KeyEventData$C4KeyEventData(this.rValue, this.rDefault));
      } else {
        this.rValue.$assign(this.rDefault);
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

  $clone() { return new StdNamingDefaultAdapt$C4KeyEventData$C4KeyEventData().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$C4NameList$C4NameList {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
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
          this.rValue.$assign(this.rDefault);
        }
        pComp.Value$StdDefaultAdapt$C4NameList$C4NameList(mkDefaultAdapt$rC4NameList$C4NameList(this.rValue, this.rDefault));
      } else {
        this.rValue.$assign(this.rDefault);
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

  $clone() { return new StdNamingDefaultAdapt$C4NameList$C4NameList().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$C4NetFilenameAdapt$x {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
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
        pComp.Value$StdDefaultAdapt$C4NetFilenameAdapt$x(mkDefaultAdapt$rC4NetFilenameAdapt$x(this.rValue, this.rDefault));
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

  $clone() { return new StdNamingDefaultAdapt$C4NetFilenameAdapt$x().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$C4ObjectPtr$C4ObjectPtr {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    if (pComp.hasNaming() && pComp.isSerializer() && this.rValue.op_eq$C4ObjectPtr(this.rDefault) && !this.fStoreDefault) {
      if (pComp.Default(this.szName)) {
        return;
      }
    }
    try {
      if (pComp.Name(this.szName)) {
        if (this.fPrefillDefault && pComp.isDeserializer()) {
          this.rValue.$assign(this.rDefault);
        }
        pComp.Value$StdDefaultAdapt$C4ObjectPtr$C4ObjectPtr(mkDefaultAdapt$rC4ObjectPtr$C4ObjectPtr(this.rValue, this.rDefault));
      } else {
        this.rValue.$assign(this.rDefault);
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

  $clone() { return new StdNamingDefaultAdapt$C4ObjectPtr$C4ObjectPtr().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$CSync$CSync {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
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
          this.rValue.$assign(this.rDefault);
        }
        pComp.Value$StdDefaultAdapt$CSync$CSync(mkDefaultAdapt$rC4PlayerControl$CSync$C4PlayerControl$CSync(this.rValue, this.rDefault));
      } else {
        this.rValue.$assign(this.rDefault);
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

  $clone() { return new StdNamingDefaultAdapt$CSync$CSync().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$C4PlayerControlAssignmentSets$C4PlayerControlAssignmentSets {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
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
          this.rValue.$assign(this.rDefault);
        }
        pComp.Value$StdDefaultAdapt$C4PlayerControlAssignmentSets$C4PlayerControlAssignmentSets(mkDefaultAdapt$rC4PlayerControlAssignmentSets$C4PlayerControlAssignmentSets(this.rValue, this.rDefault));
      } else {
        this.rValue.$assign(this.rDefault);
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

  $clone() { return new StdNamingDefaultAdapt$C4PlayerControlAssignmentSets$C4PlayerControlAssignmentSets().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$C4PlayerControlDefs$C4PlayerControlDefs {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
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
          this.rValue.$assign(this.rDefault);
        }
        pComp.Value$StdDefaultAdapt$C4PlayerControlDefs$C4PlayerControlDefs(mkDefaultAdapt$rC4PlayerControlDefs$C4PlayerControlDefs(this.rValue, this.rDefault));
      } else {
        this.rValue.$assign(this.rDefault);
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

  $clone() { return new StdNamingDefaultAdapt$C4PlayerControlDefs$C4PlayerControlDefs().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$C4Rect$C4Rect {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
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
          this.rValue.$assign(this.rDefault);
        }
        pComp.Value$StdDefaultAdapt$C4Rect$C4Rect(mkDefaultAdapt$rC4Rect$C4Rect(this.rValue, this.rDefault));
      } else {
        this.rValue.$assign(this.rDefault);
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

  $clone() { return new StdNamingDefaultAdapt$C4Rect$C4Rect().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$C4RoundResultsPlayers$C4RoundResultsPlayers {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
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
          this.rValue.$assign(this.rDefault);
        }
        pComp.Value$StdDefaultAdapt$C4RoundResultsPlayers$C4RoundResultsPlayers(mkDefaultAdapt$rC4RoundResultsPlayers$C4RoundResultsPlayers(this.rValue, this.rDefault));
      } else {
        this.rValue.$assign(this.rDefault);
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

  $clone() { return new StdNamingDefaultAdapt$C4RoundResultsPlayers$C4RoundResultsPlayers().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$C4SVal$C4SVal {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
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
          this.rValue.$assign(this.rDefault);
        }
        pComp.Value$StdDefaultAdapt$C4SVal$C4SVal(mkDefaultAdapt$rC4SVal$C4SVal(this.rValue, this.rDefault));
      } else {
        this.rValue.$assign(this.rDefault);
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

  $clone() { return new StdNamingDefaultAdapt$C4SVal$C4SVal().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$C4StrValAdapt$StdParameterAdapt$StdCopyStrBuf$i32$StdCopyStrBuf {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
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
        pComp.Value$StdDefaultAdapt$C4StrValAdapt$StdParameterAdapt$StdCopyStrBuf$i32$StdCopyStrBuf(mkDefaultAdapt$rC4StrValAdapt$StdParameterAdapt$StdCopyStrBuf$i32$StdCopyStrBuf(this.rValue, this.rDefault));
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

  $clone() { return new StdNamingDefaultAdapt$C4StrValAdapt$StdParameterAdapt$StdCopyStrBuf$i32$StdCopyStrBuf().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$C4TargetRect$C4TargetRect {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
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
          this.rValue.$assign(this.rDefault);
        }
        pComp.Value$StdDefaultAdapt$C4TargetRect$C4TargetRect(mkDefaultAdapt$rC4TargetRect$C4TargetRect(this.rValue, this.rDefault));
      } else {
        this.rValue.$assign(this.rDefault);
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

  $clone() { return new StdNamingDefaultAdapt$C4TargetRect$C4TargetRect().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdArrayAdapt$i32$_IdFuncClass$i32$i32 {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    if (pComp.hasNaming() && pComp.isSerializer() && this.rValue.op_eq$i32(this.rDefault) && !this.fStoreDefault) {
      if (pComp.Default(this.szName)) {
        return;
      }
    }
    try {
      if (pComp.Name(this.szName)) {
        if (this.fPrefillDefault && pComp.isDeserializer()) {
          this.rValue.op_assign$i32(this.rDefault);
        }
        pComp.Value$StdDefaultAdapt$StdArrayAdapt$i32$_IdFuncClass$i32$i32(mkDefaultAdapt$rStdArrayAdapt$i32$_IdFuncClass$i32$i32(this.rValue, this.rDefault));
      } else {
        this.rValue.op_assign$i32(this.rDefault);
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

  $clone() { return new StdNamingDefaultAdapt$StdArrayAdapt$i32$_IdFuncClass$i32$i32().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdArrayAdapt$i32$_IdFuncClass$i32$x {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    if (pComp.hasNaming() && pComp.isSerializer() && this.rValue.op_eq$pi32(P(this.rDefault, 0)) && !this.fStoreDefault) {
      if (pComp.Default(this.szName)) {
        return;
      }
    }
    try {
      if (pComp.Name(this.szName)) {
        if (this.fPrefillDefault && pComp.isDeserializer()) {
          this.rValue.op_assign$pi32(P(this.rDefault, 0));
        }
        pComp.Value$StdDefaultAdapt$StdArrayAdapt$i32$_IdFuncClass$i32$x(mkDefaultAdapt$rStdArrayAdapt$i32$_IdFuncClass$i32$x(this.rValue, this.rDefault));
      } else {
        this.rValue.op_assign$pi32(P(this.rDefault, 0));
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

  $clone() { return new StdNamingDefaultAdapt$StdArrayAdapt$i32$_IdFuncClass$i32$x().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdArrayDefaultArrayAdapt$i32$pi32$_IdFuncClass$i32$pi32 {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
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
        pComp.Value$StdDefaultAdapt$StdArrayDefaultArrayAdapt$i32$pi32$_IdFuncClass$i32$pi32(mkDefaultAdapt$rStdArrayDefaultArrayAdapt$i32$pi32$_IdFuncClass$i32$pi32(this.rValue, this.rDefault));
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

  $clone() { return new StdNamingDefaultAdapt$StdArrayDefaultArrayAdapt$i32$pi32$_IdFuncClass$i32$pi32().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdArrayDefaultArrayAdapt$i32$x$_IdFuncClass$i32$x {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    if (pComp.hasNaming() && pComp.isSerializer() && this.rValue.op_eq(P(this.rDefault, 0)) && !this.fStoreDefault) {
      if (pComp.Default(this.szName)) {
        return;
      }
    }
    try {
      if (pComp.Name(this.szName)) {
        if (this.fPrefillDefault && pComp.isDeserializer()) {
          this.rValue.op_assign(P(this.rDefault, 0));
        }
        pComp.Value$StdDefaultAdapt$StdArrayDefaultArrayAdapt$i32$x$_IdFuncClass$i32$x(mkDefaultAdapt$rStdArrayDefaultArrayAdapt$i32$x$_IdFuncClass$i32$x(this.rValue, this.rDefault));
      } else {
        this.rValue.op_assign(P(this.rDefault, 0));
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

  $clone() { return new StdNamingDefaultAdapt$StdArrayDefaultArrayAdapt$i32$x$_IdFuncClass$i32$x().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdArrayDefaultArrayAdapt$i32$x$lambda$x {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    if (pComp.hasNaming() && pComp.isSerializer() && this.rValue.op_eq(P(this.rDefault, 0)) && !this.fStoreDefault) {
      if (pComp.Default(this.szName)) {
        return;
      }
    }
    try {
      if (pComp.Name(this.szName)) {
        if (this.fPrefillDefault && pComp.isDeserializer()) {
          this.rValue.op_assign(P(this.rDefault, 0));
        }
        pComp.Value$StdDefaultAdapt$StdArrayDefaultArrayAdapt$i32$x$lambda$x(mkDefaultAdapt$rStdArrayDefaultArrayAdapt$i32$x$lambda$x(this.rValue, this.rDefault));
      } else {
        this.rValue.op_assign(P(this.rDefault, 0));
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

  $clone() { return new StdNamingDefaultAdapt$StdArrayDefaultArrayAdapt$i32$x$lambda$x().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdBitfieldAdapt$i32$i32 {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
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
        pComp.Value$StdDefaultAdapt$StdBitfieldAdapt$i32$i32$2(mkDefaultAdapt$rStdBitfieldAdapt$i32$i32(this.rValue, this.rDefault));
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

  $clone() { return new StdNamingDefaultAdapt$StdBitfieldAdapt$i32$i32().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdBitfieldAdapt$i32$i32$2 {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    if (pComp.hasNaming() && pComp.isSerializer() && this.rValue.op_eq$2(this.rDefault) && !this.fStoreDefault) {
      if (pComp.Default(this.szName)) {
        return;
      }
    }
    try {
      if (pComp.Name(this.szName)) {
        if (this.fPrefillDefault && pComp.isDeserializer()) {
          this.rValue.op_assign$2(this.rDefault);
        }
        pComp.Value$StdDefaultAdapt$StdBitfieldAdapt$i32$i32$3(mkDefaultAdapt$rStdBitfieldAdapt$i32$i32$2(this.rValue, this.rDefault));
      } else {
        this.rValue.op_assign$2(this.rDefault);
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

  $clone() { return new StdNamingDefaultAdapt$StdBitfieldAdapt$i32$i32$2().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdBitfieldAdapt$u32$u32 {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
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
        pComp.Value$StdDefaultAdapt$StdBitfieldAdapt$u32$u32(mkDefaultAdapt$rStdBitfieldAdapt$u32$u32(this.rValue, this.rDefault));
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

  $clone() { return new StdNamingDefaultAdapt$StdBitfieldAdapt$u32$u32().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdBitfieldAdapt$u16$u32 {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
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
        pComp.Value$StdDefaultAdapt$StdBitfieldAdapt$u16$u32(mkDefaultAdapt$rStdBitfieldAdapt$u16$u32(this.rValue, this.rDefault));
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

  $clone() { return new StdNamingDefaultAdapt$StdBitfieldAdapt$u16$u32().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdCastAdapt$C4Fixed$i32$C4Fixed {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
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
        pComp.Value$StdDefaultAdapt$StdCastAdapt$C4Fixed$i32$C4Fixed(mkDefaultAdapt$rStdCastAdapt$C4Fixed$i32$C4Fixed(this.rValue, this.rDefault));
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

  $clone() { return new StdNamingDefaultAdapt$StdCastAdapt$C4Fixed$i32$C4Fixed().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdCastAdapt$i32$i32$i32 {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
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
        pComp.Value$StdDefaultAdapt$StdCastAdapt$i32$i32$i32(mkDefaultAdapt$rStdCastAdapt$i32$i32$i32(this.rValue, this.rDefault));
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

  $clone() { return new StdNamingDefaultAdapt$StdCastAdapt$i32$i32$i32().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdCopyStrBuf$StdCopyStrBuf {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    if (pComp.hasNaming() && pComp.isSerializer() && this.rValue.op_eq$StdStrBuf(this.rDefault) && !this.fStoreDefault) {
      if (pComp.Default(this.szName)) {
        return;
      }
    }
    try {
      if (pComp.Name(this.szName)) {
        if (this.fPrefillDefault && pComp.isDeserializer()) {
          this.rValue.$assign(this.rDefault);
        }
        pComp.Value$StdDefaultAdapt$StdCopyStrBuf$StdCopyStrBuf(mkDefaultAdapt$rStdCopyStrBuf$StdCopyStrBuf(this.rValue, this.rDefault));
      } else {
        this.rValue.$assign(this.rDefault);
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

  $clone() { return new StdNamingDefaultAdapt$StdCopyStrBuf$StdCopyStrBuf().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdCopyStrBuf$StdStrBuf {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    if (pComp.hasNaming() && pComp.isSerializer() && this.rValue.op_eq$StdStrBuf(this.rDefault) && !this.fStoreDefault) {
      if (pComp.Default(this.szName)) {
        return;
      }
    }
    try {
      if (pComp.Name(this.szName)) {
        if (this.fPrefillDefault && pComp.isDeserializer()) {
          this.rValue.op_assign$StdStrBuf(this.rDefault);
        }
        pComp.Value$StdDefaultAdapt$StdCopyStrBuf$StdStrBuf(mkDefaultAdapt$rStdCopyStrBuf$StdStrBuf(this.rValue, this.rDefault));
      } else {
        this.rValue.op_assign$StdStrBuf(this.rDefault);
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

  $clone() { return new StdNamingDefaultAdapt$StdCopyStrBuf$StdStrBuf().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdCopyStrBuf$x {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    if (pComp.hasNaming() && pComp.isSerializer() && this.rValue.op_eq$pi8(P(this.rDefault, 0)) && !this.fStoreDefault) {
      if (pComp.Default(this.szName)) {
        return;
      }
    }
    try {
      if (pComp.Name(this.szName)) {
        if (this.fPrefillDefault && pComp.isDeserializer()) {
          this.rValue.op_assign$pi8(P(this.rDefault, 0));
        }
        pComp.Value$StdDefaultAdapt$StdCopyStrBuf$x(mkDefaultAdapt$rStdCopyStrBuf$x(this.rValue, this.rDefault));
      } else {
        this.rValue.op_assign$pi8(P(this.rDefault, 0));
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

  $clone() { return new StdNamingDefaultAdapt$StdCopyStrBuf$x().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdCopyStrBuf$x$2 {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    if (pComp.hasNaming() && pComp.isSerializer() && this.rValue.op_eq$pi8(null) && !this.fStoreDefault) {
      if (pComp.Default(this.szName)) {
        return;
      }
    }
    try {
      if (pComp.Name(this.szName)) {
        if (this.fPrefillDefault && pComp.isDeserializer()) {
          this.rValue.op_assign$pi8(null);
        }
        pComp.Value$StdDefaultAdapt$StdCopyStrBuf$x$2(mkDefaultAdapt$rStdCopyStrBuf$x$2(this.rValue, this.rDefault));
      } else {
        this.rValue.op_assign$pi8(null);
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

  $clone() { return new StdNamingDefaultAdapt$StdCopyStrBuf$x$2().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdEnumAdapt$i32$i32$i32 {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
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
        pComp.Value$StdDefaultAdapt$StdEnumAdapt$i32$i32$i32$3(mkDefaultAdapt$rStdEnumAdapt$i32$i32$i32$3(this.rValue, this.rDefault));
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

  $clone() { return new StdNamingDefaultAdapt$StdEnumAdapt$i32$i32$i32().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdEnumAdapt$i32$u8$i32 {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
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
        pComp.Value$StdDefaultAdapt$StdEnumAdapt$i32$u8$i32$2(mkDefaultAdapt$rStdEnumAdapt$i32$u8$i32$2(this.rValue, this.rDefault));
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

  $clone() { return new StdNamingDefaultAdapt$StdEnumAdapt$i32$u8$i32().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdEnumAdapt$i32$i32$i32$2 {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
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
        pComp.Value$StdDefaultAdapt$StdEnumAdapt$i32$i32$i32$2(mkDefaultAdapt$rStdEnumAdapt$i32$i32$i32$2(this.rValue, this.rDefault));
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

  $clone() { return new StdNamingDefaultAdapt$StdEnumAdapt$i32$i32$i32$2().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdEnumAdapt$i32$i32$i32$3 {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
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
        pComp.Value$StdDefaultAdapt$StdEnumAdapt$i32$i32$i32(mkDefaultAdapt$rStdEnumAdapt$i32$i32$i32(this.rValue, this.rDefault));
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

  $clone() { return new StdNamingDefaultAdapt$StdEnumAdapt$i32$i32$i32$3().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdEnumAdapt$i32$u8$i32$2 {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
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
        pComp.Value$StdDefaultAdapt$StdEnumAdapt$i32$u8$i32(mkDefaultAdapt$rStdEnumAdapt$i32$u8$i32(this.rValue, this.rDefault));
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

  $clone() { return new StdNamingDefaultAdapt$StdEnumAdapt$i32$u8$i32$2().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdEnumAdapt$i32$u8$i32$3 {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
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
        pComp.Value$StdDefaultAdapt$StdEnumAdapt$i32$u8$i32$4(mkDefaultAdapt$rStdEnumAdapt$i32$u8$i32$4(this.rValue, this.rDefault));
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

  $clone() { return new StdNamingDefaultAdapt$StdEnumAdapt$i32$u8$i32$3().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdEnumAdapt$i32$u8$i32$4 {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
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
        pComp.Value$StdDefaultAdapt$StdEnumAdapt$i32$u8$i32$5(mkDefaultAdapt$rStdEnumAdapt$i32$u8$i32$5(this.rValue, this.rDefault));
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

  $clone() { return new StdNamingDefaultAdapt$StdEnumAdapt$i32$u8$i32$4().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdEnumAdapt$i32$u8$i32$5 {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
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
        pComp.Value$StdDefaultAdapt$StdEnumAdapt$i32$u8$i32$6(mkDefaultAdapt$rStdEnumAdapt$i32$u8$i32$6(this.rValue, this.rDefault));
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

  $clone() { return new StdNamingDefaultAdapt$StdEnumAdapt$i32$u8$i32$5().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdEnumAdapt$i32$u8$i32$6 {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
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
        pComp.Value$StdDefaultAdapt$StdEnumAdapt$i32$u8$i32$3(mkDefaultAdapt$rStdEnumAdapt$i32$u8$i32$3(this.rValue, this.rDefault));
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

  $clone() { return new StdNamingDefaultAdapt$StdEnumAdapt$i32$u8$i32$6().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdIntAdapt$i32$u8$i32 {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
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
        pComp.Value$StdDefaultAdapt$StdIntAdapt$i32$u8$i32$6(mkDefaultAdapt$rStdIntAdapt$i32$u8$i32$6(this.rValue, this.rDefault));
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

  $clone() { return new StdNamingDefaultAdapt$StdIntAdapt$i32$u8$i32().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdIntAdapt$i32$u8$i32$2 {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
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
        pComp.Value$StdDefaultAdapt$StdIntAdapt$i32$u8$i32$5(mkDefaultAdapt$rStdIntAdapt$i32$u8$i32$5(this.rValue, this.rDefault));
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

  $clone() { return new StdNamingDefaultAdapt$StdIntAdapt$i32$u8$i32$2().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdIntAdapt$i32$u8$i32$3 {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
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
        pComp.Value$StdDefaultAdapt$StdIntAdapt$i32$u8$i32$7(mkDefaultAdapt$rStdIntAdapt$i32$u8$i32$7(this.rValue, this.rDefault));
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

  $clone() { return new StdNamingDefaultAdapt$StdIntAdapt$i32$u8$i32$3().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdIntAdapt$i32$u8$i32$4 {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
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
        pComp.Value$StdDefaultAdapt$StdIntAdapt$i32$u8$i32$4(mkDefaultAdapt$rStdIntAdapt$i32$u8$i32$4(this.rValue, this.rDefault));
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

  $clone() { return new StdNamingDefaultAdapt$StdIntAdapt$i32$u8$i32$4().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdIntAdapt$i32$u8$i32$5 {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
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
        pComp.Value$StdDefaultAdapt$StdIntAdapt$i32$u8$i32$3(mkDefaultAdapt$rStdIntAdapt$i32$u8$i32$3(this.rValue, this.rDefault));
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

  $clone() { return new StdNamingDefaultAdapt$StdIntAdapt$i32$u8$i32$5().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdIntAdapt$i32$i32$i32 {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
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
        pComp.Value$StdDefaultAdapt$StdIntAdapt$i32$i32$i32(mkDefaultAdapt$rStdIntAdapt$i32$i32$i32(this.rValue, this.rDefault));
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

  $clone() { return new StdNamingDefaultAdapt$StdIntAdapt$i32$i32$i32().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdIntAdapt$i32$u8$i32$6 {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
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
        pComp.Value$StdDefaultAdapt$StdIntAdapt$i32$u8$i32(mkDefaultAdapt$rStdIntAdapt$i32$u8$i32(this.rValue, this.rDefault));
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

  $clone() { return new StdNamingDefaultAdapt$StdIntAdapt$i32$u8$i32$6().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdIntAdapt$i32$u8$i32$7 {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
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
        pComp.Value$StdDefaultAdapt$StdIntAdapt$i32$u8$i32$2(mkDefaultAdapt$rStdIntAdapt$i32$u8$i32$2(this.rValue, this.rDefault));
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

  $clone() { return new StdNamingDefaultAdapt$StdIntAdapt$i32$u8$i32$7().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdIntAdapt$i32$i32$i32$2 {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
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
        pComp.Value$StdDefaultAdapt$StdIntAdapt$i32$i32$i32$2(mkDefaultAdapt$rStdIntAdapt$i32$i32$i32$2(this.rValue, this.rDefault));
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

  $clone() { return new StdNamingDefaultAdapt$StdIntAdapt$i32$i32$i32$2().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdIntPackAdapt$i32$i32 {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
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
        pComp.Value$StdDefaultAdapt$StdIntPackAdapt$i32$i32(mkDefaultAdapt$rStdIntPackAdapt$i32$i32(this.rValue, this.rDefault));
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

  $clone() { return new StdNamingDefaultAdapt$StdIntPackAdapt$i32$i32().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdIntPackAdapt$i32$i32$2 {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    if (pComp.hasNaming() && pComp.isSerializer() && this.rValue.op_eq$2(this.rDefault) && !this.fStoreDefault) {
      if (pComp.Default(this.szName)) {
        return;
      }
    }
    try {
      if (pComp.Name(this.szName)) {
        if (this.fPrefillDefault && pComp.isDeserializer()) {
          this.rValue.op_assign$2(this.rDefault);
        }
        pComp.Value$StdDefaultAdapt$StdIntPackAdapt$i32$i32$2(mkDefaultAdapt$rStdIntPackAdapt$i32$i32$2(this.rValue, this.rDefault));
      } else {
        this.rValue.op_assign$2(this.rDefault);
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

  $clone() { return new StdNamingDefaultAdapt$StdIntPackAdapt$i32$i32$2().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdParameterAdapt$C4IDList$b$C4IDList {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
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
        pComp.Value$StdDefaultAdapt$StdParameterAdapt$C4IDList$b$C4IDList(mkDefaultAdapt$rStdParameterAdapt$C4IDList$b$C4IDList(this.rValue, this.rDefault));
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

  $clone() { return new StdNamingDefaultAdapt$StdParameterAdapt$C4IDList$b$C4IDList().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdParameterAdapt$C4Value$pC4ValueNumbers$C4Value {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
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
        pComp.Value$StdDefaultAdapt$StdParameterAdapt$C4Value$pC4ValueNumbers$C4Value$2(mkDefaultAdapt$rStdParameterAdapt$C4Value$pC4ValueNumbers$C4Value(this.rValue, this.rDefault));
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

  $clone() { return new StdNamingDefaultAdapt$StdParameterAdapt$C4Value$pC4ValueNumbers$C4Value().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdParameterAdapt$C4ValueMapData$pC4ValueNumbers$C4ValueMapData$2 {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
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

  $clone() { return new StdNamingDefaultAdapt$StdParameterAdapt$C4ValueMapData$pC4ValueNumbers$C4ValueMapData$2().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$StdCopyStrBuf {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    if (pComp.hasNaming() && pComp.isSerializer() && this.rValue.op_eq$StdCopyStrBuf(this.rDefault) && !this.fStoreDefault) {
      if (pComp.Default(this.szName)) {
        return;
      }
    }
    try {
      if (pComp.Name(this.szName)) {
        if (this.fPrefillDefault && pComp.isDeserializer()) {
          this.rValue.op_assign$StdCopyStrBuf(this.rDefault);
        }
        pComp.Value$StdDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$StdCopyStrBuf(mkDefaultAdapt$rStdParameterAdapt$StdCopyStrBuf$i32$StdCopyStrBuf(this.rValue, this.rDefault));
      } else {
        this.rValue.op_assign$StdCopyStrBuf(this.rDefault);
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

  $clone() { return new StdNamingDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$StdCopyStrBuf().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$x {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    if (pComp.hasNaming() && pComp.isSerializer() && this.rValue.op_eq$x(this.rDefault) && !this.fStoreDefault) {
      if (pComp.Default(this.szName)) {
        return;
      }
    }
    try {
      if (pComp.Name(this.szName)) {
        if (this.fPrefillDefault && pComp.isDeserializer()) {
          this.rValue.op_assign$x(this.rDefault);
        }
        pComp.Value$StdDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$x(mkDefaultAdapt$rStdParameterAdapt$StdCopyStrBuf$i32$x(this.rValue, this.rDefault));
      } else {
        this.rValue.op_assign$x(this.rDefault);
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

  $clone() { return new StdNamingDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$x().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$x$2 {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    if (pComp.hasNaming() && pComp.isSerializer() && this.rValue.op_eq$x$2(this.rDefault) && !this.fStoreDefault) {
      if (pComp.Default(this.szName)) {
        return;
      }
    }
    try {
      if (pComp.Name(this.szName)) {
        if (this.fPrefillDefault && pComp.isDeserializer()) {
          this.rValue.op_assign$x$2(this.rDefault);
        }
        pComp.Value$StdDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$x$2(mkDefaultAdapt$rStdParameterAdapt$StdCopyStrBuf$i32$x$2(this.rValue, this.rDefault));
      } else {
        this.rValue.op_assign$x$2(this.rDefault);
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

  $clone() { return new StdNamingDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$x$2().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdParameterAdapt$StdStrBuf$i32$StdStrBuf {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    if (pComp.hasNaming() && pComp.isSerializer() && this.rValue.op_eq$StdStrBuf(this.rDefault) && !this.fStoreDefault) {
      if (pComp.Default(this.szName)) {
        return;
      }
    }
    try {
      if (pComp.Name(this.szName)) {
        if (this.fPrefillDefault && pComp.isDeserializer()) {
          this.rValue.op_assign$StdStrBuf(this.rDefault);
        }
        pComp.Value$StdDefaultAdapt$StdParameterAdapt$StdStrBuf$i32$StdStrBuf(mkDefaultAdapt$rStdParameterAdapt$StdStrBuf$i32$StdStrBuf(this.rValue, this.rDefault));
      } else {
        this.rValue.op_assign$StdStrBuf(this.rDefault);
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

  $clone() { return new StdNamingDefaultAdapt$StdParameterAdapt$StdStrBuf$i32$StdStrBuf().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdParameterAdapt$ValidatedStdCopyStrBuf$3$i32$x {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
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
        pComp.Value$StdDefaultAdapt$StdParameterAdapt$ValidatedStdCopyStrBuf$3$i32$x(mkDefaultAdapt$rStdParameterAdapt$ValidatedStdCopyStrBuf$3$i32$x(this.rValue, this.rDefault));
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

  $clone() { return new StdNamingDefaultAdapt$StdParameterAdapt$ValidatedStdCopyStrBuf$3$i32$x().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdRuntimeValueAdapt$b$b {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
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
        pComp.Value$StdDefaultAdapt$StdRuntimeValueAdapt$b$b(mkDefaultAdapt$rStdRuntimeValueAdapt$b$b(this.rValue, this.rDefault));
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

  $clone() { return new StdNamingDefaultAdapt$StdRuntimeValueAdapt$b$b().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdSTLContainerAdapt$vector$ControlItem$vector$ControlItem {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
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
        pComp.Value$StdDefaultAdapt$StdSTLContainerAdapt$vector$ControlItem$vector$ControlItem(mkDefaultAdapt$rStdSTLContainerAdapt$vector$ControlItem$vector(this.rValue, this.rDefault));
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

  $clone() { return new StdNamingDefaultAdapt$StdSTLContainerAdapt$vector$ControlItem$vector$ControlItem().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdSTLContainerAdapt$vector$C4MaterialReaction$vector$C4MaterialReaction {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
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
        pComp.Value$StdDefaultAdapt$StdSTLContainerAdapt$vector$C4MaterialReaction$vector$C4MaterialReaction(mkDefaultAdapt$rStdSTLContainerAdapt$vector$C4MaterialReaction$vector(this.rValue, this.rDefault));
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

  $clone() { return new StdNamingDefaultAdapt$StdSTLContainerAdapt$vector$C4MaterialReaction$vector$C4MaterialReaction().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdSTLContainerAdapt$vector$ControlDownState$vector$ControlDownState {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
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
        pComp.Value$StdDefaultAdapt$StdSTLContainerAdapt$vector$ControlDownState$vector$ControlDownState(mkDefaultAdapt$rStdSTLContainerAdapt$vector$ControlDownState$vector(this.rValue, this.rDefault));
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

  $clone() { return new StdNamingDefaultAdapt$StdSTLContainerAdapt$vector$ControlDownState$vector$ControlDownState().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdSTLContainerAdapt$vector$KeyComboItem$vector$KeyComboItem {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
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
        pComp.Value$StdDefaultAdapt$StdSTLContainerAdapt$vector$KeyComboItem$vector$KeyComboItem(mkDefaultAdapt$rStdSTLContainerAdapt$vector$KeyComboItem$vector(this.rValue, this.rDefault));
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

  $clone() { return new StdNamingDefaultAdapt$StdSTLContainerAdapt$vector$KeyComboItem$vector$KeyComboItem().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdSTLContainerAdapt$vector$i32$vector$i32 {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
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
        pComp.Value$StdDefaultAdapt$StdSTLContainerAdapt$vector$i32$vector$i32(mkDefaultAdapt$rStdSTLContainerAdapt$vector$i32$vector(this.rValue, this.rDefault));
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

  $clone() { return new StdNamingDefaultAdapt$StdSTLContainerAdapt$vector$i32$vector$i32().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdStdStringAdapt$x {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    if (pComp.hasNaming() && pComp.isSerializer() && this.rValue.op_eq(P(this.rDefault, 0)) && !this.fStoreDefault) {
      if (pComp.Default(this.szName)) {
        return;
      }
    }
    try {
      if (pComp.Name(this.szName)) {
        if (this.fPrefillDefault && pComp.isDeserializer()) {
          this.rValue.op_assign(P(this.rDefault, 0));
        }
        pComp.Value$StdDefaultAdapt$StdStdStringAdapt$x(mkDefaultAdapt$rStdStdStringAdapt$x(this.rValue, this.rDefault));
      } else {
        this.rValue.op_assign(P(this.rDefault, 0));
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

  $clone() { return new StdNamingDefaultAdapt$StdStdStringAdapt$x().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdStdStringAdapt$x$2 {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    if (pComp.hasNaming() && pComp.isSerializer() && this.rValue.op_eq(P(this.rDefault, 0)) && !this.fStoreDefault) {
      if (pComp.Default(this.szName)) {
        return;
      }
    }
    try {
      if (pComp.Name(this.szName)) {
        if (this.fPrefillDefault && pComp.isDeserializer()) {
          this.rValue.op_assign(P(this.rDefault, 0));
        }
        pComp.Value$StdDefaultAdapt$StdStdStringAdapt$x$2(mkDefaultAdapt$rStdStdStringAdapt$x$2(this.rValue, this.rDefault));
      } else {
        this.rValue.op_assign(P(this.rDefault, 0));
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

  $clone() { return new StdNamingDefaultAdapt$StdStdStringAdapt$x$2().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdStdStringAdapt$x$3 {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    if (pComp.hasNaming() && pComp.isSerializer() && this.rValue.op_eq(P(this.rDefault, 0)) && !this.fStoreDefault) {
      if (pComp.Default(this.szName)) {
        return;
      }
    }
    try {
      if (pComp.Name(this.szName)) {
        if (this.fPrefillDefault && pComp.isDeserializer()) {
          this.rValue.op_assign(P(this.rDefault, 0));
        }
        pComp.Value$StdDefaultAdapt$StdStdStringAdapt$x$3(mkDefaultAdapt$rStdStdStringAdapt$x$3(this.rValue, this.rDefault));
      } else {
        this.rValue.op_assign(P(this.rDefault, 0));
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

  $clone() { return new StdNamingDefaultAdapt$StdStdStringAdapt$x$3().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdStrBuf$x {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    if (pComp.hasNaming() && pComp.isSerializer() && this.rValue.op_eq$pi8(P(this.rDefault, 0)) && !this.fStoreDefault) {
      if (pComp.Default(this.szName)) {
        return;
      }
    }
    try {
      if (pComp.Name(this.szName)) {
        if (this.fPrefillDefault && pComp.isDeserializer()) {
          $.StdStrBuf.prototype.op_assign$pi8.call(this.rValue, P(this.rDefault, 0));
        }
        pComp.Value$StdDefaultAdapt$StdStrBuf$x(mkDefaultAdapt$rStdStrBuf$x(this.rValue, this.rDefault));
      } else {
        $.StdStrBuf.prototype.op_assign$pi8.call(this.rValue, P(this.rDefault, 0));
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

  $clone() { return new StdNamingDefaultAdapt$StdStrBuf$x().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdStrBuf$x$2 {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    if (pComp.hasNaming() && pComp.isSerializer() && this.rValue.op_eq$pi8(P(this.rDefault, 0)) && !this.fStoreDefault) {
      if (pComp.Default(this.szName)) {
        return;
      }
    }
    try {
      if (pComp.Name(this.szName)) {
        if (this.fPrefillDefault && pComp.isDeserializer()) {
          $.StdStrBuf.prototype.op_assign$pi8.call(this.rValue, P(this.rDefault, 0));
        }
        pComp.Value$StdDefaultAdapt$StdStrBuf$x$2(mkDefaultAdapt$rStdStrBuf$x$2(this.rValue, this.rDefault));
      } else {
        $.StdStrBuf.prototype.op_assign$pi8.call(this.rValue, P(this.rDefault, 0));
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

  $clone() { return new StdNamingDefaultAdapt$StdStrBuf$x$2().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdStrBuf$x$3 {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    if (pComp.hasNaming() && pComp.isSerializer() && this.rValue.op_eq$pi8(P(this.rDefault, 0)) && !this.fStoreDefault) {
      if (pComp.Default(this.szName)) {
        return;
      }
    }
    try {
      if (pComp.Name(this.szName)) {
        if (this.fPrefillDefault && pComp.isDeserializer()) {
          $.StdStrBuf.prototype.op_assign$pi8.call(this.rValue, P(this.rDefault, 0));
        }
        pComp.Value$StdDefaultAdapt$StdStrBuf$x$3(mkDefaultAdapt$rStdStrBuf$x$3(this.rValue, this.rDefault));
      } else {
        $.StdStrBuf.prototype.op_assign$pi8.call(this.rValue, P(this.rDefault, 0));
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

  $clone() { return new StdNamingDefaultAdapt$StdStrBuf$x$3().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdStrBuf$x$4 {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    if (pComp.hasNaming() && pComp.isSerializer() && this.rValue.op_eq$pi8(P(this.rDefault, 0)) && !this.fStoreDefault) {
      if (pComp.Default(this.szName)) {
        return;
      }
    }
    try {
      if (pComp.Name(this.szName)) {
        if (this.fPrefillDefault && pComp.isDeserializer()) {
          $.StdStrBuf.prototype.op_assign$pi8.call(this.rValue, P(this.rDefault, 0));
        }
        pComp.Value$StdDefaultAdapt$StdStrBuf$x$4(mkDefaultAdapt$rStdStrBuf$x$4(this.rValue, this.rDefault));
      } else {
        $.StdStrBuf.prototype.op_assign$pi8.call(this.rValue, P(this.rDefault, 0));
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

  $clone() { return new StdNamingDefaultAdapt$StdStrBuf$x$4().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdStringAdapt$x {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    if (pComp.hasNaming() && pComp.isSerializer() && this.rValue.op_eq(P(this.rDefault, 0)) && !this.fStoreDefault) {
      if (pComp.Default(this.szName)) {
        return;
      }
    }
    try {
      if (pComp.Name(this.szName)) {
        if (this.fPrefillDefault && pComp.isDeserializer()) {
          this.rValue.op_assign(P(this.rDefault, 0));
        }
        pComp.Value$StdDefaultAdapt$StdStringAdapt$x$2(mkDefaultAdapt$rStdStringAdapt$x(this.rValue, this.rDefault));
      } else {
        this.rValue.op_assign(P(this.rDefault, 0));
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

  $clone() { return new StdNamingDefaultAdapt$StdStringAdapt$x().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdStringAdapt$x$2 {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    if (pComp.hasNaming() && pComp.isSerializer() && this.rValue.op_eq(P(this.rDefault, 0)) && !this.fStoreDefault) {
      if (pComp.Default(this.szName)) {
        return;
      }
    }
    try {
      if (pComp.Name(this.szName)) {
        if (this.fPrefillDefault && pComp.isDeserializer()) {
          this.rValue.op_assign(P(this.rDefault, 0));
        }
        pComp.Value$StdDefaultAdapt$StdStringAdapt$x$3(mkDefaultAdapt$rStdStringAdapt$x$2(this.rValue, this.rDefault));
      } else {
        this.rValue.op_assign(P(this.rDefault, 0));
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

  $clone() { return new StdNamingDefaultAdapt$StdStringAdapt$x$2().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdStringAdapt$x$3 {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    if (pComp.hasNaming() && pComp.isSerializer() && this.rValue.op_eq(P(this.rDefault, 0)) && !this.fStoreDefault) {
      if (pComp.Default(this.szName)) {
        return;
      }
    }
    try {
      if (pComp.Name(this.szName)) {
        if (this.fPrefillDefault && pComp.isDeserializer()) {
          this.rValue.op_assign(P(this.rDefault, 0));
        }
        pComp.Value$StdDefaultAdapt$StdStringAdapt$x$4(mkDefaultAdapt$rStdStringAdapt$x$3(this.rValue, this.rDefault));
      } else {
        this.rValue.op_assign(P(this.rDefault, 0));
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

  $clone() { return new StdNamingDefaultAdapt$StdStringAdapt$x$3().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdStringAdapt$x$4 {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    if (pComp.hasNaming() && pComp.isSerializer() && this.rValue.op_eq(P(this.rDefault, 0)) && !this.fStoreDefault) {
      if (pComp.Default(this.szName)) {
        return;
      }
    }
    try {
      if (pComp.Name(this.szName)) {
        if (this.fPrefillDefault && pComp.isDeserializer()) {
          this.rValue.op_assign(P(this.rDefault, 0));
        }
        pComp.Value$StdDefaultAdapt$StdStringAdapt$x$5(mkDefaultAdapt$rStdStringAdapt$x$4(this.rValue, this.rDefault));
      } else {
        this.rValue.op_assign(P(this.rDefault, 0));
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

  $clone() { return new StdNamingDefaultAdapt$StdStringAdapt$x$4().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdStringAdapt$x$6 {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    if (pComp.hasNaming() && pComp.isSerializer() && this.rValue.op_eq(P(this.rDefault, 0)) && !this.fStoreDefault) {
      if (pComp.Default(this.szName)) {
        return;
      }
    }
    try {
      if (pComp.Name(this.szName)) {
        if (this.fPrefillDefault && pComp.isDeserializer()) {
          this.rValue.op_assign(P(this.rDefault, 0));
        }
        pComp.Value$StdDefaultAdapt$StdStringAdapt$x$7(mkDefaultAdapt$rStdStringAdapt$x$6(this.rValue, this.rDefault));
      } else {
        this.rValue.op_assign(P(this.rDefault, 0));
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

  $clone() { return new StdNamingDefaultAdapt$StdStringAdapt$x$6().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdStringAdapt$x$7 {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    if (pComp.hasNaming() && pComp.isSerializer() && this.rValue.op_eq(P(this.rDefault, 0)) && !this.fStoreDefault) {
      if (pComp.Default(this.szName)) {
        return;
      }
    }
    try {
      if (pComp.Name(this.szName)) {
        if (this.fPrefillDefault && pComp.isDeserializer()) {
          this.rValue.op_assign(P(this.rDefault, 0));
        }
        pComp.Value$StdDefaultAdapt$StdStringAdapt$x$8(mkDefaultAdapt$rStdStringAdapt$x$7(this.rValue, this.rDefault));
      } else {
        this.rValue.op_assign(P(this.rDefault, 0));
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

  $clone() { return new StdNamingDefaultAdapt$StdStringAdapt$x$7().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdStringAdapt$x$8 {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    if (pComp.hasNaming() && pComp.isSerializer() && this.rValue.op_eq(P(this.rDefault, 0)) && !this.fStoreDefault) {
      if (pComp.Default(this.szName)) {
        return;
      }
    }
    try {
      if (pComp.Name(this.szName)) {
        if (this.fPrefillDefault && pComp.isDeserializer()) {
          this.rValue.op_assign(P(this.rDefault, 0));
        }
        pComp.Value$StdDefaultAdapt$StdStringAdapt$x$9(mkDefaultAdapt$rStdStringAdapt$x$8(this.rValue, this.rDefault));
      } else {
        this.rValue.op_assign(P(this.rDefault, 0));
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

  $clone() { return new StdNamingDefaultAdapt$StdStringAdapt$x$8().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdStringAdapt$x$9 {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    if (pComp.hasNaming() && pComp.isSerializer() && this.rValue.op_eq(P(this.rDefault, 0)) && !this.fStoreDefault) {
      if (pComp.Default(this.szName)) {
        return;
      }
    }
    try {
      if (pComp.Name(this.szName)) {
        if (this.fPrefillDefault && pComp.isDeserializer()) {
          this.rValue.op_assign(P(this.rDefault, 0));
        }
        pComp.Value$StdDefaultAdapt$StdStringAdapt$x$10(mkDefaultAdapt$rStdStringAdapt$x$9(this.rValue, this.rDefault));
      } else {
        this.rValue.op_assign(P(this.rDefault, 0));
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

  $clone() { return new StdNamingDefaultAdapt$StdStringAdapt$x$9().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdStringAdapt$x$10 {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    if (pComp.hasNaming() && pComp.isSerializer() && this.rValue.op_eq(P(this.rDefault, 0)) && !this.fStoreDefault) {
      if (pComp.Default(this.szName)) {
        return;
      }
    }
    try {
      if (pComp.Name(this.szName)) {
        if (this.fPrefillDefault && pComp.isDeserializer()) {
          this.rValue.op_assign(P(this.rDefault, 0));
        }
        pComp.Value$StdDefaultAdapt$StdStringAdapt$x$11(mkDefaultAdapt$rStdStringAdapt$x$10(this.rValue, this.rDefault));
      } else {
        this.rValue.op_assign(P(this.rDefault, 0));
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

  $clone() { return new StdNamingDefaultAdapt$StdStringAdapt$x$10().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdStringAdapt$x$11 {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    if (pComp.hasNaming() && pComp.isSerializer() && this.rValue.op_eq(P(this.rDefault, 0)) && !this.fStoreDefault) {
      if (pComp.Default(this.szName)) {
        return;
      }
    }
    try {
      if (pComp.Name(this.szName)) {
        if (this.fPrefillDefault && pComp.isDeserializer()) {
          this.rValue.op_assign(P(this.rDefault, 0));
        }
        pComp.Value$StdDefaultAdapt$StdStringAdapt$x$12(mkDefaultAdapt$rStdStringAdapt$x$11(this.rValue, this.rDefault));
      } else {
        this.rValue.op_assign(P(this.rDefault, 0));
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

  $clone() { return new StdNamingDefaultAdapt$StdStringAdapt$x$11().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdStringAdapt$x$12 {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    if (pComp.hasNaming() && pComp.isSerializer() && this.rValue.op_eq(P(this.rDefault, 0)) && !this.fStoreDefault) {
      if (pComp.Default(this.szName)) {
        return;
      }
    }
    try {
      if (pComp.Name(this.szName)) {
        if (this.fPrefillDefault && pComp.isDeserializer()) {
          this.rValue.op_assign(P(this.rDefault, 0));
        }
        pComp.Value$StdDefaultAdapt$StdStringAdapt$x$13(mkDefaultAdapt$rStdStringAdapt$x$12(this.rValue, this.rDefault));
      } else {
        this.rValue.op_assign(P(this.rDefault, 0));
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

  $clone() { return new StdNamingDefaultAdapt$StdStringAdapt$x$12().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdStringAdapt$x$13 {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    if (pComp.hasNaming() && pComp.isSerializer() && this.rValue.op_eq(P(this.rDefault, 0)) && !this.fStoreDefault) {
      if (pComp.Default(this.szName)) {
        return;
      }
    }
    try {
      if (pComp.Name(this.szName)) {
        if (this.fPrefillDefault && pComp.isDeserializer()) {
          this.rValue.op_assign(P(this.rDefault, 0));
        }
        pComp.Value$StdDefaultAdapt$StdStringAdapt$x$14(mkDefaultAdapt$rStdStringAdapt$x$13(this.rValue, this.rDefault));
      } else {
        this.rValue.op_assign(P(this.rDefault, 0));
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

  $clone() { return new StdNamingDefaultAdapt$StdStringAdapt$x$13().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdStringAdapt$pi8 {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
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
        pComp.Value$StdDefaultAdapt$StdStringAdapt$pi8(mkDefaultAdapt$rStdStringAdapt$pi8(this.rValue, this.rDefault));
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

  $clone() { return new StdNamingDefaultAdapt$StdStringAdapt$pi8().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$ValidatedStdCopyStrBuf$10$x {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    if (pComp.hasNaming() && pComp.isSerializer() && this.rValue.op_eq$x(this.rDefault) && !this.fStoreDefault) {
      if (pComp.Default(this.szName)) {
        return;
      }
    }
    try {
      if (pComp.Name(this.szName)) {
        if (this.fPrefillDefault && pComp.isDeserializer()) {
          this.rValue.op_assign$x(this.rDefault);
        }
        pComp.Value$StdDefaultAdapt$ValidatedStdCopyStrBuf$10$x(mkDefaultAdapt$rValidatedStdCopyStrBuf$10$x(this.rValue, this.rDefault));
      } else {
        this.rValue.op_assign$x(this.rDefault);
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

  $clone() { return new StdNamingDefaultAdapt$ValidatedStdCopyStrBuf$10$x().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$ValidatedStdCopyStrBuf$3$x {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    if (pComp.hasNaming() && pComp.isSerializer() && this.rValue.op_eq$x(this.rDefault) && !this.fStoreDefault) {
      if (pComp.Default(this.szName)) {
        return;
      }
    }
    try {
      if (pComp.Name(this.szName)) {
        if (this.fPrefillDefault && pComp.isDeserializer()) {
          this.rValue.op_assign$x(this.rDefault);
        }
        pComp.Value$StdDefaultAdapt$ValidatedStdCopyStrBuf$3$x(mkDefaultAdapt$rValidatedStdCopyStrBuf$3$x(this.rValue, this.rDefault));
      } else {
        this.rValue.op_assign$x(this.rDefault);
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

  $clone() { return new StdNamingDefaultAdapt$ValidatedStdCopyStrBuf$3$x().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$ValidatedStdCopyStrBuf$4$x {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    if (pComp.hasNaming() && pComp.isSerializer() && this.rValue.op_eq$x(this.rDefault) && !this.fStoreDefault) {
      if (pComp.Default(this.szName)) {
        return;
      }
    }
    try {
      if (pComp.Name(this.szName)) {
        if (this.fPrefillDefault && pComp.isDeserializer()) {
          this.rValue.op_assign$x(this.rDefault);
        }
        pComp.Value$StdDefaultAdapt$ValidatedStdCopyStrBuf$4$x(mkDefaultAdapt$rValidatedStdCopyStrBuf$4$x(this.rValue, this.rDefault));
      } else {
        this.rValue.op_assign$x(this.rDefault);
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

  $clone() { return new StdNamingDefaultAdapt$ValidatedStdCopyStrBuf$4$x().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$b$b {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    if (pComp.hasNaming() && pComp.isSerializer() && (this.rValue.a[this.rValue.o] ? 1 : 0) === (this.rDefault ? 1 : 0) && !this.fStoreDefault) {
      if (pComp.Default(this.szName)) {
        return;
      }
    }
    try {
      if (pComp.Name(this.szName)) {
        if (this.fPrefillDefault && pComp.isDeserializer()) {
          this.rValue.a[this.rValue.o] = this.rDefault;
        }
        pComp.Value$StdDefaultAdapt$b$b(mkDefaultAdapt$rb$b(this.rValue, this.rDefault));
      } else {
        this.rValue.a[this.rValue.o] = this.rDefault;
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

  $clone() { return new StdNamingDefaultAdapt$b$b().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$i32$i16 {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    if (pComp.hasNaming() && pComp.isSerializer() && this.rValue.a[this.rValue.o] === this.rDefault && !this.fStoreDefault) {
      if (pComp.Default(this.szName)) {
        return;
      }
    }
    try {
      if (pComp.Name(this.szName)) {
        if (this.fPrefillDefault && pComp.isDeserializer()) {
          this.rValue.a[this.rValue.o] = this.rDefault;
        }
        pComp.Value$StdDefaultAdapt$i32$i16(mkDefaultAdapt$ri32$i16(this.rValue, this.rDefault));
      } else {
        this.rValue.a[this.rValue.o] = this.rDefault;
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

  $clone() { return new StdNamingDefaultAdapt$i32$i16().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$u8$i32 {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    if (pComp.hasNaming() && pComp.isSerializer() && this.rValue.a[this.rValue.o] === this.rDefault && !this.fStoreDefault) {
      if (pComp.Default(this.szName)) {
        return;
      }
    }
    try {
      if (pComp.Name(this.szName)) {
        if (this.fPrefillDefault && pComp.isDeserializer()) {
          this.rValue.a[this.rValue.o] = this.rDefault & 0xff;
        }
        pComp.Value$StdDefaultAdapt$u8$i32(mkDefaultAdapt$ru8$i32(this.rValue, this.rDefault));
      } else {
        this.rValue.a[this.rValue.o] = this.rDefault & 0xff;
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

  $clone() { return new StdNamingDefaultAdapt$u8$i32().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$u32$u32 {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    if (pComp.hasNaming() && pComp.isSerializer() && this.rValue.a[this.rValue.o] === this.rDefault && !this.fStoreDefault) {
      if (pComp.Default(this.szName)) {
        return;
      }
    }
    try {
      if (pComp.Name(this.szName)) {
        if (this.fPrefillDefault && pComp.isDeserializer()) {
          this.rValue.a[this.rValue.o] = this.rDefault;
        }
        pComp.Value$StdDefaultAdapt$u32$u32(mkDefaultAdapt$ru32$u32(this.rValue, this.rDefault));
      } else {
        this.rValue.a[this.rValue.o] = this.rDefault;
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

  $clone() { return new StdNamingDefaultAdapt$u32$u32().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdParameter2Adapt$C4AulScriptEngine$b$pC4ValueNumbers {
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
    this.rObj.CompileFunc$pStdCompiler$b$pC4ValueNumbers(pComp, this.rPar1, this.rPar2.a[this.rPar2.o]);
  }

  $clone() { return new StdParameter2Adapt$C4AulScriptEngine$b$pC4ValueNumbers().$assign(this); }
  $assign(o) {
    this.rObj = o.rObj;
    this.rPar1 = o.rPar1;
    this.rPar2 = o.rPar2;
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

export class StdParameter2Adapt$C4Effect$pC4Object$pC4ValueNumbers {
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

  $clone() { return new StdParameter2Adapt$C4Effect$pC4Object$pC4ValueNumbers().$assign(this); }
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

export class StdParameter2Adapt$C4Game$CompileSettings$pC4ValueNumbers {
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
    this.rObj.CompileFunc(pComp, this.rPar1.$clone(), this.rPar2.a[this.rPar2.o]);
  }

  $clone() { return new StdParameter2Adapt$C4Game$CompileSettings$pC4ValueNumbers().$assign(this); }
  $assign(o) {
    this.rObj = o.rObj;
    this.rPar1 = o.rPar1;
    this.rPar2 = o.rPar2;
    return this;
  }
}

export class StdParameter2Adapt$C4Game$CompileSettings$pC4ValueNumbers$2 {
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
    this.rObj.CompileFunc(pComp, this.rPar1.$clone(), this.rPar2.a[this.rPar2.o]);
  }

  $clone() { return new StdParameter2Adapt$C4Game$CompileSettings$pC4ValueNumbers$2().$assign(this); }
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

export class StdParameter2Adapt$StdDecompileAdapt$C4Effect$pC4Object$pC4ValueNumbers {
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
    this.rObj.CompileFunc$pStdCompiler$mpC4Object$rpC4ValueNumbers(pComp, this.rPar1, $tmp(this.rPar2.a[this.rPar2.o]));
  }

  $clone() { return new StdParameter2Adapt$StdDecompileAdapt$C4Effect$pC4Object$pC4ValueNumbers().$assign(this); }
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

export class StdParameterAdapt$Denumerator$pAttachedMesh {
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

  $clone() { return new StdParameterAdapt$Denumerator$pAttachedMesh().$assign(this); }
  $assign(o) {
    this.rObj = o.rObj;
    this.Par = o.Par;
    return this;
  }
}

export class StdParameterAdapt$C4Command$pC4ValueNumbers {
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

  $clone() { return new StdParameterAdapt$C4Command$pC4ValueNumbers().$assign(this); }
  $assign(o) {
    this.rObj = o.rObj;
    this.Par = o.Par;
    return this;
  }
}

export class StdParameterAdapt$C4ConfigGamepad$b {
  static $layout = [["rObj.Button", 0, "i32", 12], ["rObj.AxisMin", 48, "u32", 6], ["rObj.AxisMax", 72, "u32", 6], ["rObj.AxisCalibrated", 96, "u8", 6], ["Par", 104, "u8", 0]];
  static $size = 108;
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

  $clone() { return new StdParameterAdapt$C4ConfigGamepad$b().$assign(this); }
  $assign(o) {
    this.rObj = o.rObj;
    this.Par = o.Par;
    return this;
  }
}

export class StdParameterAdapt$C4GameParameters$pC4Scenario {
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

  $clone() { return new StdParameterAdapt$C4GameParameters$pC4Scenario().$assign(this); }
  $assign(o) {
    this.rObj = o.rObj;
    this.Par = o.Par;
    return this;
  }
}

export class StdParameterAdapt$C4IDList$b {
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

  op_eq(nValue) {
    return this.rObj.op_eq(nValue);
  }

  op_assign(nValue) {
    this.rObj.$assign(nValue);
    return this;
  }

  $clone() { return new StdParameterAdapt$C4IDList$b().$assign(this); }
  $assign(o) {
    this.rObj = o.rObj;
    this.Par = o.Par;
    return this;
  }
}

export class StdParameterAdapt$C4KeyCodeEx$pStdCopyStrBuf {
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

  $clone() { return new StdParameterAdapt$C4KeyCodeEx$pStdCopyStrBuf().$assign(this); }
  $assign(o) {
    this.rObj = o.rObj;
    this.Par = o.Par;
    return this;
  }
}

export class StdParameterAdapt$C4LSector$pC4ValueNumbers {
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

  $clone() { return new StdParameterAdapt$C4LSector$pC4ValueNumbers().$assign(this); }
  $assign(o) {
    this.rObj = o.rObj;
    this.Par = o.Par;
    return this;
  }
}

export class StdParameterAdapt$C4NotifyingObjectList$pC4ValueNumbers {
  rObj = null;
  Par = null;

  init(rObj, rPar) {
    this.rObj = rObj;
    this.Par = $tmp(rPar.a[rPar.o]);
    return this;
  }

  CompileFunc(pComp) {
    this.rObj.CompileFunc$pStdCompiler$pC4ValueNumbers(pComp, this.Par.a[this.Par.o]);
  }

  $clone() { return new StdParameterAdapt$C4NotifyingObjectList$pC4ValueNumbers().$assign(this); }
  $assign(o) {
    this.rObj = o.rObj;
    this.Par = o.Par;
    return this;
  }
}

export class StdParameterAdapt$C4Object$pC4ValueNumbers {
  rObj = null;
  Par = null;

  init(rObj, rPar) {
    this.rObj = rObj;
    this.Par = $tmp(rPar.a[rPar.o]);
    return this;
  }

  CompileFunc(pComp) {
    this.rObj.CompileFunc$pStdCompiler$pC4ValueNumbers(pComp, this.Par.a[this.Par.o]);
  }

  $clone() { return new StdParameterAdapt$C4Object$pC4ValueNumbers().$assign(this); }
  $assign(o) {
    this.rObj = o.rObj;
    this.Par = o.Par;
    return this;
  }
}

export class StdParameterAdapt$C4Object$pC4ValueNumbers$2 {
  rObj = null;
  Par = null;

  init(rObj, rPar) {
    this.rObj = rObj;
    this.Par = rPar;
    return this;
  }

  CompileFunc(pComp) {
    this.rObj.CompileFunc$pStdCompiler$pC4ValueNumbers(pComp, this.Par);
  }

  $clone() { return new StdParameterAdapt$C4Object$pC4ValueNumbers$2().$assign(this); }
  $assign(o) {
    this.rObj = o.rObj;
    this.Par = o.Par;
    return this;
  }
}

export class StdParameterAdapt$C4ObjectList$pC4ValueNumbers {
  rObj = null;
  Par = null;

  init(rObj, rPar) {
    this.rObj = rObj;
    this.Par = $tmp(rPar.a[rPar.o]);
    return this;
  }

  CompileFunc(pComp) {
    this.rObj.CompileFunc$pStdCompiler$pC4ValueNumbers(pComp, this.Par.a[this.Par.o]);
  }

  $clone() { return new StdParameterAdapt$C4ObjectList$pC4ValueNumbers().$assign(this); }
  $assign(o) {
    this.rObj = o.rObj;
    this.Par = o.Par;
    return this;
  }
}

export class StdParameterAdapt$C4Player$pC4ValueNumbers {
  rObj = null;
  Par = null;

  init(rObj, rPar) {
    this.rObj = rObj;
    this.Par = $tmp(rPar.a[rPar.o]);
    return this;
  }

  CompileFunc(pComp) {
    this.rObj.CompileFunc$pStdCompiler$pC4ValueNumbers(pComp, this.Par.a[this.Par.o]);
  }

  $clone() { return new StdParameterAdapt$C4Player$pC4ValueNumbers().$assign(this); }
  $assign(o) {
    this.rObj = o.rObj;
    this.Par = o.Par;
    return this;
  }
}

export class StdParameterAdapt$C4Player$pC4ValueNumbers$2 {
  rObj = null;
  Par = null;

  init(rObj, rPar) {
    this.rObj = rObj;
    this.Par = rPar;
    return this;
  }

  CompileFunc(pComp) {
    this.rObj.CompileFunc$pStdCompiler$pC4ValueNumbers(pComp, this.Par);
  }

  $clone() { return new StdParameterAdapt$C4Player$pC4ValueNumbers$2().$assign(this); }
  $assign(o) {
    this.rObj = o.rObj;
    this.Par = o.Par;
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

export class StdParameterAdapt$C4PropListNumbered$pC4ValueNumbers {
  rObj = null;
  Par = null;

  init(rObj, rPar) {
    this.rObj = rObj;
    this.Par = $tmp(rPar.a[rPar.o]);
    return this;
  }

  CompileFunc(pComp) {
    $.C4PropListNumbered.prototype.CompileFunc$pStdCompiler$pC4ValueNumbers.call(this.rObj, pComp, this.Par.a[this.Par.o]);
  }

  $clone() { return new StdParameterAdapt$C4PropListNumbered$pC4ValueNumbers().$assign(this); }
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

export class StdParameterAdapt$C4SGame$b {
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

  $clone() { return new StdParameterAdapt$C4SGame$b().$assign(this); }
  $assign(o) {
    this.rObj = o.rObj;
    this.Par = o.Par;
    return this;
  }
}

export class StdParameterAdapt$C4SHead$b {
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

  $clone() { return new StdParameterAdapt$C4SHead$b().$assign(this); }
  $assign(o) {
    this.rObj = o.rObj;
    this.Par = o.Par;
    return this;
  }
}

export class StdParameterAdapt$C4Scenario$b {
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

  $clone() { return new StdParameterAdapt$C4Scenario$b().$assign(this); }
  $assign(o) {
    this.rObj = o.rObj;
    this.Par = o.Par;
    return this;
  }
}

export class StdParameterAdapt$C4Scenario$b$2 {
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

  $clone() { return new StdParameterAdapt$C4Scenario$b$2().$assign(this); }
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

export class StdParameterAdapt$C4Shape$pC4Shape {
  rObj = null;
  Par = null;

  init(rObj, rPar) {
    this.rObj = rObj;
    this.Par = rPar;
    return this;
  }

  CompileFunc(pComp) {
    this.rObj.CompileFunc$pStdCompiler$pC4Shape(pComp, this.Par);
  }

  $clone() { return new StdParameterAdapt$C4Shape$pC4Shape().$assign(this); }
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

  op_eq(nValue) {
    return this.rObj.op_eq(nValue);
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

export class StdParameterAdapt$C4ValueMapData$pC4ValueNumbers$2 {
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

  op_eq(nValue) {
    return this.rObj.op_eq(nValue);
  }

  op_assign(nValue) {
    this.rObj.$assign(nValue);
    return this;
  }

  $clone() { return new StdParameterAdapt$C4ValueMapData$pC4ValueNumbers$2().$assign(this); }
  $assign(o) {
    this.rObj = o.rObj;
    this.Par = o.Par;
    return this;
  }
}

export class StdParameterAdapt$StdContextPtrAdapt$StdMeshInstance$StdMesh$x {
  rObj = null;
  Par = null;

  init(rObj, rPar) {
    this.Par = rPar;
    this.rObj = rObj;
    return this;
  }

  CompileFunc(pComp) {
    this.rObj.CompileFunc$pStdCompiler$x(pComp, this.Par);
  }

  $clone() { return new StdParameterAdapt$StdContextPtrAdapt$StdMeshInstance$StdMesh$x().$assign(this); }
  $assign(o) {
    this.rObj = o.rObj;
    this.Par = o.Par;
    return this;
  }
}

export class StdParameterAdapt$StdCopyStrBuf$i32 {
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

  op_eq$x$2(nValue) {
    return this.rObj.op_eq$pi8(P(nValue, 0));
  }

  op_assign$x$2(nValue) {
    this.rObj.op_assign$pi8(P(nValue, 0));
    return this;
  }

  GetObj() {
    return this.rObj;
  }

  op_eq$x$3(nValue) {
    return this.rObj.op_eq$pi8(P(nValue, 0));
  }

  op_eq$x(nValue) {
    return this.rObj.op_eq$pi8(P(nValue, 0));
  }

  op_assign$x$3(nValue) {
    this.rObj.op_assign$pi8(P(nValue, 0));
    return this;
  }

  op_assign$x(nValue) {
    this.rObj.op_assign$pi8(P(nValue, 0));
    return this;
  }

  op_eq$StdCopyStrBuf(nValue) {
    return this.rObj.op_eq$StdStrBuf(nValue);
  }

  op_assign$StdCopyStrBuf(nValue) {
    this.rObj.$assign(nValue);
    return this;
  }

  $clone() { return new StdParameterAdapt$StdCopyStrBuf$i32().$assign(this); }
  $assign(o) {
    this.rObj = o.rObj;
    this.Par = o.Par;
    return this;
  }
}

export class StdParameterAdapt$StdCopyStrBuf$i32$2 {
  rObj = null;
  Par = null;

  init(rObj, rPar) {
    this.rObj = rObj;
    this.Par = $tmp(rPar.a[rPar.o]);
    return this;
  }

  CompileFunc(pComp) {
    $.StdStrBuf.prototype.CompileFunc.call(this.rObj, pComp, this.Par.a[this.Par.o]);
  }

  $clone() { return new StdParameterAdapt$StdCopyStrBuf$i32$2().$assign(this); }
  $assign(o) {
    this.rObj = o.rObj;
    this.Par = o.Par;
    return this;
  }
}

export class StdParameterAdapt$StdDecompileAdapt$C4Command$pC4ValueNumbers {
  rObj = null;
  Par = null;

  init(rObj, rPar) {
    this.rObj = rObj;
    this.Par = $tmp(rPar.a[rPar.o]);
    return this;
  }

  CompileFunc(pComp) {
    this.rObj.CompileFunc$pStdCompiler$rpC4ValueNumbers(pComp, $tmp(this.Par.a[this.Par.o]));
  }

  $clone() { return new StdParameterAdapt$StdDecompileAdapt$C4Command$pC4ValueNumbers().$assign(this); }
  $assign(o) {
    this.rObj = o.rObj;
    this.Par = o.Par;
    return this;
  }
}

export class StdParameterAdapt$StdDecompileAdapt$C4Object$pC4ValueNumbers {
  rObj = null;
  Par = null;

  init(rObj, rPar) {
    this.rObj = rObj;
    this.Par = $tmp(rPar.a[rPar.o]);
    return this;
  }

  CompileFunc(pComp) {
    this.rObj.CompileFunc$pStdCompiler$rpC4ValueNumbers(pComp, $tmp(this.Par.a[this.Par.o]));
  }

  $clone() { return new StdParameterAdapt$StdDecompileAdapt$C4Object$pC4ValueNumbers().$assign(this); }
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

export class StdParameterAdapt$StdDecompileAdapt$StdCopyStrBuf$i32 {
  rObj = null;
  Par = null;

  init(rObj, rPar) {
    this.rObj = rObj;
    this.Par = rPar;
    return this;
  }

  CompileFunc(pComp) {
    this.rObj.CompileFunc$pStdCompiler$mi32(pComp, this.Par);
  }

  $clone() { return new StdParameterAdapt$StdDecompileAdapt$StdCopyStrBuf$i32().$assign(this); }
  $assign(o) {
    this.rObj = o.rObj;
    this.Par = o.Par;
    return this;
  }
}

export class StdParameterAdapt$StdDecompileAdapt$StdMeshInstance$x {
  rObj = null;
  Par = null;

  init(rObj, rPar) {
    this.Par = rPar;
    this.rObj = rObj;
    return this;
  }

  CompileFunc(pComp) {
    this.rObj.CompileFunc$pStdCompiler$x(pComp, this.Par);
  }

  $clone() { return new StdParameterAdapt$StdDecompileAdapt$StdMeshInstance$x().$assign(this); }
  $assign(o) {
    this.rObj = o.rObj;
    this.Par = o.Par;
    return this;
  }
}

export class StdParameterAdapt$StdDecompileAdapt$StdMeshInstanceAnimationNode$pStdMesh {
  rObj = null;
  Par = null;

  init(rObj, rPar) {
    this.rObj = rObj;
    this.Par = rPar;
    return this;
  }

  CompileFunc(pComp) {
    this.rObj.CompileFunc$pStdCompiler$pStdMesh(pComp, this.Par);
  }

  $clone() { return new StdParameterAdapt$StdDecompileAdapt$StdMeshInstanceAnimationNode$pStdMesh().$assign(this); }
  $assign(o) {
    this.rObj = o.rObj;
    this.Par = o.Par;
    return this;
  }
}

export class StdParameterAdapt$StdMeshInstance$x {
  rObj = null;
  Par = null;

  init(rObj, rPar) {
    this.Par = rPar;
    this.rObj = rObj;
    return this;
  }

  CompileFunc(pComp) {
    this.rObj.CompileFunc(pComp, this.Par);
  }

  $clone() { return new StdParameterAdapt$StdMeshInstance$x().$assign(this); }
  $assign(o) {
    this.rObj = o.rObj;
    this.Par = o.Par;
    return this;
  }
}

export class StdParameterAdapt$AttachedMesh$x {
  rObj = null;
  Par = null;

  init(rObj, rPar) {
    this.Par = rPar;
    this.rObj = rObj;
    return this;
  }

  CompileFunc(pComp) {
    this.rObj.CompileFunc(pComp, this.Par);
  }

  $clone() { return new StdParameterAdapt$AttachedMesh$x().$assign(this); }
  $assign(o) {
    this.rObj = o.rObj;
    this.Par = o.Par;
    return this;
  }
}

export class StdParameterAdapt$StdMeshInstanceAnimationNode$pStdMesh {
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

  $clone() { return new StdParameterAdapt$StdMeshInstanceAnimationNode$pStdMesh().$assign(this); }
  $assign(o) {
    this.rObj = o.rObj;
    this.Par = o.Par;
    return this;
  }
}

export class StdParameterAdapt$StdPtrAdapt$C4Command$pC4ValueNumbers {
  rObj = null;
  Par = null;

  init(rObj, rPar) {
    this.rObj = rObj;
    this.Par = $tmp(rPar.a[rPar.o]);
    return this;
  }

  CompileFunc(pComp) {
    this.rObj.CompileFunc$pStdCompiler$rpC4ValueNumbers(pComp, $tmp(this.Par.a[this.Par.o]));
  }

  $clone() { return new StdParameterAdapt$StdPtrAdapt$C4Command$pC4ValueNumbers().$assign(this); }
  $assign(o) {
    this.rObj = o.rObj;
    this.Par = o.Par;
    return this;
  }
}

export class StdParameterAdapt$StdPtrAdapt$C4Object$pC4ValueNumbers {
  rObj = null;
  Par = null;

  init(rObj, rPar) {
    this.rObj = rObj;
    this.Par = $tmp(rPar.a[rPar.o]);
    return this;
  }

  CompileFunc(pComp) {
    this.rObj.CompileFunc$pStdCompiler$rpC4ValueNumbers(pComp, $tmp(this.Par.a[this.Par.o]));
  }

  $clone() { return new StdParameterAdapt$StdPtrAdapt$C4Object$pC4ValueNumbers().$assign(this); }
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

export class StdParameterAdapt$StdPtrAdapt$StdMeshInstanceAnimationNode$pStdMesh {
  rObj = null;
  Par = null;

  init(rObj, rPar) {
    this.rObj = rObj;
    this.Par = rPar;
    return this;
  }

  CompileFunc(pComp) {
    this.rObj.CompileFunc$pStdCompiler$pStdMesh(pComp, this.Par);
  }

  $clone() { return new StdParameterAdapt$StdPtrAdapt$StdMeshInstanceAnimationNode$pStdMesh().$assign(this); }
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

export class StdParameterAdapt$ValidatedStdCopyStrBuf$3$i32 {
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

  op_eq(nValue) {
    return this.rObj.op_eq$x(nValue);
  }

  op_assign(nValue) {
    this.rObj.op_assign$x(nValue);
    return this;
  }

  $clone() { return new StdParameterAdapt$ValidatedStdCopyStrBuf$3$i32().$assign(this); }
  $assign(o) {
    this.rObj = o.rObj;
    this.Par = o.Par;
    return this;
  }
}

export class StdSTLContainerAdapt$list$C4PlayerControlAssignmentSet {
  rStruct = null;
  eSep = 0;

  init(rStruct, eSep) {
    this.eSep = eSep;
    this.rStruct = rStruct;
    return this;
  }

  CompileFunc(pComp) {
    let $t1;
    let deserializing = pComp.isDeserializer();
    let fNaming = pComp.hasNaming();
    if (!deserializing) {
      if (!fNaming) {
        const iSize = [this.rStruct.length | 0];
        pComp.Value$ri32(P(iSize, 0));
      }
      for (let i = $begin(this.rStruct); !i.eq($end(this.rStruct)); i.inc()) {
        if (!i.eq($begin(this.rStruct)) && this.eSep !== 0) {
          pComp.Separator(this.eSep);
        }
        pComp.Value$rC4PlayerControlAssignmentSet(i.v);
      }
    } else {
      this.rStruct.length = 0;
      const iSize = [0];
      if (!fNaming) {
        pComp.Value$ru32(P(iSize, 0));
      }
      do {
        if (!fNaming && !(($t1 = iSize[0], iSize[0] = iSize[0] - 1 >>> 0, $t1) !== 0)) {
          break;
        }
        try {
          let val = new $.C4PlayerControlAssignmentSet().init();
          pComp.Value$rC4PlayerControlAssignmentSet(val);
          $vpush(this.rStruct, val.$clone());
        } catch ($e3) {
          if ($e3 instanceof $.StdCompiler$NotFoundException) {
            const pEx = $e3;
            $delete(pEx);
            break;
          } else {
            throw $e3;
          }
        }
      } while (this.eSep === 0 || pComp.Separator(this.eSep));
    }
  }

  $clone() { return new StdSTLContainerAdapt$list$C4PlayerControlAssignmentSet().$assign(this); }
  $assign(o) {
    this.rStruct = o.rStruct;
    this.eSep = o.eSep;
    return this;
  }
}

export class StdSTLContainerAdapt$vector$ControlDownState {
  rStruct = null;
  eSep = 0;

  init(rStruct, eSep) {
    this.eSep = eSep;
    this.rStruct = rStruct;
    return this;
  }

  CompileFunc(pComp) {
    let $t1;
    let deserializing = pComp.isDeserializer();
    let fNaming = pComp.hasNaming();
    if (!deserializing) {
      if (!fNaming) {
        const iSize = [this.rStruct.length | 0];
        pComp.Value$ri32(P(iSize, 0));
      }
      for (let i = $begin(this.rStruct); !i.eq($end(this.rStruct)); i.inc()) {
        if (!i.eq($begin(this.rStruct)) && this.eSep !== 0) {
          pComp.Separator(this.eSep);
        }
        pComp.Value$rC4PlayerControl$CSync$ControlDownState(i.v);
      }
    } else {
      this.rStruct.length = 0;
      const iSize = [0];
      if (!fNaming) {
        pComp.Value$ru32(P(iSize, 0));
      }
      do {
        if (!fNaming && !(($t1 = iSize[0], iSize[0] = iSize[0] - 1 >>> 0, $t1) !== 0)) {
          break;
        }
        try {
          let val = new $.C4PlayerControl$CSync$ControlDownState().init$v();
          pComp.Value$rC4PlayerControl$CSync$ControlDownState(val);
          $vpush(this.rStruct, val.$clone());
        } catch ($e3) {
          if ($e3 instanceof $.StdCompiler$NotFoundException) {
            const pEx = $e3;
            $delete(pEx);
            break;
          } else {
            throw $e3;
          }
        }
      } while (this.eSep === 0 || pComp.Separator(this.eSep));
    }
  }

  op_eq(nValue) {
    return seq_equal(this.rStruct, nValue);
  }

  op_assign(nValue) {
    this.rStruct = nValue.slice();
    return this;
  }

  $clone() { return new StdSTLContainerAdapt$vector$ControlDownState().$assign(this); }
  $assign(o) {
    this.rStruct = o.rStruct;
    this.eSep = o.eSep;
    return this;
  }
}

export class StdSTLContainerAdapt$vector$KeyComboItem {
  rStruct = null;
  eSep = 0;

  init(rStruct, eSep) {
    this.eSep = eSep;
    this.rStruct = rStruct;
    return this;
  }

  CompileFunc(pComp) {
    let $t1;
    let deserializing = pComp.isDeserializer();
    let fNaming = pComp.hasNaming();
    if (!deserializing) {
      if (!fNaming) {
        const iSize = [this.rStruct.length | 0];
        pComp.Value$ri32(P(iSize, 0));
      }
      for (let i = $begin(this.rStruct); !i.eq($end(this.rStruct)); i.inc()) {
        if (!i.eq($begin(this.rStruct)) && this.eSep !== 0) {
          pComp.Separator(this.eSep);
        }
        pComp.Value$rC4PlayerControlAssignment$KeyComboItem(i.v);
      }
    } else {
      this.rStruct.length = 0;
      const iSize = [0];
      if (!fNaming) {
        pComp.Value$ru32(P(iSize, 0));
      }
      do {
        if (!fNaming && !(($t1 = iSize[0], iSize[0] = iSize[0] - 1 >>> 0, $t1) !== 0)) {
          break;
        }
        try {
          let val = new $.C4PlayerControlAssignment$KeyComboItem().None();
          pComp.Value$rC4PlayerControlAssignment$KeyComboItem(val);
          $vpush(this.rStruct, val.$clone());
        } catch ($e3) {
          if ($e3 instanceof $.StdCompiler$NotFoundException) {
            const pEx = $e3;
            $delete(pEx);
            break;
          } else {
            throw $e3;
          }
        }
      } while (this.eSep === 0 || pComp.Separator(this.eSep));
    }
  }

  op_eq(nValue) {
    return seq_equal(this.rStruct, nValue);
  }

  op_assign(nValue) {
    this.rStruct = nValue.slice();
    return this;
  }

  $clone() { return new StdSTLContainerAdapt$vector$KeyComboItem().$assign(this); }
  $assign(o) {
    this.rStruct = o.rStruct;
    this.eSep = o.eSep;
    return this;
  }
}

export class StdSTLContainerAdapt$vector$C4PlayerControlAssignment {
  rStruct = null;
  eSep = 0;

  init(rStruct, eSep) {
    this.eSep = eSep;
    this.rStruct = rStruct;
    return this;
  }

  CompileFunc(pComp) {
    let $t1;
    let deserializing = pComp.isDeserializer();
    let fNaming = pComp.hasNaming();
    if (!deserializing) {
      if (!fNaming) {
        const iSize = [this.rStruct.length | 0];
        pComp.Value$ri32(P(iSize, 0));
      }
      for (let i = $begin(this.rStruct); !i.eq($end(this.rStruct)); i.inc()) {
        if (!i.eq($begin(this.rStruct)) && this.eSep !== 0) {
          pComp.Separator(this.eSep);
        }
        pComp.Value$rC4PlayerControlAssignment(i.v);
      }
    } else {
      this.rStruct.length = 0;
      const iSize = [0];
      if (!fNaming) {
        pComp.Value$ru32(P(iSize, 0));
      }
      do {
        if (!fNaming && !(($t1 = iSize[0], iSize[0] = iSize[0] - 1 >>> 0, $t1) !== 0)) {
          break;
        }
        try {
          let val = new $.C4PlayerControlAssignment().init();
          pComp.Value$rC4PlayerControlAssignment(val);
          $vpush(this.rStruct, val.$clone());
        } catch ($e3) {
          if ($e3 instanceof $.StdCompiler$NotFoundException) {
            const pEx = $e3;
            $delete(pEx);
            break;
          } else {
            throw $e3;
          }
        }
      } while (this.eSep === 0 || pComp.Separator(this.eSep));
    }
  }

  $clone() { return new StdSTLContainerAdapt$vector$C4PlayerControlAssignment().$assign(this); }
  $assign(o) {
    this.rStruct = o.rStruct;
    this.eSep = o.eSep;
    return this;
  }
}

export class StdSTLContainerAdapt$vector$C4ScenarioParameterDef {
  rStruct = null;
  eSep = 0;

  init(rStruct, eSep) {
    this.eSep = eSep;
    this.rStruct = rStruct;
    return this;
  }

  CompileFunc(pComp) {
    let $t1;
    let deserializing = pComp.isDeserializer();
    let fNaming = pComp.hasNaming();
    if (!deserializing) {
      if (!fNaming) {
        const iSize = [this.rStruct.length | 0];
        pComp.Value$ri32(P(iSize, 0));
      }
      for (let i = $begin(this.rStruct); !i.eq($end(this.rStruct)); i.inc()) {
        if (!i.eq($begin(this.rStruct)) && this.eSep !== 0) {
          pComp.Separator(this.eSep);
        }
        pComp.Value$rC4ScenarioParameterDef(i.v);
      }
    } else {
      this.rStruct.length = 0;
      const iSize = [0];
      if (!fNaming) {
        pComp.Value$ru32(P(iSize, 0));
      }
      do {
        if (!fNaming && !(($t1 = iSize[0], iSize[0] = iSize[0] - 1 >>> 0, $t1) !== 0)) {
          break;
        }
        try {
          let val = new $.C4ScenarioParameterDef().init();
          pComp.Value$rC4ScenarioParameterDef(val);
          $vpush(this.rStruct, val.$clone());
        } catch ($e3) {
          if ($e3 instanceof $.StdCompiler$NotFoundException) {
            const pEx = $e3;
            $delete(pEx);
            break;
          } else {
            throw $e3;
          }
        }
      } while (this.eSep === 0 || pComp.Separator(this.eSep));
    }
  }

  $clone() { return new StdSTLContainerAdapt$vector$C4ScenarioParameterDef().$assign(this); }
  $assign(o) {
    this.rStruct = o.rStruct;
    this.eSep = o.eSep;
    return this;
  }
}

export class StdSTLContainerAdapt$vector$i32 {
  rStruct = null;
  eSep = 0;

  init(rStruct, eSep) {
    this.eSep = eSep;
    this.rStruct = rStruct;
    return this;
  }

  CompileFunc(pComp) {
    let $t1;
    let deserializing = pComp.isDeserializer();
    let fNaming = pComp.hasNaming();
    if (!deserializing) {
      if (!fNaming) {
        const iSize = [this.rStruct.length | 0];
        pComp.Value$ri32(P(iSize, 0));
      }
      for (let i = $begin(this.rStruct); !i.eq($end(this.rStruct)); i.inc()) {
        if (!i.eq($begin(this.rStruct)) && this.eSep !== 0) {
          pComp.Separator(this.eSep);
        }
        pComp.Value$ri32($tmp(i.v));
      }
    } else {
      this.rStruct.length = 0;
      const iSize = [0];
      if (!fNaming) {
        pComp.Value$ru32(P(iSize, 0));
      }
      do {
        if (!fNaming && !(($t1 = iSize[0], iSize[0] = iSize[0] - 1 >>> 0, $t1) !== 0)) {
          break;
        }
        try {
          const val = [0];
          pComp.Value$ri32(P(val, 0));
          this.rStruct.push(val[0]);
        } catch ($e3) {
          if ($e3 instanceof $.StdCompiler$NotFoundException) {
            const pEx = $e3;
            $delete(pEx);
            break;
          } else {
            throw $e3;
          }
        }
      } while (this.eSep === 0 || pComp.Separator(this.eSep));
    }
  }

  op_eq(nValue) {
    return seq_equal(this.rStruct, nValue);
  }

  op_assign(nValue) {
    this.rStruct = nValue.slice();
    return this;
  }

  $clone() { return new StdSTLContainerAdapt$vector$i32().$assign(this); }
  $assign(o) {
    this.rStruct = o.rStruct;
    this.eSep = o.eSep;
    return this;
  }
}

export class StdDefaultAdapt$StdBitfieldAdapt$u8$u32 {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdBitfieldAdapt$u8(this.rValue);
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

  $clone() { return new StdDefaultAdapt$StdBitfieldAdapt$u8$u32().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdParameterAdapt$C4Value$pC4ValueNumbers$C4Value$2 {
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

  $clone() { return new StdDefaultAdapt$StdParameterAdapt$C4Value$pC4ValueNumbers$C4Value$2().$assign(this); }
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
      pComp.Value$rStdParameterAdapt$C4ValueMapData$pC4ValueNumbers$2(this.rValue);
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

export class StdDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$x$3 {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdParameterAdapt$StdCopyStrBuf$i32(this.rValue);
    } catch ($e1) {
      if ($e1 instanceof $.StdCompiler$NotFoundException) {
        const pEx = $e1;
        this.rValue.op_assign$x$3(this.rDefault);
        $delete(pEx);
      } else {
        throw $e1;
      }
    }
  }

  $clone() { return new StdDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$x$3().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdParameterAdapt$StdStrBuf$i32$StdCopyStrBuf {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdParameterAdapt$StdStrBuf$i32$2(this.rValue);
    } catch ($e1) {
      if ($e1 instanceof $.StdCompiler$NotFoundException) {
        const pEx = $e1;
        this.rValue.op_assign$StdCopyStrBuf(this.rDefault);
        $delete(pEx);
      } else {
        throw $e1;
      }
    }
  }

  $clone() { return new StdDefaultAdapt$StdParameterAdapt$StdStrBuf$i32$StdCopyStrBuf().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdParameterAdapt$StdStrBuf$i32$x {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdParameterAdapt$StdStrBuf$i32$2(this.rValue);
    } catch ($e1) {
      if ($e1 instanceof $.StdCompiler$NotFoundException) {
        const pEx = $e1;
        this.rValue.op_assign$x(this.rDefault);
        $delete(pEx);
      } else {
        throw $e1;
      }
    }
  }

  $clone() { return new StdDefaultAdapt$StdParameterAdapt$StdStrBuf$i32$x().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdParameterAdapt$StdStrBuf$i32$x$2 {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdParameterAdapt$StdStrBuf$i32$2(this.rValue);
    } catch ($e1) {
      if ($e1 instanceof $.StdCompiler$NotFoundException) {
        const pEx = $e1;
        this.rValue.op_assign$x(this.rDefault);
        $delete(pEx);
      } else {
        throw $e1;
      }
    }
  }

  $clone() { return new StdDefaultAdapt$StdParameterAdapt$StdStrBuf$i32$x$2().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdSTLContainerAdapt$vector$C4KeyCodeEx$vector$C4KeyCodeEx {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdSTLContainerAdapt$vector$C4KeyCodeEx(this.rValue);
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

  $clone() { return new StdDefaultAdapt$StdSTLContainerAdapt$vector$C4KeyCodeEx$vector$C4KeyCodeEx().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdStringAdapt$x$5 {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdStringAdapt(this.rValue);
    } catch ($e1) {
      if ($e1 instanceof $.StdCompiler$NotFoundException) {
        const pEx = $e1;
        this.rValue.op_assign(P(this.rDefault, 0));
        $delete(pEx);
      } else {
        throw $e1;
      }
    }
  }

  $clone() { return new StdDefaultAdapt$StdStringAdapt$x$5().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$StdStringAdapt$x$14 {
  rValue = null;
  rDefault = null;

  init(rValue, rDefault) {
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    try {
      pComp.Value$rStdStringAdapt(this.rValue);
    } catch ($e1) {
      if ($e1 instanceof $.StdCompiler$NotFoundException) {
        const pEx = $e1;
        this.rValue.op_assign(P(this.rDefault, 0));
        $delete(pEx);
      } else {
        throw $e1;
      }
    }
  }

  $clone() { return new StdDefaultAdapt$StdStringAdapt$x$14().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.rDefault = o.rDefault;
    return this;
  }
}

export class StdDefaultAdapt$i32$i32 {
  static $layout = [["rValue", 0, "i32", 0], ["rDefault", 4, "i32", 0]];
  static $size = 8;
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

export class StdNamingAdapt$C4Client {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rC4Client(this.rValue);
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

  $clone() { return new StdNamingAdapt$C4Client().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$C4ConfigGeneral {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rC4ConfigGeneral(this.rValue);
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

  $clone() { return new StdNamingAdapt$C4ConfigGeneral().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$C4Control {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rC4Control(this.rValue);
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

  $clone() { return new StdNamingAdapt$C4Control().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$C4Def {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rC4Def(this.rValue);
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

  $clone() { return new StdNamingAdapt$C4Def().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$C4DefGraphicsAdapt {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rC4DefGraphicsAdapt(this.rValue);
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

  $clone() { return new StdNamingAdapt$C4DefGraphicsAdapt().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$C4FolderHead {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rC4FolderHead(this.rValue);
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

  $clone() { return new StdNamingAdapt$C4FolderHead().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$C4MapFolderData {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rC4MapFolderData(this.rValue);
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

  $clone() { return new StdNamingAdapt$C4MapFolderData().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$C4MusicSystem {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rC4MusicSystem(this.rValue);
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

  $clone() { return new StdNamingAdapt$C4MusicSystem().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$HostilitySet {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rC4Player$HostilitySet(this.rValue);
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

  $clone() { return new StdNamingAdapt$HostilitySet().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$C4Rect {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rC4Rect(this.rValue);
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

  $clone() { return new StdNamingAdapt$C4Rect().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$C4ValueNumbers {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
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

export class StdNamingAdapt$StdArrayAdapt$pC4GameRes$StdPtrAdapt$C4GameRes {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rStdArrayAdapt$pC4GameRes$StdPtrAdapt$C4GameRes(this.rValue);
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

  $clone() { return new StdNamingAdapt$StdArrayAdapt$pC4GameRes$StdPtrAdapt$C4GameRes().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$StdArrayAdapt$pC4RoundResultsPlayer$StdPtrAdapt$C4RoundResultsPlayer {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rStdArrayAdapt$pC4RoundResultsPlayer$StdPtrAdapt$C4RoundResultsPlayer(this.rValue);
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

  $clone() { return new StdNamingAdapt$StdArrayAdapt$pC4RoundResultsPlayer$StdPtrAdapt$C4RoundResultsPlayer().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$StdArrayDefaultAdapt$i32$i32$_IdFuncClass$i32 {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rStdArrayDefaultAdapt$i32$i32$_IdFuncClass$i32(this.rValue);
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

  $clone() { return new StdNamingAdapt$StdArrayDefaultAdapt$i32$i32$_IdFuncClass$i32().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$StdCopyBuf {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rStdCopyBuf(this.rValue);
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

  $clone() { return new StdNamingAdapt$StdCopyBuf().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$StdCopyStrBuf {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rStdCopyStrBuf(this.rValue);
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

  $clone() { return new StdNamingAdapt$StdCopyStrBuf().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$StdIntAdapt$i32$i32 {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rStdIntAdapt$i32$i32$2(this.rValue);
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

  $clone() { return new StdNamingAdapt$StdIntAdapt$i32$i32().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$StdIntAdapt$i32$i32$2 {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rStdIntAdapt$i32$i32$7(this.rValue);
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

  $clone() { return new StdNamingAdapt$StdIntAdapt$i32$i32$2().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$StdParameterAdapt$C4Object$pC4ValueNumbers {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rStdParameterAdapt$C4Object$pC4ValueNumbers$2(this.rValue);
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

  $clone() { return new StdNamingAdapt$StdParameterAdapt$C4Object$pC4ValueNumbers().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$StdParameterAdapt$C4PropList$pC4ValueNumbers {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
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

export class StdNamingAdapt$StdParameterAdapt$C4SHead$b {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rStdParameterAdapt$C4SHead$b(this.rValue);
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

  $clone() { return new StdNamingAdapt$StdParameterAdapt$C4SHead$b().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$StdSTLContainerAdapt$vector$Option {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rStdSTLContainerAdapt$vector$Option(this.rValue);
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

  $clone() { return new StdNamingAdapt$StdSTLContainerAdapt$vector$Option().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingAdapt$StdStrBuf {
  rValue = null;
  szName = null;

  init(rValue, szName) {
    this.szName = szName;
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Name(this.szName);
    try {
      pComp.Value$rStdStrBuf(this.rValue);
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

  $clone() { return new StdNamingAdapt$StdStrBuf().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdBitfieldAdapt$u8$u32 {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
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
        pComp.Value$StdDefaultAdapt$StdBitfieldAdapt$u8$u32(mkDefaultAdapt$rStdBitfieldAdapt$u8$u32(this.rValue, this.rDefault));
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

  $clone() { return new StdNamingDefaultAdapt$StdBitfieldAdapt$u8$u32().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
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
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
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
        pComp.Value$StdDefaultAdapt$StdParameterAdapt$C4ValueMapData$pC4ValueNumbers$C4ValueMapData$2(mkDefaultAdapt$rStdParameterAdapt$C4ValueMapData$pC4ValueNumbers$C4ValueMapData$2(this.rValue, this.rDefault));
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

export class StdNamingDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$x$3 {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    if (pComp.hasNaming() && pComp.isSerializer() && this.rValue.op_eq$x$3(this.rDefault) && !this.fStoreDefault) {
      if (pComp.Default(this.szName)) {
        return;
      }
    }
    try {
      if (pComp.Name(this.szName)) {
        if (this.fPrefillDefault && pComp.isDeserializer()) {
          this.rValue.op_assign$x$3(this.rDefault);
        }
        pComp.Value$StdDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$x$3(mkDefaultAdapt$rStdParameterAdapt$StdCopyStrBuf$i32$x$3(this.rValue, this.rDefault));
      } else {
        this.rValue.op_assign$x$3(this.rDefault);
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

  $clone() { return new StdNamingDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$x$3().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdParameterAdapt$StdStrBuf$i32$StdCopyStrBuf {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    if (pComp.hasNaming() && pComp.isSerializer() && this.rValue.op_eq$StdCopyStrBuf(this.rDefault) && !this.fStoreDefault) {
      if (pComp.Default(this.szName)) {
        return;
      }
    }
    try {
      if (pComp.Name(this.szName)) {
        if (this.fPrefillDefault && pComp.isDeserializer()) {
          this.rValue.op_assign$StdCopyStrBuf(this.rDefault);
        }
        pComp.Value$StdDefaultAdapt$StdParameterAdapt$StdStrBuf$i32$StdCopyStrBuf(mkDefaultAdapt$rStdParameterAdapt$StdStrBuf$i32$StdCopyStrBuf(this.rValue, this.rDefault));
      } else {
        this.rValue.op_assign$StdCopyStrBuf(this.rDefault);
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

  $clone() { return new StdNamingDefaultAdapt$StdParameterAdapt$StdStrBuf$i32$StdCopyStrBuf().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdParameterAdapt$StdStrBuf$i32$x {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    if (pComp.hasNaming() && pComp.isSerializer() && this.rValue.op_eq$x(this.rDefault) && !this.fStoreDefault) {
      if (pComp.Default(this.szName)) {
        return;
      }
    }
    try {
      if (pComp.Name(this.szName)) {
        if (this.fPrefillDefault && pComp.isDeserializer()) {
          this.rValue.op_assign$x(this.rDefault);
        }
        pComp.Value$StdDefaultAdapt$StdParameterAdapt$StdStrBuf$i32$x$2(mkDefaultAdapt$rStdParameterAdapt$StdStrBuf$i32$x(this.rValue, this.rDefault));
      } else {
        this.rValue.op_assign$x(this.rDefault);
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

  $clone() { return new StdNamingDefaultAdapt$StdParameterAdapt$StdStrBuf$i32$x().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdSTLContainerAdapt$vector$C4KeyCodeEx$vector$C4KeyCodeEx {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
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
        pComp.Value$StdDefaultAdapt$StdSTLContainerAdapt$vector$C4KeyCodeEx$vector$C4KeyCodeEx(mkDefaultAdapt$rStdSTLContainerAdapt$vector$C4KeyCodeEx$vector(this.rValue, this.rDefault));
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

  $clone() { return new StdNamingDefaultAdapt$StdSTLContainerAdapt$vector$C4KeyCodeEx$vector$C4KeyCodeEx().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdStrBuf$StdStrBuf {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    if (pComp.hasNaming() && pComp.isSerializer() && this.rValue.op_eq$StdStrBuf(this.rDefault) && !this.fStoreDefault) {
      if (pComp.Default(this.szName)) {
        return;
      }
    }
    try {
      if (pComp.Name(this.szName)) {
        if (this.fPrefillDefault && pComp.isDeserializer()) {
          this.rValue.$assign(this.rDefault);
        }
        pComp.Value$StdDefaultAdapt$StdStrBuf$StdStrBuf(mkDefaultAdapt$rStdStrBuf$StdStrBuf(this.rValue, this.rDefault));
      } else {
        this.rValue.$assign(this.rDefault);
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

  $clone() { return new StdNamingDefaultAdapt$StdStrBuf$StdStrBuf().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$StdStringAdapt$x$5 {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    if (pComp.hasNaming() && pComp.isSerializer() && this.rValue.op_eq(P(this.rDefault, 0)) && !this.fStoreDefault) {
      if (pComp.Default(this.szName)) {
        return;
      }
    }
    try {
      if (pComp.Name(this.szName)) {
        if (this.fPrefillDefault && pComp.isDeserializer()) {
          this.rValue.op_assign(P(this.rDefault, 0));
        }
        pComp.Value$StdDefaultAdapt$StdStringAdapt$x$6(mkDefaultAdapt$rStdStringAdapt$x$5(this.rValue, this.rDefault));
      } else {
        this.rValue.op_assign(P(this.rDefault, 0));
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

  $clone() { return new StdNamingDefaultAdapt$StdStringAdapt$x$5().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdNamingDefaultAdapt$i32$i32 {
  rValue = null;
  szName = null;
  rDefault = null;
  fPrefillDefault = false;
  fStoreDefault = false;

  init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
    this.szName = szName;
    this.fPrefillDefault = fPrefillDefault;
    this.fStoreDefault = fStoreDefault;
    this.rValue = rValue;
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    if (pComp.hasNaming() && pComp.isSerializer() && this.rValue.a[this.rValue.o] === this.rDefault && !this.fStoreDefault) {
      if (pComp.Default(this.szName)) {
        return;
      }
    }
    try {
      if (pComp.Name(this.szName)) {
        if (this.fPrefillDefault && pComp.isDeserializer()) {
          this.rValue.a[this.rValue.o] = this.rDefault;
        }
        pComp.Value$StdDefaultAdapt$i32$i32(mkDefaultAdapt$ri32$i32(this.rValue, this.rDefault));
      } else {
        this.rValue.a[this.rValue.o] = this.rDefault;
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

  $clone() { return new StdNamingDefaultAdapt$i32$i32().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    this.szName = o.szName;
    this.rDefault = o.rDefault;
    this.fPrefillDefault = o.fPrefillDefault;
    this.fStoreDefault = o.fStoreDefault;
    return this;
  }
}

export class StdDecompileAdapt$C4DrawTransform {
  static $layout = [["rValue.mat", 0, "f32", 9], ["rValue.FlipDir", 36, "i32", 0]];
  static $size = 40;
  rValue = null;

  init(rValue) {
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    0;
    pComp.Value$rC4DrawTransform(this.rValue);
  }

  $clone() { return new StdDecompileAdapt$C4DrawTransform().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    return this;
  }
}

export class StdDecompileAdapt$Scenario {
  rValue = null;

  init(rValue) {
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    0;
    pComp.Value$rC4MapFolderData$Scenario(this.rValue);
  }

  $clone() { return new StdDecompileAdapt$Scenario().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    return this;
  }
}

export class StdDecompileAdapt$C4MessageBoardQuery {
  rValue = null;

  init(rValue) {
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    0;
    pComp.Value$rC4MessageBoardQuery(this.rValue);
  }

  $clone() { return new StdDecompileAdapt$C4MessageBoardQuery().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    return this;
  }
}

export class StdDecompileAdapt$C4Network2ResCore {
  rValue = null;

  init(rValue) {
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    0;
    pComp.Value$rC4Network2ResCore(this.rValue);
  }

  $clone() { return new StdDecompileAdapt$C4Network2ResCore().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    return this;
  }
}

export class StdDecompileAdapt$C4Object {
  rValue = null;

  init(rValue) {
    this.rValue = rValue;
    return this;
  }

  CompileFunc$pStdCompiler$rpC4ValueNumbers(pComp, pars) {
    0;
    pComp.Value$StdParameterAdapt$C4Object$pC4ValueNumbers$2(mkParAdapt$rC4Object$rpC4ValueNumbers(this.rValue, $tmp(pars.a[pars.o])));
  }

  $clone() { return new StdDecompileAdapt$C4Object().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    return this;
  }
}

export class StdDecompileAdapt$C4PacketBase {
  rValue = null;

  init(rValue) {
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    0;
    pComp.Value$rC4PacketBase(this.rValue);
  }

  $clone() { return new StdDecompileAdapt$C4PacketBase().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    return this;
  }
}

export class StdDecompileAdapt$C4PlayerInfo {
  rValue = null;

  init(rValue) {
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    0;
    pComp.Value$rC4PlayerInfo(this.rValue);
  }

  $clone() { return new StdDecompileAdapt$C4PlayerInfo().$assign(this); }
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

export class StdDecompileAdapt$C4RecordChunk {
  rValue = null;

  init(rValue) {
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    0;
    pComp.Value$rC4RecordChunk(this.rValue);
  }

  $clone() { return new StdDecompileAdapt$C4RecordChunk().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    return this;
  }
}

export class StdDecompileAdapt$C4RoundResultsPlayer {
  rValue = null;

  init(rValue) {
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    0;
    pComp.Value$rC4RoundResultsPlayer(this.rValue);
  }

  $clone() { return new StdDecompileAdapt$C4RoundResultsPlayer().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    return this;
  }
}

export class StdDecompileAdapt$C4Team {
  rValue = null;

  init(rValue) {
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    0;
    pComp.Value$rC4Team(this.rValue);
  }

  $clone() { return new StdDecompileAdapt$C4Team().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    return this;
  }
}

export class StdDecompileAdapt$StdCopyStrBuf {
  rValue = null;

  init(rValue) {
    this.rValue = rValue;
    return this;
  }

  CompileFunc$pStdCompiler$mi32(pComp, pars) {
    0;
    pComp.Value$StdParameterAdapt$StdCopyStrBuf$i32(mkParAdapt$rStdCopyStrBuf$mi32(this.rValue, pars));
  }

  $clone() { return new StdDecompileAdapt$StdCopyStrBuf().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    return this;
  }
}

export class StdDecompileAdapt$StdMeshInstance {
  rValue = null;

  init(rValue) {
    this.rValue = rValue;
    return this;
  }

  CompileFunc$pStdCompiler$x(pComp, pars) {
    0;
    pComp.Value$StdParameterAdapt$StdMeshInstance$x(mkParAdapt$rStdMeshInstance$x(this.rValue, pars));
  }

  $clone() { return new StdDecompileAdapt$StdMeshInstance().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    return this;
  }
}

export class StdDecompileAdapt$StdStrBuf {
  rValue = null;

  init(rValue) {
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    0;
    pComp.Value$rStdStrBuf(this.rValue);
  }

  $clone() { return new StdDecompileAdapt$StdStrBuf().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    return this;
  }
}

export class StdRuntimeValueAdapt$b {
  static $layout = [["rValue", 0, "u8", 0]];
  static $size = 1;
  rValue = null;

  init(rValue) {
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    pComp.setRuntimeWritesAllowed(1);
    pComp.Value$rb(this.rValue);
    pComp.setRuntimeWritesAllowed(-1);
  }

  op_eq(nValue) {
    return (this.rValue.a[this.rValue.o] ? 1 : 0) === (nValue ? 1 : 0);
  }

  op_assign(nValue) {
    this.rValue.a[this.rValue.o] = nValue;
    return this;
  }

  $clone() { return new StdRuntimeValueAdapt$b().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    return this;
  }
}

export class StdStringAdapt {
  szString = null;
  iMaxLength = 0;
  eRawType = 0;

  init(szString, iMaxLength, eRawType = 0 /*RCT_Escaped*/) {
    this.szString = szString;
    this.iMaxLength = iMaxLength;
    this.eRawType = eRawType;
    return this;
  }

  CompileFunc(pComp) {
    pComp.String$pi8$u64$i32(this.szString, $u64n(this.iMaxLength), this.eRawType);
  }

  op_eq(szDefault) {
    return $.SEqual(this.szString, szDefault);
  }

  op_assign(szDefault) {
    $.SCopy$pi8$pi8$u64(szDefault, this.szString, $u64n(this.iMaxLength));
    return this;
  }

  $clone() { return new StdStringAdapt().$assign(this); }
  $assign(o) {
    this.szString = o.szString;
    this.iMaxLength = o.iMaxLength;
    this.eRawType = o.eRawType;
    return this;
  }
}

export class StdStdStringAdapt {
  string = null;
  eRawType = 0;

  init(string, eRawType = 0 /*RCT_Escaped*/) {
    this.eRawType = eRawType;
    this.string = string;
    return this;
  }

  CompileFunc(pComp) {
    pComp.String$rstring$i32(this.string, this.eRawType);
  }

  op_eq(szDefault) {
    return this.string.eq(szDefault);
  }

  op_assign(szDefault) {
    this.string.assign(szDefault);
    return this;
  }

  $clone() { return new StdStdStringAdapt().$assign(this); }
  $assign(o) {
    this.string = o.string;
    this.eRawType = o.eRawType;
    return this;
  }
}

export class StdIntAdapt$i32$u8 {
  static $layout = [["rValue", 0, "i32", 0]];
  static $size = 4;
  rValue = null;

  init(rValue) {
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    const iVal = [this.rValue.a[this.rValue.o] & 0xff];
    pComp.Value$ru8(P(iVal, 0));
    this.rValue.a[this.rValue.o] = iVal[0];
  }

  $clone() { return new StdIntAdapt$i32$u8().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    return this;
  }
}

export class StdIntAdapt$i32$i32$2 {
  static $layout = [["rValue", 0, "i32", 0]];
  static $size = 4;
  rValue = null;

  init(rValue) {
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    const iVal = [this.rValue.a[this.rValue.o]];
    pComp.Value$ri32(P(iVal, 0));
    this.rValue.a[this.rValue.o] = iVal[0];
  }

  op_eq(nValue) {
    return this.rValue.a[this.rValue.o] === nValue;
  }

  op_assign(nValue) {
    this.rValue.a[this.rValue.o] = nValue;
    return this;
  }

  $clone() { return new StdIntAdapt$i32$i32$2().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    return this;
  }
}

export class StdIntAdapt$i32$i32$3 {
  static $layout = [["rValue", 0, "i32", 0]];
  static $size = 4;
  rValue = null;

  init(rValue) {
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    const iVal = [this.rValue.a[this.rValue.o]];
    pComp.Value$ri32(P(iVal, 0));
    this.rValue.a[this.rValue.o] = iVal[0];
  }

  $clone() { return new StdIntAdapt$i32$i32$3().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    return this;
  }
}

export class StdIntAdapt$i32$u8$9 {
  static $layout = [["rValue", 0, "i32", 0]];
  static $size = 4;
  rValue = null;

  init(rValue) {
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    const iVal = [this.rValue.a[this.rValue.o] & 0xff];
    pComp.Value$ru8(P(iVal, 0));
    this.rValue.a[this.rValue.o] = iVal[0];
  }

  $clone() { return new StdIntAdapt$i32$u8$9().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    return this;
  }
}

export class StdIntAdapt$i32$u8$10 {
  static $layout = [["rValue", 0, "i32", 0]];
  static $size = 4;
  rValue = null;

  init(rValue) {
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    const iVal = [this.rValue.a[this.rValue.o] & 0xff];
    pComp.Value$ru8(P(iVal, 0));
    this.rValue.a[this.rValue.o] = iVal[0];
  }

  op_eq(nValue) {
    return this.rValue.a[this.rValue.o] === nValue;
  }

  op_assign(nValue) {
    this.rValue.a[this.rValue.o] = nValue;
    return this;
  }

  $clone() { return new StdIntAdapt$i32$u8$10().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    return this;
  }
}

export class StdIntAdapt$i32$i32$5 {
  static $layout = [["rValue", 0, "i32", 0]];
  static $size = 4;
  rValue = null;

  init(rValue) {
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    const iVal = [this.rValue.a[this.rValue.o]];
    pComp.Value$ri32(P(iVal, 0));
    this.rValue.a[this.rValue.o] = iVal[0];
  }

  $clone() { return new StdIntAdapt$i32$i32$5().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    return this;
  }
}

export class StdIntAdapt$i32$u8$11 {
  static $layout = [["rValue", 0, "i32", 0]];
  static $size = 4;
  rValue = null;

  init(rValue) {
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    const iVal = [this.rValue.a[this.rValue.o] & 0xff];
    pComp.Value$ru8(P(iVal, 0));
    this.rValue.a[this.rValue.o] = iVal[0];
  }

  $clone() { return new StdIntAdapt$i32$u8$11().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    return this;
  }
}

export class StdIntAdapt$i32$i32$6 {
  static $layout = [["rValue", 0, "i32", 0]];
  static $size = 4;
  rValue = null;

  init(rValue) {
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    const iVal = [this.rValue.a[this.rValue.o]];
    pComp.Value$ri32(P(iVal, 0));
    this.rValue.a[this.rValue.o] = iVal[0];
  }

  $clone() { return new StdIntAdapt$i32$i32$6().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    return this;
  }
}

export class StdIntAdapt$i32$u8$13 {
  static $layout = [["rValue", 0, "i32", 0]];
  static $size = 4;
  rValue = null;

  init(rValue) {
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    const iVal = [this.rValue.a[this.rValue.o] & 0xff];
    pComp.Value$ru8(P(iVal, 0));
    this.rValue.a[this.rValue.o] = iVal[0];
  }

  $clone() { return new StdIntAdapt$i32$u8$13().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    return this;
  }
}

export class StdIntAdapt$i32$u8$14 {
  static $layout = [["rValue", 0, "i32", 0]];
  static $size = 4;
  rValue = null;

  init(rValue) {
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    const iVal = [this.rValue.a[this.rValue.o] & 0xff];
    pComp.Value$ru8(P(iVal, 0));
    this.rValue.a[this.rValue.o] = iVal[0];
  }

  $clone() { return new StdIntAdapt$i32$u8$14().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    return this;
  }
}

export class StdIntAdapt$i32$u8$15 {
  static $layout = [["rValue", 0, "i32", 0]];
  static $size = 4;
  rValue = null;

  init(rValue) {
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    const iVal = [this.rValue.a[this.rValue.o] & 0xff];
    pComp.Value$ru8(P(iVal, 0));
    this.rValue.a[this.rValue.o] = iVal[0];
  }

  $clone() { return new StdIntAdapt$i32$u8$15().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    return this;
  }
}

export class StdIntAdapt$i32$u8$17 {
  static $layout = [["rValue", 0, "i32", 0]];
  static $size = 4;
  rValue = null;

  init(rValue) {
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    const iVal = [this.rValue.a[this.rValue.o] & 0xff];
    pComp.Value$ru8(P(iVal, 0));
    this.rValue.a[this.rValue.o] = iVal[0];
  }

  $clone() { return new StdIntAdapt$i32$u8$17().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    return this;
  }
}

export class StdIntAdapt$i32$u8$18 {
  static $layout = [["rValue", 0, "i32", 0]];
  static $size = 4;
  rValue = null;

  init(rValue) {
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    const iVal = [this.rValue.a[this.rValue.o] & 0xff];
    pComp.Value$ru8(P(iVal, 0));
    this.rValue.a[this.rValue.o] = iVal[0];
  }

  $clone() { return new StdIntAdapt$i32$u8$18().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    return this;
  }
}

export class StdCastAdapt$C4Fixed$i32 {
  static $layout = [["rValue.val", 0, "i32", 0]];
  static $size = 4;
  rValue = null;

  init(rValue) {
    this.rValue = rValue;
    return this;
  }

  CompileFunc(pComp) {
    const vVal = Int32Array.of(0);
    c$memcpy(P(vVal, 0), $bytesView(this.rValue, [["val", 0, "i32", 0]], 4), 4);
    pComp.Value$ri32(P(vVal, 0));
    c$memcpy($bytesView(this.rValue, [["val", 0, "i32", 0]], 4), P(vVal, 0), 4);
  }

  op_eq(nValue) {
    return this.rValue.op_eq$C4Fixed(nValue);
  }

  op_assign(nValue) {
    this.rValue.$assign(nValue);
    return this;
  }

  $clone() { return new StdCastAdapt$C4Fixed$i32().$assign(this); }
  $assign(o) {
    this.rValue = o.rValue;
    return this;
  }
}

export class _IdFuncClass$i32 {

  op_call(rValue) {
    return rValue;
  }

  $clone() { return new _IdFuncClass$i32().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class StdArrayAdapt$pC4GameRes$StdPtrAdapt$C4GameRes {
  pArray = null;
  iSize = 0;
  map = null;

  init(pArray, iSize, map) {
    this.pArray = pArray;
    this.iSize = iSize;
    this.map = map;
    return this;
  }

  CompileFunc(pComp) {
    for (let i = 0; i < this.iSize; i = i + 1 | 0) {
      if (i !== 0) {
        pComp.Separator(1 /*SEP_SEP*/);
      }
      pComp.Value$StdPtrAdapt$C4GameRes(this.map($padd(this.pArray, i)));
    }
  }

  $clone() { return new StdArrayAdapt$pC4GameRes$StdPtrAdapt$C4GameRes().$assign(this); }
  $assign(o) {
    this.pArray = o.pArray;
    this.iSize = o.iSize;
    this.map = o.map;
    return this;
  }
}

export class StdArrayAdapt$C4LSector$StdParameterAdaptMaker$pC4ValueNumbers {
  pArray = null;
  iSize = 0;
  map = null;

  init(pArray, iSize, map) {
    this.pArray = pArray;
    this.iSize = iSize;
    this.map = map;
    return this;
  }

  CompileFunc(pComp) {
    for (let i = 0; i < this.iSize; i = i + 1 | 0) {
      if (i !== 0) {
        pComp.Separator(1 /*SEP_SEP*/);
      }
      pComp.Value$StdParameterAdapt$C4LSector$pC4ValueNumbers(this.map.op_call($oidx(this.pArray, i)));
    }
  }

  $clone() { return new StdArrayAdapt$C4LSector$StdParameterAdaptMaker$pC4ValueNumbers().$assign(this); }
  $assign(o) {
    this.pArray = o.pArray;
    this.iSize = o.iSize;
    this.map = o.map;
    return this;
  }
}

export class StdArrayAdapt$pScenario$StdPtrAdapt$Scenario {
  pArray = null;
  iSize = 0;
  map = null;

  init(pArray, iSize, map) {
    this.pArray = pArray;
    this.iSize = iSize;
    this.map = map;
    return this;
  }

  CompileFunc(pComp) {
    for (let i = 0; i < this.iSize; i = i + 1 | 0) {
      if (i !== 0) {
        pComp.Separator(1 /*SEP_SEP*/);
      }
      pComp.Value$StdPtrAdapt$Scenario(this.map($padd(this.pArray, i)));
    }
  }

  $clone() { return new StdArrayAdapt$pScenario$StdPtrAdapt$Scenario().$assign(this); }
  $assign(o) {
    this.pArray = o.pArray;
    this.iSize = o.iSize;
    this.map = o.map;
    return this;
  }
}

export class StdArrayAdapt$pC4PlayerInfo$StdPtrAdapt$C4PlayerInfo {
  pArray = null;
  iSize = 0;
  map = null;

  init(pArray, iSize, map) {
    this.pArray = pArray;
    this.iSize = iSize;
    this.map = map;
    return this;
  }

  CompileFunc(pComp) {
    for (let i = 0; i < this.iSize; i = i + 1 | 0) {
      if (i !== 0) {
        pComp.Separator(1 /*SEP_SEP*/);
      }
      pComp.Value$StdPtrAdapt$C4PlayerInfo(this.map($padd(this.pArray, i)));
    }
  }

  $clone() { return new StdArrayAdapt$pC4PlayerInfo$StdPtrAdapt$C4PlayerInfo().$assign(this); }
  $assign(o) {
    this.pArray = o.pArray;
    this.iSize = o.iSize;
    this.map = o.map;
    return this;
  }
}

export class StdArrayAdapt$pC4RoundResultsPlayer$StdPtrAdapt$C4RoundResultsPlayer {
  pArray = null;
  iSize = 0;
  map = null;

  init(pArray, iSize, map) {
    this.pArray = pArray;
    this.iSize = iSize;
    this.map = map;
    return this;
  }

  CompileFunc(pComp) {
    for (let i = 0; i < this.iSize; i = i + 1 | 0) {
      if (i !== 0) {
        pComp.Separator(1 /*SEP_SEP*/);
      }
      pComp.Value$StdPtrAdapt$C4RoundResultsPlayer(this.map($padd(this.pArray, i)));
    }
  }

  $clone() { return new StdArrayAdapt$pC4RoundResultsPlayer$StdPtrAdapt$C4RoundResultsPlayer().$assign(this); }
  $assign(o) {
    this.pArray = o.pArray;
    this.iSize = o.iSize;
    this.map = o.map;
    return this;
  }
}

export class StdArrayAdapt$pC4Team$StdPtrAdapt$C4Team {
  pArray = null;
  iSize = 0;
  map = null;

  init(pArray, iSize, map) {
    this.pArray = pArray;
    this.iSize = iSize;
    this.map = map;
    return this;
  }

  CompileFunc(pComp) {
    for (let i = 0; i < this.iSize; i = i + 1 | 0) {
      if (i !== 0) {
        pComp.Separator(1 /*SEP_SEP*/);
      }
      pComp.Value$StdPtrAdapt$C4Team(this.map($padd(this.pArray, i)));
    }
  }

  $clone() { return new StdArrayAdapt$pC4Team$StdPtrAdapt$C4Team().$assign(this); }
  $assign(o) {
    this.pArray = o.pArray;
    this.iSize = o.iSize;
    this.map = o.map;
    return this;
  }
}

export class StdArrayAdapt$i32$_IdFuncClass$i32 {
  pArray = null;
  iSize = 0;
  map = null;

  init(pArray, iSize, map = new _IdFuncClass$i32()) {
    this.pArray = pArray;
    this.iSize = iSize;
    this.map = map;
    return this;
  }

  CompileFunc(pComp) {
    for (let i = 0; i < this.iSize; i = i + 1 | 0) {
      if (i !== 0) {
        pComp.Separator(1 /*SEP_SEP*/);
      }
      pComp.Value$ri32(this.map.op_call($padd(this.pArray, i)));
    }
  }

  op_eq$i32(rDefault) {
    for (let i = 0; i < this.iSize; i = i + 1 | 0) {
      if (this.pArray.a[this.pArray.o + i] !== rDefault) {
        return false;
      }
    }
    return true;
  }

  op_assign$i32(rDefault) {
    for (let i = 0; i < this.iSize; i = i + 1 | 0) {
      this.pArray.a[this.pArray.o + i] = rDefault;
    }
    return this;
  }

  op_eq$pi32(pDefaults) {
    for (let i = 0; i < this.iSize; i = i + 1 | 0) {
      if (this.pArray.a[this.pArray.o + i] !== pDefaults.a[pDefaults.o + i]) {
        return false;
      }
    }
    return true;
  }

  op_assign$pi32(pDefaults) {
    for (let i = 0; i < this.iSize; i = i + 1 | 0) {
      this.pArray.a[this.pArray.o + i] = pDefaults.a[pDefaults.o + i];
    }
    return this;
  }

  $clone() { return new StdArrayAdapt$i32$_IdFuncClass$i32().$assign(this); }
  $assign(o) {
    this.pArray = o.pArray;
    this.iSize = o.iSize;
    this.map = o.map;
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
    this.map = map.$clone();
    this.rDefault = rDefault;
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

export class StdArrayDefaultAdapt$i32$i32$_IdFuncClass$i32 {
  pArray = null;
  iSize = 0;
  rDefault = null;
  map = new _IdFuncClass$i32();

  init(pArray, iSize, rDefault, map = new _IdFuncClass$i32()) {
    this.pArray = pArray;
    this.iSize = iSize;
    this.map = map.$clone();
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    let i = 0;
    let iWrite = this.iSize;
    let deserializing = pComp.isDeserializer();
    if (!deserializing && pComp.hasNaming()) {
      while (iWrite > 0 && this.pArray.a[this.pArray.o + (iWrite - 1)] === this.rDefault) {
        iWrite = iWrite - 1;
      }
    }
    for (i = 0; i < iWrite; i = i + 1) {
      if (i !== 0) {
        if (!pComp.Separator(1 /*SEP_SEP*/)) {
          break;
        }
      }
      pComp.Value$StdDefaultAdapt$i32$i32(mkDefaultAdapt$ri32$i32(this.map.op_call($padd(this.pArray, i)), this.rDefault));
    }
    if (deserializing) {
      for (; i < this.iSize; i = i + 1) {
        this.pArray.a[this.pArray.o + i] = this.rDefault;
      }
    }
  }

  $clone() { return new StdArrayDefaultAdapt$i32$i32$_IdFuncClass$i32().$assign(this); }
  $assign(o) {
    this.pArray = o.pArray;
    this.iSize = o.iSize;
    this.rDefault = o.rDefault;
    this.map.$assign(o.map);
    return this;
  }
}

export class StdArrayDefaultArrayAdapt$i32$pi32$_IdFuncClass$i32 {
  pArray = null;
  iSize = 0;
  rDefault = null;
  map = new _IdFuncClass$i32();

  init(pArray, iSize, rDefault, map = new _IdFuncClass$i32()) {
    this.pArray = pArray;
    this.iSize = iSize;
    this.map = map.$clone();
    this.rDefault = rDefault;
    return this;
  }

  CompileFunc(pComp) {
    let i = 0;
    let iWrite = this.iSize;
    let deserializing = pComp.isDeserializer();
    if (!deserializing && pComp.hasNaming()) {
      while (iWrite > 0 && this.pArray.a[this.pArray.o + (iWrite - 1)] === this.rDefault.a[this.rDefault.o + (iWrite - 1)]) {
        iWrite = iWrite - 1;
      }
    }
    for (i = 0; i < iWrite; i = i + 1) {
      if (i !== 0) {
        if (!pComp.Separator(1 /*SEP_SEP*/)) {
          break;
        }
      }
      pComp.Value$StdDefaultAdapt$i32$i32(mkDefaultAdapt$ri32$i32(this.map.op_call($padd(this.pArray, i)), this.rDefault.a[this.rDefault.o + i]));
    }
    if (deserializing) {
      for (; i < this.iSize; i = i + 1) {
        this.pArray.a[this.pArray.o + i] = this.rDefault.a[this.rDefault.o + i];
      }
    }
  }

  op_eq(pDefaults) {
    for (let i = 0; i < this.iSize; i = i + 1) {
      if (this.pArray.a[this.pArray.o + i] !== pDefaults.a[pDefaults.o + i]) {
        return false;
      }
    }
    return true;
  }

  op_assign(pDefaults) {
    for (let i = 0; i < this.iSize; i = i + 1) {
      this.pArray.a[this.pArray.o + i] = pDefaults.a[pDefaults.o + i];
    }
    return this;
  }

  $clone() { return new StdArrayDefaultArrayAdapt$i32$pi32$_IdFuncClass$i32().$assign(this); }
  $assign(o) {
    this.pArray = o.pArray;
    this.iSize = o.iSize;
    this.rDefault = o.rDefault;
    this.map.$assign(o.map);
    return this;
  }
}

export class StdInsertAdapt$StdDecompileAdapt$C4PacketBase$u8 {
  rObj = null;
  rIns = null;
  fBefore = false;

  init(rObj, rIns, fBefore) {
    this.fBefore = fBefore;
    this.rObj = rObj;
    this.rIns = rIns;
    return this;
  }

  CompileFunc(pComp) {
    if (this.fBefore) {
      pComp.Value$ru8(this.rIns);
    }
    pComp.Value$rStdDecompileAdapt$C4PacketBase(this.rObj);
    if (!this.fBefore) {
      pComp.Value$ru8(this.rIns);
    }
  }

  $clone() { return new StdInsertAdapt$StdDecompileAdapt$C4PacketBase$u8().$assign(this); }
  $assign(o) {
    this.rObj = o.rObj;
    this.rIns = o.rIns;
    this.fBefore = o.fBefore;
    return this;
  }
}

export class StdInsertAdapt$StdParameterAdapt$C4Object$pC4ValueNumbers$StdNamingAdapt$C4ValueNumbers {
  rObj = null;
  rIns = null;
  fBefore = false;

  init(rObj, rIns, fBefore) {
    this.fBefore = fBefore;
    this.rObj = rObj;
    this.rIns = rIns;
    return this;
  }

  CompileFunc(pComp) {
    if (this.fBefore) {
      pComp.Value$rStdNamingAdapt$C4ValueNumbers(this.rIns);
    }
    pComp.Value$rStdParameterAdapt$C4Object$pC4ValueNumbers(this.rObj);
    if (!this.fBefore) {
      pComp.Value$rStdNamingAdapt$C4ValueNumbers(this.rIns);
    }
  }

  $clone() { return new StdInsertAdapt$StdParameterAdapt$C4Object$pC4ValueNumbers$StdNamingAdapt$C4ValueNumbers().$assign(this); }
  $assign(o) {
    this.rObj = o.rObj;
    this.rIns = o.rIns;
    this.fBefore = o.fBefore;
    return this;
  }
}

export class StdInsertAdapt$StdStrBuf$StdBuf {
  rObj = null;
  rIns = null;
  fBefore = false;

  init(rObj, rIns, fBefore) {
    this.fBefore = fBefore;
    this.rObj = rObj;
    this.rIns = rIns;
    return this;
  }

  CompileFunc(pComp) {
    if (this.fBefore) {
      pComp.Value$rStdBuf(this.rIns);
    }
    pComp.Value$rStdStrBuf(this.rObj);
    if (!this.fBefore) {
      pComp.Value$rStdBuf(this.rIns);
    }
  }

  $clone() { return new StdInsertAdapt$StdStrBuf$StdBuf().$assign(this); }
  $assign(o) {
    this.rObj = o.rObj;
    this.rIns = o.rIns;
    this.fBefore = o.fBefore;
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

  op_eq$StdStrBuf(nValue) {
    return this.rObj.op_eq$StdStrBuf(nValue);
  }

  op_assign$StdStrBuf(nValue) {
    this.rObj.$assign(nValue);
    return this;
  }

  op_eq$StdCopyStrBuf(nValue) {
    return this.rObj.op_eq$StdStrBuf(nValue);
  }

  op_assign$StdCopyStrBuf(nValue) {
    this.rObj.$assign(nValue);
    return this;
  }

  op_eq$x(nValue) {
    return this.rObj.op_eq$pi8(P(nValue, 0));
  }

  op_assign$x(nValue) {
    $.StdStrBuf.prototype.op_assign$pi8.call(this.rObj, P(nValue, 0));
    return this;
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

export class StdParameterAdaptMaker$pC4ValueNumbers$2 {
  Par = null;

  init(rPar) {
    this.Par = rPar;
    return this;
  }

  op_call(rObj) {
    return new StdParameterAdapt$C4LSector$pC4ValueNumbers().init(rObj, this.Par);
  }

  $clone() { return new StdParameterAdaptMaker$pC4ValueNumbers$2().$assign(this); }
  $assign(o) {
    this.Par = o.Par;
    return this;
  }
}

export class StdParameter2Adapt$C4GameObjects$b$pC4ValueNumbers {
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
    this.rObj.CompileFunc$pStdCompiler$b$pC4ValueNumbers(pComp, this.rPar1, this.rPar2.a[this.rPar2.o]);
  }

  $clone() { return new StdParameter2Adapt$C4GameObjects$b$pC4ValueNumbers().$assign(this); }
  $assign(o) {
    this.rObj = o.rObj;
    this.rPar1 = o.rPar1;
    this.rPar2 = o.rPar2;
    return this;
  }
}

export class StdParameter2Adapt$StdPtrAdapt$C4Effect$pC4Object$pC4ValueNumbers {
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
    this.rObj.CompileFunc$pStdCompiler$mpC4Object$rpC4ValueNumbers(pComp, this.rPar1, $tmp(this.rPar2.a[this.rPar2.o]));
  }

  $clone() { return new StdParameter2Adapt$StdPtrAdapt$C4Effect$pC4Object$pC4ValueNumbers().$assign(this); }
  $assign(o) {
    this.rObj = o.rObj;
    this.rPar1 = o.rPar1;
    this.rPar2 = o.rPar2;
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

export class StdBasicPtrAdapt$C4Control {
  rpObj = null;
  fAllowNull = false;
  szNaming = null;

  init(rpObj, fAllowNull, szNaming) {
    this.fAllowNull = fAllowNull;
    this.szNaming = szNaming;
    this.rpObj = rpObj;
    return this;
  }

  $clone() { return new StdBasicPtrAdapt$C4Control().$assign(this); }
  $assign(o) {
    this.rpObj = o.rpObj;
    this.fAllowNull = o.fAllowNull;
    this.szNaming = o.szNaming;
    return this;
  }
}

export class StdBasicPtrAdapt$C4DrawTransform {
  rpObj = null;
  fAllowNull = false;
  szNaming = null;

  init(rpObj, fAllowNull, szNaming) {
    this.fAllowNull = fAllowNull;
    this.szNaming = szNaming;
    this.rpObj = rpObj;
    return this;
  }

  $clone() { return new StdBasicPtrAdapt$C4DrawTransform().$assign(this); }
  $assign(o) {
    this.rpObj = o.rpObj;
    this.fAllowNull = o.fAllowNull;
    this.szNaming = o.szNaming;
    return this;
  }
}

export class StdBasicPtrAdapt$Scenario {
  rpObj = null;
  fAllowNull = false;
  szNaming = null;

  init(rpObj, fAllowNull, szNaming) {
    this.fAllowNull = fAllowNull;
    this.szNaming = szNaming;
    this.rpObj = rpObj;
    return this;
  }

  $clone() { return new StdBasicPtrAdapt$Scenario().$assign(this); }
  $assign(o) {
    this.rpObj = o.rpObj;
    this.fAllowNull = o.fAllowNull;
    this.szNaming = o.szNaming;
    return this;
  }
}

export class StdBasicPtrAdapt$C4MessageBoardQuery {
  rpObj = null;
  fAllowNull = false;
  szNaming = null;

  init(rpObj, fAllowNull, szNaming) {
    this.fAllowNull = fAllowNull;
    this.szNaming = szNaming;
    this.rpObj = rpObj;
    return this;
  }

  $clone() { return new StdBasicPtrAdapt$C4MessageBoardQuery().$assign(this); }
  $assign(o) {
    this.rpObj = o.rpObj;
    this.fAllowNull = o.fAllowNull;
    this.szNaming = o.szNaming;
    return this;
  }
}

export class StdBasicPtrAdapt$C4Network2ResCore {
  rpObj = null;
  fAllowNull = false;
  szNaming = null;

  init(rpObj, fAllowNull, szNaming) {
    this.fAllowNull = fAllowNull;
    this.szNaming = szNaming;
    this.rpObj = rpObj;
    return this;
  }

  $clone() { return new StdBasicPtrAdapt$C4Network2ResCore().$assign(this); }
  $assign(o) {
    this.rpObj = o.rpObj;
    this.fAllowNull = o.fAllowNull;
    this.szNaming = o.szNaming;
    return this;
  }
}

export class StdBasicPtrAdapt$C4Object {
  rpObj = null;
  fAllowNull = false;
  szNaming = null;

  init(rpObj, fAllowNull, szNaming) {
    this.fAllowNull = fAllowNull;
    this.szNaming = szNaming;
    this.rpObj = rpObj;
    return this;
  }

  $clone() { return new StdBasicPtrAdapt$C4Object().$assign(this); }
  $assign(o) {
    this.rpObj = o.rpObj;
    this.fAllowNull = o.fAllowNull;
    this.szNaming = o.szNaming;
    return this;
  }
}

export class StdBasicPtrAdapt$C4PlayerInfo {
  rpObj = null;
  fAllowNull = false;
  szNaming = null;

  init(rpObj, fAllowNull, szNaming) {
    this.fAllowNull = fAllowNull;
    this.szNaming = szNaming;
    this.rpObj = rpObj;
    return this;
  }

  $clone() { return new StdBasicPtrAdapt$C4PlayerInfo().$assign(this); }
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
    this.fAllowNull = fAllowNull;
    this.szNaming = szNaming;
    this.rpObj = rpObj;
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

export class StdBasicPtrAdapt$C4RoundResultsPlayer {
  rpObj = null;
  fAllowNull = false;
  szNaming = null;

  init(rpObj, fAllowNull, szNaming) {
    this.fAllowNull = fAllowNull;
    this.szNaming = szNaming;
    this.rpObj = rpObj;
    return this;
  }

  $clone() { return new StdBasicPtrAdapt$C4RoundResultsPlayer().$assign(this); }
  $assign(o) {
    this.rpObj = o.rpObj;
    this.fAllowNull = o.fAllowNull;
    this.szNaming = o.szNaming;
    return this;
  }
}

export class StdBasicPtrAdapt$C4Team {
  rpObj = null;
  fAllowNull = false;
  szNaming = null;

  init(rpObj, fAllowNull, szNaming) {
    this.fAllowNull = fAllowNull;
    this.szNaming = szNaming;
    this.rpObj = rpObj;
    return this;
  }

  $clone() { return new StdBasicPtrAdapt$C4Team().$assign(this); }
  $assign(o) {
    this.rpObj = o.rpObj;
    this.fAllowNull = o.fAllowNull;
    this.szNaming = o.szNaming;
    return this;
  }
}

export class StdBasicPtrAdapt$SerializableValueProvider {
  rpObj = null;
  fAllowNull = false;
  szNaming = null;

  init(rpObj, fAllowNull, szNaming) {
    this.fAllowNull = fAllowNull;
    this.szNaming = szNaming;
    this.rpObj = rpObj;
    return this;
  }

  $clone() { return new StdBasicPtrAdapt$SerializableValueProvider().$assign(this); }
  $assign(o) {
    this.rpObj = o.rpObj;
    this.fAllowNull = o.fAllowNull;
    this.szNaming = o.szNaming;
    return this;
  }
}

export class StdBasicPtrAdapt$StdMeshInstance {
  rpObj = null;
  fAllowNull = false;
  szNaming = null;

  init(rpObj, fAllowNull, szNaming) {
    this.fAllowNull = fAllowNull;
    this.szNaming = szNaming;
    this.rpObj = rpObj;
    return this;
  }

  $clone() { return new StdBasicPtrAdapt$StdMeshInstance().$assign(this); }
  $assign(o) {
    this.rpObj = o.rpObj;
    this.fAllowNull = o.fAllowNull;
    this.szNaming = o.szNaming;
    return this;
  }
}

export class StdSTLContainerAdapt$list$C4RecordChunk {
  rStruct = null;
  eSep = 0;

  init(rStruct, eSep) {
    this.eSep = eSep;
    this.rStruct = rStruct;
    return this;
  }

  CompileFunc(pComp) {
    let $t1;
    let deserializing = pComp.isDeserializer();
    let fNaming = pComp.hasNaming();
    if (!deserializing) {
      if (!fNaming) {
        const iSize = [this.rStruct.length | 0];
        pComp.Value$ri32(P(iSize, 0));
      }
      for (let i = $begin(this.rStruct); !i.eq($end(this.rStruct)); i.inc()) {
        if (!i.eq($begin(this.rStruct)) && this.eSep !== 0) {
          pComp.Separator(this.eSep);
        }
        pComp.Value$rC4RecordChunk(i.v);
      }
    } else {
      this.rStruct.length = 0;
      const iSize = [0];
      if (!fNaming) {
        pComp.Value$ru32(P(iSize, 0));
      }
      do {
        if (!fNaming && !(($t1 = iSize[0], iSize[0] = iSize[0] - 1 >>> 0, $t1) !== 0)) {
          break;
        }
        try {
          let val = new $.C4RecordChunk().init();
          pComp.Value$rC4RecordChunk(val);
          $vpush(this.rStruct, val.$clone());
        } catch ($e3) {
          if ($e3 instanceof $.StdCompiler$NotFoundException) {
            const pEx = $e3;
            $delete(pEx);
            break;
          } else {
            throw $e3;
          }
        }
      } while (this.eSep === 0 || pComp.Separator(this.eSep));
    }
  }

  $clone() { return new StdSTLContainerAdapt$list$C4RecordChunk().$assign(this); }
  $assign(o) {
    this.rStruct = o.rStruct;
    this.eSep = o.eSep;
    return this;
  }
}

export class StdSTLContainerAdapt$list$i32 {
  rStruct = null;
  eSep = 0;

  init(rStruct, eSep) {
    this.eSep = eSep;
    this.rStruct = rStruct;
    return this;
  }

  CompileFunc(pComp) {
    let $t1;
    let deserializing = pComp.isDeserializer();
    let fNaming = pComp.hasNaming();
    if (!deserializing) {
      if (!fNaming) {
        const iSize = [this.rStruct.length | 0];
        pComp.Value$ri32(P(iSize, 0));
      }
      for (let i = $begin(this.rStruct); !i.eq($end(this.rStruct)); i.inc()) {
        if (!i.eq($begin(this.rStruct)) && this.eSep !== 0) {
          pComp.Separator(this.eSep);
        }
        pComp.Value$ri32($tmp(i.v));
      }
    } else {
      this.rStruct.length = 0;
      const iSize = [0];
      if (!fNaming) {
        pComp.Value$ru32(P(iSize, 0));
      }
      do {
        if (!fNaming && !(($t1 = iSize[0], iSize[0] = iSize[0] - 1 >>> 0, $t1) !== 0)) {
          break;
        }
        try {
          const val = [0];
          pComp.Value$ri32(P(val, 0));
          this.rStruct.push(val[0]);
        } catch ($e3) {
          if ($e3 instanceof $.StdCompiler$NotFoundException) {
            const pEx = $e3;
            $delete(pEx);
            break;
          } else {
            throw $e3;
          }
        }
      } while (this.eSep === 0 || pComp.Separator(this.eSep));
    }
  }

  $clone() { return new StdSTLContainerAdapt$list$i32().$assign(this); }
  $assign(o) {
    this.rStruct = o.rStruct;
    this.eSep = o.eSep;
    return this;
  }
}

export class StdSTLContainerAdapt$vector$ControlItem {
  rStruct = null;
  eSep = 0;

  init(rStruct, eSep) {
    this.eSep = eSep;
    this.rStruct = rStruct;
    return this;
  }

  CompileFunc(pComp) {
    let $t1;
    let deserializing = pComp.isDeserializer();
    let fNaming = pComp.hasNaming();
    if (!deserializing) {
      if (!fNaming) {
        const iSize = [this.rStruct.length | 0];
        pComp.Value$ri32(P(iSize, 0));
      }
      for (let i = $begin(this.rStruct); !i.eq($end(this.rStruct)); i.inc()) {
        if (!i.eq($begin(this.rStruct)) && this.eSep !== 0) {
          pComp.Separator(this.eSep);
        }
        pComp.Value$rC4ControlPlayerControl$ControlItem(i.v);
      }
    } else {
      this.rStruct.length = 0;
      const iSize = [0];
      if (!fNaming) {
        pComp.Value$ru32(P(iSize, 0));
      }
      do {
        if (!fNaming && !(($t1 = iSize[0], iSize[0] = iSize[0] - 1 >>> 0, $t1) !== 0)) {
          break;
        }
        try {
          let val = new $.C4ControlPlayerControl$ControlItem();
          pComp.Value$rC4ControlPlayerControl$ControlItem(val);
          $vpush(this.rStruct, val.$clone());
        } catch ($e3) {
          if ($e3 instanceof $.StdCompiler$NotFoundException) {
            const pEx = $e3;
            $delete(pEx);
            break;
          } else {
            throw $e3;
          }
        }
      } while (this.eSep === 0 || pComp.Separator(this.eSep));
    }
  }

  op_eq(nValue) {
    return seq_equal(this.rStruct, nValue);
  }

  op_assign(nValue) {
    this.rStruct = nValue.slice();
    return this;
  }

  $clone() { return new StdSTLContainerAdapt$vector$ControlItem().$assign(this); }
  $assign(o) {
    this.rStruct = o.rStruct;
    this.eSep = o.eSep;
    return this;
  }
}

export class StdSTLContainerAdapt$vector$C4KeyCodeEx {
  rStruct = null;
  eSep = 0;

  init(rStruct, eSep) {
    this.eSep = eSep;
    this.rStruct = rStruct;
    return this;
  }

  CompileFunc(pComp) {
    let $t1;
    let deserializing = pComp.isDeserializer();
    let fNaming = pComp.hasNaming();
    if (!deserializing) {
      if (!fNaming) {
        const iSize = [this.rStruct.length | 0];
        pComp.Value$ri32(P(iSize, 0));
      }
      for (let i = $begin(this.rStruct); !i.eq($end(this.rStruct)); i.inc()) {
        if (!i.eq($begin(this.rStruct)) && this.eSep !== 0) {
          pComp.Separator(this.eSep);
        }
        pComp.Value$rC4KeyCodeEx(i.v);
      }
    } else {
      this.rStruct.length = 0;
      const iSize = [0];
      if (!fNaming) {
        pComp.Value$ru32(P(iSize, 0));
      }
      do {
        if (!fNaming && !(($t1 = iSize[0], iSize[0] = iSize[0] - 1 >>> 0, $t1) !== 0)) {
          break;
        }
        try {
          let val = new $.C4KeyCodeEx().init();
          pComp.Value$rC4KeyCodeEx(val);
          $vpush(this.rStruct, val.$clone());
        } catch ($e3) {
          if ($e3 instanceof $.StdCompiler$NotFoundException) {
            const pEx = $e3;
            $delete(pEx);
            break;
          } else {
            throw $e3;
          }
        }
      } while (this.eSep === 0 || pComp.Separator(this.eSep));
    }
  }

  op_eq(nValue) {
    return seq_equal(this.rStruct, nValue);
  }

  op_assign(nValue) {
    this.rStruct = nValue.slice();
    return this;
  }

  $clone() { return new StdSTLContainerAdapt$vector$C4KeyCodeEx().$assign(this); }
  $assign(o) {
    this.rStruct = o.rStruct;
    this.eSep = o.eSep;
    return this;
  }
}

export class StdSTLContainerAdapt$vector$C4MaterialReaction {
  rStruct = null;
  eSep = 0;

  init(rStruct, eSep) {
    this.eSep = eSep;
    this.rStruct = rStruct;
    return this;
  }

  CompileFunc(pComp) {
    let $t1;
    let deserializing = pComp.isDeserializer();
    let fNaming = pComp.hasNaming();
    if (!deserializing) {
      if (!fNaming) {
        const iSize = [this.rStruct.length | 0];
        pComp.Value$ri32(P(iSize, 0));
      }
      for (let i = $begin(this.rStruct); !i.eq($end(this.rStruct)); i.inc()) {
        if (!i.eq($begin(this.rStruct)) && this.eSep !== 0) {
          pComp.Separator(this.eSep);
        }
        pComp.Value$rC4MaterialReaction(i.v);
      }
    } else {
      this.rStruct.length = 0;
      const iSize = [0];
      if (!fNaming) {
        pComp.Value$ru32(P(iSize, 0));
      }
      do {
        if (!fNaming && !(($t1 = iSize[0], iSize[0] = iSize[0] - 1 >>> 0, $t1) !== 0)) {
          break;
        }
        try {
          let val = new $.C4MaterialReaction().init$v();
          pComp.Value$rC4MaterialReaction(val);
          $vpush(this.rStruct, val.$clone());
        } catch ($e3) {
          if ($e3 instanceof $.StdCompiler$NotFoundException) {
            const pEx = $e3;
            $delete(pEx);
            break;
          } else {
            throw $e3;
          }
        }
      } while (this.eSep === 0 || pComp.Separator(this.eSep));
    }
  }

  op_eq(nValue) {
    return seq_equal(this.rStruct, nValue);
  }

  op_assign(nValue) {
    this.rStruct = nValue.slice();
    return this;
  }

  $clone() { return new StdSTLContainerAdapt$vector$C4MaterialReaction().$assign(this); }
  $assign(o) {
    this.rStruct = o.rStruct;
    this.eSep = o.eSep;
    return this;
  }
}

export class StdSTLContainerAdapt$vector$C4PlayerControlDef {
  rStruct = null;
  eSep = 0;

  init(rStruct, eSep) {
    this.eSep = eSep;
    this.rStruct = rStruct;
    return this;
  }

  CompileFunc(pComp) {
    let $t1;
    let deserializing = pComp.isDeserializer();
    let fNaming = pComp.hasNaming();
    if (!deserializing) {
      if (!fNaming) {
        const iSize = [this.rStruct.length | 0];
        pComp.Value$ri32(P(iSize, 0));
      }
      for (let i = $begin(this.rStruct); !i.eq($end(this.rStruct)); i.inc()) {
        if (!i.eq($begin(this.rStruct)) && this.eSep !== 0) {
          pComp.Separator(this.eSep);
        }
        pComp.Value$rC4PlayerControlDef(i.v);
      }
    } else {
      this.rStruct.length = 0;
      const iSize = [0];
      if (!fNaming) {
        pComp.Value$ru32(P(iSize, 0));
      }
      do {
        if (!fNaming && !(($t1 = iSize[0], iSize[0] = iSize[0] - 1 >>> 0, $t1) !== 0)) {
          break;
        }
        try {
          let val = new $.C4PlayerControlDef().init();
          pComp.Value$rC4PlayerControlDef(val);
          $vpush(this.rStruct, val.$clone());
        } catch ($e3) {
          if ($e3 instanceof $.StdCompiler$NotFoundException) {
            const pEx = $e3;
            $delete(pEx);
            break;
          } else {
            throw $e3;
          }
        }
      } while (this.eSep === 0 || pComp.Separator(this.eSep));
    }
  }

  $clone() { return new StdSTLContainerAdapt$vector$C4PlayerControlDef().$assign(this); }
  $assign(o) {
    this.rStruct = o.rStruct;
    this.eSep = o.eSep;
    return this;
  }
}

export class StdSTLContainerAdapt$vector$Option {
  rStruct = null;
  eSep = 0;

  init(rStruct, eSep) {
    this.eSep = eSep;
    this.rStruct = rStruct;
    return this;
  }

  CompileFunc(pComp) {
    let $t1;
    let deserializing = pComp.isDeserializer();
    let fNaming = pComp.hasNaming();
    if (!deserializing) {
      if (!fNaming) {
        const iSize = [this.rStruct.length | 0];
        pComp.Value$ri32(P(iSize, 0));
      }
      for (let i = $begin(this.rStruct); !i.eq($end(this.rStruct)); i.inc()) {
        if (!i.eq($begin(this.rStruct)) && this.eSep !== 0) {
          pComp.Separator(this.eSep);
        }
        pComp.Value$rC4ScenarioParameterDef$Option(i.v);
      }
    } else {
      this.rStruct.length = 0;
      const iSize = [0];
      if (!fNaming) {
        pComp.Value$ru32(P(iSize, 0));
      }
      do {
        if (!fNaming && !(($t1 = iSize[0], iSize[0] = iSize[0] - 1 >>> 0, $t1) !== 0)) {
          break;
        }
        try {
          let val = new $.C4ScenarioParameterDef$Option().None();
          pComp.Value$rC4ScenarioParameterDef$Option(val);
          $vpush(this.rStruct, val.$clone());
        } catch ($e3) {
          if ($e3 instanceof $.StdCompiler$NotFoundException) {
            const pEx = $e3;
            $delete(pEx);
            break;
          } else {
            throw $e3;
          }
        }
      } while (this.eSep === 0 || pComp.Separator(this.eSep));
    }
  }

  $clone() { return new StdSTLContainerAdapt$vector$Option().$assign(this); }
  $assign(o) {
    this.rStruct = o.rStruct;
    this.eSep = o.eSep;
    return this;
  }
}

export class StdIntPackAdapt$i32 {
  static $layout = [["rVal", 0, "i32", 0]];
  static $size = 4;
  rVal = null;

  init(rVal) {
    this.rVal = rVal;
    return this;
  }

  clearUpper(x) {
    let CLEARBITS = 25;
    return (x << 25 | 0) >> 25;
  }

  CompileFunc(pComp) {
    if (pComp.hasNaming()) {
      pComp.Value$ri32(this.rVal);
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
        val >>= 7;
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
        val = data << i | 0 | val & ((1 << i | 0) - 1 | 0);
        i = i + 7 | 0;
      }
      this.rVal.a[this.rVal.o] = val;
    }
  }

  op_eq$2(nValue) {
    return this.rVal.a[this.rVal.o] === nValue;
  }

  op_eq(nValue) {
    return this.rVal.a[this.rVal.o] === nValue;
  }

  op_assign$2(nValue) {
    this.rVal.a[this.rVal.o] = nValue;
    return this;
  }

  op_assign(nValue) {
    this.rVal.a[this.rVal.o] = nValue;
    return this;
  }

  $clone() { return new StdIntPackAdapt$i32().$assign(this); }
  $assign(o) {
    this.rVal = o.rVal;
    return this;
  }
}

export class StdIntPackAdapt$u32 {
  static $layout = [["rVal", 0, "u32", 0]];
  static $size = 4;
  rVal = null;

  init(rVal) {
    this.rVal = rVal;
    return this;
  }

  clearUpper(x) {
    let CLEARBITS = 25;
    return (x << 25) >>> 0 >>> 25;
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

export class StdEnumEntry$i32 {
  Name = null;
  Val = 0;

  $clone() { return new StdEnumEntry$i32().$assign(this); }
  $assign(o) {
    this.Name = o.Name;
    this.Val = o.Val;
    return this;
  }
}

export class StdEnumEntry$i32$3 {
  Name = null;
  Val = 0;

  $clone() { return new StdEnumEntry$i32$3().$assign(this); }
  $assign(o) {
    this.Name = o.Name;
    this.Val = o.Val;
    return this;
  }
}

export class StdEnumEntry$i32$10 {
  Name = null;
  Val = 0;

  $clone() { return new StdEnumEntry$i32$10().$assign(this); }
  $assign(o) {
    this.Name = o.Name;
    this.Val = o.Val;
    return this;
  }
}

export class StdEnumEntry$i32$12 {
  Name = null;
  Val = 0;

  $clone() { return new StdEnumEntry$i32$12().$assign(this); }
  $assign(o) {
    this.Name = o.Name;
    this.Val = o.Val;
    return this;
  }
}

export class StdEnumAdapt$i32$u8 {
  rVal = null;
  pNames = null;

  init(rVal, pNames) {
    this.pNames = pNames;
    this.rVal = rVal;
    0;
    return this;
  }

  CompileFunc(pComp) {
    if (!pComp.isVerbose()) {
      pComp.Value$StdIntAdapt$i32$u8$4(mkIntAdaptT$4(this.rVal));
      return;
    }
    if (!pComp.isDeserializer()) {
      let pName = this.pNames;
      for (; pName.Name != null; pName = $oadd(pName, 1)) {
        if (pName.Val === this.rVal.a[this.rVal.o]) {
          pComp.String$ppi8$i32(P(pName, "Name"), 2 /*RCT_Idtf*/);
          break;
        }
      }
      if (pName.Name == null) {
        pComp.Value$StdIntAdapt$i32$u8$4(mkIntAdaptT$4(this.rVal));
      }
    } else {
      const val = [0];
      try {
        pComp.Value$ru8(P(val, 0));
        this.rVal.a[this.rVal.o] = val[0];
      } catch ($e2) {
        if ($e2 instanceof $.StdCompiler$NotFoundException) {
          const pEx = $e2;
          $delete(pEx);
          let Name = new $.StdStrBuf();
          pComp.Value$StdParameterAdapt$StdStrBuf$i32$2(mkParAdapt$rStdStrBuf$mi32(Name, 2 /*RCT_Idtf*/));
          let pName = this.pNames;
          for (; pName.Name != null; pName = $oadd(pName, 1)) {
            if (Name.op_eq$pi8(pName.Name)) {
              this.rVal.a[this.rVal.o] = pName.Val;
              break;
            }
          }
          if (pName.Name == null) {
            pComp.Warn(S("Unknown bit name: %s"), Name.getData());
          }
        } else {
          throw $e2;
        }
      }
    }
  }

  $clone() { return new StdEnumAdapt$i32$u8().$assign(this); }
  $assign(o) {
    this.rVal = o.rVal;
    this.pNames = o.pNames;
    return this;
  }
}

export class StdEnumAdapt$i32$i32 {
  rVal = null;
  pNames = null;

  init(rVal, pNames) {
    this.pNames = pNames;
    this.rVal = rVal;
    0;
    return this;
  }

  CompileFunc(pComp) {
    if (!pComp.isVerbose()) {
      pComp.Value$StdIntAdapt$i32$i32$6(mkIntAdaptT$21(this.rVal));
      return;
    }
    if (!pComp.isDeserializer()) {
      let pName = this.pNames;
      for (; pName.Name != null; pName = $oadd(pName, 1)) {
        if (pName.Val === this.rVal.a[this.rVal.o]) {
          pComp.String$ppi8$i32(P(pName, "Name"), 2 /*RCT_Idtf*/);
          break;
        }
      }
      if (pName.Name == null) {
        pComp.Value$StdIntAdapt$i32$i32$6(mkIntAdaptT$21(this.rVal));
      }
    } else {
      const val = [0];
      try {
        pComp.Value$ri32(P(val, 0));
        this.rVal.a[this.rVal.o] = val[0];
      } catch ($e2) {
        if ($e2 instanceof $.StdCompiler$NotFoundException) {
          const pEx = $e2;
          $delete(pEx);
          let Name = new $.StdStrBuf();
          pComp.Value$StdParameterAdapt$StdStrBuf$i32$2(mkParAdapt$rStdStrBuf$mi32(Name, 2 /*RCT_Idtf*/));
          let pName = this.pNames;
          for (; pName.Name != null; pName = $oadd(pName, 1)) {
            if (Name.op_eq$pi8(pName.Name)) {
              this.rVal.a[this.rVal.o] = pName.Val;
              break;
            }
          }
          if (pName.Name == null) {
            pComp.Warn(S("Unknown bit name: %s"), Name.getData());
          }
        } else {
          throw $e2;
        }
      }
    }
  }

  op_eq(nValue) {
    return this.rVal.a[this.rVal.o] === nValue;
  }

  op_assign(nValue) {
    this.rVal.a[this.rVal.o] = nValue;
    return this;
  }

  $clone() { return new StdEnumAdapt$i32$i32().$assign(this); }
  $assign(o) {
    this.rVal = o.rVal;
    this.pNames = o.pNames;
    return this;
  }
}

export class StdEnumAdapt$i32$u8$2 {
  rVal = null;
  pNames = null;

  init(rVal, pNames) {
    this.pNames = pNames;
    this.rVal = rVal;
    0;
    return this;
  }

  CompileFunc(pComp) {
    if (!pComp.isVerbose()) {
      pComp.Value$StdIntAdapt$i32$u8$6(mkIntAdaptT$6(this.rVal));
      return;
    }
    if (!pComp.isDeserializer()) {
      let pName = this.pNames;
      for (; pName.Name != null; pName = $oadd(pName, 1)) {
        if (pName.Val === this.rVal.a[this.rVal.o]) {
          pComp.String$ppi8$i32(P(pName, "Name"), 2 /*RCT_Idtf*/);
          break;
        }
      }
      if (pName.Name == null) {
        pComp.Value$StdIntAdapt$i32$u8$6(mkIntAdaptT$6(this.rVal));
      }
    } else {
      const val = [0];
      try {
        pComp.Value$ru8(P(val, 0));
        this.rVal.a[this.rVal.o] = val[0];
      } catch ($e2) {
        if ($e2 instanceof $.StdCompiler$NotFoundException) {
          const pEx = $e2;
          $delete(pEx);
          let Name = new $.StdStrBuf();
          pComp.Value$StdParameterAdapt$StdStrBuf$i32$2(mkParAdapt$rStdStrBuf$mi32(Name, 2 /*RCT_Idtf*/));
          let pName = this.pNames;
          for (; pName.Name != null; pName = $oadd(pName, 1)) {
            if (Name.op_eq$pi8(pName.Name)) {
              this.rVal.a[this.rVal.o] = pName.Val;
              break;
            }
          }
          if (pName.Name == null) {
            pComp.Warn(S("Unknown bit name: %s"), Name.getData());
          }
        } else {
          throw $e2;
        }
      }
    }
  }

  op_eq(nValue) {
    return this.rVal.a[this.rVal.o] === nValue;
  }

  op_assign(nValue) {
    this.rVal.a[this.rVal.o] = nValue;
    return this;
  }

  $clone() { return new StdEnumAdapt$i32$u8$2().$assign(this); }
  $assign(o) {
    this.rVal = o.rVal;
    this.pNames = o.pNames;
    return this;
  }
}

export class StdEnumAdapt$i32$i32$3 {
  rVal = null;
  pNames = null;

  init(rVal, pNames) {
    this.pNames = pNames;
    this.rVal = rVal;
    0;
    return this;
  }

  CompileFunc(pComp) {
    if (!pComp.isVerbose()) {
      pComp.Value$StdIntAdapt$i32$i32$4(mkIntAdaptT$19(this.rVal));
      return;
    }
    if (!pComp.isDeserializer()) {
      let pName = this.pNames;
      for (; pName.Name != null; pName = $oadd(pName, 1)) {
        if (pName.Val === this.rVal.a[this.rVal.o]) {
          pComp.String$ppi8$i32(P(pName, "Name"), 2 /*RCT_Idtf*/);
          break;
        }
      }
      if (pName.Name == null) {
        pComp.Value$StdIntAdapt$i32$i32$4(mkIntAdaptT$19(this.rVal));
      }
    } else {
      const val = [0];
      try {
        pComp.Value$ri32(P(val, 0));
        this.rVal.a[this.rVal.o] = val[0];
      } catch ($e2) {
        if ($e2 instanceof $.StdCompiler$NotFoundException) {
          const pEx = $e2;
          $delete(pEx);
          let Name = new $.StdStrBuf();
          pComp.Value$StdParameterAdapt$StdStrBuf$i32$2(mkParAdapt$rStdStrBuf$mi32(Name, 2 /*RCT_Idtf*/));
          let pName = this.pNames;
          for (; pName.Name != null; pName = $oadd(pName, 1)) {
            if (Name.op_eq$pi8(pName.Name)) {
              this.rVal.a[this.rVal.o] = pName.Val;
              break;
            }
          }
          if (pName.Name == null) {
            pComp.Warn(S("Unknown bit name: %s"), Name.getData());
          }
        } else {
          throw $e2;
        }
      }
    }
  }

  op_eq(nValue) {
    return this.rVal.a[this.rVal.o] === nValue;
  }

  op_assign(nValue) {
    this.rVal.a[this.rVal.o] = nValue;
    return this;
  }

  $clone() { return new StdEnumAdapt$i32$i32$3().$assign(this); }
  $assign(o) {
    this.rVal = o.rVal;
    this.pNames = o.pNames;
    return this;
  }
}

export class StdEnumAdapt$i32$u8$3 {
  rVal = null;
  pNames = null;

  init(rVal, pNames) {
    this.pNames = pNames;
    this.rVal = rVal;
    0;
    return this;
  }

  CompileFunc(pComp) {
    if (!pComp.isVerbose()) {
      pComp.Value$StdIntAdapt$i32$u8$2(mkIntAdaptT$2(this.rVal));
      return;
    }
    if (!pComp.isDeserializer()) {
      let pName = this.pNames;
      for (; pName.Name != null; pName = $oadd(pName, 1)) {
        if (pName.Val === this.rVal.a[this.rVal.o]) {
          pComp.String$ppi8$i32(P(pName, "Name"), 2 /*RCT_Idtf*/);
          break;
        }
      }
      if (pName.Name == null) {
        pComp.Value$StdIntAdapt$i32$u8$2(mkIntAdaptT$2(this.rVal));
      }
    } else {
      const val = [0];
      try {
        pComp.Value$ru8(P(val, 0));
        this.rVal.a[this.rVal.o] = val[0];
      } catch ($e2) {
        if ($e2 instanceof $.StdCompiler$NotFoundException) {
          const pEx = $e2;
          $delete(pEx);
          let Name = new $.StdStrBuf();
          pComp.Value$StdParameterAdapt$StdStrBuf$i32$2(mkParAdapt$rStdStrBuf$mi32(Name, 2 /*RCT_Idtf*/));
          let pName = this.pNames;
          for (; pName.Name != null; pName = $oadd(pName, 1)) {
            if (Name.op_eq$pi8(pName.Name)) {
              this.rVal.a[this.rVal.o] = pName.Val;
              break;
            }
          }
          if (pName.Name == null) {
            pComp.Warn(S("Unknown bit name: %s"), Name.getData());
          }
        } else {
          throw $e2;
        }
      }
    }
  }

  op_eq(nValue) {
    return this.rVal.a[this.rVal.o] === nValue;
  }

  op_assign(nValue) {
    this.rVal.a[this.rVal.o] = nValue;
    return this;
  }

  $clone() { return new StdEnumAdapt$i32$u8$3().$assign(this); }
  $assign(o) {
    this.rVal = o.rVal;
    this.pNames = o.pNames;
    return this;
  }
}

export class StdEnumAdapt$i32$u8$5 {
  rVal = null;
  pNames = null;

  init(rVal, pNames) {
    this.pNames = pNames;
    this.rVal = rVal;
    0;
    return this;
  }

  CompileFunc(pComp) {
    if (!pComp.isVerbose()) {
      pComp.Value$StdIntAdapt$i32$u8$15(mkIntAdaptT$15(this.rVal));
      return;
    }
    if (!pComp.isDeserializer()) {
      let pName = this.pNames;
      for (; pName.Name != null; pName = $oadd(pName, 1)) {
        if (pName.Val === this.rVal.a[this.rVal.o]) {
          pComp.String$ppi8$i32(P(pName, "Name"), 2 /*RCT_Idtf*/);
          break;
        }
      }
      if (pName.Name == null) {
        pComp.Value$StdIntAdapt$i32$u8$15(mkIntAdaptT$15(this.rVal));
      }
    } else {
      const val = [0];
      try {
        pComp.Value$ru8(P(val, 0));
        this.rVal.a[this.rVal.o] = val[0];
      } catch ($e2) {
        if ($e2 instanceof $.StdCompiler$NotFoundException) {
          const pEx = $e2;
          $delete(pEx);
          let Name = new $.StdStrBuf();
          pComp.Value$StdParameterAdapt$StdStrBuf$i32$2(mkParAdapt$rStdStrBuf$mi32(Name, 2 /*RCT_Idtf*/));
          let pName = this.pNames;
          for (; pName.Name != null; pName = $oadd(pName, 1)) {
            if (Name.op_eq$pi8(pName.Name)) {
              this.rVal.a[this.rVal.o] = pName.Val;
              break;
            }
          }
          if (pName.Name == null) {
            pComp.Warn(S("Unknown bit name: %s"), Name.getData());
          }
        } else {
          throw $e2;
        }
      }
    }
  }

  op_eq(nValue) {
    return this.rVal.a[this.rVal.o] === nValue;
  }

  op_assign(nValue) {
    this.rVal.a[this.rVal.o] = nValue;
    return this;
  }

  $clone() { return new StdEnumAdapt$i32$u8$5().$assign(this); }
  $assign(o) {
    this.rVal = o.rVal;
    this.pNames = o.pNames;
    return this;
  }
}

export class StdEnumAdapt$i32$u8$6 {
  rVal = null;
  pNames = null;

  init(rVal, pNames) {
    this.pNames = pNames;
    this.rVal = rVal;
    0;
    return this;
  }

  CompileFunc(pComp) {
    if (!pComp.isVerbose()) {
      pComp.Value$StdIntAdapt$i32$u8$16(mkIntAdaptT$16(this.rVal));
      return;
    }
    if (!pComp.isDeserializer()) {
      let pName = this.pNames;
      for (; pName.Name != null; pName = $oadd(pName, 1)) {
        if (pName.Val === this.rVal.a[this.rVal.o]) {
          pComp.String$ppi8$i32(P(pName, "Name"), 2 /*RCT_Idtf*/);
          break;
        }
      }
      if (pName.Name == null) {
        pComp.Value$StdIntAdapt$i32$u8$16(mkIntAdaptT$16(this.rVal));
      }
    } else {
      const val = [0];
      try {
        pComp.Value$ru8(P(val, 0));
        this.rVal.a[this.rVal.o] = val[0];
      } catch ($e2) {
        if ($e2 instanceof $.StdCompiler$NotFoundException) {
          const pEx = $e2;
          $delete(pEx);
          let Name = new $.StdStrBuf();
          pComp.Value$StdParameterAdapt$StdStrBuf$i32$2(mkParAdapt$rStdStrBuf$mi32(Name, 2 /*RCT_Idtf*/));
          let pName = this.pNames;
          for (; pName.Name != null; pName = $oadd(pName, 1)) {
            if (Name.op_eq$pi8(pName.Name)) {
              this.rVal.a[this.rVal.o] = pName.Val;
              break;
            }
          }
          if (pName.Name == null) {
            pComp.Warn(S("Unknown bit name: %s"), Name.getData());
          }
        } else {
          throw $e2;
        }
      }
    }
  }

  op_eq(nValue) {
    return this.rVal.a[this.rVal.o] === nValue;
  }

  op_assign(nValue) {
    this.rVal.a[this.rVal.o] = nValue;
    return this;
  }

  $clone() { return new StdEnumAdapt$i32$u8$6().$assign(this); }
  $assign(o) {
    this.rVal = o.rVal;
    this.pNames = o.pNames;
    return this;
  }
}

export class StdEnumAdapt$i32$u8$7 {
  rVal = null;
  pNames = null;

  init(rVal, pNames) {
    this.pNames = pNames;
    this.rVal = rVal;
    0;
    return this;
  }

  CompileFunc(pComp) {
    if (!pComp.isVerbose()) {
      pComp.Value$StdIntAdapt$i32$u8$12(mkIntAdaptT$12(this.rVal));
      return;
    }
    if (!pComp.isDeserializer()) {
      let pName = this.pNames;
      for (; pName.Name != null; pName = $oadd(pName, 1)) {
        if (pName.Val === this.rVal.a[this.rVal.o]) {
          pComp.String$ppi8$i32(P(pName, "Name"), 2 /*RCT_Idtf*/);
          break;
        }
      }
      if (pName.Name == null) {
        pComp.Value$StdIntAdapt$i32$u8$12(mkIntAdaptT$12(this.rVal));
      }
    } else {
      const val = [0];
      try {
        pComp.Value$ru8(P(val, 0));
        this.rVal.a[this.rVal.o] = val[0];
      } catch ($e2) {
        if ($e2 instanceof $.StdCompiler$NotFoundException) {
          const pEx = $e2;
          $delete(pEx);
          let Name = new $.StdStrBuf();
          pComp.Value$StdParameterAdapt$StdStrBuf$i32$2(mkParAdapt$rStdStrBuf$mi32(Name, 2 /*RCT_Idtf*/));
          let pName = this.pNames;
          for (; pName.Name != null; pName = $oadd(pName, 1)) {
            if (Name.op_eq$pi8(pName.Name)) {
              this.rVal.a[this.rVal.o] = pName.Val;
              break;
            }
          }
          if (pName.Name == null) {
            pComp.Warn(S("Unknown bit name: %s"), Name.getData());
          }
        } else {
          throw $e2;
        }
      }
    }
  }

  op_eq(nValue) {
    return this.rVal.a[this.rVal.o] === nValue;
  }

  op_assign(nValue) {
    this.rVal.a[this.rVal.o] = nValue;
    return this;
  }

  $clone() { return new StdEnumAdapt$i32$u8$7().$assign(this); }
  $assign(o) {
    this.rVal = o.rVal;
    this.pNames = o.pNames;
    return this;
  }
}

export class StdEnumAdapt$i32$u8$8 {
  rVal = null;
  pNames = null;

  init(rVal, pNames) {
    this.pNames = pNames;
    this.rVal = rVal;
    0;
    return this;
  }

  CompileFunc(pComp) {
    if (!pComp.isVerbose()) {
      pComp.Value$StdIntAdapt$i32$u8$17(mkIntAdaptT$17(this.rVal));
      return;
    }
    if (!pComp.isDeserializer()) {
      let pName = this.pNames;
      for (; pName.Name != null; pName = $oadd(pName, 1)) {
        if (pName.Val === this.rVal.a[this.rVal.o]) {
          pComp.String$ppi8$i32(P(pName, "Name"), 2 /*RCT_Idtf*/);
          break;
        }
      }
      if (pName.Name == null) {
        pComp.Value$StdIntAdapt$i32$u8$17(mkIntAdaptT$17(this.rVal));
      }
    } else {
      const val = [0];
      try {
        pComp.Value$ru8(P(val, 0));
        this.rVal.a[this.rVal.o] = val[0];
      } catch ($e2) {
        if ($e2 instanceof $.StdCompiler$NotFoundException) {
          const pEx = $e2;
          $delete(pEx);
          let Name = new $.StdStrBuf();
          pComp.Value$StdParameterAdapt$StdStrBuf$i32$2(mkParAdapt$rStdStrBuf$mi32(Name, 2 /*RCT_Idtf*/));
          let pName = this.pNames;
          for (; pName.Name != null; pName = $oadd(pName, 1)) {
            if (Name.op_eq$pi8(pName.Name)) {
              this.rVal.a[this.rVal.o] = pName.Val;
              break;
            }
          }
          if (pName.Name == null) {
            pComp.Warn(S("Unknown bit name: %s"), Name.getData());
          }
        } else {
          throw $e2;
        }
      }
    }
  }

  $clone() { return new StdEnumAdapt$i32$u8$8().$assign(this); }
  $assign(o) {
    this.rVal = o.rVal;
    this.pNames = o.pNames;
    return this;
  }
}

export class StdEnumAdapt$i32$u8$9 {
  rVal = null;
  pNames = null;

  init(rVal, pNames) {
    this.pNames = pNames;
    this.rVal = rVal;
    0;
    return this;
  }

  CompileFunc(pComp) {
    if (!pComp.isVerbose()) {
      pComp.Value$StdIntAdapt$i32$u8$18(mkIntAdaptT$18(this.rVal));
      return;
    }
    if (!pComp.isDeserializer()) {
      let pName = this.pNames;
      for (; pName.Name != null; pName = $oadd(pName, 1)) {
        if (pName.Val === this.rVal.a[this.rVal.o]) {
          pComp.String$ppi8$i32(P(pName, "Name"), 2 /*RCT_Idtf*/);
          break;
        }
      }
      if (pName.Name == null) {
        pComp.Value$StdIntAdapt$i32$u8$18(mkIntAdaptT$18(this.rVal));
      }
    } else {
      const val = [0];
      try {
        pComp.Value$ru8(P(val, 0));
        this.rVal.a[this.rVal.o] = val[0];
      } catch ($e2) {
        if ($e2 instanceof $.StdCompiler$NotFoundException) {
          const pEx = $e2;
          $delete(pEx);
          let Name = new $.StdStrBuf();
          pComp.Value$StdParameterAdapt$StdStrBuf$i32$2(mkParAdapt$rStdStrBuf$mi32(Name, 2 /*RCT_Idtf*/));
          let pName = this.pNames;
          for (; pName.Name != null; pName = $oadd(pName, 1)) {
            if (Name.op_eq$pi8(pName.Name)) {
              this.rVal.a[this.rVal.o] = pName.Val;
              break;
            }
          }
          if (pName.Name == null) {
            pComp.Warn(S("Unknown bit name: %s"), Name.getData());
          }
        } else {
          throw $e2;
        }
      }
    }
  }

  $clone() { return new StdEnumAdapt$i32$u8$9().$assign(this); }
  $assign(o) {
    this.rVal = o.rVal;
    this.pNames = o.pNames;
    return this;
  }
}

export class StdBitfieldEntry$i32 {
  Name = null;
  Val = 0;

  $clone() { return new StdBitfieldEntry$i32().$assign(this); }
  $assign(o) {
    this.Name = o.Name;
    this.Val = o.Val;
    return this;
  }
}

export class StdBitfieldEntry$u8 {
  Name = null;
  Val = 0;

  $clone() { return new StdBitfieldEntry$u8().$assign(this); }
  $assign(o) {
    this.Name = o.Name;
    this.Val = o.Val;
    return this;
  }
}

export class StdBitfieldEntry$u16 {
  Name = null;
  Val = 0;

  $clone() { return new StdBitfieldEntry$u16().$assign(this); }
  $assign(o) {
    this.Name = o.Name;
    this.Val = o.Val;
    return this;
  }
}

export class StdBitfieldAdapt$i32 {
  rVal = null;
  pNames = null;

  init(rVal, pNames) {
    this.pNames = pNames;
    this.rVal = rVal;
    0;
    return this;
  }

  CompileFunc(pComp) {
    if (!pComp.isVerbose()) {
      pComp.Value$ri32(this.rVal);
      return;
    }
    if (!pComp.isDeserializer()) {
      const val = [this.rVal.a[this.rVal.o]];
      let orig_val = this.rVal.a[this.rVal.o];
      let fFirst = true;
      for (let pName = this.pNames; pName.Name != null; pName = $oadd(pName, 1)) {
        if ((pName.Val & val[0]) === pName.Val) {
          if (orig_val !== 0 && pName.Val === 0) {
            continue;
          }
          if (!fFirst) {
            pComp.Separator(11 /*SEP_VLINE*/);
          }
          pComp.String$ppi8$i32(P(pName, "Name"), 2 /*RCT_Idtf*/);
          fFirst = false;
          val[0] &= ~pName.Val;
        }
      }
      if (val[0] !== 0 || fFirst) {
        if (!fFirst) {
          pComp.Separator(11 /*SEP_VLINE*/);
        }
        pComp.Value$ri32(P(val, 0));
      }
    } else {
      let val = 0;
      do {
        try {
          const tmp = [0];
          pComp.Value$ri32(P(tmp, 0));
          val |= tmp[0];
        } catch ($e3) {
          if ($e3 instanceof $.StdCompiler$NotFoundException) {
            const pEx = $e3;
            $delete(pEx);
            let Name = new $.StdStrBuf();
            pComp.Value$StdParameterAdapt$StdStrBuf$i32$2(mkParAdapt$rStdStrBuf$mi32(Name, 2 /*RCT_Idtf*/));
            let pName = this.pNames;
            for (; pName.Name != null; pName = $oadd(pName, 1)) {
              if (Name.op_eq$pi8(pName.Name)) {
                val |= pName.Val;
                break;
              }
            }
            if (pName.Name == null) {
              pComp.Warn(S("Unknown bit name: %s"), Name.getData());
            }
          } else {
            throw $e3;
          }
        }
      } while (pComp.Separator(11 /*SEP_VLINE*/));
      this.rVal.a[this.rVal.o] = val;
    }
  }

  op_eq(nValue) {
    return this.rVal.a[this.rVal.o] === nValue;
  }

  op_assign(nValue) {
    this.rVal.a[this.rVal.o] = nValue;
    return this;
  }

  op_eq$2(nValue) {
    return this.rVal.a[this.rVal.o] === nValue;
  }

  op_assign$2(nValue) {
    this.rVal.a[this.rVal.o] = nValue;
    return this;
  }

  $clone() { return new StdBitfieldAdapt$i32().$assign(this); }
  $assign(o) {
    this.rVal = o.rVal;
    this.pNames = o.pNames;
    return this;
  }
}

export class StdBitfieldAdapt$u8 {
  rVal = null;
  pNames = null;

  init(rVal, pNames) {
    this.pNames = pNames;
    this.rVal = rVal;
    0;
    return this;
  }

  CompileFunc(pComp) {
    if (!pComp.isVerbose()) {
      pComp.Value$ru8(this.rVal);
      return;
    }
    if (!pComp.isDeserializer()) {
      const val = [this.rVal.a[this.rVal.o]];
      let orig_val = this.rVal.a[this.rVal.o];
      let fFirst = true;
      for (let pName = this.pNames; pName.Name != null; pName = $oadd(pName, 1)) {
        if ((pName.Val & val[0]) === pName.Val) {
          if (orig_val !== 0 && pName.Val === 0) {
            continue;
          }
          if (!fFirst) {
            pComp.Separator(11 /*SEP_VLINE*/);
          }
          pComp.String$ppi8$i32(P(pName, "Name"), 2 /*RCT_Idtf*/);
          fFirst = false;
          val[0] = (val[0] & ~pName.Val) & 0xff;
        }
      }
      if (val[0] !== 0 || fFirst) {
        if (!fFirst) {
          pComp.Separator(11 /*SEP_VLINE*/);
        }
        pComp.Value$ru8(P(val, 0));
      }
    } else {
      let val = 0;
      do {
        try {
          const tmp = [0];
          pComp.Value$ru8(P(tmp, 0));
          val = (val | tmp[0]) & 0xff;
        } catch ($e3) {
          if ($e3 instanceof $.StdCompiler$NotFoundException) {
            const pEx = $e3;
            $delete(pEx);
            let Name = new $.StdStrBuf();
            pComp.Value$StdParameterAdapt$StdStrBuf$i32$2(mkParAdapt$rStdStrBuf$mi32(Name, 2 /*RCT_Idtf*/));
            let pName = this.pNames;
            for (; pName.Name != null; pName = $oadd(pName, 1)) {
              if (Name.op_eq$pi8(pName.Name)) {
                val = (val | pName.Val) & 0xff;
                break;
              }
            }
            if (pName.Name == null) {
              pComp.Warn(S("Unknown bit name: %s"), Name.getData());
            }
          } else {
            throw $e3;
          }
        }
      } while (pComp.Separator(11 /*SEP_VLINE*/));
      this.rVal.a[this.rVal.o] = val;
    }
  }

  op_eq(nValue) {
    return this.rVal.a[this.rVal.o] === nValue;
  }

  op_assign(nValue) {
    this.rVal.a[this.rVal.o] = nValue & 0xff;
    return this;
  }

  $clone() { return new StdBitfieldAdapt$u8().$assign(this); }
  $assign(o) {
    this.rVal = o.rVal;
    this.pNames = o.pNames;
    return this;
  }
}

export class StdBitfieldAdapt$u16 {
  rVal = null;
  pNames = null;

  init(rVal, pNames) {
    this.pNames = pNames;
    this.rVal = rVal;
    0;
    return this;
  }

  CompileFunc(pComp) {
    if (!pComp.isVerbose()) {
      pComp.Value$ru16(this.rVal);
      return;
    }
    if (!pComp.isDeserializer()) {
      const val = [this.rVal.a[this.rVal.o]];
      let orig_val = this.rVal.a[this.rVal.o];
      let fFirst = true;
      for (let pName = this.pNames; pName.Name != null; pName = $oadd(pName, 1)) {
        if ((pName.Val & val[0]) === pName.Val) {
          if (orig_val !== 0 && pName.Val === 0) {
            continue;
          }
          if (!fFirst) {
            pComp.Separator(11 /*SEP_VLINE*/);
          }
          pComp.String$ppi8$i32(P(pName, "Name"), 2 /*RCT_Idtf*/);
          fFirst = false;
          val[0] = (val[0] & ~pName.Val) & 0xffff;
        }
      }
      if (val[0] !== 0 || fFirst) {
        if (!fFirst) {
          pComp.Separator(11 /*SEP_VLINE*/);
        }
        pComp.Value$ru16(P(val, 0));
      }
    } else {
      let val = 0;
      do {
        try {
          const tmp = [0];
          pComp.Value$ru16(P(tmp, 0));
          val = (val | tmp[0]) & 0xffff;
        } catch ($e3) {
          if ($e3 instanceof $.StdCompiler$NotFoundException) {
            const pEx = $e3;
            $delete(pEx);
            let Name = new $.StdStrBuf();
            pComp.Value$StdParameterAdapt$StdStrBuf$i32$2(mkParAdapt$rStdStrBuf$mi32(Name, 2 /*RCT_Idtf*/));
            let pName = this.pNames;
            for (; pName.Name != null; pName = $oadd(pName, 1)) {
              if (Name.op_eq$pi8(pName.Name)) {
                val = (val | pName.Val) & 0xffff;
                break;
              }
            }
            if (pName.Name == null) {
              pComp.Warn(S("Unknown bit name: %s"), Name.getData());
            }
          } else {
            throw $e3;
          }
        }
      } while (pComp.Separator(11 /*SEP_VLINE*/));
      this.rVal.a[this.rVal.o] = val;
    }
  }

  op_eq(nValue) {
    return this.rVal.a[this.rVal.o] === nValue;
  }

  op_assign(nValue) {
    this.rVal.a[this.rVal.o] = nValue & 0xffff;
    return this;
  }

  $clone() { return new StdBitfieldAdapt$u16().$assign(this); }
  $assign(o) {
    this.rVal = o.rVal;
    this.pNames = o.pNames;
    return this;
  }
}

export class StdNamingCountAdapt$i32 {
  iCount = null;
  szName = null;

  init(iCount, szName) {
    this.szName = szName;
    this.iCount = iCount;
    return this;
  }

  CompileFunc(pComp) {
    if (pComp.hasNaming()) {
      if (pComp.isDeserializer()) {
        this.iCount.a[this.iCount.o] = pComp.NameCount(this.szName);
      }
    } else {
      pComp.Value$StdIntPackAdapt$i32(mkIntPackAdapt$ri32(this.iCount));
    }
  }

  $clone() { return new StdNamingCountAdapt$i32().$assign(this); }
  $assign(o) {
    this.iCount = o.iCount;
    this.szName = o.szName;
    return this;
  }
}

export class StdNamingCountAdapt$u32 {
  iCount = null;
  szName = null;

  init(iCount, szName) {
    this.szName = szName;
    this.iCount = iCount;
    return this;
  }

  CompileFunc(pComp) {
    if (pComp.hasNaming()) {
      if (pComp.isDeserializer()) {
        this.iCount.a[this.iCount.o] = pComp.NameCount(this.szName) >>> 0;
      }
    } else {
      pComp.Value$StdIntPackAdapt$u32(mkIntPackAdapt$ru32(this.iCount));
    }
  }

  $clone() { return new StdNamingCountAdapt$u32().$assign(this); }
  $assign(o) {
    this.iCount = o.iCount;
    this.szName = o.szName;
    return this;
  }
}

export class StdPtrAdapt$C4ClientPlayerInfos extends StdBasicPtrAdapt$C4ClientPlayerInfos {

  init(rpObj, fAllowNull, szNaming = S("Data")) {
    super.init(rpObj, fAllowNull, szNaming);
    return this;
  }

  CompileFunc(pComp) {
    StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$C4ClientPlayerInfos(pComp, this);
  }

  $clone() { return new StdPtrAdapt$C4ClientPlayerInfos().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class StdPtrAdapt$C4Command extends StdBasicPtrAdapt$C4Command {

  init(rpObj, fAllowNull, szNaming) {
    super.init(rpObj, fAllowNull, szNaming);
    return this;
  }

  CompileFunc$pStdCompiler$rpC4ValueNumbers(pComp, pars) {
    StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$C4Command$rpC4ValueNumbers(pComp, this, $tmp(pars.a[pars.o]));
  }

  $clone() { return new StdPtrAdapt$C4Command().$assign(this); }
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

  CompileFunc$pStdCompiler$mpC4Object$rpC4ValueNumbers(pComp, pars, pars$2) {
    StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$C4Effect$mpC4Object$rpC4ValueNumbers(pComp, this, pars, $tmp(pars$2.a[pars$2.o]));
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

export class StdPtrAdapt$C4GameRes extends StdBasicPtrAdapt$C4GameRes {

  init(rpObj, fAllowNull, szNaming = S("Data")) {
    super.init(rpObj, fAllowNull, szNaming);
    return this;
  }

  CompileFunc(pComp) {
    StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$C4GameRes(pComp, this);
  }

  $clone() { return new StdPtrAdapt$C4GameRes().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class StdPtrAdapt$C4IDPacket extends StdBasicPtrAdapt$C4IDPacket {

  init(rpObj, fAllowNull, szNaming = S("Data")) {
    super.init(rpObj, fAllowNull, szNaming);
    return this;
  }

  CompileFunc(pComp) {
    StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$C4IDPacket(pComp, this);
  }

  $clone() { return new StdPtrAdapt$C4IDPacket().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class StdPtrAdapt$AccessGfx extends StdBasicPtrAdapt$AccessGfx {

  init(rpObj, fAllowNull, szNaming = S("Data")) {
    super.init(rpObj, fAllowNull, szNaming);
    return this;
  }

  CompileFunc(pComp) {
    StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$AccessGfx(pComp, this);
  }

  $clone() { return new StdPtrAdapt$AccessGfx().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class StdPtrAdapt$C4PktDebugRec extends StdBasicPtrAdapt$C4PktDebugRec {

  init(rpObj, fAllowNull, szNaming = S("Data")) {
    super.init(rpObj, fAllowNull, szNaming);
    return this;
  }

  CompileFunc(pComp) {
    StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$C4PktDebugRec(pComp, this);
  }

  $clone() { return new StdPtrAdapt$C4PktDebugRec().$assign(this); }
  $assign(o) {
    super.$assign(o);
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

export class StdPtrAdapt$StdBuf extends StdBasicPtrAdapt$StdBuf {

  init(rpObj, fAllowNull, szNaming = S("Data")) {
    super.init(rpObj, fAllowNull, szNaming);
    return this;
  }

  CompileFunc(pComp) {
    StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$StdBuf(pComp, this);
  }

  $clone() { return new StdPtrAdapt$StdBuf().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class StdPtrAdapt$C4Control extends StdBasicPtrAdapt$C4Control {

  init(rpObj, fAllowNull, szNaming = S("Data")) {
    super.init(rpObj, fAllowNull, szNaming);
    return this;
  }

  CompileFunc(pComp) {
    StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$C4Control(pComp, this);
  }

  $clone() { return new StdPtrAdapt$C4Control().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class StdPtrAdapt$C4DrawTransform extends StdBasicPtrAdapt$C4DrawTransform {

  init(rpObj, fAllowNull, szNaming) {
    super.init(rpObj, fAllowNull, szNaming);
    return this;
  }

  CompileFunc(pComp) {
    StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$C4DrawTransform(pComp, this);
  }

  $clone() { return new StdPtrAdapt$C4DrawTransform().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class StdPtrAdapt$Scenario extends StdBasicPtrAdapt$Scenario {

  init(rpObj, fAllowNull, szNaming = S("Data")) {
    super.init(rpObj, fAllowNull, szNaming);
    return this;
  }

  CompileFunc(pComp) {
    StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$Scenario(pComp, this);
  }

  $clone() { return new StdPtrAdapt$Scenario().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class StdPtrAdapt$C4MessageBoardQuery extends StdBasicPtrAdapt$C4MessageBoardQuery {

  init(rpObj, fAllowNull, szNaming) {
    super.init(rpObj, fAllowNull, szNaming);
    return this;
  }

  CompileFunc(pComp) {
    StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$C4MessageBoardQuery(pComp, this);
  }

  $clone() { return new StdPtrAdapt$C4MessageBoardQuery().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class StdPtrAdapt$C4Network2ResCore extends StdBasicPtrAdapt$C4Network2ResCore {

  init(rpObj, fAllowNull, szNaming = S("Data")) {
    super.init(rpObj, fAllowNull, szNaming);
    return this;
  }

  CompileFunc(pComp) {
    StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$C4Network2ResCore(pComp, this);
  }

  $clone() { return new StdPtrAdapt$C4Network2ResCore().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class StdPtrAdapt$C4Object extends StdBasicPtrAdapt$C4Object {

  init(rpObj, fAllowNull, szNaming = S("Data")) {
    super.init(rpObj, fAllowNull, szNaming);
    return this;
  }

  CompileFunc$pStdCompiler$rpC4ValueNumbers(pComp, pars) {
    StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$C4Object$rpC4ValueNumbers(pComp, this, $tmp(pars.a[pars.o]));
  }

  $clone() { return new StdPtrAdapt$C4Object().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class StdPtrAdapt$C4PlayerInfo extends StdBasicPtrAdapt$C4PlayerInfo {

  init(rpObj, fAllowNull, szNaming = S("Data")) {
    super.init(rpObj, fAllowNull, szNaming);
    return this;
  }

  CompileFunc(pComp) {
    StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$C4PlayerInfo(pComp, this);
  }

  $clone() { return new StdPtrAdapt$C4PlayerInfo().$assign(this); }
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

export class StdPtrAdapt$C4RoundResultsPlayer extends StdBasicPtrAdapt$C4RoundResultsPlayer {

  init(rpObj, fAllowNull, szNaming = S("Data")) {
    super.init(rpObj, fAllowNull, szNaming);
    return this;
  }

  CompileFunc(pComp) {
    StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$C4RoundResultsPlayer(pComp, this);
  }

  $clone() { return new StdPtrAdapt$C4RoundResultsPlayer().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class StdPtrAdapt$C4Team extends StdBasicPtrAdapt$C4Team {

  init(rpObj, fAllowNull, szNaming = S("Data")) {
    super.init(rpObj, fAllowNull, szNaming);
    return this;
  }

  CompileFunc(pComp) {
    StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$C4Team(pComp, this);
  }

  $clone() { return new StdPtrAdapt$C4Team().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class StdPtrAdapt$StdMeshInstanceAnimationNode extends StdBasicPtrAdapt$StdMeshInstanceAnimationNode {

  init(rpObj, fAllowNull, szNaming) {
    super.init(rpObj, fAllowNull, szNaming);
    return this;
  }

  CompileFunc$pStdCompiler$pStdMesh(pComp, pars) {
    StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$StdMeshInstanceAnimationNode$pStdMesh(pComp, this, pars);
  }

  $clone() { return new StdPtrAdapt$StdMeshInstanceAnimationNode().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class StdContextPtrAdapt$StdMeshInstance$StdMesh extends StdBasicPtrAdapt$StdMeshInstance {
  pCtx = null;

  init(rpObj, rCtx, fAllowNull, szNaming) {
    super.init(rpObj, fAllowNull, szNaming);
    this.pCtx = rCtx;
    return this;
  }

  CompileFunc$pStdCompiler$x(pComp, p) {
    StdPtrAdaptCompileFunc$pStdCompiler$StdContextPtrAdapt$StdMeshInstance$StdMesh$x(pComp, this, p);
  }

  $clone() { return new StdContextPtrAdapt$StdMeshInstance$StdMesh().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pCtx = o.pCtx;
    return this;
  }
}

export class StdContextPtrAdapt$SerializableValueProvider$IDBase extends StdBasicPtrAdapt$SerializableValueProvider {
  pCtx = null;

  init(rpObj, rCtx, fAllowNull, szNaming = S("Data")) {
    super.init(rpObj, fAllowNull, szNaming);
    this.pCtx = rCtx;
    return this;
  }

  CompileFunc(pComp) {
    StdPtrAdaptCompileFunc$pStdCompiler$StdContextPtrAdapt$SerializableValueProvider$IDBase(pComp, this);
  }

  $clone() { return new StdContextPtrAdapt$SerializableValueProvider$IDBase().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pCtx = o.pCtx;
    return this;
  }
}

export function mkIntAdapt$ri32(rValue) {
  return new StdIntAdapt$i32$i32$2().init(rValue);
}

export function mkIntAdapt$ri32$2(rValue) {
  return new StdIntAdapt$i32$i32$6().init(rValue);
}

export function mkIntAdapt$ri32$3(rValue) {
  return new StdIntAdapt$i32$i32$3().init(rValue);
}

export function mkIntAdapt$ru8(rValue) {
  return new StdIntAdapt$u8$i32().init(rValue);
}

export function mkIntAdapt$ri32$4(rValue) {
  return new StdIntAdapt$i32$i32$7().init(rValue);
}

export function mkIntAdapt$ru32(rValue) {
  return new StdIntAdapt$u32$i32().init(rValue);
}

export function mkParAdapt$rStdCopyStrBuf$ri32(rObj, rPar) {
  return new StdParameterAdapt$StdCopyStrBuf$i32$2().init(rObj, $tmp(rPar.a[rPar.o]));
}

export function mkPtrAdapt$rpC4PropList$b(rpObj, fAllowNull) {
  return new StdPtrAdapt$C4PropList().init(rpObj, fAllowNull);
}

export function mkPtrAdapt$rpC4PlayerInfo$b(rpObj, fAllowNull) {
  return new StdPtrAdapt$C4PlayerInfo().init(rpObj, fAllowNull);
}

export function mkPtrAdapt$rpC4Network2ResCore$b(rpObj, fAllowNull) {
  return new StdPtrAdapt$C4Network2ResCore().init(rpObj, fAllowNull);
}

export function mkPtrAdapt$rpC4RoundResultsPlayer$b(rpObj, fAllowNull) {
  return new StdPtrAdapt$C4RoundResultsPlayer().init(rpObj, fAllowNull);
}

export function mkPtrAdapt$rpC4Team$b(rpObj, fAllowNull) {
  return new StdPtrAdapt$C4Team().init(rpObj, fAllowNull);
}

export function mkPtrAdapt$rpC4Effect$b(rpObj, fAllowNull) {
  return new StdPtrAdapt$C4Effect().init(rpObj, fAllowNull);
}

export function mkPtrAdapt$rpC4Object$b(rpObj, fAllowNull) {
  return new StdPtrAdapt$C4Object().init(rpObj, fAllowNull);
}

export function mkPtrAdapt$rpC4Control$b(rpObj, fAllowNull) {
  return new StdPtrAdapt$C4Control().init(rpObj, fAllowNull);
}

export function mkPtrAdapt$rpScenario$b(rpObj, fAllowNull) {
  return new StdPtrAdapt$Scenario().init(rpObj, fAllowNull);
}

export function mkCastAdapt(rValue) {
  return new StdCastAdapt$C4Fixed$i32().init(rValue);
}

export function mkEnumAdapt(rVal, pNames) {
  return new StdEnumAdapt$i32$i32$3().init(rVal, pNames);
}

export function mkEnumAdapt$2(rVal, pNames) {
  return new StdEnumAdapt$i32$i32$2().init(rVal, pNames);
}

export function mkEnumAdapt$3(rVal, pNames) {
  return new StdEnumAdapt$i32$i32().init(rVal, pNames);
}

export function mkIntAdaptT(rValue) {
  return new StdIntAdapt$i32$u8$10().init(rValue);
}

export function mkIntAdaptT$2(rValue) {
  return new StdIntAdapt$i32$u8$11().init(rValue);
}

export function mkIntAdaptT$3(rValue) {
  return new StdIntAdapt$i32$u8$16().init(rValue);
}

export function mkIntAdaptT$4(rValue) {
  return new StdIntAdapt$i32$u8().init(rValue);
}

export function mkIntAdaptT$5(rValue) {
  return new StdIntAdapt$i32$u8$8().init(rValue);
}

export function mkIntAdaptT$6(rValue) {
  return new StdIntAdapt$i32$u8$9().init(rValue);
}

export function mkIntAdaptT$7(rValue) {
  return new StdIntAdapt$i32$u8$7().init(rValue);
}

export function mkIntAdaptT$8(rValue) {
  return new StdIntAdapt$i32$u8$3().init(rValue);
}

export function mkIntAdaptT$9(rValue) {
  return new StdIntAdapt$i32$u8$4().init(rValue);
}

export function mkIntAdaptT$10(rValue) {
  return new StdIntAdapt$i32$u8$2().init(rValue);
}

export function mkIntAdaptT$11(rValue) {
  return new StdIntAdapt$i32$u8$5().init(rValue);
}

export function mkIntAdaptT$12(rValue) {
  return new StdIntAdapt$i32$u8$15().init(rValue);
}

export function mkIntAdaptT$13(rValue) {
  return new StdIntAdapt$i32$u8$12().init(rValue);
}

export function mkIntAdaptT$14(rValue) {
  return new StdIntAdapt$i32$u8$6().init(rValue);
}

export function mkIntAdaptT$15(rValue) {
  return new StdIntAdapt$i32$u8$13().init(rValue);
}

export function mkIntAdaptT$16(rValue) {
  return new StdIntAdapt$i32$u8$14().init(rValue);
}

export function mkIntAdaptT$17(rValue) {
  return new StdIntAdapt$i32$u8$17().init(rValue);
}

export function mkIntAdaptT$18(rValue) {
  return new StdIntAdapt$i32$u8$18().init(rValue);
}

export function mkIntAdaptT$19(rValue) {
  return new StdIntAdapt$i32$i32$5().init(rValue);
}

export function mkIntAdaptT$20(rValue) {
  return new StdIntAdapt$i32$i32$4().init(rValue);
}

export function mkIntAdaptT$21(rValue) {
  return new StdIntAdapt$i32$i32().init(rValue);
}

export function mkArrayAdapt$pi32$i32(pArray, iSize) {
  return new StdArrayAdapt$i32$_IdFuncClass$i32().init(pArray, iSize);
}

export function mkArrayAdapt$pi32$u64$i32(pArray, iSize, rDefault) {
  return new StdArrayDefaultAdapt$i32$i32$_IdFuncClass$i32().init(pArray, iSize, rDefault);
}

export function mkEnumAdaptT(rVal, pNames) {
  return new StdEnumAdapt$i32$u8$3().init(rVal, pNames);
}

export function mkEnumAdaptT$2(rVal, pNames) {
  return new StdEnumAdapt$i32$u8().init(rVal, pNames);
}

export function mkEnumAdaptT$3(rVal, pNames) {
  return new StdEnumAdapt$i32$u8$2().init(rVal, pNames);
}

export function mkEnumAdaptT$4(rVal, pNames) {
  return new StdEnumAdapt$i32$u8$7().init(rVal, pNames);
}

export function mkEnumAdaptT$5(rVal, pNames) {
  return new StdEnumAdapt$i32$u8$4().init(rVal, pNames);
}

export function mkEnumAdaptT$6(rVal, pNames) {
  return new StdEnumAdapt$i32$u8$5().init(rVal, pNames);
}

export function mkEnumAdaptT$7(rVal, pNames) {
  return new StdEnumAdapt$i32$u8$6().init(rVal, pNames);
}

export function mkEnumAdaptT$8(rVal, pNames) {
  return new StdEnumAdapt$i32$u8$8().init(rVal, pNames);
}

export function mkEnumAdaptT$9(rVal, pNames) {
  return new StdEnumAdapt$i32$u8$9().init(rVal, pNames);
}

export function mkArrayAdaptM(array) {
  return new StdArrayAdapt$i32$_IdFuncClass$i32().init(P(array, 0), 27);
}

export function mkInsertAdapt$mStdDecompileAdapt$C4PacketBase$ru8$b(rObj, rIns, fBefore = true) {
  return new StdInsertAdapt$StdDecompileAdapt$C4PacketBase$u8().init(rObj, rIns, fBefore);
}

export function mkInsertAdapt$mStdParameterAdapt$C4Object$pC4ValueNumbers$mStdNamingAdapt$C4ValueNumbers$b(rObj, rIns, fBefore) {
  return new StdInsertAdapt$StdParameterAdapt$C4Object$pC4ValueNumbers$StdNamingAdapt$C4ValueNumbers().init(rObj, rIns, fBefore);
}

export function mkInsertAdapt$mStdStrBuf$rStdBuf$b(rObj, rIns, fBefore) {
  return new StdInsertAdapt$StdStrBuf$StdBuf().init(rObj, rIns, fBefore);
}

export function mkNamingAdapt$mStdIntAdapt$i32$u8$pi8$i32$b$b(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$StdIntAdapt$i32$u8$i32$6().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$mStdIntAdapt$i32$u8$pi8$i32$b$b$2(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$StdIntAdapt$i32$u8$i32$7().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$mStdIntAdapt$i32$i32$pi8$i32$b$b(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$StdIntAdapt$i32$i32$i32().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$mStdIntAdapt$i32$u8$pi8$i32$b$b$3(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$StdIntAdapt$i32$u8$i32$5().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$mStdIntAdapt$i32$i32$pi8(rValue, szName) {
  return new StdNamingAdapt$StdIntAdapt$i32$i32().init(rValue, szName);
}

export function mkNamingAdapt$mStdIntAdapt$i32$u8$pi8$i32$b$b$4(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$StdIntAdapt$i32$u8$i32$4().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$mStdIntAdapt$i32$u8$pi8$i32$b$b$5(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$StdIntAdapt$i32$u8$i32$2().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$mStdIntAdapt$i32$u8$pi8(rValue, szName) {
  return new StdNamingAdapt$StdIntAdapt$i32$u8().init(rValue, szName);
}

export function mkNamingAdapt$mStdIntAdapt$i32$u8$pi8$i32$b$b$6(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$StdIntAdapt$i32$u8$i32().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$mStdIntAdapt$i32$u8$pi8$2(rValue, szName) {
  return new StdNamingAdapt$StdIntAdapt$i32$u8$2().init(rValue, szName);
}

export function mkNamingAdapt$mStdIntAdapt$i32$u8$pi8$i32$b$b$7(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$StdIntAdapt$i32$u8$i32$3().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$mStdIntAdapt$u8$i32$pi8(rValue, szName) {
  return new StdNamingAdapt$StdIntAdapt$u8$i32().init(rValue, szName);
}

export function mkNamingAdapt$mStdIntAdapt$i32$i32$pi8$2(rValue, szName) {
  return new StdNamingAdapt$StdIntAdapt$i32$i32$2().init(rValue, szName);
}

export function mkNamingAdapt$mStdIntAdapt$i32$i32$pi8$i32$b$b$2(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$StdIntAdapt$i32$i32$i32$2().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$mStdCastAdapt$i32$i32$pi8$i32$b$b(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$StdCastAdapt$i32$i32$i32().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$mStdCastAdapt$C4Fixed$i32$pi8$C4Fixed$b$b(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$StdCastAdapt$C4Fixed$i32$C4Fixed().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$mStdEnumAdapt$i32$u8$pi8$i32$b$b(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$StdEnumAdapt$i32$u8$i32$2().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$mStdEnumAdapt$i32$u8$pi8$i32$b$b$2(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$StdEnumAdapt$i32$u8$i32().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$mStdEnumAdapt$i32$u8$pi8$i32$b$b$3(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$StdEnumAdapt$i32$u8$i32$6().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$mStdEnumAdapt$i32$u8$pi8$i32$b$b$4(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$StdEnumAdapt$i32$u8$i32$3().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$mStdEnumAdapt$i32$i32$pi8$i32$b$b(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$StdEnumAdapt$i32$i32$i32$3().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$mStdEnumAdapt$i32$i32$pi8$i32$b$b$2(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$StdEnumAdapt$i32$i32$i32$2().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$mStdEnumAdapt$i32$u8$pi8$i32$b$b$5(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$StdEnumAdapt$i32$u8$i32$4().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$mStdEnumAdapt$i32$i32$pi8$i32$b$b$3(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$StdEnumAdapt$i32$i32$i32().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$mStdEnumAdapt$i32$u8$pi8$i32$b$b$6(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$StdEnumAdapt$i32$u8$i32$5().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$mStdEnumAdapt$i32$u8$pi8(rValue, szName) {
  return new StdNamingAdapt$StdEnumAdapt$i32$u8().init(rValue, szName);
}

export function mkNamingAdapt$mC4StrValAdapt$StdParameterAdapt$StdCopyStrBuf$i32$pi8$StdCopyStrBuf$b$b(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$C4StrValAdapt$StdParameterAdapt$StdCopyStrBuf$i32$StdCopyStrBuf().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$mStdArrayAdapt$C4LSector$StdParameterAdaptMaker$pC4ValueNumbers$pi8(rValue, szName) {
  return new StdNamingAdapt$StdArrayAdapt$C4LSector$StdParameterAdaptMaker$pC4ValueNumbers().init(rValue, szName);
}

export function mkNamingAdapt$mStdArrayAdapt$pC4PlayerInfo$StdPtrAdapt$C4PlayerInfo$pi8(rValue, szName) {
  return new StdNamingAdapt$StdArrayAdapt$pC4PlayerInfo$StdPtrAdapt$C4PlayerInfo().init(rValue, szName);
}

export function mkNamingAdapt$mStdArrayAdapt$pC4ClientPlayerInfos$StdPtrAdapt$C4ClientPlayerInfos$pi8(rValue, szName) {
  return new StdNamingAdapt$StdArrayAdapt$pC4ClientPlayerInfos$StdPtrAdapt$C4ClientPlayerInfos().init(rValue, szName);
}

export function mkNamingAdapt$mStdArrayAdapt$pC4RoundResultsPlayer$StdPtrAdapt$C4RoundResultsPlayer$pi8(rValue, szName) {
  return new StdNamingAdapt$StdArrayAdapt$pC4RoundResultsPlayer$StdPtrAdapt$C4RoundResultsPlayer().init(rValue, szName);
}

export function mkNamingAdapt$mStdArrayAdapt$pC4Team$StdPtrAdapt$C4Team$pi8(rValue, szName) {
  return new StdNamingAdapt$StdArrayAdapt$pC4Team$StdPtrAdapt$C4Team().init(rValue, szName);
}

export function mkNamingAdapt$mStdArrayAdapt$pC4GameRes$StdPtrAdapt$C4GameRes$pi8(rValue, szName) {
  return new StdNamingAdapt$StdArrayAdapt$pC4GameRes$StdPtrAdapt$C4GameRes().init(rValue, szName);
}

export function mkNamingAdapt$mStdArrayAdapt$pScenario$StdPtrAdapt$Scenario$pi8(rValue, szName) {
  return new StdNamingAdapt$StdArrayAdapt$pScenario$StdPtrAdapt$Scenario().init(rValue, szName);
}

export function mkNamingAdapt$mStdArrayAdapt$pAccessGfx$StdPtrAdapt$AccessGfx$pi8(rValue, szName) {
  return new StdNamingAdapt$StdArrayAdapt$pAccessGfx$StdPtrAdapt$AccessGfx().init(rValue, szName);
}

export function mkNamingAdapt$mStdArrayAdapt$i32$_IdFuncClass$i32$pi8$x$b$b(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$StdArrayAdapt$i32$_IdFuncClass$i32$x().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$mStdArrayAdapt$i32$_IdFuncClass$i32$pi8$i32$b$b(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$StdArrayAdapt$i32$_IdFuncClass$i32$i32().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$mStdInsertAdapt$StdParameterAdapt$C4Object$pC4ValueNumbers$StdNamingAdapt$C4ValueNumbers$pi8(rValue, szName) {
  return new StdNamingAdapt$StdInsertAdapt$StdParameterAdapt$C4Object$pC4ValueNumbers$StdNamingAdapt$C4ValueNumbers().init(rValue, szName);
}

export function mkNamingAdapt$mStdStringAdapt$pi8$x$b$b(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
  return new StdNamingDefaultAdapt$StdStringAdapt$x().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$mStdStringAdapt$pi8$x$b$b$2(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
  return new StdNamingDefaultAdapt$StdStringAdapt$x$2().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$mStdStringAdapt$pi8$x$b$b$3(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$StdStringAdapt$x$3().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$mStdStringAdapt$pi8$x$b$b$4(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
  return new StdNamingDefaultAdapt$StdStringAdapt$x$4().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$mStdStringAdapt$pi8$x$b$b$5(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$StdStringAdapt$x$5().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$mStdStringAdapt$pi8$x$b$b$6(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
  return new StdNamingDefaultAdapt$StdStringAdapt$x$6().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$mStdStringAdapt$pi8$x$b$b$7(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
  return new StdNamingDefaultAdapt$StdStringAdapt$x$7().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$mStdStringAdapt$pi8$x$b$b$8(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$StdStringAdapt$x$8().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$mStdStringAdapt$pi8$x$b$b$9(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$StdStringAdapt$x$9().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$mStdStringAdapt$pi8$x$b$b$10(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$StdStringAdapt$x$10().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$mStdStringAdapt$pi8$x$b$b$11(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$StdStringAdapt$x$11().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$mStdStringAdapt$pi8$x$b$b$12(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$StdStringAdapt$x$12().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$mStdStringAdapt$pi8$x$b$b$13(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
  return new StdNamingDefaultAdapt$StdStringAdapt$x$13().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$mStdStringAdapt$pi8$pi8$b$b(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$StdStringAdapt$pi8().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$mStdIntPackAdapt$i32$pi8$i32$b$b(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$StdIntPackAdapt$i32$i32().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$mStdIntPackAdapt$i32$pi8$i32$b$b$2(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$StdIntPackAdapt$i32$i32$2().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$mStdBitfieldAdapt$u8$pi8$u32$b$b(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$StdBitfieldAdapt$u8$u32().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$mStdBitfieldAdapt$i32$pi8$i32$b$b(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$StdBitfieldAdapt$i32$i32().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$mStdBitfieldAdapt$i32$pi8$i32$b$b$2(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$StdBitfieldAdapt$i32$i32$2().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$mStdBitfieldAdapt$u32$pi8$u32$b$b(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$StdBitfieldAdapt$u32$u32().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$mStdBitfieldAdapt$u16$pi8$u32$b$b(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$StdBitfieldAdapt$u16$u32().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$mStdDecompileAdapt$C4RecordChunk$pi8(rValue, szName) {
  return new StdNamingAdapt$StdDecompileAdapt$C4RecordChunk().init(rValue, szName);
}

export function mkNamingAdapt$mStdParameterAdapt$StdPtrAdapt$C4Object$pC4ValueNumbers$pi8(rValue, szName) {
  return new StdNamingAdapt$StdParameterAdapt$StdPtrAdapt$C4Object$pC4ValueNumbers().init(rValue, szName);
}

export function mkNamingAdapt$mStdParameterAdapt$StdDecompileAdapt$StdCopyStrBuf$i32$pi8(rValue, szName) {
  return new StdNamingAdapt$StdParameterAdapt$StdDecompileAdapt$StdCopyStrBuf$i32().init(rValue, szName);
}

export function mkNamingAdapt$mStdParameterAdapt$C4PropList$pC4ValueNumbers$pi8(rValue, szName) {
  return new StdNamingAdapt$StdParameterAdapt$C4PropList$pC4ValueNumbers().init(rValue, szName);
}

export function mkNamingAdapt$mStdParameterAdapt$C4ObjectList$pC4ValueNumbers$pi8(rValue, szName) {
  return new StdNamingAdapt$StdParameterAdapt$C4ObjectList$pC4ValueNumbers().init(rValue, szName);
}

export function mkNamingAdapt$mStdParameterAdapt$StdCopyStrBuf$i32$pi8$x$b$b(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$x().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$mStdParameterAdapt$StdCopyStrBuf$i32$pi8$x$b$b$2(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$x$2().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$mStdParameterAdapt$StdCopyStrBuf$i32$pi8$x$b$b$3(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$x$3().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$mStdParameterAdapt$StdCopyStrBuf$i32$pi8(rValue, szName) {
  return new StdNamingAdapt$StdParameterAdapt$StdCopyStrBuf$i32().init(rValue, szName);
}

export function mkNamingAdapt$mStdParameterAdapt$StdCopyStrBuf$i32$pi8$StdCopyStrBuf$b$b(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$StdCopyStrBuf().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$mStdParameterAdapt$C4ValueMapData$pC4ValueNumbers$pi8$C4ValueMapData$b$b(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$StdParameterAdapt$C4ValueMapData$pC4ValueNumbers$C4ValueMapData$2().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$mStdParameterAdapt$C4ValueMapData$pC4ValueNumbers$pi8$C4ValueMapData$b$b$2(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$StdParameterAdapt$C4ValueMapData$pC4ValueNumbers$C4ValueMapData().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$mStdParameterAdapt$StdMeshInstance$x$pi8(rValue, szName) {
  return new StdNamingAdapt$StdParameterAdapt$StdMeshInstance$x().init(rValue, szName);
}

export function mkNamingAdapt$mStdParameterAdapt$C4GameParameters$pC4Scenario$pi8(rValue, szName) {
  return new StdNamingAdapt$StdParameterAdapt$C4GameParameters$pC4Scenario().init(rValue, szName);
}

export function mkNamingAdapt$mStdParameterAdapt$C4PropListNumbered$pC4ValueNumbers$pi8(rValue, szName) {
  return new StdNamingAdapt$StdParameterAdapt$C4PropListNumbered$pC4ValueNumbers().init(rValue, szName);
}

export function mkNamingAdapt$mStdParameterAdapt$C4NotifyingObjectList$pC4ValueNumbers$pi8(rValue, szName) {
  return new StdNamingAdapt$StdParameterAdapt$C4NotifyingObjectList$pC4ValueNumbers().init(rValue, szName);
}

export function mkNamingAdapt$mStdParameterAdapt$ValidatedStdCopyStrBuf$3$i32$pi8$x$b$b(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$StdParameterAdapt$ValidatedStdCopyStrBuf$3$i32$x().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$mStdParameterAdapt$C4SGame$b$pi8(rValue, szName) {
  return new StdNamingAdapt$StdParameterAdapt$C4SGame$b().init(rValue, szName);
}

export function mkNamingAdapt$mStdParameterAdapt$C4SHead$b$pi8(rValue, szName) {
  return new StdNamingAdapt$StdParameterAdapt$C4SHead$b().init(rValue, szName);
}

export function mkNamingAdapt$mStdParameterAdapt$C4Value$pC4ValueNumbers$pi8$C4Value$b$b(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$StdParameterAdapt$C4Value$pC4ValueNumbers$C4Value().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$mStdParameterAdapt$C4IDList$b$pi8$C4IDList$b$b(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$StdParameterAdapt$C4IDList$b$C4IDList().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$mStdParameterAdapt$C4Object$pC4ValueNumbers$pi8(rValue, szName) {
  return new StdNamingAdapt$StdParameterAdapt$C4Object$pC4ValueNumbers$2().init(rValue, szName);
}

export function mkNamingAdapt$mStdParameterAdapt$C4Object$pC4ValueNumbers$pi8$2(rValue, szName) {
  return new StdNamingAdapt$StdParameterAdapt$C4Object$pC4ValueNumbers().init(rValue, szName);
}

export function mkNamingAdapt$mStdParameterAdapt$C4Player$pC4ValueNumbers$pi8(rValue, szName) {
  return new StdNamingAdapt$StdParameterAdapt$C4Player$pC4ValueNumbers$2().init(rValue, szName);
}

export function mkNamingAdapt$mStdParameterAdapt$C4Player$pC4ValueNumbers$pi8$2(rValue, szName) {
  return new StdNamingAdapt$StdParameterAdapt$C4Player$pC4ValueNumbers().init(rValue, szName);
}

export function mkNamingAdapt$mStdParameterAdapt$C4Command$pC4ValueNumbers$pi8(rValue, szName) {
  return new StdNamingAdapt$StdParameterAdapt$C4Command$pC4ValueNumbers().init(rValue, szName);
}

export function mkNamingAdapt$mStdParameterAdapt$StdStrBuf$i32$pi8$StdCopyStrBuf$b$b(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$StdParameterAdapt$StdStrBuf$i32$StdCopyStrBuf().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$mStdParameterAdapt$StdStrBuf$i32$pi8$x$b$b(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$StdParameterAdapt$StdStrBuf$i32$x().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$mStdParameterAdapt$StdStrBuf$i32$pi8$StdStrBuf$b$b(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$StdParameterAdapt$StdStrBuf$i32$StdStrBuf().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$mStdParameterAdapt$AttachedMesh$x$pi8(rValue, szName) {
  return new StdNamingAdapt$StdParameterAdapt$AttachedMesh$x().init(rValue, szName);
}

export function mkNamingAdapt$mStdStdStringAdapt$pi8$x$b$b(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$StdStdStringAdapt$x().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$mStdStdStringAdapt$pi8$x$b$b$2(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$StdStdStringAdapt$x$2().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$mStdStdStringAdapt$pi8$x$b$b$3(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$StdStdStringAdapt$x$3().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$mC4DefGraphicsAdapt$pi8(rValue, szName) {
  return new StdNamingAdapt$C4DefGraphicsAdapt().init(rValue, szName);
}

export function mkNamingAdapt$mC4DefGraphicsAdapt$pi8$rpC4DefGraphics$b$b(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$C4DefGraphicsAdapt$pC4DefGraphics().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$mC4NetFilenameAdapt$pi8$x$b$b(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$C4NetFilenameAdapt$x().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$mStdParameter2Adapt$C4AulScriptEngine$b$pC4ValueNumbers$pi8(rValue, szName) {
  return new StdNamingAdapt$StdParameter2Adapt$C4AulScriptEngine$b$pC4ValueNumbers().init(rValue, szName);
}

export function mkNamingAdapt$mStdArrayDefaultAdapt$i32$i32$_IdFuncClass$i32$pi8(rValue, szName) {
  return new StdNamingAdapt$StdArrayDefaultAdapt$i32$i32$_IdFuncClass$i32().init(rValue, szName);
}

export function mkNamingAdapt$mStdRuntimeValueAdapt$b$pi8$b$b$b(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$StdRuntimeValueAdapt$b$b().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$mStdSTLContainerAdapt$list$C4RecordChunk$pi8(rValue, szName) {
  return new StdNamingAdapt$StdSTLContainerAdapt$list$C4RecordChunk().init(rValue, szName);
}

export function mkNamingAdapt$mStdSTLContainerAdapt$vector$C4KeyCodeEx$pi8$vector$b$b(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$StdSTLContainerAdapt$vector$C4KeyCodeEx$vector$C4KeyCodeEx().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$mStdSTLContainerAdapt$vector$C4MaterialReaction$pi8$vector$b$b(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$StdSTLContainerAdapt$vector$C4MaterialReaction$vector$C4MaterialReaction().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$mStdSTLContainerAdapt$vector$ControlDownState$pi8$vector$b$b(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$StdSTLContainerAdapt$vector$ControlDownState$vector$ControlDownState().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$mStdSTLContainerAdapt$vector$ControlItem$pi8$vector$b$b(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$StdSTLContainerAdapt$vector$ControlItem$vector$ControlItem().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$mStdSTLContainerAdapt$vector$Option$pi8(rValue, szName) {
  return new StdNamingAdapt$StdSTLContainerAdapt$vector$Option().init(rValue, szName);
}

export function mkNamingAdapt$mStdSTLContainerAdapt$vector$KeyComboItem$pi8$vector$b$b(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$StdSTLContainerAdapt$vector$KeyComboItem$vector$KeyComboItem().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$mStdSTLContainerAdapt$vector$i32$pi8$vector$b$b(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$StdSTLContainerAdapt$vector$i32$vector$i32().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$mC4ObjectListDumpHelper$pi8(rValue, szName) {
  return new StdNamingAdapt$C4ObjectListDumpHelper().init(rValue, szName);
}

export function mkNamingAdapt$mStdArrayDefaultArrayAdapt$i32$x$_IdFuncClass$i32$pi8$x$b$b(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$StdArrayDefaultArrayAdapt$i32$x$_IdFuncClass$i32$x().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$mStdArrayDefaultArrayAdapt$i32$x$lambda$pi8$x$b$b(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$StdArrayDefaultArrayAdapt$i32$x$lambda$x().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$mStdArrayDefaultArrayAdapt$i32$pi32$_IdFuncClass$i32$pi8$pi32$b$b(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$StdArrayDefaultArrayAdapt$i32$pi32$_IdFuncClass$i32$pi32().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$mC4GraphicsOverlayListAdapt$pi8$rpC4GraphicsOverlay$b$b(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$C4GraphicsOverlayListAdapt$pC4GraphicsOverlay().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$mMatrixAdapt$pi8(rValue, szName) {
  return new StdNamingAdapt$MatrixAdapt().init(rValue, szName);
}

export function mkNamingAdapt$mTransformAdapt$pi8(rValue, szName) {
  return new StdNamingAdapt$TransformAdapt().init(rValue, szName);
}

export function mkNamingAdapt$mValueProviderAdapt$pi8(rValue, szName) {
  return new StdNamingAdapt$ValueProviderAdapt().init(rValue, szName);
}

export function mkNamingAdapt$rC4IDPacket$pi8(rValue, szName) {
  return new StdNamingAdapt$C4IDPacket().init(rValue, szName);
}

export function mkNamingAdapt$rC4NameList$pi8$C4NameList$b$b(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$C4NameList$C4NameList().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$rC4SAnimals$pi8(rValue, szName) {
  return new StdNamingAdapt$C4SAnimals().init(rValue, szName);
}

export function mkNamingAdapt$rC4SWeather$pi8(rValue, szName) {
  return new StdNamingAdapt$C4SWeather().init(rValue, szName);
}

export function mkNamingAdapt$rC4TeamList$pi8(rValue, szName) {
  return new StdNamingAdapt$C4TeamList().init(rValue, szName);
}

export function mkNamingAdapt$rStdCopyBuf$pi8(rValue, szName) {
  return new StdNamingAdapt$StdCopyBuf().init(rValue, szName);
}

export function mkNamingAdapt$rC4ConfigIRC$pi8(rValue, szName) {
  return new StdNamingAdapt$C4ConfigIRC().init(rValue, szName);
}

export function mkNamingAdapt$rC4Landscape$pi8(rValue, szName) {
  return new StdNamingAdapt$C4Landscape().init(rValue, szName);
}

export function mkNamingAdapt$rC4ObjectPtr$pi8(rValue, szName) {
  return new StdNamingAdapt$C4ObjectPtr().init(rValue, szName);
}

export function mkNamingAdapt$rC4ObjectPtr$pi8$C4ObjectPtr$b$b(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$C4ObjectPtr$C4ObjectPtr().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$rC4SPlrStart$pi8(rValue, szName) {
  return new StdNamingAdapt$C4SPlrStart().init(rValue, szName);
}

export function mkNamingAdapt$rC4ClientCore$pi8(rValue, szName) {
  return new StdNamingAdapt$C4ClientCore().init(rValue, szName);
}

export function mkNamingAdapt$rC4FolderHead$pi8(rValue, szName) {
  return new StdNamingAdapt$C4FolderHead().init(rValue, szName);
}

export function mkNamingAdapt$rC4PacketBase$pi8(rValue, szName) {
  return new StdNamingAdapt$C4PacketBase().init(rValue, szName);
}

export function mkNamingAdapt$rC4SLandscape$pi8(rValue, szName) {
  return new StdNamingAdapt$C4SLandscape().init(rValue, szName);
}

export function mkNamingAdapt$rC4Scoreboard$pi8(rValue, szName) {
  return new StdNamingAdapt$C4Scoreboard().init(rValue, szName);
}

export function mkNamingAdapt$rC4TargetRect$pi8$C4TargetRect$b$b(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$C4TargetRect$C4TargetRect().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$rC4ConfigLobby$pi8(rValue, szName) {
  return new StdNamingAdapt$C4ConfigLobby().init(rValue, szName);
}

export function mkNamingAdapt$rC4ConfigSound$pi8(rValue, szName) {
  return new StdNamingAdapt$C4ConfigSound().init(rValue, szName);
}

export function mkNamingAdapt$rC4MusicSystem$pi8(rValue, szName) {
  return new StdNamingAdapt$C4MusicSystem().init(rValue, szName);
}

export function mkNamingAdapt$rC4RoundResult$pi8(rValue, szName) {
  return new StdNamingAdapt$C4RoundResult().init(rValue, szName);
}

export function mkNamingAdapt$rStdCopyStrBuf$pi8$StdStrBuf$b$b(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$StdCopyStrBuf$StdStrBuf().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$rStdCopyStrBuf$pi8$x$b$b(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$StdCopyStrBuf$x().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$rStdCopyStrBuf$pi8$x$b$b$2(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$StdCopyStrBuf$x$2().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$rStdCopyStrBuf$pi8(rValue, szName) {
  return new StdNamingAdapt$StdCopyStrBuf().init(rValue, szName);
}

export function mkNamingAdapt$rStdCopyStrBuf$pi8$StdCopyStrBuf$b$b(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$StdCopyStrBuf$StdCopyStrBuf().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$rC4KeyEventData$pi8$C4KeyEventData$b$b(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$C4KeyEventData$C4KeyEventData().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$rC4RoundResults$pi8(rValue, szName) {
  return new StdNamingAdapt$C4RoundResults().init(rValue, szName);
}

export function mkNamingAdapt$rC4SDefinitions$pi8(rValue, szName) {
  return new StdNamingAdapt$C4SDefinitions().init(rValue, szName);
}

export function mkNamingAdapt$rC4SEnvironment$pi8(rValue, szName) {
  return new StdNamingAdapt$C4SEnvironment().init(rValue, szName);
}

export function mkNamingAdapt$rC4ValueNumbers$pi8(rValue, szName) {
  return new StdNamingAdapt$C4ValueNumbers().init(rValue, szName);
}

export function mkNamingAdapt$rC4ConfigGamepad$pi8(rValue, szName) {
  return new StdNamingAdapt$C4ConfigGamepad().init(rValue, szName);
}

export function mkNamingAdapt$rC4ConfigGeneral$pi8(rValue, szName) {
  return new StdNamingAdapt$C4ConfigGeneral().init(rValue, szName);
}

export function mkNamingAdapt$rC4ConfigNetwork$pi8(rValue, szName) {
  return new StdNamingAdapt$C4ConfigNetwork().init(rValue, szName);
}

export function mkNamingAdapt$rC4ConfigStartup$pi8(rValue, szName) {
  return new StdNamingAdapt$C4ConfigStartup().init(rValue, szName);
}

export function mkNamingAdapt$rC4MapFolderData$pi8(rValue, szName) {
  return new StdNamingAdapt$C4MapFolderData().init(rValue, szName);
}

export function mkNamingAdapt$rC4ConfigControls$pi8(rValue, szName) {
  return new StdNamingAdapt$C4ConfigControls().init(rValue, szName);
}

export function mkNamingAdapt$rC4ConfigGraphics$pi8(rValue, szName) {
  return new StdNamingAdapt$C4ConfigGraphics().init(rValue, szName);
}

export function mkNamingAdapt$rC4ConfigSecurity$pi8(rValue, szName) {
  return new StdNamingAdapt$C4ConfigSecurity().init(rValue, szName);
}

export function mkNamingAdapt$rC4ObjectInfoCore$pi8(rValue, szName) {
  return new StdNamingAdapt$C4ObjectInfoCore().init(rValue, szName);
}

export function mkNamingAdapt$rC4PlayerInfoList$pi8(rValue, szName) {
  return new StdNamingAdapt$C4PlayerInfoList().init(rValue, szName);
}

export function mkNamingAdapt$rC4ConfigDeveloper$pi8(rValue, szName) {
  return new StdNamingAdapt$C4ConfigDeveloper().init(rValue, szName);
}

export function mkNamingAdapt$rC4Network2ResCore$pi8(rValue, szName) {
  return new StdNamingAdapt$C4Network2ResCore().init(rValue, szName);
}

export function mkNamingAdapt$rC4ParticleDefCore$pi8(rValue, szName) {
  return new StdNamingAdapt$C4ParticleDefCore().init(rValue, szName);
}

export function mkNamingAdapt$rStdSubMeshInstance$pi8(rValue, szName) {
  return new StdNamingAdapt$StdSubMeshInstance().init(rValue, szName);
}

export function mkNamingAdapt$rC4ClientPlayerInfos$pi8(rValue, szName) {
  return new StdNamingAdapt$C4ClientPlayerInfos().init(rValue, szName);
}

export function mkNamingAdapt$rC4Network2Reference$pi8(rValue, szName) {
  return new StdNamingAdapt$C4Network2Reference().init(rValue, szName);
}

export function mkNamingAdapt$rC4PlayerControlDefs$pi8$C4PlayerControlDefs$b$b(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$C4PlayerControlDefs$C4PlayerControlDefs().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$rC4ScenarioParameters$pi8(rValue, szName) {
  return new StdNamingAdapt$C4ScenarioParameters().init(rValue, szName);
}

export function mkNamingAdapt$rC4RoundResultsPlayers$pi8$C4RoundResultsPlayers$b$b(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$C4RoundResultsPlayers$C4RoundResultsPlayers().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$rValidatedStdCopyStrBuf$10$pi8$x$b$b(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
  return new StdNamingDefaultAdapt$ValidatedStdCopyStrBuf$10$x().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$rValidatedStdCopyStrBuf$3$pi8$x$b$b(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
  return new StdNamingDefaultAdapt$ValidatedStdCopyStrBuf$3$x().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$rValidatedStdCopyStrBuf$4$pi8$x$b$b(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$ValidatedStdCopyStrBuf$4$x().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$rC4PlayerControlAssignmentSets$pi8$C4PlayerControlAssignmentSets$b$b(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$C4PlayerControlAssignmentSets$C4PlayerControlAssignmentSets().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$rC4ID$pi8$C4ID$b$b(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$C4ID$C4ID().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$rC4Def$pi8(rValue, szName) {
  return new StdNamingAdapt$C4Def().init(rValue, szName);
}

export function mkNamingAdapt$rC4Sky$pi8(rValue, szName) {
  return new StdNamingAdapt$C4Sky().init(rValue, szName);
}

export function mkNamingAdapt$rC4Rect$pi8(rValue, szName) {
  return new StdNamingAdapt$C4Rect().init(rValue, szName);
}

export function mkNamingAdapt$rC4Rect$pi8$C4Rect$b$b(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$C4Rect$C4Rect().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$rC4SVal$pi8$C4SVal$b$b(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$C4SVal$C4SVal().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$rStdBuf$pi8(rValue, szName) {
  return new StdNamingAdapt$StdBuf().init(rValue, szName);
}

export function mkNamingAdapt$rC4Fixed$pi8$C4Fixed$b$b(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$C4Fixed$C4Fixed().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$rC4Fixed$pi8$i32$b$b(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$C4Fixed$i32().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$rC4Client$pi8(rValue, szName) {
  return new StdNamingAdapt$C4Client().init(rValue, szName);
}

export function mkNamingAdapt$rC4IDList$pi8(rValue, szName) {
  return new StdNamingAdapt$C4IDList().init(rValue, szName);
}

export function mkNamingAdapt$rC4IDList$pi8$C4IDList$b$b(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$C4IDList$C4IDList().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$rC4Control$pi8(rValue, szName) {
  return new StdNamingAdapt$C4Control().init(rValue, szName);
}

export function mkNamingAdapt$rC4FoWBeam$pi8(rValue, szName) {
  return new StdNamingAdapt$C4FoWBeam().init(rValue, szName);
}

export function mkNamingAdapt$rC4GameRes$pi8(rValue, szName) {
  return new StdNamingAdapt$C4GameRes().init(rValue, szName);
}

export function mkNamingAdapt$rC4Weather$pi8(rValue, szName) {
  return new StdNamingAdapt$C4Weather().init(rValue, szName);
}

export function mkNamingAdapt$rStdStrBuf$pi8$x$b$b(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
  return new StdNamingDefaultAdapt$StdStrBuf$x().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$rStdStrBuf$pi8$x$b$b$2(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$StdStrBuf$x$2().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$rStdStrBuf$pi8$x$b$b$3(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
  return new StdNamingDefaultAdapt$StdStrBuf$x$3().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$rStdStrBuf$pi8$x$b$b$4(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$StdStrBuf$x$4().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$rStdStrBuf$pi8(rValue, szName) {
  return new StdNamingAdapt$StdStrBuf().init(rValue, szName);
}

export function mkNamingAdapt$rStdStrBuf$pi8$StdStrBuf$b$b(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$StdStrBuf$StdStrBuf().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$rC4PlayerControl$CSync$pi8$C4PlayerControl$CSync$b$b(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$CSync$CSync().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$rC4Player$HostilitySet$pi8(rValue, szName) {
  return new StdNamingAdapt$HostilitySet().init(rValue, szName);
}

export function mkNamingAdapt$rb$pi8(rValue, szName) {
  return new StdNamingAdapt$b().init(rValue, szName);
}

export function mkNamingAdapt$rb$pi8$b$b$b(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$b$b().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$ru8$pi8$i32$b$b(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$u8$i32().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$ri32$pi8(rValue, szName) {
  return new StdNamingAdapt$i32().init(rValue, szName);
}

export function mkNamingAdapt$ri32$pi8$i32$b$b(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$i32$i32().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$ri32$pi8$i16$b$b(rValue, szName, rDefault, fPrefillDefault, fStoreDefault) {
  return new StdNamingDefaultAdapt$i32$i16().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkNamingAdapt$ru32$pi8(rValue, szName) {
  return new StdNamingAdapt$u32().init(rValue, szName);
}

export function mkNamingAdapt$ru32$pi8$u32$b$b(rValue, szName, rDefault, fPrefillDefault = false, fStoreDefault = false) {
  return new StdNamingDefaultAdapt$u32$u32().init(rValue, szName, rDefault, fPrefillDefault, fStoreDefault);
}

export function mkArrayAdaptDM(array, rDefault) {
  return new StdArrayDefaultAdapt$i32$i32$_IdFuncClass$i32().init(P(array, 0), 2, rDefault);
}

export function mkArrayAdaptDM$2(array, rDefault) {
  return new StdArrayDefaultAdapt$i32$i32$_IdFuncClass$i32().init(P(array, 0), 3, rDefault);
}

export function mkCastIntAdapt$ri32(rValue) {
  return new StdCastAdapt$i32$i32().init(rValue);
}

export function mkCastIntAdapt$rC4Fixed(rValue) {
  return new StdCastAdapt$C4Fixed$i32().init(rValue);
}

export function mkDefaultAdapt$mStdStringAdapt$x(rValue, rDefault) {
  return new StdDefaultAdapt$StdStringAdapt$x$14().init(rValue, rDefault);
}

export function mkDefaultAdapt$mStdBitfieldAdapt$i32$i32(rValue, rDefault) {
  return new StdDefaultAdapt$StdBitfieldAdapt$i32$i32$3().init(rValue, rDefault);
}

export function mkDefaultAdapt$mStdParameterAdapt$C4Value$pC4ValueNumbers$C4Value(rValue, rDefault) {
  return new StdDefaultAdapt$StdParameterAdapt$C4Value$pC4ValueNumbers$C4Value$2().init(rValue, rDefault);
}

export function mkDefaultAdapt$mStdParameterAdapt$StdStrBuf$i32$x(rValue, rDefault) {
  return new StdDefaultAdapt$StdParameterAdapt$StdStrBuf$i32$x$2().init(rValue, rDefault);
}

export function mkDefaultAdapt$mC4DefGraphicsAdapt$rpC4DefGraphics(rValue, rDefault) {
  return new StdDefaultAdapt$C4DefGraphicsAdapt$pC4DefGraphics$2().init(rValue, rDefault);
}

export function mkDefaultAdapt$rC4NameList$C4NameList(rValue, rDefault) {
  return new StdDefaultAdapt$C4NameList$C4NameList().init(rValue, rDefault);
}

export function mkDefaultAdapt$rC4ObjectPtr$C4ObjectPtr(rValue, rDefault) {
  return new StdDefaultAdapt$C4ObjectPtr$C4ObjectPtr().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdIntAdapt$i32$u8$i32(rValue, rDefault) {
  return new StdDefaultAdapt$StdIntAdapt$i32$u8$i32$6().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdIntAdapt$i32$u8$i32$2(rValue, rDefault) {
  return new StdDefaultAdapt$StdIntAdapt$i32$u8$i32$7().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdIntAdapt$i32$i32$i32(rValue, rDefault) {
  return new StdDefaultAdapt$StdIntAdapt$i32$i32$i32().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdIntAdapt$i32$u8$i32$3(rValue, rDefault) {
  return new StdDefaultAdapt$StdIntAdapt$i32$u8$i32$5().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdIntAdapt$i32$u8$i32$4(rValue, rDefault) {
  return new StdDefaultAdapt$StdIntAdapt$i32$u8$i32$4().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdIntAdapt$i32$u8$i32$5(rValue, rDefault) {
  return new StdDefaultAdapt$StdIntAdapt$i32$u8$i32$2().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdIntAdapt$i32$u8$i32$6(rValue, rDefault) {
  return new StdDefaultAdapt$StdIntAdapt$i32$u8$i32().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdIntAdapt$i32$u8$i32$7(rValue, rDefault) {
  return new StdDefaultAdapt$StdIntAdapt$i32$u8$i32$3().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdIntAdapt$i32$i32$i32$2(rValue, rDefault) {
  return new StdDefaultAdapt$StdIntAdapt$i32$i32$i32$2().init(rValue, rDefault);
}

export function mkDefaultAdapt$rC4TargetRect$C4TargetRect(rValue, rDefault) {
  return new StdDefaultAdapt$C4TargetRect$C4TargetRect().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdCastAdapt$i32$i32$i32(rValue, rDefault) {
  return new StdDefaultAdapt$StdCastAdapt$i32$i32$i32().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdCastAdapt$C4Fixed$i32$C4Fixed(rValue, rDefault) {
  return new StdDefaultAdapt$StdCastAdapt$C4Fixed$i32$C4Fixed().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdEnumAdapt$i32$u8$i32(rValue, rDefault) {
  return new StdDefaultAdapt$StdEnumAdapt$i32$u8$i32$2().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdEnumAdapt$i32$u8$i32$2(rValue, rDefault) {
  return new StdDefaultAdapt$StdEnumAdapt$i32$u8$i32().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdEnumAdapt$i32$u8$i32$3(rValue, rDefault) {
  return new StdDefaultAdapt$StdEnumAdapt$i32$u8$i32$6().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdEnumAdapt$i32$u8$i32$4(rValue, rDefault) {
  return new StdDefaultAdapt$StdEnumAdapt$i32$u8$i32$3().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdEnumAdapt$i32$i32$i32(rValue, rDefault) {
  return new StdDefaultAdapt$StdEnumAdapt$i32$i32$i32$3().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdEnumAdapt$i32$i32$i32$2(rValue, rDefault) {
  return new StdDefaultAdapt$StdEnumAdapt$i32$i32$i32$2().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdEnumAdapt$i32$u8$i32$5(rValue, rDefault) {
  return new StdDefaultAdapt$StdEnumAdapt$i32$u8$i32$4().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdEnumAdapt$i32$i32$i32$3(rValue, rDefault) {
  return new StdDefaultAdapt$StdEnumAdapt$i32$i32$i32().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdEnumAdapt$i32$u8$i32$6(rValue, rDefault) {
  return new StdDefaultAdapt$StdEnumAdapt$i32$u8$i32$5().init(rValue, rDefault);
}

export function mkDefaultAdapt$rC4StrValAdapt$StdParameterAdapt$StdCopyStrBuf$i32$StdCopyStrBuf(rValue, rDefault) {
  return new StdDefaultAdapt$C4StrValAdapt$StdParameterAdapt$StdCopyStrBuf$i32$StdCopyStrBuf().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdArrayAdapt$i32$_IdFuncClass$i32$x(rValue, rDefault) {
  return new StdDefaultAdapt$StdArrayAdapt$i32$_IdFuncClass$i32$x().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdArrayAdapt$i32$_IdFuncClass$i32$i32(rValue, rDefault) {
  return new StdDefaultAdapt$StdArrayAdapt$i32$_IdFuncClass$i32$i32().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdCopyStrBuf$StdStrBuf(rValue, rDefault) {
  return new StdDefaultAdapt$StdCopyStrBuf$StdStrBuf().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdCopyStrBuf$x(rValue, rDefault) {
  return new StdDefaultAdapt$StdCopyStrBuf$x().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdCopyStrBuf$x$2(rValue, rDefault) {
  return new StdDefaultAdapt$StdCopyStrBuf$x$2().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdCopyStrBuf$StdCopyStrBuf(rValue, rDefault) {
  return new StdDefaultAdapt$StdCopyStrBuf$StdCopyStrBuf().init(rValue, rDefault);
}

export function mkDefaultAdapt$rC4KeyEventData$C4KeyEventData(rValue, rDefault) {
  return new StdDefaultAdapt$C4KeyEventData$C4KeyEventData().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdStringAdapt$x(rValue, rDefault) {
  return new StdDefaultAdapt$StdStringAdapt$x().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdStringAdapt$x$2(rValue, rDefault) {
  return new StdDefaultAdapt$StdStringAdapt$x$2().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdStringAdapt$x$3(rValue, rDefault) {
  return new StdDefaultAdapt$StdStringAdapt$x$3().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdStringAdapt$x$4(rValue, rDefault) {
  return new StdDefaultAdapt$StdStringAdapt$x$4().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdStringAdapt$x$5(rValue, rDefault) {
  return new StdDefaultAdapt$StdStringAdapt$x$5().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdStringAdapt$x$6(rValue, rDefault) {
  return new StdDefaultAdapt$StdStringAdapt$x$6().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdStringAdapt$x$7(rValue, rDefault) {
  return new StdDefaultAdapt$StdStringAdapt$x$7().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdStringAdapt$x$8(rValue, rDefault) {
  return new StdDefaultAdapt$StdStringAdapt$x$8().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdStringAdapt$x$9(rValue, rDefault) {
  return new StdDefaultAdapt$StdStringAdapt$x$9().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdStringAdapt$x$10(rValue, rDefault) {
  return new StdDefaultAdapt$StdStringAdapt$x$10().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdStringAdapt$x$11(rValue, rDefault) {
  return new StdDefaultAdapt$StdStringAdapt$x$11().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdStringAdapt$x$12(rValue, rDefault) {
  return new StdDefaultAdapt$StdStringAdapt$x$12().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdStringAdapt$x$13(rValue, rDefault) {
  return new StdDefaultAdapt$StdStringAdapt$x$13().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdStringAdapt$pi8(rValue, rDefault) {
  return new StdDefaultAdapt$StdStringAdapt$pi8().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdIntPackAdapt$i32$i32(rValue, rDefault) {
  return new StdDefaultAdapt$StdIntPackAdapt$i32$i32().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdIntPackAdapt$i32$i32$2(rValue, rDefault) {
  return new StdDefaultAdapt$StdIntPackAdapt$i32$i32$2().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdBitfieldAdapt$u8$u32(rValue, rDefault) {
  return new StdDefaultAdapt$StdBitfieldAdapt$u8$u32().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdBitfieldAdapt$i32$i32(rValue, rDefault) {
  return new StdDefaultAdapt$StdBitfieldAdapt$i32$i32().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdBitfieldAdapt$i32$i32$2(rValue, rDefault) {
  return new StdDefaultAdapt$StdBitfieldAdapt$i32$i32$2().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdBitfieldAdapt$u32$u32(rValue, rDefault) {
  return new StdDefaultAdapt$StdBitfieldAdapt$u32$u32().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdBitfieldAdapt$u16$u32(rValue, rDefault) {
  return new StdDefaultAdapt$StdBitfieldAdapt$u16$u32().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdParameterAdapt$StdCopyStrBuf$i32$x(rValue, rDefault) {
  return new StdDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$x().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdParameterAdapt$StdCopyStrBuf$i32$x$2(rValue, rDefault) {
  return new StdDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$x$2().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdParameterAdapt$StdCopyStrBuf$i32$x$3(rValue, rDefault) {
  return new StdDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$x$3().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdParameterAdapt$StdCopyStrBuf$i32$StdCopyStrBuf(rValue, rDefault) {
  return new StdDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$StdCopyStrBuf().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdParameterAdapt$C4ValueMapData$pC4ValueNumbers$C4ValueMapData(rValue, rDefault) {
  return new StdDefaultAdapt$StdParameterAdapt$C4ValueMapData$pC4ValueNumbers$C4ValueMapData$2().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdParameterAdapt$C4ValueMapData$pC4ValueNumbers$C4ValueMapData$2(rValue, rDefault) {
  return new StdDefaultAdapt$StdParameterAdapt$C4ValueMapData$pC4ValueNumbers$C4ValueMapData().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdParameterAdapt$ValidatedStdCopyStrBuf$3$i32$x(rValue, rDefault) {
  return new StdDefaultAdapt$StdParameterAdapt$ValidatedStdCopyStrBuf$3$i32$x().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdParameterAdapt$C4Value$pC4ValueNumbers$C4Value(rValue, rDefault) {
  return new StdDefaultAdapt$StdParameterAdapt$C4Value$pC4ValueNumbers$C4Value().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdParameterAdapt$C4IDList$b$C4IDList(rValue, rDefault) {
  return new StdDefaultAdapt$StdParameterAdapt$C4IDList$b$C4IDList().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdParameterAdapt$StdStrBuf$i32$StdCopyStrBuf(rValue, rDefault) {
  return new StdDefaultAdapt$StdParameterAdapt$StdStrBuf$i32$StdCopyStrBuf().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdParameterAdapt$StdStrBuf$i32$x(rValue, rDefault) {
  return new StdDefaultAdapt$StdParameterAdapt$StdStrBuf$i32$x().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdParameterAdapt$StdStrBuf$i32$StdStrBuf(rValue, rDefault) {
  return new StdDefaultAdapt$StdParameterAdapt$StdStrBuf$i32$StdStrBuf().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdStdStringAdapt$x(rValue, rDefault) {
  return new StdDefaultAdapt$StdStdStringAdapt$x().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdStdStringAdapt$x$2(rValue, rDefault) {
  return new StdDefaultAdapt$StdStdStringAdapt$x$2().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdStdStringAdapt$x$3(rValue, rDefault) {
  return new StdDefaultAdapt$StdStdStringAdapt$x$3().init(rValue, rDefault);
}

export function mkDefaultAdapt$rC4DefGraphicsAdapt$rpC4DefGraphics(rValue, rDefault) {
  return new StdDefaultAdapt$C4DefGraphicsAdapt$pC4DefGraphics().init(rValue, rDefault);
}

export function mkDefaultAdapt$rC4NetFilenameAdapt$x(rValue, rDefault) {
  return new StdDefaultAdapt$C4NetFilenameAdapt$x().init(rValue, rDefault);
}

export function mkDefaultAdapt$rC4PlayerControlDefs$C4PlayerControlDefs(rValue, rDefault) {
  return new StdDefaultAdapt$C4PlayerControlDefs$C4PlayerControlDefs().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdRuntimeValueAdapt$b$b(rValue, rDefault) {
  return new StdDefaultAdapt$StdRuntimeValueAdapt$b$b().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdSTLContainerAdapt$vector$C4KeyCodeEx$vector(rValue, rDefault) {
  return new StdDefaultAdapt$StdSTLContainerAdapt$vector$C4KeyCodeEx$vector$C4KeyCodeEx().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdSTLContainerAdapt$vector$C4MaterialReaction$vector(rValue, rDefault) {
  return new StdDefaultAdapt$StdSTLContainerAdapt$vector$C4MaterialReaction$vector$C4MaterialReaction().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdSTLContainerAdapt$vector$ControlDownState$vector(rValue, rDefault) {
  return new StdDefaultAdapt$StdSTLContainerAdapt$vector$ControlDownState$vector$ControlDownState().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdSTLContainerAdapt$vector$ControlItem$vector(rValue, rDefault) {
  return new StdDefaultAdapt$StdSTLContainerAdapt$vector$ControlItem$vector$ControlItem().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdSTLContainerAdapt$vector$KeyComboItem$vector(rValue, rDefault) {
  return new StdDefaultAdapt$StdSTLContainerAdapt$vector$KeyComboItem$vector$KeyComboItem().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdSTLContainerAdapt$vector$i32$vector(rValue, rDefault) {
  return new StdDefaultAdapt$StdSTLContainerAdapt$vector$i32$vector$i32().init(rValue, rDefault);
}

export function mkDefaultAdapt$rC4RoundResultsPlayers$C4RoundResultsPlayers(rValue, rDefault) {
  return new StdDefaultAdapt$C4RoundResultsPlayers$C4RoundResultsPlayers().init(rValue, rDefault);
}

export function mkDefaultAdapt$rValidatedStdCopyStrBuf$10$x(rValue, rDefault) {
  return new StdDefaultAdapt$ValidatedStdCopyStrBuf$10$x().init(rValue, rDefault);
}

export function mkDefaultAdapt$rValidatedStdCopyStrBuf$3$x(rValue, rDefault) {
  return new StdDefaultAdapt$ValidatedStdCopyStrBuf$3$x().init(rValue, rDefault);
}

export function mkDefaultAdapt$rValidatedStdCopyStrBuf$4$x(rValue, rDefault) {
  return new StdDefaultAdapt$ValidatedStdCopyStrBuf$4$x().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdArrayDefaultArrayAdapt$i32$x$_IdFuncClass$i32$x(rValue, rDefault) {
  return new StdDefaultAdapt$StdArrayDefaultArrayAdapt$i32$x$_IdFuncClass$i32$x().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdArrayDefaultArrayAdapt$i32$x$lambda$x(rValue, rDefault) {
  return new StdDefaultAdapt$StdArrayDefaultArrayAdapt$i32$x$lambda$x().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdArrayDefaultArrayAdapt$i32$pi32$_IdFuncClass$i32$pi32(rValue, rDefault) {
  return new StdDefaultAdapt$StdArrayDefaultArrayAdapt$i32$pi32$_IdFuncClass$i32$pi32().init(rValue, rDefault);
}

export function mkDefaultAdapt$rC4GraphicsOverlayListAdapt$rpC4GraphicsOverlay(rValue, rDefault) {
  return new StdDefaultAdapt$C4GraphicsOverlayListAdapt$pC4GraphicsOverlay().init(rValue, rDefault);
}

export function mkDefaultAdapt$rC4PlayerControlAssignmentSets$C4PlayerControlAssignmentSets(rValue, rDefault) {
  return new StdDefaultAdapt$C4PlayerControlAssignmentSets$C4PlayerControlAssignmentSets().init(rValue, rDefault);
}

export function mkDefaultAdapt$rC4ID$C4ID(rValue, rDefault) {
  return new StdDefaultAdapt$C4ID$C4ID().init(rValue, rDefault);
}

export function mkDefaultAdapt$rC4Rect$C4Rect(rValue, rDefault) {
  return new StdDefaultAdapt$C4Rect$C4Rect().init(rValue, rDefault);
}

export function mkDefaultAdapt$rC4SVal$C4SVal(rValue, rDefault) {
  return new StdDefaultAdapt$C4SVal$C4SVal().init(rValue, rDefault);
}

export function mkDefaultAdapt$rC4Fixed$C4Fixed(rValue, rDefault) {
  return new StdDefaultAdapt$C4Fixed$C4Fixed().init(rValue, rDefault);
}

export function mkDefaultAdapt$rC4Fixed$i32(rValue, rDefault) {
  return new StdDefaultAdapt$C4Fixed$i32().init(rValue, rDefault);
}

export function mkDefaultAdapt$rC4IDList$C4IDList(rValue, rDefault) {
  return new StdDefaultAdapt$C4IDList$C4IDList().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdStrBuf$x(rValue, rDefault) {
  return new StdDefaultAdapt$StdStrBuf$x().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdStrBuf$x$2(rValue, rDefault) {
  return new StdDefaultAdapt$StdStrBuf$x$2().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdStrBuf$x$3(rValue, rDefault) {
  return new StdDefaultAdapt$StdStrBuf$x$3().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdStrBuf$x$4(rValue, rDefault) {
  return new StdDefaultAdapt$StdStrBuf$x$4().init(rValue, rDefault);
}

export function mkDefaultAdapt$rStdStrBuf$StdStrBuf(rValue, rDefault) {
  return new StdDefaultAdapt$StdStrBuf$StdStrBuf().init(rValue, rDefault);
}

export function mkDefaultAdapt$rC4PlayerControl$CSync$C4PlayerControl$CSync(rValue, rDefault) {
  return new StdDefaultAdapt$CSync$CSync().init(rValue, rDefault);
}

export function mkDefaultAdapt$rb$b(rValue, rDefault) {
  return new StdDefaultAdapt$b$b().init(rValue, rDefault);
}

export function mkDefaultAdapt$ru8$i32(rValue, rDefault) {
  return new StdDefaultAdapt$u8$i32().init(rValue, rDefault);
}

export function mkDefaultAdapt$ri32$i32(rValue, rDefault) {
  return new StdDefaultAdapt$i32$i32().init(rValue, rDefault);
}

export function mkDefaultAdapt$ri32$i16(rValue, rDefault) {
  return new StdDefaultAdapt$i32$i16().init(rValue, rDefault);
}

export function mkDefaultAdapt$ru32$u32(rValue, rDefault) {
  return new StdDefaultAdapt$u32$u32().init(rValue, rDefault);
}

export function mkIntPackAdapt$ri32(rVal) {
  return new StdIntPackAdapt$i32().init(rVal);
}

export function mkIntPackAdapt$ru32(rVal) {
  return new StdIntPackAdapt$u32().init(rVal);
}

export function mkStringAdaptM(szString) {
  return mkStringAdapt$pi8$i32$i32(P(szString, 0), 1025);
}

export function mkArrayAdaptDMA(array, rDefault) {
  return new StdArrayDefaultArrayAdapt$i32$x$_IdFuncClass$i32().init(P(array, 0), 30, rDefault);
}

export function mkArrayAdaptMap$pC4Value$u64$C4Value$StdParameterAdaptMaker$pC4ValueNumbers(pArray, iSize, rDefault, map) {
  return new StdArrayDefaultAdapt$C4Value$C4Value$StdParameterAdaptMaker$pC4ValueNumbers().init(pArray, iSize, rDefault, map);
}

export function mkArrayAdaptMap$pC4LSector$i32$mStdParameterAdaptMaker$pC4ValueNumbers(pArray, iSize, map) {
  return new StdArrayAdapt$C4LSector$StdParameterAdaptMaker$pC4ValueNumbers().init(pArray, iSize, map);
}

export function mkArrayAdaptMap$ppC4PlayerInfo$i32$x(pArray, iSize, map) {
  return new StdArrayAdapt$pC4PlayerInfo$StdPtrAdapt$C4PlayerInfo().init(pArray, iSize, map);
}

export function mkArrayAdaptMap$ppC4ClientPlayerInfos$i32$x(pArray, iSize, map) {
  return new StdArrayAdapt$pC4ClientPlayerInfos$StdPtrAdapt$C4ClientPlayerInfos().init(pArray, iSize, map);
}

export function mkArrayAdaptMap$ppC4RoundResultsPlayer$i32$x(pArray, iSize, map) {
  return new StdArrayAdapt$pC4RoundResultsPlayer$StdPtrAdapt$C4RoundResultsPlayer().init(pArray, iSize, map);
}

export function mkArrayAdaptMap$ppC4Team$i32$x(pArray, iSize, map) {
  return new StdArrayAdapt$pC4Team$StdPtrAdapt$C4Team().init(pArray, iSize, map);
}

export function mkArrayAdaptMap$ppC4GameRes$i32$x(pArray, iSize, map) {
  return new StdArrayAdapt$pC4GameRes$StdPtrAdapt$C4GameRes().init(pArray, iSize, map);
}

export function mkArrayAdaptMap$ppScenario$i32$x(pArray, iSize, map) {
  return new StdArrayAdapt$pScenario$StdPtrAdapt$Scenario().init(pArray, iSize, map);
}

export function mkArrayAdaptMap$ppAccessGfx$i32$x(pArray, iSize, map) {
  return new StdArrayAdapt$pAccessGfx$StdPtrAdapt$AccessGfx().init(pArray, iSize, map);
}

export function mkBitfieldAdapt$ru8$pStdBitfieldEntry(rVal, pNames) {
  return new StdBitfieldAdapt$u8().init(rVal, pNames);
}

export function mkBitfieldAdapt$ri32$pStdBitfieldEntry(rVal, pNames) {
  return new StdBitfieldAdapt$i32().init(rVal, pNames);
}

export function mkBitfieldAdapt$ru32$pStdBitfieldEntry(rVal, pNames) {
  return new StdBitfieldAdapt$u32().init(rVal, pNames);
}

export function mkBitfieldAdapt$ru16$pStdBitfieldEntry(rVal, pNames) {
  return new StdBitfieldAdapt$u16().init(rVal, pNames);
}

export function mkParAdaptMaker$mpC4ValueNumbers(rPar) {
  return new StdParameterAdaptMaker$pC4ValueNumbers$2().init(rPar);
}

export function mkParAdaptMaker$rpC4ValueNumbers(rPar) {
  return new StdParameterAdaptMaker$pC4ValueNumbers().init($tmp(rPar.a[rPar.o]));
}

export function mkStringAdaptMA(szString) {
  return mkStringAdapt$pi8$i32$i32(P(szString, 0), 16, 1 /*RCT_All*/);
}

export function mkStringAdaptMA$2(szString) {
  return mkStringAdapt$pi8$i32$i32(P(szString, 0), 257, 1 /*RCT_All*/);
}

export function mkStringAdaptMA$3(szString) {
  return mkStringAdapt$pi8$i32$i32(P(szString, 0), 31, 1 /*RCT_All*/);
}

export function mkStringAdaptMA$4(szString) {
  return mkStringAdapt$pi8$i32$i32(P(szString, 0), 32, 1 /*RCT_All*/);
}

export function mkStringAdaptMA$5(szString) {
  return mkStringAdapt$pi8$i32$i32(P(szString, 0), 4097, 1 /*RCT_All*/);
}

export function mkStringAdaptMA$6(szString) {
  return mkStringAdapt$pi8$i32$i32(P(szString, 0), 513, 1 /*RCT_All*/);
}

export function mkStringAdaptMA$7(szString) {
  return mkStringAdapt$pi8$i32$i32(P(szString, 0), 76, 1 /*RCT_All*/);
}

export function mkArrayAdaptDMAM(array, rDefault, map) {
  return new StdArrayDefaultArrayAdapt$i32$x$lambda().init(P(array, 0), 30, rDefault, map);
}

export function mkDecompileAdapt$C4IDPacket(rValue) {
  return new StdDecompileAdapt$C4IDPacket().init(rValue);
}

export function mkDecompileAdapt$C4PropList(rValue) {
  return new StdDecompileAdapt$C4PropList().init(rValue);
}

export function mkDecompileAdapt$C4PacketBase(rValue) {
  return new StdDecompileAdapt$C4PacketBase().init(rValue);
}

export function mkDecompileAdapt$C4PlayerInfo(rValue) {
  return new StdDecompileAdapt$C4PlayerInfo().init(rValue);
}

export function mkDecompileAdapt$C4ValueArray(rValue) {
  return new StdDecompileAdapt$C4ValueArray().init(rValue);
}

export function mkDecompileAdapt$C4PktDebugRec(rValue) {
  return new StdDecompileAdapt$C4PktDebugRec().init(rValue);
}

export function mkDecompileAdapt$C4RecordChunk(rValue) {
  return new StdDecompileAdapt$C4RecordChunk().init(rValue);
}

export function mkDecompileAdapt$StdCopyStrBuf(rValue) {
  return new StdDecompileAdapt$StdCopyStrBuf().init(rValue);
}

export function mkDecompileAdapt$C4DrawTransform(rValue) {
  return new StdDecompileAdapt$C4DrawTransform().init(rValue);
}

export function mkDecompileAdapt$StdMeshInstance(rValue) {
  return new StdDecompileAdapt$StdMeshInstance().init(rValue);
}

export function mkDecompileAdapt$C4Network2ResCore(rValue) {
  return new StdDecompileAdapt$C4Network2ResCore().init(rValue);
}

export function mkDecompileAdapt$C4ClientPlayerInfos(rValue) {
  return new StdDecompileAdapt$C4ClientPlayerInfos().init(rValue);
}

export function mkDecompileAdapt$C4MessageBoardQuery(rValue) {
  return new StdDecompileAdapt$C4MessageBoardQuery().init(rValue);
}

export function mkDecompileAdapt$C4RoundResultsPlayer(rValue) {
  return new StdDecompileAdapt$C4RoundResultsPlayer().init(rValue);
}

export function mkDecompileAdapt$StdMeshInstanceAnimationNode(rValue) {
  return new StdDecompileAdapt$StdMeshInstanceAnimationNode().init(rValue);
}

export function mkDecompileAdapt$C4Team(rValue) {
  return new StdDecompileAdapt$C4Team().init(rValue);
}

export function mkDecompileAdapt$StdBuf(rValue) {
  return new StdDecompileAdapt$StdBuf().init(rValue);
}

export function mkDecompileAdapt$C4Effect(rValue) {
  return new StdDecompileAdapt$C4Effect().init(rValue);
}

export function mkDecompileAdapt$C4Object(rValue) {
  return new StdDecompileAdapt$C4Object().init(rValue);
}

export function mkDecompileAdapt$C4Command(rValue) {
  return new StdDecompileAdapt$C4Command().init(rValue);
}

export function mkDecompileAdapt$C4Control(rValue) {
  return new StdDecompileAdapt$C4Control().init(rValue);
}

export function mkDecompileAdapt$C4GameRes(rValue) {
  return new StdDecompileAdapt$C4GameRes().init(rValue);
}

export function mkDecompileAdapt$StdStrBuf(rValue) {
  return new StdDecompileAdapt$StdStrBuf().init(rValue);
}

export function mkDecompileAdapt$C4MapFolderData$Scenario(rValue) {
  return new StdDecompileAdapt$Scenario().init(rValue);
}

export function mkDecompileAdapt$C4MapFolderData$AccessGfx(rValue) {
  return new StdDecompileAdapt$AccessGfx().init(rValue);
}

export function mkDecompileAdapt$StdMeshInstance$SerializableValueProvider(rValue) {
  return new StdDecompileAdapt$SerializableValueProvider().init(rValue);
}

export function mkNamingPtrAdapt$rpC4DrawTransform$pi8(rpObj, szNaming) {
  return new StdPtrAdapt$C4DrawTransform().init(rpObj, true, szNaming);
}

export function mkNamingPtrAdapt$rpC4MessageBoardQuery$pi8(rpObj, szNaming) {
  return new StdPtrAdapt$C4MessageBoardQuery().init(rpObj, true, szNaming);
}

export function mkNamingPtrAdapt$rpStdMeshInstanceAnimationNode$pi8(rpObj, szNaming) {
  return new StdPtrAdapt$StdMeshInstanceAnimationNode().init(rpObj, true, szNaming);
}

export function mkNamingPtrAdapt$rpC4Effect$pi8(rpObj, szNaming) {
  return new StdPtrAdapt$C4Effect().init(rpObj, true, szNaming);
}

export function mkNamingPtrAdapt$rpC4Command$pi8(rpObj, szNaming) {
  return new StdPtrAdapt$C4Command().init(rpObj, true, szNaming);
}

export function mkPtrAdaptNoNull$rpC4IDPacket(rpObj) {
  return mkPtrAdapt$rpC4IDPacket$b(rpObj, false);
}

export function mkPtrAdaptNoNull$rpC4PropList(rpObj) {
  return mkPtrAdapt$rpC4PropList$b(rpObj, false);
}

export function mkPtrAdaptNoNull$rpC4PlayerInfo(rpObj) {
  return mkPtrAdapt$rpC4PlayerInfo$b(rpObj, false);
}

export function mkPtrAdaptNoNull$rpC4ValueArray(rpObj) {
  return mkPtrAdapt$rpC4ValueArray$b(rpObj, false);
}

export function mkPtrAdaptNoNull$rpC4PktDebugRec(rpObj) {
  return mkPtrAdapt$rpC4PktDebugRec$b(rpObj, false);
}

export function mkPtrAdaptNoNull$rpC4Network2ResCore(rpObj) {
  return mkPtrAdapt$rpC4Network2ResCore$b(rpObj, false);
}

export function mkPtrAdaptNoNull$rpC4ClientPlayerInfos(rpObj) {
  return mkPtrAdapt$rpC4ClientPlayerInfos$b(rpObj, false);
}

export function mkPtrAdaptNoNull$rpC4RoundResultsPlayer(rpObj) {
  return mkPtrAdapt$rpC4RoundResultsPlayer$b(rpObj, false);
}

export function mkPtrAdaptNoNull$rpC4Team(rpObj) {
  return mkPtrAdapt$rpC4Team$b(rpObj, false);
}

export function mkPtrAdaptNoNull$rpStdBuf(rpObj) {
  return mkPtrAdapt$rpStdBuf$b(rpObj, false);
}

export function mkPtrAdaptNoNull$rpC4Effect(rpObj) {
  return mkPtrAdapt$rpC4Effect$b(rpObj, false);
}

export function mkPtrAdaptNoNull$rpC4Object(rpObj) {
  return mkPtrAdapt$rpC4Object$b(rpObj, false);
}

export function mkPtrAdaptNoNull$rpC4Control(rpObj) {
  return mkPtrAdapt$rpC4Control$b(rpObj, false);
}

export function mkPtrAdaptNoNull$rpC4GameRes(rpObj) {
  return mkPtrAdapt$rpC4GameRes$b(rpObj, false);
}

export function mkPtrAdaptNoNull$rpScenario(rpObj) {
  return mkPtrAdapt$rpScenario$b(rpObj, false);
}

export function mkPtrAdaptNoNull$rpAccessGfx(rpObj) {
  return mkPtrAdapt$rpAccessGfx$b(rpObj, false);
}

export function mkStringAdaptMIE(szString) {
  return mkStringAdapt$pi8$i32$i32(P(szString, 0), 31, 3 /*RCT_IdtfAllowEmpty*/);
}

export function mkContextPtrAdapt(rpObj, ctx, fAllowNull) {
  return new StdContextPtrAdapt$SerializableValueProvider$IDBase().init(rpObj, ctx, fAllowNull);
}

export function mkArrayAdaptDefArr(pArray, iSize, rDefault) {
  return new StdArrayDefaultArrayAdapt$i32$pi32$_IdFuncClass$i32().init(pArray, iSize, rDefault);
}

export function mkNamingCountAdapt$ri32$pi8(iCount, szName) {
  return new StdNamingCountAdapt$i32().init(iCount, szName);
}

export function mkNamingCountAdapt$ru32$pi8(iCount, szName) {
  return new StdNamingCountAdapt$u32().init(iCount, szName);
}

export function mkRuntimeValueAdapt(rValue) {
  return new StdRuntimeValueAdapt$b().init(rValue);
}

export function mkSTLContainerAdapt$rlist$i32(rTarget, eSep = 1 /*SEP_SEP*/) {
  return new StdSTLContainerAdapt$list$C4RecordChunk().init(rTarget, eSep);
}

export function mkSTLContainerAdapt$rlist$i32$2(rTarget, eSep) {
  return new StdSTLContainerAdapt$list$C4PlayerControlAssignmentSet().init(rTarget, eSep);
}

export function mkSTLContainerAdapt$rlist$i32$3(rTarget, eSep) {
  return new StdSTLContainerAdapt$list$i32().init(rTarget, eSep);
}

export function mkSTLContainerAdapt$rvector$i32(rTarget, eSep = 1 /*SEP_SEP*/) {
  return new StdSTLContainerAdapt$vector$C4KeyCodeEx().init(rTarget, eSep);
}

export function mkSTLContainerAdapt$rvector$i32$2(rTarget, eSep = 1 /*SEP_SEP*/) {
  return new StdSTLContainerAdapt$vector$C4MaterialReaction().init(rTarget, eSep);
}

export function mkSTLContainerAdapt$rvector$i32$3(rTarget, eSep) {
  return new StdSTLContainerAdapt$vector$C4PlayerControlDef().init(rTarget, eSep);
}

export function mkSTLContainerAdapt$rvector$i32$4(rTarget, eSep) {
  return new StdSTLContainerAdapt$vector$C4ScenarioParameterDef().init(rTarget, eSep);
}

export function mkSTLContainerAdapt$rvector$i32$5(rTarget, eSep) {
  return new StdSTLContainerAdapt$vector$C4PlayerControlAssignment().init(rTarget, eSep);
}

export function mkSTLContainerAdapt$rvector$i32$6(rTarget, eSep = 1 /*SEP_SEP*/) {
  return new StdSTLContainerAdapt$vector$ControlDownState().init(rTarget, eSep);
}

export function mkSTLContainerAdapt$rvector$i32$7(rTarget, eSep = 1 /*SEP_SEP*/) {
  return new StdSTLContainerAdapt$vector$ControlItem().init(rTarget, eSep);
}

export function mkSTLContainerAdapt$rvector$i32$8(rTarget, eSep) {
  return new StdSTLContainerAdapt$vector$Option().init(rTarget, eSep);
}

export function mkSTLContainerAdapt$rvector$i32$9(rTarget, eSep = 1 /*SEP_SEP*/) {
  return new StdSTLContainerAdapt$vector$KeyComboItem().init(rTarget, eSep);
}

export function mkSTLContainerAdapt$rvector$i32$10(rTarget, eSep = 1 /*SEP_SEP*/) {
  return new StdSTLContainerAdapt$vector$i32().init(rTarget, eSep);
}

export function mkNamingContextPtrAdapt(rpObj, ctx, szNaming) {
  return new StdContextPtrAdapt$StdMeshInstance$StdMesh().init(rpObj, ctx, true, szNaming);
}

export function StdPtrAdaptCompileNewFunc$StdPtrAdapt$C4IDPacket$pStdCompiler(adapt, pComp) {
  $.CompileNewFunc$rpC4IDPacket$pStdCompiler(adapt.rpObj, pComp);
}

export function StdPtrAdaptCompileNewFunc$StdPtrAdapt$C4PropList$pStdCompiler$mpC4ValueNumbers(adapt, pComp, pars) {
  $.CompileNewFunc$rpC4PropList$pStdCompiler$pC4ValueNumbers(adapt.rpObj, pComp, pars);
}

export function StdPtrAdaptCompileNewFunc$StdPtrAdapt$C4PlayerInfo$pStdCompiler(adapt, pComp) {
  $.CompileNewFunc$rpC4PlayerInfo$pStdCompiler(adapt.rpObj, pComp);
}

export function StdPtrAdaptCompileNewFunc$StdPtrAdapt$C4ValueArray$pStdCompiler$mpC4ValueNumbers(adapt, pComp, pars) {
  $.CompileNewFunc$rpC4ValueArray$pStdCompiler$mpC4ValueNumbers(adapt.rpObj, pComp, pars);
}

export function StdPtrAdaptCompileNewFunc$StdPtrAdapt$C4PktDebugRec$pStdCompiler(adapt, pComp) {
  $.CompileNewFunc$rpC4PktDebugRec$pStdCompiler(adapt.rpObj, pComp);
}

export function StdPtrAdaptCompileNewFunc$StdPtrAdapt$C4DrawTransform$pStdCompiler(adapt, pComp) {
  $.CompileNewFunc$rpC4DrawTransform$pStdCompiler(adapt.rpObj, pComp);
}

export function StdPtrAdaptCompileNewFunc$StdContextPtrAdapt$StdMeshInstance$StdMesh$pStdCompiler$x(adapt, pComp, pars) {
  $.CompileNewFuncCtx$rpStdMeshInstance$pStdCompiler$StdMesh$x(adapt.rpObj, pComp, adapt.pCtx, pars);
}

export function StdPtrAdaptCompileNewFunc$StdPtrAdapt$C4Network2ResCore$pStdCompiler(adapt, pComp) {
  $.CompileNewFunc$rpC4Network2ResCore$pStdCompiler(adapt.rpObj, pComp);
}

export function StdPtrAdaptCompileNewFunc$StdPtrAdapt$C4ClientPlayerInfos$pStdCompiler(adapt, pComp) {
  $.CompileNewFunc$rpC4ClientPlayerInfos$pStdCompiler(adapt.rpObj, pComp);
}

export function StdPtrAdaptCompileNewFunc$StdPtrAdapt$C4MessageBoardQuery$pStdCompiler(adapt, pComp) {
  $.CompileNewFunc$rpC4MessageBoardQuery$pStdCompiler(adapt.rpObj, pComp);
}

export function StdPtrAdaptCompileNewFunc$StdPtrAdapt$C4RoundResultsPlayer$pStdCompiler(adapt, pComp) {
  $.CompileNewFunc$rpC4RoundResultsPlayer$pStdCompiler(adapt.rpObj, pComp);
}

export function StdPtrAdaptCompileNewFunc$StdPtrAdapt$StdMeshInstanceAnimationNode$pStdCompiler$pStdMesh(adapt, pComp, pars) {
  $.CompileNewFunc$rpStdMeshInstanceAnimationNode$pStdCompiler$pStdMesh(adapt.rpObj, pComp, pars);
}

export function StdPtrAdaptCompileNewFunc$StdPtrAdapt$C4Team$pStdCompiler(adapt, pComp) {
  $.CompileNewFunc$rpC4Team$pStdCompiler(adapt.rpObj, pComp);
}

export function StdPtrAdaptCompileNewFunc$StdPtrAdapt$StdBuf$pStdCompiler(adapt, pComp) {
  $.CompileNewFunc$rpStdBuf$pStdCompiler(adapt.rpObj, pComp);
}

export function StdPtrAdaptCompileNewFunc$StdPtrAdapt$C4Effect$pStdCompiler$mpC4PropList$rpC4ValueNumbers(adapt, pComp, pars, pars$2) {
  $.CompileNewFunc$rpC4Effect$pStdCompiler$mpC4PropList$rpC4ValueNumbers(adapt.rpObj, pComp, pars, $tmp(pars$2.a[pars$2.o]));
}

export function StdPtrAdaptCompileNewFunc$StdPtrAdapt$C4Effect$pStdCompiler$mpC4AulScriptEngine$rpC4ValueNumbers(adapt, pComp, pars, pars$2) {
  $.CompileNewFunc$rpC4Effect$pStdCompiler$mpC4AulScriptEngine$rpC4ValueNumbers(adapt.rpObj, pComp, pars, $tmp(pars$2.a[pars$2.o]));
}

export function StdPtrAdaptCompileNewFunc$StdPtrAdapt$C4Effect$pStdCompiler$mpC4Object$rpC4ValueNumbers(adapt, pComp, pars, pars$2) {
  $.CompileNewFunc$rpC4Effect$pStdCompiler$mpC4Object$rpC4ValueNumbers(adapt.rpObj, pComp, pars, $tmp(pars$2.a[pars$2.o]));
}

export function StdPtrAdaptCompileNewFunc$StdPtrAdapt$C4Effect$pStdCompiler$rpC4PropList$rpC4ValueNumbers(adapt, pComp, pars, pars$2) {
  $.CompileNewFunc$rpC4Effect$pStdCompiler$rpC4PropList$rpC4ValueNumbers(adapt.rpObj, pComp, $tmp(pars.a[pars.o]), $tmp(pars$2.a[pars$2.o]));
}

export function StdPtrAdaptCompileNewFunc$StdPtrAdapt$C4Object$pStdCompiler$rpC4ValueNumbers(adapt, pComp, pars) {
  $.CompileNewFunc$rpC4Object$pStdCompiler$rpC4ValueNumbers(adapt.rpObj, pComp, $tmp(pars.a[pars.o]));
}

export function StdPtrAdaptCompileNewFunc$StdPtrAdapt$C4Command$pStdCompiler$rpC4ValueNumbers(adapt, pComp, pars) {
  $.CompileNewFunc$rpC4Command$pStdCompiler$rpC4ValueNumbers(adapt.rpObj, pComp, $tmp(pars.a[pars.o]));
}

export function StdPtrAdaptCompileNewFunc$StdPtrAdapt$C4Control$pStdCompiler(adapt, pComp) {
  $.CompileNewFunc$rpC4Control$pStdCompiler(adapt.rpObj, pComp);
}

export function StdPtrAdaptCompileNewFunc$StdPtrAdapt$C4GameRes$pStdCompiler(adapt, pComp) {
  $.CompileNewFunc$rpC4GameRes$pStdCompiler(adapt.rpObj, pComp);
}

export function StdPtrAdaptCompileNewFunc$StdPtrAdapt$Scenario$pStdCompiler(adapt, pComp) {
  $.CompileNewFunc$rpScenario$pStdCompiler(adapt.rpObj, pComp);
}

export function StdPtrAdaptCompileNewFunc$StdPtrAdapt$AccessGfx$pStdCompiler(adapt, pComp) {
  $.CompileNewFunc$rpAccessGfx$pStdCompiler(adapt.rpObj, pComp);
}

export function StdPtrAdaptCompileNewFunc$StdContextPtrAdapt$SerializableValueProvider$IDBase$pStdCompiler(adapt, pComp) {
  $.CompileNewFuncCtx$rpSerializableValueProvider$pStdCompiler$StdMeshInstance$SerializableValueProvider$IDBase(adapt.rpObj, pComp, adapt.pCtx);
}

export function StdPtrAdaptDecompileNewFunc$StdPtrAdapt$C4IDPacket$pStdCompiler(adapt, pComp) {
  pComp.Value$StdDecompileAdapt$C4IDPacket(mkDecompileAdapt$C4IDPacket(adapt.rpObj.a[adapt.rpObj.o]));
}

export function StdPtrAdaptDecompileNewFunc$StdPtrAdapt$C4PropList$pStdCompiler$mpC4ValueNumbers(adapt, pComp, pars) {
  pComp.Value$StdParameterAdapt$StdDecompileAdapt$C4PropList$pC4ValueNumbers(mkParAdapt$mStdDecompileAdapt$C4PropList$mpC4ValueNumbers(mkDecompileAdapt$C4PropList(adapt.rpObj.a[adapt.rpObj.o]), pars));
}

export function StdPtrAdaptDecompileNewFunc$StdPtrAdapt$C4PlayerInfo$pStdCompiler(adapt, pComp) {
  pComp.Value$StdDecompileAdapt$C4PlayerInfo(mkDecompileAdapt$C4PlayerInfo(adapt.rpObj.a[adapt.rpObj.o]));
}

export function StdPtrAdaptDecompileNewFunc$StdPtrAdapt$C4ValueArray$pStdCompiler$mpC4ValueNumbers(adapt, pComp, pars) {
  pComp.Value$StdParameterAdapt$StdDecompileAdapt$C4ValueArray$pC4ValueNumbers(mkParAdapt$mStdDecompileAdapt$C4ValueArray$mpC4ValueNumbers(mkDecompileAdapt$C4ValueArray(adapt.rpObj.a[adapt.rpObj.o]), pars));
}

export function StdPtrAdaptDecompileNewFunc$StdPtrAdapt$C4PktDebugRec$pStdCompiler(adapt, pComp) {
  pComp.Value$StdDecompileAdapt$C4PktDebugRec(mkDecompileAdapt$C4PktDebugRec(adapt.rpObj.a[adapt.rpObj.o]));
}

export function StdPtrAdaptDecompileNewFunc$StdPtrAdapt$C4DrawTransform$pStdCompiler(adapt, pComp) {
  pComp.Value$StdDecompileAdapt$C4DrawTransform(mkDecompileAdapt$C4DrawTransform(adapt.rpObj.a[adapt.rpObj.o]));
}

export function StdPtrAdaptDecompileNewFunc$StdContextPtrAdapt$StdMeshInstance$StdMesh$pStdCompiler$x(adapt, pComp, pars) {
  pComp.Value$StdParameterAdapt$StdDecompileAdapt$StdMeshInstance$x(mkParAdapt$mStdDecompileAdapt$StdMeshInstance$x(mkDecompileAdapt$StdMeshInstance(adapt.rpObj.a[adapt.rpObj.o]), pars));
}

export function StdPtrAdaptDecompileNewFunc$StdPtrAdapt$C4Network2ResCore$pStdCompiler(adapt, pComp) {
  pComp.Value$StdDecompileAdapt$C4Network2ResCore(mkDecompileAdapt$C4Network2ResCore(adapt.rpObj.a[adapt.rpObj.o]));
}

export function StdPtrAdaptDecompileNewFunc$StdPtrAdapt$C4ClientPlayerInfos$pStdCompiler(adapt, pComp) {
  pComp.Value$StdDecompileAdapt$C4ClientPlayerInfos(mkDecompileAdapt$C4ClientPlayerInfos(adapt.rpObj.a[adapt.rpObj.o]));
}

export function StdPtrAdaptDecompileNewFunc$StdPtrAdapt$C4MessageBoardQuery$pStdCompiler(adapt, pComp) {
  pComp.Value$StdDecompileAdapt$C4MessageBoardQuery(mkDecompileAdapt$C4MessageBoardQuery(adapt.rpObj.a[adapt.rpObj.o]));
}

export function StdPtrAdaptDecompileNewFunc$StdPtrAdapt$C4RoundResultsPlayer$pStdCompiler(adapt, pComp) {
  pComp.Value$StdDecompileAdapt$C4RoundResultsPlayer(mkDecompileAdapt$C4RoundResultsPlayer(adapt.rpObj.a[adapt.rpObj.o]));
}

export function StdPtrAdaptDecompileNewFunc$StdPtrAdapt$StdMeshInstanceAnimationNode$pStdCompiler$pStdMesh(adapt, pComp, pars) {
  pComp.Value$StdParameterAdapt$StdDecompileAdapt$StdMeshInstanceAnimationNode$pStdMesh(mkParAdapt$mStdDecompileAdapt$StdMeshInstanceAnimationNode$pStdMesh(mkDecompileAdapt$StdMeshInstanceAnimationNode(adapt.rpObj.a[adapt.rpObj.o]), pars));
}

export function StdPtrAdaptDecompileNewFunc$StdPtrAdapt$C4Team$pStdCompiler(adapt, pComp) {
  pComp.Value$StdDecompileAdapt$C4Team(mkDecompileAdapt$C4Team(adapt.rpObj.a[adapt.rpObj.o]));
}

export function StdPtrAdaptDecompileNewFunc$StdPtrAdapt$StdBuf$pStdCompiler(adapt, pComp) {
  pComp.Value$StdDecompileAdapt$StdBuf(mkDecompileAdapt$StdBuf(adapt.rpObj.a[adapt.rpObj.o]));
}

export function StdPtrAdaptDecompileNewFunc$StdPtrAdapt$C4Effect$pStdCompiler$mpC4PropList$rpC4ValueNumbers(adapt, pComp, pars, pars$2) {
  pComp.Value$StdParameter2Adapt$StdDecompileAdapt$C4Effect$pC4PropList$pC4ValueNumbers(mkParAdapt$mStdDecompileAdapt$C4Effect$mpC4PropList$rpC4ValueNumbers(mkDecompileAdapt$C4Effect(adapt.rpObj.a[adapt.rpObj.o]), pars, $tmp(pars$2.a[pars$2.o])));
}

export function StdPtrAdaptDecompileNewFunc$StdPtrAdapt$C4Effect$pStdCompiler$mpC4AulScriptEngine$rpC4ValueNumbers(adapt, pComp, pars, pars$2) {
  pComp.Value$StdParameter2Adapt$StdDecompileAdapt$C4Effect$pC4AulScriptEngine$pC4ValueNumbers(mkParAdapt$mStdDecompileAdapt$C4Effect$mpC4AulScriptEngine$rpC4ValueNumbers(mkDecompileAdapt$C4Effect(adapt.rpObj.a[adapt.rpObj.o]), pars, $tmp(pars$2.a[pars$2.o])));
}

export function StdPtrAdaptDecompileNewFunc$StdPtrAdapt$C4Effect$pStdCompiler$mpC4Object$rpC4ValueNumbers(adapt, pComp, pars, pars$2) {
  pComp.Value$StdParameter2Adapt$StdDecompileAdapt$C4Effect$pC4Object$pC4ValueNumbers(mkParAdapt$mStdDecompileAdapt$C4Effect$mpC4Object$rpC4ValueNumbers(mkDecompileAdapt$C4Effect(adapt.rpObj.a[adapt.rpObj.o]), pars, $tmp(pars$2.a[pars$2.o])));
}

export function StdPtrAdaptDecompileNewFunc$StdPtrAdapt$C4Effect$pStdCompiler$rpC4PropList$rpC4ValueNumbers(adapt, pComp, pars, pars$2) {
  pComp.Value$StdParameter2Adapt$StdDecompileAdapt$C4Effect$pC4PropList$pC4ValueNumbers$2(mkParAdapt$mStdDecompileAdapt$C4Effect$rpC4PropList$rpC4ValueNumbers(mkDecompileAdapt$C4Effect(adapt.rpObj.a[adapt.rpObj.o]), $tmp(pars.a[pars.o]), $tmp(pars$2.a[pars$2.o])));
}

export function StdPtrAdaptDecompileNewFunc$StdPtrAdapt$C4Object$pStdCompiler$rpC4ValueNumbers(adapt, pComp, pars) {
  pComp.Value$StdParameterAdapt$StdDecompileAdapt$C4Object$pC4ValueNumbers(mkParAdapt$mStdDecompileAdapt$C4Object$rpC4ValueNumbers(mkDecompileAdapt$C4Object(adapt.rpObj.a[adapt.rpObj.o]), $tmp(pars.a[pars.o])));
}

export function StdPtrAdaptDecompileNewFunc$StdPtrAdapt$C4Command$pStdCompiler$rpC4ValueNumbers(adapt, pComp, pars) {
  pComp.Value$StdParameterAdapt$StdDecompileAdapt$C4Command$pC4ValueNumbers(mkParAdapt$mStdDecompileAdapt$C4Command$rpC4ValueNumbers(mkDecompileAdapt$C4Command(adapt.rpObj.a[adapt.rpObj.o]), $tmp(pars.a[pars.o])));
}

export function StdPtrAdaptDecompileNewFunc$StdPtrAdapt$C4Control$pStdCompiler(adapt, pComp) {
  pComp.Value$StdDecompileAdapt$C4Control(mkDecompileAdapt$C4Control(adapt.rpObj.a[adapt.rpObj.o]));
}

export function StdPtrAdaptDecompileNewFunc$StdPtrAdapt$C4GameRes$pStdCompiler(adapt, pComp) {
  pComp.Value$StdDecompileAdapt$C4GameRes(mkDecompileAdapt$C4GameRes(adapt.rpObj.a[adapt.rpObj.o]));
}

export function StdPtrAdaptDecompileNewFunc$StdPtrAdapt$Scenario$pStdCompiler(adapt, pComp) {
  pComp.Value$StdDecompileAdapt$Scenario(mkDecompileAdapt$C4MapFolderData$Scenario(adapt.rpObj.a[adapt.rpObj.o]));
}

export function StdPtrAdaptDecompileNewFunc$StdPtrAdapt$AccessGfx$pStdCompiler(adapt, pComp) {
  pComp.Value$StdDecompileAdapt$AccessGfx(mkDecompileAdapt$C4MapFolderData$AccessGfx(adapt.rpObj.a[adapt.rpObj.o]));
}

export function StdPtrAdaptDecompileNewFunc$StdContextPtrAdapt$SerializableValueProvider$IDBase$pStdCompiler(adapt, pComp) {
  pComp.Value$StdDecompileAdapt$SerializableValueProvider(mkDecompileAdapt$StdMeshInstance$SerializableValueProvider(adapt.rpObj.a[adapt.rpObj.o]));
}

export function mkStringAdapt$pi8$i32$i32(szString, iMaxLength, eRawType = 0 /*RCT_Escaped*/) {
  return new StdStringAdapt().init(szString, iMaxLength, eRawType);
}

export function mkStringAdaptA(string) {
  return new StdStdStringAdapt().init(string, 1 /*RCT_All*/);
}

export function mkArrayAdaptDM$3(array, rDefault) {
  return new StdArrayDefaultAdapt$i32$i32$_IdFuncClass$i32().init(P(array, 0), 6, rDefault);
}

export function mkParAdapt$mStdPtrAdapt$C4PropList$mpC4ValueNumbers(rObj, rPar) {
  return new StdParameterAdapt$StdPtrAdapt$C4PropList$pC4ValueNumbers().init(rObj, rPar);
}

export function mkParAdapt$mStdPtrAdapt$C4ValueArray$mpC4ValueNumbers(rObj, rPar) {
  return new StdParameterAdapt$StdPtrAdapt$C4ValueArray$pC4ValueNumbers().init(rObj, rPar);
}

export function mkParAdapt$mStdPtrAdapt$StdMeshInstanceAnimationNode$pStdMesh(rObj, rPar) {
  return new StdParameterAdapt$StdPtrAdapt$StdMeshInstanceAnimationNode$pStdMesh().init(rObj, rPar);
}

export function mkParAdapt$mStdPtrAdapt$C4Object$rpC4ValueNumbers(rObj, rPar) {
  return new StdParameterAdapt$StdPtrAdapt$C4Object$pC4ValueNumbers().init(rObj, $tmp(rPar.a[rPar.o]));
}

export function mkParAdapt$mStdPtrAdapt$C4Command$rpC4ValueNumbers(rObj, rPar) {
  return new StdParameterAdapt$StdPtrAdapt$C4Command$pC4ValueNumbers().init(rObj, $tmp(rPar.a[rPar.o]));
}

export function mkParAdapt$mStdDecompileAdapt$C4PropList$mpC4ValueNumbers(rObj, rPar) {
  return new StdParameterAdapt$StdDecompileAdapt$C4PropList$pC4ValueNumbers().init(rObj, rPar);
}

export function mkParAdapt$mStdDecompileAdapt$C4ValueArray$mpC4ValueNumbers(rObj, rPar) {
  return new StdParameterAdapt$StdDecompileAdapt$C4ValueArray$pC4ValueNumbers().init(rObj, rPar);
}

export function mkParAdapt$mStdDecompileAdapt$StdCopyStrBuf$mi32(rObj, rPar) {
  return new StdParameterAdapt$StdDecompileAdapt$StdCopyStrBuf$i32().init(rObj, rPar);
}

export function mkParAdapt$mStdDecompileAdapt$StdMeshInstance$x(rObj, rPar) {
  return new StdParameterAdapt$StdDecompileAdapt$StdMeshInstance$x().init(rObj, rPar);
}

export function mkParAdapt$mStdDecompileAdapt$StdMeshInstanceAnimationNode$pStdMesh(rObj, rPar) {
  return new StdParameterAdapt$StdDecompileAdapt$StdMeshInstanceAnimationNode$pStdMesh().init(rObj, rPar);
}

export function mkParAdapt$mStdDecompileAdapt$C4Object$rpC4ValueNumbers(rObj, rPar) {
  return new StdParameterAdapt$StdDecompileAdapt$C4Object$pC4ValueNumbers().init(rObj, $tmp(rPar.a[rPar.o]));
}

export function mkParAdapt$mStdDecompileAdapt$C4Command$rpC4ValueNumbers(rObj, rPar) {
  return new StdParameterAdapt$StdDecompileAdapt$C4Command$pC4ValueNumbers().init(rObj, $tmp(rPar.a[rPar.o]));
}

export function mkParAdapt$mStdContextPtrAdapt$StdMeshInstance$StdMesh$x(rObj, rPar) {
  return new StdParameterAdapt$StdContextPtrAdapt$StdMeshInstance$StdMesh$x().init(rObj, rPar);
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

export function mkParAdapt$rC4Scenario$rb(rObj, rPar) {
  return new StdParameterAdapt$C4Scenario$b().init(rObj, $tmp(rPar.a[rPar.o]));
}

export function mkParAdapt$rC4Scenario$mb(rObj, rPar) {
  return new StdParameterAdapt$C4Scenario$b$2().init(rObj, rPar);
}

export function mkParAdapt$rC4KeyCodeEx$mpStdCopyStrBuf(rObj, rPar) {
  return new StdParameterAdapt$C4KeyCodeEx$pStdCopyStrBuf().init(rObj, rPar);
}

export function mkParAdapt$rC4ObjectList$rpC4ValueNumbers(rObj, rPar) {
  return new StdParameterAdapt$C4ObjectList$pC4ValueNumbers().init(rObj, $tmp(rPar.a[rPar.o]));
}

export function mkParAdapt$rC4ValueArray$mpC4ValueNumbers(rObj, rPar) {
  return new StdParameterAdapt$C4ValueArray$pC4ValueNumbers().init(rObj, rPar);
}

export function mkParAdapt$rStdCopyStrBuf$mi32(rObj, rPar) {
  return new StdParameterAdapt$StdCopyStrBuf$i32().init(rObj, rPar);
}

export function mkParAdapt$rC4ValueMapData$mpC4ValueNumbers(rObj, rPar) {
  return new StdParameterAdapt$C4ValueMapData$pC4ValueNumbers$2().init(rObj, rPar);
}

export function mkParAdapt$rC4ValueMapData$rpC4ValueNumbers(rObj, rPar) {
  return new StdParameterAdapt$C4ValueMapData$pC4ValueNumbers().init(rObj, $tmp(rPar.a[rPar.o]));
}

export function mkParAdapt$rC4ConfigGamepad$mb(rObj, rPar) {
  return new StdParameterAdapt$C4ConfigGamepad$b().init(rObj, rPar);
}

export function mkParAdapt$rStdMeshInstance$x(rObj, rPar) {
  return new StdParameterAdapt$StdMeshInstance$x().init(rObj, rPar);
}

export function mkParAdapt$rC4GameParameters$rpC4Scenario(rObj, rPar) {
  return new StdParameterAdapt$C4GameParameters$pC4Scenario().init(rObj, $tmp(rPar.a[rPar.o]));
}

export function mkParAdapt$rC4PropListNumbered$rpC4ValueNumbers(rObj, rPar) {
  return new StdParameterAdapt$C4PropListNumbered$pC4ValueNumbers().init(rObj, $tmp(rPar.a[rPar.o]));
}

export function mkParAdapt$rC4NotifyingObjectList$rpC4ValueNumbers(rObj, rPar) {
  return new StdParameterAdapt$C4NotifyingObjectList$pC4ValueNumbers().init(rObj, $tmp(rPar.a[rPar.o]));
}

export function mkParAdapt$rValidatedStdCopyStrBuf$3$mi32(rObj, rPar) {
  return new StdParameterAdapt$ValidatedStdCopyStrBuf$3$i32().init(rObj, rPar);
}

export function mkParAdapt$rStdMeshInstanceAnimationNode$pStdMesh(rObj, rPar) {
  return new StdParameterAdapt$StdMeshInstanceAnimationNode$pStdMesh().init(rObj, rPar);
}

export function mkParAdapt$rC4Set$C4Property$rpC4ValueNumbers(rObj, rPar) {
  return new StdParameterAdapt$C4Set$C4Property$pC4ValueNumbers().init(rObj, $tmp(rPar.a[rPar.o]));
}

export function mkParAdapt$rC4SGame$rb(rObj, rPar) {
  return new StdParameterAdapt$C4SGame$b().init(rObj, $tmp(rPar.a[rPar.o]));
}

export function mkParAdapt$rC4SHead$rb(rObj, rPar) {
  return new StdParameterAdapt$C4SHead$b().init(rObj, $tmp(rPar.a[rPar.o]));
}

export function mkParAdapt$rC4Shape$mpC4Shape(rObj, rPar) {
  return new StdParameterAdapt$C4Shape$pC4Shape().init(rObj, rPar);
}

export function mkParAdapt$rC4Value$rpC4ValueNumbers(rObj, rPar) {
  return new StdParameterAdapt$C4Value$pC4ValueNumbers().init(rObj, $tmp(rPar.a[rPar.o]));
}

export function mkParAdapt$rC4IDList$mb(rObj, rPar) {
  return new StdParameterAdapt$C4IDList$b().init(rObj, rPar);
}

export function mkParAdapt$rC4Object$mpC4ValueNumbers(rObj, rPar) {
  return new StdParameterAdapt$C4Object$pC4ValueNumbers$2().init(rObj, rPar);
}

export function mkParAdapt$rC4Object$rpC4ValueNumbers(rObj, rPar) {
  return new StdParameterAdapt$C4Object$pC4ValueNumbers().init(rObj, $tmp(rPar.a[rPar.o]));
}

export function mkParAdapt$rC4Player$mpC4ValueNumbers(rObj, rPar) {
  return new StdParameterAdapt$C4Player$pC4ValueNumbers$2().init(rObj, rPar);
}

export function mkParAdapt$rC4Player$rpC4ValueNumbers(rObj, rPar) {
  return new StdParameterAdapt$C4Player$pC4ValueNumbers().init(rObj, $tmp(rPar.a[rPar.o]));
}

export function mkParAdapt$rC4Command$rpC4ValueNumbers(rObj, rPar) {
  return new StdParameterAdapt$C4Command$pC4ValueNumbers().init(rObj, $tmp(rPar.a[rPar.o]));
}

export function mkParAdapt$rStdStrBuf$mi32(rObj, rPar) {
  return new StdParameterAdapt$StdStrBuf$i32().init(rObj, rPar);
}

export function mkParAdapt$rStdMeshInstance$AttachedMesh$Denumerator$mpAttachedMesh(rObj, rPar) {
  return new StdParameterAdapt$Denumerator$pAttachedMesh().init(rObj, rPar);
}

export function mkParAdapt$rStdMeshInstance$AttachedMesh$x(rObj, rPar) {
  return new StdParameterAdapt$AttachedMesh$x().init(rObj, rPar);
}

export function mkParAdapt$mStdPtrAdapt$C4Effect$mpC4PropList$rpC4ValueNumbers(rObj, rPar1, rPar2) {
  return new StdParameter2Adapt$StdPtrAdapt$C4Effect$pC4PropList$pC4ValueNumbers$2().init(rObj, rPar1, $tmp(rPar2.a[rPar2.o]));
}

export function mkParAdapt$mStdPtrAdapt$C4Effect$mpC4AulScriptEngine$rpC4ValueNumbers(rObj, rPar1, rPar2) {
  return new StdParameter2Adapt$StdPtrAdapt$C4Effect$pC4AulScriptEngine$pC4ValueNumbers().init(rObj, rPar1, $tmp(rPar2.a[rPar2.o]));
}

export function mkParAdapt$mStdPtrAdapt$C4Effect$mpC4Object$rpC4ValueNumbers(rObj, rPar1, rPar2) {
  return new StdParameter2Adapt$StdPtrAdapt$C4Effect$pC4Object$pC4ValueNumbers().init(rObj, rPar1, $tmp(rPar2.a[rPar2.o]));
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

export function mkParAdapt$mStdDecompileAdapt$C4Effect$mpC4Object$rpC4ValueNumbers(rObj, rPar1, rPar2) {
  return new StdParameter2Adapt$StdDecompileAdapt$C4Effect$pC4Object$pC4ValueNumbers().init(rObj, rPar1, $tmp(rPar2.a[rPar2.o]));
}

export function mkParAdapt$mStdDecompileAdapt$C4Effect$rpC4PropList$rpC4ValueNumbers(rObj, rPar1, rPar2) {
  return new StdParameter2Adapt$StdDecompileAdapt$C4Effect$pC4PropList$pC4ValueNumbers().init(rObj, $tmp(rPar1.a[rPar1.o]), $tmp(rPar2.a[rPar2.o]));
}

export function mkParAdapt$rC4GameObjects$mb$rpC4ValueNumbers(rObj, rPar1, rPar2) {
  return new StdParameter2Adapt$C4GameObjects$b$pC4ValueNumbers().init(rObj, rPar1, $tmp(rPar2.a[rPar2.o]));
}

export function mkParAdapt$rC4AulScriptEngine$mb$rpC4ValueNumbers(rObj, rPar1, rPar2) {
  return new StdParameter2Adapt$C4AulScriptEngine$b$pC4ValueNumbers().init(rObj, rPar1, $tmp(rPar2.a[rPar2.o]));
}

export function mkParAdapt$rC4Game$mC4Game$CompileSettings$rpC4ValueNumbers(rObj, rPar1, rPar2) {
  return new StdParameter2Adapt$C4Game$CompileSettings$pC4ValueNumbers$2().init(rObj, rPar1, $tmp(rPar2.a[rPar2.o]));
}

export function mkParAdapt$rC4Game$rC4Game$CompileSettings$rpC4ValueNumbers(rObj, rPar1, rPar2) {
  return new StdParameter2Adapt$C4Game$CompileSettings$pC4ValueNumbers().init(rObj, rPar1, $tmp(rPar2.a[rPar2.o]));
}

export function mkParAdapt$rC4Effect$mpC4PropList$rpC4ValueNumbers(rObj, rPar1, rPar2) {
  return new StdParameter2Adapt$C4Effect$pC4PropList$pC4ValueNumbers$2().init(rObj, rPar1, $tmp(rPar2.a[rPar2.o]));
}

export function mkParAdapt$rC4Effect$mpC4AulScriptEngine$rpC4ValueNumbers(rObj, rPar1, rPar2) {
  return new StdParameter2Adapt$C4Effect$pC4AulScriptEngine$pC4ValueNumbers().init(rObj, rPar1, $tmp(rPar2.a[rPar2.o]));
}

export function mkParAdapt$rC4Effect$mpC4Object$rpC4ValueNumbers(rObj, rPar1, rPar2) {
  return new StdParameter2Adapt$C4Effect$pC4Object$pC4ValueNumbers().init(rObj, rPar1, $tmp(rPar2.a[rPar2.o]));
}

export function mkParAdapt$rC4Effect$rpC4PropList$rpC4ValueNumbers(rObj, rPar1, rPar2) {
  return new StdParameter2Adapt$C4Effect$pC4PropList$pC4ValueNumbers().init(rObj, $tmp(rPar1.a[rPar1.o]), $tmp(rPar2.a[rPar2.o]));
}

export function StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$C4IDPacket(pComp, adapt) {
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
    StdPtrAdaptCompileNewFunc$StdPtrAdapt$C4IDPacket$pStdCompiler(adapt, pComp);
  } else {
    StdPtrAdaptDecompileNewFunc$StdPtrAdapt$C4IDPacket$pStdCompiler(adapt, pComp);
  }
  if (adapt.fAllowNull && fNaming) {
    pComp.NameEnd();
  }
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

export function StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$C4PlayerInfo(pComp, adapt) {
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
    StdPtrAdaptCompileNewFunc$StdPtrAdapt$C4PlayerInfo$pStdCompiler(adapt, pComp);
  } else {
    StdPtrAdaptDecompileNewFunc$StdPtrAdapt$C4PlayerInfo$pStdCompiler(adapt, pComp);
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

export function StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$C4PktDebugRec(pComp, adapt) {
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
    StdPtrAdaptCompileNewFunc$StdPtrAdapt$C4PktDebugRec$pStdCompiler(adapt, pComp);
  } else {
    StdPtrAdaptDecompileNewFunc$StdPtrAdapt$C4PktDebugRec$pStdCompiler(adapt, pComp);
  }
  if (adapt.fAllowNull && fNaming) {
    pComp.NameEnd();
  }
}

export function StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$C4DrawTransform(pComp, adapt) {
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
    StdPtrAdaptCompileNewFunc$StdPtrAdapt$C4DrawTransform$pStdCompiler(adapt, pComp);
  } else {
    StdPtrAdaptDecompileNewFunc$StdPtrAdapt$C4DrawTransform$pStdCompiler(adapt, pComp);
  }
  if (adapt.fAllowNull && fNaming) {
    pComp.NameEnd();
  }
}

export function StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$C4Network2ResCore(pComp, adapt) {
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
    StdPtrAdaptCompileNewFunc$StdPtrAdapt$C4Network2ResCore$pStdCompiler(adapt, pComp);
  } else {
    StdPtrAdaptDecompileNewFunc$StdPtrAdapt$C4Network2ResCore$pStdCompiler(adapt, pComp);
  }
  if (adapt.fAllowNull && fNaming) {
    pComp.NameEnd();
  }
}

export function StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$C4ClientPlayerInfos(pComp, adapt) {
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
    StdPtrAdaptCompileNewFunc$StdPtrAdapt$C4ClientPlayerInfos$pStdCompiler(adapt, pComp);
  } else {
    StdPtrAdaptDecompileNewFunc$StdPtrAdapt$C4ClientPlayerInfos$pStdCompiler(adapt, pComp);
  }
  if (adapt.fAllowNull && fNaming) {
    pComp.NameEnd();
  }
}

export function StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$C4MessageBoardQuery(pComp, adapt) {
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
    StdPtrAdaptCompileNewFunc$StdPtrAdapt$C4MessageBoardQuery$pStdCompiler(adapt, pComp);
  } else {
    StdPtrAdaptDecompileNewFunc$StdPtrAdapt$C4MessageBoardQuery$pStdCompiler(adapt, pComp);
  }
  if (adapt.fAllowNull && fNaming) {
    pComp.NameEnd();
  }
}

export function StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$C4RoundResultsPlayer(pComp, adapt) {
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
    StdPtrAdaptCompileNewFunc$StdPtrAdapt$C4RoundResultsPlayer$pStdCompiler(adapt, pComp);
  } else {
    StdPtrAdaptDecompileNewFunc$StdPtrAdapt$C4RoundResultsPlayer$pStdCompiler(adapt, pComp);
  }
  if (adapt.fAllowNull && fNaming) {
    pComp.NameEnd();
  }
}

export function StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$StdMeshInstanceAnimationNode$pStdMesh(pComp, adapt, pars) {
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
    StdPtrAdaptCompileNewFunc$StdPtrAdapt$StdMeshInstanceAnimationNode$pStdCompiler$pStdMesh(adapt, pComp, pars);
  } else {
    StdPtrAdaptDecompileNewFunc$StdPtrAdapt$StdMeshInstanceAnimationNode$pStdCompiler$pStdMesh(adapt, pComp, pars);
  }
  if (adapt.fAllowNull && fNaming) {
    pComp.NameEnd();
  }
}

export function StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$C4Team(pComp, adapt) {
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
    StdPtrAdaptCompileNewFunc$StdPtrAdapt$C4Team$pStdCompiler(adapt, pComp);
  } else {
    StdPtrAdaptDecompileNewFunc$StdPtrAdapt$C4Team$pStdCompiler(adapt, pComp);
  }
  if (adapt.fAllowNull && fNaming) {
    pComp.NameEnd();
  }
}

export function StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$StdBuf(pComp, adapt) {
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
    StdPtrAdaptCompileNewFunc$StdPtrAdapt$StdBuf$pStdCompiler(adapt, pComp);
  } else {
    StdPtrAdaptDecompileNewFunc$StdPtrAdapt$StdBuf$pStdCompiler(adapt, pComp);
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

export function StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$C4Effect$mpC4Object$rpC4ValueNumbers(pComp, adapt, pars, pars$2) {
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
    StdPtrAdaptCompileNewFunc$StdPtrAdapt$C4Effect$pStdCompiler$mpC4Object$rpC4ValueNumbers(adapt, pComp, pars, $tmp(pars$2.a[pars$2.o]));
  } else {
    StdPtrAdaptDecompileNewFunc$StdPtrAdapt$C4Effect$pStdCompiler$mpC4Object$rpC4ValueNumbers(adapt, pComp, pars, $tmp(pars$2.a[pars$2.o]));
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

export function StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$C4Object$rpC4ValueNumbers(pComp, adapt, pars) {
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
    StdPtrAdaptCompileNewFunc$StdPtrAdapt$C4Object$pStdCompiler$rpC4ValueNumbers(adapt, pComp, $tmp(pars.a[pars.o]));
  } else {
    StdPtrAdaptDecompileNewFunc$StdPtrAdapt$C4Object$pStdCompiler$rpC4ValueNumbers(adapt, pComp, $tmp(pars.a[pars.o]));
  }
  if (adapt.fAllowNull && fNaming) {
    pComp.NameEnd();
  }
}

export function StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$C4Command$rpC4ValueNumbers(pComp, adapt, pars) {
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
    StdPtrAdaptCompileNewFunc$StdPtrAdapt$C4Command$pStdCompiler$rpC4ValueNumbers(adapt, pComp, $tmp(pars.a[pars.o]));
  } else {
    StdPtrAdaptDecompileNewFunc$StdPtrAdapt$C4Command$pStdCompiler$rpC4ValueNumbers(adapt, pComp, $tmp(pars.a[pars.o]));
  }
  if (adapt.fAllowNull && fNaming) {
    pComp.NameEnd();
  }
}

export function StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$C4Control(pComp, adapt) {
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
    StdPtrAdaptCompileNewFunc$StdPtrAdapt$C4Control$pStdCompiler(adapt, pComp);
  } else {
    StdPtrAdaptDecompileNewFunc$StdPtrAdapt$C4Control$pStdCompiler(adapt, pComp);
  }
  if (adapt.fAllowNull && fNaming) {
    pComp.NameEnd();
  }
}

export function StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$C4GameRes(pComp, adapt) {
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
    StdPtrAdaptCompileNewFunc$StdPtrAdapt$C4GameRes$pStdCompiler(adapt, pComp);
  } else {
    StdPtrAdaptDecompileNewFunc$StdPtrAdapt$C4GameRes$pStdCompiler(adapt, pComp);
  }
  if (adapt.fAllowNull && fNaming) {
    pComp.NameEnd();
  }
}

export function StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$Scenario(pComp, adapt) {
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
    StdPtrAdaptCompileNewFunc$StdPtrAdapt$Scenario$pStdCompiler(adapt, pComp);
  } else {
    StdPtrAdaptDecompileNewFunc$StdPtrAdapt$Scenario$pStdCompiler(adapt, pComp);
  }
  if (adapt.fAllowNull && fNaming) {
    pComp.NameEnd();
  }
}

export function StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$AccessGfx(pComp, adapt) {
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
    StdPtrAdaptCompileNewFunc$StdPtrAdapt$AccessGfx$pStdCompiler(adapt, pComp);
  } else {
    StdPtrAdaptDecompileNewFunc$StdPtrAdapt$AccessGfx$pStdCompiler(adapt, pComp);
  }
  if (adapt.fAllowNull && fNaming) {
    pComp.NameEnd();
  }
}

export function StdPtrAdaptCompileFunc$pStdCompiler$StdContextPtrAdapt$StdMeshInstance$StdMesh$x(pComp, adapt, pars) {
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
    StdPtrAdaptCompileNewFunc$StdContextPtrAdapt$StdMeshInstance$StdMesh$pStdCompiler$x(adapt, pComp, pars);
  } else {
    StdPtrAdaptDecompileNewFunc$StdContextPtrAdapt$StdMeshInstance$StdMesh$pStdCompiler$x(adapt, pComp, pars);
  }
  if (adapt.fAllowNull && fNaming) {
    pComp.NameEnd();
  }
}

export function StdPtrAdaptCompileFunc$pStdCompiler$StdContextPtrAdapt$SerializableValueProvider$IDBase(pComp, adapt) {
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
    StdPtrAdaptCompileNewFunc$StdContextPtrAdapt$SerializableValueProvider$IDBase$pStdCompiler(adapt, pComp);
  } else {
    StdPtrAdaptDecompileNewFunc$StdContextPtrAdapt$SerializableValueProvider$IDBase$pStdCompiler(adapt, pComp);
  }
  if (adapt.fAllowNull && fNaming) {
    pComp.NameEnd();
  }
}

export function mkPtrAdapt$rpC4IDPacket$b(rpObj, fAllowNull) {
  return new StdPtrAdapt$C4IDPacket().init(rpObj, fAllowNull);
}

export function mkPtrAdapt$rpC4ValueArray$b(rpObj, fAllowNull) {
  return new StdPtrAdapt$C4ValueArray().init(rpObj, fAllowNull);
}

export function mkPtrAdapt$rpC4PktDebugRec$b(rpObj, fAllowNull) {
  return new StdPtrAdapt$C4PktDebugRec().init(rpObj, fAllowNull);
}

export function mkPtrAdapt$rpC4ClientPlayerInfos$b(rpObj, fAllowNull) {
  return new StdPtrAdapt$C4ClientPlayerInfos().init(rpObj, fAllowNull);
}

export function mkPtrAdapt$rpStdBuf$b(rpObj, fAllowNull) {
  return new StdPtrAdapt$StdBuf().init(rpObj, fAllowNull);
}

export function mkPtrAdapt$rpC4GameRes$b(rpObj, fAllowNull) {
  return new StdPtrAdapt$C4GameRes().init(rpObj, fAllowNull);
}

export function mkPtrAdapt$rpAccessGfx$b(rpObj, fAllowNull) {
  return new StdPtrAdapt$AccessGfx().init(rpObj, fAllowNull);
}

export function $init(): void {
}

Object.assign($, { StdArrayAdapt$C4LSector$StdParameterAdaptMaker$pC4ValueNumbers, StdArrayAdapt$i32$_IdFuncClass$i32, StdArrayAdapt$pAccessGfx$StdPtrAdapt$AccessGfx, StdArrayAdapt$pC4ClientPlayerInfos$StdPtrAdapt$C4ClientPlayerInfos, StdArrayAdapt$pC4GameRes$StdPtrAdapt$C4GameRes, StdArrayAdapt$pC4PlayerInfo$StdPtrAdapt$C4PlayerInfo, StdArrayAdapt$pC4RoundResultsPlayer$StdPtrAdapt$C4RoundResultsPlayer, StdArrayAdapt$pC4Team$StdPtrAdapt$C4Team, StdArrayAdapt$pScenario$StdPtrAdapt$Scenario, StdArrayDefaultAdapt$C4Value$C4Value$StdParameterAdaptMaker$pC4ValueNumbers, StdArrayDefaultAdapt$i32$i32$_IdFuncClass$i32, StdArrayDefaultArrayAdapt$i32$pi32$_IdFuncClass$i32, StdArrayDefaultArrayAdapt$i32$x$_IdFuncClass$i32, StdArrayDefaultArrayAdapt$i32$x$lambda, StdBasicPtrAdapt$AccessGfx, StdBasicPtrAdapt$C4ClientPlayerInfos, StdBasicPtrAdapt$C4Command, StdBasicPtrAdapt$C4Control, StdBasicPtrAdapt$C4DrawTransform, StdBasicPtrAdapt$C4Effect, StdBasicPtrAdapt$C4GameRes, StdBasicPtrAdapt$C4IDPacket, StdBasicPtrAdapt$C4MessageBoardQuery, StdBasicPtrAdapt$C4Network2ResCore, StdBasicPtrAdapt$C4Object, StdBasicPtrAdapt$C4PktDebugRec, StdBasicPtrAdapt$C4PlayerInfo, StdBasicPtrAdapt$C4PropList, StdBasicPtrAdapt$C4RoundResultsPlayer, StdBasicPtrAdapt$C4Team, StdBasicPtrAdapt$C4ValueArray, StdBasicPtrAdapt$Scenario, StdBasicPtrAdapt$SerializableValueProvider, StdBasicPtrAdapt$StdBuf, StdBasicPtrAdapt$StdMeshInstance, StdBasicPtrAdapt$StdMeshInstanceAnimationNode, StdBitfieldAdapt$i32, StdBitfieldAdapt$u16, StdBitfieldAdapt$u32, StdBitfieldAdapt$u8, StdBitfieldEntry$i32, StdBitfieldEntry$u16, StdBitfieldEntry$u32, StdBitfieldEntry$u8, StdCastAdapt$C4Fixed$i32, StdCastAdapt$i32$i32, StdContextPtrAdapt$SerializableValueProvider$IDBase, StdContextPtrAdapt$StdMeshInstance$StdMesh, StdDecompileAdapt$AccessGfx, StdDecompileAdapt$C4ClientPlayerInfos, StdDecompileAdapt$C4Command, StdDecompileAdapt$C4Control, StdDecompileAdapt$C4DrawTransform, StdDecompileAdapt$C4Effect, StdDecompileAdapt$C4GameRes, StdDecompileAdapt$C4IDPacket, StdDecompileAdapt$C4MessageBoardQuery, StdDecompileAdapt$C4Network2ResCore, StdDecompileAdapt$C4Object, StdDecompileAdapt$C4PacketBase, StdDecompileAdapt$C4PktDebugRec, StdDecompileAdapt$C4PlayerInfo, StdDecompileAdapt$C4PropList, StdDecompileAdapt$C4RecordChunk, StdDecompileAdapt$C4RoundResultsPlayer, StdDecompileAdapt$C4Team, StdDecompileAdapt$C4ValueArray, StdDecompileAdapt$Scenario, StdDecompileAdapt$SerializableValueProvider, StdDecompileAdapt$StdBuf, StdDecompileAdapt$StdCopyStrBuf, StdDecompileAdapt$StdMeshInstance, StdDecompileAdapt$StdMeshInstanceAnimationNode, StdDecompileAdapt$StdStrBuf, StdDefaultAdapt$C4DefGraphicsAdapt$pC4DefGraphics, StdDefaultAdapt$C4DefGraphicsAdapt$pC4DefGraphics$2, StdDefaultAdapt$C4Fixed$C4Fixed, StdDefaultAdapt$C4Fixed$i32, StdDefaultAdapt$C4GraphicsOverlayListAdapt$pC4GraphicsOverlay, StdDefaultAdapt$C4ID$C4ID, StdDefaultAdapt$C4IDList$C4IDList, StdDefaultAdapt$C4KeyEventData$C4KeyEventData, StdDefaultAdapt$C4NameList$C4NameList, StdDefaultAdapt$C4NetFilenameAdapt$x, StdDefaultAdapt$C4ObjectPtr$C4ObjectPtr, StdDefaultAdapt$C4PlayerControlAssignmentSets$C4PlayerControlAssignmentSets, StdDefaultAdapt$C4PlayerControlDefs$C4PlayerControlDefs, StdDefaultAdapt$C4Rect$C4Rect, StdDefaultAdapt$C4RoundResultsPlayers$C4RoundResultsPlayers, StdDefaultAdapt$C4SVal$C4SVal, StdDefaultAdapt$C4StrValAdapt$StdParameterAdapt$StdCopyStrBuf$i32$StdCopyStrBuf, StdDefaultAdapt$C4TargetRect$C4TargetRect, StdDefaultAdapt$CSync$CSync, StdDefaultAdapt$StdArrayAdapt$i32$_IdFuncClass$i32$i32, StdDefaultAdapt$StdArrayAdapt$i32$_IdFuncClass$i32$x, StdDefaultAdapt$StdArrayDefaultArrayAdapt$i32$pi32$_IdFuncClass$i32$pi32, StdDefaultAdapt$StdArrayDefaultArrayAdapt$i32$x$_IdFuncClass$i32$x, StdDefaultAdapt$StdArrayDefaultArrayAdapt$i32$x$lambda$x, StdDefaultAdapt$StdBitfieldAdapt$i32$i32, StdDefaultAdapt$StdBitfieldAdapt$i32$i32$2, StdDefaultAdapt$StdBitfieldAdapt$i32$i32$3, StdDefaultAdapt$StdBitfieldAdapt$u16$u32, StdDefaultAdapt$StdBitfieldAdapt$u32$u32, StdDefaultAdapt$StdBitfieldAdapt$u8$u32, StdDefaultAdapt$StdCastAdapt$C4Fixed$i32$C4Fixed, StdDefaultAdapt$StdCastAdapt$i32$i32$i32, StdDefaultAdapt$StdCopyStrBuf$StdCopyStrBuf, StdDefaultAdapt$StdCopyStrBuf$StdStrBuf, StdDefaultAdapt$StdCopyStrBuf$x, StdDefaultAdapt$StdCopyStrBuf$x$2, StdDefaultAdapt$StdEnumAdapt$i32$i32$i32, StdDefaultAdapt$StdEnumAdapt$i32$i32$i32$2, StdDefaultAdapt$StdEnumAdapt$i32$i32$i32$3, StdDefaultAdapt$StdEnumAdapt$i32$u8$i32, StdDefaultAdapt$StdEnumAdapt$i32$u8$i32$2, StdDefaultAdapt$StdEnumAdapt$i32$u8$i32$3, StdDefaultAdapt$StdEnumAdapt$i32$u8$i32$4, StdDefaultAdapt$StdEnumAdapt$i32$u8$i32$5, StdDefaultAdapt$StdEnumAdapt$i32$u8$i32$6, StdDefaultAdapt$StdIntAdapt$i32$i32$i32, StdDefaultAdapt$StdIntAdapt$i32$i32$i32$2, StdDefaultAdapt$StdIntAdapt$i32$u8$i32, StdDefaultAdapt$StdIntAdapt$i32$u8$i32$2, StdDefaultAdapt$StdIntAdapt$i32$u8$i32$3, StdDefaultAdapt$StdIntAdapt$i32$u8$i32$4, StdDefaultAdapt$StdIntAdapt$i32$u8$i32$5, StdDefaultAdapt$StdIntAdapt$i32$u8$i32$6, StdDefaultAdapt$StdIntAdapt$i32$u8$i32$7, StdDefaultAdapt$StdIntPackAdapt$i32$i32, StdDefaultAdapt$StdIntPackAdapt$i32$i32$2, StdDefaultAdapt$StdParameterAdapt$C4IDList$b$C4IDList, StdDefaultAdapt$StdParameterAdapt$C4Value$pC4ValueNumbers$C4Value, StdDefaultAdapt$StdParameterAdapt$C4Value$pC4ValueNumbers$C4Value$2, StdDefaultAdapt$StdParameterAdapt$C4ValueMapData$pC4ValueNumbers$C4ValueMapData, StdDefaultAdapt$StdParameterAdapt$C4ValueMapData$pC4ValueNumbers$C4ValueMapData$2, StdDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$StdCopyStrBuf, StdDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$x, StdDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$x$2, StdDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$x$3, StdDefaultAdapt$StdParameterAdapt$StdStrBuf$i32$StdCopyStrBuf, StdDefaultAdapt$StdParameterAdapt$StdStrBuf$i32$StdStrBuf, StdDefaultAdapt$StdParameterAdapt$StdStrBuf$i32$x, StdDefaultAdapt$StdParameterAdapt$StdStrBuf$i32$x$2, StdDefaultAdapt$StdParameterAdapt$ValidatedStdCopyStrBuf$3$i32$x, StdDefaultAdapt$StdRuntimeValueAdapt$b$b, StdDefaultAdapt$StdSTLContainerAdapt$vector$C4KeyCodeEx$vector$C4KeyCodeEx, StdDefaultAdapt$StdSTLContainerAdapt$vector$C4MaterialReaction$vector$C4MaterialReaction, StdDefaultAdapt$StdSTLContainerAdapt$vector$ControlDownState$vector$ControlDownState, StdDefaultAdapt$StdSTLContainerAdapt$vector$ControlItem$vector$ControlItem, StdDefaultAdapt$StdSTLContainerAdapt$vector$KeyComboItem$vector$KeyComboItem, StdDefaultAdapt$StdSTLContainerAdapt$vector$i32$vector$i32, StdDefaultAdapt$StdStdStringAdapt$x, StdDefaultAdapt$StdStdStringAdapt$x$2, StdDefaultAdapt$StdStdStringAdapt$x$3, StdDefaultAdapt$StdStrBuf$StdStrBuf, StdDefaultAdapt$StdStrBuf$x, StdDefaultAdapt$StdStrBuf$x$2, StdDefaultAdapt$StdStrBuf$x$3, StdDefaultAdapt$StdStrBuf$x$4, StdDefaultAdapt$StdStringAdapt$pi8, StdDefaultAdapt$StdStringAdapt$x, StdDefaultAdapt$StdStringAdapt$x$10, StdDefaultAdapt$StdStringAdapt$x$11, StdDefaultAdapt$StdStringAdapt$x$12, StdDefaultAdapt$StdStringAdapt$x$13, StdDefaultAdapt$StdStringAdapt$x$14, StdDefaultAdapt$StdStringAdapt$x$2, StdDefaultAdapt$StdStringAdapt$x$3, StdDefaultAdapt$StdStringAdapt$x$4, StdDefaultAdapt$StdStringAdapt$x$5, StdDefaultAdapt$StdStringAdapt$x$6, StdDefaultAdapt$StdStringAdapt$x$7, StdDefaultAdapt$StdStringAdapt$x$8, StdDefaultAdapt$StdStringAdapt$x$9, StdDefaultAdapt$ValidatedStdCopyStrBuf$10$x, StdDefaultAdapt$ValidatedStdCopyStrBuf$3$x, StdDefaultAdapt$ValidatedStdCopyStrBuf$4$x, StdDefaultAdapt$b$b, StdDefaultAdapt$i32$i16, StdDefaultAdapt$i32$i32, StdDefaultAdapt$u32$u32, StdDefaultAdapt$u8$i32, StdEnumAdapt$i32$i32, StdEnumAdapt$i32$i32$2, StdEnumAdapt$i32$i32$3, StdEnumAdapt$i32$u8, StdEnumAdapt$i32$u8$2, StdEnumAdapt$i32$u8$3, StdEnumAdapt$i32$u8$4, StdEnumAdapt$i32$u8$5, StdEnumAdapt$i32$u8$6, StdEnumAdapt$i32$u8$7, StdEnumAdapt$i32$u8$8, StdEnumAdapt$i32$u8$9, StdEnumEntry$i32, StdEnumEntry$i32$10, StdEnumEntry$i32$11, StdEnumEntry$i32$12, StdEnumEntry$i32$2, StdEnumEntry$i32$3, StdEnumEntry$i32$5, StdEnumEntry$i32$6, StdEnumEntry$i32$7, StdEnumEntry$i32$8, StdEnumEntry$i32$9, StdInsertAdapt$StdDecompileAdapt$C4PacketBase$u8, StdInsertAdapt$StdParameterAdapt$C4Object$pC4ValueNumbers$StdNamingAdapt$C4ValueNumbers, StdInsertAdapt$StdStrBuf$StdBuf, StdIntAdapt$i32$i32, StdIntAdapt$i32$i32$2, StdIntAdapt$i32$i32$3, StdIntAdapt$i32$i32$4, StdIntAdapt$i32$i32$5, StdIntAdapt$i32$i32$6, StdIntAdapt$i32$i32$7, StdIntAdapt$i32$u8, StdIntAdapt$i32$u8$10, StdIntAdapt$i32$u8$11, StdIntAdapt$i32$u8$12, StdIntAdapt$i32$u8$13, StdIntAdapt$i32$u8$14, StdIntAdapt$i32$u8$15, StdIntAdapt$i32$u8$16, StdIntAdapt$i32$u8$17, StdIntAdapt$i32$u8$18, StdIntAdapt$i32$u8$2, StdIntAdapt$i32$u8$3, StdIntAdapt$i32$u8$4, StdIntAdapt$i32$u8$5, StdIntAdapt$i32$u8$6, StdIntAdapt$i32$u8$7, StdIntAdapt$i32$u8$8, StdIntAdapt$i32$u8$9, StdIntAdapt$u32$i32, StdIntAdapt$u8$i32, StdIntPackAdapt$i32, StdIntPackAdapt$u32, StdNamingAdapt$C4Client, StdNamingAdapt$C4ClientCore, StdNamingAdapt$C4ClientPlayerInfos, StdNamingAdapt$C4ConfigControls, StdNamingAdapt$C4ConfigDeveloper, StdNamingAdapt$C4ConfigGamepad, StdNamingAdapt$C4ConfigGeneral, StdNamingAdapt$C4ConfigGraphics, StdNamingAdapt$C4ConfigIRC, StdNamingAdapt$C4ConfigLobby, StdNamingAdapt$C4ConfigNetwork, StdNamingAdapt$C4ConfigSecurity, StdNamingAdapt$C4ConfigSound, StdNamingAdapt$C4ConfigStartup, StdNamingAdapt$C4Control, StdNamingAdapt$C4Def, StdNamingAdapt$C4DefGraphicsAdapt, StdNamingAdapt$C4FoWBeam, StdNamingAdapt$C4FolderHead, StdNamingAdapt$C4GameRes, StdNamingAdapt$C4IDList, StdNamingAdapt$C4IDPacket, StdNamingAdapt$C4Landscape, StdNamingAdapt$C4MapFolderData, StdNamingAdapt$C4MusicSystem, StdNamingAdapt$C4Network2Reference, StdNamingAdapt$C4Network2ResCore, StdNamingAdapt$C4ObjectInfoCore, StdNamingAdapt$C4ObjectListDumpHelper, StdNamingAdapt$C4ObjectPtr, StdNamingAdapt$C4PacketBase, StdNamingAdapt$C4ParticleDefCore, StdNamingAdapt$C4PlayerInfoList, StdNamingAdapt$C4Rect, StdNamingAdapt$C4RoundResult, StdNamingAdapt$C4RoundResults, StdNamingAdapt$C4SAnimals, StdNamingAdapt$C4SDefinitions, StdNamingAdapt$C4SEnvironment, StdNamingAdapt$C4SLandscape, StdNamingAdapt$C4SPlrStart, StdNamingAdapt$C4SWeather, StdNamingAdapt$C4ScenarioParameters, StdNamingAdapt$C4Scoreboard, StdNamingAdapt$C4Sky, StdNamingAdapt$C4TeamList, StdNamingAdapt$C4ValueNumbers, StdNamingAdapt$C4Weather, StdNamingAdapt$HostilitySet, StdNamingAdapt$MatrixAdapt, StdNamingAdapt$StdArrayAdapt$C4LSector$StdParameterAdaptMaker$pC4ValueNumbers, StdNamingAdapt$StdArrayAdapt$pAccessGfx$StdPtrAdapt$AccessGfx, StdNamingAdapt$StdArrayAdapt$pC4ClientPlayerInfos$StdPtrAdapt$C4ClientPlayerInfos, StdNamingAdapt$StdArrayAdapt$pC4GameRes$StdPtrAdapt$C4GameRes, StdNamingAdapt$StdArrayAdapt$pC4PlayerInfo$StdPtrAdapt$C4PlayerInfo, StdNamingAdapt$StdArrayAdapt$pC4RoundResultsPlayer$StdPtrAdapt$C4RoundResultsPlayer, StdNamingAdapt$StdArrayAdapt$pC4Team$StdPtrAdapt$C4Team, StdNamingAdapt$StdArrayAdapt$pScenario$StdPtrAdapt$Scenario, StdNamingAdapt$StdArrayDefaultAdapt$i32$i32$_IdFuncClass$i32, StdNamingAdapt$StdBuf, StdNamingAdapt$StdCopyBuf, StdNamingAdapt$StdCopyStrBuf, StdNamingAdapt$StdDecompileAdapt$C4RecordChunk, StdNamingAdapt$StdEnumAdapt$i32$u8, StdNamingAdapt$StdInsertAdapt$StdParameterAdapt$C4Object$pC4ValueNumbers$StdNamingAdapt$C4ValueNumbers, StdNamingAdapt$StdIntAdapt$i32$i32, StdNamingAdapt$StdIntAdapt$i32$i32$2, StdNamingAdapt$StdIntAdapt$i32$u8, StdNamingAdapt$StdIntAdapt$i32$u8$2, StdNamingAdapt$StdIntAdapt$u8$i32, StdNamingAdapt$StdParameter2Adapt$C4AulScriptEngine$b$pC4ValueNumbers, StdNamingAdapt$StdParameterAdapt$AttachedMesh$x, StdNamingAdapt$StdParameterAdapt$C4Command$pC4ValueNumbers, StdNamingAdapt$StdParameterAdapt$C4GameParameters$pC4Scenario, StdNamingAdapt$StdParameterAdapt$C4NotifyingObjectList$pC4ValueNumbers, StdNamingAdapt$StdParameterAdapt$C4Object$pC4ValueNumbers, StdNamingAdapt$StdParameterAdapt$C4Object$pC4ValueNumbers$2, StdNamingAdapt$StdParameterAdapt$C4ObjectList$pC4ValueNumbers, StdNamingAdapt$StdParameterAdapt$C4Player$pC4ValueNumbers, StdNamingAdapt$StdParameterAdapt$C4Player$pC4ValueNumbers$2, StdNamingAdapt$StdParameterAdapt$C4PropList$pC4ValueNumbers, StdNamingAdapt$StdParameterAdapt$C4PropListNumbered$pC4ValueNumbers, StdNamingAdapt$StdParameterAdapt$C4SGame$b, StdNamingAdapt$StdParameterAdapt$C4SHead$b, StdNamingAdapt$StdParameterAdapt$StdCopyStrBuf$i32, StdNamingAdapt$StdParameterAdapt$StdDecompileAdapt$StdCopyStrBuf$i32, StdNamingAdapt$StdParameterAdapt$StdMeshInstance$x, StdNamingAdapt$StdParameterAdapt$StdPtrAdapt$C4Object$pC4ValueNumbers, StdNamingAdapt$StdSTLContainerAdapt$list$C4RecordChunk, StdNamingAdapt$StdSTLContainerAdapt$vector$Option, StdNamingAdapt$StdStrBuf, StdNamingAdapt$StdSubMeshInstance, StdNamingAdapt$TransformAdapt, StdNamingAdapt$ValueProviderAdapt, StdNamingAdapt$b, StdNamingAdapt$i32, StdNamingAdapt$u32, StdNamingCountAdapt$i32, StdNamingCountAdapt$u32, StdNamingDefaultAdapt$C4DefGraphicsAdapt$pC4DefGraphics, StdNamingDefaultAdapt$C4Fixed$C4Fixed, StdNamingDefaultAdapt$C4Fixed$i32, StdNamingDefaultAdapt$C4GraphicsOverlayListAdapt$pC4GraphicsOverlay, StdNamingDefaultAdapt$C4ID$C4ID, StdNamingDefaultAdapt$C4IDList$C4IDList, StdNamingDefaultAdapt$C4KeyEventData$C4KeyEventData, StdNamingDefaultAdapt$C4NameList$C4NameList, StdNamingDefaultAdapt$C4NetFilenameAdapt$x, StdNamingDefaultAdapt$C4ObjectPtr$C4ObjectPtr, StdNamingDefaultAdapt$C4PlayerControlAssignmentSets$C4PlayerControlAssignmentSets, StdNamingDefaultAdapt$C4PlayerControlDefs$C4PlayerControlDefs, StdNamingDefaultAdapt$C4Rect$C4Rect, StdNamingDefaultAdapt$C4RoundResultsPlayers$C4RoundResultsPlayers, StdNamingDefaultAdapt$C4SVal$C4SVal, StdNamingDefaultAdapt$C4StrValAdapt$StdParameterAdapt$StdCopyStrBuf$i32$StdCopyStrBuf, StdNamingDefaultAdapt$C4TargetRect$C4TargetRect, StdNamingDefaultAdapt$CSync$CSync, StdNamingDefaultAdapt$StdArrayAdapt$i32$_IdFuncClass$i32$i32, StdNamingDefaultAdapt$StdArrayAdapt$i32$_IdFuncClass$i32$x, StdNamingDefaultAdapt$StdArrayDefaultArrayAdapt$i32$pi32$_IdFuncClass$i32$pi32, StdNamingDefaultAdapt$StdArrayDefaultArrayAdapt$i32$x$_IdFuncClass$i32$x, StdNamingDefaultAdapt$StdArrayDefaultArrayAdapt$i32$x$lambda$x, StdNamingDefaultAdapt$StdBitfieldAdapt$i32$i32, StdNamingDefaultAdapt$StdBitfieldAdapt$i32$i32$2, StdNamingDefaultAdapt$StdBitfieldAdapt$u16$u32, StdNamingDefaultAdapt$StdBitfieldAdapt$u32$u32, StdNamingDefaultAdapt$StdBitfieldAdapt$u8$u32, StdNamingDefaultAdapt$StdCastAdapt$C4Fixed$i32$C4Fixed, StdNamingDefaultAdapt$StdCastAdapt$i32$i32$i32, StdNamingDefaultAdapt$StdCopyStrBuf$StdCopyStrBuf, StdNamingDefaultAdapt$StdCopyStrBuf$StdStrBuf, StdNamingDefaultAdapt$StdCopyStrBuf$x, StdNamingDefaultAdapt$StdCopyStrBuf$x$2, StdNamingDefaultAdapt$StdEnumAdapt$i32$i32$i32, StdNamingDefaultAdapt$StdEnumAdapt$i32$i32$i32$2, StdNamingDefaultAdapt$StdEnumAdapt$i32$i32$i32$3, StdNamingDefaultAdapt$StdEnumAdapt$i32$u8$i32, StdNamingDefaultAdapt$StdEnumAdapt$i32$u8$i32$2, StdNamingDefaultAdapt$StdEnumAdapt$i32$u8$i32$3, StdNamingDefaultAdapt$StdEnumAdapt$i32$u8$i32$4, StdNamingDefaultAdapt$StdEnumAdapt$i32$u8$i32$5, StdNamingDefaultAdapt$StdEnumAdapt$i32$u8$i32$6, StdNamingDefaultAdapt$StdIntAdapt$i32$i32$i32, StdNamingDefaultAdapt$StdIntAdapt$i32$i32$i32$2, StdNamingDefaultAdapt$StdIntAdapt$i32$u8$i32, StdNamingDefaultAdapt$StdIntAdapt$i32$u8$i32$2, StdNamingDefaultAdapt$StdIntAdapt$i32$u8$i32$3, StdNamingDefaultAdapt$StdIntAdapt$i32$u8$i32$4, StdNamingDefaultAdapt$StdIntAdapt$i32$u8$i32$5, StdNamingDefaultAdapt$StdIntAdapt$i32$u8$i32$6, StdNamingDefaultAdapt$StdIntAdapt$i32$u8$i32$7, StdNamingDefaultAdapt$StdIntPackAdapt$i32$i32, StdNamingDefaultAdapt$StdIntPackAdapt$i32$i32$2, StdNamingDefaultAdapt$StdParameterAdapt$C4IDList$b$C4IDList, StdNamingDefaultAdapt$StdParameterAdapt$C4Value$pC4ValueNumbers$C4Value, StdNamingDefaultAdapt$StdParameterAdapt$C4ValueMapData$pC4ValueNumbers$C4ValueMapData, StdNamingDefaultAdapt$StdParameterAdapt$C4ValueMapData$pC4ValueNumbers$C4ValueMapData$2, StdNamingDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$StdCopyStrBuf, StdNamingDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$x, StdNamingDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$x$2, StdNamingDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$x$3, StdNamingDefaultAdapt$StdParameterAdapt$StdStrBuf$i32$StdCopyStrBuf, StdNamingDefaultAdapt$StdParameterAdapt$StdStrBuf$i32$StdStrBuf, StdNamingDefaultAdapt$StdParameterAdapt$StdStrBuf$i32$x, StdNamingDefaultAdapt$StdParameterAdapt$ValidatedStdCopyStrBuf$3$i32$x, StdNamingDefaultAdapt$StdRuntimeValueAdapt$b$b, StdNamingDefaultAdapt$StdSTLContainerAdapt$vector$C4KeyCodeEx$vector$C4KeyCodeEx, StdNamingDefaultAdapt$StdSTLContainerAdapt$vector$C4MaterialReaction$vector$C4MaterialReaction, StdNamingDefaultAdapt$StdSTLContainerAdapt$vector$ControlDownState$vector$ControlDownState, StdNamingDefaultAdapt$StdSTLContainerAdapt$vector$ControlItem$vector$ControlItem, StdNamingDefaultAdapt$StdSTLContainerAdapt$vector$KeyComboItem$vector$KeyComboItem, StdNamingDefaultAdapt$StdSTLContainerAdapt$vector$i32$vector$i32, StdNamingDefaultAdapt$StdStdStringAdapt$x, StdNamingDefaultAdapt$StdStdStringAdapt$x$2, StdNamingDefaultAdapt$StdStdStringAdapt$x$3, StdNamingDefaultAdapt$StdStrBuf$StdStrBuf, StdNamingDefaultAdapt$StdStrBuf$x, StdNamingDefaultAdapt$StdStrBuf$x$2, StdNamingDefaultAdapt$StdStrBuf$x$3, StdNamingDefaultAdapt$StdStrBuf$x$4, StdNamingDefaultAdapt$StdStringAdapt$pi8, StdNamingDefaultAdapt$StdStringAdapt$x, StdNamingDefaultAdapt$StdStringAdapt$x$10, StdNamingDefaultAdapt$StdStringAdapt$x$11, StdNamingDefaultAdapt$StdStringAdapt$x$12, StdNamingDefaultAdapt$StdStringAdapt$x$13, StdNamingDefaultAdapt$StdStringAdapt$x$2, StdNamingDefaultAdapt$StdStringAdapt$x$3, StdNamingDefaultAdapt$StdStringAdapt$x$4, StdNamingDefaultAdapt$StdStringAdapt$x$5, StdNamingDefaultAdapt$StdStringAdapt$x$6, StdNamingDefaultAdapt$StdStringAdapt$x$7, StdNamingDefaultAdapt$StdStringAdapt$x$8, StdNamingDefaultAdapt$StdStringAdapt$x$9, StdNamingDefaultAdapt$ValidatedStdCopyStrBuf$10$x, StdNamingDefaultAdapt$ValidatedStdCopyStrBuf$3$x, StdNamingDefaultAdapt$ValidatedStdCopyStrBuf$4$x, StdNamingDefaultAdapt$b$b, StdNamingDefaultAdapt$i32$i16, StdNamingDefaultAdapt$i32$i32, StdNamingDefaultAdapt$u32$u32, StdNamingDefaultAdapt$u8$i32, StdParameter2Adapt$C4AulScriptEngine$b$pC4ValueNumbers, StdParameter2Adapt$C4Effect$pC4AulScriptEngine$pC4ValueNumbers, StdParameter2Adapt$C4Effect$pC4Object$pC4ValueNumbers, StdParameter2Adapt$C4Effect$pC4PropList$pC4ValueNumbers, StdParameter2Adapt$C4Effect$pC4PropList$pC4ValueNumbers$2, StdParameter2Adapt$C4Game$CompileSettings$pC4ValueNumbers, StdParameter2Adapt$C4Game$CompileSettings$pC4ValueNumbers$2, StdParameter2Adapt$C4GameObjects$b$pC4ValueNumbers, StdParameter2Adapt$StdDecompileAdapt$C4Effect$pC4AulScriptEngine$pC4ValueNumbers, StdParameter2Adapt$StdDecompileAdapt$C4Effect$pC4Object$pC4ValueNumbers, StdParameter2Adapt$StdDecompileAdapt$C4Effect$pC4PropList$pC4ValueNumbers, StdParameter2Adapt$StdDecompileAdapt$C4Effect$pC4PropList$pC4ValueNumbers$2, StdParameter2Adapt$StdPtrAdapt$C4Effect$pC4AulScriptEngine$pC4ValueNumbers, StdParameter2Adapt$StdPtrAdapt$C4Effect$pC4Object$pC4ValueNumbers, StdParameter2Adapt$StdPtrAdapt$C4Effect$pC4PropList$pC4ValueNumbers, StdParameter2Adapt$StdPtrAdapt$C4Effect$pC4PropList$pC4ValueNumbers$2, StdParameterAdapt$AttachedMesh$x, StdParameterAdapt$C4Command$pC4ValueNumbers, StdParameterAdapt$C4ConfigGamepad$b, StdParameterAdapt$C4GameParameters$pC4Scenario, StdParameterAdapt$C4IDList$b, StdParameterAdapt$C4KeyCodeEx$pStdCopyStrBuf, StdParameterAdapt$C4LSector$pC4ValueNumbers, StdParameterAdapt$C4NotifyingObjectList$pC4ValueNumbers, StdParameterAdapt$C4Object$pC4ValueNumbers, StdParameterAdapt$C4Object$pC4ValueNumbers$2, StdParameterAdapt$C4ObjectList$pC4ValueNumbers, StdParameterAdapt$C4Player$pC4ValueNumbers, StdParameterAdapt$C4Player$pC4ValueNumbers$2, StdParameterAdapt$C4PropList$pC4ValueNumbers, StdParameterAdapt$C4PropList$pC4ValueNumbers$2, StdParameterAdapt$C4PropListNumbered$pC4ValueNumbers, StdParameterAdapt$C4Property$pC4ValueNumbers, StdParameterAdapt$C4SGame$b, StdParameterAdapt$C4SHead$b, StdParameterAdapt$C4Scenario$b, StdParameterAdapt$C4Scenario$b$2, StdParameterAdapt$C4Set$C4Property$pC4ValueNumbers, StdParameterAdapt$C4Shape$pC4Shape, StdParameterAdapt$C4Value$pC4ValueNumbers, StdParameterAdapt$C4ValueArray$pC4ValueNumbers, StdParameterAdapt$C4ValueMapData$pC4ValueNumbers, StdParameterAdapt$C4ValueMapData$pC4ValueNumbers$2, StdParameterAdapt$Denumerator$pAttachedMesh, StdParameterAdapt$StdContextPtrAdapt$StdMeshInstance$StdMesh$x, StdParameterAdapt$StdCopyStrBuf$i32, StdParameterAdapt$StdCopyStrBuf$i32$2, StdParameterAdapt$StdDecompileAdapt$C4Command$pC4ValueNumbers, StdParameterAdapt$StdDecompileAdapt$C4Object$pC4ValueNumbers, StdParameterAdapt$StdDecompileAdapt$C4PropList$pC4ValueNumbers, StdParameterAdapt$StdDecompileAdapt$C4ValueArray$pC4ValueNumbers, StdParameterAdapt$StdDecompileAdapt$StdCopyStrBuf$i32, StdParameterAdapt$StdDecompileAdapt$StdMeshInstance$x, StdParameterAdapt$StdDecompileAdapt$StdMeshInstanceAnimationNode$pStdMesh, StdParameterAdapt$StdMeshInstance$x, StdParameterAdapt$StdMeshInstanceAnimationNode$pStdMesh, StdParameterAdapt$StdPtrAdapt$C4Command$pC4ValueNumbers, StdParameterAdapt$StdPtrAdapt$C4Object$pC4ValueNumbers, StdParameterAdapt$StdPtrAdapt$C4PropList$pC4ValueNumbers, StdParameterAdapt$StdPtrAdapt$C4ValueArray$pC4ValueNumbers, StdParameterAdapt$StdPtrAdapt$StdMeshInstanceAnimationNode$pStdMesh, StdParameterAdapt$StdStrBuf$i32, StdParameterAdapt$StdStrBuf$i32$2, StdParameterAdapt$ValidatedStdCopyStrBuf$3$i32, StdParameterAdaptMaker$pC4ValueNumbers, StdParameterAdaptMaker$pC4ValueNumbers$2, StdPtrAdapt$AccessGfx, StdPtrAdapt$C4ClientPlayerInfos, StdPtrAdapt$C4Command, StdPtrAdapt$C4Control, StdPtrAdapt$C4DrawTransform, StdPtrAdapt$C4Effect, StdPtrAdapt$C4GameRes, StdPtrAdapt$C4IDPacket, StdPtrAdapt$C4MessageBoardQuery, StdPtrAdapt$C4Network2ResCore, StdPtrAdapt$C4Object, StdPtrAdapt$C4PktDebugRec, StdPtrAdapt$C4PlayerInfo, StdPtrAdapt$C4PropList, StdPtrAdapt$C4RoundResultsPlayer, StdPtrAdapt$C4Team, StdPtrAdapt$C4ValueArray, StdPtrAdapt$Scenario, StdPtrAdapt$StdBuf, StdPtrAdapt$StdMeshInstanceAnimationNode, StdPtrAdaptCompileFunc$pStdCompiler$StdContextPtrAdapt$SerializableValueProvider$IDBase, StdPtrAdaptCompileFunc$pStdCompiler$StdContextPtrAdapt$StdMeshInstance$StdMesh$x, StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$AccessGfx, StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$C4ClientPlayerInfos, StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$C4Command$rpC4ValueNumbers, StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$C4Control, StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$C4DrawTransform, StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$C4Effect$mpC4AulScriptEngine$rpC4ValueNumbers, StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$C4Effect$mpC4Object$rpC4ValueNumbers, StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$C4Effect$mpC4PropList$rpC4ValueNumbers, StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$C4Effect$rpC4PropList$rpC4ValueNumbers, StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$C4GameRes, StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$C4IDPacket, StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$C4MessageBoardQuery, StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$C4Network2ResCore, StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$C4Object$rpC4ValueNumbers, StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$C4PktDebugRec, StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$C4PlayerInfo, StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$C4PropList$mpC4ValueNumbers, StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$C4RoundResultsPlayer, StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$C4Team, StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$C4ValueArray$mpC4ValueNumbers, StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$Scenario, StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$StdBuf, StdPtrAdaptCompileFunc$pStdCompiler$StdPtrAdapt$StdMeshInstanceAnimationNode$pStdMesh, StdPtrAdaptCompileNewFunc$StdContextPtrAdapt$SerializableValueProvider$IDBase$pStdCompiler, StdPtrAdaptCompileNewFunc$StdContextPtrAdapt$StdMeshInstance$StdMesh$pStdCompiler$x, StdPtrAdaptCompileNewFunc$StdPtrAdapt$AccessGfx$pStdCompiler, StdPtrAdaptCompileNewFunc$StdPtrAdapt$C4ClientPlayerInfos$pStdCompiler, StdPtrAdaptCompileNewFunc$StdPtrAdapt$C4Command$pStdCompiler$rpC4ValueNumbers, StdPtrAdaptCompileNewFunc$StdPtrAdapt$C4Control$pStdCompiler, StdPtrAdaptCompileNewFunc$StdPtrAdapt$C4DrawTransform$pStdCompiler, StdPtrAdaptCompileNewFunc$StdPtrAdapt$C4Effect$pStdCompiler$mpC4AulScriptEngine$rpC4ValueNumbers, StdPtrAdaptCompileNewFunc$StdPtrAdapt$C4Effect$pStdCompiler$mpC4Object$rpC4ValueNumbers, StdPtrAdaptCompileNewFunc$StdPtrAdapt$C4Effect$pStdCompiler$mpC4PropList$rpC4ValueNumbers, StdPtrAdaptCompileNewFunc$StdPtrAdapt$C4Effect$pStdCompiler$rpC4PropList$rpC4ValueNumbers, StdPtrAdaptCompileNewFunc$StdPtrAdapt$C4GameRes$pStdCompiler, StdPtrAdaptCompileNewFunc$StdPtrAdapt$C4IDPacket$pStdCompiler, StdPtrAdaptCompileNewFunc$StdPtrAdapt$C4MessageBoardQuery$pStdCompiler, StdPtrAdaptCompileNewFunc$StdPtrAdapt$C4Network2ResCore$pStdCompiler, StdPtrAdaptCompileNewFunc$StdPtrAdapt$C4Object$pStdCompiler$rpC4ValueNumbers, StdPtrAdaptCompileNewFunc$StdPtrAdapt$C4PktDebugRec$pStdCompiler, StdPtrAdaptCompileNewFunc$StdPtrAdapt$C4PlayerInfo$pStdCompiler, StdPtrAdaptCompileNewFunc$StdPtrAdapt$C4PropList$pStdCompiler$mpC4ValueNumbers, StdPtrAdaptCompileNewFunc$StdPtrAdapt$C4RoundResultsPlayer$pStdCompiler, StdPtrAdaptCompileNewFunc$StdPtrAdapt$C4Team$pStdCompiler, StdPtrAdaptCompileNewFunc$StdPtrAdapt$C4ValueArray$pStdCompiler$mpC4ValueNumbers, StdPtrAdaptCompileNewFunc$StdPtrAdapt$Scenario$pStdCompiler, StdPtrAdaptCompileNewFunc$StdPtrAdapt$StdBuf$pStdCompiler, StdPtrAdaptCompileNewFunc$StdPtrAdapt$StdMeshInstanceAnimationNode$pStdCompiler$pStdMesh, StdPtrAdaptDecompileNewFunc$StdContextPtrAdapt$SerializableValueProvider$IDBase$pStdCompiler, StdPtrAdaptDecompileNewFunc$StdContextPtrAdapt$StdMeshInstance$StdMesh$pStdCompiler$x, StdPtrAdaptDecompileNewFunc$StdPtrAdapt$AccessGfx$pStdCompiler, StdPtrAdaptDecompileNewFunc$StdPtrAdapt$C4ClientPlayerInfos$pStdCompiler, StdPtrAdaptDecompileNewFunc$StdPtrAdapt$C4Command$pStdCompiler$rpC4ValueNumbers, StdPtrAdaptDecompileNewFunc$StdPtrAdapt$C4Control$pStdCompiler, StdPtrAdaptDecompileNewFunc$StdPtrAdapt$C4DrawTransform$pStdCompiler, StdPtrAdaptDecompileNewFunc$StdPtrAdapt$C4Effect$pStdCompiler$mpC4AulScriptEngine$rpC4ValueNumbers, StdPtrAdaptDecompileNewFunc$StdPtrAdapt$C4Effect$pStdCompiler$mpC4Object$rpC4ValueNumbers, StdPtrAdaptDecompileNewFunc$StdPtrAdapt$C4Effect$pStdCompiler$mpC4PropList$rpC4ValueNumbers, StdPtrAdaptDecompileNewFunc$StdPtrAdapt$C4Effect$pStdCompiler$rpC4PropList$rpC4ValueNumbers, StdPtrAdaptDecompileNewFunc$StdPtrAdapt$C4GameRes$pStdCompiler, StdPtrAdaptDecompileNewFunc$StdPtrAdapt$C4IDPacket$pStdCompiler, StdPtrAdaptDecompileNewFunc$StdPtrAdapt$C4MessageBoardQuery$pStdCompiler, StdPtrAdaptDecompileNewFunc$StdPtrAdapt$C4Network2ResCore$pStdCompiler, StdPtrAdaptDecompileNewFunc$StdPtrAdapt$C4Object$pStdCompiler$rpC4ValueNumbers, StdPtrAdaptDecompileNewFunc$StdPtrAdapt$C4PktDebugRec$pStdCompiler, StdPtrAdaptDecompileNewFunc$StdPtrAdapt$C4PlayerInfo$pStdCompiler, StdPtrAdaptDecompileNewFunc$StdPtrAdapt$C4PropList$pStdCompiler$mpC4ValueNumbers, StdPtrAdaptDecompileNewFunc$StdPtrAdapt$C4RoundResultsPlayer$pStdCompiler, StdPtrAdaptDecompileNewFunc$StdPtrAdapt$C4Team$pStdCompiler, StdPtrAdaptDecompileNewFunc$StdPtrAdapt$C4ValueArray$pStdCompiler$mpC4ValueNumbers, StdPtrAdaptDecompileNewFunc$StdPtrAdapt$Scenario$pStdCompiler, StdPtrAdaptDecompileNewFunc$StdPtrAdapt$StdBuf$pStdCompiler, StdPtrAdaptDecompileNewFunc$StdPtrAdapt$StdMeshInstanceAnimationNode$pStdCompiler$pStdMesh, StdRuntimeValueAdapt$b, StdSTLContainerAdapt$list$C4PlayerControlAssignmentSet, StdSTLContainerAdapt$list$C4RecordChunk, StdSTLContainerAdapt$list$i32, StdSTLContainerAdapt$vector$C4KeyCodeEx, StdSTLContainerAdapt$vector$C4MaterialReaction, StdSTLContainerAdapt$vector$C4PlayerControlAssignment, StdSTLContainerAdapt$vector$C4PlayerControlDef, StdSTLContainerAdapt$vector$C4ScenarioParameterDef, StdSTLContainerAdapt$vector$ControlDownState, StdSTLContainerAdapt$vector$ControlItem, StdSTLContainerAdapt$vector$KeyComboItem, StdSTLContainerAdapt$vector$Option, StdSTLContainerAdapt$vector$i32, StdStdStringAdapt, StdStringAdapt, _IdFuncClass$i32, mkArrayAdapt$pi32$i32, mkArrayAdapt$pi32$u64$i32, mkArrayAdaptDM, mkArrayAdaptDM$2, mkArrayAdaptDM$3, mkArrayAdaptDMA, mkArrayAdaptDMAM, mkArrayAdaptDefArr, mkArrayAdaptM, mkArrayAdaptMap$pC4LSector$i32$mStdParameterAdaptMaker$pC4ValueNumbers, mkArrayAdaptMap$pC4Value$u64$C4Value$StdParameterAdaptMaker$pC4ValueNumbers, mkArrayAdaptMap$ppAccessGfx$i32$x, mkArrayAdaptMap$ppC4ClientPlayerInfos$i32$x, mkArrayAdaptMap$ppC4GameRes$i32$x, mkArrayAdaptMap$ppC4PlayerInfo$i32$x, mkArrayAdaptMap$ppC4RoundResultsPlayer$i32$x, mkArrayAdaptMap$ppC4Team$i32$x, mkArrayAdaptMap$ppScenario$i32$x, mkBitfieldAdapt$ri32$pStdBitfieldEntry, mkBitfieldAdapt$ru16$pStdBitfieldEntry, mkBitfieldAdapt$ru32$pStdBitfieldEntry, mkBitfieldAdapt$ru8$pStdBitfieldEntry, mkCastAdapt, mkCastIntAdapt$rC4Fixed, mkCastIntAdapt$ri32, mkContextPtrAdapt, mkDecompileAdapt$C4ClientPlayerInfos, mkDecompileAdapt$C4Command, mkDecompileAdapt$C4Control, mkDecompileAdapt$C4DrawTransform, mkDecompileAdapt$C4Effect, mkDecompileAdapt$C4GameRes, mkDecompileAdapt$C4IDPacket, mkDecompileAdapt$C4MapFolderData$AccessGfx, mkDecompileAdapt$C4MapFolderData$Scenario, mkDecompileAdapt$C4MessageBoardQuery, mkDecompileAdapt$C4Network2ResCore, mkDecompileAdapt$C4Object, mkDecompileAdapt$C4PacketBase, mkDecompileAdapt$C4PktDebugRec, mkDecompileAdapt$C4PlayerInfo, mkDecompileAdapt$C4PropList, mkDecompileAdapt$C4RecordChunk, mkDecompileAdapt$C4RoundResultsPlayer, mkDecompileAdapt$C4Team, mkDecompileAdapt$C4ValueArray, mkDecompileAdapt$StdBuf, mkDecompileAdapt$StdCopyStrBuf, mkDecompileAdapt$StdMeshInstance, mkDecompileAdapt$StdMeshInstance$SerializableValueProvider, mkDecompileAdapt$StdMeshInstanceAnimationNode, mkDecompileAdapt$StdStrBuf, mkDefaultAdapt$mC4DefGraphicsAdapt$rpC4DefGraphics, mkDefaultAdapt$mStdBitfieldAdapt$i32$i32, mkDefaultAdapt$mStdParameterAdapt$C4Value$pC4ValueNumbers$C4Value, mkDefaultAdapt$mStdParameterAdapt$StdStrBuf$i32$x, mkDefaultAdapt$mStdStringAdapt$x, mkDefaultAdapt$rC4DefGraphicsAdapt$rpC4DefGraphics, mkDefaultAdapt$rC4Fixed$C4Fixed, mkDefaultAdapt$rC4Fixed$i32, mkDefaultAdapt$rC4GraphicsOverlayListAdapt$rpC4GraphicsOverlay, mkDefaultAdapt$rC4ID$C4ID, mkDefaultAdapt$rC4IDList$C4IDList, mkDefaultAdapt$rC4KeyEventData$C4KeyEventData, mkDefaultAdapt$rC4NameList$C4NameList, mkDefaultAdapt$rC4NetFilenameAdapt$x, mkDefaultAdapt$rC4ObjectPtr$C4ObjectPtr, mkDefaultAdapt$rC4PlayerControl$CSync$C4PlayerControl$CSync, mkDefaultAdapt$rC4PlayerControlAssignmentSets$C4PlayerControlAssignmentSets, mkDefaultAdapt$rC4PlayerControlDefs$C4PlayerControlDefs, mkDefaultAdapt$rC4Rect$C4Rect, mkDefaultAdapt$rC4RoundResultsPlayers$C4RoundResultsPlayers, mkDefaultAdapt$rC4SVal$C4SVal, mkDefaultAdapt$rC4StrValAdapt$StdParameterAdapt$StdCopyStrBuf$i32$StdCopyStrBuf, mkDefaultAdapt$rC4TargetRect$C4TargetRect, mkDefaultAdapt$rStdArrayAdapt$i32$_IdFuncClass$i32$i32, mkDefaultAdapt$rStdArrayAdapt$i32$_IdFuncClass$i32$x, mkDefaultAdapt$rStdArrayDefaultArrayAdapt$i32$pi32$_IdFuncClass$i32$pi32, mkDefaultAdapt$rStdArrayDefaultArrayAdapt$i32$x$_IdFuncClass$i32$x, mkDefaultAdapt$rStdArrayDefaultArrayAdapt$i32$x$lambda$x, mkDefaultAdapt$rStdBitfieldAdapt$i32$i32, mkDefaultAdapt$rStdBitfieldAdapt$i32$i32$2, mkDefaultAdapt$rStdBitfieldAdapt$u16$u32, mkDefaultAdapt$rStdBitfieldAdapt$u32$u32, mkDefaultAdapt$rStdBitfieldAdapt$u8$u32, mkDefaultAdapt$rStdCastAdapt$C4Fixed$i32$C4Fixed, mkDefaultAdapt$rStdCastAdapt$i32$i32$i32, mkDefaultAdapt$rStdCopyStrBuf$StdCopyStrBuf, mkDefaultAdapt$rStdCopyStrBuf$StdStrBuf, mkDefaultAdapt$rStdCopyStrBuf$x, mkDefaultAdapt$rStdCopyStrBuf$x$2, mkDefaultAdapt$rStdEnumAdapt$i32$i32$i32, mkDefaultAdapt$rStdEnumAdapt$i32$i32$i32$2, mkDefaultAdapt$rStdEnumAdapt$i32$i32$i32$3, mkDefaultAdapt$rStdEnumAdapt$i32$u8$i32, mkDefaultAdapt$rStdEnumAdapt$i32$u8$i32$2, mkDefaultAdapt$rStdEnumAdapt$i32$u8$i32$3, mkDefaultAdapt$rStdEnumAdapt$i32$u8$i32$4, mkDefaultAdapt$rStdEnumAdapt$i32$u8$i32$5, mkDefaultAdapt$rStdEnumAdapt$i32$u8$i32$6, mkDefaultAdapt$rStdIntAdapt$i32$i32$i32, mkDefaultAdapt$rStdIntAdapt$i32$i32$i32$2, mkDefaultAdapt$rStdIntAdapt$i32$u8$i32, mkDefaultAdapt$rStdIntAdapt$i32$u8$i32$2, mkDefaultAdapt$rStdIntAdapt$i32$u8$i32$3, mkDefaultAdapt$rStdIntAdapt$i32$u8$i32$4, mkDefaultAdapt$rStdIntAdapt$i32$u8$i32$5, mkDefaultAdapt$rStdIntAdapt$i32$u8$i32$6, mkDefaultAdapt$rStdIntAdapt$i32$u8$i32$7, mkDefaultAdapt$rStdIntPackAdapt$i32$i32, mkDefaultAdapt$rStdIntPackAdapt$i32$i32$2, mkDefaultAdapt$rStdParameterAdapt$C4IDList$b$C4IDList, mkDefaultAdapt$rStdParameterAdapt$C4Value$pC4ValueNumbers$C4Value, mkDefaultAdapt$rStdParameterAdapt$C4ValueMapData$pC4ValueNumbers$C4ValueMapData, mkDefaultAdapt$rStdParameterAdapt$C4ValueMapData$pC4ValueNumbers$C4ValueMapData$2, mkDefaultAdapt$rStdParameterAdapt$StdCopyStrBuf$i32$StdCopyStrBuf, mkDefaultAdapt$rStdParameterAdapt$StdCopyStrBuf$i32$x, mkDefaultAdapt$rStdParameterAdapt$StdCopyStrBuf$i32$x$2, mkDefaultAdapt$rStdParameterAdapt$StdCopyStrBuf$i32$x$3, mkDefaultAdapt$rStdParameterAdapt$StdStrBuf$i32$StdCopyStrBuf, mkDefaultAdapt$rStdParameterAdapt$StdStrBuf$i32$StdStrBuf, mkDefaultAdapt$rStdParameterAdapt$StdStrBuf$i32$x, mkDefaultAdapt$rStdParameterAdapt$ValidatedStdCopyStrBuf$3$i32$x, mkDefaultAdapt$rStdRuntimeValueAdapt$b$b, mkDefaultAdapt$rStdSTLContainerAdapt$vector$C4KeyCodeEx$vector, mkDefaultAdapt$rStdSTLContainerAdapt$vector$C4MaterialReaction$vector, mkDefaultAdapt$rStdSTLContainerAdapt$vector$ControlDownState$vector, mkDefaultAdapt$rStdSTLContainerAdapt$vector$ControlItem$vector, mkDefaultAdapt$rStdSTLContainerAdapt$vector$KeyComboItem$vector, mkDefaultAdapt$rStdSTLContainerAdapt$vector$i32$vector, mkDefaultAdapt$rStdStdStringAdapt$x, mkDefaultAdapt$rStdStdStringAdapt$x$2, mkDefaultAdapt$rStdStdStringAdapt$x$3, mkDefaultAdapt$rStdStrBuf$StdStrBuf, mkDefaultAdapt$rStdStrBuf$x, mkDefaultAdapt$rStdStrBuf$x$2, mkDefaultAdapt$rStdStrBuf$x$3, mkDefaultAdapt$rStdStrBuf$x$4, mkDefaultAdapt$rStdStringAdapt$pi8, mkDefaultAdapt$rStdStringAdapt$x, mkDefaultAdapt$rStdStringAdapt$x$10, mkDefaultAdapt$rStdStringAdapt$x$11, mkDefaultAdapt$rStdStringAdapt$x$12, mkDefaultAdapt$rStdStringAdapt$x$13, mkDefaultAdapt$rStdStringAdapt$x$2, mkDefaultAdapt$rStdStringAdapt$x$3, mkDefaultAdapt$rStdStringAdapt$x$4, mkDefaultAdapt$rStdStringAdapt$x$5, mkDefaultAdapt$rStdStringAdapt$x$6, mkDefaultAdapt$rStdStringAdapt$x$7, mkDefaultAdapt$rStdStringAdapt$x$8, mkDefaultAdapt$rStdStringAdapt$x$9, mkDefaultAdapt$rValidatedStdCopyStrBuf$10$x, mkDefaultAdapt$rValidatedStdCopyStrBuf$3$x, mkDefaultAdapt$rValidatedStdCopyStrBuf$4$x, mkDefaultAdapt$rb$b, mkDefaultAdapt$ri32$i16, mkDefaultAdapt$ri32$i32, mkDefaultAdapt$ru32$u32, mkDefaultAdapt$ru8$i32, mkEnumAdapt, mkEnumAdapt$2, mkEnumAdapt$3, mkEnumAdaptT, mkEnumAdaptT$2, mkEnumAdaptT$3, mkEnumAdaptT$4, mkEnumAdaptT$5, mkEnumAdaptT$6, mkEnumAdaptT$7, mkEnumAdaptT$8, mkEnumAdaptT$9, mkInsertAdapt$mStdDecompileAdapt$C4PacketBase$ru8$b, mkInsertAdapt$mStdParameterAdapt$C4Object$pC4ValueNumbers$mStdNamingAdapt$C4ValueNumbers$b, mkInsertAdapt$mStdStrBuf$rStdBuf$b, mkIntAdapt$ri32, mkIntAdapt$ri32$2, mkIntAdapt$ri32$3, mkIntAdapt$ri32$4, mkIntAdapt$ru32, mkIntAdapt$ru8, mkIntAdaptT, mkIntAdaptT$10, mkIntAdaptT$11, mkIntAdaptT$12, mkIntAdaptT$13, mkIntAdaptT$14, mkIntAdaptT$15, mkIntAdaptT$16, mkIntAdaptT$17, mkIntAdaptT$18, mkIntAdaptT$19, mkIntAdaptT$2, mkIntAdaptT$20, mkIntAdaptT$21, mkIntAdaptT$3, mkIntAdaptT$4, mkIntAdaptT$5, mkIntAdaptT$6, mkIntAdaptT$7, mkIntAdaptT$8, mkIntAdaptT$9, mkIntPackAdapt$ri32, mkIntPackAdapt$ru32, mkNamingAdapt$mC4DefGraphicsAdapt$pi8, mkNamingAdapt$mC4DefGraphicsAdapt$pi8$rpC4DefGraphics$b$b, mkNamingAdapt$mC4GraphicsOverlayListAdapt$pi8$rpC4GraphicsOverlay$b$b, mkNamingAdapt$mC4NetFilenameAdapt$pi8$x$b$b, mkNamingAdapt$mC4ObjectListDumpHelper$pi8, mkNamingAdapt$mC4StrValAdapt$StdParameterAdapt$StdCopyStrBuf$i32$pi8$StdCopyStrBuf$b$b, mkNamingAdapt$mMatrixAdapt$pi8, mkNamingAdapt$mStdArrayAdapt$C4LSector$StdParameterAdaptMaker$pC4ValueNumbers$pi8, mkNamingAdapt$mStdArrayAdapt$i32$_IdFuncClass$i32$pi8$i32$b$b, mkNamingAdapt$mStdArrayAdapt$i32$_IdFuncClass$i32$pi8$x$b$b, mkNamingAdapt$mStdArrayAdapt$pAccessGfx$StdPtrAdapt$AccessGfx$pi8, mkNamingAdapt$mStdArrayAdapt$pC4ClientPlayerInfos$StdPtrAdapt$C4ClientPlayerInfos$pi8, mkNamingAdapt$mStdArrayAdapt$pC4GameRes$StdPtrAdapt$C4GameRes$pi8, mkNamingAdapt$mStdArrayAdapt$pC4PlayerInfo$StdPtrAdapt$C4PlayerInfo$pi8, mkNamingAdapt$mStdArrayAdapt$pC4RoundResultsPlayer$StdPtrAdapt$C4RoundResultsPlayer$pi8, mkNamingAdapt$mStdArrayAdapt$pC4Team$StdPtrAdapt$C4Team$pi8, mkNamingAdapt$mStdArrayAdapt$pScenario$StdPtrAdapt$Scenario$pi8, mkNamingAdapt$mStdArrayDefaultAdapt$i32$i32$_IdFuncClass$i32$pi8, mkNamingAdapt$mStdArrayDefaultArrayAdapt$i32$pi32$_IdFuncClass$i32$pi8$pi32$b$b, mkNamingAdapt$mStdArrayDefaultArrayAdapt$i32$x$_IdFuncClass$i32$pi8$x$b$b, mkNamingAdapt$mStdArrayDefaultArrayAdapt$i32$x$lambda$pi8$x$b$b, mkNamingAdapt$mStdBitfieldAdapt$i32$pi8$i32$b$b, mkNamingAdapt$mStdBitfieldAdapt$i32$pi8$i32$b$b$2, mkNamingAdapt$mStdBitfieldAdapt$u16$pi8$u32$b$b, mkNamingAdapt$mStdBitfieldAdapt$u32$pi8$u32$b$b, mkNamingAdapt$mStdBitfieldAdapt$u8$pi8$u32$b$b, mkNamingAdapt$mStdCastAdapt$C4Fixed$i32$pi8$C4Fixed$b$b, mkNamingAdapt$mStdCastAdapt$i32$i32$pi8$i32$b$b, mkNamingAdapt$mStdDecompileAdapt$C4RecordChunk$pi8, mkNamingAdapt$mStdEnumAdapt$i32$i32$pi8$i32$b$b, mkNamingAdapt$mStdEnumAdapt$i32$i32$pi8$i32$b$b$2, mkNamingAdapt$mStdEnumAdapt$i32$i32$pi8$i32$b$b$3, mkNamingAdapt$mStdEnumAdapt$i32$u8$pi8, mkNamingAdapt$mStdEnumAdapt$i32$u8$pi8$i32$b$b, mkNamingAdapt$mStdEnumAdapt$i32$u8$pi8$i32$b$b$2, mkNamingAdapt$mStdEnumAdapt$i32$u8$pi8$i32$b$b$3, mkNamingAdapt$mStdEnumAdapt$i32$u8$pi8$i32$b$b$4, mkNamingAdapt$mStdEnumAdapt$i32$u8$pi8$i32$b$b$5, mkNamingAdapt$mStdEnumAdapt$i32$u8$pi8$i32$b$b$6, mkNamingAdapt$mStdInsertAdapt$StdParameterAdapt$C4Object$pC4ValueNumbers$StdNamingAdapt$C4ValueNumbers$pi8, mkNamingAdapt$mStdIntAdapt$i32$i32$pi8, mkNamingAdapt$mStdIntAdapt$i32$i32$pi8$2, mkNamingAdapt$mStdIntAdapt$i32$i32$pi8$i32$b$b, mkNamingAdapt$mStdIntAdapt$i32$i32$pi8$i32$b$b$2, mkNamingAdapt$mStdIntAdapt$i32$u8$pi8, mkNamingAdapt$mStdIntAdapt$i32$u8$pi8$2, mkNamingAdapt$mStdIntAdapt$i32$u8$pi8$i32$b$b, mkNamingAdapt$mStdIntAdapt$i32$u8$pi8$i32$b$b$2, mkNamingAdapt$mStdIntAdapt$i32$u8$pi8$i32$b$b$3, mkNamingAdapt$mStdIntAdapt$i32$u8$pi8$i32$b$b$4, mkNamingAdapt$mStdIntAdapt$i32$u8$pi8$i32$b$b$5, mkNamingAdapt$mStdIntAdapt$i32$u8$pi8$i32$b$b$6, mkNamingAdapt$mStdIntAdapt$i32$u8$pi8$i32$b$b$7, mkNamingAdapt$mStdIntAdapt$u8$i32$pi8, mkNamingAdapt$mStdIntPackAdapt$i32$pi8$i32$b$b, mkNamingAdapt$mStdIntPackAdapt$i32$pi8$i32$b$b$2, mkNamingAdapt$mStdParameter2Adapt$C4AulScriptEngine$b$pC4ValueNumbers$pi8, mkNamingAdapt$mStdParameterAdapt$AttachedMesh$x$pi8, mkNamingAdapt$mStdParameterAdapt$C4Command$pC4ValueNumbers$pi8, mkNamingAdapt$mStdParameterAdapt$C4GameParameters$pC4Scenario$pi8, mkNamingAdapt$mStdParameterAdapt$C4IDList$b$pi8$C4IDList$b$b, mkNamingAdapt$mStdParameterAdapt$C4NotifyingObjectList$pC4ValueNumbers$pi8, mkNamingAdapt$mStdParameterAdapt$C4Object$pC4ValueNumbers$pi8, mkNamingAdapt$mStdParameterAdapt$C4Object$pC4ValueNumbers$pi8$2, mkNamingAdapt$mStdParameterAdapt$C4ObjectList$pC4ValueNumbers$pi8, mkNamingAdapt$mStdParameterAdapt$C4Player$pC4ValueNumbers$pi8, mkNamingAdapt$mStdParameterAdapt$C4Player$pC4ValueNumbers$pi8$2, mkNamingAdapt$mStdParameterAdapt$C4PropList$pC4ValueNumbers$pi8, mkNamingAdapt$mStdParameterAdapt$C4PropListNumbered$pC4ValueNumbers$pi8, mkNamingAdapt$mStdParameterAdapt$C4SGame$b$pi8, mkNamingAdapt$mStdParameterAdapt$C4SHead$b$pi8, mkNamingAdapt$mStdParameterAdapt$C4Value$pC4ValueNumbers$pi8$C4Value$b$b, mkNamingAdapt$mStdParameterAdapt$C4ValueMapData$pC4ValueNumbers$pi8$C4ValueMapData$b$b, mkNamingAdapt$mStdParameterAdapt$C4ValueMapData$pC4ValueNumbers$pi8$C4ValueMapData$b$b$2, mkNamingAdapt$mStdParameterAdapt$StdCopyStrBuf$i32$pi8, mkNamingAdapt$mStdParameterAdapt$StdCopyStrBuf$i32$pi8$StdCopyStrBuf$b$b, mkNamingAdapt$mStdParameterAdapt$StdCopyStrBuf$i32$pi8$x$b$b, mkNamingAdapt$mStdParameterAdapt$StdCopyStrBuf$i32$pi8$x$b$b$2, mkNamingAdapt$mStdParameterAdapt$StdCopyStrBuf$i32$pi8$x$b$b$3, mkNamingAdapt$mStdParameterAdapt$StdDecompileAdapt$StdCopyStrBuf$i32$pi8, mkNamingAdapt$mStdParameterAdapt$StdMeshInstance$x$pi8, mkNamingAdapt$mStdParameterAdapt$StdPtrAdapt$C4Object$pC4ValueNumbers$pi8, mkNamingAdapt$mStdParameterAdapt$StdStrBuf$i32$pi8$StdCopyStrBuf$b$b, mkNamingAdapt$mStdParameterAdapt$StdStrBuf$i32$pi8$StdStrBuf$b$b, mkNamingAdapt$mStdParameterAdapt$StdStrBuf$i32$pi8$x$b$b, mkNamingAdapt$mStdParameterAdapt$ValidatedStdCopyStrBuf$3$i32$pi8$x$b$b, mkNamingAdapt$mStdRuntimeValueAdapt$b$pi8$b$b$b, mkNamingAdapt$mStdSTLContainerAdapt$list$C4RecordChunk$pi8, mkNamingAdapt$mStdSTLContainerAdapt$vector$C4KeyCodeEx$pi8$vector$b$b, mkNamingAdapt$mStdSTLContainerAdapt$vector$C4MaterialReaction$pi8$vector$b$b, mkNamingAdapt$mStdSTLContainerAdapt$vector$ControlDownState$pi8$vector$b$b, mkNamingAdapt$mStdSTLContainerAdapt$vector$ControlItem$pi8$vector$b$b, mkNamingAdapt$mStdSTLContainerAdapt$vector$KeyComboItem$pi8$vector$b$b, mkNamingAdapt$mStdSTLContainerAdapt$vector$Option$pi8, mkNamingAdapt$mStdSTLContainerAdapt$vector$i32$pi8$vector$b$b, mkNamingAdapt$mStdStdStringAdapt$pi8$x$b$b, mkNamingAdapt$mStdStdStringAdapt$pi8$x$b$b$2, mkNamingAdapt$mStdStdStringAdapt$pi8$x$b$b$3, mkNamingAdapt$mStdStringAdapt$pi8$pi8$b$b, mkNamingAdapt$mStdStringAdapt$pi8$x$b$b, mkNamingAdapt$mStdStringAdapt$pi8$x$b$b$10, mkNamingAdapt$mStdStringAdapt$pi8$x$b$b$11, mkNamingAdapt$mStdStringAdapt$pi8$x$b$b$12, mkNamingAdapt$mStdStringAdapt$pi8$x$b$b$13, mkNamingAdapt$mStdStringAdapt$pi8$x$b$b$2, mkNamingAdapt$mStdStringAdapt$pi8$x$b$b$3, mkNamingAdapt$mStdStringAdapt$pi8$x$b$b$4, mkNamingAdapt$mStdStringAdapt$pi8$x$b$b$5, mkNamingAdapt$mStdStringAdapt$pi8$x$b$b$6, mkNamingAdapt$mStdStringAdapt$pi8$x$b$b$7, mkNamingAdapt$mStdStringAdapt$pi8$x$b$b$8, mkNamingAdapt$mStdStringAdapt$pi8$x$b$b$9, mkNamingAdapt$mTransformAdapt$pi8, mkNamingAdapt$mValueProviderAdapt$pi8, mkNamingAdapt$rC4Client$pi8, mkNamingAdapt$rC4ClientCore$pi8, mkNamingAdapt$rC4ClientPlayerInfos$pi8, mkNamingAdapt$rC4ConfigControls$pi8, mkNamingAdapt$rC4ConfigDeveloper$pi8, mkNamingAdapt$rC4ConfigGamepad$pi8, mkNamingAdapt$rC4ConfigGeneral$pi8, mkNamingAdapt$rC4ConfigGraphics$pi8, mkNamingAdapt$rC4ConfigIRC$pi8, mkNamingAdapt$rC4ConfigLobby$pi8, mkNamingAdapt$rC4ConfigNetwork$pi8, mkNamingAdapt$rC4ConfigSecurity$pi8, mkNamingAdapt$rC4ConfigSound$pi8, mkNamingAdapt$rC4ConfigStartup$pi8, mkNamingAdapt$rC4Control$pi8, mkNamingAdapt$rC4Def$pi8, mkNamingAdapt$rC4Fixed$pi8$C4Fixed$b$b, mkNamingAdapt$rC4Fixed$pi8$i32$b$b, mkNamingAdapt$rC4FoWBeam$pi8, mkNamingAdapt$rC4FolderHead$pi8, mkNamingAdapt$rC4GameRes$pi8, mkNamingAdapt$rC4ID$pi8$C4ID$b$b, mkNamingAdapt$rC4IDList$pi8, mkNamingAdapt$rC4IDList$pi8$C4IDList$b$b, mkNamingAdapt$rC4IDPacket$pi8, mkNamingAdapt$rC4KeyEventData$pi8$C4KeyEventData$b$b, mkNamingAdapt$rC4Landscape$pi8, mkNamingAdapt$rC4MapFolderData$pi8, mkNamingAdapt$rC4MusicSystem$pi8, mkNamingAdapt$rC4NameList$pi8$C4NameList$b$b, mkNamingAdapt$rC4Network2Reference$pi8, mkNamingAdapt$rC4Network2ResCore$pi8, mkNamingAdapt$rC4ObjectInfoCore$pi8, mkNamingAdapt$rC4ObjectPtr$pi8, mkNamingAdapt$rC4ObjectPtr$pi8$C4ObjectPtr$b$b, mkNamingAdapt$rC4PacketBase$pi8, mkNamingAdapt$rC4ParticleDefCore$pi8, mkNamingAdapt$rC4Player$HostilitySet$pi8, mkNamingAdapt$rC4PlayerControl$CSync$pi8$C4PlayerControl$CSync$b$b, mkNamingAdapt$rC4PlayerControlAssignmentSets$pi8$C4PlayerControlAssignmentSets$b$b, mkNamingAdapt$rC4PlayerControlDefs$pi8$C4PlayerControlDefs$b$b, mkNamingAdapt$rC4PlayerInfoList$pi8, mkNamingAdapt$rC4Rect$pi8, mkNamingAdapt$rC4Rect$pi8$C4Rect$b$b, mkNamingAdapt$rC4RoundResult$pi8, mkNamingAdapt$rC4RoundResults$pi8, mkNamingAdapt$rC4RoundResultsPlayers$pi8$C4RoundResultsPlayers$b$b, mkNamingAdapt$rC4SAnimals$pi8, mkNamingAdapt$rC4SDefinitions$pi8, mkNamingAdapt$rC4SEnvironment$pi8, mkNamingAdapt$rC4SLandscape$pi8, mkNamingAdapt$rC4SPlrStart$pi8, mkNamingAdapt$rC4SVal$pi8$C4SVal$b$b, mkNamingAdapt$rC4SWeather$pi8, mkNamingAdapt$rC4ScenarioParameters$pi8, mkNamingAdapt$rC4Scoreboard$pi8, mkNamingAdapt$rC4Sky$pi8, mkNamingAdapt$rC4TargetRect$pi8$C4TargetRect$b$b, mkNamingAdapt$rC4TeamList$pi8, mkNamingAdapt$rC4ValueNumbers$pi8, mkNamingAdapt$rC4Weather$pi8, mkNamingAdapt$rStdBuf$pi8, mkNamingAdapt$rStdCopyBuf$pi8, mkNamingAdapt$rStdCopyStrBuf$pi8, mkNamingAdapt$rStdCopyStrBuf$pi8$StdCopyStrBuf$b$b, mkNamingAdapt$rStdCopyStrBuf$pi8$StdStrBuf$b$b, mkNamingAdapt$rStdCopyStrBuf$pi8$x$b$b, mkNamingAdapt$rStdCopyStrBuf$pi8$x$b$b$2, mkNamingAdapt$rStdStrBuf$pi8, mkNamingAdapt$rStdStrBuf$pi8$StdStrBuf$b$b, mkNamingAdapt$rStdStrBuf$pi8$x$b$b, mkNamingAdapt$rStdStrBuf$pi8$x$b$b$2, mkNamingAdapt$rStdStrBuf$pi8$x$b$b$3, mkNamingAdapt$rStdStrBuf$pi8$x$b$b$4, mkNamingAdapt$rStdSubMeshInstance$pi8, mkNamingAdapt$rValidatedStdCopyStrBuf$10$pi8$x$b$b, mkNamingAdapt$rValidatedStdCopyStrBuf$3$pi8$x$b$b, mkNamingAdapt$rValidatedStdCopyStrBuf$4$pi8$x$b$b, mkNamingAdapt$rb$pi8, mkNamingAdapt$rb$pi8$b$b$b, mkNamingAdapt$ri32$pi8, mkNamingAdapt$ri32$pi8$i16$b$b, mkNamingAdapt$ri32$pi8$i32$b$b, mkNamingAdapt$ru32$pi8, mkNamingAdapt$ru32$pi8$u32$b$b, mkNamingAdapt$ru8$pi8$i32$b$b, mkNamingContextPtrAdapt, mkNamingCountAdapt$ri32$pi8, mkNamingCountAdapt$ru32$pi8, mkNamingPtrAdapt$rpC4Command$pi8, mkNamingPtrAdapt$rpC4DrawTransform$pi8, mkNamingPtrAdapt$rpC4Effect$pi8, mkNamingPtrAdapt$rpC4MessageBoardQuery$pi8, mkNamingPtrAdapt$rpStdMeshInstanceAnimationNode$pi8, mkParAdapt$mStdContextPtrAdapt$StdMeshInstance$StdMesh$x, mkParAdapt$mStdDecompileAdapt$C4Command$rpC4ValueNumbers, mkParAdapt$mStdDecompileAdapt$C4Effect$mpC4AulScriptEngine$rpC4ValueNumbers, mkParAdapt$mStdDecompileAdapt$C4Effect$mpC4Object$rpC4ValueNumbers, mkParAdapt$mStdDecompileAdapt$C4Effect$mpC4PropList$rpC4ValueNumbers, mkParAdapt$mStdDecompileAdapt$C4Effect$rpC4PropList$rpC4ValueNumbers, mkParAdapt$mStdDecompileAdapt$C4Object$rpC4ValueNumbers, mkParAdapt$mStdDecompileAdapt$C4PropList$mpC4ValueNumbers, mkParAdapt$mStdDecompileAdapt$C4ValueArray$mpC4ValueNumbers, mkParAdapt$mStdDecompileAdapt$StdCopyStrBuf$mi32, mkParAdapt$mStdDecompileAdapt$StdMeshInstance$x, mkParAdapt$mStdDecompileAdapt$StdMeshInstanceAnimationNode$pStdMesh, mkParAdapt$mStdPtrAdapt$C4Command$rpC4ValueNumbers, mkParAdapt$mStdPtrAdapt$C4Effect$mpC4AulScriptEngine$rpC4ValueNumbers, mkParAdapt$mStdPtrAdapt$C4Effect$mpC4Object$rpC4ValueNumbers, mkParAdapt$mStdPtrAdapt$C4Effect$mpC4PropList$rpC4ValueNumbers, mkParAdapt$mStdPtrAdapt$C4Effect$rpC4PropList$rpC4ValueNumbers, mkParAdapt$mStdPtrAdapt$C4Object$rpC4ValueNumbers, mkParAdapt$mStdPtrAdapt$C4PropList$mpC4ValueNumbers, mkParAdapt$mStdPtrAdapt$C4ValueArray$mpC4ValueNumbers, mkParAdapt$mStdPtrAdapt$StdMeshInstanceAnimationNode$pStdMesh, mkParAdapt$mStdStrBuf$mi32, mkParAdapt$rC4AulScriptEngine$mb$rpC4ValueNumbers, mkParAdapt$rC4Command$rpC4ValueNumbers, mkParAdapt$rC4ConfigGamepad$mb, mkParAdapt$rC4Effect$mpC4AulScriptEngine$rpC4ValueNumbers, mkParAdapt$rC4Effect$mpC4Object$rpC4ValueNumbers, mkParAdapt$rC4Effect$mpC4PropList$rpC4ValueNumbers, mkParAdapt$rC4Effect$rpC4PropList$rpC4ValueNumbers, mkParAdapt$rC4Game$mC4Game$CompileSettings$rpC4ValueNumbers, mkParAdapt$rC4Game$rC4Game$CompileSettings$rpC4ValueNumbers, mkParAdapt$rC4GameObjects$mb$rpC4ValueNumbers, mkParAdapt$rC4GameParameters$rpC4Scenario, mkParAdapt$rC4IDList$mb, mkParAdapt$rC4KeyCodeEx$mpStdCopyStrBuf, mkParAdapt$rC4NotifyingObjectList$rpC4ValueNumbers, mkParAdapt$rC4Object$mpC4ValueNumbers, mkParAdapt$rC4Object$rpC4ValueNumbers, mkParAdapt$rC4ObjectList$rpC4ValueNumbers, mkParAdapt$rC4Player$mpC4ValueNumbers, mkParAdapt$rC4Player$rpC4ValueNumbers, mkParAdapt$rC4PropList$mpC4ValueNumbers, mkParAdapt$rC4PropList$rpC4ValueNumbers, mkParAdapt$rC4PropListNumbered$rpC4ValueNumbers, mkParAdapt$rC4Property$rpC4ValueNumbers, mkParAdapt$rC4SGame$rb, mkParAdapt$rC4SHead$rb, mkParAdapt$rC4Scenario$mb, mkParAdapt$rC4Scenario$rb, mkParAdapt$rC4Set$C4Property$rpC4ValueNumbers, mkParAdapt$rC4Shape$mpC4Shape, mkParAdapt$rC4Value$rpC4ValueNumbers, mkParAdapt$rC4ValueArray$mpC4ValueNumbers, mkParAdapt$rC4ValueMapData$mpC4ValueNumbers, mkParAdapt$rC4ValueMapData$rpC4ValueNumbers, mkParAdapt$rStdCopyStrBuf$mi32, mkParAdapt$rStdCopyStrBuf$ri32, mkParAdapt$rStdMeshInstance$AttachedMesh$Denumerator$mpAttachedMesh, mkParAdapt$rStdMeshInstance$AttachedMesh$x, mkParAdapt$rStdMeshInstance$x, mkParAdapt$rStdMeshInstanceAnimationNode$pStdMesh, mkParAdapt$rStdStrBuf$mi32, mkParAdapt$rValidatedStdCopyStrBuf$3$mi32, mkParAdaptMaker$mpC4ValueNumbers, mkParAdaptMaker$rpC4ValueNumbers, mkPtrAdapt$rpAccessGfx$b, mkPtrAdapt$rpC4ClientPlayerInfos$b, mkPtrAdapt$rpC4Control$b, mkPtrAdapt$rpC4Effect$b, mkPtrAdapt$rpC4GameRes$b, mkPtrAdapt$rpC4IDPacket$b, mkPtrAdapt$rpC4Network2ResCore$b, mkPtrAdapt$rpC4Object$b, mkPtrAdapt$rpC4PktDebugRec$b, mkPtrAdapt$rpC4PlayerInfo$b, mkPtrAdapt$rpC4PropList$b, mkPtrAdapt$rpC4RoundResultsPlayer$b, mkPtrAdapt$rpC4Team$b, mkPtrAdapt$rpC4ValueArray$b, mkPtrAdapt$rpScenario$b, mkPtrAdapt$rpStdBuf$b, mkPtrAdaptNoNull$rpAccessGfx, mkPtrAdaptNoNull$rpC4ClientPlayerInfos, mkPtrAdaptNoNull$rpC4Control, mkPtrAdaptNoNull$rpC4Effect, mkPtrAdaptNoNull$rpC4GameRes, mkPtrAdaptNoNull$rpC4IDPacket, mkPtrAdaptNoNull$rpC4Network2ResCore, mkPtrAdaptNoNull$rpC4Object, mkPtrAdaptNoNull$rpC4PktDebugRec, mkPtrAdaptNoNull$rpC4PlayerInfo, mkPtrAdaptNoNull$rpC4PropList, mkPtrAdaptNoNull$rpC4RoundResultsPlayer, mkPtrAdaptNoNull$rpC4Team, mkPtrAdaptNoNull$rpC4ValueArray, mkPtrAdaptNoNull$rpScenario, mkPtrAdaptNoNull$rpStdBuf, mkRuntimeValueAdapt, mkSTLContainerAdapt$rlist$i32, mkSTLContainerAdapt$rlist$i32$2, mkSTLContainerAdapt$rlist$i32$3, mkSTLContainerAdapt$rvector$i32, mkSTLContainerAdapt$rvector$i32$10, mkSTLContainerAdapt$rvector$i32$2, mkSTLContainerAdapt$rvector$i32$3, mkSTLContainerAdapt$rvector$i32$4, mkSTLContainerAdapt$rvector$i32$5, mkSTLContainerAdapt$rvector$i32$6, mkSTLContainerAdapt$rvector$i32$7, mkSTLContainerAdapt$rvector$i32$8, mkSTLContainerAdapt$rvector$i32$9, mkStringAdapt$pi8$i32$i32, mkStringAdaptA, mkStringAdaptM, mkStringAdaptMA, mkStringAdaptMA$2, mkStringAdaptMA$3, mkStringAdaptMA$4, mkStringAdaptMA$5, mkStringAdaptMA$6, mkStringAdaptMA$7, mkStringAdaptMIE });
