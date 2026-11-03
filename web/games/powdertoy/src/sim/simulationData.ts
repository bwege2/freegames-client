// simulation/SimulationData.h / SimulationData.cpp (+ BuiltinGOL.h, WallType.h, MenuSection.h, CustomGOLData.h,
// GOLString.cpp, ElementClasses.cpp): the element table, can_move, walls, menus, Game of Life rules.
// `sd` is SimulationData::CRef() / Ref(): ported code writes `auto &sd = SimulationData::CRef();` as nothing and
// uses the imported `sd`.
//
// Module order: this module imports every element file before it constructs `sd`, and element.ts reaches `sd`
// through setSimulationData (element.ts does not import this module), so no import cycle can construct `sd`
// before the element files or the Element class are evaluated. Modules that import both should import this one
// first.
import {
  GT_2x2, GT_34, GT_AMOE, GT_ASIM, GT_BRAN, GT_COAG, GT_DANI, GT_DMOE, GT_FRG2, GT_FROG, GT_GNAR, GT_GOL, GT_HLIF,
  GT_LLIF, GT_LOTE, GT_MAZE, GT_MOVE, GT_MYST, GT_PGOL, GT_REPL, GT_SEED, GT_STAN, GT_STAR, GT_WALL, NGOL,
  NGT_2x2, NGT_34, NGT_AMOE, NGT_ASIM, NGT_BRAN, NGT_COAG, NGT_DANI, NGT_DMOE, NGT_FRG2, NGT_FROG, NGT_GNAR, NGT_GOL,
  NGT_HLIF, NGT_LLIF, NGT_LOTE, NGT_MAZE, NGT_MOVE, NGT_MYST, NGT_PGOL, NGT_REPL, NGT_SEED, NGT_STAN, NGT_STAR,
  NGT_WALL, PROP_NEUTABSORB, PROP_NEUTPASS, PROP_NEUTPENETRATE, PROP_PHOTPASS, PT_NUM, TYPE_ENERGY, TYPE_GAS,
  TYPE_LIQUID, TYPE_PART,
} from './config.ts';
import { f } from './cpp.ts';
import { Element, FLOAT_PROPERTIES, setSimulationData } from './element.ts';
import type { Particle } from './particle.ts';
import {
  PT_ANAR, PT_BHOL, PT_BIZR, PT_BIZRG, PT_BIZRS, PT_BCLN, PT_BVBR, PT_C5, PT_CLNE, PT_CNCT, PT_DEST, PT_DEUT,
  PT_DMND, PT_ELEC, PT_EMBR, PT_EXOT, PT_FIGH, PT_FILT, PT_GEL, PT_GLOW, PT_GPMP, PT_GRVT, PT_HSWC, PT_INSL,
  PT_INVIS, PT_LAVA, PT_LCRY, PT_LIFE, PT_NBHL, PT_NEUT, PT_NONE, PT_NWHL, PT_PBCN, PT_PCLN, PT_PHOT, PT_PIPE,
  PT_PLEX, PT_PPIP, PT_PRTI, PT_PRTO, PT_PROT, PT_PVOD, PT_ROCK, PT_RSSS, PT_RSST, PT_SAWD, PT_SPAWN, PT_SPAWN2,
  PT_SPRK, PT_STKM, PT_STKM2, PT_SWCH, PT_THDR, PT_TRON, PT_VIBR, PT_VOID, PT_WHOL,
} from './numbers.ts';
import { PFLAG_CAN_CONDUCT } from '../elements/PIPE.ts';
import { Element_NONE } from '../elements/NONE.ts';
import { Element_DUST } from '../elements/DUST.ts';
import { Element_WATR } from '../elements/WATR.ts';
import { Element_OIL } from '../elements/OIL.ts';
import { Element_FIRE } from '../elements/FIRE.ts';
import { Element_STNE } from '../elements/STNE.ts';
import { Element_LAVA } from '../elements/LAVA.ts';
import { Element_GUNP } from '../elements/GUNP.ts';
import { Element_NITR } from '../elements/NITR.ts';
import { Element_CLNE } from '../elements/CLNE.ts';
import { Element_GAS } from '../elements/GAS.ts';
import { Element_PLEX } from '../elements/PLEX.ts';
import { Element_GOO } from '../elements/GOO.ts';
import { Element_ICEI } from '../elements/ICEI.ts';
import { Element_METL } from '../elements/METL.ts';
import { Element_SPRK } from '../elements/SPRK.ts';
import { Element_SNOW } from '../elements/SNOW.ts';
import { Element_WOOD } from '../elements/WOOD.ts';
import { Element_NEUT } from '../elements/NEUT.ts';
import { Element_PLUT } from '../elements/PLUT.ts';
import { Element_PLNT } from '../elements/PLNT.ts';
import { Element_ACID } from '../elements/ACID.ts';
import { Element_VOID } from '../elements/VOID.ts';
import { Element_WTRV } from '../elements/WTRV.ts';
import { Element_CNCT } from '../elements/CNCT.ts';
import { Element_DSTW } from '../elements/DSTW.ts';
import { Element_SALT } from '../elements/SALT.ts';
import { Element_SLTW } from '../elements/SLTW.ts';
import { Element_DMND } from '../elements/DMND.ts';
import { Element_BMTL } from '../elements/BMTL.ts';
import { Element_BRMT } from '../elements/BRMT.ts';
import { Element_PHOT } from '../elements/PHOT.ts';
import { Element_URAN } from '../elements/URAN.ts';
import { Element_WAX } from '../elements/WAX.ts';
import { Element_MWAX } from '../elements/MWAX.ts';
import { Element_PSCN } from '../elements/PSCN.ts';
import { Element_NSCN } from '../elements/NSCN.ts';
import { Element_LNTG } from '../elements/LNTG.ts';
import { Element_INSL } from '../elements/INSL.ts';
import { Element_BHOL } from '../elements/BHOL.ts';
import { Element_WHOL } from '../elements/WHOL.ts';
import { Element_RBDM } from '../elements/RBDM.ts';
import { Element_LRBD } from '../elements/LRBD.ts';
import { Element_NTCT } from '../elements/NTCT.ts';
import { Element_SAND } from '../elements/SAND.ts';
import { Element_GLAS } from '../elements/GLAS.ts';
import { Element_PTCT } from '../elements/PTCT.ts';
import { Element_BGLA } from '../elements/BGLA.ts';
import { Element_THDR } from '../elements/THDR.ts';
import { Element_PLSM } from '../elements/PLSM.ts';
import { Element_ETRD } from '../elements/ETRD.ts';
import { Element_NICE } from '../elements/NICE.ts';
import { Element_NBLE } from '../elements/NBLE.ts';
import { Element_BTRY } from '../elements/BTRY.ts';
import { Element_LCRY } from '../elements/LCRY.ts';
import { Element_STKM } from '../elements/STKM.ts';
import { Element_SWCH } from '../elements/SWCH.ts';
import { Element_SMKE } from '../elements/SMKE.ts';
import { Element_DESL } from '../elements/DESL.ts';
import { Element_COAL } from '../elements/COAL.ts';
import { Element_LO2 } from '../elements/LO2.ts';
import { Element_O2 } from '../elements/O2.ts';
import { Element_INWR } from '../elements/INWR.ts';
import { Element_YEST } from '../elements/YEST.ts';
import { Element_DYST } from '../elements/DYST.ts';
import { Element_THRM } from '../elements/THRM.ts';
import { Element_GLOW } from '../elements/GLOW.ts';
import { Element_BRCK } from '../elements/BRCK.ts';
import { Element_CFLM } from '../elements/CFLM.ts';
import { Element_FIRW } from '../elements/FIRW.ts';
import { Element_FUSE } from '../elements/FUSE.ts';
import { Element_FSEP } from '../elements/FSEP.ts';
import { Element_AMTR } from '../elements/AMTR.ts';
import { Element_BCOL } from '../elements/BCOL.ts';
import { Element_PCLN } from '../elements/PCLN.ts';
import { Element_HSWC } from '../elements/HSWC.ts';
import { Element_IRON } from '../elements/IRON.ts';
import { Element_MORT } from '../elements/MORT.ts';
import { Element_LIFE } from '../elements/LIFE.ts';
import { Element_DLAY } from '../elements/DLAY.ts';
import { Element_CO2 } from '../elements/CO2.ts';
import { Element_DRIC } from '../elements/DRIC.ts';
import { Element_CBNW } from '../elements/CBNW.ts';
import { Element_STOR } from '../elements/STOR.ts';
import { Element_PVOD } from '../elements/PVOD.ts';
import { Element_CONV } from '../elements/CONV.ts';
import { Element_CAUS } from '../elements/CAUS.ts';
import { Element_LIGH } from '../elements/LIGH.ts';
import { Element_TESC } from '../elements/TESC.ts';
import { Element_DEST } from '../elements/DEST.ts';
import { Element_SPNG } from '../elements/SPNG.ts';
import { Element_RIME } from '../elements/RIME.ts';
import { Element_FOG } from '../elements/FOG.ts';
import { Element_BCLN } from '../elements/BCLN.ts';
import { Element_LOVE } from '../elements/LOVE.ts';
import { Element_DEUT } from '../elements/DEUT.ts';
import { Element_WARP } from '../elements/WARP.ts';
import { Element_PUMP } from '../elements/PUMP.ts';
import { Element_FWRK } from '../elements/FWRK.ts';
import { Element_PIPE } from '../elements/PIPE.ts';
import { Element_FRZZ } from '../elements/FRZZ.ts';
import { Element_FRZW } from '../elements/FRZW.ts';
import { Element_GRAV } from '../elements/GRAV.ts';
import { Element_BIZR } from '../elements/BIZR.ts';
import { Element_BIZRG } from '../elements/BIZRG.ts';
import { Element_BIZRS } from '../elements/BIZRS.ts';
import { Element_INST } from '../elements/INST.ts';
import { Element_ISOZ } from '../elements/ISOZ.ts';
import { Element_ISZS } from '../elements/ISZS.ts';
import { Element_PRTI } from '../elements/PRTI.ts';
import { Element_PRTO } from '../elements/PRTO.ts';
import { Element_PSTE } from '../elements/PSTE.ts';
import { Element_PSTS } from '../elements/PSTS.ts';
import { Element_ANAR } from '../elements/ANAR.ts';
import { Element_VINE } from '../elements/VINE.ts';
import { Element_INVIS } from '../elements/INVIS.ts';
import { Element_E116 } from '../elements/E116.ts';
import { Element_SPAWN2 } from '../elements/SPAWN2.ts';
import { Element_SPAWN } from '../elements/SPAWN.ts';
import { Element_SHLD1 } from '../elements/SHLD1.ts';
import { Element_SHLD2 } from '../elements/SHLD2.ts';
import { Element_SHLD3 } from '../elements/SHLD3.ts';
import { Element_SHLD4 } from '../elements/SHLD4.ts';
import { Element_LOLZ } from '../elements/LOLZ.ts';
import { Element_WIFI } from '../elements/WIFI.ts';
import { Element_FILT } from '../elements/FILT.ts';
import { Element_ARAY } from '../elements/ARAY.ts';
import { Element_BRAY } from '../elements/BRAY.ts';
import { Element_STKM2 } from '../elements/STKM2.ts';
import { Element_BOMB } from '../elements/BOMB.ts';
import { Element_C5 } from '../elements/C5.ts';
import { Element_SING } from '../elements/SING.ts';
import { Element_QRTZ } from '../elements/QRTZ.ts';
import { Element_PQRT } from '../elements/PQRT.ts';
import { Element_EMP } from '../elements/EMP.ts';
import { Element_BREC } from '../elements/BREC.ts';
import { Element_ELEC } from '../elements/ELEC.ts';
import { Element_ACEL } from '../elements/ACEL.ts';
import { Element_DCEL } from '../elements/DCEL.ts';
import { Element_BANG } from '../elements/BANG.ts';
import { Element_IGNT } from '../elements/IGNT.ts';
import { Element_BOYL } from '../elements/BOYL.ts';
import { Element_GEL } from '../elements/GEL.ts';
import { Element_TRON } from '../elements/TRON.ts';
import { Element_TTAN } from '../elements/TTAN.ts';
import { Element_EXOT } from '../elements/EXOT.ts';
import { Element_EMBR } from '../elements/EMBR.ts';
import { Element_H2 } from '../elements/H2.ts';
import { Element_SOAP } from '../elements/SOAP.ts';
import { Element_NBHL } from '../elements/NBHL.ts';
import { Element_NWHL } from '../elements/NWHL.ts';
import { Element_MERC } from '../elements/MERC.ts';
import { Element_PBCN } from '../elements/PBCN.ts';
import { Element_GPMP } from '../elements/GPMP.ts';
import { Element_CLST } from '../elements/CLST.ts';
import { Element_WIRE } from '../elements/WIRE.ts';
import { Element_GBMB } from '../elements/GBMB.ts';
import { Element_FIGH } from '../elements/FIGH.ts';
import { Element_FRAY } from '../elements/FRAY.ts';
import { Element_RPEL } from '../elements/RPEL.ts';
import { Element_PPIP } from '../elements/PPIP.ts';
import { Element_DTEC } from '../elements/DTEC.ts';
import { Element_DMG } from '../elements/DMG.ts';
import { Element_TSNS } from '../elements/TSNS.ts';
import { Element_VIBR } from '../elements/VIBR.ts';
import { Element_BVBR } from '../elements/BVBR.ts';
import { Element_CRAY } from '../elements/CRAY.ts';
import { Element_PSTN } from '../elements/PSTN.ts';
import { Element_FRME } from '../elements/FRME.ts';
import { Element_GOLD } from '../elements/GOLD.ts';
import { Element_TUNG } from '../elements/TUNG.ts';
import { Element_PSNS } from '../elements/PSNS.ts';
import { Element_PROT } from '../elements/PROT.ts';
import { Element_VIRS } from '../elements/VIRS.ts';
import { Element_VRSS } from '../elements/VRSS.ts';
import { Element_VRSG } from '../elements/VRSG.ts';
import { Element_GRVT } from '../elements/GRVT.ts';
import { Element_DRAY } from '../elements/DRAY.ts';
import { Element_CRMC } from '../elements/CRMC.ts';
import { Element_HEAC } from '../elements/HEAC.ts';
import { Element_SAWD } from '../elements/SAWD.ts';
import { Element_POLO } from '../elements/POLO.ts';
import { Element_RFRG } from '../elements/RFRG.ts';
import { Element_RFGL } from '../elements/RFGL.ts';
import { Element_LSNS } from '../elements/LSNS.ts';
import { Element_LDTC } from '../elements/LDTC.ts';
import { Element_SLCN } from '../elements/SLCN.ts';
import { Element_PTNM } from '../elements/PTNM.ts';
import { Element_VSNS } from '../elements/VSNS.ts';
import { Element_ROCK } from '../elements/ROCK.ts';
import { Element_LITH } from '../elements/LITH.ts';
import { Element_RSST } from '../elements/RSST.ts';
import { Element_RSSS } from '../elements/RSSS.ts';
import { Element_BASE } from '../elements/BASE.ts';
import { Element_SEED } from '../elements/SEED.ts';

