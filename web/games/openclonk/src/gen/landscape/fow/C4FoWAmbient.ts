// @ts-nocheck
// OpenClonk 36de799: src/landscape/fow/C4FoWAmbient.cpp, src/landscape/fow/C4FoWAmbient.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { gl$glBindTexture, gl$glDeleteTextures, gl$glGenTextures, gl$glTexImage2D, gl$glTexParameteri, gl$glTexSubImage2D } from '../../../rt/gl.ts';
import { ftoi32, ftou32 } from '../../../rt/int.ts';
import { c$ceil, c$sqrt } from '../../../rt/libc.ts';
import { P, S } from '../../../rt/ptr.ts';
import { $ } from '../../../rt/registry.ts';
import { $delete, $max, $min } from '../../../rt/std.ts';

export class C4FoWAmbient {
  static $layout = [["Tex", 0, "u32", 0], ["Resolution", 8, "f64", 0], ["Radius", 16, "f64", 0], ["FullCoverage", 24, "f64", 0], ["LandscapeX", 32, "u32", 0], ["LandscapeY", 36, "u32", 0], ["SizeX", 40, "u32", 0], ["SizeY", 44, "u32", 0], ["Brightness", 48, "f64", 0]];
  static $size = 56;
  Tex = 0;
  Resolution = 0;
  Radius = 0;
  FullCoverage = 0;
  LandscapeX = 0;
  LandscapeY = 0;
  SizeX = 0;
  SizeY = 0;
  Brightness = 1;

  $dtor() {
    C4FoWAmbient.prototype.Clear.call(this);
  }

  Clear() {
    if (this.Tex !== 0) {
      gl$glDeleteTextures(1, P(this, "Tex"));
    }
    this.Tex = 0;
    this.Resolution = this.Radius = this.FullCoverage = 0;
    this.SizeX = this.SizeY = 0;
    this.LandscapeX = this.LandscapeY = 0;
    this.Brightness = 1;
  }

  SetBrightness(brightness) {
    this.Brightness = brightness;
  }

  GetBrightness() {
    return this.Brightness;
  }

  CreateFromLandscape(landscape, resolution, radius, full_coverage) {
    0;
    0;
    0;
    this.Clear();
    this.Resolution = resolution;
    this.Radius = radius;
    this.FullCoverage = full_coverage;
    this.LandscapeX = $.Landscape.GetWidth() >>> 0;
    this.LandscapeY = $.Landscape.GetHeight() >>> 0;
    this.SizeX = $min(ftou32(c$ceil(this.LandscapeX / resolution)), $.pDraw.MaxTexSize >>> 0);
    this.SizeY = $min(ftou32(c$ceil(this.LandscapeY / resolution)), $.pDraw.MaxTexSize >>> 0);
    gl$glGenTextures(1, P(this, "Tex"));
    gl$glBindTexture(3553, this.Tex);
    gl$glTexParameteri(3553, 10241, 9729);
    gl$glTexParameteri(3553, 10240, 9729);
    gl$glTexParameteri(3553, 10242, 33071);
    gl$glTexParameteri(3553, 10243, 33071);
    gl$glTexImage2D(3553, 0, 6403, this.SizeX | 0, this.SizeY | 0, 0, 6403, 5126, null);
    let begin = $.C4TimeMilliseconds.Now();
    this.UpdateFromLandscape(landscape, new $.C4Rect().init$i32$i32$i32$i32(0, 0, $.Landscape.GetWidth(), $.Landscape.GetHeight()));
    let dt = $.op_sub$C4TimeMilliseconds$C4TimeMilliseconds($.C4TimeMilliseconds.Now(), begin) >>> 0;
    $.LogF(S("Created %ux%u ambient map in %g secs"), this.SizeX, this.SizeY, dt / 1000);
  }

