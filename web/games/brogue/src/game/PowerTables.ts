// @ts-nocheck
// Brogue CE 1.15.1 PowerTables.c, translated to TypeScript by re/brogue/tools/c2ts (do not edit).
import { netEnchant } from './Combat.ts';
import { tableForItemCategory } from './Items.ts';
import { fp_pow, fp_sqrt, randClumpedRange } from './Math.ts';
import { struct_creature, struct_item, struct_pcell, struct_pos, struct_tcell, struct_windowpos } from './structs.ts';
import { $mul64, $rd, $sadd, $sat, $ta, $u64, $wr, G, P } from '../rt/index.ts';
import { CHARM_GUARDIAN, CHARM_HEALTH, CHARM_NEGATION, CHARM_PROTECTION, CHARM_SHATTERING, COLS, DCOLS, DROWS, FP_FACTOR, ITEM_ATTACKS_QUICKLY, ITEM_ATTACKS_STAGGER, MESSAGE_LINES, NUMBER_GOOD_WEAPON_ENCHANT_KINDS, ROWS, STAT_BAR_WIDTH, TURNS_FOR_FULL_REGEN, W_SLAYING } from './consts.ts';


function signum(x: number): number {
  if (x === 0) {
    return 0;
  }
  return x > 0 ? 1 : -1;
}

function posEq(a: struct_pos, b: struct_pos): number {
  return (a.x === b.x && a.y === b.y ? 1 : 0) << 24 >> 24;
}

function coordinatesAreInMap(x: number, y: number): number {
  return (x >= 0 && DCOLS > x && y >= 0 && DROWS > y ? 1 : 0) << 24 >> 24;
}

function isPosInMap(p: struct_pos): number {
  return (p.x >= 0 && DCOLS > p.x && p.y >= 0 && DROWS > p.y ? 1 : 0) << 24 >> 24;
}

function locIsInWindow(w: struct_windowpos): number {
  return (w.window_x >= 0 && COLS > w.window_x && w.window_y >= 0 && ROWS > w.window_y ? 1 : 0) << 24 >> 24;
}

function windowToMap(w: struct_windowpos): struct_pos {
  return struct_pos.$of(w.window_x - STAT_BAR_WIDTH - 1 << 16 >> 16, w.window_y - MESSAGE_LINES << 16 >> 16);
}

function mapToWindow(p: struct_pos): struct_windowpos {
  return struct_windowpos.$of(p.x + STAT_BAR_WIDTH + 1 << 16 >> 16, p.y + MESSAGE_LINES << 16 >> 16);
}

function tmapAt(p: struct_pos): struct_tcell | null {
  ;
  return $sat(G.tmap[p.x], p.y);
}

function pmapAt(p: struct_pos): struct_pcell | null {
  ;
  return $sat(G.pmap[p.x], p.y);
}

function posNeighborInDirection(p: struct_pos, direction_to_step: number): struct_pos {
  ;
  return struct_pos.$of(p.x + G.nbDirs[direction_to_step][0] << 16 >> 16, p.y + G.nbDirs[direction_to_step][1] << 16 >> 16);
}

export function wandDominate(monst: struct_creature | null): number {
  return (monst.info.maxHP > monst.currentHP * 5 ? 100 : 0 > (100 * (monst.info.maxHP - monst.currentHP) / monst.info.maxHP | 0) ? 0 : 100 * (monst.info.maxHP - monst.currentHP) / monst.info.maxHP | 0) << 16 >> 16;
}

export function staffDamageLow(enchant: number): number {
  return (Math.trunc($mul64(2 + Math.trunc(enchant / FP_FACTOR), 3) / 4) | 0) << 16 >> 16;
}

export function staffDamageHigh(enchant: number): number {
  return (4 + Math.trunc(Math.trunc($mul64(5, enchant) / FP_FACTOR) / 2) | 0) << 16 >> 16;
}

export function staffDamage(enchant: number): number {
  return randClumpedRange(staffDamageLow(enchant), staffDamageHigh(enchant), 1 + Math.trunc(Math.trunc(enchant / 3) / FP_FACTOR) << 16 >> 16) << 16 >> 16;
}

export function staffBlinkDistance(enchant: number): number {
  return (2 + Math.trunc($mul64(enchant, 2) / FP_FACTOR) | 0) << 16 >> 16;
}

export function staffHasteDuration(enchant: number): number {
  return (2 + Math.trunc($mul64(enchant, 4) / FP_FACTOR) | 0) << 16 >> 16;
}

export function staffBladeCount(enchant: number): number {
  return (Math.trunc(Math.trunc($mul64(enchant, 3) / 2) / FP_FACTOR) | 0) << 16 >> 16;
}

export function staffDiscordDuration(enchant: number): number {
  return (Math.trunc($mul64(enchant, 4) / FP_FACTOR) | 0) << 16 >> 16;
}

export function staffEntrancementDuration(enchant: number): number {
  return (Math.trunc($mul64(enchant, 3) / FP_FACTOR) | 0) << 16 >> 16;
}

export function staffProtection(enchant: number): number {
  return Math.trunc($mul64(130, fp_pow(Math.trunc(9175040 / 100), Math.trunc(enchant / FP_FACTOR) - 2 | 0)) / FP_FACTOR) | 0;
}

