// @ts-nocheck
// OpenClonk 36de799: src/graphics/StdPNG.cpp, src/graphics/StdPNG.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { StdThread } from '../platform/StdScheduler.ts';
import { $u64n } from '../../rt/int.ts';
import { c$_setjmp, c$fclose, c$fopen, c$longjmp, c$memcpy, c$sched_yield } from '../../rt/libc.ts';
import { png$png_create_info_struct, png$png_create_read_struct, png$png_create_write_struct, png$png_destroy_read_struct, png$png_destroy_write_struct, png$png_get_IHDR, png$png_get_io_ptr, png$png_get_rowbytes, png$png_get_valid, png$png_init_io, png$png_read_image, png$png_read_info, png$png_read_update_info, png$png_set_IHDR, png$png_set_bgr, png$png_set_compression_level, png$png_set_compression_mem_level, png$png_set_compression_method, png$png_set_compression_strategy, png$png_set_compression_window_bits, png$png_set_expand, png$png_set_filter, png$png_set_gray_to_rgb, png$png_set_longjmp_fn, png$png_set_packing, png$png_set_read_fn, png$png_set_strip_16, png$png_sig_cmp, png$png_write_end, png$png_write_image, png$png_write_info } from '../../rt/libpng.ts';
import { $oat, $padd, $rd, $reinterp, $wr, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete, seq_remove } from '../../rt/std.ts';

export class CPNGFile {
  pFile = null;
  fpFileOwned = false;
  iFileSize = 0;
  iPixSize = 0;
  fp = null;
  pFilePtr = null;
  fWriteMode = false;
  png_ptr = null;
  info_ptr = null;
  end_info = null;
  pImageData = null;
  iRowSize = 0;
  iWdt = 0;
  iHgt = 0;
  iBPC = 0;
  iClrType = 0;
  iIntrlcType = 0;
  iCmprType = 0;
  iFltrType = 0;

  Read(pData, iLength) {
    c$memcpy(pData, this.pFilePtr, $u64n(iLength));
    this.pFilePtr = this.pFilePtr.add(iLength);
  }

  DoLoad() {
    let $t1;
    this.pFilePtr = this.pFile;
    if (png$png_sig_cmp(this.pFilePtr, 0, 8) !== 0) {
      return false;
    }
    this.fWriteMode = false;
    this.png_ptr = png$png_create_read_struct(S("1.6.59"), null, null, null);
    if (this.png_ptr == null) {
      return false;
    }
    this.info_ptr = png$png_create_info_struct(this.png_ptr);
    if (this.info_ptr == null) {
      return false;
    }
    this.end_info = png$png_create_info_struct(this.png_ptr);
    if (this.end_info == null) {
      return false;
    }
    if (c$_setjmp($oat(png$png_set_longjmp_fn(this.png_ptr, c$longjmp, 0), 0)) !== 0) {
      return false;
    }
    png$png_set_read_fn(this.png_ptr, this, CPNGFile.CPNGReadFn);
    png$png_read_info(this.png_ptr, this.info_ptr);
    const uWdt = [this.iWdt >>> 0];
    const uHgt = [this.iHgt >>> 0];
    png$png_get_IHDR(this.png_ptr, this.info_ptr, P(uWdt, 0), P(uHgt, 0), P(this, "iBPC"), P(this, "iClrType"), P(this, "iIntrlcType"), P(this, "iCmprType"), P(this, "iFltrType"));
    if (this.iClrType === 3 && this.iBPC <= 8) {
      png$png_set_expand(this.png_ptr);
    }
    if (this.iClrType === 0 && this.iBPC < 8) {
      png$png_set_expand(this.png_ptr);
    }
    if (png$png_get_valid(this.png_ptr, this.info_ptr, 16) !== 0) {
      png$png_set_expand(this.png_ptr);
    }
    if (this.iBPC === 16) {
      png$png_set_strip_16(this.png_ptr);
    }
    if (this.iBPC < 8) {
      png$png_set_packing(this.png_ptr);
    }
    if (this.iClrType === 0 || this.iClrType === 4) {
      png$png_set_gray_to_rgb(this.png_ptr);
    }
    png$png_set_bgr(this.png_ptr);
    png$png_read_update_info(this.png_ptr, this.info_ptr);
    png$png_get_IHDR(this.png_ptr, this.info_ptr, P(uWdt, 0), P(uHgt, 0), P(this, "iBPC"), P(this, "iClrType"), P(this, "iIntrlcType"), P(this, "iCmprType"), P(this, "iFltrType"));
    this.iWdt = uWdt[0];
    this.iHgt = uHgt[0];
    switch (this.iClrType) {
      case 2:
        this.iPixSize = 3;
        break;
      case 6:
        this.iPixSize = 4;
        break;
      default:
        return false;
    }
    this.iRowSize = png$png_get_rowbytes(this.png_ptr, this.info_ptr) | 0;
    this.pImageData = P(new Uint8Array($u64n(this.iRowSize) * this.iHgt), 0);
    let ppRowBuf = P(new Array(this.iHgt).fill(null), 0);
    let ppRows = ppRowBuf;
    let pRow = this.pImageData;
    for (let i = 0; i < this.iHgt; i = i + 1 >>> 0, pRow = pRow.add(this.iRowSize)) {
      $wr(($t1 = ppRows, ppRows = ppRows.add(1), $t1), 0, pRow);
    }
    png$png_read_image(this.png_ptr, ppRowBuf);
    $delete(ppRowBuf);
    return true;
  }

