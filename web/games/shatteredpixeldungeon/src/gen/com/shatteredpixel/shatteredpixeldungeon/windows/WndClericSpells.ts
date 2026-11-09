// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/windows/WndClericSpells.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList } from '../../../../../jre/index.ts';
import { Window } from '../ui/Window.ts';
import { IconButton } from '../ui/IconButton.ts';

let Chrome, Chrome$Type, Dungeon, SPDSettings, Talent, ClericSpell, GuidingLight, HolyTome, Messages, GameScene, PixelScene, ItemSprite, HeroIcon, Icons, QuickSlotButton, RightClickMenu, GLog, IconTitle, WndTitledMessage, PointerEvent, ColorBlock, Image, DeviceCompat;

export class WndClericSpells extends Window {
  static readonly WIDTH: number = 120;
  static BTN_SIZE: number = 0;
  _WndClericSpells(tome: HolyTome, cleric: Hero, info: boolean): this {
    this._Window$();
    let title: IconTitle;
    if (!info) {
      title = new IconTitle()._IconTitle$Image$String(new ItemSprite()._ItemSprite$Item(tome), Messages.titleCase(Messages.get$Object$String$ObjectArr(this, 'cast_title', [])));
    } else {
      title = new IconTitle()._IconTitle$Image$String(Icons.INFO.get(), Messages.titleCase(Messages.get$Object$String$ObjectArr(this, 'info_title', [])));
    }
    title.setRect(0, 0, Math.fround(WndClericSpells.WIDTH), 0);
    this.add$Gizmo(title);
    let btnInfo = new (WndClericSpells$1())().$o(this).$c(tome, cleric, info)._IconButton$Image(info ? new ItemSprite()._ItemSprite$Item(tome) : Icons.INFO.get());
    btnInfo.setRect(Math.fround((WndClericSpells.WIDTH - 16) | 0), 0, 16, 16);
    this.add$Gizmo(btnInfo);
    let msg: RenderedTextBlock;
    if (info) {
      msg = PixelScene.renderTextBlock$String$int(Messages.get$Object$String$ObjectArr(this, 'info_desc', []), 6);
    } else if (DeviceCompat.isDesktop()) {
      msg = PixelScene.renderTextBlock$String$int(Messages.get$Object$String$ObjectArr(this, 'cast_desc_desktop', []), 6);
    } else {
      msg = PixelScene.renderTextBlock$String$int(Messages.get$Object$String$ObjectArr(this, 'cast_desc_mobile', []), 6);
    }
    msg.maxWidth$int(WndClericSpells.WIDTH);
    msg.setPos(0, Math.fround(title.bottom() + 4));
    this.add$Gizmo(msg);
    let top = ($J.d2i(msg.bottom()) + 4) | 0;
    for (let i = 1; i <= Talent.MAX_TALENT_TIERS; i++) {
      let spells = ClericSpell.getSpellList(cleric, i);
      if (!spells.isEmpty() && i !== 1) {
        top = (top + (WndClericSpells.BTN_SIZE + 2)) | 0;
        let sep = new ColorBlock()._ColorBlock(Math.fround(WndClericSpells.WIDTH), 1, -16777216);
        sep.y = Math.fround(top);
        this.add$Gizmo(sep);
        top = (top + 3) | 0;
      }
      let spellBtns = new ArrayList();
      for (const $it0 = spells.iterator(); $it0.hasNext(); ) {
        let spell = $it0.next();
        let spellBtn = new WndClericSpells$SpellButton().$o(this)._WndClericSpells$SpellButton(spell, tome, info);
        this.add$Gizmo(spellBtn);
        spellBtns.add(spellBtn);
      }
      let left = (2 + $J.idiv(((WndClericSpells.WIDTH - Math.imul(spellBtns.size(), ((WndClericSpells.BTN_SIZE + 4) | 0))) | 0), 2)) | 0;
      for (const $it1 = spellBtns.iterator(); $it1.hasNext(); ) {
        let btn = $it1.next();
        btn.setRect(Math.fround(left), Math.fround(top), Math.fround(WndClericSpells.BTN_SIZE), Math.fround(WndClericSpells.BTN_SIZE));
        left = $J.d2i(Math.fround(left + Math.fround(btn.width() + 4)));
      }
    }
    this.resize(WndClericSpells.WIDTH, (top + WndClericSpells.BTN_SIZE) | 0);
    if (SPDSettings.interfaceSize$() !== 2) {
      this.offset$int$int(0, (($J.idiv(PixelScene.uiCamera.height_, 2) - 30 - $J.idiv(this.height_, 2)) | 0));
    }
    return this;
  }
  static $clinit() {
    WndClericSpells.BTN_SIZE = 20;
  }
}

