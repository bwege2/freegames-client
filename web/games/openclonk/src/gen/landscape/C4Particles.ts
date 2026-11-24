// @ts-nocheck
// OpenClonk 36de799: src/landscape/C4Particles.cpp, src/landscape/C4Particles.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { StdThread } from '../platform/StdScheduler.ts';
import { gl$glActiveTexture, gl$glBindBuffer, gl$glBindTexture, gl$glBindVertexArray, gl$glBlendFunc, gl$glBufferData, gl$glDeleteBuffers, gl$glDisable, gl$glDrawElements, gl$glEnable, gl$glEnableVertexAttribArray, gl$glGenBuffers, gl$glPrimitiveRestartIndex, gl$glVertexAttribPointer } from '../../rt/gl.ts';
import { $i64n, $u64n, ftoi32 } from '../../rt/int.ts';
import { c$atan2, c$cos, c$cosf, c$sin, c$sinf, c$sqrtf } from '../../rt/libc.ts';
import { UnsyncedRandom$v } from '../../rt/native.ts';
import { $oadd, $oat, $oidx, $rd, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $addr, $begin, $capacity, $delete, $end, $iptr, $itcopy, $max, $memberKey, $memberOf, $min, $reserve, $throw, $vpush, UniformRealDistribution, resize, seq_assign, seq_erase, std_copy } from '../../rt/std.ts';

export class C4ParticleDefCore {
  Name = new $.StdStrBuf();
  GfxFace = new $.C4Rect();

  init() {
    this.Name = new $.StdStrBuf();
    this.GfxFace = new $.C4Rect();
    $.C4Rect.prototype.Default.call(this.GfxFace);
    return this;
  }

  CompileFunc(pComp) {
    pComp.Value$StdNamingDefaultAdapt$StdParameterAdapt$StdStrBuf$i32$x($.mkNamingAdapt$mStdParameterAdapt$StdStrBuf$i32$pi8$x$b$b($.mkParAdapt$rStdStrBuf$mi32(this.Name, 1 /*RCT_All*/), S("Name"), S("")));
    pComp.Value$StdNamingAdapt$C4Rect($.mkNamingAdapt$rC4Rect$pi8(this.GfxFace, S("Face")));
  }

  Compile(particle_source, name) {
    return $.CompileFromBuf_LogWarn$mStdNamingAdapt$C4ParticleDefCore$x$pi8($.mkNamingAdapt$rC4ParticleDefCore$pi8(this, S("Particle")), new $.StdStrBuf().init$pi8$b(particle_source), name);
  }

  $clone() { return new C4ParticleDefCore().$assign(this); }
  $assign(o) {
    this.Name.$assign(o.Name);
    this.GfxFace.$assign(o.GfxFace);
    return this;
  }
}

export class C4ParticleValueProvider {
  startValue = 0;
  endValue = 0;
  currentValue = 0;
  $u1 = new C4ParticleValueProvider$$anon1();
  $u2 = new C4ParticleValueProvider$$anon2();
  rng = new $.pcg32().init();
  keyFrameCount = 0;
  keyFrames = [];
  valueFunction = null;
  isConstant = false;
  childrenValueProviders = [];
  $u3 = new C4ParticleValueProvider$$anon3();
  typeOfValueToChange = 0;

  IsConstant() {
    return this.isConstant;
  }

  IsRandom() {
    return this.valueFunction === "Random";
  }

  init() {
    this.startValue = 0;
    this.endValue = 0;
    this.currentValue = 0;
    this.$u1.rerollInterval = 0;
    this.$u2.smoothing = 0;
    this.rng = new $.pcg32().init();
    this.keyFrameCount = 0;
    this.keyFrames = [];
    this.valueFunction = null;
    this.isConstant = true;
    this.childrenValueProviders = [];
    this.$u3.floatValueToChange = null;
    this.typeOfValueToChange = 1;
    return this;
  }

  $dtor() {
    let $t1;
    $t1 = this.childrenValueProviders;
    for (let $i1 = 0; $i1 < $t1.length; $i1++) {
      const child = P($t1, $i1);
      $delete(child.a[child.o]);
    }
  }

  Floatify(denominator) {
    0;
    if (this.valueFunction === "Direction") {
      this.FloatifyParameterValue("startValue", 1000);
      return;
    }
    this.FloatifyParameterValue("startValue", denominator);
    this.FloatifyParameterValue("endValue", denominator);
    this.FloatifyParameterValue("currentValue", denominator);
    if (this.valueFunction === "KeyFrames") {
      for (let i = 0; i < this.keyFrameCount; i = i + 1) {
        this.FloatifyParameterValue(null, 1000, 2 * i);
        this.FloatifyParameterValue(null, denominator, 2 * i + 1);
      }
    } else if (this.valueFunction === "Speed" || this.valueFunction === "Wind" || this.valueFunction === "Gravity") {
      this.FloatifyParameterValue("$u1.speedFactor", 1000);
    } else if (this.valueFunction === "Step") {
      this.FloatifyParameterValue("$u2.maxValue", denominator);
    } else if (this.valueFunction === "Sin" || this.valueFunction === "Cos") {
      this.FloatifyParameterValue("$u1.parameterValue", 1);
      this.FloatifyParameterValue("$u2.maxValue", denominator);
    }
  }

  Set$C4Value(value) {
    let valueArray = value.getArray();
    if (valueArray != null) {
      this.Set$C4ValueArray(valueArray);
    } else {
      this.Set$f32(Math.fround(value.getInt()));
    }
  }

  Set$C4ValueArray(fromArray) {
    this.startValue = this.endValue = 1;
    this.valueFunction = "Const";
    let arraySize = $u64n(fromArray.GetSize());
    if (arraySize < 2) {
      return;
    }
    let type = fromArray.op_index$i32$c(0).getInt();
    switch (type) {
      case 0:
        if (arraySize >= 2) {
          this.SetType(0 /*C4PV_Const*/);
          this.SetParameterValue(1, fromArray.op_index$i32$c(1), "startValue");
        }
        break;
      case 1:
        if (arraySize >= 3) {
          this.SetType(1 /*C4PV_Linear*/);
          this.SetParameterValue(1, fromArray.op_index$i32$c(1), "startValue");
          this.SetParameterValue(1, fromArray.op_index$i32$c(2), "endValue");
        }
        break;
      case 2:
        if (arraySize >= 3) {
          this.SetType(2 /*C4PV_Random*/);
          this.SetParameterValue(1, fromArray.op_index$i32$c(1), "startValue");
          this.SetParameterValue(1, fromArray.op_index$i32$c(2), "endValue");
          if (arraySize >= 4 && fromArray.op_index$i32$c(3).GetType() !== 0) {
            this.SetParameterValue(0, fromArray.op_index$i32$c(3), null, "$u1.rerollInterval");
          }
          if (arraySize >= 5 && fromArray.op_index$i32$c(4).GetType() !== 0) {
            this.SetParameterValue(0, fromArray.op_index$i32$c(4), null, "$u2.alreadyRolled");
            this.rng.seed$ri32(P(this.$u2, "alreadyRolled"));
          } else {
            this.rng.seed$mu32(UnsyncedRandom$v());
          }
          this.$u2.alreadyRolled = 0;
        }
        break;
      case 6:
        if (arraySize >= 2) {
          this.SetType(6 /*C4PV_Direction*/);
          this.SetParameterValue(1, fromArray.op_index$i32$c(1), "startValue");
        }
        break;
      case 7:
        if (arraySize >= 4) {
          this.SetType(7 /*C4PV_Step*/);
          this.SetParameterValue(1, fromArray.op_index$i32$c(1), "startValue");
          this.SetParameterValue(1, fromArray.op_index$i32$c(2), "currentValue");
          this.SetParameterValue(1, fromArray.op_index$i32$c(3), "$u1.delay");
          this.SetParameterValue(1, fromArray.op_index$i32$c(4), "$u2.maxValue");
          if (this.$u1.delay === 0) {
            this.$u1.delay = 1;
          }
        }
        break;
      case 3:
        if (arraySize >= 5) {
          this.SetType(3 /*C4PV_KeyFrames*/);
          this.SetParameterValue(0, fromArray.op_index$i32$c(1), null, "$u2.smoothing");
          resize(this.keyFrames, arraySize + 4 - 1, () => 0);
          this.keyFrameCount = 0;
          let startingOffset = 2;
          let i = 2;
          for (; i < arraySize; i = i + 1) {
            this.SetParameterValue(2, fromArray.op_index$i32$c(i | 0), null, null, 2 + i - 2);
          }
          this.keyFrameCount = Math.trunc((i - 2) / 2) + 2;
          this.startValue = this.keyFrames[3];
          this.endValue = this.keyFrames[2 * this.keyFrameCount - 1];
          this.keyFrames[0] = -500;
          this.keyFrames[1] = this.keyFrames[3];
          this.keyFrames[2 * this.keyFrameCount - 2] = 1500;
          this.keyFrames[2 * this.keyFrameCount - 1] = this.keyFrames[this.keyFrameCount - 1 - 2];
        }
        break;
      case 4:
      case 5:
        if (arraySize >= 3) {
          this.SetType(type);
          this.SetParameterValue(1, fromArray.op_index$i32$c(1), "$u1.parameterValue");
          this.SetParameterValue(1, fromArray.op_index$i32$c(2), "$u2.maxValue");
          this.SetParameterValue(1, fromArray.op_index$i32$c(3), "startValue");
        }
        break;
      case 8:
        if (arraySize >= 3) {
          this.SetType(8 /*C4PV_Speed*/);
          this.SetParameterValue(1, fromArray.op_index$i32$c(1), "$u1.speedFactor");
          this.SetParameterValue(1, fromArray.op_index$i32$c(2), "startValue");
        }
        break;
      case 9:
        if (arraySize >= 3) {
          this.SetType(9 /*C4PV_Wind*/);
          this.SetParameterValue(1, fromArray.op_index$i32$c(1), "$u1.speedFactor");
          this.SetParameterValue(1, fromArray.op_index$i32$c(2), "startValue");
        }
        break;
      case 10:
        if (arraySize >= 3) {
          this.SetType(10 /*C4PV_Gravity*/);
          this.SetParameterValue(1, fromArray.op_index$i32$c(1), "$u1.speedFactor");
          this.SetParameterValue(1, fromArray.op_index$i32$c(2), "startValue");
        }
        break;
      default:
        $throw(new $.C4AulExecError().init(S("invalid particle value provider supplied")));
        break;
    }
  }

