// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/features/Chasm.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Buff } from '../../actors/buffs/Buff.ts';

let Assets$Sounds, Badges, Dungeon, Actor, Bleeding, Cripple, Speck, ElixirOfFeatherFall$FeatherBuff, Notes, Notes$Landmark, Level, RegularLevel, WeakFloorRoom, Trap$HazardAssistTracker, Messages, GameScene, InterlevelScene, InterlevelScene$Mode, PixelScene, GLog, WndOptions, Game, Image, Sample, Random;

export class Chasm extends JObject {
  static jumpConfirmed: boolean = false;
  static heroPos: number = 0;
  _Chasm(): this {
    return this;
  }
  static heroJump(hero: Hero): void {
    Chasm.heroPos = hero.pos;
    Game.runOnRenderThread(new (Chasm$1())().$c(hero));
  }
  static heroFall(pos: number): void {
    Chasm.jumpConfirmed = false;
    Sample.INSTANCE.play$Object(Assets$Sounds.FALLING);
    Level.beforeTransition();
    if (Dungeon.hero.isAlive()) {
      Dungeon.hero.interrupt();
      InterlevelScene.mode = InterlevelScene$Mode.FALL;
      if (Dungeon.level instanceof RegularLevel && (Dungeon.level).room$int(pos) instanceof WeakFloorRoom) {
        InterlevelScene.fallIntoPit = true;
        Notes.remove$Landmark(Notes$Landmark.DISTANT_WELL);
      } else {
        InterlevelScene.fallIntoPit = false;
      }
      Game.switchScene$Class($J.cls(InterlevelScene));
    } else {
      Dungeon.hero.sprite_.visible_ = false;
    }
  }
  onDeath(): void {
    Badges.validateDeathFromFalling();
    Dungeon.fail($J.cls(Chasm));
    GLog.n(Messages.get$Class$String$ObjectArr($J.cls(Chasm), 'ondeath', []), []);
  }
  static heroLand(): void {
    let hero = Dungeon.hero;
    let b = hero.buff($J.cls(ElixirOfFeatherFall$FeatherBuff));
    if (b != null) {
      hero.sprite_.emitter().burst(Speck.factory$int(Speck.JET), 20);
      b.processFall();
      return;
    }
    PixelScene.shake(4, 1);
    Dungeon.level.occupyCell(hero);
    Buff.prolong(hero, $J.cls(Cripple), Cripple.DURATION);
    Buff.affect$Char$Class(hero, $J.cls(Bleeding)).set$float$Class(Math.fround($J.roundf(Math.fround(hero.HT / (Math.fround(6 + (Math.fround(6 * (Math.fround(hero.HP / Math.fround(hero.HT)))))))))), $J.cls(Chasm));
    hero.damage(Math.max($J.idiv(hero.HP, 2), Random.NormalIntRange($J.idiv(hero.HP, 2), $J.idiv(hero.HT, 4))), new Chasm()._Chasm());
  }
  static mobFall(mob: Mob): void {
    if (mob.isAlive()) {
      Buff.prolong(mob, $J.cls(Trap$HazardAssistTracker), Trap$HazardAssistTracker.DURATION);
      mob.die($J.cls(Chasm));
    }
    if (mob.sprite_ != null) {
      (mob.sprite_).fall();
    }
  }
  static $clinit() {
    Chasm.jumpConfirmed = false;
  }
}

export class Chasm$Falling extends Buff {
  _Chasm$Falling(): this {
    this._Buff();
    this.actPriority = Actor.VFX_PRIO;
    return this;
  }
  act(): boolean {
    Chasm.heroLand();
    this.detach();
    return true;
  }
}

let $Chasm$1$1: any = null;
/** An anonymous class (Chasm.java:67). */
function Chasm$1$1(): any {
  return $Chasm$1$1 ??= $J.local(class extends WndOptions {
    elapsed: number = 0;
    $init_anon() {
      this.elapsed = 0;
      return this;
    }
    update(): void {
      super.update();
      this.elapsed = Math.fround(this.elapsed + Game.elapsed);
    }
    hide(): void {
      if (this.elapsed > Math.fround(0.2)) {
        super.hide();
      }
    }
    onSelect(index: number): void {
      if (index === 0 && this.elapsed > Math.fround(0.2)) {
        if (Dungeon.hero.pos === Chasm.heroPos) {
          Chasm.jumpConfirmed = true;
          this.$cv_hero.resume();
        }
      }
    }
    $c($hero): this {
      this.$cv_hero = $hero;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.levels.features.Chasm$1$1', []);
}

let $Chasm$1: any = null;
/** An anonymous class (Chasm.java:59). */
function Chasm$1(): any {
  return $Chasm$1 ??= $J.local(class extends JObject {
    call(): void {
      GameScene.show(new (Chasm$1$1())().$o(this).$c(this.$cv_hero)._WndOptions$Image$String$String$StringArr(new Image()._Image$Object$int$int$int$int(Dungeon.level.tilesTex(), 176, 16, 16, 16), Messages.get$Class$String$ObjectArr($J.cls(Chasm), 'chasm', []), Messages.get$Class$String$ObjectArr($J.cls(Chasm), 'jump', []), [Messages.get$Class$String$ObjectArr($J.cls(Chasm), 'yes', []), Messages.get$Class$String$ObjectArr($J.cls(Chasm), 'no', [])]).$init_anon());
    }
    $c($hero): this {
      this.$cv_hero = $hero;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.levels.features.Chasm$1', ['com.watabou.utils.Callback']);
}

$J.define(Chasm, 'com.shatteredpixel.shatteredpixeldungeon.levels.features.Chasm', { kind: 'class', ifaces: ['com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero$Doom'], sup: 'java.lang.Object', ctors: { '': '_Chasm' }, clinit: true, lazy: ['jumpConfirmed', 'heroPos'] });
$J.define(Chasm$Falling, 'com.shatteredpixel.shatteredpixeldungeon.levels.features.Chasm$Falling', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_Chasm$Falling' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Bleeding = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Bleeding');
  Cripple = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Cripple');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  ElixirOfFeatherFall$FeatherBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.elixirs.ElixirOfFeatherFall$FeatherBuff');
  Notes = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Notes');
  Notes$Landmark = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Notes$Landmark');
  Level = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Level');
  RegularLevel = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.RegularLevel');
  WeakFloorRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.WeakFloorRoom');
  Trap$HazardAssistTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.Trap$HazardAssistTracker');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  InterlevelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.InterlevelScene');
  InterlevelScene$Mode = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.InterlevelScene$Mode');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  WndOptions = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndOptions');
  Game = $J.load('com.watabou.noosa.Game');
  Image = $J.load('com.watabou.noosa.Image');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  Random = $J.load('com.watabou.utils.Random');
});
