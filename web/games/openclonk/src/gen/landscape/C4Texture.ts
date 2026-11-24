// @ts-nocheck
// OpenClonk 36de799: src/landscape/C4Texture.cpp, src/landscape/C4Texture.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { ftou32 } from '../../rt/int.ts';
import { c$isspace, c$memcpy } from '../../rt/libc.ts';
import { UnsyncedRandom$u32 } from '../../rt/native.ts';
import { $oadd, $oarr, $oat, $oidx, $own, $padd, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $begin, $delete, $end, $isException, $itcopy, $reserve, $rx, $stoul, $throw, Regex, RegexTokenIterator, StdException, StdString, seq_erase, std_all_of, std_find, std_find_if, std_remove_if } from '../../rt/std.ts';

export class C4Texture {
  Surface32 = null;
  Name = new $.StdStrBuf();
  AvgColor = 0;
  material_shape = null;
  Next = null;

  init() {
    this.Name = new $.StdStrBuf();
    this.material_shape = null;
    this.Surface32 = null;
    this.AvgColor = 0;
    this.Next = null;
    return this;
  }

  $dtor() {
    $delete(this.Surface32);
  }

  SetAverageColor(Color) {
    this.AvgColor = Color;
  }

  GetAverageColor() {
    return this.AvgColor;
  }

  SetMaterialShape(s) {
    this.material_shape = s;
  }

  GetMaterialShape() {
    return this.material_shape;
  }

  $clone() { return new C4Texture().$assign(this); }
  $assign(o) {
    this.Surface32 = o.Surface32;
    this.Name.$assign(o.Name);
    this.AvgColor = o.AvgColor;
    this.material_shape = o.material_shape;
    this.Next = o.Next;
    return this;
  }
}

export class C4TexMapEntry {
  Material = new $.StdCopyStrBuf();
  Texture = new $.StdCopyStrBuf();
  iMaterialIndex = 0;
  pMaterial = null;
  MatPattern = new $.C4Pattern().init();

  init() {
    this.Material = new $.StdCopyStrBuf();
    this.Texture = new $.StdCopyStrBuf();
    this.iMaterialIndex = -1;
    this.pMaterial = null;
    this.MatPattern = new $.C4Pattern().init();
    return this;
  }

  isNull() {
    return this.Material.isNull();
  }

  GetMaterialName() {
    return this.Material.getData();
  }

  GetTextureName() {
    return this.Texture.getData();
  }

  GetMaterialIndex() {
    return this.iMaterialIndex;
  }

  GetMaterial() {
    return this.pMaterial;
  }

  GetPattern() {
    return this.MatPattern;
  }

  Clear() {
    this.Material.Clear();
    this.Texture.Clear();
    this.iMaterialIndex = -1;
    this.pMaterial = null;
    this.MatPattern.Clear();
  }

  Create(szMaterial, szTexture) {
    this.Clear();
    this.Material.op_assign$pi8(szMaterial);
    this.Texture.op_assign$pi8(szTexture);
    return true;
  }

  Init() {
    this.iMaterialIndex = $.MaterialMap.Get(this.Material.getData());
    if (!$.MatValid(this.iMaterialIndex)) {
      $.DebugLogF(S("Error initializing material %s-%s: Invalid material!"), this.Material.getData(), this.Texture.getData());
      return false;
    }
    this.pMaterial = $oadd($.MaterialMap.Map, this.iMaterialIndex);
    let FirstTexture = new $.StdStrBuf();
    FirstTexture.CopyUntil(this.Texture.getData(), 45);
    let sfcTexture = $.TextureMap.GetTexture$pi8(FirstTexture.getData());
    if (sfcTexture == null) {
      $.DebugLogF(S("Error initializing material %s-%s: Invalid texture!"), this.Material.getData(), FirstTexture.getData());
      this.Clear();
      return false;
    }
    let iOverlayType = this.pMaterial.OverlayType;
    let iZoom = 0;
    if ((iOverlayType & 1) !== 0) {
      iZoom = 1;
    }
    if ((iOverlayType & 4) !== 0) {
      iZoom = 4;
    }
    this.MatPattern.Set(sfcTexture.Surface32, iZoom);
    return true;
  }

