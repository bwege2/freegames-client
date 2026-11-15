// The runtime of the translated program: what its C code takes from the C library and its platform
// layer, and the helpers of the translation (re/brogue/tools/c2ts/CONVENTIONS.md).
export { G } from '../game/globals.ts';
export {
  Ptr, P, S, $rd, $wr, $peq, $cs, $ta, $view8, $u64, $mul64, $realloc, $shl64, $shr64, $sarr, $sarrOf, $rows, $salloc, $bytes,
  $arr, $cparr, $cpvals, $sadd, $sat, $at2, $sidx, $sdiff, $umember, $udecode, $uclone,
} from './ptr.ts';
export {
  strlen, strcpy, strncpy, strcat, strncat, strcmp, strncmp, strchr, strrchr, strstr, memset, memcpy, memcmp,
  isspace, isupper, islower, isalpha, isdigit, isalnum, isprint, tolower, toupper, atoi, atol, strtol, abs,
} from './cstring.ts';
export { VaList, sprintf, vsprintf, snprintf, vsnprintf, sscanf } from './printf.ts';
export {
  R, fopen, fclose, fflush, feof, ferror, rewind, fseek, ftell, fgets, fputs, fputc, putc, putchar, puts, fread, fwrite,
  fprintf, vfprintf, printf, vprintf, perror, fscanf, remove, rename, unlink,
} from './fs.ts';
export { time, localtime, mktime, difftime, strftime, getenv, atexit, exit, abort, free, qsort, sin, cos, sqrt, lround, llabs } from './sys.ts';
export { listFiles } from './brogue.ts';
