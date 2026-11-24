// @ts-nocheck
// OpenClonk 36de799: src/landscape/fow/C4FoWRegion.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { gl$glBindBuffer, gl$glBindFramebuffer, gl$glBindTexture, gl$glBindVertexArray, gl$glBlendColor, gl$glBlendFunc, gl$glBufferData, gl$glBufferSubData, gl$glCheckFramebufferStatus, gl$glClear, gl$glClearColor, gl$glDeleteBuffers, gl$glDeleteFramebuffers, gl$glDisable, gl$glDrawArrays, gl$glEnable, gl$glEnableVertexAttribArray, gl$glFramebufferTexture2D, gl$glGenBuffers, gl$glGenFramebuffers, gl$glGetIntegerv, gl$glScissor, gl$glVertexAttribPointer, gl$glViewport } from '../../../rt/gl.ts';
import { P } from '../../../rt/ptr.ts';
import { $ } from '../../../rt/registry.ts';
import { $max } from '../../../rt/std.ts';

export class C4FoWRegion {
  pFoW = null;
  pPlayer = null;
  pSurface = null;
  pBackSurface = null;
  Region = new $.C4Rect();
  OldRegion = new $.C4Rect();
  ViewportRegion = new $.FLOAT_RECT();
  hFrameBufDraw = 0;
  hFrameBufRead = 0;
  hVBO = 0;
  vaoid = 0;

  init(pFoW, pPlayer) {
    this.pFoW = pFoW;
    this.pPlayer = pPlayer;
    this.pSurface = new $.C4Surface().init$v();
    this.pBackSurface = new $.C4Surface().init$v();
    this.Region = new $.C4Rect().init$i32$i32$i32$i32(0, 0, 0, 0);
    this.OldRegion = new $.C4Rect().init$i32$i32$i32$i32(0, 0, 0, 0);
    this.ViewportRegion = new $.FLOAT_RECT();
    this.hFrameBufDraw = 0;
    this.hFrameBufRead = 0;
    this.hVBO = 0;
    this.vaoid = 0;
    this.ViewportRegion.left = this.ViewportRegion.right = this.ViewportRegion.top = this.ViewportRegion.bottom = 0;
    return this;
  }

  $dtor() {
    if (this.hFrameBufDraw !== 0) {
      gl$glDeleteFramebuffers(1, P(this, "hFrameBufDraw"));
      gl$glDeleteFramebuffers(1, P(this, "hFrameBufRead"));
    }
    if (this.hVBO !== 0) {
      gl$glDeleteBuffers(1, P(this, "hVBO"));
    }
    if (this.vaoid !== 0) {
      $.pGL.FreeVAOID(this.vaoid);
    }
  }

  getFoW() {
    return this.pFoW;
  }

  getRegion() {
    return this.Region;
  }

  getViewportRegion() {
    return this.ViewportRegion;
  }

  getSurfaceHeight() {
    return this.pSurface.Hgt;
  }

  getSurfaceWidth() {
    return this.pSurface.Wdt;
  }

  getSurfaceName() {
    0;
    if (this.pSurface.texture == null) {
      return 0;
    }
    return this.pSurface.texture.texName;
  }

  Update(r, vp) {
    this.Region.$assign(r);
    this.ViewportRegion.$assign(vp);
  }

