# How C becomes TypeScript (c2ts)

The port's `web/games/nethack/src/*.ts` (one module per C file), `structs.ts`, `globals.ts` and `init.ts`
are written by this translator from clang's syntax trees of NetHack 3.6.7 as the oracle compiles it
(`tools/translate.sh`: `ast.sh` dumps the trees and the record layouts, `extract.py` keeps what is
needed, `translate.py` runs this package). They are not edited by hand: a change goes into the
translator or the runtime (`web/games/nethack/src/rt/`), and `translate.sh` writes the modules again.
The goldens (`web/games/nethack/test/`) say whether the result still does what the original does.

Clang's trees are of the preprocessed source: macros are expanded (`rn1(5, 2)` is `rn2(5) + 2`, `PM_JACKAL`
its number), every implicit conversion is an explicit node, every type is known. The translator follows
the trees, so the TypeScript keeps the C's functions, names, statements and order of evaluation; it
adds what C does implicitly (conversions, copies of structs) and nothing else.

## Values

| C | TypeScript |
| --- | --- |
| integers, `enum`s, `float`, `double` | `number`. `long` too: NetHack's longs stay far below 2^53 (gold, moves, scores) |
| conversion to a narrower or unsigned type | written out where clang has an `IntegralCast`: `x << 24 >> 24` (to `char`/`schar`), `& 0xff`, `<< 16 >> 16`, `& 0xffff`, `\| 0` (to `int`), `>>> 0` (to `unsigned int`); constants are folded |
| `unsigned long` from a negative value | its 32-bit pattern (`$u64`): NetHack's unsigned longs are bit masks of 32 bits (monster flags, strategies), and JavaScript's bitwise operators work on 32 bits |
| `/` and `%` | `a / b \| 0` for `int`, `Math.trunc(a / b)` for `long`; `%` as JavaScript's (C99's truncation) |
| `*` of two non-constant `int`s | `Math.imul` (C's wrap-around) |
| `<<`, `>>` on `long` | `$shl64`, `$shr64` (multiplication and floor division by powers of two) |
| comparisons, `&&`, `\|\|`, `!` | booleans where only their truth counts (`if`, loops, `?:`), `? 1 : 0` where C uses the 0 or 1 |
| `struct`/`union` value | an object of the class `struct_<name>` / `union_<name>` in `structs.ts` (anonymous ones `anon_<file>_<line>`). Fields have C's zero values; `$cp(s)` is `=`, `$clone()` a copy, `$of(...)` an initializer list |
| a struct assigned, passed or returned by value | `a.$cp(b)`, `f(x.$clone())`, `return x.$clone()` |
| bit-fields | plain fields; a store masks the value to the field's width |
| `union` | one value (`$v`) behind every member's getter and setter; read back from a file it keeps the bytes (`$raw`) until a member reads them as its type |
| array of numbers | a typed array: `char` `Int8Array` (signed, as on x86), `unsigned char` `Uint8Array`, `short` `Int16Array`, `int` `Int32Array`, `long` `Float64Array`; a 2-dimensional one is one typed array with the rows as views of it (`$rows`), so that pointers walk across rows as in C |
| array of structs | a JavaScript array of objects that know their array and index (`$a`, `$i`: `$sarr`, `$sarrOf`); rows of a 2-dimensional one know their place (`$p`, `$pi`) |
| array of pointers | a JavaScript array |
| string literal | `S("...")`: a `char` array with its NUL, the same for the same text |
| `char buf[n] = "..."` | `$cs("...", n)` |

## Pointers

| C | TypeScript |
| --- | --- |
| pointer to a struct or union | the object (or `null`). `p + n`, `p++`, `p - q`, `p < q` within an array of structs: `$sadd`, `$sdiff`, `$sidx` through `$a`/`$i`; `&a[i]` that may be just past the end: `$sat(a, i)`, an end marker that only knows its place |
| pointer to a function | the function (or `null`) |
| any other pointer (`char *`, `int *`, `struct obj **`, `void *` to those) | a `Ptr`: an array (or an object whose property is meant) and an index (or the property's name). `*p` is `p.a[p.o]`, `p[i]` `p.a[p.o + i]`, `p + n` `p.add(n)`, `p - q` `p.o - q.o`; `$rd`/`$wr` when `p` is an expression |
| `&x` for a local or static scalar | the variable becomes an array of one (`x[0]`), and `&x` is `P(x)` |
| `&G.x`, `&obj->field` | `P(G, "x")`, `P(obj, "field")` |
| `&arr[i]` | `P(arr, i)` (numbers, pointers) or `arr[i]` (structs) |
| `p == q` | `===` for struct and function pointers, `$peq` for `Ptr`s (same array and index); `p == NULL` is `!p` |
| `(char *) p` of a struct pointer | `$bytes(p)`: the struct (the memory functions take it as its bytes in C's layout), or, just past a struct allocated with room after it, that room (`struct engr`'s text) |
| `(T *) alloc(n)` | `new T()`, `$sarr(T, k)[0]`, `$salloc(T, n)` (a struct and bytes after it), `P(new Int8Array(n))` and the like, by `T` |
| `free(p)` | nothing (the garbage collector) |

## Memory as bytes

`write()`/`read()` of whole structs (save files, level files, bones), `memcpy`, `memset` and `fread` work
on C's layout of the data (`memBytes`, `memStore` in `rt/ptr.ts`): every struct class has the layout
clang gave it for x86-64 (`$size`, `$layout()`: offsets, bit-fields, nested structs and arrays). A
pointer is written as 8 bytes, 0 for `NULL` and 1 otherwise, and read back as `null` or as `STALE`, a
non-null object that points nowhere: NetHack sets every pointer it reads back anew. The save file is
therefore the original's format, byte for byte, but for the pointers' values.

## Control

| C | TypeScript |
| --- | --- |
| a function that can wait for a key or a delay (`getchar`, `usleep`, `qsort` with a comparator that can), directly or through calls | `async`, and every call of it `await`ed (`analyze.py`: the call graph, function pointers by the fields they are stored in and by their signatures) |
| `goto` | the function becomes `$L: for (;;) switch ($g) { ... }`: each label a `case`, `goto` `{ $g = n; continue $L; }`; statements that contain a label are lowered into cases and jumps (an `if` into a test and a jump, a loop into a jump back), the others stay as they are |
| `switch` | JavaScript's `switch`; declarations in its body come before it (a `case` may jump past them) |
| variadic functions | `...$va`; `va_start` makes a `VaList` |
| `static` variables of a function | module variables `function$name` |
| global variables | properties of `G` (`globals.ts`); file statics module variables. Every module's `$init()` sets them to their initial values, `init.ts` calls them all: a new game starts with the state of a new process |
| `exit()` | throws `Exit` (`rt/platform.ts`) |

Clang evaluates the arguments of a call and the operands of an operator from left to right, and so does
the TypeScript; C leaves the order open, and the oracle is built with clang for that reason
(`re/nethack/NOTES.md`). For `=` clang evaluates the right side first: where both sides have side
effects the translator binds the right side to a temporary first.

## By hand

`src/rt/` is the C library, Unix and the terminal as the program sees them: strings and `printf`
(`cstring.ts`, `printf.ts`), files and stdio on an in-memory file system (`fs.ts`), the clock, the user,
the tty settings, keys, sleeping, `qsort` (glibc's merge sort, comparison for comparison) and regular
expressions (`sys.ts`), the termcap entry (`termcap.ts`), and the functions that need 64-bit integers:
ISAAC64, `RND()`, `rn2_on_display_rng()`, `init_isaac64()` and `sys_random_seed()` (`rng.ts`, by
`NATIVE` in `__main__.py`).
