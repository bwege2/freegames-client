// The per-class colours of the original (KIKI_COLOR_VALUES in src/base/KikiColorObject.h: a static
// vector of KColors per class, set by name from Python's colour schemes, py/colors.py).
export type KColor = [number, number, number, number];

/** class -> colour names, in the order KIKI_OBJECT_VALUES_n declares them */
const NAMES: Record<string, string[]> = {
  KikiObject: ['base'], KikiTmpObject: ['base'], KikiPushable: ['base'], KikiWorld: ['base', 'plate'],
  KikiWall: ['base', 'plate'], KikiStone: ['base'], KikiWireStone: ['base'], KikiBomb: ['base'],
  KikiBombSplitter: ['base'], KikiSwitch: ['base', 'sphere'], KikiGate: ['base', 'sphere'],
  KikiLight: ['base', 'diffuse', 'specular', 'halo'], KikiBot: ['base'], KikiPlayer: ['base', 'dead', 'tire'],
  KikiMutant: ['base', 'dead', 'tire'], KikiText: ['base', 'bright', 'dark'], KikiGear: ['base'],
  KikiValve: ['base'], KikiGenerator: ['base'], KikiMotorGear: ['base'], KikiMotorCylinder: ['base'],
  KikiWire: ['base', 'light'], KikiSpikes: ['base'], KikiBullet: ['base'], KikiAtom: ['base'],
  KikiMovesAtom: ['base', 'neutron'], KikiValueAtom: ['base', 'neutron'], KikiBotFume: ['base'],
  KikiCellText: ['base'], KikiBillBoard: ['base'],
};

/** the colours are static in the original: they outlive levels and schemes that do not set them */
const COLORS: Record<string, KColor[]> = {};

export function resetColors(): void {
  for (const [cls, names] of Object.entries(NAMES)) COLORS[cls] = names.map(() => [1, 1, 1, 1] as KColor);
}
resetColors();

/** Class::setObjectColor(name, color); KikiWorld's base and plate also set KikiWall's */
export function setObjectColor(cls: string, name: string, c: number[]): void {
  const color: KColor = [c[0], c[1], c[2], c.length > 3 ? c[3] : 1.0];
  if (cls === 'KikiWorld' && (name === 'base' || name === 'plate')) setObjectColor('KikiWall', name, color);
  const names = NAMES[cls];
  if (!names) return;
  const i = names.indexOf(name);
  if (i >= 0) COLORS[cls][i] = color;
}

/** Class::getObjectColor(name) (the base colour if the name is unknown) */
export function colorOf(cls: string, name = 'base'): KColor {
  const names = NAMES[cls];
  const i = names.indexOf(name);
  return [...COLORS[cls][i < 0 ? 0 : i]] as KColor;
}

/** py/colors.py applyColorScheme */
export function applyColorScheme(scheme: Record<string, Record<string, number[]>>): void {
  for (const [cls, cols] of Object.entries(scheme)) {
    for (const [name, c] of Object.entries(cols)) setObjectColor(cls, name, c);
  }
}
