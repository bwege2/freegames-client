// @ts-nocheck
// OpenClonk 36de799: src/control/C4RoundResults.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { C4PacketBase } from '../network/C4PacketBase.ts';
import { $u64n, ftoi32 } from '../../rt/int.ts';
import { c$memcpy } from '../../rt/libc.ts';
import { $oat, $own, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete } from '../../rt/std.ts';

export class C4RoundResultsPlayer {
  id = 0;
  fctBigIcon = new $.C4FacetSurface().init();
  iTotalPlayingTime = 0;
  iScoreOld = -1;
  iScoreNew = -1;
  sCustomEvaluationStrings = new $.StdCopyStrBuf();
  iLeagueScoreNew = -1;
  iLeagueScoreGain = 0;
  iLeagueRankNew = 0;
  iLeagueRankSymbolNew = 0;
  iLeaguePerformance = 0;
  sLeagueProgressData = new $.StdCopyStrBuf();
  eLeagueStatus = 0 /*RRPLS_Unknown*/;

  init() {
    this.id = 0;
    this.fctBigIcon = new $.C4FacetSurface().init();
    this.iTotalPlayingTime = 0;
    this.iScoreOld = -1;
    this.iScoreNew = -1;
    this.sCustomEvaluationStrings = new $.StdCopyStrBuf();
    this.iLeagueScoreNew = -1;
    this.iLeagueScoreGain = 0;
    this.iLeagueRankNew = 0;
    this.iLeagueRankSymbolNew = 0;
    this.iLeaguePerformance = 0;
    this.sLeagueProgressData = new $.StdCopyStrBuf();
    this.eLeagueStatus = 0 /*RRPLS_Unknown*/;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "id"), S("ID"), 0));
    pComp.Value$StdNamingDefaultAdapt$u32$u32($.mkNamingAdapt$ru32$pi8$u32$b$b(P(this, "iTotalPlayingTime"), S("TotalPlayingTime"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "iScoreOld"), S("SettlementScoreOld"), -1));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "iScoreNew"), S("SettlementScoreNew"), -1));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "iLeagueScoreNew"), S("Score"), -1));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "iLeagueScoreGain"), S("GameScore"), -1));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "iLeagueRankNew"), S("Rank"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "iLeagueRankSymbolNew"), S("RankSymbol"), 0));
    pComp.Value$StdNamingDefaultAdapt$StdCopyStrBuf$StdCopyStrBuf($.mkNamingAdapt$rStdCopyStrBuf$pi8$StdCopyStrBuf$b$b(this.sLeagueProgressData, S("LeagueProgressData"), new $.StdCopyStrBuf()));
    const LeagueStatusEntries = $own([((($o) => ($o.Name = S(""), $o.Val = 0 /*RRPLS_Unknown*/, $o))(new $.StdEnumEntry$i32$9())), ((($o) => ($o.Name = S("Lost"), $o.Val = 1 /*RRPLS_Lost*/, $o))(new $.StdEnumEntry$i32$9())), ((($o) => ($o.Name = S("Won"), $o.Val = 2 /*RRPLS_Won*/, $o))(new $.StdEnumEntry$i32$9()))]);
    pComp.Value$StdNamingDefaultAdapt$StdEnumAdapt$i32$u8$i32$5($.mkNamingAdapt$mStdEnumAdapt$i32$u8$pi8$i32$b$b$5($.mkEnumAdaptT$6(P(this, "eLeagueStatus"), $oat(LeagueStatusEntries, 0)), S("Status"), 0 /*RRPLS_Unknown*/));
  }

  GetID() {
    return this.id;
  }

  GetBigIcon() {
    return this.fctBigIcon;
  }

  GetTotalPlayingTime() {
    return this.iTotalPlayingTime;
  }

  IsScoreOldValid() {
    return this.iScoreOld >= 0;
  }

  GetScoreOld() {
    return this.iScoreOld;
  }

  IsScoreNewValid() {
    return this.iScoreNew >= 0;
  }

  GetScoreNew() {
    return this.iScoreNew;
  }

  GetCustomEvaluationStrings() {
    return this.sCustomEvaluationStrings.getData();
  }

  GetLeagueScoreNew() {
    return this.iLeagueScoreNew;
  }

  IsLeagueScoreNewValid() {
    return this.iLeagueScoreNew >= 0;
  }

  GetLeagueScoreGain() {
    return this.iLeagueScoreGain;
  }

  GetLeagueRankNew() {
    return this.iLeagueRankNew;
  }

  GetLeagueRankSymbolNew() {
    return this.iLeagueRankSymbolNew;
  }

  GetLeaguePerformance() {
    return this.iLeaguePerformance;
  }

  EvaluateLeague(pLeaguePlayerInfo) {
    0;
    this.iLeagueScoreNew = pLeaguePlayerInfo.iLeagueScoreNew;
    this.iLeagueScoreGain = pLeaguePlayerInfo.iLeagueScoreGain;
    this.iLeagueRankNew = pLeaguePlayerInfo.iLeagueRankNew;
    this.iLeagueRankSymbolNew = pLeaguePlayerInfo.iLeagueRankSymbolNew;
    this.sLeagueProgressData.$assign(pLeaguePlayerInfo.sLeagueProgressData);
  }

  EvaluatePlayer(pPlr) {
    0;
    this.iTotalPlayingTime = pPlr.TotalPlayingTime >>> 0;
    if (pPlr.Evaluated) {
      this.iScoreNew = pPlr.TotalScore;
      this.iScoreOld = this.iScoreNew - pPlr.LastRound.FinalScore | 0;
    } else {
      this.iScoreOld = pPlr.TotalScore;
    }
    $.C4FacetSurface.prototype.Clear.call(this.fctBigIcon);
    if (pPlr.BigIcon.Surface != null) {
      this.fctBigIcon.Create(ftoi32(pPlr.BigIcon.Wdt), ftoi32(pPlr.BigIcon.Hgt));
      pPlr.BigIcon.Draw$rC4Facet$b$i32$i32$b(this.fctBigIcon);
    }
    let pInfo = pPlr.GetInfo();
    if (pInfo != null) {
      this.sLeagueProgressData.Copy$pi8(pInfo.GetLeagueProgressData());
    }
  }

  SetID(idNew) {
    this.id = idNew;
  }

  AddCustomEvaluationString(szCustomString) {
    if (this.sCustomEvaluationStrings.getLength() !== 0) {
      this.sCustomEvaluationStrings.Append$pi8(S("   "));
    }
    this.sCustomEvaluationStrings.Append$pi8(szCustomString);
  }

  SetLeaguePerformance(iNewPerf) {
    this.iLeaguePerformance = iNewPerf;
  }

  op_eq(cmp) {
    if (this.id !== cmp.id) {
      return false;
    }
    if (this.iTotalPlayingTime !== cmp.iTotalPlayingTime) {
      return false;
    }
    if (this.iScoreOld !== cmp.iScoreOld) {
      return false;
    }
    if (this.iScoreNew !== cmp.iScoreNew) {
      return false;
    }
    if (this.sCustomEvaluationStrings.op_ne$StdStrBuf(cmp.sCustomEvaluationStrings)) {
      return false;
    }
    if (this.iLeagueScoreNew !== cmp.iLeagueScoreNew) {
      return false;
    }
    if (this.iLeagueScoreGain !== cmp.iLeagueScoreGain) {
      return false;
    }
    if (this.iLeagueRankNew !== cmp.iLeagueRankNew) {
      return false;
    }
    if (this.iLeagueRankSymbolNew !== cmp.iLeagueRankSymbolNew) {
      return false;
    }
    if (this.eLeagueStatus !== cmp.eLeagueStatus) {
      return false;
    }
    if (this.sLeagueProgressData.op_ne$StdStrBuf(cmp.sLeagueProgressData)) {
      return false;
    }
    return true;
  }

  $copy(cpy) {
    this.id = 0;
    this.fctBigIcon = new $.C4FacetSurface().init();
    this.iTotalPlayingTime = 0;
    this.iScoreOld = -1;
    this.iScoreNew = -1;
    this.sCustomEvaluationStrings = new $.StdCopyStrBuf();
    this.iLeagueScoreNew = -1;
    this.iLeagueScoreGain = 0;
    this.iLeagueRankNew = 0;
    this.iLeagueRankSymbolNew = 0;
    this.iLeaguePerformance = 0;
    this.sLeagueProgressData = new $.StdCopyStrBuf();
    this.eLeagueStatus = 0 /*RRPLS_Unknown*/;
    C4RoundResultsPlayer.prototype.$assign.call(this, cpy);
    return this;
  }
  $clone() { return new C4RoundResultsPlayer().$copy(this); }
  $assign(cpy) {
    if (this === cpy) {
      return this;
    }
    this.id = cpy.id;
    this.iTotalPlayingTime = cpy.iTotalPlayingTime;
    this.iScoreOld = cpy.iScoreOld;
    this.iScoreNew = cpy.iScoreNew;
    this.sCustomEvaluationStrings.$assign(cpy.sCustomEvaluationStrings);
    this.iLeagueScoreNew = cpy.iLeagueScoreNew;
    this.iLeagueScoreGain = cpy.iLeagueScoreGain;
    this.iLeagueRankNew = cpy.iLeagueRankNew;
    this.iLeagueRankSymbolNew = cpy.iLeagueRankSymbolNew;
    this.eLeagueStatus = cpy.eLeagueStatus;
    this.sLeagueProgressData.$assign(cpy.sLeagueProgressData);
    return this;
  }
}

