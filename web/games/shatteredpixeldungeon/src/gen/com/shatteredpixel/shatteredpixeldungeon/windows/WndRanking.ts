// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/windows/WndRanking.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, Exception, JString, Locale, NumberFormat, RuntimeException } from '../../../../../jre/index.ts';
import { WndTabbed } from './WndTabbed.ts';
import { WndTabbed$IconTab } from './WndTabbed.ts';
import { Group } from '../../../watabou/noosa/Group.ts';
import { Window } from '../ui/Window.ts';
import { Button } from '../ui/Button.ts';
import { ItemSlot } from '../ui/ItemSlot.ts';

let Assets$Sounds, Badges, Badges$Badge, Challenges, Dungeon, QuickSlot, Rankings, SPDSettings, Statistics, HeroSubClass, EquipableItem, EscapeCrystal, Trinket, Wand, Messages, PixelScene, HeroSprite, ItemSprite, ItemSpriteSheet, BadgesGrid, BadgesList, CheckBox, IconButton, Icons, RedButton, TalentButton$Mode, TalentsPane, DungeonSeed, IconTitle, WndInfoItem, WndMessage, WndOptions, WndScoreBreakdown, ColorBlock, Game, Image, Sample, DeviceCompat;

export class WndRanking extends WndTabbed {
  static readonly WIDTH: number = 115;
  static readonly HEIGHT: number = 144;
  static INSTANCE: WndRanking = null;
  gameID: string = null;
  record: Rankings$Record = null;
  _WndRanking(rec: Rankings$Record): this {
    this._WndTabbed();
    this.resize(WndRanking.WIDTH, WndRanking.HEIGHT);
    if (WndRanking.INSTANCE != null) {
      WndRanking.INSTANCE.hide();
    }
    WndRanking.INSTANCE = this;
    this.gameID = rec.gameID;
    this.record = rec;
    try {
      Badges.loadGlobal();
      Rankings.INSTANCE.loadGameData(rec);
      this.createControls();
    } catch ($e0) {
      if ($J.isa($e0, Exception)) {
        let e = $J.exc($e0);
        Game.reportException(new RuntimeException('Rankings Display Failed!', e));
        Dungeon.hero = null;
        this.createControls();
      } else {
        throw $e0;
      }
    }
    return this;
  }
  destroy(): void {
    super.destroy();
    if (WndRanking.INSTANCE === this) {
      WndRanking.INSTANCE = null;
    }
  }
  createControls(): void {
    if (Dungeon.hero != null) {
      let icons = [Icons.RANKINGS, Icons.TALENT, Icons.BACKPACK_LRG, Icons.BADGES, Icons.CHALLENGE_COLOR];
      let pages = [new WndRanking$StatsTab().$o(this)._WndRanking$StatsTab(), new WndRanking$TalentsTab().$o(this)._WndRanking$TalentsTab(), new WndRanking$ItemsTab().$o(this)._WndRanking$ItemsTab(), new WndRanking$BadgesTab().$o(this)._WndRanking$BadgesTab(), null];
      if (Dungeon.challenges !== 0) {
        pages[4] = new WndRanking$ChallengesTab().$o(this)._WndRanking$ChallengesTab();
      }
      for (let i = 0; i < pages.length; i++) {
        if (pages[i] == null) {
          break;
        }
        this.add$Gizmo(pages[i]);
        let tab = new WndRanking$RankingTab().$o(this)._WndRanking$RankingTab(icons[i], pages[i]);
        this.add$Tab(tab);
      }
      this.layoutTabs();
      this.select$int(0);
    } else {
      let tab = new WndRanking$StatsTab().$o(this)._WndRanking$StatsTab();
      this.add$Gizmo(tab);
    }
  }
}

export class WndRanking$RankingTab extends WndTabbed$IconTab {
  page: Group = null;
  _WndRanking$RankingTab(icon: Icons, page: Group): this {
    this._WndTabbed$IconTab(Icons.get$Icons(icon));
    this.page = page;
    return this;
  }
  select(value: boolean): void {
    super.select(value);
    if (this.page != null) {
      this.page.visible_ = this.page.active = this.selected;
    }
  }
}

