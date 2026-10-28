"""A player for the oracle, for long sessions: python3 -I bot.py SPEC OUT.txt

It plays the oracle live (the keys go through a pipe, NH_KEYS_FIFO in stub.c) and decides every key
from the screen alone, so the keys it typed replay the same in the oracle and in the port. It writes the
session (sessions/*.txt format, drive.py) to OUT.txt.

SPEC is a JSON object:
    seed, login, time      as in a session
    create                 the keys that make the character (e.g. "nvhfny"), or "y" for a random one
    keys                   the most keys of a run (default 3000)
    runs                   a list of runs: {"args": [...], "until": "death" | "keys" | "save" | "quit",
                           "after": N (with "save" or "quit": play N keys, then save with S y, or
                           quit with #quit y), "create": the run's own creation keys, "keys": N}
    seq                    the bot's choices: a number that varies its exploring and item use
The bot explores (breadth-first to the nearest unexplored place), fights what stands next to it, opens
doors and kicks locked ones, goes down stairs when it has seen enough of a level, eats when hungry,
prays when its hit points are low, and now and then uses its things (quaffs, reads, zaps, wears, puts
on, throws, applies, engraves) so that much of the game is played. At the end of a game it answers
"yes" to seeing its possessions and attributes and "no" to the rest, so the tombstone and the record
show."""
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import time as _time

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from run import INSTALL, ORACLE, TIME  # noqa: E402
from vt import VT  # noqa: E402

DIRS = {(-1, 0): 'h', (1, 0): 'l', (0, -1): 'k', (0, 1): 'j', (-1, -1): 'y', (1, -1): 'u', (-1, 1): 'b', (1, 1): 'n'}
MONSTER = re.compile(r"[A-Za-z&;:']")
WALK = set('.#<>{_^"$)[%?!/=*(+,0\\')


class Live:
    """the oracle running, its keys through a pipe"""

    def __init__(self, args, seed, login, files, clock):
        self.dir = tempfile.mkdtemp()
        game = os.path.join(self.dir, 'game')
        shutil.copytree(INSTALL, game)
        for name, data in (files or {}).items():
            p = os.path.join(game, name)
            os.makedirs(os.path.dirname(p), exist_ok=True)
            with open(p, 'wb') as f:
                f.write(data)
        self.game = game
        self.fifo = os.path.join(self.dir, 'keys')
        os.mkfifo(self.fifo)
        self.frames_path = os.path.join(self.dir, 'frames')
        open(self.frames_path, 'w').close()
        home = os.path.join(self.dir, 'home')
        os.mkdir(home)
        env = {
            'PATH': '/usr/bin:/bin', 'HOME': home, 'TERM': 'vt100', 'TZ': 'UTC', 'LANG': 'C',
            'NH_KEYS_FIFO': self.fifo, 'NH_FRAMES': self.frames_path,
            'NH_SEED': str(seed), 'NH_TIME': str(clock), 'NH_LOGIN': login, 'USER': login,
        }
        self.out_path = os.path.join(self.dir, 'out')
        self.out = open(self.out_path, 'wb')
        self.proc = subprocess.Popen([ORACLE, *args], cwd=game, env=env, stdin=subprocess.DEVNULL, stdout=self.out,
                                     stderr=subprocess.DEVNULL)
        self.keys = open(self.fifo, 'wb', buffering=0)
        self.vt = VT()
        self.read_pos = 0
        self.frames_seen = 0
        self.sent = bytearray()
        self.ended = False

    def wait(self):
        """waits for the next frame; returns its kind (K: a key is wanted, X: the program ended)"""
        while True:
            with open(self.frames_path) as f:
                lines = f.read().split('\n')[:-1]  # complete lines only
            done = [ln for ln in lines if ln]
            if len(done) > self.frames_seen:
                kind, _key, off, _rng = done[self.frames_seen].split()
                self.frames_seen += 1
                with open(self.out_path, 'rb') as o:
                    o.seek(self.read_pos)
                    data = o.read(int(off) - self.read_pos)
                self.read_pos = int(off)
                self.vt.feed(data)
                if kind != 'K':
                    self.ended = True
                return kind
            if self.proc.poll() is not None:
                self.ended = True
                return 'X'
            _time.sleep(0.0005)

    def send(self, k):
        self.keys.write(bytes([k]))
        self.sent.append(k)

    def close(self):
        try:
            self.keys.close()
        except BrokenPipeError:
            pass
        self.proc.wait(timeout=60)
        self.out.close()
        files = {}
        for root, _, fs in os.walk(self.game):
            for fn in fs:
                rel = os.path.relpath(os.path.join(root, fn), self.game)
                with open(os.path.join(root, fn), 'rb') as fh:
                    data = fh.read()
                inst = os.path.join(INSTALL, rel)
                if os.path.exists(inst):
                    with open(inst, 'rb') as fh:
                        if fh.read() == data:
                            continue
                files[rel] = data
        shutil.rmtree(self.dir, ignore_errors=True)
        return files