  Set$f32(to) {
    this.SetType(0 /*C4PV_Const*/);
    this.startValue = this.endValue = to;
  }

  GetValue(forParticle) {
    this.UpdateChildren(forParticle);
    return this[this.valueFunction](forParticle);
  }

  UpdatePointerValue(particle, parent) {
    switch (this.typeOfValueToChange) {
      case 1:
        $memberOf(parent, this.$u3.floatValueToChange)[$memberKey(this.$u3.floatValueToChange)] = this.GetValue(particle);
        break;
      case 0:
        $memberOf(parent, this.$u3.intValueToChange)[$memberKey(this.$u3.intValueToChange)] = ftoi32(this.GetValue(particle));
        break;
      case 2:
        parent.keyFrames[this.$u3.keyFrameIndex] = this.GetValue(particle);
        break;
      default:
        0;
    }
  }

  UpdateChildren(particle) {
    for (let iter = $begin(this.childrenValueProviders); !iter.eq($end(this.childrenValueProviders)); iter.inc()) {
      iter.v.UpdatePointerValue(particle, this);
    }
  }

  FloatifyParameterValue(value, denominator, keyFrameIndex = 0) {
    let $t1;
    if (value == null) {
      this.keyFrames[keyFrameIndex] = Math.fround(this.keyFrames[keyFrameIndex] / denominator);
    } else {
      ($t1 = P($memberOf(this, value), $memberKey(value)), $t1.a[$t1.o] = Math.fround($t1.a[$t1.o] / denominator));
    }
    for (let iter = $begin(this.childrenValueProviders); !iter.eq($end(this.childrenValueProviders)); iter.inc()) {
      let child = iter.v;
      if (value == null) {
        if (child.typeOfValueToChange === 2 && child.$u3.keyFrameIndex === keyFrameIndex) {
          child.Floatify(denominator);
        }
      } else {
        if (child.$u3.floatValueToChange === value) {
          child.Floatify(denominator);
        }
      }
    }
  }

  SetParameterValue(type, value, floatVal, intVal = null, keyFrameIndex = 0) {
    if (value.GetType() === 1) {
      if (type === 1) {
        $memberOf(this, floatVal)[$memberKey(floatVal)] = Math.fround(value.getInt());
      } else if (type === 0) {
        $memberOf(this, intVal)[$memberKey(intVal)] = value.getInt();
      } else if (type === 2) {
        this.keyFrames[keyFrameIndex] = Math.fround(value.getInt());
      }
    } else if (value.GetType() === 5) {
      let child = new C4ParticleValueProvider().init();
      this.childrenValueProviders.push(child);
      child.Set$C4ValueArray(value.getArray());
      child.typeOfValueToChange = type;
      if (type === 1) {
        child.$u3.floatValueToChange = floatVal;
      } else if (type === 0) {
        child.$u3.intValueToChange = intVal;
      } else if (type === 2) {
        child.$u3.keyFrameIndex = keyFrameIndex;
      }
    } else {
      if (type === 1) {
        $memberOf(this, floatVal)[$memberKey(floatVal)] = 0;
      } else if (type === 0) {
        $memberOf(this, intVal)[$memberKey(intVal)] = 0;
      } else if (type === 2) {
        this.keyFrames[keyFrameIndex] = 0;
      }
    }
  }

  SetType(what = 0 /*C4PV_Const*/) {
    switch (what) {
      case 0:
        this.valueFunction = "Const";
        break;
      case 1:
        this.valueFunction = "Linear";
        break;
      case 2:
        this.valueFunction = "Random";
        break;
      case 6:
        this.valueFunction = "Direction";
        break;
      case 7:
        this.valueFunction = "Step";
        break;
      case 3:
        this.valueFunction = "KeyFrames";
        break;
      case 4:
        this.valueFunction = "Sin";
        break;
      case 5:
        this.valueFunction = "Cos";
        break;
      case 8:
        this.valueFunction = "Speed";
        break;
      case 9:
        this.valueFunction = "Wind";
        break;
      case 10:
        this.valueFunction = "Gravity";
        break;
      default:
        0;
    }
    ;
    if (what !== 0) {
      this.isConstant = false;
    }
  }

  Linear(forParticle) {
    return Math.fround(this.startValue + Math.fround(Math.fround(this.endValue - this.startValue) * forParticle.GetRelativeAge()));
  }

  Const(_forParticle) {
    return this.startValue;
  }

  Random(forParticle) {
    let needToReevaluate = this.$u2.alreadyRolled === 0 || forParticle.lifetime === forParticle.startingLifetime || this.$u1.rerollInterval !== 0 && ftoi32(forParticle.GetAge()) % this.$u1.rerollInterval === 0;
    if (needToReevaluate) {
      this.$u2.alreadyRolled = 1;
      let ourAddress = $addr(forParticle);
      this.rng.set_stream(ourAddress);
      this.rng.advance$u64(5);
      let distribution = new UniformRealDistribution($min(this.startValue, this.endValue), $max(this.startValue, this.endValue), 32);
      this.currentValue = distribution.call(this.rng);
    }
    return this.currentValue;
  }

  KeyFrames(forParticle) {
    let age = forParticle.GetRelativeAge();
    {
      for (let i = 0; i < this.keyFrameCount; i = i + 1) {
        if (age > this.keyFrames[i * 2]) {
          continue;
        }
        0;
        let x1 = this.keyFrames[(i - 1) * 2];
        let x2 = this.keyFrames[i * 2];
        let y1 = this.keyFrames[(i - 1) * 2 + 1];
        let y2 = this.keyFrames[i * 2 + 1];
        let position = Math.fround(Math.fround(age - x1) / Math.fround(x2 - x1));
        let totalRange = Math.fround(y2 - y1);
        let value = Math.fround(Math.fround(position * totalRange) + y1);
        return value;
      }
    }
    return this.startValue;
  }

  Sin(_forParticle) {
    return Math.fround(c$sin(this.$u1.parameterValue * 3.141592653589793 / 180) * this.$u2.maxValue + this.startValue);
  }

  Cos(_forParticle) {
    return Math.fround(c$cos(this.$u1.parameterValue * 3.141592653589793 / 180) * this.$u2.maxValue + this.startValue);
  }