export class WndRanking$StatsTab extends Group {
  GAP: number = 0;
  _WndRanking$StatsTab(): this {
    this._Group();
    this.GAP = 4;
    let heroClass = this.$outer.record.heroClass.name();
    if (Dungeon.hero != null) {
      heroClass = Dungeon.hero.className();
    }
    let title = new IconTitle()._IconTitle$();
    title.icon(HeroSprite.avatar$HeroClass$int(this.$outer.record.heroClass, this.$outer.record.armorTier));
    title.label$String(Messages.get$Object$String$ObjectArr(this, 'title', [this.$outer.record.herolevel, heroClass]).toUpperCase());
    title.color(Window.TITLE_COLOR);
    title.setRect(0, 0, Math.fround(WndRanking.WIDTH), 0);
    this.add$Gizmo(title);
    if (Dungeon.hero != null && Dungeon.seed !== -1n) {
      this.GAP--;
    }
    let pos = Math.fround(title.bottom() + 1);
    let date = PixelScene.renderTextBlock$String$int(this.$outer.record.date, 7);
    date.hardlight(13421772);
    date.setPos(0, pos);
    this.add$Gizmo(date);
    let version = PixelScene.renderTextBlock$String$int(this.$outer.record.version, 7);
    version.hardlight(13421772);
    version.setPos(Math.fround(WndRanking.WIDTH - version.width()), pos);
    this.add$Gizmo(version);
    pos = Math.fround(date.bottom() + 5);
    let num = NumberFormat.getInstance(Messages.locale());
    if (Dungeon.hero == null) {
      pos = this.statSlot(this, Messages.get$Object$String$ObjectArr(this, 'score', []), num.format(BigInt(this.$outer.record.score_)), pos);
      pos = Math.fround(pos + this.GAP);
      let errorIcon = Icons.WARNING.get();
      errorIcon.y = pos;
      this.add$Gizmo(errorIcon);
      let errorText = PixelScene.renderTextBlock$String$int(Messages.get$Class$String$ObjectArr($J.cls(WndRanking), 'error', []), 6);
      errorText.maxWidth$int($J.d2i((Math.fround(Math.fround(WndRanking.WIDTH - errorIcon.width()) - this.GAP))));
      errorText.setPos(Math.fround(errorIcon.width() + this.GAP), Math.fround(pos + Math.fround((Math.fround(errorIcon.height() - errorText.height())) / 2)));
      this.add$Gizmo(errorText);
    } else {
      pos = this.statSlot(this, Messages.get$Object$String$ObjectArr(this, 'score', []), num.format(BigInt(Statistics.totalScore)), pos);
      let scoreInfo = new (WndRanking$StatsTab$1())().$o(this)._IconButton$Image(Icons.get$Icons(Icons.INFO));
      scoreInfo.setSize(16, 16);
      scoreInfo.setPos(Math.fround(WndRanking.WIDTH - scoreInfo.width()), Math.fround(Math.fround(pos - 10) - this.GAP));
      this.add$Gizmo(scoreInfo);
      pos = Math.fround(pos + this.GAP);
      let strBonus = (Dungeon.hero.STR() - Dungeon.hero.STR_) | 0;
      if (strBonus > 0) {
        pos = this.statSlot(this, Messages.get$Object$String$ObjectArr(this, 'str', []), Dungeon.hero.STR_ + ' + ' + strBonus, pos);
      } else if (strBonus < 0) {
        pos = this.statSlot(this, Messages.get$Object$String$ObjectArr(this, 'str', []), Dungeon.hero.STR_ + ' - ' + -strBonus, pos);
      } else {
        pos = this.statSlot(this, Messages.get$Object$String$ObjectArr(this, 'str', []), String(Dungeon.hero.STR_), pos);
      }
      pos = this.statSlot(this, Messages.get$Object$String$ObjectArr(this, 'duration', []), num.format(BigInt($J.d2i(Statistics.duration))), pos);
      if (Statistics.highestAscent === 0) {
        pos = this.statSlot(this, Messages.get$Object$String$ObjectArr(this, 'depth', []), num.format(BigInt(Statistics.deepestFloor)), pos);
      } else {
        pos = this.statSlot(this, Messages.get$Object$String$ObjectArr(this, 'ascent', []), num.format(BigInt(Statistics.highestAscent)), pos);
      }
      if (Dungeon.seed !== -1n) {
        if (Dungeon.daily) {
          if (Dungeon.dailyReplay) {
            pos = this.statSlot(this, Messages.get$Object$String$ObjectArr(this, 'replay_for', []), '_' + Dungeon.customSeedText + '_', pos);
          } else {
            pos = this.statSlot(this, Messages.get$Object$String$ObjectArr(this, 'daily_for', []), '_' + Dungeon.customSeedText + '_', pos);
          }
        } else if (!(Dungeon.customSeedText.length === 0)) {
          pos = this.statSlot(this, Messages.get$Object$String$ObjectArr(this, 'custom_seed', []), '_' + Dungeon.customSeedText + '_', pos);
        } else {
          pos = this.statSlot(this, Messages.get$Object$String$ObjectArr(this, 'seed', []), DungeonSeed.convertToCode(Dungeon.seed), pos);
        }
      } else {
        pos = Math.fround(pos + ((this.GAP + 5) | 0));
      }
      pos = Math.fround(pos + this.GAP);
      pos = this.statSlot(this, Messages.get$Object$String$ObjectArr(this, 'enemies', []), num.format(BigInt(Statistics.enemiesSlain)), pos);
      pos = this.statSlot(this, Messages.get$Object$String$ObjectArr(this, 'gold', []), num.format(BigInt(Statistics.goldCollected)), pos);
      pos = this.statSlot(this, Messages.get$Object$String$ObjectArr(this, 'food', []), num.format(BigInt(Statistics.foodEaten)), pos);
      pos = this.statSlot(this, Messages.get$Object$String$ObjectArr(this, 'alchemy', []), num.format(BigInt(Statistics.itemsCrafted)), pos);
    }
    let buttontop = (WndRanking.HEIGHT - 16) | 0;
    if (Dungeon.hero != null && Dungeon.seed !== -1n && !Dungeon.daily && (DeviceCompat.isDebug() || Badges.isUnlocked(Badges$Badge.VICTORY))) {
      let icon = Icons.get$Icons(Icons.SEED);
      let btnSeed = new (WndRanking$StatsTab$2())().$o(this)._RedButton$String(Messages.get$Object$String$ObjectArr(this, 'copy_seed', []));
      if (DungeonSeed.convertFromText(SPDSettings.customSeed$()) === Dungeon.seed) {
        icon.hardlight$float$float$float(1, 1.5, Math.fround(0.67));
      }
      btnSeed.icon$Image(icon);
      btnSeed.setRect(0, Math.fround(buttontop), 115, 16);
      this.add$Gizmo(btnSeed);
    }
    return this;
  }
  statSlot(parent: Group, label: string, value: string, pos: number): number {
    let size = 7;
    let txt: RenderedTextBlock;
    do {
      txt = PixelScene.renderTextBlock$String$int(label, size);
      size--;
    } while (txt.width() >= Math.fround(WndRanking.WIDTH * Math.fround(0.55)));
    txt.setPos(0, Math.fround(pos + Math.fround((Math.fround(6 - txt.height())) / 2)));
    PixelScene.align$Component(txt);
    parent.add$Gizmo(txt);
    size = 7;
    do {
      txt = PixelScene.renderTextBlock$String$int(value, size);
      size--;
    } while (txt.width() >= Math.fround(WndRanking.WIDTH * Math.fround(0.45)));
    txt.setPos(Math.fround(WndRanking.WIDTH * Math.fround(0.55)), Math.fround(pos + Math.fround((Math.fround(6 - txt.height())) / 2)));
    PixelScene.align$Component(txt);
    parent.add$Gizmo(txt);
    return Math.fround(Math.fround(pos + this.GAP) + txt.height());
  }
}

