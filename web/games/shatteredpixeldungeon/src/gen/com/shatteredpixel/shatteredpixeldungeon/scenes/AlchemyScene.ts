// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/scenes/AlchemyScene.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, IOException } from '../../../../../jre/index.ts';
import { PixelScene } from './PixelScene.ts';
import { Component } from '../../../watabou/noosa/ui/Component.ts';

let Assets$Sounds, Badges, Chrome, Chrome$Type, Dungeon, SPDAction, ShatteredPixelDungeon, Statistics, Speck, SparkParticle, EnergyCrystal, Item, LiquidMetal, Recipe, TrinketCatalyst, TrinketCatalyst$Recipe, TrinketCatalyst$WndTrinket, MissileWeapon, Catalog, Document, Journal, Messages, GameScene, ItemSprite, ItemSpriteSheet, Button, ExitButton, IconButton, Icons, ItemSlot, RadialMenu, RedButton, StatusPane, StyledButton, Toolbar, Window, IconTitle, WndBag, WndBag$ItemSelector, WndBag$Placeholder, WndEnergizeItem, WndInfoItem, WndJournal, WndJournal$AlchemyTab, WndKeyBindings, WndMessage, TextureCache, Blending, ControllerHandler, GameAction, KeyBindings, Camera, Game, Image, NoosaScriptNoLighting, SkinnedBlock, Sample, Emitter;

