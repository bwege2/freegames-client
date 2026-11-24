// @ts-nocheck
// OpenClonk 36de799: src/graphics/C4Surface.cpp, src/graphics/C4Surface.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { gl$glBindTexture, gl$glDeleteTextures, gl$glGenTextures, gl$glGenerateMipmap, gl$glGetTexImage, gl$glPixelStorei, gl$glReadPixels, gl$glTexImage2D, gl$glTexParameteri, gl$glTexSubImage2D } from '../../rt/gl.ts';
import { $u64n } from '../../rt/int.ts';
import { c$_setjmp, c$memcpy, c$memset, c$sscanf, c$strlen } from '../../rt/libc.ts';
import { jpeg$jpeg_CreateDecompress, jpeg$jpeg_destroy_decompress, jpeg$jpeg_finish_decompress, jpeg$jpeg_read_header, jpeg$jpeg_read_scanlines, jpeg$jpeg_resync_to_restart, jpeg$jpeg_start_decompress, jpeg$jpeg_std_error } from '../../rt/libjpeg.ts';
import { $bytesView, $oat, $padd, $rd, $reinterp, $view8, $wr, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $begin, $delete, $max, $min, StdString, seq_remove } from '../../rt/std.ts';

export class C4Surface {
  Wdt = 0;
  Hgt = 0;
  Scale = 0;
  PrimarySurfaceLockPitch = 0;
  PrimarySurfaceLockBits = null;
  iTexSize = 0;
  ClipX = 0;
  ClipY = 0;
  ClipX2 = 0;
  ClipY2 = 0;
  fIsBackground = false;
  Format = 0;
  pCtx = null;
  texture = null;
  pMainSfc = null;
  pNormalSfc = null;
  ClrByOwnerClr = 0;
  pWindow = null;
  Locked = 0;
  Attached = false;
  fPrimary = false;

  init$v() {
    this.fIsBackground = false;
    this.texture = null;
    C4Surface.prototype.Default.call(this);
    return this;
  }

  $dtor() {
    C4Surface.prototype.Clear.call(this);
  }

  init$i32$i32$i32(iWdt, iHgt, iFlags) {
    this.fIsBackground = false;
    this.texture = null;
    C4Surface.prototype.Default.call(this);
    C4Surface.prototype.Create.call(this, iWdt, iHgt, iFlags);
    return this;
  }

  init$pC4AbstractApp$pC4Window(pApp, pWindow) {
    this.Wdt = 0;
    this.Hgt = 0;
    this.fIsBackground = false;
    this.texture = null;
    C4Surface.prototype.Default.call(this);
    this.fPrimary = true;
    this.pWindow = pWindow;
    this.pCtx = $.pGL.CreateContext(pWindow, pApp);
    C4Surface.prototype.NoClip.call(this);
    return this;
  }

  MoveFrom(psfcFrom) {
    this.Clear();
    if (psfcFrom == null) {
      return;
    }
    this.Wdt = psfcFrom.Wdt;
    this.Hgt = psfcFrom.Hgt;
    this.PrimarySurfaceLockPitch = psfcFrom.PrimarySurfaceLockPitch;
    this.PrimarySurfaceLockBits = psfcFrom.PrimarySurfaceLockBits;
    psfcFrom.PrimarySurfaceLockBits = null;
    this.ClipX = psfcFrom.ClipX;
    this.ClipY = psfcFrom.ClipY;
    this.ClipX2 = psfcFrom.ClipX2;
    this.ClipY2 = psfcFrom.ClipY2;
    this.Locked = psfcFrom.Locked;
    this.Attached = psfcFrom.Attached;
    this.fPrimary = psfcFrom.fPrimary;
    (this.texture = psfcFrom.texture, psfcFrom.texture = null);
    this.pMainSfc = psfcFrom.pMainSfc;
    this.pNormalSfc = psfcFrom.pNormalSfc;
    this.ClrByOwnerClr = psfcFrom.ClrByOwnerClr;
    this.iTexSize = psfcFrom.iTexSize;
    this.Format = psfcFrom.Format;
    this.fIsBackground = psfcFrom.fIsBackground;
    psfcFrom.Default();
  }

  IsRenderTarget() {
    return this.fPrimary;
  }

  SetBackground() {
    this.fIsBackground = true;
  }

  IsLocked() {
    return this.Locked;
  }

  ClearBoxDw(iX, iY, iWdt, iHgt) {
    if (this.Locked === 0) {
      return;
    }
    if (iX < 0) {
      iWdt = iWdt + iX | 0;
      iX = 0;
    }
    if (iY < 0) {
      iHgt = iHgt + iY | 0;
      iY = 0;
    }
    let iOver = 0;
    iOver = this.Wdt - (iX + iWdt | 0) | 0;
    if (iOver < 0) {
      iWdt = iWdt + iOver | 0;
    }
    iOver = this.Hgt - (iY + iHgt | 0) | 0;
    if (iOver < 0) {
      iHgt = iHgt + iOver | 0;
    }
    let rtClear = new $.C4Rect().init$i32$i32$i32$i32(iX, iY, iWdt, iHgt);
    if (this.pMainSfc != null && this.pMainSfc.texture != null) {
      this.pMainSfc.texture.ClearRect(rtClear);
    }
    this.texture.ClearRect(rtClear);
  }

  Unlock() {
    if (this.pMainSfc != null) {
      this.pMainSfc.Unlock();
    }
    if (this.Locked === 0) {
      return false;
    }
    this.Locked = this.Locked - 1 | 0;
    if (this.Locked === 0) {
      if (this.fPrimary) {
        $delete(this.PrimarySurfaceLockBits);
        this.PrimarySurfaceLockBits = null;
        return true;
      } else {
        if (this.texture != null) {
          this.texture.Unlock();
        }
      }
    }
    return true;
  }

  Lock() {
    if (this.pMainSfc != null) {
      if (!this.pMainSfc.Lock()) {
        return false;
      }
    }
    if (this.Locked === 0 && !this.fPrimary && this.texture == null) {
      return false;
    }
    this.Locked = this.Locked + 1 | 0;
    return true;
  }

  GetPixDw(iX, iY, fApplyModulation) {
    let pBuf = null;
    let iPitch = 0;
    let iX2 = iX;
    let iY2 = iY;
    if (this.fPrimary) {
      if (this.PrimarySurfaceLockBits == null) {
        this.PrimarySurfaceLockBits = P(new Uint8Array($u64n(Math.imul(Math.imul(this.Wdt, this.Hgt), 3))), 0);
        gl$glPixelStorei(3333, 1);
        gl$glReadPixels(0, 0, this.Wdt, this.Hgt, 32992, 5121, this.PrimarySurfaceLockBits);
        this.PrimarySurfaceLockPitch = Math.imul(this.Wdt, 3);
      }
      return $rd($reinterp($padd($padd(this.PrimarySurfaceLockBits, Math.imul((this.Hgt - iY | 0) - 1 | 0, this.PrimarySurfaceLockPitch)), Math.imul(iX, 3)), "u32"));
    } else {
      if (this.texture == null) {
        return 0;
      }
      this.texture.Lock();
      pBuf = this.texture.texLock.pBits;
      iPitch = this.texture.texLock.Pitch;
    }
    const dwPix = [0];
    let pPix = $reinterp($padd($padd(pBuf, Math.imul(iY, iPitch)), Math.imul(iX, 4)), "u32");
    dwPix[0] = pPix.a[pPix.o];
    if (this.pMainSfc != null) {
      let byAlpha = dwPix[0] >>> 24 & 0xff;
      if (byAlpha === 0) {
        dwPix[0] = this.pMainSfc.GetPixDw(iX2, iY2, fApplyModulation);
      } else {
        if (fApplyModulation) {
          if (($.pDraw.dwBlitMode & 8) >>> 0 !== 0) {
            $.ModulateClrMOD2(P(dwPix, 0), this.ClrByOwnerClr);
          } else {
            $.ModulateClr(P(dwPix, 0), this.ClrByOwnerClr);
          }
          if ($.pDraw.BlitModulated && !(($.pDraw.dwBlitMode & 4) >>> 0 !== 0)) {
            $.ModulateClr(P(dwPix, 0), $.pDraw.BlitModulateClr);
          }
        } else {
          $.ModulateClr(P(dwPix, 0), this.ClrByOwnerClr);
        }
        if (byAlpha !== 0) {
          const dwMainPix = [this.pMainSfc.GetPixDw(iX2, iY2, fApplyModulation)];
          $.BltAlpha(P(dwMainPix, 0), dwPix[0]);
          dwPix[0] = dwMainPix[0];
        }
      }
    } else {
      if (fApplyModulation && $.pDraw.BlitModulated) {
        if (($.pDraw.dwBlitMode & 2) >>> 0 !== 0) {
          $.ModulateClrMOD2(P(dwPix, 0), $.pDraw.BlitModulateClr);
        } else {
          $.ModulateClr(P(dwPix, 0), $.pDraw.BlitModulateClr);
        }
      }
    }
    return dwPix[0];
  }

  IsPixTransparent(iX, iY) {
    let dwPix = this.GetPixDw(iX, iY, false);
    return dwPix >>> 24 < 128;
  }

  SetPixDw(iX, iY, dwClr) {
    if (iX < this.ClipX || iX > this.ClipX2 || iY < this.ClipY || iY > this.ClipY2) {
      return true;
    }
    if (this.texture == null) {
      return false;
    }
    this.texture.Lock();
    if (dwClr >>> 24 === 0) {
      dwClr = 0;
    }
    this.texture.SetPix(iX, iY, dwClr);
    return true;
  }

  BltPix(iX, iY, sfcSource, iSrcX, iSrcY, fTransparency) {
    if (this.texture == null) {
      return false;
    }
    this.texture.Lock();
    let pPix32 = $reinterp($padd($padd(this.texture.texLock.pBits, Math.imul(iY, this.texture.texLock.Pitch)), Math.imul(iX, 4)), "u32");
    let srcPix = sfcSource.GetPixDw(iSrcX, iSrcY, true);
    if (!fTransparency) {
      pPix32.a[pPix32.o] = srcPix;
    } else {
      if (($.pDraw.dwBlitMode & 1) >>> 0 !== 0) {
        $.BltAlphaAdd(pPix32, srcPix);
      } else {
        $.BltAlpha(pPix32, srcPix);
      }
    }
    return true;
  }

  Create(iWdt, iHgt, iFlags = 0) {
    this.Clear();
    this.Default();
    if (iWdt === 0 || iHgt === 0) {
      return false;
    }
    this.Wdt = iWdt;
    this.Hgt = iHgt;
    if ($.pDraw == null) {
      return false;
    }
    if (!$.pDraw.DeviceReady()) {
      return false;
    }
    this.Format = $.pGL.sfcFmt;
    this.iTexSize = $max(iWdt, iHgt);
    this.texture = new C4TexRef().init(iWdt, iHgt, iFlags);
    this.NoClip();
    return true;
  }

  Copy(fromSfc) {
    this.Clear();
    this.Default();
    if (!this.Create(fromSfc.Wdt, fromSfc.Hgt)) {
      return false;
    }
    if (!$.pDraw.BlitSurface(fromSfc, this, 0, 0, false)) {
      this.Clear();
      return false;
    }
    return true;
  }

  CreateColorByOwner(pBySurface) {
    if (pBySurface == null) {
      return false;
    }
    if (pBySurface.texture == null) {
      return false;
    }
    if (!this.Create(pBySurface.Wdt, pBySurface.Hgt)) {
      return false;
    }
    this.Scale = pBySurface.Scale;
    this.pMainSfc = pBySurface;
    if (!this.pMainSfc.Lock()) {
      return false;
    }
    if (!this.Lock()) {
      this.pMainSfc.Unlock();
      return false;
    }
    for (let iY = 0; iY < this.Hgt; iY = iY + 1 | 0) {
      for (let iX = 0; iX < this.Wdt; iX = iX + 1 | 0) {
        const dwPix = [this.pMainSfc.GetPixDw(iX, iY, false)];
        if (!ClrByOwner(P(dwPix, 0))) {
          continue;
        }
        this.SetPixDw(iX, iY, dwPix[0]);
        this.pMainSfc.SetPixDw(iX, iY, 0xffffff);
      }
    }
    this.Unlock();
    this.pMainSfc.Unlock();
    return true;
  }

  SetAsClrByOwnerOf(pOfSurface) {
    if (pOfSurface == null) {
      return false;
    }
    if (this.Wdt !== pOfSurface.Wdt || this.Hgt !== pOfSurface.Hgt) {
      return false;
    }
    this.pMainSfc = pOfSurface;
    return true;
  }

  UpdateSize(wdt, hgt) {
    0;
    if (!this.fPrimary) {
      return false;
    }
    this.Wdt = wdt;
    this.Hgt = hgt;
    return true;
  }

  PageFlip(_pSrcRt = null, _pDstRt = null) {
    0;
    if (!this.fPrimary) {
      return false;
    }
    if ($.pDraw.pApp == null || !$.pDraw.pApp.AssertMainThread()) {
      return false;
    }
    return this.pCtx.PageFlip();
    return true;
  }

  Clear() {
    while (this.Locked !== 0) {
      this.Unlock();
    }
    if (this.pCtx != null) {
      $delete(this.pCtx);
      this.pCtx = null;
    }
    this.texture = null;
  }

  Default() {
    this.Wdt = this.Hgt = 0;
    this.Scale = 1;
    this.PrimarySurfaceLockPitch = 0;
    this.PrimarySurfaceLockBits = null;
    this.ClipX = this.ClipY = this.ClipX2 = this.ClipY2 = 0;
    this.Locked = 0;
    this.Attached = false;
    this.fPrimary = false;
    this.pMainSfc = null;
    this.pNormalSfc = null;
    this.pCtx = null;
    this.pWindow = null;
    this.ClrByOwnerClr = 0;
    this.iTexSize = 0;
    this.fIsBackground = false;
  }

  Clip(iX, iY, iX2, iY2) {
    this.ClipX = $.Clamp$i32$i32$i32(iX, 0, this.Wdt - 1 | 0);
    this.ClipY = $.Clamp$i32$i32$i32(iY, 0, this.Hgt - 1 | 0);
    this.ClipX2 = $.Clamp$i32$i32$i32(iX2, 0, this.Wdt - 1 | 0);
    this.ClipY2 = $.Clamp$i32$i32$i32(iY2, 0, this.Hgt - 1 | 0);
  }

  NoClip() {
    this.ClipX = 0;
    this.ClipY = 0;
    this.ClipX2 = this.Wdt - 1 | 0;
    this.ClipY2 = this.Hgt - 1 | 0;
  }

  LoadAny$rC4Group$pi8$b$b$i32(hGroup, szName, fOwnPal, fNoErrIfNotFound, iFlags) {
    let $t1;
    const szFilename = new Int8Array(256);
    $.SCopy$pi8$pi8$u64(szName, P(szFilename, 0), 255);
    let szExt = $.GetExtension$2(P(szFilename, 0));
    if (szExt.a[szExt.o] === 0) {
      const extensions = [
  S("png"),
  S("bmp"),
  S("jpeg"),
  S("jpg"),
  null,
];
      let i = 0;
      let szExt$2 = null;
      while ((szExt$2 = extensions[($t1 = i, i = i + 1 | 0, $t1)]) != null) {
        $.EnforceExtension$pi8$pi8(P(szFilename, 0), szExt$2);
        if (hGroup.FindEntry$pi8$pStdStrBuf$pu64(P(szFilename, 0))) {
          break;
        }
      }
    }
    return this.Load(hGroup, P(szFilename, 0), fOwnPal, fNoErrIfNotFound, iFlags);
  }

  LoadAny$rC4GroupSet$pi8$b$b$i32(hGroupset, szName, fOwnPal, fNoErrIfNotFound, iFlags) {
    let $t1;
    const szFilename = new Int8Array(256);
    $.SCopy$pi8$pi8$u64(szName, P(szFilename, 0), 255);
    let szExt = $.GetExtension$2(P(szFilename, 0));
    let pGroup = null;
    if (szExt.a[szExt.o] === 0) {
      const extensions = [
  S("png"),
  S("bmp"),
  S("jpeg"),
  S("jpg"),
  null,
];
      let i = 0;
      let szExt$2 = null;
      while ((szExt$2 = extensions[($t1 = i, i = i + 1 | 0, $t1)]) != null) {
        $.EnforceExtension$pi8$pi8(P(szFilename, 0), szExt$2);
        pGroup = hGroupset.FindEntry(P(szFilename, 0));
        if (pGroup != null) {
          break;
        }
      }
    } else {
      pGroup = hGroupset.FindEntry(P(szFilename, 0));
    }
    if (pGroup == null) {
      return false;
    }
    return this.Load(pGroup, P(szFilename, 0), fOwnPal, fNoErrIfNotFound, iFlags);
  }

  Load(hGroup, szFilename, _2, fNoErrIfNotFound, iFlags) {
    let ScaleToSet = 1;
    let strFilename = new $.StdStrBuf();
    const strBasename = new Int8Array(256);
    $.SCopy$pi8$pi8$u64(szFilename, P(strBasename, 0), 255);
    $.RemoveExtension$pi8(P(strBasename, 0));
    let extpos = 0;
    const scale = [0];
    if ((extpos = $.SCharLastPos(46, P(strBasename, 0))) > -1 && c$sscanf($padd($padd(P(strBasename, 0), extpos), 1), S("%d"), P(scale, 0)) === 1) {
      ScaleToSet = scale[0];
    } else {
      let base_length = c$strlen(P(strBasename, 0));
      const strExtension = new Int8Array(129);
      $.SCopy$pi8$pi8$u64($.GetExtension(szFilename), P(strExtension, 0), 128);
      if (strExtension[0] !== 0) {
        const scaled_name = new Int8Array(4097);
        let wildcard = StdString.of(P(strBasename, 0));
        wildcard.append(S(".*."));
        wildcard.append(P(strExtension, 0));
        let max_scale = -1;
        if (hGroup.FindEntry$pi8$pi8(wildcard.c_str(), P(scaled_name, 0))) {
          do {
            const scale$2 = [-1];
            if (c$sscanf($padd($padd(P(scaled_name, 0), base_length), 1), S("%d"), P(scale$2, 0)) === 1) {
              if (scale$2[0] > max_scale) {
                max_scale = scale$2[0];
                ScaleToSet = max_scale;
                strFilename.Copy$pi8(P(scaled_name, 0));
                szFilename = strFilename.getData();
              }
            }
          } while (hGroup.FindNextEntry$pi8$pi8$pu64$b(wildcard.c_str(), P(scaled_name, 0)));
        }
      }
    }
    if (!hGroup.AccessEntry(szFilename)) {
      if (!fNoErrIfNotFound) {
        $.LogF(S("%s: %s%c%s"), $.LoadResStr(S("IDS_PRC_FILENOTFOUND")), hGroup.GetFullName().getData(), 47, szFilename);
      }
      return false;
    }
    let fSuccess = this.Read(hGroup, $.GetExtension(szFilename), iFlags);
    if (!fSuccess) {
      $.LogF(S("%s: %s%c%s"), $.LoadResStr(S("IDS_ERR_NOFILE")), hGroup.GetFullName().getData(), 47, szFilename);
    }
    this.Scale = ScaleToSet;
    return fSuccess;
  }

  SavePNG$rC4Group$pi8$b$b(hGroup, szFilename, fSaveAlpha = true, fSaveOverlayOnly = false) {
    const szTemp = new Int8Array(4097);
    $.SCopy$pi8$pi8($.C4Group_GetTempPath(), P(szTemp, 0));
    $.SAppend($.GetFilename(szFilename), P(szTemp, 0));
    $.MakeTempFilename$pi8(P(szTemp, 0));
    if (!C4Surface.prototype.SavePNG$pi8$b$b$b.call(this, P(szTemp, 0), fSaveAlpha, fSaveOverlayOnly, false)) {
      return false;
    }
    if (!hGroup.Move(P(szTemp, 0), $.GetFilename(szFilename))) {
      return false;
    }
    return true;
  }

  SavePNG$pi8$b$b$b(szFilename, fSaveAlpha, fSaveOverlayOnly, use_background_thread) {
    let $t1;
    if (!this.Lock()) {
      return false;
    }
    let png = new $.CPNGFile().init();
    if (!png.Create(this.Wdt, this.Hgt, fSaveAlpha)) {
      this.Unlock();
      return false;
    }
    let pMainSfcBackup = null;
    if (fSaveOverlayOnly) {
      pMainSfcBackup = this.pMainSfc;
      this.pMainSfc = null;
    }
    if (this.fPrimary) {
      for (let y = 0; y < this.Hgt; y = y + 1 | 0) {
        gl$glReadPixels(0, (this.Hgt - y | 0) - 1 | 0, this.Wdt, 1, (fSaveAlpha ? 32993 : 32992) >>> 0, 5121, png.GetRow(y));
      }
    } else {
      for (let y = 0; y < this.Hgt; y = y + 1 | 0) {
        for (let x = 0; x < this.Wdt; x = x + 1 | 0) {
          let dwClr = this.GetPixDw(x, y, false);
          png.SetPix(x, y, dwClr);
        }
      }
    }
    if (fSaveOverlayOnly) {
      this.pMainSfc = pMainSfcBackup;
    }
    this.Unlock();
    if (use_background_thread) {
      $.CPNGFile.ScheduleSaving(($t1 = png, png = null, $t1), szFilename);
    } else {
      if (!png.Save(szFilename)) {
        return false;
      }
    }
    return true;
  }

