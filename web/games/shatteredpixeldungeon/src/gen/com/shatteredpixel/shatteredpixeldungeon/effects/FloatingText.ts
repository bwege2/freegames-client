// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/effects/FloatingText.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, Collections, HashMap, JObject } from '../../../../../jre/index.ts';
import { RenderedTextBlock } from '../ui/RenderedTextBlock.ts';

let Assets$Effects, Dungeon, Char, Char$Alignment, Bless, ChampionEnemy, Daze, Hex, Momentum, Hero, HeroClass, Talent, Talent$LiquidAgilACCTracker, Talent$LiquidAgilEVATracker, Talent$PreciseAssaultTracker, GuidingLight$Illuminated, ArmoredStatue, Mob, Statue, MirrorImage, PrismaticImage, Armor, Stone, DriedRose$GhostHero, RingOfAccuracy, RingOfEvasion, FerretTuft, Quarterstaff$DefensiveStance, Scimitar$SwordDance, MissileWeapon, GameScene, PixelScene, Camera, Game, Image, TextureFilm, SparseArray;

export class FloatingText extends RenderedTextBlock {
  static readonly LIFESPAN: number = 1;
  static readonly DISTANCE: number = 16;
  static readonly ICON_WIDTH: number = 7;
  static readonly ICON_HEIGHT: number = 8;
  static iconFilm: TextureFilm = null;
  static NO_ICON: number = 0;
  static PHYS_DMG: number = 0;
  static PHYS_DMG_NO_BLOCK: number = 0;
  static MAGIC_DMG: number = 0;
  static PICK_DMG: number = 0;
  static HUNGER: number = 0;
  static BURNING: number = 0;
  static SHOCKING: number = 0;
  static FROST: number = 0;
  static WATER: number = 0;
  static BLEEDING: number = 0;
  static TOXIC: number = 0;
  static CORROSION: number = 0;
  static POISON: number = 0;
  static OOZE: number = 0;
  static DEFERRED: number = 0;
  static CORRUPTION: number = 0;
  static AMULET: number = 0;
  static HEALING: number = 0;
  static SHIELDING: number = 0;
  static EXPERIENCE: number = 0;
  static STRENGTH: number = 0;
  static GOLD: number = 0;
  static ENERGY: number = 0;
  static HIT_WEP: number = 0;
  static HIT_ARM: number = 0;
  static HIT_BLS: number = 0;
  static HIT_HEX: number = 0;
  static HIT_DAZE: number = 0;
  static HIT_ACC: number = 0;
  static HIT_EVA: number = 0;
  static HIT_LIQ: number = 0;
  static HIT_DANCE: number = 0;
  static HIT_SUPR: number = 0;
  static HIT_PRES: number = 0;
  static HIT_MOMEN: number = 0;
  static MISS_WEP: number = 0;
  static MISS_ARM: number = 0;
  static MISS_BLS: number = 0;
  static MISS_HEX: number = 0;
  static MISS_DAZE: number = 0;
  static MISS_ACC: number = 0;
  static MISS_EVA: number = 0;
  static MISS_LIQ: number = 0;
  static MISS_DEF: number = 0;
  static MISS_TUFT: number = 0;
  static MISS_RUN: number = 0;
  icon_: Image = null;
  iconLeft: boolean = false;
  timeLeft: number = 0;
  key: number = 0;
  static stacks: SparseArray<ArrayList<FloatingText>> = null;
  _FloatingText(): this {
    this._RenderedTextBlock$int(Math.imul(9, PixelScene.defaultZoom));
    this.key = -1;
    this.setHightlighting$boolean(false);
    return this;
  }
  update(): void {
    super.update();
    if (this.timeLeft >= Math.fround(0)) {
      if ((this.timeLeft = Math.fround(this.timeLeft - Game.elapsed)) <= Math.fround(0)) {
        this.kill();
      } else {
        let p = Math.fround(this.timeLeft / FloatingText.LIFESPAN);
        this.alpha(p > 0.5 ? 1 : Math.fround(p * 2));
        let yMove = Math.fround((Math.fround(FloatingText.DISTANCE / FloatingText.LIFESPAN)) * Game.elapsed);
        this.y = Math.fround(this.y - yMove);
        for (const $it0 = this.words.iterator(); $it0.hasNext(); ) {
          let t = $it0.next();
          t.y = Math.fround(t.y - yMove);
        }
        if (this.icon_ != null) {
          this.icon_.alpha$float(p > 0.5 ? 1 : Math.fround(p * 2));
          this.icon_.y = Math.fround(this.icon_.y - yMove);
        }
      }
    }
  }
  layout(): void {
    super.layout();
    if (this.icon_ != null) {
      if (this.iconLeft) {
        this.icon_.x = this.left();
      } else {
        this.icon_.x = Math.fround(Math.fround(this.left() + this.width()) - this.icon_.width());
      }
      this.icon_.x = PixelScene.align$Camera$float(Camera.main, this.icon_.x);
      this.icon_.y = PixelScene.align$Camera$float(Camera.main, this.top());
    }
  }
  width(): number {
    let width = super.width();
    if (this.icon_ != null) {
      width = Math.fround(width + Math.fround(this.icon_.width() - 0.5));
    }
    return width;
  }
  kill(): void {
    if (this.key !== -1) {
      {
        FloatingText.stacks.get(this.key).remove(this);
      }
      this.key = -1;
    }
    super.kill();
  }
  destroy(): void {
    this.kill();
    super.destroy();
  }
  reset(x: number, y: number, text: string, color: number, iconIdx: number, left: boolean): void {
    this.revive();
    this.zoom(Math.fround(1 / Math.fround(PixelScene.defaultZoom)));
    this.text$String(text);
    this.hardlight(color);
    if (iconIdx !== FloatingText.NO_ICON) {
      this.icon_ = new Image()._Image$Object(Assets$Effects.TEXT_ICONS);
      this.icon_.frame$RectF(FloatingText.iconFilm.get$Object(iconIdx));
      this.add$Gizmo(this.icon_);
      this.iconLeft = left;
      if (this.iconLeft) {
        this.align(RenderedTextBlock.RIGHT_ALIGN);
      }
    } else {
      this.icon_ = null;
    }
    this.setPos(PixelScene.align$Camera$float(Camera.main, Math.fround(x - Math.fround(this.width() / 2))), PixelScene.align$Camera$float(Camera.main, Math.fround(y - this.height())));
    this.timeLeft = FloatingText.LIFESPAN;
  }
  static show$float$float$String$int(x: number, y: number, text: string, color: number): void {
    FloatingText.show$float$float$int$String$int$int$boolean(x, y, -1, text, color, -1, false);
  }
  static show$float$float$int$String$int(x: number, y: number, key: number, text: string, color: number): void {
    FloatingText.show$float$float$int$String$int$int$boolean(x, y, key, text, color, -1, false);
  }
  static show$float$float$int$String$int$int$boolean(x: number, y: number, key: number, text: string, color: number, iconIdx: number, left: boolean): void {
    Game.runOnRenderThread(new (FloatingText$1())().$c(x, y, text, color, iconIdx, left, key));
  }
  static push(txt: FloatingText, key: number): void {
    {
      txt.key = key;
      let stack = FloatingText.stacks.get(key);
      if (stack == null) {
        stack = new ArrayList();
        FloatingText.stacks.put(key, stack);
      }
      if (stack.size() > 0) {
        let below = txt;
        let aboveIndex = (stack.size() - 1) | 0;
        let numBelow = 0;
        while (aboveIndex >= 0) {
          numBelow++;
          let above = stack.get(aboveIndex);
          if (Math.fround(above.bottom() + 4) > below.top()) {
            above.setPos(above.left(), Math.fround(Math.fround(below.top() - above.height()) - 4));
            above.timeLeft = Math.min(above.timeLeft, Math.fround(FloatingText.LIFESPAN - (Math.fround(numBelow / 5))));
            above.timeLeft = Math.max(above.timeLeft, 0);
            below = above;
            aboveIndex--;
          } else {
            break;
          }
        }
      }
      stack.add(txt);
    }
  }
  static getHitReasonIcon(attacker: Char, accRoll: number, defender: Char, defRoll: number): number {
    let hitReasons = new HashMap();
    if (defRoll === Math.fround(0) && defender.buff($J.cls(GuidingLight$Illuminated)) != null) {
      return FloatingText.HIT_BLS;
    }
    if (accRoll === Math.fround(Char.INFINITE_ACCURACY) && attacker.invisible > 0) {
      return FloatingText.HIT_SUPR;
    }
    if (defRoll === Math.fround(0) && defender instanceof Mob && (defender).surprisedBy$Char(attacker)) {
      return FloatingText.HIT_SUPR;
    }
    if (accRoll === Math.fround(Char.INFINITE_ACCURACY) && attacker.buff($J.cls(Talent$PreciseAssaultTracker)) != null) {
      return FloatingText.HIT_PRES;
    }
    if (accRoll === Math.fround(Char.INFINITE_ACCURACY) && attacker.buff($J.cls(Talent$LiquidAgilACCTracker)) != null) {
      return FloatingText.HIT_LIQ;
    }
    let wep = null;
    if (attacker instanceof Hero) {
      wep = (attacker).belongings.attackingWeapon();
    }
    if (attacker instanceof MirrorImage) {
      wep = Dungeon.hero.belongings.weapon();
    }
    if (attacker instanceof Statue) {
      wep = (attacker).weapon();
    }
    if (attacker instanceof DriedRose$GhostHero) {
      wep = (attacker).weapon();
    }
    let arm = null;
    if (defender instanceof Hero) {
      arm = (defender).belongings.armor();
    }
    if (defender instanceof PrismaticImage) {
      arm = Dungeon.hero.belongings.armor();
    }
    if (defender instanceof ArmoredStatue) {
      arm = (defender).armor();
    }
    if (defender instanceof DriedRose$GhostHero) {
      arm = (defender).armor();
    }
    if (defRoll === Math.fround(0) && arm != null && arm.hasGlyph($J.cls(Stone), defender)) {
      return FloatingText.HIT_ARM;
    }
    if (wep != null && wep.accuracyFactor(attacker, defender) > Math.fround(1)) {
      $J.boxF(hitReasons.put(FloatingText.HIT_WEP, $J.boxF(wep.accuracyFactor(attacker, defender))));
    }
    let blessBoost = 1;
    if (attacker.buff($J.cls(ChampionEnemy)) != null && attacker.buff($J.cls(ChampionEnemy)).evasionAndAccuracyFactor() > Math.fround(1)) {
      blessBoost = Math.fround(blessBoost * attacker.buff($J.cls(ChampionEnemy)).evasionAndAccuracyFactor());
    }
    if (attacker.buff($J.cls(Bless)) != null) {
      blessBoost = Math.fround(blessBoost * 1.25);
    }
    if (Dungeon.hero.heroClass !== HeroClass.CLERIC && Dungeon.hero.hasTalent(Talent.BLESS) && attacker.alignment === Char$Alignment.ALLY) {
      blessBoost = Math.fround(blessBoost * Math.fround(Math.fround(1.01) + Math.fround(Math.fround(0.02) * Dungeon.hero.pointsInTalent(Talent.BLESS))));
    }
    if (blessBoost > 1) {
      $J.boxF(hitReasons.put(FloatingText.HIT_BLS, $J.boxF(blessBoost)));
    }
    if (RingOfAccuracy.accuracyMultiplier(attacker) > Math.fround(1)) {
      $J.boxF(hitReasons.put(FloatingText.HIT_ACC, $J.boxF(RingOfAccuracy.accuracyMultiplier(attacker))));
    }
    if (attacker.buff($J.cls(Scimitar$SwordDance)) != null) {
      $J.boxF(hitReasons.put(FloatingText.HIT_DANCE, $J.boxF(1.5)));
    }
    if (!(wep instanceof MissileWeapon)) {
      if (attacker instanceof Hero && (attacker).hasTalent(Talent.PRECISE_ASSAULT) && (attacker).heroClass !== HeroClass.DUELIST) {
        $J.boxF(hitReasons.put(FloatingText.HIT_PRES, $J.boxF(Math.fround(Math.fround(0.1) * Dungeon.hero.pointsInTalent(Talent.PRECISE_ASSAULT)))));
      }
      if (attacker.buff($J.cls(Talent$PreciseAssaultTracker)) != null) {
        $J.boxF(hitReasons.put(FloatingText.HIT_PRES, $J.boxF(Dungeon.hero.pointsInTalent(Talent.PRECISE_ASSAULT) === 2 ? 5 : 2)));
      } else if (attacker.buff($J.cls(Talent$LiquidAgilACCTracker)) != null) {
        $J.boxF(hitReasons.put(FloatingText.HIT_LIQ, $J.boxF(3)));
      }
    } else {
      if (attacker.buff($J.cls(Momentum)) != null && attacker.buff($J.cls(Momentum)).freerunning() && (attacker).hasTalent(Talent.PROJECTILE_MOMENTUM)) {
        $J.boxF(hitReasons.put(FloatingText.HIT_MOMEN, $J.boxF(Math.fround(1 + Math.fround((attacker).pointsInTalent(Talent.PROJECTILE_MOMENTUM) / 2)))));
      }
    }
    if (defender.buff($J.cls(Hex)) != null) {
      $J.boxF(hitReasons.put(FloatingText.HIT_HEX, $J.boxF(Math.fround(0.8))));
    }
    if (defender.buff($J.cls(Daze)) != null) {
      $J.boxF(hitReasons.put(FloatingText.HIT_DAZE, $J.boxF(0.5)));
    }
    if (RingOfEvasion.evasionMultiplier(defender) < Math.fround(1)) {
      $J.boxF(hitReasons.put(FloatingText.HIT_EVA, $J.boxF(RingOfEvasion.evasionMultiplier(defender))));
    }
    if (arm != null && arm.evasionFactor(defender, 100) < Math.fround(100)) {
      Armor.testingNoArmDefSkill = true;
      let baseDef = defender.defenseSkill(attacker);
      Armor.testingNoArmDefSkill = false;
      $J.boxF(hitReasons.put(FloatingText.HIT_ARM, $J.boxF(Math.fround(defender.defenseSkill(attacker) / Math.fround(baseDef)))));
    }
    if (defender.paralysed > 0) {
      if (defender instanceof Hero) {
        $J.boxF(hitReasons.put(FloatingText.HIT_SUPR, $J.boxF(0.5)));
      } else {
        return FloatingText.HIT_SUPR;
      }
    }
    let sortedReasons = new ArrayList(hitReasons.keySet());
    Collections.sort(sortedReasons, (a, b) => {
      let a1 = +$J.boxF(hitReasons.get(a)) >= 1 ? +$J.boxF(hitReasons.get(a)) : Math.fround(1 / +$J.boxF(hitReasons.get(a)));
      let b1 = +$J.boxF(hitReasons.get(b)) >= 1 ? +$J.boxF(hitReasons.get(b)) : Math.fround(1 / +$J.boxF(hitReasons.get(b)));
      return $J.d2i(Math.fround(Math.sign(Math.fround(b1 - a1))));
    });
    for (const $it1 = sortedReasons.iterator(); $it1.hasNext(); ) {
      let reason = $it1.next();
      if (+$J.boxF(hitReasons.get(reason)) >= 1) {
        accRoll = Math.fround(accRoll / +$J.boxF(hitReasons.get(reason)));
      } else {
        defRoll = Math.fround(defRoll / +$J.boxF(hitReasons.get(reason)));
      }
      if (accRoll < defRoll) {
        return reason;
      }
    }
    return -1;
  }
  static getMissReasonIcon(attacker: Char, accRoll: number, defender: Char, defRoll: number): number {
    let missReasons = new HashMap();
    if (defRoll === Math.fround(Char.INFINITE_EVASION) && defender.buff($J.cls(Talent$LiquidAgilEVATracker)) != null) {
      return FloatingText.MISS_LIQ;
    }
    let wep = null;
    if (attacker instanceof Hero) {
      wep = (attacker).belongings.attackingWeapon();
    }
    if (attacker instanceof MirrorImage) {
      wep = Dungeon.hero.belongings.weapon();
    }
    if (attacker instanceof Statue) {
      wep = (attacker).weapon();
    }
    if (attacker instanceof DriedRose$GhostHero) {
      wep = (attacker).weapon();
    }
    let arm = null;
    if (defender instanceof Hero) {
      arm = (defender).belongings.armor();
    }
    if (defender instanceof PrismaticImage) {
      arm = Dungeon.hero.belongings.armor();
    }
    if (defender instanceof ArmoredStatue) {
      arm = (defender).armor();
    }
    if (defender instanceof DriedRose$GhostHero) {
      arm = (defender).armor();
    }
    let blessBoost = 1;
    if (defender.buff($J.cls(ChampionEnemy)) != null && defender.buff($J.cls(ChampionEnemy)).evasionAndAccuracyFactor() > Math.fround(1)) {
      blessBoost = Math.fround(blessBoost * defender.buff($J.cls(ChampionEnemy)).evasionAndAccuracyFactor());
    }
    if (defender.buff($J.cls(Bless)) != null) {
      blessBoost = Math.fround(blessBoost * 1.25);
    }
    if (Dungeon.hero.heroClass !== HeroClass.CLERIC && Dungeon.hero.hasTalent(Talent.BLESS) && defender.alignment === Char$Alignment.ALLY) {
      blessBoost = Math.fround(blessBoost * Math.fround(Math.fround(1.01) + Math.fround(Math.fround(0.02) * Dungeon.hero.pointsInTalent(Talent.BLESS))));
    }
    if (blessBoost > 1) {
      $J.boxF(missReasons.put(FloatingText.MISS_BLS, $J.boxF(blessBoost)));
    }
    if (FerretTuft.evasionMultiplier$() > Math.fround(1)) {
      $J.boxF(missReasons.put(FloatingText.MISS_TUFT, $J.boxF(FerretTuft.evasionMultiplier$())));
    }
    if (RingOfEvasion.evasionMultiplier(defender) > Math.fround(1)) {
      $J.boxF(missReasons.put(FloatingText.MISS_EVA, $J.boxF(RingOfEvasion.evasionMultiplier(defender))));
    }
    if (defender.buff($J.cls(Quarterstaff$DefensiveStance)) != null) {
      $J.boxF(missReasons.put(FloatingText.MISS_DEF, $J.boxF(3)));
    }
    if (arm != null && arm.evasionFactor(defender, 100) > Math.fround(100)) {
      Armor.testingNoArmDefSkill = true;
      let baseDef = defender.defenseSkill(attacker);
      Armor.testingNoArmDefSkill = false;
      if (defender.buff($J.cls(Momentum)) != null) {
        $J.boxF(missReasons.put(FloatingText.MISS_RUN, $J.boxF(Math.fround(defender.defenseSkill(attacker) / Math.fround(baseDef)))));
      } else {
        $J.boxF(missReasons.put(FloatingText.MISS_ARM, $J.boxF(Math.fround(defender.defenseSkill(attacker) / Math.fround(baseDef)))));
      }
    }
    if (defender.buff($J.cls(Talent$LiquidAgilEVATracker)) != null) {
      $J.boxF(missReasons.put(FloatingText.MISS_LIQ, $J.boxF(3)));
    }
    if (wep != null && wep.accuracyFactor(attacker, defender) < Math.fround(1)) {
      $J.boxF(missReasons.put(FloatingText.MISS_WEP, $J.boxF(wep.accuracyFactor(attacker, defender))));
    }
    if (attacker.buff($J.cls(Hex)) != null) {
      $J.boxF(missReasons.put(FloatingText.MISS_HEX, $J.boxF(Math.fround(0.8))));
    }
    if (attacker.buff($J.cls(Daze)) != null) {
      $J.boxF(missReasons.put(FloatingText.MISS_DAZE, $J.boxF(0.5)));
    }
    if (RingOfAccuracy.accuracyMultiplier(attacker) < Math.fround(1)) {
      $J.boxF(missReasons.put(FloatingText.MISS_ACC, $J.boxF(RingOfAccuracy.accuracyMultiplier(attacker))));
    }
    let sortedReasons = new ArrayList(missReasons.keySet());
    Collections.sort(sortedReasons, (a, b) => {
      let a1 = +$J.boxF(missReasons.get(a)) >= 1 ? +$J.boxF(missReasons.get(a)) : Math.fround(1 / +$J.boxF(missReasons.get(a)));
      let b1 = +$J.boxF(missReasons.get(b)) >= 1 ? +$J.boxF(missReasons.get(b)) : Math.fround(1 / +$J.boxF(missReasons.get(b)));
      return $J.d2i(Math.fround(Math.sign(Math.fround(b1 - a1))));
    });
    for (const $it2 = sortedReasons.iterator(); $it2.hasNext(); ) {
      let reason = $it2.next();
      if (+$J.boxF(missReasons.get(reason)) >= 1) {
        defRoll = Math.fround(defRoll / +$J.boxF(missReasons.get(reason)));
      } else {
        accRoll = Math.fround(accRoll / +$J.boxF(missReasons.get(reason)));
      }
      if (defRoll < accRoll) {
        return reason;
      }
    }
    return -1;
  }
  static $clinit() {
    FloatingText.iconFilm = new TextureFilm()._TextureFilm$Object$int$int(Assets$Effects.TEXT_ICONS, FloatingText.ICON_WIDTH, FloatingText.ICON_HEIGHT);
    FloatingText.NO_ICON = -1;
    FloatingText.PHYS_DMG = 0;
    FloatingText.PHYS_DMG_NO_BLOCK = 1;
    FloatingText.MAGIC_DMG = 2;
    FloatingText.PICK_DMG = 3;
    FloatingText.HUNGER = 5;
    FloatingText.BURNING = 6;
    FloatingText.SHOCKING = 7;
    FloatingText.FROST = 8;
    FloatingText.WATER = 9;
    FloatingText.BLEEDING = 10;
    FloatingText.TOXIC = 11;
    FloatingText.CORROSION = 12;
    FloatingText.POISON = 13;
    FloatingText.OOZE = 14;
    FloatingText.DEFERRED = 15;
    FloatingText.CORRUPTION = 16;
    FloatingText.AMULET = 17;
    FloatingText.HEALING = 18;
    FloatingText.SHIELDING = 19;
    FloatingText.EXPERIENCE = 20;
    FloatingText.STRENGTH = 21;
    FloatingText.GOLD = 23;
    FloatingText.ENERGY = 24;
    FloatingText.HIT_WEP = 36;
    FloatingText.HIT_ARM = 37;
    FloatingText.HIT_BLS = 38;
    FloatingText.HIT_HEX = 39;
    FloatingText.HIT_DAZE = 40;
    FloatingText.HIT_ACC = 41;
    FloatingText.HIT_EVA = 42;
    FloatingText.HIT_LIQ = 43;
    FloatingText.HIT_DANCE = 44;
    FloatingText.HIT_SUPR = 45;
    FloatingText.HIT_PRES = 46;
    FloatingText.HIT_MOMEN = 47;
    FloatingText.MISS_WEP = 72;
    FloatingText.MISS_ARM = 73;
    FloatingText.MISS_BLS = 74;
    FloatingText.MISS_HEX = 75;
    FloatingText.MISS_DAZE = 76;
    FloatingText.MISS_ACC = 77;
    FloatingText.MISS_EVA = 78;
    FloatingText.MISS_LIQ = 79;
    FloatingText.MISS_DEF = 80;
    FloatingText.MISS_TUFT = 81;
    FloatingText.MISS_RUN = 82;
    FloatingText.stacks = new SparseArray()._SparseArray();
  }
}

