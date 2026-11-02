// Tux's motion, translated from src/phys_sim.c, src/nmrcl.c and the parts of src/alglib.c it uses.
// The integration is the original's adaptive ode23 solver with its own tolerances and time-step
// limits; every force, constant and rounding step is kept, so the same course, seed and controls
// move Tux the same way.
import { Course, compressionFor, type Terrain } from './course.ts';
import {
  add, changeOfBasis, cloneVec, cross, distanceToPlane, dot, EPS, interpolateQuaternions, movePoint, normalize,
  projectIntoPlane, quatFromMatrix, rotateVector, rotationAboutVector, rotationMatrix, scale,
  transformVector, vec,
  type Plane, type Point3, type Quat, type Vec3,
} from './math3.ts';

const TUX_MASS = 20;
const TUX_WIDTH = 0.45;
const MIN_TUX_SPEED = 1.4;
const MIN_FRICTION_SPEED = 2.8;
const INIT_TUX_SPEED = 3.0;
const MAX_FRICTIONAL_FORCE = 800;
const MAX_TURN_ANGLE = 45;
const MAX_TURN_PERPENDICULAR_FORCE = 400;
const MAX_TURN_PENALTY = 0.15;
const BRAKE_FORCE = 200;
const MAX_ROLL_ANGLE = 30;
const BRAKING_ROLL_ANGLE = 55;
const IDEAL_ROLL_FRIC_COEFF = 0.35;
const IDEAL_ROLL_SPEED = 6.0;
const TUX_ORIENTATION_TIME_CONSTANT = 0.14;
const TUX_ORIENTATION_AIRBORNE_TIME_CONSTANT = 0.5;
const TUX_GLUTE_STAGE_1_COMPRESSIBILITY = 0.05;
const TUX_GLUTE_STAGE_1_SPRING_COEFF = 1500;
const TUX_GLUTE_STAGE_2_COMPRESSIBILITY = 0.12;
const TUX_GLUTE_STAGE_2_SPRING_COEFF = 3000;
const TUX_GLUTE_STAGE_2_DAMPING_COEFF = 500;
const TUX_GLUTE_STAGE_3_SPRING_COEFF = 10000;
const TUX_GLUTE_STAGE_3_DAMPING_COEFF = 1000;
const TUX_GLUTE_MAX_SPRING_FORCE = 3000;
const MAX_SURFACE_PENETRATION = 0.2;
const AIR_DENSITY = 1.308;
const TUX_DIAMETER = TUX_WIDTH;
const AIR_VISCOSITY = 17.0e-6;
const airLogRe = [-1, 0, 1, 2, 3, 4, 5, 6];
const airLogDrag = [2.25, 1.35, 0.6, 0.0, -0.35, -0.45, -0.33, -0.9];
const MIN_TIME_STEP = 0.01;
const MAX_TIME_STEP = 0.10;
const MAX_STEP_DISTANCE = 0.20;
const MAX_POSITION_ERROR = 0.005;
const MAX_VELOCITY_ERROR = 0.05;
const COLLISION_TOLERANCE = 0.04;
const PADDLING_DURATION = 0.40;
const MAX_PADDLING_FORCE = 122.5;
const IDEAL_PADDLING_FRIC_COEFF = 0.35;
const BASE_JUMP_G_FORCE = 1.5;
const MAX_JUMP_G_FORCE = 3;
const MAX_PADDLING_SPEED = 60.0 / 3.6;
const JUMP_FORCE_DURATION = 0.20;
const GRAV = 9.81;

const ode23CoeffMat = [
  [0, 1 / 2, 0, 2 / 9],
  [0, 0, 3 / 4, 1 / 3],
  [0, 0, 0, 4 / 9],
  [0, 0, 0, 0],
];
const ode23ErrorMat = [-5 / 72, 1 / 12, 1 / 9, -1 / 8];
const ode23TimeStepExp = 1 / 3;

export interface Control {
  turnFact: number;
  turnAnimation: number;
  isBraking: boolean;
  isPaddling: boolean;
  paddleTime: number;
  beginJump: boolean;
  jumping: boolean;
  jumpCharging: boolean;
  jumpAmt: number;
  jumpStartTime: number;
  barrelRollLeft: boolean;
  barrelRollRight: boolean;
  barrelRollFactor: number;
  frontFlip: boolean;
  backFlip: boolean;
  flipFactor: number;
}

