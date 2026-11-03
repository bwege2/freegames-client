// simulation/elements/PIPE.cpp
import { sd } from '../sim/simulationData.ts';
import { Element, type GraphicsFuncContext, type Gfx } from '../sim/element.ts';
import type { Simulation } from '../sim/simulation.ts';
import { Particle, FIELD_CTYPE } from '../sim/particle.ts';
import { f, itrunc } from '../sim/cpp.ts';
import {
  CELL, CFDS, CHANNELS, ID, IPL, ITH, ITL, NT, PROP_LIFE_DEC, PT_NUM, SC_FORCE, TYP, TYPE_ENERGY, TYPE_GAS,
  TYPE_LIQUID, TYPE_PART, TYPE_SOLID, WL_ALLOWAIR, WL_EWALL, WL_WALL, WL_WALLELEC,
} from '../sim/config.ts';
import {
  PT_BRCK, PT_BRMT, PT_FIGH, PT_HEAC, PT_PIPE, PT_PPIP, PT_PRTI, PT_SOAP, PT_STKM, PT_STKM2, PT_STOR,
} from '../sim/numbers.ts';
import { Blue, Green, Red } from '../sim/colour.ts';
import { Element_SOAP_detach } from './SOAP.ts';
import { Element_PPIP_flood_trigger } from './PPIP.ts';

// PIPE.h declares Element_PPIP_flood_trigger (defined in PPIP.cpp)
export { Element_PPIP_flood_trigger };

// PIPE.h
// 0x00000100 is single pixel pipe
// 0x00000200 will transfer like a single pixel pipe when in forward mode
// 0x00001C00 forward single pixel pipe direction
// 0x00002000 will transfer like a single pixel pipe when in reverse mode
// 0x0001C000 reverse single pixel pipe direction
// 0x000E0000 PIPE color data stored here

export const PFLAG_CAN_CONDUCT            = 0x00000001;
export const PFLAG_PARTICLE_DECO          = 0x00000002; // differentiate particle deco from pipe deco
export const PFLAG_NORMALSPEED            = 0x00010000;
export const PFLAG_INITIALIZING           = 0x00020000; // colors haven't been set yet
export const PFLAG_COLOR_RED              = 0x00040000;
export const PFLAG_COLOR_GREEN            = 0x00080000;
export const PFLAG_COLOR_BLUE             = 0x000C0000;
export const PFLAG_COLORS                 = 0x000C0000;

export function Element_PIPE(el: Element): void {
  el.Identifier = 'DEFAULT_PT_PIPE';
  el.Name = 'PIPE';
  el.Colour = 0x444444;
  el.MenuVisible = 1;
  el.MenuSection = SC_FORCE;
  el.Enabled = 1;

  el.Advection = f(0.0);
  el.AirDrag = f(f(0.00) * CFDS);
  el.AirLoss = f(0.95);
  el.Loss = f(0.00);
  el.Collision = f(0.0);
  el.Gravity = f(0.0);
  el.Diffusion = f(0.00);
  el.HotAir = f(f(0.000) * CFDS);
  el.Falldown = 0;

  el.Flammable = 0;
  el.Explosive = 0;
  el.Meltable = 0;
  el.Hardness = 0;

  el.Weight = 100;

  el.DefaultProperties.temp = f(295.15);
  el.HeatConduct = 251;
  el.Description = 'PIPE, moves particles around. Once the BRCK generates, erase some for the exit. Then the PIPE generates and is usable.';

  el.Properties = TYPE_SOLID | PROP_LIFE_DEC;
  el.CarriesTypeIn = ((1 << FIELD_CTYPE)) >>> 0;

  el.LowPressure = IPL;
  el.LowPressureTransition = NT;
  el.HighPressure = f(10.0);
  el.HighPressureTransition = PT_BRMT; //@ PIPE -> BRMT
  el.LowTemperature = ITL;
  el.LowTemperatureTransition = NT;
  el.HighTemperature = ITH;
  el.HighTemperatureTransition = NT;

  el.DefaultProperties.life = 60;

  el.Update = Element_PIPE_update;
  el.Graphics = Element_PIPE_graphics;
}

const PPIP_TMPFLAG_REVERSED        = 0x01000000;
const PPIP_TMPFLAG_PAUSED          = 0x02000000;
const PPIP_TMPFLAG_TRIGGER_REVERSE = 0x04000000;
const PPIP_TMPFLAG_TRIGGER_OFF     = 0x08000000;
const PPIP_TMPFLAG_TRIGGER_ON      = 0x10000000;
const PPIP_TMPFLAG_TRIGGERS        = 0x1C000000;

