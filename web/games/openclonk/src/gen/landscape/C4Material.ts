// @ts-nocheck
// OpenClonk 36de799: src/landscape/C4Material.cpp, src/landscape/C4Material.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $u64n } from '../../rt/int.ts';
import { Random } from '../../rt/native.ts';
import { $oadd, $oarr, $oat, $oidx, $own, $rd, $wr, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete, $min } from '../../rt/std.ts';

export class ReactionFuncMapEntry {
  szRFName = null;
  pFunc = null;

  $clone() { return new ReactionFuncMapEntry().$assign(this); }
  $assign(o) {
    this.szRFName = o.szRFName;
    this.pFunc = o.pFunc;
    return this;
  }
}

export class C4MaterialReaction {
  pFunc = null;
  fUserDefined = true;
  TargetSpec = new $.StdCopyStrBuf();
  ScriptFunc = new $.StdCopyStrBuf();
  pScriptFunc = null;
  iExecMask = 0;
  fReverse = false;
  fInverseSpec = false;
  fInsertionCheck = true;
  iDepth = 0;
  sConvertMat = new $.StdCopyStrBuf();
  iConvertMat = -1;
  iCorrosionRate = 100;

  static NoReaction(_pReaction, _iX, _iY, _iLSPosX, _iLSPosY, _fXDir, _fYDir, _iPxsMat, _iLsMat, _evEvent, _pfPosChanged) {
    return false;
  }

  init$x(pFunc) {
    this.pFunc = pFunc;
    this.fUserDefined = false;
    this.TargetSpec = new $.StdCopyStrBuf();
    this.ScriptFunc = new $.StdCopyStrBuf();
    this.pScriptFunc = null;
    this.iExecMask = 0xffffffff;
    this.fReverse = false;
    this.fInverseSpec = false;
    this.fInsertionCheck = true;
    this.iDepth = 0;
    this.sConvertMat = new $.StdCopyStrBuf();
    this.iConvertMat = -1;
    this.iCorrosionRate = 100;
    return this;
  }

  init$v() {
    this.pFunc = C4MaterialReaction.NoReaction;
    this.fUserDefined = true;
    this.TargetSpec = new $.StdCopyStrBuf();
    this.ScriptFunc = new $.StdCopyStrBuf();
    this.pScriptFunc = null;
    this.iExecMask = 0xffffffff;
    this.fReverse = false;
    this.fInverseSpec = false;
    this.fInsertionCheck = true;
    this.iDepth = 0;
    this.sConvertMat = new $.StdCopyStrBuf();
    this.iConvertMat = -1;
    this.iCorrosionRate = 100;
    return this;
  }

  CompileFunc(pComp) {
    if (pComp.isDeserializer()) {
      this.pScriptFunc = null;
    }
    let sReactionFuncName = new $.StdStrBuf();
    let i = 0;
    while ($.ReactionFuncMap$C4Material[i].szRFName != null && $.ReactionFuncMap$C4Material[i].pFunc !== this.pFunc) {
      i = i + 1 | 0;
    }
    $.StdStrBuf.prototype.op_assign$pi8.call(sReactionFuncName, $.ReactionFuncMap$C4Material[i].szRFName);
    pComp.Value$StdNamingDefaultAdapt$StdParameterAdapt$StdStrBuf$i32$StdCopyStrBuf($.mkNamingAdapt$mStdParameterAdapt$StdStrBuf$i32$pi8$StdCopyStrBuf$b$b($.mkParAdapt$rStdStrBuf$mi32(sReactionFuncName, 3 /*RCT_IdtfAllowEmpty*/), S("Type"), new $.StdCopyStrBuf()));
    i = 0;
    while ($.ReactionFuncMap$C4Material[i].szRFName != null && !$.SEqual($.ReactionFuncMap$C4Material[i].szRFName, sReactionFuncName.getData())) {
      i = i + 1 | 0;
    }
    this.pFunc = $.ReactionFuncMap$C4Material[i].pFunc;
    pComp.Value$StdNamingDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$StdCopyStrBuf($.mkNamingAdapt$mStdParameterAdapt$StdCopyStrBuf$i32$pi8$StdCopyStrBuf$b$b($.mkParAdapt$rStdCopyStrBuf$mi32(this.TargetSpec, 1 /*RCT_All*/), S("TargetSpec"), new $.StdCopyStrBuf()));
    pComp.Value$StdNamingDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$StdCopyStrBuf($.mkNamingAdapt$mStdParameterAdapt$StdCopyStrBuf$i32$pi8$StdCopyStrBuf$b$b($.mkParAdapt$rStdCopyStrBuf$mi32(this.ScriptFunc, 3 /*RCT_IdtfAllowEmpty*/), S("ScriptFunc"), new $.StdCopyStrBuf()));
    pComp.Value$StdNamingDefaultAdapt$u32$u32($.mkNamingAdapt$ru32$pi8$u32$b$b(P(this, "iExecMask"), S("ExecMask"), 0xffffffff));
    pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "fReverse"), S("Reverse"), false));
    pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "fInverseSpec"), S("InverseSpec"), false));
    pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "fInsertionCheck"), S("CheckSlide"), true));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "iDepth"), S("Depth"), 0));
    pComp.Value$StdNamingDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$StdCopyStrBuf($.mkNamingAdapt$mStdParameterAdapt$StdCopyStrBuf$i32$pi8$StdCopyStrBuf$b$b($.mkParAdapt$rStdCopyStrBuf$mi32(this.sConvertMat, 3 /*RCT_IdtfAllowEmpty*/), S("ConvertMat"), new $.StdCopyStrBuf()));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "iCorrosionRate"), S("CorrosionRate"), 100));
  }

  ResolveScriptFuncs(szMatName) {
    if (this.pFunc === C4MaterialMap.mrfScript) {
      this.pScriptFunc = $.ScriptEngine.GetPropList().GetFunc$pi8(this.ScriptFunc.getData());
      if (this.pScriptFunc == null) {
        $.DebugLogF(S("Error getting function \"%s\" for Material reaction of \"%s\""), this.ScriptFunc.getData(), szMatName);
      }
    } else {
      this.pScriptFunc = null;
    }
  }

  op_eq(_rCmp) {
    return false;
  }

  $clone() { return new C4MaterialReaction().$assign(this); }
  $assign(o) {
    this.pFunc = o.pFunc;
    this.fUserDefined = o.fUserDefined;
    this.TargetSpec.$assign(o.TargetSpec);
    this.ScriptFunc.$assign(o.ScriptFunc);
    this.pScriptFunc = o.pScriptFunc;
    this.iExecMask = o.iExecMask;
    this.fReverse = o.fReverse;
    this.fInverseSpec = o.fInverseSpec;
    this.fInsertionCheck = o.fInsertionCheck;
    this.iDepth = o.iDepth;
    this.sConvertMat.$assign(o.sConvertMat);
    this.iConvertMat = o.iConvertMat;
    this.iCorrosionRate = o.iCorrosionRate;
    return this;
  }
}

export class C4MaterialCore {
  CustomReactionList = [];
  Name = new Int8Array(16);
  MapChunkType = 0;
  Density = 0;
  Friction = 0;
  DigFree = 0;
  BlastFree = 0;
  Dig2Object = new $.C4ID().init$v();
  Dig2ObjectRatio = 0;
  Dig2ObjectCollect = 0;
  Blast2Object = new $.C4ID().init$v();
  Blast2ObjectRatio = 0;
  Blast2PXSRatio = 0;
  Instable = 0;
  MaxAirSpeed = 0;
  MaxSlide = 0;
  WindDrift = 0;
  Inflammable = 0;
  Incendiary = 0;
  Extinguisher = 0;
  Corrosive = 0;
  Corrode = 0;
  Soil = 0;
  Placement = 0;
  Light = 0;
  sTextureOverlay = new $.StdCopyStrBuf();
  OverlayType = 0;
  sPXSGfx = new $.StdCopyStrBuf();
  PXSGfxRt = new $.C4TargetRect();
  PXSGfxSize = 0;
  sBlastShiftTo = new $.StdCopyStrBuf();
  sInMatConvert = new $.StdCopyStrBuf();
  sInMatConvertTo = new $.StdCopyStrBuf();
  InMatConvertDepth = 0;
  BelowTempConvert = 0;
  BelowTempConvertDir = 0;
  sBelowTempConvertTo = new $.StdCopyStrBuf();
  AboveTempConvert = 0;
  AboveTempConvertDir = 0;
  sAboveTempConvertTo = new $.StdCopyStrBuf();
  TempConvStrength = 0;
  MinHeightCount = 0;
  SplashRate = 0;
  KeepSinglePixels = false;
  AnimationSpeed = 0;
  LightAngle = 0;
  LightEmit = new Int32Array(3);
  LightSpot = new Int32Array(3);
  MinShapeOverlap = 0;