  Read(hGroup, extension, iFlags) {
    if ($.SEqualNoCase(extension, S("png"))) {
      return this.ReadPNG(hGroup, iFlags);
    } else if ($.SEqualNoCase(extension, S("jpeg")) || $.SEqualNoCase(extension, S("jpg"))) {
      return this.ReadJPEG(hGroup, iFlags);
    } else if ($.SEqualNoCase(extension, S("bmp"))) {
      return this.ReadBMP(hGroup, iFlags);
    } else {
      return false;
    }
  }

  ReadPNG(hGroup, iFlags) {
    let $t1;
    let iSize = hGroup.AccessedEntrySize() | 0;
    let pData = P(new Uint8Array($u64n(iSize)), 0);
    hGroup.Read$px$u64(pData, $u64n(iSize));
    let png = new $.CPNGFile().init();
    let fSuccess = png.Load(pData, iSize);
    $delete(pData);
    if (!fSuccess) {
      return false;
    }
    if (!this.Create(png.iWdt | 0, png.iHgt | 0, iFlags)) {
      return false;
    }
    if (!this.Lock()) {
      return false;
    }
    if (this.texture == null) {
      this.Unlock();
      return false;
    }
    if (!this.texture.Lock()) {
      return false;
    }
    let maxX = $min(this.Wdt, this.iTexSize);
    let maxY = $min(this.Hgt, this.iTexSize);
    for (let iY = 0; iY < maxY; iY = iY + 1 | 0) {
      if (png.iClrType === 6) {
        let pPix = $reinterp($padd($view8(this.texture.texLock.pBits, true), Math.imul(iY, this.texture.texLock.Pitch)), "u32");
        c$memcpy(pPix, png.GetRow(iY), $u64n(maxX) * 4);
        let iX = maxX;
        while (($t1 = iX, iX = iX - 1 | 0, $t1) !== 0) {
          if ($rd($reinterp(pPix, "u8"), 3) === 0) {
            pPix.a[pPix.o] = 0;
          }
          pPix = pPix.add(1);
        }
      } else {
        for (let iX = 0; iX < maxX; iX = iX + 1 | 0) {
          let dwCol = png.GetPix(iX, iY);
          if (dwCol >>> 24 === 0) {
            dwCol = 0;
          }
          let pPix = $reinterp($padd($padd($view8(this.texture.texLock.pBits, true), Math.imul(iY, this.texture.texLock.Pitch)), Math.imul(iX, 4)), "u32");
          pPix.a[pPix.o] = dwCol;
        }
      }
    }
    this.texture.Unlock();
    this.Unlock();
    return fSuccess;
  }

  ReadJPEG(hGroup, iFlags) {
    let size = hGroup.AccessedEntrySize();
    let pData = P(new Uint8Array(size), 0);
    hGroup.Read$px$u64(pData, size);
    let cinfo = {};
    let jerr = new $.my_error_mgr().None();
    let buffer = null;
    let row_stride = 0;
    cinfo.err = jpeg$jpeg_std_error(jerr.pub);
    jerr.pub.error_exit = $.my_error_exit;
    jerr.pub.output_message = $.my_output_message;
    if (c$_setjmp($oat(jerr.setjmp_buffer, 0)) !== 0) {
      jpeg$jpeg_destroy_decompress(cinfo);
      $delete(pData);
      return false;
    }
    jpeg$jpeg_CreateDecompress(cinfo, 62, 0);
    let blub = {};
    cinfo.src = blub;
    blub.next_input_byte = pData;
    blub.bytes_in_buffer = size;
    blub.init_source = $.jpeg_noop;
    blub.fill_input_buffer = $.fill_input_buffer;
    blub.skip_input_data = $.skip_input_data;
    blub.resync_to_restart = jpeg$jpeg_resync_to_restart;
    blub.term_source = $.jpeg_noop;
    jpeg$jpeg_read_header(cinfo, 1);
    cinfo.out_color_space = 2 /*JCS_RGB*/;
    jpeg$jpeg_start_decompress(cinfo);
    if (!this.Create(cinfo.output_width | 0, cinfo.output_height | 0, iFlags)) {
      return false;
    }
    row_stride = Math.imul(cinfo.output_width, cinfo.output_components >>> 0) >>> 0 | 0;
    buffer = cinfo.mem.alloc_sarray(cinfo, 1, row_stride >>> 0, 1);
    if (!this.Lock()) {
      return false;
    }
    while (cinfo.output_scanline < cinfo.output_height) {
      jpeg$jpeg_read_scanlines(cinfo, buffer, 1);
      for (let i = 0; i < cinfo.output_width; i = i + 1 >>> 0) {
        let start = $padd(buffer.a[buffer.o + 0], Math.imul(i, cinfo.output_components >>> 0) >>> 0);
        let c = (((0xff000000 | ((start.a[start.o] & 255) >>> 0 << 16) >>> 0) >>> 0 | (($rd($padd(start, 1)) & 255) >>> 0 << 8) >>> 0) >>> 0 | ($rd($padd(start, 2)) & 255) >>> 0) >>> 0;
        this.SetPixDw(i | 0, cinfo.output_scanline - 1 >>> 0 | 0, c);
      }
    }
    this.Unlock();
    jpeg$jpeg_finish_decompress(cinfo);
    jpeg$jpeg_destroy_decompress(cinfo);
    $delete(pData);
    return true;
  }

