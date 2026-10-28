/*
 * The oracle's connection to the world: linked into the original Abuse 0.8 (build.sh) with
 * `ld --wrap`, it replaces what the program takes from the system and records what it shows.
 *
 * - The clock (gettimeofday, time, usleep, SDL_Delay): virtual. It starts at the session's
 *   seed (time(NULL) returns the seed, so jrand_init() sets rand_on = seed % 1024) and only
 *   advances when the program waits (by exactly the time it asks for) and by 1 microsecond on
 *   every reading (so that the busy loops of the original, `while (now.diff_time(&start) < 0.18)`,
 *   end). The port's test clock (web/games/abuse/test/) does the same.
 * - Input (SDL_PollEvent, SDL_GetMouseState, SDL_GetModState, SDL_WM_GrabInput): from the
 *   session file ABUSE_SESSION. A session is a list of lines
 *       <flush> key <down|up> <SDL key name or number>
 *       <flush> mouse <x> <y>               (window pixels; the oracle runs with -scale 1)
 *       <flush> button <1|2|3|4|5> <down|up>
 *       <flush> end                          (exit after this flush)
 *   An event becomes visible to SDL_PollEvent after flush number <flush> (the first flush is
 *   number 1; events at 0 are there from the start), in the order of the file.
 * - Output: every call of update_window_done() (the end of update_dirty(), i.e. one flush of the
 *   screen to the window) is a frame. ABUSE_TRACE receives one line per frame:
 *       F <n> <virtual microseconds> <fnv32 of the window's 8-bit pixels> <fnv32 of the palette> [game state]
 *   and the lines the sound layer writes (sound_rec.cpp). ABUSE_FRAMES=<dir> also writes every
 *   frame as <dir>/<n>.raw (320x200 pixels, then 768 bytes of palette).
 */
#include <SDL.h>
#include <sys/time.h>
#include <time.h>
#include <unistd.h>
#include <ctype.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>
#include <vector>
#include <string>

#define private public
#define protected public
#include "common.h"
#include "game.h"
#include "level.h"
#include "objects.h"
#include "view.h"
#include "jrand.h"
#include "palette.h"
#undef private
#undef protected

extern SDL_Surface *window, *surface;
extern palette *lastl;

FILE *oracle_trace = NULL;
static char const *frames_dir = NULL;

static void open_trace()
{
    if (oracle_trace) return;
    char const *fn = getenv("ABUSE_TRACE");
    oracle_trace = fn ? fopen(fn, "w") : stdout;
    frames_dir = getenv("ABUSE_FRAMES");
}

void open_trace_file() { open_trace(); }

// ---------------------------------------------------------------- the clock
static int64_t vclock_us = 0;      // virtual microseconds since the epoch
static int64_t seed = 0;
static bool clock_ready = false;

static void clock_init()
{
    if (clock_ready) return;
    clock_ready = true;
    char const *s = getenv("ABUSE_SEED");
    seed = s ? atoll(s) : 0;
    vclock_us = seed * 1000000LL;
}

extern "C" int __wrap_gettimeofday(struct timeval *tv, void *tz)
{
    clock_init();
    vclock_us += 1;
    if (tv)
    {
        tv->tv_sec = vclock_us / 1000000;
        tv->tv_usec = vclock_us % 1000000;
    }
    return 0;
}

extern "C" time_t __wrap_time(time_t *t)
{
    clock_init();
    time_t r = (time_t)seed;
    if (t) *t = r;
    return r;
}

extern "C" int __wrap_usleep(useconds_t us)
{
    clock_init();
    vclock_us += us;
    return 0;
}

extern "C" void __wrap_SDL_Delay(Uint32 ms)
{
    clock_init();
    vclock_us += (int64_t)ms * 1000;
}

extern "C" Uint32 __wrap_SDL_GetTicks(void)
{
    clock_init();
    return (Uint32)((vclock_us - seed * 1000000LL) / 1000);
}

// ---------------------------------------------------------------- input
struct ScriptEvent { long flush; SDL_Event ev; bool end; };
static std::vector<ScriptEvent> script;
static size_t script_on = 0;
static long flushes = 0;
static int mouse_x = 0, mouse_y = 0;
static Uint8 mouse_buttons = 0;
static SDLMod mod_state = KMOD_NONE;
static bool script_loaded = false;

