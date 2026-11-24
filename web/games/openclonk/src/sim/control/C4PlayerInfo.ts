// @ts-nocheck
// OpenClonk 36de799: src/control/C4PlayerInfo.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $u64n } from '../../rt/int.ts';
import { c$memcpy } from '../../rt/libc.ts';
import { $oat, $own, $padd, $rd, $wr, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete, $max } from '../../rt/std.ts';
import { C4PacketBase } from '../network/C4PacketBase.ts';

export class C4PlayerInfo {
  dwFlags = 0;
  eType = 1 /*C4PT_User*/;
  sName = new $.ValidatedStdCopyStrBuf$4().init$v();
  sForcedName = new $.ValidatedStdCopyStrBuf$3().init$v();
  iID = 0;
  pRes = new $.C4Network2Res$Ref();
  ResCore = new $.C4Network2ResCore();
  szFilename = new $.StdCopyStrBuf();
  dwColor = 0xffffffff;
  dwOriginalColor = 0;
  dwAlternateColor = 0;
  idSavegamePlayer = 0;
  idTeam = 0;
  szAuthID = new $.StdCopyStrBuf();
  iInGameNumber = -1;
  iInGameJoinFrame = -1;
  iInGamePartFrame = -1;
  idExtraData = new $.C4ID().init$v();
  sLeagueAccount = new $.ValidatedStdCopyStrBuf$3().init$v();
  iLeagueScore = 0;
  iLeagueRank = 0;
  iLeagueRankSymbol = 0;
  iLeagueScoreProjected = 0;
  iLeagueProjectedGain = -1;
  sClanTag = new $.ValidatedStdCopyStrBuf$3().init$v();
  iLeaguePerformance = 0;
  sLeagueProgressData = new $.StdCopyStrBuf();

  init() {
    this.dwFlags = 0;
    this.eType = 1 /*C4PT_User*/;
    this.sName = new $.ValidatedStdCopyStrBuf$4().init$v();
    this.sForcedName = new $.ValidatedStdCopyStrBuf$3().init$v();
    this.iID = 0;
    this.pRes = new $.C4Network2Res$Ref().init$pC4Network2Res(null);
    this.ResCore = new $.C4Network2ResCore().init();
    this.szFilename = new $.StdCopyStrBuf();
    this.dwColor = 0xffffffff;
    this.dwOriginalColor = 0;
    this.dwAlternateColor = 0;
    this.idSavegamePlayer = 0;
    this.idTeam = 0;
    this.szAuthID = new $.StdCopyStrBuf();
    this.iInGameNumber = -1;
    this.iInGameJoinFrame = -1;
    this.iInGamePartFrame = -1;
    this.idExtraData = $.C4ID.None.$clone();
    this.sLeagueAccount = new $.ValidatedStdCopyStrBuf$3().init$pi8(S(""));
    this.iLeagueScore = 0;
    this.iLeagueRank = 0;
    this.iLeagueRankSymbol = 0;
    this.iLeagueProjectedGain = -1;
    this.sClanTag = new $.ValidatedStdCopyStrBuf$3().init$v();
    this.iLeaguePerformance = 0;
    this.sLeagueProgressData = new $.StdCopyStrBuf();
    return this;
  }

  Clear() {
    this.DeleteTempFile();
    this.sName.Clear();
    this.szFilename.Clear();
    this.pRes.op_assign$pC4Network2Res(null);
    this.ResCore.Clear();
    this.dwColor = this.dwOriginalColor = 0xffffffff;
    this.dwAlternateColor = 0;
    this.dwFlags = 0;
    this.iID = this.idSavegamePlayer = this.idTeam = 0;
    this.iInGameNumber = this.iInGameJoinFrame = this.iInGamePartFrame = -1;
    this.sLeagueAccount.op_assign$x(S(""));
    this.iLeagueScore = this.iLeagueRank = 0;
    this.iLeagueProjectedGain = -1;
    this.eType = 1 /*C4PT_User*/;
    this.idExtraData.$assign($.C4ID.None);
    this.iLeaguePerformance = 0;
    this.sLeagueProgressData.Clear();
  }

  LoadFromLocalFile(szFilename) {
    0;
    this.Clear();
    let Grp = new $.C4Group().init();
    if (!$.Reloc.Open(Grp, szFilename)) {
      return false;
    }
    let C4P = new $.C4PlayerInfoCore().init();
    if (!C4P.Load$rC4Group(Grp)) {
      return false;
    }
    this.eType = 1 /*C4PT_User*/;
    this.sName.op_assign$x$2(C4P.PrefName);
    this.szFilename.op_assign$pi8(szFilename);
    this.dwColor = this.dwOriginalColor = (0xff000000 | (C4P.PrefColorDw & 0xffffff) >>> 0) >>> 0;
    this.dwAlternateColor = (0xff000000 | (C4P.PrefColor2Dw & 0xffffff) >>> 0) >>> 0;
    if ($.Network.isEnabled() && !$.Game.C4S.Head.Replay) {
      this.pRes.$assign($.Network.ResList.getRefRes$pi8$b(szFilename, true));
      if (this.pRes.op_not()) {
        this.pRes.$assign($.Network.ResList.AddByGroup(Grp, false, 3 /*NRT_Player*/, -1, szFilename));
      }
      if (this.pRes.op_not()) {
        return false;
      }
      this.ResCore.$assign(this.pRes.op_arrow().getCore());
      this.dwFlags = (this.dwFlags | 8) >>> 0;
    }
    return true;
  }

  SetAsScriptPlayer(szName, dwColor, dwFlags, idExtra) {
    this.Clear();
    this.eType = 2 /*C4PT_Script*/;
    this.dwColor = this.dwOriginalColor = (0xff000000 | (dwColor & 0xffffff) >>> 0) >>> 0;
    this.dwAlternateColor = 0;
    this.sName.CopyValidated$pi8(szName);
    this.idExtraData.$assign(idExtra);
    this.dwFlags = (this.dwFlags | dwFlags) >>> 0;
    return true;
  }

  SetJoined(iNumber) {
    this.iInGameNumber = iNumber;
    this.iInGameJoinFrame = $.Game.FrameCounter;
    this.dwFlags = (this.dwFlags | 1) >>> 0;
  }

  SetJoinIssued() {
    this.dwFlags = (this.dwFlags | 16) >>> 0;
  }

  SetRemoved() {
    this.dwFlags = (this.dwFlags | 5) >>> 0;
    this.iInGamePartFrame = $.Game.FrameCounter;
  }

  SetID(iToID) {
    this.iID = iToID;
  }

  SetColor(dwUseClr) {
    this.dwColor = dwUseClr;
  }

  SetOriginalColor(dwUseClr) {
    this.dwOriginalColor = dwUseClr;
  }

  SetFilename(szToFilename) {
    this.szFilename.op_assign$pi8(szToFilename);
  }

  SetToScenarioFilename(szScenFilename) {
    this.DiscardResource();
    this.SetFilename(szScenFilename);
    this.dwFlags = (this.dwFlags | 64) >>> 0;
  }

  SetTempFile() {
    0;
    this.dwFlags = (this.dwFlags | 32) >>> 0;
  }

  SetTeam(idToTeam) {
    this.idTeam = idToTeam;
  }

  DeleteTempFile() {
    if (!this.szFilename.op_not() && (this.dwFlags & 32) >>> 0 !== 0) {
      $.EraseItem(this.szFilename.getData());
      this.dwFlags = (this.dwFlags & 0xffffffdf) >>> 0;
      this.szFilename.Clear();
    }
  }

  LoadResource() {
    if (this.IsRemoved() || !((this.dwFlags & 8) >>> 0 !== 0) || this.pRes.op_C4Network2Res_() != null) {
      return;
    }
    if ($.Game.C4S.Head.Replay || (this.dwFlags & 64) >>> 0 !== 0) {
      this.dwFlags = (this.dwFlags & 0xfffffff7) >>> 0;
    } else if (this.pRes.$assign($.Network.ResList.AddByCore(this.ResCore)).op_not()) {
      this.dwFlags = (this.dwFlags & 0xfffffff7) >>> 0;
      $.LogF(S("Error: Could not add resource %d for player %s! Player file too large to load?"), this.ResCore.getID(), this.GetFilename());
    }
  }

  DiscardResource() {
    if (this.pRes.op_C4Network2Res_() != null) {
      0;
      this.pRes.op_assign$pC4Network2Res(null);
      this.dwFlags = (this.dwFlags & 0xfffffff7) >>> 0;
    } else {
      0;
    }
    this.ResCore.Clear();
  }

  SetAssociatedSavegamePlayer(aidSavegamePlayer) {
    this.idSavegamePlayer = aidSavegamePlayer;
  }

  GetAssociatedSavegamePlayerID() {
    return this.idSavegamePlayer;
  }

  SetJoinForSavegameOnly() {
    this.dwFlags = (this.dwFlags | 128) >>> 0;
  }

  IsJoinForSavegameOnly() {
    return !!((this.dwFlags & 128) >>> 0 !== 0);
  }

  SetSavegameResume(pSavegameInfo) {
    if (pSavegameInfo == null) {
      return false;
    }
    this.iID = pSavegameInfo.GetID();
    this.dwFlags = ((this.dwFlags & 0xffff07ea) >>> 0 | (pSavegameInfo.GetFlags() & 63509) >>> 0) >>> 0;
    this.dwColor = pSavegameInfo.GetColor();
    this.idTeam = pSavegameInfo.GetTeam();
    return true;
  }

  SetAuthID(sznAuthID) {
    this.szAuthID.op_assign$pi8(sznAuthID);
  }

  SetLeagueData(szAccount, szNewClanTag, iScore, iRank, iRankSymbol, szProgressData) {
    this.sLeagueAccount.CopyValidated$pi8(szAccount);
    this.sClanTag.CopyValidated$pi8(szNewClanTag);
    this.iLeagueScore = iScore;
    this.iLeagueRank = iRank;
    this.iLeagueRankSymbol = iRankSymbol;
    this.sLeagueProgressData.Copy$pi8(szProgressData);
  }

  SetLeaguePerformance(iNewPerf) {
    this.iLeaguePerformance = iNewPerf;
  }

  SetLeagueProgressData(szNewProgressData) {
    if (szNewProgressData != null) {
      this.sLeagueProgressData.Copy$pi8(szNewProgressData);
    } else {
      this.sLeagueProgressData.Clear();
    }
  }

  SetVotedOut() {
    this.dwFlags = (this.dwFlags | 1024) >>> 0;
  }

  SetLeagueProjectedGain(iProjectedGain) {
    0;
    this.iLeagueProjectedGain = iProjectedGain;
  }

  ResetLeagueProjectedGain() {
    this.iLeagueProjectedGain = -1;
  }

  SetForcedName(szNewName) {
    if (szNewName != null) {
      this.sForcedName.CopyValidated$pi8(szNewName);
    } else {
      this.sForcedName.Clear();
    }
  }

