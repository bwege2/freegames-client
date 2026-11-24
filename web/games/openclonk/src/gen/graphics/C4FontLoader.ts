// @ts-nocheck
// OpenClonk 36de799: src/graphics/C4FontLoader.cpp, src/graphics/C4FontLoader.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { ft$FT_Done_Face, ft$FT_Done_FreeType, ft$FT_Init_FreeType, ft$FT_Load_Char, ft$FT_New_Face, ft$FT_New_Memory_Face, ft$FT_Set_Pixel_Sizes, ft$FT_Set_Transform } from '../../rt/freetype.ts';
import { $i64n, $u64n, ftoi32 } from '../../rt/int.ts';
import { c$isspace, c$sscanf } from '../../rt/libc.ts';
import { $cs, $oarr, $own, $padd, $peq, $rd, $reinterpVoid, $wr, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete, $isException, $max, $min, $throw, $tuple, StdException, StdMap, StdString } from '../../rt/std.ts';

export class C4FontLoader {
  pLastUsedFont = null;
  LastUsedName = new $.StdCopyStrBuf();
  LastUsedGrpID = 0;

  init() {
    this.pLastUsedFont = null;
    this.LastUsedName = new $.StdCopyStrBuf();
    this.LastUsedGrpID = 0;
    return this;
  }

  $dtor() {
    C4FontLoader.prototype.Clear.call(this);
  }

  Clear() {
    this.DestroyFont(this.pLastUsedFont);
    this.pLastUsedFont = null;
  }

  InitFont(rFont, szFontName, eType, iSize, pGfxGroups, fDoShadow = true) {
    0;
    if (szFontName == null || szFontName.a[szFontName.o] === 0) {
      $.LogFatal($.FormatString(S("%s (\"%s\")"), $.LoadResStr(S("IDS_ERR_INITFONTS")), szFontName != null ? szFontName : S("(null)")).getData());
      return false;
    }
    let szFontString = szFontName;
    0;
    if (szFontString.a[szFontString.o] === 0) {
      $.LogFatal($.LoadResStr(S("IDS_ERR_INITFONTS")));
      return false;
    }
    const FontFaceName = new Int8Array(31);
    const FontParam = new Int8Array(31);
    $.SCopyUntil$pi8$pi8$i8$i32$i32(szFontString, P(FontFaceName, 0), 44, 30);
    const iDefFontSize = [0];
    let dwDefWeight = 400;
    switch (eType) {
      case 0:
        iDefFontSize[0] = Math.imul(iSize, 12) / 14 | 0;
        break;
      case 1:
        iDefFontSize[0] = Math.imul(iSize, 13) / 14 | 0;
        break;
      case 2:
        iDefFontSize[0] = iSize;
        break;
      case 3:
        iDefFontSize[0] = Math.imul(iSize, 16) / 14 | 0;
        break;
      case 4:
        iDefFontSize[0] = Math.imul(iSize, 22) / 14 | 0;
        break;
      default:
        0;
        $.LogFatal($.LoadResStr(S("IDS_ERR_INITFONTS")));
        return false;
    }
    if ($.SCopySegment(szFontString, 1, P(FontParam, 0), 44, 30)) {
      c$sscanf(P(FontParam, 0), S("%i"), P(iDefFontSize, 0));
    }
    if ($.SCopySegment(szFontString, 2, P(FontParam, 0), 44, 30)) {
      const iDefWeight = [0];
      c$sscanf(P(FontParam, 0), S("%i"), P(iDefWeight, 0));
      dwDefWeight = iDefWeight[0] >>> 0;
    }
    if (rFont.IsSameAs(P(FontFaceName, 0), iDefFontSize[0] >>> 0, dwDefWeight)) {
      return true;
    }
    if (rFont.IsInitialized()) {
      rFont.Clear();
      $.LogF($.LoadResStr(S("IDS_PRC_UPDATEFONT")), P(FontFaceName, 0), iDefFontSize[0], dwDefWeight);
    }
    const extensions = [
  S("ttf"),
  S("otf"),
  S("ttc"),
  S("fon"),
  S("fnt"),
  S("fot"),
  null,
];
    const FileName = new Int8Array(4097);
    const ID = [0];
    let pGrp = pGfxGroups.FindSuitableFile(P(FontFaceName, 0), P(extensions, 0), P(FileName, 0), P(ID, 0));
    if (pGrp != null) {
      if (this.LastUsedGrpID !== ID[0] || this.LastUsedName.op_ne$pi8(P(FontFaceName, 0))) {
        this.DestroyFont(this.pLastUsedFont);
        this.pLastUsedFont = null;
      }
      if (this.pLastUsedFont == null) {
        let Data = new $.StdBuf();
        if (pGrp.LoadEntry$pi8$pStdBuf(P(FileName, 0), Data)) {
          try {
            this.pLastUsedFont = this.CreateFont$rStdBuf(Data);
            this.LastUsedGrpID = ID[0];
            this.LastUsedName.op_assign$pi8(P(FontFaceName, 0));
          } catch ($e4) {
            if ($isException($e4, "runtime_error")) {
              const e = $e4;
              $.LogFatal(e.what());
              pGrp = null;
            } else {
              throw $e4;
            }
          }
        }
      }
    }
    if (pGrp == null) {
      if (this.LastUsedGrpID !== -1 || this.LastUsedName.op_ne$pi8(P(FontFaceName, 0))) {
        this.DestroyFont(this.pLastUsedFont);
        this.pLastUsedFont = null;
      }
      if (this.pLastUsedFont == null) {
        try {
          this.pLastUsedFont = this.CreateFont$pi8(P(FontFaceName, 0));
          if (this.pLastUsedFont == null) {
            $throw(new StdException($.FormatString(S("Font face %s undefined"), P(FontFaceName, 0)).getData(), "runtime_error"));
          }
          this.LastUsedGrpID = -1;
          this.LastUsedName.op_assign$pi8(P(FontFaceName, 0));
        } catch ($e3) {
          if ($isException($e3, "runtime_error")) {
            const e = $e3;
            $.LogFatal(e.what());
          } else {
            throw $e3;
          }
        }
      }
    }
    if (this.pLastUsedFont == null) {
      $.LogFatal($.LoadResStr(S("IDS_ERR_INITFONTS")));
      return false;
    }
    try {
      rFont.Init(this.pLastUsedFont, P(FontFaceName, 0), iDefFontSize[0] >>> 0, dwDefWeight, fDoShadow);
      return true;
    } catch ($e1) {
      if ($isException($e1, "runtime_error")) {
        const e = $e1;
        $.LogFatal(e.what());
        $.LogFatal($.LoadResStr(S("IDS_ERR_INITFONTS")));
        return false;
      } else {
        throw $e1;
      }
    }
  }