  init() {
    this.CustomReactionList = [];
    this.Dig2Object = new $.C4ID().init$v();
    this.Blast2Object = new $.C4ID().init$v();
    this.sTextureOverlay = new $.StdCopyStrBuf();
    this.sPXSGfx = new $.StdCopyStrBuf();
    this.PXSGfxRt = new $.C4TargetRect();
    this.sBlastShiftTo = new $.StdCopyStrBuf();
    this.sInMatConvert = new $.StdCopyStrBuf();
    this.sInMatConvertTo = new $.StdCopyStrBuf();
    this.sBelowTempConvertTo = new $.StdCopyStrBuf();
    this.sAboveTempConvertTo = new $.StdCopyStrBuf();
    C4MaterialCore.prototype.Clear.call(this);
    return this;
  }

  $dtor() {
    C4MaterialCore.prototype.Clear.call(this);
  }

  Clear() {
    this.CustomReactionList.length = 0;
    this.sTextureOverlay.Clear();
    this.sPXSGfx.Clear();
    this.sBlastShiftTo.Clear();
    this.sInMatConvert.Clear();
    this.sInMatConvertTo.Clear();
    this.sBelowTempConvertTo.Clear();
    this.sAboveTempConvertTo.Clear();
    $wr(P(this.Name, 0), 0, 0);
    this.MapChunkType = 0 /*C4M_Flat*/;
    this.Density = 0;
    this.Friction = 0;
    this.DigFree = 0;
    this.BlastFree = 0;
    this.Dig2Object.$assign($.C4ID.None);
    this.Dig2ObjectRatio = 0;
    this.Dig2ObjectCollect = 0;
    this.Blast2Object.$assign($.C4ID.None);
    this.Blast2ObjectRatio = 0;
    this.Blast2PXSRatio = 0;
    this.Instable = 0;
    this.MaxAirSpeed = 0;
    this.MaxSlide = 0;
    this.WindDrift = 0;
    this.Inflammable = 0;
    this.Incendiary = 0;
    this.Extinguisher = 0;
    this.Corrosive = 0;
    this.Corrode = 0;
    this.Soil = 0;
    this.Placement = 0;
    this.Light = 0;
    this.OverlayType = 0;
    this.PXSGfxRt.Default();
    this.PXSGfxSize = 0;
    this.InMatConvertDepth = 0;
    this.BelowTempConvert = 0;
    this.BelowTempConvertDir = 0;
    this.AboveTempConvert = 0;
    this.AboveTempConvertDir = 0;
    this.TempConvStrength = 0;
    this.MinHeightCount = 0;
    this.SplashRate = 10;
    this.KeepSinglePixels = false;
    this.AnimationSpeed = 20;
    this.LightAngle = 255;
    for (let i = 0; i < 3; i = i + 1 | 0) {
      this.LightEmit[i] = 0;
      this.LightSpot[i] = 16;
    }
    this.MinShapeOverlap = 25;
  }

  Default() {
    this.Clear();
  }

  Load(hGroup, szEntryName) {
    let Source = new $.StdStrBuf();
    if (!hGroup.LoadEntryString$pi8$pStdStrBuf(szEntryName, Source)) {
      return false;
    }
    let Name = hGroup.GetFullName().op_add$pi8(S("/")).op_add$pi8(szEntryName);
    if (!$.CompileFromBuf_LogWarn$rC4MaterialCore$x$pi8(this, Source, Name.getData())) {
      return false;
    }
    if (this.Placement === 0) {
      if ($.DensitySolid(this.Density)) {
        this.Placement = 30;
        if (this.DigFree === 0) {
          this.Placement = this.Placement + 20 | 0;
        }
        if (this.BlastFree === 0) {
          this.Placement = this.Placement + 10 | 0;
        }
      } else if ($.DensityLiquid(this.Density)) {
        this.Placement = 10;
      } else {
        this.Placement = 5;
      }
    }
    return true;
  }