export interface Player {
  name: string;
  lives: number;
  pos: Point3;
  vel: Vec3;
  orientation: Quat;
  orientationInitialized: boolean;
  planeNml: Vec3;
  direction: Vec3;
  netForce: Vec3;
  normalForce: Vec3;
  airborne: boolean;
  collision: boolean;
  control: Control;
  herring: number;
  score: number;
  health: number;
}

export function newPlayer(): Player {
  return {
    name: 'Tux', lives: 0,
    pos: { x: 0, y: 0, z: 0 }, vel: vec(0, 0, 0),
    orientation: { x: 0, y: 0, z: 0, w: 1 }, orientationInitialized: false,
    planeNml: vec(0, 1, 0), direction: vec(0, 0, -1),
    netForce: vec(0, 0, 0), normalForce: vec(0, 0, 0),
    airborne: false, collision: false, herring: 0, score: 0, health: 1,
    control: {
      turnFact: 0, turnAnimation: 0, isBraking: false, isPaddling: false, paddleTime: 0,
      beginJump: false, jumping: false, jumpCharging: false, jumpAmt: 0, jumpStartTime: 0,
      barrelRollLeft: false, barrelRollRight: false, barrelRollFactor: 0,
      frontFlip: false, backFlip: false, flipFactor: 0,
    },
  };
}

interface OdeData {
  initVal: number;
  h: number;
  k: number[];
}

const newOde = (): OdeData => ({ initVal: 0, h: 0, k: [0, 0, 0, 0] });
const odeInit = (d: OdeData, initVal: number, h: number) => { d.initVal = initVal; d.h = h; };
const odeNextVal = (d: OdeData, step: number): number => {
  let val = d.initVal;
  for (let i = 0; i < step; i++) val += ode23CoeffMat[i][step] * d.k[i];
  return val;
};
const odeUpdate = (d: OdeData, step: number, val: number) => { d.k[step] = d.h * val; };
const odeFinal = (d: OdeData): number => {
  let val = d.initVal;
  for (let i = 0; i < 3; i++) val += ode23CoeffMat[i][3] * d.k[i];
  return val;
};
const odeError = (d: OdeData): number => {
  let err = 0;
  for (let i = 0; i < 4; i++) err += ode23ErrorMat[i] * d.k[i];
  return Math.abs(err);
};
const adjustTimeStep = (h: number, vel: Vec3): number => {
  const speed = normalized(vel).length;
  h = Math.max(h, MIN_TIME_STEP);
  h = Math.min(h, MAX_STEP_DISTANCE / speed);
  h = Math.min(h, MAX_TIME_STEP);
  return h;
};

/** A race condition: the original's g_game.race.windy and the random walk it drives. */
export class Physics {
  readonly course: Course;
  readonly player: Player;
  readonly random: () => number;
  windy = false;
  time = 0;
  /** set when Tux has passed the end of the play area (the original's GAME_OVER) */
  finished = false;
  /** the speed passed to adjust_tux_joints() this frame (m/s) */
  speed = 0;
  onSound: (name: string) => void = () => {};
  onTreeHit: (tree: { x: number; z: number; diam: number }) => void = () => {};

  private odeTimeStep = -1;
  private windScale = 0.5;
  private lastWindTime = -1;
  private lastCollision = false;
  private lastCollisionTree = { x: -999, y: -999, z: -999 };
  private lastCollisionDiam = 0;
  private lastCollisionPos = { x: -999, y: -999, z: -999 };
  private lastItemPos = { x: -999, y: -999, z: -999 };

  constructor(course: Course, random: () => number = Math.random) {
    this.course = course;
    this.player = newPlayer();
    this.random = random;
  }

  get minTuxSpeed(): number { return MIN_TUX_SPEED; }

