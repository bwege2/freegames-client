// Chromium B.S.U. port (GPL-3.0-or-later; translated in 2026 by the freegames project from the original by Mark B. Allan, Clarified Artistic License; LICENSE.md): src/ScreenItemAdd.cpp, the levels.
// A level is a time line of enemies and power-ups made with the random tables when it starts
// (loadLevel1..3; the fourth is never reached, (gameLevel-1)%3 picks one of three).
import { EnemyAircraft, NumEnemyTypes, EnemyStraight, EnemyOmni, EnemyRayGun, EnemyTank, EnemyGnat, EnemyBoss00, EnemyBoss01 } from './enemies.ts';
import { ItemEnemy, ItemPowerUp, type ScreenItem } from './item.ts';
import { PowerUp, HeroAmmo00, HeroAmmo01, HeroAmmo02, Shields, Repair, SuperShields } from './powerups.ts';
import type { Global } from './global.ts';

const f = Math.fround;
const None = 0, Arrow = 1;

class EnemyWave {
  type: number;
  begin = 1;
  end = 500;
  period = 60;
  jitter = 10;
  formation = None;
  pos = new Float32Array([0.0, 10.0, 25.0]);
  xJitter = f(8.0);
  constructor(t: number) { this.type = t; }
  setInOut(b: number, e: number): void { this.begin = b; this.end = e; if (e <= b) this.end = b + 1; }
  setPos(x: number, y: number): void { this.pos[0] = x; this.pos[1] = y; }
  setXRand(j: number): void { this.xJitter = f(j); }
  setFrequency(p: number, j = 0): void { this.period = p; this.jitter = j; }
  setFormation(fm: number): void { this.formation = fm; }
}

export interface ItemThing {
  releaseTime: number;
  item: ScreenItem;
}

export class ScreenItemAdd {
  /** root->next ...: sorted by release time */
  items: ItemThing[] = [];
  /** deadPool[type]->next ...: killed enemies, kept for dynamicEnemyAdd */
  deadPool: EnemyAircraft[][] = [];
  private readonly game: Global;

  constructor(game: Global) {
    this.game = game;
    for (let i = 0; i < NumEnemyTypes; i++) {
      // the pools' list heads are aircraft too (and draw their random numbers)
      EnemyAircraft.makeNewEnemy(game, i, [0.0, 0.0, 0.0]);
      this.deadPool[i] = [];
    }
  }

  clear(): void {
    this.items = [];
    this.clearDeadPool();
  }

  private clearDeadPool(): void {
    for (let i = 0; i < NumEnemyTypes; i++) this.deadPool[i] = [];
  }

  putScreenItems(): void {
    const g = this.game;
    while (this.items.length && this.items[0].releaseTime <= g.gameFrame) {
      const it = this.items.shift()!;
      if (it.item.itemType === ItemEnemy) g.enemyFleet.addEnemy(it.item as EnemyAircraft);
      else if (it.item.itemType === ItemPowerUp) g.powerUps.addPowerUp(it.item as PowerUp);
    }
  }

  killScreenItem(del: ScreenItem): void {
    if (del.itemType === ItemEnemy) {
      const e = del as EnemyAircraft;
      this.deadPool[e.type].unshift(e);
    }
  }

  loadScreenItems(): void {
    switch ((this.game.gameLevel - 1) % 3) {
      case 0: this.loadLevel1(); break;
      case 1: this.loadLevel2(); break;
      case 2: this.loadLevel3(); break;
      default: this.loadLevel1(); break;
    }
  }

  private addItem(relTime: number, item: ScreenItem): void {
    let k = 0;
    while (k < this.items.length && !(relTime < this.items[k].releaseTime)) k++;
    this.items.splice(k, 0, { releaseTime: relTime, item });
  }

