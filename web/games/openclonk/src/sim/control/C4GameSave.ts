// @ts-nocheck
// OpenClonk 36de799: src/control/C4GameSave.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { c$localtime, c$time } from '../../rt/libc.ts';
import { P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete } from '../../rt/std.ts';

export class C4GameSave {
  rC4S = new $.C4Scenario().init();
  pSaveGroup = null;
  fOwnGroup = false;
  fInitial = false;
  Sync = 0;

  GetSaveRuntimeData() {
    return !this.fInitial;
  }

  GetKeepTitle() {
    return !this.IsExact();
  }

  GetSaveDesc() {
    return true;
  }

  GetCopyScenario() {
    return true;
  }

  GetSortOrder() {
    return S("Loader*.bmp|Loader*.png|Loader*.jpeg|Loader*.jpg|Fonts.txt|Scenario.txt|Title*.txt|Info.txt|Desc*.txt|Icon.png|Icon.bmp|Achv*.png|Game.txt|StringTbl*.txt|ParameterDefs.txt|Teams.txt|Parameters.txt|Info.txt|Sect*.ocg|Music.ocg|*.mid|*.wav|Desc*.txt|Title.png|Title.jpg|*.ocd|Script.c|Script*.c|Map.c|Objects.c|System.ocg|Material.ocg|MatMap.txt|Map.bmp|MapFg.bmp|MapBg.bmp|Landscape.bmp|LandscapeFg.bmp|LandscapeBg.bmp|DiffLandscape.bmp|DiffLandscapeBkg.bmp|Sky.bmp|Sky.png|Sky.jpeg|Sky.jpg|PXS.ocb|MassMover.ocb|CtrlRec.ocb|Strings.txt|Objects.txt|RoundResults.txt|Author.txt|Version.txt|Names.txt");
  }

  GetCreateSmallFile() {
    return false;
  }

  GetForceExactLandscape() {
    return this.GetSaveRuntimeData() && this.IsExact();
  }

  GetSaveOrigin() {
    return false;
  }

  GetClearOrigin() {
    return !this.GetSaveOrigin();
  }

  GetSaveUserPlayers() {
    return this.IsExact();
  }

  GetSaveScriptPlayers() {
    return this.IsExact();
  }

  GetSaveUserPlayerFiles() {
    return this.IsExact();
  }

  GetSaveScriptPlayerFiles() {
    return this.IsExact();
  }

  AdjustCore(_rC4S) {
  }

  WriteDesc(_sBuf) {
    return true;
  }

  SaveComponents() {
    return true;
  }

  OnSaving() {
    return true;
  }

  IsExact() {
    return this.Sync >= 2;
  }

  IsSynced() {
    return this.Sync >= 3;
  }

  init(fAInitial, ASync) {
    this.rC4S = new $.C4Scenario().init();
    this.pSaveGroup = null;
    this.fOwnGroup = false;
    this.fInitial = fAInitial;
    this.Sync = ASync;
    return this;
  }

  WriteDescLineFeed(sBuf) {
    sBuf.Append$pi8(S("\n\n"));
  }

  WriteDescDate(sBuf, fRecord = false) {
    const tTime = [0];
    c$time(P(tTime, 0));
    let pLocalTime = null;
    pLocalTime = c$localtime(P(tTime, 0));
    sBuf.AppendFormat($.LoadResStr(fRecord ? S("IDS_DESC_DATEREC") : $.Network.isEnabled() ? S("IDS_DESC_DATENET") : S("IDS_DESC_DATE")), pLocalTime.tm_mday, pLocalTime.tm_mon + 1 | 0, pLocalTime.tm_year + 1900 | 0, pLocalTime.tm_hour, pLocalTime.tm_min);
    this.WriteDescLineFeed(sBuf);
  }

  WriteDescGameTime(sBuf) {
    if ($.Game.Time !== 0) {
      sBuf.AppendFormat($.LoadResStr(S("IDS_DESC_DURATION")), $.Game.Time / 3600 | 0, $.Game.Time % 3600 / 60 | 0, $.Game.Time % 60);
      this.WriteDescLineFeed(sBuf);
    }
  }