export class AlchemyScene extends PixelScene {
  static inputs: AlchemyScene$InputButton[] = null;
  static combines: AlchemyScene$CombineButton[] = null;
  static outputs: AlchemyScene$OutputSlot[] = null;
  cancel_: IconButton = null;
  repeat: IconButton = null;
  static lastIngredients: ArrayList<Item> = null;
  static lastRecipe: Recipe = null;
  smokeEmitter: Emitter = null;
  bubbleEmitter: Emitter = null;
  sparkEmitter: Emitter = null;
  lowerBubbles: Emitter = null;
  water: SkinnedBlock = null;
  energyIcon: Image = null;
  energyLeft: RenderedTextBlock = null;
  energyAdd: IconButton = null;
  energyAddBlinking: boolean = false;
  static splitAlchGuide: boolean = false;
  alchGuide: WndJournal$AlchemyTab = null;
  static centerW: number = 0;
  static readonly BTN_SIZE: number = 28;
  itemSelector: WndBag$ItemSelector = null;
  saveNeeded: boolean = false;
  static toolkit: AlchemistsToolkit = null;
  _AlchemyScene(): this {
    this._PixelScene();
    this.energyAddBlinking = false;
    this.alchGuide = null;
    this.inGameScene = true;
    this.itemSelector = new (AlchemyScene$8())().$o(this)._WndBag$ItemSelector();
    this.saveNeeded = false;
    return this;
  }
  create(): void {
    super.create();
    let w = Camera.main.width_;
    let h = Camera.main.height_;
    let insets = this.getCommonInsets();
    this.water = new (AlchemyScene$1())().$o(this)._SkinnedBlock(Math.fround(w), Math.fround(h), Dungeon.level.waterTex());
    this.water.autoAdjust = true;
    this.add$Gizmo(this.water);
    let im = new Image()._Image$Object(TextureCache.createGradient([1711276032, -2013265920, -1442840576, -872415232, -16777216]));
    im.angle = 90;
    im.x = Math.fround(w);
    im.scale_.x = Math.fround(h / 5);
    im.scale_.y = Math.fround(w);
    this.add$Gizmo(im);
    w = $J.d2i(Math.fround(w - Math.fround(insets.left_ + insets.right_)));
    h = $J.d2i(Math.fround(h - Math.fround(insets.top_ + insets.bottom_)));
    let btnExit = new (AlchemyScene$2())().$o(this)._ExitButton();
    btnExit.setPos(Math.fround(Math.fround(insets.left_ + w) - btnExit.width()), insets.top_);
    this.add$Gizmo(btnExit);
    this.bubbleEmitter = new Emitter()._Emitter();
    this.add$Gizmo(this.bubbleEmitter);
    this.lowerBubbles = new Emitter()._Emitter();
    this.add$Gizmo(this.lowerBubbles);
    let title = new IconTitle()._IconTitle$Image$String(Icons.ALCHEMY.get(), Messages.get$Object$String$ObjectArr(this, 'title', []));
    title.setSize(200, 0);
    title.setPos(Math.fround(insets.left_ + Math.fround((Math.fround(w - title.reqWidth())) / 2)), Math.fround(insets.top_ + Math.fround((Math.fround(20 - title.height())) / 2)));
    PixelScene.align$Component(title);
    this.add$Gizmo(title);
    let pw = Math.min((50 + $J.idiv(w, 2)) | 0, 150);
    let left = ($J.d2i((insets.left_)) + $J.idiv(((w - pw) | 0), 2)) | 0;
    AlchemyScene.centerW = (left + $J.idiv(pw, 2)) | 0;
    let pos = ($J.d2i((insets.top_)) + $J.idiv(((h - 120) | 0), 2)) | 0;
    if (AlchemyScene.splitAlchGuide && w >= 300 && Math.fround(h) >= PixelScene.MIN_HEIGHT_FULL) {
      pw = Math.min(150, $J.idiv(w, 2));
      left = (($J.idiv(w, 2) - pw) | 0);
      AlchemyScene.centerW = (left + $J.idiv(pw, 2)) | 0;
      let guideBG = Chrome.get(Chrome$Type.TOAST);
      guideBG.size(Math.fround((126 + guideBG.marginHor()) | 0), Math.fround(Math.min((Camera.main.height_ - 18) | 0, (191 + guideBG.marginVer()) | 0)));
      guideBG.y = Math.max(17, Math.fround(insets.top_ + Math.fround((Math.fround(h - guideBG.height())) / 2)));
      guideBG.x = Math.fround(Math.fround(Math.fround(insets.left_ + w) - left) - guideBG.width());
      this.add$Gizmo(guideBG);
      this.alchGuide = new WndJournal$AlchemyTab()._WndJournal$AlchemyTab();
      this.add$Gizmo(this.alchGuide);
      this.alchGuide.setRect(Math.fround(guideBG.x + guideBG.marginLeft()), Math.fround(guideBG.y + guideBG.marginTop()), Math.fround(guideBG.width() - guideBG.marginHor()), Math.fround(guideBG.height() - guideBG.marginVer()));
    } else {
      AlchemyScene.splitAlchGuide = false;
    }
    let desc = PixelScene.renderTextBlock$int(6);
    desc.maxWidth$int(pw);
    desc.text$String(Messages.get$Class$String$ObjectArr($J.cls(AlchemyScene), 'text', []));
    desc.setPos(Math.fround(left + Math.fround((Math.fround(pw - desc.width())) / 2)), Math.fround(pos));
    this.add$Gizmo(desc);
    pos = $J.d2i(Math.fround(pos + Math.fround(desc.height() + 6)));
    let inputBG = Chrome.get(Chrome$Type.TOAST_TR);
    inputBG.x = Math.fround((left + 6) | 0);
    inputBG.y = Math.fround(pos);
    inputBG.size(Math.fround((AlchemyScene.BTN_SIZE + 8) | 0), Math.fround((Math.imul(3, AlchemyScene.BTN_SIZE) + 4 + 8) | 0));
    this.add$Gizmo(inputBG);
    pos = (pos + 4) | 0;
    {
      for (let i = 0; i < AlchemyScene.inputs.length; i++) {
        if (AlchemyScene.inputs[i] == null) {
          AlchemyScene.inputs[i] = new AlchemyScene$InputButton().$o(this)._AlchemyScene$InputButton();
        } else {
          let item = AlchemyScene.inputs[i].item$();
          AlchemyScene.inputs[i] = new AlchemyScene$InputButton().$o(this)._AlchemyScene$InputButton();
          if (item != null) {
            AlchemyScene.inputs[i].item$Item(item);
          }
        }
        AlchemyScene.inputs[i].setRect(Math.fround((left + 10) | 0), Math.fround(pos), Math.fround(AlchemyScene.BTN_SIZE), Math.fround(AlchemyScene.BTN_SIZE));
        this.add$Gizmo(AlchemyScene.inputs[i]);
        pos = (pos + (AlchemyScene.BTN_SIZE + 2)) | 0;
      }
    }
    let invSelector = new (AlchemyScene$3())().$o(this)._Button();
    this.add$Gizmo(invSelector);
    this.cancel_ = new (AlchemyScene$4())().$o(this)._IconButton$Image(Icons.CLOSE.get());
    this.cancel_.setRect(Math.fround((left + 8) | 0), Math.fround((pos + 2) | 0), 16, 16);
    this.cancel_.enable(false);
    this.add$Gizmo(this.cancel_);
    this.repeat = new (AlchemyScene$5())().$o(this)._IconButton$Image(Icons.REPEAT.get());
    this.repeat.setRect(Math.fround((left + 24) | 0), Math.fround((pos + 2) | 0), 16, 16);
    this.repeat.enable(false);
    this.add$Gizmo(this.repeat);
    AlchemyScene.lastIngredients.clear();
    AlchemyScene.lastRecipe = null;
    for (let i = 0; i < AlchemyScene.inputs.length; i++) {
      AlchemyScene.combines[i] = new AlchemyScene$CombineButton().$o(this)._AlchemyScene$CombineButton(i);
      AlchemyScene.combines[i].enable$boolean(false);
      AlchemyScene.outputs[i] = new AlchemyScene$OutputSlot().$o(this)._AlchemyScene$OutputSlot();
      AlchemyScene.outputs[i].item(null);
      if (i === 0) {
        AlchemyScene.combines[i].setRect(Math.fround(left + Math.fround(((pw - 30) | 0) / 2)), Math.fround(AlchemyScene.inputs[1].top() + 5), 30, Math.fround(AlchemyScene.inputs[1].height() - 10));
        AlchemyScene.outputs[i].setRect(Math.fround((left + pw - AlchemyScene.BTN_SIZE - 10) | 0), AlchemyScene.inputs[1].top(), Math.fround(AlchemyScene.BTN_SIZE), Math.fround(AlchemyScene.BTN_SIZE));
      } else {
        AlchemyScene.combines[i].visible_ = false;
        AlchemyScene.outputs[i].visible_ = false;
      }
      this.add$Gizmo(AlchemyScene.combines[i]);
      this.add$Gizmo(AlchemyScene.outputs[i]);
    }
    this.smokeEmitter = new Emitter()._Emitter();
    this.smokeEmitter.pos$float$float$float$float(Math.fround(AlchemyScene.outputs[0].left() + Math.fround(((AlchemyScene.BTN_SIZE - 16) | 0) / 2)), Math.fround(AlchemyScene.outputs[0].top() + Math.fround(((AlchemyScene.BTN_SIZE - 16) | 0) / 2)), 16, 16);
    this.smokeEmitter.autoKill = false;
    this.add$Gizmo(this.smokeEmitter);
    pos = (pos + 10) | 0;
    if (Camera.main.height_ >= 280) {
      AlchemyScene.centerW = ($J.d2i((insets.left_)) + $J.idiv(w, 2)) | 0;
    }
    this.bubbleEmitter.pos$float$float$float$float(0, 0, Math.fround(Math.imul(2, AlchemyScene.centerW)), Math.fround(Camera.main.height_));
    this.bubbleEmitter.autoKill = false;
    this.lowerBubbles.pos$float$float$float$float(0, Math.fround(pos), Math.fround(Math.imul(2, AlchemyScene.centerW)), Math.fround(Math.max(0, (h - pos) | 0)));
    this.lowerBubbles.pour(Speck.factory$int(Speck.BUBBLE), Math.fround(0.1));
    let energyText = Messages.get$Class$String$ObjectArr($J.cls(AlchemyScene), 'energy', []) + ' ' + Dungeon.energy;
    if (AlchemyScene.toolkit != null) {
      energyText += '+' + AlchemyScene.toolkit.availableEnergy();
    }
    this.energyLeft = PixelScene.renderTextBlock$String$int(energyText, 9);
    this.energyLeft.setPos(Math.fround(AlchemyScene.centerW - Math.fround(this.energyLeft.width() / 2)), Math.fround(Math.fround(Math.fround(insets.top_ + h) - 8) - this.energyLeft.height()));
    this.energyLeft.hardlight(4508927);
    this.add$Gizmo(this.energyLeft);
    this.energyIcon = new ItemSprite()._ItemSprite$int(AlchemyScene.toolkit != null ? ItemSpriteSheet.ARTIFACT_TOOLKIT : ItemSpriteSheet.ENERGY);
    this.energyIcon.x = Math.fround(this.energyLeft.left() - this.energyIcon.width());
    this.energyIcon.y = Math.fround(this.energyLeft.top() - Math.fround((Math.fround(this.energyIcon.height() - this.energyLeft.height())) / 2));
    PixelScene.align$Visual(this.energyIcon);
    this.add$Gizmo(this.energyIcon);
    this.energyAdd = new (AlchemyScene$6())().$o(this)._IconButton$Image(Icons.get$Icons(Icons.PLUS)).$init_anon();
    this.energyAdd.setRect(this.energyLeft.right(), Math.fround(this.energyLeft.top() - Math.fround((Math.fround(16 - this.energyLeft.height())) / 2)), 16, 16);
    PixelScene.align$Component(this.energyAdd);
    this.add$Gizmo(this.energyAdd);
    this.sparkEmitter = new Emitter()._Emitter();
    this.sparkEmitter.pos$float$float$float$float(this.energyLeft.left(), this.energyLeft.top(), this.energyLeft.width(), this.energyLeft.height());
    this.sparkEmitter.autoKill = false;
    this.add$Gizmo(this.sparkEmitter);
    let btnGuide = new (AlchemyScene$7())().$o(this)._StyledButton$Type$String(Chrome$Type.TOAST_TR, Messages.get$Class$String$ObjectArr($J.cls(AlchemyScene), 'guide', []));
    btnGuide.icon$Image(new ItemSprite()._ItemSprite$int(ItemSpriteSheet.ALCH_PAGE));
    btnGuide.setSize(Math.fround(btnGuide.reqWidth() + 4), 18);
    btnGuide.setPos(Math.fround(AlchemyScene.centerW - Math.fround(btnGuide.width() / 2)), Math.fround(Math.fround(this.energyAdd.top() - btnGuide.height()) - 2));
    PixelScene.align$Component(btnGuide);
    this.add$Gizmo(btnGuide);
    let cata = Dungeon.hero.belongings.getItem($J.cls(TrinketCatalyst));
    if (cata != null && cata.hasRolledTrinkets()) {
      this.addToFront(new TrinketCatalyst$WndTrinket()._TrinketCatalyst$WndTrinket(cata));
    }
    this.fadeIn$();
    this.saveNeeded = false;
    try {
      Dungeon.saveAll();
      Badges.saveGlobal$();
      Journal.saveGlobal$();
    } catch ($e1) {
      if ($J.isa($e1, IOException)) {
        let e = $J.exc($e1);
        Game.reportException(e);
      } else {
        throw $e1;
      }
    }
  }
  update(): void {
    super.update();
    this.water.offset(0, Math.fround(-5 * Game.elapsed));
  }
  onBackPressed(): void {
    Game.switchScene$Class($J.cls(GameScene));
  }
  filterInput<T>(itemClass: JClass<T>): ArrayList<T> {
    let filtered = new ArrayList();
    for (let i = 0; i < AlchemyScene.inputs.length; i++) {
      let item = AlchemyScene.inputs[i].item$();
      if (item != null && itemClass.isInstance(item)) {
        filtered.add(item);
      }
    }
    return filtered;
  }
  updateState(): void {
    this.repeat.enable(false);
    let ingredients = this.filterInput($J.cls(Item));
    let recipes = Recipe.findRecipes(ingredients);
    for (let i = recipes.size(); i < AlchemyScene.combines.length; i++) {
      AlchemyScene.combines[i].enable$boolean(false);
      AlchemyScene.outputs[i].item(null);
      if (i !== 0) {
        AlchemyScene.combines[i].visible_ = false;
        AlchemyScene.outputs[i].visible_ = false;
      }
    }
    this.cancel_.enable(!ingredients.isEmpty());
    if (recipes.isEmpty()) {
      AlchemyScene.combines[0].setPos(AlchemyScene.combines[0].left(), Math.fround(AlchemyScene.inputs[1].top() + 5));
      AlchemyScene.outputs[0].setPos(AlchemyScene.outputs[0].left(), AlchemyScene.inputs[1].top());
      this.energyAddBlinking = false;
      return;
    }
    let gap = Math.fround(recipes.size() === 2 ? 6 : 2);
    let height = Math.fround(AlchemyScene.inputs[2].bottom() - AlchemyScene.inputs[0].top());
    height = Math.fround(height - Math.fround(Math.imul(recipes.size(), AlchemyScene.BTN_SIZE) + Math.fround(((recipes.size() - 1) | 0) * gap)));
    let top = Math.fround(AlchemyScene.inputs[0].top() + Math.fround(height / 2));
    let promptToAddEnergy = false;
    for (let i = 0; i < recipes.size(); i++) {
      let recipe = recipes.get(i);
      let cost = recipe.cost(ingredients);
      AlchemyScene.outputs[i].visible_ = true;
      AlchemyScene.outputs[i].setRect(AlchemyScene.outputs[0].left(), top, Math.fround(AlchemyScene.BTN_SIZE), Math.fround(AlchemyScene.BTN_SIZE));
      AlchemyScene.outputs[i].item(recipe.sampleOutput(ingredients));
      top = Math.fround(top + Math.fround(AlchemyScene.BTN_SIZE + gap));
      let availableEnergy = Dungeon.energy;
      if (AlchemyScene.toolkit != null) {
        availableEnergy = (availableEnergy + AlchemyScene.toolkit.availableEnergy()) | 0;
      }
      AlchemyScene.combines[i].visible_ = true;
      AlchemyScene.combines[i].setRect(AlchemyScene.combines[0].left(), Math.fround(AlchemyScene.outputs[i].top() + 5), 30, 20);
      AlchemyScene.combines[i].enable$boolean$int(cost <= availableEnergy, cost);
      if (cost > availableEnergy && recipe instanceof TrinketCatalyst$Recipe) {
        promptToAddEnergy = true;
      }
    }
    this.energyAddBlinking = promptToAddEnergy;
    if (this.alchGuide != null) {
      this.alchGuide.updateList();
    }
  }
  combine(slot: number): void {
    let ingredients = this.filterInput($J.cls(Item));
    if (ingredients.isEmpty()) {
      return;
    }
    AlchemyScene.lastIngredients.clear();
    for (const $it2 = ingredients.iterator(); $it2.hasNext(); ) {
      let i = $it2.next();
      AlchemyScene.lastIngredients.add(i.duplicate());
    }
    let recipes = Recipe.findRecipes(ingredients);
    if (recipes.size() <= slot) {
      return;
    }
    let recipe = recipes.get(slot);
    let result = null;
    if (recipe != null) {
      let cost = recipe.cost(ingredients);
      if (AlchemyScene.toolkit != null) {
        cost = AlchemyScene.toolkit.consumeEnergy(cost);
      }
      Catalog.countUses($J.cls(EnergyCrystal), cost);
      Dungeon.energy = (Dungeon.energy - cost) | 0;
      let energyText = Messages.get$Class$String$ObjectArr($J.cls(AlchemyScene), 'energy', []) + ' ' + Dungeon.energy;
      if (AlchemyScene.toolkit != null) {
        energyText += '+' + AlchemyScene.toolkit.availableEnergy();
      }
      this.energyLeft.text$String(energyText);
      this.energyLeft.setPos(Math.fround(AlchemyScene.centerW - Math.fround(this.energyLeft.width() / 2)), this.energyLeft.top());
      this.energyIcon.x = Math.fround(this.energyLeft.left() - this.energyIcon.width());
      PixelScene.align$Visual(this.energyIcon);
      this.energyAdd.setPos(this.energyLeft.right(), this.energyAdd.top());
      PixelScene.align$Component(this.energyAdd);
      result = recipe.brew(ingredients);
    }
    if (result != null) {
      this.craftItem(ingredients, result);
    }
    let foundItems = true;
    for (const $it3 = AlchemyScene.lastIngredients.iterator(); $it3.hasNext(); ) {
      let i = $it3.next();
      let found = Dungeon.hero.belongings.getSimilar(i);
      if (found == null) {
        foundItems = false;
      }
    }
    AlchemyScene.lastRecipe = recipe;
    this.repeat.enable(foundItems);
    this.cancel_.enable(false);
    {
      for (let i = 0; i < AlchemyScene.inputs.length; i++) {
        if (AlchemyScene.inputs[i] != null && AlchemyScene.inputs[i].item$() != null) {
          this.cancel_.enable(true);
          break;
        }
      }
    }
    if (this.alchGuide != null) {
      this.alchGuide.updateList();
    }
  }
  craftItem(ingredients: ArrayList<Item>, result: Item): void {
    this.bubbleEmitter.start(Speck.factory$int(Speck.BUBBLE), Math.fround(0.01), 100);
    this.smokeEmitter.burst(Speck.factory$int(Speck.WOOL), 10);
    Sample.INSTANCE.play$Object(Assets$Sounds.PUFF);
    let resultQuantity = result.quantity$();
    if (!result.collect$()) {
      Dungeon.level.drop(result, Dungeon.hero.pos);
    }
    Statistics.itemsCrafted++;
    Badges.validateItemsCrafted();
    this.saveNeeded = false;
    try {
      Dungeon.saveAll();
      Badges.saveGlobal$();
      Journal.saveGlobal$();
    } catch ($e4) {
      if ($J.isa($e4, IOException)) {
        let e = $J.exc($e4);
        Game.reportException(e);
      } else {
        throw $e4;
      }
    }
    {
      for (let i = 0; i < AlchemyScene.inputs.length; i++) {
        if (AlchemyScene.inputs[i] != null && AlchemyScene.inputs[i].item$() != null) {
          let item = AlchemyScene.inputs[i].item$();
          if (item.quantity$() <= 0) {
            AlchemyScene.inputs[i].item$Item(null);
          } else {
            AlchemyScene.inputs[i].slot_.updateText();
          }
        }
      }
    }
    this.updateState();
    result.quantity$int(resultQuantity);
    AlchemyScene.outputs[0].item(result);
  }
  populate(toFind: ArrayList<Item>, inventory: Belongings): void {
    this.clearSlots();
    let curslot = 0;
    for (const $it5 = toFind.iterator(); $it5.hasNext(); ) {
      let finding = $it5.next();
      let needed = finding.quantity$();
      let found = inventory.getAllSimilar(finding);
      while (!found.isEmpty() && needed > 0) {
        let detached: Item;
        if (finding instanceof LiquidMetal || finding instanceof MissileWeapon) {
          detached = found.get(0).detachAll(inventory.backpack);
        } else {
          detached = found.get(0).detach(inventory.backpack);
        }
        AlchemyScene.inputs[curslot].item$Item(detached);
        curslot++;
        needed = (needed - detached.quantity$()) | 0;
        if (detached === found.get(0)) {
          found.removeAt(0);
        }
      }
    }
    this.updateState();
  }
  onPause(): void {
    if (this.saveNeeded) {
      this.saveNeeded = false;
      this.clearSlots();
      this.updateState();
      try {
        Dungeon.saveAll();
        Badges.saveGlobal$();
        Journal.saveGlobal$();
      } catch ($e6) {
        if ($J.isa($e6, IOException)) {
          let e = $J.exc($e6);
          Game.reportException(e);
        } else {
          throw $e6;
        }
      }
    }
  }
  destroy(): void {
    {
      this.clearSlots();
      for (let i = 0; i < AlchemyScene.inputs.length; i++) {
        AlchemyScene.inputs[i] = null;
      }
    }
    this.saveNeeded = false;
    try {
      Dungeon.saveAll();
      Badges.saveGlobal$();
      Journal.saveGlobal$();
    } catch ($e7) {
      if ($J.isa($e7, IOException)) {
        let e = $J.exc($e7);
        Game.reportException(e);
      } else {
        throw $e7;
      }
    }
    super.destroy();
  }
  clearSlots(): void {
    {
      for (let i = 0; i < AlchemyScene.inputs.length; i++) {
        if (AlchemyScene.inputs[i] != null && AlchemyScene.inputs[i].item$() != null) {
          let item = AlchemyScene.inputs[i].item$();
          if (!item.collect$()) {
            Dungeon.level.drop(item, Dungeon.hero.pos);
          }
          AlchemyScene.inputs[i].item$Item(null);
        }
      }
    }
    this.cancel_.enable(false);
    this.repeat.enable(AlchemyScene.lastRecipe != null);
    if (this.alchGuide != null) {
      this.alchGuide.updateList();
    }
  }
  createEnergy(): void {
    let energyText = Messages.get$Class$String$ObjectArr($J.cls(AlchemyScene), 'energy', []) + ' ' + Dungeon.energy;
    if (AlchemyScene.toolkit != null) {
      energyText += '+' + AlchemyScene.toolkit.availableEnergy();
    }
    this.energyLeft.text$String(energyText);
    this.energyLeft.setPos(Math.fround(AlchemyScene.centerW - Math.fround(this.energyLeft.width() / 2)), this.energyLeft.top());
    this.energyIcon.x = Math.fround(this.energyLeft.left() - this.energyIcon.width());
    PixelScene.align$Visual(this.energyIcon);
    this.energyAdd.setPos(this.energyLeft.right(), this.energyAdd.top());
    PixelScene.align$Component(this.energyAdd);
    this.bubbleEmitter.start(Speck.factory$int(Speck.BUBBLE), Math.fround(0.01), 100);
    this.sparkEmitter.burst(SparkParticle.FACTORY, 20);
    Sample.INSTANCE.play$Object(Assets$Sounds.LIGHTNING);
    this.saveNeeded = true;
    this.updateState();
  }
  showIdentify(item: Item): void {
    if (item.isIdentified()) {
      return;
    }
    let BG = Chrome.get(Chrome$Type.TOAST);
    let oldName = new (AlchemyScene$9())().$o(this)._IconTitle$Item(item);
    item.identify$();
    let newName = new (AlchemyScene$10())().$o(this).$c(BG)._IconTitle$Item(item);
    newName.alpha$float(Math.fround(-0.5));
    oldName.setSize(200, oldName.height());
    newName.setSize(200, newName.height());
    let w = $J.d2i(Math.ceil(Math.fround(Math.max(oldName.reqWidth(), newName.reqWidth()) + 5)));
    oldName.setSize(Math.fround(w), oldName.height());
    oldName.setPos(Math.fround(AlchemyScene.centerW - Math.fround(oldName.width() / 2)), this.energyAdd.top());
    PixelScene.align$Component(oldName);
    newName.setSize(Math.fround(w), oldName.height());
    newName.setPos(Math.fround(AlchemyScene.centerW - Math.fround(newName.width() / 2)), this.energyAdd.top());
    PixelScene.align$Component(newName);
    BG.x = Math.fround(oldName.left() - 2);
    BG.y = Math.fround(oldName.top() - 2);
    BG.size(Math.fround(oldName.width() + 4), Math.fround(oldName.height() + 4));
    this.add$Gizmo(BG);
    this.add$Gizmo(oldName);
    this.add$Gizmo(newName);
  }
  static assignToolkit(toolkit: AlchemistsToolkit): void {
    AlchemyScene.toolkit = toolkit;
  }
  static clearToolkit(): void {
    AlchemyScene.toolkit = null;
  }
  static $clinit() {
    AlchemyScene.inputs = $J.newArray(3, null);
    AlchemyScene.combines = $J.newArray(3, null);
    AlchemyScene.outputs = $J.newArray(3, null);
    AlchemyScene.lastIngredients = new ArrayList();
    AlchemyScene.lastRecipe = null;
    AlchemyScene.splitAlchGuide = false;
  }
}

