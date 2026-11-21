// Big-endian reader for the original's .solid, skeleton and animation files. The original's
// binio format uses "B" (big-endian) everywhere for these files; see re/lugaru/NOTES.md.

export class Reader {
  readonly view: DataView;
  offset = 0;

  constructor(data: ArrayBuffer | Uint8Array) {
    const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
    this.view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  }

  get remaining(): number {
    return this.view.byteLength - this.offset;
  }

  i8(): number {
    const v = this.view.getInt8(this.offset);
    this.offset += 1;
    return v;
  }

  u8(): number {
    const v = this.view.getUint8(this.offset);
    this.offset += 1;
    return v;
  }

  i16(): number {
    const v = this.view.getInt16(this.offset, false);
    this.offset += 2;
    return v;
  }

  u16(): number {
    const v = this.view.getUint16(this.offset, false);
    this.offset += 2;
    return v;
  }

  i32(): number {
    const v = this.view.getInt32(this.offset, false);
    this.offset += 4;
    return v;
  }

  u32(): number {
    const v = this.view.getUint32(this.offset, false);
    this.offset += 4;
    return v;
  }

  f32(): number {
    const v = this.view.getFloat32(this.offset, false);
    this.offset += 4;
    return v;
  }

  bytes(n: number): Uint8Array {
    const v = new Uint8Array(this.view.buffer, this.view.byteOffset + this.offset, n);
    this.offset += n;
    return v;
  }

  skip(n: number): void {
    this.offset += n;
  }
}