  CreateFont$rStdBuf(Data) {
    return new CStdVectorFont().init$rStdBuf(Data);
  }

  CreateFont$pi8(szFaceName) {
    return new CStdVectorFont().init$pi8(szFaceName);
  }

  DestroyFont(pFont) {
    if (pFont == null) {
      return;
    }
    pFont.RefCnt = pFont.RefCnt - 1 | 0;
    if (pFont.RefCnt === 0) {
      $delete(pFont);
    }
  }

  $clone() { return new C4FontLoader().$assign(this); }
  $assign(o) {
    this.pLastUsedFont = o.pLastUsedFont;
    this.LastUsedName.$assign(o.LastUsedName);
    this.LastUsedGrpID = o.LastUsedGrpID;
    return this;
  }
}

export class CStdFont {
  id = 0;
  dwDefFontHeight = 0;
  szFontName = new Int8Array(81);
  psfcFontData = [];
  iSfcSizes = 0;
  iFontZoom = 0;
  sfcCurrent = null;
  iCurrentSfcX = 0;
  iCurrentSfcY = 0;
  iHSpace = 0;
  iGfxLineHgt = 0;
  dwWeight = 0;
  fDoShadow = false;
  fctAsciiTexCoords = $oarr(224, () => new $.C4Facet().init$v());
  fctUnicodeMap = new StdMap();
  pCustomImages = null;
  pVectorFont = null;
  iLineHgt = 0;

  AddSurface() {
    let sfcNew = new $.C4Surface().init$i32$i32$i32(this.iSfcSizes, this.iSfcSizes, 0);
    if (this.sfcCurrent != null && this.sfcCurrent.IsLocked() !== 0) {
      this.sfcCurrent.Unlock();
      sfcNew.Lock();
    }
    this.sfcCurrent = sfcNew;
    this.psfcFontData.push(sfcNew);
    this.iCurrentSfcX = this.iCurrentSfcY = 0;
    return true;
  }

  CheckRenderedCharSpace(iCharWdt, iCharHgt) {
    if ((this.iCurrentSfcX >>> 0) + iCharWdt >>> 0 >= this.iSfcSizes >>> 0) {
      if (this.iCurrentSfcX !== 0) {
        this.iCurrentSfcX = 0;
        this.iCurrentSfcY = (this.iCurrentSfcY >>> 0) + iCharHgt >>> 0 | 0;
        if ((this.iCurrentSfcY >>> 0) + iCharHgt >>> 0 >= this.iSfcSizes >>> 0) {
          if (!this.AddSurface()) {
            return false;
          }
        }
      }
    }
    return true;
  }

