// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/Torch.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sounds, Buff, Light, FlameParticle, Catalog, ItemSpriteSheet, Sample;

export class Torch extends Item {
  static readonly AC_LIGHT: string = 'LIGHT';
  static readonly TIME_TO_LIGHT: number = 1;
  _Torch(): this {
    this._Item();
    this.image_ = ItemSpriteSheet.TORCH;
    this.stackable = true;
    this.defaultAction_ = Torch.AC_LIGHT;
    return this;
  }
  actions(hero: Hero): ArrayList<string> {
    let actions = super.actions(hero);
    actions.add(Torch.AC_LIGHT);
    return actions;
  }
  execute$Hero$String(hero: Hero, action: string): void {
    super.execute$Hero$String(hero, action);
    if ($J.equals(action, Torch.AC_LIGHT)) {
      hero.spend(Torch.TIME_TO_LIGHT);
      hero.busy();
      hero.sprite_.operate$int(hero.pos);
      this.detach(hero.belongings.backpack);
      Catalog.countUse($J.getClass(this));
      Buff.affect$Char$Class$float(hero, $J.cls(Light), Light.DURATION);
      Sample.INSTANCE.play$Object(Assets$Sounds.BURNING);
      let emitter = hero.sprite_.centerEmitter();
      emitter.start(FlameParticle.FACTORY, Math.fround(0.2), 3);
    }
  }
  isUpgradable(): boolean {
    return false;
  }
  isIdentified(): boolean {
    return true;
  }
  value(): number {
    return Math.imul(8, this.quantity);
  }
}

$J.define(Torch, 'com.shatteredpixel.shatteredpixeldungeon.items.Torch', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Item', ctors: { '': '_Torch' }, meths: { 'execute(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,java.lang.String)': 'execute$Hero$String' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Light = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Light');
  FlameParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.FlameParticle');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
