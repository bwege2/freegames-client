#!/usr/bin/env python3
"""Records the original's D:1 start for a Human Fighter (seed 7, weapon a): the messages and the HUD
values, not the map (the port's dungeon layout is its own). Writes test/golden/start.json."""
import json, os, re, shutil, subprocess, time
HERE = os.path.dirname(os.path.abspath(__file__))
WEB = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
RUN = os.path.join(HERE, "run")
OUT = os.path.join(WEB, "web", "games", "crawl", "test", "golden", "start.json")

def cap(session):
    return subprocess.run(["tmux", "capture-pane", "-t", session, "-p"], capture_output=True, text=True).stdout

def main():
    session = "crawl-start"
    shutil.rmtree(os.path.join(RUN, "saves"), ignore_errors=True)
    os.makedirs(os.path.join(RUN, "saves"), exist_ok=True)
    subprocess.run(["tmux", "kill-session", "-t", session], capture_output=True)
    subprocess.run(["tmux", "new-session", "-d", "-s", session, "-x", "80", "-y", "24",
                    f"cd {RUN} && ./crawl -seed 7 -species 'Human' -background 'Fighter' -name Test -wizard"], check=True)
    text = ""
    for _ in range(120):
        time.sleep(0.2)
        text = cap(session)
        if "choice of weapons" in text:
            subprocess.run(["tmux", "send-keys", "-t", session, "a"], check=True)
        if "Health:" in text:
            break
    time.sleep(0.5)
    text = cap(session)
    subprocess.run(["tmux", "kill-session", "-t", session], capture_output=True)
    rows = text.split("\n")
    out = {
        "messages": [re.sub(r'^_', '', r.strip()) for r in rows
                     if any(k in r for k in ('Welcome,', 'Game seed:', 'Press ?', 'Found a staircase'))],
        "title": "Shield-Bearer",
        "species": "Human",
        "hp": [int(x) for x in re.search(r"Health:\s*(\d+)/(\d+)", text).groups()],
        "mp": [int(x) for x in re.search(r"Magic:\s*(\d+)/(\d+)", text).groups()],
        "ac": int(re.search(r"AC:\s*(\d+)", text).group(1)),
        "ev": int(re.search(r"EV:\s*(\d+)", text).group(1)),
        "sh": int(re.search(r"SH:\s*(\d+)", text).group(1)),
        "str": int(re.search(r"Str:\s*(\d+)", text).group(1)),
        "int": int(re.search(r"Int:\s*(\d+)", text).group(1)),
        "dex": int(re.search(r"Dex:\s*(\d+)", text).group(1)),
    }
    json.dump(out, open(OUT, "w"), indent=1)
    print(out)

if __name__ == "__main__":
    main()
