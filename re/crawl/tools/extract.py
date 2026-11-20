#!/usr/bin/env python3
"""Extracts the data of Dungeon Crawl Stone Soup 0.34.1 into web/games/crawl/src/data/.

Reads re/crawl/orig/crawl-0.34.1/ (re/crawl/fetch.sh) and the generated headers a build writes
(species-data.h, mon-data.h, mon-pick-data.h, feature-data.h), plus the YAML under dat/. Nothing
here is shipped by the original; the output is data converted from the original's source files,
under GPL-2.0-or-later (see web/games/crawl/LICENSE.md).

The extraction is mechanical; where a table is easier to read from the generated C++ header
than from its source, the header is used and the source is named in the output's _source.
Run: python3 re/crawl/tools/extract.py
"""
import json
import os
import re
import sys

import yaml

HERE = os.path.dirname(os.path.abspath(__file__))
BASE = os.path.dirname(HERE)
ROOT = os.path.dirname(os.path.dirname(BASE))
SRC = os.path.join(BASE, "orig", "crawl-0.34.1", "crawl-ref", "source")
GEN = os.path.join(BASE, "orig", "crawl-git", "crawl-ref", "source")
if not os.path.exists(os.path.join(GEN, "mon-data.h")):
    GEN = SRC
OUT = os.path.join(ROOT, "web", "games", "crawl", "src", "data")
PLAYABLE = os.path.join(BASE, "oracle", "playable.json")


def read(path):
    with open(path, encoding="utf-8") as f:
        return f.read()


def write(name, data):
    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(OUT, name), "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"), sort_keys=False)
        f.write("\n")
    print(f"{name}: {os.path.getsize(os.path.join(OUT, name))} bytes")


def snake(name):
    s = re.sub(r"[^A-Za-z0-9]+", "_", name).strip("_").lower()
    return s


def parse_pct_blocks(path):
    """dat/descript/*.txt: %%%% heading, blank line, text %%%%."""
    text = read(path).replace("\r\n", "\n")
    out = {}
    for chunk in text.split("%%%%"):
        chunk = chunk.strip("\n")
        if not chunk.strip():
            continue
        lines = chunk.split("\n")
        heading = lines[0].strip()
        body = "\n".join(lines[1:]).strip("\n")
        out[heading.lower()] = body
    return out


def parse_tagged(text):
    """A YAML-ish generated header: fields in the order the generator wrote them."""
    # Not used: PyYAML reads the .yaml sources; generated headers are regex-read below.
    return text


# --------------------------------------------------------------------------------------- playable
def load_playable():
    if not os.path.exists(PLAYABLE):
        sys.exit(f"missing {PLAYABLE}; run re/crawl/oracle/playable.sh first")
    return json.loads(read(PLAYABLE))


# --------------------------------------------------------------------------------------- species
def extract_species(playable):
    by_name = {s["name"]: s for s in playable["species"]}
    species = []
    for fn in sorted(os.listdir(os.path.join(SRC, "dat", "species"))):
        if not fn.endswith(".yaml") or fn.startswith("deprecated-"):
            continue
        data = yaml.safe_load(read(os.path.join(SRC, "dat", "species", fn)))
        if not data or data.get("TAG_MAJOR_VERSION"):
            continue
        name = data["name"]
        if name not in by_name:
            continue
        pj = by_name[name]
        apt = {}
        for k, v in (data.get("aptitudes") or {}).items():
            apt[k.replace(" ", "_")] = -99 if v is False else int(v)
        mutations = {}
        for lvl, muts in (data.get("mutations") or {}).items():
            for k, v in (muts or {}).items():
                mutations[k] = int(v)
        d = parse_pct_blocks(os.path.join(SRC, "dat", "descript", "species.txt"))
        species.append({
            "id": data.get("enum"),
            "name": name,
            "abbr": pj.get("abbr", ""),
            "derives": pj.get("derives"),
            "stats": [int(data.get("str", 0)), int(data.get("int", 0)), int(data.get("dex", 0))],
            "mods": {"xp": int(apt.get("xp", 0) or 0), "hp": int(apt.get("hp", 0) or 0),
                     "mp": int(apt.get("mp_mod", 0) or 0), "wl": int(apt.get("wl", 3) or 3)},
            "apt": apt,
            "mutations": mutations,
            "levelup": data.get("levelup_stats") or [],
            "levelupFrequency": int(data.get("levelup_stat_frequency", 4) or 4),
            "flags": data.get("species_flags") or [],
            "habitat": data.get("habitat", "land"),
            "size": data.get("size", "medium"),
            "recommendedJobs": data.get("recommended_jobs") or [],
            "description": d.get(name.lower(), ""),
            "_source": f"crawl-ref/source/dat/species/{fn}",
        })
    return species


