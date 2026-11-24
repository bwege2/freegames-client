// @ts-nocheck
// OpenClonk 36de799: src/control/C4GameControl.cpp, src/control/C4GameControl.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete } from '../../rt/std.ts';

export class C4GameControl {
  Input = new $.C4Control().init();
  Network = new $.C4GameControlNetwork();
  eMode = 0;
  fInitComplete = false;
  fHost = false;
  fActivated = false;
  fRecordNeeded = false;
  iClientID = 0;
  pRecord = null;
  pPlayback = null;
  SyncChecks = new $.C4Control().init();
  pClients = null;
  pExecutingControl = null;
  ControlRate = 0;
  ControlTick = 0;
  SyncRate = 0;
  DoSync = false;

  init() {
    this.Input = new $.C4Control().init();
    this.Network = new $.C4GameControlNetwork().init(this);
    this.SyncChecks = new $.C4Control().init();
    C4GameControl.prototype.Default.call(this);
    return this;
  }

  $dtor() {
    C4GameControl.prototype.Clear.call(this);
  }

  isLocal() {
    return this.eMode === 1;
  }

  isNetwork() {
    return this.eMode === 2;
  }

  isReplay() {
    return this.eMode === 3;
  }

  isCtrlHost() {
    return this.fHost;
  }

  isRecord() {
    return !(this.pRecord == null);
  }

  GetRecord() {
    return this.pRecord;
  }

  ClientID() {
    return this.iClientID;
  }

  SyncMode() {
    return this.eMode !== 1 || this.pRecord != null;
  }

  NoInput() {
    return this.isReplay();
  }

  InitLocal(pLocal) {
    this.eMode = 1 /*CM_Local*/;
    this.fInitComplete = true;
    this.fHost = true;
    this.iClientID = pLocal.getID();
    this.ControlRate = 1;
    return true;
  }

  InitNetwork(pLocal) {
    if (!this.Network.IsEnabled()) {
      return false;
    }
    this.eMode = 2 /*CM_Network*/;
    this.fInitComplete = true;
    this.fHost = pLocal.isHost();
    this.iClientID = pLocal.getID();
    this.ControlRate = $.Game.Parameters.ControlRate;
    return true;
  }

  InitReplay(rGroup) {
    this.pPlayback = new $.C4Playback().init();
    if (!this.pPlayback.Open(rGroup)) {
      $.LogFatal($.LoadResStr(S("IDS_ERR_REPLAYREAD")));
      $delete(this.pPlayback);
      this.pPlayback = null;
      return false;
    }
    this.eMode = 3 /*CM_Replay*/;
    this.fInitComplete = true;
    this.fHost = false;
    this.iClientID = -1;
    this.ControlRate = $.Game.Parameters.ControlRate;
    this.StopRecord();
    return true;
  }

  ChangeToLocal() {
    $.Game.Clients.RemoveRemote();
    if ($.Game.Clients.getLocal() != null) {
      $.Game.Clients.getLocal().SetActivated(true);
    }
    if (this.eMode === 2) {
      this.Network.Clear();
      if ($.Network.isEnabled()) {
        $.Network.Clear$v();
      }
    } else if (this.eMode === 3) {
      $delete(this.pPlayback);
      this.pPlayback = null;
    }
    $.Game.PlayerInfos.FixIDCounter();
    if (!$.C4GameOverDlg.IsShown()) {
      $.Game.HaltCount = 0;
    }
    this.eMode = 1 /*CM_Local*/;
    this.fHost = true;
    this.ControlRate = 1;
  }

  Clear() {
    this.StopRecord();
    this.ChangeToLocal();
    this.Default();
  }

  Default() {
    this.Input.Clear();
    this.Network.Clear();
    this.eMode = 0 /*CM_None*/;
    this.fHost = this.fInitComplete = false;
    this.iClientID = -1;
    this.pRecord = null;
    this.pPlayback = null;
    this.SyncChecks.Clear();
    this.ControlRate = $.Clamp$i32$i32$i32($.Config.Network.ControlRate, 1, 20);
    this.ControlTick = 0;
    this.SyncRate = 100;
    this.DoSync = false;
    this.fRecordNeeded = false;
    this.pExecutingControl = null;
  }

