// @ts-nocheck
// OpenClonk 36de799: src/control/C4Teams.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $u64n } from '../../rt/int.ts';
import { c$memcpy, c$memset } from '../../rt/libc.ts';
import { UnsyncedRandom$u32 } from '../../rt/native.ts';
import { $oat, $own, $rd, $wr, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete, $max, $min } from '../../rt/std.ts';

export class C4Team {
  piPlayers = null;
  iPlayerCount = 0;
  iPlayerCapacity = 0;
  iID = 0;
  Name = new Int8Array(31);
  iPlrStartIndex = 0;
  dwClr = 0;
  sIconSpec = new $.StdCopyStrBuf();
  iMaxPlayer = 0;

  init() {
    this.piPlayers = null;
    this.iPlayerCount = 0;
    this.iPlayerCapacity = 0;
    this.iID = 0;
    this.iPlrStartIndex = 0;
    this.dwClr = 0;
    this.sIconSpec = new $.StdCopyStrBuf();
    this.iMaxPlayer = 0;
    $wr(P(this.Name, 0), 0, 0);
    return this;
  }

  $dtor() {
    C4Team.prototype.Clear.call(this);
  }

  Clear() {
    $delete(this.piPlayers);
    this.piPlayers = null;
    this.iPlayerCount = this.iPlayerCapacity = this.iMaxPlayer = 0;
    this.iID = 0;
    $wr(P(this.Name, 0), 0, 0);
    this.sIconSpec.Clear();
  }

  AddPlayer(rInfo, fAdjustPlayer) {
    let $t1;
    0;
    if (!(rInfo.GetID() !== 0)) {
      return;
    }
    if (this.iPlayerCount >= this.iPlayerCapacity) {
      let piNewPlayers = P(new Int32Array($u64n(this.iPlayerCapacity = (this.iPlayerCount + 4 | 0) & -4)), 0);
      if (this.iPlayerCount !== 0) {
        c$memcpy(piNewPlayers, this.piPlayers, $u64n(this.iPlayerCount) * 4);
      }
      $delete(this.piPlayers);
      this.piPlayers = piNewPlayers;
    }
    this.piPlayers.a[this.piPlayers.o + ($t1 = this.iPlayerCount, this.iPlayerCount = this.iPlayerCount + 1 | 0, $t1)] = rInfo.GetID();
    if (!fAdjustPlayer) {
      return;
    }
    rInfo.SetTeam(this.GetID());
    if ($.Game.Teams.IsTeamColors()) {
      rInfo.SetColor(this.GetColor());
    }
    if (rInfo.IsJoined()) {
      let pJoinedPlr = $.Players.GetByInfoID(rInfo.GetID());
      0;
      if (pJoinedPlr != null) {
        pJoinedPlr.Team = this.GetID();
        if ($.Game.Teams.IsTeamColors()) {
          pJoinedPlr.SetPlayerColor(this.GetColor());
        }
      }
    }
  }

  RemoveIndexedPlayer(iIndex) {
    0;
    if (!$.Inside$i32$i32$i32$3(iIndex, 0, this.iPlayerCount - 1 | 0)) {
      return;
    }
    for (let i = iIndex + 1 | 0; i < this.iPlayerCount; i = i + 1 | 0) {
      this.piPlayers.a[this.piPlayers.o + (i - 1 | 0)] = this.piPlayers.a[this.piPlayers.o + i];
    }
    this.iPlayerCount = this.iPlayerCount - 1 | 0;
  }

  RemovePlayerByID(iID) {
    let i = 0;
    for (i = 0; i < this.iPlayerCount; i = i + 1 | 0) {
      if (this.piPlayers.a[this.piPlayers.o + i] === iID) {
        break;
      }
    }
    if (i === this.iPlayerCount) {
      0;
      return;
    }
    this.RemoveIndexedPlayer(i);
  }

  GetPlayerCount() {
    return this.iPlayerCount;
  }

  GetName() {
    return P(this.Name, 0);
  }

  GetID() {
    return this.iID;
  }

  IsPlayerIDInTeam(iID) {
    let $t1, $t2;
    let i = this.iPlayerCount;
    let piPlr = this.piPlayers;
    while (($t1 = i, i = i - 1 | 0, $t1) !== 0) {
      if ($rd(($t2 = piPlr, piPlr = piPlr.add(1), $t2)) === iID) {
        return true;
      }
    }
    return false;
  }

  GetFirstUnjoinedPlayerID() {
    let $t1, $t2;
    let i = this.iPlayerCount;
    let idPlr = 0;
    let piPlr = this.piPlayers;
    let pInfo = null;
    while (($t1 = i, i = i - 1 | 0, $t1) !== 0) {
      if ((pInfo = $.Game.PlayerInfos.GetPlayerInfoByID$i32(idPlr = $rd(($t2 = piPlr, piPlr = piPlr.add(1), $t2)))) != null) {
        if (!pInfo.HasJoinIssued()) {
          return idPlr;
        }
      }
    }
    return 0;
  }

  GetPlrStartIndex() {
    return this.iPlrStartIndex;
  }

  GetColor() {
    return this.dwClr;
  }

  GetIconSpec() {
    return this.sIconSpec.getData();
  }

  IsFull() {
    return this.iMaxPlayer !== 0 && this.iPlayerCount >= this.iMaxPlayer;
  }

