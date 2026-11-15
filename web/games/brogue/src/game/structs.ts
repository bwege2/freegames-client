// @ts-nocheck
// The structs and unions of Brogue CE 1.15.1, translated to TypeScript by re/brogue/tools/c2ts (do not edit).
import { $sarr, $arr, $cparr, $cpvals, $umember, $udecode, $uclone } from '../rt/index.ts';

/** struct PauseBehavior: 1 bytes */
export class struct_PauseBehavior {
  interuptForMouseMove: number = 0;
  static $of(...a: any[]): struct_PauseBehavior {
    const o = new struct_PauseBehavior();
    const n = a.length;
    if (n > 0) o.interuptForMouseMove = a[0];
    return o;
  }
  $cp(s: struct_PauseBehavior): this {
    this.interuptForMouseMove = s.interuptForMouseMove;
    return this;
  }
  $clone(): struct_PauseBehavior { return new struct_PauseBehavior().$cp(this); }
  static $size = 1;
  static $layout(): any[] { return [['interuptForMouseMove', 0, ['i', 1, 1]]]; }
}

/** struct SavedDisplayBuffer: 40800 bytes */
export class struct_SavedDisplayBuffer {
  savedScreen: struct_screenDisplayBuffer = new struct_screenDisplayBuffer();
  static $of(...a: any[]): struct_SavedDisplayBuffer {
    const o = new struct_SavedDisplayBuffer();
    const n = a.length;
    if (n > 0) o.savedScreen = a[0];
    return o;
  }
  $cp(s: struct_SavedDisplayBuffer): this {
    this.savedScreen.$cp(s.savedScreen);
    return this;
  }
  $clone(): struct_SavedDisplayBuffer { return new struct_SavedDisplayBuffer().$cp(this); }
  static $size = 40800;
  static $layout(): any[] { return [['savedScreen', 0, ['r', struct_screenDisplayBuffer]]]; }
}

/** struct archivedMessage: 224 bytes */
export class struct_archivedMessage {
  message: Int8Array = new Int8Array(200);
  count: number = 0;
  turn: number = 0;
  flags: number = 0;
  static $of(...a: any[]): struct_archivedMessage {
    const o = new struct_archivedMessage();
    const n = a.length;
    if (n > 0) o.message = a[0];
    if (n > 1) o.count = a[1];
    if (n > 2) o.turn = a[2];
    if (n > 3) o.flags = a[3];
    return o;
  }
  $cp(s: struct_archivedMessage): this {
    this.message.set(s.message);
    this.count = s.count;
    this.turn = s.turn;
    this.flags = s.flags;
    return this;
  }
  $clone(): struct_archivedMessage { return new struct_archivedMessage().$cp(this); }
  static $size = 224;
  static $layout(): any[] { return [['message', 0, ['a', ['i', 1, 1], 200]], ['count', 200, ['i', 1, 0]], ['turn', 208, ['i', 8, 0]], ['flags', 216, ['i', 8, 0]]]; }
}

/** struct autoGenerator: 36 bytes */
export class struct_autoGenerator {
  terrain: number = 0;
  layer: number = 0;
  DFType: number = 0;
  machine: number = 0;
  requiredDungeonFoundationType: number = 0;
  requiredLiquidFoundationType: number = 0;
  minDepth: number = 0;
  maxDepth: number = 0;
  frequency: number = 0;
  minNumberIntercept: number = 0;
  minNumberSlope: number = 0;
  maxNumber: number = 0;
  static $of(...a: any[]): struct_autoGenerator {
    const o = new struct_autoGenerator();
    const n = a.length;
    if (n > 0) o.terrain = a[0];
    if (n > 1) o.layer = a[1];
    if (n > 2) o.DFType = a[2];
    if (n > 3) o.machine = a[3];
    if (n > 4) o.requiredDungeonFoundationType = a[4];
    if (n > 5) o.requiredLiquidFoundationType = a[5];
    if (n > 6) o.minDepth = a[6];
    if (n > 7) o.maxDepth = a[7];
    if (n > 8) o.frequency = a[8];
    if (n > 9) o.minNumberIntercept = a[9];
    if (n > 10) o.minNumberSlope = a[10];
    if (n > 11) o.maxNumber = a[11];
    return o;
  }
  $cp(s: struct_autoGenerator): this {
    this.terrain = s.terrain;
    this.layer = s.layer;
    this.DFType = s.DFType;
    this.machine = s.machine;
    this.requiredDungeonFoundationType = s.requiredDungeonFoundationType;
    this.requiredLiquidFoundationType = s.requiredLiquidFoundationType;
    this.minDepth = s.minDepth;
    this.maxDepth = s.maxDepth;
    this.frequency = s.frequency;
    this.minNumberIntercept = s.minNumberIntercept;
    this.minNumberSlope = s.minNumberSlope;
    this.maxNumber = s.maxNumber;
    return this;
  }
  $clone(): struct_autoGenerator { return new struct_autoGenerator().$cp(this); }
  static $size = 36;
  static $layout(): any[] { return [['terrain', 0, ['i', 4, 1]], ['layer', 4, ['i', 4, 1]], ['DFType', 8, ['i', 4, 1]], ['machine', 12, ['i', 4, 1]], ['requiredDungeonFoundationType', 16, ['i', 4, 1]], ['requiredLiquidFoundationType', 20, ['i', 4, 1]], ['minDepth', 24, ['i', 2, 1]], ['maxDepth', 26, ['i', 2, 1]], ['frequency', 28, ['i', 2, 1]], ['minNumberIntercept', 30, ['i', 2, 1]], ['minNumberSlope', 32, ['i', 2, 1]], ['maxNumber', 34, ['i', 2, 1]]]; }
}

/** struct blueprint: 1152 bytes */
export class struct_blueprint {
  name: any = null;
  depthRange: Int16Array = new Int16Array(2);
  roomSize: Int16Array = new Int16Array(2);
  frequency: number = 0;
  featureCount: number = 0;
  dungeonProfileType: number = 0;
  flags: number = 0;
  feature: any[] = $sarr(struct_machineFeature, 20);
  static $of(...a: any[]): struct_blueprint {
    const o = new struct_blueprint();
    const n = a.length;
    if (n > 0) o.name = a[0];
    if (n > 1) o.depthRange = a[1];
    if (n > 2) o.roomSize = a[2];
    if (n > 3) o.frequency = a[3];
    if (n > 4) o.featureCount = a[4];
    if (n > 5) o.dungeonProfileType = a[5];
    if (n > 6) o.flags = a[6];
    if (n > 7) o.feature = a[7];
    return o;
  }
  $cp(s: struct_blueprint): this {
    this.name = s.name;
    this.depthRange.set(s.depthRange);
    this.roomSize.set(s.roomSize);
    this.frequency = s.frequency;
    this.featureCount = s.featureCount;
    this.dungeonProfileType = s.dungeonProfileType;
    this.flags = s.flags;
    $cparr(this.feature, s.feature);
    return this;
  }
  $clone(): struct_blueprint { return new struct_blueprint().$cp(this); }
  static $size = 1152;
  static $layout(): any[] { return [['name', 0, ['p']], ['depthRange', 8, ['a', ['i', 2, 1], 2]], ['roomSize', 12, ['a', ['i', 2, 1], 2]], ['frequency', 16, ['i', 2, 1]], ['featureCount', 18, ['i', 2, 1]], ['dungeonProfileType', 20, ['i', 2, 1]], ['flags', 24, ['i', 8, 0]], ['feature', 32, ['a', ['r', struct_machineFeature], 20]]]; }
}

/** struct bolt: 424 bytes */
export class struct_bolt {
  name: Int8Array = new Int8Array(79);
  description: Int8Array = new Int8Array(100);
  abilityDescription: Int8Array = new Int8Array(200);
  theChar: number = 0;
  foreColor: struct_color | null = null;
  backColor: struct_color | null = null;
  boltEffect: number = 0;
  magnitude: number = 0;
  pathDF: number = 0;
  targetDF: number = 0;
  forbiddenMonsterFlags: number = 0;
  flags: number = 0;
  static $of(...a: any[]): struct_bolt {
    const o = new struct_bolt();
    const n = a.length;
    if (n > 0) o.name = a[0];
    if (n > 1) o.description = a[1];
    if (n > 2) o.abilityDescription = a[2];
    if (n > 3) o.theChar = a[3];
    if (n > 4) o.foreColor = a[4];
    if (n > 5) o.backColor = a[5];
    if (n > 6) o.boltEffect = a[6];
    if (n > 7) o.magnitude = a[7];
    if (n > 8) o.pathDF = a[8];
    if (n > 9) o.targetDF = a[9];
    if (n > 10) o.forbiddenMonsterFlags = a[10];
    if (n > 11) o.flags = a[11];
    return o;
  }
  $cp(s: struct_bolt): this {
    this.name.set(s.name);
    this.description.set(s.description);
    this.abilityDescription.set(s.abilityDescription);
    this.theChar = s.theChar;
    this.foreColor = s.foreColor;
    this.backColor = s.backColor;
    this.boltEffect = s.boltEffect;
    this.magnitude = s.magnitude;
    this.pathDF = s.pathDF;
    this.targetDF = s.targetDF;
    this.forbiddenMonsterFlags = s.forbiddenMonsterFlags;
    this.flags = s.flags;
    return this;
  }
  $clone(): struct_bolt { return new struct_bolt().$cp(this); }
  static $size = 424;
  static $layout(): any[] { return [['name', 0, ['a', ['i', 1, 1], 79]], ['description', 79, ['a', ['i', 1, 1], 100]], ['abilityDescription', 179, ['a', ['i', 1, 1], 200]], ['theChar', 380, ['i', 4, 1]], ['foreColor', 384, ['p']], ['backColor', 392, ['p']], ['boltEffect', 400, ['i', 2, 1]], ['magnitude', 402, ['i', 2, 1]], ['pathDF', 404, ['i', 2, 1]], ['targetDF', 406, ['i', 2, 1]], ['forbiddenMonsterFlags', 408, ['i', 8, 0]], ['flags', 416, ['i', 8, 0]]]; }
}

/** struct brogueButton: 856 bytes */
export class struct_brogueButton {
  text: Int8Array = new Int8Array(300);
  x: number = 0;
  y: number = 0;
  hotkey: Float64Array = new Float64Array(10);
  buttonColor: struct_color = new struct_color();
  textColor: struct_color = new struct_color();
  hotkeytextColor: struct_color = new struct_color();
  opacity: number = 0;
  symbol: Int32Array = new Int32Array(100);
  flags: number = 0;
  command: number = 0;
  static $of(...a: any[]): struct_brogueButton {
    const o = new struct_brogueButton();
    const n = a.length;
    if (n > 0) o.text = a[0];
    if (n > 1) o.x = a[1];
    if (n > 2) o.y = a[2];
    if (n > 3) o.hotkey = a[3];
    if (n > 4) o.buttonColor = a[4];
    if (n > 5) o.textColor = a[5];
    if (n > 6) o.hotkeytextColor = a[6];
    if (n > 7) o.opacity = a[7];
    if (n > 8) o.symbol = a[8];
    if (n > 9) o.flags = a[9];
    if (n > 10) o.command = a[10];
    return o;
  }
  $cp(s: struct_brogueButton): this {
    this.text.set(s.text);
    this.x = s.x;
    this.y = s.y;
    this.hotkey.set(s.hotkey);
    this.buttonColor.$cp(s.buttonColor);
    this.textColor.$cp(s.textColor);
    this.hotkeytextColor.$cp(s.hotkeytextColor);
    this.opacity = s.opacity;
    this.symbol.set(s.symbol);
    this.flags = s.flags;
    this.command = s.command;
    return this;
  }
  $clone(): struct_brogueButton { return new struct_brogueButton().$cp(this); }
  static $size = 856;
  static $layout(): any[] { return [['text', 0, ['a', ['i', 1, 1], 300]], ['x', 300, ['i', 2, 1]], ['y', 302, ['i', 2, 1]], ['hotkey', 304, ['a', ['i', 8, 1], 10]], ['buttonColor', 384, ['r', struct_color]], ['textColor', 400, ['r', struct_color]], ['hotkeytextColor', 416, ['r', struct_color]], ['opacity', 432, ['i', 2, 1]], ['symbol', 436, ['a', ['i', 4, 1], 100]], ['flags', 840, ['i', 8, 0]], ['command', 848, ['i', 4, 1]]]; }
}

/** struct brogueConsole: 72 bytes */
export class struct_brogueConsole {
  gameLoop: any = null;
  pauseForMilliseconds: any = null;
  nextKeyOrMouseEvent: any = null;
  plotChar: any = null;
  remap: any = null;
  modifierHeld: any = null;
  notifyEvent: any = null;
  takeScreenshot: any = null;
  setGraphicsMode: any = null;
  static $of(...a: any[]): struct_brogueConsole {
    const o = new struct_brogueConsole();
    const n = a.length;
    if (n > 0) o.gameLoop = a[0];
    if (n > 1) o.pauseForMilliseconds = a[1];
    if (n > 2) o.nextKeyOrMouseEvent = a[2];
    if (n > 3) o.plotChar = a[3];
    if (n > 4) o.remap = a[4];
    if (n > 5) o.modifierHeld = a[5];
    if (n > 6) o.notifyEvent = a[6];
    if (n > 7) o.takeScreenshot = a[7];
    if (n > 8) o.setGraphicsMode = a[8];
    return o;
  }
  $cp(s: struct_brogueConsole): this {
    this.gameLoop = s.gameLoop;
    this.pauseForMilliseconds = s.pauseForMilliseconds;
    this.nextKeyOrMouseEvent = s.nextKeyOrMouseEvent;
    this.plotChar = s.plotChar;
    this.remap = s.remap;
    this.modifierHeld = s.modifierHeld;
    this.notifyEvent = s.notifyEvent;
    this.takeScreenshot = s.takeScreenshot;
    this.setGraphicsMode = s.setGraphicsMode;
    return this;
  }
  $clone(): struct_brogueConsole { return new struct_brogueConsole().$cp(this); }
  static $size = 72;
  static $layout(): any[] { return [['gameLoop', 0, ['p']], ['pauseForMilliseconds', 8, ['p']], ['nextKeyOrMouseEvent', 16, ['p']], ['plotChar', 24, ['p']], ['remap', 32, ['p']], ['modifierHeld', 40, ['p']], ['notifyEvent', 48, ['p']], ['takeScreenshot', 56, ['p']], ['setGraphicsMode', 64, ['p']]]; }
}

/** struct brogueScoreEntry: 216 bytes */
export class struct_brogueScoreEntry {
  score: number = 0;
  dateNumber: number = 0;
  dateText: Int8Array = new Int8Array(100);
  description: Int8Array = new Int8Array(100);
  static $of(...a: any[]): struct_brogueScoreEntry {
    const o = new struct_brogueScoreEntry();
    const n = a.length;
    if (n > 0) o.score = a[0];
    if (n > 1) o.dateNumber = a[1];
    if (n > 2) o.dateText = a[2];
    if (n > 3) o.description = a[3];
    return o;
  }
  $cp(s: struct_brogueScoreEntry): this {
    this.score = s.score;
    this.dateNumber = s.dateNumber;
    this.dateText.set(s.dateText);
    this.description.set(s.description);
    return this;
  }
  $clone(): struct_brogueScoreEntry { return new struct_brogueScoreEntry().$cp(this); }
  static $size = 216;
  static $layout(): any[] { return [['score', 0, ['i', 8, 1]], ['dateNumber', 8, ['i', 8, 1]], ['dateText', 16, ['a', ['i', 1, 1], 100]], ['description', 116, ['a', ['i', 1, 1], 100]]]; }
}

/** struct buttonState: 42816 bytes */
export class struct_buttonState {
  buttonFocused: number = 0;
  buttonDepressed: number = 0;
  buttonChosen: number = 0;
  buttonCount: number = 0;
  buttons: any[] = $sarr(struct_brogueButton, 50);
  winX: number = 0;
  winY: number = 0;
  winWidth: number = 0;
  winHeight: number = 0;
  static $of(...a: any[]): struct_buttonState {
    const o = new struct_buttonState();
    const n = a.length;
    if (n > 0) o.buttonFocused = a[0];
    if (n > 1) o.buttonDepressed = a[1];
    if (n > 2) o.buttonChosen = a[2];
    if (n > 3) o.buttonCount = a[3];
    if (n > 4) o.buttons = a[4];
    if (n > 5) o.winX = a[5];
    if (n > 6) o.winY = a[6];
    if (n > 7) o.winWidth = a[7];
    if (n > 8) o.winHeight = a[8];
    return o;
  }
  $cp(s: struct_buttonState): this {
    this.buttonFocused = s.buttonFocused;
    this.buttonDepressed = s.buttonDepressed;
    this.buttonChosen = s.buttonChosen;
    this.buttonCount = s.buttonCount;
    $cparr(this.buttons, s.buttons);
    this.winX = s.winX;
    this.winY = s.winY;
    this.winWidth = s.winWidth;
    this.winHeight = s.winHeight;
    return this;
  }
  $clone(): struct_buttonState { return new struct_buttonState().$cp(this); }
  static $size = 42816;
  static $layout(): any[] { return [['buttonFocused', 0, ['i', 2, 1]], ['buttonDepressed', 2, ['i', 2, 1]], ['buttonChosen', 4, ['i', 2, 1]], ['buttonCount', 6, ['i', 2, 1]], ['buttons', 8, ['a', ['r', struct_brogueButton], 50]], ['winX', 42808, ['i', 2, 1]], ['winY', 42810, ['i', 2, 1]], ['winWidth', 42812, ['i', 2, 1]], ['winHeight', 42814, ['i', 2, 1]]]; }
}

