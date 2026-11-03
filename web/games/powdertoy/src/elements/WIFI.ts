// simulation/elements/WIFI.cpp
import type { Element, GraphicsFuncContext, Gfx } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { f, itrunc } from '../sim/cpp.ts';
import { CFDS, CHANNELS, EFFECT_DBGLINES, ID, IPL, ITH, ITL, NT, SC_ELEC, TYP, TYPE_SOLID } from '../sim/config.ts';
import { PT_BRMT, PT_INWR, PT_NSCN, PT_PSCN, PT_SPRK } from '../sim/numbers.ts';

export function Element_WIFI(el: Element): void {
  el.Identifier = 'DEFAULT_PT_WIFI';
  el.Name = 'WIFI';
  el.Colour = 0x40A060;
  el.MenuVisible = 1;
  el.MenuSection = SC_ELEC;
  el.Enabled = 1;

  el.Advection = f(0.0);
  el.AirDrag = f(f(0.00) * CFDS);
  el.AirLoss = f(0.90);
  el.Loss = f(0.00);
  el.Collision = f(0.0);
  el.Gravity = f(0.0);
  el.Diffusion = f(0.00);
  el.HotAir = f(f(0.000) * CFDS);
  el.Falldown = 0;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 2;

  el.Weight = 100;

  el.HeatConduct = 0;
  el.Description = 'Wireless transmitter, transfers spark to any other wifi on the same temperature channel.';

  el.Properties = TYPE_SOLID;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = f(15.0);
  el.HighPressureTransition = PT_BRMT; //@ WIFI -> BRMT
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = ITH;
  el.HighTemperatureTransition = NT;

  el.Update = update;
  el.Graphics = graphics;
}

function update(sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  parts[i].tmp = itrunc(f(f(f(parts[i].temp - f(73.15)) / 100) + 1));
  if (parts[i].tmp >= CHANNELS) parts[i].tmp = CHANNELS - 1;
  else if (parts[i].tmp < 0) parts[i].tmp = 0;
  for (let rx = -1; rx <= 1; rx++) {
    for (let ry = -1; ry <= 1; ry++) {
      if (rx || ry) {
        const r = pmap[y + ry][x + rx];
        if (!r)
          continue;
        // wireless[][0] - whether channel is active on this frame
        // wireless[][1] - whether channel should be active on next frame
        if (sim.wireless[parts[i].tmp][0]) {
          if ((TYP(r) === PT_NSCN || TYP(r) === PT_PSCN || TYP(r) === PT_INWR) && parts[ID(r)].life === 0 && sim.wireless[parts[i].tmp][0]) {
            parts[ID(r)].ctype = TYP(r);
            sim.part_change_type(ID(r), x + rx, y + ry, PT_SPRK);
            parts[ID(r)].life = 4;
          }
        }
        if (TYP(r) === PT_SPRK && parts[ID(r)].ctype !== PT_NSCN && parts[ID(r)].life >= 3) {
          sim.wireless[parts[i].tmp][1] = 1;
          sim.ISWIRE = 2;
        }
      }
    }
  }
  return 0;
}

const FREQUENCY = f(0.0628);

function graphics(_gfctx: GraphicsFuncContext, cpart: Particle, _nx: number, _ny: number, g: Gfx): number {
  const q = itrunc(f(f(f(cpart.temp - f(73.15)) / 100) + 1));
  // sin(float) of the global namespace: computed in double
  g.colr = itrunc(Math.sin(f(f(FREQUENCY * q) + 0)) * 127 + 128);
  g.colg = itrunc(Math.sin(f(f(FREQUENCY * q) + 2)) * 127 + 128);
  g.colb = itrunc(Math.sin(f(f(FREQUENCY * q) + 4)) * 127 + 128);
  g.pixel_mode |= EFFECT_DBGLINES;
  return 0;
}
