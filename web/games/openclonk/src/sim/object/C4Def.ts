// @ts-nocheck
// OpenClonk 36de799: src/object/C4Def.cpp, src/object/C4Def.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { ftoi32 } from '../../rt/int.ts';
import { $oat, $own, $rd, $wr, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete, $max, StdSet } from '../../rt/std.ts';
import { StdMeshMaterialLoader } from '../lib/StdMeshMaterial.ts';
import { C4PropListStatic } from '../script/C4PropList.ts';

export class C4DefAdditionalResourcesLoader extends StdMeshMaterialLoader {
  Group = null;

  init(hGroup) {
    this.Group = hGroup;
    return this;
  }

  LoadTexture(filename) {
    if (!this.Group.AccessEntry(filename)) {
      return null;
    }
    let surface = new $.C4Surface().init$v();
    if (!surface.Read(this.Group, $.GetExtension(filename), 2)) {
      $delete(surface);
      surface = null;
    }
    return surface;
  }

  LoadShaderCode(filename) {
    let ret = new $.StdStrBuf();
    if (!this.Group.LoadEntryString$pi8$pStdStrBuf(filename, ret)) {
      return new $.StdStrBuf();
    }
    return ret;
  }

  AddShaderSlices(_shader, _ssc) {
  }

  $clone() { return new C4DefAdditionalResourcesLoader().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.Group = o.Group;
    return this;
  }
}

export class C4Def extends C4PropListStatic {
  id = new $.C4ID().init$v();
  rC4XVer = new Int32Array(2);
  RequireDef = new $.C4IDList().init();
  Shape = new $.C4Shape();
  Entrance = new $.C4Rect();
  Collection = new $.C4Rect();
  PictureRect = new $.C4Rect();
  SolidMask = new $.C4TargetRect();
  TopFace = new $.C4TargetRect();
  BurnTurnTo = new $.C4ID().init$v();
  GrowthType = 0;
  CrewMember = 0;
  NativeCrew = 0;
  Mass = 0;
  Value = 0;
  Exclusive = 0;
  Category = 0;
  Constructable = 0;
  Rotateable = 0;
  Float = 0;
  ColorByOwner = 0;
  NoHorizontalMove = 0;
  LiftTop = 0;
  GrabPutGet = 0;
  UprightAttach = 0;
  Line = 0;
  LineIntersect = 0;
  IncompleteActivity = 0;
  Oversize = 0;
  Fragile = 0;
  Projectile = 0;
  NoPushEnter = 0;
  VehicleControl = 0;
  Pathfinder = 0;
  MoveToRange = 0;
  NoMassFromContents = 0;
  NoStabilize = 0;
  ClosedContainer = 0;
  SilentCommands = 0;
  TemporaryCrew = 0;
  BlitMode = 0;
  NoBreath = 0;
  ConSizeOff = 0;
  NoGet = 0;
  RotatedEntrance = 0;
  NoTransferZones = 0;
  AllowPictureStack = 0;
  HideInCreator = false;
  mesh_materials = new StdSet((a, b) => a.op_lt(b));
  Filename = new Int8Array(256);
  ConsoleGroupPath = new $.StdCopyStrBuf();
  Creation = 0;
  Count = 0;
  Script = new $.C4DefScriptHost().init();
  StringTable = new $.C4LangStringTable().init();
  pClonkNames = null;
  fClonkNamesOwned = false;
  pRankNames = null;
  fRankNamesOwned = false;
  pRankSymbols = null;
  fRankSymbolsOwned = false;
  iNumRankSymbols = 0;
  Graphics = new $.C4DefGraphics().init();
  pSolidMask = null;
  MainFace = new $.C4Facet().init$v();
  Next = null;
  Temporary = false;

  DefaultDefCore() {
    this.rC4XVer[0] = this.rC4XVer[1] = 0;
    this.RequireDef.Clear();
    this.Shape.Default();
    $.C4Rect.prototype.Default.call(this.Entrance);
    $.C4Rect.prototype.Default.call(this.Collection);
    $.C4Rect.prototype.Default.call(this.PictureRect);
    this.SolidMask.Default();
    this.TopFace.Default();
    this.BurnTurnTo.$assign($.C4ID.None);
    this.GrowthType = 0;
    this.CrewMember = 0;
    this.NativeCrew = 0;
    this.Mass = 0;
    this.Value = 0;
    this.Exclusive = 0;
    this.Category = 0;
    this.Constructable = 0;
    this.Rotateable = 0;
    this.RotatedEntrance = 0;
    this.Float = 0;
    this.ColorByOwner = 0;
    this.NoHorizontalMove = 0;
    this.LiftTop = 0;
    this.GrabPutGet = 0;
    this.UprightAttach = 0;
    this.Line = 0;
    this.LineIntersect = 0;
    this.IncompleteActivity = 0;
    this.Oversize = 0;
    this.Fragile = 0;
    this.NoPushEnter = 0;
    this.Projectile = 0;
    this.VehicleControl = 0;
    this.Pathfinder = 0;
    this.NoMassFromContents = 0;
    this.MoveToRange = 0;
    this.NoStabilize = 0;
    this.ClosedContainer = 0;
    this.SilentCommands = 0;
    this.TemporaryCrew = 0;
    this.BlitMode = 0;
    this.NoBreath = 0;
    this.ConSizeOff = 0;
    this.NoGet = 0;
    this.NoTransferZones = 0;
    this.HideInCreator = false;
  }

