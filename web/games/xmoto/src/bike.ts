// X-Moto's bike and rider (src/xmscene/BikePlayer.cpp PlayerLocalBiker, Bike.cpp BikeState/Biker,
// BikeAnchors.cpp, BikeParameters.cpp, BikeController.cpp, xmoto/SomersaultCounter.cpp), with the
// physics settings of bin/Physics/original.xml. float/double as in the C++ (see vmath.ts).
import { World, Body, Hinge, JointGroup, jointAttach, dMassSetSphereTotal, dMassSetBoxTotal,
  dParamLoStop, dParamHiStop, dParamStopERP, dParamStopCFM, type Contact } from './ode.ts';
import type { CollisionSystem } from './collision.ts';
import { f, v2, vadd, vsub, vmul, vlen, vnormalize, type Vec2 } from './vmath.ts';

/** bin/Physics/original.xml ("Classic"), every value a float like PhysicsSettings' members */
export const PHYS = {
  worldErp: f(0.3), worldCfm: f(0.000001), worldGravity: f(9.81), simulationSpeedFactor: f(0.6),
  simulationStepIterations: 10,
  bikeWheelRadius: f(0.35), bikeWheelBase: f(1.4), bikeWheelMass: f(10.0),
  bikeWheelRollResistance: f(1.0), bikeWheelRollResistanceMax: f(20.0), bikeWheelRollVelocityMax: f(60.0),
  bikeWheelErp: f(0.8), bikeWheelCfm: f(0.00001), bikeWheelBlockGrip: f(20.0),
  riderElbowX: f(-0.1), riderElbowY: f(0.6), riderHandX: f(0.3), riderHandY: f(0.45),
  riderShoulderX: f(-0.2), riderShoulderY: f(1.1), riderLowerbodyX: f(-0.3), riderLowerbodyY: f(0.4),
  riderKneeX: f(0.3), riderKneeY: f(0.2), riderFootX: f(0.0), riderFootY: f(-0.37),
  riderHeadSize: f(0.18), riderNeckLength: f(0.22),
  bikeRearSuspensionAnchorX: f(-0.11), bikeRearSuspensionAnchorY: f(-0.3),
  bikeFrontSuspensionAnchorX: f(0.4), bikeFrontSuspensionAnchorY: f(0.4),
  bikeSuspensionsSpring: f(21000), bikeSuspensionsDamp: f(205000),
  riderSpring: f(100000), riderDamp: f(300000),
  inertialLength: f(1.2), inertialHeight: f(1.8),
  riderAttitudeTorque: f(10000), riderAttitudeDefactor: f(0.75), massElevation: f(0.9),
  engineRpmMin: f(700), engineRpmMax: f(8000), enginePowerMax: f(1400), depthFactor: f(2.0),
  deadWheelDetachSpeed: f(40.0), bikeBrakeFactor: f(80.0), engineDamp: f(0.4), bikeFrameMass: f(90.0),
  riderTorsoMass: f(5.0), riderUpperlegMass: f(5.0), riderLowerlegMass: f(5.0), riderUpperarmMass: f(5.0),
  riderLowerarmMass: f(5.0), riderFootMass: f(5.0), riderHandMass: f(5.0),
  riderAnchorsErp: f(0.3), riderAnchorsCfm: f(0.03),
};
export type Phys = typeof PHYS;

/** PHYS_STEP_SIZE (Scene.h): hundredths of a second per physics update */
export const PHYS_STEP_SIZE = 1;

export const DD_RIGHT = 0, DD_LEFT = 1;

const PHYS_SLEEP_EPS = 0.02;
const PHYS_SLEEP_FRAMES = 20;
const PHYS_SUSP_SQUEEK_POINT = 0.01;

/** BikeAnchors::update */
class Anchors {
  Tp: Vec2; Rp: Vec2; Fp: Vec2; AR: Vec2; AR2: Vec2; AF: Vec2; AF2: Vec2;
  PLAp: Vec2; PLAp2: Vec2; PUAp: Vec2; PUAp2: Vec2; PLLp: Vec2; PLLp2: Vec2; PULp: Vec2; PULp2: Vec2;
  PTp: Vec2; PTp2: Vec2; PHp: Vec2; PHp2: Vec2; PFp: Vec2; PFp2: Vec2;
  constructor(p: Phys) {
    const half = (a: Vec2, b: Vec2): Vec2 => vmul(vadd(a, b), 0.5);
    this.Tp = v2(0, -p.massElevation);
    this.Rp = vadd(this.Tp, v2(f(-0.5 * p.bikeWheelBase), p.bikeWheelRadius));
    this.Fp = vadd(this.Tp, v2(f(0.5 * p.bikeWheelBase), p.bikeWheelRadius));
    this.AR = v2(p.bikeRearSuspensionAnchorX, p.bikeRearSuspensionAnchorY);
    this.AR2 = v2(-p.bikeRearSuspensionAnchorX, p.bikeRearSuspensionAnchorY);
    this.AF = v2(p.bikeFrontSuspensionAnchorX, p.bikeFrontSuspensionAnchorY);
    this.AF2 = v2(-p.bikeFrontSuspensionAnchorX, p.bikeFrontSuspensionAnchorY);
    const E = v2(p.riderElbowX, p.riderElbowY), E2 = v2(-p.riderElbowX, p.riderElbowY);
    const H = v2(p.riderHandX, p.riderHandY), H2 = v2(-p.riderHandX, p.riderHandY);
    const S = v2(p.riderShoulderX, p.riderShoulderY), S2 = v2(-p.riderShoulderX, p.riderShoulderY);
    const F = v2(p.riderFootX, p.riderFootY), F2 = v2(-p.riderFootX, p.riderFootY);
    const K = v2(p.riderKneeX, p.riderKneeY), K2 = v2(-p.riderKneeX, p.riderKneeY);
    const L = v2(p.riderLowerbodyX, p.riderLowerbodyY), L2 = v2(-p.riderLowerbodyX, p.riderLowerbodyY);
    this.PLAp = half(E, H); this.PLAp2 = half(E2, H2);
    this.PUAp = half(E, S); this.PUAp2 = half(E2, S2);
    this.PLLp = half(F, K); this.PLLp2 = half(F2, K2);
    this.PULp = half(L, K); this.PULp2 = half(L2, K2);
    this.PTp = half(L, S); this.PTp2 = half(L2, S2);
    this.PHp = H; this.PHp2 = H2;
    this.PFp = F; this.PFp2 = F2;
  }
}

