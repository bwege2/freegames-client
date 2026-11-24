// @ts-nocheck
// OpenClonk 36de799: src/landscape/fow/C4FoWDrawStrategy.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { gl$glBindBuffer, gl$glBindVertexArray, gl$glBlendEquation, gl$glBlendEquationSeparate, gl$glBlendFunc, gl$glBufferData, gl$glBufferSubData, gl$glDeleteBuffers, gl$glDisable, gl$glDrawElements, gl$glEnable, gl$glEnableVertexAttribArray, gl$glGenBuffers, gl$glPolygonMode, gl$glScissor, gl$glVertexAttribPointer } from '../../../rt/gl.ts';
import { $i64n, ftoi32 } from '../../../rt/int.ts';
import { c$sqrt } from '../../../rt/libc.ts';
import { P } from '../../../rt/ptr.ts';
import { $ } from '../../../rt/registry.ts';
import { $min, $vpush, resize } from '../../../rt/std.ts';

export class C4FoWDrawTriangulator {
  indices = [];
  begin_vertices = 0;
  cur_vertices = 0;
  mode = 0 /*M_Fan*/;

  init() {
    this.indices = [];
    this.begin_vertices = 0;
    this.cur_vertices = 0;
    this.mode = 0 /*M_Fan*/;
    return this;
  }

  Fan() {
    this.FinishPrimitive();
    this.mode = 0 /*M_Fan*/;
  }

  Quads() {
    this.FinishPrimitive();
    this.mode = 1 /*M_Quads*/;
  }

  AddVertex() {
    switch (this.mode) {
      case 0:
        this.cur_vertices = this.cur_vertices + 1 >>> 0;
        if (this.cur_vertices === 3) {
          this.indices.push(this.begin_vertices);
          this.indices.push(this.begin_vertices + 1 >>> 0);
          this.indices.push(this.begin_vertices + 2 >>> 0);
        } else if (this.cur_vertices > 3) {
          this.indices.push(this.begin_vertices);
          this.indices.push((this.begin_vertices + this.cur_vertices >>> 0) - 2 >>> 0);
          this.indices.push((this.begin_vertices + this.cur_vertices >>> 0) - 1 >>> 0);
        }
        break;
      case 1:
        this.cur_vertices = this.cur_vertices + 1 >>> 0;
        if (this.cur_vertices % 4 === 0) {
          this.indices.push((this.begin_vertices + this.cur_vertices >>> 0) - 4 >>> 0);
          this.indices.push((this.begin_vertices + this.cur_vertices >>> 0) - 3 >>> 0);
          this.indices.push((this.begin_vertices + this.cur_vertices >>> 0) - 2 >>> 0);
          this.indices.push((this.begin_vertices + this.cur_vertices >>> 0) - 4 >>> 0);
          this.indices.push((this.begin_vertices + this.cur_vertices >>> 0) - 2 >>> 0);
          this.indices.push((this.begin_vertices + this.cur_vertices >>> 0) - 1 >>> 0);
        }
        break;
      default:
        0;
    }
  }

  Reset() {
    this.FinishPrimitive();
    this.begin_vertices = 0;
    resize(this.indices, 0, () => 0);
  }

  GetIndices() {
    return P(this.indices, 0);
  }

  GetNIndices() {
    return this.indices.length >>> 0;
  }

  FinishPrimitive() {
    switch (this.mode) {
      case 0:
        0;
        break;
      case 1:
        0;
        break;
      default:
        0;
        break;
    }
    this.begin_vertices = this.begin_vertices + this.cur_vertices >>> 0;
    this.cur_vertices = 0;
  }

  $clone() { return new C4FoWDrawTriangulator().$assign(this); }
  $assign(o) {
    this.indices = o.indices.slice();
    this.begin_vertices = o.begin_vertices;
    this.cur_vertices = o.cur_vertices;
    this.mode = o.mode;
    return this;
  }
}

export class C4FoWDrawStrategy {
  phase = 0 /*P_None*/;
  triangulator = new C4FoWDrawTriangulator().init();

  init() {
    this.phase = 0 /*P_None*/;
    this.triangulator = new C4FoWDrawTriangulator().init();
    return this;
  }

  End(_call) {
    this.triangulator.Reset();
  }

  DrawLightVertex(_x, _y) {
    this.triangulator.AddVertex();
  }

  DrawDarkVertex(_x, _y) {
    this.triangulator.AddVertex();
  }