  private addWave(ew: EnemyWave): void {
    const g = this.game;
    let interval = 1;
    let iteration = 0;
    const p = new Float32Array(ew.pos);
    let jitter = Math.trunc(ew.jitter * (2.0 - g.gameSkill));
    const period = Math.trunc(ew.period * (2.0 - g.gameSkill));
    if (jitter >= period) jitter = period - 1;
    for (let i = ew.begin; i < ew.end; i++) {
      interval--;
      if (interval < 1) {
        switch (ew.formation) {
          case None:
            p[0] = ew.pos[0] + f(ew.xJitter * g.rand.S);
            this.addItem(i, EnemyAircraft.makeNewEnemy(g, ew.type, p)!);
            interval = period + Math.trunc(f(g.rand.S * jitter));
            break;
          case Arrow:
            p[0] = ew.pos[0] + f(ew.xJitter * iteration);
            this.addItem(i, EnemyAircraft.makeNewEnemy(g, ew.type, p, 0.0)!);
            if (iteration > 0) {
              p[0] = ew.pos[0] - f(ew.xJitter * iteration);
              this.addItem(i, EnemyAircraft.makeNewEnemy(g, ew.type, p, 0.0)!);
            }
            interval = period + Math.trunc(f(g.rand.S * jitter));
            iteration++;
            break;
          default:
            p[0] = 0.0;
            this.addItem(i, EnemyAircraft.makeNewEnemy(g, ew.type, p, 0.0)!);
            interval = 25;
            break;
        }
      }
    }
  }

  dynamicEnemyAdd(et: number, pos: ArrayLike<number>, relTime: number): EnemyAircraft {
    let e: EnemyAircraft;
    if (this.deadPool[et].length) {
      e = this.deadPool[et].shift()!;
      e.init(pos);
    } else e = EnemyAircraft.makeNewEnemy(this.game, et, pos)!;
    this.addItem(relTime, e);
    return e;
  }

  /** loadLevelXXX: level 1 */
  private loadLevel1(): void {
    const g = this.game;
    const r = g.rand;
    const numIterations = 12000;
    this.clearDeadPool();
    let d: number;
    let waveDuration = 500;
    let i = 600;
    this.addStraightWave(1, i, 0.4);
    while (i < numIterations - 1000) {
      if (i < 1500) d = f((i + 250.0) / 2000.0);
      else d = 1.0;
      const rr = r.F;
      if (rr < 0.15) this.addStraightArrowWave(i, waveDuration, d);
      else if (rr < 0.25) this.addOmniArrowWave(i, waveDuration, d);
      else if (rr > 0.60) this.addStraightWave(i, waveDuration, d);
      else this.addOmniWave(i, waveDuration, d);
      i += waveDuration;
      waveDuration = Math.trunc(600.0 * g.gameSkill) + Math.trunc(f(100 * r.S));
      i += 50 + Math.trunc(f(50 * r.F));
    }
    // ray gun enemy starts halfway through...
    const rayWave = new EnemyWave(EnemyRayGun);
    rayWave.setXRand(8.0);
    rayWave.setFrequency(60, 5);
    rayWave.setFrequency(2000, 1000);
    rayWave.setInOut(numIterations / 2, i - 1000);
    this.addWave(rayWave);
    // Boss
    const bossWave = new EnemyWave(EnemyBoss00);
    bossWave.setInOut(i + 75, i + 1000);
    bossWave.setPos(0.0, 15.0);
    bossWave.setXRand(4.0);
    bossWave.setFrequency(5000, 0);
    this.addWave(bossWave);
    // Ammunition and PowerUps
    this.addAmmunition(0, numIterations + 9000);
    this.addPowerUps(0, numIterations + 9000);
  }

