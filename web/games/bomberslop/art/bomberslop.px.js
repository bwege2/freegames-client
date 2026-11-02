// Bomberslop: GPL-3.0-or-later (web/games/bomberslop/LICENSE.md).
// Every picture of Bomberslop, drawn as code for pxl (https://github.com/augusto-scarvalho/claude-pxl, MIT), the
// pixel-art tool made for AI agents: an AI (Claude) wrote this file and looked at what pxl rendered of it until it
// was right. art/build.sh renders it into assets/sprites.png and assets/sprites.json. Nothing here comes from
// ClanBomber's pictures: the slop blobs, jelly bombs, soup splashes, canteen tiles, the plates of extras, the Ladle
// and the letters are Bomberslop's own.

pal({
  k: "#1a1423", w: "#fbf7ef", q: "#cfc8bb",
  // the four blobs: dark, body, light, shine (Gloop is the neutral a-d; the others swap to theirs)
  a: "#245a2a", b: "#4c9a3a", c: "#86cf55", d: "#d0f39a",
  E: "#7a2050", F: "#c4467a", G: "#ef85a9", H: "#ffd0e0",
  I: "#6e4d10", J: "#bf8f1f", K: "#ecc84b", L: "#fff1a6",
  M: "#2b2766", N: "#4d47b0", O: "#8189e8", P: "#c9ceff",
  y: "#ffe14d", z: "#4fd2e6",
  // hot soup
  r: "#6e1610", s: "#c8321a", t: "#f2761e", u: "#ffc83a", v: "#fff4c8",
  // steel, canteen floor, crates, a green stain
  e: "#2e3646", f: "#4f5d73", g: "#7b8ca3", h: "#b7c6d6",
  i: "#d8d0bf", j: "#c4b9a3", l: "#a99c84",
  m: "#5c3820", n: "#8c5a30", o: "#b98447", p: "#dcae70", x: "#7fae3a",
  // the drain, ice, the belt, the grease trap
  Q: "#0d0a12", R: "#2a2233", S: "#bfe8f5", T: "#e8fbff", U: "#8cc7dd",
  V: "#f2a516", W: "#6b4b0e", X: "#3b3346", Y: "#5e5470", Z: "#8fa66a",
  // the cellar's floor and walls, the fridge's walls
  1: "#6d6352", 2: "#5a5143", 3: "#463e33", 4: "#3a4a5a", 5: "#56708a", 6: "#9fbfd6", 7: "#e2f2fb",
  8: "#7a3b2a", 9: "#a65a3c",
})
ramps("kabcd", "kEFGH", "kIJKL", "kMNOP", "rstuv", "efgh", "lji", "mnop")

// ---------------------------------------------------------------- the blobs
// 14 x 16 before the outline (16 x 18 after). Rows 0-1 stay clear for what a blob wears on top.
const BODY = {
  down: [`
..............
..............
......bb......
....bbccbb....
...bccccccb...
..bcdccccccb..
..bcwwccwwcb..
.bccwkccwkccb.
.bccwkccwkccb.
.bccccccccccb.
.bbcccaacccbb.
abbbccccccbbba
abbbbbbbbbbbba
.aabbbbbbbbaa.
..aaaaaaaaaa..
..............`, `
..............
..............
..............
.....bbbb.....
...bbccccbb...
..bcdccccccb..
.bccwwccwwccb.
.bccwkccwkccb.
bcccwkccwkcccb
bccccccccccccb
bbbcccaaacccbb
abbbbccccbbbba
abbbbbbbbbbbba
aabbbbbbbbbbaa
.aaaaaaaaaaaa.
..............`],
  left: [`
..............
..............
......bb......
....bbccbb....
...bccccccb...
..bcdccccccb..
..bwwcwwcccb..
.bkwckwccccbb.
.bkwckwccccbb.
.bcccccccccbb.
.baacccccccbb.
abbcccccccbbba
abbbbbbbbbbbba
.aabbbbbbbbaa.
..aaaaaaaaaa..
..............`, `
..............
..............
..............
.....bbbb.....
...bbccccbb...
..bcdccccccb..
.bwwcwwccccbb.
.kwckwcccccbb.
bkwckwcccccbbb
bccccccccccbbb
baaaccccccccbb
abbbbccccbbbba
abbbbbbbbbbbba
aabbbbbbbbbbaa
.aaaaaaaaaaaa.
..............`],
  up: [`
..............
..............
......bb......
....bbccbb....
...bccccccb...
..bcccccdccb..
..bcccccccdb..
.bccccccccccb.
.bccccccccccb.
.bbccccccccbb.
.bbbccccccbbb.
abbbbbbbbbbbba
abbbbbbbbbbbba
.aabbbbbbbbaa.
..aaaaaaaaaa..
..............`, `
..............
..............
..............
.....bbbb.....
...bbccccbb...
..bccccdcccb..
.bcccccccdccb.
.bccccccccccb.
bcccccccccccbb
bbccccccccccbb
bbbbccccccbbbb
abbbbbbbbbbbba
abbbbbbbbbbbba
aabbbbbbbbbbaa
.aaaaaaaaaaaa.
..............`],
}

