// @ts-nocheck
// OpenClonk 36de799: src/control/C4Control.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $u64n } from '../../rt/int.ts';
import { c$atoi } from '../../rt/libc.ts';
import { Random } from '../../rt/native.ts';
import { $oat, $own, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete, $max, $vpush } from '../../rt/std.ts';
import { C4PacketBase } from '../network/C4PacketBase.ts';

export class C4ControlPlayerControl$ControlItem {
  iControl = -1;
  iTriggerMode = 0;

  init$i32$i32(iControl, iTriggerMode) {
    this.iControl = iControl;
    this.iTriggerMode = iTriggerMode;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Value$ri32(P(this, "iControl"));
    pComp.Separator();
    pComp.Value$ri32(P(this, "iTriggerMode"));
  }

  $clone() { return new C4ControlPlayerControl$ControlItem().$assign(this); }
  $assign(o) {
    this.iControl = o.iControl;
    this.iTriggerMode = o.iTriggerMode;
    return this;
  }
}

export class C4ControlPacket extends C4PacketBase {
  iByClient = 0;

  init() {
    this.iByClient = $.Control$2.ClientID();
    return this;
  }

  getByClient() {
    return this.iByClient;
  }

  LocalControl() {
    return this.iByClient === $.Control$2.ClientID();
  }

  HostControl() {
    return this.iByClient === 0;
  }

  SetByClient(inByClient) {
    this.iByClient = inByClient;
  }

  PreExecute() {
    return true;
  }

  PreRec$pC4Record(_pRecord) {
  }

  Lobby() {
    return false;
  }

  Sync() {
    return true;
  }

  CompileFunc$pStdCompiler(pComp) {
    pComp.Value$StdNamingDefaultAdapt$StdIntPackAdapt$i32$i32$2($.mkNamingAdapt$mStdIntPackAdapt$i32$pi8$i32$b$b$2($.mkIntPackAdapt$ri32(P(this, "iByClient")), S("ByClient"), -1));
  }

  $clone() { return new C4ControlPacket().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.iByClient = o.iByClient;
    return this;
  }
}

export class C4Control extends C4PacketBase {
  Pkts = new $.C4PacketList();

  init() {
    this.Pkts = new $.C4PacketList();
    return this;
  }

  $dtor() {
    C4Control.prototype.Clear.call(this);
  }

  Clear() {
    this.Pkts.Clear();
  }

  firstPkt() {
    return this.Pkts.firstPkt();
  }

  nextPkt(pPkt) {
    return this.Pkts.nextPkt(pPkt);
  }

  AddHead$i32$pC4ControlPacket(eType, pCtrl) {
    this.Pkts.AddHead$i32$pC4PacketBase(eType, pCtrl);
  }

  Add$i32$pC4ControlPacket(eType, pCtrl) {
    this.Pkts.Add$i32$pC4PacketBase(eType, pCtrl);
  }

  Take$rC4Control(Ctrl) {
    this.Pkts.Take$rC4PacketList(Ctrl.Pkts);
  }

  Append$C4Control(Ctrl) {
    this.Pkts.Append$C4PacketList(Ctrl.Pkts);
  }

  Copy(Ctrl) {
    this.Clear();
    this.Pkts.Append$C4PacketList(Ctrl.Pkts);
  }

  Remove(pPkt) {
    this.Pkts.Remove(pPkt);
  }

  Delete(pPkt) {
    this.Pkts.Delete(pPkt);
  }

  PreExecute() {
    let fReady = true;
    for (let pPkt = this.firstPkt(); pPkt != null; pPkt = this.nextPkt(pPkt)) {
      if ((pPkt.getPktType() & 128) !== 0) {
        let pCtrlPkt = pPkt.getPkt();
        if (pCtrlPkt != null) {
          fReady = ((fReady ? 1 : 0) & (pCtrlPkt.PreExecute() ? 1 : 0)) !== 0;
        }
      } else {
        $.LogF(S("C4Control::PreExecute: WARNING: Ignoring packet type %2x (not control.)"), pPkt.getPktType());
      }
    }
    return fReady;
  }

  Execute() {
    for (let pPkt = this.firstPkt(); pPkt != null; pPkt = this.nextPkt(pPkt)) {
      if ((pPkt.getPktType() & 128) !== 0) {
        let pCtrlPkt = pPkt.getPkt();
        if (pCtrlPkt != null) {
          pCtrlPkt.Execute();
        }
      } else {
        $.LogF(S("C4Control::Execute: WARNING: Ignoring packet type %2x (not control.)"), pPkt.getPktType());
      }
    }
  }

  PreRec$pC4Record$c(pRecord) {
    for (let pPkt = this.firstPkt(); pPkt != null; pPkt = this.nextPkt(pPkt)) {
      let pCtrlPkt = pPkt.getPkt();
      if (pCtrlPkt != null) {
        pCtrlPkt.PreRec$pC4Record(pRecord);
      }
    }
  }

  CompileFunc$pStdCompiler(pComp) {
    pComp.Value$rC4PacketList(this.Pkts);
  }

  $clone() { return new C4Control().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.Pkts.$assign(o.Pkts);
    return this;
  }
}

export class C4ControlSet extends C4ControlPacket {
  eValType = -1 /*C4CVT_None*/;
  iData = 0;

  init$v() {
    super.init();
    this.eValType = -1 /*C4CVT_None*/;
    this.iData = 0;
    return this;
  }

  init$i32$i32(eValType, iData) {
    super.init();
    this.eValType = eValType;
    this.iData = iData;
    return this;
  }

  Lobby() {
    return this.eValType === 3 || this.eValType === 4;
  }

  Execute() {
    switch (this.eValType) {
      case -1:
        break;
      case 0:
        if (this.iByClient !== 0) {
          break;
        }
        $.Control$2.ControlRate = $.Control$2.ControlRate + this.iData | 0;
        $.Control$2.ControlRate = $.Clamp$i32$i32$i32($.Control$2.ControlRate, 1, 20);
        $.Game.Parameters.ControlRate = $.Control$2.ControlRate;
        if ($.Control$2.isCtrlHost() && !$.Control$2.isReplay() && $.Control$2.isNetwork()) {
          $.Config.Network.ControlRate = $.Control$2.ControlRate;
        }
        $.GraphicsSystem.FlashMessage($.FormatString($.LoadResStr(S("IDS_NET_CONTROLRATE")), $.Control$2.ControlRate, $.Game.FrameCounter).getData());
        break;
      case 1:
        {
          if ($.Game.DebugMode) {
            $.Game.DebugMode = false;
            $.GraphicsSystem.DeactivateDebugOutput();
          }
          $.Game.Parameters.AllowDebug = false;
          let client = $.Game.Clients.getClientByID(this.iByClient);
          $.LogF(S("Debug mode forced disabled by %s"), client != null ? client.getName() : S("<unknown client>"));
          break;
        }
        break;
      case 2:
        if (this.iByClient !== 0) {
          break;
        }
        if ($.Game.Parameters.isLeague()) {
          $.Log(S("/set maxplayer disabled in league!"));
          $.GUISound(S("UI::Error"));
          break;
        }
        $.Game.Parameters.MaxPlayers = this.iData;
        $.LogF(S("MaxPlayer = %d"), $.Game.Parameters.MaxPlayers);
        break;
      case 3:
        if (this.iByClient !== 0) {
          break;
        }
        $.Game.Teams.SetTeamDistribution(this.iData);
        break;
      case 4:
        if (!this.HostControl()) {
          break;
        }
        $.Game.Teams.SetTeamColors(!(this.iData === 0));
        break;
    }
  }

  CompileFunc$pStdCompiler(pComp) {
    pComp.Value$StdNamingDefaultAdapt$StdIntAdapt$i32$i32$i32($.mkNamingAdapt$mStdIntAdapt$i32$i32$pi8$i32$b$b($.mkIntAdapt$ri32(P(this, "eValType")), S("Type"), -1 /*C4CVT_None*/));
    pComp.Value$StdNamingDefaultAdapt$StdIntPackAdapt$i32$i32$2($.mkNamingAdapt$mStdIntPackAdapt$i32$pi8$i32$b$b$2($.mkIntPackAdapt$ri32(P(this, "iData")), S("Data"), 0));
    C4ControlPacket.prototype.CompileFunc$pStdCompiler.call(this, pComp);
  }

  $clone() { return new C4ControlSet().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.eValType = o.eValType;
    this.iData = o.iData;
    return this;
  }
}

export class C4ControlScript extends C4ControlPacket {
  iTargetObj = -1;
  fUseVarsFromCallerContext = false;
  editor_select_result = false;
  Script = new $.StdStrBuf();

  init$v() {
    super.init();
    this.iTargetObj = -1;
    this.fUseVarsFromCallerContext = false;
    this.Script = new $.StdStrBuf();
    return this;
  }

  init$pi8$i32$b$b(szScript, iTargetObj, fUseVarsFromCallerContext = false, editor_select_result = false) {
    super.init();
    this.iTargetObj = iTargetObj;
    this.fUseVarsFromCallerContext = fUseVarsFromCallerContext;
    this.editor_select_result = editor_select_result;
    this.Script = new $.StdStrBuf().init$pi8$b(szScript, true);
    return this;
  }

  SetTargetObj(iObj) {
    this.iTargetObj = iObj;
  }

  Execute() {
    let szScript = this.Script.getData();
    if (this.iByClient !== 0 && !$.Console.Active) {
      return;
    }
    if (!$.Game.Parameters.AllowDebug) {
      return;
    }
    let pPropList = null;
    if (this.iTargetObj === -2) {
      pPropList = $.GameScript.ScenPropList.getPropList();
    } else if (this.iTargetObj === -1) {
      pPropList = $.ScriptEngine.GetPropList();
    } else if (!((pPropList = $.Objects.SafeObjectPointer(this.iTargetObj)) != null)) {
      pPropList = $.ScriptEngine.GetPropList();
    }
    let rVal = $.AulExec.DirectExec(pPropList, szScript, S("console script"), false, this.fUseVarsFromCallerContext ? $.AulExec.GetContext($.AulExec.GetContextDepth() - 1 | 0) : null);
    let pDebug = null;
    if ((pDebug = $.C4AulDebug.GetDebugger()) != null) {
      pDebug.ControlScriptEvaluated(szScript, rVal.GetDataString().getData());
    }
    $.LogF(S("-> %s::%s"), pPropList.GetName(), szScript);
    let is_local_script = true;
    if (!this.LocalControl()) {
      let pClient = null;
      if ($.Network.isEnabled()) {
        pClient = $.Network.Clients.GetClientByID(this.iByClient);
        if (pClient !== $.Network.Clients.GetLocal()) {
          is_local_script = false;
        }
      }
      if (pClient != null) {
        $.LogF(S(" = %s (by %s)"), rVal.GetDataString().getData(), pClient.getName());
      } else {
        $.LogF(S(" = %s (by client %d)"), rVal.GetDataString().getData(), this.iByClient);
      }
    } else {
      $.LogF(S(" = %s"), rVal.GetDataString().getData());
    }
    if ($.Console.Active) {
      let returned_object = rVal.getObj();
      if (this.editor_select_result && is_local_script && returned_object != null) {
        $.Console.EditCursor.ClearSelection(returned_object);
        $.Console.EditCursor.AddToSelection(returned_object);
        $.Console.EditCursor.OnSelectionChanged();
      }
      $.Console.EditCursor.InvalidateSelection();
    }
  }

  CompileFunc$pStdCompiler(pComp) {
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "iTargetObj"), S("TargetObj"), -1));
    pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "fUseVarsFromCallerContext"), S("UseVarsFromCallerContext"), false));
    pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "editor_select_result"), S("EditorSelectResult"), false));
    pComp.Value$StdNamingDefaultAdapt$StdStrBuf$x$2($.mkNamingAdapt$rStdStrBuf$pi8$x$b$b$2(this.Script, S("Script"), S("")));
    C4ControlPacket.prototype.CompileFunc$pStdCompiler.call(this, pComp);
  }

  $clone() { return new C4ControlScript().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.iTargetObj = o.iTargetObj;
    this.fUseVarsFromCallerContext = o.fUseVarsFromCallerContext;
    this.editor_select_result = o.editor_select_result;
    this.Script.$assign(o.Script);
    return this;
  }
}

export class C4ControlMsgBoardReply extends C4ControlPacket {
  reply = new $.StdCopyStrBuf();
  target = -1;
  player = 0;

  init$v() {
    super.init();
    this.reply = new $.StdCopyStrBuf();
    this.target = -1;
    this.player = -1;
    return this;
  }

  init$pi8$i32$i32(reply, target, player) {
    super.init();
    this.reply = new $.StdCopyStrBuf().init$pi8$b(reply);
    this.target = target;
    this.player = player;
    return this;
  }

  Execute() {
    let target_object = $.Objects.SafeObjectPointer(this.target);
    let target_player = $.Players.Get(this.player);
    if (target_player == null) {
      return;
    }
    if (!target_player.RemoveMessageBoardQuery(target_object)) {
      return;
    }
    if (this.reply.op_not()) {
      return;
    }
    let pars = new $.C4AulParSet().init$mC4Value$i32($.C4VString$StdStrBuf(new $.StdStrBuf().init$StdStrBuf$b(this.reply)), this.player);
    if (target_object != null) {
      target_object.Call$pi8$pC4AulParSet$b(S("InputCallback"), pars.op_and());
    } else {
      $.GameScript.Call(S("InputCallback"), pars.op_and());
    }
  }