  /** src/phys_sim.c init_physical_simulation() */
  init(at?: { x: number; z: number }): void {
    const plyr = this.player;
    const start = at ?? { x: this.course.startX, z: -this.course.cfg.startY };
    plyr.pos = { x: start.x, y: this.course.findY(start.x, start.z), z: start.z };
    const nml = this.course.findNormal(start.x, start.z);
    const rot = rotationMatrix(-90, 'x');
    const v = transformVector(rot, nml);
    normalize(v);
    plyr.vel = scale(INIT_TUX_SPEED, v);
    plyr.netForce = vec(0, 0, 0);
    plyr.control.turnFact = 0;
    plyr.control.turnAnimation = 0;
    plyr.control.barrelRollFactor = 0;
    plyr.control.flipFactor = 0;
    plyr.control.isBraking = false;
    plyr.orientationInitialized = false;
    plyr.planeNml = nml;
    plyr.direction = cloneVec(plyr.vel);
    plyr.normalForce = vec(0, 0, 0);
    plyr.airborne = false;
    plyr.collision = false;
    plyr.control.jumpAmt = 0;
    plyr.control.isPaddling = false;
    plyr.control.jumping = false;
    plyr.control.jumpCharging = false;
    plyr.control.barrelRollLeft = false;
    plyr.control.barrelRollRight = false;
    plyr.control.barrelRollFactor = 0;
    plyr.control.frontFlip = false;
    plyr.control.backFlip = false;
    this.odeTimeStep = -1;
    this.finished = false;
    this.lastCollision = false;
    this.lastCollisionPos = { x: -999, y: -999, z: -999 };
    this.lastItemPos = { x: -999, y: -999, z: -999 };
  }

  incrementTurnFact(amt: number): void {
    const c = this.player.control;
    c.turnFact = Math.min(1, Math.max(c.turnFact + amt, -1));
  }

  /** src/phys_sim.c update_player_pos() */
  update(dtime: number): void {
    const plyr = this.player;
    if (dtime > 2 * EPS) this.solveOde(dtime);

    const tmpVel = cloneVec(plyr.vel);
    const surfPlane = this.course.localPlane(plyr.pos);
    const dist = distanceToPlane(surfPlane, plyr.pos);
    this.adjustVelocity(surfPlane);
    this.adjustPosition(surfPlane, dist);
    this.setTuxPos(plyr.pos);
    this.adjustOrientation(dtime, dist, surfPlane.nml);

    this.speed = normalize(tmpVel);
  }

  private solveOde(dtime: number): void {
    const plyr = this.player;
    let h = this.odeTimeStep;
    if (h < 0) h = adjustTimeStep(dtime, plyr.vel);

    const x = newOde(), y = newOde(), z = newOde();
    const vx = newOde(), vy = newOde(), vz = newOde();
    let newPos = { ...plyr.pos };
    let newVel = cloneVec(plyr.vel);
    let newF = cloneVec(plyr.netForce);
    let t = 0;
    const tfinal = dtime;
    let done = false;

    while (!done) {
      if (t >= tfinal) break;
      if (1.1 * h > tfinal - t) { h = tfinal - t; done = true; }

      const savedPos = { ...newPos };
      const savedVel = cloneVec(newVel);
      const savedF = cloneVec(newF);
      let failed = false;
      let err = 0;
      let tol = 0;

      for (;;) {
        odeInit(x, newPos.x, h); odeInit(y, newPos.y, h); odeInit(z, newPos.z, h);
        odeInit(vx, newVel.x, h); odeInit(vy, newVel.y, h); odeInit(vz, newVel.z, h);
        odeUpdate(x, 0, newVel.x); odeUpdate(y, 0, newVel.y); odeUpdate(z, 0, newVel.z);
        odeUpdate(vx, 0, newF.x / TUX_MASS); odeUpdate(vy, 0, newF.y / TUX_MASS); odeUpdate(vz, 0, newF.z / TUX_MASS);

        for (let i = 1; i < 4; i++) {
          newPos = { x: odeNextVal(x, i), y: odeNextVal(y, i), z: odeNextVal(z, i) };
          newVel = { x: odeNextVal(vx, i), y: odeNextVal(vy, i), z: odeNextVal(vz, i) };
          odeUpdate(x, i, newVel.x); odeUpdate(y, i, newVel.y); odeUpdate(z, i, newVel.z);
          newF = this.calcNetForce(plyr, newPos, newVel);
          odeUpdate(vx, i, newF.x / TUX_MASS);
          odeUpdate(vy, i, newF.y / TUX_MASS);
          odeUpdate(vz, i, newF.z / TUX_MASS);
        }

        newPos = { x: odeFinal(x), y: odeFinal(y), z: odeFinal(z) };
        newVel = { x: odeFinal(vx), y: odeFinal(vy), z: odeFinal(vz) };

        const posErr = [odeError(x), odeError(y), odeError(z)];
        const velErr = [odeError(vx), odeError(vy), odeError(vz)];
        let totPos = 0, totVel = 0;
        for (let i = 0; i < 3; i++) { posErr[i] *= posErr[i]; totPos += posErr[i]; velErr[i] *= velErr[i]; totVel += velErr[i]; }
        totPos = Math.sqrt(totPos);
        totVel = Math.sqrt(totVel);
        if (totPos / MAX_POSITION_ERROR > totVel / MAX_VELOCITY_ERROR) { err = totPos; tol = MAX_POSITION_ERROR; }
        else { err = totVel; tol = MAX_VELOCITY_ERROR; }

        if (err > tol && h > MIN_TIME_STEP + EPS) {
          done = false;
          if (!failed) {
            failed = true;
            h *= Math.max(0.5, 0.8 * Math.pow(tol / err, ode23TimeStepExp));
          } else {
            h *= 0.5;
          }
          h = adjustTimeStep(h, savedVel);
          newPos = savedPos; newVel = savedVel; newF = savedF;
        } else {
          break;
        }
      }

      t = t + h;
      newF = this.calcNetForce(plyr, newPos, newVel);

      if (!failed) {
        const temp = 1.25 * Math.pow(err / tol, ode23TimeStepExp);
        if (temp > 0.2) h = h / temp;
        else h = 5.0 * h;
      }
      h = adjustTimeStep(h, newVel);

      this.adjustForTreeCollision(plyr, newPos, newVel);
      this.checkItemCollection(plyr, newPos);
    }

    this.odeTimeStep = h;
    plyr.vel = newVel;
    plyr.pos = newPos;
    plyr.netForce = newF;
  }

