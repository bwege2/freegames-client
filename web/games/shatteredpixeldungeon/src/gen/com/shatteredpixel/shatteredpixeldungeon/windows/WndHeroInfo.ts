// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/windows/WndHeroInfo.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, JString } from '../../../../../jre/index.ts';
import { WndTabbed } from './WndTabbed.ts';
import { Component } from '../../../watabou/noosa/ui/Component.ts';

let Badges, Badges$Badge, HeroClass, Talent, Messages, PixelScene, ItemSprite, ItemSpriteSheet, IconButton, Icons, TalentButton$Mode, TalentsPane, Window, WndInfoArmorAbility, WndInfoSubclass, WndTabbed$IconTab, Game, DeviceCompat;

export class WndHeroInfo extends WndTabbed {
  heroInfo: WndHeroInfo$HeroInfoTab = null;
  talentInfo: WndHeroInfo$TalentInfoTab = null;
  subclassInfo: WndHeroInfo$SubclassInfoTab = null;
  abilityInfo_: WndHeroInfo$ArmorAbilityInfoTab = null;
  static WIDTH: number = 0;
  static MIN_HEIGHT: number = 0;
  static MARGIN: number = 0;
  _WndHeroInfo(cl: HeroClass): this {
    this._WndTabbed();
    let tabIcon: Image;
    switch (cl) {
      case HeroClass.WARRIOR:
      default:
        tabIcon = new ItemSprite()._ItemSprite$int$Glowing(ItemSpriteSheet.SEAL, null);
        break;
      case HeroClass.MAGE:
        tabIcon = new ItemSprite()._ItemSprite$int$Glowing(ItemSpriteSheet.MAGES_STAFF, null);
        break;
      case HeroClass.ROGUE:
        tabIcon = new ItemSprite()._ItemSprite$int$Glowing(ItemSpriteSheet.ARTIFACT_CLOAK, null);
        break;
      case HeroClass.HUNTRESS:
        tabIcon = new ItemSprite()._ItemSprite$int$Glowing(ItemSpriteSheet.SPIRIT_BOW, null);
        break;
      case HeroClass.DUELIST:
        tabIcon = new ItemSprite()._ItemSprite$int$Glowing(ItemSpriteSheet.RAPIER, null);
        break;
      case HeroClass.CLERIC:
        tabIcon = new ItemSprite()._ItemSprite$int$Glowing(ItemSpriteSheet.ARTIFACT_TOME, null);
        break;
    }
    let finalHeight = WndHeroInfo.MIN_HEIGHT;
    this.heroInfo = new WndHeroInfo$HeroInfoTab()._WndHeroInfo$HeroInfoTab(cl);
    this.add$Gizmo(this.heroInfo);
    this.heroInfo.setSize(Math.fround(WndHeroInfo.WIDTH), Math.fround(WndHeroInfo.MIN_HEIGHT));
    finalHeight = $J.d2i(Math.max(Math.fround(finalHeight), this.heroInfo.height()));
    this.add$Tab(new (WndHeroInfo$1())().$o(this)._WndTabbed$IconTab(tabIcon));
    this.talentInfo = new WndHeroInfo$TalentInfoTab()._WndHeroInfo$TalentInfoTab(cl);
    this.add$Gizmo(this.talentInfo);
    this.talentInfo.setSize(Math.fround(WndHeroInfo.WIDTH), Math.fround(WndHeroInfo.MIN_HEIGHT));
    finalHeight = $J.d2i(Math.max(Math.fround(finalHeight), this.talentInfo.height()));
    this.add$Tab(new (WndHeroInfo$2())().$o(this)._WndTabbed$IconTab(Icons.get$Icons(Icons.TALENT)));
    if (Badges.isUnlocked(Badges$Badge.BOSS_SLAIN_2) || DeviceCompat.isDebug()) {
      this.subclassInfo = new WndHeroInfo$SubclassInfoTab()._WndHeroInfo$SubclassInfoTab(cl);
      this.add$Gizmo(this.subclassInfo);
      this.subclassInfo.setSize(Math.fround(WndHeroInfo.WIDTH), Math.fround(WndHeroInfo.MIN_HEIGHT));
      finalHeight = $J.d2i(Math.max(Math.fround(finalHeight), this.subclassInfo.height()));
      this.add$Tab(new (WndHeroInfo$3())().$o(this)._WndTabbed$IconTab(new ItemSprite()._ItemSprite$int$Glowing(ItemSpriteSheet.MASK, null)));
    }
    if (Badges.isUnlocked(Badges$Badge.BOSS_SLAIN_4) || DeviceCompat.isDebug()) {
      this.abilityInfo_ = new WndHeroInfo$ArmorAbilityInfoTab()._WndHeroInfo$ArmorAbilityInfoTab(cl);
      this.add$Gizmo(this.abilityInfo_);
      this.abilityInfo_.setSize(Math.fround(WndHeroInfo.WIDTH), Math.fround(WndHeroInfo.MIN_HEIGHT));
      finalHeight = $J.d2i(Math.max(Math.fround(finalHeight), this.abilityInfo_.height()));
      this.add$Tab(new (WndHeroInfo$4())().$o(this)._WndTabbed$IconTab(new ItemSprite()._ItemSprite$int$Glowing(ItemSpriteSheet.CROWN, null)));
    }
    this.resize(WndHeroInfo.WIDTH, finalHeight);
    this.layoutTabs();
    this.talentInfo.layout();
    this.select$int(0);
    return this;
  }
  offset$int$int(xOffset: number, yOffset: number): void {
    super.offset$int$int(xOffset, yOffset);
    this.talentInfo.layout();
  }
  static $clinit() {
    WndHeroInfo.WIDTH = 120;
    WndHeroInfo.MIN_HEIGHT = 125;
    WndHeroInfo.MARGIN = 2;
  }
}

