// Chromium B.S.U. port (GPL-3.0-or-later, LICENSE.md): the part of OpenGL 1.x the game uses
// (src/gl.ts), on WebGL 2. Immediate mode (glBegin/glVertex/glEnd with the current colour, texture
// coordinate and normal), the three matrix stacks, GL_MODULATE texturing, sphere-map texture
// generation for the menu's chrome title, display lists, blending, culling and the depth test as the
// game sets them. Colours are clamped to 0..1 as the fixed pipeline does.
import {
  GL_BLEND, GL_CULL_FACE, GL_DEPTH_TEST, GL_MODELVIEW, GL_PROJECTION, GL_QUADS, GL_TEXTURE, GL_TEXTURE_GEN_S,
  GL_TRIANGLES, GL_TRIANGLE_STRIP, type GL, type Texture,
} from '../gl.ts';

type Mat = Float32Array;

function identity(): Mat {
  const m = new Float32Array(16);
  m[0] = m[5] = m[10] = m[15] = 1;
  return m;
}

/** a = a * b (column-major, as OpenGL) */
function mul(a: Mat, b: ArrayLike<number>): void {
  const r = new Float64Array(16);
  for (let c = 0; c < 4; c++) {
    for (let row = 0; row < 4; row++) {
      let s = 0;
      for (let k = 0; k < 4; k++) s += a[k * 4 + row] * b[c * 4 + k];
      r[c * 4 + row] = s;
    }
  }
  a.set(r);
}

export interface GLTexture extends Texture {
  readonly tex: WebGLTexture;
}

interface Batch {
  mode: number;
  data: Float32Array;
  count: number;
  /** a display list's own buffer */
  buffer?: WebGLBuffer;
}

const FLOATS = 12; // x y z, s t, r g b a, nx ny nz

const VS = `#version 300 es
layout(location = 0) in vec3 aPos;
layout(location = 1) in vec2 aTex;
layout(location = 2) in vec4 aColor;
layout(location = 3) in vec3 aNormal;
uniform mat4 uModelView;
uniform mat4 uProjection;
uniform mat4 uTexMat;
uniform bool uTexGen;
out vec2 vTex;
out vec4 vColor;
void main() {
  vec4 eye = uModelView * vec4(aPos, 1.0);
  gl_Position = uProjection * eye;
  vColor = clamp(aColor, 0.0, 1.0);
  vec4 tc = vec4(aTex, 0.0, 1.0);
  if (uTexGen) {
    // GL_SPHERE_MAP
    vec3 u = normalize(eye.xyz);
    vec3 n = normalize(mat3(uModelView) * aNormal);
    vec3 r = u - 2.0 * dot(n, u) * n;
    float m = 2.0 * sqrt(r.x * r.x + r.y * r.y + (r.z + 1.0) * (r.z + 1.0));
    tc = vec4(r.x / m + 0.5, r.y / m + 0.5, 0.0, 1.0);
  }
  tc = uTexMat * tc;
  vTex = tc.xy / tc.w;
}`;

const FS = `#version 300 es
precision mediump float;
in vec2 vTex;
in vec4 vColor;
uniform sampler2D uSampler;
uniform bool uTextured;
out vec4 fragColor;
void main() {
  fragColor = uTextured ? texture(uSampler, vTex) * vColor : vColor;
}`;

export class WebGLRenderer implements GL {
  readonly gl: WebGL2RenderingContext;
  /** frames the game moves but nobody sees (catching up): no drawing */
  skip = false;
  private readonly prog: WebGLProgram;
  private readonly vbo: WebGLBuffer;
  private readonly vao: WebGLVertexArrayObject;
  private readonly u: Record<string, WebGLUniformLocation | null> = {};
  private stacks: Record<number, Mat[]> = { [GL_MODELVIEW]: [identity()], [GL_PROJECTION]: [identity()], [GL_TEXTURE]: [identity()] };
  private mode = GL_MODELVIEW;
  private color = [1, 1, 1, 1];
  private tex = [0, 0];
  private normal = [0, 0, 1];
  private prim = -1;
  private verts: number[] = [];
  private bound: GLTexture | null = null;
  private white: GLTexture;
  private texGen = false;
  private compiling: Batch[] | null = null;
  private compilingId = 0;
  private lists = new Map<number, Batch[]>();
  private nextList = 1;
  private clearRGBA = [0, 0, 0, 1];
  private depthWrite = true;

