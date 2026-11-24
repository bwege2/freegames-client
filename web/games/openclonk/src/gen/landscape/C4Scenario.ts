// @ts-nocheck
// OpenClonk 36de799: src/landscape/C4Scenario.cpp, src/landscape/C4Scenario.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { Random } from '../../rt/native.ts';
import { $oarr, $own, $peq, $rd, $wr, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete, $max, $min, StdString } from '../../rt/std.ts';

export class C4SVal {
  static $layout = [["Std", 0, "i32", 0], ["Rnd", 4, "i32", 0], ["Min", 8, "i32", 0], ["Max", 12, "i32", 0]];
  static $size = 16;
  Std = 0;
  Rnd = 0;
  Min = 0;
  Max = 0;

  init(std = 0, rnd = 0, min = 0, max = 100) {
    this.Std = std;
    this.Rnd = rnd;
    this.Min = min;
    this.Max = max;
    return this;
  }

  Default() {
    this.Set();
  }

  Set(std = 0, rnd = 0, min = 0, max = 100) {
    this.Std = std;
    this.Rnd = rnd;
    this.Min = min;
    this.Max = max;
  }

  SetConstant(val) {
    this.Std = val;
    this.Rnd = 0;
    this.Min = $min(this.Min, val);
    this.Max = $max(this.Max, val);
  }

  Evaluate() {
    return $.Clamp$i32$i32$i32(((this.Std >>> 0) + Random((Math.imul(2, this.Rnd) + 1 | 0) >>> 0) >>> 0) - (this.Rnd >>> 0) >>> 0 | 0, this.Min, this.Max);
  }

  CompileFunc(pComp) {
    pComp.Value$StdDefaultAdapt$i32$i32($.mkDefaultAdapt$ri32$i32(P(this, "Std"), 0));
    if (!pComp.Separator()) {
      return;
    }
    pComp.Value$StdDefaultAdapt$i32$i32($.mkDefaultAdapt$ri32$i32(P(this, "Rnd"), 0));
    if (!pComp.Separator()) {
      return;
    }
    pComp.Value$StdDefaultAdapt$i32$i32($.mkDefaultAdapt$ri32$i32(P(this, "Min"), 0));
    if (!pComp.Separator()) {
      return;
    }
    pComp.Value$StdDefaultAdapt$i32$i32($.mkDefaultAdapt$ri32$i32(P(this, "Max"), 100));
  }

  op_eq(rhs) {
    return rhs.Std === this.Std && rhs.Rnd === this.Rnd && rhs.Min === this.Min && rhs.Max === this.Max;
  }

  $clone() { return new C4SVal().$assign(this); }
  $assign(o) {
    this.Std = o.Std;
    this.Rnd = o.Rnd;
    this.Min = o.Min;
    this.Max = o.Max;
    return this;
  }
}

export class C4SHead {
  C4XVer = new Int32Array(2);
  Title = new StdString();
  Loader = new StdString();
  Font = new StdString();
  Difficulty = 0;
  Icon = 0;
  NoInitialize = false;
  MaxPlayer = 0;
  MinPlayer = 0;
  MaxPlayerLeague = 0;
  SaveGame = false;
  Replay = false;
  Film = 0;
  RandomSeed = 0;
  Engine = new StdString();
  MissionAccess = new StdString();
  Secret = false;
  NetworkGame = false;
  NetworkRuntimeJoin = false;
  Origin = new $.StdCopyStrBuf();

  Default() {
    this.Origin.Clear();
    this.Icon = 18;
    this.Title.clear();
    this.Loader.clear();
    this.Font.clear();
    this.Engine.clear();
    this.MissionAccess.clear();
    this.Secret = false;
    this.C4XVer[0] = this.C4XVer[1] = 0;
    this.Difficulty = this.RandomSeed = 0;
    this.SaveGame = this.Replay = this.NoInitialize = false;
    this.Film = 0;
    this.NetworkGame = this.NetworkRuntimeJoin = false;
    this.MaxPlayer = this.MaxPlayerLeague = 12;
    this.MinPlayer = 0;
    this.Title.assign(S("Default Title"));
  }

