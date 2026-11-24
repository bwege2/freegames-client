// @ts-nocheck
// OpenClonk 36de799: src/control/C4GameParameters.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $u64n } from '../../rt/int.ts';
import { $rd, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete } from '../../rt/std.ts';

export class C4GameRes {
  eType = 0 /*NRT_Null*/;
  File = new $.StdCopyStrBuf();
  pResCore = null;
  pNetRes = new $.C4Network2Res$Ref();

  init() {
    this.eType = 0 /*NRT_Null*/;
    this.File = new $.StdCopyStrBuf();
    this.pResCore = null;
    this.pNetRes = new $.C4Network2Res$Ref().init$pC4Network2Res(null);
    return this;
  }

  $dtor() {
    C4GameRes.prototype.Clear.call(this);
  }

  getType() {
    return this.eType;
  }

  getFile() {
    return this.File.getData();
  }

  isPresent() {
    return !this.File.op_not();
  }

  getResCore() {
    return this.pResCore;
  }

  getNetRes() {
    return new $.C4Network2Res$Ref().$copy(this.pNetRes);
  }

  SetFile(enType, sznFile) {
    0;
    this.eType = enType;
    this.File.op_assign$pi8(sznFile);
  }

  SetResCore(pnResCore) {
    0;
    this.pResCore = pnResCore;
    this.eType = this.pResCore.getType();
  }

  SetNetRes(pnNetRes) {
    this.Clear();
    this.pNetRes.$assign(pnNetRes);
    this.eType = this.pNetRes.op_arrow().getType();
    this.File.op_assign$pi8(this.pNetRes.op_arrow().getFile());
    this.pResCore = this.pNetRes.op_arrow().getCore();
  }

  Publish(pNetResList) {
    0;
    if (this.pNetRes.op_C4Network2Res_() != null) {
      return true;
    }
    let fAllowUnloadable = false;
    if (this.eType === 4) {
      fAllowUnloadable = true;
    }
    let pNetRes = pNetResList.AddByFile(this.File.getData(), false, this.eType, -1, null, fAllowUnloadable);
    if (pNetRes.op_not()) {
      return false;
    }
    this.SetNetRes(new $.C4Network2Res$Ref().$copy(pNetRes));
    return true;
  }

  Load(pNetResList) {
    0;
    if (this.pNetRes.op_C4Network2Res_() != null) {
      return true;
    }
    let pNetRes = pNetResList.AddByCore(this.pResCore);
    if (pNetRes.op_not()) {
      return false;
    }
    this.SetNetRes(new $.C4Network2Res$Ref().$copy(pNetRes));
    return true;
  }

  InitNetwork(pNetResList) {
    if (this.getNetRes().op_C4Network2Res_() != null) {
      return true;
    }
    if (this.isPresent()) {
      if (!this.Publish(pNetResList)) {
        $.LogFatal($.FormatString($.LoadResStr(S("IDS_NET_NOFILEPUBLISH")), this.getFile()).getData());
        return false;
      }
    } else if (this.pResCore != null) {
      if (!this.Load(pNetResList)) {
        let szFilename = this.pResCore.getFileName();
        if (!this.pResCore.isLoadable()) {
          if (this.pResCore.getType() === 5) {
            $.LogFatal($.FormatString($.LoadResStr(S("IDS_NET_NOSAMESYSTEM")), szFilename).getData());
          } else {
            $.LogFatal($.FormatString($.LoadResStr(S("IDS_NET_NOSAMEANDTOOLARGE")), szFilename).getData());
          }
        } else {
          $.LogFatal($.FormatString($.LoadResStr(S("IDS_NET_NOVALIDCORE")), szFilename).getData());
        }
        return false;
      }
    }
    return true;
  }

  CalcHash() {
    if (this.pNetRes.op_not()) {
      return;
    }
    this.pNetRes.op_arrow().CalculateSHA();
  }

  Clear() {
    this.eType = 0 /*NRT_Null*/;
    this.File.Clear();
    if (this.pResCore != null && this.pNetRes.op_not()) {
      $delete(this.pResCore);
    }
    this.pResCore = null;
    this.pNetRes.op_assign$pC4Network2Res(null);
  }