static SDLKey key_by_name(char const *name)
{
    if (isdigit((unsigned char)name[0]) && name[1]) return (SDLKey)atoi(name);
    if (strlen(name) == 1) return (SDLKey)(unsigned char)name[0];
    struct { char const *n; SDLKey k; } names[] = {
        {"RETURN", SDLK_RETURN}, {"ESCAPE", SDLK_ESCAPE}, {"SPACE", SDLK_SPACE}, {"TAB", SDLK_TAB},
        {"BACKSPACE", SDLK_BACKSPACE}, {"UP", SDLK_UP}, {"DOWN", SDLK_DOWN}, {"LEFT", SDLK_LEFT},
        {"RIGHT", SDLK_RIGHT}, {"LSHIFT", SDLK_LSHIFT}, {"RSHIFT", SDLK_RSHIFT}, {"LCTRL", SDLK_LCTRL},
        {"RCTRL", SDLK_RCTRL}, {"LALT", SDLK_LALT}, {"RALT", SDLK_RALT}, {"INSERT", SDLK_INSERT},
        {"HOME", SDLK_HOME}, {"END", SDLK_END}, {"PAGEUP", SDLK_PAGEUP}, {"PAGEDOWN", SDLK_PAGEDOWN},
        {"F1", SDLK_F1}, {"F2", SDLK_F2}, {"F3", SDLK_F3}, {"F4", SDLK_F4}, {"F5", SDLK_F5},
        {"F6", SDLK_F6}, {"F7", SDLK_F7}, {"F8", SDLK_F8}, {"F9", SDLK_F9}, {"F10", SDLK_F10},
        {"DELETE", SDLK_DELETE}, {"CAPSLOCK", SDLK_CAPSLOCK},
    };
    for (size_t i = 0; i < sizeof(names) / sizeof(*names); i++)
        if (!strcmp(names[i].n, name)) return names[i].k;
    fprintf(stderr, "oracle: unknown key %s\n", name);
    exit(2);
}

static void load_script()
{
    if (script_loaded) return;
    script_loaded = true;
    char const *fn = getenv("ABUSE_SESSION");
    if (!fn) return;
    FILE *fp = fopen(fn, "r");
    if (!fp) { fprintf(stderr, "oracle: cannot read %s\n", fn); exit(2); }
    char line[256];
    while (fgets(line, sizeof(line), fp))
    {
        char *p = line;
        while (*p == ' ' || *p == '\t') p++;
        if (*p == '#' || *p == '\n' || !*p) continue;
        long at; char what[32], a[64] = "", b[64] = "", c[64] = "";
        if (sscanf(p, "%ld %31s %63s %63s %63s", &at, what, a, b, c) < 2) continue;
        ScriptEvent se;
        memset(&se.ev, 0, sizeof(se.ev));
        se.flush = at;
        se.end = false;
        if (!strcmp(what, "key"))
        {
            se.ev.type = !strcmp(a, "down") ? SDL_KEYDOWN : SDL_KEYUP;
            se.ev.key.keysym.sym = key_by_name(b);
        }
        else if (!strcmp(what, "mouse"))
        {
            se.ev.type = SDL_MOUSEMOTION;
            se.ev.motion.x = atoi(a);
            se.ev.motion.y = atoi(b);
        }
        else if (!strcmp(what, "button"))
        {
            se.ev.type = !strcmp(b, "down") ? SDL_MOUSEBUTTONDOWN : SDL_MOUSEBUTTONUP;
            se.ev.button.button = atoi(a);
        }
        else if (!strcmp(what, "end"))
            se.end = true;
        else
        {
            fprintf(stderr, "oracle: bad line %s", line);
            exit(2);
        }
        script.push_back(se);
    }
    fclose(fp);
}

static SDLMod mod_of(SDLKey k)
{
    switch (k)
    {
    case SDLK_LSHIFT: return KMOD_LSHIFT;
    case SDLK_RSHIFT: return KMOD_RSHIFT;
    case SDLK_LCTRL: return KMOD_LCTRL;
    case SDLK_RCTRL: return KMOD_RCTRL;
    case SDLK_LALT: return KMOD_LALT;
    case SDLK_RALT: return KMOD_RALT;
    default: return KMOD_NONE;
    }
}

static long idle_polls = 0;
static void stuck()
{
    if (++idle_polls < 2000000) return;
    open_trace();
    { fprintf(oracle_trace, "X waiting for input after frame %ld\n", flushes); fflush(oracle_trace); }
    _exit(4);
}