  CompileFunc$pStdCompiler(pComp) {
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "target"), S("TargetObj"), -1));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "player"), S("Player"), $.NO_OWNER$C4Constants));
    pComp.Value$StdNamingDefaultAdapt$StdCopyStrBuf$x$2($.mkNamingAdapt$rStdCopyStrBuf$pi8$x$b$b$2(this.reply, S("Reply"), null));
    C4ControlPacket.prototype.CompileFunc$pStdCompiler.call(this, pComp);
  }

  $clone() { return new C4ControlMsgBoardReply().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.reply.$assign(o.reply);
    this.target = o.target;
    this.player = o.player;
    return this;
  }
}

export class C4ControlMsgBoardCmd extends C4ControlPacket {
  command = new $.StdCopyStrBuf();
  parameter = new $.StdCopyStrBuf();
  player = 0;

  init$v() {
    super.init();
    this.command = new $.StdCopyStrBuf();
    this.parameter = new $.StdCopyStrBuf();
    this.player = -1;
    return this;
  }

  init$pi8$pi8$i32(command, parameter, player) {
    super.init();
    this.command = new $.StdCopyStrBuf().init$pi8$b(command);
    this.parameter = new $.StdCopyStrBuf().init$pi8$b(parameter);
    this.player = player;
    return this;
  }

  Execute() {
    if (!$.Game.IsRunning) {
      return;
    }
    let cmd = $.MessageInput.GetCommand(this.command.getData());
    if (cmd == null) {
      return;
    }
    let script = new $.StdCopyStrBuf().init$pi8$b(P(cmd.Script, 0));
    script.Replace(S("%player%"), $.FormatString(S("%d"), this.player).getData());
    if (this.parameter.op_const_void_() != null) {
      script.Replace(S("%d"), $.FormatString(S("%d"), c$atoi(this.parameter.getData())).getData());
      let escaped_param = new $.StdCopyStrBuf().init$StdCopyStrBuf$b(this.parameter);
      escaped_param.EscapeString();
      script.Replace(S("%s"), escaped_param.getData());
    }
    let rv = $.AulExec.DirectExec($.ScriptEngine.GetPropList(), script.getData(), S("message board command"));
    let pDebug = $.C4AulDebug.GetDebugger();
    if (pDebug != null) {
      pDebug.ControlScriptEvaluated(script.getData(), rv.GetDataString().getData());
    }
  }

  CompileFunc$pStdCompiler(pComp) {
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "player"), S("Player"), $.NO_OWNER$C4Constants));
    pComp.Value$StdNamingAdapt$StdCopyStrBuf($.mkNamingAdapt$rStdCopyStrBuf$pi8(this.command, S("Command")));
    pComp.Value$StdNamingAdapt$StdCopyStrBuf($.mkNamingAdapt$rStdCopyStrBuf$pi8(this.parameter, S("Parameter")));
    C4ControlPacket.prototype.CompileFunc$pStdCompiler.call(this, pComp);
  }

  $clone() { return new C4ControlMsgBoardCmd().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.command.$assign(o.command);
    this.parameter.$assign(o.parameter);
    this.player = o.player;
    return this;
  }
}

export class C4ControlPlayerSelect extends C4ControlPacket {
  iPlr = -1;
  fIsAlt = false;
  iObjCnt = 0;
  pObjNrs = null;

  init$v() {
    super.init();
    this.iPlr = -1;
    this.fIsAlt = false;
    this.iObjCnt = 0;
    this.pObjNrs = null;
    return this;
  }

  init$i32$C4ObjectList$b(iPlr, Objs, fIsAlt) {
    super.init();
    this.iPlr = iPlr;
    this.fIsAlt = fIsAlt;
    this.iObjCnt = Objs.ObjectCount();
    this.pObjNrs = null;
    let $t1, $t2, $t3, $t4;
    this.pObjNrs = P(new Int32Array($u64n(this.iObjCnt)), 0);
    let i = 0;
    $t1 = Objs;
    $t2 = $t1.begin();
    $t3 = $t1.end();
    try {
      for (; $t2.op_ne($t3); $t2.op_inc$v()) {
        const obj = $t2.op_mul();
        this.pObjNrs.a[this.pObjNrs.o + ($t4 = i, i = i + 1 | 0, $t4)] = obj.Number;
      }
    } finally { $t2.$dtor(); $t3.$dtor(); }
    0;
    return this;
  }

  $dtor() {
    $delete(this.pObjNrs);
  }

  Execute() {
    let pPlr = $.Players.Get(this.iPlr);
    if (pPlr == null) {
      return;
    }
    let pObj = null;
    let iControlChecksum = 0;
    for (let i = 0; i < this.iObjCnt; i = i + 1 | 0) {
      if ((pObj = $.Objects.SafeObjectPointer(this.pObjNrs.a[this.pObjNrs.o + i])) != null) {
        iControlChecksum = iControlChecksum + Math.imul(pObj.Number, iControlChecksum + 0x490e6d | 0) | 0;
        if ((pObj.Category & 16384) !== 0) {
          if (this.fIsAlt) {
            pObj.Call$pi8$pC4AulParSet$b(S("~MouseSelectionAlt"), new $.C4AulParSet().init$i32(this.iPlr).op_and());
          } else {
            pObj.Call$pi8$pC4AulParSet$b(S("~MouseSelection"), new $.C4AulParSet().init$i32(this.iPlr).op_and());
          }
        }
      }
    }
    pPlr.CountControl(3 /*PCID_Command*/, iControlChecksum);
  }

  CompileFunc$pStdCompiler(pComp) {
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "iPlr"), S("Player"), -1));
    pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "fIsAlt"), S("IsAlt"), false));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "iObjCnt"), S("ObjCnt"), 0));
    if (pComp.isDeserializer()) {
      $delete(this.pObjNrs);
      this.pObjNrs = P(new Int32Array($u64n(this.iObjCnt)), 0);
    }
    pComp.Value$StdNamingDefaultAdapt$StdArrayAdapt$i32$_IdFuncClass$i32$i32($.mkNamingAdapt$mStdArrayAdapt$i32$_IdFuncClass$i32$pi8$i32$b$b($.mkArrayAdapt$pi32$i32(this.pObjNrs, this.iObjCnt), S("Objs"), 0));
    C4ControlPacket.prototype.CompileFunc$pStdCompiler.call(this, pComp);
  }

  $clone() { return new C4ControlPlayerSelect().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.iPlr = o.iPlr;
    this.fIsAlt = o.fIsAlt;
    this.iObjCnt = o.iObjCnt;
    this.pObjNrs = o.pObjNrs;
    return this;
  }
}

export class C4ControlPlayerControl extends C4ControlPacket {
  iPlr = -1;
  state = 0;
  ExtraData = new $.C4KeyEventData();
  ControlItems = [];

  init$v() {
    super.init();
    this.iPlr = -1;
    this.state = 0;
    this.ExtraData = new $.C4KeyEventData();
    this.ControlItems = [];
    return this;
  }

  init$i32$i32$C4KeyEventData(iPlr, state, rExtraData) {
    super.init();
    this.iPlr = iPlr;
    this.state = state;
    this.ExtraData = rExtraData.$clone();
    this.ControlItems = [];
    return this;
  }

  init$i32$i32$i32(iPlr, iControl, iExtraData) {
    super.init();
    this.iPlr = iPlr;
    this.state = 0;
    this.ExtraData = new $.C4KeyEventData().init$i32$i32$i32$i32$i32(iExtraData, 0, 0, 0, 0);
    this.ControlItems = [];
    C4ControlPlayerControl.prototype.AddControl.call(this, iControl, 0);
    return this;
  }

  Execute() {
    let pTargetCtrl = null;
    if (this.iPlr === -1) {
    } else {
      let pPlr = $.Players.Get(this.iPlr);
      if (pPlr != null) {
        pTargetCtrl = pPlr.Control;
      }
    }
    if (pTargetCtrl != null) {
      pTargetCtrl.ExecuteControlPacket(this);
    }
  }

  CompileFunc$pStdCompiler(pComp) {
    pComp.Value$StdNamingDefaultAdapt$StdIntPackAdapt$i32$i32$2($.mkNamingAdapt$mStdIntPackAdapt$i32$pi8$i32$b$b$2($.mkIntPackAdapt$ri32(P(this, "iPlr")), S("Player"), -1));
    pComp.Value$StdNamingDefaultAdapt$StdIntAdapt$i32$i32$i32$2($.mkNamingAdapt$mStdIntAdapt$i32$i32$pi8$i32$b$b$2($.mkIntAdapt$ri32$4(P(this, "state")), S("State"), 0));
    pComp.Value$StdNamingDefaultAdapt$C4KeyEventData$C4KeyEventData($.mkNamingAdapt$rC4KeyEventData$pi8$C4KeyEventData$b$b(this.ExtraData, S("ExtraData"), new $.C4KeyEventData()));
    pComp.Value$StdNamingDefaultAdapt$StdSTLContainerAdapt$vector$ControlItem$vector$ControlItem($.mkNamingAdapt$mStdSTLContainerAdapt$vector$ControlItem$pi8$vector$b$b($.mkSTLContainerAdapt$rvector$i32$7(this.ControlItems), S("Controls"), []));
    C4ControlPacket.prototype.CompileFunc$pStdCompiler.call(this, pComp);
  }

  AddControl(iControl, iTriggerMode) {
    $vpush(this.ControlItems, new C4ControlPlayerControl$ControlItem().init$i32$i32(iControl, iTriggerMode));
  }

  GetControlItems() {
    return this.ControlItems;
  }

  GetState() {
    return this.state;
  }

  GetExtraData() {
    return this.ExtraData;
  }

  SetExtraData(new_extra_data) {
    this.ExtraData.$assign(new_extra_data);
  }

  $clone() { return new C4ControlPlayerControl().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.iPlr = o.iPlr;
    this.state = o.state;
    this.ExtraData.$assign(o.ExtraData);
    this.ControlItems = o.ControlItems.slice();
    return this;
  }
}

export class C4ControlPlayerMouse extends C4ControlPacket {
  action = 0;
  player = 0;
  target_obj = 0;
  drag_obj = 0;
  old_obj = 0;

  init() {
    super.init();
    this.action = 0;
    this.player = -1;
    this.target_obj = 0;
    this.drag_obj = 0;
    this.old_obj = 0;
    return this;
  }

  static Hover(player, target, old_target, drag = null) {
    0;
    if (player == null) {
      return null;
    }
    let control = new C4ControlPlayerMouse().init();
    control.action = 1;
    control.player = player.Number;
    control.drag_obj = drag != null ? drag.Number : 0;
    control.target_obj = target != null ? target.Number : 0;
    control.old_obj = old_target != null ? old_target.Number : 0;
    return control;
  }

  static DragDrop(player, target, drag) {
    0;
    if (player == null) {
      return null;
    }
    let control = new C4ControlPlayerMouse().init();
    control.action = 2;
    control.player = player.Number;
    control.drag_obj = drag != null ? drag.Number : 0;
    control.target_obj = target != null ? target.Number : 0;
    return control;
  }

  Execute() {
    let callback_name = null;
    let pars = new $.C4AulParSet().init$i32(this.player);
    switch (this.action) {
      case 0:
        return;
      case 1:
        callback_name = S("~MouseHover");
        pars.op_index(1).$assign($.C4VObj($.Objects.SafeObjectPointer(this.old_obj)));
        pars.op_index(2).$assign($.C4VObj($.Objects.SafeObjectPointer(this.target_obj)));
        pars.op_index(3).$assign($.C4VObj($.Objects.SafeObjectPointer(this.drag_obj)));
        break;
      case 2:
        callback_name = S("~MouseDragDrop");
        pars.op_index(1).$assign($.C4VObj($.Objects.SafeObjectPointer(this.drag_obj)));
        pars.op_index(2).$assign($.C4VObj($.Objects.SafeObjectPointer(this.target_obj)));
        break;
    }
    if (callback_name == null) {
      return;
    }
    $.ScriptEngine.Call$pi8$pC4AulParSet$b(callback_name, pars.op_and());
  }

  CompileFunc$pStdCompiler(pComp) {
    pComp.Value$StdNamingAdapt$i32($.mkNamingAdapt$ri32$pi8(P(this, "action"), S("Action")));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "player"), S("Player"), $.NO_OWNER$C4Constants));
    pComp.Value$StdNamingAdapt$i32($.mkNamingAdapt$ri32$pi8(P(this, "target_obj"), S("TargetObj")));
    pComp.Value$StdNamingAdapt$i32($.mkNamingAdapt$ri32$pi8(P(this, "drag_obj"), S("DragObj")));
    pComp.Value$StdNamingAdapt$i32($.mkNamingAdapt$ri32$pi8(P(this, "old_obj"), S("OldObj")));
  }

  $clone() { return new C4ControlPlayerMouse().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.action = o.action;
    this.player = o.player;
    this.target_obj = o.target_obj;
    this.drag_obj = o.drag_obj;
    this.old_obj = o.old_obj;
    return this;
  }
}

