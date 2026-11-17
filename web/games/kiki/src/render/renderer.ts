// The original's display code, drawn with three.js: KikiWorld::display (the wall plates, the lights'
// halos, the objects far to near), every object's render(), KikiStatusDisplay::display (the moves atom
// and its number), the screen texts and menus (KikiScreenText::display, KikiMenu::display), and the
// display gamma (SDL_SetGamma) as a last pass.
import * as THREE from 'three';
import { colorOf, type KColor } from '../engine/colors.ts';
import type { KikiController } from '../engine/controller.ts';
import { KikiScreenText, KikiText, textColor, base_color, type KikiTextLine } from '../engine/gui.ts';
import { KVector } from '../engine/math.ts';
import {
  CAMERA_BEHIND, CAMERA_INSIDE, KikiAtom, KikiBomb, KikiBot, KikiBotFume, KikiBullet, KikiGate, KikiGear,
  KikiGenerator, KikiLight, KikiMotorCylinder, KikiMotorGear, KikiMovesAtom, KikiObject, KikiPlayer, KikiSpikes,
  KikiStone, KikiSwitch, KikiTmpObject, KikiValve, KikiWall, KikiWire, KikiWireStone, normalVectorForFace,
  orientationForFace,
} from '../engine/objects.ts';
import { KikiProjection, screen } from '../engine/projection.ts';
import { MatStack, Pass } from './gl.ts';
import {
  BEVEL_DEPTH, billboard, borderPlates, cube, cylinder, dodecahedron, gateBar, glyph, gradientTexture, model, rect,
  sphere, torus, wallPlates,
} from './shapes.ts';

const GAMMA_VERTEX = 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
const GAMMA_FRAGMENT = `uniform sampler2D tex; uniform float gamma; varying vec2 vUv;
void main() { vec4 c = texture2D(tex, vUv); gl_FragColor = vec4(pow(c.rgb, vec3(1.0 / gamma)), 1.0); }`;

export class KikiRenderer {
  readonly canvas: HTMLCanvasElement;
  readonly renderer: THREE.WebGLRenderer;
  private target: THREE.WebGLRenderTarget;
  private gammaScene = new THREE.Scene();
  private gammaCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private gammaMaterial: THREE.ShaderMaterial;
  private worldPass = new Pass();
  private statusPass = new Pass();
  private overlayPasses: Pass[] = [];
  private camera = new THREE.PerspectiveCamera();
  private gradient = gradientTexture();
  private ms = new MatStack();
  private plates: { key: string; geometry: THREE.BufferGeometry } | null = null;
  private statusAtom: KikiMovesAtom | null = null;

