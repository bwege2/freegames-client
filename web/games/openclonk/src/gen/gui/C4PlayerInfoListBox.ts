// @ts-nocheck
// OpenClonk 36de799: src/gui/C4PlayerInfoListBox.cpp, src/gui/C4PlayerInfoListBox.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { ListBox, Window } from './C4Gui.ts';
import { ftoi32 } from '../../rt/int.ts';
import { c$time } from '../../rt/libc.ts';
import { $rd, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete, $max } from '../../rt/std.ts';

export class C4PlayerInfoListBox$ListItem$ID {
  static $layout = [["idType", 0, "i32", 0], ["id", 4, "i32", 0]];
  static $size = 8;
  idType = 0 /*PLI_NONE*/;
  id = 0;

  init$i32$i32(eType, id) {
    this.idType = eType;
    this.id = id;
    return this;
  }

  op_eq(r2) {
    return this.idType === r2.idType && this.id === r2.id;
  }

  $clone() { return new C4PlayerInfoListBox$ListItem$ID().$assign(this); }
  $assign(o) {
    this.idType = o.idType;
    this.id = o.id;
    return this;
  }
}

export class C4PlayerInfoListBox$ListItem extends Window {
  pList = null;
  dwBackground = 0;
  idListItemID = new C4PlayerInfoListBox$ListItem$ID();

  GetLobby() {
    return $.Network.GetLobby();
  }

  Update$v() {
  }

  DrawElement(cgo) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4PlayerInfoListBox$ListItem && C4PlayerInfoListBox$ListItem.prototype instanceof $c) return $c.prototype.DrawElement.apply(this, arguments); }
    if (this.dwBackground !== 0) {
      $.pDraw.DrawBoxDw(cgo.Surface, ftoi32(Math.fround(cgo.TargetX + Math.fround(this.rcBounds.x))), ftoi32(Math.fround(cgo.TargetY + Math.fround(this.rcBounds.y))), ftoi32(Math.fround(Math.fround(Math.fround(cgo.TargetX + Math.fround(this.rcBounds.x)) + Math.fround(this.rcBounds.Wdt)) - Math.fround(1))), ftoi32(Math.fround(Math.fround(Math.fround(cgo.TargetY + Math.fround(this.rcBounds.y)) + Math.fround(this.rcBounds.Hgt)) - Math.fround(1))), this.dwBackground);
    }
    $.Element.prototype.DrawElement.call(this, cgo);
  }

  CanLocalChooseTeams(idPlayer = 0) {
    if (!$.Game.Teams.IsMultiTeams()) {
      return false;
    }
    let pLobby = this.GetLobby();
    if (pLobby == null) {
      return false;
    }
    if (pLobby.IsCountdown()) {
      return false;
    }
    if (idPlayer !== 0) {
      let pInfo = $.Game.PlayerInfos.GetPlayerInfoByID$i32(idPlayer);
      if (pInfo != null && pInfo.HasJoined()) {
        return false;
      }
    }
    return $.Game.Teams.CanLocalChooseTeam$i32(idPlayer);
  }

  init(pList) {
    super.init();
    this.pList = pList;
    this.dwBackground = 0;
    this.idListItemID = new C4PlayerInfoListBox$ListItem$ID();
    this.$dyn = C4PlayerInfoListBox$ListItem;
    return this;
  }

  $clone() { return new C4PlayerInfoListBox$ListItem().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pList = o.pList;
    this.dwBackground = o.dwBackground;
    this.idListItemID.$assign(o.idListItemID);
    return this;
  }
}

export class C4PlayerInfoListBox$PlayerListItem extends C4PlayerInfoListBox$ListItem {
  pIcon = null;
  pNameLabel = null;
  pScoreLabel = null;
  pTimeLabel = null;
  pExtraLabel = null;
  pRankIcon = null;
  pTeamCombo = null;
  pTeamPic = null;
  fIconSet = false;
  fJoinedInfoSet = false;
  dwJoinClr = 0;
  dwPlrClr = 0;
  idClient = 0;
  idPlayer = 0;
  fFreeSavegamePlayer = false;
  fShownCollapsed = false;

