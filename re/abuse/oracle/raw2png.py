"""raw2png.py <frame.raw> <out.png> [scale]: a frame dumped by the oracle (ABUSE_FRAMES; 320x200 palette
indices, then 768 bytes of palette) or by the port's tests, as a PNG for looking at it."""
import struct
import sys
import zlib


def main():
    raw = open(sys.argv[1], 'rb').read()
    scale = int(sys.argv[3]) if len(sys.argv) > 3 else 2
    w, h = 320, 200
    px, pal = raw[:w * h], raw[w * h:w * h + 768]
    rows = []
    for y in range(h):
        line = bytearray()
        for x in range(w):
            c = px[y * w + x]
            line += pal[c * 3:c * 3 + 3] * scale
        rows.append(b'\0' + bytes(line))
    data = b''.join(r for r in rows for _ in range(scale))

    def chunk(t, d):
        return struct.pack('>I', len(d)) + t + d + struct.pack('>I', zlib.crc32(t + d) & 0xffffffff)
    png = b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', w * scale, h * scale, 8, 2, 0, 0, 0))
    png += chunk(b'IDAT', zlib.compress(data, 6)) + chunk(b'IEND', b'')
    open(sys.argv[2], 'wb').write(png)


main()
