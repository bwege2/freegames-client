// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/scrolls/exotic/ScrollOfMetamorphosis.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, LinkedHashMap } from '../../../../../../../jre/index.ts';
import { ExoticScroll } from './ExoticScroll.ts';
import { Window } from '../../../ui/Window.ts';

let Assets$Sounds, Dungeon, HeroClass, Talent, Speck, Transmuting, Item, InventoryScroll, Scroll, Messages, GameScene, PixelScene, ItemSprite, ItemSpriteSheet$Icons, TalentButton$Mode, TalentsPane, TalentsPane$TalentTierPane, IconTitle, WndOptions, Sample, Random;

export class ScrollOfMetamorphosis extends ExoticScroll {
  static identifiedByUse: boolean = false;
  _ScrollOfMetamorphosis(): this {
    this._ExoticScroll();
    this.icon_ = ItemSpriteSheet$Icons.SCROLL_METAMORPH;
    this.talentFactor = 2;
    return this;
  }
  doRead(): void {
    if (!this.isKnown()) {
      this.identify$();
      Item.curItem = this.detach(Item.curUser.belongings.backpack);
      ScrollOfMetamorphosis.identifiedByUse = true;
    } else {
      ScrollOfMetamorphosis.identifiedByUse = false;
    }
    GameScene.show(new ScrollOfMetamorphosis$WndMetamorphChoose()._ScrollOfMetamorphosis$WndMetamorphChoose());
  }
  static onMetamorph(oldTalent: Talent, newTalent: Talent): void {
    if (Item.curItem instanceof ScrollOfMetamorphosis) {
      (Item.curItem).readAnimation();
      Sample.INSTANCE.play$Object(Assets$Sounds.READ);
    }
    Item.curUser.sprite_.emitter().start(Speck.factory$int(Speck.CHANGE), Math.fround(0.2), 10);
    Transmuting.show$Char$Talent$Talent(Item.curUser, oldTalent, newTalent);
    if (Dungeon.hero.hasTalent(newTalent)) {
      Talent.onTalentUpgraded(Dungeon.hero, newTalent);
    }
  }
  confirmCancelation(chooseWindow: Window, byID: boolean): void {
    GameScene.show(new (ScrollOfMetamorphosis$1())().$o(this).$c(chooseWindow)._WndOptions$Image$String$String$StringArr(new ItemSprite()._ItemSprite$Item(this), Messages.titleCase(this.name()), byID ? Messages.get$Class$String$ObjectArr($J.cls(InventoryScroll), 'warning', []) : Messages.get$Class$String$ObjectArr($J.cls(ScrollOfMetamorphosis), 'cancel_warn', []), [Messages.get$Class$String$ObjectArr($J.cls(InventoryScroll), 'yes', []), Messages.get$Class$String$ObjectArr($J.cls(InventoryScroll), 'no', [])]));
  }
  static $clinit() {
    ScrollOfMetamorphosis.identifiedByUse = false;
  }
}