  WriteDescDefinitions(sBuf) {
    if ($.Game.DefinitionFilenames[0] !== 0) {
      const szDef = new Int8Array(4097);
      sBuf.Append$pi8($.LoadResStr(S("IDS_DESC_DEFSPECS")));
      for (let cnt = 0; $.SGetModule(P($.Game.DefinitionFilenames, 0), cnt, P(szDef, 0)); cnt = cnt + 1 | 0) {
        let sDefFilename = new $.StdStrBuf();
        sDefFilename.Copy$pi8($.Config.AtRelativePath(P(szDef, 0)));
        if (cnt > 0) {
          sBuf.Append$pi8(S(", "));
        }
        sBuf.Append$StdStrBuf(sDefFilename);
      }
      this.WriteDescLineFeed(sBuf);
    }
  }

  WriteDescNetworkClients(sBuf) {
    sBuf.Append$pi8($.LoadResStr(S("IDS_DESC_CLIENTS")));
    for (let pClient = $.Network.Clients.GetNextClient(null); pClient != null; pClient = $.Network.Clients.GetNextClient(pClient)) {
      sBuf.Append$pi8(S(", "));
      sBuf.Append$pi8(pClient.getName());
    }
    this.WriteDescLineFeed(sBuf);
  }

  WriteDescPlayers$rStdStrBuf$b$i32(sBuf, fByTeam, idTeam) {
    let pPlr = null;
    let fAnyPlrWritten = false;
    for (let i = 0; (pPlr = $.Game.PlayerInfos.GetPlayerInfoByIndex(i)) != null; i = i + 1 | 0) {
      if (pPlr.HasJoined() && !pPlr.IsRemoved() && !pPlr.IsInvisible()) {
        if (fByTeam) {
          if (idTeam !== 0) {
            if (pPlr.GetTeam() !== idTeam) {
              continue;
            }
          } else {
            if ($.Game.Teams.GetTeamByID(pPlr.GetTeam()) != null) {
              continue;
            }
          }
        }
        if (fAnyPlrWritten) {
          sBuf.Append$pi8(S(", "));
        } else if (fByTeam && idTeam !== 0) {
          let pTeam = $.Game.Teams.GetTeamByID(idTeam);
          if (pTeam != null) {
            sBuf.AppendFormat(S("%s: "), pTeam.GetName());
          }
        }
        sBuf.Append$pi8(pPlr.GetName());
        fAnyPlrWritten = true;
      }
    }
    if (fAnyPlrWritten) {
      this.WriteDescLineFeed(sBuf);
    }
  }

  WriteDescPlayers$rStdStrBuf(sBuf) {
    let $t1;
    if ($.Game.PlayerInfos.GetPlayerCount() !== 0) {
      sBuf.Append$pi8($.LoadResStr(S("IDS_DESC_PLRS")));
      if ($.Game.Teams.IsMultiTeams() && !$.Game.Teams.IsAutoGenerateTeams()) {
        this.WriteDescLineFeed(sBuf);
        let pTeam = null;
        let i = 0;
        while ((pTeam = $.Game.Teams.GetTeamByIndex(($t1 = i, i = i + 1 | 0, $t1))) != null) {
          this.WriteDescPlayers$rStdStrBuf$b$i32(sBuf, true, pTeam.GetID());
        }
        this.WriteDescPlayers$rStdStrBuf$b$i32(sBuf, true, 0);
      } else {
        this.WriteDescPlayers$rStdStrBuf$b$i32(sBuf, false, 0);
      }
    }
  }

  WriteDescLeague(sBuf, fLeague, strLeagueName) {
    if (fLeague) {
      sBuf.AppendFormat($.LoadResStr(S("IDS_PRC_LEAGUE")), strLeagueName);
      this.WriteDescLineFeed(sBuf);
    }
  }

  WriteDescEngine(sBuf) {
    const ver = new Int8Array(32);
    $.ssprintf$11(ver, S("%d.%d"), 9, 0);
    sBuf.AppendFormat($.LoadResStr(S("IDS_DESC_VERSION")), P(ver, 0));
    this.WriteDescLineFeed(sBuf);
  }