  constructor(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext('webgl2', { alpha: false, depth: true, antialias: false, premultipliedAlpha: false });
    if (!gl) throw new Error('WebGL 2 is not available');
    this.gl = gl;
    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'shader');
      return s;
    };
    const p = gl.createProgram()!;
    gl.attachShader(p, sh(gl.VERTEX_SHADER, VS));
    gl.attachShader(p, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) ?? 'program');
    this.prog = p;
    gl.useProgram(p);
    for (const n of ['uModelView', 'uProjection', 'uTexMat', 'uTexGen', 'uSampler', 'uTextured']) this.u[n] = gl.getUniformLocation(p, n);
    gl.uniform1i(this.u.uSampler, 0);
    this.vao = gl.createVertexArray()!;
    this.vbo = gl.createBuffer()!;
    gl.bindVertexArray(this.vao);
    this.attribs(this.vbo);
    gl.frontFace(gl.CCW);
    gl.cullFace(gl.BACK);
    this.white = this.upload('-', new Uint8Array([255, 255, 255, 255]), 1, 1, false, gl.REPEAT, gl.NEAREST, gl.NEAREST);
  }

  private attribs(buf: WebGLBuffer): void {
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    const stride = FLOATS * 4;
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, stride, 0);
    gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 2, gl.FLOAT, false, stride, 12);
    gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2, 4, gl.FLOAT, false, stride, 20);
    gl.enableVertexAttribArray(3); gl.vertexAttribPointer(3, 3, gl.FLOAT, false, stride, 36);
  }

  /** a texture from RGBA pixels */
  upload(name: string, rgba: Uint8Array, w: number, h: number, mipmap: boolean, wrap: number, min: number, mag: number): GLTexture {
    const gl = this.gl;
    const t = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, rgba);
    if (mipmap) gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mipmap ? min : (min === gl.NEAREST ? gl.NEAREST : gl.LINEAR));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, mag);
    if (this.bound) gl.bindTexture(gl.TEXTURE_2D, this.bound.tex);
    return { name, tex: t };
  }

  private top(m = this.mode): Mat {
    const s = this.stacks[m];
    return s[s.length - 1];
  }

  begin(mode: number): void {
    this.prim = mode;
    this.verts.length = 0;
  }

  end(): void {
    const mode = this.prim;
    this.prim = -1;
    const v = this.verts;
    const n = v.length / FLOATS;
    if (!n) return;
    let data: Float32Array;
    let glMode: number;
    let count: number;
    if (mode === GL_QUADS) {
      const quads = Math.floor(n / 4);
      data = new Float32Array(quads * 6 * FLOATS);
      let o = 0;
      for (let q = 0; q < quads; q++) {
        for (const k of [0, 1, 2, 0, 2, 3]) {
          const b = (q * 4 + k) * FLOATS;
          for (let i = 0; i < FLOATS; i++) data[o++] = v[b + i];
        }
      }
      glMode = this.gl.TRIANGLES;
      count = quads * 6;
    } else {
      data = new Float32Array(v);
      glMode = mode === GL_TRIANGLE_STRIP ? this.gl.TRIANGLE_STRIP : mode === GL_TRIANGLES ? this.gl.TRIANGLES : this.gl.TRIANGLES;
      count = n;
    }
    const batch: Batch = { mode: glMode, data, count };
    if (this.compiling) this.compiling.push(batch);
    else this.draw(batch);
  }

  private draw(b: Batch): void {
    if (this.skip) return;
    const gl = this.gl;
    gl.useProgram(this.prog);
    gl.uniformMatrix4fv(this.u.uModelView, false, this.top(GL_MODELVIEW));
    gl.uniformMatrix4fv(this.u.uProjection, false, this.top(GL_PROJECTION));
    gl.uniformMatrix4fv(this.u.uTexMat, false, this.top(GL_TEXTURE));
    gl.uniform1i(this.u.uTexGen, this.texGen ? 1 : 0);
    gl.uniform1i(this.u.uTextured, 1);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, (this.bound ?? this.white).tex);
    gl.bindVertexArray(this.vao);
    if (b.buffer) {
      this.attribs(b.buffer);
    } else {
      this.attribs(this.vbo);
      gl.bufferData(gl.ARRAY_BUFFER, b.data, gl.STREAM_DRAW);
    }
    gl.drawArrays(b.mode, 0, b.count);
  }

  vertex3f(x: number, y: number, z: number): void {
    const c = this.color, t = this.tex, n = this.normal;
    this.verts.push(x, y, z, t[0], t[1], c[0], c[1], c[2], c[3], n[0], n[1], n[2]);
  }
  texCoord2f(s: number, t: number): void { this.tex = [s, t]; }
  color4f(r: number, g: number, b: number, a: number): void { this.color = [r, g, b, a]; }
  normal3f(x: number, y: number, z: number): void { this.normal = [x, y, z]; }
  translatef(x: number, y: number, z: number): void {
    mul(this.top(), [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]);
  }
  rotatef(a: number, x: number, y: number, z: number): void {
    const len = Math.hypot(x, y, z);
    if (!len) return;
    x /= len; y /= len; z /= len;
    const r = (a * Math.PI) / 180;
    const c = Math.cos(r), s = Math.sin(r), t = 1 - c;
    mul(this.top(), [
      t * x * x + c, t * x * y + s * z, t * x * z - s * y, 0,
      t * x * y - s * z, t * y * y + c, t * y * z + s * x, 0,
      t * x * z + s * y, t * y * z - s * x, t * z * z + c, 0,
      0, 0, 0, 1,
    ]);
  }
  scalef(x: number, y: number, z: number): void {
    mul(this.top(), [x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1]);
  }
  pushMatrix(): void {
    const s = this.stacks[this.mode];
    s.push(new Float32Array(s[s.length - 1]));
  }
  popMatrix(): void {
    const s = this.stacks[this.mode];
    if (s.length > 1) s.pop();
  }
  loadIdentity(): void { this.top().set(identity()); }
  matrixMode(mode: number): void { this.mode = mode; }
  bindTexture(t: Texture | null): void { this.bound = t as GLTexture | null; }
  blendFunc(s: number, d: number): void { this.gl.blendFunc(s, d); }
  enable(cap: number): void { this.cap(cap, true); }
  disable(cap: number): void { this.cap(cap, false); }
  private cap(cap: number, on: boolean): void {
    const gl = this.gl;
    if (cap === GL_TEXTURE_GEN_S) this.texGen = on;
    else if (cap === GL_DEPTH_TEST || cap === GL_CULL_FACE || cap === GL_BLEND) {
      if (on) gl.enable(cap); else gl.disable(cap);
    }
    // GL_TEXTURE_2D stays on, GL_TEXTURE_GEN_T goes with S; GL_NORMALIZE and GL_ALPHA_TEST are not used
  }
  clear(): void {
    if (this.skip) return;
    const gl = this.gl;
    gl.clearColor(this.clearRGBA[0], this.clearRGBA[1], this.clearRGBA[2], this.clearRGBA[3]);
    gl.depthMask(true);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.depthMask(this.depthWrite);
  }
  clearColor(r: number, g: number, b: number, a: number): void {
    this.clearRGBA = [Math.min(1, Math.max(0, r)), Math.min(1, Math.max(0, g)), Math.min(1, Math.max(0, b)), Math.min(1, Math.max(0, a))];
  }
  depthFunc(f: number): void { this.gl.depthFunc(f); }
  depthMask(on: boolean): void { this.depthWrite = on; this.gl.depthMask(on); }
  viewport(x: number, y: number, w: number, h: number): void { this.gl.viewport(x, y, w, h); }
  /** WebGL has no border colour; the game's textures use clamp-to-edge here */
  texBorderColor(): void {}
  genLists(n: number): number { const r = this.nextList; this.nextList += n; return r; }
  newList(list: number): void { this.compiling = []; this.compilingId = list; }
  endList(): void {
    const gl = this.gl;
    const batches = this.compiling ?? [];
    for (const b of batches) {
      b.buffer = gl.createBuffer()!;
      gl.bindBuffer(gl.ARRAY_BUFFER, b.buffer);
      gl.bufferData(gl.ARRAY_BUFFER, b.data, gl.STATIC_DRAW);
    }
    const old = this.lists.get(this.compilingId);
    if (old) for (const b of old) if (b.buffer) gl.deleteBuffer(b.buffer);
    this.lists.set(this.compilingId, batches);
    this.compiling = null;
  }
  callList(list: number): void {
    for (const b of this.lists.get(list) ?? []) this.draw(b);
  }
  perspective(fovy: number, aspect: number, near: number, far: number): void {
    const f = 1 / Math.tan((fovy * Math.PI) / 360);
    mul(this.top(), [f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) / (near - far), -1, 0, 0, (2 * far * near) / (near - far), 0]);
  }
}