const Z = (): Vec2 => ({ x: 0, y: 0 });

/** BikeState (Bike.h): what the renderer, the scene and the replays see */
export class BikeState {
  Dir = DD_RIGHT;
  fBikeEngineRPM = 0;
  RearWheelP = Z(); FrontWheelP = Z(); SwingAnchorP = Z(); FrontAnchorP = Z(); SwingAnchor2P = Z(); FrontAnchor2P = Z();
  CenterP = Z();
  fFrontWheelRot = [0, 0, 0, 0]; fRearWheelRot = [0, 0, 0, 0]; fFrameRot = [0, 0, 0, 0];
  WantedHandP = Z(); WantedFootP = Z(); WantedHand2P = Z(); WantedFoot2P = Z();
  HandP = Z(); ElbowP = Z(); ShoulderP = Z(); LowerBodyP = Z(); KneeP = Z(); FootP = Z(); HeadP = Z();
  Hand2P = Z(); Elbow2P = Z(); Shoulder2P = Z(); LowerBody2P = Z(); Knee2P = Z(); Foot2P = Z(); Head2P = Z();
  RRearWheelP = Z(); RFrontWheelP = Z();
  PrevRq = Z(); PrevFq = Z(); PrevPFq = Z(); PrevPHq = Z(); PrevPFq2 = Z(); PrevPHq2 = Z();
  GameTime = 0;
  anchors: Anchors;
  constructor(p: Phys) { this.anchors = new Anchors(p); }
}

/** BikeControllerPlayer */
export class BikeController {
  drive = 0; pull = 0; changeDir = false; throttle = 0; brake = 0;
  stopControls(): void { this.drive = 0; this.pull = 0; this.changeDir = false; this.throttle = 0; this.brake = 0; }
  setThrottle(v: number): void {
    this.throttle = f(v);
    if (this.throttle > 0) this.drive = this.throttle;
    else if (this.throttle === 0) this.drive = -this.brake;
  }
  setBreak(v: number): void {
    this.brake = f(v);
    if (this.brake > 0) this.drive = -this.brake;
    else if (this.brake === 0) this.drive = this.throttle;
  }
  setPull(v: number): void { this.pull = f(v); }
  setChangeDir(v: boolean): void { this.changeDir = v; }
}

/** SomersaultCounter */
export class SomersaultCounter {
  private lastInit = false; private last = 0; private min = 0; private max = 0; private cur = 0;
  clockwise = 0; counterClockwise = 0;
  update(angle: number): { done: boolean; counterclock: boolean } {
    if (!this.lastInit) { this.last = angle; this.lastInit = true; return { done: false, counterclock: false }; }
    const PI = f(3.14159);
    let diff = this.last - angle;
    if (diff >= PI / 2.0) diff -= 2.0 * PI;
    else if (diff <= -PI / 2.0) diff += 2.0 * PI;
    if (diff < 0.05 && diff > -0.05) return { done: false, counterclock: false };
    this.cur += diff;
    this.min = Math.min(this.cur, this.min);
    this.max = Math.max(this.cur, this.max);
    const res = this.max - this.min >= 2 * PI;
    let cc = false;
    if (res) {
      if (diff > 0.0) { this.clockwise++; cc = true; } else { this.counterClockwise++; cc = false; }
      this.min = 0; this.max = 0; this.cur = 0;
    }
    this.last = angle;
    return { done: res, counterclock: cc };
  }
}

export interface BikerHooks {
  onWheelTouches(wheel: number, touch: boolean): void;
  onHeadTouches(): void;
  onSomersaultDone(counterclock: boolean): void;
}

interface ExternalForce { start: number; end: number; force: Vec2 }