export class C4RoundResultsPlayers {
  ppPlayers = null;
  iPlayerCount = 0;
  iPlayerCapacity = 0;

  $dtor() {
    C4RoundResultsPlayers.prototype.Clear.call(this);
  }

  Clear() {
    while (this.iPlayerCount !== 0) {
      $delete(this.ppPlayers.a[this.ppPlayers.o + (this.iPlayerCount = this.iPlayerCount - 1 | 0)]);
    }
    $delete(this.ppPlayers);
    this.ppPlayers = null;
    this.iPlayerCapacity = 0;
  }

  CompileFunc(pComp) {
    let deserializing = pComp.isDeserializer();
    if (deserializing) {
      this.Clear();
    }
    const iTemp = [this.iPlayerCount];
    pComp.Value$StdNamingCountAdapt$i32($.mkNamingCountAdapt$ri32$pi8(P(iTemp, 0), S("Player")));
    if (iTemp[0] < 0 || iTemp[0] > 5000) {
      pComp.excCorrupt(S("player count out of range"));
      return;
    }
    if (deserializing && iTemp[0] > this.iPlayerCapacity) {
      this.GrowList($u64n(iTemp[0] - this.iPlayerCapacity | 0));
      this.iPlayerCount = iTemp[0];
      $.ZeroMem$ppC4RoundResultsPlayer$u64(this.ppPlayers, 8 * $u64n(this.iPlayerCount));
    }
    pComp.Value$StdNamingAdapt$StdArrayAdapt$pC4RoundResultsPlayer$StdPtrAdapt$C4RoundResultsPlayer($.mkNamingAdapt$mStdArrayAdapt$pC4RoundResultsPlayer$StdPtrAdapt$C4RoundResultsPlayer$pi8($.mkArrayAdaptMap$ppC4RoundResultsPlayer$i32$x(this.ppPlayers, this.iPlayerCount, $.mkPtrAdaptNoNull$rpC4RoundResultsPlayer), S("Player")));
    $.mkPtrAdaptNoNull$rpC4RoundResultsPlayer(this.ppPlayers);
  }

