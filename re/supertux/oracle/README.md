# The original as a headless oracle

`web/games/supertux/test/oracle.test.ts` compares the port against **SuperTux 0.6.3 itself**, built
from the pinned archive and driven by a demo file. The comparison is not a re-implementation of the
C++ formulas: the original C++ code runs the level, its collision system and its `Player`, and prints
its own state after every 15 ms step.

The golden file `web/games/supertux/test/golden/journey_begins.physics.txt` was produced with the
procedure below (640 steps, 0.1 px maximum difference). The original build and its binary are **not**
committed (`re/supertux/orig/` and `/tmp/opencode/` are test-time artifacts).

## Build (Linux, Nix used here)

The archive is unpacked by `re/supertux/fetch.sh` into `re/supertux/orig/SuperTux-v0.6.3-Source`.
The build needs CMake, GCC 14 (GCC 13's libstdc++ is too old for the Nix OpenAL library),
SDL2, SDL2_image, SDL2_ttf, Boost, OpenAL, libvorbis/libogg, physfs, libpng, zlib, curl, freetype and
glm. With Nix:

```sh
nix --extra-experimental-features 'nix-command flakes' shell \
  nixpkgs#cmake nixpkgs#gcc14 nixpkgs#SDL2 nixpkgs#SDL2_image nixpkgs#SDL2_ttf \
  nixpkgs#boost nixpkgs#boost.dev nixpkgs#openal nixpkgs#libvorbis nixpkgs#libvorbis.dev \
  nixpkgs#libogg nixpkgs#physfs nixpkgs#libpng nixpkgs#zlib nixpkgs#curl nixpkgs#freetype \
  nixpkgs#glm nixpkgs#pkg-config -c cmake -S . -B build -DCMAKE_BUILD_TYPE=Release \
  -DCMAKE_POLICY_VERSION_MINIMUM=3.5 -DENABLE_OPENGL=OFF -DBUILD_TESTS=OFF -DENABLE_DISCORD=OFF ...
```

The 0.6.3 tree predates CMake 4 and Boost 1.91, so the build copy was patched (only build plumbing):

* `CMakeLists.txt`: `find_package(Boost ...)` without the removed header-only `system` component;
  `-DCMAKE_POLICY_VERSION_MINIMUM=3.5` in the external projects' `CMAKE_ARGS`; SDL_ttf linked from
  the system instead of its external project; the OpenGL/SDL_ttf external projects are not needed;
* `external/partio_zip/zip_manager.hpp`: `#include <memory>` for modern libstdc++;
* include `ogg/ogg.h`'s directory (libogg.dev) in `CMAKE_C_FLAGS`/`CMAKE_CXX_FLAGS`.

## The two oracle hooks

`src/supertux/main.cpp`: `--renderer null` is allowed for normal play (0.6.3 only used the null video
system for `--resave`):

```diff
-  if (args.resave && *args.resave) {
-    if (args.video) video = *args.video; else video = VideoSystem::VIDEO_NULL;
-  }
+  if (args.video) video = *args.video;
+  else if (args.resave && *args.resave) video = VideoSystem::VIDEO_NULL;
```

`src/supertux/screen_manager.cpp`, after `Console::current()->update(dt_sec);` in
`update_gamelogic`: when `SUPERTUX_TRACE` is set, write
`step pos.x pos.y velocity.x velocity.y on_ground` for
`GameSession::current()->get_current_sector().get_player()` and `exit(0)` after
`SUPERTUX_TRACE_STEPS` steps.

`src/supertux/game_session.cpp`: do not push the level-intro screen when `SUPERTUX_TRACE` is set
(the intro waits for a key press, and the demo controller does not feed it).

## Run

```sh
python3 re/supertux/oracle/demo.py /tmp/demo.dat
SDL_AUDIODRIVER=dummy SUPERTUX_TRACE=/tmp/trace.txt SUPERTUX_TRACE_STEPS=640 \
  /tmp/opencode/st/build/supertux2 --renderer null --play-demo /tmp/demo.dat \
  /tmp/opencode/st/src/SuperTux-v0.6.3-Source/data/levels/world1/journey_begins.stl
cp /tmp/trace.txt web/games/supertux/test/golden/journey_begins.physics.txt
```

The trace has one line per logical step: 0-based step, x, y, vx, vy, on-ground (1/0). The first line in
the committed golden is step 0 after the first 15 ms update, so the port's test starts at frame 0 with
the first demo frame.

The original exits through `std::exit`, and its SDL/TTF teardown can print a signal 11 after the trace
is complete; the trace file and its 640 lines are written and flushed before that and are what matters.

## The port side

`test/loader.ts` gives the simulation the real `.stl`/`.strf`/`.sprite` text and the PNG dimensions
from the shipped assets (no browser needed). `test/oracle.test.ts` runs the same frames with the same
15 ms step and asserts x/y within 0.2 px (actual maximum 0.1 px), vx/vy within 0.01, and the exact
on-ground flag for all 640 steps.
