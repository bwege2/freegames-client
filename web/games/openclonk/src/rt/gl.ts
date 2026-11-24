// OpenClonk in the browser: the OpenGL calls of the original's renderer on WebGL2, for the translated code.
//
// The original renders through OpenGL 3.2 core (platform/C4WindowSDL.cpp asks SDL for a 3.2 core context; the
// functions come from libepoxy). Its calls are in graphics/C4DrawGL.cpp, C4DrawGLCtx.cpp, C4DrawMeshGL.cpp,
// C4Shader.{h,cpp}, C4Surface.cpp, landscape/C4LandscapeRender.cpp, C4Particles.cpp, landscape/fow/C4FoW*.cpp,
// lib/StdMesh.cpp, game/C4GraphicsSystem.cpp, gui/C4GuiDialogs.cpp and platform/C4WindowSDL.cpp
// (re/openclonk/tools/gl.txt lists them). Each is here as `gl$<name>` with the C signature, on the pointer
// conventions of rt/ptr.ts, like the C library in rt/libc.ts (`c$<name>`). Under epoxy a call `glClear(...)` is a call
// through the function-pointer variable `epoxy_glClear` (epoxy/gl_generated.h: `#define glClear epoxy_glClear`),
// so clang's syntax tree names `epoxy_glClear`: the translator maps `epoxy_<name>` to `gl$<name>` of this module.
//
// GL names objects with integers, WebGL with objects: the tables below keep the integers the original sees. Where
// WebGL2 lacks what OpenGL 3.2 has, the emulation is written next to the function:
//  * BGRA pixel data (GL_BGRA, GL_UNSIGNED_INT_8_8_8_8_REV: the bytes B, G, R, A of the original's 0xAARRGGBB
//    DWORDs) is swapped to RGBA on upload and back on read (glReadPixels, glGetTexImage).
//  * 1D textures (glTexImage1D: the landscape's material map) are 2D textures of height 1; rt/glsl.ts turns their
//    sampler1D into sampler2D.
//  * glDrawElementsBaseVertex re-points the vertex attributes by base vertex × stride for the draw.
//  * glMapBuffer/glUnmapBuffer write through a copy of the buffer that glUnmapBuffer uploads.
//  * glGetTexImage reads the texture through a framebuffer.
//  * unsized GL_RED with float data (C4FoWAmbient) is stored as R8 like a desktop driver does (normalised, clamped).
//  * glPolygonMode (wireframe debugging views), glDebugMessageCallback, glObjectLabel: no WebGL2 counterpart;
//    recorded, no effect. GL_CLAMP and GL_TEXTURE_BORDER_COLOR: GL_CLAMP is not an OpenGL 3.2 core enum (the
//    original's context gives GL_INVALID_ENUM and keeps the wrap mode), so here too.
//  * glPrimitiveRestartIndex/GL_PRIMITIVE_RESTART: WebGL2 always restarts at the type's largest index, which is the
//    index the original sets (0xffffffff for GL_UNSIGNED_INT).
import { Ptr, S, $fieldOf } from './ptr.ts';
import { toGlslEs } from './glsl.ts';

// ---- the GL enums this module needs (the translated code passes the numbers; the names are for reading)
const GL = {
  NO_ERROR: 0, INVALID_ENUM: 0x0500, INVALID_VALUE: 0x0501, INVALID_OPERATION: 0x0502,
  TRUE: 1, FALSE: 0,
  TEXTURE_1D: 0x0de0, TEXTURE_2D: 0x0de1, TEXTURE_2D_ARRAY: 0x8c1a, TEXTURE_BORDER_COLOR: 0x1004,
  TEXTURE_WRAP_S: 0x2802, TEXTURE_WRAP_T: 0x2803, CLAMP: 0x2900,
  RED: 0x1903, RGB: 0x1907, RGBA: 0x1908, BGR: 0x80e0, BGRA: 0x80e1, RGBA8: 0x8058, R8: 0x8229,
  UNSIGNED_BYTE: 0x1401, UNSIGNED_INT_8_8_8_8_REV: 0x8367, FLOAT: 0x1406, UNSIGNED_INT: 0x1405, UNSIGNED_SHORT: 0x1403, SHORT: 0x1402, BYTE: 0x1400,
  VENDOR: 0x1f00, RENDERER: 0x1f01, VERSION: 0x1f02, EXTENSIONS: 0x1f03, SHADING_LANGUAGE_VERSION: 0x8b8c,
  NUM_EXTENSIONS: 0x821d, MAX_SAMPLES: 0x8d57, FRAMEBUFFER_BINDING: 0x8ca6, DRAW_FRAMEBUFFER: 0x8ca9, READ_FRAMEBUFFER: 0x8ca8, FRAMEBUFFER: 0x8d40,
  COMPILE_STATUS: 0x8b81, LINK_STATUS: 0x8b82, INFO_LOG_LENGTH: 0x8b84, SHADER_SOURCE_LENGTH: 0x8b88, DELETE_STATUS: 0x8b80,
  ARRAY_BUFFER: 0x8892, ELEMENT_ARRAY_BUFFER: 0x8893, PRIMITIVE_RESTART: 0x8f9d, DEBUG_OUTPUT: 0x92e0, DEBUG_OUTPUT_SYNCHRONOUS: 0x8242,
  MULTISAMPLE: 0x809d, TEXTURE0: 0x84c0, UNPACK_ALIGNMENT: 0x0cf5, PACK_ALIGNMENT: 0x0d05,
  FRONT_AND_BACK: 0x0408, FILL: 0x1b02, COLOR_ATTACHMENT0: 0x8ce0,
} as const;

// ---- the context

interface Named<T> { objects: Map<number, T>; next: number }
const named = <T>(): Named<T> => ({ objects: new Map(), next: 1 });

interface VertexAttrib { size: number; type: number; normalized: boolean; stride: number; offset: number; buffer: WebGLBuffer | null; integer: boolean }
interface VaoState { vao: WebGLVertexArrayObject | null; attribs: Map<number, VertexAttrib> }
interface BufferState { buffer: WebGLBuffer; size: number; shadow: Uint8Array | null; target: number }
interface TextureState { texture: WebGLTexture; is1D: boolean; width: number; height: number }
interface ProgramState { program: WebGLProgram; locations: (WebGLUniformLocation | null)[]; byName: Map<string, number>; log: string }
interface ShaderState { shader: WebGLShader; type: number; source: string; log: string; compiled: boolean }

class Context {
  gl: WebGL2RenderingContext;
  buffers = named<BufferState>();
  textures = named<TextureState>();
  framebuffers = named<WebGLFramebuffer>();
  vaos = named<VaoState>();
  /** shaders and programs share one name space in GL */
  shaderObjects = named<ShaderState | ProgramState>();
  error = GL.NO_ERROR as number;
  defaultVao: VaoState = { vao: null, attribs: new Map() };
  boundVao: VaoState;
  /** what is bound where (GL names) */
  bound = new Map<number, number>();
  /** per texture unit and target: the GL texture name */
  units: Map<number, number>[] = [];
  activeUnit = 0;
  program: ProgramState | null = null;
  unpackAlignment = 4;
  packAlignment = 4;
  polygonMode = GL.FILL as number;
  labels = new Map<string, string>();
  readFbo: WebGLFramebuffer | null = null;
  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
    this.boundVao = this.defaultVao;
  }
}

let cx: Context | null = null;
const contexts = new Map<WebGL2RenderingContext, Context>();

/** makes `gl` current (what SDL_GL_MakeCurrent does for the original); null: none */
export function glMakeCurrent(gl: WebGL2RenderingContext | null): void {
  if (!gl) { cx = null; return; }
  let c = contexts.get(gl);
  if (!c) { c = new Context(gl); contexts.set(gl, c); }
  cx = c;
}

/** the current WebGL2 context (for the page) */
export function glCurrent(): WebGL2RenderingContext | null {
  return cx?.gl ?? null;
}

function C(): Context {
  if (!cx) throw new Error('OpenGL call without a current context (glMakeCurrent)');
  return cx;
}

function setError(e: number): void {
  const c = C();
  if (c.error === GL.NO_ERROR) c.error = e;
}

// ---- C memory: what the original's pointers point at, as bytes

