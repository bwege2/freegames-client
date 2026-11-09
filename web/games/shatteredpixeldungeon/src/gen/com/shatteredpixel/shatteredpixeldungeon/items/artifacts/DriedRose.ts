// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/artifacts/DriedRose.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, ClassCastException, JObject } from '../../../../../../jre/index.ts';
import { Artifact } from './Artifact.ts';
import { Artifact$ArtifactBuff } from './Artifact.ts';
import { Item } from '../Item.ts';
import { DirectableAlly } from '../../actors/mobs/npcs/DirectableAlly.ts';
import { Window } from '../../ui/Window.ts';

let Assets$Sounds, Dungeon, Statistics, Actor, Char, Char$Property, CorrosiveGas, AllyBuff, AscensionChallenge, Burning, Invisibility, MagicImmune, Regeneration, Belongings$Backpack, Talent, Stasis, Wraith, Ghost$Quest, CellEmitter, FloatingText, Speck, ShaftParticle, Armor, RingOfEnergy, ScrollOfRetribution, ScrollOfPsionicBlast, MeleeWeapon, Catalog, VaultLevel, Messages, AlchemyScene, CellSelector$Listener, GameScene, PixelScene, CharSprite, GhostSprite, ItemSprite, ItemSpriteSheet, BossHealthBar, ItemButton, GLog, IconTitle, WndBag$ItemSelector, WndBag$Placeholder, WndInfoItem, WndQuest, WndUseItem, Game, Sample, PathFinder, Random;

