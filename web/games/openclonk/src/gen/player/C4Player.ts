// @ts-nocheck
// OpenClonk 36de799: src/player/C4Player.cpp, src/player/C4Player.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { C4PlayerInfoCore } from '../object/C4InfoCore.ts';
import { $u64n } from '../../rt/int.ts';
import { c$atoi, c$time } from '../../rt/libc.ts';
import { Random } from '../../rt/native.ts';
import { $padd, $rd, $wr, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete, $max, StdSet } from '../../rt/std.ts';

export class C4Player$HostilitySet extends StdSet {

  CompileFunc(pComp) {
    let $t1, $t2, $t3, $t4;
    const entries = [this.size() | 0];
    if (pComp.isDeserializer()) {
      this.clear();
      pComp.Value$ri32(P(entries, 0));
      while (($t1 = entries[0], entries[0] = entries[0] - 1 | 0, $t1) !== 0) {
        const number = [0];
        pComp.Value$ri32(P(number, 0));
        0;
        let plr = $.Players.Get(number[0]);
        if (plr != null) {
          this.insert(plr);
        }
      }
    } else {
      pComp.Value$ri32(P(entries, 0));
      $t2 = this;
      $t3 = $t2.begin();
      $t4 = $t2.end();
      for (; !$t3.eq($t4); $t3.inc()) {
        const it = $t3.v;
        const num = [it.Number];
        pComp.Value$ri32(P(num, 0));
      }
    }
  }

  $clone() { return new C4Player$HostilitySet().$assign(this); }
  $assign(o) {
    this.items = o.items.slice();
    return this;
  }
}

export class C4Player extends C4PlayerInfoCore {
  Filename = new Int8Array(4097);
  Name = new $.StdStrBuf();
  Status = 0;
  Eliminated = 0;
  Surrendered = 0;
  Evaluated = false;
  Number = 0;
  ID = 0;
  Team = 0;
  ColorDw = 0;
  ControlSet = null;
  ControlSetName = new $.StdCopyStrBuf();
  MouseControl = 0;
  Position = 0;
  PlrStartIndex = 0;
  RetireDelay = 0;
  GameJoinTime = 0;
  AtClient = 0;
  AtClientName = new Int8Array(513);
  LocalControl = false;
  LeagueEvaluated = false;
  NoEliminationCheck = false;
  Menu = new $.C4MainMenu().init();
  ViewMode = 0;
  ViewX = new $.C4Fixed();
  ViewY = new $.C4Fixed();
  ViewLock = false;
  ViewTarget = null;
  ShowStartup = false;
  FlashCom = 0;
  fFogOfWar = false;
  ZoomLimitMinWdt = 0;
  ZoomLimitMinHgt = 0;
  ZoomLimitMaxWdt = 0;
  ZoomLimitMaxHgt = 0;
  ZoomWdt = 0;
  ZoomHgt = 0;
  ZoomLimitMinVal = new $.C4Fixed();
  ZoomLimitMaxVal = new $.C4Fixed();
  ZoomVal = new $.C4Fixed();
  Wealth = 0;
  CurrentScore = 0;
  InitialScore = 0;
  ObjectsOwned = 0;
  Hostility = new C4Player$HostilitySet();
  BaseMaterial = new $.C4IDList().init();
  BaseProduction = new $.C4IDList().init();
  ProductionDelay = 0;
  ProductionUnit = 0;
  CrewInfoList = new $.C4ObjectInfoList().init();
  Crew = new $.C4ObjectList().init();
  Knowledge = new $.C4IDList().init();
  Control = new $.C4PlayerControl().init();
  Cursor = new $.C4ObjectPtr().init$v();
  ViewCursor = new $.C4ObjectPtr().init$v();
  CursorFlash = 0;
  pGamepad = null;
  MessageStatus = 0;
  MessageBuf = new Int8Array(257);
  pMsgBoardQuery = null;
  BigIcon = new $.C4FacetSurface().init();
  SoundModifier = new $.C4Value().init$v();
  Next = null;
  pstatControls = null;
  pstatActions = null;
  ControlCount = 0;
  ActionCount = 0;
  LastControlType = 0;
  LastControlID = 0;

  init() {
    super.init();
    this.Name = new $.StdStrBuf();
    this.ControlSetName = new $.StdCopyStrBuf();
    this.Menu = new $.C4MainMenu().init();
    this.ViewX = new $.C4Fixed();
    this.ViewY = new $.C4Fixed();
    this.ZoomLimitMinVal = new $.C4Fixed();
    this.ZoomLimitMaxVal = new $.C4Fixed();
    this.ZoomVal = new $.C4Fixed();
    this.Hostility = new C4Player$HostilitySet();
    this.BaseMaterial = new $.C4IDList().init();
    this.BaseProduction = new $.C4IDList().init();
    this.CrewInfoList = new $.C4ObjectInfoList().init();
    this.Crew = new $.C4ObjectList().init();
    this.Knowledge = new $.C4IDList().init();
    this.Control = new $.C4PlayerControl().init();
    this.Cursor = new $.C4ObjectPtr().init$v();
    this.ViewCursor = new $.C4ObjectPtr().init$v();
    this.pGamepad = null;
    this.BigIcon = new $.C4FacetSurface().init();
    this.SoundModifier = new $.C4Value().init$v();
    this.Filename[0] = 0;
    this.Number = -5;
    this.ID = 0;
    this.Team = 0;
    C4Player.prototype.DefaultRuntimeData.call(this);
    this.Menu.Default();
    this.Crew.Default();
    this.CrewInfoList.Default();
    this.LocalControl = false;
    $.C4FacetSurface.prototype.Default.call(this.BigIcon);
    this.Next = null;
    this.fFogOfWar = true;
    this.LeagueEvaluated = false;
    this.GameJoinTime = 0;
    this.pstatControls = this.pstatActions = null;
    this.ControlCount = this.ActionCount = 0;
    this.LastControlType = 0 /*PCID_None*/;
    this.LastControlID = 0;
    this.pMsgBoardQuery = null;
    this.NoEliminationCheck = false;
    this.Evaluated = false;
    this.ZoomLimitMinWdt = this.ZoomLimitMinHgt = this.ZoomLimitMaxWdt = this.ZoomLimitMaxHgt = this.ZoomWdt = this.ZoomHgt = 0;
    this.ZoomLimitMinVal.$assign(this.ZoomLimitMaxVal.$assign(this.ZoomVal.$assign($.Fix0$C4Real)));
    this.ViewLock = true;
    this.SoundModifier.Set0();
    return this;
  }

  $dtor() {
    C4Player.prototype.ClearGraphs.call(this);
    this.Menu.Clear$v();
    C4Player.prototype.SetSoundModifier.call(this, null);
    while (this.pMsgBoardQuery != null) {
      let pNext = this.pMsgBoardQuery.pNext;
      $delete(this.pMsgBoardQuery);
      this.pMsgBoardQuery = pNext;
    }
    C4Player.prototype.ClearControl.call(this);
  }

  GetName() {
    return this.Name.getData();
  }

  GetType() {
    let pInfo = $.Game.PlayerInfos.GetPlayerInfoByID$i32(this.ID);
    if (pInfo != null) {
      return pInfo.GetType();
    } else {
      0;
      return 1 /*C4PT_User*/;
    }
  }

  Eliminate() {
    if (this.Eliminated !== 0) {
      return;
    }
    this.Eliminated = 1;
    this.RetireDelay = 60;
    $.StartSoundEffect(S("UI::Eliminated"));
    $.Log($.FormatString($.LoadResStr(S("IDS_PRC_PLRELIMINATED")), this.GetName()).getData());
    if ($.Control$2.isCtrlHost() && this.AtClient > 0 && $.Application.isEditor === 0) {
      let pPlr = null;
      for (let i = 0; (pPlr = $.Players.GetAtClient$i32$i32(this.AtClient, i)) != null; i = i + 1 | 0) {
        if (pPlr.Eliminated === 0) {
          break;
        }
      }
      if (pPlr == null) {
        $.Control$2.DoInput(129 /*CID_ClientUpdate*/, new $.C4ControlClientUpdate().init$i32$i32$i32(this.AtClient, 0 /*CUT_Activate*/, 0), 1 /*CDT_Sync*/);
      }
    }
  }

  ClearPointers(pObj, _fDeath) {
    while (this.Crew.Remove(pObj)) {
    }
    if (this.ViewCursor.op_eq$pC4Object(pObj)) {
      this.ViewCursor.op_assign(null);
    }
    if (this.ViewTarget === pObj) {
      this.ViewTarget = null;
    }
    if (this.Cursor.op_eq$pC4Object(pObj)) {
      this.Cursor.op_assign(null);
      this.AdjustCursorCommand();
    }
    $.C4Menu.prototype.ClearPointers.call(this.Menu, pObj);
    this.RemoveMessageBoardQuery(pObj);
  }

  Execute() {
    if (this.Status === 0) {
      return;
    }
    if (this.Status === 2) {
      let idSelectedTeam = 0;
      if ((idSelectedTeam = $.Game.Teams.GetForcedTeamSelection(this.ID)) !== 0) {
        if (this.Menu.IsActive$v() && this.Menu.GetIdentification() === 3) {
          this.Menu.TryClose(false, false);
        }
        if (this.LocalControl && !$.Control$2.isReplay()) {
          this.DoTeamSelection(idSelectedTeam);
        }
      } else if (!this.Menu.IsActive$v()) {
        this.ActivateMenuTeamSelection(false);
      } else {
        let pSelectedTeamItem = null;
        if ((pSelectedTeamItem = this.Menu.GetSelectedItem()) != null) {
          let idSelectedTeam$2 = c$atoi($padd(pSelectedTeamItem.GetCommand(), 8));
          if (idSelectedTeam$2 !== 0) {
            let pSelectedTeam = null;
            if ((pSelectedTeam = $.Game.Teams.GetTeamByID(idSelectedTeam$2)) != null) {
              let iPlrStartIndex = pSelectedTeam.GetPlrStartIndex();
              if (iPlrStartIndex !== 0 && $.Inside$i32$i32$i32$3(iPlrStartIndex, 1, 4)) {
                if ($.Game.C4S.PlrStart[iPlrStartIndex - 1 | 0].Position[0] > -1) {
                  this.ViewX.op_assign(Math.imul($.Game.C4S.PlrStart[iPlrStartIndex - 1 | 0].Position[0], $.Landscape.GetMapZoom()));
                  this.ViewY.op_assign(Math.imul($.Game.C4S.PlrStart[iPlrStartIndex - 1 | 0].Position[1], $.Landscape.GetMapZoom()));
                }
              }
            }
          }
        }
      }
    } else if (this.Menu.IsActive$v() && this.Menu.GetIdentification() === 3) {
      this.Menu.TryClose(false, false);
    }
    if (this.pGamepad != null) {
      if (!this.pGamepad.IsAttached()) {
        if (!this.FindGamepad()) {
          $.LogF(S("%s: No gamepad available."), this.Name.getData());
          $.Game.Pause();
        }
      }
    } else if (this.LocalControl && this.ControlSet != null && this.ControlSet.HasGamepad()) {
      this.FindGamepad();
    }
    this.UpdateView();
    this.ExecuteControl();
    $.C4Menu.prototype.Execute$v.call(this.Menu);
    if ($.Game.iTick35 === 0 && this.Status === 1) {
      this.ExecBaseProduction();
      this.CheckElimination();
      if (this.pMsgBoardQuery != null && this.LocalControl) {
        this.ExecMsgBoardQueries();
      }
    }
    if (this.MessageStatus > 0) {
      this.MessageStatus = this.MessageStatus - 1 | 0;
    }
    if (this.RetireDelay > 0) {
      this.RetireDelay = this.RetireDelay - 1 | 0;
    }
    if (this.CursorFlash > 0) {
      this.CursorFlash = this.CursorFlash - 1 | 0;
    }
  }