  AddRenderedChar(dwChar, pfctTarget) {
    if (this.pVectorFont == null) {
      return false;
    }
    ft$FT_Set_Pixel_Sizes(this.pVectorFont.op_FT_FaceRec__(), this.dwDefFontHeight, this.dwDefFontHeight);
    let iBoldness = this.dwWeight - 400 >>> 0 | 0;
    if (iBoldness !== 0) {
      iBoldness = 65536 + ((iBoldness << 16 | 0) / 400 | 0) | 0;
      let mat = {};
      mat.xx = iBoldness;
      mat.xy = mat.yx = 0;
      mat.yy = 65536;
      ft$FT_Set_Transform(this.pVectorFont.op_FT_FaceRec__(), mat, null);
    } else {
      ft$FT_Set_Transform(this.pVectorFont.op_FT_FaceRec__(), null, null);
    }
    if (ft$FT_Load_Char(this.pVectorFont.op_FT_FaceRec__(), dwChar, 6) !== 0) {
      return true;
    }
    let slot = this.pVectorFont.op_arrow().glyph;
    if (slot.bitmap.pixel_mode !== 2 /*FT_PIXEL_MODE_GRAY*/) {
      return true;
    }
    let width = $max(Math.trunc(slot.advance.x / 64) | 0, ($max(slot.bitmap_left, 0) >>> 0) + slot.bitmap.width >>> 0 | 0) + (this.fDoShadow ? 1 : 0) | 0;
    if (!this.CheckRenderedCharSpace(width >>> 0, this.iGfxLineHgt >>> 0)) {
      return false;
    }
    let at_y = ((this.iCurrentSfcY >>> 0) + ((Math.imul(this.dwDefFontHeight, this.pVectorFont.op_arrow().ascender >>> 0) >>> 0) / this.pVectorFont.op_arrow().units_per_EM >>> 0) >>> 0) - (slot.bitmap_top >>> 0) >>> 0 | 0;
    let at_x = this.iCurrentSfcX + $max(slot.bitmap_left, 0) | 0;
    if (!this.sfcCurrent.Lock()) {
      return false;
    }
    for (let y = 0; y < slot.bitmap.rows + (this.fDoShadow ? 1 : 0) >>> 0; y = y + 1 >>> 0) {
      for (let x = 0; x < slot.bitmap.width + (this.fDoShadow ? 1 : 0) >>> 0; x = x + 1 >>> 0) {
        let bAlpha = 0;
        let bAlphaShadow = 0;
        if (x < slot.bitmap.width && y < slot.bitmap.rows) {
          bAlpha = slot.bitmap.buffer.a[slot.bitmap.buffer.o + ((Math.imul(slot.bitmap.width, y) >>> 0) + x >>> 0)];
        } else {
          bAlpha = 0;
        }
        const dwPixVal = [0];
        bAlphaShadow = 0;
        if ((x !== 0 || y !== 0) && this.fDoShadow) {
          let iShadow = 0;
          if (x < slot.bitmap.width && y < slot.bitmap.rows) {
            iShadow = iShadow + slot.bitmap.buffer.a[slot.bitmap.buffer.o + ((x - 0 >>> 0) + (Math.imul(slot.bitmap.width, y - 0 >>> 0) >>> 0) >>> 0)] | 0;
          }
          if (x > 1 && y < slot.bitmap.rows) {
            iShadow = iShadow + slot.bitmap.buffer.a[slot.bitmap.buffer.o + ((x - 2 >>> 0) + (Math.imul(slot.bitmap.width, y - 0 >>> 0) >>> 0) >>> 0)] | 0;
          }
          if (x > 0 && y < slot.bitmap.rows) {
            iShadow = iShadow + slot.bitmap.buffer.a[slot.bitmap.buffer.o + ((x - 1 >>> 0) + (Math.imul(slot.bitmap.width, y - 0 >>> 0) >>> 0) >>> 0)] | 0;
          }
          if (x < slot.bitmap.width && y > 1) {
            iShadow = iShadow + slot.bitmap.buffer.a[slot.bitmap.buffer.o + ((x - 0 >>> 0) + (Math.imul(slot.bitmap.width, y - 2 >>> 0) >>> 0) >>> 0)] | 0;
          }
          if (x > 1 && y > 1) {
            iShadow = iShadow + slot.bitmap.buffer.a[slot.bitmap.buffer.o + ((x - 2 >>> 0) + (Math.imul(slot.bitmap.width, y - 2 >>> 0) >>> 0) >>> 0)] | 0;
          }
          if (x > 0 && y > 1) {
            iShadow = iShadow + slot.bitmap.buffer.a[slot.bitmap.buffer.o + ((x - 1 >>> 0) + (Math.imul(slot.bitmap.width, y - 2 >>> 0) >>> 0) >>> 0)] | 0;
          }
          if (x < slot.bitmap.width && y > 0) {
            iShadow = iShadow + slot.bitmap.buffer.a[slot.bitmap.buffer.o + ((x - 0 >>> 0) + (Math.imul(slot.bitmap.width, y - 1 >>> 0) >>> 0) >>> 0)] | 0;
          }
          if (x > 1 && y > 0) {
            iShadow = iShadow + slot.bitmap.buffer.a[slot.bitmap.buffer.o + ((x - 2 >>> 0) + (Math.imul(slot.bitmap.width, y - 1 >>> 0) >>> 0) >>> 0)] | 0;
          }
          if (x > 0 && y > 0) {
            iShadow = iShadow + Math.imul(slot.bitmap.buffer.a[slot.bitmap.buffer.o + ((x - 1 >>> 0) + (Math.imul(slot.bitmap.width, y - 1 >>> 0) >>> 0) >>> 0)], 8) | 0;
          }
          bAlphaShadow = (bAlphaShadow + (iShadow / 16 | 0) | 0) & 0xff;
          let cBack = bAlpha;
          dwPixVal[0] = $.RGBA((cBack / 2 | 0) >>> 0, (cBack / 2 | 0) >>> 0, (cBack / 2 | 0) >>> 0, bAlphaShadow);
        }
        $.BltAlpha(P(dwPixVal, 0), (bAlpha << 24 | 0 | 0xffffff) >>> 0);
        this.sfcCurrent.SetPixDw((at_x >>> 0) + x >>> 0 | 0, (at_y >>> 0) + y >>> 0 | 0, dwPixVal[0]);
      }
    }
    this.sfcCurrent.Unlock();
    pfctTarget.Set$pC4Surface$f32$f32$f32$f32(this.sfcCurrent, Math.fround(this.iCurrentSfcX), Math.fround(this.iCurrentSfcY), Math.fround(width), Math.fround(this.iGfxLineHgt));
    this.iCurrentSfcX = ftoi32(Math.fround(Math.fround(this.iCurrentSfcX) + pfctTarget.Wdt));
    return true;
  }