  CompileFunc(pComp) {
    let deserializing = pComp.isDeserializer();
    if (deserializing) {
      this.Clear();
    }
    if (!deserializing) {
      0;
    }
    pComp.Value$StdPtrAdapt$C4Network2ResCore($.mkPtrAdaptNoNull$rpC4Network2ResCore(P(this, "pResCore")));
    if (deserializing) {
      this.eType = this.pResCore.getType();
    }
  }

  $copy(Res) {
    this.eType = Res.getType();
    this.File = new $.StdCopyStrBuf().init$pi8$b(Res.getFile());
    this.pResCore = Res.getResCore();
    this.pNetRes = Res.getNetRes();
    if (this.pResCore != null && this.pNetRes.op_not()) {
      this.pResCore = this.pResCore.$clone();
    }
    return this;
  }
  $clone() { return new C4GameRes().$copy(this); }
  $assign(Res) {
    this.Clear();
    this.eType = Res.getType();
    this.File.op_assign$pi8(Res.getFile());
    this.pResCore = Res.getResCore();
    this.pNetRes.$assign(Res.getNetRes());
    if (this.pResCore != null && this.pNetRes.op_not()) {
      this.pResCore = this.pResCore.$clone();
    }
    return this;
  }
}

export class C4GameResList {
  pResList = null;
  iResCount = 0;
  iResCapacity = 0;

  $dtor() {
    C4GameResList.prototype.Clear.call(this);
  }

  getResCount() {
    return this.iResCount;
  }

  iterRes(pLast, eType = 0 /*NRT_Null*/) {
    for (let i = 0; i < this.iResCount; i = i + 1 | 0) {
      if (pLast == null) {
        if (eType === 0 || this.pResList.a[this.pResList.o + i].getType() === eType) {
          return this.pResList.a[this.pResList.o + i];
        }
      } else if (pLast === this.pResList.a[this.pResList.o + i]) {
        pLast = null;
      }
    }
    return null;
  }

  Clear() {
    for (let i = 0; i < this.iResCount; i = i + 1 | 0) {
      $delete(this.pResList.a[this.pResList.o + i]);
    }
    $delete(this.pResList);
    this.pResList = null;
    this.iResCount = this.iResCapacity = 0;
  }

  Load(hGroup, pScenario, szDefinitionFilenames) {
    this.Clear();
    if (szDefinitionFilenames != null && szDefinitionFilenames.a[szDefinitionFilenames.o] !== 0) {
      const szSegment = new Int8Array(4097);
      for (let cseg = 0; $.SCopySegment(szDefinitionFilenames, cseg, P(szSegment, 0), 59, 4096); cseg = cseg + 1 | 0) {
        if ($rd(P(szSegment, 0)) !== 0) {
          this.CreateByFile(4 /*NRT_Definitions*/, P(szSegment, 0));
        }
      }
    }
    this.LoadFoldersWithLocalDefs(pScenario.Head.Origin.op_const_void_() != null ? pScenario.Head.Origin.getData() : hGroup.GetFullName().getData());
    this.CreateByFile(5 /*NRT_System*/, S("System.ocg"));
    let pMatParentGrp = null;
    while ((pMatParentGrp = $.Game.GroupSet.FindGroup(4, pMatParentGrp)) != null) {
      if (pMatParentGrp !== $.Game.ScenarioFile) {
        let MaterialPath = pMatParentGrp.GetFullName().op_add$pi8(S("/Material.ocg"));
        this.CreateByFile(6 /*NRT_Material*/, pMatParentGrp.GetFullName().op_add$pi8(S("/Material.ocg")).getData());
      }
    }
    this.CreateByFile(6 /*NRT_Material*/, S("Material.ocg"));
    return true;
  }

  CreateByFile(eType, szFile) {
    let pRes = new C4GameRes().init();
    pRes.SetFile(eType, szFile);
    this.Add(pRes);
    return pRes;
  }