  ExecuteControl() {
    this.Control.Execute();
  }

  SetViewMode(iMode, pTarget = null, immediate_position = false) {
    this.ViewMode = iMode;
    this.ViewTarget = pTarget;
    if (immediate_position) {
      this.UpdateView();
      let vp = $.Viewports.GetViewport(this.Number);
      if (vp != null) {
        vp.AdjustPosition(true);
      }
    }
  }

  ResetCursorView(immediate_position = false) {
    if (this.ViewCursor.op_not() && this.Cursor.op_not()) {
      return;
    }
    this.SetViewMode(0, null, immediate_position);
  }

  Evaluate() {
    if (this.Evaluated) {
      return;
    }
    let SuccessBonus = 100;
    this.LastRound.Title.$assign($.Game.ScenarioTitle);
    c$time(P(this.LastRound, "Date"));
    this.LastRound.Duration = $.Game.Time;
    this.LastRound.Won = this.Eliminated === 0 ? 1 : 0;
    if ($.Game.C4S.Game.IsMelee()) {
      this.LastRound.Score = $max(this.CurrentScore - this.InitialScore | 0, 0);
    } else {
      this.LastRound.Score = $max($.Players.AverageScoreGain(), 0);
    }
    this.LastRound.Level = 0;
    this.LastRound.Bonus = Math.imul(100, this.LastRound.Won);
    this.LastRound.FinalScore = this.LastRound.Score + this.LastRound.Bonus | 0;
    this.LastRound.TotalScore = this.TotalScore + this.LastRound.FinalScore | 0;
    this.Rounds = this.Rounds + 1 | 0;
    if (this.LastRound.Won !== 0) {
      this.RoundsWon = this.RoundsWon + 1 | 0;
    } else {
      this.RoundsLost = this.RoundsLost + 1 | 0;
    }
    this.TotalScore = this.LastRound.TotalScore;
    this.TotalPlayingTime = this.TotalPlayingTime + ($.Game.Time - this.GameJoinTime | 0) | 0;
    this.CrewInfoList.Evaluate();
    if ($.Game.Parameters.isLeague()) {
      this.EvaluateLeague(false, $.Game.GameOver && this.Eliminated === 0);
    }
    this.Evaluated = true;
    $.Game.RoundResults.EvaluatePlayer(this);
  }

  Surrender() {
    if (this.Surrendered !== 0) {
      return;
    }
    this.Surrendered = 1;
    this.Eliminated = 1;
    this.RetireDelay = 60;
    $.StartSoundEffect(S("UI::Eliminated"));
    $.Log($.FormatString($.LoadResStr(S("IDS_PRC_PLRSURRENDERED")), this.GetName()).getData());
  }

  ScrollView(iX, iY, ViewWdt, ViewHgt) {
    if (this.ViewLock) {
      return;
    }
    this.SetViewMode(2);
    let ViewportScrollBorder = Math.fround($.Application.isEditor !== 0 ? 0 : 40);
    this.ViewX.$assign($.Clamp$C4Fixed$C4Fixed$C4Fixed(this.ViewX.op_add$C4Fixed($.ftofix(iX)), $.ftofix(Math.fround(Math.fround(ViewWdt / 2) - ViewportScrollBorder)), $.ftofix(Math.fround(Math.fround(Math.fround($.Landscape.GetWidth()) + ViewportScrollBorder) - Math.fround(ViewWdt / 2)))));
    this.ViewY.$assign($.Clamp$C4Fixed$C4Fixed$C4Fixed(this.ViewY.op_add$C4Fixed($.ftofix(iY)), $.ftofix(Math.fround(Math.fround(ViewHgt / 2) - ViewportScrollBorder)), $.ftofix(Math.fround(Math.fround(Math.fround($.Landscape.GetHeight()) + ViewportScrollBorder) - Math.fround(ViewHgt / 2)))));
  }

  SetCursor(pObj, fSelectArrow) {
    if (pObj != null) {
      if (pObj.CrewDisabled) {
        return;
      }
    }
    let fChanged = pObj !== this.Cursor.op_C4Object_();
    let pPrev = this.Cursor.op_C4Object_();
    this.Cursor.op_assign(pObj);
    if (pPrev != null && fChanged) {
      pPrev.UnSelect();
    }
    if (fChanged && this.Cursor.op_C4Object_() != null) {
      this.Cursor.op_arrow().DoSelect();
    }
    if (fSelectArrow) {
      this.CursorFlash = 30;
    }
  }

  RemoveCrewObjects() {
    let pCrew = null;
    while ((pCrew = this.Crew.GetObject()) != null) {
      pCrew.AssignRemoval(true);
    }
  }

  FindNewOwner() {
    let iNewOwner = -1;
    let pTeam = null;
    if (this.Team !== 0) {
      if ((pTeam = $.Game.Teams.GetTeamByID(this.Team)) != null) {
        for (let i = 0; i < pTeam.GetPlayerCount(); i = i + 1 | 0) {
          let iPlrID = pTeam.GetIndexedPlayer(i);
          if (iPlrID !== 0 && iPlrID !== this.ID) {
            let pPlrInfo = $.Game.PlayerInfos.GetPlayerInfoByID$i32(iPlrID);
            if (pPlrInfo != null) {
              if (pPlrInfo.IsJoined()) {
                iNewOwner = pPlrInfo.GetInGameNumber();
                break;
              }
            }
          }
        }
      }
    }
    if (iNewOwner === -1) {
      for (let pOtherPlr = $.Players.First; pOtherPlr != null; pOtherPlr = pOtherPlr.Next) {
        if (pOtherPlr !== this) {
          if (pOtherPlr.Eliminated === 0) {
            if (!$.Players.Hostile(pOtherPlr.Number, this.Number)) {
              iNewOwner = pOtherPlr.Number;
            }
          }
        }
      }
    }
    return iNewOwner;
  }

  NotifyOwnedObjects() {
    let $t1, $t2, $t3;
    const iNewOwner = [this.FindNewOwner()];
    for (let pList = $.Objects; pList != null; pList = pList === $.Objects ? $.Objects.InactiveObjects : null) {
      $t1 = pList;
      $t2 = $t1.begin();
      $t3 = $t1.end();
      try {
        for (; $t2.op_ne($t3); $t2.op_inc$v()) {
          const cobj = $t2.op_mul();
          if (cobj.Status !== 0 && cobj.Owner === this.Number) {
            let pFn = cobj.GetFunc$pi8(S("~OnOwnerRemoved"));
            if (pFn != null) {
              let pars = new $.C4AulParSet().init$ri32(P(iNewOwner, 0));
              pFn.Exec$pC4PropList$pC4AulParSet$b(cobj, pars.op_and());
            } else {
              if (this.Crew.IsContained(cobj)) {
                continue;
              }
              if ((cobj.Category & 1) === 0) {
                cobj.SetOwner(iNewOwner[0]);
              }
            }
          }
        }
      } finally { $t2.$dtor(); $t3.$dtor(); }
    }
  }

  DefaultRuntimeData() {
    this.Status = 0;
    this.Eliminated = 0;
    this.Surrendered = 0;
    this.AtClient = -1;
    $.SCopy$pi8$pi8(S("Local"), P(this.AtClientName, 0));
    this.ControlSet = null;
    this.ControlSetName.Clear();
    this.MouseControl = 0;
    this.Position = -1;
    this.PlrStartIndex = 0;
    this.RetireDelay = 0;
    this.ViewMode = 0;
    this.ViewX.$assign(this.ViewY.op_assign(0));
    this.ViewTarget = null;
    this.ShowStartup = true;
    this.Wealth = 0;
    this.CurrentScore = this.InitialScore = 0;
    this.ObjectsOwned = 0;
    this.ProductionDelay = this.ProductionUnit = 0;
    this.Cursor.$assign(this.ViewCursor.op_assign(null));
    this.CursorFlash = 30;
    this.MessageStatus = 0;
    this.MessageBuf[0] = 0;
    this.Hostility.clear();
    this.BaseMaterial.Default();
    this.BaseProduction.Default();
    this.Knowledge.Default();
    this.FlashCom = 0;
  }

  DrawHostility(cgo, iIndex) {
    let pPlr = null;
    if ((pPlr = $.Players.GetByIndex$i32(iIndex)) != null) {
      $.GraphicsResource.fctCrewClr.DrawClr(cgo, true, pPlr.ColorDw);
      if (pPlr !== this) {
        if (!this.Hostility.find(pPlr).eq(this.Hostility.end())) {
          $.GraphicsResource.fctMenu.GetPhase(7).Draw$rC4Facet$b$i32$i32$b(cgo);
        }
      }
    }
  }

  AdjustCursorCommand() {
    this.ResetCursorView();
    if (this.Cursor.op_not() || this.Cursor.op_arrow().CrewDisabled) {
      let pHiRank = this.GetHiRankActiveCrew();
      if (pHiRank == null) {
        return;
      }
      this.SetCursor(pHiRank, true);
      this.UpdateView();
    }
  }

  DoScore(iChange) {
    this.CurrentScore = $.Clamp$i32$i32$i32(this.CurrentScore + iChange | 0, -100000, 100000);
    return true;
  }