/** graphics/gcache_item.h */
export interface GcacheItem {
  isready: number;
  pixel_mode: number;
  cola: number; colr: number; colg: number; colb: number;
  firea: number; firer: number; fireg: number; fireb: number;
}

/** BuiltinGOL.h */
export interface BuiltinGOL {
  name: string;
  oldtype: number;
  ruleset: number;
  /** RGB as 0xRRGGBB */
  colour: number;
  colour2: number;
  goltype: number;
  description: string;
}

/** CustomGOLData.h */
export interface CustomGOLData {
  rule: number;
  colour1: number;
  colour2: number;
  nameString: string;
}

/** WallType.h wall_type; textureGen names the renderer's generator (Renderer::WallIcon) */
export interface WallType {
  colour: number;
  /** if emap set, add this to fire glow */
  eglow: number;
  drawstyle: number;
  textureGen: string;
  name: string;
  identifier: string;
  descs: string;
}

/** MenuSection.h menu_section; icon is the character code of the icon font glyph */
export interface MenuSectionData {
  icon: number;
  name: string;
  itemcount: number;
  doshow: number;
}

// * Ruleset:
//   * bits x = 8..0: stay if x neighbours present
//   * bits x = 16..9: begin if x-8 neighbours present
//   * bits 20..17: 4-bit unsigned int encoding the number of states minus 2; 2 states is
//     encoded as 0, 3 states as 1, etc.
//   * states are kind of long until a cell dies; normal ones use two states (living and dead),
//     for others the intermediate states live but do nothing
//   * the ruleset constants below look 20-bit, but rulesets actually consist of 21
//     bits of data; bit 20 just happens to not be set for any of the built-in types,
//     as none of them have 10 or more states
function gol(name: string, oldtype: number, ruleset: number, colour: number, colour2: number, goltype: number, description: string): BuiltinGOL {
  return { name, oldtype, ruleset, colour, colour2, goltype, description };
}
const builtinGolTable: readonly BuiltinGOL[] = [
  gol('GOL', GT_GOL, 0x0080C, 0x0CAC00, 0x0CAC00, NGT_GOL, 'Game Of Life: Begin 3/Stay 23'),
  gol('HLIF', GT_HLIF, 0x0480C, 0xFF0000, 0xFF0000, NGT_HLIF, 'High Life: B36/S23'),
  gol('ASIM', GT_ASIM, 0x038F0, 0x0000FF, 0x0000FF, NGT_ASIM, 'Assimilation: B345/S4567'),
  gol('2X2', GT_2x2, 0x04826, 0xFFFF00, 0xFFFF00, NGT_2x2, '2X2: B36/S125'),
  gol('DANI', GT_DANI, 0x1C9D8, 0x00FFFF, 0x00FFFF, NGT_DANI, 'Day and Night: B3678/S34678'),
  gol('AMOE', GT_AMOE, 0x0A92A, 0xFF00FF, 0xFF00FF, NGT_AMOE, 'Amoeba: B357/S1358'),
  gol('MOVE', GT_MOVE, 0x14834, 0xFFFFFF, 0xFFFFFF, NGT_MOVE, "'Move' particles. Does not move things.. it is a life type: B368/S245"),
  gol('PGOL', GT_PGOL, 0x0A90C, 0xE05010, 0xE05010, NGT_PGOL, 'Pseudo Life: B357/S238'),
  gol('DMOE', GT_DMOE, 0x1E9E0, 0x500000, 0x500000, NGT_DMOE, 'Diamoeba: B35678/S5678'),
  gol('3-4', GT_34, 0x01818, 0x500050, 0x500050, NGT_34, '3-4: B34/S34'),
  gol('LLIF', GT_LLIF, 0x03820, 0x505050, 0x505050, NGT_LLIF, 'Long Life: B345/S5'),
  gol('STAN', GT_STAN, 0x1C9EC, 0x5000FF, 0x5000FF, NGT_STAN, 'Stains: B3678/S235678'),
  gol('SEED', GT_SEED, 0x00400, 0xFBEC7D, 0xFBEC7D, NGT_SEED, 'Seeds: B2/S'),
  gol('MAZE', GT_MAZE, 0x0083E, 0xA8E4A0, 0xA8E4A0, NGT_MAZE, 'Maze: B3/S12345'),
  gol('COAG', GT_COAG, 0x189EC, 0x9ACD32, 0x9ACD32, NGT_COAG, 'Coagulations: B378/S235678'),
  gol('WALL', GT_WALL, 0x1F03C, 0x0047AB, 0x0047AB, NGT_WALL, 'Walled cities: B45678/S2345'),
  gol('GNAR', GT_GNAR, 0x00202, 0xE5B73B, 0xE5B73B, NGT_GNAR, 'Gnarl: B1/S1'),
  gol('REPL', GT_REPL, 0x0AAAA, 0x259588, 0x259588, NGT_REPL, 'Replicator: B1357/S1357'),
  gol('MYST', GT_MYST, 0x139E1, 0x0C3C00, 0x0C3C00, NGT_MYST, 'Mystery: B3458/S05678'),
  gol('LOTE', GT_LOTE, 0x48938, 0xFF0000, 0xFFFF00, NGT_LOTE, 'Living on the Edge: B37/S3458/4'),
  gol('FRG2', GT_FRG2, 0x20816, 0x006432, 0x00FF5A, NGT_FRG2, 'Like Frogs rule: B3/S124/3'),
  gol('STAR', GT_STAR, 0x98478, 0x000040, 0x0000E6, NGT_STAR, 'Like Star Wars rule: B278/S3456/6'),
  gol('FROG', GT_FROG, 0x21806, 0x006400, 0x00FF00, NGT_FROG, 'Frogs: B34/S12/3'),
  gol('BRAN', GT_BRAN, 0x25440, 0xFFFF00, 0x969600, NGT_BRAN, 'Brian 6: B246/S6/3'),
];

