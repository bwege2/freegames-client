// The Powder Toy v100.1.400: constants of SimulationConfig.h, ElementDefs.h, ElementGraphics.h,
// TransitionConstants.h, SimulationSettings.h, MenuSection.h and SimulationData.h, unchanged.

export const MENUSIZE = 40;
export const BARSIZE = 17;
export const M_GRAV = Math.fround(6.67300e-1);
export const CELL = 4;
export const XCELLS = 153;
export const YCELLS = 96;
export const NCELL = XCELLS * YCELLS;
export const XRES = XCELLS * CELL;
export const YRES = YCELLS * CELL;
export const NPART = XRES * YRES;
export const XCNTR = XRES / 2;
export const YCNTR = YRES / 2;
export const WINDOWW = XRES + BARSIZE;
export const WINDOWH = YRES + MENUSIZE;
export const MAXSIGNS = 16;
export const ISTP = CELL / 2;
export const CFDS = Math.fround(4.0 / CELL);
export const MAX_VELOCITY = Math.fround(1e4);
export const AIR_TSTEPP = Math.fround(0.3);
export const AIR_TSTEPV = Math.fround(0.4);
export const AIR_VADV = Math.fround(0.3);
export const AIR_VLOSS = Math.fround(0.999);
export const AIR_PLOSS = Math.fround(0.9999);
export const NGOL = 24;
export const BRUSH_CIRCLE = 0, BRUSH_SQUARE = 1, BRUSH_TRIANGLE = 2, NUM_DEFAULTBRUSHES = 3;
export const SURF_RANGE = 10;
export const NORMAL_MIN_EST = 3;
export const NORMAL_INTERP = 20;
export const NORMAL_FRAC = 16;
export const REFRACT = 0x80000000;
export const GLASS_IOR = Math.fround(1.9);
export const GLASS_DISP = Math.fround(0.07);
export const R_TEMP = 22;
export const MAX_FIGHTERS = 100;

// ElementDefs.h
export const MAX_TEMP = 9999;
export const MIN_TEMP = 0;
export const O_MAX_TEMP = 3500;
export const O_MIN_TEMP = -273;
export const MAX_PRESSURE = 256.0;
export const MIN_PRESSURE = -256.0;
export const TYPE_PART = 0x00000001;
export const TYPE_LIQUID = 0x00000002;
export const TYPE_SOLID = 0x00000004;
export const TYPE_GAS = 0x00000008;
export const TYPE_ENERGY = 0x00000010;
export const STATE_FLAGS = 0x0000001F;
export const PROP_CONDUCTS = 0x00000020;
export const PROP_PHOTPASS = 0x00000040;
export const PROP_NEUTPENETRATE = 0x00000080;
export const PROP_NEUTABSORB = 0x00000100;
export const PROP_NEUTPASS = 0x00000200;
export const PROP_DEADLY = 0x00000400;
export const PROP_HOT_GLOW = 0x00000800;
export const PROP_LIFE = 0x00001000;
export const PROP_RADIOACTIVE = 0x00002000;
export const PROP_LIFE_DEC = 0x00004000;
export const PROP_LIFE_KILL = 0x00008000;
export const PROP_LIFE_KILL_DEC = 0x00010000;
export const PROP_SPARKSETTLE = 0x00020000;
export const PROP_NOAMBHEAT = 0x00040000;
export const PROP_NOCTYPEDRAW = 0x00100000;
export const FLAG_STAGNANT = 0x00000001;
export const FLAG_SKIPMOVE = 0x00000002;
export const FLAG_MOVABLE = 0x00000008;
export const FLAG_PHOTDECO = 0x00000008;
export const OLD_PT_WIND = 147;
export const PMAPBITS = 9;
export const PMAPMASK = (1 << PMAPBITS) - 1;
export const PT_NUM = 1 << PMAPBITS;
export function ID(r: number): number { return r >> PMAPBITS; }
export function TYP(r: number): number { return r & PMAPMASK; }
export function PMAP(id: number, typ: number): number { return (id << PMAPBITS) | (typ & PMAPMASK); }
export function PMAPID(id: number): number { return id << PMAPBITS; }
export function InBounds(x: number, y: number): boolean { return x >= 0 && y >= 0 && x < XRES && y < YRES; }
export function InCellBounds(x: number, y: number): boolean { return x >= 0 && y >= 0 && x < XCELLS && y < YCELLS; }