  CompileFunc(pComp) {
    pComp.Value$StdNamingDefaultAdapt$ValidatedStdCopyStrBuf$4$x($.mkNamingAdapt$rValidatedStdCopyStrBuf$4$pi8$x$b$b(this.sName, S("Name"), S("")));
    pComp.Value$StdNamingDefaultAdapt$ValidatedStdCopyStrBuf$3$x($.mkNamingAdapt$rValidatedStdCopyStrBuf$3$pi8$x$b$b(this.sForcedName, S("ForcedName"), S("")));
    pComp.Value$StdNamingDefaultAdapt$StdCopyStrBuf$x($.mkNamingAdapt$rStdCopyStrBuf$pi8$x$b$b(this.szFilename, S("Filename"), S("")));
    const Entries = $own([
  ((($o) => ($o.Name = S("Joined"), $o.Val = 1, $o))(new $.StdBitfieldEntry$u16())),
  ((($o) => ($o.Name = S("Removed"), $o.Val = 4, $o))(new $.StdBitfieldEntry$u16())),
  ((($o) => ($o.Name = S("HasResource"), $o.Val = 8, $o))(new $.StdBitfieldEntry$u16())),
  ((($o) => ($o.Name = S("JoinIssued"), $o.Val = 16, $o))(new $.StdBitfieldEntry$u16())),
  ((($o) => ($o.Name = S("SavegameJoin"), $o.Val = 128, $o))(new $.StdBitfieldEntry$u16())),
  ((($o) => ($o.Name = S("Disconnected"), $o.Val = 256, $o))(new $.StdBitfieldEntry$u16())),
  ((($o) => ($o.Name = S("VotedOut"), $o.Val = 1024, $o))(new $.StdBitfieldEntry$u16())),
  ((($o) => ($o.Name = S("Won"), $o.Val = 512, $o))(new $.StdBitfieldEntry$u16())),
  ((($o) => ($o.Name = S("AttributesFixed"), $o.Val = 2048, $o))(new $.StdBitfieldEntry$u16())),
  ((($o) => ($o.Name = S("NoScenarioInit"), $o.Val = 4096, $o))(new $.StdBitfieldEntry$u16())),
  ((($o) => ($o.Name = S("NoScenarioSave"), $o.Val = 32768, $o))(new $.StdBitfieldEntry$u16())),
  ((($o) => ($o.Name = S("NoEliminationCheck"), $o.Val = 8192, $o))(new $.StdBitfieldEntry$u16())),
  ((($o) => ($o.Name = S("Invisible"), $o.Val = 16384, $o))(new $.StdBitfieldEntry$u16())),
  ((($o) => ($o.Name = null, $o.Val = 0, $o))(new $.StdBitfieldEntry$u16())),
]);
    const dwSyncFlags = [(this.dwFlags & 65485) >>> 0 & 0xffff];
    pComp.Value$StdNamingDefaultAdapt$StdBitfieldAdapt$u16$u32($.mkNamingAdapt$mStdBitfieldAdapt$u16$pi8$u32$b$b($.mkBitfieldAdapt$ru16$pStdBitfieldEntry(P(dwSyncFlags, 0), $oat(Entries, 0)), S("Flags"), 0));
    if (pComp.isDeserializer()) {
      this.dwFlags = dwSyncFlags[0];
    }
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "iID"), S("ID"), 0));
    const PlayerTypes = $own([((($o) => ($o.Name = S("User"), $o.Val = 1 /*C4PT_User*/, $o))(new $.StdEnumEntry$i32$7())), ((($o) => ($o.Name = S("Script"), $o.Val = 2 /*C4PT_Script*/, $o))(new $.StdEnumEntry$i32$7())), ((($o) => ($o.Name = null, $o.Val = 1 /*C4PT_User*/, $o))(new $.StdEnumEntry$i32$7()))]);
    pComp.Value$StdNamingDefaultAdapt$StdEnumAdapt$i32$u8$i32($.mkNamingAdapt$mStdEnumAdapt$i32$u8$pi8$i32$b$b($.mkEnumAdaptT(P(this, "eType"), $oat(PlayerTypes, 0)), S("Type"), 1 /*C4PT_User*/));
    if (pComp.isDeserializer()) {
      if (this.eType !== 2) {
        this.dwFlags = (this.dwFlags & 0xffffbfff) >>> 0;
      }
    }
    pComp.Value$StdNamingDefaultAdapt$u32$u32($.mkNamingAdapt$ru32$pi8$u32$b$b(P(this, "dwColor"), S("Color"), 0));
    pComp.Value$StdNamingDefaultAdapt$u32$u32($.mkNamingAdapt$ru32$pi8$u32$b$b(P(this, "dwOriginalColor"), S("OriginalColor"), this.dwColor));
    pComp.Value$StdNamingDefaultAdapt$StdIntPackAdapt$i32$i32$2($.mkNamingAdapt$mStdIntPackAdapt$i32$pi8$i32$b$b$2($.mkIntPackAdapt$ri32(P(this, "idSavegamePlayer")), S("SavgamePlayer"), 0));
    pComp.Value$StdNamingDefaultAdapt$StdIntPackAdapt$i32$i32$2($.mkNamingAdapt$mStdIntPackAdapt$i32$pi8$i32$b$b$2($.mkIntPackAdapt$ri32(P(this, "idTeam")), S("Team"), 0));
    pComp.Value$StdNamingDefaultAdapt$StdCopyStrBuf$x($.mkNamingAdapt$rStdCopyStrBuf$pi8$x$b$b(this.szAuthID, S("AUID"), S("")));
    if ((this.dwFlags & 1) >>> 0 !== 0) {
      pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "iInGameNumber"), S("GameNumber"), -1));
      pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "iInGameJoinFrame"), S("GameJoinFrame"), -1));
    } else {
      this.iInGameNumber = this.iInGameJoinFrame = -1;
    }
    if ((this.dwFlags & 4) >>> 0 !== 0) {
      pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "iInGamePartFrame"), S("GamePartFrame"), -1));
    } else {
      this.iInGamePartFrame = -1;
    }
    pComp.Value$StdNamingDefaultAdapt$C4ID$C4ID($.mkNamingAdapt$rC4ID$pi8$C4ID$b$b(this.idExtraData, S("ExtraData"), $.C4ID.None));
    pComp.Value$StdNamingDefaultAdapt$ValidatedStdCopyStrBuf$3$x($.mkNamingAdapt$rValidatedStdCopyStrBuf$3$pi8$x$b$b(this.sLeagueAccount, S("LeagueAccount"), S("")));
    pComp.Value$StdNamingDefaultAdapt$StdIntPackAdapt$i32$i32$2($.mkNamingAdapt$mStdIntPackAdapt$i32$pi8$i32$b$b$2($.mkIntPackAdapt$ri32(P(this, "iLeagueScore")), S("LeagueScore"), 0));
    pComp.Value$StdNamingDefaultAdapt$StdIntPackAdapt$i32$i32$2($.mkNamingAdapt$mStdIntPackAdapt$i32$pi8$i32$b$b$2($.mkIntPackAdapt$ri32(P(this, "iLeagueRank")), S("LeagueRank"), 0));
    pComp.Value$StdNamingDefaultAdapt$StdIntPackAdapt$i32$i32$2($.mkNamingAdapt$mStdIntPackAdapt$i32$pi8$i32$b$b$2($.mkIntPackAdapt$ri32(P(this, "iLeagueRankSymbol")), S("LeagueRankSymbol"), 0));
    pComp.Value$StdNamingDefaultAdapt$StdIntPackAdapt$i32$i32$2($.mkNamingAdapt$mStdIntPackAdapt$i32$pi8$i32$b$b$2($.mkIntPackAdapt$ri32(P(this, "iLeagueProjectedGain")), S("ProjectedGain"), -1));
    pComp.Value$StdNamingDefaultAdapt$StdParameterAdapt$ValidatedStdCopyStrBuf$3$i32$x($.mkNamingAdapt$mStdParameterAdapt$ValidatedStdCopyStrBuf$3$i32$pi8$x$b$b($.mkParAdapt$rValidatedStdCopyStrBuf$3$mi32(this.sClanTag, 1 /*RCT_All*/), S("ClanTag"), S("")));
    pComp.Value$StdNamingDefaultAdapt$StdIntPackAdapt$i32$i32$2($.mkNamingAdapt$mStdIntPackAdapt$i32$pi8$i32$b$b$2($.mkIntPackAdapt$ri32(P(this, "iLeaguePerformance")), S("LeaguePerformance"), 0));
    pComp.Value$StdNamingDefaultAdapt$StdCopyStrBuf$x($.mkNamingAdapt$rStdCopyStrBuf$pi8$x$b$b(this.sLeagueProgressData, S("LeagueProgressData"), S("")));
    if (pComp.isDeserializer() && $.Game.C4S.Head.Replay) {
      this.dwFlags = (this.dwFlags & 0xfffffff7) >>> 0;
    }
    if ((this.dwFlags & 8) >>> 0 !== 0) {
      if (pComp.isSerializer() && this.pRes.op_C4Network2Res_() != null) {
        this.ResCore.$assign(this.pRes.op_arrow().getCore());
      }
      pComp.Value$StdNamingAdapt$C4Network2ResCore($.mkNamingAdapt$rC4Network2ResCore$pi8(this.ResCore, S("ResCore")));
    }
  }

  GetType() {
    return this.eType;
  }

  GetColor() {
    return this.dwColor;
  }

  GetLobbyColor() {
    if ($.Game.Teams.GetTeamDist() === 4) {
      if ($.Game.Teams.IsTeamColors()) {
        if ($.Game.Teams.GetTeamByID(this.GetTeam()) != null) {
          if (!this.HasJoined() && !(this.GetAssociatedSavegamePlayerID() !== 0)) {
            return this.GetOriginalColor();
          }
        }
      }
    }
    return this.GetColor();
  }

  GetOriginalColor() {
    return this.dwOriginalColor;
  }

  GetAlternateColor() {
    return this.dwAlternateColor;
  }

  GetName() {
    return this.sLeagueAccount.getLength() !== 0 ? this.sLeagueAccount.getData() : this.sForcedName.getLength() !== 0 ? this.sForcedName.getData() : this.sName.getData();
  }

  GetOriginalName() {
    return this.sName.getData();
  }

  GetForcedName() {
    return this.sForcedName.getData();
  }

  GetLobbyName() {
    let sResult = new $.StdStrBuf();
    if (this.sLeagueAccount.getLength() !== 0) {
      if (this.sClanTag.getLength() !== 0) {
        sResult.Format(S("<c afafaf>%s</c> %s"), this.sClanTag.getData(), this.sLeagueAccount.getData());
      } else {
        sResult.Ref$StdStrBuf(this.sLeagueAccount);
      }
    } else {
      sResult.Ref$StdStrBuf(this.sForcedName.getLength() !== 0 ? this.sForcedName : this.sName);
    }
    return sResult;
  }

  GetFilename() {
    return this.szFilename.getData();
  }

  GetLocalJoinFilename() {
    if (this.pRes.op_C4Network2Res_() != null) {
      return this.pRes.op_arrow().getFile();
    }
    return this.szFilename.getData();
  }

  GetRes() {
    return this.pRes.op_C4Network2Res_();
  }

  IsRemoved() {
    return !!((this.dwFlags & 4) >>> 0 !== 0);
  }

  HasJoined() {
    return !!((this.dwFlags & 1) >>> 0 !== 0);
  }

  IsJoined() {
    return this.HasJoined() && !((this.dwFlags & 4) >>> 0 !== 0);
  }

  HasJoinIssued() {
    return !!((this.dwFlags & 17) >>> 0 !== 0);
  }

  HasJoinPending() {
    return !((this.dwFlags & 5) >>> 0 !== 0);
  }

  IsUsingColor() {
    return !this.IsRemoved() && this.idSavegamePlayer === 0;
  }

  IsUsingName() {
    return !this.IsRemoved() && !(this.sLeagueAccount.getLength() !== 0);
  }

  IsUsingAttribute(eAttr) {
    if (eAttr === 0) {
      return this.IsUsingColor();
    } else {
      return this.IsUsingName();
    }
  }

  IsUsingPlayerFile() {
    return !this.IsRemoved();
  }

  IsUsingTeam() {
    return !this.IsRemoved();
  }

  IsAttributesFixed() {
    return !!((this.dwFlags & 2048) >>> 0 !== 0);
  }

  IsInvisible() {
    return !!((this.dwFlags & 16384) >>> 0 !== 0);
  }

  IsScenarioInitDesired() {
    return !((this.dwFlags & 4096) >>> 0 !== 0);
  }

  IsScenarioSaveDesired() {
    return !((this.dwFlags & 32768) >>> 0 !== 0);
  }

  GetScriptPlayerExtraID() {
    return this.idExtraData.$clone();
  }

  IsNoEliminationCheck() {
    return !!((this.dwFlags & 8192) >>> 0 !== 0);
  }

  HasAutoGeneratedColor() {
    return this.dwColor !== this.dwOriginalColor;
  }

  HasWon() {
    return !!((this.dwFlags & 512) >>> 0 !== 0);
  }

  HasTeamWon() {
    let pTeam = null;
    if (this.idTeam !== 0 && (pTeam = $.Game.Teams.GetTeamByID(this.idTeam)) != null) {
      return pTeam.HasWon();
    } else {
      return this.HasWon();
    }
  }

  getAuthID() {
    return this.szAuthID.getData();
  }

  getLeagueAccount() {
    return this.sLeagueAccount.getData();
  }

  getLeagueScore() {
    return this.iLeagueScore;
  }

  getLeagueRank() {
    return this.iLeagueRank;
  }

  getLeagueRankSymbol() {
    return this.iLeagueRankSymbol;
  }

  getLeagueScoreProjected() {
    return this.iLeagueScoreProjected;
  }

  GetInGameNumber() {
    return this.iInGameNumber;
  }

  IsLeagueProjectedGainValid() {
    return this.iLeagueProjectedGain >= 0;
  }

  GetLeagueProjectedGain() {
    return this.iLeagueProjectedGain;
  }

  GetLeagueProgressData() {
    return this.sLeagueProgressData.getData();
  }

  GetID() {
    return this.iID;
  }

  GetTeam() {
    return this.idTeam;
  }

  IsTempFile() {
    return !!((this.dwFlags & 32) >>> 0 !== 0);
  }

  GetFlags() {
    return this.dwFlags;
  }

  SetDisconnected() {
    this.dwFlags = (this.dwFlags | 256) >>> 0;
  }

  SetWinner() {
    this.dwFlags = (this.dwFlags | 512) >>> 0;
  }

  LoadBigIcon(fctTarget) {
    let fSuccess = false;
    let Plr = new $.C4Group().init();
    let pRes = null;
    let fIncompleteRes = false;
    if ((pRes = this.GetRes()) != null) {
      if (!pRes.isComplete()) {
        fIncompleteRes = true;
      }
    }
    const iBigIconSize = [0];
    if (!fIncompleteRes) {
      if (Plr.Open(pRes != null ? pRes.getFile() : this.GetFilename())) {
        if (Plr.AccessEntry(S("BigIcon.png"), P(iBigIconSize, 0))) {
          if (iBigIconSize[0] <= 20480) {
            if (fctTarget.Load(Plr, S("BigIcon.png"), -1, -1, false, 0)) {
              fSuccess = true;
            }
          }
        }
      }
    }
    return fSuccess;
  }

  $clone() { return new C4PlayerInfo().$assign(this); }
  $assign(o) {
    this.dwFlags = o.dwFlags;
    this.eType = o.eType;
    this.sName.$assign(o.sName);
    this.sForcedName.$assign(o.sForcedName);
    this.iID = o.iID;
    this.pRes.$assign(o.pRes);
    this.ResCore.$assign(o.ResCore);
    this.szFilename.$assign(o.szFilename);
    this.dwColor = o.dwColor;
    this.dwOriginalColor = o.dwOriginalColor;
    this.dwAlternateColor = o.dwAlternateColor;
    this.idSavegamePlayer = o.idSavegamePlayer;
    this.idTeam = o.idTeam;
    this.szAuthID.$assign(o.szAuthID);
    this.iInGameNumber = o.iInGameNumber;
    this.iInGameJoinFrame = o.iInGameJoinFrame;
    this.iInGamePartFrame = o.iInGamePartFrame;
    this.idExtraData.$assign(o.idExtraData);
    this.sLeagueAccount.$assign(o.sLeagueAccount);
    this.iLeagueScore = o.iLeagueScore;
    this.iLeagueRank = o.iLeagueRank;
    this.iLeagueRankSymbol = o.iLeagueRankSymbol;
    this.iLeagueScoreProjected = o.iLeagueScoreProjected;
    this.iLeagueProjectedGain = o.iLeagueProjectedGain;
    this.sClanTag.$assign(o.sClanTag);
    this.iLeaguePerformance = o.iLeaguePerformance;
    this.sLeagueProgressData.$assign(o.sLeagueProgressData);
    return this;
  }
}

