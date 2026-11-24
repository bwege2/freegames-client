// @ts-nocheck
// OpenClonk 36de799: src/landscape/C4LandscapeRender.cpp, src/landscape/C4LandscapeRender.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { gl$glBindBuffer, gl$glBindTexture, gl$glBindVertexArray, gl$glBlendFunc, gl$glBufferData, gl$glBufferSubData, gl$glDeleteBuffers, gl$glDeleteTextures, gl$glDrawArrays, gl$glEnableVertexAttribArray, gl$glGenBuffers, gl$glGenTextures, gl$glGenerateMipmap, gl$glGetError, gl$glGetIntegerv, gl$glPixelStorei, gl$glTexImage1D, gl$glTexImage3D, gl$glTexParameteri, gl$glVertexAttribPointer } from '../../rt/gl.ts';
import { $i64n, $u64n, ftoi32 } from '../../rt/int.ts';
import { c$fmod, c$memset, c$strchr } from '../../rt/libc.ts';
import { $own, $padd, $peq, $rd, $reinterp, $wr, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $chronoNow, $delete, $durationCast, $max, $min, $vpush, StdString } from '../../rt/std.ts';

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

export class C4LandscapeRenderGL extends C4LandscapeRender {
  static UniformNames;
  Surfaces = new Array(2).fill(null);
  Shader = new $.C4Shader().init();
  ShaderLight = new $.C4Shader().init();
  hVBO = 0;
  hVAOIDNoLight = 0;
  hVAOIDLight = 0;
  matMapTexture = 0;
  hMaterialTexture = 0;
  MaterialTextureMap = [];
  iMaterialTextureDepth = 0;
  iMaterialWidth = 0;
  iMaterialHeight = 0;
  fctScaler = new $.C4FacetSurface().init();
  TimerStart = 0;

  init() {
    this.Shader = new $.C4Shader().init();
    this.ShaderLight = new $.C4Shader().init();
    this.MaterialTextureMap = [];
    this.fctScaler = new $.C4FacetSurface().init();
    this.TimerStart = 0;
    $.ZeroMem$ppC4Surface$u64(P(this.Surfaces, 0), 16);
    this.hMaterialTexture = this.matMapTexture = 0;
    this.hVBO = 0;
    this.hVAOIDNoLight = 0;
    this.hVAOIDLight = 0;
    return this;
  }

  $dtor() {
    C4LandscapeRenderGL.prototype.Clear.call(this);
  }

  ReInit(iWidth, iHeight) {
    let $t1;
    this.iWidth = iWidth;
    this.iHeight = iHeight;
    $t1 = this.Surfaces;
    for (let $i1 = 0; $i1 < $t1.length; $i1++) {
      const Surface = P($t1, $i1);
      $delete(Surface.a[Surface.o]);
      Surface.a[Surface.o] = null;
    }
    if (!this.InitLandscapeTexture()) {
      $.LogFatal(S("[!] Could not initialize landscape texture!"));
      return false;
    }
    return true;
  }

  Init(iWidth, iHeight, pTexs, pGraphics) {
    this.Clear();
    this.iWidth = iWidth;
    this.iHeight = iHeight;
    this.pTexs = pTexs;
    this.TimerStart = $chronoNow();
    if (!this.InitLandscapeTexture()) {
      $.LogFatal(S("[!] Could not initialize landscape texture!"));
      return false;
    }
    if (!this.InitMaterialTexture(pTexs)) {
      $.LogFatal(S("[!] Could not initialize landscape textures for rendering!"));
      return false;
    }
    if (!this.LoadScaler(pGraphics)) {
      $.LogFatal(S("[!] Could not load scaler!"));
      return false;
    }
    if (!this.LoadShaders(pGraphics)) {
      $.LogFatal(S("[!] Could not initialize landscape shader!"));
      return false;
    }
    if (!this.InitVBO()) {
      $.LogFatal(S("[!] Could not initialize landscape VBO!"));
      return false;
    }
    return true;
  }

  Clear() {
    this.ClearShaders();
    let i = 0;
    for (i = 0; i < 2; i = i + 1 | 0) {
      $delete(this.Surfaces[i]);
      this.Surfaces[i] = null;
    }
    if (this.hMaterialTexture !== 0) {
      gl$glDeleteTextures(1, P(this, "hMaterialTexture"));
    }
    this.hMaterialTexture = 0;
    if (this.matMapTexture !== 0) {
      gl$glDeleteTextures(1, P(this, "matMapTexture"));
    }
    this.matMapTexture = 0;
    if (this.hVBO !== 0) {
      gl$glDeleteBuffers(1, P(this, "hVBO"));
      this.hVBO = 0;
    }
    if (this.hVAOIDLight !== 0) {
      $.pGL.FreeVAOID(this.hVAOIDLight);
      this.hVAOIDLight = 0;
    }
    if (this.hVAOIDNoLight !== 0) {
      $.pGL.FreeVAOID(this.hVAOIDNoLight);
      this.hVAOIDNoLight = 0;
    }
  }

  GetAffectedRect(Rect) {
    Rect.Enlarge$i32$i32(7, 7);
    return Rect.$clone();
  }

