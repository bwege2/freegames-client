// @ts-nocheck
// OpenClonk 36de799: src/lib/C4Log.cpp, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $u64n } from '../../rt/int.ts';
import { c$access, c$close, c$fclose, c$fdopen, c$fflush, c$fileno, c$flock, c$fopen, c$fputs, c$ftruncate, c$localtime, c$memmove, c$open, c$stdout, c$strftime, c$time } from '../../rt/libc.ts';
import { $padd, $peq, $rd, $wr, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';






export function OpenLog() {
  let $t1;
  $.StdStrBuf.prototype.op_assign$pi8.call($.sLogFileName, S("OpenClonk.log"));
  let iLog = 2;
  let fd = 0;
  while (!((fd = c$open($.Config.AtUserDataPath($.sLogFileName.getData()), 65, 420)) !== 0) || c$flock(fd, 6) !== 0) {
    if (fd !== 0) {
      c$close(fd);
    }
    if (c$access($.Config.AtUserDataPath($.sLogFileName.getData()), 0) !== 0) {
      return false;
    }
    $.sLogFileName.Format(S("OpenClonk%d.log"), ($t1 = iLog, iLog = iLog + 1 | 0, $t1));
  }
  c$ftruncate(fd, 0);
  $.C4LogFile = c$fdopen(fd, S("wb"));
  c$time(P($, "C4LogStartTime"));
  return true;
}

export function OpenExtraLogs() {
  let success = true;
  if ($.C4Shader.IsLogging()) {
    $.C4ShaderLogFile = c$fopen($.Config.AtUserDataPath(S("OpenClonkShaders.log")), S("wb"));
    if ($.C4ShaderLogFile != null && c$flock(c$fileno($.C4ShaderLogFile), 6) !== 0) {
      $.DebugLog(S("Couldn't lock shader log file, closing."));
      c$fclose($.C4ShaderLogFile);
      $.C4ShaderLogFile = null;
    }
    if ($.C4ShaderLogFile == null) {
      success = false;
    }
  }
  return success;
}

export function CloseLog() {
  if ($.C4ShaderLogFile != null) {
    c$fclose($.C4ShaderLogFile);
  }
  $.C4ShaderLogFile = null;
  if ($.C4LogFile != null) {
    c$fclose($.C4LogFile);
  }
  $.C4LogFile = null;
  return true;
}

export function GetLogFD() {
  if ($.C4LogFile != null) {
    return c$fileno($.C4LogFile);
  } else {
    return -1;
  }
}

export function LogSilent$pi8$b(szMessage, fConsole) {
  let $t1, $t2, $t3;
  if (!$.Application.AssertMainThread()) {
    return false;
  }
  if (szMessage == null) {
    return false;
  }
  const timenow = [0];
  c$time(P(timenow, 0));
  let TimeMessage = new $.StdStrBuf();
  TimeMessage.SetLength(11 + $.SLen(szMessage) + 1);
  c$strftime(TimeMessage.getMData(), 12, S("[%H:%M:%S] "), c$localtime(P(timenow, 0)));
  const pSrc = [szMessage];
  do {
    let pDest = $padd(TimeMessage.getMData(), 11);
    let Markup = new $.C4Markup().init(false);
    while (pSrc[0].a[pSrc[0].o] !== 0) {
      Markup.SkipTags(P(pSrc, 0));
      while (pSrc[0].a[pSrc[0].o] === 13) {
        pSrc[0] = pSrc[0].add(1);
      }
      if (pSrc[0].a[pSrc[0].o] === 10) {
        pSrc[0] = pSrc[0].add(1);
        break;
      }
      if (pSrc[0].a[pSrc[0].o] !== 0) {
        $wr(($t1 = pDest, pDest = pDest.add(1), $t1), 0, $rd(($t2 = pSrc[0], pSrc[0] = pSrc[0].add(1), $t2)));
      }
    }
    $wr(($t3 = pDest, pDest = pDest.add(1), $t3), 0, 10);
    pDest.a[pDest.o] = 0;
    if ($.C4LogFile != null) {
      c$fputs(TimeMessage.getData(), $.C4LogFile);
      c$fflush($.C4LogFile);
    }
    if ($.Control$2.GetRecord() != null) {
      $.Control$2.GetRecord().GetLogFile().Write(TimeMessage.getData(), TimeMessage.getLength() | 0);
    }
    if (fConsole) {
      {
        c$fputs(TimeMessage.getData(), c$stdout);
        c$fflush(c$stdout);
      }
    }
  } while (pSrc[0].a[pSrc[0].o] !== 0);
  return true;
}

export function LogSilent$pi8(szMessage) {
  return LogSilent$pi8$b(szMessage, false);
}


export function ResetFatalError() {
  $.sFatalError.Clear();
}

export function GetFatalError() {
  return $.sFatalError.getData();
}

export function GetLogPos() {
  return $.FileSize$pi8($.sLogFileName.getData());
}

export function GetLogSection(iStart, iLength, rsOut) {
  let $t1;
  if (iLength === 0) {
    rsOut.Clear();
    return true;
  }
  let BufOrig = new $.StdStrBuf();
  if (!BufOrig.LoadFromFile($.sLogFileName.getData())) {
    return false;
  }
  let szBuf = BufOrig.getMData();
  let iSize = BufOrig.getSize();
  if (iStart > iSize) {
    iStart = iSize;
  }
  if (iStart + iLength > iSize) {
    iLength = iSize - iStart;
  }
  szBuf = szBuf.add(iStart);
  szBuf.a[szBuf.o + iLength] = 0;
  let szPosWrite = szBuf;
  let szPosRead = szBuf;
  while (szPosRead.a[szPosRead.o] !== 0) {
    if (szPosRead.a[szPosRead.o] === 91) {
      while (szPosRead.a[szPosRead.o] !== 0 && szPosRead.a[szPosRead.o] !== 93) {
        iSize = iSize - 1;
        szPosRead = szPosRead.add(1);
      }
    }
    if (szPosRead.a[szPosRead.o] === 0) {
      break;
    }
    szPosRead = szPosRead.add(1);
    let iLen = 0;
    while (szPosRead.a[szPosRead.o] !== 0 && szPosRead.a[szPosRead.o] !== 13 && szPosRead.a[szPosRead.o] !== 10) {
      szPosRead = szPosRead.add(1);
      iLen = iLen + 1;
    }
    if (iLen !== 0 && !$peq($padd(szPosRead, -iLen), szPosWrite)) {
      c$memmove(szPosWrite, $padd(szPosRead, -iLen), iLen);
    }
    szPosWrite = szPosWrite.add(iLen);
    while (szPosRead.a[szPosRead.o] === 13 || szPosRead.a[szPosRead.o] === 10) {
      szPosRead = szPosRead.add(1);
    }
    if (szPosRead.a[szPosRead.o] !== 0) {
      $wr(($t1 = szPosWrite, szPosWrite = szPosWrite.add(1), $t1), 0, 124);
    }
  }
  rsOut.Copy$pi8$u64(szBuf, $u64n(szPosWrite.o - szBuf.o));
  return true;
}

export function ShaderLog(szMessage) {
  if ($.C4ShaderLogFile == null) {
    return false;
  }
  if (!$.Application.AssertMainThread()) {
    return false;
  }
  if (szMessage == null) {
    return false;
  }
  c$fputs(szMessage, $.C4ShaderLogFile);
  c$fputs(S("\n"), $.C4ShaderLogFile);
  c$fflush($.C4ShaderLogFile);
  return true;
}

export function ShaderLogF(strMessage, ...$va) {
  let args = null;
  args = { a: $va, i: 0 };
  let Buf = new $.StdStrBuf();
  Buf.FormatV(strMessage, args);
  return ShaderLog(Buf.getData());
}

export function $init(): void {
  $.C4LogFile = null;
  $.C4ShaderLogFile = null;
  $.C4LogStartTime = 0;
  $.sLogFileName = new $.StdStrBuf();
  $.sFatalError = new $.StdStrBuf();
  $.iDisableLog = 0;
}

Object.assign($, { CloseLog, GetFatalError, GetLogFD, GetLogPos, GetLogSection, LogSilent$pi8, LogSilent$pi8$b, OpenExtraLogs, OpenLog, ResetFatalError, ShaderLog, ShaderLogF });