/** PlayerLocalBiker: the player's bike, simulated by ODE */
export class PlayerBiker {
  readonly p: Phys;
  state: BikeState;
  ctrl = new BikeController();
  hooks: BikerHooks | null = null;
  dead = false; deadTime = 0; finished = false; finishTime = 0;
  bodyDetach = false; wheelDetach = false;
  changeDirPer = 1.0;
  somersault = new SomersaultCounter();
  wheelSpin = false; wheelSpinPoint = Z(); wheelSpinDir = Z();
  squeeking = false; howMuchSqueek = 0;
  collisionPoints: Vec2[] = [];
  entitiesTouching: unknown[] = [];
  zonesTouching: unknown[] = [];

  private world!: World;
  private contacts!: JointGroup;
  private frontWheel!: Body; private rearWheel!: Body; private frame!: Body;
  private torso!: Body; private lleg!: Body; private uleg!: Body; private larm!: Body; private uarm!: Body; private footA!: Body; private handA!: Body;
  private torso2!: Body; private lleg2!: Body; private uleg2!: Body; private larm2!: Body; private uarm2!: Body; private footA2!: Body; private handA2!: Body;
  private knee!: Hinge; private lowerBody!: Hinge; private shoulder!: Hinge; private elbow!: Hinge; private foot!: Hinge; private hand!: Hinge;
  private knee2!: Hinge; private lowerBody2!: Hinge; private shoulder2!: Hinge; private elbow2!: Hinge; private foot2!: Hinge; private hand2!: Hinge;
  private firstPhysicsUpdate = true;
  private nStillFrames = 0;
  private clearDynamicTouched = false;
  private fAttitudeCon = 0;
  private fNextAttitudeCon = -1000;
  private fLastAttitudeDir = 0;
  private frontTouching = false;
  private rearTouching = false;
  private prevActiveHead = Z();
  private prevFrontWheelP = Z(); private prevRearWheelP = Z(); private prevHeadP = Z(); private prevHead2P = Z();
  private externalForces: ExternalForce[] = [];
  private nSlipFrameInterlace = 0;

  constructor(p: Phys, position: Vec2, dir: number, gravity: Vec2) {
    this.p = p;
    this.state = new BikeState(p);
    this.initPhysics(gravity);
    this.initToPosition(position, dir, gravity);
  }

  private initPhysics(g: Vec2): void {
    this.firstPhysicsUpdate = true;
    this.world = new World();
    this.world.globalErp = this.p.worldErp;
    this.world.globalCfm = this.p.worldCfm;
    this.world.setGravity(g.x, g.y, 0);
    this.contacts = new JointGroup();
    this.world.qsIterations = this.p.simulationStepIterations;
  }

  initToPosition(position: Vec2, dir: number, gravity: Vec2): void {
    // clearStates()
    const keepDir = this.state.Dir; void keepDir;
    this.state = new BikeState(this.p);
    if (!this.dead && !this.finished) this.ctrl.stopControls();
    this.fNextAttitudeCon = f(-1000.0);
    this.fAttitudeCon = 0;
    this.initPhysics(gravity);
    this.nStillFrames = 0;
    const C = vsub(position, this.state.anchors.Tp);
    this.prepareBikePhysics(C);
    this.setBodyDetach(false);
    this.state.Dir = dir;
    this.updateGameState();
  }

  resetAutoDisabler(): void { this.nStillFrames = 0; }
  isDead(): boolean { return this.dead; }
  isFinished(): boolean { return this.finished; }
  setDead(v: boolean, t = 0): void { this.dead = v; this.deadTime = t; }
  setFinished(v: boolean, t = 0): void { this.finished = v; this.finishTime = t; }

  getAngle(): number {
    let a = Math.acos(this.state.fFrameRot[0]);
    if (this.state.fFrameRot[2] < 0) a = 2 * f(3.14159) - a;
    return a;
  }

  addBodyForce(time: number, force: Vec2, startTime: number, endTime: number): void {
    this.externalForces.push({ start: time + startTime, end: endTime === 0 ? 0 : time + endTime, force: { x: force.x, y: force.y } });
  }

  /** PlayerLocalBiker::updateToTime (with Biker::updateToTime) */
  updateToTime(time: number, timeStep: number, col: CollisionSystem, gravity: Vec2): void {
    if (this.changeDirPer < 1.0) {
      this.changeDirPer = f(this.changeDirPer + (timeStep * 3.0) / 100.0);
      if (this.changeDirPer > 1.0) this.changeDirPer = 1.0;
    }
    if (this.finished) return;
    this.squeeking = false;
    this.updatePhysics(time, timeStep, col, gravity);
    this.updateGameState();
    if (this.dead) return;
    if (this.ctrl.changeDir) {
      this.ctrl.setChangeDir(false);
      this.state.Dir = this.state.Dir === DD_LEFT ? DD_RIGHT : DD_LEFT;
      this.changeDirPer = 0.0;
    }
    const s = this.somersault.update(this.getAngle());
    if (s.done && this.hooks) this.hooks.onSomersaultDone(s.counterclock);
  }

