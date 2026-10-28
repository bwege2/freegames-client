// The runtime of the translated COW (../cow/, re/netrek/tools/c2ts/CONVENTIONS.md): what its C code takes
// from the C library, Unix, Xlib and Imlib2, and the helpers of the translation. Started from the NetHack
// port's runtime (web/games/nethack/src/rt/), as the translator was.
export { G } from '../cow/globals.ts';
export {
  Ptr, P, S, $rd, $wr, $peq, $cs, $ta, $view8, $u64, $shl64, $shr64, $sarr, $sarrOf, $rows, $salloc, $bytes, $arr, $cparr,
  $cpvals, $sadd, $sat, $at2, $sidx, $sdiff, $mem, $uget, $uset, $mcopy, $cast, $pcast,
} from './ptr.ts';
export {
  strlen, strcpy, strncpy, strcat, strncat, strcmp, strncmp, strchr, strrchr, strstr, strerror, memset, memcpy, memcmp,
  isspace, isupper, islower, isalpha, isdigit, isalnum, isxdigit, isprint, isgraph, iscntrl, ispunct, tolower, toupper,
  atoi, atol, strtol, abs, __ctype_b_loc, strdup, strncasecmp, strcasecmp, memccpy, bzero, strtok,
} from './cstring.ts';
export { VaList, sprintf, vsprintf, snprintf, vsnprintf, sscanf } from './printf.ts';
export {
  R, open, creat, close, read, write, lseek, unlink, rename, link, access, stat, fstat, chmod, umask, fcntl, chdir,
  getcwd, fopen, fdopen, freopen, fclose, fflush, fileno, setbuf, clearerr, feof, ferror, rewind, fseek, ftell, fgets,
  ungetc, fputs, fputc, putc, putchar, puts, fread, fwrite, fprintf, vfprintf, printf, vprintf, perror, fscanf,
} from './fs.ts';
export {
  usleep, sleep, pause, select, time, gettimeofday, localtime, ctime, getuid, getpid, getenv, getpwuid, atexit, exit, _exit,
  abort, longjmp, signal, kill, fork, vfork, waitpid, execvp, setpgid, popen, pclose, shmget, shmat, shmctl, free,
  setlocale, qsort, bsearch, srandom, random, sin, cos, sqrt, atan2, hypot, rint,
} from './sys.ts';
export { LongJmp, Exit } from './platform.ts';
export { calloc, realloc, fts_open, fts_read, fts_close } from './libc.ts';
export {
  socket, connect, shutdown, setsockopt, getsockname, getpeername, bind, listen, accept, sendto, recvfrom,
  getprotobyname, inet_addr, inet_ntoa, gethostbyname, gethostbyaddr, htons, ntohs, htonl, ntohl,
} from './net.ts';
export * from './x11.ts';
export * from './imlib.ts';