  private loadLevel2(): void {
    const g = this.game;
    const r = g.rand;
    const numIterations = 14000;
    this.clearDeadPool();
    let waves = 0;
    let waveDuration = 500;
    let i = 500;
    this.addStraightWave(100, i, 0.4);
    while (i < numIterations) {
      const rr = r.F;
      waves++;
      if (waves === 5 || waves === 6 || waves === 11 || waves === 12 || waves === 15 || waves === 16) {
        this.addGnatWave(i, waveDuration, 1.0, false);
      } else if (waves < 5) {
        if (rr < 0.20) this.addStraightArrowWave(i, waveDuration);
        else if (rr < 0.30) this.addOmniArrowWave(i, waveDuration);
        else if (rr < 0.60) this.addOmniWave(i, waveDuration);
        else this.addStraightWave(i, waveDuration);
      } else {
        if (rr < 0.25) this.addGnatWave(i, waveDuration);
        else if (rr < 0.35) this.addStraightArrowWave(i, waveDuration);
        else if (rr < 0.50) this.addOmniArrowWave(i, waveDuration);
        else if (rr < 0.80) this.addOmniWave(i, waveDuration);
        else this.addStraightWave(i, waveDuration);
      }
      i += waveDuration;
      waveDuration = Math.trunc(700.0 + 100.0 * r.S);
      i += 50 + Math.trunc(f(50 * r.F));
    }
    const gnatWave = new EnemyWave(EnemyGnat);
    gnatWave.setInOut(2200, 5000);
    gnatWave.setPos(r.F * 4.0, 10.0);
    gnatWave.setFrequency(150, 140);
    gnatWave.setXRand(5.0);
    this.addWave(gnatWave);
    // Boss
    const bossWave = new EnemyWave(EnemyBoss01);
    bossWave.setPos(0.0, 15.0);
    bossWave.setXRand(4.0);
    bossWave.setFrequency(5000, 0);
    bossWave.setInOut(numIterations + 700, numIterations + 710);
    this.addWave(bossWave);
    this.addAmmunition(0, numIterations + 9000);
    this.addPowerUps(0, numIterations + 9000);
  }

  private loadLevel3(): void {
    const g = this.game;
    const r = g.rand;
    const numIterations = 14000;
    this.clearDeadPool();
    let waves = 0;
    let waveDuration = 500;
    let i = 500;
    this.addStraightWave(100, i, 0.5);
    while (i < numIterations) {
      const rr = r.F;
      waves++;
      if (waves === 5 || waves === 12) {
        this.addGnatWave(i, waveDuration, 0.9, false);
      } else if (waves === 6 || waves === 11 || waves === 15 || waves === 16) {
        const tankWave = new EnemyWave(EnemyTank);
        tankWave.setPos(0.0, 11.0);
        tankWave.setXRand(10.0);
        tankWave.setFrequency(700, 100);
        tankWave.setInOut(i + 50, waveDuration - 50);
        this.addWave(tankWave);
        this.addStraightWave(i, 300);
      } else if (waves < 5) {
        if (rr < 0.20) this.addStraightArrowWave(i, waveDuration);
        else if (rr < 0.30) this.addOmniArrowWave(i, waveDuration);
        else if (rr < 0.60) this.addOmniWave(i, waveDuration);
        else this.addStraightWave(i, waveDuration);
      } else {
        if (rr < 0.25) this.addGnatWave(i, waveDuration);
        else if (rr < 0.35) this.addStraightArrowWave(i, waveDuration);
        else if (rr < 0.50) this.addOmniArrowWave(i, waveDuration);
        else if (rr < 0.80) this.addOmniWave(i, waveDuration);
        else this.addStraightWave(i, waveDuration);
      }
      i += waveDuration;
      waveDuration = Math.trunc(700.0 + 100.0 * r.S);
      i += 50 + Math.trunc(f(50 * r.F));
    }
    const gnatWave = new EnemyWave(EnemyGnat);
    gnatWave.setInOut(3000, 5000);
    gnatWave.setPos(r.F * 4.0, 10.0);
    gnatWave.setFrequency(150, 140);
    gnatWave.setXRand(5.0);
    this.addWave(gnatWave);
    gnatWave.setInOut(8000, 11000);
    this.addWave(gnatWave);
    // give some extra power ups...
    this.addAmmunition(0, 2000, 500, 700, 0);
    this.addAmmunition(10000, 2000, 500, 700, 0);
    this.addPowerUps(3000, 2000, 2500, 2500, 0);
    this.addPowerUps(9500, 2000, 2500, 2500, 0);
    this.addPowerUps(numIterations, 2000, 2500, 2500, 1);
    // Boss
    const bossWave = new EnemyWave(EnemyBoss01);
    bossWave.setPos(0.0, 15.0);
    bossWave.setXRand(4.0);
    bossWave.setFrequency(5000, 0);
    bossWave.setInOut(numIterations + 700, numIterations + 710);
    this.addWave(bossWave);
    const tankWave = new EnemyWave(EnemyTank);
    tankWave.setPos(0.0, 11.0);
    tankWave.setXRand(10.0);
    tankWave.setFrequency(2000, 200);
    tankWave.setInOut(numIterations + 400, numIterations + 3000);
    this.addWave(tankWave);
    this.addAmmunition(0, numIterations + 9000);
    this.addPowerUps(0, numIterations + 9000);
  }

