#!/usr/bin/env bash
# Prints the text metrics of the game's fonts as JSON (see pango-metrics.c), measured in the
# oracle's environment: our SDL_Pango, DejaVu Sans only, LANG=C (as run.sh).
#   metrics.sh > fonts.json
set -euo pipefail
here=$(cd "$(dirname "$0")" && pwd)
. "$here/env.sh"
[ -x "$fb_work/pango-metrics" ] || { echo "run build.sh first" >&2; exit 1; }
exec env -i HOME="$fb_work" TZ=UTC LANG=C LANGUAGE= FONTCONFIG_FILE="$FONTCONFIG_FILE" \
  XDG_CONFIG_HOME="$fb_work/xdg/config" XDG_CACHE_HOME="$fb_work/xdg/cache" XDG_DATA_HOME="$fb_work/xdg/data" \
  LD_LIBRARY_PATH="$fb_prefix/lib:$fb_nixlib" "$fb_work/pango-metrics"