/** std::array<Vec2<int>, 8> */
export const Element_PIPE_offsets: readonly { readonly X: number; readonly Y: number }[] = [
  { X: -1, Y: -1 },
  { X: -1, Y:  0 },
  { X: -1, Y:  1 },
  { X:  0, Y: -1 },
  { X:  0, Y:  1 },
  { X:  1, Y: -1 },
  { X:  1, Y:  0 },
  { X:  1, Y:  1 },
];

export function Element_PIPE_transformPatchOffsets(part: Particle, offsetMap: readonly number[]): void {
  if (part.tmp & 0x00000200) part.tmp = (part.tmp & 0xFFFFE3FF) | (offsetMap[(part.tmp & 0x00001C00) >> 10] << 10);
  if (part.tmp & 0x00002000) part.tmp = (part.tmp & 0xFFFE3FFF) | (offsetMap[(part.tmp & 0x0001C000) >> 14] << 14);
}

function prevColor(flags: number): number {
  const color = (flags & PFLAG_COLORS) >>> 0;
  if (color === PFLAG_COLOR_RED)
    return PFLAG_COLOR_GREEN;
  else if (color === PFLAG_COLOR_GREEN)
    return PFLAG_COLOR_BLUE;
  else if (color === PFLAG_COLOR_BLUE)
    return PFLAG_COLOR_RED;
  return PFLAG_COLOR_RED;
}

function nextColor(flags: number): number {
  let color = (flags & PFLAG_COLORS) >>> 0;
  if (color === PFLAG_COLOR_RED)
    return PFLAG_COLOR_BLUE;
  else if (color === PFLAG_COLOR_BLUE)
    color = PFLAG_COLOR_GREEN;
  else if (color === PFLAG_COLOR_GREEN)
    return PFLAG_COLOR_RED;
  return PFLAG_COLOR_GREEN;
}

