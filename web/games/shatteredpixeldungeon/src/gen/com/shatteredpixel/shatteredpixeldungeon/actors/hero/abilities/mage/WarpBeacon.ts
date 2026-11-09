// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/hero/abilities/mage/WarpBeacon.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList } from '../../../../../../../../jre/index.ts';
import { ArmorAbility } from '../ArmorAbility.ts';
import { Buff } from '../../../buffs/Buff.ts';

let Assets$Sounds, Dungeon, Actor, Char, Char$Property, Invisibility, Hero, Talent, CellEmitter, MagicMissile$WardParticle, Pushing, Item, ClassArmor, ScrollOfTeleportation, Level, Messages, GameScene, InterlevelScene, InterlevelScene$Mode, AttackIndicator, HeroIcon, GLog, WndOptions, Game, Image, Sample, BArray, PathFinder, Random;

export class WarpBeacon extends ArmorAbility {
  _WarpBeacon(): this {
    this._ArmorAbility();
    this.baseChargeUse_ = 35;
    return this;
  }
  targetingPrompt(): string {
    if (Dungeon.hero.buff($J.cls(WarpBeacon$WarpBeaconTracker)) == null && Dungeon.hero.hasTalent(Talent.REMOTE_BEACON)) {
      return Messages.get$Object$String$ObjectArr(this, 'prompt', []);
    }
    return super.targetingPrompt();
  }
  targetedPos(user: Char, dst: number): number {
    return dst;
  }
  activate(armor: ClassArmor, hero: Hero, target: number): void {
    if (target == null) {
      return;
    }
    if (hero.buff($J.cls(WarpBeacon$WarpBeaconTracker)) != null) {
      let tracker = hero.buff($J.cls(WarpBeacon$WarpBeaconTracker));
      GameScene.show(new (WarpBeacon$1())().$o(this).$c(tracker, hero, armor)._WndOptions$Image$String$String$StringArr(new Image()._Image$Image(hero.sprite_), Messages.titleCase(this.name()), Messages.get$Class$String$ObjectArr($J.cls(WarpBeacon), 'window_desc', [tracker.depth_]), [Messages.get$Class$String$ObjectArr($J.cls(WarpBeacon), 'window_tele', []), Messages.get$Class$String$ObjectArr($J.cls(WarpBeacon), 'window_clear', []), Messages.get$Class$String$ObjectArr($J.cls(WarpBeacon), 'window_cancel', [])]));
    } else {
      if (!Dungeon.level.mapped[target] && !Dungeon.level.visited[target]) {
        return;
      }
      if (Dungeon.level.distance(hero.pos, target) > Math.imul(4, hero.pointsInTalent(Talent.REMOTE_BEACON))) {
        GLog.w(Messages.get$Class$String$ObjectArr($J.cls(WarpBeacon), 'too_far', []), []);
        return;
      }
      PathFinder.buildDistanceMap$int$booleanArr(target, BArray.or$booleanArr$booleanArr$booleanArr(Dungeon.level.passable, Dungeon.level.avoid, null));
      if (Dungeon.level.pit[target] || (Dungeon.level.solid[target] && !Dungeon.level.passable[target]) || !(Dungeon.level.passable[target] || Dungeon.level.avoid[target]) || PathFinder.distance[hero.pos] === 2147483647) {
        GLog.w(Messages.get$Class$String$ObjectArr($J.cls(WarpBeacon), 'invalid_beacon', []), []);
        return;
      }
      let tracker = new WarpBeacon$WarpBeaconTracker()._WarpBeacon$WarpBeaconTracker();
      tracker.pos = target;
      tracker.depth_ = Dungeon.depth;
      tracker.branch = Dungeon.branch;
      tracker.attachTo(hero);
      hero.sprite_.operate$int(target);
      Sample.INSTANCE.play$Object(Assets$Sounds.TELEPORT);
      Invisibility.dispel$();
      hero.spendAndNext(Actor.TICK);
    }
  }
  icon(): number {
    return HeroIcon.WARP_BEACON;
  }
  talents(): Talent[] {
    return [Talent.TELEFRAG, Talent.REMOTE_BEACON, Talent.LONGRANGE_WARP, Talent.HEROIC_ENERGY];
  }
}