export class WndRanking$TalentsTab extends Group {
  _WndRanking$TalentsTab(): this {
    this._Group();
    this.camera_ = this.$outer.camera_;
    let tiers = 1;
    if (Dungeon.hero.lvl >= 6) {
      tiers++;
    }
    if (Dungeon.hero.lvl >= 12 && Dungeon.hero.subClass !== HeroSubClass.NONE) {
      tiers++;
    }
    if (Dungeon.hero.lvl >= 20 && Dungeon.hero.armorAbility != null) {
      tiers++;
    }
    while (Dungeon.hero.talents_.size() > tiers) {
      Dungeon.hero.talents_.removeAt((Dungeon.hero.talents_.size() - 1) | 0);
    }
    let p = new TalentsPane()._TalentsPane$Mode(TalentButton$Mode.INFO);
    this.add$Gizmo(p);
    p.setPos(0, 0);
    p.setSize(Math.fround(WndRanking.WIDTH), Math.fround(WndRanking.HEIGHT));
    p.setPos(0, 0);
    return this;
  }
}

export class WndRanking$ItemsTab extends Group {
  pos: number = 0;
  _WndRanking$ItemsTab(): this {
    this._Group();
    let stuff = Dungeon.hero.belongings;
    if (stuff.weapon_ != null) {
      this.addItem(stuff.weapon_);
    }
    if (stuff.armor_ != null) {
      this.addItem(stuff.armor_);
    }
    if (stuff.artifact_ != null) {
      this.addItem(stuff.artifact_);
    }
    if (stuff.misc_ != null) {
      this.addItem(stuff.misc_);
    }
    if (stuff.ring_ != null) {
      this.addItem(stuff.ring_);
    }
    this.pos = 0;
    let slotsActive = 0;
    for (let i = 0; i < QuickSlot.SIZE; i++) {
      if (Dungeon.quickslot.isNonePlaceholder(i)) {
        slotsActive++;
      }
    }
    let trinket = stuff.getItem($J.cls(Trinket));
    if (trinket != null) {
      slotsActive++;
    }
    let slotWidth = Math.min(28, (Math.fround(((WndRanking.WIDTH - slotsActive + 1) | 0) / Math.fround(slotsActive))));
    for (let i = -1; i < QuickSlot.SIZE; i++) {
      let item = null;
      if (i === -1) {
        item = trinket;
      } else if (Dungeon.quickslot.isNonePlaceholder(i)) {
        item = Dungeon.quickslot.getItem(i);
      }
      if (item != null) {
        let slot = new WndRanking$QuickSlotButton().$o(this.$outer)._WndRanking$QuickSlotButton(item);
        slot.setRect(this.pos, 120, slotWidth, 23);
        PixelScene.align$Component(slot);
        this.add$Gizmo(slot);
        this.pos = Math.fround(this.pos + Math.fround(slotWidth + 1));
      }
    }
    let crystal = Dungeon.hero.belongings.getItem($J.cls(EscapeCrystal));
    if (crystal != null) {
      let vaultInv = new (WndRanking$ItemsTab$1())().$o(this).$c(crystal)._IconButton$Image(new ItemSprite()._ItemSprite$int(ItemSpriteSheet.ESCAPE));
      vaultInv.setRect(Math.fround((this.$outer.width_ - 16) | 0), 2, 16, 16);
      this.add$Gizmo(vaultInv);
    }
    return this;
  }
  addItem(item: Item): void {
    let slot = new WndRanking$ItemButton().$o(this.$outer)._WndRanking$ItemButton(item);
    slot.setRect(0, this.pos, Math.fround(this.$outer.width_), Math.fround(WndRanking$ItemButton.HEIGHT));
    this.add$Gizmo(slot);
    this.pos = Math.fround(this.pos + Math.fround(slot.height() + 1));
  }
}