export class DriedRose extends Artifact {
  talkedTo: boolean = false;
  firstSummon: boolean = false;
  ghost: DriedRose$GhostHero = null;
  ghostID: number = 0;
  weapon_: MeleeWeapon = null;
  armor_: Armor = null;
  droppedPetals: number = 0;
  static readonly AC_SUMMON: string = 'SUMMON';
  static readonly AC_DIRECT: string = 'DIRECT';
  static readonly AC_OUTFIT: string = 'OUTFIT';
  static readonly TALKEDTO: string = 'talkedto';
  static readonly FIRSTSUMMON: string = 'firstsummon';
  static readonly GHOSTID: string = 'ghostID';
  static readonly PETALS: string = 'petals';
  static readonly WEAPON: string = 'weapon';
  static readonly ARMOR: string = 'armor';
  ghostDirector: CellSelector$Listener = null;
  _DriedRose(): this {
    this._Artifact();
    this.image_ = ItemSpriteSheet.ARTIFACT_ROSE1;
    this.levelCap = 10;
    this.charge_ = 100;
    this.chargeCap_ = 100;
    this.defaultAction_ = DriedRose.AC_SUMMON;
    this.talkedTo = false;
    this.firstSummon = false;
    this.ghost = null;
    this.ghostID = 0;
    this.weapon_ = null;
    this.armor_ = null;
    this.droppedPetals = 0;
    this.ghostDirector = new (DriedRose$1())().$o(this)._CellSelector$Listener();
    return this;
  }
  actions(hero: Hero): ArrayList<string> {
    let actions = super.actions(hero);
    if (!Ghost$Quest.completed()) {
      return actions;
    }
    if (this.isEquipped(hero) && this.charge_ === this.chargeCap_ && !this.cursed && hero.buff($J.cls(MagicImmune)) == null && this.ghostID === 0) {
      actions.add(DriedRose.AC_SUMMON);
    }
    if (this.ghostID !== 0) {
      actions.add(DriedRose.AC_DIRECT);
    }
    if (this.isIdentified() && !this.cursed && !(Dungeon.level instanceof VaultLevel)) {
      actions.add(DriedRose.AC_OUTFIT);
    }
    return actions;
  }
  defaultAction(): string {
    if (this.ghost != null) {
      return DriedRose.AC_DIRECT;
    } else {
      return DriedRose.AC_SUMMON;
    }
  }
  execute$Hero$String(hero: Hero, action: string): void {
    super.execute$Hero$String(hero, action);
    if ($J.equals(action, DriedRose.AC_SUMMON)) {
      if (hero.buff($J.cls(MagicImmune)) != null) {
        return;
      }
      if (!Ghost$Quest.completed()) {
        GameScene.show(new WndUseItem()._WndUseItem(null, this));
      } else if (this.ghost != null) {
        GLog.i(Messages.get$Object$String$ObjectArr(this, 'spawned', []), []);
      } else if (!this.isEquipped(hero)) {
        GLog.i(Messages.get$Class$String$ObjectArr($J.cls(Artifact), 'need_to_equip', []), []);
      } else if (this.charge_ !== this.chargeCap_) {
        GLog.i(Messages.get$Object$String$ObjectArr(this, 'no_charge', []), []);
      } else if (this.cursed) {
        GLog.i(Messages.get$Object$String$ObjectArr(this, 'cursed', []), []);
      } else {
        let spawnPoints = new ArrayList();
        for (let i = 0; i < PathFinder.NEIGHBOURS8.length; i++) {
          let p = (hero.pos + PathFinder.NEIGHBOURS8[i]) | 0;
          if (Actor.findChar(p) == null && (Dungeon.level.passable[p] || Dungeon.level.avoid[p])) {
            spawnPoints.add(p);
          }
        }
        if (spawnPoints.size() > 0) {
          this.ghost = new DriedRose$GhostHero()._DriedRose$GhostHero$DriedRose(this);
          this.ghostID = this.ghost.id();
          this.ghost.pos = Random.element$Collection(spawnPoints);
          GameScene.add$Mob$float(this.ghost, 1);
          Dungeon.level.occupyCell(this.ghost);
          CellEmitter.get(this.ghost.pos).start(ShaftParticle.FACTORY, Math.fround(0.3), 4);
          CellEmitter.get(this.ghost.pos).start(Speck.factory$int(Speck.LIGHT), Math.fround(0.2), 3);
          hero.spend(1);
          hero.busy();
          hero.sprite_.operate$int(hero.pos);
          if (!this.firstSummon) {
            this.ghost.yell(Messages.get$Class$String$ObjectArr($J.cls(DriedRose$GhostHero), 'hello', [Messages.titleCase(Dungeon.hero.name())]));
            Sample.INSTANCE.play$Object(Assets$Sounds.GHOST);
            this.firstSummon = true;
          } else {
            if (BossHealthBar.isAssigned()) {
              this.ghost.sayBoss();
            } else {
              this.ghost.sayAppeared();
            }
          }
          Invisibility.dispel$Char(hero);
          Talent.onArtifactUsed(hero);
          this.charge_ = 0;
          this.partialCharge = 0;
          Item.updateQuickslot();
        } else {
          GLog.i(Messages.get$Object$String$ObjectArr(this, 'no_space', []), []);
        }
      }
    } else if ($J.equals(action, DriedRose.AC_DIRECT)) {
      if (this.ghost == null && this.ghostID !== 0) {
        this.findGhost();
      }
      if (this.ghost != null && this.ghost !== Stasis.getStasisAlly()) {
        GameScene.selectCell(this.ghostDirector);
      }
    } else if ($J.equals(action, DriedRose.AC_OUTFIT)) {
      GameScene.show(new DriedRose$WndGhostHero()._DriedRose$WndGhostHero(this));
    }
  }
  findGhost(): void {
    let a = Actor.findById(this.ghostID);
    if (a != null) {
      this.ghost = a;
    } else {
      if (Stasis.getStasisAlly() instanceof DriedRose$GhostHero) {
        this.ghost = Stasis.getStasisAlly();
        this.ghostID = this.ghost.id();
      } else {
        this.ghostID = 0;
      }
    }
  }
  ghostStrength(): number {
    return (13 + $J.idiv(this.level$(), 2)) | 0;
  }
  desc(): string {
    if (!Ghost$Quest.completed() && (Game.scene() instanceof GameScene || Game.scene() instanceof AlchemyScene)) {
      return Messages.get$Object$String$ObjectArr(this, 'desc_no_quest', []);
    }
    let desc = super.desc();
    if (this.isEquipped(Dungeon.hero)) {
      if (!this.cursed) {
        if (this.level$() < this.levelCap) {
          desc += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'desc_hint', []);
        }
      } else {
        desc += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'desc_cursed', []);
      }
    }
    if (this.weapon_ != null || this.armor_ != null) {
      desc += '\n';
      if (this.weapon_ != null) {
        desc += '\n' + Messages.get$Object$String$ObjectArr(this, 'desc_weapon', [Messages.titleCase(this.weapon_.title())]);
      }
      if (this.armor_ != null) {
        desc += '\n' + Messages.get$Object$String$ObjectArr(this, 'desc_armor', [Messages.titleCase(this.armor_.title())]);
      }
      desc += '\n' + Messages.get$Object$String$ObjectArr(this, 'desc_strength', [this.ghostStrength()]);
    }
    return desc;
  }
  value(): number {
    if (this.weapon_ != null) {
      return -1;
    }
    if (this.armor_ != null) {
      return -1;
    }
    return super.value();
  }
  status(): string {
    if (this.ghost == null && this.ghostID !== 0) {
      try {
        this.findGhost();
      } catch ($e0) {
        if ($J.isa($e0, ClassCastException)) {
          let e = $J.exc($e0);
          Game.reportException(e);
          this.ghostID = 0;
        } else {
          throw $e0;
        }
      }
    }
    if (this.ghost == null) {
      return super.status();
    } else {
      return ($J.idiv((Math.imul(this.ghost.HP, 100)), this.ghost.HT)) + '%';
    }
  }
  passiveBuff(): Artifact$ArtifactBuff {
    return new DriedRose$roseRecharge().$o(this)._DriedRose$roseRecharge();
  }
  charge(target: Hero, amount: number): void {
    if (this.cursed || target.buff($J.cls(MagicImmune)) != null) {
      return;
    }
    if (this.ghost == null) {
      if (this.charge_ < this.chargeCap_) {
        this.partialCharge = Math.fround(this.partialCharge + Math.fround(4 * amount));
        while (this.partialCharge >= 1) {
          this.charge_++;
          this.partialCharge--;
        }
        if (this.charge_ >= this.chargeCap_) {
          this.charge_ = this.chargeCap_;
          this.partialCharge = 0;
          GLog.p(Messages.get$Class$String$ObjectArr($J.cls(DriedRose), 'charged', []), []);
        }
        Item.updateQuickslot();
      }
    } else if (this.ghost.HP < this.ghost.HT) {
      let heal = $J.roundf(Math.fround((Math.fround(1 + Math.fround(this.level$() / 3))) * amount));
      this.ghost.HP = Math.min(this.ghost.HT, (this.ghost.HP + heal) | 0);
      if (this.ghost.sprite_ != null) {
        this.ghost.sprite_.showStatusWithIcon(CharSprite.POSITIVE, String(heal), FloatingText.HEALING, []);
      }
      Item.updateQuickslot();
    }
  }
  upgrade$(): Item {
    if (this.level$() >= 9) {
      this.image_ = ItemSpriteSheet.ARTIFACT_ROSE3;
    } else if (this.level$() >= 4) {
      this.image_ = ItemSpriteSheet.ARTIFACT_ROSE2;
    }
    this.droppedPetals = Math.max(this.level$(), this.droppedPetals);
    if (this.ghost != null) {
      this.ghost.updateRose();
      this.ghost.HP = Math.min((this.ghost.HP + 8) | 0, this.ghost.HT);
    }
    return super.upgrade$();
  }
  ghostWeapon(): Weapon {
    return this.weapon_;
  }
  ghostArmor(): Armor {
    return this.armor_;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$boolean(DriedRose.TALKEDTO, this.talkedTo);
    bundle.put$String$boolean(DriedRose.FIRSTSUMMON, this.firstSummon);
    bundle.put$String$int(DriedRose.GHOSTID, this.ghostID);
    bundle.put$String$int(DriedRose.PETALS, this.droppedPetals);
    if (this.weapon_ != null) {
      bundle.put$String$Bundlable(DriedRose.WEAPON, this.weapon_);
    }
    if (this.armor_ != null) {
      bundle.put$String$Bundlable(DriedRose.ARMOR, this.armor_);
    }
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.talkedTo = bundle.getBoolean(DriedRose.TALKEDTO);
    this.firstSummon = bundle.getBoolean(DriedRose.FIRSTSUMMON);
    this.ghostID = bundle.getInt(DriedRose.GHOSTID);
    this.droppedPetals = bundle.getInt(DriedRose.PETALS);
    if (bundle.contains(DriedRose.WEAPON)) {
      this.weapon_ = bundle.get$String(DriedRose.WEAPON);
    }
    if (bundle.contains(DriedRose.ARMOR)) {
      this.armor_ = bundle.get$String(DriedRose.ARMOR);
    }
  }
}

