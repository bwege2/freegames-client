// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/ui/InventorySlot.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { ItemSlot } from './ItemSlot.ts';

let Assets$Sounds, Dungeon, EquipableItem, Gold, Bag, Wand, TextureCache, ColorBlock, Sample;

export class InventorySlot extends ItemSlot {
  static readonly NORMAL: number = -1722591667;
  static readonly EQUIPPED: number = -1718512756;
  bg: ColorBlock = null;
  _InventorySlot(item: Item): this {
    this._ItemSlot$Item(item);
    return this;
  }
  createChildren(): void {
    this.bg = new ColorBlock()._ColorBlock(1, 1, InventorySlot.NORMAL);
    this.add$Gizmo(this.bg);
    super.createChildren();
  }
  layout(): void {
    this.bg.size(this.width_, this.height_);
    this.bg.x = this.x;
    this.bg.y = this.y;
    super.layout();
  }
  alpha(value: number): void {
    super.alpha(value);
    this.bg.alpha$float(value);
  }
  item$Item(item: Item): void {
    super.item$Item(item);
    this.bg.visible_ = !(item instanceof Gold || item instanceof Bag);
    if (item != null) {
      let equipped = item.isEquipped(Dungeon.hero) || item === Dungeon.hero.belongings.weapon_ || item === Dungeon.hero.belongings.armor_ || item === Dungeon.hero.belongings.artifact_ || item === Dungeon.hero.belongings.misc_ || item === Dungeon.hero.belongings.ring_ || item === Dungeon.hero.belongings.secondWep_;
      this.bg.texture(TextureCache.createSolid(equipped ? InventorySlot.EQUIPPED : InventorySlot.NORMAL));
      this.bg.resetColor();
      if (item.cursed && item.cursedKnown) {
        this.bg.ra = +Math.fround(0.3);
        this.bg.ga = Math.fround(-Math.fround(0.15));
        this.bg.ba = Math.fround(-Math.fround(0.15));
      } else if (!item.isIdentified()) {
        if ((item instanceof EquipableItem || item instanceof Wand) && item.cursedKnown) {
          this.bg.ba = +Math.fround(0.3);
          this.bg.ra = Math.fround(-Math.fround(0.1));
        } else {
          this.bg.ra = +Math.fround(0.35);
          this.bg.ba = +Math.fround(0.35);
        }
      }
      if (item.name() == null) {
        this.enable(false);
      } else if (Dungeon.hero.belongings.lostInventory$() && !item.keptThroughLostInventory()) {
        this.enable(false);
      }
    } else {
      this.bg.texture(TextureCache.createSolid(InventorySlot.NORMAL));
      this.bg.resetColor();
    }
  }
  item$(): Item {
    return this.item_;
  }
  onPointerDown(): void {
    this.bg.brightness(1.5);
    Sample.INSTANCE.play$Object$float$float$float(Assets$Sounds.CLICK, Math.fround(0.7), Math.fround(0.7), Math.fround(1.2));
  }
  onPointerUp(): void {
    this.bg.brightness(1);
  }
}

$J.define(InventorySlot, 'com.shatteredpixel.shatteredpixeldungeon.ui.InventorySlot', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.ItemSlot', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.items.Item': '_InventorySlot' }, meths: { 'item()': 'item$', 'item(com.shatteredpixel.shatteredpixeldungeon.items.Item)': 'item$Item' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  EquipableItem = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.EquipableItem');
  Gold = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Gold');
  Bag = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bags.Bag');
  Wand = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.Wand');
  TextureCache = $J.load('com.watabou.gltextures.TextureCache');
  ColorBlock = $J.load('com.watabou.noosa.ColorBlock');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
