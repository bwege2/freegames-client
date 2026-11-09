// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/wands/WandOfTransfusion.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { DamageWand } from './DamageWand.ts';

let Assets$Sounds, Badges, Dungeon, Actor, Char$Alignment, Char$Property, Barrier, Buff, Charm, Mimic, Mob, Beam$HealthRay, CellEmitter, FloatingText, Speck, BloodParticle, ShadowParticle, Item, Wand, Ballistica, Messages, CharSprite, ItemSpriteSheet, DungeonTilemap, GLog, Sample, PointF, Random;

export class WandOfTransfusion extends DamageWand {
  freeCharge: boolean = false;
  static readonly FREECHARGE: string = 'freecharge';
  _WandOfTransfusion(): this {
    this._DamageWand();
    this.image_ = ItemSpriteSheet.WAND_TRANSFUSION;
    this.collisionProperties_ = Ballistica.PROJECTILE;
    this.freeCharge = false;
    return this;
  }
  min$int(level: number): number {
    return (3 + level) | 0;
  }
  max$int(level: number): number {
    return (6 + Math.imul(2, level)) | 0;
  }
  onZap(beam: Ballistica): void {
    for (const $it0 = beam.subPath(0, beam.dist).iterator(); $it0.hasNext(); ) {
      let c = $it0.next();
      CellEmitter.center(c).burst(BloodParticle.BURST, 1);
    }
    let cell = beam.collisionPos;
    let ch = Actor.findChar(cell);
    if (ch instanceof Mob) {
      this.wandProc(ch, this.chargesPerCast());
      if (ch.alignment === Char$Alignment.ALLY || ch.buff($J.cls(Charm)) != null) {
        let selfDmg = $J.roundf(Math.fround(Item.curUser.HT * Math.fround(0.05)));
        let healing = (selfDmg + Math.imul(3, this.buffedLvl())) | 0;
        let shielding = (ch.HP + healing - ch.HT) | 0;
        if (shielding > 0) {
          healing = (healing - shielding) | 0;
          Buff.affect$Char$Class(ch, $J.cls(Barrier)).setShield(shielding);
        } else {
          shielding = 0;
        }
        ch.HP = (ch.HP + healing) | 0;
        ch.sprite_.emitter().burst(Speck.factory$int(Speck.HEALING), (2 + $J.idiv(this.buffedLvl(), 2)) | 0);
        if (healing > 0) {
          ch.sprite_.showStatusWithIcon(CharSprite.POSITIVE, String(healing), FloatingText.HEALING, []);
        }
        if (shielding > 0) {
          ch.sprite_.showStatusWithIcon(CharSprite.POSITIVE, String(shielding), FloatingText.SHIELDING, []);
        }
        if (!this.freeCharge) {
          this.damageHero(selfDmg);
        } else {
          this.freeCharge = false;
        }
      } else if (ch.alignment === Char$Alignment.ENEMY || ch instanceof Mimic) {
        Buff.affect$Char$Class(Item.curUser, $J.cls(Barrier)).setShield(((5 + this.buffedLvl()) | 0));
        Item.curUser.sprite_.showStatusWithIcon(CharSprite.POSITIVE, String((5 + this.buffedLvl()) | 0), FloatingText.SHIELDING, []);
        if (!ch.properties().contains(Char$Property.UNDEAD)) {
          let charm = Buff.affect$Char$Class$float(ch, $J.cls(Charm), Math.fround(Charm.DURATION / 2));
          charm.object = Item.curUser.id();
          charm.ignoreHeroAllies = true;
          ch.sprite_.centerEmitter().start(Speck.factory$int(Speck.HEART), Math.fround(0.2), 3);
        } else {
          ch.damage(this.damageRoll$(), this);
          ch.sprite_.emitter().start(ShadowParticle.UP, Math.fround(0.05), (10 + this.buffedLvl()) | 0);
          Sample.INSTANCE.play$Object(Assets$Sounds.BURNING);
        }
      }
    }
  }
  damageHero(damage: number): void {
    Item.curUser.damage(damage, this);
    if (!Item.curUser.isAlive()) {
      Badges.validateDeathFromFriendlyMagic();
      Dungeon.fail(this);
      GLog.n(Messages.get$Object$String$ObjectArr(this, 'ondeath', []), []);
    }
  }
  onHit(staff: MagesStaff, attacker: Char, defender: Char, damage: number): void {
    if (defender.buff($J.cls(Charm)) != null && defender.buff($J.cls(Charm)).object === attacker.id()) {
      this.freeCharge = true;
      let shieldToGive = $J.roundf(Math.fround((Math.imul(2, ((5 + this.buffedLvl()) | 0))) * Wand.procChanceMultiplier(attacker)));
      Buff.affect$Char$Class(attacker, $J.cls(Barrier)).setShield(shieldToGive);
      attacker.sprite_.showStatusWithIcon(CharSprite.POSITIVE, String(shieldToGive), FloatingText.SHIELDING, []);
      GLog.p(Messages.get$Object$String$ObjectArr(this, 'charged', []), []);
      attacker.sprite_.emitter().burst(BloodParticle.BURST, 20);
    }
  }
  fx(beam: Ballistica, callback: Callback): void {
    Item.curUser.sprite_.parent.add$Gizmo(new Beam$HealthRay()._Beam$HealthRay(Item.curUser.sprite_.center$(), DungeonTilemap.raisedTileCenterToWorld(beam.collisionPos)));
    Sample.INSTANCE.play$Object(Assets$Sounds.RAY);
    callback.call();
  }
  staffFx(particle: MagesStaff$StaffParticle): void {
    particle.color$int(13369344);
    particle.am = Math.fround(0.6);
    particle.setLifespan(1);
    particle.speed_.polar(Random.Float$float(PointF.PI2), 2);
    particle.setSize(1, 2);
    particle.radiateXY(0.5);
  }
  statsDesc(): string {
    let selfDMG = Dungeon.hero != null ? $J.roundf(Math.fround(Dungeon.hero.HT * Math.fround(0.05))) : 1;
    if (this.levelKnown) {
      return Messages.get$Object$String$ObjectArr(this, 'stats_desc', [selfDMG, (selfDMG + Math.imul(3, this.buffedLvl())) | 0, (5 + this.buffedLvl()) | 0, this.min$(), this.max$()]);
    } else {
      return Messages.get$Object$String$ObjectArr(this, 'stats_desc', [selfDMG, selfDMG, 5, this.min$int(0), this.max$int(0)]);
    }
  }
  upgradeStat1(level: number): string {
    let selfDMG = Dungeon.hero != null ? $J.roundf(Math.fround(Dungeon.hero.HT * Math.fround(0.05))) : 1;
    return String((selfDMG + Math.imul(3, level)) | 0);
  }
  upgradeStat2(level: number): string {
    return String((5 + level) | 0);
  }
  upgradeStat3(level: number): string {
    return super.upgradeStat1(level);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.freeCharge = bundle.getBoolean(WandOfTransfusion.FREECHARGE);
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$boolean(WandOfTransfusion.FREECHARGE, this.freeCharge);
  }
}

$J.define(WandOfTransfusion, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfTransfusion', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.wands.DamageWand', ctors: { '': '_WandOfTransfusion' }, meths: { 'max(int)': 'max$int', 'min(int)': 'min$int' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Barrier = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Barrier');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Charm = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Charm');
  Mimic = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mimic');
  Mob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob');
  Beam$HealthRay = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Beam$HealthRay');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  FloatingText = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.FloatingText');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  BloodParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.BloodParticle');
  ShadowParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.ShadowParticle');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  Wand = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.Wand');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  DungeonTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTilemap');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  PointF = $J.load('com.watabou.utils.PointF');
  Random = $J.load('com.watabou.utils.Random');
});
