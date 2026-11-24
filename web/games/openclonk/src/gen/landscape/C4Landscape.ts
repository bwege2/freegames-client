// @ts-nocheck
// OpenClonk 36de799: src/landscape/C4Landscape.cpp, src/landscape/C4Landscape.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $u64n, ftoi32, u64 } from '../../rt/int.ts';
import { Random } from '../../rt/native.ts';
import { $bytesView, $oadd, $oarr, $oat, $oidx, $padd, $rd, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $begin, $delete, $end, $max, $min, $reserve, resize, seq_assign, std_fill } from '../../rt/std.ts';

export class C4Landscape {
  static Transparent;
  p = null;

  init() {
    this.p = new C4Landscape$P_landscape_C4Landscape().None();
    C4Landscape.prototype.Default.call(this);
    return this;
  }

  $dtor() {
    C4Landscape.prototype.Clear.call(this);
  }

  Default() {
    this.p = new C4Landscape$P_landscape_C4Landscape().None();
  }

  Clear(fClearMapCreator = true, fClearSky = true, fClearRenderer = true) {
    let $t1;
    if (fClearMapCreator) {
      this.p.pMapCreator = null;
    }
    if (fClearSky) {
      this.p.Sky.Clear();
    }
    if (fClearRenderer) {
      this.p.pLandscapeRender = null;
    }
    this.p.TopRowPix.length = 0;
    this.p.BottomRowPix.length = 0;
    this.p.LeftColPix.length = 0;
    this.p.RightColPix.length = 0;
    this.p.Surface8 = null;
    this.p.Surface8Bkg = null;
    this.p.Map = null;
    this.p.MapBkg = null;
    this.p.pInitial = null;
    this.p.pInitialBkg = null;
    this.p.pFoW = null;
    for (const relight of this.p.Relights) {
      $.C4Rect.prototype.Default.call(relight);
    }
    this.p.ScanX = 0;
    this.p.mode = 0 /*Undefined*/;
    this.p.PixCnt.length = 0;
    this.p.PixCntPitch = 0;
    $t1 = this.p.BridgeMatConversion;
    for (let $i1 = 0; $i1 < $t1.length; $i1++) {
      const conv = P($t1, $i1);
      conv.a[conv.o] = null;
    }
  }

  Execute() {
    if (!this.p.NoScan) {
      this.p.ExecuteScan(this);
    }
    this.p.Sky.Execute();
    if ($.Game.iTick35 === 0) {
      this.DoRelights();
    }
  }

  Synchronize() {
    this.p.ScanX = 0;
  }

  Draw(cgo, pLight = null) {
    let clrMod = 0xffffffff;
    if (this.p.Modulation !== 0) {
      $.pDraw.ActivateBlitModulation(this.p.Modulation);
      clrMod = this.p.Modulation;
    }
    if ($.GraphicsSystem.Show8BitSurface === 1) {
      $.pDraw.Blit8Fast(this.p.Surface8, ftoi32(cgo.TargetX), ftoi32(cgo.TargetY), cgo.Surface, ftoi32(cgo.X), ftoi32(cgo.Y), ftoi32(cgo.Wdt), ftoi32(cgo.Hgt));
    } else if ($.GraphicsSystem.Show8BitSurface === 2) {
      $.pDraw.Blit8Fast(this.p.Surface8Bkg, ftoi32(cgo.TargetX), ftoi32(cgo.TargetY), cgo.Surface, ftoi32(cgo.X), ftoi32(cgo.Y), ftoi32(cgo.Wdt), ftoi32(cgo.Hgt));
    } else if (this.p.pLandscapeRender != null) {
      this.DoRelights();
      this.p.pLandscapeRender.Draw(cgo, pLight, clrMod);
    }
    if (this.p.Modulation !== 0) {
      $.pDraw.DeactivateBlitModulation();
    }
  }

  ScenarioInit() {
    this.p.Gravity.$assign($.C4REAL100($.Game.C4S.Landscape.Gravity.Evaluate()).op_mul$C4Fixed($.DefaultGravAccel));
  }

  DrawMaterialRect(mat, tx, ty, wdt, hgt) {
    let cx = 0;
    let cy = 0;
    for (cy = ty; cy < (ty + hgt | 0); cy = cy + 1 | 0) {
      for (cx = tx; cx < (tx + wdt | 0); cx = cx + 1 | 0) {
        if ($.MatDensity(mat) >= this.GetDensity(cx, cy)) {
          this.SetPix2(cx, cy, $.Mat2PixColDefault(mat), this.p.Surface8Bkg.GetPix(cx, cy));
        }
      }
    }
  }

  RaiseTerrain(tx, ty, wdt) {
    let cx = 0;
    let cy = 0;
    let cpix = 0;
    for (cx = tx; cx < (tx + wdt | 0); cx = cx + 1 | 0) {
      for (cy = ty; (cy + 1 | 0) < $.Landscape.GetHeight() && !GBackSolid(cx, cy + 1 | 0); cy = cy + 1 | 0) {
      }
      if ((cy + 1 | 0) < $.Landscape.GetHeight()) {
        if ((cy - ty | 0) < 20) {
          cpix = this.GetPix(cx, cy + 1 | 0);
          if (!$.MatVehicle(PixCol2Mat(cpix))) {
            while (cy >= ty) {
              this.SetPix2(cx, cy, cpix, this.GetBackPix(cx, cy + 1 | 0));
              cy = cy - 1 | 0;
            }
          }
        }
      }
    }
  }

  FindMatTop(mat, x, y, distant_first) {
    let mslide = 0;
    let cslide = 0;
    let tslide = 0;
    let distant_x = 0;
    let fLeft = false;
    let fRight = false;
    if (!$.MatValid(mat)) {
      return;
    }
    mslide = $oidx($.MaterialMap.Map, mat).MaxSlide;
    do {
      while (this.GetMat(x.a[x.o], y.a[y.o] - 1 | 0) === mat) {
        y.a[y.o] = y.a[y.o] - 1 | 0;
      }
      fLeft = true;
      fRight = true;
      tslide = 0;
      distant_x = x.a[x.o];
      for (cslide = 1; cslide <= mslide && (fLeft || fRight); cslide = cslide + 1 | 0) {
        if (fLeft) {
          if (this.GetMat(x.a[x.o] - cslide | 0, y.a[y.o]) !== mat) {
            fLeft = false;
          } else {
            distant_x = x.a[x.o] - cslide | 0;
            if (this.GetMat(distant_x, y.a[y.o] - 1 | 0) === mat) {
              tslide = -cslide | 0;
              break;
            }
          }
        }
        if (fRight) {
          if (this.GetMat(x.a[x.o] + cslide | 0, y.a[y.o]) !== mat) {
            fRight = false;
          } else {
            distant_x = x.a[x.o] + cslide | 0;
            if (this.GetMat(distant_x, y.a[y.o] - 1 | 0) === mat) {
              tslide = cslide;
              break;
            }
          }
        }
      }
      if (tslide !== 0) {
        x.a[x.o] = x.a[x.o] + tslide | 0;
        y.a[y.o] = y.a[y.o] - 1 | 0;
      }
    } while (tslide !== 0);
    if (distant_first) {
      x.a[x.o] = distant_x;
    }
  }

  GetMapIndex(iX, iY) {
    if (this.p.Map == null) {
      return 0;
    }
    return this.p.Map.GetPix(iX, iY);
  }

  GetBackMapIndex(iX, iY) {
    if (this.p.MapBkg == null) {
      return 0;
    }
    return this.p.MapBkg.GetPix(iX, iY);
  }

  Load(hGroup, fLoadSky, fSavegame) {
    0;
    if ((this.p.Surface8 = GroupReadSurface8(hGroup, S("Landscape.bmp"))) == null) {
      if ((this.p.Surface8 = GroupReadSurface8(hGroup, S("LandscapeFg.bmp"))) == null) {
        return false;
      }
      this.p.Surface8Bkg = GroupReadSurface8(hGroup, S("LandscapeBg.bmp"));
      if (this.p.Surface8Bkg != null) {
        if (this.p.Surface8.Wdt !== this.p.Surface8Bkg.Wdt || this.p.Surface8.Hgt !== this.p.Surface8Bkg.Hgt) {
          $.LogFatal($.FormatString(S("Landscape has different dimensions than background landscape (%dx%d vs. %dx%d)"), this.p.Surface8.Wdt, this.p.Surface8.Hgt, this.p.Surface8Bkg.Wdt, this.p.Surface8Bkg.Hgt).getData());
          return false;
        }
      } else {
        this.p.Surface8Bkg = this.p.CreateDefaultBkgSurface(this.p.Surface8, false);
      }
    } else {
      this.p.Surface8Bkg = this.p.CreateDefaultBkgSurface(this.p.Surface8, true);
    }
    const iWidth = [0];
    const iHeight = [0];
    this.p.Surface8.GetSurfaceSize(P(iWidth, 0), P(iHeight, 0));
    this.p.Width = iWidth[0];
    this.p.Height = iHeight[0];
    if (!this.p.Mat2Pal()) {
      return false;
    }
    for (let y = 0; y < this.GetHeight(); y = y + 1 | 0) {
      for (let x = 0; x < this.GetWidth(); x = x + 1 | 0) {
        let byPix = this.p.Surface8._GetPix(x, y);
        let iMat = PixCol2Mat(byPix);
        if (byPix !== 0 && !$.MatValid(iMat)) {
          $.LogFatal($.FormatString(S("Landscape loading error at (%d/%d): Pixel value %d not a valid material!"), x, y, byPix).getData());
          return false;
        }
        let byPixBkg = this.p.Surface8Bkg._GetPix(x, y);
        let iMatBkg = PixCol2Mat(byPixBkg);
        if (byPixBkg !== 0 && !$.MatValid(iMatBkg)) {
          $.LogFatal($.FormatString(S("Background Landscape loading error at (%d/%d): Pixel value %d not a valid material!"), x, y, byPixBkg).getData());
          return false;
        }
      }
    }
    if (fLoadSky) {
      $.Game.SetInitProgress(Math.fround(70));
      if (this.p.Sky.Init(fSavegame)) {
        return false;
      }
    }
    return true;
  }

  Save(hGroup) {
    $.C4SolidMask.RemoveSolidMasks();
    let r = this.p.SaveInternal(this, hGroup);
    $.C4SolidMask.PutSolidMasks();
    return r;
  }

  SaveDiff(hGroup, fSyncSave) {
    $.C4SolidMask.RemoveSolidMasks();
    let r = this.p.SaveDiffInternal(this, hGroup, fSyncSave);
    $.C4SolidMask.PutSolidMasks();
    return r;
  }

  SaveMap(hGroup) {
    if (this.p.Map == null) {
      return false;
    }
    0;
    let Palette = new $.CStdPalette();
    $.TextureMap.StoreMapPalette(Palette, $.MaterialMap);
    if (!this.p.Map.Save($.Config.AtTempPath(S("~MapFg.tmp")), Palette)) {
      return false;
    }
    if (!hGroup.Move($.Config.AtTempPath(S("~MapFg.tmp")), S("MapFg.bmp"))) {
      return false;
    }
    if (!this.p.MapBkg.Save($.Config.AtTempPath(S("~MapBg.tmp")), Palette)) {
      return false;
    }
    if (!hGroup.Move($.Config.AtTempPath(S("~MapBg.tmp")), S("MapBg.bmp"))) {
      return false;
    }
    return true;
  }

  SaveInitial() {
    this.p.pInitial = P(new Uint8Array($u64n(Math.imul(this.GetWidth(), this.GetHeight()))), 0);
    this.p.pInitialBkg = P(new Uint8Array($u64n(Math.imul(this.GetWidth(), this.GetHeight()))), 0);
    for (let y = 0; y < this.GetHeight(); y = y + 1 | 0) {
      let pitch = Math.imul(y, this.GetWidth());
      for (let x = 0; x < this.GetWidth(); x = x + 1 | 0) {
        this.p.pInitial[$u64n(pitch + x | 0)] = this.p.Surface8._GetPix(x, y);
        this.p.pInitialBkg[$u64n(pitch + x | 0)] = this.p.Surface8Bkg._GetPix(x, y);
      }
    }
    return true;
  }

  SaveTextures(hGroup) {
    if ($.TextureMap.fEntriesAdded) {
      let pMatGroup = new $.C4Group().init();
      let fSuccess = false;
      if (!hGroup.FindEntry$pi8$pStdStrBuf$pu64(S("Material.ocg"))) {
        $.EraseItem($.Config.AtTempPath(S("Material.ocg")));
        if (pMatGroup.Open($.Config.AtTempPath(S("Material.ocg")), true)) {
          if ($.TextureMap.SaveMap(pMatGroup, S("TexMap.txt"))) {
            if (pMatGroup.Close$v()) {
              if (hGroup.Move($.Config.AtTempPath(S("Material.ocg")), S("Material.ocg"))) {
                fSuccess = true;
              }
            }
          }
        }
      } else if (pMatGroup.OpenAsChild(hGroup, S("Material.ocg"))) {
        fSuccess = $.TextureMap.SaveMap(pMatGroup, S("TexMap.txt"));
      }
      if (pMatGroup.IsOpen()) {
        pMatGroup.Close$v();
      }
      $delete(pMatGroup);
      if (!fSuccess) {
        return false;
      }
    }
    return true;
  }

  Init(hGroup, fOverloadCurrent, fLoadSky, rfLoaded, fSavegame) {
    if (this.p.MapSeed === 0) {
      this.p.MapSeed = Random(0x2fd104) | 0;
    }
    $.Game.C4S.Landscape.MapWdt.Max = 10000;
    $.Game.C4S.Landscape.MapHgt.Max = 10000;
    let DBGRECOFF = new $.C4DebugRecOff().init$b(!!$.Game.C4S.Landscape.ExactLandscape);
    try {
      $.Game.FixRandom(u64(BigInt($.Game.RandomSeed)));
      this.p.fMapChanged = fOverloadCurrent;
      let fLandscapeModeSet = this.p.mode !== 0 /*Undefined*/;
      this.UpdatePixMaps();
      $.Game.SetInitProgress(Math.fround(60));
      if (!$.Game.C4S.Landscape.ExactLandscape) {
        const sfcMap = [null];
        const sfcMapBkg = [null];
        if ((sfcMap[0] = GroupReadSurface8(hGroup, S("Map.bmp"))) != null) {
          if (!fLandscapeModeSet) {
            this.p.mode = 2 /*Static*/;
          }
          sfcMapBkg[0] = this.p.CreateDefaultBkgSurface(sfcMap[0], true);
          if (sfcMapBkg[0] == null) {
            return false;
          }
        }
        if (sfcMap[0] == null) {
          if ((sfcMap[0] = GroupReadSurface8(hGroup, S("MapFg.bmp"))) != null) {
            if (!fLandscapeModeSet) {
              this.p.mode = 2 /*Static*/;
            }
            sfcMapBkg[0] = GroupReadSurface8(hGroup, S("MapBg.bmp"));
            if (sfcMapBkg[0] == null) {
              sfcMapBkg[0] = this.p.CreateDefaultBkgSurface(sfcMap[0], false);
            }
            if (sfcMapBkg[0] == null) {
              return false;
            }
          }
        }
        const rendered_map = [null];
        const rendered_bkg = [null];
        if (sfcMap[0] == null) {
          if (this.p.CreateMapS2(hGroup, P(rendered_map, 0), P(rendered_bkg, 0))) {
            sfcMap[0] = rendered_map[0];
            sfcMapBkg[0] = rendered_bkg[0];
            if (!fLandscapeModeSet) {
              this.p.mode = 1 /*Dynamic*/;
            }
          }
        }
        if ($.MapScript.InitializeMap($.Game.C4S.Landscape, $.TextureMap, $.MaterialMap, $.Game.StartupPlayerCount >>> 0, P(sfcMap, 0), P(sfcMapBkg, 0))) {
          if (!fLandscapeModeSet) {
            this.p.mode = 1 /*Dynamic*/;
          }
        }
        if (sfcMap[0] == null && !fOverloadCurrent) {
          if (this.p.CreateMap(P(rendered_map, 0), P(rendered_bkg, 0))) {
            sfcMap[0] = rendered_map[0];
            sfcMapBkg[0] = rendered_bkg[0];
            if (!fLandscapeModeSet) {
              this.p.mode = 2 /*Static*/;
            }
          }
        }
        if (sfcMap[0] == null) {
          if (!fOverloadCurrent) {
            return false;
          }
          if (fLoadSky) {
            if (!this.p.Sky.Init(fSavegame)) {
              return false;
            }
          }
          return true;
        }
        0;
        if ($.Config.General.DebugRec !== 0) {
          $.AddDbgRec(130 /*RCT_Block*/, S("|---MAP---|"), 12);
          $.AddDbgRec(145 /*RCT_Map*/, sfcMap[0].Bits, Math.imul(sfcMap[0].Pitch, sfcMap[0].Hgt));
        }
        const iWdt = [0];
        const iHgt = [0];
        sfcMap[0].GetSurfaceSize(P(iWdt, 0), P(iHgt, 0));
        this.p.MapWidth = iWdt[0];
        this.p.MapHeight = iHgt[0];
        this.p.MapZoom = $.Game.C4S.Landscape.MapZoom.Evaluate();
        this.p.Width = Math.imul(this.p.MapZoom, this.p.MapWidth);
        this.p.Height = Math.imul(this.p.MapZoom, this.p.MapHeight);
        this.p.Width = $max(this.p.Width, 100);
        this.p.Height = $max(this.p.Height, 100);
        if (fOverloadCurrent) {
          this.Clear(!$.Game.C4S.Landscape.KeepMapCreator, fLoadSky, false);
        }
        0;
        0;
        (this.p.Map = sfcMap[0], sfcMap[0] = null);
        (this.p.MapBkg = sfcMapBkg[0], sfcMapBkg[0] = null);
        if (fLoadSky) {
          $.Game.SetInitProgress(Math.fround(70));
          if (!this.p.Sky.Init(fSavegame)) {
            return false;
          }
        }
      } else {
        let DBGRECOFF$2 = new $.C4DebugRecOff().init$v();
        try {
          if (fOverloadCurrent) {
            this.Clear(!$.Game.C4S.Landscape.KeepMapCreator, fLoadSky, false);
          }
          if (!fLandscapeModeSet) {
            this.p.mode = 3 /*Exact*/;
          }
          rfLoaded.a[rfLoaded.o] = true;
          if (!this.Load(hGroup, fLoadSky, fSavegame)) {
            return false;
          }
        } finally { DBGRECOFF$2 && DBGRECOFF$2.$dtor(); }
      }
      $.Game.SetInitProgress(Math.fround(75));
      this.p.NoScan = ($.Game.C4S.Landscape.NoScan ? 1 : 0) !== 0;
      this.p.ScanSpeed = $.Clamp$i32$i32$i32(this.GetWidth() / 500 | 0, 2, 15);
      let PixCntWidth = (this.GetWidth() + 16 | 0) / 17 | 0;
      this.p.PixCntPitch = (this.GetHeight() + 14 | 0) / 15 | 0;
      resize(this.p.PixCnt, $u64n(Math.imul(PixCntWidth, this.p.PixCntPitch)), () => 0);
      if (!$.Game.C4S.Landscape.ExactLandscape) {
        0;
        0;
        {
          let sf8 = new $.CSurface8().init$v();
          let sfb8 = new $.CSurface8().init$v();
          if (!sf8.Create(this.GetWidth(), this.GetHeight()) || !sfb8.Create(this.GetWidth(), this.GetHeight())) {
            return false;
          }
          (this.p.Surface8 = sf8, sf8 = null);
          (this.p.Surface8Bkg = sfb8, sfb8 = null);
          if (!this.p.Mat2Pal()) {
            return false;
          }
        }
        let lsrender_backup = null;
        [lsrender_backup, this.p.pLandscapeRender] = [this.p.pLandscapeRender, lsrender_backup];
        let map2landscape_success = this.MapToLandscape();
        [lsrender_backup, this.p.pLandscapeRender] = [this.p.pLandscapeRender, lsrender_backup];
        if (!map2landscape_success) {
          return false;
        }
      }
      this.p.InitBorderPix();
      $.Game.SetInitProgress(Math.fround(80));
      if ($.Config.General.DebugRec !== 0) {
        $.AddDbgRec(130 /*RCT_Block*/, S("|---LANDSCAPE---|"), 18);
        $.AddDbgRec(145 /*RCT_Map*/, this.p.Surface8.Bits, Math.imul(this.p.Surface8.Pitch, this.p.Surface8.Hgt));
        $.AddDbgRec(130 /*RCT_Block*/, S("|---LANDSCAPE BKG---|"), 22);
        $.AddDbgRec(145 /*RCT_Map*/, this.p.Surface8Bkg.Bits, Math.imul(this.p.Surface8Bkg.Pitch, this.p.Surface8Bkg.Hgt));
      }
      0;
      if ($.Game.C4S.Game.FoWEnabled) {
        this.p.pFoW = new $.C4FoW().init();
      }
      if (this.p.pLandscapeRender == null) {
        this.p.pLandscapeRender = new $.C4LandscapeRenderGL().init();
      }
      if (this.p.pLandscapeRender != null) {
        if (fOverloadCurrent) {
          if (!this.p.pLandscapeRender.ReInit(this.GetWidth(), this.GetHeight())) {
            return false;
          }
        } else {
          if (!this.p.pLandscapeRender.Init(this.GetWidth(), this.GetHeight(), $.TextureMap, $.GraphicsResource.Files)) {
            return false;
          }
        }
      }
      if (!this.SaveInitial()) {
        return false;
      }
      this.ApplyDiff(hGroup);
      this.p.UpdatePixCnt(this, new $.C4Rect().init$i32$i32$i32$i32(0, 0, this.GetWidth(), this.GetHeight()));
      this.p.ClearMatCount();
      this.p.UpdateMatCnt(this, new $.C4Rect().init$i32$i32$i32$i32(0, 0, this.GetWidth(), this.GetHeight()), true);
      if (this.p.pLandscapeRender != null) {
        this.p.pLandscapeRender.Update(new $.C4Rect().init$i32$i32$i32$i32(0, 0, this.GetWidth(), this.GetHeight()), this);
      }
      $.Game.SetInitProgress(Math.fround(87));
      $.Game.FixRandom(u64(BigInt($.Game.RandomSeed)));
      if (this.p.pFoW != null) {
        this.p.pFoW.Ambient.CreateFromLandscape(this, 10, 50, 0.25);
      }
      $.Game.SetInitProgress(Math.fround(84));
      rfLoaded.a[rfLoaded.o] = true;
      return true;
    } finally { DBGRECOFF && DBGRECOFF.$dtor(); }
  }

  HasMap() {
    return this.p.Map != null && this.p.MapBkg != null;
  }

