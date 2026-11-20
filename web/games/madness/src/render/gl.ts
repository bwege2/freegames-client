// Madness Interactive Reloaded port (GPL-3.0). The drawing: WebGL 2 quads sorted by Walgelijk's RenderOrder
// (layer, order in layer), with MIR's fragment shaders as modes: textured sprites, background-behind and
// background-front (base/shaders/background-*.frag: the alpha of a background says what is in front of the
// characters), alpha-clipped flipbooks (flipbook.frag), doors (door.frag), signed-distance text (sdf-font.frag)
// and plain colour.
export const Mode = { Sprite: 0, BgBehind: 1, BgFront: 2, Text: 3, AlphaClip: 4, Door: 5, Solid: 6, TrainBg: 7 } as const;

const VS = `#version 300 es
in vec2 aPos; in vec2 aUv; in vec4 aColor; in float aMode; in vec4 aP;
uniform vec4 uView; // center x, y, half width, half height
out vec2 vUv; out vec4 vColor; out float vMode; out vec4 vP; out vec2 vWorld;
void main() {
  vWorld = aPos;
  vUv = aUv; vColor = aColor; vMode = aMode; vP = aP;
  gl_Position = vec4((aPos.x - uView.x) / uView.z, (aPos.y - uView.y) / uView.w, 0.0, 1.0);
}`;
const FS = `#version 300 es
precision highp float;
in vec2 vUv; in vec4 vColor; in float vMode; in vec4 vP; in vec2 vWorld;
uniform sampler2D uTex;
out vec4 o;
float median(vec3 c) { return max(min(c.r, c.g), min(max(c.r, c.g), c.b)); }
void main() {
  int m = int(vMode + 0.5);
  if (m == 6) { o = vColor; return; }
  if (m == 7) { o = vColor * texture(uTex, vec2(mod(vWorld.x / 1024.0 + vP.x, 1.0), vUv.y)); return; } // train-background.frag
  if (m == 5) {
    vec2 t = vUv;
    if (vP.y < 0.5) t.y -= vP.x * 0.95;
    else { float side = sign(vUv.x - 0.5); t = vUv - vec2(side * vP.x * 0.5, 0.0); if (-(side * (t.x - 0.5)) >= 0.0) t = vec2(-1.0); }
    if (t.x < 0.0 || t.x > 1.0 || t.y < 0.0 || t.y > 1.0) discard;
    o = texture(uTex, t) * vColor;
    return;
  }
  vec4 c = texture(uTex, vUv);
  if (m == 3) {
    float d = median(c.rgb);
    float w = fwidth(d);
    float a = clamp((d - 0.5) / max(w, 1e-4) + 0.5, 0.0, 1.0);
    o = vec4(vColor.rgb, vColor.a * a);
    if (o.a < 0.004) discard;
    return;
  }
  c *= vColor;
  if (m == 1) { if (c.a >= 1.0 || c.a < 0.01) discard; c.a = 1.0; }
  else if (m == 2) { if (c.a < 1.0) discard; c.a = 1.0; }
  else if (m == 4) { c.a = c.a > 0.5 * vColor.a ? vColor.a : 0.0; if (c.a < 0.01) discard; }
  if (c.a < 0.004) discard;
  o = c;
}`;

export interface Tex { tex: WebGLTexture; w: number; h: number }
type Corners = [number, number, number, number, number, number, number, number];
interface Cmd { layer: number; order: number; seq: number; tex: Tex | null; v: Float32Array }

const FLOATS = 13;