export class C4ClientPlayerInfos {
  iPlayerCount = 0;
  iPlayerCapacity = 0;
  ppPlayers = null;
  iClientID = -1;
  dwFlags = 0;

  GrowList(iByVal) {
    let ppNewInfo = P(new Array($u64n(this.iPlayerCapacity = $u64n(this.iPlayerCapacity) + iByVal | 0)).fill(null), 0);
    if (this.ppPlayers != null) {
      c$memcpy(ppNewInfo, this.ppPlayers, $u64n(this.iPlayerCount) * 8);
      $delete(this.ppPlayers);
    }
    this.ppPlayers = ppNewInfo;
  }

  init(szJoinFilenames = null, fAdd = false, pAddInfo = null) {
    this.iPlayerCount = 0;
    this.iPlayerCapacity = 0;
    this.ppPlayers = null;
    this.iClientID = -1;
    this.dwFlags = 0;
    let $t1, $t2;
    if (szJoinFilenames != null || pAddInfo != null) {
      if ($.SSearch($.Config.GetRegistrationData(S("Type")), S("Developer")) != null) {
        this.dwFlags = (this.dwFlags | 8) >>> 0;
      }
      this.iClientID = $.Control$2.ClientID();
      if (!$.Control$2.isNetwork() && this.iClientID < 0) {
        this.iClientID = 0;
      }
      if (fAdd) {
        this.dwFlags = (this.dwFlags | 1) >>> 0;
      } else {
        this.dwFlags = (this.dwFlags | 4) >>> 0;
      }
      if ((this.iPlayerCapacity = (szJoinFilenames != null ? $.SModuleCount(szJoinFilenames) : 0) + (!(pAddInfo == null) ? 1 : 0) | 0) !== 0) {
        this.ppPlayers = P(new Array($u64n(this.iPlayerCapacity)).fill(null), 0);
        if (szJoinFilenames != null) {
          const szPlrFile = new Int8Array(4097);
          for (let i = 0; i < this.iPlayerCapacity; i = i + 1 | 0) {
            if ($.SGetModule(szJoinFilenames, i, P(szPlrFile, 0), 4096)) {
              let pNewInfo = new C4PlayerInfo().init();
              if (pNewInfo.LoadFromLocalFile(P(szPlrFile, 0))) {
                this.ppPlayers.a[this.ppPlayers.o + ($t1 = this.iPlayerCount, this.iPlayerCount = this.iPlayerCount + 1 | 0, $t1)] = pNewInfo;
              } else {
                $delete(pNewInfo);
                $.Log($.FormatString($.LoadResStr(S("IDS_ERR_LOAD_PLAYER")), P(szPlrFile, 0)).getData());
              }
            }
          }
        }
        if (pAddInfo != null) {
          this.ppPlayers.a[this.ppPlayers.o + ($t2 = this.iPlayerCount, this.iPlayerCount = this.iPlayerCount + 1 | 0, $t2)] = pAddInfo;
        }
      }
    }
    return this;
  }

  $dtor() {
    C4ClientPlayerInfos.prototype.Clear.call(this);
  }

  Clear() {
    let $t1, $t2;
    let i = this.iPlayerCount;
    let ppCurrPlrInfo = this.ppPlayers;
    while (($t1 = i, i = i - 1 | 0, $t1) !== 0) {
      $delete($rd(($t2 = ppCurrPlrInfo, ppCurrPlrInfo = ppCurrPlrInfo.add(1), $t2)));
    }
    $delete(this.ppPlayers);
    this.ppPlayers = null;
    this.iPlayerCount = this.iPlayerCapacity = 0;
    this.iClientID = -1;
    this.dwFlags = 0;
  }

  GrabMergeFrom(rFrom) {
    if (rFrom.iPlayerCount === 0) {
      return;
    }
    if (this.iPlayerCount !== 0) {
      if ((this.iPlayerCount + rFrom.iPlayerCount | 0) > this.iPlayerCapacity) {
        this.GrowList($u64n(rFrom.iPlayerCount));
      }
      c$memcpy($padd(this.ppPlayers, this.iPlayerCount), rFrom.ppPlayers, $u64n(rFrom.iPlayerCount) * 8);
      this.iPlayerCount = this.iPlayerCount + rFrom.iPlayerCount | 0;
      rFrom.iPlayerCount = rFrom.iPlayerCapacity = 0;
      $delete(rFrom.ppPlayers);
      rFrom.ppPlayers = null;
    } else {
      if (this.ppPlayers != null) {
        $delete(this.ppPlayers);
      }
      this.ppPlayers = rFrom.ppPlayers;
      rFrom.ppPlayers = null;
      this.iPlayerCount = rFrom.iPlayerCount;
      rFrom.iPlayerCount = 0;
      this.iPlayerCapacity = rFrom.iPlayerCapacity;
      rFrom.iPlayerCapacity = 0;
    }
  }

  AddInfo(pAddInfo) {
    let $t1;
    if (this.iPlayerCount === this.iPlayerCapacity) {
      this.GrowList(4);
    }
    this.ppPlayers.a[this.ppPlayers.o + ($t1 = this.iPlayerCount, this.iPlayerCount = this.iPlayerCount + 1 | 0, $t1)] = pAddInfo;
  }

