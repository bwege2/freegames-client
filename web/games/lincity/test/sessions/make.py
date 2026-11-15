#!/usr/bin/env python3
"""Writes the session scripts in this directory (python3 make.py). A script is what the oracle
(re/lincity/oracle/fakex.c) and the port's harness (../harness.ts) play: `seed N`, then lines
`T op args` at virtual time T (ms): move X Y, press B [shift], release B, key K [shift], resize W H,
dump NAME, quit. Coordinates are the original's 640x480 window."""
import os

here = os.path.dirname(os.path.abspath(__file__))

# the icon palette on the left: x, y of each module's button (module_buttons.c, sbut[] order)
B = dict(bulldoze=(40, 88), powerline=(16, 400), solar=(16, 448), substation=(16, 424), residence=(16, 88),
         farm=(16, 112), market=(16, 136), track=(40, 160), coalmine=(16, 328), rail=(40, 376), coalpower=(40, 400),
         road=(40, 304), industryl=(40, 352), university=(16, 352), commune=(16, 160), oremine=(16, 184),
         tip=(16, 208), port=(16, 304), industryh=(16, 376), park=(16, 232), recycle=(40, 424), water=(40, 184),
         health=(40, 328), rocket=(40, 448), windmill=(40, 280), monument=(40, 112), school=(40, 208),
         blacksmith=(40, 232), mill=(16, 280), pottery=(40, 136), firestation=(40, 256), cricket=(16, 256))
RANDOM_VILLAGE = (281, 314)
BARE_BOARD = (281, 333)
LOAD_SCENE = (281, 293)
GOOD_TIMES = (281, 60)
BAD_TIMES = (281, 130)
MENU = (28, 12)
MENU_LOAD = (281, 154)
STATS = (28, 60)
PAUSE, SLOW, FAST = (70, 422), (70, 438), (70, 470)
MINI_MAP_MODE = (518, 288)


