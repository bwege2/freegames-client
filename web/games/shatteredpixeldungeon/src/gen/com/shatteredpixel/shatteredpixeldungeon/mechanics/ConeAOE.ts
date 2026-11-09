// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/mechanics/ConeAOE.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
/*
 * Pixel Dungeon
 * Copyright (C) 2012-2015 Oleg Dolya
 *
 * Shattered Pixel Dungeon
 * Copyright (C) 2014-2026 Evan Debenham
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>
 */
import { $J, ArrayList, HashSet, JObject, LinkedHashSet } from '../../../../../jre/index.ts';

let Dungeon, Ballistica, GameMath, Point, PointF;

export class ConeAOE extends JObject {
  coreRay: Ballistica = null;
  outerRays: ArrayList<Ballistica> = null;
  rays: ArrayList<Ballistica> = null;
  cells: HashSet<number> = null;
  $init_ConeAOE() {
    this.outerRays = new ArrayList();
    this.rays = new ArrayList();
    this.cells = new HashSet();
  }
  _ConeAOE$Ballistica$float(core: Ballistica, degrees: number): this {
    this._ConeAOE$Ballistica$float$float$int(core, Infinity, degrees, core.collisionProperties_);
    return this;
  }
  _ConeAOE$Ballistica$float$float$int(core: Ballistica, maxDist: number, degrees: number, ballisticaParams: number): this {
    this.$init_ConeAOE();
    this.coreRay = core;
    let fromP = new PointF()._PointF$Point(Dungeon.level.cellToPoint(core.sourcePos));
    fromP.x = Math.fround(fromP.x + 0.5);
    fromP.y = Math.fround(fromP.y + 0.5);
    let toP = new PointF()._PointF$Point(Dungeon.level.cellToPoint(core.collisionPos));
    toP.x = Math.fround(toP.x + 0.5);
    toP.y = Math.fround(toP.y + 0.5);
    if (PointF.distance(fromP, toP) > maxDist) {
      toP = PointF.inter(fromP, toP, Math.fround(maxDist / PointF.distance(fromP, toP)));
    }
    let circleRadius = PointF.distance(fromP, toP);
    circleRadius = Math.fround(circleRadius + 0.5);
    let scan = new PointF()._PointF$();
    let scanInt = new Point()._Point$();
    let initalAngle = Math.fround(PointF.angle$PointF$PointF(fromP, toP) / PointF.G2R);
    let targetCells = new LinkedHashSet();
    let outerCells = new LinkedHashSet();
    for (let a = Math.fround(initalAngle + Math.fround(degrees / 2)); a >= Math.fround(initalAngle - Math.fround(degrees / 2)); a = Math.fround(a - 0.5)) {
      scan.polar(Math.fround(a * PointF.G2R), circleRadius);
      scan.offset$PointF(fromP);
      scan.x = Math.fround(scan.x + (fromP.x > scan.x ? +0.5 : Math.fround(-0.5)));
      scan.y = Math.fround(scan.y + (fromP.y > scan.y ? +0.5 : Math.fround(-0.5)));
      scanInt.set$int$int($J.d2i(GameMath.gate(0, Math.fround($J.d2i(Math.floor(scan.x))), Math.fround((Dungeon.level.width() - 1) | 0))), $J.d2i(GameMath.gate(0, Math.fround($J.d2i(Math.floor(scan.y))), Math.fround((Dungeon.level.height() - 1) | 0))));
      targetCells.add(Dungeon.level.pointToCell(scanInt));
      outerCells.add(Dungeon.level.pointToCell(scanInt));
      if (circleRadius >= Math.fround(4)) {
        scan.polar(Math.fround(a * PointF.G2R), Math.fround(circleRadius - 1));
        scan.offset$PointF(fromP);
        scan.x = Math.fround(scan.x + (fromP.x > scan.x ? +0.5 : Math.fround(-0.5)));
        scan.y = Math.fround(scan.y + (fromP.y > scan.y ? +0.5 : Math.fround(-0.5)));
        scanInt.set$int$int($J.d2i(GameMath.gate(0, Math.fround($J.d2i(Math.floor(scan.x))), Math.fround((Dungeon.level.width() - 1) | 0))), $J.d2i(GameMath.gate(0, Math.fround($J.d2i(Math.floor(scan.y))), Math.fround((Dungeon.level.height() - 1) | 0))));
        targetCells.add(Dungeon.level.pointToCell(scanInt));
      }
    }
    for (const $it0 = targetCells.iterator(); $it0.hasNext(); ) {
      let c = $it0.next();
      let ray = new Ballistica()._Ballistica(core.sourcePos, c, ballisticaParams);
      this.cells.addAll(ray.subPath(1, ray.dist));
      this.rays.add(ray);
      if (outerCells.contains(c)) {
        this.outerRays.add(ray);
      }
    }
    return this;
  }
}

$J.define(ConeAOE, 'com.shatteredpixel.shatteredpixeldungeon.mechanics.ConeAOE', { kind: 'class', sup: 'java.lang.Object', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica,float,float,int': '_ConeAOE$Ballistica$float$float$int', 'com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica,float': '_ConeAOE$Ballistica$float' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  GameMath = $J.load('com.watabou.utils.GameMath');
  Point = $J.load('com.watabou.utils.Point');
  PointF = $J.load('com.watabou.utils.PointF');
});
