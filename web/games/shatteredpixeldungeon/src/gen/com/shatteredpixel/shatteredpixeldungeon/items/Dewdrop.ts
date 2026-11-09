// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/Dewdrop.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../jre/index.ts';
import { Item } from './Item.ts';

let Assets$Sounds, Dungeon, Statistics, Barrier, Buff, Healing, Talent, FloatingText, Waterskin, VialOfBlood, Catalog, Terrain, Messages, GameScene, CharSprite, ItemSpriteSheet, GLog, Sample;

export class Dewdrop extends Item {
  _Dewdrop(): this {
    this._Item();
    this.image_ = ItemSpriteSheet.DEWDROP;
    this.stackable = true;
    this.dropsDownHeap = true;
    return this;
  }
  doPickUp$Hero$int(hero: Hero, pos: number): boolean {
    let flask = hero.belongings.getItem($J.cls(Waterskin));
    Catalog.setSeen($J.getClass(this));
    Statistics.itemTypesDiscovered.add($J.getClass(this));
    if (flask != null && !flask.isFull()) {
      flask.collectDew(this);
      GameScene.pickUp(this, pos);
    } else {
      let terr = Dungeon.level.map_[pos];
      if (!(Dewdrop.consumeDew(1, hero, terr === Terrain.ENTRANCE || terr === Terrain.ENTRANCE_SP || terr === Terrain.EXIT || terr === Terrain.UNLOCKED_EXIT))) {
        return false;
      } else {
        Catalog.countUse($J.getClass(this));
      }
    }
    Sample.INSTANCE.play$Object(Assets$Sounds.DEWDROP);
    hero.spendAndNext(this.pickupDelay());
    return true;
  }
  static consumeDew(quantity: number, hero: Hero, force: boolean): boolean {
    let effect = $J.roundf(Math.fround(Math.fround(hero.HT * Math.fround(0.05)) * quantity));
    let heal = Math.min((hero.HT - hero.HP) | 0, effect);
    let shield = 0;
    if (hero.hasTalent(Talent.SHIELDING_DEW)) {
      if (quantity > 1 && heal < effect && VialOfBlood.delayBurstHealing()) {
        heal = $J.roundf(Math.fround(heal / VialOfBlood.totalHealMultiplier$()));
      }
      shield = (effect - heal) | 0;
      let maxShield = $J.roundf(Math.fround(Math.fround(hero.HT * Math.fround(0.2)) * hero.pointsInTalent(Talent.SHIELDING_DEW)));
      let curShield = 0;
      if (hero.buff($J.cls(Barrier)) != null) {
        curShield = hero.buff($J.cls(Barrier)).shielding();
      }
      shield = Math.min(shield, (maxShield - curShield) | 0);
    }
    if (heal > 0 || shield > 0) {
      if (heal > 0 && quantity > 1 && VialOfBlood.delayBurstHealing()) {
        let healing = Buff.affect$Char$Class(hero, $J.cls(Healing));
        healing.setHeal$int$float$int$boolean(heal, 0, VialOfBlood.maxHealPerTurn$(), true);
      } else {
        hero.HP = (hero.HP + heal) | 0;
        if (heal > 0) {
          hero.sprite_.showStatusWithIcon(CharSprite.POSITIVE, String(heal), FloatingText.HEALING, []);
        }
      }
      if (shield > 0) {
        Buff.affect$Char$Class(hero, $J.cls(Barrier)).incShield$int(shield);
        hero.sprite_.showStatusWithIcon(CharSprite.POSITIVE, String(shield), FloatingText.SHIELDING, []);
      }
    } else if (!force) {
      GLog.i(Messages.get$Class$String$ObjectArr($J.cls(Dewdrop), 'already_full', []), []);
      return false;
    }
    return true;
  }
  isUpgradable(): boolean {
    return false;
  }
  isIdentified(): boolean {
    return true;
  }
  merge(other: Item): Item {
    if (this.isSimilar(other)) {
      this.quantity = 1;
      other.quantity = 0;
    }
    return this;
  }
  quantity$int(value: number): Item {
    this.quantity = Math.min(value, 1);
    return this;
  }
}

$J.define(Dewdrop, 'com.shatteredpixel.shatteredpixeldungeon.items.Dewdrop', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Item', ctors: { '': '_Dewdrop' }, meths: { 'quantity(int)': 'quantity$int', 'doPickUp(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,int)': 'doPickUp$Hero$int' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Barrier = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Barrier');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Healing = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Healing');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  FloatingText = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.FloatingText');
  Waterskin = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Waterskin');
  VialOfBlood = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.VialOfBlood');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