  CompileFunc(pComp, fSection) {
    if (!fSection) {
      pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Icon"), S("Icon"), 18));
      pComp.Value$StdNamingDefaultAdapt$StdStdStringAdapt$x($.mkNamingAdapt$mStdStdStringAdapt$pi8$x$b$b($.mkStringAdaptA(this.Title), S("Title"), S("Default Title")));
      pComp.Value$StdNamingDefaultAdapt$StdStdStringAdapt$x$2($.mkNamingAdapt$mStdStdStringAdapt$pi8$x$b$b$2($.mkStringAdaptA(this.Loader), S("Loader"), S("")));
      pComp.Value$StdNamingDefaultAdapt$StdStdStringAdapt$x$2($.mkNamingAdapt$mStdStdStringAdapt$pi8$x$b$b$2($.mkStringAdaptA(this.Font), S("Font"), S("")));
      pComp.Value$StdNamingAdapt$StdArrayDefaultAdapt$i32$i32$_IdFuncClass$i32($.mkNamingAdapt$mStdArrayDefaultAdapt$i32$i32$_IdFuncClass$i32$pi8($.mkArrayAdaptDM(this.C4XVer, 0), S("Version")));
      pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Difficulty"), S("Difficulty"), 0));
      pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "MaxPlayer"), S("MaxPlayer"), $.C4S_MaxPlayerDefault$C4Scenario));
      pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "MaxPlayerLeague"), S("MaxPlayerLeague"), this.MaxPlayer));
      pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "MinPlayer"), S("MinPlayer"), 0));
      pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "SaveGame"), S("SaveGame"), false));
      pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "Replay"), S("Replay"), false));
      pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Film"), S("Film"), 0));
    }
    pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "NoInitialize"), S("NoInitialize"), false));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "RandomSeed"), S("RandomSeed"), 0));
    if (!fSection) {
      pComp.Value$StdNamingDefaultAdapt$StdStdStringAdapt$x$2($.mkNamingAdapt$mStdStdStringAdapt$pi8$x$b$b$2($.mkStringAdaptA(this.Engine), S("Engine"), S("")));
      pComp.Value$StdNamingDefaultAdapt$StdStdStringAdapt$x$2($.mkNamingAdapt$mStdStdStringAdapt$pi8$x$b$b$2($.mkStringAdaptA(this.MissionAccess), S("MissionAccess"), S("")));
      pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "Secret"), S("Secret"), false));
      pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "NetworkGame"), S("NetworkGame"), false));
      pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "NetworkRuntimeJoin"), S("NetworkRuntimeJoin"), false));
      pComp.Value$StdNamingDefaultAdapt$C4StrValAdapt$StdParameterAdapt$StdCopyStrBuf$i32$StdCopyStrBuf($.mkNamingAdapt$mC4StrValAdapt$StdParameterAdapt$StdCopyStrBuf$i32$pi8$StdCopyStrBuf$b$b($.mkStrValAdapt($.mkParAdapt$rStdCopyStrBuf$mi32(this.Origin, 1 /*RCT_All*/), 1 /*VAL_SubPathFilename*/), S("Origin"), new $.StdCopyStrBuf()));
      if (pComp.isDeserializer()) {
        this.Origin.ReplaceChar(92, 47);
      }
    }
  }

  None() {
    this.Title = new StdString();
    this.Loader = new StdString();
    this.Font = new StdString();
    this.Engine = new StdString();
    this.MissionAccess = new StdString();
    this.Origin = new $.StdCopyStrBuf();
    return this;
  }

  $clone() { return new C4SHead().$assign(this); }
  $assign(o) {
    this.C4XVer = o.C4XVer.slice();
    this.Title = o.Title.$clone();
    this.Loader = o.Loader.$clone();
    this.Font = o.Font.$clone();
    this.Difficulty = o.Difficulty;
    this.Icon = o.Icon;
    this.NoInitialize = o.NoInitialize;
    this.MaxPlayer = o.MaxPlayer;
    this.MinPlayer = o.MinPlayer;
    this.MaxPlayerLeague = o.MaxPlayerLeague;
    this.SaveGame = o.SaveGame;
    this.Replay = o.Replay;
    this.Film = o.Film;
    this.RandomSeed = o.RandomSeed;
    this.Engine = o.Engine.$clone();
    this.MissionAccess = o.MissionAccess.$clone();
    this.Secret = o.Secret;
    this.NetworkGame = o.NetworkGame;
    this.NetworkRuntimeJoin = o.NetworkRuntimeJoin;
    this.Origin.$assign(o.Origin);
    return this;
  }
}

export class C4SDefinitions {
  LocalOnly = false;
  AllowUserChange = false;
  SkipDefs = new $.C4IDList().init();
  Definition = $oarr(10, () => new Int8Array(4097));

  SetModules(szList, szRelativeToPath = null, szRelativeToPath2 = null) {
    let cnt = 0;
    if (!($.SModuleCount(szList) !== 0)) {
      this.LocalOnly = true;
      for (cnt = 0; cnt < 10; cnt = cnt + 1 | 0) {
        this.Definition[cnt][0] = 0;
      }
      return;
    }
    this.LocalOnly = false;
    for (cnt = 0; cnt < 10; cnt = cnt + 1 | 0) {
      $.SGetModule(szList, cnt, P(this.Definition[cnt], 0), 4096);
      if (szRelativeToPath != null && szRelativeToPath.a[szRelativeToPath.o] !== 0) {
        if (!$peq($.GetRelativePathS(P(this.Definition[cnt], 0), szRelativeToPath), P(this.Definition[cnt], 0))) {
          $.SCopy$pi8$pi8($.GetRelativePathS(P(this.Definition[cnt], 0), szRelativeToPath), P(this.Definition[cnt], 0));
          continue;
        }
      }
      if (szRelativeToPath2 != null && szRelativeToPath2.a[szRelativeToPath2.o] !== 0) {
        if (!$peq($.GetRelativePathS(P(this.Definition[cnt], 0), szRelativeToPath2), P(this.Definition[cnt], 0))) {
          $.SCopy$pi8$pi8($.GetRelativePathS(P(this.Definition[cnt], 0), szRelativeToPath2), P(this.Definition[cnt], 0));
          continue;
        }
      }
    }
  }

  GetModules(psOutModules) {
    if (this.LocalOnly) {
      psOutModules.Copy$pi8(S(""));
      return true;
    }
    let fSpecified = false;
    let cnt = 0;
    for (; cnt < 10; cnt = cnt + 1 | 0) {
      if (this.Definition[cnt][0] !== 0) {
        fSpecified = true;
      }
    }
    if (!fSpecified) {
      return false;
    }
    psOutModules.Copy$pi8(S(""));
    for (cnt = 0; cnt < 10; cnt = cnt + 1 | 0) {
      if (this.Definition[cnt][0] !== 0) {
        if (psOutModules.getLength() !== 0) {
          psOutModules.AppendChar(59);
        }
        psOutModules.Append$pi8(P(this.Definition[cnt], 0));
      }
    }
    return true;
  }

  GetModulesAsList() {
    let result = [];
    if (!this.LocalOnly) {
      for (const def of this.Definition) {
        if (def.a[def.o] !== 0) {
          result.push(def);
        }
      }
    }
    return result;
  }

  Default() {
    this.LocalOnly = this.AllowUserChange = false;
    $.ZeroMem$x$u64$2(P(this.Definition, 0), 40970);
    this.SkipDefs.Default();
  }

  CompileFunc(pComp) {
    pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "LocalOnly"), S("LocalOnly"), false));
    pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "AllowUserChange"), S("AllowUserChange"), false));
    pComp.Value$StdNamingDefaultAdapt$StdStringAdapt$x$3($.mkNamingAdapt$mStdStringAdapt$pi8$x$b$b$3($.mkStringAdaptMA$5(this.Definition[0]), S("Definition1"), S("Objects.ocd")));
    for (let i = 1; i < 10; i = i + 1 | 0) {
      pComp.Value$StdNamingDefaultAdapt$StdStringAdapt$x$5($.mkNamingAdapt$mStdStringAdapt$pi8$x$b$b$5($.mkStringAdaptMA$5(this.Definition[i]), $.FormatString(S("Definition%i"), i + 1 | 0).getData(), S("")));
    }
    pComp.Value$StdNamingDefaultAdapt$C4IDList$C4IDList($.mkNamingAdapt$rC4IDList$pi8$C4IDList$b$b(this.SkipDefs, S("SkipDefs"), new $.C4IDList().init()));
  }

  None() {
    this.SkipDefs = new $.C4IDList().init();
    return this;
  }

  $clone() { return new C4SDefinitions().$assign(this); }
  $assign(o) {
    this.LocalOnly = o.LocalOnly;
    this.AllowUserChange = o.AllowUserChange;
    this.SkipDefs.$assign(o.SkipDefs);
    this.Definition = $own(o.Definition.map(($e0) => $e0.slice()));
    return this;
  }
}

