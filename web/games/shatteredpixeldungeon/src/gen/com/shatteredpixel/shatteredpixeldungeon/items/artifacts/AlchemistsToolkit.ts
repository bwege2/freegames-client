// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/artifacts/AlchemistsToolkit.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../jre/index.ts';
import { Artifact } from './Artifact.ts';
import { Artifact$ArtifactBuff } from './Artifact.ts';

let Assets$Sounds, Dungeon, Actor, MagicImmune, Talent, Item, RingOfEnergy, Catalog, Messages, AlchemyScene, GameScene, ItemSprite, ItemSpriteSheet, GLog, WndOptions, Game, Sample;

export class AlchemistsToolkit extends Artifact {
  static readonly AC_BREW: string = 'BREW';
  static readonly AC_ENERGIZE: string = 'ENERGIZE';
  warmUpDelay: number = 0;
  static readonly WARM_UP: string = 'warm_up';
  _AlchemistsToolkit(): this {
    this._Artifact();
    this.image_ = ItemSpriteSheet.ARTIFACT_TOOLKIT;
    this.defaultAction_ = AlchemistsToolkit.AC_BREW;
    this.levelCap = 10;
    this.charge_ = 0;
    this.partialCharge = 0;
    return this;
  }
  actions(hero: Hero): ArrayList<string> {
    let actions = super.actions(hero);
    if (this.isEquipped(hero) && !this.cursed && hero.buff($J.cls(MagicImmune)) == null) {
      actions.add(AlchemistsToolkit.AC_BREW);
      if (this.level$() < this.levelCap) {
        actions.add(AlchemistsToolkit.AC_ENERGIZE);
      }
    }
    return actions;
  }
  execute$Hero$String(hero: Hero, action: string): void {
    super.execute$Hero$String(hero, action);
    if (hero.buff($J.cls(MagicImmune)) != null) {
      return;
    }
    if ($J.equals(action, AlchemistsToolkit.AC_BREW)) {
      if (!this.isEquipped(hero)) {
        GLog.i(Messages.get$Object$String$ObjectArr(this, 'need_to_equip', []), []);
      } else if (this.cursed) {
        GLog.w(Messages.get$Object$String$ObjectArr(this, 'cursed', []), []);
      } else if (this.warmUpDelay > Math.fround(0)) {
        GLog.w(Messages.get$Object$String$ObjectArr(this, 'not_ready', []), []);
      } else {
        AlchemyScene.assignToolkit(this);
        Game.switchScene$Class($J.cls(AlchemyScene));
      }
    } else if ($J.equals(action, AlchemistsToolkit.AC_ENERGIZE)) {
      if (!this.isEquipped(hero)) {
        GLog.i(Messages.get$Object$String$ObjectArr(this, 'need_to_equip', []), []);
      } else if (this.cursed) {
        GLog.w(Messages.get$Object$String$ObjectArr(this, 'cursed', []), []);
      } else if (Dungeon.energy < 6) {
        GLog.w(Messages.get$Object$String$ObjectArr(this, 'need_energy', []), []);
      } else {
        let maxLevels = Math.min((this.levelCap - this.level$()) | 0, $J.idiv(Dungeon.energy, 6));
        let options: string[];
        if (maxLevels > 1) {
          options = [Messages.get$Object$String$ObjectArr(this, 'energize_1', []), Messages.get$Object$String$ObjectArr(this, 'energize_all', [Math.imul(6, maxLevels), maxLevels])];
        } else {
          options = [Messages.get$Object$String$ObjectArr(this, 'energize_1', [])];
        }
        GameScene.show(new (AlchemistsToolkit$1())().$o(this).$c(maxLevels)._WndOptions$Image$String$String$StringArr(new ItemSprite()._ItemSprite$int(this.image_), Messages.titleCase(this.name()), Messages.get$Object$String$ObjectArr(this, 'energize_desc', []), options));
      }
    }
    Item.updateQuickslot();
  }
  status(): string {
    if (this.isEquipped(Dungeon.hero) && this.warmUpDelay > Math.fround(0) && !this.cursed) {
      return Messages.format('%d%%', [Math.max(0, (100 - $J.d2i(this.warmUpDelay)) | 0)]);
    } else {
      return super.status();
    }
  }
  passiveBuff(): Artifact$ArtifactBuff {
    return new AlchemistsToolkit$kitEnergy().$o(this)._AlchemistsToolkit$kitEnergy();
  }
  charge(target: Hero, amount: number): void {
    if (target.buff($J.cls(MagicImmune)) != null) {
      return;
    }
    this.partialCharge = Math.fround(this.partialCharge + Math.fround(0.25 * amount));
    while (this.partialCharge >= Math.fround(1)) {
      this.partialCharge--;
      this.charge_++;
      Item.updateQuickslot();
    }
  }
  availableEnergy(): number {
    return this.charge_;
  }
  consumeEnergy(amount: number): number {
    let result = (amount - this.charge_) | 0;
    this.charge_ = Math.max(0, (this.charge_ - amount) | 0);
    Talent.onArtifactUsed(Dungeon.hero);
    return Math.max(0, result);
  }
  desc(): string {
    let result = Messages.get$Object$String$ObjectArr(this, 'desc', []);
    if (this.isEquipped(Dungeon.hero)) {
      if (this.cursed) {
        result += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'desc_cursed', []);
      } else if (this.warmUpDelay > Math.fround(0)) {
        result += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'desc_warming', []);
      } else {
        result += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'desc_hint', []);
      }
    }
    return result;
  }
  doEquip(hero: Hero): boolean {
    if (super.doEquip(hero)) {
      this.warmUpDelay = 101;
      return true;
    } else {
      return false;
    }
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$float(AlchemistsToolkit.WARM_UP, this.warmUpDelay);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.warmUpDelay = bundle.getFloat(AlchemistsToolkit.WARM_UP);
  }
}