  RemoveIndexedInfo(iAtIndex) {
    if (iAtIndex < 0 || iAtIndex >= this.iPlayerCount) {
      return;
    }
    $delete(this.ppPlayers.a[this.ppPlayers.o + iAtIndex]);
    this.ppPlayers.a[this.ppPlayers.o + iAtIndex] = this.ppPlayers.a[this.ppPlayers.o + (this.iPlayerCount = this.iPlayerCount - 1 | 0)];
  }

  RemoveInfo(idPlr) {
    let i = 0;
    let ppCurrPlrInfo = this.ppPlayers;
    while (i < this.iPlayerCount) {
      if (ppCurrPlrInfo.a[ppCurrPlrInfo.o].GetID() === idPlr) {
        this.RemoveIndexedInfo(i);
        return;
      }
      ppCurrPlrInfo = ppCurrPlrInfo.add(1);
      i = i + 1 | 0;
    }
    return;
  }

  SetUpdated() {
    this.dwFlags = (this.dwFlags | 2) >>> 0;
  }

  IsUpdated() {
    return !!((this.dwFlags & 2) >>> 0 !== 0);
  }

  ResetUpdated() {
    this.dwFlags = (this.dwFlags & 0xfffffffd) >>> 0;
  }

  SetAdd() {
    this.dwFlags = (this.dwFlags | 1) >>> 0;
  }

  ResetAdd() {
    this.dwFlags = (this.dwFlags & 0xfffffffe) >>> 0;
  }

  GetPlayerCount() {
    return this.iPlayerCount;
  }

  GetFlaggedPlayerCount(dwFlag) {
    let $t1, $t2;
    let iCount = 0;
    let i = this.iPlayerCount;
    let ppCurrPlrInfo = this.ppPlayers;
    while (($t1 = i, i = i - 1 | 0, $t1) !== 0) {
      if (($rd(($t2 = ppCurrPlrInfo, ppCurrPlrInfo = ppCurrPlrInfo.add(1), $t2)).GetFlags() | dwFlag) >>> 0 !== 0) {
        iCount = iCount + 1 | 0;
      }
    }
    return iCount;
  }

  GetPlayerInfo$i32(iIndex) {
    if (iIndex < 0 || iIndex >= this.iPlayerCount) {
      return null;
    }
    return this.ppPlayers.a[this.ppPlayers.o + iIndex];
  }

  GetPlayerInfo$i32$i32(iIndex, eType) {
    let $t1;
    for (let iCheck = 0; iCheck < this.iPlayerCount; iCheck = iCheck + 1 | 0) {
      let pNfo = this.ppPlayers.a[this.ppPlayers.o + iCheck];
      if (pNfo.GetType() === eType) {
        if (!(($t1 = iIndex, iIndex = iIndex - 1 | 0, $t1) !== 0)) {
          return pNfo;
        }
      }
    }
    return null;
  }

  GetPlayerInfoByID(id) {
    let $t1;
    let i = this.iPlayerCount;
    let ppCurrPlrInfo = this.ppPlayers;
    while (($t1 = i, i = i - 1 | 0, $t1) !== 0) {
      if (ppCurrPlrInfo.a[ppCurrPlrInfo.o].GetID() === id) {
        return ppCurrPlrInfo.a[ppCurrPlrInfo.o];
      }
      ppCurrPlrInfo = ppCurrPlrInfo.add(1);
    }
    return null;
  }

  GetPlayerInfoByRes(idResID) {
    let $t1;
    let i = this.iPlayerCount;
    let ppCurrPlrInfo = this.ppPlayers;
    let pRes = null;
    while (($t1 = i, i = i - 1 | 0, $t1) !== 0) {
      if ((pRes = ppCurrPlrInfo.a[ppCurrPlrInfo.o].GetRes()) != null) {
        if (pRes.getResID() === idResID) {
          if (ppCurrPlrInfo.a[ppCurrPlrInfo.o].IsUsingPlayerFile()) {
            return ppCurrPlrInfo.a[ppCurrPlrInfo.o];
          }
        }
      }
      ppCurrPlrInfo = ppCurrPlrInfo.add(1);
    }
    return null;
  }

  GetClientID() {
    return this.iClientID;
  }

  HasUnjoinedPlayers() {
    let $t1, $t2;
    let i = this.iPlayerCount;
    let ppCurrPlrInfo = this.ppPlayers;
    while (($t1 = i, i = i - 1 | 0, $t1) !== 0) {
      if (!$rd(($t2 = ppCurrPlrInfo, ppCurrPlrInfo = ppCurrPlrInfo.add(1), $t2)).HasJoined()) {
        return true;
      }
    }
    return false;
  }

  GetJoinedPlayerCount() {
    let $t1, $t2;
    let i = this.iPlayerCount;
    let cnt = 0;
    let ppCurrPlrInfo = this.ppPlayers;
    while (($t1 = i, i = i - 1 | 0, $t1) !== 0) {
      if ($rd(($t2 = ppCurrPlrInfo, ppCurrPlrInfo = ppCurrPlrInfo.add(1), $t2)).IsJoined()) {
        cnt = cnt + 1 | 0;
      }
    }
    return cnt;
  }

  IsAddPacket() {
    return !!((this.dwFlags & 1) >>> 0 !== 0);
  }

  IsInitialPacket() {
    return !!((this.dwFlags & 4) >>> 0 !== 0);
  }

  IsDeveloperPacket() {
    return !!((this.dwFlags & 8) >>> 0 !== 0);
  }

  LoadResources() {
    let $t1, $t2;
    let i = this.iPlayerCount;
    let ppCurrPlrInfo = this.ppPlayers;
    while (($t1 = i, i = i - 1 | 0, $t1) !== 0) {
      $rd(($t2 = ppCurrPlrInfo, ppCurrPlrInfo = ppCurrPlrInfo.add(1), $t2)).LoadResource();
    }
  }

  CompileFunc(pComp) {
    let deserializing = pComp.isDeserializer();
    if (deserializing) {
      this.Clear();
    }
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "iClientID"), S("ID"), $.C4ClientIDUnknown$C4Client));
    const Entries = $own([
  ((($o) => ($o.Name = S("AddPlayers"), $o.Val = 1, $o))(new $.StdBitfieldEntry$u32())),
  ((($o) => ($o.Name = S("Updated"), $o.Val = 2, $o))(new $.StdBitfieldEntry$u32())),
  ((($o) => ($o.Name = S("Initial"), $o.Val = 4, $o))(new $.StdBitfieldEntry$u32())),
  ((($o) => ($o.Name = S("Developer"), $o.Val = 8, $o))(new $.StdBitfieldEntry$u32())),
  ((($o) => ($o.Name = null, $o.Val = 0, $o))(new $.StdBitfieldEntry$u32())),
]);
    pComp.Value$StdNamingDefaultAdapt$StdBitfieldAdapt$u32$u32($.mkNamingAdapt$mStdBitfieldAdapt$u32$pi8$u32$b$b($.mkBitfieldAdapt$ru32$pStdBitfieldEntry(P(this, "dwFlags"), $oat(Entries, 0)), S("Flags"), 0));
    pComp.Value$StdNamingCountAdapt$i32($.mkNamingCountAdapt$ri32$pi8(P(this, "iPlayerCount"), S("Player")));
    if (this.iPlayerCount < 0 || this.iPlayerCount > 5000) {
      pComp.excCorrupt(S("player count out of range"));
      return;
    }
    if (deserializing && this.iPlayerCount > this.iPlayerCapacity) {
      this.GrowList($u64n(this.iPlayerCount - this.iPlayerCapacity | 0));
      $.ZeroMem$ppC4PlayerInfo$u64(this.ppPlayers, 8 * $u64n(this.iPlayerCount));
    }
    pComp.Value$StdNamingAdapt$StdArrayAdapt$pC4PlayerInfo$StdPtrAdapt$C4PlayerInfo($.mkNamingAdapt$mStdArrayAdapt$pC4PlayerInfo$StdPtrAdapt$C4PlayerInfo$pi8($.mkArrayAdaptMap$ppC4PlayerInfo$i32$x(this.ppPlayers, this.iPlayerCount, $.mkPtrAdaptNoNull$rpC4PlayerInfo), S("Player")));
    $.mkPtrAdaptNoNull$rpC4PlayerInfo(this.ppPlayers);
  }

  $copy(rCopy) {
    this.iPlayerCount = 0;
    this.iPlayerCapacity = 0;
    this.ppPlayers = null;
    this.iClientID = -1;
    this.dwFlags = 0;
    let $t1, $t2, $t3;
    this.iClientID = rCopy.iClientID;
    if ((this.iPlayerCount = rCopy.iPlayerCount) !== 0) {
      this.ppPlayers = P(new Array($u64n(this.iPlayerCapacity = rCopy.iPlayerCapacity)).fill(null), 0);
      let i = this.iPlayerCount;
      let ppCurrPlrInfo = this.ppPlayers;
      let ppSrcPlrInfo = rCopy.ppPlayers;
      while (($t1 = i, i = i - 1 | 0, $t1) !== 0) {
        $wr(($t2 = ppCurrPlrInfo, ppCurrPlrInfo = ppCurrPlrInfo.add(1), $t2), 0, $rd(($t3 = ppSrcPlrInfo, ppSrcPlrInfo = ppSrcPlrInfo.add(1), $t3)).$clone());
      }
    } else {
      this.ppPlayers = null;
      this.iPlayerCapacity = 0;
    }
    this.dwFlags = rCopy.dwFlags;
    return this;
  }
  $clone() { return new C4ClientPlayerInfos().$copy(this); }
  $assign(rCopy) {
    let $t1, $t2, $t3;
    this.Clear();
    this.iClientID = rCopy.iClientID;
    if ((this.iPlayerCount = rCopy.iPlayerCount) !== 0) {
      this.ppPlayers = P(new Array($u64n(this.iPlayerCapacity = rCopy.iPlayerCapacity)).fill(null), 0);
      let i = this.iPlayerCount;
      let ppCurrPlrInfo = this.ppPlayers;
      let ppSrcPlrInfo = rCopy.ppPlayers;
      while (($t1 = i, i = i - 1 | 0, $t1) !== 0) {
        $wr(($t2 = ppCurrPlrInfo, ppCurrPlrInfo = ppCurrPlrInfo.add(1), $t2), 0, $rd(($t3 = ppSrcPlrInfo, ppSrcPlrInfo = ppSrcPlrInfo.add(1), $t3)).$clone());
      }
    } else {
      this.ppPlayers = null;
      this.iPlayerCapacity = 0;
    }
    this.dwFlags = rCopy.dwFlags;
    return this;
  }
}

export class C4PlayerInfoList {
  iClientCount = 0;
  iClientCapacity = 0;
  ppClients = null;
  iLastPlayerID = 0;

  GrowList(iByVal) {
    let ppNewInfo = P(new Array($u64n(this.iClientCapacity = $u64n(this.iClientCapacity) + iByVal | 0)).fill(null), 0);
    if (this.ppClients != null) {
      c$memcpy(ppNewInfo, this.ppClients, $u64n(this.iClientCount) * 8);
      $delete(this.ppClients);
    }
    this.ppClients = ppNewInfo;
  }