  Render(pOnScreen = null) {
    const prev_fb = [0];
    gl$glGetIntegerv(36006, P(prev_fb, 0));
    this.pFoW.Update(this.Region.$clone(), this.pPlayer);
    if (pOnScreen != null) {
      this.pFoW.Render(this, pOnScreen, this.pPlayer, $.pGL.GetProjectionMatrix());
      return true;
    }
    let pShader = this.pFoW.GetFramebufShader();
    0;
    if (pShader == null) {
      return false;
    }
    $.pDraw.StorePrimaryClipper();
    if (!this.BindFramebuf(prev_fb[0] >>> 0)) {
      $.pDraw.RestorePrimaryClipper();
      return false;
    }
    0;
    if (this.pSurface == null || this.hFrameBufDraw === 0) {
      return false;
    }
    gl$glViewport(0, 0, this.pSurface.Wdt, this.pSurface.Hgt);
    let projectionMatrix = $.StdProjectionMatrix.Orthographic(0, Math.fround(this.pSurface.Wdt), Math.fround(this.pSurface.Hgt), 0);
    0;
    gl$glScissor(0, this.pSurface.Hgt / 2 | 0, this.pSurface.Wdt, this.pSurface.Hgt / 2 | 0);
    gl$glClearColor(0, Math.fround(0.5 / 1.5), Math.fround(0.5 / 1.5), 0);
    gl$glEnable(3089);
    gl$glClear(16384);
    gl$glScissor(0, 0, this.pSurface.Wdt, this.pSurface.Hgt / 2 | 0);
    gl$glClearColor(0.5, 0.5, 0.5, 1);
    gl$glClear(16384);
    gl$glDisable(3089);
    gl$glBlendFunc(1, 1);
    this.pFoW.Render(this, null, this.pPlayer, projectionMatrix);
    if (this.OldRegion.Wdt > 0) {
      let dx0 = this.Region.x - this.OldRegion.x | 0;
      let dy0 = this.Region.y - this.OldRegion.y | 0;
      let dx1 = ((this.Region.x + this.Region.Wdt | 0) - this.OldRegion.x | 0) - this.OldRegion.Wdt | 0;
      let dy1 = ((this.Region.y + this.Region.Hgt | 0) - this.OldRegion.y | 0) - this.OldRegion.Hgt | 0;
      let sx0 = $max(0, dx0);
      let sy0 = $max(0, dy0);
      let sx1 = this.OldRegion.Wdt - $max(0, -dx1 | 0) | 0;
      let sy1 = this.OldRegion.Hgt - $max(0, -dy1 | 0) | 0;
      let tx0 = $max(0, -dx0 | 0);
      let ty0 = $max(0, -dy0 | 0);
      let tx1 = this.Region.Wdt - $max(0, dx1) | 0;
      let ty1 = this.Region.Hgt - $max(0, dy1) | 0;
      const vtxData = new Float32Array(16);
      let squad = P(vtxData, 0);
      let tquad = P(vtxData, 8);
      squad.a[squad.o + 0] = Math.fround(sx0);
      squad.a[squad.o + 1] = Math.fround(sy0);
      squad.a[squad.o + 2] = Math.fround(sx0);
      squad.a[squad.o + 3] = Math.fround(sy1);
      squad.a[squad.o + 4] = Math.fround(sx1);
      squad.a[squad.o + 5] = Math.fround(sy0);
      squad.a[squad.o + 6] = Math.fround(sx1);
      squad.a[squad.o + 7] = Math.fround(sy1);
      tquad.a[tquad.o + 0] = Math.fround(tx0);
      tquad.a[tquad.o + 1] = Math.fround(ty0);
      tquad.a[tquad.o + 2] = Math.fround(tx0);
      tquad.a[tquad.o + 3] = Math.fround(ty1);
      tquad.a[tquad.o + 4] = Math.fround(tx1);
      tquad.a[tquad.o + 5] = Math.fround(ty0);
      tquad.a[tquad.o + 6] = Math.fround(tx1);
      tquad.a[tquad.o + 7] = Math.fround(ty1);
      for (let i = 0; i < 4; i = i + 1 | 0) {
        squad.a[squad.o + Math.imul(i, 2)] = Math.fround(squad.a[squad.o + Math.imul(i, 2)] / Math.fround(this.pBackSurface.Wdt));
        squad.a[squad.o + (Math.imul(i, 2) + 1 | 0)] = Math.fround(1 - Math.fround(squad.a[squad.o + (Math.imul(i, 2) + 1 | 0)] / Math.fround(this.pBackSurface.Hgt)));
      }
      if (this.hVBO === 0) {
        gl$glGenBuffers(1, P(this, "hVBO"));
        gl$glBindBuffer(34962, this.hVBO);
        gl$glBufferData(34962, 64, P(vtxData, 0), 35040);
        0;
        this.vaoid = $.pGL.GenVAOID();
      } else {
        gl$glBindBuffer(34962, this.hVBO);
        gl$glBufferSubData(34962, 0, 64, P(vtxData, 0));
      }
      let Call = new $.C4ShaderCall().init(pShader);
      try {
        Call.Start();
        if (Call.AllocTexUnit(1) !== 0) {
          gl$glBindTexture(3553, this.pBackSurface.texture.texName);
        }
        Call.SetUniformMatrix4x4$i32$StdProjectionMatrix(0, projectionMatrix);
        gl$glBlendFunc(32770, 32769);
        let normalBlend = Math.fround(1 / 4);
        let brightBlend = Math.fround(1 / 16);
        gl$glBlendColor(0, normalBlend, normalBlend, brightBlend);
        const vao = [0];
        let has_vao = $.pGL.GetVAO(this.vaoid, P(vao, 0));
        gl$glBindVertexArray(vao[0]);
        if (!has_vao) {
          gl$glEnableVertexAttribArray(pShader.GetAttribute(0) >>> 0);
          gl$glEnableVertexAttribArray(pShader.GetAttribute(1) >>> 0);
          gl$glVertexAttribPointer(pShader.GetAttribute(0) >>> 0, 2, 5126, 0, 0, P(null, 32));
          gl$glVertexAttribPointer(pShader.GetAttribute(1) >>> 0, 2, 5126, 0, 0, null);
        }
        gl$glDrawArrays(5, 0, 4);
        gl$glBindVertexArray(0);
        gl$glBindBuffer(34962, 0);
        Call.Finish();
      } finally { Call && Call.$dtor(); }
    }
    gl$glBindFramebuffer(36160, prev_fb[0] >>> 0);
    $.pDraw.RestorePrimaryClipper();
    this.OldRegion.$assign(this.Region);
    return true;
  }