# --------------------------------------------------------------------------------------- jobs
def extract_jobs(playable):
    by_name = {j["name"]: j for j in playable["jobs"]}
    jobs = []
    for fn in sorted(os.listdir(os.path.join(SRC, "dat", "jobs"))):
        if not fn.endswith(".yaml"):
            continue
        data = yaml.safe_load(read(os.path.join(SRC, "dat", "jobs", fn)))
        if not data or data.get("TAG_MAJOR_VERSION"):
            continue
        name = data["name"]
        if name not in by_name:
            continue
        d = parse_pct_blocks(os.path.join(SRC, "dat", "descript", "backgrounds.txt"))
        jobs.append({
            "id": data.get("enum"),
            "name": name,
            "abbr": by_name[name].get("abbr") or data.get("short_name", ""),
            "category": data.get("category", ""),
            "stats": [int(data.get("str", 0) or 0), int(data.get("int", 0) or 0), int(data.get("dex", 0) or 0)],
            "equipment": data.get("equipment") or [],
            "spells": data.get("spells") or [],
            "skills": {k.replace(" ", "_"): int(v) for k, v in (data.get("skills") or {}).items()},
            "weaponChoice": data.get("weapon_choice", "none") or "none",
            "recommendedSpecies": data.get("recommended_species") or [],
            "description": d.get(name.lower(), ""),
            "_source": f"crawl-ref/source/dat/jobs/{fn}",
        })
    return jobs


# --------------------------------------------------------------------------------------- monsters
def extract_monsters():
    enum_by_name = {}
    for m in re.finditer(r"^\s*(MONS_[A-Z0-9_]+), '(.*?)', ([A-Z_]+), \"(.*?)\"", read(os.path.join(GEN, "mon-data.h")), re.M):
        enum_by_name[m.group(4)] = m.group(1)
    # spell sets from mon-spell.h: { MST_X, { { SPELL_Y, w, MON_SPELL_* }, ... } },
    spell_sets = {}
    text = read(os.path.join(SRC, "mon-spell.h"))
    for m in re.finditer(r"\{\s*(MST_[A-Z0-9_]+),\s*\{(.*?)\}\s*\}", text, re.S):
        entries = []
        for e in re.finditer(r"\{\s*(SPELL_[A-Z0-9_]+),\s*(\d+),\s*(MON_SPELL_[A-Z0-9_]+)\s*\}", m.group(2)):
            entries.append({"spell": e.group(1), "weight": int(e.group(2)), "flags": e.group(3)})
        if entries:
            spell_sets[m.group(1)] = entries
    desc = parse_pct_blocks(os.path.join(SRC, "dat", "descript", "monsters.txt"))
    monsters = []
    for fn in sorted(os.listdir(os.path.join(SRC, "dat", "mons"))):
        if not fn.endswith(".yaml"):
            continue
        data = yaml.safe_load(read(os.path.join(SRC, "dat", "mons", fn)))
        if not data or data.get("TAG_MAJOR_VERSION"):
            continue
        name = data["name"]
        enum = data.get("enum") or enum_by_name.get(name)
        if not enum:
            continue
        glyph = data.get("glyph") or {}
        if "char" not in glyph:
            continue
        spells = data.get("spells") or ""
        spell_set = "MST_" + spells.upper() if spells else "MST_NO_SPELLS"
        monsters.append({
            "id": enum,
            "name": name,
            "glyph": glyph["char"],
            "colour": glyph.get("colour", "LIGHTGREY"),
            "flags": data.get("flags") or [],
            "attacks": data.get("attacks") or [],
            "hd": int(data.get("hd", 1)),
            "hp": int(data.get("hp_10x", 0)) / 10,
            "ac": int(data.get("ac", 0)),
            "ev": int(data.get("ev", 0)),
            "will": 5000 if data.get("will") == "invuln" else int(data.get("will", 0) or 0),
            "exp": int(data.get("exp", 0) or 0),
            "speed": int(data.get("speed", 10) or 10),
            "size": data.get("size", "medium"),
            "shape": data.get("shape", "humanoid"),
            "intelligence": data.get("intelligence", "animal"),
            "habitat": data.get("habitat", "land"),
            "genus": data.get("genus"),
            "species": data.get("species"),
            "uses": data.get("uses"),
            "unique": "unique" in (data.get("flags") or []),
            "hasCorpse": bool(data.get("has_corpse", False)),
            "shout": data.get("shout"),
            "spells": spell_set,
            "spellList": spell_sets.get(spell_set, []),
            "resists": data.get("resists") or [],
            "description": desc.get(name.lower(), ""),
            "_source": f"crawl-ref/source/dat/mons/{fn}",
        })
    return monsters