export class AlchemistsToolkit$kitEnergy extends Artifact$ArtifactBuff {
  _AlchemistsToolkit$kitEnergy(): this {
    this._Artifact$ArtifactBuff();
    return this;
  }
  act(): boolean {
    if (this.$outer.warmUpDelay > Math.fround(0)) {
      if (this.$outer.level$() === 10) {
        this.$outer.warmUpDelay = 0;
      } else if (this.$outer.warmUpDelay === Math.fround(101)) {
        this.$outer.warmUpDelay = 100;
      } else if (!this.$outer.cursed && this.target.buff($J.cls(MagicImmune)) == null) {
        let turnsToWarmUp = Math.fround($J.d2i($J.pow((10 - this.$outer.level$()) | 0, 2)));
        this.$outer.warmUpDelay = Math.fround(this.$outer.warmUpDelay - Math.fround(100 / turnsToWarmUp));
      }
      Item.updateQuickslot();
    }
    this.spend(Actor.TICK);
    return true;
  }
  gainCharge(levelPortion: number): void {
    if (this.$outer.cursed || this.target.buff($J.cls(MagicImmune)) != null) {
      return;
    }
    let chargeGain = Math.fround(((2 + this.$outer.level$()) | 0) * levelPortion);
    chargeGain = Math.fround(chargeGain * RingOfEnergy.artifactChargeMultiplier(this.target));
    this.$outer.partialCharge = Math.fround(this.$outer.partialCharge + chargeGain);
    while (this.$outer.partialCharge >= Math.fround(1)) {
      this.$outer.charge_++;
      this.$outer.partialCharge = Math.fround(this.$outer.partialCharge - 1);
      Item.updateQuickslot();
    }
  }
}

let $AlchemistsToolkit$1: any = null;
/** An anonymous class (AlchemistsToolkit.java:108). */
function AlchemistsToolkit$1(): any {
  return $AlchemistsToolkit$1 ??= $J.local(class extends WndOptions {
    onSelect(index: number): void {
      super.onSelect(index);
      if (index === 0) {
        Dungeon.energy = (Dungeon.energy - 6) | 0;
        Sample.INSTANCE.play$Object(Assets$Sounds.DRINK);
        Sample.INSTANCE.playDelayed$Object$float(Assets$Sounds.PUFF, 0.5);
        Dungeon.hero.sprite_.operate$int(Dungeon.hero.pos);
        this.$outer.upgrade$();
        Catalog.countUse($J.cls(AlchemistsToolkit));
      } else if (index === 1) {
        Dungeon.energy = (Dungeon.energy - Math.imul(6, this.$cv_maxLevels)) | 0;
        Sample.INSTANCE.play$Object(Assets$Sounds.DRINK);
        Sample.INSTANCE.playDelayed$Object$float(Assets$Sounds.PUFF, 0.5);
        Dungeon.hero.sprite_.operate$int(Dungeon.hero.pos);
        this.$outer.upgrade$int(this.$cv_maxLevels);
        Catalog.countUses($J.cls(AlchemistsToolkit), this.$cv_maxLevels);
      }
    }
    hasIcon(index: number): boolean {
      return true;
    }
    getIcon(index: number): Image {
      return new ItemSprite()._ItemSprite$int(ItemSpriteSheet.ENERGY);
    }
    $c($maxLevels): this {
      this.$cv_maxLevels = $maxLevels;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.AlchemistsToolkit$1', []);
}

$J.define(AlchemistsToolkit, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.AlchemistsToolkit', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.Artifact', ctors: { '': '_AlchemistsToolkit' }, meths: { 'execute(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,java.lang.String)': 'execute$Hero$String' } });
$J.define(AlchemistsToolkit$kitEnergy, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.AlchemistsToolkit$kitEnergy', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.Artifact$ArtifactBuff', ctors: { '': '_AlchemistsToolkit$kitEnergy' }, inner: true });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  MagicImmune = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MagicImmune');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  RingOfEnergy = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfEnergy');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  AlchemyScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.AlchemyScene');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ItemSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  WndOptions = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndOptions');
  Game = $J.load('com.watabou.noosa.Game');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