  CompileFunc(pComp) {
    0;
    if (pComp.isDeserializer()) {
      this.Clear();
    }
    pComp.Name(S("Material"));
    pComp.Value$StdNamingDefaultAdapt$StdStringAdapt$x$5($.mkNamingAdapt$mStdStringAdapt$pi8$x$b$b$5($.mkStringAdaptMA(this.Name), S("Name"), S("")));
    const Shapes = $own([
  ((($o) => ($o.Name = S("Flat"), $o.Val = 0 /*C4M_Flat*/, $o))(new $.StdEnumEntry$i32$3())),
  ((($o) => ($o.Name = S("TopFlat"), $o.Val = 1 /*C4M_TopFlat*/, $o))(new $.StdEnumEntry$i32$3())),
  ((($o) => ($o.Name = S("Smooth"), $o.Val = 2 /*C4M_Smooth*/, $o))(new $.StdEnumEntry$i32$3())),
  ((($o) => ($o.Name = S("Rough"), $o.Val = 3 /*C4M_Rough*/, $o))(new $.StdEnumEntry$i32$3())),
  ((($o) => ($o.Name = S("Octagon"), $o.Val = 4 /*C4M_Octagon*/, $o))(new $.StdEnumEntry$i32$3())),
  ((($o) => ($o.Name = S("Smoother"), $o.Val = 5 /*C4M_Smoother*/, $o))(new $.StdEnumEntry$i32$3())),
  ((($o) => ($o.Name = null, $o.Val = 0 /*C4M_Flat*/, $o))(new $.StdEnumEntry$i32$3())),
]);
    pComp.Value$StdNamingDefaultAdapt$StdEnumAdapt$i32$u8$i32$2($.mkNamingAdapt$mStdEnumAdapt$i32$u8$pi8$i32$b$b$2($.mkEnumAdaptT$3(P(this, "MapChunkType"), $oat(Shapes, 0)), S("Shape"), 0 /*C4M_Flat*/));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Density"), S("Density"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Friction"), S("Friction"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "DigFree"), S("DigFree"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "BlastFree"), S("BlastFree"), 0));
    pComp.Value$StdNamingDefaultAdapt$C4ID$C4ID($.mkNamingAdapt$rC4ID$pi8$C4ID$b$b(this.Blast2Object, S("Blast2Object"), $.C4ID.None));
    pComp.Value$StdNamingDefaultAdapt$C4ID$C4ID($.mkNamingAdapt$rC4ID$pi8$C4ID$b$b(this.Dig2Object, S("Dig2Object"), $.C4ID.None));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Dig2ObjectRatio"), S("Dig2ObjectRatio"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Dig2ObjectCollect"), S("Dig2ObjectCollect"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Blast2ObjectRatio"), S("Blast2ObjectRatio"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Blast2PXSRatio"), S("Blast2PXSRatio"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Instable"), S("Instable"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "MaxAirSpeed"), S("MaxAirSpeed"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "MaxSlide"), S("MaxSlide"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "WindDrift"), S("WindDrift"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Inflammable"), S("Inflammable"), 0));
    if (pComp.isDeserializer()) {
      try {
        pComp.Value$StdNamingAdapt$i32($.mkNamingAdapt$ri32$pi8(P(this, "Incendiary"), S("Incendiary")));
      } catch ($e2) {
        if ($e2 instanceof $.StdCompiler$NotFoundException) {
          const ex = $e2;
          $delete(ex);
          pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Incendiary"), S("Incindiary"), 0));
        } else {
          throw $e2;
        }
      }
    } else {
      pComp.Value$StdNamingAdapt$i32($.mkNamingAdapt$ri32$pi8(P(this, "Incendiary"), S("Incendiary")));
      pComp.Value$StdNamingAdapt$i32($.mkNamingAdapt$ri32$pi8(P(this, "Incendiary"), S("Incindiary")));
    }
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Corrode"), S("Corrode"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Corrosive"), S("Corrosive"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Extinguisher"), S("Extinguisher"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Soil"), S("Soil"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Placement"), S("Placement"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Light"), S("Light"), 0));
    pComp.Value$StdNamingDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$x$2($.mkNamingAdapt$mStdParameterAdapt$StdCopyStrBuf$i32$pi8$x$b$b$2($.mkParAdapt$rStdCopyStrBuf$mi32(this.sTextureOverlay, 3 /*RCT_IdtfAllowEmpty*/), S("TextureOverlay"), S("")));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "OverlayType"), S("OverlayType"), 0));
    pComp.Value$StdNamingDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$x$2($.mkNamingAdapt$mStdParameterAdapt$StdCopyStrBuf$i32$pi8$x$b$b$2($.mkParAdapt$rStdCopyStrBuf$mi32(this.sPXSGfx, 3 /*RCT_IdtfAllowEmpty*/), S("PXSGfx"), S("")));
    pComp.Value$StdNamingDefaultAdapt$C4TargetRect$C4TargetRect($.mkNamingAdapt$rC4TargetRect$pi8$C4TargetRect$b$b(this.PXSGfxRt, S("PXSGfxRt"), $.TargetRect0$C4Rect));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "PXSGfxSize"), S("PXSGfxSize"), this.PXSGfxRt.Wdt));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "TempConvStrength"), S("TempConvStrength"), 0));
    pComp.Value$StdNamingDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$x$2($.mkNamingAdapt$mStdParameterAdapt$StdCopyStrBuf$i32$pi8$x$b$b$2($.mkParAdapt$rStdCopyStrBuf$mi32(this.sBlastShiftTo, 3 /*RCT_IdtfAllowEmpty*/), S("BlastShiftTo"), S("")));
    pComp.Value$StdNamingDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$x$2($.mkNamingAdapt$mStdParameterAdapt$StdCopyStrBuf$i32$pi8$x$b$b$2($.mkParAdapt$rStdCopyStrBuf$mi32(this.sInMatConvert, 3 /*RCT_IdtfAllowEmpty*/), S("InMatConvert"), S("")));
    pComp.Value$StdNamingDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$x$2($.mkNamingAdapt$mStdParameterAdapt$StdCopyStrBuf$i32$pi8$x$b$b$2($.mkParAdapt$rStdCopyStrBuf$mi32(this.sInMatConvertTo, 3 /*RCT_IdtfAllowEmpty*/), S("InMatConvertTo"), S("")));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "InMatConvertDepth"), S("InMatConvertDepth"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "AboveTempConvert"), S("AboveTempConvert"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "AboveTempConvertDir"), S("AboveTempConvertDir"), 0));
    pComp.Value$StdNamingDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$x$2($.mkNamingAdapt$mStdParameterAdapt$StdCopyStrBuf$i32$pi8$x$b$b$2($.mkParAdapt$rStdCopyStrBuf$mi32(this.sAboveTempConvertTo, 3 /*RCT_IdtfAllowEmpty*/), S("AboveTempConvertTo"), S("")));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "BelowTempConvert"), S("BelowTempConvert"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "BelowTempConvertDir"), S("BelowTempConvertDir"), 0));
    pComp.Value$StdNamingDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$x$2($.mkNamingAdapt$mStdParameterAdapt$StdCopyStrBuf$i32$pi8$x$b$b$2($.mkParAdapt$rStdCopyStrBuf$mi32(this.sBelowTempConvertTo, 3 /*RCT_IdtfAllowEmpty*/), S("BelowTempConvertTo"), S("")));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "MinHeightCount"), S("MinHeightCount"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "SplashRate"), S("SplashRate"), 10));
    pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "KeepSinglePixels"), S("KeepSinglePixels"), false));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "AnimationSpeed"), S("AnimationSpeed"), 100));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "LightAngle"), S("LightAngle"), 255));
    pComp.Value$StdNamingAdapt$StdArrayDefaultAdapt$i32$i32$_IdFuncClass$i32($.mkNamingAdapt$mStdArrayDefaultAdapt$i32$i32$_IdFuncClass$i32$pi8($.mkArrayAdaptDM$2(this.LightEmit, 0), S("LightEmit")));
    pComp.Value$StdNamingAdapt$StdArrayDefaultAdapt$i32$i32$_IdFuncClass$i32($.mkNamingAdapt$mStdArrayDefaultAdapt$i32$i32$_IdFuncClass$i32$pi8($.mkArrayAdaptDM$2(this.LightSpot, 16), S("LightSpot")));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "MinShapeOverlap"), S("MinShapeOverlap"), 25));
    pComp.NameEnd();
    pComp.Value$StdNamingDefaultAdapt$StdSTLContainerAdapt$vector$C4MaterialReaction$vector$C4MaterialReaction($.mkNamingAdapt$mStdSTLContainerAdapt$vector$C4MaterialReaction$pi8$vector$b$b($.mkSTLContainerAdapt$rvector$i32$2(this.CustomReactionList), S("Reaction"), []));
  }

  $clone() { return new C4MaterialCore().$assign(this); }
  $assign(o) {
    this.CustomReactionList = o.CustomReactionList.slice();
    this.Name = o.Name.slice();
    this.MapChunkType = o.MapChunkType;
    this.Density = o.Density;
    this.Friction = o.Friction;
    this.DigFree = o.DigFree;
    this.BlastFree = o.BlastFree;
    this.Dig2Object.$assign(o.Dig2Object);
    this.Dig2ObjectRatio = o.Dig2ObjectRatio;
    this.Dig2ObjectCollect = o.Dig2ObjectCollect;
    this.Blast2Object.$assign(o.Blast2Object);
    this.Blast2ObjectRatio = o.Blast2ObjectRatio;
    this.Blast2PXSRatio = o.Blast2PXSRatio;
    this.Instable = o.Instable;
    this.MaxAirSpeed = o.MaxAirSpeed;
    this.MaxSlide = o.MaxSlide;
    this.WindDrift = o.WindDrift;
    this.Inflammable = o.Inflammable;
    this.Incendiary = o.Incendiary;
    this.Extinguisher = o.Extinguisher;
    this.Corrosive = o.Corrosive;
    this.Corrode = o.Corrode;
    this.Soil = o.Soil;
    this.Placement = o.Placement;
    this.Light = o.Light;
    this.sTextureOverlay.$assign(o.sTextureOverlay);
    this.OverlayType = o.OverlayType;
    this.sPXSGfx.$assign(o.sPXSGfx);
    this.PXSGfxRt.$assign(o.PXSGfxRt);
    this.PXSGfxSize = o.PXSGfxSize;
    this.sBlastShiftTo.$assign(o.sBlastShiftTo);
    this.sInMatConvert.$assign(o.sInMatConvert);
    this.sInMatConvertTo.$assign(o.sInMatConvertTo);
    this.InMatConvertDepth = o.InMatConvertDepth;
    this.BelowTempConvert = o.BelowTempConvert;
    this.BelowTempConvertDir = o.BelowTempConvertDir;
    this.sBelowTempConvertTo.$assign(o.sBelowTempConvertTo);
    this.AboveTempConvert = o.AboveTempConvert;
    this.AboveTempConvertDir = o.AboveTempConvertDir;
    this.sAboveTempConvertTo.$assign(o.sAboveTempConvertTo);
    this.TempConvStrength = o.TempConvStrength;
    this.MinHeightCount = o.MinHeightCount;
    this.SplashRate = o.SplashRate;
    this.KeepSinglePixels = o.KeepSinglePixels;
    this.AnimationSpeed = o.AnimationSpeed;
    this.LightAngle = o.LightAngle;
    this.LightEmit = o.LightEmit.slice();
    this.LightSpot = o.LightSpot.slice();
    this.MinShapeOverlap = o.MinShapeOverlap;
    return this;
  }
}

