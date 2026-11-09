// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/artifacts/TalismanOfForesight.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../jre/index.ts';
import { Artifact } from './Artifact.ts';
import { Artifact$ArtifactBuff } from './Artifact.ts';
import { FlavourBuff } from '../../actors/buffs/FlavourBuff.ts';

let Assets$Sounds, Dungeon, Actor, Char$Alignment, Buff, Invisibility, MagicImmune, Regeneration, Hero, Talent, Mimic, Item, RingOfEnergy, ScrollOfMagicMapping, Catalog, Terrain, Ballistica, ConeAOE, Messages, CellSelector$Listener, GameScene, ItemSpriteSheet, BuffIndicator, GLog, Sample;

export class TalismanOfForesight extends Artifact {
  static readonly AC_SCRY: string = 'SCRY';
  scry: CellSelector$Listener = null;
  static readonly WARN: string = 'warn';
  warn: boolean = false;
  _TalismanOfForesight(): this {
    this._Artifact();
    this.image_ = ItemSpriteSheet.ARTIFACT_TALISMAN;
    this.exp = 0;
    this.levelCap = 10;
    this.charge_ = 0;
    this.partialCharge = 0;
    this.chargeCap_ = 100;
    this.defaultAction_ = TalismanOfForesight.AC_SCRY;
    this.scry = new (TalismanOfForesight$1())().$o(this)._CellSelector$Listener();
    this.warn = false;
    return this;
  }
  actions(hero: Hero): ArrayList<string> {
    let actions = super.actions(hero);
    if (this.isEquipped(hero) && !this.cursed && hero.buff($J.cls(MagicImmune)) == null) {
      actions.add(TalismanOfForesight.AC_SCRY);
    }
    return actions;
  }
  execute$Hero$String(hero: Hero, action: string): void {
    super.execute$Hero$String(hero, action);
    if (hero.buff($J.cls(MagicImmune)) != null) {
      return;
    }
    if ($J.equals(action, TalismanOfForesight.AC_SCRY)) {
      if (!this.isEquipped(hero)) {
        GLog.i(Messages.get$Class$String$ObjectArr($J.cls(Artifact), 'need_to_equip', []), []);
      } else if (this.charge_ < 5) {
        GLog.i(Messages.get$Object$String$ObjectArr(this, 'low_charge', []), []);
      } else {
        GameScene.selectCell(this.scry);
      }
    }
  }
  passiveBuff(): Artifact$ArtifactBuff {
    return new TalismanOfForesight$Foresight().$o(this)._TalismanOfForesight$Foresight();
  }
  charge(target: Hero, amount: number): void {
    if (this.cursed || target.buff($J.cls(MagicImmune)) != null) {
      return;
    }
    if (this.charge_ < this.chargeCap_) {
      this.partialCharge = Math.fround(this.partialCharge + Math.fround(2 * amount));
      while (this.partialCharge >= 1) {
        this.charge_++;
        this.partialCharge--;
      }
      if (this.charge_ >= this.chargeCap_) {
        this.charge_ = this.chargeCap_;
        this.partialCharge = 0;
        GLog.p(Messages.get$Class$String$ObjectArr($J.cls(TalismanOfForesight), 'full_charge', []), []);
      }
      Item.updateQuickslot();
    }
  }
  desc(): string {
    let desc = super.desc();
    if (this.isEquipped(Dungeon.hero)) {
      if (!this.cursed) {
        desc += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'desc_worn', []);
      } else {
        desc += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'desc_cursed', []);
      }
    }
    return desc;
  }
  maxDist(): number {
    return Math.min(Math.fround((5 + Math.imul(2, this.level$())) | 0), Math.fround(((this.charge_ - 3) | 0) / Math.fround(1.08)));
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$boolean(TalismanOfForesight.WARN, this.warn);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.warn = bundle.getBoolean(TalismanOfForesight.WARN);
  }
}

