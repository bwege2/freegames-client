// @ts-nocheck
// OpenClonk 36de799: src/network/C4Network2Stats.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { C4ApplicationSec1Timer } from '../platform/StdScheduler.ts';
import { $u64n, ftoi32 } from '../../rt/int.ts';
import { $peq, $rd, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $begin, $delete, $end, $itcopy, $max, $min, $mixin, seq_erase, std_find } from '../../rt/std.ts';

export class C4Graph {
  szTitle = new $.StdStrBuf();
  dwColor = 0x7fff0000;

  init() {
    this.szTitle = new $.StdStrBuf().init$pi8$b($.LoadResStr(S("IDS_NET_GRAPH")));
    this.dwColor = 0x7fff0000;
    return this;
  }

  SetTitle(szNewTitle) {
    this.szTitle.Copy$pi8(szNewTitle);
  }

  SetColorDw(dwClr) {
    this.dwColor = dwClr;
  }

  GetColorDw() {
    return this.dwColor;
  }

  GetTitle() {
    return this.szTitle.getData();
  }

  Update() {
  }

  $clone() { return new C4Graph().$assign(this); }
  $assign(o) {
    this.szTitle.$assign(o.szTitle);
    this.dwColor = o.dwColor;
    return this;
  }
}

export class C4GraphCollection extends Array {
  iCommonAvgTime = 0;
  fMultiplier = Math.fround(0);
  szTitle = new $.StdStrBuf();
  dwColor = 0x7fff0000;

  init() {
    C4Graph.prototype.init.call(this);
    this.iCommonAvgTime = 0;
    this.fMultiplier = Math.fround(0);
    return this;
  }

  GetStartTime() {
    let i = $begin(this);
    if (i.eq($end(this))) {
      return 0;
    }
    let iTime = i.v.GetStartTime();
    while (!i.inc().eq($end(this))) {
      iTime = $min(iTime, i.v.GetStartTime());
    }
    return iTime;
  }

  GetEndTime() {
    let i = $begin(this);
    if (i.eq($end(this))) {
      return 0;
    }
    let iTime = i.v.GetEndTime();
    while (!i.inc().eq($end(this))) {
      iTime = $max(iTime, i.v.GetEndTime());
    }
    return iTime;
  }

  GetValue(_iAtTime) {
    0;
    return Math.fround(0);
  }

  GetMedianValue(_iStartTime, _iEndTime) {
    0;
    return Math.fround(0);
  }

  GetMinValue() {
    let i = $begin(this);
    if (i.eq($end(this))) {
      return Math.fround(0);
    }
    let iVal = i.v.GetMinValue();
    while (!i.inc().eq($end(this))) {
      iVal = $min(iVal, i.v.GetMinValue());
    }
    return iVal;
  }

  GetMaxValue() {
    let i = $begin(this);
    if (i.eq($end(this))) {
      return Math.fround(0);
    }
    let iVal = i.v.GetMaxValue();
    while (!i.inc().eq($end(this))) {
      iVal = $max(iVal, i.v.GetMaxValue());
    }
    return iVal;
  }

  GetSeriesCount() {
    let $t1, $t2, $t3;
    let iCount = 0;
    $t1 = this;
    $t2 = $begin($t1);
    $t3 = $end($t1);
    for (; !$t2.eq($t3); $t2.inc()) {
      const i = $t2.v;
      iCount = iCount + i.GetSeriesCount() | 0;
    }
    return iCount;
  }

  GetSeries(iIndex) {
    let $t1, $t2, $t3;
    $t1 = this;
    $t2 = $begin($t1);
    $t3 = $end($t1);
    for (; !$t2.eq($t3); $t2.inc()) {
      const i = $t2.v;
      let iCnt = i.GetSeriesCount();
      if (iIndex < iCnt) {
        return i.GetSeries(iIndex);
      }
      iIndex = iIndex - iCnt | 0;
    }
    return null;
  }

  AddGraph(pAdd) {
    this.push(pAdd);
    if (this.iCommonAvgTime !== 0) {
      pAdd.SetAverageTime(this.iCommonAvgTime);
    }
    if (this.fMultiplier !== 0) {
      pAdd.SetMultiplier(this.fMultiplier);
    }
  }

