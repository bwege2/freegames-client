// TerraGenesis Perlin, the map generator of OpenTTD 15.3: a direct
// translation of src/tgp.cpp (comments there explain the algorithm).
//
// Everything here draws from Randomizer in the same order as the original;
// the tests compare the resulting tile heights with a native savegame.

import { RandomContext } from './random.ts';
import type { GenerationSettings } from './settings.ts';
import { CUSTOM_SEA_LEVEL, CUSTOM_TERRAIN_TYPE, Landscape, MAP_HEIGHT_LIMIT_AUTO_CEILING_ROOM, MAP_HEIGHT_LIMIT_AUTO_MINIMUM, MAX_MAP_HEIGHT_LIMIT } from './settings.ts';

type Height = number;
type Amplitude = number;

const HEIGHT_DECIMAL_BITS = 4;
const AMPLITUDE_DECIMAL_BITS = 10;
const MAX_TGP_FREQUENCIES = 10;
const WATER_PERCENT_FACTOR = 1024;
const WATER_PERCENT = [70, 170, 270, 420];

const I2H = (i: number): Height => i << HEIGHT_DECIMAL_BITS;
const H2I = (h: Height): number => h >> HEIGHT_DECIMAL_BITS;

export interface HeightMap {
  /** (sizeX + 1) * (sizeY + 1) heights in 1/16 height units */
  h: Int16Array;
  dimX: number;
  sizeX: number;
  sizeY: number;
}

/** TGPGetMaxHeight (src/tgp.cpp). */
export function tgpGetMaxHeight(settings: GenerationSettings, mapHeightLimit: number): Height {
  if (settings.terrainType === CUSTOM_TERRAIN_TYPE) {
    return I2H(settings.customTerrainType + 1) - 1;
  }
  const maxHeight = [
    [3, 3, 3, 3, 4, 5, 7],
    [5, 7, 8, 9, 14, 19, 31],
    [8, 9, 10, 15, 23, 37, 61],
    [10, 11, 17, 19, 49, 63, 73],
    [12, 19, 25, 31, 67, 75, 87],
  ];
  const bucket = Math.min(settings.mapXLog, settings.mapYLog) - 6;
  let maxHeightFromTable = maxHeight[settings.terrainType][bucket];
  if (mapHeightLimit !== 0) maxHeightFromTable = Math.min(maxHeightFromTable, mapHeightLimit);
  return I2H(maxHeightFromTable);
}

/** The auto map height limit from src/genworld.cpp (PrepareGenerateWorldProgress). */
export function autoMapHeightLimit(settings: GenerationSettings): number {
  if (settings.mapHeightLimit !== 0) return settings.mapHeightLimit;
  const estimated = H2I(tgpGetMaxHeight(settings, 0));
  return Math.max(MAP_HEIGHT_LIMIT_AUTO_MINIMUM, Math.min(MAX_MAP_HEIGHT_LIMIT, estimated + MAP_HEIGHT_LIMIT_AUTO_CEILING_ROOM));
}

function getAmplitude(settings: GenerationSettings, mapHeightLimit: number, frequency: number): Amplitude {
  const amplitudes = [
    [16000, 5600, 1968, 688, 240, 16, 16],
    [24000, 12800, 6400, 2700, 1024, 128, 16],
    [32000, 19200, 12800, 8000, 3200, 256, 64],
    [48000, 24000, 19200, 16000, 8000, 512, 320],
  ];
  const extrapolation = [3.3, 2.8, 2.3, 1.8];
  const smoothness = settings.tgenSmoothness;
  let index = frequency - MAX_TGP_FREQUENCIES + amplitudes[smoothness].length;
  let amplitude = amplitudes[smoothness][Math.max(0, index)];
  if (index >= 0) return amplitude;
  const factor = extrapolation[smoothness];
  let heightRange = I2H(16);
  do {
    amplitude = Math.trunc(factor * amplitude);
    heightRange <<= 1;
    index++;
  } while (index < 0);
  const clamp = Math.trunc((tgpGetMaxHeight(settings, mapHeightLimit) - heightRange) / heightRange);
  return Math.min(1, Math.max(0, clamp)) * amplitude;
}

