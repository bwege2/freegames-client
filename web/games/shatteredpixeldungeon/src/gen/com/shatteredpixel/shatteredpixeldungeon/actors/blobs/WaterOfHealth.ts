// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/blobs/WaterOfHealth.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { WellWater } from './WellWater.ts';

let Assets$Sounds, Dungeon, Buff, Healing, Hunger, CellEmitter, FloatingText, Speck, ShadowParticle, ShaftParticle, Ankh, Waterskin, PotionOfHealing, ScrollOfRemoveCurse, VialOfBlood, Notes$Landmark, Messages, CharSprite, GLog, Sample;

export class WaterOfHealth extends WellWater {
  _WaterOfHealth(): this {
    this._WellWater();
    return this;
  }
  affectHero(hero: Hero): boolean {
    if (!hero.isAlive()) {
      return false;
    }
    Sample.INSTANCE.play$Object(Assets$Sounds.DRINK);
    PotionOfHealing.cure(hero);
    hero.belongings.uncurseEquipped();
    hero.buff($J.cls(Hunger)).satisfy(Hunger.STARVING);
    if (VialOfBlood.delayBurstHealing()) {
      let healing = Buff.affect$Char$Class(hero, $J.cls(Healing));
      healing.setHeal$int$float$int$boolean(hero.HT, 0, VialOfBlood.maxHealPerTurn$(), true);
    } else {
      hero.HP = hero.HT;
      hero.sprite_.emitter().start(Speck.factory$int(Speck.HEALING), Math.fround(0.4), 4);
      hero.sprite_.showStatusWithIcon(CharSprite.POSITIVE, String(hero.HT), FloatingText.HEALING, []);
    }
    CellEmitter.get(hero.pos).start(ShaftParticle.FACTORY, Math.fround(0.2), 3);
    Dungeon.hero.interrupt();
    GLog.p(Messages.get$Object$String$ObjectArr(this, 'procced', []), []);
    return true;
  }
  affectItem(item: Item, pos: number): Item {
    if (item instanceof Waterskin && !(item).isFull()) {
      (item).fill();
      CellEmitter.get(pos).start(Speck.factory$int(Speck.HEALING), Math.fround(0.4), 4);
      Sample.INSTANCE.play$Object(Assets$Sounds.DRINK);
      return item;
    } else if (item instanceof Ankh && !((item).isBlessed())) {
      (item).bless();
      CellEmitter.get(pos).start(Speck.factory$int(Speck.LIGHT), Math.fround(0.2), 3);
      Sample.INSTANCE.play$Object(Assets$Sounds.DRINK);
      return item;
    } else if (ScrollOfRemoveCurse.uncursable(item)) {
      if (ScrollOfRemoveCurse.uncurse(null, [item])) {
        CellEmitter.get(pos).start(ShadowParticle.UP, Math.fround(0.05), 10);
      }
      Sample.INSTANCE.play$Object(Assets$Sounds.DRINK);
      return item;
    }
    return null;
  }
  landmark(): Notes$Landmark {
    return Notes$Landmark.WELL_OF_HEALTH;
  }
  use(emitter: BlobEmitter): void {
    super.use(emitter);
    emitter.start(Speck.factory$int(Speck.HEALING), 0.5, 0);
  }
  tileDesc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', []);
  }
}

$J.define(WaterOfHealth, 'com.shatteredpixel.shatteredpixeldungeon.actors.blobs.WaterOfHealth', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.blobs.WellWater', ctors: { '': '_WaterOfHealth' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Healing = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Healing');
  Hunger = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Hunger');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  FloatingText = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.FloatingText');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  ShadowParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.ShadowParticle');
  ShaftParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.ShaftParticle');
  Ankh = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Ankh');
  Waterskin = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Waterskin');
  PotionOfHealing = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfHealing');
  ScrollOfRemoveCurse = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfRemoveCurse');
  VialOfBlood = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.VialOfBlood');
  Notes$Landmark = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Notes$Landmark');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
