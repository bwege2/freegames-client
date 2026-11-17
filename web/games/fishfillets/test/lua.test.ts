// The port's Lua against the behaviour of Lua 5.0 (the reference manual and lua-5.0's lbaselib.c,
// lstrlib.c, lmathlib.c, ltablib.c): what the level scripts rely on.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Lua } from '../src/lua/interp.ts';
import { openLibs } from '../src/lua/lib.ts';
import { GlibcRand } from '../src/glibcRand.ts';

function run(src: string): string[] {
  const L = new Lua();
  const out: string[] = [];
  openLibs(L, { print: (s) => out.push(s), rand: new GlibcRand(1) });
  L.run(src, 'test');
  return out;
}

test('numbers print as printf("%.14g") (LUA_NUMBER_FMT)', () => {
  assert.deepEqual(run('print(1/3, 1e100, 2^53, 100, -0.5, 10/2, 1e15, 123456789012345)'),
    ['0.33333333333333\t1e+100\t9.007199254741e+15\t100\t-0.5\t5\t1e+15\t1.2345678901234e+14']);
  assert.deepEqual(run('print("10" + 5, "3" * "4", 10 .. 20)'), ['15\t12\t1020']);
});

test('vararg functions get the table arg with n (Lua 5.0)', () => {
  assert.deepEqual(run('local function f(a, ...) return a, arg.n, arg[1], arg[3] end print(f(1, 2, nil, 4))'), ['1\t3\t2\t4']);
  assert.deepEqual(run('print(unpack({1, 2, 3}))'), ['1\t2\t3']);
});

test('closures capture a fresh local per loop iteration', () => {
  assert.deepEqual(run(`
    local t = {}
    for i = 1, 3 do local j = i * 10 t[i] = function() return i + j end end
    print(t[1](), t[2](), t[3]())
    local acc = {}
    for k, v in ipairs({"a", "b"}) do acc[k] = function() return v end end
    print(acc[1](), acc[2]())`), ['11\t22\t33', 'a\tb']);
});

test('string.format', () => {
  assert.deepEqual(run(`print(string.format("%5.1f|%-3d|%x|%X|%05d|%s|%q|%c|%e|%g", 3.14159, 7, 255, 255, 42, "hi", 'a"b\\n', 65, 12345.678, 0.0001))`),
    ['  3.1|7  |ff|FF|00042|hi|"a\\"b\\\n"|A|1.234568e+04|0.0001']);
});

test('patterns: find, gsub, gfind', () => {
  assert.deepEqual(run(`
    print(string.find("hello world", "o w"))
    print(string.find("a.b", ".", 1, true))
    print(string.find("key = value", "(%w+)%s*=%s*(%w+)"))
    print(string.gsub("hello world", "o", "0"))
    print(string.gsub("abc", "%w", "%0%0"))
    print(string.gsub("$name is $age", "%$(%w+)", {name="Bob", age=7}))
    print(string.gsub("abc", "b", function(c) return string.upper(c) end))
    print(string.gsub("pic_00.png", "_00.png$", "_"))
    local t = {} for w in string.gfind("one two  three", "%a+") do table.insert(t, w) end print(table.concat(t, ","))
    print(string.find("[[x]]", "%[%[(.-)%]%]"))
    print(string.gsub("  trim  ", "^%s*(.-)%s*$", "%1"))`),
  ['5\t7', '2\t2', '1\t11\tkey\tvalue', 'hell0 w0rld\t2', 'aabbcc\t3', 'Bob is 7\t2', 'aBc\t1', 'pic_\t1', 'one,two,three', '1\t5\tx', 'trim\t1']);
});

test('tables: getn with n, insert, remove, sort, concat, next order of the array part', () => {
  assert.deepEqual(run(`
    local t = {n = 5} print(table.getn(t))
    local a = {3, 1, 2} table.sort(a) print(table.concat(a, " "))
    table.sort(a, function(x, y) return x > y end) print(table.concat(a, " "))
    table.insert(a, 1, 9) table.insert(a, 4) print(table.concat(a, " "), table.getn(a))
    print(table.remove(a, 1), table.remove(a), table.concat(a, " "))
    local s = "" for i, v in ipairs({"x", "y", nil, "z"}) do s = s .. i .. v end print(s)
    local m = {} m[0] = "zero" m[1] = "one" m[2] = "two" local k = "" for key in pairs(m) do k = k .. key end print(k)`),
  ['5', '1 2 3', '3 2 1', '9 3 2 1 4\t5', '9\t4\t3 2 1', '1x2y', '120']);
});

test('math: random as Lua 5.0 on glibc (rand() % RAND_MAX / RAND_MAX), mod, floor', () => {
  // srand(1): glibc rand() gives 1804289383, 846930886, 1681692777 first
  assert.deepEqual(run('math.randomseed(1) print(math.random(100), math.random(100), math.random(1, 6))'), ['85\t40\t5']);
  assert.deepEqual(run('print(math.mod(7, 3), math.mod(-7, 3), math.floor(-2.5), math.max(1, 5, 3), math.abs(-3))'), ['1\t-1\t-3\t5\t3']);
});

test('metatables: __index tables and functions, __newindex, setmetatable returns the table', () => {
  assert.deepEqual(run(`
    local base = {greet = function(self) return "hi " .. self.name end}
    local o = setmetatable({name = "fish"}, {__index = base})
    print(o:greet())
    local log = {}
    local p = setmetatable({}, {__newindex = function(t, k, v) rawset(t, k, v * 2) end})
    p.x = 4 print(p.x)
    local d = setmetatable({}, {__index = function(t, k) return k .. "!" end}) print(d.boo)`),
  ['hi fish', '8', 'boo!']);
});

test('syntax of 5.0: nested long strings, escapes, comments, numeric for with fractional step', () => {
  assert.deepEqual(run('local s = [[a [[b]] c]] print(s)\nprint("\\65\\066\\t|") --[[ long\ncomment ]] print(1)\nfor i = 1, 2, 0.5 do io_ = (io_ or "") .. i .. " " end print(io_)'),
    ['a [[b]] c', 'AB\t|', '1', '1 1.5 2 ']);
});

test('errors: pcall catches error values, calling nil names the variable', () => {
  const out = run(`
    print(pcall(function() error({code = 1}) end))
    local ok, msg = pcall(function() return nosuch() end) print(ok, string.find(msg, "nosuch") ~= nil)
    print(pcall(error, "plain", 0))`);
  assert.equal(out[0].split('\t')[0], 'false');
  assert.deepEqual(out.slice(1), ['false\ttrue', 'false\tplain']);
});

test('printf rounds exact ties to even, as glibc does', () => {
  assert.deepEqual(run('print(string.format("%.1f %.0f %.0f %.2f %.3e %g", 0.25, 2.5, 3.5, 1.005, 12345, 0.000012345))'),
    ['0.2 2 4 1.00 1.234e+04 1.2345e-05']);
});
