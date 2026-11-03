// simulation/Air.h / Air.cpp: pressure, air velocity and ambient heat on the cell grid.
//
// Every float operation of the original is a binary32 operation: each one is wrapped in f(), and the arrays are
// Float32Array rows, so every store rounds as in C++. `auto x = 0.0f` locals are floats.
import {
  AIR_NOUPDATE, AIR_OFF, AIR_ON, AIR_PLOSS, AIR_PRESSUREOFF, AIR_TSTEPP, AIR_TSTEPV, AIR_VADV, AIR_VELOCITYOFF,
  AIR_VLOSS, AIRC_BOUSSINESQ, AIRC_LEGACY, CELL, InCellBounds, MAX_PRESSURE, MAX_TEMP, MIN_PRESSURE, MIN_TEMP,
  R_TEMP, WL_BLOCKAIR, WL_EWALL, WL_FAN, WL_GRAV, WL_WALL, WL_WALLELEC, XCELLS, YCELLS,
} from './config.ts';
import { f, itrunc } from './cpp.ts';
import { PT_RSSS, PT_TTAN } from './numbers.ts';
import { sd } from './simulationData.ts';
import type { Simulation } from './simulation.ts';
import { rectContains, rectPoints, type Rect } from './vec2.ts';

function rowsF(): Float32Array[] {
  const out: Float32Array[] = [];
  for (let k = 0; k < YCELLS; k++) out.push(new Float32Array(XCELLS));
  return out;
}
function rowsU8(): Uint8Array[] {
  const out: Uint8Array[] = [];
  for (let k = 0; k < YCELLS; k++) out.push(new Uint8Array(XCELLS));
  return out;
}
function fillRows(a: { fill(v: number): unknown }[], v: number): void {
  for (const row of a) row.fill(v);
}
function copyRows(dst: Float32Array[], src: Float32Array[]): void {
  for (let y = 0; y < YCELLS; y++) dst[y].set(src[y]);
}

/** RenderableSimulation: what the renderer's vorticity reads */
interface AirVelocity {
  vx: Float32Array[];
  vy: Float32Array[];
}

// Used when updating temp or velocity from far away
const advDistanceMult = f(0.7);

// 1.0f - AIR_VADV (folded by the compiler in float)
const ONE_MINUS_AIR_VADV = f(1.0 - AIR_VADV);

// Version of vorticity which takes bmap_blockair into account
function vorticityBmap(sm: Simulation, y: number, x: number): number {
  const vx = sm.vx;
  const vy = sm.vy;
  const bmap = sm.air.bmap_blockair;

  if (x > 1 && x < XCELLS - 2 && y > 1 && y < YCELLS - 2) {
    // dvy/dx - dvx/dy
    const dvydx = (bmap[y][x] || bmap[y][x + 1] || bmap[y][x - 1]) ? 0.0 : f(vy[y][x + 1] - vy[y][x - 1]);
    const dvxdy = (bmap[y][x] || bmap[y + 1][x] || bmap[y - 1][x]) ? 0.0 : f(vx[y + 1][x] - vx[y - 1][x]);
    return f(f(dvydx - dvxdy) * 0.5);
  }
  else
    return 0.0;
}

/** static float Mix(float a, float b, float f) */
function Mix(a: number, b: number, t: number): number {
  return f(a + f(f(b - a) * t));
}

const MIX_08 = f(0.8);
const MIX_09 = f(0.9);

export class Air {
  sim: Simulation;
  airMode: number;
  ambientAirTemp: number;
  edgePressure: number;
  edgeVelocityX: number;
  edgeVelocityY: number;
  vorticityCoeff: number;
  convectionMode: number;
  ovx: Float32Array[] = rowsF();
  ovy: Float32Array[] = rowsF();
  opv: Float32Array[] = rowsF();
  /** Ambient Heat */
  ohv: Float32Array[] = rowsF();
  bmap_blockair: Uint8Array[] = rowsU8();
  bmap_blockairh: Uint8Array[] = rowsU8();
  kernel = new Float32Array(9);