  Direction(forParticle) {
    let distX = forParticle.currentSpeedX;
    let distY = forParticle.currentSpeedY;
    if (distX === 0) {
      return Math.fround(distY > 0 ? 3.141592653589793 : 0);
    }
    if (distY === 0) {
      return Math.fround(distX < 0 ? 3 * 1.5707963267948966 : 1.5707963267948966);
    }
    return Math.fround(this.startValue * Math.fround(Math.fround(c$atan2(distY, distX)) + Math.fround(1.5707963267948966)));
  }

  Step(forParticle) {
    let value = Math.fround(this.currentValue + Math.fround(Math.fround(this.startValue * forParticle.GetAge()) / this.$u1.delay));
    if (this.$u2.maxValue !== 0 && value > this.$u2.maxValue) {
      value = this.$u2.maxValue;
    }
    return value;
  }

  Speed(forParticle) {
    let distX = forParticle.currentSpeedX;
    let distY = forParticle.currentSpeedY;
    let speed = c$sqrtf(Math.fround(Math.fround(distX * distX) + Math.fround(distY * distY)));
    return Math.fround(this.startValue + Math.fround(this.$u1.speedFactor * speed));
  }

  Wind(forParticle) {
    return Math.fround(this.startValue + Math.fround(Math.fround(Math.fround(0.00999999977) * this.$u1.speedFactor) * Math.fround($.Weather.GetWind(ftoi32(forParticle.positionX), ftoi32(forParticle.positionY)))));
  }

  Gravity(_forParticle) {
    return Math.fround(this.startValue + Math.fround(this.$u1.speedFactor * $.fixtof($.Landscape.GetGravity())));
  }

  $copy(other) {
    this.rng = new $.pcg32().init();
    this.keyFrames = [];
    this.childrenValueProviders = [];
    C4ParticleValueProvider.prototype.$assign.call(this, other);
    return this;
  }
  $clone() { return new C4ParticleValueProvider().$copy(this); }
  $assign(other) {
    this.startValue = other.startValue;
    this.endValue = other.endValue;
    this.currentValue = other.currentValue;
    this.$u1.rerollInterval = other.$u1.rerollInterval;
    this.$u2.smoothing = other.$u2.smoothing;
    this.valueFunction = other.valueFunction;
    this.isConstant = other.isConstant;
    this.keyFrameCount = other.keyFrameCount;
    this.rng.$assign(other.rng);
    if (this.keyFrameCount > 0) {
      $reserve(this.keyFrames, 2 * this.keyFrameCount);
      seq_assign(this.keyFrames, $begin(other.keyFrames), $end(other.keyFrames));
    }
    this.typeOfValueToChange = other.typeOfValueToChange;
    switch (this.typeOfValueToChange) {
      case 1:
        this.$u3.floatValueToChange = other.$u3.floatValueToChange;
        break;
      case 0:
        this.$u3.intValueToChange = other.$u3.intValueToChange;
        break;
      case 2:
        this.$u3.keyFrameIndex = other.$u3.keyFrameIndex;
        break;
      default:
        0;
        break;
    }
    for (let iter = $begin(other.childrenValueProviders); !iter.eq($end(other.childrenValueProviders)); iter.inc()) {
      this.childrenValueProviders.push(new C4ParticleValueProvider().$copy(iter.v));
    }
    return this;
  }
}

export class C4ParticleValueProvider$$anon1 {
  $v = 0;
  get rerollInterval() { const v = this.$v; return v === null ? 0 : v; }
  set rerollInterval(v) { this.$v = v; }
  get delay() { return this.$v; }
  set delay(v) { this.$v = v; }
  get speedFactor() { return this.$v; }
  set speedFactor(v) { this.$v = v; }
  get parameterValue() { return this.$v; }
  set parameterValue(v) { this.$v = v; }
  $clone() { const u = new C4ParticleValueProvider$$anon1(); u.$v = this.$v; return u; }
  $assign(o) { this.$v = o.$v; return this; }
}

export class C4ParticleValueProvider$$anon2 {
  $v = 0;
  get alreadyRolled() { const v = this.$v; return v === null ? 0 : v; }
  set alreadyRolled(v) { this.$v = v; }
  get smoothing() { const v = this.$v; return v === null ? 0 : v; }
  set smoothing(v) { this.$v = v; }
  get maxValue() { return this.$v; }
  set maxValue(v) { this.$v = v; }
  $clone() { const u = new C4ParticleValueProvider$$anon2(); u.$v = this.$v; return u; }
  $assign(o) { this.$v = o.$v; return this; }
}

export class C4ParticleValueProvider$$anon3 {
  $v = null;
  get floatValueToChange() { const v = this.$v; return v === 0 ? null : v; }
  set floatValueToChange(v) { this.$v = v; }
  get intValueToChange() { const v = this.$v; return v === 0 ? null : v; }
  set intValueToChange(v) { this.$v = v; }
  get keyFrameIndex() { const v = this.$v; return v === null ? 0 : v; }
  set keyFrameIndex(v) { this.$v = v; }
  $clone() { const u = new C4ParticleValueProvider$$anon3(); u.$v = this.$v; return u; }
  $assign(o) { this.$v = o.$v; return this; }
}

export class C4ParticleProperties {
  hasConstantColor = false;
  hasCollisionVertex = false;
  size = new C4ParticleValueProvider().init();
  stretch = new C4ParticleValueProvider().init();
  forceX = new C4ParticleValueProvider().init();
  forceY = new C4ParticleValueProvider().init();
  speedDampingX = new C4ParticleValueProvider().init();
  speedDampingY = new C4ParticleValueProvider().init();
  colorR = new C4ParticleValueProvider().init();
  colorG = new C4ParticleValueProvider().init();
  colorB = new C4ParticleValueProvider().init();
  colorAlpha = new C4ParticleValueProvider().init();
  rotation = new C4ParticleValueProvider().init();
  phase = new C4ParticleValueProvider().init();
  collisionVertex = new C4ParticleValueProvider().init();
  collisionDensity = new C4ParticleValueProvider().init();
  bouncyness = 0;
  collisionCallback = null;
  blitMode = 0;
  attachment = 0;

  SetCollisionFunc(source) {
    let valueArray = null;
    if (!((valueArray = source.getArray()) != null)) {
      return;
    }
    let arraySize = valueArray.GetSize();
    if (arraySize < 1) {
      return;
    }
    let type = valueArray.op_index$i32(0).getInt();
    switch (type) {
      case 0:
        this.collisionCallback = "CollisionDie";
        break;
      case 1:
        this.collisionCallback = "CollisionBounce";
        this.bouncyness = 1;
        if (arraySize >= 2) {
          this.bouncyness = Math.fround(valueArray.op_index$i32(1).getInt());
        }
        break;
      case 2:
        this.collisionCallback = "CollisionStop";
        break;
      default:
        0;
        break;
    }
  }

  init() {
    this.size = new C4ParticleValueProvider().init();
    this.stretch = new C4ParticleValueProvider().init();
    this.forceX = new C4ParticleValueProvider().init();
    this.forceY = new C4ParticleValueProvider().init();
    this.speedDampingX = new C4ParticleValueProvider().init();
    this.speedDampingY = new C4ParticleValueProvider().init();
    this.colorR = new C4ParticleValueProvider().init();
    this.colorG = new C4ParticleValueProvider().init();
    this.colorB = new C4ParticleValueProvider().init();
    this.colorAlpha = new C4ParticleValueProvider().init();
    this.rotation = new C4ParticleValueProvider().init();
    this.phase = new C4ParticleValueProvider().init();
    this.collisionVertex = new C4ParticleValueProvider().init();
    this.collisionDensity = new C4ParticleValueProvider().init();
    this.blitMode = 0;
    this.attachment = 0;
    this.hasConstantColor = false;
    this.hasCollisionVertex = false;
    this.collisionCallback = null;
    this.bouncyness = 0;
    this.collisionDensity.Set$f32(Math.fround(50));
    this.collisionVertex.Set$f32(0);
    this.size.Set$f32(8);
    this.stretch.Set$f32(1000);
    this.forceX.Set$f32(0);
    this.forceY.Set$f32(0);
    this.speedDampingX.Set$f32(1000);
    this.speedDampingY.Set$f32(1000);
    this.colorR.Set$f32(255);
    this.colorG.Set$f32(255);
    this.colorB.Set$f32(255);
    this.colorAlpha.Set$f32(255);
    this.rotation.Set$f32(0);
    this.phase.Set$f32(0);
    return this;
  }

