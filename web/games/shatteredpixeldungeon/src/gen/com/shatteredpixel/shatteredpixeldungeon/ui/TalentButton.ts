// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/ui/TalentButton.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, JEnum, LinkedHashMap } from '../../../../../jre/index.ts';
import { Button } from './Button.ts';

let Assets$Interfaces, Assets$Sounds, Dungeon, Statistics, Speck, ScrollOfMetamorphosis, ScrollOfMetamorphosis$WndMetamorphChoose, ScrollOfMetamorphosis$WndMetamorphReplace, Messages, GameScene, PixelScene, TalentIcon, WndInfoTalent, WndInfoTalent$TalentButtonCallback, ColorBlock, Game, Image, PointerArea, Sample, Emitter;

export class TalentButton extends Button {
  static readonly WIDTH: number = 20;
  static readonly HEIGHT: number = 26;
  tier_: number = 0;
  talent: Talent = null;
  pointsInTalent_: number = 0;
  mode: TalentButton$Mode = null;
  icon_: TalentIcon = null;
  bg: Image = null;
  fill_: ColorBlock = null;
  _TalentButton(tier: number, talent: Talent, points: number, mode: TalentButton$Mode): this {
    this._Button();
    this.hotArea.blockLevel = PointerArea.NEVER_BLOCK;
    this.tier_ = tier;
    this.talent = talent;
    this.pointsInTalent_ = points;
    this.mode = mode;
    this.bg.frame$int$int$int$int(Math.imul(20, ((talent.maxPoints() - 1) | 0)), 0, TalentButton.WIDTH, TalentButton.HEIGHT);
    this.icon_ = new TalentIcon()._TalentIcon$Talent(talent);
    this.add$Gizmo(this.icon_);
    return this;
  }
  createChildren(): void {
    super.createChildren();
    this.fill_ = new ColorBlock()._ColorBlock(0, 4, -188);
    this.add$Gizmo(this.fill_);
    this.bg = new Image()._Image$Object(Assets$Interfaces.TALENT_BUTTON);
    this.add$Gizmo(this.bg);
  }
  layout(): void {
    this.width_ = Math.fround(TalentButton.WIDTH);
    this.height_ = Math.fround(TalentButton.HEIGHT);
    super.layout();
    this.fill_.x = Math.fround(this.x + 2);
    this.fill_.y = Math.fround(Math.fround(this.y + TalentButton.WIDTH) - 1);
    this.fill_.size(Math.fround(Math.fround(this.pointsInTalent_ / Math.fround(this.talent.maxPoints())) * ((TalentButton.WIDTH - 4) | 0)), 5);
    this.bg.x = this.x;
    this.bg.y = this.y;
    this.icon_.x = Math.fround(this.x + 2);
    this.icon_.y = Math.fround(this.y + 2);
    PixelScene.align$Visual(this.icon_);
  }
  onClick(): void {
    super.onClick();
    let toAdd: Window;
    if (this.mode === TalentButton$Mode.UPGRADE && Dungeon.hero != null && Dungeon.hero.isAlive() && Dungeon.hero.talentPointsAvailable(this.tier_) > 0 && Dungeon.hero.pointsInTalent(this.talent) < this.talent.maxPoints()) {
      toAdd = new WndInfoTalent()._WndInfoTalent(this.talent, this.pointsInTalent_, new (TalentButton$1())().$o(this)._WndInfoTalent$TalentButtonCallback());
    } else if (this.mode === TalentButton$Mode.METAMORPH_CHOOSE && Dungeon.hero != null && Dungeon.hero.isAlive()) {
      toAdd = new WndInfoTalent()._WndInfoTalent(this.talent, this.pointsInTalent_, new (TalentButton$2())().$o(this)._WndInfoTalent$TalentButtonCallback());
    } else if (this.mode === TalentButton$Mode.METAMORPH_REPLACE && Dungeon.hero != null && Dungeon.hero.isAlive()) {
      toAdd = new WndInfoTalent()._WndInfoTalent(this.talent, this.pointsInTalent_, new (TalentButton$3())().$o(this)._WndInfoTalent$TalentButtonCallback());
    } else {
      toAdd = new WndInfoTalent()._WndInfoTalent(this.talent, this.pointsInTalent_, null);
    }
    if (Game.scene() instanceof GameScene) {
      GameScene.show(toAdd);
    } else {
      Game.scene().addToFront(toAdd);
    }
  }
  onPointerDown(): void {
    this.icon_.brightness(1.5);
    this.bg.brightness(1.5);
    Sample.INSTANCE.play$Object(Assets$Sounds.CLICK);
  }
  onPointerUp(): void {
    this.icon_.resetColor();
    this.bg.resetColor();
  }
  hoverText(): string {
    return Messages.titleCase(this.talent.title());
  }
  enable(value: boolean): void {
    this.active = value;
    this.icon_.alpha$float(value ? 1 : Math.fround(0.3));
    this.bg.alpha$float(value ? 1 : Math.fround(0.3));
  }
  upgradeTalent(): void {
    if (Dungeon.hero.talentPointsAvailable(this.tier_) > 0 && this.parent != null) {
      Dungeon.hero.upgradeTalent(this.talent);
      let oldWidth = this.fill_.width();
      this.pointsInTalent_++;
      this.layout();
      Sample.INSTANCE.play$Object$float$float(Assets$Sounds.LEVELUP, Math.fround(0.7), Math.fround(1.2));
      let emitter = this.parent.recycle($J.cls(Emitter));
      emitter.revive();
      emitter.pos$float$float(Math.fround(this.fill_.x + Math.fround((Math.fround(this.fill_.width() + oldWidth)) / 2)), Math.fround(this.fill_.y + Math.fround(this.fill_.height() / 2)));
      emitter.burst(Speck.factory$int(Speck.STAR), 12);
    }
  }
}