  Update(To, pSource) {
    let $t1, $t2, $t3, $t4, $t5, $t6, $t7, $t8, $t9, $t10, $t11, $t12;
    To.Intersect(new $.C4Rect().init$i32$i32$i32$i32(0, 0, this.iWidth, this.iHeight));
    if (To.Wdt <= 0 || To.Hgt <= 0) {
      return;
    }
    $t1 = this.Surfaces;
    for (let $i1 = 0; $i1 < $t1.length; $i1++) {
      const Surface = P($t1, $i1);
      if (!Surface.a[Surface.o].Lock()) {
        return;
      }
      Surface.a[Surface.o].ClearBoxDw(To.x, To.y, To.Wdt, To.Hgt);
    }
    let x = 0;
    let y = 0;
    let placementSumsWidth = 14 + To.Wdt | 0;
    let placementSumsUp = P(new Int32Array($u64n(Math.imul(placementSumsWidth, 2))), 0);
    let placementSumsDown = $padd(placementSumsUp, placementSumsWidth);
    for (x = 0; x < placementSumsWidth; x = x + 1 | 0) {
      placementSumsUp.a[placementSumsUp.o + x] = 0;
      placementSumsDown.a[placementSumsDown.o + x] = 0;
      if (((To.x + x | 0) - 7 | 0) < 0 || ((To.x + x | 0) - 7 | 0) >= this.iWidth) {
        continue;
      }
      for (y = 1; y <= $min($.C4LR_BiasDistanceY$C4LandscapeRender, To.y); y = y + 1 | 0) {
        ($t2 = $padd(placementSumsUp, x), $t2.a[$t2.o] = $t2.a[$t2.o] + pSource._GetPlacement((To.x + x | 0) - 7 | 0, To.y - y | 0) | 0);
      }
      for (y = 1; y <= $min($.C4LR_BiasDistanceY$C4LandscapeRender, (this.iHeight - 1 | 0) - To.y | 0); y = y + 1 | 0) {
        ($t3 = $padd(placementSumsDown, x), $t3.a[$t3.o] = $t3.a[$t3.o] + pSource._GetPlacement((To.x + x | 0) - 7 | 0, To.y + y | 0) | 0);
      }
    }
    const texture = new Array(2).fill(null);
    x = y = 0;
    for (let i = 0; i < 2; i = i + 1 | 0) {
      texture[i] = this.Surfaces[i].texture;
    }
    for (y = 0; y < To.Hgt; y = y + 1 | 0) {
      let sumLeft = 0;
      let sumRight = 0;
      for (x = 1; x <= $min($.C4LR_BiasDistanceX$C4LandscapeRender, To.x); x = x + 1 | 0) {
        sumLeft = sumLeft + pSource._GetPlacement(To.x - x | 0, To.y + y | 0) | 0;
      }
      for (x = 1; x <= $min($.C4LR_BiasDistanceX$C4LandscapeRender, (this.iWidth - 1 | 0) - To.x | 0); x = x + 1 | 0) {
        sumRight = sumRight + pSource._GetPlacement(To.x + x | 0, To.y + y | 0) | 0;
      }
      for (let i$2 = 1; i$2 <= 7; i$2 = i$2 + 1 | 0) {
        sumLeft = sumLeft + placementSumsUp.a[placementSumsUp.o + (7 - i$2 | 0)] | 0;
        sumLeft = sumLeft + placementSumsDown.a[placementSumsDown.o + (7 - i$2 | 0)] | 0;
        sumRight = sumRight + placementSumsUp.a[placementSumsUp.o + (7 + i$2 | 0)] | 0;
        sumRight = sumRight + placementSumsDown.a[placementSumsDown.o + (7 + i$2 | 0)] | 0;
      }
      let sumUp = 0;
      let sumDown = 0;
      for (let i$3 = -7; i$3 <= 7; i$3 = i$3 + 1 | 0) {
        sumUp = sumUp + placementSumsUp.a[placementSumsUp.o + (7 + i$3 | 0)] | 0;
        sumDown = sumDown + placementSumsDown.a[placementSumsDown.o + (7 + i$3 | 0)] | 0;
      }
      for (x = 0; x < To.Wdt; x = x + 1 | 0) {
        let pixel = pSource._GetPix(To.x + x | 0, To.y + y | 0);
        let placement = pSource._GetPlacement(To.x + x | 0, To.y + y | 0);
        let horizontalFactor = 105;
        let horizontalBias = $max(0, Math.imul(placement, 105) - sumRight | 0) - $max(0, Math.imul(placement, 105) - sumLeft | 0) | 0;
        let verticalFactor = 105;
        let verticalBias = $max(0, Math.imul(placement, 105) - sumDown | 0) - $max(0, Math.imul(placement, 105) - sumUp | 0) | 0;
        let maximumPlacementDifference = 40;
        let horizontalBiasScaled = $.Clamp$i32$i32$i32(((Math.imul(horizontalBias, 127) / 40 | 0) / 105 | 0) + 128 | 0, 0, 255);
        let verticalBiasScaled = $.Clamp$i32$i32$i32(((Math.imul(verticalBias, 127) / 40 | 0) / 105 | 0) + 128 | 0, 0, 255);
        const data = new Uint8Array(8);
        c$memset(P(data, 0), 0, 8);
        data[0 /*C4LR_Material*/] = pixel & 0xff;
        data[1 /*C4LR_BiasX*/] = horizontalBiasScaled & 0xff;
        data[2 /*C4LR_BiasY*/] = verticalBiasScaled & 0xff;
        data[3 /*C4LR_Scaler*/] = this.CalculateScalerBitmask(x, y, To.$clone(), pSource) & 0xff;
        data[4 /*C4LR_Place*/] = placement & 0xff;
        for (let i$4 = 0; i$4 < 2; i$4 = i$4 + 1 | 0) {
          texture[i$4].SetPix(To.x + x | 0, To.y + y | 0, $.RGBA(data[Math.imul(i$4, 4) + 0 | 0], data[Math.imul(i$4, 4) + 1 | 0], data[Math.imul(i$4, 4) + 2 | 0], data[Math.imul(i$4, 4) + 3 | 0]));
        }
        if (x < (To.Wdt - 1 | 0)) {
          sumLeft = sumLeft - (placementSumsUp.a[placementSumsUp.o + x] + placementSumsDown.a[placementSumsDown.o + x] | 0) | 0;
          sumLeft = sumLeft + (placementSumsUp.a[placementSumsUp.o + (x + 7 | 0)] + placementSumsDown.a[placementSumsDown.o + (x + 7 | 0)] | 0) | 0;
          sumRight = sumRight - (placementSumsUp.a[placementSumsUp.o + ((x + 7 | 0) + 1 | 0)] + placementSumsDown.a[placementSumsDown.o + ((x + 7 | 0) + 1 | 0)] | 0) | 0;
          sumUp = sumUp - placementSumsUp.a[placementSumsUp.o + x] | 0;
          sumDown = sumDown - placementSumsDown.a[placementSumsDown.o + x] | 0;
          sumRight = sumRight + (placementSumsUp.a[placementSumsUp.o + ((x + 14 | 0) + 1 | 0)] + placementSumsDown.a[placementSumsDown.o + ((x + 14 | 0) + 1 | 0)] | 0) | 0;
          sumUp = sumUp + placementSumsUp.a[placementSumsUp.o + ((x + 14 | 0) + 1 | 0)] | 0;
          sumDown = sumDown + placementSumsDown.a[placementSumsDown.o + ((x + 14 | 0) + 1 | 0)] | 0;
        }
        if (((x + To.x | 0) + 1 | 0) < this.iWidth) {
          sumRight = sumRight - pSource._GetPlacement((To.x + x | 0) + 1 | 0, To.y + y | 0) | 0;
        }
        if ((((To.x + x | 0) + 7 | 0) + 1 | 0) < this.iWidth) {
          sumRight = sumRight + pSource._GetPlacement(((To.x + x | 0) + 7 | 0) + 1 | 0, To.y + y | 0) | 0;
        }
        sumLeft = sumLeft + placement | 0;
        if (((To.x + x | 0) - 7 | 0) >= 0) {
          sumLeft = sumLeft - pSource._GetPlacement((To.x + x | 0) - 7 | 0, To.y + y | 0) | 0;
        }
        if ((To.x + x | 0) >= 7) {
          if (((To.y + y | 0) + 1 | 0) < this.iHeight) {
            ($t4 = $padd(placementSumsDown, x), $t4.a[$t4.o] = $t4.a[$t4.o] - pSource._GetPlacement((To.x + x | 0) - 7 | 0, (To.y + y | 0) + 1 | 0) | 0);
          }
          if ((((To.y + y | 0) + 7 | 0) + 1 | 0) < this.iHeight) {
            ($t5 = $padd(placementSumsDown, x), $t5.a[$t5.o] = $t5.a[$t5.o] + pSource._GetPlacement((To.x + x | 0) - 7 | 0, ((To.y + y | 0) + 7 | 0) + 1 | 0) | 0);
          }
          if (((To.y + y | 0) - 7 | 0) >= 0) {
            ($t6 = $padd(placementSumsUp, x), $t6.a[$t6.o] = $t6.a[$t6.o] - pSource._GetPlacement((To.x + x | 0) - 7 | 0, (To.y + y | 0) - 7 | 0) | 0);
          }
          ($t7 = $padd(placementSumsUp, x), $t7.a[$t7.o] = $t7.a[$t7.o] + pSource._GetPlacement((To.x + x | 0) - 7 | 0, To.y + y | 0) | 0);
        }
      }
      if ((To.x + x | 0) >= 7) {
        for (; x < $min(placementSumsWidth, (this.iWidth - To.x | 0) + 7 | 0); x = x + 1 | 0) {
          if (((To.y + y | 0) + 1 | 0) < this.iHeight) {
            ($t8 = $padd(placementSumsDown, x), $t8.a[$t8.o] = $t8.a[$t8.o] - pSource._GetPlacement((To.x + x | 0) - 7 | 0, (To.y + y | 0) + 1 | 0) | 0);
          }
          if ((((To.y + y | 0) + 7 | 0) + 1 | 0) < this.iHeight) {
            ($t9 = $padd(placementSumsDown, x), $t9.a[$t9.o] = $t9.a[$t9.o] + pSource._GetPlacement((To.x + x | 0) - 7 | 0, ((To.y + y | 0) + 7 | 0) + 1 | 0) | 0);
          }
          if (((To.y + y | 0) - 7 | 0) >= 0) {
            ($t10 = $padd(placementSumsUp, x), $t10.a[$t10.o] = $t10.a[$t10.o] - pSource._GetPlacement((To.x + x | 0) - 7 | 0, (To.y + y | 0) - 7 | 0) | 0);
          }
          ($t11 = $padd(placementSumsUp, x), $t11.a[$t11.o] = $t11.a[$t11.o] + pSource._GetPlacement((To.x + x | 0) - 7 | 0, To.y + y | 0) | 0);
        }
      }
    }
    $delete(placementSumsUp);
    $t12 = this.Surfaces;
    for (let $i1 = 0; $i1 < $t12.length; $i1++) {
      const Surface = P($t12, $i1);
      Surface.a[Surface.o].Unlock();
    }
  }

