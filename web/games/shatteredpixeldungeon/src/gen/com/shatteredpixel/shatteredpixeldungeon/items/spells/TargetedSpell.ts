// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/spells/TargetedSpell.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Spell } from './Spell.ts';

let Assets$Sounds, Actor, Invisibility, Talent, MagicMissile, Item, Catalog, Ballistica, Messages, CellSelector$Listener, GameScene, QuickSlotButton, Sample, Random;

export class TargetedSpell extends Spell {
  collisionProperties_: number = 0;
  static targeter: CellSelector$Listener = null;
  _TargetedSpell(): this {
    this._Spell();
    this.collisionProperties_ = Ballistica.PROJECTILE;
    return this;
  }
  onCast(hero: Hero): void {
    GameScene.selectCell(TargetedSpell.targeter);
  }
  fx(bolt: Ballistica, callback: Callback): void {
    MagicMissile.boltFromChar(Item.curUser.sprite_.parent, MagicMissile.MAGIC_MISSILE, Item.curUser.sprite_, bolt.collisionPos, callback);
    Sample.INSTANCE.play$Object(Assets$Sounds.ZAP);
  }
  onSpellused(): void {
    this.detach(Item.curUser.belongings.backpack);
    Invisibility.dispel$();
    Item.updateQuickslot();
    Item.curUser.spendAndNext(this.timeToCast());
    Catalog.countUse($J.getClass(this));
    if (Random.Float$() < this.talentChance) {
      Talent.onScrollUsed(Item.curUser, Item.curUser.pos, this.talentFactor, $J.getClass(this));
    }
  }
  timeToCast(): number {
    return Actor.TICK;
  }
  static $clinit() {
    TargetedSpell.targeter = new (TargetedSpell$1())()._CellSelector$Listener();
  }
}

let $TargetedSpell$1$1: any = null;
/** An anonymous class (TargetedSpell.java:104). */
function TargetedSpell$1$1(): any {
  return $TargetedSpell$1$1 ??= $J.local(class extends JObject {
    call(): void {
      this.$cv_curSpell.affectTarget(this.$cv_shot, Item.curUser);
    }
    $c($curSpell, $shot): this {
      this.$cv_curSpell = $curSpell; this.$cv_shot = $shot;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.spells.TargetedSpell$1$1', ['com.watabou.utils.Callback']);
}

let $TargetedSpell$1: any = null;
/** An anonymous class (TargetedSpell.java:75). */
function TargetedSpell$1(): any {
  return $TargetedSpell$1 ??= $J.local(class extends CellSelector$Listener {
    onSelect(target: number): void {
      if (target != null) {
        let curSpell: TargetedSpell;
        if (Item.curItem instanceof TargetedSpell) {
          curSpell = Item.curItem;
        } else {
          return;
        }
        let shot = new Ballistica()._Ballistica(Item.curUser.pos, target, curSpell.collisionProperties_);
        let cell = shot.collisionPos;
        Item.curUser.sprite_.zap$int(cell);
        if (Actor.findChar(target) != null) {
          QuickSlotButton.target(Actor.findChar(target));
        } else {
          QuickSlotButton.target(Actor.findChar(cell));
        }
        Item.curUser.busy();
        curSpell.fx(shot, new (TargetedSpell$1$1())().$o(this).$c(curSpell, shot));
      }
    }
    prompt(): string {
      return Messages.get$Class$String$ObjectArr($J.cls(TargetedSpell), 'prompt', []);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.spells.TargetedSpell$1', []);
}

$J.define(TargetedSpell, 'com.shatteredpixel.shatteredpixeldungeon.items.spells.TargetedSpell', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.spells.Spell', ctors: { '': '_TargetedSpell' }, clinit: true, lazy: ['targeter'] });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Invisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invisibility');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  MagicMissile = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  CellSelector$Listener = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.CellSelector$Listener');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  QuickSlotButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.QuickSlotButton');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  Random = $J.load('com.watabou.utils.Random');
});
