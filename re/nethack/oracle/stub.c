/* The oracle's world: what NetHack 3.6.7 gets from the system, fixed so that a run can be replayed,
 * and recorded so that the port can be compared with it (re/nethack/NOTES.md, "The oracle").
 *
 * Linked into nethack-oracle by build.sh with ld --wrap for the libc functions below. Environment:
 *   NH_KEYS    file with the keys of the run (bytes), handed out one by one by getchar()
 *   NH_KEYS_FIFO  instead: a pipe the keys come through one at a time (bot.py plays live)
 *   NH_FRAMES  file the frames are written to, one line each:
 *                K <key index> <bytes written to stdout so far> <random() calls so far>
 *              when a key is read, E ... when the keys are used up (the run ends with status 99),
 *              X ... when the program exits; "random() calls" counts the draws from ISAAC64
 *   NH_SEED    the seed (decimal, unsigned long): the n-th fopen("/dev/urandom") (from 0) reads the
 *              8 bytes of NH_SEED + n
 *   NH_TIME    time() (seconds since 1970, UTC)
 *   NH_LOGIN   the login name (getlogin(), getpwuid(), getpwnam()); the uid is 1000, the pid 4242
 * stdout must be a regular file: the frames record offsets into it.
 *
 * The terminal is a fixed termcap entry (tgetent() and friends, below): an 80x24 VT100 without
 * colours, the same entry the port's runtime has (web/games/nethack/src/rt/termcap.ts). The tty
 * settings (tcgetattr) are a Linux console's: erase ^?, kill ^U, interrupt ^C.
 */
#define _GNU_SOURCE
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <time.h>
#include <termios.h>
#include <pwd.h>
#include <sys/types.h>
#include <fcntl.h>
#include <execinfo.h>

static FILE *frames;
static unsigned char *keys;
static long nkeys, keypos;
static unsigned long rngcalls;
static int livefd = -1;

FILE *__real_fopen(const char *, const char *);

static long out_offset(void)
{
    fflush(stdout);
    return (long) lseek(1, 0, SEEK_CUR);
}

static void frame(char kind)
{
    if (!frames)
        return;
    fprintf(frames, "%c %ld %ld %lu\n", kind, keypos, out_offset(), rngcalls);
    fflush(frames);
}

static void at_exit(void)
{
    frame('X');
}

static void setup(void)
{
    static int done;
    const char *f;
    if (done)
        return;
    done = 1;
    if ((f = getenv("NH_FRAMES")) != 0)
        frames = __real_fopen(f, "w");
    if ((f = getenv("NH_KEYS_FIFO")) != 0) {
        /* live: the bot (bot.py) types the keys as it reads the screens */
        livefd = open(f, O_RDONLY);
    } else if ((f = getenv("NH_KEYS")) != 0) {
        FILE *k = __real_fopen(f, "rb");
        if (k) {
            fseek(k, 0, SEEK_END);
            nkeys = ftell(k);
            fseek(k, 0, SEEK_SET);
            keys = malloc(nkeys + 1);
            if (fread(keys, 1, nkeys, k) != (size_t) nkeys)
                nkeys = 0;
            fclose(k);
        }
    }
    atexit(at_exit);
}

int __wrap_getchar(void)
{
    setup();
    if (livefd >= 0) {
        unsigned char c;
        frame('K');
        if (read(livefd, &c, 1) == 1) {
            keypos++;
            return c;
        }
        /* the bot stopped: the keys are used up */
        frame('E');
        if (frames)
            fclose(frames);
        frames = 0;
        _exit(99);
    }
    if (keypos >= nkeys) {
        frame('E');
        if (frames)
            fclose(frames);
        frames = 0;
        _exit(99);
    }
    frame('K');
    return keys[keypos++];
}

/* glibc's stdio.h makes getchar() an inline getc(stdin) when optimising */
int __real_getc(FILE *);
int __real_fgetc(FILE *);
int __wrap_getc(FILE *f) { return f == stdin ? __wrap_getchar() : __real_getc(f); }
int __wrap_fgetc(FILE *f) { return f == stdin ? __wrap_getchar() : __real_fgetc(f); }

/* NetHack 3.6.7 draws from ISAAC64 (config.h: USE_ISAAC64), the core and the display generator */
unsigned long __real_isaac64_next_uint64(void *);
unsigned long __wrap_isaac64_next_uint64(void *ctx)
{
    static int trace = -1;
    rngcalls++;
    if (trace < 0) {
        /* NH_RNGTRACE=file: the callers of every draw (for finding where the port goes another way) */
        const char *t = getenv("NH_RNGTRACE");
        trace = t ? fileno(__real_fopen(t, "w")) : 0;
    }
    if (trace > 0) {
        void *bt[12];
        int n = backtrace(bt, 12);
        char line[512];
        int len = snprintf(line, sizeof line, "%lu", rngcalls);
        /* relative to main() (the binary is position independent) */
        extern int main(int, char **);
        for (int i = 1; i < n; i++)
            len += snprintf(line + len, sizeof line - len, " %ld", (long) ((char *) bt[i] - (char *) main));
        line[len++] = '\n';
        if (write(trace, line, len) < 0)
            trace = 0;
    }
    return __real_isaac64_next_uint64(ctx);
}

time_t __wrap_time(time_t *t)
{
    const char *s = getenv("NH_TIME");
    time_t v = s ? (time_t) strtoll(s, 0, 10) : 1700000000;
    setup();
    if (t)
        *t = v;
    return v;
}

