// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/sprites/MissileSprite.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, HashMap } from '../../../../../jre/index.ts';
import { ItemSprite } from './ItemSprite.ts';

let Dungeon, HolyLance$HolyLanceVFX, GnollGeomancer$Boulder, SpiritBow$SpiritArrow, Crossbow, Bolas, FishingSpear, HeavyBoomerang, Javelin, Kunai, Shuriken, ThrowingKnife, ThrowingSpear, ThrowingSpike, Trident, Dart, ScorpioSprite$ScorpioShot, TenguSprite$TenguShuriken, DungeonTilemap, PosTweener, PointF;

export class MissileSprite extends ItemSprite {
  static readonly SPEED: number = 240;
  callback: Callback = null;
  static readonly DEFAULT_ANGULAR_SPEED: number = 720;
  static ANGULAR_SPEEDS: HashMap<JClass<Item>, number> = null;
  _MissileSprite(): this {
    this._ItemSprite$();
    return this;
  }
  reset$int$int$Item$Callback(from: number, to: number, item: Item, listener: Callback): void {
    this.reset$PointF$PointF$Item$Callback(Dungeon.level.solid[from] ? DungeonTilemap.raisedTileCenterToWorld(from) : DungeonTilemap.raisedTileCenterToWorld(from), Dungeon.level.solid[to] ? DungeonTilemap.raisedTileCenterToWorld(to) : DungeonTilemap.raisedTileCenterToWorld(to), item, listener);
  }
  reset$Visual$int$Item$Callback(from: Visual, to: number, item: Item, listener: Callback): void {
    this.reset$PointF$PointF$Item$Callback(from.center$(), Dungeon.level.solid[to] ? DungeonTilemap.raisedTileCenterToWorld(to) : DungeonTilemap.raisedTileCenterToWorld(to), item, listener);
  }
  reset$int$Visual$Item$Callback(from: number, to: Visual, item: Item, listener: Callback): void {
    this.reset$PointF$PointF$Item$Callback(Dungeon.level.solid[from] ? DungeonTilemap.raisedTileCenterToWorld(from) : DungeonTilemap.raisedTileCenterToWorld(from), to.center$(), item, listener);
  }
  reset$Visual$Visual$Item$Callback(from: Visual, to: Visual, item: Item, listener: Callback): void {
    this.reset$PointF$PointF$Item$Callback(from.center$(), to.center$(), item, listener);
  }
  reset$PointF$PointF$Item$Callback(from: PointF, to: PointF, item: Item, listener: Callback): void {
    this.revive();
    if (item == null) {
      this.view$int$Glowing(0, null);
    } else {
      this.view$Item(item);
    }
    this.setup(from, to, item, listener);
  }
  setup(from: PointF, to: PointF, item: Item, listener: Callback): void {
    this.originToCenter();
    from.x = Math.fround(from.x - Math.fround(this.width() / 2));
    to.x = Math.fround(to.x - Math.fround(this.width() / 2));
    from.y = Math.fround(from.y - Math.fround(this.height() / 2));
    to.y = Math.fround(to.y - Math.fround(this.height() / 2));
    this.callback = listener;
    this.point$PointF(from);
    let d = PointF.diff(to, from);
    this.speed_.set$PointF(d).normalize().scale(MissileSprite.SPEED);
    this.angularSpeed = Math.fround(MissileSprite.DEFAULT_ANGULAR_SPEED);
    for (const $it0 = MissileSprite.ANGULAR_SPEEDS.keySet().iterator(); $it0.hasNext(); ) {
      let cls = $it0.next();
      if (cls.isAssignableFrom(item.getClass())) {
        this.angularSpeed = Math.fround(MissileSprite.ANGULAR_SPEEDS.get(cls));
        break;
      }
    }
    this.angle = Math.fround(135 - Math.fround((Math.atan2(d.x, d.y) / 3.1415926 * 180)));
    if (d.x >= Math.fround(0)) {
      this.flipHorizontal_ = false;
      this.updateFrame();
    } else {
      this.angularSpeed = Math.fround(-this.angularSpeed);
      this.angle = Math.fround(this.angle + 90);
      this.flipHorizontal_ = true;
      this.updateFrame();
    }
    if (item instanceof GnollGeomancer$Boulder) {
      this.angle = 0;
      this.flipHorizontal_ = false;
      this.updateFrame();
    }
    let speed = MissileSprite.SPEED;
    if (item instanceof Dart && (Dungeon.hero.belongings.weapon() instanceof Crossbow || Dungeon.hero.belongings.secondWep() instanceof Crossbow)) {
      speed = Math.fround(speed * 3);
    } else if (item instanceof SpiritBow$SpiritArrow || item instanceof ScorpioSprite$ScorpioShot || item instanceof TenguSprite$TenguShuriken) {
      speed = Math.fround(speed * 1.5);
    }
    let tweener = new PosTweener()._PosTweener(this, to, Math.fround(d.length() / speed));
    tweener.listener = this;
    this.parent.add$Gizmo(tweener);
  }
  onComplete$Tweener(tweener: Tweener): void {
    this.kill();
    if (this.callback != null) {
      this.callback.call();
    }
  }
  static $clinit() {
    MissileSprite.ANGULAR_SPEEDS = new HashMap();
    MissileSprite.ANGULAR_SPEEDS.put($J.cls(Dart), 0);
    MissileSprite.ANGULAR_SPEEDS.put($J.cls(ThrowingKnife), 0);
    MissileSprite.ANGULAR_SPEEDS.put($J.cls(ThrowingSpike), 0);
    MissileSprite.ANGULAR_SPEEDS.put($J.cls(FishingSpear), 0);
    MissileSprite.ANGULAR_SPEEDS.put($J.cls(ThrowingSpear), 0);
    MissileSprite.ANGULAR_SPEEDS.put($J.cls(Kunai), 0);
    MissileSprite.ANGULAR_SPEEDS.put($J.cls(Javelin), 0);
    MissileSprite.ANGULAR_SPEEDS.put($J.cls(Trident), 0);
    MissileSprite.ANGULAR_SPEEDS.put($J.cls(SpiritBow$SpiritArrow), 0);
    MissileSprite.ANGULAR_SPEEDS.put($J.cls(ScorpioSprite$ScorpioShot), 0);
    MissileSprite.ANGULAR_SPEEDS.put($J.cls(HolyLance$HolyLanceVFX), 0);
    MissileSprite.ANGULAR_SPEEDS.put($J.cls(GnollGeomancer$Boulder), 90);
    MissileSprite.ANGULAR_SPEEDS.put($J.cls(HeavyBoomerang), 1440);
    MissileSprite.ANGULAR_SPEEDS.put($J.cls(Bolas), 1440);
    MissileSprite.ANGULAR_SPEEDS.put($J.cls(Shuriken), 2160);
    MissileSprite.ANGULAR_SPEEDS.put($J.cls(TenguSprite$TenguShuriken), 2160);
  }
}

