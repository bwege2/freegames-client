// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/sprites/CharSprite.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, HashSet, JEnum } from '../../../../../jre/index.ts';
import { MovieClip } from '../../../watabou/noosa/MovieClip.ts';
import { Tweener } from '../../../watabou/noosa/tweeners/Tweener.ts';

let Assets$Sounds, Dungeon, DarkBlock, EmoIcon$Alert, EmoIcon$Investigate, EmoIcon$Lost, EmoIcon$Sleep, Flare, FloatingText, GlowBlock, IceBlock, ShieldHalo, Speck, Splash, TorchHalo, FlameParticle, ShadowParticle, SnowParticle, Messages, GameScene, PixelScene, DungeonTilemap, CharHealthIndicator, Matrix, Vertexbuffer, Camera, Game, Sample, AlphaTweener, PosTweener, PointF, Random;

export class CharSprite extends MovieClip {
  static readonly DEFAULT: number = 16777215;
  static readonly POSITIVE: number = 65280;
  static readonly NEGATIVE: number = 16711680;
  static readonly WARNING: number = 16746496;
  static readonly NEUTRAL: number = 16776960;
  static readonly DEFAULT_MOVE_INTERVAL: number = Math.fround(0.1);
  static moveInterval: number = 0;
  static readonly FLASH_INTERVAL: number = Math.fround(0.05);
  perspectiveRaise: number = 0;
  renderShadow: boolean = false;
  shadowWidth: number = 0;
  shadowHeight: number = 0;
  shadowOffset: number = 0;
  visibleOutOfFFOV: boolean = false;
  idle_: MovieClip$Animation = null;
  run_: MovieClip$Animation = null;
  attack: MovieClip$Animation = null;
  operate: MovieClip$Animation = null;
  zap_: MovieClip$Animation = null;
  die_: MovieClip$Animation = null;
  animCallback: Callback = null;
  motion: PosTweener = null;
  burning: Emitter = null;
  chilled: Emitter = null;
  marked: Emitter = null;
  levitation: Emitter = null;
  healing: Emitter = null;
  hearts: Emitter = null;
  iceBlock: IceBlock = null;
  darkBlock: DarkBlock = null;
  glowBlock: GlowBlock = null;
  light: TorchHalo = null;
  shield: ShieldHalo = null;
  invisible: AlphaTweener = null;
  aura_: Flare = null;
  emo: EmoIcon = null;
  health_: CharHealthIndicator = null;
  jumpTweener: Tweener = null;
  jumpCallback: Callback = null;
  flashTime: number = 0;
  sleeping: boolean = false;
  ch: Char = null;
  isMoving: boolean = false;
  stateAdditions: HashSet<CharSprite$State> = null;
  auraColor: number = 0;
  auraRays: number = 0;
  stateRemovals: HashSet<CharSprite$State> = null;
  shadowMatrix: number[] = null;
  _CharSprite(): this {
    this._MovieClip$();
    this.perspectiveRaise = Math.fround(6 / 16);
    this.renderShadow = false;
    this.shadowWidth = Math.fround(1.2);
    this.shadowHeight = 0.25;
    this.shadowOffset = 0.25;
    this.visibleOutOfFFOV = false;
    this.flashTime = 0;
    this.sleeping = false;
    this.isMoving = false;
    this.stateAdditions = new HashSet();
    this.auraColor = 0;
    this.auraRays = 0;
    this.stateRemovals = new HashSet();
    this.shadowMatrix = $J.newArray(16, 0);
    this.listener = this;
    return this;
  }
  play$Animation(anim: MovieClip$Animation): void {
    if (this.curAnim == null || this.curAnim !== this.die_) {
      super.play$Animation(anim);
    }
  }
  link(ch: Char): void {
    this.linkVisuals(ch);
    this.ch = ch;
    ch.sprite_ = this;
    this.place(ch.pos);
    this.turnTo(ch.pos, Random.Int$int(Dungeon.level.length()));
    this.renderShadow = true;
    if (ch !== Dungeon.hero) {
      if (this.health_ == null) {
        this.health_ = new CharHealthIndicator()._CharHealthIndicator(ch);
      } else {
        this.health_.target$Char(ch);
      }
    }
    ch.updateSpriteState();
  }
  destroy(): void {
    super.destroy();
    if (this.ch != null && this.ch.sprite_ === this) {
      this.ch.sprite_ = null;
    }
  }
  linkVisuals(ch: Char): void {
  }
  worldToCamera(cell: number): PointF {
    let csize = DungeonTilemap.SIZE;
    return new PointF()._PointF$float$float(PixelScene.align$Camera$float(Camera.main, Math.fround(Math.fround((Math.fround((cell % Dungeon.level.width()) + 0.5)) * csize) - Math.fround(this.width() * 0.5))), PixelScene.align$Camera$float(Camera.main, Math.fround(Math.fround(Math.fround((Math.fround(($J.idiv(cell, Dungeon.level.width())) + 1)) * csize) - this.height()) - Math.fround(csize * this.perspectiveRaise))));
  }
  place(cell: number): void {
    this.point$PointF(this.worldToCamera(cell));
  }
  showStatus(color: number, text: string, args: any[]): void {
    this.showStatusWithIcon(color, text, FloatingText.NO_ICON, args);
  }
  showStatusWithIcon(color: number, text: string, icon: number, args: any[]): void {
    if (this.visible_) {
      if (args.length > 0) {
        text = Messages.format(text, args);
      }
      let x = this.destinationCenter().x;
      let y = Math.fround(this.destinationCenter().y - Math.fround(this.height() / 2));
      let pos = DungeonTilemap.worldToTile(x, Math.fround(y + this.height()), Dungeon.level.width());
      if (this.ch != null) {
        FloatingText.show$float$float$int$String$int$int$boolean(x, y, pos, text, color, icon, true);
      } else {
        FloatingText.show$float$float$int$String$int$int$boolean(x, y, -1, text, color, icon, true);
      }
    }
  }
  idle(): void {
    this.play$Animation(this.idle_);
  }
  move(from: number, to: number): void {
    this.turnTo(from, to);
    this.play$Animation(this.run_);
    this.motion = new PosTweener()._PosTweener(this, this.worldToCamera(to), CharSprite.moveInterval);
    this.motion.listener = this;
    this.parent.add$Gizmo(this.motion);
    this.isMoving = true;
    if (this.visible_ && Dungeon.level.water[from] && this.ch != null && !this.ch.flying) {
      GameScene.ripple(from);
    }
  }
  static setMoveInterval(interval: number): void {
    CharSprite.moveInterval = interval;
  }
  destinationCenter(): PointF {
    let motion = this.motion;
    if (motion != null && motion.elapsed >= Math.fround(0)) {
      return new PointF()._PointF$float$float(Math.fround(motion.end_.x + Math.fround(this.width() / 2)), Math.fround(motion.end_.y + Math.fround(this.height() / 2)));
    } else {
      return this.center$();
    }
  }
  interruptMotion(): void {
    if (this.motion != null) {
      this.motion.stop(false);
    }
  }
  attack$int(cell: number): void {
    this.attack$int$Callback(cell, null);
  }
  attack$int$Callback(cell: number, callback: Callback): void {
    this.animCallback = callback;
    this.turnTo(this.ch.pos, cell);
    this.play$Animation(this.attack);
  }
  operate$int(cell: number): void {
    this.operate$int$Callback(cell, null);
  }
  operate$int$Callback(cell: number, callback: Callback): void {
    this.animCallback = callback;
    this.turnTo(this.ch.pos, cell);
    this.play$Animation(this.operate);
  }
  zap$int(cell: number): void {
    this.zap$int$Callback(cell, null);
  }
  zap$int$Callback(cell: number, callback: Callback): void {
    this.animCallback = callback;
    this.turnTo(this.ch.pos, cell);
    this.play$Animation(this.zap_);
  }
  turnTo(from: number, to: number): void {
    let fx = from % Dungeon.level.width();
    let tx = to % Dungeon.level.width();
    if (tx > fx) {
      this.flipHorizontal_ = false;
    } else if (tx < fx) {
      this.flipHorizontal_ = true;
    }
  }
  jump$int$int$Callback(from: number, to: number, callback: Callback): void {
    let distance = Math.max(1, Dungeon.level.trueDistance(from, to));
    this.jump$int$int$float$float$Callback(from, to, Math.fround(distance * 2), Math.fround(distance * Math.fround(0.1)), callback);
  }
  jump$int$int$float$float$Callback(from: number, to: number, height: number, duration: number, callback: Callback): void {
    this.jumpCallback = callback;
    this.jumpTweener = new CharSprite$JumpTweener()._CharSprite$JumpTweener(this, this.worldToCamera(to), height, duration);
    this.jumpTweener.listener = this;
    this.parent.add$Gizmo(this.jumpTweener);
    this.turnTo(from, to);
  }
  die(): void {
    this.sleeping = false;
    this.processStateRemoval(CharSprite$State.PARALYSED);
    this.play$Animation(this.die_);
    this.hideEmo();
    if (this.health_ != null) {
      this.health_.killAndErase();
    }
  }
  emitter(): Emitter {
    let emitter = GameScene.emitter();
    if (emitter != null) {
      emitter.pos$Visual(this);
    }
    return emitter;
  }
  centerEmitter(): Emitter {
    let emitter = GameScene.emitter();
    if (emitter != null) {
      emitter.pos$PointF(this.center$());
    }
    return emitter;
  }
  bottomEmitter(): Emitter {
    let emitter = GameScene.emitter();
    if (emitter != null) {
      emitter.pos$float$float$float$float(this.x, Math.fround(this.y + this.height_), this.width_, 0);
    }
    return emitter;
  }
  burst(color: number, n: number): void {
    if (this.visible_) {
      Splash.at$PointF$int$int(this.center$(), color, n);
    }
  }
  bloodBurstA(from: PointF, damage: number): void {
    if (this.visible_) {
      let c = this.center$();
      let n = $J.d2i(Math.min(9 * (Math.sqrt(damage / this.ch.HT)), 9));
      Splash.at$PointF$float$float$int$int(c, PointF.angle$PointF$PointF(from, c), Math.fround(Math.fround(3.1415925) / 2), this.blood(), n);
    }
  }
  blood(): number {
    return -4521984;
  }
  flash(): void {
    this.ra = this.ba = this.ga = 1;
    this.flashTime = CharSprite.FLASH_INTERVAL;
  }
  add(state: CharSprite$State): void {
    if (state === CharSprite$State.PARALYSED) {
      this.paused_ = true;
    } else {
      {
        this.stateRemovals.remove(state);
        this.stateAdditions.add(state);
      }
    }
  }
  aura(color: number, nRays: number): void {
    this.add(CharSprite$State.AURA);
    this.auraColor = color;
    this.auraRays = nRays;
  }
  processStateAddition(state: CharSprite$State): void {
    {
      let size: number;
      switch (state) {
        case CharSprite$State.BURNING:
          if (this.burning != null) {
            this.burning.on = false;
          }
          this.burning = this.emitter();
          this.burning.pour(FlameParticle.FACTORY, Math.fround(0.06));
          if (this.visible_) {
            Sample.INSTANCE.play$Object(Assets$Sounds.BURNING);
          }
          break;
        case CharSprite$State.LEVITATING:
          if (this.levitation != null) {
            this.levitation.on = false;
          }
          this.levitation = this.emitter();
          this.levitation.pour(Speck.factory$int(Speck.JET), Math.fround(0.02));
          break;
        case CharSprite$State.INVISIBLE:
          if (this.invisible != null) {
            this.invisible.killAndErase();
          }
          this.invisible = new AlphaTweener()._AlphaTweener(this, Math.fround(0.4), Math.fround(0.4));
          if (this.parent != null) {
            this.parent.add$Gizmo(this.invisible);
          } else {
            this.alpha$float(Math.fround(0.4));
          }
          break;
        case CharSprite$State.PARALYSED:
          this.paused_ = true;
          break;
        case CharSprite$State.FROZEN:
          if (this.iceBlock != null) {
            this.iceBlock.killAndErase();
          }
          this.iceBlock = IceBlock.freeze(this);
          break;
        case CharSprite$State.ILLUMINATED:
          if (this.light != null) {
            this.light.putOut();
          }
          GameScene.effect(this.light = new TorchHalo()._TorchHalo(this));
          break;
        case CharSprite$State.CHILLED:
          if (this.chilled != null) {
            this.chilled.on = false;
          }
          this.chilled = this.emitter();
          this.chilled.pour(SnowParticle.FACTORY, Math.fround(0.1));
          break;
        case CharSprite$State.DARKENED:
          if (this.darkBlock != null) {
            this.darkBlock.killAndErase();
          }
          this.darkBlock = DarkBlock.darken(this);
          break;
        case CharSprite$State.MARKED:
          if (this.marked != null) {
            this.marked.on = false;
          }
          this.marked = this.emitter();
          this.marked.pour(ShadowParticle.UP, Math.fround(0.1));
          break;
        case CharSprite$State.HEALING:
          if (this.healing != null) {
            this.healing.on = false;
          }
          this.healing = this.emitter();
          this.healing.pour(Speck.factory$int(Speck.HEALING), 0.5);
          break;
        case CharSprite$State.SHIELDED:
          if (this.shield != null) {
            this.shield.killAndErase();
          }
          GameScene.effect(this.shield = new ShieldHalo()._ShieldHalo(this));
          break;
        case CharSprite$State.HEARTS:
          if (this.hearts != null) {
            this.hearts.on = false;
          }
          this.hearts = this.emitter();
          this.hearts.pour(Speck.factory$int(Speck.HEART), 0.5);
          break;
        case CharSprite$State.GLOWING:
          if (this.glowBlock != null) {
            this.glowBlock.killAndErase();
          }
          this.glowBlock = GlowBlock.lighten(this);
          break;
        case CharSprite$State.AURA:
          if (this.aura_ != null) {
            this.aura_.killAndErase();
          }
          size = Math.max(this.width(), this.height());
          size = Math.max(Math.fround(size + 4), 16);
          this.aura_ = new Flare()._Flare(this.auraRays, size);
          this.aura_.angularSpeed = 90;
          this.aura_.color$int$boolean(this.auraColor, true);
          this.aura_.visible_ = this.visible_;
          if (this.parent != null) {
            this.aura_.show$Visual$float(this, 0);
          }
          break;
      }
    }
  }
  remove$State(state: CharSprite$State): void {
    if (state === CharSprite$State.PARALYSED) {
      this.paused_ = false;
    } else {
      {
        this.stateAdditions.remove(state);
        this.stateRemovals.add(state);
      }
    }
  }
  clearAura(): void {
    this.remove$State(CharSprite$State.AURA);
  }
  processStateRemoval(state: CharSprite$State): void {
    switch (state) {
      case CharSprite$State.BURNING:
        if (this.burning != null) {
          this.burning.on = false;
          this.burning = null;
        }
        break;
      case CharSprite$State.LEVITATING:
        if (this.levitation != null) {
          this.levitation.on = false;
          this.levitation = null;
        }
        break;
      case CharSprite$State.INVISIBLE:
        if (this.invisible != null) {
          this.invisible.killAndErase();
          this.invisible = null;
        }
        this.alpha$float(1);
        break;
      case CharSprite$State.PARALYSED:
        this.paused_ = false;
        break;
      case CharSprite$State.FROZEN:
        if (this.iceBlock != null) {
          this.iceBlock.melt();
          this.iceBlock = null;
        }
        break;
      case CharSprite$State.ILLUMINATED:
        if (this.light != null) {
          this.light.putOut();
          this.light = null;
        }
        break;
      case CharSprite$State.CHILLED:
        if (this.chilled != null) {
          this.chilled.on = false;
          this.chilled = null;
        }
        break;
      case CharSprite$State.DARKENED:
        if (this.darkBlock != null) {
          this.darkBlock.lighten();
          this.darkBlock = null;
        }
        break;
      case CharSprite$State.MARKED:
        if (this.marked != null) {
          this.marked.on = false;
          this.marked = null;
        }
        break;
      case CharSprite$State.HEALING:
        if (this.healing != null) {
          this.healing.on = false;
          this.healing = null;
        }
        break;
      case CharSprite$State.SHIELDED:
        if (this.shield != null) {
          this.shield.putOut();
        }
        break;
      case CharSprite$State.HEARTS:
        if (this.hearts != null) {
          this.hearts.on = false;
          this.hearts = null;
        }
        break;
      case CharSprite$State.GLOWING:
        if (this.glowBlock != null) {
          this.glowBlock.darken();
          this.glowBlock = null;
        }
        break;
      case CharSprite$State.AURA:
        if (this.aura_ != null) {
          this.aura_.killAndErase();
          this.aura_ = null;
        }
        break;
    }
  }
  update(): void {
    if (this.paused_ && this.ch != null && this.curAnim != null && !this.curAnim.looped && !this.finished) {
      this.listener.onComplete$Animation(this.curAnim);
      this.finished = true;
    }
    super.update();
    if (this.flashTime > Math.fround(0) && (this.flashTime = Math.fround(this.flashTime - Game.elapsed)) <= Math.fround(0)) {
      this.resetColor();
    }
    {
      for (const $it0 = this.stateAdditions.iterator(); $it0.hasNext(); ) {
        let s = $it0.next();
        this.processStateAddition(s);
      }
      this.stateAdditions.clear();
      for (const $it1 = this.stateRemovals.iterator(); $it1.hasNext(); ) {
        let s = $it1.next();
        this.processStateRemoval(s);
      }
      this.stateRemovals.clear();
    }
    if (this.burning != null) {
      this.burning.visible_ = this.visible_;
    }
    if (this.levitation != null) {
      this.levitation.visible_ = this.visible_;
    }
    if (this.iceBlock != null) {
      this.iceBlock.visible_ = this.visible_;
    }
    if (this.light != null) {
      this.light.visible_ = this.visible_;
    }
    if (this.chilled != null) {
      this.chilled.visible_ = this.visible_;
    }
    if (this.darkBlock != null) {
      this.darkBlock.visible_ = this.visible_;
    }
    if (this.marked != null) {
      this.marked.visible_ = this.visible_;
    }
    if (this.healing != null) {
      this.healing.visible_ = this.visible_;
    }
    if (this.hearts != null) {
      this.hearts.visible_ = this.visible_;
    }
    if (this.aura_ != null) {
      if (this.aura_.parent == null) {
        this.aura_.show$Visual$float(this, 0);
      }
      this.aura_.visible_ = this.visible_;
      this.aura_.point$PointF(this.center$());
    }
    if (this.glowBlock != null) {
      this.glowBlock.visible_ = this.visible_;
    }
    if (this.sleeping) {
      this.showSleep();
    } else {
      this.hideSleep();
    }
    {
      if (this.emo != null && this.emo.alive) {
        this.emo.visible_ = this.visible_;
      }
    }
  }
  resetColor(): void {
    super.resetColor();
    if (this.invisible != null) {
      this.alpha$float(Math.fround(0.4));
    }
  }
  showSleep(): void {
    {
      if (!(this.emo instanceof EmoIcon$Sleep)) {
        if (this.emo != null) {
          this.emo.killAndErase();
        }
        this.emo = new EmoIcon$Sleep()._EmoIcon$Sleep(this);
        this.emo.visible_ = this.visible_;
      }
    }
    this.idle();
  }
  hideSleep(): void {
    {
      if (this.emo instanceof EmoIcon$Sleep) {
        this.emo.killAndErase();
        this.emo = null;
      }
    }
  }
  showAlert(): void {
    {
      if (!(this.emo instanceof EmoIcon$Alert)) {
        if (this.emo != null) {
          this.emo.killAndErase();
        }
        this.emo = new EmoIcon$Alert()._EmoIcon$Alert(this);
        this.emo.visible_ = this.visible_;
      }
    }
  }
  hideAlert(): void {
    {
      if (this.emo instanceof EmoIcon$Alert) {
        this.emo.killAndErase();
        this.emo = null;
      }
    }
  }
  showInvestigate(): void {
    {
      if (!(this.emo instanceof EmoIcon$Investigate)) {
        if (this.emo != null) {
          this.emo.killAndErase();
        }
        this.emo = new EmoIcon$Investigate()._EmoIcon$Investigate(this);
        this.emo.visible_ = this.visible_;
      }
    }
  }
  hideInvestigate(): void {
    {
      if (this.emo instanceof EmoIcon$Investigate) {
        this.emo.killAndErase();
        this.emo = null;
      }
    }
  }
  showLost(): void {
    {
      if (!(this.emo instanceof EmoIcon$Lost)) {
        if (this.emo != null) {
          this.emo.killAndErase();
        }
        this.emo = new EmoIcon$Lost()._EmoIcon$Lost(this);
        this.emo.visible_ = this.visible_;
      }
    }
  }
  hideLost(): void {
    {
      if (this.emo instanceof EmoIcon$Lost) {
        this.emo.killAndErase();
        this.emo = null;
      }
    }
  }
  hideEmo(): void {
    {
      if (this.emo != null) {
        this.emo.killAndErase();
        this.emo = null;
      }
    }
  }
  kill(): void {
    super.kill();
    this.hideEmo();
    for (let s of CharSprite$State.values()) {
      this.processStateRemoval(s);
    }
    if (this.health_ != null) {
      this.health_.killAndErase();
    }
  }
  updateMatrix(): void {
    super.updateMatrix();
    Matrix.copy(this.matrix, this.shadowMatrix);
    Matrix.translate(this.shadowMatrix, Math.fround((Math.fround(this.width_ * (Math.fround(1 - this.shadowWidth)))) / 2), Math.fround((Math.fround(this.height_ * (Math.fround(1 - this.shadowHeight)))) + this.shadowOffset));
    Matrix.scale(this.shadowMatrix, this.shadowWidth, this.shadowHeight);
  }
  draw(): void {
    if (this.texture_ == null || (!this.dirty && this.buffer == null)) {
      return;
    }
    if (this.renderShadow) {
      if (this.dirty) {
        (this.verticesBuffer).position(0);
        this.verticesBuffer.put(this.vertices);
        if (this.buffer == null) {
          this.buffer = new Vertexbuffer()._Vertexbuffer(this.verticesBuffer);
        } else {
          this.buffer.updateVertices$FloatBuffer(this.verticesBuffer);
        }
        this.dirty = false;
      }
      let script = this.script();
      this.texture_.bind();
      script.camera(this.camera());
      this.updateMatrix();
      script.uModel.valueM4(this.shadowMatrix);
      script.lighting(0, 0, 0, Math.fround(this.am * Math.fround(0.6)), 0, 0, 0, Math.fround(this.aa * Math.fround(0.6)));
      script.drawQuad$Vertexbuffer(this.buffer);
    }
    super.draw();
  }
  onComplete$Tweener(tweener: Tweener): void {
    if (tweener === this.jumpTweener) {
      if (this.visible_ && Dungeon.level.water[this.ch.pos] && !this.ch.flying) {
        GameScene.ripple(this.ch.pos);
      }
      if (this.jumpCallback != null) {
        this.jumpCallback.call();
      }
      GameScene.sortMobSprites();
    } else if (tweener === this.motion) {
      {
        this.isMoving = false;
        this.motion.killAndErase();
        this.motion = null;
        if (this.ch != null) {
          this.ch.onMotionComplete();
        }
        GameScene.sortMobSprites();
        $J.monitorNotify(this, true);
      }
    }
  }
  onComplete$Animation(anim: MovieClip$Animation): void {
    if (this.animCallback != null) {
      let executing = this.animCallback;
      this.animCallback = null;
      executing.call();
    } else {
      if (anim === this.attack) {
        this.idle();
        this.ch.onAttackComplete();
      } else if (anim === this.operate) {
        this.idle();
        this.ch.onOperateComplete();
      }
    }
  }
  static $clinit() {
    CharSprite.moveInterval = CharSprite.DEFAULT_MOVE_INTERVAL;
  }
}

