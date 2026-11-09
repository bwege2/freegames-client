// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/ui/ActionIndicator.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, SPDAction, Messages, PixelScene, HeroIcon, BitmapText;

export class ActionIndicator extends Tag {
  primaryVis: Visual = null;
  secondVis: Visual = null;
  static action: ActionIndicator$Action = null;
  static instance: ActionIndicator = null;
  needsRefresh: boolean = false;
  _ActionIndicator(): this {
    this._Tag(0);
    this.needsRefresh = false;
    ActionIndicator.instance = this;
    this.setSize(Math.fround(Tag.SIZE), Math.fround(Tag.SIZE));
    this.visible_ = false;
    return this;
  }
  keyAction(): GameAction {
    return SPDAction.TAG_ACTION;
  }
  destroy(): void {
    super.destroy();
    ActionIndicator.instance = null;
  }
  layout(): void {
    super.layout();
    if (this.primaryVis != null) {
      if (!this.flipped) {
        this.primaryVis.x = Math.fround(Math.fround(this.x + Math.fround((Math.fround(Tag.SIZE - this.primaryVis.width())) / 2)) + 1);
      } else {
        this.primaryVis.x = Math.fround(Math.fround(Math.fround(this.x + this.width_) - Math.fround((Math.fround(Tag.SIZE + this.primaryVis.width())) / 2)) - 1);
      }
      this.primaryVis.y = Math.fround(this.y + Math.fround((Math.fround(this.height_ - this.primaryVis.height())) / 2));
      PixelScene.align$Visual(this.primaryVis);
      if (this.secondVis != null) {
        if (this.secondVis.width() > Math.fround(16)) {
          this.secondVis.x = Math.fround(this.primaryVis.center$().x - Math.fround(this.secondVis.width() / 2));
        } else {
          this.secondVis.x = Math.fround(Math.fround(this.primaryVis.center$().x + 8) - this.secondVis.width());
        }
        if (this.secondVis instanceof BitmapText) {
          this.secondVis.y = Math.fround(Math.fround(this.primaryVis.center$().y + 8) - (this.secondVis).baseLine());
        } else {
          this.secondVis.y = Math.fround(Math.fround(this.primaryVis.center$().y + 8) - this.secondVis.height());
        }
        PixelScene.align$Visual(this.secondVis);
      }
    }
  }
  update(): void {
    super.update();
    {
      if (!this.visible_ && ActionIndicator.action != null) {
        this.visible_ = true;
        this.needsRefresh = true;
        this.flash();
      } else {
        this.visible_ = ActionIndicator.action != null;
      }
      if (this.needsRefresh) {
        if (this.primaryVis != null) {
          this.primaryVis.destroy();
          this.primaryVis.killAndErase();
          this.primaryVis = null;
        }
        if (this.secondVis != null) {
          this.secondVis.destroy();
          this.secondVis.killAndErase();
          this.secondVis = null;
        }
        if (ActionIndicator.action != null) {
          this.primaryVis = ActionIndicator.action.primaryVisual();
          this.add$Gizmo(this.primaryVis);
          this.secondVis = ActionIndicator.action.secondaryVisual();
          if (this.secondVis != null) {
            this.add$Gizmo(this.secondVis);
          }
          this.setColor(ActionIndicator.action.indicatorColor());
        }
        this.layout();
        this.needsRefresh = false;
      }
      if (!Dungeon.hero.ready_) {
        if (this.primaryVis != null) {
          this.primaryVis.alpha$float(0.5);
        }
        if (this.secondVis != null) {
          this.secondVis.alpha$float(0.5);
        }
      } else {
        if (this.primaryVis != null) {
          this.primaryVis.alpha$float(1);
        }
        if (this.secondVis != null) {
          this.secondVis.alpha$float(1);
        }
      }
    }
  }
  onClick(): void {
    super.onClick();
    if (ActionIndicator.action != null && Dungeon.hero.ready_) {
      ActionIndicator.action.doAction();
    }
  }
  hoverText(): string {
    let text = (ActionIndicator.action == null ? null : ActionIndicator.action.actionName());
    if (text != null) {
      return Messages.titleCase(text);
    } else {
      return null;
    }
  }
  static setAction(action: ActionIndicator$Action): void {
    {
      ActionIndicator.action = action;
      ActionIndicator.refresh();
    }
  }
  static clearAction$(): void {
    ActionIndicator.clearAction$Action(null);
  }
  static clearAction$Action(action: ActionIndicator$Action): void {
    {
      if (action == null || ActionIndicator.action === action) {
        ActionIndicator.action = null;
      }
    }
  }
  static refresh(): void {
    {
      if (ActionIndicator.instance != null) {
        ActionIndicator.instance.needsRefresh = true;
      }
    }
  }
}

export class ActionIndicator$Action {
  actionIcon(): number {
    return HeroIcon.NONE;
  }
  primaryVisual(): Visual {
    return new HeroIcon()._HeroIcon$Action(this);
  }
  secondaryVisual(): Visual {
    return null;
  }
}

$J.define(ActionIndicator, 'com.shatteredpixel.shatteredpixeldungeon.ui.ActionIndicator', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.Tag', ctors: { '': '_ActionIndicator' }, meths: { 'clearAction(com.shatteredpixel.shatteredpixeldungeon.ui.ActionIndicator$Action)': 'clearAction$Action', 'clearAction()': 'clearAction$' } });
$J.define(ActionIndicator$Action, 'com.shatteredpixel.shatteredpixeldungeon.ui.ActionIndicator$Action', { kind: 'interface' });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  SPDAction = $J.load('com.shatteredpixel.shatteredpixeldungeon.SPDAction');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  HeroIcon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.HeroIcon');
  BitmapText = $J.load('com.watabou.noosa.BitmapText');
});