  GetNameWithParticipants() {
    let $t1;
    let sTeamName = new $.StdStrBuf();
    sTeamName.Copy$pi8(this.GetName());
    if (this.GetPlayerCount() !== 0) {
      sTeamName.Append$pi8(S(" ("));
      let iTeamPlrCount = 0;
      for (let j = 0; j < this.GetPlayerCount(); j = j + 1 | 0) {
        let iPlr = this.GetIndexedPlayer(j);
        let pPlrInfo = null;
        if (iPlr !== 0) {
          if ((pPlrInfo = $.Game.PlayerInfos.GetPlayerInfoByID$i32(iPlr)) != null) {
            if (($t1 = iTeamPlrCount, iTeamPlrCount = iTeamPlrCount + 1 | 0, $t1) !== 0) {
              sTeamName.Append$pi8(S(", "));
            }
            sTeamName.Append$pi8(pPlrInfo.GetName());
          }
        }
      }
      sTeamName.AppendChar(41);
    }
    return sTeamName;
  }

  HasWon() {
    let fHasWon = false;
    for (let i = 0; i < this.iPlayerCount; i = i + 1 | 0) {
      let id = 0;
      let pInfo = null;
      if ((id = this.piPlayers.a[this.piPlayers.o + i]) !== 0) {
        if ((pInfo = $.Game.PlayerInfos.GetPlayerInfoByID$i32(id)) != null) {
          if (pInfo.HasWon()) {
            fHasWon = true;
            break;
          }
        }
      }
    }
    return fHasWon;
  }

  GetIndexedPlayer(iIndex) {
    return $.Inside$i32$i32$i32$3(iIndex, 0, this.iPlayerCount - 1 | 0) ? this.piPlayers.a[this.piPlayers.o + iIndex] : 0;
  }

  CompileFunc(pComp) {
    if (pComp.isDeserializer()) {
      this.Clear();
    }
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "iID"), S("id"), 0));
    pComp.Value$StdNamingDefaultAdapt$StdStringAdapt$x$5($.mkNamingAdapt$mStdStringAdapt$pi8$x$b$b$5($.mkStringAdaptMA$3(this.Name), S("Name"), S("")));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "iPlrStartIndex"), S("PlrStartIndex"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "iPlayerCount"), S("PlayerCount"), 0));
    if (pComp.isDeserializer()) {
      $delete(this.piPlayers);
      this.piPlayers = P(new Int32Array($u64n(this.iPlayerCapacity = this.iPlayerCount)), 0);
      $.ZeroMem$pi32$u64(this.piPlayers, 4 * $u64n(this.iPlayerCount));
    }
    pComp.Value$StdNamingAdapt$StdArrayDefaultAdapt$i32$i32$_IdFuncClass$i32($.mkNamingAdapt$mStdArrayDefaultAdapt$i32$i32$_IdFuncClass$i32$pi8($.mkArrayAdapt$pi32$u64$i32(this.piPlayers, $u64n(this.iPlayerCount), -1), S("Players")));
    pComp.Value$StdNamingDefaultAdapt$u32$u32($.mkNamingAdapt$ru32$pi8$u32$b$b(P(this, "dwClr"), S("Color"), 0));
    pComp.Value$StdNamingDefaultAdapt$StdParameterAdapt$StdCopyStrBuf$i32$StdCopyStrBuf($.mkNamingAdapt$mStdParameterAdapt$StdCopyStrBuf$i32$pi8$StdCopyStrBuf$b$b($.mkParAdapt$rStdCopyStrBuf$mi32(this.sIconSpec, 1 /*RCT_All*/), S("IconSpec"), new $.StdCopyStrBuf()));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "iMaxPlayer"), S("MaxPlayer"), 0));
  }

  RecheckPlayers() {
    let $t1;
    for (let i = 0; i < this.iPlayerCount; i = i + 1 | 0) {
      let fIsValid = false;
      let id = 0;
      let pInfo = null;
      if ((id = this.piPlayers.a[this.piPlayers.o + i]) !== 0) {
        if ((pInfo = $.Game.PlayerInfos.GetPlayerInfoByID$i32(id)) != null) {
          if (pInfo.GetTeam() === this.GetID()) {
            if (pInfo.IsUsingTeam()) {
              fIsValid = true;
            }
          }
        }
      }
      if (!fIsValid) {
        this.RemoveIndexedPlayer(($t1 = i, i = i - 1 | 0, $t1));
      }
    }
    let id = 0;
    let pInfo = null;
    while ((pInfo = $.Game.PlayerInfos.GetNextPlayerInfoByID(id)) != null) {
      id = pInfo.GetID();
      if (pInfo.GetTeam() === this.GetID()) {
        if (pInfo.IsUsingTeam()) {
          if (!this.IsPlayerIDInTeam(id)) {
            this.AddPlayer(pInfo, false);
          }
        }
      }
    }
  }

  RecheckColor(rForList) {
    let $t1;
    let C4MaxTeamColorChangeTries = 100;
    if (this.dwClr === 0) {
      let defTeamColorCount = 10;
      const defTeamColorRGB = new Uint32Array([0xf40000, 51200, 0xfcf41c, 0x2020ff, 0xc48444, 0xffffff, 0x848484, 0xff00ef, 65535, 0x784830]);
      if (this.iID >= 1 && this.iID <= 10) {
        this.dwClr = (defTeamColorRGB[this.iID - 1 | 0] | 0xff000000) >>> 0;
      } else {
        for (let iTry = 1; iTry < 100; iTry = iTry + 1 | 0) {
          this.dwClr = $.GenerateRandomPlayerColor(iTry);
          let iIdx = 0;
          let pTeam = null;
          let fOK = true;
          while ((pTeam = rForList.GetTeamByIndex(($t1 = iIdx, iIdx = iIdx + 1 | 0, $t1))) != null) {
            if (pTeam !== this) {
              if ($.IsColorConflict(pTeam.GetColor(), this.dwClr)) {
                fOK = false;
                break;
              }
            }
          }
          if (fOK) {
            return;
          }
        }
      }
    }
  }

  $copy(rCopy) {
    this.piPlayers = P(new Int32Array($u64n(rCopy.GetPlayerCount())), 0);
    this.iPlayerCount = rCopy.GetPlayerCount();
    this.iPlayerCapacity = rCopy.GetPlayerCount();
    this.iID = rCopy.GetID();
    this.iPlrStartIndex = rCopy.iPlrStartIndex;
    this.dwClr = rCopy.dwClr;
    this.sIconSpec = new $.StdCopyStrBuf().init$pi8$b(rCopy.GetIconSpec());
    this.iMaxPlayer = rCopy.iMaxPlayer;
    $.SCopy$pi8$pi8$u64(rCopy.GetName(), P(this.Name, 0), 30);
    for (let i = 0; i < this.iPlayerCount; i = i + 1 | 0) {
      this.piPlayers.a[this.piPlayers.o + i] = rCopy.GetIndexedPlayer(i);
    }
    return this;
  }
  $clone() { return new C4Team().$copy(this); }
  $assign(o) {
    this.piPlayers = o.piPlayers;
    this.iPlayerCount = o.iPlayerCount;
    this.iPlayerCapacity = o.iPlayerCapacity;
    this.iID = o.iID;
    this.Name = o.Name.slice();
    this.iPlrStartIndex = o.iPlrStartIndex;
    this.dwClr = o.dwClr;
    this.sIconSpec.$assign(o.sIconSpec);
    this.iMaxPlayer = o.iMaxPlayer;
    return this;
  }
}