  SaveCreateGroup(szFilename, hUseGroup) {
    $.EraseItem(szFilename);
    if (this.GetCopyScenario()) {
      if (!$.ItemIdentical(P($.Game.ScenarioFilename, 0), szFilename)) {
        if (!$.C4Group_CopyItem(P($.Game.ScenarioFilename, 0), szFilename)) {
          $.LogF($.LoadResStr(S("IDS_CNS_SAVEASERROR")), szFilename);
          return false;
        }
      }
    }
    if (!hUseGroup.Open(szFilename, !this.GetCopyScenario())) {
      $.EraseItem(szFilename);
      $.LogF($.LoadResStr(S("IDS_CNS_SAVEASERROR")), szFilename);
      return false;
    }
    return true;
  }

  SaveCore() {
    this.rC4S.$assign($.Game.C4S);
    this.rC4S.Head.C4XVer[0] = 9;
    this.rC4S.Head.C4XVer[1] = 0;
    if (!this.fInitial) {
      this.rC4S.Head.NoInitialize = true;
      this.rC4S.Head.SaveGame = this.GetSaveRuntimeData() && this.IsExact();
    }
    if (this.IsExact()) {
      this.rC4S.Head.RandomSeed = $.Game.RandomSeed;
    }
    this.rC4S.Head.NetworkGame = false;
    if (!this.GetKeepTitle()) {
      this.rC4S.Head.Title.assign($.Game.ScenarioTitle.getData());
    }
    if (this.IsExact()) {
      this.rC4S.Definitions.SetModules(P($.Game.DefinitionFilenames, 0), P($.Config.General.SystemDataPath, 0), P($.Config.General.UserDataPath, 0));
      if (!$.Game.Parameters.Save(this.pSaveGroup, $.Game.C4S)) {
        return false;
      }
    }
    this.rC4S.Head.MissionAccess.clear();
    if (this.GetSaveOrigin()) {
      if (!(this.rC4S.Head.Origin.getLength() !== 0)) {
        this.rC4S.Head.Origin.Copy$pi8(P($.Game.ScenarioFilename, 0));
        $.Config.ForceRelativePath(this.rC4S.Head.Origin);
      }
    } else if (this.GetClearOrigin()) {
      this.rC4S.Head.Origin.Clear();
    }
    this.AdjustCore(this.rC4S);
    return !!this.rC4S.Save(this.pSaveGroup);
  }

  SaveScenarioSections() {
    if ($.Game.pScenarioSections == null) {
      return true;
    }
    let iWildcardPos = $.SCharPos(42, S("Sect*.ocg"));
    const fn = new Int8Array(256);
    for (let pSect = $.Game.pScenarioSections; pSect != null; pSect = pSect.pNext) {
      $.SCopy$pi8$pi8(S("Sect*.ocg"), P(fn, 0));
      $.SDelete(P(fn, 0), 1, iWildcardPos);
      $.SInsert(P(fn, 0), pSect.name.getData(), iWildcardPos);
      if (pSect === $.Game.pCurrentScenarioSection) {
        this.pSaveGroup.DeleteEntry(P(fn, 0));
      } else if (pSect.fModified) {
        this.pSaveGroup.DeleteEntry(P(fn, 0));
        this.pSaveGroup.Add$pi8$pi8(pSect.temp_filename.getData(), P(fn, 0));
      }
    }
    return true;
  }

