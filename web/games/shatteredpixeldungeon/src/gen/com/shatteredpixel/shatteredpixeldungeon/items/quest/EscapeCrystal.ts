// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/quest/EscapeCrystal.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList } from '../../../../../../jre/index.ts';
import { Item } from '../Item.ts';

let Assets$Sounds, Dungeon, Imp, Imp$Quest, VaultTokenDoor, VaultBossElemental, EquipableItem, Armor, DwarfToken, ImpStatue, Wand, MagesStaff, Level, VaultLevel, LevelTransition, LevelTransition$Type, VaultFinalRoom, Messages, GameScene, InterlevelScene, InterlevelScene$Mode, ImpSprite, ItemSprite, ItemSpriteSheet, WndBag$ItemSelector, WndError, WndOptions, WndTitledMessage, Game, Sample, Bundle, Reflection;

export class EscapeCrystal extends Item {
  static readonly AC_USE: string = 'USE';
  static BELONGINGS: string = null;
  static QUICKSLOTS: string = null;
  static GOLD: string = null;
  static ENERGY: string = null;
  storedItems: Bundle = null;
  static STORED_ITEMS: string = null;
  _EscapeCrystal(): this {
    this._Item();
    this.image_ = ItemSpriteSheet.ESCAPE;
    this.unique = true;
    this.defaultAction_ = EscapeCrystal.AC_USE;
    return this;
  }
  actions(hero: Hero): ArrayList<string> {
    let actions = new ArrayList();
    actions.add(EscapeCrystal.AC_USE);
    return actions;
  }
  execute$Hero$String(hero: Hero, action: string): void {
    super.execute$Hero$String(hero, action);
    if ($J.equals(action, EscapeCrystal.AC_USE)) {
      if (Dungeon.level instanceof VaultLevel) {
        if (Imp$Quest.isOld()) {
          this.leaveVault(null, 0);
          return;
        }
        let score = 0;
        if (hero.belongings.getItem($J.cls(ImpStatue)) != null) {
          score = 4000;
        } else {
          score = (score + $J.d2i((Math.fround(1000 * Dungeon.level.levelExplorePercent(Dungeon.depth))))) | 0;
          let doorOpened = true;
          for (const $it0 = Dungeon.level.mobs.iterator(); $it0.hasNext(); ) {
            let ch = $it0.next();
            if (ch instanceof VaultTokenDoor) {
              doorOpened = false;
              break;
            }
          }
          if (doorOpened) {
            score = (score + 1250) | 0;
          } else {
            let tokens = hero.belongings.getItem($J.cls(DwarfToken));
            if (tokens != null) {
              score = (score + Math.min(1000, Math.imul(100, tokens.quantity$()))) | 0;
            }
          }
          let r = (Dungeon.level).room$Class($J.cls(VaultFinalRoom));
          if (r.elementalWasSummoned()) {
            let elementalFound = false;
            for (const $it1 = Dungeon.level.mobs.iterator(); $it1.hasNext(); ) {
              let ch = $it1.next();
              if (ch instanceof VaultBossElemental) {
                elementalFound = true;
                score = (score + $J.d2i((Math.fround(750 * (Math.fround(ch.HP / Math.fround(ch.HT))))))) | 0;
                break;
              }
            }
            if (!elementalFound) {
              score = (score + 750) | 0;
            }
          }
          score = Math.imul(($J.idiv(score, 50)), 50);
        }
        if (score < 50) {
          GameScene.show(new WndTitledMessage()._WndTitledMessage$Image$String$String(new ImpSprite()._ImpSprite(), Messages.titleCase(Messages.get$Class$String$ObjectArr($J.cls(Imp), 'name', [])), Messages.get$Class$String$ObjectArr($J.cls(EscapeCrystal), 'leaving_start', [])));
        } else {
          let message: string;
          if (score < 500) {
            message = Messages.get$Class$String$ObjectArr($J.cls(EscapeCrystal), 'leaving_early', []);
          } else if (score <= 1000) {
            message = Messages.get$Class$String$ObjectArr($J.cls(EscapeCrystal), 'leaving_partly_explored', []);
          } else if (score <= 2000) {
            message = Messages.get$Class$String$ObjectArr($J.cls(EscapeCrystal), 'leaving_fully_explored', []);
          } else if (score < 4000) {
            message = Messages.get$Class$String$ObjectArr($J.cls(EscapeCrystal), 'leaving_partial_victory', []);
          } else {
            message = Messages.get$Class$String$ObjectArr($J.cls(EscapeCrystal), 'leaving_victory', []);
          }
          let finalScore = score;
          GameScene.show(new (EscapeCrystal$1())().$o(this).$c(finalScore)._WndOptions$Image$String$String$StringArr(new ImpSprite()._ImpSprite(), Messages.titleCase(Messages.get$Class$String$ObjectArr($J.cls(Imp), 'name', [])), message, [Messages.get$Class$String$ObjectArr($J.cls(EscapeCrystal), 'leaving_yes', []), Messages.get$Class$String$ObjectArr($J.cls(EscapeCrystal), 'leaving_no', [])]));
        }
      } else {
        if (this.storedItems == null || !this.storedItems.contains(EscapeCrystal.BELONGINGS)) {
          GameScene.show(new WndError()._WndError(Messages.get$Class$String$ObjectArr($J.cls(EscapeCrystal), 'error_start', []) + '\n\n' + Messages.get$Class$String$ObjectArr($J.cls(EscapeCrystal), 'error_no_items', [])));
          this.detachAll(hero.belongings.backpack);
        } else {
          GameScene.show(new WndError()._WndError(Messages.get$Class$String$ObjectArr($J.cls(EscapeCrystal), 'error_start', []) + '\n\n' + Messages.get$Class$String$ObjectArr($J.cls(EscapeCrystal), 'error_with_items', [])));
        }
      }
    }
  }
  leaveVault(preserve: Item, score: number): void {
    Sample.INSTANCE.play$Object(Assets$Sounds.TELEPORT);
    Dungeon.hero.live();
    Dungeon.hero.HP = Dungeon.hero.HT;
    if (preserve instanceof Armor && (preserve).checkSeal() != null) {
      let seal = (preserve).checkSeal();
      let attached = seal.getGlyph();
      (preserve).detachSeal();
      if ((preserve).glyph_ == null && attached != null) {
        (preserve).inscribe$Glyph(attached);
      }
    } else if (preserve instanceof MagesStaff) {
      let w = Reflection.newInstance((preserve).wandClass());
      w.identify$boolean(false);
      w.upgrade$int((preserve.level$() - 1) | 0);
      preserve = w;
    }
    this.restoreHeroBelongings(Dungeon.hero, preserve);
    Dungeon.hero.updateHT(false);
    this.detachAll(Dungeon.hero.belongings.backpack);
    if (!Imp$Quest.isOld()) {
      Imp$Quest.complete(score);
    }
    Level.beforeTransition();
    InterlevelScene.curTransition = new LevelTransition()._LevelTransition$Level$int$Type$int$int$Type(Dungeon.level, Dungeon.hero.pos, LevelTransition$Type.BRANCH_ENTRANCE, Dungeon.depth, 0, LevelTransition$Type.BRANCH_EXIT);
    InterlevelScene.mode = InterlevelScene$Mode.ASCEND;
    Game.switchScene$Class($J.cls(InterlevelScene));
  }
  storeHeroBelongings(hero: Hero): void {
    this.storedItems = new Bundle()._Bundle$();
    let belongings = new Bundle()._Bundle$();
    hero.belongings.storeInBundle(belongings);
    this.storedItems.put$String$Bundle(EscapeCrystal.BELONGINGS, belongings);
    let quickslots = new Bundle()._Bundle$();
    Dungeon.quickslot.storePlaceholders(quickslots);
    this.storedItems.put$String$Bundle(EscapeCrystal.QUICKSLOTS, quickslots);
    this.storedItems.put$String$int(EscapeCrystal.GOLD, Dungeon.gold);
    this.storedItems.put$String$int(EscapeCrystal.ENERGY, Dungeon.energy);
    Dungeon.quickslot.reset();
    Item.updateQuickslot();
    Dungeon.gold = Dungeon.energy = 0;
    hero.belongings.clear();
  }
  restoreHeroBelongings(hero: Hero, preserve: Item): void {
    if (preserve != null) {
      preserve.detachAll(hero.belongings.backpack);
    }
    hero.belongings.clear();
    Dungeon.quickslot.reset();
    Dungeon.quickslot.restorePlaceholders(this.storedItems.getBundle(EscapeCrystal.QUICKSLOTS));
    Item.updateQuickslot();
    Dungeon.hero.belongings.restoreFromBundle(this.storedItems.getBundle(EscapeCrystal.BELONGINGS));
    Dungeon.gold = this.storedItems.getInt(EscapeCrystal.GOLD);
    Dungeon.energy = this.storedItems.getInt(EscapeCrystal.ENERGY);
    if (preserve != null) {
      if (!preserve.collect$()) {
        Imp$Quest.reward = preserve;
      }
    }
    this.storedItems = null;
  }
  isUpgradable(): boolean {
    return false;
  }
  isIdentified(): boolean {
    return true;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$Bundle(EscapeCrystal.STORED_ITEMS, this.storedItems);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.storedItems = bundle.getBundle(EscapeCrystal.STORED_ITEMS);
  }
  static $clinit() {
    EscapeCrystal.BELONGINGS = 'belongings';
    EscapeCrystal.QUICKSLOTS = 'quickslots';
    EscapeCrystal.GOLD = 'gold';
    EscapeCrystal.ENERGY = 'energy';
    EscapeCrystal.STORED_ITEMS = 'stored_items';
  }
}

