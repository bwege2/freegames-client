// @ts-nocheck
// OpenClonk 36de799: src/landscape/C4TextureShape.cpp, src/landscape/C4TextureShape.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $u64n } from '../../rt/int.ts';
import { $reinterpVoid, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $filled, $max, $min, $reserve, StdMap, resize } from '../../rt/std.ts';

export class C4TextureShape {
  data = new $.CSurface8().init$v();
  num_shapes = 0;
  shape_border_x = [];
  shape_border_y = [];
  shape_pixnum = [];

  init() {
    this.data = new $.CSurface8().init$v();
    this.num_shapes = 0;
    this.shape_border_x = [];
    this.shape_border_y = [];
    this.shape_pixnum = [];
    return this;
  }

  Clear() {
    this.data.Clear();
    this.num_shapes = 0;
    this.shape_border_x.length = 0;
    this.shape_border_y.length = 0;
    this.shape_pixnum.length = 0;
    $reserve(this.shape_pixnum, 128);
  }

  Load(group, filename, base_tex_wdt, base_tex_hgt) {
    this.Clear();
    let png_data = new $.StdBuf();
    if (!group.LoadEntry$pi8$pStdBuf(filename, png_data)) {
      return false;
    }
    let png = new $.CPNGFile().init();
    if (!png.Load($reinterpVoid($.StdBuf.prototype.getMData.call(png_data), "u8"), $.StdBuf.prototype.getSize.call(png_data) | 0)) {
      return false;
    }
    0;
    let zoom = Math.trunc(png.iWdt / $u64n(base_tex_wdt)) | 0;
    if (Math.imul(base_tex_wdt, zoom) !== (png.iWdt | 0) || Math.imul(base_tex_hgt, zoom) !== (png.iHgt | 0)) {
      $.LogF(S("ERROR: Material shape texture %s size (%d,%d) not a multiple of associated texture size (%d,%d). Not loading."), filename, png.iWdt | 0, png.iHgt | 0, base_tex_wdt, base_tex_hgt);
      return false;
    }
    resize(this.shape_border_x, 255, () => false);
    resize(this.shape_border_y, 255, () => false);
    let clr2shape = new StdMap();
    let first_px_pos_x = $filled(255, () => 0);
    let first_px_pos_y = $filled(255, () => 0);
    if (!this.data.Create(base_tex_wdt, base_tex_hgt)) {
      return false;
    }
    for (let y = 0; y < this.data.Hgt; y = y + 1 | 0) {
      for (let x = 0; x < this.data.Wdt; x = x + 1 | 0) {
        let px = png.GetPix(Math.imul(x, zoom), Math.imul(y, zoom));
        let px_data = 0;
        if ((px & 0xff000000) >>> 0 === 0) {
          px_data = 255;
        } else {
          px = (px & 0xffffff) >>> 0;
          let shape_idx = clr2shape.find(px);
          if (shape_idx.eq(clr2shape.end())) {
            px_data = this.num_shapes & 0xff;
            clr2shape.entry(px, () => 0).second = this.num_shapes & 0xff;
            this.shape_pixnum.push(1);
            first_px_pos_x[$u64n(this.num_shapes)] = x;
            first_px_pos_y[$u64n(this.num_shapes)] = y;
            this.num_shapes = this.num_shapes + 1 | 0;
            if (this.num_shapes >= 255) {
              $.LogF(S("Material shape texture %s invalid: Too many shape colors (>=255)."), filename);
              this.Clear();
              return false;
            }
          } else {
            px_data = shape_idx.v.second;
            this.shape_pixnum[px_data] = this.shape_pixnum[px_data] + 1 | 0;
          }
          if (x === 0 || x === (this.data.Wdt - 1 | 0)) {
            this.shape_border_x[px_data] = true;
          }
          if (y === 0 || y === (this.data.Hgt - 1 | 0)) {
            this.shape_border_y[px_data] = true;
          }
        }
        this.data._SetPix(x, y, px_data);
      }
    }
    if ($.Config.Developer.DebugShapeTextures !== 0) {
      $.LogF(S("Shape texture summary for %s (%d x %d downscaled to %d x %d):"), filename, png.iWdt | 0, png.iHgt | 0, base_tex_wdt, base_tex_wdt);
      for (const iter of clr2shape) {
        let clr = iter.first;
        let i = iter.second;
        $.LogF(S("  Color 0x%08x: %d pixels. First seen pos: %d/%d"), clr, this.shape_pixnum[$u64n(i)], first_px_pos_x[$u64n(i)], first_px_pos_y[$u64n(i)]);
      }
    }
    return true;
  }

