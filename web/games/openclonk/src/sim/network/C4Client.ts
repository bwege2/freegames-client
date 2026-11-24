// @ts-nocheck
// OpenClonk 36de799: src/network/C4Client.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $u64n } from '../../rt/int.ts';
import { c$strchr, c$strlen, c$strncmp, c$time } from '../../rt/libc.ts';
import { $padd, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete, StdString } from '../../rt/std.ts';
import { C4PacketBase } from './C4PacketBase.ts';

export class C4Client {
  Core = new C4ClientCore().init();
  fLocal = false;
  pNetClient = null;
  last_lobby_ready_change = 0;
  fIsIgnored = false;
  pNext = null;

  init$v() {
    this.Core = new C4ClientCore().init();
    this.fLocal = false;
    this.pNetClient = null;
    this.last_lobby_ready_change = 0;
    this.fIsIgnored = false;
    return this;
  }

  init$C4ClientCore(Core) {
    this.Core = Core.$clone();
    this.fLocal = false;
    this.pNetClient = null;
    this.last_lobby_ready_change = 0;
    this.fIsIgnored = false;
    this.pNext = null;
    return this;
  }

  $dtor() {
    0;
  }

  getCore() {
    return this.Core;
  }

  getID() {
    return this.Core.getID();
  }

  isHost() {
    return this.Core.isHost();
  }

  getName() {
    return this.Core.getName();
  }

  getCUID() {
    return this.Core.getCUID();
  }

  getNick() {
    return this.Core.getNick();
  }

  isActivated() {
    return this.Core.isActivated();
  }

  isObserver() {
    return this.Core.isObserver();
  }

  isLobbyReady() {
    return this.Core.isLobbyReady();
  }

  isRegistered() {
    return this.Core.isRegistered();
  }

  IsIgnored() {
    return this.fIsIgnored;
  }

  isLocal() {
    return this.fLocal;
  }

  getNetClient() {
    return this.pNetClient;
  }

  SetCore(NewCore) {
    this.Core.$assign(NewCore);
  }

  SetID(iID) {
    this.Core.SetID(iID);
  }

  SetActivated(fnActivated) {
    this.Core.SetActivated(fnActivated);
    if (fnActivated && this.pNetClient != null) {
      this.pNetClient.SetLastActivity($.Game.FrameCounter);
    }
  }

  SetObserver() {
    this.Core.SetObserver(true);
  }

  SetLobbyReady(fnLobbyReady, time_since_last_change = null) {
    this.Core.SetLobbyReady(fnLobbyReady);
    if (time_since_last_change != null) {
      let now = c$time(null);
      time_since_last_change = now - this.last_lobby_ready_change;
      this.last_lobby_ready_change = now;
    }
  }

  SetLocal() {
    this.fLocal = true;
  }

  ToggleIgnore() {
    this.fIsIgnored = !this.fIsIgnored;
  }

  UnlinkNetClient() {
    this.pNetClient = null;
  }

  Remove() {
    $.Players.RemoveAtClient$i32$b(this.getID(), true);
  }

  CompileFunc(pComp) {
    pComp.Value$rC4ClientCore(this.Core);
    if (pComp.isDeserializer()) {
      this.fLocal = false;
    }
  }

  $clone() { return new C4Client().$assign(this); }
  $assign(o) {
    this.Core.$assign(o.Core);
    this.fLocal = o.fLocal;
    this.pNetClient = o.pNetClient;
    this.last_lobby_ready_change = o.last_lobby_ready_change;
    this.fIsIgnored = o.fIsIgnored;
    this.pNext = o.pNext;
    return this;
  }
}

export class C4ClientList {
  pFirst = null;
  pLocal = null;
  pNetClients = null;

  $dtor() {
    C4ClientList.prototype.Clear.call(this);
  }

  Clear() {
    this.ClearNetwork();
    while (this.pFirst != null) {
      let pClient = this.pFirst;
      this.Remove(pClient, true);
      $delete(pClient);
    }
  }

  Add$pC4Client(pClient) {
    if (pClient.isLocal()) {
      this.pLocal = pClient;
    }
    0;
    let pPos = this.pFirst;
    let pPrev = null;
    for (; pPos != null; pPrev = pPos, pPos = pPos.pNext) {
      if (pPos.getID() > pClient.getID()) {
        break;
      }
    }
    pClient.pNext = pPos;
    (($v) => pPrev != null ? (pPrev.pNext = $v) : (this.pFirst = $v))(pClient);
    if (this.pNetClients != null) {
      pClient.pNetClient = this.pNetClients.RegClient(pClient);
    }
  }