# --------------------------------------------------------------------------------------- population
def extract_population():
    text = read(os.path.join(GEN, "mon-pick-data.h"))
    pop_depths = []
    m = re.search(r"#define POP_DEPTHS \\\n(.*?)\n\n", text, re.S)
    if m:
        for line in m.group(1).splitlines():
            for e in re.finditer(r"\{\s*(-?\d+),\s*(-?\d+),\s*(\d+),\s*(\w+),\s*(MONS_[A-Z0-9_]+)\s*\}", line):
                pop_depths.append({"min": int(e.group(1)), "max": int(e.group(2)), "weight": int(e.group(3)),
                                   "type": e.group(4), "mons": e.group(5)})
    body = text.split("static const vector<pop_entry> population[] =", 1)[1]
    out = {}
    chunks = body.split("\n{ // ")
    for chunk in chunks[1:]:
        name = chunk.split("\n", 1)[0].split(" (")[0].strip()
        end = chunk.find("\n},")
        if end < 0:
            end = chunk.find("\n}")
        block = chunk[:end]
        entries = []
        for e in re.finditer(r"\{\s*(-?\d+),\s*(-?\d+),\s*(\d+),\s*(\w+),\s*(MONS_[A-Z0-9_]+|POP_DEPTHS)\s*\}", block):
            if e.group(5) == "POP_DEPTHS":
                entries.extend(pop_depths)
            else:
                entries.append({"min": int(e.group(1)), "max": int(e.group(2)), "weight": int(e.group(3)),
                                "type": e.group(4), "mons": e.group(5)})
        key = name.lower()
        out[key] = entries
    return out


# --------------------------------------------------------------------------------------- spells
def extract_spells():
    text = read(os.path.join(SRC, "spl-data.h"))
    desc = parse_pct_blocks(os.path.join(SRC, "dat", "descript", "spells.txt"))
    spells = []
    for m in re.finditer(r"\{\s*(SPELL_[A-Z0-9_]+),\s*\"(.*?)\",\s*(.*?),\s*(.*?),\s*(-?\d+),\s*(-?\d+),\s*(-?\d+|-?LOS_RADIUS),\s*(-?\d+|-?LOS_RADIUS),\s*(-?\d+),\s*(TILEG_[A-Z0-9_]+)\s*,?\s*\}", text, re.S):
        name = m.group(2)
        schools = re.findall(r"spschool::(\w+)", m.group(3))
        flags = re.findall(r"spflag::(\w+)", m.group(4))
        def num(x):
            return 8 if x == "LOS_RADIUS" else int(x)
        spells.append({
            "id": m.group(1), "name": name, "schools": schools, "flags": flags,
            "level": int(m.group(5)), "powerCap": int(m.group(6)),
            "rangeMin": num(m.group(7)), "rangeMax": num(m.group(8)), "noise": int(m.group(9)),
            "description": desc.get(name.lower() + " spell", desc.get(name.lower(), "")),
            "_source": "crawl-ref/source/spl-data.h",
        })
    return spells


