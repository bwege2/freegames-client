// The runtime of the translated program: what its C code takes from the C library, Unix and the
// terminal, and the helpers of the translation (CONVENTIONS.md).
export { G } from '../globals.ts';
export {
  Ptr, P, S, $rd, $wr, $peq, $cs, $ta, $view8, $u64, $shl64, $shr64, $sarr, $sarrOf, $rows, $salloc, $bytes, $arr, $cparr, $cpvals, $sadd, $sat, $at2, $sidx,
  $sdiff, $umember, $udecode, $uclone,
} from './ptr.ts';
export {
  strlen, strcpy, strncpy, strcat, strncat, strcmp, strncmp, strchr, strrchr, strstr, strerror, memset, memcpy, memcmp,
  isspace, isupper, islower, isalpha, isdigit, isalnum, isxdigit, isprint, isgraph, iscntrl, ispunct, tolower, toupper,
  atoi, atol, strtol, abs,
} from './cstring.ts';
export { VaList, sprintf, vsprintf, snprintf, vsnprintf, sscanf } from './printf.ts';
export {
  R, open, creat, close, read, write, lseek, unlink, rename, link, access, stat, fstat, chmod, umask, fcntl, chdir,
  getcwd, fopen, fdopen, freopen, fclose, fflush, fileno, setbuf, clearerr, feof, ferror, rewind, fseek, ftell, fgets,
  ungetc, fputs, fputc, putc, putchar, puts, fread, fwrite, fprintf, vfprintf, printf, vprintf, perror, fscanf,
} from './fs.ts';
export {
  getchar, fgetc, getc, usleep, sleep, time, localtime, mktime, getuid, geteuid, getgid, getegid, setuid, setgid,
  getpid, getenv, getlogin, getpwuid, getpwnam, atexit, exit, abort, signal, sigaction, kill, fork, wait, execl, execv,
  free, isatty, ioctl, tcgetattr, tcsetattr, cfgetospeed, fpathconf, qsort, regcomp, regexec, regerror, regfree,
} from './sys.ts';
export { tgetent, tgetnum, tgetflag, tgetstr, tgoto, tputs, tparm, has_colors } from './termcap.ts';
export { whichrng, init_isaac64, RND, rn2_on_display_rng, sys_random_seed } from './rng.ts';