export class C4MaterialMap {
  Num = 0;
  Map = null;
  ppReactionMap = null;
  max_shape_width = 0;
  max_shape_height = 0;
  DefReactConvert = new C4MaterialReaction().init$v();
  DefReactPoof = new C4MaterialReaction().init$v();
  DefReactCorrode = new C4MaterialReaction().init$v();
  DefReactIncinerate = new C4MaterialReaction().init$v();
  DefReactInsert = new C4MaterialReaction().init$v();

  init() {
    this.DefReactConvert = new C4MaterialReaction().init$x(C4MaterialMap.mrfConvert);
    this.DefReactPoof = new C4MaterialReaction().init$x(C4MaterialMap.mrfPoof);
    this.DefReactCorrode = new C4MaterialReaction().init$x(C4MaterialMap.mrfCorrode);
    this.DefReactIncinerate = new C4MaterialReaction().init$x(C4MaterialMap.mrfIncinerate);
    this.DefReactInsert = new C4MaterialReaction().init$x(C4MaterialMap.mrfInsert);
    C4MaterialMap.prototype.Default.call(this);
    return this;
  }

  $dtor() {
    C4MaterialMap.prototype.Clear.call(this);
  }

  static mrfConvert(pReaction, iX, iY, iLSPosX, iLSPosY, fXDir, fYDir, iPxsMat, iLsMat, evEvent, pfPosChanged) {
    if (pReaction.fUserDefined) {
      if (!mrfUserCheck(pReaction, iX, iY, iLSPosX, iLSPosY, fXDir, fYDir, iPxsMat, iLsMat, evEvent, pfPosChanged)) {
        return false;
      }
    }
    switch (evEvent) {
      case 1:
        if (!pReaction.fUserDefined) {
          break;
        }
      case 0:
        {
          let iDepth = pReaction.fUserDefined ? pReaction.iDepth : $oidx($.MaterialMap.Map, iPxsMat.a[iPxsMat.o]).InMatConvertDepth;
          if (iDepth === 0 || $.GBackMat(iX.a[iX.o], iY.a[iY.o] - iDepth | 0) === iLsMat) {
            iPxsMat.a[iPxsMat.o] = pReaction.fUserDefined ? pReaction.iConvertMat : $oidx($.MaterialMap.Map, iPxsMat.a[iPxsMat.o]).InMatConvertTo;
            if (!MatValid(iPxsMat.a[iPxsMat.o])) {
              return true;
            }
            fXDir.$assign(fYDir.op_assign(0));
            if (pfPosChanged != null) {
              pfPosChanged.a[pfPosChanged.o] = true;
            }
          }
        }
        break;
      case 2:
        $.PXS.Create(iPxsMat.a[iPxsMat.o], $.itofix$i32(iX.a[iX.o]), $.itofix$i32(iY.a[iY.o]));
        return true;
    }
    return false;
  }

  static mrfPoof(pReaction, iX, iY, iLSPosX, iLSPosY, fXDir, fYDir, iPxsMat, iLsMat, evEvent, pfPosChanged) {
    if (pReaction.fUserDefined) {
      if (!mrfUserCheck(pReaction, iX, iY, iLSPosX, iLSPosY, fXDir, fYDir, iPxsMat, iLsMat, evEvent, pfPosChanged)) {
        return false;
      }
    }
    switch (evEvent) {
      case 2:
      case 0:
        $.Landscape.ExtractMaterial(iLSPosX, iLSPosY, false);
        if (!(Random(3) !== 0)) {
          Smoke(iX.a[iX.o], iY.a[iY.o], 3);
        }
        if (!(Random(3) !== 0)) {
          $.StartSoundEffectAt(S("Liquids::Pshshsh"), iX.a[iX.o], iY.a[iY.o]);
        }
        return true;
      case 1:
        if (!pReaction.fUserDefined) {
          if (!mrfInsertCheck(iX, iY, fXDir, fYDir, iPxsMat, iLsMat, pfPosChanged, true)) {
            return false;
          }
        }
        $.Landscape.ExtractMaterial(iLSPosX, iLSPosY, false);
        if (!(Random(3) !== 0)) {
          Smoke(iX.a[iX.o], iY.a[iY.o], 3);
        }
        if (!(Random(3) !== 0)) {
          $.StartSoundEffectAt(S("Liquids::Pshshsh"), iX.a[iX.o], iY.a[iY.o]);
        }
        return true;
    }
    return false;
  }

  static mrfCorrode(pReaction, iX, iY, iLSPosX, iLSPosY, fXDir, fYDir, iPxsMat, iLsMat, evEvent, pfPosChanged) {
    if (pReaction.fUserDefined) {
      if (!mrfUserCheck(pReaction, iX, iY, iLSPosX, iLSPosY, fXDir, fYDir, iPxsMat, iLsMat, evEvent, pfPosChanged)) {
        return false;
      }
    }
    switch (evEvent) {
      case 0:
        break;
      case 2:
        {
          let fDoCorrode = false;
          let d100 = Random(100) | 0;
          if (pReaction.fUserDefined) {
            fDoCorrode = d100 < pReaction.iCorrosionRate;
          } else {
            fDoCorrode = d100 < $oidx($.MaterialMap.Map, iPxsMat.a[iPxsMat.o]).Corrosive && d100 < $oidx($.MaterialMap.Map, iLsMat).Corrode;
          }
          if (fDoCorrode) {
            $.Landscape.ClearPix(iLSPosX, iLSPosY);
            if (!(Random(5) !== 0)) {
              Smoke(iX.a[iX.o], iY.a[iY.o], 3 + Random(3) >>> 0 | 0);
            }
            if (!(Random(20) !== 0)) {
              $.StartSoundEffectAt(S("Liquids::Corrode"), iX.a[iX.o], iY.a[iY.o]);
            }
            return true;
          }
        }
        break;
      case 1:
        {
          if (!pReaction.fUserDefined) {
            if (!mrfInsertCheck(iX, iY, fXDir, fYDir, iPxsMat, iLsMat, pfPosChanged)) {
              return false;
            }
          }
          let fDoCorrode = false;
          let d100 = Random(100) | 0;
          if (pReaction.fUserDefined) {
            fDoCorrode = d100 < pReaction.iCorrosionRate;
          } else {
            fDoCorrode = d100 < $oidx($.MaterialMap.Map, iPxsMat.a[iPxsMat.o]).Corrosive && d100 < $oidx($.MaterialMap.Map, iLsMat).Corrode;
          }
          if (fDoCorrode) {
            $.Landscape.ClearPix(iLSPosX, iLSPosY);
            $.Landscape.CheckInstabilityRange(iLSPosX, iLSPosY);
            if (!(Random(5) !== 0)) {
              Smoke(iX.a[iX.o], iY.a[iY.o], 3 + Random(3) >>> 0 | 0);
            }
            if (!(Random(20) !== 0)) {
              $.StartSoundEffectAt(S("Liquids::Corrode"), iX.a[iX.o], iY.a[iY.o]);
            }
            return true;
          }
          $.Landscape.InsertMaterial(iPxsMat.a[iPxsMat.o], iX, iY);
          return true;
        }
    }
    return false;
  }