export class AlchemyScene$InputButton extends Component {
  bg: NinePatch = null;
  slot_: ItemSlot = null;
  item_: Item = null;
  _AlchemyScene$InputButton(): this {
    this._Component();
    this.item_ = null;
    return this;
  }
  createChildren(): void {
    super.createChildren();
    this.bg = Chrome.get(Chrome$Type.RED_BUTTON);
    this.add$Gizmo(this.bg);
    this.slot_ = new (AlchemyScene$InputButton$1())().$o(this)._ItemSlot$();
    this.slot_.enable(true);
    this.add$Gizmo(this.slot_);
  }
  layout(): void {
    super.layout();
    this.bg.x = this.x;
    this.bg.y = this.y;
    this.bg.size(this.width_, this.height_);
    this.slot_.setRect(Math.fround(this.x + 2), Math.fround(this.y + 2), Math.fround(this.width_ - 4), Math.fround(this.height_ - 4));
  }
  item$(): Item {
    return this.item_;
  }
  item$Item(item: Item): void {
    if (item == null) {
      this.item_ = null;
      this.slot_.item$Item(new WndBag$Placeholder()._WndBag$Placeholder(ItemSpriteSheet.SOMETHING));
    } else {
      this.slot_.item$Item(this.item_ = item);
    }
  }
}