  GrowList(iByVal) {
    let ppNew = P(new Array($u64n(this.iPlayerCapacity = $u64n(this.iPlayerCapacity) + iByVal | 0)).fill(null), 0);
    if (this.ppPlayers != null) {
      c$memcpy(ppNew, this.ppPlayers, $u64n(this.iPlayerCount) * 8);
      $delete(this.ppPlayers);
    }
    this.ppPlayers = ppNew;
  }

  GetByIndex(idx) {
    if (idx >= 0 && idx < this.iPlayerCount) {
      return this.ppPlayers.a[this.ppPlayers.o + idx];
    } else {
      return null;
    }
  }

  GetByID(id) {
    for (let idx = 0; idx < this.iPlayerCount; idx = idx + 1 | 0) {
      if (this.ppPlayers.a[this.ppPlayers.o + idx].GetID() === id) {
        return this.ppPlayers.a[this.ppPlayers.o + idx];
      }
    }
    return null;
  }

  GetCount() {
    return this.iPlayerCount;
  }

  Add(pNewPlayer) {
    let $t1;
    0;
    if (this.iPlayerCount === this.iPlayerCapacity) {
      this.GrowList(4);
    }
    this.ppPlayers.a[this.ppPlayers.o + ($t1 = this.iPlayerCount, this.iPlayerCount = this.iPlayerCount + 1 | 0, $t1)] = pNewPlayer;
  }