  static mrfIncinerate(_pReaction, iX, iY, _iLSPosX, _iLSPosY, fXDir, fYDir, iPxsMat, iLsMat, evEvent, pfPosChanged) {
    0;
    switch (evEvent) {
      case 2:
      case 0:
        if ($.Landscape.Incinerate(iX.a[iX.o], iY.a[iY.o], -1)) {
          return true;
        }
        break;
      case 1:
        if (!mrfInsertCheck(iX, iY, fXDir, fYDir, iPxsMat, iLsMat, pfPosChanged)) {
          return false;
        }
        if ($.Landscape.Incinerate(iX.a[iX.o], iY.a[iY.o], -1)) {
          return true;
        }
        $.Landscape.InsertMaterial(iPxsMat.a[iPxsMat.o], iX, iY);
        return true;
    }
    return false;
  }

  static mrfInsert(pReaction, iX, iY, iLSPosX, iLSPosY, fXDir, fYDir, iPxsMat, iLsMat, evEvent, pfPosChanged) {
    if (pReaction.fUserDefined) {
      if (!mrfUserCheck(pReaction, iX, iY, iLSPosX, iLSPosY, fXDir, fYDir, iPxsMat, iLsMat, evEvent, pfPosChanged)) {
        return false;
      }
    }
    switch (evEvent) {
      case 0:
        break;
      case 1:
        {
          if (!pReaction.fUserDefined) {
            if (!mrfInsertCheck(iX, iY, fXDir, fYDir, iPxsMat, iLsMat, pfPosChanged)) {
              return false;
            }
          }
          $.Landscape.InsertMaterial(iPxsMat.a[iPxsMat.o], iX, iY);
          return true;
        }
      case 2:
        break;
    }
    return false;
  }

  static mrfScript(pReaction, iX, iY, iLSPosX$, iLSPosY$, fXDir, fYDir, iPxsMat, iLsMat$, evEvent, pfPosChanged) {
    const iLSPosX = [iLSPosX$];
    const iLSPosY = [iLSPosY$];
    const iLsMat = [iLsMat$];
    if (!mrfUserCheck(pReaction, iX, iY, iLSPosX[0], iLSPosY[0], fXDir, fYDir, iPxsMat, iLsMat[0], evEvent, pfPosChanged)) {
      return false;
    }
    if (pReaction.pScriptFunc == null) {
      return false;
    }
    let iXDir1 = 0;
    let iYDir1 = 0;
    let iXDir2 = 0;
    let iYDir2 = 0;
    let pars = new $.C4AulParSet().init$ri32$ri32$ri32$ri32$ri32$ri32$ri32$ri32$mi32(iX, iY, P(iLSPosX, 0), P(iLSPosY, 0), null, null, iPxsMat, P(iLsMat, 0), evEvent);
    if (!pReaction.pScriptFunc.Exec$pC4PropList$pC4AulParSet$b(null, pars.op_and(), false).op_not()) {
      return true;
    }
    iPxsMat.a[iPxsMat.o] = pars.op_index(6).getInt();
    let iX2 = pars.op_index(0).getInt();
    let iY2 = pars.op_index(1).getInt();
    iXDir2 = pars.op_index(4).getInt();
    iYDir2 = pars.op_index(5).getInt();
    if (iX.a[iX.o] !== iX2 || iY.a[iY.o] !== iY2 || iXDir1 !== iXDir2 || iYDir1 !== iYDir2) {
      if (pfPosChanged != null) {
        pfPosChanged.a[pfPosChanged.o] = true;
      }
      iX.a[iX.o] = iX2;
      iY.a[iY.o] = iY2;
      fXDir.$assign($.C4REAL100(iXDir2));
      fYDir.$assign($.C4REAL100(iYDir2));
    }
    return false;
  }

  Default() {
    this.Num = 0;
    this.Map = null;
    this.ppReactionMap = null;
    this.max_shape_width = this.max_shape_height = 0;
  }

  Clear() {
    $delete(this.Map);
    this.Map = null;
    this.Num = 0;
    $delete(this.ppReactionMap);
    this.ppReactionMap = null;
  }

  Load(hGroup) {
    const entryname = new Int8Array(257);
    let mat_num = hGroup.EntryCount(S("*.ocm"));
    let pNewMap = $oat($oarr($u64n(mat_num + this.Num | 0), () => new C4Material().init()), 0);
    if (pNewMap == null) {
      return 0;
    }
    hGroup.ResetSearch();
    let cnt = 0;
    while (hGroup.FindNextEntry$pi8$pi8$pu64$b(S("*.ocm"), P(entryname, 0))) {
      if (cnt >= mat_num) {
        $.Log(S("Internal Error: More materials loaded than expected. Make sure your material file names are unique (ignoring case)."));
        break;
      }
      if (!$oidx(pNewMap, cnt).Load(hGroup, P(entryname, 0))) {
        $delete(pNewMap);
        return 0;
      }
      if (this.Get(P($oidx(pNewMap, cnt).Name, 0)) === -1) {
        cnt = cnt + 1 | 0;
      }
    }
    for (let i = 0; i < this.Num; i = i + 1 | 0) {
      $oidx(pNewMap, cnt + i | 0).$assign($oidx(this.Map, i));
    }
    $delete(this.Map);
    this.Map = pNewMap;
    this.Num = this.Num + cnt | 0;
    return cnt;
  }

  HasMaterials(hGroup) {
    return !!(hGroup.EntryCount(S("*.ocm")) !== 0);
  }

  Get(szMaterial) {
    let cnt = 0;
    for (cnt = 0; cnt < this.Num; cnt = cnt + 1 | 0) {
      if ($.SEqualNoCase(szMaterial, P($oidx(this.Map, cnt).Name, 0))) {
        return cnt;
      }
    }
    return -1;
  }

  SaveEnumeration(hGroup) {
    let mapbuf = P(new Int8Array(1000), 0);
    mapbuf.a[mapbuf.o + 0] = 0;
    $.SAppend(S("[Enumeration]"), mapbuf);
    $.SAppend(S("\n"), mapbuf);
    for (let cnt = 0; cnt < this.Num; cnt = cnt + 1 | 0) {
      $.SAppend(P($oidx(this.Map, cnt).Name, 0), mapbuf);
      $.SAppend(S("\n"), mapbuf);
    }
    return hGroup.Add$pi8$px$i32$b$b$b(S("MatMap.txt"), mapbuf, $.SLen(mapbuf) | 0, false, true);
  }

  LoadEnumeration(hGroup) {
    let mapbuf = new $.StdStrBuf();
    if (!hGroup.LoadEntryString$pi8$pStdStrBuf(S("MatMap.txt"), mapbuf)) {
      return true;
    }
    let csearch = null;
    const cmatname = new Int8Array(16);
    let cmat = 0;
    if (!((csearch = $.SSearch(mapbuf.getData(), S("[Enumeration]"))) != null)) {
      return false;
    }
    csearch = $.SAdvanceSpace(csearch);
    while ($.IsIdentifier(csearch.a[csearch.o])) {
      $.SCopyIdentifier(csearch, P(cmatname, 0), 15);
      if (!this.SortEnumeration(cmat, P(cmatname, 0))) {
        return false;
      }
      cmat = cmat + 1 | 0;
      csearch = csearch.add($.SLen(P(cmatname, 0)));
      csearch = $.SAdvanceSpace(csearch);
    }
    return true;
  }

  GetReactionUnsafe(iPXSMat, iLandscapeMat) {
    0;
    0;
    0;
    return this.ppReactionMap.a[this.ppReactionMap.o + ((Math.imul(iLandscapeMat + 1 | 0, this.Num + 1 | 0) + iPXSMat | 0) + 1 | 0)];
  }

  GetReaction(iPXSMat, iLandscapeMat) {
    if (this.ppReactionMap == null) {
      return null;
    }
    if (!$.Inside$i32$i32$i32$3(iPXSMat, -1, this.Num - 1 | 0)) {
      return null;
    }
    if (!$.Inside$i32$i32$i32$3(iLandscapeMat, -1, this.Num - 1 | 0)) {
      return null;
    }
    return this.GetReactionUnsafe(iPXSMat, iLandscapeMat);
  }

  UpdateScriptPointers() {
    for (let i = 0; i < this.Num; i = i + 1 | 0) {
      $oidx(this.Map, i).UpdateScriptPointers();
    }
  }