/** one field of a C++ struct the renderer uploads: name, type, element count, byte offset */
type FieldType = 'f32' | 'u8' | 'i8' | 'u16' | 'i16' | 'u32' | 'i32';
interface Field { name: string; type: FieldType; count: number; offset: number }
interface Layout { size: number; fields: Field[] }

const SIZES: Record<FieldType, number> = { f32: 4, u8: 1, i8: 1, u16: 2, i16: 2, u32: 4, i32: 4 };

/** a struct as C++ lays it out (x86-64, no packing pragmas): fields in order, each aligned to its size */
function layout(fields: [string, FieldType, number?][]): Layout {
  let offset = 0, align = 1;
  const out: Field[] = [];
  for (const [name, type, count = 1] of fields) {
    const s = SIZES[type];
    offset = Math.ceil(offset / s) * s;
    out.push({ name, type, count, offset });
    offset += s * count;
    align = Math.max(align, s);
  }
  return { size: Math.ceil(offset / align) * align, fields: out };
}

/**
 * The structs the original hands to glBufferData/glBufferSubData/glMapBuffer, by the class name the translator
 * gives them (a nested class is Outer$Inner): their C++ layout, so an array of their objects becomes the bytes the
 * original uploads. test/gl.test.ts checks the sizes against the original's sizeof and the field names against the
 * translated classes where they exist.
 */
export const STRUCT_LAYOUTS: Record<string, Layout> = {
  // graphics/C4Draw.h
  C4BltVertex: layout([['tx', 'f32'], ['ty', 'f32'], ['color', 'u8', 4], ['ftx', 'f32'], ['fty', 'f32'], ['ftz', 'f32']]),
  // lib/StdMeshMath.h (sizeof 96: "should be a multiple of 32 bytes")
  StdMeshVertex: layout([['u', 'f32'], ['v', 'f32'], ['nx', 'f32'], ['ny', 'f32'], ['nz', 'f32'], ['x', 'f32'], ['y', 'f32'], ['z', 'f32'],
    ['bone_weight', 'f32', 8], ['bone_index', 'u16', 8], ['_padding', 'i8', 16]]),
  // lib/StdMesh.h
  StdMeshFace: layout([['Vertices', 'u32', 3]]),
  // graphics/C4DrawMeshGL.cpp (anonymous namespace)
  PretransformedMeshVertex: layout([['nx', 'f32'], ['ny', 'f32'], ['nz', 'f32'], ['x', 'f32'], ['y', 'f32'], ['z', 'f32']]),
  // landscape/C4Particles.h
  C4Particle$DrawingData$Vertex: layout([['x', 'f32'], ['y', 'f32'], ['u', 'f32'], ['v', 'f32'], ['r', 'f32'], ['g', 'f32'], ['b', 'f32'], ['alpha', 'f32']]),
  // landscape/fow/C4FoWDrawStrategy.h
  C4FoWDrawLightTextureStrategy$Vertex: layout([['x', 'f32'], ['y', 'f32'], ['r1', 'f32'], ['g1', 'f32'], ['b1', 'f32'], ['a1', 'f32'],
    ['r2', 'f32'], ['g2', 'f32'], ['b2', 'f32'], ['a2', 'f32'], ['r3', 'f32'], ['g3', 'f32'], ['b3', 'f32'], ['a3', 'f32']]),
  C4FoWDrawWireframeStrategy$Vertex: layout([['x', 'f32'], ['y', 'f32'], ['r', 'f32'], ['g', 'f32'], ['b', 'f32'], ['a', 'f32']]),
};

function writeField(view: DataView, at: number, type: FieldType, v: number): void {
  switch (type) {
    case 'f32': view.setFloat32(at, v, true); break;
    case 'u8': view.setUint8(at, v); break;
    case 'i8': view.setInt8(at, v); break;
    case 'u16': view.setUint16(at, v, true); break;
    case 'i16': view.setInt16(at, v, true); break;
    case 'u32': view.setUint32(at, v >>> 0, true); break;
    case 'i32': view.setInt32(at, v | 0, true); break;
  }
}

/** the bytes of struct objects starting with `first` in the translator's layout ([name, offset, kind, count]) */
function layoutBytes(first: any, layout: [string, number, FieldType, number][], size: number, byteLength: number): Uint8Array {
  const out = new Uint8Array(byteLength);
  const view = new DataView(out.buffer);
  const arr: any[] = Array.isArray(first) ? first : first.$a ?? [first];
  const start: number = Array.isArray(first) ? 0 : first.$a ? first.$i : 0;
  const n = Math.ceil(byteLength / size);
  for (let k = 0; k < n && start + k < arr.length; k++) {
    const obj = arr[start + k];
    const base = k * size;
    for (const [path, offset, type, count] of layout) {
      const [holder, name] = $fieldOf(obj, path);
      const v = holder[name];
      for (let j = 0; j < Math.max(1, count); j++) {
        const at = base + offset + j * SIZES[type];
        if (at + SIZES[type] > byteLength) break;
        writeField(view, at, type, Number(count ? v[j] : typeof v === 'boolean' ? +v : v) || 0);
      }
    }
  }
  return out;
}

/** the bytes of `count` struct objects starting with `first` (objects of an array know it: $a, $i) */
export function structBytes(first: any, byteLength: number): Uint8Array {
  const name = first?.constructor?.name;
  // (a bundler may rename a class: _C4BltVertex)
  // the translator's layout of the class (static $layout, $size), else the table above
  const own = first?.constructor;
  if (own?.$layout) return layoutBytes(first, own.$layout, own.$size, byteLength);
  const lay = STRUCT_LAYOUTS[name] ?? STRUCT_LAYOUTS[String(name).replace(/^_+/, '').replace(/\d+$/, '')];
  if (!lay) throw new Error(`gl: no C++ layout for ${name} (rt/gl.ts STRUCT_LAYOUTS)`);
  const out = new Uint8Array(byteLength);
  const view = new DataView(out.buffer);
  const arr: any[] = first.$a ?? [first];
  const start: number = first.$a ? first.$i : 0;
  const n = Math.ceil(byteLength / lay.size);
  for (let k = 0; k < n && start + k < arr.length; k++) {
    const obj = arr[start + k];
    const base = k * lay.size;
    for (const f of lay.fields) {
      const v = obj[f.name];
      for (let j = 0; j < f.count; j++) {
        const at = base + f.offset + j * SIZES[f.type];
        if (at + SIZES[f.type] > byteLength) break;
        writeField(view, at, f.type, Number(f.count === 1 && !ArrayBuffer.isView(v) && !Array.isArray(v) ? v : v[j]) || 0);
      }
    }
  }
  return out;
}

/** what a `const void *` argument points at, as `byteLength` bytes (null for a null pointer) */
export function bytesOf(data: unknown, byteLength: number): Uint8Array | null {
  if (data === null || data === undefined || data === 0) return null;
  // (const void *) vertices of structs, as the translator gives them (rt/ptr.ts $bytesView, with the C++ layout)
  if (data instanceof Ptr && (data as unknown as { $obj?: unknown }).$obj !== undefined && data.o === 0) {
    const d = data as unknown as { $obj: any; $layout: [string, number, FieldType, number][]; $size: number };
    if (d.$layout) return layoutBytes(d.$obj, d.$layout, d.$size, byteLength);
    return bytesOf(d.$obj, byteLength);
  }
  if (data instanceof Ptr) {
    const a = data.a;
    if (ArrayBuffer.isView(a)) {
      const es = (a as unknown as { BYTES_PER_ELEMENT: number }).BYTES_PER_ELEMENT;
      const start = a.byteOffset + (data.o as number) * es;
      const avail = a.byteOffset + a.byteLength - start;
      if (avail >= byteLength) return new Uint8Array(a.buffer, start, byteLength);
      const out = new Uint8Array(byteLength);
      out.set(new Uint8Array(a.buffer, start, Math.max(0, avail)));
      return out;
    }
    if (Array.isArray(a)) {
      const first = a[data.o as number];
      if (first && typeof first === 'object') return structBytes(first.$a ? first : Object.assign(first, { $a: a, $i: data.o }), byteLength);
      throw new Error('gl: a pointer into an array of numbers has no C type (use a typed array)');
    }
    if (a && typeof a === 'object' && typeof data.o === 'string') return bytesOf(a[data.o], byteLength);
  }
  if (ArrayBuffer.isView(data)) return bytesOf(new Ptr(data, 0), byteLength);
  if (typeof data === 'object') return structBytes(data, byteLength);
  throw new Error(`gl: cannot read memory from ${String(data)}`);
}