  StartRecord(fInitial, fStreaming) {
    0;
    if (this.pRecord != null) {
      this.StopRecord();
    }
    this.pRecord = new $.C4Record().init$v();
    if (!this.pRecord.Start(fInitial)) {
      $delete(this.pRecord);
      this.pRecord = null;
      return false;
    }
    if (fStreaming) {
      if (!this.pRecord.StartStreaming(fInitial) || !$.Network.StartStreaming(this.pRecord)) {
        $delete(this.pRecord);
        this.pRecord = null;
        return false;
      }
    }
    if (this.pExecutingControl != null) {
      this.pRecord.Rec$C4Control$i32(this.pExecutingControl, $.Game.FrameCounter);
    }
    return true;
  }

  StopRecord(pRecordName = null, pRecordSHA1 = null) {
    if (this.pRecord != null) {
      $.Network.FinishStreaming();
      this.pRecord.Stop(pRecordName, pRecordSHA1);
      $delete(this.pRecord);
      this.pRecord = null;
    }
  }

  RequestRuntimeRecord() {
    if (!this.IsRuntimeRecordPossible()) {
      return;
    }
    this.fRecordNeeded = true;
    if ($.Config.General.DebugRec !== 0) {
      $.Control$2.DoInput(134 /*CID_Synchronize*/, new $.C4ControlSynchronize().init(false, true), 0 /*CDT_Queue*/);
    }
  }

  IsRuntimeRecordPossible() {
    if (this.fRecordNeeded) {
      return false;
    }
    if (this.isReplay()) {
      return false;
    }
    if (this.isRecord()) {
      return false;
    }
    return true;
  }

  RecAddFile(szLocalFilename, szAddAs) {
    if (!this.isRecord() || this.pRecord == null) {
      return false;
    }
    return this.pRecord.AddFile(szLocalFilename, szAddAs);
  }

  Prepare() {
    0;
    let is_input_prepared = false;
    switch (this.eMode) {
      case 1:
      case 3:
        return true;
      case 2:
        this.Network.Execute();
        if (this.Input.firstPkt() != null && !$.Game.Clients.getLocal().isActivated()) {
          $.Network.RequestActivate();
        }
        while (this.Network.CtrlNeeded($.Game.FrameCounter)) {
          if (!is_input_prepared && $.Game.Clients.getLocal().isActivated()) {
            this.PrepareInput();
            is_input_prepared = true;
          }
          this.Network.DoInput$C4Control(this.Input);
          this.Input.Clear();
        }
        if ($.Game.FrameCounter % this.ControlRate !== 0) {
          return true;
        }
        return this.Network.CtrlReady(this.ControlTick);
      default:
        return false;
    }
  }

  Execute() {
    0;
    if (!this.isReplay() && $.Game.FrameCounter % this.ControlRate !== 0) {
      return;
    }
    let Control = new $.C4Control().init();
    if (this.eMode === 1) {
      this.PrepareInput();
      Control.Take$rC4Control(this.Input);
    }
    if (this.eMode === 2) {
      if (!this.Network.GetControl(Control, this.ControlTick)) {
        $.LogFatal(S("Network: could not retrieve control from C4GameControlNetwork!"));
        return;
      }
    }
    if (this.eMode === 3) {
      if (this.pPlayback == null) {
        this.ChangeToLocal();
        return;
      }
      this.pPlayback.ExecuteControl(Control, $.Game.FrameCounter);
    }
    if (this.pRecord != null) {
      this.pRecord.Rec$C4Control$i32(Control, $.Game.FrameCounter);
    }
    0;
    this.pExecutingControl = Control;
    Control.Execute();
    Control.Clear();
    this.pExecutingControl = null;
    if ($.Game.pNetworkStatistics != null) {
      $.Game.pNetworkStatistics.ExecuteControlFrame();
    }
  }