  ReadBMP(hGroup, iFlags) {
    let lcnt = 0;
    let BitmapInfo = new $.C4BMP256Info();
    if (!hGroup.Read$px$u64($bytesView(BitmapInfo, [["Head.bfType", 0, "u16", 0], ["Head.bfSize", 2, "u32", 0], ["Head.bfReserved1", 6, "u16", 0], ["Head.bfReserved2", 8, "u16", 0], ["Head.bfOffBits", 10, "u32", 0], ["Info.biSize", 14, "u32", 0], ["Info.biWidth", 18, "i32", 0], ["Info.biHeight", 22, "i32", 0], ["Info.biPlanes", 26, "u16", 0], ["Info.biBitCount", 28, "u16", 0], ["Info.biCompression", 30, "u32", 0], ["Info.biSizeImage", 34, "u32", 0], ["Info.biXPelsPerMeter", 38, "i32", 0], ["Info.biYPelsPerMeter", 42, "i32", 0], ["Info.biClrUsed", 46, "u32", 0], ["Info.biClrImportant", 50, "u32", 0], ["Colors.0.rgbBlue", 54, "u8", 0], ["Colors.0.rgbGreen", 55, "u8", 0], ["Colors.0.rgbRed", 56, "u8", 0], ["Colors.0.rgbReserved", 57, "u8", 0], ["Colors.1.rgbBlue", 58, "u8", 0], ["Colors.1.rgbGreen", 59, "u8", 0], ["Colors.1.rgbRed", 60, "u8", 0], ["Colors.1.rgbReserved", 61, "u8", 0], ["Colors.2.rgbBlue", 62, "u8", 0], ["Colors.2.rgbGreen", 63, "u8", 0], ["Colors.2.rgbRed", 64, "u8", 0], ["Colors.2.rgbReserved", 65, "u8", 0], ["Colors.3.rgbBlue", 66, "u8", 0], ["Colors.3.rgbGreen", 67, "u8", 0], ["Colors.3.rgbRed", 68, "u8", 0], ["Colors.3.rgbReserved", 69, "u8", 0], ["Colors.4.rgbBlue", 70, "u8", 0], ["Colors.4.rgbGreen", 71, "u8", 0], ["Colors.4.rgbRed", 72, "u8", 0], ["Colors.4.rgbReserved", 73, "u8", 0], ["Colors.5.rgbBlue", 74, "u8", 0], ["Colors.5.rgbGreen", 75, "u8", 0], ["Colors.5.rgbRed", 76, "u8", 0], ["Colors.5.rgbReserved", 77, "u8", 0], ["Colors.6.rgbBlue", 78, "u8", 0], ["Colors.6.rgbGreen", 79, "u8", 0], ["Colors.6.rgbRed", 80, "u8", 0], ["Colors.6.rgbReserved", 81, "u8", 0], ["Colors.7.rgbBlue", 82, "u8", 0], ["Colors.7.rgbGreen", 83, "u8", 0], ["Colors.7.rgbRed", 84, "u8", 0], ["Colors.7.rgbReserved", 85, "u8", 0], ["Colors.8.rgbBlue", 86, "u8", 0], ["Colors.8.rgbGreen", 87, "u8", 0], ["Colors.8.rgbRed", 88, "u8", 0], ["Colors.8.rgbReserved", 89, "u8", 0], ["Colors.9.rgbBlue", 90, "u8", 0], ["Colors.9.rgbGreen", 91, "u8", 0], ["Colors.9.rgbRed", 92, "u8", 0], ["Colors.9.rgbReserved", 93, "u8", 0], ["Colors.10.rgbBlue", 94, "u8", 0], ["Colors.10.rgbGreen", 95, "u8", 0], ["Colors.10.rgbRed", 96, "u8", 0], ["Colors.10.rgbReserved", 97, "u8", 0], ["Colors.11.rgbBlue", 98, "u8", 0], ["Colors.11.rgbGreen", 99, "u8", 0], ["Colors.11.rgbRed", 100, "u8", 0], ["Colors.11.rgbReserved", 101, "u8", 0], ["Colors.12.rgbBlue", 102, "u8", 0], ["Colors.12.rgbGreen", 103, "u8", 0], ["Colors.12.rgbRed", 104, "u8", 0], ["Colors.12.rgbReserved", 105, "u8", 0], ["Colors.13.rgbBlue", 106, "u8", 0], ["Colors.13.rgbGreen", 107, "u8", 0], ["Colors.13.rgbRed", 108, "u8", 0], ["Colors.13.rgbReserved", 109, "u8", 0], ["Colors.14.rgbBlue", 110, "u8", 0], ["Colors.14.rgbGreen", 111, "u8", 0], ["Colors.14.rgbRed", 112, "u8", 0], ["Colors.14.rgbReserved", 113, "u8", 0], ["Colors.15.rgbBlue", 114, "u8", 0], ["Colors.15.rgbGreen", 115, "u8", 0], ["Colors.15.rgbRed", 116, "u8", 0], ["Colors.15.rgbReserved", 117, "u8", 0], ["Colors.16.rgbBlue", 118, "u8", 0], ["Colors.16.rgbGreen", 119, "u8", 0], ["Colors.16.rgbRed", 120, "u8", 0], ["Colors.16.rgbReserved", 121, "u8", 0], ["Colors.17.rgbBlue", 122, "u8", 0], ["Colors.17.rgbGreen", 123, "u8", 0], ["Colors.17.rgbRed", 124, "u8", 0], ["Colors.17.rgbReserved", 125, "u8", 0], ["Colors.18.rgbBlue", 126, "u8", 0], ["Colors.18.rgbGreen", 127, "u8", 0], ["Colors.18.rgbRed", 128, "u8", 0], ["Colors.18.rgbReserved", 129, "u8", 0], ["Colors.19.rgbBlue", 130, "u8", 0], ["Colors.19.rgbGreen", 131, "u8", 0], ["Colors.19.rgbRed", 132, "u8", 0], ["Colors.19.rgbReserved", 133, "u8", 0], ["Colors.20.rgbBlue", 134, "u8", 0], ["Colors.20.rgbGreen", 135, "u8", 0], ["Colors.20.rgbRed", 136, "u8", 0], ["Colors.20.rgbReserved", 137, "u8", 0], ["Colors.21.rgbBlue", 138, "u8", 0], ["Colors.21.rgbGreen", 139, "u8", 0], ["Colors.21.rgbRed", 140, "u8", 0], ["Colors.21.rgbReserved", 141, "u8", 0], ["Colors.22.rgbBlue", 142, "u8", 0], ["Colors.22.rgbGreen", 143, "u8", 0], ["Colors.22.rgbRed", 144, "u8", 0], ["Colors.22.rgbReserved", 145, "u8", 0], ["Colors.23.rgbBlue", 146, "u8", 0], ["Colors.23.rgbGreen", 147, "u8", 0], ["Colors.23.rgbRed", 148, "u8", 0], ["Colors.23.rgbReserved", 149, "u8", 0], ["Colors.24.rgbBlue", 150, "u8", 0], ["Colors.24.rgbGreen", 151, "u8", 0], ["Colors.24.rgbRed", 152, "u8", 0], ["Colors.24.rgbReserved", 153, "u8", 0], ["Colors.25.rgbBlue", 154, "u8", 0], ["Colors.25.rgbGreen", 155, "u8", 0], ["Colors.25.rgbRed", 156, "u8", 0], ["Colors.25.rgbReserved", 157, "u8", 0], ["Colors.26.rgbBlue", 158, "u8", 0], ["Colors.26.rgbGreen", 159, "u8", 0], ["Colors.26.rgbRed", 160, "u8", 0], ["Colors.26.rgbReserved", 161, "u8", 0], ["Colors.27.rgbBlue", 162, "u8", 0], ["Colors.27.rgbGreen", 163, "u8", 0], ["Colors.27.rgbRed", 164, "u8", 0], ["Colors.27.rgbReserved", 165, "u8", 0], ["Colors.28.rgbBlue", 166, "u8", 0], ["Colors.28.rgbGreen", 167, "u8", 0], ["Colors.28.rgbRed", 168, "u8", 0], ["Colors.28.rgbReserved", 169, "u8", 0], ["Colors.29.rgbBlue", 170, "u8", 0], ["Colors.29.rgbGreen", 171, "u8", 0], ["Colors.29.rgbRed", 172, "u8", 0], ["Colors.29.rgbReserved", 173, "u8", 0], ["Colors.30.rgbBlue", 174, "u8", 0], ["Colors.30.rgbGreen", 175, "u8", 0], ["Colors.30.rgbRed", 176, "u8", 0], ["Colors.30.rgbReserved", 177, "u8", 0], ["Colors.31.rgbBlue", 178, "u8", 0], ["Colors.31.rgbGreen", 179, "u8", 0], ["Colors.31.rgbRed", 180, "u8", 0], ["Colors.31.rgbReserved", 181, "u8", 0], ["Colors.32.rgbBlue", 182, "u8", 0], ["Colors.32.rgbGreen", 183, "u8", 0], ["Colors.32.rgbRed", 184, "u8", 0], ["Colors.32.rgbReserved", 185, "u8", 0], ["Colors.33.rgbBlue", 186, "u8", 0], ["Colors.33.rgbGreen", 187, "u8", 0], ["Colors.33.rgbRed", 188, "u8", 0], ["Colors.33.rgbReserved", 189, "u8", 0], ["Colors.34.rgbBlue", 190, "u8", 0], ["Colors.34.rgbGreen", 191, "u8", 0], ["Colors.34.rgbRed", 192, "u8", 0], ["Colors.34.rgbReserved", 193, "u8", 0], ["Colors.35.rgbBlue", 194, "u8", 0], ["Colors.35.rgbGreen", 195, "u8", 0], ["Colors.35.rgbRed", 196, "u8", 0], ["Colors.35.rgbReserved", 197, "u8", 0], ["Colors.36.rgbBlue", 198, "u8", 0], ["Colors.36.rgbGreen", 199, "u8", 0], ["Colors.36.rgbRed", 200, "u8", 0], ["Colors.36.rgbReserved", 201, "u8", 0], ["Colors.37.rgbBlue", 202, "u8", 0], ["Colors.37.rgbGreen", 203, "u8", 0], ["Colors.37.rgbRed", 204, "u8", 0], ["Colors.37.rgbReserved", 205, "u8", 0], ["Colors.38.rgbBlue", 206, "u8", 0], ["Colors.38.rgbGreen", 207, "u8", 0], ["Colors.38.rgbRed", 208, "u8", 0], ["Colors.38.rgbReserved", 209, "u8", 0], ["Colors.39.rgbBlue", 210, "u8", 0], ["Colors.39.rgbGreen", 211, "u8", 0], ["Colors.39.rgbRed", 212, "u8", 0], ["Colors.39.rgbReserved", 213, "u8", 0], ["Colors.40.rgbBlue", 214, "u8", 0], ["Colors.40.rgbGreen", 215, "u8", 0], ["Colors.40.rgbRed", 216, "u8", 0], ["Colors.40.rgbReserved", 217, "u8", 0], ["Colors.41.rgbBlue", 218, "u8", 0], ["Colors.41.rgbGreen", 219, "u8", 0], ["Colors.41.rgbRed", 220, "u8", 0], ["Colors.41.rgbReserved", 221, "u8", 0], ["Colors.42.rgbBlue", 222, "u8", 0], ["Colors.42.rgbGreen", 223, "u8", 0], ["Colors.42.rgbRed", 224, "u8", 0], ["Colors.42.rgbReserved", 225, "u8", 0], ["Colors.43.rgbBlue", 226, "u8", 0], ["Colors.43.rgbGreen", 227, "u8", 0], ["Colors.43.rgbRed", 228, "u8", 0], ["Colors.43.rgbReserved", 229, "u8", 0], ["Colors.44.rgbBlue", 230, "u8", 0], ["Colors.44.rgbGreen", 231, "u8", 0], ["Colors.44.rgbRed", 232, "u8", 0], ["Colors.44.rgbReserved", 233, "u8", 0], ["Colors.45.rgbBlue", 234, "u8", 0], ["Colors.45.rgbGreen", 235, "u8", 0], ["Colors.45.rgbRed", 236, "u8", 0], ["Colors.45.rgbReserved", 237, "u8", 0], ["Colors.46.rgbBlue", 238, "u8", 0], ["Colors.46.rgbGreen", 239, "u8", 0], ["Colors.46.rgbRed", 240, "u8", 0], ["Colors.46.rgbReserved", 241, "u8", 0], ["Colors.47.rgbBlue", 242, "u8", 0], ["Colors.47.rgbGreen", 243, "u8", 0], ["Colors.47.rgbRed", 244, "u8", 0], ["Colors.47.rgbReserved", 245, "u8", 0], ["Colors.48.rgbBlue", 246, "u8", 0], ["Colors.48.rgbGreen", 247, "u8", 0], ["Colors.48.rgbRed", 248, "u8", 0], ["Colors.48.rgbReserved", 249, "u8", 0], ["Colors.49.rgbBlue", 250, "u8", 0], ["Colors.49.rgbGreen", 251, "u8", 0], ["Colors.49.rgbRed", 252, "u8", 0], ["Colors.49.rgbReserved", 253, "u8", 0], ["Colors.50.rgbBlue", 254, "u8", 0], ["Colors.50.rgbGreen", 255, "u8", 0], ["Colors.50.rgbRed", 256, "u8", 0], ["Colors.50.rgbReserved", 257, "u8", 0], ["Colors.51.rgbBlue", 258, "u8", 0], ["Colors.51.rgbGreen", 259, "u8", 0], ["Colors.51.rgbRed", 260, "u8", 0], ["Colors.51.rgbReserved", 261, "u8", 0], ["Colors.52.rgbBlue", 262, "u8", 0], ["Colors.52.rgbGreen", 263, "u8", 0], ["Colors.52.rgbRed", 264, "u8", 0], ["Colors.52.rgbReserved", 265, "u8", 0], ["Colors.53.rgbBlue", 266, "u8", 0], ["Colors.53.rgbGreen", 267, "u8", 0], ["Colors.53.rgbRed", 268, "u8", 0], ["Colors.53.rgbReserved", 269, "u8", 0], ["Colors.54.rgbBlue", 270, "u8", 0], ["Colors.54.rgbGreen", 271, "u8", 0], ["Colors.54.rgbRed", 272, "u8", 0], ["Colors.54.rgbReserved", 273, "u8", 0], ["Colors.55.rgbBlue", 274, "u8", 0], ["Colors.55.rgbGreen", 275, "u8", 0], ["Colors.55.rgbRed", 276, "u8", 0], ["Colors.55.rgbReserved", 277, "u8", 0], ["Colors.56.rgbBlue", 278, "u8", 0], ["Colors.56.rgbGreen", 279, "u8", 0], ["Colors.56.rgbRed", 280, "u8", 0], ["Colors.56.rgbReserved", 281, "u8", 0], ["Colors.57.rgbBlue", 282, "u8", 0], ["Colors.57.rgbGreen", 283, "u8", 0], ["Colors.57.rgbRed", 284, "u8", 0], ["Colors.57.rgbReserved", 285, "u8", 0], ["Colors.58.rgbBlue", 286, "u8", 0], ["Colors.58.rgbGreen", 287, "u8", 0], ["Colors.58.rgbRed", 288, "u8", 0], ["Colors.58.rgbReserved", 289, "u8", 0], ["Colors.59.rgbBlue", 290, "u8", 0], ["Colors.59.rgbGreen", 291, "u8", 0], ["Colors.59.rgbRed", 292, "u8", 0], ["Colors.59.rgbReserved", 293, "u8", 0], ["Colors.60.rgbBlue", 294, "u8", 0], ["Colors.60.rgbGreen", 295, "u8", 0], ["Colors.60.rgbRed", 296, "u8", 0], ["Colors.60.rgbReserved", 297, "u8", 0], ["Colors.61.rgbBlue", 298, "u8", 0], ["Colors.61.rgbGreen", 299, "u8", 0], ["Colors.61.rgbRed", 300, "u8", 0], ["Colors.61.rgbReserved", 301, "u8", 0], ["Colors.62.rgbBlue", 302, "u8", 0], ["Colors.62.rgbGreen", 303, "u8", 0], ["Colors.62.rgbRed", 304, "u8", 0], ["Colors.62.rgbReserved", 305, "u8", 0], ["Colors.63.rgbBlue", 306, "u8", 0], ["Colors.63.rgbGreen", 307, "u8", 0], ["Colors.63.rgbRed", 308, "u8", 0], ["Colors.63.rgbReserved", 309, "u8", 0], ["Colors.64.rgbBlue", 310, "u8", 0], ["Colors.64.rgbGreen", 311, "u8", 0], ["Colors.64.rgbRed", 312, "u8", 0], ["Colors.64.rgbReserved", 313, "u8", 0], ["Colors.65.rgbBlue", 314, "u8", 0], ["Colors.65.rgbGreen", 315, "u8", 0], ["Colors.65.rgbRed", 316, "u8", 0], ["Colors.65.rgbReserved", 317, "u8", 0], ["Colors.66.rgbBlue", 318, "u8", 0], ["Colors.66.rgbGreen", 319, "u8", 0], ["Colors.66.rgbRed", 320, "u8", 0], ["Colors.66.rgbReserved", 321, "u8", 0], ["Colors.67.rgbBlue", 322, "u8", 0], ["Colors.67.rgbGreen", 323, "u8", 0], ["Colors.67.rgbRed", 324, "u8", 0], ["Colors.67.rgbReserved", 325, "u8", 0], ["Colors.68.rgbBlue", 326, "u8", 0], ["Colors.68.rgbGreen", 327, "u8", 0], ["Colors.68.rgbRed", 328, "u8", 0], ["Colors.68.rgbReserved", 329, "u8", 0], ["Colors.69.rgbBlue", 330, "u8", 0], ["Colors.69.rgbGreen", 331, "u8", 0], ["Colors.69.rgbRed", 332, "u8", 0], ["Colors.69.rgbReserved", 333, "u8", 0], ["Colors.70.rgbBlue", 334, "u8", 0], ["Colors.70.rgbGreen", 335, "u8", 0], ["Colors.70.rgbRed", 336, "u8", 0], ["Colors.70.rgbReserved", 337, "u8", 0], ["Colors.71.rgbBlue", 338, "u8", 0], ["Colors.71.rgbGreen", 339, "u8", 0], ["Colors.71.rgbRed", 340, "u8", 0], ["Colors.71.rgbReserved", 341, "u8", 0], ["Colors.72.rgbBlue", 342, "u8", 0], ["Colors.72.rgbGreen", 343, "u8", 0], ["Colors.72.rgbRed", 344, "u8", 0], ["Colors.72.rgbReserved", 345, "u8", 0], ["Colors.73.rgbBlue", 346, "u8", 0], ["Colors.73.rgbGreen", 347, "u8", 0], ["Colors.73.rgbRed", 348, "u8", 0], ["Colors.73.rgbReserved", 349, "u8", 0], ["Colors.74.rgbBlue", 350, "u8", 0], ["Colors.74.rgbGreen", 351, "u8", 0], ["Colors.74.rgbRed", 352, "u8", 0], ["Colors.74.rgbReserved", 353, "u8", 0], ["Colors.75.rgbBlue", 354, "u8", 0], ["Colors.75.rgbGreen", 355, "u8", 0], ["Colors.75.rgbRed", 356, "u8", 0], ["Colors.75.rgbReserved", 357, "u8", 0], ["Colors.76.rgbBlue", 358, "u8", 0], ["Colors.76.rgbGreen", 359, "u8", 0], ["Colors.76.rgbRed", 360, "u8", 0], ["Colors.76.rgbReserved", 361, "u8", 0], ["Colors.77.rgbBlue", 362, "u8", 0], ["Colors.77.rgbGreen", 363, "u8", 0], ["Colors.77.rgbRed", 364, "u8", 0], ["Colors.77.rgbReserved", 365, "u8", 0], ["Colors.78.rgbBlue", 366, "u8", 0], ["Colors.78.rgbGreen", 367, "u8", 0], ["Colors.78.rgbRed", 368, "u8", 0], ["Colors.78.rgbReserved", 369, "u8", 0], ["Colors.79.rgbBlue", 370, "u8", 0], ["Colors.79.rgbGreen", 371, "u8", 0], ["Colors.79.rgbRed", 372, "u8", 0], ["Colors.79.rgbReserved", 373, "u8", 0], ["Colors.80.rgbBlue", 374, "u8", 0], ["Colors.80.rgbGreen", 375, "u8", 0], ["Colors.80.rgbRed", 376, "u8", 0], ["Colors.80.rgbReserved", 377, "u8", 0], ["Colors.81.rgbBlue", 378, "u8", 0], ["Colors.81.rgbGreen", 379, "u8", 0], ["Colors.81.rgbRed", 380, "u8", 0], ["Colors.81.rgbReserved", 381, "u8", 0], ["Colors.82.rgbBlue", 382, "u8", 0], ["Colors.82.rgbGreen", 383, "u8", 0], ["Colors.82.rgbRed", 384, "u8", 0], ["Colors.82.rgbReserved", 385, "u8", 0], ["Colors.83.rgbBlue", 386, "u8", 0], ["Colors.83.rgbGreen", 387, "u8", 0], ["Colors.83.rgbRed", 388, "u8", 0], ["Colors.83.rgbReserved", 389, "u8", 0], ["Colors.84.rgbBlue", 390, "u8", 0], ["Colors.84.rgbGreen", 391, "u8", 0], ["Colors.84.rgbRed", 392, "u8", 0], ["Colors.84.rgbReserved", 393, "u8", 0], ["Colors.85.rgbBlue", 394, "u8", 0], ["Colors.85.rgbGreen", 395, "u8", 0], ["Colors.85.rgbRed", 396, "u8", 0], ["Colors.85.rgbReserved", 397, "u8", 0], ["Colors.86.rgbBlue", 398, "u8", 0], ["Colors.86.rgbGreen", 399, "u8", 0], ["Colors.86.rgbRed", 400, "u8", 0], ["Colors.86.rgbReserved", 401, "u8", 0], ["Colors.87.rgbBlue", 402, "u8", 0], ["Colors.87.rgbGreen", 403, "u8", 0], ["Colors.87.rgbRed", 404, "u8", 0], ["Colors.87.rgbReserved", 405, "u8", 0], ["Colors.88.rgbBlue", 406, "u8", 0], ["Colors.88.rgbGreen", 407, "u8", 0], ["Colors.88.rgbRed", 408, "u8", 0], ["Colors.88.rgbReserved", 409, "u8", 0], ["Colors.89.rgbBlue", 410, "u8", 0], ["Colors.89.rgbGreen", 411, "u8", 0], ["Colors.89.rgbRed", 412, "u8", 0], ["Colors.89.rgbReserved", 413, "u8", 0], ["Colors.90.rgbBlue", 414, "u8", 0], ["Colors.90.rgbGreen", 415, "u8", 0], ["Colors.90.rgbRed", 416, "u8", 0], ["Colors.90.rgbReserved", 417, "u8", 0], ["Colors.91.rgbBlue", 418, "u8", 0], ["Colors.91.rgbGreen", 419, "u8", 0], ["Colors.91.rgbRed", 420, "u8", 0], ["Colors.91.rgbReserved", 421, "u8", 0], ["Colors.92.rgbBlue", 422, "u8", 0], ["Colors.92.rgbGreen", 423, "u8", 0], ["Colors.92.rgbRed", 424, "u8", 0], ["Colors.92.rgbReserved", 425, "u8", 0], ["Colors.93.rgbBlue", 426, "u8", 0], ["Colors.93.rgbGreen", 427, "u8", 0], ["Colors.93.rgbRed", 428, "u8", 0], ["Colors.93.rgbReserved", 429, "u8", 0], ["Colors.94.rgbBlue", 430, "u8", 0], ["Colors.94.rgbGreen", 431, "u8", 0], ["Colors.94.rgbRed", 432, "u8", 0], ["Colors.94.rgbReserved", 433, "u8", 0], ["Colors.95.rgbBlue", 434, "u8", 0], ["Colors.95.rgbGreen", 435, "u8", 0], ["Colors.95.rgbRed", 436, "u8", 0], ["Colors.95.rgbReserved", 437, "u8", 0], ["Colors.96.rgbBlue", 438, "u8", 0], ["Colors.96.rgbGreen", 439, "u8", 0], ["Colors.96.rgbRed", 440, "u8", 0], ["Colors.96.rgbReserved", 441, "u8", 0], ["Colors.97.rgbBlue", 442, "u8", 0], ["Colors.97.rgbGreen", 443, "u8", 0], ["Colors.97.rgbRed", 444, "u8", 0], ["Colors.97.rgbReserved", 445, "u8", 0], ["Colors.98.rgbBlue", 446, "u8", 0], ["Colors.98.rgbGreen", 447, "u8", 0], ["Colors.98.rgbRed", 448, "u8", 0], ["Colors.98.rgbReserved", 449, "u8", 0], ["Colors.99.rgbBlue", 450, "u8", 0], ["Colors.99.rgbGreen", 451, "u8", 0], ["Colors.99.rgbRed", 452, "u8", 0], ["Colors.99.rgbReserved", 453, "u8", 0], ["Colors.100.rgbBlue", 454, "u8", 0], ["Colors.100.rgbGreen", 455, "u8", 0], ["Colors.100.rgbRed", 456, "u8", 0], ["Colors.100.rgbReserved", 457, "u8", 0], ["Colors.101.rgbBlue", 458, "u8", 0], ["Colors.101.rgbGreen", 459, "u8", 0], ["Colors.101.rgbRed", 460, "u8", 0], ["Colors.101.rgbReserved", 461, "u8", 0], ["Colors.102.rgbBlue", 462, "u8", 0], ["Colors.102.rgbGreen", 463, "u8", 0], ["Colors.102.rgbRed", 464, "u8", 0], ["Colors.102.rgbReserved", 465, "u8", 0], ["Colors.103.rgbBlue", 466, "u8", 0], ["Colors.103.rgbGreen", 467, "u8", 0], ["Colors.103.rgbRed", 468, "u8", 0], ["Colors.103.rgbReserved", 469, "u8", 0], ["Colors.104.rgbBlue", 470, "u8", 0], ["Colors.104.rgbGreen", 471, "u8", 0], ["Colors.104.rgbRed", 472, "u8", 0], ["Colors.104.rgbReserved", 473, "u8", 0], ["Colors.105.rgbBlue", 474, "u8", 0], ["Colors.105.rgbGreen", 475, "u8", 0], ["Colors.105.rgbRed", 476, "u8", 0], ["Colors.105.rgbReserved", 477, "u8", 0], ["Colors.106.rgbBlue", 478, "u8", 0], ["Colors.106.rgbGreen", 479, "u8", 0], ["Colors.106.rgbRed", 480, "u8", 0], ["Colors.106.rgbReserved", 481, "u8", 0], ["Colors.107.rgbBlue", 482, "u8", 0], ["Colors.107.rgbGreen", 483, "u8", 0], ["Colors.107.rgbRed", 484, "u8", 0], ["Colors.107.rgbReserved", 485, "u8", 0], ["Colors.108.rgbBlue", 486, "u8", 0], ["Colors.108.rgbGreen", 487, "u8", 0], ["Colors.108.rgbRed", 488, "u8", 0], ["Colors.108.rgbReserved", 489, "u8", 0], ["Colors.109.rgbBlue", 490, "u8", 0], ["Colors.109.rgbGreen", 491, "u8", 0], ["Colors.109.rgbRed", 492, "u8", 0], ["Colors.109.rgbReserved", 493, "u8", 0], ["Colors.110.rgbBlue", 494, "u8", 0], ["Colors.110.rgbGreen", 495, "u8", 0], ["Colors.110.rgbRed", 496, "u8", 0], ["Colors.110.rgbReserved", 497, "u8", 0], ["Colors.111.rgbBlue", 498, "u8", 0], ["Colors.111.rgbGreen", 499, "u8", 0], ["Colors.111.rgbRed", 500, "u8", 0], ["Colors.111.rgbReserved", 501, "u8", 0], ["Colors.112.rgbBlue", 502, "u8", 0], ["Colors.112.rgbGreen", 503, "u8", 0], ["Colors.112.rgbRed", 504, "u8", 0], ["Colors.112.rgbReserved", 505, "u8", 0], ["Colors.113.rgbBlue", 506, "u8", 0], ["Colors.113.rgbGreen", 507, "u8", 0], ["Colors.113.rgbRed", 508, "u8", 0], ["Colors.113.rgbReserved", 509, "u8", 0], ["Colors.114.rgbBlue", 510, "u8", 0], ["Colors.114.rgbGreen", 511, "u8", 0], ["Colors.114.rgbRed", 512, "u8", 0], ["Colors.114.rgbReserved", 513, "u8", 0], ["Colors.115.rgbBlue", 514, "u8", 0], ["Colors.115.rgbGreen", 515, "u8", 0], ["Colors.115.rgbRed", 516, "u8", 0], ["Colors.115.rgbReserved", 517, "u8", 0], ["Colors.116.rgbBlue", 518, "u8", 0], ["Colors.116.rgbGreen", 519, "u8", 0], ["Colors.116.rgbRed", 520, "u8", 0], ["Colors.116.rgbReserved", 521, "u8", 0], ["Colors.117.rgbBlue", 522, "u8", 0], ["Colors.117.rgbGreen", 523, "u8", 0], ["Colors.117.rgbRed", 524, "u8", 0], ["Colors.117.rgbReserved", 525, "u8", 0], ["Colors.118.rgbBlue", 526, "u8", 0], ["Colors.118.rgbGreen", 527, "u8", 0], ["Colors.118.rgbRed", 528, "u8", 0], ["Colors.118.rgbReserved", 529, "u8", 0], ["Colors.119.rgbBlue", 530, "u8", 0], ["Colors.119.rgbGreen", 531, "u8", 0], ["Colors.119.rgbRed", 532, "u8", 0], ["Colors.119.rgbReserved", 533, "u8", 0], ["Colors.120.rgbBlue", 534, "u8", 0], ["Colors.120.rgbGreen", 535, "u8", 0], ["Colors.120.rgbRed", 536, "u8", 0], ["Colors.120.rgbReserved", 537, "u8", 0], ["Colors.121.rgbBlue", 538, "u8", 0], ["Colors.121.rgbGreen", 539, "u8", 0], ["Colors.121.rgbRed", 540, "u8", 0], ["Colors.121.rgbReserved", 541, "u8", 0], ["Colors.122.rgbBlue", 542, "u8", 0], ["Colors.122.rgbGreen", 543, "u8", 0], ["Colors.122.rgbRed", 544, "u8", 0], ["Colors.122.rgbReserved", 545, "u8", 0], ["Colors.123.rgbBlue", 546, "u8", 0], ["Colors.123.rgbGreen", 547, "u8", 0], ["Colors.123.rgbRed", 548, "u8", 0], ["Colors.123.rgbReserved", 549, "u8", 0], ["Colors.124.rgbBlue", 550, "u8", 0], ["Colors.124.rgbGreen", 551, "u8", 0], ["Colors.124.rgbRed", 552, "u8", 0], ["Colors.124.rgbReserved", 553, "u8", 0], ["Colors.125.rgbBlue", 554, "u8", 0], ["Colors.125.rgbGreen", 555, "u8", 0], ["Colors.125.rgbRed", 556, "u8", 0], ["Colors.125.rgbReserved", 557, "u8", 0], ["Colors.126.rgbBlue", 558, "u8", 0], ["Colors.126.rgbGreen", 559, "u8", 0], ["Colors.126.rgbRed", 560, "u8", 0], ["Colors.126.rgbReserved", 561, "u8", 0], ["Colors.127.rgbBlue", 562, "u8", 0], ["Colors.127.rgbGreen", 563, "u8", 0], ["Colors.127.rgbRed", 564, "u8", 0], ["Colors.127.rgbReserved", 565, "u8", 0], ["Colors.128.rgbBlue", 566, "u8", 0], ["Colors.128.rgbGreen", 567, "u8", 0], ["Colors.128.rgbRed", 568, "u8", 0], ["Colors.128.rgbReserved", 569, "u8", 0], ["Colors.129.rgbBlue", 570, "u8", 0], ["Colors.129.rgbGreen", 571, "u8", 0], ["Colors.129.rgbRed", 572, "u8", 0], ["Colors.129.rgbReserved", 573, "u8", 0], ["Colors.130.rgbBlue", 574, "u8", 0], ["Colors.130.rgbGreen", 575, "u8", 0], ["Colors.130.rgbRed", 576, "u8", 0], ["Colors.130.rgbReserved", 577, "u8", 0], ["Colors.131.rgbBlue", 578, "u8", 0], ["Colors.131.rgbGreen", 579, "u8", 0], ["Colors.131.rgbRed", 580, "u8", 0], ["Colors.131.rgbReserved", 581, "u8", 0], ["Colors.132.rgbBlue", 582, "u8", 0], ["Colors.132.rgbGreen", 583, "u8", 0], ["Colors.132.rgbRed", 584, "u8", 0], ["Colors.132.rgbReserved", 585, "u8", 0], ["Colors.133.rgbBlue", 586, "u8", 0], ["Colors.133.rgbGreen", 587, "u8", 0], ["Colors.133.rgbRed", 588, "u8", 0], ["Colors.133.rgbReserved", 589, "u8", 0], ["Colors.134.rgbBlue", 590, "u8", 0], ["Colors.134.rgbGreen", 591, "u8", 0], ["Colors.134.rgbRed", 592, "u8", 0], ["Colors.134.rgbReserved", 593, "u8", 0], ["Colors.135.rgbBlue", 594, "u8", 0], ["Colors.135.rgbGreen", 595, "u8", 0], ["Colors.135.rgbRed", 596, "u8", 0], ["Colors.135.rgbReserved", 597, "u8", 0], ["Colors.136.rgbBlue", 598, "u8", 0], ["Colors.136.rgbGreen", 599, "u8", 0], ["Colors.136.rgbRed", 600, "u8", 0], ["Colors.136.rgbReserved", 601, "u8", 0], ["Colors.137.rgbBlue", 602, "u8", 0], ["Colors.137.rgbGreen", 603, "u8", 0], ["Colors.137.rgbRed", 604, "u8", 0], ["Colors.137.rgbReserved", 605, "u8", 0], ["Colors.138.rgbBlue", 606, "u8", 0], ["Colors.138.rgbGreen", 607, "u8", 0], ["Colors.138.rgbRed", 608, "u8", 0], ["Colors.138.rgbReserved", 609, "u8", 0], ["Colors.139.rgbBlue", 610, "u8", 0], ["Colors.139.rgbGreen", 611, "u8", 0], ["Colors.139.rgbRed", 612, "u8", 0], ["Colors.139.rgbReserved", 613, "u8", 0], ["Colors.140.rgbBlue", 614, "u8", 0], ["Colors.140.rgbGreen", 615, "u8", 0], ["Colors.140.rgbRed", 616, "u8", 0], ["Colors.140.rgbReserved", 617, "u8", 0], ["Colors.141.rgbBlue", 618, "u8", 0], ["Colors.141.rgbGreen", 619, "u8", 0], ["Colors.141.rgbRed", 620, "u8", 0], ["Colors.141.rgbReserved", 621, "u8", 0], ["Colors.142.rgbBlue", 622, "u8", 0], ["Colors.142.rgbGreen", 623, "u8", 0], ["Colors.142.rgbRed", 624, "u8", 0], ["Colors.142.rgbReserved", 625, "u8", 0], ["Colors.143.rgbBlue", 626, "u8", 0], ["Colors.143.rgbGreen", 627, "u8", 0], ["Colors.143.rgbRed", 628, "u8", 0], ["Colors.143.rgbReserved", 629, "u8", 0], ["Colors.144.rgbBlue", 630, "u8", 0], ["Colors.144.rgbGreen", 631, "u8", 0], ["Colors.144.rgbRed", 632, "u8", 0], ["Colors.144.rgbReserved", 633, "u8", 0], ["Colors.145.rgbBlue", 634, "u8", 0], ["Colors.145.rgbGreen", 635, "u8", 0], ["Colors.145.rgbRed", 636, "u8", 0], ["Colors.145.rgbReserved", 637, "u8", 0], ["Colors.146.rgbBlue", 638, "u8", 0], ["Colors.146.rgbGreen", 639, "u8", 0], ["Colors.146.rgbRed", 640, "u8", 0], ["Colors.146.rgbReserved", 641, "u8", 0], ["Colors.147.rgbBlue", 642, "u8", 0], ["Colors.147.rgbGreen", 643, "u8", 0], ["Colors.147.rgbRed", 644, "u8", 0], ["Colors.147.rgbReserved", 645, "u8", 0], ["Colors.148.rgbBlue", 646, "u8", 0], ["Colors.148.rgbGreen", 647, "u8", 0], ["Colors.148.rgbRed", 648, "u8", 0], ["Colors.148.rgbReserved", 649, "u8", 0], ["Colors.149.rgbBlue", 650, "u8", 0], ["Colors.149.rgbGreen", 651, "u8", 0], ["Colors.149.rgbRed", 652, "u8", 0], ["Colors.149.rgbReserved", 653, "u8", 0], ["Colors.150.rgbBlue", 654, "u8", 0], ["Colors.150.rgbGreen", 655, "u8", 0], ["Colors.150.rgbRed", 656, "u8", 0], ["Colors.150.rgbReserved", 657, "u8", 0], ["Colors.151.rgbBlue", 658, "u8", 0], ["Colors.151.rgbGreen", 659, "u8", 0], ["Colors.151.rgbRed", 660, "u8", 0], ["Colors.151.rgbReserved", 661, "u8", 0], ["Colors.152.rgbBlue", 662, "u8", 0], ["Colors.152.rgbGreen", 663, "u8", 0], ["Colors.152.rgbRed", 664, "u8", 0], ["Colors.152.rgbReserved", 665, "u8", 0], ["Colors.153.rgbBlue", 666, "u8", 0], ["Colors.153.rgbGreen", 667, "u8", 0], ["Colors.153.rgbRed", 668, "u8", 0], ["Colors.153.rgbReserved", 669, "u8", 0], ["Colors.154.rgbBlue", 670, "u8", 0], ["Colors.154.rgbGreen", 671, "u8", 0], ["Colors.154.rgbRed", 672, "u8", 0], ["Colors.154.rgbReserved", 673, "u8", 0], ["Colors.155.rgbBlue", 674, "u8", 0], ["Colors.155.rgbGreen", 675, "u8", 0], ["Colors.155.rgbRed", 676, "u8", 0], ["Colors.155.rgbReserved", 677, "u8", 0], ["Colors.156.rgbBlue", 678, "u8", 0], ["Colors.156.rgbGreen", 679, "u8", 0], ["Colors.156.rgbRed", 680, "u8", 0], ["Colors.156.rgbReserved", 681, "u8", 0], ["Colors.157.rgbBlue", 682, "u8", 0], ["Colors.157.rgbGreen", 683, "u8", 0], ["Colors.157.rgbRed", 684, "u8", 0], ["Colors.157.rgbReserved", 685, "u8", 0], ["Colors.158.rgbBlue", 686, "u8", 0], ["Colors.158.rgbGreen", 687, "u8", 0], ["Colors.158.rgbRed", 688, "u8", 0], ["Colors.158.rgbReserved", 689, "u8", 0], ["Colors.159.rgbBlue", 690, "u8", 0], ["Colors.159.rgbGreen", 691, "u8", 0], ["Colors.159.rgbRed", 692, "u8", 0], ["Colors.159.rgbReserved", 693, "u8", 0], ["Colors.160.rgbBlue", 694, "u8", 0], ["Colors.160.rgbGreen", 695, "u8", 0], ["Colors.160.rgbRed", 696, "u8", 0], ["Colors.160.rgbReserved", 697, "u8", 0], ["Colors.161.rgbBlue", 698, "u8", 0], ["Colors.161.rgbGreen", 699, "u8", 0], ["Colors.161.rgbRed", 700, "u8", 0], ["Colors.161.rgbReserved", 701, "u8", 0], ["Colors.162.rgbBlue", 702, "u8", 0], ["Colors.162.rgbGreen", 703, "u8", 0], ["Colors.162.rgbRed", 704, "u8", 0], ["Colors.162.rgbReserved", 705, "u8", 0], ["Colors.163.rgbBlue", 706, "u8", 0], ["Colors.163.rgbGreen", 707, "u8", 0], ["Colors.163.rgbRed", 708, "u8", 0], ["Colors.163.rgbReserved", 709, "u8", 0], ["Colors.164.rgbBlue", 710, "u8", 0], ["Colors.164.rgbGreen", 711, "u8", 0], ["Colors.164.rgbRed", 712, "u8", 0], ["Colors.164.rgbReserved", 713, "u8", 0], ["Colors.165.rgbBlue", 714, "u8", 0], ["Colors.165.rgbGreen", 715, "u8", 0], ["Colors.165.rgbRed", 716, "u8", 0], ["Colors.165.rgbReserved", 717, "u8", 0], ["Colors.166.rgbBlue", 718, "u8", 0], ["Colors.166.rgbGreen", 719, "u8", 0], ["Colors.166.rgbRed", 720, "u8", 0], ["Colors.166.rgbReserved", 721, "u8", 0], ["Colors.167.rgbBlue", 722, "u8", 0], ["Colors.167.rgbGreen", 723, "u8", 0], ["Colors.167.rgbRed", 724, "u8", 0], ["Colors.167.rgbReserved", 725, "u8", 0], ["Colors.168.rgbBlue", 726, "u8", 0], ["Colors.168.rgbGreen", 727, "u8", 0], ["Colors.168.rgbRed", 728, "u8", 0], ["Colors.168.rgbReserved", 729, "u8", 0], ["Colors.169.rgbBlue", 730, "u8", 0], ["Colors.169.rgbGreen", 731, "u8", 0], ["Colors.169.rgbRed", 732, "u8", 0], ["Colors.169.rgbReserved", 733, "u8", 0], ["Colors.170.rgbBlue", 734, "u8", 0], ["Colors.170.rgbGreen", 735, "u8", 0], ["Colors.170.rgbRed", 736, "u8", 0], ["Colors.170.rgbReserved", 737, "u8", 0], ["Colors.171.rgbBlue", 738, "u8", 0], ["Colors.171.rgbGreen", 739, "u8", 0], ["Colors.171.rgbRed", 740, "u8", 0], ["Colors.171.rgbReserved", 741, "u8", 0], ["Colors.172.rgbBlue", 742, "u8", 0], ["Colors.172.rgbGreen", 743, "u8", 0], ["Colors.172.rgbRed", 744, "u8", 0], ["Colors.172.rgbReserved", 745, "u8", 0], ["Colors.173.rgbBlue", 746, "u8", 0], ["Colors.173.rgbGreen", 747, "u8", 0], ["Colors.173.rgbRed", 748, "u8", 0], ["Colors.173.rgbReserved", 749, "u8", 0], ["Colors.174.rgbBlue", 750, "u8", 0], ["Colors.174.rgbGreen", 751, "u8", 0], ["Colors.174.rgbRed", 752, "u8", 0], ["Colors.174.rgbReserved", 753, "u8", 0], ["Colors.175.rgbBlue", 754, "u8", 0], ["Colors.175.rgbGreen", 755, "u8", 0], ["Colors.175.rgbRed", 756, "u8", 0], ["Colors.175.rgbReserved", 757, "u8", 0], ["Colors.176.rgbBlue", 758, "u8", 0], ["Colors.176.rgbGreen", 759, "u8", 0], ["Colors.176.rgbRed", 760, "u8", 0], ["Colors.176.rgbReserved", 761, "u8", 0], ["Colors.177.rgbBlue", 762, "u8", 0], ["Colors.177.rgbGreen", 763, "u8", 0], ["Colors.177.rgbRed", 764, "u8", 0], ["Colors.177.rgbReserved", 765, "u8", 0], ["Colors.178.rgbBlue", 766, "u8", 0], ["Colors.178.rgbGreen", 767, "u8", 0], ["Colors.178.rgbRed", 768, "u8", 0], ["Colors.178.rgbReserved", 769, "u8", 0], ["Colors.179.rgbBlue", 770, "u8", 0], ["Colors.179.rgbGreen", 771, "u8", 0], ["Colors.179.rgbRed", 772, "u8", 0], ["Colors.179.rgbReserved", 773, "u8", 0], ["Colors.180.rgbBlue", 774, "u8", 0], ["Colors.180.rgbGreen", 775, "u8", 0], ["Colors.180.rgbRed", 776, "u8", 0], ["Colors.180.rgbReserved", 777, "u8", 0], ["Colors.181.rgbBlue", 778, "u8", 0], ["Colors.181.rgbGreen", 779, "u8", 0], ["Colors.181.rgbRed", 780, "u8", 0], ["Colors.181.rgbReserved", 781, "u8", 0], ["Colors.182.rgbBlue", 782, "u8", 0], ["Colors.182.rgbGreen", 783, "u8", 0], ["Colors.182.rgbRed", 784, "u8", 0], ["Colors.182.rgbReserved", 785, "u8", 0], ["Colors.183.rgbBlue", 786, "u8", 0], ["Colors.183.rgbGreen", 787, "u8", 0], ["Colors.183.rgbRed", 788, "u8", 0], ["Colors.183.rgbReserved", 789, "u8", 0], ["Colors.184.rgbBlue", 790, "u8", 0], ["Colors.184.rgbGreen", 791, "u8", 0], ["Colors.184.rgbRed", 792, "u8", 0], ["Colors.184.rgbReserved", 793, "u8", 0], ["Colors.185.rgbBlue", 794, "u8", 0], ["Colors.185.rgbGreen", 795, "u8", 0], ["Colors.185.rgbRed", 796, "u8", 0], ["Colors.185.rgbReserved", 797, "u8", 0], ["Colors.186.rgbBlue", 798, "u8", 0], ["Colors.186.rgbGreen", 799, "u8", 0], ["Colors.186.rgbRed", 800, "u8", 0], ["Colors.186.rgbReserved", 801, "u8", 0], ["Colors.187.rgbBlue", 802, "u8", 0], ["Colors.187.rgbGreen", 803, "u8", 0], ["Colors.187.rgbRed", 804, "u8", 0], ["Colors.187.rgbReserved", 805, "u8", 0], ["Colors.188.rgbBlue", 806, "u8", 0], ["Colors.188.rgbGreen", 807, "u8", 0], ["Colors.188.rgbRed", 808, "u8", 0], ["Colors.188.rgbReserved", 809, "u8", 0], ["Colors.189.rgbBlue", 810, "u8", 0], ["Colors.189.rgbGreen", 811, "u8", 0], ["Colors.189.rgbRed", 812, "u8", 0], ["Colors.189.rgbReserved", 813, "u8", 0], ["Colors.190.rgbBlue", 814, "u8", 0], ["Colors.190.rgbGreen", 815, "u8", 0], ["Colors.190.rgbRed", 816, "u8", 0], ["Colors.190.rgbReserved", 817, "u8", 0], ["Colors.191.rgbBlue", 818, "u8", 0], ["Colors.191.rgbGreen", 819, "u8", 0], ["Colors.191.rgbRed", 820, "u8", 0], ["Colors.191.rgbReserved", 821, "u8", 0], ["Colors.192.rgbBlue", 822, "u8", 0], ["Colors.192.rgbGreen", 823, "u8", 0], ["Colors.192.rgbRed", 824, "u8", 0], ["Colors.192.rgbReserved", 825, "u8", 0], ["Colors.193.rgbBlue", 826, "u8", 0], ["Colors.193.rgbGreen", 827, "u8", 0], ["Colors.193.rgbRed", 828, "u8", 0], ["Colors.193.rgbReserved", 829, "u8", 0], ["Colors.194.rgbBlue", 830, "u8", 0], ["Colors.194.rgbGreen", 831, "u8", 0], ["Colors.194.rgbRed", 832, "u8", 0], ["Colors.194.rgbReserved", 833, "u8", 0], ["Colors.195.rgbBlue", 834, "u8", 0], ["Colors.195.rgbGreen", 835, "u8", 0], ["Colors.195.rgbRed", 836, "u8", 0], ["Colors.195.rgbReserved", 837, "u8", 0], ["Colors.196.rgbBlue", 838, "u8", 0], ["Colors.196.rgbGreen", 839, "u8", 0], ["Colors.196.rgbRed", 840, "u8", 0], ["Colors.196.rgbReserved", 841, "u8", 0], ["Colors.197.rgbBlue", 842, "u8", 0], ["Colors.197.rgbGreen", 843, "u8", 0], ["Colors.197.rgbRed", 844, "u8", 0], ["Colors.197.rgbReserved", 845, "u8", 0], ["Colors.198.rgbBlue", 846, "u8", 0], ["Colors.198.rgbGreen", 847, "u8", 0], ["Colors.198.rgbRed", 848, "u8", 0], ["Colors.198.rgbReserved", 849, "u8", 0], ["Colors.199.rgbBlue", 850, "u8", 0], ["Colors.199.rgbGreen", 851, "u8", 0], ["Colors.199.rgbRed", 852, "u8", 0], ["Colors.199.rgbReserved", 853, "u8", 0], ["Colors.200.rgbBlue", 854, "u8", 0], ["Colors.200.rgbGreen", 855, "u8", 0], ["Colors.200.rgbRed", 856, "u8", 0], ["Colors.200.rgbReserved", 857, "u8", 0], ["Colors.201.rgbBlue", 858, "u8", 0], ["Colors.201.rgbGreen", 859, "u8", 0], ["Colors.201.rgbRed", 860, "u8", 0], ["Colors.201.rgbReserved", 861, "u8", 0], ["Colors.202.rgbBlue", 862, "u8", 0], ["Colors.202.rgbGreen", 863, "u8", 0], ["Colors.202.rgbRed", 864, "u8", 0], ["Colors.202.rgbReserved", 865, "u8", 0], ["Colors.203.rgbBlue", 866, "u8", 0], ["Colors.203.rgbGreen", 867, "u8", 0], ["Colors.203.rgbRed", 868, "u8", 0], ["Colors.203.rgbReserved", 869, "u8", 0], ["Colors.204.rgbBlue", 870, "u8", 0], ["Colors.204.rgbGreen", 871, "u8", 0], ["Colors.204.rgbRed", 872, "u8", 0], ["Colors.204.rgbReserved", 873, "u8", 0], ["Colors.205.rgbBlue", 874, "u8", 0], ["Colors.205.rgbGreen", 875, "u8", 0], ["Colors.205.rgbRed", 876, "u8", 0], ["Colors.205.rgbReserved", 877, "u8", 0], ["Colors.206.rgbBlue", 878, "u8", 0], ["Colors.206.rgbGreen", 879, "u8", 0], ["Colors.206.rgbRed", 880, "u8", 0], ["Colors.206.rgbReserved", 881, "u8", 0], ["Colors.207.rgbBlue", 882, "u8", 0], ["Colors.207.rgbGreen", 883, "u8", 0], ["Colors.207.rgbRed", 884, "u8", 0], ["Colors.207.rgbReserved", 885, "u8", 0], ["Colors.208.rgbBlue", 886, "u8", 0], ["Colors.208.rgbGreen", 887, "u8", 0], ["Colors.208.rgbRed", 888, "u8", 0], ["Colors.208.rgbReserved", 889, "u8", 0], ["Colors.209.rgbBlue", 890, "u8", 0], ["Colors.209.rgbGreen", 891, "u8", 0], ["Colors.209.rgbRed", 892, "u8", 0], ["Colors.209.rgbReserved", 893, "u8", 0], ["Colors.210.rgbBlue", 894, "u8", 0], ["Colors.210.rgbGreen", 895, "u8", 0], ["Colors.210.rgbRed", 896, "u8", 0], ["Colors.210.rgbReserved", 897, "u8", 0], ["Colors.211.rgbBlue", 898, "u8", 0], ["Colors.211.rgbGreen", 899, "u8", 0], ["Colors.211.rgbRed", 900, "u8", 0], ["Colors.211.rgbReserved", 901, "u8", 0], ["Colors.212.rgbBlue", 902, "u8", 0], ["Colors.212.rgbGreen", 903, "u8", 0], ["Colors.212.rgbRed", 904, "u8", 0], ["Colors.212.rgbReserved", 905, "u8", 0], ["Colors.213.rgbBlue", 906, "u8", 0], ["Colors.213.rgbGreen", 907, "u8", 0], ["Colors.213.rgbRed", 908, "u8", 0], ["Colors.213.rgbReserved", 909, "u8", 0], ["Colors.214.rgbBlue", 910, "u8", 0], ["Colors.214.rgbGreen", 911, "u8", 0], ["Colors.214.rgbRed", 912, "u8", 0], ["Colors.214.rgbReserved", 913, "u8", 0], ["Colors.215.rgbBlue", 914, "u8", 0], ["Colors.215.rgbGreen", 915, "u8", 0], ["Colors.215.rgbRed", 916, "u8", 0], ["Colors.215.rgbReserved", 917, "u8", 0], ["Colors.216.rgbBlue", 918, "u8", 0], ["Colors.216.rgbGreen", 919, "u8", 0], ["Colors.216.rgbRed", 920, "u8", 0], ["Colors.216.rgbReserved", 921, "u8", 0], ["Colors.217.rgbBlue", 922, "u8", 0], ["Colors.217.rgbGreen", 923, "u8", 0], ["Colors.217.rgbRed", 924, "u8", 0], ["Colors.217.rgbReserved", 925, "u8", 0], ["Colors.218.rgbBlue", 926, "u8", 0], ["Colors.218.rgbGreen", 927, "u8", 0], ["Colors.218.rgbRed", 928, "u8", 0], ["Colors.218.rgbReserved", 929, "u8", 0], ["Colors.219.rgbBlue", 930, "u8", 0], ["Colors.219.rgbGreen", 931, "u8", 0], ["Colors.219.rgbRed", 932, "u8", 0], ["Colors.219.rgbReserved", 933, "u8", 0], ["Colors.220.rgbBlue", 934, "u8", 0], ["Colors.220.rgbGreen", 935, "u8", 0], ["Colors.220.rgbRed", 936, "u8", 0], ["Colors.220.rgbReserved", 937, "u8", 0], ["Colors.221.rgbBlue", 938, "u8", 0], ["Colors.221.rgbGreen", 939, "u8", 0], ["Colors.221.rgbRed", 940, "u8", 0], ["Colors.221.rgbReserved", 941, "u8", 0], ["Colors.222.rgbBlue", 942, "u8", 0], ["Colors.222.rgbGreen", 943, "u8", 0], ["Colors.222.rgbRed", 944, "u8", 0], ["Colors.222.rgbReserved", 945, "u8", 0], ["Colors.223.rgbBlue", 946, "u8", 0], ["Colors.223.rgbGreen", 947, "u8", 0], ["Colors.223.rgbRed", 948, "u8", 0], ["Colors.223.rgbReserved", 949, "u8", 0], ["Colors.224.rgbBlue", 950, "u8", 0], ["Colors.224.rgbGreen", 951, "u8", 0], ["Colors.224.rgbRed", 952, "u8", 0], ["Colors.224.rgbReserved", 953, "u8", 0], ["Colors.225.rgbBlue", 954, "u8", 0], ["Colors.225.rgbGreen", 955, "u8", 0], ["Colors.225.rgbRed", 956, "u8", 0], ["Colors.225.rgbReserved", 957, "u8", 0], ["Colors.226.rgbBlue", 958, "u8", 0], ["Colors.226.rgbGreen", 959, "u8", 0], ["Colors.226.rgbRed", 960, "u8", 0], ["Colors.226.rgbReserved", 961, "u8", 0], ["Colors.227.rgbBlue", 962, "u8", 0], ["Colors.227.rgbGreen", 963, "u8", 0], ["Colors.227.rgbRed", 964, "u8", 0], ["Colors.227.rgbReserved", 965, "u8", 0], ["Colors.228.rgbBlue", 966, "u8", 0], ["Colors.228.rgbGreen", 967, "u8", 0], ["Colors.228.rgbRed", 968, "u8", 0], ["Colors.228.rgbReserved", 969, "u8", 0], ["Colors.229.rgbBlue", 970, "u8", 0], ["Colors.229.rgbGreen", 971, "u8", 0], ["Colors.229.rgbRed", 972, "u8", 0], ["Colors.229.rgbReserved", 973, "u8", 0], ["Colors.230.rgbBlue", 974, "u8", 0], ["Colors.230.rgbGreen", 975, "u8", 0], ["Colors.230.rgbRed", 976, "u8", 0], ["Colors.230.rgbReserved", 977, "u8", 0], ["Colors.231.rgbBlue", 978, "u8", 0], ["Colors.231.rgbGreen", 979, "u8", 0], ["Colors.231.rgbRed", 980, "u8", 0], ["Colors.231.rgbReserved", 981, "u8", 0], ["Colors.232.rgbBlue", 982, "u8", 0], ["Colors.232.rgbGreen", 983, "u8", 0], ["Colors.232.rgbRed", 984, "u8", 0], ["Colors.232.rgbReserved", 985, "u8", 0], ["Colors.233.rgbBlue", 986, "u8", 0], ["Colors.233.rgbGreen", 987, "u8", 0], ["Colors.233.rgbRed", 988, "u8", 0], ["Colors.233.rgbReserved", 989, "u8", 0], ["Colors.234.rgbBlue", 990, "u8", 0], ["Colors.234.rgbGreen", 991, "u8", 0], ["Colors.234.rgbRed", 992, "u8", 0], ["Colors.234.rgbReserved", 993, "u8", 0], ["Colors.235.rgbBlue", 994, "u8", 0], ["Colors.235.rgbGreen", 995, "u8", 0], ["Colors.235.rgbRed", 996, "u8", 0], ["Colors.235.rgbReserved", 997, "u8", 0], ["Colors.236.rgbBlue", 998, "u8", 0], ["Colors.236.rgbGreen", 999, "u8", 0], ["Colors.236.rgbRed", 1000, "u8", 0], ["Colors.236.rgbReserved", 1001, "u8", 0], ["Colors.237.rgbBlue", 1002, "u8", 0], ["Colors.237.rgbGreen", 1003, "u8", 0], ["Colors.237.rgbRed", 1004, "u8", 0], ["Colors.237.rgbReserved", 1005, "u8", 0], ["Colors.238.rgbBlue", 1006, "u8", 0], ["Colors.238.rgbGreen", 1007, "u8", 0], ["Colors.238.rgbRed", 1008, "u8", 0], ["Colors.238.rgbReserved", 1009, "u8", 0], ["Colors.239.rgbBlue", 1010, "u8", 0], ["Colors.239.rgbGreen", 1011, "u8", 0], ["Colors.239.rgbRed", 1012, "u8", 0], ["Colors.239.rgbReserved", 1013, "u8", 0], ["Colors.240.rgbBlue", 1014, "u8", 0], ["Colors.240.rgbGreen", 1015, "u8", 0], ["Colors.240.rgbRed", 1016, "u8", 0], ["Colors.240.rgbReserved", 1017, "u8", 0], ["Colors.241.rgbBlue", 1018, "u8", 0], ["Colors.241.rgbGreen", 1019, "u8", 0], ["Colors.241.rgbRed", 1020, "u8", 0], ["Colors.241.rgbReserved", 1021, "u8", 0], ["Colors.242.rgbBlue", 1022, "u8", 0], ["Colors.242.rgbGreen", 1023, "u8", 0], ["Colors.242.rgbRed", 1024, "u8", 0], ["Colors.242.rgbReserved", 1025, "u8", 0], ["Colors.243.rgbBlue", 1026, "u8", 0], ["Colors.243.rgbGreen", 1027, "u8", 0], ["Colors.243.rgbRed", 1028, "u8", 0], ["Colors.243.rgbReserved", 1029, "u8", 0], ["Colors.244.rgbBlue", 1030, "u8", 0], ["Colors.244.rgbGreen", 1031, "u8", 0], ["Colors.244.rgbRed", 1032, "u8", 0], ["Colors.244.rgbReserved", 1033, "u8", 0], ["Colors.245.rgbBlue", 1034, "u8", 0], ["Colors.245.rgbGreen", 1035, "u8", 0], ["Colors.245.rgbRed", 1036, "u8", 0], ["Colors.245.rgbReserved", 1037, "u8", 0], ["Colors.246.rgbBlue", 1038, "u8", 0], ["Colors.246.rgbGreen", 1039, "u8", 0], ["Colors.246.rgbRed", 1040, "u8", 0], ["Colors.246.rgbReserved", 1041, "u8", 0], ["Colors.247.rgbBlue", 1042, "u8", 0], ["Colors.247.rgbGreen", 1043, "u8", 0], ["Colors.247.rgbRed", 1044, "u8", 0], ["Colors.247.rgbReserved", 1045, "u8", 0], ["Colors.248.rgbBlue", 1046, "u8", 0], ["Colors.248.rgbGreen", 1047, "u8", 0], ["Colors.248.rgbRed", 1048, "u8", 0], ["Colors.248.rgbReserved", 1049, "u8", 0], ["Colors.249.rgbBlue", 1050, "u8", 0], ["Colors.249.rgbGreen", 1051, "u8", 0], ["Colors.249.rgbRed", 1052, "u8", 0], ["Colors.249.rgbReserved", 1053, "u8", 0], ["Colors.250.rgbBlue", 1054, "u8", 0], ["Colors.250.rgbGreen", 1055, "u8", 0], ["Colors.250.rgbRed", 1056, "u8", 0], ["Colors.250.rgbReserved", 1057, "u8", 0], ["Colors.251.rgbBlue", 1058, "u8", 0], ["Colors.251.rgbGreen", 1059, "u8", 0], ["Colors.251.rgbRed", 1060, "u8", 0], ["Colors.251.rgbReserved", 1061, "u8", 0], ["Colors.252.rgbBlue", 1062, "u8", 0], ["Colors.252.rgbGreen", 1063, "u8", 0], ["Colors.252.rgbRed", 1064, "u8", 0], ["Colors.252.rgbReserved", 1065, "u8", 0], ["Colors.253.rgbBlue", 1066, "u8", 0], ["Colors.253.rgbGreen", 1067, "u8", 0], ["Colors.253.rgbRed", 1068, "u8", 0], ["Colors.253.rgbReserved", 1069, "u8", 0], ["Colors.254.rgbBlue", 1070, "u8", 0], ["Colors.254.rgbGreen", 1071, "u8", 0], ["Colors.254.rgbRed", 1072, "u8", 0], ["Colors.254.rgbReserved", 1073, "u8", 0], ["Colors.255.rgbBlue", 1074, "u8", 0], ["Colors.255.rgbGreen", 1075, "u8", 0], ["Colors.255.rgbRed", 1076, "u8", 0], ["Colors.255.rgbReserved", 1077, "u8", 0]], 1078), 54)) {
      return false;
    }
    if (BitmapInfo.Info.biBitCount === 8) {
      if (!hGroup.Read$px$u64($padd($bytesView(BitmapInfo, [["Head.bfType", 0, "u16", 0], ["Head.bfSize", 2, "u32", 0], ["Head.bfReserved1", 6, "u16", 0], ["Head.bfReserved2", 8, "u16", 0], ["Head.bfOffBits", 10, "u32", 0], ["Info.biSize", 14, "u32", 0], ["Info.biWidth", 18, "i32", 0], ["Info.biHeight", 22, "i32", 0], ["Info.biPlanes", 26, "u16", 0], ["Info.biBitCount", 28, "u16", 0], ["Info.biCompression", 30, "u32", 0], ["Info.biSizeImage", 34, "u32", 0], ["Info.biXPelsPerMeter", 38, "i32", 0], ["Info.biYPelsPerMeter", 42, "i32", 0], ["Info.biClrUsed", 46, "u32", 0], ["Info.biClrImportant", 50, "u32", 0], ["Colors.0.rgbBlue", 54, "u8", 0], ["Colors.0.rgbGreen", 55, "u8", 0], ["Colors.0.rgbRed", 56, "u8", 0], ["Colors.0.rgbReserved", 57, "u8", 0], ["Colors.1.rgbBlue", 58, "u8", 0], ["Colors.1.rgbGreen", 59, "u8", 0], ["Colors.1.rgbRed", 60, "u8", 0], ["Colors.1.rgbReserved", 61, "u8", 0], ["Colors.2.rgbBlue", 62, "u8", 0], ["Colors.2.rgbGreen", 63, "u8", 0], ["Colors.2.rgbRed", 64, "u8", 0], ["Colors.2.rgbReserved", 65, "u8", 0], ["Colors.3.rgbBlue", 66, "u8", 0], ["Colors.3.rgbGreen", 67, "u8", 0], ["Colors.3.rgbRed", 68, "u8", 0], ["Colors.3.rgbReserved", 69, "u8", 0], ["Colors.4.rgbBlue", 70, "u8", 0], ["Colors.4.rgbGreen", 71, "u8", 0], ["Colors.4.rgbRed", 72, "u8", 0], ["Colors.4.rgbReserved", 73, "u8", 0], ["Colors.5.rgbBlue", 74, "u8", 0], ["Colors.5.rgbGreen", 75, "u8", 0], ["Colors.5.rgbRed", 76, "u8", 0], ["Colors.5.rgbReserved", 77, "u8", 0], ["Colors.6.rgbBlue", 78, "u8", 0], ["Colors.6.rgbGreen", 79, "u8", 0], ["Colors.6.rgbRed", 80, "u8", 0], ["Colors.6.rgbReserved", 81, "u8", 0], ["Colors.7.rgbBlue", 82, "u8", 0], ["Colors.7.rgbGreen", 83, "u8", 0], ["Colors.7.rgbRed", 84, "u8", 0], ["Colors.7.rgbReserved", 85, "u8", 0], ["Colors.8.rgbBlue", 86, "u8", 0], ["Colors.8.rgbGreen", 87, "u8", 0], ["Colors.8.rgbRed", 88, "u8", 0], ["Colors.8.rgbReserved", 89, "u8", 0], ["Colors.9.rgbBlue", 90, "u8", 0], ["Colors.9.rgbGreen", 91, "u8", 0], ["Colors.9.rgbRed", 92, "u8", 0], ["Colors.9.rgbReserved", 93, "u8", 0], ["Colors.10.rgbBlue", 94, "u8", 0], ["Colors.10.rgbGreen", 95, "u8", 0], ["Colors.10.rgbRed", 96, "u8", 0], ["Colors.10.rgbReserved", 97, "u8", 0], ["Colors.11.rgbBlue", 98, "u8", 0], ["Colors.11.rgbGreen", 99, "u8", 0], ["Colors.11.rgbRed", 100, "u8", 0], ["Colors.11.rgbReserved", 101, "u8", 0], ["Colors.12.rgbBlue", 102, "u8", 0], ["Colors.12.rgbGreen", 103, "u8", 0], ["Colors.12.rgbRed", 104, "u8", 0], ["Colors.12.rgbReserved", 105, "u8", 0], ["Colors.13.rgbBlue", 106, "u8", 0], ["Colors.13.rgbGreen", 107, "u8", 0], ["Colors.13.rgbRed", 108, "u8", 0], ["Colors.13.rgbReserved", 109, "u8", 0], ["Colors.14.rgbBlue", 110, "u8", 0], ["Colors.14.rgbGreen", 111, "u8", 0], ["Colors.14.rgbRed", 112, "u8", 0], ["Colors.14.rgbReserved", 113, "u8", 0], ["Colors.15.rgbBlue", 114, "u8", 0], ["Colors.15.rgbGreen", 115, "u8", 0], ["Colors.15.rgbRed", 116, "u8", 0], ["Colors.15.rgbReserved", 117, "u8", 0], ["Colors.16.rgbBlue", 118, "u8", 0], ["Colors.16.rgbGreen", 119, "u8", 0], ["Colors.16.rgbRed", 120, "u8", 0], ["Colors.16.rgbReserved", 121, "u8", 0], ["Colors.17.rgbBlue", 122, "u8", 0], ["Colors.17.rgbGreen", 123, "u8", 0], ["Colors.17.rgbRed", 124, "u8", 0], ["Colors.17.rgbReserved", 125, "u8", 0], ["Colors.18.rgbBlue", 126, "u8", 0], ["Colors.18.rgbGreen", 127, "u8", 0], ["Colors.18.rgbRed", 128, "u8", 0], ["Colors.18.rgbReserved", 129, "u8", 0], ["Colors.19.rgbBlue", 130, "u8", 0], ["Colors.19.rgbGreen", 131, "u8", 0], ["Colors.19.rgbRed", 132, "u8", 0], ["Colors.19.rgbReserved", 133, "u8", 0], ["Colors.20.rgbBlue", 134, "u8", 0], ["Colors.20.rgbGreen", 135, "u8", 0], ["Colors.20.rgbRed", 136, "u8", 0], ["Colors.20.rgbReserved", 137, "u8", 0], ["Colors.21.rgbBlue", 138, "u8", 0], ["Colors.21.rgbGreen", 139, "u8", 0], ["Colors.21.rgbRed", 140, "u8", 0], ["Colors.21.rgbReserved", 141, "u8", 0], ["Colors.22.rgbBlue", 142, "u8", 0], ["Colors.22.rgbGreen", 143, "u8", 0], ["Colors.22.rgbRed", 144, "u8", 0], ["Colors.22.rgbReserved", 145, "u8", 0], ["Colors.23.rgbBlue", 146, "u8", 0], ["Colors.23.rgbGreen", 147, "u8", 0], ["Colors.23.rgbRed", 148, "u8", 0], ["Colors.23.rgbReserved", 149, "u8", 0], ["Colors.24.rgbBlue", 150, "u8", 0], ["Colors.24.rgbGreen", 151, "u8", 0], ["Colors.24.rgbRed", 152, "u8", 0], ["Colors.24.rgbReserved", 153, "u8", 0], ["Colors.25.rgbBlue", 154, "u8", 0], ["Colors.25.rgbGreen", 155, "u8", 0], ["Colors.25.rgbRed", 156, "u8", 0], ["Colors.25.rgbReserved", 157, "u8", 0], ["Colors.26.rgbBlue", 158, "u8", 0], ["Colors.26.rgbGreen", 159, "u8", 0], ["Colors.26.rgbRed", 160, "u8", 0], ["Colors.26.rgbReserved", 161, "u8", 0], ["Colors.27.rgbBlue", 162, "u8", 0], ["Colors.27.rgbGreen", 163, "u8", 0], ["Colors.27.rgbRed", 164, "u8", 0], ["Colors.27.rgbReserved", 165, "u8", 0], ["Colors.28.rgbBlue", 166, "u8", 0], ["Colors.28.rgbGreen", 167, "u8", 0], ["Colors.28.rgbRed", 168, "u8", 0], ["Colors.28.rgbReserved", 169, "u8", 0], ["Colors.29.rgbBlue", 170, "u8", 0], ["Colors.29.rgbGreen", 171, "u8", 0], ["Colors.29.rgbRed", 172, "u8", 0], ["Colors.29.rgbReserved", 173, "u8", 0], ["Colors.30.rgbBlue", 174, "u8", 0], ["Colors.30.rgbGreen", 175, "u8", 0], ["Colors.30.rgbRed", 176, "u8", 0], ["Colors.30.rgbReserved", 177, "u8", 0], ["Colors.31.rgbBlue", 178, "u8", 0], ["Colors.31.rgbGreen", 179, "u8", 0], ["Colors.31.rgbRed", 180, "u8", 0], ["Colors.31.rgbReserved", 181, "u8", 0], ["Colors.32.rgbBlue", 182, "u8", 0], ["Colors.32.rgbGreen", 183, "u8", 0], ["Colors.32.rgbRed", 184, "u8", 0], ["Colors.32.rgbReserved", 185, "u8", 0], ["Colors.33.rgbBlue", 186, "u8", 0], ["Colors.33.rgbGreen", 187, "u8", 0], ["Colors.33.rgbRed", 188, "u8", 0], ["Colors.33.rgbReserved", 189, "u8", 0], ["Colors.34.rgbBlue", 190, "u8", 0], ["Colors.34.rgbGreen", 191, "u8", 0], ["Colors.34.rgbRed", 192, "u8", 0], ["Colors.34.rgbReserved", 193, "u8", 0], ["Colors.35.rgbBlue", 194, "u8", 0], ["Colors.35.rgbGreen", 195, "u8", 0], ["Colors.35.rgbRed", 196, "u8", 0], ["Colors.35.rgbReserved", 197, "u8", 0], ["Colors.36.rgbBlue", 198, "u8", 0], ["Colors.36.rgbGreen", 199, "u8", 0], ["Colors.36.rgbRed", 200, "u8", 0], ["Colors.36.rgbReserved", 201, "u8", 0], ["Colors.37.rgbBlue", 202, "u8", 0], ["Colors.37.rgbGreen", 203, "u8", 0], ["Colors.37.rgbRed", 204, "u8", 0], ["Colors.37.rgbReserved", 205, "u8", 0], ["Colors.38.rgbBlue", 206, "u8", 0], ["Colors.38.rgbGreen", 207, "u8", 0], ["Colors.38.rgbRed", 208, "u8", 0], ["Colors.38.rgbReserved", 209, "u8", 0], ["Colors.39.rgbBlue", 210, "u8", 0], ["Colors.39.rgbGreen", 211, "u8", 0], ["Colors.39.rgbRed", 212, "u8", 0], ["Colors.39.rgbReserved", 213, "u8", 0], ["Colors.40.rgbBlue", 214, "u8", 0], ["Colors.40.rgbGreen", 215, "u8", 0], ["Colors.40.rgbRed", 216, "u8", 0], ["Colors.40.rgbReserved", 217, "u8", 0], ["Colors.41.rgbBlue", 218, "u8", 0], ["Colors.41.rgbGreen", 219, "u8", 0], ["Colors.41.rgbRed", 220, "u8", 0], ["Colors.41.rgbReserved", 221, "u8", 0], ["Colors.42.rgbBlue", 222, "u8", 0], ["Colors.42.rgbGreen", 223, "u8", 0], ["Colors.42.rgbRed", 224, "u8", 0], ["Colors.42.rgbReserved", 225, "u8", 0], ["Colors.43.rgbBlue", 226, "u8", 0], ["Colors.43.rgbGreen", 227, "u8", 0], ["Colors.43.rgbRed", 228, "u8", 0], ["Colors.43.rgbReserved", 229, "u8", 0], ["Colors.44.rgbBlue", 230, "u8", 0], ["Colors.44.rgbGreen", 231, "u8", 0], ["Colors.44.rgbRed", 232, "u8", 0], ["Colors.44.rgbReserved", 233, "u8", 0], ["Colors.45.rgbBlue", 234, "u8", 0], ["Colors.45.rgbGreen", 235, "u8", 0], ["Colors.45.rgbRed", 236, "u8", 0], ["Colors.45.rgbReserved", 237, "u8", 0], ["Colors.46.rgbBlue", 238, "u8", 0], ["Colors.46.rgbGreen", 239, "u8", 0], ["Colors.46.rgbRed", 240, "u8", 0], ["Colors.46.rgbReserved", 241, "u8", 0], ["Colors.47.rgbBlue", 242, "u8", 0], ["Colors.47.rgbGreen", 243, "u8", 0], ["Colors.47.rgbRed", 244, "u8", 0], ["Colors.47.rgbReserved", 245, "u8", 0], ["Colors.48.rgbBlue", 246, "u8", 0], ["Colors.48.rgbGreen", 247, "u8", 0], ["Colors.48.rgbRed", 248, "u8", 0], ["Colors.48.rgbReserved", 249, "u8", 0], ["Colors.49.rgbBlue", 250, "u8", 0], ["Colors.49.rgbGreen", 251, "u8", 0], ["Colors.49.rgbRed", 252, "u8", 0], ["Colors.49.rgbReserved", 253, "u8", 0], ["Colors.50.rgbBlue", 254, "u8", 0], ["Colors.50.rgbGreen", 255, "u8", 0], ["Colors.50.rgbRed", 256, "u8", 0], ["Colors.50.rgbReserved", 257, "u8", 0], ["Colors.51.rgbBlue", 258, "u8", 0], ["Colors.51.rgbGreen", 259, "u8", 0], ["Colors.51.rgbRed", 260, "u8", 0], ["Colors.51.rgbReserved", 261, "u8", 0], ["Colors.52.rgbBlue", 262, "u8", 0], ["Colors.52.rgbGreen", 263, "u8", 0], ["Colors.52.rgbRed", 264, "u8", 0], ["Colors.52.rgbReserved", 265, "u8", 0], ["Colors.53.rgbBlue", 266, "u8", 0], ["Colors.53.rgbGreen", 267, "u8", 0], ["Colors.53.rgbRed", 268, "u8", 0], ["Colors.53.rgbReserved", 269, "u8", 0], ["Colors.54.rgbBlue", 270, "u8", 0], ["Colors.54.rgbGreen", 271, "u8", 0], ["Colors.54.rgbRed", 272, "u8", 0], ["Colors.54.rgbReserved", 273, "u8", 0], ["Colors.55.rgbBlue", 274, "u8", 0], ["Colors.55.rgbGreen", 275, "u8", 0], ["Colors.55.rgbRed", 276, "u8", 0], ["Colors.55.rgbReserved", 277, "u8", 0], ["Colors.56.rgbBlue", 278, "u8", 0], ["Colors.56.rgbGreen", 279, "u8", 0], ["Colors.56.rgbRed", 280, "u8", 0], ["Colors.56.rgbReserved", 281, "u8", 0], ["Colors.57.rgbBlue", 282, "u8", 0], ["Colors.57.rgbGreen", 283, "u8", 0], ["Colors.57.rgbRed", 284, "u8", 0], ["Colors.57.rgbReserved", 285, "u8", 0], ["Colors.58.rgbBlue", 286, "u8", 0], ["Colors.58.rgbGreen", 287, "u8", 0], ["Colors.58.rgbRed", 288, "u8", 0], ["Colors.58.rgbReserved", 289, "u8", 0], ["Colors.59.rgbBlue", 290, "u8", 0], ["Colors.59.rgbGreen", 291, "u8", 0], ["Colors.59.rgbRed", 292, "u8", 0], ["Colors.59.rgbReserved", 293, "u8", 0], ["Colors.60.rgbBlue", 294, "u8", 0], ["Colors.60.rgbGreen", 295, "u8", 0], ["Colors.60.rgbRed", 296, "u8", 0], ["Colors.60.rgbReserved", 297, "u8", 0], ["Colors.61.rgbBlue", 298, "u8", 0], ["Colors.61.rgbGreen", 299, "u8", 0], ["Colors.61.rgbRed", 300, "u8", 0], ["Colors.61.rgbReserved", 301, "u8", 0], ["Colors.62.rgbBlue", 302, "u8", 0], ["Colors.62.rgbGreen", 303, "u8", 0], ["Colors.62.rgbRed", 304, "u8", 0], ["Colors.62.rgbReserved", 305, "u8", 0], ["Colors.63.rgbBlue", 306, "u8", 0], ["Colors.63.rgbGreen", 307, "u8", 0], ["Colors.63.rgbRed", 308, "u8", 0], ["Colors.63.rgbReserved", 309, "u8", 0], ["Colors.64.rgbBlue", 310, "u8", 0], ["Colors.64.rgbGreen", 311, "u8", 0], ["Colors.64.rgbRed", 312, "u8", 0], ["Colors.64.rgbReserved", 313, "u8", 0], ["Colors.65.rgbBlue", 314, "u8", 0], ["Colors.65.rgbGreen", 315, "u8", 0], ["Colors.65.rgbRed", 316, "u8", 0], ["Colors.65.rgbReserved", 317, "u8", 0], ["Colors.66.rgbBlue", 318, "u8", 0], ["Colors.66.rgbGreen", 319, "u8", 0], ["Colors.66.rgbRed", 320, "u8", 0], ["Colors.66.rgbReserved", 321, "u8", 0], ["Colors.67.rgbBlue", 322, "u8", 0], ["Colors.67.rgbGreen", 323, "u8", 0], ["Colors.67.rgbRed", 324, "u8", 0], ["Colors.67.rgbReserved", 325, "u8", 0], ["Colors.68.rgbBlue", 326, "u8", 0], ["Colors.68.rgbGreen", 327, "u8", 0], ["Colors.68.rgbRed", 328, "u8", 0], ["Colors.68.rgbReserved", 329, "u8", 0], ["Colors.69.rgbBlue", 330, "u8", 0], ["Colors.69.rgbGreen", 331, "u8", 0], ["Colors.69.rgbRed", 332, "u8", 0], ["Colors.69.rgbReserved", 333, "u8", 0], ["Colors.70.rgbBlue", 334, "u8", 0], ["Colors.70.rgbGreen", 335, "u8", 0], ["Colors.70.rgbRed", 336, "u8", 0], ["Colors.70.rgbReserved", 337, "u8", 0], ["Colors.71.rgbBlue", 338, "u8", 0], ["Colors.71.rgbGreen", 339, "u8", 0], ["Colors.71.rgbRed", 340, "u8", 0], ["Colors.71.rgbReserved", 341, "u8", 0], ["Colors.72.rgbBlue", 342, "u8", 0], ["Colors.72.rgbGreen", 343, "u8", 0], ["Colors.72.rgbRed", 344, "u8", 0], ["Colors.72.rgbReserved", 345, "u8", 0], ["Colors.73.rgbBlue", 346, "u8", 0], ["Colors.73.rgbGreen", 347, "u8", 0], ["Colors.73.rgbRed", 348, "u8", 0], ["Colors.73.rgbReserved", 349, "u8", 0], ["Colors.74.rgbBlue", 350, "u8", 0], ["Colors.74.rgbGreen", 351, "u8", 0], ["Colors.74.rgbRed", 352, "u8", 0], ["Colors.74.rgbReserved", 353, "u8", 0], ["Colors.75.rgbBlue", 354, "u8", 0], ["Colors.75.rgbGreen", 355, "u8", 0], ["Colors.75.rgbRed", 356, "u8", 0], ["Colors.75.rgbReserved", 357, "u8", 0], ["Colors.76.rgbBlue", 358, "u8", 0], ["Colors.76.rgbGreen", 359, "u8", 0], ["Colors.76.rgbRed", 360, "u8", 0], ["Colors.76.rgbReserved", 361, "u8", 0], ["Colors.77.rgbBlue", 362, "u8", 0], ["Colors.77.rgbGreen", 363, "u8", 0], ["Colors.77.rgbRed", 364, "u8", 0], ["Colors.77.rgbReserved", 365, "u8", 0], ["Colors.78.rgbBlue", 366, "u8", 0], ["Colors.78.rgbGreen", 367, "u8", 0], ["Colors.78.rgbRed", 368, "u8", 0], ["Colors.78.rgbReserved", 369, "u8", 0], ["Colors.79.rgbBlue", 370, "u8", 0], ["Colors.79.rgbGreen", 371, "u8", 0], ["Colors.79.rgbRed", 372, "u8", 0], ["Colors.79.rgbReserved", 373, "u8", 0], ["Colors.80.rgbBlue", 374, "u8", 0], ["Colors.80.rgbGreen", 375, "u8", 0], ["Colors.80.rgbRed", 376, "u8", 0], ["Colors.80.rgbReserved", 377, "u8", 0], ["Colors.81.rgbBlue", 378, "u8", 0], ["Colors.81.rgbGreen", 379, "u8", 0], ["Colors.81.rgbRed", 380, "u8", 0], ["Colors.81.rgbReserved", 381, "u8", 0], ["Colors.82.rgbBlue", 382, "u8", 0], ["Colors.82.rgbGreen", 383, "u8", 0], ["Colors.82.rgbRed", 384, "u8", 0], ["Colors.82.rgbReserved", 385, "u8", 0], ["Colors.83.rgbBlue", 386, "u8", 0], ["Colors.83.rgbGreen", 387, "u8", 0], ["Colors.83.rgbRed", 388, "u8", 0], ["Colors.83.rgbReserved", 389, "u8", 0], ["Colors.84.rgbBlue", 390, "u8", 0], ["Colors.84.rgbGreen", 391, "u8", 0], ["Colors.84.rgbRed", 392, "u8", 0], ["Colors.84.rgbReserved", 393, "u8", 0], ["Colors.85.rgbBlue", 394, "u8", 0], ["Colors.85.rgbGreen", 395, "u8", 0], ["Colors.85.rgbRed", 396, "u8", 0], ["Colors.85.rgbReserved", 397, "u8", 0], ["Colors.86.rgbBlue", 398, "u8", 0], ["Colors.86.rgbGreen", 399, "u8", 0], ["Colors.86.rgbRed", 400, "u8", 0], ["Colors.86.rgbReserved", 401, "u8", 0], ["Colors.87.rgbBlue", 402, "u8", 0], ["Colors.87.rgbGreen", 403, "u8", 0], ["Colors.87.rgbRed", 404, "u8", 0], ["Colors.87.rgbReserved", 405, "u8", 0], ["Colors.88.rgbBlue", 406, "u8", 0], ["Colors.88.rgbGreen", 407, "u8", 0], ["Colors.88.rgbRed", 408, "u8", 0], ["Colors.88.rgbReserved", 409, "u8", 0], ["Colors.89.rgbBlue", 410, "u8", 0], ["Colors.89.rgbGreen", 411, "u8", 0], ["Colors.89.rgbRed", 412, "u8", 0], ["Colors.89.rgbReserved", 413, "u8", 0], ["Colors.90.rgbBlue", 414, "u8", 0], ["Colors.90.rgbGreen", 415, "u8", 0], ["Colors.90.rgbRed", 416, "u8", 0], ["Colors.90.rgbReserved", 417, "u8", 0], ["Colors.91.rgbBlue", 418, "u8", 0], ["Colors.91.rgbGreen", 419, "u8", 0], ["Colors.91.rgbRed", 420, "u8", 0], ["Colors.91.rgbReserved", 421, "u8", 0], ["Colors.92.rgbBlue", 422, "u8", 0], ["Colors.92.rgbGreen", 423, "u8", 0], ["Colors.92.rgbRed", 424, "u8", 0], ["Colors.92.rgbReserved", 425, "u8", 0], ["Colors.93.rgbBlue", 426, "u8", 0], ["Colors.93.rgbGreen", 427, "u8", 0], ["Colors.93.rgbRed", 428, "u8", 0], ["Colors.93.rgbReserved", 429, "u8", 0], ["Colors.94.rgbBlue", 430, "u8", 0], ["Colors.94.rgbGreen", 431, "u8", 0], ["Colors.94.rgbRed", 432, "u8", 0], ["Colors.94.rgbReserved", 433, "u8", 0], ["Colors.95.rgbBlue", 434, "u8", 0], ["Colors.95.rgbGreen", 435, "u8", 0], ["Colors.95.rgbRed", 436, "u8", 0], ["Colors.95.rgbReserved", 437, "u8", 0], ["Colors.96.rgbBlue", 438, "u8", 0], ["Colors.96.rgbGreen", 439, "u8", 0], ["Colors.96.rgbRed", 440, "u8", 0], ["Colors.96.rgbReserved", 441, "u8", 0], ["Colors.97.rgbBlue", 442, "u8", 0], ["Colors.97.rgbGreen", 443, "u8", 0], ["Colors.97.rgbRed", 444, "u8", 0], ["Colors.97.rgbReserved", 445, "u8", 0], ["Colors.98.rgbBlue", 446, "u8", 0], ["Colors.98.rgbGreen", 447, "u8", 0], ["Colors.98.rgbRed", 448, "u8", 0], ["Colors.98.rgbReserved", 449, "u8", 0], ["Colors.99.rgbBlue", 450, "u8", 0], ["Colors.99.rgbGreen", 451, "u8", 0], ["Colors.99.rgbRed", 452, "u8", 0], ["Colors.99.rgbReserved", 453, "u8", 0], ["Colors.100.rgbBlue", 454, "u8", 0], ["Colors.100.rgbGreen", 455, "u8", 0], ["Colors.100.rgbRed", 456, "u8", 0], ["Colors.100.rgbReserved", 457, "u8", 0], ["Colors.101.rgbBlue", 458, "u8", 0], ["Colors.101.rgbGreen", 459, "u8", 0], ["Colors.101.rgbRed", 460, "u8", 0], ["Colors.101.rgbReserved", 461, "u8", 0], ["Colors.102.rgbBlue", 462, "u8", 0], ["Colors.102.rgbGreen", 463, "u8", 0], ["Colors.102.rgbRed", 464, "u8", 0], ["Colors.102.rgbReserved", 465, "u8", 0], ["Colors.103.rgbBlue", 466, "u8", 0], ["Colors.103.rgbGreen", 467, "u8", 0], ["Colors.103.rgbRed", 468, "u8", 0], ["Colors.103.rgbReserved", 469, "u8", 0], ["Colors.104.rgbBlue", 470, "u8", 0], ["Colors.104.rgbGreen", 471, "u8", 0], ["Colors.104.rgbRed", 472, "u8", 0], ["Colors.104.rgbReserved", 473, "u8", 0], ["Colors.105.rgbBlue", 474, "u8", 0], ["Colors.105.rgbGreen", 475, "u8", 0], ["Colors.105.rgbRed", 476, "u8", 0], ["Colors.105.rgbReserved", 477, "u8", 0], ["Colors.106.rgbBlue", 478, "u8", 0], ["Colors.106.rgbGreen", 479, "u8", 0], ["Colors.106.rgbRed", 480, "u8", 0], ["Colors.106.rgbReserved", 481, "u8", 0], ["Colors.107.rgbBlue", 482, "u8", 0], ["Colors.107.rgbGreen", 483, "u8", 0], ["Colors.107.rgbRed", 484, "u8", 0], ["Colors.107.rgbReserved", 485, "u8", 0], ["Colors.108.rgbBlue", 486, "u8", 0], ["Colors.108.rgbGreen", 487, "u8", 0], ["Colors.108.rgbRed", 488, "u8", 0], ["Colors.108.rgbReserved", 489, "u8", 0], ["Colors.109.rgbBlue", 490, "u8", 0], ["Colors.109.rgbGreen", 491, "u8", 0], ["Colors.109.rgbRed", 492, "u8", 0], ["Colors.109.rgbReserved", 493, "u8", 0], ["Colors.110.rgbBlue", 494, "u8", 0], ["Colors.110.rgbGreen", 495, "u8", 0], ["Colors.110.rgbRed", 496, "u8", 0], ["Colors.110.rgbReserved", 497, "u8", 0], ["Colors.111.rgbBlue", 498, "u8", 0], ["Colors.111.rgbGreen", 499, "u8", 0], ["Colors.111.rgbRed", 500, "u8", 0], ["Colors.111.rgbReserved", 501, "u8", 0], ["Colors.112.rgbBlue", 502, "u8", 0], ["Colors.112.rgbGreen", 503, "u8", 0], ["Colors.112.rgbRed", 504, "u8", 0], ["Colors.112.rgbReserved", 505, "u8", 0], ["Colors.113.rgbBlue", 506, "u8", 0], ["Colors.113.rgbGreen", 507, "u8", 0], ["Colors.113.rgbRed", 508, "u8", 0], ["Colors.113.rgbReserved", 509, "u8", 0], ["Colors.114.rgbBlue", 510, "u8", 0], ["Colors.114.rgbGreen", 511, "u8", 0], ["Colors.114.rgbRed", 512, "u8", 0], ["Colors.114.rgbReserved", 513, "u8", 0], ["Colors.115.rgbBlue", 514, "u8", 0], ["Colors.115.rgbGreen", 515, "u8", 0], ["Colors.115.rgbRed", 516, "u8", 0], ["Colors.115.rgbReserved", 517, "u8", 0], ["Colors.116.rgbBlue", 518, "u8", 0], ["Colors.116.rgbGreen", 519, "u8", 0], ["Colors.116.rgbRed", 520, "u8", 0], ["Colors.116.rgbReserved", 521, "u8", 0], ["Colors.117.rgbBlue", 522, "u8", 0], ["Colors.117.rgbGreen", 523, "u8", 0], ["Colors.117.rgbRed", 524, "u8", 0], ["Colors.117.rgbReserved", 525, "u8", 0], ["Colors.118.rgbBlue", 526, "u8", 0], ["Colors.118.rgbGreen", 527, "u8", 0], ["Colors.118.rgbRed", 528, "u8", 0], ["Colors.118.rgbReserved", 529, "u8", 0], ["Colors.119.rgbBlue", 530, "u8", 0], ["Colors.119.rgbGreen", 531, "u8", 0], ["Colors.119.rgbRed", 532, "u8", 0], ["Colors.119.rgbReserved", 533, "u8", 0], ["Colors.120.rgbBlue", 534, "u8", 0], ["Colors.120.rgbGreen", 535, "u8", 0], ["Colors.120.rgbRed", 536, "u8", 0], ["Colors.120.rgbReserved", 537, "u8", 0], ["Colors.121.rgbBlue", 538, "u8", 0], ["Colors.121.rgbGreen", 539, "u8", 0], ["Colors.121.rgbRed", 540, "u8", 0], ["Colors.121.rgbReserved", 541, "u8", 0], ["Colors.122.rgbBlue", 542, "u8", 0], ["Colors.122.rgbGreen", 543, "u8", 0], ["Colors.122.rgbRed", 544, "u8", 0], ["Colors.122.rgbReserved", 545, "u8", 0], ["Colors.123.rgbBlue", 546, "u8", 0], ["Colors.123.rgbGreen", 547, "u8", 0], ["Colors.123.rgbRed", 548, "u8", 0], ["Colors.123.rgbReserved", 549, "u8", 0], ["Colors.124.rgbBlue", 550, "u8", 0], ["Colors.124.rgbGreen", 551, "u8", 0], ["Colors.124.rgbRed", 552, "u8", 0], ["Colors.124.rgbReserved", 553, "u8", 0], ["Colors.125.rgbBlue", 554, "u8", 0], ["Colors.125.rgbGreen", 555, "u8", 0], ["Colors.125.rgbRed", 556, "u8", 0], ["Colors.125.rgbReserved", 557, "u8", 0], ["Colors.126.rgbBlue", 558, "u8", 0], ["Colors.126.rgbGreen", 559, "u8", 0], ["Colors.126.rgbRed", 560, "u8", 0], ["Colors.126.rgbReserved", 561, "u8", 0], ["Colors.127.rgbBlue", 562, "u8", 0], ["Colors.127.rgbGreen", 563, "u8", 0], ["Colors.127.rgbRed", 564, "u8", 0], ["Colors.127.rgbReserved", 565, "u8", 0], ["Colors.128.rgbBlue", 566, "u8", 0], ["Colors.128.rgbGreen", 567, "u8", 0], ["Colors.128.rgbRed", 568, "u8", 0], ["Colors.128.rgbReserved", 569, "u8", 0], ["Colors.129.rgbBlue", 570, "u8", 0], ["Colors.129.rgbGreen", 571, "u8", 0], ["Colors.129.rgbRed", 572, "u8", 0], ["Colors.129.rgbReserved", 573, "u8", 0], ["Colors.130.rgbBlue", 574, "u8", 0], ["Colors.130.rgbGreen", 575, "u8", 0], ["Colors.130.rgbRed", 576, "u8", 0], ["Colors.130.rgbReserved", 577, "u8", 0], ["Colors.131.rgbBlue", 578, "u8", 0], ["Colors.131.rgbGreen", 579, "u8", 0], ["Colors.131.rgbRed", 580, "u8", 0], ["Colors.131.rgbReserved", 581, "u8", 0], ["Colors.132.rgbBlue", 582, "u8", 0], ["Colors.132.rgbGreen", 583, "u8", 0], ["Colors.132.rgbRed", 584, "u8", 0], ["Colors.132.rgbReserved", 585, "u8", 0], ["Colors.133.rgbBlue", 586, "u8", 0], ["Colors.133.rgbGreen", 587, "u8", 0], ["Colors.133.rgbRed", 588, "u8", 0], ["Colors.133.rgbReserved", 589, "u8", 0], ["Colors.134.rgbBlue", 590, "u8", 0], ["Colors.134.rgbGreen", 591, "u8", 0], ["Colors.134.rgbRed", 592, "u8", 0], ["Colors.134.rgbReserved", 593, "u8", 0], ["Colors.135.rgbBlue", 594, "u8", 0], ["Colors.135.rgbGreen", 595, "u8", 0], ["Colors.135.rgbRed", 596, "u8", 0], ["Colors.135.rgbReserved", 597, "u8", 0], ["Colors.136.rgbBlue", 598, "u8", 0], ["Colors.136.rgbGreen", 599, "u8", 0], ["Colors.136.rgbRed", 600, "u8", 0], ["Colors.136.rgbReserved", 601, "u8", 0], ["Colors.137.rgbBlue", 602, "u8", 0], ["Colors.137.rgbGreen", 603, "u8", 0], ["Colors.137.rgbRed", 604, "u8", 0], ["Colors.137.rgbReserved", 605, "u8", 0], ["Colors.138.rgbBlue", 606, "u8", 0], ["Colors.138.rgbGreen", 607, "u8", 0], ["Colors.138.rgbRed", 608, "u8", 0], ["Colors.138.rgbReserved", 609, "u8", 0], ["Colors.139.rgbBlue", 610, "u8", 0], ["Colors.139.rgbGreen", 611, "u8", 0], ["Colors.139.rgbRed", 612, "u8", 0], ["Colors.139.rgbReserved", 613, "u8", 0], ["Colors.140.rgbBlue", 614, "u8", 0], ["Colors.140.rgbGreen", 615, "u8", 0], ["Colors.140.rgbRed", 616, "u8", 0], ["Colors.140.rgbReserved", 617, "u8", 0], ["Colors.141.rgbBlue", 618, "u8", 0], ["Colors.141.rgbGreen", 619, "u8", 0], ["Colors.141.rgbRed", 620, "u8", 0], ["Colors.141.rgbReserved", 621, "u8", 0], ["Colors.142.rgbBlue", 622, "u8", 0], ["Colors.142.rgbGreen", 623, "u8", 0], ["Colors.142.rgbRed", 624, "u8", 0], ["Colors.142.rgbReserved", 625, "u8", 0], ["Colors.143.rgbBlue", 626, "u8", 0], ["Colors.143.rgbGreen", 627, "u8", 0], ["Colors.143.rgbRed", 628, "u8", 0], ["Colors.143.rgbReserved", 629, "u8", 0], ["Colors.144.rgbBlue", 630, "u8", 0], ["Colors.144.rgbGreen", 631, "u8", 0], ["Colors.144.rgbRed", 632, "u8", 0], ["Colors.144.rgbReserved", 633, "u8", 0], ["Colors.145.rgbBlue", 634, "u8", 0], ["Colors.145.rgbGreen", 635, "u8", 0], ["Colors.145.rgbRed", 636, "u8", 0], ["Colors.145.rgbReserved", 637, "u8", 0], ["Colors.146.rgbBlue", 638, "u8", 0], ["Colors.146.rgbGreen", 639, "u8", 0], ["Colors.146.rgbRed", 640, "u8", 0], ["Colors.146.rgbReserved", 641, "u8", 0], ["Colors.147.rgbBlue", 642, "u8", 0], ["Colors.147.rgbGreen", 643, "u8", 0], ["Colors.147.rgbRed", 644, "u8", 0], ["Colors.147.rgbReserved", 645, "u8", 0], ["Colors.148.rgbBlue", 646, "u8", 0], ["Colors.148.rgbGreen", 647, "u8", 0], ["Colors.148.rgbRed", 648, "u8", 0], ["Colors.148.rgbReserved", 649, "u8", 0], ["Colors.149.rgbBlue", 650, "u8", 0], ["Colors.149.rgbGreen", 651, "u8", 0], ["Colors.149.rgbRed", 652, "u8", 0], ["Colors.149.rgbReserved", 653, "u8", 0], ["Colors.150.rgbBlue", 654, "u8", 0], ["Colors.150.rgbGreen", 655, "u8", 0], ["Colors.150.rgbRed", 656, "u8", 0], ["Colors.150.rgbReserved", 657, "u8", 0], ["Colors.151.rgbBlue", 658, "u8", 0], ["Colors.151.rgbGreen", 659, "u8", 0], ["Colors.151.rgbRed", 660, "u8", 0], ["Colors.151.rgbReserved", 661, "u8", 0], ["Colors.152.rgbBlue", 662, "u8", 0], ["Colors.152.rgbGreen", 663, "u8", 0], ["Colors.152.rgbRed", 664, "u8", 0], ["Colors.152.rgbReserved", 665, "u8", 0], ["Colors.153.rgbBlue", 666, "u8", 0], ["Colors.153.rgbGreen", 667, "u8", 0], ["Colors.153.rgbRed", 668, "u8", 0], ["Colors.153.rgbReserved", 669, "u8", 0], ["Colors.154.rgbBlue", 670, "u8", 0], ["Colors.154.rgbGreen", 671, "u8", 0], ["Colors.154.rgbRed", 672, "u8", 0], ["Colors.154.rgbReserved", 673, "u8", 0], ["Colors.155.rgbBlue", 674, "u8", 0], ["Colors.155.rgbGreen", 675, "u8", 0], ["Colors.155.rgbRed", 676, "u8", 0], ["Colors.155.rgbReserved", 677, "u8", 0], ["Colors.156.rgbBlue", 678, "u8", 0], ["Colors.156.rgbGreen", 679, "u8", 0], ["Colors.156.rgbRed", 680, "u8", 0], ["Colors.156.rgbReserved", 681, "u8", 0], ["Colors.157.rgbBlue", 682, "u8", 0], ["Colors.157.rgbGreen", 683, "u8", 0], ["Colors.157.rgbRed", 684, "u8", 0], ["Colors.157.rgbReserved", 685, "u8", 0], ["Colors.158.rgbBlue", 686, "u8", 0], ["Colors.158.rgbGreen", 687, "u8", 0], ["Colors.158.rgbRed", 688, "u8", 0], ["Colors.158.rgbReserved", 689, "u8", 0], ["Colors.159.rgbBlue", 690, "u8", 0], ["Colors.159.rgbGreen", 691, "u8", 0], ["Colors.159.rgbRed", 692, "u8", 0], ["Colors.159.rgbReserved", 693, "u8", 0], ["Colors.160.rgbBlue", 694, "u8", 0], ["Colors.160.rgbGreen", 695, "u8", 0], ["Colors.160.rgbRed", 696, "u8", 0], ["Colors.160.rgbReserved", 697, "u8", 0], ["Colors.161.rgbBlue", 698, "u8", 0], ["Colors.161.rgbGreen", 699, "u8", 0], ["Colors.161.rgbRed", 700, "u8", 0], ["Colors.161.rgbReserved", 701, "u8", 0], ["Colors.162.rgbBlue", 702, "u8", 0], ["Colors.162.rgbGreen", 703, "u8", 0], ["Colors.162.rgbRed", 704, "u8", 0], ["Colors.162.rgbReserved", 705, "u8", 0], ["Colors.163.rgbBlue", 706, "u8", 0], ["Colors.163.rgbGreen", 707, "u8", 0], ["Colors.163.rgbRed", 708, "u8", 0], ["Colors.163.rgbReserved", 709, "u8", 0], ["Colors.164.rgbBlue", 710, "u8", 0], ["Colors.164.rgbGreen", 711, "u8", 0], ["Colors.164.rgbRed", 712, "u8", 0], ["Colors.164.rgbReserved", 713, "u8", 0], ["Colors.165.rgbBlue", 714, "u8", 0], ["Colors.165.rgbGreen", 715, "u8", 0], ["Colors.165.rgbRed", 716, "u8", 0], ["Colors.165.rgbReserved", 717, "u8", 0], ["Colors.166.rgbBlue", 718, "u8", 0], ["Colors.166.rgbGreen", 719, "u8", 0], ["Colors.166.rgbRed", 720, "u8", 0], ["Colors.166.rgbReserved", 721, "u8", 0], ["Colors.167.rgbBlue", 722, "u8", 0], ["Colors.167.rgbGreen", 723, "u8", 0], ["Colors.167.rgbRed", 724, "u8", 0], ["Colors.167.rgbReserved", 725, "u8", 0], ["Colors.168.rgbBlue", 726, "u8", 0], ["Colors.168.rgbGreen", 727, "u8", 0], ["Colors.168.rgbRed", 728, "u8", 0], ["Colors.168.rgbReserved", 729, "u8", 0], ["Colors.169.rgbBlue", 730, "u8", 0], ["Colors.169.rgbGreen", 731, "u8", 0], ["Colors.169.rgbRed", 732, "u8", 0], ["Colors.169.rgbReserved", 733, "u8", 0], ["Colors.170.rgbBlue", 734, "u8", 0], ["Colors.170.rgbGreen", 735, "u8", 0], ["Colors.170.rgbRed", 736, "u8", 0], ["Colors.170.rgbReserved", 737, "u8", 0], ["Colors.171.rgbBlue", 738, "u8", 0], ["Colors.171.rgbGreen", 739, "u8", 0], ["Colors.171.rgbRed", 740, "u8", 0], ["Colors.171.rgbReserved", 741, "u8", 0], ["Colors.172.rgbBlue", 742, "u8", 0], ["Colors.172.rgbGreen", 743, "u8", 0], ["Colors.172.rgbRed", 744, "u8", 0], ["Colors.172.rgbReserved", 745, "u8", 0], ["Colors.173.rgbBlue", 746, "u8", 0], ["Colors.173.rgbGreen", 747, "u8", 0], ["Colors.173.rgbRed", 748, "u8", 0], ["Colors.173.rgbReserved", 749, "u8", 0], ["Colors.174.rgbBlue", 750, "u8", 0], ["Colors.174.rgbGreen", 751, "u8", 0], ["Colors.174.rgbRed", 752, "u8", 0], ["Colors.174.rgbReserved", 753, "u8", 0], ["Colors.175.rgbBlue", 754, "u8", 0], ["Colors.175.rgbGreen", 755, "u8", 0], ["Colors.175.rgbRed", 756, "u8", 0], ["Colors.175.rgbReserved", 757, "u8", 0], ["Colors.176.rgbBlue", 758, "u8", 0], ["Colors.176.rgbGreen", 759, "u8", 0], ["Colors.176.rgbRed", 760, "u8", 0], ["Colors.176.rgbReserved", 761, "u8", 0], ["Colors.177.rgbBlue", 762, "u8", 0], ["Colors.177.rgbGreen", 763, "u8", 0], ["Colors.177.rgbRed", 764, "u8", 0], ["Colors.177.rgbReserved", 765, "u8", 0], ["Colors.178.rgbBlue", 766, "u8", 0], ["Colors.178.rgbGreen", 767, "u8", 0], ["Colors.178.rgbRed", 768, "u8", 0], ["Colors.178.rgbReserved", 769, "u8", 0], ["Colors.179.rgbBlue", 770, "u8", 0], ["Colors.179.rgbGreen", 771, "u8", 0], ["Colors.179.rgbRed", 772, "u8", 0], ["Colors.179.rgbReserved", 773, "u8", 0], ["Colors.180.rgbBlue", 774, "u8", 0], ["Colors.180.rgbGreen", 775, "u8", 0], ["Colors.180.rgbRed", 776, "u8", 0], ["Colors.180.rgbReserved", 777, "u8", 0], ["Colors.181.rgbBlue", 778, "u8", 0], ["Colors.181.rgbGreen", 779, "u8", 0], ["Colors.181.rgbRed", 780, "u8", 0], ["Colors.181.rgbReserved", 781, "u8", 0], ["Colors.182.rgbBlue", 782, "u8", 0], ["Colors.182.rgbGreen", 783, "u8", 0], ["Colors.182.rgbRed", 784, "u8", 0], ["Colors.182.rgbReserved", 785, "u8", 0], ["Colors.183.rgbBlue", 786, "u8", 0], ["Colors.183.rgbGreen", 787, "u8", 0], ["Colors.183.rgbRed", 788, "u8", 0], ["Colors.183.rgbReserved", 789, "u8", 0], ["Colors.184.rgbBlue", 790, "u8", 0], ["Colors.184.rgbGreen", 791, "u8", 0], ["Colors.184.rgbRed", 792, "u8", 0], ["Colors.184.rgbReserved", 793, "u8", 0], ["Colors.185.rgbBlue", 794, "u8", 0], ["Colors.185.rgbGreen", 795, "u8", 0], ["Colors.185.rgbRed", 796, "u8", 0], ["Colors.185.rgbReserved", 797, "u8", 0], ["Colors.186.rgbBlue", 798, "u8", 0], ["Colors.186.rgbGreen", 799, "u8", 0], ["Colors.186.rgbRed", 800, "u8", 0], ["Colors.186.rgbReserved", 801, "u8", 0], ["Colors.187.rgbBlue", 802, "u8", 0], ["Colors.187.rgbGreen", 803, "u8", 0], ["Colors.187.rgbRed", 804, "u8", 0], ["Colors.187.rgbReserved", 805, "u8", 0], ["Colors.188.rgbBlue", 806, "u8", 0], ["Colors.188.rgbGreen", 807, "u8", 0], ["Colors.188.rgbRed", 808, "u8", 0], ["Colors.188.rgbReserved", 809, "u8", 0], ["Colors.189.rgbBlue", 810, "u8", 0], ["Colors.189.rgbGreen", 811, "u8", 0], ["Colors.189.rgbRed", 812, "u8", 0], ["Colors.189.rgbReserved", 813, "u8", 0], ["Colors.190.rgbBlue", 814, "u8", 0], ["Colors.190.rgbGreen", 815, "u8", 0], ["Colors.190.rgbRed", 816, "u8", 0], ["Colors.190.rgbReserved", 817, "u8", 0], ["Colors.191.rgbBlue", 818, "u8", 0], ["Colors.191.rgbGreen", 819, "u8", 0], ["Colors.191.rgbRed", 820, "u8", 0], ["Colors.191.rgbReserved", 821, "u8", 0], ["Colors.192.rgbBlue", 822, "u8", 0], ["Colors.192.rgbGreen", 823, "u8", 0], ["Colors.192.rgbRed", 824, "u8", 0], ["Colors.192.rgbReserved", 825, "u8", 0], ["Colors.193.rgbBlue", 826, "u8", 0], ["Colors.193.rgbGreen", 827, "u8", 0], ["Colors.193.rgbRed", 828, "u8", 0], ["Colors.193.rgbReserved", 829, "u8", 0], ["Colors.194.rgbBlue", 830, "u8", 0], ["Colors.194.rgbGreen", 831, "u8", 0], ["Colors.194.rgbRed", 832, "u8", 0], ["Colors.194.rgbReserved", 833, "u8", 0], ["Colors.195.rgbBlue", 834, "u8", 0], ["Colors.195.rgbGreen", 835, "u8", 0], ["Colors.195.rgbRed", 836, "u8", 0], ["Colors.195.rgbReserved", 837, "u8", 0], ["Colors.196.rgbBlue", 838, "u8", 0], ["Colors.196.rgbGreen", 839, "u8", 0], ["Colors.196.rgbRed", 840, "u8", 0], ["Colors.196.rgbReserved", 841, "u8", 0], ["Colors.197.rgbBlue", 842, "u8", 0], ["Colors.197.rgbGreen", 843, "u8", 0], ["Colors.197.rgbRed", 844, "u8", 0], ["Colors.197.rgbReserved", 845, "u8", 0], ["Colors.198.rgbBlue", 846, "u8", 0], ["Colors.198.rgbGreen", 847, "u8", 0], ["Colors.198.rgbRed", 848, "u8", 0], ["Colors.198.rgbReserved", 849, "u8", 0], ["Colors.199.rgbBlue", 850, "u8", 0], ["Colors.199.rgbGreen", 851, "u8", 0], ["Colors.199.rgbRed", 852, "u8", 0], ["Colors.199.rgbReserved", 853, "u8", 0], ["Colors.200.rgbBlue", 854, "u8", 0], ["Colors.200.rgbGreen", 855, "u8", 0], ["Colors.200.rgbRed", 856, "u8", 0], ["Colors.200.rgbReserved", 857, "u8", 0], ["Colors.201.rgbBlue", 858, "u8", 0], ["Colors.201.rgbGreen", 859, "u8", 0], ["Colors.201.rgbRed", 860, "u8", 0], ["Colors.201.rgbReserved", 861, "u8", 0], ["Colors.202.rgbBlue", 862, "u8", 0], ["Colors.202.rgbGreen", 863, "u8", 0], ["Colors.202.rgbRed", 864, "u8", 0], ["Colors.202.rgbReserved", 865, "u8", 0], ["Colors.203.rgbBlue", 866, "u8", 0], ["Colors.203.rgbGreen", 867, "u8", 0], ["Colors.203.rgbRed", 868, "u8", 0], ["Colors.203.rgbReserved", 869, "u8", 0], ["Colors.204.rgbBlue", 870, "u8", 0], ["Colors.204.rgbGreen", 871, "u8", 0], ["Colors.204.rgbRed", 872, "u8", 0], ["Colors.204.rgbReserved", 873, "u8", 0], ["Colors.205.rgbBlue", 874, "u8", 0], ["Colors.205.rgbGreen", 875, "u8", 0], ["Colors.205.rgbRed", 876, "u8", 0], ["Colors.205.rgbReserved", 877, "u8", 0], ["Colors.206.rgbBlue", 878, "u8", 0], ["Colors.206.rgbGreen", 879, "u8", 0], ["Colors.206.rgbRed", 880, "u8", 0], ["Colors.206.rgbReserved", 881, "u8", 0], ["Colors.207.rgbBlue", 882, "u8", 0], ["Colors.207.rgbGreen", 883, "u8", 0], ["Colors.207.rgbRed", 884, "u8", 0], ["Colors.207.rgbReserved", 885, "u8", 0], ["Colors.208.rgbBlue", 886, "u8", 0], ["Colors.208.rgbGreen", 887, "u8", 0], ["Colors.208.rgbRed", 888, "u8", 0], ["Colors.208.rgbReserved", 889, "u8", 0], ["Colors.209.rgbBlue", 890, "u8", 0], ["Colors.209.rgbGreen", 891, "u8", 0], ["Colors.209.rgbRed", 892, "u8", 0], ["Colors.209.rgbReserved", 893, "u8", 0], ["Colors.210.rgbBlue", 894, "u8", 0], ["Colors.210.rgbGreen", 895, "u8", 0], ["Colors.210.rgbRed", 896, "u8", 0], ["Colors.210.rgbReserved", 897, "u8", 0], ["Colors.211.rgbBlue", 898, "u8", 0], ["Colors.211.rgbGreen", 899, "u8", 0], ["Colors.211.rgbRed", 900, "u8", 0], ["Colors.211.rgbReserved", 901, "u8", 0], ["Colors.212.rgbBlue", 902, "u8", 0], ["Colors.212.rgbGreen", 903, "u8", 0], ["Colors.212.rgbRed", 904, "u8", 0], ["Colors.212.rgbReserved", 905, "u8", 0], ["Colors.213.rgbBlue", 906, "u8", 0], ["Colors.213.rgbGreen", 907, "u8", 0], ["Colors.213.rgbRed", 908, "u8", 0], ["Colors.213.rgbReserved", 909, "u8", 0], ["Colors.214.rgbBlue", 910, "u8", 0], ["Colors.214.rgbGreen", 911, "u8", 0], ["Colors.214.rgbRed", 912, "u8", 0], ["Colors.214.rgbReserved", 913, "u8", 0], ["Colors.215.rgbBlue", 914, "u8", 0], ["Colors.215.rgbGreen", 915, "u8", 0], ["Colors.215.rgbRed", 916, "u8", 0], ["Colors.215.rgbReserved", 917, "u8", 0], ["Colors.216.rgbBlue", 918, "u8", 0], ["Colors.216.rgbGreen", 919, "u8", 0], ["Colors.216.rgbRed", 920, "u8", 0], ["Colors.216.rgbReserved", 921, "u8", 0], ["Colors.217.rgbBlue", 922, "u8", 0], ["Colors.217.rgbGreen", 923, "u8", 0], ["Colors.217.rgbRed", 924, "u8", 0], ["Colors.217.rgbReserved", 925, "u8", 0], ["Colors.218.rgbBlue", 926, "u8", 0], ["Colors.218.rgbGreen", 927, "u8", 0], ["Colors.218.rgbRed", 928, "u8", 0], ["Colors.218.rgbReserved", 929, "u8", 0], ["Colors.219.rgbBlue", 930, "u8", 0], ["Colors.219.rgbGreen", 931, "u8", 0], ["Colors.219.rgbRed", 932, "u8", 0], ["Colors.219.rgbReserved", 933, "u8", 0], ["Colors.220.rgbBlue", 934, "u8", 0], ["Colors.220.rgbGreen", 935, "u8", 0], ["Colors.220.rgbRed", 936, "u8", 0], ["Colors.220.rgbReserved", 937, "u8", 0], ["Colors.221.rgbBlue", 938, "u8", 0], ["Colors.221.rgbGreen", 939, "u8", 0], ["Colors.221.rgbRed", 940, "u8", 0], ["Colors.221.rgbReserved", 941, "u8", 0], ["Colors.222.rgbBlue", 942, "u8", 0], ["Colors.222.rgbGreen", 943, "u8", 0], ["Colors.222.rgbRed", 944, "u8", 0], ["Colors.222.rgbReserved", 945, "u8", 0], ["Colors.223.rgbBlue", 946, "u8", 0], ["Colors.223.rgbGreen", 947, "u8", 0], ["Colors.223.rgbRed", 948, "u8", 0], ["Colors.223.rgbReserved", 949, "u8", 0], ["Colors.224.rgbBlue", 950, "u8", 0], ["Colors.224.rgbGreen", 951, "u8", 0], ["Colors.224.rgbRed", 952, "u8", 0], ["Colors.224.rgbReserved", 953, "u8", 0], ["Colors.225.rgbBlue", 954, "u8", 0], ["Colors.225.rgbGreen", 955, "u8", 0], ["Colors.225.rgbRed", 956, "u8", 0], ["Colors.225.rgbReserved", 957, "u8", 0], ["Colors.226.rgbBlue", 958, "u8", 0], ["Colors.226.rgbGreen", 959, "u8", 0], ["Colors.226.rgbRed", 960, "u8", 0], ["Colors.226.rgbReserved", 961, "u8", 0], ["Colors.227.rgbBlue", 962, "u8", 0], ["Colors.227.rgbGreen", 963, "u8", 0], ["Colors.227.rgbRed", 964, "u8", 0], ["Colors.227.rgbReserved", 965, "u8", 0], ["Colors.228.rgbBlue", 966, "u8", 0], ["Colors.228.rgbGreen", 967, "u8", 0], ["Colors.228.rgbRed", 968, "u8", 0], ["Colors.228.rgbReserved", 969, "u8", 0], ["Colors.229.rgbBlue", 970, "u8", 0], ["Colors.229.rgbGreen", 971, "u8", 0], ["Colors.229.rgbRed", 972, "u8", 0], ["Colors.229.rgbReserved", 973, "u8", 0], ["Colors.230.rgbBlue", 974, "u8", 0], ["Colors.230.rgbGreen", 975, "u8", 0], ["Colors.230.rgbRed", 976, "u8", 0], ["Colors.230.rgbReserved", 977, "u8", 0], ["Colors.231.rgbBlue", 978, "u8", 0], ["Colors.231.rgbGreen", 979, "u8", 0], ["Colors.231.rgbRed", 980, "u8", 0], ["Colors.231.rgbReserved", 981, "u8", 0], ["Colors.232.rgbBlue", 982, "u8", 0], ["Colors.232.rgbGreen", 983, "u8", 0], ["Colors.232.rgbRed", 984, "u8", 0], ["Colors.232.rgbReserved", 985, "u8", 0], ["Colors.233.rgbBlue", 986, "u8", 0], ["Colors.233.rgbGreen", 987, "u8", 0], ["Colors.233.rgbRed", 988, "u8", 0], ["Colors.233.rgbReserved", 989, "u8", 0], ["Colors.234.rgbBlue", 990, "u8", 0], ["Colors.234.rgbGreen", 991, "u8", 0], ["Colors.234.rgbRed", 992, "u8", 0], ["Colors.234.rgbReserved", 993, "u8", 0], ["Colors.235.rgbBlue", 994, "u8", 0], ["Colors.235.rgbGreen", 995, "u8", 0], ["Colors.235.rgbRed", 996, "u8", 0], ["Colors.235.rgbReserved", 997, "u8", 0], ["Colors.236.rgbBlue", 998, "u8", 0], ["Colors.236.rgbGreen", 999, "u8", 0], ["Colors.236.rgbRed", 1000, "u8", 0], ["Colors.236.rgbReserved", 1001, "u8", 0], ["Colors.237.rgbBlue", 1002, "u8", 0], ["Colors.237.rgbGreen", 1003, "u8", 0], ["Colors.237.rgbRed", 1004, "u8", 0], ["Colors.237.rgbReserved", 1005, "u8", 0], ["Colors.238.rgbBlue", 1006, "u8", 0], ["Colors.238.rgbGreen", 1007, "u8", 0], ["Colors.238.rgbRed", 1008, "u8", 0], ["Colors.238.rgbReserved", 1009, "u8", 0], ["Colors.239.rgbBlue", 1010, "u8", 0], ["Colors.239.rgbGreen", 1011, "u8", 0], ["Colors.239.rgbRed", 1012, "u8", 0], ["Colors.239.rgbReserved", 1013, "u8", 0], ["Colors.240.rgbBlue", 1014, "u8", 0], ["Colors.240.rgbGreen", 1015, "u8", 0], ["Colors.240.rgbRed", 1016, "u8", 0], ["Colors.240.rgbReserved", 1017, "u8", 0], ["Colors.241.rgbBlue", 1018, "u8", 0], ["Colors.241.rgbGreen", 1019, "u8", 0], ["Colors.241.rgbRed", 1020, "u8", 0], ["Colors.241.rgbReserved", 1021, "u8", 0], ["Colors.242.rgbBlue", 1022, "u8", 0], ["Colors.242.rgbGreen", 1023, "u8", 0], ["Colors.242.rgbRed", 1024, "u8", 0], ["Colors.242.rgbReserved", 1025, "u8", 0], ["Colors.243.rgbBlue", 1026, "u8", 0], ["Colors.243.rgbGreen", 1027, "u8", 0], ["Colors.243.rgbRed", 1028, "u8", 0], ["Colors.243.rgbReserved", 1029, "u8", 0], ["Colors.244.rgbBlue", 1030, "u8", 0], ["Colors.244.rgbGreen", 1031, "u8", 0], ["Colors.244.rgbRed", 1032, "u8", 0], ["Colors.244.rgbReserved", 1033, "u8", 0], ["Colors.245.rgbBlue", 1034, "u8", 0], ["Colors.245.rgbGreen", 1035, "u8", 0], ["Colors.245.rgbRed", 1036, "u8", 0], ["Colors.245.rgbReserved", 1037, "u8", 0], ["Colors.246.rgbBlue", 1038, "u8", 0], ["Colors.246.rgbGreen", 1039, "u8", 0], ["Colors.246.rgbRed", 1040, "u8", 0], ["Colors.246.rgbReserved", 1041, "u8", 0], ["Colors.247.rgbBlue", 1042, "u8", 0], ["Colors.247.rgbGreen", 1043, "u8", 0], ["Colors.247.rgbRed", 1044, "u8", 0], ["Colors.247.rgbReserved", 1045, "u8", 0], ["Colors.248.rgbBlue", 1046, "u8", 0], ["Colors.248.rgbGreen", 1047, "u8", 0], ["Colors.248.rgbRed", 1048, "u8", 0], ["Colors.248.rgbReserved", 1049, "u8", 0], ["Colors.249.rgbBlue", 1050, "u8", 0], ["Colors.249.rgbGreen", 1051, "u8", 0], ["Colors.249.rgbRed", 1052, "u8", 0], ["Colors.249.rgbReserved", 1053, "u8", 0], ["Colors.250.rgbBlue", 1054, "u8", 0], ["Colors.250.rgbGreen", 1055, "u8", 0], ["Colors.250.rgbRed", 1056, "u8", 0], ["Colors.250.rgbReserved", 1057, "u8", 0], ["Colors.251.rgbBlue", 1058, "u8", 0], ["Colors.251.rgbGreen", 1059, "u8", 0], ["Colors.251.rgbRed", 1060, "u8", 0], ["Colors.251.rgbReserved", 1061, "u8", 0], ["Colors.252.rgbBlue", 1062, "u8", 0], ["Colors.252.rgbGreen", 1063, "u8", 0], ["Colors.252.rgbRed", 1064, "u8", 0], ["Colors.252.rgbReserved", 1065, "u8", 0], ["Colors.253.rgbBlue", 1066, "u8", 0], ["Colors.253.rgbGreen", 1067, "u8", 0], ["Colors.253.rgbRed", 1068, "u8", 0], ["Colors.253.rgbReserved", 1069, "u8", 0], ["Colors.254.rgbBlue", 1070, "u8", 0], ["Colors.254.rgbGreen", 1071, "u8", 0], ["Colors.254.rgbRed", 1072, "u8", 0], ["Colors.254.rgbReserved", 1073, "u8", 0], ["Colors.255.rgbBlue", 1074, "u8", 0], ["Colors.255.rgbGreen", 1075, "u8", 0], ["Colors.255.rgbRed", 1076, "u8", 0], ["Colors.255.rgbReserved", 1077, "u8", 0]], 1078), 54), $min(1024, 1024 + $u64n(BitmapInfo.FileBitsOffset())))) {
        return false;
      }
      if (!hGroup.Advance(BitmapInfo.FileBitsOffset())) {
        return false;
      }
    } else {
      if (BitmapInfo.Info.biBitCount !== 24) {
        return false;
      }
      if (!hGroup.Advance($.C4BMPInfo.prototype.FileBitsOffset.call(BitmapInfo.$clone()))) {
        return false;
      }
    }
    if (!this.Create(BitmapInfo.Info.biWidth, BitmapInfo.Info.biHeight, iFlags)) {
      return false;
    }
    if (!this.Lock()) {
      this.Clear();
      return false;
    }
    let iBufSize = $.DWordAligned(Math.imul(BitmapInfo.Info.biWidth, BitmapInfo.Info.biBitCount) / 8 | 0);
    let pBuf = P(new Uint8Array($u64n(iBufSize)), 0);
    for (lcnt = this.Hgt - 1 | 0; lcnt >= 0; lcnt = lcnt - 1 | 0) {
      if (!hGroup.Read$px$u64(pBuf, $u64n(iBufSize))) {
        this.Clear();
        $delete(pBuf);
        return false;
      }
      let pPix = pBuf;
      for (let x = 0; x < BitmapInfo.Info.biWidth; x = x + 1 | 0) {
        switch (BitmapInfo.Info.biBitCount) {
          case 8:
            this.SetPixDw(x, lcnt, (((0xff000000 | ((BitmapInfo.Colors[pPix.a[pPix.o]].rgbRed & 255) >>> 0 << 16) >>> 0) >>> 0 | ((BitmapInfo.Colors[pPix.a[pPix.o]].rgbGreen & 255) >>> 0 << 8) >>> 0) >>> 0 | (BitmapInfo.Colors[pPix.a[pPix.o]].rgbBlue & 255) >>> 0) >>> 0);
            pPix = pPix.add(1);
            break;
          case 24:
            this.SetPixDw(x, lcnt, (((0xff000000 | ((pPix.a[pPix.o + 0] & 255) >>> 0 << 16) >>> 0) >>> 0 | ((pPix.a[pPix.o + 1] & 255) >>> 0 << 8) >>> 0) >>> 0 | (pPix.a[pPix.o + 2] & 255) >>> 0) >>> 0);
            pPix = pPix.add(3);
            break;
        }
      }
    }
    $delete(pBuf);
    this.Unlock();
    return true;
  }

