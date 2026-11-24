// The OpenClonk test oracle (built by build.sh with the original's flags, against its libmisc and C4Real.cpp).
// Reads one command per line on stdin and prints one line per command: what the original's C4Fixed
// (16.16 fixed point, src/lib/C4Real.h) and random generators (src/lib/C4Random.cpp, pcg32) return.
// Fixed values are given and printed as their raw int32 `val`; floats as C's %.9g.
//
//   seed S            FixedRandom(S)                         -> RandomCount
//   rand R            Random(R)                              -> value
//   rand0             Random()                               -> value
//   seeded S R        SeededRandom(S, R)                     -> value
//   itofix x | itofix2 x p | ftofix f | fixtoi v | fixtoi2 v p | fixtof v
//   add|sub|mul|div a b        C4Fixed op C4Fixed
//   addi|subi|muli|divi a i    C4Fixed op int32_t
//   addf|subf|mulf|divf a f    C4Fixed op float
//   cmp a b           -> == < > <= >= != as six digits (0/1); cmpi a i, cmpf a f the same against int/float
//   neg v | not v | sin v | cos v | real100 x | real256 x | real10 x
//   seta v x          C4Fixed = int32_t (operator=)
//   compound a b      fr = a; fr += b; fr *= b; fr -= a; fr /= (b|1 as fixed); fr += 3; fr -= 2 -> fr
//
// Strings (src/lib/StdBuf.cpp, platform/StdFile.cpp): fields separated by tabs, strings given and printed as
// hex bytes, "-" for a null buffer:
//   fmti F i | fmtl F ll | fmtd F bits | fmts F S    FormatString(F, int | long long | double (its 64 bits) | char*)
//   wild W S           WildcardMatch(W, S)                     -> 0/1
//   replace S O N i    StdStrBuf::Replace(O, N, i)             -> count TAB result
//   rchar S c d        StdStrBuf::ReplaceChar(c, d)            -> count TAB result
//   endrep S i N       StdStrBuf::ReplaceEnd(i, N)             -> result
//   section S i c      StdStrBuf::GetSection(i, &out, c)       -> 0/1 TAB out
//   trim S | lower S | unicode S                               -> (changed TAB) result
//   hash S             StdStrBuf::GetHash()                    -> value
//   sort K             std::sort of the indices 0..n-1 by the keys K (comma-separated ints) -> the indices
#include "C4Include.h"
#include "lib/C4Random.h"

#include <cstdio>
#include <iostream>
#include <sstream>
#include <cstring>
#include <string>
#include <vector>

uint32_t Random();
static uint64_t recorded = 0;
void RecordRandom(uint32_t range, uint32_t val) { recorded += range ^ val; }

static C4Fixed fx(int32_t v) { C4Fixed f; f.val = v; return f; }

static std::string unhex(const std::string &h)
{
	std::string s;
	for (size_t i = 0; i + 1 < h.size(); i += 2) s += char(std::stoi(h.substr(i, 2), nullptr, 16));
	return s;
}

static std::string hex(const StdStrBuf &b)
{
	if (b.isNull()) return "-";
	std::string s;
	char t[3];
	for (size_t i = 0; i < b.getLength(); ++i) { snprintf(t, 3, "%02x", (unsigned char) b.getData()[i]); s += t; }
	return s;
}

static std::vector<std::string> fields(const std::string &line)
{
	std::vector<std::string> f;
	size_t a = 0, b;
	while ((b = line.find('\t', a)) != std::string::npos) { f.push_back(line.substr(a, b - a)); a = b + 1; }
	f.push_back(line.substr(a));
	return f;
}

static bool strings(const std::string &line)
{
	std::vector<std::string> f = fields(line);
	const std::string &op = f[0];
	auto S = [&](size_t i) { return unhex(f[i]); };
	if (op == "fmti") printf("%s\n", hex(FormatString(S(1).c_str(), int(std::stoll(f[2])))).c_str());
	else if (op == "fmtl") printf("%s\n", hex(FormatString(S(1).c_str(), (long long)(std::stoull(f[2])))).c_str());
	else if (op == "fmtd") { uint64_t bits = std::stoull(f[2]); double d; memcpy(&d, &bits, 8);
		printf("%s\n", hex(FormatString(S(1).c_str(), d)).c_str()); }
	else if (op == "fmts") printf("%s\n", hex(FormatString(S(1).c_str(), S(2).c_str())).c_str());
	else if (op == "wild") printf("%d\n", WildcardMatch(S(1).c_str(), S(2).c_str()) ? 1 : 0);
	else if (op == "replace") { StdCopyStrBuf b(S(1).c_str()); int n = b.Replace(S(2).c_str(), S(3).c_str(), std::stoul(f[4]));
		printf("%d\t%s\n", n, hex(b).c_str()); }
	else if (op == "rchar") { StdCopyStrBuf b(S(1).c_str()); int n = b.ReplaceChar(char(std::stoi(f[2])), char(std::stoi(f[3])));
		printf("%d\t%s\n", n, hex(b).c_str()); }
	else if (op == "endrep") { StdCopyStrBuf b(S(1).c_str()); b.ReplaceEnd(std::stoul(f[2]), S(3).c_str()); printf("%s\n", hex(b).c_str()); }
	else if (op == "section") { StdCopyStrBuf b(S(1).c_str()); StdStrBuf out; bool ok = b.GetSection(std::stoul(f[2]), &out, char(std::stoi(f[3])));
		printf("%d\t%s\n", ok ? 1 : 0, hex(out).c_str()); }
	else if (op == "trim") { StdCopyStrBuf b(S(1).c_str()); bool c = b.TrimSpaces(); printf("%d\t%s\n", c ? 1 : 0, hex(b).c_str()); }
	else if (op == "lower") { StdCopyStrBuf b(S(1).c_str()); b.ToLowerCase(); printf("%s\n", hex(b).c_str()); }
	else if (op == "unicode") { StdCopyStrBuf b(S(1).c_str()); bool c = b.EnsureUnicode(); printf("%d\t%s\n", c ? 1 : 0, hex(b).c_str()); }
	else if (op == "sort") {
		std::vector<int> keys;
		std::stringstream ks(f[1]);
		std::string k;
		while (std::getline(ks, k, ',')) keys.push_back(std::stoi(k));
		std::vector<int> idx(keys.size());
		for (size_t i = 0; i < idx.size(); ++i) idx[i] = int(i);
		std::sort(idx.begin(), idx.end(), [&](int a, int b) { return keys[a] < keys[b]; });
		std::string r;
		for (size_t i = 0; i < idx.size(); ++i) r += (i ? "," : "") + std::to_string(idx[i]);
		printf("%s\n", r.c_str());
	}
	else if (op == "hash") { StdCopyStrBuf b(S(1).c_str()); printf("%d\n", b.GetHash()); }
	else return false;
	return true;
}