  BeginFan() {
    this.triangulator.Fan();
    this.phase = 1 /*P_Fan*/;
  }

  EndFan() {
  }

  BeginFanMaxed() {
    this.triangulator.Quads();
    this.phase = 2 /*P_FanMaxed*/;
  }

  EndFanMaxed() {
  }

  BeginFade() {
    this.triangulator.Quads();
    this.phase = 3 /*P_Fade*/;
  }

  EndFade() {
  }

  BeginIntermediateFade() {
    this.triangulator.Fan();
    this.phase = 4 /*P_Intermediate*/;
  }

  EndIntermediateFade() {
  }

  $clone() { return new C4FoWDrawStrategy().$assign(this); }
  $assign(o) {
    this.phase = o.phase;
    this.triangulator.$assign(o.triangulator);
    return this;
  }
}

export class C4FoWDrawLightTextureStrategy$Vertex {
  static $layout = [["x", 0, "f32", 0], ["y", 4, "f32", 0], ["r1", 8, "f32", 0], ["g1", 12, "f32", 0], ["b1", 16, "f32", 0], ["a1", 20, "f32", 0], ["r2", 24, "f32", 0], ["g2", 28, "f32", 0], ["b2", 32, "f32", 0], ["a2", 36, "f32", 0], ["r3", 40, "f32", 0], ["g3", 44, "f32", 0], ["b3", 48, "f32", 0], ["a3", 52, "f32", 0]];
  static $size = 56;
  x = 0;
  y = 0;
  r1 = 0;
  g1 = 0;
  b1 = 0;
  a1 = 0;
  r2 = 0;
  g2 = 0;
  b2 = 0;
  a2 = 0;
  r3 = 0;
  g3 = 0;
  b3 = 0;
  a3 = 0;

  $clone() { return new C4FoWDrawLightTextureStrategy$Vertex().$assign(this); }
  $assign(o) {
    this.x = o.x;
    this.y = o.y;
    this.r1 = o.r1;
    this.g1 = o.g1;
    this.b1 = o.b1;
    this.a1 = o.a1;
    this.r2 = o.r2;
    this.g2 = o.g2;
    this.b2 = o.b2;
    this.a2 = o.a2;
    this.r3 = o.r3;
    this.g3 = o.g3;
    this.b3 = o.b3;
    this.a3 = o.a3;
    return this;
  }
}

export class C4FoWDrawWireframeStrategy$Vertex {
  static $layout = [["x", 0, "f32", 0], ["y", 4, "f32", 0], ["r", 8, "f32", 0], ["g", 12, "f32", 0], ["b", 16, "f32", 0], ["a", 20, "f32", 0]];
  static $size = 24;
  x = 0;
  y = 0;
  r = 0;
  g = 0;
  b = 0;
  a = 0;

  $clone() { return new C4FoWDrawWireframeStrategy$Vertex().$assign(this); }
  $assign(o) {
    this.x = o.x;
    this.y = o.y;
    this.r = o.r;
    this.g = o.g;
    this.b = o.b;
    this.a = o.a;
    return this;
  }
}

export class C4FoWDrawLightTextureStrategy extends C4FoWDrawStrategy {
  static C4FoWSmooth;
  light = null;
  region = null;
  bo = new Uint32Array(2);
  vertices = [];
  vbo_size = 0;
  ibo_size = 0;
  vaoids = new Uint32Array(3);

  init(light) {
    this.light = light;
    this.region = null;
    this.vertices = [];
    this.vbo_size = 0;
    this.ibo_size = 0;
    this.bo[0] = this.bo[1] = 0;
    return this;
  }

  $dtor() {
    if (this.bo[0] !== 0) {
      gl$glDeleteBuffers(2, P(this.bo, 0));
      $.pGL.FreeVAOID(this.vaoids[2]);
      $.pGL.FreeVAOID(this.vaoids[1]);
      $.pGL.FreeVAOID(this.vaoids[0]);
    }
  }

  DrawLightVertex(x, y) {
    this.DrawVertex$f32$f32$b(x, y, true);
    C4FoWDrawStrategy.prototype.DrawLightVertex.call(this, x, y);
  }

  DrawDarkVertex(x, y) {
    this.DrawVertex$f32$f32$b(x, y, false);
    C4FoWDrawStrategy.prototype.DrawDarkVertex.call(this, x, y);
  }

