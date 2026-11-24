// The model shader: one directional sun and ambient light from the map's environment, optional
// player colour through the texture's alpha mask (0 A.D.'s USE_PLAYERCOLOR), alpha test for
// foliage, and distance fog. It is deliberately small; normal/specular/parallax maps and shadows
// are not part of this slice (README.md).
import { Color, DoubleSide, Matrix4, ShaderMaterial, Vector3, type Texture } from 'three';

export interface LightUniforms {
  sunDir: { value: Vector3 };
  sunColor: { value: Color };
  ambient: { value: Color };
  fogColor: { value: Color };
  fogNear: { value: number };
  fogFar: { value: number };
}

export function makeLightUniforms(): LightUniforms {
  return {
    sunDir: { value: new Vector3(0.5, -1, 0.3).normalize() },
    sunColor: { value: new Color(1, 1, 1) },
    ambient: { value: new Color(0.5, 0.5, 0.5) },
    fogColor: { value: new Color(0.5, 0.55, 0.6) },
    fogNear: { value: 120 },
    fogFar: { value: 700 },
  };
}

const vertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec2 vUv;
  varying vec3 vWorld;
  void main() {
    vUv = uv;
    #ifdef USE_INSTANCING
      mat4 model = modelMatrix * instanceMatrix;
      vNormal = normalize(mat3(model) * normal);
    #else
      mat4 model = modelMatrix;
      vNormal = normalize(normalMatrix * normal);
    #endif
    vec4 world = model * vec4(position, 1.0);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const fragment = /* glsl */ `
  uniform sampler2D map;
  uniform vec3 playerColor;
  uniform float usePlayerColor;
  uniform float alphaTest;
  uniform vec3 sunDir;
  uniform vec3 sunColor;
  uniform vec3 ambient;
  uniform vec3 fogColor;
  uniform float fogNear;
  uniform float fogFar;
  varying vec3 vNormal;
  varying vec2 vUv;
  varying vec3 vWorld;
  void main() {
    vec4 tex = texture2D(map, vUv);
    if (usePlayerColor < 0.5 && tex.a < alphaTest) discard;
    vec3 base = tex.rgb;
    if (usePlayerColor > 0.5) base *= mix(playerColor, vec3(1.0), tex.a);
    vec3 n = normalize(vNormal);
    float diff = max(dot(n, -sunDir), 0.0);
    vec3 color = base * (ambient + sunColor * diff);
    float d = distance(vWorld, cameraPosition);
    color = mix(color, fogColor, smoothstep(fogNear, fogFar, d));
    gl_FragColor = vec4(color, 1.0);
  }
`;

export interface ModelMaterialOptions {
  map: Texture;
  playerColor: Color;
  usePlayerColor: boolean;
  alphaTest: number;
  doubleSide: boolean;
  light: LightUniforms;
}

export function makeModelMaterial(o: ModelMaterialOptions): ShaderMaterial {
  return new ShaderMaterial({
    uniforms: {
      map: { value: o.map },
      playerColor: { value: o.playerColor },
      usePlayerColor: { value: o.usePlayerColor ? 1 : 0 },
      alphaTest: { value: o.alphaTest },
      sunDir: o.light.sunDir,
      sunColor: o.light.sunColor,
      ambient: o.light.ambient,
      fogColor: o.light.fogColor,
      fogNear: o.light.fogNear,
      fogFar: o.light.fogFar,
    },
    vertexShader: vertex,
    fragmentShader: fragment,
    ...(o.doubleSide ? { side: DoubleSide } : {}),
  });
}

/** 0 A.D. material names decide how alpha and player colour are used. */
export function materialFlags(material: string | null): { player: boolean; alphaTest: number; doubleSide: boolean } {
  const m = (material ?? '').toLowerCase();
  const player = m.includes('player');
  const trans = m.includes('trans');
  return {
    player,
    alphaTest: player ? 0 : trans ? 0.35 : 0,
    doubleSide: trans,
  };
}

const skinnedVertex = /* glsl */ `
  attribute vec4 skinIndex;
  attribute vec4 skinWeight;
  uniform mat4 boneMatrices[64];
  varying vec3 vNormal;
  varying vec2 vUv;
  varying vec3 vWorld;
  void main() {
    mat4 skin = mat4(0.0);
    skin += boneMatrices[int(skinIndex.x)] * skinWeight.x;
    skin += boneMatrices[int(skinIndex.y)] * skinWeight.y;
    skin += boneMatrices[int(skinIndex.z)] * skinWeight.z;
    skin += boneMatrices[int(skinIndex.w)] * skinWeight.w;
    vec4 local = skin * vec4(position, 1.0);
    vec3 n = mat3(skin) * normal;
    vNormal = normalize(normalMatrix * n);
    vUv = uv;
    vec4 world = modelMatrix * local;
    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

export function makeSkinnedMaterial(o: ModelMaterialOptions): ShaderMaterial {
  return new ShaderMaterial({
    uniforms: {
      map: { value: o.map },
      playerColor: { value: o.playerColor },
      usePlayerColor: { value: o.usePlayerColor ? 1 : 0 },
      alphaTest: { value: o.alphaTest },
      sunDir: o.light.sunDir,
      sunColor: o.light.sunColor,
      ambient: o.light.ambient,
      fogColor: o.light.fogColor,
      fogNear: o.light.fogNear,
      fogFar: o.light.fogFar,
      boneMatrices: { value: Array.from({ length: 64 }, () => new Matrix4()) },
    },
    vertexShader: skinnedVertex,
    fragmentShader: fragment,
    ...(o.doubleSide ? { side: DoubleSide } : {}),
  });
}