export class C4ControlMenuCommand extends C4ControlPacket {
  actionID = 0;
  player = 0;
  menuID = 0;
  subwindowID = 0;
  target = 0;
  actionType = 0;

  init$v() {
    super.init();
    this.menuID = 0;
    this.subwindowID = 0;
    return this;
  }

  init$i32$i32$i32$i32$pC4Object$i32(actionID, player, menuID, subwindowID, target, actionType) {
    super.init();
    this.actionID = actionID;
    this.player = player;
    this.menuID = menuID;
    this.subwindowID = subwindowID;
    this.target = target != null ? target.Number : 0;
    this.actionType = actionType;
    return this;
  }

  Execute() {
    if (this.actionType < 0 || this.actionType >= 30) {
      $.Log(S("Warning: invalid action type for C4ControlMenuCommand!"));
      return;
    }
    let menu = $.Game.ScriptGuiRoot.GetChildByID(this.menuID);
    if (menu == null) {
      return;
    }
    let obj = this.target !== 0 ? $.Objects.ObjectPointer(this.target) : null;
    if (this.target !== 0 && obj == null) {
      return;
    }
    menu.ExecuteCommand(this.actionID, this.player, this.subwindowID, this.actionType, obj);
  }

  CompileFunc$pStdCompiler(pComp) {
    pComp.Value$StdNamingDefaultAdapt$StdIntPackAdapt$i32$i32$2($.mkNamingAdapt$mStdIntPackAdapt$i32$pi8$i32$b$b$2($.mkIntPackAdapt$ri32(P(this, "actionID")), S("ID"), -1));
    pComp.Value$StdNamingDefaultAdapt$StdIntPackAdapt$i32$i32$2($.mkNamingAdapt$mStdIntPackAdapt$i32$pi8$i32$b$b$2($.mkIntPackAdapt$ri32(P(this, "player")), S("Player"), -1));
    pComp.Value$StdNamingDefaultAdapt$StdIntPackAdapt$i32$i32$2($.mkNamingAdapt$mStdIntPackAdapt$i32$pi8$i32$b$b$2($.mkIntPackAdapt$ri32(P(this, "menuID")), S("Menu"), 0));
    pComp.Value$StdNamingDefaultAdapt$StdIntPackAdapt$i32$i32$2($.mkNamingAdapt$mStdIntPackAdapt$i32$pi8$i32$b$b$2($.mkIntPackAdapt$ri32(P(this, "subwindowID")), S("Window"), 0));
    pComp.Value$StdNamingDefaultAdapt$StdIntPackAdapt$i32$i32$2($.mkNamingAdapt$mStdIntPackAdapt$i32$pi8$i32$b$b$2($.mkIntPackAdapt$ri32(P(this, "actionType")), S("Action"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "target"), S("Target"), 0));
    C4ControlPacket.prototype.CompileFunc$pStdCompiler.call(this, pComp);
  }

  $clone() { return new C4ControlMenuCommand().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.actionID = o.actionID;
    this.player = o.player;
    this.menuID = o.menuID;
    this.subwindowID = o.subwindowID;
    this.target = o.target;
    this.actionType = o.actionType;
    return this;
  }
}

export class C4ControlPlayerAction extends C4ControlPacket {
  action = 0 /*CPA_NoAction*/;
  source = 0;
  target = 0;
  param_int = 0;
  param_str = new $.StdCopyStrBuf();

  init(source = null) {
    super.init();
    this.action = 0 /*CPA_NoAction*/;
    this.source = source != null ? source.Number : $.NO_OWNER$C4Constants;
    this.target = -1;
    this.param_int = 0;
    this.param_str = new $.StdCopyStrBuf();
    return this;
  }

  static Surrender(source) {
    0;
    let control = new C4ControlPlayerAction().init(source);
    control.action = 1 /*CPA_Surrender*/;
    return control;
  }

  static Eliminate(source) {
    0;
    let control = new C4ControlPlayerAction().init(source);
    control.action = 4 /*CPA_Eliminate*/;
    return control;
  }

  static ActivateGoalMenu(source) {
    0;
    let control = new C4ControlPlayerAction().init(source);
    control.action = 3 /*CPA_ActivateGoalMenu*/;
    return control;
  }

  static ActivateGoal(source, goal) {
    0;
    0;
    let control = new C4ControlPlayerAction().init(source);
    control.action = 2 /*CPA_ActivateGoal*/;
    control.target = goal.Number;
    return control;
  }

  static SetHostility(source, target, hostile) {
    0;
    0;
    let control = new C4ControlPlayerAction().init(source);
    control.action = 16 /*CPA_SetHostility*/;
    control.target = target != null ? target.Number : $.NO_OWNER$C4Constants;
    control.param_int = hostile ? 1 : 0;
    return control;
  }

  static SetTeam(source, team) {
    0;
    let control = new C4ControlPlayerAction().init(source);
    control.action = 17 /*CPA_SetTeam*/;
    control.target = team;
    return control;
  }

  static InitScenarioPlayer(source, team) {
    0;
    let control = new C4ControlPlayerAction().init(source);
    control.action = 32 /*CPA_InitScenarioPlayer*/;
    control.target = team;
    return control;
  }

  static InitPlayerControl(source, ctrl_set = null) {
    0;
    let control = new C4ControlPlayerAction().init(source);
    control.action = 33 /*CPA_InitPlayerControl*/;
    if (ctrl_set != null) {
      control.param_str.op_assign$pi8(ctrl_set.GetName());
      if (ctrl_set.HasKeyboard()) {
        control.param_int |= 1;
      }
      if (ctrl_set.HasMouse()) {
        control.param_int |= 2;
      }
      if (ctrl_set.HasGamepad()) {
        control.param_int |= 4;
      }
    }
    return control;
  }

  Execute() {
    let source_player = $.Players.Get(this.source);
    if (source_player == null) {
      return;
    }
    switch (this.action) {
      case 1:
        source_player.Surrender();
        break;
      case 4:
        source_player.Eliminate();
        break;
      case 2:
        {
          let goal = $.Objects.SafeObjectPointer(this.target);
          if (goal == null) {
            return;
          }
          let pars = new $.C4AulParSet().init$ri32(P(source_player, "Number"));
          goal.Call$pi8$pC4AulParSet$b(S("Activate"), pars.op_and());
          break;
        }
      case 3:
        source_player.Menu.ActivateGoals(source_player.Number, source_player.LocalControl && !$.Control$2.isReplay());
        break;
      case 16:
        {
          let target_player = $.Players.Get(this.target);
          if (target_player == null) {
            return;
          }
          let pars = new $.C4AulParSet().init$ri32$ri32$mb(P(source_player, "Number"), P(target_player, "Number"), this.param_int !== 0);
          $.ScriptEngine.Call$pi8$pC4AulParSet$b(S("SetHostility"), pars.op_and());
          break;
        }
      case 17:
        {
          if (!$.Game.Teams.IsTeamSwitchAllowed()) {
            return;
          }
          let team = $.Game.Teams.GetTeamByID(this.target);
          if (team == null && this.target !== -1) {
            return;
          }
          let pars = new $.C4AulParSet().init$ri32$i32(P(source_player, "Number"), this.target);
          $.ScriptEngine.Call$pi8$pC4AulParSet$b(S("SetPlayerTeam"), pars.op_and());
          break;
        }
      case 32:
        {
          let pars = new $.C4AulParSet().init$ri32$i32(P(source_player, "Number"), this.target);
          $.ScriptEngine.Call$pi8$pC4AulParSet$b(S("InitScenarioPlayer"), pars.op_and());
          break;
        }
      case 33:
        {
          let callback_name = S("~InitializePlayerControl");
          let pars = new $.C4AulParSet().init$ri32(P(source_player, "Number"));
          if (this.param_str.op_const_void_() != null) {
            pars.op_index(1).$assign($.C4VString$StdStrBuf(new $.StdStrBuf().init$StdStrBuf$b(this.param_str)));
            pars.op_index(2).$assign($.C4VBool(1 === (this.param_int & 1)));
            pars.op_index(3).$assign($.C4VBool(2 === (this.param_int & 2)));
            pars.op_index(4).$assign($.C4VBool(4 === (this.param_int & 4)));
          }
          $.ScriptEngine.Call$pi8$pC4AulParSet$b(callback_name, pars.op_and());
          break;
        }
      case 0:
        break;
    }
  }

  CompileFunc$pStdCompiler(pComp) {
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "source"), S("Player"), $.NO_OWNER$C4Constants));
    const ActionNames = $own([
  ((($o) => ($o.Name = S("Surrender"), $o.Val = 1 /*CPA_Surrender*/, $o))(new $.StdEnumEntry$i32$2())),
  ((($o) => ($o.Name = S("ActivateGoal"), $o.Val = 2 /*CPA_ActivateGoal*/, $o))(new $.StdEnumEntry$i32$2())),
  ((($o) => ($o.Name = S("ActivateGoalMenu"), $o.Val = 3 /*CPA_ActivateGoalMenu*/, $o))(new $.StdEnumEntry$i32$2())),
  ((($o) => ($o.Name = S("Eliminate"), $o.Val = 4 /*CPA_Eliminate*/, $o))(new $.StdEnumEntry$i32$2())),
  ((($o) => ($o.Name = S("SetHostility"), $o.Val = 16 /*CPA_SetHostility*/, $o))(new $.StdEnumEntry$i32$2())),
  ((($o) => ($o.Name = S("SetTeam"), $o.Val = 17 /*CPA_SetTeam*/, $o))(new $.StdEnumEntry$i32$2())),
  ((($o) => ($o.Name = S("InitScenarioPlayer"), $o.Val = 32 /*CPA_InitScenarioPlayer*/, $o))(new $.StdEnumEntry$i32$2())),
  ((($o) => ($o.Name = S("InitPlayerControl"), $o.Val = 33 /*CPA_InitPlayerControl*/, $o))(new $.StdEnumEntry$i32$2())),
  ((($o) => ($o.Name = null, $o.Val = 0 /*CPA_NoAction*/, $o))(new $.StdEnumEntry$i32$2())),
]);
    pComp.Value$StdNamingDefaultAdapt$StdEnumAdapt$i32$i32$i32$3($.mkNamingAdapt$mStdEnumAdapt$i32$i32$pi8$i32$b$b$3($.mkEnumAdapt$3(P(this, "action"), $oat(ActionNames, 0)), S("Action"), 0 /*CPA_NoAction*/));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "target"), S("Target"), $.NO_OWNER$C4Constants));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "param_int"), S("DataI"), 0));
    pComp.Value$StdNamingDefaultAdapt$StdCopyStrBuf$x$2($.mkNamingAdapt$rStdCopyStrBuf$pi8$x$b$b$2(this.param_str, S("DataS"), null));
    C4ControlPacket.prototype.CompileFunc$pStdCompiler.call(this, pComp);
  }

  $clone() { return new C4ControlPlayerAction().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.action = o.action;
    this.source = o.source;
    this.target = o.target;
    this.param_int = o.param_int;
    this.param_str.$assign(o.param_str);
    return this;
  }
}

export class C4ControlSyncCheck extends C4ControlPacket {
  Frame = 0;
  ControlTick = 0;
  RandomCount = 0;
  AllCrewPosX = 0;
  PXSCount = 0;
  MassMoverIndex = 0;
  ObjectCount = 0;
  ObjectEnumerationIndex = 0;
  SectShapeSum = 0;

  init() {
    super.init();
    return this;
  }

  Set$v() {
    this.Frame = $.Game.FrameCounter;
    this.ControlTick = $.Control$2.ControlTick;
    this.RandomCount = $.RandomCount;
    this.AllCrewPosX = C4ControlSyncCheck.GetAllCrewPosX();
    this.PXSCount = $.PXS.Count | 0;
    this.MassMoverIndex = $.MassMover.CreatePtr;
    this.ObjectCount = $.Objects.ObjectCount();
    this.ObjectEnumerationIndex = $.C4PropListNumbered.GetEnumerationIndex();
    this.SectShapeSum = $.Objects.Sectors.getShapeSum();
  }

  getFrame() {
    return this.Frame;
  }

  Sync() {
    return false;
  }