  private determineForceToAdd(time: number): Vec2 {
    let res = v2(0, 0);
    for (const e of this.externalForces) {
      if (e.start <= time && (e.end >= time || e.end === 0)) res = vadd(res, e.force);
    }
    let i = 0;
    while (i < this.externalForces.length) {
      const e = this.externalForces[i];
      if (e.end < time && e.end !== 0) this.externalForces.splice(i, 1);
      i++;
    }
    return res;
  }

  private updatePhysics(time: number, timeStep: number, col: CollisionSystem, gravity: Vec2): void {
    const p = this.p, st = this.state;
    this.wheelSpin = false;
    this.collisionPoints = [];
    this.world.setGravity(gravity.x, gravity.y, 0);

    const pfFront = this.frontWheel.lvel, pfRear = this.rearWheel.lvel, pfFrame = this.frame.lvel;
    if (Math.abs(pfFront[0]) < PHYS_SLEEP_EPS && Math.abs(pfFront[1]) < PHYS_SLEEP_EPS &&
      Math.abs(pfRear[0]) < PHYS_SLEEP_EPS && Math.abs(pfRear[1]) < PHYS_SLEEP_EPS &&
      Math.abs(pfFrame[0]) < PHYS_SLEEP_EPS && Math.abs(pfFrame[1]) < PHYS_SLEEP_EPS) {
      this.nStillFrames++;
    } else {
      this.nStillFrames = 0;
    }
    let bSleep = false;
    if (this.nStillFrames > PHYS_SLEEP_FRAMES && !this.clearDynamicTouched) {
      bSleep = true;
      this.frontWheel.disable(); this.rearWheel.disable(); this.frame.disable();
    } else {
      if (!this.frontWheel.isEnabled()) this.frontWheel.enable();
      if (!this.rearWheel.isEnabled()) this.rearWheel.enable();
      if (!this.frame.isEnabled()) this.frame.enable();
    }

    const force = this.determineForceToAdd(time);
    if (force.x !== 0 || force.y !== 0) {
      this.nStillFrames = 0;
      this.frame.enable();
      this.frame.addForce(force.x, force.y, 0.0);
    }

    if (!bSleep) {
      const Fq = vsub(st.RFrontWheelP, st.FrontWheelP);
      const Fqv = vsub(Fq, st.PrevFq);
      const FTotal = vadd(vmul(Fq, p.bikeSuspensionsSpring), vmul(Fqv, p.bikeSuspensionsDamp));
      if (this.wheelDetach === false || st.Dir === DD_LEFT) {
        this.frontWheel.addForce(FTotal.x, FTotal.y, 0);
        this.frame.addForceAtPos(-FTotal.x, -FTotal.y, 0, st.RFrontWheelP.x, st.RFrontWheelP.y, 0);
      }
      st.PrevFq = Fq;
      const Rq = vsub(st.RRearWheelP, st.RearWheelP);
      const Rqv = vsub(Rq, st.PrevRq);
      const RTotal = vadd(vmul(Rq, p.bikeSuspensionsSpring), vmul(Rqv, p.bikeSuspensionsDamp));
      if (this.wheelDetach === false || st.Dir === DD_RIGHT) {
        this.rearWheel.addForce(RTotal.x, RTotal.y, 0);
        this.frame.addForceAtPos(-RTotal.x, -RTotal.y, 0, st.RRearWheelP.x, st.RRearWheelP.y, 0);
      }
      st.PrevRq = Rq;
      const lf = vlen(Fqv), lr = vlen(Rqv);
      if (lf > PHYS_SUSP_SQUEEK_POINT || lr > PHYS_SUSP_SQUEEK_POINT) {
        const s1 = f(lf - PHYS_SUSP_SQUEEK_POINT), s2 = f(lr - PHYS_SUSP_SQUEEK_POINT);
        const s = s1 > s2 ? s1 : s2;
        let l = f(s / f(0.11));
        if (l > 1) l = 1;
        this.howMuchSqueek = l;
        this.squeeking = true;
      }
    }

    // attitude control
    const ctrl = this.ctrl;
    if (!this.dead && !this.finished) {
      if (ctrl.pull !== 0 && (time / 100.0 > this.fNextAttitudeCon || f(ctrl.pull * this.fLastAttitudeDir) < 0)) {
        this.fAttitudeCon = f(ctrl.pull * p.riderAttitudeTorque);
        this.fLastAttitudeDir = this.fAttitudeCon;
        this.fNextAttitudeCon = f(time / 100.0 + f(f(0.6) * Math.abs(ctrl.pull)));
      }
    }
    if (this.fAttitudeCon !== 0) {
      this.nStillFrames = 0;
      this.frontWheel.enable(); this.rearWheel.enable(); this.frame.enable();
      this.frame.addTorque(0, 0, this.fAttitudeCon);
    }
    this.fAttitudeCon = f(this.fAttitudeCon * p.riderAttitudeDefactor);
    if (Math.abs(this.fAttitudeCon) < 100) this.fAttitudeCon = 0;

    const fRearAV = f(this.rearWheel.avel[2]);
    const fFrontAV = f(this.frontWheel.avel[2]);

    if (!bSleep) {
      const vmax = p.bikeWheelRollVelocityMax;
      if (fRearAV > -vmax && fRearAV < vmax) this.rearWheel.addTorque(0, 0, -this.rearWheel.avel[2] * p.bikeWheelRollResistance);
      else this.rearWheel.addTorque(0, 0, -this.rearWheel.avel[2] * p.bikeWheelRollResistanceMax);
      if (fFrontAV > -vmax && fFrontAV < vmax) this.frontWheel.addTorque(0, 0, -this.frontWheel.avel[2] * p.bikeWheelRollResistance);
      else this.frontWheel.addTorque(0, 0, -this.frontWheel.avel[2] * p.bikeWheelRollResistanceMax);
    }

    // RPM
    if (!this.dead && !this.finished) {
      let fv = st.Dir === DD_RIGHT ? -fRearAV : fFrontAV;
      if (fv < 0) fv = 0;
      let rpm = f(p.engineRpmMin + f(f(f(p.engineRpmMax - p.engineRpmMin) * f(fv / p.bikeWheelRollVelocityMax)) * ctrl.drive));
      if (rpm < p.engineRpmMin) rpm = p.engineRpmMin;
      if (rpm > p.engineRpmMax) rpm = p.engineRpmMax;
      st.fBikeEngineRPM = rpm;
    }

    // motor / brake
    if (!this.dead && !this.finished) {
      if (ctrl.drive < 0) {
        if (!bSleep) {
          this.rearWheel.addTorque(0, 0, this.rearWheel.avel[2] * p.bikeBrakeFactor * ctrl.drive);
          this.frontWheel.addTorque(0, 0, this.frontWheel.avel[2] * p.bikeBrakeFactor * ctrl.drive);
        }
      } else if (ctrl.drive > 0) {
        const engine = f(f(f(-p.enginePowerMax) * p.engineDamp) * ctrl.drive);
        if (st.Dir === DD_RIGHT) {
          if (fRearAV > -p.bikeWheelRollVelocityMax) {
            this.nStillFrames = 0;
            this.frontWheel.enable(); this.rearWheel.enable(); this.frame.enable();
            this.rearWheel.addTorque(0, 0, engine);
          }
        } else if (fFrontAV < p.bikeWheelRollVelocityMax) {
          this.nStillFrames = 0;
          this.frontWheel.enable(); this.rearWheel.enable(); this.frame.enable();
          this.frontWheel.addTorque(0, 0, f(f(p.enginePowerMax * p.engineDamp) * ctrl.drive));
        }
      }
    }

    // collisions with the level
    col.clearDynamicTouched();
    const contacts: Contact[] = [];
    this.nSlipFrameInterlace++;

    let n = this.intersectWheelLevel(st.FrontWheelP, p.bikeWheelRadius, contacts, col);
    if (n > 0) {
      if (!this.frontTouching) { this.frontTouching = true; this.hooks?.onWheelTouches(1, true); }
    } else if (this.frontTouching) { this.frontTouching = false; this.hooks?.onWheelTouches(1, false); }
    if (col.isDynamicTouched()) { this.enableBike(); }
    if (this.frontWheel.isEnabled()) {
      let WSP = Z();
      for (let i = 0; i < n; i++) {
        jointAttach(this.world.createContact(this.contacts, contacts[i]), this.frontWheel, null);
        WSP = v2(contacts[i].geom.pos[0], contacts[i].geom.pos[1]);
        this.collisionPoints.push(WSP);
      }
      if (st.Dir === DD_LEFT && !this.dead && !this.finished) {
        if (Math.abs(fFrontAV) > 5 && ctrl.drive > 0 && n > 0) {
          this.wheelSpin = true;
          this.wheelSpinPoint = WSP;
          this.wheelSpinDir = v2(f(f(f(st.FrontWheelP.y - WSP.y) * 1) + f(st.FrontWheelP.x - WSP.x)) / 2,
            f(f(-f(st.FrontWheelP.x - WSP.x) * 1) + f(st.FrontWheelP.y - WSP.y)) / 2);
        }
      }
    }

    n = this.intersectWheelLevel(st.RearWheelP, p.bikeWheelRadius, contacts, col);
    if (n > 0) {
      if (!this.rearTouching) { this.rearTouching = true; this.hooks?.onWheelTouches(2, true); }
    } else if (this.rearTouching) { this.rearTouching = false; this.hooks?.onWheelTouches(2, false); }
    if (col.isDynamicTouched()) { this.enableBike(); }
    if (this.rearWheel.isEnabled()) {
      let WSP = Z();
      for (let i = 0; i < n; i++) {
        jointAttach(this.world.createContact(this.contacts, contacts[i]), this.rearWheel, null);
        WSP = v2(contacts[i].geom.pos[0], contacts[i].geom.pos[1]);
        this.collisionPoints.push(WSP);
      }
      if (st.Dir === DD_RIGHT && !this.dead && !this.finished) {
        if (Math.abs(fRearAV) > 5 && ctrl.drive > 0 && n > 0) {
          this.wheelSpin = true;
          this.wheelSpinPoint = WSP;
          this.wheelSpinDir = v2(f(f(-f(st.RearWheelP.y - WSP.y) * 1) + f(st.RearWheelP.x - WSP.x)) / 2,
            f(f(f(st.RearWheelP.x - WSP.x) * 1) + f(st.RearWheelP.y - WSP.y)) / 2);
        }
      }
    }

    // the detached body touching the level
    if (this.bodyDetach) {
      const R = st.Dir === DD_RIGHT;
      const memberRay = f(0.1), grip = f(0.8);
      const touch = (P: Vec2, a: Body, b: Body | null): void => {
        const k = col.collideCircle(P.x, P.y, memberRay, contacts, 100, p);
        for (let i = 0; i < k; i++) {
          contacts[i].mu = grip;
          jointAttach(this.world.createContact(this.contacts, contacts[i]), a, null);
          if (b) jointAttach(this.world.createContact(this.contacts, contacts[i]), b, null);
          this.collisionPoints.push(v2(contacts[i].geom.pos[0], contacts[i].geom.pos[1]));
        }
      };
      touch(R ? st.ShoulderP : st.Shoulder2P, R ? this.torso : this.torso2, R ? this.uarm : this.uarm2);
      touch(R ? st.LowerBodyP : st.LowerBody2P, R ? this.torso : this.torso2, R ? this.uleg : this.uleg2);
      touch(R ? st.ElbowP : st.Elbow2P, R ? this.uarm : this.uarm2, R ? this.larm : this.larm2);
      touch(R ? st.HandP : st.Hand2P, R ? this.larm : this.larm2, null);
      touch(R ? st.KneeP : st.Knee2P, R ? this.uleg : this.uleg2, R ? this.lleg : this.lleg2);
      touch(R ? st.FootP : st.Foot2P, R ? this.lleg : this.lleg2, null);
    }

    // the head
    const head = st.Dir === DD_RIGHT ? st.HeadP : st.Head2P;
    if (this.intersectHeadLevel(head, p.riderHeadSize, this.prevActiveHead, col)) this.hooks?.onHeadTouches();
    this.prevActiveHead = head;

    this.prevFrontWheelP = st.FrontWheelP;
    this.prevRearWheelP = st.RearWheelP;
    this.prevHeadP = st.HeadP;
    this.prevHead2P = st.Head2P;

    // the rider follows the bike: springs on the hand and foot anchors
    const spring = (want: Vec2, cur: Vec2, prev: Vec2, body: Body): Vec2 => {
      const q = vsub(want, cur);
      const qv = vsub(q, prev);
      const tot = vadd(vmul(q, p.riderSpring), vmul(qv, p.riderDamp));
      if (!this.bodyDetach) body.addForce(tot.x, tot.y, 0);
      return q;
    };
    st.PrevPFq = spring(st.WantedFootP, st.FootP, st.PrevPFq, this.footA);
    st.PrevPHq = spring(st.WantedHandP, st.HandP, st.PrevPHq, this.handA);
    st.PrevPFq2 = spring(st.WantedFoot2P, st.Foot2P, st.PrevPFq2, this.footA2);
    st.PrevPHq2 = spring(st.WantedHand2P, st.Hand2P, st.PrevPHq2, this.handA2);

    this.world.quickStep((f(timeStep) / 100.0) * p.simulationSpeedFactor);
    this.contacts.empty();
    this.clearDynamicTouched = col.isDynamicTouched();
    this.firstPhysicsUpdate = false;
  }