  Draw(cgo, Light, clrMod) {
    if ($.pGL == null && !this.Shader.Initialised() && !this.ShaderLight.Initialised()) {
      return;
    }
    let sfcTarget = cgo.Surface;
    if (!$.pGL.PrepareRendering(sfcTarget)) {
      return;
    }
    let shader = this.Shader;
    if (Light != null) {
      shader = this.ShaderLight;
    }
    if (!shader.Initialised()) {
      return;
    }
    let ShaderCall = new $.C4ShaderCall().init(shader);
    try {
      ShaderCall.Start();
      ShaderCall.SetUniformMatrix4x4$i32$StdProjectionMatrix(0, $.pGL.GetProjectionMatrix());
      ShaderCall.SetUniform3fv(6, 1, P($.pGL.gammaOut, 0));
      ShaderCall.SetUniform2f(7, Math.fround(this.Surfaces[0].Wdt), Math.fround(this.Surfaces[0].Hgt));
      let centerX = Math.fround(cgo.TargetX + Math.fround(cgo.Wdt / Math.fround(2)));
      let centerY = Math.fround(cgo.TargetY + Math.fround(cgo.Hgt / Math.fround(2)));
      ShaderCall.SetUniform2f(8, Math.fround(centerX / Math.fround(this.Surfaces[0].Wdt)), Math.fround(centerY / Math.fround(this.Surfaces[0].Hgt)));
      ShaderCall.SetUniform1f(10, Math.fround(this.iMaterialTextureDepth));
      ShaderCall.SetUniform2f(11, Math.fround(Math.fround(this.iMaterialWidth) / Math.fround($.Game.C4S.Landscape.MaterialZoom)), Math.fround(Math.fround(this.iMaterialHeight) / Math.fround($.Game.C4S.Landscape.MaterialZoom)));
      const fMod = new Float32Array([Math.fround(Math.fround((clrMod >>> 16 & 255) >>> 0) / 255), Math.fround(Math.fround((clrMod >>> 8 & 255) >>> 0) / 255), Math.fround(Math.fround((clrMod & 255) >>> 0) / 255), Math.fround(Math.fround((clrMod >>> 24 & 255) >>> 0) / 255)]);
      ShaderCall.SetUniform4fv(14, 1, P(fMod, 0));
      if (Light != null) {
        let ViewportRect = Light.getViewportRegion().$clone();
        let ClipRect = $.pDraw.GetClipRect();
        let OutRect = $.pDraw.GetOutRect();
        const ambientTransform = new Float32Array(6);
        Light.getFoW().Ambient.GetFragTransform(ViewportRect, ClipRect, OutRect, P(ambientTransform, 0));
        ShaderCall.SetUniformMatrix2x3fv(13, 1, P(ambientTransform, 0));
        ShaderCall.SetUniform1f(12, Math.fround(Light.getFoW().Ambient.GetBrightness()));
      }
      ShaderCall.SetUniform1i(15, $.Game.FrameCounter);
      let now = $chronoNow();
      let epoch = $durationCast(now - this.TimerStart, 1000000) / 1000000 | 0;
      ShaderCall.SetUniform1i(16, epoch);
      $.pDraw.scriptUniform.Apply(ShaderCall);
      if (shader.HaveUniform(1)) {
        const iLandscapeUnits = new Int32Array(2);
        for (let i = 0; i < 2; i = i + 1 | 0) {
          iLandscapeUnits[i] = ShaderCall.AllocTexUnit(-1) - 33984 | 0;
          gl$glBindTexture(3553, this.Surfaces[i].texture.texName);
          if ($.pGL.Zoom !== 1) {
            gl$glTexParameteri(3553, 10240, 9729);
            gl$glTexParameteri(3553, 10241, 9729);
          } else {
            gl$glTexParameteri(3553, 10240, 9728);
            gl$glTexParameteri(3553, 10241, 9728);
          }
        }
        ShaderCall.SetUniform1iv(1, 2, P(iLandscapeUnits, 0));
      }
      if (Light != null && ShaderCall.AllocTexUnit(4) !== 0) {
        gl$glBindTexture(3553, Light.getSurfaceName());
        gl$glTexParameteri(3553, 10240, 9729);
        gl$glTexParameteri(3553, 10241, 9729);
      }
      if (Light != null && ShaderCall.AllocTexUnit(5) !== 0) {
        gl$glBindTexture(3553, Light.getFoW().Ambient.Tex);
      }
      if (ShaderCall.AllocTexUnit(2) !== 0) {
        gl$glBindTexture(3553, this.fctScaler.Surface.texture.texName);
        gl$glTexParameteri(3553, 10240, 9729);
        gl$glTexParameteri(3553, 10241, 9729);
      }
      if (ShaderCall.AllocTexUnit(3) !== 0) {
        gl$glBindTexture(35866, this.hMaterialTexture);
      }
      if (ShaderCall.AllocTexUnit(9) !== 0) {
        const MatMap = new Uint32Array(512);
        this.BuildMatMap(P(MatMap, 0));
        gl$glBindTexture(3552, this.matMapTexture);
        gl$glTexImage1D(3552, 0, 32856, 512, 0, 6408, 5121, P(MatMap, 0));
        gl$glTexParameteri(3552, 10241, 9728);
        gl$glTexParameteri(3552, 10240, 9728);
      }
      let fTexBlt = new $.FLOAT_RECT();
      let fx = cgo.TargetX;
      let fy = cgo.TargetY;
      fTexBlt.left = Math.fround(fx / Math.fround(this.Surfaces[0].Wdt));
      fTexBlt.top = Math.fround(fy / Math.fround(this.Surfaces[0].Hgt));
      fTexBlt.right = Math.fround(Math.fround(fx + cgo.Wdt) / Math.fround(this.Surfaces[0].Wdt));
      fTexBlt.bottom = Math.fround(Math.fround(fy + cgo.Hgt) / Math.fround(this.Surfaces[0].Hgt));
      let tTexBlt = new $.FLOAT_RECT();
      const tx = [cgo.X];
      const ty = [cgo.Y];
      $.pGL.ApplyZoom(P(tx, 0), P(ty, 0));
      tTexBlt.left = tx[0];
      tTexBlt.top = ty[0];
      tTexBlt.right = Math.fround(tx[0] + Math.fround(cgo.Wdt * $.pGL.Zoom));
      tTexBlt.bottom = Math.fround(ty[0] + Math.fround(cgo.Hgt * $.pGL.Zoom));
      gl$glBlendFunc(770, 771);
      const vtxData = new Float32Array(24);
      let pos = P(vtxData, 0);
      let tex = P(vtxData, 8);
      let lightTex = P(vtxData, 16);
      pos.a[pos.o + 0] = tTexBlt.left;
      pos.a[pos.o + 1] = tTexBlt.top;
      pos.a[pos.o + 2] = tTexBlt.right;
      pos.a[pos.o + 3] = tTexBlt.top;
      pos.a[pos.o + 4] = tTexBlt.left;
      pos.a[pos.o + 5] = tTexBlt.bottom;
      pos.a[pos.o + 6] = tTexBlt.right;
      pos.a[pos.o + 7] = tTexBlt.bottom;
      tex.a[tex.o + 0] = fTexBlt.left;
      tex.a[tex.o + 1] = fTexBlt.top;
      tex.a[tex.o + 2] = fTexBlt.right;
      tex.a[tex.o + 3] = fTexBlt.top;
      tex.a[tex.o + 4] = fTexBlt.left;
      tex.a[tex.o + 5] = fTexBlt.bottom;
      tex.a[tex.o + 6] = fTexBlt.right;
      tex.a[tex.o + 7] = fTexBlt.bottom;
      let nFloats = 16;
      if (Light != null) {
        let lTexBlt = new $.FLOAT_RECT();
        let LightRect = Light.getRegion().$clone();
        let iLightWdt = Light.getSurfaceWidth();
        let iLightHgt = Light.getSurfaceHeight();
        lTexBlt.left = Math.fround(Math.fround(fx - Math.fround(LightRect.x)) / Math.fround(iLightWdt));
        lTexBlt.top = Math.fround(1 - Math.fround(Math.fround(fy - Math.fround(LightRect.y)) / Math.fround(iLightHgt)));
        lTexBlt.right = Math.fround(Math.fround(Math.fround(fx + cgo.Wdt) - Math.fround(LightRect.x)) / Math.fround(iLightWdt));
        lTexBlt.bottom = Math.fround(1 - Math.fround(Math.fround(Math.fround(fy + cgo.Hgt) - Math.fround(LightRect.y)) / Math.fround(iLightHgt)));
        lightTex.a[lightTex.o + 0] = lTexBlt.left;
        lightTex.a[lightTex.o + 1] = lTexBlt.top;
        lightTex.a[lightTex.o + 2] = lTexBlt.right;
        lightTex.a[lightTex.o + 3] = lTexBlt.top;
        lightTex.a[lightTex.o + 4] = lTexBlt.left;
        lightTex.a[lightTex.o + 5] = lTexBlt.bottom;
        lightTex.a[lightTex.o + 6] = lTexBlt.right;
        lightTex.a[lightTex.o + 7] = lTexBlt.bottom;
        nFloats = 24;
      }
      gl$glBindBuffer(34962, this.hVBO);
      gl$glBufferSubData(34962, 0, $i64n(nFloats * 4), P(vtxData, 0));
      let vaoid = Light != null ? this.hVAOIDLight : this.hVAOIDNoLight;
      const vao = [0];
      let has_vao = $.pGL.GetVAO(vaoid, P(vao, 0));
      gl$glBindVertexArray(vao[0]);
      if (!has_vao) {
        gl$glEnableVertexAttribArray(shader.GetAttribute(0) >>> 0);
        gl$glEnableVertexAttribArray(shader.GetAttribute(1) >>> 0);
        if (Light != null) {
          gl$glEnableVertexAttribArray(shader.GetAttribute(2) >>> 0);
        }
        gl$glVertexAttribPointer(shader.GetAttribute(0) >>> 0, 2, 5126, 0, 0, null);
        gl$glVertexAttribPointer(shader.GetAttribute(1) >>> 0, 2, 5126, 0, 0, P(null, 32));
        if (Light != null) {
          gl$glVertexAttribPointer(shader.GetAttribute(2) >>> 0, 2, 5126, 0, 0, P(null, 64));
        }
      }
      gl$glDrawArrays(5, 0, 4);
      gl$glBindVertexArray(0);
      gl$glBindBuffer(34962, 0);
      ShaderCall.Finish();
    } finally { ShaderCall && ShaderCall.$dtor(); }
  }