  GetWidth() {
    return this.data.Wdt;
  }

  GetHeight() {
    return this.data.Hgt;
  }

  GetMaxPolyWidth() {
    return this.GetWidth() / 4 | 0;
  }

  GetMaxPolyHeight() {
    return this.GetHeight() / 4 | 0;
  }

  Draw(sfcMap, sfcMapBkg, iMapX, iMapY, iMapWdt, iMapHgt, iTexture, iOffX, iOffY, MapZoom, min_overlap_ratio) {
    if (this.num_shapes === 0) {
      return;
    }
    let x0 = $max(0, (Math.imul(iMapX, MapZoom) + iOffX | 0) - this.GetMaxPolyWidth() | 0);
    let y0 = $max(0, (Math.imul(iMapY, MapZoom) + iOffY | 0) - this.GetMaxPolyHeight() | 0);
    let x1 = $min($.Landscape.GetWidth(), (x0 + Math.imul(iMapWdt, MapZoom) | 0) + Math.imul(this.GetMaxPolyWidth(), 2) | 0);
    let y1 = $min($.Landscape.GetHeight(), (y0 + Math.imul(iMapHgt, MapZoom) | 0) + Math.imul(this.GetMaxPolyHeight(), 2) | 0);
    let rblock_x0 = x0 / this.data.Wdt | 0;
    let rblock_y0 = y0 / this.data.Hgt | 0;
    let rblock_x1 = ((x1 - 1 | 0) / this.data.Wdt | 0) + 1 | 0;
    let rblock_y1 = ((y1 - 1 | 0) / this.data.Hgt | 0) + 1 | 0;
    let n_blocks_x = (rblock_x1 - rblock_x0 | 0) + 1 | 0;
    let n_blocks_y = (rblock_y1 - rblock_y0 | 0) + 1 | 0;
    let activation = new C4TextureShapeActivationMap().init(rblock_x0, rblock_y0, n_blocks_x, n_blocks_y, this.num_shapes);
    for (let map_y = iMapY; map_y < (iMapY + iMapHgt | 0); map_y = map_y + 1 | 0) {
      for (let map_x = iMapX; map_x < (iMapX + iMapWdt | 0); map_x = map_x + 1 | 0) {
        if (sfcMap.GetPix(map_x, map_y) === iTexture) {
          let pixBkg = sfcMapBkg.GetPix(map_x, map_y);
          let px_check_rate = 1;
          for (let pxo_y = 0; pxo_y < MapZoom; pxo_y = pxo_y + px_check_rate | 0) {
            let px_y = (Math.imul(map_y, MapZoom) + pxo_y | 0) + iOffY | 0;
            let spx_y = px_y % this.data.Hgt;
            let block_y = px_y / this.data.Hgt | 0;
            for (let pxo_x = 0; pxo_x < MapZoom; pxo_x = pxo_x + px_check_rate | 0) {
              let px_x = (Math.imul(map_x, MapZoom) + pxo_x | 0) + iOffX | 0;
              let spx_x = px_x % this.data.Wdt;
              let block_x = px_x / this.data.Wdt | 0;
              let shape_idx = this.data._GetPix(spx_x, spx_y);
              if (shape_idx === 255) {
                continue;
              }
              let block_x1 = block_x;
              let block_x2 = block_x;
              if (!!this.shape_border_x[shape_idx]) {
                if (spx_x < (this.data.Wdt / 2 | 0)) {
                  block_x2 = block_x2 - 1 | 0;
                } else {
                  block_x1 = block_x1 + 1 | 0;
                }
              }
              let block_y1 = block_y;
              let block_y2 = block_y;
              if (!!this.shape_border_y[shape_idx]) {
                if (spx_y < (this.data.Hgt / 2 | 0)) {
                  block_y2 = block_y2 - 1 | 0;
                } else {
                  block_y1 = block_y1 + 1 | 0;
                }
              }
              activation.Add(block_x1, block_y1, shape_idx, 0, 0, pixBkg);
              activation.Add(block_x2, block_y1, shape_idx, 1, 0, pixBkg);
              activation.Add(block_x1, block_y2, shape_idx, 0, 1, pixBkg);
              activation.Add(block_x2, block_y2, shape_idx, 1, 1, pixBkg);
            }
          }
        }
      }
    }
    for (let y = y0; y < y1; y = y + 1 | 0) {
      let block_y = y / this.data.Hgt | 0;
      let blockpos_y = y % this.data.Hgt;
      let subblock_y = blockpos_y >= (this.data.Hgt / 2 | 0) ? 1 : 0;
      for (let x = x0; x < x1; x = x + 1 | 0) {
        let block_x = x / this.data.Wdt | 0;
        let blockpos_x = x % this.data.Wdt;
        let subblock_x = blockpos_x >= (this.data.Wdt / 2 | 0) ? 1 : 0;
        let shape_idx = this.data._GetPix(blockpos_x, blockpos_y);
        if (shape_idx === 255) {
          continue;
        }
        const pixBg = [0];
        let act = activation.Get(block_x, block_y, shape_idx, subblock_x, subblock_y, P(pixBg, 0));
        if (act === 0 || act < (Math.imul(this.shape_pixnum[$u64n(shape_idx)], min_overlap_ratio) / 100 | 0)) {
          continue;
        }
        $.Landscape._SetPix2(x, y, iTexture, pixBg[0]);
      }
    }
  }