export class WndHeroInfo$HeroInfoTab extends Component {
  title_: RenderedTextBlock = null;
  info_: RenderedTextBlock[] = null;
  icons: Image[] = null;
  _WndHeroInfo$HeroInfoTab(cls: HeroClass): this {
    this._Component();
    this.title_ = PixelScene.renderTextBlock$String$int(Messages.titleCase(cls.title()), 9);
    this.title_.hardlight(Window.TITLE_COLOR);
    this.add$Gizmo(this.title_);
    let desc_entries = JString.split(cls.desc(), '\n\n');
    this.info_ = $J.newArray(desc_entries.length, null);
    for (let i = 0; i < desc_entries.length; i++) {
      this.info_[i] = PixelScene.renderTextBlock$String$int(desc_entries[i], 6);
      this.add$Gizmo(this.info_[i]);
    }
    switch (cls) {
      case HeroClass.WARRIOR:
      default:
        this.icons = [new ItemSprite()._ItemSprite$int(ItemSpriteSheet.SEAL), new ItemSprite()._ItemSprite$int(ItemSpriteSheet.WORN_SHORTSWORD), new ItemSprite()._ItemSprite$int(ItemSpriteSheet.SCROLL_ISAZ)];
        break;
      case HeroClass.MAGE:
        this.icons = [new ItemSprite()._ItemSprite$int(ItemSpriteSheet.MAGES_STAFF), new ItemSprite()._ItemSprite$int(ItemSpriteSheet.WAND_MAGIC_MISSILE), new ItemSprite()._ItemSprite$int(ItemSpriteSheet.SCROLL_ISAZ)];
        break;
      case HeroClass.ROGUE:
        this.icons = [new ItemSprite()._ItemSprite$int(ItemSpriteSheet.ARTIFACT_CLOAK), Icons.get$Icons(Icons.STAIRS), new ItemSprite()._ItemSprite$int(ItemSpriteSheet.DAGGER), new ItemSprite()._ItemSprite$int(ItemSpriteSheet.SCROLL_ISAZ)];
        break;
      case HeroClass.HUNTRESS:
        this.icons = [new ItemSprite()._ItemSprite$int(ItemSpriteSheet.SPIRIT_BOW), Icons.GRASS.get(), new ItemSprite()._ItemSprite$int(ItemSpriteSheet.GLOVES), new ItemSprite()._ItemSprite$int(ItemSpriteSheet.SCROLL_ISAZ)];
        break;
      case HeroClass.DUELIST:
        this.icons = [new ItemSprite()._ItemSprite$int(ItemSpriteSheet.RAPIER), new ItemSprite()._ItemSprite$int(ItemSpriteSheet.WAR_HAMMER), new ItemSprite()._ItemSprite$int(ItemSpriteSheet.THROWING_SPIKE), new ItemSprite()._ItemSprite$int(ItemSpriteSheet.SCROLL_ISAZ)];
        break;
      case HeroClass.CLERIC:
        this.icons = [new ItemSprite()._ItemSprite$int(ItemSpriteSheet.ARTIFACT_TOME), Icons.TALENT.get(), new ItemSprite()._ItemSprite$int(ItemSpriteSheet.CUDGEL), new ItemSprite()._ItemSprite$int(ItemSpriteSheet.SCROLL_ISAZ)];
        break;
    }
    for (let im of this.icons) {
      this.add$Gizmo(im);
    }
    return this;
  }
  layout(): void {
    super.layout();
    this.title_.setPos(Math.fround((Math.fround(this.width_ - this.title_.width())) / 2), Math.fround(WndHeroInfo.MARGIN));
    let pos = Math.fround(this.title_.bottom() + Math.imul(4, WndHeroInfo.MARGIN));
    for (let i = 0; i < this.info_.length; i++) {
      this.info_[i].maxWidth$int(($J.d2i(this.width_) - 20) | 0);
      this.info_[i].setPos(20, pos);
      this.icons[i].x = Math.fround((Math.fround(20 - this.icons[i].width())) / 2);
      this.icons[i].y = Math.fround(this.info_[i].top() + Math.fround((Math.fround(this.info_[i].height() - this.icons[i].height())) / 2));
      PixelScene.align$Visual(this.icons[i]);
      pos = Math.fround(this.info_[i].bottom() + Math.imul(4, WndHeroInfo.MARGIN));
    }
    this.height_ = Math.max(this.height_, Math.fround(pos - Math.imul(4, WndHeroInfo.MARGIN)));
  }
}