export class AlchemyScene$CombineButton extends Component {
  slot_: number = 0;
  button: RedButton = null;
  costText: RenderedTextBlock = null;
  _AlchemyScene$CombineButton(slot: number): this {
    this._Component();
    this.slot_ = slot;
    return this;
  }
  createChildren(): void {
    super.createChildren();
    this.button = new (AlchemyScene$CombineButton$1())().$o(this)._RedButton$String('');
    this.button.icon$Image(Icons.get$Icons(Icons.ARROW));
    this.add$Gizmo(this.button);
    this.costText = PixelScene.renderTextBlock$int(6);
    this.add$Gizmo(this.costText);
  }
  layout(): void {
    super.layout();
    this.button.setRect(this.x, this.y, this.width(), this.height());
    this.costText.setPos(Math.fround(this.left() + Math.fround((Math.fround(this.width() - this.costText.width())) / 2)), Math.fround(this.top() - this.costText.height()));
  }
  enable$boolean(enabled: boolean): void {
    this.enable$boolean$int(enabled, 0);
  }
  enable$boolean$int(enabled: boolean, cost: number): void {
    this.button.enable(enabled);
    if (enabled) {
      this.button.icon$().tint$float$float$float$float(1, 1, 0, 1);
      this.button.alpha$float(1);
      this.costText.hardlight(4508927);
    } else {
      this.button.icon$().color$float$float$float(0, 0, 0);
      this.button.alpha$float(Math.fround(0.6));
      this.costText.hardlight(16711680);
    }
    if (cost === 0) {
      this.costText.visible_ = false;
    } else {
      this.costText.visible_ = true;
      this.costText.text$String(Messages.get$Class$String$ObjectArr($J.cls(AlchemyScene), 'energy', []) + ' ' + cost);
    }
    this.layout();
    this.active = enabled;
  }
}

