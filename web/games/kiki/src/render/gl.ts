// OpenGL 1.x the way the original uses it, on three.js: a modelview matrix stack, and a material that
// lights per vertex exactly like the fixed-function pipeline (GL_COLOR_MATERIAL for ambient and
// diffuse, material specular 0.5 grey with shininess 60, eight lights with attenuation and a spot
// cut-off, no light-model ambient, infinite viewer), drawn in the order the original draws.
import * as THREE from 'three';
import type { KColor } from '../engine/colors.ts';
import type { KQuaternion, KVector } from '../engine/math.ts';

export const MAX_GL_LIGHTS = 8;

/** glPushMatrix & co. on a THREE.Matrix4 */
export class MatStack {
  m = new THREE.Matrix4();
  private stack: THREE.Matrix4[] = [];
  private t = new THREE.Matrix4();
  push(): void { this.stack.push(this.m.clone()); }
  pop(): void { this.m = this.stack.pop()!; }
  load(m: THREE.Matrix4): void { this.m.copy(m); }
  identity(): void { this.m.identity(); }
  translate(x: number, y: number, z: number): void { this.m.multiply(this.t.makeTranslation(x, y, z)); }
  translateV(v: KVector): void { this.translate(v.x, v.y, v.z); }
  /** glRotatef(degrees, x, y, z) */
  rotate(deg: number, x: number, y: number, z: number): void {
    const axis = new THREE.Vector3(x, y, z);
    if (axis.lengthSq() === 0) return;
    this.m.multiply(this.t.makeRotationAxis(axis.normalize(), (deg * Math.PI) / 180));
  }
  scale(x: number, y: number, z: number): void { this.m.multiply(this.t.makeScale(x, y, z)); }
  /** KMatrix(quaternion).glMultMatrix() */
  quat(q: KQuaternion): void {
    this.m.multiply(this.t.makeRotationFromQuaternion(new THREE.Quaternion(q.x, q.y, q.z, q.w)));
  }
}

const VERTEX = /* glsl */ `
uniform vec4 uColor;
uniform bool uVertexColor;
uniform bool uLit;
uniform vec4 lPos[${MAX_GL_LIGHTS}];
uniform vec3 lAmb[${MAX_GL_LIGHTS}];
uniform vec3 lDif[${MAX_GL_LIGHTS}];
uniform vec3 lSpe[${MAX_GL_LIGHTS}];
uniform vec3 lAtt[${MAX_GL_LIGHTS}];
uniform vec3 lDir[${MAX_GL_LIGHTS}];
uniform float lCos[${MAX_GL_LIGHTS}];
uniform float lOn[${MAX_GL_LIGHTS}];
attribute vec4 kcolor;
varying vec4 vColor;
varying vec2 vUv;
void main() {
  vec4 eye = modelViewMatrix * vec4(position, 1.0);
  vec4 c = uVertexColor ? vec4(uColor.rgb, uColor.a * kcolor.a) : uColor;
  vUv = uv;
  if (!uLit) {
    vColor = c;
  } else {
    vec3 n = normalize(normalMatrix * normal);
    vec3 sum = vec3(0.0);
    for (int i = 0; i < ${MAX_GL_LIGHTS}; i++) {
      if (lOn[i] < 0.5) continue;
      vec3 L;
      float att = 1.0;
      if (lPos[i].w == 0.0) {
        L = normalize(lPos[i].xyz);
      } else {
        vec3 d = lPos[i].xyz - eye.xyz;
        float dist = length(d);
        L = d / dist;
        att = 1.0 / (lAtt[i].x + lAtt[i].y * dist + lAtt[i].z * dist * dist);
      }
      if (lCos[i] > -1.5) {
        if (dot(-L, normalize(lDir[i])) < lCos[i]) att = 0.0;
      }
      float ndl = max(dot(n, L), 0.0);
      vec3 col = c.rgb * lAmb[i] + ndl * c.rgb * lDif[i];
      if (ndl > 0.0) {
        vec3 h = normalize(L + vec3(0.0, 0.0, 1.0));
        col += pow(max(dot(n, h), 0.0), 60.0) * vec3(0.5) * lSpe[i];
      }
      sum += att * col;
    }
    vColor = vec4(clamp(sum, 0.0, 1.0), c.a);
  }
  gl_Position = projectionMatrix * eye;
}`;

const FRAGMENT = /* glsl */ `
uniform bool uMap;
uniform sampler2D map;
varying vec4 vColor;
varying vec2 vUv;
void main() {
  vec4 c = vColor;
  if (uMap) c.a *= texture2D(map, vUv).a;
  gl_FragColor = c;
}`;