  CrossMapMaterials(szEarthMaterial) {
    let $t1;
    if ($.MaterialMap.Num > 125) {
      $.LogFatal($.LoadResStr(S("IDS_PRC_TOOMANYMATS")));
      return false;
    }
    $delete(this.ppReactionMap);
    this.ppReactionMap = P(new Array($u64n(Math.imul(this.Num + 1 | 0, this.Num + 1 | 0))).fill(null), 0);
    for (let iMatPXS = -1; iMatPXS < this.Num; iMatPXS = iMatPXS + 1 | 0) {
      let pMatPXS = (iMatPXS + 1 | 0) !== 0 ? $oadd(this.Map, iMatPXS) : null;
      for (let iMatLS = -1; iMatLS < this.Num; iMatLS = iMatLS + 1 | 0) {
        let pReaction = null;
        let pMatLS = (iMatLS + 1 | 0) !== 0 ? $oadd(this.Map, iMatLS) : null;
        if (pMatPXS != null && pMatPXS.sInMatConvert.getLength() !== 0 && $.SEqualNoCase(pMatPXS.sInMatConvert.getData(), pMatLS != null ? P(pMatLS.Name, 0) : S("Sky"))) {
          pReaction = this.DefReactConvert;
        } else if (pMatPXS != null && pMatLS != null) {
          if (pMatPXS.Incendiary !== 0 && pMatLS.Extinguisher !== 0 || pMatPXS.Extinguisher !== 0 && pMatLS.Incendiary !== 0) {
            pReaction = this.DefReactPoof;
          } else if (pMatPXS.Incendiary !== 0 && pMatLS.Inflammable !== 0 || pMatPXS.Inflammable !== 0 && pMatLS.Incendiary !== 0) {
            pReaction = this.DefReactIncinerate;
          } else if (pMatPXS.Corrosive !== 0 && pMatLS.Corrode !== 0) {
            pReaction = this.DefReactCorrode;
          } else if ($.DensityLiquid(MatDensity(iMatPXS)) && $.DensitySemiSolid(MatDensity(iMatLS))) {
            pReaction = this.DefReactInsert;
          } else if ($.DensitySolid(MatDensity(iMatPXS)) && $.DensitySolid(MatDensity(iMatLS))) {
            pReaction = this.DefReactInsert;
          }
        }
        this.SetMatReaction(iMatPXS, iMatLS, pReaction);
      }
    }
    this.max_shape_width = this.max_shape_height = 0;
    let cnt = 0;
    for (cnt = 0; cnt < this.Num; cnt = cnt + 1 | 0) {
      let pMat = $oadd(this.Map, cnt);
      let szTextureOverlay = null;
      if ($oidx(this.Map, cnt).sTextureOverlay.getLength() !== 0) {
        if ($.TextureMap.GetTexture$i32($oidx(this.Map, cnt).sTextureOverlay.getLength() | 0) != null) {
          szTextureOverlay = $oidx(this.Map, cnt).sTextureOverlay.getData();
          if (($oidx(this.Map, cnt).OverlayType & 2) !== 0) {
            $.DebugLogF(S("Error in overlay of material %s: Flag C4MatOv_None ignored because a custom overlay (%s) was specified!"), P($oidx(this.Map, cnt).Name, 0), szTextureOverlay);
            ($t1 = P($oidx(this.Map, cnt), "OverlayType"), $t1.a[$t1.o] = $t1.a[$t1.o] & -3);
          }
        }
      }
      let iTexMapIx = 0;
      if (szTextureOverlay == null && (iTexMapIx = $.TextureMap.GetIndex(P($oidx(this.Map, cnt).Name, 0), null, false)) !== 0) {
        szTextureOverlay = $.TextureMap.GetEntry(iTexMapIx).GetTextureName();
      }
      if (szTextureOverlay == null) {
        szTextureOverlay = S("none");
      }
      $oidx(this.Map, cnt).DefaultMatTex = $.TextureMap.GetIndex(P($oidx(this.Map, cnt).Name, 0), szTextureOverlay, true, $.FormatString(S("DefaultMatTex of mat %s"), P($oidx(this.Map, cnt).Name, 0)).getData());
      let sfcTexture = null;
      let Texture = null;
      if ($oidx(this.Map, cnt).sPXSGfx.getLength() !== 0) {
        if ((Texture = $.TextureMap.GetTexture$pi8($oidx(this.Map, cnt).sPXSGfx.getData())) != null) {
          if ((sfcTexture = Texture.Surface32) != null) {
            $oidx(this.Map, cnt).PXSFace.Set$pC4Surface$f32$f32$f32$f32(sfcTexture, Math.fround($oidx(this.Map, cnt).PXSGfxRt.x), Math.fround($oidx(this.Map, cnt).PXSGfxRt.y), Math.fround($oidx(this.Map, cnt).PXSGfxRt.Wdt), Math.fround($oidx(this.Map, cnt).PXSGfxRt.Hgt));
          }
        }
      }
      for (const iRCnt of pMat.CustomReactionList) {
        let pReact = iRCnt;
        if (pReact.sConvertMat.getLength() !== 0) {
          pReact.iConvertMat = this.Get(pReact.sConvertMat.getData());
        } else {
          pReact.iConvertMat = -1;
        }
        let tmat = 0;
        if (MatValid(tmat = this.Get(pReact.TargetSpec.getData()))) {
          if (pReact.fInverseSpec) {
            for (let cnt2 = -1; cnt2 < this.Num; cnt2 = cnt2 + 1 | 0) {
              if (cnt2 !== tmat) {
                this.SetMatReaction(cnt, cnt2, pReact);
              } else {
                this.SetMatReaction(cnt, tmat, pReact);
              }
            }
          }
        } else if ($.SEqualNoCase(pReact.TargetSpec.getData(), S("All"))) {
          if (!pReact.fInverseSpec) {
            for (let cnt2 = -1; cnt2 < this.Num; cnt2 = cnt2 + 1 | 0) {
              this.SetMatReaction(cnt, cnt2, pReact);
            }
          }
        } else if ($.SEqualNoCase(pReact.TargetSpec.getData(), S("Solid"))) {
          if (pReact.fInverseSpec) {
            this.SetMatReaction(cnt, -1, pReact);
          }
          for (let cnt2 = 0; cnt2 < this.Num; cnt2 = cnt2 + 1 | 0) {
            if (($.DensitySolid($oidx(this.Map, cnt2).Density) ? 1 : 0) !== (pReact.fInverseSpec ? 1 : 0)) {
              this.SetMatReaction(cnt, cnt2, pReact);
            }
          }
        } else if ($.SEqualNoCase(pReact.TargetSpec.getData(), S("SemiSolid"))) {
          if (pReact.fInverseSpec) {
            this.SetMatReaction(cnt, -1, pReact);
          }
          for (let cnt2 = 0; cnt2 < this.Num; cnt2 = cnt2 + 1 | 0) {
            if (($.DensitySemiSolid($oidx(this.Map, cnt2).Density) ? 1 : 0) !== (pReact.fInverseSpec ? 1 : 0)) {
              this.SetMatReaction(cnt, cnt2, pReact);
            }
          }
        } else if ($.SEqualNoCase(pReact.TargetSpec.getData(), S("Background"))) {
          if (!pReact.fInverseSpec) {
            this.SetMatReaction(cnt, -1, pReact);
          }
          for (let cnt2 = 0; cnt2 < this.Num; cnt2 = cnt2 + 1 | 0) {
            if ((!($oidx(this.Map, cnt2).Density !== 0) ? 1 : 0) !== (pReact.fInverseSpec ? 1 : 0)) {
              this.SetMatReaction(cnt, cnt2, pReact);
            }
          }
        } else if ($.SEqualNoCase(pReact.TargetSpec.getData(), S("Sky"))) {
          if (!pReact.fInverseSpec) {
            this.SetMatReaction(cnt, -1, pReact);
          } else {
            for (let cnt2 = 0; cnt2 < this.Num; cnt2 = cnt2 + 1 | 0) {
              this.SetMatReaction(cnt, cnt2, pReact);
            }
          }
        } else if ($.SEqualNoCase(pReact.TargetSpec.getData(), S("Incendiary")) || $.SEqualNoCase(pReact.TargetSpec.getData(), S("Incindiary"))) {
          if (pReact.fInverseSpec) {
            this.SetMatReaction(cnt, -1, pReact);
          }
          for (let cnt2 = 0; cnt2 < this.Num; cnt2 = cnt2 + 1 | 0) {
            if ((!($oidx(this.Map, cnt2).Incendiary !== 0) ? 1 : 0) === (pReact.fInverseSpec ? 1 : 0)) {
              this.SetMatReaction(cnt, cnt2, pReact);
            }
          }
        } else if ($.SEqualNoCase(pReact.TargetSpec.getData(), S("Extinguisher"))) {
          if (pReact.fInverseSpec) {
            this.SetMatReaction(cnt, -1, pReact);
          }
          for (let cnt2 = 0; cnt2 < this.Num; cnt2 = cnt2 + 1 | 0) {
            if ((!($oidx(this.Map, cnt2).Extinguisher !== 0) ? 1 : 0) === (pReact.fInverseSpec ? 1 : 0)) {
              this.SetMatReaction(cnt, cnt2, pReact);
            }
          }
        } else if ($.SEqualNoCase(pReact.TargetSpec.getData(), S("Inflammable"))) {
          if (pReact.fInverseSpec) {
            this.SetMatReaction(cnt, -1, pReact);
          }
          for (let cnt2 = 0; cnt2 < this.Num; cnt2 = cnt2 + 1 | 0) {
            if ((!($oidx(this.Map, cnt2).Inflammable !== 0) ? 1 : 0) === (pReact.fInverseSpec ? 1 : 0)) {
              this.SetMatReaction(cnt, cnt2, pReact);
            }
          }
        } else if ($.SEqualNoCase(pReact.TargetSpec.getData(), S("Corrosive"))) {
          if (pReact.fInverseSpec) {
            this.SetMatReaction(cnt, -1, pReact);
          }
          for (let cnt2 = 0; cnt2 < this.Num; cnt2 = cnt2 + 1 | 0) {
            if ((!($oidx(this.Map, cnt2).Corrosive !== 0) ? 1 : 0) === (pReact.fInverseSpec ? 1 : 0)) {
              this.SetMatReaction(cnt, cnt2, pReact);
            }
          }
        } else if ($.SEqualNoCase(pReact.TargetSpec.getData(), S("Corrode"))) {
          if (pReact.fInverseSpec) {
            this.SetMatReaction(cnt, -1, pReact);
          }
          for (let cnt2 = 0; cnt2 < this.Num; cnt2 = cnt2 + 1 | 0) {
            if ((!($oidx(this.Map, cnt2).Corrode !== 0) ? 1 : 0) === (pReact.fInverseSpec ? 1 : 0)) {
              this.SetMatReaction(cnt, cnt2, pReact);
            }
          }
        }
      }
    }
    for (cnt = 0; cnt < this.Num; cnt = cnt + 1 | 0) {
      if ($oidx(this.Map, cnt).sBlastShiftTo.getLength() !== 0) {
        $oidx(this.Map, cnt).BlastShiftTo = $.TextureMap.GetIndexMatTex($oidx(this.Map, cnt).sBlastShiftTo.getData(), null, true, $.FormatString(S("BlastShiftTo of mat %s"), P($oidx(this.Map, cnt).Name, 0)).getData());
      }
      if ($oidx(this.Map, cnt).sInMatConvertTo.getLength() !== 0) {
        $oidx(this.Map, cnt).InMatConvertTo = this.Get($oidx(this.Map, cnt).sInMatConvertTo.getData());
      }
      if ($oidx(this.Map, cnt).sBelowTempConvertTo.getLength() !== 0) {
        $oidx(this.Map, cnt).BelowTempConvertTo = $.TextureMap.GetIndexMatTex($oidx(this.Map, cnt).sBelowTempConvertTo.getData(), null, true, $.FormatString(S("BelowTempConvertTo of mat %s"), P($oidx(this.Map, cnt).Name, 0)).getData());
      }
      if ($oidx(this.Map, cnt).sAboveTempConvertTo.getLength() !== 0) {
        $oidx(this.Map, cnt).AboveTempConvertTo = $.TextureMap.GetIndexMatTex($oidx(this.Map, cnt).sAboveTempConvertTo.getData(), null, true, $.FormatString(S("AboveTempConvertTo of mat %s"), P($oidx(this.Map, cnt).Name, 0)).getData());
      }
    }
    let earth_entry = $.TextureMap.GetEntry($.TextureMap.GetIndexMatTex(szEarthMaterial));
    if (earth_entry == null) {
      $.LogFatal($.FormatString(S("Earth material \"%s\" not found!"), szEarthMaterial).getData());
      return false;
    }
    $.MVehic = this.Get(S("Vehicle"));
    $.MCVehic = Mat2PixColDefault($.MVehic);
    $.MHalfVehic = this.Get(S("HalfVehicle"));
    $.MCHalfVehic = Mat2PixColDefault($.MHalfVehic);
    $.MTunnel = this.Get(S("Tunnel"));
    $.MWater = this.Get(S("Water"));
    $.MEarth = this.Get(earth_entry.GetMaterialName());
    if ($.MVehic === -1 || $.MTunnel === -1) {
      $.LogFatal($.LoadResStr(S("IDS_PRC_NOSYSMATS")));
      return false;
    }
    return true;
  }