class Brain:
    def __init__(self, spec):
        self.spec = spec
        self.seq = spec.get('seq', 0)
        self.plan = []
        self.n = 0
        self.level_keys = 0
        self.dlvl = None
        self.blocked = set()
        self.last_pos = None
        self.last_move = None
        self.stuck = 0
        self.searches = 0
        self.prayed_at = -2000
        self.descend_after = spec.get('descend_after', 150 + 37 * (self.seq % 5))
        self.locked = None
        self.created = False
        self.dying = False
        self.save_after = None
        self.quit_after = None
        self.use_cycle = 0
        self.visited = set()
        self.searched = {}
        self.down = None
        self.mapped = False
        self.pet = None
        self.last_dir = None
        self.not_this = None
        self.fighting = None
        self.in_shop = 0
        self.shop_steps = 0
        self.wished = 0
        self.toured = 0
        self.menu_target = None
        self.trail = []
        self.wizard_plan = list(spec.get('wizard_keys', []))

    @staticmethod
    def find_hero(lines, vt):
        y, x = vt.y, vt.x
        if 1 <= y <= 21 and x < len(lines[y]) and lines[y][x] == '@':
            return x, y
        for yy in range(1, 22):
            xx = lines[yy].find('@')
            if xx >= 0:
                return xx, yy
        return None

    def keys_for(self, s):
        return [ord(c) for c in s]

    def decide(self, vt):
        lines = [''.join(r) for r in vt.grid]
        text = '\n'.join(lines)
        top = lines[0].rstrip()
        self.n += 1
        if self.plan:
            return self.plan.pop(0)
        # ---- prompts and texts
        if 'Who are you?' in text:
            self.plan = self.keys_for(self.spec.get('name', 'Bot') + '\n')
            return self.plan.pop(0)
        if 'Shall I pick' in text and not self.created:
            self.created = True
            self.plan = self.keys_for(self.spec.get('create', 'y'))
            return self.plan.pop(0)
        if 'Is this ok?' in text:
            return ord('y')
        if 'You die' in text or 'Do you want your possessions identified' in text:
            self.dying = True
        if self.menu_target and re.search(r'Level teleport to where|\(\d+ of \d+\)|\(end\)', text):
            # the wizard's level menu: the letter of the level named, page by page
            for ln in lines:
                m = re.match(r'\s*([a-zA-Z]) - .*?\b' + re.escape(self.menu_target) + r':', ln)
                if m:
                    self.menu_target = None
                    return ord(m.group(1))
            if re.search(r'\((\d+) of (\d+)\)', text):
                return ord('>')
            self.menu_target = None
            return 27
        if '--More--' in text:
            return ord(' ')
        if re.search(r'\(end\)|\(\d+ of \d+\)', text):
            return 27
        if 'Do you want your possessions identified' in top or 'Do you want to see your attributes' in top:
            return ord('y')
        if top.startswith('Do you want') and '[ynq]' in top:
            return ord('n')
        if 'Die?' in top:
            # wizard mode: live on (the bot's wizard dies only when its keys run out)
            self.lives = getattr(self, 'lives', 0) + 1
            if self.lives <= self.spec.get('lives', 0):
                self.dying = False
                return ord('n')
            return ord('y')
        if re.search(r'There (is|are) .* corpses? here; eat (it|one)\?', top):
            return ord('y' if self.spec.get('eat_corpses') and ('Hungry' in text or 'Weak' in text) else 'n')
        if top.startswith('For what do you wish?'):
            wishes = self.spec.get('wishes', [])
            w = wishes[self.wished] if self.wished < len(wishes) else 'blessed fortune cookie'
            self.wished += 1
            self.plan = self.keys_for(w + '\n')
            return self.plan.pop(0)
        if 'To what level do you want to teleport?' in top:
            tour = self.spec.get('tour', [])
            dest = tour[self.toured] if self.toured < len(tour) else str((self.dlvl or 1) + 1)
            self.toured += 1
            if dest.startswith('@'):
                # by the menu ("@minetn"): the branches' levels too
                self.menu_target = dest[1:]
                self.plan = [ord('\n')]
                return ord('?')
            self.plan = self.keys_for(dest + '\n')
            return self.plan.pop(0)
        if 'Really save?' in top or 'Really quit?' in top:
            return ord('y')
        if 'Are you sure you want to pray?' in top:
            return ord('y')
        if 'Really attack' in top:
            self.not_this = self.fighting
            return ord('n')
        if 'Save bones?' in top or 'Get bones?' in top:
            return ord('y' if self.spec.get('bones') else 'n')
        if '[yn' in top or '[ynq' in top:
            return ord('n')
        m = re.search(r'What do you want to (\w+)[^?]*\? \[([^\] ]+)', top)
        if m:
            letters = re.sub(r'[^a-zA-Z]', '', m.group(2).split(' or ')[0])
            if letters and m.group(1) in ('eat', 'quaff', 'read', 'zap', 'wear', 'wield', 'put', 'throw', 'apply', 'drink', 'engrave', 'write'):
                return ord(letters[(self.seq + self.n) % len(letters)] if m.group(1) != 'eat' else letters[0])
            return 27
        if top.startswith('What do you want') or 'In what direction' in top or top.startswith('Call ') or \
                'What do you want to write' in top or 'Where do you want to travel' in top:
            if 'In what direction' in top and self.locked:
                d = self.locked
                self.locked = None
                return ord(DIRS[d])
            if 'In what direction' in top:
                return ord('hjklyubn'[(self.seq + self.n) % 8])
            if 'What do you want to write in the' in top:
                self.plan = self.keys_for('Elbereth\n')
                return self.plan.pop(0)
            return 27
        if vt.y == 0 and top and not top.endswith('.') and len(top) < 79 and ('?' in top or ':' in top):
            return 27
        # ---- the map
        if self.dying:
            return 27
        st = '\n'.join(lines[22:24])
        dm = re.search(r'Dlvl:(\d+)', st)
        hpm = re.search(r'HP:(-?\d+)\((\d+)\)', st)
        if not dm or not hpm:
            return 27
        dlvl = int(dm.group(1))
        if dlvl != self.dlvl:
            self.dlvl = dlvl
            self.level_keys = 0
            self.blocked = set()
            self.searches = 0
            self.visited = set()
            self.searched = {}
            self.down = None
            self.mapped = False
            self.in_shop = 0
            self.shop_steps = 0
        self.level_keys += 1
        hp, hpmax = int(hpm.group(1)), int(hpm.group(2))
        hero = self.find_hero(lines, vt)
        if not hero:
            return ord('s')
        hx, hy = hero
        if self.last_pos == hero and self.last_move:
            self.blocked.add((self.last_pos, self.last_move))
        # going back and forth between two places: that way is closed for now
        self.trail = (self.trail + [hero])[-8:]
        if len(self.trail) == 8 and len(set(self.trail)) == 2 and self.last_move:
            self.blocked.add((hero, self.last_move))
            self.visited |= set(self.trail)
        self.last_pos = hero
        self.last_dir = self.last_move
        self.last_move = None
        for yy in range(1, 22):
            xx = lines[yy].find('>')
            if xx >= 0:
                self.down = (xx, yy)
        if self.save_after is not None and self.n >= self.save_after:
            self.save_after = None
            return ord('S')
        if self.quit_after is not None and self.n >= self.quit_after:
            self.quit_after = None
            self.plan = self.keys_for('quit\n')
            return ord('#')
        if self.spec.get('wizard') and not self.mapped:
            # wizard mode: the level's map (^F) and its hidden doors and traps (^E)
            self.mapped = True
            self.plan = [5]
            return 6
        if 'This door is locked' in top:
            for d in DIRS:
                x, y = hx + d[0], hy + d[1]
                if 0 <= y < 24 and 0 <= x < len(lines[y]) and lines[y][x] == '+':
                    self.locked = d
                    return 4  # ^D: kick
        if (hp < max(6, hpmax // 4)) and self.n - self.prayed_at > 900:
            self.prayed_at = self.n
            self.plan = self.keys_for('pray\n')
            return ord('#')
        if ('Hungry' in st or 'Weak' in st) and self.n % 7 == 0:
            return ord('e')
        # the pet: what we changed places with
        if re.search(r'You swap places with|You stop\.  .* is in the way', top) and self.last_dir:
            x, y = hx - self.last_dir[0], hy - self.last_dir[1]
            c = self.cell(lines, hx, hy) if False else None
            pm = self.cell(lines, x, y)
            if MONSTER.match(pm or ' '):
                self.pet = pm
        # fight what is next to us: by moving into it, or with F when it looks like the pet (a peaceful
        # or tame one asks first, and the bot says no)
        not_this = self.not_this
        self.not_this = None
        for d in DIRS:
            x, y = hx + d[0], hy + d[1]
            if 1 <= y <= 21 and 0 <= x < len(lines[y]) and MONSTER.match(lines[y][x]) and (x, y) != not_this:
                if (hero, d) in self.blocked:
                    continue
                if d[0] and d[1] and (lines[hy][hx] in '+|-' or lines[y][x] in '+|-'):
                    continue
                if lines[y][x] == self.pet:
                    self.fighting = (x, y)
                    self.plan = [ord(DIRS[d])]
                    return ord('F')
                self.last_move = d
                return ord(DIRS[d])
        # a shop: buy something (pick it up and pay), once
        if 'Welcome to' in top and "s " in top:
            self.in_shop = 1
        if self.in_shop == 1:
            if re.search(r'for sale|zorkmids', top) and 'You see here' in top:
                self.in_shop = 2
                self.plan = [ord('p'), ord('y')]
                return ord(',')
            step = self.explore(lines, hero, 'item')
            if step and self.shop_steps < 40:
                self.shop_steps += 1
                self.last_move = step
                return ord(DIRS[step])
            self.in_shop = 2
        # wizard mode, once: the wishes and the level teleports of the spec
        if self.spec.get('wizard') and self.wizard_plan:
            k = self.wizard_plan.pop(0)
            if isinstance(k, str):
                self.plan = self.keys_for(k[1:])
                return ord(k[0])
            return k
        # use things now and then
        if self.n % 37 == 0:
            acts = self.spec.get('acts', 'iqrzWPaEA:\x18tZ\x0f\x10')
            a = acts[(self.use_cycle + self.seq) % len(acts)]
            self.use_cycle += 1
            return ord(a)
        # down the stairs when this level has been seen enough
        want_down = self.level_keys > self.descend_after or (self.spec.get('wizard') and self.level_keys > 40)
        if self.spec.get('wizard') and self.level_keys > self.spec.get('level_keys', 120):
            return 22  # ^V: the next level down
        if want_down and self.down == hero:
            return ord('>')
        if want_down and self.down:
            step = self.explore(lines, hero, 'down')
            if step:
                self.last_move = step
                return ord(DIRS[step])
        # explore: the nearest place next to the unknown that the bot has not stood on
        self.visited.add(hero)
        if self.spec.get('items_first'):
            step = self.explore(lines, hero, 'item')
            if step:
                self.last_move = step
                return ord(DIRS[step])
        step = self.explore(lines, hero, 'frontier')
        if step:
            self.last_move = step
            return ord(DIRS[step])
        if self.down and self.level_keys > 60:
            if self.down == hero:
                return ord('>')
            step = self.explore(lines, hero, 'down')
            if step:
                self.last_move = step
                return ord(DIRS[step])
        # the things lying around (and so into shops)
        if self.spec.get('items', True):
            step = self.explore(lines, hero, 'item')
            if step:
                self.last_move = step
                return ord(DIRS[step])
        # nothing left to see: search at dead ends and walls, a while at each
        if self.searched.get(hero, 0) < 12 and self.deadend(lines, hero):
            self.searched[hero] = self.searched.get(hero, 0) + 1
            return ord('s')
        step = self.explore(lines, hero, 'deadend')
        if step:
            self.last_move = step
            return ord(DIRS[step])
        self.searches += 1
        if self.searches % 7 == 0:
            d = list(DIRS)[(self.searches // 7 + self.seq) % 8]
            self.last_move = d
            return ord(DIRS[d])
        return ord('s')

    @staticmethod
    def cell(lines, x, y):
        if 1 <= y <= 21 and 0 <= x < len(lines[y]):
            return lines[y][x]
        return ' '

    def passable(self, lines, x, y):
        c = self.cell(lines, x, y)
        if c in WALK:
            return True
        if c in '|-':
            # an open door: '|' stands in a horizontal wall (the way through is up and down), '-' in a
            # vertical one; floor or corridor on one side, nothing known against it on the other
            a, b = ((self.cell(lines, x, y - 1), self.cell(lines, x, y + 1)) if c == '|'
                    else (self.cell(lines, x - 1, y), self.cell(lines, x + 1, y)))
            walls = (self.cell(lines, x - 1, y), self.cell(lines, x + 1, y)) if c == '|' else \
                (self.cell(lines, x, y - 1), self.cell(lines, x, y + 1))
            return (a in '.#' or b in '.#') and a not in '|-' and b not in '|-' and all(w in '-|' for w in walls)
        return False

    def deadend(self, lines, p):
        x, y = p
        n = sum(1 for d in DIRS if self.passable(lines, x + d[0], y + d[1]))
        walls = sum(1 for d in DIRS if self.cell(lines, x + d[0], y + d[1]) in '|-')
        return n <= 1 or walls >= 3

    def explore(self, lines, hero, what):
        start = hero
        prev = {start: None}
        queue = [start]
        goal = None
        while queue and not goal:
            nxt = []
            for p in queue:
                x, y = p
                if p != start:
                    c = self.cell(lines, x, y)
                    if what == 'frontier' and p not in self.visited and (c in WALK or c in '|-') and c != '`' and \
                            any(self.cell(lines, x + d[0], y + d[1]) == ' ' for d in DIRS):
                        goal = p
                        break
                    if what == 'deadend' and self.searched.get(p, 0) < 12 and self.deadend(lines, p):
                        goal = p
                        break
                    if what == 'item' and c in ')[%?!/=*(+"' and p not in self.visited:
                        goal = p
                        break
                    if what == 'down' and p == self.down:
                        goal = p
                        break
                for d in DIRS:
                    q = (x + d[0], y + d[1])
                    if q in prev or (p, d) in self.blocked:
                        continue
                    c = self.cell(lines, *q)
                    if not self.passable(lines, *q) or c == '`':
                        continue
                    if d[0] and d[1] and (self.cell(lines, x, y) in '+|-' or c in '+|-'):
                        continue
                    prev[q] = (p, d)
                    nxt.append(q)
            queue = nxt
        if not goal:
            return None
        p = goal
        while prev[p] and prev[p][0] != start:
            p = prev[p][0]
        return prev[p][1]


def play(spec, out_path):
    seed = spec.get('seed', 1)
    login = spec.get('login', 'tester')
    clock = spec.get('time', TIME)
    files = {}
    session = [f'# made by bot.py from {json.dumps(spec)}', f'seed {seed}', f'login {login}', f'time {clock}']
    died_on = None
    for run in spec['runs']:
        over = {k: v for k, v in run.items() if k in ('create', 'seq', 'name', 'tour', 'bones', 'wizard_keys', 'wishes')}
        if run.get('goto_bones') and died_on:
            over['tour'] = [str(died_on)] + over.get('tour', [])
        brain = Brain({**spec, **over})
        if run.get('until') == 'save':
            brain.save_after = run.get('after', 500)
        if run.get('until') == 'quit':
            brain.quit_after = run.get('after', 50)
        live = Live(run.get('args', []), seed, login, files, clock)
        budget = run.get('keys', spec.get('keys', 3000))
        while True:
            kind = live.wait()
            if kind != 'K':
                break
            if len(live.sent) >= budget:
                break
            live.send(brain.decide(live.vt))
        keys = bytes(live.sent)
        files = live.close()
        died_on = brain.dlvl
        session.append('run ' + ' '.join(run.get('args', [])))
        text = ''.join(chr(b) if 33 <= b < 127 and chr(b) not in '\\^' else f'\\x{b:02x}' for b in keys)
        for i in range(0, len(text), 100):
            chunk = text[i:i + 100]
            # never split an escape
            session.append('keys ' + chunk)
        print(f'run: {len(keys)} keys, files {sorted(files)}', file=sys.stderr)
    # fix escapes split across lines: rejoin and re-split on escape boundaries
    with open(out_path, 'w') as f:
        f.write('\n'.join(rejoin(session)) + '\n')


def rejoin(session):
    out = []
    for line in session:
        if line.startswith('keys ') and out and out[-1].startswith('keys ') and re.search(r'\\x?[0-9a-f]?$', out[-1]) and \
                re.search(r'\\(x[0-9a-f]?)?$', out[-1]):
            out[-1] += line[5:]
        else:
            out.append(line)
    # split long lines at safe places
    res = []
    for line in out:
        if not line.startswith('keys ') or len(line) <= 110:
            res.append(line)
            continue
        body = line[5:]
        i = 0
        while i < len(body):
            j = min(len(body), i + 100)
            while j < len(body) and re.match(r'[0-9a-fx]', body[j]) and '\\' in body[max(i, j - 3):j]:
                j += 1
            res.append('keys ' + body[i:j])
            i = j
    return res


if __name__ == '__main__':
    # bot.py SPEC.json|'{...}' OUT.txt, or bot.py --all SPECS.json DIR: every spec of the file (name -> spec)
    if sys.argv[1] == '--all':
        specs = json.loads(open(sys.argv[2]).read())
        only = sys.argv[4:]
        for name, spec in specs.items():
            if only and name not in only:
                continue
            print(name, file=sys.stderr)
            play(spec, os.path.join(sys.argv[3], name + '.txt'))
    else:
        play(json.loads(open(sys.argv[1]).read()) if sys.argv[1].endswith('.json') else json.loads(sys.argv[1]), sys.argv[2])