  private getSurfaceType(x: number, z: number): [number, number, number] {
    return this.course.surfaceWeights(x, z);
  }

  private localPlane(pt: Point3): Plane { return this.course.localPlane(pt); }

  /** src/phys_sim.c calc_wind_force() */
  private calcWindForce(playerVel: Vec3): Vec3 {
    let totalVel = scale(-1, playerVel);
    if (this.windy) {
      if (this.lastWindTime !== this.time) {
        this.windScale = this.windScale + (this.random() - 0.5) * 0.15;
        this.windScale = Math.min(1, Math.max(0, this.windScale));
      }
      totalVel = add(totalVel, scale(this.windScale, vec(250 / 3.6, 0, 0)));
    }
    const windSpeed = normalize(totalVel);
    const re = AIR_DENSITY * windSpeed * TUX_DIAMETER / AIR_VISCOSITY;
    const tableSize = airLogDrag.length;
    const logRe = Math.log10(re);
    let i: number;
    if (logRe < airLogRe[0]) i = 0;
    else if (logRe >= airLogRe[tableSize - 1]) i = tableSize - 2;
    else { for (i = 0; i < tableSize - 1; i++) if (logRe < airLogRe[i + 1]) break; }
    const m = (airLogDrag[i + 1] - airLogDrag[i]) / (airLogRe[i + 1] - airLogRe[i]);
    const b = airLogDrag[i] - m * airLogRe[i];
    const dragCoeff = Math.pow(10, m * logRe + b);
    const dfMag = 0.5 * dragCoeff * AIR_DENSITY * (windSpeed * windSpeed) * (Math.PI * (TUX_DIAMETER * TUX_DIAMETER) * 0.25);
    this.lastWindTime = this.time;
    return scale(dfMag, totalVel);
  }