  Init(iNumber, iAtClient, szAtClientName, szFilename, fScenarioInit, pInfo, numbers) {
    let $t1, $t2, $t3;
    if (pInfo == null) {
      $.LogF(S("ERROR: Init player %s failed: No info!"), szFilename);
      0;
      return false;
    }
    this.Status = 1;
    this.Number = iNumber;
    this.ID = pInfo.GetID();
    this.Team = pInfo.GetTeam();
    this.NoEliminationCheck = pInfo.IsNoEliminationCheck();
    this.AtClient = iAtClient;
    $.SCopy$pi8$pi8$u64(szAtClientName, P(this.AtClientName, 0), 512);
    if (szFilename != null) {
      if (!this.Load$pi8$b(szFilename, !fScenarioInit)) {
        return false;
      }
    } else {
      0;
    }
    this.Name.Copy$pi8(pInfo.GetName());
    this.ViewX.op_assign($.Landscape.GetWidth() / 2 | 0);
    this.ViewY.op_assign($.Landscape.GetHeight() / 2 | 0);
    if (fScenarioInit) {
      pInfo.SetJoined(iNumber);
      $.Players.RecheckPlayerSort(this);
      let pTeam = null;
      if (this.Team !== 0) {
        if ($.Game.Teams.IsAutoGenerateTeams()) {
          pTeam = $.Game.Teams.GetGenerateTeamByID(this.Team);
        } else {
          pTeam = $.Game.Teams.GetTeamByID(this.Team);
        }
      }
      if (pTeam == null && $.Game.Teams.IsRuntimeJoinTeamChoice()) {
        if (pInfo.GetType() === 2) {
          0;
        } else {
          this.Status = 2;
        }
      }
      this.ClearControl();
      this.InitControl();
      this.Control.Init();
      if (!pInfo.IsScenarioInitDesired()) {
        if (this.Team !== 0) {
          this.SetTeamHostility();
        }
        let idCallback = pInfo.GetScriptPlayerExtraID();
        let pDefCallback = null;
        if (idCallback.op_unsigned_long_C4ID_() != null && (pDefCallback = $.C4Id2Def(idCallback.$clone())) != null) {
          pDefCallback.Call$pi8$pC4AulParSet$b(S("~InitializeScriptPlayer"), new $.C4AulParSet().init$ri32$ri32(P(this, "Number"), P(this, "Team")).op_and());
        }
      } else {
        $.Game.GRBroadcast(S("~PreInitializePlayer"), new $.C4AulParSet().init$ri32(P(this, "Number")).op_and());
        if (this.Status !== 2) {
          if (!this.ScenarioInit()) {
            return false;
          }
        }
      }
    } else {
      0;
      0;
      if (!this.LoadRuntimeData($.Game.ScenarioFile, numbers) || this.ID === 0) {
        if (!$.Game.C4S.Head.SaveGame && pInfo.GetType() === 2) {
          this.Number = pInfo.GetInGameNumber();
          this.ColorDw = pInfo.GetColor();
          this.ID = pInfo.GetID();
          this.Team = pInfo.GetTeam();
        } else {
          return false;
        }
      }
      if (this.Number === -5) {
        this.Number = iNumber;
      }
      if (szFilename != null) {
        $.SCopy$pi8$pi8($.Config.AtUserDataPath(szFilename), P(this.Filename, 0));
      } else {
        $wr(P(this.Filename, 0), 0, 0);
      }
      this.AtClient = iAtClient;
      $.SCopy$pi8$pi8$u64(szAtClientName, P(this.AtClientName, 0), 512);
      $.Players.RecheckPlayerSort(this);
      this.InitControl();
    }
    this.GameJoinTime = $.Game.Time;
    $t1 = $.Objects;
    $t2 = $t1.begin();
    $t3 = $t1.end();
    try {
      for (; $t2.op_ne($t3); $t2.op_inc$v()) {
        const pObj = $t2.op_mul();
        if ((pObj.lightRange !== 0 || pObj.lightFadeoutRange !== 0) && pObj.Owner === -1) {
          pObj.UpdateLight();
        }
      }
    } finally { $t2.$dtor(); $t3.$dtor(); }
    if ($.Game.pNetworkStatistics != null) {
      this.CreateGraphs();
    }
    this.SetSoundModifier(this.SoundModifier.getPropList());
    return true;
  }

  ScenarioAndTeamInit(idTeam) {
    let pInfo = this.GetInfo();
    if (pInfo == null) {
      return false;
    }
    let pTeam = null;
    if (idTeam === -1) {
      if (!$.Game.Teams.IsAutoGenerateTeams()) {
        pTeam = null;
      } else {
        if ((pTeam = $.Game.Teams.GetGenerateTeamByID(idTeam)) != null) {
          idTeam = pTeam.GetID();
        }
      }
    } else {
      pTeam = $.Game.Teams.GetTeamByID(idTeam);
    }
    let pPrevTeam = $.Game.Teams.GetTeamByID(this.Team);
    if (pPrevTeam !== pTeam && idTeam !== 0) {
      if (!$.Game.Teams.IsJoin2TeamAllowed(idTeam, pInfo.GetType())) {
        pTeam = null;
      }
    }
    if (pTeam == null && idTeam !== 0) {
      this.OnTeamSelectionFailed();
      return false;
    }
    if (pPrevTeam != null) {
      pPrevTeam.RemovePlayerByID(pInfo.GetID());
    }
    if (pTeam != null) {
      pTeam.AddPlayer(pInfo, true);
    }
    if (!this.ScenarioInit()) {
      return false;
    }
    if (!this.FinalInit(false)) {
      return false;
    }
    $.Game.OnPlayerJoinFinished();
    return true;
  }

  ScenarioInit() {
    const ptx = [0];
    const pty = [0];
    this.PlrStartIndex = this.Number % 4;
    let pTeam = null;
    let i = 0;
    if (this.Team !== 0 && (pTeam = $.Game.Teams.GetTeamByID(this.Team)) != null) {
      if ((i = pTeam.GetPlrStartIndex()) !== 0) {
        this.PlrStartIndex = i - 1 | 0;
      }
    }
    let pInfo = this.GetInfo();
    if (pInfo == null) {
      0;
      $.LogF(S("Internal error: ScenarioInit for ghost player %s!"), this.GetName());
      return false;
    }
    this.ColorDw = pInfo.GetColor();
    this.Status = 1;
    this.Wealth = $.Game.C4S.PlrStart[this.PlrStartIndex].Wealth.Evaluate();
    this.BaseMaterial.$assign($.Game.C4S.PlrStart[this.PlrStartIndex].BaseMaterial);
    this.BaseMaterial.ConsolidateValids($.Definitions);
    this.BaseProduction.$assign($.Game.C4S.PlrStart[this.PlrStartIndex].BaseProduction);
    this.BaseProduction.ConsolidateValids($.Definitions);
    this.Knowledge.$assign($.Game.C4S.PlrStart[this.PlrStartIndex].BuildKnowledge);
    this.Knowledge.ConsolidateValids($.Definitions);
    ptx[0] = $.Game.C4S.PlrStart[this.PlrStartIndex].Position[0];
    pty[0] = $.Game.C4S.PlrStart[this.PlrStartIndex].Position[1];
    if (ptx[0] > -1) {
      ptx[0] = $.Clamp$i32$i32$i32(Math.imul(ptx[0], $.Game.C4S.Landscape.MapZoom.Evaluate()), 0, $.Landscape.GetWidth() - 1 | 0);
    }
    if (pty[0] > -1) {
      pty[0] = $.Clamp$i32$i32$i32(Math.imul(pty[0], $.Game.C4S.Landscape.MapZoom.Evaluate()), 0, $.Landscape.GetHeight() - 1 | 0);
    }
    if (ptx[0] < 0) {
      if ($.Game.StartupPlayerCount >= 2) {
        let iMaxPos = $.Game.StartupPlayerCount;
        let PrefPosition = 0;
        let plr = null;
        for (let i$2 = 0; (plr = $.Game.PlayerInfos.GetPlayerInfoByIndex(i$2)) != null; i$2 = i$2 + 1 | 0) {
          if (plr.GetTeam() < this.Team) {
            PrefPosition = PrefPosition + 1 | 0;
          }
        }
        let iStartPos = $.Clamp$i32$i32$i32(Math.imul(PrefPosition, iMaxPos) / 4 | 0, 0, iMaxPos - 1 | 0);
        let iPosition = iStartPos;
        while ($.Players.PositionTaken(iPosition)) {
          iPosition = iPosition + 1 | 0;
          iPosition = iPosition % iMaxPos;
          if (iPosition === iStartPos) {
            break;
          }
        }
        this.Position = iPosition;
        ptx[0] = $.Clamp$i32$i32$i32(16 + (Math.imul(this.Position, $.Landscape.GetWidth() - 32 | 0) / (iMaxPos - 1 | 0) | 0) | 0, 0, $.Landscape.GetWidth() - 16 | 0);
      }
    }
    if (ptx[0] < 0) {
      ptx[0] = 16 + Random(($.Landscape.GetWidth() - 32 | 0) >>> 0) >>> 0 | 0;
    }
    if (pty[0] < 0) {
      pty[0] = 16 + Random(($.Landscape.GetHeight() - 32 | 0) >>> 0) >>> 0 | 0;
    }
    if ($.Game.C4S.PlrStart[this.PlrStartIndex].EnforcePosition === 0) {
      $.FindSolidGround(P(ptx, 0), P(pty, 0), 30);
      $.FindConSiteSpot(P(ptx, 0), P(pty, 0), 30, 50, 400);
    }
    const FirstBase = [null];
    this.PlaceReadyBase(P(ptx, 0), P(pty, 0), P(FirstBase, 0));
    this.PlaceReadyMaterial(ptx[0] - 10 | 0, ptx[0] + 10 | 0, pty[0], FirstBase[0]);
    this.PlaceReadyVehic(ptx[0] - 30 | 0, ptx[0] + 30 | 0, pty[0], FirstBase[0]);
    this.PlaceReadyCrew(ptx[0] - 30 | 0, ptx[0] + 30 | 0, pty[0], FirstBase[0]);
    if (this.Team !== 0) {
      this.SetTeamHostility();
    }
    $.Game.GRBroadcast(S("~InitializePlayer"), new $.C4AulParSet().init$ri32$ri32$ri32$rpC4Object$ri32$mpC4Def(P(this, "Number"), P(ptx, 0), P(pty, 0), P(FirstBase, 0), P(this, "Team"), $.C4Id2Def(this.GetInfo().GetScriptPlayerExtraID())).op_and());
    return true;
  }