  $clone() { return new C4TexMapEntry().$assign(this); }
  $assign(o) {
    this.Material.$assign(o.Material);
    this.Texture.$assign(o.Texture);
    this.iMaterialIndex = o.iMaterialIndex;
    this.pMaterial = o.pMaterial;
    this.MatPattern.$assign(o.MatPattern);
    return this;
  }
}

export class C4TextureMap {
  Entry = $oarr(255, () => new C4TexMapEntry().init());
  Order = [];
  FirstTexture = null;
  fOverloadMaterials = false;
  fOverloadTextures = false;
  fInitialized = false;
  fEntriesAdded = false;

  init() {
    this.Entry = $oarr(255, () => new C4TexMapEntry().init());
    this.Order = [];
    this.FirstTexture = null;
    this.fOverloadMaterials = false;
    this.fOverloadTextures = false;
    this.fInitialized = false;
    this.fEntriesAdded = false;
    $reserve(this.Order, 255);
    return this;
  }

  $dtor() {
    C4TextureMap.prototype.Clear.call(this);
  }

  GetEntry(iIndex) {
    return $.Inside$i32$i32$i32$3(iIndex, 0, 254) ? $oat(this.Entry, iIndex) : null;
  }

  RemoveEntry(iIndex) {
    if ($.Inside$i32$i32$i32$3(iIndex, 1, 254)) {
      this.Entry[iIndex].Clear();
      let last_entry = std_remove_if($begin(this.Order), $end(this.Order), ((entry) => {
  return entry === iIndex;
}));
      seq_erase(this.Order, $itcopy(last_entry), $end(this.Order));
    }
  }

  Clear() {
    for (let i = 1; i < 255; i = i + 1 | 0) {
      this.Entry[i].Clear();
    }
    let ctex = null;
    let next2 = null;
    for (ctex = this.FirstTexture; ctex != null; ctex = next2) {
      next2 = ctex.Next;
      $delete(ctex);
    }
    this.FirstTexture = null;
    this.fInitialized = false;
    this.fEntriesAdded = false;
    this.fOverloadMaterials = false;
    this.fOverloadTextures = false;
    this.Order.length = 0;
    $reserve(this.Order, 255);
  }

  StoreMapPalette(Palette, _rMaterial) {
    Palette.Colors[0] = 0xffc0c4fc;
    const fSet = new Array(255).fill(false);
    $.ZeroMem$x$u64(P(fSet, 0), 255);
    let i = 0;
    for (i = 1; i < 255; i = i + 1 | 0) {
      let dwPix = 0;
      let texture = this.GetTexture$pi8(this.Entry[i].GetTextureName());
      if (texture != null) {
        dwPix = texture.GetAverageColor();
      } else {
        dwPix = this.Entry[i].GetPattern().PatternClr(0, 0);
      }
      Palette.Colors[i] = dwPix;
      fSet[i] = true;
    }
    for (i = 0; i < 255; i = i + 1 | 0) {
      if (fSet[i]) {
        for (; ; ) {
          let j = 0;
          for (; j < i; j = j + 1 | 0) {
            if (fSet[j] && Palette.Colors[i] === Palette.Colors[j]) {
              break;
            }
          }
          if (j >= i) {
            break;
          }
          Palette.Colors[i] = (((0xff000000 | (((UnsyncedRandom$u32(2) !== 0 ? (Palette.Colors[i] >>> 16 & 0xff) + 3 | 0 : (Palette.Colors[i] >>> 16 & 0xff) - 3 | 0) >>> 0 & 255) >>> 0 << 16) >>> 0) >>> 0 | (((UnsyncedRandom$u32(2) !== 0 ? ((Palette.Colors[i] & 0xffff) >> 8 & 0xff) + 3 | 0 : ((Palette.Colors[i] & 0xffff) >> 8 & 0xff) - 3 | 0) >>> 0 & 255) >>> 0 << 8) >>> 0) >>> 0 | ((UnsyncedRandom$u32(2) !== 0 ? (Palette.Colors[i] & 0xff) + 3 | 0 : (Palette.Colors[i] & 0xff) - 3 | 0) & 255) >>> 0) >>> 0;
        }
      }
    }
  }

