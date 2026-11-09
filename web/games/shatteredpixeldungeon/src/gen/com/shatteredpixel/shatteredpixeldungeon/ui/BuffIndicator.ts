// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/ui/BuffIndicator.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, Collections, JString, LinkedHashMap } from '../../../../../jre/index.ts';
import { Component } from '../../../watabou/noosa/ui/Component.ts';
import { IconButton } from './IconButton.ts';

let Assets$Sounds, Badges, Dungeon, Buff$buffType, Messages, GameScene, PixelScene, CharSprite, BuffIcon, WndInfoBuff, TextureCache, BitmapText, Image, Sample, AlphaTweener, GameMath;

export class BuffIndicator extends Component {
  static readonly NONE: number = 127;
  static readonly MIND_VISION: number = 0;
  static readonly LEVITATION: number = 1;
  static readonly FIRE: number = 2;
  static readonly POISON: number = 3;
  static readonly PARALYSIS: number = 4;
  static readonly HUNGER: number = 5;
  static readonly STARVATION: number = 6;
  static readonly TIME: number = 7;
  static readonly OOZE: number = 8;
  static readonly AMOK: number = 9;
  static readonly TERROR: number = 10;
  static readonly ROOTS: number = 11;
  static readonly INVISIBLE: number = 12;
  static readonly SHADOWS: number = 13;
  static readonly WEAKNESS: number = 14;
  static readonly FROST: number = 15;
  static readonly BLINDNESS: number = 16;
  static readonly COMBO: number = 17;
  static readonly FURY: number = 18;
  static readonly HERB_HEALING: number = 19;
  static readonly ARMOR: number = 20;
  static readonly HEART: number = 21;
  static readonly LIGHT: number = 22;
  static readonly CRIPPLE: number = 23;
  static readonly BARKSKIN: number = 24;
  static readonly IMMUNITY: number = 25;
  static readonly BLEEDING: number = 26;
  static readonly MARK: number = 27;
  static readonly DEFERRED: number = 28;
  static readonly DROWSY: number = 29;
  static readonly MAGIC_SLEEP: number = 30;
  static readonly THORNS: number = 31;
  static readonly FORESIGHT: number = 32;
  static readonly VERTIGO: number = 33;
  static readonly RECHARGING: number = 34;
  static readonly LOCKED_FLOOR: number = 35;
  static readonly CORRUPT: number = 36;
  static readonly BLESS: number = 37;
  static readonly RAGE: number = 38;
  static readonly SACRIFICE: number = 39;
  static readonly BERSERK: number = 40;
  static readonly HASTE: number = 41;
  static readonly PREPARATION: number = 42;
  static readonly WELL_FED: number = 43;
  static readonly HEALING: number = 44;
  static readonly WEAPON: number = 45;
  static readonly VULNERABLE: number = 46;
  static readonly HEX: number = 47;
  static readonly DEGRADE: number = 48;
  static readonly PINCUSHION: number = 49;
  static readonly UPGRADE: number = 50;
  static readonly MOMENTUM: number = 51;
  static readonly ANKH: number = 52;
  static readonly NOINV: number = 53;
  static readonly TARGETED: number = 54;
  static readonly IMBUE: number = 55;
  static readonly ENDURE: number = 56;
  static readonly INVERT_MARK: number = 57;
  static readonly NATURE_POWER: number = 58;
  static readonly AMULET: number = 59;
  static readonly DUEL_CLEAVE: number = 60;
  static readonly DUEL_GUARD: number = 61;
  static readonly DUEL_SPIN: number = 62;
  static readonly DUEL_EVASIVE: number = 63;
  static readonly DUEL_DANCE: number = 64;
  static readonly DUEL_BRAWL: number = 65;
  static readonly DUEL_XBOW: number = 66;
  static readonly CHALLENGE: number = 67;
  static readonly MONK_ENERGY: number = 68;
  static readonly DUEL_COMBO: number = 69;
  static readonly DAZE: number = 70;
  static readonly DISGUISE: number = 71;
  static readonly WAND: number = 72;
  static readonly HOLY_WEAPON: number = 73;
  static readonly HOLY_ARMOR: number = 74;
  static readonly SPELL_FOOD: number = 75;
  static readonly LIGHT_SHIELD: number = 76;
  static readonly HOLY_SIGHT: number = 77;
  static readonly GLYPH_RECALL: number = 78;
  static readonly ASCEND: number = 79;
  static readonly PROT_AURA: number = 80;
  static readonly ILLUMINATED: number = 81;
  static readonly TRINITY_FORM: number = 82;
  static readonly MANY_POWER: number = 83;
  static readonly SEAL_SHIELD: number = 84;
  static readonly THROWN_WEP: number = 85;
  static readonly SIZE_SMALL: number = 7;
  static readonly SIZE_LARGE: number = 16;
  static heroInstance: BuffIndicator = null;
  static bossInstance: BuffIndicator = null;
  buffButtons: LinkedHashMap<Buff, BuffIndicator$BuffButton> = null;
  needsRefresh: boolean = false;
  ch: Char = null;
  large: boolean = false;
  rowWidthLimits: number[] = null;
  rowHeightAdjusts: number[] = null;
  buffsHidden: boolean = false;
  maxBuffs: number = 0;
  _BuffIndicator(ch: Char, large: boolean): this {
    this._Component();
    this.buffButtons = new LinkedHashMap();
    this.large = false;
    this.rowWidthLimits = $J.newArray(9, 0);
    this.rowHeightAdjusts = $J.newArray(9, 0);
    this.buffsHidden = false;
    this.maxBuffs = 14;
    this.ch = ch;
    this.large = large;
    if (ch === Dungeon.hero) {
      BuffIndicator.heroInstance = this;
    }
    return this;
  }
  destroy(): void {
    super.destroy();
    if (this === BuffIndicator.heroInstance) {
      BuffIndicator.heroInstance = null;
    }
  }
  update(): void {
    super.update();
    if (this.needsRefresh) {
      this.needsRefresh = false;
      this.layout();
    }
  }
  layout(): void {
    let newBuffs = new ArrayList();
    for (const $it0 = this.ch.buffs$().iterator(); $it0.hasNext(); ) {
      let buff = $it0.next();
      if (buff.icon() !== BuffIndicator.NONE) {
        newBuffs.add(buff);
      }
    }
    let size = this.large ? BuffIndicator.SIZE_LARGE : BuffIndicator.SIZE_SMALL;
    for (let buff of $J.toArrayInto(this.buffButtons.keySet().toArray(), $J.newArray(0, null))) {
      if (!newBuffs.contains(buff)) {
        let icon = this.buffButtons.get(buff).icon_;
        icon.originToCenter();
        icon.alpha$float(Math.fround(0.6));
        this.add$Gizmo(icon);
        this.add$Gizmo(new (BuffIndicator$1())().$o(this)._AlphaTweener(icon, 0, Math.fround(0.6)));
        this.buffButtons.get(buff).destroy();
        this.remove$Gizmo(this.buffButtons.get(buff));
        this.buffButtons.remove(buff);
      }
    }
    for (const $it1 = newBuffs.iterator(); $it1.hasNext(); ) {
      let buff = $it1.next();
      if (!this.buffButtons.containsKey(buff)) {
        let icon = new BuffIndicator$BuffButton()._BuffIndicator$BuffButton(buff, this.large);
        this.add$Gizmo(icon);
        this.buffButtons.put(buff, icon);
      }
    }
    let row = 1;
    let rowTop = 0;
    let pos = 0;
    let lastIconRight = 0;
    let total = 0;
    for (const $it2 = this.buffButtons.values().iterator(); $it2.hasNext(); ) {
      let icon = $it2.next();
      if (total >= this.maxBuffs) {
        icon.visible_ = false;
        continue;
      }
      icon.visible_ = true;
      icon.topOffset = (row > 1 && !this.large) ? -1 : 0;
      icon.updateIcon();
      icon.setRect(Math.fround(this.x + Math.imul(pos, ((size + 1) | 0))), Math.fround(Math.fround(this.y + rowTop) - icon.topOffset), Math.fround((size + 1) | 0), Math.fround((size + (this.large ? 0 : 5)) | 0));
      PixelScene.align$Component(icon);
      pos++;
      lastIconRight = Math.fround(icon.right() - 1);
      if ((Math.fround(Math.fround(rowTop + Math.imul(2, size)) + 2) <= this.height_ && (Math.fround((Math.imul(pos, ((size + 1) | 0)) + size) | 0) > this.width_)) || (this.rowWidthLimits[row] !== Math.fround(0) && Math.fround((Math.imul(pos, ((size + 1) | 0)) + size) | 0) > this.rowWidthLimits[row])) {
        row++;
        rowTop = Math.fround(rowTop + Math.fround(((size + 1) | 0) + this.rowHeightAdjusts[row]));
        pos = 0;
      }
      total++;
    }
    this.buffsHidden = false;
    let excessWidth = Math.fround(lastIconRight - this.right());
    if (excessWidth > Math.fround(0)) {
      let buttons = new ArrayList();
      let lastRowY = PixelScene.align$float(Math.fround(this.y + rowTop));
      let i = 1;
      for (const $it3 = this.buffButtons.values().iterator(); $it3.hasNext(); ) {
        let button = $it3.next();
        if (i > this.maxBuffs) {
          button.visible_ = false;
          this.buffsHidden = true;
          continue;
        }
        if (Math.fround(button.top() + button.topOffset) === lastRowY) {
          buttons.add(button);
        }
        i++;
      }
      let leftAdjust = Math.fround(excessWidth / ((buttons.size() - 1) | 0));
      if (leftAdjust >= Math.fround(size * Math.fround(0.48))) {
        leftAdjust = Math.fround(size * 0.5);
      }
      let cumulativeAdjust = Math.fround(leftAdjust * ((buttons.size() - 1) | 0));
      Collections.reverse(buttons);
      for (const $it4 = buttons.iterator(); $it4.hasNext(); ) {
        let icon = $it4.next();
        icon.setPos(Math.fround(icon.left() - cumulativeAdjust), icon.top());
        icon.visible_ = icon.right() <= Math.fround(this.right() + 1);
        if (!icon.visible_) {
          this.buffsHidden = true;
        }
        PixelScene.align$Component(icon);
        this.bringToFront(icon);
        icon.givePointerPriority();
        cumulativeAdjust = Math.fround(cumulativeAdjust - leftAdjust);
      }
    }
    if (this === BuffIndicator.heroInstance && this.buffButtons.size() >= 10) {
      Badges.validateManyBuffs();
    }
  }
  allBuffsVisible(): boolean {
    return !this.buffsHidden;
  }
  static refreshHero(): void {
    if (BuffIndicator.heroInstance != null) {
      BuffIndicator.heroInstance.needsRefresh = true;
    }
  }
  static refreshBoss(): void {
    if (BuffIndicator.bossInstance != null) {
      BuffIndicator.bossInstance.needsRefresh = true;
    }
  }
  static setBossInstance(boss: BuffIndicator): void {
    BuffIndicator.bossInstance = boss;
  }
}

