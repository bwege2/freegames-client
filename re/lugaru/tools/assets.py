#!/usr/bin/env python3
"""Copies the data of the pinned Lugaru reference into web/games/lugaru/assets.

What is copied (and what is not):
  * Data/Models/*.solid, Data/Skeleton/*, Data/Animations/* -- the Wolfire character,
    object and animation data, unchanged (CC BY-SA 3.0).
  * Data/Textures/** except the Temple/Empire campaigns, the four AR PL UKai-derived
    Cl*.png, FontMono.png (SIL OFL 1.1) and the HD-only additions.  The pinned tree
    contains one texture set (max 1024x1024 terrain, 512x512 character skins), the
    2005 base set; no 2048 HD pack is present.  See web/games/lugaru/LICENSE.md.
  * Data/Sounds/*.ogg except Music1Desert/Music1Grass/Music1Snow/Music2/Music3: the
    port deliberately ships no music (the tracks' provenance is undocumented).
  * Data/Maps/Lugaru*.json, map*.json and tutorial.json -- the Wolfire main campaign,
    challenge maps and tutorial.  No sven*/jendraz*/task* community maps.
  * Data/Campaigns/main.txt, Data/Dialogues/*.txt.

Generated:
  * heightmap.json -- the red channel of Data/Textures/HeightMap.png in the original's
    heightmap indexing (height[x][z] = image(255-z, 255-x)), as integers 0..255.
  * animations.json -- the loadable entries of Source/Animation/Animation.def.
  * campaign.json -- the levels of Data/Campaigns/main.txt.
  * manifest.json -- every copied file with its size, for the tests and the README.

Run from re/lugaru/fetch.sh; it needs Pillow.
"""
from __future__ import annotations

import json
import os
import re
import shutil
import sys
from pathlib import Path

from PIL import Image

HERE = Path(__file__).resolve().parent
OUT = HERE.parents[2] / "web" / "games" / "lugaru" / "assets"
SRC = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else HERE.parent / "orig" / "lugaru-6a58b62"
DATA = SRC / "Data"

# Assets that the operator's variant B excludes.  The names are checked after copying.
EXCLUDED_TEXTURES = {
    "ClFeng.png", "ClHuo.png", "ClShan.png", "ClShui.png", "FontMono.png",
    # Temple campaign by Slib (its four Cl*.png replacements use AR PL UKai)
    "DesertCl.png", "GiTop.png", "GiTeared.png", "GiBottom.png", "Mask.png",
}
EXCLUDED_TEXTURE_DIRS = {"temple", "empire"}
MUSIC = {"Music1Desert.ogg", "Music1Grass.ogg", "Music1Snow.ogg", "Music2.ogg", "Music3.ogg"}


def copy(src: Path, dst: Path) -> None:
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dst)


def copy_tree(src: Path, dst: Path, skip_files=(), skip_dirs=()) -> None:
    for path in sorted(src.rglob("*")):
        rel = path.relative_to(src)
        if any(part in skip_dirs for part in rel.parts[:-1]):
            continue
        if path.is_dir():
            continue
        if path.name in skip_files:
            continue
        copy(path, dst / rel)