  Set(dataSource) {
    if (dataSource == null) {
      return;
    }
    let iter = dataSource.begin();
    let end = dataSource.end();
    for (; iter.op_ne(end); iter.op_inc$v()) {
      let p = iter.op_mul();
      let key = p.Key;
      0;
      const property = p.Value;
      if ($oat($.Strings.P, 112 /*P_R*/) === key) {
        this.colorR.Set$C4Value(property);
      } else if ($oat($.Strings.P, 125 /*P_G*/) === key) {
        this.colorG.Set$C4Value(property);
      } else if ($oat($.Strings.P, 126 /*P_B*/) === key) {
        this.colorB.Set$C4Value(property);
      } else if ($oat($.Strings.P, 127 /*P_Alpha*/) === key) {
        this.colorAlpha.Set$C4Value(property);
      } else if ($oat($.Strings.P, 123 /*P_ForceX*/) === key) {
        this.forceX.Set$C4Value(property);
      } else if ($oat($.Strings.P, 124 /*P_ForceY*/) === key) {
        this.forceY.Set$C4Value(property);
      } else if ($oat($.Strings.P, 128 /*P_DampingX*/) === key) {
        this.speedDampingX.Set$C4Value(property);
      } else if ($oat($.Strings.P, 129 /*P_DampingY*/) === key) {
        this.speedDampingY.Set$C4Value(property);
      } else if ($oat($.Strings.P, 130 /*P_Size*/) === key) {
        this.size.Set$C4Value(property);
      } else if ($oat($.Strings.P, 134 /*P_Stretch*/) === key) {
        this.stretch.Set$C4Value(property);
      } else if ($oat($.Strings.P, 131 /*P_Rotation*/) === key) {
        this.rotation.Set$C4Value(property);
      } else if ($oat($.Strings.P, 132 /*P_BlitMode*/) === key) {
        this.blitMode = property.getInt() >>> 0;
      } else if ($oat($.Strings.P, 16 /*P_Attach*/) === key) {
        this.attachment = property.getInt() >>> 0;
      } else if ($oat($.Strings.P, 133 /*P_Phase*/) === key) {
        this.phase.Set$C4Value(property);
      } else if ($oat($.Strings.P, 135 /*P_CollisionVertex*/) === key) {
        this.collisionVertex.Set$C4Value(property);
        if (property.GetType() !== 0) {
          this.hasCollisionVertex = true;
        }
      } else if ($oat($.Strings.P, 136 /*P_CollisionDensity*/) === key) {
        this.collisionDensity.Set$C4Value(property);
      } else if ($oat($.Strings.P, 137 /*P_OnCollision*/) === key) {
        this.SetCollisionFunc(property);
      }
    }
  }

  Floatify() {
    this.bouncyness = Math.fround(this.bouncyness / 1000);
    this.collisionDensity.Floatify(1);
    this.collisionVertex.Floatify(1000);
    this.size.Floatify(2);
    this.stretch.Floatify(1000);
    this.forceX.Floatify(100);
    this.forceY.Floatify(100);
    this.speedDampingX.Floatify(1000);
    this.speedDampingY.Floatify(1000);
    this.colorR.Floatify(255);
    this.colorG.Floatify(255);
    this.colorB.Floatify(255);
    this.colorAlpha.Floatify(255);
    this.rotation.Floatify(Math.fround(180 / Math.fround(3.141592653589793)));
    this.phase.Floatify(1);
    this.hasConstantColor = this.colorR.IsConstant() && this.colorG.IsConstant() && this.colorB.IsConstant() && this.colorAlpha.IsConstant();
  }

  CollisionDie(_forParticle) {
    return false;
  }

  CollisionBounce(forParticle) {
    forParticle.currentSpeedX = Math.fround(-forParticle.currentSpeedX * this.bouncyness);
    forParticle.currentSpeedY = Math.fround(-forParticle.currentSpeedY * this.bouncyness);
    return true;
  }

  CollisionStop(forParticle) {
    forParticle.currentSpeedX = 0;
    forParticle.currentSpeedY = 0;
    return true;
  }

  $clone() { return new C4ParticleProperties().$assign(this); }
  $assign(o) {
    this.hasConstantColor = o.hasConstantColor;
    this.hasCollisionVertex = o.hasCollisionVertex;
    this.size.$assign(o.size);
    this.stretch.$assign(o.stretch);
    this.forceX.$assign(o.forceX);
    this.forceY.$assign(o.forceY);
    this.speedDampingX.$assign(o.speedDampingX);
    this.speedDampingY.$assign(o.speedDampingY);
    this.colorR.$assign(o.colorR);
    this.colorG.$assign(o.colorG);
    this.colorB.$assign(o.colorB);
    this.colorAlpha.$assign(o.colorAlpha);
    this.rotation.$assign(o.rotation);
    this.phase.$assign(o.phase);
    this.collisionVertex.$assign(o.collisionVertex);
    this.collisionDensity.$assign(o.collisionDensity);
    this.bouncyness = o.bouncyness;
    this.collisionCallback = o.collisionCallback;
    this.blitMode = o.blitMode;
    this.attachment = o.attachment;
    return this;
  }
}

export class C4Particle {
  drawingData = new C4Particle$DrawingData().init();
  currentSpeedX = 0;
  currentSpeedY = 0;
  positionX = 0;
  positionY = 0;
  lifetime = 0;
  startingLifetime = 0;
  properties = new C4ParticleProperties().init();

  GetAge() {
    return Math.fround(this.startingLifetime - this.lifetime);
  }

  GetLifetime() {
    return this.lifetime;
  }

  GetRelativeAge() {
    return this.startingLifetime !== 0 ? Math.fround(1 - Math.fround(this.lifetime / this.startingLifetime)) : 0;
  }

  Init() {
    this.currentSpeedX = this.currentSpeedY = 0;
    this.positionX = this.positionY = 0;
    this.lifetime = this.startingLifetime = Math.fround(5 * 38);
  }

  init() {
    this.drawingData = new C4Particle$DrawingData().init();
    this.properties = new C4ParticleProperties().init();
    C4Particle.prototype.Init.call(this);
    return this;
  }

  SetPosition(x, y) {
    this.positionX = x;
    this.positionY = y;
    this.drawingData.SetPosition(this.positionX, this.positionY, this.properties.size.GetValue(this), this.properties.rotation.GetValue(this));
  }

  Exec(_obj, timeDelta, sourceDef) {
    this.lifetime = Math.fround(this.lifetime - timeDelta);
    if (this.startingLifetime > 0) {
      if (this.lifetime <= 0) {
        return false;
      }
    }
    let currentForceX = this.properties.forceX.GetValue(this);
    let currentForceY = this.properties.forceY.GetValue(this);
    this.currentSpeedX = Math.fround(this.currentSpeedX + currentForceX);
    this.currentSpeedY = Math.fround(this.currentSpeedY + currentForceY);
    if (this.currentSpeedX !== 0 || this.currentSpeedY !== 0) {
      let currentDampingX = this.properties.speedDampingX.GetValue(this);
      let currentDampingY = this.properties.speedDampingY.GetValue(this);
      let size = this.properties.size.GetValue(this);
      this.currentSpeedX = Math.fround(this.currentSpeedX * currentDampingX);
      this.currentSpeedY = Math.fround(this.currentSpeedY * currentDampingY);
      let collided = false;
      if (this.properties.hasCollisionVertex) {
        let collisionPoint = this.properties.collisionVertex.GetValue(this);
        let size_x = Math.fround(Math.fround((this.currentSpeedX > 0 ? size : -size) * 0.5) * collisionPoint);
        let size_y = Math.fround(Math.fround((this.currentSpeedY > 0 ? size : -size) * 0.5) * collisionPoint);
        let density = Math.fround($.GBackDensity(ftoi32(Math.fround(Math.fround(this.positionX + size_x) + Math.fround(timeDelta * this.currentSpeedX))), ftoi32(Math.fround(Math.fround(this.positionY + size_y) + Math.fround(timeDelta * this.currentSpeedY)))));
        if (Math.fround(density + 0.5) >= this.properties.collisionDensity.GetValue(this)) {
          if (this.properties.collisionCallback != null && !this.properties[this.properties.collisionCallback](this)) {
            return false;
          }
          collided = true;
        }
      }
      if (!collided) {
        this.positionX = Math.fround(this.positionX + Math.fround(timeDelta * this.currentSpeedX));
        this.positionY = Math.fround(this.positionY + Math.fround(timeDelta * this.currentSpeedY));
      }
      this.drawingData.SetPosition(this.positionX, this.positionY, size, this.properties.rotation.GetValue(this), this.properties.stretch.GetValue(this));
    } else if (!this.properties.size.IsConstant() || !this.properties.rotation.IsConstant() || !this.properties.stretch.IsConstant()) {
      this.drawingData.SetPosition(this.positionX, this.positionY, this.properties.size.GetValue(this), this.properties.rotation.GetValue(this), this.properties.stretch.GetValue(this));
    }
    if (!this.properties.hasConstantColor) {
      this.drawingData.SetColor(this.properties.colorR.GetValue(this), this.properties.colorG.GetValue(this), this.properties.colorB.GetValue(this), this.properties.colorAlpha.GetValue(this));
    }
    let currentPhase = ftoi32(Math.fround(this.properties.phase.GetValue(this) + 0.5));
    if (currentPhase !== this.drawingData.phase) {
      this.drawingData.SetPhase(currentPhase, sourceDef);
    }
    return true;
  }