export class AlchemyScene$OutputSlot extends Component {
  bg: NinePatch = null;
  slot_: ItemSlot = null;
  _AlchemyScene$OutputSlot(): this {
    this._Component();
    return this;
  }
  createChildren(): void {
    this.bg = Chrome.get(Chrome$Type.TOAST_TR);
    this.add$Gizmo(this.bg);
    this.slot_ = new (AlchemyScene$OutputSlot$1())().$o(this)._ItemSlot$();
    this.slot_.item$Item(null);
    this.add$Gizmo(this.slot_);
  }
  layout(): void {
    super.layout();
    this.bg.x = this.x;
    this.bg.y = this.y;
    this.bg.size(this.width(), this.height());
    this.slot_.setRect(Math.fround(this.x + 2), Math.fround(this.y + 2), Math.fround(this.width() - 4), Math.fround(this.height() - 4));
  }
  item(item: Item): void {
    this.slot_.item$Item(item);
  }
}

let $AlchemyScene$8: any = null;
/** An anonymous class (AlchemyScene.java:564). */
function AlchemyScene$8(): any {
  return $AlchemyScene$8 ??= $J.local(class extends WndBag$ItemSelector {
    textPrompt(): string {
      return Messages.get$Class$String$ObjectArr($J.cls(AlchemyScene), 'select', []);
    }
    itemSelectable(item: Item): boolean {
      return Recipe.usableInRecipe(item);
    }
    onSelect(item: Item): void {
      {
        if (item != null && AlchemyScene.inputs[0] != null) {
          for (let i = 0; i < AlchemyScene.inputs.length; i++) {
            if (AlchemyScene.inputs[i].item$() == null) {
              if (item instanceof LiquidMetal || item instanceof MissileWeapon) {
                AlchemyScene.inputs[i].item$Item(item.detachAll(Dungeon.hero.belongings.backpack));
              } else {
                AlchemyScene.inputs[i].item$Item(item.detach(Dungeon.hero.belongings.backpack));
              }
              break;
            }
          }
          this.$outer.updateState();
        }
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.AlchemyScene$8', []);
}

let $AlchemyScene$1: any = null;
/** An anonymous class (AlchemyScene.java:131). */
function AlchemyScene$1(): any {
  return $AlchemyScene$1 ??= $J.local(class extends SkinnedBlock {
    script(): NoosaScript {
      return NoosaScriptNoLighting.get();
    }
    draw(): void {
      Blending.disable();
      super.draw();
      Blending.enable();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.AlchemyScene$1', []);
}

let $AlchemyScene$2: any = null;
/** An anonymous class (AlchemyScene.java:159). */
function AlchemyScene$2(): any {
  return $AlchemyScene$2 ??= $J.local(class extends ExitButton {
    onClick(): void {
      Game.switchScene$Class($J.cls(GameScene));
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.AlchemyScene$2', []);
}

let $AlchemyScene$3$1$1: any = null;
/** An anonymous class (AlchemyScene.java:302). */
function AlchemyScene$3$1$1(): any {
  return $AlchemyScene$3$1$1 ??= $J.local(class extends RadialMenu {
    onSelect(idx: number, alt: boolean): void {
      super.onSelect(idx, alt);
      let item = this.$cv_items.get(idx);
      {
        if (item != null && AlchemyScene.inputs[0] != null) {
          for (let i = 0; i < AlchemyScene.inputs.length; i++) {
            if (AlchemyScene.inputs[i].item$() == null) {
              if (item instanceof LiquidMetal || item instanceof MissileWeapon) {
                AlchemyScene.inputs[i].item$Item(item.detachAll(Dungeon.hero.belongings.backpack));
              } else {
                AlchemyScene.inputs[i].item$Item(item.detach(Dungeon.hero.belongings.backpack));
              }
              break;
            }
          }
          this.$outer.$outer.$outer.updateState();
        }
      }
    }
    $c($items): this {
      this.$cv_items = $items;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.AlchemyScene$3$1$1', []);
}

let $AlchemyScene$3$1: any = null;
/** An anonymous class (AlchemyScene.java:269). */
function AlchemyScene$3$1(): any {
  return $AlchemyScene$3$1 ??= $J.local(class extends RadialMenu {
    onSelect(idx: number, alt: boolean): void {
      super.onSelect(idx, alt);
      let bag = this.$cv_bags.get(idx);
      let items = bag.items_.clone();
      for (const $it0 = bag.items_.iterator(); $it0.hasNext(); ) {
        let i = $it0.next();
        if (Dungeon.hero.belongings.lostInventory$() && !i.keptThroughLostInventory()) {
          items.remove(i);
        }
        if (!Recipe.usableInRecipe(i)) {
          items.remove(i);
        }
      }
      if (items.size() === 0) {
        Game.scene().addToFront(new WndMessage()._WndMessage(Messages.get$Class$String$ObjectArr($J.cls(AlchemyScene), 'no_items', [])));
        return;
      }
      let itemNames = $J.newArray(items.size(), null);
      let itemIcons = $J.newArray(items.size(), null);
      for (let i = 0; i < items.size(); i++) {
        itemNames[i] = Messages.titleCase(items.get(i).name());
        itemIcons[i] = new ItemSprite()._ItemSprite$Item(items.get(i));
      }
      let info = '';
      if (ControllerHandler.controllerActive) {
        info += KeyBindings.getKeyName(KeyBindings.getFirstKeyForAction(GameAction.LEFT_CLICK, true)) + ': ' + Messages.get$Class$String$ObjectArr($J.cls(Toolbar), 'item_select', []) + '\n';
        info += KeyBindings.getKeyName(KeyBindings.getFirstKeyForAction(GameAction.BACK, true)) + ': ' + Messages.get$Class$String$ObjectArr($J.cls(Toolbar), 'item_cancel', []);
      } else {
        info += Messages.get$Class$String$ObjectArr($J.cls(WndKeyBindings), SPDAction.LEFT_CLICK.name(), []) + ': ' + Messages.get$Class$String$ObjectArr($J.cls(Toolbar), 'item_select', []) + '\n';
        info += KeyBindings.getKeyName(KeyBindings.getFirstKeyForAction(GameAction.BACK, false)) + ': ' + Messages.get$Class$String$ObjectArr($J.cls(Toolbar), 'item_cancel', []);
      }
      Game.scene().addToFront(new (AlchemyScene$3$1$1())().$o(this).$c(items)._RadialMenu(Messages.get$Class$String$ObjectArr($J.cls(Toolbar), 'item_prompt', []), info, itemNames, itemIcons));
    }
    $c($bags): this {
      this.$cv_bags = $bags;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.AlchemyScene$3$1', []);
}

let $AlchemyScene$3: any = null;
/** An anonymous class (AlchemyScene.java:248). */
function AlchemyScene$3(): any {
  return $AlchemyScene$3 ??= $J.local(class extends Button {
    onClick(): void {
      if (Dungeon.hero != null) {
        let bags = Dungeon.hero.belongings.getBags();
        let names = $J.newArray(bags.size(), null);
        let images = $J.newArray(bags.size(), null);
        for (let i = 0; i < bags.size(); i++) {
          names[i] = Messages.titleCase(bags.get(i).name());
          images[i] = new ItemSprite()._ItemSprite$Item(bags.get(i));
        }
        let info = '';
        if (ControllerHandler.controllerActive) {
          info += KeyBindings.getKeyName(KeyBindings.getFirstKeyForAction(GameAction.LEFT_CLICK, true)) + ': ' + Messages.get$Class$String$ObjectArr($J.cls(Toolbar), 'container_select', []) + '\n';
          info += KeyBindings.getKeyName(KeyBindings.getFirstKeyForAction(GameAction.BACK, true)) + ': ' + Messages.get$Class$String$ObjectArr($J.cls(Toolbar), 'container_cancel', []);
        } else {
          info += Messages.get$Class$String$ObjectArr($J.cls(WndKeyBindings), SPDAction.LEFT_CLICK.name(), []) + ': ' + Messages.get$Class$String$ObjectArr($J.cls(Toolbar), 'container_select', []) + '\n';
          info += KeyBindings.getKeyName(KeyBindings.getFirstKeyForAction(GameAction.BACK, false)) + ': ' + Messages.get$Class$String$ObjectArr($J.cls(Toolbar), 'container_cancel', []);
        }
        Game.scene().addToFront(new (AlchemyScene$3$1())().$o(this).$c(bags)._RadialMenu(Messages.get$Class$String$ObjectArr($J.cls(Toolbar), 'container_prompt', []), info, names, images));
      }
    }
    keyAction(): GameAction {
      return SPDAction.INVENTORY_SELECTOR;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.AlchemyScene$3', []);
}

let $AlchemyScene$4: any = null;
/** An anonymous class (AlchemyScene.java:337). */
function AlchemyScene$4(): any {
  return $AlchemyScene$4 ??= $J.local(class extends IconButton {
    onClick(): void {
      super.onClick();
      this.$outer.clearSlots();
      this.$outer.updateState();
    }
    keyAction(): GameAction {
      return SPDAction.BACK;
    }
    hoverText(): string {
      return Messages.get$Class$String$ObjectArr($J.cls(AlchemyScene), 'cancel', []);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.AlchemyScene$4', []);
}

let $AlchemyScene$5: any = null;
/** An anonymous class (AlchemyScene.java:359). */
function AlchemyScene$5(): any {
  return $AlchemyScene$5 ??= $J.local(class extends IconButton {
    onClick(): void {
      super.onClick();
      if (AlchemyScene.lastRecipe != null) {
        this.$outer.populate(AlchemyScene.lastIngredients, Dungeon.hero.belongings);
      }
    }
    keyAction(): GameAction {
      return SPDAction.TAG_RESUME;
    }
    hoverText(): string {
      return Messages.get$Class$String$ObjectArr($J.cls(AlchemyScene), 'repeat', []);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.AlchemyScene$5', []);
}

let $AlchemyScene$6: any = null;
/** An anonymous class (AlchemyScene.java:448). */
function AlchemyScene$6(): any {
  return $AlchemyScene$6 ??= $J.local(class extends IconButton {
    time: number = 0;
    $init_anon() {
      this.time = 0;
      return this;
    }
    update(): void {
      super.update();
      if (this.$outer.energyAddBlinking) {
        this.icon_.brightness(Math.fround(0.5 + Math.fround(Math.abs(Math.cos(Math.fround(StatusPane.FLASH_RATE * (this.time = Math.fround(this.time + Game.elapsed))))))));
      } else {
        if (this.time > Math.fround(0)) {
          this.icon_.resetColor();
        }
        this.time = 0;
      }
    }
    onClick(): void {
      WndEnergizeItem.openItemSelector();
    }
    keyAction(): GameAction {
      return SPDAction.TAG_ACTION;
    }
    hoverText(): string {
      return Messages.get$Class$String$ObjectArr($J.cls(AlchemyScene), 'energize', []);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.AlchemyScene$6', []);
}

let $AlchemyScene$7$1: any = null;
/** An anonymous class (AlchemyScene.java:499). */
function AlchemyScene$7$1(): any {
  return $AlchemyScene$7$1 ??= $J.local(class extends Window {
    $init_anon() {
      let t = new WndJournal$AlchemyTab()._WndJournal$AlchemyTab();
      let w: number;
      let h: number;
      if (PixelScene.landscape()) {
        w = WndJournal.WIDTH_L;
        h = (WndJournal.HEIGHT_L + 8) | 0;
      } else {
        w = WndJournal.WIDTH_P;
        h = (WndJournal.HEIGHT_P + 10) | 0;
      }
      this.resize(w, h);
      this.add$Gizmo(t);
      t.setRect(0, 0, Math.fround(w), Math.fround(h));
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.AlchemyScene$7$1', []);
}

let $AlchemyScene$7: any = null;
/** An anonymous class (AlchemyScene.java:489). */
function AlchemyScene$7(): any {
  return $AlchemyScene$7 ??= $J.local(class extends StyledButton {
    onClick(): void {
      super.onClick();
      if (Camera.main.width_ >= 300 && Math.fround(Camera.main.height_) >= PixelScene.MIN_HEIGHT_FULL) {
        AlchemyScene.splitAlchGuide = !AlchemyScene.splitAlchGuide;
        ShatteredPixelDungeon.seamlessResetScene$();
      } else {
        this.$outer.clearSlots();
        this.$outer.updateState();
        this.$outer.addToFront(new (AlchemyScene$7$1())().$o(this)._Window$().$init_anon());
      }
    }
    keyAction(): GameAction {
      return SPDAction.JOURNAL;
    }
    hoverText(): string {
      return Messages.titleCase(Document.ALCHEMY_GUIDE.title());
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.AlchemyScene$7', []);
}

let $AlchemyScene$9: any = null;
/** An anonymous class (AlchemyScene.java:909). */
function AlchemyScene$9(): any {
  return $AlchemyScene$9 ??= $J.local(class extends IconTitle {
    update(): void {
      super.update();
      this.alpha$float(Math.fround(this.alpha$() - Game.elapsed));
      if (this.alpha$() <= Math.fround(0)) {
        this.killAndErase();
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.AlchemyScene$9', []);
}

let $AlchemyScene$10: any = null;
/** An anonymous class (AlchemyScene.java:920). */
function AlchemyScene$10(): any {
  return $AlchemyScene$10 ??= $J.local(class extends IconTitle {
    fading: boolean = false;
    update(): void {
      super.update();
      if (!this.fading) {
        this.alpha$float(Math.fround(this.alpha$() + Game.elapsed));
        if (this.alpha$() >= Math.fround(1)) {
          this.fading = true;
        }
      } else {
        this.alpha$float(Math.fround(this.alpha$() - Game.elapsed));
        this.$cv_BG.alpha$float(this.alpha$());
        if (this.alpha$() <= Math.fround(0)) {
          this.killAndErase();
          this.$cv_BG.killAndErase();
        }
      }
    }
    $c($BG): this {
      this.$cv_BG = $BG;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.AlchemyScene$10', []);
}

let $AlchemyScene$InputButton$1: any = null;
/** An anonymous class (AlchemyScene.java:987). */
function AlchemyScene$InputButton$1(): any {
  return $AlchemyScene$InputButton$1 ??= $J.local(class extends ItemSlot {
    onPointerDown(): void {
      this.$outer.bg.brightness(Math.fround(1.2));
      Sample.INSTANCE.play$Object(Assets$Sounds.CLICK);
    }
    onPointerUp(): void {
      this.$outer.bg.resetColor();
    }
    onClick(): void {
      super.onClick();
      let item = this.$outer.item_;
      if (item != null) {
        if (!item.collect$()) {
          Dungeon.level.drop(item, Dungeon.hero.pos);
        }
        this.$outer.item$Item(null);
        this.$outer.$outer.updateState();
      }
      this.$outer.$outer.addToFront(WndBag.getBag(this.$outer.$outer.itemSelector));
    }
    onLongClick(): boolean {
      let item = this.$outer.item_;
      if (item != null) {
        this.$outer.$outer.addToFront(new WndInfoItem()._WndInfoItem$Item(item));
        return true;
      }
      return false;
    }
    keyAction(): GameAction {
      for (let i of AlchemyScene.inputs) {
        if (i.item_ == null || i.item_ instanceof WndBag$Placeholder) {
          if (i === this.$outer) {
            return SPDAction.INVENTORY;
          } else {
            return super.keyAction();
          }
        }
      }
      return super.keyAction();
    }
    hoverText(): string {
      if (this.item_ == null || this.item_ instanceof WndBag$Placeholder) {
        return Messages.get$Class$String$ObjectArr($J.cls(AlchemyScene), 'add', []);
      }
      return super.hoverText();
    }
    secondaryTooltipAction(): GameAction {
      return SPDAction.INVENTORY_SELECTOR;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.AlchemyScene$InputButton$1', []);
}

let $AlchemyScene$CombineButton$1: any = null;
/** An anonymous class (AlchemyScene.java:1095). */
function AlchemyScene$CombineButton$1(): any {
  return $AlchemyScene$CombineButton$1 ??= $J.local(class extends RedButton {
    onClick(): void {
      super.onClick();
      this.$outer.$outer.combine(this.$outer.slot_);
    }
    hoverText(): string {
      return Messages.get$Class$String$ObjectArr($J.cls(AlchemyScene), 'craft', []);
    }
    keyAction(): GameAction {
      if (this.$outer.slot_ === 0 && !AlchemyScene.combines[1].active && !AlchemyScene.combines[2].active) {
        return SPDAction.TAG_LOOT;
      }
      return super.keyAction();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.AlchemyScene$CombineButton$1', []);
}

let $AlchemyScene$OutputSlot$1: any = null;
/** An anonymous class (AlchemyScene.java:1174). */
function AlchemyScene$OutputSlot$1(): any {
  return $AlchemyScene$OutputSlot$1 ??= $J.local(class extends ItemSlot {
    onClick(): void {
      super.onClick();
      if (this.visible_ && this.item_ != null && this.item_.trueName() != null) {
        this.$outer.$outer.addToFront(new WndInfoItem()._WndInfoItem$Item(this.item_));
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.AlchemyScene$OutputSlot$1', []);
}

$J.define(AlchemyScene, 'com.shatteredpixel.shatteredpixeldungeon.scenes.AlchemyScene', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene', ctors: { '': '_AlchemyScene' }, clinit: true, lazy: ['inputs', 'combines', 'outputs', 'lastIngredients', 'lastRecipe', 'splitAlchGuide', 'centerW', 'toolkit'] });
$J.define(AlchemyScene$InputButton, 'com.shatteredpixel.shatteredpixeldungeon.scenes.AlchemyScene$InputButton', { kind: 'class', sup: 'com.watabou.noosa.ui.Component', ctors: { '': '_AlchemyScene$InputButton' }, meths: { 'item(com.shatteredpixel.shatteredpixeldungeon.items.Item)': 'item$Item', 'item()': 'item$' }, inner: true });
$J.define(AlchemyScene$CombineButton, 'com.shatteredpixel.shatteredpixeldungeon.scenes.AlchemyScene$CombineButton', { kind: 'class', sup: 'com.watabou.noosa.ui.Component', ctors: { 'int': '_AlchemyScene$CombineButton' }, meths: { 'enable(boolean,int)': 'enable$boolean$int', 'enable(boolean)': 'enable$boolean' }, inner: true });
$J.define(AlchemyScene$OutputSlot, 'com.shatteredpixel.shatteredpixeldungeon.scenes.AlchemyScene$OutputSlot', { kind: 'class', sup: 'com.watabou.noosa.ui.Component', ctors: { '': '_AlchemyScene$OutputSlot' }, inner: true });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Chrome = $J.load('com.shatteredpixel.shatteredpixeldungeon.Chrome');
  Chrome$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.Chrome$Type');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  SPDAction = $J.load('com.shatteredpixel.shatteredpixeldungeon.SPDAction');
  ShatteredPixelDungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ShatteredPixelDungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  SparkParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.SparkParticle');
  EnergyCrystal = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.EnergyCrystal');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  LiquidMetal = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.LiquidMetal');
  Recipe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Recipe');
  TrinketCatalyst = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.TrinketCatalyst');
  TrinketCatalyst$Recipe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.TrinketCatalyst$Recipe');
  TrinketCatalyst$WndTrinket = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.TrinketCatalyst$WndTrinket');
  MissileWeapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.MissileWeapon');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  Document = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Document');
  Journal = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Journal');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ItemSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  Button = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Button');
  ExitButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.ExitButton');
  IconButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.IconButton');
  Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Icons');
  ItemSlot = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.ItemSlot');
  RadialMenu = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.RadialMenu');
  RedButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.RedButton');
  StatusPane = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.StatusPane');
  StyledButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.StyledButton');
  Toolbar = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Toolbar');
  Window = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Window');
  IconTitle = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.IconTitle');
  WndBag = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndBag');
  WndBag$ItemSelector = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndBag$ItemSelector');
  WndBag$Placeholder = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndBag$Placeholder');
  WndEnergizeItem = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndEnergizeItem');
  WndInfoItem = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndInfoItem');
  WndJournal = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndJournal');
  WndJournal$AlchemyTab = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndJournal$AlchemyTab');
  WndKeyBindings = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndKeyBindings');
  WndMessage = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndMessage');
  TextureCache = $J.load('com.watabou.gltextures.TextureCache');
  Blending = $J.load('com.watabou.glwrap.Blending');
  ControllerHandler = $J.load('com.watabou.input.ControllerHandler');
  GameAction = $J.load('com.watabou.input.GameAction');
  KeyBindings = $J.load('com.watabou.input.KeyBindings');
  Camera = $J.load('com.watabou.noosa.Camera');
  Game = $J.load('com.watabou.noosa.Game');
  Image = $J.load('com.watabou.noosa.Image');
  NoosaScriptNoLighting = $J.load('com.watabou.noosa.NoosaScriptNoLighting');
  SkinnedBlock = $J.load('com.watabou.noosa.SkinnedBlock');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  Emitter = $J.load('com.watabou.noosa.particles.Emitter');
});
