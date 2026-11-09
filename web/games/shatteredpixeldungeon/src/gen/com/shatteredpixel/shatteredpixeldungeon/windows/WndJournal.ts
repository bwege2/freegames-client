// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/windows/WndJournal.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { WndTabbed } from './WndTabbed.ts';
import { Component } from '../../../watabou/noosa/ui/Component.ts';

let Assets$Sprites, Badges, Dungeon, SPDAction, Statistics, Char$Alignment, CrystalSpire, Mimic, Mob, Pylon, EnergyCrystal, Gold, Item, Armor$Glyph, ClassArmor, Artifact, Potion, ExoticPotion, Ring, Scroll, Trinket, WandOfRegrowth$Lotus, WandOfWarding$Ward, WandOfWarding$Ward$WardSentry, SpiritBow, Weapon$Enchantment, MagesStaff, Bestiary, Catalog, Document, Notes, Notes$CustomRecord, Trap, Messages, Plant, GameScene, PixelScene, ItemSprite, ItemSpriteSheet, ItemSpriteSheet$Icons, TerrainFeaturesTilemap, BadgesGrid, BadgesList, CustomNoteButton, CustomNoteButton$CustomNoteWindow, Icons, QuickRecipe, RedButton, ScrollPane, ScrollingGridPane, ScrollingGridPane$GridItem, ScrollingListPane, ScrollingListPane$ListItem, Window, IconTitle, WndJournalItem, WndStory, WndTabbed$IconTab, KeyBindings, BitmapText, ColorBlock, Game, Image, Reflection;