export class WndHeroInfo$TalentInfoTab extends Component {
  title_: RenderedTextBlock = null;
  message: RenderedTextBlock = null;
  talentPane: TalentsPane = null;
  _WndHeroInfo$TalentInfoTab(cls: HeroClass): this {
    this._Component();
    this.title_ = PixelScene.renderTextBlock$String$int(Messages.titleCase(Messages.get$Class$String$ObjectArr($J.cls(WndHeroInfo), 'talents', [])), 9);
    this.title_.hardlight(Window.TITLE_COLOR);
    this.add$Gizmo(this.title_);
    this.message = PixelScene.renderTextBlock$String$int(Messages.get$Class$String$ObjectArr($J.cls(WndHeroInfo), 'talents_msg', []), 6);
    this.add$Gizmo(this.message);
    let talents = new ArrayList();
    Talent.initClassTalents$HeroClass$ArrayList(cls, talents);
    talents.get(2).clear();
    this.talentPane = new TalentsPane()._TalentsPane$Mode$ArrayList(TalentButton$Mode.INFO, talents);
    this.add$Gizmo(this.talentPane);
    return this;
  }
  layout(): void {
    super.layout();
    this.title_.setPos(Math.fround((Math.fround(this.width_ - this.title_.width())) / 2), Math.fround(WndHeroInfo.MARGIN));
    this.message.maxWidth$int($J.d2i(this.width_));
    this.message.setPos(0, Math.fround(this.title_.bottom() + Math.imul(4, WndHeroInfo.MARGIN)));
    this.talentPane.setRect(0, Math.fround(this.message.bottom() + Math.imul(3, WndHeroInfo.MARGIN)), this.width_, 85);
    this.height_ = Math.max(this.height_, this.talentPane.bottom());
  }
}

export class WndHeroInfo$SubclassInfoTab extends Component {
  title_: RenderedTextBlock = null;
  message: RenderedTextBlock = null;
  subClsDescs: RenderedTextBlock[] = null;
  subClsInfos: IconButton[] = null;
  _WndHeroInfo$SubclassInfoTab(cls: HeroClass): this {
    this._Component();
    this.title_ = PixelScene.renderTextBlock$String$int(Messages.titleCase(Messages.get$Class$String$ObjectArr($J.cls(WndHeroInfo), 'subclasses', [])), 9);
    this.title_.hardlight(Window.TITLE_COLOR);
    this.add$Gizmo(this.title_);
    this.message = PixelScene.renderTextBlock$String$int(Messages.get$Class$String$ObjectArr($J.cls(WndHeroInfo), 'subclasses_msg', []), 6);
    this.add$Gizmo(this.message);
    let subClasses = cls.subClasses();
    this.subClsDescs = $J.newArray(subClasses.length, null);
    this.subClsInfos = $J.newArray(subClasses.length, null);
    for (let i = 0; i < subClasses.length; i++) {
      this.subClsDescs[i] = PixelScene.renderTextBlock$String$int(subClasses[i].shortDesc(), 6);
      let finalI = i;
      this.subClsInfos[i] = new (WndHeroInfo$SubclassInfoTab$1())().$o(this).$c(cls, subClasses, finalI)._IconButton$Image(Icons.get$Icons(Icons.INFO));
      this.add$Gizmo(this.subClsDescs[i]);
      this.add$Gizmo(this.subClsInfos[i]);
    }
    return this;
  }
  layout(): void {
    super.layout();
    this.title_.setPos(Math.fround((Math.fround(this.width_ - this.title_.width())) / 2), Math.fround(WndHeroInfo.MARGIN));
    this.message.maxWidth$int($J.d2i(this.width_));
    this.message.setPos(0, Math.fround(this.title_.bottom() + Math.imul(4, WndHeroInfo.MARGIN)));
    let pos = Math.fround(this.message.bottom() + Math.imul(4, WndHeroInfo.MARGIN));
    for (let i = 0; i < this.subClsDescs.length; i++) {
      this.subClsDescs[i].maxWidth$int(($J.d2i(this.width_) - 20) | 0);
      this.subClsDescs[i].setPos(0, pos);
      this.subClsInfos[i].setRect(Math.fround(this.width_ - 20), Math.fround(this.subClsDescs[i].top() + Math.fround((Math.fround(this.subClsDescs[i].height() - 20)) / 2)), 20, 20);
      pos = Math.fround(this.subClsDescs[i].bottom() + Math.imul(4, WndHeroInfo.MARGIN));
    }
    this.height_ = Math.max(this.height_, Math.fround(pos - Math.imul(4, WndHeroInfo.MARGIN)));
  }
}

