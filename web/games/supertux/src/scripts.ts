// The small subset of the original's Squirrel scripts the Icy Island levels use for lifts,
// switches, doors and short cutscenes. The level's .nut cutscene files are not interpreted.
import type { Sector } from './sector.ts';
import type { Player } from './player.ts';
import { Bonus } from './player.ts';

export function splitStatements(script: string): string[] {
  const out: string[] = [];
  let cur = '';
  let quoted = false;
  let depth = 0;
  for (const c of script) {
    if (c === '"') quoted = !quoted;
    if (!quoted) {
      if (c === '(') depth++;
      else if (c === ')') depth = Math.max(0, depth - 1);
      if (c === ';' && depth === 0) {
        if (cur.trim()) out.push(cur.trim());
        cur = '';
        continue;
      }
    }
    cur += c;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

function unquote(s: string): string {
  const m = /^_?\s*\(\s*"([\s\S]*)"\s*\)$/.exec(s.trim());
  let v = m ? m[1] : s.trim();
  if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
  return v.replace(/\\"/g, '"').replace(/\\n/g, '\n');
}

export class ScriptRunner {
  private sector: Sector;
  private queue: string[] = [];
  private wait = 0;
  private active = false;

  constructor(sector: Sector) { this.sector = sector; }

  run(script: string): void {
    const stmts = splitStatements(script);
    if (stmts.length === 0) return;
    this.queue.push(...stmts);
    this.active = true;
    this.step();
  }

  update(dt: number): void {
    if (!this.active) return;
    if (this.wait > 0) {
      this.wait -= dt;
      if (this.wait > 0) return;
    }
    this.step();
  }

  private step(): void {
    while (this.queue.length > 0) {
      const stmt = this.queue.shift()!;
      if (this.exec(stmt)) return;
    }
    this.active = false;
  }

  /** returns true when the statement waits */
  private exec(stmt: string): boolean {
    let m: RegExpExecArray | null;
    if ((m = /^wait\s*\(\s*([\d.]+)\s*\)$/.exec(stmt))) { this.wait = Number(m[1]); return true; }
    if ((m = /^play_sound\s*\(\s*"([^"]+)"\s*\)$/.exec(stmt))) { this.sector.playSound(m[1]); return false; }
    if ((m = /^play_music\s*\(\s*"([^"]+)"\s*\)$/.exec(stmt))) { this.sector.playMusic(m[1]); return false; }
    if ((m = /^Text\.set_text\s*\((.*)\)$/.exec(stmt))) { this.sector.showMessage(unquote(m[1])); return false; }
    if ((m = /^Camera\.scroll_to\s*\(\s*([\d.-]+)\s*,\s*([\d.-]+)\s*(?:,\s*[\d.]+)?\s*\)$/.exec(stmt))) {
      this.sector.camera.x = Number(m[1]); this.sector.camera.y = Number(m[2]); return false;
    }
    if ((m = /^Level\.finish\s*\(\s*(true|false)\s*\)$/.exec(stmt))) { if (m[1] === 'true') this.sector.finishLevel(); return false; }
    if ((m = /^Level\.spawn\s*\(\s*"([^"]+)"\s*,\s*"([^"]+)"\s*\)$/.exec(stmt))) { this.sector.switchSector(m[1], m[2]); return false; }
    if ((m = /^Tux\.deactivate\s*\(\s*\)$/.exec(stmt))) { return false; }
    if ((m = /^Tux\.activate\s*\(\s*\)$/.exec(stmt))) { return false; }
    if ((m = /^Tux\.walk\s*\(\s*([\d.-]+)\s*\)$/.exec(stmt))) {
      const speed = Number(m[1]);
      this.players().forEach((p) => { p.velocity.x = p.dir * speed; });
      return false;
    }
    if ((m = /^Tux\.do_jump\s*\(\s*([\d.-]+)\s*\)$/.exec(stmt))) { const vy = Number(m[1]); this.players().forEach((p) => { p.velocity.y = vy; p.onGroundFlag = false; }); return false; }
    if ((m = /^Tux\.do_duck\s*\(\s*\)$/.exec(stmt))) { this.players().forEach((p) => { p.duck = true; }); return false; }
    if ((m = /^Tux\.do_standup\s*\(\s*\)$/.exec(stmt))) { this.players().forEach((p) => { p.duck = false; }); return false; }
    if ((m = /^Tux\.do_backflip\s*\(\s*\)$/.exec(stmt))) { this.players().forEach((p) => { p.velocity.y = -580; p.onGroundFlag = false; }); return false; }
    if ((m = /^Tux\.set_dir\s*\(\s*(true|false)\s*\)$/.exec(stmt))) { const right = m[1] === 'true'; this.players().forEach((p) => { p.dir = right ? 1 : -1; }); return false; }
    if ((m = /^Tux\.set_pos\s*\(\s*([\d.-]+)\s*,\s*([\d.-]+)\s*\)$/.exec(stmt))) { const sx = Number(m[1]), sy = Number(m[2]); this.players().forEach((p) => { p.setPos(sx, sy); p.velocity.x = p.velocity.y = 0; }); return false; }
    if ((m = /^Tux\.set_visible\s*\(\s*(true|false)\s*\)$/.exec(stmt))) { this.players().forEach((p) => { p.active = m![1] === 'true'; }); return false; }
    if ((m = /^Tux\.kick\s*\(\s*\)$/.exec(stmt))) { return false; }
    if ((m = /^Tux\.add_bonus\s*\(\s*"([^"]+)"\s*\)$/.exec(stmt))) {
      const b = m[1] === 'fire' ? Bonus.FIRE : m[1] === 'ice' ? Bonus.ICE : Bonus.GROWUP;
      this.players().forEach((p) => { void p.addBonus(b, this.sector); });
      return false;
    }
    if ((m = /^([A-Za-z0-9_-]+)\.(goto_node|start_moving|stop_moving)\s*\(\s*([\d-]*)\s*\)$/.exec(stmt))) {
      const obj = this.sector.namedObject(m[1]);
      if (obj) {
        if (m[2] === 'goto_node' && 'gotoNode' in obj) (obj as { gotoNode(n: number): void }).gotoNode(Number(m[3]));
        else if (m[2] === 'start_moving' && 'startMoving' in obj) (obj as { startMoving(): void }).startMoving();
        else if (m[2] === 'stop_moving' && 'stopMoving' in obj) (obj as { stopMoving(): void }).stopMoving();
      }
      return false;
    }
    // state.flag = true, settings.fade..., Effect..., wind..., and anything else: no effect here
    return false;
  }

  private players(): Player[] { return this.sector.players; }
}
