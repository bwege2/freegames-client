// simulation/elements/STOR.cpp
import { sd } from '../sim/simulationData.ts';
import { Element } from '../sim/element.ts';
import type { GraphicsFuncContext, Gfx } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import type { Particle } from '../sim/particle.ts';
import { FIELD_CTYPE, FIELD_TMP } from '../sim/particle.ts';
import { f } from '../sim/cpp.ts';
import {
  CFDS, ID, IPH, IPL, ITH, ITL, NT, PMODE_GLOW, PROP_NOCTYPEDRAW, SC_POWERED, TYP, TYPE_SOLID,
} from '../sim/config.ts';
import { PT_PSCN, PT_SOAP, PT_SPRK, PT_STOR } from '../sim/numbers.ts';
import { Element_SOAP_detach } from './SOAP.ts';

export function Element_STOR(el: Element): void {
  el.Identifier = 'DEFAULT_PT_STOR';
  el.Name = 'STOR';
  el.Colour = 0x50DFDF;
  el.MenuVisible = 1;
  el.MenuSection = SC_POWERED;
  el.Enabled = 1;

  el.Advection = 0.0;
  el.AirDrag = f(f(0.00) * CFDS);
  el.AirLoss = f(0.90);
  el.Loss = f(0.00);
  el.Collision = 0.0;
  el.Gravity = 0.0;
  el.Diffusion = f(0.00);
  el.HotAir = f(f(0.000) * CFDS);
  el.Falldown = 0;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 1;

  el.Weight = 100;

  el.HeatConduct = 0;
  el.Description = 'Storage. Captures and stores a single particle. Releases when charged with PSCN, also passes to PIPE.';

  el.Properties = TYPE_SOLID | PROP_NOCTYPEDRAW;
  el.CarriesTypeIn = ((1 << FIELD_CTYPE) | (1 << FIELD_TMP)) >>> 0;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = IPH;
  el.HighPressureTransition = NT;
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = ITH;
  el.HighTemperatureTransition = NT;

  el.Update = update;
  el.Graphics = graphics;
  el.CtypeDraw = ctypeDraw;
}

function update(sim: Simulation, i: number, x: number, y: number, _surround_space: number, _nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  const elements = sd.elements;
  if (!sd.IsElementOrNone(parts[i].tmp))
    parts[i].tmp = 0;
  if (parts[i].life && !parts[i].tmp)
    parts[i].life--;
  for (let rx = -2; rx <= 2; rx++) {
    for (let ry = -2; ry <= 2; ry++) {
      if (rx || ry) {
        let r = pmap[y + ry][x + rx];
        if (!r)
          r = sim.photons[y + ry][x + rx];
        if (!r)
          continue;
        if (!parts[i].tmp && !parts[i].life && TYP(r) !== PT_STOR && !(elements[TYP(r)].Properties & TYPE_SOLID) && (!parts[i].ctype || TYP(r) === parts[i].ctype)) {
          if (TYP(r) === PT_SOAP)
            Element_SOAP_detach(sim, ID(r));
          parts[i].tmp = parts[ID(r)].type;
          parts[i].temp = parts[ID(r)].temp;
          parts[i].tmp2 = parts[ID(r)].life;
          parts[i].tmp3 = parts[ID(r)].tmp;
          parts[i].tmp4 = parts[ID(r)].ctype;
          sim.kill_part(ID(r));
        }
        if (parts[i].tmp && TYP(r) === PT_SPRK && parts[ID(r)].ctype === PT_PSCN && parts[ID(r)].life > 0 && parts[ID(r)].life < 4) {
          for (let ry1 = 1; ry1 >= -1; ry1--) {
            for (let rx1 = 0; rx1 >= -1 && rx1 <= 1; rx1 = -rx1 - rx1 + 1) // Oscillate the X starting at 0, 1, -1, 3, -5, etc (Though stop at -1)
            {
              const np = sim.create_part(-1, x + rx1, y + ry1, TYP(parts[i].tmp));
              if (np !== -1) {
                parts[np].temp = parts[i].temp;
                parts[np].life = parts[i].tmp2;
                parts[np].tmp = parts[i].tmp3;
                parts[np].ctype = parts[i].tmp4;
                parts[i].tmp = 0;
                parts[i].life = 10;
                break;
              }
            }
          }
        }
      }
    }
  }
  return 0;
}

function graphics(_gfctx: GraphicsFuncContext, cpart: Particle, _nx: number, _ny: number, g: Gfx): number {
  if (cpart.tmp) {
    g.pixel_mode |= PMODE_GLOW;
    g.colr = 0x50;
    g.colg = 0xDF;
    g.colb = 0xDF;
  } else {
    g.colr = 0x20;
    g.colg = 0xAF;
    g.colb = 0xAF;
  }
  return 0;
}

function ctypeDraw(sim: Simulation, i: number, t: number, v: number): boolean {
  const elements = sd.elements;
  if (elements[t].Properties & TYPE_SOLID) {
    return false;
  }
  return Element.basicCtypeDraw(sim, i, t, v);
}
