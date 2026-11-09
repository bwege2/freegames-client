// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/journal/Guidebook.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Item } from '../Item.ts';

let Assets$Sounds, SPDAction, SPDSettings, Hero, Document, Messages, GameScene, ItemSpriteSheet, GameLog, GLog, ControllerHandler, KeyBindings, Sample;

export class Guidebook extends Item {
  _Guidebook(): this {
    this._Item();
    this.image_ = ItemSpriteSheet.MASTERY;
    return this;
  }
  doPickUp$Hero$int(hero: Hero, pos: number): boolean {
    Document.ADVENTURERS_GUIDE.findPage$String(Document.GUIDE_INTRO);
    Document.ADVENTURERS_GUIDE.findPage$String(Document.GUIDE_EXAMINING);
    Document.ADVENTURERS_GUIDE.findPage$String(Document.GUIDE_SURPRISE_ATKS);
    Document.ADVENTURERS_GUIDE.findPage$String(Document.GUIDE_IDING);
    Document.ADVENTURERS_GUIDE.findPage$String(Document.GUIDE_FOOD);
    Document.ADVENTURERS_GUIDE.findPage$String(Document.GUIDE_ALCHEMY);
    Document.ADVENTURERS_GUIDE.findPage$String(Document.GUIDE_DIEING);
    GameScene.pickUpJournal(this, pos);
    GameLog.wipe();
    GLog.i(Messages.capitalize(Messages.get$Class$String$ObjectArr($J.cls(Hero), 'you_now_have', [this.name()])), []);
    if (SPDSettings.interfaceSize$() === 0) {
      GLog.p(Messages.get$Class$String$ObjectArr($J.cls(GameScene), 'tutorial_guidebook_mobile', []), []);
    } else {
      GLog.p(Messages.get$Class$String$ObjectArr($J.cls(GameScene), 'tutorial_guidebook_desktop', [KeyBindings.getKeyName(KeyBindings.getFirstKeyForAction(SPDAction.JOURNAL, ControllerHandler.isControllerConnected()))]), []);
    }
    GameScene.flashForDocument(Document.ADVENTURERS_GUIDE, Document.GUIDE_INTRO);
    Sample.INSTANCE.play$Object(Assets$Sounds.ITEM);
    hero.spendAndNext(this.pickupDelay());
    return true;
  }
  isUpgradable(): boolean {
    return false;
  }
  isIdentified(): boolean {
    return true;
  }
}

$J.define(Guidebook, 'com.shatteredpixel.shatteredpixeldungeon.items.journal.Guidebook', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Item', ctors: { '': '_Guidebook' }, meths: { 'doPickUp(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,int)': 'doPickUp$Hero$int' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  SPDAction = $J.load('com.shatteredpixel.shatteredpixeldungeon.SPDAction');
  SPDSettings = $J.load('com.shatteredpixel.shatteredpixeldungeon.SPDSettings');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  Document = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Document');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  GameLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.GameLog');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  ControllerHandler = $J.load('com.watabou.input.ControllerHandler');
  KeyBindings = $J.load('com.watabou.input.KeyBindings');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