  SetMatReaction(iPXSMat, iLSMat, pReact) {
    if (pReact != null && pReact.fReverse) {
      [iPXSMat, iLSMat] = [iLSMat, iPXSMat];
    }
    this.ppReactionMap.a[this.ppReactionMap.o + ((Math.imul(iLSMat + 1 | 0, this.Num + 1 | 0) + iPXSMat | 0) + 1 | 0)] = pReact;
  }

  SortEnumeration(iMat, szMatName) {
    if (iMat >= this.Num) {
      return false;
    }
    let cmat = 0;
    for (cmat = iMat; cmat < this.Num; cmat = cmat + 1 | 0) {
      if ($.SEqual(szMatName, P($oidx(this.Map, cmat).Name, 0))) {
        break;
      }
    }
    if (cmat >= this.Num) {
      return false;
    }
    if (cmat === iMat) {
      return true;
    }
    let mswap = new C4Material().init();
    mswap.$assign($oidx(this.Map, iMat));
    $oidx(this.Map, iMat).$assign($oidx(this.Map, cmat));
    $oidx(this.Map, cmat).$assign(mswap);
    return true;
  }

  $clone() { return new C4MaterialMap().$assign(this); }
  $assign(o) {
    this.Num = o.Num;
    this.Map = o.Map;
    this.ppReactionMap = o.ppReactionMap;
    this.max_shape_width = o.max_shape_width;
    this.max_shape_height = o.max_shape_height;
    this.DefReactConvert.$assign(o.DefReactConvert);
    this.DefReactPoof.$assign(o.DefReactPoof);
    this.DefReactCorrode.$assign(o.DefReactCorrode);
    this.DefReactIncinerate.$assign(o.DefReactIncinerate);
    this.DefReactInsert.$assign(o.DefReactInsert);
    return this;
  }
}

export class C4Material extends C4MaterialCore {
  BlastShiftTo = 0;
  InMatConvertTo = 0;
  BelowTempConvertTo = 0;
  AboveTempConvertTo = 0;
  DefaultMatTex = 0;
  PXSFace = new $.C4Facet().init$v();

  init() {
    super.init();
    this.PXSFace = new $.C4Facet().init$v();
    this.BlastShiftTo = 0;
    this.InMatConvertTo = -1;
    this.BelowTempConvertTo = 0;
    this.AboveTempConvertTo = 0;
    return this;
  }

