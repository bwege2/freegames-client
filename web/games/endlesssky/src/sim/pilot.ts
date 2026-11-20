// The player's pilot: account, date, ship, cargo, visited systems, conditions
// and the trade economy, with the original's save file sections (pilot, date,
// system, planet, credits, ship, conditions, visited, economy).
import type { GameData, ShipModel, StarSystem } from '../data/gamedata.ts';
import { parseData, token, value, type DataNode } from '../data/node.ts';
import { GameDate } from './date.ts';
import type { Random } from './rng.ts';
import { Ship } from './ship.ts';
import { Point } from './math.ts';

export interface Mortgage {
  type: string;
  principal: number;
  interest: number;
  term: number;
}

export interface Pilot {
  firstName: string;
  lastName: string;
  credits: number;
  score: number;
  date: GameDate;
  system: StarSystem;
  planet: string;
  ship: Ship;
  visited: Set<string>;
  visitedPlanets: Set<string>;
  conditions: Map<string, number>;
  reputations: Map<string, number>;
  mortgage: Mortgage | null;
  playtime: number;
  /** commodity supply per system; the original's saved economy */
  economy: Map<string, Map<string, number>>;
  startName: string;
}

export function createPilot(
  data: GameData,
  startName: string,
  firstName: string,
  lastName: string,
  shipModelName: string,
  shipName: string,
): Pilot {
  const start = data.starts.get(startName) ?? data.starts.get('default')!;
  const model = data.ships.get(shipModelName) ?? data.ships.get('Star Barge')!;
  const system = data.systems.get(start.system)!;
  const ship = new Ship(data, model, model.defaultOutfits, shipName, true);
  const cost = data.shipCost(model);
  const conditions = data.startConditions(start);
  conditions.set('name: ' + firstName + ' ' + lastName, 1);
  const pilot: Pilot = {
    firstName,
    lastName,
    credits: start.credits - cost,
    score: start.score,
    date: GameDate.fromSave(start.date.day, start.date.month, start.date.year),
    system,
    planet: start.planet,
    ship,
    visited: new Set([system.name]),
    visitedPlanets: new Set([start.planet]),
    conditions,
    reputations: new Map(),
    mortgage: start.mortgage ? { type: 'Mortgage', ...start.mortgage } : null,
    playtime: 0,
    economy: new Map(),
    startName,
  };
  ship.position = new Point(0, -400);
  return pilot;
}

/** The conditions the game derives each time they are read (PlayerInfo). */
export function pilotConditions(pilot: Pilot): Map<string, number> {
  const c = new Map(pilot.conditions);
  c.set('day', pilot.date.day);
  c.set('month', pilot.date.month);
  c.set('year', pilot.date.year);
  c.set('days since year start', pilot.date.daysSinceYearStart());
  c.set('days since start', pilot.conditions.get('days since start') ?? 0);
  c.set('credits', pilot.credits);
  c.set('net worth', pilot.credits - (pilot.mortgage?.principal ?? 0));
  c.set('unpaid mortgages', pilot.mortgage?.principal ?? 0);
  c.set('total ships', 1);
  c.set('ship model: ' + pilot.ship.model.name, 1);
  for (const [name, count] of pilot.ship.outfits) c.set('outfit: ' + name, count);
  for (const [name, tons] of pilot.ship.cargo) c.set('cargo: ' + name, tons);
  c.set('flagship model', 1);
  return c;
}

export function mortgagePayment(mortgage: Mortgage): number {
  if (!mortgage.term) return mortgage.principal;
  if (!mortgage.interest) return Math.round(mortgage.principal / mortgage.term);
  const power = Math.pow(1 + mortgage.interest, mortgage.term);
  return Math.max(1, Math.round(mortgage.principal * mortgage.interest * power / (power - 1)));
}