  UpdateOwnPos() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4PlayerInfoListBox$PlayerListItem && C4PlayerInfoListBox$PlayerListItem.prototype instanceof $c) return $c.prototype.UpdateOwnPos.apply(this, arguments); }
    $.Window.prototype.UpdateOwnPos.call(this);
    let caBounds = new $.ComponentAligner().init(this.GetContainedClientRect(), 2, 2);
    caBounds.GetFromLeft$i32$i32(this.pIcon.GetBounds().Wdt);
    if (this.pTeamPic != null) {
      caBounds.GetFromLeft$i32$i32(this.pTeamPic.GetBounds().Wdt - 2 | 0);
    }
    let rcExtraDataRect = new $.C4Rect();
    if (this.pExtraLabel != null) {
      rcExtraDataRect.$assign(caBounds.GetFromBottom$i32$i32($.GraphicsResource.TextFont.GetLineHeight()));
    }
    let caTeamArea = new $.ComponentAligner().init(caBounds.GetFromBottom$i32$i32($.ComboBox.GetDefaultHeight$v()), 0, 0);
    let rcRankIcon = new $.C4Rect();
    if (this.pList.IsEvaluation()) {
      if (this.pRankIcon != null) {
        rcRankIcon.$assign(caBounds.GetFromRight$i32$i32(caBounds.GetInnerHeight()));
        if (this.pExtraLabel != null) {
          rcExtraDataRect.Wdt = caBounds.GetInnerWidth();
        }
      }
    } else {
      if (this.pRankIcon != null) {
        rcRankIcon.$assign(caTeamArea.GetFromRight$i32$i32(caTeamArea.GetInnerHeight()));
      }
    }
    let rcTeam = caTeamArea.GetAll$v().$clone();
    if (this.pTeamCombo != null) {
      this.pTeamCombo.SetBounds(rcTeam);
    }
    if (this.pRankIcon != null) {
      this.pRankIcon.SetBounds(rcRankIcon);
    }
    if (this.pTimeLabel != null) {
      let rcUpperBounds = caBounds.GetAll$v().$clone();
      this.pTimeLabel.SetBounds(rcTeam);
      this.pTimeLabel.SetX0(rcUpperBounds.x + rcUpperBounds.Wdt | 0);
    }
    if (this.pExtraLabel != null) {
      this.pExtraLabel.SetBounds(rcExtraDataRect);
    }
  }

  GetListItemTopSpacing() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4PlayerInfoListBox$PlayerListItem && C4PlayerInfoListBox$PlayerListItem.prototype instanceof $c) return $c.prototype.GetListItemTopSpacing.apply(this, arguments); }
    let iSpacing = 1;
    if (this.pList.IsEvaluation()) {
      let pPrevItem = this.GetPrev();
      if (pPrevItem != null) {
        let pPrevListItem = pPrevItem;
        if (pPrevListItem.idListItemID.idType === 3) {
          let pPrevPlayerListItem = pPrevListItem;
          let pThisInfo = this.GetPlayerInfo();
          let pPrevInfo = pPrevPlayerListItem.GetPlayerInfo();
          if (pThisInfo != null && pPrevInfo != null) {
            if (pPrevInfo.GetTeam() !== pThisInfo.GetTeam()) {
              iSpacing = iSpacing + 10 | 0;
            }
          }
        }
      }
    }
    return iSpacing;
  }

  init(pForListBox, idClient, idPlayer, fSavegamePlayer, pInsertBeforeElement) {
    super.init(pForListBox);
    this.pScoreLabel = null;
    this.pTimeLabel = null;
    this.pExtraLabel = null;
    this.pRankIcon = null;
    this.pTeamCombo = null;
    this.pTeamPic = null;
    this.fIconSet = false;
    this.fJoinedInfoSet = false;
    this.dwJoinClr = 0;
    this.dwPlrClr = 0;
    this.idClient = idClient;
    this.idPlayer = idPlayer;
    this.fFreeSavegamePlayer = fSavegamePlayer;
    this.$dyn = C4PlayerInfoListBox$PlayerListItem;
    let fIsEvaluation = pForListBox.IsEvaluation();
    let fIsLobby = pForListBox.IsLobby();
    let pInfo = C4PlayerInfoListBox$PlayerListItem.prototype.GetPlayerInfo.call(this);
    0;
    let dwTextColor = pForListBox.GetTextColor();
    let pCustomFont = pForListBox.GetCustomFont();
    let dwPlayerColor = 0;
    if (fIsEvaluation) {
      dwPlayerColor = dwTextColor;
    } else {
      dwPlayerColor = (pInfo.GetLobbyColor() | 0xff000000) >>> 0;
    }
    let sPlayerName = pInfo.GetLobbyName();
    let iHeight = ($.GraphicsResource.TextFont.GetLineHeight() + $.ComboBox.GetDefaultHeight$v() | 0) + 6 | 0;
    this.pIcon = new $.Icon().init(new $.C4Rect().init$i32$i32$i32$i32(0, 0, iHeight, iHeight), 7 /*Ico_UnknownPlayer*/);
    if ($.Game.Parameters.isLeague()) {
      this.pRankIcon = new $.Icon().init(new $.C4Rect().init$i32$i32$i32$i32(0, 0, $.ComboBox.GetDefaultHeight$v(), $.ComboBox.GetDefaultHeight$v()), -1 /*Ico_None*/);
    }
    if ($.Game.Teams.IsMultiTeams() && !(fIsEvaluation && this.pList.IsTeamFilter())) {
      this.pTeamCombo = new $.ComboBox().init(new $.C4Rect().init$i32$i32$i32$i32(0, 0, 10, 10));
      this.pTeamCombo.SetComboCB(new $.ComboBox_FillCallback$PlayerListItem().init(this, "OnTeamComboFill", "OnTeamComboSelChange"));
      this.pTeamCombo.SetSimple(true);
      if (pCustomFont != null) {
        this.pTeamCombo.SetFont$pCStdFont(pCustomFont);
        this.pTeamCombo.SetColors(dwTextColor, 0x9f000000, 0);
      }
      C4PlayerInfoListBox$PlayerListItem.prototype.UpdateTeam.call(this);
    }
    if (fIsEvaluation) {
      if (!this.pList.IsTeamFilter()) {
        let pTeam = $.Game.Teams.GetTeamByID(pInfo.GetTeam());
        if (pTeam != null && pTeam.GetIconSpec() != null && $rd(pTeam.GetIconSpec()) !== 0) {
          this.pTeamPic = new $.Picture().init(new $.C4Rect().init$i32$i32$i32$i32(iHeight + 2 | 0, 0, iHeight, iHeight), true);
          $.Game.DrawTextSpecImage(this.pTeamPic.GetMFacet(), pTeam.GetIconSpec(), null, pTeam.GetColor());
          this.pTeamPic.SetDrawColor(pTeam.GetColor());
        }
      }
      if (!this.pList.IsTeamFilter()) {
        let sTimeLabelText = new $.StdStrBuf();
        let pRoundResultsPlr = $.Game.RoundResults.GetPlayers().GetByID(idPlayer);
        let iTimeTotal = pRoundResultsPlr != null ? pRoundResultsPlr.GetTotalPlayingTime() : 0;
        sTimeLabelText.Format($.LoadResStr(S("IDS_CTL_TOTALPLAYINGTIME")), iTimeTotal / 3600 >>> 0, (iTimeTotal / 60 >>> 0) % 60, iTimeTotal % 60);
        this.pTimeLabel = new $.Label().init$pi8$i32$i32$i32$u32$pCStdFont$b$b(sTimeLabelText.getData(), 0, 0, 2, dwTextColor, pForListBox.GetCustomFont(), false, true);
      }
      let pEvaluationPlayer = $.Game.RoundResults.GetPlayers().GetByID(idPlayer);
      ;
      if (pEvaluationPlayer != null) {
        let szCustomEval = pEvaluationPlayer.GetCustomEvaluationStrings();
        if (szCustomEval != null && szCustomEval.a[szCustomEval.o] !== 0) {
          this.pExtraLabel = new $.Label().init$pi8$i32$i32$i32$u32$pCStdFont$b$b(szCustomEval, 0, 0, 2);
          iHeight = iHeight + $.GraphicsResource.TextFont.GetLineHeight() | 0;
        }
      }
    }
    this.pNameLabel = new $.Label().init$pi8$i32$i32$i32$u32$pCStdFont$b$b(sPlayerName.getData(), Math.imul(iHeight + 2 | 0, 1 + (!(this.pTeamPic == null) ? 1 : 0) | 0), 2, 0, dwPlayerColor, pCustomFont, !fIsEvaluation, true);
    this.SetBounds(new $.C4Rect().init$i32$i32$i32$i32(0, 0, 10, iHeight));
    $.Container.prototype.AddElement$pElement.call(this, this.pIcon);
    $.Container.prototype.AddElement$pElement.call(this, this.pNameLabel);
    if (this.pTeamPic != null) {
      $.Container.prototype.AddElement$pElement.call(this, this.pTeamPic);
    }
    if (this.pTimeLabel != null) {
      $.Container.prototype.AddElement$pElement.call(this, this.pTimeLabel);
    }
    if (this.pTeamCombo != null) {
      $.Container.prototype.AddElement$pElement.call(this, this.pTeamCombo);
    }
    if (this.pRankIcon != null) {
      $.Container.prototype.AddElement$pElement.call(this, this.pRankIcon);
    }
    if (this.pExtraLabel != null) {
      $.Container.prototype.AddElement$pElement.call(this, this.pExtraLabel);
    }
    pForListBox.InsertElement$pElement$pElement$i32(this, pInsertBeforeElement, 3);
    C4PlayerInfoListBox$PlayerListItem.prototype.UpdateScoreLabel.call(this, pInfo);
    if (this.fFreeSavegamePlayer) {
      this.idListItemID.idType = 2 /*PLI_SAVEGAMEPLR*/;
    } else {
      this.idListItemID.idType = 3 /*PLI_PLAYER*/;
    }
    this.idListItemID.id = idPlayer;
    C4PlayerInfoListBox$PlayerListItem.prototype.UpdateIcon.call(this, pInfo, C4PlayerInfoListBox$PlayerListItem.prototype.GetJoinedInfo.call(this));
    if (fIsLobby) {
      this.SetContextHandler(new $.CBContextHandler$PlayerListItem().init(this, "OnContext"));
    }
    this.fShownCollapsed = false;
    C4PlayerInfoListBox$PlayerListItem.prototype.UpdateCollapsed$v.call(this);
    return this;
  }

  $dtor() {
    super.$dtor();
  }

  UpdateIcon(pInfo, pJoinedInfo) {
    let fResPresent = false;
    let pRes = null;
    if (pInfo != null) {
      if ((pRes = pInfo.GetRes()) != null) {
        fResPresent = pRes.isComplete();
      }
    }
    let pEvaluationPlayer = null;
    if (this.pList.IsEvaluation()) {
      pEvaluationPlayer = $.Game.RoundResults.GetPlayers().GetByID(this.idPlayer);
    }
    let fHasIcon = fResPresent || pEvaluationPlayer != null || !$.Network.isEnabled() && pInfo != null;
    let fHasJoinedInfo = !(pJoinedInfo == null);
    let dwJoinedInfoClr = pJoinedInfo != null ? pJoinedInfo.GetLobbyColor() : 0;
    let dwPlayerClr = pInfo != null ? pInfo.GetLobbyColor() : 0;
    if ((fHasIcon ? 1 : 0) === (this.fIconSet ? 1 : 0) && (this.fJoinedInfoSet ? 1 : 0) === (fHasJoinedInfo ? 1 : 0) && dwJoinedInfoClr === this.dwJoinClr && dwPlayerClr === this.dwPlrClr) {
      return;
    }
    if (fHasIcon) {
      if (pEvaluationPlayer != null && pEvaluationPlayer.GetBigIcon().Surface != null) {
        this.pIcon.SetFacet$C4Facet(pEvaluationPlayer.GetBigIcon());
        this.fIconSet = true;
      } else {
        this.fIconSet = pInfo.LoadBigIcon(this.pIcon.GetMFacet());
      }
      if (!this.fIconSet) {
        this.pIcon.GetMFacet().Create(64, 64);
        $.GraphicsResource.fctPlayerClr.DrawClr(this.pIcon.GetMFacet(), true, dwPlayerClr);
      }
      this.fIconSet = true;
    } else {
      this.pIcon.SetIcon$i32(pInfo != null && pInfo.GetType() === 2 ? 4 /*Ico_Host*/ : 7 /*Ico_UnknownPlayer*/);
    }
    if (fHasJoinedInfo) {
      if (!this.pIcon.EnsureOwnSurface()) {
        return;
      }
      let fctDraw = this.pIcon.GetFacet().$clone();
      let iSizeMax = $max(ftoi32(fctDraw.Wdt), ftoi32(fctDraw.Hgt));
      let iCrewClrHgt = iSizeMax / 2 | 0;
      fctDraw.Hgt = Math.fround(fctDraw.Hgt - Math.fround(iCrewClrHgt));
      fctDraw.Y = Math.fround(fctDraw.Y + Math.fround(iCrewClrHgt));
      fctDraw.Wdt = Math.fround(iSizeMax / 2 | 0);
      fctDraw.X = Math.fround(2);
      const dwPrevMod = [0];
      let fPrevMod = $.pDraw.GetBlitModulation(P(dwPrevMod, 0));
      $.pDraw.ActivateBlitModulation(1);
      $.GraphicsResource.fctCrewClr.DrawClr(fctDraw, true, dwJoinedInfoClr);
      if (fPrevMod) {
        $.pDraw.ActivateBlitModulation(dwPrevMod[0]);
      } else {
        $.pDraw.DeactivateBlitModulation();
      }
      fctDraw.X = Math.fround(0);
      $.GraphicsResource.fctCrewClr.DrawClr(fctDraw, true, dwJoinedInfoClr);
    }
    this.fJoinedInfoSet = fHasJoinedInfo;
    this.dwJoinClr = dwJoinedInfoClr;
    this.dwPlrClr = dwPlayerClr;
  }

  UpdateTeam() {
    if (this.pTeamCombo == null) {
      return;
    }
    let szTeamName = S("");
    let fReadOnly = true;
    fReadOnly = !this.CanLocalChooseTeam();
    let idTeam = 0;
    let pTeam = null;
    let pInfo = this.GetPlayerInfo();
    if (!$.Game.Teams.CanLocalSeeTeam()) {
      szTeamName = $.LoadResStr(S("IDS_MSG_RNDTEAM"));
    } else if (pInfo != null) {
      if ((idTeam = pInfo.GetTeam()) !== 0) {
        if ((pTeam = $.Game.Teams.GetTeamByID(idTeam)) != null) {
          szTeamName = pTeam.GetName();
        }
      }
    }
    this.pTeamCombo.SetText$pi8(szTeamName);
    this.pTeamCombo.SetReadOnly(fReadOnly);
  }

  UpdateScoreLabel(pInfo) {
    0;
    let pRoundResultsPlr = null;
    if (this.pList.IsEvaluation()) {
      pRoundResultsPlr = $.Game.RoundResults.GetPlayers().GetByID(this.idPlayer);
    }
    if (pInfo.getLeagueScore() !== 0 || pInfo.IsLeagueProjectedGainValid() || pRoundResultsPlr != null) {
      let iScoreRightPos = (this.pRankIcon != null && this.pList.IsEvaluation() ? this.pRankIcon.GetBounds().x : this.GetBounds().Wdt) - 2 | 0;
      let iScoreYPos = 2;
      let pEvaluationPlayer = $.Game.RoundResults.GetPlayers().GetByID(pInfo.GetID());
      ;
      let fPlayerHasEvaluationData = false;
      if (pEvaluationPlayer != null) {
        let szCustomEval = pEvaluationPlayer.GetCustomEvaluationStrings();
        if (szCustomEval != null && szCustomEval.a[szCustomEval.o] !== 0) {
          fPlayerHasEvaluationData = true;
        }
      }
      if (this.pList.IsEvaluation() && this.pList.IsTeamFilter()) {
        iScoreYPos = (this.GetBounds().Hgt - Math.imul($.ComboBox.GetDefaultHeight$v(), 1 + (fPlayerHasEvaluationData ? 1 : 0) | 0) | 0) - 2 | 0;
      }
      if (this.pScoreLabel == null) {
        $.Container.prototype.AddElement$pElement.call(this, this.pScoreLabel = new $.Label().init$pi8$i32$i32$i32$u32$pCStdFont$b$b(S(""), iScoreRightPos, iScoreYPos, 2, this.pList.GetTextColor(), this.pList.GetCustomFont(), false));
        if (this.pList.IsEvaluation()) {
          this.pScoreLabel.SetToolTip($.LoadResStr(S("IDS_DESC_OLDANDNEWSCORE")));
        } else {
          this.pScoreLabel.SetToolTip($.LoadResStr(S("IDS_DESC_LEAGUESCOREANDPROJECTEDGA")));
        }
      }
      let sText = new $.StdStrBuf();
      if (this.pList.IsEvaluation()) {
        if (pInfo.getLeagueScore() !== 0 || pInfo.IsLeagueProjectedGainValid() || pRoundResultsPlr != null && pRoundResultsPlr.IsLeagueScoreNewValid()) {
          if (pRoundResultsPlr != null && pRoundResultsPlr.IsLeagueScoreNewValid()) {
            let iOldScore = pInfo.getLeagueScore();
            let iScoreGain = pRoundResultsPlr.GetLeagueScoreGain();
            let iNewScore = pRoundResultsPlr.GetLeagueScoreNew();
            let iDiscrepancy = iNewScore - (iOldScore + iScoreGain | 0) | 0;
            if (iDiscrepancy === 0) {
              sText.Format(S("{{Ico:League}}<c afafaf>%d (%+d)</c> %d %s"), iOldScore, iScoreGain, iNewScore, $.LoadResStr(S("IDS_TEXT_SCORE")));
            } else {
              sText.Format(S("{{Ico:League}}<c afafaf>%d (%+d)</c><c ff0000>(%+d)</c> %d %s"), iOldScore, iScoreGain, iDiscrepancy, iNewScore, $.LoadResStr(S("IDS_TEXT_SCORE")));
            }
          } else {
            sText.Format(S("{{Ico:League}}<c afafaf>(%d)</c> %s"), pInfo.getLeagueScore(), $.LoadResStr(S("IDS_TEXT_SCORE")));
          }
        } else if (pRoundResultsPlr != null && pRoundResultsPlr.IsScoreNewValid() && !$.Game.RoundResults.SettlementScoreIsHidden()) {
          sText.Format(S("{{Ico:Settlement}}<c afafaf>%d (%+d)</c> %d %s"), pRoundResultsPlr.GetScoreOld(), pRoundResultsPlr.GetScoreNew() - pRoundResultsPlr.GetScoreOld() | 0, pRoundResultsPlr.GetScoreNew(), $.LoadResStr(S("IDS_TEXT_SCORE")));
        } else if (pRoundResultsPlr != null && !pRoundResultsPlr.IsScoreNewValid() && !$.Game.RoundResults.SettlementScoreIsHidden()) {
          sText.Format(S("{{Ico:Settlement}}<c afafaf>(%d)</c> %s"), pRoundResultsPlr.GetScoreOld(), $.LoadResStr(S("IDS_TEXT_SCORE")));
        } else {
          sText.Ref$pi8(S(""));
        }
      } else {
        if (pInfo.IsLeagueProjectedGainValid() && $.Game.Teams.IsTeamVisible()) {
          sText.Format(S("%d (%+d)"), pInfo.getLeagueScore(), pInfo.GetLeagueProjectedGain());
        } else {
          sText.Format(S("%d"), pInfo.getLeagueScore());
        }
      }
      this.pScoreLabel.SetX0(iScoreRightPos);
      this.pScoreLabel.SetText$pi8$b(sText.getData(), false);
    } else if (this.pScoreLabel != null) {
      $delete(this.pScoreLabel);
      this.pScoreLabel = null;
    }
    if (this.pRankIcon != null) {
      let iSym = 0;
      if (pRoundResultsPlr != null && pRoundResultsPlr.IsLeagueScoreNewValid()) {
        iSym = pRoundResultsPlr.GetLeagueRankSymbolNew();
      }
      if (iSym === 0) {
        iSym = pInfo.getLeagueRankSymbol();
      }
      if (iSym !== 0 && !this.fShownCollapsed) {
        let eRankIcon = 35 + $.Clamp$i32$i32$i32(iSym - 1 | 0, 0, 8) | 0;
        this.pRankIcon.SetVisibility(true);
        this.pRankIcon.SetIcon$i32(eRankIcon);
      } else {
        this.pRankIcon.SetVisibility(false);
      }
    }
  }

  UpdateCollapsed$v() {
    let fShouldBeCollapsed = this.pList.IsPlayerItemCollapsed(this);
    if ((fShouldBeCollapsed ? 1 : 0) === (this.fShownCollapsed ? 1 : 0)) {
      return;
    }
    let iHeight = 0;
    let iNameLblX0 = 0;
    if (this.fShownCollapsed = fShouldBeCollapsed) {
      iHeight = $.GraphicsResource.TextFont.GetLineHeight() + 4 | 0;
      if (this.pTeamCombo != null) {
        this.pTeamCombo.SetVisibility(false);
      }
    } else {
      iHeight = ($.GraphicsResource.TextFont.GetLineHeight() + $.ComboBox.GetDefaultHeight$v() | 0) + 6 | 0;
      if (this.pTeamCombo != null) {
        this.pTeamCombo.SetVisibility(true);
      }
    }
    iNameLblX0 = iHeight + 2 | 0;
    this.pIcon.GetBounds().$assign(new $.C4Rect().init$i32$i32$i32$i32(0, 0, iHeight, iHeight));
    this.pIcon.UpdateOwnPos();
    this.pNameLabel.SetX0(iNameLblX0);
    this.SetBounds(this.pIcon.GetBounds());
    this.pList.UpdateElementPosition(this, 3);
  }

  OnContext(_pListItem, _iX, _iY) {
    let pInfo = this.GetPlayerInfo();
    0;
    if (!(this.GetLobby() != null)) {
      return null;
    }
    let pMenu = new $.ContextMenu().init();
    if (this.fFreeSavegamePlayer) {
      if (pInfo.GetType() !== 2) {
        let strTakeOver = new $.StdCopyStrBuf().init$pi8$b($.LoadResStr(S("IDS_MSG_TAKEOVERPLR")));
        pMenu.AddItem$pi8$pi8$i32$pMenuHandler$pContextHandler(strTakeOver.getData(), $.LoadResStr(S("IDS_MSG_TAKEOVERPLR_DESC")), 9 /*Ico_Player*/, null, new $.CBContextHandler$PlayerListItem().init(this, "OnContextTakeOver"));
      }
    } else {
      if ($.Network.isHost() || this.IsLocalClientPlayer()) {
        if (pInfo.GetType() !== 2 || !(pInfo.GetAssociatedSavegamePlayerID() !== 0)) {
          let strRemove = new $.StdCopyStrBuf().init$pi8$b($.LoadResStr(S("IDS_MSG_REMOVEPLR")));
          pMenu.AddItem$pi8$pi8$i32$pMenuHandler$pContextHandler(strRemove.getData(), $.LoadResStr(S("IDS_MSG_REMOVEPLR_DESC")), 34 /*Ico_Close*/, new $.CBMenuHandler$PlayerListItem().init(this, "OnCtxRemove"), null);
        }
        let pInfo$2 = this.GetPlayerInfo();
        0;
        if (pInfo$2 != null && pInfo$2.HasAutoGeneratedColor() && (!$.Game.Teams.IsTeamColors() || !(pInfo$2.GetTeam() !== 0))) {
          let strNewColor = new $.StdCopyStrBuf().init$pi8$b($.LoadResStr(S("IDS_MSG_NEWPLRCOLOR")));
          pMenu.AddItem$pi8$pi8$i32$pMenuHandler$pContextHandler(strNewColor.getData(), $.LoadResStr(S("IDS_MSG_NEWPLRCOLOR_DESC")), 9 /*Ico_Player*/, new $.CBMenuHandler$PlayerListItem().init(this, "OnCtxNewColor"), null);
        }
      }
    }
    return pMenu;
  }

  OnContextTakeOver(_pListItem, _iX, _iY) {
    let $t1;
    let pMenu = new $.ContextMenu().init();
    let pkInfo = $.Network.Players.GetLocalPlayerInfoPacket();
    if (pkInfo != null) {
      let i = 0;
      let pInfo = null;
      while ((pInfo = pkInfo.GetPlayerInfo$i32(($t1 = i, i = i + 1 | 0, $t1))) != null) {
        if (!pInfo.HasJoinIssued()) {
          if (!(pInfo.GetAssociatedSavegamePlayerID() !== 0)) {
            pMenu.AddItem$pi8$pi8$i32$pMenuHandler$pContextHandler($.FormatString($.LoadResStr(S("IDS_MSG_USINGPLR")), pInfo.GetName()).getData(), $.LoadResStr(S("IDS_MSG_USINGPLR_DESC")), 9 /*Ico_Player*/, new $.CBMenuHandlerEx$PlayerListItem$i32().init$pPlayerListItem$x$i32(this, "OnCtxTakeOver", pInfo.GetID()));
          }
        }
      }
    }
    return pMenu;
  }

  OnCtxTakeOver(_pListItem, idPlayer) {
    let pLocalInfo = $.Network.Players.GetLocalPlayerInfoPacket();
    if (!this.fFreeSavegamePlayer || idPlayer === 0 || pLocalInfo == null) {
      return;
    }
    let LocalInfoRequest = new $.C4ClientPlayerInfos().$copy(pLocalInfo);
    let pGrabbingInfo = LocalInfoRequest.GetPlayerInfoByID(idPlayer);
    if (pGrabbingInfo == null) {
      return;
    }
    pGrabbingInfo.SetAssociatedSavegamePlayer(this.idPlayer);
    $.Network.Players.RequestPlayerInfoUpdate(LocalInfoRequest);
  }

  OnCtxRemove(_pListItem) {
    if (!$.Network.isEnabled() || !$.Network.isHost() && !this.IsLocalClientPlayer()) {
      return;
    }
    let pChangeInfo = $.Game.PlayerInfos.GetInfoByClientID(this.idClient);
    if (pChangeInfo == null || this.idPlayer === 0) {
      return;
    }
    let LocalInfoRequest = new $.C4ClientPlayerInfos().$copy(pChangeInfo);
    if (!(LocalInfoRequest.GetPlayerInfoByID(this.idPlayer) != null)) {
      return;
    }
    LocalInfoRequest.RemoveInfo(this.idPlayer);
    $.Network.Players.RequestPlayerInfoUpdate(LocalInfoRequest);
  }

  OnCtxNewColor(_pListItem) {
    if (!$.Network.isEnabled() || !$.Network.isHost() && !this.IsLocalClientPlayer()) {
      return;
    }
    let pChangeInfo = $.Game.PlayerInfos.GetInfoByClientID(this.idClient);
    if (pChangeInfo == null || this.idPlayer === 0) {
      return;
    }
    let LocalInfoRequest = new $.C4ClientPlayerInfos().$copy(pChangeInfo);
    let pPlrInfo = LocalInfoRequest.GetPlayerInfoByID(this.idPlayer);
    if (pPlrInfo == null) {
      return;
    }
    pPlrInfo.SetColor(pPlrInfo.GetOriginalColor());
    $.Network.Players.RequestPlayerInfoUpdate(LocalInfoRequest);
  }

  OnTeamComboFill(pFiller) {
    let $t1;
    let pTeam = null;
    let i = 0;
    while ((pTeam = $.Game.Teams.GetTeamByIndex(($t1 = i, i = i + 1 | 0, $t1))) != null) {
      if (!pTeam.IsFull() || this.GetPlayerInfo().GetTeam() === pTeam.GetID()) {
        pFiller.AddEntry(pTeam.GetName(), pTeam.GetID());
      }
    }
  }

  OnTeamComboSelChange(_pForCombo, idNewSelection) {
    let pNewTeam = $.Game.Teams.GetTeamByID(idNewSelection);
    if (!this.CanLocalChooseTeam() || pNewTeam == null) {
      return true;
    }
    let pChangeInfo = $.Game.PlayerInfos.GetInfoByClientID(this.idClient);
    if (pChangeInfo == null || this.idPlayer === 0) {
      return true;
    }
    let LocalInfoRequest = new $.C4ClientPlayerInfos().$copy(pChangeInfo);
    let pChangedInfo = LocalInfoRequest.GetPlayerInfoByID(this.idPlayer);
    if (pChangedInfo == null) {
      return true;
    }
    pChangedInfo.SetTeam(pNewTeam.GetID());
    $.Network.Players.RequestPlayerInfoUpdate(LocalInfoRequest);
    return true;
  }

  Update$v() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4PlayerInfoListBox$PlayerListItem && C4PlayerInfoListBox$PlayerListItem.prototype instanceof $c) return $c.prototype.Update$v.apply(this, arguments); }
    this.UpdateCollapsed$v();
    this.UpdateIcon(this.GetPlayerInfo(), this.GetJoinedInfo());
    this.UpdateTeam();
    let pNfo = this.GetPlayerInfo();
    if (pNfo != null) {
      this.UpdateScoreLabel(pNfo);
      let sShowName = pNfo.GetLobbyName();
      if (this.pList.IsEvaluation()) {
        let fShowWinners = this.pList.GetMode() !== 3;
        let fHasWon = fShowWinners && pNfo.HasTeamWon();
        if (fShowWinners) {
          sShowName.Take$mStdStrBuf($.FormatString(S("%s (%s)"), sShowName.getData(), $.LoadResStr(fHasWon ? S("IDS_CTL_WON") : S("IDS_CTL_LOST"))));
        }
        if (fHasWon) {
          this.pNameLabel.SetColor$u32$b(0xffffdf00, false);
          this.dwBackground = 0xafaf7a00;
        } else {
          this.pNameLabel.SetColor$u32$b(0xffffffff, false);
          this.dwBackground = 0x7fafafaf;
        }
      } else {
        this.pNameLabel.SetColor$u32$b(pNfo.GetLobbyColor());
      }
      this.pNameLabel.SetText$pi8$b(sShowName.getData(), false);
    }
  }

  GetNetClient() {
    return $.Network.Clients.GetClientByID(this.idClient);
  }

  GetPlayerInfo() {
    return this.fFreeSavegamePlayer ? $.Game.RestorePlayerInfos.GetPlayerInfoByID$i32(this.idPlayer) : $.Game.PlayerInfos.GetPlayerInfoByID$i32(this.idPlayer);
  }

  GetJoinedInfo() {
    let pInfo = this.GetPlayerInfo();
    if (pInfo == null) {
      return null;
    }
    if (this.fFreeSavegamePlayer) {
      return pInfo;
    }
    let idSavegameInfo = 0;
    if ((idSavegameInfo = pInfo.GetAssociatedSavegamePlayerID()) !== 0) {
      return $.Game.RestorePlayerInfos.GetPlayerInfoByID$i32(idSavegameInfo);
    }
    return null;
  }

  IsLocalClientPlayer() {
    let pClient = this.GetNetClient();
    return pClient == null || pClient.isLocal();
  }

  CanLocalChooseTeam() {
    if (this.fFreeSavegamePlayer || this.GetJoinedInfo() != null) {
      return false;
    }
    if (!$.Network.isHost() && !this.IsLocalClientPlayer()) {
      return false;
    }
    return this.CanLocalChooseTeams(this.idPlayer);
  }

  $clone() { return new C4PlayerInfoListBox$PlayerListItem().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pIcon = o.pIcon;
    this.pNameLabel = o.pNameLabel;
    this.pScoreLabel = o.pScoreLabel;
    this.pTimeLabel = o.pTimeLabel;
    this.pExtraLabel = o.pExtraLabel;
    this.pRankIcon = o.pRankIcon;
    this.pTeamCombo = o.pTeamCombo;
    this.pTeamPic = o.pTeamPic;
    this.fIconSet = o.fIconSet;
    this.fJoinedInfoSet = o.fJoinedInfoSet;
    this.dwJoinClr = o.dwJoinClr;
    this.dwPlrClr = o.dwPlrClr;
    this.idClient = o.idClient;
    this.idPlayer = o.idPlayer;
    this.fFreeSavegamePlayer = o.fFreeSavegamePlayer;
    this.fShownCollapsed = o.fShownCollapsed;
    return this;
  }
}