export class DriedRose$roseRecharge extends Artifact$ArtifactBuff {
  _DriedRose$roseRecharge(): this {
    this._Artifact$ArtifactBuff();
    return this;
  }
  act(): boolean {
    this.spend(Actor.TICK);
    if (this.$outer.ghost == null && this.$outer.ghostID !== 0) {
      this.$outer.findGhost();
    }
    if (this.$outer.ghost != null && !this.$outer.ghost.isAlive()) {
      this.$outer.ghost = null;
    }
    if (this.$outer.ghost != null && !this.$outer.cursed && this.target.buff($J.cls(MagicImmune)) == null) {
      if (this.$outer.ghost.HP < this.$outer.ghost.HT && Regeneration.regenOn()) {
        this.$outer.partialCharge = Math.fround(this.$outer.partialCharge + Math.fround((Math.fround(this.$outer.ghost.HT / 500)) * RingOfEnergy.artifactChargeMultiplier(this.target)));
        Item.updateQuickslot();
        while (this.$outer.partialCharge > Math.fround(1)) {
          this.$outer.ghost.HP++;
          this.$outer.partialCharge--;
          if (this.$outer.ghost.HP === this.$outer.ghost.HT) {
            this.$outer.partialCharge = 0;
          }
        }
      } else {
        this.$outer.partialCharge = 0;
      }
      return true;
    }
    if (this.$outer.charge_ < this.$outer.chargeCap_ && !this.$outer.cursed && this.target.buff($J.cls(MagicImmune)) == null && Regeneration.regenOn()) {
      this.$outer.partialCharge = Math.fround(this.$outer.partialCharge + (Math.fround(Math.fround(1 / 5) * RingOfEnergy.artifactChargeMultiplier(this.target))));
      while (this.$outer.partialCharge > Math.fround(1)) {
        this.$outer.charge_++;
        this.$outer.partialCharge--;
        if (this.$outer.charge_ === this.$outer.chargeCap_) {
          this.$outer.partialCharge = 0;
          GLog.p(Messages.get$Class$String$ObjectArr($J.cls(DriedRose), 'charged', []), []);
        }
      }
    } else if (this.$outer.cursed && Random.Int$int(100) === 0) {
      let spawnPoints = new ArrayList();
      for (let i = 0; i < PathFinder.NEIGHBOURS8.length; i++) {
        let p = (this.target.pos + PathFinder.NEIGHBOURS8[i]) | 0;
        if (Actor.findChar(p) == null && (Dungeon.level.passable[p] || Dungeon.level.avoid[p])) {
          spawnPoints.add(p);
        }
      }
      if (spawnPoints.size() > 0) {
        Wraith.spawnAt$int$Class(Random.element$Collection(spawnPoints), $J.cls(Wraith));
        Sample.INSTANCE.play$Object(Assets$Sounds.CURSED);
      }
    }
    Item.updateQuickslot();
    return true;
  }
}