  private enableBike(): void {
    if (!this.frontWheel.isEnabled()) this.frontWheel.enable();
    if (!this.rearWheel.isEnabled()) this.rearWheel.enable();
    if (!this.frame.isEnabled()) this.frame.enable();
  }

  private intersectHeadLevel(Cp: Vec2, Cr: number, lastCp: Vec2, col: CollisionSystem): boolean {
    if (col.checkCircle(Cp.x, Cp.y, Cr)) return true;
    if (!this.firstPhysicsUpdate) {
      const c: Contact[] = [];
      if (col.collideLine(lastCp.x, lastCp.y, Cp.x, Cp.y, c, 100, this.p) > 0) return true;
    }
    return false;
  }

  private intersectWheelLevel(Cp: Vec2, Cr: number, out: Contact[], col: CollisionSystem): number {
    const n = col.collideCircle(Cp.x, Cp.y, Cr, out, 100, this.p);
    if (n > 0 && this.dead && this.getBikeLinearVel() > this.p.deadWheelDetachSpeed) this.wheelDetach = true;
    return n;
  }

  getBikeLinearVel(): number {
    const cur = vadd(this.state.RearWheelP, this.state.FrontWheelP);
    const last = vadd(this.prevRearWheelP, this.prevFrontWheelP);
    const d = vsub(cur, last);
    const speed = f((3.6 * 100 * f(Math.sqrt(f(f(d.x * d.x) + f(d.y * d.y))))) / PHYS_STEP_SIZE);
    return speed > 500 ? 0 : speed;
  }
  getBikeEngineSpeed(): number {
    const av = f(this.state.Dir === DD_RIGHT ? this.rearWheel.avel[2] : this.frontWheel.avel[2]);
    const s = f(av * this.p.bikeWheelRadius * 3.6);
    return s >= 0 ? s : -s;
  }
  getTorsoVelocity(): number {
    const cur = this.state.Dir === DD_RIGHT ? this.state.HeadP : this.state.Head2P;
    const last = this.state.Dir === DD_RIGHT ? this.prevHeadP : this.prevHead2P;
    const d = vsub(cur, last);
    const speed = f((3.6 * 100 * f(Math.sqrt(f(f(d.x * d.x) + f(d.y * d.y))))) / PHYS_STEP_SIZE);
    return speed > 500 ? 0 : speed;
  }
  getRearWheelVelocity(): number { return f(this.rearWheel.avel[2]); }
  getFrontWheelVelocity(): number { return f(this.frontWheel.avel[2]); }