export class WndClericSpells$SpellButton extends IconButton {
  spell: ClericSpell = null;
  tome: HolyTome = null;
  info_: boolean = false;
  bg: NinePatch = null;
  _WndClericSpells$SpellButton(spell: ClericSpell, tome: HolyTome, info: boolean): this {
    this._IconButton$Image(new HeroIcon()._HeroIcon$ClericSpell(spell));
    this.spell = spell;
    this.tome = tome;
    this.info_ = info;
    if (!tome.canCast(Dungeon.hero, spell)) {
      this.icon_.alpha$float(Math.fround(0.3));
    } else if (spell === GuidingLight.INSTANCE && spell.chargeUse(Dungeon.hero) === Math.fround(0)) {
      this.icon_.brightness(3);
    }
    this.bg = Chrome.get(Chrome$Type.TOAST);
    this.addToBack(this.bg);
    return this;
  }
  onPointerDown(): void {
    super.onPointerDown();
    if (this.spell === GuidingLight.INSTANCE && this.spell.chargeUse(Dungeon.hero) === Math.fround(0)) {
      this.icon_.brightness(4);
    }
  }
  onPointerUp(): void {
    super.onPointerUp();
    if (!this.tome.canCast(Dungeon.hero, this.spell)) {
      this.icon_.alpha$float(Math.fround(0.3));
    } else if (this.spell === GuidingLight.INSTANCE && this.spell.chargeUse(Dungeon.hero) === Math.fround(0)) {
      this.icon_.brightness(3);
    }
  }
  layout(): void {
    super.layout();
    if (this.bg != null) {
      this.bg.size(this.width_, this.height_);
      this.bg.x = this.x;
      this.bg.y = this.y;
    }
  }
  onClick(): void {
    if (this.info_) {
      GameScene.show(new WndTitledMessage()._WndTitledMessage$Image$String$String(new HeroIcon()._HeroIcon$ClericSpell(this.spell), Messages.titleCase(this.spell.name()), this.spell.desc()));
    } else {
      this.$outer.hide();
      if (!this.tome.canCast(Dungeon.hero, this.spell)) {
        GLog.w(Messages.get$Class$String$ObjectArr($J.cls(HolyTome), 'no_spell', []), []);
      } else {
        this.spell.onCast(this.tome, Dungeon.hero);
        if (this.spell.targetingFlags() !== -1 && Dungeon.quickslot.contains(this.tome)) {
          this.tome.targetingSpell = this.spell;
          QuickSlotButton.useTargeting(Dungeon.quickslot.getSlot(this.tome));
        }
      }
    }
  }
  onLongClick(): boolean {
    this.$outer.hide();
    this.tome.setQuickSpell(this.spell);
    return true;
  }
  onRightClick(): void {
    super.onRightClick();
    let r = new (WndClericSpells$SpellButton$1())().$o(this)._RightClickMenu$Image$String$StringArr(new Image()._Image$Image(this.icon_), Messages.titleCase(this.spell.name()), [Messages.get$Class$String$ObjectArr($J.cls(WndClericSpells), 'cast', []), Messages.get$Class$String$ObjectArr($J.cls(WndClericSpells), 'info', []), Messages.get$Class$String$ObjectArr($J.cls(WndClericSpells), 'quick_cast', [])]);
    this.parent.addToFront(r);
    r.camera_ = this.camera();
    let mousePos = PointerEvent.currentHoverPos();
    mousePos = this.camera_.screenToCamera($J.d2i(mousePos.x), $J.d2i(mousePos.y));
    r.setPos(Math.fround(mousePos.x - 3), Math.fround(mousePos.y - 3));
  }
  hoverText(): string {
    return '_' + Messages.titleCase(this.spell.name()) + '_\n' + this.spell.shortDesc();
  }
}