export class TalentButton$Mode extends JEnum {
  static INFO: TalentButton$Mode = null;
  static UPGRADE: TalentButton$Mode = null;
  static METAMORPH_CHOOSE: TalentButton$Mode = null;
  static METAMORPH_REPLACE: TalentButton$Mode = null;
  static $VALUES: TalentButton$Mode[] = null;
  _TalentButton$Mode($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): TalentButton$Mode[] { return TalentButton$Mode.$VALUES.slice(); }
  static valueOf(name: string): TalentButton$Mode { return $J.enumValueOf(TalentButton$Mode, name); }
  static $clinit() {
    TalentButton$Mode.INFO = new TalentButton$Mode()._TalentButton$Mode('INFO', 0);
    TalentButton$Mode.UPGRADE = new TalentButton$Mode()._TalentButton$Mode('UPGRADE', 1);
    TalentButton$Mode.METAMORPH_CHOOSE = new TalentButton$Mode()._TalentButton$Mode('METAMORPH_CHOOSE', 2);
    TalentButton$Mode.METAMORPH_REPLACE = new TalentButton$Mode()._TalentButton$Mode('METAMORPH_REPLACE', 3);
    TalentButton$Mode.$VALUES = [TalentButton$Mode.INFO, TalentButton$Mode.UPGRADE, TalentButton$Mode.METAMORPH_CHOOSE, TalentButton$Mode.METAMORPH_REPLACE];
  }
}

