// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Preparation.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, Arrays, Collections, JEnum } from '../../../../../../jre/index.ts';
import { Buff } from './Buff.ts';

let Assets$Sounds, Dungeon, Actor, Char$Property, Buff$buffType, HeroAction$Attack, Talent, NPC, CellEmitter, Speck, Messages, CellSelector$Listener, GameScene, PixelScene, CharSprite, ActionIndicator, BuffIndicator, HeroIcon, GLog, BitmapText, Sample, BArray, PathFinder;

export class Preparation extends Buff {
  turnsInvis: number = 0;
  static readonly TURNS: string = 'turnsInvis';
  attack: CellSelector$Listener = null;
  _Preparation(): this {
    this._Buff();
    this.actPriority = (Actor.BUFF_PRIO - 1) | 0;
    this.type_ = Buff$buffType.POSITIVE;
    this.turnsInvis = 0;
    this.attack = new (Preparation$1())().$o(this)._CellSelector$Listener();
    return this;
  }
  act(): boolean {
    if (this.target.invisible > 0) {
      this.turnsInvis++;
      if (Preparation$AttackLevel.getLvl(this.turnsInvis).blinkDistance() > 0 && this.target === Dungeon.hero) {
        ActionIndicator.setAction(this);
      }
      this.spend(Actor.TICK);
    } else {
      this.detach();
    }
    return true;
  }
  detach(): void {
    super.detach();
    ActionIndicator.clearAction$Action(this);
  }
  attackLevel(): number {
    return (Preparation$AttackLevel.getLvl(this.turnsInvis).ordinal() + 1) | 0;
  }
  damageRoll(attacker: Char): number {
    return Preparation$AttackLevel.getLvl(this.turnsInvis).damageRoll(attacker);
  }
  canKO(defender: Char): boolean {
    return !defender.isInvulnerable(this.target.getClass()) && Preparation$AttackLevel.getLvl(this.turnsInvis).canKO(defender);
  }
  icon(): number {
    return BuffIndicator.PREPARATION;
  }
  tintIcon(icon: Image): void {
    switch (Preparation$AttackLevel.getLvl(this.turnsInvis)) {
      case Preparation$AttackLevel.LVL_1:
        icon.hardlight$float$float$float(0, 1, 0);
        break;
      case Preparation$AttackLevel.LVL_2:
        icon.hardlight$float$float$float(1, 1, 0);
        break;
      case Preparation$AttackLevel.LVL_3:
        icon.hardlight$float$float$float(1, Math.fround(0.6), 0);
        break;
      case Preparation$AttackLevel.LVL_4:
        icon.hardlight$float$float$float(1, 0, 0);
        break;
    }
  }
  desc(): string {
    let desc = Messages.get$Object$String$ObjectArr(this, 'desc', []);
    let lvl = Preparation$AttackLevel.getLvl(this.turnsInvis);
    desc += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'desc_dmg', [$J.d2i((Math.fround(lvl.baseDmgBonus * 100))), $J.d2i((Math.fround(lvl.KOThreshold() * 100))), $J.d2i((Math.fround(lvl.KOThreshold() * 20)))]);
    if (lvl.damageRolls > 1) {
      desc += ' ' + Messages.get$Object$String$ObjectArr(this, 'desc_dmg_likely', []);
    }
    if (lvl.blinkDistance() > 0) {
      desc += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'desc_blink', [lvl.blinkDistance()]);
    }
    desc += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'desc_invis_time', [this.turnsInvis]);
    if (lvl.ordinal() !== ((Preparation$AttackLevel.values().length - 1) | 0)) {
      let next = Preparation$AttackLevel.values()[(lvl.ordinal() + 1) | 0];
      desc += '\n' + Messages.get$Object$String$ObjectArr(this, 'desc_invis_next', [next.turnsReq]);
    }
    return desc;
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.turnsInvis = bundle.getInt(Preparation.TURNS);
    ActionIndicator.setAction(this);
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(Preparation.TURNS, this.turnsInvis);
  }
  actionName(): string {
    return Messages.get$Object$String$ObjectArr(this, 'action_name', []);
  }
  actionIcon(): number {
    return HeroIcon.PREPARATION;
  }
  primaryVisual(): Visual {
    let actionIco = new HeroIcon()._HeroIcon$Action(this);
    this.tintIcon(actionIco);
    return actionIco;
  }
  secondaryVisual(): Visual {
    let txt = new BitmapText()._BitmapText$Font(PixelScene.pixelFont);
    txt.text$String(String(Math.min(9, this.turnsInvis)));
    txt.hardlight$int(CharSprite.POSITIVE);
    txt.measure();
    return txt;
  }
  indicatorColor(): number {
    return 4473924;
  }
  doAction(): void {
    GameScene.selectCell(this.attack);
  }
}

