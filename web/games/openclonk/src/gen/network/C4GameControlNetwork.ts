// @ts-nocheck
// OpenClonk 36de799: src/network/C4GameControlNetwork.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { C4PacketBase } from './C4PacketBase.ts';
import { P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete, $max, $min } from '../../rt/std.ts';

export class C4GameControlNetwork {
  fEnabled = false;
  fRunning = false;
  iClientID = 0;
  fHost = false;
  fActivated = false;
  eMode = 0;
  iTargetTick = 0;
  iControlPreSend = 0;
  tWaitStart = new $.C4TimeMilliseconds();
  iAvgControlSendTime = 0;
  iTargetFPS = 0;
  iControlSent = 0;
  iControlReady = 0;
  pCtrlStack = null;
  CtrlCSec = new $.CStdCSec().init();
  pClients = null;
  ClientsCSec = new $.CStdCSec().init();
  SyncControl = new $.C4Control().init();
  pSyncCtrlQueue = null;
  tNextControlRequest = new $.C4TimeMilliseconds();
  pParent = null;
  pNetwork = null;

  init(pnParent) {
    this.fEnabled = false;
    this.fRunning = false;
    this.iClientID = -1;
    this.fActivated = false;
    this.iTargetTick = -1;
    this.iControlPreSend = 1;
    this.tWaitStart = new $.C4TimeMilliseconds().init$i32(1 /*PositiveInfinity*/);
    this.iAvgControlSendTime = 0;
    this.iTargetFPS = 38;
    this.iControlSent = 0;
    this.iControlReady = 0;
    this.pCtrlStack = null;
    this.CtrlCSec = new $.CStdCSec().init();
    this.ClientsCSec = new $.CStdCSec().init();
    this.SyncControl = new $.C4Control().init();
    this.tNextControlRequest = new $.C4TimeMilliseconds().init$u32(0);
    this.pParent = pnParent;
    0;
    return this;
  }

  $dtor() {
    C4GameControlNetwork.prototype.Clear.call(this);
  }

  IsEnabled() {
    return this.fEnabled;
  }

  IsRunning() {
    return this.fRunning;
  }

  IsActivated() {
    return this.fActivated;
  }

  getControlPreSend() {
    return this.iControlPreSend;
  }

  setControlPreSend(iToVal) {
    this.iControlPreSend = $min(iToVal, $.C4MaxPreSend$C4GameControlNetwork);
  }

  getAvgControlSendTime() {
    return this.iAvgControlSendTime;
  }

  setTargetFPS(iToVal) {
    this.iTargetFPS = iToVal;
  }

  Init(inClientID, fnHost, iStartTick, fnActivated, pnNetwork) {
    if (this.IsEnabled()) {
      this.Clear();
    }
    this.iClientID = inClientID;
    this.fHost = fnHost;
    $.Control$2.ControlTick = iStartTick;
    this.iControlSent = this.iControlReady = $.Control$2.getNextControlTick() - 1 | 0;
    this.fActivated = fnActivated;
    this.pNetwork = pnNetwork;
    this.CheckCompleteCtrl(false);
    this.pNetwork.Clients.BroadcastMsgToConnClients($.MkC4NetIOPacket(65, new C4PacketControlReq().init(this.iControlReady + 1 | 0)));
    this.fEnabled = true;
    this.fRunning = false;
    this.iTargetFPS = 38;
    this.tNextControlRequest.$assign($.op_add$C4TimeMilliseconds$u32($.C4TimeMilliseconds.Now(), $.C4ControlRequestInterval$C4GameControlNetwork));
    this.tWaitStart.$assign(new $.C4TimeMilliseconds().init$i32(1 /*PositiveInfinity*/));
    return true;
  }

  Clear() {
    this.fEnabled = false;
    this.fRunning = false;
    this.iAvgControlSendTime = 0;
    this.ClearCtrl();
    this.ClearClients();
    this.SyncControl.Clear();
    while (this.pSyncCtrlQueue != null) {
      let pPkt = this.pSyncCtrlQueue;
      this.pSyncCtrlQueue = pPkt.pNext;
      $delete(pPkt);
    }
  }

  Execute() {
    if ($.Game.FrameCounter % $.Control$2.ControlRate !== 0) {
      return;
    }
    this.tWaitStart.$assign($.C4TimeMilliseconds.Now());
    this.ExecQueuedSyncCtrl();
  }

  CtrlReady(iTick) {
    this.CheckCompleteCtrl(false);
    return this.iControlReady >= iTick;
  }

  CtrlOverflow(iTick) {
    return this.fRunning && this.iControlReady >= (iTick + 3 | 0);
  }