  static LoadFlags(hGroup, szEntryName, pOverloadMaterials, pOverloadTextures) {
    let TexMap = new $.StdStrBuf();
    if (!hGroup.LoadEntryString$pi8$pStdStrBuf(szEntryName, TexMap)) {
      return false;
    }
    if (pOverloadMaterials != null) {
      pOverloadMaterials.a[pOverloadMaterials.o] = false;
    }
    if (pOverloadTextures != null) {
      pOverloadTextures.a[pOverloadTextures.o] = false;
    }
    for (let pPos = TexMap.getData(); pPos != null && pPos.a[pPos.o] !== 0; pPos = $.SSearch($padd(pPos, 1), S("\n"))) {
      while (pPos.a[pPos.o] === 13 || pPos.a[pPos.o] === 10) {
        pPos = pPos.add(1);
      }
      if (pOverloadMaterials != null && $.SEqual2(pPos, S("OverloadMaterials"))) {
        pOverloadMaterials.a[pOverloadMaterials.o] = true;
      }
      if (pOverloadTextures != null && $.SEqual2(pPos, S("OverloadTextures"))) {
        pOverloadTextures.a[pOverloadTextures.o] = true;
      }
    }
    return true;
  }

  LoadMap(hGroup, szEntryName, pOverloadMaterials, pOverloadTextures) {
    if (!('C4TextureMap$LoadMap$line_terminator' in $)) $.C4TextureMap$LoadMap$line_terminator = new Regex(S("\r?\n"), $rx.optimize | $rx.ECMAScript);
    const bpMap = [null];
    const map_size = [0];
    let iTextures = 0;
    if (!hGroup.LoadEntry$pi8$ppi8$pu64$i32(szEntryName, P(bpMap, 0), P(map_size, 0), 1)) {
      return 0;
    }
    let begin = bpMap[0];
    let end = $padd(begin, map_size[0]);
    let line = 1;
    for (let it = new RegexTokenIterator(begin, end, $.C4TextureMap$LoadMap$line_terminator, -1); !it.eq(new RegexTokenIterator()); it.inc(), line = line + 1) {
      if (it.v.compare(S("OverloadMaterials")) === 0) {
        this.fOverloadMaterials = true;
        if (pOverloadMaterials != null) {
          pOverloadMaterials.a[pOverloadMaterials.o] = true;
        }
      } else if (it.v.compare(S("OverloadTextures")) === 0) {
        this.fOverloadTextures = true;
        if (pOverloadTextures != null) {
          pOverloadTextures.a[pOverloadTextures.o] = true;
        }
      } else if (it.v.length() === 0 || it.v.first.a[it.v.first.o + 0] === 35 || std_all_of(it.v.first, it.v.second, c$isspace)) {
        continue;
      } else {
        let value = new StdString();
        let index = 0;
        try {
          const separator = [0];
          index = $stoul(it.v.str(), P(separator, 0), 10);
          if (index >= 255) {
            $throw(new StdException(S("Texture index out of range"), "out_of_range"));
          }
          value.assign($padd($padd(it.v.first, separator[0]), 1), it.v.second);
        } catch ($e3) {
          if ($isException($e3, "invalid_argument")) {
            $.DebugLogF(S("TexMap line %u: Texture index is not numeric"), line >>> 0);
            continue;
          } else if ($isException($e3, "out_of_range")) {
            $.DebugLogF(S("TexMap line %u: Texture index is out of range"), line >>> 0);
            continue;
          } else {
            throw $e3;
          }
        }
        let separator = std_find(value.cbegin(), value.cend(), 45);
        if (separator.eq(value.cend())) {
          $.DebugLogF(S("TexMap line %u: Texture name \"%s\" is invalid (missing \"-\")"), line >>> 0, value.c_str());
          continue;
        }
        let material = StdString.of(value.cbegin(), $itcopy(separator));
        let texture = StdString.of(separator.add(1), value.cend());
        if (this.AddEntry(index & 0xff, material.c_str(), texture.c_str())) {
          iTextures = iTextures + 1 | 0;
        }
      }
    }
    $delete(bpMap[0]);
    this.fEntriesAdded = false;
    return iTextures;
  }