  AttachPalette() {
    return true;
  }

  GetSurfaceSize(irX, irY) {
    irX.a[irX.o] = this.Wdt;
    irY.a[irY.o] = this.Hgt;
    return true;
  }

  SetClr(toClr) {
    this.ClrByOwnerClr = toClr;
  }

  GetClr() {
    return this.ClrByOwnerClr;
  }

  $clone() { return new C4Surface().$assign(this); }
  $assign(o) {
    this.Wdt = o.Wdt;
    this.Hgt = o.Hgt;
    this.Scale = o.Scale;
    this.PrimarySurfaceLockPitch = o.PrimarySurfaceLockPitch;
    this.PrimarySurfaceLockBits = o.PrimarySurfaceLockBits;
    this.iTexSize = o.iTexSize;
    this.ClipX = o.ClipX;
    this.ClipY = o.ClipY;
    this.ClipX2 = o.ClipX2;
    this.ClipY2 = o.ClipY2;
    this.fIsBackground = o.fIsBackground;
    this.Format = o.Format;
    this.pCtx = o.pCtx;
    this.texture = o.texture;
    this.pMainSfc = o.pMainSfc;
    this.pNormalSfc = o.pNormalSfc;
    this.ClrByOwnerClr = o.ClrByOwnerClr;
    this.pWindow = o.pWindow;
    this.Locked = o.Locked;
    this.Attached = o.Attached;
    this.fPrimary = o.fPrimary;
    return this;
  }
}