export class WndJournal extends WndTabbed {
  static readonly WIDTH_P: number = 126;
  static readonly HEIGHT_P: number = 180;
  static readonly WIDTH_L: number = 216;
  static readonly HEIGHT_L: number = 130;
  static readonly ITEM_HEIGHT: number = 18;
  guideTab: WndJournal$GuideTab = null;
  alchemyTab: WndJournal$AlchemyTab = null;
  notesTab: WndJournal$NotesTab = null;
  catalogTab: WndJournal$CatalogTab = null;
  badgesTab: WndJournal$BadgesTab = null;
  static last_index: number = 0;
  static INSTANCE: WndJournal = null;
  _WndJournal(): this {
    this._WndTabbed();
    if (WndJournal.INSTANCE != null) {
      WndJournal.INSTANCE.hide();
    }
    let width = PixelScene.landscape() ? WndJournal.WIDTH_L : WndJournal.WIDTH_P;
    let height = PixelScene.landscape() ? WndJournal.HEIGHT_L : WndJournal.HEIGHT_P;
    this.resize(width, height);
    this.guideTab = new WndJournal$GuideTab()._WndJournal$GuideTab();
    this.add$Gizmo(this.guideTab);
    this.guideTab.setRect(0, 0, Math.fround(width), Math.fround(height));
    this.guideTab.updateList();
    this.alchemyTab = new WndJournal$AlchemyTab()._WndJournal$AlchemyTab();
    this.add$Gizmo(this.alchemyTab);
    this.alchemyTab.setRect(0, 0, Math.fround(width), Math.fround(height));
    this.notesTab = new WndJournal$NotesTab()._WndJournal$NotesTab();
    this.add$Gizmo(this.notesTab);
    this.notesTab.setRect(0, 0, Math.fround(width), Math.fround(height));
    this.notesTab.updateList();
    this.catalogTab = new WndJournal$CatalogTab()._WndJournal$CatalogTab();
    this.add$Gizmo(this.catalogTab);
    this.catalogTab.setRect(0, 0, Math.fround(width), Math.fround(height));
    this.catalogTab.updateList();
    this.badgesTab = new WndJournal$BadgesTab()._WndJournal$BadgesTab();
    this.add$Gizmo(this.badgesTab);
    this.badgesTab.setRect(0, 0, Math.fround(width), Math.fround(height));
    this.badgesTab.updateList();
    let tabs = [new (WndJournal$1())().$o(this)._WndTabbed$IconTab(Icons.JOURNAL.get()), new (WndJournal$2())().$o(this)._WndTabbed$IconTab(new ItemSprite()._ItemSprite$int$Glowing(ItemSpriteSheet.MASTERY, null)), new (WndJournal$3())().$o(this)._WndTabbed$IconTab(Icons.ALCHEMY.get()), new (WndJournal$4())().$o(this)._WndTabbed$IconTab(Icons.CATALOG.get()), new (WndJournal$5())().$o(this)._WndTabbed$IconTab(Icons.BADGES.get())];
    for (let tab of tabs) {
      this.add$Tab(tab);
    }
    this.layoutTabs();
    this.select$int(WndJournal.last_index);
    WndJournal.INSTANCE = this;
    return this;
  }
  onSignal(event: KeyEvent): boolean {
    if (event.pressed && KeyBindings.getActionForKey(event) === SPDAction.JOURNAL) {
      this.onBackPressed();
      return true;
    } else {
      return super.onSignal(event);
    }
  }
  offset$int$int(xOffset: number, yOffset: number): void {
    super.offset$int$int(xOffset, yOffset);
    this.guideTab.layout();
    this.alchemyTab.layout();
    this.notesTab.layout();
    this.catalogTab.layout();
  }
  static addGridItems(grid: ScrollingGridPane, classes: Collection<JClass<any>>): void {
    for (const $it0 = classes.iterator(); $it0.hasNext(); ) {
      let itemClass = $it0.next();
      let seen = Catalog.isSeen(itemClass);
      let sprite = null;
      let secondIcon = null;
      let title = '';
      let desc = '';
      if ($J.cls(Item).isAssignableFrom(itemClass)) {
        let item = Reflection.newInstance(itemClass);
        if (seen) {
          if (item instanceof Ring) {
            (item).anonymize();
          } else if (item instanceof Potion) {
            (item).anonymize();
          } else if (item instanceof Scroll) {
            (item).anonymize();
          }
        }
        sprite = new ItemSprite()._ItemSprite$int$Glowing(item.image_, seen ? item.glowing() : null);
        if (!seen) {
          if (item instanceof ExoticPotion) {
            sprite.frame$int(ItemSpriteSheet.POTION_CRIMSON);
          }
          sprite.lightness(0);
          title = '???';
          desc = Messages.get$Class$String$ObjectArr($J.cls(WndJournal$CatalogTab), 'not_seen_item', []);
          desc += '\n\n' + Messages.get$Object$String$ObjectArr(item, 'discover_hint', []);
        } else {
          title = Messages.titleCase(item.name());
          if (item instanceof ClassArmor || item instanceof SpiritBow) {
            desc += item.desc();
          } else {
            desc += item.info();
          }
          if (Catalog.useCount(itemClass) > 1) {
            if (item.isUpgradable() || item instanceof Artifact) {
              desc += '\n\n' + Messages.get$Class$String$ObjectArr($J.cls(WndJournal$CatalogTab), 'upgrade_count', [Catalog.useCount(itemClass)]);
            } else if (item instanceof Trinket) {
              desc += '\n\n' + Messages.get$Class$String$ObjectArr($J.cls(WndJournal$CatalogTab), 'trinket_count', [Catalog.useCount(itemClass)]);
            } else if (item instanceof Gold) {
              desc += '\n\n' + Messages.get$Class$String$ObjectArr($J.cls(WndJournal$CatalogTab), 'gold_count', [Catalog.useCount(itemClass)]);
            } else if (item instanceof EnergyCrystal) {
              desc += '\n\n' + Messages.get$Class$String$ObjectArr($J.cls(WndJournal$CatalogTab), 'energy_count', [Catalog.useCount(itemClass)]);
            } else {
              desc += '\n\n' + Messages.get$Class$String$ObjectArr($J.cls(WndJournal$CatalogTab), 'use_count', [Catalog.useCount(itemClass)]);
            }
          }
          if (item instanceof MagesStaff) {
            let frame = sprite.frame$();
            frame.top_ = Math.fround(frame.top_ + Math.fround(frame.height() / 8));
            sprite.frame$RectF(frame);
          }
          if (item.icon_ !== -1) {
            secondIcon = new Image()._Image$Object(Assets$Sprites.ITEM_ICONS);
            secondIcon.frame$RectF(ItemSpriteSheet$Icons.film.get$Object(item.icon_));
          }
        }
      } else if ($J.cls(Weapon$Enchantment).isAssignableFrom(itemClass)) {
        let ench = Reflection.newInstance(itemClass);
        if (seen) {
          sprite = new ItemSprite()._ItemSprite$int$Glowing(ItemSpriteSheet.WORN_SHORTSWORD, ench.glowing());
          title = Messages.titleCase(ench.name$());
          desc = ench.desc();
        } else {
          sprite = new ItemSprite()._ItemSprite$int(ItemSpriteSheet.WORN_SHORTSWORD);
          sprite.lightness(0);
          title = '???';
          desc = Messages.get$Class$String$ObjectArr($J.cls(WndJournal$CatalogTab), 'not_seen_enchantment', []);
          desc += '\n\n' + Messages.get$Object$String$ObjectArr(ench, 'discover_hint', []);
        }
      } else if ($J.cls(Armor$Glyph).isAssignableFrom(itemClass)) {
        let glyph = Reflection.newInstance(itemClass);
        if (seen) {
          sprite = new ItemSprite()._ItemSprite$int$Glowing(ItemSpriteSheet.ARMOR_CLOTH, glyph.glowing());
          title = Messages.titleCase(glyph.name$());
          desc = glyph.desc();
        } else {
          sprite = new ItemSprite()._ItemSprite$int(ItemSpriteSheet.ARMOR_CLOTH);
          sprite.lightness(0);
          title = '???';
          desc = Messages.get$Class$String$ObjectArr($J.cls(WndJournal$CatalogTab), 'not_seen_glyph', []);
          desc += '\n\n' + Messages.get$Object$String$ObjectArr(glyph, 'discover_hint', []);
        }
      }
      let finalTitle = title;
      let finalDesc = desc;
      let gridItem = new (WndJournal$6())().$c(finalTitle, finalDesc)._ScrollingGridPane$GridItem(sprite);
      if (secondIcon != null) {
        gridItem.addSecondIcon(secondIcon);
      }
      if (!seen) {
        gridItem.hardLightBG(2, 1, 2);
      }
      grid.addItem(gridItem);
    }
  }
  static addGridEntities(grid: ScrollingGridPane, classes: Collection<JClass<any>>): void {
    for (const $it1 = classes.iterator(); $it1.hasNext(); ) {
      let entityCls = $it1.next();
      let seen = Bestiary.isSeen(entityCls);
      let mob = null;
      let icon = null;
      let title = null;
      let desc = null;
      if ($J.cls(Mob).isAssignableFrom(entityCls)) {
        mob = Reflection.newInstance(entityCls);
        if (mob instanceof Mimic || mob instanceof Pylon || mob instanceof CrystalSpire) {
          mob.alignment = Char$Alignment.ENEMY;
        }
        if (mob instanceof WandOfWarding$Ward) {
          if (mob instanceof WandOfWarding$Ward$WardSentry) {
            (mob).upgrade(3);
            (mob).upgrade(3);
            (mob).upgrade(3);
            (mob).upgrade(3);
          } else {
            (mob).upgrade(0);
          }
        }
        let sprite = mob.sprite();
        sprite.idle();
        icon = new Image()._Image$Image(sprite);
        if (seen) {
          title = Messages.titleCase(mob.name());
          desc = mob.description();
          if (Bestiary.encounterCount(entityCls) > 1) {
            desc += '\n\n' + Messages.get$Class$String$ObjectArr($J.cls(WndJournal$CatalogTab), 'enemy_count', [Bestiary.encounterCount(entityCls)]);
          }
        } else {
          icon.lightness(0);
          title = '???';
          if (mob instanceof WandOfRegrowth$Lotus) {
            desc = Messages.get$Class$String$ObjectArr($J.cls(WndJournal$CatalogTab), 'not_seen_plant', []);
          } else if (mob.alignment === Char$Alignment.ENEMY) {
            desc = Messages.get$Class$String$ObjectArr($J.cls(WndJournal$CatalogTab), 'not_seen_enemy', []);
          } else {
            desc = Messages.get$Class$String$ObjectArr($J.cls(WndJournal$CatalogTab), 'not_seen_ally', []);
          }
          desc += '\n\n' + Messages.get$Object$String$ObjectArr(mob, 'discover_hint', []);
        }
        if (icon.width() >= Math.fround(17) || icon.height() >= Math.fround(17)) {
          let frame = icon.frame$();
          let wShrink = Math.fround(frame.width() * (Math.fround(1 - Math.fround(17 / icon.width()))));
          if (wShrink > Math.fround(0)) {
            frame.left_ = Math.fround(frame.left_ + Math.fround(wShrink / 2));
            frame.right_ = Math.fround(frame.right_ - Math.fround(wShrink / 2));
          }
          let hShrink = Math.fround(frame.height() * (Math.fround(1 - Math.fround(17 / icon.height()))));
          if (hShrink > Math.fround(0)) {
            frame.top_ = Math.fround(frame.top_ + Math.fround(hShrink / 2));
            frame.bottom_ = Math.fround(frame.bottom_ - Math.fround(hShrink / 2));
          }
          icon.frame$RectF(frame);
        }
      } else if ($J.cls(Trap).isAssignableFrom(entityCls)) {
        let trap = Reflection.newInstance(entityCls);
        icon = TerrainFeaturesTilemap.getTrapVisual(trap);
        if (seen) {
          title = Messages.titleCase(trap.name());
          desc = trap.desc();
          if (Bestiary.encounterCount(entityCls) > 1) {
            desc += '\n\n' + Messages.get$Class$String$ObjectArr($J.cls(WndJournal$CatalogTab), 'trap_count', [Bestiary.encounterCount(entityCls)]);
          }
        } else {
          icon.lightness(0);
          title = '???';
          desc = Messages.get$Class$String$ObjectArr($J.cls(WndJournal$CatalogTab), 'not_seen_trap', []);
          desc += '\n\n' + Messages.get$Object$String$ObjectArr(trap, 'discover_hint', []);
        }
      } else if ($J.cls(Plant).isAssignableFrom(entityCls)) {
        let plant = Reflection.newInstance(entityCls);
        icon = TerrainFeaturesTilemap.getPlantVisual(plant);
        if (seen) {
          title = Messages.titleCase(plant.name());
          desc = plant.desc();
          if (Bestiary.encounterCount(entityCls) > 1) {
            desc += '\n\n' + Messages.get$Class$String$ObjectArr($J.cls(WndJournal$CatalogTab), 'plant_count', [Bestiary.encounterCount(entityCls)]);
          }
        } else {
          icon.lightness(0);
          title = '???';
          desc = Messages.get$Class$String$ObjectArr($J.cls(WndJournal$CatalogTab), 'not_seen_plant', []);
          desc += '\n\n' + Messages.get$Object$String$ObjectArr(plant, 'discover_hint', []);
        }
      }
      let finalMob = mob;
      let finalTitle = title;
      let finalDesc = desc;
      let gridItem = new (WndJournal$7())().$c(seen, finalMob, finalTitle, finalDesc)._ScrollingGridPane$GridItem(icon);
      if (!seen) {
        gridItem.hardLightBG(2, 1, 2);
      }
      grid.addItem(gridItem);
    }
  }
  static addGridDocuments(grid: ScrollingGridPane, doc: Document): void {
    for (const $it2 = doc.pageNames().iterator(); $it2.hasNext(); ) {
      let page = $it2.next();
      let sprite = doc.pageSprite$String(page);
      let seen = doc.isPageFound$String(page);
      let read = doc.isPageRead$String(page);
      if (!seen) {
        sprite.lightness(0);
      }
      let gridItem = new (WndJournal$8())().$c(seen, doc, page)._ScrollingGridPane$GridItem(sprite);
      if (seen) {
        let text = new BitmapText()._BitmapText$String$Font(String((doc.pageIdx(page) + 1) | 0), PixelScene.pixelFont);
        text.measure();
        gridItem.addSecondIcon(text);
        if (!read) {
          gridItem.hardLightBG(Math.fround(0.6), 1, 2);
        }
      } else {
        gridItem.hardLightBG(Math.fround(2.2), 1, Math.fround(2.2));
      }
      grid.addItem(gridItem);
    }
  }
  static $clinit() {
    WndJournal.last_index = 0;
    WndJournal.INSTANCE = null;
  }
}