function wall(colour: number, eglow: number, drawstyle: number, textureGen: string, name: string, identifier: string, descs: string): WallType {
  return { colour, eglow, drawstyle, textureGen, name, identifier, descs };
}
function LoadWalls(): WallType[] {
  return [
    wall(0x808080, 0x000000, 0, 'WallIcon', 'ERASE', 'DEFAULT_WL_ERASE', 'Erases walls.'),
    wall(0xC0C0C0, 0x101010, 0, 'WallIcon', 'CONDUCTIVE WALL', 'DEFAULT_WL_CNDTW', 'Blocks everything. Conductive.'),
    wall(0x808080, 0x808080, 0, 'WallIcon', 'EWALL', 'DEFAULT_WL_EWALL', 'E-Wall. Becomes transparent when electricity is connected.'),
    wall(0xFF8080, 0xFF2008, 1, 'WallIcon', 'DETECTOR', 'DEFAULT_WL_DTECT', 'Detector. Generates electricity when a particle is inside.'),
    wall(0x808080, 0x000000, 0, 'WallIcon', 'STREAMLINE', 'DEFAULT_WL_STRM', 'Streamline. Creates a line that follows air movement.'),
    wall(0x8080FF, 0x000000, 1, 'WallIcon', 'FAN', 'DEFAULT_WL_FAN', 'Fan. Accelerates air. Use the line tool to set direction and strength.'),
    wall(0xC0C0C0, 0x101010, 2, 'WallIcon', 'LIQUID WALL', 'DEFAULT_WL_LIQD', 'Allows liquids, blocks all other particles. Conductive.'),
    wall(0x808080, 0x000000, 1, 'WallIcon', 'ABSORB WALL', 'DEFAULT_WL_ABSRB', 'Absorbs particles but lets air currents through.'),
    wall(0x808080, 0x000000, 3, 'WallIcon', 'WALL', 'DEFAULT_WL_WALL', 'Basic wall, blocks everything.'),
    wall(0x3C3C3C, 0x000000, 1, 'WallIcon', 'AIRONLY WALL', 'DEFAULT_WL_AIR', 'Allows air, but blocks all particles.'),
    wall(0x575757, 0x000000, 1, 'WallIcon', 'POWDER WALL', 'DEFAULT_WL_POWDR', 'Allows powders, blocks all other particles.'),
    wall(0xFFFF22, 0x101010, 2, 'WallIcon', 'CONDUCTOR', 'DEFAULT_WL_CNDTR', 'Conductor. Allows all particles to pass through and conducts electricity.'),
    wall(0x242424, 0x101010, 0, 'WallIcon', 'EHOLE', 'DEFAULT_WL_EHOLE', 'E-Hole. absorbs particles, releases them when powered.'),
    wall(0x579777, 0x000000, 1, 'WallIcon', 'GAS WALL', 'DEFAULT_WL_GAS', 'Allows gases, blocks all other particles.'),
    wall(0xFFEE00, 0xAA9900, 4, 'WallIcon', 'GRAVITY WALL', 'DEFAULT_WL_GRVTY', 'Gravity wall. Newtonian Gravity has no effect inside a box drawn with this.'),
    wall(0xFFAA00, 0xAA5500, 4, 'WallIcon', 'ENERGY WALL', 'DEFAULT_WL_ENRGY', 'Allows energy particles, blocks all other particles.'),
    wall(0xDCDCDC, 0x000000, 1, 'WallIcon', 'AIRBLOCK WALL', 'DEFAULT_WL_NOAIR', 'Allows all particles, but blocks air.'),
    wall(0x808080, 0x000000, 0, 'WallIcon', 'ERASEALL', 'DEFAULT_WL_ERASEA', 'Erases walls, particles, and signs.'),
    wall(0x800080, 0x000000, 0, 'WallIcon', 'STASIS WALL', 'DEFAULT_WL_STASIS', 'Freezes particles inside the wall in place until powered.'),
  ];
}

