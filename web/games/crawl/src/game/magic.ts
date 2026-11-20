// The original's spellcasting: raw_spell_fail, spell power, spell_mana and the effects of the spells
// the port implements. The spell data (schools, levels, ranges, descriptions) is spl-data.h's.
import type { Player } from './player.ts';
import { intelligence, playerArmourShieldSpellPenalty, recalc, skillOf, trainSkill } from './player.ts';
import type { Level, Monster } from './model.ts';
import { DIRS, dist, inBounds, xy, idx, FEATURE } from './model.ts';
import { SPELL_BY_ID, SPELL_BY_NAME, MONSTER_BY_NAME } from './data.ts';
import { monsterAt } from './world.ts';
import type { CombatCtx } from './combat.ts';

export function spellPower(p: Player, spellId: string): number {
  const spell = SPELL_BY_ID.get(spellId);
  if (!spell) return 0;
  let power = 0;
  const map: Record<string, string> = {
    conjuration: 'conjurations', translocation: 'translocations', summoning: 'summonings',
    fire: 'fire_magic', ice: 'ice_magic', air: 'air_magic', earth: 'earth_magic',
  };
  const schools = spell.schools.map((s) => map[s.replace(/^spschool::/, '')] ?? s.replace(/^spschool::/, ''));
  for (const s of schools) power += skillOf(p, s, 200);
  if (schools.length) power = Math.trunc(power / schools.length);
  power += skillOf(p, 'spellcasting', 50);
  return Math.min(spell.powerCap * 100, power);
}

export function rawSpellFail(p: Player, spellId: string): number {
  const spell = SPELL_BY_ID.get(spellId);
  if (!spell) return 100;
  const power = spellPower(p, spellId);
  let chance = 60;
  chance -= Math.trunc(power * 6 / 100);
  chance -= intelligence(p) * 2;
  chance += playerArmourShieldSpellPenalty(p);
  const byLevel = [0, 3, 15, 35, 70, 100, 150, 200, 260, 340];
  chance += byLevel[Math.min(byLevel.length - 1, spell.level)] ?? 340;
  chance = Math.min(chance, 400);
  let c2 = Math.max(Math.trunc((((chance + 426) * chance + 82670) * chance + 7245398) / 262144), 0);
  c2 -= 2 * (p.mutations.MUT_SUBDUED_MAGIC ?? 0);
  c2 += 4 * (p.mutations.MUT_WILD_MAGIC ?? 0);
  if ((p.status.DUR_VERTIGO ?? 0) > 0) c2 += 7;
  return Math.min(100, Math.max(0, c2));
}

export function spellManaCost(spellId: string): number {
  return SPELL_BY_ID.get(spellId)?.level ?? 0;
}

export function spellName(spellId: string): string {
  return SPELL_BY_ID.get(spellId)?.name ?? SPELL_BY_NAME.get(spellId.toLowerCase())?.name ?? spellId;
}

export interface MagicCtx extends CombatCtx {
  direction?: [number, number];
}

function beamMonsters(level: Level, p: Player, dx: number, dy: number, range: number): Monster[] {
  const out: Monster[] = [];
  let x = p.x, y = p.y;
  for (let i = 0; i < range; i++) {
    x += dx; y += dy;
    if (!inBounds(x, y)) break;
    const f = FEATURE[level.cells[idx(x, y)].feat];
    if (f?.opaque) break;
    const m = monsterAt(level, x, y);
    if (m) out.push(m);
  }
  return out;
}

function nearestVisible(ctx: MagicCtx, range: number): Monster | null {
  let best: Monster | null = null, bestD = 999;
  for (const m of ctx.level.monsters) {
    if (m.hp <= 0 || !ctx.level.cells[idx(m.x, m.y)].visible) continue;
    const d = dist(ctx.player, m);
    if (d <= range && d < bestD) { best = m; bestD = d; }
  }
  return best;
}