export class WndJournal$GuideTab extends Component {
  list: ScrollingListPane = null;
  _WndJournal$GuideTab(): this {
    this._Component();
    return this;
  }
  createChildren(): void {
    this.list = new ScrollingListPane()._ScrollingListPane();
    this.add$Gizmo(this.list);
  }
  layout(): void {
    super.layout();
    this.list.setRect(this.x, this.y, this.width_, this.height_);
  }
  updateList(): void {
    this.list.addTitle(Document.ADVENTURERS_GUIDE.title());
    for (const $it3 = Document.ADVENTURERS_GUIDE.pageNames().iterator(); $it3.hasNext(); ) {
      let page = $it3.next();
      let found = Document.ADVENTURERS_GUIDE.isPageFound$String(page);
      let item = new (WndJournal$GuideTab$1())().$o(this).$c(found, page)._ScrollingListPane$ListItem$Image$String$String(Document.ADVENTURERS_GUIDE.pageSprite$String(page), null, found ? Messages.titleCase(Document.ADVENTURERS_GUIDE.pageTitle$String(page)) : Messages.titleCase(Messages.get$Object$String$ObjectArr(this, 'missing', [])));
      if (!found) {
        item.hardlight(10066329);
        item.hardlightIcon(10066329);
      }
      this.list.addItem$ListItem(item);
    }
    this.list.setRect(this.x, this.y, this.width_, this.height_);
  }
}