  $dtor() {
    C4PlayerInfoList.prototype.Clear.call(this);
  }

  Clear() {
    let $t1, $t2;
    let ppInfo = this.ppClients;
    let i = this.iClientCount;
    while (($t1 = i, i = i - 1 | 0, $t1) !== 0) {
      $delete($rd(($t2 = ppInfo, ppInfo = ppInfo.add(1), $t2)));
    }
    $delete(this.ppClients);
    this.ppClients = null;
    this.iClientCount = this.iClientCapacity = 0;
    this.iLastPlayerID = 0;
  }

  DoPlayerInfoUpdate(pUpdate) {
    if (!$.Control$2.isCtrlHost()) {
      return false;
    }
    let fSucc = true;
    if ($.Control$2.isNetwork()) {
      $.Network.Players.RequestPlayerInfoUpdate(pUpdate);
    } else {
      fSucc = this.DoLocalNonNetworkPlayerInfoUpdate(pUpdate);
    }
    return fSucc;
  }

  DoLocalNonNetworkPlayerJoin(szPlayerFile) {
    let pNewJoin = new C4ClientPlayerInfos().init(szPlayerFile, true);
    let fSuccess = this.DoLocalNonNetworkPlayerInfoUpdate(pNewJoin);
    $delete(pNewJoin);
    return fSuccess;
  }

  DoLocalNonNetworkPlayerInfoUpdate(pUpdate) {
    if (!this.AssignPlayerIDs(pUpdate)) {
      return false;
    }
    this.AssignTeams(pUpdate, true);
    this.UpdatePlayerAttributes$pC4ClientPlayerInfos$b(pUpdate, true);
    $.Control$2.DoInput(144 /*CID_PlrInfo*/, new $.C4ControlPlayerInfo().init$C4ClientPlayerInfos(pUpdate), $.Game.IsRunning ? 0 /*CDT_Queue*/ : 2 /*CDT_Direct*/);
    return true;
  }

  AssignPlayerIDs(pNewClientInfo) {
    let $t1;
    let pPlrInfo = null;
    let i = 0;
    while ((pPlrInfo = pNewClientInfo.GetPlayerInfo$i32(($t1 = i, i = i + 1 | 0, $t1))) != null) {
      if (!(pPlrInfo.GetID() !== 0)) {
        if (this.GetFreePlayerSlotCount() < 1) {
          $.Log($.FormatString($.LoadResStr(S("IDS_MSG_TOOMANYPLAYERS")), $.Game.Parameters.MaxPlayers).getData());
          pNewClientInfo.RemoveIndexedInfo((i = i - 1 | 0));
          continue;
        }
        pPlrInfo.SetID((this.iLastPlayerID = this.iLastPlayerID + 1 | 0));
      }
    }
    return !!(pNewClientInfo.GetPlayerCount() !== 0);
  }

  AssignTeams(pNewClientInfo, fByHost) {
    let $t1;
    if (!$.Game.Teams.IsMultiTeams()) {
      return;
    }
    let pPlrInfo = null;
    let i = 0;
    while ((pPlrInfo = pNewClientInfo.GetPlayerInfo$i32(($t1 = i, i = i + 1 | 0, $t1))) != null) {
      $.Game.Teams.RecheckPlayerInfoTeams(pPlrInfo, fByHost);
    }
  }

  RecheckAutoGeneratedTeams() {
    let $t1, $t2;
    let pPlrInfos = null;
    let j = 0;
    while ((pPlrInfos = this.GetIndexedInfo(($t1 = j, j = j + 1 | 0, $t1))) != null) {
      let pPlrInfo = null;
      let i = 0;
      while ((pPlrInfo = pPlrInfos.GetPlayerInfo$i32(($t2 = i, i = i + 1 | 0, $t2))) != null) {
        let idTeam = pPlrInfo.GetTeam();
        if (idTeam !== 0) {
          $.Game.Teams.GetGenerateTeamByID(idTeam);
        }
      }
    }
  }

  AddInfo(pNewClientInfo) {
    let $t1, $t2;
    0;
    if ($.Network.isHost() || !$.Network.isEnabled()) {
      if (!this.AssignPlayerIDs(pNewClientInfo) && pNewClientInfo.IsAddPacket()) {
        $delete(pNewClientInfo);
        return null;
      }
    }
    let pInfo = null;
    let i = 0;
    while ((pInfo = pNewClientInfo.GetPlayerInfo$i32(($t1 = i, i = i + 1 | 0, $t1))) != null) {
      let idTeam = pInfo.GetTeam();
      if (idTeam !== 0) {
        $.Game.Teams.GetGenerateTeamByID(idTeam);
      }
    }
    let ppExistingInfo = this.GetInfoPtrByClientID(pNewClientInfo.GetClientID());
    if (ppExistingInfo != null) {
      if (pNewClientInfo.IsAddPacket()) {
        ppExistingInfo.a[ppExistingInfo.o].GrabMergeFrom(pNewClientInfo);
        $delete(pNewClientInfo);
        return pNewClientInfo = ppExistingInfo.a[ppExistingInfo.o];
      }
      $delete(ppExistingInfo.a[ppExistingInfo.o]);
      return ppExistingInfo.a[ppExistingInfo.o] = pNewClientInfo;
    }
    pNewClientInfo.ResetAdd();
    if (this.iClientCount >= this.iClientCapacity) {
      this.GrowList(4);
    }
    this.ppClients.a[this.ppClients.o + ($t2 = this.iClientCount, this.iClientCount = this.iClientCount + 1 | 0, $t2)] = pNewClientInfo;
    return pNewClientInfo;
  }

  ResolvePlayerAttributeConflicts(pSecPacket) {
    let r = new $.C4PlayerInfoListAttributeConflictResolver().init(this, $.Game.RestorePlayerInfos, pSecPacket);
    r.Resolve();
  }

  UpdatePlayerAttributes$pC4ClientPlayerInfos$b(pForInfo, fResolveConflicts) {
    let $t1;
    0;
    let pInfo = null;
    let pInfo2 = null;
    let i = 0;
    while ((pInfo = pForInfo.GetPlayerInfo$i32(($t1 = i, i = i + 1 | 0, $t1))) != null) {
      if (!pInfo.HasJoined()) {
        let idSavegameID = 0;
        let fHasForcedColor = false;
        let dwForceClr = 0;
        if ((idSavegameID = pInfo.GetAssociatedSavegamePlayerID()) !== 0) {
          if ((pInfo2 = $.Game.RestorePlayerInfos.GetPlayerInfoByID$i32(idSavegameID)) != null) {
            dwForceClr = pInfo2.GetColor();
            fHasForcedColor = true;
          }
        }
        if (!fHasForcedColor && $.Game.Teams.IsTeamColors()) {
          let pPlrTeam = $.Game.Teams.GetTeamByID(pInfo.GetTeam());
          if (pPlrTeam != null) {
            dwForceClr = pPlrTeam.GetColor();
            fHasForcedColor = true;
          }
        }
        if (fHasForcedColor && dwForceClr !== pInfo.GetColor()) {
          pInfo.SetColor(dwForceClr);
          pForInfo.SetUpdated();
        }
        if ((pInfo.GetColor() & 0xff000000) >>> 0 !== 0xff000000) {
          pInfo.SetColor((pInfo.GetColor() | 0xff000000) >>> 0);
          pForInfo.SetUpdated();
        }
      }
    }
    if (fResolveConflicts) {
      this.ResolvePlayerAttributeConflicts(pForInfo);
    }
  }

  UpdatePlayerAttributes$v() {
    let $t1;
    let iIdx = 0;
    let pForInfo = null;
    while ((pForInfo = this.GetIndexedInfo(($t1 = iIdx, iIdx = iIdx + 1 | 0, $t1))) != null) {
      this.UpdatePlayerAttributes$pC4ClientPlayerInfos$b(pForInfo, false);
    }
    this.ResolvePlayerAttributeConflicts(null);
  }

  GetInfoCount() {
    return this.iClientCount;
  }

  GetIndexedInfo(iIndex) {
    return this.ppClients != null && $.Inside$i32$i32$i32$3(iIndex, 0, this.iClientCount - 1 | 0) ? this.ppClients.a[this.ppClients.o + iIndex] : null;
  }

  GetInfoPtrByClientID(iClientID) {
    for (let i = 0; i < this.iClientCount; i = i + 1 | 0) {
      if (this.ppClients.a[this.ppClients.o + i].GetClientID() === iClientID) {
        return $padd(this.ppClients, i);
      }
    }
    return null;
  }

  GetInfoByClientID(iClientID) {
    let ppNfo = this.GetInfoPtrByClientID(iClientID);
    return ppNfo != null ? ppNfo.a[ppNfo.o] : null;
  }

  GetPlayerInfoByIndex(index) {
    let $t1, $t2;
    for (let i = 0; i < this.iClientCount; i = i + 1 | 0) {
      let j = 0;
      let pInfo = null;
      while ((pInfo = this.ppClients.a[this.ppClients.o + i].GetPlayerInfo$i32(($t1 = j, j = j + 1 | 0, $t1))) != null) {
        if (($t2 = index, index = index - 1 | 0, $t2) <= 0) {
          return pInfo;
        }
      }
    }
    return null;
  }

  GetPlayerInfoByID$i32(id) {
    let $t1;
    0;
    for (let i = 0; i < this.iClientCount; i = i + 1 | 0) {
      let j = 0;
      let pInfo = null;
      while ((pInfo = this.ppClients.a[this.ppClients.o + i].GetPlayerInfo$i32(($t1 = j, j = j + 1 | 0, $t1))) != null) {
        if (pInfo.GetID() === id) {
          return pInfo;
        }
      }
    }
    return null;
  }

  GetPlayerInfoByID$i32$pi32(id, pidClient) {
    let $t1;
    0;
    0;
    for (let i = 0; i < this.iClientCount; i = i + 1 | 0) {
      let j = 0;
      let pInfo = null;
      while ((pInfo = this.ppClients.a[this.ppClients.o + i].GetPlayerInfo$i32(($t1 = j, j = j + 1 | 0, $t1))) != null) {
        if (pInfo.GetID() === id) {
          pidClient.a[pidClient.o] = this.ppClients.a[this.ppClients.o + i].GetClientID();
          return pInfo;
        }
      }
    }
    return null;
  }

  GetClientInfoByPlayerID(id) {
    let $t1;
    0;
    for (let i = 0; i < this.iClientCount; i = i + 1 | 0) {
      let j = 0;
      let pInfo = null;
      while ((pInfo = this.ppClients.a[this.ppClients.o + i].GetPlayerInfo$i32(($t1 = j, j = j + 1 | 0, $t1))) != null) {
        if (pInfo.GetID() === id) {
          return this.ppClients.a[this.ppClients.o + i];
        }
      }
    }
    return null;
  }

  GetPlayerInfoBySavegameID(id) {
    let $t1;
    0;
    for (let i = 0; i < this.iClientCount; i = i + 1 | 0) {
      let j = 0;
      let pInfo = null;
      while ((pInfo = this.ppClients.a[this.ppClients.o + i].GetPlayerInfo$i32(($t1 = j, j = j + 1 | 0, $t1))) != null) {
        if (pInfo.GetAssociatedSavegamePlayerID() === id) {
          return pInfo;
        }
      }
    }
    return null;
  }