export function Element_PIPE_update(sim: Simulation, i: number, x: number, y: number, surround_space: number, nt: number,
  parts: Particle[], pmap: Int32Array[]): number {
  const elements = sd.elements;
  if (parts[i].ctype && !elements[TYP(parts[i].ctype)].Enabled)
    parts[i].ctype = 0;
  if (parts[i].tmp & PPIP_TMPFLAG_TRIGGERS) {
    let pause_changed = 0;
    if (parts[i].tmp & PPIP_TMPFLAG_TRIGGER_ON) // TRIGGER_ON overrides TRIGGER_OFF
    {
      if (parts[i].tmp & PPIP_TMPFLAG_PAUSED)
        pause_changed = 1;
      parts[i].tmp &= ~PPIP_TMPFLAG_PAUSED;
    }
    else if (parts[i].tmp & PPIP_TMPFLAG_TRIGGER_OFF) {
      if (!(parts[i].tmp & PPIP_TMPFLAG_PAUSED))
        pause_changed = 1;
      parts[i].tmp |= PPIP_TMPFLAG_PAUSED;
    }
    if (pause_changed) {
      for (let rx = -2; rx <= 2; rx++) {
        for (let ry = -2; ry <= 2; ry++) {
          if (rx || ry) {
            const r = pmap[y + ry][x + rx];
            if (TYP(r) === PT_BRCK) {
              if (parts[i].tmp & PPIP_TMPFLAG_PAUSED)
                parts[ID(r)].tmp = 0;
              else
                parts[ID(r)].tmp = 1; //make surrounding BRCK glow
            }
          }
        }
      }
    }

    if (parts[i].tmp & PPIP_TMPFLAG_TRIGGER_REVERSE) {
      parts[i].tmp ^= PPIP_TMPFLAG_REVERSED;
      // Switch colors so it goes in reverse
      if ((parts[i].tmp & PFLAG_COLORS) !== PFLAG_COLOR_GREEN)
        parts[i].tmp ^= PFLAG_COLOR_GREEN;
      if (parts[i].tmp & 0x100) //Switch one pixel pipe direction
      {
        const coords = (parts[i].tmp >> 13) & 0xF;
        const coords2 = (parts[i].tmp >> 9) & 0xF;
        parts[i].tmp &= ~0x1FE00;
        parts[i].tmp |= coords << 9;
        parts[i].tmp |= coords2 << 13;
      }
    }

    parts[i].tmp &= ~PPIP_TMPFLAG_TRIGGERS;
  }
  if ((parts[i].tmp & PFLAG_COLORS) && !(parts[i].tmp & PPIP_TMPFLAG_PAUSED)) {
    if (parts[i].life === 3) {
      let lastneighbor = -1;
      let neighborcount = 0;
      let count = 0;
      let heatPipe = false;
      // make automatic pipe pattern
      for (let rx = -1; rx <= 1; rx++) {
        for (let ry = -1; ry <= 1; ry++) {
          if (rx || ry) {
            count++;
            const r = pmap[y + ry][x + rx];
            if (!r)
              continue;
            if (TYP(r) === PT_HEAC) {
              heatPipe = true;
              continue;
            }
            if (TYP(r) !== PT_PIPE && TYP(r) !== PT_PPIP)
              continue;
            const next = nextColor(parts[i].tmp);
            const prev = prevColor(parts[i].tmp);
            if (parts[ID(r)].tmp & PFLAG_INITIALIZING) {
              parts[ID(r)].tmp |= next;
              parts[ID(r)].tmp &= ~PFLAG_INITIALIZING;
              parts[ID(r)].life = 6;
              // Is a single pixel pipe
              if (parts[i].tmp & 0x100) {
                // Will transfer to a single pixel pipe
                parts[ID(r)].tmp |= 0x200;
                // Coords of where it came from
                parts[ID(r)].tmp |= (count - 1) << 10;
                parts[i].tmp |= (8 - count) << 14;
                parts[i].tmp |= 0x2000;
              }
              neighborcount++;
              lastneighbor = ID(r);
            }
            else if (((parts[ID(r)].tmp & PFLAG_COLORS) >>> 0) !== prev) {
              neighborcount++;
              lastneighbor = ID(r);
            }
          }
        }
      }
      if (neighborcount === 1)
        parts[lastneighbor].tmp |= 0x100;
      if (heatPipe)
        Element_PPIP_flood_trigger(sim, x, y, PT_HEAC);
    }
    else {
      if (parts[i].flags & PFLAG_NORMALSPEED)//skip particle push to prevent particle number being higher causing speed up
      {
        parts[i].flags &= ~PFLAG_NORMALSPEED;
      }
      else {
        pushParticle(sim, i, 0, i);
      }

      if (nt)//there is something besides PIPE around current particle
      {
        const rndstore = sim.rng.gen();
        const rnd = rndstore & 7;
        const rx = Element_PIPE_offsets[rnd].X;
        const ry = Element_PIPE_offsets[rnd].Y;
        let r = pmap[y + ry][x + rx];
        if (!r)
          r = sim.photons[y + ry][x + rx];
        if (surround_space && !r && TYP(parts[i].ctype))  //creating at end
        {
          const np = sim.create_part(-1, x + rx, y + ry, TYP(parts[i].ctype));
          if (np !== -1) {
            Element_PIPE_transfer_pipe_to_part(sim, parts[i], parts[np], false);
          }
        }
        //try eating particle at entrance
        else if (!TYP(parts[i].ctype) && (elements[TYP(r)].Properties & (TYPE_PART | TYPE_LIQUID | TYPE_GAS | TYPE_ENERGY))) {
          if (TYP(r) === PT_SOAP)
            Element_SOAP_detach(sim, ID(r));
          Element_PIPE_transfer_part_to_pipe(parts[ID(r)], parts[i]);
          sim.kill_part(ID(r));
        }
        else if (!TYP(parts[i].ctype) && TYP(r) === PT_STOR && sd.IsElement(parts[ID(r)].tmp) && (elements[parts[ID(r)].tmp].Properties & (TYPE_PART | TYPE_LIQUID | TYPE_GAS | TYPE_ENERGY))) {
          // STOR stores properties in the same places as PIPE does
          transfer_pipe_to_pipe(parts[ID(r)], parts[i], true);
        }
      }
    }
  }
  else if (!(parts[i].tmp & (PFLAG_COLORS | PFLAG_INITIALIZING)) && parts[i].life <= 10) {
    // make a border
    for (let rx = -2; rx <= 2; rx++) {
      for (let ry = -2; ry <= 2; ry++) {
        if (rx || ry) {
          const r = pmap[y + ry][x + rx];
          if (!r) {
            // BRCK border
            //@ PIPE -> PIPE + BRCK
            const index = sim.create_part(-1, x + rx, y + ry, PT_BRCK);
            if (parts[i].type === PT_PPIP && index !== -1)
              parts[index].tmp = 1;
          }
        }
      }
    }
    if (parts[i].life <= 1)
      parts[i].tmp |= PFLAG_INITIALIZING;
  }
  // Wait for empty space before starting to generate automatic pipe pattern
  else if (parts[i].tmp & PFLAG_INITIALIZING) {
    if (!parts[i].life) {
      for (let rx = -1; rx <= 1; rx++) {
        for (let ry = -1; ry <= 1; ry++) {
          if (rx || ry) {
            const cy = ((y + ry) / CELL) | 0, cx = ((x + rx) / CELL) | 0;
            if (!pmap[y + ry][x + rx] && sim.bmap[cy][cx] !== WL_ALLOWAIR && sim.bmap[cy][cx] !== WL_WALL && sim.bmap[cy][cx] !== WL_WALLELEC && (sim.bmap[cy][cx] !== WL_EWALL || sim.emap[cy][cx]))
              parts[i].life = 50;
          }
        }
      }
    }
    else if (parts[i].life === 5)//check for beginning of pipe single pixel
    {
      let issingle = 1;
      for (let rx = -1; rx <= 1; rx++) {
        for (let ry = -1; ry <= 1; ry++) {
          if (rx || ry) {
            const r = pmap[y + ry][x + rx];
            if ((TYP(r) === PT_PIPE || TYP(r) === PT_PPIP) && parts[i].life)
              issingle = 0;
          }
        }
      }
      if (issingle)
        parts[i].tmp |= 0x100;
    }
    else if (parts[i].life === 2) {
      parts[i].tmp |= PFLAG_COLOR_RED;
      parts[i].tmp &= ~PFLAG_INITIALIZING;
      parts[i].life = 6;
    }
  }
  return 0;
}