  InitLandscapeTexture() {
    let $t1;
    let iSfcWdt = this.iWidth;
    let iSfcHgt = this.iHeight;
    $t1 = this.Surfaces;
    for (let $i1 = 0; $i1 < $t1.length; $i1++) {
      const Surface = P($t1, $i1);
      Surface.a[Surface.o] = new $.C4Surface().init$v();
      if (!Surface.a[Surface.o].Create(iSfcWdt, iSfcHgt)) {
        return false;
      }
    }
    return true;
  }

  InitMaterialTexture(pTexs) {
    let $t1, $t2, $t3;
    $vpush(this.MaterialTextureMap, new $.StdCopyStrBuf().init$string(StdString.of(S(""))));
    this.AddTexturesFromMap(pTexs);
    this.iMaterialTextureDepth = 2 * this.MaterialTextureMap.length | 0;
    let iNormalDepth = this.iMaterialTextureDepth / 2 | 0;
    let pTex = null;
    let pRefSfc = null;
    for (let iTexIx = 0; (pTex = pTexs.GetTexture$pi8(pTexs.GetTexture$i32(iTexIx))) != null; iTexIx = iTexIx + 1 | 0) {
      {
        let pSfc = pTex.Surface32;
        if (pSfc != null) {
          if (pRefSfc == null || pRefSfc.Wdt < pSfc.Wdt || pRefSfc.Hgt < pSfc.Hgt) {
            pRefSfc = pSfc;
          }
        }
      }
    }
    if (pRefSfc == null) {
      return false;
    }
    let iTexWdt = pRefSfc.Wdt;
    let iTexHgt = pRefSfc.Hgt;
    const iMaxTexSize = [0];
    const iMaxTexLayers = [0];
    gl$glGetIntegerv(3379, P(iMaxTexSize, 0));
    gl$glGetIntegerv(35071, P(iMaxTexLayers, 0));
    if (iTexWdt > iMaxTexSize[0] || iTexHgt > iMaxTexSize[0]) {
      iTexWdt = $min(iTexWdt, iMaxTexSize[0]);
      iTexHgt = $min(iTexHgt, iMaxTexSize[0]);
      $.LogF(S("   gl: Material textures too large, GPU only supports %dx%d! Cropping might occur!"), iMaxTexSize[0], iMaxTexSize[0]);
    }
    if (this.iMaterialTextureDepth >= iMaxTexLayers[0]) {
      $.LogF(S("   gl: Too many material textures! GPU only supports 3D texture depth of %d!"), iMaxTexSize[0]);
      return false;
    }
    this.iMaterialWidth = iTexWdt;
    this.iMaterialHeight = iTexHgt;
    let iTexSize = Math.imul(Math.imul(iTexWdt, iTexHgt), 4);
    let iSize = Math.imul(iTexSize, this.iMaterialTextureDepth);
    let pData = P(new Uint8Array($u64n(iSize)), 0);
    for (let i = 0; i < this.iMaterialTextureDepth; i = i + 1 | 0) {
      let p = $padd(pData, Math.imul(i, iTexSize));
      let Texture = new $.StdStrBuf();
      let fNormal = i >= iNormalDepth;
      if (i < (this.MaterialTextureMap.length | 0)) {
        Texture.Ref$StdStrBuf(this.MaterialTextureMap[$u64n(i)]);
      } else if (fNormal && i < (iNormalDepth + (this.MaterialTextureMap.length | 0) | 0)) {
        Texture.Format(S("%s_NRM"), this.MaterialTextureMap[$u64n(i - iNormalDepth | 0)].getData());
      }
      let pTex$2 = null;
      let pSurface = null;
      if ((pTex$2 = pTexs.GetTexture$pi8(Texture.getData())) != null && (pSurface = pTex$2.Surface32) != null) {
        if (pSurface.Wdt !== iTexWdt || pSurface.Hgt !== iTexHgt) {
          if (iTexWdt % pSurface.Wdt !== 0 || iTexHgt % pSurface.Hgt !== 0) {
            $.LogF(S("   gl: texture %s size mismatch (%dx%d vs %dx%d)!"), Texture.getData(), pSurface.Wdt, pSurface.Hgt, iTexWdt, iTexHgt);
          }
        }
        let texdata = $reinterp(p, "u32");
        pSurface.Lock();
        for (let y = 0; y < iTexHgt; y = y + 1 | 0) {
          for (let x = 0; x < iTexWdt; x = x + 1 | 0) {
            $wr(($t1 = texdata, texdata = texdata.add(1), $t1), 0, pSurface.GetPixDw(x % pSurface.Wdt, y % pSurface.Hgt, false));
          }
        }
        pSurface.Unlock();
        continue;
      }
      if ($.SEqual(Texture.getData(), $.SEPERATOR_TEXTURE$C4LandscapeRender)) {
        let texdata = $reinterp(p, "u32");
        for (let y = 0; y < iTexHgt; y = y + 1 | 0) {
          for (let x = 0; x < iTexWdt; x = x + 1 | 0) {
            $wr(($t2 = texdata, texdata = texdata.add(1), $t2), 0, (x + y | 0) % 32 < 16 ? $.RGBA(255, 0, 0, 255) : $.RGBA(0, 255, 255, 255));
          }
        }
        continue;
      }
      if (fNormal) {
        let texdata = $reinterp(p, "u32");
        for (let y = 0; y < iTexHgt; y = y + 1 | 0) {
          for (let x = 0; x < iTexWdt; x = x + 1 | 0) {
            $wr(($t3 = texdata, texdata = texdata.add(1), $t3), 0, $.RGBA(127, 127, 255, 255));
          }
        }
      } else {
        c$memset(p, 0, $u64n(iTexSize));
      }
    }
    while (gl$glGetError() !== 0) {
    }
    gl$glGenTextures(1, P(this, "matMapTexture"));
    gl$glGenTextures(1, P(this, "hMaterialTexture"));
    let iSizeSum = 0;
    gl$glBindTexture(35866, this.hMaterialTexture);
    gl$glPixelStorei(3317, 1);
    gl$glTexParameteri(35866, 10242, 10497);
    gl$glTexParameteri(35866, 10243, 10497);
    gl$glTexParameteri(35866, 10240, 9729);
    gl$glTexParameteri(35866, 10241, 9985);
    gl$glTexImage3D(35866, 0, 6408, iTexWdt, iTexHgt, this.iMaterialTextureDepth, 0, 32993, 33639, pData);
    gl$glGenerateMipmap(35866);
    iSizeSum = iSizeSum + Math.imul(Math.imul(Math.imul(iTexWdt, iTexHgt), this.iMaterialTextureDepth), 4) | 0;
    $delete(pData);
    {
      let err = gl$glGetError() | 0;
      if (err !== 0) {
        $.LogF(S("   gl: Could not load textures (error %d)"), err);
        return false;
      }
    }
    $.LogF(S("  gl: Texturing uses %d slots at %dx%d (%d MB total)"), this.MaterialTextureMap.length | 0, this.iMaterialWidth, this.iMaterialHeight, iSizeSum / 0xf4240 | 0);
    return true;
  }