  RemoveGraph(pRemove) {
    let i = std_find($begin(this), $end(this), pRemove);
    if (!i.eq($end(this))) {
      seq_erase(this, $itcopy(i));
    }
  }

  Update() {
    let $t1, $t2, $t3;
    $t1 = this;
    $t2 = $begin($t1);
    $t3 = $end($t1);
    for (; !$t2.eq($t3); $t2.inc()) {
      const i = $t2.v;
      i.Update();
    }
  }

  SetAverageTime(iToTime) {
    let $t1, $t2, $t3;
    if ((this.iCommonAvgTime = iToTime) !== 0) {
      $t1 = this;
      $t2 = $begin($t1);
      $t3 = $end($t1);
      for (; !$t2.eq($t3); $t2.inc()) {
        const i = $t2.v;
        i.SetAverageTime(iToTime);
      }
    }
  }

  SetMultiplier(fToVal) {
    let $t1, $t2, $t3;
    if ((this.fMultiplier = fToVal) !== 0) {
      $t1 = this;
      $t2 = $begin($t1);
      $t3 = $end($t1);
      for (; !$t2.eq($t3); $t2.inc()) {
        const i = $t2.v;
        i.SetMultiplier(fToVal);
      }
    }
  }

  $clone() { return new C4GraphCollection().$assign(this); }
  $assign(o) {
    this.length = 0;
    for (const x of o) this.push(x && x.$clone ? x.$clone() : x);
    this.iCommonAvgTime = o.iCommonAvgTime;
    this.fMultiplier = o.fMultiplier;
    this.szTitle.$assign(o.szTitle);
    this.dwColor = o.dwColor;
    return this;
  }
}

export class C4TableGraph extends C4Graph {
  iBackLogLength = 0;
  pValues = null;
  fMultiplier = Math.fround(1);
  pAveragedValues = null;
  iBackLogPos = 0;
  fWrapped = false;
  iInitialStartTime = 0;
  iTime = 0;
  iAveragedTime = 0;
  szDumpFile = new $.StdStrBuf();
  iAvgRange = 1;

  init(iBackLogLength = 256, iStartTime = 0) {
    super.init();
    this.iBackLogLength = iBackLogLength;
    this.pValues = null;
    this.fMultiplier = Math.fround(1);
    this.pAveragedValues = null;
    this.iBackLogPos = 0;
    this.fWrapped = false;
    this.iInitialStartTime = iStartTime;
    this.iTime = iStartTime;
    this.iAveragedTime = iStartTime;
    this.szDumpFile = new $.StdStrBuf();
    this.iAvgRange = 1;
    0;
    this.pValues = this.pAveragedValues = P(new Float32Array($u64n(iBackLogLength)), 0);
    this.pValues.a[this.pValues.o] = Math.fround(0);
    return this;
  }

  $dtor() {
    C4TableGraph.prototype.Reset.call(this, -1);
    if (!$peq(this.pValues, this.pAveragedValues)) {
      $delete(this.pAveragedValues);
    }
    $delete(this.pValues);
  }

  Reset(iToTime) {
    if (!this.szDumpFile.op_not()) {
      this.DumpToFile(this.szDumpFile, this.fWrapped);
    }
    this.iInitialStartTime = this.iTime = iToTime;
    this.fWrapped = false;
    this.iBackLogPos = 0;
    this.pValues.a[this.pValues.o] = Math.fround(0);
  }

  SetDumpFile(szFile) {
    this.szDumpFile.$assign(szFile);
  }

  GetStartTime() {
    if (this.fWrapped) {
      return this.iTime - this.iBackLogLength | 0;
    }
    return this.iTime - this.iBackLogPos | 0;
  }

  GetEndTime() {
    return this.iTime;
  }

  GetValue(iAtTime) {
    0;
    return Math.fround(this.pAveragedValues.a[this.pAveragedValues.o + (iAtTime - this.iInitialStartTime | 0) % this.iBackLogLength] * this.fMultiplier);
  }

  GetAtValue(iAtTime) {
    0;
    return this.pValues.a[this.pValues.o + (iAtTime - this.iInitialStartTime | 0) % this.iBackLogLength];
  }

  SetAvgValue(iAtTime, iValue) {
    0;
    this.pAveragedValues.a[this.pAveragedValues.o + (iAtTime - this.iInitialStartTime | 0) % this.iBackLogLength] = iValue;
  }