  getClient(pAfter = null) {
    return pAfter != null ? pAfter.pNext : this.pFirst;
  }

  getLocal() {
    return this.pLocal;
  }

  getClientByID(iID) {
    for (let pClient = this.pFirst; pClient != null; pClient = pClient.pNext) {
      if (pClient.getID() === iID) {
        return pClient;
      }
    }
    return null;
  }

  getHost() {
    return this.getClientByID(0);
  }

  getNextClientByID(iAfterID) {
    for (let pClient = this.pFirst; pClient != null; pClient = pClient.pNext) {
      if (pClient.getID() > iAfterID) {
        return pClient;
      }
    }
    return null;
  }

  getClientByName(szName) {
    for (let pClient = this.pFirst; pClient != null; pClient = pClient.pNext) {
      if ($.SEqual(pClient.getName(), szName)) {
        return pClient;
      }
    }
    return null;
  }

  getClientCnt() {
    let iCnt = 0;
    for (let pClient = this.pFirst; pClient != null; pClient = pClient.pNext) {
      iCnt = iCnt + 1 | 0;
    }
    return iCnt;
  }

  getLocalCore() {
    return this.getLocal().getCore();
  }

  getLocalName() {
    return this.pLocal != null ? this.getLocalCore().getName() : S("???");
  }

  getLocalID() {
    return this.pLocal != null ? this.getLocalCore().getID() : -1;
  }

  GetAllClientNames() {
    let result = new $.StdStrBuf();
    for (let pClient = this.pFirst; pClient != null; pClient = pClient.pNext) {
      if (result.getSize() !== 0) {
        result.Append$pi8(S(", "));
      }
      result.Append$pi8(pClient.getName());
    }
    return result;
  }

  Init(iLocalClientID = 0) {
    this.Clear();
    this.AddLocal(iLocalClientID, true, false);
    return true;
  }

  InitNetwork(pnNetClients) {
    pnNetClients.Clear();
    this.pNetClients = pnNetClients;
    for (let pClient = this.pFirst; pClient != null; pClient = pClient.pNext) {
      pClient.pNetClient = this.pNetClients.RegClient(pClient);
    }
  }

  ClearNetwork() {
    let pOldNetClients = this.pNetClients;
    this.pNetClients = null;
    if (pOldNetClients != null) {
      pOldNetClients.Clear();
    }
  }

  Remove(pClient, fTemporary = false) {
    if (pClient === this.pFirst) {
      this.pFirst = pClient.pNext;
    } else {
      let pPrev = null;
      for (pPrev = this.pFirst; pPrev != null && pPrev.pNext !== pClient; pPrev = pPrev.pNext) {
      }
      if (pPrev == null) {
        return false;
      }
      pPrev.pNext = pClient.pNext;
    }
    if (pClient === this.pLocal) {
      this.pLocal = null;
    }
    if (!fTemporary) {
      pClient.Remove();
      if (this.pNetClients != null && pClient.getNetClient() != null) {
        this.pNetClients.DeleteClient(pClient.getNetClient());
      }
    }
    return true;
  }

  Add$C4ClientCore(Core) {
    if (this.getClientByID(Core.getID()) != null) {
      $.Log(S("ClientList: Duplicated client ID!"));
      return null;
    }
    let pClient = new C4Client().init$C4ClientCore(Core);
    this.Add$pC4Client(pClient);
    return pClient;
  }

  AddLocal(iID, fActivated, fObserver) {
    0;
    let LocalCore = new C4ClientCore().init();
    LocalCore.SetLocal(iID, fActivated, fObserver);
    let pClient = new C4Client().init$C4ClientCore(LocalCore);
    pClient.SetLocal();
    this.Add$pC4Client(pClient);
    0;
    return pClient;
  }

  SetLocalID(iID) {
    if (this.pLocal == null) {
      return;
    }
    this.pLocal.SetID(iID);
    let pSavedLocal = this.pLocal;
    this.Remove(this.pLocal, true);
    this.Add$pC4Client(pSavedLocal);
  }

  CtrlRemove(pClient, szReason) {
    if (this.pLocal == null || !this.pLocal.isHost() || pClient == null) {
      return;
    }
    if (pClient.getNetClient() != null) {
      pClient.getNetClient().SetStatus(4 /*NCS_Remove*/);
    }
    $.Control$2.DoInput(130 /*CID_ClientRemove*/, new $.C4ControlClientRemove().init$i32$pi8(pClient.getID(), szReason), 1 /*CDT_Sync*/);
  }

