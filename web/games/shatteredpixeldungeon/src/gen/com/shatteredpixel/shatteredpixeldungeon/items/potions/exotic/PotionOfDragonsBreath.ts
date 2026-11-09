// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/potions/exotic/PotionOfDragonsBreath.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, JObject } from '../../../../../../../jre/index.ts';
import { ExoticPotion } from './ExoticPotion.ts';

let Assets$Sounds, Dungeon, Actor, Blob, Fire, Buff, Burning, Cripple, Talent, MagicMissile, Item, Catalog, Level, Terrain, Ballistica, ConeAOE, Messages, CellSelector$Listener, GameScene, ItemSprite, ItemSpriteSheet$Icons, WndOptions, Game, Sample, PathFinder, Random;

export class PotionOfDragonsBreath extends ExoticPotion {
  static identifiedByUse: boolean = false;
  targeter: CellSelector$Listener = null;
  _PotionOfDragonsBreath(): this {
    this._ExoticPotion();
    this.icon_ = ItemSpriteSheet$Icons.POTION_DRGBREATH;
    this.targeter = new (PotionOfDragonsBreath$1())().$o(this)._CellSelector$Listener().$init_anon();
    return this;
  }
  drink(hero: Hero): void {
    if (!this.isKnown()) {
      this.identify$();
      Item.curItem = this.detach(hero.belongings.backpack);
      PotionOfDragonsBreath.identifiedByUse = true;
    } else {
      PotionOfDragonsBreath.identifiedByUse = false;
    }
    GameScene.selectCell(this.targeter);
  }
  static $clinit() {
    PotionOfDragonsBreath.identifiedByUse = false;
  }
}