  Execute() {
    if ($.Control$2.isCtrlHost()) {
      return;
    }
    let pSyncCheck = $.Control$2.GetSyncCheck(this.Frame);
    const SyncCheck = pSyncCheck;
    if (pSyncCheck == null) {
      $.Control$2.SyncChecks.Add$i32$pC4ControlPacket(133 /*CID_SyncCheck*/, this.$clone());
      return;
    }
    if (this.Frame !== pSyncCheck.Frame || this.ControlTick !== pSyncCheck.ControlTick && !$.Control$2.isReplay() || this.RandomCount !== pSyncCheck.RandomCount || this.AllCrewPosX !== pSyncCheck.AllCrewPosX || this.PXSCount !== pSyncCheck.PXSCount || this.MassMoverIndex !== pSyncCheck.MassMoverIndex || this.ObjectCount !== pSyncCheck.ObjectCount || this.ObjectEnumerationIndex !== pSyncCheck.ObjectEnumerationIndex || this.SectShapeSum !== pSyncCheck.SectShapeSum) {
      let szThis = S("Client");
      let szOther = P($.Control$2.isReplay() ? S("Rec ") : S("Host"), 0);
      if (this.iByClient !== $.Control$2.ClientID()) {
        let szTemp = szThis;
        szThis = szOther;
        szOther = szTemp;
      }
      $.LogFatal(S("Network: Synchronization loss!"));
      $.LogFatal($.FormatString(S("Network: %s Frm %i Ctrl %i Rnc %i Cpx %i PXS %i MMi %i Obc %i Oei %i Sct %i"), szThis, this.Frame, this.ControlTick, this.RandomCount, this.AllCrewPosX, this.PXSCount, this.MassMoverIndex, this.ObjectCount, this.ObjectEnumerationIndex, this.SectShapeSum).getData());
      $.LogFatal($.FormatString(S("Network: %s Frm %i Ctrl %i Rnc %i Cpx %i PXS %i MMi %i Obc %i Oei %i Sct %i"), szOther, SyncCheck.Frame, SyncCheck.ControlTick, SyncCheck.RandomCount, SyncCheck.AllCrewPosX, SyncCheck.PXSCount, SyncCheck.MassMoverIndex, SyncCheck.ObjectCount, SyncCheck.ObjectEnumerationIndex, SyncCheck.SectShapeSum).getData());
      $.StartSoundEffect(S("UI::SyncError"));
      $.Network.LeagueNotifyDisconnect(0, 2 /*C4LDR_Desync*/);
      if ($.Control$2.isReplay()) {
        $.Game.DoGameOver();
      } else if ($.Control$2.isNetwork()) {
        $.Game.RoundResults.EvaluateNetwork(3 /*NR_NetError*/, S("Network: Synchronization loss!"));
        $.Network.Clear$v();
      }
    }
  }

  CompileFunc$pStdCompiler(pComp) {
    pComp.Value$StdNamingDefaultAdapt$StdIntPackAdapt$i32$i32$2($.mkNamingAdapt$mStdIntPackAdapt$i32$pi8$i32$b$b$2($.mkIntPackAdapt$ri32(P(this, "Frame")), S("Frame"), -1));
    pComp.Value$StdNamingDefaultAdapt$StdIntPackAdapt$i32$i32$2($.mkNamingAdapt$mStdIntPackAdapt$i32$pi8$i32$b$b$2($.mkIntPackAdapt$ri32(P(this, "ControlTick")), S("ControlTick"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "RandomCount"), S("RandomCount"), 0));
    pComp.Value$StdNamingDefaultAdapt$StdIntPackAdapt$i32$i32$2($.mkNamingAdapt$mStdIntPackAdapt$i32$pi8$i32$b$b$2($.mkIntPackAdapt$ri32(P(this, "AllCrewPosX")), S("AllCrewPosX"), 0));
    pComp.Value$StdNamingDefaultAdapt$StdIntPackAdapt$i32$i32$2($.mkNamingAdapt$mStdIntPackAdapt$i32$pi8$i32$b$b$2($.mkIntPackAdapt$ri32(P(this, "PXSCount")), S("PXSCount"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "MassMoverIndex"), S("MassMoverIndex"), 0));
    pComp.Value$StdNamingDefaultAdapt$StdIntPackAdapt$i32$i32$2($.mkNamingAdapt$mStdIntPackAdapt$i32$pi8$i32$b$b$2($.mkIntPackAdapt$ri32(P(this, "ObjectCount")), S("ObjectCount"), 0));
    pComp.Value$StdNamingDefaultAdapt$StdIntPackAdapt$i32$i32$2($.mkNamingAdapt$mStdIntPackAdapt$i32$pi8$i32$b$b$2($.mkIntPackAdapt$ri32(P(this, "ObjectEnumerationIndex")), S("ObjectEnumerationIndex"), 0));
    pComp.Value$StdNamingDefaultAdapt$StdIntPackAdapt$i32$i32$2($.mkNamingAdapt$mStdIntPackAdapt$i32$pi8$i32$b$b$2($.mkIntPackAdapt$ri32(P(this, "SectShapeSum")), S("SectShapeSum"), 0));
    C4ControlPacket.prototype.CompileFunc$pStdCompiler.call(this, pComp);
  }

  static GetAllCrewPosX() {
    let $t1, $t2, $t3;
    let cpx = 0;
    for (let pPlr = $.Players.First; pPlr != null; pPlr = pPlr.Next) {
      $t1 = pPlr.Crew;
      $t2 = $t1.begin();
      $t3 = $t1.end();
      try {
        for (; $t2.op_ne($t3); $t2.op_inc$v()) {
          const member = $t2.op_mul();
          cpx = cpx + $.fixtoi$C4Fixed$i32(member.fix_x, 100) | 0;
        }
      } finally { $t2.$dtor(); $t3.$dtor(); }
    }
    return cpx;
  }

  $clone() { return new C4ControlSyncCheck().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.Frame = o.Frame;
    this.ControlTick = o.ControlTick;
    this.RandomCount = o.RandomCount;
    this.AllCrewPosX = o.AllCrewPosX;
    this.PXSCount = o.PXSCount;
    this.MassMoverIndex = o.MassMoverIndex;
    this.ObjectCount = o.ObjectCount;
    this.ObjectEnumerationIndex = o.ObjectEnumerationIndex;
    this.SectShapeSum = o.SectShapeSum;
    return this;
  }
}

export class C4ControlSynchronize extends C4ControlPacket {
  fSavePlrFiles = false;
  fSyncClearance = false;

  init(fSavePlrFiles = false, fSyncClearance = false) {
    super.init();
    this.fSavePlrFiles = fSavePlrFiles;
    this.fSyncClearance = fSyncClearance;
    return this;
  }

  Execute() {
    $.Game.Synchronize(this.fSavePlrFiles);
    if (this.fSyncClearance) {
      $.Game.SyncClearance();
    }
  }

  CompileFunc$pStdCompiler(pComp) {
    pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "fSavePlrFiles"), S("SavePlrs"), false));
    pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "fSyncClearance"), S("SyncClear"), false));
    C4ControlPacket.prototype.CompileFunc$pStdCompiler.call(this, pComp);
  }

  $clone() { return new C4ControlSynchronize().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.fSavePlrFiles = o.fSavePlrFiles;
    this.fSyncClearance = o.fSyncClearance;
    return this;
  }
}

export class C4ControlClientJoin extends C4ControlPacket {
  Core = new $.C4ClientCore().init();

  init$v() {
    super.init();
    this.Core = new $.C4ClientCore().init();
    return this;
  }

  init$C4ClientCore(Core) {
    super.init();
    this.Core = Core.$clone();
    return this;
  }

  Sync() {
    return false;
  }

  Lobby() {
    return true;
  }

  Execute() {
    if (this.iByClient !== 0) {
      return;
    }
    let pClient = $.Game.Clients.Add$C4ClientCore(this.Core);
    if (pClient == null) {
      return;
    }
    $.LogF($.LoadResStr(S("IDS_NET_CLIENT_JOIN")), this.Core.getName());
    let pLobby = $.Network.GetLobby();
    if (pLobby != null) {
      pLobby.OnClientJoin(pClient);
    }
    if ($.Console.Active) {
      $.Console.UpdateMenus();
    }
  }

  CompileFunc$pStdCompiler(pComp) {
    pComp.Value$StdNamingAdapt$C4ClientCore($.mkNamingAdapt$rC4ClientCore$pi8(this.Core, S("ClientCore")));
    C4ControlPacket.prototype.CompileFunc$pStdCompiler.call(this, pComp);
  }

  $clone() { return new C4ControlClientJoin().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.Core.$assign(o.Core);
    return this;
  }
}

export class C4ControlClientUpdate extends C4ControlPacket {
  static MinReadyAnnouncementDelay;
  iID = 0;
  eType = -1 /*CUT_None*/;
  iData = 0;

  init$v() {
    super.init();
    this.iID = 0;
    this.eType = -1 /*CUT_None*/;
    this.iData = 0;
    return this;
  }

  init$i32$i32$i32(iID, eType, iData = 0) {
    super.init();
    this.iID = iID;
    this.eType = eType;
    this.iData = iData;
    return this;
  }

  Sync() {
    return false;
  }

  Lobby() {
    return true;
  }

  Execute() {
    if (this.iByClient !== 0 && this.eType !== 2) {
      return;
    }
    let pClient = $.Game.Clients.getClientByID(this.iID);
    if (pClient == null) {
      return;
    }
    let strClient = new $.StdCopyStrBuf().init$pi8$b($.LoadResStr(pClient.isLocal() ? S("IDS_NET_LOCAL_CLIENT") : S("IDS_NET_CLIENT")));
    switch (this.eType) {
      case -1:
        break;
      case 0:
        if ((pClient.isActivated() ? 1 : 0) === (!(this.iData === 0) ? 1 : 0)) {
          break;
        }
        $.LogF($.LoadResStr(this.iData !== 0 ? S("IDS_NET_CLIENT_ACTIVATED") : S("IDS_NET_CLIENT_DEACTIVATED")), strClient.getData(), pClient.getName());
        pClient.SetActivated(!(this.iData === 0));
        if (pClient.isLocal()) {
          $.Control$2.SetActivated(!(this.iData === 0));
        }
        break;
      case 1:
        if (pClient.isObserver()) {
          break;
        }
        $.LogF($.LoadResStr(S("IDS_NET_CLIENT_OBSERVE")), strClient.getData(), pClient.getName());
        pClient.SetObserver();
        if (pClient.isLocal()) {
          $.Control$2.SetActivated(false);
        }
        $.Players.RemoveAtClient$i32$b(this.iID, true);
        break;
      case 2:
        {
          if ((pClient.isLobbyReady() ? 1 : 0) === (!(this.iData === 0) ? 1 : 0)) {
            break;
          }
          const last_change_time = [1];
          pClient.SetLobbyReady(!(this.iData === 0), P(last_change_time, 0));
          if (last_change_time[0] >= 1) {
            if (!pClient.isLocal()) {
              $.LogF($.LoadResStr(this.iData !== 0 ? S("IDS_NET_CLIENT_READY") : S("IDS_NET_CLIENT_UNREADY")), strClient.getData(), pClient.getName());
            }
            let lobby = $.Network.GetLobby();
            if (lobby != null) {
              lobby.OnClientReadyStateChange();
            }
          }
          break;
        }
    }
    $.Console.UpdateNetMenu();
  }

  CompileFunc$pStdCompiler(pComp) {
    pComp.Value$StdNamingDefaultAdapt$StdIntAdapt$i32$u8$i32$6($.mkNamingAdapt$mStdIntAdapt$i32$u8$pi8$i32$b$b$6($.mkIntAdaptT$10(P(this, "eType")), S("Type"), -1 /*CUT_None*/));
    pComp.Value$StdNamingDefaultAdapt$StdIntPackAdapt$i32$i32$2($.mkNamingAdapt$mStdIntPackAdapt$i32$pi8$i32$b$b$2($.mkIntPackAdapt$ri32(P(this, "iID")), S("ClientID"), $.C4ClientIDUnknown$C4Client));
    if (this.eType === 0) {
      pComp.Value$StdNamingDefaultAdapt$StdIntPackAdapt$i32$i32$2($.mkNamingAdapt$mStdIntPackAdapt$i32$pi8$i32$b$b$2($.mkIntPackAdapt$ri32(P(this, "iData")), S("Data"), 0));
    }
    if (this.eType === 2) {
      pComp.Value$StdNamingDefaultAdapt$StdIntPackAdapt$i32$i32$2($.mkNamingAdapt$mStdIntPackAdapt$i32$pi8$i32$b$b$2($.mkIntPackAdapt$ri32(P(this, "iData")), S("Data"), 0));
    }
    C4ControlPacket.prototype.CompileFunc$pStdCompiler.call(this, pComp);
  }

  $clone() { return new C4ControlClientUpdate().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.iID = o.iID;
    this.eType = o.eType;
    this.iData = o.iData;
    return this;
  }
}

export class C4ControlClientRemove extends C4ControlPacket {
  iID = 0;
  strReason = new $.StdCopyStrBuf();

  init$v() {
    super.init();
    this.strReason = new $.StdCopyStrBuf();
    return this;
  }

  init$i32$pi8(iID, szReason = S("")) {
    super.init();
    this.iID = iID;
    this.strReason = new $.StdCopyStrBuf().init$pi8$b(szReason);
    return this;
  }

  Sync() {
    return false;
  }

  Lobby() {
    return true;
  }