let $EscapeCrystal$1$1$1: any = null;
/** An anonymous class (EscapeCrystal.java:220). */
function EscapeCrystal$1$1$1(): any {
  return $EscapeCrystal$1$1$1 ??= $J.local(class extends WndOptions {
    onSelect(index: number): void {
      if (index === 0) {
        this.$outer.$outer.$outer.leaveVault(this.$cv_finalItem, this.$cv_finalScore);
      }
      super.onSelect(index);
    }
    $c($finalItem, $finalScore): this {
      this.$cv_finalItem = $finalItem; this.$cv_finalScore = $finalScore;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.quest.EscapeCrystal$1$1$1', []);
}

let $EscapeCrystal$1$1: any = null;
/** An anonymous class (EscapeCrystal.java:165). */
function EscapeCrystal$1$1(): any {
  return $EscapeCrystal$1$1 ??= $J.local(class extends WndBag$ItemSelector {
    textPrompt(): string {
      return Messages.get$Class$String$ObjectArr($J.cls(EscapeCrystal), 'prompt', []);
    }
    itemSelectable(item: Item): boolean {
      if (item instanceof EscapeCrystal) {
        return false;
      }
      if (this.$cv_finalScore <= 1000) {
        return !item.unique && !(item instanceof EquipableItem || item instanceof Wand);
      } else if (this.$cv_finalScore < 4000) {
        let maxLevel = this.$cv_finalScore > 2000 ? 1 : 0;
        if (item instanceof MagesStaff) {
          return (item).wandClass() != null && item.level$() <= ((maxLevel + 1) | 0);
        } else if (item instanceof Armor && (item).checkSeal() != null) {
          return item.level$() <= ((maxLevel + 1) | 0);
        } else {
          return item.level$() <= maxLevel && !item.unique;
        }
      } else {
        if (item instanceof MagesStaff) {
          return (item).wandClass() != null;
        }
        return !item.unique;
      }
    }
    onSelect(item: Item): void {
      if (item != null) {
        let desc = Messages.get$Class$String$ObjectArr($J.cls(EscapeCrystal), 'leaving_item', []);
        if (item instanceof Armor && (item).checkSeal() != null) {
          desc += '\n\n' + Messages.get$Class$String$ObjectArr($J.cls(EscapeCrystal), 'leaving_seal', []);
        } else if (item instanceof MagesStaff) {
          desc += '\n\n' + Messages.get$Class$String$ObjectArr($J.cls(EscapeCrystal), 'leaving_staff', []);
        }
        if (item.quantity$() > 0 && !(item instanceof EquipableItem)) {
          item = item.duplicate().quantity$int(1);
        }
        let finalItem = item;
        GameScene.show(new (EscapeCrystal$1$1$1())().$o(this).$c(finalItem, this.$cv_finalScore)._WndOptions$Image$String$String$StringArr(new ItemSprite()._ItemSprite$Item(finalItem), Messages.titleCase(finalItem.title()), desc, [Messages.get$Class$String$ObjectArr($J.cls(EscapeCrystal), 'leaving_yes', []), Messages.get$Class$String$ObjectArr($J.cls(EscapeCrystal), 'leaving_no', [])]));
      }
    }
    $c($finalScore): this {
      this.$cv_finalScore = $finalScore;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.quest.EscapeCrystal$1$1', []);
}

let $EscapeCrystal$1: any = null;
/** An anonymous class (EscapeCrystal.java:160). */
function EscapeCrystal$1(): any {
  return $EscapeCrystal$1 ??= $J.local(class extends WndOptions {
    onSelect(index: number): void {
      if (index === 0) {
        if (this.$cv_finalScore >= 500) {
          GameScene.selectItem(new (EscapeCrystal$1$1())().$o(this).$c(this.$cv_finalScore)._WndBag$ItemSelector());
        } else {
          this.$outer.leaveVault(null, this.$cv_finalScore);
        }
      }
    }
    $c($finalScore): this {
      this.$cv_finalScore = $finalScore;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.quest.EscapeCrystal$1', []);
}

$J.define(EscapeCrystal, 'com.shatteredpixel.shatteredpixeldungeon.items.quest.EscapeCrystal', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Item', ctors: { '': '_EscapeCrystal' }, meths: { 'execute(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,java.lang.String)': 'execute$Hero$String' }, clinit: true, lazy: ['BELONGINGS', 'QUICKSLOTS', 'GOLD', 'ENERGY', 'STORED_ITEMS'] });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Imp = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Imp');
  Imp$Quest = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Imp$Quest');
  VaultTokenDoor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.VaultTokenDoor');
  VaultBossElemental = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.quest.vault.VaultBossElemental');
  EquipableItem = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.EquipableItem');
  Armor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor');
  DwarfToken = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.DwarfToken');
  ImpStatue = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.ImpStatue');
  Wand = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.Wand');
  MagesStaff = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.MagesStaff');
  Level = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Level');
  VaultLevel = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.VaultLevel');
  LevelTransition = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.LevelTransition');
  LevelTransition$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.LevelTransition$Type');
  VaultFinalRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.VaultFinalRoom');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  InterlevelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.InterlevelScene');
  InterlevelScene$Mode = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.InterlevelScene$Mode');
  ImpSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ImpSprite');
  ItemSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  WndBag$ItemSelector = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndBag$ItemSelector');
  WndError = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndError');
  WndOptions = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndOptions');
  WndTitledMessage = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndTitledMessage');
  Game = $J.load('com.watabou.noosa.Game');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  Bundle = $J.load('com.watabou.utils.Bundle');
  Reflection = $J.load('com.watabou.utils.Reflection');
});