export class ScrollOfMetamorphosis$WndMetamorphChoose extends Window {
  static INSTANCE: ScrollOfMetamorphosis$WndMetamorphChoose = null;
  pane: TalentsPane = null;
  _ScrollOfMetamorphosis$WndMetamorphChoose(): this {
    this._Window$();
    ScrollOfMetamorphosis$WndMetamorphChoose.INSTANCE = this;
    let top = 0;
    let title = new IconTitle()._IconTitle$Item(Item.curItem);
    title.color(Window.TITLE_COLOR);
    title.setRect(0, 0, 120, 0);
    this.add$Gizmo(title);
    top = Math.fround(title.bottom() + 2);
    let text = PixelScene.renderTextBlock$String$int(Messages.get$Class$String$ObjectArr($J.cls(ScrollOfMetamorphosis), 'choose_desc', []), 6);
    text.maxWidth$int(120);
    text.setPos(0, top);
    this.add$Gizmo(text);
    top = Math.fround(text.bottom() + 2);
    let talents = new ArrayList();
    Talent.initClassTalents$HeroClass$ArrayList$LinkedHashMap(Dungeon.hero.heroClass, talents, Dungeon.hero.metamorphedTalents);
    for (const $it0 = talents.iterator(); $it0.hasNext(); ) {
      let tier = $it0.next();
      for (const $it1 = tier.keySet().iterator(); $it1.hasNext(); ) {
        let talent = $it1.next();
        tier.put(talent, Dungeon.hero.pointsInTalent(talent));
      }
    }
    this.pane = new TalentsPane()._TalentsPane$Mode$ArrayList(TalentButton$Mode.METAMORPH_CHOOSE, talents);
    this.add$Gizmo(this.pane);
    this.pane.setPos(0, top);
    this.pane.setSize(120, this.pane.content().height());
    this.resize($J.d2i(this.pane.width()), $J.d2i(this.pane.bottom()));
    this.pane.setPos(0, top);
    return this;
  }
  hide(): void {
    super.hide();
    ScrollOfMetamorphosis$WndMetamorphChoose.INSTANCE = null;
  }
  onBackPressed(): void {
    if (ScrollOfMetamorphosis.identifiedByUse) {
      (Item.curItem).confirmCancelation(this, true);
    } else {
      super.onBackPressed();
    }
  }
  offset$int$int(xOffset: number, yOffset: number): void {
    super.offset$int$int(xOffset, yOffset);
    this.pane.setPos(this.pane.left(), this.pane.top());
  }
}

export class ScrollOfMetamorphosis$WndMetamorphReplace extends Window {
  static INSTANCE: ScrollOfMetamorphosis$WndMetamorphReplace = null;
  replacing: Talent = null;
  tier_: number = 0;
  replaceOptions: LinkedHashMap<Talent, number> = null;
  _ScrollOfMetamorphosis$WndMetamorphReplace$(): this {
    this._Window$();
    if (ScrollOfMetamorphosis$WndMetamorphReplace.INSTANCE != null) {
      this.replacing = ScrollOfMetamorphosis$WndMetamorphReplace.INSTANCE.replacing;
      this.tier_ = ScrollOfMetamorphosis$WndMetamorphReplace.INSTANCE.tier_;
      this.replaceOptions = ScrollOfMetamorphosis$WndMetamorphReplace.INSTANCE.replaceOptions;
      ScrollOfMetamorphosis$WndMetamorphReplace.INSTANCE = this;
      this.setup(this.replacing, this.tier_, this.replaceOptions);
    } else {
      this.hide();
    }
    return this;
  }
  _ScrollOfMetamorphosis$WndMetamorphReplace$Talent$int(replacing: Talent, tier: number): this {
    this._Window$();
    if (!ScrollOfMetamorphosis.identifiedByUse && Item.curItem instanceof ScrollOfMetamorphosis) {
      Item.curItem.detach(Item.curUser.belongings.backpack);
    }
    ScrollOfMetamorphosis.identifiedByUse = false;
    ScrollOfMetamorphosis$WndMetamorphReplace.INSTANCE = this;
    this.replacing = replacing;
    this.tier_ = tier;
    let options = new LinkedHashMap();
    let curTalentsAtTier = Dungeon.hero.talents_.get((tier - 1) | 0).keySet();
    for (let cls of HeroClass.values()) {
      let clsTalents = new ArrayList();
      Talent.initClassTalents$HeroClass$ArrayList(cls, clsTalents);
      let clsTalentsAtTier = clsTalents.get((tier - 1) | 0).keySet();
      let replacingIsInSet = false;
      for (let talent of $J.toArrayInto(clsTalentsAtTier.toArray(), $J.newArray(0, null))) {
        if (talent === replacing) {
          replacingIsInSet = true;
          break;
        } else {
          if (curTalentsAtTier.contains(talent)) {
            clsTalentsAtTier.remove(talent);
          }
        }
      }
      if (!replacingIsInSet && !clsTalentsAtTier.isEmpty()) {
        options.put(Random.element$Collection(clsTalentsAtTier), Dungeon.hero.pointsInTalent(replacing));
      }
    }
    this.replaceOptions = options;
    this.setup(replacing, tier, options);
    return this;
  }
  setup(replacing: Talent, tier: number, replaceOptions: LinkedHashMap<Talent, number>): void {
    let top = 0;
    let title = new IconTitle()._IconTitle$Item(Item.curItem);
    title.color(Window.TITLE_COLOR);
    title.setRect(0, 0, 120, 0);
    this.add$Gizmo(title);
    top = Math.fround(title.bottom() + 2);
    let text = PixelScene.renderTextBlock$String$int(Messages.get$Class$String$ObjectArr($J.cls(ScrollOfMetamorphosis), 'replace_desc', []), 6);
    text.maxWidth$int(120);
    text.setPos(0, top);
    this.add$Gizmo(text);
    top = Math.fround(text.bottom() + 2);
    let optionsPane = new TalentsPane$TalentTierPane()._TalentsPane$TalentTierPane(replaceOptions, tier, TalentButton$Mode.METAMORPH_REPLACE);
    this.add$Gizmo(optionsPane);
    optionsPane.title_.text$String(' ');
    optionsPane.setPos(0, top);
    optionsPane.setSize(120, optionsPane.height());
    this.resize($J.d2i(optionsPane.width()), $J.d2i(optionsPane.bottom()));
    this.resize(120, $J.d2i(optionsPane.bottom()));
  }
  hide(): void {
    super.hide();
    if (ScrollOfMetamorphosis$WndMetamorphReplace.INSTANCE === this) {
      ScrollOfMetamorphosis$WndMetamorphReplace.INSTANCE = null;
    }
  }
  onBackPressed(): void {
    if (Item.curItem instanceof ScrollOfMetamorphosis) {
      (Item.curItem).confirmCancelation(this, false);
    } else {
      super.onBackPressed();
    }
  }
}

