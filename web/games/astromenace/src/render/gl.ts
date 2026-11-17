// AstroMenace 1.4.3 (Mikhail Kurinnoi, Viewizard; GPL-3.0-or-later): the OpenGL drawing of
// src/core/graphics (vw_Draw3D, the matrix stack, textures), cObject3D::Draw's rendering part
// (src/object3d/object3d.cpp), the GLSL 1.20 shaders of gamedata/glsl (light, light_explosion, particle)
// rewritten for WebGL 2, the skybox and the space dust of src/gfx, and the 2D layer (a canvas that is
// drawn over the 3D picture where the original switches to 2D mode). Not drawn: shadow maps and normal
// maps (README.md). Changed for the browser by the freegames project, 2026.
import { Vec3 } from '../core/math.ts';
import { calculateAllPointLightsAttenuation, lights, LightType, type Light, type ParticleSystem } from '../core/particles.ts';
import { cam, projectionMatrix, viewMatrix, rotationMatrix, translationMatrix, boxInFrustum, getCameraLocation, getCameraRotation } from '../core/camera.ts';
import type { Chunk3D } from '../core/model3d.ts';
import type { Object3D } from '../object3d/object3d.ts';
import { config } from '../game/globals.ts';
import { getTexture, type Tex } from '../engine/textures.ts';
import { TEXTURE_ASSETS } from '../engine/textures_table.ts';

type M = Float64Array;

function mult(a: M, b: M): M {
  const r = new Float64Array(16);
  for (let c = 0; c < 4; c++) {
    for (let rr = 0; rr < 4; rr++) {
      let s = 0;
      for (let k = 0; k < 4; k++) s += a[k * 4 + rr] * b[c * 4 + k];
      r[c * 4 + rr] = s;
    }
  }
  return r;
}
function xform(m: M, x: number, y: number, z: number, w: number): [number, number, number, number] {
  return [
    m[0] * x + m[4] * y + m[8] * z + m[12] * w,
    m[1] * x + m[5] * y + m[9] * z + m[13] * w,
    m[2] * x + m[6] * y + m[10] * z + m[14] * w,
    m[3] * x + m[7] * y + m[11] * z + m[15] * w,
  ];
}

const LIGHT_VS = `#version 300 es
precision highp float;
layout(location=0) in vec3 aPos;
layout(location=1) in vec3 aNormal;
layout(location=2) in vec2 aUV;
layout(location=3) in vec4 aC;
uniform mat4 uMV, uProj;
uniform vec2 uTexOffset;
uniform int uExplosion;
uniform float uSpeed1, uSpeed2;
out vec3 vNormal;
out vec3 vVertex;
out vec2 vUV;
void main() {
  vec4 v = vec4(aPos, 1.0);
  if (uExplosion == 1) {
    vec3 center = aC.xyz;
    v = v + vec4(center * aC.w * uSpeed2, 0.0);
    v = v + vec4((center - aPos) * (1.0 - uSpeed1), 0.0);
  }
  vNormal = normalize(mat3(uMV) * aNormal);
  vVertex = vec3(uMV * v);
  gl_Position = uProj * uMV * v;
  vUV = aUV + uTexOffset;
}`;

