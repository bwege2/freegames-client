# How C++ becomes TypeScript (cpp2ts)

`web/games/openclonk/src/gen/` is written by this translator from clang's syntax trees of the engine, compiled
with the flags of the original's own CMake build (`tools/translate.sh`: `oracle/build.sh` configures and builds
the original, `ast.sh` dumps the trees and `prune.py` drops the C++ library's declarations, `translate.py` runs
this package). It is never edited by hand: a change goes into the translator or the runtime
(`web/games/openclonk/src/rt/`), and `translate.sh` writes the modules again. The tests
(`web/games/openclonk/test/`) compare the result with the original, run by the oracle.

Clang's trees are of the preprocessed source with templates instantiated: macros are expanded (`FIXED_FPF` is
`65536`), every implicit conversion and copy is a node, every type is known. The translator follows the trees,
so the TypeScript keeps the C++'s classes, functions, names, statements and order of evaluation; it adds what
C++ does implicitly (conversions, copies) and nothing else.

## What is translated

`config.py`: `UNITS` are the modules translated in full; everything they use from other files of the original
(pcg, other engine headers) comes with them, as far as it is used (a class of a unit keeps all its methods,
another class only those that are called). One module per original file, header and implementation together:
`src/lib/C4Real.{h,cpp}` is `gen/lib/C4Real.ts`, `thirdparty/pcg/pcg_random.hpp` is `gen/pcg/pcg_random.ts`.
`SKIP` names what waits for a later step, `NATIVE` what the runtime writes by hand (`rt/native.ts`).

## Values

| C++ | TypeScript |
| --- | --- |
| `bool` | `boolean` |
| 8-, 16- and 32-bit integers, `float`, `double` | `number` |
| 64-bit integers (`long`, `int64_t`, `uint64_t`, `size_t`) | `bigint`; except declarations listed in `NARROW64` (values proven to fit 32 bits, e.g. `SineTable`) |
| conversion to a narrower or unsigned type | written out: `\| 0` (int32), `>>> 0` (uint32), `<< 24 >> 24`, `& 0xff`, ...; `n32()`/`nu32()` from 64 bits, `i64()`/`u64()` (`BigInt.asIntN/asUintN`) between 64-bit types, `BigInt()` to 64 bits |
| `+ - *` on 32-bit integers | `(a + b) \| 0`, `Math.imul(a, b)`, `>>> 0` for unsigned (C++'s wrap-around) |
| `/`, `%` | `a / b \| 0` (truncation), `%` as JavaScript's (C++'s sign rule) |
| `+ - * <<` on 64-bit integers | `i64()`/`u64()` around the result, left out where both operands are widened 32-bit values |
| `float` arithmetic | `Math.fround()` around each result; float to integer through `ftoi32()` and friends (x86: out of range gives INT_MIN) |
| constant expressions | folded (`sizeof`, macros, `constexpr` locals, template arguments); a `constexpr` local whose uses are all folded is left out |

## Classes

| C++ | TypeScript |
| --- | --- |
| class / struct / template specialization | `class`; a specialization's name lists its arguments (`specific_stream$u64`), or `NAMES` gives it (`pcg32`) |
| fields | fields with C++'s zero values, or their in-class initializers |
| constructor | an init method returning `this`: `new C4Fixed().init$i32(x)`; a defaulted default constructor is just `new C4Fixed()` |
| copy constructor, copy assignment | `x.$clone()`, `x.$assign(y)` (memberwise, generated); a temporary is not copied, nor a local that is returned |
| overloads | one name each: the name plus the parameters' types (`op_add$C4Fixed`, `op_add$i32`, `Random$v` for none); `r`/`m` mark non-const and rvalue references |
| operators | methods or functions `op_add`, `op_addAssign`, `op_eq`, `op_neg`, `op_call`, `op_bool`, ... |
| base class with state | `extends`; further base classes may only have static members (pcg's mixins) |
| static members | `static`; called as `Class.name()` |
| placement `new (this) T(...)` | `this.$assign(new T().init...(...))` |
| a virtual call while a base class is constructed (C++ calls the base class's version) | in the game profile for classes derived from `config.CTOR_DISPATCH` (`C4GUI::Element`): each constructor sets `this.$dyn` to its class after its base classes' constructors, and an override hands a call made while `$dyn` is one of its base classes to that class's version |
| a template specialization | in its template's module, or in its base class's module when that one is set up later (`relocate_specializations`: a module's base classes must exist when it is loaded) |
| `std::multimap` | rt `StdMultiMap`: equal keys side by side, in the order they were inserted |
| `std::forward`, `std::move` | the argument |
| default arguments | TypeScript default parameters |

Statements (`if`, `for`, `while`, `do`, `switch`, `break`, `continue`, `return`) are kept as they are.
Module-level variables are `export let`/`export const`; classes come first in a module (bases before derived),
then functions and variables in source order.

## Modal loops

The original's modal dialogs wait in a message loop of their own until they are closed (`C4GUI::Dialog::DoModal`:
`while (fShow) Application.ScheduleProcs();`), inside the function that showed them. A page cannot wait inside a
function, so the game profile writes those loops as JavaScript generators (`config.SUSPEND`, `rt/coro.ts`):

| C++ | TypeScript |
| --- | --- |
| a loop of `SUSPEND` (`Dialog::DoModal`) | a generator; its wait (`Application.ScheduleProcs()`) is `(yield, $.Application.ScheduleProcs())`: back to the page, which resumes it on its next animation frame instead of running its own round of the main loop |
| a function that calls a generator directly (a non-virtual call, or a virtual call of a method that is a generator itself), transitively | a generator (`*Name()`, `function* name()`); the call is `(yield* f())` |
| a virtual call of a method that only an override makes a generator, a call through a member function pointer (the GUI's callbacks, `C4KeyCB`), in a generator | `(yield* $co(f()))`: waits if the answer is a generator |
| the same, or a call of a generator, in a function that cannot wait (not coloured, a constructor or destructor, a lambda) | `$spawn(f())`: runs it up to its first wait; if it waits, the page resumes it, innermost first, and the caller goes on |

`work/coroutines-gen.txt` lists the generators of the last translation.