export class _LOCKED_RECT {
  Pitch = 0;
  pBits = null;

  None() {
    this.pBits = null;
    return this;
  }

  $clone() { return new _LOCKED_RECT().$assign(this); }
  $assign(o) {
    this.Pitch = o.Pitch;
    this.pBits = o.pBits;
    return this;
  }
}

export class C4TexRef {
  texLock = new _LOCKED_RECT().None();
  texName = 0;
  iSizeX = 0;
  iSizeY = 0;
  fIntLock = false;
  iFlags = 0;
  LockSize = new $.C4Rect();

  init(iSizeX, iSizeY, iFlags) {
    this.texLock = new _LOCKED_RECT().None();
    this.LockSize = new $.C4Rect();
    this.texName = 0;
    this.texLock.pBits = null;
    this.fIntLock = false;
    this.iSizeX = iSizeX;
    this.iSizeY = iSizeY;
    this.iFlags = iFlags;
    if ($.pTexMgr == null) {
      $.pTexMgr = new C4TexMgr().init();
    }
    $.pTexMgr.RegTex(this);
    if ($.pDraw == null) {
      return this;
    }
    if (!$.pDraw.DeviceReady()) {
      return this;
    }
    C4TexRef.prototype.CreateTexture.call(this);
    if ((iFlags & 4) === 0 && $.pDraw != null) {
      this.texLock.pBits = P(new Uint8Array($u64n(Math.imul(Math.imul(iSizeX, iSizeY), 4))), 0);
      this.texLock.Pitch = Math.imul(iSizeX, 4);
      c$memset(this.texLock.pBits, 0, $u64n(Math.imul(this.texLock.Pitch, iSizeY)));
      this.LockSize.x = this.LockSize.y = 0;
      this.LockSize.Wdt = iSizeX;
      this.LockSize.Hgt = iSizeY;
    }
    return this;
  }