  CreateByNetRes(pNetRes) {
    let pRes = new C4GameRes().init();
    pRes.SetNetRes(new $.C4Network2Res$Ref().$copy(pNetRes));
    this.Add(pRes);
    return pRes;
  }

  InitNetwork(pNetResList) {
    for (let i = 0; i < this.iResCount; i = i + 1 | 0) {
      if (!this.pResList.a[this.pResList.o + i].InitNetwork(pNetResList)) {
        return false;
      }
    }
    return true;
  }

  CalcHashes() {
    for (let i = 0; i < this.iResCount; i = i + 1 | 0) {
      this.pResList.a[this.pResList.o + i].CalcHash();
    }
  }

  RetrieveFiles() {
    for (let i = 0; i < this.iResCount; i = i + 1 | 0) {
      const Core = this.pResList.a[this.pResList.o + i].getResCore();
      let ResNameBuf = $.FormatString(S("%s: %s"), $.LoadResStr(S("IDS_DLG_DEFINITION")), $.GetFilename(Core.getFileName()));
      if ($.Network.RetrieveRes(Core, 100000, ResNameBuf.getData()).op_not()) {
        return false;
      }
    }
    return true;
  }

  CompileFunc(pComp) {
    let deserializing = pComp.isDeserializer();
    if (deserializing) {
      this.Clear();
    }
    pComp.Value$StdNamingCountAdapt$i32($.mkNamingCountAdapt$ri32$pi8(P(this, "iResCount"), S("Resource")));
    if (deserializing) {
      this.pResList = P(new Array($u64n(this.iResCapacity = this.iResCount)).fill(null), 0);
      $.ZeroMem$ppC4GameRes$u64(this.pResList, 8 * $u64n(this.iResCount));
    }
    pComp.Value$StdNamingAdapt$StdArrayAdapt$pC4GameRes$StdPtrAdapt$C4GameRes($.mkNamingAdapt$mStdArrayAdapt$pC4GameRes$StdPtrAdapt$C4GameRes$pi8($.mkArrayAdaptMap$ppC4GameRes$i32$x(this.pResList, this.iResCount, $.mkPtrAdaptNoNull$rpC4GameRes), S("Resource")));
    $.mkPtrAdaptNoNull$rpC4GameRes(this.pResList);
  }

  Add(pRes) {
    let $t1;
    if (this.iResCount >= this.iResCapacity) {
      this.iResCapacity = this.iResCapacity + 10 | 0;
      let pnResList = P(new Array($u64n(this.iResCapacity)).fill(null), 0);
      for (let i = 0; i < this.iResCount; i = i + 1 | 0) {
        pnResList.a[pnResList.o + i] = this.pResList.a[this.pResList.o + i];
      }
      this.pResList = pnResList;
    }
    this.pResList.a[this.pResList.o + ($t1 = this.iResCount, this.iResCount = this.iResCount + 1 | 0, $t1)] = pRes;
  }

  LoadFoldersWithLocalDefs(szPath) {
    let iBackslash = 0;
    const szFoldername = new Int8Array(4097);
    let hGroup = new $.C4Group().init();
    for (let cnt = 0; (iBackslash = $.SCharPos(47, szPath, cnt)) > -1; cnt = cnt + 1 | 0) {
      $.SCopy$pi8$pi8$u64(szPath, P(szFoldername, 0), $u64n(iBackslash));
      if ($.SEqualNoCase($.GetExtension$2(P(szFoldername, 0)), S("ocf"))) {
        if ($.Reloc.Open(hGroup, P(szFoldername, 0))) {
          let iContents = 0;
          if ((iContents = $.C4GroupSet.CheckGroupContents(hGroup, 16)) !== 0) {
            this.CreateByFile(4 /*NRT_Definitions*/, P(szFoldername, 0));
          }
          hGroup.Close$v();
        } else {
          $.LogF(S("Internal WARNING: Could not inspect folder %s for definitions."), P(szFoldername, 0));
        }
      }
    }
  }