export class DriedRose$Petal extends Item {
  _DriedRose$Petal(): this {
    this._Item();
    this.stackable = true;
    this.dropsDownHeap = true;
    this.image_ = ItemSpriteSheet.PETAL;
    return this;
  }
  doPickUp$Hero$int(hero: Hero, pos: number): boolean {
    Catalog.setSeen($J.getClass(this));
    Statistics.itemTypesDiscovered.add($J.getClass(this));
    let rose = hero.belongings.getItem($J.cls(DriedRose));
    if (rose == null) {
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'no_rose', []), []);
      return false;
    }
    if (rose.level$() >= rose.levelCap) {
      GLog.i(Messages.get$Object$String$ObjectArr(this, 'no_room', []), []);
      hero.spendAndNext(this.pickupDelay());
      return true;
    } else {
      rose.upgrade$();
      Catalog.countUse(rose.getClass());
      if (rose.level$() === rose.levelCap) {
        GLog.p(Messages.get$Object$String$ObjectArr(this, 'maxlevel', []), []);
      } else {
        GLog.i(Messages.get$Object$String$ObjectArr(this, 'levelup', []), []);
      }
      Sample.INSTANCE.play$Object(Assets$Sounds.DEWDROP);
      GameScene.pickUp(this, pos);
      hero.spendAndNext(this.pickupDelay());
      return true;
    }
  }
  isUpgradable(): boolean {
    return false;
  }
  isIdentified(): boolean {
    return true;
  }
}