  Begin(regionPar) {
    this.region = regionPar;
    if (this.bo[0] === 0) {
      gl$glGenBuffers(2, P(this.bo, 0));
      this.vaoids[0] = $.pGL.GenVAOID();
      this.vaoids[1] = $.pGL.GenVAOID();
      this.vaoids[2] = $.pGL.GenVAOID();
    }
  }

  End(call) {
    if (this.vertices.length === 0) {
      return;
    }
    let vbo = this.bo[0];
    let ibo = this.bo[1];
    gl$glBindBuffer(34962, vbo);
    if (this.vbo_size < this.vertices.length) {
      gl$glBufferData(34962, $i64n(this.vertices.length * 56), this.vertices[0], 35048);
      this.vbo_size = this.vertices.length >>> 0;
    } else {
      gl$glBufferSubData(34962, 0, $i64n(this.vertices.length * 56), this.vertices[0]);
    }
    gl$glBindBuffer(34962, 0);
    gl$glBindBuffer(34963, ibo);
    if (this.ibo_size < this.triangulator.GetNIndices()) {
      gl$glBufferData(34963, $i64n(this.triangulator.GetNIndices() * 4), this.triangulator.GetIndices(), 35048);
      this.ibo_size = this.triangulator.GetNIndices();
    } else {
      gl$glBufferSubData(34963, 0, $i64n(this.triangulator.GetNIndices() * 4), this.triangulator.GetIndices());
    }
    gl$glBindBuffer(34963, 0);
    let width = Math.fround(this.region.getSurfaceWidth());
    let height = Math.fround(this.region.getSurfaceHeight() / 2);
    const y_offset = new Float32Array([0, 0]);
    call.SetUniform2fv(1, 1, P(y_offset, 0));
    gl$glEnable(3089);
    gl$glScissor(0, ftoi32(height), ftoi32(width), ftoi32(height));
    const vao1 = [0];
    const vao2 = [0];
    const vao3 = [0];
    let has_vao1 = $.pGL.GetVAO(this.vaoids[0], P(vao1, 0));
    gl$glBindVertexArray(vao1[0]);
    if (!has_vao1) {
      gl$glBindBuffer(34962, vbo);
      gl$glBindBuffer(34963, ibo);
      gl$glEnableVertexAttribArray(call.GetAttribute(0) >>> 0);
      gl$glEnableVertexAttribArray(call.GetAttribute(1) >>> 0);
      gl$glVertexAttribPointer(call.GetAttribute(0) >>> 0, 2, 5126, 0, 56, null);
      gl$glVertexAttribPointer(call.GetAttribute(1) >>> 0, 4, 5126, 0, 56, P(null, 8));
    }
    gl$glBlendFunc(1, 1);
    gl$glBlendEquationSeparate(32774, 32776);
    gl$glDrawElements(4, this.triangulator.GetNIndices() | 0, 5125, null);
    gl$glBlendEquation(32779);
    let has_vao2 = $.pGL.GetVAO(this.vaoids[1], P(vao2, 0));
    gl$glBindVertexArray(vao2[0]);
    if (!has_vao2) {
      gl$glBindBuffer(34962, vbo);
      gl$glBindBuffer(34963, ibo);
      gl$glEnableVertexAttribArray(call.GetAttribute(0) >>> 0);
      gl$glEnableVertexAttribArray(call.GetAttribute(1) >>> 0);
      gl$glVertexAttribPointer(call.GetAttribute(0) >>> 0, 2, 5126, 0, 56, null);
      gl$glVertexAttribPointer(call.GetAttribute(1) >>> 0, 4, 5126, 0, 56, P(null, 24));
    }
    gl$glDrawElements(4, this.triangulator.GetNIndices() | 0, 5125, null);
    gl$glBlendFunc(770, 771);
    gl$glBlendEquation(32774);
    gl$glScissor(0, 0, ftoi32(width), ftoi32(height));
    y_offset[1] = height;
    call.SetUniform2fv(1, 1, P(y_offset, 0));
    let has_vao3 = $.pGL.GetVAO(this.vaoids[2], P(vao3, 0));
    gl$glBindVertexArray(vao3[0]);
    if (!has_vao3) {
      gl$glBindBuffer(34962, vbo);
      gl$glBindBuffer(34963, ibo);
      gl$glEnableVertexAttribArray(call.GetAttribute(0) >>> 0);
      gl$glEnableVertexAttribArray(call.GetAttribute(1) >>> 0);
      gl$glVertexAttribPointer(call.GetAttribute(0) >>> 0, 2, 5126, 0, 56, null);
      gl$glVertexAttribPointer(call.GetAttribute(1) >>> 0, 4, 5126, 0, 56, P(null, 40));
    }
    gl$glDrawElements(4, this.triangulator.GetNIndices() | 0, 5125, null);
    gl$glBindVertexArray(0);
    gl$glDisable(3089);
    resize(this.vertices, 0, () => new C4FoWDrawLightTextureStrategy$Vertex());
    C4FoWDrawStrategy.prototype.End.call(this, call);
  }