  Ticks() {
    0;
    if ($.Game.FrameCounter % this.ControlRate === 0) {
      this.ControlTick = this.ControlTick + 1 | 0;
    }
    if ($.Game.FrameCounter % this.SyncRate === 0) {
      this.DoSync = true;
    }
    if (this.eMode === 2) {
      if (this.Network.CtrlOverflow(this.ControlTick)) {
        $.Game.GameGo = true;
        if (this.Network.GetBehind(this.ControlTick) >= 25) {
          if ($.Game.FrameCounter % ((this.Network.GetBehind(this.ControlTick) + 15 | 0) / 20 | 0) !== 0) {
            $.Game.DoSkipFrame = true;
          }
        }
      }
    }
  }

  CtrlTickReached(iTick) {
    if (this.ControlTick < iTick) {
      return false;
    }
    if ($.Game.FrameCounter % this.ControlRate !== 0) {
      return false;
    }
    return true;
  }

  getCtrlTick(iFrame) {
    return ((iFrame / this.ControlRate | 0) + this.ControlTick | 0) - ($.Game.FrameCounter / this.ControlRate | 0) | 0;
  }

  getNextControlTick() {
    return this.ControlTick + ($.Game.FrameCounter % this.ControlRate !== 0 ? 1 : 0) | 0;
  }

  AdjustControlRate(iBy) {
    if (this.isCtrlHost()) {
      $.Control$2.DoInput(135 /*CID_Set*/, new $.C4ControlSet().init$i32$i32(0 /*C4CVT_ControlRate*/, iBy), 4 /*CDT_Decide*/);
    }
  }

  KeyAdjustControlRate(iBy) {
    this.AdjustControlRate(iBy);
    return true;
  }

  SetActivated(fnActivated) {
    this.fActivated = fnActivated;
    if (this.eMode === 2) {
      this.Network.SetActivated(fnActivated);
    }
  }

  DoInput(eCtrlType, pPkt, eDelivery) {
    0;
    if (eDelivery === 2 || eDelivery === 3) {
      0;
    }
    if (eDelivery === 4) {
      eDelivery = this.DecideControlDelivery();
    }
    if (eDelivery === 0) {
      this.Input.Add$i32$pC4ControlPacket(eCtrlType, pPkt);
      return;
    }
    if (this.isNetwork()) {
      this.Network.DoInput$i32$pC4ControlPacket$i32(eCtrlType, pPkt, eDelivery);
    } else {
      this.ExecControlPacket(eCtrlType, pPkt);
      $delete(pPkt);
    }
  }

  DbgRec(eType, pData = null, iSize = 0) {
    if ($.Config.General.DebugRec !== 0) {
      if ($.DoNoDebugRec > 0) {
        return;
      }
      if (this.pRecord != null) {
        let dr = new $.C4PktDebugRec().init$i32$StdBuf(eType, new $.StdBuf().init$px$u64$b(pData, iSize));
        this.pRecord.Rec$i32$StdBuf$i32($.Game.FrameCounter, $.DecompileToBuf$C4PktDebugRec(dr), eType);
      }
      if (this.pPlayback != null) {
        this.pPlayback.Check(eType, pData, iSize | 0);
      }
    }
  }

  DecideControlDelivery() {
    if (this.eMode === 2) {
      return this.Network.DecideControlDelivery();
    }
    return 2 /*CDT_Direct*/;
  }