export class DriedRose$GhostHero extends DirectableAlly {
  rose: DriedRose = null;
  $init_DriedRose_GhostHero() {
    this.spriteClass = $J.cls(GhostSprite);
    this.flying = true;
    this.state_ = this.HUNTING;
    this.properties_.add(Char$Property.UNDEAD);
    this.properties_.add(Char$Property.INORGANIC);
    this.rose = null;
    this.immunities_.add($J.cls(CorrosiveGas));
    this.immunities_.add($J.cls(Burning));
    this.immunities_.add($J.cls(ScrollOfRetribution));
    this.immunities_.add($J.cls(ScrollOfPsionicBlast));
    this.immunities_.add($J.cls(AllyBuff));
  }
  _DriedRose$GhostHero$(): this {
    this._DirectableAlly();
    this.$init_DriedRose_GhostHero();
    return this;
  }
  _DriedRose$GhostHero$DriedRose(rose: DriedRose): this {
    this._DirectableAlly();
    this.$init_DriedRose_GhostHero();
    this.rose = rose;
    this.updateRose();
    this.HP = this.HT;
    return this;
  }
  defendPos(cell: number): void {
    this.yell(Messages.get$Object$String$ObjectArr(this, 'directed_position_' + Random.IntRange(1, 5), []));
    super.defendPos(cell);
  }
  followHero(): void {
    this.yell(Messages.get$Object$String$ObjectArr(this, 'directed_follow_' + Random.IntRange(1, 5), []));
    super.followHero();
  }
  targetChar(ch: Char): void {
    this.yell(Messages.get$Object$String$ObjectArr(this, 'directed_attack_' + Random.IntRange(1, 5), []));
    super.targetChar(ch);
  }
  updateRose(): void {
    if (this.rose == null) {
      this.rose = Dungeon.hero.belongings.getItem($J.cls(DriedRose));
      if (this.rose != null) {
        this.rose.ghost = this;
        this.rose.ghostID = this.id();
      }
    }
    this.defenseSkill_ = ((Dungeon.hero.lvl + 4) | 0);
    if (this.rose == null) {
      return;
    }
    this.HT = (40 + Math.imul(10, this.rose.level$())) | 0;
  }
  weapon(): Weapon {
    if (this.rose != null) {
      return this.rose.weapon_;
    } else {
      return null;
    }
  }
  clearWeapon(): void {
    if (this.rose != null) {
      this.rose.weapon_ = null;
    }
  }
  armor(): Armor {
    if (this.rose != null) {
      return this.rose.armor_;
    } else {
      return null;
    }
  }
  act(): boolean {
    this.updateRose();
    if (this.rose == null || !this.rose.isEquipped(Dungeon.hero) || Dungeon.hero.buff($J.cls(MagicImmune)) != null) {
      this.damage(1, new DriedRose$GhostHero$NoRoseDamage()._DriedRose$GhostHero$NoRoseDamage());
    }
    if (!this.isAlive()) {
      return true;
    }
    return super.act();
  }
  attackSkill(target: Char): number {
    let acc = (Dungeon.hero.lvl + 9) | 0;
    if (this.weapon() != null) {
      acc = $J.d2i(Math.fround(acc * this.weapon().accuracyFactor(this, target)));
    }
    return acc;
  }
  attackDelay(): number {
    let delay = super.attackDelay();
    if (this.weapon() != null) {
      delay = Math.fround(delay * this.weapon().delayFactor(this));
    }
    return delay;
  }
  canAttack(enemy: Char): boolean {
    return super.canAttack(enemy) || (this.weapon() != null && this.weapon().canReach(this, enemy.pos));
  }
  damageRoll(): number {
    let dmg = 0;
    if (this.weapon() != null) {
      dmg = (dmg + this.weapon().damageRoll(this)) | 0;
      if (this.rose != null) {
        let excessStr = (this.rose.ghostStrength() - this.weapon().STRReq$()) | 0;
        if (excessStr > 0) {
          dmg = (dmg + Random.NormalIntRange(0, excessStr)) | 0;
        }
      }
    } else if (this.rose != null) {
      dmg = (dmg + (Random.NormalIntRange(1, (this.rose.ghostStrength() - 8) | 0))) | 0;
    }
    return dmg;
  }
  attackProc(enemy: Char, damage: number): number {
    damage = super.attackProc(enemy, damage);
    if (this.weapon() != null) {
      damage = this.weapon().proc(this, enemy, damage);
      if (!enemy.isAlive() && enemy === Dungeon.hero) {
        Dungeon.fail(this);
        GLog.n(Messages.capitalize(Messages.get$Class$String$ObjectArr($J.cls(Char), 'kill', [this.name()])), []);
      }
    }
    return damage;
  }
  defenseProc(enemy: Char, damage: number): number {
    if (this.armor() != null) {
      damage = this.armor().proc(enemy, this, damage);
    }
    return super.defenseProc(enemy, damage);
  }
  damage(dmg: number, src: any): void {
    super.damage(dmg, src);
    Item.updateQuickslot();
  }
  speed(): number {
    let speed = super.speed();
    if (this.state_ === this.WANDERING && this.defendingPos === -1 && Dungeon.level.distance(this.pos, Dungeon.hero.pos) > 1) {
      speed = Math.fround(speed * 2);
    }
    return speed;
  }
  defenseSkill(enemy: Char): number {
    let defense = super.defenseSkill(enemy);
    if (defense !== 0 && this.armor() != null) {
      defense = $J.roundf(this.armor().evasionFactor(this, Math.fround(defense)));
    }
    return defense;
  }
  drRoll(): number {
    let dr = super.drRoll();
    if (this.armor() != null) {
      dr = (dr + Random.NormalIntRange(this.armor().DRMin$(), this.armor().DRMax$())) | 0;
    }
    if (this.weapon() != null) {
      dr = (dr + Random.NormalIntRange(0, this.weapon().defenseFactor(this))) | 0;
    }
    return dr;
  }
  glyphLevel(cls: JClass<Armor$Glyph>): number {
    if (this.armor() != null && this.armor().hasGlyph(cls, this)) {
      return Math.max(super.glyphLevel(cls), this.armor().buffedLvl());
    } else {
      return super.glyphLevel(cls);
    }
  }
  interact(c: Char): boolean {
    this.updateRose();
    if (c === Dungeon.hero && this.rose != null && !this.rose.talkedTo) {
      this.rose.talkedTo = true;
      Game.runOnRenderThread(new (DriedRose$GhostHero$1())().$o(this));
      return true;
    } else {
      return super.interact(c);
    }
  }
  die(cause: any): void {
    this.sayDefeated();
    super.die(cause);
  }
  destroy(): void {
    this.updateRose();
    if (this.rose != null) {
      this.rose.ghost = null;
      this.rose.charge_ = 0;
      this.rose.partialCharge = 0;
      this.rose.ghostID = -1;
    }
    super.destroy();
  }
  sayAppeared(): void {
    if (Dungeon.hero.buff($J.cls(AscensionChallenge)) != null) {
      this.yell(Messages.get$Object$String$ObjectArr(this, 'dialogue_ascension_' + Random.IntRange(1, 6), []));
    } else {
      let depth = $J.idiv(((Dungeon.depth - 1) | 0), 5);
      let variant = Dungeon.depth % 5 === 1 ? Random.IntRange(1, 3) : Random.IntRange(1, 6);
      switch (depth) {
        case 0:
          this.yell(Messages.get$Object$String$ObjectArr(this, 'dialogue_sewers_' + variant, []));
          break;
        case 1:
          this.yell(Messages.get$Object$String$ObjectArr(this, 'dialogue_prison_' + variant, []));
          break;
        case 2:
          this.yell(Messages.get$Object$String$ObjectArr(this, 'dialogue_caves_' + variant, []));
          break;
        case 3:
          this.yell(Messages.get$Object$String$ObjectArr(this, 'dialogue_city_' + variant, []));
          break;
        case 4:
        default:
          this.yell(Messages.get$Object$String$ObjectArr(this, 'dialogue_halls_' + variant, []));
          break;
      }
    }
    if (Game.scene() instanceof GameScene) {
      Sample.INSTANCE.play$Object(Assets$Sounds.GHOST);
    }
  }
  sayBoss(): void {
    let depth = $J.idiv(((Dungeon.depth - 1) | 0), 5);
    switch (depth) {
      case 0:
        this.yell(Messages.get$Object$String$ObjectArr(this, 'seen_goo_' + Random.IntRange(1, 3), []));
        break;
      case 1:
        this.yell(Messages.get$Object$String$ObjectArr(this, 'seen_tengu_' + Random.IntRange(1, 3), []));
        break;
      case 2:
        this.yell(Messages.get$Object$String$ObjectArr(this, 'seen_dm300_' + Random.IntRange(1, 3), []));
        break;
      case 3:
        this.yell(Messages.get$Object$String$ObjectArr(this, 'seen_king_' + Random.IntRange(1, 3), []));
        break;
      case 4:
      default:
        this.yell(Messages.get$Object$String$ObjectArr(this, 'seen_yog_' + Random.IntRange(1, 3), []));
        break;
    }
    Sample.INSTANCE.play$Object(Assets$Sounds.GHOST);
  }
  sayDefeated(): void {
    if (BossHealthBar.isAssigned()) {
      this.yell(Messages.get$Object$String$ObjectArr(this, 'defeated_by_boss_' + Random.IntRange(1, 3), []));
    } else {
      this.yell(Messages.get$Object$String$ObjectArr(this, 'defeated_by_enemy_' + Random.IntRange(1, 3), []));
    }
    Sample.INSTANCE.play$Object(Assets$Sounds.GHOST);
  }
  sayHeroKilled(): void {
    this.yell(Messages.get$Object$String$ObjectArr(this, 'player_killed_' + Random.IntRange(1, 3), []));
    GLog.newLine();
    Sample.INSTANCE.play$Object(Assets$Sounds.GHOST);
  }
  sayAnhk(): void {
    this.yell(Messages.get$Object$String$ObjectArr(this, 'blessed_ankh_' + Random.IntRange(1, 3), []));
    Sample.INSTANCE.play$Object(Assets$Sounds.GHOST);
  }
}

