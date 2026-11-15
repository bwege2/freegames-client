/* A fake Xlib for running xlincity 1.13.1 headless, driven by a script.
 * Virtual clock: gettimeofday/time read it, select() advances it by its timeout,
 * XPending() advances it by 1 ms when nothing is due.  Script lines:
 *   seed N                     time(0) returns N (srand(time(0)) in main.c)
 *   T move X Y                 pointer position from T ms on
 *   T key K [shift]            KeyPress (K: one character, or Left Right Up Down BackSpace Delete Return Escape Space)
 *   T press B [shift]          ButtonPress  (B = 1, 2, 3, 4, 5)
 *   T release B                ButtonRelease
 *   T resize W H               ConfigureNotify
 *   T dump NAME                write the state (dump.c) when the program next polls X
 *   T quit                     exit(0)
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/time.h>
#include <sys/select.h>
#include <time.h>
#include <X11/Xlib.h>
#include <X11/Xutil.h>
#include <X11/keysym.h>

void oracle_dump (const char *name);

typedef struct { long t; char op[16]; char a[64]; int x, y; int shift; } Entry;
static Entry *ents; static int nents, cur;
static long long now_us = 1000000000LL * 1000000LL;
static long long start_us;
static int ptr_x = 0, ptr_y = 0;
static int pending_map, pending_motion, buttons_down;
static unsigned char fake_pal[768];
static long seed_val = 1;

static void load_script (void)
{
    const char *fn = getenv ("ORACLE_SCRIPT");
    FILE *f; char line[256]; int cap = 0;
    start_us = now_us;
    if (!fn || !(f = fopen (fn, "r"))) { fprintf (stderr, "no ORACLE_SCRIPT\n"); exit (2); }
    while (fgets (line, sizeof line, f)) {
        Entry e; char w2[64], w3[64], w4[64]; int n;
        memset (&e, 0, sizeof e);
        if (line[0] == '#' || line[0] == '\n') continue;
        if (sscanf (line, "seed %ld", &seed_val) == 1) continue;
        n = sscanf (line, "%ld %15s %63s %63s %63s", &e.t, e.op, w2, w3, w4);
        if (n < 2) continue;
        if (n >= 3) strcpy (e.a, w2);
        if (!strcmp (e.op, "move") || !strcmp (e.op, "resize")) { e.x = atoi (w2); e.y = atoi (w3); }
        if ((n >= 4 && !strcmp (w3, "shift")) || (n >= 5 && !strcmp (w4, "shift"))) e.shift = 1;
        if (nents == cap) { cap = cap ? cap * 2 : 256; ents = realloc (ents, cap * sizeof (Entry)); }
        ents[nents++] = e;
    }
    fclose (f);
}

static long now_ms (void) { return (long) ((now_us - start_us) / 1000); }

/* moves and dumps that are due; returns the next due event, or NULL */
static Entry *due (void)
{
    if (!ents) load_script ();
    while (cur < nents && ents[cur].t <= now_ms ()) {
        Entry *e = &ents[cur];
        if (!strcmp (e->op, "move")) {
            ptr_x = e->x; ptr_y = e->y; cur++;
            if (buttons_down) pending_motion = buttons_down;
            continue;
        }
        if (!strcmp (e->op, "dump")) { cur++; oracle_dump (e->a); continue; }
        if (!strcmp (e->op, "quit")) { exit (0); }
        return e;
    }
    if (cur >= nents) exit (0);
    return NULL;
}

int __wrap_gettimeofday (struct timeval *tv, void *tz)
{
    if (!ents) load_script ();
    tv->tv_sec = now_us / 1000000; tv->tv_usec = now_us % 1000000;
    return 0;
}
time_t __wrap_time (time_t *t) { if (!ents) load_script (); if (t) *t = seed_val; return seed_val; }
int __wrap_select (int n, fd_set *r, fd_set *w, fd_set *e, struct timeval *tv)
{
    if (tv) now_us += tv->tv_sec * 1000000LL + tv->tv_usec;
    return 0;
}