  GetCharacterFacet(c) {
    if (c < 128) {
      return this.fctAsciiTexCoords[c - 32 >>> 0];
    } else {
      return this.GetUnicodeCharacterFacet(c);
    }
  }

  GetUnicodeCharacterFacet(c) {
    const rFacet = this.fctUnicodeMap.entry(c, () => new $.C4Facet().init$v()).second;
    if (rFacet.Surface == null) {
      this.AddRenderedChar(c, rFacet);
    }
    return rFacet;
  }

  DrawText(sfcDest, iX, iY, dwColor$, szText$, dwFlags, Markup, fZoom) {
    const dwColor = [dwColor$];
    const szText = [szText$];
    0;
    let bt = new $.C4DrawTransform().init$v();
    let pbt = null;
    const dwOldModClr = [0];
    let fWasModulated = $.pDraw.GetBlitModulation(P(dwOldModClr, 0));
    if (fWasModulated) {
      $.ModulateClr(P(dwColor, 0), dwOldModClr[0]);
    }
    let dwAlphaMod = (($min((Math.imul(dwColor[0] >>> 24, 255) >>> 0) / 175 >>> 0, 255) << 24) >>> 0 | 0xffffff) >>> 0;
    if ((dwFlags & 1) >>> 0 !== 0) {
      const sx = [0];
      const sy = [0];
      this.GetTextExtent(szText[0], P(sx, 0), P(sy, 0), !((dwFlags & 32) >>> 0 !== 0));
      sx[0] = ftoi32(Math.fround(fZoom * Math.fround(sx[0])));
      sy[0] = ftoi32(Math.fround(fZoom * Math.fround(sy[0])));
      iX = Math.fround(iX - Math.fround(sx[0] / 2 | 0));
    } else if ((dwFlags & 8) >>> 0 !== 0) {
      const sx = [0];
      const sy = [0];
      this.GetTextExtent(szText[0], P(sx, 0), P(sy, 0), !((dwFlags & 32) >>> 0 !== 0));
      sx[0] = ftoi32(Math.fround(fZoom * Math.fround(sx[0])));
      sy[0] = ftoi32(Math.fround(fZoom * Math.fround(sy[0])));
      iX = Math.fround(iX - Math.fround(sx[0]));
    }
    fZoom = Math.fround(fZoom / Math.fround(this.iFontZoom));
    if (!Markup.Clean()) {
      pbt = bt.op_and();
    }
    let c = 0;
    let fctFromBlt = new $.C4Facet().init$v();
    while ((c = $.GetNextCharacter(P(szText, 0))) !== 0) {
      if (c < 32) {
        continue;
      }
      if (c === 60 && (~dwFlags >>> 0 & 32) >>> 0 !== 0) {
        if (Markup.Read(((szText[0] = szText[0].add(-1)), P(szText, 0)))) {
          pbt = bt.op_and();
          continue;
        }
        szText[0] = szText[0].add(1);
      }
      const w2 = [0];
      const h2 = [0];
      let iImgLgt = 0;
      const imgbuf = $cs(S(""), 101);
      if (c === 123 && szText[0].a[szText[0].o + 0] === 123 && szText[0].a[szText[0].o + 1] !== 123 && (iImgLgt = $.SCharPos(125, $padd(szText[0], 1))) > 0 && szText[0].a[szText[0].o + (iImgLgt + 2 | 0)] === 125 && !((dwFlags & 32) >>> 0 !== 0)) {
        $.SCopy$pi8$pi8$u64($padd(szText[0], 1), P(imgbuf, 0), $u64n($min(iImgLgt, 100)));
        szText[0] = szText[0].add(iImgLgt + 3 | 0);
        if (!this.GetFontImageSize(P(imgbuf, 0), P(w2, 0), P(h2, 0))) {
          continue;
        }
        if (dwColor[0] >>> 24 >= 175) {
          $.pDraw.DeactivateBlitModulation();
        } else {
          $.pDraw.ActivateBlitModulation(((dwColor[0] & 0xff000000) >>> 0 | 0xffffff) >>> 0);
        }
      } else {
        fctFromBlt.$assign(this.GetCharacterFacet(c));
        if (fctFromBlt.Surface == null) {
          continue;
        }
        w2[0] = ftoi32(Math.fround(fctFromBlt.Wdt * fZoom));
        h2[0] = ftoi32(Math.fround(fctFromBlt.Hgt * fZoom));
        $.pDraw.ActivateBlitModulation(dwColor[0]);
      }
      if (pbt != null) {
        const dwBlitClr = [dwColor[0]];
        bt.Set(Math.fround(1), Math.fround(0), Math.fround(0), Math.fround(0), Math.fround(1), Math.fround(0), Math.fround(0), Math.fround(0), Math.fround(1));
        Markup.Apply(bt, P(dwBlitClr, 0));
        if (dwBlitClr[0] !== dwColor[0]) {
          $.ModulateClrA(P(dwBlitClr, 0), dwAlphaMod);
        }
        $.pDraw.ActivateBlitModulation(dwBlitClr[0]);
        let fOffX = Math.fround(Math.fround(Math.fround(w2[0]) / Math.fround(2)) + iX);
        let fOffY = Math.fround(Math.fround(Math.fround(h2[0]) / Math.fround(2)) + iY);
        bt.mat[2] = Math.fround(bt.mat[2] + Math.fround(Math.fround(fOffX - Math.fround(fOffX * bt.mat[0])) - Math.fround(fOffY * bt.mat[1])));
        bt.mat[5] = Math.fround(bt.mat[5] + Math.fround(Math.fround(fOffY - Math.fround(fOffX * bt.mat[3])) - Math.fround(fOffY * bt.mat[4])));
      }
      if (imgbuf[0] !== 0) {
        let fct = new $.C4Facet().init$v();
        fct.Set$pC4Surface$f32$f32$f32$f32(sfcDest, iX, Math.fround(iY + Math.fround(Math.fround(this.iGfxLineHgt - h2[0] | 0) / 2)), Math.fround(w2[0]), Math.fround(h2[0]));
        this.pCustomImages.DrawFontImage(P(imgbuf, 0), fct, pbt);
      } else {
        $.pDraw.Blit(fctFromBlt.Surface, fctFromBlt.X, fctFromBlt.Y, fctFromBlt.Wdt, fctFromBlt.Hgt, sfcDest, iX, iY, Math.fround(w2[0]), Math.fround(h2[0]), true, pbt);
      }
      iX = Math.fround(iX + Math.fround(w2[0] + this.iHSpace | 0));
    }
    if (fWasModulated) {
      $.pDraw.ActivateBlitModulation(dwOldModClr[0]);
    } else {
      $.pDraw.DeactivateBlitModulation();
    }
  }