export class C4PlayerInfoListBox$ClientListItem extends C4PlayerInfoListBox$ListItem {
  pStatusIcon = null;
  pNameLabel = null;
  pPingLabel = null;
  idClient = 0;
  dwClientClr = 0;
  fIsShownActive = false;
  tLastSoundTime = 0;

  init(pForListBox, rClientInfo, pInsertBefore) {
    super.init(pForListBox);
    this.idClient = rClientInfo.getID();
    this.dwClientClr = 0xffffff;
    this.tLastSoundTime = 0;
    this.$dyn = C4PlayerInfoListBox$ClientListItem;
    this.fIsShownActive = rClientInfo.isActivated();
    this.idListItemID.idType = 4 /*PLI_CLIENT*/;
    this.idListItemID.id = this.idClient;
    let iIconSize = $.GraphicsResource.TextFont.GetLineHeight();
    this.pStatusIcon = new $.Icon().init(new $.C4Rect().init$i32$i32$i32$i32(0, 0, iIconSize, iIconSize), C4PlayerInfoListBox$ClientListItem.prototype.GetCurrentStatusIcon.call(this));
    this.pNameLabel = new $.Label().init$pi8$i32$i32$i32$u32$pCStdFont$b$b(rClientInfo.getName(), iIconSize + 2 | 0, 0, 0, (this.dwClientClr | 0xff000000) >>> 0, null, true, false);
    this.pPingLabel = null;
    let btnAddPlayer = null;
    if (C4PlayerInfoListBox$ClientListItem.prototype.IsLocalClientPlayer.call(this)) {
      btnAddPlayer = new $.CallbackButton$ClientListItem$IconButton().init$i32$C4Rect$i8$x$pClientListItem(20 /*Ico_AddPlr*/, new $.C4Rect().init$i32$i32$i32$i32(0, 0, iIconSize, iIconSize), 80, "OnBtnAddPlr", this);
    }
    let rcOwnBounds = this.pNameLabel.GetBounds().$clone();
    rcOwnBounds.Wdt = rcOwnBounds.Wdt + rcOwnBounds.x | 0;
    rcOwnBounds.x = 0;
    rcOwnBounds.Hgt = rcOwnBounds.Hgt + rcOwnBounds.y | 0;
    rcOwnBounds.y = 0;
    this.SetBounds(rcOwnBounds);
    $.Container.prototype.AddElement$pElement.call(this, this.pStatusIcon);
    $.Container.prototype.AddElement$pElement.call(this, this.pNameLabel);
    if (btnAddPlayer != null) {
      $.Container.prototype.AddElement$pElement.call(this, btnAddPlayer);
    }
    this.SetToolTip($.FormatString(S("Client %s (%s)"), rClientInfo.getName(), rClientInfo.getNick()).getData());
    pForListBox.InsertElement$pElement$pElement$i32(this, pInsertBefore);
    if (btnAddPlayer != null) {
      let iHgt = this.GetClientRect().Hgt;
      btnAddPlayer.GetBounds().$assign(this.GetToprightCornerRect(iHgt, iHgt, 2, 0));
    }
    this.SetContextHandler(new $.CBContextHandler$ClientListItem().init(this, "OnContext"));
    C4PlayerInfoListBox$ClientListItem.prototype.Update$v.call(this);
    return this;
  }

