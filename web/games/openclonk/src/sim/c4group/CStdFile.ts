// @ts-nocheck
// OpenClonk 36de799: src/c4group/CStdFile.cpp, src/c4group/CStdFile.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $u64n } from '../../rt/int.ts';
import { c$close, c$crc32, c$fclose, c$fdopen, c$fileno, c$fopen, c$fread, c$fseek, c$ftell, c$fwrite, c$memcpy, c$memmove, c$open, c$rewind } from '../../rt/libc.ts';
import { c4_gzclose, c4_gzdirect, c4_gzdopen, c4_gzread, c4_gzrewind, c4_gzwrite } from '../../rt/native.ts';
import { $padd, $reinterpVoid, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete, $min } from '../../rt/std.ts';

export class CStdStream {

  $clone() { return new CStdStream().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class CStdFile extends CStdStream {
  Status = false;
  Name = new Int8Array(4097);
  hFile = null;
  hgzFile = null;
  pMemory = null;
  MemoryPtr = 0;
  Buffer = new Uint8Array(4096);
  BufferLoad = 0;
  BufferPtr = 0;
  ModeWrite = false;
  thread_check = new $.StdThreadCheck();

  init() {
    this.thread_check = new $.StdThreadCheck();
    this.thread_check.Set();
    this.Status = false;
    this.hFile = null;
    this.hgzFile = null;
    this.pMemory = null;
    CStdFile.prototype.ClearBuffer.call(this);
    this.ModeWrite = false;
    this.Name[0] = 0;
    return this;
  }

  $dtor() {
    CStdFile.prototype.Close$ppStdBuf.call(this);
  }

  Create(szFilename, fCompressed = false, fExecutable = false, fMemory = false) {
    this.thread_check.Set();
    this.ModeWrite = true;
    if (fMemory) {
      if (!((this.pMemory = new $.StdBuf()) != null)) {
        return false;
      }
      this.MemoryPtr = 0;
      let buf = new $.StdStrBuf();
      buf.Format(S("<%p>"), this.pMemory);
      $.SCopy$pi8$pi8$u64(buf.getData(), P(this.Name, 0), 4096);
    } else {
      $.SCopy$pi8$pi8$u64(szFilename, P(this.Name, 0), 4096);
      let flags = 524865;
      let mode = 438;
      if (fExecutable) {
        mode = (mode | 73) >>> 0;
      }
      let fd = c$open(P(this.Name, 0), flags, mode);
      if (fd === -1) {
        return false;
      }
      if (fCompressed) {
        if (!((this.hgzFile = c4_gzdopen(fd, S("wb1"))) != null)) {
          return false;
        }
      } else {
        if (!((this.hFile = c$fdopen(fd, S("wb"))) != null)) {
          return false;
        }
      }
    }
    this.ClearBuffer();
    this.Status = true;
    return true;
  }

  Open(szFilename, fCompressed = false) {
    $.SCopy$pi8$pi8$u64(szFilename, P(this.Name, 0), 4096);
    this.thread_check.Set();
    this.ModeWrite = false;
    let flags = 524288;
    let mode = 438;
    let fd = c$open(P(this.Name, 0), flags, mode);
    if (fd === -1) {
      return false;
    }
    if (fCompressed) {
      if (!((this.hgzFile = c4_gzdopen(fd, S("rb"))) != null)) {
        c$close(fd);
        return false;
      }
      if (c4_gzdirect(this.hgzFile) !== 0) {
        c4_gzclose(this.hgzFile);
        this.hgzFile = null;
        return false;
      }
    } else {
      if (!((this.hFile = c$fdopen(fd, S("rb"))) != null)) {
        return false;
      }
    }
    this.ClearBuffer();
    this.Status = true;
    return true;
  }

  Append(szFilename, text = false) {
    $.SCopy$pi8$pi8$u64(szFilename, P(this.Name, 0), 4096);
    this.thread_check.Set();
    this.ModeWrite = true;
    if (!((this.hFile = c$fopen(P(this.Name, 0), P(text ? S("at") : S("ab"), 0))) != null)) {
      return false;
    }
    this.ClearBuffer();
    this.Status = true;
    return true;
  }

  Close$ppStdBuf(ppMemory = null) {
    this.thread_check.Check();
    let rval = true;
    this.Status = false;
    this.Name[0] = 0;
    if (this.ModeWrite && this.BufferLoad !== 0) {
      if (!this.SaveBuffer()) {
        rval = false;
      }
    }
    if (this.hgzFile != null) {
      if (c4_gzclose(this.hgzFile) !== 0) {
        rval = false;
      }
    }
    if (this.hFile != null) {
      if (c$fclose(this.hFile) !== 0) {
        rval = false;
      }
    }
    if (this.pMemory != null) {
      if (ppMemory != null) {
        ppMemory.a[ppMemory.o] = this.pMemory;
        this.pMemory = null;
      } else {
        $delete(this.pMemory);
      }
    }
    this.MemoryPtr = 0;
    this.hgzFile = null;
    this.hFile = null;
    return !!rval;
  }

  Default() {
    this.Status = false;
    this.Name[0] = 0;
    this.hgzFile = null;
    this.hFile = null;
    this.pMemory = null;
    this.MemoryPtr = 0;
    this.BufferLoad = this.BufferPtr = 0;
    this.thread_check.Set();
    return true;
  }

  Read$px$u64(pBuffer, iSize) {
    return this.Read$px$u64$pu64(pBuffer, iSize, null);
  }

  Read$px$u64$pu64(pBuffer, iSize, ipFSize) {
    this.thread_check.Check();
    let transfer = 0;
    if (pBuffer == null) {
      return false;
    }
    if (this.ModeWrite) {
      return false;
    }
    let bypBuffer = $reinterpVoid(pBuffer, "u8");
    if (ipFSize != null) {
      ipFSize.a[ipFSize.o] = 0;
    }
    while (iSize > 0) {
      if (this.BufferLoad > this.BufferPtr) {
        transfer = $min($u64n(this.BufferLoad - this.BufferPtr | 0), iSize) | 0;
        c$memmove(bypBuffer, $padd(P(this.Buffer, 0), this.BufferPtr), $u64n(transfer));
        this.BufferPtr = this.BufferPtr + transfer | 0;
        bypBuffer = bypBuffer.add(transfer);
        iSize = iSize - $u64n(transfer);
        if (ipFSize != null) {
          ipFSize.a[ipFSize.o] = ipFSize.a[ipFSize.o] + $u64n(transfer);
        }
      } else if (this.LoadBuffer() <= 0) {
        return false;
      }
    }
    return true;
  }

  Write(pBuffer, iSize) {
    this.thread_check.Check();
    let transfer = 0;
    if (pBuffer == null) {
      return false;
    }
    if (!this.ModeWrite) {
      return false;
    }
    let bypBuffer = $reinterpVoid(pBuffer, "u8");
    while (iSize > 0) {
      if (this.BufferLoad < 4096) {
        transfer = $min(4096 - this.BufferLoad | 0, iSize);
        c$memcpy($padd(P(this.Buffer, 0), this.BufferLoad), bypBuffer, $u64n(transfer));
        this.BufferLoad = this.BufferLoad + transfer | 0;
        bypBuffer = bypBuffer.add(transfer);
        iSize = iSize - transfer | 0;
      } else if (!this.SaveBuffer()) {
        return false;
      }
    }
    return true;
  }

  WriteString(szStr) {
    this.thread_check.Check();
    const nl = new Uint8Array([13, 10]);
    if (szStr == null) {
      return false;
    }
    let size = $.SLen(szStr) | 0;
    if (!this.Write(szStr, size)) {
      return false;
    }
    if (!this.Write(P(nl, 0), 2)) {
      return false;
    }
    return true;
  }

  Rewind() {
    this.thread_check.Check();
    if (this.ModeWrite) {
      return false;
    }
    this.ClearBuffer();
    if (this.hFile != null) {
      c$rewind(this.hFile);
    }
    if (this.hgzFile != null) {
      c4_gzrewind(this.hgzFile);
    }
    return true;
  }

  Advance(iOffset) {
    this.thread_check.Check();
    if (this.ModeWrite) {
      return false;
    }
    while (iOffset > 0) {
      if (this.BufferLoad > this.BufferPtr) {
        let transfer = $min(this.BufferLoad - this.BufferPtr | 0, iOffset);
        this.BufferPtr = this.BufferPtr + transfer | 0;
        iOffset = iOffset - transfer | 0;
      } else {
        if (this.hFile != null) {
          return !(c$fseek(this.hFile, iOffset, 1) !== 0);
        }
        if (this.LoadBuffer() <= 0) {
          return false;
        }
      }
    }
    return true;
  }

  Seek(offset, whence) {
    0;
    return c$fseek(this.hFile, offset, whence);
  }

  Tell() {
    0;
    return c$ftell(this.hFile);
  }

  IsOpen() {
    return this.hFile != null || this.hgzFile != null;
  }

  Flush() {
    if (this.ModeWrite && this.BufferLoad !== 0) {
      return this.SaveBuffer();
    } else {
      return true;
    }
  }

  AccessedEntrySize() {
    if (this.hFile != null) {
      return $.FileSize$i32(c$fileno(this.hFile));
    }
    0;
    return 0;
  }

  ClearBuffer() {
    this.thread_check.Check();
    this.BufferLoad = this.BufferPtr = 0;
  }

  LoadBuffer() {
    this.thread_check.Check();
    if (this.hFile != null) {
      this.BufferLoad = c$fread(P(this.Buffer, 0), 1, 4096, this.hFile) | 0;
    }
    if (this.hgzFile != null) {
      this.BufferLoad = c4_gzread(this.hgzFile, P(this.Buffer, 0), 4096);
    }
    this.BufferPtr = 0;
    return this.BufferLoad;
  }

  SaveBuffer() {
    this.thread_check.Check();
    let saved = 0;
    if (this.hFile != null) {
      saved = c$fwrite(P(this.Buffer, 0), 1, $u64n(this.BufferLoad), this.hFile) | 0;
    }
    if (this.hgzFile != null) {
      saved = c4_gzwrite(this.hgzFile, P(this.Buffer, 0), this.BufferLoad >>> 0);
    }
    if (this.pMemory != null) {
      this.pMemory.Append$px$u64(P(this.Buffer, 0), $u64n(this.BufferLoad));
      saved = this.BufferLoad;
    }
    if (saved !== this.BufferLoad) {
      return false;
    }
    this.BufferLoad = 0;
    return true;
  }

  $clone() { return new CStdFile().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.Status = o.Status;
    this.Name = o.Name.slice();
    this.hFile = o.hFile;
    this.hgzFile = o.hgzFile;
    this.pMemory = o.pMemory;
    this.MemoryPtr = o.MemoryPtr;
    this.Buffer = o.Buffer.slice();
    this.BufferLoad = o.BufferLoad;
    this.BufferPtr = o.BufferPtr;
    this.ModeWrite = o.ModeWrite;
    this.thread_check.$assign(o.thread_check);
    return this;
  }
}


export function UncompressedFileSize(szFilename) {
  let rd = 0;
  let rval = 0;
  const buf = new Uint8Array(1024);
  let flags = 524288;
  let mode = 438;
  let fd = c$open(szFilename, flags, mode);
  let hFile = null;
  if (!((hFile = c4_gzdopen(fd, S("rb"))) != null)) {
    return 0;
  }
  do {
    rd = c4_gzread(hFile, P(buf, 0), 1024);
    if (rd < 0) {
      break;
    }
    rval = rval + rd | 0;
  } while ($u64n(rd) === 1024);
  c4_gzclose(hFile);
  return rval;
}

export function GetFileCRC(szFilename, pCRC32) {
  if (pCRC32 == null) {
    return false;
  }
  let File = new CStdFile().init();
  if (!File.Open(szFilename)) {
    return false;
  }
  let iCRC32 = 0;
  for (; ; ) {
    const szData = new Uint8Array(4096);
    const iSize = [0];
    if (!File.Read$px$u64$pu64(P(szData, 0), 4096, P(iSize, 0))) {
      if (iSize[0] === 0) {
        break;
      }
    }
    iCRC32 = c$crc32(iCRC32, P(szData, 0), iSize[0] >>> 0) >>> 0;
  }
  File.Close$ppStdBuf();
  pCRC32.a[pCRC32.o] = iCRC32;
  return true;
}

export function GetFileSHA1(szFilename, pSHA1) {
  if (pSHA1 == null) {
    return false;
  }
  let File = new CStdFile().init();
  if (!File.Open(szFilename)) {
    return false;
  }
  let ctx = new $.sha1().init();
  for (; ; ) {
    const szData = new Uint8Array(4096);
    const iSize = [0];
    if (!File.Read$px$u64$pu64(P(szData, 0), 4096, P(iSize, 0))) {
      if (iSize[0] === 0) {
        break;
      }
    }
    ctx.process_bytes(P(szData, 0), iSize[0]);
  }
  File.Close$ppStdBuf();
  ctx.get_digest(pSHA1.a[pSHA1.o]);
  return true;
}

export function $init(): void {
  $.CStdFileBufSize$CStdFile = 4096;
}

Object.assign($, { CStdFile, CStdStream, GetFileCRC, GetFileSHA1, UncompressedFileSize });