let $FloatingText$1: any = null;
/** An anonymous class (FloatingText.java:258). */
function FloatingText$1(): any {
  return $FloatingText$1 ??= $J.local(class extends JObject {
    call(): void {
      let txt = GameScene.status();
      if (txt != null) {
        txt.reset(this.$cv_x, this.$cv_y, this.$cv_text, this.$cv_color, this.$cv_iconIdx, this.$cv_left);
        if (this.$cv_key !== -1) {
          FloatingText.push(txt, this.$cv_key);
        }
      }
    }
    $c($x, $y, $text, $color, $iconIdx, $left, $key): this {
      this.$cv_x = $x; this.$cv_y = $y; this.$cv_text = $text; this.$cv_color = $color; this.$cv_iconIdx = $iconIdx; this.$cv_left = $left; this.$cv_key = $key;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.effects.FloatingText$1', ['com.watabou.utils.Callback']);
}

$J.define(FloatingText, 'com.shatteredpixel.shatteredpixeldungeon.effects.FloatingText', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.RenderedTextBlock', ctors: { '': '_FloatingText' }, meths: { 'show(float,float,int,java.lang.String,int,int,boolean)': 'show$float$float$int$String$int$int$boolean', 'show(float,float,int,java.lang.String,int)': 'show$float$float$int$String$int', 'show(float,float,java.lang.String,int)': 'show$float$float$String$int' }, clinit: true, lazy: ['iconFilm', 'NO_ICON', 'PHYS_DMG', 'PHYS_DMG_NO_BLOCK', 'MAGIC_DMG', 'PICK_DMG', 'HUNGER', 'BURNING', 'SHOCKING', 'FROST', 'WATER', 'BLEEDING', 'TOXIC', 'CORROSION', 'POISON', 'OOZE', 'DEFERRED', 'CORRUPTION', 'AMULET', 'HEALING', 'SHIELDING', 'EXPERIENCE', 'STRENGTH', 'GOLD', 'ENERGY', 'HIT_WEP', 'HIT_ARM', 'HIT_BLS', 'HIT_HEX', 'HIT_DAZE', 'HIT_ACC', 'HIT_EVA', 'HIT_LIQ', 'HIT_DANCE', 'HIT_SUPR', 'HIT_PRES', 'HIT_MOMEN', 'MISS_WEP', 'MISS_ARM', 'MISS_BLS', 'MISS_HEX', 'MISS_DAZE', 'MISS_ACC', 'MISS_EVA', 'MISS_LIQ', 'MISS_DEF', 'MISS_TUFT', 'MISS_RUN', 'stacks'] });
$J.module(() => {
  Assets$Effects = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Effects');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Bless = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Bless');
  ChampionEnemy = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.ChampionEnemy');
  Daze = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Daze');
  Hex = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Hex');
  Momentum = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Momentum');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  HeroClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroClass');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Talent$LiquidAgilACCTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$LiquidAgilACCTracker');
  Talent$LiquidAgilEVATracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$LiquidAgilEVATracker');
  Talent$PreciseAssaultTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$PreciseAssaultTracker');
  GuidingLight$Illuminated = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.GuidingLight$Illuminated');
  ArmoredStatue = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.ArmoredStatue');
  Mob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob');
  Statue = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Statue');
  MirrorImage = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.MirrorImage');
  PrismaticImage = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.PrismaticImage');
  Armor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor');
  Stone = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.glyphs.Stone');
  DriedRose$GhostHero = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.DriedRose$GhostHero');
  RingOfAccuracy = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfAccuracy');
  RingOfEvasion = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfEvasion');
  FerretTuft = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.FerretTuft');
  Quarterstaff$DefensiveStance = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Quarterstaff$DefensiveStance');
  Scimitar$SwordDance = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Scimitar$SwordDance');
  MissileWeapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.MissileWeapon');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  Camera = $J.load('com.watabou.noosa.Camera');
  Game = $J.load('com.watabou.noosa.Game');
  Image = $J.load('com.watabou.noosa.Image');
  TextureFilm = $J.load('com.watabou.noosa.TextureFilm');
  SparseArray = $J.load('com.watabou.utils.SparseArray');
});
