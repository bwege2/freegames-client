// 0 A.D.'s terrain file (PMP, "Pyrogenesis Map").
//
// The format is written by CMapWriter::PackTerrain (source/graphics/MapWriter.cpp) and read by
// CMapReader::UnpackTerrain (source/graphics/MapReader.cpp) in the pinned release:
//
//   char[4] "PSMP"; u32 version; u32 payloadSize;
//   u32 patchesPerSide;
//   u16 height[verticesPerSide^2];          verticesPerSide = patchesPerSide * PATCH_SIZE + 1
//   u32 textureCount; (u32 length, char[length])[];   VFS paths/names of the terrain textures
//   { u16 tex1; u16 tex2; u32 priority; }[tilesPerSide^2]
//
// PATCH_SIZE = 16, TERRAIN_TILE_SIZE = 4 m and HEIGHT_UNITS_PER_METRE = 92 (source/graphics/Terrain.h).
// The tile order is j (z) outer, i (x) inner; each vertex's world position is (i*4, h/92, j*4).

export const TERRAIN_TILE_SIZE = 4;
export const HEIGHT_UNITS_PER_METRE = 92;
export const HEIGHT_SCALE = 1 / HEIGHT_UNITS_PER_METRE;
export const PATCH_SIZE = 16;

export interface TerrainTile {
  /** index into `textures` */
  tex1: number;
  /** index into `textures`, or 0xffff for none */
  tex2: number;
  /** 0 A.D.'s blend priority (higher draws on top) */
  priority: number;
}

export interface Terrain {
  patchesPerSide: number;
  /** tiles per side = patchesPerSide * 16 */
  tilesPerSide: number;
  /** vertices per side = tilesPerSide + 1 */
  verticesPerSide: number;
  /** world size in metres: (verticesPerSide - 1) * 4 */
  size: number;
  /** row-major, z outer, x inner; raw 0 A.D. height units */
  heights: Uint16Array;
  textures: string[];
  /** row-major tiles, z outer, x inner */
  tiles: TerrainTile[];
  /** exact ground level in metres at world (x,z), the way CTerrain::GetExactGroundLevel does it */
  heightAt(x: number, z: number): number;
  /** the unit normal of the terrain triangle at world (x,z), like CTerrain::CalcExactNormal */
  normalAt(x: number, z: number): { x: number; y: number; z: number };
  /** whether the tile (i,j) is split from (i,j) to (i+1,j+1), like CTerrain::GetTriangulationDir */
  triangulationDir(i: number, j: number): boolean;
  tileAt(x: number, z: number): TerrainTile;
}

function readU32(view: DataView, offset: number, size: number): number {
  if (offset + 4 > size) throw new Error('PMP: truncated u32');
  return view.getUint32(offset, true);
}