export class WndJournal$AlchemyTab extends Component {
  pageButtons: RedButton[] = null;
  static readonly NUM_BUTTONS: number = 9;
  static sprites: number[] = null;
  static currentPageIdx: number = 0;
  title_: IconTitle = null;
  body: RenderedTextBlock = null;
  list: ScrollPane = null;
  recipes: ArrayList<QuickRecipe> = null;
  _WndJournal$AlchemyTab(): this {
    this._Component();
    this.recipes = new ArrayList();
    return this;
  }
  createChildren(): void {
    this.pageButtons = $J.newArray(WndJournal$AlchemyTab.NUM_BUTTONS, null);
    for (let i = 0; i < WndJournal$AlchemyTab.NUM_BUTTONS; i++) {
      let idx = i;
      this.pageButtons[i] = new (WndJournal$AlchemyTab$1())().$o(this).$c(idx)._RedButton$String('');
      if (Document.ALCHEMY_GUIDE.isPageFound$int(i)) {
        this.pageButtons[i].icon$Image(new ItemSprite()._ItemSprite$int$Glowing(WndJournal$AlchemyTab.sprites[i], null));
      } else {
        this.pageButtons[i].icon$Image(new ItemSprite()._ItemSprite$int$Glowing(ItemSpriteSheet.SOMETHING, null));
        this.pageButtons[i].enable(false);
      }
      this.add$Gizmo(this.pageButtons[i]);
    }
    this.title_ = new IconTitle()._IconTitle$();
    this.title_.icon(new ItemSprite()._ItemSprite$int(ItemSpriteSheet.ALCH_PAGE));
    this.title_.visible_ = false;
    this.body = PixelScene.renderTextBlock$int(6);
    this.list = new ScrollPane()._ScrollPane(new Component()._Component());
    this.add$Gizmo(this.list);
  }
  layout(): void {
    super.layout();
    if (this.width() >= Math.fround(180)) {
      let buttonWidth = Math.fround(this.width() / this.pageButtons.length);
      for (let i = 0; i < WndJournal$AlchemyTab.NUM_BUTTONS; i++) {
        this.pageButtons[i].setRect(Math.fround(this.x + Math.fround(i * buttonWidth)), this.y, buttonWidth, Math.fround(WndJournal.ITEM_HEIGHT));
        PixelScene.align$Component(this.pageButtons[i]);
      }
    } else {
      let buttonWidth = Math.fround(this.width() / 5);
      let y = 0;
      let x = 0;
      for (let i = 0; i < WndJournal$AlchemyTab.NUM_BUTTONS; i++) {
        this.pageButtons[i].setRect(Math.fround(this.x + x), Math.fround(this.y + y), buttonWidth, Math.fround(WndJournal.ITEM_HEIGHT));
        PixelScene.align$Component(this.pageButtons[i]);
        x = Math.fround(x + buttonWidth);
        if (i === 4) {
          y = Math.fround(y + WndJournal.ITEM_HEIGHT);
          x = 0;
          buttonWidth = Math.fround(this.width() / 4);
        }
      }
    }
    this.list.setRect(this.x, Math.fround((this.pageButtons[(WndJournal$AlchemyTab.NUM_BUTTONS - 1) | 0]).bottom() + 1), this.width_, Math.fround(Math.fround(Math.fround(this.height_ - (this.pageButtons[(WndJournal$AlchemyTab.NUM_BUTTONS - 1) | 0]).bottom()) + this.y) - 1));
    this.updateList();
  }
  updateList(): void {
    if (WndJournal$AlchemyTab.currentPageIdx !== -1 && !Document.ALCHEMY_GUIDE.isPageFound$int(WndJournal$AlchemyTab.currentPageIdx)) {
      WndJournal$AlchemyTab.currentPageIdx = -1;
    }
    for (let i = 0; i < WndJournal$AlchemyTab.NUM_BUTTONS; i++) {
      if (i === WndJournal$AlchemyTab.currentPageIdx) {
        this.pageButtons[i].icon$().color$int(Window.TITLE_COLOR);
      } else {
        this.pageButtons[i].icon$().resetColor();
      }
    }
    if (WndJournal$AlchemyTab.currentPageIdx === -1) {
      return;
    }
    for (const $it4 = this.recipes.iterator(); $it4.hasNext(); ) {
      let r = $it4.next();
      if (r != null) {
        r.killAndErase();
        r.destroy();
      }
    }
    this.recipes.clear();
    let content = this.list.content();
    content.clear();
    this.title_.visible_ = true;
    this.title_.label$String(Document.ALCHEMY_GUIDE.pageTitle$int(WndJournal$AlchemyTab.currentPageIdx));
    this.title_.setRect(0, 0, this.width(), 10);
    content.add$Gizmo(this.title_);
    this.body.maxWidth$int($J.d2i(this.width()));
    this.body.text$String(Document.ALCHEMY_GUIDE.pageBody$int(WndJournal$AlchemyTab.currentPageIdx));
    this.body.setPos(0, this.title_.bottom());
    content.add$Gizmo(this.body);
    Document.ALCHEMY_GUIDE.readPage$int(WndJournal$AlchemyTab.currentPageIdx);
    let toAdd = QuickRecipe.getRecipes(WndJournal$AlchemyTab.currentPageIdx);
    let left: number;
    let top = Math.fround(this.body.bottom() + 2);
    let w: number;
    let toAddThisRow = new ArrayList();
    while (!toAdd.isEmpty()) {
      if (toAdd.get(0) == null) {
        toAdd.removeAt(0);
        top = Math.fround(top + 6);
      }
      w = 0;
      while (!toAdd.isEmpty() && toAdd.get(0) != null && Math.fround(w + toAdd.get(0).width()) <= this.width()) {
        toAddThisRow.add(toAdd.removeAt(0));
        w = $J.d2i(Math.fround(w + toAddThisRow.get(0).width()));
      }
      let spacing = Math.fround((Math.fround(this.width() - w)) / ((toAddThisRow.size() + 1) | 0));
      left = spacing;
      while (!toAddThisRow.isEmpty()) {
        let r = toAddThisRow.removeAt(0);
        r.setPos(left, top);
        left = Math.fround(left + Math.fround(r.width() + spacing));
        if (!toAddThisRow.isEmpty()) {
          let spacer = new ColorBlock()._ColorBlock(1, 16, -14540254);
          spacer.y = top;
          spacer.x = Math.fround(Math.fround(left - Math.fround(spacing / 2)) - 0.5);
          PixelScene.align$Visual(spacer);
          content.add$Gizmo(spacer);
        }
        this.recipes.add(r);
        content.add$Gizmo(r);
      }
      if (!toAdd.isEmpty() && toAdd.get(0) == null) {
        toAdd.removeAt(0);
      }
      if (!toAdd.isEmpty() && toAdd.get(0) != null) {
        let spacer = new ColorBlock()._ColorBlock(this.width(), 1, -14540254);
        spacer.y = Math.fround(top + 16);
        spacer.x = 0;
        content.add$Gizmo(spacer);
      }
      top = Math.fround(top + 17);
      toAddThisRow.clear();
    }
    top = Math.fround(top - 1);
    content.setSize(this.width(), top);
    this.list.setSize(this.list.width(), this.list.height());
    this.list.scrollTo(0, 0);
  }
  static $clinit() {
    WndJournal$AlchemyTab.sprites = [ItemSpriteSheet.SEED_HOLDER, ItemSpriteSheet.STONE_HOLDER, ItemSpriteSheet.FOOD_HOLDER, ItemSpriteSheet.POTION_HOLDER, ItemSpriteSheet.SCROLL_HOLDER, ItemSpriteSheet.BOMB_HOLDER, ItemSpriteSheet.MISSILE_HOLDER, ItemSpriteSheet.ELIXIR_HOLDER, ItemSpriteSheet.SPELL_HOLDER];
    WndJournal$AlchemyTab.currentPageIdx = 0;
  }
}

export class WndJournal$NotesTab extends Component {
  grid: ScrollingGridPane = null;
  custom: CustomNoteButton = null;
  _WndJournal$NotesTab(): this {
    this._Component();
    return this;
  }
  createChildren(): void {
    this.grid = new ScrollingGridPane()._ScrollingGridPane();
    this.add$Gizmo(this.grid);
  }
  layout(): void {
    super.layout();
    this.grid.setRect(this.x, this.y, this.width_, this.height_);
  }
  updateList(): void {
    this.grid.addHeader$String$int$boolean('_' + Messages.get$Object$String$ObjectArr(this, 'title', []) + '_', 9, true);
    this.grid.addHeader$String$int$boolean(Messages.get$Object$String$ObjectArr(this, 'desc', []), 6, true);
    let customRecs = Notes.getRecords$Class($J.cls(Notes$CustomRecord));
    if (!customRecs.isEmpty()) {
      this.grid.addHeader$String('_' + Messages.get$Object$String$ObjectArr(this, 'custom_notes', []) + '_ (' + customRecs.size() + '/' + Notes.customRecordLimit() + ')');
      for (const $it5 = customRecs.iterator(); $it5.hasNext(); ) {
        let rec = $it5.next();
        let gridItem = new (WndJournal$NotesTab$1())().$o(this).$c(rec)._ScrollingGridPane$GridItem(rec.icon());
        let secondIcon = rec.secondIcon();
        if (secondIcon != null) {
          gridItem.addSecondIcon(secondIcon);
        }
        this.grid.addItem(gridItem);
      }
    }
    for (let i = Statistics.deepestFloor; i > 0; i--) {
      let recs = Notes.getRecords$int(i);
      if (i === Dungeon.depth) {
        this.grid.addHeader$String('_' + Messages.get$Object$String$ObjectArr(this, 'floor_header', [i]) + '_');
      } else {
        this.grid.addHeader$String(Messages.get$Object$String$ObjectArr(this, 'floor_header', [i]));
      }
      for (const $it6 = recs.iterator(); $it6.hasNext(); ) {
        let rec = $it6.next();
        let gridItem = new (WndJournal$NotesTab$2())().$o(this).$c(rec)._ScrollingGridPane$GridItem(rec.icon());
        let secondIcon = rec.secondIcon();
        if (secondIcon != null) {
          gridItem.addSecondIcon(secondIcon);
        }
        this.grid.addItem(gridItem);
      }
    }
    this.custom = new CustomNoteButton()._CustomNoteButton();
    this.grid.content().add$Gizmo(this.custom);
    this.custom.setPos(Math.fround(Math.fround(this.width_ - this.custom.width()) - 1), 0);
    this.grid.setRect(this.x, this.y, this.width_, this.height_);
  }
}

