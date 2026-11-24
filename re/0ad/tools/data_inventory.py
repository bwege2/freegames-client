#!/usr/bin/env python3
"""Inventory one 0 A.D. map and the release data tree (stage-1 reconnaissance).

Reads the unpacked release (re/0ad/work/public by default) and prints the map header, entity counts, the
templates/actors it uses and the size of the asset subset those actors reference. It is deliberately a
*reference* tool, not part of the port: it follows template parents and actor variants the way the game does,
but it does not try to be a full implementation of CParamNode or CObjectBase.

Usage:
    python3 re/0ad/tools/data_inventory.py [--data DIR] [--map NAME] [--json]

The counts in re/0ad/NOTES.md for temperate_roadway_2p were produced with this script.
"""
from __future__ import annotations

import argparse
import json
import struct
import sys
import xml.etree.ElementTree as ET
from collections import Counter, defaultdict
from pathlib import Path

DEFAULT_DATA = Path(__file__).resolve().parent.parent / "work" / "public"
CACHE_SUFFIXES = (".cached.dds", ".cached.pmd", ".cached.psa")


def die(message: str) -> None:
    print(f"data_inventory: {message}", file=sys.stderr)
    raise SystemExit(1)


def actual(path: Path) -> Path | None:
    for candidate in (path, *(path.with_name(path.name + suffix) for suffix in CACHE_SUFFIXES)):
        if candidate.is_file():
            return candidate
    return None


def find_template(templates: Path, name: str) -> Path | None:
    # A template name may be a chain a|b|c; only the last part names the file.
    name = name.split("|")[-1]
    path = templates / f"{name}.xml"
    return path if path.is_file() else None


def template_replacer(templates: Path, name: str, seen: set[str] | None = None) -> ET.Element | None:
    """Return the SkirmishReplacer element a template inherits, if any."""
    if seen is None:
        seen = set()
    if name in seen:
        return None
    seen.add(name)
    path = find_template(templates, name)
    if not path:
        return None
    root = ET.parse(path).getroot()
    replacer = root.find("SkirmishReplacer")
    if replacer is not None:
        return replacer
    parent = root.attrib.get("parent")
    if parent:
        for part in parent.split("|"):
            found = template_replacer(templates, part, seen)
            if found is not None:
                return found
    return None


def resolve_template(templates: Path, name: str, seen: set[str] | None = None) -> list[tuple[str, str]]:
    """Return (kind, value) pairs: kind is 'actor' or 'replacer'."""
    if seen is None:
        seen = set()
    if name in seen:
        return []
    seen.add(name)
    if name.startswith("actor|"):
        return [("actor", name[6:])]
    path = find_template(templates, name)
    if not path:
        return []
    try:
        root = ET.parse(path).getroot()
    except ET.ParseError as exc:
        print(f"warning: cannot parse {path}: {exc}", file=sys.stderr)
        return []
    out: list[tuple[str, str]] = []
    parent = root.attrib.get("parent")
    if parent:
        for part in parent.split("|"):
            out += resolve_template(templates, part, seen)
    for element in root.iter():
        if element.tag == "Actor" and element.text and element.text.strip():
            out.append(("actor", element.text.strip()))
        elif element.tag == "general" and element.text and element.text.strip():
            out.append(("replacer", element.text.strip()))
    return out


def actor_elements(actors: Path, variants: Path, name: str, seen: set[Path]):
    path = actors / name
    if not path.is_file():
        path = variants / name
    if not path.is_file() or path in seen:
        return
    seen.add(path)
    try:
        root = ET.parse(path).getroot()
    except ET.ParseError as exc:
        print(f"warning: cannot parse {path}: {exc}", file=sys.stderr)
        return
    for element in root.iter():
        if element.tag == "mesh" and element.text and element.text.strip():
            yield "mesh", element.text.strip()
        elif element.tag == "texture" and element.attrib.get("file"):
            yield "texture", element.attrib["file"]
        elif element.tag == "animation" and element.attrib.get("file"):
            yield "animation", element.attrib["file"]
        elif element.tag == "prop" and element.attrib.get("actor"):
            yield "actor", element.attrib["actor"]
        elif element.tag == "variant" and element.attrib.get("file"):
            yield "variant", element.attrib["file"]
        elif element.tag == "particles" and element.attrib.get("file"):
            yield "particles", element.attrib["file"]
        elif element.tag == "material" and element.text and element.text.strip():
            yield "material", element.text.strip()