extern "C" int __wrap_SDL_PollEvent(SDL_Event *ev)
{
    load_script();
    if (script_on >= script.size() || script[script_on].flush > flushes || script[script_on].end)
    {
        stuck();
        return 0;
    }
    idle_polls = 0;
    if (!ev) return 1;
    *ev = script[script_on++].ev;
    switch (ev->type)
    {
    case SDL_KEYDOWN:
        mod_state = (SDLMod)(mod_state | mod_of(ev->key.keysym.sym));
        ev->key.keysym.mod = mod_state;
        break;
    case SDL_KEYUP:
        mod_state = (SDLMod)(mod_state & ~mod_of(ev->key.keysym.sym));
        ev->key.keysym.mod = mod_state;
        break;
    case SDL_MOUSEMOTION:
        mouse_x = ev->motion.x;
        mouse_y = ev->motion.y;
        ev->motion.state = mouse_buttons;
        break;
    case SDL_MOUSEBUTTONDOWN:
        mouse_buttons |= SDL_BUTTON(ev->button.button);
        ev->button.x = mouse_x; ev->button.y = mouse_y;
        break;
    case SDL_MOUSEBUTTONUP:
        mouse_buttons &= ~SDL_BUTTON(ev->button.button);
        ev->button.x = mouse_x; ev->button.y = mouse_y;
        break;
    }
    return 1;
}

extern "C" Uint8 __wrap_SDL_GetMouseState(int *x, int *y)
{
    if (x) *x = mouse_x;
    if (y) *y = mouse_y;
    return mouse_buttons;
}

extern "C" SDLMod __wrap_SDL_GetModState(void)
{
    return mod_state;
}

extern "C" SDL_GrabMode __wrap_SDL_WM_GrabInput(SDL_GrabMode mode)
{
    return SDL_GRAB_OFF;
}

// ---------------------------------------------------------------- frames
static uint32_t fnv(uint8_t const *p, size_t n, uint32_t h = 2166136261u)
{
    for (size_t i = 0; i < n; i++) { h ^= p[i]; h *= 16777619u; }
    return h;
}

static uint32_t mix(uint32_t h, int32_t v)
{
    uint8_t b[4] = { (uint8_t)v, (uint8_t)(v >> 8), (uint8_t)(v >> 16), (uint8_t)(v >> 24) };
    return fnv(b, 4, h);
}

static void write_state(FILE *fp)
{
    if (!the_game) return;
    fprintf(fp, " st=%d", the_game->state);
    if (!current_level) return;
    fprintf(fp, " tick=%u rand=%u", current_level->tick_counter(), rand_on & 1023);
    for (view *v = player_list; v; v = v->next)
    {
        game_object *o = v->focus;
        if (!o) continue;
        fprintf(fp, " p%d=%d,%d,%d,%d,%d,%d,%d,%d", v->player_number, o->x, o->y, o->hp(),
                (int)o->state, o->current_frame, o->xvel(), o->yvel(), (int)v->current_weapon);
    }
    uint32_t h = 2166136261u;
    int n = 0;
    for (game_object *o = current_level->first_object(); o; o = o->next)
    {
        h = mix(h, o->otype); h = mix(h, o->x); h = mix(h, o->y); h = mix(h, (int)o->state);
        h = mix(h, o->current_frame); h = mix(h, o->hp()); h = mix(h, o->aistate());
        n++;
    }
    fprintf(fp, " objs=%d,%08x", n, h);
}

extern "C" void __real__Z18update_window_donev();
extern "C" void __wrap__Z18update_window_donev()
{
    __real__Z18update_window_donev();
    flushes++;
    open_trace();
    uint8_t pal[768];
    memset(pal, 0, sizeof(pal));
    if (lastl)
        for (int i = 0; i < 256 && i < lastl->pal_size(); i++)
        {
            pal[i * 3] = lastl->red(i); pal[i * 3 + 1] = lastl->green(i); pal[i * 3 + 2] = lastl->blue(i);
        }
    uint8_t *px = (uint8_t *)surface->pixels;
    size_t npx = (size_t)surface->w * surface->h;
    fprintf(oracle_trace, "F %ld %lld %08x %08x", flushes,
            (long long)(vclock_us - seed * 1000000LL), fnv(px, npx), fnv(pal, 768));
    write_state(oracle_trace);
    fputc('\n', oracle_trace);
    fflush(oracle_trace);
    idle_polls = 0;
    if (frames_dir)
    {
        char fn[512];
        snprintf(fn, sizeof(fn), "%s/%06ld.raw", frames_dir, flushes);
        FILE *fp = fopen(fn, "wb");
        if (fp) { fwrite(px, 1, npx, fp); fwrite(pal, 1, 768, fp); fclose(fp); }
    }
    load_script();
    if (script_on < script.size() && script[script_on].end && script[script_on].flush <= flushes)
    {
        fprintf(oracle_trace, "E %ld\n", flushes);
        fflush(oracle_trace);
        _exit(0);
    }
    if (flushes > 200000)
    {
        fprintf(oracle_trace, "X too many frames\n");
        _exit(3);
    }
}