  $clone() { return new C4Particle().$assign(this); }
  $assign(o) {
    this.drawingData.$assign(o.drawingData);
    this.currentSpeedX = o.currentSpeedX;
    this.currentSpeedY = o.currentSpeedY;
    this.positionX = o.positionX;
    this.positionY = o.positionY;
    this.lifetime = o.lifetime;
    this.startingLifetime = o.startingLifetime;
    this.properties.$assign(o.properties);
    return this;
  }
}

export class C4Particle$DrawingData {
  static vertexCountPerParticle;
  vertices = null;
  phase = 0;
  currentStretch = 0;
  originalSize = 0;
  sizeX = 0;
  sizeY = 0;
  aspect = 0;
  offsetX = 0;
  offsetY = 0;

  SetOffset(x, y) {
    this.offsetX = x;
    this.offsetY = y;
  }

  SetPointer(startingVertex, initial = false) {
    this.vertices = startingVertex;
    if (initial) {
      this.vertices.u = 0;
      this.vertices.v = 1;
      $oidx(this.vertices, 1).u = 0;
      $oidx(this.vertices, 1).v = 0;
      $oidx(this.vertices, 2).u = 1;
      $oidx(this.vertices, 2).v = 1;
      $oidx(this.vertices, 3).u = 1;
      $oidx(this.vertices, 3).v = 0;
      this.SetColor(1, 1, 1, 1);
      this.phase = -1;
    }
  }

  SetColor(r, g, b, a = 1) {
    for (let vertex = 0; vertex < 4; vertex = vertex + 1 | 0) {
      $oidx(this.vertices, vertex).r = r;
      $oidx(this.vertices, vertex).g = g;
      $oidx(this.vertices, vertex).b = b;
      $oidx(this.vertices, vertex).alpha = a;
    }
  }

  SetPosition(x, y, size, rotation = 0, stretch = 1) {
    if (size !== this.originalSize || stretch !== this.currentStretch) {
      this.currentStretch = stretch;
      this.originalSize = $max(size, Math.fround(9.99999974e-05));
      this.sizeX = Math.fround(this.originalSize / this.aspect);
      this.sizeY = Math.fround(this.originalSize * this.currentStretch);
    }
    if (rotation === 0) {
      this.vertices.x = Math.fround(Math.fround(x - this.sizeX) + this.offsetX);
      this.vertices.y = Math.fround(Math.fround(y + this.sizeY) + this.offsetY);
      $oidx(this.vertices, 1).x = Math.fround(Math.fround(x - this.sizeX) + this.offsetX);
      $oidx(this.vertices, 1).y = Math.fround(Math.fround(y - this.sizeY) + this.offsetY);
      $oidx(this.vertices, 2).x = Math.fround(Math.fround(x + this.sizeX) + this.offsetX);
      $oidx(this.vertices, 2).y = Math.fround(Math.fround(y + this.sizeY) + this.offsetY);
      $oidx(this.vertices, 3).x = Math.fround(Math.fround(x + this.sizeX) + this.offsetX);
      $oidx(this.vertices, 3).y = Math.fround(Math.fround(y - this.sizeY) + this.offsetY);
    } else {
      let sine = c$sinf(rotation);
      let cosine = c$cosf(rotation);
      this.vertices.x = Math.fround(Math.fround(x + Math.fround(Math.fround(-this.sizeX * cosine) - Math.fround(this.sizeY * sine))) + this.offsetX);
      this.vertices.y = Math.fround(Math.fround(y + Math.fround(Math.fround(-this.sizeX * sine) + Math.fround(this.sizeY * cosine))) + this.offsetY);
      $oidx(this.vertices, 1).x = Math.fround(Math.fround(x + Math.fround(Math.fround(-this.sizeX * cosine) - Math.fround(-this.sizeY * sine))) + this.offsetX);
      $oidx(this.vertices, 1).y = Math.fround(Math.fround(y + Math.fround(Math.fround(-this.sizeX * sine) + Math.fround(-this.sizeY * cosine))) + this.offsetY);
      $oidx(this.vertices, 2).x = Math.fround(Math.fround(x + Math.fround(Math.fround(this.sizeX * cosine) - Math.fround(this.sizeY * sine))) + this.offsetX);
      $oidx(this.vertices, 2).y = Math.fround(Math.fround(y + Math.fround(Math.fround(this.sizeX * sine) + Math.fround(this.sizeY * cosine))) + this.offsetY);
      $oidx(this.vertices, 3).x = Math.fround(Math.fround(x + Math.fround(Math.fround(this.sizeX * cosine) - Math.fround(-this.sizeY * sine))) + this.offsetX);
      $oidx(this.vertices, 3).y = Math.fround(Math.fround(y + Math.fround(Math.fround(this.sizeX * sine) + Math.fround(-this.sizeY * cosine))) + this.offsetY);
    }
  }

  SetPhase(phase, sourceDef) {
    this.phase = phase;
    phase = phase % sourceDef.Length;
    let offsetY = phase / sourceDef.PhasesX | 0;
    let offsetX = phase % sourceDef.PhasesX;
    let wdt = Math.fround(1 / Math.fround(sourceDef.PhasesX));
    let numOfLines = sourceDef.Length / sourceDef.PhasesX | 0;
    let hgt = Math.fround(1 / Math.fround(numOfLines));
    let x = Math.fround(wdt * Math.fround(offsetX));
    let y = Math.fround(hgt * Math.fround(offsetY));
    let xr = Math.fround(x + wdt);
    let yr = Math.fround(y + hgt);
    this.vertices.u = x;
    this.vertices.v = yr;
    $oidx(this.vertices, 1).u = x;
    $oidx(this.vertices, 1).v = y;
    $oidx(this.vertices, 2).u = xr;
    $oidx(this.vertices, 2).v = yr;
    $oidx(this.vertices, 3).u = xr;
    $oidx(this.vertices, 3).v = y;
  }

  init() {
    this.currentStretch = 1;
    this.originalSize = Math.fround(9.99999974e-05);
    this.aspect = 1;
    this.offsetX = 0;
    this.offsetY = 0;
    return this;
  }

  $clone() { return new C4Particle$DrawingData().$assign(this); }
  $assign(o) {
    this.vertices = o.vertices;
    this.phase = o.phase;
    this.currentStretch = o.currentStretch;
    this.originalSize = o.originalSize;
    this.sizeX = o.sizeX;
    this.sizeY = o.sizeY;
    this.aspect = o.aspect;
    this.offsetX = o.offsetX;
    this.offsetY = o.offsetY;
    return this;
  }
}

export class C4Particle$DrawingData$Vertex {
  static $layout = [["x", 0, "f32", 0], ["y", 4, "f32", 0], ["u", 8, "f32", 0], ["v", 12, "f32", 0], ["r", 16, "f32", 0], ["g", 20, "f32", 0], ["b", 24, "f32", 0], ["alpha", 28, "f32", 0]];
  static $size = 32;
  x = 0;
  y = 0;
  u = 0;
  v = 0;
  r = 0;
  g = 0;
  b = 0;
  alpha = 0;

  $clone() { return new C4Particle$DrawingData$Vertex().$assign(this); }
  $assign(o) {
    this.x = o.x;
    this.y = o.y;
    this.u = o.u;
    this.v = o.v;
    this.r = o.r;
    this.g = o.g;
    this.b = o.b;
    this.alpha = o.alpha;
    return this;
  }
}