  LoadShader(pGroups, shader, name, ssc) {
    shader.AddDefine(S("OPENCLONK"));
    shader.AddDefine(S("OC_LANDSCAPE"));
    if ((ssc & 8) !== 0) {
      shader.AddDefine(S("OC_DYNAMIC_LIGHT"));
    }
    shader.LoadVertexSlices(pGroups, S("LandscapeVertexShader.glsl"));
    shader.LoadFragmentSlices(pGroups, S("CommonShader.glsl"));
    shader.LoadFragmentSlices(pGroups, S("LandscapeShader.glsl"));
    shader.SetScriptCategories($own([StdString.of(S("Common")), StdString.of(S("Landscape"))]));
    const AttributeNames = new Array(4).fill(null);
    AttributeNames[0 /*C4LRA_Position*/] = S("oc_Position");
    AttributeNames[1 /*C4LRA_LandscapeTexCoord*/] = S("oc_LandscapeTexCoord");
    AttributeNames[2 /*C4LRA_LightTexCoord*/] = S("oc_LightTexCoord");
    AttributeNames[3 /*C4LRA_Count*/] = null;
    if (!shader.Init(name, P(C4LandscapeRenderGL.UniformNames, 0), P(AttributeNames, 0))) {
      shader.ClearSlices();
      return false;
    }
    return true;
  }