/** gcache_item (graphics/gcache_item.h) as SimulationData::graphicscache holds it */
interface GcacheItem {
  isready: number;
  pixel_mode: number;
  cola: number; colr: number; colg: number; colb: number;
  firea: number; firer: number; fireg: number; fireb: number;
}

export function Element_PIPE_graphics(gfctx: GraphicsFuncContext, cpart: Particle, nx: number, ny: number, g: Gfx): number {
  const elements = sd.elements;
  const graphicscache = (sd as unknown as { graphicscache: GcacheItem[] }).graphicscache;
  const t = TYP(cpart.ctype);
  if (t > 0 && t < PT_NUM && elements[t].Enabled) {
    if (t === PT_STKM || t === PT_STKM2 || t === PT_FIGH)
      return 0;
    if (graphicscache[t].isready) {
      g.pixel_mode = graphicscache[t].pixel_mode;
      g.cola = graphicscache[t].cola;
      g.colr = graphicscache[t].colr;
      g.colg = graphicscache[t].colg;
      g.colb = graphicscache[t].colb;
      g.firea = graphicscache[t].firea;
      g.firer = graphicscache[t].firer;
      g.fireg = graphicscache[t].fireg;
      g.fireb = graphicscache[t].fireb;
    }
    else {
      // We emulate the graphics of the stored particle. We need a const Particle *cpart to pass to the graphics function,
      // but we don't have a Particle that is populated the way the graphics function expects, so we construct a temporary
      // one and present that to it.
      //
      // Native graphics functions are well-behaved and use the cpart we give them, no questions asked, so we can just have
      // the Particle on stack. Swapping the pointers in cpart with tpart takes care of passing the particle on stack to the
      // native graphics function. Lua graphics functions are more complicated to appease: they access particle data through the
      // particle ID, so not only do we have to give them a correctly populated Particle, it also has to be somewhere in Simulation.
      // luaGraphicsWrapper takes care of this.
      const colour = elements[t].Colour;
      g.colr = Red(colour);
      g.colg = Green(colour);
      g.colb = Blue(colour);
      const graphics = elements[t].Graphics;
      if (graphics) {
        const tpart = new Particle();
        props_pipe_to_part(cpart, tpart, false);
        const prevPipeSubcallCpart = gfctx.pipeSubcallCpart;
        const prevPipeSubcallTpart = gfctx.pipeSubcallTpart;
        gfctx.pipeSubcallCpart = cpart;
        gfctx.pipeSubcallTpart = tpart;
        cpart = gfctx.pipeSubcallTpart!;
        graphics(gfctx, cpart, nx, ny, g);
        cpart = gfctx.pipeSubcallCpart!;
        gfctx.pipeSubcallCpart = prevPipeSubcallCpart;
        gfctx.pipeSubcallTpart = prevPipeSubcallTpart;
      }
      else {
        Element.defaultGraphics(gfctx, cpart, nx, ny, g);
      }
    }
  }
  else {
    switch (cpart.tmp & PFLAG_COLORS) {
      case PFLAG_COLOR_RED:
        g.colr = 50;
        g.colg = 1;
        g.colb = 1;
        break;
      case PFLAG_COLOR_GREEN:
        g.colr = 1;
        g.colg = 50;
        g.colb = 1;
        break;
      case PFLAG_COLOR_BLUE:
        g.colr = 1;
        g.colg = 1;
        g.colb = 50;
        break;
      default:
        break;
    }
  }
  return 0;
}