  GetBehind(iTick) {
    return (this.iControlReady - iTick | 0) + 1 | 0;
  }

  GetControl(pCtrl, iTick) {
    let CtrlLock = new $.CStdLock().init(this.CtrlCSec);
    let pPkt = this.getCtrl(-1, iTick);
    if (pPkt == null) {
      return false;
    }
    pCtrl.Clear();
    pCtrl.Append$C4Control(pPkt.getControl());
    this.CalcPerformance(iTick);
    this.tWaitStart.$assign(new $.C4TimeMilliseconds().init$i32(1 /*PositiveInfinity*/));
    return true;
  }

  ClientReady(iClientID, iTick) {
    if (this.eMode === 1 && !this.fHost) {
      return true;
    }
    return !!(this.getCtrl(iClientID, iTick) != null);
  }

  ClientPerfStat(iClientID) {
    if (this.eMode === 1 && !this.fHost) {
      return 1;
    }
    let ClientsLock = new $.CStdLock().init(this.ClientsCSec);
    let pClient = this.getClient(iClientID);
    return pClient != null ? pClient.getPerfStat() : 0;
  }

  ClientNextControl(iClientID) {
    let ClientsLock = new $.CStdLock().init(this.ClientsCSec);
    let pClient = this.getClient(iClientID);
    return pClient != null ? pClient.getNextControl() : 0;
  }

  CtrlNeeded(iFrame) {
    if (!this.IsEnabled() || !this.fActivated) {
      return false;
    }
    let iSendFor = this.pParent.getCtrlTick(iFrame + this.iControlPreSend | 0);
    if (this.iTargetTick >= 0 && this.iControlSent >= this.iTargetTick) {
      return false;
    }
    return iSendFor > this.iControlSent;
  }

  DoInput$C4Control(Input) {
    if (!this.fEnabled) {
      return;
    }
    let pCtrl = new C4GameControlPacket().init();
    pCtrl.Set$i32$i32$C4Control(this.iClientID, this.iControlSent + 1 | 0, Input);
    let CtrlPkt = $.MkC4NetIOPacket(64, pCtrl);
    if (this.eMode !== 0) {
      if (!this.fHost) {
        if (!this.pNetwork.Clients.SendMsgToHost(CtrlPkt.$clone())) {
          $.Application.InteractiveThread.ThreadLog(S("Failed to send control to host!"));
        }
      }
    } else {
      0;
      if (!this.pNetwork.Clients.BroadcastMsgToClients(CtrlPkt)) {
        $.Application.InteractiveThread.ThreadLog(S("Failed to broadcast control!"));
      }
    }
    this.AddCtrl(pCtrl);
    this.iControlSent = this.iControlSent + 1 | 0;
    this.CheckCompleteCtrl(false);
  }

  DoInput$i32$pC4ControlPacket$i32(eCtrlType, pCtrl, eDelivery) {
    if (!this.fEnabled) {
      return;
    }
    let CtrlPkt = new C4PacketControlPkt().init$i32$C4IDPacket(eDelivery, new $.C4IDPacket().init$i32$pC4PacketBase$b(eCtrlType, pCtrl, false));
    switch (eDelivery) {
      case 1:
        {
          if (!this.fHost) {
            if (!$.Network.Clients.SendMsgToHost($.MkC4NetIOPacket(66, CtrlPkt))) {
              $.LogFatal(S("Network: could not send direct control packet!"));
              break;
            }
            $delete(pCtrl);
          } else {
            $.Network.Clients.BroadcastMsgToClients($.MkC4NetIOPacket(66, CtrlPkt));
            if ($.Network.isFrozen()) {
              this.pParent.ExecControlPacket(eCtrlType, pCtrl);
              $delete(pCtrl);
              let Pkt = new C4PacketExecSyncCtrl().init(this.pParent.ControlTick);
              $.Network.Clients.BroadcastMsgToClients($.MkC4NetIOPacket(67, Pkt));
            } else {
              this.SyncControl.Add$i32$pC4ControlPacket(eCtrlType, pCtrl);
              $.Network.Sync();
            }
          }
        }
        break;
      case 2:
      case 3:
        {
          if (!$.Network.Clients.BroadcastMsgToClients($.MkC4NetIOPacket(66, CtrlPkt))) {
            $.LogFatal(S("Network: could not send direct control packet!"));
            break;
          }
          this.pParent.ExecControlPacket(eCtrlType, pCtrl);
          $delete(pCtrl);
        }
        break;
      default:
        0;
    }
  }