  Init() {
    let iRemoved = 0;
    let i = 0;
    for (i = 0; i < 255; i = i + 1 | 0) {
      if (!this.Entry[i].isNull()) {
        if (!this.Entry[i].Init()) {
          $.LogF(S("Error in TextureMap initialization at entry %d"), i);
          this.Entry[i].Clear();
          iRemoved = iRemoved + 1 | 0;
        }
      }
    }
    this.fInitialized = true;
    return iRemoved;
  }

  SaveMap(hGroup, szEntryName) {
    let sTexMapFile = new $.StdStrBuf();
    sTexMapFile.Append$pi8(S("# Automatically generated texture map\n"));
    sTexMapFile.Append$pi8(S("# Contains material-texture-combinations added at runtime\n"));
    if (this.fOverloadMaterials) {
      sTexMapFile.Append$pi8(S("# Import materials from global file as well\nOverloadMaterials\n"));
    }
    if (this.fOverloadTextures) {
      sTexMapFile.Append$pi8(S("# Import textures from global file as well\nOverloadTextures\n"));
    }
    sTexMapFile.Append$pi8(S("\n"));
    for (const i of this.Order) {
      if (!this.Entry[i].isNull()) {
        sTexMapFile.AppendFormat(S("%d=%s-%s\n"), i, this.Entry[i].GetMaterialName(), this.Entry[i].GetTextureName());
      }
    }
    let iBufSize = sTexMapFile.getLength();
    let pBuf = P(new Uint8Array(iBufSize), 0);
    c$memcpy(pBuf, sTexMapFile.getData(), iBufSize);
    let fSuccess = !!hGroup.Add$pi8$px$i32$b$b$b(szEntryName, pBuf, iBufSize | 0, false, true);
    if (!fSuccess) {
      $delete(pBuf);
    }
    return fSuccess;
  }

  LoadTextures(hGroup, OverloadFile = null) {
    let $t1;
    let texnum = 0;
    if (OverloadFile != null) {
      texnum = texnum + this.LoadTextures(OverloadFile) | 0;
    }
    const texname = new Int8Array(257);
    let ctex = null;
    const binlen = [0];
    hGroup.ResetSearch();
    while (hGroup.AccessNextEntry(S("*"), P(binlen, 0), P(texname, 0))) {
      let base_filename = $.GetFilenameOnly(P(texname, 0));
      if (this.GetTexture$pi8(base_filename) != null) {
        continue;
      }
      if ($.WildcardMatch(S("*_Shape.png"), P(texname, 0))) {
        continue;
      }
      ctex = new $.C4Surface().init$v();
      if (ctex.Read(hGroup, $.GetExtension$2(P(texname, 0)), 2)) {
        $.SReplaceChar(P(texname, 0), 46, 0);
        if (this.AddTexture(P(texname, 0), ctex)) {
          texnum = texnum + 1 | 0;
        } else {
          $delete(ctex);
        }
      } else {
        $delete(ctex);
      }
    }
    hGroup.ResetSearch();
    while (hGroup.AccessNextEntry(S("*_Shape.png"), P(binlen, 0), P(texname, 0))) {
      let texname4shape = new $.StdStrBuf().init$pi8$b(P(texname, 0), true);
      texname4shape.SetLength(texname4shape.getLength() - $.SLen(S("_Shape.png")));
      let base_tex = this.GetTexture$pi8(texname4shape.getData());
      if (base_tex == null || base_tex.Surface32 == null) {
        $.LogF(S("ERROR: Texture shape %s not loaded because associated texture (%s) not found or invalid."), hGroup.GetFullName().getData(), texname4shape.getData());
        continue;
      }
      let shape = new $.C4TextureShape().init();
      let scaler_zoom = 4;
      if (!shape.Load(hGroup, P(texname, 0), base_tex.Surface32.Wdt / scaler_zoom | 0, base_tex.Surface32.Hgt / scaler_zoom | 0)) {
        $.LogF(S("Error loading texture shape %s."), hGroup.GetFullName().getData());
        continue;
      }
      base_tex.SetMaterialShape(($t1 = shape, shape = null, $t1));
    }
    return texnum;
  }