int main()
{
	std::string line;
	while (std::getline(std::cin, line))
	{
		if (line.find('\t') != std::string::npos && strings(line)) continue;
		std::istringstream in(line);
		std::string op;
		in >> op;
		long long a = 0, b = 0;
		float f = 0;
		if (op == "seed") { unsigned long long s; in >> s; FixedRandom(s); printf("%d\n", RandomCount); }
		else if (op == "rand") { in >> a; printf("%u\n", Random(uint32_t(a))); }
		else if (op == "rand0") { printf("%u\n", Random()); }
		else if (op == "seeded") { unsigned long long s; in >> s >> b; printf("%u\n", SeededRandom(s, uint32_t(b))); }
		else if (op == "itofix") { in >> a; printf("%d\n", itofix(int32_t(a)).val); }
		else if (op == "itofix2") { in >> a >> b; printf("%d\n", itofix(int32_t(a), int32_t(b)).val); }
		else if (op == "ftofix") { in >> f; printf("%d\n", ftofix(f).val); }
		else if (op == "fixtoi") { in >> a; printf("%d\n", fixtoi(fx(int32_t(a)))); }
		else if (op == "fixtoi2") { in >> a >> b; printf("%d\n", fixtoi(fx(int32_t(a)), int32_t(b))); }
		else if (op == "fixtof") { in >> a; printf("%.9g\n", fixtof(fx(int32_t(a)))); }
		else if (op == "add") { in >> a >> b; printf("%d\n", (fx(a) + fx(b)).val); }
		else if (op == "sub") { in >> a >> b; printf("%d\n", (fx(a) - fx(b)).val); }
		else if (op == "mul") { in >> a >> b; printf("%d\n", (fx(a) * fx(b)).val); }
		else if (op == "div") { in >> a >> b; printf("%d\n", (fx(a) / fx(b)).val); }
		else if (op == "addi") { in >> a >> b; printf("%d\n", (fx(a) + int32_t(b)).val); }
		else if (op == "subi") { in >> a >> b; printf("%d\n", (fx(a) - int32_t(b)).val); }
		else if (op == "muli") { in >> a >> b; printf("%d\n", (fx(a) * int32_t(b)).val); }
		else if (op == "divi") { in >> a >> b; printf("%d\n", (fx(a) / int32_t(b)).val); }
		else if (op == "addf") { in >> a >> f; printf("%d\n", (fx(a) + f).val); }
		else if (op == "subf") { in >> a >> f; printf("%d\n", (fx(a) - f).val); }
		else if (op == "mulf") { in >> a >> f; printf("%d\n", (fx(a) * f).val); }
		else if (op == "divf") { in >> a >> f; printf("%d\n", (fx(a) / f).val); }
		else if (op == "cmp") { in >> a >> b; C4Fixed x = fx(a), y = fx(b);
			printf("%d%d%d%d%d%d\n", x == y, x < y, x > y, x <= y, x >= y, x != y); }
		else if (op == "cmpi") { in >> a >> b; C4Fixed x = fx(a); int32_t y = int32_t(b);
			printf("%d%d%d%d%d%d\n", x == y, x < y, x > y, x <= y, x >= y, x != y); }
		else if (op == "cmpf") { in >> a >> f; C4Fixed x = fx(a);
			printf("%d%d%d%d%d%d\n", x == f, x < f, x > f, x <= f, x >= f, x != f); }
		else if (op == "neg") { in >> a; printf("%d\n", (-fx(a)).val); }
		else if (op == "not") { in >> a; printf("%d%d\n", !fx(a), bool(fx(a))); }
		else if (op == "sin") { in >> a; printf("%d\n", Sin(fx(a)).val); }
		else if (op == "cos") { in >> a; printf("%d\n", Cos(fx(a)).val); }
		else if (op == "real100") { in >> a; printf("%d\n", C4REAL100(int(a)).val); }
		else if (op == "real256") { in >> a; printf("%d\n", C4REAL256(int(a)).val); }
		else if (op == "real10") { in >> a; printf("%d\n", C4REAL10(int(a)).val); }
		else if (op == "seta") { in >> a >> b; C4Fixed x = fx(a); x = int32_t(b); printf("%d\n", x.val); }
		else if (op == "compound") { in >> a >> b; C4Fixed fr = fx(a); fr += fx(b); fr *= fx(b); fr -= fx(a);
			fr /= fx(int32_t(b) | 1); fr += 3; fr -= 2; printf("%d\n", fr.val); }
		else { printf("?\n"); }
	}
	return 0;
}