export class Preparation$AttackLevel extends JEnum {
  turnsReq: number = 0;
  baseDmgBonus: number = 0;
  damageRolls: number = 0;
  static KOThresholds: number[][] = null;
  static blinkRanges: number[][] = null;
  static LVL_1: Preparation$AttackLevel = null;
  static LVL_2: Preparation$AttackLevel = null;
  static LVL_3: Preparation$AttackLevel = null;
  static LVL_4: Preparation$AttackLevel = null;
  static $VALUES: Preparation$AttackLevel[] = null;
  _Preparation$AttackLevel($name: string, $ordinal: number, turns: number, base: number, rolls: number): this {
    this._JEnum($name, $ordinal);
    this.turnsReq = turns;
    this.baseDmgBonus = base;
    this.damageRolls = rolls;
    return this;
  }
  KOThreshold(): number {
    return Preparation$AttackLevel.KOThresholds[this.ordinal()][Dungeon.hero.pointsInTalent(Talent.ENHANCED_LETHALITY)];
  }
  blinkDistance(): number {
    return Preparation$AttackLevel.blinkRanges[this.ordinal()][Dungeon.hero.pointsInTalent(Talent.ASSASSINS_REACH)];
  }
  canKO(defender: Char): boolean {
    if (defender.properties().contains(Char$Property.MINIBOSS) || defender.properties().contains(Char$Property.BOSS)) {
      return (Math.fround(defender.HP / Math.fround(defender.HT))) < (Math.fround(this.KOThreshold() / 5));
    } else {
      return (Math.fround(defender.HP / Math.fround(defender.HT))) < this.KOThreshold();
    }
  }
  damageRoll(attacker: Char): number {
    let dmg = attacker.damageRoll();
    for (let i = 1; i < this.damageRolls; i++) {
      let newDmg = attacker.damageRoll();
      if (newDmg > dmg) {
        dmg = newDmg;
      }
    }
    return $J.roundf(Math.fround(dmg * (Math.fround(1 + this.baseDmgBonus))));
  }
  static getLvl(turnsInvis: number): Preparation$AttackLevel {
    let values = Arrays.asList(...Preparation$AttackLevel.values());
    Collections.reverse(values);
    for (const $it0 = values.iterator(); $it0.hasNext(); ) {
      let lvl = $it0.next();
      if (turnsInvis >= lvl.turnsReq) {
        return lvl;
      }
    }
    return Preparation$AttackLevel.LVL_1;
  }
  static values(): Preparation$AttackLevel[] { return Preparation$AttackLevel.$VALUES.slice(); }
  static valueOf(name: string): Preparation$AttackLevel { return $J.enumValueOf(Preparation$AttackLevel, name); }
  static $clinit() {
    Preparation$AttackLevel.LVL_1 = new Preparation$AttackLevel()._Preparation$AttackLevel('LVL_1', 0, 1, Math.fround(0.1), 1);
    Preparation$AttackLevel.LVL_2 = new Preparation$AttackLevel()._Preparation$AttackLevel('LVL_2', 1, 3, Math.fround(0.2), 1);
    Preparation$AttackLevel.LVL_3 = new Preparation$AttackLevel()._Preparation$AttackLevel('LVL_3', 2, 5, Math.fround(0.35), 2);
    Preparation$AttackLevel.LVL_4 = new Preparation$AttackLevel()._Preparation$AttackLevel('LVL_4', 3, 9, 0.5, 3);
    Preparation$AttackLevel.$VALUES = [Preparation$AttackLevel.LVL_1, Preparation$AttackLevel.LVL_2, Preparation$AttackLevel.LVL_3, Preparation$AttackLevel.LVL_4];
    Preparation$AttackLevel.KOThresholds = [[Math.fround(0.03), Math.fround(0.04), Math.fround(0.05), Math.fround(0.06)], [Math.fround(0.1), Math.fround(0.13), Math.fround(0.17), Math.fround(0.2)], [Math.fround(0.2), Math.fround(0.27), Math.fround(0.33), Math.fround(0.4)], [0.5, Math.fround(0.67), Math.fround(0.83), 1]];
    Preparation$AttackLevel.blinkRanges = [[1, 1, 2, 2], [2, 3, 4, 5], [3, 4, 6, 7], [4, 6, 8, 10]];
  }
}