  DecideControlDelivery() {
    if (!this.fHost) {
      return 0 /*CDT_Queue*/;
    }
    if ($.Network.isFrozen()) {
      return 1 /*CDT_Sync*/;
    }
    if (!$.Game.Clients.getLocal().isActivated()) {
      return 1 /*CDT_Sync*/;
    }
    return 0 /*CDT_Queue*/;
  }

  ExecSyncControl$v() {
    0;
    if (!(this.SyncControl.firstPkt() != null)) {
      return;
    }
    let Pkt = new C4PacketExecSyncCtrl().init(this.pParent.ControlTick);
    $.Network.Clients.BroadcastMsgToClients($.MkC4NetIOPacket(67, Pkt));
    this.ExecSyncControl$i32(Pkt.getControlTick());
  }

  ExecSyncControl$i32(iControlTick) {
    if (!(this.SyncControl.firstPkt() != null)) {
      return;
    }
    let Control = this.SyncControl.$clone();
    this.SyncControl.Clear();
    if (this.pParent.ControlTick === iControlTick) {
      this.pParent.ExecControl(Control);
    } else if (this.pParent.ControlTick > iControlTick) {
      $.LogF(S("Network: Fatal: got sync control to execute for ctrl tick %d, but already in ctrl tick %d!"), iControlTick, this.pParent.ControlTick);
    } else {
      this.AddSyncCtrlToQueue(Control, iControlTick);
    }
  }

  CopyClientList(rClients) {
    let ClientLock = new $.CStdLock().init(this.ClientsCSec);
    this.ClearClients();
    let pClient = null;
    while ((pClient = rClients.getClient(pClient)) != null) {
      if (pClient.isActivated()) {
        this.AddClient$i32$pi8(pClient.getID(), pClient.getName());
      }
    }
  }

  SetRunning(fnRunning, inTargetTick = -1) {
    0;
    if ((this.fRunning ? 1 : 0) === (fnRunning ? 1 : 0) && this.iTargetTick === inTargetTick) {
      return;
    }
    this.fRunning = false;
    this.iTargetTick = inTargetTick;
    this.fRunning = fnRunning;
    if (this.fRunning) {
      this.CopyClientList($.Game.Clients);
      this.CheckCompleteCtrl(false);
    }
  }

  SetActivated(fnActivated) {
    0;
    if ((this.fActivated ? 1 : 0) === (fnActivated ? 1 : 0)) {
      return;
    }
    this.fActivated = fnActivated;
    if (this.fActivated) {
      this.iControlSent = $.Control$2.getNextControlTick() - 1 | 0;
    }
  }

  SetCtrlMode(enMode) {
    0;
    if (this.eMode === enMode) {
      return;
    }
    this.eMode = enMode;
    if (enMode === 0) {
      let CtrlLock = new $.CStdLock().init(this.CtrlCSec);
      let pPkt = null;
      for (let iCtrlTick = $.Control$2.ControlTick; (pPkt = this.getCtrl(this.iClientID, iCtrlTick)) != null; iCtrlTick = iCtrlTick + 1 | 0) {
        $.Network.Clients.BroadcastMsgToClients($.MkC4NetIOPacket(64, pPkt));
      }
    } else if (enMode === 1 && this.fHost) {
      let CtrlLock = new $.CStdLock().init(this.CtrlCSec);
      let pPkt = null;
      for (let iCtrlTick = $.Control$2.ControlTick; (pPkt = this.getCtrl(-1, iCtrlTick)) != null; iCtrlTick = iCtrlTick + 1 | 0) {
        $.Network.Clients.BroadcastMsgToClients($.MkC4NetIOPacket(64, pPkt));
      }
    }
  }

  GetCtrlMode() {
    return this.eMode;
  }

