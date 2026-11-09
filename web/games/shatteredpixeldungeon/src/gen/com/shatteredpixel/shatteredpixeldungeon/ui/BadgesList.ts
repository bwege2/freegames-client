// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/ui/BadgesList.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sounds, Badges, Badges$BadgeType, BadgeBanner, PixelScene, WndBadge, Game, Image, Sample;

export class BadgesList extends ScrollPane {
  items_: ArrayList<BadgesList$ListItem> = null;
  _BadgesList(global: boolean): this {
    this._ScrollPane(new Component()._Component());
    this.items_ = new ArrayList();
    for (const $it0 = Badges.filterReplacedBadges$boolean(global).iterator(); $it0.hasNext(); ) {
      let badge = $it0.next();
      if (badge.type_ === Badges$BadgeType.HIDDEN) {
        continue;
      }
      let item = new BadgesList$ListItem().$o(this)._BadgesList$ListItem(badge);
      this.content_.add$Gizmo(item);
      this.items_.add(item);
    }
    return this;
  }
  layout(): void {
    let pos = 0;
    let size = this.items_.size();
    for (let i = 0; i < size; i++) {
      this.items_.get(i).setRect(0, pos, this.width_, BadgesList$ListItem.HEIGHT);
      pos = Math.fround(pos + BadgesList$ListItem.HEIGHT);
    }
    this.content_.setSize(this.width_, pos);
    super.layout();
  }
  onClick(x: number, y: number): void {
    let size = this.items_.size();
    for (let i = 0; i < size; i++) {
      if (this.items_.get(i).onClick(x, y)) {
        break;
      }
    }
  }
}

export class BadgesList$ListItem extends Component {
  static readonly HEIGHT: number = 18;
  badge: Badges$Badge = null;
  icon_: Image = null;
  label: RenderedTextBlock = null;
  _BadgesList$ListItem(badge: Badges$Badge): this {
    this._Component();
    this.badge = badge;
    this.icon_.copy(BadgeBanner.image(badge.image_));
    this.label.text$String(badge.title());
    return this;
  }
  createChildren(): void {
    this.icon_ = new Image()._Image$();
    this.add$Gizmo(this.icon_);
    this.label = PixelScene.renderTextBlock$int(6);
    this.add$Gizmo(this.label);
  }
  layout(): void {
    this.icon_.x = this.x;
    this.icon_.y = Math.fround(this.y + Math.fround((Math.fround(this.height_ - this.icon_.height_)) / 2));
    PixelScene.align$Visual(this.icon_);
    this.label.setPos(Math.fround(Math.fround(this.icon_.x + this.icon_.width_) + 2), Math.fround(this.y + Math.fround((Math.fround(this.height_ - this.label.height())) / 2)));
    PixelScene.align$Component(this.label);
  }
  onClick(x: number, y: number): boolean {
    if (this.inside(x, y)) {
      Sample.INSTANCE.play$Object$float$float$float(Assets$Sounds.CLICK, Math.fround(0.7), Math.fround(0.7), Math.fround(1.2));
      Game.scene().addToFront(new WndBadge()._WndBadge(this.badge, true));
      return true;
    } else {
      return false;
    }
  }
}

$J.define(BadgesList, 'com.shatteredpixel.shatteredpixeldungeon.ui.BadgesList', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.ScrollPane', ctors: { 'boolean': '_BadgesList' } });
$J.define(BadgesList$ListItem, 'com.shatteredpixel.shatteredpixeldungeon.ui.BadgesList$ListItem', { kind: 'class', sup: 'com.watabou.noosa.ui.Component', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.Badges$Badge': '_BadgesList$ListItem' }, inner: true });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Badges$BadgeType = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges$BadgeType');
  BadgeBanner = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.BadgeBanner');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  WndBadge = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndBadge');
  Game = $J.load('com.watabou.noosa.Game');
  Image = $J.load('com.watabou.noosa.Image');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