  $clone() { return new C4GameResList().$assign(this); }
  $assign(List) {
    this.Clear();
    this.iResCount = this.iResCapacity = List.iResCount;
    this.pResList = P(new Array($u64n(this.iResCapacity)).fill(null), 0);
    for (let i = 0; i < this.iResCount; i = i + 1 | 0) {
      this.pResList.a[this.pResList.o + i] = new C4GameRes().$copy(List.pResList.a[List.pResList.o + i]);
    }
    return this;
  }
}

export class C4GameParameters {
  League = new $.StdCopyStrBuf();
  LeagueAddress = new $.StdCopyStrBuf();
  StreamAddress = new $.StdCopyStrBuf();
  MaxPlayers = 0;
  IsNetworkGame = false;
  IsEditor = false;
  ControlRate = 0;
  AutoFrameSkip = false;
  AllowDebug = false;
  Rules = new $.C4IDList().init();
  Goals = new $.C4IDList().init();
  Scenario = new C4GameRes().init();
  GameRes = new C4GameResList();
  Clients = new $.C4ClientList();
  PlayerInfos = new $.C4PlayerInfoList();
  RestorePlayerInfos = new $.C4PlayerInfoList();
  Teams = new $.C4TeamList().init();
  ScenarioParameters = new $.C4ScenarioParameters().init();

  init() {
    this.League = new $.StdCopyStrBuf();
    this.LeagueAddress = new $.StdCopyStrBuf();
    this.StreamAddress = new $.StdCopyStrBuf();
    this.Rules = new $.C4IDList().init();
    this.Goals = new $.C4IDList().init();
    this.Scenario = new C4GameRes().init();
    this.GameRes = new C4GameResList();
    this.Clients = new $.C4ClientList();
    this.PlayerInfos = new $.C4PlayerInfoList();
    this.RestorePlayerInfos = new $.C4PlayerInfoList();
    this.Teams = new $.C4TeamList().init();
    this.ScenarioParameters = new $.C4ScenarioParameters().init();
    return this;
  }

  isLeague() {
    return !!(this.LeagueAddress.getLength() !== 0);
  }

  doStreaming() {
    return !!(this.StreamAddress.getLength() !== 0);
  }

  getLeague() {
    return this.League.getData();
  }

  GetGameGoalString() {
    let sResult = new $.StdStrBuf();
    let idGoal = new $.C4ID().init$v();
    for (let i = 0; i < this.Goals.GetNumberOfIDs$v(); i = i + 1 | 0) {
      if (idGoal.$assign(this.Goals.GetID$u64$pi32($u64n(i))).op_unsigned_long_C4ID_() != null) {
        if (idGoal.op_ne($.C4ID.None)) {
          if ($.Game.IsRunning) {
            let pDef = $.C4Id2Def(idGoal.$clone());
            if (pDef != null) {
              if (sResult.getLength() !== 0) {
                sResult.Append$pi8(S(", "));
              }
              sResult.Append$pi8(pDef.GetName());
            }
          } else {
            if (sResult.getLength() !== 0) {
              sResult.Append$pi8(S(", "));
            }
            sResult.Append$pi8(idGoal.ToString());
          }
        }
      }
    }
    if (sResult.getLength() > 512) {
      sResult.SetLength(512);
    }
    if (sResult.getLength() !== 0) {
      return $.FormatString(S("%s: %s"), $.LoadResStr(S("IDS_MENU_CPGOALS")), sResult.getData());
    } else {
      return new $.StdCopyStrBuf().init$pi8$b($.LoadResStr(S("IDS_CTL_NOGOAL")), true);
    }
  }

  EnforceLeagueRules(pScenario) {
    let $t1;
    this.Scenario.CalcHash();
    this.GameRes.CalcHashes();
    this.Teams.EnforceLeagueRules();
    this.AllowDebug = false;
    if (pScenario != null) {
      this.MaxPlayers = pScenario.Head.MaxPlayerLeague;
    }
    let idx = 0;
    let pdef = null;
    let val = 0;
    while ((pdef = $.Game.ScenarioParameterDefs.GetParameterDefByIndex(($t1 = idx, idx = idx + 1, $t1))) != null) {
      if ((val = pdef.GetLeagueValue()) !== 0) {
        this.ScenarioParameters.SetValue(pdef.GetID(), val, false);
      }
    }
  }

