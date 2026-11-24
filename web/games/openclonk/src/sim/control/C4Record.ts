// @ts-nocheck
// OpenClonk 36de799: src/control/C4Record.cpp, src/control/C4Record.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $u64n } from '../../rt/int.ts';
import { c$memcmp } from '../../rt/libc.ts';
import { $bytesView, $padd, $peq, $rd, $reinterpVoid, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $begin, $delete, $end, $itcopy, $max, $missing, $vpush, seq_erase } from '../../rt/std.ts';
import { C4PktBuf } from '../network/C4PacketBase.ts';

export class C4DebugRecOff {
  fDoOff = true;

  init$v() {
    this.fDoOff = true;
    $.DoNoDebugRec = $.DoNoDebugRec + 1 | 0;
    ;
    return this;
  }

  init$b(fDoOff) {
    this.fDoOff = fDoOff;
    if (fDoOff) {
      $.DoNoDebugRec = $.DoNoDebugRec + 1 | 0;
      ;
    }
    return this;
  }

  $dtor() {
    if (this.fDoOff) {
      $.DoNoDebugRec = $.DoNoDebugRec - 1 | 0;
      ;
    }
  }

  Clear() {
    $.DoNoDebugRec = $.DoNoDebugRec - 1 | 0;
    ;
    this.fDoOff = false;
  }

  $clone() { return new C4DebugRecOff().$assign(this); }
  $assign(o) {
    this.fDoOff = o.fDoOff;
    return this;
  }
}

export class C4RecordChunkHead {
  iFrm = 0;
  Type = 0;

  $clone() { return new C4RecordChunkHead().$assign(this); }
  $assign(o) {
    this.iFrm = o.iFrm;
    this.Type = o.Type;
    return this;
  }
}

export class C4RecordChunk {
  Frame = 0;
  Type = 0;
  $u1 = new C4RecordChunk$$anon1();
  Filename = new $.StdCopyStrBuf();

  init() {
    this.$u1.pCtrl = null;
    this.Filename = new $.StdCopyStrBuf();
    return this;
  }

  Delete() {
    switch (this.Type) {
      case 0:
        $delete(this.$u1.pCtrl);
        this.$u1.pCtrl = null;
        break;
      case 1:
        $delete(this.$u1.pPkt);
        this.$u1.pPkt = null;
        break;
      case 16:
        break;
      case 2:
        break;
      case 48:
        $delete(this.$u1.pFileData);
        break;
      default:
        $delete(this.$u1.pDbg);
        this.$u1.pDbg = null;
        break;
    }
  }

  CompileFunc(pComp) {
    pComp.Value$StdNamingAdapt$i32($.mkNamingAdapt$ri32$pi8(P(this, "Frame"), S("Frame")));
    pComp.Value$StdNamingAdapt$StdIntAdapt$u8$i32($.mkNamingAdapt$mStdIntAdapt$u8$i32$pi8($.mkIntAdapt$ru8(P(this, "Type")), S("Type")));
    switch (this.Type) {
      case 0:
        pComp.Value$StdPtrAdapt$C4Control($.mkPtrAdaptNoNull$rpC4Control(P(this.$u1, "pCtrl")));
        break;
      case 1:
        pComp.Value$StdPtrAdapt$C4IDPacket($.mkPtrAdaptNoNull$rpC4IDPacket(P(this.$u1, "pPkt")));
        break;
      case 16:
        break;
      case 2:
        break;
      case 48:
        pComp.Value$rStdCopyStrBuf(this.Filename);
        pComp.Value$StdPtrAdapt$StdBuf($.mkPtrAdaptNoNull$rpStdBuf(P(this.$u1, "pFileData")));
        break;
      default:
        pComp.Value$StdPtrAdapt$C4PktDebugRec($.mkPtrAdaptNoNull$rpC4PktDebugRec(P(this.$u1, "pDbg")));
        break;
    }
  }

  $clone() { return new C4RecordChunk().$assign(this); }
  $assign(o) {
    this.Frame = o.Frame;
    this.Type = o.Type;
    this.$u1.$assign(o.$u1);
    this.Filename.$assign(o.Filename);
    return this;
  }
}

export class C4RecordChunk$$anon1 {
  $v = null;
  get pCtrl() { const v = this.$v; return v === 0 ? null : v; }
  set pCtrl(v) { this.$v = v; }
  get pPkt() { const v = this.$v; return v === 0 ? null : v; }
  set pPkt(v) { this.$v = v; }
  get pDbg() { const v = this.$v; return v === 0 ? null : v; }
  set pDbg(v) { this.$v = v; }
  get pFileData() { const v = this.$v; return v === 0 ? null : v; }
  set pFileData(v) { this.$v = v; }
  $clone() { const u = new C4RecordChunk$$anon1(); u.$v = this.$v; return u; }
  $assign(o) { this.$v = o.$v; return this; }
}

export class C4RCSetPix {
  x = 0;
  y = 0;
  clr = 0;
  bgClr = 0;

  $clone() { return new C4RCSetPix().$assign(this); }
  $assign(o) {
    this.x = o.x;
    this.y = o.y;
    this.clr = o.clr;
    this.bgClr = o.bgClr;
    return this;
  }
}

export class C4RCExecObj {
  Number = 0;
  fx = new $.C4Fixed();
  fy = new $.C4Fixed();
  fr = new $.C4Fixed();

  None() {
    this.fx = new $.C4Fixed();
    this.fy = new $.C4Fixed();
    this.fr = new $.C4Fixed();
    return this;
  }

  $clone() { return new C4RCExecObj().$assign(this); }
  $assign(o) {
    this.Number = o.Number;
    this.fx.$assign(o.fx);
    this.fy.$assign(o.fy);
    this.fr.$assign(o.fr);
    return this;
  }
}

export class C4RCMassMover {
  x = 0;
  y = 0;

  $clone() { return new C4RCMassMover().$assign(this); }
  $assign(o) {
    this.x = o.x;
    this.y = o.y;
    return this;
  }
}

export class C4RCRandom {
  Cnt = 0;
  Range = 0;
  Val = 0;