export class TalismanOfForesight$Foresight extends Artifact$ArtifactBuff {
  _TalismanOfForesight$Foresight(): this {
    this._Artifact$ArtifactBuff();
    return this;
  }
  act(): boolean {
    this.spend(Actor.TICK);
    this.checkAwareness();
    if (this.$outer.charge_ < this.$outer.chargeCap_ && !this.$outer.cursed && this.target.buff($J.cls(MagicImmune)) == null && Regeneration.regenOn()) {
      let chargeGain = (Math.fround(Math.fround(0.05) + (Math.fround(this.$outer.level$() * Math.fround(0.005)))));
      chargeGain = Math.fround(chargeGain * RingOfEnergy.artifactChargeMultiplier(this.target));
      this.$outer.partialCharge = Math.fround(this.$outer.partialCharge + chargeGain);
      while (this.$outer.partialCharge >= Math.fround(1)) {
        this.$outer.partialCharge--;
        this.$outer.charge_++;
        if (this.$outer.charge_ >= this.$outer.chargeCap_) {
          this.$outer.partialCharge = 0;
          GLog.p(Messages.get$Class$String$ObjectArr($J.cls(TalismanOfForesight), 'full_charge', []), []);
        }
        Item.updateQuickslot();
      }
    }
    return true;
  }
  checkAwareness(): void {
    let smthFound = false;
    let distance = 3;
    let cx = this.target.pos % Dungeon.level.width();
    let cy = $J.idiv(this.target.pos, Dungeon.level.width());
    let ax = (cx - distance) | 0;
    if (ax < 0) {
      ax = 0;
    }
    let bx = (cx + distance) | 0;
    if (bx >= Dungeon.level.width()) {
      bx = (Dungeon.level.width() - 1) | 0;
    }
    let ay = (cy - distance) | 0;
    if (ay < 0) {
      ay = 0;
    }
    let by = (cy + distance) | 0;
    if (by >= Dungeon.level.height()) {
      by = (Dungeon.level.height() - 1) | 0;
    }
    for (let y = ay; y <= by; y++) {
      for (let x = ax, p = (ax + Math.imul(y, Dungeon.level.width())) | 0; x <= bx; x++, p++) {
        if (Dungeon.level.heroFOV[p] && Dungeon.level.secret[p] && Dungeon.level.map_[p] !== Terrain.SECRET_DOOR) {
          if (Dungeon.level.traps.get(p) != null && Dungeon.level.traps.get(p).canBeSearched) {
            smthFound = true;
          }
        }
      }
    }
    if (smthFound && !this.$outer.cursed && this.target.buff($J.cls(MagicImmune)) == null) {
      if (!this.$outer.warn) {
        GLog.w(Messages.get$Object$String$ObjectArr(this, 'uneasy', []), []);
        if (this.target instanceof Hero) {
          (this.target).interrupt();
        }
        this.$outer.warn = true;
      }
    } else {
      this.$outer.warn = false;
    }
  }
  charge$int(boost: number): void {
    if (!this.$outer.cursed && this.target.buff($J.cls(MagicImmune)) == null) {
      this.$outer.charge_ = Math.min(((this.$outer.charge_ + boost) | 0), this.$outer.chargeCap_);
      Item.updateQuickslot();
    }
  }
  icon(): number {
    if (this.$outer.warn) {
      return BuffIndicator.FORESIGHT;
    } else {
      return BuffIndicator.NONE;
    }
  }
}

export class TalismanOfForesight$CharAwareness extends FlavourBuff {
  charID: number = 0;
  static readonly CHAR_ID: string = 'char_id';
  _TalismanOfForesight$CharAwareness(): this {
    this._FlavourBuff();
    return this;
  }
  detach(): void {
    super.detach();
    Dungeon.observe$();
    GameScene.updateFog$();
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.charID = bundle.getInt(TalismanOfForesight$CharAwareness.CHAR_ID);
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(TalismanOfForesight$CharAwareness.CHAR_ID, this.charID);
  }
}

