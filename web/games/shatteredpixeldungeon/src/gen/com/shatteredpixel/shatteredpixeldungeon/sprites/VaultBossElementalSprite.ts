// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/sprites/VaultBossElementalSprite.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../../jre/index.ts';
import { MobSprite } from './MobSprite.ts';

let Assets$Sounds, Assets$Sprites, Dungeon, VaultBossElemental, VaultBossElemental$ElementalForm, CellEmitter, Lightning, MagicMissile, MagicMissile$MagicParticle, FlameParticle, SparkParticle, VaultFinalRoom, Ballistica, MovieClip$Animation, TextureFilm, Sample, Random;

export class VaultBossElementalSprite extends MobSprite {
  particles: Emitter = null;
  doorLockVfx: Emitter[] = null;
  form: VaultBossElemental$ElementalForm = null;
  _VaultBossElementalSprite(): this {
    this._MobSprite();
    this.perspectiveRaise = Math.fround(2 / 16);
    this.texture(Assets$Sprites.VAULT_BOSS_ELEMENTAL);
    this.updateAnimations();
    return this;
  }
  setForm(form: VaultBossElemental$ElementalForm): void {
    this.form = form;
    this.updateAnimations();
  }
  linkVisuals(ch: Char): void {
    super.linkVisuals(ch);
    if (ch instanceof VaultBossElemental && (ch).curForm() != null) {
      this.form = (ch).curForm();
    }
    this.updateAnimations();
  }
  updateForm(): void {
    if (this.ch instanceof VaultBossElemental && (this.ch).curForm() != null) {
      this.form = (this.ch).curForm();
    }
    this.updateAnimations();
  }
  updateAnimations(): void {
    if (this.form == null) {
      this.form = VaultBossElemental$ElementalForm.values()[Random.Int$int(3)];
    }
    let c = Math.imul(16, this.form.ordinal());
    let frames = new TextureFilm()._TextureFilm$Object$int$int(this.texture_, 31, 30);
    this.idle_ = new MovieClip$Animation()._MovieClip$Animation(10, true);
    this.idle_.frames$TextureFilm$ObjectArr(frames, [(c + 0) | 0, (c + 1) | 0, (c + 2) | 0, (c + 3) | 0]);
    this.run_ = new MovieClip$Animation()._MovieClip$Animation(12, true);
    this.run_.frames$TextureFilm$ObjectArr(frames, [(c + 0) | 0, (c + 1) | 0, (c + 2) | 0, (c + 3) | 0]);
    this.attack = new MovieClip$Animation()._MovieClip$Animation(12, false);
    this.attack.frames$TextureFilm$ObjectArr(frames, [(c + 4) | 0, (c + 5) | 0, (c + 6) | 0]);
    this.zap_ = this.attack.clone();
    this.die_ = new MovieClip$Animation()._MovieClip$Animation(15, false);
    this.die_.frames$TextureFilm$ObjectArr(frames, [(c + 7) | 0, (c + 8) | 0, (c + 9) | 0, (c + 10) | 0, (c + 11) | 0, (c + 12) | 0, (c + 13) | 0, (c + 12) | 0]);
    this.operate = this.attack.clone();
    this.play$Animation(this.idle_);
    if (this.particles != null) {
      this.particles.killAndErase();
      this.particles = this.createEmitter();
    }
    if (this.doorLockVfx != null) {
      this.doorLockVfx[0].killAndErase();
      this.doorLockVfx[1].killAndErase();
      this.doorLockVfx = this.createDoorEmitters();
    }
  }
  onComplete$Animation(anim: MovieClip$Animation): void {
    if (anim === this.zap_) {
      this.idle();
    }
    super.onComplete$Animation(anim);
  }
  zap$int(cell: number): void {
    this.zap$int$Callback(cell, null);
    {
      let b: Ballistica;
      switch (this.form) {
        case VaultBossElemental$ElementalForm.FIRE:
        default:
          MagicMissile.boltFromChar(this.parent, MagicMissile.FIRE, this, cell, new (VaultBossElementalSprite$1())().$o(this));
          Sample.INSTANCE.play$Object(Assets$Sounds.ZAP);
          break;
        case VaultBossElemental$ElementalForm.FROST:
          (this.ch).onZapComplete();
          Sample.INSTANCE.play$Object(Assets$Sounds.SHATTER);
          break;
        case VaultBossElemental$ElementalForm.SHOCK:
          this.zap$int$Callback(cell, null);
          b = new Ballistica()._Ballistica(this.ch.pos, cell, Ballistica.STOP_SOLID);
          cell = b.collisionPos;
          (this.ch).onZapComplete();
          this.parent.add$Gizmo(new Lightning()._Lightning$PointF$int$Callback(this.center$(), cell, null));
          Sample.INSTANCE.play$Object(Assets$Sounds.LIGHTNING);
          break;
      }
    }
  }
  createEmitter(): Emitter {
    let emitter = this.emitter();
    emitter.pos$Visual$float$float$float$float(this, 8, 8, 16, 16);
    emitter.fillTarget = false;
    switch (this.form) {
      case VaultBossElemental$ElementalForm.FIRE:
      default:
        emitter.pour(FlameParticle.FACTORY, Math.fround(0.03));
        break;
      case VaultBossElemental$ElementalForm.FROST:
        emitter.pour(MagicMissile$MagicParticle.FACTORY, Math.fround(0.03));
        break;
      case VaultBossElemental$ElementalForm.SHOCK:
        emitter.pour(SparkParticle.STATIC, Math.fround(0.03));
        break;
    }
    return emitter;
  }
  createDoorEmitters(): Emitter[] {
    let room = (Dungeon.level).room$int(this.ch.pos);
    if (room instanceof VaultFinalRoom) {
      let emitters = $J.newArray(2, null);
      emitters[0] = CellEmitter.get(Dungeon.level.pointToCell((room).entryDoor));
      emitters[1] = CellEmitter.get(Dungeon.level.pointToCell((room).lockedDoor));
      switch (this.form) {
        case VaultBossElemental$ElementalForm.FIRE:
        default:
          emitters[0].pour(FlameParticle.FACTORY, Math.fround(0.1));
          emitters[1].pour(FlameParticle.FACTORY, Math.fround(0.1));
          break;
        case VaultBossElemental$ElementalForm.FROST:
          emitters[0].pour(MagicMissile$MagicParticle.FACTORY, Math.fround(0.1));
          emitters[1].pour(MagicMissile$MagicParticle.FACTORY, Math.fround(0.1));
          break;
        case VaultBossElemental$ElementalForm.SHOCK:
          emitters[0].pour(SparkParticle.STATIC, Math.fround(0.1));
          emitters[1].pour(SparkParticle.STATIC, Math.fround(0.1));
          break;
      }
      return emitters;
    } else {
      return null;
    }
  }
  link(ch: Char): void {
    super.link(ch);
    if (this.particles == null) {
      this.particles = this.createEmitter();
    }
    if (this.doorLockVfx == null) {
      this.doorLockVfx = this.createDoorEmitters();
    }
  }
  update(): void {
    super.update();
    if (this.particles != null) {
      this.particles.visible_ = this.visible_;
    }
  }
  die(): void {
    super.die();
    if (this.particles != null) {
      this.particles.on = false;
    }
    if (this.doorLockVfx != null) {
      this.doorLockVfx[0].on = false;
      this.doorLockVfx[1].on = false;
    }
  }
  kill(): void {
    super.kill();
    if (this.particles != null) {
      this.particles.killAndErase();
    }
    if (this.doorLockVfx != null) {
      this.doorLockVfx[0].killAndErase();
      this.doorLockVfx[1].killAndErase();
    }
  }
  blood(): number {
    switch (this.form) {
      case VaultBossElemental$ElementalForm.FIRE:
      default:
        return -17613;
      case VaultBossElemental$ElementalForm.FROST:
        return -7412737;
      case VaultBossElemental$ElementalForm.SHOCK:
        return -123;
    }
  }
}