export class CharSprite$State extends JEnum {
  static BURNING: CharSprite$State = null;
  static LEVITATING: CharSprite$State = null;
  static INVISIBLE: CharSprite$State = null;
  static PARALYSED: CharSprite$State = null;
  static FROZEN: CharSprite$State = null;
  static ILLUMINATED: CharSprite$State = null;
  static CHILLED: CharSprite$State = null;
  static DARKENED: CharSprite$State = null;
  static MARKED: CharSprite$State = null;
  static HEALING: CharSprite$State = null;
  static SHIELDED: CharSprite$State = null;
  static HEARTS: CharSprite$State = null;
  static GLOWING: CharSprite$State = null;
  static AURA: CharSprite$State = null;
  static $VALUES: CharSprite$State[] = null;
  _CharSprite$State($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): CharSprite$State[] { return CharSprite$State.$VALUES.slice(); }
  static valueOf(name: string): CharSprite$State { return $J.enumValueOf(CharSprite$State, name); }
  static $clinit() {
    CharSprite$State.BURNING = new CharSprite$State()._CharSprite$State('BURNING', 0);
    CharSprite$State.LEVITATING = new CharSprite$State()._CharSprite$State('LEVITATING', 1);
    CharSprite$State.INVISIBLE = new CharSprite$State()._CharSprite$State('INVISIBLE', 2);
    CharSprite$State.PARALYSED = new CharSprite$State()._CharSprite$State('PARALYSED', 3);
    CharSprite$State.FROZEN = new CharSprite$State()._CharSprite$State('FROZEN', 4);
    CharSprite$State.ILLUMINATED = new CharSprite$State()._CharSprite$State('ILLUMINATED', 5);
    CharSprite$State.CHILLED = new CharSprite$State()._CharSprite$State('CHILLED', 6);
    CharSprite$State.DARKENED = new CharSprite$State()._CharSprite$State('DARKENED', 7);
    CharSprite$State.MARKED = new CharSprite$State()._CharSprite$State('MARKED', 8);
    CharSprite$State.HEALING = new CharSprite$State()._CharSprite$State('HEALING', 9);
    CharSprite$State.SHIELDED = new CharSprite$State()._CharSprite$State('SHIELDED', 10);
    CharSprite$State.HEARTS = new CharSprite$State()._CharSprite$State('HEARTS', 11);
    CharSprite$State.GLOWING = new CharSprite$State()._CharSprite$State('GLOWING', 12);
    CharSprite$State.AURA = new CharSprite$State()._CharSprite$State('AURA', 13);
    CharSprite$State.$VALUES = [CharSprite$State.BURNING, CharSprite$State.LEVITATING, CharSprite$State.INVISIBLE, CharSprite$State.PARALYSED, CharSprite$State.FROZEN, CharSprite$State.ILLUMINATED, CharSprite$State.CHILLED, CharSprite$State.DARKENED, CharSprite$State.MARKED, CharSprite$State.HEALING, CharSprite$State.SHIELDED, CharSprite$State.HEARTS, CharSprite$State.GLOWING, CharSprite$State.AURA];
  }
}