function LoadMenus(): MenuSectionData[] {
  const m = (icon: number, name: string, itemcount: number, doshow: number): MenuSectionData => ({ icon, name, itemcount, doshow });
  return [
    m(0xE041, 'Walls', 0, 1),
    m(0xE042, 'Electronics', 0, 1),
    m(0xE056, 'Powered Materials', 0, 1),
    m(0xE019, 'Sensors', 0, 1),
    m(0xE062, 'Force', 0, 1),
    m(0xE043, 'Explosives', 0, 1),
    m(0xE045, 'Gases', 0, 1),
    m(0xE044, 'Liquids', 0, 1),
    m(0xE050, 'Powders', 0, 1),
    m(0xE051, 'Solids', 0, 1),
    m(0xE046, 'Radioactive', 0, 1),
    m(0xE04C, 'Special', 0, 1),
    m(0xE052, 'Game Of Life', 0, 1),
    m(0xE057, 'Tools', 0, 1),
    m(0xE067, 'Favorites', 0, 1),
    m(0xE064, 'Decoration tools', 0, 1),
  ];
}

// GOLString.cpp

export function ParseGOLString(value: string): number {
  // * Most likely a GOL string.
  let it = 1;
  let begin = 0;
  let stay = 0;
  let states = 2;
  const c = (k: number): string => value[k];

  // Scan 'B' section, must be between 1 and 8
  for (; it < value.length && c(it) >= '1' && c(it) <= '8'; ++it) {
    begin |= 1 << (c(it).charCodeAt(0) - 48);
  }
  if (!begin) {
    return -1;
  }

  // Must have a /S immediately afterwards
  if (it < value.length - 1 && c(it) === '/' && c(it + 1) === 'S') {
    it += 2;
  } else {
    return -1;
  }

  // Scan 'S' section, must be between 0 and 8
  for (; it < value.length && c(it) >= '0' && c(it) <= '8'; ++it) {
    stay |= 1 << (c(it).charCodeAt(0) - 48);
  }

  // Optionally can have a 3rd section, with the number of frames to remain after dying
  if (it < value.length) {
    if (c(it) === '/') {
      it += 1;
    } else {
      return -1;
    }
    const rest = value.substring(it);
    // String::ToNumber<unsigned int>(true): the whole rest must be a number, else 0 (no exception thrown)
    states = /^[0-9]+$/.test(rest) ? Number(rest) >>> 0 : 0;
    if (states < 2 || states > 17) {
      return -1;
    }
  }

  return stay | (begin << 8) | ((states - 2) << 17);
}

