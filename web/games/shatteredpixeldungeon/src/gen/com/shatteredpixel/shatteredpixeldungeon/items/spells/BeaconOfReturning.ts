// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/spells/BeaconOfReturning.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Spell } from './Spell.ts';
import { Recipe$SimpleRecipe } from '../Recipe.ts';
import { Buff } from '../../actors/buffs/Buff.ts';

let Assets$Sounds, Dungeon, Actor, Char, Char$Property, Invisibility, Talent, Pushing, Item, ScrollOfTeleportation, ScrollOfPassage, Catalog, Notes, Notes$Landmark, Level, Messages, GameScene, InterlevelScene, InterlevelScene$Mode, ItemSprite, ItemSprite$Glowing, ItemSpriteSheet, GLog, WndOptions, Game, Sample, PathFinder, Random;

export class BeaconOfReturning extends Spell {
  returnDepth: number = 0;
  returnBranch: number = 0;
  returnPos_: number = 0;
  static WHITE: ItemSprite$Glowing = null;
  static readonly DEPTH: string = 'depth';
  static readonly BRANCH: string = 'branch';
  static readonly POS: string = 'pos';
  _BeaconOfReturning(): this {
    this._Spell();
    this.image_ = ItemSpriteSheet.RETURN_BEACON;
    this.talentChance = Math.fround(1 / Math.fround(BeaconOfReturning$Recipe.OUT_QUANTITY));
    this.returnDepth = -1;
    this.returnBranch = 0;
    return this;
  }
  onCast(hero: Hero): void {
    let tracker = hero.buff($J.cls(BeaconOfReturning$BeaconTracker));
    if (tracker == null && this.returnDepth === -1) {
      this.setBeacon(hero);
    } else {
      GameScene.show(new (BeaconOfReturning$1())().$o(this).$c(hero)._WndOptions$Image$String$String$StringArr(new ItemSprite()._ItemSprite$Item(this), Messages.titleCase(this.name()), Messages.get$Class$String$ObjectArr($J.cls(BeaconOfReturning), 'wnd_body', []), [Messages.get$Class$String$ObjectArr($J.cls(BeaconOfReturning), 'wnd_set', []), Messages.get$Class$String$ObjectArr($J.cls(BeaconOfReturning), 'wnd_return', [])]));
    }
  }
  onThrow(cell: number): void {
    if (this.returnDepth !== -1) {
      if (Dungeon.hero.belongings.getItem($J.getClass(this)) == null) {
        Notes.remove$Landmark$int(Notes$Landmark.BEACON_LOCATION, this.returnDepth);
      }
      this.returnDepth = -1;
    }
    super.onThrow(cell);
  }
  doDrop(hero: Hero): void {
    if (this.returnDepth !== -1) {
      Notes.remove$Landmark$int(Notes$Landmark.BEACON_LOCATION, this.returnDepth);
      this.returnDepth = -1;
    }
    super.doDrop(hero);
  }
  setBeacon(hero: Hero): void {
    if (this.returnDepth !== -1) {
      Notes.remove$Landmark$int(Notes$Landmark.BEACON_LOCATION, this.returnDepth);
    }
    if (hero.buff($J.cls(BeaconOfReturning$BeaconTracker)) != null) {
      Notes.remove$Landmark$int(Notes$Landmark.BEACON_LOCATION, hero.buff($J.cls(BeaconOfReturning$BeaconTracker)).returnDepth);
    }
    let tracker = Buff.affect$Char$Class(hero, $J.cls(BeaconOfReturning$BeaconTracker));
    tracker.returnDepth = Dungeon.depth;
    tracker.returnBranch = Dungeon.branch;
    tracker.returnPos_ = hero.pos;
    Notes.add$Landmark$int(Notes$Landmark.BEACON_LOCATION, tracker.returnDepth);
    hero.spend(1);
    hero.busy();
    GLog.i(Messages.get$Object$String$ObjectArr(this, 'set', []), []);
    hero.sprite_.operate$int(hero.pos);
    Sample.INSTANCE.play$Object(Assets$Sounds.BEACON);
    Item.updateQuickslot();
  }
  returnBeacon(hero: Hero): void {
    let tracker = hero.buff($J.cls(BeaconOfReturning$BeaconTracker));
    if (tracker == null) {
      if (this.returnDepth === -1) {
        return;
      }
      tracker = new BeaconOfReturning$BeaconTracker()._BeaconOfReturning$BeaconTracker();
      tracker.returnDepth = this.returnDepth;
      tracker.returnBranch = this.returnBranch;
      tracker.returnPos_ = this.returnPos_;
    }
    if (tracker.returnDepth === Dungeon.depth && tracker.returnBranch === Dungeon.branch) {
      let existing = Actor.findChar(tracker.returnPos_);
      if (existing != null && existing !== hero) {
        let toPush = Char.hasProp(existing, Char$Property.IMMOVABLE) ? hero : existing;
        let candidates = new ArrayList();
        for (let n of PathFinder.NEIGHBOURS8) {
          let cell = (tracker.returnPos_ + n) | 0;
          if (!Dungeon.level.solid[cell] && Actor.findChar(cell) == null && (!Char.hasProp(toPush, Char$Property.LARGE) || Dungeon.level.openSpace[cell])) {
            candidates.add(cell);
          }
        }
        Random.shuffle$List(candidates);
        if (!candidates.isEmpty()) {
          if (toPush === hero) {
            tracker.returnPos_ = candidates.get(0);
          } else {
            Actor.add$Actor(new Pushing()._Pushing$Char$int$int(toPush, toPush.pos, candidates.get(0)));
            toPush.pos = candidates.get(0);
            Dungeon.level.occupyCell(toPush);
          }
        } else {
          GLog.w(Messages.get$Class$String$ObjectArr($J.cls(ScrollOfTeleportation), 'no_tele', []), []);
          return;
        }
      }
      if (ScrollOfTeleportation.teleportToLocation(hero, tracker.returnPos_)) {
        hero.spendAndNext(1);
      } else {
        return;
      }
    } else {
      if (!Dungeon.interfloorTeleportAllowed()) {
        GLog.w(Messages.get$Object$String$ObjectArr(this, 'preventing', []), []);
        return;
      }
      if (tracker.returnDepth >= 11 && tracker.returnDepth <= 19 && tracker.returnBranch === 1) {
        GLog.w(Messages.get$Class$String$ObjectArr($J.cls(ScrollOfTeleportation), 'no_tele', []), []);
        return;
      }
      Level.beforeTransition();
      Invisibility.dispel$();
      InterlevelScene.mode = InterlevelScene$Mode.RETURN;
      InterlevelScene.returnDepth = tracker.returnDepth;
      InterlevelScene.returnBranch = tracker.returnBranch;
      InterlevelScene.returnPos = tracker.returnPos_;
      Game.switchScene$Class($J.cls(InterlevelScene));
    }
    if (this.quantity === 1) {
      Notes.remove$Landmark$int(Notes$Landmark.BEACON_LOCATION, tracker.returnDepth);
      if (tracker.target != null) {
        tracker.detach();
      }
    }
    this.detach(hero.belongings.backpack);
    Catalog.countUse($J.getClass(this));
    if (Random.Float$() < this.talentChance) {
      Talent.onScrollUsed(Item.curUser, Item.curUser.pos, this.talentFactor, $J.getClass(this));
    }
  }
  desc(): string {
    let desc = super.desc();
    if (Dungeon.hero != null) {
      let tracker = Dungeon.hero.buff($J.cls(BeaconOfReturning$BeaconTracker));
      if (tracker != null) {
        desc += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'desc_set', [tracker.returnDepth]);
      } else if (this.returnDepth !== -1) {
        desc += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'desc_set', [this.returnDepth]);
      }
    }
    return desc;
  }
  glowing(): ItemSprite$Glowing {
    return this.returnDepth !== -1 ? BeaconOfReturning.WHITE : null;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(BeaconOfReturning.DEPTH, this.returnDepth);
    bundle.put$String$int(BeaconOfReturning.BRANCH, this.returnBranch);
    if (this.returnDepth !== -1) {
      bundle.put$String$int(BeaconOfReturning.POS, this.returnPos_);
    }
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.returnDepth = bundle.getInt(BeaconOfReturning.DEPTH);
    this.returnBranch = bundle.getInt(BeaconOfReturning.BRANCH);
    this.returnPos_ = bundle.getInt(BeaconOfReturning.POS);
  }
  value(): number {
    return $J.d2i((Math.fround(60 * (Math.fround(this.quantity / Math.fround(BeaconOfReturning$Recipe.OUT_QUANTITY))))));
  }
  energyVal(): number {
    return $J.d2i((Math.fround(12 * (Math.fround(this.quantity / Math.fround(BeaconOfReturning$Recipe.OUT_QUANTITY))))));
  }
  static $clinit() {
    BeaconOfReturning.WHITE = new ItemSprite$Glowing()._ItemSprite$Glowing$int(16777215);
  }
}