let $PotionOfDragonsBreath$1$1$1: any = null;
/** An anonymous class (PotionOfDragonsBreath.java:103). */
function PotionOfDragonsBreath$1$1$1(): any {
  return $PotionOfDragonsBreath$1$1$1 ??= $J.local(class extends WndOptions {
    onSelect(index: number): void {
      this.$outer.$outer.showingWindow = false;
      switch (index) {
        case 0:
          Item.curUser.spendAndNext(1);
          PotionOfDragonsBreath.identifiedByUse = false;
          break;
        case 1:
          GameScene.selectCell(this.$outer.$outer.$outer.targeter);
          break;
      }
    }
    onBackPressed(): void {
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.potions.exotic.PotionOfDragonsBreath$1$1$1', []);
}

let $PotionOfDragonsBreath$1$1: any = null;
/** An anonymous class (PotionOfDragonsBreath.java:96). */
function PotionOfDragonsBreath$1$1(): any {
  return $PotionOfDragonsBreath$1$1 ??= $J.local(class extends JObject {
    call(): void {
      GameScene.show(new (PotionOfDragonsBreath$1$1$1())().$o(this)._WndOptions$Image$String$String$StringArr(new ItemSprite()._ItemSprite$Item(this.$outer.$outer), Messages.titleCase(this.$outer.$outer.name()), Messages.get$Class$String$ObjectArr($J.cls(ExoticPotion), 'warning', []), [Messages.get$Class$String$ObjectArr($J.cls(ExoticPotion), 'yes', []), Messages.get$Class$String$ObjectArr($J.cls(ExoticPotion), 'no', [])]));
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.potions.exotic.PotionOfDragonsBreath$1$1', ['com.watabou.utils.Callback']);
}

let $PotionOfDragonsBreath$1$2$1: any = null;
/** An anonymous class (PotionOfDragonsBreath.java:158). */
function PotionOfDragonsBreath$1$2$1(): any {
  return $PotionOfDragonsBreath$1$2$1 ??= $J.local(class extends JObject {
    call(): void {
      let adjacentCells = new ArrayList();
      for (const $it1 = this.$cv_cone.cells.iterator(); $it1.hasNext(); ) {
        let cell = $it1.next();
        if (cell === this.$cv_bolt.sourcePos) {
          continue;
        }
        if (Dungeon.level.map_[cell] === Terrain.DOOR) {
          Level.set$int$int(cell, Terrain.OPEN_DOOR);
          GameScene.updateMap$int(cell);
        }
        if (Dungeon.level.adjacent(this.$cv_bolt.sourcePos, cell) && !Dungeon.level.flamable[cell]) {
          adjacentCells.add(cell);
        } else {
          GameScene.add$Blob(Blob.seed$int$int$Class(cell, 5, $J.cls(Fire)));
        }
        let ch = Actor.findChar(cell);
        if (ch != null) {
          Buff.affect$Char$Class(ch, $J.cls(Burning)).reignite$Char(ch);
          Buff.prolong(ch, $J.cls(Cripple), 5);
        }
      }
      for (const $it2 = adjacentCells.iterator(); $it2.hasNext(); ) {
        let cell = $it2.next();
        for (let i of PathFinder.NEIGHBOURS4) {
          if (Dungeon.level.trueDistance((cell + i) | 0, this.$cv_bolt.sourcePos) > Dungeon.level.trueDistance(cell, this.$cv_bolt.sourcePos) && Dungeon.level.flamable[(cell + i) | 0] && Blob.volumeAt((cell + i) | 0, $J.cls(Fire)) === 0) {
            GameScene.add$Blob(Blob.seed$int$int$Class((cell + i) | 0, 5, $J.cls(Fire)));
          }
        }
      }
      Item.curUser.spendAndNext(1);
      if (!this.$outer.$outer.$outer.anonymous) {
        Catalog.countUse($J.cls(PotionOfDragonsBreath));
        if (Random.Float$() < this.$outer.$outer.$outer.talentChance) {
          Talent.onPotionUsed(Item.curUser, Item.curUser.pos, this.$outer.$outer.$outer.talentFactor);
        }
      }
    }
    $c($cone, $bolt): this {
      this.$cv_cone = $cone; this.$cv_bolt = $bolt;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.potions.exotic.PotionOfDragonsBreath$1$2$1', ['com.watabou.utils.Callback']);
}

let $PotionOfDragonsBreath$1$2: any = null;
/** An anonymous class (PotionOfDragonsBreath.java:129). */
function PotionOfDragonsBreath$1$2(): any {
  return $PotionOfDragonsBreath$1$2 ??= $J.local(class extends JObject {
    call(): void {
      Item.curUser.sprite_.idle();
      Item.curUser.sprite_.zap$int(this.$cv_cell);
      Sample.INSTANCE.play$Object(Assets$Sounds.BURNING);
      let bolt = new Ballistica()._Ballistica(Item.curUser.pos, this.$cv_cell, Ballistica.WONT_STOP);
      let maxDist = 6;
      let dist = Math.min(bolt.dist, maxDist);
      let cone = new ConeAOE()._ConeAOE$Ballistica$float$float$int(bolt, 6, 60, Ballistica.STOP_SOLID | Ballistica.STOP_TARGET | Ballistica.IGNORE_SOFT_SOLID);
      for (const $it0 = cone.outerRays.iterator(); $it0.hasNext(); ) {
        let ray = $it0.next();
        (Item.curUser.sprite_.parent.recycle($J.cls(MagicMissile))).reset$int$Visual$int$Callback(MagicMissile.FIRE_CONE, Item.curUser.sprite_, ray.path.get(ray.dist), null);
      }
      MagicMissile.boltFromChar(Item.curUser.sprite_.parent, MagicMissile.FIRE_CONE, Item.curUser.sprite_, bolt.path.get($J.idiv(dist, 2)), new (PotionOfDragonsBreath$1$2$1())().$o(this).$c(cone, bolt));
    }
    $c($cell): this {
      this.$cv_cell = $cell;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.potions.exotic.PotionOfDragonsBreath$1$2', ['com.watabou.utils.Callback']);
}

let $PotionOfDragonsBreath$1: any = null;
/** An anonymous class (PotionOfDragonsBreath.java:78). */
function PotionOfDragonsBreath$1(): any {
  return $PotionOfDragonsBreath$1 ??= $J.local(class extends CellSelector$Listener {
    showingWindow: boolean = false;
    potionAlreadyUsed: boolean = false;
    $init_anon() {
      this.showingWindow = false;
      this.potionAlreadyUsed = false;
      return this;
    }
    onSelect(cell: number): void {
      if (this.showingWindow) {
        return;
      }
      if (this.potionAlreadyUsed) {
        this.potionAlreadyUsed = false;
        return;
      }
      if (cell == null && PotionOfDragonsBreath.identifiedByUse) {
        this.showingWindow = true;
        Game.runOnRenderThread(new (PotionOfDragonsBreath$1$1())().$o(this));
      } else if (cell != null) {
        if (!PotionOfDragonsBreath.identifiedByUse) {
          Item.curItem.detach(Item.curUser.belongings.backpack);
        }
        this.potionAlreadyUsed = true;
        PotionOfDragonsBreath.identifiedByUse = false;
        Item.curUser.busy();
        Sample.INSTANCE.play$Object(Assets$Sounds.DRINK);
        Item.curUser.sprite_.operate$int$Callback(Item.curUser.pos, new (PotionOfDragonsBreath$1$2())().$o(this).$c(cell));
      }
    }
    prompt(): string {
      return Messages.get$Class$String$ObjectArr($J.cls(PotionOfDragonsBreath), 'prompt', []);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.potions.exotic.PotionOfDragonsBreath$1', []);
}

$J.define(PotionOfDragonsBreath, 'com.shatteredpixel.shatteredpixeldungeon.items.potions.exotic.PotionOfDragonsBreath', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.potions.exotic.ExoticPotion', ctors: { '': '_PotionOfDragonsBreath' }, clinit: true, lazy: ['identifiedByUse'] });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Blob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blob');
  Fire = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Fire');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Burning = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Burning');
  Cripple = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Cripple');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  MagicMissile = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  Level = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Level');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  ConeAOE = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.ConeAOE');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  CellSelector$Listener = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.CellSelector$Listener');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ItemSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite');
  ItemSpriteSheet$Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet$Icons');
  WndOptions = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndOptions');
  Game = $J.load('com.watabou.noosa.Game');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