/** numbers a `const T *` points at: `count` of them */
function numbersOf<T extends Float32Array | Int32Array | Uint32Array>(Type: { new (n: number): T; new (b: ArrayBufferLike, o: number, n: number): T; BYTES_PER_ELEMENT: number }, data: unknown, count: number): T {
  const row = data as Ptr & { $owner?: any; $field?: string; $row?: number };
  if (row instanceof Ptr && row.$owner && (row.o as number) + count > (row.a as T).length) {
    // &bones[0].m[0][0] (rt/ptr.ts $rowp): the rows of the field, then those of the next objects of the owner's array;
    // C++ lays them out one after the other when the struct holds only that array (BoneTransform)
    const out = new Type(count);
    const owner = row.$owner, field = row.$field!;
    const only = Object.keys(owner).filter((k) => !k.startsWith('$')).length === 1;
    const objects: any[] = only && Array.isArray(owner.$a) ? owner.$a.slice(owner.$i) : [owner];
    let k = 0;
    for (let n = 0, r = row.$row!, o = row.o as number; n < objects.length && k < count; n++, r = 0) {
      const rows = objects[n][field];
      for (; r < rows.length && k < count; r++, o = 0) for (let j = o; j < rows[r].length && k < count; j++) (out as any)[k++] = rows[r][j];
    }
    return out;
  }
  if (data instanceof Ptr && ArrayBuffer.isView(data.a) && data.a instanceof (Type as any)) {
    const a = data.a as T & { $a?: T[]; $i?: number };
    if ((data.o as number) + count <= a.length || !a.$a) return a.subarray(data.o as number, (data.o as number) + count) as T;
    // a row of a two-dimensional array (StdProjectionMatrix::data(): &a[0][0] of float a[4][4]): C++ lays the rows
    // out one after the other, the runtime keeps each row as a typed array that knows its array ($a, $i)
    const out = new Type(count);
    let k = 0;
    for (let r = a.$i!, o = data.o as number; k < count && r < a.$a.length; r++, o = 0) {
      const row = a.$a[r];
      for (let j = o; j < row.length && k < count; j++) (out as any)[k++] = row[j];
    }
    return out;
  }
  if (data instanceof Ptr && Array.isArray(data.a)) {
    const out = new Type(count);
    for (let i = 0; i < count; i++) (out as any)[i] = Number(data.a[(data.o as number) + i]) || 0;
    return out;
  }
  const bytes = bytesOf(data, count * Type.BYTES_PER_ELEMENT);
  if (!bytes) return new Type(count);
  const copy = new Uint8Array(bytes);
  return new Type(copy.buffer, 0, count);
}

/** *(p + i) = v for an output pointer (a typed array, an array, or a field: P(obj, 'name')) */
function store(p: Ptr, i: number, v: number): void {
  if (typeof p.o === 'string') {
    if (i === 0) p.a[p.o] = v;
    else throw new Error('gl: writing past a field');
  } else p.a[p.o + i] = v;
}

function load(p: Ptr, i: number): number {
  return Number(typeof p.o === 'string' ? (i === 0 ? p.a[p.o] : NaN) : p.a[p.o + i]);
}

/** a C string argument */
function cstr(p: unknown): string {
  if (!(p instanceof Ptr)) return String(p ?? '');
  const a = p.a as Int8Array | Uint8Array;
  let e = p.o as number;
  while (e < a.length && a[e]) e++;
  return new TextDecoder().decode(new Uint8Array(a.buffer, a.byteOffset + (p.o as number), e - (p.o as number)));
}

/** writes a string with its NUL into a char buffer of `size` bytes; returns the length written (without NUL) */
function putString(buf: Ptr, size: number, text: string, length: Ptr | null): void {
  const bytes = new TextEncoder().encode(text);
  const n = Math.max(0, Math.min(bytes.length, size - 1));
  for (let i = 0; i < n; i++) store(buf, i, (bytes[i] << 24) >> 24);
  if (size > 0) store(buf, n, 0);
  if (length) store(length, 0, n);
}

// ---- pixel formats

/** row stride of `width` pixels of `bpp` bytes with an alignment of 1, 2, 4 or 8 */
const stride = (width: number, bpp: number, align: number) => Math.ceil((width * bpp) / align) * align;

/** the original's pixel data as tightly packed RGBA bytes for WebGL (BGRA is swapped) */
function toRGBA(format: number, type: number, width: number, height: number, depth: number, data: unknown, align: number): Uint8Array | null {
  const bgra = format === GL.BGRA;
  if (format !== GL.BGRA && format !== GL.RGBA) throw new Error(`gl: pixel format 0x${format.toString(16)} not supported`);
  if (type !== GL.UNSIGNED_BYTE && type !== GL.UNSIGNED_INT_8_8_8_8_REV) throw new Error(`gl: pixel type 0x${type.toString(16)} not supported`);
  const rowIn = stride(width, 4, align);
  const src = bytesOf(data, rowIn * height * depth - (rowIn - width * 4));
  if (!src) return null;
  const out = new Uint8Array(width * height * depth * 4);
  for (let row = 0; row < height * depth; row++) {
    const s = row * rowIn, d = row * width * 4;
    for (let x = 0; x < width * 4; x += 4) {
      // GL_UNSIGNED_INT_8_8_8_8_REV with BGRA: the bytes of a little-endian 0xAARRGGBB are B, G, R, A
      out[d + x] = src[s + x + (bgra ? 2 : 0)];
      out[d + x + 1] = src[s + x + 1];
      out[d + x + 2] = src[s + x + (bgra ? 0 : 2)];
      out[d + x + 3] = src[s + x + 3];
    }
  }
  return out;
}

/** RGBA rows read from WebGL into the original's format at `dest` */
function fromRGBA(rgba: Uint8Array, width: number, height: number, format: number, dest: Ptr, align: number): void {
  const bpp = format === GL.BGR || format === GL.RGB ? 3 : 4;
  const swap = format === GL.BGR || format === GL.BGRA;
  const row = stride(width, bpp, align);
  const out = new Uint8Array(row * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const s = (y * width + x) * 4, d = y * row + x * bpp;
      out[d] = rgba[s + (swap ? 2 : 0)];
      out[d + 1] = rgba[s + 1];
      out[d + 2] = rgba[s + (swap ? 0 : 2)];
      if (bpp === 4) out[d + 3] = rgba[s + 3];
    }
  }
  copyOut(dest, out);
}

/** copies bytes to where a `void *` output pointer points (a typed array of any element size) */
function copyOut(dest: Ptr, bytes: Uint8Array): void {
  const a = dest.a;
  if (!ArrayBuffer.isView(a)) throw new Error('gl: pixel output into something that is not a typed array');
  const es = (a as unknown as { BYTES_PER_ELEMENT: number }).BYTES_PER_ELEMENT;
  const start = a.byteOffset + (dest.o as number) * es;
  new Uint8Array(a.buffer, start, Math.min(bytes.length, a.byteOffset + a.byteLength - start)).set(bytes.subarray(0, Math.min(bytes.length, a.byteOffset + a.byteLength - start)));
}

/** WebGL's target for a GL texture target (1D textures are 2D ones of height 1) */
const texTarget = (target: number) => (target === GL.TEXTURE_1D ? GL.TEXTURE_2D : target);

// ---- the functions (gl.txt), in the order of the OpenGL 3.2 core specification's chapters

// 2 state and errors
export function gl$glGetError(): number {
  const c = C();
  const e = c.error !== GL.NO_ERROR ? c.error : c.gl.getError();
  c.error = GL.NO_ERROR;
  return e;
}

const CAPS_WITHOUT_WEBGL = new Set<number>([GL.PRIMITIVE_RESTART, GL.DEBUG_OUTPUT, GL.DEBUG_OUTPUT_SYNCHRONOUS, GL.MULTISAMPLE]);
export function gl$glEnable(cap: number): void {
  if (!CAPS_WITHOUT_WEBGL.has(cap)) C().gl.enable(cap);
}
export function gl$glDisable(cap: number): void {
  if (cap === GL.PRIMITIVE_RESTART) return; // WebGL2 always restarts; the original only draws restart indices with it on
  if (!CAPS_WITHOUT_WEBGL.has(cap)) C().gl.disable(cap);
}