export class WndRanking$WndVaultItems extends Window {
  _WndRanking$WndVaultItems(): this {
    this._Window$();
    this.resize(WndRanking.WIDTH, WndRanking.HEIGHT);
    this.add$Gizmo(new WndRanking$ItemsTab().$o(this.$outer)._WndRanking$ItemsTab());
    return this;
  }
}

export class WndRanking$BadgesTab extends Group {
  _WndRanking$BadgesTab(): this {
    this._Group();
    this.camera_ = this.$outer.camera_;
    let badges: Component;
    if (Badges.filterReplacedBadges$boolean(false).size() <= 8) {
      badges = new BadgesList()._BadgesList(false);
    } else {
      badges = new BadgesGrid()._BadgesGrid(false);
    }
    this.add$Gizmo(badges);
    badges.setSize(Math.fround(WndRanking.WIDTH), Math.fround(WndRanking.HEIGHT));
    return this;
  }
}

export class WndRanking$ChallengesTab extends Group {
  _WndRanking$ChallengesTab(): this {
    this._Group();
    this.camera_ = this.$outer.camera_;
    let pos = 0;
    for (let i = 0; i < Challenges.NAME_IDS.length; i++) {
      let challenge = Challenges.NAME_IDS[i];
      let cb = new CheckBox()._CheckBox(Messages.titleCase(Messages.get$Class$String$ObjectArr($J.cls(Challenges), challenge, [])));
      cb.checked$boolean((Dungeon.challenges & Challenges.MASKS[i]) !== 0);
      cb.active = false;
      if (i > 0) {
        pos = Math.fround(pos + 1);
      }
      cb.setRect(0, pos, Math.fround((WndRanking.WIDTH - 16) | 0), 15);
      this.add$Gizmo(cb);
      let info = new (WndRanking$ChallengesTab$1())().$o(this).$c(challenge)._IconButton$Image(Icons.get$Icons(Icons.INFO));
      info.setRect(cb.right(), pos, 16, 15);
      this.add$Gizmo(info);
      pos = cb.bottom();
    }
    return this;
  }
}

