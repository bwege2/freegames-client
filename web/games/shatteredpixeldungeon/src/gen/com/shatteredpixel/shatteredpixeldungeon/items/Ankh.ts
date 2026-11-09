// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/Ankh.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sounds, CellEmitter, Speck, Waterskin, Messages, ItemSprite$Glowing, ItemSpriteSheet, GLog, Sample;

export class Ankh extends Item {
  static readonly AC_BLESS: string = 'BLESS';
  blessed: boolean = false;
  static WHITE: ItemSprite$Glowing = null;
  static readonly BLESSED: string = 'blessed';
  _Ankh(): this {
    this._Item();
    this.image_ = ItemSpriteSheet.ANKH;
    this.bones = true;
    this.blessed = false;
    return this;
  }
  isUpgradable(): boolean {
    return false;
  }
  isIdentified(): boolean {
    return true;
  }
  actions(hero: Hero): ArrayList<string> {
    let actions = super.actions(hero);
    let waterskin = hero.belongings.getItem($J.cls(Waterskin));
    if (waterskin != null && waterskin.isFull() && !this.blessed) {
      actions.add(Ankh.AC_BLESS);
    }
    return actions;
  }
  execute$Hero$String(hero: Hero, action: string): void {
    super.execute$Hero$String(hero, action);
    if ($J.equals(action, Ankh.AC_BLESS)) {
      let waterskin = hero.belongings.getItem($J.cls(Waterskin));
      if (waterskin != null) {
        this.blessed = true;
        waterskin.empty();
        GLog.p(Messages.get$Object$String$ObjectArr(this, 'bless', []), []);
        hero.spend(1);
        hero.busy();
        Sample.INSTANCE.play$Object(Assets$Sounds.DRINK);
        CellEmitter.get(hero.pos).start(Speck.factory$int(Speck.LIGHT), Math.fround(0.2), 3);
        hero.sprite_.operate$int(hero.pos);
      }
    }
  }
  desc(): string {
    if (this.blessed) {
      return Messages.get$Object$String$ObjectArr(this, 'desc_blessed', []);
    } else {
      return super.desc();
    }
  }
  isBlessed(): boolean {
    return this.blessed;
  }
  bless(): void {
    this.blessed = true;
  }
  glowing(): ItemSprite$Glowing {
    return this.isBlessed() ? Ankh.WHITE : null;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$boolean(Ankh.BLESSED, this.blessed);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.blessed = bundle.getBoolean(Ankh.BLESSED);
  }
  value(): number {
    return Math.imul(50, this.quantity);
  }
  static $clinit() {
    Ankh.WHITE = new ItemSprite$Glowing()._ItemSprite$Glowing$int(16777164);
  }
}

$J.define(Ankh, 'com.shatteredpixel.shatteredpixeldungeon.items.Ankh', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Item', ctors: { '': '_Ankh' }, meths: { 'execute(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,java.lang.String)': 'execute$Hero$String' }, clinit: true, lazy: ['WHITE'] });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  Waterskin = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Waterskin');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ItemSprite$Glowing = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite$Glowing');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