  $dtor() {
    this.fIntLock = false;
    if ($.pGL != null && $.pGL.pCurrCtx != null) {
      gl$glDeleteTextures(1, P(this, "texName"));
    }
    if ($.pDraw != null) {
      this.texLock.pBits = null;
    }
    $.pTexMgr.UnregTex(this);
  }

  Lock() {
    if (this.texLock.pBits != null) {
      return true;
    }
    this.LockSize.Wdt = this.iSizeX;
    this.LockSize.Hgt = this.iSizeY;
    this.LockSize.x = this.LockSize.y = 0;
    if (this.texName !== 0) {
      if ($.pGL.pCurrCtx == null) {
        return false;
      }
      this.texLock.pBits = P(new Uint8Array($u64n(Math.imul(Math.imul(this.iSizeX, this.iSizeY), 4))), 0);
      this.texLock.Pitch = Math.imul(this.iSizeX, 4);
      gl$glBindTexture(3553, this.texName);
      gl$glGetTexImage(3553, 0, 32993, 33639, this.texLock.pBits);
      return true;
    }
    {
    }
    return false;
  }

  LockForUpdate(rtUpdate) {
    if (this.texLock.pBits != null) {
      if (this.LockSize.x === 0 && this.LockSize.Wdt === this.iSizeX && this.LockSize.y === 0 && this.LockSize.Hgt === this.iSizeY) {
        return true;
      } else {
        this.Unlock();
      }
    }
    this.texLock.pBits = P(new Uint8Array($u64n(Math.imul(Math.imul(rtUpdate.Wdt, rtUpdate.Hgt), 4))), 0);
    this.texLock.Pitch = Math.imul(rtUpdate.Wdt, 4);
    this.LockSize.$assign(rtUpdate);
    return true;
    return false;
  }