  GetCreateByID(id) {
    0;
    let pPlr = this.GetByID(id);
    if (pPlr == null) {
      pPlr = new C4RoundResultsPlayer().init();
      pPlr.SetID(id);
      this.Add(pPlr);
    }
    return pPlr;
  }

  op_eq(cmp) {
    if (this.iPlayerCount !== cmp.iPlayerCount) {
      return false;
    }
    for (let i = 0; i < this.iPlayerCount; i = i + 1 | 0) {
      if (!this.ppPlayers.a[this.ppPlayers.o + i].op_eq(cmp.ppPlayers.a[cmp.ppPlayers.o + i])) {
        return false;
      }
    }
    return true;
  }

  $copy(cpy) {
    this.ppPlayers = null;
    this.iPlayerCount = 0;
    this.iPlayerCapacity = 0;
    C4RoundResultsPlayers.prototype.$assign.call(this, cpy);
    return this;
  }
  $clone() { return new C4RoundResultsPlayers().$copy(this); }
  $assign(cpy) {
    let $t1;
    this.Clear();
    let pPlr = null;
    let i = 0;
    while ((pPlr = cpy.GetByIndex(($t1 = i, i = i + 1 | 0, $t1))) != null) {
      this.Add(new C4RoundResultsPlayer().$copy(pPlr));
    }
    return this;
  }
}

export class C4RoundResults {
  Players = new C4RoundResultsPlayers();
  Goals = new $.C4IDList().init();
  FulfilledGoals = new $.C4IDList().init();
  iPlayingTime = 0;
  iLeaguePerformance = 0;
  fHideSettlementScore = false;
  sNetResult = new $.StdCopyStrBuf();
  eNetResult = 0;
  sCustomEvaluationStrings = new $.StdCopyStrBuf();
  Statistics = new $.StdCopyStrBuf();

  init() {
    this.Players = new C4RoundResultsPlayers();
    this.Goals = new $.C4IDList().init();
    this.FulfilledGoals = new $.C4IDList().init();
    this.iPlayingTime = 0;
    this.sNetResult = new $.StdCopyStrBuf();
    this.sCustomEvaluationStrings = new $.StdCopyStrBuf();
    this.Statistics = new $.StdCopyStrBuf();
    return this;
  }

  $dtor() {
    C4RoundResults.prototype.Clear.call(this);
  }

  Clear() {
    this.Players.Clear();
    this.Goals.Clear();
    this.iPlayingTime = 0;
    this.sCustomEvaluationStrings.Clear();
    this.iLeaguePerformance = 0;
    this.sNetResult.Clear();
    this.eNetResult = 0 /*NR_None*/;
    this.fHideSettlementScore = false;
    this.Statistics.Clear();
  }