function damageSpell(ctx: MagicCtx, spellId: string, target: Monster, dice: number, sides: number, armour = true): void {
  const { rng, player: p } = ctx;
  const power = spellPower(p, spellId);
  const bonus = Math.trunc(power / 1000);
  let damage = rng.dice(dice, sides + bonus);
  if (armour) damage = Math.max(0, damage - rng.int(1 + Math.max(0, target.ac)));
  target.hp -= damage;
  target.asleep = false;
  target.known = true;
  const spell = SPELL_BY_ID.get(spellId);
  ctx.msg(`The ${spell?.name ?? 'spell'} hits the ${target.name}${damage >= 10 ? '!!' : damage >= 5 ? '!' : '.'}`);
  if (target.hp <= 0) {
    target.hp = 0;
    ctx.msg(`You kill the ${target.name}!`, 'LIGHTGREEN');
    ctx.onMonsterKilled(target);
  }
  trainSkill(p, spell?.schools[0] === 'conjuration' ? 'conjurations' : (spell?.schools[0] ?? 'spellcasting'), 4);
  trainSkill(p, 'spellcasting', 2);
}

export function castSpell(ctx: MagicCtx, spellId: string): string | null {
  const { rng, player: p, level } = ctx;
  const spell = SPELL_BY_ID.get(spellId);
  if (!spell) return 'You don\'t know that spell.';
  if (!p.memorised.includes(spellId)) return 'You haven\'t memorised that spell.';
  const cost = spellManaCost(spellId);
  if (!hasMutation(p, 'MUT_HP_CASTING') && p.mp < cost) return 'You don\'t have enough magic to cast that spell.';
  if (rawSpellFail(p, spellId) > rng.int(100)) {
    ctx.msg('You miscast the spell!', 'LIGHTRED');
    if (!hasMutation(p, 'MUT_HP_CASTING')) p.mp = Math.max(0, p.mp - cost);
    // a miscast still costs a turn; a little raw magic hurts
    if (rng.oneChanceIn(2)) { p.hp -= 1 + rng.int(3); recalc(p); }
    return null;
  }
  if (!hasMutation(p, 'MUT_HP_CASTING')) p.mp -= cost;
  else { p.hp -= Math.max(1, Math.trunc(cost / 2)); }
  const dir = ctx.direction;
  const range = Math.max(1, Math.min(8, spell.rangeMax > 0 ? spell.rangeMax : 8));
  const autoTarget = !dir && !spell.flags.includes('selfench') && !spell.flags.includes('escape');
  const target = autoTarget ? nearestVisible(ctx, range) : null;
  const name = spell.name;
  switch (spellId) {
    case 'SPELL_MAGIC_DART': {
      const t = target ?? (dir ? beamMonsters(level, p, dir[0], dir[1], range)[0] : null);
      if (!t) return 'There is nothing in that direction.';
      const power = spellPower(p, spellId);
      const damage = rng.dice(1, 3 + Math.trunc(power / 1000));
      t.hp -= damage; t.asleep = false; t.known = true;
      ctx.msg(`The magic dart hits the ${t.name}.`);
      if (t.hp <= 0) { t.hp = 0; ctx.msg(`You kill the ${t.name}!`, 'LIGHTGREEN'); ctx.onMonsterKilled(t); }
      trainSkill(p, 'conjurations', 3); trainSkill(p, 'spellcasting', 1);
      break;
    }
    case 'SPELL_SHOCK': {
      const t = target ?? (dir ? beamMonsters(level, p, dir[0], dir[1], range)[0] : null);
      if (!t) return 'There is nothing in that direction.';
      damageSpell(ctx, spellId, t, 1, 3, false);
      break;
    }
    case 'SPELL_FREEZE': {
      const t = target ?? (dir ? beamMonsters(level, p, dir[0], dir[1], 1)[0] : null);
      if (!t) return 'There is nothing adjacent to freeze.';
      damageSpell(ctx, spellId, t, 1, 5, false);
      break;
    }
    case 'SPELL_SANDBLAST': {
      const t = target ?? (dir ? beamMonsters(level, p, dir[0], dir[1], range)[0] : null);
      if (!t) return 'There is nothing in that direction.';
      damageSpell(ctx, spellId, t, 1, 4);
      break;
    }
    case 'SPELL_SEARING_RAY': {
      const t = target ?? (dir ? beamMonsters(level, p, dir[0], dir[1], range)[0] : null);
      if (!t) return 'There is nothing in that direction.';
      damageSpell(ctx, spellId, t, 1, 6);
      break;
    }
    case 'SPELL_POISONOUS_VAPOURS': {
      const t = target ?? nearestVisible(ctx, range);
      if (!t) return 'There is nothing in that direction.';
      damageSpell(ctx, spellId, t, 1, 3, false);
      t.poisoned = Math.max(t.poisoned, 4 + rng.int(4));
      ctx.msg(`The ${t.name} is poisoned.`, 'LIGHTGREEN');
      break;
    }
    case 'SPELL_SCORCH': {
      const t = nearestVisible(ctx, range);
      if (!t) return 'There is nothing nearby to scorch.';
      damageSpell(ctx, spellId, t, 2, 4, false);
      break;
    }
    case 'SPELL_SOUL_SPLINTER': {
      const t = target ?? nearestVisible(ctx, range);
      if (!t) return 'There is nothing in that direction.';
      damageSpell(ctx, spellId, t, 1, 3, false);
      break;
    }
    case 'SPELL_KINETIC_GRAPNEL': {
      const t = target ?? (dir ? beamMonsters(level, p, dir[0], dir[1], range)[0] : null);
      if (!t) return 'There is nothing in that direction.';
      damageSpell(ctx, spellId, t, 1, 4);
      break;
    }
    case 'SPELL_KISS_OF_DEATH': {
      const t = target ?? (dir ? beamMonsters(level, p, dir[0], dir[1], 1)[0] : null);
      if (!t) return 'There is nothing adjacent.';
      damageSpell(ctx, spellId, t, 1, 4, false);
      p.hp = Math.max(1, p.hp - 1);
      break;
    }
    case 'SPELL_FOXFIRE': {
      const t = nearestVisible(ctx, 3);
      if (!t) return 'There is nothing nearby.';
      const dmg = 1 + rng.int(4);
      t.hp -= dmg;
      ctx.msg(`The foxfire burns the ${t.name}.`);
      if (t.hp <= 0) { t.hp = 0; ctx.msg(`You kill the ${t.name}!`, 'LIGHTGREEN'); ctx.onMonsterKilled(t); }
      break;
    }
    case 'SPELL_BLINK': {
      const spots: number[] = [];
      for (let y = p.y - 4; y <= p.y + 4; y++) for (let x = p.x - 4; x <= p.x + 4; x++) {
        if (!inBounds(x, y)) continue;
        const f = FEATURE[level.cells[idx(x, y)].feat];
        if (f && !f.solid && !monsterAt(level, x, y)) spots.push(idx(x, y));
      }
      if (spots.length) { const at = rng.choose(spots); const q = xy(at); p.x = q.x; p.y = q.y; ctx.msg('You blink.'); }
      break;
    }
    case 'SPELL_SUMMON_SMALL_MAMMAL': {
      const spots: number[] = [];
      for (const [dx, dy] of DIRS) {
        const x = p.x + dx, y = p.y + dy;
        if (!inBounds(x, y)) continue;
        const f = FEATURE[level.cells[idx(x, y)].feat];
        if (f && !f.solid && !monsterAt(level, x, y)) spots.push(idx(x, y));
      }
      if (!spots.length) return 'There is no room to summon anything.';
      const at = rng.choose(spots); const q = xy(at);
      const def = MONSTER_BY_NAME.get(rng.oneChanceIn(3) ? 'quokka' : rng.coinflip() ? 'rat' : 'bat') ?? MONSTER_BY_NAME.get('rat')!;
      level.monsters.push({
        uid: level.monsters.length + 1, def: def.id, name: def.name, x: q.x, y: q.y,
        hp: Math.max(1, Math.round(def.hp)), hpMax: Math.max(1, Math.round(def.hp)), hd: def.hd,
        ac: def.ac, ev: def.ev, speed: def.speed, energy: 0, asleep: false, attitude: 'friendly',
        cooldown: 0, unique: false, confused: 0, slowed: 0, poisoned: 0, fleeing: 0, invisible: 0, known: true,
      });
      ctx.msg('A small mammal appears.', 'LIGHTGREEN');
      break;
    }
    case 'SPELL_HIBERNATION': {
      const t = target ?? nearestVisible(ctx, range);
      if (!t) return 'There is nothing in that direction.';
      if (t.hp <= 0) return null;
      if (rng.int(100) < 50 + Math.trunc(spellPower(p, spellId) / 100)) {
        t.asleep = true;
        ctx.msg(`The ${t.name} falls asleep.`, 'LIGHTBLUE');
      } else ctx.msg(`The ${t.name} resists.`);
      break;
    }
    case 'SPELL_CONFUSE':
    case 'SPELL_CONFUSING_TOUCH': {
      const t = target ?? (dir ? beamMonsters(level, p, dir[0], dir[1], 1)[0] : nearestVisible(ctx, 1));
      if (!t) return 'There is nothing in that direction.';
      if (rng.int(100) < 40 + Math.trunc(spellPower(p, spellId) / 50)) {
        t.confused = 4 + rng.int(6);
        ctx.msg(`The ${t.name} looks confused.`);
      } else ctx.msg(`The ${t.name} resists.`);
      break;
    }
    case 'SPELL_SWIFTNESS': {
      p.status.DUR_SWIFTNESS = 20 + rng.int(20);
      ctx.msg('You feel swift.', 'LIGHTGREEN');
      break;
    }
    case 'SPELL_INNER_FLAME': {
      const t = nearestVisible(ctx, range);
      if (!t) return 'There is nothing nearby.';
      t.statusInnerFlame = 1;
      ctx.msg(`The ${t.name} is filled with inner flame.`, 'LIGHTRED');
      break;
    }
    default: {
      // The port implements a generic effect for the remaining starting spells: a direct damage
      // spell of the spell's level, or a self-enchantment.
      if (spell.flags.includes('selfench') || spell.rangeMax < 0) {
        p.status[`DUR_${spellId.replace(/^SPELL_/, '')}`] = 15 + rng.int(20);
        ctx.msg(`You cast ${name}.`, 'LIGHTGREEN');
      } else {
        const t = target ?? (dir ? beamMonsters(level, p, dir[0], dir[1], range)[0] : null);
        if (!t) return 'There is nothing in that direction.';
        damageSpell(ctx, spellId, t, 1, 3 + spell.level);
      }
      break;
    }
  }
  return null;
}