  GetTextExtent(szText$, rsx, rsy, fCheckMarkup = true) {
    const szText = [szText$];
    if (szText[0] == null) {
      return false;
    }
    0;
    let iRowWdt = 0;
    let iWdt = 0;
    let iHgt = this.iLineHgt;
    let MarkupChecker = new $.C4Markup().init(false);
    while (szText[0].a[szText[0].o] !== 0) {
      if (fCheckMarkup) {
        MarkupChecker.SkipTags(P(szText, 0));
      }
      let c = $.GetNextCharacter(P(szText, 0));
      if (c === 0) {
        break;
      }
      if (c === 10 || fCheckMarkup && c === 124) {
        iRowWdt = 0;
        iHgt = iHgt + this.iLineHgt | 0;
        continue;
      }
      if (c < 32) {
        continue;
      }
      let iImgLgt = 0;
      if (fCheckMarkup && c === 123 && szText[0].a[szText[0].o + 0] === 123 && szText[0].a[szText[0].o + 1] !== 123 && (iImgLgt = $.SCharPos(125, $padd(szText[0], 1))) > 0 && szText[0].a[szText[0].o + (iImgLgt + 2 | 0)] === 125) {
        const imgbuf = new Int8Array(101);
        $.SCopy$pi8$pi8$u64($padd(szText[0], 1), P(imgbuf, 0), $u64n($min(iImgLgt, 100)));
        const w2 = [0];
        const h2 = [0];
        if (!this.GetFontImageSize(P(imgbuf, 0), P(w2, 0), P(h2, 0))) {
          w2[0] = 0;
          h2[0] = 0;
        }
        iRowWdt = iRowWdt + w2[0] | 0;
        szText[0] = szText[0].add(iImgLgt + 3 | 0);
      } else {
        iRowWdt = ftoi32(Math.fround(Math.fround(iRowWdt) + Math.fround(this.GetCharacterFacet(c).Wdt / Math.fround(this.iFontZoom))));
      }
      if (szText[0].a[szText[0].o] !== 0) {
        iRowWdt = iRowWdt + this.iHSpace | 0;
      }
      if (iRowWdt > iWdt) {
        iWdt = iRowWdt;
      }
    }
    rsx.a[rsx.o] = iWdt;
    rsy.a[rsy.o] = iHgt;
    return true;
  }

  GetLineHeight() {
    return this.iLineHgt;
  }

  GetFontHeight() {
    return this.GetLineHeight();
  }

  GetTextWidth(szText, fCheckMarkup = true) {
    const x = [0];
    const y = [0];
    this.GetTextExtent(szText, P(x, 0), P(y, 0), fCheckMarkup);
    return x[0];
  }