  $dtor() {
    super.$dtor();
  }

  SetColor$u32(dwToClr) {
    this.pNameLabel.SetColor$u32$b(((this.dwClientClr = dwToClr) | 0xff000000) >>> 0);
  }

  SetStatus(icoNewStatus) {
    this.pStatusIcon.SetIcon$i32(icoNewStatus);
  }

  SetPing(iToPing) {
    if (iToPing === -1) {
      if (this.pPingLabel != null) {
        $delete(this.pPingLabel);
        this.pPingLabel = null;
      }
      return;
    }
    let ping = new $.StdStrBuf();
    ping.Format(S("%d ms"), iToPing);
    if (this.pPingLabel == null) {
      this.pPingLabel = new $.Label().init$pi8$i32$i32$i32$u32$pCStdFont$b$b(ping.getData(), this.GetBounds().Wdt, 0, 2, 0xffffffff);
      this.pPingLabel.SetToolTip($.LoadResStr(S("IDS_DLGTIP_PING")));
      $.Container.prototype.AddElement$pElement.call(this, this.pPingLabel);
    } else {
      this.pPingLabel.SetText$pi8$b(ping.getData());
    }
  }

  SetSoundIcon() {
    this.tLastSoundTime = c$time(null);
    this.SetStatus(this.GetCurrentStatusIcon());
  }