  CalcPerformance(iCtrlTick) {
    let ControlLock = new $.CStdLock().init(this.CtrlCSec);
    let ClientLock = new $.CStdLock().init(this.ClientsCSec);
    0;
    let iClientsPing = 0;
    let iPingClientCount = 0;
    let iNumTunnels = 0;
    let iHostPing = 0;
    for (let pClient = this.pClients; pClient != null; pClient = pClient.pNext) {
      let pNetClt = $.Network.Clients.GetClientByID(pClient.getClientID());
      if (pNetClt != null && !pNetClt.isLocal()) {
        let pConn = pNetClt.getMsgConn();
        if (pConn == null) {
          iNumTunnels = iNumTunnels + 1 | 0;
        } else if (pClient.getClientID() === 0) {
          iHostPing = pConn.getPingTime();
        } else {
          iClientsPing = iClientsPing + pConn.getPingTime() | 0;
          iPingClientCount = iPingClientCount + 1 | 0;
        }
      }
      let pCtrl = this.getCtrl(pClient.getClientID(), iCtrlTick);
      if (pCtrl == null || this.tWaitStart.IsInfinite()) {
        continue;
      }
      pClient.AddPerf($.op_sub$C4TimeMilliseconds$C4TimeMilliseconds(pCtrl.getTime(), this.tWaitStart));
    }
    let iControlSendTime = 0;
    if (this.eMode === 0) {
      iControlSendTime = (iClientsPing + Math.imul(iHostPing, iNumTunnels + 1 | 0) | 0) / ((iPingClientCount + iNumTunnels | 0) + 1 | 0) | 0;
      if (iNumTunnels === 0) {
        iControlSendTime = iControlSendTime / 2 | 0;
      }
    } else {
      iControlSendTime = iHostPing;
    }
    if (iControlSendTime !== 0) {
      this.iAvgControlSendTime = (Math.imul(this.iAvgControlSendTime, 149) + Math.imul(iControlSendTime, 1000) | 0) / 150 | 0;
      let iBestPreSend = $.Clamp$i32$i32$i32((Math.imul(this.iTargetFPS, this.iAvgControlSendTime) / 0xf4240 | 0) + 1 | 0, 1, 15);
      if (this.iTargetFPS <= 0) {
        iBestPreSend = -this.iTargetFPS | 0;
      }
      if (this.getControlPreSend() !== iBestPreSend) {
        this.setControlPreSend(iBestPreSend);
        $.GraphicsSystem.FlashMessage($.FormatString(S("PreSend: %d  - TargetFPS: %d"), iBestPreSend, this.iTargetFPS).getData());
      }
    }
  }

  HandlePacket(cStatus, pPacket, pConn) {
    if (pConn == null) {
      return;
    }
    switch (cStatus) {
      case 64:
        {
          0;
          const rPkt = pPacket;
          this.HandleControl(pConn.getClientID(), rPkt);
        }
        break;
      case 65:
        {
          if (!this.IsEnabled()) {
            break;
          }
          if (pConn.isClosed() || !pConn.isAccepted()) {
            break;
          }
          0;
          const rPkt = pPacket;
          this.HandleControlReq(rPkt, pConn);
        }
        break;
      case 66:
        {
          0;
          const rPkt = pPacket;
          if (!this.fEnabled) {
            break;
          }
          if (rPkt.getCtrl().getPktType() < 128) {
            break;
          }
          let Copy = new $.C4IDPacket().$copy(rPkt.getCtrl());
          let pCtrlPkt = Copy.getPkt();
          if (!pConn.isHost() && pConn.getClientID() !== pCtrlPkt.getByClient()) {
            break;
          }
          this.HandleControlPkt(Copy.getPktType(), pCtrlPkt, rPkt.getDelivery());
          Copy.Default();
        }
        break;
      case 67:
        {
          0;
          const rPkt = pPacket;
          if (!this.fEnabled) {
            break;
          }
          this.ExecSyncControl$i32(rPkt.getControlTick());
        }
        break;
    }
  }

  OnResComplete(pRes) {
    if (pRes.getType() === 3) {
      this.CheckCompleteCtrl(true);
    }
  }

  AddClient$i32$pi8(iClientID, szName) {
    if (!this.fEnabled || this.getClient(iClientID) != null) {
      return;
    }
    let pClient = new C4GameControlClient().init();
    pClient.Set(iClientID, szName);
    pClient.SetNextControl($.Control$2.ControlTick);
    this.AddClient$pC4GameControlClient(pClient);
  }

  ClearClients() {
    let ClientsLock = new $.CStdLock().init(this.ClientsCSec);
    while (this.pClients != null) {
      let pClient = this.pClients;
      this.RemoveClient$pC4GameControlClient(pClient);
      $delete(pClient);
    }
  }

  HandleControl(_iByClientID, rPkt) {
    if (this.getCtrl(rPkt.getClientID(), rPkt.getCtrlTick()) != null) {
      return;
    }
    let pCopy = new C4GameControlPacket().$copy(rPkt);
    this.AddCtrl(pCopy);
    if (this.IsEnabled()) {
      this.CheckCompleteCtrl(true);
    }
  }

  HandleControlReq(rPkt, pConn) {
    let CtrlLock = new $.CStdLock().init(this.CtrlCSec);
    for (let iTick = rPkt.getCtrlTick(); ; iTick = iTick + 1 | 0) {
      let pCtrl = this.getCtrl(-1, iTick);
      if (pCtrl != null) {
        pConn.Send($.MkC4NetIOPacket(64, pCtrl));
        continue;
      }
      let fFound = false;
      for (pCtrl = this.pCtrlStack; pCtrl != null; pCtrl = pCtrl.pNext) {
        if (pCtrl.getCtrlTick() === iTick) {
          pConn.Send($.MkC4NetIOPacket(64, pCtrl));
          fFound = true;
        }
      }
      if (!fFound) {
        break;
      }
    }
  }