  MapToLandscape() {
    return this.p.MapToLandscape(this, this.p.Map, this.p.MapBkg, 0, 0, this.p.MapWidth, this.p.MapHeight);
  }

  ApplyDiff(hGroup) {
    let pDiff = null;
    let pDiffBkg = null;
    pDiff = GroupReadSurface8(hGroup, S("DiffLandscape.bmp"));
    pDiffBkg = GroupReadSurface8(hGroup, S("DiffLandscapeBkg.bmp"));
    if (pDiff == null && pDiffBkg == null) {
      return false;
    }
    let byPix = 0;
    for (let y = 0; y < this.GetHeight(); y = y + 1 | 0) {
      for (let x = 0; x < this.GetWidth(); x = x + 1 | 0) {
        if (pDiff != null && pDiff.GetPix(x, y) !== 255) {
          if (this.p.Surface8._GetPix(x, y) !== (byPix = pDiff._GetPix(x, y))) {
            this.p.Surface8.SetPix(x, y, byPix);
          }
        }
        if (pDiffBkg != null && pDiffBkg.GetPix(x, y) !== 255) {
          if (this.p.Surface8Bkg._GetPix(x, y) !== (byPix = pDiffBkg._GetPix(x, y))) {
            this.p.Surface8Bkg._SetPix(x, y, byPix);
          }
        }
      }
    }
    return true;
  }

  SetMode(mode) {
    this.p.mode = mode;
  }

  GetMode() {
    return this.p.mode;
  }

  SetPix2(x, y, fgPix, bgPix) {
    if (x < 0 || y < 0 || x >= this.GetWidth() || y >= this.GetHeight()) {
      return false;
    }
    if ((fgPix === 255 || fgPix === this._GetPix(x, y)) && (bgPix === 255 || bgPix === this.p.Surface8Bkg._GetPix(x, y))) {
      return true;
    }
    return this._SetPix2(x, y, fgPix, bgPix);
  }

  _SetPix2(x, y, fgPix, bgPix) {
    let $t1, $t2;
    if ($.Config.General.DebugRec !== 0) {
      let rc = new $.C4RCSetPix();
      rc.x = x;
      rc.y = y;
      rc.clr = fgPix;
      rc.bgClr = fgPix;
      $.AddDbgRec(131 /*RCT_SetPix*/, $bytesView(rc, [["x", 0, "i32", 0], ["y", 4, "i32", 0], ["clr", 8, "u8", 0], ["bgClr", 9, "u8", 0]], 10), 10);
    }
    0;
    let opix = this._GetPix(x, y);
    if (fgPix === 255) {
      fgPix = opix;
    }
    if (bgPix === 255) {
      bgPix = this.p.Surface8Bkg._GetPix(x, y);
    }
    if (fgPix === opix && bgPix === this.p.Surface8Bkg._GetPix(x, y)) {
      return true;
    }
    if (this.p.Pix2Dens[fgPix] !== 0) {
      if (this.p.Pix2Dens[opix] === 0) {
        this.p.PixCnt[$u64n((y / 15 | 0) + Math.imul(x / 17 | 0, this.p.PixCntPitch) | 0)] = this.p.PixCnt[$u64n((y / 15 | 0) + Math.imul(x / 17 | 0, this.p.PixCntPitch) | 0)] + 1 & 0xff;
      }
    } else {
      if (this.p.Pix2Dens[opix] !== 0) {
        this.p.PixCnt[$u64n((y / 15 | 0) + Math.imul(x / 17 | 0, this.p.PixCntPitch) | 0)] = this.p.PixCnt[$u64n((y / 15 | 0) + Math.imul(x / 17 | 0, this.p.PixCntPitch) | 0)] - 1 & 0xff;
      }
    }
    0;
    let omat = this.p.Pix2Mat[opix];
    let nmat = this.p.Pix2Mat[fgPix];
    if (opix !== 0) {
      this.p.MatCount[$u64n(omat)] = this.p.MatCount[$u64n(omat)] - 1 >>> 0;
    }
    if (fgPix !== 0) {
      this.p.MatCount[$u64n(nmat)] = this.p.MatCount[$u64n(nmat)] + 1 >>> 0;
    }
    if (omat !== nmat) {
      if (fgPix !== 0 && $oidx($.MaterialMap.Map, nmat).MinHeightCount !== 0) {
        let iMinHeight = $oidx($.MaterialMap.Map, nmat).MinHeightCount;
        let iBelow = this.GetMatHeight(x, y + 1 | 0, 1, nmat, iMinHeight);
        let iAbove = this.GetMatHeight(x, y - 1 | 0, -1, nmat, iMinHeight);
        if (((iBelow + iAbove | 0) + 1 | 0) >= iMinHeight) {
          let iChange = 1;
          if (iBelow < iMinHeight) {
            iChange = iChange + iBelow | 0;
          }
          if (iAbove < iMinHeight) {
            iChange = iChange + iAbove | 0;
          }
          ($t1 = P(this.p.EffectiveMatCount, $u64n(nmat)), $t1.a[$t1.o] = $t1.a[$t1.o] + (iChange >>> 0) >>> 0);
        }
      }
      if (opix !== 0 && $oidx($.MaterialMap.Map, omat).MinHeightCount !== 0) {
        let iMinHeight = $oidx($.MaterialMap.Map, omat).MinHeightCount;
        let iBelow = this.GetMatHeight(x, y + 1 | 0, 1, omat, iMinHeight);
        let iAbove = this.GetMatHeight(x, y - 1 | 0, -1, omat, iMinHeight);
        if (((iBelow + iAbove | 0) + 1 | 0) >= iMinHeight) {
          let iChange = 1;
          if (iBelow < iMinHeight) {
            iChange = iChange + iBelow | 0;
          }
          if (iAbove < iMinHeight) {
            iChange = iChange + iAbove | 0;
          }
          ($t2 = P(this.p.EffectiveMatCount, $u64n(omat)), $t2.a[$t2.o] = $t2.a[$t2.o] - (iChange >>> 0) >>> 0);
        }
      }
    }
    this.p.Surface8.SetPix(x, y, fgPix);
    this.p.Surface8Bkg.SetPix(x, y, bgPix);
    if (this.p.pLandscapeRender != null) {
      let CheckRect = this.p.pLandscapeRender.GetAffectedRect(new $.C4Rect().init$i32$i32$i32$i32(x, y, 1, 1));
      for (let i = 0; i < 50; i = i + 1 | 0) {
        if (!(this.p.Relights[$u64n(i)].Wdt !== 0) || this.p.Relights[$u64n(i)].Overlap(CheckRect) || (i + 1 | 0) >= 50) {
          this.p.Relights[$u64n(i)].Add(CheckRect);
          break;
        }
      }
      if (this.p.pFoW != null) {
        this.p.pFoW.Invalidate(CheckRect.$clone());
      }
    }
    return true;
  }

  _SetPix2Tmp(x, y, fgPix, bgPix) {
    0;
    if (fgPix !== 255) {
      this.p.Surface8.SetPix(x, y, fgPix);
    }
    if (bgPix !== 255) {
      this.p.Surface8Bkg.SetPix(x, y, bgPix);
    }
  }

  InsertMaterialOutsideLandscape(tx, ty, mdens) {
    return this.GetDensity(tx, ty) <= mdens;
  }

  InsertMaterial(mat$, tx, ty, vx = 0, vy = 0, query_only = false) {
    const mat = [mat$];
    0;
    0;
    let mdens = 0;
    if (!$.MatValid(mat[0])) {
      return false;
    }
    mdens = $min($.MatDensity(mat[0]), $.C4M_Solid$C4Constants);
    if (mdens === 0) {
      return true;
    }
    if (!$.Inside$i32$i32$i32$3(tx.a[tx.o], 0, this.GetWidth() - 1 | 0) || !$.Inside$i32$i32$i32$3(ty.a[ty.o], 0, this.GetHeight())) {
      return this.InsertMaterialOutsideLandscape(tx.a[tx.o], ty.a[ty.o], mdens);
    }
    if ($.Game.C4S.Game.Realism.LandscapePushPull) {
      if (this.GetDensity(tx.a[tx.o], ty.a[ty.o]) >= mdens) {
        if (!this.FindMatPathPush(tx, ty, mdens, $oidx($.MaterialMap.Map, mat[0]).MaxSlide, !!($oidx($.MaterialMap.Map, mat[0]).Instable !== 0))) {
          return false;
        }
      }
    } else {
      while (mdens === $min(this.GetDensity(tx.a[tx.o], ty.a[ty.o]), $.C4M_Solid$C4Constants)) {
        ty.a[ty.o] = ty.a[ty.o] - 1 | 0;
        if (ty.a[ty.o] < 0) {
          return false;
        }
        if (this.GetDensity(tx.a[tx.o] - 1 | 0, ty.a[ty.o]) < mdens) {
          tx.a[tx.o] = tx.a[tx.o] - 1 | 0;
        }
        if (this.GetDensity(tx.a[tx.o] + 1 | 0, ty.a[ty.o]) < mdens) {
          tx.a[tx.o] = tx.a[tx.o] + 1 | 0;
        }
      }
      if (this.GetDensity(tx.a[tx.o], ty.a[ty.o]) > mdens) {
        return false;
      }
    }
    while (this.FindMatSlide(tx, ty, 1, mdens, $oidx($.MaterialMap.Map, mat[0]).MaxSlide)) {
      if (this.GetDensity(tx.a[tx.o], ty.a[ty.o] + 1 | 0) < mdens) {
        if (!query_only) {
          return $.PXS.Create(mat[0], $.itofix$i32(tx.a[tx.o]), $.itofix$i32(ty.a[ty.o]), $.C4REAL10(vx), $.C4REAL10(vy));
        }
        return true;
      }
    }
    if (query_only) {
      if (!$.Inside$i32$i32$i32$3(tx.a[tx.o], 0, this.GetWidth() - 1 | 0) || !$.Inside$i32$i32$i32$3(ty.a[ty.o], 0, this.GetHeight())) {
        return this.InsertMaterialOutsideLandscape(tx.a[tx.o], ty.a[ty.o], mdens);
      }
      return true;
    }
    let pReact = null;
    let tmat = 0;
    let check_dir = 0;
    for (let i = 0; i < 2; i = i + 1 | 0) {
      if ((pReact = $.MaterialMap.GetReactionUnsafe(mat[0], tmat = this.GetMat(tx.a[tx.o], ty.a[ty.o] + check_dir | 0))) != null) {
        let fvx = $.C4REAL10(vx);
        let fvy = $.C4REAL10(vy);
        if (pReact.pFunc(pReact, tx, ty, tx.a[tx.o], ty.a[ty.o] + check_dir | 0, fvx, fvy, P(mat, 0), tmat, 0 /*meePXSPos*/, null)) {
          return true;
        }
      }
      if (!((check_dir = $.Sign$C4Fixed($.Landscape.GetGravity())) !== 0)) {
        break;
      }
    }
    return this.InsertDeadMaterial(mat[0], tx.a[tx.o], ty.a[ty.o]);
  }

  InsertDeadMaterial(mat, tx$, ty) {
    const tx = [tx$];
    if (tx[0] < 0 || ty < 0 || tx[0] >= this.GetWidth() || ty >= this.GetHeight()) {
      return this.InsertMaterialOutsideLandscape(tx[0], ty, $min($.MatDensity(mat), $.C4M_Solid$C4Constants));
    }
    let omat = 0;
    if ($.Game.C4S.Game.Realism.LandscapeInsertThrust) {
      omat = this.GetMat(tx[0], ty);
    }
    let n = 0;
    let pix = -1;
    if (tx[0] > 0 && this._GetMat(tx[0] - 1 | 0, ty) === mat) {
      if (!(Random((n = n + 1 | 0) >>> 0) !== 0)) {
        pix = this._GetPix(tx[0] - 1 | 0, ty);
      }
    }
    if (ty > 0 && this._GetMat(tx[0], ty - 1 | 0) === mat) {
      if (!(Random((n = n + 1 | 0) >>> 0) !== 0)) {
        pix = this._GetPix(tx[0], ty - 1 | 0);
      }
    }
    if ((tx[0] + 1 | 0) < this.GetWidth() && this._GetMat(tx[0] + 1 | 0, ty) === mat) {
      if (!(Random((n = n + 1 | 0) >>> 0) !== 0)) {
        pix = this._GetPix(tx[0] + 1 | 0, ty);
      }
    }
    if ((ty + 1 | 0) < this.GetHeight() && this._GetMat(tx[0], ty + 1 | 0) === mat) {
      if (!(Random((n = n + 1 | 0) >>> 0) !== 0)) {
        pix = this._GetPix(tx[0], ty + 1 | 0);
      }
    }
    if (pix < 0) {
      pix = $.Mat2PixColDefault(mat);
    }
    this.SetPix2(tx[0], ty, pix & 0xff, 255);
    if ($.Game.C4S.Game.Realism.LandscapeInsertThrust && $.MatValid(omat)) {
      const tyo = [ty - 1 | 0];
      this.InsertMaterial(omat, P(tx, 0), P(tyo, 0));
    }
    return true;
  }

  FindMatPath(fx, fy, ydir, mdens, mslide) {
    0;
    let cslide = 0;
    let fLeft = true;
    let fRight = true;
    if (this.GetDensity(fx.a[fx.o], fy.a[fy.o] + ydir | 0) < mdens) {
      fy.a[fy.o] = fy.a[fy.o] + ydir | 0;
      return true;
    }
    for (cslide = 1; cslide <= mslide && (fLeft || fRight); cslide = cslide + 1 | 0) {
      if (fLeft) {
        if (this.GetDensity(fx.a[fx.o] - cslide | 0, fy.a[fy.o]) >= mdens) {
          fLeft = false;
        } else if (this.GetDensity(fx.a[fx.o] - cslide | 0, fy.a[fy.o] + ydir | 0) < mdens) {
          fx.a[fx.o] = fx.a[fx.o] - 1 | 0;
          return true;
        }
      }
      if (fRight) {
        if (this.GetDensity(fx.a[fx.o] + cslide | 0, fy.a[fy.o]) >= mdens) {
          fRight = false;
        } else if (this.GetDensity(fx.a[fx.o] + cslide | 0, fy.a[fy.o] + ydir | 0) < mdens) {
          fx.a[fx.o] = fx.a[fx.o] + 1 | 0;
          return true;
        }
      }
    }
    return false;
  }

  FindMatSlide(fx, fy, ydir, mdens, mslide) {
    0;
    let cslide = 0;
    let fLeft = true;
    let fRight = true;
    if (this.GetDensity(fx.a[fx.o], fy.a[fy.o] + ydir | 0) < mdens) {
      fy.a[fy.o] = fy.a[fy.o] + ydir | 0;
      return true;
    }
    for (cslide = 1; cslide <= mslide && (fLeft || fRight); cslide = cslide + 1 | 0) {
      if (fLeft) {
        if (this.GetDensity(fx.a[fx.o] - cslide | 0, fy.a[fy.o]) >= mdens && this.GetDensity(fx.a[fx.o] - cslide | 0, fy.a[fy.o] + ydir | 0) >= mdens) {
          fLeft = false;
        } else if (this.GetDensity(fx.a[fx.o] - cslide | 0, fy.a[fy.o] + ydir | 0) < mdens) {
          fx.a[fx.o] = fx.a[fx.o] - cslide | 0;
          fy.a[fy.o] = fy.a[fy.o] + ydir | 0;
          return true;
        }
      }
      if (fRight) {
        if (this.GetDensity(fx.a[fx.o] + cslide | 0, fy.a[fy.o]) >= mdens && this.GetDensity(fx.a[fx.o] + cslide | 0, fy.a[fy.o] + ydir | 0) >= mdens) {
          fRight = false;
        } else if (this.GetDensity(fx.a[fx.o] + cslide | 0, fy.a[fy.o] + ydir | 0) < mdens) {
          fx.a[fx.o] = fx.a[fx.o] + cslide | 0;
          fy.a[fy.o] = fy.a[fy.o] + ydir | 0;
          return true;
        }
      }
    }
    return false;
  }

  FindMatPathPush(fx, fy, mdens, mslide, liquid) {
    fx.a[fx.o] = $.Clamp$i32$i32$i32(fx.a[fx.o], 0, this.GetWidth() - 1 | 0);
    fy.a[fy.o] = $.Clamp$i32$i32$i32(fy.a[fy.o], 0, this.GetHeight() - 1 | 0);
    let iPushRange = 500;
    let left = $max(0, fx.a[fx.o] - 500 | 0);
    let right = $min(this.GetWidth() - 1 | 0, fx.a[fx.o] + 500 | 0);
    let top = $max(0, fy.a[fy.o] - 500 | 0);
    let bottom = $min(this.GetHeight() - 1 | 0, fy.a[fy.o] + 500 | 0);
    let R = 0;
    let D = 1;
    let L = 2;
    let U = 3;
    let dir = 0;
    let x = fx.a[fx.o];
    let y = fy.a[fy.o];
    let dens = this.GetDensity(fx.a[fx.o], fy.a[fy.o]);
    if (dens < mdens) {
      return true;
    } else if (dens === mdens) {
      for (let i = 0; ; i = i + 1 | 0) {
        if (((x - i | 0) - 1 | 0) < left || this.GetDensity((x - i | 0) - 1 | 0, y) !== mdens) {
          x = x - i | 0;
          dir = 2;
          break;
        } else if (((y - i | 0) - 1 | 0) < top || this.GetDensity(x, (y - i | 0) - 1 | 0) !== mdens) {
          y = y - i | 0;
          dir = 3;
          break;
        } else if (((x + i | 0) + 1 | 0) > right || this.GetDensity((x + i | 0) + 1 | 0, y) !== mdens) {
          x = x + i | 0;
          dir = 0;
          break;
        } else if (((y + i | 0) + 1 | 0) > bottom || this.GetDensity(x, (y + i | 0) + 1 | 0) !== mdens) {
          y = y + i | 0;
          dir = 1;
          break;
        }
      }
    } else {
      let i = 1;
      for (; i < 500; i = i + 1 | 0) {
        if (this.GetDensity(x - i | 0, y) <= mdens) {
          x = x - i | 0;
          dir = 0;
          break;
        } else if (this.GetDensity(x, y - i | 0) <= mdens) {
          y = y - i | 0;
          dir = 1;
          break;
        } else if (this.GetDensity(x + i | 0, y) <= mdens) {
          x = x + i | 0;
          dir = 2;
          break;
        } else if (this.GetDensity(x, y + i | 0) <= mdens) {
          y = y + i | 0;
          dir = 3;
          break;
        }
      }
      if (i >= 500) {
        return false;
      }
      if (this.GetDensity(x, y) < mdens) {
        fx.a[fx.o] = x;
        fy.a[fy.o] = y;
        return true;
      }
    }
    let sx = x;
    let sy = y;
    let sdir = dir;
    let fGotBest = false;
    let bx = 0;
    let by = 0;
    let bdist = 0;
    do {
      0;
      let nx = x;
      let ny = y;
      switch (dir) {
        case 0:
          nx = nx + 1 | 0;
          break;
        case 1:
          ny = ny + 1 | 0;
          break;
        case 2:
          nx = nx - 1 | 0;
          break;
        case 3:
          ny = ny - 1 | 0;
          break;
        default:
          0;
      }
      let fInBounds = nx >= left && ny >= top && nx <= right && ny <= bottom;
      let dens$2 = this.GetDensity(nx, ny);
      if (dens$2 < mdens) {
        let dist = $.Abs$i32(nx - fx.a[fx.o] | 0) + Math.imul(mslide, liquid ? fy.a[fy.o] - ny | 0 : $.Abs$i32(fy.a[fy.o] - ny | 0)) | 0;
        if (!fGotBest || dist < bdist) {
          bx = nx;
          by = ny;
          bdist = dist;
          fGotBest = true;
          top = $max(top, (fy.a[fy.o] - (dist / mslide | 0) | 0) - 1 | 0);
          if (!liquid) {
            bottom = $min(bottom, (fy.a[fy.o] + (dist / mslide | 0) | 0) + 1 | 0);
            left = $max(left, (fx.a[fx.o] - dist | 0) - 1 | 0);
            right = $min(right, (fx.a[fx.o] + dist | 0) + 1 | 0);
          }
          sx = x;
          sy = y;
          sdir = dir;
        }
      }
      if (fInBounds && dens$2 === mdens) {
        x = nx;
        y = ny;
        (dir = (dir + 3 | 0) << 24 >> 24, dir = dir % 4 << 24 >> 24);
      } else {
        dir = dir + 1 << 24 >> 24;
        dir = dir % 4 << 24 >> 24;
      }
    } while (x !== sx || y !== sy || dir !== sdir);
    if (!fGotBest) {
      return false;
    }
    fx.a[fx.o] = bx;
    fy.a[fy.o] = by;
    return true;
  }

  Incinerate(x, y, cause_player) {
    let mat = this.GetMat(x, y);
    if ($.MatValid(mat)) {
      if ($oidx($.MaterialMap.Map, mat).Inflammable !== 0) {
        let pars = new $.C4AulParSet().init$mC4Value$mC4Value$mC4Value($.C4VInt(x), $.C4VInt(y), $.C4VInt(cause_player));
        $.ScriptEngine.GetPropList().Call$i32$pC4AulParSet$b(180 /*P_InflameLandscape*/, pars.op_and());
      }
    }
    return false;
  }

  DrawBrush(iX, iY, iGrade, szMaterial, szTexture, szBackMaterial, szBackTexture) {
    const byCol = [0];
    const byColBkg = [0];
    if (!this.p.GetMapColorIndex(szMaterial, szTexture, P(byCol, 0))) {
      return false;
    }
    if (!this.p.GetMapColorIndex(szBackMaterial, szBackTexture, P(byColBkg, 0))) {
      return false;
    }
    let texture = $.TextureMap.GetTexture$pi8(szTexture);
    let shape_wdt = 0;
    let shape_hgt = 0;
    if (texture != null && texture.GetMaterialShape() != null) {
      shape_wdt = texture.GetMaterialShape().GetMaxPolyWidth() / this.p.MapZoom | 0;
      shape_hgt = texture.GetMaterialShape().GetMaxPolyHeight() / this.p.MapZoom | 0;
    }
    switch (this.p.mode) {
      case 1:
        break;
      case 2:
        {
          let iRadius = $max(Math.imul(2, iGrade) / this.p.MapZoom | 0, 1);
          if (iRadius === 1) {
            this.p.Map.SetPix(iX / this.p.MapZoom | 0, iY / this.p.MapZoom | 0, byCol[0]);
            this.p.MapBkg.SetPix(iX / this.p.MapZoom | 0, iY / this.p.MapZoom | 0, byColBkg[0]);
          } else {
            this.p.Map.Circle(iX / this.p.MapZoom | 0, iY / this.p.MapZoom | 0, iRadius, byCol[0]);
            this.p.MapBkg.Circle(iX / this.p.MapZoom | 0, iY / this.p.MapZoom | 0, iRadius, byColBkg[0]);
          }
          this.p.MapToLandscape(this, this.p.Map, this.p.MapBkg, (((iX / this.p.MapZoom | 0) - iRadius | 0) - 1 | 0) - shape_wdt | 0, (((iY / this.p.MapZoom | 0) - iRadius | 0) - 1 | 0) - shape_hgt | 0, (Math.imul(2, iRadius) + 2 | 0) + Math.imul(shape_wdt, 2) | 0, (Math.imul(2, iRadius) + 2 | 0) + Math.imul(shape_hgt, 2) | 0);
          this.SetMapChanged();
        }
        break;
      case 3:
        {
          let BoundingBox = new $.C4Rect().init$i32$i32$i32$i32((iX - iGrade | 0) - 1 | 0, (iY - iGrade | 0) - 1 | 0, Math.imul(iGrade, 2) + 2 | 0, Math.imul(iGrade, 2) + 2 | 0);
          this.p.PrepareChange(this, BoundingBox);
          this.p.Surface8.Circle(iX, iY, iGrade, byCol[0]);
          this.p.Surface8Bkg.Circle(iX, iY, iGrade, byColBkg[0]);
          this.p.FinishChange(this, BoundingBox.$clone());
          break;
        }
      case 0:
        0;
        break;
    }
    return true;
  }