  Execute() {
    if (this.iByClient !== 0) {
      return;
    }
    if (this.iID === 0) {
      return;
    }
    let pClient = $.Game.Clients.getClientByID(this.iID);
    if (pClient == null) {
      if ($.Control$2.isReplay()) {
        $.Players.RemoveAtClient$i32$b(this.iID, true);
      }
      return;
    }
    let strClient = new $.StdCopyStrBuf().init$pi8$b($.LoadResStr(pClient.isLocal() ? S("IDS_NET_LOCAL_CLIENT") : S("IDS_NET_CLIENT")));
    if (pClient.isLocal()) {
      let sMsg = new $.StdStrBuf();
      sMsg.Format($.LoadResStr(S("IDS_NET_CLIENT_REMOVED")), strClient.getData(), pClient.getName(), this.strReason.getData());
      $.Log(sMsg.getData());
      $.Game.RoundResults.EvaluateNetwork(3 /*NR_NetError*/, sMsg.getData());
      $.Control$2.ChangeToLocal();
      return;
    }
    if (!$.Game.Clients.Remove(pClient)) {
      return;
    }
    $.LogF($.LoadResStr(S("IDS_NET_CLIENT_REMOVED")), strClient.getData(), pClient.getName(), this.strReason.getData());
    $.Players.RemoveAtClient$i32$b(this.iID, true);
    if ($.Network.isEnabled()) {
      $.Network.ResList.RemoveAtClient(this.iID);
    }
    let pLobby = $.Network.GetLobby();
    if (pLobby != null && $.pGUI != null) {
      pLobby.OnClientPart(pClient);
    }
    $.Network.Players.OnClientPart(pClient);
    if ($.Console.Active) {
      $.Console.UpdateMenus();
    }
    $delete(pClient);
  }

  CompileFunc$pStdCompiler(pComp) {
    pComp.Value$StdNamingDefaultAdapt$StdIntPackAdapt$i32$i32($.mkNamingAdapt$mStdIntPackAdapt$i32$pi8$i32$b$b($.mkIntPackAdapt$ri32(P(this, "iID")), S("ClientID"), -1 /*CUT_None*/));
    pComp.Value$StdNamingDefaultAdapt$StdCopyStrBuf$x($.mkNamingAdapt$rStdCopyStrBuf$pi8$x$b$b(this.strReason, S("Reason"), S("")));
    C4ControlPacket.prototype.CompileFunc$pStdCompiler.call(this, pComp);
  }

  $clone() { return new C4ControlClientRemove().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.iID = o.iID;
    this.strReason.$assign(o.strReason);
    return this;
  }
}

export class C4ControlPlayerInfo extends C4ControlPacket {
  PlrInfo = new $.C4ClientPlayerInfos().init();

  init$v() {
    super.init();
    this.PlrInfo = new $.C4ClientPlayerInfos().init();
    return this;
  }

  init$C4ClientPlayerInfos(PlrInfo) {
    super.init();
    this.PlrInfo = new $.C4ClientPlayerInfos().$copy(PlrInfo);
    return this;
  }

  GetInfo() {
    return this.PlrInfo;
  }

  Sync() {
    return false;
  }

  Lobby() {
    return true;
  }

  Execute() {
    if ($.Control$2.isReplay() || !$.Control$2.isNetwork()) {
      $.Game.PlayerInfos.AddInfo(new $.C4ClientPlayerInfos().$copy(this.PlrInfo));
      $.Game.Teams.RecheckPlayers();
      if ($.Control$2.isLocal()) {
        $.Game.PlayerInfos.LocalJoinUnjoinedPlayersInQueue();
      }
    } else {
      $.Network.Players.HandlePlayerInfo(this.PlrInfo);
    }
  }

  CompileFunc$pStdCompiler(pComp) {
    pComp.Value$rC4ClientPlayerInfos(this.PlrInfo);
    C4ControlPacket.prototype.CompileFunc$pStdCompiler.call(this, pComp);
  }

  $clone() { return new C4ControlPlayerInfo().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.PlrInfo.$assign(o.PlrInfo);
    return this;
  }
}

export class C4ControlJoinPlayer extends C4ControlPacket {
  Filename = new $.StdStrBuf();
  iAtClient = -1;
  idInfo = -1;
  fByRes = false;
  PlrData = new $.StdBuf();
  ResCore = new $.C4Network2ResCore();

  init$v() {
    super.init();
    this.Filename = new $.StdStrBuf();
    this.iAtClient = -1;
    this.idInfo = -1;
    this.fByRes = false;
    this.PlrData = new $.StdBuf();
    this.ResCore = new $.C4Network2ResCore().init();
    return this;
  }

  init$pi8$i32$i32$C4Network2ResCore(szFilename, iAtClient, iIDInfo, ResCore) {
    super.init();
    this.Filename = new $.StdStrBuf().init$pi8$b(szFilename, true);
    this.iAtClient = iAtClient;
    this.idInfo = iIDInfo;
    this.fByRes = true;
    this.PlrData = new $.StdBuf();
    this.ResCore = ResCore.$clone();
    return this;
  }

  init$pi8$i32$i32(szFilename, iAtClient, iIDInfo) {
    super.init();
    this.Filename = new $.StdStrBuf().init$pi8$b(szFilename, true);
    this.iAtClient = iAtClient;
    this.idInfo = iIDInfo;
    this.fByRes = false;
    this.PlrData = new $.StdBuf();
    this.ResCore = new $.C4Network2ResCore().init();
    let filename = new $.StdStrBuf();
    if (szFilename != null && $.Reloc.LocateItem(szFilename, filename)) {
      let file_is_temp = false;
      if ($.DirectoryExists(filename.getData())) {
        let filename_buf = new $.StdStrBuf();
        filename_buf.Copy$pi8($.Config.AtTempPath($.GetFilenameOnly(filename.getData())));
        $.MakeTempFilename$pStdStrBuf(filename_buf);
        if ($.C4Group_PackDirectoryTo(filename.getData(), filename_buf.getData())) {
          filename.Take$rStdStrBuf(filename_buf);
          file_is_temp = true;
        } else {
          $.LogF(S("[!]Error packing player file %s to %s for join: Pack failed."), filename.getData(), filename_buf.getData());
          0;
        }
      }
      let fSuccess = $.StdBuf.prototype.LoadFromFile.call(this.PlrData, filename.getData());
      if (!fSuccess) {
        $.LogF(S("[!]Error loading player file from %s."), filename.getData());
        0;
      }
      if (file_is_temp) {
        $.EraseFile(filename.getData());
      }
    } else if (szFilename != null) {
      $.LogF(S("[!]Error loading player file from %s."), szFilename);
      0;
    }
    return this;
  }

  Execute() {
    let szFilename = this.Filename.getData();
    let pClient = $.Game.Clients.getClientByID(this.iAtClient);
    if (pClient != null) {
      let pInfo = $.Game.PlayerInfos.GetPlayerInfoByID$i32(this.idInfo);
      if (pInfo == null) {
        $.LogF(S("ERROR: Ghost player join: No info for %d"), this.idInfo);
        0;
      } else if (this.LocalControl()) {
        $.Game.JoinPlayer(szFilename, this.iAtClient, pClient.getName(), pInfo);
      } else if (!this.fByRes) {
        if ($.StdBuf.prototype.getSize.call(this.PlrData) !== 0) {
          let PlayerFilename = new $.StdStrBuf();
          PlayerFilename.Format(S("%s-%s"), pClient.getName(), $.GetFilename(szFilename));
          $.StdStrBuf.prototype.op_assign$pi8.call(PlayerFilename, $.Config.AtTempPath(PlayerFilename.getData()));
          if ($.StdBuf.prototype.SaveToFile.call(this.PlrData, PlayerFilename.getData())) {
            $.Game.JoinPlayer(PlayerFilename.getData(), this.iAtClient, pClient.getName(), pInfo);
            $.EraseFile(PlayerFilename.getData());
          }
        } else if (pInfo.GetType() === 2) {
          $.Game.JoinPlayer(null, this.iAtClient, pClient.getName(), pInfo);
        } else {
          $.LogF(S("ERROR: Ghost player join: No player data for %s"), pInfo.GetName());
          0;
        }
      } else if ($.Control$2.isNetwork()) {
        let pRes = $.Network.ResList.getRefRes$i32(this.ResCore.getID());
        if (pRes.op_C4Network2Res_() != null && pRes.op_arrow().isComplete()) {
          $.Game.JoinPlayer(pRes.op_arrow().getFile(), this.iAtClient, pClient.getName(), pInfo);
        }
      } else if ($.Control$2.isReplay()) {
        let PlayerFilename = new $.StdStrBuf();
        PlayerFilename.Format(S("%s/%d-%s"), P($.Game.ScenarioFilename, 0), this.ResCore.getID(), $.GetFilename(this.ResCore.getFileName()));
        $.Game.JoinPlayer(PlayerFilename.getData(), this.iAtClient, pClient != null ? pClient.getName() : S("Unknown"), pInfo);
      } else {
        0;
      }
    }
    $.Game.OnPlayerJoinFinished();
  }

  CompileFunc$pStdCompiler(pComp) {
    pComp.Value$StdNamingDefaultAdapt$C4NetFilenameAdapt$x($.mkNamingAdapt$mC4NetFilenameAdapt$pi8$x$b$b($.mkNetFilenameAdapt(this.Filename), S("Filename"), S("")));
    pComp.Value$StdNamingDefaultAdapt$StdIntPackAdapt$i32$i32$2($.mkNamingAdapt$mStdIntPackAdapt$i32$pi8$i32$b$b$2($.mkIntPackAdapt$ri32(P(this, "iAtClient")), S("AtClient"), -1));
    pComp.Value$StdNamingDefaultAdapt$StdIntPackAdapt$i32$i32$2($.mkNamingAdapt$mStdIntPackAdapt$i32$pi8$i32$b$b$2($.mkIntPackAdapt$ri32(P(this, "idInfo")), S("InfoID"), -1));
    pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "fByRes"), S("ByRes"), false));
    if (this.fByRes) {
      pComp.Value$StdNamingAdapt$C4Network2ResCore($.mkNamingAdapt$rC4Network2ResCore$pi8(this.ResCore, S("ResCore")));
    } else {
      pComp.Value$StdNamingAdapt$StdBuf($.mkNamingAdapt$rStdBuf$pi8(this.PlrData, S("PlrData")));
    }
    C4ControlPacket.prototype.CompileFunc$pStdCompiler.call(this, pComp);
  }

  PreExecute() {
    if (!this.fByRes) {
      return true;
    }
    if (!($.Game.Clients.getClientByID(this.iAtClient) != null)) {
      return true;
    }
    if (!$.Control$2.isNetwork()) {
      return true;
    }
    let pRes = $.Network.ResList.getRefRes$i32(this.ResCore.getID());
    if (pRes.op_not()) {
      pRes.$assign($.Network.ResList.AddByCore(this.ResCore, true));
    }
    if (pRes.op_not()) {
      return true;
    }
    return !pRes.op_arrow().isLoading();
  }

  PreRec$pC4Record(pRecord) {
    if (pRecord == null) {
      return;
    }
    if (this.fByRes) {
      let pRes = $.Network.ResList.getRefRes$i32(this.ResCore.getID());
      if (pRes.op_not() || pRes.op_arrow().isRemoved()) {
        return;
      }
      let szTemp = new $.StdStrBuf();
      szTemp.Copy$pi8(pRes.op_arrow().getFile());
      $.MakeTempFilename$pStdStrBuf(szTemp);
      if ($.C4Group_CopyItem(pRes.op_arrow().getFile(), szTemp.getData())) {
        let szTarget = $.FormatString(S("%d-%s"), this.ResCore.getID(), $.GetFilename(this.ResCore.getFileName()));
        pRecord.AddFile(szTemp.getData(), szTarget.getData(), true);
      }
    } else {
    }
  }

  Strip() {
    if (this.fByRes) {
      return;
    }
    let PlayerFilename = new $.StdStrBuf();
    $.StdStrBuf.prototype.op_assign$pi8.call(PlayerFilename, $.GetFilename(this.Filename.getData()));
    $.StdStrBuf.prototype.op_assign$pi8.call(PlayerFilename, $.Config.AtTempPath(PlayerFilename.getData()));
    if ($.StdBuf.prototype.SaveToFile.call(this.PlrData, PlayerFilename.getData())) {
      let Grp = new $.C4Group().init();
      if (!Grp.Open(PlayerFilename.getData())) {
        $.EraseFile(PlayerFilename.getData());
        return;
      }
      const iBigIconSize = [0];
      if (Grp.FindEntry$pi8$pStdStrBuf$pu64(S("BigIcon.png"), null, P(iBigIconSize, 0))) {
        if (iBigIconSize[0] > 20480) {
          Grp.Delete(S("BigIcon.png"));
        }
      }
      Grp.Close$v();
      let NewPlrData = new $.StdBuf();
      if (!$.StdBuf.prototype.LoadFromFile.call(NewPlrData, PlayerFilename.getData())) {
        $.EraseFile(PlayerFilename.getData());
        return;
      }
      this.PlrData.op_assign$mStdBuf(NewPlrData);
      $.EraseFile(PlayerFilename.getData());
    }
  }

  $clone() { return new C4ControlJoinPlayer().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.Filename.$assign(o.Filename);
    this.iAtClient = o.iAtClient;
    this.idInfo = o.idInfo;
    this.fByRes = o.fByRes;
    this.PlrData.$assign(o.PlrData);
    this.ResCore.$assign(o.ResCore);
    return this;
  }
}

export class C4ControlEMMoveObject extends C4ControlPacket {
  eAction = 0 /*EMMO_Move*/;
  tx = new $.C4Fixed();
  ty = new $.C4Fixed();
  iTargetObj = 0;
  iObjectNum = 0;
  pObjects = null;
  StringParam = new $.StdStrBuf();
  drag_finished = false;

  init$v() {
    super.init();
    this.eAction = 0 /*EMMO_Move*/;
    this.tx = $.Fix0$C4Real.$clone();
    this.ty = $.Fix0$C4Real.$clone();
    this.iTargetObj = 0;
    this.iObjectNum = 0;
    this.pObjects = null;
    this.StringParam = new $.StdStrBuf();
    this.drag_finished = false;
    return this;
  }