  FinalInit(fInitialScore) {
    if (this.Status === 0) {
      return true;
    }
    if (this.LocalControl) {
      if (this.MouseControl !== 0) {
        $.MouseControl.Init(this.Number);
      }
    }
    if (fInitialScore) {
      this.InitialScore = this.CurrentScore;
    }
    if (this.Cursor.op_not()) {
      this.AdjustCursorCommand();
    }
    this.Execute();
    return true;
  }

  Save$v() {
    let hGroup = new $.C4Group().init();
    if (this.GetType() === 2) {
      return false;
    }
    $.LogF($.LoadResStr(S("IDS_PRC_SAVEPLR")), $.Config.AtRelativePath(P(this.Filename, 0)));
    $.GraphicsSystem.MessageBoard.EnsureLastMessage();
    const szPath = new Int8Array(4097);
    $.SCopy$pi8$pi8$u64($.Config.AtTempPath(S("~plr.tmp")), P(szPath, 0), 4096);
    $.MakeTempFilename$pi8(P(szPath, 0));
    if (this.LocalControl) {
      $.C4Group_CopyItem(P(this.Filename, 0), P(szPath, 0));
    } else {
      this.CrewInfoList.Strip($.Definitions);
    }
    if (!hGroup.Open(P(szPath, 0), true)) {
      return false;
    }
    if (!this.Save$rC4Group$b$b(hGroup, false, !this.LocalControl)) {
      hGroup.Close$v();
      return false;
    }
    if (!hGroup.Close$v()) {
      return false;
    }
    let pRes = $.Network.ResList.getRefRes$pi8$b(P(this.Filename, 0));
    let pDRes = new $.C4Network2Res$Ref().init$pC4Network2Res(null);
    let fOfficial = pRes.op_C4Network2Res_() != null && $.Control$2.isCtrlHost();
    if (pRes.op_C4Network2Res_() != null) {
      pDRes.$assign(pRes.op_arrow().Derive());
    }
    if ($.ItemExists(P(this.Filename, 0))) {
      $.EraseItem(P(this.Filename, 0));
    }
    if (!$.C4Group_MoveItem(P(szPath, 0), P(this.Filename, 0))) {
      return false;
    }
    if (pDRes.op_C4Network2Res_() != null && fOfficial) {
      pDRes.op_arrow().FinishDerive$v();
    }
    return true;
  }

  Save$rC4Group$b$b(hGroup, fSavegame, fStoreTiny) {
    if (!$.C4PlayerInfoCore.prototype.Save$rC4Group.call(this, hGroup)) {
      return false;
    }
    let pDefs = $.Definitions;
    if (!this.CrewInfoList.Save(hGroup, fSavegame, fStoreTiny, pDefs)) {
      hGroup.Close$v();
      return false;
    }
    hGroup.Sort(S("Player.txt|BigIcon.png|*.oci"));
    return true;
  }

  MakeCrewMember(pObj, fForceInfo = true, fDoCalls = true) {
    let cInf = null;
    if (pObj == null || pObj.Def.CrewMember === 0 || pObj.Status === 0) {
      return false;
    }
    if (pObj.Info == null && fForceInfo) {
      if (pObj.nInfo.op_const_void_() != null) {
        cInf = this.CrewInfoList.GetIdle$pi8(pObj.nInfo.getData());
      }
      if (cInf == null) {
        while (!((cInf = this.CrewInfoList.GetIdle$C4ID$rC4DefList(pObj.id.$clone(), $.Definitions)) != null)) {
          if (!(this.CrewInfoList.New(pObj.id.$clone(), $.Definitions) != null)) {
            return false;
          }
        }
      }
      pObj.Info = cInf;
      pObj.SetName(P(cInf.Name, 0));
    }
    if (!(this.Crew.GetLink$pC4Object(pObj) != null)) {
      this.Crew.Add$pC4Object$i32$pC4ObjectList(pObj, 0 /*stNone*/);
    }
    if (pObj.lightRange === 0) {
      pObj.SetLightRange(300, 80);
    } else {
      pObj.UpdateLight();
    }
    pObj.Controller = this.Number;
    if (fDoCalls) {
      let parset = new $.C4AulParSet().init$ri32(P(this, "Number"));
      pObj.Call$pi8$pC4AulParSet$b(S("~Recruitment"), parset.op_and());
    }
    return true;
  }

  Load$pi8$b(szFilename, _fSavegame) {
    let hGroup = new $.C4Group().init();
    if (!$.Reloc.Open(hGroup, szFilename)) {
      return false;
    }
    $.SCopy$pi8$pi8$u64(hGroup.GetFullName().getData(), P(this.Filename, 0), 4096);
    if (!$.C4PlayerInfoCore.prototype.Load$rC4Group.call(this, hGroup)) {
      hGroup.Close$v();
      return false;
    }
    if (hGroup.FindEntry$pi8$pStdStrBuf$pu64(S("BigIcon.png"))) {
      this.BigIcon.Load(hGroup, S("BigIcon.png"), -1, -1, false, 0);
    }
    this.CrewInfoList.Load(hGroup);
    hGroup.Close$v();
    return true;
  }

  static Strip(szFilename, fAggressive) {
    let Grp = new $.C4Group().init();
    if (!Grp.Open(szFilename)) {
      return false;
    }
    if (!fAggressive) {
      const iBigIconSize = [0];
      if (Grp.FindEntry$pi8$pStdStrBuf$pu64(S("BigIcon.png"), null, P(iBigIconSize, 0))) {
        if (iBigIconSize[0] > 20480) {
          Grp.Delete(S("BigIcon.png"));
        }
      }
      Grp.Close$v();
    } else {
      let PlrInfoCore = new $.C4PlayerInfoCore().init();
      let CrewInfoList = new $.C4ObjectInfoList().init();
      if (!PlrInfoCore.Load$rC4Group(Grp) || !(CrewInfoList.Load(Grp) !== 0)) {
        return false;
      }
      CrewInfoList.Strip($.Definitions);
      Grp.Close$v();
      if (!$.EraseItem(szFilename) || !Grp.Open(szFilename, true)) {
        return false;
      }
      if (!PlrInfoCore.Save$rC4Group(Grp) || !CrewInfoList.Save(Grp, true, true, $.Definitions)) {
        return false;
      }
      Grp.Close$v();
    }
    return true;
  }

  Message(szMsg) {
    if (szMsg == null) {
      return false;
    }
    $.SCopy$pi8$pi8$u64(szMsg, P(this.MessageBuf, 0), 256);
    this.MessageStatus = $.SLen(szMsg) * 2 | 0;
    return true;
  }

  ObjectInCrew(tobj) {
    let $t1, $t2, $t3;
    if (tobj == null) {
      return false;
    }
    $t1 = this.Crew;
    $t2 = $t1.begin();
    $t3 = $t1.end();
    try {
      for (; $t2.op_ne($t3); $t2.op_inc$v()) {
        const cobj = $t2.op_mul();
        if (cobj === tobj) {
          return true;
        }
      }
    } finally { $t2.$dtor(); $t3.$dtor(); }
    return false;
  }

  DoWealth(iChange) {
    if (this.LocalControl) {
      if (iChange > 0) {
        $.StartSoundEffect(S("UI::Cash"));
      }
      if (iChange < 0) {
        $.StartSoundEffect(S("UI::UnCash"));
      }
    }
    this.SetWealth(this.Wealth + iChange | 0);
    return true;
  }

  SetWealth(iVal) {
    if (iVal === this.Wealth) {
      return true;
    }
    this.Wealth = $.Clamp$i32$i32$i32(iVal, 0, 0x3b9aca00);
    $.Game.GRBroadcast(S("~OnWealthChanged"), new $.C4AulParSet().init$ri32(P(this, "Number")).op_and());
    return true;
  }

  SetKnowledge(id, fRemove) {
    if (fRemove) {
      let iIndex = this.Knowledge.GetIndex(id.$clone());
      if (iIndex < 0) {
        return false;
      }
      return this.Knowledge.DeleteItem($u64n(iIndex));
    } else {
      if (!($.C4Id2Def(id.$clone()) != null)) {
        return false;
      }
      return this.Knowledge.SetIDCount(id.$clone(), 1, true);
    }
  }

  SetHostility(iOpponent, hostile, fSilent = false) {
    0;
    let opponent = $.Players.Get(iOpponent);
    if (opponent == null || opponent === this) {
      return false;
    }
    if (hostile !== 0) {
      this.Hostility.insert(opponent);
    } else {
      this.Hostility.erase(opponent);
    }
    if ($.Game.FrameCounter === 0 || fSilent) {
      return true;
    }
    $.StartSoundEffect(S("UI::Trumpet"));
    $.Log($.FormatString($.LoadResStr(hostile !== 0 ? S("IDS_PLR_HOSTILITY") : S("IDS_PLR_NOHOSTILITY")), this.GetName(), opponent.GetName()).getData());
    return true;
  }

  IsHostileTowards(plr) {
    0;
    if (plr == null) {
      return false;
    }
    return !this.Hostility.find(plr).eq(this.Hostility.end());
  }