export function staffPoison(enchant: number): number {
  let POW_POISON = $ta(Float64Array, 51, [65536, 85196, 110755, 143982, 187177, 243330, 316329, 411228, 534597, 694976, 903469, 1174510, 1526863, 1984922, 2580398, 3354518, 4360874, 5669136, 7369877, 9580840, 12455093, 16191620, 21049107, 27363839, 35572991, 46244888, 60118355, 78153861, 101600020, 132080026, 171704034, 223215244, 290179818, 377233763, 490403892, 637525060, 828782579, 1077417352, 1400642558, 1820835326, 2367085924, 3077211701, 4000375211, 5200487775, 6760634107, 8788824340, 11425471642, 14853113134, 19309047075, 25101761197, 32632289557]);
  let idx = Number(BigInt.asIntN(16, BigInt.asUintN(64, BigInt(Math.trunc(enchant / 65536) - 2 > 0 ? Math.trunc(enchant / 65536) - 2 : 0)) > BigInt.asUintN(64, BigInt(Math.trunc(408 / 8) - 1)) ? BigInt.asUintN(64, BigInt(Math.trunc(408 / 8) - 1)) : BigInt.asUintN(64, BigInt(Math.trunc(enchant / 65536) - 2 > 0 ? Math.trunc(enchant / 65536) - 2 : 0))));
  return Math.trunc($mul64(5, POW_POISON[idx]) / FP_FACTOR) | 0;
}

export function ringWisdomMultiplier(enchant: number): number {
  let POW_WISDOM = $ta(Float64Array, 41, [4753, 6180, 8034, 10444, 13577, 17650, 22945, 29829, 38778, 50412, 65536, 85196, 110755, 143982, 187177, 243330, 316329, 411228, 534597, 694976, 903469, 1174510, 1526863, 1984922, 2580398, 3354518, 4360874, 5669136, 7369877, 9580840, 12455093, 16191620, 21049107, 27363839, 35572991, 46244888, 60118355, 78153861, 101600020, 132080026, 171704034]);
  let idx = Number(BigInt.asIntN(16, BigInt.asUintN(64, BigInt((Math.trunc(enchant / 65536) > 27 ? 27 : Math.trunc(enchant / 65536)) + 10 > 0 ? (Math.trunc(enchant / 65536) > 27 ? 27 : Math.trunc(enchant / 65536)) + 10 : 0)) > BigInt.asUintN(64, BigInt(Math.trunc(328 / 8) - 1)) ? BigInt.asUintN(64, BigInt(Math.trunc(328 / 8) - 1)) : BigInt.asUintN(64, BigInt((Math.trunc(enchant / 65536) > 27 ? 27 : Math.trunc(enchant / 65536)) + 10 > 0 ? (Math.trunc(enchant / 65536) > 27 ? 27 : Math.trunc(enchant / 65536)) + 10 : 0))));
  return POW_WISDOM[idx];
}

export function charmHealing(enchant: number): number {
  return (((Math.trunc($mul64($sadd(G.charmEffectTable, CHARM_HEALTH).effectMagnitudeMultiplier, enchant) / 65536) > 0 ? Math.trunc($mul64($sadd(G.charmEffectTable, CHARM_HEALTH).effectMagnitudeMultiplier, enchant) / 65536) : 0) > 100 ? 100 : Math.trunc($mul64($sadd(G.charmEffectTable, CHARM_HEALTH).effectMagnitudeMultiplier, enchant) / 65536) > 0 ? Math.trunc($mul64($sadd(G.charmEffectTable, CHARM_HEALTH).effectMagnitudeMultiplier, enchant) / 65536) : 0) | 0) << 16 >> 16;
}

export function charmShattering(enchant: number): number {
  return ($sadd(G.charmEffectTable, CHARM_SHATTERING).effectMagnitudeConstant + Math.trunc(enchant / FP_FACTOR) | 0) << 16 >> 16;
}

export function charmGuardianLifespan(enchant: number): number {
  return ($sadd(G.charmEffectTable, CHARM_GUARDIAN).effectMagnitudeConstant + $mul64($sadd(G.charmEffectTable, CHARM_GUARDIAN).effectMagnitudeMultiplier, Math.trunc(enchant / FP_FACTOR)) | 0) << 16 >> 16;
}

export function charmNegationRadius(enchant: number): number {
  return ($sadd(G.charmEffectTable, CHARM_NEGATION).effectMagnitudeConstant + $mul64($sadd(G.charmEffectTable, CHARM_NEGATION).effectMagnitudeMultiplier, Math.trunc(enchant / FP_FACTOR)) | 0) << 16 >> 16;
}

export function charmProtection(enchant: number): number {
  let POW_CHARM_PROTECTION = $ta(Float64Array, 51, [65536, 88473, 119439, 161243, 217678, 293865, 396718, 535570, 723019, 976076, 1317703, 1778899, 2401514, 3242044, 4376759, 5908625, 7976644, 10768469, 14537434, 19625536, 26494473, 35767539, 48286178, 65186341, 88001560, 118802106, 160382844, 216516839, 292297733, 394601940, 532712620, 719162037, 970868750, 1310672812, 1769408297, 2388701201, 3224746621, 4353407939, 5877100717, 7934085969, 10711016058, 14459871678, 19520826766, 26353116134, 35576706781, 48028554155, 64838548109, 87532039948, 118168253930, 159527142806, 215361642788]);
  let idx = Number(BigInt.asIntN(16, BigInt.asUintN(64, BigInt(Math.trunc(enchant / 65536) - 1 > 0 ? Math.trunc(enchant / 65536) - 1 : 0)) > BigInt.asUintN(64, BigInt(Math.trunc(408 / 8) - 1)) ? BigInt.asUintN(64, BigInt(Math.trunc(408 / 8) - 1)) : BigInt.asUintN(64, BigInt(Math.trunc(enchant / 65536) - 1 > 0 ? Math.trunc(enchant / 65536) - 1 : 0))));
  return Math.trunc($mul64($sadd(G.charmEffectTable, CHARM_PROTECTION).effectMagnitudeMultiplier, POW_CHARM_PROTECTION[idx]) / FP_FACTOR) | 0;
}