export class DriedRose$GhostHero$NoRoseDamage extends JObject {
  _DriedRose$GhostHero$NoRoseDamage(): this {
    return this;
  }
}

export class DriedRose$WndGhostHero extends Window {
  static readonly BTN_SIZE: number = 32;
  static readonly GAP: number = 2;
  static readonly BTN_GAP: number = 12;
  static readonly WIDTH: number = 116;
  btnWeapon: ItemButton = null;
  btnArmor: ItemButton = null;
  _DriedRose$WndGhostHero(rose: DriedRose): this {
    this._Window$();
    let titlebar = new IconTitle()._IconTitle$();
    titlebar.icon(new ItemSprite()._ItemSprite$Item(rose));
    titlebar.label$String(Messages.get$Object$String$ObjectArr(this, 'title', []));
    titlebar.setRect(0, 0, Math.fround(DriedRose$WndGhostHero.WIDTH), 0);
    this.add$Gizmo(titlebar);
    let message = PixelScene.renderTextBlock$String$int(Messages.get$Object$String$ObjectArr(this, 'desc', [rose.ghostStrength()]), 6);
    message.maxWidth$int(DriedRose$WndGhostHero.WIDTH);
    message.setPos(0, Math.fround(titlebar.bottom() + DriedRose$WndGhostHero.GAP));
    this.add$Gizmo(message);
    this.btnWeapon = new (DriedRose$WndGhostHero$1())().$o(this).$c(rose)._ItemButton();
    this.btnWeapon.setRect(Math.fround(Math.fround((Math.fround(DriedRose$WndGhostHero.WIDTH - DriedRose$WndGhostHero.BTN_GAP)) / 2) - DriedRose$WndGhostHero.BTN_SIZE), Math.fround(Math.fround(message.top() + message.height()) + DriedRose$WndGhostHero.GAP), Math.fround(DriedRose$WndGhostHero.BTN_SIZE), Math.fround(DriedRose$WndGhostHero.BTN_SIZE));
    if (rose.weapon_ != null) {
      this.btnWeapon.item$Item(rose.weapon_);
    } else {
      this.btnWeapon.item$Item(new WndBag$Placeholder()._WndBag$Placeholder(ItemSpriteSheet.WEAPON_HOLDER));
    }
    this.add$Gizmo(this.btnWeapon);
    this.btnArmor = new (DriedRose$WndGhostHero$2())().$o(this).$c(rose)._ItemButton();
    this.btnArmor.setRect(Math.fround(this.btnWeapon.right() + DriedRose$WndGhostHero.BTN_GAP), this.btnWeapon.top(), Math.fround(DriedRose$WndGhostHero.BTN_SIZE), Math.fround(DriedRose$WndGhostHero.BTN_SIZE));
    if (rose.armor_ != null) {
      this.btnArmor.item$Item(rose.armor_);
    } else {
      this.btnArmor.item$Item(new WndBag$Placeholder()._WndBag$Placeholder(ItemSpriteSheet.ARMOR_HOLDER));
    }
    this.add$Gizmo(this.btnArmor);
    this.resize(DriedRose$WndGhostHero.WIDTH, $J.d2i((Math.fround(this.btnArmor.bottom() + DriedRose$WndGhostHero.GAP))));
    return this;
  }
}