// what each blob wears, drawn over the top of the body (dy: the pose's top moves)
const HATS = [
  // Gloop: a drip curling up
  (dy) => grid(5, 0 + dy, `
..cd
.cb.
.b..`),
  // Mush: sprinkles
  (dy) => grid(3, 4 + dy, `
.y.....z
......y.
z.......
....z...`),
  // Gruel: a cook's hat
  (dy) => grid(3, -1 + dy, `
..wwwwww..
.wwwwwwwww
.qwwqwwqww
..qqqqqqq.`),
  // Sludge: three spikes
  (dy) => grid(3, 0 + dy, `
..b..b..b.
.bcbbcbbcb`),
]
const SWAPS = [
  {},
  { a: "E", b: "F", c: "G", d: "H" },
  { a: "I", b: "J", c: "K", d: "L" },
  { a: "M", b: "N", c: "O", d: "P" },
]

for (let n = 0; n < 4; n++) {
  for (const dir of ["down", "left", "up"]) {
    const [stand, squash] = BODY[dir]
    // pose 0 stands, 1 squashes, 2 hops a pixel up
    sprite(`_p${n}_${dir}_0`, { w: 14, h: 16 }, grid(0, 0, stand), HATS[n](0))
    sprite(`_p${n}_${dir}_1`, { w: 14, h: 16 }, grid(0, 0, squash), HATS[n](1))
    sprite(`_p${n}_${dir}_2`, { w: 14, h: 16 }, grid(0, -1, stand), HATS[n](-1))
    for (let pose = 0; pose < 3; pose++) {
      sprite(`p${n}_${dir}_${pose}`, { w: 14, h: 16, outline: "k", swap: SWAPS[n] }, stamp(`_p${n}_${dir}_${pose}`, 0, 0))
    }
  }
  for (let pose = 0; pose < 3; pose++) {
    sprite(`p${n}_right_${pose}`, { base: `p${n}_left_${pose}`, flip: "x" })
  }
  // what is left of a blob: a puddle with its eyes crossed out
  sprite(`puddle_${n}`, { outline: "k", swap: SWAPS[n] }, `
..............
..............
..............
..............
..............
..............
..............
.....bbbbb....
...bbccccbbb..
..bccdckckcb..
.bccccckckcbb.
abcccccccccbba
.abbcccbbbbbaa
..aaabbbaaaa..
.....aaa......
..............`)
  // drops of it, flying
  sprite(`drop_${n}_0`, { swap: SWAPS[n] }, `
.bb.
bcdb
bccb
.bb.`)
  sprite(`drop_${n}_1`, { swap: SWAPS[n] }, `
..b.
.bcb
bcdb
.bb.`)
  sprite(`drop_${n}_2`, { swap: SWAPS[n] }, `
.b..
bcb.
bccb
.bbb`)
  sprite(`drop_${n}_3`, { swap: SWAPS[n] }, `
....
.bb.
bcdb
.bb.`)
}