  HasTextures(hGroup) {
    return hGroup.EntryCount(S("*.png")) !== 0 || hGroup.EntryCount(S("*.bmp")) !== 0;
  }

  GetTexture$i32(iIndex) {
    let pTexture = null;
    let cindex = 0;
    for (pTexture = this.FirstTexture, cindex = 0; pTexture != null; pTexture = pTexture.Next, cindex = cindex + 1 | 0) {
      if (cindex === iIndex) {
        return pTexture.Name.getData();
      }
    }
    return null;
  }

  MoveIndex(byOldIndex, byNewIndex) {
    if (byNewIndex === byOldIndex) {
      return;
    }
    this.Entry[byNewIndex].$assign(this.Entry[byOldIndex]);
    this.Entry[byOldIndex].Clear();
    let old_entry = std_find_if($begin(this.Order), $end(this.Order), ((entry) => {
  return entry === byOldIndex;
}));
    if (!old_entry.eq($end(this.Order))) {
      old_entry.v = byNewIndex;
    }
    this.fEntriesAdded = true;
  }

  GetIndex(szMaterial, szTexture, fAddIfNotExist = true, szErrorIfFailed = null) {
    let byIndex = 0;
    for (byIndex = 1; byIndex < 255; byIndex = byIndex + 1 & 0xff) {
      if (!this.Entry[byIndex].isNull()) {
        if ($.SEqualNoCase(this.Entry[byIndex].GetMaterialName(), szMaterial)) {
          if (szTexture == null || $.SEqualNoCase(this.Entry[byIndex].GetTextureName(), szTexture)) {
            return byIndex;
          }
        }
      }
    }
    if (fAddIfNotExist) {
      for (byIndex = 1; byIndex < 255; byIndex = byIndex + 1 & 0xff) {
        if (this.Entry[byIndex].isNull()) {
          if (this.AddEntry(byIndex, szMaterial, szTexture)) {
            this.fEntriesAdded = true;
            return byIndex;
          }
          if (szErrorIfFailed != null) {
            $.DebugLogF(S("Error getting MatTex %s-%s for %s from TextureMap: Init failed."), szMaterial, szTexture, szErrorIfFailed);
          }
          return 0;
        }
      }
    }
    if (szErrorIfFailed != null) {
      $.DebugLogF(S("Error getting MatTex %s-%s for %s from TextureMap: %s."), szMaterial, szTexture, szErrorIfFailed, fAddIfNotExist ? S("Map is full!") : S("Entry not found."));
    }
    return 0;
  }

  GetIndexMatTex(szMaterialTexture, szDefaultTexture = null, fAddIfNotExist = true, szErrorIfFailed = null) {
    let Material = new $.StdStrBuf();
    let Texture = new $.StdStrBuf();
    Material.CopyUntil(szMaterialTexture, 45);
    Texture.Copy$pi8($.SSearch(szMaterialTexture, S("-")));
    let iMatTex = 0;
    if (Texture.getData() != null) {
      if ((iMatTex = this.GetIndex(Material.getData(), Texture.getData(), fAddIfNotExist)) !== 0) {
        return iMatTex;
      }
    }
    if (szDefaultTexture != null) {
      if ((iMatTex = this.GetIndex(Material.getData(), szDefaultTexture, fAddIfNotExist)) !== 0) {
        return iMatTex;
      }
    }
    let iMaterial = $.MaterialMap.Get(szMaterialTexture);
    if (!$.MatValid(iMaterial | 0)) {
      if (szErrorIfFailed != null) {
        $.DebugLogF(S("Error getting MatTex for %s: Invalid material"), szErrorIfFailed);
      }
      return 0;
    }
    return $oidx($.MaterialMap.Map, iMaterial).DefaultMatTex;
  }

  GetTexture$pi8(szTexture) {
    let pTexture = null;
    for (pTexture = this.FirstTexture; pTexture != null; pTexture = pTexture.Next) {
      if ($.SEqualNoCase(pTexture.Name.getData(), szTexture)) {
        return pTexture;
      }
    }
    return null;
  }