  $clone() { return new C4RCRandom().$assign(this); }
  $assign(o) {
    this.Cnt = o.Cnt;
    this.Range = o.Range;
    this.Val = o.Val;
    return this;
  }
}

export class C4RCCreateObj {
  oei = 0;
  id = new Int8Array(33);
  x = 0;
  y = 0;
  ownr = 0;

  $clone() { return new C4RCCreateObj().$assign(this); }
  $assign(o) {
    this.oei = o.oei;
    this.id = o.id.slice();
    this.x = o.x;
    this.y = o.y;
    this.ownr = o.ownr;
    return this;
  }
}

export class C4RCSin {
  v = 0;
  r = 0;

  $clone() { return new C4RCSin().$assign(this); }
  $assign(o) {
    this.v = o.v;
    this.r = o.r;
    return this;
  }
}

export class C4RCRotVtx {
  x = 0;
  y = 0;
  wdt = 0;
  hgt = 0;
  r = 0;
  VtxX = new Int32Array(4);
  VtxY = new Int32Array(4);

  $clone() { return new C4RCRotVtx().$assign(this); }
  $assign(o) {
    this.x = o.x;
    this.y = o.y;
    this.wdt = o.wdt;
    this.hgt = o.hgt;
    this.r = o.r;
    this.VtxX = o.VtxX.slice();
    this.VtxY = o.VtxY.slice();
    return this;
  }
}

export class C4RCExecPXS {
  x = new $.C4Fixed();
  y = new $.C4Fixed();
  iMat = 0;
  pos = 0;

  None() {
    this.x = new $.C4Fixed();
    this.y = new $.C4Fixed();
    return this;
  }

  $clone() { return new C4RCExecPXS().$assign(this); }
  $assign(o) {
    this.x.$assign(o.x);
    this.y.$assign(o.y);
    this.iMat = o.iMat;
    this.pos = o.pos;
    return this;
  }
}

export class C4RCTrf {
  x = 0;
  y = 0;
  Turbulence = 0;
  Rotate = 0;

  $clone() { return new C4RCTrf().$assign(this); }
  $assign(o) {
    this.x = o.x;
    this.y = o.y;
    this.Turbulence = o.Turbulence;
    this.Rotate = o.Rotate;
    return this;
  }
}

export class C4RCPos {
  x = 0;
  y = 0;

  $clone() { return new C4RCPos().$assign(this); }
  $assign(o) {
    this.x = o.x;
    this.y = o.y;
    return this;
  }
}

export class C4RCObjectCom {
  com = 0;
  data = 0;
  o = 0;

  $clone() { return new C4RCObjectCom().$assign(this); }
  $assign(o) {
    this.com = o.com;
    this.data = o.data;
    this.o = o.o;
    return this;
  }
}

export class C4RCMatScan {
  cx = 0;
  cy = 0;
  mat = 0;
  conv_to = 0;
  dir = 0;
  mconvs = 0;

  $clone() { return new C4RCMatScan().$assign(this); }
  $assign(o) {
    this.cx = o.cx;
    this.cy = o.cy;
    this.mat = o.mat;
    this.conv_to = o.conv_to;
    this.dir = o.dir;
    this.mconvs = o.mconvs;
    return this;
  }
}

export class C4RCArea {
  op = 0;
  obj = 0;
  x1 = 0;
  y1 = 0;
  xL = 0;
  yL = 0;
  dpitch = 0;
  out = false;

  $clone() { return new C4RCArea().$assign(this); }
  $assign(o) {
    this.op = o.op;
    this.obj = o.obj;
    this.x1 = o.x1;
    this.y1 = o.y1;
    this.xL = o.xL;
    this.yL = o.yL;
    this.dpitch = o.dpitch;
    this.out = o.out;
    return this;
  }
}

export class C4RCMenuAdd {
  iObjNum = 0;
  iCount = 0;
  idID = new $.C4ID().init$v();
  fOwnValue = false;
  iValue = 0;
  fIsSelectable = false;

  $clone() { return new C4RCMenuAdd().$assign(this); }
  $assign(o) {
    this.iObjNum = o.iObjNum;
    this.iCount = o.iCount;
    this.idID.$assign(o.idID);
    this.fOwnValue = o.fOwnValue;
    this.iValue = o.iValue;
    this.fIsSelectable = o.fIsSelectable;
    return this;
  }
}

export class C4RCOCF {
  dwOCFOld = 0;
  dwOCFNew = 0;
  fUpdate = false;

  $clone() { return new C4RCOCF().$assign(this); }
  $assign(o) {
    this.dwOCFOld = o.dwOCFOld;
    this.dwOCFNew = o.dwOCFNew;
    this.fUpdate = o.fUpdate;
    return this;
  }
}

export class C4Record {
  CtrlRec = new $.CStdFile().init();
  LogRec = new $.CStdFile().init();
  sFilename = new $.StdStrBuf();
  RecordGrp = new $.C4Group().init();
  fRecording = false;
  iLastFrame = 0;
  fStreaming = false;
  iStreamingPos = 0;
  StreamingData = new $.StdBuf();
  Index = 0;

  init$v() {
    this.CtrlRec = new $.CStdFile().init();
    this.LogRec = new $.CStdFile().init();
    this.sFilename = new $.StdStrBuf();
    this.RecordGrp = new $.C4Group().init();
    this.fRecording = false;
    this.fStreaming = false;
    this.StreamingData = new $.StdBuf();
    return this;
  }

  IsRecording() {
    return this.fRecording;
  }

  GetStreamingPos() {
    return this.iStreamingPos;
  }

  GetStreamingBuf() {
    return this.StreamingData;
  }