  LoadShaders(pGroups) {
    this.ClearShaders();
    $.ZeroMem$ppi8$u64(P(C4LandscapeRenderGL.UniformNames, 0), 144);
    C4LandscapeRenderGL.UniformNames[0 /*C4LRU_ProjectionMatrix*/] = S("projectionMatrix");
    C4LandscapeRenderGL.UniformNames[1 /*C4LRU_LandscapeTex*/] = S("landscapeTex");
    C4LandscapeRenderGL.UniformNames[2 /*C4LRU_ScalerTex*/] = S("scalerTex");
    C4LandscapeRenderGL.UniformNames[3 /*C4LRU_MaterialTex*/] = S("materialTex");
    C4LandscapeRenderGL.UniformNames[4 /*C4LRU_LightTex*/] = S("lightTex");
    C4LandscapeRenderGL.UniformNames[5 /*C4LRU_AmbientTex*/] = S("ambientTex");
    C4LandscapeRenderGL.UniformNames[6 /*C4LRU_Gamma*/] = S("gamma");
    C4LandscapeRenderGL.UniformNames[7 /*C4LRU_Resolution*/] = S("resolution");
    C4LandscapeRenderGL.UniformNames[8 /*C4LRU_Center*/] = S("center");
    C4LandscapeRenderGL.UniformNames[9 /*C4LRU_MatMapTex*/] = S("matMapTex");
    C4LandscapeRenderGL.UniformNames[10 /*C4LRU_MaterialDepth*/] = S("materialDepth");
    C4LandscapeRenderGL.UniformNames[11 /*C4LRU_MaterialSize*/] = S("materialSize");
    C4LandscapeRenderGL.UniformNames[12 /*C4LRU_AmbientBrightness*/] = S("ambientBrightness");
    C4LandscapeRenderGL.UniformNames[13 /*C4LRU_AmbientTransform*/] = S("ambientTransform");
    C4LandscapeRenderGL.UniformNames[14 /*C4LRU_Modulation*/] = S("clrMod");
    C4LandscapeRenderGL.UniformNames[15 /*C4LRU_FrameCounter*/] = S("frameCounter");
    C4LandscapeRenderGL.UniformNames[16 /*C4LRU_Time*/] = S("time");
    if (!this.LoadShader(pGroups, this.Shader, S("landscape"), 0)) {
      return false;
    }
    if (!this.LoadShader(pGroups, this.ShaderLight, S("landscapeLight"), 8)) {
      return false;
    }
    return true;
  }

  InitVBO() {
    0;
    gl$glGenBuffers(1, P(this, "hVBO"));
    gl$glBindBuffer(34962, this.hVBO);
    gl$glBufferData(34962, 96, null, 35040);
    gl$glBindBuffer(34962, 0);
    0;
    0;
    this.hVAOIDLight = $.pGL.GenVAOID();
    this.hVAOIDNoLight = $.pGL.GenVAOID();
    return true;
  }

  ClearShaders() {
    if (this.Shader.Initialised()) {
      this.Shader.Clear();
      this.Shader.ClearSlices();
    }
    if (this.ShaderLight.Initialised()) {
      this.ShaderLight.Clear();
      this.ShaderLight.ClearSlices();
    }
  }

  LoadScaler(pGroups) {
    let pGroup = pGroups.FindEntry(S("Scaler.png"));
    if (pGroup == null) {
      return false;
    }
    if (!this.fctScaler.Load(pGroup, S("Scaler.png"), -1, -1, false, 0)) {
      return false;
    }
    let iOrigWdt = 24;
    let iOrigHgt = 96;
    let iFactor = ftoi32(Math.fround(this.fctScaler.Wdt / Math.fround(24)));
    if (this.fctScaler.Wdt !== Math.fround(Math.imul(iFactor, 24)) || this.fctScaler.Hgt !== Math.fround(Math.imul(iFactor, 96))) {
      $.LogF(S("  gl: Unexpected scaler size - should be multiple of %dx%d!"), 24, 96);
      return false;
    }
    this.fctScaler.Surface.Lock();
    let i = 0;
    for (i = 0; i < 256; i = i + 1 | 0) {
      const p_x = new Int32Array([-1, 0, 1, -1, 1, -1, 0, 1, 0]);
      const p_y = new Int32Array([-1, -1, -1, 0, 0, 1, 1, 1, 0]);
      const pxAt = new Array(8).fill(false);
      for (let j = 0; j < 8; j = j + 1 | 0) {
        pxAt[j] = !!((i & (1 << j | 0)) !== 0);
      }
      const p2a = new Int32Array([5, 6, 7, 4, 0, 3, 2, 1]);
      const a2o = new Int32Array([3, 7, 6, 2, 0, 4, 5, 1]);
      const opx = new Int32Array([8, 8, 8, 8, 8, 8, 8, 8]);
      for (let j = 0; j < 4; j = j + 1 | 0) {
        do {
          let y = a2o[((8 + p2a[1 /*N*/] | 0) + j | 0) % 8];
          if (!pxAt[1 /*N*/] && opx[y] === 8) {
            opx[y] = 1 /*N*/;
          }
        } while (false);
        do {
          let y = a2o[((8 + p2a[1 /*N*/] | 0) + ((-j | 0) - 1 | 0) | 0) % 8];
          if (!pxAt[1 /*N*/] && opx[y] === 8) {
            opx[y] = 1 /*N*/;
          }
        } while (false);
        do {
          let y = a2o[((8 + p2a[6 /*S*/] | 0) + j | 0) % 8];
          if (!pxAt[6 /*S*/] && opx[y] === 8) {
            opx[y] = 6 /*S*/;
          }
        } while (false);
        do {
          let y = a2o[((8 + p2a[6 /*S*/] | 0) + ((-j | 0) - 1 | 0) | 0) % 8];
          if (!pxAt[6 /*S*/] && opx[y] === 8) {
            opx[y] = 6 /*S*/;
          }
        } while (false);
        do {
          let y = a2o[((8 + p2a[3 /*W*/] | 0) + j | 0) % 8];
          if (!pxAt[3 /*W*/] && opx[y] === 8) {
            opx[y] = 3 /*W*/;
          }
        } while (false);
        do {
          let y = a2o[((8 + p2a[3 /*W*/] | 0) + ((-j | 0) - 1 | 0) | 0) % 8];
          if (!pxAt[3 /*W*/] && opx[y] === 8) {
            opx[y] = 3 /*W*/;
          }
        } while (false);
        do {
          let y = a2o[((8 + p2a[4 /*E*/] | 0) + j | 0) % 8];
          if (!pxAt[4 /*E*/] && opx[y] === 8) {
            opx[y] = 4 /*E*/;
          }
        } while (false);
        do {
          let y = a2o[((8 + p2a[4 /*E*/] | 0) + ((-j | 0) - 1 | 0) | 0) % 8];
          if (!pxAt[4 /*E*/] && opx[y] === 8) {
            opx[y] = 4 /*E*/;
          }
        } while (false);
        do {
          let y = a2o[((8 + p2a[0 /*NW*/] | 0) + j | 0) % 8];
          if (!pxAt[0 /*NW*/] && opx[y] === 8) {
            opx[y] = 0 /*NW*/;
          }
        } while (false);
        do {
          let y = a2o[((8 + p2a[0 /*NW*/] | 0) + ((-j | 0) - 1 | 0) | 0) % 8];
          if (!pxAt[0 /*NW*/] && opx[y] === 8) {
            opx[y] = 0 /*NW*/;
          }
        } while (false);
        do {
          let y = a2o[((8 + p2a[5 /*SW*/] | 0) + j | 0) % 8];
          if (!pxAt[5 /*SW*/] && opx[y] === 8) {
            opx[y] = 5 /*SW*/;
          }
        } while (false);
        do {
          let y = a2o[((8 + p2a[5 /*SW*/] | 0) + ((-j | 0) - 1 | 0) | 0) % 8];
          if (!pxAt[5 /*SW*/] && opx[y] === 8) {
            opx[y] = 5 /*SW*/;
          }
        } while (false);
        do {
          let y = a2o[((8 + p2a[2 /*NE*/] | 0) + j | 0) % 8];
          if (!pxAt[2 /*NE*/] && opx[y] === 8) {
            opx[y] = 2 /*NE*/;
          }
        } while (false);
        do {
          let y = a2o[((8 + p2a[2 /*NE*/] | 0) + ((-j | 0) - 1 | 0) | 0) % 8];
          if (!pxAt[2 /*NE*/] && opx[y] === 8) {
            opx[y] = 2 /*NE*/;
          }
        } while (false);
        do {
          let y = a2o[((8 + p2a[7 /*SE*/] | 0) + j | 0) % 8];
          if (!pxAt[7 /*SE*/] && opx[y] === 8) {
            opx[y] = 7 /*SE*/;
          }
        } while (false);
        do {
          let y = a2o[((8 + p2a[7 /*SE*/] | 0) + ((-j | 0) - 1 | 0) | 0) % 8];
          if (!pxAt[7 /*SE*/] && opx[y] === 8) {
            opx[y] = 7 /*SE*/;
          }
        } while (false);
      }
      const noNormals = new Array(8).fill(false);
      noNormals[4 /*NNW*/] = noNormals[0 /*NWW*/] = !pxAt[3 /*W*/] || !pxAt[0 /*NW*/] || !pxAt[1 /*N*/];
      noNormals[5 /*NNE*/] = noNormals[1 /*NEE*/] = !pxAt[4 /*E*/] || !pxAt[2 /*NE*/] || !pxAt[1 /*N*/];
      noNormals[6 /*SSW*/] = noNormals[2 /*SWW*/] = !pxAt[3 /*W*/] || !pxAt[5 /*SW*/] || !pxAt[6 /*S*/];
      noNormals[7 /*SSE*/] = noNormals[3 /*SEE*/] = !pxAt[4 /*E*/] || !pxAt[7 /*SE*/] || !pxAt[6 /*S*/];
      let x0 = Math.imul(Math.imul(i % 8, 3), iFactor);
      let y0 = Math.imul(Math.imul(i / 8 | 0, 3), iFactor);
      let iPxs = Math.imul(3, iFactor);
      let y = 0;
      let x = 0;
      for (y = 0; y < iPxs; y = y + 1 | 0) {
        for (x = 0; x < iPxs; x = x + 1 | 0) {
          let oct = 0;
          if (Math.imul(2, x) >= iPxs) {
            oct = oct + 1 | 0;
          }
          if (Math.imul(2, y) >= iPxs) {
            oct = oct + 2 | 0;
          }
          if ((x >= y ? 1 : 0) !== (x >= (iPxs - y | 0) ? 1 : 0)) {
            oct = oct + 4 | 0;
          }
          let pix = this.fctScaler.Surface.GetPixDw(x0 + x | 0, y0 + y | 0, false);
          let val = (pix & 0xffff) >> 8 & 0xff;
          if (val >= 250) {
            val = 255;
          }
          let bx = Math.imul(64, p_x[opx[oct]] + 1 | 0) & 0xff;
          let by = Math.imul(64, p_y[opx[oct]] + 1 | 0) & 0xff;
          let bn = (noNormals[oct] ? 255 : 1) & 0xff;
          this.fctScaler.Surface.SetPixDw(x0 + x | 0, y0 + y | 0, $.RGBA(val, bx, by, bn));
        }
      }
    }
    return this.fctScaler.Surface.Unlock();
  }