  RemoveRemote() {
    for (let pClient = this.pFirst, pNext = null; pClient != null; pClient = pNext) {
      pNext = pClient.pNext;
      if (!pClient.isLocal()) {
        this.Remove(pClient);
        $delete(pClient);
      }
    }
  }

  CompileFunc(pComp) {
    let deserializing = pComp.isDeserializer();
    if (deserializing) {
      this.Clear();
    }
    const iClientCnt = [this.getClientCnt() >>> 0];
    pComp.Value$StdNamingCountAdapt$u32($.mkNamingCountAdapt$ru32$pi8(P(iClientCnt, 0), S("Client")));
    if (pComp.isDeserializer()) {
      for (let i = 0; i < iClientCnt[0]; i = i + 1 >>> 0) {
        let pClient = new C4Client().init$v();
        pComp.Value$StdNamingAdapt$C4Client($.mkNamingAdapt$rC4Client$pi8(pClient, S("Client")));
        this.Add$pC4Client(pClient);
      }
    } else {
      for (let pClient = this.pFirst; pClient != null; pClient = pClient.pNext) {
        pComp.Value$StdNamingAdapt$C4Client($.mkNamingAdapt$rC4Client$pi8(pClient, S("Client")));
      }
    }
  }

  $clone() { return new C4ClientList().$assign(this); }
  $assign(List) {
    let pClient = null;
    let pNext = null;
    for (pClient = this.pFirst; pClient != null; pClient = pNext) {
      pNext = pClient.pNext;
      if (!(List.getClientByID(pClient.getID()) != null)) {
        this.Remove(pClient);
        $delete(pClient);
      }
    }
    for (pClient = List.pFirst; pClient != null; pClient = pClient.pNext) {
      let pNewClient = this.getClientByID(pClient.getID());
      if (pNewClient != null) {
        pNewClient.SetCore(pClient.getCore());
      } else {
        pNewClient = this.Add$C4ClientCore(pClient.getCore());
      }
    }
    return this;
  }
}

export class C4ClientCore extends C4PacketBase {
  iID = -1;
  Name = new $.ValidatedStdCopyStrBuf$4().init$v();
  Nick = new $.ValidatedStdCopyStrBuf$4().init$v();
  CUID = new $.ValidatedStdCopyStrBuf$3().init$v();
  Revision = new $.ValidatedStdCopyStrBuf$3().init$v();
  iVersion = new Int32Array(4);
  fActivated = false;
  fObserver = false;
  fLobbyReady = false;

  init() {
    this.iID = -1;
    this.Name = new $.ValidatedStdCopyStrBuf$4().init$v();
    this.Nick = new $.ValidatedStdCopyStrBuf$4().init$v();
    this.CUID = new $.ValidatedStdCopyStrBuf$3().init$v();
    this.Revision = new $.ValidatedStdCopyStrBuf$3().init$v();
    this.fActivated = false;
    this.fObserver = false;
    this.fLobbyReady = false;
    this.Name.Ref$pi8(S(""));
    this.CUID.Ref$pi8(S(""));
    this.Nick.Ref$pi8(S(""));
    return this;
  }

  getID() {
    return this.iID;
  }

  isHost() {
    return this.iID === 0;
  }

  isActivated() {
    return this.fActivated;
  }

  isObserver() {
    return this.fObserver;
  }

  isLobbyReady() {
    return this.fLobbyReady;
  }

  SetID(inID) {
    this.iID = inID;
  }

  SetName(sznName) {
    this.Name.CopyValidated$pi8(sznName);
  }

  SetActivated(fnActivated) {
    this.fActivated = fnActivated;
    this.fObserver = false;
  }

  SetObserver(fnObserver) {
    this.fActivated = ((this.fActivated ? 1 : 0) & (!(this.fObserver = fnObserver) ? 1 : 0)) !== 0;
  }

  SetLobbyReady(fnLobbyReady) {
    this.fLobbyReady = fnLobbyReady;
  }

  getName() {
    return this.Name.getData();
  }

  getCUID() {
    return this.CUID.getData();
  }

  getNick() {
    return this.Nick.getData();
  }

  getRevision() {
    return this.Revision.getData();
  }

  isRegistered() {
    return this.CUID.getLength() > 0;
  }

