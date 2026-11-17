// AstroMenace 1.4.3 (Mikhail Kurinnoi, Viewizard; GPL-3.0-or-later), the projectile tables of
// src/object3d/projectile/projectile.cpp and their Get* functions. Changed for the browser by the
// freegames project, 2026.

/** Radius, DamageKinetic, DamageEM, ProjectileType, Speed, Age, GraphicFXQuantity */
export type ProjectileData = [number, number, number, number, number, number, number];

export const PresetEarthProjectileData: ProjectileData[] = [
  [0.3, 5, 0, 0, 50, 4, 1], [0.6, 20, 0, 0, 45, 4, 1], [0.6, 40, 0, 0, 45, 4, 1], [0.4, 10, 0, 0, 50, 4, 1],
  [1.5, 0, 10, 0, 40, 4, 1], [1.5, 0, 30, 0, 40, 4, 2], [2.0, 0, 50, 0, 40, 4, 2], [1.0, 30, 5, 0, 40, 4, 1],
  [1.3, 40, 25, 0, 40, 4, 3], [1.3, 50, 50, 0, 45, 4, 3], [0.6, 50, 0, 2, 0, 2, 1], [1.0, 80, 0, 2, 0, 2, 2],
  [1.0, 80, 10, 0, 70, 3, 1], [0.4, 150, 0, 2, 0, 1, 1], [1.1, 100, 0, 0, 80, 3, 1], [0.2, 100, 0, 1, 40, 8, 2],
  [0.2, 20, 0, 1, 40, 6, 2], [0.2, 400, 0, 1, 35, 7, 2], [0.2, 800, 0, 1, 30, 6, 2],
];
export const PresetAlienProjectileData: ProjectileData[] = [
  [0.3, 5, 0, 0, 70, 4, 1], [0.6, 10, 0, 0, 50, 4, 2], [0.6, 20, 0, 0, 60, 4, 1], [0.6, 20, 0, 0, 60, 4, 2],
  [0.6, 10, 0, 0, 50, 4, 1], [2.0, 60, 0, 3, 0, 16, 1], [2.0, 120, 0, 3, 7, 16, 1], [1.3, 50, 50, 0, 55, 4, 3],
  [1.3, 40, 25, 0, 55, 4, 3], [1.0, 250, 0, 2, 0, 1, 1],
];
export const PresetPirateProjectileData: ProjectileData[] = [
  [0.3, 5, 0, 0, 60, 4, 1], [0.6, 20, 0, 0, 45, 4, 1], [3.0, 5, 0, 3, 5, 5, 1], [0.3, 5, 0, 0, 60, 4, 1],
  [0.2, 40, 0, 1, 60, 6, 2], [0.2, 20, 0, 1, 60, 6, 2], [1.5, 0, 30, 0, 40, 4, 2], [1.0, 80, 10, 0, 70, 3, 1],
  [0.2, 400, 0, 1, 55, 7, 2], [0.2, 1000, 0, 1, 50, 6, 2], [0.6, 20, 0, 0, 45, 4, 1], [0.6, 40, 0, 0, 45, 4, 1],
  [1.3, 40, 25, 0, 40, 4, 3], [1.2, 50, 0, 4, 0, -1, 1], [1.2, 100, 0, 4, 7, -1, 1], [1.2, 150, 0, 4, 0, -1, 1],
  [1.2, 200, 0, 4, 0, -1, 1],
];

export function projectileData(num: number): ProjectileData | null {
  if (num >= 1 && num <= 99) return PresetEarthProjectileData[num - 1] ?? null;
  if (num >= 101 && num <= 199) return PresetAlienProjectileData[num - 101] ?? null;
  if (num >= 201 && num <= 299) return PresetPirateProjectileData[num - 201] ?? null;
  return null;
}

export function GetProjectileRange(num: number): number {
  if (num >= 1 && num <= 99) {
    const d = PresetEarthProjectileData[num - 1];
    let r = Math.fround(d[5] * d[4]);
    if (num === 11) r = 100;
    if (num === 12) r = 110;
    if (num === 14) r = 120;
    return r;
  } else if (num >= 101 && num <= 199) {
    if (num === 110) return 200;
    const d = PresetAlienProjectileData[num - 101];
    return d[5] * d[4];
  } else if (num >= 201 && num <= 299) {
    const d = PresetPirateProjectileData[num - 201];
    return d[5] * d[4];
  }
  return 0;
}

export function GetProjectileDamageKinetic(num: number): number {
  const d = projectileData(num);
  if (!d) return 0;
  return num === 17 ? 10 * Math.trunc(d[1]) : Math.trunc(d[1]);
}

export function GetProjectileDamageEM(num: number): number {
  const d = projectileData(num);
  if (!d) return 0;
  return num === 17 ? 10 * Math.trunc(d[2]) : Math.trunc(d[2]);
}

export function GetProjectileSpeed(num: number): number {
  const d = projectileData(num);
  return d ? d[4] : 0;
}