export class C4SRealism {
  ValueOverloads = new $.C4IDList().init();
  LandscapePushPull = false;
  LandscapeInsertThrust = false;

  Default() {
    this.LandscapePushPull = false;
    this.LandscapeInsertThrust = false;
    this.ValueOverloads.Default();
  }

  None() {
    this.ValueOverloads = new $.C4IDList().init();
    return this;
  }

  $clone() { return new C4SRealism().$assign(this); }
  $assign(o) {
    this.ValueOverloads.$assign(o.ValueOverloads);
    this.LandscapePushPull = o.LandscapePushPull;
    this.LandscapeInsertThrust = o.LandscapeInsertThrust;
    return this;
  }
}

export class C4SGame {
  Mode = new $.StdCopyStrBuf();
  Goals = new $.C4IDList().init();
  Rules = new $.C4IDList().init();
  FoWEnabled = false;
  Realism = new C4SRealism().None();
  EvaluateOnAbort = false;

  IsMelee() {
    if (this.Mode.op_eq$pi8(S("Melee")) || this.Mode.op_eq$pi8(S("Parkour"))) {
      return true;
    }
    return false;
  }

  Default() {
    this.Goals.Clear();
    this.Rules.Clear();
    this.FoWEnabled = true;
    this.EvaluateOnAbort = false;
  }

  CompileFunc(pComp, fSection) {
    if (!fSection) {
      pComp.Value$StdNamingDefaultAdapt$C4IDList$C4IDList($.mkNamingAdapt$rC4IDList$pi8$C4IDList$b$b(this.Realism.ValueOverloads, S("ValueOverloads"), new $.C4IDList().init()));
    }
    pComp.Value$StdNamingDefaultAdapt$StdRuntimeValueAdapt$b$b($.mkNamingAdapt$mStdRuntimeValueAdapt$b$pi8$b$b$b($.mkRuntimeValueAdapt(P(this.Realism, "LandscapePushPull")), S("LandscapePushPull"), false));
    pComp.Value$StdNamingDefaultAdapt$StdRuntimeValueAdapt$b$b($.mkNamingAdapt$mStdRuntimeValueAdapt$b$pi8$b$b$b($.mkRuntimeValueAdapt(P(this.Realism, "LandscapeInsertThrust")), S("LandscapeInsertThrust"), true));
    pComp.Value$StdNamingDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$StdCopyStrBuf($.mkNamingAdapt$mStdParameterAdapt$StdCopyStrBuf$i32$pi8$StdCopyStrBuf$b$b($.mkParAdapt$rStdCopyStrBuf$mi32(this.Mode, 3 /*RCT_IdtfAllowEmpty*/), S("Mode"), new $.StdCopyStrBuf()));
    pComp.Value$StdNamingDefaultAdapt$C4IDList$C4IDList($.mkNamingAdapt$rC4IDList$pi8$C4IDList$b$b(this.Goals, S("Goals"), new $.C4IDList().init()));
    pComp.Value$StdNamingDefaultAdapt$C4IDList$C4IDList($.mkNamingAdapt$rC4IDList$pi8$C4IDList$b$b(this.Rules, S("Rules"), new $.C4IDList().init()));
    pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "FoWEnabled"), S("FoWEnabled"), true));
    pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "EvaluateOnAbort"), S("EvaluateOnAbort"), false));
  }

  None() {
    this.Mode = new $.StdCopyStrBuf();
    this.Goals = new $.C4IDList().init();
    this.Rules = new $.C4IDList().init();
    this.Realism = new C4SRealism().None();
    return this;
  }

  $clone() { return new C4SGame().$assign(this); }
  $assign(o) {
    this.Mode.$assign(o.Mode);
    this.Goals.$assign(o.Goals);
    this.Rules.$assign(o.Rules);
    this.FoWEnabled = o.FoWEnabled;
    this.Realism.$assign(o.Realism);
    this.EvaluateOnAbort = o.EvaluateOnAbort;
    return this;
  }
}

export class C4SPlrStart {
  Wealth = new C4SVal().init();
  Position = new Int32Array(2);
  EnforcePosition = 0;
  ReadyCrew = new $.C4IDList().init();
  ReadyBase = new $.C4IDList().init();
  ReadyVehic = new $.C4IDList().init();
  ReadyMaterial = new $.C4IDList().init();
  BuildKnowledge = new $.C4IDList().init();
  BaseMaterial = new $.C4IDList().init();
  BaseProduction = new $.C4IDList().init();

  Default() {
    this.Wealth.Set(0, 0, 0, 250);
    this.Position[0] = this.Position[1] = -1;
    this.EnforcePosition = 0;
    this.ReadyCrew.Default();
    this.ReadyBase.Default();
    this.ReadyVehic.Default();
    this.ReadyMaterial.Default();
    this.BuildKnowledge.Default();
    this.BaseMaterial.Default();
    this.BaseProduction.Default();
  }

  EquipmentEqual(rhs) {
    return this.op_eq(rhs);
  }

  op_eq(rhs) {
    return this.Wealth.op_eq(rhs.Wealth) && this.ReadyCrew.op_eq(rhs.ReadyCrew) && this.ReadyBase.op_eq(rhs.ReadyBase) && this.ReadyVehic.op_eq(rhs.ReadyVehic) && this.ReadyMaterial.op_eq(rhs.ReadyMaterial) && this.BuildKnowledge.op_eq(rhs.BuildKnowledge) && this.BaseMaterial.op_eq(rhs.BaseMaterial) && this.BaseProduction.op_eq(rhs.BaseProduction);
  }