/** struct cellDisplayBuffer: 12 bytes */
export class struct_cellDisplayBuffer {
  character: number = 0;
  foreColorComponents: Int8Array = new Int8Array(3);
  backColorComponents: Int8Array = new Int8Array(3);
  opacity: number = 0;
  static $of(...a: any[]): struct_cellDisplayBuffer {
    const o = new struct_cellDisplayBuffer();
    const n = a.length;
    if (n > 0) o.character = a[0];
    if (n > 1) o.foreColorComponents = a[1];
    if (n > 2) o.backColorComponents = a[2];
    if (n > 3) o.opacity = a[3];
    return o;
  }
  $cp(s: struct_cellDisplayBuffer): this {
    this.character = s.character;
    this.foreColorComponents.set(s.foreColorComponents);
    this.backColorComponents.set(s.backColorComponents);
    this.opacity = s.opacity;
    return this;
  }
  $clone(): struct_cellDisplayBuffer { return new struct_cellDisplayBuffer().$cp(this); }
  static $size = 12;
  static $layout(): any[] { return [['character', 0, ['i', 4, 1]], ['foreColorComponents', 4, ['a', ['i', 1, 1], 3]], ['backColorComponents', 7, ['a', ['i', 1, 1], 3]], ['opacity', 10, ['i', 1, 1]]]; }
}

/** struct charmEffectTableEntry: 40 bytes */
export class struct_charmEffectTableEntry {
  kind: number = 0;
  effectDurationBase: number = 0;
  effectDurationIncrement: any = null;
  rechargeDelayDuration: number = 0;
  rechargeDelayBase: number = 0;
  rechargeDelayMinTurns: number = 0;
  effectMagnitudeConstant: number = 0;
  effectMagnitudeMultiplier: number = 0;
  static $of(...a: any[]): struct_charmEffectTableEntry {
    const o = new struct_charmEffectTableEntry();
    const n = a.length;
    if (n > 0) o.kind = a[0];
    if (n > 1) o.effectDurationBase = a[1];
    if (n > 2) o.effectDurationIncrement = a[2];
    if (n > 3) o.rechargeDelayDuration = a[3];
    if (n > 4) o.rechargeDelayBase = a[4];
    if (n > 5) o.rechargeDelayMinTurns = a[5];
    if (n > 6) o.effectMagnitudeConstant = a[6];
    if (n > 7) o.effectMagnitudeMultiplier = a[7];
    return o;
  }
  $cp(s: struct_charmEffectTableEntry): this {
    this.kind = s.kind;
    this.effectDurationBase = s.effectDurationBase;
    this.effectDurationIncrement = s.effectDurationIncrement;
    this.rechargeDelayDuration = s.rechargeDelayDuration;
    this.rechargeDelayBase = s.rechargeDelayBase;
    this.rechargeDelayMinTurns = s.rechargeDelayMinTurns;
    this.effectMagnitudeConstant = s.effectMagnitudeConstant;
    this.effectMagnitudeMultiplier = s.effectMagnitudeMultiplier;
    return this;
  }
  $clone(): struct_charmEffectTableEntry { return new struct_charmEffectTableEntry().$cp(this); }
  static $size = 40;
  static $layout(): any[] { return [['kind', 0, ['i', 2, 1]], ['effectDurationBase', 4, ['i', 4, 1]], ['effectDurationIncrement', 8, ['p']], ['rechargeDelayDuration', 16, ['i', 4, 1]], ['rechargeDelayBase', 20, ['i', 4, 1]], ['rechargeDelayMinTurns', 24, ['i', 4, 1]], ['effectMagnitudeConstant', 28, ['i', 4, 1]], ['effectMagnitudeMultiplier', 32, ['i', 4, 1]]]; }
}

/** struct color: 16 bytes */
export class struct_color {
  red: number = 0;
  green: number = 0;
  blue: number = 0;
  redRand: number = 0;
  greenRand: number = 0;
  blueRand: number = 0;
  rand: number = 0;
  colorDances: number = 0;
  static $of(...a: any[]): struct_color {
    const o = new struct_color();
    const n = a.length;
    if (n > 0) o.red = a[0];
    if (n > 1) o.green = a[1];
    if (n > 2) o.blue = a[2];
    if (n > 3) o.redRand = a[3];
    if (n > 4) o.greenRand = a[4];
    if (n > 5) o.blueRand = a[5];
    if (n > 6) o.rand = a[6];
    if (n > 7) o.colorDances = a[7];
    return o;
  }
  $cp(s: struct_color): this {
    this.red = s.red;
    this.green = s.green;
    this.blue = s.blue;
    this.redRand = s.redRand;
    this.greenRand = s.greenRand;
    this.blueRand = s.blueRand;
    this.rand = s.rand;
    this.colorDances = s.colorDances;
    return this;
  }
  $clone(): struct_color { return new struct_color().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['red', 0, ['i', 2, 1]], ['green', 2, ['i', 2, 1]], ['blue', 4, ['i', 2, 1]], ['redRand', 6, ['i', 2, 1]], ['greenRand', 8, ['i', 2, 1]], ['blueRand', 10, ['i', 2, 1]], ['rand', 12, ['i', 2, 1]], ['colorDances', 14, ['i', 1, 1]]]; }
}

/** struct creature: 600 bytes */
export class struct_creature {
  info: struct_creatureType = new struct_creatureType();
  loc: struct_pos = new struct_pos();
  depth: number = 0;
  currentHP: number = 0;
  turnsUntilRegen: number = 0;
  regenPerTurn: number = 0;
  weaknessAmount: number = 0;
  poisonAmount: number = 0;
  creatureState: number = 0;
  creatureMode: number = 0;
  mutationIndex: number = 0;
  wasNegated: number = 0;
  targetWaypointIndex: number = 0;
  waypointAlreadyVisited: Int8Array = new Int8Array(40);
  lastSeenPlayerAt: struct_pos = new struct_pos();
  targetCorpseLoc: struct_pos = new struct_pos();
  targetCorpseName: Int8Array = new Int8Array(30);
  absorptionFlags: number = 0;
  absorbBehavior: number = 0;
  absorptionBolt: number = 0;
  corpseAbsorptionCounter: number = 0;
  mapToMe: any = null;
  safetyMap: any = null;
  ticksUntilTurn: number = 0;
  movementSpeed: number = 0;
  attackSpeed: number = 0;
  previousHealthPoints: number = 0;
  turnsSpentStationary: number = 0;
  flashStrength: number = 0;
  flashColor: struct_color = new struct_color();
  status: Int16Array = new Int16Array(27);
  maxStatus: Int16Array = new Int16Array(27);
  bookkeepingFlags: number = 0;
  spawnDepth: number = 0;
  machineHome: number = 0;
  xpxp: number = 0;
  newPowerCount: number = 0;
  totalPowerCount: number = 0;
  leader: struct_creature | null = null;
  carriedMonster: struct_creature | null = null;
  carriedItem: struct_item | null = null;
  static $of(...a: any[]): struct_creature {
    const o = new struct_creature();
    const n = a.length;
    if (n > 0) o.info = a[0];
    if (n > 1) o.loc = a[1];
    if (n > 2) o.depth = a[2];
    if (n > 3) o.currentHP = a[3];
    if (n > 4) o.turnsUntilRegen = a[4];
    if (n > 5) o.regenPerTurn = a[5];
    if (n > 6) o.weaknessAmount = a[6];
    if (n > 7) o.poisonAmount = a[7];
    if (n > 8) o.creatureState = a[8];
    if (n > 9) o.creatureMode = a[9];
    if (n > 10) o.mutationIndex = a[10];
    if (n > 11) o.wasNegated = a[11];
    if (n > 12) o.targetWaypointIndex = a[12];
    if (n > 13) o.waypointAlreadyVisited = a[13];
    if (n > 14) o.lastSeenPlayerAt = a[14];
    if (n > 15) o.targetCorpseLoc = a[15];
    if (n > 16) o.targetCorpseName = a[16];
    if (n > 17) o.absorptionFlags = a[17];
    if (n > 18) o.absorbBehavior = a[18];
    if (n > 19) o.absorptionBolt = a[19];
    if (n > 20) o.corpseAbsorptionCounter = a[20];
    if (n > 21) o.mapToMe = a[21];
    if (n > 22) o.safetyMap = a[22];
    if (n > 23) o.ticksUntilTurn = a[23];
    if (n > 24) o.movementSpeed = a[24];
    if (n > 25) o.attackSpeed = a[25];
    if (n > 26) o.previousHealthPoints = a[26];
    if (n > 27) o.turnsSpentStationary = a[27];
    if (n > 28) o.flashStrength = a[28];
    if (n > 29) o.flashColor = a[29];
    if (n > 30) o.status = a[30];
    if (n > 31) o.maxStatus = a[31];
    if (n > 32) o.bookkeepingFlags = a[32];
    if (n > 33) o.spawnDepth = a[33];
    if (n > 34) o.machineHome = a[34];
    if (n > 35) o.xpxp = a[35];
    if (n > 36) o.newPowerCount = a[36];
    if (n > 37) o.totalPowerCount = a[37];
    if (n > 38) o.leader = a[38];
    if (n > 39) o.carriedMonster = a[39];
    if (n > 40) o.carriedItem = a[40];
    return o;
  }
  $cp(s: struct_creature): this {
    this.info.$cp(s.info);
    this.loc.$cp(s.loc);
    this.depth = s.depth;
    this.currentHP = s.currentHP;
    this.turnsUntilRegen = s.turnsUntilRegen;
    this.regenPerTurn = s.regenPerTurn;
    this.weaknessAmount = s.weaknessAmount;
    this.poisonAmount = s.poisonAmount;
    this.creatureState = s.creatureState;
    this.creatureMode = s.creatureMode;
    this.mutationIndex = s.mutationIndex;
    this.wasNegated = s.wasNegated;
    this.targetWaypointIndex = s.targetWaypointIndex;
    this.waypointAlreadyVisited.set(s.waypointAlreadyVisited);
    this.lastSeenPlayerAt.$cp(s.lastSeenPlayerAt);
    this.targetCorpseLoc.$cp(s.targetCorpseLoc);
    this.targetCorpseName.set(s.targetCorpseName);
    this.absorptionFlags = s.absorptionFlags;
    this.absorbBehavior = s.absorbBehavior;
    this.absorptionBolt = s.absorptionBolt;
    this.corpseAbsorptionCounter = s.corpseAbsorptionCounter;
    this.mapToMe = s.mapToMe;
    this.safetyMap = s.safetyMap;
    this.ticksUntilTurn = s.ticksUntilTurn;
    this.movementSpeed = s.movementSpeed;
    this.attackSpeed = s.attackSpeed;
    this.previousHealthPoints = s.previousHealthPoints;
    this.turnsSpentStationary = s.turnsSpentStationary;
    this.flashStrength = s.flashStrength;
    this.flashColor.$cp(s.flashColor);
    this.status.set(s.status);
    this.maxStatus.set(s.maxStatus);
    this.bookkeepingFlags = s.bookkeepingFlags;
    this.spawnDepth = s.spawnDepth;
    this.machineHome = s.machineHome;
    this.xpxp = s.xpxp;
    this.newPowerCount = s.newPowerCount;
    this.totalPowerCount = s.totalPowerCount;
    this.leader = s.leader;
    this.carriedMonster = s.carriedMonster;
    this.carriedItem = s.carriedItem;
    return this;
  }
  $clone(): struct_creature { return new struct_creature().$cp(this); }
  static $size = 600;
  static $layout(): any[] { return [['info', 0, ['r', struct_creatureType]], ['loc', 264, ['r', struct_pos]], ['depth', 268, ['i', 2, 1]], ['currentHP', 270, ['i', 2, 1]], ['turnsUntilRegen', 272, ['i', 8, 1]], ['regenPerTurn', 280, ['i', 2, 1]], ['weaknessAmount', 282, ['i', 2, 1]], ['poisonAmount', 284, ['i', 2, 1]], ['creatureState', 288, ['i', 4, 1]], ['creatureMode', 292, ['i', 4, 1]], ['mutationIndex', 296, ['i', 2, 1]], ['wasNegated', 298, ['i', 1, 1]], ['targetWaypointIndex', 300, ['i', 2, 1]], ['waypointAlreadyVisited', 302, ['a', ['i', 1, 1], 40]], ['lastSeenPlayerAt', 342, ['r', struct_pos]], ['targetCorpseLoc', 346, ['r', struct_pos]], ['targetCorpseName', 350, ['a', ['i', 1, 1], 30]], ['absorptionFlags', 384, ['i', 8, 0]], ['absorbBehavior', 392, ['i', 1, 1]], ['absorptionBolt', 394, ['i', 2, 1]], ['corpseAbsorptionCounter', 396, ['i', 2, 1]], ['mapToMe', 400, ['p']], ['safetyMap', 408, ['p']], ['ticksUntilTurn', 416, ['i', 2, 1]], ['movementSpeed', 418, ['i', 2, 1]], ['attackSpeed', 420, ['i', 2, 1]], ['previousHealthPoints', 422, ['i', 2, 1]], ['turnsSpentStationary', 424, ['i', 2, 1]], ['flashStrength', 426, ['i', 2, 1]], ['flashColor', 428, ['r', struct_color]], ['status', 444, ['a', ['i', 2, 1], 27]], ['maxStatus', 498, ['a', ['i', 2, 1], 27]], ['bookkeepingFlags', 552, ['i', 8, 0]], ['spawnDepth', 560, ['i', 2, 1]], ['machineHome', 562, ['i', 2, 1]], ['xpxp', 564, ['i', 2, 1]], ['newPowerCount', 566, ['i', 2, 1]], ['totalPowerCount', 568, ['i', 2, 1]], ['leader', 576, ['p']], ['carriedMonster', 584, ['p']], ['carriedItem', 592, ['p']]]; }
}

/** struct creatureIterator: 16 bytes */
export class struct_creatureIterator {
  list: struct_creatureList | null = null;
  next: struct_creatureListNode | null = null;
  static $of(...a: any[]): struct_creatureIterator {
    const o = new struct_creatureIterator();
    const n = a.length;
    if (n > 0) o.list = a[0];
    if (n > 1) o.next = a[1];
    return o;
  }
  $cp(s: struct_creatureIterator): this {
    this.list = s.list;
    this.next = s.next;
    return this;
  }
  $clone(): struct_creatureIterator { return new struct_creatureIterator().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['list', 0, ['p']], ['next', 8, ['p']]]; }
}

/** struct creatureList: 8 bytes */
export class struct_creatureList {
  head: struct_creatureListNode | null = null;
  static $of(...a: any[]): struct_creatureList {
    const o = new struct_creatureList();
    const n = a.length;
    if (n > 0) o.head = a[0];
    return o;
  }
  $cp(s: struct_creatureList): this {
    this.head = s.head;
    return this;
  }
  $clone(): struct_creatureList { return new struct_creatureList().$cp(this); }
  static $size = 8;
  static $layout(): any[] { return [['head', 0, ['p']]]; }
}

/** struct creatureListNode: 16 bytes */
export class struct_creatureListNode {
  creature: struct_creature | null = null;
  nextCreature: struct_creatureListNode | null = null;
  static $of(...a: any[]): struct_creatureListNode {
    const o = new struct_creatureListNode();
    const n = a.length;
    if (n > 0) o.creature = a[0];
    if (n > 1) o.nextCreature = a[1];
    return o;
  }
  $cp(s: struct_creatureListNode): this {
    this.creature = s.creature;
    this.nextCreature = s.nextCreature;
    return this;
  }
  $clone(): struct_creatureListNode { return new struct_creatureListNode().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['creature', 0, ['p']], ['nextCreature', 8, ['p']]]; }
}