  init$i32$C4Fixed$C4Fixed$pC4Object$i32$pi32$pi8$b(eAction, tx, ty, pTargetObj, iObjectNum = 0, pObjects = null, szScript = null, drag_finished = false) {
    super.init();
    this.eAction = eAction;
    this.tx = tx.$clone();
    this.ty = ty.$clone();
    this.iTargetObj = pTargetObj != null ? pTargetObj.Number : 0;
    this.iObjectNum = iObjectNum;
    this.pObjects = pObjects;
    this.StringParam = new $.StdStrBuf().init$pi8$b(szScript, true);
    this.drag_finished = drag_finished;
    return this;
  }

  static CreateObject(id, x, y, container) {
    let ctl = new C4ControlEMMoveObject().init$i32$C4Fixed$C4Fixed$pC4Object$i32$pi32$pi8$b(7 /*EMMO_Create*/, x.$clone(), y.$clone(), container);
    $.StdStrBuf.prototype.op_assign$pi8.call(ctl.StringParam, id.ToString());
    return ctl;
  }

  $dtor() {
    $delete(this.pObjects);
    this.pObjects = null;
  }

  MoveObject(moved_object, move_forced) {
    if (moved_object == null || moved_object.Status === 0) {
      return;
    }
    let old_x = moved_object.GetX();
    let old_y = moved_object.GetY();
    let tx = this.tx.$clone();
    if (moved_object.Def.NoHorizontalMove !== 0 && !move_forced) {
      tx.$assign($.Fix0$C4Real);
    }
    moved_object.ForcePosition(moved_object.fix_x.op_add$C4Fixed(tx), moved_object.fix_y.op_add$C4Fixed(this.ty));
    moved_object.xdir.$assign(moved_object.ydir.op_assign(0));
    moved_object.Mobile = false;
    let pars = new $.C4AulParSet().init$mC4Value$mC4Value$mC4Value($.C4VInt(old_x), $.C4VInt(old_y), $.C4VBool(this.drag_finished));
    if (moved_object.Call$pi8$pC4AulParSet$b(S("~EditCursorMoved"), pars.op_and()).op_const_void_() != null) {
      $.Console.EditCursor.InvalidateSelection();
    }
  }

  Execute() {
    let fLocalCall = this.LocalControl();
    switch (this.eAction) {
      case 0:
      case 1:
        {
          if (this.pObjects == null) {
            break;
          }
          let pObj = null;
          for (let i = 0; i < this.iObjectNum; i = i + 1 | 0) {
            if ((pObj = $.Objects.SafeObjectPointer(this.pObjects.a[this.pObjects.o + i])) != null) {
              if (pObj.Status !== 0) {
                this.MoveObject(pObj, this.eAction === 1);
                while (pObj.GetProcedure() === 246) {
                  pObj = pObj.Action.Target.op_C4Object_();
                  if (pObj == null) {
                    break;
                  }
                  for (let j = 0; j < this.iObjectNum; j = j + 1 | 0) {
                    if (this.pObjects.a[this.pObjects.o + j] === pObj.Number) {
                      pObj = null;
                      break;
                    }
                  }
                  if (pObj == null) {
                    break;
                  }
                  this.MoveObject(pObj, this.eAction === 1);
                }
              }
            }
          }
        }
        break;
      case 2:
        {
          if (this.pObjects == null) {
            break;
          }
          let pObj = null;
          let pTarget = $.Objects.SafeObjectPointer(this.iTargetObj);
          if (pTarget != null) {
            for (let i = 0; i < this.iObjectNum; i = i + 1 | 0) {
              if ((pObj = $.Objects.SafeObjectPointer(this.pObjects.a[this.pObjects.o + i])) != null) {
                pObj.Enter(pTarget);
                if (pTarget.Status === 0) {
                  break;
                }
                let pars = new $.C4AulParSet().init$mC4Value($.C4VObj(pObj));
                if (pObj != null && pObj.Status !== 0 && pTarget.Status !== 0) {
                  pTarget.Call$i32$pC4AulParSet$b(226 /*P_EditorCollection*/, pars.op_and());
                }
                if (pTarget.Status === 0) {
                  break;
                }
              }
            }
          }
        }
        break;
      case 3:
        {
          if (this.pObjects == null) {
            break;
          }
          $.Console.EditCursor.PerformDuplication(this.pObjects, this.iObjectNum, fLocalCall);
        }
        break;
      case 4:
        {
          if (this.pObjects == null) {
            return;
          }
          let ScriptCtrl = new C4ControlScript().init$pi8$i32$b$b(this.StringParam.getData(), -1);
          ScriptCtrl.SetByClient(this.iByClient);
          for (let i = 0; i < this.iObjectNum; i = i + 1 | 0) {
            ScriptCtrl.SetTargetObj(this.pObjects.a[this.pObjects.o + i]);
            ScriptCtrl.Execute();
          }
        }
        break;
      case 5:
        {
          if (this.pObjects == null) {
            return;
          }
          let pObj = null;
          for (let i = 0; i < this.iObjectNum; i = i + 1 | 0) {
            if ((pObj = $.Objects.SafeObjectPointer(this.pObjects.a[this.pObjects.o + i])) != null) {
              pObj.AssignRemoval();
            }
          }
        }
        break;
      case 6:
        {
          if (this.pObjects == null) {
            return;
          }
          let pObj = null;
          for (let i = 0; i < this.iObjectNum; i = i + 1 | 0) {
            if ((pObj = $.Objects.SafeObjectPointer(this.pObjects.a[this.pObjects.o + i])) != null) {
              pObj.Exit(pObj.GetX(), pObj.GetY(), pObj.GetR());
            }
          }
        }
        break;
      case 7:
        {
          let iddef = new $.C4ID().init$StdStrBuf(this.StringParam);
          let def = $.C4Id2Def(iddef.$clone());
          if (def == null) {
            return;
          }
          let placement_limit = def.GetPropertyInt(225 /*P_EditorPlacementLimit*/);
          if (placement_limit !== 0) {
            if ($.Game.ObjectCount(iddef.$clone()) >= placement_limit) {
              $.Console.Message($.FormatString($.LoadResStr(S("IDS_CNS_CREATORTOOMANYINSTANCES")), placement_limit).getData());
              return;
            }
          }
          let container = null;
          if (this.iTargetObj !== 0) {
            container = $.Objects.SafeObjectPointer(this.iTargetObj);
            if (container == null || container.Status === 0) {
              return;
            }
          }
          let create_centered = false;
          let obj = $.Game.CreateObject$C4ID$pC4Object$i32$i32$i32$i32$b$C4Fixed$C4Fixed$C4Fixed$i32(iddef.$clone(), null, -1, $.fixtoi$C4Fixed(this.tx), $.fixtoi$C4Fixed(this.ty), 0, create_centered);
          if (container != null && obj != null && container.Status !== 0 && obj.Status !== 0) {
            obj.Enter(container);
            let pars = new $.C4AulParSet().init$mC4Value($.C4VObj(obj));
            if (obj != null && obj.Status !== 0) {
              container.Call$i32$pC4AulParSet$b(226 /*P_EditorCollection*/, pars.op_and());
            }
          }
          if (obj != null && obj.Status !== 0) {
            obj.Call$i32$pC4AulParSet$b(224 /*P_EditorInitialize*/);
          }
        }
        break;
      case 8:
        {
          let pTarget = $.Objects.SafeObjectPointer(this.iTargetObj);
          if (pTarget != null) {
            let new_rot = $.fixtoi$C4Fixed$i32(this.tx, 1);
            let new_con = $.fixtoi$C4Fixed$i32(this.ty, 1000);
            if (pTarget.Def.Rotateable !== 0) {
              pTarget.SetRotation(new_rot);
            }
            if (pTarget.Def.GrowthType !== 0) {
              pTarget.DoCon(new_con - pTarget.GetCon() | 0, false);
            }
          }
        }
    }
    if (fLocalCall && this.eAction !== 0 && this.eAction !== 1) {
      $.Console.EditCursor.OnSelectionChanged();
    }
  }

  CompileFunc$pStdCompiler(pComp) {
    pComp.Value$StdNamingAdapt$StdIntAdapt$i32$u8$2($.mkNamingAdapt$mStdIntAdapt$i32$u8$pi8$2($.mkIntAdaptT$11(P(this, "eAction")), S("Action")));
    pComp.Value$StdNamingDefaultAdapt$C4Fixed$i32($.mkNamingAdapt$rC4Fixed$pi8$i32$b$b(this.tx, S("tx"), 0));
    pComp.Value$StdNamingDefaultAdapt$C4Fixed$i32($.mkNamingAdapt$rC4Fixed$pi8$i32$b$b(this.ty, S("ty"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "iTargetObj"), S("TargetObj"), -1));
    pComp.Value$StdNamingDefaultAdapt$StdIntPackAdapt$i32$i32$2($.mkNamingAdapt$mStdIntPackAdapt$i32$pi8$i32$b$b$2($.mkIntPackAdapt$ri32(P(this, "iObjectNum")), S("ObjectNum"), 0));
    if (pComp.isDeserializer()) {
      $delete(this.pObjects);
      this.pObjects = P(new Int32Array($u64n(this.iObjectNum)), 0);
    }
    pComp.Value$StdNamingDefaultAdapt$StdArrayAdapt$i32$_IdFuncClass$i32$i32($.mkNamingAdapt$mStdArrayAdapt$i32$_IdFuncClass$i32$pi8$i32$b$b($.mkArrayAdapt$pi32$i32(this.pObjects, this.iObjectNum), S("Objs"), -1));
    if (this.eAction === 4) {
      pComp.Value$StdNamingDefaultAdapt$StdStrBuf$x$2($.mkNamingAdapt$rStdStrBuf$pi8$x$b$b$2(this.StringParam, S("Script"), S("")));
    } else if (this.eAction === 7) {
      pComp.Value$StdNamingDefaultAdapt$StdStrBuf$x$2($.mkNamingAdapt$rStdStrBuf$pi8$x$b$b$2(this.StringParam, S("ID"), S("")));
    }
    C4ControlPacket.prototype.CompileFunc$pStdCompiler.call(this, pComp);
  }

  $clone() { return new C4ControlEMMoveObject().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.eAction = o.eAction;
    this.tx.$assign(o.tx);
    this.ty.$assign(o.ty);
    this.iTargetObj = o.iTargetObj;
    this.iObjectNum = o.iObjectNum;
    this.pObjects = o.pObjects;
    this.StringParam.$assign(o.StringParam);
    this.drag_finished = o.drag_finished;
    return this;
  }
}

export class C4ControlEMDrawTool extends C4ControlPacket {
  eAction = 0 /*EMDT_SetMode*/;
  iMode = 0;
  iX = 0;
  iY = 0;
  iX2 = 0;
  iY2 = 0;
  iGrade = 0;
  Material = new $.StdStrBuf();
  Texture = new $.StdStrBuf();
  BackMaterial = new $.StdStrBuf();
  BackTexture = new $.StdStrBuf();

  init$v() {
    super.init();
    this.eAction = 0 /*EMDT_SetMode*/;
    this.iX = 0;
    this.iY = 0;
    this.iX2 = 0;
    this.iY2 = 0;
    this.iGrade = 0;
    this.Material = new $.StdStrBuf();
    this.Texture = new $.StdStrBuf();
    this.BackMaterial = new $.StdStrBuf();
    this.BackTexture = new $.StdStrBuf();
    return this;
  }

  init$i32$i32$i32$i32$i32$i32$i32$pi8$pi8$pi8$pi8(eAction, iMode, iX = -1, iY = -1, iX2 = -1, iY2 = -1, iGrade = -1, szMaterial = null, szTexture = null, szBackMaterial = null, szBackTexture = null) {
    super.init();
    this.eAction = eAction;
    this.iMode = iMode;
    this.iX = iX;
    this.iY = iY;
    this.iX2 = iX2;
    this.iY2 = iY2;
    this.iGrade = iGrade;
    this.Material = new $.StdStrBuf().init$pi8$b(szMaterial, true);
    this.Texture = new $.StdStrBuf().init$pi8$b(szTexture, true);
    this.BackMaterial = new $.StdStrBuf().init$pi8$b(szBackMaterial, true);
    this.BackTexture = new $.StdStrBuf().init$pi8$b(szBackTexture, true);
    return this;
  }