/** the GL lights of a pass: positions and directions in eye coordinates */
export class LightState {
  pos = Array.from({ length: MAX_GL_LIGHTS }, () => new THREE.Vector4());
  amb = Array.from({ length: MAX_GL_LIGHTS }, () => new THREE.Vector3());
  dif = Array.from({ length: MAX_GL_LIGHTS }, () => new THREE.Vector3());
  spe = Array.from({ length: MAX_GL_LIGHTS }, () => new THREE.Vector3());
  att = Array.from({ length: MAX_GL_LIGHTS }, () => new THREE.Vector3(1, 0, 0));
  dir = Array.from({ length: MAX_GL_LIGHTS }, () => new THREE.Vector3(0, 0, -1));
  cos = new Array<number>(MAX_GL_LIGHTS).fill(-2);
  on = new Array<number>(MAX_GL_LIGHTS).fill(0);
  uniforms = {
    lPos: { value: this.pos }, lAmb: { value: this.amb }, lDif: { value: this.dif }, lSpe: { value: this.spe },
    lAtt: { value: this.att }, lDir: { value: this.dir }, lCos: { value: this.cos }, lOn: { value: this.on },
  };

  /** GL_LIGHT0 of a KLightingProjection: at the camera (+ offset), white, shining along -Z */
  setCameraLight(eyePos: THREE.Vector3, cutoff: number, attenuation: [number, number, number]): void {
    this.pos[0].set(eyePos.x, eyePos.y, eyePos.z, 1);
    this.amb[0].set(0, 0, 0);
    this.dif[0].set(1, 1, 1);
    this.spe[0].set(1, 1, 1);
    this.att[0].set(...attenuation);
    this.dir[0].set(0, 0, -1);
    this.cos[0] = cutoff >= 180 ? -2 : Math.cos((cutoff * Math.PI) / 180);
    this.on[0] = 1;
  }

  setLight(n: number, eyePos: THREE.Vector3, amb: KColor, dif: KColor, spe: KColor, quadratic: number): void {
    this.pos[n].set(eyePos.x, eyePos.y, eyePos.z, 1);
    this.amb[n].set(amb[0], amb[1], amb[2]);
    this.dif[n].set(dif[0], dif[1], dif[2]);
    this.spe[n].set(spe[0], spe[1], spe[2]);
    this.att[n].set(1, 0, quadratic);
    this.cos[n] = -2;
    this.on[n] = 1;
  }

  copyFrom(o: LightState): void {
    for (let i = 0; i < MAX_GL_LIGHTS; i++) {
      this.pos[i].copy(o.pos[i]); this.amb[i].copy(o.amb[i]); this.dif[i].copy(o.dif[i]); this.spe[i].copy(o.spe[i]);
      this.att[i].copy(o.att[i]); this.dir[i].copy(o.dir[i]); this.cos[i] = o.cos[i]; this.on[i] = o.on[i];
    }
  }
}

export interface DrawOpts {
  lit?: boolean;
  depthWrite?: boolean;
  depthTest?: boolean;
  cull?: boolean;
  vertexColor?: boolean;
  map?: THREE.Texture | null;
  blend?: boolean;
}

/** one pass (a scene drawn with one camera and one set of lights), drawn in call order */
export class Pass {
  scene = new THREE.Scene();
  private pool: THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>[] = [];
  private used = 0;
  lights = new LightState();

  begin(): void {
    for (let i = 0; i < this.used; i++) this.pool[i].visible = false;
    this.used = 0;
  }

  draw(geometry: THREE.BufferGeometry, matrix: THREE.Matrix4, color: KColor, o: DrawOpts = {}): void {
    let mesh = this.pool[this.used];
    if (!mesh) {
      const material = new THREE.ShaderMaterial({
        vertexShader: VERTEX,
        fragmentShader: FRAGMENT,
        uniforms: {
          uColor: { value: new THREE.Vector4() }, uVertexColor: { value: false }, uLit: { value: true },
          uMap: { value: false }, map: { value: null },
          ...this.lights.uniforms,
        },
        transparent: true,
      });
      mesh = new THREE.Mesh(geometry, material);
      mesh.matrixAutoUpdate = false;
      mesh.frustumCulled = false;
      this.pool.push(mesh);
      this.scene.add(mesh);
    }
    mesh.visible = true;
    mesh.geometry = geometry;
    mesh.matrix.copy(matrix);
    mesh.matrixWorld.copy(matrix);
    mesh.renderOrder = this.used;
    const m = mesh.material;
    const u = m.uniforms;
    (u.uColor.value as THREE.Vector4).set(color[0], color[1], color[2], color[3]);
    u.uVertexColor.value = !!o.vertexColor;
    u.uLit.value = o.lit !== false;
    u.uMap.value = !!o.map;
    u.map.value = o.map ?? null;
    m.depthWrite = o.depthWrite !== false;
    m.depthTest = o.depthTest !== false;
    m.side = o.cull === false ? THREE.DoubleSide : THREE.FrontSide;
    m.blending = o.blend === false ? THREE.NoBlending : THREE.NormalBlending;
    this.used++;
  }
}
