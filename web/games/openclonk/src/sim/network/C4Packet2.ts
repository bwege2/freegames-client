// @ts-nocheck
// OpenClonk 36de799: src/network/C4Packet2.cpp, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $oadd, $oat, $own, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete, $throw } from '../../rt/std.ts';

export class unpack_class$C4ControlClientJoin {

  static unpack(pComp) {
    0;
    let pPkt = new $.C4ControlClientJoin().init$v();
    try {
      pComp.Value$rC4ControlClientJoin(pPkt);
    } catch ($e1) {
      {
        $delete(pPkt);
        $throw($e1);
      }
    }
    return pPkt;
  }

  $clone() { return new unpack_class$C4ControlClientJoin().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class unpack_class$C4ControlClientRemove {

  static unpack(pComp) {
    0;
    let pPkt = new $.C4ControlClientRemove().init$v();
    try {
      pComp.Value$rC4ControlClientRemove(pPkt);
    } catch ($e1) {
      {
        $delete(pPkt);
        $throw($e1);
      }
    }
    return pPkt;
  }

  $clone() { return new unpack_class$C4ControlClientRemove().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class unpack_class$C4ControlClientUpdate {

  static unpack(pComp) {
    0;
    let pPkt = new $.C4ControlClientUpdate().init$v();
    try {
      pComp.Value$rC4ControlClientUpdate(pPkt);
    } catch ($e1) {
      {
        $delete(pPkt);
        $throw($e1);
      }
    }
    return pPkt;
  }

  $clone() { return new unpack_class$C4ControlClientUpdate().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class unpack_class$C4ControlDebugRec {

  static unpack(pComp) {
    0;
    let pPkt = new $.C4ControlDebugRec().init$v();
    try {
      pComp.Value$rC4ControlDebugRec(pPkt);
    } catch ($e1) {
      {
        $delete(pPkt);
        $throw($e1);
      }
    }
    return pPkt;
  }

  $clone() { return new unpack_class$C4ControlDebugRec().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class unpack_class$C4ControlEMDrawTool {

  static unpack(pComp) {
    0;
    let pPkt = new $.C4ControlEMDrawTool().init$v();
    try {
      pComp.Value$rC4ControlEMDrawTool(pPkt);
    } catch ($e1) {
      {
        $delete(pPkt);
        $throw($e1);
      }
    }
    return pPkt;
  }

  $clone() { return new unpack_class$C4ControlEMDrawTool().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class unpack_class$C4ControlEMMoveObject {

  static unpack(pComp) {
    0;
    let pPkt = new $.C4ControlEMMoveObject().init$v();
    try {
      pComp.Value$rC4ControlEMMoveObject(pPkt);
    } catch ($e1) {
      {
        $delete(pPkt);
        $throw($e1);
      }
    }
    return pPkt;
  }

  $clone() { return new unpack_class$C4ControlEMMoveObject().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class unpack_class$C4ControlEditGraph {

  static unpack(pComp) {
    0;
    let pPkt = new $.C4ControlEditGraph().init$v();
    try {
      pComp.Value$rC4ControlEditGraph(pPkt);
    } catch ($e1) {
      {
        $delete(pPkt);
        $throw($e1);
      }
    }
    return pPkt;
  }

  $clone() { return new unpack_class$C4ControlEditGraph().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class unpack_class$C4ControlJoinPlayer {

  static unpack(pComp) {
    0;
    let pPkt = new $.C4ControlJoinPlayer().init$v();
    try {
      pComp.Value$rC4ControlJoinPlayer(pPkt);
    } catch ($e1) {
      {
        $delete(pPkt);
        $throw($e1);
      }
    }
    return pPkt;
  }

  $clone() { return new unpack_class$C4ControlJoinPlayer().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class unpack_class$C4ControlMenuCommand {

  static unpack(pComp) {
    0;
    let pPkt = new $.C4ControlMenuCommand().init$v();
    try {
      pComp.Value$rC4ControlMenuCommand(pPkt);
    } catch ($e1) {
      {
        $delete(pPkt);
        $throw($e1);
      }
    }
    return pPkt;
  }

  $clone() { return new unpack_class$C4ControlMenuCommand().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class unpack_class$C4ControlMessage {

  static unpack(pComp) {
    0;
    let pPkt = new $.C4ControlMessage().init$v();
    try {
      pComp.Value$rC4ControlMessage(pPkt);
    } catch ($e1) {
      {
        $delete(pPkt);
        $throw($e1);
      }
    }
    return pPkt;
  }

  $clone() { return new unpack_class$C4ControlMessage().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class unpack_class$C4ControlMsgBoardCmd {

  static unpack(pComp) {
    0;
    let pPkt = new $.C4ControlMsgBoardCmd().init$v();
    try {
      pComp.Value$rC4ControlMsgBoardCmd(pPkt);
    } catch ($e1) {
      {
        $delete(pPkt);
        $throw($e1);
      }
    }
    return pPkt;
  }

  $clone() { return new unpack_class$C4ControlMsgBoardCmd().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class unpack_class$C4ControlMsgBoardReply {

  static unpack(pComp) {
    0;
    let pPkt = new $.C4ControlMsgBoardReply().init$v();
    try {
      pComp.Value$rC4ControlMsgBoardReply(pPkt);
    } catch ($e1) {
      {
        $delete(pPkt);
        $throw($e1);
      }
    }
    return pPkt;
  }

  $clone() { return new unpack_class$C4ControlMsgBoardReply().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class unpack_class$C4ControlPlayerAction {

  static unpack(pComp) {
    0;
    let pPkt = new $.C4ControlPlayerAction().init();
    try {
      pComp.Value$rC4ControlPlayerAction(pPkt);
    } catch ($e1) {
      {
        $delete(pPkt);
        $throw($e1);
      }
    }
    return pPkt;
  }

  $clone() { return new unpack_class$C4ControlPlayerAction().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class unpack_class$C4ControlPlayerControl {

  static unpack(pComp) {
    0;
    let pPkt = new $.C4ControlPlayerControl().init$v();
    try {
      pComp.Value$rC4ControlPlayerControl(pPkt);
    } catch ($e1) {
      {
        $delete(pPkt);
        $throw($e1);
      }
    }
    return pPkt;
  }

  $clone() { return new unpack_class$C4ControlPlayerControl().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class unpack_class$C4ControlPlayerInfo {

  static unpack(pComp) {
    0;
    let pPkt = new $.C4ControlPlayerInfo().init$v();
    try {
      pComp.Value$rC4ControlPlayerInfo(pPkt);
    } catch ($e1) {
      {
        $delete(pPkt);
        $throw($e1);
      }
    }
    return pPkt;
  }

  $clone() { return new unpack_class$C4ControlPlayerInfo().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class unpack_class$C4ControlPlayerMouse {

  static unpack(pComp) {
    0;
    let pPkt = new $.C4ControlPlayerMouse().init();
    try {
      pComp.Value$rC4ControlPlayerMouse(pPkt);
    } catch ($e1) {
      {
        $delete(pPkt);
        $throw($e1);
      }
    }
    return pPkt;
  }

  $clone() { return new unpack_class$C4ControlPlayerMouse().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class unpack_class$C4ControlPlayerSelect {

  static unpack(pComp) {
    0;
    let pPkt = new $.C4ControlPlayerSelect().init$v();
    try {
      pComp.Value$rC4ControlPlayerSelect(pPkt);
    } catch ($e1) {
      {
        $delete(pPkt);
        $throw($e1);
      }
    }
    return pPkt;
  }

  $clone() { return new unpack_class$C4ControlPlayerSelect().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class unpack_class$C4ControlReInitScenario {

  static unpack(pComp) {
    0;
    let pPkt = new $.C4ControlReInitScenario().init();
    try {
      pComp.Value$rC4ControlReInitScenario(pPkt);
    } catch ($e1) {
      {
        $delete(pPkt);
        $throw($e1);
      }
    }
    return pPkt;
  }

  $clone() { return new unpack_class$C4ControlReInitScenario().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class unpack_class$C4ControlRemovePlr {

  static unpack(pComp) {
    0;
    let pPkt = new $.C4ControlRemovePlr().init$v();
    try {
      pComp.Value$rC4ControlRemovePlr(pPkt);
    } catch ($e1) {
      {
        $delete(pPkt);
        $throw($e1);
      }
    }
    return pPkt;
  }

  $clone() { return new unpack_class$C4ControlRemovePlr().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class unpack_class$C4ControlScript {

  static unpack(pComp) {
    0;
    let pPkt = new $.C4ControlScript().init$v();
    try {
      pComp.Value$rC4ControlScript(pPkt);
    } catch ($e1) {
      {
        $delete(pPkt);
        $throw($e1);
      }
    }
    return pPkt;
  }

  $clone() { return new unpack_class$C4ControlScript().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class unpack_class$C4ControlSet {

  static unpack(pComp) {
    0;
    let pPkt = new $.C4ControlSet().init$v();
    try {
      pComp.Value$rC4ControlSet(pPkt);
    } catch ($e1) {
      {
        $delete(pPkt);
        $throw($e1);
      }
    }
    return pPkt;
  }

  $clone() { return new unpack_class$C4ControlSet().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class unpack_class$C4ControlSyncCheck {

  static unpack(pComp) {
    0;
    let pPkt = new $.C4ControlSyncCheck().init();
    try {
      pComp.Value$rC4ControlSyncCheck(pPkt);
    } catch ($e1) {
      {
        $delete(pPkt);
        $throw($e1);
      }
    }
    return pPkt;
  }

  $clone() { return new unpack_class$C4ControlSyncCheck().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class unpack_class$C4ControlSynchronize {

  static unpack(pComp) {
    0;
    let pPkt = new $.C4ControlSynchronize().init();
    try {
      pComp.Value$rC4ControlSynchronize(pPkt);
    } catch ($e1) {
      {
        $delete(pPkt);
        $throw($e1);
      }
    }
    return pPkt;
  }

  $clone() { return new unpack_class$C4ControlSynchronize().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class unpack_class$C4ControlVote {

  static unpack(pComp) {
    0;
    let pPkt = new $.C4ControlVote().init();
    try {
      pComp.Value$rC4ControlVote(pPkt);
    } catch ($e1) {
      {
        $delete(pPkt);
        $throw($e1);
      }
    }
    return pPkt;
  }

  $clone() { return new unpack_class$C4ControlVote().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class unpack_class$C4ControlVoteEnd {

  static unpack(pComp) {
    0;
    let pPkt = new $.C4ControlVoteEnd().init();
    try {
      pComp.Value$rC4ControlVoteEnd(pPkt);
    } catch ($e1) {
      {
        $delete(pPkt);
        $throw($e1);
      }
    }
    return pPkt;
  }

  $clone() { return new unpack_class$C4ControlVoteEnd().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class unpack_class$C4GameControlPacket {

  static unpack(pComp) {
    0;
    let pPkt = new $.C4GameControlPacket().init();
    try {
      pComp.Value$rC4GameControlPacket(pPkt);
    } catch ($e1) {
      {
        $delete(pPkt);
        $throw($e1);
      }
    }
    return pPkt;
  }

  $clone() { return new unpack_class$C4GameControlPacket().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class unpack_class$C4Network2ResChunk {

  static unpack(pComp) {
    0;
    let pPkt = new $.C4Network2ResChunk().init();
    try {
      pComp.Value$rC4Network2ResChunk(pPkt);
    } catch ($e1) {
      {
        $delete(pPkt);
        $throw($e1);
      }
    }
    return pPkt;
  }

  $clone() { return new unpack_class$C4Network2ResChunk().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class unpack_class$C4Network2ResCore {

  static unpack(pComp) {
    0;
    let pPkt = new $.C4Network2ResCore().init();
    try {
      pComp.Value$rC4Network2ResCore(pPkt);
    } catch ($e1) {
      {
        $delete(pPkt);
        $throw($e1);
      }
    }
    return pPkt;
  }

  $clone() { return new unpack_class$C4Network2ResCore().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class unpack_class$C4Network2Status {

  static unpack(pComp) {
    0;
    let pPkt = new $.C4Network2Status().init();
    try {
      pComp.Value$rC4Network2Status(pPkt);
    } catch ($e1) {
      {
        $delete(pPkt);
        $throw($e1);
      }
    }
    return pPkt;
  }

  $clone() { return new unpack_class$C4Network2Status().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class unpack_class$C4PacketActivateReq {

  static unpack(pComp) {
    0;
    let pPkt = new $.C4PacketActivateReq().init();
    try {
      pComp.Value$rC4PacketActivateReq(pPkt);
    } catch ($e1) {
      {
        $delete(pPkt);
        $throw($e1);
      }
    }
    return pPkt;
  }

  $clone() { return new unpack_class$C4PacketActivateReq().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class unpack_class$C4PacketAddr {

  static unpack(pComp) {
    0;
    let pPkt = new $.C4PacketAddr().init$v();
    try {
      pComp.Value$rC4PacketAddr(pPkt);
    } catch ($e1) {
      {
        $delete(pPkt);
        $throw($e1);
      }
    }
    return pPkt;
  }

  $clone() { return new unpack_class$C4PacketAddr().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class unpack_class$C4PacketConn {

  static unpack(pComp) {
    0;
    let pPkt = new $.C4PacketConn().init$v();
    try {
      pComp.Value$rC4PacketConn(pPkt);
    } catch ($e1) {
      {
        $delete(pPkt);
        $throw($e1);
      }
    }
    return pPkt;
  }

  $clone() { return new unpack_class$C4PacketConn().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class unpack_class$C4PacketConnRe {

  static unpack(pComp) {
    0;
    let pPkt = new $.C4PacketConnRe().init$v();
    try {
      pComp.Value$rC4PacketConnRe(pPkt);
    } catch ($e1) {
      {
        $delete(pPkt);
        $throw($e1);
      }
    }
    return pPkt;
  }

  $clone() { return new unpack_class$C4PacketConnRe().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class unpack_class$C4PacketControlPkt {

  static unpack(pComp) {
    0;
    let pPkt = new $.C4PacketControlPkt().init$v();
    try {
      pComp.Value$rC4PacketControlPkt(pPkt);
    } catch ($e1) {
      {
        $delete(pPkt);
        $throw($e1);
      }
    }
    return pPkt;
  }

  $clone() { return new unpack_class$C4PacketControlPkt().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class unpack_class$C4PacketControlReq {

  static unpack(pComp) {
    0;
    let pPkt = new $.C4PacketControlReq().init();
    try {
      pComp.Value$rC4PacketControlReq(pPkt);
    } catch ($e1) {
      {
        $delete(pPkt);
        $throw($e1);
      }
    }
    return pPkt;
  }

  $clone() { return new unpack_class$C4PacketControlReq().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class unpack_class$C4PacketCountdown {

  static unpack(pComp) {
    0;
    let pPkt = new $.C4PacketCountdown();
    try {
      pComp.Value$rC4PacketCountdown(pPkt);
    } catch ($e1) {
      {
        $delete(pPkt);
        $throw($e1);
      }
    }
    return pPkt;
  }

  $clone() { return new unpack_class$C4PacketCountdown().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class unpack_class$C4PacketExecSyncCtrl {

  static unpack(pComp) {
    0;
    let pPkt = new $.C4PacketExecSyncCtrl().init();
    try {
      pComp.Value$rC4PacketExecSyncCtrl(pPkt);
    } catch ($e1) {
      {
        $delete(pPkt);
        $throw($e1);
      }
    }
    return pPkt;
  }

  $clone() { return new unpack_class$C4PacketExecSyncCtrl().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class unpack_class$C4PacketFwd {

  static unpack(pComp) {
    0;
    let pPkt = new $.C4PacketFwd().init$v();
    try {
      pComp.Value$rC4PacketFwd(pPkt);
    } catch ($e1) {
      {
        $delete(pPkt);
        $throw($e1);
      }
    }
    return pPkt;
  }

  $clone() { return new unpack_class$C4PacketFwd().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class unpack_class$C4PacketJoinData {

  static unpack(pComp) {
    0;
    let pPkt = new $.C4PacketJoinData().init();
    try {
      pComp.Value$rC4PacketJoinData(pPkt);
    } catch ($e1) {
      {
        $delete(pPkt);
        $throw($e1);
      }
    }
    return pPkt;
  }

  $clone() { return new unpack_class$C4PacketJoinData().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class unpack_class$C4PacketLeagueRoundResults {

  static unpack(pComp) {
    0;
    let pPkt = new $.C4PacketLeagueRoundResults().init$v();
    try {
      pComp.Value$rC4PacketLeagueRoundResults(pPkt);
    } catch ($e1) {
      {
        $delete(pPkt);
        $throw($e1);
      }
    }
    return pPkt;
  }

  $clone() { return new unpack_class$C4PacketLeagueRoundResults().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class unpack_class$C4PacketPing {

  static unpack(pComp) {
    0;
    let pPkt = new $.C4PacketPing().init();
    try {
      pComp.Value$rC4PacketPing(pPkt);
    } catch ($e1) {
      {
        $delete(pPkt);
        $throw($e1);
      }
    }
    return pPkt;
  }

  $clone() { return new unpack_class$C4PacketPing().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class unpack_class$C4PacketPlayerInfoUpdRequest {

  static unpack(pComp) {
    0;
    let pPkt = new $.C4PacketPlayerInfoUpdRequest().init$v();
    try {
      pComp.Value$rC4PacketPlayerInfoUpdRequest(pPkt);
    } catch ($e1) {
      {
        $delete(pPkt);
        $throw($e1);
      }
    }
    return pPkt;
  }

  $clone() { return new unpack_class$C4PacketPlayerInfoUpdRequest().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class unpack_class$C4PacketPostMortem {

  static unpack(pComp) {
    0;
    let pPkt = new $.C4PacketPostMortem().init();
    try {
      pComp.Value$rC4PacketPostMortem(pPkt);
    } catch ($e1) {
      {
        $delete(pPkt);
        $throw($e1);
      }
    }
    return pPkt;
  }

  $clone() { return new unpack_class$C4PacketPostMortem().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class unpack_class$C4PacketResDiscover {

  static unpack(pComp) {
    0;
    let pPkt = new $.C4PacketResDiscover();
    try {
      pComp.Value$rC4PacketResDiscover(pPkt);
    } catch ($e1) {
      {
        $delete(pPkt);
        $throw($e1);
      }
    }
    return pPkt;
  }

  $clone() { return new unpack_class$C4PacketResDiscover().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class unpack_class$C4PacketResRequest {

  static unpack(pComp) {
    0;
    let pPkt = new $.C4PacketResRequest().init();
    try {
      pComp.Value$rC4PacketResRequest(pPkt);
    } catch ($e1) {
      {
        $delete(pPkt);
        $throw($e1);
      }
    }
    return pPkt;
  }

  $clone() { return new unpack_class$C4PacketResRequest().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class unpack_class$C4PacketResStatus {

  static unpack(pComp) {
    0;
    let pPkt = new $.C4PacketResStatus().init$v();
    try {
      pComp.Value$rC4PacketResStatus(pPkt);
    } catch ($e1) {
      {
        $delete(pPkt);
        $throw($e1);
      }
    }
    return pPkt;
  }

  $clone() { return new unpack_class$C4PacketResStatus().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class unpack_class$C4PacketSetScenarioParameter {

  static unpack(pComp) {
    0;
    let pPkt = new $.C4PacketSetScenarioParameter().init$v();
    try {
      pComp.Value$rC4PacketSetScenarioParameter(pPkt);
    } catch ($e1) {
      {
        $delete(pPkt);
        $throw($e1);
      }
    }
    return pPkt;
  }

  $clone() { return new unpack_class$C4PacketSetScenarioParameter().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class unpack_class$C4PacketTCPSimOpen {

  static unpack(pComp) {
    0;
    let pPkt = new $.C4PacketTCPSimOpen().init$v();
    try {
      pComp.Value$rC4PacketTCPSimOpen(pPkt);
    } catch ($e1) {
      {
        $delete(pPkt);
        $throw($e1);
      }
    }
    return pPkt;
  }

  $clone() { return new unpack_class$C4PacketTCPSimOpen().$assign(this); }
  $assign(o) {
    return this;
  }
}


export function PacketNameByID(eID) {
  for (let pPData = $oat($.PktHandlingData, 0); pPData.ID !== 255; pPData = $oadd(pPData, 1)) {
    if (pPData.ID === eID) {
      return pPData.Name;
    }
  }
  return S("?!?");
}

export function $init(): void {
  $.PktHandlingData = $own([
  ((($o) => ($o.ID = 2 /*PID_Conn*/, $o.Class = 0 /*PC_Network*/, $o.Name = S("Connection Request"), $o.AcceptedOnly = true, $o.ProcByThread = true, $o.HandlerID = 1, $o.FnUnpack = unpack_class$C4PacketConn.unpack, $o))(new $.C4PktHandlingData())),
  ((($o) => ($o.ID = 3 /*PID_ConnRe*/, $o.Class = 0 /*PC_Network*/, $o.Name = S("Connection Request Reply"), $o.AcceptedOnly = true, $o.ProcByThread = true, $o.HandlerID = 1, $o.FnUnpack = unpack_class$C4PacketConnRe.unpack, $o))(new $.C4PktHandlingData())),
  ((($o) => ($o.ID = 0 /*PID_Ping*/, $o.Class = 0 /*PC_Network*/, $o.Name = S("Ping"), $o.AcceptedOnly = true, $o.ProcByThread = true, $o.HandlerID = 1, $o.FnUnpack = unpack_class$C4PacketPing.unpack, $o))(new $.C4PktHandlingData())),
  ((($o) => ($o.ID = 1 /*PID_Pong*/, $o.Class = 0 /*PC_Network*/, $o.Name = S("Pong"), $o.AcceptedOnly = true, $o.ProcByThread = true, $o.HandlerID = 1, $o.FnUnpack = unpack_class$C4PacketPing.unpack, $o))(new $.C4PktHandlingData())),
  ((($o) => ($o.ID = 4 /*PID_FwdReq*/, $o.Class = 0 /*PC_Network*/, $o.Name = S("Forward Request"), $o.AcceptedOnly = false, $o.ProcByThread = true, $o.HandlerID = 1, $o.FnUnpack = unpack_class$C4PacketFwd.unpack, $o))(new $.C4PktHandlingData())),
  ((($o) => ($o.ID = 5 /*PID_Fwd*/, $o.Class = 0 /*PC_Network*/, $o.Name = S("Forward"), $o.AcceptedOnly = false, $o.ProcByThread = true, $o.HandlerID = 1, $o.FnUnpack = unpack_class$C4PacketFwd.unpack, $o))(new $.C4PktHandlingData())),
  ((($o) => ($o.ID = 6 /*PID_PostMortem*/, $o.Class = 0 /*PC_Network*/, $o.Name = S("Post Mortem"), $o.AcceptedOnly = false, $o.ProcByThread = true, $o.HandlerID = 1, $o.FnUnpack = unpack_class$C4PacketPostMortem.unpack, $o))(new $.C4PktHandlingData())),
  ((($o) => ($o.ID = 2 /*PID_Conn*/, $o.Class = 0 /*PC_Network*/, $o.Name = S("Connection Request"), $o.AcceptedOnly = true, $o.ProcByThread = false, $o.HandlerID = 2, $o.FnUnpack = unpack_class$C4PacketConn.unpack, $o))(new $.C4PktHandlingData())),
  ((($o) => ($o.ID = 3 /*PID_ConnRe*/, $o.Class = 0 /*PC_Network*/, $o.Name = S("Connection Request Reply"), $o.AcceptedOnly = true, $o.ProcByThread = false, $o.HandlerID = 2, $o.FnUnpack = unpack_class$C4PacketConnRe.unpack, $o))(new $.C4PktHandlingData())),
  ((($o) => ($o.ID = 16 /*PID_Status*/, $o.Class = 0 /*PC_Network*/, $o.Name = S("Game Status"), $o.AcceptedOnly = true, $o.ProcByThread = false, $o.HandlerID = 2, $o.FnUnpack = unpack_class$C4Network2Status.unpack, $o))(new $.C4PktHandlingData())),
  ((($o) => ($o.ID = 17 /*PID_StatusAck*/, $o.Class = 0 /*PC_Network*/, $o.Name = S("Game Status Acknowledgement"), $o.AcceptedOnly = true, $o.ProcByThread = false, $o.HandlerID = 2, $o.FnUnpack = unpack_class$C4Network2Status.unpack, $o))(new $.C4PktHandlingData())),
  ((($o) => ($o.ID = 19 /*PID_ClientActReq*/, $o.Class = 0 /*PC_Network*/, $o.Name = S("Client Activation Request"), $o.AcceptedOnly = false, $o.ProcByThread = false, $o.HandlerID = 2, $o.FnUnpack = unpack_class$C4PacketActivateReq.unpack, $o))(new $.C4PktHandlingData())),
  ((($o) => ($o.ID = 21 /*PID_JoinData*/, $o.Class = 0 /*PC_Network*/, $o.Name = S("Join Data"), $o.AcceptedOnly = false, $o.ProcByThread = false, $o.HandlerID = 2, $o.FnUnpack = unpack_class$C4PacketJoinData.unpack, $o))(new $.C4PktHandlingData())),
  ((($o) => ($o.ID = 22 /*PID_PlayerInfoUpdReq*/, $o.Class = 0 /*PC_Network*/, $o.Name = S("Player info update request"), $o.AcceptedOnly = true, $o.ProcByThread = false, $o.HandlerID = 16, $o.FnUnpack = unpack_class$C4PacketPlayerInfoUpdRequest.unpack, $o))(new $.C4PktHandlingData())),
  ((($o) => ($o.ID = 23 /*PID_LeagueRoundResults*/, $o.Class = 0 /*PC_Network*/, $o.Name = S("League round results"), $o.AcceptedOnly = true, $o.ProcByThread = false, $o.HandlerID = 16, $o.FnUnpack = unpack_class$C4PacketLeagueRoundResults.unpack, $o))(new $.C4PktHandlingData())),
  ((($o) => ($o.ID = 32 /*PID_LobbyCountdown*/, $o.Class = 0 /*PC_Network*/, $o.Name = S("Lobby countdown"), $o.AcceptedOnly = false, $o.ProcByThread = false, $o.HandlerID = 4, $o.FnUnpack = unpack_class$C4PacketCountdown.unpack, $o))(new $.C4PktHandlingData())),
  ((($o) => ($o.ID = 33 /*PID_SetScenarioParameter*/, $o.Class = 0 /*PC_Network*/, $o.Name = S("Scenario parameter"), $o.AcceptedOnly = false, $o.ProcByThread = false, $o.HandlerID = 4, $o.FnUnpack = unpack_class$C4PacketSetScenarioParameter.unpack, $o))(new $.C4PktHandlingData())),
  ((($o) => ($o.ID = 18 /*PID_Addr*/, $o.Class = 0 /*PC_Network*/, $o.Name = S("Client Address"), $o.AcceptedOnly = false, $o.ProcByThread = false, $o.HandlerID = 8, $o.FnUnpack = unpack_class$C4PacketAddr.unpack, $o))(new $.C4PktHandlingData())),
  ((($o) => ($o.ID = 20 /*PID_TCPSimOpen*/, $o.Class = 0 /*PC_Network*/, $o.Name = S("TCP simultaneous open req"), $o.AcceptedOnly = false, $o.ProcByThread = false, $o.HandlerID = 8, $o.FnUnpack = unpack_class$C4PacketTCPSimOpen.unpack, $o))(new $.C4PktHandlingData())),
  ((($o) => ($o.ID = 48 /*PID_NetResDis*/, $o.Class = 0 /*PC_Network*/, $o.Name = S("Resource Discover"), $o.AcceptedOnly = true, $o.ProcByThread = true, $o.HandlerID = 32, $o.FnUnpack = unpack_class$C4PacketResDiscover.unpack, $o))(new $.C4PktHandlingData())),
  ((($o) => ($o.ID = 49 /*PID_NetResStat*/, $o.Class = 0 /*PC_Network*/, $o.Name = S("Resource Status"), $o.AcceptedOnly = false, $o.ProcByThread = true, $o.HandlerID = 32, $o.FnUnpack = unpack_class$C4PacketResStatus.unpack, $o))(new $.C4PktHandlingData())),
  ((($o) => ($o.ID = 50 /*PID_NetResDerive*/, $o.Class = 0 /*PC_Network*/, $o.Name = S("Resource Derive"), $o.AcceptedOnly = false, $o.ProcByThread = true, $o.HandlerID = 32, $o.FnUnpack = unpack_class$C4Network2ResCore.unpack, $o))(new $.C4PktHandlingData())),
  ((($o) => ($o.ID = 51 /*PID_NetResReq*/, $o.Class = 0 /*PC_Network*/, $o.Name = S("Resource Request"), $o.AcceptedOnly = false, $o.ProcByThread = true, $o.HandlerID = 32, $o.FnUnpack = unpack_class$C4PacketResRequest.unpack, $o))(new $.C4PktHandlingData())),
  ((($o) => ($o.ID = 52 /*PID_NetResData*/, $o.Class = 0 /*PC_Network*/, $o.Name = S("Resource Data"), $o.AcceptedOnly = false, $o.ProcByThread = true, $o.HandlerID = 32, $o.FnUnpack = unpack_class$C4Network2ResChunk.unpack, $o))(new $.C4PktHandlingData())),
  ((($o) => ($o.ID = 64 /*PID_Control*/, $o.Class = 0 /*PC_Network*/, $o.Name = S("Control"), $o.AcceptedOnly = false, $o.ProcByThread = true, $o.HandlerID = 64, $o.FnUnpack = unpack_class$C4GameControlPacket.unpack, $o))(new $.C4PktHandlingData())),
  ((($o) => ($o.ID = 65 /*PID_ControlReq*/, $o.Class = 0 /*PC_Network*/, $o.Name = S("Control Request"), $o.AcceptedOnly = false, $o.ProcByThread = true, $o.HandlerID = 64, $o.FnUnpack = unpack_class$C4PacketControlReq.unpack, $o))(new $.C4PktHandlingData())),
  ((($o) => ($o.ID = 66 /*PID_ControlPkt*/, $o.Class = 0 /*PC_Network*/, $o.Name = S("Control Paket"), $o.AcceptedOnly = false, $o.ProcByThread = false, $o.HandlerID = 64, $o.FnUnpack = unpack_class$C4PacketControlPkt.unpack, $o))(new $.C4PktHandlingData())),
  ((($o) => ($o.ID = 67 /*PID_ExecSyncCtrl*/, $o.Class = 0 /*PC_Network*/, $o.Name = S("Execute Sync Control"), $o.AcceptedOnly = false, $o.ProcByThread = false, $o.HandlerID = 64, $o.FnUnpack = unpack_class$C4PacketExecSyncCtrl.unpack, $o))(new $.C4PktHandlingData())),
  ((($o) => ($o.ID = 128 /*CID_ClientJoin*/, $o.Class = 1 /*PC_Control*/, $o.Name = S("Client Join"), $o.AcceptedOnly = false, $o.ProcByThread = true, $o.HandlerID = 0, $o.FnUnpack = unpack_class$C4ControlClientJoin.unpack, $o))(new $.C4PktHandlingData())),
  ((($o) => ($o.ID = 129 /*CID_ClientUpdate*/, $o.Class = 1 /*PC_Control*/, $o.Name = S("Client Update"), $o.AcceptedOnly = false, $o.ProcByThread = true, $o.HandlerID = 0, $o.FnUnpack = unpack_class$C4ControlClientUpdate.unpack, $o))(new $.C4PktHandlingData())),
  ((($o) => ($o.ID = 130 /*CID_ClientRemove*/, $o.Class = 1 /*PC_Control*/, $o.Name = S("Client Remove"), $o.AcceptedOnly = false, $o.ProcByThread = true, $o.HandlerID = 0, $o.FnUnpack = unpack_class$C4ControlClientRemove.unpack, $o))(new $.C4PktHandlingData())),
  ((($o) => ($o.ID = 131 /*CID_Vote*/, $o.Class = 1 /*PC_Control*/, $o.Name = S("Voting"), $o.AcceptedOnly = false, $o.ProcByThread = true, $o.HandlerID = 0, $o.FnUnpack = unpack_class$C4ControlVote.unpack, $o))(new $.C4PktHandlingData())),
  ((($o) => ($o.ID = 132 /*CID_VoteEnd*/, $o.Class = 1 /*PC_Control*/, $o.Name = S("Voting End"), $o.AcceptedOnly = false, $o.ProcByThread = true, $o.HandlerID = 0, $o.FnUnpack = unpack_class$C4ControlVoteEnd.unpack, $o))(new $.C4PktHandlingData())),
  ((($o) => ($o.ID = 133 /*CID_SyncCheck*/, $o.Class = 1 /*PC_Control*/, $o.Name = S("Sync Check"), $o.AcceptedOnly = false, $o.ProcByThread = true, $o.HandlerID = 0, $o.FnUnpack = unpack_class$C4ControlSyncCheck.unpack, $o))(new $.C4PktHandlingData())),
  ((($o) => ($o.ID = 134 /*CID_Synchronize*/, $o.Class = 1 /*PC_Control*/, $o.Name = S("Synchronize"), $o.AcceptedOnly = false, $o.ProcByThread = true, $o.HandlerID = 0, $o.FnUnpack = unpack_class$C4ControlSynchronize.unpack, $o))(new $.C4PktHandlingData())),
  ((($o) => ($o.ID = 135 /*CID_Set*/, $o.Class = 1 /*PC_Control*/, $o.Name = S("Set"), $o.AcceptedOnly = false, $o.ProcByThread = true, $o.HandlerID = 0, $o.FnUnpack = unpack_class$C4ControlSet.unpack, $o))(new $.C4PktHandlingData())),
  ((($o) => ($o.ID = 136 /*CID_Script*/, $o.Class = 1 /*PC_Control*/, $o.Name = S("Script"), $o.AcceptedOnly = false, $o.ProcByThread = true, $o.HandlerID = 0, $o.FnUnpack = unpack_class$C4ControlScript.unpack, $o))(new $.C4PktHandlingData())),
  ((($o) => ($o.ID = 137 /*CID_MsgBoardReply*/, $o.Class = 1 /*PC_Control*/, $o.Name = S("Message Board Reply"), $o.AcceptedOnly = false, $o.ProcByThread = true, $o.HandlerID = 0, $o.FnUnpack = unpack_class$C4ControlMsgBoardReply.unpack, $o))(new $.C4PktHandlingData())),
  ((($o) => ($o.ID = 138 /*CID_MsgBoardCmd*/, $o.Class = 1 /*PC_Control*/, $o.Name = S("Message Board Command"), $o.AcceptedOnly = false, $o.ProcByThread = true, $o.HandlerID = 0, $o.FnUnpack = unpack_class$C4ControlMsgBoardCmd.unpack, $o))(new $.C4PktHandlingData())),
  ((($o) => ($o.ID = 144 /*CID_PlrInfo*/, $o.Class = 1 /*PC_Control*/, $o.Name = S("Player Info"), $o.AcceptedOnly = false, $o.ProcByThread = true, $o.HandlerID = 0, $o.FnUnpack = unpack_class$C4ControlPlayerInfo.unpack, $o))(new $.C4PktHandlingData())),
  ((($o) => ($o.ID = 145 /*CID_JoinPlr*/, $o.Class = 1 /*PC_Control*/, $o.Name = S("Join Player"), $o.AcceptedOnly = false, $o.ProcByThread = true, $o.HandlerID = 0, $o.FnUnpack = unpack_class$C4ControlJoinPlayer.unpack, $o))(new $.C4PktHandlingData())),
  ((($o) => ($o.ID = 146 /*CID_RemovePlr*/, $o.Class = 1 /*PC_Control*/, $o.Name = S("Remove Player"), $o.AcceptedOnly = false, $o.ProcByThread = true, $o.HandlerID = 0, $o.FnUnpack = unpack_class$C4ControlRemovePlr.unpack, $o))(new $.C4PktHandlingData())),
  ((($o) => ($o.ID = 160 /*CID_PlrSelect*/, $o.Class = 1 /*PC_Control*/, $o.Name = S("Player Select"), $o.AcceptedOnly = false, $o.ProcByThread = true, $o.HandlerID = 0, $o.FnUnpack = unpack_class$C4ControlPlayerSelect.unpack, $o))(new $.C4PktHandlingData())),
  ((($o) => ($o.ID = 161 /*CID_PlrControl*/, $o.Class = 1 /*PC_Control*/, $o.Name = S("Player Control"), $o.AcceptedOnly = false, $o.ProcByThread = true, $o.HandlerID = 0, $o.FnUnpack = unpack_class$C4ControlPlayerControl.unpack, $o))(new $.C4PktHandlingData())),
  ((($o) => ($o.ID = 164 /*CID_PlrAction*/, $o.Class = 1 /*PC_Control*/, $o.Name = S("Player Self-Mgmt Action"), $o.AcceptedOnly = false, $o.ProcByThread = true, $o.HandlerID = 0, $o.FnUnpack = unpack_class$C4ControlPlayerAction.unpack, $o))(new $.C4PktHandlingData())),
  ((($o) => ($o.ID = 165 /*CID_PlrMouseMove*/, $o.Class = 1 /*PC_Control*/, $o.Name = S("Player Mouse Movement"), $o.AcceptedOnly = false, $o.ProcByThread = true, $o.HandlerID = 0, $o.FnUnpack = unpack_class$C4ControlPlayerMouse.unpack, $o))(new $.C4PktHandlingData())),
  ((($o) => ($o.ID = 163 /*CID_Message*/, $o.Class = 1 /*PC_Control*/, $o.Name = S("Message"), $o.AcceptedOnly = false, $o.ProcByThread = true, $o.HandlerID = 0, $o.FnUnpack = unpack_class$C4ControlMessage.unpack, $o))(new $.C4PktHandlingData())),
  ((($o) => ($o.ID = 193 /*CID_MenuCommand*/, $o.Class = 1 /*PC_Control*/, $o.Name = S("Menu Command"), $o.AcceptedOnly = false, $o.ProcByThread = true, $o.HandlerID = 0, $o.FnUnpack = unpack_class$C4ControlMenuCommand.unpack, $o))(new $.C4PktHandlingData())),
  ((($o) => ($o.ID = 176 /*CID_EMMoveObj*/, $o.Class = 1 /*PC_Control*/, $o.Name = S("EM Move Obj"), $o.AcceptedOnly = false, $o.ProcByThread = true, $o.HandlerID = 0, $o.FnUnpack = unpack_class$C4ControlEMMoveObject.unpack, $o))(new $.C4PktHandlingData())),
  ((($o) => ($o.ID = 177 /*CID_EMDrawTool*/, $o.Class = 1 /*PC_Control*/, $o.Name = S("EM Draw Tool"), $o.AcceptedOnly = false, $o.ProcByThread = true, $o.HandlerID = 0, $o.FnUnpack = unpack_class$C4ControlEMDrawTool.unpack, $o))(new $.C4PktHandlingData())),
  ((($o) => ($o.ID = 178 /*CID_ReInitScenario*/, $o.Class = 1 /*PC_Control*/, $o.Name = S("Reinit Scenario"), $o.AcceptedOnly = false, $o.ProcByThread = true, $o.HandlerID = 0, $o.FnUnpack = unpack_class$C4ControlReInitScenario.unpack, $o))(new $.C4PktHandlingData())),
  ((($o) => ($o.ID = 179 /*CID_EditGraph*/, $o.Class = 1 /*PC_Control*/, $o.Name = S("Edit Graph"), $o.AcceptedOnly = false, $o.ProcByThread = true, $o.HandlerID = 0, $o.FnUnpack = unpack_class$C4ControlEditGraph.unpack, $o))(new $.C4PktHandlingData())),
  ((($o) => ($o.ID = 192 /*CID_DebugRec*/, $o.Class = 1 /*PC_Control*/, $o.Name = S("Debug Rec"), $o.AcceptedOnly = false, $o.ProcByThread = true, $o.HandlerID = 0, $o.FnUnpack = unpack_class$C4ControlDebugRec.unpack, $o))(new $.C4PktHandlingData())),
  ((($o) => ($o.ID = 255 /*PID_None*/, $o.Class = 0 /*PC_Network*/, $o.Name = null, $o.AcceptedOnly = false, $o.ProcByThread = true, $o.HandlerID = 0, $o.FnUnpack = null, $o))(new $.C4PktHandlingData())),
]);
}

Object.assign($, { PacketNameByID, unpack_class$C4ControlClientJoin, unpack_class$C4ControlClientRemove, unpack_class$C4ControlClientUpdate, unpack_class$C4ControlDebugRec, unpack_class$C4ControlEMDrawTool, unpack_class$C4ControlEMMoveObject, unpack_class$C4ControlEditGraph, unpack_class$C4ControlJoinPlayer, unpack_class$C4ControlMenuCommand, unpack_class$C4ControlMessage, unpack_class$C4ControlMsgBoardCmd, unpack_class$C4ControlMsgBoardReply, unpack_class$C4ControlPlayerAction, unpack_class$C4ControlPlayerControl, unpack_class$C4ControlPlayerInfo, unpack_class$C4ControlPlayerMouse, unpack_class$C4ControlPlayerSelect, unpack_class$C4ControlReInitScenario, unpack_class$C4ControlRemovePlr, unpack_class$C4ControlScript, unpack_class$C4ControlSet, unpack_class$C4ControlSyncCheck, unpack_class$C4ControlSynchronize, unpack_class$C4ControlVote, unpack_class$C4ControlVoteEnd, unpack_class$C4GameControlPacket, unpack_class$C4Network2ResChunk, unpack_class$C4Network2ResCore, unpack_class$C4Network2Status, unpack_class$C4PacketActivateReq, unpack_class$C4PacketAddr, unpack_class$C4PacketConn, unpack_class$C4PacketConnRe, unpack_class$C4PacketControlPkt, unpack_class$C4PacketControlReq, unpack_class$C4PacketCountdown, unpack_class$C4PacketExecSyncCtrl, unpack_class$C4PacketFwd, unpack_class$C4PacketJoinData, unpack_class$C4PacketLeagueRoundResults, unpack_class$C4PacketPing, unpack_class$C4PacketPlayerInfoUpdRequest, unpack_class$C4PacketPostMortem, unpack_class$C4PacketResDiscover, unpack_class$C4PacketResRequest, unpack_class$C4PacketResStatus, unpack_class$C4PacketSetScenarioParameter, unpack_class$C4PacketTCPSimOpen });