  GetListItemTopSpacing() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4PlayerInfoListBox$ClientListItem && C4PlayerInfoListBox$ClientListItem.prototype instanceof $c) return $c.prototype.GetListItemTopSpacing.apply(this, arguments); }
    return 8;
  }

  GetListItemTopSpacingBar() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4PlayerInfoListBox$ClientListItem && C4PlayerInfoListBox$ClientListItem.prototype instanceof $c) return $c.prototype.GetListItemTopSpacingBar.apply(this, arguments); }
    return true;
  }

  UpdateInfo() {
    this.SetColor$u32($.Network.Players.GetClientChatColor(this.idClient, true));
    this.fIsShownActive = this.GetClient() != null && this.GetClient().isActivated();
    this.SetStatus(this.GetCurrentStatusIcon());
  }

  GetClient() {
    return $.Game.Clients.getClientByID(this.idClient);
  }

  IsLocalClientPlayer() {
    let pClient = this.GetNetClient();
    0;
    return pClient == null || pClient.isLocal();
  }

  GetCurrentStatusIcon() {
    if (this.GetClient().IsIgnored()) {
      return 52 /*Ico_Ignored*/;
    }
    if (this.tLastSoundTime !== 0) {
      let dt = c$time(null) - this.tLastSoundTime;
      if (dt >= 1) {
        this.tLastSoundTime = 0;
      } else {
        return 23 /*Ico_Sound*/;
      }
    }
    let pInfoPacket = $.Game.PlayerInfos.GetInfoByClientID(this.idClient);
    if (pInfoPacket == null || !(this.GetClient() != null)) {
      return 6 /*Ico_UnknownClient*/;
    }
    if (this.GetClient().isHost()) {
      return 4 /*Ico_Host*/;
    }
    if (this.GetClient().isActivated()) {
      if (this.GetClient().isLobbyReady()) {
        return 47 /*Ico_Ready*/;
      } else {
        return 5 /*Ico_Client*/;
      }
    }
    return 8 /*Ico_ObserverClient*/;
  }

  GetNetClient() {
    return $.Network.Clients.GetClientByID(this.idClient);
  }

  Update$v() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4PlayerInfoListBox$ClientListItem && C4PlayerInfoListBox$ClientListItem.prototype instanceof $c) return $c.prototype.Update$v.apply(this, arguments); }
    this.UpdatePing();
    this.UpdateInfo();
  }

  UpdatePing() {
    if (!(this.GetClient() != null)) {
      return;
    }
    let iPing = -1;
    let pClient = this.GetNetClient();
    let pConn = null;
    if (pClient != null && !pClient.isLocal()) {
      if ((pConn = pClient.getMsgConn()) != null) {
        iPing = pConn.getLag();
      }
      if (iPing <= 0) {
        if ((pConn = pClient.getDataConn()) != null) {
          iPing = pConn.getLag();
        }
      }
    }
    this.SetPing(iPing);
  }

  OnContext(_pListItem, _iX, _iY) {
    if (!$.Network.isEnabled()) {
      return null;
    }
    let pClient = this.GetClient();
    let pMenu = new $.ContextMenu().init();
    if ($.Network.isHost() && this.GetNetClient() != null) {
      let strKickDesc = new $.StdCopyStrBuf().init$pi8$b($.LoadResStr(S("IDS_NET_KICKCLIENT_DESC")));
      pMenu.AddItem$pi8$pi8$i32$pMenuHandler$pContextHandler($.LoadResStr(S("IDS_NET_KICKCLIENT")), strKickDesc.getData(), -1 /*Ico_None*/, new $.CBMenuHandler$ClientListItem().init(this, "OnCtxKick"));
      let strActivateDesc = new $.StdCopyStrBuf().init$pi8$b($.LoadResStr(S("IDS_NET_ACTIVATECLIENT_DESC")));
      pMenu.AddItem$pi8$pi8$i32$pMenuHandler$pContextHandler($.LoadResStr(pClient.isActivated() ? S("IDS_NET_DEACTIVATECLIENT") : S("IDS_NET_ACTIVATECLIENT")), strActivateDesc.getData(), -1 /*Ico_None*/, new $.CBMenuHandler$ClientListItem().init(this, "OnCtxActivate"));
    }
    let strClientInfoDesc = new $.StdCopyStrBuf().init$pi8$b($.LoadResStr(S("IDS_NET_CLIENTINFO_DESC")));
    pMenu.AddItem$pi8$pi8$i32$pMenuHandler$pContextHandler($.LoadResStr(S("IDS_NET_CLIENTINFO")), strClientInfoDesc.getData(), -1 /*Ico_None*/, new $.CBMenuHandler$ClientListItem().init(this, "OnCtxInfo"));
    if (!pClient.isLocal()) {
      let strNewColor = new $.StdCopyStrBuf().init$pi8$b($.LoadResStr(pClient.IsIgnored() ? S("IDS_NET_CLIENT_UNIGNORE") : S("IDS_NET_CLIENT_IGNORE")));
      pMenu.AddItem$pi8$pi8$i32$pMenuHandler$pContextHandler(strNewColor.getData(), $.FormatString($.LoadResStr(S("IDS_NET_CLIENT_IGNORE_DESC")), pClient.getName()).getData(), -1 /*Ico_None*/, new $.CBMenuHandler$ClientListItem().init(this, "OnCtxIgnore"), null);
    }
    return pMenu;
  }

  OnCtxKick(_pListItem) {
    if (!$.Network.isEnabled() || !$.Network.isHost()) {
      return;
    }
    $.Game.Clients.CtrlRemove(this.GetClient(), $.LoadResStr(S("IDS_MSG_KICKFROMLOBBY")));
  }

  OnCtxActivate(_pListItem) {
    let pClient = this.GetClient();
    if (!$.Network.isEnabled() || !$.Network.isHost() || pClient == null) {
      return;
    }
    $.Control$2.DoInput(129 /*CID_ClientUpdate*/, new $.C4ControlClientUpdate().init$i32$i32$i32(this.idClient, 0 /*CUT_Activate*/, !pClient.isActivated() ? 1 : 0), 1 /*CDT_Sync*/);
  }

  OnCtxInfo(_pListItem) {
    $.pGUI.ShowRemoveDlg(new $.C4Network2ClientDlg().init(this.idClient));
  }

  OnCtxIgnore(_pListItem) {
    this.GetClient().ToggleIgnore();
  }

  OnBtnAddPlr(_btn) {
    this.GetScreen().ShowRemoveDlg(new $.C4PlayerSelDlg().init(new $.C4FileSel_CBEx$MainDlg().init(this.GetLobby(), "OnClientAddPlayer", this.idClient)));
  }

  $clone() { return new C4PlayerInfoListBox$ClientListItem().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pStatusIcon = o.pStatusIcon;
    this.pNameLabel = o.pNameLabel;
    this.pPingLabel = o.pPingLabel;
    this.idClient = o.idClient;
    this.dwClientClr = o.dwClientClr;
    this.fIsShownActive = o.fIsShownActive;
    this.tLastSoundTime = o.tLastSoundTime;
    return this;
  }
}

export class C4PlayerInfoListBox$TeamListItem extends C4PlayerInfoListBox$ListItem {
  pIcon = null;
  pNameLabel = null;
  idTeam = 0;