  CompileFunc(pComp) {
    let crewDefault = new $.C4IDList().init();
    crewDefault.SetIDCount($.C4ID.Clonk.$clone(), 1, true);
    pComp.Value$StdNamingDefaultAdapt$C4SVal$C4SVal($.mkNamingAdapt$rC4SVal$pi8$C4SVal$b$b(this.Wealth, S("Wealth"), new C4SVal().init(0, 0, 0, 250), true));
    pComp.Value$StdNamingAdapt$StdArrayDefaultAdapt$i32$i32$_IdFuncClass$i32($.mkNamingAdapt$mStdArrayDefaultAdapt$i32$i32$_IdFuncClass$i32$pi8($.mkArrayAdaptDM(this.Position, -1), S("Position")));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "EnforcePosition"), S("EnforcePosition"), 0));
    pComp.Value$StdNamingDefaultAdapt$C4IDList$C4IDList($.mkNamingAdapt$rC4IDList$pi8$C4IDList$b$b(this.ReadyCrew, S("Crew"), crewDefault));
    pComp.Value$StdNamingDefaultAdapt$C4IDList$C4IDList($.mkNamingAdapt$rC4IDList$pi8$C4IDList$b$b(this.ReadyBase, S("Buildings"), new $.C4IDList().init()));
    pComp.Value$StdNamingDefaultAdapt$C4IDList$C4IDList($.mkNamingAdapt$rC4IDList$pi8$C4IDList$b$b(this.ReadyVehic, S("Vehicles"), new $.C4IDList().init()));
    pComp.Value$StdNamingDefaultAdapt$C4IDList$C4IDList($.mkNamingAdapt$rC4IDList$pi8$C4IDList$b$b(this.ReadyMaterial, S("Material"), new $.C4IDList().init()));
    pComp.Value$StdNamingDefaultAdapt$C4IDList$C4IDList($.mkNamingAdapt$rC4IDList$pi8$C4IDList$b$b(this.BuildKnowledge, S("Knowledge"), new $.C4IDList().init()));
    pComp.Value$StdNamingDefaultAdapt$C4IDList$C4IDList($.mkNamingAdapt$rC4IDList$pi8$C4IDList$b$b(this.BaseMaterial, S("BaseMaterial"), new $.C4IDList().init()));
    pComp.Value$StdNamingDefaultAdapt$C4IDList$C4IDList($.mkNamingAdapt$rC4IDList$pi8$C4IDList$b$b(this.BaseProduction, S("BaseProduction"), new $.C4IDList().init()));
  }

  None() {
    this.Wealth = new C4SVal().init();
    this.ReadyCrew = new $.C4IDList().init();
    this.ReadyBase = new $.C4IDList().init();
    this.ReadyVehic = new $.C4IDList().init();
    this.ReadyMaterial = new $.C4IDList().init();
    this.BuildKnowledge = new $.C4IDList().init();
    this.BaseMaterial = new $.C4IDList().init();
    this.BaseProduction = new $.C4IDList().init();
    return this;
  }

  $clone() { return new C4SPlrStart().$assign(this); }
  $assign(o) {
    this.Wealth.$assign(o.Wealth);
    this.Position = o.Position.slice();
    this.EnforcePosition = o.EnforcePosition;
    this.ReadyCrew.$assign(o.ReadyCrew);
    this.ReadyBase.$assign(o.ReadyBase);
    this.ReadyVehic.$assign(o.ReadyVehic);
    this.ReadyMaterial.$assign(o.ReadyMaterial);
    this.BuildKnowledge.$assign(o.BuildKnowledge);
    this.BaseMaterial.$assign(o.BaseMaterial);
    this.BaseProduction.$assign(o.BaseProduction);
    return this;
  }
}

export class C4SLandscape {
  ExactLandscape = false;
  VegLevel = new C4SVal().init();
  Vegetation = new $.C4IDList().init();
  InEarthLevel = new C4SVal().init();
  InEarth = new $.C4IDList().init();
  BottomOpen = 0;
  TopOpen = 0;
  LeftOpen = 0;
  RightOpen = 0;
  AutoScanSideOpen = 0;
  SkyDef = new StdString();
  SkyDefFade = new Int32Array(6);
  NoScan = false;
  Gravity = new C4SVal().init();
  MapWdt = new C4SVal().init();
  MapHgt = new C4SVal().init();
  MapZoom = new C4SVal().init();
  Amplitude = new C4SVal().init();
  Phase = new C4SVal().init();
  Period = new C4SVal().init();
  Random = new C4SVal().init();
  LiquidLevel = new C4SVal().init();
  MapPlayerExtend = 0;
  Layers = new $.C4NameList();
  Material = new StdString();
  Liquid = new StdString();
  KeepMapCreator = false;
  SkyScrollMode = 0;
  MaterialZoom = 0;
  FlatChunkShapes = false;
  Secret = false;

  Default() {
    let $t1;
    this.BottomOpen = 0;
    this.TopOpen = 1;
    this.LeftOpen = 0;
    this.RightOpen = 0;
    this.AutoScanSideOpen = 1;
    this.SkyDef.d[0] = 0;
    $t1 = this.SkyDefFade;
    for (let $i1 = 0; $i1 < $t1.length; $i1++) {
      const cnt = P($t1, $i1);
      cnt.a[cnt.o] = 0;
    }
    this.VegLevel.Set(50, 30, 0, 100);
    this.Vegetation.Default();
    this.InEarthLevel.Set(50, 0, 0, 100);
    this.InEarth.Default();
    this.MapWdt.Set(100, 0, 64, 250);
    this.MapHgt.Set(50, 0, 40, 250);
    this.MapZoom.Set(8, 0, 1, 15);
    this.Amplitude.Set(0, 0);
    this.Phase.Set(50);
    this.Period.Set(15);
    this.Random.Set(0);
    this.LiquidLevel.Default();
    this.MapPlayerExtend = 0;
    this.Layers.Clear();
    this.Material.assign(S("Earth"));
    this.Liquid.assign(S("Water"));
    this.ExactLandscape = false;
    this.Gravity.Set(100, 0, 10, 200);
    this.NoScan = false;
    this.KeepMapCreator = false;
    this.SkyScrollMode = 0;
    this.MaterialZoom = 4;
    this.FlatChunkShapes = false;
    this.Secret = false;
  }

