// WebGL2 renderer for OpenTTD's 8bpp sprites: one R8 index per pixel in a
// texture array (the lossless GRF pixels), a 256-colour palette texture, and
// a remap table for recolouring. Draws batched screen-aligned quads.

export interface SpriteVariant {
  a: number;
  x: number;
  y: number;
  w: number;
  h: number;
  xo: number;
  yo: number;
  z: number;
}

export interface SpriteTable {
  atlases: { file: string; width: number; height: number; sha256: string; usedPixels: number }[];
  sprites: Record<string, SpriteVariant[]>;
  recolours: Record<string, string>;
}

const VERTEX = `#version 300 es
precision highp float;
layout(location = 0) in vec2 a_pos;
layout(location = 1) in vec2 a_texel;
layout(location = 2) in float a_layer;
uniform vec2 u_size;
out vec2 v_texel;
flat out int v_layer;
void main() {
  gl_Position = vec4(a_pos.x / u_size.x * 2.0 - 1.0, 1.0 - a_pos.y / u_size.y * 2.0, 0.0, 1.0);
  v_texel = a_texel;
  v_layer = int(a_layer + 0.5);
}`;

const FRAGMENT = `#version 300 es
precision highp float;
precision highp sampler2DArray;
uniform sampler2DArray u_atlas;
uniform sampler2D u_palette;
uniform sampler2D u_remap;
uniform ivec2 u_atlasSize;
in vec2 v_texel;
flat in int v_layer;
out vec4 outColor;
void main() {
  ivec2 t = clamp(ivec2(floor(v_texel)), ivec2(0), u_atlasSize - 1);
  int idx = int(texelFetch(u_atlas, ivec3(t, v_layer), 0).r * 255.0 + 0.5);
  if (idx == 0) discard;
  int mapped = int(texelFetch(u_remap, ivec2(idx, 0), 0).r * 255.0 + 0.5);
  vec4 c = texelFetch(u_palette, ivec2(mapped, 0), 0);
  if (c.a == 0.0) discard;
  outColor = c;
}`;

function compile(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('cannot create shader');
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) ?? 'shader compile failed');
  return shader;
}

export class SpriteRenderer {
  readonly gl: WebGL2RenderingContext;
  readonly table: SpriteTable;
  private program: WebGLProgram;
  private vao: WebGLVertexArrayObject;
  private buffer: WebGLBuffer;
  private atlas: WebGLTexture;
  private paletteTexture: WebGLTexture;
  private remapTexture: WebGLTexture;
  private uSize: WebGLUniformLocation;
  private uAtlasSize: WebGLUniformLocation;
  private data: Float32Array;
  private count = 0;

  constructor(canvas: HTMLCanvasElement, table: SpriteTable, atlases: Uint8Array[]) {
    const gl = canvas.getContext('webgl2', { alpha: false, antialias: false, depth: false, stencil: false, preserveDrawingBuffer: true });
    if (!gl) throw new Error('WebGL2 is not available');
    this.gl = gl;
    this.table = table;
    if (!table.atlases.length || atlases.length !== table.atlases.length) throw new Error('sprite atlases do not match the table');
    const w = table.atlases[0].width, h = table.atlases[0].height;
    if (!table.atlases.every((a) => a.width === w && a.height === h)) throw new Error('sprite atlases differ in size');

    const vs = compile(gl, gl.VERTEX_SHADER, VERTEX);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
    const program = gl.createProgram();
    if (!program) throw new Error('cannot create program');
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? 'link failed');
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    this.program = program;
    gl.useProgram(program);
    this.uSize = gl.getUniformLocation(program, 'u_size')!;
    this.uAtlasSize = gl.getUniformLocation(program, 'u_atlasSize')!;
    gl.uniform1i(gl.getUniformLocation(program, 'u_atlas'), 0);
    gl.uniform1i(gl.getUniformLocation(program, 'u_palette'), 1);
    gl.uniform1i(gl.getUniformLocation(program, 'u_remap'), 2);
    gl.uniform2i(this.uAtlasSize, w, h);