// ---------------------------------------------------------------- jelly bombs
// a wobbling jelly pudding on a saucer, a wick on top; tinted like the blob that laid it
const BOMB = [`
......y.......
......t.......
......m.......
....bbbbbb....
...bccccccb...
..bcdcccccab..
..bcdccccccb..
..bccccccccb..
..abccccccba..
...abbbbbba...
.qqwwwwwwwwqq.
..qqqqqqqqqq..`, `
..............
......u.......
......m.......
.....bbbbb....
...bbccccbbb..
..bcdccccccb..
.bcdcccccccab.
.bcccccccccab.
..abcccccbba..
...aabbbbaa...
.qqwwwwwwwwqq.
..qqqqqqqqqq..`, `
.....u.y......
......t.......
......m.......
....bbbbbb....
...bccccccb...
..bcdcccccab..
..bcdccccccb..
..bccccccccb..
..abccccccba..
...abbbbbba...
.qqwwwwwwwwqq.
..qqqqqqqqqq..`, `
..............
......y.......
......m.......
....bbbbbbb...
..bbcccccccb..
.bcdcccccccab.
.bcdcccccccab.
.abcccccccbba.
..aabbbbbbaa..
....aaaaaa....
.qqwwwwwwwwqq.
..qqqqqqqqqq..`]
for (let n = 0; n < 4; n++) {
  for (let f = 0; f < 4; f++) sprite(`bomb_${n}_${f}`, { w: 14, h: 12, outline: "k", swap: SWAPS[n] }, grid(0, 0, BOMB[f]))
}

// ---------------------------------------------------------------- soup splashes (explosions)
// phase 0 the fullest, 1 half, 2 a trickle; pieces: x the middle, h and v the arms, l r u d the ends
const SPLASH_W = [7, 5, 3] // half the width of an arm
function band(c, horizontal, from, to, w, wobble) {
  for (let i = from; i < to; i++) {
    const ww = w + ((i * 7 + wobble) % 3 === 0 ? 1 : 0)
    for (let k = -ww; k < ww; k++) {
      const a = Math.abs(k + 0.5)
      const key = a < ww * 0.35 ? "v" : a < ww * 0.6 ? "u" : a < ww * 0.85 ? "t" : "s"
      if (horizontal) c.px(i, 8 + k, key)
      else c.px(8 + k, i, key)
    }
  }
}
for (let ph = 0; ph < 3; ph++) {
  const w = SPLASH_W[ph]
  sprite(`ex_h_${ph}`, { w: 16, h: 16 }, (c) => band(c, true, 0, 16, w, ph))
  sprite(`ex_v_${ph}`, { w: 16, h: 16 }, (c) => band(c, false, 0, 16, w, ph))
  sprite(`ex_x_${ph}`, { w: 16, h: 16 }, (c) => {
    band(c, true, 0, 16, w, ph)
    band(c, false, 0, 16, w, ph + 1)
    c.circ(8, 8, w + 1, "t")
    c.circ(8, 8, w, "u")
    c.circ(8, 8, Math.max(1, w - 2), "v")
    // bubbles
    c.px(3, 3, "u"); c.px(12, 2, "t"); c.px(13, 12, "u"); c.px(2, 12, "t")
  })
  // an end: the band rounds off into a splash with drops
  sprite(`ex_r_${ph}`, { w: 16, h: 16 }, (c) => {
    band(c, true, 0, 9, w, ph)
    c.circ(8, 8, w, "s")
    c.circ(8, 8, Math.max(0, w - 1), "t")
    c.circ(7, 8, Math.max(0, w - 3), "u")
    c.px(14, 8 - w, "t"); c.px(15, 8 + w - 1, "s"); c.px(13, 3, "u")
  })
  sprite(`ex_l_${ph}`, { base: `ex_r_${ph}`, flip: "x" })
  sprite(`ex_d_${ph}`, { base: `ex_r_${ph}`, rot: 90 })
  sprite(`ex_u_${ph}`, { base: `ex_r_${ph}`, rot: 270 })
}