  SaveLandscape() {
    if ($.Landscape.GetMode() === 3 /*Exact*/ || this.GetForceExactLandscape()) {
      let DBGRECOFF = new $.C4DebugRecOff().init$v();
      try {
        let fSuccess = false;
        if ($.Landscape.GetMode() === 3 /*Exact*/) {
          fSuccess = !!$.Landscape.Save(this.pSaveGroup);
        } else {
          fSuccess = !!$.Landscape.SaveDiff(this.pSaveGroup, !this.IsSynced());
        }
        if (!fSuccess) {
          return false;
        }
        DBGRECOFF.Clear();
        if (!$.PXS.Save(this.pSaveGroup)) {
          return false;
        }
        let MassMoverSet = new $.C4MassMoverSet().init();
        MassMoverSet.Copy($.MassMover);
        if (!MassMoverSet.Save(this.pSaveGroup)) {
          return false;
        }
        if (!$.MaterialMap.SaveEnumeration(this.pSaveGroup)) {
          return false;
        }
      } finally { DBGRECOFF && DBGRECOFF.$dtor(); }
    }
    if ($.Landscape.GetMode() === 2 /*Static*/) {
      this.pSaveGroup.DeleteEntry(S("Landscape.bmp"));
      if (!this.GetForceExactLandscape()) {
        if (!$.Landscape.SaveMap(this.pSaveGroup)) {
          return false;
        }
        if (!$.Landscape.SaveTextures(this.pSaveGroup)) {
          return false;
        }
      }
    } else if ($.Landscape.GetMode() !== 3 /*Exact*/) {
    }
    return true;
  }

  SaveRuntimeData() {
    let numbers = new $.C4ValueNumbers().init();
    if (!$.Game.SaveData(this.pSaveGroup, false, this.IsExact(), this.IsSynced(), numbers)) {
      $.Log($.LoadResStr(S("IDS_ERR_SAVE_RUNTIMEDATA")));
      return false;
    }
    if (this.IsExact()) {
      if (!this.SaveScenarioSections()) {
        $.Log($.LoadResStr(S("IDS_ERR_SAVE_SCENSECTIONS")));
        return false;
      }
    }
    if (!this.SaveLandscape()) {
      $.Log($.LoadResStr(S("IDS_ERR_SAVE_LANDSCAPE")));
      return false;
    }
    if (this.GetSaveUserPlayers()) {
      if (!$.Game.RoundResults.Save(this.pSaveGroup)) {
        $.Log($.LoadResStr(S("IDS_ERR_ERRORSAVINGROUNDRESULTS")));
        return false;
      }
    }
    if (!$.Game.Teams.Save(this.pSaveGroup)) {
      $.Log($.LoadResStr($.LoadResStr(S("IDS_ERR_ERRORSAVINGTEAMS"))));
      return false;
    }
    if (this.GetSaveUserPlayers() || this.GetSaveScriptPlayers()) {
      let RestoreInfos = new $.C4PlayerInfoList();
      RestoreInfos.SetAsRestoreInfos($.Game.PlayerInfos, this.GetSaveUserPlayers(), this.GetSaveScriptPlayers(), this.GetSaveUserPlayerFiles(), this.GetSaveScriptPlayerFiles());
      if (!RestoreInfos.Save(this.pSaveGroup, S("SavePlayerInfos.txt"))) {
        $.Log($.LoadResStr(S("IDS_ERR_SAVE_RESTOREPLAYERINFOS")));
        return false;
      }
      if (this.GetSaveUserPlayerFiles() || this.GetSaveScriptPlayerFiles()) {
        if (!$.Players.Save$rC4Group$b$C4PlayerInfoList(this.pSaveGroup, this.GetCreateSmallFile(), RestoreInfos)) {
          $.Log($.LoadResStr(S("IDS_ERR_SAVE_PLAYERS")));
          return false;
        }
      }
    } else {
      this.pSaveGroup.Delete(S("PlayerInfos.txt"));
      this.pSaveGroup.Delete(S("SavePlayerInfos.txt"));
    }
    return true;
  }

  $dtor() {
    C4GameSave.prototype.Close.call(this);
  }

  Save$pi8(szFilename) {
    this.Close();
    let pLSaveGroup = new $.C4Group().init();
    if (!this.SaveCreateGroup(szFilename, pLSaveGroup)) {
      $.LogF($.LoadResStr(S("IDS_ERR_SAVE_TARGETGRP")), szFilename != null ? szFilename : S("nullptr!"));
      $delete(pLSaveGroup);
      return false;
    }
    return this.Save$rC4Group$b(pLSaveGroup, true);
  }

