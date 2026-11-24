// 0 A.D.'s compiled mesh format, PMD ("Pyrogenesis MoDel"), written by CModelDef::Save and read
// by CModelDef::Load (source/graphics/ModelDef.cpp). The actor files name `.dae` meshes; the game
// VFS maps them to `<name>.dae.cached.pmd`, which this parser reads unchanged.
//
// Header: char[4]="PSMD", u32 version, u32 payloadSize (fileSize-12).
// version >= 4: u32 numVertices, u32 numUVsPerVertex; per vertex position(3f), normal(3f),
//   uv(2f * numUVs), blend (4 bone indices u8 + 4 weights f32); u32 numFaces,
//   faces (3 u16); u32 numBones, bones (translation 3f, rotation 4f xyzw);
//   version >= 2: u32 numPropPoints, each string name, translation 3f, rotation 4f, u8 bone.
// Vertices are in world space for version >= 3 (the pinned files are version 4).

export interface PmdBone {
  translation: [number, number, number];
  /** x, y, z, w */
  rotation: [number, number, number, number];
}

export interface PropPoint {
  name: string;
  translation: [number, number, number];
  rotation: [number, number, number, number];
  bone: number;
}

export interface PmdModel {
  version: number;
  numUVs: number;
  positions: Float32Array;
  normals: Float32Array;
  uvs: Float32Array;
  boneIndices: Uint8Array;
  boneWeights: Float32Array;
  faces: Uint16Array;
  bones: PmdBone[];
  propPoints: PropPoint[];
}

function cstr(view: DataView, offset: number, size: number): [string, number] {
  if (offset + 4 > size) throw new Error('PMD: truncated string length');
  const length = view.getUint32(offset, true);
  offset += 4;
  if (offset + length > size) throw new Error('PMD: truncated string');
  const bytes = new Uint8Array(view.buffer, view.byteOffset + offset, length);
  return [new TextDecoder().decode(bytes), offset + length];
}

export function parsePmd(buffer: ArrayBuffer): PmdModel {
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);
  const magic = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]);
  if (magic !== 'PSMD') throw new Error(`PMD: bad magic ${JSON.stringify(magic)}`);
  const version = view.getUint32(4, true);
  const payload = view.getUint32(8, true);
  if (payload !== buffer.byteLength - 12) throw new Error(`PMD: payload ${payload}, file ${buffer.byteLength - 12}`);
  if (version < 3 || version > 4) throw new Error(`PMD: unsupported version ${version}`);
  let o = 12;
  const numVertices = view.getUint32(o, true); o += 4;
  const numUVs = version >= 4 ? view.getUint32(o, true) : 1; if (version >= 4) o += 4;
  if (numUVs < 1 || numUVs > 4) throw new Error(`PMD: ${numUVs} UV sets`);
  const positions = new Float32Array(numVertices * 3);
  const normals = new Float32Array(numVertices * 3);
  const uvs = new Float32Array(numVertices * 2);
  const boneIndices = new Uint8Array(numVertices * 4);
  const boneWeights = new Float32Array(numVertices * 4);
  for (let i = 0; i < numVertices; i++) {
    positions[i * 3] = view.getFloat32(o, true);
    positions[i * 3 + 1] = view.getFloat32(o + 4, true);
    positions[i * 3 + 2] = view.getFloat32(o + 8, true);
    normals[i * 3] = view.getFloat32(o + 12, true);
    normals[i * 3 + 1] = view.getFloat32(o + 16, true);
    normals[i * 3 + 2] = view.getFloat32(o + 20, true);
    // the first UV set is the one the original's materials use (baseTex)
    uvs[i * 2] = view.getFloat32(o + 24, true);
    uvs[i * 2 + 1] = view.getFloat32(o + 28, true);
    o += 24 + numUVs * 8;
    for (let b = 0; b < 4; b++) boneIndices[i * 4 + b] = bytes[o + b];
    o += 4;
    for (let b = 0; b < 4; b++) boneWeights[i * 4 + b] = view.getFloat32(o + b * 4, true);
    o += 16;
  }
  const numFaces = view.getUint32(o, true); o += 4;
  const faces = new Uint16Array(numFaces * 3);
  for (let i = 0; i < faces.length; i++) faces[i] = view.getUint16(o + i * 2, true);
  o += faces.length * 2;
  const numBones = view.getUint32(o, true); o += 4;
  const bones: PmdBone[] = [];
  for (let i = 0; i < numBones; i++) {
    bones.push({
      translation: [view.getFloat32(o, true), view.getFloat32(o + 4, true), view.getFloat32(o + 8, true)],
      rotation: [view.getFloat32(o + 12, true), view.getFloat32(o + 16, true), view.getFloat32(o + 20, true), view.getFloat32(o + 24, true)],
    });
    o += 28;
  }
  const propPoints: PropPoint[] = [];
  if (version >= 2) {
    const count = view.getUint32(o, true); o += 4;
    for (let i = 0; i < count; i++) {
      let name: string;
      [name, o] = cstr(view, o, buffer.byteLength);
      propPoints.push({
        name,
        translation: [view.getFloat32(o, true), view.getFloat32(o + 4, true), view.getFloat32(o + 8, true)],
        rotation: [view.getFloat32(o + 12, true), view.getFloat32(o + 16, true), view.getFloat32(o + 20, true), view.getFloat32(o + 24, true)],
        bone: bytes[o + 28],
      });
      o += 29;
    }
  }
  if (version <= 2) {
    propPoints.push({ name: 'root', translation: [0, 0, 0], rotation: [0, 0, 0, -1], bone: 255 });
  }
  if (o !== buffer.byteLength) throw new Error(`PMD: ${o} bytes read of ${buffer.byteLength}`);
  return { version, numUVs, positions, normals, uvs, boneIndices, boneWeights, faces, bones, propPoints };
}

/** Number of vertices influenced by a given bone (for sanity checks in tests). */
export function boneInfluence(model: PmdModel, bone: number): number {
  let n = 0;
  for (let i = 0; i < model.boneIndices.length; i += 4) {
    for (let b = 0; b < 4; b++) {
      if (model.boneIndices[i + b] === bone && model.boneWeights[i + b] > 0) { n++; break; }
    }
  }
  return n;
}
