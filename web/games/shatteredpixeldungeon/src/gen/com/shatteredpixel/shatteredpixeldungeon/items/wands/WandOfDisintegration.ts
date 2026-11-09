// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/wands/WandOfDisintegration.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList } from '../../../../../../jre/index.ts';
import { DamageWand } from './DamageWand.ts';

let Assets$Sounds, Dungeon, Actor, Web, Mob, Beam$DeathRay, CellEmitter, PurpleParticle, Item, Ballistica, GameScene, ItemSpriteSheet, DungeonTilemap, Sample, Random;

export class WandOfDisintegration extends DamageWand {
  _WandOfDisintegration(): this {
    this._DamageWand();
    this.image_ = ItemSpriteSheet.WAND_DISINTEGRATION;
    this.collisionProperties_ = Ballistica.WONT_STOP;
    return this;
  }
  min$int(lvl: number): number {
    return (2 + lvl) | 0;
  }
  max$int(lvl: number): number {
    return (8 + Math.imul(4, lvl)) | 0;
  }
  targetingPos(user: Hero, dst: number): number {
    if (!this.cursed || !this.cursedKnown) {
      return dst;
    } else {
      return super.targetingPos(user, dst);
    }
  }
  onZap(beam: Ballistica): void {
    let terrainAffected = false;
    let level = this.buffedLvl();
    let maxDistance = Math.min(this.distance(), beam.dist);
    let chars = new ArrayList();
    let web = Dungeon.level.blobs.get($J.cls(Web));
    let terrainPassed = 2;
    let terrainBonus = 0;
    for (const $it0 = beam.subPath(1, maxDistance).iterator(); $it0.hasNext(); ) {
      let c = $it0.next();
      let ch: Char;
      if ((ch = Actor.findChar(c)) != null) {
        terrainBonus = (terrainBonus + $J.idiv(terrainPassed, 3)) | 0;
        terrainPassed = terrainPassed % 3;
        if (ch instanceof Mob && (ch).state_ === (ch).PASSIVE && !(Dungeon.level.mapped[c] || Dungeon.level.visited[c])) {
        } else {
          chars.add(ch);
        }
      }
      if (Dungeon.level.solid[c]) {
        terrainPassed++;
      }
      if (Dungeon.level.flamable[c]) {
        Dungeon.level.destroy(c);
        GameScene.updateMap$int(c);
        terrainAffected = true;
      }
      CellEmitter.center(c).burst(PurpleParticle.BURST, Random.IntRange(1, 2));
    }
    if (terrainAffected) {
      Dungeon.observe$();
    }
    let lvl = (level + (chars.size() - 1) + terrainBonus) | 0;
    for (const $it1 = chars.iterator(); $it1.hasNext(); ) {
      let ch = $it1.next();
      this.wandProc(ch, this.chargesPerCast());
      ch.damage(this.damageRoll$int(lvl), this);
      ch.sprite_.centerEmitter().burst(PurpleParticle.BURST, Random.IntRange(1, 2));
      ch.sprite_.flash();
    }
  }
  onHit(staff: MagesStaff, attacker: Char, defender: Char, damage: number): void {
  }
  distance(): number {
    return (Math.imul(this.buffedLvl(), 2) + 6) | 0;
  }
  upgradeStat2(level: number): string {
    return String((6 + Math.imul(level, 2)) | 0);
  }
  fx(beam: Ballistica, callback: Callback): void {
    let cell = beam.path.get(Math.min(beam.dist, this.distance()));
    Item.curUser.sprite_.parent.add$Gizmo(new Beam$DeathRay()._Beam$DeathRay(Item.curUser.sprite_.center$(), DungeonTilemap.raisedTileCenterToWorld(cell)));
    Sample.INSTANCE.play$Object(Assets$Sounds.RAY);
    callback.call();
  }
  staffFx(particle: MagesStaff$StaffParticle): void {
    particle.color$int(2228258);
    particle.am = Math.fround(0.6);
    particle.setLifespan(1);
    particle.acc.set$float$float(10, -10);
    particle.setSize(0.5, 3);
    particle.shuffleXY(1);
  }
}

$J.define(WandOfDisintegration, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfDisintegration', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.wands.DamageWand', ctors: { '': '_WandOfDisintegration' }, meths: { 'max(int)': 'max$int', 'min(int)': 'min$int' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Web = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Web');
  Mob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob');
  Beam$DeathRay = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Beam$DeathRay');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  PurpleParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.PurpleParticle');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  DungeonTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTilemap');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  Random = $J.load('com.watabou.utils.Random');
});
