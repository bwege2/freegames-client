// @ts-nocheck
// OpenClonk 36de799: src/landscape/C4LandscapeRender.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $ } from '../../rt/registry.ts';

export class C4LandscapeRender {
  iWidth = 0;
  iHeight = 0;
  pTexs = null;

  $clone() { return new C4LandscapeRender().$assign(this); }
  $assign(o) {
    this.iWidth = o.iWidth;
    this.iHeight = o.iHeight;
    this.pTexs = o.pTexs;
    return this;
  }
}




export function $init(): void {
  $.C4LR_BytesPerPx$C4LandscapeRender = 3;
  $.C4LR_BytesPerSurface$C4LandscapeRender = 4;
  $.C4LR_SurfaceCount$C4LandscapeRender = 2;
}

Object.assign($, { C4LandscapeRender });