export class WndJournal$CatalogTab extends Component {
  itemButtons: RedButton[] = null;
  static readonly NUM_BUTTONS: number = 4;
  static currentItemIdx: number = 0;
  static scrollPositions: number[] = null;
  static readonly EQUIP_IDX: number = 0;
  static readonly CONSUM_IDX: number = 1;
  static readonly BESTIARY_IDX: number = 2;
  static readonly LORE_IDX: number = 3;
  grid: ScrollingGridPane = null;
  _WndJournal$CatalogTab(): this {
    this._Component();
    return this;
  }
  createChildren(): void {
    this.itemButtons = $J.newArray(WndJournal$CatalogTab.NUM_BUTTONS, null);
    for (let i = 0; i < WndJournal$CatalogTab.NUM_BUTTONS; i++) {
      let idx = i;
      this.itemButtons[i] = new (WndJournal$CatalogTab$1())().$o(this).$c(idx)._RedButton$String('');
      this.add$Gizmo(this.itemButtons[i]);
    }
    this.itemButtons[WndJournal$CatalogTab.EQUIP_IDX].icon$Image(new ItemSprite()._ItemSprite$int(ItemSpriteSheet.WEAPON_HOLDER));
    this.itemButtons[WndJournal$CatalogTab.CONSUM_IDX].icon$Image(new ItemSprite()._ItemSprite$int(ItemSpriteSheet.POTION_HOLDER));
    this.itemButtons[WndJournal$CatalogTab.BESTIARY_IDX].icon$Image(new ItemSprite()._ItemSprite$int(ItemSpriteSheet.MOB_HOLDER));
    this.itemButtons[WndJournal$CatalogTab.LORE_IDX].icon$Image(new ItemSprite()._ItemSprite$int(ItemSpriteSheet.DOCUMENT_HOLDER));
    this.grid = new (WndJournal$CatalogTab$2())().$o(this)._ScrollingGridPane();
    this.add$Gizmo(this.grid);
  }
  layout(): void {
    super.layout();
    let perRow = WndJournal$CatalogTab.NUM_BUTTONS;
    let buttonWidth = Math.fround(this.width() / perRow);
    for (let i = 0; i < WndJournal$CatalogTab.NUM_BUTTONS; i++) {
      this.itemButtons[i].setRect(Math.fround(this.x + Math.fround((i % perRow) * (buttonWidth))), Math.fround(this.y + Math.imul(($J.idiv(i, perRow)), (WndJournal.ITEM_HEIGHT))), buttonWidth, Math.fround(WndJournal.ITEM_HEIGHT));
      PixelScene.align$Component(this.itemButtons[i]);
    }
    this.grid.setRect(this.x, Math.fround((this.itemButtons[(WndJournal$CatalogTab.NUM_BUTTONS - 1) | 0]).bottom() + 1), this.width_, Math.fround(Math.fround(this.height_ - (this.itemButtons[(WndJournal$CatalogTab.NUM_BUTTONS - 1) | 0]).height()) - 1));
  }
  updateList(): void {
    this.grid.clear();
    for (let i = 0; i < WndJournal$CatalogTab.NUM_BUTTONS; i++) {
      if (i === WndJournal$CatalogTab.currentItemIdx) {
        this.itemButtons[i].icon$().color$int(Window.TITLE_COLOR);
      } else {
        this.itemButtons[i].icon$().resetColor();
      }
    }
    this.grid.scrollTo(0, 0);
    if (WndJournal$CatalogTab.currentItemIdx === WndJournal$CatalogTab.EQUIP_IDX) {
      let totalItems = 0;
      let totalSeen = 0;
      for (const $it7 = Catalog.equipmentCatalogs.iterator(); $it7.hasNext(); ) {
        let catalog = $it7.next();
        totalItems = (totalItems + catalog.totalItems()) | 0;
        totalSeen = (totalSeen + catalog.totalSeen()) | 0;
      }
      this.grid.addHeader$String$int$boolean('_' + Messages.get$Object$String$ObjectArr(this, 'title_equipment', []) + '_ (' + totalSeen + '/' + totalItems + ')', 9, true);
      for (const $it8 = Catalog.equipmentCatalogs.iterator(); $it8.hasNext(); ) {
        let catalog = $it8.next();
        this.grid.addHeader$String('_' + Messages.titleCase(catalog.title()) + '_ (' + catalog.totalSeen() + '/' + catalog.totalItems() + '):');
        WndJournal.addGridItems(this.grid, catalog.items());
      }
    } else if (WndJournal$CatalogTab.currentItemIdx === WndJournal$CatalogTab.CONSUM_IDX) {
      let totalItems = 0;
      let totalSeen = 0;
      for (const $it9 = Catalog.consumableCatalogs.iterator(); $it9.hasNext(); ) {
        let catalog = $it9.next();
        totalItems = (totalItems + catalog.totalItems()) | 0;
        totalSeen = (totalSeen + catalog.totalSeen()) | 0;
      }
      this.grid.addHeader$String$int$boolean('_' + Messages.get$Object$String$ObjectArr(this, 'title_consumables', []) + '_ (' + totalSeen + '/' + totalItems + ')', 9, true);
      for (const $it10 = Catalog.consumableCatalogs.iterator(); $it10.hasNext(); ) {
        let catalog = $it10.next();
        this.grid.addHeader$String('_' + Messages.titleCase(catalog.title()) + '_ (' + catalog.totalSeen() + '/' + catalog.totalItems() + '):');
        WndJournal.addGridItems(this.grid, catalog.items());
      }
    } else if (WndJournal$CatalogTab.currentItemIdx === WndJournal$CatalogTab.BESTIARY_IDX) {
      let totalItems = 0;
      let totalSeen = 0;
      for (let bestiary of Bestiary.values()) {
        totalItems = (totalItems + bestiary.totalEntities()) | 0;
        totalSeen = (totalSeen + bestiary.totalSeen()) | 0;
      }
      this.grid.addHeader$String$int$boolean('_' + Messages.get$Object$String$ObjectArr(this, 'title_bestiary', []) + '_ (' + totalSeen + '/' + totalItems + ')', 9, true);
      for (let bestiary of Bestiary.values()) {
        this.grid.addHeader$String('_' + Messages.titleCase(bestiary.title()) + '_ (' + bestiary.totalSeen() + '/' + bestiary.totalEntities() + '):');
        WndJournal.addGridEntities(this.grid, bestiary.entities());
      }
    } else {
      let totalItems = 0;
      let totalSeen = 0;
      for (let doc of Document.values()) {
        if (!doc.isLoreDoc()) {
          continue;
        }
        for (const $it11 = doc.pageNames().iterator(); $it11.hasNext(); ) {
          let page = $it11.next();
          totalItems++;
          if (doc.isPageFound$String(page)) {
            totalSeen++;
          }
        }
      }
      this.grid.addHeader$String$int$boolean('_' + Messages.get$Object$String$ObjectArr(this, 'title_lore', []) + '_ (' + totalSeen + '/' + totalItems + ')', 9, true);
      for (let doc of Document.values()) {
        if (!doc.isLoreDoc()) {
          continue;
        }
        for (const $it12 = doc.pageNames().iterator(); $it12.hasNext(); ) {
          let page = $it12.next();
          totalItems++;
          if (doc.isPageFound$String(page)) {
            totalSeen++;
          }
        }
      }
      for (let doc of Document.values()) {
        if (!doc.isLoreDoc()) {
          continue;
        }
        totalItems = totalSeen = 0;
        for (const $it13 = doc.pageNames().iterator(); $it13.hasNext(); ) {
          let page = $it13.next();
          totalItems++;
          if (doc.isPageFound$String(page)) {
            totalSeen++;
          }
        }
        if (!doc.anyPagesFound()) {
          this.grid.addHeader$String('_???_ (' + totalSeen + '/' + totalItems + '):');
        } else {
          this.grid.addHeader$String('_' + Messages.titleCase(doc.title()) + '_ (' + totalSeen + '/' + totalItems + '):');
        }
        WndJournal.addGridDocuments(this.grid, doc);
      }
    }
    this.grid.setRect(this.x, Math.fround((this.itemButtons[(WndJournal$CatalogTab.NUM_BUTTONS - 1) | 0]).bottom() + 1), this.width_, Math.fround(Math.fround(this.height_ - (this.itemButtons[(WndJournal$CatalogTab.NUM_BUTTONS - 1) | 0]).height()) - 1));
    this.grid.scrollTo(0, WndJournal$CatalogTab.scrollPositions[WndJournal$CatalogTab.currentItemIdx]);
  }
  static $clinit() {
    WndJournal$CatalogTab.currentItemIdx = 0;
    WndJournal$CatalogTab.scrollPositions = $J.newArray(WndJournal$CatalogTab.NUM_BUTTONS, 0);
  }
}