// ElementGraphics.h
export const PMODE = 0x00000FFF;
export const PMODE_NONE = 0x00000000;
export const PMODE_FLAT = 0x00000001;
export const PMODE_BLOB = 0x00000002;
export const PMODE_BLUR = 0x00000004;
export const PMODE_GLOW = 0x00000008;
export const PMODE_SPARK = 0x00000010;
export const PMODE_FLARE = 0x00000020;
export const PMODE_LFLARE = 0x00000040;
export const PMODE_ADD = 0x00000080;
export const PMODE_BLEND = 0x00000100;
export const PSPEC_STICKMAN = 0x00000200;
export const OPTIONS = 0x0000F000;
export const NO_DECO = 0x00001000;
export const DECO_FIRE = 0x00002000;
export const FIREMODE = 0x00FF0000;
export const FIRE_ADD = 0x00010000;
export const FIRE_BLEND = 0x00020000;
export const FIRE_SPARK = 0x00040000;
export const EFFECT = 0xFF000000 | 0;
export const EFFECT_GRAVIN = 0x01000000;
export const EFFECT_GRAVOUT = 0x02000000;
export const EFFECT_LINES = 0x04000000;
export const EFFECT_DBGLINES = 0x08000000;
export const RENDER_EFFE = OPTIONS | PSPEC_STICKMAN | EFFECT | PMODE_SPARK | PMODE_FLARE | PMODE_LFLARE;
export const RENDER_FIRE = OPTIONS | PSPEC_STICKMAN | PMODE_ADD | PMODE_BLEND | FIRE_ADD | FIRE_BLEND;
export const RENDER_SPRK = OPTIONS | PSPEC_STICKMAN | PMODE_ADD | PMODE_BLEND | FIRE_SPARK;
export const RENDER_GLOW = OPTIONS | PSPEC_STICKMAN | PMODE_GLOW | PMODE_ADD | PMODE_BLEND;
export const RENDER_BLUR = OPTIONS | PSPEC_STICKMAN | PMODE_BLUR | PMODE_ADD | PMODE_BLEND;
export const RENDER_BLOB = OPTIONS | PSPEC_STICKMAN | PMODE_BLOB | PMODE_ADD | PMODE_BLEND;
export const RENDER_BASC = OPTIONS | PSPEC_STICKMAN | PMODE_FLAT | PMODE_ADD | PMODE_BLEND | EFFECT_LINES;
export const RENDER_NONE = OPTIONS | PSPEC_STICKMAN | PMODE_FLAT;
export const COLOUR_HEAT = 0x00000001;
export const COLOUR_LIFE = 0x00000002;
export const COLOUR_GRAD = 0x00000004;
export const COLOUR_BASC = 0x00000008;
export const COLOUR_DEFAULT = 0x00000000;
export const DISPLAY_AIRC = 0x00000001;
export const DISPLAY_AIRP = 0x00000002;
export const DISPLAY_AIRV = 0x00000004;
export const DISPLAY_AIRH = 0x00000008;
export const DISPLAY_AIR = 0x0000008F;
export const DISPLAY_WARP = 0x00000010;
export const DISPLAY_PERS = 0x00000020;
export const DISPLAY_EFFE = 0x00000040;
export const DISPLAY_AIRW = 0x00000080;

// TransitionConstants.h
export const IPL = MIN_PRESSURE - 1;
export const IPH = MAX_PRESSURE + 1;
export const ITL = MIN_TEMP - 1;
export const ITH = MAX_TEMP + 1;
export const NT = -1;
export const ST = PT_NUM;

// SimulationSettings.h
export const EDGE_VOID = 0, EDGE_SOLID = 1, EDGE_LOOP = 2, NUM_EDGEMODES = 3;
export const AIR_ON = 0, AIR_PRESSUREOFF = 1, AIR_VELOCITYOFF = 2, AIR_OFF = 3, AIR_NOUPDATE = 4, NUM_AIRMODES = 5;
export const AIRC_NONE = 0, AIRC_LEGACY = 1, AIRC_BOUSSINESQ = 2, NUM_CONVMODES = 3;
export const GRAV_VERTICAL = 0, GRAV_OFF = 1, GRAV_RADIAL = 2, GRAV_CUSTOM = 3, NUM_GRAVMODES = 4;
export const DECOSPACE_SRGB = 0, DECOSPACE_LINEAR = 1, DECOSPACE_GAMMA22 = 2, DECOSPACE_GAMMA18 = 3, NUM_DECOSPACES = 4;
export const TEMPSCALE_KELVIN = 0, TEMPSCALE_CELSIUS = 1, TEMPSCALE_FAHRENHEIT = 2, NUM_TEMPSCALES = 3;