  Unlock() {
    if (this.texLock.pBits == null || this.fIntLock) {
      return;
    }
    if ($.pGL.pCurrCtx == null) {
      0;
      $.pGL.pMainCtx.Select();
    }
    let fMipMap = (this.iFlags & 2) !== 0;
    gl$glPixelStorei(3317, 1);
    gl$glBindTexture(3553, this.texName);
    gl$glTexSubImage2D(3553, 0, this.LockSize.x, this.LockSize.y, this.LockSize.Wdt, this.LockSize.Hgt, 32993, 33639, this.texLock.pBits);
    this.texLock.pBits = null;
    if (fMipMap) {
      gl$glGenerateMipmap(3553);
    }
  }

  ClearRect(rtClear) {
    if (!this.LockForUpdate(rtClear)) {
      return false;
    }
    let y = 0;
    for (y = rtClear.y; y < (rtClear.y + rtClear.Hgt | 0); y = y + 1 | 0) {
      for (let x = rtClear.x; x < (rtClear.x + rtClear.Wdt | 0); x = x + 1 | 0) {
        this.SetPix(x, y, 0);
      }
    }
    return true;
  }

  FillBlack() {
    if (!this.Lock()) {
      return false;
    }
    let y = 0;
    for (y = 0; y < this.iSizeY; y = y + 1 | 0) {
      for (let x = 0; x < this.iSizeX; x = x + 1 | 0) {
        this.SetPix(x, y, 0xff000000);
      }
    }
    return true;
  }