  private static calcSpringForce(compression: number, vel: Vec3, surfNml: Vec3): { force: Vec3; unclamped: Vec3 } {
    const springVel = dot(vel, surfNml);
    let f =
      Math.min(compression, TUX_GLUTE_STAGE_1_COMPRESSIBILITY) * TUX_GLUTE_STAGE_1_SPRING_COEFF;
    f += Math.max(0, Math.min(compression - TUX_GLUTE_STAGE_1_COMPRESSIBILITY, TUX_GLUTE_STAGE_2_COMPRESSIBILITY)) * TUX_GLUTE_STAGE_2_SPRING_COEFF;
    f += Math.max(0, compression - TUX_GLUTE_STAGE_2_COMPRESSIBILITY - TUX_GLUTE_STAGE_1_COMPRESSIBILITY) * TUX_GLUTE_STAGE_3_SPRING_COEFF;
    f -= springVel * (compression <= TUX_GLUTE_STAGE_1_COMPRESSIBILITY ? TUX_GLUTE_STAGE_1_SPRING_COEFF
      : (compression <= TUX_GLUTE_STAGE_2_COMPRESSIBILITY ? TUX_GLUTE_STAGE_2_DAMPING_COEFF : TUX_GLUTE_STAGE_3_DAMPING_COEFF));
    f = Math.max(f, 0);
    const unclamped = scale(f, surfNml);
    const clamped = scale(Math.min(f, TUX_GLUTE_MAX_SPRING_FORCE), surfNml);
    return { force: clamped, unclamped };
  }

  private calcNetForce(plyr: Player, pos: Point3, vel: Vec3): Vec3 {
    const weights = this.getSurfaceType(pos.x, pos.z);
    const surfPlane = this.localPlane(pos);
    const origSurfNml = surfPlane.nml;
    let surfFric = 0;
    for (let i = 0; i < 3; i++) surfFric += weights[i] * this.course.friction[i];
    let surfNml = this.adjustSurfNmlForRoll(plyr, vel, surfFric, origSurfNml);
    let compDepth = 0;
    for (let i = 0; i < 3; i++) compDepth += weights[i] * compressionFor(i as Terrain);

    const gravF = vec(0, -GRAV * TUX_MASS, 0);
    const dist = distanceToPlane(surfPlane, pos);
    plyr.airborne = dist > 0;

    let nmlF = vec(0, 0, 0);
    let unclampedNmlF = vec(0, 0, 0);
    if (dist <= -compDepth) {
      const compression = -dist - compDepth;
      const spring = Physics.calcSpringForce(compression, vel, surfNml);
      nmlF = spring.force;
      unclampedNmlF = spring.unclamped;
    }

    if (plyr.control.beginJump) {
      plyr.control.beginJump = false;
      if (dist <= 0) { plyr.control.jumping = true; plyr.control.jumpStartTime = this.time; }
      else plyr.control.jumping = false;
    }

    let jumpF = vec(0, 0, 0);
    if (plyr.control.jumping && this.time - plyr.control.jumpStartTime < JUMP_FORCE_DURATION) {
      jumpF = vec(0, BASE_JUMP_G_FORCE * TUX_MASS * GRAV + plyr.control.jumpAmt * (MAX_JUMP_G_FORCE - BASE_JUMP_G_FORCE) * TUX_MASS * GRAV, 0);
    } else {
      plyr.control.jumping = false;
    }
    plyr.normalForce = unclampedNmlF;

    let fricF = vec(0, 0, 0);
    let brakeF = vec(0, 0, 0);
    const dir = normalized(vel);
    const fricDir = scale(-1, dir.v);
    const speed = dir.length;
    if (dist < 0 && speed > MIN_FRICTION_SPEED) {
      const nmlMag = normalized(nmlF).length;
      let fricMag = Math.min(MAX_FRICTIONAL_FORCE, nmlMag * surfFric);
      fricF = scale(fricMag, fricDir);
      let steer = plyr.control.turnFact * MAX_TURN_ANGLE;
      if (Math.abs(fricMag * Math.sin((Math.PI / 180) * steer)) > MAX_TURN_PERPENDICULAR_FORCE) {
        steer = (180 / Math.PI) * Math.asin(MAX_TURN_PERPENDICULAR_FORCE / fricMag) *
          plyr.control.turnFact / Math.abs(plyr.control.turnFact);
      }
      fricF = transformVector(rotationAboutVector(origSurfNml, steer), fricF);
      fricF = scale(1 + MAX_TURN_PENALTY, fricF);
      if (speed > MIN_TUX_SPEED && plyr.control.isBraking) brakeF = scale(surfFric * BRAKE_FORCE, fricDir);
    }

    const airF = this.calcWindForce(vel);

    if (plyr.control.isPaddling && this.time - plyr.control.paddleTime >= PADDLING_DURATION) {
      plyr.control.isPaddling = false;
    }
    let paddlingF = vec(0, 0, 0);
    if (plyr.control.isPaddling) {
      if (plyr.airborne) {
        paddlingF = rotateVector(plyr.orientation, vec(0, 0, -TUX_MASS * GRAV / 4));
      } else {
        paddlingF = scale(-1 * Math.min(MAX_PADDLING_FORCE, MAX_PADDLING_FORCE *
          (MAX_PADDLING_SPEED - speed) / MAX_PADDLING_SPEED *
          Math.min(1, surfFric / IDEAL_PADDLING_FRIC_COEFF)), fricDir);
      }
    }

    return add(jumpF, add(gravF, add(nmlF, add(fricF, add(airF, add(brakeF, paddlingF))))));
  }