export class C4ParticleChunk {
  sourceDefinition = null;
  blitMode = 0;
  attachment = 0;
  particles = [];
  vertexCoordinates = [];
  particleCount = 0;
  drawingDataVertexBufferObject = 0;
  drawingDataVertexArraysObject = 0;

  ClearBufferObjects() {
    if (this.drawingDataVertexBufferObject !== 0) {
      gl$glDeleteBuffers(1, P(this, "drawingDataVertexBufferObject"));
    }
    if (this.drawingDataVertexArraysObject !== 0) {
      $.pGL.FreeVAOID(this.drawingDataVertexArraysObject);
    }
    this.drawingDataVertexArraysObject = 0;
    this.drawingDataVertexBufferObject = 0;
  }

  DeleteAndReplaceParticle(indexToReplace, indexFrom) {
    let oldParticle = this.particles[indexToReplace];
    if (indexFrom !== indexToReplace) {
      std_copy(this.vertexCoordinates[indexFrom * 4], $oadd(this.vertexCoordinates[indexFrom * 4], 4), this.vertexCoordinates[indexToReplace * 4]);
      this.particles[indexToReplace] = this.particles[indexFrom];
      this.particles[indexToReplace].drawingData.SetPointer(this.vertexCoordinates[indexToReplace * 4]);
    }
    $delete(oldParticle);
  }

  init() {
    this.sourceDefinition = null;
    this.blitMode = 0;
    this.attachment = 0;
    this.particles = [];
    this.vertexCoordinates = [];
    this.particleCount = 0;
    this.drawingDataVertexBufferObject = 0;
    this.drawingDataVertexArraysObject = 0;
    return this;
  }

  $dtor() {
    C4ParticleChunk.prototype.Clear.call(this);
  }

  Clear() {
    for (let i = 0; i < this.particleCount; i = i + 1) {
      $delete(this.particles[i]);
    }
    this.particleCount = 0;
    this.particles.length = 0;
    this.vertexCoordinates.length = 0;
    this.ClearBufferObjects();
  }

  Exec(obj, timeDelta) {
    for (let i = 0; i < this.particleCount; i = i + 1) {
      if (!this.particles[i].Exec(obj, timeDelta, this.sourceDefinition)) {
        this.DeleteAndReplaceParticle(i, this.particleCount - 1);
        this.particleCount = this.particleCount - 1;
      }
    }
    return this.particleCount > 0;
  }

  Draw(_cgo, obj, call, texUnit, modelview) {
    if (this.particleCount === 0) {
      return;
    }
    let stride = 32;
    0;
    let textureRef = this.sourceDefinition.Gfx.GetFace().texture;
    0;
    if ((this.attachment & 4) >>> 0 !== 0 && obj != null) {
      let new_modelview = modelview.$clone();
      $.Translate(new_modelview, $.fixtof(obj.GetFixedX()), $.fixtof(obj.GetFixedY()), 0);
      call.SetUniformMatrix4x4$i32$StdProjectionMatrix(1, new_modelview);
    } else {
      call.SetUniformMatrix4x4$i32$StdProjectionMatrix(1, modelview);
    }
    gl$glBlendFunc(770, ((this.blitMode & 1) >>> 0 !== 0 ? 1 : 771) >>> 0);
    gl$glActiveTexture(texUnit >>> 0);
    gl$glBindTexture(3553, textureRef.texName);
    if (this.drawingDataVertexBufferObject === 0) {
      this.ClearBufferObjects();
      gl$glGenBuffers(1, P(this, "drawingDataVertexBufferObject"));
      0;
      gl$glBindBuffer(34962, this.drawingDataVertexBufferObject);
      $.pGL.ObjectLabel(33504, this.drawingDataVertexBufferObject, -1, S("<particles>/VBO"));
      this.drawingDataVertexArraysObject = $.pGL.GenVAOID();
      0;
    }
    gl$glBindBuffer(34962, this.drawingDataVertexBufferObject);
    gl$glBufferData(34962, $i64n(128 * this.particleCount), this.vertexCoordinates[0], 35048);
    gl$glBindBuffer(34962, 0);
    const vao = [0];
    let has_vao = $.pGL.GetVAO(this.drawingDataVertexArraysObject, P(vao, 0));
    gl$glBindVertexArray(vao[0]);
    0;
    0;
    if (!has_vao) {
      gl$glBindBuffer(34962, this.drawingDataVertexBufferObject);
      $.pGL.ObjectLabel(32884, vao[0], -1, S("<particles>/VAO"));
      gl$glEnableVertexAttribArray(call.GetAttribute(0) >>> 0);
      gl$glEnableVertexAttribArray(call.GetAttribute(3) >>> 0);
      gl$glEnableVertexAttribArray(call.GetAttribute(2) >>> 0);
      gl$glVertexAttribPointer(call.GetAttribute(0) >>> 0, 2, 5126, 0, 32, null);
      gl$glVertexAttribPointer(call.GetAttribute(2) >>> 0, 2, 5126, 0, 32, $iptr(8));
      gl$glVertexAttribPointer(call.GetAttribute(3) >>> 0, 4, 5126, 0, 32, $iptr(16));
    }
    gl$glBindBuffer(34963, $.Particles.GetIBO(this.particleCount));
    gl$glDrawElements(5, 5 * this.particleCount | 0, 5125, null);
    gl$glBindVertexArray(0);
  }

  IsOfType(def, _blitMode, _attachment) {
    return def === this.sourceDefinition && this.blitMode === _blitMode && this.attachment === _attachment;
  }

  IsEmpty() {
    return this.particleCount === 0;
  }

  AddNewParticle() {
    let $t1;
    let currentIndex = ($t1 = this.particleCount, this.particleCount = this.particleCount + 1, $t1);
    if (currentIndex < this.particles.length) {
      this.particles[currentIndex] = new C4Particle().init();
    } else {
      this.particles.push(new C4Particle().init());
      resize(this.vertexCoordinates, this.vertexCoordinates.length + 4, () => new C4Particle$DrawingData$Vertex());
    }
    let newParticle = this.particles[currentIndex];
    newParticle.drawingData.SetPointer(this.vertexCoordinates[currentIndex * 4], true);
    return newParticle;
  }

  ReserveSpace(forAmount) {
    let newSize = ((this.particleCount >>> 0) + forAmount >>> 0) + 1 >>> 0;
    if ($capacity(this.particles) < newSize) {
      $reserve(this.particles, $max(newSize, $capacity(this.particles) * 2 >>> 0));
    }
    while ($capacity(this.vertexCoordinates) <= Math.imul(newSize, 4) >>> 0) {
      $reserve(this.vertexCoordinates, $max(Math.imul(4, newSize) >>> 0, $capacity(this.vertexCoordinates) * 2 >>> 0));
      for (let i = 0; i < this.particleCount; i = i + 1) {
        this.particles[i].drawingData.SetPointer(this.vertexCoordinates[i * 4]);
      }
    }
  }

  $clone() { return new C4ParticleChunk().$assign(this); }
  $assign(o) {
    this.sourceDefinition = o.sourceDefinition;
    this.blitMode = o.blitMode;
    this.attachment = o.attachment;
    this.particles = o.particles.slice();
    this.vertexCoordinates = o.vertexCoordinates.slice();
    this.particleCount = o.particleCount;
    this.drawingDataVertexBufferObject = o.drawingDataVertexBufferObject;
    this.drawingDataVertexArraysObject = o.drawingDataVertexArraysObject;
    return this;
  }
}

export class C4ParticleList {
  particleChunks = [];
  targetObject = null;
  lastAccessedChunk = null;
  accessMutex = new $.CStdCSec().init();

  init(obj = null) {
    this.particleChunks = [];
    this.targetObject = obj;
    this.lastAccessedChunk = null;
    this.accessMutex = new $.CStdCSec().init();
    return this;
  }

  $dtor() {
    C4ParticleList.prototype.Clear.call(this);
  }

  Lock() {
    this.accessMutex.Enter();
  }

  Unlock() {
    this.accessMutex.Leave();
  }

  Clear() {
    this.accessMutex.Enter();
    for (let iter = $begin(this.particleChunks); !iter.eq($end(this.particleChunks)); iter.inc()) {
      $delete(iter.v);
    }
    this.particleChunks.length = 0;
    if (this.targetObject != null) {
      if (this === this.targetObject.FrontParticles) {
        this.targetObject.FrontParticles = null;
      } else if (this === this.targetObject.BackParticles) {
        this.targetObject.BackParticles = null;
      }
    } else if (this === $.Particles.globalParticles) {
      $.Particles.globalParticles = null;
    }
    this.accessMutex.Leave();
  }