  Start(fInitial) {
    if (this.fRecording) {
      return false;
    }
    if (!$.Config.General.CreateSaveFolder($.Config.AtUserDataPath(S("Records.ocf")), $.LoadResStr(S("IDS_GAME_RECORDSTITLE")))) {
      return false;
    }
    let sDemoFolder = new $.StdStrBuf().init$pi8$b(S("Records.ocf"));
    const sScenName = new Int8Array(256);
    $.SCopy$pi8$pi8$u64($.GetFilenameOnly($.Game.Parameters.Scenario.getFile()), P(sScenName, 0), 255);
    let pScenNameEnd = $padd(P(sScenName, 0), $.SLen(P(sScenName, 0)));
    while ($.Inside$i8$i8$i8($rd((pScenNameEnd = pScenNameEnd.add(-1))), 48, 57)) {
      if ($peq(pScenNameEnd, P(sScenName, 0))) {
        break;
      }
    }
    pScenNameEnd.a[pScenNameEnd.o + 1] = 0;
    this.Index = 1;
    for (let i = new $.DirectoryIterator().init$pi8($.Config.AtUserDataPath(S("Records.ocf"))); i.op_mul() != null; i.op_inc$v()) {
      if ($.WildcardMatch(S("*.ocs"), i.op_mul())) {
        this.Index = this.Index + 1 | 0;
      }
    }
    this.sFilename.Format(S("%s/%03i-%s.ocs"), $.Config.AtUserDataPath(sDemoFolder.getData()), this.Index, P(sScenName, 0));
    let sLog = new $.StdStrBuf();
    sLog.Format($.LoadResStr(S("IDS_PRC_RECORDINGTO")), this.sFilename.getData());
    if ($.Game.FrameCounter !== 0) {
      sLog.AppendFormat(S(" (Frame %d)"), $.Game.FrameCounter);
    }
    $.Log(sLog.getData());
    let saveRec = new $.C4GameSaveRecord().init(fInitial, this.Index, $.Game.Parameters.isLeague());
    if (!saveRec.Save$pi8(this.sFilename.getData())) {
      return false;
    }
    saveRec.Close();
    if (!$.DirectoryExists(this.sFilename.getData()) && !$.C4Group_UnpackDirectory(this.sFilename.getData())) {
      return false;
    }
    const szCtrlRecFilename = new Int8Array(4352);
    $.ssprintf$14(szCtrlRecFilename, S("%s/CtrlRec.ocb"), this.sFilename.getData());
    if (!this.CtrlRec.Create(P(szCtrlRecFilename, 0))) {
      return false;
    }
    const szLogRecFilename = new Int8Array(4352);
    $.ssprintf$14(szLogRecFilename, S("%s/Record.log"), this.sFilename.getData());
    if (!this.LogRec.Create(P(szLogRecFilename, 0))) {
      return false;
    }
    if (!this.RecordGrp.Open(this.sFilename.getData())) {
      return false;
    }
    this.fStreaming = false;
    this.fRecording = true;
    this.iLastFrame = 0;
    return true;
  }

  Stop(pRecordName = null, pRecordSHA1 = null) {
    if (!this.fRecording) {
      return false;
    }
    if (!$.DirectoryExists(this.sFilename.getData())) {
      return false;
    }
    this.StopStreaming();
    let saveRec = new $.C4GameSaveRecord().init(false, this.Index, $.Game.Parameters.isLeague());
    saveRec.SaveDesc(this.RecordGrp);
    $.Game.PlayerInfos.Save(this.RecordGrp, S("RecPlayerInfos.txt"));
    this.RecordGrp.Close$v();
    let Head = new C4RecordChunkHead();
    Head.iFrm = 37;
    Head.Type = 16;
    this.CtrlRec.Write($bytesView(Head, [["iFrm", 0, "u8", 0], ["Type", 1, "u8", 0]], 2), 2);
    this.CtrlRec.Close$ppStdBuf();
    this.LogRec.Close$ppStdBuf();
    if ($.Config.General.DebugRec === 0) {
      if (!$.C4Group_PackDirectory(this.sFilename.getData())) {
        return false;
      }
    }
    if (pRecordName != null) {
      pRecordName.Copy$StdStrBuf(this.sFilename);
    }
    if (pRecordSHA1 != null) {
      if (!$.GetFileSHA1(this.sFilename.getData(), pRecordSHA1)) {
        return false;
      }
    }
    this.fRecording = false;
    return true;
  }

  Rec$C4Control$i32(Ctrl, iFrame) {
    if (!this.fRecording) {
      return false;
    }
    if (!(Ctrl.firstPkt() != null)) {
      return true;
    }
    let Cpy = new $.C4Control().init();
    Cpy.Copy(Ctrl);
    Cpy.PreRec$pC4Record$c(this);
    return this.Rec$i32$StdBuf$i32(iFrame, $.DecompileToBuf$C4Control(Cpy), 0 /*RCT_Ctrl*/);
  }

  Rec$i32$pC4ControlPacket$i32(eCtrlType, pCtrl, iFrame) {
    if (!this.fRecording) {
      return false;
    }
    let Pkt = new $.C4IDPacket().init$i32$pC4PacketBase$b(eCtrlType, pCtrl, false);
    if (!(Pkt.getPkt() != null)) {
      return false;
    }
    let pCtrlCpy = Pkt.getPkt();
    pCtrlCpy.PreRec$pC4Record(this);
    return this.Rec$i32$StdBuf$i32(iFrame, $.DecompileToBuf$C4IDPacket(Pkt), 1 /*RCT_CtrlPkt*/);
  }

  Rec$i32$StdBuf$i32(iFrame, sBuf, eType) {
    while (iFrame > (this.iLastFrame + 255 >>> 0 | 0)) {
      this.Rec$i32$StdBuf$i32(this.iLastFrame + 255 >>> 0 | 0, new $.StdBuf(), 2 /*RCT_Frame*/);
    }
    let iFrameDiff = $max(0, (iFrame >>> 0) - this.iLastFrame >>> 0 & 0xff);
    this.iLastFrame = this.iLastFrame + iFrameDiff >>> 0;
    let Head = ((($o) => ($o.iFrm = iFrameDiff, $o.Type = eType & 0xff, $o))(new C4RecordChunkHead()));
    this.CtrlRec.Write($bytesView(Head, [["iFrm", 0, "u8", 0], ["Type", 1, "u8", 0]], 2), 2);
    this.CtrlRec.Write($.StdBuf.prototype.getData.call(sBuf), $.StdBuf.prototype.getSize.call(sBuf) | 0);
    this.CtrlRec.Flush();
    if (this.fStreaming) {
      this.Stream(Head, sBuf);
    }
    return true;
  }