  BreakMessage$pi8$i32$b$f32(szMsg, iWdt, fCheckMarkup, fZoom = 1) {
    if (szMsg == null) {
      return (($t) => $tuple(StdString.of($t[0]), $t[1]))($tuple(S(""), 0));
    }
    let out = new StdString();
    let c = 0;
    const szPos = [szMsg];
    let szLastBreakPos = szMsg;
    let szLastEmergenyBreakPos = null;
    let szLastPos = null;
    let iLastBreakOutLen = 0;
    let iLastEmergencyBreakOutLen = 0;
    let iX = 0;
    let iXBreak = 0;
    let iXEmergencyBreak = 0;
    let iHgt = this.iLineHgt;
    let iCharHOverlap = $max(-this.iHSpace | 0, 0);
    let fIsFirstLineChar = true;
    let MarkupChecker = new $.C4Markup().init(false);
    while ($rd(szLastPos = szPos[0]) !== 0) {
      if (fCheckMarkup) {
        MarkupChecker.SkipTags(P(szPos, 0));
      }
      c = $.GetNextCharacter(P(szPos, 0));
      if (c === 0) {
        break;
      }
      const iCharWdt = [0];
      if (c !== 10 && (!fCheckMarkup || c !== 124)) {
        let iImgLgt = 0;
        if (fCheckMarkup && c === 123 && szPos[0].a[szPos[0].o + 0] === 123 && szPos[0].a[szPos[0].o + 1] !== 123 && (iImgLgt = $.SCharPos(125, $padd(szPos[0], 1))) > 0 && szPos[0].a[szPos[0].o + (iImgLgt + 2 | 0)] === 125) {
          const imgbuf = new Int8Array(101);
          $.SCopy$pi8$pi8$u64($padd(szPos[0], 1), P(imgbuf, 0), $u64n($min(iImgLgt, 100)));
          const iCharHgt = [0];
          if (!this.GetFontImageSize(P(imgbuf, 0), P(iCharWdt, 0), P(iCharHgt, 0))) {
            iCharWdt[0] = 0;
          }
          szPos[0] = szPos[0].add(iImgLgt + 3 | 0);
        } else {
          if (c >= 32) {
            iCharWdt[0] = ftoi32(Math.fround(Math.fround(fZoom * this.GetCharacterFacet(c).Wdt) / Math.fround(this.iFontZoom))) + this.iHSpace | 0;
          } else {
            iCharWdt[0] = 0;
          }
        }
        out.append(szLastPos, $u64n(szPos[0].o - szLastPos.o));
        if (((iX = iX + iCharWdt[0] | 0) + iCharHOverlap | 0) <= iWdt || fIsFirstLineChar) {
          if (c < 256) {
            if (c$isspace(c & 0xff) !== 0 || c === 45) {
              szLastBreakPos = szPos[0];
              iLastBreakOutLen = out.size() | 0;
              if (c !== 45 && !fIsFirstLineChar) {
                szLastBreakPos = szLastBreakPos.add(-1);
              }
              iXBreak = iX;
            }
          }
          szLastEmergenyBreakPos = szPos[0];
          iXEmergencyBreak = iX;
          iLastEmergencyBreakOutLen = out.size() | 0;
          fIsFirstLineChar = false;
          continue;
        }
        if (c < 128 && c$isspace(c & 0xff) !== 0) {
          szLastBreakPos = $padd(szPos[0], -1);
          iLastBreakOutLen = out.size() | 0;
          iXBreak = iX;
        } else if ($peq(szLastBreakPos, szMsg)) {
          szLastBreakPos = szLastEmergenyBreakPos;
          iLastBreakOutLen = iLastEmergencyBreakOutLen;
          iXBreak = iXEmergencyBreak;
        }
        if ((szLastBreakPos.a[szLastBreakPos.o] & 0xff) < 128 && c$isspace(szLastBreakPos.a[szLastBreakPos.o] & 0xff) !== 0) {
          out.d[$u64n(iLastBreakOutLen - 1 | 0)] = 10;
        } else {
          out.insert($u64n(iLastBreakOutLen), 1, 10);
        }
        iX = iX - iXBreak | 0;
      } else {
        iX = 0;
        out.append(szLastPos, $u64n(szPos[0].o - szLastPos.o));
      }
      szLastBreakPos = szMsg = szPos[0];
      iHgt = iHgt + this.iLineHgt | 0;
      fIsFirstLineChar = true;
    }
    out.append(szLastPos, $u64n(szPos[0].o - szLastPos.o));
    return $tuple(out, iHgt);
  }

  BreakMessage$pi8$i32$pi8$i32$b$f32(szMsg, iWdt, szOut, iMaxOutLen, fCheckMarkup, fZoom = 1) {
    if (iMaxOutLen === 0) {
      return 0;
    }
    if (szMsg == null) {
      if (szOut != null) {
        szOut.a[szOut.o] = 0;
      }
      return 0;
    }
    let t = this.BreakMessage$pi8$i32$b$f32(szMsg, iWdt, fCheckMarkup, fZoom);
    let str = t[0].$clone();
    let len = str.copy(szOut, $u64n(iMaxOutLen));
    szOut.a[szOut.o + len] = 0;
    return t[1];
  }

  BreakMessage$pi8$i32$pStdStrBuf$b$f32(szMsg, iWdt, pOut, fCheckMarkup, fZoom = 1) {
    if (szMsg == null || pOut == null) {
      return 0;
    }
    let t = this.BreakMessage$pi8$i32$b$f32(szMsg, iWdt, fCheckMarkup, fZoom);
    let str = t[0].$clone();
    pOut.Clear();
    pOut.Append$pi8$u64(str.c_str(), str.size());
    return t[1];
  }

