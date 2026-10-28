"""wander.py <seed> <last frame> [level]: an oracle session that starts a game (on level <level> with
-f) and runs, jumps, climbs, aims and shoots at random until <last frame>; the oracle tests compare
the port with the original on such sessions (web/games/abuse/test/sessions/wander-*.txt)."""
import random
import sys

seed, last = int(sys.argv[1]), int(sys.argv[2])
level = sys.argv[3] if len(sys.argv) > 3 else None
if level:
    print(f"# args -f levels/level{level}.spe")
print("# home gamma 40")
print("50 key down SPACE\n51 key up SPACE\n134 mouse 300 15\n134 button 1 down\n135 button 1 up")
print("150 mouse 260 95")
f = 160
random.seed(seed)
while f < last:
    k = random.choice(['RIGHT', 'RIGHT', 'RIGHT', 'LEFT', 'UP', 'DOWN'])
    d = random.randint(3, 40)
    print(f"{f} key down {k}")
    if random.random() < 0.5:
        print(f"{f} button 1 down")
        print(f"{f + d} button 1 up")
    if random.random() < 0.3:
        print(f"{f + 1} mouse {random.randint(10, 310)} {random.randint(10, 180)}")
    print(f"{f + d} key up {k}")
    f += d + random.randint(1, 10)
print(f"{f + 20} end")
