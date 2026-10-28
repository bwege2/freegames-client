/* The oracle's curses.h (build.sh puts this directory first on the include path): termcap.c and
   unixtty.c include <curses.h> on Linux only for the terminfo calls and colour numbers below; stub.c
   implements the calls with one fixed terminal entry. */
#ifndef NH_ORACLE_CURSES_H
#define NH_ORACLE_CURSES_H
#define COLOR_BLACK 0
#define COLOR_RED 1
#define COLOR_GREEN 2
#define COLOR_YELLOW 3
#define COLOR_BLUE 4
#define COLOR_MAGENTA 5
#define COLOR_CYAN 6
#define COLOR_WHITE 7
/* tgetent(), tgetstr() & co. are declared by NetHack's system.h */
extern char *tparm(const char *, ...);
extern int has_colors(void);
#endif