export function gl$glGetIntegerv(pname: number, data: Ptr): void {
  // without a current context a GL call does nothing (C4WindowSDL.cpp's EnumerateMultiSamplesSDL asks for
  // GL_MAX_SAMPLES before it creates one; "we seem to get 0 sometimes")
  if (!cx) return;
  const c = C();
  const gl = c.gl;
  let v: unknown;
  switch (pname) {
    case GL.NUM_EXTENSIONS: v = gl.getSupportedExtensions()?.length ?? 0; break;
    case GL.FRAMEBUFFER_BINDING: v = c.bound.get(GL.DRAW_FRAMEBUFFER) ?? 0; break;
    default: v = gl.getParameter(pname);
  }
  if (typeof v === 'number' || typeof v === 'boolean') store(data, 0, Number(v));
  else if (v && typeof (v as ArrayLike<number>).length === 'number') {
    const arr = v as ArrayLike<number>;
    for (let i = 0; i < arr.length; i++) store(data, i, arr[i]);
  } else store(data, 0, 0);
}

let stringCache = new Map<string, Ptr>();
/** glGetString: the original logs these and parses the version (C4DrawGL.cpp) */
export function gl$glGetString(name: number): Ptr | null {
  const gl = C().gl;
  let text: string;
  switch (name) {
    case GL.VENDOR: text = String(gl.getParameter(gl.VENDOR)); break;
    case GL.RENDERER: text = String(gl.getParameter(gl.RENDERER)); break;
    // the core version this module provides, then WebGL's own
    case GL.VERSION: text = `3.2 (${String(gl.getParameter(gl.VERSION))})`; break;
    case GL.SHADING_LANGUAGE_VERSION: text = `1.50 (${String(gl.getParameter(gl.SHADING_LANGUAGE_VERSION))})`; break;
    case GL.EXTENSIONS: text = (gl.getSupportedExtensions() ?? []).join(' '); break;
    default: setError(GL.INVALID_ENUM); return null;
  }
  let p = stringCache.get(text);
  if (!p) { p = S(text); stringCache.set(text, p); }
  return p;
}
export function gl$glGetStringi(name: number, index: number): Ptr | null {
  if (name !== GL.EXTENSIONS) { setError(GL.INVALID_ENUM); return null; }
  const ext = C().gl.getSupportedExtensions() ?? [];
  if (index < 0 || index >= ext.length) { setError(GL.INVALID_VALUE); return null; }
  return S(ext[index]);
}

/** libepoxy's queries (C4DrawGL.cpp): no desktop extensions; the version this module provides */
export function gl$epoxy_has_gl_extension(_name: Ptr): boolean { return false; }
export function gl$epoxy_gl_version(): number { return 32; }
export function gl$epoxy_is_desktop_gl(): boolean { return true; }

export function gl$glFlush(): void { C().gl.flush(); }

/** KHR_debug: not in WebGL; the original uses them only with Config.Graphics.DebugOpenGL */
export function gl$glDebugMessageCallback(_callback: unknown, _user: unknown): void {}
export function gl$glObjectLabel(identifier: number, name: number, _length: number, label: Ptr): void {
  C().labels.set(`${identifier}:${name}`, cstr(label));
}

// 2.8 vertex arrays
export function gl$glGenVertexArrays(n: number, arrays: Ptr): void {
  const c = C();
  for (let i = 0; i < n; i++) {
    const id = c.vaos.next++;
    c.vaos.objects.set(id, { vao: c.gl.createVertexArray(), attribs: new Map() });
    store(arrays, i, id);
  }
}
export function gl$glDeleteVertexArrays(n: number, arrays: Ptr): void {
  const c = C();
  for (let i = 0; i < n; i++) {
    const id = load(arrays, i);
    const v = c.vaos.objects.get(id);
    if (!v) continue;
    if (c.boundVao === v) gl$glBindVertexArray(0);
    c.gl.deleteVertexArray(v.vao);
    c.vaos.objects.delete(id);
  }
}
export function gl$glBindVertexArray(array: number): void {
  const c = C();
  const v = array ? c.vaos.objects.get(array) : c.defaultVao;
  if (!v) { setError(GL.INVALID_OPERATION); return; }
  c.gl.bindVertexArray(v.vao);
  c.boundVao = v;
}
export function gl$glEnableVertexAttribArray(index: number): void { C().gl.enableVertexAttribArray(index); }
export function gl$glVertexAttribPointer(index: number, size: number, type: number, normalized: boolean | number, stride: number, pointer: unknown): void {
  const c = C();
  const offset = pointerOffset(pointer);
  c.gl.vertexAttribPointer(index, size, type, !!normalized, stride, offset);
  c.boundVao.attribs.set(index, { size, type, normalized: !!normalized, stride, offset, buffer: c.buffers.objects.get(c.bound.get(GL.ARRAY_BUFFER) ?? 0)?.buffer ?? null, integer: false });
}

/** an offset into the bound buffer, given as a pointer (reinterpret_cast<const void *>(offset)) */
function pointerOffset(p: unknown): number {
  if (p === null || p === undefined) return 0;
  if (typeof p === 'number') return p;
  if (typeof p === 'bigint') return Number(p);
  if (p instanceof Ptr && (p.a === null || p.a === undefined) && typeof p.o === 'number') return p.o;
  // reinterpret_cast<GLvoid *>(offsetof(...)) (C4ParticleChunk::Draw): an integer made a pointer to a type the
  // translator does not know as void (rt/std $iptr)
  if (typeof p === 'object' && typeof (p as { $iptr?: unknown }).$iptr === 'number') return (p as { $iptr: number }).$iptr;
  throw new Error('gl: a client-side vertex or index pointer (the original only uses buffer offsets)');
}

// 2.9 buffer objects
export function gl$glGenBuffers(n: number, buffers: Ptr): void {
  const c = C();
  for (let i = 0; i < n; i++) {
    const id = c.buffers.next++;
    c.buffers.objects.set(id, { buffer: c.gl.createBuffer()!, size: 0, shadow: null, target: 0 });
    store(buffers, i, id);
  }
}
export function gl$glDeleteBuffers(n: number, buffers: Ptr): void {
  const c = C();
  for (let i = 0; i < n; i++) {
    const id = load(buffers, i);
    const b = c.buffers.objects.get(id);
    if (!b) continue;
    c.gl.deleteBuffer(b.buffer);
    c.buffers.objects.delete(id);
    for (const [t, v] of c.bound) if (v === id && (t === GL.ARRAY_BUFFER || t === GL.ELEMENT_ARRAY_BUFFER)) c.bound.delete(t);
  }
}
export function gl$glBindBuffer(target: number, buffer: number): void {
  const c = C();
  const b = buffer ? c.buffers.objects.get(buffer) : null;
  if (buffer && !b) { setError(GL.INVALID_OPERATION); return; }
  c.gl.bindBuffer(target, b?.buffer ?? null);
  if (b) b.target = target;
  c.bound.set(target, buffer);
}
function boundBuffer(target: number): BufferState | null {
  const c = C();
  return c.buffers.objects.get(c.bound.get(target) ?? 0) ?? null;
}
/**
 * a buffer's data given as a pointer into a std::vector of numbers (the runtime's plain arrays, which do not know their
 * C type): what the original uploads that way is index data, GLuint (C4FoWDrawStrategy's triangulator, C4Particles'
 * ibo_data), into GL_ELEMENT_ARRAY_BUFFER, and floats into GL_ARRAY_BUFFER
 */
