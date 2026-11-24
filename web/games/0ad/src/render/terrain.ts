// The original PMP heightmap as one terrain mesh, with 0 A.D.'s per-tile terrain textures in a
// WebGL2 texture array. The map's 23 original DDS textures were converted to lossless WebP at
// 256 px (re/0ad/tools/assets.py); one tile is 4 m, so that is 64 px/m.
//
// The fragment shader draws the tile's own texture and, at a tile edge, blends towards the
// neighbour whose priority is higher (0 A.D.'s CMiniPatch priority decides which texture is on
// top at a boundary). Fog of war dims unexplored ground and hides unseen ground; the visibility
// grid is the original's vision ranges from the templates.
import {
  BufferAttribute, BufferGeometry, Color, DataArrayTexture, DataTexture, LinearFilter, Mesh, NearestFilter,
  DoubleSide, RGBAFormat, RepeatWrapping, ShaderMaterial, UnsignedByteType, Vector2,
} from 'three';
import type { Terrain } from '../data/pmp.ts';
import { HEIGHT_SCALE, TERRAIN_TILE_SIZE } from '../data/pmp.ts';
import { loadImageData } from './textures.ts';
import type { LightUniforms } from './materials.ts';

export interface TerrainView {
  mesh: Mesh;
  visibility: DataTexture;
  updateVisibility(explored: Uint8Array, visible: Uint8Array, size: number, fogCell: number): void;
  dispose(): void;
}

const vertex = /* glsl */ `
  varying vec3 vWorld;
  varying vec3 vNormal;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    vNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const fragment = /* glsl */ `
  precision highp sampler2DArray;
  uniform sampler2DArray terrainTex;
  uniform sampler2D tileMap;
  uniform sampler2D visibility;
  uniform vec2 mapSize;
  uniform float hasWater;
  uniform vec3 waterColor;
  uniform float waterHeight;
  uniform vec3 sunDir;
  uniform vec3 sunColor;
  uniform vec3 ambient;
  uniform vec3 fogColor;
  uniform float fogNear;
  uniform float fogFar;
  varying vec3 vWorld;
  varying vec3 vNormal;

  vec4 sampleTile(ivec2 t) {
    t = clamp(t, ivec2(0), ivec2(textureSize(tileMap, 0)) - 1);
    return texelFetch(tileMap, t, 0);
  }
  vec4 ground(ivec2 t, vec2 uv) {
    vec4 meta = sampleTile(t);
    int index = int(meta.r * 255.0 + 0.5);
    return texture(terrainTex, vec3(uv, float(index)));
  }
  void main() {
    vec2 p = vWorld.xz / ${TERRAIN_TILE_SIZE.toFixed(1)};
    ivec2 t = ivec2(floor(p));
    vec2 f = fract(p);
    vec4 meta = sampleTile(t);
    vec4 base = ground(t, p);
    // blend towards the higher-priority neighbour texture near an edge
    float d = min(min(f.x, 1.0 - f.x), min(f.y, 1.0 - f.y));
    if (d < 0.22) {
      ivec2 n = t;
      if (d == f.x) n.x -= 1;
      else if (d == 1.0 - f.x) n.x += 1;
      else if (d == f.y) n.y -= 1;
      else n.y += 1;
      vec4 nm = sampleTile(n);
      if (nm.g > meta.g && nm.r != meta.r)
        base = mix(base, ground(n, p), smoothstep(0.22, 0.0, d) * 0.7);
    }
    if (hasWater > 0.5 && vWorld.y < waterHeight) {
      vec3 n = normalize(vNormal);
      float diff = max(dot(n, -sunDir), 0.0);
      vec3 w = waterColor * (ambient + sunColor * diff * 0.6);
      gl_FragColor = vec4(w, 1.0);
      return;
    }
    vec3 n = normalize(vNormal);
    float diff = max(dot(n, -sunDir), 0.0);
    vec3 color = base.rgb * (ambient + sunColor * diff);
    float vis = texture2D(visibility, clamp(vWorld.xz / mapSize, 0.0, 1.0)).r;
    color *= mix(0.06, 1.0, smoothstep(0.0, 0.6, vis));
    float dist = distance(vWorld, cameraPosition);
    color = mix(color, fogColor, smoothstep(fogNear, fogFar, dist));
    gl_FragColor = vec4(color, 1.0);
  }
