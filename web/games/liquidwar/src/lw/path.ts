// lw/path.ts: src/path.c lw_path_get_system_name: a file's name without directory and extension.

export function lw_path_get_system_name(filename: string): string {
  let start = filename;
  const slash = Math.max(filename.lastIndexOf('/'), -1);
  if (slash >= 0) start = filename.slice(slash + 1);
  else {
    const bs = filename.lastIndexOf('\\');
    if (bs >= 0) start = filename.slice(bs + 1);
  }
  const dot = start.indexOf('.');
  return dot >= 0 ? start.slice(0, dot) : start;
}