export function ValidateGOLName(value: string): boolean {
  let nameOk = true;
  for (const ch of value) {
    if (!((ch >= '0' && ch < '9') || (ch >= 'A' && ch <= 'Z') || (ch >= 'a' && ch <= 'z') || (ch === '-'))) {
      nameOk = false;
    }
  }
  return nameOk;
}

export function SerialiseGOLRule(rule: number): string {
  let golName = 'B';
  for (let i = 1; i < 9; ++i) {
    if ((rule >> (i + 8)) & 1) {
      golName += String.fromCharCode(48 + i);
    }
  }
  golName += '/S';
  for (let i = 0; i < 9; ++i) {
    if ((rule >> i) & 1) {
      golName += String.fromCharCode(48 + i);
    }
  }
  if ((rule >> 17) & 0xF) {
    golName += '/' + (((rule >> 17) & 0xF) + 2);
  }
  return golName;
}

export class SimulationData {
  elements: Element[] = [];
  /** std::array<gcache_item, PT_NUM> graphicscache: filled by the renderer */
  graphicscache: GcacheItem[] = Array.from({ length: PT_NUM }, () => ({
    isready: 0, pixel_mode: 0, cola: 0, colr: 0, colg: 0, colb: 0, firea: 0, firer: 0, fireg: 0, fireb: 0,
  }));
  wtypes: WallType[] = [];
  msections: MenuSectionData[] = [];
  /** char can_move[PT_NUM][PT_NUM] */
  can_move: Uint8Array[] = Array.from({ length: PT_NUM }, () => new Uint8Array(PT_NUM));
  /** static const std::array<BuiltinGOL, NGOL> builtinGol */
  builtinGol: readonly BuiltinGOL[] = builtinGolTable;
  static readonly builtinGol: readonly BuiltinGOL[] = builtinGolTable;

  private customGol: CustomGOLData[] = [];

  constructor() {
    this.msections = LoadMenus();
    this.wtypes = LoadWalls();
    this.elements = GetElements();
    this.init_can_move();
  }

  /** InitElements: the element table as ElementClasses.cpp GetElements() builds it */
  InitElements(): void {
    this.elements = GetElements();
  }