  DrawVertex$f32$f32$b(x, y, shadow) {
    $vpush(this.vertices, new C4FoWDrawLightTextureStrategy$Vertex());
    const vtx = this.vertices[this.vertices.length - 1];
    vtx.x = x;
    vtx.y = y;
    vtx.x = Math.fround(vtx.x + Math.fround(-this.region.getRegion().x | 0));
    vtx.y = Math.fround(vtx.y + Math.fround(-this.region.getRegion().y | 0));
    if (shadow) {
      let dx = Math.fround(x - Math.fround(this.light.getX()));
      let dy = Math.fround(y - Math.fround(this.light.getY()));
      let dist = Math.fround(c$sqrt(Math.fround(Math.fround(dx * dx) + Math.fround(dy * dy))));
      let bright = this.light.getBrightness();
      let mult = $min(Math.fround(0.5 / Math.fround(this.light.getNormalSize())), Math.fround(0.5 / dist));
      let normX = Math.fround($.Clamp$f32$f32$f32(Math.fround(0.5 + Math.fround(dx * mult)), 0, 1) / 1.5);
      let normY = Math.fround($.Clamp$f32$f32$f32(Math.fround(0.5 + Math.fround(dy * mult)), 0, 1) / 1.5);
      vtx.r1 = 0;
      vtx.g1 = normX;
      vtx.b1 = normY;
      vtx.a1 = bright;
    } else {
      vtx.r1 = 0;
      vtx.g1 = Math.fround(0.5 / 1.5);
      vtx.b1 = Math.fround(0.5 / 1.5);
      vtx.a1 = 0;
    }
    vtx.r2 = 0;
    vtx.g2 = Math.fround(0.5 / 1.5);
    vtx.b2 = Math.fround(0.5 / 1.5);
    vtx.a2 = 0;
    let alpha = 0;
    if (shadow) {
      alpha = Math.fround(0.3 + 0.6 * this.light.getValue() * this.light.getLightness());
    } else {
      alpha = Math.fround(0);
    }
    vtx.r3 = this.light.getR();
    vtx.g3 = this.light.getG();
    vtx.b3 = this.light.getB();
    vtx.a3 = alpha;
  }

  $clone() { return new C4FoWDrawLightTextureStrategy().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.light = o.light;
    this.region = o.region;
    this.bo = o.bo.slice();
    this.vertices = o.vertices.slice();
    this.vbo_size = o.vbo_size;
    this.ibo_size = o.ibo_size;
    this.vaoids = o.vaoids.slice();
    return this;
  }
}

export class C4FoWDrawWireframeStrategy extends C4FoWDrawStrategy {
  screen = null;
  bo = new Uint32Array(2);
  vertices = [];
  vbo_size = 0;
  ibo_size = 0;
  vaoid = 0;

  init(_light, screen) {
    this.screen = screen;
    this.vertices = [];
    this.vbo_size = 0;
    this.ibo_size = 0;
    gl$glGenBuffers(2, P(this.bo, 0));
    this.vaoid = $.pGL.GenVAOID();
    return this;
  }

  $dtor() {
    gl$glDeleteBuffers(2, P(this.bo, 0));
    $.pGL.FreeVAOID(this.vaoid);
  }

  DrawLightVertex(x, y) {
    $vpush(this.vertices, new C4FoWDrawWireframeStrategy$Vertex());
    const vtx = this.vertices[this.vertices.length - 1];
    vtx.x = x;
    vtx.y = y;
    switch (this.phase) {
      case 0:
        return;
      case 1:
        vtx.r = 1;
        vtx.g = 0;
        vtx.b = 0;
        vtx.a = 1;
        break;
      case 2:
        vtx.r = 1;
        vtx.g = 1;
        vtx.b = 0;
        vtx.a = 1;
        break;
      case 3:
        vtx.r = 0;
        vtx.g = 1;
        vtx.b = 0;
        vtx.a = 1;
        break;
      case 4:
        vtx.r = 0;
        vtx.g = 0;
        vtx.b = 1;
        vtx.a = 1;
        break;
      default:
        0;
    }
    this.DrawVertex$rVertex(vtx);
    C4FoWDrawStrategy.prototype.DrawLightVertex.call(this, x, y);
  }