  UpdateScriptPointers() {
    for (const i of this.CustomReactionList) {
      i.ResolveScriptFuncs(P(this.Name, 0));
    }
  }

  $clone() { return new C4Material().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.BlastShiftTo = o.BlastShiftTo;
    this.InMatConvertTo = o.InMatConvertTo;
    this.BelowTempConvertTo = o.BelowTempConvertTo;
    this.AboveTempConvertTo = o.AboveTempConvertTo;
    this.DefaultMatTex = o.DefaultMatTex;
    this.PXSFace.$assign(o.PXSFace);
    return this;
  }
}









export function MatValid(mat) {
  return $.Inside$i32$i32$i32$3(mat, 0, $.MaterialMap.Num - 1 | 0);
}

export function MatVehicle(iMat) {
  return iMat === $.MVehic;
}

export function IsMCVehicle(mat) {
  return mat === $.MCVehic;
}

export function IsMCHalfVehicle(mat) {
  return mat === $.MCHalfVehic;
}

export function IsSomeVehicle(mat) {
  return IsMCVehicle(mat) || IsMCHalfVehicle(mat);
}

export function MatTex2PixCol(tex) {
  return tex & 0xff;
}

export function Mat2PixColDefault(mat) {
  return $oidx($.MaterialMap.Map, mat).DefaultMatTex & 0xff;
}

export function MatDensity(mat) {
  if (!MatValid(mat)) {
    return 0;
  }
  return $oidx($.MaterialMap.Map, mat).Density;
}

export function MatPlacement(mat) {
  if (!MatValid(mat)) {
    return 0;
  }
  return $oidx($.MaterialMap.Map, mat).Placement;
}

export function MatDigFree(mat) {
  if (!MatValid(mat)) {
    return 1;
  }
  return $oidx($.MaterialMap.Map, mat).DigFree;
}

function Smoke(tx$, ty$, level$) {
  const tx = [tx$];
  const ty = [ty$];
  const level = [level$];
  let pars = new $.C4AulParSet().init$ri32$ri32$ri32(P(tx, 0), P(ty, 0), P(level, 0));
  $.ScriptEngine.GetPropList().Call$i32$pC4AulParSet$b(139 /*P_Smoke*/, pars.op_and());
}

export function mrfInsertCheck(iX, iY, fXDir, fYDir, iPxsMat, iLsMat, pfPosChanged, no_slide = false) {
  let $t1;
  if (pfPosChanged != null) {
    pfPosChanged.a[pfPosChanged.o] = true;
  }
  let mdens = $min($oidx($.MaterialMap.Map, iPxsMat.a[iPxsMat.o]).Density, $.C4M_Solid$C4Constants);
  let max_upwards = 3;
  let was_pushed_upwards = false;
  while (($t1 = max_upwards, max_upwards = max_upwards - 1 | 0, $t1) !== 0 && $.Landscape.GetDensity(iX.a[iX.o], iY.a[iY.o]) >= mdens) {
    iY.a[iY.o] = iY.a[iY.o] - 1 | 0;
    was_pushed_upwards = true;
  }
  if (fYDir.op_gt$C4Fixed($.itofix$i32(1))) {
    if ($oidx($.MaterialMap.Map, iPxsMat.a[iPxsMat.o]).SplashRate !== 0 && !(Random($oidx($.MaterialMap.Map, iPxsMat.a[iPxsMat.o]).SplashRate >>> 0) !== 0)) {
      fYDir.$assign(fYDir.op_neg().op_div$i32(8));
      fXDir.$assign(fXDir.op_div$i32(8).op_add$C4Fixed($.C4REAL100(Random(200) - 100 >>> 0 | 0)));
      if (fYDir.op_bool()) {
        return false;
      }
    }
  }
  fYDir.$assign($.Landscape.GetGravity().op_neg());
  if ($oidx($.MaterialMap.Map, iPxsMat.a[iPxsMat.o]).Incendiary !== 0) {
    if (!(Random(25) !== 0)) {
      Smoke(iX.a[iX.o], iY.a[iY.o], 4 + Random(3) >>> 0 | 0);
    }
  }
  const iSlideX = [iX.a[iX.o]];
  const iSlideY = [iY.a[iY.o]];
  if (!no_slide && $.Landscape.FindMatSlide(P(iSlideX, 0), P(iSlideY, 0), $.Sign$C4Fixed($.Landscape.GetGravity()), mdens, $oidx($.MaterialMap.Map, iPxsMat.a[iPxsMat.o]).MaxSlide)) {
    if (iPxsMat.a[iPxsMat.o] === iLsMat || was_pushed_upwards) {
      iX.a[iX.o] = iSlideX[0];
      iY.a[iY.o] = iSlideY[0];
      fXDir.op_assign(0);
      if (was_pushed_upwards) {
        if ($.Landscape.GetDensity(iX.a[iX.o], iY.a[iY.o] + $.Sign$C4Fixed($.Landscape.GetGravity()) | 0) >= mdens) {
          return true;
        }
      }
      return false;
    }
    fXDir.$assign(fXDir.op_mul$i32(10).op_add$i32($.Sign$i32(iSlideX[0] - iX.a[iX.o] | 0)).op_div$i32(11).op_add$C4Fixed($.C4REAL10(Random(5) - 2 >>> 0 | 0)));
    if ($.Abs$i32(iX.a[iX.o] - iSlideX[0] | 0) <= $.Abs$i32($.fixtoi$C4Fixed(fXDir))) {
      iX.a[iX.o] = iSlideX[0];
      iY.a[iY.o] = iSlideY[0];
      if (fYDir.op_le$i32(0)) {
        fXDir.op_assign(0);
      }
    }
    return false;
  }
  return true;
}

export function mrfUserCheck(pReaction, iX, iY, _iLSPosX, _iLSPosY, fXDir, fYDir, iPxsMat, iLsMat, evEvent, pfPosChanged) {
  if (((1 << evEvent | 0) >>> 0 & ~pReaction.iExecMask >>> 0) >>> 0 !== 0) {
    return false;
  }
  if (pReaction.fInsertionCheck && evEvent === 1) {
    if (!mrfInsertCheck(iX, iY, fXDir, fYDir, iPxsMat, iLsMat, pfPosChanged)) {
      return false;
    }
  }
  return true;
}


export function $init(): void {
  $.MVehic = -1;
  $.MHalfVehic = -1;
  $.MTunnel = -1;
  $.MWater = -1;
  $.MEarth = -1;
  $.MCVehic = 0;
  $.MCHalfVehic = 0;
  $.ReactionFuncMap$C4Material = $own([
  ((($o) => ($o.szRFName = S("Script"), $o.pFunc = C4MaterialMap.mrfScript, $o))(new ReactionFuncMapEntry())),
  ((($o) => ($o.szRFName = S("Convert"), $o.pFunc = C4MaterialMap.mrfConvert, $o))(new ReactionFuncMapEntry())),
  ((($o) => ($o.szRFName = S("Poof"), $o.pFunc = C4MaterialMap.mrfPoof, $o))(new ReactionFuncMapEntry())),
  ((($o) => ($o.szRFName = S("Corrode"), $o.pFunc = C4MaterialMap.mrfCorrode, $o))(new ReactionFuncMapEntry())),
  ((($o) => ($o.szRFName = S("Insert"), $o.pFunc = C4MaterialMap.mrfInsert, $o))(new ReactionFuncMapEntry())),
  ((($o) => ($o.szRFName = null, $o.pFunc = C4MaterialReaction.NoReaction, $o))(new ReactionFuncMapEntry())),
]);
  $.MaterialMap = new C4MaterialMap(); $.MaterialMap.init();
}

Object.assign($, { C4Material, C4MaterialCore, C4MaterialMap, C4MaterialReaction, IsMCHalfVehicle, IsMCVehicle, IsSomeVehicle, Mat2PixColDefault, MatDensity, MatDigFree, MatPlacement, MatTex2PixCol, MatValid, MatVehicle, ReactionFuncMapEntry, Smoke, mrfInsertCheck, mrfUserCheck });