  SetLocal(inID, fnActivated, fnObserver) {
    this.iID = inID;
    this.fActivated = fnActivated;
    this.fObserver = fnObserver;
    this.CUID.CopyValidated$pi8($.Config.GetRegistrationData(S("Cuid")));
    this.Revision.CopyValidated$pi8($.Application.GetRevision());
    if ($.Config.Network.Nick.getLength() !== 0) {
      this.Name.CopyValidated$StdStrBuf($.Config.Network.Nick);
      this.Nick.Copy$StdStrBuf(this.Name);
    } else {
      let position = c$strchr(P($.Config.General.Participants, 0), 59);
      if (position == null) {
        position = $padd(P($.Config.General.Participants, 0), c$strlen(P($.Config.General.Participants, 0)));
      }
      if ($padd(P($.Config.General.Participants, 0), 4).o <= position.o && c$strncmp($padd(position, -4), S(".ocp"), 4) === 0) {
        this.Name.CopyValidated$pi8(StdString.of(P($.Config.General.Participants, 0), $u64n(position.o - P($.Config.General.Participants, 0).o - 4)).c_str());
      } else {
        this.Name.Copy$pi8(S("empty"));
      }
      this.Nick.Copy$StdStrBuf(this.Name);
    }
  }

  SetUnknown(inID) {
    this.iID = inID;
    this.Name.Ref$pi8(S("unknown"));
    this.CUID.Ref$pi8(S("unknown"));
    this.Nick.Ref$pi8(S("unknown"));
    this.Revision.Ref$pi8(S("unknown"));
    this.fActivated = this.fObserver = false;
  }

  getDiffLevel(CCore2) {
    if (this.CUID.op_ne$pi8(CCore2.getCUID()) || this.Nick.op_ne$pi8(CCore2.getNick())) {
      return 3;
    }
    if (this.iID !== CCore2.getID() || this.Name.op_ne$pi8(CCore2.getName())) {
      return 2;
    }
    if ((this.fActivated ? 1 : 0) !== (CCore2.isActivated() ? 1 : 0) || (this.fObserver ? 1 : 0) !== (CCore2.isObserver() ? 1 : 0) || (this.fLobbyReady ? 1 : 0) !== (CCore2.isLobbyReady() ? 1 : 0)) {
      return 1;
    }
    return 0;
  }

  CompileFunc$pStdCompiler(pComp) {
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "iID"), S("ID"), $.C4ClientIDUnknown$C4Client));
    pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "fActivated"), S("Activated"), false));
    pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "fObserver"), S("Observer"), false));
    pComp.Value$StdNamingDefaultAdapt$b$b($.mkNamingAdapt$rb$pi8$b$b$b(P(this, "fLobbyReady"), S("Ready"), false));
    pComp.Value$StdNamingDefaultAdapt$ValidatedStdCopyStrBuf$4$x($.mkNamingAdapt$rValidatedStdCopyStrBuf$4$pi8$x$b$b(this.Name, S("Name"), S("")));
    pComp.Value$StdNamingDefaultAdapt$ValidatedStdCopyStrBuf$3$x($.mkNamingAdapt$rValidatedStdCopyStrBuf$3$pi8$x$b$b(this.CUID, S("CUID"), S("")));
    pComp.Value$StdNamingDefaultAdapt$ValidatedStdCopyStrBuf$4$x($.mkNamingAdapt$rValidatedStdCopyStrBuf$4$pi8$x$b$b(this.Nick, S("Nick"), S("")));
    pComp.Value$StdNamingDefaultAdapt$ValidatedStdCopyStrBuf$3$x($.mkNamingAdapt$rValidatedStdCopyStrBuf$3$pi8$x$b$b(this.Revision, S("Revision"), S("")));
  }

  $clone() { return new C4ClientCore().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.iID = o.iID;
    this.Name.$assign(o.Name);
    this.Nick.$assign(o.Nick);
    this.CUID.$assign(o.CUID);
    this.Revision.$assign(o.Revision);
    this.iVersion = o.iVersion.slice();
    this.fActivated = o.fActivated;
    this.fObserver = o.fObserver;
    this.fLobbyReady = o.fLobbyReady;
    return this;
  }
}








export function $init(): void {
  $.C4ClientIDUnknown$C4Client = -1;
  $.C4ClientIDHost$C4Client = 0;
  $.C4ClientIDStart$C4Client = 1;
  $.C4ClientCoreDL_None$C4Client = 0;
  $.C4ClientCoreDL_IDMatch$C4Client = 1;
  $.C4ClientCoreDL_IDChange$C4Client = 2;
  $.C4ClientCoreDL_Different$C4Client = 3;
}

Object.assign($, { C4Client, C4ClientCore, C4ClientList });