  Exec(timeDelta = 1) {
    if (this.particleChunks.length === 0) {
      return;
    }
    this.accessMutex.Enter();
    for (let iter = $begin(this.particleChunks); !iter.eq($end(this.particleChunks)); iter.inc()) {
      let chunk = iter.v;
      chunk.Exec(this.targetObject, timeDelta);
    }
    this.accessMutex.Leave();
  }

  Draw(cgo, obj) {
    if (this.particleChunks.length === 0) {
      return;
    }
    $.pDraw.DeactivateBlitModulation();
    $.pDraw.ResetBlitMode();
    gl$glPrimitiveRestartIndex(0xffffffff);
    gl$glEnable(36765);
    let call = new $.C4ShaderCall().init($.pGL.GetSpriteShader$b$b$b(true, false, false));
    try {
      let modelview = $.StdProjectionMatrix.Identity();
      $.pGL.SetupMultiBlt(call, null, 0, 0, 0, 0, modelview);
      $.Translate(modelview, Math.fround(cgo.X - cgo.TargetX), Math.fround(cgo.Y - cgo.TargetY), 0);
      let texUnit = call.AllocTexUnit(6);
      this.accessMutex.Enter();
      for (let iter = $begin(this.particleChunks); !iter.eq($end(this.particleChunks)); ) {
        if (iter.v.IsEmpty()) {
          $delete(iter.v);
          iter = seq_erase(this.particleChunks, $itcopy(iter)).copy();
          this.lastAccessedChunk = null;
        } else {
          iter.v.Draw(cgo.$clone(), obj, call, texUnit, modelview);
          iter.inc();
        }
      }
      this.accessMutex.Leave();
      gl$glDisable(36765);
    } finally { call && call.$dtor(); }
  }

  GetFittingParticleChunk(def, blitMode, attachment, alreadyLocked) {
    if (!alreadyLocked) {
      this.accessMutex.Enter();
    }
    let chunk = null;
    if (this.lastAccessedChunk != null && this.lastAccessedChunk.IsOfType(def, blitMode, attachment)) {
      chunk = this.lastAccessedChunk;
    } else {
      for (let iter = $begin(this.particleChunks); !iter.eq($end(this.particleChunks)); iter.inc()) {
        let current = iter.v;
        if (!current.IsOfType(def, blitMode, attachment)) {
          continue;
        }
        chunk = current;
        break;
      }
    }
    if (chunk == null) {
      this.particleChunks.push(new C4ParticleChunk().init());
      chunk = this.particleChunks[this.particleChunks.length - 1];
      chunk.sourceDefinition = def;
      chunk.blitMode = blitMode;
      chunk.attachment = attachment;
    }
    0;
    this.lastAccessedChunk = chunk;
    if (!alreadyLocked) {
      this.accessMutex.Leave();
    }
    return chunk;
  }

  $clone() { return new C4ParticleList().$assign(this); }
  $assign(o) {
    this.particleChunks = o.particleChunks.slice();
    this.targetObject = o.targetObject;
    this.lastAccessedChunk = o.lastAccessedChunk;
    this.accessMutex.$assign(o.accessMutex);
    return this;
  }
}

export class C4ParticleSystemDefinitionList {
  first = null;
  last = null;

  init() {
    this.first = null;
    this.last = null;
    return this;
  }

  Clear() {
    while (this.first != null) {
      $delete(this.first);
    }
  }

  GetDef(name, exclude = null) {
    for (let def = this.first; def != null; def = def.next) {
      if (def !== exclude && def.Name.op_eq$pi8(name)) {
        return def;
      }
    }
    return null;
  }

  $clone() { return new C4ParticleSystemDefinitionList().$assign(this); }
  $assign(o) {
    this.first = o.first;
    this.last = o.last;
    return this;
  }
}

export class C4ParticleSystem {
  ibo = 0;
  ibo_size = 0;
  particleLists = [];
  particleListAccessMutex = new $.CStdCSec().init();
  frameCounterAdvancedEvent = new $.CStdEvent();
  calculationThread = new C4ParticleSystem$CalculationThread().init();
  currentSimulationTime = 0;
  globalParticles = null;
  definitions = new C4ParticleSystemDefinitionList().init();

  PreparePrimitiveRestartIndices(forAmount) {
    let $t1, $t2;
    if (this.ibo === 0) {
      gl$glGenBuffers(1, P(this, "ibo"));
    }
    let neededEntryAmount = Math.imul(5, forAmount) >>> 0;
    let neededIboSize = neededEntryAmount * 4;
    if (this.ibo_size >= neededIboSize) {
      return;
    }
    gl$glBindBuffer(34963, this.ibo);
    let PRI = 0xffffffff;
    let ibo_data = [];
    $reserve(ibo_data, neededEntryAmount);
    let index = 0;
    for (let i = 0; i < neededEntryAmount; i = i + 1 >>> 0) {
      if ((i + 1 >>> 0) % 5 === 0) {
        ibo_data.push(PRI);
      } else {
        ibo_data.push(($t2 = index, index = index + 1 >>> 0, $t2));
      }
    }
    this.ibo_size = neededEntryAmount * 4;
    gl$glBufferData(34963, $i64n(this.ibo_size), P(ibo_data, 0), 35044);
    gl$glBindBuffer(34963, 0);
  }

  ExecuteCalculation() {
    this.frameCounterAdvancedEvent.WaitFor(0xffffffff);
    this.frameCounterAdvancedEvent.Reset();
    let gameTime = $.Game.FrameCounter;
    if (this.currentSimulationTime < gameTime) {
      let timeDelta = 1;
      if (this.currentSimulationTime !== 0) {
        timeDelta = Math.fround(gameTime - this.currentSimulationTime | 0);
      }
      this.currentSimulationTime = gameTime;
      this.particleListAccessMutex.Enter();
      for (let iter = $begin(this.particleLists); !iter.eq($end(this.particleLists)); iter.inc()) {
        iter.v.Exec(timeDelta);
      }
      this.particleListAccessMutex.Leave();
    }
  }

  init() {
    this.particleLists = [];
    this.particleListAccessMutex = new $.CStdCSec().init();
    this.frameCounterAdvancedEvent = new $.CStdEvent().init(false);
    this.calculationThread = new C4ParticleSystem$CalculationThread().init();
    this.definitions = new C4ParticleSystemDefinitionList().init();
    this.currentSimulationTime = 0;
    this.globalParticles = null;
    this.ibo = 0;
    this.ibo_size = 0;
    return this;
  }

  $dtor() {
    C4ParticleSystem.prototype.Clear.call(this);
    this.calculationThread.SignalStop();
    C4ParticleSystem.prototype.CalculateNextStep.call(this);
  }

  CalculateNextStep() {
    this.frameCounterAdvancedEvent.Set();
  }

  Clear() {
    if (this.ibo !== 0) {
      gl$glDeleteBuffers(1, P(this, "ibo"));
    }
    this.ibo = 0;
    this.ibo_size = 0;
    this.currentSimulationTime = 0;
    this.ClearAllParticles();
    this.definitions.Clear();
  }

  DrawGlobalParticles(cgo) {
    if (this.globalParticles != null) {
      this.globalParticles.Draw(cgo.$clone(), null);
    }
  }

  GetGlobalParticles() {
    return this.globalParticles;
  }

  GetNewParticleList(forObject = null) {
    let newList = null;
    this.particleListAccessMutex.Enter();
    $vpush(this.particleLists, new C4ParticleList().init(forObject));
    newList = this.particleLists[this.particleLists.length - 1];
    this.particleListAccessMutex.Leave();
    return newList;
  }

  ReleaseParticleList(first, second = null) {
    this.particleListAccessMutex.Enter();
    for (let iter = $begin(this.particleLists); !iter.eq($end(this.particleLists)); ) {
      let list = iter.v;
      if (list === first || list === second) {
        iter = seq_erase(this.particleLists, $itcopy(iter)).copy();
      } else {
        iter.inc();
      }
    }
    this.particleListAccessMutex.Leave();
  }

  GetIBO(forParticleAmount) {
    this.PreparePrimitiveRestartIndices(forParticleAmount >>> 0);
    return this.ibo;
  }

