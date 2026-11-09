// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/ui/TalentsPane.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { ScrollPane } from './ScrollPane.ts';
import { Component } from '../../../watabou/noosa/ui/Component.ts';

let Badges, Badges$Badge, Dungeon, Statistics, HeroSubClass, Talent, Ratmogrify, Speck, Messages, GameScene, PixelScene, IconButton, Icons, RenderedTextBlock, TalentButton, TalentButton$Mode, Window, WndOptions, ColorBlock, Game, Random;

export class TalentsPane extends ScrollPane {
  panes: ArrayList<TalentsPane$TalentTierPane> = null;
  separators: ArrayList<ColorBlock> = null;
  sep: ColorBlock = null;
  blocker: ColorBlock = null;
  blockText: RenderedTextBlock = null;
  $init_TalentsPane() {
    this.panes = new ArrayList();
    this.separators = new ArrayList();
  }
  _TalentsPane$Mode(mode: TalentButton$Mode): this {
    this._TalentsPane$Mode$ArrayList(mode, Dungeon.hero.talents_);
    return this;
  }
  _TalentsPane$Mode$ArrayList(mode: TalentButton$Mode, talents: ArrayList<LinkedHashMap<Talent, number>>): this {
    this._ScrollPane(new Component()._Component());
    this.$init_TalentsPane();
    Ratmogrify.useRatroicEnergy = Dungeon.hero != null && Dungeon.hero.armorAbility instanceof Ratmogrify;
    let tiersAvailable = 1;
    if (mode === TalentButton$Mode.INFO) {
      if (!Badges.isUnlocked(Badges$Badge.LEVEL_REACHED_1)) {
        tiersAvailable = 1;
      } else if (!Badges.isUnlocked(Badges$Badge.LEVEL_REACHED_2) || !Badges.isUnlocked(Badges$Badge.BOSS_SLAIN_2)) {
        tiersAvailable = 2;
      } else if (!Badges.isUnlocked(Badges$Badge.BOSS_SLAIN_4)) {
        tiersAvailable = 3;
      } else {
        tiersAvailable = Talent.MAX_TALENT_TIERS;
      }
    } else {
      while (tiersAvailable < Talent.MAX_TALENT_TIERS && ((Dungeon.hero.lvl + 1) | 0) >= (Talent.tierLevelThresholds[(tiersAvailable + 1) | 0])) {
        tiersAvailable++;
      }
      if (tiersAvailable > 2 && Dungeon.hero.subClass === HeroSubClass.NONE) {
        tiersAvailable = 2;
      } else if (tiersAvailable > 3 && Dungeon.hero.armorAbility == null) {
        tiersAvailable = 3;
      }
    }
    tiersAvailable = Math.min(tiersAvailable, talents.size());
    for (let i = 0; i < Math.min(tiersAvailable, talents.size()); i++) {
      if (talents.get(i).isEmpty()) {
        continue;
      }
      let pane = new TalentsPane$TalentTierPane()._TalentsPane$TalentTierPane(talents.get(i), (i + 1) | 0, mode);
      this.panes.add(pane);
      this.content_.add$Gizmo(pane);
      let sep = new ColorBlock()._ColorBlock(0, 1, -16777216);
      this.separators.add(sep);
      this.content_.add$Gizmo(sep);
    }
    this.sep = new ColorBlock()._ColorBlock(0, 1, -16777216);
    this.content_.add$Gizmo(this.sep);
    this.blocker = new ColorBlock()._ColorBlock(0, 0, -14540254);
    this.content_.add$Gizmo(this.blocker);
    if (tiersAvailable === 1) {
      this.blockText = PixelScene.renderTextBlock$String$int(Messages.get$Object$String$ObjectArr(this, 'unlock_tier2', []), 6);
      this.content_.add$Gizmo(this.blockText);
    } else if (tiersAvailable === 2) {
      this.blockText = PixelScene.renderTextBlock$String$int(Messages.get$Object$String$ObjectArr(this, 'unlock_tier3', []), 6);
      this.content_.add$Gizmo(this.blockText);
    } else if (tiersAvailable === 3) {
      this.blockText = PixelScene.renderTextBlock$String$int(Messages.get$Object$String$ObjectArr(this, 'unlock_tier4', []), 6);
      this.content_.add$Gizmo(this.blockText);
    } else {
      this.blockText = null;
    }
    for (let i = (this.panes.size() - 1) | 0; i >= 0; i--) {
      this.content_.bringToFront(this.panes.get(i));
    }
    return this;
  }
  layout(): void {
    super.layout();
    let top = 0;
    for (let i = 0; i < this.panes.size(); i++) {
      top = Math.fround(top + 2);
      this.panes.get(i).setRect(this.x, top, this.width_, 0);
      top = this.panes.get(i).bottom();
      this.separators.get(i).x = 0;
      this.separators.get(i).y = Math.fround(top + 2);
      this.separators.get(i).size(this.width_, 1);
      top = Math.fround(top + 3);
    }
    let bottom: number;
    if (this.blockText != null) {
      bottom = Math.max(this.height_, Math.fround(top + 20));
      this.blocker.x = 0;
      this.blocker.y = top;
      this.blocker.size(this.width_, Math.fround(bottom - top));
      this.blockText.maxWidth$int($J.d2i(this.width_));
      this.blockText.align(RenderedTextBlock.CENTER_ALIGN);
      this.blockText.setPos(Math.fround((Math.fround(this.width_ - this.blockText.width())) / 2), Math.fround(this.blocker.y + Math.fround((Math.fround(Math.fround(bottom - this.blocker.y) - this.blockText.height())) / 2)));
    } else {
      bottom = Math.max(this.height_, top);
      this.blocker.visible_ = false;
    }
    this.content_.setSize(this.width_, bottom);
  }
}