  init_can_move(): void {
    const can_move = this.can_move;
    const elements = this.elements;
    let movingType: number, destinationType: number;
    // can_move[moving type][type at destination]
    //  0 = No move/Bounce
    //  1 = Swap
    //  2 = Both particles occupy the same space.
    //  3 = Varies, go run some extra checks

    //particles that don't exist shouldn't move...
    for (destinationType = 0; destinationType < PT_NUM; destinationType++)
      can_move[0][destinationType] = 0;

    //initialize everything else to swapping by default
    for (movingType = 1; movingType < PT_NUM; movingType++)
      for (destinationType = 0; destinationType < PT_NUM; destinationType++)
        can_move[movingType][destinationType] = 1;

    //photons go through everything by default
    for (destinationType = 1; destinationType < PT_NUM; destinationType++)
      can_move[PT_PHOT][destinationType] = 2;

    for (movingType = 1; movingType < PT_NUM; movingType++) {
      for (destinationType = 1; destinationType < PT_NUM; destinationType++) {
        //weight check, also prevents particles of same type displacing each other
        if (elements[movingType].Weight <= elements[destinationType].Weight || destinationType == PT_GEL)
          can_move[movingType][destinationType] = 0;

        //other checks for NEUT and energy particles
        if (movingType == PT_NEUT && (elements[destinationType].Properties & PROP_NEUTPASS))
          can_move[movingType][destinationType] = 2;
        if (movingType == PT_NEUT && (elements[destinationType].Properties & PROP_NEUTABSORB))
          can_move[movingType][destinationType] = 1;
        if (movingType == PT_NEUT && (elements[destinationType].Properties & PROP_NEUTPENETRATE))
          can_move[movingType][destinationType] = 1;
        if (destinationType == PT_NEUT && (elements[movingType].Properties & PROP_NEUTPENETRATE))
          can_move[movingType][destinationType] = 0;
        if ((elements[movingType].Properties & TYPE_ENERGY) && (elements[destinationType].Properties & TYPE_ENERGY))
          can_move[movingType][destinationType] = 2;
      }
    }
    for (destinationType = 0; destinationType < PT_NUM; destinationType++) {
      //set what stickmen can move through
      let stkm_move = 0;
      if (elements[destinationType].Properties & (TYPE_LIQUID | TYPE_GAS))
        stkm_move = 2;
      if (!destinationType || destinationType == PT_PRTO || destinationType == PT_SPAWN || destinationType == PT_SPAWN2)
        stkm_move = 2;
      can_move[PT_STKM][destinationType] = stkm_move;
      can_move[PT_STKM2][destinationType] = stkm_move;
      can_move[PT_FIGH][destinationType] = stkm_move;

      //spark shouldn't move
      can_move[PT_SPRK][destinationType] = 0;
    }
    for (movingType = 1; movingType < PT_NUM; movingType++) {
      //everything "swaps" with VACU and BHOL to make them eat things
      can_move[movingType][PT_BHOL] = 1;
      can_move[movingType][PT_NBHL] = 1;
      //nothing goes through stickmen
      can_move[movingType][PT_STKM] = 0;
      can_move[movingType][PT_STKM2] = 0;
      can_move[movingType][PT_FIGH] = 0;
      //INVS behaviour varies with pressure
      can_move[movingType][PT_INVIS] = 3;
      //stop CNCT from being displaced by other particles
      can_move[movingType][PT_CNCT] = 0;
      //VOID and PVOD behaviour varies with powered state and ctype
      can_move[movingType][PT_PVOD] = 3;
      can_move[movingType][PT_VOID] = 3;
      //nothing moves through EMBR (not sure why, but it's killed when it touches anything)
      can_move[movingType][PT_EMBR] = 0;
      can_move[PT_EMBR][movingType] = 0;
      //Energy particles move through VIBR and BVBR, so it can absorb them
      if (elements[movingType].Properties & TYPE_ENERGY) {
        can_move[movingType][PT_VIBR] = 1;
        can_move[movingType][PT_BVBR] = 1;
      }

      //SAWD cannot be displaced by other powders
      if (elements[movingType].Properties & TYPE_PART)
        can_move[movingType][PT_SAWD] = 0;
    }

    for (destinationType = 0; destinationType < PT_NUM; destinationType++) {
      //a list of lots of things PHOT can move through
      if (elements[destinationType].Properties & PROP_PHOTPASS)
        can_move[PT_PHOT][destinationType] = 2;

      //Things PROT and GRVT cannot move through
      if (destinationType != PT_DMND && destinationType != PT_INSL && destinationType != PT_VOID && destinationType != PT_PVOD && destinationType != PT_VIBR && destinationType != PT_BVBR && destinationType != PT_PRTI && destinationType != PT_PRTO) {
        can_move[PT_PROT][destinationType] = 2;
        can_move[PT_GRVT][destinationType] = 2;
      }
    }

    //other special cases that weren't covered above
    can_move[PT_DEST][PT_DMND] = 0;
    can_move[PT_DEST][PT_CLNE] = 0;
    can_move[PT_DEST][PT_PCLN] = 0;
    can_move[PT_DEST][PT_BCLN] = 0;
    can_move[PT_DEST][PT_PBCN] = 0;
    can_move[PT_DEST][PT_ROCK] = 0;

    can_move[PT_NEUT][PT_INVIS] = 2;
    can_move[PT_ELEC][PT_LCRY] = 2;
    can_move[PT_ELEC][PT_EXOT] = 2;
    can_move[PT_ELEC][PT_GLOW] = 2;
    can_move[PT_PHOT][PT_LCRY] = 3; //varies according to LCRY life
    can_move[PT_PHOT][PT_GPMP] = 3;

    can_move[PT_PHOT][PT_BIZR] = 2;
    can_move[PT_ELEC][PT_BIZR] = 2;
    can_move[PT_PHOT][PT_BIZRG] = 2;
    can_move[PT_ELEC][PT_BIZRG] = 2;
    can_move[PT_PHOT][PT_BIZRS] = 2;
    can_move[PT_ELEC][PT_BIZRS] = 2;
    can_move[PT_BIZR][PT_FILT] = 2;
    can_move[PT_BIZRG][PT_FILT] = 2;

    can_move[PT_ANAR][PT_WHOL] = 1; //WHOL eats ANAR
    can_move[PT_ANAR][PT_NWHL] = 1;
    can_move[PT_ELEC][PT_DEUT] = 1;
    can_move[PT_THDR][PT_THDR] = 2;
    can_move[PT_EMBR][PT_EMBR] = 2;
    can_move[PT_TRON][PT_SWCH] = 3;
    can_move[PT_ELEC][PT_RSST] = 2;
    can_move[PT_ELEC][PT_RSSS] = 2;
  }