function bufferBytes(target: number, data: unknown, n: number): Uint8Array | null {
  if (data instanceof Ptr && Array.isArray(data.a) && typeof data.a[data.o as number] === 'number') {
    const count = Math.floor(n / 4);
    const src = (data.a as number[]).slice(data.o as number, (data.o as number) + count);
    const typed = target === GL.ELEMENT_ARRAY_BUFFER ? Uint32Array.from(src) : Float32Array.from(src);
    const out = new Uint8Array(n);
    out.set(new Uint8Array(typed.buffer, 0, Math.min(n, typed.byteLength)));
    return out;
  }
  return bytesOf(data, n);
}
export function gl$glBufferData(target: number, size: number | bigint, data: unknown, usage: number): void {
  const n = Number(size);
  const bytes = bufferBytes(target, data, n);
  const gl = C().gl;
  if (bytes) gl.bufferData(target, bytes, usage);
  else gl.bufferData(target, n, usage);
  const b = boundBuffer(target);
  if (b) { b.size = n; b.shadow = null; }
}
export function gl$glBufferSubData(target: number, offset: number | bigint, size: number | bigint, data: unknown): void {
  const bytes = bufferBytes(target, data, Number(size));
  if (bytes) C().gl.bufferSubData(target, Number(offset), bytes);
}
/** glMapBuffer: a copy of the buffer to write into; glUnmapBuffer uploads it (WebGL2 cannot map buffers) */
export function gl$glMapBuffer(target: number, _access: number): Ptr | null {
  const b = boundBuffer(target);
  if (!b) { setError(GL.INVALID_OPERATION); return null; }
  b.shadow = new Uint8Array(b.size);
  return new Ptr(b.shadow, 0);
}
export function gl$glUnmapBuffer(target: number): boolean {
  const b = boundBuffer(target);
  if (!b || !b.shadow) { setError(GL.INVALID_OPERATION); return false; }
  C().gl.bufferSubData(target, 0, b.shadow);
  b.shadow = null;
  return true;
}

// 2.11 shaders and programs
export function gl$glCreateShader(type: number): number {
  const c = C();
  const id = c.shaderObjects.next++;
  c.shaderObjects.objects.set(id, { shader: c.gl.createShader(type)!, type, source: '', log: '', compiled: false });
  return id;
}
function shaderOf(id: number): ShaderState | null {
  const s = C().shaderObjects.objects.get(id);
  return s && 'shader' in s ? s : null;
}
function programOf(id: number): ProgramState | null {
  const p = C().shaderObjects.objects.get(id);
  return p && 'program' in p ? p : null;
}
/** glShaderSource: the strings joined, then rewritten for GLSL ES 3.00 (rt/glsl.ts) */
export function gl$glShaderSource(shader: number, count: number, strings: Ptr, lengths: Ptr | null): void {
  const s = shaderOf(shader);
  if (!s) { setError(GL.INVALID_VALUE); return; }
  let text = '';
  for (let i = 0; i < count; i++) {
    const str = strings.a[(strings.o as number) + i] as Ptr;
    const len = lengths ? load(lengths, i) : -1;
    const whole = cstr(str);
    text += len >= 0 ? whole.slice(0, len) : whole;
  }
  s.source = text;
  C().gl.shaderSource(s.shader, toGlslEs(text));
}
export function gl$glCompileShader(shader: number): void {
  const s = shaderOf(shader);
  if (!s) { setError(GL.INVALID_VALUE); return; }
  const gl = C().gl;
  gl.compileShader(s.shader);
  s.compiled = !!gl.getShaderParameter(s.shader, gl.COMPILE_STATUS);
  s.log = gl.getShaderInfoLog(s.shader) ?? '';
  if (!s.compiled) glDiagnostics.push(`compile: ${s.log.slice(0, 300)}`);
  if (!s.compiled && (globalThis as any).ocDumpShaders) (globalThis as any).ocDumpShaders.push(s.source);
}
/** the browser's messages of shaders that did not compile or link (for tests and debugging; the original logs them too) */
export const glDiagnostics: string[] = [];
export function gl$glDeleteShader(shader: number): void {
  const c = C();
  const s = shaderOf(shader);
  if (!s) return;
  c.gl.deleteShader(s.shader);
  c.shaderObjects.objects.delete(shader);
}
export function gl$glCreateProgram(): number {
  const c = C();
  const id = c.shaderObjects.next++;
  c.shaderObjects.objects.set(id, { program: c.gl.createProgram()!, locations: [], byName: new Map(), log: '' });
  return id;
}
export function gl$glAttachShader(program: number, shader: number): void {
  const p = programOf(program), s = shaderOf(shader);
  if (!p || !s) { setError(GL.INVALID_VALUE); return; }
  C().gl.attachShader(p.program, s.shader);
}
export function gl$glLinkProgram(program: number): void {
  const p = programOf(program);
  if (!p) { setError(GL.INVALID_VALUE); return; }
  const gl = C().gl;
  gl.linkProgram(p.program);
  p.log = gl.getProgramInfoLog(p.program) ?? '';
  if (!gl.getProgramParameter(p.program, gl.LINK_STATUS)) glDiagnostics.push(`link: ${p.log.slice(0, 300)}`);
  p.locations = [];
  p.byName.clear();
}
export function gl$glDeleteProgram(program: number): void {
  const c = C();
  const p = programOf(program);
  if (!p) return;
  if (c.program === p) c.program = null;
  c.gl.deleteProgram(p.program);
  c.shaderObjects.objects.delete(program);
}
export function gl$glUseProgram(program: number): void {
  const c = C();
  const p = program ? programOf(program) : null;
  if (program && !p) { setError(GL.INVALID_OPERATION); return; }
  c.gl.useProgram(p?.program ?? null);
  c.program = p;
}
export function gl$glGetShaderiv(shader: number, pname: number, params: Ptr): void {
  const s = shaderOf(shader);
  if (!s) { setError(GL.INVALID_VALUE); return; }
  switch (pname) {
    case GL.COMPILE_STATUS: store(params, 0, s.compiled ? GL.TRUE : GL.FALSE); break;
    case GL.INFO_LOG_LENGTH: store(params, 0, s.log.length ? new TextEncoder().encode(s.log).length + 1 : 0); break;
    case GL.SHADER_SOURCE_LENGTH: store(params, 0, s.source.length ? new TextEncoder().encode(s.source).length + 1 : 0); break;
    default: store(params, 0, Number(C().gl.getShaderParameter(s.shader, pname)));
  }
}
export function gl$glGetProgramiv(program: number, pname: number, params: Ptr): void {
  const p = programOf(program);
  if (!p) { setError(GL.INVALID_VALUE); return; }
  const gl = C().gl;
  switch (pname) {
    case GL.LINK_STATUS: store(params, 0, gl.getProgramParameter(p.program, gl.LINK_STATUS) ? GL.TRUE : GL.FALSE); break;
    case GL.INFO_LOG_LENGTH: store(params, 0, p.log.length ? new TextEncoder().encode(p.log).length + 1 : 0); break;
    default: store(params, 0, Number(gl.getProgramParameter(p.program, pname)));
  }
}
export function gl$glGetShaderInfoLog(shader: number, bufSize: number, length: Ptr | null, infoLog: Ptr): void {
  const s = shaderOf(shader);
  if (!s) { setError(GL.INVALID_VALUE); return; }
  putString(infoLog, bufSize, s.log, length);
}
export function gl$glGetProgramInfoLog(program: number, bufSize: number, length: Ptr | null, infoLog: Ptr): void {
  const p = programOf(program);
  if (!p) { setError(GL.INVALID_VALUE); return; }
  putString(infoLog, bufSize, p.log, length);
}
export function gl$glGetAttribLocation(program: number, name: Ptr): number {
  const p = programOf(program);
  if (!p) { setError(GL.INVALID_VALUE); return -1; }
  return C().gl.getAttribLocation(p.program, cstr(name));
}
/** GL's integer uniform locations: an index into the program's table of WebGL locations; -1 when there is none */
export function gl$glGetUniformLocation(program: number, name: Ptr): number {
  const p = programOf(program);
  if (!p) { setError(GL.INVALID_VALUE); return -1; }
  const n = cstr(name);
  const known = p.byName.get(n);
  if (known !== undefined) return known;
  const loc = C().gl.getUniformLocation(p.program, n);
  const id = loc ? p.locations.push(loc) - 1 : -1;
  p.byName.set(n, id);
  return id;
}
function loc(location: number): WebGLUniformLocation | null {
  const p = C().program;
  if (!p) { setError(GL.INVALID_OPERATION); return null; }
  if (location === -1) return null;
  const l = p.locations[location];
  if (!l) { setError(GL.INVALID_OPERATION); return null; }
  return l;
}
export function gl$glUniform1i(l: number, x: number): void { const u = loc(l); if (u) C().gl.uniform1i(u, x); }
export function gl$glUniform2i(l: number, x: number, y: number): void { const u = loc(l); if (u) C().gl.uniform2i(u, x, y); }
export function gl$glUniform3i(l: number, x: number, y: number, z: number): void { const u = loc(l); if (u) C().gl.uniform3i(u, x, y, z); }
export function gl$glUniform4i(l: number, x: number, y: number, z: number, w: number): void { const u = loc(l); if (u) C().gl.uniform4i(u, x, y, z, w); }
export function gl$glUniform1ui(l: number, x: number): void { const u = loc(l); if (u) C().gl.uniform1ui(u, x >>> 0); }
export function gl$glUniform2ui(l: number, x: number, y: number): void { const u = loc(l); if (u) C().gl.uniform2ui(u, x >>> 0, y >>> 0); }
export function gl$glUniform3ui(l: number, x: number, y: number, z: number): void { const u = loc(l); if (u) C().gl.uniform3ui(u, x >>> 0, y >>> 0, z >>> 0); }
export function gl$glUniform4ui(l: number, x: number, y: number, z: number, w: number): void { const u = loc(l); if (u) C().gl.uniform4ui(u, x >>> 0, y >>> 0, z >>> 0, w >>> 0); }
export function gl$glUniform1f(l: number, x: number): void { const u = loc(l); if (u) C().gl.uniform1f(u, x); }
export function gl$glUniform2f(l: number, x: number, y: number): void { const u = loc(l); if (u) C().gl.uniform2f(u, x, y); }
export function gl$glUniform3f(l: number, x: number, y: number, z: number): void { const u = loc(l); if (u) C().gl.uniform3f(u, x, y, z); }
export function gl$glUniform4f(l: number, x: number, y: number, z: number, w: number): void { const u = loc(l); if (u) C().gl.uniform4f(u, x, y, z, w); }
export function gl$glUniform1iv(l: number, n: number, v: unknown): void { const u = loc(l); if (u) C().gl.uniform1iv(u, numbersOf(Int32Array, v, n)); }
export function gl$glUniform2iv(l: number, n: number, v: unknown): void { const u = loc(l); if (u) C().gl.uniform2iv(u, numbersOf(Int32Array, v, 2 * n)); }
export function gl$glUniform3iv(l: number, n: number, v: unknown): void { const u = loc(l); if (u) C().gl.uniform3iv(u, numbersOf(Int32Array, v, 3 * n)); }
export function gl$glUniform4iv(l: number, n: number, v: unknown): void { const u = loc(l); if (u) C().gl.uniform4iv(u, numbersOf(Int32Array, v, 4 * n)); }
export function gl$glUniform1uiv(l: number, n: number, v: unknown): void { const u = loc(l); if (u) C().gl.uniform1uiv(u, numbersOf(Uint32Array, v, n)); }
export function gl$glUniform2uiv(l: number, n: number, v: unknown): void { const u = loc(l); if (u) C().gl.uniform2uiv(u, numbersOf(Uint32Array, v, 2 * n)); }
export function gl$glUniform3uiv(l: number, n: number, v: unknown): void { const u = loc(l); if (u) C().gl.uniform3uiv(u, numbersOf(Uint32Array, v, 3 * n)); }
export function gl$glUniform4uiv(l: number, n: number, v: unknown): void { const u = loc(l); if (u) C().gl.uniform4uiv(u, numbersOf(Uint32Array, v, 4 * n)); }
export function gl$glUniform1fv(l: number, n: number, v: unknown): void { const u = loc(l); if (u) C().gl.uniform1fv(u, numbersOf(Float32Array, v, n)); }
export function gl$glUniform2fv(l: number, n: number, v: unknown): void { const u = loc(l); if (u) C().gl.uniform2fv(u, numbersOf(Float32Array, v, 2 * n)); }
export function gl$glUniform3fv(l: number, n: number, v: unknown): void { const u = loc(l); if (u) C().gl.uniform3fv(u, numbersOf(Float32Array, v, 3 * n)); }
export function gl$glUniform4fv(l: number, n: number, v: unknown): void { const u = loc(l); if (u) C().gl.uniform4fv(u, numbersOf(Float32Array, v, 4 * n)); }
// matrices: WebGL2 takes `transpose` (the original passes GL_TRUE for its row-major matrices)
export function gl$glUniformMatrix3fv(l: number, n: number, t: boolean | number, v: unknown): void { const u = loc(l); if (u) C().gl.uniformMatrix3fv(u, !!t, numbersOf(Float32Array, v, 9 * n)); }
export function gl$glUniformMatrix4fv(l: number, n: number, t: boolean | number, v: unknown): void { const u = loc(l); if (u) C().gl.uniformMatrix4fv(u, !!t, numbersOf(Float32Array, v, 16 * n)); }
export function gl$glUniformMatrix3x2fv(l: number, n: number, t: boolean | number, v: unknown): void { const u = loc(l); if (u) C().gl.uniformMatrix3x2fv(u, !!t, numbersOf(Float32Array, v, 6 * n)); }
export function gl$glUniformMatrix3x4fv(l: number, n: number, t: boolean | number, v: unknown): void { const u = loc(l); if (u) C().gl.uniformMatrix3x4fv(u, !!t, numbersOf(Float32Array, v, 12 * n)); }
export function gl$glUniformMatrix4x3fv(l: number, n: number, t: boolean | number, v: unknown): void { const u = loc(l); if (u) C().gl.uniformMatrix4x3fv(u, !!t, numbersOf(Float32Array, v, 12 * n)); }