export class TalentsPane$TalentTierPane extends Component {
  tier_: number = 0;
  title_: RenderedTextBlock = null;
  buttons: ArrayList<TalentButton> = null;
  stars: ArrayList<Image> = null;
  random_: IconButton = null;
  _TalentsPane$TalentTierPane(talents: LinkedHashMap<Talent, number>, tier: number, mode: TalentButton$Mode): this {
    this._Component();
    this.stars = new ArrayList();
    this.tier_ = tier;
    this.title_ = PixelScene.renderTextBlock$String$int(Messages.titleCase(Messages.get$Class$String$ObjectArr($J.cls(TalentsPane), 'tier', [tier])), 9);
    this.title_.hardlight(Window.TITLE_COLOR);
    this.add$Gizmo(this.title_);
    if (mode === TalentButton$Mode.UPGRADE) {
      this.setupStars();
      if (Dungeon.hero.talentPointsAvailable(tier) > 0) {
        this.random_ = new (TalentsPane$TalentTierPane$1())().$o(this).$c(tier)._IconButton$Image(Icons.SHUFFLE.get());
        this.add$Gizmo(this.random_);
      }
    }
    this.buttons = new ArrayList();
    for (const $it0 = talents.keySet().iterator(); $it0.hasNext(); ) {
      let talent = $it0.next();
      let btn = new (TalentsPane$TalentTierPane$2())().$o(this)._TalentButton(tier, talent, talents.get(talent), mode);
      this.buttons.add(btn);
      this.add$Gizmo(btn);
    }
    return this;
  }
  setupStars(): void {
    if (!this.stars.isEmpty()) {
      for (const $it1 = this.stars.iterator(); $it1.hasNext(); ) {
        let im = $it1.next();
        im.killAndErase();
      }
      this.stars.clear();
    }
    let totStars = ((Talent.tierLevelThresholds[(this.tier_ + 1) | 0]) - Talent.tierLevelThresholds[this.tier_] + Dungeon.hero.bonusTalentPoints(this.tier_)) | 0;
    let openStars = Dungeon.hero.talentPointsAvailable(this.tier_);
    let usedStars = Dungeon.hero.talentPointsSpent(this.tier_);
    for (let i = 0; i < totStars; i++) {
      let im = new Speck()._Speck().image(Speck.STAR);
      this.stars.add(im);
      this.add$Gizmo(im);
      if (i >= openStars && i < ((openStars + usedStars) | 0)) {
        im.tint$float$float$float$float(0.75, 0.75, 0.75, Math.fround(0.9));
      } else if (i >= ((openStars + usedStars) | 0)) {
        im.tint$float$float$float$float(0, 0, 0, Math.fround(0.9));
      }
    }
    if (this.random_ != null && openStars === 0) {
      this.random_.killAndErase();
      this.random_.destroy();
      this.random_ = null;
    }
  }
  layout(): void {
    super.layout();
    let regStars = ((Talent.tierLevelThresholds[(this.tier_ + 1) | 0]) - Talent.tierLevelThresholds[this.tier_]) | 0;
    let titleWidth = this.title_.width();
    titleWidth = Math.fround(titleWidth + ((2 + Math.imul(Math.min(this.stars.size(), regStars), 6)) | 0));
    this.title_.setPos(Math.fround(this.x + Math.fround((Math.fround(this.width_ - titleWidth)) / 2)), this.y);
    let left = Math.fround(this.title_.right() + 2);
    let starTop = this.title_.top();
    if (regStars < this.stars.size()) {
      starTop = Math.fround(starTop - 2);
    }
    for (const $it2 = this.stars.iterator(); $it2.hasNext(); ) {
      let star = $it2.next();
      star.x = left;
      star.y = starTop;
      PixelScene.align$Visual(star);
      left = Math.fround(left + 6);
      regStars--;
      if (regStars === 0) {
        starTop = Math.fround(starTop + 6);
        left = Math.fround(this.title_.right() + 2);
      }
    }
    if (this.random_ != null) {
      this.random_.setRect(Math.fround(this.width_ - 16), Math.fround(this.y - 2), 16, 14);
    }
    let gap = Math.fround((Math.fround(this.width_ - Math.imul(this.buttons.size(), TalentButton.WIDTH))) / ((this.buttons.size() + 1) | 0));
    left = Math.fround(this.x + gap);
    for (const $it3 = this.buttons.iterator(); $it3.hasNext(); ) {
      let btn = $it3.next();
      btn.setPos(left, Math.fround(this.title_.bottom() + 4));
      PixelScene.align$Component(btn);
      left = Math.fround(left + Math.fround(btn.width() + gap));
    }
    this.height_ = Math.fround(this.buttons.get(0).bottom() - this.y);
  }
}