  GetMapSize(rWdt, rHgt, iPlayerNum) {
    rWdt.a[rWdt.o] = this.MapWdt.Evaluate();
    rHgt.a[rHgt.o] = this.MapHgt.Evaluate();
    iPlayerNum = $max(iPlayerNum, 1);
    if (this.MapPlayerExtend !== 0) {
      rWdt.a[rWdt.o] = $min(Math.imul(rWdt.a[rWdt.o], $min(iPlayerNum, $.C4S_MaxMapPlayerExtend$C4Scenario)), this.MapWdt.Max);
    }
  }

  CompileFunc(pComp) {
    pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "ExactLandscape"), S("ExactLandscape"), false));
    pComp.Value$StdNamingDefaultAdapt$C4IDList$C4IDList($.mkNamingAdapt$rC4IDList$pi8$C4IDList$b$b(this.Vegetation, S("Vegetation"), new $.C4IDList().init()));
    pComp.Value$StdNamingDefaultAdapt$C4SVal$C4SVal($.mkNamingAdapt$rC4SVal$pi8$C4SVal$b$b(this.VegLevel, S("VegetationLevel"), new C4SVal().init(50, 30, 0, 100), true));
    pComp.Value$StdNamingDefaultAdapt$C4IDList$C4IDList($.mkNamingAdapt$rC4IDList$pi8$C4IDList$b$b(this.InEarth, S("InEarth"), new $.C4IDList().init()));
    pComp.Value$StdNamingDefaultAdapt$C4SVal$C4SVal($.mkNamingAdapt$rC4SVal$pi8$C4SVal$b$b(this.InEarthLevel, S("InEarthLevel"), new C4SVal().init(50, 0, 0, 100), true));
    pComp.Value$StdNamingDefaultAdapt$StdStdStringAdapt$x$2($.mkNamingAdapt$mStdStdStringAdapt$pi8$x$b$b$2($.mkStringAdaptA(this.SkyDef), S("Sky"), S("")));
    pComp.Value$StdNamingAdapt$StdArrayDefaultAdapt$i32$i32$_IdFuncClass$i32($.mkNamingAdapt$mStdArrayDefaultAdapt$i32$i32$_IdFuncClass$i32$pi8($.mkArrayAdaptDM$3(this.SkyDefFade, 0), S("SkyFade")));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "BottomOpen"), S("BottomOpen"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "TopOpen"), S("TopOpen"), 1));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "LeftOpen"), S("LeftOpen"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "RightOpen"), S("RightOpen"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "AutoScanSideOpen"), S("AutoScanSideOpen"), 1));
    pComp.Value$StdNamingDefaultAdapt$C4SVal$C4SVal($.mkNamingAdapt$rC4SVal$pi8$C4SVal$b$b(this.MapWdt, S("MapWidth"), new C4SVal().init(100, 0, 64, 250), true));
    pComp.Value$StdNamingDefaultAdapt$C4SVal$C4SVal($.mkNamingAdapt$rC4SVal$pi8$C4SVal$b$b(this.MapHgt, S("MapHeight"), new C4SVal().init(50, 0, 40, 250), true));
    pComp.Value$StdNamingDefaultAdapt$C4SVal$C4SVal($.mkNamingAdapt$rC4SVal$pi8$C4SVal$b$b(this.MapZoom, S("MapZoom"), new C4SVal().init(8, 0, 1, 15), true));
    pComp.Value$StdNamingDefaultAdapt$C4SVal$C4SVal($.mkNamingAdapt$rC4SVal$pi8$C4SVal$b$b(this.Amplitude, S("Amplitude"), new C4SVal().init(0)));
    pComp.Value$StdNamingDefaultAdapt$C4SVal$C4SVal($.mkNamingAdapt$rC4SVal$pi8$C4SVal$b$b(this.Phase, S("Phase"), new C4SVal().init(50)));
    pComp.Value$StdNamingDefaultAdapt$C4SVal$C4SVal($.mkNamingAdapt$rC4SVal$pi8$C4SVal$b$b(this.Period, S("Period"), new C4SVal().init(15)));
    pComp.Value$StdNamingDefaultAdapt$C4SVal$C4SVal($.mkNamingAdapt$rC4SVal$pi8$C4SVal$b$b(this.Random, S("Random"), new C4SVal().init(0)));
    pComp.Value$StdNamingDefaultAdapt$StdStdStringAdapt$x$3($.mkNamingAdapt$mStdStdStringAdapt$pi8$x$b$b$3($.mkStringAdaptA(this.Material), S("Material"), S("Earth")));
    pComp.Value$StdNamingDefaultAdapt$StdStdStringAdapt$x$3($.mkNamingAdapt$mStdStdStringAdapt$pi8$x$b$b$3($.mkStringAdaptA(this.Liquid), S("Liquid"), S("Water")));
    pComp.Value$StdNamingDefaultAdapt$C4SVal$C4SVal($.mkNamingAdapt$rC4SVal$pi8$C4SVal$b$b(this.LiquidLevel, S("LiquidLevel"), new C4SVal().init()));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "MapPlayerExtend"), S("MapPlayerExtend"), 0));
    pComp.Value$StdNamingDefaultAdapt$C4NameList$C4NameList($.mkNamingAdapt$rC4NameList$pi8$C4NameList$b$b(this.Layers, S("Layers"), new $.C4NameList()));
    pComp.Value$StdNamingDefaultAdapt$C4SVal$C4SVal($.mkNamingAdapt$rC4SVal$pi8$C4SVal$b$b(this.Gravity, S("Gravity"), new C4SVal().init(100, 0, 10, 200), true));
    pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "NoScan"), S("NoScan"), false));
    pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "KeepMapCreator"), S("KeepMapCreator"), false));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "SkyScrollMode"), S("SkyScrollMode"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "MaterialZoom"), S("MaterialZoom"), 4));
    pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "FlatChunkShapes"), S("FlatChunkShapes"), false));
    pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "Secret"), S("Secret"), false));
  }

  None() {
    this.VegLevel = new C4SVal().init();
    this.Vegetation = new $.C4IDList().init();
    this.InEarthLevel = new C4SVal().init();
    this.InEarth = new $.C4IDList().init();
    this.SkyDef = new StdString();
    this.Gravity = new C4SVal().init();
    this.MapWdt = new C4SVal().init();
    this.MapHgt = new C4SVal().init();
    this.MapZoom = new C4SVal().init();
    this.Amplitude = new C4SVal().init();
    this.Phase = new C4SVal().init();
    this.Period = new C4SVal().init();
    this.Random = new C4SVal().init();
    this.LiquidLevel = new C4SVal().init();
    this.Layers = new $.C4NameList();
    this.Material = new StdString();
    this.Liquid = new StdString();
    return this;
  }

  $clone() { return new C4SLandscape().$assign(this); }
  $assign(o) {
    this.ExactLandscape = o.ExactLandscape;
    this.VegLevel.$assign(o.VegLevel);
    this.Vegetation.$assign(o.Vegetation);
    this.InEarthLevel.$assign(o.InEarthLevel);
    this.InEarth.$assign(o.InEarth);
    this.BottomOpen = o.BottomOpen;
    this.TopOpen = o.TopOpen;
    this.LeftOpen = o.LeftOpen;
    this.RightOpen = o.RightOpen;
    this.AutoScanSideOpen = o.AutoScanSideOpen;
    this.SkyDef = o.SkyDef.$clone();
    this.SkyDefFade = o.SkyDefFade.slice();
    this.NoScan = o.NoScan;
    this.Gravity.$assign(o.Gravity);
    this.MapWdt.$assign(o.MapWdt);
    this.MapHgt.$assign(o.MapHgt);
    this.MapZoom.$assign(o.MapZoom);
    this.Amplitude.$assign(o.Amplitude);
    this.Phase.$assign(o.Phase);
    this.Period.$assign(o.Period);
    this.Random.$assign(o.Random);
    this.LiquidLevel.$assign(o.LiquidLevel);
    this.MapPlayerExtend = o.MapPlayerExtend;
    this.Layers.$assign(o.Layers);
    this.Material = o.Material.$clone();
    this.Liquid = o.Liquid.$clone();
    this.KeepMapCreator = o.KeepMapCreator;
    this.SkyScrollMode = o.SkyScrollMode;
    this.MaterialZoom = o.MaterialZoom;
    this.FlatChunkShapes = o.FlatChunkShapes;
    this.Secret = o.Secret;
    return this;
  }
}