export class C4TeamList {
  ppList = null;
  iTeamCount = 0;
  iTeamCapacity = 0;
  iLastTeamID = 0;
  fAllowHostilityChange = true;
  fAllowTeamSwitch = false;
  fActive = true;
  fCustom = false;
  fTeamColors = false;
  fAutoGenerateTeams = false;
  eTeamDist = 0 /*TEAMDIST_Free*/;
  iMaxScriptPlayers = 0;
  sScriptPlayerNames = new $.StdStrBuf();

  init() {
    this.ppList = null;
    this.iTeamCount = 0;
    this.iTeamCapacity = 0;
    this.iLastTeamID = 0;
    this.fAllowHostilityChange = true;
    this.fAllowTeamSwitch = false;
    this.fActive = true;
    this.fCustom = false;
    this.fTeamColors = false;
    this.fAutoGenerateTeams = false;
    this.eTeamDist = 0 /*TEAMDIST_Free*/;
    this.iMaxScriptPlayers = 0;
    this.sScriptPlayerNames = new $.StdStrBuf();
    return this;
  }

  $dtor() {
    C4TeamList.prototype.Clear.call(this);
  }

  Clear() {
    this.ClearTeams();
    $delete(this.ppList);
    this.ppList = null;
    this.iTeamCapacity = 0;
    this.fAllowHostilityChange = true;
    this.fAllowTeamSwitch = false;
    this.fCustom = false;
    this.fActive = true;
    this.fTeamColors = false;
    this.eTeamDist = 0 /*TEAMDIST_Free*/;
    this.fAutoGenerateTeams = false;
    this.iMaxScriptPlayers = 0;
    this.sScriptPlayerNames.Clear();
  }

  AddTeam(pNewTeam) {
    let $t1;
    if (this.iTeamCount >= this.iTeamCapacity) {
      let ppNewTeams = P(new Array($u64n(this.iTeamCapacity = (this.iTeamCount + 4 | 0) & -4)).fill(null), 0);
      if (this.iTeamCount !== 0) {
        c$memcpy(ppNewTeams, this.ppList, $u64n(this.iTeamCount) * 8);
      }
      $delete(this.ppList);
      this.ppList = ppNewTeams;
    }
    this.ppList.a[this.ppList.o + ($t1 = this.iTeamCount, this.iTeamCount = this.iTeamCount + 1 | 0, $t1)] = pNewTeam;
    this.iLastTeamID = $max(pNewTeam.iID, this.iLastTeamID);
  }

  ClearTeams() {
    let $t1, $t2;
    let ppTeam = this.ppList;
    if (this.iTeamCount !== 0) {
      while (($t1 = this.iTeamCount, this.iTeamCount = this.iTeamCount - 1 | 0, $t1) !== 0) {
        $delete($rd(($t2 = ppTeam, ppTeam = ppTeam.add(1), $t2)));
      }
      this.iTeamCount = 0;
    }
    this.iLastTeamID = 0;
  }