let $TalentButton$1: any = null;
/** An anonymous class (TalentButton.java:120). */
function TalentButton$1(): any {
  return $TalentButton$1 ??= $J.local(class extends WndInfoTalent$TalentButtonCallback {
    prompt(): string {
      return Messages.titleCase(Messages.get$Class$String$ObjectArr($J.cls(WndInfoTalent), 'upgrade', []));
    }
    call(): void {
      this.$outer.upgradeTalent();
      Statistics.qualifiedForRandomVictoryBadge = false;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.ui.TalentButton$1', []);
}

let $TalentButton$2: any = null;
/** An anonymous class (TalentButton.java:134). */
function TalentButton$2(): any {
  return $TalentButton$2 ??= $J.local(class extends WndInfoTalent$TalentButtonCallback {
    prompt(): string {
      return Messages.titleCase(Messages.get$Class$String$ObjectArr($J.cls(ScrollOfMetamorphosis), 'metamorphose_talent', []));
    }
    metamorphDesc(): boolean {
      return true;
    }
    call(): void {
      if (ScrollOfMetamorphosis$WndMetamorphChoose.INSTANCE != null) {
        ScrollOfMetamorphosis$WndMetamorphChoose.INSTANCE.hide();
      }
      GameScene.show(new ScrollOfMetamorphosis$WndMetamorphReplace()._ScrollOfMetamorphosis$WndMetamorphReplace$Talent$int(this.$outer.talent, this.$outer.tier_));
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.ui.TalentButton$2', []);
}

let $TalentButton$3: any = null;
/** An anonymous class (TalentButton.java:155). */
function TalentButton$3(): any {
  return $TalentButton$3 ??= $J.local(class extends WndInfoTalent$TalentButtonCallback {
    prompt(): string {
      return Messages.titleCase(Messages.get$Class$String$ObjectArr($J.cls(ScrollOfMetamorphosis), 'metamorphose_talent', []));
    }
    metamorphDesc(): boolean {
      return true;
    }
    call(): void {
      let replacing = ScrollOfMetamorphosis$WndMetamorphReplace.INSTANCE.replacing;
      for (const $it0 = Dungeon.hero.talents_.iterator(); $it0.hasNext(); ) {
        let tier = $it0.next();
        if (tier.containsKey(replacing)) {
          let newTier = new LinkedHashMap();
          for (const $it1 = tier.keySet().iterator(); $it1.hasNext(); ) {
            let t = $it1.next();
            if (t === replacing) {
              newTier.put(this.$outer.talent, tier.get(replacing));
              if (!Dungeon.hero.metamorphedTalents.containsValue(replacing)) {
                Dungeon.hero.metamorphedTalents.put(replacing, this.$outer.talent);
              } else {
                if (Dungeon.hero.metamorphedTalents.get(this.$outer.talent) === replacing) {
                  Dungeon.hero.metamorphedTalents.remove(this.$outer.talent);
                } else {
                  for (const $it2 = Dungeon.hero.metamorphedTalents.keySet().iterator(); $it2.hasNext(); ) {
                    let t2 = $it2.next();
                    if (Dungeon.hero.metamorphedTalents.get(t2) === replacing) {
                      Dungeon.hero.metamorphedTalents.put(t2, this.$outer.talent);
                    }
                  }
                }
              }
            } else {
              newTier.put(t, tier.get(t));
            }
          }
          Dungeon.hero.talents_.set((ScrollOfMetamorphosis$WndMetamorphReplace.INSTANCE.tier_ - 1) | 0, newTier);
          break;
        }
      }
      ScrollOfMetamorphosis.onMetamorph(replacing, this.$outer.talent);
      if (ScrollOfMetamorphosis$WndMetamorphReplace.INSTANCE != null) {
        ScrollOfMetamorphosis$WndMetamorphReplace.INSTANCE.hide();
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.ui.TalentButton$3', []);
}

$J.define(TalentButton, 'com.shatteredpixel.shatteredpixeldungeon.ui.TalentButton', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.Button', ctors: { 'int,com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent,int,com.shatteredpixel.shatteredpixeldungeon.ui.TalentButton$Mode': '_TalentButton' } });
$J.define(TalentButton$Mode, 'com.shatteredpixel.shatteredpixeldungeon.ui.TalentButton$Mode', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_TalentButton$Mode' }, clinit: true, lazy: ['$VALUES', 'INFO', 'UPGRADE', 'METAMORPH_CHOOSE', 'METAMORPH_REPLACE'] });
$J.module(() => {
  Assets$Interfaces = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Interfaces');
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  ScrollOfMetamorphosis = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ScrollOfMetamorphosis');
  ScrollOfMetamorphosis$WndMetamorphChoose = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ScrollOfMetamorphosis$WndMetamorphChoose');
  ScrollOfMetamorphosis$WndMetamorphReplace = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ScrollOfMetamorphosis$WndMetamorphReplace');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  TalentIcon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.TalentIcon');
  WndInfoTalent = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndInfoTalent');
  WndInfoTalent$TalentButtonCallback = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndInfoTalent$TalentButtonCallback');
  ColorBlock = $J.load('com.watabou.noosa.ColorBlock');
  Game = $J.load('com.watabou.noosa.Game');
  Image = $J.load('com.watabou.noosa.Image');
  PointerArea = $J.load('com.watabou.noosa.PointerArea');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  Emitter = $J.load('com.watabou.noosa.particles.Emitter');
});