  Execute() {
    if (this.eAction === 0) {
      $.Console.ToolsDlg.SetLandscapeMode(this.iMode, this.iX === 1, true);
      return;
    }
    0;
    if ($.Landscape.GetMode() !== this.iMode) {
      return;
    }
    if (!(this.Material.getSize() !== 0)) {
      return;
    }
    let szMaterial = this.Material.getData();
    let szTexture = this.Texture.getData();
    let szBackMaterial = this.BackMaterial.getData();
    let szBackTexture = this.BackTexture.getData();
    switch (this.eAction) {
      case 1:
        if (!(this.Texture.getSize() !== 0)) {
          break;
        }
        $.Landscape.DrawBrush(this.iX, this.iY, this.iGrade, szMaterial, szTexture, szBackMaterial, szBackTexture);
        break;
      case 3:
        if (!(this.Texture.getSize() !== 0)) {
          break;
        }
        $.Landscape.DrawLine(this.iX, this.iY, this.iX2, this.iY2, this.iGrade, szMaterial, szTexture, szBackMaterial, szBackTexture);
        break;
      case 4:
        if (!(this.Texture.getSize() !== 0)) {
          break;
        }
        $.Landscape.DrawBox(this.iX, this.iY, this.iX2, this.iY2, this.iGrade, szMaterial, szTexture, szBackMaterial, szBackTexture);
        break;
      case 2:
        {
          let iMat = $.MaterialMap.Get(szMaterial);
          if (!$.MatValid(iMat)) {
            return;
          }
          for (let cnt = 0; cnt < this.iGrade; cnt = cnt + 1 | 0) {
            const itX = [((this.iX >>> 0) + Random(this.iGrade >>> 0) >>> 0) - ((this.iGrade / 2 | 0) >>> 0) >>> 0 | 0];
            const itY = [((this.iY >>> 0) + Random(this.iGrade >>> 0) >>> 0) - ((this.iGrade / 2 | 0) >>> 0) >>> 0 | 0];
            $.Landscape.InsertMaterial(iMat, P(itX, 0), P(itY, 0));
          }
        }
        break;
      default:
        break;
    }
  }

  CompileFunc$pStdCompiler(pComp) {
    pComp.Value$StdNamingAdapt$StdIntAdapt$i32$u8($.mkNamingAdapt$mStdIntAdapt$i32$u8$pi8($.mkIntAdaptT$9(P(this, "eAction")), S("Action")));
    pComp.Value$StdNamingDefaultAdapt$StdIntAdapt$i32$u8$i32$2($.mkNamingAdapt$mStdIntAdapt$i32$u8$pi8$i32$b$b$2($.mkIntAdaptT$3(P(this, "iMode")), S("Mode"), 0 /*Undefined*/));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "iX"), S("X"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "iY"), S("Y"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "iX2"), S("X2"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "iY2"), S("Y2"), 0));
    pComp.Value$StdNamingDefaultAdapt$StdIntPackAdapt$i32$i32$2($.mkNamingAdapt$mStdIntPackAdapt$i32$pi8$i32$b$b$2($.mkIntPackAdapt$ri32(P(this, "iGrade")), S("Grade"), 0));
    pComp.Value$StdNamingDefaultAdapt$StdStrBuf$x$2($.mkNamingAdapt$rStdStrBuf$pi8$x$b$b$2(this.Material, S("Material"), S("")));
    pComp.Value$StdNamingDefaultAdapt$StdStrBuf$x$2($.mkNamingAdapt$rStdStrBuf$pi8$x$b$b$2(this.Texture, S("Texture"), S("")));
    pComp.Value$StdNamingDefaultAdapt$StdStrBuf$x$2($.mkNamingAdapt$rStdStrBuf$pi8$x$b$b$2(this.BackMaterial, S("BackMaterial"), S("")));
    pComp.Value$StdNamingDefaultAdapt$StdStrBuf$x$2($.mkNamingAdapt$rStdStrBuf$pi8$x$b$b$2(this.BackTexture, S("BackTexture"), S("")));
    C4ControlPacket.prototype.CompileFunc$pStdCompiler.call(this, pComp);
  }

  $clone() { return new C4ControlEMDrawTool().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.eAction = o.eAction;
    this.iMode = o.iMode;
    this.iX = o.iX;
    this.iY = o.iY;
    this.iX2 = o.iX2;
    this.iY2 = o.iY2;
    this.iGrade = o.iGrade;
    this.Material.$assign(o.Material);
    this.Texture.$assign(o.Texture);
    this.BackMaterial.$assign(o.BackMaterial);
    this.BackTexture.$assign(o.BackTexture);
    return this;
  }
}

export class C4ControlMessage extends C4ControlPacket {
  eType = 0 /*C4CMT_Normal*/;
  iPlayer = -1;
  iToPlayer = 0;
  Message = new $.StdStrBuf();

  init$v() {
    super.init();
    this.eType = 0 /*C4CMT_Normal*/;
    this.iPlayer = -1;
    this.Message = new $.StdStrBuf();
    return this;
  }

  init$i32$pi8$i32$i32(eType, szMessage, iPlayer = -1, iToPlayer = -1) {
    super.init();
    this.eType = eType;
    this.iPlayer = iPlayer;
    this.iToPlayer = iToPlayer;
    this.Message = new $.StdStrBuf().init$pi8$b(szMessage, true);
    return this;
  }

  Sync() {
    return false;
  }

  Lobby() {
    return true;
  }

  Execute() {
    let szMessage = this.Message.getData();
    let pPlr = this.iPlayer < 0 ? null : $.Players.Get(this.iPlayer);
    if (pPlr != null && pPlr.AtClient !== this.iByClient) {
      return;
    }
    let pLobby = $.Network.GetLobby();
    let str = new $.StdStrBuf();
    switch (this.eType) {
      case 0:
      case 1:
        if (pPlr != null) {
          if (pPlr.AtClient !== this.iByClient) {
            break;
          }
          str.Format(this.eType === 0 ? S("<c %x><<i></i>%s> %s</c>") : S("<c %x> * %s %s</c>"), pPlr.ColorDw, pPlr.GetName(), szMessage);
        } else {
          let pClient = $.Game.Clients.getClientByID(this.iByClient);
          str.Format(this.eType === 0 ? S("<%s> %s") : S(" * %s %s"), pClient != null ? pClient.getNick() : S("???"), szMessage);
        }
        if (pLobby != null) {
          pLobby.OnMessage($.Game.Clients.getClientByID(this.iByClient), str.getData());
        }
        $.Log(str.getData());
        break;
      case 2:
        if (pPlr != null && pPlr.Cursor.op_C4Object_() != null) {
          if ($.Game.C4S.Head.Film === 2) {
            let sMessage = new $.StdStrBuf();
            sMessage.Format(S("<%s> %s"), pPlr.Cursor.op_arrow().GetName(), szMessage);
            let dwClr = pPlr.Cursor.op_arrow().Color;
            if (dwClr === 0) {
              dwClr = 255;
            }
            $.GameMsgObjectDw(sMessage.getData(), pPlr.Cursor.op_C4Object_(), (dwClr | 0xff000000) >>> 0);
          } else {
            $.GameMsgObjectDw(szMessage, pPlr.Cursor.op_C4Object_(), (pPlr.ColorDw | 0xff000000) >>> 0);
          }
        }
        break;
      case 3:
        {
          if (pPlr != null) {
            let pLocalPlr = null;
            for (let cnt = 0; (pLocalPlr = $.Players.GetLocalByIndex(cnt)) != null; cnt = cnt + 1 | 0) {
              if (!($.Hostile(pLocalPlr.Number, this.iPlayer) !== 0)) {
                break;
              }
            }
            if (pLocalPlr != null) {
              $.Log($.FormatString(S("<c %x>{%s} %s</c>"), pPlr.ColorDw, pPlr.GetName(), szMessage).getData());
            }
          } else if (pLobby != null) {
            if (!$.Game.PlayerInfos.HasSameTeamPlayers(this.iByClient, $.Game.Clients.getLocalID())) {
              break;
            }
            let pClient = $.Game.Clients.getClientByID(this.iByClient);
            pLobby.OnMessage($.Game.Clients.getClientByID(this.iByClient), $.FormatString(S("{%s} %s"), pClient != null ? pClient.getNick() : S("???"), szMessage).getData());
          }
        }
        break;
      case 4:
        {
          if (pPlr == null) {
            break;
          }
          let pLocalPlr = null;
          for (let cnt = 0; (pLocalPlr = $.Players.GetLocalByIndex(cnt)) != null; cnt = cnt + 1 | 0) {
            if (pLocalPlr.ID === this.iToPlayer) {
              break;
            }
          }
          if (pLocalPlr != null) {
            $.Log($.FormatString(S("<c %x>[%s] %s</c>"), pPlr.ColorDw, pPlr.GetName(), szMessage).getData());
          }
        }
        break;
      case 5:
        {
          let singer = $.Game.Clients.getClientByID(this.iByClient);
          if (singer == null || !singer.IsIgnored()) {
            if (!($.StartSoundEffect(szMessage, false, 100, null) != null)) {
              break;
            }
          }
          if (pLobby != null) {
            pLobby.OnClientSound(singer);
          }
          if ($.C4Network2ClientListDlg.GetInstance() != null) {
            $.C4Network2ClientListDlg.GetInstance().OnSound(singer);
          }
          break;
        }
      case 6:
        $.Application.NotifyUserIfInactive();
        break;
      case 10:
        if (!this.HostControl()) {
          break;
        }
        $.LogF(S("Network: %s"), szMessage);
        break;
    }
  }

  CompileFunc$pStdCompiler(pComp) {
    pComp.Value$StdNamingDefaultAdapt$StdIntAdapt$i32$u8$i32$4($.mkNamingAdapt$mStdIntAdapt$i32$u8$pi8$i32$b$b$4($.mkIntAdaptT$7(P(this, "eType")), S("Type"), 0 /*C4CMT_Normal*/));
    pComp.Value$StdNamingDefaultAdapt$StdIntPackAdapt$i32$i32$2($.mkNamingAdapt$mStdIntPackAdapt$i32$pi8$i32$b$b$2($.mkIntPackAdapt$ri32(P(this, "iPlayer")), S("Player"), -1));
    if (this.eType === 4) {
      pComp.Value$StdNamingDefaultAdapt$StdIntPackAdapt$i32$i32$2($.mkNamingAdapt$mStdIntPackAdapt$i32$pi8$i32$b$b$2($.mkIntPackAdapt$ri32(P(this, "iToPlayer")), S("ToPlayer"), -1));
    }
    pComp.Value$StdNamingDefaultAdapt$StdStrBuf$x$2($.mkNamingAdapt$rStdStrBuf$pi8$x$b$b$2(this.Message, S("Message"), S("")));
    C4ControlPacket.prototype.CompileFunc$pStdCompiler.call(this, pComp);
  }

  $clone() { return new C4ControlMessage().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.eType = o.eType;
    this.iPlayer = o.iPlayer;
    this.iToPlayer = o.iToPlayer;
    this.Message.$assign(o.Message);
    return this;
  }
}

export class C4ControlRemovePlr extends C4ControlPacket {
  iPlr = -1;
  fDisconnected = false;

  init$v() {
    super.init();
    this.iPlr = -1;
    this.fDisconnected = false;
    return this;
  }

  init$i32$b(iPlr, fDisconnected) {
    super.init();
    this.iPlr = iPlr;
    this.fDisconnected = fDisconnected;
    return this;
  }

  Execute() {
    if (this.iByClient !== 0) {
      return;
    }
    $.Players.Remove$i32$b$b(this.iPlr, this.fDisconnected, false);
  }

  CompileFunc$pStdCompiler(pComp) {
    pComp.Value$StdNamingDefaultAdapt$StdIntPackAdapt$i32$i32$2($.mkNamingAdapt$mStdIntPackAdapt$i32$pi8$i32$b$b$2($.mkIntPackAdapt$ri32(P(this, "iPlr")), S("Plr"), -1));
    pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "fDisconnected"), S("Disconnected"), false));
    C4ControlPacket.prototype.CompileFunc$pStdCompiler.call(this, pComp);
  }

  $clone() { return new C4ControlRemovePlr().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.iPlr = o.iPlr;
    this.fDisconnected = o.fDisconnected;
    return this;
  }
}

export class C4ControlDebugRec extends C4ControlPacket {
  Data = new $.StdBuf();

  init$v() {
    super.init();
    this.Data = new $.StdBuf();
    return this;
  }

  init$rStdBuf(Data) {
    super.init();
    this.Data = new $.StdBuf().init$rStdBuf$b(Data);
    return this;
  }

  Execute() {
  }

  CompileFunc$pStdCompiler(pComp) {
    pComp.Value$rStdBuf(this.Data);
  }

  $clone() { return new C4ControlDebugRec().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.Data.$assign(o.Data);
    return this;
  }
}

export class C4ControlVote extends C4ControlPacket {
  eType = 0;
  fApprove = false;
  iData = 0;

  init(eType = -1 /*VT_None*/, fApprove = true, iData = 0) {
    super.init();
    this.eType = eType;
    this.fApprove = fApprove;
    this.iData = iData;
    return this;
  }

  getType() {
    return this.eType;
  }

  isApprove() {
    return this.fApprove;
  }

  getData() {
    return this.iData;
  }

  getDesc() {
    let Action = new $.StdStrBuf();
    switch (this.eType) {
      case 0:
        $.StdStrBuf.prototype.op_assign$pi8.call(Action, $.LoadResStr(S("IDS_VOTE_CANCELTHEROUND")));
        break;
      case 1:
        if (this.iData === this.iByClient) {
          $.StdStrBuf.prototype.op_assign$pi8.call(Action, $.LoadResStr(S("IDS_VOTE_LEAVETHEGAME")));
        } else {
          let pTargetClient = $.Game.Clients.getClientByID(this.iData);
          Action.Format($.LoadResStr(S("IDS_VOTE_KICKCLIENT")), pTargetClient != null ? pTargetClient.getName() : S("???"));
        }
        break;
      case 2:
        if (this.iData !== 0) {
          $.StdStrBuf.prototype.op_assign$pi8.call(Action, $.LoadResStr(S("IDS_TEXT_PAUSETHEGAME")));
        } else {
          $.StdStrBuf.prototype.op_assign$pi8.call(Action, $.LoadResStr(S("IDS_TEXT_UNPAUSETHEGAME")));
        }
        break;
      default:
        $.StdStrBuf.prototype.op_assign$pi8.call(Action, S("perform some mysterious action"));
        break;
    }
    return Action;
  }