export class Renderer {
  readonly gl: WebGL2RenderingContext;
  private prog: WebGLProgram;
  private buf: WebGLBuffer;
  private uView: WebGLUniformLocation;
  private cmds: Cmd[] = [];
  private seq = 0;
  private white: Tex;
  readonly textures = new Map<string, Tex>();
  constructor(readonly canvas: HTMLCanvasElement) {
    const gl = canvas.getContext('webgl2', { alpha: false, antialias: true, premultipliedAlpha: false });
    if (!gl) throw new Error('WebGL 2 is not available');
    this.gl = gl;
    const sh = (type: number, src: string): WebGLShader => {
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
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) ?? 'link');
    this.prog = p;
    this.uView = gl.getUniformLocation(p, 'uView')!;
    this.buf = gl.createBuffer()!;
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buf);
    const attr = (name: string, size: number, offset: number): void => {
      const l = gl.getAttribLocation(p, name);
      gl.enableVertexAttribArray(l);
      gl.vertexAttribPointer(l, size, gl.FLOAT, false, FLOATS * 4, offset * 4);
    };
    attr('aPos', 2, 0); attr('aUv', 2, 2); attr('aColor', 4, 4); attr('aMode', 1, 8); attr('aP', 4, 9);
    this.white = this.upload('#white', new Uint8Array([255, 255, 255, 255]), 1, 1);
  }

  /** uploads RGBA pixels (rows top to bottom; flipped so that v = 0 is the bottom, as Walgelijk has it) */
  upload(path: string, data: Uint8Array | ImageBitmap, w: number, h: number, mip = true): Tex {
    const gl = this.gl;
    const t = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    if (data instanceof Uint8Array) {
      const flipped = new Uint8Array(data.length);
      const row = w * 4;
      for (let y = 0; y < h; y++) flipped.set(data.subarray(y * row, (y + 1) * row), (h - 1 - y) * row);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, flipped);
    } else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, data);
    if (mip) gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mip ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const tex = { tex: t, w, h };
    this.textures.set(path, tex);
    return tex;
  }
  free(path: string): void {
    const t = this.textures.get(path);
    if (t) { this.gl.deleteTexture(t.tex); this.textures.delete(path); }
  }
  /** stop(): delete the textures, buffer and program (the context belongs to the canvas the site removes) */
  dispose(): void {
    for (const t of this.textures.values()) this.gl.deleteTexture(t.tex);
    this.textures.clear();
    this.cmds = [];
    this.gl.deleteBuffer(this.buf);
    this.gl.deleteProgram(this.prog);
  }

  /** a quad: corners bottom-left, bottom-right, top-right, top-left; uvs likewise */
  quad(tex: string | null, c: Corners, uv: Corners, color: [number, number, number, number], mode: number, layer: number, order: number, p: [number, number, number, number] = [0, 0, 0, 0]): void {
    const t = tex ? this.textures.get(tex) ?? null : this.white;
    if (tex && !t) return;
    const v = new Float32Array(6 * FLOATS);
    const idx = [0, 1, 2, 0, 2, 3];
    for (let i = 0; i < 6; i++) {
      const k = idx[i];
      v.set([c[k * 2], c[k * 2 + 1], uv[k * 2], uv[k * 2 + 1], color[0], color[1], color[2], color[3], mode, p[0], p[1], p[2], p[3]], i * FLOATS);
    }
    this.cmds.push({ layer, order, seq: this.seq++, tex: t, v });
  }

  /** draws everything queued, sorted by layer and order, with the world (or screen) rectangle as the view */
  flush(view: [number, number, number, number], clear: [number, number, number] | null): void {
    const gl = this.gl;
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    if (clear) { gl.clearColor(clear[0], clear[1], clear[2], 1); gl.clear(gl.COLOR_BUFFER_BIT); }
    gl.useProgram(this.prog);
    gl.uniform4f(this.uView, view[0], view[1], view[2], view[3]);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buf);
    this.cmds.sort((a, b) => a.layer - b.layer || a.order - b.order || a.seq - b.seq);
    let i = 0;
    while (i < this.cmds.length) {
      const t = this.cmds[i].tex;
      let j = i;
      while (j < this.cmds.length && this.cmds[j].tex === t) j++;
      const data = new Float32Array((j - i) * 6 * FLOATS);
      for (let k = i; k < j; k++) data.set(this.cmds[k].v, (k - i) * 6 * FLOATS);
      gl.bindTexture(gl.TEXTURE_2D, (t ?? this.white).tex);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STREAM_DRAW);
      gl.drawArrays(gl.TRIANGLES, 0, (j - i) * 6);
      i = j;
    }
    this.cmds = [];
    this.seq = 0;
  }
}