export class WndRanking$ItemButton extends Button {
  static readonly HEIGHT: number = 23;
  item_: Item = null;
  slot_: ItemSlot = null;
  bg: ColorBlock = null;
  name_: RenderedTextBlock = null;
  _WndRanking$ItemButton(item: Item): this {
    this._Button();
    this.item_ = item;
    this.slot_.item$Item(item);
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
    return this;
  }
  createChildren(): void {
    this.bg = new ColorBlock()._ColorBlock(28, Math.fround(WndRanking$ItemButton.HEIGHT), -1722591667);
    this.add$Gizmo(this.bg);
    this.slot_ = new ItemSlot()._ItemSlot$();
    this.add$Gizmo(this.slot_);
    this.name_ = PixelScene.renderTextBlock$int(7);
    this.add$Gizmo(this.name_);
    super.createChildren();
  }
  layout(): void {
    this.bg.x = this.x;
    this.bg.y = this.y;
    this.slot_.setRect(this.x, this.y, 28, Math.fround(WndRanking$ItemButton.HEIGHT));
    PixelScene.align$Component(this.slot_);
    this.name_.maxWidth$int($J.d2i((Math.fround(Math.fround(this.width_ - this.slot_.width()) - 2))));
    this.name_.text$String(Messages.titleCase(this.item_.name()));
    this.name_.setPos(Math.fround(this.slot_.right() + 2), Math.fround(this.y + Math.fround((Math.fround(this.height_ - this.name_.height())) / 2)));
    PixelScene.align$Component(this.name_);
    super.layout();
  }
  onPointerDown(): void {
    this.bg.brightness(1.5);
    Sample.INSTANCE.play$Object$float$float$float(Assets$Sounds.CLICK, Math.fround(0.7), Math.fround(0.7), Math.fround(1.2));
  }
  onPointerUp(): void {
    this.bg.brightness(1);
  }
  onClick(): void {
    Game.scene().add$Gizmo(new WndInfoItem()._WndInfoItem$Item(this.item_));
  }
}