  GetNextPlayerInfoByID(id) {
    let $t1;
    let pSmallest = null;
    for (let i = 0; i < this.iClientCount; i = i + 1 | 0) {
      let j = 0;
      let pInfo = null;
      while ((pInfo = this.ppClients.a[this.ppClients.o + i].GetPlayerInfo$i32(($t1 = j, j = j + 1 | 0, $t1))) != null) {
        if (pInfo.GetID() > id) {
          if (pSmallest == null || pSmallest.GetID() > pInfo.GetID()) {
            pSmallest = pInfo;
          }
        }
      }
    }
    return pSmallest;
  }

  GetActivePlayerInfoByName(szName) {
    let $t1;
    for (let i = 0; i < this.iClientCount; i = i + 1 | 0) {
      let j = 0;
      let pInfo = null;
      while ((pInfo = this.ppClients.a[this.ppClients.o + i].GetPlayerInfo$i32(($t1 = j, j = j + 1 | 0, $t1))) != null) {
        if (!pInfo.IsRemoved()) {
          if ($.SEqualNoCase(szName, pInfo.GetName())) {
            return pInfo;
          }
        }
      }
    }
    return null;
  }

  GetPlayerCount() {
    let iCount = 0;
    for (let i = 0; i < this.iClientCount; i = i + 1 | 0) {
      iCount = iCount + this.ppClients.a[this.ppClients.o + i].GetPlayerCount() | 0;
    }
    return iCount;
  }

  GetJoinIssuedPlayerCount() {
    let iCount = 0;
    for (let i = 0; i < this.iClientCount; i = i + 1 | 0) {
      let pClient = this.ppClients.a[this.ppClients.o + i];
      for (let j = 0; j < pClient.GetPlayerCount(); j = j + 1 | 0) {
        if (pClient.GetPlayerInfo$i32(j).HasJoinIssued()) {
          iCount = iCount + 1 | 0;
        }
      }
    }
    return iCount;
  }

  GetJoinPendingPlayerCount() {
    let iCount = 0;
    for (let i = 0; i < this.iClientCount; i = i + 1 | 0) {
      let pClient = this.ppClients.a[this.ppClients.o + i];
      for (let j = 0; j < pClient.GetPlayerCount(); j = j + 1 | 0) {
        if (pClient.GetPlayerInfo$i32(j).HasJoinPending()) {
          iCount = iCount + 1 | 0;
        }
      }
    }
    return iCount;
  }

  GetActivePlayerCount(fCountInvisible) {
    let iCount = 0;
    for (let i = 0; i < this.iClientCount; i = i + 1 | 0) {
      let pClient = this.ppClients.a[this.ppClients.o + i];
      for (let j = 0; j < pClient.GetPlayerCount(); j = j + 1 | 0) {
        let pInfo = pClient.GetPlayerInfo$i32(j);
        if (!pInfo.IsRemoved()) {
          if (fCountInvisible || !pInfo.IsInvisible()) {
            iCount = iCount + 1 | 0;
          }
        }
      }
    }
    return iCount;
  }

  GetActivePlayerNames(fCountInvisible, iAtClientID = -1) {
    let $t1;
    let sPlr = new $.StdStrBuf();
    let iCount = 0;
    for (let i = 0; i < this.iClientCount; i = i + 1 | 0) {
      let pClient = this.ppClients.a[this.ppClients.o + i];
      if (iAtClientID !== -1 && pClient.GetClientID() !== iAtClientID) {
        continue;
      }
      for (let j = 0; j < pClient.GetPlayerCount(); j = j + 1 | 0) {
        let pInfo = pClient.GetPlayerInfo$i32(j);
        if (!pInfo.IsRemoved()) {
          if (fCountInvisible || !pInfo.IsInvisible()) {
            if (($t1 = iCount, iCount = iCount + 1 | 0, $t1) !== 0) {
              sPlr.Append$pi8(S(", "));
            }
            sPlr.Append$pi8(pInfo.GetName());
          }
        }
      }
    }
    return sPlr;
  }

  GetActiveScriptPlayerCount(fCountSavegameResumes, fCountInvisible) {
    let iCount = 0;
    for (let i = 0; i < this.iClientCount; i = i + 1 | 0) {
      let pClient = this.ppClients.a[this.ppClients.o + i];
      for (let j = 0; j < pClient.GetPlayerCount(); j = j + 1 | 0) {
        let pNfo = pClient.GetPlayerInfo$i32(j);
        if (!pNfo.IsRemoved()) {
          if (pNfo.GetType() === 2) {
            if (fCountSavegameResumes || !(pNfo.GetAssociatedSavegamePlayerID() !== 0)) {
              if (fCountInvisible || !pNfo.IsInvisible()) {
                iCount = iCount + 1 | 0;
              }
            }
          }
        }
      }
    }
    return iCount;
  }

  GetPrimaryInfoByClientID(iClientID) {
    let pInfoPkt = this.GetInfoByClientID(iClientID);
    if (pInfoPkt == null) {
      return null;
    }
    return pInfoPkt.GetPlayerInfo$i32(0);
  }

  FindSavegameResumePlayerInfo(pMatchInfo, mlMatchStart, mlMatchEnd) {
    let $t1;
    0;
    for (let iMatchLvl = mlMatchStart; iMatchLvl <= mlMatchEnd; iMatchLvl = iMatchLvl + 1 | 0) {
      for (let i = 0; i < this.iClientCount; i = i + 1 | 0) {
        let j = 0;
        let pInfo = null;
        while ((pInfo = this.ppClients.a[this.ppClients.o + i].GetPlayerInfo$i32(($t1 = j, j = j + 1 | 0, $t1))) != null) {
          if (!($.Game.PlayerInfos.GetPlayerInfoByID$i32(pInfo.GetID()) != null) && !($.Game.PlayerInfos.GetPlayerInfoBySavegameID(pInfo.GetID()) != null)) {
            switch (iMatchLvl) {
              case 0:
                if (!(pMatchInfo.GetFilename() != null) || !(pInfo.GetFilename() != null)) {
                  break;
                }
                if (!$.SEqualNoCase($.GetFilename(pMatchInfo.GetFilename()), $.GetFilename(pInfo.GetFilename()))) {
                  break;
                }
              case 1:
                if ($.SEqualNoCase(pMatchInfo.GetName(), pInfo.GetName())) {
                  return pInfo;
                }
                break;
              case 2:
                if (pMatchInfo.GetOriginalColor() === pInfo.GetOriginalColor()) {
                  return pInfo;
                }
                break;
              case 3:
                return pInfo;
            }
          }
        }
      }
    }
    return null;
  }

  HasSameTeamPlayers(iClient1, iClient2) {
    let $t1, $t2;
    let pCnfo1 = this.GetInfoByClientID(iClient1);
    let pCnfo2 = this.GetInfoByClientID(iClient2);
    if (pCnfo1 == null || pCnfo2 == null) {
      return false;
    }
    let i = 0;
    let j = 0;
    let pNfo1 = null;
    let pNfo2 = null;
    while ((pNfo1 = pCnfo1.GetPlayerInfo$i32(($t1 = i, i = i + 1 | 0, $t1))) != null) {
      if (!pNfo1.IsUsingTeam()) {
        continue;
      }
      j = 0;
      while ((pNfo2 = pCnfo2.GetPlayerInfo$i32(($t2 = j, j = j + 1 | 0, $t2))) != null) {
        if (!pNfo2.IsUsingTeam()) {
          continue;
        }
        if (pNfo2.GetTeam() === pNfo1.GetTeam()) {
          return true;
        }
      }
    }
    return false;
  }

  FindUnassociatedRestoreInfo(rRestoreInfoList) {
    let $t1, $t2;
    let pRestoreClient = null;
    let iClient = 0;
    while ((pRestoreClient = rRestoreInfoList.GetIndexedInfo(($t1 = iClient, iClient = iClient + 1 | 0, $t1))) != null) {
      let pRestoreInfo = null;
      let iInfo = 0;
      while ((pRestoreInfo = pRestoreClient.GetPlayerInfo$i32(($t2 = iInfo, iInfo = iInfo + 1 | 0, $t2))) != null) {
        if (pRestoreInfo.IsJoined()) {
          if (!(this.GetPlayerInfoBySavegameID(pRestoreInfo.GetID()) != null) && !(this.GetPlayerInfoByID$i32(pRestoreInfo.GetID()) != null)) {
            return pRestoreInfo;
          }
        }
      }
    }
    return null;
  }

  RemoveInfo(ppRemoveInfo) {
    ppRemoveInfo.a[ppRemoveInfo.o] = this.ppClients.a[this.ppClients.o + (this.iClientCount = this.iClientCount - 1 | 0)];
  }

  Load(hGroup, szFromFile, pLang = null) {
    this.Clear();
    let Buf = new $.StdStrBuf();
    if (!hGroup.LoadEntryString$pi8$pStdStrBuf(szFromFile, Buf)) {
      return true;
    }
    if (pLang != null) {
      pLang.ReplaceStrings$rStdStrBuf(Buf);
    }
    if (!$.CompileFromBuf_LogWarn$mStdNamingAdapt$C4PlayerInfoList$x$pi8($.mkNamingAdapt$rC4PlayerInfoList$pi8(this, S("PlayerInfoList")), Buf, szFromFile)) {
      return false;
    }
    return true;
  }

  Save(hGroup, szToFile) {
    hGroup.DeleteEntry(szToFile);
    if (this.iClientCount === 0) {
      return true;
    }
    try {
      let Buf = $.DecompileToBuf$StdNamingAdapt$C4PlayerInfoList($.mkNamingAdapt$rC4PlayerInfoList$pi8(this, S("PlayerInfoList")));
      hGroup.Add$pi8$rStdStrBuf$b$b$b(szToFile, Buf, false, true);
    } catch ($e1) {
      if ($e1 instanceof $.StdCompiler$Exception) {
        return false;
      } else {
        throw $e1;
      }
    }
    return true;
  }

  SetIDCounter(idNewCounter) {
    this.iLastPlayerID = idNewCounter;
  }

  GetIDCounter() {
    return this.iLastPlayerID;
  }

  FixIDCounter() {
    let $t1;
    for (let i = 0; i < this.iClientCount; i = i + 1 | 0) {
      let j = 0;
      let pInfo = null;
      while ((pInfo = this.ppClients.a[this.ppClients.o + i].GetPlayerInfo$i32(($t1 = j, j = j + 1 | 0, $t1))) != null) {
        this.iLastPlayerID = $max(pInfo.GetID(), this.iLastPlayerID);
      }
    }
  }