export function weaponParalysisDuration(enchant: number): number {
  return (2 > (2 + Math.trunc(Math.trunc(enchant / 2) / 65536) | 0) ? 2 : 2 + Math.trunc(Math.trunc(enchant / 2) / 65536) | 0) << 16 >> 16;
}

export function weaponConfusionDuration(enchant: number): number {
  return (3 > (Math.trunc(Math.trunc($mul64(enchant, 3) / 2) / 65536) | 0) ? 3 : Math.trunc(Math.trunc($mul64(enchant, 3) / 2) / 65536) | 0) << 16 >> 16;
}

export function weaponForceDistance(enchant: number): number {
  return (4 > (Math.trunc($mul64(enchant, 2) / 65536) + 2 | 0) ? 4 : Math.trunc($mul64(enchant, 2) / 65536) + 2 | 0) << 16 >> 16;
}

export function weaponSlowDuration(enchant: number): number {
  return (3 > Math.trunc((($mul64(Math.trunc(enchant / 65536) + 2, enchant + 131072) | 0) / 3 | 0) / 65536) ? 3 : Math.trunc((($mul64(Math.trunc(enchant / 65536) + 2, enchant + 131072) | 0) / 3 | 0) / 65536)) << 16 >> 16;
}

export function weaponImageCount(enchant: number): number {
  return (((Math.trunc(Math.trunc(enchant / 3) / 65536) | 0) > 1 ? Math.trunc(Math.trunc(enchant / 3) / 65536) | 0 : 1) > 7 ? 7 : (Math.trunc(Math.trunc(enchant / 3) / 65536) | 0) > 1 ? Math.trunc(Math.trunc(enchant / 3) / 65536) | 0 : 1) << 16 >> 16;
}

export function weaponImageDuration(enchant: number): number {
  return 3;
}

export function armorReprisalPercent(enchant: number): number {
  return (5 > (Math.trunc($mul64(enchant, 5) / 65536) | 0) ? 5 : Math.trunc($mul64(enchant, 5) / 65536) | 0) << 16 >> 16;
}

export function armorAbsorptionMax(enchant: number): number {
  return (1 > (Math.trunc(enchant / 65536) | 0) ? 1 : Math.trunc(enchant / 65536) | 0) << 16 >> 16;
}

export function armorImageCount(enchant: number): number {
  return (((Math.trunc(Math.trunc(enchant / 3) / 65536) | 0) > 1 ? Math.trunc(Math.trunc(enchant / 3) / 65536) | 0 : 1) > 5 ? 5 : (Math.trunc(Math.trunc(enchant / 3) / 65536) | 0) > 1 ? Math.trunc(Math.trunc(enchant / 3) / 65536) | 0 : 1) << 16 >> 16;
}

export function reflectionChance(enchant: number): number {
  let POW_REFLECT = $ta(Float64Array, 200, [62926, 60421, 58015, 55705, 53487, 51358, 49313, 47349, 45464, 43654, 41916, 40247, 38644, 37106, 35628, 34210, 32848, 31540, 30284, 29078, 27920, 26809, 25741, 24716, 23732, 22787, 21880, 21009, 20172, 19369, 18598, 17857, 17146, 16464, 15808, 15179, 14574, 13994, 13437, 12902, 12388, 11895, 11421, 10967, 10530, 10111, 9708, 9321, 8950, 8594, 8252, 7923, 7608, 7305, 7014, 6735, 6466, 6209, 5962, 5724, 5496, 5278, 5067, 4866, 4672, 4486, 4307, 4136, 3971, 3813, 3661, 3515, 3375, 3241, 3112, 2988, 2869, 2755, 2645, 2540, 2439, 2341, 2248, 2159, 2073, 1990, 1911, 1835, 1762, 1692, 1624, 1559, 1497, 1438, 1380, 1325, 1273, 1222, 1173, 1127, 1082, 1039, 997, 958, 919, 883, 848, 814, 781, 750, 720, 692, 664, 638, 612, 588, 564, 542, 520, 500, 480, 461, 442, 425, 408, 391, 376, 361, 346, 333, 319, 307, 294, 283, 271, 261, 250, 240, 231, 221, 213, 204, 196, 188, 181, 173, 166, 160, 153, 147, 141, 136, 130, 125, 120, 115, 111, 106, 102, 98, 94, 90, 87, 83, 80, 77, 74, 71, 68, 65, 62, 60, 58, 55, 53, 51, 49, 47, 45, 43, 41, 40, 38, 37, 35, 34, 32, 31, 30, 29, 27, 26, 25, 24, 23, 22, 21, 21, 20, 19]);
  let idx = Number(BigInt.asIntN(16, BigInt.asUintN(64, BigInt(Math.trunc($mul64(enchant, 4) / 65536) - 1 > 0 ? Math.trunc($mul64(enchant, 4) / 65536) - 1 : 0)) > BigInt.asUintN(64, BigInt(Math.trunc(1600 / 8) - 1)) ? BigInt.asUintN(64, BigInt(Math.trunc(1600 / 8) - 1)) : BigInt.asUintN(64, BigInt(Math.trunc($mul64(enchant, 4) / 65536) - 1 > 0 ? Math.trunc($mul64(enchant, 4) / 65536) - 1 : 0))));
  return ((100 - Math.trunc($mul64(100, POW_REFLECT[idx]) / 65536) > 1 ? 100 - Math.trunc($mul64(100, POW_REFLECT[idx]) / 65536) : 1) > 100 ? 100 : 100 - Math.trunc($mul64(100, POW_REFLECT[idx]) / 65536) > 1 ? 100 - Math.trunc($mul64(100, POW_REFLECT[idx]) / 65536) : 1) << 16 >> 16;
}