  init() {
    CPNGFile.prototype.Default.call(this);
    return this;
  }

  $dtor() {
    CPNGFile.prototype.Clear.call(this);
  }

  ClearPngStructs() {
    if (this.png_ptr != null || this.info_ptr != null || this.end_info != null) {
      if (this.fWriteMode) {
        png$png_destroy_write_struct(P(this, "png_ptr"), P(this, "info_ptr"));
      } else {
        png$png_destroy_read_struct(P(this, "png_ptr"), P(this, "info_ptr"), P(this, "end_info"));
      }
    }
    this.png_ptr = null;
    this.info_ptr = this.end_info = null;
    this.fWriteMode = false;
  }

  Default() {
    this.pFile = null;
    this.fpFileOwned = false;
    this.pFilePtr = null;
    this.png_ptr = null;
    this.info_ptr = this.end_info = null;
    this.pImageData = null;
    this.iRowSize = 0;
    this.iPixSize = 0;
    this.fp = null;
  }

  Clear() {
    if (this.pImageData != null) {
      $delete(this.pImageData);
      this.pImageData = null;
    }
    this.ClearPngStructs();
    if (this.fpFileOwned) {
      $delete(this.pFile);
    }
    this.pFile = null;
    this.fpFileOwned = false;
    this.pFilePtr = null;
    this.iRowSize = 0;
    this.iPixSize = 0;
    if (this.fp != null) {
      c$fclose(this.fp);
      this.fp = null;
    }
  }

  Load(pFile, iSize) {
    this.Clear();
    this.pFile = pFile;
    this.iFileSize = iSize;
    this.fpFileOwned = false;
    if (!this.DoLoad()) {
      this.Clear();
      return false;
    }
    this.pFile = null;
    this.iFileSize = 0;
    return true;
  }

  GetPix(iX, iY) {
    if (this.pImageData == null) {
      return 0;
    }
    let pPix = $padd($padd(this.pImageData, Math.imul(iY, this.iRowSize)), Math.imul(iX, this.iPixSize));
    switch (this.iClrType) {
      case 2:
        return (((0xff000000 | ((pPix.a[pPix.o + 2] & 255) >>> 0 << 16) >>> 0) >>> 0 | ((pPix.a[pPix.o + 1] & 255) >>> 0 << 8) >>> 0) >>> 0 | (pPix.a[pPix.o + 0] & 255) >>> 0) >>> 0;
      case 6:
        return $.RGBA(pPix.a[pPix.o + 2], pPix.a[pPix.o + 1], pPix.a[pPix.o + 0], pPix.a[pPix.o + 3]);
    }
    return 0;
  }

  GetRow(iY) {
    return $reinterp($padd(this.pImageData, Math.imul(iY, this.iRowSize)), "u32");
  }

  Create(iWdt, iHgt, fAlpha) {
    if (iWdt <= 0 || iHgt <= 0) {
      return false;
    }
    this.Clear();
    this.iWdt = $u64n(iWdt);
    this.iHgt = $u64n(iHgt);
    this.iBPC = 8;
    this.iClrType = fAlpha ? 6 : 2;
    this.iPixSize = fAlpha ? 4 : 3;
    this.iIntrlcType = 0;
    this.iCmprType = 0;
    this.iFltrType = 0;
    let iBPP = Math.imul(fAlpha ? 4 : 3, this.iBPC);
    this.iRowSize = (Math.imul(iBPP, iWdt) + 7 | 0) >> 3;
    this.pImageData = P(new Uint8Array($u64n(Math.imul(iHgt, this.iRowSize))), 0);
    return true;
  }

  SetPix(iX, iY, dwValue) {
    if (this.pImageData == null) {
      return false;
    }
    let pPix = $padd($padd(this.pImageData, Math.imul(iY, this.iRowSize)), Math.imul(iX, this.iPixSize));
    switch (this.iClrType) {
      case 2:
        pPix.a[pPix.o + 0] = dwValue & 0xff;
        pPix.a[pPix.o + 1] = (dwValue & 0xffff) >> 8 & 0xff;
        pPix.a[pPix.o + 2] = dwValue >>> 16 & 0xff;
        return true;
      case 6:
        $wr($reinterp(pPix, "u32"), 0, dwValue);
        return true;
    }
    return false;
  }