let $ScrollOfMetamorphosis$1: any = null;
/** An anonymous class (ScrollOfMetamorphosis.java:89). */
function ScrollOfMetamorphosis$1(): any {
  return $ScrollOfMetamorphosis$1 ??= $J.local(class extends WndOptions {
    onSelect(index: number): void {
      switch (index) {
        case 0:
          Item.curUser.spendAndNext(Scroll.TIME_TO_READ);
          ScrollOfMetamorphosis.identifiedByUse = false;
          this.$cv_chooseWindow.hide();
          break;
        case 1:
          break;
      }
    }
    onBackPressed(): void {
    }
    $c($chooseWindow): this {
      this.$cv_chooseWindow = $chooseWindow;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ScrollOfMetamorphosis$1', []);
}

$J.define(ScrollOfMetamorphosis, 'com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ScrollOfMetamorphosis', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ExoticScroll', ctors: { '': '_ScrollOfMetamorphosis' }, clinit: true, lazy: ['identifiedByUse'] });
$J.define(ScrollOfMetamorphosis$WndMetamorphChoose, 'com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ScrollOfMetamorphosis$WndMetamorphChoose', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.Window', ctors: { '': '_ScrollOfMetamorphosis$WndMetamorphChoose' }, meths: { 'offset(int,int)': 'offset$int$int' } });
$J.define(ScrollOfMetamorphosis$WndMetamorphReplace, 'com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ScrollOfMetamorphosis$WndMetamorphReplace', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.Window', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent,int': '_ScrollOfMetamorphosis$WndMetamorphReplace$Talent$int', '': '_ScrollOfMetamorphosis$WndMetamorphReplace$' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  HeroClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroClass');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  Transmuting = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Transmuting');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  InventoryScroll = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.InventoryScroll');
  Scroll = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.Scroll');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  ItemSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite');
  ItemSpriteSheet$Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet$Icons');
  TalentButton$Mode = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.TalentButton$Mode');
  TalentsPane = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.TalentsPane');
  TalentsPane$TalentTierPane = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.TalentsPane$TalentTierPane');
  IconTitle = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.IconTitle');
  WndOptions = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndOptions');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  Random = $J.load('com.watabou.utils.Random');
});