/** struct creatureType: 264 bytes */
export class struct_creatureType {
  monsterID: number = 0;
  monsterName: Int8Array = new Int8Array(100);
  displayChar: number = 0;
  foreColor: struct_color | null = null;
  maxHP: number = 0;
  defense: number = 0;
  accuracy: number = 0;
  damage: struct_randomRange = new struct_randomRange();
  turnsBetweenRegen: number = 0;
  movementSpeed: number = 0;
  attackSpeed: number = 0;
  bloodType: number = 0;
  intrinsicLightType: number = 0;
  isLarge: number = 0;
  DFChance: number = 0;
  DFType: number = 0;
  bolts: Int32Array = new Int32Array(20);
  flags: number = 0;
  abilityFlags: number = 0;
  static $of(...a: any[]): struct_creatureType {
    const o = new struct_creatureType();
    const n = a.length;
    if (n > 0) o.monsterID = a[0];
    if (n > 1) o.monsterName = a[1];
    if (n > 2) o.displayChar = a[2];
    if (n > 3) o.foreColor = a[3];
    if (n > 4) o.maxHP = a[4];
    if (n > 5) o.defense = a[5];
    if (n > 6) o.accuracy = a[6];
    if (n > 7) o.damage = a[7];
    if (n > 8) o.turnsBetweenRegen = a[8];
    if (n > 9) o.movementSpeed = a[9];
    if (n > 10) o.attackSpeed = a[10];
    if (n > 11) o.bloodType = a[11];
    if (n > 12) o.intrinsicLightType = a[12];
    if (n > 13) o.isLarge = a[13];
    if (n > 14) o.DFChance = a[14];
    if (n > 15) o.DFType = a[15];
    if (n > 16) o.bolts = a[16];
    if (n > 17) o.flags = a[17];
    if (n > 18) o.abilityFlags = a[18];
    return o;
  }
  $cp(s: struct_creatureType): this {
    this.monsterID = s.monsterID;
    this.monsterName.set(s.monsterName);
    this.displayChar = s.displayChar;
    this.foreColor = s.foreColor;
    this.maxHP = s.maxHP;
    this.defense = s.defense;
    this.accuracy = s.accuracy;
    this.damage.$cp(s.damage);
    this.turnsBetweenRegen = s.turnsBetweenRegen;
    this.movementSpeed = s.movementSpeed;
    this.attackSpeed = s.attackSpeed;
    this.bloodType = s.bloodType;
    this.intrinsicLightType = s.intrinsicLightType;
    this.isLarge = s.isLarge;
    this.DFChance = s.DFChance;
    this.DFType = s.DFType;
    this.bolts.set(s.bolts);
    this.flags = s.flags;
    this.abilityFlags = s.abilityFlags;
    return this;
  }
  $clone(): struct_creatureType { return new struct_creatureType().$cp(this); }
  static $size = 264;
  static $layout(): any[] { return [['monsterID', 0, ['i', 4, 1]], ['monsterName', 4, ['a', ['i', 1, 1], 100]], ['displayChar', 104, ['i', 4, 1]], ['foreColor', 112, ['p']], ['maxHP', 120, ['i', 2, 1]], ['defense', 122, ['i', 2, 1]], ['accuracy', 124, ['i', 2, 1]], ['damage', 126, ['r', struct_randomRange]], ['turnsBetweenRegen', 136, ['i', 8, 1]], ['movementSpeed', 144, ['i', 2, 1]], ['attackSpeed', 146, ['i', 2, 1]], ['bloodType', 148, ['i', 4, 1]], ['intrinsicLightType', 152, ['i', 4, 1]], ['isLarge', 156, ['i', 1, 1]], ['DFChance', 158, ['i', 2, 1]], ['DFType', 160, ['i', 4, 1]], ['bolts', 164, ['a', ['i', 4, 1], 20]], ['flags', 248, ['i', 8, 0]], ['abilityFlags', 256, ['i', 8, 0]]]; }
}

/** struct dungeonFeature: 136 bytes */
export class struct_dungeonFeature {
  tile: number = 0;
  layer: number = 0;
  startProbability: number = 0;
  probabilityDecrement: number = 0;
  flags: number = 0;
  description: Int8Array = new Int8Array(79);
  lightFlare: number = 0;
  flashColor: struct_color | null = null;
  effectRadius: number = 0;
  propagationTerrain: number = 0;
  subsequentDF: number = 0;
  messageDisplayed: number = 0;
  static $of(...a: any[]): struct_dungeonFeature {
    const o = new struct_dungeonFeature();
    const n = a.length;
    if (n > 0) o.tile = a[0];
    if (n > 1) o.layer = a[1];
    if (n > 2) o.startProbability = a[2];
    if (n > 3) o.probabilityDecrement = a[3];
    if (n > 4) o.flags = a[4];
    if (n > 5) o.description = a[5];
    if (n > 6) o.lightFlare = a[6];
    if (n > 7) o.flashColor = a[7];
    if (n > 8) o.effectRadius = a[8];
    if (n > 9) o.propagationTerrain = a[9];
    if (n > 10) o.subsequentDF = a[10];
    if (n > 11) o.messageDisplayed = a[11];
    return o;
  }
  $cp(s: struct_dungeonFeature): this {
    this.tile = s.tile;
    this.layer = s.layer;
    this.startProbability = s.startProbability;
    this.probabilityDecrement = s.probabilityDecrement;
    this.flags = s.flags;
    this.description.set(s.description);
    this.lightFlare = s.lightFlare;
    this.flashColor = s.flashColor;
    this.effectRadius = s.effectRadius;
    this.propagationTerrain = s.propagationTerrain;
    this.subsequentDF = s.subsequentDF;
    this.messageDisplayed = s.messageDisplayed;
    return this;
  }
  $clone(): struct_dungeonFeature { return new struct_dungeonFeature().$cp(this); }
  static $size = 136;
  static $layout(): any[] { return [['tile', 0, ['i', 4, 1]], ['layer', 4, ['i', 4, 1]], ['startProbability', 8, ['i', 2, 1]], ['probabilityDecrement', 10, ['i', 2, 1]], ['flags', 16, ['i', 8, 0]], ['description', 24, ['a', ['i', 1, 1], 79]], ['lightFlare', 104, ['i', 4, 1]], ['flashColor', 112, ['p']], ['effectRadius', 120, ['i', 2, 1]], ['propagationTerrain', 124, ['i', 4, 1]], ['subsequentDF', 128, ['i', 4, 1]], ['messageDisplayed', 132, ['i', 1, 1]]]; }
}

/** struct dungeonProfile: 18 bytes */
export class struct_dungeonProfile {
  roomFrequencies: Int16Array = new Int16Array(8);
  corridorChance: number = 0;
  static $of(...a: any[]): struct_dungeonProfile {
    const o = new struct_dungeonProfile();
    const n = a.length;
    if (n > 0) o.roomFrequencies = a[0];
    if (n > 1) o.corridorChance = a[1];
    return o;
  }
  $cp(s: struct_dungeonProfile): this {
    this.roomFrequencies.set(s.roomFrequencies);
    this.corridorChance = s.corridorChance;
    return this;
  }
  $clone(): struct_dungeonProfile { return new struct_dungeonProfile().$cp(this); }
  static $size = 18;
  static $layout(): any[] { return [['roomFrequencies', 0, ['a', ['i', 2, 1], 8]], ['corridorChance', 16, ['i', 2, 1]]]; }
}

/** struct feat: 217 bytes */
export class struct_feat {
  name: Int8Array = new Int8Array(16);
  description: Int8Array = new Int8Array(200);
  initialValue: number = 0;
  static $of(...a: any[]): struct_feat {
    const o = new struct_feat();
    const n = a.length;
    if (n > 0) o.name = a[0];
    if (n > 1) o.description = a[1];
    if (n > 2) o.initialValue = a[2];
    return o;
  }
  $cp(s: struct_feat): this {
    this.name.set(s.name);
    this.description.set(s.description);
    this.initialValue = s.initialValue;
    return this;
  }
  $clone(): struct_feat { return new struct_feat().$cp(this); }
  static $size = 217;
  static $layout(): any[] { return [['name', 0, ['a', ['i', 1, 1], 16]], ['description', 16, ['a', ['i', 1, 1], 200]], ['initialValue', 216, ['i', 1, 1]]]; }
}

/** struct fileEntry: 64 bytes */
export class struct_fileEntry {
  path: any = null;
  date: struct_tm = new struct_tm();
  static $of(...a: any[]): struct_fileEntry {
    const o = new struct_fileEntry();
    const n = a.length;
    if (n > 0) o.path = a[0];
    if (n > 1) o.date = a[1];
    return o;
  }
  $cp(s: struct_fileEntry): this {
    this.path = s.path;
    this.date.$cp(s.date);
    return this;
  }
  $clone(): struct_fileEntry { return new struct_fileEntry().$cp(this); }
  static $size = 64;
  static $layout(): any[] { return [['path', 0, ['p']], ['date', 8, ['r', struct_tm]]]; }
}

/** struct flare: 32 bytes */
export class struct_flare {
  light: struct_lightSource | null = null;
  coeffChangeAmount: number = 0;
  coeffLimit: number = 0;
  loc: struct_pos = new struct_pos();
  coeff: number = 0;
  turnNumber: number = 0;
  static $of(...a: any[]): struct_flare {
    const o = new struct_flare();
    const n = a.length;
    if (n > 0) o.light = a[0];
    if (n > 1) o.coeffChangeAmount = a[1];
    if (n > 2) o.coeffLimit = a[2];
    if (n > 3) o.loc = a[3];
    if (n > 4) o.coeff = a[4];
    if (n > 5) o.turnNumber = a[5];
    return o;
  }
  $cp(s: struct_flare): this {
    this.light = s.light;
    this.coeffChangeAmount = s.coeffChangeAmount;
    this.coeffLimit = s.coeffLimit;
    this.loc.$cp(s.loc);
    this.coeff = s.coeff;
    this.turnNumber = s.turnNumber;
    return this;
  }
  $clone(): struct_flare { return new struct_flare().$cp(this); }
  static $size = 32;
  static $layout(): any[] { return [['light', 0, ['p']], ['coeffChangeAmount', 8, ['i', 2, 1]], ['coeffLimit', 10, ['i', 2, 1]], ['loc', 12, ['r', struct_pos]], ['coeff', 16, ['i', 8, 1]], ['turnNumber', 24, ['i', 8, 0]]]; }
}

/** struct floorTileType: 264 bytes */
export class struct_floorTileType {
  displayChar: number = 0;
  foreColor: struct_color | null = null;
  backColor: struct_color | null = null;
  drawPriority: number = 0;
  chanceToIgnite: number = 0;
  fireType: number = 0;
  discoverType: number = 0;
  promoteType: number = 0;
  promoteChance: number = 0;
  glowLight: number = 0;
  flags: number = 0;
  mechFlags: number = 0;
  description: Int8Array = new Int8Array(100);
  flavorText: Int8Array = new Int8Array(100);
  static $of(...a: any[]): struct_floorTileType {
    const o = new struct_floorTileType();
    const n = a.length;
    if (n > 0) o.displayChar = a[0];
    if (n > 1) o.foreColor = a[1];
    if (n > 2) o.backColor = a[2];
    if (n > 3) o.drawPriority = a[3];
    if (n > 4) o.chanceToIgnite = a[4];
    if (n > 5) o.fireType = a[5];
    if (n > 6) o.discoverType = a[6];
    if (n > 7) o.promoteType = a[7];
    if (n > 8) o.promoteChance = a[8];
    if (n > 9) o.glowLight = a[9];
    if (n > 10) o.flags = a[10];
    if (n > 11) o.mechFlags = a[11];
    if (n > 12) o.description = a[12];
    if (n > 13) o.flavorText = a[13];
    return o;
  }
  $cp(s: struct_floorTileType): this {
    this.displayChar = s.displayChar;
    this.foreColor = s.foreColor;
    this.backColor = s.backColor;
    this.drawPriority = s.drawPriority;
    this.chanceToIgnite = s.chanceToIgnite;
    this.fireType = s.fireType;
    this.discoverType = s.discoverType;
    this.promoteType = s.promoteType;
    this.promoteChance = s.promoteChance;
    this.glowLight = s.glowLight;
    this.flags = s.flags;
    this.mechFlags = s.mechFlags;
    this.description.set(s.description);
    this.flavorText.set(s.flavorText);
    return this;
  }
  $clone(): struct_floorTileType { return new struct_floorTileType().$cp(this); }
  static $size = 264;
  static $layout(): any[] { return [['displayChar', 0, ['i', 4, 1]], ['foreColor', 8, ['p']], ['backColor', 16, ['p']], ['drawPriority', 24, ['i', 2, 1]], ['chanceToIgnite', 26, ['i', 1, 1]], ['fireType', 28, ['i', 4, 1]], ['discoverType', 32, ['i', 4, 1]], ['promoteType', 36, ['i', 4, 1]], ['promoteChance', 40, ['i', 2, 1]], ['glowLight', 42, ['i', 2, 1]], ['flags', 48, ['i', 8, 0]], ['mechFlags', 56, ['i', 8, 0]], ['description', 64, ['a', ['i', 1, 1], 100]], ['flavorText', 164, ['a', ['i', 1, 1], 100]]]; }
}

