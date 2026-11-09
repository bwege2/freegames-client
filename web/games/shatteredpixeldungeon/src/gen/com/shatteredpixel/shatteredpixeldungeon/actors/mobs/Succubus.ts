// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/Succubus.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Mob } from './Mob.ts';

let Assets$Sounds, Dungeon, Actor, Char$Property, Barrier, Buff, Charm, Light, FloatingText, Speck, Generator$Category, ScrollOfIdentify, ScrollOfTeleportation, ScrollOfUpgrade, Ballistica, CharSprite, SuccubusSprite, Sample, PathFinder, Random, Reflection;

export class Succubus extends Mob {
  blinkCooldown: number = 0;
  static readonly BLINK_CD: string = 'blink_cd';
  _Succubus(): this {
    this._Mob();
    this.blinkCooldown = 0;
    this.spriteClass = $J.cls(SuccubusSprite);
    this.HP = this.HT = 80;
    this.defenseSkill_ = 25;
    this.viewDistance = Light.DISTANCE;
    this.EXP = 12;
    this.maxLvl = 25;
    this.loot = Generator$Category.SCROLL;
    this.lootChance_ = Math.fround(0.33);
    this.properties_.add(Char$Property.DEMONIC);
    this.immunities_.add($J.cls(Charm));
    return this;
  }
  damageRoll(): number {
    return Random.NormalIntRange(25, 30);
  }
  attackProc(enemy: Char, damage: number): number {
    damage = super.attackProc(enemy, damage);
    if (enemy.buff($J.cls(Charm)) != null) {
      let shield = (this.HP - this.HT + (5 + damage)) | 0;
      if (shield > 0) {
        this.HP = this.HT;
        if (shield < 5) {
          this.sprite_.showStatusWithIcon(CharSprite.POSITIVE, String((5 - shield) | 0), FloatingText.HEALING, []);
        }
        Buff.affect$Char$Class(this, $J.cls(Barrier)).setShield(shield);
        this.sprite_.showStatusWithIcon(CharSprite.POSITIVE, String(shield), FloatingText.SHIELDING, []);
      } else {
        this.HP = (this.HP + (5 + damage)) | 0;
        this.sprite_.showStatusWithIcon(CharSprite.POSITIVE, '5', FloatingText.HEALING, []);
      }
      if (Dungeon.level.heroFOV[this.pos]) {
        Sample.INSTANCE.play$Object(Assets$Sounds.CHARMS);
      }
    } else if (Random.Int$int(3) === 0) {
      let c = Buff.affect$Char$Class$float(enemy, $J.cls(Charm), Math.fround(Charm.DURATION / 2));
      c.object = this.id();
      c.ignoreNextHit = true;
      if (Dungeon.level.heroFOV[enemy.pos]) {
        enemy.sprite_.centerEmitter().start(Speck.factory$int(Speck.HEART), Math.fround(0.2), 5);
        Sample.INSTANCE.play$Object(Assets$Sounds.CHARMS);
      }
    }
    return damage;
  }
  getCloser(target: number): boolean {
    if (this.fieldOfView[target] && Dungeon.level.distance(this.pos, target) > 2 && this.blinkCooldown <= 0 && !this.rooted) {
      if (this.blink(target)) {
        this.spend(Math.fround(-1 / this.speed()));
        return true;
      } else {
        return false;
      }
    } else {
      this.blinkCooldown--;
      return super.getCloser(target);
    }
  }
  blink(target: number): boolean {
    let route = new Ballistica()._Ballistica(this.pos, target, Ballistica.PROJECTILE);
    let cell = route.collisionPos;
    if (Actor.findChar(cell) != null && cell !== this.pos) {
      cell = route.path.get((route.dist - 1) | 0);
    }
    if (Dungeon.level.avoid[cell] || (this.properties().contains(Char$Property.LARGE) && !Dungeon.level.openSpace[cell])) {
      let candidates = new ArrayList();
      for (let n of PathFinder.NEIGHBOURS8) {
        cell = (route.collisionPos + n) | 0;
        if (Dungeon.level.passable[cell] && Actor.findChar(cell) == null && (!this.properties().contains(Char$Property.LARGE) || Dungeon.level.openSpace[cell])) {
          candidates.add(cell);
        }
      }
      if (candidates.size() > 0) {
        cell = Random.element$Collection(candidates);
      } else {
        this.blinkCooldown = Random.IntRange(4, 6);
        return false;
      }
    }
    ScrollOfTeleportation.appear(this, cell);
    this.blinkCooldown = Random.IntRange(4, 6);
    return true;
  }
  attackSkill(target: Char): number {
    return 40;
  }
  drRoll(): number {
    return (super.drRoll() + Random.NormalIntRange(0, 10)) | 0;
  }
  createLoot(): Item {
    let loot: JClass<Scroll>;
    do {
      loot = Random.oneOf(Generator$Category.SCROLL.classes);
    } while (loot === $J.cls(ScrollOfIdentify) || loot === $J.cls(ScrollOfUpgrade));
    return Reflection.newInstance(loot);
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(Succubus.BLINK_CD, this.blinkCooldown);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.blinkCooldown = bundle.getInt(Succubus.BLINK_CD);
  }
}

$J.define(Succubus, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Succubus', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob', ctors: { '': '_Succubus' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Barrier = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Barrier');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Charm = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Charm');
  Light = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Light');
  FloatingText = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.FloatingText');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  Generator$Category = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator$Category');
  ScrollOfIdentify = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfIdentify');
  ScrollOfTeleportation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfTeleportation');
  ScrollOfUpgrade = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfUpgrade');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  SuccubusSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.SuccubusSprite');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
  Reflection = $J.load('com.watabou.utils.Reflection');
});