export class WarpBeacon$WarpBeaconTracker extends Buff {
  pos: number = 0;
  depth_: number = 0;
  branch: number = 0;
  e: Emitter = null;
  static readonly POS: string = 'pos';
  static readonly DEPTH: string = 'depth';
  static readonly BRANCH: string = 'branch';
  _WarpBeacon$WarpBeaconTracker(): this {
    this._Buff();
    this.revivePersists = true;
    return this;
  }
  fx(on: boolean): void {
    if (on && this.depth_ === Dungeon.depth) {
      this.e = CellEmitter.center(this.pos);
      this.e.pour(MagicMissile$WardParticle.UP, Math.fround(0.05));
    } else if (this.e != null) {
      this.e.on = false;
    }
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(WarpBeacon$WarpBeaconTracker.POS, this.pos);
    bundle.put$String$int(WarpBeacon$WarpBeaconTracker.DEPTH, this.depth_);
    bundle.put$String$int(WarpBeacon$WarpBeaconTracker.BRANCH, this.branch);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.pos = bundle.getInt(WarpBeacon$WarpBeaconTracker.POS);
    this.depth_ = bundle.getInt(WarpBeacon$WarpBeaconTracker.DEPTH);
    this.branch = bundle.getInt(WarpBeacon$WarpBeaconTracker.BRANCH);
  }
}