/** struct gameConstants: 216 bytes */
export class struct_gameConstants {
  majorVersion: number = 0;
  minorVersion: number = 0;
  patchVersion: number = 0;
  variantName: any = null;
  versionString: any = null;
  dungeonVersionString: any = null;
  patchVersionPattern: any = null;
  recordingVersionString: any = null;
  deepestLevel: number = 0;
  amuletLevel: number = 0;
  depthAccelerator: number = 0;
  minimumAltarLevel: number = 0;
  minimumLavaLevel: number = 0;
  minimumBrimstoneLevel: number = 0;
  mutationsOccurAboveLevel: number = 0;
  monsterOutOfDepthChance: number = 0;
  extraItemsPerLevel: number = 0;
  goldAdjustmentStartDepth: number = 0;
  machinesPerLevelSuppressionMultiplier: number = 0;
  machinesPerLevelSuppressionOffset: number = 0;
  machinesPerLevelIncreaseFactor: number = 0;
  maxLevelForBonusMachines: number = 0;
  deepestLevelForMachines: number = 0;
  playerTransferenceRatio: number = 0;
  onHitHallucinateDuration: number = 0;
  onHitWeakenDuration: number = 0;
  onHitMercyHealPercent: number = 0;
  fallDamageMin: number = 0;
  fallDamageMax: number = 0;
  weaponKillsToAutoID: number = 0;
  armorDelayToAutoID: number = 0;
  ringDelayToAutoID: number = 0;
  numberAutogenerators: number = 0;
  numberBoltKinds: number = 0;
  numberBlueprints: number = 0;
  numberHordes: number = 0;
  numberMeteredItems: number = 0;
  numberCharmKinds: number = 0;
  numberPotionKinds: number = 0;
  numberGoodPotionKinds: number = 0;
  numberScrollKinds: number = 0;
  numberGoodScrollKinds: number = 0;
  numberWandKinds: number = 0;
  numberGoodWandKinds: number = 0;
  numberFeats: number = 0;
  companionFeatRequiredXP: number = 0;
  mainMenuTitleHeight: number = 0;
  mainMenuTitleWidth: number = 0;
  static $of(...a: any[]): struct_gameConstants {
    const o = new struct_gameConstants();
    const n = a.length;
    if (n > 0) o.majorVersion = a[0];
    if (n > 1) o.minorVersion = a[1];
    if (n > 2) o.patchVersion = a[2];
    if (n > 3) o.variantName = a[3];
    if (n > 4) o.versionString = a[4];
    if (n > 5) o.dungeonVersionString = a[5];
    if (n > 6) o.patchVersionPattern = a[6];
    if (n > 7) o.recordingVersionString = a[7];
    if (n > 8) o.deepestLevel = a[8];
    if (n > 9) o.amuletLevel = a[9];
    if (n > 10) o.depthAccelerator = a[10];
    if (n > 11) o.minimumAltarLevel = a[11];
    if (n > 12) o.minimumLavaLevel = a[12];
    if (n > 13) o.minimumBrimstoneLevel = a[13];
    if (n > 14) o.mutationsOccurAboveLevel = a[14];
    if (n > 15) o.monsterOutOfDepthChance = a[15];
    if (n > 16) o.extraItemsPerLevel = a[16];
    if (n > 17) o.goldAdjustmentStartDepth = a[17];
    if (n > 18) o.machinesPerLevelSuppressionMultiplier = a[18];
    if (n > 19) o.machinesPerLevelSuppressionOffset = a[19];
    if (n > 20) o.machinesPerLevelIncreaseFactor = a[20];
    if (n > 21) o.maxLevelForBonusMachines = a[21];
    if (n > 22) o.deepestLevelForMachines = a[22];
    if (n > 23) o.playerTransferenceRatio = a[23];
    if (n > 24) o.onHitHallucinateDuration = a[24];
    if (n > 25) o.onHitWeakenDuration = a[25];
    if (n > 26) o.onHitMercyHealPercent = a[26];
    if (n > 27) o.fallDamageMin = a[27];
    if (n > 28) o.fallDamageMax = a[28];
    if (n > 29) o.weaponKillsToAutoID = a[29];
    if (n > 30) o.armorDelayToAutoID = a[30];
    if (n > 31) o.ringDelayToAutoID = a[31];
    if (n > 32) o.numberAutogenerators = a[32];
    if (n > 33) o.numberBoltKinds = a[33];
    if (n > 34) o.numberBlueprints = a[34];
    if (n > 35) o.numberHordes = a[35];
    if (n > 36) o.numberMeteredItems = a[36];
    if (n > 37) o.numberCharmKinds = a[37];
    if (n > 38) o.numberPotionKinds = a[38];
    if (n > 39) o.numberGoodPotionKinds = a[39];
    if (n > 40) o.numberScrollKinds = a[40];
    if (n > 41) o.numberGoodScrollKinds = a[41];
    if (n > 42) o.numberWandKinds = a[42];
    if (n > 43) o.numberGoodWandKinds = a[43];
    if (n > 44) o.numberFeats = a[44];
    if (n > 45) o.companionFeatRequiredXP = a[45];
    if (n > 46) o.mainMenuTitleHeight = a[46];
    if (n > 47) o.mainMenuTitleWidth = a[47];
    return o;
  }
  $cp(s: struct_gameConstants): this {
    this.majorVersion = s.majorVersion;
    this.minorVersion = s.minorVersion;
    this.patchVersion = s.patchVersion;
    this.variantName = s.variantName;
    this.versionString = s.versionString;
    this.dungeonVersionString = s.dungeonVersionString;
    this.patchVersionPattern = s.patchVersionPattern;
    this.recordingVersionString = s.recordingVersionString;
    this.deepestLevel = s.deepestLevel;
    this.amuletLevel = s.amuletLevel;
    this.depthAccelerator = s.depthAccelerator;
    this.minimumAltarLevel = s.minimumAltarLevel;
    this.minimumLavaLevel = s.minimumLavaLevel;
    this.minimumBrimstoneLevel = s.minimumBrimstoneLevel;
    this.mutationsOccurAboveLevel = s.mutationsOccurAboveLevel;
    this.monsterOutOfDepthChance = s.monsterOutOfDepthChance;
    this.extraItemsPerLevel = s.extraItemsPerLevel;
    this.goldAdjustmentStartDepth = s.goldAdjustmentStartDepth;
    this.machinesPerLevelSuppressionMultiplier = s.machinesPerLevelSuppressionMultiplier;
    this.machinesPerLevelSuppressionOffset = s.machinesPerLevelSuppressionOffset;
    this.machinesPerLevelIncreaseFactor = s.machinesPerLevelIncreaseFactor;
    this.maxLevelForBonusMachines = s.maxLevelForBonusMachines;
    this.deepestLevelForMachines = s.deepestLevelForMachines;
    this.playerTransferenceRatio = s.playerTransferenceRatio;
    this.onHitHallucinateDuration = s.onHitHallucinateDuration;
    this.onHitWeakenDuration = s.onHitWeakenDuration;
    this.onHitMercyHealPercent = s.onHitMercyHealPercent;
    this.fallDamageMin = s.fallDamageMin;
    this.fallDamageMax = s.fallDamageMax;
    this.weaponKillsToAutoID = s.weaponKillsToAutoID;
    this.armorDelayToAutoID = s.armorDelayToAutoID;
    this.ringDelayToAutoID = s.ringDelayToAutoID;
    this.numberAutogenerators = s.numberAutogenerators;
    this.numberBoltKinds = s.numberBoltKinds;
    this.numberBlueprints = s.numberBlueprints;
    this.numberHordes = s.numberHordes;
    this.numberMeteredItems = s.numberMeteredItems;
    this.numberCharmKinds = s.numberCharmKinds;
    this.numberPotionKinds = s.numberPotionKinds;
    this.numberGoodPotionKinds = s.numberGoodPotionKinds;
    this.numberScrollKinds = s.numberScrollKinds;
    this.numberGoodScrollKinds = s.numberGoodScrollKinds;
    this.numberWandKinds = s.numberWandKinds;
    this.numberGoodWandKinds = s.numberGoodWandKinds;
    this.numberFeats = s.numberFeats;
    this.companionFeatRequiredXP = s.companionFeatRequiredXP;
    this.mainMenuTitleHeight = s.mainMenuTitleHeight;
    this.mainMenuTitleWidth = s.mainMenuTitleWidth;
    return this;
  }
  $clone(): struct_gameConstants { return new struct_gameConstants().$cp(this); }
  static $size = 216;
  static $layout(): any[] { return [['majorVersion', 0, ['i', 4, 1]], ['minorVersion', 4, ['i', 4, 1]], ['patchVersion', 8, ['i', 4, 1]], ['variantName', 16, ['p']], ['versionString', 24, ['p']], ['dungeonVersionString', 32, ['p']], ['patchVersionPattern', 40, ['p']], ['recordingVersionString', 48, ['p']], ['deepestLevel', 56, ['i', 4, 1]], ['amuletLevel', 60, ['i', 4, 1]], ['depthAccelerator', 64, ['i', 4, 1]], ['minimumAltarLevel', 68, ['i', 4, 1]], ['minimumLavaLevel', 72, ['i', 4, 1]], ['minimumBrimstoneLevel', 76, ['i', 4, 1]], ['mutationsOccurAboveLevel', 80, ['i', 4, 1]], ['monsterOutOfDepthChance', 84, ['i', 4, 1]], ['extraItemsPerLevel', 88, ['i', 4, 1]], ['goldAdjustmentStartDepth', 92, ['i', 4, 1]], ['machinesPerLevelSuppressionMultiplier', 96, ['i', 4, 1]], ['machinesPerLevelSuppressionOffset', 100, ['i', 4, 1]], ['machinesPerLevelIncreaseFactor', 104, ['i', 4, 1]], ['maxLevelForBonusMachines', 108, ['i', 4, 1]], ['deepestLevelForMachines', 112, ['i', 4, 1]], ['playerTransferenceRatio', 116, ['i', 4, 1]], ['onHitHallucinateDuration', 120, ['i', 4, 1]], ['onHitWeakenDuration', 124, ['i', 4, 1]], ['onHitMercyHealPercent', 128, ['i', 4, 1]], ['fallDamageMin', 132, ['i', 4, 1]], ['fallDamageMax', 136, ['i', 4, 1]], ['weaponKillsToAutoID', 140, ['i', 4, 1]], ['armorDelayToAutoID', 144, ['i', 4, 1]], ['ringDelayToAutoID', 148, ['i', 4, 1]], ['numberAutogenerators', 152, ['i', 4, 1]], ['numberBoltKinds', 156, ['i', 4, 1]], ['numberBlueprints', 160, ['i', 4, 1]], ['numberHordes', 164, ['i', 4, 1]], ['numberMeteredItems', 168, ['i', 4, 1]], ['numberCharmKinds', 172, ['i', 4, 1]], ['numberPotionKinds', 176, ['i', 4, 1]], ['numberGoodPotionKinds', 180, ['i', 4, 1]], ['numberScrollKinds', 184, ['i', 4, 1]], ['numberGoodScrollKinds', 188, ['i', 4, 1]], ['numberWandKinds', 192, ['i', 4, 1]], ['numberGoodWandKinds', 196, ['i', 4, 1]], ['numberFeats', 200, ['i', 4, 1]], ['companionFeatRequiredXP', 204, ['i', 4, 1]], ['mainMenuTitleHeight', 208, ['i', 4, 1]], ['mainMenuTitleWidth', 212, ['i', 4, 1]]]; }
}

/** struct gameStats: 96 bytes */
export class struct_gameStats {
  games: number = 0;
  escaped: number = 0;
  mastered: number = 0;
  won: number = 0;
  winRate: number = 0;
  deepestLevel: number = 0;
  cumulativeLevels: number = 0;
  highestScore: number = 0;
  cumulativeScore: number = 0;
  mostGold: number = 0;
  cumulativeGold: number = 0;
  mostLumenstones: number = 0;
  cumulativeLumenstones: number = 0;
  fewestTurnsWin: number = 0;
  cumulativeTurns: number = 0;
  longestWinStreak: number = 0;
  longestMasteryStreak: number = 0;
  currentWinStreak: number = 0;
  currentMasteryStreak: number = 0;
  static $of(...a: any[]): struct_gameStats {
    const o = new struct_gameStats();
    const n = a.length;
    if (n > 0) o.games = a[0];
    if (n > 1) o.escaped = a[1];
    if (n > 2) o.mastered = a[2];
    if (n > 3) o.won = a[3];
    if (n > 4) o.winRate = a[4];
    if (n > 5) o.deepestLevel = a[5];
    if (n > 6) o.cumulativeLevels = a[6];
    if (n > 7) o.highestScore = a[7];
    if (n > 8) o.cumulativeScore = a[8];
    if (n > 9) o.mostGold = a[9];
    if (n > 10) o.cumulativeGold = a[10];
    if (n > 11) o.mostLumenstones = a[11];
    if (n > 12) o.cumulativeLumenstones = a[12];
    if (n > 13) o.fewestTurnsWin = a[13];
    if (n > 14) o.cumulativeTurns = a[14];
    if (n > 15) o.longestWinStreak = a[15];
    if (n > 16) o.longestMasteryStreak = a[16];
    if (n > 17) o.currentWinStreak = a[17];
    if (n > 18) o.currentMasteryStreak = a[18];
    return o;
  }
  $cp(s: struct_gameStats): this {
    this.games = s.games;
    this.escaped = s.escaped;
    this.mastered = s.mastered;
    this.won = s.won;
    this.winRate = s.winRate;
    this.deepestLevel = s.deepestLevel;
    this.cumulativeLevels = s.cumulativeLevels;
    this.highestScore = s.highestScore;
    this.cumulativeScore = s.cumulativeScore;
    this.mostGold = s.mostGold;
    this.cumulativeGold = s.cumulativeGold;
    this.mostLumenstones = s.mostLumenstones;
    this.cumulativeLumenstones = s.cumulativeLumenstones;
    this.fewestTurnsWin = s.fewestTurnsWin;
    this.cumulativeTurns = s.cumulativeTurns;
    this.longestWinStreak = s.longestWinStreak;
    this.longestMasteryStreak = s.longestMasteryStreak;
    this.currentWinStreak = s.currentWinStreak;
    this.currentMasteryStreak = s.currentMasteryStreak;
    return this;
  }
  $clone(): struct_gameStats { return new struct_gameStats().$cp(this); }
  static $size = 96;
  static $layout(): any[] { return [['games', 0, ['i', 4, 1]], ['escaped', 4, ['i', 4, 1]], ['mastered', 8, ['i', 4, 1]], ['won', 12, ['i', 4, 1]], ['winRate', 16, ['d', 4]], ['deepestLevel', 20, ['i', 4, 1]], ['cumulativeLevels', 24, ['i', 4, 1]], ['highestScore', 28, ['i', 4, 1]], ['cumulativeScore', 32, ['i', 8, 0]], ['mostGold', 40, ['i', 4, 1]], ['cumulativeGold', 48, ['i', 8, 0]], ['mostLumenstones', 56, ['i', 4, 1]], ['cumulativeLumenstones', 60, ['i', 4, 1]], ['fewestTurnsWin', 64, ['i', 4, 1]], ['cumulativeTurns', 72, ['i', 8, 0]], ['longestWinStreak', 80, ['i', 4, 1]], ['longestMasteryStreak', 84, ['i', 4, 1]], ['currentWinStreak', 88, ['i', 4, 1]], ['currentMasteryStreak', 92, ['i', 4, 1]]]; }
}

/** struct hordeType: 76 bytes */
export class struct_hordeType {
  leaderType: number = 0;
  numberOfMemberTypes: number = 0;
  memberType: Int32Array = new Int32Array(5);
  memberCount: any[] = $sarr(struct_randomRange, 5);
  minLevel: number = 0;
  maxLevel: number = 0;
  frequency: number = 0;
  spawnsIn: number = 0;
  machine: number = 0;
  flags: number = 0;
  static $of(...a: any[]): struct_hordeType {
    const o = new struct_hordeType();
    const n = a.length;
    if (n > 0) o.leaderType = a[0];
    if (n > 1) o.numberOfMemberTypes = a[1];
    if (n > 2) o.memberType = a[2];
    if (n > 3) o.memberCount = a[3];
    if (n > 4) o.minLevel = a[4];
    if (n > 5) o.maxLevel = a[5];
    if (n > 6) o.frequency = a[6];
    if (n > 7) o.spawnsIn = a[7];
    if (n > 8) o.machine = a[8];
    if (n > 9) o.flags = a[9];
    return o;
  }
  $cp(s: struct_hordeType): this {
    this.leaderType = s.leaderType;
    this.numberOfMemberTypes = s.numberOfMemberTypes;
    this.memberType.set(s.memberType);
    $cparr(this.memberCount, s.memberCount);
    this.minLevel = s.minLevel;
    this.maxLevel = s.maxLevel;
    this.frequency = s.frequency;
    this.spawnsIn = s.spawnsIn;
    this.machine = s.machine;
    this.flags = s.flags;
    return this;
  }
  $clone(): struct_hordeType { return new struct_hordeType().$cp(this); }
  static $size = 76;
  static $layout(): any[] { return [['leaderType', 0, ['i', 4, 1]], ['numberOfMemberTypes', 4, ['i', 2, 1]], ['memberType', 8, ['a', ['i', 4, 1], 5]], ['memberCount', 28, ['a', ['r', struct_randomRange], 5]], ['minLevel', 58, ['i', 2, 1]], ['maxLevel', 60, ['i', 2, 1]], ['frequency', 62, ['i', 2, 1]], ['spawnsIn', 64, ['i', 4, 1]], ['machine', 68, ['i', 2, 1]], ['flags', 72, ['i', 4, 1]]]; }
}

/** struct item: 352 bytes */
export class struct_item {
  category: number = 0;
  kind: number = 0;
  flags: number = 0;
  damage: struct_randomRange = new struct_randomRange();
  armor: number = 0;
  charges: number = 0;
  enchant1: number = 0;
  enchant2: number = 0;
  timesEnchanted: number = 0;
  vorpalEnemy: number = 0;
  strengthRequired: number = 0;
  quiverNumber: number = 0;
  displayChar: number = 0;
  foreColor: struct_color | null = null;
  inventoryColor: struct_color | null = null;
  quantity: number = 0;
  inventoryLetter: number = 0;
  inscription: Int8Array = new Int8Array(79);
  loc: struct_pos = new struct_pos();
  keyLoc: any[] = $sarr(struct_keyLocationProfile, 20);
  originDepth: number = 0;
  spawnTurnNumber: number = 0;
  lastUsed: Float64Array = new Float64Array(3);
  nextItem: struct_item | null = null;
  static $of(...a: any[]): struct_item {
    const o = new struct_item();
    const n = a.length;
    if (n > 0) o.category = a[0];
    if (n > 1) o.kind = a[1];
    if (n > 2) o.flags = a[2];
    if (n > 3) o.damage = a[3];
    if (n > 4) o.armor = a[4];
    if (n > 5) o.charges = a[5];
    if (n > 6) o.enchant1 = a[6];
    if (n > 7) o.enchant2 = a[7];
    if (n > 8) o.timesEnchanted = a[8];
    if (n > 9) o.vorpalEnemy = a[9];
    if (n > 10) o.strengthRequired = a[10];
    if (n > 11) o.quiverNumber = a[11];
    if (n > 12) o.displayChar = a[12];
    if (n > 13) o.foreColor = a[13];
    if (n > 14) o.inventoryColor = a[14];
    if (n > 15) o.quantity = a[15];
    if (n > 16) o.inventoryLetter = a[16];
    if (n > 17) o.inscription = a[17];
    if (n > 18) o.loc = a[18];
    if (n > 19) o.keyLoc = a[19];
    if (n > 20) o.originDepth = a[20];
    if (n > 21) o.spawnTurnNumber = a[21];
    if (n > 22) o.lastUsed = a[22];
    if (n > 23) o.nextItem = a[23];
    return o;
  }
  $cp(s: struct_item): this {
    this.category = s.category;
    this.kind = s.kind;
    this.flags = s.flags;
    this.damage.$cp(s.damage);
    this.armor = s.armor;
    this.charges = s.charges;
    this.enchant1 = s.enchant1;
    this.enchant2 = s.enchant2;
    this.timesEnchanted = s.timesEnchanted;
    this.vorpalEnemy = s.vorpalEnemy;
    this.strengthRequired = s.strengthRequired;
    this.quiverNumber = s.quiverNumber;
    this.displayChar = s.displayChar;
    this.foreColor = s.foreColor;
    this.inventoryColor = s.inventoryColor;
    this.quantity = s.quantity;
    this.inventoryLetter = s.inventoryLetter;
    this.inscription.set(s.inscription);
    this.loc.$cp(s.loc);
    $cparr(this.keyLoc, s.keyLoc);
    this.originDepth = s.originDepth;
    this.spawnTurnNumber = s.spawnTurnNumber;
    this.lastUsed.set(s.lastUsed);
    this.nextItem = s.nextItem;
    return this;
  }
  $clone(): struct_item { return new struct_item().$cp(this); }
  static $size = 352;
  static $layout(): any[] { return [['category', 0, ['i', 2, 0]], ['kind', 2, ['i', 2, 1]], ['flags', 8, ['i', 8, 0]], ['damage', 16, ['r', struct_randomRange]], ['armor', 22, ['i', 2, 1]], ['charges', 24, ['i', 2, 1]], ['enchant1', 26, ['i', 2, 1]], ['enchant2', 28, ['i', 2, 1]], ['timesEnchanted', 30, ['i', 2, 1]], ['vorpalEnemy', 32, ['i', 4, 1]], ['strengthRequired', 36, ['i', 2, 1]], ['quiverNumber', 38, ['i', 2, 0]], ['displayChar', 40, ['i', 4, 1]], ['foreColor', 48, ['p']], ['inventoryColor', 56, ['p']], ['quantity', 64, ['i', 2, 1]], ['inventoryLetter', 66, ['i', 1, 1]], ['inscription', 67, ['a', ['i', 1, 1], 79]], ['loc', 146, ['r', struct_pos]], ['keyLoc', 150, ['a', ['r', struct_keyLocationProfile], 20]], ['originDepth', 310, ['i', 2, 1]], ['spawnTurnNumber', 312, ['i', 8, 0]], ['lastUsed', 320, ['a', ['i', 8, 0], 3]], ['nextItem', 344, ['p']]]; }
}

