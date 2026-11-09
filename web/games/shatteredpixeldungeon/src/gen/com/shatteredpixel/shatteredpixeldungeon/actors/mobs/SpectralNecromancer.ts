// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/SpectralNecromancer.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Necromancer } from './Necromancer.ts';

let Badges, Dungeon, Actor, Char, Char$Property, Buff, Necromancer$SummoningBlockDamage, Wraith, Pushing, ScrollOfRemoveCurse, Messages, SpectralNecromancerSprite, GLog, PathFinder, Random;

export class SpectralNecromancer extends Necromancer {
  wraithIDs: ArrayList<number> = null;
  static readonly WRAITH_IDS: string = 'wraith_ids';
  _SpectralNecromancer(): this {
    this._Necromancer();
    this.spriteClass = $J.cls(SpectralNecromancerSprite);
    this.wraithIDs = new ArrayList();
    return this;
  }
  act(): boolean {
    if (this.summoning && this.state_ !== this.HUNTING) {
      this.summoning = false;
      if (this.sprite_ instanceof SpectralNecromancerSprite) {
        (this.sprite_).cancelSummoning();
      }
    }
    return super.act();
  }
  rollToDropLoot(): void {
    if (Dungeon.hero.lvl > ((this.maxLvl + 2) | 0)) {
      return;
    }
    super.rollToDropLoot();
    let ofs: number;
    do {
      ofs = PathFinder.NEIGHBOURS8[Random.Int$int(8)];
    } while (Dungeon.level.solid[(this.pos + ofs) | 0] && !(Dungeon.level.passable[(this.pos + ofs) | 0]));
    Dungeon.level.drop(new ScrollOfRemoveCurse()._ScrollOfRemoveCurse(), (this.pos + ofs) | 0).sprite_.drop$int(this.pos);
  }
  die(cause: any): void {
    for (const $it0 = this.wraithIDs.iterator(); $it0.hasNext(); ) {
      let ID = $it0.next();
      let a = Actor.findById(ID);
      if (a instanceof Wraith && (a).alignment === this.alignment) {
        (a).die(null);
      }
    }
    super.die(cause);
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    let wraithIDArr = $J.newArray(this.wraithIDs.size(), 0);
    let i = 0;
    for (const $it1 = this.wraithIDs.iterator(); $it1.hasNext(); ) {
      let val = $it1.next();
      wraithIDArr[i] = val;
      i++;
    }
    bundle.put$String$intArr(SpectralNecromancer.WRAITH_IDS, wraithIDArr);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.wraithIDs.clear();
    for (let i of bundle.getIntArray(SpectralNecromancer.WRAITH_IDS)) {
      this.wraithIDs.add(i);
    }
  }
  summonMinion(): void {
    if (Actor.findChar(this.summoningPos) != null) {
      let pushPos = this.pos;
      for (let c of PathFinder.NEIGHBOURS8) {
        if ((Actor.findChar((this.summoningPos + c) | 0)) == null && Dungeon.level.passable[(this.summoningPos + c) | 0] && (Dungeon.level.openSpace[(this.summoningPos + c) | 0] || !Char.hasProp(Actor.findChar(this.summoningPos), Char$Property.LARGE)) && Dungeon.level.trueDistance(this.pos, (this.summoningPos + c) | 0) > Dungeon.level.trueDistance(this.pos, pushPos)) {
          pushPos = (this.summoningPos + c) | 0;
        }
      }
      if (Char.hasProp(Actor.findChar(this.summoningPos), Char$Property.IMMOVABLE)) {
        pushPos = this.pos;
      }
      if (pushPos !== this.pos) {
        let ch = Actor.findChar(this.summoningPos);
        Actor.add$Actor(new Pushing()._Pushing$Char$int$int(ch, ch.pos, pushPos));
        ch.pos = pushPos;
        Dungeon.level.occupyCell(ch);
      } else {
        let blocker = Actor.findChar(this.summoningPos);
        if (blocker.alignment !== this.alignment) {
          blocker.damage(Random.NormalIntRange(2, 10), new Necromancer$SummoningBlockDamage()._Necromancer$SummoningBlockDamage());
          if (blocker === Dungeon.hero && !blocker.isAlive()) {
            Badges.validateDeathFromEnemyMagic();
            Dungeon.fail(this);
            GLog.n(Messages.capitalize(Messages.get$Class$String$ObjectArr($J.cls(Char), 'kill', [this.name()])), []);
          }
        }
        this.spend(Actor.TICK);
        return;
      }
    }
    this.summoning = this.firstSummon = false;
    let wraith = Wraith.spawnAt$int$Class(this.summoningPos, $J.cls(Wraith));
    if (wraith == null) {
      this.spend(Actor.TICK);
      return;
    }
    wraith.adjustStats(4);
    Dungeon.level.occupyCell(wraith);
    (this.sprite_).finishSummoning();
    for (const $it2 = this.buffs$().iterator(); $it2.hasNext(); ) {
      let b = $it2.next();
      if (b.revivePersists) {
        Buff.affect$Char$Class(wraith, b.getClass());
      }
    }
    this.wraithIDs.add(wraith.id());
  }
}

$J.define(SpectralNecromancer, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.SpectralNecromancer', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Necromancer', ctors: { '': '_SpectralNecromancer' } });
$J.module(() => {
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Necromancer$SummoningBlockDamage = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Necromancer$SummoningBlockDamage');
  Wraith = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Wraith');
  Pushing = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Pushing');
  ScrollOfRemoveCurse = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfRemoveCurse');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  SpectralNecromancerSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.SpectralNecromancerSprite');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