let $DriedRose$1: any = null;
/** An anonymous class (DriedRose.java:473). */
function DriedRose$1(): any {
  return $DriedRose$1 ??= $J.local(class extends CellSelector$Listener {
    onSelect(cell: number): void {
      if (cell == null) {
        return;
      }
      Sample.INSTANCE.play$Object(Assets$Sounds.GHOST);
      this.$outer.ghost.directTocell(cell);
    }
    prompt(): string {
      return '"' + Messages.get$Class$String$ObjectArr($J.cls(DriedRose$GhostHero), 'direct_prompt', []) + '"';
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.DriedRose$1', []);
}

let $DriedRose$GhostHero$1: any = null;
/** An anonymous class (DriedRose.java:760). */
function DriedRose$GhostHero$1(): any {
  return $DriedRose$GhostHero$1 ??= $J.local(class extends JObject {
    call(): void {
      GameScene.show(new WndQuest()._WndQuest(this.$outer, Messages.get$Object$String$ObjectArr(this.$outer, 'introduce', [])));
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.DriedRose$GhostHero$1', ['com.watabou.utils.Callback']);
}

let $DriedRose$WndGhostHero$1$1: any = null;
/** An anonymous class (DriedRose.java:913). */
function DriedRose$WndGhostHero$1$1(): any {
  return $DriedRose$WndGhostHero$1$1 ??= $J.local(class extends WndBag$ItemSelector {
    textPrompt(): string {
      return Messages.get$Class$String$ObjectArr($J.cls(DriedRose$WndGhostHero), 'weapon_prompt', []);
    }
    preferredBag(): JClass<Bag> {
      return $J.cls(Belongings$Backpack);
    }
    itemSelectable(item: Item): boolean {
      return item instanceof MeleeWeapon;
    }
    onSelect(item: Item): void {
      if (!(item instanceof MeleeWeapon)) {
      } else if (item.unique) {
        GLog.w(Messages.get$Class$String$ObjectArr($J.cls(DriedRose$WndGhostHero), 'cant_unique', []), []);
        this.$outer.$outer.hide();
      } else if (item.cursed || !item.cursedKnown) {
        GLog.w(Messages.get$Class$String$ObjectArr($J.cls(DriedRose$WndGhostHero), 'cant_cursed', []), []);
        this.$outer.$outer.hide();
      } else if (!item.levelKnown && (item).STRReq$int(0) > this.$cv_rose.ghostStrength()) {
        GLog.w(Messages.get$Class$String$ObjectArr($J.cls(DriedRose$WndGhostHero), 'cant_strength_unknown', []), []);
        this.$outer.$outer.hide();
      } else if ((item).STRReq$() > this.$cv_rose.ghostStrength()) {
        GLog.w(Messages.get$Class$String$ObjectArr($J.cls(DriedRose$WndGhostHero), 'cant_strength', []), []);
        this.$outer.$outer.hide();
      } else {
        if (item.isEquipped(Dungeon.hero)) {
          (item).doUnequip$Hero$boolean$boolean(Dungeon.hero, false, false);
        } else {
          item.detach(Dungeon.hero.belongings.backpack);
        }
        this.$cv_rose.weapon_ = item;
        this.$outer.item$Item(this.$cv_rose.weapon_);
      }
    }
    $c($rose): this {
      this.$cv_rose = $rose;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.DriedRose$WndGhostHero$1$1', []);
}

let $DriedRose$WndGhostHero$1: any = null;
/** An anonymous class (DriedRose.java:903). */
function DriedRose$WndGhostHero$1(): any {
  return $DriedRose$WndGhostHero$1 ??= $J.local(class extends ItemButton {
    onClick(): void {
      if (this.$cv_rose.weapon_ != null) {
        this.item$Item(new WndBag$Placeholder()._WndBag$Placeholder(ItemSpriteSheet.WEAPON_HOLDER));
        if (!this.$cv_rose.weapon_.doPickUp$Hero(Dungeon.hero)) {
          Dungeon.level.drop(this.$cv_rose.weapon_, Dungeon.hero.pos);
        }
        this.$cv_rose.weapon_ = null;
      } else {
        GameScene.selectItem(new (DriedRose$WndGhostHero$1$1())().$o(this).$c(this.$cv_rose)._WndBag$ItemSelector());
      }
    }
    onLongClick(): boolean {
      if (this.item$() != null && this.item$().name() != null) {
        GameScene.show(new WndInfoItem()._WndInfoItem$Item(this.item$()));
        return true;
      }
      return false;
    }
    $c($rose): this {
      this.$cv_rose = $rose;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.DriedRose$WndGhostHero$1', []);
}

let $DriedRose$WndGhostHero$2$1: any = null;
/** An anonymous class (DriedRose.java:988). */
function DriedRose$WndGhostHero$2$1(): any {
  return $DriedRose$WndGhostHero$2$1 ??= $J.local(class extends WndBag$ItemSelector {
    textPrompt(): string {
      return Messages.get$Class$String$ObjectArr($J.cls(DriedRose$WndGhostHero), 'armor_prompt', []);
    }
    preferredBag(): JClass<Bag> {
      return $J.cls(Belongings$Backpack);
    }
    itemSelectable(item: Item): boolean {
      return item instanceof Armor;
    }
    onSelect(item: Item): void {
      if (!(item instanceof Armor)) {
      } else if (item.unique || (item).checkSeal() != null) {
        GLog.w(Messages.get$Class$String$ObjectArr($J.cls(DriedRose$WndGhostHero), 'cant_unique', []), []);
        this.$outer.$outer.hide();
      } else if (item.cursed || !item.cursedKnown) {
        GLog.w(Messages.get$Class$String$ObjectArr($J.cls(DriedRose$WndGhostHero), 'cant_cursed', []), []);
        this.$outer.$outer.hide();
      } else if (!item.levelKnown && (item).STRReq$int(0) > this.$cv_rose.ghostStrength()) {
        GLog.w(Messages.get$Class$String$ObjectArr($J.cls(DriedRose$WndGhostHero), 'cant_strength_unknown', []), []);
        this.$outer.$outer.hide();
      } else if ((item).STRReq$() > this.$cv_rose.ghostStrength()) {
        GLog.w(Messages.get$Class$String$ObjectArr($J.cls(DriedRose$WndGhostHero), 'cant_strength', []), []);
        this.$outer.$outer.hide();
      } else {
        if (item.isEquipped(Dungeon.hero)) {
          (item).doUnequip$Hero$boolean$boolean(Dungeon.hero, false, false);
        } else {
          item.detach(Dungeon.hero.belongings.backpack);
        }
        this.$cv_rose.armor_ = item;
        this.$outer.item$Item(this.$cv_rose.armor_);
      }
    }
    $c($rose): this {
      this.$cv_rose = $rose;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.DriedRose$WndGhostHero$2$1', []);
}

let $DriedRose$WndGhostHero$2: any = null;
/** An anonymous class (DriedRose.java:978). */
function DriedRose$WndGhostHero$2(): any {
  return $DriedRose$WndGhostHero$2 ??= $J.local(class extends ItemButton {
    onClick(): void {
      if (this.$cv_rose.armor_ != null) {
        this.item$Item(new WndBag$Placeholder()._WndBag$Placeholder(ItemSpriteSheet.ARMOR_HOLDER));
        if (!this.$cv_rose.armor_.doPickUp$Hero(Dungeon.hero)) {
          Dungeon.level.drop(this.$cv_rose.armor_, Dungeon.hero.pos);
        }
        this.$cv_rose.armor_ = null;
      } else {
        GameScene.selectItem(new (DriedRose$WndGhostHero$2$1())().$o(this).$c(this.$cv_rose)._WndBag$ItemSelector());
      }
    }
    onLongClick(): boolean {
      if (this.item$() != null && this.item$().name() != null) {
        GameScene.show(new WndInfoItem()._WndInfoItem$Item(this.item$()));
        return true;
      }
      return false;
    }
    $c($rose): this {
      this.$cv_rose = $rose;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.DriedRose$WndGhostHero$2', []);
}

$J.define(DriedRose, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.DriedRose', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.Artifact', ctors: { '': '_DriedRose' }, meths: { 'upgrade()': 'upgrade$', 'execute(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,java.lang.String)': 'execute$Hero$String' } });
$J.define(DriedRose$roseRecharge, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.DriedRose$roseRecharge', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.Artifact$ArtifactBuff', ctors: { '': '_DriedRose$roseRecharge' }, inner: true });
$J.define(DriedRose$Petal, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.DriedRose$Petal', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Item', ctors: { '': '_DriedRose$Petal' }, meths: { 'doPickUp(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,int)': 'doPickUp$Hero$int' } });
$J.define(DriedRose$GhostHero, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.DriedRose$GhostHero', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.DirectableAlly', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.DriedRose': '_DriedRose$GhostHero$DriedRose', '': '_DriedRose$GhostHero$' } });
$J.define(DriedRose$GhostHero$NoRoseDamage, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.DriedRose$GhostHero$NoRoseDamage', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_DriedRose$GhostHero$NoRoseDamage' } });
$J.define(DriedRose$WndGhostHero, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.DriedRose$WndGhostHero', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.Window', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.DriedRose': '_DriedRose$WndGhostHero' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  CorrosiveGas = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.CorrosiveGas');
  AllyBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.AllyBuff');
  AscensionChallenge = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.AscensionChallenge');
  Burning = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Burning');
  Invisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invisibility');
  MagicImmune = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MagicImmune');
  Regeneration = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Regeneration');
  Belongings$Backpack = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Belongings$Backpack');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Stasis = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.Stasis');
  Wraith = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Wraith');
  Ghost$Quest = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Ghost$Quest');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  FloatingText = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.FloatingText');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  ShaftParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.ShaftParticle');
  Armor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor');
  RingOfEnergy = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfEnergy');
  ScrollOfRetribution = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfRetribution');
  ScrollOfPsionicBlast = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ScrollOfPsionicBlast');
  MeleeWeapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.MeleeWeapon');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  VaultLevel = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.VaultLevel');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  AlchemyScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.AlchemyScene');
  CellSelector$Listener = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.CellSelector$Listener');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  GhostSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.GhostSprite');
  ItemSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  BossHealthBar = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BossHealthBar');
  ItemButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.ItemButton');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  IconTitle = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.IconTitle');
  WndBag$ItemSelector = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndBag$ItemSelector');
  WndBag$Placeholder = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndBag$Placeholder');
  WndInfoItem = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndInfoItem');
  WndQuest = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndQuest');
  WndUseItem = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndUseItem');
  Game = $J.load('com.watabou.noosa.Game');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