/** RandomHeight: A2H(RandomRange(2 * rMax + 1) - rMax). */
function randomHeight(rng: RandomContext, rMax: Amplitude): Height {
  const raw = (rng.nextRange(2 * rMax + 1) - rMax) | 0;
  return raw >> (AMPLITUDE_DECIMAL_BITS - HEIGHT_DECIMAL_BITS);
}

function heightMapGenerate(hm: HeightMap, settings: GenerationSettings, mapHeightLimit: number, rng: RandomContext): void {
  const start = Math.max(MAX_TGP_FREQUENCIES - Math.min(settings.mapXLog, settings.mapYLog), 0);
  let first = true;
  const height = (x: number, y: number): number => hm.h[x + y * hm.dimX];
  const setHeight = (x: number, y: number, v: number): void => { hm.h[x + y * hm.dimX] = v; };

  for (let frequency = start; frequency < MAX_TGP_FREQUENCIES; frequency++) {
    const amplitude = getAmplitude(settings, mapHeightLimit, frequency);
    if (amplitude === 0) continue;
    const step = 1 << (MAX_TGP_FREQUENCIES - frequency - 1);

    if (first) {
      for (let y = 0; y <= hm.sizeY; y += step) {
        for (let x = 0; x <= hm.sizeX; x += step) {
          setHeight(x, y, amplitude > 0 ? randomHeight(rng, amplitude) : 0);
        }
      }
      first = false;
      continue;
    }

    for (let y = 0; y <= hm.sizeY; y += 2 * step) {
      for (let x = 0; x <= hm.sizeX - 2 * step; x += 2 * step) {
        const h00 = height(x, y);
        const h02 = height(x + 2 * step, y);
        setHeight(x + step, y, Math.trunc((h00 + h02) / 2));
      }
    }
    for (let y = 0; y <= hm.sizeY - 2 * step; y += 2 * step) {
      for (let x = 0; x <= hm.sizeX; x += step) {
        const h00 = height(x, y);
        const h20 = height(x, y + 2 * step);
        setHeight(x, y + step, Math.trunc((h00 + h20) / 2));
      }
    }
    for (let y = 0; y <= hm.sizeY; y += step) {
      for (let x = 0; x <= hm.sizeX; x += step) {
        setHeight(x, y, height(x, y) + randomHeight(rng, amplitude));
      }
    }
  }
}

function getMinMaxAvg(hm: HeightMap): { min: number; max: number; avg: number } {
  let hMin = hm.h[0], hMax = hm.h[0];
  let accu = 0;
  for (const h of hm.h) {
    if (h < hMin) hMin = h;
    if (h > hMax) hMax = h;
    accu += h;
  }
  return { min: hMin, max: hMax, avg: Math.trunc(accu / (hm.sizeX * hm.sizeY)) };
}

function sineTransform(hm: HeightMap, settings: GenerationSettings, hMin: number, hMax: number): void {
  for (let i = 0; i < hm.h.length; i++) {
    let h = hm.h[i];
    if (h < hMin) continue;
    let f = (h - hMin) / (hMax - hMin);
    switch (settings.landscape) {
      case Landscape.Toyland:
      case Landscape.Temperate:
        f = 2 * f - 1;
        f = Math.sin(f * (Math.PI / 2));
        f = 0.5 * (f + 1);
        break;
      case Landscape.Arctic: {
        const sineUpperLimit = 0.75;
        const linearCompression = 2;
        if (f >= sineUpperLimit) {
          f = 1.0 - (1.0 - f) / linearCompression;
        } else {
          const m = 1.0 - (1.0 - sineUpperLimit) / linearCompression;
          f = 2.0 * f / sineUpperLimit - 1.0;
          f = Math.sin(f * (Math.PI / 2));
          f = 0.5 * (f + 1.0) * m;
        }
        break;
      }
      case Landscape.Tropic: {
        const sineLowerLimit = 0.5;
        const linearCompression = 2;
        if (f <= sineLowerLimit) {
          f = f / linearCompression;
        } else {
          const m = sineLowerLimit / linearCompression;
          f = 2.0 * ((f - sineLowerLimit) / (1.0 - sineLowerLimit)) - 1.0;
          f = Math.sin(f * (Math.PI / 2));
          f = 0.5 * ((1.0 - m) * f + (1.0 + m));
        }
        break;
      }
      default:
        throw new Error('bad landscape');
    }
    h = Math.trunc(f * (hMax - hMin) + hMin);
    if (h < 0) h = I2H(0);
    if (h >= hMax) h = hMax - 1;
    hm.h[i] = h;
  }
}