// extra field on Monster for inner flame; kept out of the save model's core to avoid a version bump
declare module './model.ts' {
  interface Monster { statusInnerFlame?: number }
}

export function monsterCast(ctx: MagicCtx, mon: Monster, spellId: string): void {
  const { rng, player: p } = ctx;
  const spell = SPELL_BY_ID.get(spellId);
  const name = spell?.name ?? 'spell';
  if (spellId === 'SPELL_INVISIBILITY') { mon.invisible = 20 + rng.int(20); ctx.msg(`The ${mon.name} becomes invisible.`); return; }
  if (spellId === 'SPELL_HEAL_OTHER' || spellId === 'SPELL_MINOR_HEALING') { mon.hp = Math.min(mon.hpMax, mon.hp + 3 + rng.int(6)); ctx.msg(`The ${mon.name} looks healthier.`); return; }
  if (spellId === 'SPELL_CONFUSE' || spellId === 'SPELL_CONFUSING_TOUCH') {
    p.status.DUR_CONF = 4 + rng.int(6); ctx.msg(`The ${mon.name} confuses you.`, 'LIGHTRED'); return;
  }
  if (spellId === 'SPELL_HASTE' || spellId === 'SPELL_SWIFTNESS') { mon.slowed = 0; mon.energy += 5; ctx.msg(`The ${mon.name} moves faster.`); return; }
  if (spellId === 'SPELL_SLOW') { p.status.DUR_SLOW = 8 + rng.int(8); ctx.msg(`The ${mon.name} slows you.`, 'LIGHTRED'); return; }
  // damaging bolt
  let damage = 2 + rng.int(3 + Math.max(0, mon.hd));
  if (spell?.level) damage += spell.level;
  damage = Math.max(0, damage - rng.int(1 + Math.max(0, Math.trunc(0))));
  p.hp -= damage;
  ctx.msg(`The ${mon.name} casts ${name}. The bolt hits you${damage >= 10 ? '!!' : damage >= 5 ? '!' : '.'}`, 'LIGHTRED');
  ctx.onPlayerDamaged(damage);
  if (p.hp <= 0) ctx.onPlayerKilled(mon);
}

function hasMutation(p: Player, name: string): boolean { return (p.mutations[name] ?? 0) > 0; }