// ---------------------------------------------------------------- the arena's tiles
// themes: canteen (Canteen, Conveyor, Grease_Trap), fridge (Fridge), cellar (Drain, Pantry)
sprite("floor_canteen", { w: 16, h: 16 }, (c) => {
  c.rect(0, 0, 8, 8, "i"); c.rect(8, 0, 8, 8, "j"); c.rect(0, 8, 8, 8, "j"); c.rect(8, 8, 8, 8, "i")
  c.hline(0, 7, 16, "l"); c.hline(0, 15, 16, "l"); c.vline(7, 0, 16, "l"); c.vline(15, 0, 16, "l")
  c.px(3, 2, "w"); c.px(11, 10, "w"); c.px(12, 4, "l"); c.px(2, 12, "l")
})
sprite("floor_fridge", { base: "floor_canteen", swap: { i: "7", j: "S", l: "6", w: "T" } })
sprite("floor_cellar", { w: 16, h: 16 }, (c) => {
  // flagstones, offset every other row
  c.rect(0, 0, 16, 16, "2")
  c.rect(0, 0, 10, 7, "1"); c.rect(11, 0, 5, 7, "1"); c.rect(0, 8, 4, 7, "1"); c.rect(5, 8, 11, 7, "1")
  c.px(2, 2, "l"); c.px(7, 11, "l"); c.px(13, 4, "3"); c.px(9, 13, "3")
})

sprite("wall_canteen", { w: 16, h: 16 }, (c) => {
  // a steel counter: lit top, darker front
  c.rect(0, 0, 16, 16, "f")
  c.rect(0, 0, 16, 11, "g")
  c.hline(0, 0, 16, "h"); c.vline(0, 0, 11, "h")
  c.hline(2, 3, 11, "h"); c.hline(3, 6, 10, "f")
  c.hline(0, 10, 16, "e"); c.vline(15, 0, 11, "f")
  c.rect(0, 11, 16, 5, "f"); c.hline(0, 15, 16, "e")
  c.px(2, 13, "e"); c.px(13, 13, "e"); c.px(2, 12, "g"); c.px(13, 12, "g")
})
sprite("wall_fridge", { base: "wall_canteen", swap: { e: "4", f: "5", g: "6", h: "7" } })
sprite("wall_cellar", { w: 16, h: 16 }, (c) => {
  // bricks
  c.rect(0, 0, 16, 16, "8")
  c.rect(0, 0, 16, 11, "9")
  for (const [x, y, w] of [[0, 0, 7], [8, 0, 8], [0, 4, 3], [4, 4, 8], [13, 4, 3], [0, 8, 7], [8, 8, 8]]) {
    c.rect(x, y, w, 3, "9"); c.hline(x, y, w, "o")
  }
  c.hline(0, 3, 16, "8"); c.hline(0, 7, 16, "8"); c.hline(0, 10, 16, "m")
  c.rect(0, 11, 16, 5, "8"); c.hline(0, 15, 16, "m"); c.vline(7, 11, 4, "m")
})

sprite("box_canteen", { w: 16, h: 16 }, (c) => {
  // a cardboard crate of slop cans, taped, with a green stain
  c.rect(0, 0, 16, 16, "m")
  c.rect(1, 1, 14, 9, "o"); c.hline(1, 1, 14, "p")
  c.rect(7, 1, 2, 9, "p"); c.vline(7, 1, 9, "n")
  c.rect(1, 11, 14, 4, "n"); c.hline(1, 11, 14, "o")
  c.px(3, 12, "x"); c.px(4, 12, "x"); c.px(4, 13, "x"); c.px(11, 13, "x"); c.px(3, 5, "n"); c.px(12, 7, "n")
})
sprite("box_fridge", { w: 16, h: 16 }, (c) => {
  // a block of frozen peas
  c.rect(0, 0, 16, 16, "4")
  c.rect(1, 1, 14, 9, "S"); c.hline(1, 1, 14, "T")
  for (const [x, y] of [[3, 3], [6, 5], [10, 3], [12, 7], [4, 7], [8, 8]]) { c.px(x, y, "c"); c.px(x + 1, y, "b") }
  c.rect(1, 11, 14, 4, "U"); c.hline(1, 11, 14, "S")
  c.px(5, 13, "6"); c.px(10, 12, "6")
})
sprite("box_cellar", { w: 16, h: 16 }, (c) => {
  // a barrel of pickles
  c.rect(0, 0, 16, 16, "m")
  c.ellipse(7.5, 5, 6.5, 4, "n"); c.ellipse(7.5, 5, 5, 3, "x"); c.px(6, 4, "d"); c.px(9, 6, "b")
  c.rect(1, 9, 14, 6, "n"); c.hline(1, 9, 14, "o"); c.hline(1, 12, 14, "e"); c.hline(1, 14, 14, "m")
})
for (const th of ["canteen", "fridge", "cellar"]) {
  // a box that splashed: soup over it, falling apart
  sprite(`box_${th}_burn`, { base: `box_${th}` }, (c) => {
    for (const [x, y, k] of [[3, 2, "t"], [4, 2, "u"], [9, 3, "s"], [10, 3, "t"], [6, 6, "u"], [12, 9, "t"], [2, 9, "s"], [7, 12, "t"], [8, 12, "u"], [13, 13, "s"]]) c.px(x, y, k)
    c.hline(0, 15, 16, "k"); c.vline(0, 0, 16, "k"); c.vline(15, 0, 16, "k"); c.hline(0, 0, 16, "k")
  })
}