  GetMedianValue(iStartTime, iEndTime) {
    0;
    if (this.iBackLogPos === 0 && !this.fWrapped) {
      return Math.fround(0);
    }
    let iSum = this.GetValue(iStartTime);
    let iNum = Math.fround(1);
    for (; (iStartTime = iStartTime + 1 | 0) < iEndTime; iNum = Math.fround(iNum + 1)) {
      iSum = Math.fround(iSum + this.GetValue(iStartTime));
    }
    return Math.fround(iSum / iNum);
  }

  GetMinValue() {
    let $t1, $t2;
    let iPos0 = this.iBackLogPos !== 0 ? this.iBackLogPos - 1 | 0 : this.iBackLogPos;
    let iMinVal = this.pAveragedValues.a[this.pAveragedValues.o + iPos0];
    let i = iPos0;
    let p = this.pAveragedValues;
    while (($t1 = i, i = i - 1 | 0, $t1) !== 0) {
      iMinVal = $min(iMinVal, $rd(($t2 = p, p = p.add(1), $t2)));
    }
    if (this.fWrapped) {
      i = this.iBackLogLength - iPos0 | 0;
      while ((i = i - 1 | 0) !== 0) {
        iMinVal = $min(iMinVal, $rd((p = p.add(1))));
      }
    }
    return Math.fround(iMinVal * this.fMultiplier);
  }

  GetMaxValue() {
    let $t1, $t2;
    let iPos0 = this.iBackLogPos !== 0 ? this.iBackLogPos - 1 | 0 : this.iBackLogPos;
    let iMaxVal = this.pAveragedValues.a[this.pAveragedValues.o + iPos0];
    let i = iPos0;
    let p = this.pAveragedValues;
    while (($t1 = i, i = i - 1 | 0, $t1) !== 0) {
      iMaxVal = $max(iMaxVal, $rd(($t2 = p, p = p.add(1), $t2)));
    }
    if (this.fWrapped) {
      i = this.iBackLogLength - iPos0 | 0;
      while ((i = i - 1 | 0) !== 0) {
        iMaxVal = $max(iMaxVal, $rd((p = p.add(1))));
      }
    }
    return Math.fround(iMaxVal * this.fMultiplier);
  }

  RecordValue(iValue) {
    this.pValues.a[this.pValues.o + this.iBackLogPos] = iValue;
    this.iTime = this.iTime + 1 | 0;
    if ((this.iBackLogPos = this.iBackLogPos + 1 | 0) >= this.iBackLogLength) {
      if (!this.szDumpFile.op_not()) {
        this.DumpToFile(this.szDumpFile, this.fWrapped);
      }
      this.fWrapped = true;
      this.iBackLogPos = 0;
    }
  }

  DumpToFile(rszFilename, fAppend) {
    0;
    if (!this.fWrapped && this.iBackLogPos === 0) {
      return false;
    }
    let out = new $.CStdFile().init();
    if (fAppend) {
      if (!out.Append(rszFilename.getData())) {
        fAppend = false;
      }
    }
    if (!fAppend) {
      if (!out.Create(rszFilename.getData())) {
        return false;
      }
      out.WriteString(S("t\tv\n\r"));
    }
    let iEndTime = this.GetEndTime();
    let buf = new $.StdStrBuf();
    for (let iWriteTime = this.GetStartTime(); iWriteTime < iEndTime; iWriteTime = iWriteTime + 1 | 0) {
      buf.Format(S("%d\t%d\n\r"), iWriteTime, ftoi32(this.GetValue(iWriteTime)));
      out.WriteString(buf.getData());
    }
    return true;
  }

  GetSeriesCount() {
    return 1;
  }

  GetSeries(iIndex) {
    return iIndex !== 0 ? null : this;
  }

  SetAverageTime(iToTime) {
    if (this.iAveragedTime === iToTime) {
      return;
    }
    0;
    this.iAvgRange = iToTime;
    this.iAveragedTime = this.iInitialStartTime;
  }