  AddFile(szLocalFilename, szAddAs, fDelete = false) {
    if (!this.fRecording) {
      return false;
    }
    if (this.fStreaming) {
      let szFile = new $.StdCopyStrBuf().init$pi8$b(szLocalFilename);
      if ($.SEqualNoCase($.GetExtension(szAddAs), S("ocp"))) {
        $.MakeTempFilename$pStdStrBuf(szFile);
        if (!$.CopyItem(szLocalFilename, szFile.getData())) {
          return false;
        }
        if (!$.C4Player.Strip(szFile.getData(), true)) {
          return false;
        }
      }
      if (!this.StreamFile(szFile.getData(), szAddAs)) {
        return false;
      }
      if (szFile.op_ne$pi8(szLocalFilename)) {
        $.EraseItem(szFile.getData());
      }
    }
    if (fDelete) {
      if (!this.RecordGrp.Move(szLocalFilename, szAddAs)) {
        return false;
      }
    } else {
      if (!this.RecordGrp.Add$pi8$pi8(szLocalFilename, szAddAs)) {
        return false;
      }
    }
    return true;
  }

  StartStreaming(fInitial) {
    if (!this.fRecording) {
      return false;
    }
    if (this.fStreaming) {
      return false;
    }
    let sTempFilename = new $.StdCopyStrBuf().init$StdStrBuf$b(this.sFilename);
    $.MakeTempFilename$pStdStrBuf(sTempFilename);
    let saveRec = new $.C4GameSaveRecord().init(fInitial, this.Index, $.Game.Parameters.isLeague(), false);
    if (!saveRec.Save$pi8(sTempFilename.getData())) {
      return false;
    }
    saveRec.Close();
    this.fStreaming = true;
    if (!this.StreamFile(sTempFilename.getData(), this.sFilename.getData())) {
      this.fStreaming = false;
      return false;
    }
    $.EraseFile(sTempFilename.getData());
    this.iStreamingPos = 0;
    return true;
  }

  ClearStreamingBuf(iAmount) {
    this.iStreamingPos = this.iStreamingPos + iAmount >>> 0;
    if (iAmount === $.StdBuf.prototype.getSize.call(this.StreamingData)) {
      $.StdBuf.prototype.Clear.call(this.StreamingData);
    } else {
      $.StdBuf.prototype.Move.call(this.StreamingData, iAmount, $.StdBuf.prototype.getSize.call(this.StreamingData) - iAmount);
      this.StreamingData.SetSize($.StdBuf.prototype.getSize.call(this.StreamingData) - iAmount);
    }
  }

  StopStreaming() {
    this.fStreaming = false;
  }

  GetLogFile() {
    return this.LogRec;
  }

  Stream(Head, sBuf) {
    if (!this.fStreaming) {
      return;
    }
    this.StreamingData.Append$px$u64($bytesView(Head, [["iFrm", 0, "u8", 0], ["Type", 1, "u8", 0]], 2), 2);
    this.StreamingData.Append$px$u64($.StdBuf.prototype.getData.call(sBuf), $.StdBuf.prototype.getSize.call(sBuf));
  }

  StreamFile(szLocalFilename, szAddAs) {
    let FileData = new $.StdBuf();
    if (!$.StdBuf.prototype.LoadFromFile.call(FileData, szLocalFilename)) {
      return false;
    }
    let Packed = $.DecompileToBuf$StdInsertAdapt$StdStrBuf$StdBuf($.mkInsertAdapt$mStdStrBuf$rStdBuf$b(new $.StdStrBuf().init$pi8$b(szAddAs), FileData, false));
    let Head = ((($o) => ($o.iFrm = 0, $o.Type = 48, $o))(new C4RecordChunkHead()));
    this.Stream(Head, Packed);
    return true;
  }

  $clone() { return new C4Record().$assign(this); }
  $assign(o) {
    this.CtrlRec.$assign(o.CtrlRec);
    this.LogRec.$assign(o.LogRec);
    this.sFilename.$assign(o.sFilename);
    this.RecordGrp.$assign(o.RecordGrp);
    this.fRecording = o.fRecording;
    this.iLastFrame = o.iLastFrame;
    this.fStreaming = o.fStreaming;
    this.iStreamingPos = o.iStreamingPos;
    this.StreamingData.$assign(o.StreamingData);
    this.Index = o.Index;
    return this;
  }
}

export class C4Playback {
  chunks = [];
  currChunk = null;
  Finished = true;
  playbackFile = new $.CStdFile().init();
  fLoadSequential = false;
  sequentialBuffer = new $.StdBuf();
  iLastSequentialFrame = 0;
  DebugRec = new $.C4PacketList();

  Finish() {
    this.Clear();
    if ($.Console.Active) {
      $.Game.HaltCount = $.Game.HaltCount + 1 | 0;
      $.Console.UpdateHaltCtrls(!($.Game.HaltCount === 0));
    } else {
      $.Game.DoGameOver();
    }
    $.Control$2.ChangeToLocal();
  }

  init() {
    this.chunks = [];
    this.currChunk = null;
    this.Finished = true;
    this.playbackFile = new $.CStdFile().init();
    this.fLoadSequential = false;
    this.sequentialBuffer = new $.StdBuf();
    this.DebugRec = new $.C4PacketList();
    return this;
  }

  $dtor() {
    C4Playback.prototype.Clear.call(this);
  }