  /** PlayerLocalBiker::updateGameState */
  updateGameState(): void {
    const st = this.state, a = st.anchors;
    st.RearWheelP = v2(this.rearWheel.pos[0], this.rearWheel.pos[1]);
    st.FrontWheelP = v2(this.frontWheel.pos[0], this.frontWheel.pos[1]);
    st.CenterP = v2(this.frame.pos[0], this.frame.pos[1]);
    const rot = (b: Body): number[] => [f(b.R[0]), f(b.R[1]), f(b.R[4]), f(b.R[5])];
    st.fFrameRot = rot(this.frame);
    st.fFrontWheelRot = rot(this.frontWheel);
    st.fRearWheelRot = rot(this.rearWheel);
    const R = st.fFrameRot;
    const tr = (P: Vec2): Vec2 => v2(f(f(f(P.x * R[0]) + f(P.y * R[1])) + st.CenterP.x), f(f(f(P.x * R[2]) + f(P.y * R[3])) + st.CenterP.y));
    st.SwingAnchorP = tr(a.AR);
    st.SwingAnchor2P = tr(a.AR2);
    st.FrontAnchorP = tr(a.AF);
    st.FrontAnchor2P = tr(a.AF2);
    st.WantedFootP = tr(a.PFp);
    st.WantedHandP = tr(a.PHp);
    st.WantedFoot2P = tr(a.PFp2);
    st.WantedHand2P = tr(a.PHp2);
    const T = new Float64Array(4);
    const anchor = (h: Hinge): Vec2 => { h.getAnchor(T); return v2(T[0], T[1]); };
    st.HandP = anchor(this.hand);
    st.ElbowP = anchor(this.elbow);
    st.ShoulderP = anchor(this.shoulder);
    st.LowerBodyP = anchor(this.lowerBody);
    st.KneeP = anchor(this.knee);
    st.FootP = anchor(this.foot);
    st.Hand2P = anchor(this.hand2);
    st.Elbow2P = anchor(this.elbow2);
    st.Shoulder2P = anchor(this.shoulder2);
    st.LowerBody2P = anchor(this.lowerBody2);
    st.Knee2P = anchor(this.knee2);
    st.Foot2P = anchor(this.foot2);
    let V = vsub(st.ShoulderP, st.LowerBodyP);
    vnormalize(V);
    st.HeadP = vadd(st.ShoulderP, vmul(V, this.p.riderNeckLength));
    V = vsub(st.Shoulder2P, st.LowerBody2P);
    vnormalize(V);
    st.Head2P = vadd(st.Shoulder2P, vmul(V, this.p.riderNeckLength));
    st.RFrontWheelP = tr(a.Fp);
    st.RRearWheelP = tr(a.Rp);
  }