    // The sprite atlas as one R8 texture array; each GRF byte is one texel.
    const all = new Uint8Array(w * h * atlases.length);
    atlases.forEach((a, i) => {
      if (a.length !== w * h) throw new Error(`atlas ${i} has ${a.length} bytes, expected ${w * h}`);
      all.set(a, i * w * h);
    });
    this.atlas = gl.createTexture()!;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, this.atlas);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage3D(gl.TEXTURE_2D_ARRAY, 0, gl.R8, w, h, atlases.length, 0, gl.RED, gl.UNSIGNED_BYTE, all);

    this.paletteTexture = gl.createTexture()!;
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.paletteTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, 256, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(256 * 4));

    this.remapTexture = gl.createTexture()!;
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, this.remapTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const identity = new Uint8Array(256);
    for (let i = 0; i < 256; i++) identity[i] = i;
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, 256, 1, 0, gl.RED, gl.UNSIGNED_BYTE, identity);

    this.vao = gl.createVertexArray()!;
    this.buffer = gl.createBuffer()!;
    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 5 * 4, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 5 * 4, 2 * 4);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 1, gl.FLOAT, false, 5 * 4, 4 * 4);
    this.data = new Float32Array(6 * 5 * 4096);
    gl.bindVertexArray(null);
  }

  begin(width: number, height: number): void {
    const gl = this.gl;
    gl.viewport(0, 0, width, height);
    gl.clearColor(0.04, 0.06, 0.04, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(this.program);
    gl.uniform2f(this.uSize, width, height);
    gl.bindVertexArray(this.vao);
    this.count = 0;
  }

  updatePalette(rgba: Uint8Array): void {
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.paletteTexture);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 256, 1, gl.RGBA, gl.UNSIGNED_BYTE, rgba);
  }

  /** Queue one sprite; x,y is the screen point the sprite's offsets relate to. */
  draw(id: number, x: number, y: number, zoom: number): void {
    const variants = this.table.sprites[String(id)];
    if (!variants) return;
    let v: SpriteVariant | undefined;
    if (zoom === 2) v = variants.find((e) => e.z === 2) ?? variants.find((e) => e.z === 0);
    else v = variants.find((e) => e.z === 0) ?? variants[0];
    if (!v) return;
    const s = v.z === 2 && zoom === 2 ? 1 : zoom;
    const left = x + v.xo * s;
    const top = y + v.yo * s;
    const right = left + v.w * s;
    const bottom = top + v.h * s;
    const tx0 = v.x, tx1 = v.x + v.w;
    const ty0 = v.y, ty1 = v.y + v.h;
    const layer = v.a;
    if (this.count + 30 > this.data.length) {
      const bigger = new Float32Array(this.data.length * 2);
      bigger.set(this.data);
      this.data = bigger;
    }
    const d = this.data;
    let o = this.count;
    const vert = (px: number, py: number, tx: number, ty: number): void => {
      d[o++] = px; d[o++] = py; d[o++] = tx; d[o++] = ty; d[o++] = layer;
    };
    vert(left, top, tx0, ty0);
    vert(right, top, tx1, ty0);
    vert(left, bottom, tx0, ty1);
    vert(left, bottom, tx0, ty1);
    vert(right, top, tx1, ty0);
    vert(right, bottom, tx1, ty1);
    this.count = o;
  }

  end(): void {
    if (this.count === 0) return;
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, this.atlas);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.paletteTexture);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, this.remapTexture);
    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.data.subarray(0, this.count), gl.DYNAMIC_DRAW);
    gl.drawArrays(gl.TRIANGLES, 0, this.count / 5);
    gl.bindVertexArray(null);
    this.count = 0;
  }

  dispose(): void {
    const gl = this.gl;
    gl.deleteTexture(this.atlas);
    gl.deleteTexture(this.paletteTexture);
    gl.deleteTexture(this.remapTexture);
    gl.deleteBuffer(this.buffer);
    gl.deleteVertexArray(this.vao);
    gl.deleteProgram(this.program);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  }
}
