// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/artifacts/UnstableSpellbook.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, JObject } from '../../../../../../jre/index.ts';
import { Artifact } from './Artifact.ts';
import { Buff } from '../../actors/buffs/Buff.ts';
import { Artifact$ArtifactBuff } from './Artifact.ts';

let Assets$Sounds, Dungeon, Actor, Blindness, MagicImmune, Regeneration, Talent, ElmoParticle, Generator, Generator$Category, Item, ScrollHolder, RingOfEnergy, Scroll, ScrollOfIdentify, ScrollOfLullaby, ScrollOfMagicMapping, ScrollOfRage, ScrollOfRemoveCurse, ScrollOfRetribution, ScrollOfTerror, ScrollOfTransmutation, ExoticScroll, Catalog, Messages, GameScene, ItemSprite, ItemSpriteSheet, GLog, WndBag$ItemSelector, WndOptions, Game, Sample, Random, Reflection;

export class UnstableSpellbook extends Artifact {
  static readonly AC_READ: string = 'READ';
  static readonly AC_ADD: string = 'ADD';
  scrolls: ArrayList<JClass> = null;
  static readonly SCROLLS: string = 'scrolls';
  itemSelector: WndBag$ItemSelector = null;
  _UnstableSpellbook(): this {
    this._Artifact();
    this.image_ = ItemSpriteSheet.ARTIFACT_SPELLBOOK;
    this.levelCap = 10;
    this.charge_ = ($J.d2i((Math.fround(this.level$() * Math.fround(0.6)))) + 2) | 0;
    this.partialCharge = 0;
    this.chargeCap_ = ($J.d2i((Math.fround(this.level$() * Math.fround(0.6)))) + 2) | 0;
    this.defaultAction_ = UnstableSpellbook.AC_READ;
    this.scrolls = new ArrayList();
    this.itemSelector = new (UnstableSpellbook$2())().$o(this)._WndBag$ItemSelector();
    this.setupScrolls();
    return this;
  }
  setupScrolls(): void {
    this.scrolls.clear();
    let scrollClasses = Generator$Category.SCROLL.classes;
    let probs = Generator$Category.SCROLL.defaultProbsTotal.slice();
    let i = Random.chances$floatArr(probs);
    while (i !== -1) {
      this.scrolls.add(scrollClasses[i]);
      probs[i] = 0;
      i = Random.chances$floatArr(probs);
    }
    this.scrolls.remove($J.cls(ScrollOfTransmutation));
  }
  actions(hero: Hero): ArrayList<string> {
    let actions = super.actions(hero);
    if (this.isEquipped(hero) && this.charge_ > 0 && !this.cursed && hero.buff($J.cls(MagicImmune)) == null) {
      actions.add(UnstableSpellbook.AC_READ);
    }
    if (this.isEquipped(hero) && this.level$() < this.levelCap && !this.cursed && hero.buff($J.cls(MagicImmune)) == null) {
      actions.add(UnstableSpellbook.AC_ADD);
    }
    return actions;
  }
  execute$Hero$String(hero: Hero, action: string): void {
    super.execute$Hero$String(hero, action);
    if (hero.buff($J.cls(MagicImmune)) != null) {
      return;
    }
    if ($J.equals(action, UnstableSpellbook.AC_READ)) {
      if (hero.buff($J.cls(Blindness)) != null) {
        GLog.w(Messages.get$Object$String$ObjectArr(this, 'blinded', []), []);
      } else if (!this.isEquipped(hero)) {
        GLog.i(Messages.get$Class$String$ObjectArr($J.cls(Artifact), 'need_to_equip', []), []);
      } else if (this.charge_ <= 0) {
        GLog.i(Messages.get$Object$String$ObjectArr(this, 'no_charge', []), []);
      } else if (this.cursed) {
        GLog.i(Messages.get$Object$String$ObjectArr(this, 'cursed', []), []);
      } else {
        this.doReadEffect(hero);
      }
    } else if ($J.equals(action, UnstableSpellbook.AC_ADD)) {
      GameScene.selectItem(this.itemSelector);
    }
  }
  doReadEffect(hero: Hero): void {
    this.charge_--;
    let scroll: Scroll;
    do {
      scroll = Generator.randomUsingDefaults$Category(Generator$Category.SCROLL);
    } while (scroll == null || ((scroll instanceof ScrollOfIdentify || scroll instanceof ScrollOfRemoveCurse || scroll instanceof ScrollOfMagicMapping) && Random.Int$int(2) === 0) || (scroll instanceof ScrollOfTransmutation));
    scroll.anonymize();
    scroll.talentChance = 0;
    Item.curItem = scroll;
    Item.curUser = hero;
    if (this.charge_ > 0 && !this.scrolls.contains(scroll.getClass())) {
      let fScroll = scroll;
      let handler = Buff.affect$Char$Class(hero, $J.cls(UnstableSpellbook$ExploitHandler));
      handler.scroll_ = scroll;
      GameScene.show(new (UnstableSpellbook$1())().$o(this).$c(handler, fScroll)._WndOptions$Image$String$String$StringArr(new ItemSprite()._ItemSprite$Item(this), Messages.get$Object$String$ObjectArr(this, 'prompt', []), Messages.get$Object$String$ObjectArr(this, 'read_empowered', []), [scroll.trueName(), Messages.get$Class$String$ObjectArr(ExoticScroll.regToExo.get(scroll.getClass()), 'name', [])]));
    } else {
      this.checkForArtifactProc(Item.curUser, scroll);
      scroll.doRead();
      Talent.onArtifactUsed(Dungeon.hero);
    }
    Item.updateQuickslot();
  }
  checkForArtifactProc(user: Hero, scroll: Scroll): void {
    if (scroll instanceof ScrollOfLullaby || scroll instanceof ScrollOfRetribution || scroll instanceof ScrollOfTerror) {
      for (let mob of $J.toArrayInto(Dungeon.level.mobs.toArray(), $J.newArray(0, null))) {
        if (Dungeon.level.heroFOV[mob.pos]) {
          Artifact.artifactProc(mob, this.visiblyUpgraded(), 1);
        }
      }
    } else if (scroll instanceof ScrollOfRage) {
      for (let mob of $J.toArrayInto(Dungeon.level.mobs.toArray(), $J.newArray(0, null))) {
        Artifact.artifactProc(mob, this.visiblyUpgraded(), 1);
      }
    }
  }
  passiveBuff(): Artifact$ArtifactBuff {
    return new UnstableSpellbook$bookRecharge().$o(this)._UnstableSpellbook$bookRecharge();
  }
  charge(target: Hero, amount: number): void {
    if (this.charge_ < this.chargeCap_ && !this.cursed && target.buff($J.cls(MagicImmune)) == null) {
      this.partialCharge = Math.fround(this.partialCharge + Math.fround(Math.fround(0.1) * amount));
      while (this.partialCharge >= Math.fround(1)) {
        this.partialCharge--;
        this.charge_++;
      }
      if (this.charge_ >= this.chargeCap_) {
        this.partialCharge = 0;
      }
      Item.updateQuickslot();
    }
  }
  upgrade$(): Item {
    this.chargeCap_ = ($J.d2i((Math.fround(((this.level$() + 1) | 0) * Math.fround(0.6)))) + 2) | 0;
    while (!this.scrolls.isEmpty() && this.scrolls.size() > ((this.levelCap - 1 - this.level$()) | 0)) {
      this.scrolls.removeAt(0);
    }
    return super.upgrade$();
  }
  resetForTrinity(visibleLevel: number): void {
    super.resetForTrinity(visibleLevel);
    this.setupScrolls();
    while (!this.scrolls.isEmpty() && this.scrolls.size() > ((this.levelCap - 1 - this.level$()) | 0)) {
      this.scrolls.removeAt(0);
    }
  }
  desc(): string {
    let desc = super.desc();
    if (this.isEquipped(Dungeon.hero)) {
      if (this.cursed) {
        desc += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'desc_cursed', []);
      }
      if (this.level$() < this.levelCap && this.scrolls.size() > 0) {
        desc += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'desc_index', []);
        desc += '\n_' + Messages.get$Class$String$ObjectArr(this.scrolls.get(0), 'name', []) + '_';
        if (this.scrolls.size() > 1) {
          desc += '\n_' + Messages.get$Class$String$ObjectArr(this.scrolls.get(1), 'name', []) + '_';
        }
      }
    }
    if (this.level$() > 0) {
      desc += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'desc_empowered', []);
    }
    return desc;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$ClassArr(UnstableSpellbook.SCROLLS, $J.toArrayInto(this.scrolls.toArray(), $J.newArray(this.scrolls.size(), null)));
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.scrolls.clear();
    if (bundle.contains(UnstableSpellbook.SCROLLS) && bundle.getClassArray(UnstableSpellbook.SCROLLS) != null) {
      for (let scroll of bundle.getClassArray(UnstableSpellbook.SCROLLS)) {
        if (scroll != null) {
          this.scrolls.add(scroll);
        }
      }
    }
  }
}

