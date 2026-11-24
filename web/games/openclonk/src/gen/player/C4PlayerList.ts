// @ts-nocheck
// OpenClonk 36de799: src/player/C4PlayerList.cpp, src/player/C4PlayerList.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $rd, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete, $max, $min } from '../../rt/std.ts';

export class C4PlayerList {
  First = null;

  init() {
    C4PlayerList.prototype.Default.call(this);
    return this;
  }

  $dtor() {
    C4PlayerList.prototype.Clear.call(this);
  }

  Default() {
    this.First = null;
  }

  Clear() {
    let pPlr = null;
    while ((pPlr = this.First) != null) {
      this.First = pPlr.Next;
      $delete(pPlr);
    }
    this.First = null;
  }

  Execute() {
    let pPlr = null;
    for (pPlr = this.First; pPlr != null; pPlr = pPlr.Next) {
      pPlr.Execute();
    }
    for (pPlr = this.First; pPlr != null; pPlr = pPlr.Next) {
      if (pPlr.Eliminated !== 0 && pPlr.RetireDelay === 0) {
        this.Retire(pPlr);
        break;
      }
    }
  }

  DenumeratePointers() {
    for (let pPlr = this.First; pPlr != null; pPlr = pPlr.Next) {
      pPlr.DenumeratePointers();
    }
  }

  ClearPointers(pObj) {
    for (let pPlr = this.First; pPlr != null; pPlr = pPlr.Next) {
      pPlr.ClearPointers(pObj, false);
    }
  }

  GetCount$v() {
    let iCount = 0;
    for (let pPlr = this.First; pPlr != null; pPlr = pPlr.Next) {
      iCount = iCount + 1 | 0;
    }
    return iCount;
  }

  GetCount$i32(eType) {
    let iCount = 0;
    for (let pPlr = this.First; pPlr != null; pPlr = pPlr.Next) {
      if (pPlr.GetType() === eType) {
        iCount = iCount + 1 | 0;
      }
    }
    return iCount;
  }

  GetIndex(tPlr) {
    let cindex = 0;
    for (let pPlr = this.First; pPlr != null; pPlr = pPlr.Next, cindex = cindex + 1 | 0) {
      if (pPlr === tPlr) {
        return cindex;
      }
    }
    return -1;
  }

  GetCountNotEliminated() {
    let iCount = 0;
    for (let pPlr = this.First; pPlr != null; pPlr = pPlr.Next) {
      if (pPlr.Eliminated === 0) {
        iCount = iCount + 1 | 0;
      }
    }
    return iCount;
  }

  AverageScoreGain() {
    let iResult = 0;
    if (this.First != null) {
      for (let pPlr = this.First; pPlr != null; pPlr = pPlr.Next) {
        iResult = iResult + $max(pPlr.CurrentScore - pPlr.InitialScore | 0, 0) | 0;
      }
      iResult = iResult / this.GetCount$v() | 0;
    }
    return iResult;
  }

  Get(iNumber) {
    for (let pPlr = this.First; pPlr != null; pPlr = pPlr.Next) {
      if (pPlr.Number === iNumber) {
        return pPlr;
      }
    }
    return null;
  }

  GetByIndex$i32(iIndex) {
    let $t1;
    for (let pPlr = this.First; pPlr != null; pPlr = pPlr.Next) {
      if (!(($t1 = iIndex, iIndex = iIndex - 1 | 0, $t1) !== 0)) {
        return pPlr;
      }
    }
    return null;
  }

  GetByIndex$i32$i32(iIndex, eType) {
    let $t1;
    for (let pPlr = this.First; pPlr != null; pPlr = pPlr.Next) {
      if (pPlr.GetType() === eType) {
        if (!(($t1 = iIndex, iIndex = iIndex - 1 | 0, $t1) !== 0)) {
          return pPlr;
        }
      }
    }
    return null;
  }

  GetByName(szName, iExcluding = -1) {
    for (let pPlr = this.First; pPlr != null; pPlr = pPlr.Next) {
      if ($.SEqual(pPlr.GetName(), szName)) {
        if (pPlr.Number !== iExcluding) {
          return pPlr;
        }
      }
    }
    return null;
  }

  GetLocalByIndex(iIndex) {
    let cindex = 0;
    for (let pPlr = this.First; pPlr != null; pPlr = pPlr.Next) {
      if (pPlr.LocalControl) {
        if (cindex === iIndex) {
          return pPlr;
        }
        cindex = cindex + 1 | 0;
      }
    }
    return null;
  }