`;

export async function createTerrainView(terrain: Terrain, light: LightUniforms, water: { height: number; color: [number, number, number] } | null): Promise<TerrainView> {
  const image = await loadImageData('terrain/' + terrain.textures[0] + '.webp', 256);
  const layers = new Uint8Array(image.width * image.height * 4 * terrain.textures.length);
  for (let i = 0; i < terrain.textures.length; i++) {
    const tex = i === 0 ? image : await loadImageData('terrain/' + terrain.textures[i] + '.webp', 256);
    if (tex.width !== image.width || tex.height !== image.height) throw new Error('terrain textures differ in size');
    layers.set(tex.data, i * image.width * image.height * 4);
  }
  const array = new DataArrayTexture(layers, image.width, image.height, terrain.textures.length);
  array.format = RGBAFormat;
  array.type = UnsignedByteType;
  array.wrapS = RepeatWrapping;
  array.wrapT = RepeatWrapping;
  array.minFilter = LinearFilter;
  array.magFilter = LinearFilter;
  array.generateMipmaps = false;
  array.needsUpdate = true;

  const tileData = new Uint8Array(terrain.tilesPerSide * terrain.tilesPerSide * 4);
  for (let i = 0; i < terrain.tiles.length; i++) {
    const t = terrain.tiles[i];
    tileData[i * 4] = t.tex1;
    tileData[i * 4 + 1] = Math.max(0, Math.min(255, t.priority + 128));
    tileData[i * 4 + 2] = t.tex2 === 0xffff ? 255 : t.tex2;
    tileData[i * 4 + 3] = 255;
  }
  const tileMap = new DataTexture(tileData, terrain.tilesPerSide, terrain.tilesPerSide, RGBAFormat, UnsignedByteType);
  tileMap.magFilter = NearestFilter;
  tileMap.minFilter = NearestFilter;
  tileMap.needsUpdate = true;

  const visibility = new DataTexture(new Uint8Array(256 * 256 * 4), 256, 256, RGBAFormat, UnsignedByteType);
  visibility.magFilter = LinearFilter;
  visibility.minFilter = LinearFilter;
  visibility.needsUpdate = true;

  const geo = new BufferGeometry();
  const n = terrain.verticesPerSide;
  const positions = new Float32Array(n * n * 3);
  const normals = new Float32Array(n * n * 3);
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      const k = j * n + i;
      const x = i * TERRAIN_TILE_SIZE;
      const z = j * TERRAIN_TILE_SIZE;
      positions[k * 3] = x;
      positions[k * 3 + 1] = terrain.heights[k] * HEIGHT_SCALE;
      positions[k * 3 + 2] = z;
      const hx = terrain.heightAt(Math.min(terrain.size, Math.max(0, x + 2)), z) - terrain.heightAt(Math.max(0, x - 2), z);
      const hz = terrain.heightAt(x, Math.min(terrain.size, Math.max(0, z + 2))) - terrain.heightAt(x, Math.max(0, z - 2));
      const len = Math.hypot(-hx, 4, -hz);
      normals[k * 3] = -hx / len;
      normals[k * 3 + 1] = 4 / len;
      normals[k * 3 + 2] = -hz / len;
    }
  }
  const tiles = terrain.tilesPerSide;
  const index = new Uint32Array(tiles * tiles * 6);
  let p = 0;
  for (let j = 0; j < tiles; j++) {
    for (let i = 0; i < tiles; i++) {
      const a = (j * n + i), b = a + n, c = a + 1, d = b + 1;
      if (terrain.triangulationDir(i, j)) {
        index[p++] = a; index[p++] = b; index[p++] = c;
        index[p++] = d; index[p++] = b; index[p++] = c;
      } else {
        index[p++] = a; index[p++] = d; index[p++] = b;
        index[p++] = a; index[p++] = d; index[p++] = c;
      }
    }
  }
  geo.setAttribute('position', new BufferAttribute(positions, 3));
  geo.setAttribute('normal', new BufferAttribute(normals, 3));
  geo.setIndex(new BufferAttribute(index, 1));
  geo.computeBoundingSphere();

  const mat = new ShaderMaterial({
    uniforms: {
      terrainTex: { value: array },
      tileMap: { value: tileMap },
      visibility: { value: visibility },
      mapSize: { value: new Vector2(terrain.size, terrain.size) },
      hasWater: { value: water ? 1 : 0 },
      waterColor: { value: new Color(...(water?.color ?? [0, 0, 0])) },
      waterHeight: { value: water?.height ?? 0 },
      sunDir: light.sunDir,
      sunColor: light.sunColor,
      ambient: light.ambient,
      fogColor: light.fogColor,
      fogNear: light.fogNear,
      fogFar: light.fogFar,
    },
    vertexShader: vertex,
    fragmentShader: fragment,
    side: DoubleSide,
  });
  const mesh = new Mesh(geo, mat);
  mesh.frustumCulled = false;
  mesh.name = 'terrain';

  let visW = 256;
  const updateVisibility = (explored: Uint8Array, visible: Uint8Array, size: number, fogCell: number): void => {
    if (visW !== size || (visibility.image.data as Uint8Array).length !== size * size * 4) {
      visW = size;
      visibility.image = { data: new Uint8Array(size * size * 4), width: size, height: size };
    }
    const data = visibility.image.data as Uint8Array;
    for (let i = 0; i < size * size; i++) {
      const v = visible[i] ? 255 : explored[i] ? 110 : 0;
      data[i * 4] = v; data[i * 4 + 1] = v; data[i * 4 + 2] = v; data[i * 4 + 3] = 255;
    }
    visibility.needsUpdate = true;
    void fogCell;
  };

  return {
    mesh,
    visibility,
    updateVisibility,
    dispose() { geo.dispose(); mat.dispose(); array.dispose(); tileMap.dispose(); visibility.dispose(); },
  };
}