  DrawLine(iX1, iY1, iX2, iY2, iGrade, szMaterial, szTexture, szBackMaterial, szBackTexture) {
    const line_color = [0];
    const line_color_bkg = [0];
    if (!this.p.GetMapColorIndex(szMaterial, szTexture, P(line_color, 0))) {
      return false;
    }
    if (!this.p.GetMapColorIndex(szBackMaterial, szBackTexture, P(line_color_bkg, 0))) {
      return false;
    }
    let texture = $.TextureMap.GetTexture$pi8(szTexture);
    let shape_wdt = 0;
    let shape_hgt = 0;
    if (texture != null && texture.GetMaterialShape() != null) {
      shape_wdt = texture.GetMaterialShape().GetMaxPolyWidth() / this.p.MapZoom | 0;
      shape_hgt = texture.GetMaterialShape().GetMaxPolyHeight() / this.p.MapZoom | 0;
    }
    switch (this.p.mode) {
      case 1:
        break;
      case 2:
        {
          let iRadius = $max(Math.imul(2, iGrade) / this.p.MapZoom | 0, 1);
          iX1 = iX1 / this.p.MapZoom | 0;
          iY1 = iY1 / this.p.MapZoom | 0;
          iX2 = iX2 / this.p.MapZoom | 0;
          iY2 = iY2 / this.p.MapZoom | 0;
          ForLine(iX1, iY1, iX2, iY2, ((x, y) => {
  return this.p.DrawLineMap(x, y, iRadius, line_color[0], line_color_bkg[0]);
}));
          let iUpX = ($min(iX1, iX2) - iRadius | 0) - 1 | 0;
          let iUpY = ($min(iY1, iY2) - iRadius | 0) - 1 | 0;
          let iUpWdt = ($.Abs$i32(iX2 - iX1 | 0) + Math.imul(2, iRadius) | 0) + 2 | 0;
          let iUpHgt = ($.Abs$i32(iY2 - iY1 | 0) + Math.imul(2, iRadius) | 0) + 2 | 0;
          this.p.MapToLandscape(this, this.p.Map, this.p.MapBkg, iUpX - shape_wdt | 0, iUpY - shape_hgt | 0, iUpWdt + Math.imul(shape_wdt, 2) | 0, iUpHgt + Math.imul(shape_hgt, 2) | 0);
          this.SetMapChanged();
        }
        break;
      case 3:
        {
          let BoundingBox = new $.C4Rect().init$i32$i32$i32$i32(iX1 - iGrade | 0, iY1 - iGrade | 0, Math.imul(iGrade, 2) + 1 | 0, Math.imul(iGrade, 2) + 1 | 0);
          BoundingBox.Add(new $.C4Rect().init$i32$i32$i32$i32(iX2 - iGrade | 0, iY2 - iGrade | 0, Math.imul(iGrade, 2) + 1 | 0, Math.imul(iGrade, 2) + 1 | 0));
          this.p.PrepareChange(this, BoundingBox);
          ForLine(iX1, iY1, iX2, iY2, ((x$2, y$2) => {
  return this.p.DrawLineLandscape(x$2, y$2, iGrade, line_color[0], line_color_bkg[0]);
}));
          this.p.FinishChange(this, BoundingBox.$clone());
          break;
        }
      case 0:
        0;
        break;
    }
    return true;
  }

  DrawBox(iX1, iY1, iX2, iY2, _iGrade, szMaterial, szTexture, szBackMaterial, szBackTexture) {
    let iX0 = $min(iX1, iX2);
    let iY0 = $min(iY1, iY2);
    iX2 = $max(iX1, iX2);
    iY2 = $max(iY1, iY2);
    iX1 = iX0;
    iY1 = iY0;
    const byCol = [0];
    const byColBkg = [0];
    if (!this.p.GetMapColorIndex(szMaterial, szTexture, P(byCol, 0))) {
      return false;
    }
    if (!this.p.GetMapColorIndex(szBackMaterial, szBackTexture, P(byColBkg, 0))) {
      return false;
    }
    let texture = $.TextureMap.GetTexture$pi8(szTexture);
    let shape_wdt = 0;
    let shape_hgt = 0;
    if (texture != null && texture.GetMaterialShape() != null) {
      shape_wdt = texture.GetMaterialShape().GetMaxPolyWidth() / this.p.MapZoom | 0;
      shape_hgt = texture.GetMaterialShape().GetMaxPolyHeight() / this.p.MapZoom | 0;
    }
    switch (this.p.mode) {
      case 1:
        break;
      case 2:
        iX1 = iX1 / this.p.MapZoom | 0;
        iY1 = iY1 / this.p.MapZoom | 0;
        iX2 = iX2 / this.p.MapZoom | 0;
        iY2 = iY2 / this.p.MapZoom | 0;
        this.p.Map.Box(iX1, iY1, iX2, iY2, byCol[0]);
        this.p.MapBkg.Box(iX1, iY1, iX2, iY2, byColBkg[0]);
        this.p.MapToLandscape(this, this.p.Map, this.p.MapBkg, (iX1 - 1 | 0) - shape_wdt | 0, (iY1 - 1 | 0) - shape_hgt | 0, ((iX2 - iX1 | 0) + 3 | 0) + Math.imul(shape_wdt, 2) | 0, ((iY2 - iY1 | 0) + 3 | 0) + Math.imul(shape_hgt, 2) | 0);
        this.SetMapChanged();
        break;
      case 3:
        {
          let BoundingBox = new $.C4Rect().init$i32$i32$i32$i32(iX1, iY1, (iX2 - iX1 | 0) + 1 | 0, (iY2 - iY1 | 0) + 1 | 0);
          this.p.PrepareChange(this, BoundingBox);
          this.p.Surface8.Box(iX1, iY1, iX2, iY2, byCol[0]);
          this.p.Surface8Bkg.Box(iX1, iY1, iX2, iY2, byColBkg[0]);
          this.p.FinishChange(this, BoundingBox.$clone());
          break;
        }
      case 0:
        0;
        break;
    }
    return true;
  }

  DrawChunks(tx, ty, wdt, hgt, icntx, icnty, szMaterial, szTexture, bIFT) {
    const byColor = [0];
    if (!this.p.GetMapColorIndex(szMaterial, szTexture, P(byColor, 0))) {
      return false;
    }
    let iMaterial = $.MaterialMap.Get(szMaterial);
    if (!$.MatValid(iMaterial)) {
      return false;
    }
    let shape = $.Game.C4S.Landscape.FlatChunkShapes ? 0 /*C4M_Flat*/ : $oidx($.MaterialMap.Map, iMaterial).MapChunkType;
    let BoundingBox = new $.C4Rect().init$i32$i32$i32$i32(tx - 5 | 0, ty - 5 | 0, wdt + 10 | 0, hgt + 10 | 0);
    this.p.PrepareChange(this, BoundingBox);
    this.p.Surface8.Clip(BoundingBox.x, BoundingBox.y, BoundingBox.x + BoundingBox.Wdt | 0, BoundingBox.y + BoundingBox.Hgt | 0);
    this.p.Surface8Bkg.Clip(BoundingBox.x, BoundingBox.y, BoundingBox.x + BoundingBox.Wdt | 0, BoundingBox.y + BoundingBox.Hgt | 0);
    $.pDraw.NoPrimaryClipper();
    let x = 0;
    let y = 0;
    for (x = 0; x < icntx; x = x + 1 | 0) {
      for (y = 0; y < icnty; y = y + 1 | 0) {
        this.p.DrawChunk(this, tx + (Math.imul(wdt, x) / icntx | 0) | 0, ty + (Math.imul(hgt, y) / icnty | 0) | 0, wdt / icntx | 0, hgt / icnty | 0, byColor[0], (bIFT ? this.p.DefaultBkgMat(byColor[0]) : 0) & 0xff, shape, Random(1000));
      }
    }
    this.p.Surface8.NoClip();
    this.p.Surface8Bkg.NoClip();
    this.p.FinishChange(this, BoundingBox.$clone());
    return true;
  }

  DrawQuad(iX1, iY1, iX2, iY2, iX3, iY3, iX4, iY4, szMaterial, szBackMaterial, fDrawBridge) {
    const vtcs = new Int32Array(8);
    vtcs[0] = iX1;
    vtcs[1] = iY1;
    vtcs[2] = iX2;
    vtcs[3] = iY2;
    vtcs[4] = iX3;
    vtcs[5] = iY3;
    vtcs[6] = iX4;
    vtcs[7] = iY4;
    return this.DrawPolygon(P(vtcs, 0), 8, szMaterial, szBackMaterial, fDrawBridge);
  }

  DrawPolygon(vtcs, length, szMaterial, szBackMaterial, fDrawBridge) {
    if (length < 6) {
      return false;
    }
    if (length % 2 === 1) {
      return false;
    }
    let iMatTex = $.TextureMap.GetIndexMatTex(szMaterial);
    if (iMatTex === 0) {
      return false;
    }
    let mcol = $.MatTex2PixCol(iMatTex);
    let mcolBkg = 0;
    if (szBackMaterial != null) {
      let iBackMatTex = $.TextureMap.GetIndexMatTex(szBackMaterial);
      if (iBackMatTex === 0) {
        return false;
      }
      mcolBkg = $.MatTex2PixCol(iBackMatTex);
    }
    let conversion_map = null;
    if (fDrawBridge) {
      conversion_map = this.p.GetBridgeMatConversion(this, $.MatTex2PixCol(iMatTex));
      mcolBkg = 255;
    }
    let BoundingBox = getBoundingBox(vtcs, length);
    this.p.PrepareChange(this, BoundingBox);
    this.p.ForPolygon(this, vtcs, length / 2 | 0, null, null, mcol, mcolBkg, conversion_map);
    this.p.FinishChange(this, BoundingBox.$clone());
    return true;
  }

  GetPal() {
    return this.p.Surface8 != null ? this.p.Surface8.pPal : null;
  }

  GetWidth() {
    return this.p.Width;
  }

  GetHeight() {
    return this.p.Height;
  }

  GetMapZoom() {
    return this.p.MapZoom;
  }

  GetGravity() {
    return this.p.Gravity.$clone();
  }

  SetGravity(g) {
    this.p.Gravity.$assign(g);
  }

  _GetPix(x, y) {
    return this.p.Surface8._GetPix(x, y);
  }

  GetPix(x, y) {
    let MCVehic = 0;
    if (x < 0) {
      return this.p.LeftColPix[$u64n($.Clamp$i32$i32$i32(y, 0, this.GetHeight() - 1 | 0))];
    }
    if (x >>> 0 >= this.p.Width >>> 0) {
      return this.p.RightColPix[$u64n($.Clamp$i32$i32$i32(y, 0, this.GetHeight() - 1 | 0))];
    }
    if (y < 0) {
      return this.p.TopRowPix[$u64n(x)];
    }
    if (y >>> 0 >= this.p.Height >>> 0) {
      return this.p.BottomRowPix[$u64n(x)];
    }
    return this.p.Surface8._GetPix(x, y);
  }

  _GetMat(x, y) {
    return this.p.Pix2Mat[this._GetPix(x, y)];
  }

  _GetDensity(x, y) {
    return this.p.Pix2Dens[this._GetPix(x, y)];
  }

  _GetPlacement(x, y) {
    return this.p.Pix2Place[this._GetPix(x, y)];
  }

  GetMat(x, y) {
    return this.p.Pix2Mat[this.GetPix(x, y)];
  }

  GetDensity(x, y) {
    return this.p.Pix2Dens[this.GetPix(x, y)];
  }

  GetPlacement(x, y) {
    return this.p.Pix2Place[this.GetPix(x, y)];
  }

  _GetBackPix(x, y) {
    return this.p.Surface8Bkg._GetPix(x, y);
  }

  GetBackPix(x, y) {
    if (x < 0) {
      return this.p.DefaultBkgMat(this.p.LeftColPix[$u64n($.Clamp$i32$i32$i32(y, 0, this.GetHeight() - 1 | 0))]);
    }
    if (x >>> 0 >= this.GetWidth() >>> 0) {
      return this.p.DefaultBkgMat(this.p.RightColPix[$u64n($.Clamp$i32$i32$i32(y, 0, this.GetHeight() - 1 | 0))]);
    }
    if (y < 0) {
      return this.p.DefaultBkgMat(this.p.TopRowPix[$u64n(x)]);
    }
    if (y >>> 0 >= this.GetHeight() >>> 0) {
      return this.p.DefaultBkgMat(this.p.BottomRowPix[$u64n(x)]);
    }
    return this.p.Surface8Bkg._GetPix(x, y);
  }

  _GetBackMat(x, y) {
    return this.p.Pix2Mat[this._GetBackPix(x, y)];
  }

  _GetBackDensity(x, y) {
    return this.p.Pix2Dens[this._GetBackPix(x, y)];
  }

  _GetBackPlacement(x, y) {
    return this.p.Pix2Place[this._GetBackPix(x, y)];
  }

  GetBackMat(x, y) {
    return this.p.Pix2Mat[this.GetBackPix(x, y)];
  }

  GetBackDensity(x, y) {
    return this.p.Pix2Dens[this.GetBackPix(x, y)];
  }

  GetBackPlacement(x, y) {
    return this.p.Pix2Place[this.GetBackPix(x, y)];
  }

  GetLight(x, y) {
    return this.GetBackPix(x, y) === 0 || this.p.Pix2Light[this.GetPix(x, y)];
  }

  _GetLight(x, y) {
    return this._GetBackPix(x, y) === 0 || this.p.Pix2Light[this._GetPix(x, y)];
  }

  _FastSolidCheck(x, y) {
    return this.p.PixCnt[$u64n(Math.imul(x / 17 | 0, this.p.PixCntPitch) + (y / 15 | 0) | 0)] > 0;
  }

  static FastSolidCheckNextX(x) {
    return Math.imul(x / 17 | 0, 17) + 17 | 0;
  }

  GetPixMat(byPix) {
    return this.p.Pix2Mat[byPix];
  }

  GetPixDensity(byPix) {
    return this.p.Pix2Dens[byPix];
  }

  _PathFree(x, y, x2, y2) {
    x = x / 17 | 0;
    y = y / 15 | 0;
    x2 = x2 / 17 | 0;
    y2 = y2 / 15 | 0;
    while (x !== x2 && y !== y2) {
      if (this.p.PixCnt[$u64n(Math.imul(x, this.p.PixCntPitch) + y | 0)] !== 0) {
        return false;
      }
      if (x > x2) {
        x = x - 1 | 0;
      } else {
        x = x + 1 | 0;
      }
      if (y > y2) {
        y = y - 1 | 0;
      } else {
        y = y + 1 | 0;
      }
    }
    if (x !== x2) {
      do {
        if (this.p.PixCnt[$u64n(Math.imul(x, this.p.PixCntPitch) + y | 0)] !== 0) {
          return false;
        }
        if (x > x2) {
          x = x - 1 | 0;
        } else {
          x = x + 1 | 0;
        }
      } while (x !== x2);
    } else {
      while (y !== y2) {
        if (this.p.PixCnt[$u64n(Math.imul(x, this.p.PixCntPitch) + y | 0)] !== 0) {
          return false;
        }
        if (y > y2) {
          y = y - 1 | 0;
        } else {
          y = y + 1 | 0;
        }
      }
    }
    return !(this.p.PixCnt[$u64n(Math.imul(x, this.p.PixCntPitch) + y | 0)] !== 0);
  }

  GetMatHeight(x, y, iYDir, iMat, iMax) {
    if (iYDir > 0) {
      iMax = $min(iMax, this.GetHeight() - y | 0);
      for (let i = 0; i < iMax; i = i + 1 | 0) {
        if (this._GetMat(x, y + i | 0) !== iMat) {
          return i;
        }
      }
    } else {
      iMax = $min(iMax, y + 1 | 0);
      for (let i = 0; i < iMax; i = i + 1 | 0) {
        if (this._GetMat(x, y - i | 0) !== iMat) {
          return i;
        }
      }
    }
    return iMax;
  }

  AreaSolidCount(x, y, wdt, hgt) {
    let cx = 0;
    let cy = 0;
    let ascnt = 0;
    for (cy = y; cy < (y + hgt | 0); cy = cy + 1 | 0) {
      for (cx = x; cx < (x + wdt | 0); cx = cx + 1 | 0) {
        if (GBackSolid(cx, cy)) {
          ascnt = ascnt + 1 | 0;
        }
      }
    }
    return ascnt;
  }

  ExtractMaterial(fx$, fy$, distant_first) {
    const fx = [fx$];
    const fy = [fy$];
    let mat = this.GetMat(fx[0], fy[0]);
    if (mat === -1) {
      return -1;
    }
    this.FindMatTop(mat, P(fx, 0), P(fy, 0), distant_first);
    this.ClearPix(fx[0], fy[0]);
    this.CheckInstabilityRange(fx[0], fy[0]);
    return mat;
  }

  DrawMap(iX$, iY$, iWdt$, iHgt$, szMapDef, ignoreSky = false) {
    const iX = [iX$];
    const iY = [iY$];
    const iWdt = [iWdt$];
    const iHgt = [iHgt$];
    if (szMapDef == null) {
      return false;
    }
    if (!this.ClipRect(P(iX, 0), P(iY, 0), P(iWdt, 0), P(iHgt, 0))) {
      return false;
    }
    let iMapWdt = ((iWdt[0] - 1 | 0) / this.p.MapZoom | 0) + 1 | 0;
    let iMapHgt = ((iHgt[0] - 1 | 0) / this.p.MapZoom | 0) + 1 | 0;
    let FakeLS = $.Game.C4S.Landscape.$clone();
    FakeLS.MapWdt.Set(iMapWdt, 0, iMapWdt, iMapWdt);
    FakeLS.MapHgt.Set(iMapHgt, 0, iMapHgt, iMapHgt);
    let MapCreator = new $.C4MapCreatorS2().init(FakeLS, $.TextureMap, $.MaterialMap, $.Game.StartupPlayerCount);
    MapCreator.ReadScript(szMapDef);
    const sfcMap = [null];
    const sfcMapBkg = [null];
    if (!MapCreator.Render(null, P(sfcMap, 0), P(sfcMapBkg, 0))) {
      return false;
    }
    let fSuccess = this.p.MapToLandscape(this, sfcMap[0], sfcMapBkg[0], 0, 0, iMapWdt, iMapHgt, iX[0], iY[0], ignoreSky);
    $delete(sfcMap[0]);
    $delete(sfcMapBkg[0]);
    return fSuccess;
  }

  ClipRect(rX, rY, rWdt, rHgt) {
    if (rX.a[rX.o] < 0) {
      rWdt.a[rWdt.o] = rWdt.a[rWdt.o] + rX.a[rX.o] | 0;
      rX.a[rX.o] = 0;
    }
    if (rY.a[rY.o] < 0) {
      rHgt.a[rHgt.o] = rHgt.a[rHgt.o] + rY.a[rY.o] | 0;
      rY.a[rY.o] = 0;
    }
    let iOver = 0;
    iOver = (rX.a[rX.o] + rWdt.a[rWdt.o] | 0) - this.GetWidth() | 0;
    if (iOver > 0) {
      rWdt.a[rWdt.o] = rWdt.a[rWdt.o] - iOver | 0;
    }
    iOver = (rY.a[rY.o] + rHgt.a[rHgt.o] | 0) - this.GetHeight() | 0;
    if (iOver > 0) {
      rHgt.a[rHgt.o] = rHgt.a[rHgt.o] - iOver | 0;
    }
    return rWdt.a[rWdt.o] > 0 && rHgt.a[rHgt.o] > 0;
  }

  DrawDefMap(iX$, iY$, iWdt$, iHgt$, szMapDef, ignoreSky = false) {
    const iX = [iX$];
    const iY = [iY$];
    const iWdt = [iWdt$];
    const iHgt = [iHgt$];
    if (szMapDef == null || this.p.pMapCreator == null) {
      return false;
    }
    if (!this.ClipRect(P(iX, 0), P(iY, 0), P(iWdt, 0), P(iHgt, 0))) {
      return false;
    }
    let iMapWdt = ((iWdt[0] - 1 | 0) / this.p.MapZoom | 0) + 1 | 0;
    let iMapHgt = ((iHgt[0] - 1 | 0) / this.p.MapZoom | 0) + 1 | 0;
    let fSuccess = false;
    let pMap = this.p.pMapCreator.GetMap(szMapDef);
    if (pMap == null) {
      return false;
    }
    pMap.SetSize(iMapWdt, iMapHgt);
    const sfcMap = [null];
    const sfcMapBkg = [null];
    if (this.p.pMapCreator.Render(szMapDef, P(sfcMap, 0), P(sfcMapBkg, 0))) {
      fSuccess = this.p.MapToLandscape(this, sfcMap[0], sfcMapBkg[0], 0, 0, iMapWdt, iMapHgt, iX[0], iY[0], ignoreSky);
      $delete(sfcMap[0]);
      $delete(sfcMapBkg[0]);
    }
    return fSuccess;
  }

  SetModulation(dwWithClr) {
    this.p.Modulation = dwWithClr;
    return true;
  }

  GetModulation() {
    return this.p.Modulation;
  }

  PostInitMap() {
    if (this.p.pMapCreator == null) {
      return true;
    }
    this.p.pMapCreator.ExecuteCallbacks(this.p.MapZoom);
    if (!$.Game.C4S.Landscape.KeepMapCreator) {
      this.p.pMapCreator = null;
    }
    return true;
  }

