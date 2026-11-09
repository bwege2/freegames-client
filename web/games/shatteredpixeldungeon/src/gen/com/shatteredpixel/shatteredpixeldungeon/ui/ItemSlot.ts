// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/ui/ItemSlot.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Button } from './Button.ts';

let Assets$Sprites, Dungeon, Heap, Item, Armor, Ring, Wand, Weapon, MissileWeapon, Messages, PixelScene, ItemSprite, ItemSpriteSheet, ItemSpriteSheet$Icons, BitmapText, Image, Rect;

export class ItemSlot extends Button {
  static readonly DEGRADED: number = 16729156;
  static readonly UPGRADED: number = 4521796;
  static readonly FADED: number = 10066329;
  static readonly WARNING: number = 16746496;
  static readonly ENHANCED: number = 3381759;
  static readonly MASTERED: number = 16777028;
  static readonly CURSE_INFUSED: number = 8913151;
  static readonly ENABLED: number = 1;
  static readonly DISABLED: number = Math.fround(0.3);
  margin: Rect = null;
  sprite_: ItemSprite = null;
  item_: Item = null;
  status_: BitmapText = null;
  extra: BitmapText = null;
  itemIcon: Image = null;
  level_: BitmapText = null;
  static readonly TXT_STRENGTH: string = ':%d';
  static readonly TXT_TYPICAL_STR: string = '%d?';
  static readonly TXT_LEVEL: string = '%+d';
  static CHEST: Item = null;
  static LOCKED_CHEST: Item = null;
  static CRYSTAL_CHEST: Item = null;
  static TOMB: Item = null;
  static SKELETON: Item = null;
  static REMAINS: Item = null;
  $init_ItemSlot() {
    this.margin = new Rect()._Rect$();
  }
  _ItemSlot$(): this {
    this._Button();
    this.$init_ItemSlot();
    this.sprite_.visible(false);
    this.enable(false);
    return this;
  }
  _ItemSlot$Item(item: Item): this {
    this._ItemSlot$();
    this.item$Item(item);
    return this;
  }
  createChildren(): void {
    super.createChildren();
    this.sprite_ = new ItemSprite()._ItemSprite$();
    this.add$Gizmo(this.sprite_);
    this.status_ = new BitmapText()._BitmapText$Font(PixelScene.pixelFont);
    this.add$Gizmo(this.status_);
    this.extra = new BitmapText()._BitmapText$Font(PixelScene.pixelFont);
    this.add$Gizmo(this.extra);
    this.level_ = new BitmapText()._BitmapText$Font(PixelScene.pixelFont);
    this.add$Gizmo(this.level_);
  }
  layout(): void {
    super.layout();
    this.sprite_.x = Math.fround(Math.fround(this.x + this.margin.left_) + Math.fround((Math.fround(Math.fround(this.width_ - this.sprite_.width_) - ((this.margin.left_ + this.margin.right_) | 0))) / 2));
    this.sprite_.y = Math.fround(Math.fround(this.y + this.margin.top_) + Math.fround((Math.fround(Math.fround(this.height_ - this.sprite_.height_) - ((this.margin.top_ + this.margin.bottom_) | 0))) / 2));
    PixelScene.align$Visual(this.sprite_);
    if (this.status_ != null) {
      this.status_.measure();
      if (this.status_.width_ > Math.fround(this.width_ - ((this.margin.left_ + this.margin.right_) | 0))) {
        this.status_.scale_.set$float(PixelScene.align$float(Math.fround(0.8)));
      } else {
        this.status_.scale_.set$float(1);
      }
      this.status_.x = Math.fround(this.x + this.margin.left_);
      this.status_.y = Math.fround(this.y + this.margin.top_);
      PixelScene.align$Visual(this.status_);
    }
    if (this.extra != null) {
      this.extra.x = Math.fround(Math.fround(this.x + (Math.fround(this.width_ - this.extra.width()))) - this.margin.right_);
      this.extra.y = Math.fround(this.y + this.margin.top_);
      PixelScene.align$Visual(this.extra);
      if ((Math.fround(this.status_.width() + this.extra.width())) > this.width_) {
        this.extra.visible_ = false;
      } else if (this.item_ != null) {
        this.extra.visible_ = true;
      }
    }
    if (this.itemIcon != null) {
      if (this.width_ >= Math.fround(24) || this.height_ >= Math.fround(24)) {
        this.itemIcon.x = Math.fround(Math.fround(Math.fround(this.x + this.width_) - Math.fround((Math.fround(ItemSpriteSheet$Icons.SIZE + this.itemIcon.width())) / 2)) - this.margin.right_);
        this.itemIcon.y = Math.fround(Math.fround(this.y + Math.fround((Math.fround(ItemSpriteSheet$Icons.SIZE - this.itemIcon.height_)) / 2)) + this.margin.top_);
      } else {
        this.itemIcon.x = Math.fround(Math.fround(Math.fround(this.x + this.width_) - this.itemIcon.width()) - this.margin.right_);
        this.itemIcon.y = Math.fround(this.y + this.margin.top_);
      }
      PixelScene.align$Visual(this.itemIcon);
    }
    if (this.level_ != null) {
      this.level_.x = Math.fround(Math.fround(this.x + (Math.fround(this.width_ - this.level_.width()))) - this.margin.right_);
      this.level_.y = Math.fround(Math.fround(this.y + (Math.fround(Math.fround(this.height_ - this.level_.baseLine()) - 1))) - this.margin.bottom_);
      PixelScene.align$Visual(this.level_);
    }
  }
  alpha(value: number): void {
    if (!this.active) {
      value = Math.fround(value * Math.fround(0.3));
    }
    if (this.sprite_ != null) {
      this.sprite_.alpha$float(value);
    }
    if (this.extra != null) {
      this.extra.alpha$float(value);
    }
    if (this.status_ != null) {
      this.status_.alpha$float(value);
    }
    if (this.itemIcon != null) {
      this.itemIcon.alpha$float(value);
    }
    if (this.level_ != null) {
      this.level_.alpha$float(value);
    }
  }
  clear(): void {
    this.item$Item(null);
    this.enable(true);
    this.sprite_.visible(true);
    this.sprite_.view$int$Glowing(ItemSpriteSheet.SOMETHING, null);
    this.layout();
  }
  item$Item(item: Item): void {
    if (this.item_ === item) {
      if (item != null) {
        this.sprite_.view$Item(item);
      }
      this.updateText();
      return;
    }
    this.item_ = item;
    if (item == null) {
      this.enable(false);
      this.sprite_.visible(false);
      this.updateText();
    } else {
      this.enable(true);
      this.sprite_.visible(true);
      this.sprite_.view$Item(item);
      this.updateText();
    }
  }
  updateText(): void {
    if (this.itemIcon != null) {
      this.remove$Gizmo(this.itemIcon);
      this.itemIcon = null;
    }
    if (this.item_ == null) {
      this.status_.visible_ = this.extra.visible_ = this.level_.visible_ = false;
      return;
    } else {
      this.status_.visible_ = this.extra.visible_ = this.level_.visible_ = true;
    }
    this.status_.text$String(this.item_.status());
    if (this.item_ instanceof MissileWeapon && (this.item_).durabilityLeft() <= 50 && (this.item_).durabilityLeft() <= (this.item_).durabilityPerUse$()) {
      this.status_.hardlight$int(ItemSlot.WARNING);
    } else {
      this.status_.resetColor();
    }
    if (this.item_.icon_ !== -1 && (this.item_.isIdentified() || (this.item_ instanceof Ring && (this.item_).isKnown()))) {
      this.extra.text$String(null);
      this.itemIcon = new Image()._Image$Object(Assets$Sprites.ITEM_ICONS);
      this.itemIcon.frame$RectF(ItemSpriteSheet$Icons.film.get$Object(this.item_.icon_));
      this.add$Gizmo(this.itemIcon);
    } else if (this.item_ instanceof Weapon || this.item_ instanceof Armor) {
      if (this.item_.levelKnown) {
        let str = this.item_ instanceof Weapon ? (this.item_).STRReq$() : (this.item_).STRReq$();
        this.extra.text$String(Messages.format(ItemSlot.TXT_STRENGTH, [str]));
        if (Dungeon.hero != null && str > Dungeon.hero.STR()) {
          this.extra.hardlight$int(ItemSlot.DEGRADED);
        } else if (this.item_ instanceof Weapon && (this.item_).masteryPotionBonus) {
          this.extra.hardlight$int(ItemSlot.MASTERED);
        } else if (this.item_ instanceof Armor && (this.item_).masteryPotionBonus) {
          this.extra.hardlight$int(ItemSlot.MASTERED);
        } else {
          this.extra.resetColor();
        }
      } else {
        let str = this.item_ instanceof Weapon ? (this.item_).STRReq$int(0) : (this.item_).STRReq$int(0);
        this.extra.text$String(Messages.format(ItemSlot.TXT_TYPICAL_STR, [str]));
        this.extra.hardlight$int(ItemSlot.WARNING);
      }
      this.extra.measure();
    } else {
      this.extra.text$String(null);
    }
    let trueLvl = this.item_.visiblyUpgraded();
    let buffedLvl = this.item_.buffedVisiblyUpgraded();
    if (trueLvl !== 0 || buffedLvl !== 0) {
      this.level_.text$String(Messages.format(ItemSlot.TXT_LEVEL, [buffedLvl]));
      this.level_.measure();
      if (trueLvl === buffedLvl || buffedLvl <= 0) {
        if (buffedLvl > 0) {
          if ((this.item_ instanceof Weapon && (this.item_).curseInfusionBonus) || (this.item_ instanceof Armor && (this.item_).curseInfusionBonus) || (this.item_ instanceof Wand && (this.item_).curseInfusionBonus)) {
            this.level_.hardlight$int(ItemSlot.CURSE_INFUSED);
          } else {
            this.level_.hardlight$int(ItemSlot.UPGRADED);
          }
        } else {
          this.level_.hardlight$int(ItemSlot.DEGRADED);
        }
      } else {
        this.level_.hardlight$int(buffedLvl > trueLvl ? ItemSlot.ENHANCED : ItemSlot.WARNING);
      }
    } else {
      this.level_.text$String(null);
    }
    this.layout();
  }
  enable(value: boolean): void {
    this.active = value;
    if (!this.active && Button.pressedButton === this) {
      this.hotArea.reset();
      Button.pressedButton = null;
      this.clickReady = false;
      this.onPointerUp();
    }
    let alpha = value ? ItemSlot.ENABLED : ItemSlot.DISABLED;
    this.sprite_.alpha$float(alpha);
    this.status_.alpha$float(alpha);
    this.extra.alpha$float(alpha);
    this.level_.alpha$float(alpha);
    if (this.itemIcon != null) {
      this.itemIcon.alpha$float(alpha);
    }
  }
  showExtraInfo(show: boolean): void {
    if (show) {
      this.add$Gizmo(this.extra);
    } else {
      this.remove$Gizmo(this.extra);
    }
  }
  textVisible(visible: boolean): void {
    if (visible) {
      this.add$Gizmo(this.status_);
      this.add$Gizmo(this.extra);
      this.add$Gizmo(this.level_);
    } else {
      this.remove$Gizmo(this.status_);
      this.remove$Gizmo(this.extra);
      this.remove$Gizmo(this.level_);
    }
  }
  setMargins(left: number, top: number, right: number, bottom: number): void {
    this.margin.set$int$int$int$int(left, top, right, bottom);
    this.layout();
  }
  hoverText(): string {
    if (this.item_ != null && this.item_.name() != null) {
      return Messages.titleCase(this.item_.name());
    } else {
      return super.hoverText();
    }
  }
  static $clinit() {
    ItemSlot.CHEST = new (ItemSlot$1())()._Item();
    ItemSlot.LOCKED_CHEST = new (ItemSlot$2())()._Item();
    ItemSlot.CRYSTAL_CHEST = new (ItemSlot$3())()._Item();
    ItemSlot.TOMB = new (ItemSlot$4())()._Item();
    ItemSlot.SKELETON = new (ItemSlot$5())()._Item();
    ItemSlot.REMAINS = new (ItemSlot$6())()._Item();
  }
}

