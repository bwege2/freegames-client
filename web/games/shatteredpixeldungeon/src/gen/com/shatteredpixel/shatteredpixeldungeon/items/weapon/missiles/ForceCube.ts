// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/weapon/missiles/ForceCube.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, Collections } from '../../../../../../../jre/index.ts';
import { MissileWeapon } from './MissileWeapon.ts';

let Assets$Sounds, Badges, Dungeon, Actor, SnipersMark, HeroSubClass, Item, WandOfBlastWave$BlastWave, TenguDartTrap, Messages, ItemSpriteSheet, GLog, Sample, PathFinder;

export class ForceCube extends MissileWeapon {
  _ForceCube(): this {
    this._MissileWeapon();
    this.image_ = ItemSpriteSheet.FORCE_CUBE;
    this.tier_ = 5;
    this.baseUses = 5;
    this.sticky = false;
    return this;
  }
  max$int(lvl: number): number {
    return (Math.imul(6, this.tier_) + Math.imul((this.tier_), lvl)) | 0;
  }
  hitSound(pitch: number): void {
  }
  castDelay(user: Char, cell: number): number {
    if (!Dungeon.level.pit[cell] && Actor.findChar(cell) == null) {
      return this.delayFactor(user);
    } else {
      return super.castDelay(user, cell);
    }
  }
  onThrow(cell: number): void {
    if (Dungeon.level.pit[cell] && Actor.findChar(cell) == null) {
      super.onThrow(cell);
      return;
    }
    let parentTemp = this.parent;
    this.rangedHit(null, cell);
    this.parent = parentTemp;
    Dungeon.level.pressCell$int(cell);
    let targets = new ArrayList();
    let primaryTarget: Char;
    if (Actor.findChar(cell) != null) {
      primaryTarget = Actor.findChar(cell);
      targets.add(primaryTarget);
    } else {
      primaryTarget = null;
    }
    for (let i of PathFinder.NEIGHBOURS8) {
      if (!(Dungeon.level.traps.get((cell + i) | 0) instanceof TenguDartTrap)) {
        Dungeon.level.pressCell$int((cell + i) | 0);
      }
      if ((Actor.findChar((cell + i) | 0)) != null) {
        targets.add(Actor.findChar((cell + i) | 0));
      }
    }
    Collections.sort(targets, (a, b) => {
      return $J.dcmp(Dungeon.level.trueDistance(b.pos, Item.curUser.pos), Dungeon.level.trueDistance(a.pos, Item.curUser.pos));
    });
    for (const $it0 = targets.iterator(); $it0.hasNext(); ) {
      let target = $it0.next();
      Item.curUser.shoot(target, this);
      if (target === Dungeon.hero && !target.isAlive()) {
        Badges.validateDeathFromFriendlyMagic();
        Dungeon.fail(this);
        GLog.n(Messages.get$Object$String$ObjectArr(this, 'ondeath', []), []);
      }
    }
    if (Item.curUser.subClass === HeroSubClass.SNIPER && primaryTarget != null && primaryTarget.isActive()) {
      Actor.add$Actor(new (ForceCube$2())().$o(this).$c(primaryTarget)._Actor().$init_anon());
    }
    WandOfBlastWave$BlastWave.blast$int(cell);
    Sample.INSTANCE.play$Object(Assets$Sounds.BLAST);
  }
}

let $ForceCube$2: any = null;
/** An anonymous class (ForceCube.java:121). */
function ForceCube$2(): any {
  return $ForceCube$2 ??= $J.local(class extends Actor {
    $init_anon() {
      this.actPriority = (Actor.VFX_PRIO - 1) | 0;
      return this;
    }
    act(): boolean {
      let mark = Dungeon.hero.buff($J.cls(SnipersMark));
      if (mark != null && this.$cv_primaryTarget.isActive()) {
        mark.object = this.$cv_primaryTarget.id();
      }
      Actor.remove(this);
      return true;
    }
    $c($primaryTarget): this {
      this.$cv_primaryTarget = $primaryTarget;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.ForceCube$2', []);
}

$J.define(ForceCube, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.ForceCube', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.MissileWeapon', ctors: { '': '_ForceCube' }, meths: { 'max(int)': 'max$int' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  SnipersMark = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.SnipersMark');
  HeroSubClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroSubClass');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  WandOfBlastWave$BlastWave = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfBlastWave$BlastWave');
  TenguDartTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.TenguDartTrap');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
});