  DrawDarkVertex(x, y) {
    $vpush(this.vertices, new C4FoWDrawWireframeStrategy$Vertex());
    const vtx = this.vertices[this.vertices.length - 1];
    vtx.x = x;
    vtx.y = y;
    switch (this.phase) {
      case 0:
        return;
      case 3:
        vtx.r = 0;
        vtx.g = 0.5;
        vtx.b = 0;
        vtx.a = 1;
        break;
      case 4:
        vtx.r = 0;
        vtx.g = 0;
        vtx.b = 0.5;
        vtx.a = 1;
        break;
      default:
        0;
    }
    this.DrawVertex$rVertex(vtx);
    C4FoWDrawStrategy.prototype.DrawDarkVertex.call(this, x, y);
  }

  Begin(_region) {
  }

  End(call) {
    if (this.vertices.length === 0) {
      return;
    }
    let vbo = this.bo[0];
    let ibo = this.bo[1];
    gl$glPolygonMode(1032, 6913);
    gl$glBindBuffer(34962, vbo);
    if (this.vbo_size < this.vertices.length) {
      gl$glBufferData(34962, $i64n(this.vertices.length * 24), this.vertices[0], 35040);
      this.vbo_size = this.vertices.length >>> 0;
    } else {
      gl$glBufferSubData(34962, 0, $i64n(this.vertices.length * 24), this.vertices[0]);
    }
    gl$glBindBuffer(34962, 0);
    gl$glBindBuffer(34963, ibo);
    if (this.ibo_size < this.triangulator.GetNIndices()) {
      gl$glBufferData(34963, $i64n(this.triangulator.GetNIndices() * 4), this.triangulator.GetIndices(), 35040);
      this.ibo_size = this.triangulator.GetNIndices();
    } else {
      gl$glBufferSubData(34963, 0, $i64n(this.triangulator.GetNIndices() * 4), this.triangulator.GetIndices());
    }
    gl$glBindBuffer(34963, 0);
    const vao = [0];
    let has_vao = $.pGL.GetVAO(this.vaoid, P(vao, 0));
    gl$glBindVertexArray(vao[0]);
    if (!has_vao) {
      gl$glBindBuffer(34962, vbo);
      gl$glBindBuffer(34963, ibo);
      gl$glEnableVertexAttribArray(call.GetAttribute(0) >>> 0);
      gl$glEnableVertexAttribArray(call.GetAttribute(1) >>> 0);
      gl$glVertexAttribPointer(call.GetAttribute(0) >>> 0, 2, 5126, 0, 24, null);
      gl$glVertexAttribPointer(call.GetAttribute(1) >>> 0, 4, 5126, 0, 24, P(null, 8));
    }
    const y_offset = new Float32Array([0, 0]);
    call.SetUniform2fv(1, 1, P(y_offset, 0));
    gl$glDrawElements(4, this.triangulator.GetNIndices() | 0, 5125, null);
    gl$glBindVertexArray(0);
    gl$glPolygonMode(1032, 6914);
    resize(this.vertices, 0, () => new C4FoWDrawWireframeStrategy$Vertex());
    C4FoWDrawStrategy.prototype.End.call(this, call);
  }

  DrawVertex$rVertex(vtx) {
    vtx.x = Math.fround(vtx.x + Math.fround(this.screen.X - this.screen.TargetX));
    vtx.y = Math.fround(vtx.y + Math.fround(this.screen.Y - this.screen.TargetY));
    $.pGL.ApplyZoom(P(vtx, "x"), P(vtx, "y"));
  }

  $clone() { return new C4FoWDrawWireframeStrategy().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.screen = o.screen;
    this.bo = o.bo.slice();
    this.vertices = o.vertices.slice();
    this.vbo_size = o.vbo_size;
    this.ibo_size = o.ibo_size;
    this.vaoid = o.vaoid;
    return this;
  }
}

export function $init(): void {
  C4FoWDrawLightTextureStrategy.C4FoWSmooth = 0;
}

Object.assign($, { C4FoWDrawLightTextureStrategy, C4FoWDrawLightTextureStrategy$Vertex, C4FoWDrawStrategy, C4FoWDrawTriangulator, C4FoWDrawWireframeStrategy, C4FoWDrawWireframeStrategy$Vertex });