export class TalismanOfForesight$HeapAwareness extends FlavourBuff {
  pos: number = 0;
  depth_: number = 0;
  branch: number = 0;
  static readonly POS: string = 'pos';
  static readonly DEPTH: string = 'depth';
  static readonly BRANCH: string = 'branch';
  _TalismanOfForesight$HeapAwareness(): this {
    this._FlavourBuff();
    this.depth_ = Dungeon.depth;
    this.branch = Dungeon.branch;
    return this;
  }
  detach(): void {
    super.detach();
    Dungeon.observe$();
    GameScene.updateFog$();
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.pos = bundle.getInt(TalismanOfForesight$HeapAwareness.POS);
    this.depth_ = bundle.getInt(TalismanOfForesight$HeapAwareness.DEPTH);
    this.branch = bundle.getInt(TalismanOfForesight$HeapAwareness.BRANCH);
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(TalismanOfForesight$HeapAwareness.POS, this.pos);
    bundle.put$String$int(TalismanOfForesight$HeapAwareness.DEPTH, this.depth_);
    bundle.put$String$int(TalismanOfForesight$HeapAwareness.BRANCH, this.branch);
  }
}

let $TalismanOfForesight$1: any = null;
/** An anonymous class (TalismanOfForesight.java:139). */
function TalismanOfForesight$1(): any {
  return $TalismanOfForesight$1 ??= $J.local(class extends CellSelector$Listener {
    onSelect(target: number): void {
      if (target != null && target !== Item.curUser.pos) {
        if (Dungeon.level.adjacent(target, Item.curUser.pos)) {
          target = (target + (target - Item.curUser.pos)) | 0;
        }
        let dist = Dungeon.level.trueDistance(Item.curUser.pos, target);
        if (dist >= Math.fround(3) && dist > this.$outer.maxDist()) {
          let trajectory = new Ballistica()._Ballistica(Item.curUser.pos, target, Ballistica.STOP_TARGET);
          let i = 0;
          while (i < trajectory.path.size() && Dungeon.level.trueDistance(Item.curUser.pos, trajectory.path.get(i)) <= this.$outer.maxDist()) {
            target = trajectory.path.get(i);
            i++;
          }
          dist = Dungeon.level.trueDistance(Item.curUser.pos, target);
        }
        let angle = Math.fround($J.roundf(Math.fround(200 * Math.fround($J.pow(0.92, dist)))));
        let cone = new ConeAOE()._ConeAOE$Ballistica$float(new Ballistica()._Ballistica(Item.curUser.pos, target, Ballistica.STOP_TARGET), angle);
        let earnedExp = 0;
        let noticed = false;
        for (const $it0 = cone.cells.iterator(); $it0.hasNext(); ) {
          let cell = $it0.next();
          GameScene.checkedCell(cell, Item.curUser.pos);
          if (Dungeon.level.discoverable[cell] && !(Dungeon.level.mapped[cell] || Dungeon.level.visited[cell])) {
            Dungeon.level.mapped[cell] = true;
            earnedExp++;
          }
          if (Dungeon.level.secret[cell]) {
            let oldValue = Dungeon.level.map_[cell];
            GameScene.discoverTile(cell, oldValue);
            Dungeon.level.discover(cell);
            ScrollOfMagicMapping.discover(cell);
            noticed = true;
            if (oldValue === Terrain.SECRET_TRAP) {
              earnedExp = (earnedExp + 10) | 0;
            } else if (oldValue === Terrain.SECRET_DOOR) {
              earnedExp = (earnedExp + 100) | 0;
            }
          }
          let ch = Actor.findChar(cell);
          if (ch != null && (ch.alignment !== Char$Alignment.NEUTRAL || ch instanceof Mimic) && ch.alignment !== Item.curUser.alignment) {
            Buff.append$Char$Class$float(Item.curUser, $J.cls(TalismanOfForesight$CharAwareness), Math.fround((5 + Math.imul(2, this.$outer.level$())) | 0)).charID = ch.id();
            Artifact.artifactProc(ch, this.$outer.visiblyUpgraded(), $J.d2i((Math.fround(3 + Math.fround(dist * Math.fround(1.08))))));
            if (!Item.curUser.fieldOfView[ch.pos]) {
              earnedExp = (earnedExp + 10) | 0;
            }
          }
          let h = Dungeon.level.heaps.get(cell);
          if (h != null) {
            Buff.append$Char$Class$float(Item.curUser, $J.cls(TalismanOfForesight$HeapAwareness), Math.fround((5 + Math.imul(2, this.$outer.level$())) | 0)).pos = h.pos;
            if (!h.seen) {
              earnedExp = (earnedExp + 10) | 0;
            }
          }
        }
        this.$outer.exp = (this.$outer.exp + earnedExp) | 0;
        if (this.$outer.exp >= ((100 + Math.imul(50, this.$outer.level$())) | 0) && this.$outer.level$() < this.$outer.levelCap) {
          this.$outer.exp = (this.$outer.exp - (100 + Math.imul(50, this.$outer.level$()))) | 0;
          this.$outer.upgrade$();
          Catalog.countUse($J.cls(TalismanOfForesight));
          GLog.p(Messages.get$Class$String$ObjectArr($J.cls(TalismanOfForesight), 'levelup', []), []);
        }
        Item.updateQuickslot();
        this.$outer.charge_ = $J.d2i(Math.fround(this.$outer.charge_ - Math.fround(3 + Math.fround(dist * Math.fround(1.08)))));
        this.$outer.partialCharge = Math.fround(this.$outer.partialCharge - Math.fround((Math.fround(dist * Math.fround(1.08))) % 1));
        if (this.$outer.partialCharge < Math.fround(0) && this.$outer.charge_ > 0) {
          this.$outer.partialCharge++;
          this.$outer.charge_--;
        }
        while (this.$outer.charge_ < 0) {
          this.$outer.charge_++;
          this.$outer.partialCharge--;
        }
        Invisibility.dispel$Char(Item.curUser);
        Talent.onArtifactUsed(Dungeon.hero);
        Item.updateQuickslot();
        Dungeon.observe$();
        Dungeon.hero.checkVisibleMobs();
        GameScene.updateFog$();
        Item.curUser.sprite_.zap$int(target);
        Item.curUser.spendAndNext(Actor.TICK);
        Sample.INSTANCE.play$Object(Assets$Sounds.SCAN);
        if (noticed) {
          Sample.INSTANCE.play$Object(Assets$Sounds.SECRET);
        }
      }
    }
    prompt(): string {
      return Messages.get$Class$String$ObjectArr($J.cls(TalismanOfForesight), 'prompt', []);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.TalismanOfForesight$1', []);
}

$J.define(TalismanOfForesight, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.TalismanOfForesight', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.Artifact', ctors: { '': '_TalismanOfForesight' }, meths: { 'execute(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,java.lang.String)': 'execute$Hero$String' } });
$J.define(TalismanOfForesight$Foresight, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.TalismanOfForesight$Foresight', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.Artifact$ArtifactBuff', ctors: { '': '_TalismanOfForesight$Foresight' }, meths: { 'charge(int)': 'charge$int' }, inner: true });
$J.define(TalismanOfForesight$CharAwareness, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.TalismanOfForesight$CharAwareness', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_TalismanOfForesight$CharAwareness' } });
$J.define(TalismanOfForesight$HeapAwareness, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.TalismanOfForesight$HeapAwareness', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_TalismanOfForesight$HeapAwareness' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Invisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invisibility');
  MagicImmune = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MagicImmune');
  Regeneration = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Regeneration');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Mimic = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mimic');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  RingOfEnergy = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfEnergy');
  ScrollOfMagicMapping = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfMagicMapping');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  ConeAOE = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.ConeAOE');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  CellSelector$Listener = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.CellSelector$Listener');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