const LIGHT_FS = `#version 300 es
precision highp float;
uniform sampler2D uTex1, uTex2;
uniform int uMulti;
uniform vec4 uMatDiffuse, uMatAmbient, uMatSpecular;
uniform float uShininess;
uniform vec4 uLPos[7];
uniform vec4 uLDiff[7], uLSpec[7], uLAmb[7];
uniform vec3 uLAtt[7];
uniform float uAlphaRef;
in vec3 vNormal;
in vec3 vVertex;
in vec2 vUV;
out vec4 frag;
vec4 directLight(int i, vec3 N) {
  vec4 color = vec4(0.0, 0.0, 0.0, 1.0);
  color += uMatAmbient * uLAmb[i];
  float NdotL = max(dot(N, normalize(uLPos[i].xyz)), 0.0);
  if (NdotL > 0.0) {
    color += uMatDiffuse * uLDiff[i] * NdotL;
    vec3 halfV = normalize(normalize(uLPos[i].xyz) + vec3(0.0, 0.0, 1.0));
    float NdotHV = max(dot(N, halfV), 0.0);
    color += uMatSpecular * uLSpec[i] * pow(NdotHV, uShininess);
  }
  return color;
}
vec4 pointLight(int i, vec3 N) {
  vec4 color = vec4(0.0, 0.0, 0.0, 1.0);
  vec3 D = uLPos[i].xyz - vVertex;
  float NdotL = max(dot(N, normalize(D)), 0.0);
  if (NdotL > 0.0) {
    float dist = length(D);
    float att = 1.0 / (uLAtt[i].x + uLAtt[i].y * dist + uLAtt[i].z * dist * dist);
    color += att * (uMatDiffuse * uLDiff[i] * NdotL + uMatAmbient * uLAmb[i]);
    vec3 halfV = normalize(normalize(uLPos[i].xyz) + vec3(0.0, 0.0, 1.0));
    float NdotHV = max(dot(N, halfV), 0.0);
    color += att * uMatSpecular * uLSpec[i] * pow(NdotHV, uShininess);
  }
  return color;
}
void main() {
  vec3 N = normalize(vNormal);
  vec4 color = vec4(0.0, 0.0, 0.0, 1.0);
  color += vec4(0.2, 0.2, 0.2, 1.0) * uMatAmbient;
  color += directLight(0, N);
  for (int i = 1; i < 7; i++) color += pointLight(i, N);
  vec4 t = texture(uTex1, vUV);
  frag = clamp(color, 0.0, 1.0) * t;
  if (uMulti == 1) frag = clamp(frag + texture(uTex2, vUV), 0.0, 1.0);
  if (uAlphaRef >= 0.0 && !(frag.a > uAlphaRef)) discard;
}`;

/** RI_3f_XYZ | RI_4f_COLOR | RI_1_TEX (particles, space dust, status bars) */
const COLOR_VS = `#version 300 es
precision highp float;
layout(location=0) in vec3 aPos;
layout(location=1) in vec4 aColor;
layout(location=2) in vec2 aUV;
uniform mat4 uMV, uProj;
out vec4 vColor;
out vec2 vUV;
void main() {
  vColor = aColor;
  vUV = aUV;
  gl_Position = uProj * uMV * vec4(aPos, 1.0);
}`;
const COLOR_FS = `#version 300 es
precision highp float;
uniform sampler2D uTex;
uniform int uUseTex;
uniform float uAlphaRef;
in vec4 vColor;
in vec2 vUV;
out vec4 frag;
void main() {
  frag = uUseTex == 1 ? texture(uTex, vUV) * vColor : vColor;
  if (uAlphaRef >= 0.0 && !(frag.a > uAlphaRef)) discard;
}`;

/** the skybox: the side's texture with the stars tile over it (GL_DECAL, texture matrix scale 2) */
const SKY_VS = `#version 300 es
precision highp float;
layout(location=0) in vec3 aPos;
layout(location=2) in vec2 aUV;
uniform mat4 uMV, uProj;
out vec2 vUV;
void main() {
  vUV = aUV;
  gl_Position = uProj * uMV * vec4(aPos, 1.0);
}`;
const SKY_FS = `#version 300 es
precision highp float;
uniform sampler2D uTex1, uTex2;
in vec2 vUV;
out vec4 frag;
void main() {
  vec4 a = texture(uTex1, vUV);
  vec4 b = texture(uTex2, vUV * 2.0);
  frag = vec4(mix(a.rgb, b.rgb, b.a), a.a);
}`;