  GenerateDefaultTeams(iUpToID) {
    while (this.iLastTeamID < iUpToID) {
      const TeamName = new Int8Array(31);
      $.ssprintf$13(TeamName, $.LoadResStr(S("IDS_MSG_TEAM")), this.iLastTeamID + 1 | 0);
      if (!(this.CreateTeam(P(TeamName, 0)) != null)) {
        return false;
      }
    }
    return true;
  }

  GetTeamByID(iID) {
    let $t1;
    let ppCheck = this.ppList;
    let iCnt = this.iTeamCount;
    for (; ($t1 = iCnt, iCnt = iCnt - 1 | 0, $t1) !== 0; ppCheck = ppCheck.add(1)) {
      if (ppCheck.a[ppCheck.o].GetID() === iID) {
        return ppCheck.a[ppCheck.o];
      }
    }
    return null;
  }

  GetGenerateTeamByID(iID) {
    if (!this.IsMultiTeams()) {
      return null;
    }
    if (iID === -1) {
      iID = this.GetLargestTeamID() + 1 | 0;
    }
    let pTeam = this.GetTeamByID(iID);
    if (pTeam != null) {
      return pTeam;
    }
    this.GenerateDefaultTeams(iID);
    return this.GetTeamByID(iID);
  }

  GetTeamByIndex(iIndex) {
    if (!$.Inside$i32$i32$i32$3(iIndex, 0, this.iTeamCount - 1 | 0)) {
      return null;
    }
    return this.ppList.a[this.ppList.o + iIndex];
  }

  GetTeamByName(szName) {
    let $t1;
    0;
    let ppCheck = this.ppList;
    let iCnt = this.iTeamCount;
    for (; ($t1 = iCnt, iCnt = iCnt - 1 | 0, $t1) !== 0; ppCheck = ppCheck.add(1)) {
      if ($.SEqual(ppCheck.a[ppCheck.o].GetName(), szName)) {
        return ppCheck.a[ppCheck.o];
      }
    }
    return null;
  }

  GetTeamByPlayerID(iID) {
    let $t1;
    let ppCheck = this.ppList;
    let iCnt = this.iTeamCount;
    for (; ($t1 = iCnt, iCnt = iCnt - 1 | 0, $t1) !== 0; ppCheck = ppCheck.add(1)) {
      if (ppCheck.a[ppCheck.o].IsPlayerIDInTeam(iID)) {
        return ppCheck.a[ppCheck.o];
      }
    }
    return null;
  }

  GetLargestTeamID() {
    let $t1;
    let iLargest = 0;
    let ppCheck = this.ppList;
    let iCnt = this.iTeamCount;
    for (; ($t1 = iCnt, iCnt = iCnt - 1 | 0, $t1) !== 0; ppCheck = ppCheck.add(1)) {
      iLargest = $max(ppCheck.a[ppCheck.o].GetID(), iLargest);
    }
    return iLargest;
  }

  GetRandomSmallestTeam() {
    let $t1;
    let pLowestTeam = null;
    let iLowestTeamCount = 0;
    let ppCheck = this.ppList;
    let iCnt = this.iTeamCount;
    for (; ($t1 = iCnt, iCnt = iCnt - 1 | 0, $t1) !== 0; ppCheck = ppCheck.add(1)) {
      if (ppCheck.a[ppCheck.o].IsFull()) {
        continue;
      }
      if (pLowestTeam == null || pLowestTeam.GetPlayerCount() > ppCheck.a[ppCheck.o].GetPlayerCount()) {
        pLowestTeam = ppCheck.a[ppCheck.o];
        iLowestTeamCount = 1;
      } else if (pLowestTeam.GetPlayerCount() === ppCheck.a[ppCheck.o].GetPlayerCount()) {
        if (!(UnsyncedRandom$u32((iLowestTeamCount = iLowestTeamCount + 1 | 0) >>> 0) !== 0)) {
          pLowestTeam = ppCheck.a[ppCheck.o];
        }
      }
    }
    return pLowestTeam;
  }

  GetTeamCount() {
    return this.iTeamCount;
  }

  CreateTeam(szName) {
    let pNewTeam = new C4Team().init();
    pNewTeam.iID = this.iLastTeamID + 1 | 0;
    $.SCopy$pi8$pi8$u64(szName, P(pNewTeam.Name, 0), 30);
    this.AddTeam(pNewTeam);
    pNewTeam.RecheckColor(this);
    return pNewTeam;
  }

  IsMultiTeams() {
    return this.fActive;
  }

  IsCustom() {
    return this.fCustom;
  }

  IsHostilityChangeAllowed() {
    return this.fAllowHostilityChange;
  }

  IsTeamSwitchAllowed() {
    return this.fAllowTeamSwitch;
  }

  CanLocalChooseTeam$v() {
    if (!this.fActive) {
      return false;
    }
    switch (this.eTeamDist) {
      case 0:
        return true;
      case 1:
        return $.Control$2.isCtrlHost();
      case 2:
      case 3:
      case 4:
        return false;
      default:
        0;
        return false;
    }
  }