  ReplaceMapColor(iOldIndex, iNewIndex) {
    if (this.p.Map == null) {
      return false;
    }
    let iPitch = 0;
    let iMapWdt = 0;
    let iMapHgt = 0;
    let pMap = this.p.Map.Bits;
    iMapWdt = this.p.Map.Wdt;
    iMapHgt = this.p.Map.Hgt;
    iPitch = this.p.Map.Pitch;
    if (pMap == null) {
      return false;
    }
    for (let y = 0; y < iMapHgt; y = y + 1 | 0) {
      for (let x = 0; x < iMapWdt; x = x + 1 | 0) {
        if (pMap.a[pMap.o] === iOldIndex) {
          pMap.a[pMap.o] = iNewIndex;
        }
        pMap = pMap.add(1);
      }
      pMap = pMap.add(iPitch - iMapWdt | 0);
    }
    return true;
  }

  SetTextureIndex(szMatTex, iNewIndex, fInsert) {
    if ((szMatTex == null || szMatTex.a[szMatTex.o] === 0) && !fInsert || !$.Inside$i32$i32$i32$3(iNewIndex, 1, 254)) {
      $.DebugLogF(S("Cannot insert new texture %s to index %d: Invalid parameters."), szMatTex, iNewIndex);
      return false;
    }
    let Material = new $.StdStrBuf();
    let Texture = new $.StdStrBuf();
    Material.CopyUntil(szMatTex, 45);
    Texture.Copy$pi8($.SSearch(szMatTex, S("-")));
    let iOldIndex = (szMatTex != null && szMatTex.a[szMatTex.o] !== 0 ? $.TextureMap.GetIndex(Material.getData(), Texture.getData(), false) : 0) & 0xff;
    if (fInsert) {
      let byLastMoveIndex = 254;
      while ($.TextureMap.GetEntry(byLastMoveIndex) != null) {
        if ((byLastMoveIndex = byLastMoveIndex - 1 & 0xff) === iNewIndex) {
          $.DebugLogF(S("Cannot insert new texture %s to index %d: No room for insertion."), szMatTex, iNewIndex);
          return false;
        }
      }
      while ((byLastMoveIndex = byLastMoveIndex - 1 & 0xff) >= iNewIndex) {
        if ($.TextureMap.GetEntry(byLastMoveIndex) != null) {
          this.ReplaceMapColor(byLastMoveIndex, (byLastMoveIndex + 1 | 0) & 0xff);
          $.TextureMap.MoveIndex(byLastMoveIndex, (byLastMoveIndex + 1 | 0) & 0xff);
        }
      }
      if (szMatTex != null && szMatTex.a[szMatTex.o] !== 0) {
        if (iOldIndex !== 0) {
          this.ReplaceMapColor(iOldIndex, iNewIndex);
          $.TextureMap.MoveIndex(iOldIndex, iNewIndex);
        } else {
          let Material$2 = new $.StdStrBuf();
          let Texture$2 = new $.StdStrBuf();
          Material$2.CopyUntil(szMatTex, 45);
          Texture$2.Copy$pi8($.SSearch(szMatTex, S("-")));
          if (!$.TextureMap.AddEntry(iNewIndex, Material$2.getData(), Texture$2.getData())) {
            $.LogF(S("Cannot insert new texture %s to index %d: Texture map entry error"), szMatTex, iNewIndex);
            return false;
          }
        }
      }
      return true;
    } else {
      let pOld = null;
      if ((pOld = $.TextureMap.GetEntry(iNewIndex)) != null && !pOld.isNull()) {
        $.DebugLogF(S("Cannot move texture %s to index %d: Index occupied by %s-%s."), szMatTex, iNewIndex, pOld.GetMaterialName(), pOld.GetTextureName());
        return false;
      }
      if (iOldIndex === 0) {
        $.DebugLogF(S("Cannot move texture %s to index %d: Texture not found."), szMatTex, iNewIndex);
        return false;
      }
      this.ReplaceMapColor(iOldIndex, iNewIndex);
      $.TextureMap.MoveIndex(iOldIndex, iNewIndex);
      return true;
    }
  }

  SetMapChanged() {
    this.p.fMapChanged = true;
  }

  HandleTexMapUpdate() {
    this.UpdatePixMaps();
    this.p.Mat2Pal();
  }

  UpdatePixMaps() {
    let i = 0;
    for (i = 0; i < 255; i = i + 1 | 0) {
      this.p.Pix2Mat[i] = PixCol2Mat(i & 0xff);
    }
    for (i = 0; i < 255; i = i + 1 | 0) {
      this.p.Pix2Dens[i] = $.MatDensity(this.p.Pix2Mat[i]);
    }
    for (i = 0; i < 255; i = i + 1 | 0) {
      this.p.Pix2Place[i] = $.MatValid(this.p.Pix2Mat[i]) ? $oidx($.MaterialMap.Map, this.p.Pix2Mat[i]).Placement : 0;
    }
    for (i = 0; i < 255; i = i + 1 | 0) {
      this.p.Pix2Light[i] = $.MatValid(this.p.Pix2Mat[i]) && $oidx($.MaterialMap.Map, this.p.Pix2Mat[i]).Light > 0;
    }
    this.p.Pix2Place[0] = 0;
    std_fill($begin(this.p.BridgeMatConversion), $end(this.p.BridgeMatConversion), null);
  }

  DoRelights() {
    if (this.p.pLandscapeRender == null) {
      return true;
    }
    for (let i = 0; i < 50; i = i + 1 | 0) {
      if (!(this.p.Relights[$u64n(i)].Wdt !== 0)) {
        break;
      }
      let SolidMaskRect = this.p.pLandscapeRender.GetAffectedRect(this.p.Relights[$u64n(i)].$clone());
      let pSolid = null;
      for (pSolid = $.C4SolidMask.Last; pSolid != null; pSolid = pSolid.Prev) {
        pSolid.RemoveTemporary(SolidMaskRect.$clone());
      }
      this.p.pLandscapeRender.Update(this.p.Relights[$u64n(i)].$clone(), this);
      if (this.p.pFoW != null) {
        this.p.pFoW.Ambient.UpdateFromLandscape(this, this.p.Relights[$u64n(i)]);
      }
      for (pSolid = $.C4SolidMask.First; pSolid != null; pSolid = pSolid.Next) {
        pSolid.PutTemporary(SolidMaskRect.$clone());
      }
      $.C4SolidMask.CheckConsistency();
      $.C4Rect.prototype.Default.call(this.p.Relights[$u64n(i)]);
    }
    return true;
  }

  RemoveUnusedTexMapEntries() {
    const fTexUsage = new Array(255).fill(false);
    let iMatTex = 0;
    for (iMatTex = 0; iMatTex < 255; iMatTex = iMatTex + 1 | 0) {
      fTexUsage[iMatTex] = false;
    }
    for (let y = 0; y < this.GetHeight(); y = y + 1 | 0) {
      for (let x = 0; x < this.GetWidth(); x = x + 1 | 0) {
        let pix = this.p.Surface8.GetPix(x, y);
        let backPix = this.p.Surface8Bkg.GetPix(x, y);
        0;
        0;
        fTexUsage[pix] = true;
        fTexUsage[backPix] = true;
      }
    }
    for (let iMat = 0; iMat < $.MaterialMap.Num; iMat = iMat + 1 | 0) {
      let pMat = $oadd($.MaterialMap.Map, iMat);
      if (pMat.BlastShiftTo >= 0) {
        fTexUsage[pMat.BlastShiftTo] = true;
      }
      if (pMat.BelowTempConvertTo >= 0) {
        fTexUsage[pMat.BelowTempConvertTo] = true;
      }
      if (pMat.AboveTempConvertTo >= 0) {
        fTexUsage[pMat.AboveTempConvertTo] = true;
      }
      if (pMat.DefaultMatTex >= 0) {
        fTexUsage[pMat.DefaultMatTex] = true;
      }
    }
    for (iMatTex = 1; iMatTex < 255; iMatTex = iMatTex + 1 | 0) {
      if (!fTexUsage[iMatTex]) {
        $.TextureMap.RemoveEntry(iMatTex);
      }
    }
    $.TextureMap.fEntriesAdded = true;
  }

  GetSky() {
    return this.p.Sky;
  }

  HasFoW() {
    return this.p.pFoW != null;
  }

  GetFoW() {
    return this.p.pFoW;
  }

  GetMatCount(material) {
    0;
    return this.p.MatCount[$u64n(material)] | 0;
  }

  GetEffectiveMatCount(material) {
    0;
    return this.p.EffectiveMatCount[$u64n(material)] | 0;
  }

  DigFreeShape(vtcs, length, by_object = null, no_dig2objects = false, no_instability_check = false) {
    let BoundingBox = getBoundingBox(vtcs, length);
    let amount = 0;
    let dig_objects = this.p.PrepareFreeShape(BoundingBox, by_object);
    let callback = null;
    if (no_instability_check) {
      callback = ((x, y) => {
  return this.p.DigFreePixNoInstability(this, x, y);
});
    } else {
      callback = ((x$2, y$2) => {
  return this.p.DigFreePix(this, x$2, y$2);
});
    }
    if (by_object != null) {
      if (by_object.MaterialContents == null) {
        by_object.MaterialContents = new $.C4MaterialList().init();
      }
      amount = this.p.ForPolygon(this, vtcs, length / 2 | 0, callback, by_object.MaterialContents);
    } else {
      amount = this.p.ForPolygon(this, vtcs, length / 2 | 0, callback, null);
    }
    if ($.Game.iTick5 === 0) {
      if (!no_dig2objects) {
        if (by_object != null) {
          if (by_object.MaterialContents != null) {
            let tx = BoundingBox.GetMiddleX();
            let ty = BoundingBox.GetBottom$v$c();
            this.p.DigMaterial2Objects(tx, ty, by_object.MaterialContents, by_object);
          }
        }
      }
    }
    this.p.PostFreeShape(dig_objects, by_object);
    return amount;
  }

  BlastFreeShape(vtcs, length, by_object = null, by_player = -1, iMaxDensity = 100) {
    let MaterialContents = null;
    let BoundingBox = getBoundingBox(vtcs, length);
    let dig_objects = this.p.PrepareFreeShape(BoundingBox, by_object);
    let pblast_tbl = null;
    const blast_tbl = new Uint8Array(255);
    if (iMaxDensity < 100) {
      for (let i = 0; i < 255; i = i + 1 | 0) {
        blast_tbl[i] = this.GetPixDensity(i & 0xff) <= iMaxDensity ? 1 : 0;
      }
      pblast_tbl = P(blast_tbl, 0);
    }
    if (by_object != null) {
      if (by_object.MaterialContents == null) {
        by_object.MaterialContents = new $.C4MaterialList().init();
      }
      this.p.ForPolygon(this, vtcs, length / 2 | 0, ((x, y) => {
  return this.p.BlastFreePix(this, x, y);
}), by_object.MaterialContents, 0, 0, pblast_tbl);
    } else {
      MaterialContents = new $.C4MaterialList().init();
      this.p.ForPolygon(this, vtcs, length / 2 | 0, ((x$2, y$2) => {
  return this.p.BlastFreePix(this, x$2, y$2);
}), MaterialContents, iMaxDensity & 0xff);
    }
    let mat_list = null;
    if (by_object != null) {
      mat_list = by_object.MaterialContents;
    } else {
      mat_list = MaterialContents;
    }
    let tx = BoundingBox.GetMiddleX();
    let ty = BoundingBox.GetMiddleY();
    this.p.BlastMaterial2Objects(tx, ty, mat_list, by_player, (BoundingBox.Wdt + BoundingBox.Hgt | 0) / 4 | 0, dig_objects);
    if (MaterialContents != null) {
      $delete(MaterialContents);
    }
    this.p.PostFreeShape(dig_objects, by_object);
  }

  ClearFreeRect(tx, ty, wdt, hgt) {
    let vertices = GetRectangle(tx, ty, wdt, hgt);
    let r = new $.C4Rect().init$i32$i32$i32$i32(tx, ty, wdt, hgt);
    this.p.PrepareChange(this, r, false);
    this.p.ForPolygon(this, P(vertices, 0), Math.trunc(vertices.length / 2) | 0, ((x, y) => {
  return this.ClearPix(x, y);
}));
    this.p.FinishChange(this, r.$clone(), false);
  }

  DigFreeRect(tx, ty, wdt, hgt, by_object = null, no_dig2objects = false, no_instability_check = false) {
    let vertices = GetRectangle(tx, ty, wdt, hgt);
    return this.DigFreeShape(P(vertices, 0), vertices.length | 0, by_object, no_dig2objects, no_instability_check);
  }

  DigFree(tx, ty, rad, by_object = null, no_dig2objects = false, no_instability_check = false) {
    let vertices = GetRoundPolygon(tx, ty, rad, 80);
    return this.DigFreeShape(P(vertices, 0), vertices.length | 0, by_object, no_dig2objects, no_instability_check);
  }

  ShakeFree(tx, ty, rad) {
    let vertices = GetRoundPolygon(tx, ty, rad, 50);
    this.p.ForPolygon(this, P(vertices, 0), Math.trunc(vertices.length / 2) | 0, ((x, y) => {
  return this.p.ShakeFreePix(this, x, y);
}));
  }

  BlastFree(tx, ty, rad, caused_by = -1, by_object = null, iMaxDensity = 100) {
    let vertices = GetRoundPolygon(tx, ty, rad, 30);
    this.BlastFreeShape(P(vertices, 0), vertices.length | 0, by_object, caused_by, iMaxDensity);
  }

  CheckInstabilityRange(tx, ty) {
    if (!this.CheckInstability(tx, ty)) {
      this.CheckInstability(tx, ty - 1 | 0);
      this.CheckInstability(tx, ty - 2 | 0);
      this.CheckInstability(tx - 1 | 0, ty);
      this.CheckInstability(tx + 1 | 0, ty);
    }
  }

  CheckInstability(tx, ty, recursion_count = 0) {
    let mat = this.GetMat(tx, ty);
    if ($.MatValid(mat)) {
      const material = $oidx($.MaterialMap.Map, mat);
      if (material.Instable !== 0) {
        return $.MassMover.Create(tx, ty);
      } else if (DensitySolid(material.Density) && !material.KeepSinglePixels && recursion_count < 10) {
        if (((((!GBackSolid(tx, ty + 1 | 0) ? 1 : 0) + (!GBackSolid(tx, ty - 1 | 0) ? 1 : 0) | 0) + (!GBackSolid(tx + 1 | 0, ty) ? 1 : 0) | 0) + (!GBackSolid(tx - 1 | 0, ty) ? 1 : 0) | 0) >= 3) {
          if (!this.ClearPix(tx, ty)) {
            return false;
          }
          if (material.DigFree !== 0) {
            $.PXS.Create(mat, $.itofix$i32(tx), $.itofix$i32(ty));
          }
          this.CheckInstability(tx + 1 | 0, ty, (recursion_count = recursion_count + 1 | 0));
          this.CheckInstability(tx - 1 | 0, ty, recursion_count);
          this.CheckInstability(tx, ty - 1 | 0, recursion_count);
          this.CheckInstability(tx, ty + 1 | 0, recursion_count);
          return true;
        }
      }
    }
    return false;
  }

  ClearPix(tx, ty) {
    let bkgPix = this.p.Surface8Bkg.GetPix(tx, ty);
    return this.SetPix2(tx, ty, bkgPix, bkgPix);
  }

  ClearPointers(pObj) {
    if (this.p.pFoW != null) {
      this.p.pFoW.Remove(pObj);
    }
  }

  CompileFunc(pComp) {
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this.p, "MapSeed"), S("MapSeed"), 0));
    pComp.Value$StdNamingDefaultAdapt$StdCastAdapt$C4Fixed$i32$C4Fixed($.mkNamingAdapt$mStdCastAdapt$C4Fixed$i32$pi8$C4Fixed$b$b($.mkCastIntAdapt$rC4Fixed(this.p.Gravity), S("Gravity"), $.DefaultGravAccel));
    pComp.Value$StdNamingDefaultAdapt$u32$u32($.mkNamingAdapt$ru32$pi8$u32$b$b(P(this.p, "Modulation"), S("MatModulation"), 0));
    pComp.Value$StdNamingDefaultAdapt$StdCastAdapt$i32$i32$i32($.mkNamingAdapt$mStdCastAdapt$i32$i32$pi8$i32$b$b($.mkCastIntAdapt$ri32(P(this.p, "mode")), S("Mode"), 0 /*Undefined*/));
    if (pComp.isDeserializer()) {
      const ambient_brightness = [0];
      pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(ambient_brightness, 0), S("AmbientBrightness"), 255));
      if (this.p.pFoW != null) {
        this.p.pFoW.Ambient.SetBrightness(ambient_brightness[0] / 255);
      }
    } else {
      if (this.p.pFoW != null) {
        const ambient_brightness = [ftoi32(this.p.pFoW.Ambient.GetBrightness() * 255 + 0.5)];
        pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(ambient_brightness, 0), S("AmbientBrightness"), 255));
      }
    }
  }

  $clone() { return new C4Landscape().$assign(this); }
  $assign(o) {
    this.p = o.p;
    return this;
  }
}

export class C4Landscape$P_landscape_C4Landscape {
  Surface8 = null;
  Surface8Bkg = null;
  Map = null;
  MapBkg = null;
  pLandscapeRender = null;
  TopRowPix = [];
  BottomRowPix = [];
  LeftColPix = [];
  RightColPix = [];
  Pix2Mat = new Int32Array(255);
  Pix2Dens = new Int32Array(255);
  Pix2Place = new Int32Array(255);
  Pix2Light = new Array(255).fill(false);
  PixCntPitch = 0;
  PixCnt = [];
  Relights = $oarr(50, () => new $.C4Rect());
  BridgeMatConversion = $oarr(255, () => null);
  mode = 0 /*Undefined*/;
  Width = 0;
  Height = 0;
  MapWidth = 0;
  MapHeight = 0;
  MapZoom = 0;
  MatCount = new Uint32Array(125);
  EffectiveMatCount = new Uint32Array(125);
  NoScan = false;
  ScanX = 0;
  ScanSpeed = 2;
  Gravity = $.DefaultGravAccel.$clone();
  Modulation = 0;
  MapSeed = 0;
  Sky = new $.C4Sky().init();
  pMapCreator = null;
  fMapChanged = false;
  pInitial = null;
  pInitialBkg = null;
  pFoW = null;

  ClearMatCount() {
    std_fill($begin(this.MatCount), $end(this.MatCount), 0);
    std_fill($begin(this.EffectiveMatCount), $end(this.EffectiveMatCount), 0);
  }

  ExecuteScan(d) {
    let cy = 0;
    let mat = 0;
    let iTemperature = $.Weather.GetTemperature();
    for (mat = 0; mat < $.MaterialMap.Num; mat = mat + 1 | 0) {
      if (this.MatCount[$u64n(mat)] !== 0) {
        if ($oidx($.MaterialMap.Map, mat).BelowTempConvertTo !== 0 && iTemperature < $oidx($.MaterialMap.Map, mat).BelowTempConvert) {
          break;
        } else if ($oidx($.MaterialMap.Map, mat).AboveTempConvertTo !== 0 && iTemperature > $oidx($.MaterialMap.Map, mat).AboveTempConvert) {
          break;
        }
      }
    }
    if (mat >= $.MaterialMap.Num) {
      return;
    }
    if (true && $.Config.General.DebugRec !== 0) {
      $.AddDbgRec(158 /*RCT_MatScan*/, P(this, "ScanX"), 4);
    }
    for (let cnt = 0; cnt < this.ScanSpeed; cnt = cnt + 1 | 0) {
      let last_mat = -1;
      for (cy = 0; cy < this.Height; cy = cy + 1 | 0) {
        mat = d._GetMat(this.ScanX, cy);
        if (last_mat !== mat) {
          if (last_mat !== -1) {
            this.DoScan(d, this.ScanX, cy - 1 | 0, last_mat, 1);
          }
          if (mat !== -1) {
            cy = cy + this.DoScan(d, this.ScanX, cy, mat, 0) | 0;
          }
        }
        last_mat = mat;
      }
      this.ScanX = this.ScanX + 1 | 0;
      if (this.ScanX >= this.Width) {
        this.ScanX = 0;
      }
    }
  }

  DoScan(d, cx, cy, mat, dir) {
    let conv_to_tex = 0;
    let iTemperature = $.Weather.GetTemperature();
    if ($oidx($.MaterialMap.Map, mat).BelowTempConvertDir === dir) {
      if ($oidx($.MaterialMap.Map, mat).BelowTempConvertTo !== 0) {
        if (iTemperature < $oidx($.MaterialMap.Map, mat).BelowTempConvert) {
          conv_to_tex = $oidx($.MaterialMap.Map, mat).BelowTempConvertTo;
        }
      }
    }
    if ($oidx($.MaterialMap.Map, mat).AboveTempConvertDir === dir) {
      if ($oidx($.MaterialMap.Map, mat).AboveTempConvertTo !== 0) {
        if (iTemperature > $oidx($.MaterialMap.Map, mat).AboveTempConvert) {
          conv_to_tex = $oidx($.MaterialMap.Map, mat).AboveTempConvertTo;
        }
      }
    }
    if (conv_to_tex === 0) {
      return 0;
    }
    let conv_to = $.TextureMap.GetEntry(conv_to_tex).GetMaterialIndex();
    let mconv = $oidx($.MaterialMap.Map, mat).TempConvStrength;
    let mconvs = mconv;
    if (true && $.Config.General.DebugRec !== 0) {
      let rc = ((($o) => ($o.cx = cx, $o.cy = cy, $o.mat = mat, $o.conv_to = conv_to, $o.dir = dir, $o.mconvs = mconvs, $o))(new $.C4RCMatScan()));
      $.AddDbgRec(159 /*RCT_MatScanDo*/, $bytesView(rc, [["cx", 0, "i32", 0], ["cy", 4, "i32", 0], ["mat", 8, "i32", 0], ["conv_to", 12, "i32", 0], ["dir", 16, "i32", 0], ["mconvs", 20, "i32", 0]], 24), 24);
    }
    let ydir = dir === 0 ? 1 : -1;
    let cy2 = 0;
    let lmat = cx > 0 ? d._GetMat(cx - 1 | 0, cy) : -1;
    if (lmat === mat) {
      return 0;
    }
    if (lmat !== conv_to) {
      let iSearchRange = $max(5, mconvs);
      let cys = cy;
      let cxs = cx;
      while (cxs < ($.Landscape.GetWidth() - 1 | 0)) {
        cxs = cxs + 1 | 0;
        if (d._GetMat(cxs, cys) === mat) {
          cys = cys - ydir | 0;
          while ($.Inside$i32$i32$i32$3(cys, 0, $.Landscape.GetHeight() - 1 | 0) && d._GetMat(cxs, cys) === mat) {
            cys = cys - ydir | 0;
            if ((mconvs = $min(mconv - $.Abs$i32(cys - cy | 0) | 0, mconvs)) < 0) {
              return 0;
            }
          }
          if (!$.Inside$i32$i32$i32$3(cys, 0, $.Landscape.GetHeight() - 1 | 0)) {
            break;
          }
          cys = cys + ydir | 0;
        } else {
          cys = cys + ydir | 0;
          while ($.Inside$i32$i32$i32$3(cys, 0, $.Landscape.GetHeight() - 1 | 0) && d._GetMat(cxs, cys) !== mat) {
            cys = cys + ydir | 0;
            if ($.Abs$i32(cys - cy | 0) > iSearchRange) {
              break;
            }
          }
          if (!$.Inside$i32$i32$i32$3(cys, 0, $.Landscape.GetHeight() - 1 | 0)) {
            break;
          }
          if ($.Abs$i32(cys - cy | 0) > iSearchRange) {
            break;
          }
        }
      }
    }
    let conv_to_is_solid = conv_to > -1 && DensitySolid($oidx($.MaterialMap.Map, conv_to).Density);
    for (cy2 = cy; mconvs >= 0 && $.Inside$i32$i32$i32$3(cy2, 0, $.Landscape.GetHeight() - 1 | 0); cy2 = cy2 + ydir | 0, mconvs = mconvs - 1 | 0) {
      let pix = d._GetPix(cx, cy2);
      if (PixCol2Mat(pix & 0xff) !== mat) {
        break;
      }
      let lmat$2 = cx > 0 ? d._GetMat(cx - 1 | 0, cy2) : -1;
      if (lmat$2 === mat) {
        break;
      }
      d.SetPix2(cx, cy2, $.MatTex2PixCol(conv_to_tex), 255);
      if (!conv_to_is_solid) {
        d.CheckInstabilityRange(cx, cy2);
      }
    }
    return $.Abs$i32(cy2 - cy | 0);
  }