def walk_actor(actors: Path, variants: Path, name: str, acc: dict[str, set[str]], seen: set[Path]) -> None:
    for kind, value in actor_elements(actors, variants, name, seen):
        if kind in ("actor", "variant"):
            walk_actor(actors, variants, value, acc, seen)
        else:
            acc[kind].add(value)


def pmp_header(path: Path) -> dict:
    with path.open("rb") as fh:
        magic = fh.read(4)
        version, payload, patches = struct.unpack("<III", fh.read(12))
        if magic != b"PSMP":
            die(f"{path} is not a PMP file")
        vertices = patches * 16 + 1
        fh.seek(16 + vertices * vertices * 2)
        count = struct.unpack("<I", fh.read(4))[0]
        names = []
        for _ in range(count):
            length = struct.unpack("<I", fh.read(4))[0]
            names.append(fh.read(length).decode("utf-8", "replace"))
    return {
        "magic": magic.decode("ascii"),
        "version": version,
        "payload_bytes": payload,
        "patches_per_side": patches,
        "vertices_per_side": vertices,
        "tiles_per_side": patches * 16,
        "world_size_metres": (vertices - 1) * 4,
        "textures": names,
    }


def map_inventory(data: Path, map_name: str) -> dict:
    map_dir = data / "maps" / "skirmishes"
    xml_path = map_dir / f"{map_name}.xml"
    pmp_path = map_dir / f"{map_name}.pmp"
    if not xml_path.is_file() or not pmp_path.is_file():
        die(f"map not found: {xml_path} / {pmp_path}")

    root = ET.parse(xml_path).getroot()
    entities_node = root.find("Entities")
    entities = list(entities_node) if entities_node is not None else []
    by_owner = Counter((entity.findtext("Player") or "0") for entity in entities)
    templates = Counter(entity.findtext("Template") for entity in entities if entity.findtext("Template"))
    header = pmp_header(pmp_path)

    templates_dir = data / "simulation" / "templates"
    actors_dir = data / "art" / "actors"
    variants_dir = data / "art" / "variants"

    # A skirmish map's "default" templates are replaced by the owning player's civ (SkirmishReplacer.js):
    # SkirmishReplacements[template] wins over the template's <general> text; with neither, the entity is
    # destroyed. Gaia entities are used as they are. The release's default civs are Athenians (player 1)
    # and Carthaginians (player 2).
    defaults = json.loads((data / "simulation/data/settings/player_defaults.json").read_text())
    civ_by_owner = {str(i): player["Civ"] for i, player in enumerate(defaults["PlayerData"]) if i}
    civ_replacements: dict[str, dict[str, str]] = {}
    for civ in set(civ_by_owner.values()):
        civ_data = json.loads((data / f"simulation/data/civs/{civ}.json").read_text())
        civ_replacements[civ] = civ_data.get("SkirmishReplacements", {})

    actor_names: set[str] = set()
    replacers: set[str] = set()
    for template in templates:
        for kind, value in resolve_template(templates_dir, template):
            if kind == "replacer":
                replacers.add(value)

    for entity in entities:
        owner = entity.findtext("Player") or "0"
        template = entity.findtext("Template")
        if not template:
            continue
        actual_template = template
        if owner != "0":
            replacer = template_replacer(templates_dir, template)
            if replacer is not None:
                civ = civ_by_owner.get(owner, "athen")
                general = replacer.findtext("general") or ""
                actual_template = civ_replacements.get(civ, {}).get(template) or general
                if not actual_template:
                    continue
                actual_template = actual_template.replace("{civ}", civ)
        for kind, value in resolve_template(templates_dir, actual_template):
            if kind == "actor":
                actor_names.add(value)

    acc: dict[str, set[str]] = defaultdict(set)
    seen: set[Path] = set()
    for actor in sorted(actor_names):
        walk_actor(actors_dir, variants_dir, actor, acc, seen)

    def total(paths: list[Path]) -> dict:
        found = 0
        size = 0
        missing: list[str] = []
        for path in paths:
            real = actual(path)
            if real:
                found += 1
                size += real.stat().st_size
            else:
                missing.append(str(path))
        return {"files": found, "wanted": len(paths), "bytes": size, "missing": missing}

    def texture_path(name: str) -> Path:
        for base in ("art/textures/skins", "art/textures", "art/textures/terrain"):
            candidate = data / base / name
            if actual(candidate):
                return candidate
        return data / "art/textures/skins" / name

    meshes = [data / "art/meshes" / name for name in acc["mesh"]]
    animations = [data / "art/animation" / name for name in acc["animation"]]
    textures = [texture_path(name) for name in acc["texture"]]
    materials = [data / "art/materials" / name for name in acc["material"]]
    particles = [data / "art/particles" / name for name in acc["particles"]]

    terrain_index: dict[str, Path] = {}
    for path in (data / "art/terrains").rglob("*.xml"):
        terrain_index[path.stem] = path
    terrain_textures: list[Path] = []
    missing_terrain: list[str] = []
    for name in header["textures"]:
        terrain_xml = terrain_index.get(name)
        if not terrain_xml:
            missing_terrain.append(name)
            continue
        for element in ET.parse(terrain_xml).getroot().iter("texture"):
            file_name = element.attrib.get("file")
            if file_name:
                terrain_textures.append(data / "art/textures/terrain" / file_name)

    assets = {
        "actors_xml_scanned": len(seen),
        "meshes_pmd": total(meshes),
        "animations_psa": total(animations),
        "model_textures_dds": total(textures),
        "terrain_textures_dds": total(terrain_textures),
        "materials": total(materials),
        "particles": total(particles),
    }
    assets["raw_subset_bytes"] = sum(item["bytes"] for item in assets.values() if isinstance(item, dict))

    dirs = {}
    for child in sorted(data.iterdir()):
        if not child.is_dir():
            continue
        files = 0
        size = 0
        for path in child.rglob("*"):
            if path.is_file():
                files += 1
                size += path.stat().st_size
        dirs[child.name] = {"files": files, "bytes": size}

    return {
        "map": map_name,
        "xml_bytes": xml_path.stat().st_size,
        "pmp_bytes": pmp_path.stat().st_size,
        "pmp": header,
        "entities": len(entities),
        "entities_by_owner": dict(sorted(by_owner.items())),
        "templates_used": len(templates),
        "template_counts": dict(templates.most_common()),
        "direct_actor_names": len(actor_names),
        "skirmish_replacers": sorted(replacers),
        "assets": assets,
        "missing_terrain_xml": missing_terrain,
        "release_dirs": dirs,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--data", type=Path, default=DEFAULT_DATA, help=f"unpacked public mod (default {DEFAULT_DATA})")
    parser.add_argument("--map", default="temperate_roadway_2p", help="skirmish map name without extension")
    parser.add_argument("--json", action="store_true", help="print one JSON object")
    args = parser.parse_args()

    if not (args.data / "simulation" / "templates").is_dir():
        die(f"{args.data} is not an unpacked public mod; run fetch.sh --unpack")
    result = map_inventory(args.data, args.map)

    if args.json:
        print(json.dumps(result, indent=2, ensure_ascii=False))
        return

    print(f"map {result['map']}: {result['entities']} entities, {result['templates_used']} templates")
    print(f"  owners {result['entities_by_owner']}")
    print(f"  PMP v{result['pmp']['version']}, {result['pmp']['patches_per_side']} patches, "
          f"{result['pmp']['tiles_per_side']} tiles, {result['pmp']['world_size_metres']} m, "
          f"{len(result['pmp']['textures'])} terrain textures")
    print(f"  {result['direct_actor_names']} actor names, {result['assets']['actors_xml_scanned']} actor/variant files")
    for key in ("meshes_pmd", "animations_psa", "model_textures_dds", "terrain_textures_dds", "materials", "particles"):
        item = result["assets"][key]
        print(f"  {key:22} {item['files']:4}/{item['wanted']:4} files  {item['bytes']:>10} bytes")
    print(f"  raw subset: {result['assets']['raw_subset_bytes']} bytes")
    if result["missing_terrain_xml"]:
        print(f"  missing terrain XML: {result['missing_terrain_xml']}")
    print("release dirs:")
    for name, item in result["release_dirs"].items():
        print(f"  {name:12} {item['files']:6} files  {item['bytes']:>12} bytes")


if __name__ == "__main__":
    main()
