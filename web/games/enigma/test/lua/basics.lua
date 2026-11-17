-- Checks of the port's Lua interpreter against Enigma's Lua 5.1.4 (re/enigma/oracle/build-lua.sh):
-- the output of this script must be byte for byte the same.

-- pairs order: array and hash parts, rehash sizes, collisions, deleted keys
local function dump(t)
  local out = {}
  for k, v in pairs(t) do out[#out + 1] = tostring(k) .. "=" .. tostring(v) end
  print(table.concat(out, " "))
end
local t = {}
for i, k in ipairs({"a", "b", "fl_lawn", "st_oxyd", "x", "y", 1.5, 3, 7, "door1", "door2", "door10"}) do t[k] = i end
dump(t)
dump({1, 2, 3, x = 1, y = 2, [10] = 5, [-1] = 3, [0] = 0, [2.5] = 9})
local u = {}
for i = 1, 40 do u["k" .. i] = i end
for i = 1, 40, 3 do u["k" .. i] = nil end
for i = 41, 60 do u["k" .. i] = i end
dump(u)
local w = {}
for i = 20, 1, -1 do w[i] = i * i end
w.n = 3; w[100] = 1; w[33] = 2
dump(w)
local tiles = {}
for _, c in ipairs({" ", "_", ";", ",", ":", ".", "+", "-", "#", "O", "X", "x", "i", "@", "a", "b", "c", "A", "B"}) do tiles[c] = c:byte() end
dump(tiles)
local nested = { ["st_door"] = {faces = "ew", name = "door%%"}, ["it_trigger"] = {target = {"door%*", "door%%"}, action = {"close", "open"}} }
for k, v in pairs(nested) do io.write(k, ":") for k2 in pairs(v) do io.write(k2, ",") end print() end

-- numbers
print(10 / 2, 2 ^ 53, 1e15, 1e16, 0.1, 1 / 3, -1 / 3, 1 / 0, -1 / 0, 123456789012345, 3.14159265358979)
print(7 % 3, -7 % 3, 7 % -3, 5.5 % 2, 2 ^ 0.5, 1e-5, 123e-7, 1e100, -0.0 + 0)
print(string.format("%5.2f|%d|%s|%x|%X|%o|%e|%g|%g|%g|%10.3s|%-5d|%05d|%+d|%c|%q", 3.14159, 3.7, 1e100, 255, 255, 8, 12345.678, 0.0001, 1e20, 100000, "abcdef", 42, 42, 42, 65, "a\"b\n"))
print(string.format("%.3g %.10g %g %g %5.1f %.0f %i", 2/3, 2/3, 1e-5, 123456789, -2.25, 2.5, -3.9))
print(tonumber("0x1F"), tonumber("  12  "), tonumber("1e2"), tonumber("abc"), tonumber("10", 2), tonumber("z", 36), tonumber(""))
print(math.floor(-3.5), math.ceil(-3.5), math.max(1, 5, 3), math.min(4, 2), math.fmod(-7, 3), math.modf(-3.7))
print(math.frexp(8), math.ldexp(0.5, 4), math.abs(-2), math.sqrt(16), math.huge, -math.huge)

-- strings and patterns
local s = "Hello, World! 123 abc_def"
print(s:len(), s:upper(), s:lower(), s:sub(3, 7), s:sub(-3), s:sub(-100, 2), s:rep(2, ""), s:byte(1, 3))
print(string.find(s, "World"), string.find(s, "o", 6), string.find(s, "%d+"), string.find(s, "(%a+), (%a+)"))
print(string.match(s, "(%d+) (%a+)"), string.match(s, "()ll()"), string.match("key = value", "^(%w+)%s*=%s*(%w+)$"))
print(string.gsub(s, "o", "0"), string.gsub(s, "%w+", "<%0>", 2), string.gsub("abc", "", "-"))
print(string.gsub("hello world", "(%w+)", "%1 %1"), string.gsub("$name is $x", "%$(%w+)", {name = "Lua", x = 5}))
print(string.gsub("abc", "%w", function(c) return c:byte() end))
for k, v in string.gmatch("a=1, b=2, c=3", "(%w+)=(%w+)") do io.write(k, v, ";") end print()
for w in string.gmatch("one two  three", "%a+") do io.write("[", w, "]") end print()
print(string.find("a.b", ".", 1, true), string.find("[x]", "%[(.)%]"), string.match("  trim  ", "^%s*(.-)%s*$") .. "|")
print(string.match("f(a(b)c)d", "%b()"), string.find("THE (quick) fox", "%f[%a]%a+", 5), string.rep("ab", 3))
print(("x"):rep(0), #"abc", "a" .. 1 .. 2.5, 1 .. "", string.char(72, 105), string.reverse("abc"))

-- table library
local arr = {5, 2, 8, 1, 9, 3, 7, 4, 6, 0, 11, 15, 13, 12, 14, 10}
table.sort(arr) print(table.concat(arr, ","))
table.sort(arr, function(a, b) return a > b end) print(table.concat(arr, ","))
local recs = {}
for i = 1, 30 do recs[i] = {k = (i * 7) % 5, i = i} end
table.sort(recs, function(a, b) return a.k < b.k end)
for i = 1, 30 do io.write(recs[i].i, " ") end print()
table.insert(arr, 99) table.insert(arr, 1, 100) print(table.remove(arr), table.remove(arr, 1), #arr, table.getn(arr), table.maxn({[5] = 1, [2] = 1}))
print(select("#", 1, nil, 3), select(2, "a", "b", "c"), unpack({1, 2, 3}))

-- closures, varargs, metatables
local function counter() local c = 0 return function() c = c + 1 return c end end
local c1, c2 = counter(), counter()
print(c1(), c1(), c2())
local fns = {}
for i = 1, 3 do fns[i] = function() return i end end
print(fns[1](), fns[2](), fns[3]())
local function va(...) local a, b = ... return select("#", ...), a, b, ... end
print(va(1, nil, 3))
local function oldva(...) return arg.n, arg[1] end
print(oldva("x", "y"))
local V = {}
V.__index = V
V.__add = function(a, b) return setmetatable({x = a.x + b.x}, V) end
V.__eq = function(a, b) return a.x == b.x end
V.__lt = function(a, b) return a.x < b.x end
V.__le = function(a, b) return a.x <= b.x end
V.__concat = function(a, b) return "V" .. (type(a) == "table" and a.x or a) .. (type(b) == "table" and b.x or b) end
V.__call = function(self, y) return self.x * y end
V.__tostring = function(self) return "V(" .. self.x .. ")" end
V.__unm = function(a) return setmetatable({x = -a.x}, V) end
function V.get(self) return self.x end
local a, b = setmetatable({x = 1}, V), setmetatable({x = 2}, V)
print((a + b).x, a == b, a < b, a <= b, a .. b, a .. "s", a(10), tostring(-a), a:get())
local prox = setmetatable({}, {__index = function(t, k) return k .. "!" end, __newindex = function(t, k, v) rawset(t, k, v * 2) end})
prox.z = 5
print(prox.y, prox.z, rawget(prox, "y"))
print(pcall(error, "msg"), pcall(error, {code = 1}), pcall(function() error("lvl", 1) end))
print(pcall(function() local x = nil; return x + 1 end) == false)
print(type(print), type(nil), type({}), type("s"), type(2), type(true))
local i = 0
repeat local j = i; i = i + 1 until j >= 3
print(i)
for x = 1, 0 do print("never") end
for x = 0.1, 1, 0.3 do io.write(x, " ") end print()
for x = 3, 1, -1 do io.write(x, " ") end print()
while true do i = i + 1 if i > 10 then break end end print(i)
print(#{1, 2, nil, 4}, #{nil, nil, 3}, #{1, nil}, #{n = 1})
local big = {} for k = 1, 100 do big[k] = k end for k = 1, 90 do big[k] = nil end print(#big)
goto_ = 1 print(goto_)
print(2 ^ 3 ^ 2, -2 ^ 2, not nil == true, 1 < 2 and 2 < 3, nil or "default", false and 1, "10" + 5, "3" * "4", 10 .. 20)
print(math.pi, string.format("%.14g", math.pi), 100 / 3 * 3, 0.1 + 0.2, 1e300 * 1e10, -(0 / 0) ~= -(0 / 0))
