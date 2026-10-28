"""The terminal the oracle's output is shown on: the subset of a VT100 that the fixed termcap entry
(stub.c) uses. Screens are 24 rows of 80 characters; attributes are not kept (the byte stream is
compared exactly, the screens are for people)."""


class VT:
    def __init__(self, rows=24, cols=80):
        self.rows, self.cols = rows, cols
        self.grid = [[' '] * cols for _ in range(rows)]
        self.y = self.x = 0
        self.bells = 0
        self.esc = None

    def _scroll(self):
        self.grid.pop(0)
        self.grid.append([' '] * self.cols)

    def feed(self, data: bytes):
        for b in data:
            c = chr(b)
            if self.esc is not None:
                self.esc += c
                if self.esc == '[' or (self.esc.startswith('[') and not c.isalpha()):
                    continue
                self._csi(self.esc)
                self.esc = None
                continue
            if c == '\033':
                self.esc = ''
            elif c == '\r':
                self.x = 0
            elif c == '\n':
                self.x = 0  # the tty driver's ONLCR: a newline also returns the carriage
                if self.y == self.rows - 1:
                    self._scroll()
                else:
                    self.y += 1
            elif c == '\b':
                if self.x > 0:
                    self.x -= 1
            elif c == '\007':
                self.bells += 1
            elif c == '\t':
                self.x = min(self.cols - 1, (self.x // 8 + 1) * 8)
            elif b < 32:
                pass
            else:
                if self.x >= self.cols:  # auto margin (am, xn): wrap on the next character
                    self.x = 0
                    if self.y == self.rows - 1:
                        self._scroll()
                    else:
                        self.y += 1
                self.grid[self.y][self.x] = c
                self.x += 1

    def _csi(self, s):
        if not s.startswith('['):
            return
        cmd, args = s[-1], s[1:-1]
        nums = [int(a) if a else 0 for a in args.split(';')] if args else []
        if cmd == 'H':
            r = (nums[0] if nums else 1) or 1
            c = (nums[1] if len(nums) > 1 else 1) or 1
            self.y, self.x = min(r, self.rows) - 1, min(c, self.cols) - 1
        elif cmd == 'J':
            self.grid[self.y][self.x:] = [' '] * (self.cols - self.x)
            for r in range(self.y + 1, self.rows):
                self.grid[r] = [' '] * self.cols
        elif cmd == 'K':
            if self.x < self.cols:
                self.grid[self.y][self.x:] = [' '] * (self.cols - self.x)
        elif cmd == 'A':
            self.y = max(0, self.y - (nums[0] if nums else 1))
        elif cmd == 'B':
            self.y = min(self.rows - 1, self.y + (nums[0] if nums else 1))
        elif cmd == 'C':
            self.x = min(self.cols - 1, self.x + (nums[0] if nums else 1))
        # 'm' (attributes) is ignored

    def lines(self):
        return [''.join(r).rstrip() for r in self.grid]
