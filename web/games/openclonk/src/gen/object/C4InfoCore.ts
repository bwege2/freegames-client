// @ts-nocheck
// OpenClonk 36de799: src/object/C4InfoCore.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { Random } from '../../rt/native.ts';
import { $rd, $wr, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';

export class C4ObjectInfoCore {
  id = new $.C4ID().init$v();
  Name = new Int8Array(31);
  Participation = 0;
  Rank = 0;
  sRankName = new $.StdStrBuf();
  sNextRankName = new $.StdStrBuf();
  NextRankExp = 0;
  Experience = 0;
  Rounds = 0;
  DeathCount = 0;
  TypeName = new Int8Array(32);
  Birthday = 0;
  TotalPlayingTime = 0;
  Age = 0;
  DeathMessage = new Int8Array(76);
  ExtraData = new $.C4ValueMapData();

  init() {
    this.id = new $.C4ID().init$v();
    this.sRankName = new $.StdStrBuf();
    this.sNextRankName = new $.StdStrBuf();
    this.ExtraData = new $.C4ValueMapData();
    C4ObjectInfoCore.prototype.Default$C4ID$pC4DefList$pi8.call(this);
    return this;
  }

  Save$rC4Group$pC4DefList(hGroup, pDefs) {
    if (pDefs != null) {
      this.UpdateCustomRanks(pDefs);
    }
    let Buffer = new $.StdStrBuf();
    if (!this.Decompile(Buffer)) {
      return false;
    }
    if (!hGroup.Add$pi8$rStdStrBuf$b$b$b(S("ObjectInfo.txt"), Buffer, false, true)) {
      return false;
    }
    return true;
  }

  Load$rC4Group(hGroup) {
    let Source = new $.StdStrBuf();
    return hGroup.LoadEntryString$pi8$pStdStrBuf(S("ObjectInfo.txt"), Source) && this.Compile(Source.getData());
  }

  Default$C4ID$pC4DefList$pi8(n_id = $.C4ID.None.$clone(), pDefs = null, cpNames = null) {
    let pDef = null;
    if (pDefs != null) {
      pDef = pDefs.ID2Def(n_id.$clone());
    }
    this.id.$assign(n_id);
    this.Participation = 1;
    this.Rank = 0;
    this.Experience = 0;
    this.Rounds = 0;
    this.DeathCount = 0;
    this.Birthday = 0;
    this.TotalPlayingTime = 0;
    $.SCopy$pi8$pi8$u64(S("Clonk"), P(this.Name, 0), 30);
    $.SCopy$pi8$pi8$u64(S("Clonk"), P(this.TypeName, 0), 30);
    this.sRankName.Copy$pi8(S("Clonk"));
    this.sNextRankName.Clear();
    this.NextRankExp = 0;
    this.DeathMessage[0] = 0;
    this.Age = 0;
    this.ExtraData.Reset();
    if (pDef != null) {
      $.SCopy$pi8$pi8$u64(pDef.GetName(), P(this.TypeName, 0), 30);
    }
    if (cpNames != null) {
      $.SCopySegment(cpNames, Random($.SCharCount(10, cpNames)) | 0, P(this.Name, 0), 10, 31);
      $.SClearFrontBack(P(this.Name, 0));
      $.SReplaceChar(P(this.Name, 0), 13, 0);
      if (this.Name[0] === 0) {
        $.SCopy$pi8$pi8$u64(S("Clonk"), P(this.Name, 0), 30);
      }
    }
    if (pDefs != null) {
      this.UpdateCustomRanks(pDefs);
    }
  }

  Promote(iRank, rRanks, fForceRankName) {
    this.Rank = iRank;
    let sNewRank = rRanks.GetRankName(this.Rank, fForceRankName);
    if (sNewRank.op_const_void_() != null) {
      this.sRankName.Copy$StdStrBuf(sNewRank);
    }
  }

  GetNextRankInfo(rDefaultRanks, piNextRankExp, psNextRankName) {
    let iNextRankExp = 0;
    if (this.NextRankExp !== 0) {
      iNextRankExp = this.NextRankExp;
      if (psNextRankName != null) {
        psNextRankName.Copy$StdStrBuf(this.sNextRankName);
      }
    } else {
      let sRank = rDefaultRanks.GetRankName(this.Rank + 1 | 0, false);
      if (sRank.op_const_void_() != null) {
        iNextRankExp = rDefaultRanks.Experience(this.Rank + 1 | 0);
        if (psNextRankName != null) {
          psNextRankName.Copy$StdStrBuf(sRank);
        }
      } else {
        iNextRankExp = -1;
      }
    }
    if (piNextRankExp != null) {
      piNextRankExp.a[piNextRankExp.o] = iNextRankExp;
    }
    return iNextRankExp !== -1;
  }

  CompileFunc(pComp) {
    let numbers = new $.C4ValueNumbers().init();
    pComp.Value$StdNamingDefaultAdapt$C4ID$C4ID($.mkNamingAdapt$rC4ID$pi8$C4ID$b$b(this.id, S("id"), $.C4ID.None));
    pComp.Value$StdNamingDefaultAdapt$StdStringAdapt$x$12($.mkNamingAdapt$mStdStringAdapt$pi8$x$b$b$12($.mkStringAdaptMA$3(this.Name), S("Name"), S("Clonk")));
    pComp.Value$StdNamingDefaultAdapt$StdStringAdapt$x$5($.mkNamingAdapt$mStdStringAdapt$pi8$x$b$b$5($.mkStringAdaptMA$7(this.DeathMessage), S("DeathMessage"), S("")));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Rank"), S("Rank"), 0));
    pComp.Value$StdNamingDefaultAdapt$StdStrBuf$x$4($.mkNamingAdapt$rStdStrBuf$pi8$x$b$b$4(this.sRankName, S("RankName"), S("Clonk")));
    pComp.Value$StdNamingDefaultAdapt$StdStrBuf$x$2($.mkNamingAdapt$rStdStrBuf$pi8$x$b$b$2(this.sNextRankName, S("NextRankName"), S("")));
    pComp.Value$StdNamingDefaultAdapt$StdStringAdapt$x$12($.mkNamingAdapt$mStdStringAdapt$pi8$x$b$b$12($.mkStringAdaptMA$4(this.TypeName), S("TypeName"), S("Clonk")));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Participation"), S("Participation"), 1));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Experience"), S("Experience"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "NextRankExp"), S("NextRankExp"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Rounds"), S("Rounds"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "DeathCount"), S("DeathCount"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Birthday"), S("Birthday"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "TotalPlayingTime"), S("TotalPlayingTime"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Age"), S("Age"), 0));
    pComp.Value$StdNamingDefaultAdapt$StdParameterAdapt$C4ValueMapData$pC4ValueNumbers$C4ValueMapData($.mkNamingAdapt$mStdParameterAdapt$C4ValueMapData$pC4ValueNumbers$pi8$C4ValueMapData$b$b($.mkParAdapt$rC4ValueMapData$mpC4ValueNumbers(this.ExtraData, numbers), S("ExtraData"), new $.C4ValueMapData()));
    pComp.Value$StdNamingAdapt$C4ValueNumbers($.mkNamingAdapt$rC4ValueNumbers$pi8(numbers, S("ExtraDataValues")));
    if (pComp.isDeserializer()) {
      numbers.Denumerate();
      this.ExtraData.Denumerate(numbers);
    }
  }

  Compile(szSource) {
    let ret = $.CompileFromBuf_LogWarn$mStdNamingAdapt$C4ObjectInfoCore$x$pi8($.mkNamingAdapt$rC4ObjectInfoCore$pi8(this, S("ObjectInfo")), new $.StdStrBuf().init$pi8$b(szSource), S("ObjectInfo"));
    if (64 === this.DeathMessage[0]) {
      this.DeathMessage[0] = 32;
    }
    return ret;
  }

  Decompile(Buf) {
    if (!$.DecompileToBuf_Log$mStdNamingAdapt$C4ObjectInfoCore$px$pi8($.mkNamingAdapt$rC4ObjectInfoCore$pi8(this, S("ObjectInfo")), Buf, S("ObjectInfo"))) {
      return false;
    }
    return true;
  }

  UpdateCustomRanks(pDefs) {
    0;
    let pDef = pDefs.ID2Def(this.id.$clone());
    if (pDef == null) {
      return;
    }
    if (pDef.pRankNames != null) {
      let sRank = pDef.pRankNames.GetRankName(this.Rank, false);
      if (sRank.op_const_void_() != null) {
        this.sRankName.Copy$StdStrBuf(sRank);
      }
      let sNextRank = pDef.pRankNames.GetRankName(this.Rank + 1 | 0, false);
      if (sNextRank.op_const_void_() != null) {
        this.sNextRankName.Copy$StdStrBuf(sNextRank);
        this.NextRankExp = pDef.pRankNames.Experience(this.Rank + 1 | 0);
      } else {
        this.sNextRankName.Clear();
        this.NextRankExp = -1;
      }
    } else {
      this.sNextRankName.Clear();
      this.NextRankExp = 0;
    }
  }

  $clone() { return new C4ObjectInfoCore().$assign(this); }
  $assign(o) {
    this.id.$assign(o.id);
    this.Name = o.Name.slice();
    this.Participation = o.Participation;
    this.Rank = o.Rank;
    this.sRankName.$assign(o.sRankName);
    this.sNextRankName.$assign(o.sNextRankName);
    this.NextRankExp = o.NextRankExp;
    this.Experience = o.Experience;
    this.Rounds = o.Rounds;
    this.DeathCount = o.DeathCount;
    this.TypeName = o.TypeName.slice();
    this.Birthday = o.Birthday;
    this.TotalPlayingTime = o.TotalPlayingTime;
    this.Age = o.Age;
    this.DeathMessage = o.DeathMessage.slice();
    this.ExtraData.$assign(o.ExtraData);
    return this;
  }
}

export class C4RoundResult {
  Title = new $.StdCopyStrBuf();
  Date = 0;
  Duration = 0;
  Won = 0;
  Score = 0;
  FinalScore = 0;
  TotalScore = 0;
  Bonus = 0;
  Level = 0;

  Default() {
    $.InplaceReconstruct$pC4RoundResult(this);
  }

  CompileFunc(pComp) {
    pComp.Value$StdNamingDefaultAdapt$StdCopyStrBuf$x($.mkNamingAdapt$rStdCopyStrBuf$pi8$x$b$b(this.Title, S("Title"), S("")));
    pComp.Value$StdNamingDefaultAdapt$u32$u32($.mkNamingAdapt$ru32$pi8$u32$b$b(P(this, "Date"), S("Date"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Duration"), S("Duration"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Won"), S("Won"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Score"), S("Score"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "FinalScore"), S("FinalScore"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "TotalScore"), S("TotalScore"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Bonus"), S("Bonus"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Level"), S("Level"), 0));
  }

  None() {
    this.Title = new $.StdCopyStrBuf();
    this.Date = 0;
    this.Duration = 0;
    this.Won = 0;
    this.Score = 0;
    this.FinalScore = 0;
    this.TotalScore = 0;
    this.Bonus = 0;
    this.Level = 0;
    return this;
  }

  $clone() { return new C4RoundResult().$assign(this); }
  $assign(o) {
    this.Title.$assign(o.Title);
    this.Date = o.Date;
    this.Duration = o.Duration;
    this.Won = o.Won;
    this.Score = o.Score;
    this.FinalScore = o.FinalScore;
    this.TotalScore = o.TotalScore;
    this.Bonus = o.Bonus;
    this.Level = o.Level;
    return this;
  }
}

export class C4PlayerInfoCore {
  PrefName = new Int8Array(31);
  Comment = new Int8Array(257);
  Rank = 0;
  RankName = new Int8Array(31);
  TotalScore = 0;
  Rounds = 0;
  RoundsWon = 0;
  RoundsLost = 0;
  TotalPlayingTime = 0;
  LastRound = new C4RoundResult().None();
  ExtraData = new $.C4ValueMapData();
  LeagueName = new Int8Array(31);
  PrefControl = new $.StdCopyStrBuf();
  PrefMouse = 0;
  PrefColor = 0;
  PrefColorDw = 0;
  PrefColor2Dw = 0;
  PrefClonkSkin = 0;
  OldPrefControl = 0;
  OldPrefControlStyle = 0;
  OldPrefAutoContextMenu = 0;
  Achievements = new $.C4ScenarioParameters().init();

  init() {
    this.LastRound = new C4RoundResult().None();
    this.ExtraData = new $.C4ValueMapData();
    this.PrefControl = new $.StdCopyStrBuf();
    this.Achievements = new $.C4ScenarioParameters().init();
    C4PlayerInfoCore.prototype.Default.call(this);
    return this;
  }

  Default(pRanks = null) {
    $wr(P(this.Comment, 0), 0, 0);
    $wr(P(this.RankName, 0), 0, 0);
    this.TotalScore = 0;
    this.Rounds = 0;
    this.RoundsWon = 0;
    this.RoundsLost = 0;
    this.TotalPlayingTime = 0;
    $wr(P(this.LeagueName, 0), 0, 0);
    this.LastRound.Default();
    this.ExtraData.$assign(new $.C4ValueMapData());
    this.PrefControl.Clear();
    this.Rank = 0;
    $.SCopy$pi8$pi8(S("Neuling"), P(this.PrefName, 0));
    if (pRanks != null) {
      $.SCopy$pi8$pi8(pRanks.GetRankName(this.Rank, false).getData(), P(this.RankName, 0));
    } else {
      $.SCopy$pi8$pi8(S("Rang"), P(this.RankName, 0));
    }
    this.PrefClonkSkin = 0;
    this.PrefColor = 0;
    this.PrefColorDw = 255;
    this.PrefColor2Dw = 0;
    this.OldPrefControl = 0;
    this.PrefMouse = 1;
    this.OldPrefControlStyle = 0;
    this.OldPrefAutoContextMenu = 0;
    this.PrefControl.Clear();
    this.ExtraData.Reset();
  }

  Promote(iRank, rRanks) {
    this.Rank = iRank;
    $.SCopy$pi8$pi8$u64(rRanks.GetRankName(this.Rank, true).getData(), P(this.RankName, 0), 30);
  }

  Load$rC4Group(hGroup) {
    let Source = new $.StdStrBuf();
    if (hGroup.LoadEntryString$pi8$pStdStrBuf(S("Player.txt"), Source)) {
      let GrpName = hGroup.GetFullName();
      GrpName.Append$pi8(S("/Player.txt"));
      if (!$.CompileFromBuf_LogWarn$rC4PlayerInfoCore$x$pi8(this, Source, GrpName.getData())) {
        return false;
      }
      if (this.OldPrefAutoContextMenu === -1) {
        this.OldPrefAutoContextMenu = this.OldPrefControlStyle;
      }
      if (this.PrefColorDw === 0) {
        this.PrefColorDw = C4PlayerInfoCore.GetPrefColorValue(this.PrefColor);
      }
      this.PrefColorDw = (this.PrefColorDw & 0xffffff) >>> 0;
      this.PrefColor2Dw = (this.PrefColor2Dw & 0xffffff) >>> 0;
      $.C4Markup.StripMarkup$pi8(P(this.PrefName, 0));
      return true;
    }
    return false;
  }

  Save$rC4Group(hGroup) {
    let Source = new $.StdStrBuf();
    let Name = hGroup.GetFullName();
    Name.Append$pi8(S("/Player.txt"));
    if (!$.DecompileToBuf_Log$rC4PlayerInfoCore$px$pi8(this, Source, Name.getData())) {
      return false;
    }
    if (!hGroup.Add$pi8$rStdStrBuf$b$b$b(S("Player.txt"), Source, false, true)) {
      return false;
    }
    hGroup.Delete(S("C4Player.ocb"));
    return true;
  }

  CheckPromotion(rRanks) {
    if (this.TotalScore >= rRanks.Experience(this.Rank + 1 | 0)) {
      this.Promote(this.Rank + 1 | 0, rRanks);
      return true;
    }
    return false;
  }

  static GetPrefColorValue(iPrefColor) {
    const valRGB = new Uint32Array([0xff0000e8, 0xfff40000, 0xff00c800, 0xfffcf41c, 0xffc48444, 0xff784830, 0xffa04400, 0xfff08050, 0xff848484, 0xffffffff, 0xff0094f8, 0xffbc00c0]);
    if ($.Inside$i32$i32$i32$3(iPrefColor, 0, 11)) {
      return valRGB[iPrefColor];
    }
    return 0xffaaaaaa;
  }

  CompileFunc$pStdCompiler(pComp) {
    let numbers = new $.C4ValueNumbers().init();
    pComp.Name(S("Player"));
    pComp.Value$StdNamingDefaultAdapt$StdStringAdapt$x$13($.mkNamingAdapt$mStdStringAdapt$pi8$x$b$b$13($.mkStringAdaptMA$3(this.PrefName), S("Name"), S("Neuling")));
    pComp.Value$StdNamingDefaultAdapt$StdStringAdapt$x$5($.mkNamingAdapt$mStdStringAdapt$pi8$x$b$b$5($.mkStringAdaptMA$2(this.Comment), S("Comment"), S("")));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Rank"), S("Rank"), 0));
    pComp.Value$StdNamingDefaultAdapt$StdStringAdapt$pi8($.mkNamingAdapt$mStdStringAdapt$pi8$pi8$b$b($.mkStringAdaptMA$3(this.RankName), S("RankName"), $.LoadResStr(S("IDS_MSG_RANK"))));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "TotalScore"), S("Score"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Rounds"), S("Rounds"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "RoundsWon"), S("RoundsWon"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "RoundsLost"), S("RoundsLost"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "TotalPlayingTime"), S("TotalPlayingTime"), 0));
    pComp.Value$StdNamingDefaultAdapt$StdParameterAdapt$C4ValueMapData$pC4ValueNumbers$C4ValueMapData($.mkNamingAdapt$mStdParameterAdapt$C4ValueMapData$pC4ValueNumbers$pi8$C4ValueMapData$b$b($.mkParAdapt$rC4ValueMapData$mpC4ValueNumbers(this.ExtraData, numbers), S("ExtraData"), new $.C4ValueMapData()));
    pComp.Value$StdNamingAdapt$C4ValueNumbers($.mkNamingAdapt$rC4ValueNumbers$pi8(numbers, S("ExtraDataValues")));
    if (pComp.isDeserializer()) {
      numbers.Denumerate();
      this.ExtraData.Denumerate(numbers);
    }
    pComp.Value$StdNamingDefaultAdapt$StdStringAdapt$x$5($.mkNamingAdapt$mStdStringAdapt$pi8$x$b$b$5($.mkStringAdaptMA$3(this.LeagueName), S("LeagueName"), S("")));
    pComp.NameEnd();
    pComp.Name(S("Preferences"));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "PrefColor"), S("Color"), 0));
    pComp.Value$StdNamingDefaultAdapt$u32$u32($.mkNamingAdapt$ru32$pi8$u32$b$b(P(this, "PrefColorDw"), S("ColorDw"), 255));
    pComp.Value$StdNamingDefaultAdapt$u32$u32($.mkNamingAdapt$ru32$pi8$u32$b$b(P(this, "PrefColor2Dw"), S("AlternateColorDw"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "PrefMouse"), S("Mouse"), 1));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "OldPrefControl"), S("Control"), 1));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "OldPrefControlStyle"), S("AutoStopControl"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "OldPrefAutoContextMenu"), S("AutoContextMenu"), -1));
    pComp.Value$StdNamingDefaultAdapt$StdCopyStrBuf$StdStrBuf($.mkNamingAdapt$rStdCopyStrBuf$pi8$StdStrBuf$b$b(this.PrefControl, S("ControlSet"), new $.StdStrBuf()));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "PrefClonkSkin"), S("ClonkSkin"), 0));
    pComp.NameEnd();
    pComp.Value$StdNamingAdapt$C4RoundResult($.mkNamingAdapt$rC4RoundResult$pi8(this.LastRound, S("LastRound")));
    pComp.Value$StdNamingAdapt$C4ScenarioParameters($.mkNamingAdapt$rC4ScenarioParameters$pi8(this.Achievements, S("Achievements")));
  }

  $clone() { return new C4PlayerInfoCore().$assign(this); }
  $assign(o) {
    this.PrefName = o.PrefName.slice();
    this.Comment = o.Comment.slice();
    this.Rank = o.Rank;
    this.RankName = o.RankName.slice();
    this.TotalScore = o.TotalScore;
    this.Rounds = o.Rounds;
    this.RoundsWon = o.RoundsWon;
    this.RoundsLost = o.RoundsLost;
    this.TotalPlayingTime = o.TotalPlayingTime;
    this.LastRound.$assign(o.LastRound);
    this.ExtraData.$assign(o.ExtraData);
    this.LeagueName = o.LeagueName.slice();
    this.PrefControl.$assign(o.PrefControl);
    this.PrefMouse = o.PrefMouse;
    this.PrefColor = o.PrefColor;
    this.PrefColorDw = o.PrefColorDw;
    this.PrefColor2Dw = o.PrefColor2Dw;
    this.PrefClonkSkin = o.PrefClonkSkin;
    this.OldPrefControl = o.OldPrefControl;
    this.OldPrefControlStyle = o.OldPrefControlStyle;
    this.OldPrefAutoContextMenu = o.OldPrefAutoContextMenu;
    this.Achievements.$assign(o.Achievements);
    return this;
  }
}



export function $init(): void {
  $.C4MaxPhysical$C4InfoCore = 100000;
  $.C4MaxDeathMsg$C4InfoCore = 75;
}

Object.assign($, { C4ObjectInfoCore, C4PlayerInfoCore, C4RoundResult });