export class WndJournal$BadgesTab extends Component {
  btnLocal: RedButton = null;
  btnGlobal: RedButton = null;
  title_: RenderedTextBlock = null;
  badgesLocal: Component = null;
  badgesGlobal: Component = null;
  static global: boolean = false;
  _WndJournal$BadgesTab(): this {
    this._Component();
    return this;
  }
  createChildren(): void {
    if (Dungeon.hero != null) {
      this.btnLocal = new (WndJournal$BadgesTab$1())().$o(this)._RedButton$String(Messages.get$Object$String$ObjectArr(this, 'this_run', []));
      this.btnLocal.icon$Image(Icons.BADGES.get());
      this.add$Gizmo(this.btnLocal);
      this.btnGlobal = new (WndJournal$BadgesTab$2())().$o(this)._RedButton$String(Messages.get$Object$String$ObjectArr(this, 'overall', []));
      this.btnGlobal.icon$Image(Icons.BADGES.get());
      this.add$Gizmo(this.btnGlobal);
      if (Badges.filterReplacedBadges$boolean(false).size() <= 8) {
        this.badgesLocal = new BadgesList()._BadgesList(false);
      } else {
        this.badgesLocal = new BadgesGrid()._BadgesGrid(false);
      }
      this.add$Gizmo(this.badgesLocal);
    } else {
      this.title_ = PixelScene.renderTextBlock$String$int(Messages.get$Object$String$ObjectArr(this, 'title_main_menu', []), 9);
      this.title_.hardlight(Window.TITLE_COLOR);
      this.add$Gizmo(this.title_);
    }
    this.badgesGlobal = new BadgesGrid()._BadgesGrid(true);
    this.add$Gizmo(this.badgesGlobal);
  }
  layout(): void {
    super.layout();
    if (this.btnLocal != null) {
      this.btnLocal.setRect(this.x, this.y, Math.fround(this.width_ / 2), 18);
      this.btnGlobal.setRect(Math.fround(this.x + Math.fround(this.width_ / 2)), this.y, Math.fround(this.width_ / 2), 18);
      this.badgesLocal.setRect(this.x, Math.fround(this.y + 20), this.width_, Math.fround(this.height_ - 20));
      this.badgesGlobal.setRect(this.x, Math.fround(this.y + 20), this.width_, Math.fround(this.height_ - 20));
    } else {
      this.title_.setPos(Math.fround(this.x + Math.fround((Math.fround(this.width_ - this.title_.width())) / 2)), Math.fround(this.y + Math.fround((Math.fround(12 - this.title_.height())) / 2)));
      this.badgesGlobal.setRect(this.x, Math.fround(this.y + 14), this.width_, Math.fround(this.height_ - 14));
    }
  }
  updateList(): void {
    if (this.btnLocal != null) {
      this.badgesLocal.visible_ = this.badgesLocal.active = !WndJournal$BadgesTab.global;
      this.badgesGlobal.visible_ = this.badgesGlobal.active = WndJournal$BadgesTab.global;
      this.btnLocal.textColor(WndJournal$BadgesTab.global ? Window.WHITE : Window.TITLE_COLOR);
      this.btnGlobal.textColor(WndJournal$BadgesTab.global ? Window.TITLE_COLOR : Window.WHITE);
    } else {
      this.badgesGlobal.visible_ = this.badgesGlobal.active = true;
    }
  }
  static $clinit() {
    WndJournal$BadgesTab.global = false;
  }
}

