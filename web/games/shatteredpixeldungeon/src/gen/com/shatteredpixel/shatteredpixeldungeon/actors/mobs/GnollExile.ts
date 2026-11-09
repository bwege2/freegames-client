// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/GnollExile.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Gnoll } from './Gnoll.ts';
import { Mob$Wandering } from './Mob.ts';

let Dungeon, Actor, Buff$buffType, Generator, Messages, GnollExileSprite, GLog, BArray, PathFinder, Random;

export class GnollExile extends Gnoll {
  seenNotifyCooldown: number = 0;
  static readonly SEEN_NOTIF_CD: string = 'seen_notif_cd';
  _GnollExile(): this {
    this._Gnoll();
    this.spriteClass = $J.cls(GnollExileSprite);
    this.PASSIVE = new GnollExile$Passive().$o(this)._GnollExile$Passive();
    this.WANDERING = new GnollExile$Wandering().$o(this)._GnollExile$Wandering();
    this.state_ = this.PASSIVE;
    this.defenseSkill_ = 6;
    this.HP = this.HT = 24;
    this.lootChance_ = 0;
    this.seenNotifyCooldown = 0;
    return this;
  }
  damageRoll(): number {
    return Random.NormalIntRange(1, 10);
  }
  attackSkill(target: Char): number {
    return 15;
  }
  drRoll(): number {
    return (super.drRoll() + Random.NormalIntRange(0, 1)) | 0;
  }
  canAttack(enemy: Char): boolean {
    if (Dungeon.level.adjacent(this.pos, enemy.pos)) {
      return true;
    }
    if (Dungeon.level.distance(this.pos, enemy.pos) <= 2) {
      let passable = BArray.not(Dungeon.level.solid, null);
      for (const $it0 = Actor.chars().iterator(); $it0.hasNext(); ) {
        let ch = $it0.next();
        passable[ch.pos] = ch === this;
      }
      PathFinder.buildDistanceMap$int$booleanArr$int(enemy.pos, passable, 2);
      if (PathFinder.distance[this.pos] <= 2) {
        return true;
      }
    }
    return super.canAttack(enemy);
  }
  rollToDropLoot(): void {
    super.rollToDropLoot();
    if (Dungeon.hero.lvl > ((this.maxLvl + 2) | 0)) {
      return;
    }
    let items = new ArrayList();
    items.add(Generator.randomUsingDefaults$());
    items.add(Generator.randomUsingDefaults$());
    if (Random.Int$int(2) === 0) {
      items.add(Generator.randomUsingDefaults$());
    }
    for (const $it1 = items.iterator(); $it1.hasNext(); ) {
      let item = $it1.next();
      let ofs: number;
      do {
        ofs = PathFinder.NEIGHBOURS9[Random.Int$int(9)];
      } while (Dungeon.level.solid[(this.pos + ofs) | 0] && !(Dungeon.level.passable[(this.pos + ofs) | 0]));
      Dungeon.level.drop(item, (this.pos + ofs) | 0).sprite_.drop$int(this.pos);
    }
  }
  beckon(cell: number): void {
    if (this.state_ !== this.PASSIVE) {
      super.beckon(cell);
    } else if (this.seenNotifyCooldown <= 0) {
      this.target = cell;
    }
  }
  description(): string {
    let desc = super.description();
    if (this.state_ === this.PASSIVE) {
      desc += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'desc_passive', []);
    } else {
      desc += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'desc_aggro', []);
    }
    return desc;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(GnollExile.SEEN_NOTIF_CD, this.seenNotifyCooldown);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.seenNotifyCooldown = bundle.getInt(GnollExile.SEEN_NOTIF_CD);
  }
}

export class GnollExile$Passive extends Mob$Wandering {
  _GnollExile$Passive(): this {
    this._Mob$Wandering();
    return this;
  }
  act(enemyInFOV: boolean, justAlerted: boolean): boolean {
    for (const $it2 = this.$outer.buffs$().iterator(); $it2.hasNext(); ) {
      let b = $it2.next();
      if (b.type_ === Buff$buffType.NEGATIVE) {
        this.$outer.state_ = this.$outer.WANDERING;
        return true;
      }
    }
    if (this.$outer.fieldOfView[Dungeon.hero.pos] && Dungeon.level.heroFOV[this.$outer.pos]) {
      if (this.$outer.seenNotifyCooldown <= 0) {
        GLog.p(Messages.get$Class$String$ObjectArr($J.cls(GnollExile), 'seen_passive', []), []);
      }
      this.$outer.seenNotifyCooldown = 30;
    } else {
      this.$outer.seenNotifyCooldown--;
    }
    if (enemyInFOV && justAlerted) {
      if (Dungeon.level.heroFOV[this.$outer.pos]) {
        GLog.w(Messages.get$Class$String$ObjectArr($J.cls(GnollExile), 'seen_aggro', []), []);
      }
      return this.noticeEnemy();
    } else {
      return this.continueWandering();
    }
  }
}

export class GnollExile$Wandering extends Mob$Wandering {
  _GnollExile$Wandering(): this {
    this._Mob$Wandering();
    return this;
  }
  noticeEnemy(): boolean {
    GLog.w(Messages.get$Class$String$ObjectArr($J.cls(GnollExile), 'seen_aggro', []), []);
    return super.noticeEnemy();
  }
}

$J.define(GnollExile, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.GnollExile', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Gnoll', ctors: { '': '_GnollExile' } });
$J.define(GnollExile$Passive, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.GnollExile$Passive', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob$Wandering', ctors: { '': '_GnollExile$Passive' }, inner: true });
$J.define(GnollExile$Wandering, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.GnollExile$Wandering', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob$Wandering', ctors: { '': '_GnollExile$Wandering' }, inner: true });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Generator = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GnollExileSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.GnollExileSprite');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  BArray = $J.load('com.watabou.utils.BArray');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