  CheckTexture(szTexture) {
    let pTexture = null;
    for (pTexture = this.FirstTexture; pTexture != null; pTexture = pTexture.Next) {
      if ($.SEqualNoCase(pTexture.Name.getData(), szTexture)) {
        return true;
      }
    }
    return false;
  }

  AddEntry(byIndex, szMaterial, szTexture) {
    if (byIndex <= 0 || byIndex >= 255) {
      return false;
    }
    this.Entry[byIndex].Create(szMaterial, szTexture);
    if (this.fInitialized) {
      if (!this.Entry[byIndex].Init()) {
        this.Entry[byIndex].Clear();
        return false;
      }
      $.Landscape.HandleTexMapUpdate();
    }
    this.Order.push(byIndex);
    return true;
  }

  AddTexture(szTexture, sfcSurface) {
    let pTexture = null;
    if (!((pTexture = new C4Texture().init()) != null)) {
      return false;
    }
    pTexture.Name.Copy$pi8(szTexture);
    pTexture.Surface32 = sfcSurface;
    pTexture.Next = this.FirstTexture;
    this.FirstTexture = pTexture;
    if (sfcSurface != null) {
      sfcSurface.Lock();
      const avg_c = new Uint32Array([0, 0, 0, 0]);
      for (let y = 0; y < sfcSurface.Hgt; y = y + 1 | 0) {
        for (let x = 0; x < sfcSurface.Wdt; x = x + 1 | 0) {
          let c = sfcSurface.GetPixDw(x, y, false);
          avg_c[0] = avg_c[0] + ((c & 255) >>> 0) >>> 0;
          avg_c[1] = avg_c[1] + ((c >>> 8 & 255) >>> 0) >>> 0;
          avg_c[2] = avg_c[2] + ((c >>> 16 & 255) >>> 0) >>> 0;
          avg_c[3] = avg_c[3] + ((c >>> 24 & 255) >>> 0) >>> 0;
        }
      }
      sfcSurface.Unlock();
      let Size = Math.imul(sfcSurface.Wdt, sfcSurface.Hgt);
      avg_c[0] = ftou32(avg_c[0] / Size + 0.5);
      avg_c[1] = ftou32(avg_c[1] / Size + 0.5);
      avg_c[2] = ftou32(avg_c[2] / Size + 0.5);
      avg_c[3] = ftou32(avg_c[3] / Size + 0.5);
      pTexture.SetAverageColor((((avg_c[0] | (avg_c[1] << 8) >>> 0) >>> 0 | (avg_c[2] << 16) >>> 0) >>> 0 | (avg_c[3] << 24) >>> 0) >>> 0);
    } else {
      pTexture.SetAverageColor(0);
    }
    return true;
  }

  GetTextureIndex(szName) {
    let pTexture = null;
    let i = 0;
    for (pTexture = this.FirstTexture; pTexture != null; pTexture = pTexture.Next, i = i + 1 | 0) {
      if ($.SEqualNoCase(pTexture.Name.getData(), szName)) {
        return i;
      }
    }
    return -1;
  }

  DefaultBkgMatTex(fg) {
    let iTex = $.PixCol2Tex(fg);
    if (iTex === 0) {
      return fg;
    }
    let pTex = this.GetEntry(iTex);
    if (pTex == null || !(pTex.GetMaterial() != null)) {
      return fg;
    }
    if ($.DensitySemiSolid(pTex.GetMaterial().Density)) {
      return $.Mat2PixColDefault($.MTunnel);
    }
    return fg;
  }

  $clone() { return new C4TextureMap().$assign(this); }
  $assign(o) {
    this.Entry = $own(o.Entry.map(($e0) => $e0.$clone()));
    this.Order = o.Order.slice();
    this.FirstTexture = o.FirstTexture;
    this.fOverloadMaterials = o.fOverloadMaterials;
    this.fOverloadTextures = o.fOverloadTextures;
    this.fInitialized = o.fInitialized;
    this.fEntriesAdded = o.fEntriesAdded;
    return this;
  }
}


export function $init(): void {
  $.TextureMap = new C4TextureMap(); $.TextureMap.init();
}

Object.assign($, { C4TexMapEntry, C4Texture, C4TextureMap });