  GetAtClient$i32$i32(iClient, iIndex = 0) {
    let cindex = 0;
    for (let pPlr = this.First; pPlr != null; pPlr = pPlr.Next) {
      if (pPlr.AtClient === iClient) {
        if (cindex === iIndex) {
          return pPlr;
        }
        cindex = cindex + 1 | 0;
      }
    }
    return null;
  }

  GetAtClient$pi8$i32(szName, iIndex = 0) {
    let cindex = 0;
    for (let pPlr = this.First; pPlr != null; pPlr = pPlr.Next) {
      if ($.SEqualNoCase(P(pPlr.AtClientName, 0), szName)) {
        if (cindex === iIndex) {
          return pPlr;
        }
        cindex = cindex + 1 | 0;
      }
    }
    return null;
  }

  GetAtRemoteClient(iIndex = 0) {
    let cindex = 0;
    for (let pPlr = this.First; pPlr != null; pPlr = pPlr.Next) {
      if (pPlr.AtClient !== $.Control$2.ClientID()) {
        if (cindex === iIndex) {
          return pPlr;
        }
        cindex = cindex + 1 | 0;
      }
    }
    return null;
  }

  GetByInfoID(iInfoID) {
    for (let pPlr = this.First; pPlr != null; pPlr = pPlr.Next) {
      if (pPlr.ID === iInfoID) {
        return pPlr;
      }
    }
    return null;
  }

  Join(szFilename, fScenarioInit, iAtClient, szAtClientName, pInfo, numbers) {
    0;
    0;
    if (szFilename != null && szFilename.a[szFilename.o] === 0) {
      szFilename = null;
    }
    $.LogF($.LoadResStr(fScenarioInit ? S("IDS_PRC_JOINPLR") : S("IDS_PRC_RECREATE")), pInfo.GetName());
    if (true) {
      if ((this.GetCount$v() + 1 | 0) > $.Game.Parameters.MaxPlayers) {
        $.LogF($.LoadResStr(S("IDS_PRC_TOOMANYPLRS")), $.Game.Parameters.MaxPlayers);
        return null;
      }
    }
    if (szFilename != null) {
      if (this.FileInUse(szFilename)) {
        $.Log($.LoadResStr(S("IDS_PRC_PLRFILEINUSE")));
        return null;
      }
    }
    let pPlr = new $.C4Player().init();
    let pLast = this.First;
    while (pLast != null && pLast.Next != null) {
      pLast = pLast.Next;
    }
    if (pLast != null) {
      pLast.Next = pPlr;
    } else {
      this.First = pPlr;
    }
    if (!pPlr.Init(this.GetFreeNumber(), iAtClient, szAtClientName, szFilename, fScenarioInit, pInfo, numbers)) {
      this.Remove$pC4Player$b$b(pPlr, false, false);
      $.Log($.LoadResStr(S("IDS_PRC_JOINFAIL")));
      return null;
    }
    return pPlr;
  }

  JoinNew(szFilename) {
    if ($.Network.isEnabled()) {
      $.Network.Players.JoinLocalPlayer(szFilename);
      return;
    }
    if (!$.ItemExists(szFilename)) {
      return;
    }
    $.Game.PlayerInfos.DoLocalNonNetworkPlayerJoin(szFilename);
  }

  FileInUse(szFilename) {
    let cPlr = this.First;
    for (; cPlr != null; cPlr = cPlr.Next) {
      if ($.ItemIdentical(P(cPlr.Filename, 0), szFilename)) {
        return true;
      }
    }
    if ($.Network.isEnabled()) {
      const szWithPrefix = new Int8Array(4097);
      $.SCopy$pi8$pi8($.GetFilename(szFilename), P(szWithPrefix, 0));
      SetClientPrefix(P(szWithPrefix, 0), $.Game.Clients.getLocalName());
      for (cPlr = this.First; cPlr != null; cPlr = cPlr.Next) {
        if ($.SEqualNoCase($.GetFilename$2(P(cPlr.Filename, 0)), P(szWithPrefix, 0))) {
          return true;
        }
      }
    }
    return false;
  }

  Retire(pPlr) {
    if (pPlr == null) {
      return false;
    }
    if (!pPlr.Evaluated) {
      pPlr.Evaluate();
      if (!$.Control$2.isReplay() && pPlr.GetType() !== 2) {
        pPlr.Save$v();
      }
    }
    this.Remove$pC4Player$b$b(pPlr, false, false);
    return true;
  }