function props_pipe_to_part(pipe: Particle, part: Particle, STOR: boolean): void {
  const elements = sd.elements;
  // STOR also calls this function to move particles from STOR to PRTI
  // PIPE was changed, so now PIPE and STOR don't use the same particle storage format
  if (STOR) {
    part.type = TYP(pipe.tmp);
  }
  else {
    part.type = TYP(pipe.ctype);
  }
  part.temp = pipe.temp;
  part.life = pipe.tmp2;
  part.tmp = pipe.tmp3;
  part.ctype = pipe.tmp4;

  if (!(elements[part.type].Properties & TYPE_ENERGY)) {
    part.vx = 0.0;
    part.vy = 0.0;
  }
  part.tmp2 = 0;
  part.flags = 0;
  part.dcolour = 0;
}

export function Element_PIPE_transfer_pipe_to_part(_sim: Simulation, pipe: Particle, part: Particle, STOR: boolean): void {
  props_pipe_to_part(pipe, part, STOR);
  if (STOR) {
    pipe.tmp = 0;
  }
  else {
    pipe.ctype = 0;

    // If deco originated from particle, and not PIPE, then copy it
    if (pipe.tmp & PFLAG_PARTICLE_DECO) {
      part.dcolour = pipe.dcolour;
      pipe.dcolour = 0;
    }
  }
}

export function Element_PIPE_transfer_part_to_pipe(part: Particle, pipe: Particle): void {
  pipe.ctype = part.type;

  if ((pipe.tmp & PFLAG_CAN_CONDUCT) === 0)
    pipe.temp = part.temp;
  else {
    const elements = sd.elements;
    const c_pipe = elements[pipe.type].HeatCapacity;
    const c_part = elements[part.type].HeatCapacity;

    pipe.temp = f(f(f(c_part * part.temp) + f(c_pipe * pipe.temp)) / f(c_part + c_pipe));
  }

  pipe.tmp2 = part.life;
  pipe.tmp3 = part.tmp;
  pipe.tmp4 = part.ctype;

  if (part.dcolour && !pipe.dcolour) {
    pipe.dcolour = part.dcolour;
    pipe.tmp |= PFLAG_PARTICLE_DECO;
  }
}

function transfer_pipe_to_pipe(src: Particle, dest: Particle, STOR: boolean): void {
  // STOR to PIPE
  if (STOR) {
    dest.ctype = src.tmp;
    src.tmp = 0;
  }
  else {
    dest.ctype = src.ctype;
    src.ctype = 0;

    if (src.tmp & PFLAG_PARTICLE_DECO) {
      // Even if source pipe has particle deco, don't override existing pipe deco. Just delete source deco only.
      if (!dest.dcolour) {
        dest.dcolour = src.dcolour;
        dest.tmp |= PFLAG_PARTICLE_DECO;
      }
      src.dcolour = 0;
      src.tmp &= ~PFLAG_PARTICLE_DECO;
    }
  }

  if ((dest.tmp & PFLAG_CAN_CONDUCT) === 0)
    dest.temp = src.temp;
  else {
    const elements = sd.elements;
    const src_ctype = src.ctype;
    const c_src = (0 < src_ctype && src_ctype < PT_NUM) ? elements[src_ctype].HeatCapacity : 1.0;
    const c_dest = elements[dest.type].HeatCapacity;

    dest.temp = f(f(f(c_src * src.temp) + f(c_dest * dest.temp)) / f(c_src + c_dest));
  }

  dest.tmp2 = src.tmp2;
  dest.tmp3 = src.tmp3;
  dest.tmp4 = src.tmp4;
}