  make_kernel(): void { //used for velocity
    const kernel = this.kernel;
    let s = 0.0;
    for (let j = -1; j < 2; j++) {
      for (let i = -1; i < 2; i++) {
        kernel[(i + 1) + 3 * (j + 1)] = f(Math.exp(f(-2.0 * (i * i + j * j))));
        s = f(s + kernel[(i + 1) + 3 * (j + 1)]);
      }
    }
    s = f(1.0 / s);
    for (let j = -1; j < 2; j++) {
      for (let i = -1; i < 2; i++) {
        kernel[(i + 1) + 3 * (j + 1)] = f(kernel[(i + 1) + 3 * (j + 1)] * s);
      }
    }
  }

  // Version of vorticity used for rendering
  static vorticity(sm: AirVelocity, y: number, x: number): number {
    const vx = sm.vx;
    const vy = sm.vy;

    if (x > 1 && x < XCELLS - 2 && y > 1 && y < YCELLS - 2) {
      // dvy/dx - dvx/dy
      const dvydx = f(vy[y][x + 1] - vy[y][x - 1]);
      const dvxdy = f(vx[y + 1][x] - vx[y - 1][x]);
      return f(f(dvydx - dvxdy) * 0.5);
    }
    else
      return 0.0;
  }

  Clear(): void {
    fillRows(this.sim.pv, this.edgePressure);
    fillRows(this.sim.vx, this.edgeVelocityX);
    fillRows(this.sim.vy, this.edgeVelocityY);
  }

  ClearAirH(): void {
    fillRows(this.sim.hv, this.ambientAirTemp);
  }