function adjustWaterLevel(hm: HeightMap, waterPercent: number, hMaxNew: number): void {
  const { min: hMin, max: hMax } = getMinMaxAvg(hm);
  const hist = new Int32Array(hMax - hMin + 1);
  for (const h of hm.h) hist[h - hMin]++;
  const desired = Math.trunc(waterPercent * hm.sizeX * hm.sizeY / WATER_PERCENT_FACTOR);
  let waterLevel = hMin;
  let waterTiles = 0;
  for (; waterLevel < hMax; waterLevel++) {
    waterTiles += hist[waterLevel - hMin];
    if (waterTiles >= desired) break;
  }
  for (let i = 0; i < hm.h.length; i++) {
    let h = Math.trunc(hMaxNew * (hm.h[i] - waterLevel) / (hMax - waterLevel)) + I2H(1);
    if (h < 0) h = I2H(0);
    if (h >= hMaxNew) h = hMaxNew - 1;
    hm.h[i] = h;
  }
}

// ---- Perlin noise for the coastlines (src/tgp.cpp) -------------------------

/** int_noise: `long` is 64-bit on the Linux reference build, so use BigInt. */
function intNoise(x: number, y: number, prime: number, seed: number): number {
  let n = BigInt(x) + BigInt(y) * BigInt(prime) + BigInt(seed >>> 0);
  n = BigInt.asIntN(64, (n << 13n) ^ n);
  const t = BigInt.asIntN(64, n * n * 15731n + 789221n);
  const u = BigInt.asIntN(64, n * t + 1376312589n);
  return 1.0 - Number(u & 0x7fffffffn) / 1073741824.0;
}

const linearInterpolate = (a: number, b: number, x: number): number => a + x * (b - a);

function interpolatedNoise(x: number, y: number, prime: number, seed: number): number {
  const ix = Math.trunc(x);
  const iy = Math.trunc(y);
  const fx = x - ix;
  const fy = y - iy;
  const v1 = intNoise(ix, iy, prime, seed);
  const v2 = intNoise(ix + 1, iy, prime, seed);
  const v3 = intNoise(ix, iy + 1, prime, seed);
  const v4 = intNoise(ix + 1, iy + 1, prime, seed);
  const i1 = linearInterpolate(v1, v2, fx);
  const i2 = linearInterpolate(v3, v4, fx);
  return linearInterpolate(i1, i2, fy);
}

function perlinCoastNoise(x: number, y: number, p: number, prime: number, seed: number): number {
  let total = 0.0;
  for (let i = 0; i < 6; i++) {
    const frequency = 1 << i;
    const amplitude = Math.pow(p, i);
    total += interpolatedNoise((x * frequency) / 64.0, (y * frequency) / 64.0, prime, seed) * amplitude;
  }
  return total;
}

const borderTest = (flags: number, bit: number): boolean => (flags & (1 << bit)) !== 0;