  UpdateFromLandscape(landscape, update) {
    if (update.Wdt === 0 || update.Hgt === 0) {
      return;
    }
    0;
    let zoom_x = $.Landscape.GetWidth() / this.SizeX;
    let zoom_y = $.Landscape.GetHeight() / this.SizeY;
    let left = $max(ftoi32((update.x - this.Radius) / zoom_x), 0) >>> 0;
    let right = $min(ftou32(((update.x + update.Wdt | 0) + this.Radius) / zoom_x), this.SizeX - 1 >>> 0) + 1 >>> 0;
    let top = $max(ftoi32((update.y - this.Radius) / zoom_y), 0) >>> 0;
    let bottom = $min(ftou32(((update.y + update.Hgt | 0) + this.Radius) / zoom_y), this.SizeY - 1 >>> 0) + 1 >>> 0;
    0;
    0;
    let R = this.Radius / c$sqrt(zoom_x * zoom_y);
    let norm = AmbientForPix$i32$i32$f64$LightMapFull(0, 0, R, new LightMapFull()) * this.FullCoverage;
    let light_mapZoom = new LightMapZoom().init(landscape, zoom_x, zoom_y);
    let ambient = P(new Float32Array(Math.imul(right - left >>> 0, bottom - top >>> 0) >>> 0), 0);
    for (let y = top; y < bottom; y = y + 1 >>> 0) {
      for (let x = left; x < right; x = x + 1 >>> 0) {
        ambient.a[ambient.o + ((Math.imul(y - top >>> 0, right - left >>> 0) >>> 0) + (x - left >>> 0) >>> 0)] = Math.fround($min(AmbientForPix$i32$i32$f64$LightMapZoom(x | 0, y | 0, R, light_mapZoom) / norm, 1));
      }
    }
    gl$glBindTexture(3553, this.Tex);
    gl$glTexSubImage2D(3553, 0, left | 0, top | 0, right - left >>> 0 | 0, bottom - top >>> 0 | 0, 6403, 5126, ambient);
    $delete(ambient);
  }

  GetFragTransform(vpRect, clipRect, outRect, ambientTransform) {
    let trans = new $.C4FragTransform();
    trans.Scale(Math.fround(1), Math.fround(-1));
    trans.Translate(Math.fround(0), Math.fround(outRect.Hgt));
    trans.Translate(Math.fround(-clipRect.x | 0), Math.fround(-clipRect.y | 0));
    trans.Scale(Math.fround(1 / Math.fround(clipRect.Wdt)), Math.fround(1 / Math.fround(clipRect.Hgt)));
    trans.Scale(Math.fround(vpRect.right - vpRect.left), Math.fround(vpRect.bottom - vpRect.top));
    trans.Translate(vpRect.left, vpRect.top);
    trans.Scale(Math.fround(1 / Math.fround(this.LandscapeX)), Math.fround(1 / Math.fround(this.LandscapeY)));
    trans.Get2x3(ambientTransform);
  }

  GetLandscapeWidth() {
    return this.LandscapeX;
  }

  GetLandscapeHeight() {
    return this.LandscapeY;
  }

  $clone() { return new C4FoWAmbient().$assign(this); }
  $assign(o) {
    this.Tex = o.Tex;
    this.Resolution = o.Resolution;
    this.Radius = o.Radius;
    this.FullCoverage = o.FullCoverage;
    this.LandscapeX = o.LandscapeX;
    this.LandscapeY = o.LandscapeY;
    this.SizeX = o.SizeX;
    this.SizeY = o.SizeY;
    this.Brightness = o.Brightness;
    return this;
  }
}

export class LightMapFull {

  op_call(_x, _y) {
    return true;
  }

