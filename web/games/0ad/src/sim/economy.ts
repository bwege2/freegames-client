// Economy numbers from the templates: ResourceGatherer.Rates and Capacities, the gather-rate
// lookup GetTargetGatherRate (specific subtype first, generic fallback, DiminishingReturns),
// ResourceDropsite.Types, Cost.BuildTime and Foundation's multiple-builder multiplier.
import type { TemplateInfo, Resource } from '../data/template-info.ts';
import { RESOURCES } from '../data/template-info.ts';

export interface SupplyType { generic: Resource; specific: string; raw: string }

export function supplyType(raw: string): SupplyType {
  const [generic, specific = ''] = raw.split('.');
  return { generic: generic as Resource, specific, raw };
}

/** ResourceGatherer.GetTargetGatherRate for one target type. */
export function gatherRate(info: TemplateInfo, supply: SupplyType, diminishingReturns = 1): number {
  const g = info.gatherer;
  if (!g) return 0;
  let rate = 0;
  if (supply.specific) rate = g.rates[`${supply.generic}.${supply.specific}`] ?? 0;
  if (rate === 0) rate = g.rates[supply.generic] ?? 0;
  return rate * g.baseSpeed * diminishingReturns;
}

export function capacity(info: TemplateInfo, resource: Resource): number {
  return info.gatherer?.capacities[resource] ?? 0;
}

/** ResourceDropsite.Types */
export function acceptsResource(info: TemplateInfo, resource: Resource): boolean {
  return !!info.dropsite?.includes(resource);
}

/** Foundation.CalculateBuildMultiplier: 1 builder = 1, n builders = n^0.7 / n (BuildTimeModifier 0.7). */
export function builderMultiplier(builders: number): number {
  return builders < 2 ? 1 : Math.pow(builders, 0.7) / builders;
}

/** Population limit: Player.GetPopulationLimit is min(MaxPopulation, bonuses); CC and houses give bonuses. */
export const MAX_POPULATION = 300;

export function popCost(info: TemplateInfo): number {
  return info.cost.population;
}

export function resourceList(): Resource[] {
  return RESOURCES;
}

/** The four resource names as 0 A.D. spells them in its GUI. */
export const RESOURCE_LABEL: Record<Resource, string> = { food: 'Food', wood: 'Wood', stone: 'Stone', metal: 'Metal' };