function coastLines(hm: HeightMap, settings: GenerationSettings, borders: number): void {
  const smallest = Math.min(settings.mapXLog, settings.mapYLog);
  const margin = 4;
  const base = (smallest * smallest) / 64;
  const seed = settings.generationSeed;

  const setHeight = (x: number, y: number, v: number): void => { hm.h[x + y * hm.dimX] = v; };

  for (let y = 0; y <= hm.sizeY; y++) {
    if (borderTest(borders, 0)) { // NorthEast
      let maxX = Math.abs((perlinCoastNoise(hm.sizeY - y, y, 0.9, 53, seed) + 0.25) * 5 + (perlinCoastNoise(y, y, 0.35, 179, seed) + 1) * 12);
      maxX = Math.max(base + maxX, base + margin - maxX);
      if (smallest < 8 && maxX > 5) maxX /= 1.5;
      for (let x = 0; x < Math.ceil(maxX); x++) setHeight(x, y, 0);
    }
    if (borderTest(borders, 2)) { // SouthWest
      let maxX = Math.abs((perlinCoastNoise(hm.sizeY - y, y, 0.85, 101, seed) + 0.3) * 6 + (perlinCoastNoise(y, y, 0.45, 67, seed) + 0.75) * 8);
      maxX = Math.max(base + maxX, base + margin - maxX);
      if (smallest < 8 && maxX > 5) maxX /= 1.5;
      for (let x = hm.sizeX; x > hm.sizeX - 1 - maxX; x--) setHeight(x, y, 0);
    }
  }
  for (let x = 0; x <= hm.sizeX; x++) {
    if (borderTest(borders, 3)) { // NorthWest
      let maxY = Math.abs((perlinCoastNoise(x, Math.trunc(hm.sizeY / 2), 0.9, 167, seed) + 0.4) * 5 + (perlinCoastNoise(x, Math.trunc(hm.sizeY / 3), 0.4, 211, seed) + 0.7) * 9);
      maxY = Math.max(base + maxY, base + margin - maxY);
      if (smallest < 8 && maxY > 5) maxY /= 1.5;
      for (let y = 0; y < Math.ceil(maxY); y++) setHeight(x, y, 0);
    }
    if (borderTest(borders, 1)) { // SouthEast
      let maxY = Math.abs((perlinCoastNoise(x, Math.trunc(hm.sizeY / 3), 0.85, 71, seed) + 0.25) * 6 + (perlinCoastNoise(x, Math.trunc(hm.sizeY / 3), 0.35, 193, seed) + 0.75) * 12);
      maxY = Math.max(base + maxY, base + margin - maxY);
      if (smallest < 8 && maxY > 5) maxY /= 1.5;
      for (let y = hm.sizeY; y > hm.sizeY - 1 - maxY; y--) setHeight(x, y, 0);
    }
  }
}

function smoothCoastInDirection(hm: HeightMap, orgX: number, orgY: number, dirX: number, dirY: number): void {
  const maxCoastDist = 35;
  const maxSmoothDepth = 35;
  let x = orgX, y = orgY, ed = 0;
  let hPrev = I2H(1);
  const valid = (x: number, y: number): boolean => x >= 0 && x < hm.sizeX && y >= 0 && y < hm.sizeY;
  const height = (x: number, y: number): number => hm.h[x + y * hm.dimX];
  const setHeight = (x: number, y: number, v: number): void => { hm.h[x + y * hm.dimX] = v; };

  for (; valid(x, y) && ed < maxCoastDist; x += dirX, y += dirY, ed++) {
    if (height(x, y) >= I2H(1)) break;
    if (valid(x + dirY, y + dirX) && height(x + dirY, y + dirX) > 0) break;
    if (valid(x - dirY, y - dirX) && height(x - dirY, y - dirX) > 0) break;
  }
  for (let depth = 0; valid(x, y) && depth <= maxSmoothDepth; depth++, x += dirX, y += dirY) {
    const h = Math.min(height(x, y), hPrev + (4 + depth));
    setHeight(x, y, h);
    hPrev = h;
  }
}