let $VaultBossElementalSprite$1: any = null;
/** An anonymous class (VaultBossElementalSprite.java:143). */
function VaultBossElementalSprite$1(): any {
  return $VaultBossElementalSprite$1 ??= $J.local(class extends JObject {
    call(): void {
      (this.$outer.ch).onZapComplete();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.sprites.VaultBossElementalSprite$1', ['com.watabou.utils.Callback']);
}

$J.define(VaultBossElementalSprite, 'com.shatteredpixel.shatteredpixeldungeon.sprites.VaultBossElementalSprite', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.MobSprite', ctors: { '': '_VaultBossElementalSprite' }, meths: { 'zap(int)': 'zap$int', 'onComplete(com.watabou.noosa.MovieClip$Animation)': 'onComplete$Animation' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Assets$Sprites = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sprites');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  VaultBossElemental = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.quest.vault.VaultBossElemental');
  VaultBossElemental$ElementalForm = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.quest.vault.VaultBossElemental$ElementalForm');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  Lightning = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Lightning');
  MagicMissile = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile');
  MagicMissile$MagicParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile$MagicParticle');
  FlameParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.FlameParticle');
  SparkParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.SparkParticle');
  VaultFinalRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.VaultFinalRoom');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  MovieClip$Animation = $J.load('com.watabou.noosa.MovieClip$Animation');
  TextureFilm = $J.load('com.watabou.noosa.TextureFilm');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  Random = $J.load('com.watabou.utils.Random');
});