// MenuSection.h
export const SC_WALL = 0, SC_ELEC = 1, SC_POWERED = 2, SC_SENSOR = 3, SC_FORCE = 4, SC_EXPLOSIVE = 5, SC_GAS = 6,
  SC_LIQUID = 7, SC_POWDERS = 8, SC_SOLIDS = 9, SC_NUCLEAR = 10, SC_SPECIAL = 11, SC_LIFE = 12, SC_TOOL = 13,
  SC_FAVORITES = 14, SC_DECO = 15;

// SimulationData.h
export const O_WL_WALLELEC = 122, O_WL_EWALL = 123, O_WL_DETECT = 124, O_WL_STREAM = 125, O_WL_SIGN = 126,
  O_WL_FAN = 127, O_WL_FANHELPER = 255, O_WL_ALLOWLIQUID = 128, O_WL_DESTROYALL = 129, O_WL_ERASE = 130,
  O_WL_WALL = 131, O_WL_ALLOWAIR = 132, O_WL_ALLOWSOLID = 133, O_WL_ALLOWALLELEC = 134, O_WL_EHOLE = 135,
  O_WL_ALLOWGAS = 140, O_WL_GRAV = 142, O_WL_ALLOWENERGY = 145;
export const WL_ERASE = 0, WL_WALLELEC = 1, WL_EWALL = 2, WL_DETECT = 3, WL_STREAM = 4, WL_FAN = 5,
  WL_ALLOWLIQUID = 6, WL_DESTROYALL = 7, WL_WALL = 8, WL_ALLOWAIR = 9, WL_ALLOWPOWDER = 10, WL_ALLOWALLELEC = 11,
  WL_EHOLE = 12, WL_ALLOWGAS = 13, WL_GRAV = 14, WL_ALLOWENERGY = 15, WL_BLOCKAIR = 16, WL_ERASEALL = 17,
  WL_STASIS = 18, WL_FLOODHELPER = 255;
export const UI_WALLCOUNT = 19;
export const OLD_SPC_AIR = 236;
export const SPC_AIR = 256;
export const DECO_DRAW = 0, DECO_CLEAR = 1, DECO_ADD = 2, DECO_SUBTRACT = 3, DECO_MULTIPLY = 4, DECO_DIVIDE = 5,
  DECO_SMUDGE = 6;
export const GT_GOL = 78, GT_HLIF = 79, GT_ASIM = 80, GT_2x2 = 81, GT_DANI = 82, GT_AMOE = 83, GT_MOVE = 84,
  GT_PGOL = 85, GT_DMOE = 86, GT_34 = 87, GT_LLIF = 88, GT_STAN = 89, GT_SEED = 134, GT_MAZE = 135, GT_COAG = 136,
  GT_WALL = 137, GT_GNAR = 138, GT_REPL = 139, GT_MYST = 140, GT_LOTE = 142, GT_FRG2 = 143, GT_STAR = 144,
  GT_FROG = 145, GT_BRAN = 146;
export const NGT_GOL = 0, NGT_HLIF = 1, NGT_ASIM = 2, NGT_2x2 = 3, NGT_DANI = 4, NGT_AMOE = 5, NGT_MOVE = 6,
  NGT_PGOL = 7, NGT_DMOE = 8, NGT_34 = 9, NGT_LLIF = 10, NGT_STAN = 11, NGT_SEED = 12, NGT_MAZE = 13, NGT_COAG = 14,
  NGT_WALL = 15, NGT_GNAR = 16, NGT_REPL = 17, NGT_MYST = 18, NGT_LOTE = 19, NGT_FRG2 = 20, NGT_STAR = 21,
  NGT_FROG = 22, NGT_BRAN = 23;
export const REPLACE_MODE = 0x00000001;
export const SPECIFIC_DELETE = 0x00000002;

// Simulation.h
export const CHANNELS = ((MAX_TEMP - 73) / 100 | 0) + 2;
