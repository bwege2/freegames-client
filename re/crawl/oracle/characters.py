#!/usr/bin/env python3
"""Runs the original for a set of species/background combinations and records the character sheet it
shows on D:1. Writes web/games/crawl/test/golden/characters.json. Needs tmux and the built oracle."""
import json, os, re, shutil, subprocess, sys, time

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
WEB = os.path.abspath(os.path.join(ROOT, "..", ".."))
RUN = os.path.join(HERE, "run")
OUT = os.path.join(WEB, "web", "games", "crawl", "test", "golden", "characters.json")
PLAYABLE = json.load(open(os.path.join(HERE, "playable.json")))

def capture(session):
    return subprocess.run(["tmux", "capture-pane", "-t", session, "-p"], capture_output=True, text=True).stdout

def parse(text):
    rows = text.split("\n")
    out = {}
    m = re.search(r"Test the (.+)$", rows[0]) if rows else None
    out["title"] = m.group(1).strip() if m else None
    out["species"] = rows[1].strip() if len(rows) > 1 else None
    def num(label):
        for r in rows[:12]:
            m = re.search(re.escape(label) + r"\s*([0-9]+)(?:/([0-9]+))?", r)
            if m:
                return int(m.group(1)), int(m.group(2)) if m.group(2) else None
        return None
    out["hp"] = num("Health:")
    out["mp"] = num("Magic:")
    for lab, key in [("AC:", "ac"), ("EV:", "ev"), ("SH:", "sh"), ("Str:", "str"), ("Int:", "int"), ("Dex:", "dex")]:
        v = num(lab)
        out[key] = v[0] if v else None
    m = re.search(r"XL:\s*(\d+)", "\n".join(rows[:12]))
    out["xl"] = int(m.group(1)) if m else None
    m = re.search(r"Place:\s*(\S+)", "\n".join(rows[:12]))
    out["place"] = m.group(1) if m else None
    for r in rows[:12]:
        m = re.search(r"a\)\s*(.+)$", r)
        if m:
            out["weapon"] = m.group(1).strip()
            break
    return out

def run(sp, job, seed=7):
    session = "crawl-char"
    shutil.rmtree(os.path.join(RUN, "saves"), ignore_errors=True)
    os.makedirs(os.path.join(RUN, "saves"), exist_ok=True)
    subprocess.run(["tmux", "kill-session", "-t", session], capture_output=True)
    args = f"cd {RUN} && ./crawl -seed {seed} -species '{sp}' -background '{job}' -name Test -wizard"
    subprocess.run(["tmux", "new-session", "-d", "-s", session, "-x", "80", "-y", "24", args], check=True)
    text = ""
    for _ in range(120):
        time.sleep(0.2)
        text = capture(session)
        if "choice of weapons" in text or "Health:" in text:
            break
    if "choice of weapons" in text:
        subprocess.run(["tmux", "send-keys", "-t", session, "a"], check=True)
        for _ in range(60):
            time.sleep(0.2)
            text = capture(session)
            if "Health:" in text:
                break
    subprocess.run(["tmux", "kill-session", "-t", session], capture_output=True)
    return parse(text)

def main():
    combos = PLAYABLE["combos"]
    # Every background with Human, every species with Fighter, and every caster background with
    # its recommended species; enough to cover the tables without 900 runs.
    jobs = {j["name"]: j for j in PLAYABLE["jobs"]}
    species = {s["name"]: s for s in PLAYABLE["species"]}
    by_abbr = {}
    for s in species.values(): by_abbr.setdefault(s["abbr"], s["name"])
    job_by_abbr = {j["abbr"]: j["name"] for j in jobs.values()}
    wanted = []
    for combo in combos:
        sp_abbr, job_abbr = combo[:2], combo[2:]
        sp = by_abbr.get(sp_abbr)
        job = job_by_abbr.get(job_abbr)
        if not sp or not job: continue
        if sp == "Human" or job == "Fighter":
            wanted.append((sp, job))
        elif job in ("Conjurer", "Air Elementalist", "Fire Elementalist", "Ice Elementalist",
                     "Earth Elementalist", "Necromancer", "Hedge Wizard", "Alchemist", "Summoner"):
            if sp in ("Deep Elf", "Tengu", "Naga", "Gargoyle", "Djinni"):
                wanted.append((sp, job))
    wanted = sorted(set(wanted))
    result = []
    for i, (sp, job) in enumerate(wanted):
        print(f"{i+1}/{len(wanted)} {sp} {job}", file=sys.stderr)
        r = run(sp, job)
        if not r.get("hp"):
            print(f"  skipped: the original rejected {sp} {job}", file=sys.stderr)
            continue
        r.update({"species_name": sp, "job_name": job})
        result.append(r)
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    json.dump(result, open(OUT, "w"), indent=1)
    print(f"wrote {OUT}: {len(result)} characters", file=sys.stderr)

if __name__ == "__main__":
    main()