  private adjustSurfNmlForRoll(plyr: Player, vel: Vec3, fricCoeff: number, nml: Vec3): Vec3 {
    const speed = normalized(vel).length;
    let v = projectIntoPlane(nml, vel);
    normalize(v);
    const rollAngle = plyr.control.isBraking ? BRAKING_ROLL_ANGLE : MAX_ROLL_ANGLE;
    const angle = plyr.control.turnFact * rollAngle *
      Math.min(1, Math.max(0, fricCoeff) / IDEAL_ROLL_FRIC_COEFF) *
      Math.min(1, Math.max(0, speed - MIN_TUX_SPEED) / (IDEAL_ROLL_SPEED - MIN_TUX_SPEED));
    return transformVector(rotationAboutVector(v, angle), nml);
  }

  private adjustVelocity(surfPlane: Plane): void {
    const plyr = this.player;
    const surfNml = surfPlane.nml;
    let speed = normalize(plyr.vel);
    if (speed < EPS) {
      if (Math.abs(surfNml.x) + Math.abs(surfNml.z) > EPS) {
        plyr.vel = projectIntoPlane(surfNml, vec(0, -1, 0));
        normalize(plyr.vel);
      } else {
        plyr.vel = vec(0, 0, -1);
      }
    }
    speed = Math.max(MIN_TUX_SPEED, speed);
    plyr.vel = scale(speed, plyr.vel);
  }

  private adjustPosition(surfPlane: Plane, dist: number): void {
    if (dist < -MAX_SURFACE_PENETRATION) {
      this.player.pos = movePoint(this.player.pos, scale(-MAX_SURFACE_PENETRATION - dist, surfPlane.nml));
    }
  }

  private setTuxPos(newPos: Point3): void {
    const playWidth = this.course.cfg.playWidth;
    const playLength = this.course.cfg.playLength;
    const boundary = (this.course.cfg.width - playWidth) / 2;
    if (newPos.x < boundary) newPos.x = boundary;
    else if (newPos.x > this.course.cfg.width - boundary) newPos.x = this.course.cfg.width - boundary;
    if (newPos.z > 0) newPos.z = 0;
    else if (-newPos.z >= playLength) { newPos.z = -playLength; this.finished = true; }
    this.player.pos = newPos;
  }

  private adjustOrientation(dtime: number, dist: number, surfNml: Vec3): void {
    const plyr = this.player;
    let newY: Vec3, newZ: Vec3;
    const minusZ = vec(0, 0, -1);
    const yVec = vec(0, 1, 0);
    if (dist > 0) {
      newY = cloneVec(plyr.vel); normalize(newY);
      newZ = projectIntoPlane(newY, vec(0, -1, 0)); normalize(newZ);
      newZ = this.adjustTuxZvecForRoll(plyr, plyr.vel, newZ);
    } else {
      newZ = this.adjustTuxZvecForRoll(plyr, plyr.vel, scale(-1, surfNml));
      newY = projectIntoPlane(surfNml, cloneVec(plyr.vel)); normalize(newY);
    }
    const newX = cross(newY, newZ);
    const { mat } = changeOfBasis(newX, newY, newZ);
    const newOrient = quatFromMatrix(mat);
    if (!plyr.orientationInitialized) {
      plyr.orientationInitialized = true;
      plyr.orientation = newOrient;
    }
    const tc = dist > 0 ? TUX_ORIENTATION_AIRBORNE_TIME_CONSTANT : TUX_ORIENTATION_TIME_CONSTANT;
    plyr.orientation = interpolateQuaternions(plyr.orientation, newOrient, Math.min(dtime / tc, 1));
    plyr.planeNml = rotateVector(plyr.orientation, minusZ);
    plyr.direction = rotateVector(plyr.orientation, yVec);
  }