  ChunkyRandom(iOffset, iRange) {
    if (iRange === 0) {
      return 0;
    }
    iOffset.a[iOffset.o] = (Math.imul(iOffset.a[iOffset.o], 16807) >>> 0) % 0x7fffffff;
    return ((iOffset.a[iOffset.o] ^ this.MapSeed >>> 0) >>> 0) % iRange;
  }

  DrawChunk(d, tx, ty, wdt, hgt, mcol, mcolBkg, Shape, cro$) {
    const cro = [cro$];
    let top_rough = 0;
    let side_rough = 0;
    let bottom_rough = 0;
    switch (Shape) {
      case 0:
      case 4:
        if (mcol !== 255) {
          this.Surface8.Box(tx, ty, tx + wdt | 0, ty + hgt | 0, mcol);
        }
        if (mcolBkg !== 255) {
          this.Surface8Bkg.Box(tx, ty, tx + wdt | 0, ty + hgt | 0, mcolBkg);
        }
        return;
      case 1:
        top_rough = 0;
        side_rough = 2;
        bottom_rough = 4;
        break;
      case 2:
        top_rough = 2;
        side_rough = 2;
        bottom_rough = 2;
        break;
      case 3:
        top_rough = 4;
        side_rough = 4;
        bottom_rough = 4;
        break;
      case 5:
        top_rough = 1;
        side_rough = 1;
        bottom_rough = 1;
        break;
    }
    const vtcs = new Int32Array(16);
    let rx = $max(wdt / 2 | 0, 1) >>> 0;
    vtcs[0] = (tx >>> 0) - this.ChunkyRandom(P(cro, 0), (Math.imul(rx, side_rough) >>> 0) / 4 >>> 0) >>> 0 | 0;
    vtcs[1] = (ty >>> 0) - this.ChunkyRandom(P(cro, 0), (Math.imul(rx, top_rough) >>> 0) / 4 >>> 0) >>> 0 | 0;
    vtcs[2] = (tx >>> 0) - this.ChunkyRandom(P(cro, 0), (Math.imul(rx, side_rough) >>> 0) / 2 >>> 0) >>> 0 | 0;
    vtcs[3] = ty + (hgt / 2 | 0) | 0;
    vtcs[4] = (tx >>> 0) - this.ChunkyRandom(P(cro, 0), (Math.imul(rx, side_rough) >>> 0) / 4 >>> 0) >>> 0 | 0;
    vtcs[5] = ((ty + hgt | 0) >>> 0) + this.ChunkyRandom(P(cro, 0), (Math.imul(rx, bottom_rough) >>> 0) / 4 >>> 0) >>> 0 | 0;
    vtcs[6] = tx + (wdt / 2 | 0) | 0;
    vtcs[7] = ((ty + hgt | 0) >>> 0) + this.ChunkyRandom(P(cro, 0), (Math.imul(rx, bottom_rough) >>> 0) / 2 >>> 0) >>> 0 | 0;
    vtcs[8] = ((tx + wdt | 0) >>> 0) + this.ChunkyRandom(P(cro, 0), (Math.imul(rx, side_rough) >>> 0) / 4 >>> 0) >>> 0 | 0;
    vtcs[9] = ((ty + hgt | 0) >>> 0) + this.ChunkyRandom(P(cro, 0), (Math.imul(rx, bottom_rough) >>> 0) / 4 >>> 0) >>> 0 | 0;
    vtcs[10] = ((tx + wdt | 0) >>> 0) + this.ChunkyRandom(P(cro, 0), (Math.imul(rx, side_rough) >>> 0) / 2 >>> 0) >>> 0 | 0;
    vtcs[11] = ty + (hgt / 2 | 0) | 0;
    vtcs[12] = ((tx + wdt | 0) >>> 0) + this.ChunkyRandom(P(cro, 0), (Math.imul(rx, side_rough) >>> 0) / 4 >>> 0) >>> 0 | 0;
    vtcs[13] = (ty >>> 0) - this.ChunkyRandom(P(cro, 0), (Math.imul(rx, top_rough) >>> 0) / 4 >>> 0) >>> 0 | 0;
    vtcs[14] = tx + (wdt / 2 | 0) | 0;
    vtcs[15] = (ty >>> 0) - this.ChunkyRandom(P(cro, 0), (Math.imul(rx, top_rough) >>> 0) / 2 >>> 0) >>> 0 | 0;
    this.ForPolygon(d, P(vtcs, 0), 8, null, null, mcol, mcolBkg);
  }

  DrawSmoothOChunk(d, tx, ty, wdt, hgt, mcol, mcolBkg, flip, cro$) {
    const cro = [cro$];
    const vtcs = new Int32Array(8);
    let rx = $max(wdt / 2 | 0, 1) >>> 0;
    vtcs[0] = tx;
    vtcs[1] = ty;
    vtcs[2] = tx;
    vtcs[3] = ty + hgt | 0;
    vtcs[4] = tx + wdt | 0;
    vtcs[5] = ty + hgt | 0;
    vtcs[6] = tx + wdt | 0;
    vtcs[7] = ty;
    switch (flip) {
      case 0:
        vtcs[0] = tx + (wdt / 2 | 0) | 0;
        vtcs[1] = vtcs[1] + (hgt / 3 | 0) | 0;
        vtcs[7] = (vtcs[7] >>> 0) - this.ChunkyRandom(P(cro, 0), rx / 2 >>> 0) >>> 0 | 0;
        break;
      case 1:
        vtcs[2] = tx + (wdt / 2 | 0) | 0;
        vtcs[3] = vtcs[3] - (hgt / 3 | 0) | 0;
        vtcs[5] = (vtcs[5] >>> 0) + this.ChunkyRandom(P(cro, 0), rx / 2 >>> 0) >>> 0 | 0;
        break;
      case 2:
        vtcs[4] = tx + (wdt / 2 | 0) | 0;
        vtcs[5] = vtcs[5] - (hgt / 3 | 0) | 0;
        vtcs[3] = (vtcs[3] >>> 0) + this.ChunkyRandom(P(cro, 0), rx / 2 >>> 0) >>> 0 | 0;
        break;
      case 3:
        vtcs[6] = tx + (wdt / 2 | 0) | 0;
        vtcs[7] = vtcs[7] + (hgt / 3 | 0) | 0;
        vtcs[1] = (vtcs[1] >>> 0) - this.ChunkyRandom(P(cro, 0), rx / 2 >>> 0) >>> 0 | 0;
        break;
      case 4:
        vtcs[0] = tx + (wdt / 2 | 0) | 0;
        vtcs[1] = vtcs[1] + (hgt / 2 | 0) | 0;
        break;
      case 5:
        vtcs[2] = tx + (wdt / 2 | 0) | 0;
        vtcs[3] = vtcs[3] - (hgt / 2 | 0) | 0;
        break;
      case 6:
        vtcs[4] = tx + (wdt / 2 | 0) | 0;
        vtcs[5] = vtcs[5] - (hgt / 2 | 0) | 0;
        break;
      case 7:
        vtcs[6] = tx + (wdt / 2 | 0) | 0;
        vtcs[7] = vtcs[7] + (hgt / 2 | 0) | 0;
        break;
    }
    this.ForPolygon(d, P(vtcs, 0), 4, null, null, mcol, mcolBkg);
  }

  ChunkOZoom(d, sfcMap, sfcMapBkg, iMapX, iMapY, iMapWdt, iMapHgt, iTexture, iOffX = 0, iOffY = 0) {
    let entry = $.TextureMap.GetEntry(iTexture);
    let pMaterial = entry.GetMaterial();
    if (pMaterial == null) {
      return;
    }
    let texture_name = entry.GetTextureName();
    let texture = $.TextureMap.GetTexture$pi8(texture_name);
    let shape = texture != null ? texture.GetMaterialShape() : null;
    let iChunkType = $.Game.C4S.Landscape.FlatChunkShapes ? 0 /*C4M_Flat*/ : pMaterial.MapChunkType;
    const iMapWidth = [0];
    const iMapHeight = [0];
    sfcMap.GetSurfaceSize(P(iMapWidth, 0), P(iMapHeight, 0));
    iMapX = $.Clamp$i32$i32$i32(iMapX, 0, iMapWidth[0] - 1 | 0);
    iMapY = $.Clamp$i32$i32$i32(iMapY, 0, iMapHeight[0] - 1 | 0);
    iMapWdt = $.Clamp$i32$i32$i32(iMapWdt, 0, iMapWidth[0] - iMapX | 0);
    iMapHgt = $.Clamp$i32$i32$i32(iMapHgt, 0, iMapHeight[0] - iMapY | 0);
    let iChunkWidth = this.MapZoom;
    let iChunkHeight = this.MapZoom;
    for (let iY = iMapY; iY < (iMapY + iMapHgt | 0); iY = iY + 1 | 0) {
      let iToY = Math.imul(iY, iChunkHeight) + iOffY | 0;
      for (let iX = iMapX; iX < (iMapX + iMapWdt | 0); iX = iX + 1 | 0) {
        let MapPixel = sfcMap._GetPix(iX, iY);
        let MapPixelBkg = sfcMapBkg._GetPix(iX, iY);
        let iToX = Math.imul(iX, iChunkWidth) + iOffX | 0;
        if (MapPixel === iTexture) {
          this.DrawChunk(d, iToX, iToY, iChunkWidth, iChunkHeight, MapPixel, MapPixelBkg, iChunkType, ((iX << 16 | 0) + iY | 0) >>> 0);
        } else if (iChunkType === 2 || iChunkType === 5 || iChunkType === 4) {
          let below = sfcMap.GetPix(iX, iY + 1 | 0);
          let above = sfcMap.GetPix(iX, iY - 1 | 0);
          let left = sfcMap.GetPix(iX - 1 | 0, iY);
          let right = sfcMap.GetPix(iX + 1 | 0, iY);
          let leftBkg = sfcMapBkg.GetPix(iX - 1 | 0, iY);
          let rightBkg = sfcMapBkg.GetPix(iX + 1 | 0, iY);
          if (below === iTexture && above === iTexture && left === iTexture && right === iTexture) {
            continue;
          }
          let flat = iChunkType === 4 ? 4 : 0;
          if (iY < (iMapHeight[0] - 1 | 0) && below === iTexture) {
            if (iX > 0 && left === iTexture) {
              this.DrawSmoothOChunk(d, iToX, iToY, iChunkWidth, iChunkHeight, left, leftBkg, 3 + flat | 0, ((iX << 16 | 0) + iY | 0) >>> 0);
            }
            if (iX < (iMapWidth[0] - 1 | 0) && right === iTexture) {
              this.DrawSmoothOChunk(d, iToX, iToY, iChunkWidth, iChunkHeight, right, rightBkg, 0 + flat | 0, ((iX << 16 | 0) + iY | 0) >>> 0);
            }
          }
          if (iY > 0 && above === iTexture) {
            if (iX > 0 && left === iTexture) {
              this.DrawSmoothOChunk(d, iToX, iToY, iChunkWidth, iChunkHeight, left, leftBkg, 2 + flat | 0, ((iX << 16 | 0) + iY | 0) >>> 0);
            }
            if (iX < (iMapWidth[0] - 1 | 0) && right === iTexture) {
              this.DrawSmoothOChunk(d, iToX, iToY, iChunkWidth, iChunkHeight, right, rightBkg, 1 + flat | 0, ((iX << 16 | 0) + iY | 0) >>> 0);
            }
          }
        }
      }
    }
    if (shape != null && !$.Game.C4S.Landscape.FlatChunkShapes) {
      shape.Draw(sfcMap, sfcMapBkg, iMapX, iMapY, iMapWdt, iMapHgt, iTexture, iOffX, iOffY, this.MapZoom, pMaterial.MinShapeOverlap);
    }
  }

  TexOZoom(d, sfcMap, sfcMapBkg, iMapX, iMapY, iMapWdt, iMapHgt, dwpTextureUsage, iToX = 0, iToY = 0) {
    for (const iIndex of $.TextureMap.Order) {
      if (dwpTextureUsage.a[dwpTextureUsage.o + iIndex] > 0) {
        this.ChunkOZoom(d, sfcMap, sfcMapBkg, iMapX, iMapY, iMapWdt, iMapHgt, iIndex & 0xff, iToX, iToY);
      }
    }
    return true;
  }

  MapToSurface(d, sfcMap, sfcMapBkg, iMapX, iMapY, iMapWdt, iMapHgt, iToX, iToY, iToWdt, iToHgt, iOffX, iOffY) {
    this.Surface8.Clip(iToX, iToY, (iToX + iToWdt | 0) - 1 | 0, (iToY + iToHgt | 0) - 1 | 0);
    this.Surface8Bkg.Clip(iToX, iToY, (iToX + iToWdt | 0) - 1 | 0, (iToY + iToHgt | 0) - 1 | 0);
    $.pDraw.NoPrimaryClipper();
    iMapX = iMapX - (2 + ($.MaterialMap.max_shape_width / this.MapZoom | 0) | 0) | 0;
    iMapY = iMapY - (2 + ($.MaterialMap.max_shape_height / this.MapZoom | 0) | 0) | 0;
    iMapWdt = iMapWdt + (4 + Math.imul($.MaterialMap.max_shape_width / this.MapZoom | 0, 2) | 0) | 0;
    iMapHgt = iMapHgt + (4 + Math.imul($.MaterialMap.max_shape_height / this.MapZoom | 0, 2) | 0) | 0;
    const dwTexUsage = new Uint32Array(255);
    if (!GetTexUsage(sfcMap, sfcMapBkg, iMapX, iMapY, iMapWdt, iMapHgt, P(dwTexUsage, 0))) {
      return false;
    }
    if (!this.TexOZoom(d, sfcMap, sfcMapBkg, iMapX, iMapY, iMapWdt, iMapHgt, P(dwTexUsage, 0), iOffX, iOffY)) {
      return false;
    }
    this.Surface8.NoClip();
    this.Surface8Bkg.NoClip();
    return true;
  }

  MapToLandscape(d, sfcMap, sfcMapBkg, iMapX, iMapY, iMapWdt, iMapHgt, iOffsX = 0, iOffsY = 0, noClear = false) {
    0;
    const iMapWidth = [0];
    const iMapHeight = [0];
    const iLandscapeWidth = [0];
    const iLandscapeHeight = [0];
    sfcMap.GetSurfaceSize(P(iMapWidth, 0), P(iMapHeight, 0));
    this.Surface8.GetSurfaceSize(P(iLandscapeWidth, 0), P(iLandscapeHeight, 0));
    iMapX = $.Clamp$i32$i32$i32(iMapX, 0, iMapWidth[0] - 1 | 0);
    iMapY = $.Clamp$i32$i32$i32(iMapY, 0, iMapHeight[0] - 1 | 0);
    iMapWdt = $.Clamp$i32$i32$i32(iMapWdt, 0, iMapWidth[0] - iMapX | 0);
    iMapHgt = $.Clamp$i32$i32$i32(iMapHgt, 0, iMapHeight[0] - iMapY | 0);
    if (iMapWdt === 0 || iMapHgt === 0) {
      return true;
    }
    let To = new $.C4Rect();
    To.x = Math.imul(iMapX, this.MapZoom) + iOffsX | 0;
    To.y = Math.imul(iMapY, this.MapZoom) + iOffsY | 0;
    To.Wdt = Math.imul(iMapWdt, this.MapZoom);
    To.Hgt = Math.imul(iMapHgt, this.MapZoom);
    this.PrepareChange(d, To);
    if (!noClear) {
      this.Surface8.ClearBox8Only(To.x, To.y, To.Wdt, To.Hgt);
      this.Surface8Bkg.ClearBox8Only(To.x, To.y, To.Wdt, To.Hgt);
    }
    this.MapToSurface(d, sfcMap, sfcMapBkg, iMapX, iMapY, iMapWdt, iMapHgt, To.x, To.y, To.Wdt, To.Hgt, iOffsX, iOffsY);
    this.FinishChange(d, To.$clone());
    return true;
  }

  InitBorderPix() {
    0;
    if (this.Width === 0) {
      return true;
    }
    this.TopRowPix.length = 0;
    this.BottomRowPix.length = 0;
    this.LeftColPix.length = 0;
    this.RightColPix.length = 0;
    let top_open_flag = $.Game.C4S.Landscape.TopOpen;
    let bottom_open_flag = $.Game.C4S.Landscape.BottomOpen;
    if (top_open_flag === 2 && this.Map == null) {
      top_open_flag = 1;
    }
    if (bottom_open_flag === 2 && this.Map == null) {
      bottom_open_flag = 1;
    }
    switch (top_open_flag) {
      case 0:
        seq_assign(this.TopRowPix, $u64n(this.Width), $.MCVehic);
        break;
      case 2:
        resize(this.TopRowPix, $u64n(this.Width), () => 0);
        for (let x = 0; x < this.Width; x = x + 1 | 0) {
          let map_pix = this.MapBkg.GetPix(x / this.MapZoom | 0, 0);
          this.TopRowPix[$u64n(x)] = (map_pix !== 0 ? $.MCVehic : 0) & 0xff;
        }
        break;
      default:
        seq_assign(this.TopRowPix, $u64n(this.Width), 0);
        break;
    }
    switch (bottom_open_flag) {
      case 0:
        seq_assign(this.BottomRowPix, $u64n(this.Width), $.MCVehic);
        break;
      case 2:
        resize(this.BottomRowPix, $u64n(this.Width), () => 0);
        for (let x = 0; x < this.Width; x = x + 1 | 0) {
          let map_pix = this.MapBkg.GetPix(x / this.MapZoom | 0, this.Map.Hgt - 1 | 0);
          this.BottomRowPix[$u64n(x)] = (map_pix !== 0 ? $.MCVehic : 0) & 0xff;
        }
        break;
      default:
        seq_assign(this.BottomRowPix, $u64n(this.Width), 0);
        break;
    }
    if ($.Game.C4S.Landscape.AutoScanSideOpen !== 0) {
      let only_bg = $.Game.C4S.Landscape.AutoScanSideOpen === 2;
      resize(this.LeftColPix, $u64n(this.Height), () => 0);
      resize(this.RightColPix, $u64n(this.Height), () => 0);
      let map_pix = 0;
      for (let y = 0; y < this.Height; y = y + 1 | 0) {
        map_pix = this.MapBkg.GetPix(0, y / this.MapZoom | 0);
        if (!only_bg) {
          map_pix = (map_pix + this.Map.GetPix(0, y / this.MapZoom | 0) | 0) & 0xff;
        }
        this.LeftColPix[$u64n(y)] = (map_pix !== 0 ? $.MCVehic : 0) & 0xff;
        map_pix = this.MapBkg.GetPix(this.Map.Wdt - 1 | 0, y / this.MapZoom | 0);
        if (!only_bg) {
          map_pix = (map_pix + this.Map.GetPix(this.Map.Wdt - 1 | 0, y / this.MapZoom | 0) | 0) & 0xff;
        }
        this.RightColPix[$u64n(y)] = (map_pix !== 0 ? $.MCVehic : 0) & 0xff;
      }
    } else {
      let LeftOpen = $min(this.Height, $.Game.C4S.Landscape.LeftOpen);
      let RightOpen = $min(this.Height, $.Game.C4S.Landscape.RightOpen);
      seq_assign(this.LeftColPix, $u64n(this.Height), $.MCVehic);
      seq_assign(this.RightColPix, $u64n(this.Height), $.MCVehic);
      for (let cy = 0; cy < LeftOpen; cy = cy + 1 | 0) {
        this.LeftColPix[$u64n(cy)] = 0;
      }
      for (let cy = 0; cy < RightOpen; cy = cy + 1 | 0) {
        this.RightColPix[$u64n(cy)] = 0;
      }
    }
    return true;
  }

  GetMapColorIndex(szMaterial, szTexture, rbyCol) {
    if ($.SEqual(szMaterial, S("Sky"))) {
      rbyCol.a[rbyCol.o] = 0;
    } else {
      rbyCol.a[rbyCol.o] = $.TextureMap.GetIndex(szMaterial, szTexture) & 0xff;
      if (rbyCol.a[rbyCol.o] === 0) {
        return false;
      }
    }
    return true;
  }

  CreateMap(sfcMap, sfcMapBkg) {
    let $t1, $t2;
    const iWidth = [0];
    const iHeight = [0];
    $.Game.C4S.Landscape.GetMapSize(P(iWidth, 0), P(iHeight, 0), $.Game.StartupPlayerCount);
    let fg_map = new $.CSurface8().init$i32$i32(iWidth[0], iHeight[0]);
    let MapCreator = new $.C4MapCreator().init();
    MapCreator.Create(fg_map, $.Game.C4S.Landscape, $.TextureMap, $.Game.StartupPlayerCount);
    let bg_map = this.CreateDefaultBkgSurface(fg_map, false);
    if (bg_map == null) {
      return false;
    }
    sfcMap.a[sfcMap.o] = ($t1 = fg_map, fg_map = null, $t1);
    sfcMapBkg.a[sfcMapBkg.o] = ($t2 = bg_map, bg_map = null, $t2);
    return true;
  }

