// @ts-nocheck
// Brogue CE 1.15.1 GlobalsBase.c, translated to TypeScript by re/brogue/tools/c2ts (do not edit).
import { struct_archivedMessage, struct_color, struct_creature, struct_creatureList, struct_pcell, struct_playerCharacter, struct_pos, struct_screenDisplayBuffer, struct_tcell, struct_windowpos } from './structs.ts';
import { $arr, $rows, $sarr, $ta, G } from '../rt/index.ts';
import { COLS, DCOLS, DROWS, MESSAGE_LINES, ROWS, STAT_BAR_WIDTH, VARIANT_BROGUE, false_, true_ } from './consts.ts';


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

export function $init(): void {
  G.tmap = $arr(79, () => $sarr(struct_tcell, 29));
  G.pmap = $arr(79, () => $sarr(struct_pcell, 29));
  G.scentMap = null;
  G.displayBuffer = new struct_screenDisplayBuffer();
  G.terrainRandomValues = $arr(79, () => $arr(29, () => new Int16Array(8)));
  G.safetyMap = null;
  G.allySafetyMap = null;
  G.chokeMap = null;
  G.nbDirs = $rows([$ta(Int16Array, 2, [0, -1]),
$ta(Int16Array, 2, [0, 1]),
$ta(Int16Array, 2, [-1]),
$ta(Int16Array, 2, [1]),
$ta(Int16Array, 2, [-1, -1]),
$ta(Int16Array, 2, [-1, 1]),
$ta(Int16Array, 2, [1, -1]),
$ta(Int16Array, 2, [1, 1])]);
  G.cDirs = $rows([$ta(Int16Array, 2, [0, 1]),
$ta(Int16Array, 2, [1, 1]),
$ta(Int16Array, 2, [1]),
$ta(Int16Array, 2, [1, -1]),
$ta(Int16Array, 2, [0, -1]),
$ta(Int16Array, 2, [-1, -1]),
$ta(Int16Array, 2, [-1]),
$ta(Int16Array, 2, [-1, 1])]);
  G.numberOfWaypoints = 0;
  G.levels = null;
  G.player = new struct_creature();
  G.rogue = new struct_playerCharacter();
  G.gameConst = null;
  G.gameVariant = VARIANT_BROGUE;
  G.monsters = null;
  G.dormantMonsters = null;
  G.purgatory = new struct_creatureList();
  G.floorItems = null;
  G.packItems = null;
  G.monsterItemsHopper = null;
  G.displayedMessage = $arr(3, () => new Int8Array(200));
  G.messagesUnconfirmed = 0;
  G.combatText = new Int8Array(200);
  G.messageArchivePosition = 0;
  G.messageArchive = $sarr(struct_archivedMessage, 1360);
  G.currentFilePath = new Int8Array(4096);
  G.displayDetail = $arr(79, () => new Int8Array(29));
  G.inputRecordBuffer = new Uint8Array(1100);
  G.locationInRecordingBuffer = 0;
  G.randomNumbersGenerated = 0;
  G.positionInPlaybackFile = 0;
  G.lengthOfPlaybackFile = 0;
  G.recordingLocation = 0;
  G.maxLevelChanges = 0;
  G.annotationPathname = new Int8Array(4096);
  G.previousGameSeed = 0n;
  G.WINDOW_POSITION_DUNGEON_TOP_LEFT = struct_windowpos.$of(STAT_BAR_WIDTH + 3, MESSAGE_LINES + 2);
  G.white = struct_color.$of(100, 100, 100, 0, 0, 0, 0, false_);
  G.gray = struct_color.$of(50, 50, 50, 0, 0, 0, 0, false_);
  G.darkGray = struct_color.$of(30, 30, 30, 0, 0, 0, 0, false_);
  G.veryDarkGray = struct_color.$of(15, 15, 15, 0, 0, 0, 0, false_);
  G.black = struct_color.$of(0, 0, 0, 0, 0, 0, 0, false_);
  G.yellow = struct_color.$of(100, 100, 0, 0, 0, 0, 0, false_);
  G.darkYellow = struct_color.$of(50, 50, 0, 0, 0, 0, 0, false_);
  G.teal = struct_color.$of(30, 100, 100, 0, 0, 0, 0, false_);
  G.purple = struct_color.$of(100, 0, 100, 0, 0, 0, 0, false_);
  G.darkPurple = struct_color.$of(50, 0, 50, 0, 0, 0, 0, false_);
  G.brown = struct_color.$of(60, 40, 0, 0, 0, 0, 0, false_);
  G.green = struct_color.$of(0, 100, 0, 0, 0, 0, 0, false_);
  G.darkGreen = struct_color.$of(0, 50, 0, 0, 0, 0, 0, false_);
  G.orange = struct_color.$of(100, 50, 0, 0, 0, 0, 0, false_);
  G.darkOrange = struct_color.$of(50, 25, 0, 0, 0, 0, 0, false_);
  G.blue = struct_color.$of(0, 0, 100, 0, 0, 0, 0, false_);
  G.darkBlue = struct_color.$of(0, 0, 50, 0, 0, 0, 0, false_);
  G.darkTurquoise = struct_color.$of(0, 40, 65, 0, 0, 0, 0, false_);
  G.lightBlue = struct_color.$of(40, 40, 100, 0, 0, 0, 0, false_);
  G.pink = struct_color.$of(100, 60, 66, 0, 0, 0, 0, false_);
  G.darkPink = struct_color.$of(50, 30, 33, 0, 0, 0, 0, false_);
  G.red = struct_color.$of(100, 0, 0, 0, 0, 0, 0, false_);
  G.darkRed = struct_color.$of(50, 0, 0, 0, 0, 0, 0, false_);
  G.tanColor = struct_color.$of(80, 67, 15, 0, 0, 0, 0, false_);
  G.rainbow = struct_color.$of(-70, -70, -70, 170, 170, 170, 0, true_);
  G.POW_0_CHARM_INCREMENT = $ta(Float64Array, 51, [65536, 65536, 65536, 65536, 65536, 65536, 65536, 65536, 65536, 65536, 65536, 65536, 65536, 65536, 65536, 65536, 65536, 65536, 65536, 65536, 65536, 65536, 65536, 65536, 65536, 65536, 65536, 65536, 65536, 65536, 65536, 65536, 65536, 65536, 65536, 65536, 65536, 65536, 65536, 65536, 65536, 65536, 65536, 65536, 65536, 65536, 65536, 65536, 65536, 65536, 65536]);
  G.POW_120_CHARM_INCREMENT = $ta(Float64Array, 51, [78643, 94371, 113246, 135895, 163074, 195689, 234827, 281792, 338151, 405781, 486937, 584325, 701190, 841428, 1009714, 1211657, 1453988, 1744786, 2093744, 2512492, 3014991, 3617989, 4341587, 5209905, 6251886, 7502263, 9002716, 10803259, 12963911, 15556694, 18668032, 22401639, 26881967, 32258360, 38710033, 46452039, 55742447, 66890937, 80269124, 96322949, 115587539, 138705047, 166446056, 199735268, 239682321, 287618785, 345142543, 414171051, 497005262, 596406314, 715687577]);
  G.POW_125_CHARM_INCREMENT = $ta(Float64Array, 51, [81920, 102400, 128000, 160000, 200000, 250000, 312500, 390625, 488281, 610351, 762939, 953674, 1192092, 1490116, 1862645, 2328306, 2910383, 3637978, 4547473, 5684341, 7105427, 8881784, 11102230, 13877787, 17347234, 21684043, 27105054, 33881317, 42351647, 52939559, 66174449, 82718061, 103397576, 129246970, 161558713, 201948391, 252435489, 315544362, 394430452, 493038065, 616297582, 770371977, 962964972, 1203706215, 1504632769, 1880790961, 2350988701, 2938735877, 3673419846, 4591774807, 5739718509]);
}