def main() -> None:
    if not (DATA / "Maps" / "Lugaru1.json").exists():
        raise SystemExit(f"not the Lugaru reference tree: {SRC}")

    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir(parents=True)

    # --- unchanged data -------------------------------------------------
    copy_tree(DATA / "Models", OUT / "Models")
    copy_tree(DATA / "Skeleton", OUT / "Skeleton")
    copy_tree(DATA / "Animations", OUT / "Animations")
    copy_tree(DATA / "Textures", OUT / "Textures", skip_files=EXCLUDED_TEXTURES, skip_dirs=EXCLUDED_TEXTURE_DIRS)
    copy_tree(DATA / "Sounds", OUT / "Sounds", skip_files=MUSIC)
    copy_tree(DATA / "Dialogues", OUT / "Dialogues")

    for name in sorted((DATA / "Maps").glob("Lugaru*.json")):
        copy(name, OUT / "Maps" / name.name)
    for name in sorted((DATA / "Maps").glob("map*.json")):
        copy(name, OUT / "Maps" / name.name)
    copy(DATA / "Maps" / "tutorial.json", OUT / "Maps" / "tutorial.json")
    copy(DATA / "Campaigns" / "main.txt", OUT / "Campaigns" / "main.txt")
    copy(DATA / "Textures" / "HeightMap.png", OUT / "HeightMap.png")

    # --- heightmap ------------------------------------------------------
    image = Image.open(DATA / "Textures" / "HeightMap.png").convert("RGB")
    size = image.size[0]
    assert image.size == (size, size) == (256, 256), image.size
    red = [0] * (size * size)
    for x in range(size):
        for z in range(size):
            # load_png flips vertically, then Terrain::load flips the first index
            # again; the net mapping is a 180 degree rotation.
            red[x * size + z] = image.getpixel((size - 1 - x, size - 1 - z))[0]
    (OUT / "heightmap.json").write_text(json.dumps({"size": size, "red": red}, separators=(",", ":")) + "\n")

    # --- animations -----------------------------------------------------
    def_text = (SRC / "Source" / "Animation" / "Animation.def").read_text()
    animations = []
    for m in re.finditer(r'DECLARE_ANIM\((\w+),\s*"([^"]*)",\s*(\w+),\s*(\w+),\s*([^)]*)\)', def_text):
        ident, file_name, height, attack, bits = m.groups()
        if ident == "loadable_anim_end":
            break
        if not (DATA / "Animations" / file_name).exists():
            raise SystemExit(f"animation file missing: {file_name}")
        animations.append({"id": ident, "file": file_name, "height": height, "attack": attack, "bits": bits.strip()})
    (OUT / "animations.json").write_text(json.dumps({"animations": animations}, separators=(",", ":")) + "\n")

    # --- campaign -------------------------------------------------------
    text = (DATA / "Campaigns" / "main.txt").read_text()
    levels = []
    for block in re.split(r"\n(?=Level \d+:)", text):
        if not block.startswith("Level "):
            continue
        fields = {}
        for line in block.splitlines()[1:]:
            if ":" not in line:
                continue
            key, value = line.split(":", 1)
            fields[key.strip()] = value.strip()
        levels.append({
            "name": fields["Name"],
            "description": fields["Description"],
            "chooseNext": int(fields["ChooseNext"]),
            "numNext": int(fields.get("NumNext", "0")),
            "nextLevel": int(fields.get("NextLevel", "0")),
            "locationX": int(fields.get("LocationX", "0")),
            "locationY": int(fields.get("LocationY", "0")),
        })
    end_text = ""
    m = re.search(r"EndText:(.*)\Z", text, re.S)
    if m:
        end_text = m.group(1).strip()
    (OUT / "campaign.json").write_text(json.dumps({"levels": levels, "endText": end_text}, indent=1) + "\n")

    # --- manifest -------------------------------------------------------
    files = []
    for path in sorted(OUT.rglob("*")):
        if path.is_file():
            files.append({"path": path.relative_to(OUT).as_posix(), "bytes": path.stat().st_size})
    (OUT / "manifest.json").write_text(json.dumps({"files": files}, indent=1) + "\n")

    # --- checks ---------------------------------------------------------
    for forbidden in ("Textures/ClFeng.png", "Textures/FontMono.png", "Sounds/Music1Grass.ogg",
                      "Maps/svenalpha.json", "Maps/jendraz1.json", "Maps/task1.json",
                      "Textures/temple/World.png", "Textures/empire/World.png"):
        if (OUT / forbidden).exists():
            raise SystemExit(f"excluded asset was copied: {forbidden}")
    total = sum(f["bytes"] for f in files)
    print(f"Lugaru assets: {len(files)} files, {total} bytes")
    print(f"  animations: {len(animations)}, campaign levels: {len(levels)}, textures: {len(list((OUT / 'Textures').rglob('*')))} entries")


if __name__ == "__main__":
    main()
