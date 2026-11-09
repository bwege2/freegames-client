// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/remains/SealShard.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { RemainsItem } from './RemainsItem.ts';

let Assets$Sounds, Barrier, Buff, FloatingText, CharSprite, ItemSpriteSheet, Sample;

export class SealShard extends RemainsItem {
  _SealShard(): this {
    this._RemainsItem();
    this.image_ = ItemSpriteSheet.SEAL_SHARD;
    return this;
  }
  doEffect(hero: Hero): void {
    Buff.affect$Char$Class(hero, $J.cls(Barrier)).incShield$int($J.roundf(Math.fround(hero.HT / 5)));
    hero.sprite_.showStatusWithIcon(CharSprite.POSITIVE, String($J.roundf(Math.fround(hero.HT / 5))), FloatingText.SHIELDING, []);
    Sample.INSTANCE.play$Object(Assets$Sounds.UNLOCK);
  }
}

$J.define(SealShard, 'com.shatteredpixel.shatteredpixeldungeon.items.remains.SealShard', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.remains.RemainsItem', ctors: { '': '_SealShard' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Barrier = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Barrier');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  FloatingText = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.FloatingText');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