export class WndRanking$QuickSlotButton extends ItemSlot {
  item$WndRanking_QuickSlotButton: Item = null;
  bg: ColorBlock = null;
  _WndRanking$QuickSlotButton(item: Item): this {
    this._ItemSlot$Item(item);
    this.item$WndRanking_QuickSlotButton = item;
    if (item.cursed && item.cursedKnown) {
      this.bg.ra = +Math.fround(0.2);
      this.bg.ga = Math.fround(-Math.fround(0.1));
    } else if (!item.isIdentified()) {
      this.bg.ra = Math.fround(0.1);
      this.bg.ba = Math.fround(0.1);
    }
    return this;
  }
  createChildren(): void {
    this.bg = new ColorBlock()._ColorBlock(1, 1, -1722591667);
    this.add$Gizmo(this.bg);
    super.createChildren();
  }
  layout(): void {
    this.bg.x = this.x;
    this.bg.y = this.y;
    this.bg.size(this.width(), this.height());
    super.layout();
  }
  onPointerDown(): void {
    this.bg.brightness(1.5);
    Sample.INSTANCE.play$Object$float$float$float(Assets$Sounds.CLICK, Math.fround(0.7), Math.fround(0.7), Math.fround(1.2));
  }
  onPointerUp(): void {
    this.bg.brightness(1);
  }
  onClick(): void {
    Game.scene().add$Gizmo(new WndInfoItem()._WndInfoItem$Item(this.item$WndRanking_QuickSlotButton));
  }
}