  Open(rGrp) {
    this.Clear();
    this.iLastSequentialFrame = 0;
    let fStrip = false;
    this.fLoadSequential = !rGrp.IsPacked() && !($.Game.RecordDumpFile.getLength() !== 0) && !fStrip;
    let TextBuf = new $.StdStrBuf();
    if (rGrp.LoadEntryString$pi8$pStdStrBuf(S("CtrlRec.txt"), TextBuf)) {
      if (!this.ReadText(TextBuf)) {
        return false;
      }
    } else {
      if (this.fLoadSequential) {
        if (!rGrp.FindEntry$pi8$pStdStrBuf$pu64(S("CtrlRec.ocb"))) {
          return false;
        }
        if (!this.playbackFile.Open($.FormatString(S("%s%c%s"), rGrp.GetFullName().getData(), 47, S("CtrlRec.ocb")).getData())) {
          return false;
        }
        this.currChunk = $end(this.chunks).copy();
        if (!this.NextSequentialChunk()) {
          $.LogFatal(S("Record: Binary read error."));
          return false;
        }
      } else {
        let BinaryBuf = new $.StdBuf();
        if (rGrp.LoadEntry$pi8$pStdBuf(S("CtrlRec.ocb"), BinaryBuf)) {
          if (!this.ReadBinary(BinaryBuf)) {
            return false;
          }
        } else {
          {
            $.LogFatal(S("Record: No control data found!"));
            return false;
          }
        }
      }
    }
    if (fStrip) {
      this.Strip();
    }
    if ($.Game.RecordDumpFile.getLength() !== 0) {
      if ($.SEqualNoCase($.GetExtension($.Game.RecordDumpFile.getData()), S("txt"))) {
        this.ReWriteText().SaveToFile($.Game.RecordDumpFile.getData());
      } else {
        $.StdBuf.prototype.SaveToFile.call(this.ReWriteBinary(), $.Game.RecordDumpFile.getData());
      }
    }
    this.currChunk = $begin(this.chunks).copy();
    this.Finished = false;
    if ($.Config.General.DebugRecExternalFile[0] !== 0 && $.Config.General.DebugRec !== 0) {
      if ($.Config.General.DebugRecWrite !== 0) {
        if (!$.DbgRecFile.Create(P($.Config.General.DebugRecExternalFile, 0))) {
          $.LogFatal($.FormatString(S("DbgRec: Creation of external file \"%s\" failed!"), P($.Config.General.DebugRecExternalFile, 0)).getData());
          return false;
        } else {
          $.LogF(S("DbgRec: Writing to \"%s\"..."), P($.Config.General.DebugRecExternalFile, 0));
        }
      } else {
        if (!$.DbgRecFile.Open(P($.Config.General.DebugRecExternalFile, 0))) {
          $.LogFatal($.FormatString(S("DbgRec: Opening of external file \"%s\" failed!"), P($.Config.General.DebugRecExternalFile, 0)).getData());
          return false;
        } else {
          $.LogF(S("DbgRec: Checking against \"%s\"..."), P($.Config.General.DebugRecExternalFile, 0));
        }
      }
    }
    return true;
  }

  ReadBinary(Buf) {
    let pUseBuf = null;
    let iFrame = 0;
    if (this.fLoadSequential) {
      this.sequentialBuffer.Append$StdBuf(Buf);
      pUseBuf = this.sequentialBuffer;
      iFrame = this.iLastSequentialFrame;
    } else {
      pUseBuf = Buf;
    }
    let iPos = 0;
    let fFinished = false;
    do {
      if ($.StdBuf.prototype.getSize.call(pUseBuf) - iPos < 2) {
        break;
      }
      let pHead = $.getBufPtr(pUseBuf, iPos);
      iPos = iPos + 2;
      let Chunk = pUseBuf.getPart(iPos, $.StdBuf.prototype.getSize.call(pUseBuf) - iPos);
      let c = new C4RecordChunk().init();
      c.Frame = iFrame + pHead.iFrm >>> 0 | 0;
      c.Type = pHead.Type;
      try {
        let Compiler = new $.StdCompilerBinRead().None();
        Compiler.setInput$mInT($.StdBuf.prototype.getRef.call(Chunk));
        Compiler.Begin();
        switch (pHead.Type) {
          case 0:
            Compiler.Value$StdPtrAdapt$C4Control($.mkPtrAdaptNoNull$rpC4Control(P(c.$u1, "pCtrl")));
            break;
          case 1:
            Compiler.Value$StdPtrAdapt$C4IDPacket($.mkPtrAdaptNoNull$rpC4IDPacket(P(c.$u1, "pPkt")));
            break;
          case 16:
            fFinished = true;
            break;
          case 48:
            Compiler.Value$rStdCopyStrBuf(c.Filename);
            Compiler.Value$StdPtrAdapt$StdBuf($.mkPtrAdaptNoNull$rpStdBuf(P(c.$u1, "pFileData")));
            break;
          default:
            if (pHead.Type >= 128) {
              Compiler.Value$StdPtrAdapt$C4PktDebugRec($.mkPtrAdaptNoNull$rpC4PktDebugRec(P(c.$u1, "pDbg")));
            }
        }
        Compiler.End();
        iPos = iPos + Compiler.getPosition$v();
      } catch ($e2) {
        if ($e2 instanceof $.StdCompiler$EOFException) {
          const pEx = $e2;
          if (this.fLoadSequential) {
            iPos = iPos - 2;
            $delete(pEx);
            break;
          }
          $.LogF(S("Record: Binary unpack error: %s"), pEx.Msg.getData());
          c.Delete();
          $delete(pEx);
          return false;
        } else if ($e2 instanceof $.StdCompiler$Exception) {
          const pEx = $e2;
          $.LogF(S("Record: Binary unpack error: %s"), pEx.Msg.getData());
          c.Delete();
          $delete(pEx);
          return false;
        } else {
          throw $e2;
        }
      }
      $vpush(this.chunks, c.$clone());
      c.$u1.pPkt = null;
      iFrame = c.Frame >>> 0;
    } while (!fFinished);
    if (this.fLoadSequential) {
      if (iPos >= $.StdBuf.prototype.getSize.call(this.sequentialBuffer)) {
        $.StdBuf.prototype.Clear.call(this.sequentialBuffer);
      } else if (iPos !== 0) {
        $.StdBuf.prototype.Move.call(this.sequentialBuffer, iPos, $.StdBuf.prototype.getSize.call(this.sequentialBuffer) - iPos);
        $.StdBuf.prototype.Shrink.call(this.sequentialBuffer, iPos);
      }
      this.iLastSequentialFrame = iFrame;
    }
    return true;
  }