function pushParticle(sim: Simulation, i: number, count: number, original: number): void {
  const notctype = nextColor(sim.parts[i].tmp);
  if (!TYP(sim.parts[i].ctype) || count >= 2)//don't push if there is nothing there, max speed of 2 per frame
    return;
  const x = itrunc(f(sim.parts[i].x + f(0.5)));
  const y = itrunc(f(sim.parts[i].y + f(0.5)));
  if (!(sim.parts[i].tmp & 0x200)) {
    //normal random push
    let rndstore = sim.rng.gen();
    // RAND_MAX is at least 32767 on all platforms i.e. pow(8,5)-1
    // so can go 5 cycles without regenerating rndstore
    // (although now we use our own randomizer so maybe should reevaluate all the rndstore usages in every element)
    for (let q = 0; q < 3; q++)//try to push 3 times
    {
      const rnd = rndstore & 7;
      rndstore = rndstore >>> 3;
      const rx = Element_PIPE_offsets[rnd].X;
      const ry = Element_PIPE_offsets[rnd].Y;
      const r = sim.pmap[y + ry][x + rx];
      if (!r)
        continue;
      else if ((TYP(r) === PT_PIPE || TYP(r) === PT_PPIP) && ((sim.parts[ID(r)].tmp & PFLAG_COLORS) >>> 0) !== notctype && !TYP(sim.parts[ID(r)].ctype)) {
        transfer_pipe_to_pipe(sim.parts[i], sim.parts[ID(r)], false);
        if (ID(r) > original)
          sim.parts[ID(r)].flags |= PFLAG_NORMALSPEED;//skip particle push, normalizes speed
        count++;
        pushParticle(sim, ID(r), count, original);
      }
      else if (TYP(r) === PT_PRTI) //Pass particles into PRTI for a pipe speed increase
      {
        let portaltmp = sim.parts[ID(r)].tmp;
        if (portaltmp >= CHANNELS)
          portaltmp = CHANNELS - 1;
        else if (portaltmp < 0)
          portaltmp = 0;
        for (let nnx = 0; nnx < 80; nnx++)
          if (!sim.portalp[portaltmp][count][nnx].type) {
            Element_PIPE_transfer_pipe_to_part(sim, sim.parts[i], sim.portalp[portaltmp][count][nnx], false);
            count++;
            break;
          }
      }
    }
  }
  else //predefined 1 pixel thick pipe movement
  {
    const coords = 7 - ((sim.parts[i].tmp >> 10) & 7);
    const r = sim.pmap[y + Element_PIPE_offsets[coords].Y][x + Element_PIPE_offsets[coords].X];
    if ((TYP(r) === PT_PIPE || TYP(r) === PT_PPIP) && ((sim.parts[ID(r)].tmp & PFLAG_COLORS) >>> 0) !== notctype && !TYP(sim.parts[ID(r)].ctype)) {
      transfer_pipe_to_pipe(sim.parts[i], sim.parts[ID(r)], false);
      if (ID(r) > original)
        sim.parts[ID(r)].flags |= PFLAG_NORMALSPEED;//skip particle push, normalizes speed
      count++;
      pushParticle(sim, ID(r), count, original);
    }
    else if (TYP(r) === PT_PRTI) //Pass particles into PRTI for a pipe speed increase
    {
      let portaltmp = sim.parts[ID(r)].tmp;
      if (portaltmp >= CHANNELS)
        portaltmp = CHANNELS - 1;
      else if (portaltmp < 0)
        portaltmp = 0;
      for (let nnx = 0; nnx < 80; nnx++)
        if (!sim.portalp[portaltmp][count][nnx].type) {
          Element_PIPE_transfer_pipe_to_part(sim, sim.parts[i], sim.portalp[portaltmp][count][nnx], false);
          count++;
          break;
        }
    }
    else if (!r) //Move particles out of pipe automatically, much faster at ends
    {
      const rx = Element_PIPE_offsets[coords].X;
      const ry = Element_PIPE_offsets[coords].Y;
      const np = sim.create_part(-1, x + rx, y + ry, TYP(sim.parts[i].ctype));
      if (np !== -1) {
        Element_PIPE_transfer_pipe_to_part(sim, sim.parts[i], sim.parts[np], false);
      }
    }

  }
  return;
}