FILE *__wrap_fopen(const char *path, const char *mode)
{
    setup();
    if (!strcmp(path, "/dev/urandom")) {
        /* the n-th opening (from 0) reads NH_SEED + n: the generators are seeded anew for every new
           level (reseed_random) */
        static unsigned long seed, opened;
        const char *s = getenv("NH_SEED");
        seed = (s ? strtoul(s, 0, 10) : 0) + opened++;
        return fmemopen(&seed, sizeof seed, "r");
    }
    return __real_fopen(path, mode);
}

pid_t __wrap_getpid(void) { return 4242; }
uid_t __wrap_getuid(void) { return 1000; }
uid_t __wrap_geteuid(void) { return 1000; }
gid_t __wrap_getgid(void) { return 1000; }
gid_t __wrap_getegid(void) { return 1000; }
int __wrap_isatty(int fd) { return fd >= 0 && fd <= 2; } /* the keys and the recording are the terminal */
int __wrap_usleep(useconds_t u) { (void) u; return 0; }
unsigned int __wrap_sleep(unsigned int s) { (void) s; return 0; }

static const char *login(void)
{
    const char *s = getenv("NH_LOGIN");
    return s ? s : "player";
}

char *__wrap_getlogin(void) { return (char *) login(); }

static struct passwd *pw(void)
{
    static struct passwd p;
    static char name[64];
    strncpy(name, login(), sizeof name - 1);
    p.pw_name = name;
    p.pw_passwd = (char *) "x";
    p.pw_uid = 1000;
    p.pw_gid = 1000;
    p.pw_gecos = name;
    p.pw_dir = (char *) ".";
    p.pw_shell = (char *) "/bin/sh";
    return &p;
}

struct passwd *__wrap_getpwuid(uid_t u) { return u == 1000 ? pw() : 0; }
struct passwd *__wrap_getpwnam(const char *n) { return !strcmp(n, login()) ? pw() : 0; }

int __wrap_tcgetattr(int fd, struct termios *t)
{
    (void) fd;
    memset(t, 0, sizeof *t);
    t->c_iflag = ICRNL | IXON;
    t->c_oflag = OPOST | ONLCR;
    t->c_cflag = CS8 | CREAD | B38400;
    t->c_lflag = ISIG | ICANON | ECHO | ECHOE | ECHOK | IEXTEN;
    t->c_cc[VINTR] = 3;
    t->c_cc[VQUIT] = 28;
    t->c_cc[VERASE] = 127;
    t->c_cc[VKILL] = 21;
    t->c_cc[VEOF] = 4;
    t->c_cc[VMIN] = 1;
    t->c_cc[VSUSP] = 26;
    cfsetospeed(t, B38400);
    cfsetispeed(t, B38400);
    return 0;
}

int __wrap_tcsetattr(int fd, int act, const struct termios *t)
{
    (void) fd; (void) act; (void) t;
    return 0;
}

/* ---- termcap: one fixed entry ---- */

short ospeed;
char PC;
char *BC, *UP;

static const struct { const char *id, *val; } strcaps[] = {
    { "cl", "\033[H\033[J" }, { "ce", "\033[K" }, { "cd", "\033[J" },
    { "cm", "\033[%i%d;%dH" }, { "ho", "\033[H" }, { "nd", "\033[C" },
    { "up", "\033[A" }, { "le", "\b" }, { "do", "\n" },
    { "so", "\033[7m" }, { "se", "\033[m" }, { "us", "\033[4m" }, { "ue", "\033[m" },
    { "md", "\033[1m" }, { "mr", "\033[7m" }, { "mb", "\033[5m" }, { "me", "\033[m" },
    { 0, 0 }
};

int tgetent(char *bp, const char *name)
{
    (void) bp; (void) name;
    return 1;
}

int tgetnum(const char *id)
{
    if (!strcmp(id, "co")) return 80;
    if (!strcmp(id, "li")) return 24;
    return -1;
}

int tgetflag(const char *id)
{
    return !strcmp(id, "am") || !strcmp(id, "xn") || !strcmp(id, "bs");
}

char *tgetstr(const char *id, char **area)
{
    int i;
    for (i = 0; strcaps[i].id; i++)
        if (!strcmp(strcaps[i].id, id)) {
            const char *v = strcaps[i].val;
            if (area && *area) {
                char *r = *area;
                strcpy(r, v);
                *area += strlen(v) + 1;
                return r;
            }
            return strdup(v);
        }
    return 0;
}

/* termcap's %-codes, as far as the entry above uses them: %i, %d, %. and %% */
char *tgoto(const char *cap, int col, int row)
{
    static char buf[64];
    char *b = buf;
    int args[2], n = 0;
    args[0] = row;
    args[1] = col;
    for (; *cap; cap++) {
        if (*cap != '%') {
            *b++ = *cap;
            continue;
        }
        switch (*++cap) {
        case 'i': args[0]++; args[1]++; break;
        case 'd': b += sprintf(b, "%d", args[n++ & 1]); break;
        case '.': *b++ = (char) args[n++ & 1]; break;
        case '%': *b++ = '%'; break;
        default: return (char *) "OOPS";
        }
    }
    *b = 0;
    return buf;
}

/* only reached with colours, which the entry does not have */
char *tparm(const char *s, ...) { (void) s; return (char *) ""; }
int has_colors(void) { return 0; }

int tputs(const char *str, int affcnt, int (*putc_)(int))
{
    (void) affcnt;
    if (!str) /* as ncurses' tputs: ERR */
        return -1;
    while (*str) {
        if (str[0] == '$' && str[1] == '<' && strchr(str, '>')) { /* terminfo padding: none */
            str = strchr(str, '>') + 1;
            continue;
        }
        putc_((unsigned char) *str++);
    }
    return 0;
}