  Init() {
    if ($.Game.C4S.Game.IsMelee()) {
      this.fHideSettlementScore = true;
    } else {
      this.fHideSettlementScore = false;
    }
  }

  CompileFunc(pComp) {
    let deserializing = pComp.isDeserializer();
    if (deserializing) {
      this.Clear();
    }
    pComp.Value$StdNamingDefaultAdapt$C4IDList$C4IDList($.mkNamingAdapt$rC4IDList$pi8$C4IDList$b$b(this.Goals, S("Goals"), new $.C4IDList().init()));
    pComp.Value$StdNamingDefaultAdapt$u32$u32($.mkNamingAdapt$ru32$pi8$u32$b$b(P(this, "iPlayingTime"), S("PlayingTime"), 0));
    pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "fHideSettlementScore"), S("HideSettlementScore"), $.Game.C4S.Game.IsMelee()));
    pComp.Value$StdNamingDefaultAdapt$StdCopyStrBuf$StdCopyStrBuf($.mkNamingAdapt$rStdCopyStrBuf$pi8$StdCopyStrBuf$b$b(this.sCustomEvaluationStrings, S("CustomEvaluationStrings"), new $.StdCopyStrBuf()));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "iLeaguePerformance"), S("LeaguePerformance"), 0));
    pComp.Value$StdNamingDefaultAdapt$C4RoundResultsPlayers$C4RoundResultsPlayers($.mkNamingAdapt$rC4RoundResultsPlayers$pi8$C4RoundResultsPlayers$b$b(this.Players, S("PlayerInfos"), new C4RoundResultsPlayers()));
    pComp.Value$StdNamingDefaultAdapt$StdCopyStrBuf$StdCopyStrBuf($.mkNamingAdapt$rStdCopyStrBuf$pi8$StdCopyStrBuf$b$b(this.sNetResult, S("NetResult"), new $.StdCopyStrBuf()));
    const NetResultEntries = $own([((($o) => ($o.Name = S(""), $o.Val = 0 /*NR_None*/, $o))(new $.StdEnumEntry$i32$8())), ((($o) => ($o.Name = S("LeagueOK"), $o.Val = 1 /*NR_LeagueOK*/, $o))(new $.StdEnumEntry$i32$8())), ((($o) => ($o.Name = S("LeagueError"), $o.Val = 2 /*NR_LeagueError*/, $o))(new $.StdEnumEntry$i32$8())), ((($o) => ($o.Name = S("NetError"), $o.Val = 3 /*NR_NetError*/, $o))(new $.StdEnumEntry$i32$8()))]);
    pComp.Value$StdNamingDefaultAdapt$StdEnumAdapt$i32$u8$i32$4($.mkNamingAdapt$mStdEnumAdapt$i32$u8$pi8$i32$b$b$4($.mkEnumAdaptT$5(P(this, "eNetResult"), $oat(NetResultEntries, 0)), S("NetResult"), 0 /*NR_None*/));
  }

  static EvaluateGoals(GoalList, FulfilledGoalList, iPlayerNumber$) {
    const iPlayerNumber = [iPlayerNumber$];
    GoalList.Clear();
    FulfilledGoalList.Clear();
    let cnt = 0;
    let idGoal = new $.C4ID().init$v();
    for (cnt = 0; idGoal.$assign($.Objects.GetListID(32, cnt)).op_unsigned_long_C4ID_() != null; cnt = cnt + 1 | 0) {
      let fFulfilled = false;
      ;
      let pObj = $.C4Id2Def(idGoal.$clone()) != null ? $.Objects.Find($.Definitions.ID2Def(idGoal.$clone())) : null;
      if (pObj != null) {
        let pars = new $.C4AulParSet().init$ri32(P(iPlayerNumber, 0));
        fFulfilled = !pObj.Call$pi8$pC4AulParSet$b(S("~IsFulfilled"), pars.op_and()).op_not();
      }
      GoalList.SetIDCount(idGoal.$clone(), cnt, true);
      if (fFulfilled) {
        FulfilledGoalList.SetIDCount(idGoal.$clone(), 1, true);
      }
    }
  }

  EvaluateGame() {
    let pFirstLocalPlayer = $.Players.GetLocalByIndex(0);
    let iFirstLocalPlayer = pFirstLocalPlayer != null ? pFirstLocalPlayer.Number : $.NO_OWNER$C4Constants;
    C4RoundResults.EvaluateGoals(this.Goals, this.FulfilledGoals, iFirstLocalPlayer);
    this.iPlayingTime = $.Game.Time >>> 0;
    try {
      let Pars = new $.C4AulParSet().init$v();
      let stats = $.ScriptEngine.GetPropList().Call$pi8$pC4AulParSet$b(S("CollectStatistics"), Pars.op_and());
      if (stats.op_ne($.C4VNull)) {
        this.Statistics.op_assign$StdStrBuf(stats.ToJSON());
      }
    } catch ($e1) {
      if ($e1 instanceof $.C4JSONSerializationError) {
        const e = $e1;
        $.DebugLogF(S("ERROR: cannot serialize CollectStatistics() result: %s"), e.what());
      } else {
        throw $e1;
      }
    }
  }

  EvaluateLeague(szResultMsg, fSuccess, rLeagueInfo) {
    let $t1;
    $.Game.RoundResults.EvaluateNetwork(fSuccess ? 1 /*NR_LeagueOK*/ : 2 /*NR_LeagueError*/, szResultMsg);
    let pPlr = null;
    let pOwnPlr = null;
    let i = 0;
    while ((pPlr = rLeagueInfo.GetByIndex(($t1 = i, i = i + 1 | 0, $t1))) != null) {
      pOwnPlr = this.Players.GetCreateByID(pPlr.GetID());
      pOwnPlr.EvaluateLeague(pPlr);
    }
  }

  EvaluatePlayer(pPlr) {
    0;
    let pOwnPlr = this.Players.GetCreateByID(pPlr.ID);
    pOwnPlr.EvaluatePlayer(pPlr);
  }

  EvaluateNetwork(eNetResult, szResultMsg) {
    if (!this.HasNetResult()) {
      this.eNetResult = eNetResult;
      if (szResultMsg != null) {
        this.sNetResult.Copy$pi8(szResultMsg);
      } else {
        this.sNetResult.Clear();
      }
    }
  }

  AddCustomEvaluationString(szCustomString, idPlayer) {
    if (idPlayer === 0) {
      if (this.sCustomEvaluationStrings.getLength() !== 0) {
        this.sCustomEvaluationStrings.AppendChar(124);
      }
      this.sCustomEvaluationStrings.Append$pi8(szCustomString);
    } else {
      let pOwnPlr = this.Players.GetCreateByID(idPlayer);
      pOwnPlr.AddCustomEvaluationString(szCustomString);
    }
  }

  HideSettlementScore(fHide = true) {
    this.fHideSettlementScore = fHide;
  }

  SettlementScoreIsHidden() {
    return this.fHideSettlementScore;
  }

  SetLeaguePerformance(iNewPerf, idPlayer = 0) {
    if (idPlayer === 0) {
      this.iLeaguePerformance = iNewPerf;
    } else {
      let pOwnPlr = this.Players.GetCreateByID(idPlayer);
      pOwnPlr.SetLeaguePerformance(iNewPerf);
    }
  }

  GetLeaguePerformance(idPlayer = 0) {
    if (idPlayer === 0) {
      return this.iLeaguePerformance;
    } else {
      let pPlr = this.Players.GetByID(idPlayer);
      if (pPlr != null) {
        return pPlr.GetLeaguePerformance();
      }
    }
    return 0;
  }

  GetStatistics() {
    return new $.StdCopyStrBuf().init$StdCopyStrBuf$b(this.Statistics);
  }

  GetPlayers() {
    return this.Players;
  }

  GetCustomEvaluationStrings() {
    return this.sCustomEvaluationStrings.getData();
  }

  GetNetResult() {
    return this.eNetResult;
  }

  GetNetResultString() {
    return this.sNetResult.getData();
  }

  HasNetResult() {
    return this.eNetResult !== 0;
  }

  Load(hGroup, szFilename = S("RoundResults.txt")) {
    this.Clear();
    let Buf = new $.StdStrBuf();
    if (!hGroup.LoadEntryString$pi8$pStdStrBuf(szFilename, Buf)) {
      return false;
    }
    if (!$.CompileFromBuf_LogWarn$mStdNamingAdapt$C4RoundResults$x$pi8($.mkNamingAdapt$rC4RoundResults$pi8(this, S("RoundResults")), Buf, szFilename)) {
      return false;
    }
    return true;
  }

  Save(hGroup, szFilename = S("RoundResults.txt")) {
    hGroup.DeleteEntry(szFilename);
    try {
      let Buf = $.DecompileToBuf$StdNamingAdapt$C4RoundResults($.mkNamingAdapt$rC4RoundResults$pi8(this, S("RoundResults")));
      if (Buf.getLength() !== 0) {
        if (!hGroup.Add$pi8$rStdStrBuf$b$b$b(szFilename, Buf, false, true)) {
          return false;
        }
      }
    } catch ($e1) {
      if ($e1 instanceof $.StdCompiler$Exception) {
        return false;
      } else {
        throw $e1;
      }
    }
    return true;
  }

  GetGoals() {
    return this.Goals;
  }

  GetFulfilledGoals() {
    return this.FulfilledGoals;
  }

  $clone() { return new C4RoundResults().$assign(this); }
  $assign(o) {
    this.Players.$assign(o.Players);
    this.Goals.$assign(o.Goals);
    this.FulfilledGoals.$assign(o.FulfilledGoals);
    this.iPlayingTime = o.iPlayingTime;
    this.iLeaguePerformance = o.iLeaguePerformance;
    this.fHideSettlementScore = o.fHideSettlementScore;
    this.sNetResult.$assign(o.sNetResult);
    this.eNetResult = o.eNetResult;
    this.sCustomEvaluationStrings.$assign(o.sCustomEvaluationStrings);
    this.Statistics.$assign(o.Statistics);
    return this;
  }
}

