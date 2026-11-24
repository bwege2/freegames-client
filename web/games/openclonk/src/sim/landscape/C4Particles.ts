// @ts-nocheck
// OpenClonk 36de799: src/landscape/C4Particles.cpp, src/landscape/C4Particles.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete } from '../../rt/std.ts';

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

  GetDef(_name, _exclude = null) {
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
  definitions = new C4ParticleSystemDefinitionList().init();

  CalculateNextStep() {
  }

  Clear() {
    this.definitions.Clear();
  }

  DrawGlobalParticles(_cgo) {
  }

  GetGlobalParticles() {
    return null;
  }

  GetNewParticleList(_forObject = null) {
    return null;
  }

  ReleaseParticleList(_first, _second = null) {
  }

  ClearAllParticles() {
  }

  None() {
    this.definitions = new C4ParticleSystemDefinitionList().init();
    return this;
  }

  $clone() { return new C4ParticleSystem().$assign(this); }
  $assign(o) {
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
          $.ssprintf$6(ostr, $.LoadResStr(S("IDS_PRC_DEFOVERLOAD")), def_overload.Name.getData(), S("<particle>"));
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


export function $init(): void {
  $.Particles = new C4ParticleSystem(); $.Particles.None();
}

Object.assign($, { C4ParticleDef, C4ParticleDefCore, C4ParticleSystem, C4ParticleSystemDefinitionList });