/** struct itemTable: 1576 bytes */
export class struct_itemTable {
  name: any = null;
  flavor: any = null;
  callTitle: Int8Array = new Int8Array(30);
  frequency: number = 0;
  marketValue: number = 0;
  strengthRequired: number = 0;
  power: number = 0;
  range: struct_randomRange = new struct_randomRange();
  identified: number = 0;
  called: number = 0;
  magicPolarity: number = 0;
  magicPolarityRevealed: number = 0;
  description: Int8Array = new Int8Array(1500);
  static $of(...a: any[]): struct_itemTable {
    const o = new struct_itemTable();
    const n = a.length;
    if (n > 0) o.name = a[0];
    if (n > 1) o.flavor = a[1];
    if (n > 2) o.callTitle = a[2];
    if (n > 3) o.frequency = a[3];
    if (n > 4) o.marketValue = a[4];
    if (n > 5) o.strengthRequired = a[5];
    if (n > 6) o.power = a[6];
    if (n > 7) o.range = a[7];
    if (n > 8) o.identified = a[8];
    if (n > 9) o.called = a[9];
    if (n > 10) o.magicPolarity = a[10];
    if (n > 11) o.magicPolarityRevealed = a[11];
    if (n > 12) o.description = a[12];
    return o;
  }
  $cp(s: struct_itemTable): this {
    this.name = s.name;
    this.flavor = s.flavor;
    this.callTitle.set(s.callTitle);
    this.frequency = s.frequency;
    this.marketValue = s.marketValue;
    this.strengthRequired = s.strengthRequired;
    this.power = s.power;
    this.range.$cp(s.range);
    this.identified = s.identified;
    this.called = s.called;
    this.magicPolarity = s.magicPolarity;
    this.magicPolarityRevealed = s.magicPolarityRevealed;
    this.description.set(s.description);
    return this;
  }
  $clone(): struct_itemTable { return new struct_itemTable().$cp(this); }
  static $size = 1576;
  static $layout(): any[] { return [['name', 0, ['p']], ['flavor', 8, ['p']], ['callTitle', 16, ['a', ['i', 1, 1], 30]], ['frequency', 46, ['i', 2, 1]], ['marketValue', 48, ['i', 2, 1]], ['strengthRequired', 50, ['i', 2, 1]], ['power', 52, ['i', 4, 1]], ['range', 56, ['r', struct_randomRange]], ['identified', 62, ['i', 1, 1]], ['called', 63, ['i', 1, 1]], ['magicPolarity', 64, ['i', 4, 1]], ['magicPolarityRevealed', 68, ['i', 1, 1]], ['description', 69, ['a', ['i', 1, 1], 1500]]]; }
}

/** struct keyLocationProfile: 8 bytes */
export class struct_keyLocationProfile {
  loc: struct_pos = new struct_pos();
  machine: number = 0;
  disposableHere: number = 0;
  static $of(...a: any[]): struct_keyLocationProfile {
    const o = new struct_keyLocationProfile();
    const n = a.length;
    if (n > 0) o.loc = a[0];
    if (n > 1) o.machine = a[1];
    if (n > 2) o.disposableHere = a[2];
    return o;
  }
  $cp(s: struct_keyLocationProfile): this {
    this.loc.$cp(s.loc);
    this.machine = s.machine;
    this.disposableHere = s.disposableHere;
    return this;
  }
  $clone(): struct_keyLocationProfile { return new struct_keyLocationProfile().$cp(this); }
  static $size = 8;
  static $layout(): any[] { return [['loc', 0, ['r', struct_pos]], ['machine', 4, ['i', 2, 1]], ['disposableHere', 6, ['i', 1, 1]]]; }
}

/** struct levelData: 201680 bytes */
export class struct_levelData {
  visited: number = 0;
  mapStorage: any[] = $arr(79, () => $sarr(struct_pcell, 29));
  items: struct_item | null = null;
  monsters: struct_creatureList = new struct_creatureList();
  dormantMonsters: struct_creatureList = new struct_creatureList();
  scentMap: any = null;
  levelSeed: bigint = 0n;
  upStairsLoc: struct_pos = new struct_pos();
  downStairsLoc: struct_pos = new struct_pos();
  playerExitedVia: struct_pos = new struct_pos();
  awaySince: number = 0;
  static $of(...a: any[]): struct_levelData {
    const o = new struct_levelData();
    const n = a.length;
    if (n > 0) o.visited = a[0];
    if (n > 1) o.mapStorage = a[1];
    if (n > 2) o.items = a[2];
    if (n > 3) o.monsters = a[3];
    if (n > 4) o.dormantMonsters = a[4];
    if (n > 5) o.scentMap = a[5];
    if (n > 6) o.levelSeed = a[6];
    if (n > 7) o.upStairsLoc = a[7];
    if (n > 8) o.downStairsLoc = a[8];
    if (n > 9) o.playerExitedVia = a[9];
    if (n > 10) o.awaySince = a[10];
    return o;
  }
  $cp(s: struct_levelData): this {
    this.visited = s.visited;
    $cparr(this.mapStorage, s.mapStorage);
    this.items = s.items;
    this.monsters.$cp(s.monsters);
    this.dormantMonsters.$cp(s.dormantMonsters);
    this.scentMap = s.scentMap;
    this.levelSeed = s.levelSeed;
    this.upStairsLoc.$cp(s.upStairsLoc);
    this.downStairsLoc.$cp(s.downStairsLoc);
    this.playerExitedVia.$cp(s.playerExitedVia);
    this.awaySince = s.awaySince;
    return this;
  }
  $clone(): struct_levelData { return new struct_levelData().$cp(this); }
  static $size = 201680;
  static $layout(): any[] { return [['visited', 0, ['i', 1, 1]], ['mapStorage', 8, ['a', ['a', ['r', struct_pcell], 29], 79]], ['items', 201616, ['p']], ['monsters', 201624, ['r', struct_creatureList]], ['dormantMonsters', 201632, ['r', struct_creatureList]], ['scentMap', 201640, ['p']], ['levelSeed', 201648, ['i', 8, 0]], ['upStairsLoc', 201656, ['r', struct_pos]], ['downStairsLoc', 201660, ['r', struct_pos]], ['playerExitedVia', 201664, ['r', struct_pos]], ['awaySince', 201672, ['i', 8, 0]]]; }
}

/** struct levelFeeling: 16 bytes */
export class struct_levelFeeling {
  message: any = null;
  color: struct_color | null = null;
  static $of(...a: any[]): struct_levelFeeling {
    const o = new struct_levelFeeling();
    const n = a.length;
    if (n > 0) o.message = a[0];
    if (n > 1) o.color = a[1];
    return o;
  }
  $cp(s: struct_levelFeeling): this {
    this.message = s.message;
    this.color = s.color;
    return this;
  }
  $clone(): struct_levelFeeling { return new struct_levelFeeling().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['message', 0, ['p']], ['color', 8, ['p']]]; }
}

/** struct lightSource: 24 bytes */
export class struct_lightSource {
  lightColor: struct_color | null = null;
  lightRadius: struct_randomRange = new struct_randomRange();
  radialFadeToPercent: number = 0;
  passThroughCreatures: number = 0;
  static $of(...a: any[]): struct_lightSource {
    const o = new struct_lightSource();
    const n = a.length;
    if (n > 0) o.lightColor = a[0];
    if (n > 1) o.lightRadius = a[1];
    if (n > 2) o.radialFadeToPercent = a[2];
    if (n > 3) o.passThroughCreatures = a[3];
    return o;
  }
  $cp(s: struct_lightSource): this {
    this.lightColor = s.lightColor;
    this.lightRadius.$cp(s.lightRadius);
    this.radialFadeToPercent = s.radialFadeToPercent;
    this.passThroughCreatures = s.passThroughCreatures;
    return this;
  }
  $clone(): struct_lightSource { return new struct_lightSource().$cp(this); }
  static $size = 24;
  static $layout(): any[] { return [['lightColor', 0, ['p']], ['lightRadius', 8, ['r', struct_randomRange]], ['radialFadeToPercent', 14, ['i', 2, 1]], ['passThroughCreatures', 16, ['i', 1, 1]]]; }
}

/** struct machineData: 220080 bytes */
export class struct_machineData {
  interior: any[] = $arr(79, () => new Int8Array(29));
  occupied: any[] = $arr(79, () => new Int8Array(29));
  candidates: any[] = $arr(79, () => new Int8Array(29));
  blockingMap: any[] = $arr(79, () => new Int8Array(29));
  viewMap: any[] = $arr(79, () => new Int8Array(29));
  levelBackup: any[] = $arr(79, () => $sarr(struct_pcell, 29));
  spawnedItems: any[] = new Array(200).fill(null);
  spawnedItemsSub: any[] = new Array(200).fill(null);
  spawnedMonsters: any[] = new Array(200).fill(null);
  spawnedMonstersSub: any[] = new Array(200).fill(null);
  gateCandidates: any[] = $sarr(struct_pos, 50);
  distances: Int16Array = new Int16Array(100);
  sRows: Int16Array = new Int16Array(29);
  sCols: Int16Array = new Int16Array(79);
  static $of(...a: any[]): struct_machineData {
    const o = new struct_machineData();
    const n = a.length;
    if (n > 0) o.interior = a[0];
    if (n > 1) o.occupied = a[1];
    if (n > 2) o.candidates = a[2];
    if (n > 3) o.blockingMap = a[3];
    if (n > 4) o.viewMap = a[4];
    if (n > 5) o.levelBackup = a[5];
    if (n > 6) o.spawnedItems = a[6];
    if (n > 7) o.spawnedItemsSub = a[7];
    if (n > 8) o.spawnedMonsters = a[8];
    if (n > 9) o.spawnedMonstersSub = a[9];
    if (n > 10) o.gateCandidates = a[10];
    if (n > 11) o.distances = a[11];
    if (n > 12) o.sRows = a[12];
    if (n > 13) o.sCols = a[13];
    return o;
  }
  $cp(s: struct_machineData): this {
    $cparr(this.interior, s.interior);
    $cparr(this.occupied, s.occupied);
    $cparr(this.candidates, s.candidates);
    $cparr(this.blockingMap, s.blockingMap);
    $cparr(this.viewMap, s.viewMap);
    $cparr(this.levelBackup, s.levelBackup);
    $cpvals(this.spawnedItems, s.spawnedItems);
    $cpvals(this.spawnedItemsSub, s.spawnedItemsSub);
    $cpvals(this.spawnedMonsters, s.spawnedMonsters);
    $cpvals(this.spawnedMonstersSub, s.spawnedMonstersSub);
    $cparr(this.gateCandidates, s.gateCandidates);
    this.distances.set(s.distances);
    this.sRows.set(s.sRows);
    this.sCols.set(s.sCols);
    return this;
  }
  $clone(): struct_machineData { return new struct_machineData().$cp(this); }
  static $size = 220080;
  static $layout(): any[] { return [['interior', 0, ['a', ['a', ['i', 1, 1], 29], 79]], ['occupied', 2291, ['a', ['a', ['i', 1, 1], 29], 79]], ['candidates', 4582, ['a', ['a', ['i', 1, 1], 29], 79]], ['blockingMap', 6873, ['a', ['a', ['i', 1, 1], 29], 79]], ['viewMap', 9164, ['a', ['a', ['i', 1, 1], 29], 79]], ['levelBackup', 11456, ['a', ['a', ['r', struct_pcell], 29], 79]], ['spawnedItems', 213064, ['a', ['p'], 200]], ['spawnedItemsSub', 214664, ['a', ['p'], 200]], ['spawnedMonsters', 216264, ['a', ['p'], 200]], ['spawnedMonstersSub', 217864, ['a', ['p'], 200]], ['gateCandidates', 219464, ['a', ['r', struct_pos], 50]], ['distances', 219664, ['a', ['i', 2, 1], 100]], ['sRows', 219864, ['a', ['i', 2, 1], 29]], ['sCols', 219922, ['a', ['i', 2, 1], 79]]]; }
}

/** struct machineFeature: 56 bytes */
export class struct_machineFeature {
  featureDF: number = 0;
  terrain: number = 0;
  layer: number = 0;
  instanceCountRange: Int16Array = new Int16Array(2);
  minimumInstanceCount: number = 0;
  itemCategory: number = 0;
  itemKind: number = 0;
  monsterID: number = 0;
  personalSpace: number = 0;
  hordeFlags: number = 0;
  itemFlags: number = 0;
  flags: number = 0;
  static $of(...a: any[]): struct_machineFeature {
    const o = new struct_machineFeature();
    const n = a.length;
    if (n > 0) o.featureDF = a[0];
    if (n > 1) o.terrain = a[1];
    if (n > 2) o.layer = a[2];
    if (n > 3) o.instanceCountRange = a[3];
    if (n > 4) o.minimumInstanceCount = a[4];
    if (n > 5) o.itemCategory = a[5];
    if (n > 6) o.itemKind = a[6];
    if (n > 7) o.monsterID = a[7];
    if (n > 8) o.personalSpace = a[8];
    if (n > 9) o.hordeFlags = a[9];
    if (n > 10) o.itemFlags = a[10];
    if (n > 11) o.flags = a[11];
    return o;
  }
  $cp(s: struct_machineFeature): this {
    this.featureDF = s.featureDF;
    this.terrain = s.terrain;
    this.layer = s.layer;
    this.instanceCountRange.set(s.instanceCountRange);
    this.minimumInstanceCount = s.minimumInstanceCount;
    this.itemCategory = s.itemCategory;
    this.itemKind = s.itemKind;
    this.monsterID = s.monsterID;
    this.personalSpace = s.personalSpace;
    this.hordeFlags = s.hordeFlags;
    this.itemFlags = s.itemFlags;
    this.flags = s.flags;
    return this;
  }
  $clone(): struct_machineFeature { return new struct_machineFeature().$cp(this); }
  static $size = 56;
  static $layout(): any[] { return [['featureDF', 0, ['i', 4, 1]], ['terrain', 4, ['i', 4, 1]], ['layer', 8, ['i', 4, 1]], ['instanceCountRange', 12, ['a', ['i', 2, 1], 2]], ['minimumInstanceCount', 16, ['i', 2, 1]], ['itemCategory', 18, ['i', 2, 1]], ['itemKind', 20, ['i', 2, 1]], ['monsterID', 22, ['i', 2, 1]], ['personalSpace', 24, ['i', 2, 1]], ['hordeFlags', 32, ['i', 8, 0]], ['itemFlags', 40, ['i', 8, 0]], ['flags', 48, ['i', 8, 0]]]; }
}

/** struct meteredItem: 8 bytes */
export class struct_meteredItem {
  frequency: number = 0;
  numberSpawned: number = 0;
  static $of(...a: any[]): struct_meteredItem {
    const o = new struct_meteredItem();
    const n = a.length;
    if (n > 0) o.frequency = a[0];
    if (n > 1) o.numberSpawned = a[1];
    return o;
  }
  $cp(s: struct_meteredItem): this {
    this.frequency = s.frequency;
    this.numberSpawned = s.numberSpawned;
    return this;
  }
  $clone(): struct_meteredItem { return new struct_meteredItem().$cp(this); }
  static $size = 8;
  static $layout(): any[] { return [['frequency', 0, ['i', 4, 1]], ['numberSpawned', 4, ['i', 4, 1]]]; }
}