export function turnsForFullRegenInThousandths(bonus: number): number {
  let POW_REGEN = $ta(Float64Array, 61, [1163770, 872827, 654620, 490965, 368224, 276168, 207126, 155344, 116508, 87381, 65536, 49152, 36864, 27648, 20736, 15552, 11664, 8748, 6561, 4920, 3690, 2767, 2075, 1556, 1167, 875, 656, 492, 369, 277, 207, 155, 116, 87, 65, 49, 36, 27, 20, 15, 11, 8, 6, 4, 3, 2, 2, 1, 1]);
  let idx = Number(BigInt.asIntN(16, BigInt.asUintN(64, BigInt(Math.trunc(bonus / 65536) + 10 > 0 ? Math.trunc(bonus / 65536) + 10 : 0)) > BigInt.asUintN(64, BigInt(Math.trunc(488 / 8) - 1)) ? BigInt.asUintN(64, BigInt(Math.trunc(488 / 8) - 1)) : BigInt.asUintN(64, BigInt(Math.trunc(bonus / 65536) + 10 > 0 ? Math.trunc(bonus / 65536) + 10 : 0))));
  return Math.trunc($mul64(1000 * TURNS_FOR_FULL_REGEN, POW_REGEN[idx]) / FP_FACTOR) + 2000;
}

export function damageFraction(netEnchant: number): number {
  let POW_DAMAGE_FRACTION = $ta(Float64Array, 281, [18598, 18894, 19193, 19498, 19807, 20122, 20441, 20765, 21095, 21430, 21770, 22115, 22466, 22823, 23185, 23553, 23926, 24306, 24692, 25084, 25482, 25886, 26297, 26714, 27138, 27569, 28006, 28451, 28902, 29361, 29827, 30300, 30781, 31269, 31765, 32269, 32781, 33302, 33830, 34367, 34912, 35466, 36029, 36601, 37182, 37772, 38371, 38980, 39598, 40227, 40865, 41514, 42172, 42842, 43521, 44212, 44914, 45626, 46350, 47086, 47833, 48592, 49363, 50146, 50942, 51751, 52572, 53406, 54253, 55114, 55989, 56877, 57780, 58697, 59628, 60574, 61536, 62512, 63504, 64512, 65536, 66575, 67632, 68705, 69795, 70903, 72028, 73171, 74332, 75512, 76710, 77927, 79164, 80420, 81696, 82992, 84309, 85647, 87006, 88387, 89789, 91214, 92662, 94132, 95626, 97143, 98685, 100251, 101842, 103458, 105099, 106767, 108461, 110182, 111931, 113707, 115511, 117344, 119206, 121098, 123020, 124972, 126955, 128969, 131016, 133095, 135207, 137352, 139532, 141746, 143995, 146280, 148602, 150960, 153355, 155789, 158261, 160772, 163323, 165915, 168548, 171222, 173939, 176699, 179503, 182352, 185245, 188185, 191171, 194205, 197286, 200417, 203597, 206828, 210110, 213444, 216831, 220272, 223767, 227318, 230925, 234589, 238312, 242094, 245935, 249838, 253802, 257830, 261921, 266077, 270300, 274589, 278946, 283372, 287869, 292437, 297078, 301792, 306581, 311445, 316388, 321408, 326508, 331689, 336953, 342300, 347731, 353249, 358855, 364549, 370334, 376211, 382180, 388245, 394406, 400664, 407022, 413481, 420042, 426707, 433479, 440357, 447345, 454443, 461655, 468980, 476422, 483982, 491662, 499464, 507390, 515441, 523620, 531929, 540370, 548945, 557656, 566505, 575494, 584626, 593903, 603328, 612901, 622627, 632507, 642544, 652740, 663098, 673620, 684309, 695168, 706199, 717406, 728790, 740354, 752102, 764037, 776161, 788477, 800989, 813699, 826611, 839728, 853053, 866590, 880341, 894311, 908502, 922918, 937563, 952441, 967555, 982908, 998505, 1014350, 1030446, 1046797, 1063408, 1080282, 1097425, 1114839, 1132529, 1150501, 1168757, 1187303, 1206144, 1225283, 1244726, 1264478, 1284543, 1304927, 1325634, 1346669, 1368039, 1389747, 1411800, 1434203, 1456961, 1480081, 1503567, 1527426]);
  let idx = Number(BigInt.asIntN(16, BigInt.asUintN(64, BigInt(Math.trunc($mul64(netEnchant, 4) / 65536) + 80 > 0 ? Math.trunc($mul64(netEnchant, 4) / 65536) + 80 : 0)) > BigInt.asUintN(64, BigInt(Math.trunc(2248 / 8) - 1)) ? BigInt.asUintN(64, BigInt(Math.trunc(2248 / 8) - 1)) : BigInt.asUintN(64, BigInt(Math.trunc($mul64(netEnchant, 4) / 65536) + 80 > 0 ? Math.trunc($mul64(netEnchant, 4) / 65536) + 80 : 0))));
  return POW_DAMAGE_FRACTION[idx];
}