  Clear() {
    this.League.Clear();
    this.LeagueAddress.Clear();
    this.Rules.Clear();
    this.Goals.Clear();
    this.Scenario.Clear();
    this.GameRes.Clear();
    this.Clients.Clear();
    this.PlayerInfos.Clear();
    this.RestorePlayerInfos.Clear();
    this.Teams.Clear();
    this.ScenarioParameters.Clear();
  }

  Load(hGroup, pScenario$, _szGameText, pLang, DefinitionFilenames, pStartupScenarioParameters) {
    const pScenario = [pScenario$];
    this.Clear();
    this.Scenario.SetFile(1 /*NRT_Scenario*/, hGroup.GetFullName().getData());
    if (!this.GameRes.Load(hGroup, pScenario[0], DefinitionFilenames)) {
      return false;
    }
    if (pScenario[0].Head.Replay) {
      if (hGroup.FindEntry$pi8$pStdStrBuf$pu64(S("PlayerInfos.txt"))) {
        this.PlayerInfos.Load(hGroup, S("PlayerInfos.txt"));
      }
    }
    if (hGroup.FindEntry$pi8$pStdStrBuf$pu64(S("SavePlayerInfos.txt"))) {
      this.RestorePlayerInfos.Load(hGroup, S("SavePlayerInfos.txt"), pLang);
      this.PlayerInfos.SetIDCounter(this.RestorePlayerInfos.GetIDCounter());
    }
    if (!this.Teams.Load(hGroup, pScenario[0], pLang)) {
      $.LogFatal($.LoadResStr(S("IDS_PRC_ERRORLOADINGTEAMS")));
      return false;
    }
    let Buf = new $.StdStrBuf();
    if (hGroup.LoadEntryString$pi8$pStdStrBuf(S("Parameters.txt"), Buf)) {
      if (!$.CompileFromBuf_LogWarn$mStdNamingAdapt$StdParameterAdapt$C4GameParameters$pC4Scenario$x$pi8($.mkNamingAdapt$mStdParameterAdapt$C4GameParameters$pC4Scenario$pi8($.mkParAdapt$rC4GameParameters$rpC4Scenario(this, P(pScenario, 0)), S("Parameters")), Buf, S("Parameters.txt"))) {
        return false;
      }
    } else {
      let DefaultCompiler = new $.StdCompilerNull();
      DefaultCompiler.Compile$mStdParameterAdapt$C4GameParameters$pC4Scenario($.mkParAdapt$rC4GameParameters$rpC4Scenario(this, P(pScenario, 0)));
      if (this.ControlRate < 0) {
        this.ControlRate = $.Config.Network.ControlRate;
      }
      this.IsNetworkGame = $.Game.NetworkActive;
      this.AutoFrameSkip = !($.Config.Graphics.AutoFrameSkip === 0);
      if (pStartupScenarioParameters != null) {
        this.ScenarioParameters.$assign(pStartupScenarioParameters);
      }
    }
    if (this.isLeague()) {
      this.EnforceLeagueRules(pScenario[0]);
    }
    return true;
  }

  InitNetwork(pResList) {
    if (!this.Scenario.InitNetwork(pResList)) {
      return false;
    }
    if (!this.GameRes.InitNetwork(pResList)) {
      return false;
    }
    return true;
  }

  Save(hGroup, pScenario$) {
    const pScenario = [pScenario$];
    let ParData = $.DecompileToBuf$StdNamingAdapt$StdParameterAdapt$C4GameParameters$pC4Scenario($.mkNamingAdapt$mStdParameterAdapt$C4GameParameters$pC4Scenario$pi8($.mkParAdapt$rC4GameParameters$rpC4Scenario(this, P(pScenario, 0)), S("Parameters")));
    if (!hGroup.Add$pi8$rStdStrBuf$b$b$b(S("Parameters.txt"), ParData, false, true)) {
      return false;
    }
    return true;
  }