  update_airh(): void {
    const sim = this.sim;
    const vx = sim.vx;
    const vy = sim.vy;
    const hv = sim.hv;
    const kernel = this.kernel;
    const bmap_blockairh = this.bmap_blockairh;
    const ohv = this.ohv;
    const ambientAirTemp = this.ambientAirTemp;
    const grav = { x: 0, y: 0 };
    for (let i = 0; i < YCELLS; i++) { //sets air temp on the edges every frame
      hv[i][0] = ambientAirTemp;
      hv[i][1] = ambientAirTemp;
      hv[i][XCELLS - 2] = ambientAirTemp;
      hv[i][XCELLS - 1] = ambientAirTemp;
    }
    for (let i = 0; i < XCELLS; i++) { //sets air temp on the edges every frame
      hv[0][i] = ambientAirTemp;
      hv[1][i] = ambientAirTemp;
      hv[YCELLS - 2][i] = ambientAirTemp;
      hv[YCELLS - 1][i] = ambientAirTemp;
    }
    for (let y = 0; y < YCELLS; y++) { //update air temp and velocity
      for (let x = 0; x < XCELLS; x++) {
        let dh = 0.0;
        let dx = 0.0;
        let dy = 0.0;
        for (let j = -1; j <= 1; j++) {
          for (let i = -1; i <= 1; i++) {
            if (y + j > 0 && y + j < YCELLS - 1 && x + i > 0 && x + i < XCELLS - 1 && !(bmap_blockairh[y + j][x + i] & 0x8)) {
              const kf = kernel[i + 1 + (j + 1) * 3];
              dh = f(dh + f(hv[y + j][x + i] * kf));
              dx = f(dx + f(vx[y + j][x + i] * kf));
              dy = f(dy + f(vy[y + j][x + i] * kf));
            }
            else {
              const kf = kernel[i + 1 + (j + 1) * 3];
              dh = f(dh + f(hv[y][x] * kf));
              dx = f(dx + f(vx[y][x] * kf));
              dy = f(dy + f(vy[y][x] * kf));
            }
          }
        }

        // Trying to take air temp from far away.
        // The code is almost identical to the "far away" velocity code from update_air
        let tx = f(x - f(dx * advDistanceMult));
        let ty = f(y - f(dy * advDistanceMult));
        if ((Math.abs(f(dx * advDistanceMult)) > 1.0 || Math.abs(f(dy * advDistanceMult)) > 1.0) && (tx >= 2 && tx < XCELLS - 2 && ty >= 2 && ty < YCELLS - 2)) {
          let stepX: number, stepY: number;
          let stepLimit: number;
          if (Math.abs(dx) > Math.abs(dy)) {
            stepX = (dx < 0.0) ? 1.0 : -1.0;
            stepY = f(-dy / Math.abs(dx));
            stepLimit = itrunc(Math.abs(f(dx * advDistanceMult)));
          }
          else {
            stepY = (dy < 0.0) ? 1.0 : -1.0;
            stepX = f(-dx / Math.abs(dy));
            stepLimit = itrunc(Math.abs(f(dy * advDistanceMult)));
          }
          tx = x;
          ty = y;
          let step = 0;
          for (; step < stepLimit; ++step) {
            tx = f(tx + stepX);
            ty = f(ty + stepY);
            if (!InCellBounds(itrunc(f(tx + 0.5)), itrunc(f(ty + 0.5))) || bmap_blockairh[itrunc(f(ty + 0.5))][itrunc(f(tx + 0.5))] & 0x8) {
              tx = f(tx - stepX);
              ty = f(ty - stepY);
              break;
            }
          }
          if (step == stepLimit) {
            // No wall found
            tx = f(x - f(dx * advDistanceMult));
            ty = f(y - f(dy * advDistanceMult));
          }
        }
        const i = itrunc(tx);
        const j = itrunc(ty);
        tx = f(tx - i);
        ty = f(ty - j);
        if (!(bmap_blockairh[y][x] & 0x8) && i >= 0 && i < XCELLS - 1 && j >= 0 && j < YCELLS - 1 && tx >= 0.0 && ty >= 0.0) {
          const odh = dh;
          dh = f(dh * ONE_MINUS_AIR_VADV);
          dh = f(dh + f(f(f(AIR_VADV * f(1.0 - tx)) * f(1.0 - ty)) * ((bmap_blockairh[j][i] & 0x8) ? odh : hv[j][i])));
          dh = f(dh + f(f(f(AIR_VADV * tx) * f(1.0 - ty)) * ((bmap_blockairh[j][i + 1] & 0x8) ? odh : hv[j][i + 1])));
          dh = f(dh + f(f(f(AIR_VADV * f(1.0 - tx)) * ty) * ((bmap_blockairh[j + 1][i] & 0x8) ? odh : hv[j + 1][i])));
          dh = f(dh + f(f(f(AIR_VADV * tx) * ty) * ((bmap_blockairh[j + 1][i + 1] & 0x8) ? odh : hv[j + 1][i + 1])));
        }

        // Don't update if the current cell blocks ambient heat
        if (bmap_blockairh[y][x] & 0x8)
          dh = hv[y][x];

        // Temp caps
        if (dh > MAX_TEMP) dh = MAX_TEMP;
        if (dh < MIN_TEMP) dh = MIN_TEMP;

        ohv[y][x] = dh;

        // Air convection.
        let dvx: number, dvy: number;
        dvx = vx[y][x];
        dvy = vy[y][x];

        if (x >= 2 && x < XCELLS - 2 && y >= 2 && y < YCELLS - 2) {
          sim.GetGravityField(x * CELL, y * CELL, -1.0, -1.0, grav);
          let convGravX = f(grav.x), convGravY = f(grav.y);

          switch (this.convectionMode) {
            case AIRC_LEGACY:
              {
                // Air convection pre 99.0
                const weight = f(f(f(f(hv[y][x] - hv[y][x - 1]) * convGravX) + f(f(hv[y][x] - hv[y - 1][x]) * convGravY)) / f(5000.0));
                if (weight > 0 && !(bmap_blockairh[y - 1][x] & 0x8)) {
                  dvx = f(dvx + f(weight * convGravX));
                  dvy = f(dvy + f(weight * convGravY));
                }
              }
              break;
            case AIRC_BOUSSINESQ:
              {
                // Boussinesq approximation, i.e. we assume density to be nonconstant only
                // near the gravity term of the fluid equation, and we suppose that it depends linearly on the
                // difference between the current temperature (hv[y][x]) and some "stationary" temperature (ambientAirTemp).

                // Cap the gravity field
                const gravMagn = f(Math.sqrt(f(f(convGravX * convGravX) + f(convGravY * convGravY))));
                if (gravMagn > 10.0) {
                  convGravX = f(convGravX / f(f(0.1) * gravMagn));
                  convGravY = f(convGravY / f(f(0.1) * gravMagn));
                }

                let weight = f(f(hv[y][x] - ambientAirTemp) / f(10000.0));

                // Our approximation works best when the temperature difference is small, so we cap it from above.
                if (weight > f(0.01)) weight = f(0.01);

                dvx = f(dvx + f(weight * convGravX));
                dvy = f(dvy + f(weight * convGravY));
              }
              break;
            default:
              break;
          }
        }

        // Velocity cap
        if (dvx > MAX_PRESSURE) dvx = MAX_PRESSURE;
        if (dvx < MIN_PRESSURE) dvx = MIN_PRESSURE;
        if (dvy > MAX_PRESSURE) dvy = MAX_PRESSURE;
        if (dvy < MIN_PRESSURE) dvy = MIN_PRESSURE;

        vx[y][x] = dvx;
        vy[y][x] = dvy;
      }
    }
    copyRows(hv, ohv);
  }