export class C4SWeather {
  static $layout = [["Climate.Std", 0, "i32", 0], ["Climate.Rnd", 4, "i32", 0], ["Climate.Min", 8, "i32", 0], ["Climate.Max", 12, "i32", 0], ["StartSeason.Std", 16, "i32", 0], ["StartSeason.Rnd", 20, "i32", 0], ["StartSeason.Min", 24, "i32", 0], ["StartSeason.Max", 28, "i32", 0], ["YearSpeed.Std", 32, "i32", 0], ["YearSpeed.Rnd", 36, "i32", 0], ["YearSpeed.Min", 40, "i32", 0], ["YearSpeed.Max", 44, "i32", 0], ["Wind.Std", 48, "i32", 0], ["Wind.Rnd", 52, "i32", 0], ["Wind.Min", 56, "i32", 0], ["Wind.Max", 60, "i32", 0], ["NoGamma", 64, "u8", 0]];
  static $size = 68;
  Climate = new C4SVal().init();
  StartSeason = new C4SVal().init();
  YearSpeed = new C4SVal().init();
  Wind = new C4SVal().init();
  NoGamma = false;

  Default() {
    this.Climate.Set(50, 10);
    this.StartSeason.Set(50, 50);
    this.YearSpeed.Set(50);
    this.Wind.Set(0, 70, -100, 100);
    this.NoGamma = true;
  }

  CompileFunc(pComp) {
    pComp.Value$StdNamingDefaultAdapt$C4SVal$C4SVal($.mkNamingAdapt$rC4SVal$pi8$C4SVal$b$b(this.Climate, S("Climate"), new C4SVal().init(50, 10), true));
    pComp.Value$StdNamingDefaultAdapt$C4SVal$C4SVal($.mkNamingAdapt$rC4SVal$pi8$C4SVal$b$b(this.StartSeason, S("StartSeason"), new C4SVal().init(50, 50), true));
    pComp.Value$StdNamingDefaultAdapt$C4SVal$C4SVal($.mkNamingAdapt$rC4SVal$pi8$C4SVal$b$b(this.YearSpeed, S("YearSpeed"), new C4SVal().init(50)));
    pComp.Value$StdNamingDefaultAdapt$C4SVal$C4SVal($.mkNamingAdapt$rC4SVal$pi8$C4SVal$b$b(this.Wind, S("Wind"), new C4SVal().init(0, 70, -100, 100), true));
    pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "NoGamma"), S("NoGamma"), true));
  }

  None() {
    this.Climate = new C4SVal().init();
    this.StartSeason = new C4SVal().init();
    this.YearSpeed = new C4SVal().init();
    this.Wind = new C4SVal().init();
    return this;
  }

  $clone() { return new C4SWeather().$assign(this); }
  $assign(o) {
    this.Climate.$assign(o.Climate);
    this.StartSeason.$assign(o.StartSeason);
    this.YearSpeed.$assign(o.YearSpeed);
    this.Wind.$assign(o.Wind);
    this.NoGamma = o.NoGamma;
    return this;
  }
}

export class C4SAnimals {
  FreeLife = new $.C4IDList().init();
  EarthNest = new $.C4IDList().init();

  Default() {
    this.FreeLife.Clear();
    this.EarthNest.Clear();
  }

  CompileFunc(pComp) {
    pComp.Value$StdNamingDefaultAdapt$C4IDList$C4IDList($.mkNamingAdapt$rC4IDList$pi8$C4IDList$b$b(this.FreeLife, S("Animal"), new $.C4IDList().init()));
    pComp.Value$StdNamingDefaultAdapt$C4IDList$C4IDList($.mkNamingAdapt$rC4IDList$pi8$C4IDList$b$b(this.EarthNest, S("Nest"), new $.C4IDList().init()));
  }

  None() {
    this.FreeLife = new $.C4IDList().init();
    this.EarthNest = new $.C4IDList().init();
    return this;
  }

  $clone() { return new C4SAnimals().$assign(this); }
  $assign(o) {
    this.FreeLife.$assign(o.FreeLife);
    this.EarthNest.$assign(o.EarthNest);
    return this;
  }
}