const QUAD_VS = `#version 300 es
precision highp float;
layout(location=0) in vec2 aPos;
out vec2 vUV;
void main() {
  vUV = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5);
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;
const QUAD_FS = `#version 300 es
precision highp float;
uniform sampler2D uTex;
in vec2 vUV;
out vec4 frag;
void main() { frag = texture(uTex, vUV); }`;

interface Prog { p: WebGLProgram; u: Map<string, WebGLUniformLocation | null> }

/** the texture state the original binds (null: none) */
export class Renderer {
  readonly gl: WebGL2RenderingContext;
  readonly canvas: HTMLCanvasElement;
  private mv: M = translationMatrix(0, 0, 0);
  private stack: M[] = [];
  private proj: Float32Array = new Float32Array(16);
  private light: Prog;
  private color: Prog;
  private sky: Prog;
  private quad: Prog;
  private buffers = new WeakMap<object, WebGLBuffer>();
  private dyn: WebGLBuffer;
  private quadBuf: WebGLBuffer;
  private overlay: WebGLTexture;
  private white: WebGLTexture;
  private texInfo = new Map(TEXTURE_ASSETS.map((t) => [t[0], t]));
  private aniso: EXT_texture_filter_anisotropic | null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const gl = canvas.getContext('webgl2', { antialias: true, alpha: false, depth: true, premultipliedAlpha: false, preserveDrawingBuffer: false });
    if (!gl) throw new Error('WebGL 2 is not available');
    this.gl = gl;
    this.aniso = gl.getExtension('EXT_texture_filter_anisotropic');
    this.light = this.program(LIGHT_VS, LIGHT_FS);
    this.color = this.program(COLOR_VS, COLOR_FS);
    this.sky = this.program(SKY_VS, SKY_FS);
    this.quad = this.program(QUAD_VS, QUAD_FS);
    this.dyn = gl.createBuffer()!;
    this.quadBuf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    this.overlay = gl.createTexture()!;
    this.white = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, this.white);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
  }

  private program(vs: string, fs: string): Prog {
    const gl = this.gl;
    const sh = (type: number, src: string): WebGLShader => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'shader');
      return s;
    };
    const p = gl.createProgram()!;
    gl.attachShader(p, sh(gl.VERTEX_SHADER, vs));
    gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) ?? 'program');
    return { p, u: new Map() };
  }

  private U(pr: Prog, name: string): WebGLUniformLocation | null {
    let l = pr.u.get(name);
    if (l === undefined) {
      l = this.gl.getUniformLocation(pr.p, name);
      pr.u.set(name, l);
    }
    return l;
  }

  // ---- frame and matrices

  /** the start of a frame: the whole drawing buffer, cleared black */
  beginFrame(w: number, h: number): void {
    const gl = this.gl;
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
    gl.viewport(0, 0, w, h);
    gl.depthMask(true);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }

  /** vw_CameraLookAt: the projection and the camera's modelview */
  cameraLookAt(): void {
    this.proj = Float32Array.from(projectionMatrix());
    this.mv = viewMatrix();
    this.stack.length = 0;
  }

  clearDepth(): void {
    this.gl.depthMask(true);
    this.gl.clear(this.gl.DEPTH_BUFFER_BIT);
  }

  push(): void { this.stack.push(this.mv); }
  pop(): void { this.mv = this.stack.pop() ?? this.mv; }
  translate(x: number, y: number, z: number): void { this.mv = mult(this.mv, translationMatrix(x, y, z)); }
  rotate(a: number, x: number, y: number, z: number): void { if (a) this.mv = mult(this.mv, rotationMatrix(a, x, y, z)); }

  // ---- resources

  texture(name: string | null | undefined): WebGLTexture | null {
    const t = getTexture(name);
    if (!t) return null;
    if (!t.gl) t.gl = this.upload(t);
    return t.gl as WebGLTexture;
  }

  private upload(t: Tex): WebGLTexture {
    const gl = this.gl;
    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, t.width, t.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, t.rgba);
    const info = this.texInfo.get(t.name);
    const wrap = t.wrap === 'REPEAT' ? gl.REPEAT : gl.CLAMP_TO_EDGE;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    if (t.mipmap) {
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, info?.[4] === 'TRILINEAR' ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR_MIPMAP_NEAREST);
    } else {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
    if (info?.[5] && this.aniso) gl.texParameterf(gl.TEXTURE_2D, this.aniso.TEXTURE_MAX_ANISOTROPY_EXT, 4);
    return tex;
  }

  private vbo(a: Float32Array): WebGLBuffer {
    let b = this.buffers.get(a);
    if (!b) {
      const gl = this.gl;
      b = gl.createBuffer()!;
      gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.bufferData(gl.ARRAY_BUFFER, a, gl.STATIC_DRAW);
      this.buffers.set(a, b);
    }
    return b;
  }

  private ibo(a: Uint32Array): WebGLBuffer {
    let b = this.buffers.get(a);
    if (!b) {
      const gl = this.gl;
      b = gl.createBuffer()!;
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, b);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, a, gl.STATIC_DRAW);
      this.buffers.set(a, b);
    }
    return b;
  }

  // ---- lights (vw_CheckAndActivateAllLights)

  private setLights(loc: Vec3, radius2: number, matrix: M): void {
    const gl = this.gl;
    const pr = this.light;
    const pos = new Float32Array(28), diff = new Float32Array(28), spec = new Float32Array(28), amb = new Float32Array(28), att = new Float32Array(21);
    const active: Light[] = [];
    let dirCount = 0;
    for (const l of lights) {
      if (l.type !== LightType.Directional || dirCount >= 1) continue;
      if (l.On) {
        active.push(l);
        dirCount++;
      }
    }
    if (config.MaxPointLights > 0) {
      let pc = 0;
      for (const l of calculateAllPointLightsAttenuation(loc, radius2)) {
        if (pc >= config.MaxPointLights || dirCount + pc >= 8) break;
        active.push(l);
        pc++;
      }
    }
    active.forEach((l, i) => {
      if (i > 6) return;
      const p = l.type === LightType.Directional
        ? xform(matrix, -l.Direction.x, -l.Direction.y, -l.Direction.z, 0)
        : xform(matrix, l.Location.x, l.Location.y, l.Location.z, 1);
      pos.set(p, i * 4);
      diff.set(l.Diffuse, i * 4);
      spec.set(l.Specular, i * 4);
      amb.set(l.Ambient, i * 4);
      if (l.type === LightType.Directional) att.set([1, 0, 0], i * 3);
      else att.set([l.ConstantAttenuation, l.LinearAttenuation, l.QuadraticAttenuation], i * 3);
    });
    for (let i = active.length; i < 7; i++) att.set([1, 0, 0], i * 3);
    gl.uniform4fv(this.U(pr, 'uLPos'), pos);
    gl.uniform4fv(this.U(pr, 'uLDiff'), diff);
    gl.uniform4fv(this.U(pr, 'uLSpec'), spec);
    gl.uniform4fv(this.U(pr, 'uLAmb'), amb);
    gl.uniform3fv(this.U(pr, 'uLAtt'), att);
  }

  // ---- cObject3D::Draw

  drawObject(o: Object3D): void {
    if (!o.Chunks.length) return;
    const gl = this.gl;
    const pr = this.light;
    let onePiece = false;
    if (o.PromptDrawDist2 >= 0) {
      const c = getCameraLocation();
      const d2 = (o.Location.x - c.x) ** 2 + (o.Location.y - c.y) ** 2 + (o.Location.z - c.z) ** 2;
      const count = calculateAllPointLightsAttenuation(o.Location, o.Radius * o.Radius).length;
      if (d2 > o.PromptDrawDist2) {
        onePiece = count <= config.MaxPointLights;
        if (o.InternalLights >= count) onePiece = true;
      } else if (count <= config.MaxPointLights) {
        onePiece = true;
      }
    }
    const matrix = this.mv;
    this.push();
    this.translate(o.Location.x, o.Location.y, o.Location.z);
    this.rotate(o.Rotation.z, 0, 0, 1);
    this.rotate(o.Rotation.y, 0, 1, 0);
    this.rotate(o.Rotation.x, 1, 0, 0);
    gl.useProgram(pr.p);
    gl.uniformMatrix4fv(this.U(pr, 'uProj'), false, this.proj);
    gl.uniform4fv(this.U(pr, 'uMatDiffuse'), o.Diffuse);
    gl.uniform4fv(this.U(pr, 'uMatAmbient'), o.Ambient);
    gl.uniform4fv(this.U(pr, 'uMatSpecular'), o.Specular);
    gl.uniform1f(this.U(pr, 'uShininess'), o.Power);
    gl.uniform1i(this.U(pr, 'uTex1'), 0);
    gl.uniform1i(this.U(pr, 'uTex2'), 1);
    const explosion = o.ShaderType === 2;
    gl.uniform1i(this.U(pr, 'uExplosion'), explosion ? 1 : 0);
    gl.uniform1f(this.U(pr, 'uSpeed1'), o.ExplShaderSpeedDelta);
    gl.uniform1f(this.U(pr, 'uSpeed2'), o.ExplShaderRangeFactor);
    if (!o.NeedCullFaces) gl.disable(gl.CULL_FACE);
    const baseAlphaRef = o.NeedAlphaTest ? 0.4 : -1;
    gl.disable(gl.BLEND);
    gl.depthMask(true);
    const bindTex = (i: number): void => {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.texture(o.Texture[i]) ?? this.white);
      const illum = !explosion && o.TextureIllum.length > i ? this.texture(o.TextureIllum[i]) : null;
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, illum);
      gl.uniform1i(this.U(pr, 'uMulti'), illum ? 1 : 0);
      gl.activeTexture(gl.TEXTURE0);
    };
    if (onePiece && o.Model) {
      bindTex(0);
      gl.uniform2f(this.U(pr, 'uTexOffset'), 0, 0);
      gl.uniform1f(this.U(pr, 'uAlphaRef'), baseAlphaRef);
      this.setLights(o.Location, o.Radius * o.Radius, matrix);
      gl.uniformMatrix4fv(this.U(pr, 'uMV'), false, Float32Array.from(this.mv));
      const m = o.Model;
      const stride = o.Chunks[0].VertexStride;
      this.drawArrays(m.GlobalVertexArray, stride, m.GlobalIndexArrayCount ? m.GlobalIndexArray : null, 0,
        m.GlobalIndexArrayCount || m.GlobalVertexArrayCount);
    } else {
      const N1 = o.Chunks.some((c) => c.DrawType === 'blend');
      for (let i = 0; i < o.Chunks.length; i++) {
        const ch = o.Chunks[i];
        if (o.HitBB.length) {
          const h = o.HitBB[i];
          let mnx = h.Box[0].x + h.Location.x, mny = h.Box[0].y + h.Location.y, mnz = h.Box[0].z + h.Location.z;
          let mxx = mnx, mxy = mny, mxz = mnz;
          for (const p of h.Box) {
            const x = p.x + h.Location.x, y = p.y + h.Location.y, z = p.z + h.Location.z;
            if (mnx > x) mnx = x;
            if (mny > y) mny = y;
            if (mnz > z) mnz = z;
            if (mxx < x) mxx = x;
            if (mxy < y) mxy = y;
            if (mxz < z) mxz = z;
          }
          if (!boxInFrustum(new Vec3(o.Location.x + mnx, o.Location.y + mny, o.Location.z + mnz),
            new Vec3(o.Location.x + mxx, o.Location.y + mxy, o.Location.z + mxz))) continue;
        }
        bindTex(i);
        gl.uniform2f(this.U(pr, 'uTexOffset'), ch.NeedTextureAnimation ? ch.TextureAnimation.x : 0, ch.NeedTextureAnimation ? ch.TextureAnimation.y : 0);
        this.push();
        this.translate(ch.Location.x, ch.Location.y, ch.Location.z);
        this.rotate(ch.Rotation.z, 0, 0, 1);
        this.rotate(ch.Rotation.y, 0, 1, 0);
        this.rotate(ch.Rotation.x, 1, 0, 0);
        if (ch.NeedGeometryAnimation) {
          this.rotate(ch.GeometryAnimation.z, 0, 0, 1);
          this.rotate(ch.GeometryAnimation.y, 0, 1, 0);
          this.rotate(ch.GeometryAnimation.x, 1, 0, 0);
        }
        if (o.HitBB.length) this.setLights(o.Location.add(o.HitBB[i].Location), o.HitBB[i].Radius2, matrix);
        else this.setLights(o.Location, o.Radius * o.Radius, matrix);
        if (N1) {
          gl.enable(gl.POLYGON_OFFSET_FILL);
          gl.polygonOffset(2, 2);
        }
        let alphaRef = baseAlphaRef;
        if (ch.DrawType === 'blend') {
          alphaRef = 0.01;
          gl.enable(gl.BLEND);
          gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
          gl.enable(gl.POLYGON_OFFSET_FILL);
          gl.polygonOffset(1, 1);
        }
        gl.uniform1f(this.U(pr, 'uAlphaRef'), alphaRef);
        gl.uniformMatrix4fv(this.U(pr, 'uMV'), false, Float32Array.from(this.mv));
        this.drawChunk(ch);
        if (ch.DrawType === 'blend') {
          gl.disable(gl.BLEND);
          gl.disable(gl.POLYGON_OFFSET_FILL);
        }
        this.pop();
      }
      gl.disable(gl.POLYGON_OFFSET_FILL);
    }
    if (!o.NeedCullFaces) gl.enable(gl.CULL_FACE);
    this.pop();
    if (!o.ShowStatus || o.ArmorInitialStatus <= 0
      || (o.ArmorCurrentStatus === o.ArmorInitialStatus && o.ShieldCurrentStatus === o.ShieldInitialStatus && !o.ShowStatusAllTime)) return;
    this.drawStatus(new Vec3(o.Location.x, o.Location.y + o.AABB[0].y + 0.7, o.Location.z), o.Width, [1, 0, 0], o.ArmorCurrentStatus, o.ArmorInitialStatus);
    if (o.ShieldInitialStatus > 0) {
      this.drawStatus(new Vec3(o.Location.x, o.Location.y + o.AABB[0].y + 1.75, o.Location.z), o.Width, [0.1, 0.7, 1], o.ShieldCurrentStatus, o.ShieldInitialStatus);
    }
  }

  private drawChunk(ch: Chunk3D): void {
    this.drawArrays(ch.VertexArray, ch.VertexStride, ch.IndexArray, ch.RangeStart, ch.VertexQuantity);
  }

  private drawArrays(va: Float32Array, stride: number, ia: Uint32Array | null, start: number, count: number): void {
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo(va));
    const s = stride * 4;
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, s, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, s, 12);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 2, gl.FLOAT, false, s, 24);
    if (stride >= 12) {
      gl.enableVertexAttribArray(3);
      gl.vertexAttribPointer(3, 4, gl.FLOAT, false, s, 32);
    } else {
      gl.disableVertexAttribArray(3);
      gl.vertexAttrib4f(3, 0, 0, 0, 0);
    }
    if (ia) {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo(ia));
      gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_INT, start * 4);
    } else {
      gl.drawArrays(gl.TRIANGLES, start, count);
    }
  }

  // ---- RI_3f_XYZ | RI_4f_COLOR | RI_1_TEX arrays

  /** vertices of 9 floats (xyz, rgba, uv); mode TRIANGLES or TRIANGLE_STRIP; blend 'add' | 'alpha' | null */
  drawColored(data: Float32Array, count: number, mode: number, tex: WebGLTexture | null, blend: 'add' | 'alpha' | null, depthTest: boolean, depthWrite: boolean): void {
    const gl = this.gl;
    const pr = this.color;
    gl.useProgram(pr.p);
    gl.uniformMatrix4fv(this.U(pr, 'uProj'), false, this.proj);
    gl.uniformMatrix4fv(this.U(pr, 'uMV'), false, Float32Array.from(this.mv));
    gl.uniform1i(this.U(pr, 'uTex'), 0);
    gl.uniform1i(this.U(pr, 'uUseTex'), tex ? 1 : 0);
    gl.uniform1f(this.U(pr, 'uAlphaRef'), -1);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    if (blend) {
      gl.enable(gl.BLEND);
      if (blend === 'add') gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      else gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    } else {
      gl.disable(gl.BLEND);
    }
    if (depthTest) gl.enable(gl.DEPTH_TEST);
    else gl.disable(gl.DEPTH_TEST);
    gl.depthMask(depthWrite);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.dyn);
    gl.bufferData(gl.ARRAY_BUFFER, data.subarray(0, count * 9), gl.STREAM_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 36, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 36, 12);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 36, 28);
    gl.disableVertexAttribArray(3);
    gl.drawArrays(mode, 0, count);
    gl.disable(gl.BLEND);
    gl.enable(gl.DEPTH_TEST);
    gl.depthMask(true);
  }

  /** DrawObjectStatus: the armor and shield bars over an object, turned to the camera */
  private drawStatus(loc: Vec3, width: number, color: [number, number, number], cur: number, init: number): void {
    this.push();
    const r = getCameraRotation();
    this.translate(loc.x, loc.y, loc.z);
    this.rotate(-180 + r.y, 0, 1, 0);
    this.rotate(-r.x, 1, 0, 0);
    const bar = (x0: number, x1: number, sy: number, c: [number, number, number]): Float32Array => {
      const v = new Float32Array(36);
      const pts = [[x0, -sy], [x0, sy], [x1, -sy], [x1, sy]];
      pts.forEach(([x, y], k) => v.set([x, y, 0, c[0], c[1], c[2], 1, 0, 0], k * 9));
      return v;
    };
    const sizeX = width / 2.5 + 0.1;
    this.drawColored(bar(-sizeX, sizeX, 0.35, [0, 0, 0]), 4, this.gl.TRIANGLE_STRIP, null, null, true, true);
    this.drawColored(bar(width / 2.5 - 0.8 * width * cur / init, width / 2.5, 0.25, color), 4, this.gl.TRIANGLE_STRIP, null, null, true, true);
    this.pop();
  }

  // ---- particles (cParticleSystem::Draw, the CPU path that matches particle.vert)

  drawParticleSystems(systems: ParticleSystem[]): void {
    const cl = getCameraLocation();
    for (const ps of systems) {
      if (!ps.ParticlesList.length || !boxInFrustum(ps.AABB[6], ps.AABB[0])) continue;
      const n = ps.ParticlesList.length;
      const data = new Float32Array(n * 6 * 9);
      let k = 0;
      const put = (x: number, y: number, z: number, c: { r: number; g: number; b: number }, a: number, u: number, v: number): void => {
        data[k++] = x; data[k++] = y; data[k++] = z;
        data[k++] = c.r; data[k++] = c.g; data[k++] = c.b; data[k++] = a;
        data[k++] = u; data[k++] = v;
      };
      for (const p of ps.ParticlesList) {
        let tx = cl.x - p.Location.x, ty = cl.y - p.Location.y, tz = cl.z - p.Location.z;
        const l1 = Math.hypot(tx, ty, tz) || 1;
        tx /= l1; ty /= l1; tz /= l1;
        let ax = 1, ay = 1, az = -(tx + ty) / tz;
        const l2 = Math.hypot(ax, ay, az) || 1;
        ax /= l2; ay /= l2; az /= l2;
        let bx = ty * az - ay * tz, by = tz * ax - az * tx, bz = tx * ay - ax * ty;
        const l3 = Math.hypot(bx, by, bz) || 1;
        bx /= l3; by /= l3; bz /= l3;
        const s = p.Size * 1.5;
        const L = p.Location, c = p.Color, a = p.Alpha;
        put(L.x - bx * s, L.y - by * s, L.z - bz * s, c, a, 0, 1);
        put(L.x + ax * s, L.y + ay * s, L.z + az * s, c, a, 0, 0);
        put(L.x + bx * s, L.y + by * s, L.z + bz * s, c, a, 1, 0);
        put(L.x + bx * s, L.y + by * s, L.z + bz * s, c, a, 1, 0);
        put(L.x - ax * s, L.y - ay * s, L.z - az * s, c, a, 1, 1);
        put(L.x - bx * s, L.y - by * s, L.z - bz * s, c, a, 0, 1);
      }
      this.drawColored(data, n * 6, this.gl.TRIANGLES, this.texture(ps.Texture), ps.TextureBlend ? 'alpha' : 'add', true, false);
    }
  }

  // ---- the skybox (SkyBoxDraw)

  drawSkyBox(sides: (string | null)[], hx: number, hy: number, hz: number, baseRotation: Vec3): void {
    const gl = this.gl;
    const pr = this.sky;
    const c = getCameraLocation();
    this.push();
    this.translate(c.x, c.y, c.z);
    this.rotate(baseRotation.x, 1, 0, 0);
    this.rotate(baseRotation.y, 0, 1, 0);
    this.rotate(baseRotation.z, 0, 0, 1);
    gl.useProgram(pr.p);
    gl.uniformMatrix4fv(this.U(pr, 'uProj'), false, this.proj);
    gl.uniformMatrix4fv(this.U(pr, 'uMV'), false, Float32Array.from(this.mv));
    gl.uniform1i(this.U(pr, 'uTex1'), 0);
    gl.uniform1i(this.U(pr, 'uTex2'), 1);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.texture('skybox/tile_stars.tga'));
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
    // BACK, FRONT, BOTTOM, TOP, LEFT, RIGHT as SkyBoxDraw (side order of eSide: BACK, BOTTOM, FRONT, LEFT, RIGHT, TOP)
    const quads: [number, number[][]][] = [
      [0, [[hx, -hy, -hz, 0, 0], [hx, hy, -hz, 0, 1], [-hx, -hy, -hz, 1, 0], [-hx, hy, -hz, 1, 1]]],
      [2, [[-hx, -hy, hz, 0, 0], [-hx, hy, hz, 0, 1], [hx, -hy, hz, 1, 0], [hx, hy, hz, 1, 1]]],
      [1, [[-hx, -hy, -hz, 0, 0], [-hx, -hy, hz, 0, 1], [hx, -hy, -hz, 1, 0], [hx, -hy, hz, 1, 1]]],
      [5, [[hx, hy, -hz, 1, 1], [hx, hy, hz, 1, 0], [-hx, hy, -hz, 0, 1], [-hx, hy, hz, 0, 0]]],
      [3, [[-hx, hy, -hz, 0, 1], [-hx, hy, hz, 1, 1], [-hx, -hy, -hz, 0, 0], [-hx, -hy, hz, 1, 0]]],
      [4, [[hx, -hy, -hz, 1, 0], [hx, -hy, hz, 0, 0], [hx, hy, -hz, 1, 1], [hx, hy, hz, 0, 1]]],
    ];
    for (const [side, q] of quads) {
      const t = this.texture(sides[side]);
      if (!t) continue;
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, t);
      const d = new Float32Array(20);
      q.forEach((v, i) => d.set(v, i * 5));
      gl.bindBuffer(gl.ARRAY_BUFFER, this.dyn);
      gl.bufferData(gl.ARRAY_BUFFER, d, gl.STREAM_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 20, 0);
      gl.disableVertexAttribArray(1);
      gl.enableVertexAttribArray(2);
      gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 20, 12);
      gl.disableVertexAttribArray(3);
      gl.disable(gl.CULL_FACE);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      gl.enable(gl.CULL_FACE);
    }
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.activeTexture(gl.TEXTURE0);
    gl.enable(gl.DEPTH_TEST);
    this.pop();
  }

  /** the space dust layers: a textured strip, additive, without depth test; menu: turned as StarSystemDraw */
  drawDust(data: Float32Array, texture: string, menu: boolean): void {
    this.push();
    if (menu) {
      this.rotate(-20, 0, 0, 1);
      this.rotate(-45, 0, 1, 0);
      this.rotate(30, 1, 0, 0);
    }
    this.gl.disable(this.gl.CULL_FACE);
    this.drawColored(data, 4, this.gl.TRIANGLE_STRIP, this.texture(texture), 'add', false, true);
    this.gl.enable(this.gl.CULL_FACE);
    this.pop();
  }

  /** a planet or planetoid drawn moved by the camera parallax (StarSystemDraw) */
  drawShifted(o: Object3D, x: number, y: number, z: number): void {
    this.push();
    this.translate(x, y, z);
    this.drawObject(o);
    this.pop();
  }

  // ---- the 2D layer

  /** draws the 2D canvas over everything (alpha blended) */
  composite(src: TexImageSource): void {
    const gl = this.gl;
    const pr = this.quad;
    gl.useProgram(pr.p);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.overlay);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.uniform1i(this.U(pr, 'uTex'), 0);
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuf);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 8, 0);
    gl.disableVertexAttribArray(1);
    gl.disableVertexAttribArray(2);
    gl.disableVertexAttribArray(3);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.disable(gl.BLEND);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
  }

  /** a viewport inside the screen (the workshop's ship views): x, y, w, h in drawing buffer pixels, y from the top */
  setViewport(x: number, y: number, w: number, h: number): void {
    this.gl.viewport(x, this.canvas.height - y - h, w, h);
  }

  get frameCamera(): typeof cam { return cam; }
}

/** the renderer of the running game (null in the headless tests) */
export const R: { gl: Renderer | null } = { gl: null };