  Update() {
    if ($peq(this.pAveragedValues, this.pValues)) {
      if (this.iAvgRange === 1) {
        return;
      }
      this.pAveragedValues = P(new Float32Array($u64n(this.iBackLogLength)), 0);
    }
    if (this.iAveragedTime === this.iTime) {
      return;
    }
    0;
    let iStartTime = this.GetStartTime();
    let iAvgFwRange = this.iAvgRange / 4 | 0;
    for (let iUpdateTime = $max((this.iAveragedTime - iAvgFwRange | 0) - 1 | 0, iStartTime); iUpdateTime < this.iTime; iUpdateTime = iUpdateTime + 1 | 0) {
      let iSum = Math.fround(0);
      let iSumWeight = Math.fround(0);
      let iWeight = 0;
      for (let iSumTime = $max(iUpdateTime - this.iAvgRange | 0, iStartTime); iSumTime < $min((iUpdateTime + iAvgFwRange | 0) + 1 | 0, this.iTime); iSumTime = iSumTime + 1 | 0) {
        iWeight = Math.fround(Math.fround(Math.fround(this.iAvgRange) - Math.fround($.Abs$i32(iUpdateTime - iSumTime | 0))) + Math.fround(1));
        iSum = Math.fround(iSum + Math.fround(this.GetAtValue(iSumTime) * iWeight));
        iSumWeight = Math.fround(iSumWeight + iWeight);
      }
      this.SetAvgValue(iUpdateTime, Math.fround(iSum / iSumWeight));
    }
    this.iAveragedTime = this.iTime;
  }

  SetMultiplier(fToVal) {
    this.fMultiplier = fToVal;
  }

  $clone() { return new C4TableGraph().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.iBackLogLength = o.iBackLogLength;
    this.pValues = o.pValues;
    this.fMultiplier = o.fMultiplier;
    this.pAveragedValues = o.pAveragedValues;
    this.iBackLogPos = o.iBackLogPos;
    this.fWrapped = o.fWrapped;
    this.iInitialStartTime = o.iInitialStartTime;
    this.iTime = o.iTime;
    this.iAveragedTime = o.iAveragedTime;
    this.szDumpFile.$assign(o.szDumpFile);
    this.iAvgRange = o.iAvgRange;
    return this;
  }
}

export class C4Network2Stats extends C4ApplicationSec1Timer {
  statObjCount = new C4TableGraph().init();
  statFPS = new C4TableGraph().init();
  statNetI = new C4TableGraph().init();
  statNetO = new C4TableGraph().init();
  graphNetIO = new C4GraphCollection().init();
  statPings = new C4GraphCollection().init();
  statControls = new C4GraphCollection().init();
  statActions = new C4GraphCollection().init();
  SecondCounter = 0;
  ControlCounter = 0;

  init() {
    super.init();
    this.statObjCount = new C4TableGraph().init();
    this.statFPS = new C4TableGraph().init();
    this.statNetI = new C4TableGraph().init();
    this.statNetO = new C4TableGraph().init();
    this.graphNetIO = new C4GraphCollection().init();
    this.statPings = new C4GraphCollection().init();
    this.statControls = new C4GraphCollection().init();
    this.statActions = new C4GraphCollection().init();
    $.StdScheduler.prototype.Add$pStdSchedulerProc.call($.Application, this);
    this.SecondCounter = 0;
    this.ControlCounter = 0;
    this.statObjCount.SetTitle($.LoadResStr(S("IDS_MSG_OBJCOUNT")));
    this.statFPS.SetTitle($.LoadResStr(S("IDS_MSG_FPS")));
    this.statNetI.SetTitle($.LoadResStr(S("IDS_NET_INPUT")));
    this.statNetI.SetColorDw(65280);
    this.statNetO.SetTitle($.LoadResStr(S("IDS_NET_OUTPUT")));
    this.statNetO.SetColorDw(0xff0000);
    this.graphNetIO.AddGraph(this.statNetI);
    this.graphNetIO.AddGraph(this.statNetO);
    this.statControls.SetTitle($.LoadResStr(S("IDS_NET_CONTROL")));
    this.statControls.SetAverageTime(100);
    this.statActions.SetTitle($.LoadResStr(S("IDS_NET_APM")));
    this.statActions.SetAverageTime(100);
    for (let pPlr = $.Players.First; pPlr != null; pPlr = pPlr.Next) {
      pPlr.CreateGraphs();
    }
    let pClient = null;
    while ((pClient = $.Network.Clients.GetNextClient(pClient)) != null) {
      pClient.CreateGraphs();
    }
    return this;
  }