static Display *the_dpy;
Display *XOpenDisplay (_Xconst char *name)
{
    _XPrivDisplay d = calloc (1, sizeof (*d));
    Screen *s = calloc (1, sizeof (Screen));
    Visual *v = calloc (1, sizeof (Visual));
    v->class = TrueColor; v->map_entries = 256; v->bits_per_rgb = 8;
    s->root = 1; s->width = 1920; s->height = 1080; s->root_depth = 24; s->root_visual = v;
    d->screens = s; d->default_screen = 0; d->nscreens = 1;
    the_dpy = (Display *) d;
    return the_dpy;
}
Window XCreateWindow (Display *d, Window p, int x, int y, unsigned w, unsigned h, unsigned bw, int depth,
                      unsigned cls, Visual *v, unsigned long mask, XSetWindowAttributes *a) { return 2; }
Window XCreateSimpleWindow (Display *d, Window p, int x, int y, unsigned w, unsigned h, unsigned bw,
                            unsigned long b, unsigned long bg) { return 3; }
int XDestroyWindow (Display *d, Window w) { return 0; }
int XSetNormalHints (Display *d, Window w, XSizeHints *h) { return 0; }
Atom XInternAtom (Display *d, _Xconst char *n, Bool o) { return 1; }
int XChangeProperty (Display *d, Window w, Atom p, Atom t, int f, int m, _Xconst unsigned char *data, int n) { return 0; }
int XSetWMHints (Display *d, Window w, XWMHints *h) { return 0; }
int XSelectInput (Display *d, Window w, long m) { return 0; }
int XMapWindow (Display *d, Window w) { if (w == 2) pending_map = 1; return 0; }
GC XCreateGC (Display *d, Drawable dr, unsigned long m, XGCValues *v) { return (GC) calloc (1, 64); }
int XSetForeground (Display *d, GC g, unsigned long c) { return 0; }
int XSetBackground (Display *d, GC g, unsigned long c) { return 0; }
int XSetGraphicsExposures (Display *d, GC g, Bool b) { return 0; }
Cursor XCreateFontCursor (Display *d, unsigned int s) { return 5; }
int XDefineCursor (Display *d, Window w, Cursor c) { return 0; }
Status XAllocColorCells (Display *d, Colormap c, Bool cont, unsigned long *pm, unsigned np, unsigned long *px, unsigned n) { return 0; }
Colormap XCreateColormap (Display *d, Window w, Visual *v, int a) { return 7; }
static int alloc_n;
Status XAllocColor (Display *d, Colormap c, XColor *col)
{
    /* do_setcustompalette allocates colours 0..255 in order; 16-bit components, the server keeps 8 */
    int n = alloc_n++ % 256;
    fake_pal[n * 3] = col->red >> 10; fake_pal[n * 3 + 1] = col->green >> 10; fake_pal[n * 3 + 2] = col->blue >> 10;
    col->pixel = n; return 1;
}
const unsigned char *oracle_palette (void) { return fake_pal; }
int XStoreColors (Display *d, Colormap c, XColor *col, int n) { return 0; }
int XFlush (Display *d) { return 0; }
int XSync (Display *d, Bool b) { return 0; }
int XSetWindowColormap (Display *d, Window w, Colormap c) { return 0; }
Colormap XDefaultColormap (Display *d, int s) { return 6; }
int XDrawPoint (Display *d, Drawable w, GC g, int x, int y) { return 0; }
int XFillRectangle (Display *d, Drawable w, GC g, int x, int y, unsigned a, unsigned b) { return 0; }
int XDrawLine (Display *d, Drawable w, GC g, int x, int y, int a, int b) { return 0; }
static int fake_put_pixel (XImage *im, int x, int y, unsigned long p) { return 0; }
static int fake_destroy (XImage *im) { free (im->data); free (im); return 0; }
XImage *XCreateImage (Display *d, Visual *v, unsigned depth, int fmt, int off, char *data, unsigned w, unsigned h, int pad, int bpl)
{
    XImage *im = calloc (1, sizeof (XImage));
    im->width = w; im->height = h; im->bytes_per_line = w * 4;
    im->f.put_pixel = fake_put_pixel; im->f.destroy_image = fake_destroy;
    return im;
}
int XPutImage (Display *d, Drawable w, GC g, XImage *im, int sx, int sy, int dx, int dy, unsigned a, unsigned b) { return 0; }
Pixmap XCreatePixmap (Display *d, Drawable w, unsigned a, unsigned b, unsigned depth) { return 9; }
int XCopyArea (Display *d, Drawable s, Drawable t, GC g, int sx, int sy, unsigned w, unsigned h, int dx, int dy) { return 0; }
int XGrabPointer (Display *d, Window w, Bool o, unsigned m, int pm, int km, Window c, Cursor cu, Time t) { return 0; }
int XUngrabPointer (Display *d, Time t) { return 0; }
int XParseGeometry (_Xconst char *s, int *x, int *y, unsigned *w, unsigned *h) { return 0; }
Bool XCheckMaskEvent (Display *d, long m, XEvent *e) { return False; }
Bool XCheckTypedEvent (Display *d, int t, XEvent *e) { return False; }