  GetFragTransform(clipRect, outRect, lightTransform) {
    const lightRect = this.getRegion();
    const vpRect = this.ViewportRegion;
    let trans = new $.C4FragTransform();
    0;
    trans.Translate(Math.fround(-clipRect.x | 0), Math.fround(-((outRect.Hgt - clipRect.y | 0) - clipRect.Hgt | 0) | 0));
    trans.Scale(Math.fround(1 / Math.fround(clipRect.Wdt)), Math.fround(1 / Math.fround(clipRect.Hgt)));
    trans.Scale(Math.fround(vpRect.right - vpRect.left), Math.fround(vpRect.bottom - vpRect.top));
    trans.Translate(Math.fround(vpRect.left - Math.fround(lightRect.x)), Math.fround(vpRect.top - Math.fround(lightRect.y)));
    trans.Scale(Math.fround(1 / Math.fround(this.pSurface.Wdt)), Math.fround(1 / Math.fround(this.pSurface.Hgt)));
    trans.Translate(0, Math.fround(1 - Math.fround(Math.fround(lightRect.Hgt) / Math.fround(this.pSurface.Hgt))));
    trans.Get2x3(lightTransform);
  }

  BindFramebuf(prev_fb) {
    [this.pSurface, this.pBackSurface] = [this.pBackSurface, this.pSurface];
    if (this.pSurface.Wdt < this.Region.Wdt || (this.pSurface.Hgt / 2 | 0) < this.Region.Hgt) {
      let iWdt = 1;
      let iHgt = 1;
      while (iWdt < this.Region.Wdt) {
        iWdt = Math.imul(iWdt, 2);
      }
      while (iHgt < this.Region.Hgt) {
        iHgt = Math.imul(iHgt, 2);
      }
      iHgt = Math.imul(iHgt, 2);
      let pNewSurface = new $.C4Surface().init$v();
      let pNewBackSurface = new $.C4Surface().init$v();
      if (!pNewSurface.Create(iWdt, iHgt)) {
        return false;
      }
      if (!pNewBackSurface.Create(iWdt, iHgt)) {
        return false;
      }
      this.pSurface.Lock();
      this.pBackSurface.Lock();
      pNewSurface.Lock();
      pNewBackSurface.Lock();
      for (let y = 0; y < (iHgt / 2 | 0); y = y + 1 | 0) {
        for (let x = 0; x < iWdt; x = x + 1 | 0) {
          if (y < (this.pSurface.Hgt / 2 | 0) && x < this.pSurface.Wdt) {
            pNewSurface.SetPixDw(x, ((pNewSurface.Hgt / 2 | 0) - y | 0) - 1 | 0, this.pSurface.GetPixDw(x, ((this.pSurface.Hgt / 2 | 0) - y | 0) - 1 | 0, false));
            pNewBackSurface.SetPixDw(x, ((pNewBackSurface.Hgt / 2 | 0) - y | 0) - 1 | 0, this.pBackSurface.GetPixDw(x, ((this.pBackSurface.Hgt / 2 | 0) - y | 0) - 1 | 0, false));
            pNewSurface.SetPixDw(x, (((pNewSurface.Hgt / 2 | 0) - y | 0) + (iHgt / 2 | 0) | 0) - 1 | 0, this.pSurface.GetPixDw(x, (((this.pSurface.Hgt / 2 | 0) - y | 0) + (this.pSurface.Hgt / 2 | 0) | 0) - 1 | 0, false));
            pNewBackSurface.SetPixDw(x, (((pNewBackSurface.Hgt / 2 | 0) - y | 0) + (iHgt / 2 | 0) | 0) - 1 | 0, this.pBackSurface.GetPixDw(x, (((this.pBackSurface.Hgt / 2 | 0) - y | 0) + (this.pBackSurface.Hgt / 2 | 0) | 0) - 1 | 0, false));
          } else {
            pNewSurface.SetPixDw(x, ((pNewSurface.Hgt / 2 | 0) - y | 0) - 1 | 0, 255);
            pNewBackSurface.SetPixDw(x, ((pNewBackSurface.Hgt / 2 | 0) - y | 0) - 1 | 0, 255);
            pNewSurface.SetPixDw(x, (((pNewSurface.Hgt / 2 | 0) - y | 0) + (iHgt / 2 | 0) | 0) - 1 | 0, 255);
            pNewBackSurface.SetPixDw(x, (((pNewBackSurface.Hgt / 2 | 0) - y | 0) + (iHgt / 2 | 0) | 0) - 1 | 0, 255);
          }
        }
      }
      (this.pSurface = pNewSurface, pNewSurface = null);
      (this.pBackSurface = pNewBackSurface, pNewBackSurface = null);
      this.pSurface.Unlock();
      this.pBackSurface.Unlock();
    }
    if (this.pSurface.iTexSize === 0) {
      return false;
    }
    if (this.hFrameBufDraw === 0) {
      gl$glGenFramebuffers(1, P(this, "hFrameBufDraw"));
      gl$glGenFramebuffers(1, P(this, "hFrameBufRead"));
    }
    gl$glBindFramebuffer(36009, this.hFrameBufDraw);
    gl$glBindFramebuffer(36008, this.hFrameBufRead);
    gl$glFramebufferTexture2D(36009, 36064, 3553, this.pSurface.texture.texName, 0);
    if (this.pBackSurface.texture != null) {
      gl$glFramebufferTexture2D(36008, 36064, 3553, this.pBackSurface.texture.texName, 0);
    }
    let status1 = gl$glCheckFramebufferStatus(36008);
    let status2 = gl$glCheckFramebufferStatus(36009);
    if (status1 !== 36053 || this.pBackSurface != null && status2 !== 36053) {
      gl$glBindFramebuffer(36160, prev_fb);
      return false;
    }
    return true;
  }

  $clone() { return new C4FoWRegion().$assign(this); }
  $assign(o) {
    this.pFoW = o.pFoW;
    this.pPlayer = o.pPlayer;
    this.pSurface = o.pSurface;
    this.pBackSurface = o.pBackSurface;
    this.Region.$assign(o.Region);
    this.OldRegion.$assign(o.OldRegion);
    this.ViewportRegion.$assign(o.ViewportRegion);
    this.hFrameBufDraw = o.hFrameBufDraw;
    this.hFrameBufRead = o.hFrameBufRead;
    this.hVBO = o.hVBO;
    this.vaoid = o.vaoid;
    return this;
  }
}

export function $init(): void {
}

Object.assign($, { C4FoWRegion });