  CanLocalChooseTeam$i32(idPlayer) {
    let $t1;
    if (!this.CanLocalChooseTeam$v()) {
      return false;
    }
    if (this.IsAutoGenerateTeams()) {
      return true;
    }
    let pCurrentTeam = null;
    let pCheck = null;
    if (idPlayer !== 0) {
      pCurrentTeam = this.GetTeamByPlayerID(idPlayer);
    }
    let iCheckTeam = 0;
    while ((pCheck = this.GetTeamByIndex(($t1 = iCheckTeam, iCheckTeam = iCheckTeam + 1 | 0, $t1))) != null) {
      if (pCheck !== pCurrentTeam) {
        if (!pCheck.IsFull()) {
          break;
        }
      }
    }
    return !(pCheck == null);
  }

  CanLocalSeeTeam() {
    if (!this.fActive) {
      return false;
    }
    if (this.eTeamDist !== 4) {
      return true;
    }
    return !!$.Game.IsRunning;
  }

  IsTeamColors() {
    return this.fTeamColors;
  }

  IsRandomTeam() {
    return this.eTeamDist === 3 || this.eTeamDist === 4;
  }

  IsJoin2TeamAllowed(idTeam, plrType) {
    if (idTeam === -1) {
      return this.IsAutoGenerateTeams();
    }
    let pTeam = this.GetTeamByID(idTeam);
    if (pTeam == null) {
      return false;
    }
    return !pTeam.IsFull() || plrType === 2;
  }

  IsAutoGenerateTeams() {
    return this.fAutoGenerateTeams;
  }

  IsRuntimeJoinTeamChoice() {
    return this.IsCustom() && this.IsMultiTeams();
  }

  GetMaxScriptPlayers() {
    return this.iMaxScriptPlayers;
  }

  GetForcedTeamSelection(idForPlayer) {
    let $t1;
    let pOKTeam = null;
    let pCheck = null;
    if (idForPlayer !== 0) {
      pOKTeam = this.GetTeamByPlayerID(idForPlayer);
    }
    let iCheckTeam = 0;
    while ((pCheck = this.GetTeamByIndex(($t1 = iCheckTeam, iCheckTeam = iCheckTeam + 1 | 0, $t1))) != null) {
      if (!pCheck.IsFull()) {
        if (pOKTeam != null && pOKTeam !== pCheck) {
          return 0;
        }
        pOKTeam = pCheck;
      }
    }
    if (pOKTeam != null) {
      if (this.IsAutoGenerateTeams()) {
        return 0;
      }
      return pOKTeam.GetID();
    }
    if (this.IsAutoGenerateTeams()) {
      return -1;
    }
    return 0;
  }

  GetScriptPlayerName() {
    let $t1;
    if (!(this.sScriptPlayerNames.getLength() !== 0)) {
      return new $.StdStrBuf().init$pi8$b($.LoadResStr(S("IDS_TEXT_COMPUTER")));
    }
    let iNameIdx = 0;
    let sOut = new $.StdStrBuf();
    while (this.sScriptPlayerNames.GetSection($u64n(($t1 = iNameIdx, iNameIdx = iNameIdx + 1 | 0, $t1)), sOut, 124)) {
      if (!($.Game.PlayerInfos.GetActivePlayerInfoByName(sOut.getData()) != null)) {
        return sOut;
      }
    }
    this.sScriptPlayerNames.GetSection(UnsyncedRandom$u32((iNameIdx - 1 | 0) >>> 0), sOut, 124);
    return sOut;
  }

  IsTeamVisible() {
    if (this.eTeamDist === 4) {
      if ($.Network.isLobbyActive()) {
        return false;
      }
    }
    return true;
  }

  EnforceLeagueRules() {
    this.fAllowTeamSwitch = false;
  }

  RecheckPlayerInfoTeams(rNewJoin, fByHost) {
    0;
    if (!this.IsMultiTeams()) {
      return false;
    }
    let pCurrentTeam = this.GetTeamByPlayerID(rNewJoin.GetID());
    let idCurrentTeam = pCurrentTeam != null ? pCurrentTeam.GetID() : 0;
    if (rNewJoin.GetTeam() !== 0) {
      if (idCurrentTeam === rNewJoin.GetTeam()) {
        return true;
      }
      if (this.eTeamDist === 0 || this.eTeamDist === 1 && fByHost) {
        if (rNewJoin.GetTeam() !== -1 && this.IsJoin2TeamAllowed(rNewJoin.GetTeam(), rNewJoin.GetType())) {
          return true;
        }
      }
      rNewJoin.SetTeam(idCurrentTeam);
      if (idCurrentTeam !== 0) {
        return true;
      }
    }
    let fWillHaveLobby = $.Network.isEnabled() && !$.Network.Status.isPastLobby() && $.Game.fLobby;
    let fHasOrWillHaveLobby = $.Network.isLobbyActive() || fWillHaveLobby;
    let fCanPickTeamAtRuntime = !this.IsRandomTeam() && rNewJoin.GetType() === 1 && this.IsRuntimeJoinTeamChoice();
    let fIsTeamNeeded = this.IsRuntimeJoinTeamChoice() || this.GetTeamCount() !== 0;
    if (!fHasOrWillHaveLobby && (!fIsTeamNeeded || fCanPickTeamAtRuntime)) {
      return false;
    }
    let pAssignTeam = null;
    let pLowestTeam = this.GetRandomSmallestTeam();
    if (this.IsAutoGenerateTeams() && !this.IsRandomTeam()) {
      if (pLowestTeam != null && !(pLowestTeam.GetPlayerCount() !== 0)) {
        pAssignTeam = pLowestTeam;
      } else {
        this.GenerateDefaultTeams(this.iLastTeamID + 1 | 0);
        pAssignTeam = this.GetTeamByID(this.iLastTeamID);
      }
    } else {
      if (pLowestTeam == null) {
        if (!(this.GetTeamByIndex(1) != null)) {
          this.GenerateDefaultTeams(2);
        } else {
          return false;
        }
        pLowestTeam = this.GetTeamByIndex(0);
      }
      pAssignTeam = pLowestTeam;
    }
    if (pAssignTeam == null) {
      return false;
    }
    pAssignTeam.AddPlayer(rNewJoin, true);
    return true;
  }