sprite("hole", { w: 16, h: 16 }, (c) => {
  // a drain pit: dark, its upper rim lit
  c.rect(0, 0, 16, 16, "Q")
  c.hline(0, 0, 16, "R"); c.hline(1, 1, 14, "X")
  c.px(4, 2, "R"); c.px(11, 2, "R"); c.px(4, 3, "X")
})

sprite("ice", { w: 16, h: 16 }, (c) => {
  // frost marks laid over the floor
  for (const [x, y] of [[2, 3], [3, 2], [4, 1], [9, 9], [10, 8], [11, 7], [12, 6], [6, 12], [7, 11]]) c.px(x, y, "T")
  c.px(13, 2, "w"); c.px(3, 10, "U"); c.px(12, 13, "U")
})

// the conveyor's chevrons, pointing down; the other directions are the same turned
sprite("arrow_down", { w: 16, h: 16 }, grid(3, 2, `
W........W
VW......WV
VVW....WVV
.VVW..WVV.
..VVWWVV..
...VVVV...
W...VV...W
VW......WV
VVW....WVV
.VVW..WVV.
..VVWWVV..
...VVVV...`))
sprite("arrow_left", { base: "arrow_down", rot: 90 })
sprite("arrow_up", { base: "arrow_down", rot: 180 })
sprite("arrow_right", { base: "arrow_down", rot: 270 })

sprite("trap", { w: 16, h: 16 }, (c) => {
  // the grease trap: a round grate in a puddle of grease
  c.ellipse(7.5, 8, 7, 6, "Z")
  c.circ(8, 8, 5, "X")
  c.circ(8, 8, 4, "Y")
  for (const x of [5, 7, 9, 11]) c.vline(x, 5, 7, "X")
  c.px(3, 4, "d"); c.px(12, 12, "c")
})