export class C4SEnvironment {
  Objects = new $.C4IDList().init();

  Default() {
    this.Objects.Clear();
  }

  CompileFunc(pComp) {
    pComp.Value$StdNamingDefaultAdapt$C4IDList$C4IDList($.mkNamingAdapt$rC4IDList$pi8$C4IDList$b$b(this.Objects, S("Objects"), new $.C4IDList().init()));
  }

  None() {
    this.Objects = new $.C4IDList().init();
    return this;
  }

  $clone() { return new C4SEnvironment().$assign(this); }
  $assign(o) {
    this.Objects.$assign(o.Objects);
    return this;
  }
}

export class C4Scenario {
  Head = new C4SHead().None();
  Definitions = new C4SDefinitions().None();
  Game = new C4SGame().None();
  PlrStart = $oarr(4, () => new C4SPlrStart().None());
  Landscape = new C4SLandscape().None();
  Animals = new C4SAnimals().None();
  Weather = new C4SWeather().None();
  Environment = new C4SEnvironment().None();

  init() {
    this.Head = new C4SHead().None();
    this.Definitions = new C4SDefinitions().None();
    this.Game = new C4SGame().None();
    this.PlrStart = $oarr(4, () => new C4SPlrStart().None());
    this.Landscape = new C4SLandscape().None();
    this.Animals = new C4SAnimals().None();
    this.Weather = new C4SWeather().None();
    this.Environment = new C4SEnvironment().None();
    C4Scenario.prototype.Default.call(this);
    return this;
  }

  SetExactLandscape() {
    if (this.Landscape.ExactLandscape) {
      return;
    }
    this.Landscape.ExactLandscape = true;
  }

  Clear() {
  }

  Default() {
    let cnt = 0;
    this.Head.Default();
    this.Definitions.Default();
    this.Game.Default();
    for (cnt = 0; cnt < 4; cnt = cnt + 1 | 0) {
      this.PlrStart[cnt].Default();
    }
    this.Landscape.Default();
    this.Animals.Default();
    this.Weather.Default();
    this.Game.Realism.Default();
    this.Environment.Default();
  }

  Load(hGroup, fLoadSection$ = false, suppress_errors = false) {
    const fLoadSection = [fLoadSection$];
    let Buf = new $.StdStrBuf();
    if (!hGroup.LoadEntryString$pi8$pStdStrBuf(S("Scenario.txt"), Buf)) {
      return false;
    }
    if (!fLoadSection[0]) {
      this.Default();
    }
    if (suppress_errors) {
      if (!$.CompileFromBuf_Log($.mkParAdapt$rC4Scenario$rb(this, P(fLoadSection, 0)), Buf, S("Scenario.txt"))) {
        return false;
      }
    } else {
      if (!$.CompileFromBuf_LogWarn$mStdParameterAdapt$C4Scenario$b$x$pi8($.mkParAdapt$rC4Scenario$rb(this, P(fLoadSection, 0)), Buf, S("Scenario.txt"))) {
        return false;
      }
    }
    return true;
  }

  Save(hGroup, fSaveSection$ = false) {
    const fSaveSection = [fSaveSection$];
    let Buf = new $.StdStrBuf();
    try {
      Buf.Take$mStdStrBuf($.DecompileToBuf$StdParameterAdapt$C4Scenario$b($.mkParAdapt$rC4Scenario$rb(this, P(fSaveSection, 0))));
    } catch ($e1) {
      if ($e1 instanceof $.StdCompiler$Exception) {
        return false;
      } else {
        throw $e1;
      }
    }
    if (!hGroup.Add$pi8$rStdStrBuf$b$b$b(S("Scenario.txt"), Buf, false, true)) {
      return false;
    }
    return true;
  }

  CompileFunc(pComp, fSection$) {
    const fSection = [fSection$];
    pComp.Value$StdNamingAdapt$StdParameterAdapt$C4SHead$b($.mkNamingAdapt$mStdParameterAdapt$C4SHead$b$pi8($.mkParAdapt$rC4SHead$rb(this.Head, P(fSection, 0)), S("Head")));
    if (!fSection[0]) {
      pComp.Value$StdNamingAdapt$C4SDefinitions($.mkNamingAdapt$rC4SDefinitions$pi8(this.Definitions, S("Definitions")));
    }
    pComp.Value$StdNamingAdapt$StdParameterAdapt$C4SGame$b($.mkNamingAdapt$mStdParameterAdapt$C4SGame$b$pi8($.mkParAdapt$rC4SGame$rb(this.Game, P(fSection, 0)), S("Game")));
    for (let i = 0; i < 4; i = i + 1 | 0) {
      pComp.Value$StdNamingAdapt$C4SPlrStart($.mkNamingAdapt$rC4SPlrStart$pi8(this.PlrStart[i], $.FormatString(S("Player%d"), i + 1 | 0).getData()));
    }
    pComp.Value$StdNamingAdapt$C4SLandscape($.mkNamingAdapt$rC4SLandscape$pi8(this.Landscape, S("Landscape")));
    pComp.Value$StdNamingAdapt$C4SAnimals($.mkNamingAdapt$rC4SAnimals$pi8(this.Animals, S("Animals")));
    pComp.Value$StdNamingAdapt$C4SWeather($.mkNamingAdapt$rC4SWeather$pi8(this.Weather, S("Weather")));
    pComp.Value$StdNamingAdapt$C4SEnvironment($.mkNamingAdapt$rC4SEnvironment$pi8(this.Environment, S("Environment")));
  }

  GetMinPlayer() {
    if (this.Head.MinPlayer !== 0) {
      return this.Head.MinPlayer;
    }
    return 1;
  }

  $clone() { return new C4Scenario().$assign(this); }
  $assign(o) {
    this.Head.$assign(o.Head);
    this.Definitions.$assign(o.Definitions);
    this.Game.$assign(o.Game);
    this.PlrStart = $own(o.PlrStart.map(($e0) => $e0.$clone()));
    this.Landscape.$assign(o.Landscape);
    this.Animals.$assign(o.Animals);
    this.Weather.$assign(o.Weather);
    this.Environment.$assign(o.Environment);
    return this;
  }
}