class S:
    def __init__(self, seed):
        self.t = 0
        self.lines = [f'seed {seed}']

    def at(self, dt, s):
        self.t += dt
        self.lines.append(f'{self.t} {s}')

    def click(self, x, y, b=1, dt=100):
        self.at(dt, f'move {x} {y}')
        self.at(10, f'press {b}')
        self.at(10, f'release {b}')

    @staticmethod
    def tile(tx, ty):
        return 65 + 16 * tx + 8, 8 + 16 * ty + 8

    def place(self, tx, ty, dt=100):
        self.click(*self.tile(tx, ty), dt=dt)

    def drag(self, a, b):
        self.at(100, 'move %d %d' % self.tile(*a))
        self.at(10, 'press 1')
        n = max(abs(b[0] - a[0]), abs(b[1] - a[1]))
        for i in range(1, n + 1):
            self.at(20, 'move %d %d' % self.tile(a[0] + (b[0] - a[0]) * i // n, a[1] + (b[1] - a[1]) * i // n))
        self.at(50, 'release 1')

    def key(self, k, dt=50):
        self.at(dt, f'key {k}')

    def type(self, text, dt=30):
        for c in text:
            self.key('Space' if c == ' ' else c, dt)

    def wait(self, dt, n=0):
        # the pointer moves a little over the status line, where a click does nothing
        self.at(dt, f'move 300 {445 + n % 3}')

    def dump(self, name):
        self.at(100, f'dump {name}')

    def sel(self, name, help=True):
        self.click(*B[name], dt=150)
        if help:  # the module's help page, shown the first time
            self.key('Escape', 200)

    def write(self, name, what):
        with open(os.path.join(here, f'{name}.txt'), 'w') as f:
            f.write(f'# {what}\n' + '\n'.join(self.lines) + f'\n{self.t + 100} quit\n')


def splash():
    s = S(42)
    s.dump('start')
    s.at(2000 - 100, 'key Space')
    s.wait(2000)
    s.dump('opening')
    s.write('splash', 'the splash screen, then the opening page')


def village():
    s = S(1234)
    s.key('Space', 500)
    s.click(*RANDOM_VILLAGE, dt=500)
    s.click(*FAST, dt=400)
    for i, dt in enumerate((300, 2000, 4000, 4000)):
        s.wait(dt, i)
        s.dump(f'v{i}')
    s.write('village', 'a random village on fast for a few years')


def build():
    s = S(5)
    s.key('Space', 500)
    s.click(*BARE_BOARD, dt=500)
    s.key('m', 400)
    s.key('y', 200)  # test mode: yes
    for _ in range(100):
        s.key('T', 5)
    for _ in range(40):
        s.key('m', 5)
    s.dump('cheats')
    s.wait(3000)
    s.dump('wait')
    for _ in range(40):  # "you have reached the tech level ..." for every module
        s.key('Space', 150)
    s.dump('popups')
    s.sel('residence', False)
    s.click(170, 152, dt=200)  # the residence chooser: low birth, high death
    s.place(0, 0)
    s.sel('farm'); s.place(3, 0)
    s.sel('market'); s.place(7, 0)
    s.sel('commune'); s.place(0, 4)
    s.sel('oremine'); s.place(4, 4)
    s.sel('coalmine'); s.place(8, 4)
    s.dump('build1')
    s.sel('coalpower'); s.place(0, 8)
    s.sel('windmill'); s.place(4, 8)
    s.sel('school'); s.place(6, 8)
    s.sel('university'); s.place(8, 8)
    s.sel('industryl'); s.place(0, 12)
    s.sel('industryh'); s.place(3, 12)
    s.sel('pottery'); s.place(7, 12)
    s.sel('blacksmith'); s.place(9, 12)
    s.sel('mill'); s.place(7, 14)
    s.sel('health'); s.place(0, 16)
    s.sel('firestation'); s.place(2, 16)
    s.sel('cricket'); s.place(4, 16)
    s.sel('park'); s.place(6, 16)
    s.sel('tip'); s.place(0, 19)
    s.sel('recycle'); s.place(4, 19)
    s.sel('monument'); s.place(6, 19)
    s.sel('solar'); s.place(8, 16)
    s.dump('build2')
    s.sel('track', False); s.drag((0, 24), (10, 24))
    s.sel('road'); s.drag((10, 24), (10, 20)); s.drag((20, 10), (26, 10))
    s.sel('rail'); s.drag((20, 12), (26, 12))
    s.sel('powerline'); s.drag((12, 6), (12, 20)); s.drag((12, 6), (10, 6))
    s.sel('substation'); s.place(10, 10)
    s.sel('water'); s.place(13, 5)
    s.sel('port'); s.place(14, 14)
    s.sel('rocket'); s.place(22, 2)
    s.dump('build3')
    s.click(*FAST, dt=200)
    s.wait(5000); s.dump('fast1')
    s.wait(10000, 1); s.dump('fast2')
    s.sel('bulldoze'); s.place(6, 16); s.place(4, 4); s.key('y', 200); s.dump('bulldoze')
    s.key('f', 300); s.wait(3000); s.dump('fire')
    for i in range(9):
        s.click(*MINI_MAP_MODE, dt=300)
        s.dump(f'mini{i}')
    s.wait(20000, 2); s.dump('fast3')
    s.write('build', 'a bare board in test mode: every module built, transport dragged, bulldozing, fire, '
            'the mini map modes, three decades on fast')


def ui():
    s = S(11)
    s.key('Space', 500)
    s.click(*RANDOM_VILLAGE, dt=500)
    s.wait(1500); s.dump('village')
    s.click(*MENU, dt=200); s.wait(300); s.dump('menu')
    s.key('Escape', 200); s.wait(300); s.dump('menu_closed')
    s.key('h', 200); s.wait(300); s.dump('help')
    s.key('Escape', 200)
    s.click(*STATS, dt=200); s.wait(300); s.dump('stats')
    s.key('Space', 300); s.wait(300); s.dump('stats_closed')
    s.key('o', 200); s.wait(300); s.dump('prefs')
    s.click(122, 43, dt=200); s.click(122, 59, dt=200); s.wait(300); s.dump('prefs_toggled')
    s.click(448, 400, dt=200); s.wait(300); s.dump('prefs_closed')
    s.key('h', 200); s.click(339, 193, dt=300); s.wait(300); s.dump('help_keyboard')
    s.click(448, 400, dt=200); s.wait(300); s.dump('help_out')
    s.click(184, 166, dt=300); s.wait(300); s.dump('market')
    s.click(140, 120, b=3, dt=300); s.wait(300); s.dump('rightclick')
    s.click(560, 330, dt=300); s.wait(300); s.dump('minimap_moved')
    s.click(*PAUSE, dt=200); s.wait(2000); s.dump('paused')
    s.click(*SLOW, dt=200); s.wait(3000); s.dump('slow')
    s.key('v', 200); s.wait(300); s.dump('rotated')
    s.write('ui', 'the menu, help pages, statistics, preferences, a market, the mini map, pause and slow')


def saveload():
    s = S(23)
    s.key('Space', 500)
    s.click(*RANDOM_VILLAGE, dt=500)
    s.click(*FAST, dt=300)
    s.wait(4000); s.dump('before_save')
    s.key('s', 200); s.wait(300); s.dump('save_menu')
    s.key('1', 200); s.wait(300); s.dump('save_comment')
    s.type('my town'); s.key('Return'); s.wait(500); s.dump('saved')
    s.key('s', 200); s.key('2', 200); s.type('second'); s.key('Return'); s.wait(500)
    s.wait(6000); s.dump('later')
    s.key('l', 200); s.wait(300); s.dump('load_menu')
    s.key('1', 200); s.wait(300); s.dump('load_ask')
    s.key('y', 200); s.wait(500); s.dump('loaded')
    s.wait(3000); s.dump('loaded_later')
    s.click(*MENU, dt=200); s.click(*MENU_LOAD, dt=300); s.wait(300); s.dump('menu_load')
    s.click(*GOOD_TIMES, dt=300); s.wait(300); s.dump('good_times_ask')
    s.key('y', 200); s.wait(1000); s.dump('good_times')
    s.wait(4000); s.dump('good_times_later')
    s.click(*MENU, dt=200); s.click(*MENU_LOAD, dt=300); s.click(*BAD_TIMES, dt=300); s.key('y', 200)
    s.wait(1000); s.dump('bad_times')
    s.wait(4000); s.dump('bad_times_later')
    s.write('saveload', 'saving two scenes, loading one back, the built-in scenes good_times and bad_times')


def resize():
    s = S(31)
    s.key('Space', 500)
    s.click(*RANDOM_VILLAGE, dt=500)
    s.wait(1000); s.dump('small')
    s.at(200, 'resize 800 600'); s.wait(500); s.dump('big')
    s.click(600, 420, dt=300); s.wait(300); s.dump('big_click')
    s.at(200, 'resize 1024 768'); s.wait(500); s.dump('bigger')
    s.at(200, 'resize 640 480'); s.wait(500); s.dump('back')
    s.write('resize', 'resizing the window: the main view grows with it')


def long():
    s = S(47)
    s.key('Space', 500)
    s.click(*LOAD_SCENE, dt=500)
    s.click(*GOOD_TIMES, dt=300)
    s.click(*FAST, dt=1000)
    for i in range(6):
        s.wait(10000, i)
        s.dump(f'y{i:02d}')
    s.write('long', 'good_times.scn on fast for half a century')


for f in (splash, village, build, ui, saveload, resize, long):
    f()