  LoadDefCore(hGroup) {
    let Source = new $.StdStrBuf();
    if (hGroup.LoadEntryString$pi8$pStdStrBuf(S("DefCore.txt"), Source)) {
      let Name = hGroup.GetFullName().op_add$StdStrBuf($.FormatString(S("%cDefCore.txt"), 47));
      if (!this.Compile(Source.getData(), Name.getData())) {
        return false;
      }
      Source.Clear();
      if (this.Mass < 0) {
        $.DebugLogF(S("WARNING: Def %s (%s) at %s has invalid mass!"), this.GetName(), this.id.ToString(), hGroup.GetFullName().getData());
        this.Mass = 0;
      }
      return true;
    }
    return false;
  }

  Save(hGroup) {
    let Out = new $.StdStrBuf();
    if (!this.Decompile(Out, $.FormatString(S("%s::DefCore.txt"), this.id.ToString()).getData())) {
      return false;
    }
    return hGroup.Add$pi8$rStdStrBuf$b$b$b(S("DefCore.txt"), Out, false, true);
  }

  CompileFunc$pStdCompiler(pComp) {
    pComp.Value$StdNamingDefaultAdapt$C4ID$C4ID($.mkNamingAdapt$rC4ID$pi8$C4ID$b$b(this.id, S("id"), $.C4ID.None));
    pComp.Value$StdNamingAdapt$StdArrayDefaultAdapt$i32$i32$_IdFuncClass$i32($.mkNamingAdapt$mStdArrayDefaultAdapt$i32$i32$_IdFuncClass$i32$pi8($.mkArrayAdaptDM(this.rC4XVer, 0), S("Version")));
    pComp.Value$StdNamingDefaultAdapt$StdParameterAdapt$C4IDList$b$C4IDList($.mkNamingAdapt$mStdParameterAdapt$C4IDList$b$pi8$C4IDList$b$b($.mkParAdapt$rC4IDList$mb(this.RequireDef, false), S("RequireDef"), new $.C4IDList().init()));
    const Categories = $own([
  ((($o) => ($o.Name = S("C4D_None"), $o.Val = 0, $o))(new $.StdBitfieldEntry$i32())),
  ((($o) => ($o.Name = S("C4D_StaticBack"), $o.Val = 1, $o))(new $.StdBitfieldEntry$i32())),
  ((($o) => ($o.Name = S("C4D_Structure"), $o.Val = 2, $o))(new $.StdBitfieldEntry$i32())),
  ((($o) => ($o.Name = S("C4D_Vehicle"), $o.Val = 4, $o))(new $.StdBitfieldEntry$i32())),
  ((($o) => ($o.Name = S("C4D_Living"), $o.Val = 8, $o))(new $.StdBitfieldEntry$i32())),
  ((($o) => ($o.Name = S("C4D_Object"), $o.Val = 16, $o))(new $.StdBitfieldEntry$i32())),
  ((($o) => ($o.Name = S("C4D_Goal"), $o.Val = 32, $o))(new $.StdBitfieldEntry$i32())),
  ((($o) => ($o.Name = S("C4D_Rule"), $o.Val = 64, $o))(new $.StdBitfieldEntry$i32())),
  ((($o) => ($o.Name = S("C4D_Environment"), $o.Val = 128, $o))(new $.StdBitfieldEntry$i32())),
  ((($o) => ($o.Name = S("C4D_Background"), $o.Val = 4096, $o))(new $.StdBitfieldEntry$i32())),
  ((($o) => ($o.Name = S("C4D_Parallax"), $o.Val = 8192, $o))(new $.StdBitfieldEntry$i32())),
  ((($o) => ($o.Name = S("C4D_MouseSelect"), $o.Val = 16384, $o))(new $.StdBitfieldEntry$i32())),
  ((($o) => ($o.Name = S("C4D_Foreground"), $o.Val = 32768, $o))(new $.StdBitfieldEntry$i32())),
  ((($o) => ($o.Name = S("C4D_MouseIgnore"), $o.Val = 65536, $o))(new $.StdBitfieldEntry$i32())),
  ((($o) => ($o.Name = S("C4D_IgnoreFoW"), $o.Val = 131072, $o))(new $.StdBitfieldEntry$i32())),
  ((($o) => ($o.Name = null, $o.Val = 0, $o))(new $.StdBitfieldEntry$i32())),
]);
    pComp.Value$StdNamingDefaultAdapt$StdBitfieldAdapt$i32$i32$2($.mkNamingAdapt$mStdBitfieldAdapt$i32$pi8$i32$b$b$2($.mkBitfieldAdapt$ri32$pStdBitfieldEntry(P(this, "Category"), $oat(Categories, 0)), S("Category"), 0));
    pComp.Value$StdParameterAdapt$C4Shape$pC4Shape($.mkParAdapt$rC4Shape$mpC4Shape(this.Shape, null));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Value"), S("Value"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Mass"), S("Mass"), 0));
    pComp.Value$StdNamingDefaultAdapt$C4TargetRect$C4TargetRect($.mkNamingAdapt$rC4TargetRect$pi8$C4TargetRect$b$b(this.SolidMask, S("SolidMask"), $.TargetRect0$C4Rect));
    pComp.Value$StdNamingDefaultAdapt$C4TargetRect$C4TargetRect($.mkNamingAdapt$rC4TargetRect$pi8$C4TargetRect$b$b(this.TopFace, S("TopFace"), $.TargetRect0$C4Rect));
    pComp.Value$StdNamingDefaultAdapt$C4Rect$C4Rect($.mkNamingAdapt$rC4Rect$pi8$C4Rect$b$b(this.PictureRect, S("Picture"), $.Rect0$C4Rect));
    pComp.Value$StdNamingDefaultAdapt$C4Rect$C4Rect($.mkNamingAdapt$rC4Rect$pi8$C4Rect$b$b(this.Entrance, S("Entrance"), $.Rect0$C4Rect));
    pComp.Value$StdNamingDefaultAdapt$C4Rect$C4Rect($.mkNamingAdapt$rC4Rect$pi8$C4Rect$b$b(this.Collection, S("Collection"), $.Rect0$C4Rect));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Exclusive"), S("Exclusive"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Line"), S("Line"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "LineIntersect"), S("LineIntersect"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "CrewMember"), S("CrewMember"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "NativeCrew"), S("NoStandardCrew"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Constructable"), S("Construction"), 0));
    const GrabPutGetTypes = $own([((($o) => ($o.Name = S("C4D_GrabGet"), $o.Val = 2, $o))(new $.StdBitfieldEntry$i32())), ((($o) => ($o.Name = S("C4D_GrabPut"), $o.Val = 1, $o))(new $.StdBitfieldEntry$i32())), ((($o) => ($o.Name = null, $o.Val = 0, $o))(new $.StdBitfieldEntry$i32()))]);
    pComp.Value$StdNamingDefaultAdapt$StdBitfieldAdapt$i32$i32$2($.mkNamingAdapt$mStdBitfieldAdapt$i32$pi8$i32$b$b$2($.mkBitfieldAdapt$ri32$pStdBitfieldEntry(P(this, "GrabPutGet"), $oat(GrabPutGetTypes, 0)), S("GrabPutGet"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Rotateable"), S("Rotate"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "RotatedEntrance"), S("RotatedEntrance"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Float"), S("Float"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "ColorByOwner"), S("ColorByOwner"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "NoHorizontalMove"), S("HorizontalFix"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "LiftTop"), S("LiftTop"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "UprightAttach"), S("UprightAttach"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "GrowthType"), S("StretchGrowth"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "IncompleteActivity"), S("IncompleteActivity"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Oversize"), S("Oversize"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Fragile"), S("Fragile"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Projectile"), S("Projectile"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "NoPushEnter"), S("NoPushEnter"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "VehicleControl"), S("VehicleControl"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Pathfinder"), S("Pathfinder"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "MoveToRange"), S("MoveToRange"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "NoMassFromContents"), S("NoMassFromContents"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "NoStabilize"), S("NoStabilize"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "ClosedContainer"), S("ClosedContainer"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "SilentCommands"), S("SilentCommands"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "TemporaryCrew"), S("TemporaryCrew"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "BlitMode"), S("BlitMode"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "NoBreath"), S("NoBreath"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "ConSizeOff"), S("ConSizeOff"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "NoGet"), S("NoGet"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "NoTransferZones"), S("NoTransferZones"), 0));
    const AllowPictureStackModes = $own([
  ((($o) => ($o.Name = S("APS_Color"), $o.Val = 1, $o))(new $.StdBitfieldEntry$i32())),
  ((($o) => ($o.Name = S("APS_Graphics"), $o.Val = 2, $o))(new $.StdBitfieldEntry$i32())),
  ((($o) => ($o.Name = S("APS_Name"), $o.Val = 4, $o))(new $.StdBitfieldEntry$i32())),
  ((($o) => ($o.Name = S("APS_Overlay"), $o.Val = 8, $o))(new $.StdBitfieldEntry$i32())),
  ((($o) => ($o.Name = null, $o.Val = 0, $o))(new $.StdBitfieldEntry$i32())),
]);
    pComp.Value$StdNamingDefaultAdapt$StdBitfieldAdapt$i32$i32$2($.mkNamingAdapt$mStdBitfieldAdapt$i32$pi8$i32$b$b$2($.mkBitfieldAdapt$ri32$pStdBitfieldEntry(P(this, "AllowPictureStack"), $oat(AllowPictureStackModes, 0)), S("AllowPictureStack"), 0));
    pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "HideInCreator"), S("HideInCreator"), false));
  }

  Compile(szSource, szName) {
    return $.CompileFromBuf_LogWarn$mStdNamingAdapt$C4Def$x$pi8($.mkNamingAdapt$rC4Def$pi8(this, S("DefCore")), new $.StdStrBuf().init$pi8$b(szSource), szName);
  }

  Decompile(pOut, szName) {
    return $.DecompileToBuf_Log$mStdNamingAdapt$C4Def$px$pi8($.mkNamingAdapt$rC4Def$pi8(this, S("DefCore")), pOut, szName);
  }

  LoadMeshMaterials(hGroup, gfx_backup) {
    let loader = new C4DefAdditionalResourcesLoader().init(hGroup);
    hGroup.ResetSearch();
    const MaterialFilename = new Int8Array(4097);
    $wr(P(MaterialFilename, 0), 0, 0);
    for (const mat of this.mesh_materials) {
      $.MeshMaterialManager.Remove$StdStrBuf$pStdMeshMaterialUpdate(mat, gfx_backup.GetUpdater());
    }
    this.mesh_materials.clear();
    while (hGroup.FindNextEntry$pi8$pi8$pu64$b(S("*.material"), P(MaterialFilename, 0), null, !!($rd(P(MaterialFilename, 0)) !== 0))) {
      let material = new $.StdStrBuf();
      if (hGroup.LoadEntryString$pi8$pStdStrBuf(P(MaterialFilename, 0), material)) {
        try {
          let buf = new $.StdStrBuf();
          buf.Copy$pi8(hGroup.GetName());
          buf.Append$pi8(S("/"));
          buf.Append$pi8(P(MaterialFilename, 0));
          let new_materials = $.MeshMaterialManager.Parse(material.getData(), buf.getData(), loader);
          this.mesh_materials.insert(new_materials.begin(), new_materials.end());
        } catch ($e3) {
          if ($e3 instanceof $.StdMeshMaterialError) {
            const ex = $e3;
            $.DebugLogF(S("Failed to read material script: %s"), ex.what());
          } else {
            throw $e3;
          }
        }
      }
    }
  }

  LoadParticleDef(hGroup) {
    let fSuccess = true;
    if (hGroup.AccessEntry(S("Particle.txt"))) {
      fSuccess = false;
      let pParticleDef = new $.C4ParticleDef().init();
      if (!pParticleDef.Load(hGroup)) {
        $delete(pParticleDef);
      }
    }
    return fSuccess;
  }

  LoadSolidMask(hGroup) {
    if (hGroup.FindEntry$pi8$pStdStrBuf$pu64(S("SolidMask.png"))) {
      this.pSolidMask = $.C4SolidMask.LoadMaskFromFile(hGroup, S("SolidMask.png"));
      if (this.pSolidMask == null) {
        $.DebugLogF(S("  Error loading SolidMask of %s (%s)"), hGroup.GetFullName().getData(), this.id.ToString());
        return false;
      }
      if (this.SolidMask.x < 0 || this.SolidMask.y < 0 || (this.SolidMask.x + this.SolidMask.Wdt | 0) > this.pSolidMask.Wdt || (this.SolidMask.y + this.SolidMask.Hgt | 0) > this.pSolidMask.Hgt) {
        this.SolidMask.Default();
      }
    } else if (this.SolidMask.Wdt !== 0) {
      $.DebugLogF(S("WARNING: Definition %s (%s) defines SolidMask in DefCore but has no SolidMask file!"), hGroup.GetFullName().getData(), this.id.ToString());
      this.SolidMask.Default();
    }
    return true;
  }

  LoadGraphics(hGroup, loader) {
    this.Graphics.Load(hGroup, loader, !(this.ColorByOwner === 0));
    if (this.Graphics.Type === 1) {
      if (this.Graphics.GetBitmap() != null) {
        this.MainFace.Set$pC4Surface$f32$f32$f32$f32(null, Math.fround(0), Math.fround(0), Math.fround(this.Shape.Wdt), Math.fround(this.Shape.Hgt));
      }
      if (this.PictureRect.Wdt === 0 || this.PictureRect.Hgt === 0) {
        this.PictureRect.Set$i32$i32$i32$i32(0, 0, Math.imul(this.Shape.Wdt, this.Graphics.$u1.Bmp.Bitmap.Scale), Math.imul(this.Shape.Hgt, this.Graphics.$u1.Bmp.Bitmap.Scale));
      }
      if (this.TopFace.x < 0 || this.TopFace.y < 0 || (this.TopFace.x + this.TopFace.Wdt | 0) > this.Graphics.$u1.Bmp.Bitmap.Wdt || (this.TopFace.y + this.TopFace.Hgt | 0) > this.Graphics.$u1.Bmp.Bitmap.Hgt) {
        this.TopFace.Default();
        $.DebugLogF(S("invalid TopFace in %s (%s)"), this.GetName(), this.id.ToString());
      }
    } else {
      this.TopFace.Default();
    }
    return true;
  }

  LoadScript(hGroup, szLanguage) {
    this.Script.Reg2List($.ScriptEngine);
    this.Script.Load$rC4Group$pi8$pi8$pC4LangStringTable(hGroup, S("Script.c|Script%s.c|C4Script%s.c"), szLanguage, this.StringTable);
  }

  LoadClonkNames(hGroup, pClonkNames, szLanguage) {
    $delete(pClonkNames);
    pClonkNames = null;
    if (hGroup.FindEntry$pi8$pStdStrBuf$pu64(S("ClonkNames*.txt"))) {
      pClonkNames = new $.C4ComponentHost().init();
      if (!$.C4Language.LoadComponentHost(pClonkNames, hGroup, S("ClonkNames%s.txt|ClonkNames.txt"), szLanguage)) {
        $delete(pClonkNames);
        pClonkNames = null;
      } else {
        this.fClonkNamesOwned = true;
      }
    }
  }

  LoadRankNames(hGroup, szLanguage) {
    $delete(this.pRankNames);
    this.pRankNames = null;
    if (hGroup.FindEntry$pi8$pStdStrBuf$pu64(S("Rank*.txt"))) {
      this.pRankNames = new $.C4RankSystem().init();
      if (!this.pRankNames.Load(hGroup, S("Rank%s.txt|Rank.txt"), 1000, szLanguage)) {
        $delete(this.pRankNames);
        this.pRankNames = null;
      } else {
        this.fRankNamesOwned = true;
      }
    }
  }

  LoadRankFaces(hGroup) {
    $delete(this.pRankSymbols);
    this.pRankSymbols = null;
    if (hGroup.AccessEntry(S("Rank.png"))) {
      this.pRankSymbols = new $.C4FacetSurface().init();
      if (!this.pRankSymbols.GetFace().ReadPNG(hGroup, 0)) {
        $delete(this.pRankSymbols);
        this.pRankSymbols = null;
      }
    }
    if (this.pRankSymbols != null) {
      this.pRankSymbols.Set$pC4Surface$i32$i32$i32$i32(this.pRankSymbols.GetFace(), 0, 0, this.pRankSymbols.GetFace().Hgt, this.pRankSymbols.GetFace().Hgt);
      const Q = [0];
      this.pRankSymbols.GetPhaseNum(P(this, "iNumRankSymbols"), P(Q, 0));
      if (this.iNumRankSymbols === 0) {
        $delete(this.pRankSymbols);
        this.pRankSymbols = null;
      } else {
        if (this.pRankNames != null) {
          this.iNumRankSymbols = $max(1, this.iNumRankSymbols - this.pRankNames.GetExtendedRankNum() | 0);
        }
        this.fRankSymbolsOwned = true;
      }
    }
  }

  LoadSounds(hGroup, pSoundSystem) {
    if (pSoundSystem != null) {
      pSoundSystem.LoadEffects(hGroup, this.id.op_eq($.C4ID.None) ? null : this.id.ToString(), true);
    }
  }

  init() {
    super.init($.ScriptEngine.GetPropList(), null, null);
    this.id = new $.C4ID().init$v();
    this.RequireDef = new $.C4IDList().init();
    this.Shape = new $.C4Shape();
    this.Entrance = new $.C4Rect();
    this.Collection = new $.C4Rect();
    this.PictureRect = new $.C4Rect();
    this.SolidMask = new $.C4TargetRect();
    this.TopFace = new $.C4TargetRect();
    this.BurnTurnTo = new $.C4ID().init$v();
    this.mesh_materials = new StdSet((a, b) => a.op_lt(b));
    this.ConsoleGroupPath = new $.StdCopyStrBuf();
    this.Script = new $.C4DefScriptHost().init();
    this.StringTable = new $.C4LangStringTable().init();
    this.Graphics = new $.C4DefGraphics().init();
    this.MainFace = new $.C4Facet().init$v();
    this.Script.SetDef(this);
    0;
    this.Graphics.pDef = this;
    C4Def.prototype.Default.call(this);
    return this;
  }

  $dtor() {
    C4Def.prototype.Clear.call(this);
    super.$dtor();
  }

  Clear() {
    $.C4ScriptHost.prototype.Clear.call(this.Script);
    $.C4PropList.prototype.Clear.call(this);
    this.Graphics.Clear();
    $.C4ComponentHost.prototype.Clear.call(this.StringTable);
    if (this.fClonkNamesOwned) {
      $delete(this.pClonkNames);
    }
    this.pClonkNames = null;
    if (this.fRankNamesOwned) {
      $delete(this.pRankNames);
    }
    this.pRankNames = null;
    if (this.fRankSymbolsOwned) {
      $delete(this.pRankSymbols);
    }
    this.pRankSymbols = null;
    this.fClonkNamesOwned = this.fRankNamesOwned = this.fRankSymbolsOwned = false;
    $delete(this.pSolidMask);
    this.pSolidMask = null;
  }

  Default() {
    this.DefaultDefCore();
    this.Next = null;
    this.Temporary = false;
    this.Filename[0] = 0;
    this.Creation = 0;
    this.Count = 0;
    this.MainFace.Set$pC4Surface$f32$f32$f32$f32(null, Math.fround(0), Math.fround(0), Math.fround(0), Math.fround(0));
    $.C4ScriptHost.prototype.Clear.call(this.Script);
    $.C4ComponentHost.prototype.Clear.call(this.StringTable);
    this.pClonkNames = null;
    this.pRankNames = null;
    this.pRankSymbols = null;
    this.fClonkNamesOwned = this.fRankNamesOwned = this.fRankSymbolsOwned = false;
    this.iNumRankSymbols = 1;
    this.pSolidMask = null;
  }

  Load(hGroup, loader, dwLoadWhat, szLanguage, pSoundSystem = null, gfx_backup = null) {
    let AddFileMonitoring = false;
    if ($.Game.pFileMonitor != null && !$.SEqual(hGroup.GetFullName().getData(), P(this.Filename, 0)) && !hGroup.IsPacked()) {
      AddFileMonitoring = true;
    }
    $.SCopy$pi8$pi8(hGroup.GetFullName().getData(), P(this.Filename, 0));
    if ($.Config.Graphics.VerboseObjectLoading >= 3) {
      $.Log(hGroup.GetFullName().getData());
    }
    if (AddFileMonitoring) {
      $.Game.pFileMonitor.AddDirectory(P(this.Filename, 0));
    }
    hGroup.PreCacheEntries(S("*.glsl"));
    hGroup.PreCacheEntries(S("*.png|*.bmp|*.jpeg|*.jpg"));
    this.LoadMeshMaterials(hGroup, gfx_backup);
    let fSuccess = this.LoadParticleDef(hGroup);
    if (fSuccess) {
      fSuccess = this.LoadDefCore(hGroup);
    }
    if (fSuccess && $.Game.C4S.Definitions.SkipDefs.GetIDCount(this.id.$clone(), 1) !== 0) {
      return false;
    }
    if ((dwLoadWhat & 64) >>> 0 !== 0) {
      this.LoadSounds(hGroup, pSoundSystem);
    }
    if (!fSuccess) {
      return false;
    }
    if (!this.LoadSolidMask(hGroup)) {
      return false;
    }
    if ((dwLoadWhat & 2) >>> 0 !== 0 && !this.LoadGraphics(hGroup, loader)) {
      return false;
    }
    $.C4Language.LoadComponentHost(this.StringTable, hGroup, S("StringTbl.txt|StringTbl%s.txt"), szLanguage);
    $.ScriptEngine.RegisterGlobalConstant(this.id.ToString(), $.C4VPropList(this));
    this.ParentKeyName.op_assign$pC4String($.Strings.RegString$pi8(this.id.ToString()));
    if ((dwLoadWhat & 4) >>> 0 !== 0) {
      this.LoadScript(hGroup, szLanguage);
    }
    if ((dwLoadWhat & 128) >>> 0 !== 0) {
      this.LoadClonkNames(hGroup, this.pClonkNames, szLanguage);
    }
    if ((dwLoadWhat & 256) >>> 0 !== 0) {
      this.LoadRankNames(hGroup, szLanguage);
    }
    if ((dwLoadWhat & 512) >>> 0 !== 0) {
      this.LoadRankFaces(hGroup);
    }
    if ((dwLoadWhat & 1024) >>> 0 !== 0) {
      this.Temporary = true;
    }
    return true;
  }

  Draw$rC4Facet$b$u32$pC4Object$i32$i32$pC4DrawTransform$pi8(cgo, fSelected = false, iColor = 0, pObj = null, iPhaseX = 0, iPhaseY = 0, trans = null, graphicsName = null) {
    if (fSelected) {
      $.pDraw.DrawBoxDw(cgo.Surface, ftoi32(cgo.X), ftoi32(cgo.Y), ftoi32(Math.fround(Math.fround(cgo.X + cgo.Wdt) - Math.fround(1))), ftoi32(Math.fround(Math.fround(cgo.Y + cgo.Hgt) - Math.fround(1))), 0xffca0000);
    }
    let graphics = pObj != null ? pObj.GetGraphics() : this.Graphics;
    if (graphicsName != null) {
      let other = graphics.Get(graphicsName);
      if (other != null) {
        graphics = other;
      }
    }
    graphics.Draw(cgo, iColor, pObj, iPhaseX, iPhaseY, trans);
  }

  GetMainFace(pGraphics, dwClr = 0) {
    this.MainFace.Surface = pGraphics.GetBitmap(dwClr);
    return this.MainFace;
  }

  GetPlane$v() {
    return this.GetPropertyInt(78 /*P_Plane*/);
  }

  GetValue(pInBase$, iBuyPlayer$) {
    const pInBase = [pInBase$];
    const iBuyPlayer = [iBuyPlayer$];
    let r = this.Call$pi8$pC4AulParSet$b(S("~CalcDefValue"), new $.C4AulParSet().init$rpC4Object$ri32(P(pInBase, 0), P(iBuyPlayer, 0)).op_and());
    const iValue = [this.Value];
    if (r.op_ne($.C4VNull)) {
      iValue[0] = r.getInt();
    }
    if (pInBase[0] != null) {
      r.$assign(pInBase[0].Call$pi8$pC4AulParSet$b(S("~CalcBuyValue"), new $.C4AulParSet().init$mpC4Def$ri32(this, P(iValue, 0)).op_and()));
      if (r.op_ne($.C4VNull)) {
        iValue[0] = r.getInt();
      }
    }
    return iValue[0];
  }

  Synchronize() {
  }

  GetDef$v$c() {
    return this;
  }

  GetDef$v() {
    return this;
  }

  Delete() {
    return false;
  }

  IncludeDefinition(pIncludeDef) {
    if (!this.fClonkNamesOwned) {
      this.pClonkNames = pIncludeDef.pClonkNames;
    }
    if (!this.fRankNamesOwned) {
      this.pRankNames = pIncludeDef.pRankNames;
    }
    if (!this.fRankSymbolsOwned) {
      this.pRankSymbols = pIncludeDef.pRankSymbols;
      this.iNumRankSymbols = pIncludeDef.iNumRankSymbols;
    }
  }

  ResetIncludeDependencies() {
    if (!this.fClonkNamesOwned) {
      this.pClonkNames = null;
    }
    if (!this.fRankNamesOwned) {
      this.pRankNames = null;
    }
    if (!this.fRankSymbolsOwned) {
      this.pRankSymbols = null;
      this.iNumRankSymbols = 0;
    }
  }

  GetActionByName$pi8(actname) {
    if (actname == null) {
      return null;
    }
    let actname_str = $.Strings.RegString$pi8(actname);
    actname_str.IncRef();
    let r = this.GetActionByName$pC4String(actname_str);
    actname_str.DecRef();
    return r;
  }

  GetActionByName$pC4String(actname) {
    0;
    if (actname == null || actname === $oat($.Strings.P, 52 /*P_Idle*/)) {
      return null;
    }
    let ActMap = new $.C4Value().init$v();
    this.GetProperty(15 /*P_ActMap*/, ActMap);
    if (!(ActMap.getPropList() != null)) {
      return null;
    }
    let Action = new $.C4Value().init$v();
    ActMap.getPropList().GetPropertyByS(actname, Action);
    if (!(Action.getPropList() != null)) {
      return null;
    }
    return Action.getPropList();
  }

  $clone() { return new C4Def().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.id.$assign(o.id);
    this.rC4XVer = o.rC4XVer.slice();
    this.RequireDef.$assign(o.RequireDef);
    this.Shape.$assign(o.Shape);
    this.Entrance.$assign(o.Entrance);
    this.Collection.$assign(o.Collection);
    this.PictureRect.$assign(o.PictureRect);
    this.SolidMask.$assign(o.SolidMask);
    this.TopFace.$assign(o.TopFace);
    this.BurnTurnTo.$assign(o.BurnTurnTo);
    this.GrowthType = o.GrowthType;
    this.CrewMember = o.CrewMember;
    this.NativeCrew = o.NativeCrew;
    this.Mass = o.Mass;
    this.Value = o.Value;
    this.Exclusive = o.Exclusive;
    this.Category = o.Category;
    this.Constructable = o.Constructable;
    this.Rotateable = o.Rotateable;
    this.Float = o.Float;
    this.ColorByOwner = o.ColorByOwner;
    this.NoHorizontalMove = o.NoHorizontalMove;
    this.LiftTop = o.LiftTop;
    this.GrabPutGet = o.GrabPutGet;
    this.UprightAttach = o.UprightAttach;
    this.Line = o.Line;
    this.LineIntersect = o.LineIntersect;
    this.IncompleteActivity = o.IncompleteActivity;
    this.Oversize = o.Oversize;
    this.Fragile = o.Fragile;
    this.Projectile = o.Projectile;
    this.NoPushEnter = o.NoPushEnter;
    this.VehicleControl = o.VehicleControl;
    this.Pathfinder = o.Pathfinder;
    this.MoveToRange = o.MoveToRange;
    this.NoMassFromContents = o.NoMassFromContents;
    this.NoStabilize = o.NoStabilize;
    this.ClosedContainer = o.ClosedContainer;
    this.SilentCommands = o.SilentCommands;
    this.TemporaryCrew = o.TemporaryCrew;
    this.BlitMode = o.BlitMode;
    this.NoBreath = o.NoBreath;
    this.ConSizeOff = o.ConSizeOff;
    this.NoGet = o.NoGet;
    this.RotatedEntrance = o.RotatedEntrance;
    this.NoTransferZones = o.NoTransferZones;
    this.AllowPictureStack = o.AllowPictureStack;
    this.HideInCreator = o.HideInCreator;
    this.mesh_materials = o.mesh_materials.$clone();
    this.Filename = o.Filename.slice();
    this.ConsoleGroupPath.$assign(o.ConsoleGroupPath);
    this.Creation = o.Creation;
    this.Count = o.Count;
    this.Script.$assign(o.Script);
    this.StringTable.$assign(o.StringTable);
    this.pClonkNames = o.pClonkNames;
    this.fClonkNamesOwned = o.fClonkNamesOwned;
    this.pRankNames = o.pRankNames;
    this.fRankNamesOwned = o.fRankNamesOwned;
    this.pRankSymbols = o.pRankSymbols;
    this.fRankSymbolsOwned = o.fRankSymbolsOwned;
    this.iNumRankSymbols = o.iNumRankSymbols;
    this.Graphics.$assign(o.Graphics);
    this.pSolidMask = o.pSolidMask;
    this.MainFace.$assign(o.MainFace);
    this.Next = o.Next;
    this.Temporary = o.Temporary;
    return this;
  }
}













