  private addStraightWave(o: number, duration: number, density = 1.0): void {
    const freq = f(1.0 / density);
    const w = new EnemyWave(EnemyStraight);
    w.setXRand(8.0);
    w.setFrequency(Math.trunc(f(60 * freq)), 5);
    w.setInOut(o, o + duration);
    this.addWave(w);
  }

  private addOmniWave(o: number, duration: number, density = 1.0): void {
    const r = this.game.rand;
    const freq = f(1.0 / density);
    const omni = new EnemyWave(EnemyOmni);
    omni.setXRand(1.0);
    omni.setFrequency(Math.trunc(f(39 * freq)), 7);
    omni.setPos(r.S * 8.0, 9.0);
    omni.setInOut(o, o + Math.trunc(duration / 2) + 50);
    this.addWave(omni);
    omni.setPos(r.S * 8.0, 9.0);
    omni.setInOut(o + Math.trunc(duration / 2) - 50, o + duration);
    this.addWave(omni);
    const straight = new EnemyWave(EnemyStraight);
    straight.setXRand(8.0);
    straight.setFrequency(200, 50);
    straight.setInOut(o + 100, o + duration);
    this.addWave(straight);
  }

  private addStraightArrowWave(o: number, _duration: number, density = 1.0): void {
    const freq = f(1.0 / density);
    const c = this.game.rand.S;
    const arrow = new EnemyWave(EnemyStraight);
    arrow.setInOut(o, o + 130);
    arrow.setXRand(0.0);
    arrow.setPos(c, 10.0);
    arrow.setFrequency(Math.trunc(f(50 * freq)), 0);
    arrow.setXRand(1.6);
    arrow.setFormation(Arrow);
    this.addWave(arrow);
    const omni = new EnemyWave(EnemyOmni);
    omni.setFrequency(Math.trunc(f(15 * freq)), 5);
    omni.setPos(c, 9.0);
    omni.setXRand(2.0);
    omni.setInOut(o + 220, o + 260);
    this.addWave(omni);
    omni.setXRand(3.0);
    omni.setFrequency(Math.trunc(f(22 * freq)), 5);
    omni.setInOut(o + 440, o + 600);
    this.addWave(omni);
  }

  private addOmniArrowWave(o: number, _duration: number, density = 1.0): void {
    const freq = f(1.0 / density);
    const c = f(this.game.rand.S * 2.0);
    const arrow = new EnemyWave(EnemyOmni);
    arrow.setFormation(Arrow);
    arrow.setPos(c, 10.0);
    arrow.setFrequency(Math.trunc(f(25 * freq)), 0);
    arrow.setXRand(1.0);
    arrow.setInOut(o + 50, o + 150);
    this.addWave(arrow);
    arrow.setInOut(o + 250, o + 320);
    this.addWave(arrow);
    arrow.setInOut(o + 300, o + 330);
    this.addWave(arrow);
    arrow.setInOut(o + 350, o + 470);
    this.addWave(arrow);
    arrow.setFrequency(5, 0);
    arrow.setXRand(1.8);
    arrow.setInOut(o + 550, o + 555);
    this.addWave(arrow);
  }