export class C4PacketLeagueRoundResults extends C4PacketBase {
  Players = new C4RoundResultsPlayers();
  sResultsString = new $.StdCopyStrBuf();
  fSuccess = false;

  init$v() {
    this.Players = new C4RoundResultsPlayers();
    this.sResultsString = new $.StdCopyStrBuf();
    this.fSuccess = false;
    return this;
  }

  init$pi8$b$C4RoundResultsPlayers(szResultsString, fSuccess, Players) {
    this.Players = new C4RoundResultsPlayers().$copy(Players);
    this.sResultsString = new $.StdCopyStrBuf().init$pi8$b(szResultsString);
    this.fSuccess = fSuccess;
    return this;
  }

  init$pi8$b(szResultsString, fSuccess) {
    this.Players = new C4RoundResultsPlayers();
    this.sResultsString = new $.StdCopyStrBuf().init$pi8$b(szResultsString);
    this.fSuccess = fSuccess;
    return this;
  }

  CompileFunc$pStdCompiler(pComp) {
    pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "fSuccess"), S("Success"), false));
    pComp.Value$StdNamingDefaultAdapt$StdCopyStrBuf$StdCopyStrBuf($.mkNamingAdapt$rStdCopyStrBuf$pi8$StdCopyStrBuf$b$b(this.sResultsString, S("ResultString"), new $.StdCopyStrBuf()));
    pComp.Value$rC4RoundResultsPlayers(this.Players);
  }

  $clone() { return new C4PacketLeagueRoundResults().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.Players.$assign(o.Players);
    this.sResultsString.$assign(o.sResultsString);
    this.fSuccess = o.fSuccess;
    return this;
  }
}

export function $init(): void {
}

Object.assign($, { C4PacketLeagueRoundResults, C4RoundResults, C4RoundResultsPlayer, C4RoundResultsPlayers });