export class WndHeroInfo$ArmorAbilityInfoTab extends Component {
  title_: RenderedTextBlock = null;
  message: RenderedTextBlock = null;
  abilityDescs: RenderedTextBlock[] = null;
  abilityInfos: IconButton[] = null;
  _WndHeroInfo$ArmorAbilityInfoTab(cls: HeroClass): this {
    this._Component();
    this.title_ = PixelScene.renderTextBlock$String$int(Messages.titleCase(Messages.get$Class$String$ObjectArr($J.cls(WndHeroInfo), 'abilities', [])), 9);
    this.title_.hardlight(Window.TITLE_COLOR);
    this.add$Gizmo(this.title_);
    this.message = PixelScene.renderTextBlock$String$int(Messages.get$Class$String$ObjectArr($J.cls(WndHeroInfo), 'abilities_msg', []), 6);
    this.add$Gizmo(this.message);
    let abilities = cls.armorAbilities();
    this.abilityDescs = $J.newArray(abilities.length, null);
    this.abilityInfos = $J.newArray(abilities.length, null);
    for (let i = 0; i < abilities.length; i++) {
      this.abilityDescs[i] = PixelScene.renderTextBlock$String$int(abilities[i].shortDesc(), 6);
      let finalI = i;
      this.abilityInfos[i] = new (WndHeroInfo$ArmorAbilityInfoTab$1())().$o(this).$c(cls, abilities, finalI)._IconButton$Image(Icons.get$Icons(Icons.INFO));
      this.add$Gizmo(this.abilityDescs[i]);
      this.add$Gizmo(this.abilityInfos[i]);
    }
    return this;
  }
  layout(): void {
    super.layout();
    this.title_.setPos(Math.fround((Math.fround(this.width_ - this.title_.width())) / 2), Math.fround(WndHeroInfo.MARGIN));
    this.message.maxWidth$int($J.d2i(this.width_));
    this.message.setPos(0, Math.fround(this.title_.bottom() + Math.imul(4, WndHeroInfo.MARGIN)));
    let pos = Math.fround(this.message.bottom() + Math.imul(4, WndHeroInfo.MARGIN));
    for (let i = 0; i < this.abilityDescs.length; i++) {
      this.abilityDescs[i].maxWidth$int(($J.d2i(this.width_) - 20) | 0);
      this.abilityDescs[i].setPos(0, pos);
      this.abilityInfos[i].setRect(Math.fround(this.width_ - 20), Math.fround(this.abilityDescs[i].top() + Math.fround((Math.fround(this.abilityDescs[i].height() - 20)) / 2)), 20, 20);
      pos = Math.fround(this.abilityDescs[i].bottom() + Math.imul(4, WndHeroInfo.MARGIN));
    }
    this.height_ = Math.max(this.height_, Math.fround(pos - Math.imul(4, WndHeroInfo.MARGIN)));
  }
}