export class BuffIndicator$BuffButton extends IconButton {
  buff_: Buff = null;
  large: boolean = false;
  topOffset: number = 0;
  grey: Image = null;
  text_: BitmapText = null;
  _BuffIndicator$BuffButton(buff: Buff, large: boolean): this {
    this._IconButton$Image(new BuffIcon()._BuffIcon$Buff$boolean(buff, large));
    this.topOffset = 0;
    this.buff_ = buff;
    this.large = large;
    this.bringToFront(this.grey);
    this.bringToFront(this.text_);
    return this;
  }
  createChildren(): void {
    super.createChildren();
    this.grey = new Image()._Image$Object(TextureCache.createSolid(-865704346));
    this.add$Gizmo(this.grey);
    this.text_ = new BitmapText()._BitmapText$Font(PixelScene.pixelFont);
    this.add$Gizmo(this.text_);
  }
  updateIcon(): void {
    (this.icon_).refresh$Buff(this.buff_);
    if (!this.large || (this.buff_.iconTextDisplay().length === 0)) {
      this.text_.visible_ = false;
      this.grey.visible_ = true;
      let fadeHeight = Math.fround(GameMath.gate(0, this.buff_.iconFadePercent(), 1) * this.icon_.height());
      let zoom = (this.camera() != null) ? this.camera().zoom_ : 1;
      if (fadeHeight < Math.fround(this.icon_.height() / 2)) {
        this.grey.scale_.set$float$float(this.icon_.width(), Math.fround(Math.fround(Math.ceil(Math.fround(zoom * fadeHeight))) / zoom));
      } else {
        this.grey.scale_.set$float$float(this.icon_.width(), Math.fround(Math.fround(Math.floor(Math.fround(zoom * fadeHeight))) / zoom));
      }
    } else if (!(this.buff_.iconTextDisplay().length === 0)) {
      this.text_.visible_ = true;
      this.grey.visible_ = false;
      if (this.buff_.type_ === Buff$buffType.POSITIVE) {
        this.text_.hardlight$int(CharSprite.POSITIVE);
      } else if (this.buff_.type_ === Buff$buffType.NEGATIVE) {
        this.text_.hardlight$int(CharSprite.NEGATIVE);
      }
      this.text_.alpha$float(Math.fround(0.7));
      this.text_.text$String(this.buff_.iconTextDisplay());
      this.text_.measure();
    }
  }
  layout(): void {
    super.layout();
    this.grey.x = this.icon_.x = Math.fround(this.x + (this.large ? 0 : 1));
    this.grey.y = this.icon_.y = Math.fround(Math.fround(this.y + (this.large ? 0 : 2)) + this.topOffset);
    if (this.text_.width_ > this.width()) {
      this.text_.scale_.set$float(PixelScene.align$float(0.5));
    } else {
      this.text_.scale_.set$float(1);
    }
    this.text_.x = Math.fround(Math.fround(Math.fround(this.x + this.width()) - this.text_.width()) - 1);
    this.text_.y = Math.fround(Math.fround(Math.fround(this.y + this.width()) - this.text_.baseLine()) - 2);
  }
  onClick(): void {
    if (this.buff_.icon() !== BuffIndicator.NONE) {
      GameScene.show(new WndInfoBuff()._WndInfoBuff(this.buff_));
    }
  }
  onPointerDown(): void {
    Sample.INSTANCE.play$Object(Assets$Sounds.CLICK);
  }
  onPointerUp(): void {
  }
  hoverText(): string {
    return Messages.titleCase(this.buff_.name());
  }
}

let $BuffIndicator$1: any = null;
/** An anonymous class (BuffIndicator.java:207). */
function BuffIndicator$1(): any {
  return $BuffIndicator$1 ??= $J.local(class extends AlphaTweener {
    updateValues(progress: number): void {
      super.updateValues(progress);
      this.image_.scale_.set$float(Math.fround(1 + Math.fround(5 * progress)));
    }
    onComplete(): void {
      this.image_.killAndErase();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator$1', []);
}

$J.define(BuffIndicator, 'com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator', { kind: 'class', sup: 'com.watabou.noosa.ui.Component', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.actors.Char,boolean': '_BuffIndicator' } });
$J.define(BuffIndicator$BuffButton, 'com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator$BuffButton', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.IconButton', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff,boolean': '_BuffIndicator$BuffButton' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  BuffIcon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIcon');
  WndInfoBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndInfoBuff');
  TextureCache = $J.load('com.watabou.gltextures.TextureCache');
  BitmapText = $J.load('com.watabou.noosa.BitmapText');
  Image = $J.load('com.watabou.noosa.Image');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  AlphaTweener = $J.load('com.watabou.noosa.tweeners.AlphaTweener');
  GameMath = $J.load('com.watabou.utils.GameMath');
});
