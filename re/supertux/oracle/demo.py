#!/usr/bin/env python3
"""The demo file used to compare the port with the original SuperTux 0.6.3.

SuperTux's demo format (src/supertux/game_session_recorder.cpp) is the 23-byte header
`random_seed=<10 digits>\\0` followed by 6 bytes per logical step: left, right, up, down,
jump, action. The sequence below walks, stops, ducks, jumps, shoots and stomps the first snowball
of journey_begins. Usage:

    python3 re/supertux/oracle/demo.py /tmp/demo.dat
    SUPERTUX_TRACE=/tmp/trace.txt SUPERTUX_TRACE_STEPS=640 \\
      /path/to/supertux2 --renderer null --play-demo /tmp/demo.dat \\
      /path/to/SuperTux-v0.6.3-Source/data/levels/world1/journey_begins.stl
"""
import sys

frames = []
def add(n, l=0, r=0, u=0, d=0, j=0, a=0):
    frames.extend(bytes((l, r, u, d, j, a)) for _ in range(n))

add(100, r=1)
add(10, r=1, j=1)
add(60, r=1)
add(60, l=1)
add(10, l=1, j=1)
add(40, l=1)
add(30)
add(20, d=1)
add(10, r=1, a=1)
add(100, r=1)
add(10, r=1, j=1)
add(50, r=1)
add(50, l=1)
add(10, l=1, j=1)
add(80)

out = sys.argv[1] if len(sys.argv) > 1 else 'demo.dat'
with open(out, 'wb') as f:
    f.write(b'random_seed=' + b'         0' + b'\0' + b''.join(frames))
print(f'{len(frames)} frames, {len(frames) * 6 + 23} bytes -> {out}')