/** struct meteredItemGenerationTable: 36 bytes */
export class struct_meteredItemGenerationTable {
  category: number = 0;
  kind: number = 0;
  initialFrequency: number = 0;
  incrementFrequency: number = 0;
  decrementFrequency: number = 0;
  genMultiplier: number = 0;
  genIncrement: number = 0;
  levelScaling: number = 0;
  levelGuarantee: number = 0;
  itemNumberGuarantee: number = 0;
  static $of(...a: any[]): struct_meteredItemGenerationTable {
    const o = new struct_meteredItemGenerationTable();
    const n = a.length;
    if (n > 0) o.category = a[0];
    if (n > 1) o.kind = a[1];
    if (n > 2) o.initialFrequency = a[2];
    if (n > 3) o.incrementFrequency = a[3];
    if (n > 4) o.decrementFrequency = a[4];
    if (n > 5) o.genMultiplier = a[5];
    if (n > 6) o.genIncrement = a[6];
    if (n > 7) o.levelScaling = a[7];
    if (n > 8) o.levelGuarantee = a[8];
    if (n > 9) o.itemNumberGuarantee = a[9];
    return o;
  }
  $cp(s: struct_meteredItemGenerationTable): this {
    this.category = s.category;
    this.kind = s.kind;
    this.initialFrequency = s.initialFrequency;
    this.incrementFrequency = s.incrementFrequency;
    this.decrementFrequency = s.decrementFrequency;
    this.genMultiplier = s.genMultiplier;
    this.genIncrement = s.genIncrement;
    this.levelScaling = s.levelScaling;
    this.levelGuarantee = s.levelGuarantee;
    this.itemNumberGuarantee = s.itemNumberGuarantee;
    return this;
  }
  $clone(): struct_meteredItemGenerationTable { return new struct_meteredItemGenerationTable().$cp(this); }
  static $size = 36;
  static $layout(): any[] { return [['category', 0, ['i', 2, 0]], ['kind', 2, ['i', 2, 1]], ['initialFrequency', 4, ['i', 4, 1]], ['incrementFrequency', 8, ['i', 4, 1]], ['decrementFrequency', 12, ['i', 4, 1]], ['genMultiplier', 16, ['i', 4, 1]], ['genIncrement', 20, ['i', 4, 1]], ['levelScaling', 24, ['i', 4, 1]], ['levelGuarantee', 28, ['i', 4, 1]], ['itemNumberGuarantee', 32, ['i', 4, 1]]]; }
}

/** struct monsterAbility: 101 bytes */
export class struct_monsterAbility {
  description: Int8Array = new Int8Array(100);
  isNegatable: number = 0;
  static $of(...a: any[]): struct_monsterAbility {
    const o = new struct_monsterAbility();
    const n = a.length;
    if (n > 0) o.description = a[0];
    if (n > 1) o.isNegatable = a[1];
    return o;
  }
  $cp(s: struct_monsterAbility): this {
    this.description.set(s.description);
    this.isNegatable = s.isNegatable;
    return this;
  }
  $clone(): struct_monsterAbility { return new struct_monsterAbility().$cp(this); }
  static $size = 101;
  static $layout(): any[] { return [['description', 0, ['a', ['i', 1, 1], 100]], ['isNegatable', 100, ['i', 1, 1]]]; }
}

/** struct monsterBehavior: 101 bytes */
export class struct_monsterBehavior {
  description: Int8Array = new Int8Array(100);
  isNegatable: number = 0;
  static $of(...a: any[]): struct_monsterBehavior {
    const o = new struct_monsterBehavior();
    const n = a.length;
    if (n > 0) o.description = a[0];
    if (n > 1) o.isNegatable = a[1];
    return o;
  }
  $cp(s: struct_monsterBehavior): this {
    this.description.set(s.description);
    this.isNegatable = s.isNegatable;
    return this;
  }
  $clone(): struct_monsterBehavior { return new struct_monsterBehavior().$cp(this); }
  static $size = 101;
  static $layout(): any[] { return [['description', 0, ['a', ['i', 1, 1], 100]], ['isNegatable', 100, ['i', 1, 1]]]; }
}

/** struct monsterClass: 96 bytes */
export class struct_monsterClass {
  name: Int8Array = new Int8Array(30);
  frequency: number = 0;
  maxDepth: number = 0;
  memberList: Int32Array = new Int32Array(15);
  static $of(...a: any[]): struct_monsterClass {
    const o = new struct_monsterClass();
    const n = a.length;
    if (n > 0) o.name = a[0];
    if (n > 1) o.frequency = a[1];
    if (n > 2) o.maxDepth = a[2];
    if (n > 3) o.memberList = a[3];
    return o;
  }
  $cp(s: struct_monsterClass): this {
    this.name.set(s.name);
    this.frequency = s.frequency;
    this.maxDepth = s.maxDepth;
    this.memberList.set(s.memberList);
    return this;
  }
  $clone(): struct_monsterClass { return new struct_monsterClass().$cp(this); }
  static $size = 96;
  static $layout(): any[] { return [['name', 0, ['a', ['i', 1, 1], 30]], ['frequency', 30, ['i', 2, 1]], ['maxDepth', 32, ['i', 2, 1]], ['memberList', 36, ['a', ['i', 4, 1], 15]]]; }
}

/** struct monsterWords: 1046 bytes */
export class struct_monsterWords {
  flavorText: Int8Array = new Int8Array(500);
  absorbing: Int8Array = new Int8Array(40);
  absorbStatus: Int8Array = new Int8Array(40);
  attack: any[] = $arr(5, () => new Int8Array(30));
  DFMessage: Int8Array = new Int8Array(158);
  summonMessage: Int8Array = new Int8Array(158);
  static $of(...a: any[]): struct_monsterWords {
    const o = new struct_monsterWords();
    const n = a.length;
    if (n > 0) o.flavorText = a[0];
    if (n > 1) o.absorbing = a[1];
    if (n > 2) o.absorbStatus = a[2];
    if (n > 3) o.attack = a[3];
    if (n > 4) o.DFMessage = a[4];
    if (n > 5) o.summonMessage = a[5];
    return o;
  }
  $cp(s: struct_monsterWords): this {
    this.flavorText.set(s.flavorText);
    this.absorbing.set(s.absorbing);
    this.absorbStatus.set(s.absorbStatus);
    $cparr(this.attack, s.attack);
    this.DFMessage.set(s.DFMessage);
    this.summonMessage.set(s.summonMessage);
    return this;
  }
  $clone(): struct_monsterWords { return new struct_monsterWords().$cp(this); }
  static $size = 1046;
  static $layout(): any[] { return [['flavorText', 0, ['a', ['i', 1, 1], 500]], ['absorbing', 500, ['a', ['i', 1, 1], 40]], ['absorbStatus', 540, ['a', ['i', 1, 1], 40]], ['attack', 580, ['a', ['a', ['i', 1, 1], 30], 5]], ['DFMessage', 730, ['a', ['i', 1, 1], 158]], ['summonMessage', 888, ['a', ['i', 1, 1], 158]]]; }
}

/** struct mutation: 1176 bytes */
export class struct_mutation {
  title: Int8Array = new Int8Array(100);
  textColor: struct_color | null = null;
  healthFactor: number = 0;
  moveSpeedFactor: number = 0;
  attackSpeedFactor: number = 0;
  defenseFactor: number = 0;
  damageFactor: number = 0;
  DFChance: number = 0;
  DFType: number = 0;
  light: number = 0;
  monsterFlags: number = 0;
  monsterAbilityFlags: number = 0;
  forbiddenFlags: number = 0;
  forbiddenAbilityFlags: number = 0;
  description: Int8Array = new Int8Array(1000);
  canBeNegated: number = 0;
  static $of(...a: any[]): struct_mutation {
    const o = new struct_mutation();
    const n = a.length;
    if (n > 0) o.title = a[0];
    if (n > 1) o.textColor = a[1];
    if (n > 2) o.healthFactor = a[2];
    if (n > 3) o.moveSpeedFactor = a[3];
    if (n > 4) o.attackSpeedFactor = a[4];
    if (n > 5) o.defenseFactor = a[5];
    if (n > 6) o.damageFactor = a[6];
    if (n > 7) o.DFChance = a[7];
    if (n > 8) o.DFType = a[8];
    if (n > 9) o.light = a[9];
    if (n > 10) o.monsterFlags = a[10];
    if (n > 11) o.monsterAbilityFlags = a[11];
    if (n > 12) o.forbiddenFlags = a[12];
    if (n > 13) o.forbiddenAbilityFlags = a[13];
    if (n > 14) o.description = a[14];
    if (n > 15) o.canBeNegated = a[15];
    return o;
  }
  $cp(s: struct_mutation): this {
    this.title.set(s.title);
    this.textColor = s.textColor;
    this.healthFactor = s.healthFactor;
    this.moveSpeedFactor = s.moveSpeedFactor;
    this.attackSpeedFactor = s.attackSpeedFactor;
    this.defenseFactor = s.defenseFactor;
    this.damageFactor = s.damageFactor;
    this.DFChance = s.DFChance;
    this.DFType = s.DFType;
    this.light = s.light;
    this.monsterFlags = s.monsterFlags;
    this.monsterAbilityFlags = s.monsterAbilityFlags;
    this.forbiddenFlags = s.forbiddenFlags;
    this.forbiddenAbilityFlags = s.forbiddenAbilityFlags;
    this.description.set(s.description);
    this.canBeNegated = s.canBeNegated;
    return this;
  }
  $clone(): struct_mutation { return new struct_mutation().$cp(this); }
  static $size = 1176;
  static $layout(): any[] { return [['title', 0, ['a', ['i', 1, 1], 100]], ['textColor', 104, ['p']], ['healthFactor', 112, ['i', 2, 1]], ['moveSpeedFactor', 114, ['i', 2, 1]], ['attackSpeedFactor', 116, ['i', 2, 1]], ['defenseFactor', 118, ['i', 2, 1]], ['damageFactor', 120, ['i', 2, 1]], ['DFChance', 122, ['i', 2, 1]], ['DFType', 124, ['i', 4, 1]], ['light', 128, ['i', 4, 1]], ['monsterFlags', 136, ['i', 8, 0]], ['monsterAbilityFlags', 144, ['i', 8, 0]], ['forbiddenFlags', 152, ['i', 8, 0]], ['forbiddenAbilityFlags', 160, ['i', 8, 0]], ['description', 168, ['a', ['i', 1, 1], 1000]], ['canBeNegated', 1168, ['i', 1, 1]]]; }
}

/** struct packSummary: 16 bytes */
export class struct_packSummary {
  hasNegationWand: number = 0;
  hasNegationScroll: number = 0;
  hasNegationCharm: number = 0;
  hasDominationWand: number = 0;
  hasShatteringCharm: number = 0;
  hasShatteringScroll: number = 0;
  hasTunnelingStaff: number = 0;
  wandCount: number = 0;
  staffCount: number = 0;
  static $of(...a: any[]): struct_packSummary {
    const o = new struct_packSummary();
    const n = a.length;
    if (n > 0) o.hasNegationWand = a[0];
    if (n > 1) o.hasNegationScroll = a[1];
    if (n > 2) o.hasNegationCharm = a[2];
    if (n > 3) o.hasDominationWand = a[3];
    if (n > 4) o.hasShatteringCharm = a[4];
    if (n > 5) o.hasShatteringScroll = a[5];
    if (n > 6) o.hasTunnelingStaff = a[6];
    if (n > 7) o.wandCount = a[7];
    if (n > 8) o.staffCount = a[8];
    return o;
  }
  $cp(s: struct_packSummary): this {
    this.hasNegationWand = s.hasNegationWand;
    this.hasNegationScroll = s.hasNegationScroll;
    this.hasNegationCharm = s.hasNegationCharm;
    this.hasDominationWand = s.hasDominationWand;
    this.hasShatteringCharm = s.hasShatteringCharm;
    this.hasShatteringScroll = s.hasShatteringScroll;
    this.hasTunnelingStaff = s.hasTunnelingStaff;
    this.wandCount = s.wandCount;
    this.staffCount = s.staffCount;
    return this;
  }
  $clone(): struct_packSummary { return new struct_packSummary().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['hasNegationWand', 0, ['i', 1, 1]], ['hasNegationScroll', 1, ['i', 1, 1]], ['hasNegationCharm', 2, ['i', 1, 1]], ['hasDominationWand', 3, ['i', 1, 1]], ['hasShatteringCharm', 4, ['i', 1, 1]], ['hasShatteringScroll', 5, ['i', 1, 1]], ['hasTunnelingStaff', 6, ['i', 1, 1]], ['wandCount', 8, ['i', 4, 1]], ['staffCount', 12, ['i', 4, 1]]]; }
}

/** struct pcell: 88 bytes */
export class struct_pcell {
  layers: Int32Array = new Int32Array(4);
  flags: number = 0;
  volume: number = 0;
  machineNumber: number = 0;
  rememberedAppearance: struct_cellDisplayBuffer = new struct_cellDisplayBuffer();
  rememberedItemCategory: number = 0;
  rememberedItemKind: number = 0;
  rememberedItemQuantity: number = 0;
  rememberedItemOriginDepth: number = 0;
  rememberedTerrain: number = 0;
  rememberedCellFlags: number = 0;
  rememberedTerrainFlags: number = 0;
  rememberedTMFlags: number = 0;
  exposedToFire: number = 0;
  static $of(...a: any[]): struct_pcell {
    const o = new struct_pcell();
    const n = a.length;
    if (n > 0) o.layers = a[0];
    if (n > 1) o.flags = a[1];
    if (n > 2) o.volume = a[2];
    if (n > 3) o.machineNumber = a[3];
    if (n > 4) o.rememberedAppearance = a[4];
    if (n > 5) o.rememberedItemCategory = a[5];
    if (n > 6) o.rememberedItemKind = a[6];
    if (n > 7) o.rememberedItemQuantity = a[7];
    if (n > 8) o.rememberedItemOriginDepth = a[8];
    if (n > 9) o.rememberedTerrain = a[9];
    if (n > 10) o.rememberedCellFlags = a[10];
    if (n > 11) o.rememberedTerrainFlags = a[11];
    if (n > 12) o.rememberedTMFlags = a[12];
    if (n > 13) o.exposedToFire = a[13];
    return o;
  }
  $cp(s: struct_pcell): this {
    this.layers.set(s.layers);
    this.flags = s.flags;
    this.volume = s.volume;
    this.machineNumber = s.machineNumber;
    this.rememberedAppearance.$cp(s.rememberedAppearance);
    this.rememberedItemCategory = s.rememberedItemCategory;
    this.rememberedItemKind = s.rememberedItemKind;
    this.rememberedItemQuantity = s.rememberedItemQuantity;
    this.rememberedItemOriginDepth = s.rememberedItemOriginDepth;
    this.rememberedTerrain = s.rememberedTerrain;
    this.rememberedCellFlags = s.rememberedCellFlags;
    this.rememberedTerrainFlags = s.rememberedTerrainFlags;
    this.rememberedTMFlags = s.rememberedTMFlags;
    this.exposedToFire = s.exposedToFire;
    return this;
  }
  $clone(): struct_pcell { return new struct_pcell().$cp(this); }
  static $size = 88;
  static $layout(): any[] { return [['layers', 0, ['a', ['i', 4, 1], 4]], ['flags', 16, ['i', 8, 0]], ['volume', 24, ['i', 2, 0]], ['machineNumber', 26, ['i', 1, 0]], ['rememberedAppearance', 28, ['r', struct_cellDisplayBuffer]], ['rememberedItemCategory', 40, ['i', 4, 1]], ['rememberedItemKind', 44, ['i', 2, 1]], ['rememberedItemQuantity', 46, ['i', 2, 1]], ['rememberedItemOriginDepth', 48, ['i', 2, 1]], ['rememberedTerrain', 52, ['i', 4, 1]], ['rememberedCellFlags', 56, ['i', 8, 0]], ['rememberedTerrainFlags', 64, ['i', 8, 0]], ['rememberedTMFlags', 72, ['i', 8, 0]], ['exposedToFire', 80, ['i', 2, 1]]]; }
}

/** struct pdsLink: 24 bytes */
export class struct_pdsLink {
  distance: number = 0;
  cost: number = 0;
  left: struct_pdsLink | null = null;
  right: struct_pdsLink | null = null;
  static $of(...a: any[]): struct_pdsLink {
    const o = new struct_pdsLink();
    const n = a.length;
    if (n > 0) o.distance = a[0];
    if (n > 1) o.cost = a[1];
    if (n > 2) o.left = a[2];
    if (n > 3) o.right = a[3];
    return o;
  }
  $cp(s: struct_pdsLink): this {
    this.distance = s.distance;
    this.cost = s.cost;
    this.left = s.left;
    this.right = s.right;
    return this;
  }
  $clone(): struct_pdsLink { return new struct_pdsLink().$cp(this); }
  static $size = 24;
  static $layout(): any[] { return [['distance', 0, ['i', 2, 1]], ['cost', 2, ['i', 2, 1]], ['left', 8, ['p']], ['right', 16, ['p']]]; }
}

/** struct pdsMap: 55008 bytes */
export class struct_pdsMap {
  front: struct_pdsLink = new struct_pdsLink();
  links: any[] = $sarr(struct_pdsLink, 2291);
  static $of(...a: any[]): struct_pdsMap {
    const o = new struct_pdsMap();
    const n = a.length;
    if (n > 0) o.front = a[0];
    if (n > 1) o.links = a[1];
    return o;
  }
  $cp(s: struct_pdsMap): this {
    this.front.$cp(s.front);
    $cparr(this.links, s.links);
    return this;
  }
  $clone(): struct_pdsMap { return new struct_pdsMap().$cp(this); }
  static $size = 55008;
  static $layout(): any[] { return [['front', 0, ['r', struct_pdsLink]], ['links', 24, ['a', ['r', struct_pdsLink], 2291]]]; }
}