  Create(of_def, x, y, speedX, speedY, lifetime, properties, amount = 1, object = null) {
    let $t1;
    let pxList = null;
    let particleProperties = new C4ParticleProperties().init();
    particleProperties.Set(properties);
    speedX.Floatify(10);
    speedY.Floatify(10);
    let xoff = 0;
    let yoff = 0;
    let drawingOffsetX = 0;
    let drawingOffsetY = 0;
    if (object != null) {
      xoff = Math.fround(object.GetX());
      yoff = Math.fround(object.GetY());
      if ((particleProperties.attachment & 4) >>> 0 !== 0) {
        drawingOffsetX = -xoff;
        drawingOffsetY = -yoff;
        if (!((particleProperties.attachment & 1) >>> 0 !== 0) && !((particleProperties.attachment & 2) >>> 0 !== 0)) {
          particleProperties.attachment = (particleProperties.attachment | 1) >>> 0;
        }
      }
      if ((particleProperties.attachment & 1) >>> 0 !== 0) {
        if (object.FrontParticles == null) {
          object.FrontParticles = this.GetNewParticleList(object);
        }
        pxList = object.FrontParticles;
      } else if ((particleProperties.attachment & 2) >>> 0 !== 0) {
        if (object.BackParticles == null) {
          object.BackParticles = this.GetNewParticleList(object);
        }
        pxList = object.BackParticles;
      }
    }
    if (pxList == null) {
      if (this.globalParticles == null) {
        this.globalParticles = this.GetNewParticleList();
      }
      pxList = this.globalParticles;
    }
    pxList.Lock();
    let chunk = pxList.GetFittingParticleChunk(of_def, particleProperties.blitMode, particleProperties.attachment, true);
    chunk.ReserveSpace(amount >>> 0);
    while (($t1 = amount, amount = amount - 1 | 0, $t1) !== 0) {
      let particle = chunk.AddNewParticle();
      particle.properties.$assign(particleProperties);
      particle.properties.Floatify();
      particle.lifetime = particle.startingLifetime = 0;
      let lifetime_value = lifetime.GetValue(particle);
      if (lifetime_value >= 0) {
        particle.lifetime = particle.startingLifetime = lifetime_value;
      }
      particle.currentSpeedX = speedX.GetValue(particle);
      particle.currentSpeedY = speedY.GetValue(particle);
      particle.drawingData.aspect = of_def.Aspect;
      particle.drawingData.SetOffset(drawingOffsetX, drawingOffsetY);
      particle.SetPosition(Math.fround(x.GetValue(particle) + xoff), Math.fround(y.GetValue(particle) + yoff));
      particle.drawingData.SetColor(particle.properties.colorR.GetValue(particle), particle.properties.colorG.GetValue(particle), particle.properties.colorB.GetValue(particle), particle.properties.colorAlpha.GetValue(particle));
      particle.drawingData.SetPhase(ftoi32(Math.fround(particle.properties.phase.GetValue(particle) + 0.5)), of_def);
    }
    pxList.Unlock();
  }

  ClearAllParticles() {
    this.particleListAccessMutex.Enter();
    this.particleLists.length = 0;
    this.particleListAccessMutex.Leave();
  }

  $clone() { return new C4ParticleSystem().$assign(this); }
  $assign(o) {
    this.ibo = o.ibo;
    this.ibo_size = o.ibo_size;
    this.particleLists = o.particleLists.slice();
    this.particleListAccessMutex.$assign(o.particleListAccessMutex);
    this.frameCounterAdvancedEvent.$assign(o.frameCounterAdvancedEvent);
    this.calculationThread.$assign(o.calculationThread);
    this.currentSimulationTime = o.currentSimulationTime;
    this.globalParticles = o.globalParticles;
    this.definitions.$assign(o.definitions);
    return this;
  }
}

export class C4ParticleDef extends C4ParticleDefCore {
  previous = null;
  next = null;
  Filename = new $.StdStrBuf();
  Gfx = new $.C4FacetSurface().init();
  Length = 0;
  PhasesX = 0;
  Aspect = 0;

  init() {
    super.init();
    this.Filename = new $.StdStrBuf();
    this.Gfx = new $.C4FacetSurface().init();
    $.C4FacetSurface.prototype.Default.call(this.Gfx);
    if ($.Particles.definitions.first == null) {
      this.previous = null;
      $.Particles.definitions.first = this;
    } else {
      this.previous = $.Particles.definitions.last;
      this.previous.next = this;
    }
    $.Particles.definitions.last = this;
    this.next = null;
    return this;
  }

  $dtor() {
    C4ParticleDef.prototype.Clear.call(this);
    if (this.previous != null) {
      this.previous.next = this.next;
    } else {
      $.Particles.definitions.first = this.next;
    }
    if (this.next != null) {
      this.next.previous = this.previous;
    } else {
      $.Particles.definitions.last = this.previous;
    }
  }

  Clear() {
    this.Name.Clear();
  }

  Load(group) {
    this.Filename.Copy$StdStrBuf(group.GetFullName());
    const particle_source = [null];
    if (group.LoadEntry$pi8$ppi8$pu64$i32(S("Particle.txt"), P(particle_source, 0), null, 1)) {
      if (!this.Compile(particle_source[0], this.Filename.getData())) {
        $.DebugLogF(S("invalid particle def at '%s'"), group.GetFullName().getData());
        $delete(particle_source[0]);
        return false;
      }
      $delete(particle_source[0]);
      if (!this.Gfx.Load(group, S("Graphics.png"), -1, -1, false, 2)) {
        $.DebugLogF(S("particle %s has no valid graphics defined"), this.Name.getData());
        return false;
      }
      if (this.GfxFace.Wdt !== 0) {
        this.Gfx.Set$pC4Surface$i32$i32$i32$i32(this.Gfx.Surface, this.GfxFace.x, this.GfxFace.y, this.GfxFace.Wdt, this.GfxFace.Hgt);
      }
      const Q = [0];
      this.Gfx.GetPhaseNum(P(this, "PhasesX"), P(Q, 0));
      this.Length = Math.imul(this.PhasesX, Q[0]);
      if (this.Length === 0) {
        $.DebugLogF(S("invalid facet for particle '%s'"), this.Name.getData());
        return false;
      }
      this.Aspect = Math.fround(this.Gfx.Hgt / this.Gfx.Wdt);
      let def_overload = null;
      if ((def_overload = $.Particles.definitions.GetDef(this.Name.getData(), this)) != null) {
        if ($.Config.Graphics.VerboseObjectLoading >= 1) {
          const ostr = new Int8Array(250);
          $.ssprintf$9(ostr, $.LoadResStr(S("IDS_PRC_DEFOVERLOAD")), def_overload.Name.getData(), S("<particle>"));
          $.Log(P(ostr, 0));
        }
        $delete(def_overload);
      }
      return true;
    }
    return false;
  }

  Reload() {
    if (!(this.Filename.op_index(0) !== 0)) {
      return false;
    }
    let group = new $.C4Group().init();
    if (!group.Open(this.Filename.getData())) {
      return false;
    }
    this.Clear();
    return this.Load(group);
  }

  $clone() { return new C4ParticleDef().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.previous = o.previous;
    this.next = o.next;
    this.Filename.$assign(o.Filename);
    this.Gfx.$assign(o.Gfx);
    this.Length = o.Length;
    this.PhasesX = o.PhasesX;
    this.Aspect = o.Aspect;
    return this;
  }
}

export class C4ParticleSystem$CalculationThread extends StdThread {

  Execute() {
    $.Particles.ExecuteCalculation();
  }

  init() {
    $.StdThread.prototype.Start.call(this);
    return this;
  }

  $clone() { return new C4ParticleSystem$CalculationThread().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}


export function $init(): void {
  C4Particle$DrawingData.vertexCountPerParticle = 4;
  $.Particles = new C4ParticleSystem(); $.Particles.init();
}

Object.assign($, { C4Particle, C4Particle$DrawingData, C4Particle$DrawingData$Vertex, C4ParticleChunk, C4ParticleDef, C4ParticleDefCore, C4ParticleList, C4ParticleProperties, C4ParticleSystem, C4ParticleSystem$CalculationThread, C4ParticleSystemDefinitionList, C4ParticleValueProvider, C4ParticleValueProvider$$anon1, C4ParticleValueProvider$$anon2, C4ParticleValueProvider$$anon3 });