  update_air(): void {
    const sim = this.sim;
    const vx = sim.vx;
    const vy = sim.vy;
    const pv = sim.pv;
    const fvx = sim.fvx;
    const fvy = sim.fvy;
    const bmap = sim.bmap;
    const kernel = this.kernel;
    const bmap_blockair = this.bmap_blockair;
    const edgePressure = this.edgePressure, edgeVelocityX = this.edgeVelocityX, edgeVelocityY = this.edgeVelocityY;
    const ovx = this.ovx, ovy = this.ovy, opv = this.opv;
    if (this.airMode != AIR_NOUPDATE) { //airMode 4 is no air/pressure update
      for (let i = 0; i < YCELLS; i++) { //reduces pressure/velocity on the edges every frame
        pv[i][0] = Mix(edgePressure, pv[i][0], MIX_08);
        pv[i][1] = Mix(edgePressure, pv[i][1], MIX_08);
        pv[i][XCELLS - 2] = Mix(edgePressure, pv[i][XCELLS - 2], MIX_08);
        pv[i][XCELLS - 1] = Mix(edgePressure, pv[i][XCELLS - 1], MIX_08);
        vx[i][0] = Mix(edgeVelocityX, vx[i][0], MIX_09);
        vx[i][1] = Mix(edgeVelocityX, vx[i][1], MIX_09);
        vx[i][XCELLS - 2] = Mix(edgeVelocityX, vx[i][XCELLS - 2], MIX_09);
        vx[i][XCELLS - 1] = Mix(edgeVelocityX, vx[i][XCELLS - 1], MIX_09);
        vy[i][0] = Mix(edgeVelocityY, vy[i][0], MIX_09);
        vy[i][1] = Mix(edgeVelocityY, vy[i][1], MIX_09);
        vy[i][XCELLS - 2] = Mix(edgeVelocityY, vy[i][XCELLS - 2], MIX_09);
        vy[i][XCELLS - 1] = Mix(edgeVelocityY, vy[i][XCELLS - 1], MIX_09);
      }
      for (let i = 0; i < XCELLS; i++) { //reduces pressure/velocity on the edges every frame
        pv[0][i] = Mix(edgePressure, pv[0][i], MIX_08);
        pv[1][i] = Mix(edgePressure, pv[1][i], MIX_08);
        pv[YCELLS - 2][i] = Mix(edgePressure, pv[YCELLS - 2][i], MIX_08);
        pv[YCELLS - 1][i] = Mix(edgePressure, pv[YCELLS - 1][i], MIX_08);
        vx[0][i] = Mix(edgeVelocityX, vx[0][i], MIX_09);
        vx[1][i] = Mix(edgeVelocityX, vx[1][i], MIX_09);
        vx[YCELLS - 2][i] = Mix(edgeVelocityX, vx[YCELLS - 2][i], MIX_09);
        vx[YCELLS - 1][i] = Mix(edgeVelocityX, vx[YCELLS - 1][i], MIX_09);
        vy[0][i] = Mix(edgeVelocityY, vy[0][i], MIX_09);
        vy[1][i] = Mix(edgeVelocityY, vy[1][i], MIX_09);
        vy[YCELLS - 2][i] = Mix(edgeVelocityY, vy[YCELLS - 2][i], MIX_09);
        vy[YCELLS - 1][i] = Mix(edgeVelocityY, vy[YCELLS - 1][i], MIX_09);
      }

      for (let j = 1; j < YCELLS - 1; j++) { //clear some velocities near walls
        for (let i = 1; i < XCELLS - 1; i++) {
          if (bmap_blockair[j][i]) {
            vx[j][i] = 0.0;
            vx[j][i - 1] = 0.0;
            vx[j][i + 1] = 0.0;
            vy[j][i] = 0.0;
            vy[j - 1][i] = 0.0;
            vy[j + 1][i] = 0.0;
          }
        }
      }

      for (let y = 1; y < YCELLS - 1; y++) { //pressure adjustments from velocity
        for (let x = 1; x < XCELLS - 1; x++) {
          let dp = 0.0;
          dp = f(dp + f(vx[y][x - 1] - vx[y][x + 1]));
          dp = f(dp + f(vy[y - 1][x] - vy[y + 1][x]));
          pv[y][x] = Mix(edgePressure, pv[y][x], AIR_PLOSS);
          pv[y][x] = f(pv[y][x] + f(f(dp * AIR_TSTEPP) * 0.5));
        }
      }

      for (let y = 1; y < YCELLS - 1; y++) { //velocity adjustments from pressure
        for (let x = 1; x < XCELLS - 1; x++) {
          let dx = 0.0;
          let dy = 0.0;
          dx = f(dx + f(pv[y][x - 1] - pv[y][x + 1]));
          dy = f(dy + f(pv[y - 1][x] - pv[y + 1][x]));
          vx[y][x] = Mix(edgeVelocityX, vx[y][x], AIR_VLOSS);
          vy[y][x] = Mix(edgeVelocityY, vy[y][x], AIR_VLOSS);
          vx[y][x] = f(vx[y][x] + f(f(dx * AIR_TSTEPV) * 0.5));
          vy[y][x] = f(vy[y][x] + f(f(dy * AIR_TSTEPV) * 0.5));
          if (bmap_blockair[y][x - 1] || bmap_blockair[y][x] || bmap_blockair[y][x + 1])
            vx[y][x] = 0;
          if (bmap_blockair[y - 1][x] || bmap_blockair[y][x] || bmap_blockair[y + 1][x])
            vy[y][x] = 0;
        }
      }

      for (let y = 0; y < YCELLS; y++) { //update velocity and pressure
        for (let x = 0; x < XCELLS; x++) {
          let dx = 0.0;
          let dy = 0.0;
          let dp = 0.0;
          for (let j = -1; j < 2; j++) {
            for (let i = -1; i < 2; i++) {
              if (y + j > 0 && y + j < YCELLS - 1 &&
                x + i > 0 && x + i < XCELLS - 1 &&
                !bmap_blockair[y + j][x + i]) {
                const kf = kernel[i + 1 + (j + 1) * 3];
                dx = f(dx + f(vx[y + j][x + i] * kf));
                dy = f(dy + f(vy[y + j][x + i] * kf));
                dp = f(dp + f(pv[y + j][x + i] * kf));
              }
              else {
                const kf = kernel[i + 1 + (j + 1) * 3];
                dx = f(dx + f(vx[y][x] * kf));
                dy = f(dy + f(vy[y][x] * kf));
                dp = f(dp + f(pv[y][x] * kf));
              }
            }
          }

          let tx = f(x - f(dx * advDistanceMult));
          let ty = f(y - f(dy * advDistanceMult));
          if ((Math.abs(f(dx * advDistanceMult)) > 1.0 || Math.abs(f(dy * advDistanceMult)) > 1.0) && (tx >= 2 && tx < XCELLS - 2 && ty >= 2 && ty < YCELLS - 2)) {
            // Trying to take velocity from far away, check whether there is an intervening wall.
            // Step from current position to desired source location, looking for walls, with either the x or y step size being 1 cell
            let stepX: number, stepY: number;
            let stepLimit: number;
            if (Math.abs(dx) > Math.abs(dy)) {
              stepX = (dx < 0.0) ? 1.0 : -1.0;
              stepY = f(-dy / Math.abs(dx));
              stepLimit = itrunc(Math.abs(f(dx * advDistanceMult)));
            }
            else {
              stepY = (dy < 0.0) ? 1.0 : -1.0;
              stepX = f(-dx / Math.abs(dy));
              stepLimit = itrunc(Math.abs(f(dy * advDistanceMult)));
            }
            tx = x;
            ty = y;
            let step = 0;
            for (; step < stepLimit; ++step) {
              tx = f(tx + stepX);
              ty = f(ty + stepY);
              if (!InCellBounds(itrunc(f(tx + 0.5)), itrunc(f(ty + 0.5))) || bmap_blockair[itrunc(f(ty + 0.5))][itrunc(f(tx + 0.5))]) {
                tx = f(tx - stepX);
                ty = f(ty - stepY);
                break;
              }
            }
            if (step == stepLimit) {
              // No wall found
              tx = f(x - f(dx * advDistanceMult));
              ty = f(y - f(dy * advDistanceMult));
            }
          }
          const i = itrunc(tx);
          const j = itrunc(ty);
          tx = f(tx - i);
          ty = f(ty - j);
          if (!bmap_blockair[y][x] && i >= 2 && i < XCELLS - 3 && j >= 2 && j < YCELLS - 3 && tx >= 0.0 && ty >= 0.0) {
            dx = f(dx * ONE_MINUS_AIR_VADV);
            dy = f(dy * ONE_MINUS_AIR_VADV);

            dx = f(dx + f(f(f(AIR_VADV * f(1.0 - tx)) * f(1.0 - ty)) * vx[j][i]));
            dy = f(dy + f(f(f(AIR_VADV * f(1.0 - tx)) * f(1.0 - ty)) * vy[j][i]));

            dx = f(dx + f(f(f(AIR_VADV * tx) * f(1.0 - ty)) * vx[j][i + 1]));
            dy = f(dy + f(f(f(AIR_VADV * tx) * f(1.0 - ty)) * vy[j][i + 1]));

            dx = f(dx + f(f(f(AIR_VADV * f(1.0 - tx)) * ty) * vx[j + 1][i]));
            dy = f(dy + f(f(f(AIR_VADV * f(1.0 - tx)) * ty) * vy[j + 1][i]));

            dx = f(dx + f(f(f(AIR_VADV * tx) * ty) * vx[j + 1][i + 1]));
            dy = f(dy + f(f(f(AIR_VADV * tx) * ty) * vy[j + 1][i + 1]));
          }

          //Vorticity confinement
          if (this.vorticityCoeff > 0.0 && x > 1 && x < XCELLS - 2 && y > 1 && y < YCELLS - 2) {
            const dwx = f(f(Math.abs(vorticityBmap(sim, y, x + 1)) - Math.abs(vorticityBmap(sim, y, x - 1))) * 0.5);
            const dwy = f(f(Math.abs(vorticityBmap(sim, y + 1, x)) - Math.abs(vorticityBmap(sim, y - 1, x))) * 0.5);
            // std::hypot(float, float) is hypotf: glibc computes it in double and rounds once
            const norm = f(Math.sqrt(dwx * dwx + dwy * dwy));
            const w = vorticityBmap(sim, y, x);

            const c5 = f(this.vorticityCoeff / f(5.0));
            const den = f(norm + f(0.001));
            dx = f(dx + f(f(f(c5 * dwy) / den) * w));
            dy = f(dy + f(f(f(c5 * -dwx) / den) * w));
          }

          if (bmap[y][x] == WL_FAN) {
            dx = f(dx + fvx[y][x]);
            dy = f(dy + fvy[y][x]);
          }
          // pressure/velocity caps
          if (dp > MAX_PRESSURE) dp = MAX_PRESSURE;
          if (dp < MIN_PRESSURE) dp = MIN_PRESSURE;
          if (dx > MAX_PRESSURE) dx = MAX_PRESSURE;
          if (dx < MIN_PRESSURE) dx = MIN_PRESSURE;
          if (dy > MAX_PRESSURE) dy = MAX_PRESSURE;
          if (dy < MIN_PRESSURE) dy = MIN_PRESSURE;

          switch (this.airMode) {
            default:
            case AIR_ON: //Default
              break;
            case AIR_PRESSUREOFF: //0 Pressure
              dp = 0.0;
              break;
            case AIR_VELOCITYOFF: //0 Velocity
              dx = 0.0;
              dy = 0.0;
              break;
            case AIR_OFF: //0 Air
              dx = 0.0;
              dy = 0.0;
              dp = 0.0;
              break;
            case AIR_NOUPDATE: //No Update
              break;
          }

          ovx[y][x] = dx;
          ovy[y][x] = dy;
          opv[y][x] = dp;
        }
      }
      copyRows(vx, ovx);
      copyRows(vy, ovy);
      copyRows(pv, opv);
    }
  }