  Evaluate() {
    for (let pPlr = this.First; pPlr != null; pPlr = pPlr.Next) {
      pPlr.Evaluate();
    }
    return true;
  }

  Save$b(fSaveLocalOnly) {
    if ($.Game.C4S.Head.Replay) {
      return true;
    }
    for (let pPlr = this.First; pPlr != null; pPlr = pPlr.Next) {
      if (pPlr.GetType() !== 2) {
        if (!fSaveLocalOnly || pPlr.LocalControl) {
          if (!pPlr.Save$v()) {
            return false;
          }
        }
      }
    }
    return true;
  }

  Save$rC4Group$b$C4PlayerInfoList(hGroup, fStoreTiny, rStoreList) {
    let sTempFilename = new $.StdStrBuf();
    let fSuccess = true;
    for (let pPlr = this.First; pPlr != null; pPlr = pPlr.Next) {
      let pNfo = rStoreList.GetPlayerInfoByID$i32(pPlr.ID);
      if (pNfo == null) {
        continue;
      }
      if (!(pNfo.GetFilename() != null) || !($rd(pNfo.GetFilename()) !== 0)) {
        continue;
      }
      ;
      let fStoreOnOriginal = !fStoreTiny && pNfo.GetType() === 1;
      sTempFilename.Copy$pi8($.Config.AtTempPath(pNfo.GetFilename()));
      if (fStoreOnOriginal) {
        if (!$.C4Group_CopyItem(P(pPlr.Filename, 0), sTempFilename.getData())) {
          return false;
        }
      }
      let PlrGroup = new $.C4Group().init();
      if (!PlrGroup.Open(sTempFilename.getData(), !fStoreOnOriginal)) {
        return false;
      }
      if (!pPlr.Save$rC4Group$b$b(PlrGroup, true, fStoreOnOriginal)) {
        return false;
      }
      PlrGroup.Close$v();
      if (!hGroup.Move(sTempFilename.getData(), pNfo.GetFilename())) {
        return false;
      }
    }
    return fSuccess;
  }

  Remove$i32$b$b(iPlayer, fDisconnect, fNoCalls) {
    return this.Remove$pC4Player$b$b(this.Get(iPlayer), fDisconnect, fNoCalls);
  }

  RemoveUnjoined(iPlayer) {
    let $t1, $t2, $t3;
    $t1 = $.Objects;
    $t2 = $t1.begin();
    $t3 = $t1.end();
    try {
      for (; $t2.op_ne($t3); $t2.op_inc$v()) {
        const pObj = $t2.op_mul();
        if (pObj.Status !== 0) {
          if (pObj.IsPlayerObject(iPlayer)) {
            pObj.AssignRemoval(true);
          }
        }
      }
    } finally { $t2.$dtor(); $t3.$dtor(); }
    return true;
  }

  Remove$pC4Player$b$b(pPlr, fDisconnect, fNoCalls) {
    if (pPlr == null) {
      return false;
    }
    if (!fNoCalls) {
      $.Game.GRBroadcast(S("~RemovePlayer"), new $.C4AulParSet().init$ri32$ri32(P(pPlr, "Number"), P(pPlr, "Team")).op_and());
    }
    if (!fNoCalls) {
      pPlr.NotifyOwnedObjects();
    }
    if (pPlr.ID !== 0) {
      let pInfo = $.Game.PlayerInfos.GetPlayerInfoByID$i32(pPlr.ID);
      if (pInfo != null) {
        pInfo.SetRemoved();
        if (fDisconnect) {
          pInfo.SetDisconnected();
        }
      }
      if (!pPlr.Evaluated) {
        $.Game.RoundResults.EvaluatePlayer(pPlr);
      }
    }
    let pPrev = this.First;
    while (pPrev != null && pPrev.Next !== pPlr) {
      pPrev = pPrev.Next;
    }
    if (pPrev != null) {
      pPrev.Next = pPlr.Next;
    } else {
      this.First = pPlr.Next;
    }
    if (!fNoCalls) {
      pPlr.RemoveCrewObjects();
    }
    pPlr.CrewInfoList.DetachFromObjects();
    $.Viewports.CloseViewport$i32$b(pPlr.Number, fNoCalls);
    $.FullScreen.ViewportCheck();
    $delete(pPlr);
    $.Objects.ValidateOwners();
    $.Console.UpdateMenus();
    return true;
  }