// 2.16, 3 rasterisation and drawing
export function gl$glViewport(x: number, y: number, w: number, h: number): void { C().gl.viewport(x, y, w, h); }
export function gl$glScissor(x: number, y: number, w: number, h: number): void { C().gl.scissor(x, y, w, h); }
export function gl$glFrontFace(mode: number): void { C().gl.frontFace(mode); }
export function gl$glCullFace(mode: number): void { C().gl.cullFace(mode); }
/** wireframe views of the original's debugging modes: WebGL has no polygon modes */
export function gl$glPolygonMode(face: number, mode: number): void {
  if (face === GL.FRONT_AND_BACK) C().polygonMode = mode;
}
export function gl$glPrimitiveRestartIndex(index: number): void {
  if (index >>> 0 !== 0xffffffff) throw new Error('gl: WebGL2 restarts primitives only at the largest index');
}
export function gl$glDrawArrays(mode: number, first: number, count: number): void { C().gl.drawArrays(mode, first, count); }
export function gl$glDrawElements(mode: number, count: number, type: number, indices: unknown): void {
  C().gl.drawElements(mode, count, type, pointerOffset(indices));
}
const TYPE_SIZE: Record<number, number> = { [GL.FLOAT]: 4, [GL.UNSIGNED_INT]: 4, [GL.UNSIGNED_SHORT]: 2, [GL.SHORT]: 2, [GL.UNSIGNED_BYTE]: 1, [GL.BYTE]: 1 };
/** WebGL2 has no base vertex: the bound vertex array's attributes start basevertex vertices later for the draw */
export function gl$glDrawElementsBaseVertex(mode: number, count: number, type: number, indices: unknown, basevertex: number): void {
  const c = C();
  const gl = c.gl;
  if (!basevertex) { gl.drawElements(mode, count, type, pointerOffset(indices)); return; }
  const shifted = [...c.boundVao.attribs.entries()];
  const arrayBuffer = c.bound.get(GL.ARRAY_BUFFER) ?? 0;
  const point = (shift: number) => {
    for (const [index, a] of shifted) {
      const stride = a.stride || a.size * (TYPE_SIZE[a.type] ?? 4);
      gl.bindBuffer(gl.ARRAY_BUFFER, a.buffer);
      gl.vertexAttribPointer(index, a.size, a.type, a.normalized, a.stride, a.offset + shift * stride);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, c.buffers.objects.get(arrayBuffer)?.buffer ?? null);
  };
  point(basevertex);
  gl.drawElements(mode, count, type, pointerOffset(indices));
  point(0);
}
export function gl$glClearColor(r: number, g: number, b: number, a: number): void { C().gl.clearColor(r, g, b, a); }
export function gl$glClear(mask: number): void { C().gl.clear(mask); }