  CalculateScalerBitmask(x, y, To, pSource) {
    let pixel = pSource._GetPix(To.x + x | 0, To.y + y | 0);
    let placement = pSource._GetPlacement(To.x + x | 0, To.y + y | 0);
    const neighbours = new Int32Array([0, 0, 0, 0, 0, 0, 0, 0]);
    if ((To.y + y | 0) > 0) {
      if ((To.x + x | 0) > 0) {
        neighbours[0] = pSource._GetPix((To.x + x | 0) - 1 | 0, (To.y + y | 0) - 1 | 0);
      }
      neighbours[1] = pSource._GetPix(To.x + x | 0, (To.y + y | 0) - 1 | 0);
      if ((To.x + x | 0) < (this.iWidth - 1 | 0)) {
        neighbours[2] = pSource._GetPix((To.x + x | 0) + 1 | 0, (To.y + y | 0) - 1 | 0);
      }
    }
    if ((To.x + x | 0) > 0) {
      neighbours[3] = pSource._GetPix((To.x + x | 0) - 1 | 0, To.y + y | 0);
    }
    if ((To.x + x | 0) < (this.iWidth - 1 | 0)) {
      neighbours[4] = pSource._GetPix((To.x + x | 0) + 1 | 0, To.y + y | 0);
    }
    if ((To.y + y | 0) < (this.iHeight - 1 | 0)) {
      if ((To.x + x | 0) > 0) {
        neighbours[5] = pSource._GetPix((To.x + x | 0) - 1 | 0, (To.y + y | 0) + 1 | 0);
      }
      neighbours[6] = pSource._GetPix(To.x + x | 0, (To.y + y | 0) + 1 | 0);
      if ((To.x + x | 0) < (this.iWidth - 1 | 0)) {
        neighbours[7] = pSource._GetPix((To.x + x | 0) + 1 | 0, (To.y + y | 0) + 1 | 0);
      }
    }
    let maxPixel = pixel;
    let maxPlacement = placement;
    for (const neighbour of neighbours) {
      let tempPlacement = $.MatPlacement($.PixCol2Mat(neighbour & 0xff));
      if (tempPlacement > maxPlacement || tempPlacement === maxPlacement && neighbour > maxPixel) {
        maxPixel = neighbour;
        maxPlacement = tempPlacement;
      }
    }
    let scaler = 0;
    if (maxPixel === pixel) {
      for (let i = 0; i < 8; i = i + 1 | 0) {
        if (neighbours[i] === pixel) {
          scaler = scaler + (1 << i | 0) | 0;
        }
      }
    } else {
      for (let i = 0; i < 8; i = i + 1 | 0) {
        if (neighbours[i] !== maxPixel) {
          scaler = scaler + (1 << i | 0) | 0;
        }
      }
    }
    return scaler;
  }

  LookupTextureTransition(szFrom, szTo) {
    let fTransit = !$.SEqual(szFrom, szTo);
    let i = 0;
    for (i = 1; i < this.MaterialTextureMap.length; i = i + 1 >>> 0) {
      if ($.SEqual(szFrom, this.MaterialTextureMap[i].getData())) {
        if (!fTransit) {
          return i | 0;
        }
        if (i + 1 >>> 0 >= this.MaterialTextureMap.length) {
          return -1;
        }
        if ($.SEqual(szTo, this.MaterialTextureMap[i + 1 >>> 0].getData())) {
          return i | 0;
        }
      }
    }
    return -1;
  }