  private adjustTuxZvecForRoll(plyr: Player, vel: Vec3, zvec: Vec3): Vec3 {
    let v = projectIntoPlane(zvec, vel); normalize(v);
    const angle = plyr.control.turnFact * (plyr.control.isBraking ? BRAKING_ROLL_ANGLE : MAX_ROLL_ANGLE);
    return transformVector(rotationAboutVector(v, angle), zvec);
  }

  private adjustForTreeCollision(plyr: Player, pos: Point3, vel: Vec3): void {
    const hit = this.checkTreeCollisions(plyr, pos);
    if (!hit) return;
    let treeNml = vec(pos.x - hit.x, 0, pos.z - hit.z);
    normalize(treeNml);
    let speed = normalize(vel) * 0.7;
    const costheta = dot(vel, treeNml);
    if (costheta < 0) {
      speed *= (1 + costheta) * (1 + costheta);
      const reflected = add(scale(-2 * dot(vel, treeNml), treeNml), vel);
      normalize(reflected);
      vel.x = reflected.x; vel.y = reflected.y; vel.z = reflected.z;
    }
    speed = Math.max(speed, MIN_TUX_SPEED);
    vel.x *= speed; vel.y *= speed; vel.z *= speed;
    this.onTreeHit(hit);
  }

  private checkTreeCollisions(plyr: Player, pos: Point3): { x: number; z: number; diam: number } | null {
    const dx = pos.x - this.lastCollisionPos.x;
    const dy = pos.y - this.lastCollisionPos.y;
    const dz = pos.z - this.lastCollisionPos.z;
    if (dx * dx + dy * dy + dz * dz < COLLISION_TOLERANCE) {
      return this.lastCollision ? { ...this.lastCollisionTree, diam: this.lastCollisionDiam } : null;
    }
    let hit: { x: number; z: number; diam: number } | null = null;
    for (const tree of this.course.trees) {
      const dvx = tree.x - pos.x;
      const dvz = tree.z - pos.z;
      // the original tests Tux's sphere model against the tree's diamond-based polyhedron;
      // this keeps the diamond base and Tux's body radius instead of a bounding circle
      const half = tree.diam / 2;
      const diamondDistance = (Math.abs(dvx) + Math.abs(dvz) - half) / Math.SQRT2;
      if (diamondDistance > 0.15) continue;
      if (pos.y + 0.2 < tree.y || pos.y - 0.2 > tree.y + tree.height) continue;
      hit = { x: tree.x, z: tree.z, diam: tree.diam };
      break;
    }
    this.lastCollisionTree = hit ? { x: hit.x, y: 0, z: hit.z } : { x: -999, y: -999, z: -999 };
    this.lastCollisionDiam = hit ? hit.diam : 0;
    this.lastCollisionPos = { ...pos };
    this.lastCollision = !!hit;
    if (hit) plyr.collision = true;
    return hit;
  }

  private checkItemCollection(plyr: Player, pos: Point3): void {
    const dx = pos.x - this.lastItemPos.x;
    const dy = pos.y - this.lastItemPos.y;
    const dz = pos.z - this.lastItemPos.z;
    if (dx * dx + dy * dy + dz * dz < COLLISION_TOLERANCE) return;
    this.lastItemPos = { ...pos };
    for (const item of this.course.items) {
      if (!item.collectable || item.collected) continue;
      const dvx = item.x - pos.x;
      const dvz = item.z - pos.z;
      const radius = item.diam / 2 + 0.6;
      if (dvx * dvx + dvz * dvz > radius * radius) continue;
      if ((pos.y - 0.6 >= item.y && pos.y - 0.6 <= item.y + item.height) ||
        (pos.y + 0.6 >= item.y && pos.y + 0.6 <= item.y + item.height) ||
        (pos.y - 0.6 <= item.y && pos.y + 0.6 >= item.y + item.height)) {
        item.collected = true;
        plyr.herring += 1;
        this.onSound('item_collect');
      }
    }
  }
}

function normalized(v: Vec3): { v: Vec3; length: number } {
  const c = cloneVec(v);
  return { v: c, length: normalize(c) };
}

export { GRAV, TUX_MASS, TUX_WIDTH, MIN_TUX_SPEED, MAX_PADDLING_SPEED, JUMP_FORCE_DURATION };