let $Preparation$1: any = null;
/** An anonymous class (Preparation.java:269). */
function Preparation$1(): any {
  return $Preparation$1 ??= $J.local(class extends CellSelector$Listener {
    onSelect(cell: number): void {
      if (cell == null) {
        return;
      }
      let enemy = Actor.findChar(cell);
      if (enemy == null || Dungeon.hero.isCharmedBy(enemy) || enemy instanceof NPC || !Dungeon.level.heroFOV[cell] || enemy === Dungeon.hero) {
        GLog.w(Messages.get$Class$String$ObjectArr($J.cls(Preparation), 'no_target', []), []);
      } else {
        if (Dungeon.hero.canAttack(enemy)) {
          Dungeon.hero.curAction = new HeroAction$Attack()._HeroAction$Attack(enemy);
          Dungeon.hero.next();
          return;
        }
        let lvl = Preparation$AttackLevel.getLvl(this.$outer.turnsInvis);
        PathFinder.buildDistanceMap$int$booleanArr$int(Dungeon.hero.pos, BArray.or$booleanArr$booleanArr$booleanArr(Dungeon.level.passable, Dungeon.level.avoid, null), lvl.blinkDistance());
        let dest = -1;
        for (let i of PathFinder.NEIGHBOURS8) {
          if ((Actor.findChar((cell + i) | 0)) != null) {
            continue;
          }
          if (!(Dungeon.level.passable[(cell + i) | 0]) && !(this.$outer.target.flying && Dungeon.level.avoid[(cell + i) | 0])) {
            continue;
          }
          if (dest === -1 || PathFinder.distance[dest] > (PathFinder.distance[(cell + i) | 0])) {
            dest = (cell + i) | 0;
          } else if (PathFinder.distance[dest] === (PathFinder.distance[(cell + i) | 0])) {
            if (Dungeon.level.trueDistance(Dungeon.hero.pos, dest) > Dungeon.level.trueDistance(Dungeon.hero.pos, (cell + i) | 0)) {
              dest = (cell + i) | 0;
            }
          }
        }
        if (dest === -1 || PathFinder.distance[dest] === 2147483647 || Dungeon.hero.rooted) {
          GLog.w(Messages.get$Class$String$ObjectArr($J.cls(Preparation), 'out_of_reach', []), []);
          if (Dungeon.hero.rooted) {
            PixelScene.shake(1, 1);
          }
          return;
        }
        Dungeon.hero.pos = dest;
        Dungeon.level.occupyCell(Dungeon.hero);
        Dungeon.observe$();
        GameScene.updateFog$();
        Dungeon.hero.checkVisibleMobs();
        Dungeon.hero.sprite_.place(Dungeon.hero.pos);
        Dungeon.hero.sprite_.turnTo(Dungeon.hero.pos, cell);
        CellEmitter.get(Dungeon.hero.pos).burst(Speck.factory$int(Speck.WOOL), 6);
        Sample.INSTANCE.play$Object(Assets$Sounds.PUFF);
        Dungeon.hero.curAction = new HeroAction$Attack()._HeroAction$Attack(enemy);
        Dungeon.hero.next();
      }
    }
    prompt(): string {
      return Messages.get$Class$String$ObjectArr($J.cls(Preparation), 'prompt', [Preparation$AttackLevel.getLvl(this.$outer.turnsInvis).blinkDistance()]);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Preparation$1', []);
}

$J.define(Preparation, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Preparation', { kind: 'class', ifaces: ['com.shatteredpixel.shatteredpixeldungeon.ui.ActionIndicator$Action'], sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_Preparation' } });
$J.define(Preparation$AttackLevel, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Preparation$AttackLevel', { kind: 'enum', sup: 'java.lang.Enum', ctors: { 'int,float,int': '_Preparation$AttackLevel' }, clinit: true, lazy: ['$VALUES', 'LVL_1', 'LVL_2', 'LVL_3', 'LVL_4', 'KOThresholds', 'blinkRanges'] });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  HeroAction$Attack = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroAction$Attack');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  NPC = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.NPC');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  CellSelector$Listener = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.CellSelector$Listener');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  ActionIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.ActionIndicator');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  HeroIcon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.HeroIcon');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  BitmapText = $J.load('com.watabou.noosa.BitmapText');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  BArray = $J.load('com.watabou.utils.BArray');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
});