  GetMessageBreak(szMsg, ppNewPos, iBreakWidth, fZoom = 1) {
    let $t1, $t2;
    if (szMsg == null || szMsg.a[szMsg.o] === 0) {
      ppNewPos.a[ppNewPos.o] = szMsg;
      return 0;
    }
    let szPos = szMsg;
    let c = 0;
    let iWdt = 0;
    let iPos = 0;
    while ((c = $rd(($t1 = szPos, szPos = szPos.add(1), $t1)) & 0xff) !== 0) {
      iPos = iPos + 1 | 0;
      let iCharWdt = ftoi32(Math.fround(Math.fround(fZoom * this.fctAsciiTexCoords[c - 32 | 0].Wdt) / Math.fround(this.iFontZoom))) + this.iHSpace | 0;
      iWdt = iWdt + iCharWdt | 0;
      if (iWdt > iBreakWidth) {
        break;
      }
    }
    if (c === 0) {
      ppNewPos.a[ppNewPos.o] = $padd(szPos, -1);
      return iPos;
    }
    let szPos2 = $padd(szPos, -1);
    let i = 0;
    while ((!(($t2 = i, i = i + 1 | 0, $t2) !== 0) || szPos2.a[szPos2.o] !== 45) && szPos2.a[szPos2.o] !== 32) {
      if ($peq(szPos2, szMsg)) {
        szPos2 = $padd(szPos, -1);
        break;
      } else {
        szPos2 = szPos2.add(-1);
      }
    }
    if (szPos2.o <= szMsg.o) {
      szPos2 = $padd(szMsg, 1);
    }
    ppNewPos.a[ppNewPos.o] = szPos2;
    if (szPos2.a[szPos2.o] === 32) {
      ppNewPos.a[ppNewPos.o] = ppNewPos.a[ppNewPos.o].add(1);
    }
    return szPos2.o - szMsg.o | 0;
  }

  init() {
    this.psfcFontData = [];
    this.fctAsciiTexCoords = $oarr(224, () => new $.C4Facet().init$v());
    this.fctUnicodeMap = new StdMap();
    this.sfcCurrent = null;
    this.iSfcSizes = 64;
    this.dwDefFontHeight = (this.iLineHgt = 10) >>> 0;
    this.iFontZoom = 1;
    this.iHSpace = -1;
    this.iGfxLineHgt = this.iLineHgt + 1 | 0;
    this.dwWeight = 400;
    this.fDoShadow = false;
    $wr(P(this.szFontName, 0), 0, 0);
    this.id = 0;
    this.pCustomImages = null;
    this.pVectorFont = null;
    return this;
  }

  $dtor() {
    CStdFont.prototype.Clear.call(this);
  }

  Init(VectorFont, font_face_name, dwHeight, dwFontWeight = 400, fDoShadow = true) {
    this.Clear();
    this.iHSpace = fDoShadow ? -1 : 0;
    this.dwWeight = dwFontWeight;
    this.fDoShadow = fDoShadow;
    if (Math.imul(dwHeight, this.iFontZoom >>> 0) >>> 0 > 40) {
      this.iSfcSizes = 512;
    } else if (Math.imul(dwHeight, this.iFontZoom >>> 0) >>> 0 > 20) {
      this.iSfcSizes = 256;
    } else {
      this.iSfcSizes = 128;
    }
    $.SCopy$pi8$pi8$u64(font_face_name, P(this.szFontName, 0), 80);
    this.dwDefFontHeight = dwHeight;
    if (!this.AddSurface()) {
      this.Clear();
      $throw(new StdException(StdString.of(S("Cannot create surface (")).plus(P(this.szFontName, 0)).plus(S(")")), "runtime_error"));
    }
    this.pVectorFont = VectorFont;
    this.pVectorFont.RefCnt = this.pVectorFont.RefCnt + 1 | 0;
    this.iLineHgt = (Math.imul((VectorFont.op_arrow().ascender - VectorFont.op_arrow().descender | 0) >>> 0, dwHeight) >>> 0) / VectorFont.op_arrow().units_per_EM >>> 0 | 0;
    this.iGfxLineHgt = this.iLineHgt + (fDoShadow ? 1 : 0) | 0;
    let cMax = 127;
    this.sfcCurrent.Lock();
    for (let c = 32; c <= cMax; c = c + 1 | 0) {
      if (!this.AddRenderedChar(c >>> 0, this.fctAsciiTexCoords[c - 32 | 0])) {
        this.sfcCurrent.Unlock();
        this.Clear();
        $throw(new StdException(StdString.of(S("Cannot render characters for Font (")).plus(P(this.szFontName, 0)).plus(S(")")), "runtime_error"));
      }
    }
    this.sfcCurrent.Unlock();
    this.iLineHgt = this.iLineHgt / this.iFontZoom | 0;
  }