  RemoveAtRemoteClient(fDisconnect, fNoCalls) {
    let pPlr = null;
    while ((pPlr = this.GetAtRemoteClient()) != null) {
      $.Log($.FormatString($.LoadResStr(S("IDS_PRC_REMOVEPLR")), pPlr.GetName()).getData());
      this.Remove$pC4Player$b$b(pPlr, fDisconnect, fNoCalls);
    }
    return true;
  }

  RemoveLocal(fDisconnect, fNoCalls) {
    let pPlr = null;
    do {
      for (pPlr = this.First; pPlr != null; pPlr = pPlr.Next) {
        if (pPlr.LocalControl) {
          $.Log($.FormatString($.LoadResStr(S("IDS_PRC_REMOVEPLR")), pPlr.GetName()).getData());
          this.Remove$pC4Player$b$b(pPlr, fDisconnect, fNoCalls);
          break;
        }
      }
    } while (pPlr != null);
    return true;
  }

  MouseControlTaken() {
    for (let pPlr = this.First; pPlr != null; pPlr = pPlr.Next) {
      if (pPlr.MouseControl !== 0) {
        if (pPlr.LocalControl) {
          return true;
        }
      }
    }
    return false;
  }

  RemoveAtClient$i32$b(iClient, fDisconnect) {
    let pPlr = null;
    while ((pPlr = this.GetAtClient$i32$i32(iClient)) != null) {
      $.Log($.FormatString($.LoadResStr(S("IDS_PRC_REMOVEPLR")), pPlr.GetName()).getData());
      this.Remove$pC4Player$b$b(pPlr, fDisconnect, false);
    }
    return true;
  }

  RemoveAtClient$pi8$b(szName, fDisconnect) {
    let pPlr = null;
    while ((pPlr = this.GetAtClient$pi8$i32(szName)) != null) {
      $.Log($.FormatString($.LoadResStr(S("IDS_PRC_REMOVEPLR")), pPlr.GetName()).getData());
      this.Remove$pC4Player$b$b(pPlr, fDisconnect, false);
    }
    return true;
  }

  CtrlRemove(iPlayer, fDisconnect) {
    $.Game.Input.Add$i32$pC4ControlPacket(146 /*CID_RemovePlr*/, new $.C4ControlRemovePlr().init$i32$b(iPlayer, fDisconnect));
    return true;
  }

  CtrlRemoveAtClient$i32$b(iClient, fDisconnect) {
    for (let pPlr = this.First; pPlr != null; pPlr = pPlr.Next) {
      if (pPlr.AtClient === iClient) {
        if (!this.CtrlRemove(pPlr.Number, fDisconnect)) {
          return false;
        }
      }
    }
    return true;
  }

  CtrlRemoveAtClient$pi8$b(szName, fDisconnect) {
    for (let pPlr = this.First; pPlr != null; pPlr = pPlr.Next) {
      if ($.SEqual(P(pPlr.AtClientName, 0), szName)) {
        if (!this.CtrlRemove(pPlr.Number, fDisconnect)) {
          return false;
        }
      }
    }
    return true;
  }

  Valid(iPlayer) {
    for (let pPlr = this.First; pPlr != null; pPlr = pPlr.Next) {
      if (pPlr.Number === iPlayer) {
        return true;
      }
    }
    return false;
  }

  Hostile(iPlayer1, iPlayer2) {
    let pPlr1 = this.Get(iPlayer1);
    let pPlr2 = this.Get(iPlayer2);
    if (pPlr1 == null || pPlr2 == null) {
      return false;
    }
    if (pPlr1.Number === pPlr2.Number) {
      return false;
    }
    if (pPlr1.IsHostileTowards(pPlr2) || pPlr2.IsHostileTowards(pPlr1)) {
      return true;
    }
    return false;
  }

  HostilityDeclared(iPlayer1, iPlayer2) {
    let pPlr1 = this.Get(iPlayer1);
    let pPlr2 = this.Get(iPlayer2);
    if (pPlr1 == null || pPlr2 == null) {
      return false;
    }
    if (pPlr1.Number === pPlr2.Number) {
      return false;
    }
    if (pPlr1.IsHostileTowards(pPlr2)) {
      return true;
    }
    return false;
  }