  CompileFunc(pComp, pScenario = null) {
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "MaxPlayers"), S("MaxPlayers"), pScenario == null ? 0 : pScenario.Head.MaxPlayer));
    pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "AllowDebug"), S("AllowDebug"), true));
    pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "IsNetworkGame"), S("IsNetworkGame"), false));
    pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "IsEditor"), S("IsEditor"), !($.Application.isEditor === 0)));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "ControlRate"), S("ControlRate"), -1));
    pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "AutoFrameSkip"), S("AutoFrameSkip"), false));
    pComp.Value$StdNamingDefaultAdapt$C4IDList$C4IDList($.mkNamingAdapt$rC4IDList$pi8$C4IDList$b$b(this.Rules, S("Rules"), pScenario == null ? new $.C4IDList().init() : new $.C4IDList().$copy(pScenario.Game.Rules)));
    pComp.Value$StdNamingDefaultAdapt$C4IDList$C4IDList($.mkNamingAdapt$rC4IDList$pi8$C4IDList$b$b(this.Goals, S("Goals"), pScenario == null ? new $.C4IDList().init() : new $.C4IDList().$copy(pScenario.Game.Goals)));
    pComp.Value$StdNamingDefaultAdapt$StdCopyStrBuf$StdStrBuf($.mkNamingAdapt$rStdCopyStrBuf$pi8$StdStrBuf$b$b(this.League, S("League"), new $.StdStrBuf()));
    if (pScenario == null) {
      pComp.Value$StdNamingDefaultAdapt$StdCopyStrBuf$x($.mkNamingAdapt$rStdCopyStrBuf$pi8$x$b$b(this.LeagueAddress, S("LeagueAddress"), S("")));
      pComp.Value$StdNamingAdapt$C4GameRes($.mkNamingAdapt$rC4GameRes$pi8(this.Scenario, S("Scenario")));
      pComp.Value$rC4GameResList(this.GameRes);
      pComp.Value$StdNamingAdapt$C4PlayerInfoList($.mkNamingAdapt$rC4PlayerInfoList$pi8(this.PlayerInfos, S("PlayerInfos")));
      pComp.Value$StdNamingAdapt$C4PlayerInfoList($.mkNamingAdapt$rC4PlayerInfoList$pi8(this.RestorePlayerInfos, S("RestorePlayerInfos")));
      pComp.Value$StdNamingAdapt$C4TeamList($.mkNamingAdapt$rC4TeamList$pi8(this.Teams, S("Teams")));
    }
    pComp.Value$rC4ClientList(this.Clients);
    pComp.Value$StdNamingAdapt$C4ScenarioParameters($.mkNamingAdapt$rC4ScenarioParameters$pi8(this.ScenarioParameters, S("ScenarioParameters")));
  }

  $clone() { return new C4GameParameters().$assign(this); }
  $assign(o) {
    this.League.$assign(o.League);
    this.LeagueAddress.$assign(o.LeagueAddress);
    this.StreamAddress.$assign(o.StreamAddress);
    this.MaxPlayers = o.MaxPlayers;
    this.IsNetworkGame = o.IsNetworkGame;
    this.IsEditor = o.IsEditor;
    this.ControlRate = o.ControlRate;
    this.AutoFrameSkip = o.AutoFrameSkip;
    this.AllowDebug = o.AllowDebug;
    this.Rules.$assign(o.Rules);
    this.Goals.$assign(o.Goals);
    this.Scenario.$assign(o.Scenario);
    this.GameRes.$assign(o.GameRes);
    this.Clients.$assign(o.Clients);
    this.PlayerInfos.$assign(o.PlayerInfos);
    this.RestorePlayerInfos.$assign(o.RestorePlayerInfos);
    this.Teams.$assign(o.Teams);
    this.ScenarioParameters.$assign(o.ScenarioParameters);
    return this;
  }
}

export function $init(): void {
}

Object.assign($, { C4GameParameters, C4GameRes, C4GameResList });