function smoothCoasts(hm: HeightMap, borders: number): void {
  for (let x = 0; x < hm.sizeX; x++) {
    if (borderTest(borders, 3)) smoothCoastInDirection(hm, x, 0, 0, 1);
    if (borderTest(borders, 1)) smoothCoastInDirection(hm, x, hm.sizeY - 1, 0, -1);
  }
  for (let y = 0; y < hm.sizeY; y++) {
    if (borderTest(borders, 0)) smoothCoastInDirection(hm, 0, y, 1, 0);
    if (borderTest(borders, 2)) smoothCoastInDirection(hm, hm.sizeX - 1, y, -1, 0);
  }
}

function smoothSlopes(hm: HeightMap, dhMax: number): void {
  const height = (x: number, y: number): number => hm.h[x + y * hm.dimX];
  const setHeight = (x: number, y: number, v: number): void => { hm.h[x + y * hm.dimX] = v; };
  for (let y = 0; y <= hm.sizeY; y++) {
    for (let x = 0; x <= hm.sizeX; x++) {
      const hMax = Math.min(height(x > 0 ? x - 1 : x, y), height(x, y > 0 ? y - 1 : y)) + dhMax;
      if (height(x, y) > hMax) setHeight(x, y, hMax);
    }
  }
  for (let y = hm.sizeY; y >= 0; y--) {
    for (let x = hm.sizeX; x >= 0; x--) {
      const hMax = Math.min(height(x < hm.sizeX ? x + 1 : x, y), height(x, y < hm.sizeY ? y + 1 : y)) + dhMax;
      if (height(x, y) > hMax) setHeight(x, y, hMax);
    }
  }
}

interface ControlPoint { x: number; y: number }

function heightMapCurves(hm: HeightMap, settings: GenerationSettings, mapHeightLimit: number, level: number, rng: RandomContext): void {
  const mh = tgpGetMaxHeight(settings, mapHeightLimit) - I2H(1);
  const F = (fraction: number): number => Math.trunc(fraction * mh);
  const curves: ControlPoint[][] = [
    [{ x: F(0.0), y: F(0.0) }, { x: F(0.8), y: F(0.13) }, { x: F(1.0), y: F(0.4) }],
    [{ x: F(0.0), y: F(0.0) }, { x: F(0.53), y: F(0.13) }, { x: F(0.8), y: F(0.27) }, { x: F(1.0), y: F(0.6) }],
    [{ x: F(0.0), y: F(0.0) }, { x: F(0.53), y: F(0.27) }, { x: F(0.8), y: F(0.57) }, { x: F(1.0), y: F(0.8) }],
    [{ x: F(0.0), y: F(0.0) }, { x: F(0.4), y: F(0.3) }, { x: F(0.7), y: F(0.8) }, { x: F(0.92), y: F(0.99) }, { x: F(1.0), y: F(0.99) }],
  ];
  const factor = Math.fround(Math.sqrt(Math.fround(hm.sizeX) / Math.fround(hm.sizeY)));
  const sx = Math.min(128, Math.max(1, Math.trunc(Math.fround(Math.fround((1 << level) * factor) + 0.5))));
  const sy = Math.min(128, Math.max(1, Math.trunc(Math.fround(Math.fround((1 << level) / factor) + 0.5))));
  const c = new Uint8Array(sx * sy);
  for (let i = 0; i < c.length; i++) c[i] = rng.nextRange(curves.length);
  const ht = new Array(curves.length).fill(0);

  for (let x = 0; x < hm.sizeX; x++) {
    let fx = Math.fround(Math.fround(Math.fround(sx * x) / Math.fround(hm.sizeX)) + 1.0);
    let x1 = Math.trunc(fx);
    let x2 = x1;
    let xr = Math.fround(Math.fround(2.0 * (fx - x1)) - 1.0);
    xr = Math.fround(Math.sin(xr * (Math.PI / 2)));
    xr = Math.fround(Math.sin(xr * (Math.PI / 2)));
    xr = Math.fround(0.5 * (xr + 1.0));
    const xri = Math.fround(1.0 - xr);
    if (x1 > 0) { x1--; if (x2 >= sx) x2--; }

    for (let y = 0; y < hm.sizeY; y++) {
      let fy = Math.fround(Math.fround(Math.fround(sy * y) / Math.fround(hm.sizeY)) + 1.0);
      let y1 = Math.trunc(fy);
      let y2 = y1;
      let yr = Math.fround(Math.fround(2.0 * (fy - y1)) - 1.0);
      yr = Math.fround(Math.sin(yr * (Math.PI / 2)));
      yr = Math.fround(Math.sin(yr * (Math.PI / 2)));
      yr = Math.fround(0.5 * (yr + 1.0));
      const yri = Math.fround(1.0 - yr);
      if (y1 > 0) { y1--; if (y2 >= sy) y2--; }

      const ca = c[x1 + sx * y1];
      const cb = c[x1 + sx * y2];
      const cc = c[x2 + sx * y1];
      const cd = c[x2 + sx * y2];
      let bits = (1 << ca) | (1 << cb) | (1 << cc) | (1 << cd);

      const idx = x + y * hm.dimX;
      let h = hm.h[idx];
      if (h < I2H(1)) continue;
      h -= I2H(1);
      for (let t = 0; t < curves.length; t++) {
        if (!(bits & (1 << t))) continue;
        const cm = curves[t];
        for (let i = 0; i < cm.length - 1; i++) {
          const p1 = cm[i];
          const p2 = cm[i + 1];
          if (h >= p1.x && h < p2.x) {
            ht[t] = p1.y + Math.trunc((h - p1.x) * (p2.y - p1.y) / (p2.x - p1.x));
            break;
          }
        }
      }
      const left = Math.fround(Math.fround(Math.fround(ht[ca] * yri) + Math.fround(ht[cb] * yr)) * xri);
      const right = Math.fround(Math.fround(Math.fround(ht[cc] * yri) + Math.fround(ht[cd] * yr)) * xr);
      const out = Math.trunc(Math.fround(left + right)) + I2H(1);
      hm.h[idx] = out;
    }
  }
}