let $WndHeroInfo$1: any = null;
/** An anonymous class (WndHeroInfo.java:88). */
function WndHeroInfo$1(): any {
  return $WndHeroInfo$1 ??= $J.local(class extends WndTabbed$IconTab {
    select(value: boolean): void {
      super.select(value);
      this.$outer.heroInfo.visible_ = this.$outer.heroInfo.active = value;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndHeroInfo$1', []);
}

let $WndHeroInfo$2: any = null;
/** An anonymous class (WndHeroInfo.java:101). */
function WndHeroInfo$2(): any {
  return $WndHeroInfo$2 ??= $J.local(class extends WndTabbed$IconTab {
    select(value: boolean): void {
      super.select(value);
      this.$outer.talentInfo.visible_ = this.$outer.talentInfo.active = value;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndHeroInfo$2', []);
}

let $WndHeroInfo$3: any = null;
/** An anonymous class (WndHeroInfo.java:115). */
function WndHeroInfo$3(): any {
  return $WndHeroInfo$3 ??= $J.local(class extends WndTabbed$IconTab {
    select(value: boolean): void {
      super.select(value);
      this.$outer.subclassInfo.visible_ = this.$outer.subclassInfo.active = value;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndHeroInfo$3', []);
}

let $WndHeroInfo$4: any = null;
/** An anonymous class (WndHeroInfo.java:130). */
function WndHeroInfo$4(): any {
  return $WndHeroInfo$4 ??= $J.local(class extends WndTabbed$IconTab {
    select(value: boolean): void {
      super.select(value);
      this.$outer.abilityInfo_.visible_ = this.$outer.abilityInfo_.active = value;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndHeroInfo$4', []);
}

let $WndHeroInfo$SubclassInfoTab$1: any = null;
/** An anonymous class (WndHeroInfo.java:302). */
function WndHeroInfo$SubclassInfoTab$1(): any {
  return $WndHeroInfo$SubclassInfoTab$1 ??= $J.local(class extends IconButton {
    onClick(): void {
      Game.scene().addToFront(new WndInfoSubclass()._WndInfoSubclass(this.$cv_cls, this.$cv_subClasses[this.$cv_finalI]));
    }
    $c($cls, $subClasses, $finalI): this {
      this.$cv_cls = $cls; this.$cv_subClasses = $subClasses; this.$cv_finalI = $finalI;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndHeroInfo$SubclassInfoTab$1', []);
}

let $WndHeroInfo$ArmorAbilityInfoTab$1: any = null;
/** An anonymous class (WndHeroInfo.java:362). */
function WndHeroInfo$ArmorAbilityInfoTab$1(): any {
  return $WndHeroInfo$ArmorAbilityInfoTab$1 ??= $J.local(class extends IconButton {
    onClick(): void {
      Game.scene().addToFront(new WndInfoArmorAbility()._WndInfoArmorAbility(this.$cv_cls, this.$cv_abilities[this.$cv_finalI]));
    }
    $c($cls, $abilities, $finalI): this {
      this.$cv_cls = $cls; this.$cv_abilities = $abilities; this.$cv_finalI = $finalI;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndHeroInfo$ArmorAbilityInfoTab$1', []);
}

$J.define(WndHeroInfo, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndHeroInfo', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.windows.WndTabbed', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroClass': '_WndHeroInfo' }, meths: { 'offset(int,int)': 'offset$int$int' }, clinit: true, lazy: ['WIDTH', 'MIN_HEIGHT', 'MARGIN'] });
$J.define(WndHeroInfo$HeroInfoTab, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndHeroInfo$HeroInfoTab', { kind: 'class', sup: 'com.watabou.noosa.ui.Component', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroClass': '_WndHeroInfo$HeroInfoTab' } });
$J.define(WndHeroInfo$TalentInfoTab, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndHeroInfo$TalentInfoTab', { kind: 'class', sup: 'com.watabou.noosa.ui.Component', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroClass': '_WndHeroInfo$TalentInfoTab' } });
$J.define(WndHeroInfo$SubclassInfoTab, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndHeroInfo$SubclassInfoTab', { kind: 'class', sup: 'com.watabou.noosa.ui.Component', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroClass': '_WndHeroInfo$SubclassInfoTab' } });
$J.define(WndHeroInfo$ArmorAbilityInfoTab, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndHeroInfo$ArmorAbilityInfoTab', { kind: 'class', sup: 'com.watabou.noosa.ui.Component', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroClass': '_WndHeroInfo$ArmorAbilityInfoTab' } });
$J.module(() => {
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Badges$Badge = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges$Badge');
  HeroClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroClass');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  ItemSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  IconButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.IconButton');
  Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Icons');
  TalentButton$Mode = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.TalentButton$Mode');
  TalentsPane = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.TalentsPane');
  Window = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Window');
  WndInfoArmorAbility = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndInfoArmorAbility');
  WndInfoSubclass = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndInfoSubclass');
  WndTabbed$IconTab = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndTabbed$IconTab');
  Game = $J.load('com.watabou.noosa.Game');
  DeviceCompat = $J.load('com.watabou.utils.DeviceCompat');
});
