#!/usr/bin/env bash
# Builds MIR 0.51.1 from re/madness/orig/mir (fetch.sh) with the oracle driver and writes the golden file the
# port's test compares with: web/games/madness/test/golden/oracle.json. Needs the .NET 9 SDK (DOTNET=path/to/dotnet,
# or dotnet on the PATH) and network access for NuGet. Two changes to the build, none to the code: the Harmony
# submodule (a mod loader the oracle never calls) comes from NuGet (Lib.Harmony 2.3.3) instead of a checkout, and the
# post-build step that packs the game's assets is left out.
set -euo pipefail
cd "$(dirname "$0")"
DOTNET="${DOTNET:-dotnet}"
mir=../orig/mir/src
[[ -d "$mir/BigGustave/src" ]] || git clone -q --depth 1 https://github.com/mestiez/BigGustave "$mir/BigGustave"
python3 -I - "$mir/MadnessInteractiveReloaded/MIR.csproj" <<'PY'
import re, sys
p = sys.argv[1]
s = open(p, encoding='utf-8-sig').read()
s = s.replace('<ProjectReference Include="..\\Harmony\\Harmony\\Harmony.csproj" />', '<PackageReference Include="Lib.Harmony" Version="2.3.3" />')
s = re.sub(r'<Target Name="Post(Build|Publish)".*?</Target>', '', s, flags=re.S)
open(p, 'w', encoding='utf-8').write(s)
PY
export DOTNET_CLI_TELEMETRY_OPTOUT=1 DOTNET_NOLOGO=1
"$DOTNET" build -c Release -v q -nologo -p:ProduceReferenceAssembly=false
out=../../../web/games/madness/test/golden
mkdir -p "$out"
"$DOTNET" bin/Release/net9.0/Oracle.dll "$mir/MadnessInteractiveReloaded/base" "$out/oracle.json"
echo "wrote $out/oracle.json ($(du -h "$out/oracle.json" | cut -f1))"