  CompileFunc$pStdCompiler$pC4ValueNumbers(pComp, numbers$) {
    const numbers = [numbers$];
    0;
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Status"), S("Status"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "AtClient"), S("AtClient"), $.C4ClientIDUnknown$C4Client));
    pComp.Value$StdNamingDefaultAdapt$StdStringAdapt$x$12($.mkNamingAdapt$mStdStringAdapt$pi8$x$b$b$12($.mkStringAdaptMA$6(this.AtClientName), S("AtClientName"), S("Local")));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Number"), S("Index"), $.C4P_Number_None$C4Player));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "ID"), S("ID"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Eliminated"), S("Eliminated"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Surrendered"), S("Surrendered"), 0));
    pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "Evaluated"), S("Evaluated"), false));
    pComp.Value$StdNamingDefaultAdapt$u32$u32($.mkNamingAdapt$ru32$pi8$u32$b$b(P(this, "ColorDw"), S("ColorDw"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Position"), S("Position"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "ViewMode"), S("ViewMode"), $.C4PVM_Cursor$C4Player));
    pComp.Value$StdNamingDefaultAdapt$C4Fixed$i32($.mkNamingAdapt$rC4Fixed$pi8$i32$b$b(this.ViewX, S("ViewX"), 0));
    pComp.Value$StdNamingDefaultAdapt$C4Fixed$i32($.mkNamingAdapt$rC4Fixed$pi8$i32$b$b(this.ViewY, S("ViewY"), 0));
    pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "ViewLock"), S("ViewLock"), true));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "ZoomLimitMinWdt"), S("ZoomLimitMinWdt"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "ZoomLimitMinHgt"), S("ZoomLimitMinHgt"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "ZoomLimitMaxWdt"), S("ZoomLimitMaxWdt"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "ZoomLimitMaxHgt"), S("ZoomLimitMaxHgt"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "ZoomWdt"), S("ZoomWdt"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "ZoomHgt"), S("ZoomHgt"), 0));
    pComp.Value$StdNamingDefaultAdapt$C4Fixed$C4Fixed($.mkNamingAdapt$rC4Fixed$pi8$C4Fixed$b$b(this.ZoomLimitMinVal, S("ZoomLimitMinVal"), $.Fix0$C4Real));
    pComp.Value$StdNamingDefaultAdapt$C4Fixed$C4Fixed($.mkNamingAdapt$rC4Fixed$pi8$C4Fixed$b$b(this.ZoomLimitMaxVal, S("ZoomLimitMaxVal"), $.Fix0$C4Real));
    pComp.Value$StdNamingDefaultAdapt$C4Fixed$C4Fixed($.mkNamingAdapt$rC4Fixed$pi8$C4Fixed$b$b(this.ZoomVal, S("ZoomVal"), $.Fix0$C4Real));
    pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "fFogOfWar"), S("FogOfWar"), false));
    pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "ShowStartup"), S("ShowStartup"), false));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "Wealth"), S("Wealth"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "CurrentScore"), S("Score"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "InitialScore"), S("InitialScore"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "ObjectsOwned"), S("ObjectsOwned"), 0));
    pComp.Value$StdNamingAdapt$HostilitySet($.mkNamingAdapt$rC4Player$HostilitySet$pi8(this.Hostility, S("Hostile")));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "ProductionDelay"), S("ProductionDelay"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "ProductionUnit"), S("ProductionUnit"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "CursorFlash"), S("CursorFlash"), 0));
    pComp.Value$StdNamingDefaultAdapt$C4ObjectPtr$C4ObjectPtr($.mkNamingAdapt$rC4ObjectPtr$pi8$C4ObjectPtr$b$b(this.Cursor, S("Cursor"), $.C4ObjectPtr.Null));
    pComp.Value$StdNamingDefaultAdapt$C4ObjectPtr$C4ObjectPtr($.mkNamingAdapt$rC4ObjectPtr$pi8$C4ObjectPtr$b$b(this.ViewCursor, S("ViewCursor"), $.C4ObjectPtr.Null));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "MessageStatus"), S("MessageStatus"), 0));
    pComp.Value$StdNamingDefaultAdapt$StdStringAdapt$x$5($.mkNamingAdapt$mStdStringAdapt$pi8$x$b$b$5($.mkStringAdaptMA$2(this.MessageBuf), S("MessageBuf"), S("")));
    pComp.Value$StdNamingAdapt$C4IDList($.mkNamingAdapt$rC4IDList$pi8(this.BaseMaterial, S("BaseMaterial")));
    pComp.Value$StdNamingAdapt$C4IDList($.mkNamingAdapt$rC4IDList$pi8(this.BaseProduction, S("BaseProduction")));
    pComp.Value$StdNamingAdapt$C4IDList($.mkNamingAdapt$rC4IDList$pi8(this.Knowledge, S("Knowledge")));
    pComp.Value$StdNamingAdapt$StdParameterAdapt$C4ObjectList$pC4ValueNumbers($.mkNamingAdapt$mStdParameterAdapt$C4ObjectList$pC4ValueNumbers$pi8($.mkParAdapt$rC4ObjectList$rpC4ValueNumbers(this.Crew, P(numbers, 0)), S("Crew")));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this.CrewInfoList, "iNumCreated"), S("CrewCreated"), 0));
    pComp.Value$StdPtrAdapt$C4MessageBoardQuery($.mkNamingPtrAdapt$rpC4MessageBoardQuery$pi8(P(this, "pMsgBoardQuery"), S("MsgBoardQueries")));
    pComp.Value$StdNamingDefaultAdapt$StdParameterAdapt$C4Value$pC4ValueNumbers$C4Value($.mkNamingAdapt$mStdParameterAdapt$C4Value$pC4ValueNumbers$pi8$C4Value$b$b($.mkParAdapt$rC4Value$rpC4ValueNumbers(this.SoundModifier, P(numbers, 0)), S("SoundModifier"), new $.C4Value().init$v()));
    if (pComp.isDeserializer()) {
      this.SoundModifier.Denumerate(numbers[0]);
    }
    pComp.Value$rC4PlayerControl(this.Control);
  }

  DenumeratePointers() {
    this.Crew.DenumeratePointers();
    this.Cursor.DenumeratePointers();
    this.ViewCursor.DenumeratePointers();
    for (let pCheck = this.pMsgBoardQuery; pCheck != null; pCheck = pCheck.pNext) {
      pCheck.CallbackObj.DenumeratePointers();
    }
  }

  LoadRuntimeData(_hGroup, numbers$) {
    const numbers = [numbers$];
    let pSource = null;
    if (!((pSource = $.Game.GameText.GetData()) != null)) {
      return false;
    }
    if (!($.SSearch(pSource, $.FormatString(S("[Player%i]"), this.ID).getData()) != null)) {
      return false;
    }
    0;
    if (!$.CompileFromBuf_LogWarn$mStdNamingAdapt$StdParameterAdapt$C4Player$pC4ValueNumbers$x$pi8($.mkNamingAdapt$mStdParameterAdapt$C4Player$pC4ValueNumbers$pi8$2($.mkParAdapt$rC4Player$rpC4ValueNumbers(this, P(numbers, 0)), $.FormatString(S("Player%i"), this.ID).getData()), new $.StdStrBuf().init$pi8$b(pSource), $.Game.GameText.GetFilePath())) {
      return false;
    }
    this.DenumeratePointers();
    return true;
  }

  ActivateMenuMain() {
    if ($.C4GameOverDlg.IsShown()) {
      return false;
    }
    return !!this.Menu.ActivateMain(this.Number);
  }

  ActivateMenuTeamSelection() { /* not translated: GUI team menu */ }

  DoTeamSelection(idTeam) {
    this.Status = 3;
    $.Control$2.DoInput(164 /*CID_PlrAction*/, $.C4ControlPlayerAction.InitScenarioPlayer(this, idTeam), 0 /*CDT_Queue*/);
  }

  GetHiExpActiveCrew() {
    let $t1, $t2, $t3;
    let hiexp = null;
    let iHighestExp = -2;
    let iExp = 0;
    $t1 = this.Crew;
    $t2 = $t1.begin();
    $t3 = $t1.end();
    try {
      for (; $t2.op_ne($t3); $t2.op_inc$v()) {
        const cobj = $t2.op_mul();
        if (!cobj.CrewDisabled) {
          if (cobj.Info != null) {
            iExp = cobj.Info.Experience;
          } else {
            iExp = -1;
          }
          if (hiexp == null || iExp > iHighestExp) {
            hiexp = cobj;
            iHighestExp = iExp;
          }
        }
      }
    } finally { $t2.$dtor(); $t3.$dtor(); }
    return hiexp;
  }

  GetHiRankActiveCrew() {
    let $t1, $t2, $t3;
    let hirank = null;
    let iHighestRank = -2;
    let iRank = 0;
    $t1 = this.Crew;
    $t2 = $t1.begin();
    $t3 = $t1.end();
    try {
      for (; $t2.op_ne($t3); $t2.op_inc$v()) {
        const cobj = $t2.op_mul();
        if (!cobj.CrewDisabled) {
          if (cobj.Info != null) {
            iRank = cobj.Info.Rank;
          } else {
            iRank = -1;
          }
          if (hirank == null || iRank > iHighestRank) {
            hirank = cobj;
            iHighestRank = iRank;
          }
        }
      }
    } finally { $t2.$dtor(); $t3.$dtor(); }
    return hirank;
  }

  SetFoW(fEnable) {
    this.fFogOfWar = fEnable;
  }

  ActiveCrewCount() {
    let $t1, $t2, $t3;
    let iNum = 0;
    $t1 = this.Crew;
    $t2 = $t1.begin();
    $t3 = $t1.end();
    try {
      for (; $t2.op_ne($t3); $t2.op_inc$v()) {
        const cObj = $t2.op_mul();
        if (cObj != null) {
          if (!cObj.CrewDisabled) {
            iNum = iNum + 1 | 0;
          }
        }
      }
    } finally { $t2.$dtor(); $t3.$dtor(); }
    return iNum;
  }

  GetSelectedCrewCount() {
    if (this.Cursor.op_C4Object_() != null && !this.Cursor.op_arrow().CrewDisabled) {
      return 1;
    }
    return 0;
  }

  LocalSync() {
    if (this.GetType() === 2) {
      return true;
    }
    this.TotalPlayingTime = this.TotalPlayingTime + ($.Game.Time - this.GameJoinTime | 0) | 0;
    this.GameJoinTime = $.Game.Time;
    for (let pInf = this.CrewInfoList.GetFirst(); pInf != null; pInf = pInf.Next) {
      if (pInf.InAction) {
        pInf.TotalPlayingTime = pInf.TotalPlayingTime + ($.Game.Time - pInf.InActionTime | 0) | 0;
        pInf.InActionTime = $.Game.Time;
      }
    }
    if (!this.Save$v()) {
      return false;
    }
    return true;
  }

  SetObjectCrewStatus(pCrew, fNewStatus) {
    if (fNewStatus) {
      if (this.Crew.IsContained(pCrew)) {
        return true;
      }
      return this.MakeCrewMember(pCrew, false);
    } else {
      if (!this.Crew.IsContained(pCrew)) {
        return true;
      }
      this.Crew.Remove(pCrew);
      let parset = new $.C4AulParSet().init$ri32(P(this, "Number"));
      pCrew.Call$pi8$pC4AulParSet$b(S("~DeRecruitment"), parset.op_and());
      if (pCrew.Info != null && this.CrewInfoList.IsElement(pCrew.Info)) {
        pCrew.Info.Retire();
        pCrew.Info = null;
      }
    }
    return true;
  }

  IsChosingTeam() {
    return this.Status === 2 || this.Status === 3;
  }

  IsInvisible() {
    let pInfo = $.Game.PlayerInfos.GetPlayerInfoByID$i32(this.ID);
    if (pInfo != null) {
      return pInfo.IsInvisible();
    } else {
      0;
      return false;
    }
  }

  IsViewLocked() {
    return this.ViewLock;
  }

  SetViewLocked(to_val) {
    if (this.ViewLock = to_val) {
      if (this.ViewMode === 2) {
        this.SetViewMode(0);
      }
    }
  }

  SetSoundModifier(new_modifier) {
    let mod = null;
    if (new_modifier != null) {
      this.SoundModifier.SetPropList(new_modifier);
      mod = $.Application.SoundSystem.Modifiers.Get(new_modifier, true);
    } else {
      this.SoundModifier.Set0();
      mod = null;
    }
    $.Application.SoundSystem.Modifiers.SetGlobalModifier(mod, this.Number);
  }

  ClearControl() {
    this.Control.Clear();
    this.LocalControl = false;
    this.ControlSetName.Clear();
    this.ControlSet = null;
    this.MouseControl = 0;
    if (this.pGamepad != null) {
      this.pGamepad.SetPlayer(-1);
      this.pGamepad = null;
    }
    this.ControlCount = this.ActionCount = 0;
    this.LastControlType = 0 /*PCID_None*/;
    this.LastControlID = 0;
  }

  InitControl() {
    if (this.AtClient === $.Control$2.ClientID()) {
      if (!(this.GetInfo() != null) || this.GetInfo().GetType() === 1) {
        if (!$.Control$2.isReplay()) {
          this.LocalControl = true;
        }
      }
    }
    if (this.LocalControl) {
      this.ControlSetName.$assign(this.PrefControl);
      this.ControlSet = $.Game.PlayerControlUserAssignmentSets.GetSetByName(this.ControlSetName.getData());
      if (this.ControlSet == null) {
        this.ControlSet = $.Game.PlayerControlUserAssignmentSets.GetDefaultSet();
      }
      if (this.ControlSet != null && this.ControlSet.HasGamepad() && !$.Config.General.GamepadEnabled) {
        this.ControlSet = $.Game.PlayerControlUserAssignmentSets.GetDefaultSet();
      }
      if (this.ControlSet != null && this.ControlSet.HasGamepad()) {
        if (!this.FindGamepad()) {
          $.LogF(S("No gamepad available for %s, please plug one in!"), this.Name.getData());
          $.Game.Pause();
        }
      }
      if (this.ControlSet != null && this.ControlSet.HasMouse() && this.PrefMouse !== 0) {
        if (!$.Players.MouseControlTaken()) {
          this.MouseControl = 1;
        }
      }
      $.Control$2.DoInput(164 /*CID_PlrAction*/, $.C4ControlPlayerAction.InitPlayerControl(this, this.ControlSet), 0 /*CDT_Queue*/);
    }
    this.Control.RegisterKeyset(this.Number, this.ControlSet);
  }

  UpdateView() {
    switch (this.ViewMode) {
      case 0:
        {
          let pViewObj = null;
          if (!((pViewObj = this.ViewCursor.op_C4Object_()) != null)) {
            pViewObj = this.Cursor.op_C4Object_();
          }
          if (pViewObj != null) {
            this.ViewX.op_assign(pViewObj.GetX());
            this.ViewY.op_assign(pViewObj.GetY());
          }
          break;
        }
      case 1:
        if (this.ViewTarget != null) {
          this.ViewX.op_assign(this.ViewTarget.GetX());
          this.ViewY.op_assign(this.ViewTarget.GetY());
        }
        break;
      case 2:
        break;
    }
  }

  CheckElimination() {
    if (!(this.Crew.GetFirstObject() != null)) {
      if (this.Eliminated === 0) {
        if (!this.NoEliminationCheck) {
          this.Eliminate();
        }
      }
    }
  }

  ExecBaseProduction() {
    let MaxBaseProduction = 25;
    this.ProductionDelay = this.ProductionDelay + 1 | 0;
    if (this.ProductionDelay >= 60) {
      this.ProductionDelay = 0;
      this.ProductionUnit = this.ProductionUnit + 1 | 0;
      for (let cnt = 0; this.BaseProduction.GetID$u64$pi32($u64n(cnt)).op_unsigned_long_C4ID_() != null; cnt = cnt + 1 | 0) {
        if (this.BaseProduction.GetCount$u64($u64n(cnt)) > 0) {
          if (this.ProductionUnit % $.Clamp$i32$i32$i32(11 - this.BaseProduction.GetCount$u64($u64n(cnt)) | 0, 1, 10) === 0) {
            if (this.BaseMaterial.GetIDCount(this.BaseProduction.GetID$u64$pi32($u64n(cnt))) < 25) {
              this.BaseMaterial.IncreaseIDCount(this.BaseProduction.GetID$u64$pi32($u64n(cnt)));
            }
          }
        }
      }
    }
  }

  PlaceReadyBase(tx, ty, pFirstBase) {
    let cnt = 0;
    let cnt2 = 0;
    const ctx = [0];
    const cty = [0];
    let def = null;
    let cid = new $.C4ID().init$v();
    let cbase = null;
    for (cnt = 0; cid.$assign($.Game.C4S.PlrStart[this.PlrStartIndex].ReadyBase.GetID$u64$pi32($u64n(cnt))).op_unsigned_long_C4ID_() != null; cnt = cnt + 1 | 0) {
      if ((def = $.C4Id2Def(cid.$clone())) != null) {
        for (cnt2 = 0; cnt2 < $.Game.C4S.PlrStart[this.PlrStartIndex].ReadyBase.GetCount$u64($u64n(cnt)); cnt2 = cnt2 + 1 | 0) {
          ctx[0] = tx.a[tx.o];
          cty[0] = ty.a[ty.o];
          if ($.Game.C4S.PlrStart[this.PlrStartIndex].EnforcePosition !== 0 || $.FindConSiteSpot(P(ctx, 0), P(cty, 0), def.Shape.Wdt, def.Shape.Hgt, 20)) {
            if ((cbase = $.Game.CreateObjectConstruction($.C4Id2Def(cid.$clone()), null, this.Number, ctx[0], cty[0], 100000, true)) != null) {
              if (pFirstBase.a[pFirstBase.o] == null) {
                if (cbase.Def.Entrance.Wdt > 0 && cbase.Def.Entrance.Hgt > 0) {
                  pFirstBase.a[pFirstBase.o] = cbase;
                  tx.a[tx.o] = pFirstBase.a[pFirstBase.o].GetX();
                  ty.a[ty.o] = pFirstBase.a[pFirstBase.o].GetY();
                }
              }
            }
          }
        }
      }
    }
  }

  PlaceReadyVehic(tx1, tx2, ty, FirstBase) {
    let cnt = 0;
    let cnt2 = 0;
    const ctx = [0];
    const cty = [0];
    let def = null;
    let cid = new $.C4ID().init$v();
    let cobj = null;
    for (cnt = 0; cid.$assign($.Game.C4S.PlrStart[this.PlrStartIndex].ReadyVehic.GetID$u64$pi32($u64n(cnt))).op_unsigned_long_C4ID_() != null; cnt = cnt + 1 | 0) {
      if ((def = $.C4Id2Def(cid.$clone())) != null) {
        for (cnt2 = 0; cnt2 < $.Game.C4S.PlrStart[this.PlrStartIndex].ReadyVehic.GetCount$u64($u64n(cnt)); cnt2 = cnt2 + 1 | 0) {
          ctx[0] = (tx1 >>> 0) + Random((tx2 - tx1 | 0) >>> 0) >>> 0 | 0;
          cty[0] = ty;
          if ($.Game.C4S.PlrStart[this.PlrStartIndex].EnforcePosition === 0) {
            $.FindLevelGround(P(ctx, 0), P(cty, 0), def.Shape.Wdt, 6);
          }
          if ((cobj = $.Game.CreateObject$C4ID$pC4Object$i32$i32$i32$i32$b$C4Fixed$C4Fixed$C4Fixed$i32(cid.$clone(), null, this.Number, ctx[0], cty[0])) != null) {
            if (FirstBase != null) {
              cobj.Enter(FirstBase);
              cobj.SetCommand$i32$pC4Object$i32$i32$pC4Object$b$C4Value$i32$pC4String(4);
            }
          }
        }
      }
    }
  }

  PlaceReadyMaterial(tx1, tx2, ty, FirstBase) {
    let cnt = 0;
    let cnt2 = 0;
    const ctx = [0];
    const cty = [0];
    let def = null;
    let cid = new $.C4ID().init$v();
    if (FirstBase != null) {
      FirstBase.CreateContentsByList($.Game.C4S.PlrStart[this.PlrStartIndex].ReadyMaterial);
    } else {
      for (cnt = 0; cid.$assign($.Game.C4S.PlrStart[this.PlrStartIndex].ReadyMaterial.GetID$u64$pi32($u64n(cnt))).op_unsigned_long_C4ID_() != null; cnt = cnt + 1 | 0) {
        if ((def = $.C4Id2Def(cid.$clone())) != null) {
          for (cnt2 = 0; cnt2 < $.Game.C4S.PlrStart[this.PlrStartIndex].ReadyMaterial.GetCount$u64($u64n(cnt)); cnt2 = cnt2 + 1 | 0) {
            ctx[0] = (tx1 >>> 0) + Random((tx2 - tx1 | 0) >>> 0) >>> 0 | 0;
            cty[0] = ty;
            if ($.Game.C4S.PlrStart[this.PlrStartIndex].EnforcePosition === 0) {
              $.FindSolidGround(P(ctx, 0), P(cty, 0), def.Shape.Wdt);
            }
            $.Game.CreateObject$C4ID$pC4Object$i32$i32$i32$i32$b$C4Fixed$C4Fixed$C4Fixed$i32(cid.$clone(), null, this.Number, ctx[0], cty[0]);
          }
        }
      }
    }
  }

  PlaceReadyCrew(tx1, tx2, ty, FirstBase) {
    let cnt = 0;
    const ctx = [0];
    const cty = [0];
    let nobj = null;
    let pInfo = null;
    let pDef = null;
    const iCount = [0];
    let id = new $.C4ID().init$v();
    for (cnt = 0; id.$assign($.Game.C4S.PlrStart[this.PlrStartIndex].ReadyCrew.GetID$u64$pi32($u64n(cnt), P(iCount, 0))).op_unsigned_long_C4ID_() != null; cnt = cnt + 1 | 0) {
      iCount[0] = $max(iCount[0], 1);
      for (let cnt2 = 0; cnt2 < iCount[0]; cnt2 = cnt2 + 1 | 0) {
        while (!((pInfo = this.CrewInfoList.GetIdle$C4ID$rC4DefList(id.$clone(), $.Definitions)) != null)) {
          if (!(this.CrewInfoList.New(id.$clone(), $.Definitions) != null)) {
            break;
          }
        }
        if (pInfo == null || !((pDef = $.C4Id2Def(pInfo.id.$clone())) != null)) {
          continue;
        }
        ctx[0] = (tx1 >>> 0) + Random((tx2 - tx1 | 0) >>> 0) >>> 0 | 0;
        cty[0] = ty;
        if ($.Game.C4S.PlrStart[this.PlrStartIndex].EnforcePosition === 0) {
          $.FindSolidGround(P(ctx, 0), P(cty, 0), Math.imul(pDef.Shape.Wdt, 3));
        }
        if ((nobj = $.Game.CreateInfoObject(pInfo, this.Number, ctx[0], cty[0])) != null) {
          this.Crew.Add$pC4Object$i32$pC4ObjectList(nobj, 0 /*stNone*/);
          nobj.SetLightRange(300, 80);
          if (FirstBase != null) {
            nobj.Enter(FirstBase);
            nobj.SetCommand$i32$pC4Object$i32$i32$pC4Object$b$C4Value$i32$pC4String(4);
          }
          {
            let DbgRecOff = new $.C4DebugRecOff().init$b(true);
            try {
              let parset = new $.C4AulParSet().init$ri32(P(this, "Number"));
              nobj.Call$pi8$pC4AulParSet$b(S("~Recruitment"), parset.op_and());
            } finally { DbgRecOff && DbgRecOff.$dtor(); }
          }
        }
      }
    }
  }

  CheckCrewExPromotion() {
    let hirank = null;
    if ((hirank = this.GetHiRankActiveCrew()) != null) {
      if (hirank.Info != null) {
        if (hirank.Info.Rank < 1) {
          if ((hirank = this.GetHiExpActiveCrew()) != null) {
            hirank.Promote(1, true, false);
          }
        }
      }
    }
  }

  SetTeamHostility() {
    if (this.Team === 0) {
      return;
    }
    for (let pPlr = $.Players.First; pPlr != null; pPlr = pPlr.Next) {
      if (pPlr !== this) {
        let fHostile = pPlr.Team !== this.Team;
        this.SetHostility(pPlr.Number, fHostile ? 1 : 0, true);
        pPlr.SetHostility(this.Number, fHostile ? 1 : 0, true);
      }
    }
  }

  CloseMenu() {
    this.Menu.Close$b(false);
  }

  EvaluateLeague(fDisconnected, fWon) {
    if (this.LeagueEvaluated) {
      return;
    }
    this.LeagueEvaluated = true;
    let pInfo = this.GetInfo();
    if (pInfo != null) {
      if (fDisconnected) {
        pInfo.SetDisconnected();
      }
      if (fWon) {
        pInfo.SetWinner();
      }
    }
  }

  CreateGraphs() {
    this.ClearGraphs();
    if ($.Game.pNetworkStatistics != null) {
      const dwGraphClr = [this.ColorDw];
      let pInfo = null;
      if (this.ID !== 0 && (pInfo = $.Game.PlayerInfos.GetPlayerInfoByID$i32(this.ID)) != null) {
        dwGraphClr[0] = pInfo.GetColor();
      }
      $.MakeColorReadableOnBlack(P(dwGraphClr, 0));
      dwGraphClr[0] = (dwGraphClr[0] & 0xffffff) >>> 0;
      this.pstatControls = new $.C4TableGraph().init();
      this.pstatControls.SetColorDw(dwGraphClr[0]);
      this.pstatControls.SetTitle(this.GetName());
      this.pstatActions = new $.C4TableGraph().init();
      this.pstatActions.SetColorDw(dwGraphClr[0]);
      this.pstatActions.SetTitle(this.GetName());
      $.Game.pNetworkStatistics.statControls.AddGraph(this.pstatControls);
      $.Game.pNetworkStatistics.statActions.AddGraph(this.pstatActions);
    }
  }

  ClearGraphs() {
    if (this.pstatControls != null) {
      if ($.Game.pNetworkStatistics != null) {
        $.Game.pNetworkStatistics.statControls.RemoveGraph(this.pstatControls);
      }
      $delete(this.pstatControls);
      this.pstatControls = null;
    }
    if (this.pstatActions != null) {
      if ($.Game.pNetworkStatistics != null) {
        $.Game.pNetworkStatistics.statActions.RemoveGraph(this.pstatActions);
      }
      $delete(this.pstatActions);
      this.pstatActions = null;
    }
  }

  CountControl(eType, iID, iCntAdd = 1) {
    this.ControlCount = this.ControlCount + iCntAdd | 0;
    if (eType === this.LastControlType && iID === this.LastControlID) {
      return;
    }
    this.LastControlType = eType;
    this.LastControlID = iID;
    this.ActionCount = this.ActionCount + iCntAdd | 0;
    if (this.Cursor.op_C4Object_() != null && this.Cursor.op_arrow().Info != null) {
      if (this.Cursor.op_arrow().Info != null) {
        this.Cursor.op_arrow().Info.ControlCount = this.Cursor.op_arrow().Info.ControlCount + 1 | 0;
        if (this.Cursor.op_arrow().Info.ControlCount % 5 === 0) {
          this.Cursor.op_arrow().DoExperience(1);
        }
      }
    }
  }

  GetInfo() {
    return $.Game.PlayerInfos.GetPlayerInfoByID$i32(this.ID);
  }

  ExecMsgBoardQueries() {
    if ($.MessageInput.IsTypeIn()) {
      return;
    }
    let pCheck = this.pMsgBoardQuery;
    while (pCheck != null) {
      if (!pCheck.fAnswered) {
        break;
      } else {
        pCheck = pCheck.pNext;
      }
    }
    if (pCheck == null) {
      return;
    }
    $.MessageInput.StartTypeIn(true, pCheck.CallbackObj.op_C4Object_(), pCheck.fIsUppercase, false, this.Number, pCheck.sInputQuery);
  }

  ToggleMouseControl() {
    if (this.MouseControl === 0 && !$.Players.MouseControlTaken()) {
      $.MouseControl.Init(this.Number);
      this.MouseControl = 1;
    } else if (this.MouseControl !== 0) {
      $.MouseControl.Clear();
      $.MouseControl.Default();
      this.MouseControl = 0;
      if (this.ViewMode === 2) {
        this.SetViewMode(0);
      }
    }
  }

  CallMessageBoard(pForObj, sQueryString, fIsUppercase) {
    this.RemoveMessageBoardQuery(pForObj);
    let ppTarget = P(this, "pMsgBoardQuery");
    while (ppTarget.a[ppTarget.o] != null) {
      ppTarget = P(ppTarget.a[ppTarget.o], "pNext");
    }
    ppTarget.a[ppTarget.o] = new $.C4MessageBoardQuery().init$pC4Object$StdStrBuf$b(pForObj, sQueryString, fIsUppercase);
  }

  RemoveMessageBoardQuery(pForObj) {
    let ppCheck = P(this, "pMsgBoardQuery");
    let pFound = null;
    while (ppCheck.a[ppCheck.o] != null) {
      if (ppCheck.a[ppCheck.o].CallbackObj.op_eq$pC4Object(pForObj)) {
        break;
      } else {
        ppCheck = P(ppCheck.a[ppCheck.o], "pNext");
      }
    }
    pFound = ppCheck.a[ppCheck.o];
    if (pFound == null) {
      return false;
    }
    ppCheck.a[ppCheck.o] = ppCheck.a[ppCheck.o].pNext;
    $delete(pFound);
    return true;
  }

  MarkMessageBoardQueryAnswered(pForObj) {
    let pCheck = this.pMsgBoardQuery;
    while (pCheck != null) {
      if (pCheck.CallbackObj.op_eq$pC4Object(pForObj) && !pCheck.fAnswered) {
        break;
      } else {
        pCheck = pCheck.pNext;
      }
    }
    if (pCheck == null) {
      return false;
    }
    pCheck.fAnswered = true;
    return true;
  }

  HasMessageBoardQuery() {
    return !(this.pMsgBoardQuery == null);
  }

  OnTeamSelectionFailed() {
    if (this.Status === 3) {
      this.Status = 2;
    }
  }

  SetPlayerColor(dwNewClr) {
    let $t1, $t2, $t3;
    if (dwNewClr === this.ColorDw) {
      return;
    }
    let dwOldClr = this.ColorDw;
    this.ColorDw = dwNewClr;
    $t1 = $.Objects;
    $t2 = $t1.begin();
    $t3 = $t1.end();
    try {
      for (; $t2.op_ne($t3); $t2.op_inc$v()) {
        const pObj = $t2.op_mul();
        if (pObj != null && pObj.Status !== 0 && pObj.Owner === this.Number) {
          if ((pObj.Color & 0xffffff) >>> 0 === (dwOldClr & 0xffffff) >>> 0) {
            pObj.Color = ((pObj.Color & 0xff000000) >>> 0 | (dwNewClr & 0xffffff) >>> 0) >>> 0;
          }
        }
      }
    } finally { $t2.$dtor(); $t3.$dtor(); }
  }

  SetZoomByViewRange(range_wdt, range_hgt, direct, no_increase, no_decrease) {
    this.AdjustZoomParameter$pi32$i32$b$b(P(this, "ZoomWdt"), range_wdt, no_increase, no_decrease);
    this.AdjustZoomParameter$pi32$i32$b$b(P(this, "ZoomHgt"), range_hgt, no_increase, no_decrease);
    this.ZoomToViewports(direct, no_decrease, no_increase);
  }

  SetMinZoomByViewRange(range_wdt, range_hgt, no_increase, no_decrease) {
    this.AdjustZoomParameter$pi32$i32$b$b(P(this, "ZoomLimitMinWdt"), range_wdt, no_increase, no_decrease);
    this.AdjustZoomParameter$pi32$i32$b$b(P(this, "ZoomLimitMinHgt"), range_hgt, no_increase, no_decrease);
    this.ZoomLimitsToViewports();
  }

  SetMaxZoomByViewRange(range_wdt, range_hgt, no_increase, no_decrease) {
    this.AdjustZoomParameter$pi32$i32$b$b(P(this, "ZoomLimitMaxWdt"), range_wdt, no_increase, no_decrease);
    this.AdjustZoomParameter$pi32$i32$b$b(P(this, "ZoomLimitMaxHgt"), range_hgt, no_increase, no_decrease);
    this.ZoomLimitsToViewports();
  }

  SetZoom(zoom, direct, no_increase, no_decrease) {
    this.AdjustZoomParameter$pC4Fixed$C4Fixed$b$b(this.ZoomVal, zoom.$clone(), no_increase, no_decrease);
    this.ZoomToViewports(direct, no_increase, no_decrease);
  }

  SetMinZoom(zoom, no_increase, no_decrease) {
    this.AdjustZoomParameter$pC4Fixed$C4Fixed$b$b(this.ZoomLimitMinVal, zoom.$clone(), no_increase, no_decrease);
    this.ZoomLimitsToViewports();
  }

  SetMaxZoom(zoom, no_increase, no_decrease) {
    this.AdjustZoomParameter$pC4Fixed$C4Fixed$b$b(this.ZoomLimitMaxVal, zoom.$clone(), no_increase, no_decrease);
    this.ZoomLimitsToViewports();
  }

  ZoomToViewports(direct, no_increase = false, no_decrease = false) {
    let vp = null;
    while ((vp = $.Viewports.GetViewport(this.Number, vp)) != null) {
      this.ZoomToViewport(vp, direct, no_increase, no_decrease);
    }
  }

  ZoomToViewport(vp, direct, no_increase = false, no_decrease = false) {
    let new_zoom = this.ZoomVal.op_bool() ? $.fixtof(this.ZoomVal) : vp.GetZoomByViewRange(this.ZoomWdt !== 0 || this.ZoomHgt !== 0 ? this.ZoomWdt : $.C4VP_DefViewRangeX$C4Player, this.ZoomHgt);
    let old_zoom = vp.GetZoomTarget();
    if (new_zoom > old_zoom && no_increase) {
      return;
    }
    if (new_zoom < old_zoom && no_decrease) {
      return;
    }
    vp.SetZoom$f32$b(new_zoom, direct);
  }

  ZoomLimitsToViewports() {
    let vp = null;
    while ((vp = $.Viewports.GetViewport(this.Number, vp)) != null) {
      this.ZoomLimitsToViewport(vp);
    }
  }

  ZoomLimitsToViewport(vp) {
    let zoom_max = this.ZoomLimitMaxVal.op_bool() ? $.fixtof(this.ZoomLimitMaxVal) : vp.GetZoomByViewRange(this.ZoomLimitMinWdt !== 0 || this.ZoomLimitMinHgt !== 0 ? this.ZoomLimitMinWdt : $.C4VP_DefMinViewRangeX$C4Player, this.ZoomLimitMinHgt);
    let zoom_min = this.ZoomLimitMinVal.op_bool() ? $.fixtof(this.ZoomLimitMinVal) : vp.GetZoomByViewRange(this.ZoomLimitMaxWdt !== 0 || this.ZoomLimitMaxHgt !== 0 ? this.ZoomLimitMaxWdt : $.C4VP_DefMaxViewRangeX$C4Player, this.ZoomLimitMaxHgt);
    vp.SetZoomLimits(zoom_min, zoom_max);
  }

  AdjustZoomParameter$pi32$i32$b$b(range_par, new_val, no_increase, no_decrease) {
    if (new_val < range_par.a[range_par.o]) {
      if (!no_decrease) {
        range_par.a[range_par.o] = new_val;
      }
      return !no_decrease;
    } else if (new_val > range_par.a[range_par.o]) {
      if (!no_increase) {
        range_par.a[range_par.o] = new_val;
      }
      return !no_increase;
    }
    return true;
  }

  AdjustZoomParameter$pC4Fixed$C4Fixed$b$b(zoom_par, new_val, no_increase, no_decrease) {
    if (new_val.op_lt$C4Fixed(zoom_par)) {
      if (!no_decrease) {
        zoom_par.$assign(new_val);
      }
      return !no_decrease;
    } else if (new_val.op_gt$C4Fixed(zoom_par)) {
      if (!no_increase) {
        zoom_par.$assign(new_val);
      }
      return !no_increase;
    }
    return true;
  }

  FindGamepad() {
    let newPad = $.Application.pGamePadControl.GetAvailableGamePad();
    if (newPad == null) {
      return false;
    }
    newPad.SetPlayer(this.ID);
    if (this.pGamepad != null) {
      this.pGamepad.SetPlayer(-1);
    }
    this.pGamepad = newPad;
    $.LogF(S("%s: Using gamepad #%d."), this.Name.getData(), this.pGamepad.GetID());
    return true;
  }

  GainScenarioAchievement(achievement_id, value, scen_name_override = null) {
    if (scen_name_override == null) {
      if ($.Game.C4S.Head.Origin.getLength() !== 0) {
        scen_name_override = $.Game.C4S.Head.Origin.getData();
      } else {
        scen_name_override = P($.Game.ScenarioFilename, 0);
      }
    }
    let sAchvID = $.C4ScenarioParameters.AddFilename2ID(scen_name_override, achievement_id);
    this.Achievements.SetValue(sAchvID.getData(), value, true);
    return true;
  }

  $clone() { return new C4Player().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.Filename = o.Filename.slice();
    this.Name.$assign(o.Name);
    this.Status = o.Status;
    this.Eliminated = o.Eliminated;
    this.Surrendered = o.Surrendered;
    this.Evaluated = o.Evaluated;
    this.Number = o.Number;
    this.ID = o.ID;
    this.Team = o.Team;
    this.ColorDw = o.ColorDw;
    this.ControlSet = o.ControlSet;
    this.ControlSetName.$assign(o.ControlSetName);
    this.MouseControl = o.MouseControl;
    this.Position = o.Position;
    this.PlrStartIndex = o.PlrStartIndex;
    this.RetireDelay = o.RetireDelay;
    this.GameJoinTime = o.GameJoinTime;
    this.AtClient = o.AtClient;
    this.AtClientName = o.AtClientName.slice();
    this.LocalControl = o.LocalControl;
    this.LeagueEvaluated = o.LeagueEvaluated;
    this.NoEliminationCheck = o.NoEliminationCheck;
    this.Menu.$assign(o.Menu);
    this.ViewMode = o.ViewMode;
    this.ViewX.$assign(o.ViewX);
    this.ViewY.$assign(o.ViewY);
    this.ViewLock = o.ViewLock;
    this.ViewTarget = o.ViewTarget;
    this.ShowStartup = o.ShowStartup;
    this.FlashCom = o.FlashCom;
    this.fFogOfWar = o.fFogOfWar;
    this.ZoomLimitMinWdt = o.ZoomLimitMinWdt;
    this.ZoomLimitMinHgt = o.ZoomLimitMinHgt;
    this.ZoomLimitMaxWdt = o.ZoomLimitMaxWdt;
    this.ZoomLimitMaxHgt = o.ZoomLimitMaxHgt;
    this.ZoomWdt = o.ZoomWdt;
    this.ZoomHgt = o.ZoomHgt;
    this.ZoomLimitMinVal.$assign(o.ZoomLimitMinVal);
    this.ZoomLimitMaxVal.$assign(o.ZoomLimitMaxVal);
    this.ZoomVal.$assign(o.ZoomVal);
    this.Wealth = o.Wealth;
    this.CurrentScore = o.CurrentScore;
    this.InitialScore = o.InitialScore;
    this.ObjectsOwned = o.ObjectsOwned;
    this.Hostility.$assign(o.Hostility);
    this.BaseMaterial.$assign(o.BaseMaterial);
    this.BaseProduction.$assign(o.BaseProduction);
    this.ProductionDelay = o.ProductionDelay;
    this.ProductionUnit = o.ProductionUnit;
    this.CrewInfoList.$assign(o.CrewInfoList);
    this.Crew.$assign(o.Crew);
    this.Knowledge.$assign(o.Knowledge);
    this.Control.$assign(o.Control);
    this.Cursor.$assign(o.Cursor);
    this.ViewCursor.$assign(o.ViewCursor);
    this.CursorFlash = o.CursorFlash;
    this.pGamepad = o.pGamepad;
    this.MessageStatus = o.MessageStatus;
    this.MessageBuf = o.MessageBuf.slice();
    this.pMsgBoardQuery = o.pMsgBoardQuery;
    this.BigIcon.$assign(o.BigIcon);
    this.SoundModifier.$assign(o.SoundModifier);
    this.Next = o.Next;
    this.pstatControls = o.pstatControls;
    this.pstatActions = o.pstatActions;
    this.ControlCount = o.ControlCount;
    this.ActionCount = o.ActionCount;
    this.LastControlType = o.LastControlType;
    this.LastControlID = o.LastControlID;
    return this;
  }
}