$J.define(MissileSprite, 'com.shatteredpixel.shatteredpixeldungeon.sprites.MissileSprite', { kind: 'class', ifaces: ['com.watabou.noosa.tweeners.Tweener$Listener'], sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite', ctors: { '': '_MissileSprite' }, meths: { 'onComplete(com.watabou.noosa.tweeners.Tweener)': 'onComplete$Tweener', 'reset(com.watabou.utils.PointF,com.watabou.utils.PointF,com.shatteredpixel.shatteredpixeldungeon.items.Item,com.watabou.utils.Callback)': 'reset$PointF$PointF$Item$Callback', 'reset(com.watabou.noosa.Visual,com.watabou.noosa.Visual,com.shatteredpixel.shatteredpixeldungeon.items.Item,com.watabou.utils.Callback)': 'reset$Visual$Visual$Item$Callback', 'reset(int,com.watabou.noosa.Visual,com.shatteredpixel.shatteredpixeldungeon.items.Item,com.watabou.utils.Callback)': 'reset$int$Visual$Item$Callback', 'reset(com.watabou.noosa.Visual,int,com.shatteredpixel.shatteredpixeldungeon.items.Item,com.watabou.utils.Callback)': 'reset$Visual$int$Item$Callback', 'reset(int,int,com.shatteredpixel.shatteredpixeldungeon.items.Item,com.watabou.utils.Callback)': 'reset$int$int$Item$Callback' }, clinit: true, lazy: ['ANGULAR_SPEEDS'] });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  HolyLance$HolyLanceVFX = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.HolyLance$HolyLanceVFX');
  GnollGeomancer$Boulder = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.GnollGeomancer$Boulder');
  SpiritBow$SpiritArrow = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.SpiritBow$SpiritArrow');
  Crossbow = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Crossbow');
  Bolas = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.Bolas');
  FishingSpear = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.FishingSpear');
  HeavyBoomerang = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.HeavyBoomerang');
  Javelin = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.Javelin');
  Kunai = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.Kunai');
  Shuriken = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.Shuriken');
  ThrowingKnife = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.ThrowingKnife');
  ThrowingSpear = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.ThrowingSpear');
  ThrowingSpike = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.ThrowingSpike');
  Trident = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.Trident');
  Dart = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.darts.Dart');
  ScorpioSprite$ScorpioShot = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ScorpioSprite$ScorpioShot');
  TenguSprite$TenguShuriken = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.TenguSprite$TenguShuriken');
  DungeonTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTilemap');
  PosTweener = $J.load('com.watabou.noosa.tweeners.PosTweener');
  PointF = $J.load('com.watabou.utils.PointF');
});