export class C4ScenarioSection {
  name = new $.StdCopyStrBuf();
  temp_filename = new $.StdCopyStrBuf();
  filename = new $.StdCopyStrBuf();
  fModified = false;
  pObjectScripts = null;
  pNext = null;

  init(szName) {
    this.name = new $.StdCopyStrBuf();
    this.temp_filename = new $.StdCopyStrBuf();
    this.filename = new $.StdCopyStrBuf();
    this.name.Copy$pi8(szName);
    this.fModified = false;
    this.pObjectScripts = null;
    this.pNext = $.Game.pScenarioSections;
    $.Game.pScenarioSections = this;
    return this;
  }

  $dtor() {
    while (this.pNext != null) {
      let pDel = this.pNext;
      this.pNext = this.pNext.pNext;
      pDel.pNext = null;
      $delete(pDel);
    }
    if (this.temp_filename.getData() != null) {
      $.EraseItem(this.temp_filename.getData());
    }
  }

  ScenarioLoad(szFilename, is_temp_file) {
    if (this.filename.getData() != null || szFilename == null) {
      return false;
    }
    this.filename.Copy$pi8(szFilename);
    if (is_temp_file) {
      this.temp_filename.Copy$pi8(szFilename);
    } else {
      if ($.Game.ScenarioFile.IsPacked()) {
        if (!this.EnsureTempStore(true, true)) {
          return false;
        }
      }
    }
    if (!$.SEqualNoCase(this.name.getData(), $.C4ScenSect_Main)) {
      let GrpSect = new $.C4Group().init();
      let pGrp = null;
      if ((pGrp = this.GetGroupfile(GrpSect)) != null && pGrp.FindEntry$pi8$pStdStrBuf$pu64(S("Objects.c"))) {
        this.pObjectScripts = new $.C4ScenarioObjectsScriptHost().init();
        this.pObjectScripts.Reg2List($.ScriptEngine);
        this.pObjectScripts.Load$rC4Group$pi8$pi8$pC4LangStringTable(pGrp, S("Objects.c"), P($.Config.General.LanguageEx, 0), $.Game.ScenarioLangStringTable);
      } else {
        this.pObjectScripts = null;
      }
    } else {
      this.pObjectScripts = $.Game.pScenarioObjectsScript;
    }
    return true;
  }

  GetGroupfile(rGrp) {
    if (this.temp_filename.getData() != null) {
      if (rGrp.Open(this.temp_filename.getData())) {
        return rGrp;
      } else {
        return null;
      }
    }
    if (this.filename.getData() != null) {
      if (rGrp.OpenAsChild($.Game.ScenarioFile, this.filename.getData())) {
        return rGrp;
      } else {
        return null;
      }
    }
    if ($.SEqualNoCase(this.name.getData(), $.C4ScenSect_Main)) {
      return $.Game.ScenarioFile;
    }
    return null;
  }

  EnsureTempStore(fExtractLandscape, fExtractObjects) {
    if (this.temp_filename.getData() != null) {
      return true;
    }
    let szTmp = $.Config.AtTempPath(this.filename.getData() != null ? $.GetFilename(this.filename.getData()) : this.name.getData());
    $.MakeTempFilename$pi8(szTmp);
    if (!(this.filename.getData() != null)) {
      if (!$.CreatePath(StdString.of(szTmp))) {
        return false;
      }
      let hGroup = new $.C4Group().init();
      if (!hGroup.Open(szTmp, true)) {
        $.EraseItem(szTmp);
        return false;
      }
      $.Game.ScenarioFile.ResetSearch();
      const fn = new Int8Array(256);
      $wr(P(fn, 0), 0, 0);
      while ($.Game.ScenarioFile.FindNextEntry$pi8$pi8$pu64$b(S("Scenario.txt|Game.txt|Map.bmp|MapFg.bmp|MapBg.bmp|Landscape.bmp|LandscapeFg.bmp|LandscapeBg.bmp|Sky.bmp|Sky.png|Sky.jpeg|Sky.jpg|PXS.ocb|MassMover.ocb|CtrlRec.ocb|Strings.txt|Objects.txt|Objects.c"), P(fn, 0))) {
        if (fExtractLandscape || !$.WildcardMatch(S("Scenario.txt|Map.bmp|MapFg.bmp|MapBg.bmp|Landscape.bmp|LandscapeFg.bmp|LandscapeBg.bmp|PXS.ocb|MassMover.ocb"), P(fn, 0))) {
          if (fExtractObjects || !$.WildcardMatch(S("Strings.txt|Objects.txt|Objects.c"), P(fn, 0))) {
            $.Game.ScenarioFile.ExtractEntry(P(fn, 0), szTmp);
          }
        }
      }
      hGroup.Close$v();
    } else {
      if (!$.Game.ScenarioFile.ExtractEntry(this.filename.getData(), szTmp)) {
        return false;
      }
      if (!fExtractLandscape || !fExtractObjects) {
        let hGroup = new $.C4Group().init();
        if (hGroup.Open(this.filename.getData())) {
          if (!fExtractLandscape) {
            hGroup.Delete(S("Scenario.txt|Map.bmp|MapFg.bmp|MapBg.bmp|Landscape.bmp|LandscapeFg.bmp|LandscapeBg.bmp|PXS.ocb|MassMover.ocb"));
          }
          if (!fExtractObjects) {
            hGroup.Delete(S("Strings.txt|Objects.txt|Objects.c"));
          }
        }
      }
    }
    this.temp_filename.Copy$pi8(szTmp);
    return true;
  }

  $clone() { return new C4ScenarioSection().$assign(this); }
  $assign(o) {
    this.name.$assign(o.name);
    this.temp_filename.$assign(o.temp_filename);
    this.filename.$assign(o.filename);
    this.fModified = o.fModified;
    this.pObjectScripts = o.pObjectScripts;
    this.pNext = o.pNext;
    return this;
  }
}




export function $init(): void {
  $.C4S_MaxDefinitions$C4Scenario = 10;
  $.C4S_MaxMapPlayerExtend$C4Scenario = 4;
  $.C4S_MaxPlayerDefault$C4Scenario = 12;
}

Object.assign($, { C4SAnimals, C4SDefinitions, C4SEnvironment, C4SGame, C4SHead, C4SLandscape, C4SPlrStart, C4SRealism, C4SVal, C4SWeather, C4Scenario, C4ScenarioSection });