  ReadText(Buf) {
    return $.CompileFromBuf_LogWarn$mStdNamingAdapt$StdSTLContainerAdapt$list$C4RecordChunk$x$pi8($.mkNamingAdapt$mStdSTLContainerAdapt$list$C4RecordChunk$pi8($.mkSTLContainerAdapt$rlist$i32(this.chunks), S("Rec")), Buf, S("CtrlRec.txt"));
  }

  NextChunk() {
    0;
    this.currChunk.inc();
    if (!this.currChunk.eq($end(this.chunks))) {
      return;
    }
    if (!this.fLoadSequential) {
      return;
    }
    for (const chunk of this.chunks) {
      chunk.Delete();
    }
    this.chunks.length = 0;
    this.currChunk = $end(this.chunks).copy();
    this.NextSequentialChunk();
  }

  NextSequentialChunk() {
    let BinaryBuf = new $.StdBuf();
    const iRealSize = [0];
    BinaryBuf.New(4096);
    for (; ; ) {
      iRealSize[0] = 0;
      this.playbackFile.Read$px$u64$pu64($.StdBuf.prototype.getMData.call(BinaryBuf), 4096, P(iRealSize, 0));
      if (iRealSize[0] === 0) {
        return false;
      }
      BinaryBuf.SetSize(iRealSize[0]);
      if (!this.ReadBinary(BinaryBuf)) {
        return false;
      }
      if (this.chunks.length !== 0) {
        this.currChunk = $begin(this.chunks).copy();
        return true;
      }
    }
    return false;
  }

  ReWriteText() {
    let Output = new $.StdStrBuf();
    for (let i = $begin(this.chunks); !i.eq($end(this.chunks)); i.postinc()) {
      Output.Append$StdStrBuf($.DecompileToBuf$StdNamingAdapt$StdDecompileAdapt$C4RecordChunk($.mkNamingAdapt$mStdDecompileAdapt$C4RecordChunk$pi8($.mkDecompileAdapt$C4RecordChunk(i.v), S("Rec"))));
      Output.Append$pi8(S("\n\n"));
    }
    return Output;
  }

  ReWriteBinary() {
    let OUTPUT_GROW = 16384;
    let Output = new $.StdBuf();
    let iPos = 0;
    let fFinished = false;
    let iFrame = 0;
    for (let i = $begin(this.chunks); !fFinished && !i.eq($end(this.chunks)); i.postinc()) {
      if ((i.v.Frame - iFrame | 0) < 0 || (i.v.Frame - iFrame | 0) > 255) {
        $.LogF(S("ERROR: Invalid frame difference between chunks (0-255 allowed)! Data will be invalid!"));
      }
      let Chunk = new $.StdBuf();
      try {
        switch (i.v.Type) {
          case 0:
            Chunk.op_assign$mStdBuf($.DecompileToBuf$C4Control(i.v.$u1.pCtrl));
            break;
          case 1:
            Chunk.op_assign$mStdBuf($.DecompileToBuf$C4IDPacket(i.v.$u1.pPkt));
            break;
          case 16:
            fFinished = true;
            break;
          default:
            if (i.v.$u1.pDbg != null) {
              Chunk.op_assign$mStdBuf($.DecompileToBuf$C4PktDebugRec(i.v.$u1.pDbg));
            }
            break;
        }
      } catch ($e2) {
        if ($e2 instanceof $.StdCompiler$Exception) {
          const pEx = $e2;
          $.LogF(S("Record: Binary unpack error: %s"), pEx.Msg.getData());
          $delete(pEx);
          return new $.StdBuf();
        } else {
          throw $e2;
        }
      }
      while ($.StdBuf.prototype.getSize.call(Output) - $u64n(iPos) < 2 + $.StdBuf.prototype.getSize.call(Chunk)) {
        $.StdBuf.prototype.Grow.call(Output, 16384);
      }
      let pHead = $.getMBufPtr(Output, $u64n(iPos));
      pHead.Type = i.v.Type;
      pHead.iFrm = (i.v.Frame - iFrame | 0) & 0xff;
      iPos = $u64n(iPos) + 2 | 0;
      iFrame = i.v.Frame;
      Output.Write$StdBuf$u64(Chunk, $u64n(iPos));
      iPos = $u64n(iPos) + $.StdBuf.prototype.getSize.call(Chunk) | 0;
    }
    Output.SetSize($u64n(iPos));
    return Output;
  }

  Strip() {
    let fStripPlayers = false;
    let fStripSyncChecks = false;
    let fStripDebugRec = true;
    let fCheckCheat = false;
    let fStripMessages = true;
    let iEndFrame = -1;
    for (let i = $begin(this.chunks); !i.eq($end(this.chunks)); ) {
      if (false && i.v.Frame > -1) {
        while (!i.eq($end(this.chunks))) {
          i.v.Delete();
          i = seq_erase(this.chunks, $itcopy(i)).copy();
        }
        let EndChunk = new C4RecordChunk().init();
        EndChunk.Frame = -1;
        EndChunk.Type = 16;
        $vpush(this.chunks, EndChunk.$clone());
        break;
      }
      switch (i.v.Type) {
        case 0:
          {
            let pCtrl = i.v.$u1.pCtrl;
            for (let pPkt = pCtrl.firstPkt(), pNext = null; pPkt != null; pPkt = pNext) {
              pNext = pCtrl.nextPkt(pPkt);
              switch (pPkt.getPktType()) {
                case 145:
                  if (false) {
                    let pJoinPlr = pPkt.getPkt();
                    pJoinPlr.Strip();
                  }
                  break;
                case 136:
                case 176:
                case 177:
                case 178:
                case 179:
                  if (false) {
                    $.Log($.DecompileToBuf$StdNamingAdapt$C4IDPacket($.mkNamingAdapt$rC4IDPacket$pi8(pPkt, $.FormatString(S("Frame %d"), i.v.Frame).getData())).getData());
                  }
                  break;
                case 133:
                  if (false) {
                    i.v.$u1.pCtrl.Remove(pPkt);
                  }
                  break;
                default:
                  break;
              }
            }
            if (!(pCtrl.firstPkt() != null)) {
              i.v.Delete();
              i = seq_erase(this.chunks, $itcopy(i)).copy();
            } else {
              i.postinc();
            }
          }
          break;
        case 1:
          {
            let fStripThis = false;
            switch (i.v.$u1.pPkt.getPktType()) {
              case 136:
              case 176:
              case 177:
              case 178:
              case 179:
                if (false) {
                  $.Log($.DecompileToBuf$StdNamingAdapt$C4IDPacket($.mkNamingAdapt$rC4IDPacket$pi8(i.v.$u1.pPkt, $.FormatString(S("Frame %d"), i.v.Frame).getData())).getData());
                }
                break;
              case 133:
                if (false) {
                  fStripThis = true;
                }
                break;
              case 163:
                if (true) {
                  fStripThis = true;
                }
                break;
              default:
                break;
            }
            if (fStripThis) {
              i.v.Delete();
              i = seq_erase(this.chunks, $itcopy(i)).copy();
            } else {
              i.postinc();
            }
          }
          break;
        case 16:
          i.postinc();
          break;
        default:
          if (true) {
            i.v.Delete();
            i = seq_erase(this.chunks, $itcopy(i)).copy();
          } else {
            i.postinc();
          }
      }
    }
  }