export function $init(): void {
  $.C4D_None$C4Def = 0;
  $.C4D_All$C4Def = -1;
  $.C4D_StaticBack$C4Def = 1;
  $.C4D_Structure$C4Def = 2;
  $.C4D_Vehicle$C4Def = 4;
  $.C4D_Living$C4Def = 8;
  $.C4D_Object$C4Def = 16;
  $.C4D_Goal$C4Def = 32;
  $.C4D_Rule$C4Def = 64;
  $.C4D_Environment$C4Def = 128;
  $.C4D_Background$C4Def = 4096;
  $.C4D_Parallax$C4Def = 8192;
  $.C4D_MouseSelect$C4Def = 16384;
  $.C4D_Foreground$C4Def = 32768;
  $.C4D_MouseIgnore$C4Def = 65536;
  $.C4D_IgnoreFoW$C4Def = 131072;
  $.C4D_SortLimit$C4Def = 36895;
  $.C4Plane_Structure$C4Def = 200;
  $.C4D_Grab_Put$C4Def = 1;
  $.C4D_Grab_Get$C4Def = 2;
  $.C4D_Border_Sides$C4Def = 1;
  $.C4D_Border_Top$C4Def = 2;
  $.C4D_Border_Bottom$C4Def = 4;
  $.C4D_Border_Layer$C4Def = 8;
  $.C4D_Place_Surface$C4Def = 0;
  $.C4D_Place_Liquid$C4Def = 1;
  $.C4D_Place_Air$C4Def = 2;
  $.C4D_Place_Subsurface$C4Def = 3;
  $.C4D_Place_BothSurface$C4Def = 4;
  $.C4D_VehicleControl_None$C4Def = 0;
  $.C4D_VehicleControl_Outside$C4Def = 1;
  $.C4D_VehicleControl_Inside$C4Def = 2;
  $.C4D_Load_None$C4Def = 0;
  $.C4D_Load_Picture$C4Def = 1;
  $.C4D_Load_Bitmap$C4Def = 2;
  $.C4D_Load_Script$C4Def = 4;
  $.C4D_Load_Image$C4Def = 32;
  $.C4D_Load_Sounds$C4Def = 64;
  $.C4D_Load_ClonkNames$C4Def = 128;
  $.C4D_Load_RankNames$C4Def = 256;
  $.C4D_Load_RankFaces$C4Def = 512;
  $.C4D_Load_FE$C4Def = 32;
  $.C4D_Load_RX$C4Def = 966;
  $.C4D_Load_Temporary$C4Def = 1024;
}

Object.assign($, { C4Def, C4DefAdditionalResourcesLoader });
