// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/artifacts/LloydsBeacon.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../../../jre/index.ts';
import { Artifact } from './Artifact.ts';
import { Artifact$ArtifactBuff } from './Artifact.ts';

let Assets$Sounds, Dungeon, Actor, Char$Alignment, Char$Property, Invisibility, Regeneration, Mob, MagicMissile, Item, ScrollOfTeleportation, Level, Ballistica, Messages, CellSelector$Listener, GameScene, InterlevelScene, InterlevelScene$Mode, ItemSprite$Glowing, ItemSpriteSheet, QuickSlotButton, GLog, Game, Sample, PathFinder;

export class LloydsBeacon extends Artifact {
  static readonly TIME_TO_USE: number = 1;
  static readonly AC_ZAP: string = 'ZAP';
  static readonly AC_SET: string = 'SET';
  static readonly AC_RETURN: string = 'RETURN';
  returnDepth: number = 0;
  returnPos_: number = 0;
  static readonly DEPTH: string = 'depth';
  static readonly POS: string = 'pos';
  zapper: CellSelector$Listener = null;
  static WHITE: ItemSprite$Glowing = null;
  _LloydsBeacon(): this {
    this._Artifact();
    this.returnDepth = -1;
    this.image_ = ItemSpriteSheet.ARTIFACT_BEACON;
    this.levelCap = 3;
    this.charge_ = 0;
    this.chargeCap_ = (3 + this.level$()) | 0;
    this.defaultAction_ = LloydsBeacon.AC_ZAP;
    this.usesTargeting_ = true;
    this.zapper = new (LloydsBeacon$1())().$o(this)._CellSelector$Listener();
    return this;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(LloydsBeacon.DEPTH, this.returnDepth);
    if (this.returnDepth !== -1) {
      bundle.put$String$int(LloydsBeacon.POS, this.returnPos_);
    }
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.returnDepth = bundle.getInt(LloydsBeacon.DEPTH);
    this.returnPos_ = bundle.getInt(LloydsBeacon.POS);
  }
  actions(hero: Hero): ArrayList<string> {
    let actions = super.actions(hero);
    actions.add(LloydsBeacon.AC_ZAP);
    actions.add(LloydsBeacon.AC_SET);
    if (this.returnDepth !== -1) {
      actions.add(LloydsBeacon.AC_RETURN);
    }
    return actions;
  }
  execute$Hero$String(hero: Hero, action: string): void {
    super.execute$Hero$String(hero, action);
    if (action === LloydsBeacon.AC_SET || action === LloydsBeacon.AC_RETURN) {
      if (Dungeon.bossLevel$() || !Dungeon.interfloorTeleportAllowed()) {
        hero.spend(LloydsBeacon.TIME_TO_USE);
        GLog.w(Messages.get$Object$String$ObjectArr(this, 'preventing', []), []);
        return;
      }
      for (let i = 0; i < PathFinder.NEIGHBOURS8.length; i++) {
        let ch = Actor.findChar((hero.pos + PathFinder.NEIGHBOURS8[i]) | 0);
        if (ch != null && ch.alignment === Char$Alignment.ENEMY) {
          GLog.w(Messages.get$Object$String$ObjectArr(this, 'creatures', []), []);
          return;
        }
      }
    }
    if (action === LloydsBeacon.AC_ZAP) {
      Item.curUser = hero;
      let chargesToUse = Dungeon.depth > 20 ? 2 : 1;
      if (!this.isEquipped(hero)) {
        GLog.i(Messages.get$Class$String$ObjectArr($J.cls(Artifact), 'need_to_equip', []), []);
        QuickSlotButton.cancel();
      } else if (this.charge_ < chargesToUse) {
        GLog.i(Messages.get$Object$String$ObjectArr(this, 'no_charge', []), []);
        QuickSlotButton.cancel();
      } else {
        GameScene.selectCell(this.zapper);
      }
    } else if (action === LloydsBeacon.AC_SET) {
      this.returnDepth = Dungeon.depth;
      this.returnPos_ = hero.pos;
      hero.spend(LloydsBeacon.TIME_TO_USE);
      hero.busy();
      hero.sprite_.operate$int(hero.pos);
      Sample.INSTANCE.play$Object(Assets$Sounds.BEACON);
      GLog.i(Messages.get$Object$String$ObjectArr(this, 'return', []), []);
    } else if (action === LloydsBeacon.AC_RETURN) {
      if (this.returnDepth === Dungeon.depth) {
        ScrollOfTeleportation.appear(hero, this.returnPos_);
        for (const $it0 = Dungeon.level.mobs.iterator(); $it0.hasNext(); ) {
          let m = $it0.next();
          if (m.pos === hero.pos) {
            for (let i of PathFinder.NEIGHBOURS8) {
              if ((Actor.findChar((m.pos + i) | 0)) == null && Dungeon.level.passable[(m.pos + i) | 0]) {
                m.pos = (m.pos + i) | 0;
                m.sprite_.point$PointF(m.sprite_.worldToCamera(m.pos));
                break;
              }
            }
          }
        }
        Dungeon.level.occupyCell(hero);
        Dungeon.observe$();
        GameScene.updateFog$();
      } else {
        Level.beforeTransition();
        InterlevelScene.mode = InterlevelScene$Mode.RETURN;
        InterlevelScene.returnDepth = this.returnDepth;
        InterlevelScene.returnPos = this.returnPos_;
        Game.switchScene$Class($J.cls(InterlevelScene));
      }
    }
  }
  passiveBuff(): Artifact$ArtifactBuff {
    return new LloydsBeacon$beaconRecharge().$o(this)._LloydsBeacon$beaconRecharge();
  }
  charge(target: Hero, amount: number): void {
    if (this.charge_ < this.chargeCap_) {
      this.partialCharge = Math.fround(this.partialCharge + Math.fround(0.25 * amount));
      while (this.partialCharge >= Math.fround(1)) {
        this.partialCharge--;
        this.charge_++;
      }
      if (this.charge_ >= this.chargeCap_) {
        this.partialCharge = 0;
        this.charge_ = this.chargeCap_;
      }
      Item.updateQuickslot();
    }
  }
  upgrade$(): Item {
    if (this.level$() === this.levelCap) {
      return this;
    }
    this.chargeCap_++;
    GLog.p(Messages.get$Object$String$ObjectArr(this, 'levelup', []), []);
    return super.upgrade$();
  }
  desc(): string {
    let desc = super.desc();
    if (this.returnDepth !== -1) {
      desc += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'desc_set', [this.returnDepth]);
    }
    return desc;
  }
  glowing(): ItemSprite$Glowing {
    return this.returnDepth !== -1 ? LloydsBeacon.WHITE : null;
  }
  static $clinit() {
    LloydsBeacon.WHITE = new ItemSprite$Glowing()._ItemSprite$Glowing$int(16777215);
  }
}

