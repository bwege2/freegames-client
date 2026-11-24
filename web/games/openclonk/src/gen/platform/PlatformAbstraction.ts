// @ts-nocheck
// OpenClonk 36de799: src/platform/PlatformAbstraction.cpp, src/platform/PlatformAbstraction.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { c$execv, c$execvp, c$exit, c$fork, c$perror, c$setlocale, c$strcasecmp, c$strstr } from '../../rt/libc.ts';
import { $own, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $begin, $end, seq_data, seq_insert } from '../../rt/std.ts';

export function IsGermanSystem() {
  if (c$strstr(c$setlocale(5, null), S("de")) != null) {
    return true;
  } else {
    return false;
  }
}

export function EraseItemSafe(_szFilename) {
  return false;
}

export function OpenURL(_0) {
  return false;
}

export function RestartApplication(parameters) {
  let success = false;
  let pid = 0;
  switch (pid = c$fork()) {
    case -1:
      break;
    case 0:
      {
        let params = $own([$.Application.argv0]);
        seq_insert(params, $end(params), $begin(parameters), $end(parameters));
        params.push(null);
        c$execv(S("/proc/self/exe"), seq_data(params));
        c$perror(S("editor launch via /proc/self/exe failed"));
        c$execvp($.Application.argv0, seq_data(params));
        c$perror(S("editor launch via argv[0] failed"));
        c$exit(1);
      }
    default:
      success = true;
  }
  if (success) {
    $.Application.Quit$v();
  }
  return success;
}

export function stricmp(s1, s2) {
  return c$strcasecmp(s1, s2);
}

export function $init(): void {
}

Object.assign($, { EraseItemSafe, IsGermanSystem, OpenURL, RestartApplication, stricmp });