  Save(szFilename) {
    let $t1;
    if (this.pImageData == null) {
      return false;
    }
    this.fp = c$fopen(szFilename, S("wb"));
    if (this.fp == null) {
      return false;
    }
    this.ClearPngStructs();
    this.fWriteMode = true;
    this.png_ptr = png$png_create_write_struct(S("1.6.59"), null, null, null);
    if (this.png_ptr == null) {
      this.Clear();
      return false;
    }
    this.info_ptr = png$png_create_info_struct(this.png_ptr);
    if (this.info_ptr == null) {
      this.Clear();
      return false;
    }
    if (c$_setjmp($oat(png$png_set_longjmp_fn(this.png_ptr, c$longjmp, 0), 0)) !== 0) {
      this.Clear();
      return false;
    }
    png$png_init_io(this.png_ptr, this.fp);
    png$png_set_filter(this.png_ptr, 0, 152);
    png$png_set_compression_level(this.png_ptr, 9);
    png$png_set_compression_mem_level(this.png_ptr, 8);
    png$png_set_compression_strategy(this.png_ptr, 0);
    png$png_set_compression_window_bits(this.png_ptr, 15);
    png$png_set_compression_method(this.png_ptr, 8);
    png$png_set_IHDR(this.png_ptr, this.info_ptr, this.iWdt >>> 0, this.iHgt >>> 0, this.iBPC, this.iClrType, this.iIntrlcType, this.iCmprType, this.iFltrType);
    let iRealRowSize = png$png_get_rowbytes(this.png_ptr, this.info_ptr) | 0;
    if (iRealRowSize !== this.iRowSize) {
      this.Clear();
      return false;
    }
    png$png_write_info(this.png_ptr, this.info_ptr);
    png$png_set_bgr(this.png_ptr);
    let ppRowBuf = P(new Array(this.iHgt).fill(null), 0);
    let ppRows = ppRowBuf;
    let pRow = this.pImageData;
    for (let i = 0; i < this.iHgt; i = i + 1 >>> 0, pRow = pRow.add(this.iRowSize)) {
      $wr(($t1 = ppRows, ppRows = ppRows.add(1), $t1), 0, pRow);
    }
    png$png_write_image(this.png_ptr, ppRowBuf);
    $delete(ppRowBuf);
    png$png_write_end(this.png_ptr, this.info_ptr);
    c$fclose(this.fp);
    this.fp = null;
    this.ClearPngStructs();
    return true;
  }

  GetImageData() {
    return this.pImageData;
  }

  GetBitsPerPixel() {
    switch (this.iClrType) {
      case 2:
        return 24;
      case 6:
        return 32;
    }
    return 0;
  }

  static ScheduleSaving(png, filename) {
    let saver = new CPNGSaveThread().init(png, filename);
    if (!$.StdThread.prototype.Start.call(saver)) {
      $delete(saver);
    }
  }

  static WaitForSaves() {
    let first = true;
    while (CPNGSaveThread.HasPendingThreads()) {
      if (first) {
        $.LogSilent$pi8(S("Waiting for pending image files to be written to disc..."));
      }
      first = false;
      c$sched_yield();
    }
  }

  static CPNGReadFn(png_ptr, data, length) {
    png$png_get_io_ptr(png_ptr).Read(data, length | 0);
  }

  $clone() { return new CPNGFile().$assign(this); }
  $assign(o) {
    this.pFile = o.pFile;
    this.fpFileOwned = o.fpFileOwned;
    this.iFileSize = o.iFileSize;
    this.iPixSize = o.iPixSize;
    this.fp = o.fp;
    this.pFilePtr = o.pFilePtr;
    this.fWriteMode = o.fWriteMode;
    this.png_ptr = o.png_ptr;
    this.info_ptr = o.info_ptr;
    this.end_info = o.end_info;
    this.pImageData = o.pImageData;
    this.iRowSize = o.iRowSize;
    this.iWdt = o.iWdt;
    this.iHgt = o.iHgt;
    this.iBPC = o.iBPC;
    this.iClrType = o.iClrType;
    this.iIntrlcType = o.iIntrlcType;
    this.iCmprType = o.iCmprType;
    this.iFltrType = o.iFltrType;
    return this;
  }
}

export class CPNGSaveThread extends StdThread {
  static threads_sec;
  static threads;
  png = null;
  filename = new $.StdCopyStrBuf();

  init(png, filename) {
    this.png = png;
    this.filename = new $.StdCopyStrBuf().init$pi8$b(filename);
    let lock = new $.CStdLock().init(CPNGSaveThread.threads_sec);
    CPNGSaveThread.threads.push(this);
    return this;
  }

  $dtor() {
    let lock = new $.CStdLock().init(CPNGSaveThread.threads_sec);
    seq_remove(CPNGSaveThread.threads, this);
    super.$dtor();
  }

  static HasPendingThreads() {
    let lock = new $.CStdLock().init(CPNGSaveThread.threads_sec);
    return !(CPNGSaveThread.threads.length === 0);
  }

  Execute() {
    this.png.Save(this.filename.getData());
    this.SignalStop();
  }

  IsSelfDestruct() {
    return true;
  }

  $clone() { return new CPNGSaveThread().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.png = o.png;
    this.filename.$assign(o.filename);
    return this;
  }
}

export function $init(): void {
  CPNGSaveThread.threads_sec = new $.CStdCSec().init();
  CPNGSaveThread.threads = [];
}

Object.assign($, { CPNGFile, CPNGSaveThread });