  $dtor() {
    for (let pPlr = $.Players.First; pPlr != null; pPlr = pPlr.Next) {
      pPlr.ClearGraphs();
    }
    let pClient = null;
    while ((pClient = $.Network.Clients.GetNextClient(pClient)) != null) {
      pClient.ClearGraphs();
    }
    $.StdScheduler.prototype.Remove.call($.Application, this);
    super.$dtor();
  }

  ExecuteFrame() {
    this.statObjCount.RecordValue(Math.fround($.Objects.ObjectCount()));
  }

  ExecuteSecond() {
    this.statFPS.RecordValue(Math.fround($.Game.FPS));
    this.statNetI.RecordValue(Math.fround($.Network.NetIO.getProtIRate(1 /*P_TCP*/) + $.Network.NetIO.getProtIRate(0 /*P_UDP*/) | 0));
    this.statNetO.RecordValue(Math.fround($.Network.NetIO.getProtORate(1 /*P_TCP*/) + $.Network.NetIO.getProtORate(0 /*P_UDP*/) | 0));
    let pClient = null;
    while ((pClient = $.Network.Clients.GetNextClient(pClient)) != null) {
      if (pClient.getStatPing() != null) {
        let iPing = 0;
        let pConn = pClient.getMsgConn();
        if (pConn != null) {
          iPing = pConn.getLag();
        }
        pClient.getStatPing().RecordValue(Math.fround(iPing));
      }
    }
    this.SecondCounter = this.SecondCounter + 1 | 0;
  }

  ExecuteControlFrame() {
    this.statControls.SetMultiplier(Math.fround(Math.fround(Math.fround(1000) / Math.fround(38)) / Math.fround($.Control$2.ControlRate)));
    this.statActions.SetMultiplier(Math.fround(Math.fround(Math.fround(Math.fround(1000) / Math.fround(38)) * Math.fround(60)) / Math.fround($.Control$2.ControlRate)));
    for (let pPlr = $.Players.First; pPlr != null; pPlr = pPlr.Next) {
      if (pPlr.pstatControls != null) {
        pPlr.pstatControls.RecordValue(Math.fround(pPlr.ControlCount));
        pPlr.ControlCount = 0;
      }
      if (pPlr.pstatActions != null) {
        pPlr.pstatActions.RecordValue(Math.fround(pPlr.ActionCount));
        pPlr.ActionCount = 0;
      }
    }
    this.ControlCounter = this.ControlCounter + 1 | 0;
  }

  OnSec1Timer() {
    this.ExecuteSecond();
  }

  GetGraphByName(rszName, rfIsTemp) {
    rfIsTemp.a[rfIsTemp.o] = false;
    if ($.SEqualNoCase(rszName.getData(), S("oc"))) {
      return this.statObjCount;
    }
    if ($.SEqualNoCase(rszName.getData(), S("fps"))) {
      return this.statFPS;
    }
    if ($.SEqualNoCase(rszName.getData(), S("netio"))) {
      return this.graphNetIO;
    }
    if ($.SEqualNoCase(rszName.getData(), S("pings"))) {
      return this.statPings;
    }
    if ($.SEqualNoCase(rszName.getData(), S("control"))) {
      return this.statControls;
    }
    if ($.SEqualNoCase(rszName.getData(), S("apm"))) {
      return this.statActions;
    }
    return null;
  }

  $clone() { return new C4Network2Stats().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.statObjCount.$assign(o.statObjCount);
    this.statFPS.$assign(o.statFPS);
    this.statNetI.$assign(o.statNetI);
    this.statNetO.$assign(o.statNetO);
    this.graphNetIO.$assign(o.graphNetIO);
    this.statPings.$assign(o.statPings);
    this.statControls.$assign(o.statControls);
    this.statActions.$assign(o.statActions);
    this.SecondCounter = o.SecondCounter;
    this.ControlCounter = o.ControlCounter;
    return this;
  }
}

export function $init(): void {
  $mixin(C4GraphCollection, C4Graph);
}

Object.assign($, { C4Graph, C4GraphCollection, C4Network2Stats, C4TableGraph });