export function VisibilityCheck(iVis, sx, sy, cx, cy) {
  sx = sx - $.igOffX | 0;
  sy = sy - $.igOffY | 0;
  cx = cx - $.igOffX | 0;
  cy = cy - $.igOffY | 0;
  let st = $max(1, $max($.Abs$i32(sx - cx | 0), $.Abs$i32(sy - cy | 0)));
  for (let i = 0; i <= st; i = i + 1 | 0) {
    let x = (Math.imul(sx, st - i | 0) + Math.imul(cx, i) | 0) / st | 0;
    let y = (Math.imul(sy, st - i | 0) + Math.imul(cy, i) | 0) / st | 0;
    if ($.GBackSolid(x, y)) {
      if ((iVis = iVis - 2 | 0) <= 0) {
        return 0;
      }
    }
  }
  return iVis;
}

export function $init(): void {
  $.C4PVM_Cursor$C4Player = 0;
  $.C4PVM_Target$C4Player = 1;
  $.C4PVM_Scrolling$C4Player = 2;
  $.C4P_Number_None$C4Player = -5;
  $.C4MaxPlayer$C4Player = 5000;
  $.C4MaxClient$C4Player = 5000;
  $.C4VP_DefViewRangeX$C4Player = 300;
  $.C4VP_DefMinViewRangeX$C4Player = 150;
  $.C4VP_DefMaxViewRangeX$C4Player = 750;
  $.C4FOW_DefLightRangeX$C4Player = 300;
  $.C4FOW_DefLightFadeoutRangeX$C4Player = 80;
  $.igOffX = 0;
  $.igOffY = 0;
}

Object.assign($, { C4Player, C4Player$HostilitySet, VisibilityCheck });