  GetCustomGOLByRule(rule: number): CustomGOLData | null {
    // * Binary search. customGol is already sorted, see SetCustomGOL.
    const customGol = this.customGol;
    let lo = 0, hi = customGol.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (customGol[mid].rule < rule) lo = mid + 1;
      else hi = mid;
    }
    if (lo != customGol.length && !(rule < customGol[lo].rule)) {
      return customGol[lo];
    }
    return null;
  }

  GetCustomGol(): readonly CustomGOLData[] { return this.customGol; }

  SetCustomGOL(newCustomGol: CustomGOLData[]): void {
    // std::sort is not stable; entries with equal rules keep the order a stable sort gives
    this.customGol = newCustomGol.slice().sort((a, b) => a.rule - b.rule);
  }

  ElementResolve(type: number, ctype: number): string {
    if (type == PT_LIFE) {
      if (ctype >= 0 && ctype < NGOL) {
        return this.builtinGol[ctype].name;
      }
      const cgol = this.GetCustomGOLByRule(ctype);
      if (cgol) {
        return cgol.nameString;
      }
      return SerialiseGOLRule(ctype);
    } else if (type >= 0 && type < PT_NUM)
      return this.elements[type].Name;
    return 'Empty';
  }

  BasicParticleInfo(sample_part: Particle): string {
    let sampleInfo = '';
    const type = sample_part.type;
    const ctype = sample_part.ctype;
    const storedCtype = sample_part.tmp4;
    if (type == PT_LAVA && this.IsElement(ctype)) {
      sampleInfo += 'Molten ' + this.ElementResolve(ctype, -1);
    } else if ((type == PT_PIPE || type == PT_PPIP) && this.IsElement(ctype)) {
      if (ctype == PT_LAVA && this.IsElement(storedCtype)) {
        sampleInfo += this.ElementResolve(type, -1) + ' with molten ' + this.ElementResolve(storedCtype, -1);
      } else {
        sampleInfo += this.ElementResolve(type, -1) + ' with ' + this.ElementResolve(ctype, storedCtype);
      }
    } else {
      sampleInfo += this.ElementResolve(type, ctype);
    }
    return sampleInfo;
  }

  GetParticleType(type: string): number {
    type = type.toUpperCase();

    // alternative names for some elements
    if (type === 'C4') {
      return PT_PLEX;
    } else if (type === 'C5') {
      return PT_C5;
    } else if (type === 'NONE') {
      return PT_NONE;
    }
    for (let i = 1; i < PT_NUM; i++) {
      if (this.elements[i].Name.length && this.elements[i].Enabled && type === this.elements[i].Name.toUpperCase()) {
        return i;
      }
    }
    return -1;
  }

  IsHeatInsulator(p: Particle): boolean {
    return this.elements[p.type].HeatConduct == 0 || (p.type == PT_HSWC && p.life != 10) || ((p.type == PT_PIPE || p.type == PT_PPIP) && (p.tmp & PFLAG_CAN_CONDUCT) == 0);
  }

  HeatCapacityOf(p: Particle): number {
    if ((p.type == PT_PIPE || p.type == PT_PPIP) && this.IsElement(p.ctype))
      return f(this.elements[p.type].HeatCapacity + this.elements[p.ctype].HeatCapacity);
    else
      return this.elements[p.type].HeatCapacity;
  }

  IsElement(type: number): boolean {
    return type > 0 && type < PT_NUM && !!this.elements[type].Enabled;
  }

  IsElementOrNone(type: number): boolean {
    return type >= 0 && type < PT_NUM && !!this.elements[type].Enabled;
  }
}