export class UnstableSpellbook$ExploitHandler extends Buff {
  scroll_: Scroll = null;
  _UnstableSpellbook$ExploitHandler(): this {
    this._Buff();
    this.actPriority = Actor.VFX_PRIO;
    return this;
  }
  act(): boolean {
    Item.curUser = Dungeon.hero;
    Item.curItem = this.scroll_;
    this.scroll_.anonymize();
    this.scroll_.talentChance = 0;
    Game.runOnRenderThread(new (UnstableSpellbook$ExploitHandler$1())().$o(this));
    this.detach();
    return true;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$Bundlable('scroll', this.scroll_);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.scroll_ = bundle.get$String('scroll');
  }
}

export class UnstableSpellbook$bookRecharge extends Artifact$ArtifactBuff {
  _UnstableSpellbook$bookRecharge(): this {
    this._Artifact$ArtifactBuff();
    return this;
  }
  act(): boolean {
    if (this.$outer.charge_ < this.$outer.chargeCap_ && !this.$outer.cursed && this.target.buff($J.cls(MagicImmune)) == null && Regeneration.regenOn()) {
      let chargeGain = Math.fround(1 / (Math.fround(120 - Math.fround(((this.$outer.chargeCap_ - this.$outer.charge_) | 0) * 5))));
      chargeGain = Math.fround(chargeGain * RingOfEnergy.artifactChargeMultiplier(this.target));
      this.$outer.partialCharge = Math.fround(this.$outer.partialCharge + chargeGain);
      while (this.$outer.partialCharge >= Math.fround(1)) {
        this.$outer.partialCharge--;
        this.$outer.charge_++;
        if (this.$outer.charge_ === this.$outer.chargeCap_) {
          this.$outer.partialCharge = 0;
        }
      }
    }
    Item.updateQuickslot();
    this.spend(Actor.TICK);
    return true;
  }
}

