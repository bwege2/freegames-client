// The C libraries whose enums and number typedefs the translated code names (SDL_TRUE, KMOD_LCTRL, the SDL_Scancode
// type, GLuint, ALint, ...). prune.py keeps only the original's own declarations, so ast.sh compiles this header with
// the game's flags and libenums.py writes their values to work/libenums.json for the translator (cpp2ts/config.py).
#include <stdio.h>
#include <SDL.h>
#include <SDL_syswm.h>
#include <ft2build.h>
#include FT_FREETYPE_H
#include <al.h>
#include <alc.h>
#include <AL/alut.h>
#include <vorbis/codec.h>
#include <vorbis/vorbisfile.h>
#include <png.h>
#include <jpeglib.h>
#include <epoxy/gl.h>
#include <poll.h>
#include <sys/eventfd.h>
#include <sys/timerfd.h>