  CreateMapS2(ScenFile, sfcMap, sfcMapBkg) {
    if (!ScenFile.AccessEntry(S("Landscape.txt"))) {
      return false;
    }
    if (this.pMapCreator == null) {
      this.pMapCreator = new $.C4MapCreatorS2().init($.Game.C4S.Landscape, $.TextureMap, $.MaterialMap, $.Game.StartupPlayerCount);
    }
    this.pMapCreator.ReadFile(S("Landscape.txt"), ScenFile);
    if (!this.pMapCreator.Render(null, sfcMap, sfcMapBkg)) {
      return false;
    }
    return true;
  }

  Mat2Pal() {
    if (this.Surface8 == null || this.Surface8Bkg == null) {
      return false;
    }
    let tex = 0;
    for (tex = 0; tex < 255; tex = tex + 1 | 0) {
      let pTex = $.TextureMap.GetEntry(tex);
      if (pTex == null || pTex.isNull()) {
        continue;
      }
      let dwPix = pTex.GetPattern().PatternClr(0, 0);
      this.Surface8.pPal.Colors[$.MatTex2PixCol(tex)] = dwPix;
      this.Surface8Bkg.pPal.Colors[$.MatTex2PixCol(tex)] = dwPix;
    }
    return true;
  }

  UpdatePixCnt(d, Rect, fCheck = false) {
    let PixCntWidth = (this.Width + 16 | 0) / 17 | 0;
    for (let y = $max(0, Rect.y / 15 | 0); y < $min(this.PixCntPitch, ((Rect.y + Rect.Hgt | 0) + 14 | 0) / 15 | 0); y = y + 1 | 0) {
      for (let x = $max(0, Rect.x / 17 | 0); x < $min(PixCntWidth, ((Rect.x + Rect.Wdt | 0) + 16 | 0) / 17 | 0); x = x + 1 | 0) {
        let iCnt = 0;
        for (let x2 = Math.imul(x, 17); x2 < $min(Math.imul(x, 17) + 17 | 0, this.Width); x2 = x2 + 1 | 0) {
          for (let y2 = Math.imul(y, 15); y2 < $min(Math.imul(y, 15) + 15 | 0, this.Height); y2 = y2 + 1 | 0) {
            if (d._GetDensity(x2, y2) !== 0) {
              iCnt = iCnt + 1 | 0;
            }
          }
        }
        if (fCheck) {
          0;
        }
        this.PixCnt[$u64n(Math.imul(x, this.PixCntPitch) + y | 0)] = iCnt & 0xff;
      }
    }
  }

  UpdateMatCnt(d, Rect, fPlus) {
    let $t1, $t2, $t3, $t4, $t5, $t6, $t7;
    Rect.Intersect(new $.C4Rect().init$i32$i32$i32$i32(0, 0, this.Width, this.Height));
    if (Rect.Hgt === 0 || Rect.Wdt === 0) {
      return;
    }
    let iMul = fPlus ? 1 : -1;
    for (let x = 0; x < Rect.Wdt; x = x + 1 | 0) {
      let iHgt = 0;
      let y = 0;
      for (y = 1; y < Rect.Hgt; y = y + 1 | 0) {
        let iMat = d._GetMat(Rect.x + x | 0, (Rect.y + y | 0) - 1 | 0);
        if (iMat === d._GetMat(Rect.x + x | 0, Rect.y + y | 0)) {
          iHgt = iHgt + 1 | 0;
        } else {
          if (iMat >= 0) {
            ($t1 = P(this.MatCount, $u64n(iMat)), $t1.a[$t1.o] = $t1.a[$t1.o] + (Math.imul(iMul, iHgt + 1 | 0) >>> 0) >>> 0);
            {
              let iMinHgt = $oidx($.MaterialMap.Map, iMat).MinHeightCount;
              if (iMinHgt !== 0) {
                let iAddedHeight = 0;
                if (Rect.y !== 0 && (iHgt + 1 | 0) === y) {
                  iAddedHeight = d.GetMatHeight(Rect.x + x | 0, Rect.y - 1 | 0, -1, iMat, iMinHgt);
                }
                if (((iHgt + 1 | 0) + iAddedHeight | 0) >= iMinHgt) {
                  ($t2 = P(this.EffectiveMatCount, $u64n(iMat)), $t2.a[$t2.o] = $t2.a[$t2.o] + (Math.imul(iMul, iHgt + 1 | 0) >>> 0) >>> 0);
                  if (iAddedHeight < iMinHgt) {
                    ($t3 = P(this.EffectiveMatCount, $u64n(iMat)), $t3.a[$t3.o] = $t3.a[$t3.o] + (Math.imul(iMul, iAddedHeight) >>> 0) >>> 0);
                  }
                }
              }
            }
          }
          iHgt = 0;
        }
      }
      let iMat = d._GetMat(Rect.x + x | 0, (Rect.y + Rect.Hgt | 0) - 1 | 0);
      if (iMat >= 0) {
        ($t4 = P(this.MatCount, $u64n(iMat)), $t4.a[$t4.o] = $t4.a[$t4.o] + (Math.imul(iMul, iHgt + 1 | 0) >>> 0) >>> 0);
        {
          let iMinHgt = $oidx($.MaterialMap.Map, iMat).MinHeightCount;
          if (iMinHgt !== 0) {
            let iAddedHeight1 = 0;
            let iAddedHeight2 = 0;
            if (Rect.y !== 0 && (iHgt + 1 | 0) === Rect.Hgt) {
              iAddedHeight1 = d.GetMatHeight(Rect.x + x | 0, Rect.y - 1 | 0, -1, iMat, iMinHgt);
            }
            if ((Rect.y + y | 0) < this.Height) {
              iAddedHeight2 = d.GetMatHeight(Rect.x + x | 0, Rect.y + Rect.Hgt | 0, 1, iMat, iMinHgt);
            }
            if ((((iHgt + 1 | 0) + iAddedHeight1 | 0) + iAddedHeight2 | 0) >= $oidx($.MaterialMap.Map, iMat).MinHeightCount) {
              ($t5 = P(this.EffectiveMatCount, $u64n(iMat)), $t5.a[$t5.o] = $t5.a[$t5.o] + (Math.imul(iMul, iHgt + 1 | 0) >>> 0) >>> 0);
              if (iAddedHeight1 < iMinHgt) {
                ($t6 = P(this.EffectiveMatCount, $u64n(iMat)), $t6.a[$t6.o] = $t6.a[$t6.o] + (Math.imul(iMul, iAddedHeight1) >>> 0) >>> 0);
              }
              if (iAddedHeight2 < iMinHgt) {
                ($t7 = P(this.EffectiveMatCount, $u64n(iMat)), $t7.a[$t7.o] = $t7.a[$t7.o] + (Math.imul(iMul, iAddedHeight2) >>> 0) >>> 0);
              }
            }
          }
        }
      }
    }
  }

  PrepareChange(d, BoundingBox, updateMatCnt = true) {
    let SolidMaskRect = BoundingBox.$clone();
    if (this.pLandscapeRender != null) {
      SolidMaskRect.$assign(this.pLandscapeRender.GetAffectedRect(this.pLandscapeRender.GetAffectedRect(SolidMaskRect.$clone())));
    }
    for (let pSolid = $.C4SolidMask.Last; pSolid != null; pSolid = pSolid.Prev) {
      pSolid.RemoveTemporary(SolidMaskRect.$clone());
    }
    if (updateMatCnt) {
      this.UpdateMatCnt(d, BoundingBox.$clone(), false);
    }
  }

  FinishChange(d, BoundingBox, updateMatAndPixCnt = true) {
    BoundingBox.Intersect(new $.C4Rect().init$i32$i32$i32$i32(0, 0, this.Width, this.Height));
    if (BoundingBox.Wdt === 0 || BoundingBox.Hgt === 0) {
      return;
    }
    if (this.pLandscapeRender != null) {
      this.pLandscapeRender.Update(BoundingBox.$clone(), d);
    }
    if (updateMatAndPixCnt) {
      this.UpdateMatCnt(d, BoundingBox.$clone(), true);
    }
    let SolidMaskRect = BoundingBox.$clone();
    if (this.pLandscapeRender != null) {
      SolidMaskRect.$assign(this.pLandscapeRender.GetAffectedRect(this.pLandscapeRender.GetAffectedRect(SolidMaskRect.$clone())));
    }
    for (let pSolid = $.C4SolidMask.First; pSolid != null; pSolid = pSolid.Next) {
      pSolid.Repair(SolidMaskRect.$clone());
    }
    $.C4SolidMask.CheckConsistency();
    if (updateMatAndPixCnt) {
      this.UpdatePixCnt(d, BoundingBox);
    }
    if (this.pFoW != null) {
      this.pFoW.Invalidate(BoundingBox.$clone());
      this.pFoW.Ambient.UpdateFromLandscape(d, BoundingBox);
    }
  }

  DrawLineLandscape(iX, iY, iGrade, line_color, line_color_bkg) {
    this.Surface8.Circle(iX, iY, iGrade, line_color);
    this.Surface8Bkg.Circle(iX, iY, iGrade, line_color_bkg);
    return true;
  }

  DrawLineMap(iX, iY, iRadius, line_color, line_color_bkg) {
    if (this.Map == null) {
      return false;
    }
    if (iRadius === 1) {
      this.Map.SetPix(iX, iY, line_color);
      this.MapBkg.SetPix(iX, iY, line_color_bkg);
    } else {
      this.Map.Circle(iX, iY, iRadius, line_color);
      this.MapBkg.Circle(iX, iY, iRadius, line_color_bkg);
    }
    return true;
  }

  GetBridgeMatConversion(d, for_material_col) {
    let for_material = d.GetPixMat(for_material_col & 0xff);
    if (for_material < 0 || for_material >= $.MaterialMap.Num) {
      return null;
    }
    if (!(this.BridgeMatConversion[$u64n(for_material_col)] != null)) {
      let conv_map = P(new Uint8Array(255), 0);
      for (let i = 0; i < 255; i = i + 1 | 0) {
        if ($.MatDensity(for_material) >= d.GetPixDensity(i & 0xff)) {
          conv_map[$u64n(i)] = for_material_col & 0xff;
        } else {
          conv_map[$u64n(i)] = i & 0xff;
        }
      }
      (this.BridgeMatConversion[$u64n(for_material_col)] = conv_map, conv_map = null);
    }
    return this.BridgeMatConversion[$u64n(for_material_col)];
  }

  SaveInternal(d, hGroup) {
    const szTempLandscape = new Int8Array(4097);
    $.SCopy$pi8$pi8($.Config.AtTempPath(S("~Landscape.tmp")), P(szTempLandscape, 0));
    $.MakeTempFilename$pi8(P(szTempLandscape, 0));
    if (!this.Surface8.Save(P(szTempLandscape, 0))) {
      return false;
    }
    if (!hGroup.Move(P(szTempLandscape, 0), S("LandscapeFg.bmp"))) {
      return false;
    }
    $.SCopy$pi8$pi8($.Config.AtTempPath(S("~LandscapeBkg.tmp")), P(szTempLandscape, 0));
    $.MakeTempFilename$pi8(P(szTempLandscape, 0));
    if (!this.Surface8Bkg.Save(P(szTempLandscape, 0))) {
      return false;
    }
    if (!hGroup.Move(P(szTempLandscape, 0), S("LandscapeBg.bmp"))) {
      return false;
    }
    if (this.fMapChanged && this.Map != null) {
      if (!d.SaveMap(hGroup)) {
        return false;
      }
    }
    if (!d.SaveTextures(hGroup)) {
      return false;
    }
    return true;
  }

  SaveDiffInternal(d, hGroup, fSyncSave) {
    0;
    if (this.pInitial == null || this.pInitialBkg == null) {
      return false;
    }
    let fChanged = false;
    let fChangedBkg = false;
    ;
    if (!fSyncSave) {
      for (let y = 0; y < this.Height; y = y + 1 | 0) {
        for (let x = 0; x < this.Width; x = x + 1 | 0) {
          if (this.pInitial[$u64n(Math.imul(y, this.Width) + x | 0)] === this.Surface8._GetPix(x, y)) {
            this.Surface8.SetPix(x, y, 255);
          } else {
            fChanged = true;
          }
          if (this.pInitialBkg[$u64n(Math.imul(y, this.Width) + x | 0)] === this.Surface8Bkg._GetPix(x, y)) {
            this.Surface8Bkg.SetPix(x, y, 255);
          } else {
            fChangedBkg = true;
          }
        }
      }
    }
    if (fSyncSave || fChanged) {
      if (!this.Surface8.Save($.Config.AtTempPath(S("~Landscape.tmp")))) {
        return false;
      }
      if (!hGroup.Move($.Config.AtTempPath(S("~Landscape.tmp")), S("DiffLandscape.bmp"))) {
        return false;
      }
    }
    if (fSyncSave || fChangedBkg) {
      if (!this.Surface8Bkg.Save($.Config.AtTempPath(S("~LandscapeBkg.tmp")))) {
        return false;
      }
      if (!hGroup.Move($.Config.AtTempPath(S("~LandscapeBkg.tmp")), S("DiffLandscapeBkg.bmp"))) {
        return false;
      }
    }
    if (!fSyncSave) {
      for (let y = 0; y < this.Height; y = y + 1 | 0) {
        for (let x = 0; x < this.Width; x = x + 1 | 0) {
          if (this.Surface8._GetPix(x, y) === 255) {
            this.Surface8.SetPix(x, y, this.pInitial[$u64n(Math.imul(y, this.Width) + x | 0)]);
          }
          if (this.Surface8Bkg._GetPix(x, y) === 255) {
            this.Surface8Bkg.SetPix(x, y, this.pInitialBkg[$u64n(Math.imul(y, this.Width) + x | 0)]);
          }
        }
      }
    }
    if (this.fMapChanged && this.Map != null) {
      if (!d.SaveMap(hGroup)) {
        return false;
      }
    }
    if (!d.SaveTextures(hGroup)) {
      return false;
    }
    return true;
  }

  ForPolygon(d, vtcs, length, callback, mats_count = null, col = 0, colBkg = 0, conversion_table = null) {
    let c = 0;
    let x1 = 0;
    let x2 = 0;
    let y = 0;
    let top = 0x7fffffff;
    let bottom = -0x80000000;
    let i1 = null;
    let i2 = null;
    let edge = null;
    let next_edge = null;
    let edgebuf = null;
    let active_edges = null;
    let inactive_edges = null;
    let use_qpb = false;
    let amount = 0;
    if (length <= 20) {
      edgebuf = $oat($.QuickPolyBuf, 0);
      use_qpb = true;
    } else if (!((edgebuf = $oat($oarr($u64n(length), () => new CPolyEdge()), 0)) != null)) {
      return 0;
    }
    edge = edgebuf;
    i1 = vtcs;
    i2 = $padd(vtcs, Math.imul(length - 1 | 0, 2));
    for (c = 0; c < length; c = c + 1 | 0) {
      if (i1.a[i1.o + 1] !== i2.a[i2.o + 1]) {
        fill_edge_structure(edge, i1, i2);
        if (edge.bottom >= edge.y) {
          if (edge.y < top) {
            top = edge.y;
          }
          if (edge.bottom > bottom) {
            bottom = edge.bottom;
          }
          inactive_edges = add_edge(inactive_edges, edge, 0);
          edge = $oadd(edge, 1);
        }
      }
      i2 = i1;
      i1 = i1.add(2);
    }
    for (c = top; c <= bottom; c = c + 1 | 0) {
      edge = inactive_edges;
      while (edge != null && edge.y === c) {
        next_edge = edge.next;
        inactive_edges = remove_edge(inactive_edges, edge);
        active_edges = add_edge(active_edges, edge, 1);
        edge = next_edge;
      }
      edge = active_edges;
      while (edge != null && edge.next != null) {
        x1 = edge.x >> 16;
        x2 = (edge.next.x + edge.next.w | 0) >> 16;
        y = c;
        if (x1 > x2) {
          [x1, x2] = [x2, x1];
        }
        if (callback != null) {
          for (let xcnt = (x2 - x1 | 0) - 1 | 0; xcnt >= 0; xcnt = xcnt - 1 | 0) {
            let pix = d.GetPix(x1 + xcnt | 0, y);
            if (conversion_table == null || conversion_table.a[conversion_table.o + pix] !== 0) {
              let mat = d.GetPixMat(pix);
              if (callback(x1 + xcnt | 0, y)) {
                if (mats_count != null) {
                  mats_count.Add(mat, 1);
                  amount = amount + 1 | 0;
                }
              }
            }
          }
        } else if (conversion_table != null) {
          for (let xcnt = (x2 - x1 | 0) - 1 | 0; xcnt >= 0; xcnt = xcnt - 1 | 0) {
            let pix = conversion_table.a[conversion_table.o + d.GetPix(x1 + xcnt | 0, y)];
            this.Surface8.SetPix(x1 + xcnt | 0, y, pix);
            if (colBkg !== 255) {
              this.Surface8Bkg.SetPix(x1 + xcnt | 0, y, colBkg);
            }
          }
        } else {
          for (let xcnt = (x2 - x1 | 0) - 1 | 0; xcnt >= 0; xcnt = xcnt - 1 | 0) {
            if (col !== 255) {
              this.Surface8.SetPix(x1 + xcnt | 0, y, col);
            }
            if (colBkg !== 255) {
              this.Surface8Bkg.SetPix(x1 + xcnt | 0, y, colBkg);
            }
          }
        }
        edge = edge.next.next;
      }
      edge = active_edges;
      while (edge != null) {
        next_edge = edge.next;
        if (c >= edge.bottom) {
          active_edges = remove_edge(active_edges, edge);
        } else {
          edge.x = edge.x + edge.dx | 0;
          while (edge.prev != null && (edge.x + (edge.w / 2 | 0) | 0) < (edge.prev.x + (edge.prev.w / 2 | 0) | 0)) {
            if (edge.next != null) {
              edge.next.prev = edge.prev;
            }
            edge.prev.next = edge.next;
            edge.next = edge.prev;
            edge.prev = edge.prev.prev;
            edge.next.prev = edge;
            if (edge.prev != null) {
              edge.prev.next = edge;
            } else {
              active_edges = edge;
            }
          }
        }
        edge = next_edge;
      }
    }
    if (!use_qpb) {
      $delete(edgebuf);
    }
    return amount;
  }

  CreateDefaultBkgSurface(sfcFg, msbAsIft) {
    let sfcBg = new $.CSurface8().init$v();
    if (!sfcBg.Create(sfcFg.Wdt, sfcFg.Hgt)) {
      return null;
    }
    for (let y = 0; y < sfcFg.Hgt; y = y + 1 | 0) {
      for (let x = 0; x < sfcFg.Wdt; x = x + 1 | 0) {
        let fgPix = sfcFg._GetPix(x, y);
        let bgPix = 0;
        if (msbAsIft) {
          if ((fgPix & 128) !== 0) {
            fgPix = (fgPix & -129) & 0xff;
            sfcFg._SetPix(x, y, fgPix);
            bgPix = this.DefaultBkgMat(fgPix);
          } else {
            bgPix = 0;
          }
        } else {
          bgPix = this.DefaultBkgMat(fgPix);
        }
        sfcBg._SetPix(x, y, bgPix);
      }
    }
    return sfcBg;
  }