let $UnstableSpellbook$2: any = null;
/** An anonymous class (UnstableSpellbook.java:373). */
function UnstableSpellbook$2(): any {
  return $UnstableSpellbook$2 ??= $J.local(class extends WndBag$ItemSelector {
    textPrompt(): string {
      return Messages.get$Class$String$ObjectArr($J.cls(UnstableSpellbook), 'prompt', []);
    }
    preferredBag(): JClass<Bag> {
      return $J.cls(ScrollHolder);
    }
    itemSelectable(item: Item): boolean {
      return item instanceof Scroll && item.isIdentified() && this.$outer.scrolls.contains(item.getClass());
    }
    onSelect(item: Item): void {
      if (item != null && item instanceof Scroll && item.isIdentified()) {
        let hero = Dungeon.hero;
        for (let i = 0; (i <= 1 && i < this.$outer.scrolls.size()); i++) {
          if ($J.equals(this.$outer.scrolls.get(i), item.getClass())) {
            hero.sprite_.operate$int(hero.pos);
            hero.busy();
            hero.spend(2);
            Sample.INSTANCE.play$Object(Assets$Sounds.BURNING);
            hero.sprite_.emitter().burst(ElmoParticle.FACTORY, 12);
            this.$outer.scrolls.removeAt(i);
            item.detach(hero.belongings.backpack);
            this.$outer.upgrade$();
            Catalog.countUse($J.cls(UnstableSpellbook));
            GLog.i(Messages.get$Class$String$ObjectArr($J.cls(UnstableSpellbook), 'infuse_scroll', []), []);
            return;
          }
        }
        GLog.w(Messages.get$Class$String$ObjectArr($J.cls(UnstableSpellbook), 'unable_scroll', []), []);
      } else if (item instanceof Scroll && !item.isIdentified()) {
        GLog.w(Messages.get$Class$String$ObjectArr($J.cls(UnstableSpellbook), 'unknown_scroll', []), []);
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.UnstableSpellbook$2', []);
}

let $UnstableSpellbook$1: any = null;
/** An anonymous class (UnstableSpellbook.java:171). */
function UnstableSpellbook$1(): any {
  return $UnstableSpellbook$1 ??= $J.local(class extends WndOptions {
    onSelect(index: number): void {
      this.$cv_handler.detach();
      if (index === 1) {
        let scroll = Reflection.newInstance(ExoticScroll.regToExo.get(this.$cv_fScroll.getClass()));
        Item.curItem = scroll;
        this.$outer.charge_--;
        scroll.anonymize();
        scroll.talentChance = 0;
        this.$outer.checkForArtifactProc(Item.curUser, scroll);
        scroll.doRead();
        Talent.onArtifactUsed(Dungeon.hero);
      } else {
        this.$outer.checkForArtifactProc(Item.curUser, this.$cv_fScroll);
        this.$cv_fScroll.doRead();
        Talent.onArtifactUsed(Dungeon.hero);
      }
      Item.updateQuickslot();
    }
    onBackPressed(): void {
    }
    $c($handler, $fScroll): this {
      this.$cv_handler = $handler; this.$cv_fScroll = $fScroll;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.UnstableSpellbook$1', []);
}

let $UnstableSpellbook$ExploitHandler$1: any = null;
/** An anonymous class (UnstableSpellbook.java:235). */
function UnstableSpellbook$ExploitHandler$1(): any {
  return $UnstableSpellbook$ExploitHandler$1 ??= $J.local(class extends JObject {
    call(): void {
      this.$outer.scroll_.doRead();
      Item.updateQuickslot();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.UnstableSpellbook$ExploitHandler$1', ['com.watabou.utils.Callback']);
}

$J.define(UnstableSpellbook, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.UnstableSpellbook', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.Artifact', ctors: { '': '_UnstableSpellbook' }, meths: { 'upgrade()': 'upgrade$', 'execute(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,java.lang.String)': 'execute$Hero$String' } });
$J.define(UnstableSpellbook$ExploitHandler, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.UnstableSpellbook$ExploitHandler', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_UnstableSpellbook$ExploitHandler' } });
$J.define(UnstableSpellbook$bookRecharge, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.UnstableSpellbook$bookRecharge', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.Artifact$ArtifactBuff', ctors: { '': '_UnstableSpellbook$bookRecharge' }, inner: true });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Blindness = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Blindness');
  MagicImmune = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MagicImmune');
  Regeneration = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Regeneration');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  ElmoParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.ElmoParticle');
  Generator = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator');
  Generator$Category = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator$Category');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  ScrollHolder = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bags.ScrollHolder');
  RingOfEnergy = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfEnergy');
  Scroll = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.Scroll');
  ScrollOfIdentify = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfIdentify');
  ScrollOfLullaby = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfLullaby');
  ScrollOfMagicMapping = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfMagicMapping');
  ScrollOfRage = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfRage');
  ScrollOfRemoveCurse = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfRemoveCurse');
  ScrollOfRetribution = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfRetribution');
  ScrollOfTerror = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfTerror');
  ScrollOfTransmutation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfTransmutation');
  ExoticScroll = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ExoticScroll');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ItemSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  WndBag$ItemSelector = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndBag$ItemSelector');
  WndOptions = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndOptions');
  Game = $J.load('com.watabou.noosa.Game');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  Random = $J.load('com.watabou.utils.Random');
  Reflection = $J.load('com.watabou.utils.Reflection');
});