  DoSyncCheck() {
    if (!this.DoSync) {
      return;
    }
    this.DoSync = false;
    let pSyncCheck = new $.C4ControlSyncCheck().init();
    pSyncCheck.Set$v();
    if (this.fHost) {
      this.DoInput(133 /*CID_SyncCheck*/, pSyncCheck, this.fActivated ? 0 /*CDT_Queue*/ : 2 /*CDT_Direct*/);
    } else {
      let pSyncCheck2 = this.GetSyncCheck($.Game.FrameCounter);
      if (pSyncCheck2 == null) {
        this.SyncChecks.Add$i32$pC4ControlPacket(133 /*CID_SyncCheck*/, pSyncCheck);
      } else {
        pSyncCheck.Execute();
        $delete(pSyncCheck);
      }
    }
    this.RemoveOldSyncChecks();
  }

  ExecControl(rCtrl) {
    if (!(rCtrl.firstPkt() != null)) {
      return;
    }
    if (!rCtrl.PreExecute()) {
      $.Log(S("Control: PreExecute failed for sync control!"));
    }
    rCtrl.Execute();
    if (this.pRecord != null) {
      this.pRecord.Rec$C4Control$i32(rCtrl, $.Game.FrameCounter);
    }
  }

  ExecControlPacket(eCtrlType, pPkt) {
    if (!pPkt.PreExecute()) {
      $.Log(S("Control: PreExecute failed for direct control!"));
    }
    pPkt.Execute();
    if (this.pRecord != null) {
      this.pRecord.Rec$i32$pC4ControlPacket$i32(eCtrlType, pPkt, $.Game.FrameCounter);
    }
  }

  OnGameSynchronizing() {
    if (this.fRecordNeeded) {
      this.fRecordNeeded = false;
      this.StartRecord(false, false);
    }
  }

  GetSyncCheck(iTick) {
    for (let pPkt = this.SyncChecks.firstPkt(); pPkt != null; pPkt = this.SyncChecks.nextPkt(pPkt)) {
      if (pPkt.getPktType() !== 133) {
        continue;
      }
      let pCheck = pPkt.getPkt();
      if (pCheck.getFrame() === iTick) {
        return pCheck;
      }
    }
    return null;
  }

  RemoveOldSyncChecks() {
    let pNext = null;
    for (let pPkt = this.SyncChecks.firstPkt(); pPkt != null; pPkt = pNext) {
      pNext = this.SyncChecks.nextPkt(pPkt);
      if (pPkt.getPktType() !== 133) {
        continue;
      }
      let pCheck = pPkt.getPkt();
      if (pCheck.getFrame() < ($.Game.FrameCounter - 50 | 0)) {
        this.SyncChecks.Delete(pPkt);
      }
    }
  }

  PrepareInput() {
    let $t1;
    $.MouseControl.DoMoveInput();
    if ($.Application.pGamePadControl != null) {
      $.Application.pGamePadControl.DoAxisInput();
    }
    let plr = null;
    let i = 0;
    while ((plr = $.Players.GetLocalByIndex(($t1 = i, i = i + 1 | 0, $t1))) != null) {
      plr.Control.PrepareInput();
    }
  }

  $clone() { return new C4GameControl().$assign(this); }
  $assign(o) {
    this.Input.$assign(o.Input);
    this.Network.$assign(o.Network);
    this.eMode = o.eMode;
    this.fInitComplete = o.fInitComplete;
    this.fHost = o.fHost;
    this.fActivated = o.fActivated;
    this.fRecordNeeded = o.fRecordNeeded;
    this.iClientID = o.iClientID;
    this.pRecord = o.pRecord;
    this.pPlayback = o.pPlayback;
    this.SyncChecks.$assign(o.SyncChecks);
    this.pClients = o.pClients;
    this.pExecutingControl = o.pExecutingControl;
    this.ControlRate = o.ControlRate;
    this.ControlTick = o.ControlTick;
    this.SyncRate = o.SyncRate;
    this.DoSync = o.DoSync;
    return this;
  }
}




export function $init(): void {
  $.C4SyncCheckRate$C4GameControl = 100;
  $.C4SyncCheckMaxKeep$C4GameControl = 50;
  $.Control$2 = new C4GameControl(); $.Control$2.init();
}

Object.assign($, { C4GameControl });