  ExecuteControl(pCtrl, iFrame) {
    if (this.currChunk.eq($end(this.chunks))) {
      return false;
    }
    if (this.Finished) {
      this.Finish();
      return false;
    }
    if ($.Config.General.DebugRec !== 0) {
      if (this.DebugRec.firstPkt() != null) {
        this.DebugRecError(S("Debug rec overflow!"));
      }
      this.DebugRec.Clear();
    }
    while (!this.currChunk.eq($end(this.chunks)) && this.currChunk.v.Frame <= iFrame) {
      switch (this.currChunk.v.Type) {
        case 0:
          pCtrl.Append$C4Control(this.currChunk.v.$u1.pCtrl);
          break;
        case 1:
          {
            let Packet = new $.C4IDPacket().$copy(this.currChunk.v.$u1.pPkt);
            pCtrl.Add$i32$pC4ControlPacket(Packet.getPktType(), Packet.getPkt());
            Packet.Default();
            break;
          }
        case 16:
          this.Finished = true;
          break;
        default:
          if ($.Config.General.DebugRec !== 0) {
            if (this.currChunk.v.$u1.pDbg != null) {
              this.DebugRec.Add$i32$pC4PacketBase(192 /*CID_DebugRec*/, this.currChunk.v.$u1.pDbg);
              this.currChunk.v.$u1.pDbg = null;
            }
            break;
          }
      }
      this.NextChunk();
    }
    return true;
  }

  IsFinished() {
    return this.Finished;
  }

  Clear() {
    for (const chunk of this.chunks) {
      chunk.Delete();
    }
    this.chunks.length = 0;
    this.currChunk = $end(this.chunks).copy();
    this.playbackFile.Close$ppStdBuf();
    $.StdBuf.prototype.Clear.call(this.sequentialBuffer);
    this.fLoadSequential = false;
    if ($.Config.General.DebugRec !== 0) {
      let pkt = null;
      while ((pkt = this.DebugRec.firstPkt()) != null) {
        this.DebugRec.Delete(pkt);
      }
      if ($.Config.General.DebugRecExternalFile[0] !== 0) {
        $.DbgRecFile.Close$ppStdBuf();
      }
    }
    this.Finished = true;
  }

  Check(eType$, pData, iSize) {
    const eType = [eType$];
    if ($.DoNoDebugRec > 0) {
      return;
    }
    if ($.Game.FrameCounter < 0) {
      return;
    }
    let PktInReplay = new C4PktDebugRec().init$v();
    let fHasPacketFromHead = false;
    if ($.Config.General.DebugRecExternalFile[0] !== 0) {
      if ($.Config.General.DebugRecWrite !== 0) {
        $.DbgRecFile.Write(P(eType, 0), 4);
        const iSize32 = [iSize];
        $.DbgRecFile.Write(P(iSize32, 0), 4);
        $.DbgRecFile.Write(pData, iSize);
        return;
      } else {
        const iSize32 = [0];
        const eTypeRec = [255 /*RCT_Undefined*/];
        $.DbgRecFile.Read$px$u64(P(eTypeRec, 0), 4);
        $.DbgRecFile.Read$px$u64(P(iSize32, 0), 4);
        if (iSize32[0] !== 0) {
          let buf = new $.StdBuf();
          buf.SetSize($u64n(iSize32[0]));
          $.DbgRecFile.Read$px$u64($.StdBuf.prototype.getMData.call(buf), $u64n(iSize32[0]));
          PktInReplay.$assign(new C4PktDebugRec().init$i32$StdBuf(eTypeRec[0], buf));
        }
      }
    } else {
      let pkt = null;
      if ((pkt = this.DebugRec.firstPkt()) != null) {
        PktInReplay.$assign(pkt.getPkt());
        this.DebugRec.Delete(pkt);
      } else {
        while (!this.currChunk.eq($end(this.chunks)) && this.currChunk.v.Type === 1) {
          let Packet = new $.C4IDPacket().$copy(this.currChunk.v.$u1.pPkt);
          let pCtrlPck = Packet.getPkt();
          0;
          $.Control$2.ExecControlPacket(Packet.getPktType(), pCtrlPck);
          this.NextChunk();
        }
        if (this.currChunk.eq($end(this.chunks)) || this.currChunk.v.Type === 16 || this.Finished) {
          $.Log(S("DebugRec end: All in sync!"));
          $.DoNoDebugRec = $.DoNoDebugRec + 1 | 0;
          return;
        }
        if (this.currChunk.v.Type !== eType[0]) {
          this.DebugRecError($.FormatString(S("Playback type %x, this type %x"), this.currChunk.v.Type, eType[0]).getData());
          return;
        }
        if (this.currChunk.v.$u1.pDbg != null) {
          PktInReplay.$assign(this.currChunk.v.$u1.pDbg);
        }
        fHasPacketFromHead = true;
      }
    }
    if (PktInReplay.getType() === 16) {
      $.Log(S("DebugRec end: All in sync (2)!"));
      $.DoNoDebugRec = $.DoNoDebugRec + 1 | 0;
      return;
    }
    if (PktInReplay.getType() !== eType[0]) {
      this.DebugRecError($.FormatString(S("Type %s != %s"), GetRecordChunkTypeName(PktInReplay.getType()), GetRecordChunkTypeName(eType[0])).getData());
      return;
    }
    if (PktInReplay.getSize() !== iSize >>> 0) {
      this.DebugRecError($.FormatString(S("Size %d != %d"), PktInReplay.getSize() | 0, iSize).getData());
    }
    if (c$memcmp(PktInReplay.getData(), pData, $u64n(iSize)) !== 0) {
      let sErr = new $.StdStrBuf();
      sErr.Format(S("DbgRecPkt Type %s, size %d"), GetRecordChunkTypeName(eType[0]), iSize);
      sErr.Append$pi8(S(" Replay: "));
      let replay = new $.StdBuf().init$px$u64$b(PktInReplay.getData(), PktInReplay.getSize());
      sErr.Append$StdStrBuf(GetDbgRecPktData(eType[0], replay));
      sErr.Append$pi8(S(" Here: "));
      let here = new $.StdBuf().init$px$u64$b(pData, $u64n(iSize));
      sErr.Append$StdStrBuf(GetDbgRecPktData(eType[0], here));
      this.DebugRecError(sErr.getData());
    }
    if (fHasPacketFromHead) {
      this.NextChunk();
    }
  }