/** struct playerCharacter: 14368 bytes */
export class struct_playerCharacter {
  mode: number = 0;
  depthLevel: number = 0;
  deepestLevel: number = 0;
  disturbed: number = 0;
  gameInProgress: number = 0;
  gameHasEnded: number = 0;
  highScoreSaved: number = 0;
  blockCombatText: number = 0;
  autoPlayingLevel: number = 0;
  automationActive: number = 0;
  justRested: number = 0;
  justSearched: number = 0;
  cautiousMode: number = 0;
  receivedLevitationWarning: number = 0;
  updatedSafetyMapThisTurn: number = 0;
  updatedAllySafetyMapThisTurn: number = 0;
  updatedMapToSafeTerrainThisTurn: number = 0;
  updatedMapToShoreThisTurn: number = 0;
  inWater: number = 0;
  heardCombatThisTurn: number = 0;
  creaturesWillFlashThisTurn: number = 0;
  staleLoopMap: number = 0;
  alreadyFell: number = 0;
  eligibleToUseStairs: number = 0;
  trueColorMode: number = 0;
  hideSeed: number = 0;
  displayStealthRangeMode: number = 0;
  quit: number = 0;
  seed: bigint = 0n;
  RNG: number = 0;
  gold: number = 0;
  goldGenerated: number = 0;
  strength: number = 0;
  monsterSpawnFuse: number = 0;
  weapon: struct_item | null = null;
  armor: struct_item | null = null;
  ringLeft: struct_item | null = null;
  ringRight: struct_item | null = null;
  swappedIn: struct_item | null = null;
  swappedOut: struct_item | null = null;
  flares: any = null;
  flareCount: number = 0;
  flareCapacity: number = 0;
  yendorWarden: struct_creature | null = null;
  minersLight: struct_lightSource = new struct_lightSource();
  minersLightRadius: number = 0;
  ticksTillUpdateEnvironment: number = 0;
  scentTurnNumber: number = 0;
  playerTurnNumber: number = 0;
  absoluteTurnNumber: number = 0;
  milliseconds: number = 0;
  xpxpThisTurn: number = 0;
  stealthRange: number = 0;
  previousPoisonPercent: number = 0;
  upLoc: struct_pos = new struct_pos();
  downLoc: struct_pos = new struct_pos();
  cursorLoc: struct_pos = new struct_pos();
  lastTarget: struct_creature | null = null;
  lastItemThrown: struct_item | null = null;
  rewardRoomsGenerated: number = 0;
  machineNumber: number = 0;
  sidebarLocationList: any[] = $sarr(struct_pos, 68);
  mapToShore: any = null;
  mapToSafeTerrain: any = null;
  recording: number = 0;
  playbackMode: number = 0;
  patchVersion: number = 0;
  versionString: Int8Array = new Int8Array(16);
  currentTurnNumber: number = 0;
  howManyTurns: number = 0;
  howManyDepthChanges: number = 0;
  playbackDelayPerTurn: number = 0;
  playbackDelayThisTurn: number = 0;
  playbackPaused: number = 0;
  playbackFastForward: number = 0;
  playbackOOS: number = 0;
  playbackOmniscience: number = 0;
  playbackBetweenTurns: number = 0;
  nextAnnotationTurn: number = 0;
  nextAnnotation: Int8Array = new Int8Array(5000);
  locationInAnnotationFile: number = 0;
  gameExitStatusCode: number = 0;
  foodSpawned: number = 0;
  meteredItems: struct_meteredItem | null = null;
  clairvoyance: number = 0;
  stealthBonus: number = 0;
  regenerationBonus: number = 0;
  lightMultiplier: number = 0;
  awarenessBonus: number = 0;
  transference: number = 0;
  wisdomBonus: number = 0;
  reaping: number = 0;
  featRecord: any = null;
  wpDistance: any[] = new Array(40).fill(null);
  wpCount: number = 0;
  wpCoordinates: any[] = $sarr(struct_pos, 40);
  wpRefreshTicker: number = 0;
  cursorPathIntensity: number = 0;
  cursorMode: number = 0;
  nextGame: number = 0;
  nextGamePath: Int8Array = new Int8Array(4096);
  nextGameSeed: bigint = 0n;
  currentGamePath: Int8Array = new Int8Array(4096);
  static $of(...a: any[]): struct_playerCharacter {
    const o = new struct_playerCharacter();
    const n = a.length;
    if (n > 0) o.mode = a[0];
    if (n > 1) o.depthLevel = a[1];
    if (n > 2) o.deepestLevel = a[2];
    if (n > 3) o.disturbed = a[3];
    if (n > 4) o.gameInProgress = a[4];
    if (n > 5) o.gameHasEnded = a[5];
    if (n > 6) o.highScoreSaved = a[6];
    if (n > 7) o.blockCombatText = a[7];
    if (n > 8) o.autoPlayingLevel = a[8];
    if (n > 9) o.automationActive = a[9];
    if (n > 10) o.justRested = a[10];
    if (n > 11) o.justSearched = a[11];
    if (n > 12) o.cautiousMode = a[12];
    if (n > 13) o.receivedLevitationWarning = a[13];
    if (n > 14) o.updatedSafetyMapThisTurn = a[14];
    if (n > 15) o.updatedAllySafetyMapThisTurn = a[15];
    if (n > 16) o.updatedMapToSafeTerrainThisTurn = a[16];
    if (n > 17) o.updatedMapToShoreThisTurn = a[17];
    if (n > 18) o.inWater = a[18];
    if (n > 19) o.heardCombatThisTurn = a[19];
    if (n > 20) o.creaturesWillFlashThisTurn = a[20];
    if (n > 21) o.staleLoopMap = a[21];
    if (n > 22) o.alreadyFell = a[22];
    if (n > 23) o.eligibleToUseStairs = a[23];
    if (n > 24) o.trueColorMode = a[24];
    if (n > 25) o.hideSeed = a[25];
    if (n > 26) o.displayStealthRangeMode = a[26];
    if (n > 27) o.quit = a[27];
    if (n > 28) o.seed = a[28];
    if (n > 29) o.RNG = a[29];
    if (n > 30) o.gold = a[30];
    if (n > 31) o.goldGenerated = a[31];
    if (n > 32) o.strength = a[32];
    if (n > 33) o.monsterSpawnFuse = a[33];
    if (n > 34) o.weapon = a[34];
    if (n > 35) o.armor = a[35];
    if (n > 36) o.ringLeft = a[36];
    if (n > 37) o.ringRight = a[37];
    if (n > 38) o.swappedIn = a[38];
    if (n > 39) o.swappedOut = a[39];
    if (n > 40) o.flares = a[40];
    if (n > 41) o.flareCount = a[41];
    if (n > 42) o.flareCapacity = a[42];
    if (n > 43) o.yendorWarden = a[43];
    if (n > 44) o.minersLight = a[44];
    if (n > 45) o.minersLightRadius = a[45];
    if (n > 46) o.ticksTillUpdateEnvironment = a[46];
    if (n > 47) o.scentTurnNumber = a[47];
    if (n > 48) o.playerTurnNumber = a[48];
    if (n > 49) o.absoluteTurnNumber = a[49];
    if (n > 50) o.milliseconds = a[50];
    if (n > 51) o.xpxpThisTurn = a[51];
    if (n > 52) o.stealthRange = a[52];
    if (n > 53) o.previousPoisonPercent = a[53];
    if (n > 54) o.upLoc = a[54];
    if (n > 55) o.downLoc = a[55];
    if (n > 56) o.cursorLoc = a[56];
    if (n > 57) o.lastTarget = a[57];
    if (n > 58) o.lastItemThrown = a[58];
    if (n > 59) o.rewardRoomsGenerated = a[59];
    if (n > 60) o.machineNumber = a[60];
    if (n > 61) o.sidebarLocationList = a[61];
    if (n > 62) o.mapToShore = a[62];
    if (n > 63) o.mapToSafeTerrain = a[63];
    if (n > 64) o.recording = a[64];
    if (n > 65) o.playbackMode = a[65];
    if (n > 66) o.patchVersion = a[66];
    if (n > 67) o.versionString = a[67];
    if (n > 68) o.currentTurnNumber = a[68];
    if (n > 69) o.howManyTurns = a[69];
    if (n > 70) o.howManyDepthChanges = a[70];
    if (n > 71) o.playbackDelayPerTurn = a[71];
    if (n > 72) o.playbackDelayThisTurn = a[72];
    if (n > 73) o.playbackPaused = a[73];
    if (n > 74) o.playbackFastForward = a[74];
    if (n > 75) o.playbackOOS = a[75];
    if (n > 76) o.playbackOmniscience = a[76];
    if (n > 77) o.playbackBetweenTurns = a[77];
    if (n > 78) o.nextAnnotationTurn = a[78];
    if (n > 79) o.nextAnnotation = a[79];
    if (n > 80) o.locationInAnnotationFile = a[80];
    if (n > 81) o.gameExitStatusCode = a[81];
    if (n > 82) o.foodSpawned = a[82];
    if (n > 83) o.meteredItems = a[83];
    if (n > 84) o.clairvoyance = a[84];
    if (n > 85) o.stealthBonus = a[85];
    if (n > 86) o.regenerationBonus = a[86];
    if (n > 87) o.lightMultiplier = a[87];
    if (n > 88) o.awarenessBonus = a[88];
    if (n > 89) o.transference = a[89];
    if (n > 90) o.wisdomBonus = a[90];
    if (n > 91) o.reaping = a[91];
    if (n > 92) o.featRecord = a[92];
    if (n > 93) o.wpDistance = a[93];
    if (n > 94) o.wpCount = a[94];
    if (n > 95) o.wpCoordinates = a[95];
    if (n > 96) o.wpRefreshTicker = a[96];
    if (n > 97) o.cursorPathIntensity = a[97];
    if (n > 98) o.cursorMode = a[98];
    if (n > 99) o.nextGame = a[99];
    if (n > 100) o.nextGamePath = a[100];
    if (n > 101) o.nextGameSeed = a[101];
    if (n > 102) o.currentGamePath = a[102];
    return o;
  }
  $cp(s: struct_playerCharacter): this {
    this.mode = s.mode;
    this.depthLevel = s.depthLevel;
    this.deepestLevel = s.deepestLevel;
    this.disturbed = s.disturbed;
    this.gameInProgress = s.gameInProgress;
    this.gameHasEnded = s.gameHasEnded;
    this.highScoreSaved = s.highScoreSaved;
    this.blockCombatText = s.blockCombatText;
    this.autoPlayingLevel = s.autoPlayingLevel;
    this.automationActive = s.automationActive;
    this.justRested = s.justRested;
    this.justSearched = s.justSearched;
    this.cautiousMode = s.cautiousMode;
    this.receivedLevitationWarning = s.receivedLevitationWarning;
    this.updatedSafetyMapThisTurn = s.updatedSafetyMapThisTurn;
    this.updatedAllySafetyMapThisTurn = s.updatedAllySafetyMapThisTurn;
    this.updatedMapToSafeTerrainThisTurn = s.updatedMapToSafeTerrainThisTurn;
    this.updatedMapToShoreThisTurn = s.updatedMapToShoreThisTurn;
    this.inWater = s.inWater;
    this.heardCombatThisTurn = s.heardCombatThisTurn;
    this.creaturesWillFlashThisTurn = s.creaturesWillFlashThisTurn;
    this.staleLoopMap = s.staleLoopMap;
    this.alreadyFell = s.alreadyFell;
    this.eligibleToUseStairs = s.eligibleToUseStairs;
    this.trueColorMode = s.trueColorMode;
    this.hideSeed = s.hideSeed;
    this.displayStealthRangeMode = s.displayStealthRangeMode;
    this.quit = s.quit;
    this.seed = s.seed;
    this.RNG = s.RNG;
    this.gold = s.gold;
    this.goldGenerated = s.goldGenerated;
    this.strength = s.strength;
    this.monsterSpawnFuse = s.monsterSpawnFuse;
    this.weapon = s.weapon;
    this.armor = s.armor;
    this.ringLeft = s.ringLeft;
    this.ringRight = s.ringRight;
    this.swappedIn = s.swappedIn;
    this.swappedOut = s.swappedOut;
    this.flares = s.flares;
    this.flareCount = s.flareCount;
    this.flareCapacity = s.flareCapacity;
    this.yendorWarden = s.yendorWarden;
    this.minersLight.$cp(s.minersLight);
    this.minersLightRadius = s.minersLightRadius;
    this.ticksTillUpdateEnvironment = s.ticksTillUpdateEnvironment;
    this.scentTurnNumber = s.scentTurnNumber;
    this.playerTurnNumber = s.playerTurnNumber;
    this.absoluteTurnNumber = s.absoluteTurnNumber;
    this.milliseconds = s.milliseconds;
    this.xpxpThisTurn = s.xpxpThisTurn;
    this.stealthRange = s.stealthRange;
    this.previousPoisonPercent = s.previousPoisonPercent;
    this.upLoc.$cp(s.upLoc);
    this.downLoc.$cp(s.downLoc);
    this.cursorLoc.$cp(s.cursorLoc);
    this.lastTarget = s.lastTarget;
    this.lastItemThrown = s.lastItemThrown;
    this.rewardRoomsGenerated = s.rewardRoomsGenerated;
    this.machineNumber = s.machineNumber;
    $cparr(this.sidebarLocationList, s.sidebarLocationList);
    this.mapToShore = s.mapToShore;
    this.mapToSafeTerrain = s.mapToSafeTerrain;
    this.recording = s.recording;
    this.playbackMode = s.playbackMode;
    this.patchVersion = s.patchVersion;
    this.versionString.set(s.versionString);
    this.currentTurnNumber = s.currentTurnNumber;
    this.howManyTurns = s.howManyTurns;
    this.howManyDepthChanges = s.howManyDepthChanges;
    this.playbackDelayPerTurn = s.playbackDelayPerTurn;
    this.playbackDelayThisTurn = s.playbackDelayThisTurn;
    this.playbackPaused = s.playbackPaused;
    this.playbackFastForward = s.playbackFastForward;
    this.playbackOOS = s.playbackOOS;
    this.playbackOmniscience = s.playbackOmniscience;
    this.playbackBetweenTurns = s.playbackBetweenTurns;
    this.nextAnnotationTurn = s.nextAnnotationTurn;
    this.nextAnnotation.set(s.nextAnnotation);
    this.locationInAnnotationFile = s.locationInAnnotationFile;
    this.gameExitStatusCode = s.gameExitStatusCode;
    this.foodSpawned = s.foodSpawned;
    this.meteredItems = s.meteredItems;
    this.clairvoyance = s.clairvoyance;
    this.stealthBonus = s.stealthBonus;
    this.regenerationBonus = s.regenerationBonus;
    this.lightMultiplier = s.lightMultiplier;
    this.awarenessBonus = s.awarenessBonus;
    this.transference = s.transference;
    this.wisdomBonus = s.wisdomBonus;
    this.reaping = s.reaping;
    this.featRecord = s.featRecord;
    $cpvals(this.wpDistance, s.wpDistance);
    this.wpCount = s.wpCount;
    $cparr(this.wpCoordinates, s.wpCoordinates);
    this.wpRefreshTicker = s.wpRefreshTicker;
    this.cursorPathIntensity = s.cursorPathIntensity;
    this.cursorMode = s.cursorMode;
    this.nextGame = s.nextGame;
    this.nextGamePath.set(s.nextGamePath);
    this.nextGameSeed = s.nextGameSeed;
    this.currentGamePath.set(s.currentGamePath);
    return this;
  }
  $clone(): struct_playerCharacter { return new struct_playerCharacter().$cp(this); }
  static $size = 14368;
  static $layout(): any[] { return [['mode', 0, ['i', 4, 1]], ['depthLevel', 4, ['i', 2, 1]], ['deepestLevel', 6, ['i', 2, 1]], ['disturbed', 8, ['i', 1, 1]], ['gameInProgress', 9, ['i', 1, 1]], ['gameHasEnded', 10, ['i', 1, 1]], ['highScoreSaved', 11, ['i', 1, 1]], ['blockCombatText', 12, ['i', 1, 1]], ['autoPlayingLevel', 13, ['i', 1, 1]], ['automationActive', 14, ['i', 1, 1]], ['justRested', 15, ['i', 1, 1]], ['justSearched', 16, ['i', 1, 1]], ['cautiousMode', 17, ['i', 1, 1]], ['receivedLevitationWarning', 18, ['i', 1, 1]], ['updatedSafetyMapThisTurn', 19, ['i', 1, 1]], ['updatedAllySafetyMapThisTurn', 20, ['i', 1, 1]], ['updatedMapToSafeTerrainThisTurn', 21, ['i', 1, 1]], ['updatedMapToShoreThisTurn', 22, ['i', 1, 1]], ['inWater', 23, ['i', 1, 1]], ['heardCombatThisTurn', 24, ['i', 1, 1]], ['creaturesWillFlashThisTurn', 25, ['i', 1, 1]], ['staleLoopMap', 26, ['i', 1, 1]], ['alreadyFell', 27, ['i', 1, 1]], ['eligibleToUseStairs', 28, ['i', 1, 1]], ['trueColorMode', 29, ['i', 1, 1]], ['hideSeed', 30, ['i', 1, 1]], ['displayStealthRangeMode', 31, ['i', 1, 1]], ['quit', 32, ['i', 1, 1]], ['seed', 40, ['i', 8, 0]], ['RNG', 48, ['i', 2, 1]], ['gold', 56, ['i', 8, 0]], ['goldGenerated', 64, ['i', 8, 0]], ['strength', 72, ['i', 2, 1]], ['monsterSpawnFuse', 74, ['i', 2, 0]], ['weapon', 80, ['p']], ['armor', 88, ['p']], ['ringLeft', 96, ['p']], ['ringRight', 104, ['p']], ['swappedIn', 112, ['p']], ['swappedOut', 120, ['p']], ['flares', 128, ['p']], ['flareCount', 136, ['i', 2, 1]], ['flareCapacity', 138, ['i', 2, 1]], ['yendorWarden', 144, ['p']], ['minersLight', 152, ['r', struct_lightSource]], ['minersLightRadius', 176, ['i', 8, 1]], ['ticksTillUpdateEnvironment', 184, ['i', 2, 1]], ['scentTurnNumber', 186, ['i', 2, 0]], ['playerTurnNumber', 192, ['i', 8, 0]], ['absoluteTurnNumber', 200, ['i', 8, 0]], ['milliseconds', 208, ['i', 8, 1]], ['xpxpThisTurn', 216, ['i', 2, 1]], ['stealthRange', 218, ['i', 2, 1]], ['previousPoisonPercent', 220, ['i', 2, 1]], ['upLoc', 222, ['r', struct_pos]], ['downLoc', 226, ['r', struct_pos]], ['cursorLoc', 230, ['r', struct_pos]], ['lastTarget', 240, ['p']], ['lastItemThrown', 248, ['p']], ['rewardRoomsGenerated', 256, ['i', 2, 1]], ['machineNumber', 258, ['i', 2, 1]], ['sidebarLocationList', 260, ['a', ['r', struct_pos], 68]], ['mapToShore', 536, ['p']], ['mapToSafeTerrain', 544, ['p']], ['recording', 552, ['i', 1, 1]], ['playbackMode', 553, ['i', 1, 1]], ['patchVersion', 554, ['i', 2, 0]], ['versionString', 556, ['a', ['i', 1, 1], 16]], ['currentTurnNumber', 576, ['i', 8, 0]], ['howManyTurns', 584, ['i', 8, 0]], ['howManyDepthChanges', 592, ['i', 2, 1]], ['playbackDelayPerTurn', 594, ['i', 2, 1]], ['playbackDelayThisTurn', 596, ['i', 2, 1]], ['playbackPaused', 598, ['i', 1, 1]], ['playbackFastForward', 599, ['i', 1, 1]], ['playbackOOS', 600, ['i', 1, 1]], ['playbackOmniscience', 601, ['i', 1, 1]], ['playbackBetweenTurns', 602, ['i', 1, 1]], ['nextAnnotationTurn', 608, ['i', 8, 0]], ['nextAnnotation', 616, ['a', ['i', 1, 1], 5000]], ['locationInAnnotationFile', 5616, ['i', 8, 0]], ['gameExitStatusCode', 5624, ['i', 4, 1]], ['foodSpawned', 5632, ['i', 8, 1]], ['meteredItems', 5640, ['p']], ['clairvoyance', 5648, ['i', 2, 1]], ['stealthBonus', 5650, ['i', 2, 1]], ['regenerationBonus', 5652, ['i', 2, 1]], ['lightMultiplier', 5654, ['i', 2, 1]], ['awarenessBonus', 5656, ['i', 2, 1]], ['transference', 5658, ['i', 2, 1]], ['wisdomBonus', 5660, ['i', 2, 1]], ['reaping', 5662, ['i', 2, 1]], ['featRecord', 5664, ['p']], ['wpDistance', 5672, ['a', ['p'], 40]], ['wpCount', 5992, ['i', 2, 1]], ['wpCoordinates', 5994, ['a', ['r', struct_pos], 40]], ['wpRefreshTicker', 6154, ['i', 2, 1]], ['cursorPathIntensity', 6156, ['i', 2, 1]], ['cursorMode', 6158, ['i', 1, 1]], ['nextGame', 6160, ['i', 4, 1]], ['nextGamePath', 6164, ['a', ['i', 1, 1], 4096]], ['nextGameSeed', 10264, ['i', 8, 0]], ['currentGamePath', 10272, ['a', ['i', 1, 1], 4096]]]; }
}