int XPending (Display *d)
{
    if (getenv ("ORACLE_TRACE")) fprintf (stderr, "XPending %ld\n", now_ms ());
    if (pending_map || pending_motion) return 1;
    if (due ()) return 1;
    now_us += 1000;
    return 0;
}

static KeySym keysym_of (const char *a, char *ch)
{
    *ch = 0;
    if (!strcmp (a, "Left")) return XK_Left;
    if (!strcmp (a, "Right")) return XK_Right;
    if (!strcmp (a, "Up")) return XK_Up;
    if (!strcmp (a, "Down")) return XK_Down;
    if (!strcmp (a, "BackSpace")) { *ch = 8; return XK_BackSpace; }
    if (!strcmp (a, "Delete")) { *ch = 127; return XK_Delete; }
    if (!strcmp (a, "Return")) { *ch = 13; return XK_Return; }
    if (!strcmp (a, "Escape")) { *ch = 27; return XK_Escape; }
    if (!strcmp (a, "Space")) { *ch = ' '; return XK_space; }
    *ch = a[0];
    return (KeySym) (unsigned char) a[0];
}

int XNextEvent (Display *d, XEvent *ev)
{
    Entry *e;
    if (pending_map) { pending_map = 0; memset (ev, 0, sizeof *ev); ev->type = MapNotify; return 0; }
    if (pending_motion) {
        memset (ev, 0, sizeof *ev); ev->type = MotionNotify; ev->xmotion.state = pending_motion;
        pending_motion = 0; return 0;
    }
    while (!(e = due ())) now_us += 1000;
    cur++;
    memset (ev, 0, sizeof *ev);
    if (!strcmp (e->op, "key")) {
        ev->type = KeyPress;
        ev->xkey.keycode = (unsigned) (e - ents);   /* index, for XLookupString */
        ev->xkey.state = e->shift ? ShiftMask : 0;
    } else if (!strcmp (e->op, "press") || !strcmp (e->op, "release")) {
        ev->type = e->op[0] == 'p' ? ButtonPress : ButtonRelease;
        ev->xbutton.button = atoi (e->a);
        ev->xbutton.state = e->shift ? ShiftMask : 0;
        if (ev->xbutton.button >= 1 && ev->xbutton.button <= 3) {
            if (ev->type == ButtonPress) buttons_down |= Button1Mask << (ev->xbutton.button - 1);
            else buttons_down &= ~(Button1Mask << (ev->xbutton.button - 1));
        }
    } else if (!strcmp (e->op, "resize")) {
        ev->type = ConfigureNotify;
        ev->xconfigure.width = e->x; ev->xconfigure.height = e->y;
    }
    return 0;
}

int XLookupString (XKeyEvent *k, char *buf, int n, KeySym *ks, XComposeStatus *st)
{
    char ch;
    *ks = keysym_of (ents[k->keycode].a, &ch);
    buf[0] = ch; buf[1] = 0;
    return ch ? 1 : 0;
}

Bool XQueryPointer (Display *d, Window w, Window *r, Window *c, int *rx, int *ry, int *wx, int *wy, unsigned *m)
{
    due ();
    *wx = ptr_x; *wy = ptr_y;
    return True;
}

/* malloc returns zeroed memory, so that the program's reads of memory it never wrote (power.c's new
   grids) are the same in every run (re/lincity/NOTES.md, "Uninitialised memory") */
void *__real_malloc (size_t n);
void *__wrap_malloc (size_t n) { void *p = __real_malloc (n); if (p) memset (p, 0, n); return p; }