  InitLocal() {
    if ($.Game.C4S.Head.Replay) {
      return true;
    }
    0;
    0;
    let pLocalInfo = new C4ClientPlayerInfos().init(P($.Game.PlayerFilenames, 0));
    pLocalInfo = this.AddInfo(pLocalInfo);
    this.CreateRestoreInfosForJoinedScriptPlayers($.Game.RestorePlayerInfos);
    if ($.Game.Teams.IsMultiTeams() && pLocalInfo != null) {
      this.AssignTeams(pLocalInfo, true);
    }
    return true;
  }

  LocalJoinUnjoinedPlayersInQueue() {
    let $t1;
    0;
    let ppkLocal = this.GetInfoPtrByClientID($.Control$2.ClientID());
    let pkLocal = null;
    if (ppkLocal == null) {
      return false;
    }
    pkLocal = ppkLocal.a[ppkLocal.o];
    let i = 0;
    let pInfo = null;
    while ((pInfo = pkLocal.GetPlayerInfo$i32(($t1 = i, i = i + 1 | 0, $t1))) != null) {
      if (!pInfo.HasJoinIssued()) {
        pInfo.SetJoinIssued();
        let szFilename = pInfo.GetFilename();
        if (szFilename == null && pInfo.GetType() !== 2) {
          let szPlrName = pInfo.GetName();
          if (szPlrName == null) {
            szPlrName = S("???");
          }
          $.LogF($.LoadResStr(S("IDS_ERR_JOINQUEUEPLRS")), szPlrName);
          continue;
        }
        $.Game.Input.Add$i32$pC4ControlPacket(145 /*CID_JoinPlr*/, new $.C4ControlJoinPlayer().init$pi8$i32$i32(szFilename, $.Control$2.ClientID(), pInfo.GetID()));
      }
    }
    return true;
  }

  GetStartupCount() {
    let $t1;
    let iCnt = 0;
    for (let i = 0; i < this.iClientCount; i = i + 1 | 0) {
      let j = 0;
      let pInfo = null;
      while ((pInfo = this.ppClients.a[this.ppClients.o + i].GetPlayerInfo$i32(($t1 = j, j = j + 1 | 0, $t1))) != null) {
        if (!pInfo.IsRemoved()) {
          iCnt = iCnt + 1 | 0;
        }
      }
    }
    return iCnt;
  }

  CreateRestoreInfosForJoinedScriptPlayers(rSavegamePlayers) {
    let $t1;
    let i = 0;
    let pHostInfo = this.GetIndexedInfo(0);
    for (i = 0; i < rSavegamePlayers.GetInfoCount(); i = i + 1 | 0) {
      let pkInfo = rSavegamePlayers.GetIndexedInfo(i);
      let j = 0;
      let pInfo = null;
      while ((pInfo = pkInfo.GetPlayerInfo$i32(($t1 = j, j = j + 1 | 0, $t1))) != null) {
        if (pInfo.GetType() === 2) {
          let pRejoinInfo = null;
          if ((pRejoinInfo = this.GetPlayerInfoBySavegameID(pInfo.GetID())) != null) {
            $.LogF(S("Warning: User player %s takes over script player %s!"), pRejoinInfo.GetName(), pInfo.GetName());
            continue;
          }
          if (pHostInfo == null) {
            $.LogF(S("Error restoring savegame script players: No host player infos to add to!"));
            continue;
          }
          pRejoinInfo = pInfo.$clone();
          pRejoinInfo.SetAssociatedSavegamePlayer(pInfo.GetID());
          pHostInfo.AddInfo(pRejoinInfo);
        }
      }
    }
    $.Game.Teams.RecheckPlayers();
  }

  RecreatePlayers(numbers) {
    let $t1;
    for (let i = 0; i < this.iClientCount; i = i + 1 | 0) {
      let pkInfo = this.ppClients.a[this.ppClients.o + i];
      if (!(pkInfo.GetJoinedPlayerCount() !== 0)) {
        continue;
      }
      let idAtClient = pkInfo.GetClientID();
      let szAtClientName = null;
      if ($.Game.C4S.Head.Replay) {
        szAtClientName = S("Replay");
      } else if (!$.Network.isEnabled()) {
        0;
        szAtClientName = S("Local");
      } else {
        let pClient = $.Game.Clients.getClientByID(idAtClient);
        if (pClient != null) {
          szAtClientName = pClient.getName();
        } else {
          $.LogF($.LoadResStr(S("IDS_PRC_RESUMENOCLIENT")), idAtClient, pkInfo.GetPlayerCount());
          continue;
        }
      }
      let j = 0;
      let pInfo = null;
      while ((pInfo = pkInfo.GetPlayerInfo$i32(($t1 = j, j = j + 1 | 0, $t1))) != null) {
        if (pInfo.IsJoined()) {
          let szFilename = pInfo.GetLocalJoinFilename();
          let pJoinRes = pInfo.GetRes();
          if (szFilename != null && pJoinRes != null && pJoinRes.isLoading()) {
            let szName = pInfo.GetName();
            if ($.Network.RetrieveRes(pJoinRes.getCore(), 100000, $.FormatString($.LoadResStr(S("IDS_NET_RES_PLRFILE")), szName).getData()).op_not()) {
              szFilename = null;
            }
          }
          if (szFilename == null || szFilename.a[szFilename.o] === 0) {
            if (pInfo.GetType() === 1) {
              let szPlrName = pInfo.GetName();
              if (szPlrName == null) {
                szPlrName = S("???");
              }
              $.LogF($.LoadResStr(S("IDS_ERR_LOAD_RECR_NOFILEFROMNET")), szPlrName);
              continue;
            } else {
              szFilename = null;
            }
          }
          if ($.Control$2.isRecord() && szFilename != null) {
            let sFilenameInRecord = new $.StdStrBuf();
            sFilenameInRecord.Format(S("Recreate-%d.ocp"), pInfo.GetID());
            $.Control$2.RecAddFile(szFilename, sFilenameInRecord.getData());
          }
          $.Players.Join(szFilename, false, idAtClient, szAtClientName, pInfo, numbers);
          if (pInfo.IsTempFile()) {
            pInfo.DeleteTempFile();
          }
        }
      }
    }
    return true;
  }

  RecreatePlayerFiles() {
    let $t1;
    for (let i = 0; i < this.iClientCount; i = i + 1 | 0) {
      let pkInfo = this.ppClients.a[this.ppClients.o + i];
      let j = 0;
      let pInfo = null;
      while ((pInfo = pkInfo.GetPlayerInfo$i32(($t1 = j, j = j + 1 | 0, $t1))) != null) {
        if (pInfo.IsJoined()) {
          if ($.Game.C4S.Head.Replay || $.Game.C4S.Head.NetworkRuntimeJoin || pInfo.GetType() === 2) {
            let szCurrPlrFile = null;
            let sFilenameInRecord = new $.StdStrBuf();
            if ($.Game.C4S.Head.Replay) {
              sFilenameInRecord.Format(S("Recreate-%d.ocp"), pInfo.GetID());
              szCurrPlrFile = sFilenameInRecord.getData();
            } else {
              szCurrPlrFile = pInfo.GetFilename();
            }
            let szPlrName = pInfo.GetName();
            if (szPlrName == null) {
              szPlrName = S("???");
            }
            if (szCurrPlrFile == null || szCurrPlrFile.a[szCurrPlrFile.o] === 0) {
              if (pInfo.GetType() !== 2) {
                $.LogF($.LoadResStr(S("IDS_ERR_LOAD_RECR_NOFILE")), szPlrName);
              }
              continue;
            }
            let szJoinPath = new $.StdCopyStrBuf();
            szJoinPath.op_assign$pi8($.Config.AtTempPath($.GetFilename(szCurrPlrFile)));
            if (!$.Game.ScenarioFile.FindEntry$pi8$pStdStrBuf$pu64($.GetFilename(szCurrPlrFile)) || !$.Game.ScenarioFile.Extract($.GetFilename(szCurrPlrFile), szJoinPath.getData())) {
              if (pInfo.GetType() !== 2) {
                $.LogF($.LoadResStr(S("IDS_ERR_LOAD_RECR_NOEXTRACT")), szPlrName, $.GetFilename(szCurrPlrFile));
              }
              continue;
            }
            pInfo.SetFilename(szJoinPath.getData());
            pInfo.DiscardResource();
            pInfo.SetTempFile();
          } else {
          }
        } else if (!pInfo.HasJoinIssued()) {
        }
      }
    }
    return true;
  }

  RestoreSavegameInfos(rSavegamePlayers) {
    let $t1, $t2;
    if (rSavegamePlayers.GetPlayerCount() !== 0) {
      0;
      let iNumGrabbed = 0;
      let i = 0;
      if (!$.Network.isEnabled() && $.Game.C4S.Head.SaveGame) {
        for (let eMatchingLevel = 0; eMatchingLevel <= 3; eMatchingLevel = eMatchingLevel + 1 | 0) {
          for (let i$2 = 0; i$2 < this.iClientCount; i$2 = i$2 + 1 | 0) {
            let pkInfo = this.GetIndexedInfo(i$2);
            let j = 0;
            let id = 0;
            let pInfo = null;
            let pSavegameInfo = null;
            while ((pInfo = pkInfo.GetPlayerInfo$i32(($t1 = j, j = j + 1 | 0, $t1))) != null) {
              if (!((id = pInfo.GetAssociatedSavegamePlayerID()) !== 0)) {
                if ((pSavegameInfo = rSavegamePlayers.FindSavegameResumePlayerInfo(pInfo, eMatchingLevel, eMatchingLevel)) != null) {
                  pInfo.SetAssociatedSavegamePlayer(pSavegameInfo.GetID());
                  if (eMatchingLevel > 1) {
                    let sMsg = new $.StdStrBuf();
                    sMsg.Format($.LoadResStr(S("IDS_MSG_PLAYERASSIGNMENT")), pInfo.GetName(), pSavegameInfo.GetName());
                    $.Log(sMsg.getData());
                    if ($.pGUI != null && $.FullScreen.Active && !$.Game.C4S.Head.Replay) {
                      $.pGUI.ShowMessageModal(sMsg.getData(), $.LoadResStr(S("IDS_MSG_FREESAVEGAMEPLRS")), 1, 1 /*Ico_Notify*/, P($.Config.Startup, "HideMsgPlrTakeOver"));
                    }
                  }
                }
              }
            }
          }
        }
      }
      for (i = 0; i < this.iClientCount; i = i + 1 | 0) {
        let pkInfo = this.GetIndexedInfo(i);
        let j = 0;
        let id = 0;
        let pInfo = null;
        let pSavegameInfo = null;
        while ((pInfo = pkInfo.GetPlayerInfo$i32(($t2 = j, j = j + 1 | 0, $t2))) != null) {
          if ((id = pInfo.GetAssociatedSavegamePlayerID()) !== 0) {
            if ((pSavegameInfo = rSavegamePlayers.GetPlayerInfoByID$i32(id)) != null) {
              pInfo.SetSavegameResume(pSavegameInfo);
              iNumGrabbed = iNumGrabbed + 1 | 0;
            } else {
              0;
            }
          } else {
            if ($.Game.C4S.Head.SaveGame) {
              $.LogF($.LoadResStr(S("IDS_PRC_RESUMENOPLRASSOCIATION")), pInfo.GetName());
            }
          }
        }
      }
      let iCountRemaining = rSavegamePlayers.GetPlayerCount() - iNumGrabbed | 0;
      if (iCountRemaining !== 0) {
        if ($.Control$2.isReplay() && !(this.GetInfoCount() !== 0)) {
          C4PlayerInfoList.prototype.$assign.call(this, rSavegamePlayers);
        } else {
          $.LogF($.LoadResStr(S("IDS_PRC_RESUMEREMOVEPLRS")), iCountRemaining);
          this.RemoveUnassociatedPlayers(rSavegamePlayers);
        }
      }
    }
    $.Game.Teams.RecheckPlayers();
    return true;
  }