  UpdateOwnPos() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4PlayerInfoListBox$TeamListItem && C4PlayerInfoListBox$TeamListItem.prototype instanceof $c) return $c.prototype.UpdateOwnPos.apply(this, arguments); }
    $.Window.prototype.UpdateOwnPos.call(this);
    if (this.pList.IsEvaluation()) {
      let iTotalWdt = (this.pIcon.GetBounds().Wdt + 2 | 0) + $.GraphicsResource.TitleFont.GetTextWidth(this.pNameLabel.GetText$v()) | 0;
      let caAll = new $.ComponentAligner().init(this.GetContainedClientRect(), 0, 0);
      let caBounds = new $.ComponentAligner().init(caAll.GetCentered$i32$i32(iTotalWdt, caAll.GetInnerHeight()), 0, 0);
      this.pIcon.SetBounds(caBounds.GetFromLeft$i32$i32(this.pIcon.GetBounds().Wdt, this.pIcon.GetBounds().Hgt));
      this.pNameLabel.SetBounds(caBounds.GetCentered$i32$i32(caBounds.GetInnerWidth(), $.GraphicsResource.TitleFont.GetLineHeight()));
    }
  }

  init(pForListBox, idTeam, pInsertBefore) {
    super.init(pForListBox);
    this.idTeam = idTeam;
    this.$dyn = C4PlayerInfoListBox$TeamListItem;
    let fEvaluation = this.pList.IsEvaluation();
    let szTeamName = null;
    let pTeam = null;
    if (idTeam === -1) {
      szTeamName = $.LoadResStr(S("IDS_MSG_RNDTEAM"));
    } else {
      pTeam = $.Game.Teams.GetTeamByID(idTeam);
      0;
      if (pTeam != null) {
        szTeamName = pTeam.GetName();
      } else {
        szTeamName = S("INTERNAL TEAM ERROR");
      }
    }
    this.idListItemID.idType = 5 /*PLI_TEAM*/;
    this.idListItemID.id = idTeam;
    let iIconSize = 0;
    let pFont = null;
    if (!fEvaluation) {
      pFont = $.GraphicsResource.TextFont;
      iIconSize = pFont.GetLineHeight();
    } else {
      pFont = $.GraphicsResource.TitleFont;
      iIconSize = 35;
    }
    this.pIcon = new $.Icon().init(new $.C4Rect().init$i32$i32$i32$i32(0, 0, iIconSize, iIconSize), 19 /*Ico_Team*/);
    this.pNameLabel = new $.Label().init$pi8$i32$i32$i32$u32$pCStdFont$b$b(szTeamName, iIconSize + 2 | 0, (iIconSize - pFont.GetLineHeight() | 0) / 2 | 0, 0, this.pList.GetTextColor(), pFont, false);
    if (fEvaluation && pTeam != null && pTeam.GetIconSpec() != null && $rd(pTeam.GetIconSpec()) !== 0) {
      let fctSymbol = new $.C4FacetSurface().init();
      fctSymbol.Create(35, 35);
      $.Game.DrawTextSpecImage(fctSymbol, pTeam.GetIconSpec(), null, pTeam.GetColor());
      this.pIcon.GetMFacet().GrabFrom(fctSymbol);
    }
    let rcOwnBounds = this.pNameLabel.GetBounds().$clone();
    rcOwnBounds.Wdt = rcOwnBounds.Wdt + rcOwnBounds.x | 0;
    rcOwnBounds.x = 0;
    rcOwnBounds.Hgt = rcOwnBounds.Hgt + rcOwnBounds.y | 0;
    rcOwnBounds.y = 0;
    this.SetBounds(rcOwnBounds);
    $.Container.prototype.AddElement$pElement.call(this, this.pIcon);
    $.Container.prototype.AddElement$pElement.call(this, this.pNameLabel);
    this.SetToolTip($.FormatString($.LoadResStr(S("IDS_DESC_TEAM")), szTeamName).getData());
    pForListBox.InsertElement$pElement$pElement$i32(this, pInsertBefore);
    return this;
  }

  MouseInput$rCMouse$i32$i32$i32$u32(rMouse, iButton, iX, iY, dwKeyParam) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4PlayerInfoListBox$TeamListItem && C4PlayerInfoListBox$TeamListItem.prototype instanceof $c) return $c.prototype.MouseInput$rCMouse$i32$i32$i32$u32.apply(this, arguments); }
    if (iButton === 5) {
      this.MoveLocalPlayersIntoTeam();
    } else {
      $.Window.prototype.MouseInput$rCMouse$i32$i32$i32$u32.call(this, rMouse, iButton, iX, iY, dwKeyParam);
    }
  }

  GetListItemTopSpacingBar() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4PlayerInfoListBox$TeamListItem && C4PlayerInfoListBox$TeamListItem.prototype instanceof $c) return $c.prototype.GetListItemTopSpacingBar.apply(this, arguments); }
    return true;
  }

  GetListItemTopSpacing() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4PlayerInfoListBox$TeamListItem && C4PlayerInfoListBox$TeamListItem.prototype instanceof $c) return $c.prototype.GetListItemTopSpacing.apply(this, arguments); }
    return 8;
  }

  Update$v() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4PlayerInfoListBox$TeamListItem && C4PlayerInfoListBox$TeamListItem.prototype instanceof $c) return $c.prototype.Update$v.apply(this, arguments); }
    if (this.pList.IsEvaluation()) {
      let pTeam = $.Game.Teams.GetTeamByID(this.idTeam);
      if (pTeam != null && pTeam.HasWon()) {
        this.pNameLabel.SetColor$u32$b(0xffffdf00, false);
      } else {
        this.pNameLabel.SetColor$u32$b(0xffffffff, false);
      }
    }
  }

  MoveLocalPlayersIntoTeam() {
    let $t1;
    if (!this.CanLocalChooseTeams()) {
      return;
    }
    if (!($.Game.Teams.GetTeamByID(this.idTeam) != null)) {
      return;
    }
    let fAnyChange = false;
    let pChangeInfo = $.Game.PlayerInfos.GetInfoByClientID($.Game.Clients.getLocalID());
    if (pChangeInfo == null) {
      return;
    }
    let LocalInfoRequest = new $.C4ClientPlayerInfos().$copy(pChangeInfo);
    let pInfo = null;
    let i = 0;
    while ((pInfo = LocalInfoRequest.GetPlayerInfo$i32(($t1 = i, i = i + 1 | 0, $t1))) != null) {
      if (pInfo.GetTeam() !== this.idTeam) {
        if (pInfo.GetType() === 1) {
          pInfo.SetTeam(this.idTeam);
          fAnyChange = true;
        }
      }
    }
    if (!fAnyChange) {
      return;
    }
    $.Network.Players.RequestPlayerInfoUpdate(LocalInfoRequest);
  }

  $clone() { return new C4PlayerInfoListBox$TeamListItem().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pIcon = o.pIcon;
    this.pNameLabel = o.pNameLabel;
    this.idTeam = o.idTeam;
    return this;
  }
}

export class C4PlayerInfoListBox$FreeSavegamePlayersListItem extends C4PlayerInfoListBox$ListItem {
  pIcon = null;
  pNameLabel = null;

  init(pForListBox, pInsertBefore) {
    super.init(pForListBox);
    this.$dyn = C4PlayerInfoListBox$FreeSavegamePlayersListItem;
    this.idListItemID.idType = 2 /*PLI_SAVEGAMEPLR*/;
    this.idListItemID.id = 0;
    let iIconSize = $.GraphicsResource.TextFont.GetLineHeight();
    this.pIcon = new $.Icon().init(new $.C4Rect().init$i32$i32$i32$i32(0, 0, iIconSize, iIconSize), 12 /*Ico_SavegamePlayer*/);
    this.pNameLabel = new $.Label().init$pi8$i32$i32$i32$u32$pCStdFont$b$b($.LoadResStr(S("IDS_MSG_FREESAVEGAMEPLRS")), iIconSize + 2 | 0, 0, 0);
    let rcOwnBounds = this.pNameLabel.GetBounds().$clone();
    rcOwnBounds.Wdt = rcOwnBounds.Wdt + rcOwnBounds.x | 0;
    rcOwnBounds.x = 0;
    rcOwnBounds.Hgt = rcOwnBounds.Hgt + rcOwnBounds.y | 0;
    rcOwnBounds.y = 0;
    this.SetBounds(rcOwnBounds);
    $.Container.prototype.AddElement$pElement.call(this, this.pIcon);
    $.Container.prototype.AddElement$pElement.call(this, this.pNameLabel);
    this.SetToolTip($.LoadResStr(S("IDS_DESC_UNASSOCIATEDSAVEGAMEPLAYE")));
    pForListBox.InsertElement$pElement$pElement$i32(this, pInsertBefore);
    C4PlayerInfoListBox$FreeSavegamePlayersListItem.prototype.Update$v.call(this);
    return this;
  }

  GetListItemTopSpacing() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4PlayerInfoListBox$FreeSavegamePlayersListItem && C4PlayerInfoListBox$FreeSavegamePlayersListItem.prototype instanceof $c) return $c.prototype.GetListItemTopSpacing.apply(this, arguments); }
    return 8;
  }

  Update$v() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4PlayerInfoListBox$FreeSavegamePlayersListItem && C4PlayerInfoListBox$FreeSavegamePlayersListItem.prototype instanceof $c) return $c.prototype.Update$v.apply(this, arguments); }
  }

  $clone() { return new C4PlayerInfoListBox$FreeSavegamePlayersListItem().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pIcon = o.pIcon;
    this.pNameLabel = o.pNameLabel;
    return this;
  }
}

export class C4PlayerInfoListBox$ScriptPlayersListItem extends C4PlayerInfoListBox$ListItem {
  pIcon = null;
  pNameLabel = null;
  btnAddPlayer = null;

  init(pForListBox, pInsertBefore) {
    super.init(pForListBox);
    this.$dyn = C4PlayerInfoListBox$ScriptPlayersListItem;
    this.idListItemID.idType = 1 /*PLI_SCRIPTPLR*/;
    this.idListItemID.id = 0;
    let iIconSize = $.GraphicsResource.TextFont.GetLineHeight();
    this.pIcon = new $.Icon().init(new $.C4Rect().init$i32$i32$i32$i32(0, 0, iIconSize, iIconSize), 21 /*Ico_Record*/);
    this.pNameLabel = new $.Label().init$pi8$i32$i32$i32$u32$pCStdFont$b$b($.LoadResStr(S("IDS_CTL_SCRIPTPLAYERS")), iIconSize + 2 | 0, 0, 0);
    this.btnAddPlayer = null;
    if ($.Control$2.isCtrlHost()) {
      this.btnAddPlayer = new $.CallbackButton$ScriptPlayersListItem$IconButton().init$i32$C4Rect$i8$x$pScriptPlayersListItem(20 /*Ico_AddPlr*/, new $.C4Rect().init$i32$i32$i32$i32(0, 0, iIconSize, iIconSize), 65, "OnBtnAddPlr", this);
    }
    let rcOwnBounds = this.pNameLabel.GetBounds().$clone();
    rcOwnBounds.Wdt = rcOwnBounds.Wdt + rcOwnBounds.x | 0;
    rcOwnBounds.x = 0;
    rcOwnBounds.Hgt = rcOwnBounds.Hgt + rcOwnBounds.y | 0;
    rcOwnBounds.y = 0;
    this.SetBounds(rcOwnBounds);
    $.Container.prototype.AddElement$pElement.call(this, this.pIcon);
    $.Container.prototype.AddElement$pElement.call(this, this.pNameLabel);
    if (this.btnAddPlayer != null) {
      $.Container.prototype.AddElement$pElement.call(this, this.btnAddPlayer);
    }
    this.SetToolTip($.LoadResStr(S("IDS_DESC_PLAYERSCONTROLLEDBYCOMPUT")));
    pForListBox.InsertElement$pElement$pElement$i32(this, pInsertBefore);
    if (this.btnAddPlayer != null) {
      let iHgt = this.GetClientRect().Hgt;
      this.btnAddPlayer.GetBounds().$assign(this.GetToprightCornerRect(iHgt, iHgt, 2, 0));
    }
    C4PlayerInfoListBox$ScriptPlayersListItem.prototype.Update$v.call(this);
    return this;
  }

  GetListItemTopSpacing() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4PlayerInfoListBox$ScriptPlayersListItem && C4PlayerInfoListBox$ScriptPlayersListItem.prototype instanceof $c) return $c.prototype.GetListItemTopSpacing.apply(this, arguments); }
    return 8;
  }

  OnBtnAddPlr(_btn) {
    let iCurrScriptPlrCount = $.Game.PlayerInfos.GetActiveScriptPlayerCount(true, true);
    let fCanJoinScriptPlayers = ($.Game.Teams.GetMaxScriptPlayers() - iCurrScriptPlrCount | 0) > 0;
    if (!fCanJoinScriptPlayers) {
      return;
    }
    if (!$.Control$2.isCtrlHost()) {
      return;
    }
    let pScriptPlrInfo = new $.C4PlayerInfo().init();
    pScriptPlrInfo.SetAsScriptPlayer($.Game.Teams.GetScriptPlayerName().getData(), $.GenerateRandomPlayerColor(iCurrScriptPlrCount), 0, $.C4ID.None.$clone());
    let JoinPkt = new $.C4ClientPlayerInfos().init(null, true, pScriptPlrInfo);
    $.Game.PlayerInfos.DoPlayerInfoUpdate(JoinPkt);
  }

  Update$v() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4PlayerInfoListBox$ScriptPlayersListItem && C4PlayerInfoListBox$ScriptPlayersListItem.prototype instanceof $c) return $c.prototype.Update$v.apply(this, arguments); }
    if (this.btnAddPlayer != null) {
      let fCanJoinScriptPlayers = ($.Game.Teams.GetMaxScriptPlayers() - $.Game.PlayerInfos.GetActiveScriptPlayerCount(true, true) | 0) > 0;
      this.btnAddPlayer.SetVisibility(fCanJoinScriptPlayers);
    }
  }

  $clone() { return new C4PlayerInfoListBox$ScriptPlayersListItem().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pIcon = o.pIcon;
    this.pNameLabel = o.pNameLabel;
    this.btnAddPlayer = o.btnAddPlayer;
    return this;
  }
}