/** struct pos: 4 bytes */
export class struct_pos {
  x: number = 0;
  y: number = 0;
  static $of(...a: any[]): struct_pos {
    const o = new struct_pos();
    const n = a.length;
    if (n > 0) o.x = a[0];
    if (n > 1) o.y = a[1];
    return o;
  }
  $cp(s: struct_pos): this {
    this.x = s.x;
    this.y = s.y;
    return this;
  }
  $clone(): struct_pos { return new struct_pos().$cp(this); }
  static $size = 4;
  static $layout(): any[] { return [['x', 0, ['i', 2, 1]], ['y', 2, ['i', 2, 1]]]; }
}

/** struct ranctx: 16 bytes */
export class struct_ranctx {
  a: number = 0;
  b: number = 0;
  c: number = 0;
  d: number = 0;
  static $of(...a: any[]): struct_ranctx {
    const o = new struct_ranctx();
    const n = a.length;
    if (n > 0) o.a = a[0];
    if (n > 1) o.b = a[1];
    if (n > 2) o.c = a[2];
    if (n > 3) o.d = a[3];
    return o;
  }
  $cp(s: struct_ranctx): this {
    this.a = s.a;
    this.b = s.b;
    this.c = s.c;
    this.d = s.d;
    return this;
  }
  $clone(): struct_ranctx { return new struct_ranctx().$cp(this); }
  static $size = 16;
  static $layout(): any[] { return [['a', 0, ['i', 4, 0]], ['b', 4, ['i', 4, 0]], ['c', 8, ['i', 4, 0]], ['d', 12, ['i', 4, 0]]]; }
}

/** struct randomRange: 6 bytes */
export class struct_randomRange {
  lowerBound: number = 0;
  upperBound: number = 0;
  clumpFactor: number = 0;
  static $of(...a: any[]): struct_randomRange {
    const o = new struct_randomRange();
    const n = a.length;
    if (n > 0) o.lowerBound = a[0];
    if (n > 1) o.upperBound = a[1];
    if (n > 2) o.clumpFactor = a[2];
    return o;
  }
  $cp(s: struct_randomRange): this {
    this.lowerBound = s.lowerBound;
    this.upperBound = s.upperBound;
    this.clumpFactor = s.clumpFactor;
    return this;
  }
  $clone(): struct_randomRange { return new struct_randomRange().$cp(this); }
  static $size = 6;
  static $layout(): any[] { return [['lowerBound', 0, ['i', 2, 1]], ['upperBound', 2, ['i', 2, 1]], ['clumpFactor', 4, ['i', 2, 1]]]; }
}

/** struct rogueEvent: 32 bytes */
export class struct_rogueEvent {
  eventType: number = 0;
  param1: number = 0;
  param2: number = 0;
  controlKey: number = 0;
  shiftKey: number = 0;
  static $of(...a: any[]): struct_rogueEvent {
    const o = new struct_rogueEvent();
    const n = a.length;
    if (n > 0) o.eventType = a[0];
    if (n > 1) o.param1 = a[1];
    if (n > 2) o.param2 = a[2];
    if (n > 3) o.controlKey = a[3];
    if (n > 4) o.shiftKey = a[4];
    return o;
  }
  $cp(s: struct_rogueEvent): this {
    this.eventType = s.eventType;
    this.param1 = s.param1;
    this.param2 = s.param2;
    this.controlKey = s.controlKey;
    this.shiftKey = s.shiftKey;
    return this;
  }
  $clone(): struct_rogueEvent { return new struct_rogueEvent().$cp(this); }
  static $size = 32;
  static $layout(): any[] { return [['eventType', 0, ['i', 4, 1]], ['param1', 8, ['i', 8, 1]], ['param2', 16, ['i', 8, 1]], ['controlKey', 24, ['i', 1, 1]], ['shiftKey', 25, ['i', 1, 1]]]; }
}

/** struct rogueHighScoresEntry: 192 bytes */
export class struct_rogueHighScoresEntry {
  score: number = 0;
  date: Int8Array = new Int8Array(100);
  description: Int8Array = new Int8Array(79);
  static $of(...a: any[]): struct_rogueHighScoresEntry {
    const o = new struct_rogueHighScoresEntry();
    const n = a.length;
    if (n > 0) o.score = a[0];
    if (n > 1) o.date = a[1];
    if (n > 2) o.description = a[2];
    return o;
  }
  $cp(s: struct_rogueHighScoresEntry): this {
    this.score = s.score;
    this.date.set(s.date);
    this.description.set(s.description);
    return this;
  }
  $clone(): struct_rogueHighScoresEntry { return new struct_rogueHighScoresEntry().$cp(this); }
  static $size = 192;
  static $layout(): any[] { return [['score', 0, ['i', 8, 1]], ['date', 8, ['a', ['i', 1, 1], 100]], ['description', 108, ['a', ['i', 1, 1], 79]]]; }
}

/** struct rogueRun: 208 bytes */
export class struct_rogueRun {
  seed: bigint = 0n;
  dateNumber: number = 0;
  result: Int8Array = new Int8Array(79);
  killedBy: Int8Array = new Int8Array(79);
  gold: number = 0;
  lumenstones: number = 0;
  score: number = 0;
  turns: number = 0;
  deepestLevel: number = 0;
  nextRun: struct_rogueRun | null = null;
  static $of(...a: any[]): struct_rogueRun {
    const o = new struct_rogueRun();
    const n = a.length;
    if (n > 0) o.seed = a[0];
    if (n > 1) o.dateNumber = a[1];
    if (n > 2) o.result = a[2];
    if (n > 3) o.killedBy = a[3];
    if (n > 4) o.gold = a[4];
    if (n > 5) o.lumenstones = a[5];
    if (n > 6) o.score = a[6];
    if (n > 7) o.turns = a[7];
    if (n > 8) o.deepestLevel = a[8];
    if (n > 9) o.nextRun = a[9];
    return o;
  }
  $cp(s: struct_rogueRun): this {
    this.seed = s.seed;
    this.dateNumber = s.dateNumber;
    this.result.set(s.result);
    this.killedBy.set(s.killedBy);
    this.gold = s.gold;
    this.lumenstones = s.lumenstones;
    this.score = s.score;
    this.turns = s.turns;
    this.deepestLevel = s.deepestLevel;
    this.nextRun = s.nextRun;
    return this;
  }
  $clone(): struct_rogueRun { return new struct_rogueRun().$cp(this); }
  static $size = 208;
  static $layout(): any[] { return [['seed', 0, ['i', 8, 0]], ['dateNumber', 8, ['i', 8, 1]], ['result', 16, ['a', ['i', 1, 1], 79]], ['killedBy', 95, ['a', ['i', 1, 1], 79]], ['gold', 176, ['i', 4, 1]], ['lumenstones', 180, ['i', 4, 1]], ['score', 184, ['i', 4, 1]], ['turns', 188, ['i', 4, 1]], ['deepestLevel', 192, ['i', 4, 1]], ['nextRun', 200, ['p']]]; }
}

/** struct screenDisplayBuffer: 40800 bytes */
export class struct_screenDisplayBuffer {
  cells: any[] = $arr(100, () => $sarr(struct_cellDisplayBuffer, 34));
  static $of(...a: any[]): struct_screenDisplayBuffer {
    const o = new struct_screenDisplayBuffer();
    const n = a.length;
    if (n > 0) o.cells = a[0];
    return o;
  }
  $cp(s: struct_screenDisplayBuffer): this {
    $cparr(this.cells, s.cells);
    return this;
  }
  $clone(): struct_screenDisplayBuffer { return new struct_screenDisplayBuffer().$cp(this); }
  static $size = 40800;
  static $layout(): any[] { return [['cells', 0, ['a', ['a', ['r', struct_cellDisplayBuffer], 34], 100]]]; }
}

/** struct statusEffect: 108 bytes */
export class struct_statusEffect {
  name: Int8Array = new Int8Array(100);
  isNegatable: number = 0;
  playerNegatedValue: number = 0;
  static $of(...a: any[]): struct_statusEffect {
    const o = new struct_statusEffect();
    const n = a.length;
    if (n > 0) o.name = a[0];
    if (n > 1) o.isNegatable = a[1];
    if (n > 2) o.playerNegatedValue = a[2];
    return o;
  }
  $cp(s: struct_statusEffect): this {
    this.name.set(s.name);
    this.isNegatable = s.isNegatable;
    this.playerNegatedValue = s.playerNegatedValue;
    return this;
  }
  $clone(): struct_statusEffect { return new struct_statusEffect().$cp(this); }
  static $size = 108;
  static $layout(): any[] { return [['name', 0, ['a', ['i', 1, 1], 100]], ['isNegatable', 100, ['i', 1, 1]], ['playerNegatedValue', 104, ['i', 4, 1]]]; }
}

/** struct tcell: 12 bytes */
export class struct_tcell {
  light: Int16Array = new Int16Array(3);
  oldLight: Int16Array = new Int16Array(3);
  static $of(...a: any[]): struct_tcell {
    const o = new struct_tcell();
    const n = a.length;
    if (n > 0) o.light = a[0];
    if (n > 1) o.oldLight = a[1];
    return o;
  }
  $cp(s: struct_tcell): this {
    this.light.set(s.light);
    this.oldLight.set(s.oldLight);
    return this;
  }
  $clone(): struct_tcell { return new struct_tcell().$cp(this); }
  static $size = 12;
  static $layout(): any[] { return [['light', 0, ['a', ['i', 2, 1], 3]], ['oldLight', 6, ['a', ['i', 2, 1], 3]]]; }
}

/** struct tm: 56 bytes */
export class struct_tm {
  tm_sec: number = 0;
  tm_min: number = 0;
  tm_hour: number = 0;
  tm_mday: number = 0;
  tm_mon: number = 0;
  tm_year: number = 0;
  tm_wday: number = 0;
  tm_yday: number = 0;
  tm_isdst: number = 0;
  __tm_gmtoff: number = 0;
  __tm_zone: any = null;
  static $of(...a: any[]): struct_tm {
    const o = new struct_tm();
    const n = a.length;
    if (n > 0) o.tm_sec = a[0];
    if (n > 1) o.tm_min = a[1];
    if (n > 2) o.tm_hour = a[2];
    if (n > 3) o.tm_mday = a[3];
    if (n > 4) o.tm_mon = a[4];
    if (n > 5) o.tm_year = a[5];
    if (n > 6) o.tm_wday = a[6];
    if (n > 7) o.tm_yday = a[7];
    if (n > 8) o.tm_isdst = a[8];
    if (n > 9) o.__tm_gmtoff = a[9];
    if (n > 10) o.__tm_zone = a[10];
    return o;
  }
  $cp(s: struct_tm): this {
    this.tm_sec = s.tm_sec;
    this.tm_min = s.tm_min;
    this.tm_hour = s.tm_hour;
    this.tm_mday = s.tm_mday;
    this.tm_mon = s.tm_mon;
    this.tm_year = s.tm_year;
    this.tm_wday = s.tm_wday;
    this.tm_yday = s.tm_yday;
    this.tm_isdst = s.tm_isdst;
    this.__tm_gmtoff = s.__tm_gmtoff;
    this.__tm_zone = s.__tm_zone;
    return this;
  }
  $clone(): struct_tm { return new struct_tm().$cp(this); }
  static $size = 56;
  static $layout(): any[] { return [['tm_sec', 0, ['i', 4, 1]], ['tm_min', 4, ['i', 4, 1]], ['tm_hour', 8, ['i', 4, 1]], ['tm_mday', 12, ['i', 4, 1]], ['tm_mon', 16, ['i', 4, 1]], ['tm_year', 20, ['i', 4, 1]], ['tm_wday', 24, ['i', 4, 1]], ['tm_yday', 28, ['i', 4, 1]], ['tm_isdst', 32, ['i', 4, 1]], ['__tm_gmtoff', 40, ['i', 8, 1]], ['__tm_zone', 48, ['p']]]; }
}

/** struct windowpos: 4 bytes */
export class struct_windowpos {
  window_x: number = 0;
  window_y: number = 0;
  static $of(...a: any[]): struct_windowpos {
    const o = new struct_windowpos();
    const n = a.length;
    if (n > 0) o.window_x = a[0];
    if (n > 1) o.window_y = a[1];
    return o;
  }
  $cp(s: struct_windowpos): this {
    this.window_x = s.window_x;
    this.window_y = s.window_y;
    return this;
  }
  $clone(): struct_windowpos { return new struct_windowpos().$cp(this); }
  static $size = 4;
  static $layout(): any[] { return [['window_x', 0, ['i', 2, 1]], ['window_y', 2, ['i', 2, 1]]]; }
}