/** One day passes (a hyperspace jump): pay the mortgage and step the economy. */
export function stepDay(pilot: Pilot, data: GameData, random: Random, messages: string[]): void {
  pilot.date.next();
  if (pilot.mortgage) {
    const payment = mortgagePayment(pilot.mortgage);
    if (payment <= pilot.credits) {
      pilot.credits -= payment;
      pilot.mortgage.principal -= payment;
      --pilot.mortgage.term;
      if (pilot.mortgage.principal <= 0) pilot.mortgage = null;
    } else {
      pilot.mortgage.principal += Math.round(pilot.mortgage.principal * pilot.mortgage.interest);
      --pilot.mortgage.term;
      messages.push('You missed a mortgage payment.');
      pilot.score -= 1;
    }
  }
  if (!pilot.economy.has(pilot.system.name)) pilot.economy.set(pilot.system.name, new Map());
  // The original steps the whole galaxy's economy once a day. Only systems
  // with trade matter here; supply is per commodity.
  for (const system of data.systems.values()) {
    if (!system.trade.size) continue;
    const supply = pilot.economy.get(system.name) ?? new Map<string, number>();
    pilot.economy.set(system.name, supply);
    for (const commodity of system.trade.keys()) {
      let tons = supply.get(commodity) ?? 0;
      tons *= 0.89;
      tons += random.normal(0, 2000);
      supply.set(commodity, tons);
    }
  }
  pilot.conditions.set('days since start', (pilot.conditions.get('days since start') ?? 0) + 1);
  syncEconomy(pilot, data);
}

/** Apply the saved supply to the systems' price tables. */
export function syncEconomy(pilot: Pilot, data: GameData): void {
  for (const system of data.systems.values()) {
    if (!system.trade.size) continue;
    const supply = pilot.economy.get(system.name);
    for (const [commodity, price] of system.trade) {
      const tons = supply?.get(commodity) ?? 0;
      price.supply = tons;
      price.price = price.base + Math.trunc(-100 * erf(tons / 20000));
    }
  }
}

/** A purchase is charged to the system's supply only when the day steps, as
 *  the original's GameData::StepEconomy does. */
export function recordPurchase(pilot: Pilot, system: StarSystem, commodity: string, tons: number): void {
  if (!pilot.economy.has(system.name)) pilot.economy.set(system.name, new Map());
  const supply = pilot.economy.get(system.name)!;
  supply.set(commodity, (supply.get(commodity) ?? 0) + tons);
}

/** CargoHold::Free / Used, in tons. */
export function cargoUsed(pilot: Pilot): number {
  let used = 0;
  for (const tons of pilot.ship.cargo.values()) used += tons;
  return used;
}

export function cargoFree(pilot: Pilot): number {
  return Math.max(0, pilot.ship.stats.get('cargo space') - cargoUsed(pilot));
}

export function addCargo(pilot: Pilot, commodity: string, tons: number): void {
  const total = (pilot.ship.cargo.get(commodity) ?? 0) + tons;
  if (total > 0) pilot.ship.cargo.set(commodity, total);
  else pilot.ship.cargo.delete(commodity);
}

// ---------------------------------------------------------------- save files