  constructor(host: HTMLElement) {
    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = 'display:block;width:100%;height:100%;outline:none';
    host.append(this.canvas);
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: false });
    this.renderer.autoClear = false;
    this.renderer.sortObjects = true;
    // no multisampling: the original draws without antialiasing
    this.target = new THREE.WebGLRenderTarget(1, 1, { depthBuffer: true });
    this.gammaMaterial = new THREE.ShaderMaterial({
      vertexShader: GAMMA_VERTEX, fragmentShader: GAMMA_FRAGMENT,
      uniforms: { tex: { value: this.target.texture }, gamma: { value: 1.5 } }, depthTest: false, depthWrite: false,
    });
    this.gammaScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.gammaMaterial));
  }

  resize(w: number, h: number, dpr: number): void {
    screen.w = Math.max(1, Math.round(w));
    screen.h = Math.max(1, Math.round(h));
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(screen.w, screen.h, false);
    this.target.setSize(Math.round(screen.w * dpr), Math.round(screen.h * dpr));
    this.pixelRatio = dpr;
  }
  private pixelRatio = 1;

  dispose(): void {
    this.renderer.dispose();
    this.target.dispose();
    this.canvas.remove();
  }

  // ......................................................................................... frame
  render(C: KikiController): void {
    const r = this.renderer;
    r.setRenderTarget(this.target);
    const base = colorOf('KikiWorld', 'base');
    r.setClearColor(new THREE.Color(base[0], base[1], base[2]), base[3]);
    r.clear(true, true, true);
    this.renderWorld(C);
    if (C.player_status.isVisible() && C.player_status.player_status) {
      r.clearDepth();
      this.renderStatus(C);
    }
    for (let i = 0; i < C.overlays.length; i++) {
      const o = C.overlays[i];
      if (o instanceof KikiScreenText) {
        r.clearDepth();
        this.renderOverlay(o, i);
      }
    }
    r.setRenderTarget(null);
    this.gammaMaterial.uniforms.gamma.value = 1.0 + C.getGamma() / 10.0;
    r.setViewport(0, 0, screen.w, screen.h);
    r.render(this.gammaScene, this.gammaCamera);
  }

  /** a KikiProjection as a three.js camera, its viewport set on the render target */
  private useProjection(p: KikiProjection): void {
    const cam = this.camera;
    const [x, y, w, h] = p.getViewportPixels();
    const pr = this.pixelRatio;
    this.target.viewport.set(x * pr, y * pr, w * pr, h * pr);
    this.renderer.setRenderTarget(this.target); // takes the target's viewport
    cam.fov = p.fov;
    cam.aspect = p.getCurrentAspectRatio();
    cam.near = p.znear;
    cam.far = p.zfar;
    cam.updateProjectionMatrix();
    cam.matrixAutoUpdate = false;
    cam.matrix.set(
      p.x.x, p.y.x, p.z.x, p.pos.x,
      p.x.y, p.y.y, p.z.y, p.pos.y,
      p.x.z, p.y.z, p.z.z, p.pos.z,
      0, 0, 0, 1);
    cam.updateMatrixWorld(true);
  }

  private eye(v: KVector): THREE.Vector3 {
    return new THREE.Vector3(v.x, v.y, v.z).applyMatrix4(this.camera.matrixWorldInverse);
  }

  /** GL_LIGHT0 at the projection (KLightingProjection::apply), in eye coordinates */
  private cameraLight(pass: Pass, p: KikiProjection): void {
    pass.lights.setCameraLight(this.eye(p.getPosition().add(p.light_offset)), p.lightCutoff, p.lightAttenuation);
  }

  // ......................................................................................... world
  private renderWorld(C: KikiController): void {
    const world = C.world;
    const pass = this.worldPass;
    pass.begin();
    const p = world.updateCamera();
    this.useProjection(p);
    this.cameraLight(pass, p);
    // the KikiLights keep their GL light numbers; their positions are set when they are displayed
    for (let n = 1; n < pass.lights.on.length; n++) pass.lights.on[n] = 0;
    for (const light of world.lights) {
      if (!light.light_number) continue;
      pass.lights.setLight(light.light_number, this.eye(light.position), light.ambient_color, light.diffuse_color,
        light.specular_color, light.quadratic_attenuation);
    }
    const ms = this.ms;
    // .................................................................... the border plates
    if (world.display_border) {
      const key = `${world.size.x},${world.size.y},${world.size.z},${world.display_raster},${world.displayListVersion}`;
      if (!this.plates || this.plates.key !== key) {
        this.plates?.geometry.dispose();
        this.plates = { key, geometry: borderPlates(world.size.x, world.size.y, world.size.z, world.display_raster) };
      }
      pass.draw(this.plates.geometry, new THREE.Matrix4(), colorOf('KikiWorld', 'plate'), { depthTest: false, depthWrite: false, blend: false });
    }
    // .................................................................... the lights' halos
    const quat = new THREE.Quaternion().setFromRotationMatrix(this.camera.matrix);
    for (const light of world.lights) {
      if (!light.light_number) continue;
      ms.identity();
      ms.translateV(light.position);
      ms.m.multiply(new THREE.Matrix4().makeRotationFromQuaternion(quat));
      pass.draw(billboard(1.0), ms.m, colorOf('KikiLight', 'halo'), { lit: false, map: this.gradient, depthWrite: false });
    }
    // .................................................................... the objects, far to near
    const look = p.getZVector();
    const eyePos = p.getPosition().add(look.mul(0.2));
    const half_sqrt_3 = -Math.sqrt(3.0) / 2.0;
    const half_fov_rad = (p.fov / 2.0) * (Math.PI / 180);
    const ydir = Math.sin(half_fov_rad - Math.PI / 2);
    const ydirz = Math.cos(half_fov_rad - Math.PI / 2);
    const ar = p.getCurrentAspectRatio();
    const xangle = Math.atan((Math.sin(half_fov_rad) * ar) / Math.cos(half_fov_rad)) - Math.PI / 2;
    const xdir = Math.sin(xangle);
    const xdirz = Math.cos(xangle);
    const toWorld = (v: KVector): KVector => p.x.mul(v.x).add(p.y.mul(v.y)).add(p.z.mul(v.z));
    const normals = [toWorld(new KVector(0, ydir, -ydirz)), toWorld(new KVector(0, -ydir, -ydirz)),
      toWorld(new KVector(xdir, 0, -xdirz)), toWorld(new KVector(-xdir, 0, -xdirz))];
    const list: [number, KikiObject][] = [];
    for (const o of world.objects) {
      const e = o.current_position.sub(eyePos);
      if (normals.some((n) => n.dot(e) < half_sqrt_3)) continue;
      list.push([e.x * e.x + e.y * e.y + e.z * e.z, o]);
    }
    // std::multimap, iterated in reverse: the farthest first, equal distances in reverse insertion order
    const indexed = list.map((e, i) => [e[0], i, e[1]] as [number, number, KikiObject]);
    indexed.sort((a, b) => (b[0] - a[0]) || (b[1] - a[1]));
    for (const [, , o] of indexed) this.display(C, pass, o, quat);
    this.renderer.render(pass.scene, this.camera);
  }

  /** KikiObject::display and the overrides */
  private display(C: KikiController, pass: Pass, o: KikiObject, camQuat: THREE.Quaternion): void {
    const ms = this.ms;
    ms.identity();
    if (o instanceof KikiTmpObject) {
      // KikiTmpObject::render: a dot in the debug mode's DISPLAY_DOTS
      if (C.world.display_dots) {
        ms.translateV(o.current_position);
        pass.draw(sphere(0.1), ms.m, colorOf('KikiTmpObject'));
      }
      return;
    }
    if (o instanceof KikiPlayer) {
      if (C.world.getCameraMode() !== CAMERA_INSIDE) {
        ms.translateV(o.current_position);
        this.renderBot(C, pass, o);
      }
      return;
    }
    if (o instanceof KikiBullet) {
      ms.translateV(o.current_position);
      pass.draw(sphere(o.size), ms.m, o.color);
      return;
    }
    if (o instanceof KikiBotFume) {
      const c = colorOf('KikiBotFume');
      ms.translateV(o.current_position);
      ms.m.multiply(new THREE.Matrix4().makeRotationFromQuaternion(camQuat));
      pass.draw(billboard(o.size || 1e-6), ms.m, [c[0], c[1], c[2], c[3] * o.alpha_value], { lit: false, map: this.gradient });
      return;
    }
    if (o instanceof KikiWire) {
      ms.translateV(o.current_position);
      const n = normalVectorForFace(o.face);
      const off = 0.005;
      ms.translateV(n.mul(0.5 - off));
      ms.push();
      ms.quat(orientationForFace(o.face));
      const c = colorOf('KikiWire');
      pass.draw(model('wire'), ms.m, c);
      const h = 0.05;
      const s = 0.5 + off;
      if (o.connections & KikiWire.RIGHT) pass.draw(rect(0.0, -h, s, h), ms.m, c, { cull: false });
      if (o.connections & KikiWire.LEFT) pass.draw(rect(-s, -h, 0.0, h), ms.m, c, { cull: false });
      if (o.connections & KikiWire.UP) pass.draw(rect(-h, 0.0, h, s), ms.m, c, { cull: false });
      if (o.connections & KikiWire.DOWN) pass.draw(rect(-h, -s, h, 0.0), ms.m, c, { cull: false });
      ms.pop();
      if (o.active) {
        const l = colorOf('KikiWire', 'light');
        ms.translateV(n.mul(-0.1));
        ms.m.multiply(new THREE.Matrix4().makeRotationFromQuaternion(camQuat));
        pass.draw(billboard(0.15), ms.m, [l[0], l[1], l[2], o.value], { lit: false, map: this.gradient });
      }
      return;
    }
    if (o instanceof KikiValve) {
      ms.translateV(o.current_position);
      ms.quat(orientationForFace(o.face));
      this.renderValve(pass, o);
      return;
    }
    // KikiObject::display: translate to the current position, render
    ms.translateV(o.current_position);
    if (o instanceof KikiMutant_) {
      this.renderBot(C, pass, o as KikiBot);
    } else if (o instanceof KikiWall) {
      pass.draw(cube(1.0), ms.m, colorOf('KikiWall'), { lit: false, depthWrite: false });
      pass.draw(wallPlates(), ms.m, colorOf('KikiWall', 'plate'));
    } else if (o instanceof KikiStone) {
      const c = o.color ?? colorOf('KikiStone');
      if (o.isSlippery()) {
        const s = 0.48;
        const off = 0.5 - (s + 0.02) / 2;
        const steps: [number, number, number][] = [[off, off, off], [-2 * off, 0, 0], [0, -2 * off, 0], [2 * off, 0, 0],
          [0, 0, -2 * off], [0, 2 * off, 0], [-2 * off, 0, 0], [0, -2 * off, 0]];
        ms.push();
        for (const [x, y, z] of steps) {
          ms.translate(x, y, z);
          pass.draw(cube(s), ms.m, c);
        }
        ms.pop();
      } else {
        pass.draw(cube(0.98), ms.m, c);
      }
      void KikiWireStone;
    } else if (o instanceof KikiGate) {
      this.renderGate(pass, o);
    } else if (o instanceof KikiSwitch) {
      const c = colorOf('KikiSwitch');
      const radius = 0.5;
      const inner = 0.05;
      ms.push();
      ms.rotate(o.angle, 1, 0, 0);
      pass.draw(torus(inner, radius - inner, 6, 8), ms.m, c);
      ms.rotate(90, 0, 1, 0);
      ms.rotate(o.angle, 1, 0, 0);
      pass.draw(torus(inner, radius - inner, 6, 8), ms.m, c);
      ms.rotate(90, 1, 0, 0);
      pass.draw(torus(inner, radius - inner, 6, 8), ms.m, c);
      ms.pop();
      if (o.active) pass.draw(sphere(0.3), ms.m, colorOf('KikiSwitch', 'sphere'));
    } else if (o instanceof KikiBomb) {
      const c = colorOf('KikiBomb');
      ms.scale(o.size * 0.3, o.size * 0.3, o.size * 0.3);
      ms.rotate(o.angle, 1, 0, 0);
      ms.rotate(90, 0, 1, 0);
      ms.rotate(o.angle, 1, 0, 0);
      pass.draw(dodecahedron(), ms.m, c);
      ms.rotate(90, 1, 0, 0);
      pass.draw(dodecahedron(), ms.m, c);
    } else if (o instanceof KikiMotorCylinder) {
      ms.quat(o.orientation);
      pass.draw(model('cylinder'), ms.m, colorOf('KikiMotorCylinder'));
      ms.translate(0, 0, -0.5 * Math.sin(o.value));
      pass.draw(model('kolben'), ms.m, colorOf('KikiGear'));
    } else if (o instanceof KikiSpikes) {
      const n = normalVectorForFace(o.face).mul(0.5);
      ms.translateV(n);
      const rot: Record<number, [number, number, number, number]> = { 2: [0, 0, 1, 0], 5: [180, 0, 1, 0], 0: [90, 0, 1, 0],
        3: [-90, 0, 1, 0], 1: [-90, 1, 0, 0], 4: [90, 1, 0, 0] };
      const [a, x, y, z] = rot[o.face];
      if (a) ms.rotate(a, x, y, z);
      ms.scale(1, 1, o.spike || 1e-6);
      const num = 3;
      const offset = 1.0 / (2.0 * num) - 0.5;
      for (let i = 0; i < num; i++) {
        for (let j = 0; j < num; j++) {
          ms.push();
          ms.translate(i / num + offset, j / num + offset, 0.0);
          pass.draw(cylinder(0.1, 0.0, 1.0, 8), ms.m, colorOf('KikiSpikes'));
          ms.pop();
        }
      }
    } else if (o instanceof KikiAtom) {
      // not placed in levels; the status display draws its own
    }
  }

  private renderGate(pass: Pass, o: KikiGate): void {
    const ms = this.ms;
    const c = colorOf('KikiGate');
    const color: KColor = o.active ? c : [c[0], c[1], c[2], c[3] / 4.0];
    const v = Math.sin((o.angle * Math.PI) / 180);
    const av = Math.abs(v);
    const b = 0.29 + av * 0.1;
    const h = 0.1 - av * 0.05;
    const r = 0.49;
    const t = v * (0.49 - h);
    const s = 1.0 - av * 0.5;
    const bar = gateBar(r, b, h);
    const pair = (): void => {
      ms.scale(s, 1.0, s);
      ms.translate(0, t, 0);
      pass.draw(bar, ms.m, color);
      ms.translate(0, -2 * t, 0);
      pass.draw(bar, ms.m, color);
    };
    ms.push(); pair(); ms.pop();
    ms.push(); ms.rotate(90, 1, 0, 0); pair(); ms.pop();
    ms.push(); ms.rotate(-90, 0, 0, 1); pair(); ms.pop();
    if (o.active) pass.draw(sphere(0.20), ms.m, colorOf('KikiGate', 'sphere'));
  }

  private renderValve(pass: Pass, o: KikiValve): void {
    const ms = this.ms;
    const spin = (): void => { ms.rotate(o.clockwise ? o.angle : -o.angle, 0, 0, 1); };
    if (o instanceof KikiGenerator) {
      if (o.active) spin();
      pass.draw(model('generator'), ms.m, colorOf('KikiGenerator'));
      ms.translate(0, 0, 0.4);
      pass.draw(model('gear'), ms.m, colorOf('KikiGear'));
    } else if (o instanceof KikiMotorGear) {
      pass.draw(model('motor'), ms.m, colorOf('KikiMotorGear'));
      if (o.active) spin();
      ms.translate(0, 0, 0.4);
      pass.draw(model('gear'), ms.m, colorOf('KikiGear'));
    } else if (o instanceof KikiGear) {
      if (o.active) spin();
      pass.draw(model('valve'), ms.m, colorOf('KikiValve'));
      ms.translate(0, 0, 0.4);
      pass.draw(model('gear'), ms.m, colorOf('KikiGear'));
    } else {
      pass.draw(model('valve'), ms.m, colorOf('KikiValve'));
      spin();
    }
  }

  /** KikiBot::render: two tires and the body; a moving bot leaves fumes */
  private renderBot(C: KikiController, pass: Pass, b: KikiBot): void {
    const ms = this.ms;
    const radius = 0.5;
    const tireRadius = 0.15;
    const tire = b.died ? b.getDeadColor() : b.getTireColor();
    ms.quat(b.current_orientation);
    ms.push();
    ms.rotate(90, 0, 1, 0);
    ms.translate(0, 0, radius - tireRadius);
    ms.rotate(b.left_tire_rot * 180.0, 0, 0, 1);
    pass.draw(model('tire'), ms.m, tire);
    ms.pop();
    ms.push();
    ms.rotate(90, 0, 1, 0);
    ms.translate(0, 0, -(radius - tireRadius));
    ms.rotate(b.right_tire_rot * 180.0, 0, 0, 1);
    pass.draw(model('tire'), ms.m, tire);
    ms.pop();
    pass.draw(model('body'), ms.m, b.died ? tire : b.getBodyColor());
    b.emitFume();
    void C; void CAMERA_BEHIND;
  }

  // ........................................................................................ status
  private renderStatus(C: KikiController): void {
    const pass = this.statusPass;
    pass.begin();
    const p = statusProjection;
    this.useProjection(p);
    pass.lights.copyFrom(this.worldPass.lights);
    this.cameraLight(pass, p);
    const status = C.player_status.player_status!;
    if (!this.statusAtom) this.statusAtom = new KikiMovesAtom();
    const atom = this.statusAtom;
    const ms = this.ms;
    ms.identity(); // world coordinates: the view is the camera
    ms.translate(-p.getCurrentAspectRatio() * 10.0, -10.0, -30.0);
    ms.scale(4, 4, 4);
    atom.setValue((status.getMinMoves() - status.getMoves()) / 8.0);
    // KikiAtom::render: the nucleus and the neutrons on their orbits
    pass.draw(sphere(atom.nucleus_size / 2.0), ms.m, colorOf('KikiMovesAtom', 'base'));
    const neutron = colorOf('KikiMovesAtom', 'neutron');
    for (const n of atom.neutrons) {
      n.angle += C.getRelativeDelta() * 360.0;
      ms.push();
      ms.quat(n.orientation);
      ms.rotate(n.start_angle + n.angle, 0, 0, 1);
      ms.translate(0.4, 0, 0);
      pass.draw(sphere(0.1), ms.m, neutron);
      ms.pop();
    }
    ms.translate(0, 0.6, 0);
    const text = `${status.getMinMoves() - status.getMoves()} (${status.getMinMoves()})`;
    const lines = this.cellTextLines(text);
    const height = lines.reduce((h, l) => h + l.getHeight() + 4.0, 0);
    const factor = 0.25 / height;
    ms.scale(factor, factor, factor);
    for (const l of lines) this.drawLine(pass, l, textColor(base_color));
    this.renderer.render(pass.scene, this.camera);
  }

  private cellText = { text: '', lines: [] as KikiTextLine[] };
  /** KikiCellText::setText: a centred KikiText */
  private cellTextLines(text: string): KikiTextLine[] {
    if (this.cellText.text !== text) this.cellText = { text, lines: new KikiText(text).text_lines };
    return this.cellText.lines;
  }

  // ...................................................................................... overlays
  private renderOverlay(o: KikiScreenText, i: number): void {
    let pass = this.overlayPasses[i];
    if (!pass) { pass = new Pass(); this.overlayPasses[i] = pass; }
    pass.begin();
    const p = o.projection;
    this.useProjection(p);
    pass.lights.copyFrom(this.worldPass.lights);
    this.cameraLight(pass, p);
    const ms = this.ms;
    // KikiScreenText::display(int): a black rectangle behind the text, then the text
    ms.identity(); // world coordinates: the view is the camera
    ms.push();
    ms.translate(0, 0, -BEVEL_DEPTH);
    const w = o.getWidth();
    const h = o.getHeight();
    pass.draw(rect(-w * 0.6, -h * 0.7, w * 0.6, h * 0.7), ms.m, [0, 0, 0, o.fade_value * 0.5], { lit: false, depthWrite: false });
    ms.pop();
    for (const d of o.drawLines()) {
      ms.push();
      if (d.highlight) {
        ms.scale(1.0, 1.0, 2.0);
        ms.translate(0, 0, BEVEL_DEPTH);
      }
      this.drawLine(pass, d.line, d.color);
      ms.pop();
    }
    this.renderer.render(pass.scene, this.camera);
  }

  /** KikiTextLine::display */
  private drawLine(pass: Pass, line: KikiTextLine, color: KColor): void {
    const ms = this.ms;
    ms.push();
    ms.translateV(line.position);
    ms.scale(line.scale_factor, line.scale_factor, line.scale_factor);
    for (const ch of line.characters) {
      ms.push();
      ms.translateV(ch.position);
      const g = glyph(ch.character);
      if (g) pass.draw(g, ms.m, color, { vertexColor: true });
      if (ch.addon) {
        const a = glyph(57 + ch.addon);
        if (a) pass.draw(a, ms.m, color, { vertexColor: true });
      }
      ms.pop();
    }
    ms.pop();
  }
}

/** KikiStatusDisplay's projection: KLightingProjection (45.0, 0.1, 100.0) */
const statusProjection = new KikiProjection(45.0, 0.1, 100.0);

// KikiMutant is any bot that is not the player
const KikiMutant_ = KikiBot;
void KikiLight;