  SetAsRestoreInfos(rFromPlayers, fSaveUserPlrs, fSaveScriptPlrs, fSetUserPlrRefToLocalGroup, fSetScriptPlrRefToLocalGroup) {
    let $t1, $t2;
    C4PlayerInfoList.prototype.$assign.call(this, rFromPlayers);
    let pClient = null;
    let iClient = 0;
    while ((pClient = this.GetIndexedInfo(($t1 = iClient, iClient = iClient + 1 | 0, $t1))) != null) {
      let pInfo = null;
      let iInfo = 0;
      while ((pInfo = pClient.GetPlayerInfo$i32(($t2 = iInfo, iInfo = iInfo + 1 | 0, $t2))) != null) {
        let fKeepInfo = false;
        if (pInfo.IsJoined()) {
          pInfo.SetFilename(null);
          if (pInfo.GetType() === 1) {
            fKeepInfo = fSaveUserPlrs;
            if (fSetUserPlrRefToLocalGroup) {
              let sNewName = new $.StdStrBuf();
              if ($.Network.isEnabled()) {
                let pGameClient = $.Game.Clients.getClientByID(pClient.GetClientID());
                let szName = pGameClient != null ? pGameClient.getName() : S("Unknown");
                sNewName.Format(S("%s-%s"), szName, $.GetFilename(pInfo.GetLocalJoinFilename()));
              } else {
                sNewName.Copy$pi8($.GetFilename(pInfo.GetFilename()));
              }
              sNewName.Replace(S("%"), S("%25"), 0);
              for (let ch = 128; ch < 256; ch = ch + 1 | 0) {
                let hexChars = S("0123456789abcdef");
                const old = new Int8Array([ch << 24 >> 24, 0]);
                const safe = new Int8Array([37, 120, 120, 0]);
                safe[1] = hexChars.a[hexChars.o + (ch / 16 | 0)];
                safe[2] = hexChars.a[hexChars.o + ch % 16];
                sNewName.Replace(P(old, 0), P(safe, 0), 0);
              }
              pInfo.SetFilename(sNewName.getData());
            }
          } else if (pInfo.GetType() === 2) {
            fKeepInfo = fSaveScriptPlrs && (fSaveUserPlrs || pInfo.IsScenarioSaveDesired());
            if (fSetScriptPlrRefToLocalGroup) {
              pInfo.SetFilename($.FormatString(S("ScriptPlr-%d.ocp"), pInfo.GetID()).getData());
            }
          }
        }
        if (!fKeepInfo) {
          pClient.RemoveIndexedInfo((iInfo = iInfo - 1 | 0));
        } else {
          pInfo.DiscardResource();
        }
      }
      if (!(pClient.GetPlayerCount() !== 0)) {
        this.RemoveInfo(this.GetInfoPtrByClientID(pClient.GetClientID()));
        $delete(pClient);
        iClient = iClient - 1 | 0;
      }
    }
    return true;
  }

  RemoveUnassociatedPlayers(rSavegamePlayers) {
    let $t1, $t2;
    let pClient = null;
    let iClient = 0;
    while ((pClient = rSavegamePlayers.GetIndexedInfo(($t1 = iClient, iClient = iClient + 1 | 0, $t1))) != null) {
      let pInfo = null;
      let iInfo = 0;
      while ((pInfo = pClient.GetPlayerInfo$i32(($t2 = iInfo, iInfo = iInfo + 1 | 0, $t2))) != null) {
        if (pInfo.IsJoined() && !(this.GetPlayerInfoBySavegameID(pInfo.GetID()) != null)) {
          if ($.Players.RemoveUnjoined(pInfo.GetInGameNumber())) {
            $.LogF($.LoadResStr(S("IDS_PRC_REMOVEPLR")), pInfo.GetName());
          }
        }
        pInfo.SetRemoved();
      }
    }
  }

  GetFreePlayerSlotCount() {
    return $max($.Game.Parameters.MaxPlayers - this.GetStartupCount() | 0, 0);
  }

  ResetLeagueProjectedGain(fSetUpdated) {
    let $t1, $t2;
    let pClient = null;
    let iClient = 0;
    while ((pClient = this.GetIndexedInfo(($t1 = iClient, iClient = iClient + 1 | 0, $t1))) != null) {
      let pInfo = null;
      let iInfo = 0;
      while ((pInfo = pClient.GetPlayerInfo$i32(($t2 = iInfo, iInfo = iInfo + 1 | 0, $t2))) != null) {
        if (pInfo.IsLeagueProjectedGainValid()) {
          pInfo.ResetLeagueProjectedGain();
          if (fSetUpdated) {
            pClient.SetUpdated();
          }
        }
      }
    }
  }

  LoadResources() {
    let $t1, $t2;
    let i = this.iClientCount;
    let ppClient = this.ppClients;
    while (($t1 = i, i = i - 1 | 0, $t1) !== 0) {
      $rd(($t2 = ppClient, ppClient = ppClient.add(1), $t2)).LoadResources();
    }
  }

  CompileFunc(pComp) {
    let deserializing = pComp.isDeserializer();
    if (deserializing) {
      this.Clear();
    }
    if (!deserializing && pComp.hasNaming() && this.iLastPlayerID === 0 && this.iClientCount === 0) {
      return;
    }
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "iLastPlayerID"), S("LastPlayerID"), 0));
    const iTemp = [this.iClientCount];
    pComp.Value$StdNamingCountAdapt$i32($.mkNamingCountAdapt$ri32$pi8(P(iTemp, 0), S("Client")));
    if (iTemp[0] < 0 || iTemp[0] > 5000) {
      pComp.excCorrupt(S("client count out of range"));
      return;
    }
    if (deserializing) {
      if (iTemp[0] > this.iClientCapacity) {
        this.GrowList($u64n(iTemp[0] - this.iClientCapacity | 0));
      }
      this.iClientCount = iTemp[0];
      $.ZeroMem$ppC4ClientPlayerInfos$u64(this.ppClients, 8 * $u64n(this.iClientCount));
    }
    pComp.Value$StdNamingAdapt$StdArrayAdapt$pC4ClientPlayerInfos$StdPtrAdapt$C4ClientPlayerInfos($.mkNamingAdapt$mStdArrayAdapt$pC4ClientPlayerInfos$StdPtrAdapt$C4ClientPlayerInfos$pi8($.mkArrayAdaptMap$ppC4ClientPlayerInfos$i32$x(this.ppClients, this.iClientCount, $.mkPtrAdaptNoNull$rpC4ClientPlayerInfos), S("Client")));
    $.mkPtrAdaptNoNull$rpC4ClientPlayerInfos(this.ppClients);
  }

  $copy(rCpy) {
    this.iClientCount = rCpy.iClientCount;
    this.iClientCapacity = rCpy.iClientCapacity;
    this.ppClients = null;
    this.iLastPlayerID = rCpy.iLastPlayerID;
    let $t1, $t2, $t3;
    if (rCpy.ppClients != null) {
      this.ppClients = P(new Array($u64n(this.iClientCapacity)).fill(null), 0);
      let ppInfo = this.ppClients;
      let ppCpy = rCpy.ppClients;
      let i = this.iClientCount;
      while (($t1 = i, i = i - 1 | 0, $t1) !== 0) {
        $wr(($t2 = ppInfo, ppInfo = ppInfo.add(1), $t2), 0, new C4ClientPlayerInfos().$copy($rd(($t3 = ppCpy, ppCpy = ppCpy.add(1), $t3))));
      }
    }
    return this;
  }
  $clone() { return new C4PlayerInfoList().$copy(this); }
  $assign(rCpy) {
    let $t1, $t2, $t3;
    this.Clear();
    this.iClientCount = rCpy.iClientCount;
    this.iClientCapacity = rCpy.iClientCapacity;
    this.iLastPlayerID = rCpy.iLastPlayerID;
    if (rCpy.ppClients != null) {
      this.ppClients = P(new Array($u64n(this.iClientCapacity)).fill(null), 0);
      let ppInfo = this.ppClients;
      let ppCpy = rCpy.ppClients;
      let i = this.iClientCount;
      while (($t1 = i, i = i - 1 | 0, $t1) !== 0) {
        $wr(($t2 = ppInfo, ppInfo = ppInfo.add(1), $t2), 0, new C4ClientPlayerInfos().$copy($rd(($t3 = ppCpy, ppCpy = ppCpy.add(1), $t3))));
      }
    } else {
      this.ppClients = null;
    }
    return this;
  }
}

export class C4PacketPlayerInfoUpdRequest extends C4PacketBase {
  Info = new C4ClientPlayerInfos().init();

  init$v() {
    this.Info = new C4ClientPlayerInfos().init();
    return this;
  }

  init$pi8$b(szFilenames, fAdd) {
    this.Info = new C4ClientPlayerInfos().init(szFilenames, fAdd);
    return this;
  }

  init$C4ClientPlayerInfos(rInfo) {
    this.Info = new C4ClientPlayerInfos().$copy(rInfo);
    return this;
  }

  CompileFunc$pStdCompiler(pComp) {
    pComp.Value$rC4ClientPlayerInfos(this.Info);
  }

  $clone() { return new C4PacketPlayerInfoUpdRequest().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.Info.$assign(o.Info);
    return this;
  }
}

export class C4PacketPlayerInfo extends C4PacketBase {
  Info = new C4ClientPlayerInfos().init();
  fIsRecreationInfo = false;

  init$v() {
    this.Info = new C4ClientPlayerInfos().init();
    this.fIsRecreationInfo = false;
    return this;
  }

  init$C4ClientPlayerInfos$b(rCopyInfos, fRecreationPlayers) {
    this.Info = new C4ClientPlayerInfos().$copy(rCopyInfos);
    this.fIsRecreationInfo = fRecreationPlayers;
    return this;
  }

  CompileFunc$pStdCompiler(pComp) {
    pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "fIsRecreationInfo"), S("Recreation"), false));
    pComp.Value$StdNamingAdapt$C4ClientPlayerInfos($.mkNamingAdapt$rC4ClientPlayerInfos$pi8(this.Info, S("Info")));
  }

  $clone() { return new C4PacketPlayerInfo().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.Info.$assign(o.Info);
    this.fIsRecreationInfo = o.fIsRecreationInfo;
    return this;
  }
}

export function $init(): void {
}

Object.assign($, { C4ClientPlayerInfos, C4PacketPlayerInfo, C4PacketPlayerInfoUpdRequest, C4PlayerInfo, C4PlayerInfoList });