  private addGnatWave(o: number, duration: number, density = 1.0, mixed = true): void {
    const g = this.game;
    const r = g.rand;
    const freq = f(1.0 / density);
    const c = f(-r.F * 3.0);
    if (mixed) {
      const straight = new EnemyWave(EnemyStraight);
      straight.setInOut(o + 50, o + duration);
      straight.setXRand(0.0);
      straight.setPos(c, 10.0);
      straight.setFrequency(Math.trunc(f(90 * freq)), 20);
      straight.setXRand(8.0);
      if (c > 0.0) {
        this.addWave(straight);
      } else {
        const omni = new EnemyWave(EnemyOmni);
        omni.setInOut(o + 50, o + 130);
        omni.setPos(c, 10.0);
        omni.setFrequency(Math.trunc(f(20 * freq)), 0);
        omni.setXRand(1.1);
        this.addWave(omni);
        omni.setInOut(o + 320, o + 400);
        this.addWave(omni);
        straight.setInOut(o + 200, o + 250);
        this.addWave(straight);
      }
      const gnat = new EnemyWave(EnemyGnat);
      gnat.setInOut(o, o + Math.trunc(f(25 * g.gameSkill) * (1.0 + r.F * 0.2)));
      gnat.setPos(r.S * 5.0, 10.0);
      gnat.setFrequency(Math.trunc(f(3 * freq)), 0);
      gnat.setXRand(3.0);
      this.addWave(gnat);
    } else {
      const gnat = new EnemyWave(EnemyGnat);
      gnat.setPos(-3.0 + r.S * 5.0, 10.0);
      gnat.setFrequency(Math.trunc(f(1 * freq)), 0);
      gnat.setXRand(3.0);
      gnat.setInOut(o, o + 35);
      this.addWave(gnat);
      gnat.setPos(r.S * 5.0, 10.0);
      gnat.setInOut(o + 300, o + 310);
      this.addWave(gnat);
      gnat.setFrequency(Math.trunc(f(30 * freq)), 0);
      gnat.setInOut(o + 300, o + 400);
      this.addWave(gnat);
    }
  }

  private addAmmunition(o: number, duration: number, a = 0, b = 100, c = 1000): void {
    const g = this.game;
    const r = g.rand;
    let p00 = a + Math.trunc(f(r.F * 200));
    let p01 = b + Math.trunc(f(r.F * 200));
    let p02 = c + Math.trunc(f(r.F * 500));
    const skill = f(2.0 - g.gameSkill);
    const p = new Float32Array([0.0, 9.0, 25.0]);
    for (let i = o; i < o + duration; i++) {
      p00--;
      p01--;
      p02--;
      p[0] = 8.0 * r.S;
      if (p00 < 1) {
        p00 = Math.trunc(f(f(skill * 2000) + Math.trunc(f(r.S * 500))));
        this.addItem(i, new PowerUp(HeroAmmo00, p));
      } else if (p01 < 1) {
        p01 = Math.trunc(f(f(skill * 2500) + Math.trunc(f(r.S * 1000))));
        this.addItem(i, new PowerUp(HeroAmmo01, p));
      } else if (p02 < 1) {
        p02 = Math.trunc(f(f(f(skill * skill) * 4000) + Math.trunc(f(r.S * 1000))));
        this.addItem(i, new PowerUp(HeroAmmo02, p));
      }
    }
  }

  private addPowerUps(o: number, duration: number, a = 300, b = 1200, c = 1000): void {
    const r = this.game.rand;
    let p00 = a + Math.trunc(f(r.F * 500));
    let p01 = b + Math.trunc(f(r.F * 500));
    let p02 = c + Math.trunc(f(r.F * 1500));
    const p = new Float32Array([0.0, 9.0, 25.0]);
    for (let i = o; i < o + duration; i++) {
      p00--;
      p01--;
      p02--;
      p[0] = 8.0 * r.S;
      if (p00 < 1) {
        p00 = 2500 + Math.trunc(f(r.S * 700));
        this.addItem(i, new PowerUp(Shields, p));
      } else if (p01 < 1) {
        p01 = 4000 + Math.trunc(f(r.S * 900));
        this.addItem(i, new PowerUp(Repair, p));
      } else if (p02 < 1) {
        p02 = 5000 + Math.trunc(f(r.S * 3000));
        this.addItem(i, new PowerUp(SuperShields, p));
      }
    }
  }
}