let $WarpBeacon$1: any = null;
/** An anonymous class (WarpBeacon.java:92). */
function WarpBeacon$1(): any {
  return $WarpBeacon$1 ??= $J.local(class extends WndOptions {
    onSelect(index: number): void {
      if (index === 0) {
        if (this.$cv_tracker.depth_ !== Dungeon.depth && !this.$cv_hero.hasTalent(Talent.LONGRANGE_WARP)) {
          GLog.w(Messages.get$Class$String$ObjectArr($J.cls(WarpBeacon), 'depths', []), []);
          return;
        }
        let chargeNeeded = this.$outer.chargeUse(this.$cv_hero);
        if (this.$cv_tracker.depth_ !== Dungeon.depth) {
          chargeNeeded = Math.fround(chargeNeeded * Math.fround(Math.fround(1.833) - Math.fround(Math.fround(0.333) * Dungeon.hero.pointsInTalent(Talent.LONGRANGE_WARP))));
        }
        if (this.$cv_armor.charge_ < chargeNeeded) {
          GLog.w(Messages.get$Class$String$ObjectArr($J.cls(ClassArmor), 'low_charge', []), []);
          return;
        }
        this.$cv_armor.charge_ = Math.fround(this.$cv_armor.charge_ - chargeNeeded);
        Item.updateQuickslot();
        if (this.$cv_tracker.depth_ === Dungeon.depth && this.$cv_tracker.branch === Dungeon.branch) {
          let existing = Actor.findChar(this.$cv_tracker.pos);
          if (existing != null && existing !== this.$cv_hero) {
            if (this.$cv_hero.hasTalent(Talent.TELEFRAG)) {
              let heroHP = (this.$cv_hero.HP + this.$cv_hero.shielding()) | 0;
              let heroDmg = Math.imul(5, this.$cv_hero.pointsInTalent(Talent.TELEFRAG));
              this.$cv_hero.damage(Math.min(heroDmg, (heroHP - 1) | 0), this.$outer);
              let damage = Hero.heroDamageIntRange(Math.imul(10, this.$cv_hero.pointsInTalent(Talent.TELEFRAG)), Math.imul(15, this.$cv_hero.pointsInTalent(Talent.TELEFRAG)));
              existing.sprite_.flash();
              existing.sprite_.bloodBurstA(existing.sprite_.center$(), damage);
              existing.damage(damage, this.$outer);
              Sample.INSTANCE.play$Object(Assets$Sounds.HIT_CRUSH);
              Sample.INSTANCE.play$Object(Assets$Sounds.HIT_STRONG);
              if (Actor.findChar(existing.pos) !== existing) {
                existing = Actor.findChar(existing.pos);
              }
            }
            if (existing != null && existing.isAlive() && existing.pos === this.$cv_tracker.pos) {
              let toPush = Char.hasProp(existing, Char$Property.IMMOVABLE) ? this.$cv_hero : existing;
              let candidates = new ArrayList();
              for (let n of PathFinder.NEIGHBOURS8) {
                let cell = (this.$cv_tracker.pos + n) | 0;
                if (!Dungeon.level.solid[cell] && Actor.findChar(cell) == null && (!Char.hasProp(toPush, Char$Property.LARGE) || Dungeon.level.openSpace[cell])) {
                  candidates.add(cell);
                }
              }
              Random.shuffle$List(candidates);
              if (!candidates.isEmpty()) {
                ScrollOfTeleportation.appear(this.$cv_hero, this.$cv_tracker.pos);
                Actor.add$Actor(new Pushing()._Pushing$Char$int$int(toPush, toPush.pos, candidates.get(0)));
                toPush.pos = candidates.get(0);
                Dungeon.level.occupyCell(toPush);
                this.$cv_hero.next();
              } else {
                GLog.w(Messages.get$Class$String$ObjectArr($J.cls(ScrollOfTeleportation), 'no_tele', []), []);
              }
            } else {
              ScrollOfTeleportation.appear(this.$cv_hero, this.$cv_tracker.pos);
            }
          } else {
            ScrollOfTeleportation.appear(this.$cv_hero, this.$cv_tracker.pos);
          }
          Invisibility.dispel$();
          Dungeon.observe$();
          GameScene.updateFog$();
          this.$cv_hero.checkVisibleMobs();
          AttackIndicator.updateState();
        } else {
          if (!Dungeon.interfloorTeleportAllowed()) {
            GLog.w(Messages.get$Class$String$ObjectArr($J.cls(ScrollOfTeleportation), 'no_tele', []), []);
            return;
          }
          Level.beforeTransition();
          Invisibility.dispel$();
          InterlevelScene.mode = InterlevelScene$Mode.RETURN;
          InterlevelScene.returnDepth = this.$cv_tracker.depth_;
          InterlevelScene.returnBranch = this.$cv_tracker.branch;
          InterlevelScene.returnPos = this.$cv_tracker.pos;
          Game.switchScene$Class($J.cls(InterlevelScene));
        }
      } else if (index === 1) {
        this.$cv_hero.buff($J.cls(WarpBeacon$WarpBeaconTracker)).detach();
      }
    }
    $c($tracker, $hero, $armor): this {
      this.$cv_tracker = $tracker; this.$cv_hero = $hero; this.$cv_armor = $armor;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.mage.WarpBeacon$1', []);
}

$J.define(WarpBeacon, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.mage.WarpBeacon', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.ArmorAbility', ctors: { '': '_WarpBeacon' } });
$J.define(WarpBeacon$WarpBeaconTracker, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.mage.WarpBeacon$WarpBeaconTracker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_WarpBeacon$WarpBeaconTracker' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Invisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invisibility');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  MagicMissile$WardParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile$WardParticle');
  Pushing = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Pushing');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  ClassArmor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.ClassArmor');
  ScrollOfTeleportation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfTeleportation');
  Level = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Level');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  InterlevelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.InterlevelScene');
  InterlevelScene$Mode = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.InterlevelScene$Mode');
  AttackIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.AttackIndicator');
  HeroIcon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.HeroIcon');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  WndOptions = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndOptions');
  Game = $J.load('com.watabou.noosa.Game');
  Image = $J.load('com.watabou.noosa.Image');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  BArray = $J.load('com.watabou.utils.BArray');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