const quote = (text: string): string => {
  if (!text) return '""';
  if (/^[^\s#"]+$/.test(text)) return text;
  return text.includes('"') ? `\`${text}\`` : `"${text}"`;
};

const num = (n: number): string => (Number.isInteger(n) ? String(n) : String(Math.round(n * 10000) / 10000));

/** PlayerInfo::Save's sections for the state this port keeps. */
export function savePilot(pilot: Pilot): string {
  const lines: string[] = [];
  lines.push(`pilot ${quote(pilot.firstName)} ${quote(pilot.lastName)}`);
  lines.push(`date ${pilot.date.day} ${pilot.date.month} ${pilot.date.year}`);
  lines.push(`system ${quote(pilot.system.name)}`);
  if (pilot.planet) lines.push(`planet ${quote(pilot.planet)}`);
  lines.push(`credits ${pilot.credits}`);
  lines.push(`score ${pilot.score}`);
  lines.push(`playtime ${num(pilot.playtime)}`);
  lines.push(`start ${quote(pilot.startName)}`);
  if (pilot.mortgage) {
    lines.push(`mortgage ${quote(pilot.mortgage.type)}`);
    lines.push('\tprincipal ' + pilot.mortgage.principal);
    lines.push('\tinterest ' + num(pilot.mortgage.interest));
    lines.push('\tterm ' + pilot.mortgage.term);
  }
  lines.push('');
  lines.push('ship ' + quote(pilot.ship.model.name));
  lines.push('\tname ' + quote(pilot.ship.name));
  lines.push('\toutfits');
  for (const [name, count] of [...pilot.ship.outfits].sort(([a], [b]) => a.localeCompare(b))) {
    lines.push(`\t\t${quote(name)} ${count}`);
  }
  lines.push('\tcargo');
  for (const [name, tons] of [...pilot.ship.cargo].sort(([a], [b]) => a.localeCompare(b))) {
    lines.push(`\t\tcommodity ${quote(name)} ${tons}`);
  }
  lines.push(`\tcrew ${pilot.ship.crew}`);
  lines.push(`\tfuel ${num(pilot.ship.fuel)}`);
  lines.push(`\tshields ${num(pilot.ship.shields)}`);
  lines.push(`\thull ${num(pilot.ship.hull)}`);
  lines.push(`\tposition ${num(pilot.ship.position.x)} ${num(pilot.ship.position.y)}`);
  lines.push('\tsystem ' + quote(pilot.system.name));
  if (pilot.planet) lines.push('\tplanet ' + quote(pilot.planet));
  lines.push('');
  lines.push('conditions');
  for (const [name, value] of [...pilot.conditions].sort(([a], [b]) => a.localeCompare(b))) {
    lines.push(`\t${quote(name)} ${num(value)}`);
  }
  lines.push('');
  for (const name of [...pilot.visited].sort()) lines.push(`visited ${quote(name)}`);
  for (const name of [...pilot.visitedPlanets].sort()) lines.push(`visited planet ${quote(name)}`);
  for (const [name, amount] of [...pilot.reputations].sort(([a], [b]) => a.localeCompare(b))) {
    lines.push(`reputation ${quote(name)} ${num(amount)}`);
  }
  lines.push('');
  lines.push('economy');
  for (const [system, supply] of [...pilot.economy].sort(([a], [b]) => a.localeCompare(b))) {
    if (!supply.size) continue;
    const parts = [...supply].filter(([, tons]) => tons).map(([commodity, tons]) => `${quote(commodity)} ${num(tons)}`);
    if (parts.length) lines.push(`\t${quote(system)} ${parts.join(' ')}`);
  }
  lines.push('');
  return lines.join('\n');
}

function child(node: DataNode, name: string): DataNode | undefined {
  return node.children.find((c) => token(c, 0) === name);
}

/** PlayerInfo::Load for the sections the port understands. */
export function loadPilot(text: string, data: GameData): Pilot | null {
  let nodes: DataNode[];
  try {
    nodes = parseData(text, 'save');
  } catch {
    return null;
  }
  const pilotNode = nodes.find((n) => token(n, 0) === 'pilot');
  if (!pilotNode) return null;
  const firstName = token(pilotNode, 1);
  const lastName = token(pilotNode, 2);

  const dateNode = nodes.find((n) => token(n, 0) === 'date');
  const date = dateNode ? new GameDate(value(dateNode, 1), value(dateNode, 2), value(dateNode, 3)) : new GameDate(16, 11, 3013);
  const systemName = token(nodes.find((n) => token(n, 0) === 'system') ?? pilotNode, 1);
  const system = data.systems.get(systemName);
  if (!system) return null;
  const planet = token(nodes.find((n) => token(n, 0) === 'planet') ?? pilotNode, 1);

  const shipNode = nodes.find((n) => token(n, 0) === 'ship');
  const modelName = shipNode ? token(shipNode, 1) : 'Star Barge';
  const model = data.ships.get(modelName);
  if (!model) return null;
  const outfits = new Map<string, number>();
  const cargo = new Map<string, number>();
  const outfitsNode = shipNode ? child(shipNode, 'outfits') : undefined;
  if (outfitsNode) for (const line of outfitsNode.children) {
    const name = token(line, 0);
    if (!name) continue;
    outfits.set(name, (outfits.get(name) ?? 0) + (line.tokens.length >= 2 ? value(line, 1) : 1));
  }
  const cargoNode = shipNode ? child(shipNode, 'cargo') : undefined;
  if (cargoNode) for (const line of cargoNode.children) {
    if (token(line, 0) === 'commodity' && line.tokens.length >= 3) cargo.set(token(line, 1), value(line, 2));
    else if (token(line, 0) === 'outfit' && line.tokens.length >= 3) outfits.set(token(line, 1), value(line, 2));
  }
  const nameNode = shipNode ? child(shipNode, 'name') : undefined;
  const ship = new Ship(data, model, outfits.size ? outfits : model.defaultOutfits, nameNode ? token(nameNode, 1) : model.displayName, true);
  for (const [name, tons] of cargo) ship.cargo.set(name, tons);
  if (shipNode) {
    const fuel = child(shipNode, 'fuel');
    const shields = child(shipNode, 'shields');
    const hull = child(shipNode, 'hull');
    const position = child(shipNode, 'position');
    if (fuel) ship.fuel = value(fuel, 1);
    if (shields) ship.shields = value(shields, 1);
    if (hull) ship.hull = value(hull, 1);
    if (position) ship.position = new Point(value(position, 1), value(position, 2));
    const crew = child(shipNode, 'crew');
    if (crew) ship.crew = value(crew, 1);
  }

  const conditions = new Map<string, number>();
  const conditionsNode = nodes.find((n) => token(n, 0) === 'conditions');
  if (conditionsNode) for (const line of conditionsNode.children) {
    if (line.tokens.length >= 2) conditions.set(token(line, 0), value(line, 1));
  }
  const visited = new Set<string>();
  const visitedPlanets = new Set<string>();
  for (const node of nodes) {
    if (token(node, 0) === 'visited') visited.add(token(node, 1));
    else if (token(node, 0) === 'visited planet') visitedPlanets.add(token(node, 1));
  }
  visited.add(system.name);
  const economy = new Map<string, Map<string, number>>();
  const economyNode = nodes.find((n) => token(n, 0) === 'economy');
  if (economyNode) for (const line of economyNode.children) {
    const name = token(line, 0);
    const supply = new Map<string, number>();
    for (let i = 1; i + 1 < line.tokens.length; i += 2) supply.set(token(line, i), value(line, i + 1));
    economy.set(name, supply);
  }
  const creditNode = nodes.find((n) => token(n, 0) === 'credits');
  const scoreNode = nodes.find((n) => token(n, 0) === 'score');
  const playNode = nodes.find((n) => token(n, 0) === 'playtime');
  const startNode = nodes.find((n) => token(n, 0) === 'start');
  const mortgageNode = nodes.find((n) => token(n, 0) === 'mortgage');
  let mortgage: Mortgage | null = null;
  if (mortgageNode) {
    mortgage = {
      type: token(mortgageNode, 1) || 'Mortgage',
      principal: value(child(mortgageNode, 'principal') ?? mortgageNode, 1),
      interest: value(child(mortgageNode, 'interest') ?? mortgageNode, 1),
      term: value(child(mortgageNode, 'term') ?? mortgageNode, 1),
    };
  }
  const reputations = new Map<string, number>();
  for (const node of nodes) if (token(node, 0) === 'reputation') reputations.set(token(node, 1), value(node, 2));

  const pilot: Pilot = {
    firstName, lastName,
    credits: creditNode ? value(creditNode, 1) : 0,
    score: scoreNode ? value(scoreNode, 1) : 0,
    date, system, planet,
    ship,
    visited, visitedPlanets,
    conditions, reputations, mortgage,
    playtime: playNode ? value(playNode, 1) : 0,
    economy,
    startName: startNode ? token(startNode, 1) : 'default',
  };
  ship.government = 'Player';
  syncEconomy(pilot, data);
  return pilot;
}

/** erf, as System::Price::Update uses it. */
export function erf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * ax);
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-ax * ax);
  return sign * y;
}

export type { ShipModel };