let $WndClericSpells$1: any = null;
/** An anonymous class (WndClericSpells.java:71). */
function WndClericSpells$1(): any {
  return $WndClericSpells$1 ??= $J.local(class extends IconButton {
    onClick(): void {
      GameScene.show(new WndClericSpells()._WndClericSpells(this.$cv_tome, this.$cv_cleric, !this.$cv_info));
      this.$outer.hide();
    }
    $c($tome, $cleric, $info): this {
      this.$cv_tome = $tome; this.$cv_cleric = $cleric; this.$cv_info = $info;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndClericSpells$1', []);
}

let $WndClericSpells$SpellButton$1: any = null;
/** An anonymous class (WndClericSpells.java:222). */
function WndClericSpells$SpellButton$1(): any {
  return $WndClericSpells$SpellButton$1 ??= $J.local(class extends RightClickMenu {
    onSelect(index: number): void {
      switch (index) {
        default:
          break;
        case 0:
          this.$outer.$outer.hide();
          if (!this.$outer.tome.canCast(Dungeon.hero, this.$outer.spell)) {
            GLog.w(Messages.get$Class$String$ObjectArr($J.cls(HolyTome), 'no_spell', []), []);
          } else {
            this.$outer.spell.onCast(this.$outer.tome, Dungeon.hero);
            if (this.$outer.spell.targetingFlags() !== -1 && Dungeon.quickslot.contains(this.$outer.tome)) {
              this.$outer.tome.targetingSpell = this.$outer.spell;
              QuickSlotButton.useTargeting(Dungeon.quickslot.getSlot(this.$outer.tome));
            }
          }
          break;
        case 1:
          GameScene.show(new WndTitledMessage()._WndTitledMessage$Image$String$String(new HeroIcon()._HeroIcon$ClericSpell(this.$outer.spell), Messages.titleCase(this.$outer.spell.name()), this.$outer.spell.desc()));
          break;
        case 2:
          this.$outer.$outer.hide();
          this.$outer.tome.setQuickSpell(this.$outer.spell);
          break;
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndClericSpells$SpellButton$1', []);
}

$J.define(WndClericSpells, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndClericSpells', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.Window', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.HolyTome,com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,boolean': '_WndClericSpells' }, clinit: true, lazy: ['BTN_SIZE'] });
$J.define(WndClericSpells$SpellButton, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndClericSpells$SpellButton', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.IconButton', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.ClericSpell,com.shatteredpixel.shatteredpixeldungeon.items.artifacts.HolyTome,boolean': '_WndClericSpells$SpellButton' }, inner: true });
$J.module(() => {
  Chrome = $J.load('com.shatteredpixel.shatteredpixeldungeon.Chrome');
  Chrome$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.Chrome$Type');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  SPDSettings = $J.load('com.shatteredpixel.shatteredpixeldungeon.SPDSettings');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  ClericSpell = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.ClericSpell');
  GuidingLight = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.GuidingLight');
  HolyTome = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.HolyTome');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  ItemSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite');
  HeroIcon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.HeroIcon');
  Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Icons');
  QuickSlotButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.QuickSlotButton');
  RightClickMenu = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.RightClickMenu');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  IconTitle = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.IconTitle');
  WndTitledMessage = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndTitledMessage');
  PointerEvent = $J.load('com.watabou.input.PointerEvent');
  ColorBlock = $J.load('com.watabou.noosa.ColorBlock');
  Image = $J.load('com.watabou.noosa.Image');
  DeviceCompat = $J.load('com.watabou.utils.DeviceCompat');
});