/**
 * Generate the TerraGenesis height map for the given settings.
 * The returned map is the original's (sizeX + 1) x (sizeY + 1) fractional
 * height array; the tile heights are H2I(value) clamped to maxHeight.
 */
export function generateHeightMap(settings: GenerationSettings, rng: RandomContext): { heightMap: HeightMap; maxHeight: number; mapHeightLimit: number } {
  const sizeX = 1 << settings.mapXLog;
  const sizeY = 1 << settings.mapYLog;
  const mapHeightLimit = autoMapHeightLimit(settings);
  const hm: HeightMap = { h: new Int16Array((sizeX + 1) * (sizeY + 1)), dimX: sizeX + 1, sizeX, sizeY };

  heightMapGenerate(hm, settings, mapHeightLimit, rng);

  const hMaxNew = tgpGetMaxHeight(settings, mapHeightLimit);
  const waterPercent = settings.quantitySeaLakes !== CUSTOM_SEA_LEVEL
    ? WATER_PERCENT[settings.quantitySeaLakes]
    : Math.trunc(settings.customSeaLevel * WATER_PERCENT_FACTOR / 100);
  let waterBorders = settings.freeformEdges ? settings.waterBorders : 0x0f;
  if (waterBorders === 0x10) waterBorders = rng.next() & 0x0f;

  adjustWaterLevel(hm, waterPercent, hMaxNew);
  coastLines(hm, settings, waterBorders);
  const roughness = 7 + 3 * settings.tgenSmoothness;
  smoothSlopes(hm, roughness);
  smoothCoasts(hm, waterBorders);
  smoothSlopes(hm, roughness);
  sineTransform(hm, settings, I2H(1), hMaxNew);
  if (settings.variety > 0) heightMapCurves(hm, settings, mapHeightLimit, settings.variety, rng);

  return { heightMap: hm, maxHeight: H2I(hMaxNew), mapHeightLimit };
}