export function parsePmp(buffer: ArrayBuffer): Terrain {
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);
  const magic = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]);
  if (magic !== 'PSMP') throw new Error(`PMP: bad magic ${JSON.stringify(magic)}`);
  const version = readU32(view, 4, buffer.byteLength);
  // Version 7 is the pinned release's FILE_VERSION (source/graphics/MapIO.h). Older files have the
  // same terrain layout from version 4 on; refuse anything newer than what this port understands.
  if (version < 4 || version > 7) throw new Error(`PMP: unsupported version ${version}`);
  const payload = readU32(view, 8, buffer.byteLength);
  if (payload !== buffer.byteLength - 12) throw new Error(`PMP: payload ${payload}, file has ${buffer.byteLength - 12}`);

  let offset = 12;
  const patchesPerSide = readU32(view, offset, buffer.byteLength);
  offset += 4;
  if (patchesPerSide < 1 || patchesPerSide > 128) throw new Error(`PMP: patches per side ${patchesPerSide}`);
  const tilesPerSide = patchesPerSide * PATCH_SIZE;
  const verticesPerSide = tilesPerSide + 1;
  const vertexCount = verticesPerSide * verticesPerSide;
  if (offset + vertexCount * 2 > buffer.byteLength) throw new Error('PMP: truncated heightmap');
  const heights = new Uint16Array(vertexCount);
  for (let i = 0; i < vertexCount; i++) heights[i] = view.getUint16(offset + i * 2, true);
  offset += vertexCount * 2;

  const textureCount = readU32(view, offset, buffer.byteLength);
  offset += 4;
  if (textureCount > 4096) throw new Error(`PMP: ${textureCount} textures`);
  const textures: string[] = [];
  const decoder = new TextDecoder();
  for (let i = 0; i < textureCount; i++) {
    const length = readU32(view, offset, buffer.byteLength);
    offset += 4;
    if (offset + length > buffer.byteLength) throw new Error('PMP: truncated texture name');
    textures.push(decoder.decode(bytes.subarray(offset, offset + length)));
    offset += length;
  }

  const tileCount = tilesPerSide * tilesPerSide;
  if (offset + tileCount * 8 !== buffer.byteLength) throw new Error(`PMP: tile data ends at ${offset + tileCount * 8}, file is ${buffer.byteLength}`);
  const tiles: TerrainTile[] = new Array(tileCount);
  for (let i = 0; i < tileCount; i++) {
    tiles[i] = {
      tex1: view.getUint16(offset, true),
      tex2: view.getUint16(offset + 2, true),
      priority: view.getInt32(offset + 4, true),
    };
    offset += 8;
  }

  const size = (verticesPerSide - 1) * TERRAIN_TILE_SIZE;
  const h = (i: number, j: number): number => heights[j * verticesPerSide + i];

  const triangulationDir = (i: number, j: number): boolean => {
    const ci = Math.max(0, Math.min(verticesPerSide - 2, i));
    const cj = Math.max(0, Math.min(verticesPerSide - 2, j));
    return h(ci, cj) + h(ci + 1, cj + 1) < h(ci + 1, cj) + h(ci, cj + 1);
  };

  const heightAt = (x: number, z: number): number => {
    const xi = Math.max(0, Math.min(verticesPerSide - 2, Math.floor(x / TERRAIN_TILE_SIZE)));
    const zi = Math.max(0, Math.min(verticesPerSide - 2, Math.floor(z / TERRAIN_TILE_SIZE)));
    const xf = Math.max(0, Math.min(1, x / TERRAIN_TILE_SIZE - xi));
    const zf = Math.max(0, Math.min(1, z / TERRAIN_TILE_SIZE - zi));
    const h00 = h(xi, zi), h01 = h(xi, zi + 1), h10 = h(xi + 1, zi), h11 = h(xi + 1, zi + 1);
    if (triangulationDir(xi, zi)) {
      if (xf + zf <= 1) return HEIGHT_SCALE * (h00 + (h10 - h00) * xf + (h01 - h00) * zf);
      return HEIGHT_SCALE * (h11 + (h01 - h11) * (1 - xf) + (h10 - h11) * (1 - zf));
    }
    if (xf <= zf) return HEIGHT_SCALE * (h00 + (h11 - h01) * xf + (h01 - h00) * zf);
    return HEIGHT_SCALE * (h00 + (h10 - h00) * xf + (h11 - h10) * zf);
  };

  const normalAt = (x: number, z: number): { x: number; y: number; z: number } => {
    const xi = Math.max(0, Math.min(verticesPerSide - 2, Math.floor(x / TERRAIN_TILE_SIZE)));
    const zi = Math.max(0, Math.min(verticesPerSide - 2, Math.floor(z / TERRAIN_TILE_SIZE)));
    const xf = Math.max(0, Math.min(1, x / TERRAIN_TILE_SIZE - xi));
    const zf = Math.max(0, Math.min(1, z / TERRAIN_TILE_SIZE - zi));
    const h00 = h(xi, zi), h01 = h(xi, zi + 1), h10 = h(xi + 1, zi), h11 = h(xi + 1, zi + 1);
    let dx: number, dz: number;
    // gradient of the triangle's plane: (-dY/dx, 1, -dY/dz) for the two possibilities
    if (triangulationDir(xi, zi)) {
      if (xf + zf <= 1) { dx = (h10 - h00) * HEIGHT_SCALE; dz = (h01 - h00) * HEIGHT_SCALE; }
      else { dx = (h11 - h01) * HEIGHT_SCALE; dz = (h11 - h10) * HEIGHT_SCALE; }
    } else if (xf <= zf) {
      dx = (h11 - h01) * HEIGHT_SCALE;
      dz = (h01 - h00) * HEIGHT_SCALE;
    } else {
      dx = (h10 - h00) * HEIGHT_SCALE;
      dz = (h11 - h10) * HEIGHT_SCALE;
    }
    // n = (-dY/dx, 1, -dY/dz), normalised; the C++ code builds the same vector from a cross product
    const len = Math.hypot(dx, 1, dz);
    return { x: -dx / len, y: 1 / len, z: -dz / len };
  };

  const tileAt = (x: number, z: number): TerrainTile => {
    const i = Math.max(0, Math.min(tilesPerSide - 1, Math.floor(x / TERRAIN_TILE_SIZE)));
    const j = Math.max(0, Math.min(tilesPerSide - 1, Math.floor(z / TERRAIN_TILE_SIZE)));
    return tiles[j * tilesPerSide + i];
  };

  return { patchesPerSide, tilesPerSide, verticesPerSide, size, heights, textures, tiles, heightAt, normalAt, triangulationDir, tileAt };
}
