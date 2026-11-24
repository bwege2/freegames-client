// @ts-nocheck
// OpenClonk 36de799: src/network/C4PacketBase.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $oadd, $oat, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete, $throw } from '../../rt/std.ts';

export class C4PacketBase {

  pack$addr_t(addr = new $.C4NetIO$EndpointAddress().init$v()) {
    return new $.C4NetIOPacket().init$StdBuf$addr_t($.DecompileToBuf$C4PacketBase(this), addr);
  }

  unpack(Pkt, pStatus = null) {
    if (pStatus != null) {
      pStatus.a[pStatus.o] = Pkt.getStatus() << 24 >> 24;
    }
    $.CompileFromBuf$rC4PacketBase$x(this, pStatus != null ? Pkt.getPBuf() : Pkt.getRef());
  }

  $clone() { return new C4PacketBase().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class C4NetFilenameAdapt {
  FileName = null;

  init(FileName) {
    this.FileName = FileName;
    return this;
  }

  CompileFunc(pComp) {
    let FileName2 = new $.StdCopyStrBuf();
    if (pComp.isSerializer() && this.FileName.op_const_void_() != null) {
      FileName2.Copy$StdStrBuf(this.FileName);
      $.SReplaceChar(FileName2.getMData(), 47, 92);
    }
    pComp.Value$rStdCopyStrBuf(FileName2);
    if (pComp.isDeserializer()) {
      this.FileName.Take$rStdStrBuf(FileName2);
      $.SReplaceChar(this.FileName.getMData(), 92, 47);
    }
  }

  op_eq(rVal) {
    return this.FileName.op_eq$pi8(P(rVal, 0));
  }

  op_assign(rVal) {
    $.StdStrBuf.prototype.op_assign$pi8.call(this.FileName, P(rVal, 0));
    return this;
  }

  $clone() { return new C4NetFilenameAdapt().$assign(this); }
  $assign(o) {
    this.FileName = o.FileName;
    return this;
  }
}

export class C4PktHandlingData {
  ID = 0;
  Class = 0;
  Name = null;
  AcceptedOnly = false;
  ProcByThread = false;
  HandlerID = 0;
  FnUnpack = null;

  $clone() { return new C4PktHandlingData().$assign(this); }
  $assign(o) {
    this.ID = o.ID;
    this.Class = o.Class;
    this.Name = o.Name;
    this.AcceptedOnly = o.AcceptedOnly;
    this.ProcByThread = o.ProcByThread;
    this.HandlerID = o.HandlerID;
    this.FnUnpack = o.FnUnpack;
    return this;
  }
}

export class C4PktBuf extends C4PacketBase {
  Data = new $.StdCopyBuf();

  init$StdBuf(rCpyData) {
    this.Data = new $.StdCopyBuf();
    this.op_assign$StdBuf(rCpyData);
    return this;
  }

  op_assign$StdBuf(rCpyData) {
    this.Data.Copy$StdBuf(rCpyData);
    return this;
  }

  getSize() {
    return $.StdBuf.prototype.getSize.call(this.Data);
  }

  getData() {
    return $.StdBuf.prototype.getData.call(this.Data);
  }

  CompileFunc$pStdCompiler(pComp) {
    pComp.Value$StdNamingAdapt$StdCopyBuf($.mkNamingAdapt$rStdCopyBuf$pi8(this.Data, S("Data")));
  }

  $copy(rCopy) {
    this.Data = new $.StdCopyBuf();
    C4PktBuf.prototype.$assign.call(this, rCopy);
    return this;
  }
  $clone() { return new C4PktBuf().$copy(this); }
  $assign(rCopy) {
    this.Data.Copy$StdBuf(rCopy.Data);
    return this;
  }
}

export class C4IDPacket extends C4PacketBase {
  eID = 255 /*PID_None*/;
  pPkt = null;
  fOwnPkt = true;
  pNext = null;

  init$i32$pC4PacketBase$b(eID, pPkt, fTakePkt = true) {
    this.eID = eID;
    this.pPkt = pPkt;
    this.fOwnPkt = fTakePkt;
    this.pNext = null;
    return this;
  }

  $dtor() {
    C4IDPacket.prototype.Clear.call(this);
  }

  getPktType() {
    return this.eID;
  }

  getPkt() {
    return this.pPkt;
  }

  getPktName() {
    for (let pPData = $oat($.PktHandlingData, 0); pPData.ID !== 255; pPData = $oadd(pPData, 1)) {
      if (pPData.ID === this.eID && pPData.Name != null) {
        return pPData.Name;
      }
    }
    return S("Unknown Packet Type");
  }

  Clear() {
    if (this.fOwnPkt) {
      $delete(this.pPkt);
    }
    this.pPkt = null;
    this.eID = 255 /*PID_None*/;
  }

  Default() {
    this.eID = 255 /*PID_None*/;
    this.pPkt = null;
  }

  CompileFunc$pStdCompiler(pComp) {
    pComp.Value$StdNamingDefaultAdapt$StdIntAdapt$i32$u8$i32($.mkNamingAdapt$mStdIntAdapt$i32$u8$pi8$i32$b$b($.mkIntAdaptT(P(this, "eID")), S("ID"), 255 /*PID_None*/));
    if (pComp.isDeserializer()) {
      if (!pComp.Name(this.getPktName())) {
        pComp.excCorrupt(S("C4IDPacket: Data value needed! Packet data missing!"));
        return;
      }
      if (this.fOwnPkt) {
        $delete(this.pPkt);
      }
      this.pPkt = null;
      if (this.eID === 255) {
        return;
      }
      for (let pPData = $oat($.PktHandlingData, 0); pPData.ID !== 255; pPData = $oadd(pPData, 1)) {
        if (pPData.ID === this.eID && pPData.FnUnpack != null) {
          this.pPkt = pPData.FnUnpack(pComp);
          break;
        }
      }
      if (this.pPkt == null) {
        pComp.excCorrupt(S("C4IDPacket: could not unpack packet id %02x!"), this.eID);
      }
      pComp.NameEnd();
    } else if (this.eID !== 255) {
      pComp.Value$StdNamingAdapt$C4PacketBase($.mkNamingAdapt$rC4PacketBase$pi8(this.pPkt, this.getPktName()));
    }
  }

  $copy(Packet2) {
    this.eID = 255 /*PID_None*/;
    this.pPkt = null;
    this.fOwnPkt = true;
    this.pNext = null;
    C4PacketBase.prototype.unpack.call(this, C4PacketBase.prototype.pack$addr_t.call(Packet2));
    return this;
  }
  $clone() { return new C4IDPacket().$copy(this); }
  $assign(o) {
    super.$assign(o);
    this.eID = o.eID;
    this.pPkt = o.pPkt;
    this.fOwnPkt = o.fOwnPkt;
    this.pNext = o.pNext;
    return this;
  }
}

export class C4PacketList extends C4PacketBase {
  pFirst = null;
  pLast = null;

  $dtor() {
    C4PacketList.prototype.Clear.call(this);
  }

  firstPkt() {
    return this.pFirst;
  }

  nextPkt(pPkt) {
    return pPkt.pNext;
  }

  Add$pC4IDPacket(pPkt) {
    0;
    (($v) => this.pLast != null ? (this.pLast.pNext = $v) : (this.pFirst = $v))(pPkt);
    this.pLast = pPkt;
  }

  AddHead$pC4IDPacket(pPkt) {
    0;
    pPkt.pNext = this.pFirst;
    this.pFirst = pPkt;
    if (this.pLast == null) {
      this.pLast = pPkt;
    }
  }

  Add$i32$pC4PacketBase(eType, pPkt) {
    this.Add$pC4IDPacket(new C4IDPacket().init$i32$pC4PacketBase$b(eType, pPkt));
  }

  AddHead$i32$pC4PacketBase(eType, pPkt) {
    this.AddHead$pC4IDPacket(new C4IDPacket().init$i32$pC4PacketBase$b(eType, pPkt));
  }

  Take$rC4PacketList(List) {
    this.pFirst = List.pFirst;
    this.pLast = List.pLast;
    List.pFirst = List.pLast = null;
  }

  Append$C4PacketList(List) {
    for (let pPkt = List.firstPkt(); pPkt != null; pPkt = List.nextPkt(pPkt)) {
      this.Add$pC4IDPacket(new C4IDPacket().$copy(pPkt));
    }
  }

  Clear() {
    while (this.pFirst != null) {
      this.Delete(this.pFirst);
    }
  }

  Remove(pPkt) {
    if (pPkt === this.pFirst) {
      this.pFirst = pPkt.pNext;
      if (pPkt === this.pLast) {
        this.pLast = null;
      }
    } else {
      let pPrev = null;
      for (pPrev = this.pFirst; pPrev != null && pPrev.pNext !== pPkt; pPrev = pPrev.pNext) {
      }
      if (pPrev != null) {
        pPrev.pNext = pPkt.pNext;
        if (pPkt === this.pLast) {
          this.pLast = pPrev;
        }
      }
    }
  }

  Delete(pPkt) {
    this.Remove(pPkt);
    $delete(pPkt);
  }

  CompileFunc$pStdCompiler(pComp) {
    if (pComp.isDeserializer()) {
      while (pComp.Name(S("IDPacket"))) {
        let pPkt = new C4IDPacket();
        try {
          pComp.Value$rC4IDPacket(pPkt);
          pComp.NameEnd();
        } catch ($e3) {
          {
            $delete(pPkt);
            $throw($e3);
          }
        }
        if (!(pPkt.getPkt() != null)) {
          $delete(pPkt);
          break;
        }
        this.Add$pC4IDPacket(pPkt);
      }
      pComp.NameEnd();
    } else {
      for (let pPkt = this.pFirst; pPkt != null; pPkt = pPkt.pNext) {
        pComp.Value$StdNamingAdapt$C4IDPacket($.mkNamingAdapt$rC4IDPacket$pi8(pPkt, S("IDPacket")));
      }
      if (!pComp.hasNaming()) {
        let Pkt = new C4IDPacket();
        pComp.Value$StdNamingAdapt$C4IDPacket($.mkNamingAdapt$rC4IDPacket$pi8(Pkt, S("IDPacket")));
      }
    }
  }

  $copy(List2) {
    this.pFirst = null;
    this.pLast = null;
    C4PacketList.prototype.Append$C4PacketList.call(this, List2);
    return this;
  }
  $clone() { return new C4PacketList().$copy(this); }
  $assign(o) {
    super.$assign(o);
    this.pFirst = o.pFirst;
    this.pLast = o.pLast;
    return this;
  }
}

export function mkNetFilenameAdapt(FileName) {
  return new C4NetFilenameAdapt().init(FileName);
}

export function $init(): void {
}

Object.assign($, { C4IDPacket, C4NetFilenameAdapt, C4PacketBase, C4PacketList, C4PktBuf, C4PktHandlingData, mkNetFilenameAdapt });