// 3.8 textures
export function gl$glGenTextures(n: number, textures: Ptr): void {
  const c = C();
  for (let i = 0; i < n; i++) {
    const id = c.textures.next++;
    c.textures.objects.set(id, { texture: c.gl.createTexture()!, is1D: false, width: 0, height: 0 });
    store(textures, i, id);
  }
}
export function gl$glDeleteTextures(n: number, textures: Ptr): void {
  const c = C();
  for (let i = 0; i < n; i++) {
    const id = load(textures, i);
    const t = c.textures.objects.get(id);
    if (!t) continue;
    c.gl.deleteTexture(t.texture);
    c.textures.objects.delete(id);
    for (const unit of c.units) for (const [k, v] of unit) if (v === id) unit.delete(k);
  }
}
export function gl$glActiveTexture(texture: number): void {
  const c = C();
  c.activeUnit = texture - GL.TEXTURE0;
  c.gl.activeTexture(texture);
}
export function gl$glBindTexture(target: number, texture: number): void {
  const c = C();
  const t = texture ? c.textures.objects.get(texture) : null;
  if (texture && !t) { setError(GL.INVALID_OPERATION); return; }
  if (t && target === GL.TEXTURE_1D) t.is1D = true;
  c.gl.bindTexture(texTarget(target), t?.texture ?? null);
  (c.units[c.activeUnit] ??= new Map()).set(target, texture);
}
function boundTexture(target: number): TextureState | null {
  const c = C();
  return c.textures.objects.get(c.units[c.activeUnit]?.get(target) ?? 0) ?? null;
}
export function gl$glTexParameteri(target: number, pname: number, param: number): void {
  if (param === GL.CLAMP) { setError(GL.INVALID_ENUM); return; } // not in the 3.2 core profile: no effect there either
  C().gl.texParameteri(texTarget(target), pname, param);
}
export function gl$glTexParameterfv(target: number, pname: number, params: unknown): void {
  if (pname === GL.TEXTURE_BORDER_COLOR) return; // WebGL2 has no border colour; only GL_CLAMP_TO_BORDER would use it
  C().gl.texParameterf(texTarget(target), pname, numbersOf(Float32Array, params, 1)[0]);
}
export function gl$glPixelStorei(pname: number, param: number): void {
  const c = C();
  if (pname === GL.UNPACK_ALIGNMENT) c.unpackAlignment = param;
  else if (pname === GL.PACK_ALIGNMENT) c.packAlignment = param;
  else c.gl.pixelStorei(pname, param);
}
/** the internal formats of WebGL2 for the original's; the data is converted to RGBA bytes */
function internalFormat(internal: number, format: number): number {
  if (format === GL.RED) return GL.R8;
  if (internal === GL.RGBA || internal === GL.RGBA8 || internal === GL.BGRA) return GL.RGBA8;
  throw new Error(`gl: internal format 0x${internal.toString(16)} not supported`);
}
/** unsized GL_RED with float data, as a desktop driver stores it: R8, normalised and clamped */
function redBytes(type: number, width: number, height: number, data: unknown): Uint8Array | null {
  if (type === GL.UNSIGNED_BYTE) return bytesOf(data, width * height);
  if (type !== GL.FLOAT) throw new Error(`gl: GL_RED of type 0x${type.toString(16)} not supported`);
  const bytes = bytesOf(data, width * height * 4);
  if (!bytes) return null;
  const f = new Float32Array(new Uint8Array(bytes).buffer);
  const out = new Uint8Array(width * height);
  for (let i = 0; i < out.length; i++) out[i] = Math.round(Math.min(1, Math.max(0, f[i])) * 255);
  return out;
}
export function gl$glTexImage2D(target: number, level: number, internal: number, width: number, height: number, border: number, format: number, type: number, data: unknown): void {
  const c = C();
  if (border !== 0) { setError(GL.INVALID_VALUE); return; }
  const fmt = internalFormat(internal, format);
  const t = boundTexture(target);
  if (t) { t.width = width; t.height = height; }
  if (fmt === GL.R8) {
    c.gl.pixelStorei(c.gl.UNPACK_ALIGNMENT, 1);
    c.gl.texImage2D(texTarget(target), level, GL.R8, width, height, 0, GL.RED, GL.UNSIGNED_BYTE, redBytes(type, width, height, data));
    return;
  }
  c.gl.pixelStorei(c.gl.UNPACK_ALIGNMENT, 4);
  c.gl.texImage2D(texTarget(target), level, fmt, width, height, 0, GL.RGBA, GL.UNSIGNED_BYTE, toRGBA(format, type, width, height, 1, data, c.unpackAlignment));
}
export function gl$glTexImage1D(target: number, level: number, internal: number, width: number, border: number, format: number, type: number, data: unknown): void {
  const t = boundTexture(target);
  if (t) t.is1D = true;
  gl$glTexImage2D(target, level, internal, width, 1, border, format, type, data);
}
export function gl$glTexImage3D(target: number, level: number, internal: number, width: number, height: number, depth: number, border: number, format: number, type: number, data: unknown): void {
  const c = C();
  if (border !== 0) { setError(GL.INVALID_VALUE); return; }
  c.gl.pixelStorei(c.gl.UNPACK_ALIGNMENT, 4);
  c.gl.texImage3D(target, level, internalFormat(internal, format), width, height, depth, 0, GL.RGBA, GL.UNSIGNED_BYTE, toRGBA(format, type, width, height, depth, data, c.unpackAlignment));
}
export function gl$glTexSubImage2D(target: number, level: number, x: number, y: number, width: number, height: number, format: number, type: number, data: unknown): void {
  const c = C();
  if (format === GL.RED) {
    c.gl.pixelStorei(c.gl.UNPACK_ALIGNMENT, 1);
    const bytes = redBytes(type, width, height, data);
    if (bytes) c.gl.texSubImage2D(texTarget(target), level, x, y, width, height, GL.RED, GL.UNSIGNED_BYTE, bytes);
    return;
  }
  const rgba = toRGBA(format, type, width, height, 1, data, c.unpackAlignment);
  if (!rgba) return;
  c.gl.pixelStorei(c.gl.UNPACK_ALIGNMENT, 4);
  c.gl.texSubImage2D(texTarget(target), level, x, y, width, height, GL.RGBA, GL.UNSIGNED_BYTE, rgba);
}
export function gl$glGenerateMipmap(target: number): void { C().gl.generateMipmap(texTarget(target)); }
/** glGetTexImage: WebGL2 reads textures only through a framebuffer */
export function gl$glGetTexImage(target: number, level: number, format: number, _type: number, pixels: Ptr): void {
  const c = C();
  const gl = c.gl;
  const t = boundTexture(target);
  if (!t) { setError(GL.INVALID_OPERATION); return; }
  const w = Math.max(1, t.width >> level), h = Math.max(1, t.height >> level);
  c.readFbo ??= gl.createFramebuffer();
  const prev = gl.getParameter(gl.READ_FRAMEBUFFER_BINDING);
  gl.bindFramebuffer(gl.READ_FRAMEBUFFER, c.readFbo);
  gl.framebufferTexture2D(gl.READ_FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t.texture, level);
  const rgba = new Uint8Array(w * h * 4);
  gl.pixelStorei(gl.PACK_ALIGNMENT, 4);
  gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, rgba);
  gl.bindFramebuffer(gl.READ_FRAMEBUFFER, prev);
  fromRGBA(rgba, w, h, format, pixels, c.packAlignment);
}