  SetPix(iX, iY, v) {
    $wr($reinterp($padd($padd(this.texLock.pBits, Math.imul(iY - this.LockSize.y | 0, this.texLock.Pitch)), Math.imul(iX - this.LockSize.x | 0, 4)), "u32"), 0, v);
  }

  CreateTexture() {
    0;
    let fTileable = (this.iFlags & 1) !== 0;
    let fMipMap = (this.iFlags & 2) !== 0;
    gl$glGenTextures(1, P(this, "texName"));
    gl$glBindTexture(3553, this.texName);
    gl$glTexParameteri(3553, 10242, fTileable ? 10497 : 33071);
    gl$glTexParameteri(3553, 10243, fTileable ? 10497 : 33071);
    gl$glTexParameteri(3553, 10240, 9729);
    gl$glTexParameteri(3553, 10241, fMipMap ? 9985 : 9729);
    gl$glTexImage2D(3553, 0, 6408, this.iSizeX, this.iSizeY, 0, 32993, 33639, null);
    if (fMipMap) {
      gl$glGenerateMipmap(3553);
    }
  }

  $clone() { return new C4TexRef().$assign(this); }
  $assign(o) {
    this.texLock.$assign(o.texLock);
    this.texName = o.texName;
    this.iSizeX = o.iSizeX;
    this.iSizeY = o.iSizeY;
    this.fIntLock = o.fIntLock;
    this.iFlags = o.iFlags;
    this.LockSize.$assign(o.LockSize);
    return this;
  }
}

export class C4TexMgr {
  Textures = [];

  init() {
    this.Textures = [];
    this.Textures.length = 0;
    return this;
  }

  $dtor() {
    C4TexMgr.prototype.IntUnlock.call(this);
  }

  RegTex(pTex) {
    this.Textures.unshift(pTex);
  }

  UnregTex(pTex) {
    seq_remove(this.Textures, pTex);
    if (this.Textures.length === 0) {
      $delete(this);
      $.pTexMgr = null;
    }
  }

  IntLock() {
    let $t1;
    let j = this.Textures.length | 0;
    for (let i = $begin(this.Textures); ($t1 = j, j = j - 1 | 0, $t1) !== 0; i.inc()) {
      let pRef = i.v;
      if (pRef.Lock() && pRef.texLock.pBits != null) {
        pRef.fIntLock = true;
        if ($.pGL != null) {
          gl$glDeleteTextures(1, P(pRef, "texName"));
          pRef.texName = 0;
        }
      }
    }
  }

  IntUnlock() {
    let $t1;
    let j = this.Textures.length | 0;
    for (let i = $begin(this.Textures); ($t1 = j, j = j - 1 | 0, $t1) !== 0; i.inc()) {
      let pRef = i.v;
      if (pRef.fIntLock) {
        pRef.fIntLock = false;
        pRef.CreateTexture();
        pRef.Unlock();
      }
    }
  }

  $clone() { return new C4TexMgr().$assign(this); }
  $assign(o) {
    this.Textures = o.Textures.slice();
    return this;
  }
}








export function ClrByOwner(dwClr) {
  let H = 0;
  let L = 0;
  let S = 0;
  let R = 0;
  let G = 0;
  let B = 0;
  let cMax = 0;
  let cMin = 0;
  let Rdelta = 0;
  let Gdelta = 0;
  let Bdelta = 0;
  R = dwClr.a[dwClr.o] >>> 16 & 0xff;
  G = (dwClr.a[dwClr.o] & 0xffff) >> 8 & 0xff;
  B = dwClr.a[dwClr.o] & 0xff;
  cMax = $max($max(R, G), B) & 0xff;
  cMin = $min($min(R, G), B) & 0xff;
  L = (Math.imul(cMax + cMin | 0, 255) + 255 | 0) / 510 | 0;
  if (cMax === cMin) {
    S = 0;
    H = 170;
  } else {
    if (L <= 127) {
      S = (Math.imul(cMax - cMin | 0, 255) + ((cMax + cMin | 0) / 2 | 0) | 0) / (cMax + cMin | 0) | 0;
    } else {
      S = (Math.imul(cMax - cMin | 0, 255) + (((510 - cMax | 0) - cMin | 0) / 2 | 0) | 0) / ((510 - cMax | 0) - cMin | 0) | 0;
    }
    Rdelta = ((Math.imul(cMax - R | 0, 42) + ((cMax - cMin | 0) / 2 | 0) | 0) / (cMax - cMin | 0) | 0) & 0xffff;
    Gdelta = ((Math.imul(cMax - G | 0, 42) + ((cMax - cMin | 0) / 2 | 0) | 0) / (cMax - cMin | 0) | 0) & 0xffff;
    Bdelta = ((Math.imul(cMax - B | 0, 42) + ((cMax - cMin | 0) / 2 | 0) | 0) / (cMax - cMin | 0) | 0) & 0xffff;
    if (R === cMax) {
      H = Bdelta - Gdelta | 0;
    } else if (G === cMax) {
      H = (85 + Rdelta | 0) - Bdelta | 0;
    } else {
      H = (170 + Gdelta | 0) - Rdelta | 0;
    }
    if (H < 0) {
      H = H + 255 | 0;
    }
    if (H > 255) {
      H = H - 255 | 0;
    }
  }
  if (!($.Inside$i32$i32$i32$3(H, 145, 175) && S > 100)) {
    return false;
  }
  let b = dwClr.a[dwClr.o] & 0xff;
  dwClr.a[dwClr.o] = ($.RGBA(b, b, b, 0) | (dwClr.a[dwClr.o] & 0xff000000) >>> 0) >>> 0;
  return true;
}

export function ColorDistance(bpRGB1, bpRGB2) {
  return (($.Abs$i32(bpRGB1.a[bpRGB1.o + 0] - bpRGB2.a[bpRGB2.o + 0] | 0) + $.Abs$i32(bpRGB1.a[bpRGB1.o + 1] - bpRGB2.a[bpRGB2.o + 1] | 0) | 0) + $.Abs$i32(bpRGB1.a[bpRGB1.o + 2] - bpRGB2.a[bpRGB2.o + 2] | 0) | 0) / 6;
}

export function $init(): void {
  $.ALeft$C4Surface = 0;
  $.ACenter$C4Surface = 1;
  $.ARight$C4Surface = 2;
  $.C4SF_Tileable$C4Surface = 1;
  $.C4SF_MipMap$C4Surface = 2;
  $.C4SF_Unlocked$C4Surface = 4;
  $.pTexMgr = null;
}

Object.assign($, { C4Surface, C4TexMgr, C4TexRef, ClrByOwner, ColorDistance, _LOCKED_RECT });