export class C4PlayerInfoListBox$ReplayPlayersListItem extends C4PlayerInfoListBox$ListItem {
  pIcon = null;
  pNameLabel = null;

  init(pForListBox, pInsertBefore) {
    super.init(pForListBox);
    this.$dyn = C4PlayerInfoListBox$ReplayPlayersListItem;
    this.idListItemID.idType = 6 /*PLI_REPLAY*/;
    this.idListItemID.id = 0;
    let iIconSize = $.GraphicsResource.TextFont.GetLineHeight();
    this.pIcon = new $.Icon().init(new $.C4Rect().init$i32$i32$i32$i32(0, 0, iIconSize, iIconSize), 21 /*Ico_Record*/);
    this.pNameLabel = new $.Label().init$pi8$i32$i32$i32$u32$pCStdFont$b$b($.LoadResStr(S("IDS_MSG_REPLAYPLRS")), iIconSize + 2 | 0, 0, 0);
    let rcOwnBounds = this.pNameLabel.GetBounds().$clone();
    rcOwnBounds.Wdt = rcOwnBounds.Wdt + rcOwnBounds.x | 0;
    rcOwnBounds.x = 0;
    rcOwnBounds.Hgt = rcOwnBounds.Hgt + rcOwnBounds.y | 0;
    rcOwnBounds.y = 0;
    this.SetBounds(rcOwnBounds);
    $.Container.prototype.AddElement$pElement.call(this, this.pIcon);
    $.Container.prototype.AddElement$pElement.call(this, this.pNameLabel);
    this.SetToolTip($.LoadResStr(S("IDS_MSG_REPLAYPLRS_DESC")));
    pForListBox.InsertElement$pElement$pElement$i32(this, pInsertBefore);
    return this;
  }

  GetListItemTopSpacingBar() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4PlayerInfoListBox$ReplayPlayersListItem && C4PlayerInfoListBox$ReplayPlayersListItem.prototype instanceof $c) return $c.prototype.GetListItemTopSpacingBar.apply(this, arguments); }
    return true;
  }

  GetListItemTopSpacing() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4PlayerInfoListBox$ReplayPlayersListItem && C4PlayerInfoListBox$ReplayPlayersListItem.prototype instanceof $c) return $c.prototype.GetListItemTopSpacing.apply(this, arguments); }
    return 8;
  }

  $clone() { return new C4PlayerInfoListBox$ReplayPlayersListItem().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.pIcon = o.pIcon;
    this.pNameLabel = o.pNameLabel;
    return this;
  }
}

export class C4PlayerInfoListBox extends ListBox {
  eMode = 0;
  iMaxUncollapsedPlayers = 0;
  fIsCollapsed = false;
  iTeamFilter = 0;
  dwTextColor = 0;
  pCustomFont = null;

  UpdateSavegamePlayers(ppCurrInList) {
    if (($.Game.RestorePlayerInfos.GetActivePlayerCount(true) - $.Game.RestorePlayerInfos.GetActiveScriptPlayerCount(true, true) | 0) !== 0) {
      if (!this.PlrListItemUpdate(2 /*PLI_SAVEGAMEPLR*/, 0, ppCurrInList)) {
        new C4PlayerInfoListBox$FreeSavegamePlayersListItem().init(this, ppCurrInList.a[ppCurrInList.o]);
      }
      let fAnyPlayers = false;
      let pInfo = null;
      let iInfoID = 0;
      while ((pInfo = $.Game.RestorePlayerInfos.GetNextPlayerInfoByID(iInfoID)) != null) {
        iInfoID = pInfo.GetID();
        if ($.Game.PlayerInfos.GetPlayerInfoBySavegameID(iInfoID) != null) {
          continue;
        }
        if (pInfo.GetType() === 2) {
          continue;
        }
        fAnyPlayers = true;
        if (!this.PlrListItemUpdate(2 /*PLI_SAVEGAMEPLR*/, iInfoID, ppCurrInList)) {
          new C4PlayerInfoListBox$PlayerListItem().init(this, -1, iInfoID, true, ppCurrInList.a[ppCurrInList.o]);
        }
      }
      fAnyPlayers;
    }
  }

  UpdateReplayPlayers(ppCurrInList) {
    if (!this.PlrListItemUpdate(6 /*PLI_REPLAY*/, 0, ppCurrInList)) {
      new C4PlayerInfoListBox$ReplayPlayersListItem().init(this, ppCurrInList.a[ppCurrInList.o]);
    }
    let pInfo = null;
    let iInfoID = 0;
    while ((pInfo = $.Game.PlayerInfos.GetNextPlayerInfoByID(iInfoID)) != null) {
      if (pInfo.IsInvisible()) {
        continue;
      }
      iInfoID = pInfo.GetID();
      if (!this.PlrListItemUpdate(3 /*PLI_PLAYER*/, iInfoID, ppCurrInList)) {
        new C4PlayerInfoListBox$PlayerListItem().init(this, -1, iInfoID, false, ppCurrInList.a[ppCurrInList.o]);
      }
    }
  }

  UpdateScriptPlayers(ppCurrInList) {
    let $t1, $t2;
    if ($.Game.Teams.GetMaxScriptPlayers() !== 0 || $.Game.PlayerInfos.GetActiveScriptPlayerCount(true, false) !== 0) {
      if (!this.PlrListItemUpdate(1 /*PLI_SCRIPTPLR*/, 0, ppCurrInList)) {
        new C4PlayerInfoListBox$ScriptPlayersListItem().init(this, ppCurrInList.a[ppCurrInList.o]);
      }
      let pInfo = null;
      let iClientIdx = 0;
      let pInfos = null;
      while ((pInfos = $.Game.PlayerInfos.GetIndexedInfo(($t1 = iClientIdx, iClientIdx = iClientIdx + 1 | 0, $t1))) != null) {
        let iInfoIdx = 0;
        while ((pInfo = pInfos.GetPlayerInfo$i32(($t2 = iInfoIdx, iInfoIdx = iInfoIdx + 1 | 0, $t2))) != null) {
          if (pInfo.GetType() !== 2) {
            continue;
          }
          if (pInfo.IsRemoved()) {
            continue;
          }
          if (pInfo.IsInvisible()) {
            continue;
          }
          let iInfoID = pInfo.GetID();
          if (!this.PlrListItemUpdate(3 /*PLI_PLAYER*/, iInfoID, ppCurrInList)) {
            new C4PlayerInfoListBox$PlayerListItem().init(this, pInfos.GetClientID(), iInfoID, false, ppCurrInList.a[ppCurrInList.o]);
          }
        }
      }
    }
  }

  UpdatePlayersByTeam(ppCurrInList) {
    let $t1, $t2;
    let pTeam = null;
    let i = 0;
    while ((pTeam = $.Game.Teams.GetTeamByIndex(($t1 = i, i = i + 1 | 0, $t1))) != null) {
      if ($.Game.Teams.IsAutoGenerateTeams() && !(pTeam.GetPlayerCount() !== 0)) {
        continue;
      }
      if (!this.PlrListItemUpdate(5 /*PLI_TEAM*/, pTeam.GetID(), ppCurrInList)) {
        new C4PlayerInfoListBox$TeamListItem().init(this, pTeam.GetID(), ppCurrInList.a[ppCurrInList.o]);
      }
      let idPlr = 0;
      let j = 0;
      const idClient = [0];
      let pClient = null;
      let pPlrInfo = null;
      while ((idPlr = pTeam.GetIndexedPlayer(($t2 = j, j = j + 1 | 0, $t2))) !== 0) {
        if ((pPlrInfo = $.Game.PlayerInfos.GetPlayerInfoByID$i32$pi32(idPlr, P(idClient, 0))) != null) {
          if (!pPlrInfo.IsInvisible()) {
            if ((pClient = $.Game.Clients.getClientByID(idClient[0])) != null && pClient.isActivated()) {
              if (!this.PlrListItemUpdate(3 /*PLI_PLAYER*/, idPlr, ppCurrInList)) {
                new C4PlayerInfoListBox$PlayerListItem().init(this, idClient[0], idPlr, false, ppCurrInList.a[ppCurrInList.o]);
              }
            }
          }
        }
      }
    }
  }

  UpdatePlayersByRandomTeam(ppCurrInList) {
    let $t1;
    let fTeamLabelPut = false;
    let pClient = null;
    while ((pClient = $.Game.Clients.getClient(pClient)) != null) {
      if ($.Game.C4S.Head.Replay || !pClient.isActivated()) {
        continue;
      }
      let pInfoPacket = $.Game.PlayerInfos.GetInfoByClientID(pClient.getID());
      if (pInfoPacket != null) {
        let pPlrInfo = null;
        let i = 0;
        while ((pPlrInfo = pInfoPacket.GetPlayerInfo$i32(($t1 = i, i = i + 1 | 0, $t1))) != null) {
          if (pPlrInfo.IsInvisible()) {
            continue;
          }
          if (!fTeamLabelPut) {
            if (!this.PlrListItemUpdate(5 /*PLI_TEAM*/, -1, ppCurrInList)) {
              new C4PlayerInfoListBox$TeamListItem().init(this, -1, ppCurrInList.a[ppCurrInList.o]);
            }
            fTeamLabelPut = true;
          }
          if (!this.PlrListItemUpdate(3 /*PLI_PLAYER*/, pPlrInfo.GetID(), ppCurrInList)) {
            new C4PlayerInfoListBox$PlayerListItem().init(this, pClient.getID(), pPlrInfo.GetID(), false, ppCurrInList.a[ppCurrInList.o]);
          }
        }
      }
    }
  }