  private body(pos: Vec2, start: Vec2, mass: { mass: number; I: Float64Array }): Body {
    const b = this.world.createBody();
    b.setPosition(f(start.x + pos.x), f(start.y + pos.y), 0.0);
    b.setMass(mass);
    b.setFiniteRotationMode(1);
    b.setFiniteRotationAxis(0, 0, 1);
    return b;
  }

  private prepareBikePhysics(S: Vec2): void {
    const p = this.p, a = this.state.anchors;
    this.frontWheel = this.world.createBody();
    this.rearWheel = this.world.createBody();
    this.frame = this.world.createBody();
    const wheel = dMassSetSphereTotal(p.bikeWheelMass, p.bikeWheelRadius);
    const place = (b: Body, pos: Vec2, m: { mass: number; I: Float64Array }): void => {
      b.setPosition(f(S.x + pos.x), f(S.y + pos.y), 0.0);
      b.setMass(m);
      b.setFiniteRotationMode(1);
      b.setFiniteRotationAxis(0, 0, 1);
    };
    place(this.rearWheel, a.Rp, wheel);
    place(this.frontWheel, a.Fp, wheel);
    place(this.frame, v2(0, 0), dMassSetBoxTotal(p.bikeFrameMass, p.inertialLength, p.inertialHeight, p.depthFactor));
    // the frame is placed at StartPos itself
    this.frame.setPosition(S.x, S.y, 0.0);
    this.prepareRider(S);
  }