export class BeaconOfReturning$Recipe extends Recipe$SimpleRecipe {
  static readonly OUT_QUANTITY: number = 5;
  _BeaconOfReturning$Recipe(): this {
    this._Recipe$SimpleRecipe();
    this.inputs = [$J.cls(ScrollOfPassage)];
    this.inQuantity = [1];
    this.cost_ = 12;
    this.output = $J.cls(BeaconOfReturning);
    this.outQuantity = BeaconOfReturning$Recipe.OUT_QUANTITY;
    return this;
  }
}

export class BeaconOfReturning$BeaconTracker extends Buff {
  returnDepth: number = 0;
  returnBranch: number = 0;
  returnPos_: number = 0;
  static readonly DEPTH: string = 'depth';
  static readonly BRANCH: string = 'branch';
  static readonly POS: string = 'pos';
  _BeaconOfReturning$BeaconTracker(): this {
    this._Buff();
    this.revivePersists = true;
    this.returnDepth = -1;
    this.returnBranch = 0;
    return this;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(BeaconOfReturning$BeaconTracker.DEPTH, this.returnDepth);
    bundle.put$String$int(BeaconOfReturning$BeaconTracker.BRANCH, this.returnBranch);
    if (this.returnDepth !== -1) {
      bundle.put$String$int(BeaconOfReturning$BeaconTracker.POS, this.returnPos_);
    }
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.returnDepth = bundle.getInt(BeaconOfReturning$BeaconTracker.DEPTH);
    this.returnBranch = bundle.getInt(BeaconOfReturning$BeaconTracker.BRANCH);
    this.returnPos_ = bundle.getInt(BeaconOfReturning$BeaconTracker.POS);
  }
}