  UpdatePlayersByClient(ppCurrInList) {
    let $t1;
    let pClient = null;
    while ((pClient = $.Game.Clients.getClient(pClient)) != null) {
      if (!this.PlrListItemUpdate(4 /*PLI_CLIENT*/, pClient.getID(), ppCurrInList)) {
        new C4PlayerInfoListBox$ClientListItem().init(this, pClient.getCore(), ppCurrInList.a[ppCurrInList.o]);
      }
      if ($.Game.C4S.Head.Replay || pClient.isObserver()) {
        continue;
      }
      let pInfoPacket = $.Game.PlayerInfos.GetInfoByClientID(pClient.getID());
      if (pInfoPacket != null) {
        let pPlrInfo = null;
        let i = 0;
        while ((pPlrInfo = pInfoPacket.GetPlayerInfo$i32(($t1 = i, i = i + 1 | 0, $t1))) != null) {
          if (pPlrInfo.GetType() === 2) {
            continue;
          }
          if (pPlrInfo.IsRemoved()) {
            continue;
          }
          if (pPlrInfo.IsInvisible()) {
            continue;
          }
          if (!this.PlrListItemUpdate(3 /*PLI_PLAYER*/, pPlrInfo.GetID(), ppCurrInList)) {
            new C4PlayerInfoListBox$PlayerListItem().init(this, pClient.getID(), pPlrInfo.GetID(), false, ppCurrInList.a[ppCurrInList.o]);
          }
        }
      }
    }
  }

  UpdatePlayersByEvaluation$ppListItem$b(ppCurrInList, fShowWinners) {
    let $t1;
    if (this.iTeamFilter !== 0) {
      if (!this.PlrListItemUpdate(5 /*PLI_TEAM*/, this.iTeamFilter, ppCurrInList)) {
        new C4PlayerInfoListBox$TeamListItem().init(this, this.iTeamFilter, ppCurrInList.a[ppCurrInList.o]);
      }
    }
    const pShowWinnersAddModes = new Int32Array([0, 1]);
    const pHideWinnersAddModes = new Int32Array([2]);
    let pAddModes = null;
    let iAddModeCount = 0;
    if (fShowWinners) {
      pAddModes = P(pShowWinnersAddModes, 0);
      iAddModeCount = 2;
    } else {
      pAddModes = P(pHideWinnersAddModes, 0);
      iAddModeCount = 1;
    }
    for (let iAddMode = 0; iAddMode < iAddModeCount; iAddMode = iAddMode + 1 | 0) {
      let eAddMode = pAddModes.a[pAddModes.o + iAddMode];
      if (this.iTeamFilter !== 0) {
        this.UpdatePlayersByEvaluation$ppListItem$pC4Team$i32(ppCurrInList, $.Game.Teams.GetTeamByID(this.iTeamFilter), eAddMode);
      } else {
        let pTeam = null;
        let i = 0;
        while ((pTeam = $.Game.Teams.GetTeamByIndex(($t1 = i, i = i + 1 | 0, $t1))) != null) {
          this.UpdatePlayersByEvaluation$ppListItem$pC4Team$i32(ppCurrInList, pTeam, eAddMode);
        }
        this.UpdatePlayersByEvaluation$ppListItem$pC4Team$i32(ppCurrInList, null, eAddMode);
      }
    }
  }

  UpdatePlayersByEvaluation$ppListItem$pC4Team$i32(ppCurrInList, pTeam, eWinMode) {
    let $t1, $t2;
    if (pTeam != null && eWinMode !== 2) {
      if ((pTeam.HasWon() ? 1 : 0) !== (eWinMode === 0 ? 1 : 0)) {
        return;
      }
    }
    let iTeamID = pTeam != null ? pTeam.GetID() : 0;
    let pInfoPacket = null;
    let iClient = 0;
    while ((pInfoPacket = $.Game.PlayerInfos.GetIndexedInfo(($t1 = iClient, iClient = iClient + 1 | 0, $t1))) != null) {
      let pPlrInfo = null;
      let i = 0;
      while ((pPlrInfo = pInfoPacket.GetPlayerInfo$i32(($t2 = i, i = i + 1 | 0, $t2))) != null) {
        if (!pPlrInfo.HasJoined()) {
          continue;
        }
        if (pPlrInfo.GetTeam() !== iTeamID) {
          continue;
        }
        if (pPlrInfo.IsInvisible()) {
          continue;
        }
        if (pTeam == null && eWinMode !== 2 && (pPlrInfo.HasWon() ? 1 : 0) !== (eWinMode === 0 ? 1 : 0)) {
          continue;
        }
        if (!this.PlrListItemUpdate(3 /*PLI_PLAYER*/, pPlrInfo.GetID(), ppCurrInList)) {
          new C4PlayerInfoListBox$PlayerListItem().init(this, pInfoPacket.GetClientID(), pPlrInfo.GetID(), false, ppCurrInList.a[ppCurrInList.o]);
        }
      }
    }
  }

  GetPlayerListItem(eType, id) {
    let idSearch = new C4PlayerInfoListBox$ListItem$ID().init$i32$i32(eType, id);
    for (let pEItem = this.GetFirst(); pEItem != null; pEItem = $.Element.prototype.GetNext$v$c.call(pEItem)) {
      let pItem = pEItem;
      if (pItem.idListItemID.op_eq(idSearch)) {
        return pItem;
      }
    }
    return null;
  }

  PlrListItemUpdate(eType, id, pEnsurePos) {
    0;
    let pItem = this.GetPlayerListItem(eType, id);
    if (pItem == null) {
      return false;
    }
    if (pItem !== pEnsurePos.a[pEnsurePos.o]) {
      this.RemoveElement(pItem);
      this.InsertElement$pElement$pElement$i32(pItem, pEnsurePos.a[pEnsurePos.o]);
    } else {
      pEnsurePos.a[pEnsurePos.o] = $.Element.prototype.GetNext$v$c.call(pItem);
    }
    pItem.Update$v();
    return true;
  }

  IsEvaluation() {
    return this.eMode === 2 || this.eMode === 3;
  }

  IsLobby() {
    return this.eMode === 0 || this.eMode === 1;
  }

  IsTeamFilter() {
    return !(this.iTeamFilter === 0);
  }

  IsPlayerItemCollapsed(pItem) {
    if (!this.fIsCollapsed) {
      return false;
    }
    return this.GetSelectedItem() !== pItem;
  }

  OnPlrListSelChange(_pEl) {
    this.Update$v();
  }

  GetTextColor() {
    return this.dwTextColor;
  }

  GetCustomFont() {
    return this.pCustomFont;
  }

  init(rcBounds, eMode, iTeamFilter = 0) {
    super.init(rcBounds);
    this.eMode = eMode;
    this.iMaxUncollapsedPlayers = 10;
    this.fIsCollapsed = false;
    this.iTeamFilter = iTeamFilter;
    this.dwTextColor = 0xffffffff;
    this.pCustomFont = null;
    this.$dyn = C4PlayerInfoListBox;
    this.SetSelectionChangeCallbackFn(new $.CallbackHandler$C4PlayerInfoListBox().init(this, "OnPlrListSelChange"));
    C4PlayerInfoListBox.prototype.Update$v.call(this);
    return this;
  }

  $dtor() {
    super.$dtor();
  }

  Update$v() {
    if ($.fPlayerListUpdating$C4PlayerInfoListBox) {
      return;
    }
    $.fPlayerListUpdating$C4PlayerInfoListBox = true;
    const pCurrInList = [this.GetFirst()];
    this.UpdateSavegamePlayers(P(pCurrInList, 0));
    switch (this.eMode) {
      case 1:
        if ($.Game.Teams.CanLocalSeeTeam()) {
          this.UpdatePlayersByTeam(P(pCurrInList, 0));
        } else {
          this.UpdatePlayersByRandomTeam(P(pCurrInList, 0));
        }
        break;
      case 0:
        if ($.Game.C4S.Head.Replay) {
          this.UpdateReplayPlayers(P(pCurrInList, 0));
        }
        this.UpdateScriptPlayers(P(pCurrInList, 0));
        this.UpdatePlayersByClient(P(pCurrInList, 0));
        break;
      case 2:
      case 3:
        this.UpdatePlayersByEvaluation$ppListItem$b(P(pCurrInList, 0), this.eMode === 2);
        break;
    }
    while (pCurrInList[0] != null) {
      let pDel = pCurrInList[0];
      pCurrInList[0] = $.Element.prototype.GetNext$v$c.call(pCurrInList[0]);
      $delete(pDel);
    }
    $.fPlayerListUpdating$C4PlayerInfoListBox = false;
    if (!this.fIsCollapsed && this.IsScrollingActive() && !this.IsEvaluation()) {
      this.iMaxUncollapsedPlayers = $.Game.PlayerInfos.GetPlayerCount() - 1 | 0;
      this.fIsCollapsed = true;
      this.Update$v();
    } else if (this.fIsCollapsed && $.Game.PlayerInfos.GetPlayerCount() <= this.iMaxUncollapsedPlayers) {
      this.fIsCollapsed = false;
      this.Update$v();
    }
  }

  SetClientSoundIcon(iForClientID) {
    let pItem = this.GetPlayerListItem(4 /*PLI_CLIENT*/, iForClientID);
    if (pItem != null) {
      let pClientItem = pItem;
      pClientItem.SetSoundIcon();
    }
  }

  SetMode(eNewMode) {
    if (this.eMode !== eNewMode) {
      this.eMode = eNewMode;
      this.Update$v();
    }
  }

  SetTeamFilter(idNewTeamFilter) {
    this.iTeamFilter = idNewTeamFilter;
  }

  SetCustomFont(pNewFont, dwTextColor) {
    this.pCustomFont = pNewFont;
    this.dwTextColor = dwTextColor;
  }

  GetMode() {
    return this.eMode;
  }

  $clone() { return new C4PlayerInfoListBox().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.eMode = o.eMode;
    this.iMaxUncollapsedPlayers = o.iMaxUncollapsedPlayers;
    this.fIsCollapsed = o.fIsCollapsed;
    this.iTeamFilter = o.iTeamFilter;
    this.dwTextColor = o.dwTextColor;
    this.pCustomFont = o.pCustomFont;
    return this;
  }
}


export function $init(): void {
  $.fPlayerListUpdating$C4PlayerInfoListBox = false;
}

Object.assign($, { C4PlayerInfoListBox, C4PlayerInfoListBox$ClientListItem, C4PlayerInfoListBox$FreeSavegamePlayersListItem, C4PlayerInfoListBox$ListItem, C4PlayerInfoListBox$ListItem$ID, C4PlayerInfoListBox$PlayerListItem, C4PlayerInfoListBox$ReplayPlayersListItem, C4PlayerInfoListBox$ScriptPlayersListItem, C4PlayerInfoListBox$TeamListItem });
