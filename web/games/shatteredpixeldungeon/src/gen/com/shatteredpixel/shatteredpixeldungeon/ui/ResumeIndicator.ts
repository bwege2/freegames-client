// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/ui/ResumeIndicator.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../jre/index.ts';
import { Tag } from './Tag.ts';

let Dungeon, SPDAction, Messages, PixelScene, Icons, WndKeyBindings;

export class ResumeIndicator extends Tag {
  icon_: Image = null;
  _ResumeIndicator(): this {
    this._Tag(10725013);
    this.setSize(Math.fround(Tag.SIZE), Math.fround(Tag.SIZE));
    this.visible_ = false;
    return this;
  }
  keyAction(): GameAction {
    return SPDAction.TAG_RESUME;
  }
  createChildren(): void {
    super.createChildren();
    this.icon_ = Icons.get$Icons(Icons.ARROW);
    this.add$Gizmo(this.icon_);
  }
  layout(): void {
    super.layout();
    if (!this.flipped) {
      this.icon_.x = Math.fround(Math.fround(this.x + Math.fround((Math.fround(Tag.SIZE - this.icon_.width())) / 2)) + 1);
    } else {
      this.icon_.x = Math.fround(Math.fround(Math.fround(this.x + this.width_) - Math.fround((Math.fround(Tag.SIZE + this.icon_.width())) / 2)) - 1);
    }
    this.icon_.y = Math.fround(this.y + Math.fround((Math.fround(this.height_ - this.icon_.height_)) / 2));
    PixelScene.align$Visual(this.icon_);
  }
  onClick(): void {
    super.onClick();
    if (Dungeon.hero.ready_) {
      Dungeon.hero.resume();
    }
  }
  hoverText(): string {
    return Messages.titleCase(Messages.get$Class$String$ObjectArr($J.cls(WndKeyBindings), 'tag_resume', []));
  }
  update(): void {
    if (!Dungeon.hero.isAlive()) {
      this.visible_ = false;
    } else if (this.visible_ !== (Dungeon.hero.lastAction != null)) {
      this.visible_ = Dungeon.hero.lastAction != null;
      if (this.visible_) {
        this.flash();
      }
    }
    super.update();
  }
}

$J.define(ResumeIndicator, 'com.shatteredpixel.shatteredpixeldungeon.ui.ResumeIndicator', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.Tag', ctors: { '': '_ResumeIndicator' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  SPDAction = $J.load('com.shatteredpixel.shatteredpixeldungeon.SPDAction');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Icons');
  WndKeyBindings = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndKeyBindings');
});