# --------------------------------------------------------------------------------------- items
def extract_items():
    text = read(os.path.join(SRC, "item-prop.cc"))
    desc = parse_pct_blocks(os.path.join(SRC, "dat", "descript", "items.txt"))
    weapons = []
    # { WPN_CLUB, "club", 5, 3, 13, SK_MACES_FLAILS, SIZE_LITTLE, SIZE_LITTLE, DAMV_CRUSHING, 10, 0, 5, CLUB_BRANDS },
    for m in re.finditer(r"\{\s*(WPN_[A-Z0-9_]+),\s*\"(.*?)\",\s*(-?\d+),\s*(-?\d+),\s*(\d+),\s*(SK_[A-Z0-9_]+),\s*(SIZE_[A-Z_]+|NUM_SIZE_LEVELS),\s*(SIZE_[A-Z_]+|NUM_SIZE_LEVELS),\s*([A-Z_ |]+),\s*(\d+),\s*(\d+),\s*(\d+)", text):
        weapons.append({
            "id": m.group(1), "name": m.group(2), "damage": int(m.group(3)), "hit": int(m.group(4)),
            "speed": int(m.group(5)), "skill": m.group(6), "min2h": m.group(7), "min1h": m.group(8),
            "damType": m.group(9).replace(" ", ""), "commonness": int(m.group(10)),
            "acquire": int(m.group(11)), "price": int(m.group(12)),
            "description": desc.get(m.group(2).lower(), ""),
        })
    armour = []
    # { ARM_ROBE, "robe", 2, 0, 10, SLOT_BODY_ARMOUR, SIZE_LITTLE, SIZE_MEDIUM, true, 0, {...}, ... },
    for m in re.finditer(r"\{\s*(ARM_[A-Z0-9_]+),\s*\"(.*?)\",\s*(-?\d+),\s*(-?\d+),\s*(\d+),\s*(SLOT_[A-Z_]+),\s*(SIZE_[A-Z_]+),\s*(SIZE_[A-Z_]+),\s*(true|false),\s*(\d+)\s*(?:,|\})", text):
        armour.append({
            "id": m.group(1), "name": m.group(2), "ac": int(m.group(3)), "ev": int(m.group(4)),
            "price": int(m.group(5)), "slot": m.group(6), "fitMin": m.group(7),
            "fitMax": m.group(8), "mundane": m.group(9) == "true", "acquire": int(m.group(10)),
            "description": desc.get(m.group(2).lower(), ""),
        })
    names = {}
    for heading, body in desc.items():
        if heading.startswith(("potion of ", "scroll of ", "wand of ", "ring of ", "amulet of ", "talisman of ")):
            names[heading] = body
    return {"weapons": weapons, "armour": armour, "names": names}


# --------------------------------------------------------------------------------------- features
def extract_features():
    text = read(os.path.join(GEN, "feature-data.h"))
    glyph = {
        "DCHAR_WALL": "#", "DCHAR_FLOOR": ".", "DCHAR_FLOOR_MAGIC": ".", "DCHAR_DOOR_CLOSED": "+",
        "DCHAR_DOOR_OPEN": "'", "DCHAR_TRAP": "^", "DCHAR_STAIRS_DOWN": ">", "DCHAR_STAIRS_UP": "<",
        "DCHAR_ALTAR": "_", "DCHAR_ARCH": "∩", "DCHAR_FOUNTAIN": "{", "DCHAR_WAVY": "≈",
        "DCHAR_SHALLOW_WAVY": "~", "DCHAR_STATUE": "(", "DCHAR_ITEM_WEAPON": ")", "DCHAR_ITEM_ARMOUR": "[",
        "DCHAR_ITEM_SCROLL": "?", "DCHAR_ITEM_POTION": "!", "DCHAR_ITEM_WAND": "/", "DCHAR_ITEM_GOLD": "$",
        "DCHAR_ITEM_FOOD": "%", "DCHAR_CLOUD": "0", "DCHAR_TREE": "7", "DCHAR_GRATE": "#",
        "DCHAR_INVIS_EXPOSED": "!", "DCHAR_ITEM_DETECTED": "x", "DCHAR_ITEM_ORB": "0", "DCHAR_ITEM_RUNE": "*",
        "DCHAR_ITEM_BOOK": "+", "DCHAR_ITEM_STAFF": "|", "DCHAR_ITEM_TALISMAN": "|",
        "DCHAR_ITEM_AMULET": '"', "DCHAR_ITEM_RING": "=", "DCHAR_ITEM_MISSILE": ")",
    }
    feats = []
    for m in re.finditer(r"\{\s*(DNGN_[A-Z0-9_]+),\s*\"(.*?)\",\s*\"(.*?)\",\s*(DCHAR_[A-Z0-9_]+|NUM_DCHAR_TYPES),\s*(DCHAR_[A-Z0-9_]+|NUM_DCHAR_TYPES),\s*(.*?),\s*(.*?),\s*(FFT_[A-Z_ |]+|0),\s*(MF_[A-Z_]+)\s*,?\s*\}", text, re.S):
        colours = re.findall(r"\b([A-Z_]+)\b", m.group(6))
        seen = re.findall(r"\b([A-Z_]+)\b", m.group(7))
        feats.append({
            "id": m.group(1), "name": m.group(2), "vaultName": m.group(3),
            "glyph": glyph.get(m.group(4), " "), "colour": colours[-1] if colours else "LIGHTGREY",
            "seenColour": seen[-1] if seen else (colours[-1] if colours else "LIGHTGREY"),
            "flags": m.group(8).replace(" ", ""), "minimap": m.group(9),
        })
    return feats