  Save$rC4Group$b(hToGroup, fKeepGroup) {
    this.Close();
    this.pSaveGroup = hToGroup;
    this.fOwnGroup = fKeepGroup;
    if (!this.OnSaving()) {
      return false;
    }
    if (!this.SaveCore()) {
      $.Log($.LoadResStr(S("IDS_ERR_SAVE_CORE")));
      return false;
    }
    this.pSaveGroup.Delete(S("*.ocp"));
    if (!this.GetKeepTitle()) {
      this.pSaveGroup.Delete($.FormatString(S("%s.*"), S("Title")).getData());
      this.pSaveGroup.Delete(S("Icon.bmp"));
      this.pSaveGroup.Delete($.FormatString(S("Desc%s.txt"), S("*")).getData());
      this.pSaveGroup.Delete(S("Title*.txt|Title.txt"));
      this.pSaveGroup.Delete(S("Info.txt"));
    }
    if (this.GetSaveRuntimeData()) {
      if (!this.SaveRuntimeData()) {
        return false;
      }
    }
    if (this.GetSaveDesc()) {
      if (!this.SaveDesc(this.pSaveGroup)) {
        $.Log($.LoadResStr(S("IDS_ERR_SAVE_DESC")));
      }
    }
    if (!this.SaveComponents()) {
      return false;
    }
    return true;
  }

  SaveDesc(hToGroup) {
    let sBuffer = new $.StdStrBuf();
    sBuffer.Append$pi8($.Game.ScenarioTitle.getData());
    sBuffer.Append$pi8(S("\n\n"));
    this.WriteDesc(sBuffer);
    let sFilename = new $.StdStrBuf();
    const szLang = new Int8Array(3);
    $.SCopyUntil$pi8$pi8$i8$i32$i32(P($.Config.General.Language, 0), P(szLang, 0), 44, 2);
    sFilename.Format(S("Desc%s.txt"), P(szLang, 0));
    return !!hToGroup.Add$pi8$rStdStrBuf$b$b$b(sFilename.getData(), sBuffer, false, true);
  }

  Close() {
    let fSuccess = true;
    if (this.pSaveGroup != null) {
      let szSortOrder = this.GetSortOrder();
      if (szSortOrder != null) {
        this.pSaveGroup.Sort(szSortOrder);
      }
      if (this.fOwnGroup) {
        fSuccess = !!this.pSaveGroup.Close$v();
        $delete(this.pSaveGroup);
        this.fOwnGroup = false;
      }
      this.pSaveGroup = null;
    }
    return fSuccess;
  }

  GetGroup() {
    return this.pSaveGroup;
  }

  $clone() { return new C4GameSave().$assign(this); }
  $assign(o) {
    this.rC4S.$assign(o.rC4S);
    this.pSaveGroup = o.pSaveGroup;
    this.fOwnGroup = o.fOwnGroup;
    this.fInitial = o.fInitial;
    this.Sync = o.Sync;
    return this;
  }
}

export class C4GameSaveScenario extends C4GameSave {
  fForceExactLandscape = false;
  fSaveOrigin = false;

  init(fForceExactLandscape, fSaveOrigin) {
    super.init(false, 1 /*SyncScenario*/);
    this.fForceExactLandscape = fForceExactLandscape;
    this.fSaveOrigin = fSaveOrigin;
    return this;
  }

  GetSaveOrigin() {
    return this.fSaveOrigin;
  }

  GetClearOrigin() {
    return false;
  }

  GetSaveDesc() {
    return false;
  }

  GetForceExactLandscape() {
    return C4GameSave.prototype.GetForceExactLandscape.call(this) || this.fForceExactLandscape;
  }

  GetSaveScriptPlayers() {
    return true;
  }

  GetSaveScriptPlayerFiles() {
    return true;
  }

  $clone() { return new C4GameSaveScenario().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.fForceExactLandscape = o.fForceExactLandscape;
    this.fSaveOrigin = o.fSaveOrigin;
    return this;
  }
}

export class C4GameSaveSavegame extends C4GameSave {

  init() {
    super.init(false, 2 /*SyncSavegame*/);
    return this;
  }

  GetSaveOrigin() {
    return true;
  }

  GetSaveUserPlayerFiles() {
    return false;
  }