  HandleControlPkt(eCtrlType, pCtrl, eType) {
    if (eType === 2 || eType === 3) {
      this.pParent.ExecControlPacket(eCtrlType, pCtrl);
      $delete(pCtrl);
      return;
    }
    if (this.fHost && eType === 1) {
      this.DoInput$i32$pC4ControlPacket$i32(eCtrlType, pCtrl, eType);
      return;
    }
    this.ExecQueuedSyncCtrl();
    if ($.Network.isFrozen()) {
      this.pParent.ExecControlPacket(eCtrlType, pCtrl);
      $delete(pCtrl);
    } else {
      this.SyncControl.Add$i32$pC4ControlPacket(eCtrlType, pCtrl);
    }
  }

  getClient(iID) {
    let ClientsLock = new $.CStdLock().init(this.ClientsCSec);
    for (let pClient = this.pClients; pClient != null; pClient = pClient.pNext) {
      if (pClient.getClientID() === iID) {
        return pClient;
      }
    }
    return null;
  }

  AddClient$pC4GameControlClient(pClient) {
    if (pClient == null) {
      return;
    }
    let ClientsLock = new $.CStdLock().init(this.ClientsCSec);
    let pPrev = null;
    let pPos = this.pClients;
    for (; pPos != null; pPrev = pPos, pPos = pPos.pNext) {
      if (pPos.getClientID() > pClient.getClientID()) {
        break;
      }
    }
    (($v) => pPrev != null ? (pPrev.pNext = $v) : (this.pClients = $v))(pClient);
    pClient.pNext = pPos;
  }

  RemoveClient$pC4GameControlClient(pClient) {
    let ClientsLock = new $.CStdLock().init(this.ClientsCSec);
    if (pClient === this.pClients) {
      this.pClients = pClient.pNext;
    } else {
      let pPrev = null;
      for (pPrev = this.pClients; pPrev != null && pPrev.pNext != null; pPrev = pPrev.pNext) {
        if (pPrev.pNext === pClient) {
          break;
        }
      }
      if (pPrev != null && pPrev.pNext === pClient) {
        pPrev.pNext = pClient.pNext;
      }
    }
  }

  getCtrl(iClientID, iCtrlTick) {
    let CtrlLock = new $.CStdLock().init(this.CtrlCSec);
    for (let pCtrl = this.pCtrlStack; pCtrl != null; pCtrl = pCtrl.pNext) {
      if (pCtrl.getClientID() === iClientID && pCtrl.getCtrlTick() === iCtrlTick) {
        return pCtrl;
      }
    }
    return null;
  }

  AddCtrl(pCtrl) {
    let CtrlLock = new $.CStdLock().init(this.CtrlCSec);
    pCtrl.pNext = this.pCtrlStack;
    this.pCtrlStack = pCtrl;
  }

  ClearCtrl(iBeforeTick = -1) {
    let CtrlLock = new $.CStdLock().init(this.CtrlCSec);
    let pCtrl = this.pCtrlStack;
    let pLast = null;
    while (pCtrl != null) {
      if (iBeforeTick === -1 || pCtrl.getCtrlTick() < iBeforeTick) {
        let pDelete = pCtrl;
        pCtrl = pCtrl.pNext;
        (($v) => pLast != null ? (pLast.pNext = $v) : (this.pCtrlStack = $v))(pCtrl);
        $delete(pDelete);
      } else {
        pLast = pCtrl;
        pCtrl = pCtrl.pNext;
      }
    }
  }