  $clone() { return new C4TextureShape().$assign(this); }
  $assign(o) {
    this.data.$assign(o.data);
    this.num_shapes = o.num_shapes;
    this.shape_border_x = o.shape_border_x.slice();
    this.shape_border_y = o.shape_border_y.slice();
    this.shape_pixnum = o.shape_pixnum.slice();
    return this;
  }
}

export class C4TextureShapeActivationMap {
  activation = [];
  back_pix = [];
  block_x0 = 0;
  block_y0 = 0;
  n_blocks_x = 0;
  n_blocks_y = 0;
  num_shapes = 0;

  Idx(block_x, block_y, shape_idx, xpart, ypart) {
    block_x = block_x - this.block_x0 | 0;
    block_y = block_y - this.block_y0 | 0;
    if (!$.Inside$i32$i32$i32$3(block_x, 0, this.n_blocks_x - 1 | 0) || !$.Inside$i32$i32$i32$3(block_y, 0, this.n_blocks_y - 1 | 0)) {
      return -1;
    }
    return ypart + Math.imul(2, xpart + Math.imul(2, shape_idx + Math.imul(this.num_shapes, block_x + Math.imul(this.n_blocks_x, block_y) | 0) | 0) | 0) | 0;
  }

  init(block_x0, block_y0, n_blocks_x, n_blocks_y, num_shapes) {
    this.activation = [];
    this.back_pix = [];
    this.block_x0 = block_x0;
    this.block_y0 = block_y0;
    this.n_blocks_x = n_blocks_x;
    this.n_blocks_y = n_blocks_y;
    this.num_shapes = num_shapes;
    resize(this.activation, $u64n(Math.imul(Math.imul(Math.imul(n_blocks_x, n_blocks_y), num_shapes), 4)), () => 0);
    resize(this.back_pix, $u64n(Math.imul(Math.imul(Math.imul(n_blocks_x, n_blocks_y), num_shapes), 4)), () => 0);
    return this;
  }

  Get(block_x, block_y, shape_idx, xpart, ypart, bg_pix) {
    let idx = this.Idx(block_x, block_y, shape_idx, xpart, ypart);
    0;
    if (idx < 0) {
      return 0;
    }
    bg_pix.a[bg_pix.o] = this.back_pix[$u64n(idx)];
    return this.activation[$u64n(idx)];
  }

  Add(block_x, block_y, shape_idx, xpart, ypart, bg_pix) {
    let idx = this.Idx(block_x, block_y, shape_idx, xpart, ypart);
    if (idx < 0) {
      return;
    }
    this.activation[$u64n(idx)] = this.activation[$u64n(idx)] + 1 | 0;
    this.back_pix[$u64n(idx)] = bg_pix;
  }

  $clone() { return new C4TextureShapeActivationMap().$assign(this); }
  $assign(o) {
    this.activation = o.activation.slice();
    this.back_pix = o.back_pix.slice();
    this.block_x0 = o.block_x0;
    this.block_y0 = o.block_y0;
    this.n_blocks_x = o.n_blocks_x;
    this.n_blocks_y = o.n_blocks_y;
    this.num_shapes = o.num_shapes;
    return this;
  }
}

export function $init(): void {
}

Object.assign($, { C4TextureShape, C4TextureShapeActivationMap });