  DigMaterial2Objects(tx, ty, mat_list, pCollect$ = null) {
    const pCollect = [pCollect$];
    let pars = new $.C4AulParSet().init$rpC4Object(P(pCollect, 0));
    for (let mat = 0; mat < $.MaterialMap.Num; mat = mat + 1 | 0) {
      if (mat_list.Amount[mat] !== 0) {
        if ($oidx($.MaterialMap.Map, mat).Dig2Object.op_ne($.C4ID.None)) {
          if ($oidx($.MaterialMap.Map, mat).Dig2ObjectRatio !== 0) {
            while (mat_list.Amount[mat] >= $oidx($.MaterialMap.Map, mat).Dig2ObjectRatio) {
              mat_list.Amount[mat] = mat_list.Amount[mat] - $oidx($.MaterialMap.Map, mat).Dig2ObjectRatio | 0;
              let pObj = $.Game.CreateObject$C4ID$pC4Object$i32$i32$i32$i32$b$C4Fixed$C4Fixed$C4Fixed$i32($oidx($.MaterialMap.Map, mat).Dig2Object.$clone(), null, -1, tx, ty);
              if (pObj == null || pObj.Status === 0) {
                continue;
              }
              if (pCollect[0] != null && pCollect[0].Status !== 0) {
                pObj.Controller = pCollect[0].Controller;
              }
              pObj.Call$pi8$pC4AulParSet$b(S("~DugOut"), pars.op_and());
              if (pObj.Status === 0 || pCollect[0] == null || pCollect[0].Status === 0 || pObj.Contained.op_C4Object_() != null) {
                continue;
              }
              let pars$2 = new $.C4AulParSet().init$mC4Value($.C4VObj(pObj));
              pCollect[0].Call$pi8$pC4AulParSet$b(S("~DigOutObject"), pars$2.op_and());
              if (pObj.Status === 0 || pCollect[0].Status === 0 || pObj.Contained.op_C4Object_() != null) {
                continue;
              }
              if ($oidx($.MaterialMap.Map, mat).Dig2ObjectCollect !== 0) {
                if (pCollect[0] != null && pCollect[0].Status !== 0 && pObj != null && pObj.Status !== 0) {
                  if (!pCollect[0].Collect(pObj)) {
                    if ($oidx($.MaterialMap.Map, mat).Dig2ObjectCollect === 2) {
                      pObj.AssignRemoval();
                      mat_list.Amount[mat] = $oidx($.MaterialMap.Map, mat).Dig2ObjectRatio;
                      break;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  BlastMaterial2Objects(tx, ty, mat_list, caused_by, str, out_objects) {
    for (let mat = 0; mat < $.MaterialMap.Num; mat = mat + 1 | 0) {
      if (mat_list.Amount[mat] !== 0) {
        let cast_strength = str;
        let pxsamount = 0;
        let blastamount = 0;
        if ($oidx($.MaterialMap.Map, mat).Blast2PXSRatio !== 0) {
          pxsamount = mat_list.Amount[mat] / $oidx($.MaterialMap.Map, mat).Blast2PXSRatio | 0;
          $.PXS.Cast(mat, pxsamount, tx, ty, Math.imul(cast_strength, 2));
        }
        if ($oidx($.MaterialMap.Map, mat).Blast2Object.op_ne($.C4ID.None)) {
          if ($oidx($.MaterialMap.Map, mat).Blast2ObjectRatio !== 0) {
            blastamount = mat_list.Amount[mat] / $oidx($.MaterialMap.Map, mat).Blast2ObjectRatio | 0;
            $.Game.CastObjects($oidx($.MaterialMap.Map, mat).Blast2Object.$clone(), null, blastamount, cast_strength, tx, ty, -1, caused_by, out_objects);
          }
        }
        mat_list.Amount[mat] = mat_list.Amount[mat] - $max(Math.imul(blastamount, $oidx($.MaterialMap.Map, mat).Blast2ObjectRatio), Math.imul(pxsamount, $oidx($.MaterialMap.Map, mat).Blast2PXSRatio)) | 0;
      }
    }
  }

  DigFreePix(d, tx, ty) {
    let mat = d.GetMat(tx, ty);
    if ($.MatValid(mat)) {
      if ($oidx($.MaterialMap.Map, mat).DigFree !== 0) {
        d.ClearPix(tx, ty);
        d.CheckInstabilityRange(tx, ty);
        return true;
      }
    }
    return false;
  }

  DigFreePixNoInstability(d, tx, ty) {
    let mat = d.GetMat(tx, ty);
    if ($.MatValid(mat)) {
      if ($oidx($.MaterialMap.Map, mat).DigFree !== 0) {
        d.ClearPix(tx, ty);
        return true;
      }
    }
    return false;
  }

  BlastFreePix(d, tx, ty) {
    let mat = d.GetMat(tx, ty);
    if ($.MatValid(mat)) {
      if ($oidx($.MaterialMap.Map, mat).BlastFree !== 0) {
        d.ClearPix(tx, ty);
        d.CheckInstabilityRange(tx, ty);
        return true;
      } else if ($oidx($.MaterialMap.Map, mat).BlastShiftTo !== 0) {
        d.SetPix2(tx, ty, $.MatTex2PixCol($oidx($.MaterialMap.Map, mat).BlastShiftTo), 255);
      }
    }
    return false;
  }

  ShakeFreePix(d, tx, ty) {
    let mat = d.GetMat(tx, ty);
    if ($.MatValid(mat)) {
      if ($oidx($.MaterialMap.Map, mat).DigFree !== 0) {
        d.ClearPix(tx, ty);
        $.PXS.Create(mat, $.itofix$i32(tx), $.itofix$i32(ty));
        d.CheckInstabilityRange(tx, ty);
        return true;
      }
    }
    return false;
  }

  PrepareFreeShape(BoundingBox, by_object) {
    let fo_inrect = new $.C4FindObjectInRect().init(BoundingBox);
    let fo_insolid = new $.C4FindObjectOCF().init(0x200000);
    let fo_layer = new $.C4FindObjectLayer().init((by_object != null ? by_object.Layer.$clone() : new $.C4ObjectPtr().init$pC4Object(null)).op_C4Object_());
    const fo_list = [fo_inrect, fo_insolid, fo_layer];
    let fo_srch = new $.C4FindObjectAndStatic().init(3, P(fo_list, 0));
    return fo_srch.FindMany$C4ObjectList$C4LSectors($.Objects, $.Objects.Sectors);
  }

  PostFreeShape(dig_objects, by_object$) {
    const by_object = [by_object$];
    if (by_object[0] != null) {
      for (let i = 0; i < dig_objects.GetSize(); i = i + 1 | 0) {
        const dig_object = [dig_objects.GetItem(i).getObj()];
        if (dig_object[0] != null && !GBackSolid(dig_object[0].GetX(), dig_object[0].GetY())) {
          if (dig_object[0] !== by_object[0]) {
            if (dig_object[0].Contained.op_not() && dig_object[0].Status !== 0) {
              let pars = new $.C4AulParSet().init$rpC4Object(P(by_object, 0));
              dig_object[0].Call$pi8$pC4AulParSet$b(S("~DugOut"), pars.op_and());
              if (dig_object[0].Status !== 0 && by_object[0].Status !== 0) {
                let pars$2 = new $.C4AulParSet().init$rpC4Object(P(dig_object, 0));
                by_object[0].Call$pi8$pC4AulParSet$b(S("~DigOutObject"), pars$2.op_and());
              }
            }
          }
        }
      }
    }
  }

  DefaultBkgMat(fg) {
    return $.TextureMap.DefaultBkgMatTex(fg);
  }

  None() {
    this.Surface8 = null;
    this.Surface8Bkg = null;
    this.Map = null;
    this.MapBkg = null;
    this.pLandscapeRender = null;
    this.TopRowPix = [];
    this.BottomRowPix = [];
    this.LeftColPix = [];
    this.RightColPix = [];
    this.PixCntPitch = 0;
    this.PixCnt = [];
    this.Relights = $oarr(50, () => new $.C4Rect());
    this.BridgeMatConversion = $oarr(255, () => null);
    this.mode = 0 /*Undefined*/;
    this.Width = 0;
    this.Height = 0;
    this.MapWidth = 0;
    this.MapHeight = 0;
    this.MapZoom = 0;
    this.MatCount = new Uint32Array(125);
    this.EffectiveMatCount = new Uint32Array(125);
    this.NoScan = false;
    this.ScanX = 0;
    this.ScanSpeed = 2;
    this.Gravity = $.DefaultGravAccel.$clone();
    this.Modulation = 0;
    this.MapSeed = 0;
    this.Sky = new $.C4Sky().init();
    this.pMapCreator = null;
    this.fMapChanged = false;
    this.pInitial = null;
    this.pInitialBkg = null;
    this.pFoW = null;
    return this;
  }

  $clone() { return new C4Landscape$P_landscape_C4Landscape().$assign(this); }
  $assign(o) {
    this.Surface8 = o.Surface8;
    this.Surface8Bkg = o.Surface8Bkg;
    this.Map = o.Map;
    this.MapBkg = o.MapBkg;
    this.pLandscapeRender = o.pLandscapeRender;
    this.TopRowPix = o.TopRowPix.slice();
    this.BottomRowPix = o.BottomRowPix.slice();
    this.LeftColPix = o.LeftColPix.slice();
    this.RightColPix = o.RightColPix.slice();
    this.Pix2Mat = o.Pix2Mat.slice();
    this.Pix2Dens = o.Pix2Dens.slice();
    this.Pix2Place = o.Pix2Place.slice();
    this.Pix2Light = o.Pix2Light.slice();
    this.PixCntPitch = o.PixCntPitch;
    this.PixCnt = o.PixCnt.slice();
    this.Relights = o.Relights.slice();
    this.BridgeMatConversion = o.BridgeMatConversion.slice();
    this.mode = o.mode;
    this.Width = o.Width;
    this.Height = o.Height;
    this.MapWidth = o.MapWidth;
    this.MapHeight = o.MapHeight;
    this.MapZoom = o.MapZoom;
    this.MatCount = o.MatCount.slice();
    this.EffectiveMatCount = o.EffectiveMatCount.slice();
    this.NoScan = o.NoScan;
    this.ScanX = o.ScanX;
    this.ScanSpeed = o.ScanSpeed;
    this.Gravity.$assign(o.Gravity);
    this.Modulation = o.Modulation;
    this.MapSeed = o.MapSeed;
    this.Sky.$assign(o.Sky);
    this.pMapCreator = o.pMapCreator;
    this.fMapChanged = o.fMapChanged;
    this.pInitial = o.pInitial;
    this.pInitialBkg = o.pInitialBkg;
    this.pFoW = o.pFoW;
    return this;
  }
}

export class CPolyEdge {
  y = 0;
  bottom = 0;
  x = 0;
  dx = 0;
  w = 0;
  prev = null;
  next = null;

  $clone() { return new CPolyEdge().$assign(this); }
  $assign(o) {
    this.y = o.y;
    this.bottom = o.bottom;
    this.x = o.x;
    this.dx = o.dx;
    this.w = o.w;
    this.prev = o.prev;
    this.next = o.next;
    return this;
  }
}



export function ForLine(x1, y1, x2, y2, fnCallback, lastx = null, lasty = null) {
  let d = 0;
  let dx = 0;
  let dy = 0;
  let aincr = 0;
  let bincr = 0;
  let xincr = 0;
  let yincr = 0;
  let x = 0;
  let y = 0;
  if ($.Abs$i32(x2 - x1 | 0) < $.Abs$i32(y2 - y1 | 0)) {
    if (y1 > y2) {
      [x1, x2] = [x2, x1];
      [y1, y2] = [y2, y1];
    }
    xincr = x2 > x1 ? 1 : -1;
    dy = y2 - y1 | 0;
    dx = $.Abs$i32(x2 - x1 | 0);
    d = Math.imul(2, dx) - dy | 0;
    aincr = Math.imul(2, dx - dy | 0);
    bincr = Math.imul(2, dx);
    x = x1;
    y = y1;
    if (!fnCallback(x, y)) {
      if (lastx != null) {
        lastx.a[lastx.o] = x;
      }
      if (lasty != null) {
        lasty.a[lasty.o] = y;
      }
      return false;
    }
    for (y = y1 + 1 | 0; y <= y2; y = y + 1 | 0) {
      if (d >= 0) {
        x = x + xincr | 0;
        d = d + aincr | 0;
      } else {
        d = d + bincr | 0;
      }
      if (!fnCallback(x, y)) {
        if (lastx != null) {
          lastx.a[lastx.o] = x;
        }
        if (lasty != null) {
          lasty.a[lasty.o] = y;
        }
        return false;
      }
    }
  } else {
    if (x1 > x2) {
      [x1, x2] = [x2, x1];
      [y1, y2] = [y2, y1];
    }
    yincr = y2 > y1 ? 1 : -1;
    dx = x2 - x1 | 0;
    dy = $.Abs$i32(y2 - y1 | 0);
    d = Math.imul(2, dy) - dx | 0;
    aincr = Math.imul(2, dy - dx | 0);
    bincr = Math.imul(2, dy);
    x = x1;
    y = y1;
    if (!fnCallback(x, y)) {
      if (lastx != null) {
        lastx.a[lastx.o] = x;
      }
      if (lasty != null) {
        lasty.a[lasty.o] = y;
      }
      return false;
    }
    for (x = x1 + 1 | 0; x <= x2; x = x + 1 | 0) {
      if (d >= 0) {
        y = y + yincr | 0;
        d = d + aincr | 0;
      } else {
        d = d + bincr | 0;
      }
      if (!fnCallback(x, y)) {
        if (lastx != null) {
          lastx.a[lastx.o] = x;
        }
        if (lasty != null) {
          lasty.a[lasty.o] = y;
        }
        return false;
      }
    }
  }
  return true;
}

export function DensitySolid(dens) {
  return dens >= 50;
}

export function DensitySemiSolid(dens) {
  return dens >= 25;
}

export function DensityLiquid(dens) {
  return dens >= 25 && dens < 50;
}

export function PixCol2Tex(pixc) {
  if (pixc >= 255) {
    return 0;
  }
  return pixc;
}

export function GBackMat(x, y) {
  return $.Landscape.GetMat(x, y);
}

export function GBackDensity(x, y) {
  return $.Landscape.GetDensity(x, y);
}

export function GBackSolid(x, y) {
  return DensitySolid(GBackDensity(x, y));
}

export function GBackSemiSolid(x, y) {
  return DensitySemiSolid(GBackDensity(x, y));
}

export function GBackLiquid(x, y) {
  return DensityLiquid(GBackDensity(x, y));
}

function GetRoundPolygon(x, y, size, smoothness) {
  if (smoothness > 100) {
    smoothness = 100;
  }
  if (smoothness < 0) {
    smoothness = 0;
  }
  if (size <= 0) {
    size = 1;
  }
  let count = (Math.imul(2, size) / 3 | 0) + 6 | 0;
  let vertices = [];
  $reserve(vertices, $u64n(Math.imul(count, 2)));
  let begin = $.itofix$i32(360).op_mul$i32(Random(100) | 0).op_div$i32(100);
  let begin2 = $.itofix$i32(360).op_mul$i32(Random(100) | 0).op_div$i32(100);
  let anticircle = $.itofix$i32(3).op_add$i32(Math.imul(smoothness / 16 | 0, smoothness) / 16 | 0);
  let random = Math.imul(80, 200 - smoothness | 0);
  for (let i = 0; i < count; i = i + 1 | 0) {
    let angle = $.itofix$i32(360).op_mul$i32(i).op_div$i32(count);
    let currsize = $.itofix$i32(size);
    currsize.op_addAssign$C4Fixed($.Sin(angle.op_mul$i32(3).op_add$C4Fixed(begin).op_add$C4Fixed($.itofix$i32(Random(random >>> 0) | 0).op_div$i32(100))).op_mul$i32(size).op_div$C4Fixed(anticircle));
    currsize.op_addAssign$C4Fixed($.Cos(angle.op_mul$i32(5).op_add$C4Fixed(begin2).op_add$C4Fixed($.itofix$i32(Random(random >>> 0) | 0).op_div$i32(100))).op_mul$i32(size).op_div$C4Fixed(anticircle).op_div$i32(2));
    vertices.push(x + $.fixtoi$C4Fixed($.Sin(angle).op_mul$C4Fixed(currsize)) | 0);
    vertices.push(y - $.fixtoi$C4Fixed($.Cos(angle).op_mul$C4Fixed(currsize)) | 0);
  }
  return vertices;
}

function GetRectangle(tx, ty, wdt, hgt) {
  let vertices = [];
  resize(vertices, 8, () => 0);
  vertices[0] = tx;
  vertices[1] = ty;
  vertices[2] = tx;
  vertices[3] = ty + hgt | 0;
  vertices[4] = tx + wdt | 0;
  vertices[5] = ty + hgt | 0;
  vertices[6] = tx + wdt | 0;
  vertices[7] = ty;
  return vertices;
}

function getBoundingBox(vtcs, length) {
  let BoundingBox = new $.C4Rect().init$i32$i32$i32$i32(vtcs.a[vtcs.o + 0], vtcs.a[vtcs.o + 1], 1, 1);
  for (let i = 2; (i + 1 | 0) < length; i = i + 2 | 0) {
    BoundingBox.Add(new $.C4Rect().init$i32$i32$i32$i32(vtcs.a[vtcs.o + i], vtcs.a[vtcs.o + (i + 1 | 0)], 1, 1));
  }
  return BoundingBox;
}

function fill_edge_structure(edge, i1, i2) {
  if (i2.a[i2.o + 1] < i1.a[i1.o + 1]) {
    let t = i1;
    i1 = i2;
    i2 = t;
  }
  edge.y = i1.a[i1.o + 1];
  edge.bottom = i2.a[i2.o + 1] - 1 | 0;
  edge.dx = ((i2.a[i2.o + 0] - i1.a[i1.o + 0] | 0) << 16 | 0) / (i2.a[i2.o + 1] - i1.a[i1.o + 1] | 0) | 0;
  edge.x = ((i1.a[i1.o + 0] << 16 | 0) + 32768 | 0) - 1 | 0;
  edge.prev = null;
  edge.next = null;
  if (edge.dx < 0) {
    edge.x = edge.x + $min(edge.dx + 65536 | 0, 0) | 0;
  }
  edge.w = $max($.Abs$i32(edge.dx) - 65536 | 0, 0);
}

function add_edge(list, edge, sort_by_x) {
  let pos = list;
  let prev = null;
  if (sort_by_x !== 0) {
    while (pos != null && (pos.x + (pos.w / 2 | 0) | 0) < (edge.x + (edge.w / 2 | 0) | 0)) {
      prev = pos;
      pos = pos.next;
    }
  } else {
    while (pos != null && pos.y < edge.y) {
      prev = pos;
      pos = pos.next;
    }
  }
  edge.next = pos;
  edge.prev = prev;
  if (pos != null) {
    pos.prev = edge;
  }
  if (prev != null) {
    prev.next = edge;
    return list;
  } else {
    return edge;
  }
}

function remove_edge(list, edge) {
  if (edge.next != null) {
    edge.next.prev = edge.prev;
  }
  if (edge.prev != null) {
    edge.prev.next = edge.next;
    return list;
  } else {
    return edge.next;
  }
}



function GroupReadSurface8(hGroup, szWildCard) {
  if (!hGroup.AccessEntry(szWildCard)) {
    return null;
  }
  let pSfc = new $.CSurface8().init$v();
  if (!pSfc.Read(hGroup)) {
    return null;
  }
  return pSfc;
}

export function PixCol2Mat(pixc) {
  let iTex = PixCol2Tex(pixc);
  if (iTex === 0) {
    return -1;
  }
  let pTex = $.TextureMap.GetEntry(iTex);
  return pTex != null ? pTex.GetMaterialIndex() : -1;
}

function GetTexUsage(sfcMap, _sfcMapBkg, iMapX, iMapY, iMapWdt, iMapHgt, dwpTextureUsage) {
  let $t1;
  let iX = 0;
  let iY = 0;
  if (dwpTextureUsage == null) {
    return false;
  }
  iMapX = $.Clamp$i32$i32$i32(iMapX, 0, sfcMap.Wdt - 1 | 0);
  iMapY = $.Clamp$i32$i32$i32(iMapY, 0, sfcMap.Hgt - 1 | 0);
  iMapWdt = $.Clamp$i32$i32$i32(iMapWdt, 0, sfcMap.Wdt - iMapX | 0);
  iMapHgt = $.Clamp$i32$i32$i32(iMapHgt, 0, sfcMap.Hgt - iMapY | 0);
  for (let cnt = 0; cnt < 255; cnt = cnt + 1 | 0) {
    dwpTextureUsage.a[dwpTextureUsage.o + cnt] = 0;
  }
  for (iY = iMapY; iY < (iMapY + iMapHgt | 0); iY = iY + 1 | 0) {
    for (iX = iMapX; iX < (iMapX + iMapWdt | 0); iX = iX + 1 | 0) {
      let tex = sfcMap.GetPix(iX, iY);
      0;
      if (!(($t1 = dwpTextureUsage.a[dwpTextureUsage.o + tex], dwpTextureUsage.a[dwpTextureUsage.o + tex] = dwpTextureUsage.a[dwpTextureUsage.o + tex] + 1 >>> 0, $t1) !== 0)) {
        if (tex !== 0) {
          if (!($.TextureMap.GetEntry(tex).GetMaterial() != null)) {
            $.LogF(S("Map2Landscape error: Texture index %d at (%d/%d) in map not defined in texture map!"), tex, iX, iY);
          }
        }
      }
    }
  }
  return true;
}

export function AboveSemiSolid(rx, ry) {
  let cy1 = ry.a[ry.o];
  let cy2 = ry.a[ry.o];
  let UseUpwardsNextFree = false;
  let UseDownwardsNextSolid = false;
  while (cy1 >= 0 || cy2 < $.Landscape.GetHeight()) {
    if (cy1 >= 0) {
      if (GBackSemiSolid(rx.a[rx.o], cy1)) {
        UseUpwardsNextFree = true;
      } else if (UseUpwardsNextFree) {
        ry.a[ry.o] = cy1;
        return true;
      }
    }
    if (cy2 < $.Landscape.GetHeight()) {
      if (!GBackSemiSolid(rx.a[rx.o], cy2)) {
        UseDownwardsNextSolid = true;
      } else if (UseDownwardsNextSolid) {
        ry.a[ry.o] = cy2;
        return true;
      }
    }
    cy1 = cy1 - 1 | 0;
    cy2 = cy2 + 1 | 0;
  }
  return false;
}

export function AboveSolid(rx, ry) {
  let cy1 = ry.a[ry.o];
  let cy2 = ry.a[ry.o];
  while (cy1 >= 0 || cy2 < $.Landscape.GetHeight()) {
    if (cy1 >= 0) {
      if (!GBackSemiSolid(rx.a[rx.o], cy1)) {
        if (GBackSolid(rx.a[rx.o], cy1 + 1 | 0)) {
          ry.a[ry.o] = cy1;
          return true;
        }
      }
    }
    if ((cy2 + 1 | 0) < $.Landscape.GetHeight()) {
      if (!GBackSemiSolid(rx.a[rx.o], cy2)) {
        if (GBackSolid(rx.a[rx.o], cy2 + 1 | 0)) {
          ry.a[ry.o] = cy2;
          return true;
        }
      }
    }
    cy1 = cy1 - 1 | 0;
    cy2 = cy2 + 1 | 0;
  }
  return false;
}

export function SemiAboveSolid(rx, ry) {
  let cy1 = ry.a[ry.o];
  let cy2 = ry.a[ry.o];
  while (cy1 >= 0 || cy2 < $.Landscape.GetHeight()) {
    if (cy1 >= 0) {
      if (!GBackSolid(rx.a[rx.o], cy1)) {
        if (GBackSolid(rx.a[rx.o], cy1 + 1 | 0)) {
          ry.a[ry.o] = cy1;
          return true;
        }
      }
    }
    if ((cy2 + 1 | 0) < $.Landscape.GetHeight()) {
      if (!GBackSolid(rx.a[rx.o], cy2)) {
        if (GBackSolid(rx.a[rx.o], cy2 + 1 | 0)) {
          ry.a[ry.o] = cy2;
          return true;
        }
      }
    }
    cy1 = cy1 - 1 | 0;
    cy2 = cy2 + 1 | 0;
  }
  return false;
}

export function FindLiquidHeight(cx, ry, hgt) {
  let cy1 = ry.a[ry.o];
  let cy2 = ry.a[ry.o];
  let rl1 = 0;
  let rl2 = 0;
  while (cy1 >= 0 || cy2 < $.Landscape.GetHeight()) {
    if (cy1 >= 0) {
      if (GBackLiquid(cx, cy1)) {
        rl1 = rl1 + 1 | 0;
        if (rl1 >= hgt) {
          ry.a[ry.o] = cy1 + (hgt / 2 | 0) | 0;
          return true;
        }
      } else {
        rl1 = 0;
      }
    }
    if ((cy2 + 1 | 0) < $.Landscape.GetHeight()) {
      if (GBackLiquid(cx, cy2)) {
        rl2 = rl2 + 1 | 0;
        if (rl2 >= hgt) {
          ry.a[ry.o] = cy2 - (hgt / 2 | 0) | 0;
          return true;
        }
      } else {
        rl2 = 0;
      }
    }
    cy1 = cy1 - 1 | 0;
    cy2 = cy2 + 1 | 0;
  }
  return false;
}

export function FindTunnelHeight(cx, ry, hgt) {
  let cy1 = ry.a[ry.o];
  let cy2 = ry.a[ry.o];
  let rl1 = 0;
  let rl2 = 0;
  while (cy1 >= 0 || cy2 < $.Landscape.GetHeight()) {
    if (cy1 >= 0) {
      if ($.Landscape.GetBackPix(cx, cy1) !== 0 && $.MatDensity(GBackMat(cx, cy1)) < 25) {
        rl1 = rl1 + 1 | 0;
        if (rl1 >= hgt) {
          ry.a[ry.o] = cy1 + (hgt / 2 | 0) | 0;
          return true;
        }
      } else {
        rl1 = 0;
      }
    }
    if ((cy2 + 1 | 0) < $.Landscape.GetHeight()) {
      if ($.Landscape.GetBackPix(cx, cy2) !== 0 && $.MatDensity(GBackMat(cx, cy2)) < 25) {
        rl2 = rl2 + 1 | 0;
        if (rl2 >= hgt) {
          ry.a[ry.o] = cy2 - (hgt / 2 | 0) | 0;
          return true;
        }
      } else {
        rl2 = 0;
      }
    }
    cy1 = cy1 - 1 | 0;
    cy2 = cy2 + 1 | 0;
  }
  return false;
}

export function FindSolidGround(rx, ry, width) {
  let fFound = false;
  const cx1 = [0];
  const cx2 = [0];
  const cy1 = [0];
  const cy2 = [0];
  let rl1 = 0;
  let rl2 = 0;
  for (cx1[0] = cx2[0] = rx.a[rx.o], cy1[0] = cy2[0] = ry.a[ry.o]; cx1[0] > 0 || cx2[0] < $.Landscape.GetWidth(); cx1[0] = cx1[0] - 1 | 0, cx2[0] = cx2[0] + 1 | 0) {
    if (cx1[0] >= 0) {
      if (AboveSolid(P(cx1, 0), P(cy1, 0))) {
        rl1 = rl1 + 1 | 0;
      } else {
        rl1 = 0;
      }
    }
    if (cx2[0] < $.Landscape.GetWidth()) {
      if (AboveSolid(P(cx2, 0), P(cy2, 0))) {
        rl2 = rl2 + 1 | 0;
      } else {
        rl2 = 0;
      }
    }
    if (rl1 >= width) {
      rx.a[rx.o] = cx1[0] + (rl1 / 2 | 0) | 0;
      ry.a[ry.o] = cy1[0];
      fFound = true;
      break;
    }
    if (rl2 >= width) {
      rx.a[rx.o] = cx2[0] - (rl2 / 2 | 0) | 0;
      ry.a[ry.o] = cy2[0];
      fFound = true;
      break;
    }
  }
  if (fFound) {
    AboveSemiSolid(rx, ry);
  }
  return fFound;
}

export function FindSurfaceLiquid(rx, ry, width, height) {
  let fFound = false;
  const cx1 = [0];
  const cx2 = [0];
  const cy1 = [0];
  const cy2 = [0];
  let rl1 = 0;
  let rl2 = 0;
  let cnt = 0;
  let lokay = false;
  for (cx1[0] = cx2[0] = rx.a[rx.o], cy1[0] = cy2[0] = ry.a[ry.o]; cx1[0] > 0 || cx2[0] < $.Landscape.GetWidth(); cx1[0] = cx1[0] - 1 | 0, cx2[0] = cx2[0] + 1 | 0) {
    if (cx1[0] > 0) {
      if (!AboveSemiSolid(P(cx1, 0), P(cy1, 0))) {
        cx1[0] = -1;
      } else {
        for (lokay = true, cnt = 0; cnt < height; cnt = cnt + 1 | 0) {
          if (!GBackLiquid(cx1[0], (cy1[0] + 1 | 0) + cnt | 0)) {
            lokay = false;
          }
        }
        if (lokay) {
          rl1 = rl1 + 1 | 0;
        } else {
          rl1 = 0;
        }
      }
    }
    if (cx2[0] < $.Landscape.GetWidth()) {
      if (!AboveSemiSolid(P(cx2, 0), P(cy2, 0))) {
        cx2[0] = $.Landscape.GetWidth();
      } else {
        for (lokay = true, cnt = 0; cnt < height; cnt = cnt + 1 | 0) {
          if (!GBackLiquid(cx2[0], (cy2[0] + 1 | 0) + cnt | 0)) {
            lokay = false;
          }
        }
        if (lokay) {
          rl2 = rl2 + 1 | 0;
        } else {
          rl2 = 0;
        }
      }
    }
    if (rl1 >= width) {
      rx.a[rx.o] = cx1[0] + (rl1 / 2 | 0) | 0;
      ry.a[ry.o] = cy1[0];
      fFound = true;
      break;
    }
    if (rl2 >= width) {
      rx.a[rx.o] = cx2[0] - (rl2 / 2 | 0) | 0;
      ry.a[ry.o] = cy2[0];
      fFound = true;
      break;
    }
  }
  if (fFound) {
    AboveSemiSolid(rx, ry);
  }
  return fFound;
}

export function FindLiquid(rx, ry, width, height) {
  let cx1 = 0;
  let cx2 = 0;
  const cy1 = [0];
  const cy2 = [0];
  let rl1 = 0;
  let rl2 = 0;
  for (cx1 = cx2 = rx.a[rx.o], cy1[0] = cy2[0] = ry.a[ry.o]; cx1 > 0 || cx2 < $.Landscape.GetWidth(); cx1 = cx1 - 1 | 0, cx2 = cx2 + 1 | 0) {
    if (cx1 > 0) {
      if (FindLiquidHeight(cx1, P(cy1, 0), height)) {
        rl1 = rl1 + 1 | 0;
      } else {
        rl1 = 0;
      }
    }
    if (cx2 < $.Landscape.GetWidth()) {
      if (FindLiquidHeight(cx2, P(cy2, 0), height)) {
        rl2 = rl2 + 1 | 0;
      } else {
        rl2 = 0;
      }
    }
    if (rl1 >= width) {
      rx.a[rx.o] = cx1 + (rl1 / 2 | 0) | 0;
      ry.a[ry.o] = cy1[0];
      return true;
    }
    if (rl2 >= width) {
      rx.a[rx.o] = cx2 - (rl2 / 2 | 0) | 0;
      ry.a[ry.o] = cy2[0];
      return true;
    }
  }
  return false;
}

export function FindTunnel(rx, ry, width, height) {
  let cx1 = 0;
  let cx2 = 0;
  const cy1 = [0];
  const cy2 = [0];
  let rl1 = 0;
  let rl2 = 0;
  for (cx1 = cx2 = rx.a[rx.o], cy1[0] = cy2[0] = ry.a[ry.o]; cx1 > 0 || cx2 < $.Landscape.GetWidth(); cx1 = cx1 - 1 | 0, cx2 = cx2 + 1 | 0) {
    if (cx1 > 0) {
      if (FindTunnelHeight(cx1, P(cy1, 0), height)) {
        rl1 = rl1 + 1 | 0;
      } else {
        rl1 = 0;
      }
    }
    if (cx2 < $.Landscape.GetWidth()) {
      if (FindTunnelHeight(cx2, P(cy2, 0), height)) {
        rl2 = rl2 + 1 | 0;
      } else {
        rl2 = 0;
      }
    }
    if (rl1 >= width) {
      rx.a[rx.o] = cx1 + (rl1 / 2 | 0) | 0;
      ry.a[ry.o] = cy1[0];
      return true;
    }
    if (rl2 >= width) {
      rx.a[rx.o] = cx2 - (rl2 / 2 | 0) | 0;
      ry.a[ry.o] = cy2[0];
      return true;
    }
  }
  return false;
}

export function FindLevelGround(rx, ry, width, hrange) {
  let fFound = false;
  const cx1 = [0];
  const cx2 = [0];
  const cy1 = [0];
  const cy2 = [0];
  let rh1 = 0;
  let rh2 = 0;
  let rl1 = 0;
  let rl2 = 0;
  cx1[0] = cx2[0] = rx.a[rx.o];
  cy1[0] = cy2[0] = ry.a[ry.o];
  rh1 = cy1[0];
  rh2 = cy2[0];
  rl1 = rl2 = 0;
  for (cx1[0] = cx1[0] - 1 | 0, cx2[0] = cx2[0] + 1 | 0; cx1[0] > 0 || cx2[0] < $.Landscape.GetWidth(); cx1[0] = cx1[0] - 1 | 0, cx2[0] = cx2[0] + 1 | 0) {
    if (cx1[0] > 0) {
      if (!AboveSemiSolid(P(cx1, 0), P(cy1, 0))) {
        cx1[0] = -1;
      } else {
        if (GBackSolid(cx1[0], cy1[0] + 1 | 0) && $.Abs$i32(cy1[0] - rh1 | 0) < hrange) {
          rl1 = rl1 + 1 | 0;
        } else {
          rl1 = 0;
          rh1 = cy1[0];
        }
      }
    }
    if (cx2[0] < $.Landscape.GetWidth()) {
      if (!AboveSemiSolid(P(cx2, 0), P(cy2, 0))) {
        cx2[0] = $.Landscape.GetWidth();
      } else {
        if (GBackSolid(cx2[0], cy2[0] + 1 | 0) && $.Abs$i32(cy2[0] - rh2 | 0) < hrange) {
          rl2 = rl2 + 1 | 0;
        } else {
          rl2 = 0;
          rh2 = cy2[0];
        }
      }
    }
    if (rl1 >= width) {
      rx.a[rx.o] = cx1[0] + (rl1 / 2 | 0) | 0;
      ry.a[ry.o] = cy1[0];
      fFound = true;
      break;
    }
    if (rl2 >= width) {
      rx.a[rx.o] = cx2[0] - (rl2 / 2 | 0) | 0;
      ry.a[ry.o] = cy2[0];
      fFound = true;
      break;
    }
  }
  if (fFound) {
    AboveSemiSolid(rx, ry);
  }
  return fFound;
}

export function FindConSiteSpot(rx, ry, wdt, hgt, hrange = -1) {
  let fFound = false;
  if (hrange === -1) {
    hrange = $max(wdt / 4 | 0, 5);
  }
  const cx1 = [0];
  const cx2 = [0];
  const cy1 = [0];
  const cy2 = [0];
  let rh1 = 0;
  let rh2 = 0;
  let rl1 = 0;
  let rl2 = 0;
  cx1[0] = $min(rx.a[rx.o] + (wdt / 2 | 0) | 0, $.Landscape.GetWidth() - 1 | 0);
  cy1[0] = ry.a[ry.o];
  if (!AboveSemiSolid(P(cx1, 0), P(cy1, 0))) {
    cx1[0] = $min(rx.a[rx.o], $.Landscape.GetWidth() - 1 | 0);
    cy1[0] = ry.a[ry.o];
  }
  cx2[0] = $max(rx.a[rx.o] - (wdt / 2 | 0) | 0, 0);
  cy2[0] = ry.a[ry.o];
  if (!AboveSemiSolid(P(cx2, 0), P(cy2, 0))) {
    cx2[0] = $min(rx.a[rx.o], $.Landscape.GetWidth() - 1 | 0);
    cy2[0] = ry.a[ry.o];
  }
  rh1 = cy1[0];
  rh2 = cy2[0];
  rl1 = rl2 = 0;
  for (cx1[0] = cx1[0] - 1 | 0, cx2[0] = cx2[0] + 1 | 0; cx1[0] > 0 || cx2[0] < $.Landscape.GetWidth(); cx1[0] = cx1[0] - 1 | 0, cx2[0] = cx2[0] + 1 | 0) {
    if (cx1[0] > 0) {
      if (!AboveSemiSolid(P(cx1, 0), P(cy1, 0))) {
        cx1[0] = -1;
      } else {
        if (GBackSolid(cx1[0], cy1[0] + 1 | 0) && $.Abs$i32(cy1[0] - rh1 | 0) < hrange) {
          rl1 = rl1 + 1 | 0;
        } else {
          rl1 = 0;
          rh1 = cy1[0];
        }
      }
    }
    if (cx2[0] < $.Landscape.GetWidth()) {
      if (!AboveSemiSolid(P(cx2, 0), P(cy2, 0))) {
        cx2[0] = $.Landscape.GetWidth();
      } else {
        if (GBackSolid(cx2[0], cy2[0] + 1 | 0) && $.Abs$i32(cy2[0] - rh2 | 0) < hrange) {
          rl2 = rl2 + 1 | 0;
        } else {
          rl2 = 0;
          rh2 = cy2[0];
        }
      }
    }
    if (rl1 >= wdt) {
      if (cx1[0] > 0) {
        if (!($.Game.FindConstuctionSiteBlock(cx1[0], (cy1[0] - hgt | 0) - 10 | 0, wdt, hgt + 40 | 0) != null)) {
          rx.a[rx.o] = cx1[0] + (wdt / 2 | 0) | 0;
          ry.a[ry.o] = cy1[0];
          fFound = true;
          break;
        }
      }
    }
    if (rl2 >= wdt) {
      if (cx2[0] < $.Landscape.GetWidth()) {
        if (!($.Game.FindConstuctionSiteBlock(cx2[0] - wdt | 0, (cy2[0] - hgt | 0) - 10 | 0, wdt, hgt + 40 | 0) != null)) {
          rx.a[rx.o] = cx2[0] - (wdt / 2 | 0) | 0;
          ry.a[ry.o] = cy2[0];
          fFound = true;
          break;
        }
      }
    }
  }
  if (fFound) {
    AboveSemiSolid(rx, ry);
  }
  return fFound;
}

export function PathFreePix(x, y) {
  return !GBackSolid(x, y);
}

export function PathFree$i32$i32$i32$i32(x1, y1, x2, y2) {
  return ForLine(x1, y1, x2, y2, PathFreePix);
}

export function PathFree$i32$i32$i32$i32$pi32$pi32(x1, y1, x2, y2, ix, iy) {
  let reverse = false;
  let steep = $.Abs$i32(y2 - y1 | 0) > $.Abs$i32(x2 - x1 | 0);
  if (steep) {
    [x1, y1] = [y1, x1];
    [x2, y2] = [y2, x2];
  }
  if (x1 > x2) {
    [x1, x2] = [x2, x1];
    [y1, y2] = [y2, y1];
    reverse = true;
  }
  if (!reverse) {
    let deltax = x2 - x1 | 0;
    let deltay = $.Abs$i32(y2 - y1 | 0);
    let error = 0;
    let ystep = y1 < y2 ? 1 : -1;
    let y = y1;
    for (let x = x1; x <= x2; x = x + 1 | 0) {
      if (steep) {
        if (GBackSolid(y, x)) {
          if (ix != null) {
            ix.a[ix.o] = y;
            iy.a[iy.o] = x;
          }
          return false;
        }
      } else {
        if (GBackSolid(x, y)) {
          if (ix != null) {
            ix.a[ix.o] = x;
            iy.a[iy.o] = y;
          }
          return false;
        }
      }
      error = error + deltay | 0;
      if (Math.imul(2, error) >= deltax) {
        y = y + ystep | 0;
        error = error - deltax | 0;
      }
    }
  } else {
    let deltax = x2 - x1 | 0;
    let deltay = $.Abs$i32(y2 - y1 | 0);
    let error = 0;
    let ystep = y1 < y2 ? 1 : -1;
    let y = y2;
    for (let x = x2; x >= x1; x = x - 1 | 0) {
      if (steep) {
        if (GBackSolid(y, x)) {
          if (ix != null) {
            ix.a[ix.o] = y;
            iy.a[iy.o] = x;
          }
          return false;
        }
      } else {
        if (GBackSolid(x, y)) {
          if (ix != null) {
            ix.a[ix.o] = x;
            iy.a[iy.o] = y;
          }
          return false;
        }
      }
      error = error - deltay | 0;
      if (Math.imul(2, error) <= (-deltax | 0)) {
        y = y - ystep | 0;
        error = error + deltax | 0;
      }
    }
  }
  return true;
}

export function PathFreeIgnoreVehiclePix(x, y) {
  let byPix = $.Landscape.GetPix(x, y);
  return byPix === 0 || !DensitySolid($.Landscape.GetPixMat(byPix)) || $.Landscape.GetPixMat(byPix) === $.MVehic;
}

export function PathFreeIgnoreVehicle(x1, y1, x2, y2, ix = null, iy = null) {
  return ForLine(x1, y1, x2, y2, PathFreeIgnoreVehiclePix, ix, iy);
}

export function TrajectoryDistance(iFx, iFy, iXDir, iYDir, iTx, iTy) {
  let iClosest = $.Distance(iFx, iFy, iTx, iTy);
  let cx = $.itofix$i32(iFx);
  let cy = $.itofix$i32(iFy);
  let cdis = 0;
  while ($.Inside$i32$i32$i32$3($.fixtoi$C4Fixed(cx), 0, $.Landscape.GetWidth() - 1 | 0) && $.Inside$i32$i32$i32$3($.fixtoi$C4Fixed(cy), 0, $.Landscape.GetHeight() - 1 | 0) && !GBackSolid($.fixtoi$C4Fixed(cx), $.fixtoi$C4Fixed(cy))) {
    cdis = $.Distance($.fixtoi$C4Fixed(cx), $.fixtoi$C4Fixed(cy), iTx, iTy);
    if (cdis < iClosest) {
      iClosest = cdis;
    }
    cx.op_addAssign$C4Fixed(iXDir);
    cy.op_addAssign$C4Fixed(iYDir);
    iYDir.op_addAssign$C4Fixed($.Landscape.GetGravity());
  }
  return iClosest;
}



export function FindThrowingPosition(iTx, iTy, fXDir, fYDir, iHeight, rX, rY) {
  rX.a[rX.o] = iTx;
  rY.a[rY.o] = iTy;
  if (!SemiAboveSolid(rX, rY)) {
    return false;
  }
  if (!$.Inside$i32$i32$i32$3(rY.a[rY.o] - iTy | 0, -50, 50)) {
    return false;
  }
  let iDir = 1;
  if (fXDir.op_gt$i32(0)) {
    iDir = -1;
  }
  for (let cnt = 0; $.Inside$i32$i32$i32$3(rX.a[rX.o], 0, $.Landscape.GetWidth() - 1 | 0) && cnt <= 60; rX.a[rX.o] = rX.a[rX.o] + iDir | 0, cnt = cnt + 1 | 0) {
    if (!SemiAboveSolid(rX, rY)) {
      return false;
    }
    let itjd = TrajectoryDistance(rX.a[rX.o], rY.a[rY.o] - iHeight | 0, fXDir.$clone(), fYDir.$clone(), iTx, iTy);
    if (itjd <= 2) {
      return true;
    }
  }
  return false;
}



export function FindClosestFree(rX, rY, iAngle1, iAngle2, iExcludeAngle1, iExcludeAngle2) {
  let iX = 0;
  let iY = 0;
  for (let iR = 10; iR < 200; iR = iR + 10 | 0) {
    for (let iAngle = iAngle1; iAngle < iAngle2; iAngle = iAngle + 10 | 0) {
      if (!$.Inside$i32$i32$i32$3(iAngle, iExcludeAngle1, iExcludeAngle2)) {
        iX = rX.a[rX.o] + $.fixtoi$C4Fixed($.Sin($.itofix$i32(iAngle)).op_mul$i32(iR)) | 0;
        iY = rY.a[rY.o] - $.fixtoi$C4Fixed($.Cos($.itofix$i32(iAngle)).op_mul$i32(iR)) | 0;
        if ($.Inside$i32$i32$i32$3(iX, 0, $.Landscape.GetWidth() - 1 | 0)) {
          if ($.Inside$i32$i32$i32$3(iY, 0, $.Landscape.GetHeight() - 1 | 0)) {
            if (!GBackSemiSolid(iX, iY)) {
              rX.a[rX.o] = iX;
              rY.a[rY.o] = iY;
              return true;
            }
          }
        }
      }
    }
  }
  return false;
}

export function ConstructionCheck(PropList, iX, iY, pByObj = null) {
  let ndef = null;
  if (!((ndef = PropList.GetDef$v()) != null)) {
    if (pByObj != null) {
      $.GameMsgObjectError($.FormatString($.LoadResStr(S("IDS_OBJ_UNDEF")), PropList.GetName()).getData(), pByObj);
    }
    return false;
  }
  if (ndef.Constructable === 0) {
    if (pByObj != null) {
      $.GameMsgObjectError($.FormatString($.LoadResStr(S("IDS_OBJ_NOCON")), ndef.GetName()).getData(), pByObj);
    }
    return false;
  }
  let rtx = 0;
  let rty = 0;
  let wdt = 0;
  let hgt = 0;
  wdt = ndef.Shape.Wdt;
  hgt = ndef.Shape.Hgt - ndef.ConSizeOff | 0;
  rtx = iX - (wdt / 2 | 0) | 0;
  rty = iY - hgt | 0;
  if ($.Landscape.AreaSolidCount(rtx, rty, wdt, hgt) > (Math.imul(wdt, hgt) / 20 | 0)) {
    if (pByObj != null) {
      $.GameMsgObjectError($.LoadResStr(S("IDS_OBJ_NOROOM")), pByObj);
    }
    return false;
  }
  if ($.Landscape.AreaSolidCount(rtx, rty + hgt | 0, wdt, 5) < Math.imul(wdt, 2)) {
    if (pByObj != null) {
      $.GameMsgObjectError($.LoadResStr(S("IDS_OBJ_NOLEVEL")), pByObj);
    }
    return false;
  }
  let other = null;
  if ((other = $.Game.FindConstuctionSiteBlock(rtx, rty, wdt, hgt)) != null) {
    if (pByObj != null) {
      $.GameMsgObjectError($.FormatString($.LoadResStr(S("IDS_OBJ_NOOTHER")), other.GetName()).getData(), pByObj);
    }
    return false;
  }
  return true;
}


export function $init(): void {
  C4Landscape.Transparent = 255;
  $.C4MaxMaterial$C4Landscape = 125;
  $.C4LS_MaxRelights$C4Landscape = 50;
  $.QuickPolyBufSize$C4Landscape = 20;
  $.QuickPolyBuf = $oarr(20, () => new CPolyEdge());
  $.Throwing_MaxVertical$C4Landscape = 50;
  $.Throwing_MaxHorizontal$C4Landscape = 60;
  $.Closest_MaxRange$C4Landscape = 200;
  $.Closest_Step$C4Landscape = 10;
  $.Landscape = new C4Landscape(); $.Landscape.init();
}

Object.assign($, { AboveSemiSolid, AboveSolid, C4Landscape, C4Landscape$P_landscape_C4Landscape, CPolyEdge, ConstructionCheck, DensityLiquid, DensitySemiSolid, DensitySolid, FindClosestFree, FindConSiteSpot, FindLevelGround, FindLiquid, FindLiquidHeight, FindSolidGround, FindSurfaceLiquid, FindThrowingPosition, FindTunnel, FindTunnelHeight, ForLine, GBackDensity, GBackLiquid, GBackMat, GBackSemiSolid, GBackSolid, GetRectangle, GetRoundPolygon, GetTexUsage, GroupReadSurface8, PathFree$i32$i32$i32$i32, PathFree$i32$i32$i32$i32$pi32$pi32, PathFreeIgnoreVehicle, PathFreeIgnoreVehiclePix, PathFreePix, PixCol2Mat, PixCol2Tex, SemiAboveSolid, TrajectoryDistance, add_edge, fill_edge_structure, getBoundingBox, remove_edge });
