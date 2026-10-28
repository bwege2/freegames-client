// The terminal NetHack writes to: the part of a VT100 that the terminal entry (rt/termcap.ts) uses,
// 80x24, auto margins. Cells keep the attributes (bold, reverse, underline, blink). The browser shows
// the cells on the SDK's TextScreen; the tests compare the byte stream and show screens on mismatch.
// The oracle's re/nethack/oracle/vt.py is the same terminal.
export const A_BOLD = 1, A_REVERSE = 2, A_UNDERLINE = 4, A_BLINK = 8;

export class VT {
  readonly rows: number;
  readonly cols: number;
  chars: string[][];
  attrs: number[][];
  y = 0;
  x = 0;
  attr = 0;
  bells = 0;
  private esc: string | null = null;

  constructor(rows = 24, cols = 80) {
    this.rows = rows;
    this.cols = cols;
    this.chars = Array.from({ length: rows }, () => new Array(cols).fill(' '));
    this.attrs = Array.from({ length: rows }, () => new Array(cols).fill(0));
  }

  private scroll(): void {
    this.chars.shift();
    this.attrs.shift();
    this.chars.push(new Array(this.cols).fill(' '));
    this.attrs.push(new Array(this.cols).fill(0));
  }

  private clearFrom(y: number, x: number): void {
    for (let c = x; c < this.cols; c++) {
      this.chars[y][c] = ' ';
      this.attrs[y][c] = 0;
    }
  }

  feed(bytes: ArrayLike<number>): void {
    for (let i = 0; i < bytes.length; i++) this.byte(bytes[i] & 255);
  }

  private byte(b: number): void {
    const c = String.fromCharCode(b);
    if (this.esc !== null) {
      this.esc += c;
      if (this.esc === '[' || (this.esc.startsWith('[') && !/[A-Za-z]/.test(c))) return;
      this.csi(this.esc);
      this.esc = null;
      return;
    }
    if (b === 27) this.esc = '';
    else if (b === 13) this.x = 0;
    else if (b === 10) {
      // the tty driver's ONLCR: a newline also returns the carriage
      this.x = 0;
      if (this.y === this.rows - 1) this.scroll();
      else this.y++;
    } else if (b === 8) {
      if (this.x > 0) this.x--;
    } else if (b === 7) this.bells++;
    else if (b === 9) this.x = Math.min(this.cols - 1, (Math.floor(this.x / 8) + 1) * 8);
    else if (b >= 32) {
      if (this.x >= this.cols) {
        this.x = 0;
        if (this.y === this.rows - 1) this.scroll();
        else this.y++;
      }
      this.chars[this.y][this.x] = c;
      this.attrs[this.y][this.x] = this.attr;
      this.x++;
    }
  }

  private csi(s: string): void {
    if (!s.startsWith('[')) return;
    const cmd = s[s.length - 1];
    const args = s.slice(1, -1);
    const nums = args ? args.split(';').map((a) => (a ? parseInt(a, 10) : 0)) : [];
    const n1 = nums[0] || 1;
    switch (cmd) {
      case 'H':
      case 'f':
        this.y = Math.min(nums[0] || 1, this.rows) - 1;
        this.x = Math.min(nums[1] || 1, this.cols) - 1;
        break;
      case 'J':
        this.clearFrom(this.y, Math.min(this.x, this.cols));
        for (let r = this.y + 1; r < this.rows; r++) this.clearFrom(r, 0);
        break;
      case 'K':
        if (this.x < this.cols) this.clearFrom(this.y, this.x);
        break;
      case 'A':
        this.y = Math.max(0, this.y - n1);
        break;
      case 'B':
        this.y = Math.min(this.rows - 1, this.y + n1);
        break;
      case 'C':
        this.x = Math.min(this.cols - 1, this.x + n1);
        break;
      case 'D':
        this.x = Math.max(0, this.x - n1);
        break;
      case 'm':
        if (!nums.length) this.attr = 0;
        for (const v of nums.length ? nums : [0]) {
          if (v === 0) this.attr = 0;
          else if (v === 1) this.attr |= A_BOLD;
          else if (v === 4) this.attr |= A_UNDERLINE;
          else if (v === 5) this.attr |= A_BLINK;
          else if (v === 7) this.attr |= A_REVERSE;
        }
        break;
    }
  }

  lines(): string[] {
    return this.chars.map((r) => r.join('').replace(/\s+$/, ''));
  }

  text(): string {
    return this.lines().join('\n');
  }
}