  AddTextureTransition(szFrom, szTo) {
    if (szFrom == null || szTo == null) {
      return;
    }
    if (this.LookupTextureTransition(szFrom, szTo) >= 0) {
      return;
    }
    if (this.LookupTextureTransition(szTo, szFrom) >= 0) {
      return;
    }
    if ($.SEqual(szTo, szFrom)) {
      $vpush(this.MaterialTextureMap, new $.StdCopyStrBuf().init$pi8$b(szFrom));
    } else if ($.SEqual(this.MaterialTextureMap[this.MaterialTextureMap.length - 1].getData(), szFrom)) {
      $vpush(this.MaterialTextureMap, new $.StdCopyStrBuf().init$pi8$b(szTo));
    } else if ($.SEqual(this.MaterialTextureMap[this.MaterialTextureMap.length - 1].getData(), szTo)) {
      $vpush(this.MaterialTextureMap, new $.StdCopyStrBuf().init$pi8$b(szFrom));
    } else {
      $vpush(this.MaterialTextureMap, new $.StdCopyStrBuf().init$pi8$b(szFrom));
      $vpush(this.MaterialTextureMap, new $.StdCopyStrBuf().init$pi8$b(szTo));
    }
  }

  AddTextureAnim(szTextureAnim) {
    if (szTextureAnim == null) {
      return;
    }
    let pFrom = szTextureAnim;
    for (; ; ) {
      let pTo = c$strchr(pFrom, 45);
      if (pTo == null) {
        pTo = szTextureAnim;
      } else {
        pTo = pTo.add(1);
      }
      let From = new $.StdStrBuf();
      let To = new $.StdStrBuf();
      From.CopyUntil(pFrom, 45);
      To.CopyUntil(pTo, 45);
      this.AddTextureTransition(From.getData(), To.getData());
      if ($peq(pTo, szTextureAnim)) {
        break;
      }
      pFrom = pTo;
    }
  }

  AddTexturesFromMap(pMap) {
    let pEntry = null;
    for (let i = 0; (pEntry = pMap.GetEntry(i)) != null; i = i + 1 | 0) {
      this.AddTextureAnim(pEntry.GetTextureName());
    }
  }

  BuildMatMap(pTex) {
    for (let pix = 0; pix < 256; pix = pix + 1 | 0) {
      let pEntry = this.pTexs.GetEntry($.PixCol2Tex(pix & 0xff));
      if (!(pEntry.GetTextureName() != null)) {
        pTex.a[pTex.o + Math.imul(2, pix)] = 0;
        pTex.a[pTex.o + (Math.imul(2, pix) + 1 | 0)] = $.RGBA(0, 0, 0, 255);
        continue;
      }
      let iPhases = 1;
      let p = pEntry.GetTextureName();
      while ((p = c$strchr(p, 45)) != null) {
        p = p.add(1);
        iPhases = iPhases + 1 | 0;
      }
      let pMaterial = pEntry.GetMaterial();
      let iPhaseLength = pMaterial.AnimationSpeed;
      let phase = Math.fround(0);
      if (iPhases > 1) {
        phase = Math.fround($.C4TimeMilliseconds.Now().AsInt() % (Math.imul(iPhases, iPhaseLength) >>> 0));
        phase = Math.fround(phase / Math.fround(iPhaseLength));
      }
      let pFrom = pEntry.GetTextureName();
      let gTexCoo = Math.fround(0);
      for (let iP = 0; ; iP = iP + 1 | 0) {
        let pTo = c$strchr(pFrom, 45);
        if (pTo == null) {
          pTo = pEntry.GetTextureName();
        } else {
          pTo = pTo.add(1);
        }
        if (iP === ftoi32(phase)) {
          let From = new $.StdStrBuf();
          let To = new $.StdStrBuf();
          From.CopyUntil(pFrom, 45);
          To.CopyUntil(pTo, 45);
          let iTrans = 0;
          if ((iTrans = this.LookupTextureTransition(From.getData(), To.getData())) >= 0) {
            gTexCoo = Math.fround(Math.fround(iTrans) + Math.fround(c$fmod(phase, 1)));
          } else if ((iTrans = this.LookupTextureTransition(To.getData(), From.getData())) >= 0) {
            gTexCoo = Math.fround(Math.fround(iTrans) + 1 - Math.fround(c$fmod(phase, 1)));
          }
          break;
        }
        pFrom = pTo;
      }
      let iTexCoo = ftoi32(gTexCoo * 256 / this.iMaterialTextureDepth + 0.5);
      pTex.a[pTex.o + Math.imul(2, pix)] = $.RGBA($.Clamp$i32$i32$i32(pMaterial.LightEmit[0], 0, 255) >>> 0, $.Clamp$i32$i32$i32(pMaterial.LightEmit[1], 0, 255) >>> 0, $.Clamp$i32$i32$i32(pMaterial.LightEmit[2], 0, 255) >>> 0, iTexCoo >>> 0);
      pTex.a[pTex.o + (Math.imul(2, pix) + 1 | 0)] = $.RGBA($.Clamp$i32$i32$i32(pMaterial.LightSpot[0], 0, 255) >>> 0, $.Clamp$i32$i32$i32(pMaterial.LightSpot[1], 0, 255) >>> 0, $.Clamp$i32$i32$i32(pMaterial.LightSpot[2], 0, 255) >>> 0, $.Clamp$i32$i32$i32(pMaterial.LightAngle, 0, 255) >>> 0);
    }
  }

  $clone() { return new C4LandscapeRenderGL().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.Surfaces = o.Surfaces.slice();
    this.Shader.$assign(o.Shader);
    this.ShaderLight.$assign(o.ShaderLight);
    this.hVBO = o.hVBO;
    this.hVAOIDNoLight = o.hVAOIDNoLight;
    this.hVAOIDLight = o.hVAOIDLight;
    this.matMapTexture = o.matMapTexture;
    this.hMaterialTexture = o.hMaterialTexture;
    this.MaterialTextureMap = o.MaterialTextureMap.slice();
    this.iMaterialTextureDepth = o.iMaterialTextureDepth;
    this.iMaterialWidth = o.iMaterialWidth;
    this.iMaterialHeight = o.iMaterialHeight;
    this.fctScaler.$assign(o.fctScaler);
    this.TimerStart = o.TimerStart;
    return this;
  }
}







export function $init(): void {
  C4LandscapeRenderGL.UniformNames = new Array(18).fill(null);
  $.C4LR_BiasDistanceX$C4LandscapeRender = 7;
  $.C4LR_BiasDistanceY$C4LandscapeRender = 7;
  $.SEPERATOR_TEXTURE$C4LandscapeRender = S("--SEP--");
  $.C4LR_BytesPerPx$C4LandscapeRender = 3;
  $.C4LR_BytesPerSurface$C4LandscapeRender = 4;
  $.C4LR_SurfaceCount$C4LandscapeRender = 2;
}

Object.assign($, { C4LandscapeRender, C4LandscapeRenderGL });
