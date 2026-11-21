// The heightmap terrain with the original's two blended ground textures (Terrain::load and
// drawpatch). A custom shader is used because three's built-in materials cannot mix two maps
// with a per-vertex slope factor.
import * as THREE from 'three';
import { TERRAIN_SCALE, TERRAIN_SIZE, slopeBlend, type HeightMap } from '../data/heightmap.ts';

const FOG_VERT = `
attribute float aBlend;
varying vec2 vUv;
varying float vBlend;
varying float vShade;
varying float vDist;
uniform vec3 uLight;
void main() {
  vUv = uv;
  vBlend = aBlend;
  vec3 n = normalize(normal);
  vShade = 1.05 + 0.35 * max(dot(n, normalize(uLight)), 0.0);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vDist = -mv.z;
  gl_Position = projectionMatrix * mv;
}`;

const FOG_FRAG = `
uniform sampler2D uTex1;
uniform sampler2D uTex2;
uniform vec3 uFogColor;
uniform float uFogNear;
uniform float uFogFar;
varying vec2 vUv;
varying float vBlend;
varying float vShade;
varying float vDist;
void main() {
  vec3 c = mix(texture2D(uTex1, vUv).rgb, texture2D(uTex2, vUv).rgb, vBlend);
  c *= vShade;
  float f = smoothstep(uFogNear, uFogFar, vDist);
  gl_FragColor = vec4(mix(c, uFogColor, f), 1.0);
}`;

export class TerrainView {
  readonly mesh: THREE.Mesh;
  readonly material: THREE.ShaderMaterial;

  constructor(map: HeightMap, tex1: THREE.Texture, tex2: THREE.Texture, environment: number, light: THREE.Vector3, fogColor: THREE.Color, fogNear: number, fogFar: number) {
    const size = TERRAIN_SIZE;
    const positions = new Float32Array(size * size * 3);
    const uvs = new Float32Array(size * size * 2);
    const blends = new Float32Array(size * size);
    for (let x = 0; x < size; x++) {
      for (let z = 0; z < size; z++) {
        const i = x * size + z;
        positions[i * 3] = x * TERRAIN_SCALE;
        positions[i * 3 + 1] = map.red[i] * 0.6;
        positions[i * 3 + 2] = z * TERRAIN_SCALE;
        uvs[i * 2] = (x * TERRAIN_SCALE) * 0.1;
        uvs[i * 2 + 1] = (z * TERRAIN_SCALE) * 0.1;
        // The original computes the second-texture opacity per image tile. Use the
        // same slope factor at the vertex's tile.
        blends[i] = slopeBlend(map, x * TERRAIN_SCALE, z * TERRAIN_SCALE, environment);
      }
    }
    const indices = new Uint32Array((size - 1) * (size - 1) * 6);
    let k = 0;
    for (let x = 0; x < size - 1; x++) {
      for (let z = 0; z < size - 1; z++) {
        const a = x * size + z;
        const b = (x + 1) * size + z;
        const c = x * size + (z + 1);
        const d = (x + 1) * size + (z + 1);
        // Terrain::getHeight uses a=(x,z), b=(x+1,z), c=(x,z+1); the mesh follows.
        indices[k++] = a; indices[k++] = c; indices[k++] = b;
        indices[k++] = b; indices[k++] = c; indices[k++] = d;
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geo.setAttribute('aBlend', new THREE.BufferAttribute(blends, 1));
    geo.setIndex(new THREE.BufferAttribute(indices, 1));
    geo.computeVertexNormals();
    geo.computeBoundingSphere();

    this.material = new THREE.ShaderMaterial({
      vertexShader: FOG_VERT,
      fragmentShader: FOG_FRAG,
      uniforms: {
        uTex1: { value: tex1 },
        uTex2: { value: tex2 },
        uLight: { value: light },
        uFogColor: { value: fogColor },
        uFogNear: { value: fogNear },
        uFogFar: { value: fogFar },
      },
    });
    this.mesh = new THREE.Mesh(geo, this.material);
    this.mesh.name = 'terrain';
    this.mesh.frustumCulled = false;
  }
}