  private prepareRider(S: Vec2): void {
    const p = this.p, a = this.state.anchors;
    const sphere = (m: number) => dMassSetSphereTotal(m, 0.4);
    this.torso = this.body(a.PTp, S, sphere(p.riderTorsoMass));
    this.lleg = this.body(a.PLLp, S, sphere(p.riderLowerlegMass));
    this.uleg = this.body(a.PULp, S, sphere(p.riderUpperlegMass));
    this.larm = this.body(a.PLAp, S, sphere(p.riderLowerarmMass));
    this.uarm = this.body(a.PUAp, S, sphere(p.riderUpperarmMass));
    this.footA = this.body(a.PFp, S, sphere(p.riderFootMass));
    this.handA = this.body(a.PHp, S, sphere(p.riderHandMass));
    this.torso2 = this.body(a.PTp2, S, sphere(p.riderTorsoMass));
    this.lleg2 = this.body(a.PLLp2, S, sphere(p.riderLowerlegMass));
    this.uleg2 = this.body(a.PULp2, S, sphere(p.riderUpperlegMass));
    this.larm2 = this.body(a.PLAp2, S, sphere(p.riderLowerarmMass));
    this.uarm2 = this.body(a.PUAp2, S, sphere(p.riderUpperarmMass));
    this.footA2 = this.body(a.PFp2, S, sphere(p.riderFootMass));
    this.handA2 = this.body(a.PHp2, S, sphere(p.riderHandMass));

    const erp = p.riderAnchorsErp, cfm = p.riderAnchorsCfm;
    const hinge = (b1: Body, b2: Body, x: number, y: number): Hinge => {
      const h = this.world.createHinge();
      jointAttach(h, b1, b2);
      h.setAnchor(f(x), f(y), 0.0);
      h.setAxis(0, 0, 1);
      h.setParam(dParamLoStop, 0);
      h.setParam(dParamHiStop, 0);
      h.setParam(dParamStopERP, erp);
      h.setParam(dParamStopCFM, cfm);
      return h;
    };
    this.knee = hinge(this.lleg, this.uleg, S.x + p.riderKneeX, S.y + p.riderKneeY);
    this.lowerBody = hinge(this.uleg, this.torso, S.x + p.riderLowerbodyX, S.y + p.riderLowerbodyY);
    this.shoulder = hinge(this.torso, this.uarm, S.x + p.riderShoulderX, S.y + p.riderShoulderY);
    this.elbow = hinge(this.uarm, this.larm, S.x + p.riderElbowX, S.y + p.riderElbowY);
    this.foot = hinge(this.footA, this.lleg, S.x + p.riderFootX, S.y + p.riderFootY);
    this.hand = hinge(this.larm, this.handA, S.x + p.riderHandX, S.y + p.riderHandY);
    this.knee2 = hinge(this.lleg2, this.uleg2, S.x - p.riderKneeX, S.y + p.riderKneeY);
    this.lowerBody2 = hinge(this.uleg2, this.torso2, S.x - p.riderLowerbodyX, S.y + p.riderLowerbodyY);
    this.shoulder2 = hinge(this.torso2, this.uarm2, S.x - p.riderShoulderX, S.y + p.riderShoulderY);
    this.elbow2 = hinge(this.uarm2, this.larm2, S.x - p.riderElbowX, S.y + p.riderElbowY);
    this.foot2 = hinge(this.footA2, this.lleg2, S.x - p.riderFootX, S.y + p.riderFootY);
    this.hand2 = hinge(this.larm2, this.handA2, S.x - p.riderHandX, S.y + p.riderHandY);
  }

  setBodyDetach(state: boolean): void {
    this.nStillFrames = 0;
    this.bodyDetach = state;
    if (this.bodyDetach) {
      const P = 3.14159;
      const set = (h: Hinge, lo: number, hi: number, cfm: number): void => {
        h.setParam(dParamLoStop, lo); h.setParam(dParamHiStop, hi); h.setParam(dParamStopCFM, cfm);
      };
      this.knee.setParam(dParamLoStop, 0.0); this.knee.setParam(dParamHiStop, P / 2.0);
      this.knee2.setParam(dParamLoStop, P / 2.0 * -1.0); this.knee2.setParam(dParamHiStop, 0.0 * -1.0);
      this.knee.setParam(dParamStopCFM, 0.2); this.knee2.setParam(dParamStopCFM, 0.2);
      set(this.lowerBody, -1.4, -1.2, 0.2); set(this.lowerBody2, -1.2 * -1.0, -1.4 * -1.0, 0.2);
      set(this.shoulder, -1.9, 0.8, 0.2); set(this.shoulder2, 0.8 * -1.0, -1.9 * -1.0, 0.2);
      set(this.elbow, -1.5, 1.0, 0.2); set(this.elbow2, 1.0 * -1.0, -1.5 * -1.0, 0.2);
    }
  }

  /** for the tests: the ODE bodies' raw state */
  debugBodies(): Body[] {
    return [this.frontWheel, this.rearWheel, this.frame, this.torso, this.lleg, this.uleg, this.larm, this.uarm, this.footA, this.handA,
      this.torso2, this.lleg2, this.uleg2, this.larm2, this.uarm2, this.footA2, this.handA2];
  }
}