# --------------------------------------------------------------------------------------- branches
def extract_branches():
    text = read(os.path.join(SRC, "branch-data.h"))
    branches = []
    for m in re.finditer(r"\{\s*(BRANCH_[A-Z0-9_]+),\s*(BRANCH_[A-Z0-9_]+|NUM_BRANCHES),\s*(-?\d+),\s*(-?\d+),\s*(\d+),\s*(\d+),\s*(brflag::[A-Za-z0-9_ |:]+),\s*(DNGN_[A-Z0-9_]+|NUM_FEATURES),\s*(DNGN_[A-Z0-9_]+|NUM_FEATURES),\s*(DNGN_[A-Z0-9_]+|NUM_FEATURES),\s*\"(.*?)\",\s*\"(.*?)\",\s*\"(.*?)\"", text, re.S):
        if m.group(1) == "BRANCH_DUNGEON" or True:
            branches.append({
                "id": m.group(1), "parent": m.group(2), "minDepth": int(m.group(3)),
                "maxDepth": int(m.group(4)), "depth": int(m.group(5)), "absDepth": int(m.group(6)),
                "flags": m.group(7).replace(" ", "").replace("brflag::", "").split("|"),
                "short": m.group(11), "long": m.group(12), "abbr": m.group(13),
            })
    return branches


# --------------------------------------------------------------------------------------- skills
def extract_skills():
    text = read(os.path.join(SRC, "skills.cc"))
    m = re.search(r"static const char \*skill_titles\[NUM_SKILLS\]\[7\] =\s*\{(.*?)\n\};", text, re.S)
    skills = []
    for line in m.group(1).splitlines():
        line = line.strip()
        if not line.startswith("{\""):
            continue
        vals = re.findall(r'"(.*?)"', line)
        if len(vals) >= 2:
            skills.append({"name": vals[0], "titles": vals[1:6], "abbr": vals[6] if len(vals) > 6 else vals[0][:3]})
    return skills


# --------------------------------------------------------------------------------------- tutorial
def extract_tutorial():
    text = read(os.path.join(SRC, "dat", "des", "tutorial", "lesson1.des"))
    maps = []
    for m in re.finditer(r"NAME:\s*(\S+)(.*?)MAP\n(.*?)\nENDMAP", text, re.S):
        head, body = m.group(2), m.group(3)
        feats = []
        for line in head.splitlines():
            km = re.match(r"KFEAT:\s*(\w+)\s*=\s*(.+)", line.strip())
            if km:
                feats.append([km.group(1), km.group(2).strip()])
        markers = []
        for line in head.splitlines():
            mm = re.match(r"MARKER:\s*(.)\s*=\s*lua:(\S+)", line.strip())
            if mm:
                markers.append([mm.group(1), mm.group(2).rstrip("\\ ")])
        maps.append({"name": m.group(1), "map": body, "kfeat": feats, "markers": markers})
    return maps


def strip_markup(s):
    s = re.sub(r"<[^>]+>", "", s)
    s = s.replace("$cmd[CMD_MOVE_UP_LEFT]", "y").replace("$cmd[CMD_MOVE_UP]", "k")
    return s


def main():
    playable = load_playable()
    species = extract_species(playable)
    jobs = extract_jobs(playable)
    monsters = extract_monsters()
    population = extract_population()
    spells = extract_spells()
    items = extract_items()
    features = extract_features()
    branches = extract_branches()
    skills = extract_skills()
    tutorial = extract_tutorial()
    descriptions = {}
    for f in ("species", "backgrounds", "monsters", "items", "spells", "skills", "tutorial", "features", "branches"):
        try:
            d = parse_pct_blocks(os.path.join(SRC, "dat", "descript", f + ".txt"))
            descriptions[f] = {k: strip_markup(v) for k, v in d.items()}
        except FileNotFoundError:
            pass
    write("playable.json", playable)
    write("species.json", species)
    write("jobs.json", jobs)
    write("monsters.json", monsters)
    write("population.json", population)
    write("spells.json", spells)
    write("items.json", items)
    write("features.json", features)
    write("branches.json", branches)
    write("skills.json", skills)
    write("tutorial.json", tutorial)
    write("descript.json", descriptions)
    print(f"species={len(species)} jobs={len(jobs)} monsters={len(monsters)} spells={len(spells)} "
          f"weapons={len(items['weapons'])} armour={len(items['armour'])} features={len(features)}")


if __name__ == "__main__":
    main()