let $WndRanking$StatsTab$1: any = null;
/** An anonymous class (WndRanking.java:218). */
function WndRanking$StatsTab$1(): any {
  return $WndRanking$StatsTab$1 ??= $J.local(class extends IconButton {
    onClick(): void {
      super.onClick();
      Game.scene().addToFront(new WndScoreBreakdown()._WndScoreBreakdown());
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndRanking$StatsTab$1', []);
}

let $WndRanking$StatsTab$2$1: any = null;
/** An anonymous class (WndRanking.java:281). */
function WndRanking$StatsTab$2$1(): any {
  return $WndRanking$StatsTab$2$1 ??= $J.local(class extends WndOptions {
    onSelect(index: number): void {
      super.onSelect(index);
      if (index === 0) {
        SPDSettings.customSeed$String(DungeonSeed.convertToCode(Dungeon.seed));
        this.$outer.icon_.hardlight$float$float$float(1, 1.5, Math.fround(0.67));
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndRanking$StatsTab$2$1', []);
}

let $WndRanking$StatsTab$2: any = null;
/** An anonymous class (WndRanking.java:273). */
function WndRanking$StatsTab$2(): any {
  return $WndRanking$StatsTab$2 ??= $J.local(class extends RedButton {
    onClick(): void {
      super.onClick();
      Game.scene().addToFront(new (WndRanking$StatsTab$2$1())().$o(this)._WndOptions$Image$String$String$StringArr(new Image()._Image$Image(this.icon_), Messages.get$Object$String$ObjectArr(this.$outer, 'copy_seed', []), Messages.get$Object$String$ObjectArr(this.$outer, 'copy_seed_desc', []), [Messages.get$Object$String$ObjectArr(this.$outer, 'copy_seed_copy', []), Messages.get$Object$String$ObjectArr(this.$outer, 'copy_seed_cancel', [])]));
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndRanking$StatsTab$2', []);
}

let $WndRanking$ItemsTab$1: any = null;
/** An anonymous class (WndRanking.java:415). */
function WndRanking$ItemsTab$1(): any {
  return $WndRanking$ItemsTab$1 ??= $J.local(class extends IconButton {
    onClick(): void {
      let items = this.$cv_crystal.storedItems;
      this.$cv_crystal.restoreHeroBelongings(Dungeon.hero, null);
      this.$cv_crystal.storedItems = items;
      Game.scene().addToFront(new WndRanking$WndVaultItems().$o(this.$outer.$outer)._WndRanking$WndVaultItems());
    }
    $c($crystal): this {
      this.$cv_crystal = $crystal;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndRanking$ItemsTab$1', []);
}

let $WndRanking$ChallengesTab$1: any = null;
/** An anonymous class (WndRanking.java:490). */
function WndRanking$ChallengesTab$1(): any {
  return $WndRanking$ChallengesTab$1 ??= $J.local(class extends IconButton {
    onClick(): void {
      super.onClick();
      Game.scene().add$Gizmo(new WndMessage()._WndMessage(Messages.get$Class$String$ObjectArr($J.cls(Challenges), this.$cv_challenge + '_desc', [])));
    }
    $c($challenge): this {
      this.$cv_challenge = $challenge;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndRanking$ChallengesTab$1', []);
}

$J.define(WndRanking, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndRanking', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.windows.WndTabbed', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.Rankings$Record': '_WndRanking' } });
$J.define(WndRanking$RankingTab, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndRanking$RankingTab', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.windows.WndTabbed$IconTab', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.ui.Icons,com.watabou.noosa.Group': '_WndRanking$RankingTab' }, inner: true });
$J.define(WndRanking$StatsTab, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndRanking$StatsTab', { kind: 'class', sup: 'com.watabou.noosa.Group', ctors: { '': '_WndRanking$StatsTab' }, inner: true });
$J.define(WndRanking$TalentsTab, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndRanking$TalentsTab', { kind: 'class', sup: 'com.watabou.noosa.Group', ctors: { '': '_WndRanking$TalentsTab' }, inner: true });
$J.define(WndRanking$ItemsTab, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndRanking$ItemsTab', { kind: 'class', sup: 'com.watabou.noosa.Group', ctors: { '': '_WndRanking$ItemsTab' }, inner: true });
$J.define(WndRanking$WndVaultItems, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndRanking$WndVaultItems', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.Window', ctors: { '': '_WndRanking$WndVaultItems' }, inner: true });
$J.define(WndRanking$BadgesTab, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndRanking$BadgesTab', { kind: 'class', sup: 'com.watabou.noosa.Group', ctors: { '': '_WndRanking$BadgesTab' }, inner: true });
$J.define(WndRanking$ChallengesTab, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndRanking$ChallengesTab', { kind: 'class', sup: 'com.watabou.noosa.Group', ctors: { '': '_WndRanking$ChallengesTab' }, inner: true });
$J.define(WndRanking$ItemButton, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndRanking$ItemButton', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.Button', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.items.Item': '_WndRanking$ItemButton' }, inner: true });
$J.define(WndRanking$QuickSlotButton, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndRanking$QuickSlotButton', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.ItemSlot', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.items.Item': '_WndRanking$QuickSlotButton' }, inner: true });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Badges$Badge = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges$Badge');
  Challenges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Challenges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  QuickSlot = $J.load('com.shatteredpixel.shatteredpixeldungeon.QuickSlot');
  Rankings = $J.load('com.shatteredpixel.shatteredpixeldungeon.Rankings');
  SPDSettings = $J.load('com.shatteredpixel.shatteredpixeldungeon.SPDSettings');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  HeroSubClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroSubClass');
  EquipableItem = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.EquipableItem');
  EscapeCrystal = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.EscapeCrystal');
  Trinket = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.Trinket');
  Wand = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.Wand');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  HeroSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.HeroSprite');
  ItemSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  BadgesGrid = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BadgesGrid');
  BadgesList = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BadgesList');
  CheckBox = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.CheckBox');
  IconButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.IconButton');
  Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Icons');
  RedButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.RedButton');
  TalentButton$Mode = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.TalentButton$Mode');
  TalentsPane = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.TalentsPane');
  DungeonSeed = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.DungeonSeed');
  IconTitle = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.IconTitle');
  WndInfoItem = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndInfoItem');
  WndMessage = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndMessage');
  WndOptions = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndOptions');
  WndScoreBreakdown = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndScoreBreakdown');
  ColorBlock = $J.load('com.watabou.noosa.ColorBlock');
  Game = $J.load('com.watabou.noosa.Game');
  Image = $J.load('com.watabou.noosa.Image');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  DeviceCompat = $J.load('com.watabou.utils.DeviceCompat');
});