let $ItemSlot$1: any = null;
/** An anonymous class (ItemSlot.java:69). */
function ItemSlot$1(): any {
  return $ItemSlot$1 ??= $J.local(class extends Item {
    image(): number {
      return ItemSpriteSheet.CHEST;
    }
    name(): string {
      return Messages.get$Class$String$ObjectArr($J.cls(Heap), 'chest', []);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.ui.ItemSlot$1', []);
}

let $ItemSlot$2: any = null;
/** An anonymous class (ItemSlot.java:73). */
function ItemSlot$2(): any {
  return $ItemSlot$2 ??= $J.local(class extends Item {
    image(): number {
      return ItemSpriteSheet.LOCKED_CHEST;
    }
    name(): string {
      return Messages.get$Class$String$ObjectArr($J.cls(Heap), 'locked_chest', []);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.ui.ItemSlot$2', []);
}

let $ItemSlot$3: any = null;
/** An anonymous class (ItemSlot.java:77). */
function ItemSlot$3(): any {
  return $ItemSlot$3 ??= $J.local(class extends Item {
    image(): number {
      return ItemSpriteSheet.CRYSTAL_CHEST;
    }
    name(): string {
      return Messages.get$Class$String$ObjectArr($J.cls(Heap), 'crystal_chest', []);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.ui.ItemSlot$3', []);
}

let $ItemSlot$4: any = null;
/** An anonymous class (ItemSlot.java:81). */
function ItemSlot$4(): any {
  return $ItemSlot$4 ??= $J.local(class extends Item {
    image(): number {
      return ItemSpriteSheet.TOMB;
    }
    name(): string {
      return Messages.get$Class$String$ObjectArr($J.cls(Heap), 'tomb', []);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.ui.ItemSlot$4', []);
}

let $ItemSlot$5: any = null;
/** An anonymous class (ItemSlot.java:85). */
function ItemSlot$5(): any {
  return $ItemSlot$5 ??= $J.local(class extends Item {
    image(): number {
      return ItemSpriteSheet.BONES;
    }
    name(): string {
      return Messages.get$Class$String$ObjectArr($J.cls(Heap), 'skeleton', []);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.ui.ItemSlot$5', []);
}

let $ItemSlot$6: any = null;
/** An anonymous class (ItemSlot.java:89). */
function ItemSlot$6(): any {
  return $ItemSlot$6 ??= $J.local(class extends Item {
    image(): number {
      return ItemSpriteSheet.REMAINS;
    }
    name(): string {
      return Messages.get$Class$String$ObjectArr($J.cls(Heap), 'remains', []);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.ui.ItemSlot$6', []);
}

$J.define(ItemSlot, 'com.shatteredpixel.shatteredpixeldungeon.ui.ItemSlot', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.Button', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.items.Item': '_ItemSlot$Item', '': '_ItemSlot$' }, meths: { 'item(com.shatteredpixel.shatteredpixeldungeon.items.Item)': 'item$Item' }, clinit: true, lazy: ['CHEST', 'LOCKED_CHEST', 'CRYSTAL_CHEST', 'TOMB', 'SKELETON', 'REMAINS'] });
$J.module(() => {
  Assets$Sprites = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sprites');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Heap = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Heap');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  Armor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor');
  Ring = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.Ring');
  Wand = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.Wand');
  Weapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon');
  MissileWeapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.MissileWeapon');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  ItemSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  ItemSpriteSheet$Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet$Icons');
  BitmapText = $J.load('com.watabou.noosa.BitmapText');
  Image = $J.load('com.watabou.noosa.Image');
  Rect = $J.load('com.watabou.utils.Rect');
});