let $WndJournal$1: any = null;
/** An anonymous class (WndJournal.java:144). */
function WndJournal$1(): any {
  return $WndJournal$1 ??= $J.local(class extends WndTabbed$IconTab {
    select(value: boolean): void {
      super.select(value);
      this.$outer.notesTab.active = this.$outer.notesTab.visible_ = value;
      if (value) {
        WndJournal.last_index = 0;
      }
    }
    hoverText(): string {
      return Messages.get$Object$String$ObjectArr(this.$outer.notesTab, 'title', []);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndJournal$1', []);
}

let $WndJournal$2: any = null;
/** An anonymous class (WndJournal.java:156). */
function WndJournal$2(): any {
  return $WndJournal$2 ??= $J.local(class extends WndTabbed$IconTab {
    select(value: boolean): void {
      super.select(value);
      this.$outer.guideTab.active = this.$outer.guideTab.visible_ = value;
      if (value) {
        WndJournal.last_index = 1;
      }
    }
    hoverText(): string {
      return Messages.get$Object$String$ObjectArr(this.$outer.guideTab, 'title', []);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndJournal$2', []);
}

let $WndJournal$3: any = null;
/** An anonymous class (WndJournal.java:168). */
function WndJournal$3(): any {
  return $WndJournal$3 ??= $J.local(class extends WndTabbed$IconTab {
    select(value: boolean): void {
      super.select(value);
      this.$outer.alchemyTab.active = this.$outer.alchemyTab.visible_ = value;
      if (value) {
        WndJournal.last_index = 2;
      }
    }
    hoverText(): string {
      return Messages.get$Object$String$ObjectArr(this.$outer.alchemyTab, 'title', []);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndJournal$3', []);
}

let $WndJournal$4: any = null;
/** An anonymous class (WndJournal.java:180). */
function WndJournal$4(): any {
  return $WndJournal$4 ??= $J.local(class extends WndTabbed$IconTab {
    select(value: boolean): void {
      super.select(value);
      this.$outer.catalogTab.active = this.$outer.catalogTab.visible_ = value;
      if (value) {
        WndJournal.last_index = 3;
      }
    }
    hoverText(): string {
      return Messages.get$Object$String$ObjectArr(this.$outer.catalogTab, 'title', []);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndJournal$4', []);
}

let $WndJournal$5: any = null;
/** An anonymous class (WndJournal.java:192). */
function WndJournal$5(): any {
  return $WndJournal$5 ??= $J.local(class extends WndTabbed$IconTab {
    select(value: boolean): void {
      super.select(value);
      this.$outer.badgesTab.active = this.$outer.badgesTab.visible_ = value;
      if (value) {
        WndJournal.last_index = 4;
      }
    }
    hoverText(): string {
      return Messages.get$Object$String$ObjectArr(this.$outer.badgesTab, 'title', []);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndJournal$5', []);
}

let $WndJournal$6: any = null;
/** An anonymous class (WndJournal.java:850). */
function WndJournal$6(): any {
  return $WndJournal$6 ??= $J.local(class extends ScrollingGridPane$GridItem {
    onClick(x: number, y: number): boolean {
      if (this.inside(x, y)) {
        let sprite = new ItemSprite()._ItemSprite$();
        sprite.copy(this.icon_);
        if (Game.scene() instanceof GameScene) {
          GameScene.show(new WndJournalItem()._WndJournalItem(sprite, this.$cv_finalTitle, this.$cv_finalDesc));
        } else {
          Game.scene().addToFront(new WndJournalItem()._WndJournalItem(sprite, this.$cv_finalTitle, this.$cv_finalDesc));
        }
        return true;
      } else {
        return false;
      }
    }
    $c($finalTitle, $finalDesc): this {
      this.$cv_finalTitle = $finalTitle; this.$cv_finalDesc = $finalDesc;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndJournal$6', []);
}

let $WndJournal$7: any = null;
/** An anonymous class (WndJournal.java:984). */
function WndJournal$7(): any {
  return $WndJournal$7 ??= $J.local(class extends ScrollingGridPane$GridItem {
    onClick(x: number, y: number): boolean {
      if (this.inside(x, y)) {
        let image: Image;
        if (this.$cv_seen && this.$cv_finalMob != null) {
          image = this.$cv_finalMob.sprite();
        } else {
          image = new Image()._Image$Image(this.icon_);
        }
        if (Game.scene() instanceof GameScene) {
          GameScene.show(new WndJournalItem()._WndJournalItem(image, this.$cv_finalTitle, this.$cv_finalDesc));
        } else {
          Game.scene().addToFront(new WndJournalItem()._WndJournalItem(image, this.$cv_finalTitle, this.$cv_finalDesc));
        }
        return true;
      } else {
        return false;
      }
    }
    $c($seen, $finalMob, $finalTitle, $finalDesc): this {
      this.$cv_seen = $seen; this.$cv_finalMob = $finalMob; this.$cv_finalTitle = $finalTitle; this.$cv_finalDesc = $finalDesc;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndJournal$7', []);
}

let $WndJournal$8: any = null;
/** An anonymous class (WndJournal.java:1026). */
function WndJournal$8(): any {
  return $WndJournal$8 ??= $J.local(class extends ScrollingGridPane$GridItem {
    onClick(x: number, y: number): boolean {
      if (this.inside(x, y)) {
        let sprite = new Image()._Image$Image(this.icon_);
        if (this.$cv_seen) {
          if (Game.scene() instanceof GameScene) {
            GameScene.show(new WndStory()._WndStory$Image$String$String(sprite, this.$cv_doc.pageTitle$String(this.$cv_page), this.$cv_doc.pageBody$String(this.$cv_page)));
          } else {
            Game.scene().addToFront(new WndStory()._WndStory$Image$String$String(sprite, this.$cv_doc.pageTitle$String(this.$cv_page), this.$cv_doc.pageBody$String(this.$cv_page)));
          }
          this.$cv_doc.readPage$String(this.$cv_page);
          this.hardLightBG(1, 1, 1);
        } else {
          if (Game.scene() instanceof GameScene) {
            GameScene.show(new WndJournalItem()._WndJournalItem(sprite, '???', Messages.get$Class$String$ObjectArr($J.cls(WndJournal$CatalogTab), 'not_seen_lore', []) + '\n\n' + this.$cv_doc.discoverHint()));
          } else {
            Game.scene().addToFront(new WndJournalItem()._WndJournalItem(sprite, '???', Messages.get$Class$String$ObjectArr($J.cls(WndJournal$CatalogTab), 'not_seen_lore', []) + '\n\n' + this.$cv_doc.discoverHint()));
          }
        }
        return true;
      } else {
        return false;
      }
    }
    $c($seen, $doc, $page): this {
      this.$cv_seen = $seen; this.$cv_doc = $doc; this.$cv_page = $page;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndJournal$8', []);
}

let $WndJournal$GuideTab$1: any = null;
/** An anonymous class (WndJournal.java:261). */
function WndJournal$GuideTab$1(): any {
  return $WndJournal$GuideTab$1 ??= $J.local(class extends ScrollingListPane$ListItem {
    onClick(x: number, y: number): boolean {
      if (this.inside(x, y) && this.$cv_found) {
        Game.scene().addToFront(new WndStory()._WndStory$Image$String$String(Document.ADVENTURERS_GUIDE.pageSprite$String(this.$cv_page), Document.ADVENTURERS_GUIDE.pageTitle$String(this.$cv_page), Document.ADVENTURERS_GUIDE.pageBody$String(this.$cv_page)));
        Document.ADVENTURERS_GUIDE.readPage$String(this.$cv_page);
        return true;
      } else {
        return false;
      }
    }
    $c($found, $page): this {
      this.$cv_found = $found; this.$cv_page = $page;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndJournal$GuideTab$1', []);
}

let $WndJournal$AlchemyTab$1: any = null;
/** An anonymous class (WndJournal.java:317). */
function WndJournal$AlchemyTab$1(): any {
  return $WndJournal$AlchemyTab$1 ??= $J.local(class extends RedButton {
    onClick(): void {
      WndJournal$AlchemyTab.currentPageIdx = this.$cv_idx;
      this.$outer.updateList();
    }
    $c($idx): this {
      this.$cv_idx = $idx;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndJournal$AlchemyTab$1', []);
}

let $WndJournal$NotesTab$1: any = null;
/** An anonymous class (WndJournal.java:503). */
function WndJournal$NotesTab$1(): any {
  return $WndJournal$NotesTab$1 ??= $J.local(class extends ScrollingGridPane$GridItem {
    onClick(x: number, y: number): boolean {
      if (this.inside(x, y)) {
        GameScene.show(new CustomNoteButton$CustomNoteWindow()._CustomNoteButton$CustomNoteWindow(this.$cv_rec, WndJournal.INSTANCE));
        return true;
      } else {
        return false;
      }
    }
    $c($rec): this {
      this.$cv_rec = $rec;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndJournal$NotesTab$1', []);
}

let $WndJournal$NotesTab$2: any = null;
/** An anonymous class (WndJournal.java:535). */
function WndJournal$NotesTab$2(): any {
  return $WndJournal$NotesTab$2 ??= $J.local(class extends ScrollingGridPane$GridItem {
    onClick(x: number, y: number): boolean {
      if (this.inside(x, y)) {
        GameScene.show(new WndJournalItem()._WndJournalItem(this.$cv_rec.icon(), Messages.titleCase(this.$cv_rec.title()), this.$cv_rec.desc()));
        return true;
      } else {
        return false;
      }
    }
    $c($rec): this {
      this.$cv_rec = $rec;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndJournal$NotesTab$2', []);
}

let $WndJournal$CatalogTab$1: any = null;
/** An anonymous class (WndJournal.java:589). */
function WndJournal$CatalogTab$1(): any {
  return $WndJournal$CatalogTab$1 ??= $J.local(class extends RedButton {
    onClick(): void {
      WndJournal$CatalogTab.currentItemIdx = this.$cv_idx;
      this.$outer.updateList();
    }
    $c($idx): this {
      this.$cv_idx = $idx;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndJournal$CatalogTab$1', []);
}

let $WndJournal$CatalogTab$2: any = null;
/** An anonymous class (WndJournal.java:603). */
function WndJournal$CatalogTab$2(): any {
  return $WndJournal$CatalogTab$2 ??= $J.local(class extends ScrollingGridPane {
    update(): void {
      super.update();
      WndJournal$CatalogTab.scrollPositions[WndJournal$CatalogTab.currentItemIdx] = this.content_.camera_.scroll_.y;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndJournal$CatalogTab$2', []);
}

let $WndJournal$BadgesTab$1: any = null;
/** An anonymous class (WndJournal.java:1087). */
function WndJournal$BadgesTab$1(): any {
  return $WndJournal$BadgesTab$1 ??= $J.local(class extends RedButton {
    onClick(): void {
      super.onClick();
      WndJournal$BadgesTab.global = false;
      this.$outer.updateList();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndJournal$BadgesTab$1', []);
}

let $WndJournal$BadgesTab$2: any = null;
/** An anonymous class (WndJournal.java:1098). */
function WndJournal$BadgesTab$2(): any {
  return $WndJournal$BadgesTab$2 ??= $J.local(class extends RedButton {
    onClick(): void {
      super.onClick();
      WndJournal$BadgesTab.global = true;
      this.$outer.updateList();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndJournal$BadgesTab$2', []);
}

$J.define(WndJournal, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndJournal', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.windows.WndTabbed', ctors: { '': '_WndJournal' }, meths: { 'offset(int,int)': 'offset$int$int' }, clinit: true, lazy: ['last_index', 'INSTANCE'] });
$J.define(WndJournal$GuideTab, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndJournal$GuideTab', { kind: 'class', sup: 'com.watabou.noosa.ui.Component', ctors: { '': '_WndJournal$GuideTab' } });
$J.define(WndJournal$AlchemyTab, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndJournal$AlchemyTab', { kind: 'class', sup: 'com.watabou.noosa.ui.Component', ctors: { '': '_WndJournal$AlchemyTab' }, clinit: true, lazy: ['sprites', 'currentPageIdx'] });
$J.define(WndJournal$NotesTab, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndJournal$NotesTab', { kind: 'class', sup: 'com.watabou.noosa.ui.Component', ctors: { '': '_WndJournal$NotesTab' } });
$J.define(WndJournal$CatalogTab, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndJournal$CatalogTab', { kind: 'class', sup: 'com.watabou.noosa.ui.Component', ctors: { '': '_WndJournal$CatalogTab' }, clinit: true, lazy: ['currentItemIdx', 'scrollPositions'] });
$J.define(WndJournal$BadgesTab, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndJournal$BadgesTab', { kind: 'class', sup: 'com.watabou.noosa.ui.Component', ctors: { '': '_WndJournal$BadgesTab' }, clinit: true, lazy: ['global'] });
$J.module(() => {
  Assets$Sprites = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sprites');
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  SPDAction = $J.load('com.shatteredpixel.shatteredpixeldungeon.SPDAction');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  CrystalSpire = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.CrystalSpire');
  Mimic = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mimic');
  Mob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob');
  Pylon = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Pylon');
  EnergyCrystal = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.EnergyCrystal');
  Gold = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Gold');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  Armor$Glyph = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor$Glyph');
  ClassArmor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.ClassArmor');
  Artifact = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.Artifact');
  Potion = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.Potion');
  ExoticPotion = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.exotic.ExoticPotion');
  Ring = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.Ring');
  Scroll = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.Scroll');
  Trinket = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.Trinket');
  WandOfRegrowth$Lotus = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfRegrowth$Lotus');
  WandOfWarding$Ward = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfWarding$Ward');
  WandOfWarding$Ward$WardSentry = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfWarding$Ward$WardSentry');
  SpiritBow = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.SpiritBow');
  Weapon$Enchantment = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon$Enchantment');
  MagesStaff = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.MagesStaff');
  Bestiary = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Bestiary');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  Document = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Document');
  Notes = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Notes');
  Notes$CustomRecord = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Notes$CustomRecord');
  Trap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.Trap');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  Plant = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Plant');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  ItemSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  ItemSpriteSheet$Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet$Icons');
  TerrainFeaturesTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.TerrainFeaturesTilemap');
  BadgesGrid = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BadgesGrid');
  BadgesList = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BadgesList');
  CustomNoteButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.CustomNoteButton');
  CustomNoteButton$CustomNoteWindow = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.CustomNoteButton$CustomNoteWindow');
  Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Icons');
  QuickRecipe = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.QuickRecipe');
  RedButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.RedButton');
  ScrollPane = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.ScrollPane');
  ScrollingGridPane = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.ScrollingGridPane');
  ScrollingGridPane$GridItem = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.ScrollingGridPane$GridItem');
  ScrollingListPane = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.ScrollingListPane');
  ScrollingListPane$ListItem = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.ScrollingListPane$ListItem');
  Window = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Window');
  IconTitle = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.IconTitle');
  WndJournalItem = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndJournalItem');
  WndStory = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndStory');
  WndTabbed$IconTab = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndTabbed$IconTab');
  KeyBindings = $J.load('com.watabou.input.KeyBindings');
  BitmapText = $J.load('com.watabou.noosa.BitmapText');
  ColorBlock = $J.load('com.watabou.noosa.ColorBlock');
  Game = $J.load('com.watabou.noosa.Game');
  Image = $J.load('com.watabou.noosa.Image');
  Reflection = $J.load('com.watabou.utils.Reflection');
});