  Invert(): void {
    const sim = this.sim;
    const vx = sim.vx;
    const vy = sim.vy;
    const pv = sim.pv;
    for (let nx = 0; nx < XCELLS; nx++) {
      for (let ny = 0; ny < YCELLS; ny++) {
        pv[ny][nx] = -pv[ny][nx];
        vx[ny][nx] = -vx[ny][nx];
        vy[ny][nx] = -vy[ny][nx];
      }
    }
  }

  // called when loading saves / stamps to ensure nothing "leaks" the first frame
  ApproximateBlockAirMaps(targetBlocks: Rect): void {
    const sim = this.sim;
    const bmap_blockair = this.bmap_blockair;
    const bmap_blockairh = this.bmap_blockairh;
    for (const { X: x, Y: y } of rectPoints(targetBlocks)) {
      bmap_blockair[y][x] = (sim.bmap[y][x] == WL_WALL || sim.bmap[y][x] == WL_WALLELEC || sim.bmap[y][x] == WL_BLOCKAIR || (sim.bmap[y][x] == WL_EWALL && !sim.emap[y][x])) ? 1 : 0;
      bmap_blockairh[y][x] = (bmap_blockair[y][x] || sim.bmap[y][x] == WL_GRAV) ? 0x8 : 0;
    }

    const elements = sd.elements;
    for (let i = 0; i < sim.parts.active; i++) {
      const type = sim.parts[i].type;
      if (!type)
        continue;
      // Real TTAN would only block if there was enough TTAN
      // but it would be more expensive and complicated to actually check that
      // so just block for a frame, if it wasn't supposed to block it will continue allowing air next frame
      if (type == PT_TTAN || type == PT_RSSS) {
        const x = (itrunc(f(sim.parts[i].x + 0.5)) / CELL) | 0, y = (itrunc(f(sim.parts[i].y + 0.5)) / CELL) | 0;
        if (rectContains(targetBlocks, x, y)) {
          bmap_blockair[y][x] = 1;
          bmap_blockairh[y][x] = 0x8;
        }
      }
      // mostly accurate insulator blocking, besides checking GEL
      else if (sd.IsHeatInsulator(sim.parts[i]) || elements[type].HeatConduct <= (sim.rng.call() % 250)) {
        const x = (itrunc(f(sim.parts[i].x + 0.5)) / CELL) | 0, y = (itrunc(f(sim.parts[i].y + 0.5)) / CELL) | 0;
        if (rectContains(targetBlocks, x, y) && !(bmap_blockairh[y][x] & 0x8))
          bmap_blockairh[y][x]++;
      }
    }
  }

  constructor(simulation: Simulation) {
    this.sim = simulation;
    this.airMode = AIR_ON;
    this.ambientAirTemp = f(R_TEMP + f(273.15));
    this.edgePressure = 0;
    this.edgeVelocityX = 0;
    this.edgeVelocityY = 0;
    this.vorticityCoeff = f(0.1);
    this.convectionMode = AIRC_BOUSSINESQ;
    //Simulation should do this.
    this.make_kernel();
    fillRows(this.bmap_blockair, 0);
    fillRows(this.bmap_blockairh, 0);
    fillRows(this.sim.vx, 0.0);
    fillRows(this.ovx, 0.0);
    fillRows(this.sim.vy, 0.0);
    fillRows(this.ovy, 0.0);
    fillRows(this.sim.hv, 0.0);
    fillRows(this.ohv, 0.0);
    fillRows(this.sim.pv, 0.0);
    fillRows(this.opv, 0.0);
  }
}