// 4 per-fragment operations and the framebuffer
export function gl$glBlendFunc(s: number, d: number): void { C().gl.blendFunc(s, d); }
export function gl$glBlendEquation(mode: number): void { C().gl.blendEquation(mode); }
export function gl$glBlendEquationSeparate(rgb: number, alpha: number): void { C().gl.blendEquationSeparate(rgb, alpha); }
export function gl$glBlendColor(r: number, g: number, b: number, a: number): void { C().gl.blendColor(r, g, b, a); }
export function gl$glDepthMask(flag: boolean | number): void { C().gl.depthMask(!!flag); }
export function gl$glDepthFunc(func: number): void { C().gl.depthFunc(func); }
export function gl$glReadPixels(x: number, y: number, width: number, height: number, format: number, _type: number, pixels: Ptr): void {
  const c = C();
  const rgba = new Uint8Array(width * height * 4);
  c.gl.pixelStorei(c.gl.PACK_ALIGNMENT, 4);
  c.gl.readPixels(x, y, width, height, c.gl.RGBA, c.gl.UNSIGNED_BYTE, rgba);
  fromRGBA(rgba, width, height, format, pixels, c.packAlignment);
}
export function gl$glGenFramebuffers(n: number, framebuffers: Ptr): void {
  const c = C();
  for (let i = 0; i < n; i++) {
    const id = c.framebuffers.next++;
    c.framebuffers.objects.set(id, c.gl.createFramebuffer()!);
    store(framebuffers, i, id);
  }
}
export function gl$glDeleteFramebuffers(n: number, framebuffers: Ptr): void {
  const c = C();
  for (let i = 0; i < n; i++) {
    const id = load(framebuffers, i);
    const f = c.framebuffers.objects.get(id);
    if (!f) continue;
    c.gl.deleteFramebuffer(f);
    c.framebuffers.objects.delete(id);
  }
}
export function gl$glBindFramebuffer(target: number, framebuffer: number): void {
  const c = C();
  const f = framebuffer ? c.framebuffers.objects.get(framebuffer) : null;
  if (framebuffer && !f) { setError(GL.INVALID_OPERATION); return; }
  c.gl.bindFramebuffer(target, f ?? null);
  if (target === GL.FRAMEBUFFER) { c.bound.set(GL.DRAW_FRAMEBUFFER, framebuffer); c.bound.set(GL.READ_FRAMEBUFFER, framebuffer); }
  else c.bound.set(target, framebuffer);
}
export function gl$glFramebufferTexture2D(target: number, attachment: number, textarget: number, texture: number, level: number): void {
  const c = C();
  const t = texture ? c.textures.objects.get(texture) : null;
  c.gl.framebufferTexture2D(target, attachment, texTarget(textarget), t?.texture ?? null, level);
}
export function gl$glCheckFramebufferStatus(target: number): number { return C().gl.checkFramebufferStatus(target); }

// ---- SDL's GL context functions (graphics/C4DrawGLCtx.cpp, platform/C4WindowSDL.cpp): the page's canvas

/** the canvas the page gives the renderer (SDL_GL_CreateContext on the game's window) */
let canvasContext: WebGL2RenderingContext | null = null;
let windowCanvas: HTMLCanvasElement | OffscreenCanvas | null = null;
let preserve = false;
/** the page's WebGL2 context for the game's window (tests: one made beforehand) */
export function glSetWindowContext(gl: WebGL2RenderingContext | null): void { canvasContext = gl; }
/**
 * the canvas that is the game's window: SDL_GL_CreateContext makes its WebGL2 context with what the original asked
 * SDL for (SDL_GL_SetAttribute: depth and stencil bits, multisampling); `preserveDrawingBuffer` for tests that read
 * the picture after the frame
 */
export function glSetWindowCanvas(canvas: HTMLCanvasElement | OffscreenCanvas | null, preserveDrawingBuffer = false): void {
  windowCanvas = canvas;
  preserve = preserveDrawingBuffer;
  canvasContext = null;
}
/** SDL_GLattr (SDL_video.h) */
const SDL_GL_DEPTH_SIZE = 6, SDL_GL_STENCIL_SIZE = 7, SDL_GL_MULTISAMPLEBUFFERS = 13, SDL_GL_MULTISAMPLESAMPLES = 14;
const attributes = new Map<number, number>();
export function gl$SDL_GL_SetAttribute(attr: number, value: number): number { attributes.set(attr, value); return 0; }
export function gl$SDL_GL_CreateContext(_window: unknown): WebGL2RenderingContext | null {
  if (!canvasContext && windowCanvas) {
    // WebGL multisamples the canvas or not (its own sample count, 4 in Chromium); the original asks for 0..16 samples
    const antialias = (attributes.get(SDL_GL_MULTISAMPLEBUFFERS) ?? 0) > 0 && (attributes.get(SDL_GL_MULTISAMPLESAMPLES) ?? 0) > 0;
    canvasContext = windowCanvas.getContext('webgl2', {
      alpha: false, antialias, depth: (attributes.get(SDL_GL_DEPTH_SIZE) ?? 16) > 0, stencil: (attributes.get(SDL_GL_STENCIL_SIZE) ?? 0) > 0,
      preserveDrawingBuffer: preserve, premultipliedAlpha: false,
    }) as WebGL2RenderingContext | null;
  }
  return canvasContext;
}
export function gl$SDL_GL_MakeCurrent(_window: unknown, ctx: WebGL2RenderingContext | null): number {
  glMakeCurrent(ctx);
  return ctx ? 0 : -1;
}
/** the size of the window's drawing buffer (C4Window::GetSize): the canvas's */
export function gl$SDL_GL_GetDrawableSize(_window: unknown, w: Ptr | null, h: Ptr | null): void {
  const canvas = canvasContext?.canvas as HTMLCanvasElement | OffscreenCanvas | undefined;
  if (w) store(w, 0, canvas?.width ?? 0);
  if (h) store(h, 0, canvas?.height ?? 0);
}
/** the browser shows the canvas when the frame's script returns */
export function gl$SDL_GL_SwapWindow(_window: unknown): void {}
export function gl$SDL_GL_DeleteContext(ctx: WebGL2RenderingContext | null): void {
  if (ctx && cx?.gl === ctx) cx = null;
  if (ctx) contexts.delete(ctx);
}

/** every C function of this module (re/openclonk/tools/gl.txt lists the same, for the translator) */
export const GL_FUNCTIONS: readonly string[] = [
  'glGetError', 'glEnable', 'glDisable', 'glGetIntegerv', 'glGetString', 'glGetStringi', 'epoxy_has_gl_extension', 'epoxy_gl_version',
  'epoxy_is_desktop_gl', 'glFlush', 'glDebugMessageCallback', 'glObjectLabel',
  'glGenVertexArrays', 'glDeleteVertexArrays', 'glBindVertexArray', 'glEnableVertexAttribArray', 'glVertexAttribPointer',
  'glGenBuffers', 'glDeleteBuffers', 'glBindBuffer', 'glBufferData', 'glBufferSubData', 'glMapBuffer', 'glUnmapBuffer',
  'glCreateShader', 'glShaderSource', 'glCompileShader', 'glDeleteShader', 'glCreateProgram', 'glAttachShader', 'glLinkProgram',
  'glDeleteProgram', 'glUseProgram', 'glGetShaderiv', 'glGetProgramiv', 'glGetShaderInfoLog', 'glGetProgramInfoLog',
  'glGetAttribLocation', 'glGetUniformLocation',
  'glUniform1i', 'glUniform2i', 'glUniform3i', 'glUniform4i', 'glUniform1ui', 'glUniform2ui', 'glUniform3ui', 'glUniform4ui',
  'glUniform1f', 'glUniform2f', 'glUniform3f', 'glUniform4f', 'glUniform1iv', 'glUniform2iv', 'glUniform3iv', 'glUniform4iv',
  'glUniform1uiv', 'glUniform2uiv', 'glUniform3uiv', 'glUniform4uiv', 'glUniform1fv', 'glUniform2fv', 'glUniform3fv', 'glUniform4fv',
  'glUniformMatrix3fv', 'glUniformMatrix4fv', 'glUniformMatrix3x2fv', 'glUniformMatrix3x4fv', 'glUniformMatrix4x3fv',
  'glViewport', 'glScissor', 'glFrontFace', 'glCullFace', 'glPolygonMode', 'glPrimitiveRestartIndex', 'glDrawArrays', 'glDrawElements',
  'glDrawElementsBaseVertex', 'glClearColor', 'glClear',
  'glGenTextures', 'glDeleteTextures', 'glActiveTexture', 'glBindTexture', 'glTexParameteri', 'glTexParameterfv', 'glPixelStorei',
  'glTexImage1D', 'glTexImage2D', 'glTexImage3D', 'glTexSubImage2D', 'glGenerateMipmap', 'glGetTexImage',
  'glBlendFunc', 'glBlendEquation', 'glBlendEquationSeparate', 'glBlendColor', 'glDepthMask', 'glDepthFunc', 'glReadPixels',
  'glGenFramebuffers', 'glDeleteFramebuffers', 'glBindFramebuffer', 'glFramebufferTexture2D', 'glCheckFramebufferStatus',
  'SDL_GL_SetAttribute', 'SDL_GL_CreateContext', 'SDL_GL_MakeCurrent', 'SDL_GL_GetDrawableSize', 'SDL_GL_SwapWindow', 'SDL_GL_DeleteContext',
];

/** for tests: forget every context */
export function glReset(): void {
  cx = null;
  contexts.clear();
  stringCache = new Map();
}