  DebugRecError(szError) {
    $.LogF(S("Playback error: %s"), szError);
    0;
  }

  static StreamToRecord(..._) { return $missing("C4Playback::StreamToRecord"); }

  $clone() { return new C4Playback().$assign(this); }
  $assign(o) {
    this.chunks = o.chunks.slice();
    this.currChunk = o.currChunk.$clone();
    this.Finished = o.Finished;
    this.playbackFile.$assign(o.playbackFile);
    this.fLoadSequential = o.fLoadSequential;
    this.sequentialBuffer.$assign(o.sequentialBuffer);
    this.iLastSequentialFrame = o.iLastSequentialFrame;
    this.DebugRec.$assign(o.DebugRec);
    return this;
  }
}

export class C4PktDebugRec extends C4PktBuf {
  eType = 255 /*RCT_Undefined*/;

  init$v() {
    this.eType = 255 /*RCT_Undefined*/;
    return this;
  }

  init$i32$StdBuf(eType, rCpyData) {
    super.init$StdBuf(rCpyData);
    this.eType = eType;
    return this;
  }

  getType() {
    return this.eType;
  }

  CompileFunc$pStdCompiler(pComp) {
    pComp.Value$StdNamingAdapt$StdIntAdapt$i32$i32($.mkNamingAdapt$mStdIntAdapt$i32$i32$pi8($.mkIntAdapt$ri32$2(P(this, "eType")), S("Type")));
    $.C4PktBuf.prototype.CompileFunc$pStdCompiler.call(this, pComp);
  }

  $clone() { return new C4PktDebugRec().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.eType = o.eType;
    return this;
  }
}



export function AddDbgRec(eType, pData = null, iSize = 0) {
  $.Control$2.DbgRec(eType, $reinterpVoid(pData, "u8"), $u64n(iSize));
}

export function GetRecordChunkTypeName(eType) {
  switch (eType) {
    case 0:
      return S("Ctrl");
    case 1:
      return S("CtrlPkt");
    case 2:
      return S("Frame");
    case 16:
      return S("End");
    case 32:
      return S("Log");
    case 48:
      return S("File");
    case 130:
      return S("Block");
    case 131:
      return S("SetPix");
    case 132:
      return S("ExecObj");
    case 133:
      return S("Random");
    case 134:
      return S("Rn3");
    case 135:
      return S("MMC");
    case 136:
      return S("MMD");
    case 137:
      return S("CrObj");
    case 138:
      return S("DsObj");
    case 139:
      return S("GetPix");
    case 140:
      return S("RotVtx1");
    case 141:
      return S("RotVtx2");
    case 142:
      return S("ExecPXS");
    case 143:
      return S("Sin");
    case 144:
      return S("Cos");
    case 145:
      return S("Map");
    case 146:
      return S("Ls");
    case 147:
      return S("MCT1");
    case 148:
      return S("MCT2");
    case 154:
      return S("AulFunc");
    case 155:
      return S("ObjCom");
    case 156:
      return S("PlrCom");
    case 157:
      return S("PlrInCom");
    case 158:
      return S("MatScan");
    case 159:
      return S("MatScanDo");
    case 160:
      return S("Area");
    case 161:
      return S("MenuAdd");
    case 162:
      return S("MenuAddC");
    case 163:
      return S("OCF");
    case 164:
      return S("DirectExec");
    case 165:
      return S("Definition");
    case 192:
      return S("Custom");
    case 255:
    default:
      return S("Undefined");
  }
  ;
}

export function GetDbgRecPktData(eType, RawData) {
  let r = new $.StdStrBuf();
  switch (eType) {
    case 154:
      r.Ref$pi8$u64($reinterpVoid($.StdBuf.prototype.getData.call(RawData), "i8"), $.StdBuf.prototype.getSize.call(RawData) - 1);
      break;
    default:
      for (let i = 0; i < $.StdBuf.prototype.getSize.call(RawData); i = i + 1 >>> 0) {
        r.AppendFormat(S("%02x "), $rd($.getBufPtr$5(RawData, i)));
      }
      break;
  }
  return r;
}

export function $init(): void {
  $.DbgRecFile = new $.CStdFile(); $.DbgRecFile.init();
  $.DoNoDebugRec = 0;
}

Object.assign($, { AddDbgRec, C4DebugRecOff, C4PktDebugRec, C4Playback, C4RCArea, C4RCCreateObj, C4RCExecObj, C4RCExecPXS, C4RCMassMover, C4RCMatScan, C4RCMenuAdd, C4RCOCF, C4RCObjectCom, C4RCPos, C4RCRandom, C4RCRotVtx, C4RCSetPix, C4RCSin, C4RCTrf, C4Record, C4RecordChunk, C4RecordChunk$$anon1, C4RecordChunkHead, GetDbgRecPktData, GetRecordChunkTypeName });