  CheckCompleteCtrl(fSetEvent) {
    if (!this.fRunning || !this.fEnabled) {
      return;
    }
    let CtrlLock = new $.CStdLock().init(this.CtrlCSec);
    let ClientLock = new $.CStdLock().init(this.ClientsCSec);
    for (; ; ) {
      let pComplete = this.getCtrl(-1, this.iControlReady + 1 | 0);
      let iStopTick = this.iTargetTick;
      if (this.pSyncCtrlQueue != null) {
        if (iStopTick < 0 || iStopTick > this.pSyncCtrlQueue.getCtrlTick()) {
          iStopTick = this.pSyncCtrlQueue.getCtrlTick();
        }
      }
      if (pComplete == null) {
        if (this.fActivated && this.iControlSent <= this.iControlReady) {
          break;
        }
        if (this.pClients == null && $.Control$2.ControlTick <= this.iControlReady) {
          break;
        }
        if (iStopTick >= 0 && (this.iControlReady + 1 | 0) >= iStopTick) {
          break;
        }
        if (this.eMode !== 0 && !this.fHost) {
          break;
        }
        if (!((pComplete = this.PackCompleteCtrl(this.iControlReady + 1 | 0)) != null)) {
          break;
        }
      }
      if (!pComplete.getControl().PreExecute()) {
        break;
      }
      this.iControlReady = this.iControlReady + 1 | 0;
      if (fSetEvent && $.Game.GameGo && this.iControlReady >= $.Control$2.ControlTick) {
        $.Application.NextTick();
      }
    }
    if ($.Control$2.ControlTick >= 100) {
      this.ClearCtrl($.Control$2.ControlTick - 100 | 0);
    }
    if (this.iControlReady < this.iTargetTick && (!this.fActivated || this.iControlSent > this.iControlReady) && $.op_ge($.C4TimeMilliseconds.Now(), this.tNextControlRequest)) {
      $.Application.InteractiveThread.ThreadLogS(S("Network: Recovering: Requesting control for tick %d..."), this.iControlReady + 1 | 0);
      let Pkt = $.MkC4NetIOPacket(65, new C4PacketControlReq().init(this.iControlReady + 1 | 0));
      if (this.eMode === 1) {
        $.Network.Clients.SendMsgToHost(Pkt.$clone());
      } else {
        $.Network.Clients.BroadcastMsgToConnClients(Pkt);
      }
      this.tNextControlRequest.$assign($.op_add$C4TimeMilliseconds$u32($.C4TimeMilliseconds.Now(), $.C4ControlRequestInterval$C4GameControlNetwork));
    }
  }

  PackCompleteCtrl(iTick) {
    let CtrlLock = new $.CStdLock().init(this.CtrlCSec);
    let ClientLock = new $.CStdLock().init(this.ClientsCSec);
    let pClient = null;
    for (pClient = this.pClients; pClient != null; pClient = pClient.pNext) {
      if (!(this.getCtrl(pClient.getClientID(), iTick) != null)) {
        break;
      }
    }
    if (pClient != null) {
      let iMaxWait = Math.imul($.Config.Network.AsyncMaxWait, 1000) / this.iTargetFPS | 0;
      if (this.eMode !== 2 || $.op_le($.C4TimeMilliseconds.Now(), $.op_add$C4TimeMilliseconds$u32(this.tWaitStart.$clone(), iMaxWait >>> 0))) {
        return null;
      }
    }
    let pComplete = new C4GameControlPacket().init();
    pComplete.Set$i32$i32(-1, iTick);
    let pCtrl = null;
    for (pClient = this.pClients; pClient != null; pClient = pClient.pNext) {
      while (pClient.getNextControl() <= iTick) {
        let iNextControl = pClient.getNextControl();
        pCtrl = this.getCtrl(pClient.getClientID(), iNextControl);
        if (pCtrl == null) {
          break;
        }
        pClient.SetNextControl(iNextControl + 1 | 0);
        0;
        pComplete.Add$C4GameControlPacket(pCtrl);
      }
    }
    this.AddCtrl(pComplete);
    if (this.eMode !== 0) {
      $.Network.Clients.BroadcastMsgToConnClients($.MkC4NetIOPacket(64, pComplete));
    }
    this.tNextControlRequest.$assign($max(this.tNextControlRequest, $.op_add$C4TimeMilliseconds$u32($.C4TimeMilliseconds.Now(), $.C4ControlRequestInterval$C4GameControlNetwork)));
    return pComplete;
  }

  AddSyncCtrlToQueue(Ctrl, iTick) {
    let pAfter = null;
    let pBefore = this.pSyncCtrlQueue;
    while (pBefore != null && pBefore.getCtrlTick() <= iTick) {
      pAfter = pBefore;
      pBefore = pBefore.pNext;
    }
    let pnPkt = new C4GameControlPacket().init();
    pnPkt.Set$i32$i32$C4Control(-1, iTick, Ctrl);
    (($v) => pAfter != null ? (pAfter.pNext = $v) : (this.pSyncCtrlQueue = $v))(pnPkt);
    pnPkt.pNext = pBefore;
  }