export class CharSprite$JumpTweener extends Tweener {
  visual: CharSprite = null;
  start_: PointF = null;
  end_: PointF = null;
  height_: number = 0;
  _CharSprite$JumpTweener(visual: CharSprite, pos: PointF, height: number, time: number): this {
    this._Tweener(visual, time);
    this.visual = visual;
    this.start_ = visual.point$();
    this.end_ = pos;
    this.height_ = height;
    return this;
  }
  updateValues(progress: number): void {
    let hVal = Math.fround(Math.fround(Math.fround(Math.fround(-this.height_) * 4) * progress) * (Math.fround(1 - progress)));
    this.visual.point$PointF(PointF.inter(this.start_, this.end_, progress).offset$float$float(0, hVal));
    this.visual.shadowOffset = Math.fround(0.25 - Math.fround(hVal * Math.fround(0.8)));
  }
}

$J.define(CharSprite, 'com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite', { kind: 'class', ifaces: ['com.watabou.noosa.tweeners.Tweener$Listener', 'com.watabou.noosa.MovieClip$Listener'], sup: 'com.watabou.noosa.MovieClip', ctors: { '': '_CharSprite' }, meths: { 'onComplete(com.watabou.noosa.MovieClip$Animation)': 'onComplete$Animation', 'onComplete(com.watabou.noosa.tweeners.Tweener)': 'onComplete$Tweener', 'remove(com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite$State)': 'remove$State', 'jump(int,int,float,float,com.watabou.utils.Callback)': 'jump$int$int$float$float$Callback', 'jump(int,int,com.watabou.utils.Callback)': 'jump$int$int$Callback', 'zap(int,com.watabou.utils.Callback)': 'zap$int$Callback', 'zap(int)': 'zap$int', 'operate(int,com.watabou.utils.Callback)': 'operate$int$Callback', 'operate(int)': 'operate$int', 'attack(int,com.watabou.utils.Callback)': 'attack$int$Callback', 'attack(int)': 'attack$int', 'play(com.watabou.noosa.MovieClip$Animation)': 'play$Animation' }, clinit: true, lazy: ['moveInterval'] });
$J.define(CharSprite$State, 'com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite$State', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_CharSprite$State' }, clinit: true, lazy: ['$VALUES', 'BURNING', 'LEVITATING', 'INVISIBLE', 'PARALYSED', 'FROZEN', 'ILLUMINATED', 'CHILLED', 'DARKENED', 'MARKED', 'HEALING', 'SHIELDED', 'HEARTS', 'GLOWING', 'AURA'] });
$J.define(CharSprite$JumpTweener, 'com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite$JumpTweener', { kind: 'class', sup: 'com.watabou.noosa.tweeners.Tweener', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite,com.watabou.utils.PointF,float,float': '_CharSprite$JumpTweener' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  DarkBlock = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.DarkBlock');
  EmoIcon$Alert = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.EmoIcon$Alert');
  EmoIcon$Investigate = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.EmoIcon$Investigate');
  EmoIcon$Lost = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.EmoIcon$Lost');
  EmoIcon$Sleep = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.EmoIcon$Sleep');
  Flare = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Flare');
  FloatingText = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.FloatingText');
  GlowBlock = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.GlowBlock');
  IceBlock = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.IceBlock');
  ShieldHalo = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.ShieldHalo');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  Splash = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Splash');
  TorchHalo = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.TorchHalo');
  FlameParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.FlameParticle');
  ShadowParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.ShadowParticle');
  SnowParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.SnowParticle');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  DungeonTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTilemap');
  CharHealthIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.CharHealthIndicator');
  Matrix = $J.load('com.watabou.glwrap.Matrix');
  Vertexbuffer = $J.load('com.watabou.glwrap.Vertexbuffer');
  Camera = $J.load('com.watabou.noosa.Camera');
  Game = $J.load('com.watabou.noosa.Game');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  AlphaTweener = $J.load('com.watabou.noosa.tweeners.AlphaTweener');
  PosTweener = $J.load('com.watabou.noosa.tweeners.PosTweener');
  PointF = $J.load('com.watabou.utils.PointF');
  Random = $J.load('com.watabou.utils.Random');
});