  $clone() { return new LightMapFull().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class LightMapZoom {
  Landscape = null;
  sx = 0;
  sy = 0;

  init(landscape, sx, sy) {
    this.sx = sx;
    this.sy = sy;
    this.Landscape = landscape;
    return this;
  }

  op_call(x, y) {
    let lx = $.Clamp$i32$i32$i32(ftoi32((x + 0.5) * this.sx), 0, this.Landscape.GetWidth() - 1 | 0);
    let ly = $.Clamp$i32$i32$i32(ftoi32((y + 0.5) * this.sy), 0, this.Landscape.GetHeight() - 1 | 0);
    return $.Landscape._GetLight(lx, ly);
  }

  $clone() { return new LightMapZoom().$assign(this); }
  $assign(o) {
    this.Landscape = o.Landscape;
    this.sx = o.sx;
    this.sy = o.sy;
    return this;
  }
}

export function AmbientForPix$i32$i32$f64$LightMapFull(x0, y0, R, light_map) {
  let d = 0;
  let Ri = ftoi32(R);
  for (let y = 1; y <= Ri; y = y + 1 | 0) {
    let max_x = ftoi32(c$sqrt(R * R - Math.imul(y, y)));
    for (let x = 1; x <= max_x; x = x + 1 | 0) {
      let l = c$sqrt(Math.imul(x, x) + Math.imul(y, y) | 0);
      0;
      if (light_map.op_call(x0 + x | 0, y0 + y | 0)) {
        d += 1 / l;
      }
      if (light_map.op_call(x0 + x | 0, y0 - y | 0)) {
        d += 1 / l;
      }
      if (light_map.op_call(x0 - x | 0, y0 - y | 0)) {
        d += 1 / l;
      }
      if (light_map.op_call(x0 - x | 0, y0 + y | 0)) {
        d += 1 / l;
      }
    }
    let l = y;
    if (light_map.op_call(x0 + y | 0, y0)) {
      d += 1 / l;
    }
    if (light_map.op_call(x0 - y | 0, y0)) {
      d += 1 / l;
    }
    if (light_map.op_call(x0, y0 + y | 0)) {
      d += 1 / l;
    }
    if (light_map.op_call(x0, y0 - y | 0)) {
      d += 1 / l;
    }
  }
  if (light_map.op_call(x0, y0)) {
    d += 2 * c$sqrt(3.141592653589793);
  }
  return d;
}

export function AmbientForPix$i32$i32$f64$LightMapZoom(x0, y0, R, light_map) {
  let d = 0;
  let Ri = ftoi32(R);
  for (let y = 1; y <= Ri; y = y + 1 | 0) {
    let max_x = ftoi32(c$sqrt(R * R - Math.imul(y, y)));
    for (let x = 1; x <= max_x; x = x + 1 | 0) {
      let l = c$sqrt(Math.imul(x, x) + Math.imul(y, y) | 0);
      0;
      if (light_map.op_call(x0 + x | 0, y0 + y | 0)) {
        d += 1 / l;
      }
      if (light_map.op_call(x0 + x | 0, y0 - y | 0)) {
        d += 1 / l;
      }
      if (light_map.op_call(x0 - x | 0, y0 - y | 0)) {
        d += 1 / l;
      }
      if (light_map.op_call(x0 - x | 0, y0 + y | 0)) {
        d += 1 / l;
      }
    }
    let l = y;
    if (light_map.op_call(x0 + y | 0, y0)) {
      d += 1 / l;
    }
    if (light_map.op_call(x0 - y | 0, y0)) {
      d += 1 / l;
    }
    if (light_map.op_call(x0, y0 + y | 0)) {
      d += 1 / l;
    }
    if (light_map.op_call(x0, y0 - y | 0)) {
      d += 1 / l;
    }
  }
  if (light_map.op_call(x0, y0)) {
    d += 2 * c$sqrt(3.141592653589793);
  }
  return d;
}

export function $init(): void {
}

Object.assign($, { AmbientForPix$i32$i32$f64$LightMapFull, AmbientForPix$i32$i32$f64$LightMapZoom, C4FoWAmbient, LightMapFull, LightMapZoom });