  PositionTaken(iPosition) {
    for (let pPlr = this.First; pPlr != null; pPlr = pPlr.Next) {
      if (pPlr.Position === iPosition) {
        return true;
      }
    }
    return false;
  }

  CheckColorDw(dwColor, pExclude) {
    let iDiff = 765;
    for (let pPlr = this.First; pPlr != null; pPlr = pPlr.Next) {
      if (pPlr !== pExclude) {
        let dwClr2 = pPlr.ColorDw;
        iDiff = $min(iDiff, ($.Abs$i32((dwColor & 0xff) - (dwClr2 & 0xff) | 0) + $.Abs$i32(((dwColor & 0xffff) >> 8 & 0xff) - ((dwClr2 & 0xffff) >> 8 & 0xff) | 0) | 0) + $.Abs$i32((dwColor >>> 16 & 0xff) - (dwClr2 >>> 16 & 0xff) | 0) | 0);
      }
    }
    return iDiff;
  }

  SynchronizeLocalFiles() {
    $.Log($.LoadResStr(S("IDS_PRC_SYNCPLRS")));
    let fSuccess = true;
    for (let pPlr = this.First; pPlr != null; pPlr = pPlr.Next) {
      if (pPlr.Eliminated === 0) {
        if (!pPlr.LocalSync()) {
          fSuccess = false;
        }
      }
    }
    return fSuccess;
  }

  HasPlayerInTeamSelection() {
    for (let pPlr = this.First; pPlr != null; pPlr = pPlr.Next) {
      if (pPlr.IsChosingTeam()) {
        return true;
      }
    }
    return false;
  }

  GetFreeNumber() {
    let iNumber = -1;
    let fFree = false;
    do {
      iNumber = iNumber + 1 | 0;
      fFree = true;
      for (let pPlr = this.First; pPlr != null; pPlr = pPlr.Next) {
        if (pPlr.Number === iNumber) {
          fFree = false;
        }
      }
    } while (!fFree);
    return iNumber;
  }

  RecheckPlayerSort(pForPlayer) {
    if (pForPlayer == null || this.First == null) {
      return;
    }
    let iNumber = pForPlayer.Number;
    let pPrev = this.First;
    while (pPrev.Next != null && pPrev.Next.Number <= iNumber) {
      pPrev = pPrev.Next;
    }
    if (pPrev === pForPlayer) {
      return;
    }
    let pOldLink = P(this, "First");
    while (pOldLink.a[pOldLink.o] != null && pOldLink.a[pOldLink.o] !== pForPlayer) {
      pOldLink = P(pOldLink.a[pOldLink.o], "Next");
    }
    if (pOldLink.a[pOldLink.o] != null) {
      pOldLink.a[pOldLink.o] = pForPlayer.Next;
    }
    if (pPrev === this.First && pPrev.Number > iNumber) {
      pForPlayer.Next = pPrev;
      this.First = pForPlayer;
    } else {
      pForPlayer.Next = pPrev.Next;
      pPrev.Next = pForPlayer;
    }
  }

  $clone() { return new C4PlayerList().$assign(this); }
  $assign(o) {
    this.First = o.First;
    return this;
  }
}

export function SetClientPrefix(szFilename, szClient) {
  const szTemp = new Int8Array(1025);
  const szPrefix = new Int8Array(1025);
  $.SCopy$pi8$pi8(szClient, P(szPrefix, 0));
  $.SAppendChar(45, P(szPrefix, 0));
  $.SCopy$pi8$pi8$u64($.GetFilename$2(szFilename), P(szTemp, 0), $.SLen(P(szPrefix, 0)));
  if ($.SEqualNoCase(P(szTemp, 0), P(szPrefix, 0))) {
    return;
  }
  $.SCopy$pi8$pi8($.GetFilename$2(szFilename), P(szTemp, 0));
  $.SCopy$pi8$pi8(P(szPrefix, 0), $.GetFilename$2(szFilename));
  $.SAppend(P(szTemp, 0), szFilename);
}

export function ValidPlr(plr) {
  return $.Players.Valid(plr) ? 1 : 0;
}

export function Hostile(plr1, plr2) {
  return $.Players.Hostile(plr1, plr2) ? 1 : 0;
}


export function $init(): void {
  $.Players = new C4PlayerList(); $.Players.init();
}

Object.assign($, { C4PlayerList, Hostile, SetClientPrefix, ValidPlr });