  ExecQueuedSyncCtrl() {
    while (this.pSyncCtrlQueue != null && this.pSyncCtrlQueue.getCtrlTick() < this.pParent.ControlTick) {
      $.LogF(S("Network: Fatal: got sync control to execute for ctrl tick %d, but already in ctrl tick %d!"), this.pSyncCtrlQueue.getCtrlTick(), this.pParent.ControlTick);
      let pPkt = this.pSyncCtrlQueue;
      this.pSyncCtrlQueue = pPkt.pNext;
      $delete(pPkt);
    }
    if (this.pSyncCtrlQueue == null || this.pSyncCtrlQueue.getCtrlTick() > this.pParent.ControlTick) {
      return;
    }
    0;
    do {
      this.pParent.ExecControl(this.pSyncCtrlQueue.getControl());
      let pPkt = this.pSyncCtrlQueue;
      this.pSyncCtrlQueue = pPkt.pNext;
      $delete(pPkt);
    } while (this.pSyncCtrlQueue != null && this.pSyncCtrlQueue.getCtrlTick() === this.pParent.ControlTick);
    this.CopyClientList($.Game.Clients);
  }

  $clone() { return new C4GameControlNetwork().$assign(this); }
  $assign(o) {
    this.fEnabled = o.fEnabled;
    this.fRunning = o.fRunning;
    this.iClientID = o.iClientID;
    this.fHost = o.fHost;
    this.fActivated = o.fActivated;
    this.eMode = o.eMode;
    this.iTargetTick = o.iTargetTick;
    this.iControlPreSend = o.iControlPreSend;
    this.tWaitStart.$assign(o.tWaitStart);
    this.iAvgControlSendTime = o.iAvgControlSendTime;
    this.iTargetFPS = o.iTargetFPS;
    this.iControlSent = o.iControlSent;
    this.iControlReady = o.iControlReady;
    this.pCtrlStack = o.pCtrlStack;
    this.CtrlCSec.$assign(o.CtrlCSec);
    this.pClients = o.pClients;
    this.ClientsCSec.$assign(o.ClientsCSec);
    this.SyncControl.$assign(o.SyncControl);
    this.pSyncCtrlQueue = o.pSyncCtrlQueue;
    this.tNextControlRequest.$assign(o.tNextControlRequest);
    this.pParent = o.pParent;
    this.pNetwork = o.pNetwork;
    return this;
  }
}

export class C4GameControlClient {
  iClientID = 0;
  szName = new Int8Array(31);
  iNextControl = 0;
  iPerformance = 0;
  pNext = null;

  init() {
    this.iClientID = -1;
    this.iNextControl = 0;
    this.iPerformance = 0;
    this.szName[0] = 0;
    return this;
  }

  getClientID() {
    return this.iClientID;
  }

  getName() {
    return P(this.szName, 0);
  }

  getNextControl() {
    return this.iNextControl;
  }

  getPerfStat() {
    return this.iPerformance / 100 | 0;
  }

  Set(inClientID, sznName) {
    this.iClientID = inClientID;
    $.SCopy$pi8$pi8$u64(sznName, P(this.szName, 0), 30);
  }

  SetNextControl(inNextControl) {
    this.iNextControl = inNextControl;
  }

  AddPerf(iTime) {
    this.iPerformance = this.iPerformance + ((Math.imul(iTime, 100) - this.iPerformance | 0) / 100 | 0) | 0;
  }

  $clone() { return new C4GameControlClient().$assign(this); }
  $assign(o) {
    this.iClientID = o.iClientID;
    this.szName = o.szName.slice();
    this.iNextControl = o.iNextControl;
    this.iPerformance = o.iPerformance;
    this.pNext = o.pNext;
    return this;
  }
}

export class C4GameControlPacket extends C4PacketBase {
  iClientID = 0;
  iCtrlTick = -1;
  tTime = new $.C4TimeMilliseconds();
  Ctrl = new $.C4Control().init();
  pNext = null;

  init() {
    this.iClientID = -1;
    this.iCtrlTick = -1;
    this.tTime = $.C4TimeMilliseconds.Now();
    this.Ctrl = new $.C4Control().init();
    this.pNext = null;
    return this;
  }

  getClientID() {
    return this.iClientID;
  }

  getCtrlTick() {
    return this.iCtrlTick;
  }

  getTime() {
    return this.tTime.$clone();
  }

  getControl() {
    return this.Ctrl;
  }

  Set$i32$i32(inClientID, inCtrlTick) {
    this.iClientID = inClientID;
    this.iCtrlTick = inCtrlTick;
  }

  Set$i32$i32$C4Control(inClientID, inCtrlTick, nCtrl) {
    this.iClientID = inClientID;
    this.iCtrlTick = inCtrlTick;
    this.Ctrl.Copy(nCtrl);
  }

  Add$C4GameControlPacket(Ctrl2) {
    this.Ctrl.Append$C4Control(Ctrl2.getControl());
  }

