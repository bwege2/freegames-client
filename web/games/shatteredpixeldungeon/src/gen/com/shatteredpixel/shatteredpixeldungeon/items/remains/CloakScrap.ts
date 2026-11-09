// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/remains/CloakScrap.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sounds, ArtifactRecharge, ScrollOfRecharging, ItemSpriteSheet, Sample;

export class CloakScrap extends RemainsItem {
  _CloakScrap(): this {
    this._RemainsItem();
    this.image_ = ItemSpriteSheet.CLOAK_SCRAP;
    return this;
  }
  doEffect(hero: Hero): void {
    ArtifactRecharge.chargeArtifacts(hero, 4);
    ScrollOfRecharging.charge(hero);
    Sample.INSTANCE.play$Object(Assets$Sounds.CHARGEUP);
  }
}

$J.define(CloakScrap, 'com.shatteredpixel.shatteredpixeldungeon.items.remains.CloakScrap', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.remains.RemainsItem', ctors: { '': '_CloakScrap' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  ArtifactRecharge = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.ArtifactRecharge');
  ScrollOfRecharging = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfRecharging');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
