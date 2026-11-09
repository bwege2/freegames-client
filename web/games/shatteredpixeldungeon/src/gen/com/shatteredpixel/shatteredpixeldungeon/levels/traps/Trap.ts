// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/traps/Trap.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../../../jre/index.ts';
import { FlavourBuff } from '../../actors/buffs/FlavourBuff.ts';

let Assets$Sounds, Dungeon, Bestiary, Messages, GameScene, WndInfoTrap, Sample;

export class Trap extends JObject {
  static readonly RED: number = 0;
  static readonly ORANGE: number = 1;
  static readonly YELLOW: number = 2;
  static readonly GREEN: number = 3;
  static readonly TEAL: number = 4;
  static readonly VIOLET: number = 5;
  static readonly WHITE: number = 6;
  static readonly GREY: number = 7;
  static readonly BLACK: number = 8;
  static readonly DOTS: number = 0;
  static readonly WAVES: number = 1;
  static readonly GRILL: number = 2;
  static readonly STARS: number = 3;
  static readonly DIAMOND: number = 4;
  static readonly CROSSHAIR: number = 5;
  static readonly LARGE_DOT: number = 6;
  color_: number = 0;
  shape: number = 0;
  pos: number = 0;
  reclaimed: boolean = false;
  visible_: boolean = false;
  active: boolean = false;
  disarmedByActivation: boolean = false;
  canBeHidden: boolean = false;
  canBeSearched: boolean = false;
  avoidsClosedSpaces: boolean = false;
  static readonly POS: string = 'pos';
  static readonly VISIBLE: string = 'visible';
  static readonly ACTIVE: string = 'active';
  _Trap(): this {
    this.reclaimed = false;
    this.active = true;
    this.disarmedByActivation = true;
    this.canBeHidden = true;
    this.canBeSearched = true;
    this.avoidsClosedSpaces = false;
    return this;
  }
  set(pos: number): Trap {
    this.pos = pos;
    return this;
  }
  reveal(): Trap {
    this.visible_ = true;
    GameScene.updateMap$int(this.pos);
    return this;
  }
  hide(): Trap {
    if (this.canBeHidden) {
      this.visible_ = false;
      GameScene.updateMap$int(this.pos);
      return this;
    } else {
      return this.reveal();
    }
  }
  trigger(): void {
    if (this.active) {
      if (Dungeon.level.heroFOV[this.pos]) {
        Sample.INSTANCE.play$Object(Assets$Sounds.TRAP);
      }
      if (this.disarmedByActivation) {
        this.disarm();
      }
      Dungeon.level.discover(this.pos);
      Bestiary.setSeen($J.getClass(this));
      Bestiary.countEncounter($J.getClass(this));
      this.activate();
    }
  }
  disarm(): void {
    this.active = false;
    Dungeon.level.disarmTrap(this.pos);
  }
  scalingDepth(): number {
    return (this.reclaimed || Dungeon.level.traps.get(this.pos) !== this) ? Dungeon.scalingDepth() : Dungeon.depth;
  }
  name(): string {
    return Messages.get$Object$String$ObjectArr(this, 'name', []);
  }
  desc(): string {
    let desc = '';
    if (!this.active) {
      desc += Messages.get$Class$String$ObjectArr($J.cls(WndInfoTrap), 'inactive', []) + '\n\n';
    }
    desc += Messages.get$Object$String$ObjectArr(this, 'desc', []);
    return desc;
  }
  restoreFromBundle(bundle: Bundle): void {
    this.pos = bundle.getInt(Trap.POS);
    this.visible_ = bundle.getBoolean(Trap.VISIBLE);
    if (bundle.contains(Trap.ACTIVE)) {
      this.active = bundle.getBoolean(Trap.ACTIVE);
    }
  }
  storeInBundle(bundle: Bundle): void {
    bundle.put$String$int(Trap.POS, this.pos);
    bundle.put$String$boolean(Trap.VISIBLE, this.visible_);
    bundle.put$String$boolean(Trap.ACTIVE, this.active);
  }
}

export class Trap$HazardAssistTracker extends FlavourBuff {
  static readonly DURATION: number = 50;
  _Trap$HazardAssistTracker(): this {
    this._FlavourBuff();
    return this;
  }
}

$J.define(Trap, 'com.shatteredpixel.shatteredpixeldungeon.levels.traps.Trap', { kind: 'class', ifaces: ['com.watabou.utils.Bundlable'], sup: 'java.lang.Object', ctors: { '': '_Trap' } });
$J.define(Trap$HazardAssistTracker, 'com.shatteredpixel.shatteredpixeldungeon.levels.traps.Trap$HazardAssistTracker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_Trap$HazardAssistTracker' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Bestiary = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Bestiary');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  WndInfoTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndInfoTrap');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