  CompileFunc$pStdCompiler(pComp) {
    pComp.Value$StdNamingDefaultAdapt$StdIntPackAdapt$i32$i32$2($.mkNamingAdapt$mStdIntPackAdapt$i32$pi8$i32$b$b$2($.mkIntPackAdapt$ri32(P(this, "iClientID")), S("ClientID"), $.C4ClientIDUnknown$C4Client));
    pComp.Value$StdNamingDefaultAdapt$StdIntPackAdapt$i32$i32$2($.mkNamingAdapt$mStdIntPackAdapt$i32$pi8$i32$b$b$2($.mkIntPackAdapt$ri32(P(this, "iCtrlTick")), S("CtrlTick"), -1));
    pComp.Value$StdNamingAdapt$C4Control($.mkNamingAdapt$rC4Control$pi8(this.Ctrl, S("Ctrl")));
  }

  $copy(Pkt2) {
    this.iClientID = Pkt2.getClientID();
    this.iCtrlTick = Pkt2.getCtrlTick();
    this.tTime = $.C4TimeMilliseconds.Now();
    this.Ctrl = new $.C4Control().init();
    this.pNext = null;
    this.Ctrl.Copy(Pkt2.getControl());
    return this;
  }
  $clone() { return new C4GameControlPacket().$copy(this); }
  $assign(Pkt2) {
    this.Set$i32$i32$C4Control(Pkt2.getClientID(), Pkt2.getCtrlTick(), Pkt2.getControl());
    return this;
  }
}

export class C4PacketControlReq extends C4PacketBase {
  iCtrlTick = 0;

  init(inCtrlTick = -1) {
    this.iCtrlTick = inCtrlTick;
    return this;
  }

  getCtrlTick() {
    return this.iCtrlTick;
  }

  CompileFunc$pStdCompiler(pComp) {
    pComp.Value$StdNamingDefaultAdapt$StdIntPackAdapt$i32$i32$2($.mkNamingAdapt$mStdIntPackAdapt$i32$pi8$i32$b$b$2($.mkIntPackAdapt$ri32(P(this, "iCtrlTick")), S("CtrlTick"), -1));
  }

  $clone() { return new C4PacketControlReq().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.iCtrlTick = o.iCtrlTick;
    return this;
  }
}

export class C4PacketControlPkt extends C4PacketBase {
  eDelivery = 0 /*CDT_Queue*/;
  Ctrl = new $.C4IDPacket();

  init$v() {
    this.eDelivery = 0 /*CDT_Queue*/;
    this.Ctrl = new $.C4IDPacket();
    return this;
  }

  init$i32$C4IDPacket(eDelivery, Ctrl) {
    this.eDelivery = eDelivery;
    this.Ctrl = new $.C4IDPacket().$copy(Ctrl);
    return this;
  }

  getDelivery() {
    return this.eDelivery;
  }

  getCtrl() {
    return this.Ctrl;
  }

  CompileFunc$pStdCompiler(pComp) {
    pComp.Value$StdNamingDefaultAdapt$StdIntAdapt$i32$u8$i32$5($.mkNamingAdapt$mStdIntAdapt$i32$u8$pi8$i32$b$b$5($.mkIntAdaptT$8(P(this, "eDelivery")), S("Delivery"), 0 /*CDT_Queue*/));
    pComp.Value$rC4IDPacket(this.Ctrl);
  }

  $clone() { return new C4PacketControlPkt().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.eDelivery = o.eDelivery;
    this.Ctrl.$assign(o.Ctrl);
    return this;
  }
}

export class C4PacketExecSyncCtrl extends C4PacketBase {
  iControlTick = 0;

  init(iControlTick = -1) {
    this.iControlTick = iControlTick;
    return this;
  }

  getControlTick() {
    return this.iControlTick;
  }

  CompileFunc$pStdCompiler(pComp) {
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "iControlTick"), S("ControlTick"), -1));
  }

  $clone() { return new C4PacketExecSyncCtrl().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.iControlTick = o.iControlTick;
    return this;
  }
}






export function $init(): void {
  $.C4ControlBacklog$C4GameControlNetwork = 100;
  $.C4ClientIDAll$C4GameControlNetwork = -1;
  $.C4ControlOverflowLimit$C4GameControlNetwork = 3;
  $.C4MaxPreSend$C4GameControlNetwork = 15;
  $.C4ControlRequestInterval$C4GameControlNetwork = 2000;
}

Object.assign($, { C4GameControlClient, C4GameControlNetwork, C4GameControlPacket, C4PacketControlPkt, C4PacketControlReq, C4PacketExecSyncCtrl });