export function accuracyFraction(netEnchant: number): number {
  let POW_ACCURACY_FRACTION = $ta(Float64Array, 281, [18598, 18894, 19193, 19498, 19807, 20122, 20441, 20765, 21095, 21430, 21770, 22115, 22466, 22823, 23185, 23553, 23926, 24306, 24692, 25084, 25482, 25886, 26297, 26714, 27138, 27569, 28006, 28451, 28902, 29361, 29827, 30300, 30781, 31269, 31765, 32269, 32781, 33302, 33830, 34367, 34912, 35466, 36029, 36601, 37182, 37772, 38371, 38980, 39598, 40227, 40865, 41514, 42172, 42842, 43521, 44212, 44914, 45626, 46350, 47086, 47833, 48592, 49363, 50146, 50942, 51751, 52572, 53406, 54253, 55114, 55989, 56877, 57780, 58697, 59628, 60574, 61536, 62512, 63504, 64512, 65536, 66575, 67632, 68705, 69795, 70903, 72028, 73171, 74332, 75512, 76710, 77927, 79164, 80420, 81696, 82992, 84309, 85647, 87006, 88387, 89789, 91214, 92662, 94132, 95626, 97143, 98685, 100251, 101842, 103458, 105099, 106767, 108461, 110182, 111931, 113707, 115511, 117344, 119206, 121098, 123020, 124972, 126955, 128969, 131016, 133095, 135207, 137352, 139532, 141746, 143995, 146280, 148602, 150960, 153355, 155789, 158261, 160772, 163323, 165915, 168548, 171222, 173939, 176699, 179503, 182352, 185245, 188185, 191171, 194205, 197286, 200417, 203597, 206828, 210110, 213444, 216831, 220272, 223767, 227318, 230925, 234589, 238312, 242094, 245935, 249838, 253802, 257830, 261921, 266077, 270300, 274589, 278946, 283372, 287869, 292437, 297078, 301792, 306581, 311445, 316388, 321408, 326508, 331689, 336953, 342300, 347731, 353249, 358855, 364549, 370334, 376211, 382180, 388245, 394406, 400664, 407022, 413481, 420042, 426707, 433479, 440357, 447345, 454443, 461655, 468980, 476422, 483982, 491662, 499464, 507390, 515441, 523620, 531929, 540370, 548945, 557656, 566505, 575494, 584626, 593903, 603328, 612901, 622627, 632507, 642544, 652740, 663098, 673620, 684309, 695168, 706199, 717406, 728790, 740354, 752102, 764037, 776161, 788477, 800989, 813699, 826611, 839728, 853053, 866590, 880341, 894311, 908502, 922918, 937563, 952441, 967555, 982908, 998505, 1014350, 1030446, 1046797, 1063408, 1080282, 1097425, 1114839, 1132529, 1150501, 1168757, 1187303, 1206144, 1225283, 1244726, 1264478, 1284543, 1304927, 1325634, 1346669, 1368039, 1389747, 1411800, 1434203, 1456961, 1480081, 1503567, 1527426]);
  let idx = Number(BigInt.asIntN(16, BigInt.asUintN(64, BigInt(Math.trunc($mul64(netEnchant, 4) / 65536) + 80 > 0 ? Math.trunc($mul64(netEnchant, 4) / 65536) + 80 : 0)) > BigInt.asUintN(64, BigInt(Math.trunc(2248 / 8) - 1)) ? BigInt.asUintN(64, BigInt(Math.trunc(2248 / 8) - 1)) : BigInt.asUintN(64, BigInt(Math.trunc($mul64(netEnchant, 4) / 65536) + 80 > 0 ? Math.trunc($mul64(netEnchant, 4) / 65536) + 80 : 0))));
  return POW_ACCURACY_FRACTION[idx];
}

export function defenseFraction(netDefense: number): number {
  let POW_DEFENSE_FRACTION = $ta(Float64Array, 281, [897530, 868644, 840688, 813632, 787446, 762103, 737575, 713837, 690863, 668629, 647110, 626283, 606127, 586619, 567740, 549468, 531784, 514669, 498105, 482074, 466559, 451543, 437011, 422946, 409334, 396160, 383410, 371071, 359128, 347570, 336384, 325558, 315080, 304940, 295125, 285627, 276435, 267538, 258927, 250594, 242529, 234724, 227169, 219858, 212782, 205934, 199306, 192892, 186684, 180676, 174861, 169233, 163786, 158515, 153414, 148476, 143698, 139073, 134597, 130265, 126073, 122015, 118088, 114288, 110609, 107050, 103604, 100270, 97043, 93920, 90897, 87971, 85140, 82400, 79748, 77181, 74697, 72293, 69967, 67715, 65536, 63426, 61385, 59409, 57497, 55647, 53856, 52123, 50445, 48822, 47250, 45730, 44258, 42833, 41455, 40121, 38829, 37580, 36370, 35200, 34067, 32970, 31909, 30882, 29888, 28926, 27995, 27094, 26222, 25378, 24562, 23771, 23006, 22266, 21549, 20855, 20184, 19535, 18906, 18297, 17709, 17139, 16587, 16053, 15536, 15036, 14552, 14084, 13631, 13192, 12768, 12357, 11959, 11574, 11201, 10841, 10492, 10154, 9828, 9511, 9205, 8909, 8622, 8345, 8076, 7816, 7565, 7321, 7085, 6857, 6637, 6423, 6216, 6016, 5823, 5635, 5454, 5278, 5108, 4944, 4785, 4631, 4482, 4337, 4198, 4063, 3932, 3805, 3683, 3564, 3450, 3339, 3231, 3127, 3026, 2929, 2835, 2744, 2655, 2570, 2487, 2407, 2329, 2255, 2182, 2112, 2044, 1978, 1914, 1853, 1793, 1735, 1679, 1625, 1573, 1522, 1473, 1426, 1380, 1336, 1293, 1251, 1211, 1172, 1134, 1097, 1062, 1028, 995, 963, 932, 902, 873, 845, 817, 791, 766, 741, 717, 694, 672, 650, 629, 609, 589, 570, 552, 534, 517, 500, 484, 469, 453, 439, 425, 411, 398, 385, 373, 361, 349, 338, 327, 316, 306, 296, 287, 277, 268, 260, 251, 243, 235, 228, 221, 213, 207, 200, 193, 187, 181, 175, 170, 164, 159, 154, 149, 144, 139, 135, 130, 126, 122, 118, 114, 111, 107, 104, 100, 97, 94]);
  let idx = Number(BigInt.asIntN(16, BigInt.asUintN(64, BigInt(Math.trunc(Math.trunc($mul64(netDefense, 4) / 10) / 65536) + 80 > 0 ? Math.trunc(Math.trunc($mul64(netDefense, 4) / 10) / 65536) + 80 : 0)) > BigInt.asUintN(64, BigInt(Math.trunc(2248 / 8) - 1)) ? BigInt.asUintN(64, BigInt(Math.trunc(2248 / 8) - 1)) : BigInt.asUintN(64, BigInt(Math.trunc(Math.trunc($mul64(netDefense, 4) / 10) / 65536) + 80 > 0 ? Math.trunc(Math.trunc($mul64(netDefense, 4) / 10) / 65536) + 80 : 0))));
  return POW_DEFENSE_FRACTION[idx];
}