// ---------------------------------------------------------------- extras: served on saucers
// plain saucers for the good ones, red-rimmed for the diseases
function servePlate(c, rim) {
  c.ellipse(7.5, 13, 7, 2.5, rim)
  c.ellipse(7.5, 12.5, 5.5, 1.5, "w")
}
sprite("extra_bomb", { w: 16, h: 16, outline: "k" }, (c) => servePlate(c, "q"), grid(1, 1, `
.....m.....yy.
.....m....yyyy
...bbbbbb..yy.
..bcdcccab....
.bcdccccccb...
.bccccccccb...
.bccccccccab..
..abccccbba...
...abbbbaa....`))
sprite("extra_power", { w: 16, h: 16, outline: "k" }, (c) => servePlate(c, "q"), grid(1, 0, `
...........bb.
..........b...
.......bbbb...
.....sssssb...
...sstttsss...
..sstvtsssr...
.sstttsssr....
ssssssssr.....
rsssssrr......
.rrrrr........`))
sprite("extra_skate", { w: 16, h: 16, outline: "k" }, (c) => servePlate(c, "q"), grid(1, 1, `
......NNNN....
.....NOOOON...
.....NOwwON...
.....NOOOON...
.NNNNNOOOOONN.
NOOOOOOOOOOOON
NOOwOOOwOOOOON
wwwwwwwwwwwwww
.ee........ee.`), grid(0, 2, `
z..
...
zz.
...
z..`))
sprite("extra_kick", { w: 16, h: 16, outline: "k" }, (c) => servePlate(c, "q"), grid(3, 0, `
..hhhhhh..
.gggggggg.
..hhhhhh..
.gggggggg.
..hhhhhh..
.gggggggg.
..hhhhhh..
.gggggggg.
..ffffff..
.eeeeeeee.`))
sprite("extra_glove", { w: 16, h: 16, outline: "k" }, (c) => servePlate(c, "q"), grid(3, 0, `
.....tt...
..tt.tut..
.tutttutt.
.tuttttttt
ttutttttt.
ttttttttt.
tttttttt..
.tttttt...
.wqwqwq...
.qwqwqw...`))
sprite("extra_swirl", { w: 16, h: 16, outline: "k" }, (c) => servePlate(c, "s"), grid(2, 0, `
....NNNN....
..NNOOwONN..
.NOwwOOOwON.
NOOOwwOwwOON
NOwOOOOOOwON
.NNNNNNNNNN.
....wwqw....
....wwqw....
....wwqw....
...qqqqqq...`))
sprite("extra_beans", { w: 16, h: 16, outline: "k" }, (c) => servePlate(c, "s"), grid(3, 0, `
..gggggg..
.hhhhhhhh.
.gggggggg.
.FFFFFFFF.
.FwwwwwwF.
.FwJIJIwF.
.FwIJIJwF.
.FwwwwwwF.
.FFFFFFFF.
.gggggggg.`))
sprite("extra_soda", { w: 16, h: 16, outline: "k" }, (c) => servePlate(c, "s"), grid(4, 0, `
...hh...
..hhhh..
.zzzzzz.
.zwzzzz.
.zwyyzz.
.zwyyzz.
.zwzzzz.
.zzzzzz.
.zzzzzz.
..hhhh..`), grid(12, 1, `
y..
..y
y..`))

// ---------------------------------------------------------------- the Ladle: eats the arena when time is up
sprite("ladle_0", { w: 16, h: 16, outline: "k" }, (c) => {
  // a soup ladle from above: a deep steel bowl with soup in it, a long handle with a hook
  c.line(9, 8, 13, 1, "g", 2)
  c.px(14, 0, "h"); c.px(15, 1, "g"); c.px(15, 2, "g")
  c.circ(6, 10, 5, "f")
  c.circ(6, 10, 4, "h")
  c.circ(6, 10, 3, "t")
  c.px(5, 9, "u"); c.px(6, 9, "u"); c.px(7, 11, "s")
  c.px(3, 7, "w")
})
sprite("ladle_1", { base: "ladle_0" }, grid(4, 8, `
.uu.
uttu
.ts.`))