/** ElementClasses.cpp GetElements(): default-constructed elements, then each element's initializer */
function GetElements(): Element[] {
  const e: Element[] = [];
  for (let k = 0; k < PT_NUM; k++) e.push(new Element());
    Element_NONE(e[0]);
    Element_DUST(e[1]);
    Element_WATR(e[2]);
    Element_OIL(e[3]);
    Element_FIRE(e[4]);
    Element_STNE(e[5]);
    Element_LAVA(e[6]);
    Element_GUNP(e[7]);
    Element_NITR(e[8]);
    Element_CLNE(e[9]);
    Element_GAS(e[10]);
    Element_PLEX(e[11]);
    Element_GOO(e[12]);
    Element_ICEI(e[13]);
    Element_METL(e[14]);
    Element_SPRK(e[15]);
    Element_SNOW(e[16]);
    Element_WOOD(e[17]);
    Element_NEUT(e[18]);
    Element_PLUT(e[19]);
    Element_PLNT(e[20]);
    Element_ACID(e[21]);
    Element_VOID(e[22]);
    Element_WTRV(e[23]);
    Element_CNCT(e[24]);
    Element_DSTW(e[25]);
    Element_SALT(e[26]);
    Element_SLTW(e[27]);
    Element_DMND(e[28]);
    Element_BMTL(e[29]);
    Element_BRMT(e[30]);
    Element_PHOT(e[31]);
    Element_URAN(e[32]);
    Element_WAX(e[33]);
    Element_MWAX(e[34]);
    Element_PSCN(e[35]);
    Element_NSCN(e[36]);
    Element_LNTG(e[37]);
    Element_INSL(e[38]);
    Element_BHOL(e[39]);
    Element_WHOL(e[40]);
    Element_RBDM(e[41]);
    Element_LRBD(e[42]);
    Element_NTCT(e[43]);
    Element_SAND(e[44]);
    Element_GLAS(e[45]);
    Element_PTCT(e[46]);
    Element_BGLA(e[47]);
    Element_THDR(e[48]);
    Element_PLSM(e[49]);
    Element_ETRD(e[50]);
    Element_NICE(e[51]);
    Element_NBLE(e[52]);
    Element_BTRY(e[53]);
    Element_LCRY(e[54]);
    Element_STKM(e[55]);
    Element_SWCH(e[56]);
    Element_SMKE(e[57]);
    Element_DESL(e[58]);
    Element_COAL(e[59]);
    Element_LO2(e[60]);
    Element_O2(e[61]);
    Element_INWR(e[62]);
    Element_YEST(e[63]);
    Element_DYST(e[64]);
    Element_THRM(e[65]);
    Element_GLOW(e[66]);
    Element_BRCK(e[67]);
    Element_CFLM(e[68]);
    Element_FIRW(e[69]);
    Element_FUSE(e[70]);
    Element_FSEP(e[71]);
    Element_AMTR(e[72]);
    Element_BCOL(e[73]);
    Element_PCLN(e[74]);
    Element_HSWC(e[75]);
    Element_IRON(e[76]);
    Element_MORT(e[77]);
    Element_LIFE(e[78]);
    Element_DLAY(e[79]);
    Element_CO2(e[80]);
    Element_DRIC(e[81]);
    Element_CBNW(e[82]);
    Element_STOR(e[83]);
    Element_PVOD(e[84]);
    Element_CONV(e[85]);
    Element_CAUS(e[86]);
    Element_LIGH(e[87]);
    Element_TESC(e[88]);
    Element_DEST(e[89]);
    Element_SPNG(e[90]);
    Element_RIME(e[91]);
    Element_FOG(e[92]);
    Element_BCLN(e[93]);
    Element_LOVE(e[94]);
    Element_DEUT(e[95]);
    Element_WARP(e[96]);
    Element_PUMP(e[97]);
    Element_FWRK(e[98]);
    Element_PIPE(e[99]);
    Element_FRZZ(e[100]);
    Element_FRZW(e[101]);
    Element_GRAV(e[102]);
    Element_BIZR(e[103]);
    Element_BIZRG(e[104]);
    Element_BIZRS(e[105]);
    Element_INST(e[106]);
    Element_ISOZ(e[107]);
    Element_ISZS(e[108]);
    Element_PRTI(e[109]);
    Element_PRTO(e[110]);
    Element_PSTE(e[111]);
    Element_PSTS(e[112]);
    Element_ANAR(e[113]);
    Element_VINE(e[114]);
    Element_INVIS(e[115]);
    Element_E116(e[116]);
    Element_SPAWN2(e[117]);
    Element_SPAWN(e[118]);
    Element_SHLD1(e[119]);
    Element_SHLD2(e[120]);
    Element_SHLD3(e[121]);
    Element_SHLD4(e[122]);
    Element_LOLZ(e[123]);
    Element_WIFI(e[124]);
    Element_FILT(e[125]);
    Element_ARAY(e[126]);
    Element_BRAY(e[127]);
    Element_STKM2(e[128]);
    Element_BOMB(e[129]);
    Element_C5(e[130]);
    Element_SING(e[131]);
    Element_QRTZ(e[132]);
    Element_PQRT(e[133]);
    Element_EMP(e[134]);
    Element_BREC(e[135]);
    Element_ELEC(e[136]);
    Element_ACEL(e[137]);
    Element_DCEL(e[138]);
    Element_BANG(e[139]);
    Element_IGNT(e[140]);
    Element_BOYL(e[141]);
    Element_GEL(e[142]);
    Element_TRON(e[143]);
    Element_TTAN(e[144]);
    Element_EXOT(e[145]);
    Element_EMBR(e[147]);
    Element_H2(e[148]);
    Element_SOAP(e[149]);
    Element_NBHL(e[150]);
    Element_NWHL(e[151]);
    Element_MERC(e[152]);
    Element_PBCN(e[153]);
    Element_GPMP(e[154]);
    Element_CLST(e[155]);
    Element_WIRE(e[156]);
    Element_GBMB(e[157]);
    Element_FIGH(e[158]);
    Element_FRAY(e[159]);
    Element_RPEL(e[160]);
    Element_PPIP(e[161]);
    Element_DTEC(e[162]);
    Element_DMG(e[163]);
    Element_TSNS(e[164]);
    Element_VIBR(e[165]);
    Element_BVBR(e[166]);
    Element_CRAY(e[167]);
    Element_PSTN(e[168]);
    Element_FRME(e[169]);
    Element_GOLD(e[170]);
    Element_TUNG(e[171]);
    Element_PSNS(e[172]);
    Element_PROT(e[173]);
    Element_VIRS(e[174]);
    Element_VRSS(e[175]);
    Element_VRSG(e[176]);
    Element_GRVT(e[177]);
    Element_DRAY(e[178]);
    Element_CRMC(e[179]);
    Element_HEAC(e[180]);
    Element_SAWD(e[181]);
    Element_POLO(e[182]);
    Element_RFRG(e[183]);
    Element_RFGL(e[184]);
    Element_LSNS(e[185]);
    Element_LDTC(e[186]);
    Element_SLCN(e[187]);
    Element_PTNM(e[188]);
    Element_VSNS(e[189]);
    Element_ROCK(e[190]);
    Element_LITH(e[191]);
    Element_RSST(e[192]);
    Element_RSSS(e[193]);
    Element_BASE(e[194]);
    Element_SEED(e[195]);
  // The C++ members are float: a value an element file assigned without f() is rounded here as the C++ store
  // would round it (a no-op for values that already are binary32).
  for (const el of e) {
    for (const k of FLOAT_PROPERTIES) el[k] = f(el[k]);
  }
  return e;
}

/** SimulationData::CRef() / Ref() */
export const sd = new SimulationData();
setSimulationData(sd);