export class LloydsBeacon$beaconRecharge extends Artifact$ArtifactBuff {
  _LloydsBeacon$beaconRecharge(): this {
    this._Artifact$ArtifactBuff();
    return this;
  }
  act(): boolean {
    if (this.$outer.charge_ < this.$outer.chargeCap_ && !this.$outer.cursed && Regeneration.regenOn()) {
      this.$outer.partialCharge = Math.fround(this.$outer.partialCharge + Math.fround(1 / (Math.fround(100 - Math.fround(((this.$outer.chargeCap_ - this.$outer.charge_) | 0) * 10)))));
      while (this.$outer.partialCharge >= Math.fround(1)) {
        this.$outer.partialCharge--;
        this.$outer.charge_++;
        if (this.$outer.charge_ === this.$outer.chargeCap_) {
          this.$outer.partialCharge = 0;
        }
      }
    }
    Item.updateQuickslot();
    this.spend(Actor.TICK);
    return true;
  }
}

let $LloydsBeacon$1$1: any = null;
/** An anonymous class (LloydsBeacon.java:220). */
function LloydsBeacon$1$1(): any {
  return $LloydsBeacon$1$1 ??= $J.local(class extends JObject {
    call(): void {
      if (this.$cv_ch != null) {
        let count = 10;
        let pos: number;
        do {
          pos = Dungeon.level.randomRespawnCell(this.$cv_ch);
          if (count-- <= 0) {
            break;
          }
        } while (pos === -1);
        if (pos === -1 || Dungeon.bossLevel$()) {
          GLog.w(Messages.get$Class$String$ObjectArr($J.cls(ScrollOfTeleportation), 'no_tele', []), []);
        } else if (this.$cv_ch.properties().contains(Char$Property.IMMOVABLE)) {
          GLog.w(Messages.get$Class$String$ObjectArr($J.cls(LloydsBeacon), 'tele_fail', []), []);
        } else {
          this.$cv_ch.pos = pos;
          if (this.$cv_ch instanceof Mob && (this.$cv_ch).state_ === (this.$cv_ch).HUNTING) {
            (this.$cv_ch).state_ = (this.$cv_ch).WANDERING;
          }
          this.$cv_ch.sprite_.place(this.$cv_ch.pos);
          this.$cv_ch.sprite_.visible_ = Dungeon.level.heroFOV[pos];
        }
      }
      Item.curUser.spendAndNext(1);
    }
    $c($ch): this {
      this.$cv_ch = $ch;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.LloydsBeacon$1$1', ['com.watabou.utils.Callback']);
}

let $LloydsBeacon$1: any = null;
/** An anonymous class (LloydsBeacon.java:190). */
function LloydsBeacon$1(): any {
  return $LloydsBeacon$1 ??= $J.local(class extends CellSelector$Listener {
    onSelect(target: number): void {
      if (target == null) {
        return;
      }
      Invisibility.dispel$();
      this.$outer.charge_ = (this.$outer.charge_ - (Dungeon.scalingDepth() > 20 ? 2 : 1)) | 0;
      Item.updateQuickslot();
      if (Actor.findChar(target) === Item.curUser) {
        ScrollOfTeleportation.teleportChar$Char(Item.curUser);
        Item.curUser.spendAndNext(1);
      } else {
        let bolt = new Ballistica()._Ballistica(Item.curUser.pos, target, Ballistica.MAGIC_BOLT);
        let ch = Actor.findChar(bolt.collisionPos);
        if (ch === Item.curUser) {
          ScrollOfTeleportation.teleportChar$Char(Item.curUser);
          Item.curUser.spendAndNext(1);
        } else {
          Sample.INSTANCE.play$Object(Assets$Sounds.ZAP);
          Item.curUser.sprite_.zap$int(bolt.collisionPos);
          Item.curUser.busy();
          MagicMissile.boltFromChar(Item.curUser.sprite_.parent, MagicMissile.BEACON, Item.curUser.sprite_, bolt.collisionPos, new (LloydsBeacon$1$1())().$o(this).$c(ch));
        }
      }
    }
    prompt(): string {
      return Messages.get$Class$String$ObjectArr($J.cls(LloydsBeacon), 'prompt', []);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.LloydsBeacon$1', []);
}

$J.define(LloydsBeacon, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.LloydsBeacon', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.Artifact', ctors: { '': '_LloydsBeacon' }, meths: { 'upgrade()': 'upgrade$', 'execute(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,java.lang.String)': 'execute$Hero$String' }, clinit: true, lazy: ['WHITE'] });
$J.define(LloydsBeacon$beaconRecharge, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.LloydsBeacon$beaconRecharge', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.Artifact$ArtifactBuff', ctors: { '': '_LloydsBeacon$beaconRecharge' }, inner: true });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Invisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invisibility');
  Regeneration = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Regeneration');
  Mob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob');
  MagicMissile = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  ScrollOfTeleportation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfTeleportation');
  Level = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Level');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  CellSelector$Listener = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.CellSelector$Listener');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  InterlevelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.InterlevelScene');
  InterlevelScene$Mode = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.InterlevelScene$Mode');
  ItemSprite$Glowing = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite$Glowing');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  QuickSlotButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.QuickSlotButton');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Game = $J.load('com.watabou.noosa.Game');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
});