  AdjustCore(rC4S) {
    let iSaveGameIndex = $.GetTrailingNumber($.GetFilenameOnly(this.pSaveGroup.GetFullName().getData()));
    if ($.Inside$i32$i32$i32$3(iSaveGameIndex, 1, 10)) {
      rC4S.Head.Icon = 2 + (iSaveGameIndex - 1 | 0) | 0;
    } else {
      rC4S.Head.Icon = 29;
    }
  }

  WriteDesc(sBuf) {
    this.WriteDescDate(sBuf);
    this.WriteDescGameTime(sBuf);
    this.WriteDescDefinitions(sBuf);
    if ($.Network.isEnabled()) {
      this.WriteDescNetworkClients(sBuf);
    }
    this.WriteDescPlayers$rStdStrBuf(sBuf);
    return true;
  }

  SaveComponents() {
    if (!$.Game.SaveGameTitle(this.pSaveGroup)) {
      $.Log($.LoadResStr(S("IDS_ERR_SAVE_GAMETITLE")));
    }
    return true;
  }

  OnSaving() {
    if (!$.Game.IsRunning) {
      return true;
    }
    if ($.Network.isEnabled()) {
      $.Game.Input.Add$i32$pC4ControlPacket(134 /*CID_Synchronize*/, new $.C4ControlSynchronize().init(true));
    } else {
      $.Players.SynchronizeLocalFiles();
    }
    return true;
  }

  $clone() { return new C4GameSaveSavegame().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class C4GameSaveRecord extends C4GameSave {
  iNum = 0;
  fLeague = false;
  fCopyScenario = false;

  init(fAInitial, iANum, fLeague, fCopyScenario = true) {
    super.init(fAInitial, 3 /*SyncSynchronized*/);
    this.iNum = iANum;
    this.fLeague = fLeague;
    this.fCopyScenario = fCopyScenario;
    return this;
  }

  GetSaveDesc() {
    return false;
  }

  GetCreateSmallFile() {
    return true;
  }

  GetSaveOrigin() {
    return true;
  }

  GetCopyScenario() {
    return this.fCopyScenario;
  }

  AdjustCore(rC4S) {
    rC4S.Head.Replay = true;
    if (rC4S.Head.Film === 0) {
      rC4S.Head.Film = 1;
    }
    rC4S.Head.Icon = 29;
    const buf = new Int8Array(1025);
    $.ssprintf$2(buf, S("%03i %s [%d.%d]"), this.iNum, $.Game.ScenarioTitle.getData(), 9, 0);
    rC4S.Head.Title.assign(P(buf, 0));
  }

  WriteDesc(sBuf) {
    this.WriteDescDate(sBuf, true);
    this.WriteDescGameTime(sBuf);
    this.WriteDescEngine(sBuf);
    this.WriteDescDefinitions(sBuf);
    this.WriteDescLeague(sBuf, this.fLeague, $.Game.Parameters.League.getData());
    if ($.Network.isEnabled()) {
      this.WriteDescNetworkClients(sBuf);
    }
    this.WriteDescPlayers$rStdStrBuf(sBuf);
    return true;
  }

  SaveComponents() {
    if (this.fInitial) {
      $.Game.PlayerInfos.Save(this.pSaveGroup, S("PlayerInfos.txt"));
    }
    return true;
  }

  $clone() { return new C4GameSaveRecord().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.iNum = o.iNum;
    this.fLeague = o.fLeague;
    this.fCopyScenario = o.fCopyScenario;
    return this;
  }
}

export class C4GameSaveNetwork extends C4GameSave {

  init(fAInitial) {
    super.init(fAInitial, 3 /*SyncSynchronized*/);
    return this;
  }

  GetSaveOrigin() {
    return true;
  }

  GetKeepTitle() {
    return false;
  }

  GetSaveDesc() {
    return false;
  }

  GetCreateSmallFile() {
    return true;
  }

  GetCopyScenario() {
    return false;
  }

  AdjustCore(rC4S) {
    rC4S.Head.NetworkGame = true;
    rC4S.Head.NetworkRuntimeJoin = !this.fInitial;
  }

  $clone() { return new C4GameSaveNetwork().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export function $init(): void {
}

Object.assign($, { C4GameSave, C4GameSaveNetwork, C4GameSaveRecord, C4GameSaveSavegame, C4GameSaveScenario });
