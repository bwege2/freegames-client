// C4Script programs run by the original's c4script and by the port (aul.test.ts); each part between the
// lines of dashes is one program, its Main is called, and everything it logs must be the same.
// ----
func Main() { Log("hello %d %s %v", 42, "world", [1, 2, 3]); return 1; }
// ----
func Main()
{
	Log("%d %d %d %d", 7 / 2, -7 / 2, 7 % 3, -7 % 3);
	Log("%d %d", 2147483647 + 1, -2147483648 - 1);
	Log("%d %d %d", 1 << 31, -1 >> 1, 255 & 15 | 64 ^ 3);
	Log("%d %d %d", 3 ** 4, 2 ** 31, (-2) ** 3);
	Log("%d %d %d", 2 + 3 * 4, 2 * 3 + 4, 1 - 2 - 3);
	Log("%v %v %v", 1 == 1, 1 != 1, !0);
	Log("%v %v", 5 && 0, 0 || 7);
	Log("%d", 46341 * 46341);
	var x = 10; x += 5; x -= 3; x *= 2; x /= 4; x %= 4;
	Log("x=%d", x);
	var y = 5; Log("%d %d %d", y++, ++y, y--);
}
// ----
func Main()
{
	Log("%d %d %d %d", Abs(-5), Min(3, 9), Max(3, 9), BoundBy(15, 0, 10));
	Log("%v %v", Inside(5, 1, 10), Inside(11, 1, 10));
	Log("%d %d %d", Sin(30, 1000), Cos(60, 1000), Sqrt(1000000));
	Log("%d %d", ArcSin(500, 1000), ArcCos(500, 1000));
	Log("%d %d", Distance(0, 0, 30, 40), Angle(0, 0, 10, 10));
	Log("%d %d", Angle(0, 0, -10, 10, 100), Sin(1234, 100, 10));
	for (var a = -720; a <= 720; a += 37) Log("sin %d %d %d", a, Sin(a, 1000), Cos(a, 1000));
	for (var i = 0; i < 200; i += 7) Log("sqrt %d %d", i * i * 13, Sqrt(i * i * 13));
	Log("%d", ParseInt("123")); Log("%v", ParseInt("x12")); Log("%d", ParseInt("-77abc"));
}
// ----
func Main()
{
	var s = "Hello, Clonk";
	Log("%d %d %s", GetLength(s), GetChar(s, 1), s);
	Log("%s|%5s|%-5s|%.2s", "abc", "ab", "ab", "abcdef");
	Log("%d|%5d|%-5d|%05d|%x|%X", 12, 12, 12, 12, 255, 255);
	Log("%v %v %v", "str", nil, true);
	Log("%s", ReplaceString("a,b,c", ",", ";"));
	Log("%v", WildcardMatch("Clonk.ocd", "*.ocd"));
	Log("%v", StringToIdentifier("hello world!"));
	Log("%s", Format("%d-%s", 5, "five"));
	Log("%v", RegexReplace("hello world", "o", "0"));
	Log("%v", RegexReplace("hello world", "(\\w+) (\\w+)", "$2 $1"));
	Log("%v", RegexSearch("abcabc", "b"));
	Log("%v", RegexMatch("key=value; a=b", "(\\w+)=(\\w+)"));
	Log("%v", RegexSplit("a1b22c333d", "\\d+"));
	Log("%v", RegexMatch("Ice-Rock", "\\w+", 2));
	Log("%v", s == "Hello, Clonk", s != "x");
}
// ----
func Main()
{
	var a = [5, 3, 8, 1, 9, 2];
	Log("%v %d", a, GetLength(a));
	SortArray(a); Log("%v", a);
	SortArray(a, true); Log("%v", a);
	a[10] = 4; Log("%v", a);
	SetLength(a, 3); Log("%v", a);
	Log("%d %d", GetIndexOf(a, 8), GetIndexOf(a, 100));
	var b = a[1:]; Log("%v %v", b, a[:2]);
	var c = CreateArray(4); Log("%v", c);
	Log("%v", DeepEqual([1, [2, 3]], [1, [2, 3]]));
	var arr = [{x = 3}, {x = 1}, {x = 2}];
	SortArrayByProperty(arr, "x"); Log("%v", arr);
	var arr2 = [[3, "c"], [1, "a"], [2, "b"]];
	SortArrayByArrayElement(arr2, 0); Log("%v", arr2);
	var sum = 0; for (var e in [1, 2, 3, 4]) sum += e; Log("sum %d", sum);
	Log("%v", [1, 2] == [1, 2]);
}
// ----
static g_counter;
local foo = 3;
func Inc() { return ++g_counter; }
func Fib(n) { if (n < 2) return n; return Fib(n - 1) + Fib(n - 2); }
func Main()
{
	Inc(); Inc(); Log("counter %d", Inc());
	Log("fib %d", Fib(20));
	var p = { a = 1, b = "two", c = [3] };
	Log("%v %v %v", p.a, p.b, p.c);
	p.d = 4; Log("%v", GetProperties(p));
	Log("%v %v", GetProperty("a", p), p["b"]);
	var q = new p { a = 10 };
	Log("%v %v %v", q.a, q.b, GetPrototype(q) == p);
	Log("%v %v", GetType(p), GetType(5));
	Log("%v %v %v %v", GetType(nil), GetType("s"), GetType([]), GetType(true));
	var f = this.Fib;
	Log("%v", GetType(f));
	Log("%v", p);
}
// ----
func Main()
{
	var i = 0;
	while (i < 10) { i++; if (i == 3) continue; if (i == 7) break; Log("i %d", i); }
	do { i--; } while (i > 2);
	Log("i=%d", i);
	for (var k = 0; k < 3; k++) for (var l = 0; l < 3; l++) { if (l == 1) continue; Log("%d%d", k, l); }
	var res = "";
	for (var c in ["a", "b", "c"]) res = Format("%s%s", res, c);
	Log(res);
	if (i) Log("true"); else Log("false");
	Log("%v", i ? "yes" : "no");
	Log("%v", nil ?? 5);
}
// ----
func Main()
{
	Log("%v", eval("1 + 2 * 3"));
	Log("%v", GetConstantNameByValue(1, "C4V_"));
	Log("%v", Crypto->ComputeHash("abc", 32));
	Log("%v", Crypto->ComputeHash("The quick brown fox", 64));
}
// ----
func Throw() { var x = [1]; return x[5] + nil; }
func Main()
{
	Log("before");
	var u = 1 / 0;
	Log("after %v", u);
}
// ----
func Main()
{
	var x = "a";
	Log("%v", x + 1);
}
// ----
func Main() { Log("%v", Undefined()); }
// ----
func Main() { this is not valid C4Script; }
// ----
func Add(a, b) { return a + b; }
func Varargs(...) { var s = 0; for (var i = 0; i < 10; i++) if (Par(i)) s += Par(i); return s; }
func Main()
{
	Log("%d", Add(2, 3));
	Log("%d", Varargs(1, 2, 3, 4));
	Log("%v", Call("Add", 7, 8));
	Log("%v", this->Add(1, 1));
	var fn = this.Add;
	Log("%v", Call(fn, 4, 5));
	Log("%v", [Add(1, 2), Add("x", nil)]);
}
// ----
func Main()
{
	var big = [];
	for (var i = 0; i < 1000; i++) big[i] = i * i % 97;
	SortArray(big);
	var s = 0;
	for (var v in big) s = (s * 31 + v) % 1000003;
	Log("hash %d", s);
	var props = {};
	for (var i = 0; i < 50; i++) props[Format("p%d", i)] = i;
	Log("%v", GetLength(GetProperties(props)));
	Log("%v", GetProperties(props));
}