// ---------------------------------------------------------------- letters: 5 x 7, ours
const FONT = {
  A: ".XXX.X...XX...XXXXXXX...XX...XX...X", B: "XXXX.X...XX...XXXXX.X...XX...XXXXX.",
  C: ".XXX.X...XX....X....X....X...X.XXX.", D: "XXXX.X...XX...XX...XX...XX...XXXXX.",
  E: "XXXXXX....X....XXXX.X....X....XXXXX", F: "XXXXXX....X....XXXX.X....X....X....",
  G: ".XXX.X...XX....X.XXXX...XX...X.XXXX", H: "X...XX...XX...XXXXXXX...XX...XX...X",
  I: ".XXX...X....X....X....X....X...XXX.", J: "..XXX...X....X....X.X..X.X..X..XX..",
  K: "X...XX..X.X.X..XX...X.X..X..X.X...X", L: "X....X....X....X....X....X....XXXXX",
  M: "X...XXX.XXX.X.XX.X.XX...XX...XX...X", N: "X...XXX..XX.X.XX..XXX...XX...XX...X",
  O: ".XXX.X...XX...XX...XX...XX...X.XXX.", P: "XXXX.X...XX...XXXXX.X....X....X....",
  Q: ".XXX.X...XX...XX...XX.X.XX..X..XX.X", R: "XXXX.X...XX...XXXXX.X.X..X..X.X...X",
  S: ".XXXXX....X.....XXX.....X....XXXXX.", T: "XXXXX..X....X....X....X....X....X..",
  U: "X...XX...XX...XX...XX...XX...X.XXX.", V: "X...XX...XX...XX...XX...X.X.X...X..",
  W: "X...XX...XX...XX.X.XX.X.XX.X.X.X.X.", X: "X...XX...X.X.X...X...X.X.X...XX...X",
  Y: "X...XX...X.X.X...X....X....X....X..", Z: "XXXXX....X...X...X...X...X....XXXXX",
  0: ".XXX.X...XX..XXX.X.XXX..XX...X.XXX.", 1: "..X...XX....X....X....X....X...XXX.",
  2: ".XXX.X...X....X...X...X...X...XXXXX", 3: "XXXXX...X...X.....X.....XX...X.XXX.",
  4: "...X...XX..X.X.X..X.XXXXX...X....X.", 5: "XXXXXX....XXXX.....X....XX...X.XXX.",
  6: "..XX..X...X....XXXX.X...XX...X.XXX.", 7: "XXXXX....X...X...X...X....X....X...",
  8: ".XXX.X...XX...X.XXX.X...XX...X.XXX.", 9: ".XXX.X...XX...X.XXXX....X...X..XX..",
  " ": "...................................", ".": ".........................XX...XX...",
  ",": "....................XX....X...X....", ":": ".....XX...XX.........XX...XX.......",
  "!": "..X....X....X....X....X.........X..", "?": ".XXX.X...X....X...X...X.........X..",
  "-": "...............XXXXX...............", "+": ".......X....X..XXXXX..X....X.......",
  "/": "....X...X....X...X...X....X...X....", "'": "..X....X...X..." + ".".repeat(20),
  "(": "...X...X...X....X....X.....X.....X.", ")": ".X.....X.....X....X....X...X...X...",
  "%": "XX..XXX..X...X...X...X...X..XXX..XX", "<": "...X...X...X...X.....X.....X.....X.",
  ">": ".X.....X.....X.....X...X...X...X...", "=": "..........XXXXX.....XXXXX..........",
  "*": ".....X.X.X.XXX.XXXXX.XXX.X.X.X.....", "x": "..........X...X.X.X...X...X.X.X...X",
}
for (const [ch, bits] of Object.entries(FONT)) {
  let g = ""
  for (let r = 0; r < 7; r++) g += "\n" + bits.slice(r * 5, r * 5 + 5).replace(/X/g, "w")
  sprite(`ch_${ch.charCodeAt(0)}`, { w: 5, h: 7 }, grid(0, 0, g))
}

// ---------------------------------------------------------------- the title: BOMBERSLOP in dripping slop
sprite("logo", { w: 186, h: 30, outline: "k" }, (c) => {
  const word = "BOMBERSLOP"
  const S = 3
  for (let n = 0; n < word.length; n++) {
    const bits = FONT[word[n]]
    const x0 = n * 6 * S
    for (let r = 0; r < 7; r++) {
      for (let col = 0; col < 5; col++) {
        if (bits[r * 5 + col] !== "X") continue
        const key = r < 2 ? "d" : r < 4 ? "c" : r < 6 ? "b" : "a"
        c.rect(x0 + col * S, r * S, S, S, key)
      }
    }
  }
  // drips under some letters
  for (const [x, len] of [[4, 4], [23, 7], [44, 3], [62, 6], [95, 5], [118, 8], [140, 4], [167, 6]]) {
    c.rect(x, 21, 2, len, "b")
    c.rect(x, 21 + len, 2, 1, "a")
  }
})

// a crown for the score board's winner, a clock for the round time
sprite("crown", { outline: "k" }, `
y..y..y
yy.y.yy
yyyyyyy
yzyyyzy
yyyyyyy`)
sprite("clock", { outline: "k" }, `
.www.
wwkww
wwkww
wwwkw
.www.`)

sheet("sprites", ["p*", "puddle_*", "drop_*", "bomb_*", "ex_*", "floor_*", "wall_*", "box_*", "hole", "ice", "arrow_*", "trap",
  "extra_*", "ladle_*", "ch_*", "logo", "crown", "clock"], { pad: 1 })
