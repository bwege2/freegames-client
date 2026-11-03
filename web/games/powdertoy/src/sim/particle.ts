// simulation/Particle.h: struct Particle. The float fields round every store to binary32 and the int fields
// wrap to 32 bits, as the C++ struct does, so ported code may assign doubles to them.
// C++ copies a Particle by value (`Particle p = parts[i]`, `parts[i] = parts[j]`): use clone() and copyFrom().

export class Particle {
  type = 0;
  private _life = 0;
  private _ctype = 0;
  private _x = 0;
  private _y = 0;
  private _vx = 0;
  private _vy = 0;
  private _temp = 0;
  private _tmp3 = 0;
  private _tmp4 = 0;
  private _flags = 0;
  private _tmp = 0;
  private _tmp2 = 0;
  private _dcolour = 0;

  get life(): number { return this._life; }
  set life(v: number) { this._life = v | 0; }
  get ctype(): number { return this._ctype; }
  set ctype(v: number) { this._ctype = v | 0; }
  get x(): number { return this._x; }
  set x(v: number) { this._x = Math.fround(v); }
  get y(): number { return this._y; }
  set y(v: number) { this._y = Math.fround(v); }
  get vx(): number { return this._vx; }
  set vx(v: number) { this._vx = Math.fround(v); }
  get vy(): number { return this._vy; }
  set vy(v: number) { this._vy = Math.fround(v); }
  get temp(): number { return this._temp; }
  set temp(v: number) { this._temp = Math.fround(v); }
  get tmp3(): number { return this._tmp3; }
  set tmp3(v: number) { this._tmp3 = v | 0; }
  get tmp4(): number { return this._tmp4; }
  set tmp4(v: number) { this._tmp4 = v | 0; }
  get flags(): number { return this._flags; }
  set flags(v: number) { this._flags = v | 0; }
  get tmp(): number { return this._tmp; }
  set tmp(v: number) { this._tmp = v | 0; }
  get tmp2(): number { return this._tmp2; }
  set tmp2(v: number) { this._tmp2 = v | 0; }
  /** unsigned int */
  get dcolour(): number { return this._dcolour; }
  set dcolour(v: number) { this._dcolour = v >>> 0; }

  copyFrom(o: Particle): this {
    this.type = o.type;
    this._life = o._life; this._ctype = o._ctype;
    this._x = o._x; this._y = o._y; this._vx = o._vx; this._vy = o._vy; this._temp = o._temp;
    this._tmp3 = o._tmp3; this._tmp4 = o._tmp4; this._flags = o._flags; this._tmp = o._tmp; this._tmp2 = o._tmp2;
    this._dcolour = o._dcolour;
    return this;
  }

  clone(): Particle {
    return new Particle().copyFrom(this);
  }

  /** Particle{} (all zero) */
  clear(): void {
    this.type = 0;
    this._life = 0; this._ctype = 0; this._x = 0; this._y = 0; this._vx = 0; this._vy = 0; this._temp = 0;
    this._tmp3 = 0; this._tmp4 = 0; this._flags = 0; this._tmp = 0; this._tmp2 = 0; this._dcolour = 0;
  }
}

// indices into Particle::GetProperties (Particle.cpp)
export const FIELD_TYPE = 0;
export const FIELD_LIFE = 1;
export const FIELD_CTYPE = 2;
export const FIELD_TMP = 9;
export const FIELD_TMP2 = 10;
export const FIELD_TMP3 = 11;
export const FIELD_TMP4 = 12;

/** Particle::GetProperties order (Particle.cpp): name and kind */
export const PARTICLE_PROPERTIES: { name: keyof Particle & string; kind: 'int' | 'float' | 'uint' | 'type' }[] = [
  { name: 'type', kind: 'type' },
  { name: 'life', kind: 'int' },
  { name: 'ctype', kind: 'int' },
  { name: 'x', kind: 'float' },
  { name: 'y', kind: 'float' },
  { name: 'vx', kind: 'float' },
  { name: 'vy', kind: 'float' },
  { name: 'temp', kind: 'float' },
  { name: 'flags', kind: 'uint' },
  { name: 'tmp', kind: 'int' },
  { name: 'tmp2', kind: 'int' },
  { name: 'tmp3', kind: 'int' },
  { name: 'tmp4', kind: 'int' },
  { name: 'dcolour', kind: 'uint' },
];