  Clear() {
    $.FontLoader.DestroyFont(this.pVectorFont);
    this.pVectorFont = null;
    this.sfcCurrent = null;
    this.psfcFontData.length = 0;
    for (let c = 32; c < 256; c = c + 1 | 0) {
      $.C4Facet.prototype.Default.call(this.fctAsciiTexCoords[c - 32 | 0]);
    }
    this.fctUnicodeMap.clear();
    this.dwDefFontHeight = (this.iLineHgt = 10) >>> 0;
    this.iFontZoom = 1;
    this.iHSpace = -1;
    this.iGfxLineHgt = this.iLineHgt + 1 | 0;
    this.dwWeight = 400;
    this.fDoShadow = false;
    $wr(P(this.szFontName, 0), 0, 0);
    this.id = 0;
  }

  IsInitialized() {
    return !!($rd(P(this.szFontName, 0)) !== 0);
  }

  IsSameAsID(szCFontName, iCID, iCIndent) {
    return $.SEqual(szCFontName, P(this.szFontName, 0)) && iCID === this.id && iCIndent === (-this.iHSpace | 0);
  }

  IsSameAs(szCFontName, iCHeight, dwCWeight) {
    return $.SEqual(szCFontName, P(this.szFontName, 0)) && this.id === 0 && iCHeight === this.dwDefFontHeight && dwCWeight === this.dwWeight;
  }

  SetCustomImages(pHandler) {
    this.pCustomImages = pHandler;
  }

  GetFontImageSize(szTag, width, height) {
    let aspect = this.pCustomImages != null ? this.pCustomImages.GetFontImageAspect(szTag) : -1;
    if (aspect < 0) {
      return false;
    }
    height.a[height.o] = this.iGfxLineHgt;
    width.a[width.o] = ftoi32(Math.fround(Math.fround(Math.fround(height.a[height.o]) * aspect) + 0.5));
    if (width.a[width.o] > height.a[height.o]) {
      let scale = Math.fround(Math.fround(height.a[height.o]) / Math.fround(width.a[width.o]));
      width.a[width.o] = height.a[height.o];
      height.a[height.o] = ftoi32(Math.fround(Math.fround(Math.fround(height.a[height.o]) * scale) + 0.5));
    }
    return true;
  }

  $clone() { return new CStdFont().$assign(this); }
  $assign(o) {
    this.id = o.id;
    this.dwDefFontHeight = o.dwDefFontHeight;
    this.szFontName = o.szFontName.slice();
    this.psfcFontData = o.psfcFontData.slice();
    this.iSfcSizes = o.iSfcSizes;
    this.iFontZoom = o.iFontZoom;
    this.sfcCurrent = o.sfcCurrent;
    this.iCurrentSfcX = o.iCurrentSfcX;
    this.iCurrentSfcY = o.iCurrentSfcY;
    this.iHSpace = o.iHSpace;
    this.iGfxLineHgt = o.iGfxLineHgt;
    this.dwWeight = o.dwWeight;
    this.fDoShadow = o.fDoShadow;
    this.fctAsciiTexCoords = $own(o.fctAsciiTexCoords.map(($e0) => $e0.$clone()));
    this.fctUnicodeMap = o.fctUnicodeMap.$clone();
    this.pCustomImages = o.pCustomImages;
    this.pVectorFont = o.pVectorFont;
    this.iLineHgt = o.iLineHgt;
    return this;
  }
}

export class CStdVectorFont {
  library = null;
  face = null;
  Data = new $.StdBuf();
  RefCnt = 0;

  init$pi8(FontFaceName) {
    this.Data = new $.StdBuf();
    this.RefCnt = 1;
    if (ft$FT_Init_FreeType(P(this, "library")) !== 0) {
      $throw(new StdException(S("Cannot init Freetype"), "runtime_error"));
    }
    let e = 0;
    if ((e = ft$FT_New_Face(this.library, FontFaceName, 0, P(this, "face"))) !== 0) {
      $throw(new StdException(StdString.of(S("Cannot load ")).plus(FontFaceName).plus(S(": ")).plus($.FormatString(S("%d"), e).getData()), "runtime_error"));
    }
    return this;
  }

  init$rStdBuf(Data) {
    this.Data = new $.StdBuf().init$rStdBuf$b(Data);
    this.RefCnt = 1;
    if (ft$FT_Init_FreeType(P(this, "library")) !== 0) {
      $throw(new StdException(S("Cannot init Freetype"), "runtime_error"));
    }
    let e = 0;
    if ((e = ft$FT_New_Memory_Face(this.library, $reinterpVoid($.StdBuf.prototype.getData.call(Data), "u8"), $i64n($.StdBuf.prototype.getSize.call(Data)), 0, P(this, "face"))) !== 0) {
      $throw(new StdException(StdString.of(S("Cannot load font: ")).plus($.FormatString(S("%d"), e).getData()), "runtime_error"));
    }
    return this;
  }

  $dtor() {
    ft$FT_Done_Face(this.face);
    ft$FT_Done_FreeType(this.library);
  }

  op_FT_FaceRec__() {
    return this.face;
  }

  op_arrow() {
    return this.face;
  }

  $clone() { return new CStdVectorFont().$assign(this); }
  $assign(o) {
    this.library = o.library;
    this.face = o.face;
    this.Data.$assign(o.Data);
    this.RefCnt = o.RefCnt;
    return this;
  }
}


export function $init(): void {
  $.FontLoader = new C4FontLoader(); $.FontLoader.init();
}

Object.assign($, { C4FontLoader, CStdFont, CStdVectorFont });