let $BeaconOfReturning$1: any = null;
/** An anonymous class (BeaconOfReturning.java:80). */
function BeaconOfReturning$1(): any {
  return $BeaconOfReturning$1 ??= $J.local(class extends WndOptions {
    onSelect(index: number): void {
      if (index === 0) {
        this.$outer.setBeacon(this.$cv_hero);
      } else if (index === 1) {
        this.$outer.returnBeacon(this.$cv_hero);
      }
    }
    $c($hero): this {
      this.$cv_hero = $hero;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.spells.BeaconOfReturning$1', []);
}

$J.define(BeaconOfReturning, 'com.shatteredpixel.shatteredpixeldungeon.items.spells.BeaconOfReturning', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.spells.Spell', ctors: { '': '_BeaconOfReturning' }, clinit: true, lazy: ['WHITE'] });
$J.define(BeaconOfReturning$Recipe, 'com.shatteredpixel.shatteredpixeldungeon.items.spells.BeaconOfReturning$Recipe', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Recipe$SimpleRecipe', ctors: { '': '_BeaconOfReturning$Recipe' } });
$J.define(BeaconOfReturning$BeaconTracker, 'com.shatteredpixel.shatteredpixeldungeon.items.spells.BeaconOfReturning$BeaconTracker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_BeaconOfReturning$BeaconTracker' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Invisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invisibility');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Pushing = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Pushing');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  ScrollOfTeleportation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfTeleportation');
  ScrollOfPassage = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ScrollOfPassage');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  Notes = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Notes');
  Notes$Landmark = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Notes$Landmark');
  Level = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Level');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  InterlevelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.InterlevelScene');
  InterlevelScene$Mode = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.InterlevelScene$Mode');
  ItemSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite');
  ItemSprite$Glowing = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite$Glowing');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  WndOptions = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndOptions');
  Game = $J.load('com.watabou.noosa.Game');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