  CompileFunc(pComp) {
    let $t1;
    pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "fActive"), S("Active"), true));
    pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "fCustom"), S("Custom"), true));
    pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "fAllowHostilityChange"), S("AllowHostilityChange"), false));
    pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "fAllowTeamSwitch"), S("AllowTeamSwitch"), false));
    pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "fAutoGenerateTeams"), S("AutoGenerateTeams"), false));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "iLastTeamID"), S("LastTeamID"), 0));
    const TeamDistEntries = $own([
  ((($o) => ($o.Name = S("Free"), $o.Val = 0 /*TEAMDIST_Free*/, $o))(new $.StdEnumEntry$i32$11())),
  ((($o) => ($o.Name = S("Host"), $o.Val = 1 /*TEAMDIST_Host*/, $o))(new $.StdEnumEntry$i32$11())),
  ((($o) => ($o.Name = S("None"), $o.Val = 2 /*TEAMDIST_None*/, $o))(new $.StdEnumEntry$i32$11())),
  ((($o) => ($o.Name = S("Random"), $o.Val = 3 /*TEAMDIST_Random*/, $o))(new $.StdEnumEntry$i32$11())),
  ((($o) => ($o.Name = S("RandomInv"), $o.Val = 4 /*TEAMDIST_RandomInv*/, $o))(new $.StdEnumEntry$i32$11())),
]);
    pComp.Value$StdNamingDefaultAdapt$StdEnumAdapt$i32$u8$i32$3($.mkNamingAdapt$mStdEnumAdapt$i32$u8$pi8$i32$b$b$3($.mkEnumAdaptT$4(P(this, "eTeamDist"), $oat(TeamDistEntries, 0)), S("TeamDistribution"), 0 /*TEAMDIST_Free*/));
    pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "fTeamColors"), S("TeamColors"), false));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "iMaxScriptPlayers"), S("MaxScriptPlayers"), 0));
    pComp.Value$StdNamingDefaultAdapt$StdParameterAdapt$StdStrBuf$i32$StdStrBuf($.mkNamingAdapt$mStdParameterAdapt$StdStrBuf$i32$pi8$StdStrBuf$b$b($.mkParAdapt$rStdStrBuf$mi32(this.sScriptPlayerNames, 1 /*RCT_All*/), S("ScriptPlayerNames"), new $.StdStrBuf()));
    let iOldTeamCount = this.iTeamCount;
    pComp.Value$StdNamingCountAdapt$i32($.mkNamingCountAdapt$ri32$pi8(P(this, "iTeamCount"), S("Team")));
    if (pComp.isDeserializer()) {
      while (($t1 = iOldTeamCount, iOldTeamCount = iOldTeamCount - 1 | 0, $t1) !== 0) {
        $delete(this.ppList.a[this.ppList.o + iOldTeamCount]);
      }
      $delete(this.ppList);
      if ((this.iTeamCapacity = this.iTeamCount) !== 0) {
        this.ppList = P(new Array($u64n(this.iTeamCapacity)).fill(null), 0);
        c$memset(this.ppList, 0, 8 * $u64n(this.iTeamCapacity));
      } else {
        this.ppList = null;
      }
    }
    if (this.iTeamCount !== 0) {
      $.mkPtrAdaptNoNull$rpC4Team(this.ppList);
      pComp.Value$StdNamingAdapt$StdArrayAdapt$pC4Team$StdPtrAdapt$C4Team($.mkNamingAdapt$mStdArrayAdapt$pC4Team$StdPtrAdapt$C4Team$pi8($.mkArrayAdaptMap$ppC4Team$i32$x(this.ppList, this.iTeamCount, $.mkPtrAdaptNoNull$rpC4Team), S("Team")));
    }
    if (pComp.isDeserializer()) {
      this.iLastTeamID = $max(this.GetLargestTeamID(), this.iLastTeamID);
      if (this.iTeamCount === 0) {
        this.fAutoGenerateTeams = true;
      }
    }
  }

  Load(hGroup, pInitDefault, pLang) {
    let $t1;
    this.Clear();
    let Buf = new $.StdStrBuf();
    if (!hGroup.LoadEntryString$pi8$pStdStrBuf(S("Teams.txt"), Buf)) {
      if (pInitDefault == null) {
        return false;
      }
      if (pInitDefault.Game.IsMelee()) {
        this.fAllowHostilityChange = true;
        this.fActive = true;
        this.fAutoGenerateTeams = true;
      } else {
        this.fAllowHostilityChange = true;
        this.fActive = false;
      }
      this.fCustom = false;
    } else {
      if (pLang != null) {
        pLang.ReplaceStrings$rStdStrBuf(Buf);
      }
      if (!$.CompileFromBuf_LogWarn$mStdNamingAdapt$C4TeamList$x$pi8($.mkNamingAdapt$rC4TeamList$pi8(this, S("Teams")), Buf, S("Teams.txt"))) {
        return false;
      }
    }
    let iTeam = 0;
    let pTeam = null;
    while ((pTeam = this.GetTeamByIndex(($t1 = iTeam, iTeam = iTeam + 1 | 0, $t1))) != null) {
      pTeam.RecheckColor(this);
    }
    return true;
  }

  Save(hGroup) {
    hGroup.DeleteEntry(S("Teams.txt"));
    try {
      let Buf = $.DecompileToBuf$StdNamingAdapt$C4TeamList($.mkNamingAdapt$rC4TeamList$pi8(this, S("Teams")));
      hGroup.Add$pi8$rStdStrBuf$b$b$b(S("Teams.txt"), Buf, false, true);
    } catch ($e1) {
      if ($e1 instanceof $.StdCompiler$Exception) {
        return false;
      } else {
        throw $e1;
      }
    }
    return true;
  }

  RecheckPlayers() {
    let $t1;
    let ppCheck = this.ppList;
    let iCnt = this.iTeamCount;
    for (; ($t1 = iCnt, iCnt = iCnt - 1 | 0, $t1) !== 0; ppCheck = ppCheck.add(1)) {
      ppCheck.a[ppCheck.o].RecheckPlayers();
    }
  }

  RecheckTeams() {
    let $t1;
    if (!this.IsRandomTeam()) {
      return;
    }
    if (!$.Control$2.isCtrlHost()) {
      this.EnsureTeamCount();
      return;
    }
    if (this.IsAutoGenerateTeams() && this.GetTeamCount() !== 2) {
      this.ReassignAllTeams();
      return;
    }
    for (; ; ) {
      let pLowestTeam = this.GetRandomSmallestTeam();
      if (pLowestTeam == null) {
        break;
      }
      let pLargestTeam = null;
      let ppCheck = this.ppList;
      let iCnt = this.iTeamCount;
      for (; ($t1 = iCnt, iCnt = iCnt - 1 | 0, $t1) !== 0; ppCheck = ppCheck.add(1)) {
        if (pLargestTeam == null || pLargestTeam.GetPlayerCount() > ppCheck.a[ppCheck.o].GetPlayerCount()) {
          if (ppCheck.a[ppCheck.o].GetFirstUnjoinedPlayerID() !== 0) {
            pLargestTeam = ppCheck.a[ppCheck.o];
          }
        }
      }
      if (pLargestTeam == null) {
        break;
      }
      if ((pLargestTeam.GetPlayerCount() - pLowestTeam.GetPlayerCount() | 0) <= 1) {
        break;
      }
      let idRedistPlayer = pLargestTeam.GetFirstUnjoinedPlayerID();
      let pInfo = $.Game.PlayerInfos.GetPlayerInfoByID$i32(idRedistPlayer);
      0;
      if (pInfo == null) {
        break;
      }
      pLargestTeam.RemovePlayerByID(idRedistPlayer);
      pLowestTeam.AddPlayer(pInfo, true);
      let pClrInfo = $.Game.PlayerInfos.GetClientInfoByPlayerID(idRedistPlayer);
      0;
      if (pClrInfo != null) {
        pClrInfo.SetUpdated();
      }
    }
  }

  EnsureTeamCount() {
    if (this.IsRandomTeam()) {
      if (this.IsAutoGenerateTeams() && this.GetTeamCount() !== 2) {
        this.ClearTeams();
        this.GenerateDefaultTeams(2);
      }
    }
  }

  ReassignAllTeams() {
    0;
    if (!$.Control$2.isCtrlHost()) {
      return;
    }
    let idStart = -1;
    let pNfo = null;
    while ((pNfo = $.Game.PlayerInfos.GetNextPlayerInfoByID(idStart)) != null) {
      idStart = pNfo.GetID();
      if (pNfo.HasJoinIssued()) {
        continue;
      }
      pNfo.SetTeam(0);
      let pCltInfo = $.Game.PlayerInfos.GetClientInfoByPlayerID(idStart);
      0;
      if (pCltInfo != null) {
        pCltInfo.SetUpdated();
      }
    }
    this.RecheckPlayers();
    this.EnsureTeamCount();
    idStart = -1;
    while ((pNfo = $.Game.PlayerInfos.GetNextPlayerInfoByID(idStart)) != null) {
      idStart = pNfo.GetID();
      if (pNfo.HasJoinIssued()) {
        continue;
      }
      0;
      this.RecheckPlayerInfoTeams(pNfo, true);
    }
  }

  GetTeamDistName(eTeamDist) {
    switch (eTeamDist) {
      case 0:
        return new $.StdStrBuf().init$pi8$b($.LoadResStr(S("IDS_MSG_TEAMDIST_FREE")), true);
      case 1:
        return new $.StdStrBuf().init$pi8$b($.LoadResStr(S("IDS_MSG_TEAMDIST_HOST")), true);
      case 2:
        return new $.StdStrBuf().init$pi8$b($.LoadResStr(S("IDS_MSG_TEAMDIST_NONE")), true);
      case 3:
        return new $.StdStrBuf().init$pi8$b($.LoadResStr(S("IDS_MSG_TEAMDIST_RND")), true);
      case 4:
        return new $.StdStrBuf().init$pi8$b($.LoadResStr(S("IDS_MSG_TEAMDIST_RNDINV")), true);
      default:
        return $.FormatString(S("TEAMDIST_undefined(%d)"), eTeamDist);
    }
  }

  FillTeamDistOptions(pFiller) {
    if (!this.fActive) {
      return;
    }
    pFiller.AddEntry(this.GetTeamDistName(0 /*TEAMDIST_Free*/).getData(), 0);
    pFiller.AddEntry(this.GetTeamDistName(1 /*TEAMDIST_Host*/).getData(), 1);
    if (this.IsAutoGenerateTeams()) {
      pFiller.AddEntry(this.GetTeamDistName(2 /*TEAMDIST_None*/).getData(), 2);
    }
    pFiller.AddEntry(this.GetTeamDistName(3 /*TEAMDIST_Random*/).getData(), 3);
    pFiller.AddEntry(this.GetTeamDistName(4 /*TEAMDIST_RandomInv*/).getData(), 4);
  }

  SendSetTeamDist(eNewTeamDist) {
    0;
    $.Control$2.DoInput(135 /*CID_Set*/, new $.C4ControlSet().init$i32$i32(3 /*C4CVT_TeamDistribution*/, eNewTeamDist), 1 /*CDT_Sync*/);
  }

  GetTeamDist() {
    return this.eTeamDist;
  }

  GetTeamDistString() {
    return this.GetTeamDistName(this.eTeamDist);
  }

  HasTeamDistOptions() {
    return this.fActive;
  }

  SetTeamDistribution(eToVal) {
    if (!$.Inside$i32$i32$i32(eToVal, 0 /*TEAMDIST_First*/, 4 /*TEAMDIST_Last*/)) {
      0;
      return;
    }
    this.eTeamDist = eToVal;
    if ($.Control$2.isCtrlHost()) {
      if (this.IsRandomTeam() || this.eTeamDist === 2) {
        this.ReassignAllTeams();
      } else {
        this.RecheckTeams();
      }
      if ($.Network.isEnabled()) {
        $.Network.Players.SendUpdatedPlayers();
      }
    }
  }

  SendSetTeamColors(fEnabled) {
    $.Control$2.DoInput(135 /*CID_Set*/, new $.C4ControlSet().init$i32$i32(4 /*C4CVT_TeamColors*/, fEnabled ? 1 : 0), 1 /*CDT_Sync*/);
  }

  SetTeamColors(fEnabled) {
    if ((fEnabled ? 1 : 0) === (this.fTeamColors ? 1 : 0)) {
      return;
    }
    this.fTeamColors = fEnabled;
    if (!$.Control$2.isCtrlHost()) {
      return;
    }
    $.Game.PlayerInfos.UpdatePlayerAttributes$v();
    if ($.Network.isEnabled()) {
      $.Network.Players.SendUpdatedPlayers();
    }
  }

  GetStartupTeamCount(startup_player_count) {
    let $t1;
    let i_team = 0;
    let team = null;
    let team_count = 0;
    while ((team = this.GetTeamByIndex(($t1 = i_team, i_team = i_team + 1 | 0, $t1))) != null) {
      if (team.GetPlayerCount() > 0) {
        team_count = team_count + 1 | 0;
      }
    }
    if (team_count === 0) {
      if (this.IsCustom() && !this.IsAutoGenerateTeams()) {
        team_count = $min(startup_player_count, this.GetTeamCount());
      } else if (this.IsRandomTeam()) {
        team_count = $min(startup_player_count, 2);
      } else {
        team_count = startup_player_count;
      }
    }
    return team_count;
  }

  $clone() { return new C4TeamList().$assign(this); }
  $assign(rCopy) {
    this.Clear();
    if ((this.iTeamCount = this.iTeamCapacity = rCopy.iTeamCount) !== 0) {
      this.ppList = P(new Array($u64n(this.iTeamCapacity)).fill(null), 0);
    }
    for (let i = 0; i < this.iTeamCount; i = i + 1 | 0) {
      this.ppList.a[this.ppList.o + i] = new C4Team().$copy(rCopy.ppList.a[rCopy.ppList.o + i]);
    }
    this.iLastTeamID = rCopy.iLastTeamID;
    this.fAllowHostilityChange = rCopy.fAllowHostilityChange;
    this.fAllowTeamSwitch = rCopy.fAllowTeamSwitch;
    this.fCustom = rCopy.fCustom;
    this.fActive = rCopy.fActive;
    this.eTeamDist = rCopy.eTeamDist;
    this.fTeamColors = rCopy.fTeamColors;
    this.fAutoGenerateTeams = rCopy.fAutoGenerateTeams;
    this.sScriptPlayerNames.$assign(rCopy.sScriptPlayerNames);
    return this;
  }
}



export function $init(): void {
  $.TEAMID_Unknown$C4Teams = -1;
  $.TEAMID_New$C4Teams = -1;
}

Object.assign($, { C4Team, C4TeamList });