export function charmEffectDuration(charmKind: number, enchant: number): number {
  let idx = ((enchant - 1 > 0 ? enchant - 1 : 0) > 50 - 1 ? 50 - 1 : enchant - 1 > 0 ? enchant - 1 : 0) << 16 >> 16;
  return Math.trunc($mul64($sadd(G.charmEffectTable, charmKind).effectDurationBase, $rd($sadd(G.charmEffectTable, charmKind).effectDurationIncrement, idx)) / FP_FACTOR) << 16 >> 16;
}

export function charmRechargeDelay(charmKind: number, enchant: number): number {
  enchant = ((enchant > 1 ? enchant : 1) > 50 ? 50 : enchant > 1 ? enchant : 1) << 16 >> 16;
  let delay = charmEffectDuration(charmKind, enchant) + Math.trunc($mul64($sadd(G.charmEffectTable, charmKind).rechargeDelayDuration, fp_pow($sadd(G.charmEffectTable, charmKind).rechargeDelayBase, enchant)) / FP_FACTOR) << 16 >> 16;
  return ($sadd(G.charmEffectTable, charmKind).rechargeDelayMinTurns > delay ? $sadd(G.charmEffectTable, charmKind).rechargeDelayMinTurns : delay) << 16 >> 16;
}

export function runicWeaponChance(theItem: struct_item | null, customEnchantLevel: number, enchantLevel: number): number {
  let POW_16_RUNIC_DECREMENT = $ta(Float64Array, 201, [65536, 62740, 60064, 57502, 55050, 52702, 50454, 48302, 46242, 44269, 42381, 40574, 38843, 37186, 35600, 34082, 32628, 31236, 29904, 28629, 27407, 26238, 25119, 24048, 23022, 22040, 21100, 20200, 19339, 18514, 17724, 16968, 16244, 15551, 14888, 14253, 13645, 13063, 12506, 11972, 11462, 10973, 10505, 10057, 9628, 9217, 8824, 8448, 8087, 7742, 7412, 7096, 6793, 6503, 6226, 5961, 5706, 5463, 5230, 5007, 4793, 4589, 4393, 4206, 4026, 3854, 3690, 3533, 3382, 3238, 3100, 2967, 2841, 2720, 2604, 2492, 2386, 2284, 2187, 2094, 2004, 1919, 1837, 1759, 1684, 1612, 1543, 1477, 1414, 1354, 1296, 1241, 1188, 1137, 1089, 1042, 998, 955, 914, 875, 838, 802, 768, 735, 704, 674, 645, 617, 591, 566, 542, 519, 496, 475, 455, 436, 417, 399, 382, 366, 350, 335, 321, 307, 294, 281, 269, 258, 247, 236, 226, 217, 207, 198, 190, 182, 174, 167, 159, 153, 146, 140, 134, 128, 123, 117, 112, 108, 103, 99, 94, 90, 86, 83, 79, 76, 73, 69, 66, 64, 61, 58, 56, 53, 51, 49, 47, 45, 43, 41, 39, 37, 36, 34, 33, 31, 30, 29, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18, 18, 17, 16, 15, 15, 14, 13, 13, 12, 12, 11, 11, 10]);
  let POW_15_RUNIC_DECREMENT = $ta(Float64Array, 201, [65536, 62926, 60421, 58015, 55705, 53487, 51358, 49313, 47349, 45464, 43654, 41916, 40247, 38644, 37106, 35628, 34210, 32848, 31540, 30284, 29078, 27920, 26809, 25741, 24716, 23732, 22787, 21880, 21009, 20172, 19369, 18598, 17857, 17146, 16464, 15808, 15179, 14574, 13994, 13437, 12902, 12388, 11895, 11421, 10967, 10530, 10111, 9708, 9321, 8950, 8594, 8252, 7923, 7608, 7305, 7014, 6735, 6466, 6209, 5962, 5724, 5496, 5278, 5067, 4866, 4672, 4486, 4307, 4136, 3971, 3813, 3661, 3515, 3375, 3241, 3112, 2988, 2869, 2755, 2645, 2540, 2439, 2341, 2248, 2159, 2073, 1990, 1911, 1835, 1762, 1692, 1624, 1559, 1497, 1438, 1380, 1325, 1273, 1222, 1173, 1127, 1082, 1039, 997, 958, 919, 883, 848, 814, 781, 750, 720, 692, 664, 638, 612, 588, 564, 542, 520, 500, 480, 461, 442, 425, 408, 391, 376, 361, 346, 333, 319, 307, 294, 283, 271, 261, 250, 240, 231, 221, 213, 204, 196, 188, 181, 173, 166, 160, 153, 147, 141, 136, 130, 125, 120, 115, 111, 106, 102, 98, 94, 90, 87, 83, 80, 77, 74, 71, 68, 65, 62, 60, 58, 55, 53, 51, 49, 47, 45, 43, 41, 40, 38, 37, 35, 34, 32, 31, 30, 29, 27, 26, 25, 24, 23, 22, 21, 21, 20, 19]);
  let POW_14_RUNIC_DECREMENT = $ta(Float64Array, 201, [65536, 63110, 60775, 58526, 56360, 54275, 52267, 50332, 48470, 46676, 44949, 43286, 41684, 40142, 38656, 37226, 35848, 34522, 33244, 32014, 30829, 29689, 28590, 27532, 26513, 25532, 24587, 23677, 22801, 21958, 21145, 20363, 19609, 18883, 18185, 17512, 16864, 16240, 15639, 15060, 14503, 13966, 13449, 12952, 12472, 12011, 11566, 11138, 10726, 10329, 9947, 9579, 9224, 8883, 8554, 8238, 7933, 7639, 7357, 7084, 6822, 6570, 6327, 6092, 5867, 5650, 5441, 5239, 5046, 4859, 4679, 4506, 4339, 4179, 4024, 3875, 3732, 3593, 3460, 3332, 3209, 3090, 2976, 2866, 2760, 2658, 2559, 2465, 2373, 2285, 2201, 2119, 2041, 1965, 1893, 1823, 1755, 1690, 1628, 1567, 1509, 1454, 1400, 1348, 1298, 1250, 1204, 1159, 1116, 1075, 1035, 997, 960, 924, 890, 857, 825, 795, 765, 737, 710, 684, 658, 634, 610, 588, 566, 545, 525, 505, 487, 469, 451, 435, 418, 403, 388, 374, 360, 346, 334, 321, 309, 298, 287, 276, 266, 256, 247, 237, 229, 220, 212, 204, 197, 189, 182, 176, 169, 163, 157, 151, 145, 140, 135, 130, 125, 120, 116, 111, 107, 103, 99, 96, 92, 89, 85, 82, 79, 76, 73, 71, 68, 66, 63, 61, 58, 56, 54, 52, 50, 48, 47, 45, 43, 42, 40, 38, 37, 36, 34]);
  let POW_11_RUNIC_DECREMENT = $ta(Float64Array, 201, [65536, 63654, 61826, 60051, 58327, 56652, 55025, 53445, 51911, 50420, 48972, 47566, 46200, 44874, 43585, 42334, 41118, 39938, 38791, 37677, 36595, 35544, 34524, 33533, 32570, 31634, 30726, 29844, 28987, 28155, 27346, 26561, 25798, 25058, 24338, 23639, 22960, 22301, 21661, 21039, 20435, 19848, 19278, 18725, 18187, 17665, 17157, 16665, 16186, 15721, 15270, 14832, 14406, 13992, 13590, 13200, 12821, 12453, 12095, 11748, 11411, 11083, 10765, 10456, 10155, 9864, 9581, 9305, 9038, 8779, 8527, 8282, 8044, 7813, 7589, 7371, 7159, 6954, 6754, 6560, 6372, 6189, 6011, 5838, 5671, 5508, 5350, 5196, 5047, 4902, 4761, 4624, 4492, 4363, 4237, 4116, 3997, 3883, 3771, 3663, 3558, 3456, 3356, 3260, 3166, 3075, 2987, 2901, 2818, 2737, 2658, 2582, 2508, 2436, 2366, 2298, 2232, 2168, 2106, 2045, 1986, 1929, 1874, 1820, 1768, 1717, 1668, 1620, 1573, 1528, 1484, 1442, 1400, 1360, 1321, 1283, 1246, 1210, 1176, 1142, 1109, 1077, 1046, 1016, 987, 959, 931, 904, 878, 853, 829, 805, 782, 759, 737, 716, 696, 676, 656, 637, 619, 601, 584, 567, 551, 535, 520, 505, 490, 476, 462, 449, 436, 424, 412, 400, 388, 377, 366, 356, 345, 336, 326, 317, 307, 299, 290, 282, 274, 266, 258, 251, 243, 236, 230, 223, 217, 210, 204, 198, 193]);
  let POW_7_RUNIC_DECREMENT = $ta(Float64Array, 201, [65536, 64357, 63200, 62064, 60948, 59852, 58776, 57719, 56682, 55662, 54662, 53679, 52714, 51766, 50835, 49921, 49024, 48142, 47277, 46427, 45592, 44772, 43967, 43177, 42401, 41638, 40890, 40155, 39433, 38724, 38027, 37344, 36672, 36013, 35365, 34730, 34105, 33492, 32890, 32298, 31718, 31147, 30587, 30038, 29497, 28967, 28446, 27935, 27433, 26939, 26455, 25979, 25512, 25054, 24603, 24161, 23726, 23300, 22881, 22470, 22066, 21669, 21279, 20897, 20521, 20152, 19790, 19434, 19084, 18741, 18404, 18073, 17748, 17429, 17116, 16808, 16506, 16209, 15918, 15632, 15351, 15075, 14804, 14537, 14276, 14019, 13767, 13520, 13277, 13038, 12804, 12573, 12347, 12125, 11907, 11693, 11483, 11276, 11074, 10875, 10679, 10487, 10299, 10113, 9931, 9753, 9578, 9405, 9236, 9070, 8907, 8747, 8590, 8435, 8284, 8135, 7988, 7845, 7704, 7565, 7429, 7296, 7164, 7036, 6909, 6785, 6663, 6543, 6425, 6310, 6196, 6085, 5976, 5868, 5763, 5659, 5557, 5457, 5359, 5263, 5168, 5075, 4984, 4894, 4806, 4720, 4635, 4552, 4470, 4390, 4311, 4233, 4157, 4082, 4009, 3937, 3866, 3796, 3728, 3661, 3595, 3531, 3467, 3405, 3344, 3283, 3224, 3166, 3110, 3054, 2999, 2945, 2892, 2840, 2789, 2739, 2689, 2641, 2594, 2547, 2501, 2456, 2412, 2369, 2326, 2284, 2243, 2203, 2163, 2124, 2086, 2048, 2012, 1975, 1940, 1905, 1871, 1837, 1804, 1772, 1740]);
  let POW_6_RUNIC_DECREMENT = $ta(Float64Array, 201, [65536, 64530, 63539, 62564, 61603, 60658, 59727, 58810, 57907, 57018, 56143, 55281, 54433, 53597, 52774, 51964, 51167, 50381, 49608, 48846, 48097, 47358, 46631, 45916, 45211, 44517, 43833, 43161, 42498, 41846, 41203, 40571, 39948, 39335, 38731, 38137, 37551, 36975, 36407, 35848, 35298, 34756, 34223, 33698, 33180, 32671, 32169, 31676, 31189, 30711, 30239, 29775, 29318, 28868, 28425, 27989, 27559, 27136, 26719, 26309, 25905, 25508, 25116, 24731, 24351, 23977, 23609, 23247, 22890, 22539, 22193, 21852, 21516, 21186, 20861, 20541, 20225, 19915, 19609, 19308, 19012, 18720, 18433, 18150, 17871, 17597, 17327, 17061, 16799, 16541, 16287, 16037, 15791, 15549, 15310, 15075, 14843, 14616, 14391, 14170, 13953, 13739, 13528, 13320, 13116, 12914, 12716, 12521, 12329, 12139, 11953, 11770, 11589, 11411, 11236, 11063, 10894, 10726, 10562, 10400, 10240, 10083, 9928, 9776, 9625, 9478, 9332, 9189, 9048, 8909, 8772, 8638, 8505, 8374, 8246, 8119, 7995, 7872, 7751, 7632, 7515, 7400, 7286, 7174, 7064, 6956, 6849, 6744, 6640, 6538, 6438, 6339, 6242, 6146, 6052, 5959, 5867, 5777, 5688, 5601, 5515, 5430, 5347, 5265, 5184, 5105, 5026, 4949, 4873, 4798, 4725, 4652, 4581, 4510, 4441, 4373, 4306, 4240, 4175, 4111, 4047, 3985, 3924, 3864, 3805, 3746, 3689, 3632, 3576, 3521, 3467, 3414, 3362, 3310, 3259, 3209, 3160, 3111, 3064, 3017, 2970]);
  let effectChances = [P(POW_16_RUNIC_DECREMENT),
P(POW_6_RUNIC_DECREMENT),
P(POW_7_RUNIC_DECREMENT),
P(POW_15_RUNIC_DECREMENT),
P(POW_14_RUNIC_DECREMENT),
P(POW_11_RUNIC_DECREMENT),
P(POW_15_RUNIC_DECREMENT),
null,
null,
null];
  let modifier = 0;
  let runicType = theItem.enchant2;
  let chance = 0;
  let adjustedBaseDamage = 0;
  let tableIndex = 0;
  if (runicType === W_SLAYING) {
    return 0;
  }
  if (runicType >= NUMBER_GOOD_WEAPON_ENCHANT_KINDS) {
    return 15;
  }
  if (!customEnchantLevel) {
    enchantLevel = netEnchant(theItem);
  }
  adjustedBaseDamage = (($sadd(tableForItemCategory(theItem.category), theItem.kind).range.lowerBound + $sadd(tableForItemCategory(theItem.category), theItem.kind).range.upperBound) / 2 | 0) << 16 >> 16;
  if ((theItem.flags & ITEM_ATTACKS_STAGGER) >>> 0) {
    adjustedBaseDamage = (adjustedBaseDamage / 2 | 0) << 16 >> 16;
  }
  modifier = FP_FACTOR - (Math.trunc($mul64(adjustedBaseDamage, 65536) / 18) > Math.trunc(6488064 / 100) ? Math.trunc(6488064 / 100) : Math.trunc($mul64(adjustedBaseDamage, 65536) / 18));
  if (0 > enchantLevel) {
    chance = 0;
  } else {
    tableIndex = Math.trunc(Math.trunc($mul64($mul64(enchantLevel, modifier), 4) / FP_FACTOR) / FP_FACTOR) << 16 >> 16;
    tableIndex = ($u64(tableIndex > 0 ? tableIndex : 0) > Math.trunc(1608 / 8) - 1 ? Math.trunc(1608 / 8) - 1 : $u64(tableIndex > 0 ? tableIndex : 0)) << 16 >> 16;
    chance = 100 - (Math.trunc($mul64(100, $rd(effectChances[runicType], tableIndex)) / FP_FACTOR) << 16 >> 16) << 16 >> 16;
  }
  if ((theItem.flags & ITEM_ATTACKS_STAGGER) >>> 0) {
    chance = 100 - (Math.imul(100 - chance, 100 - chance) / 100 | 0) << 16 >> 16;
  }
  if ((theItem.flags & ITEM_ATTACKS_QUICKLY) >>> 0) {
    chance = Math.trunc($mul64(100, FP_FACTOR - fp_sqrt(FP_FACTOR - Math.trunc($mul64(chance, FP_FACTOR) / 100))) / FP_FACTOR) << 16 >> 16;
  }
  chance = ((chance > (1 > Math.trunc(enchantLevel / 65536) << 16 >> 16 ? 1 : Math.trunc(enchantLevel / 65536) << 16 >> 16) ? chance : 1 > Math.trunc(enchantLevel / 65536) << 16 >> 16 ? 1 : Math.trunc(enchantLevel / 65536) << 16 >> 16) > 100 ? 100 : chance > (1 > Math.trunc(enchantLevel / 65536) << 16 >> 16 ? 1 : Math.trunc(enchantLevel / 65536) << 16 >> 16) ? chance : 1 > Math.trunc(enchantLevel / 65536) << 16 >> 16 ? 1 : Math.trunc(enchantLevel / 65536) << 16 >> 16) << 16 >> 16;
  return chance;
}

export function $init(): void {
}