let $TalentsPane$TalentTierPane$1$1: any = null;
/** An anonymous class (TalentsPane.java:195). */
function TalentsPane$TalentTierPane$1$1(): any {
  return $TalentsPane$TalentTierPane$1$1 ??= $J.local(class extends WndOptions {
    onSelect(index: number): void {
      super.onSelect(index);
      if (this.$outer.$outer.parent == null) {
        return;
      }
      if (index === 0 || index === 1) {
        while (Dungeon.hero.talentPointsAvailable(this.$cv_tier) > 0) {
          let button = Random.element$Collection(this.$outer.$outer.buttons);
          if (Dungeon.hero.pointsInTalent(button.talent) < button.talent.maxPoints()) {
            button.upgradeTalent();
            if (index === 1) {
              break;
            }
          }
        }
        this.$outer.$outer.setupStars();
        this.$outer.$outer.layout();
      }
    }
    $c($tier): this {
      this.$cv_tier = $tier;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.ui.TalentsPane$TalentTierPane$1$1', []);
}

let $TalentsPane$TalentTierPane$1: any = null;
/** An anonymous class (TalentsPane.java:185). */
function TalentsPane$TalentTierPane$1(): any {
  return $TalentsPane$TalentTierPane$1 ??= $J.local(class extends IconButton {
    onClick(): void {
      super.onClick();
      GameScene.show(new (TalentsPane$TalentTierPane$1$1())().$o(this).$c(this.$cv_tier)._WndOptions$Image$String$String$StringArr(Icons.SHUFFLE.get(), Messages.get$Class$String$ObjectArr($J.cls(TalentsPane), 'random_title', []), Messages.get$Class$String$ObjectArr($J.cls(TalentsPane), 'random_sure', []), [Messages.get$Class$String$ObjectArr($J.cls(TalentsPane), 'random_yes', []), Messages.get$Class$String$ObjectArr($J.cls(TalentsPane), 'random_one', []), Messages.get$Class$String$ObjectArr($J.cls(TalentsPane), 'random_no', [])]));
    }
    update(): void {
      if (Dungeon.hero.lvl >= 3 && Statistics.qualifiedForRandomVictoryBadge) {
        this.icon_.tint$float$float$float$float(1, 1, 1, Math.fround(Math.abs(Math.cos(1.5 * 3.141592653589793 * Game.timeTotal) / 2)));
      }
      super.update();
    }
    $c($tier): this {
      this.$cv_tier = $tier;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.ui.TalentsPane$TalentTierPane$1', []);
}

let $TalentsPane$TalentTierPane$2: any = null;
/** An anonymous class (TalentsPane.java:234). */
function TalentsPane$TalentTierPane$2(): any {
  return $TalentsPane$TalentTierPane$2 ??= $J.local(class extends TalentButton {
    upgradeTalent(): void {
      super.upgradeTalent();
      if (this.parent != null) {
        this.$outer.setupStars();
        this.$outer.layout();
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.ui.TalentsPane$TalentTierPane$2', []);
}

$J.define(TalentsPane, 'com.shatteredpixel.shatteredpixeldungeon.ui.TalentsPane', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.ScrollPane', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.ui.TalentButton$Mode,java.util.ArrayList': '_TalentsPane$Mode$ArrayList', 'com.shatteredpixel.shatteredpixeldungeon.ui.TalentButton$Mode': '_TalentsPane$Mode' } });
$J.define(TalentsPane$TalentTierPane, 'com.shatteredpixel.shatteredpixeldungeon.ui.TalentsPane$TalentTierPane', { kind: 'class', sup: 'com.watabou.noosa.ui.Component', ctors: { 'java.util.LinkedHashMap,int,com.shatteredpixel.shatteredpixeldungeon.ui.TalentButton$Mode': '_TalentsPane$TalentTierPane' } });
$J.module(() => {
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Badges$Badge = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges$Badge');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  HeroSubClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroSubClass');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Ratmogrify = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.Ratmogrify');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  IconButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.IconButton');
  Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Icons');
  RenderedTextBlock = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.RenderedTextBlock');
  TalentButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.TalentButton');
  TalentButton$Mode = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.TalentButton$Mode');
  Window = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Window');
  WndOptions = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndOptions');
  ColorBlock = $J.load('com.watabou.noosa.ColorBlock');
  Game = $J.load('com.watabou.noosa.Game');
  Random = $J.load('com.watabou.utils.Random');
});
