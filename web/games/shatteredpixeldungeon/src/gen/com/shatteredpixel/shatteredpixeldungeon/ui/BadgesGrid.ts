// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/ui/BadgesGrid.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Component } from '../../../watabou/noosa/ui/Component.ts';
import { Button } from './Button.ts';

let Assets$Sounds, Badges, Badges$Badge, Badges$BadgeType, BadgeBanner, PixelScene, WndBadge, Game, Sample, Random;

export class BadgesGrid extends Component {
  badgeButtons: ArrayList<BadgesGrid$BadgeButton> = null;
  _BadgesGrid(global: boolean): this {
    this._Component();
    this.badgeButtons = new ArrayList();
    for (const $it0 = Badges.filterReplacedBadges$boolean(global).iterator(); $it0.hasNext(); ) {
      let badge = $it0.next();
      if (badge.type_ === Badges$BadgeType.HIDDEN) {
        continue;
      }
      let button = new BadgesGrid$BadgeButton()._BadgesGrid$BadgeButton(badge, true);
      this.add$Gizmo(button);
      this.badgeButtons.add(button);
    }
    if (global) {
      let lockedBadges = new ArrayList();
      for (let badge of Badges$Badge.values()) {
        if (badge.type_ !== Badges$BadgeType.HIDDEN && !Badges.isUnlocked(badge)) {
          lockedBadges.add(badge);
        }
      }
      Badges.filterBadgesWithoutPrerequisites(lockedBadges);
      for (const $it1 = lockedBadges.iterator(); $it1.hasNext(); ) {
        let badge = $it1.next();
        let button = new BadgesGrid$BadgeButton()._BadgesGrid$BadgeButton(badge, false);
        this.add$Gizmo(button);
        this.badgeButtons.add(button);
      }
    }
    return this;
  }
  layout(): void {
    super.layout();
    let badgeArea = Math.fround(Math.sqrt(Math.fround(Math.fround(this.width_ * this.height_) / this.badgeButtons.size())));
    let nCols = $J.roundf(Math.fround(this.width_ / badgeArea));
    let nRows = $J.d2i(Math.ceil(Math.fround(this.badgeButtons.size() / Math.fround(nCols))));
    let badgeWidth = Math.fround(this.width() / nCols);
    let badgeHeight = Math.fround(this.height() / nRows);
    for (let i = 0; i < this.badgeButtons.size(); i++) {
      let row = $J.idiv(i, nCols);
      let col = i % nCols;
      let button = this.badgeButtons.get(i);
      button.setPos(Math.fround(Math.fround(this.left() + Math.fround(col * badgeWidth)) + Math.fround((Math.fround(badgeWidth - button.width())) / 2)), Math.fround(Math.fround(this.top() + Math.fround(row * badgeHeight)) + Math.fround((Math.fround(badgeHeight - button.height())) / 2)));
      PixelScene.align$Component(button);
    }
  }
}

export class BadgesGrid$BadgeButton extends Button {
  badge: Badges$Badge = null;
  unlocked: boolean = false;
  icon_: Image = null;
  _BadgesGrid$BadgeButton(badge: Badges$Badge, unlocked: boolean): this {
    this._Button();
    this.badge = badge;
    this.unlocked = unlocked;
    this.icon_ = BadgeBanner.image(badge.image_);
    if (!unlocked) {
      this.icon_.brightness(Math.fround(0.4));
    }
    this.add$Gizmo(this.icon_);
    this.setSize(this.icon_.width(), this.icon_.height());
    return this;
  }
  layout(): void {
    super.layout();
    this.icon_.x = Math.fround(this.x + Math.fround((Math.fround(this.width_ - this.icon_.width())) / 2));
    this.icon_.y = Math.fround(this.y + Math.fround((Math.fround(this.height_ - this.icon_.height())) / 2));
  }
  update(): void {
    super.update();
    if (this.unlocked && Random.Float$() < Game.elapsed * 0.1) {
      BadgeBanner.highlight(this.icon_, this.badge.image_);
    }
  }
  onClick(): void {
    Sample.INSTANCE.play$Object$float$float$float(Assets$Sounds.CLICK, Math.fround(0.7), Math.fround(0.7), Math.fround(1.2));
    Game.scene().addToFront(new WndBadge()._WndBadge(this.badge, this.unlocked));
  }
  hoverText(): string {
    return this.badge.title();
  }
}

$J.define(BadgesGrid, 'com.shatteredpixel.shatteredpixeldungeon.ui.BadgesGrid', { kind: 'class', sup: 'com.watabou.noosa.ui.Component', ctors: { 'boolean': '_BadgesGrid' } });
$J.define(BadgesGrid$BadgeButton, 'com.shatteredpixel.shatteredpixeldungeon.ui.BadgesGrid$BadgeButton', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.Button', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.Badges$Badge,boolean': '_BadgesGrid$BadgeButton' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Badges$Badge = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges$Badge');
  Badges$BadgeType = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges$BadgeType');
  BadgeBanner = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.BadgeBanner');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  WndBadge = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndBadge');
  Game = $J.load('com.watabou.noosa.Game');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  Random = $J.load('com.watabou.utils.Random');
});