  getDescWarning() {
    let Warning = new $.StdStrBuf();
    switch (this.eType) {
      case 0:
        $.StdStrBuf.prototype.op_assign$pi8.call(Warning, $.LoadResStr(S("IDS_TEXT_WARNINGIFTHEGAMEISCANCELL")));
        break;
      case 1:
        $.StdStrBuf.prototype.op_assign$pi8.call(Warning, $.LoadResStr(S("IDS_TEXT_WARNINGNOLEAGUEPOINTSWILL")));
        break;
      default:
        $.StdStrBuf.prototype.op_assign$pi8.call(Warning, S(""));
        break;
    }
    return Warning;
  }

  Sync() {
    return false;
  }

  Execute() {
    let pClient = $.Game.Clients.getClientByID(this.iByClient);
    if (this.fApprove) {
      $.LogF($.LoadResStr(S("IDS_VOTE_WANTSTO")), pClient.getName(), this.getDesc().getData());
    } else {
      $.LogF($.LoadResStr(S("IDS_VOTE_DOESNOTWANTTO")), pClient.getName(), this.getDesc().getData());
    }
    if ($.Network.isEnabled()) {
      $.Network.AddVote(this);
    }
    if ($.Control$2.isCtrlHost()) {
      let iPositive = 0;
      let iNegative = 0;
      let iVotes = 0;
      for (let i = 0; i < $max($.Game.Teams.GetTeamCount(), 1); i = i + 1 | 0) {
        let pTeam = $.Game.Teams.GetTeamByIndex(i);
        let iPositiveTeam = 0;
        let iNegativeTeam = 0;
        let iVotesTeam = 0;
        for (let j = 0; j < (pTeam != null ? pTeam.GetPlayerCount() : $.Game.PlayerInfos.GetPlayerCount()); j = j + 1 | 0) {
          const iClientID = [-1];
          let pNfo = null;
          if (pTeam == null) {
            pNfo = $.Game.PlayerInfos.GetPlayerInfoByIndex(j);
            if (pNfo == null) {
              continue;
            }
            iClientID[0] = $.Game.PlayerInfos.GetClientInfoByPlayerID(pNfo.GetID()).GetClientID();
          } else {
            pNfo = $.Game.PlayerInfos.GetPlayerInfoByID$i32$pi32(pTeam.GetIndexedPlayer(j), P(iClientID, 0));
            if (pNfo == null) {
              continue;
            }
          }
          if (iClientID[0] < 0) {
            continue;
          }
          if (!($.Game.Clients.getClientByID(iClientID[0]) != null)) {
            continue;
          }
          if (!pNfo.IsJoined()) {
            continue;
          }
          iVotesTeam = iVotesTeam + 1 | 0;
          let pPkt = null;
          let pVote = null;
          if ((pPkt = $.Network.GetVote(iClientID[0], this.eType, this.iData)) != null) {
            if ((pVote = pPkt.getPkt()) != null) {
              if (pVote.isApprove()) {
                iPositiveTeam = iPositiveTeam + 1 | 0;
              } else {
                iNegativeTeam = iNegativeTeam + 1 | 0;
              }
            }
          }
        }
        if (iVotesTeam !== 0) {
          iVotes = iVotes + 1 | 0;
          if (Math.imul(iPositiveTeam, 2) > iVotesTeam) {
            iPositive = iPositive + 1 | 0;
          } else if (Math.imul(iNegativeTeam, 2) >= iVotesTeam) {
            iNegative = iNegative + 1 | 0;
          }
        }
      }
      if (Math.imul(iPositive, 2) > iVotes) {
        $.Control$2.DoInput(132 /*CID_VoteEnd*/, new C4ControlVoteEnd().init(this.eType, true, this.iData), 1 /*CDT_Sync*/);
      } else if (Math.imul(iNegative, 2) >= iVotes) {
        $.Control$2.DoInput(132 /*CID_VoteEnd*/, new C4ControlVoteEnd().init(this.eType, false, this.iData), 1 /*CDT_Sync*/);
      }
    }
  }

  CompileFunc$pStdCompiler(pComp) {
    pComp.Value$StdNamingDefaultAdapt$StdIntAdapt$i32$u8$i32$3($.mkNamingAdapt$mStdIntAdapt$i32$u8$pi8$i32$b$b$3($.mkIntAdaptT$5(P(this, "eType")), S("Type"), -1 /*VT_None*/));
    pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "fApprove"), S("Approve"), true));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "iData"), S("Data"), 0));
    C4ControlPacket.prototype.CompileFunc$pStdCompiler.call(this, pComp);
  }

  $clone() { return new C4ControlVote().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.eType = o.eType;
    this.fApprove = o.fApprove;
    this.iData = o.iData;
    return this;
  }
}

export class C4ControlReInitScenario extends C4ControlPacket {
  data = new $.StdBuf();

  init() {
    super.init();
    this.data = new $.StdBuf();
    let tmp_fn = $.Config.AtTempPath(S("ReinitSectionSave.ocs"));
    $.MakeTempFilename$pi8(tmp_fn);
    let grp = new $.C4Group().init();
    grp.Open(tmp_fn, true);
    let buf = new $.StdBuf();
    let success = true;
    const section_components = [
  S("Scenario.txt"),
  S("Objects.txt"),
  S("Objects.c"),
  S("Map.bmp"),
  S("MapFg.bmp"),
  S("MapBg.bmp"),
];
    for (const section_component of section_components) {
      if ($.Game.ScenarioFile.LoadEntry$pi8$pStdBuf(section_component, buf)) {
        if (!grp.Add$pi8$rStdBuf$b$b$b(section_component, buf, false, true)) {
          success = false;
        }
      }
      $.StdBuf.prototype.Clear.call(buf);
    }
    if (!grp.Save(false)) {
      success = false;
    }
    if (!success) {
      return this;
    }
    success = $.StdBuf.prototype.LoadFromFile.call(this.data, tmp_fn);
    $.EraseFile(tmp_fn);
    if (!success) {
      return this;
    }
    return this;
  }

  Execute() {
    if (!($.StdBuf.prototype.getSize.call(this.data) !== 0)) {
      return;
    }
    let tmp_fn = $.Config.AtTempPath(S("ReinitSection.ocs"));
    $.MakeTempFilename$pi8(tmp_fn);
    if (!$.StdBuf.prototype.SaveToFile.call(this.data, tmp_fn)) {
      return;
    }
    let reinit_section_name = S("EditorReloadSection");
    if (!$.Game.CreateSectionFromTempFile(reinit_section_name, tmp_fn)) {
      $.EraseFile(tmp_fn);
      return;
    }
    $.Game.LoadScenarioSection(reinit_section_name, 8);
  }

  CompileFunc$pStdCompiler(comp) {
    comp.Value$rStdBuf(this.data);
  }

  $clone() { return new C4ControlReInitScenario().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.data.$assign(o.data);
    return this;
  }
}

export class C4ControlEditGraph extends C4ControlPacket {
  path = new $.StdCopyStrBuf();
  action = 0 /*CEG_None*/;
  index = -1;
  x = 0;
  y = 0;

  init$v() {
    super.init();
    this.path = new $.StdCopyStrBuf();
    this.action = 0 /*CEG_None*/;
    this.index = -1;
    this.x = 0;
    this.y = 0;
    return this;
  }

  init$pi8$i32$i32$i32$i32(path, action, index, x, y) {
    super.init();
    this.path = new $.StdCopyStrBuf().init$pi8$b(path);
    this.action = action;
    this.index = index;
    this.x = x;
    this.y = y;
    return this;
  }

  Execute() {
    $.Console.EditGraphControl(this);
  }

  CompileFunc$pStdCompiler(comp) {
    comp.Value$StdNamingDefaultAdapt$StdCopyStrBuf$StdCopyStrBuf($.mkNamingAdapt$rStdCopyStrBuf$pi8$StdCopyStrBuf$b$b(this.path, S("Path"), new $.StdCopyStrBuf()));
    comp.Value$StdNamingDefaultAdapt$StdIntAdapt$i32$u8$i32$7($.mkNamingAdapt$mStdIntAdapt$i32$u8$pi8$i32$b$b$7($.mkIntAdaptT$14(P(this, "action")), S("Action"), 0 /*CEG_None*/));
    comp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "index"), S("Index"), -1));
    comp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "x"), S("x"), 0));
    comp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "y"), S("y"), 0));
    C4ControlPacket.prototype.CompileFunc$pStdCompiler.call(this, comp);
  }

  GetPath() {
    return this.path.getData();
  }

  GetAction() {
    return this.action;
  }

  GetIndex() {
    return this.index;
  }

  GetX() {
    return this.x;
  }

  GetY() {
    return this.y;
  }

  $clone() { return new C4ControlEditGraph().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.path.$assign(o.path);
    this.action = o.action;
    this.index = o.index;
    this.x = o.x;
    this.y = o.y;
    return this;
  }
}

export class C4ControlVoteEnd extends C4ControlVote {

  init(eType = -1 /*VT_None*/, fApprove = true, iData = 0) {
    super.init(eType, fApprove, iData);
    return this;
  }

  Sync() {
    return true;
  }

  Execute() {
    if (!this.HostControl()) {
      return;
    }
    if ($.Network.isEnabled()) {
      $.Network.EndVote(this.getType(), this.isApprove(), this.getData());
    }
    let sMsg = new $.StdStrBuf();
    if (this.isApprove()) {
      sMsg.Format($.LoadResStr(S("IDS_TEXT_ITWASDECIDEDTO")), this.getDesc().getData());
    } else {
      sMsg.Format($.LoadResStr(S("IDS_TEXT_ITWASDECIDEDNOTTO")), this.getDesc().getData());
    }
    $.Log(sMsg.getData());
    if (!this.isApprove()) {
      return;
    }
    let pInfos = null;
    let pInfo = null;
    let iClient = 0;
    let iInfo = 0;
    switch (this.getType()) {
      case 0:
        if (!$.Game.GameOver) {
          for (iClient = 0; (pInfos = $.Game.PlayerInfos.GetIndexedInfo(iClient)) != null; iClient = iClient + 1 | 0) {
            for (iInfo = 0; (pInfo = pInfos.GetPlayerInfo$i32(iInfo)) != null; iInfo = iInfo + 1 | 0) {
              if (!pInfo.IsRemoved()) {
                pInfo.SetVotedOut();
              }
            }
          }
        }
        $.Game.Abort(true);
        break;
      case 1:
        pInfos = $.Game.PlayerInfos.GetInfoByClientID(this.getData());
        if (!$.Game.GameOver) {
          if (pInfos != null) {
            for (iInfo = 0; (pInfo = pInfos.GetPlayerInfo$i32(iInfo)) != null; iInfo = iInfo + 1 | 0) {
              if (!pInfo.IsRemoved()) {
                pInfo.SetVotedOut();
              }
            }
          }
        }
        if ($.Control$2.isCtrlHost()) {
          let pClient = $.Game.Clients.getClientByID(this.getData());
          if (pClient != null) {
            $.Game.Clients.CtrlRemove(pClient, $.LoadResStr(S("IDS_VOTE_VOTEDOUT")));
          }
        }
        if (this.getData() === $.Game.Clients.getLocalID()) {
          $.Game.RoundResults.EvaluateNetwork(3 /*NR_NetError*/, $.FormatString($.LoadResStr(S("IDS_ERR_YOUHAVEBEENREMOVEDBYVOTIN")), sMsg.getData()).getData());
          $.Network.Clear$v();
          $.Game.DoGameOver();
        }
        break;
      default:
        break;
    }
  }

  CompileFunc$pStdCompiler(pComp) {
    C4ControlVote.prototype.CompileFunc$pStdCompiler.call(this, pComp);
  }

  $clone() { return new C4ControlVoteEnd().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export function $init(): void {
  C4ControlClientUpdate.MinReadyAnnouncementDelay = 1;
}

Object.assign($, { C4Control, C4ControlClientJoin, C4ControlClientRemove, C4ControlClientUpdate, C4ControlDebugRec, C4ControlEMDrawTool, C4ControlEMMoveObject, C4ControlEditGraph, C4ControlJoinPlayer, C4ControlMenuCommand, C4ControlMessage, C4ControlMsgBoardCmd, C4ControlMsgBoardReply, C4ControlPacket, C4ControlPlayerAction, C4ControlPlayerControl, C4ControlPlayerControl$ControlItem, C4ControlPlayerInfo, C4ControlPlayerMouse, C4ControlPlayerSelect, C4ControlReInitScenario, C4ControlRemovePlr, C4ControlScript, C4ControlSet, C4ControlSyncCheck, C4ControlSynchronize, C4ControlVote, C4ControlVoteEnd });
