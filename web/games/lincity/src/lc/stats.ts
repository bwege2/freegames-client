// stats.c: the daily, monthly and yearly accumulators, and the market inventory.
import { G } from './g.ts';
import { MT, MI, P, IX, I1, I2, I3, I4, I5, I6, I7 } from './map.ts';
import { GROUP_MARKET } from './consts.ts';
import { get_group_of_type } from './lintypes.ts';
import { idiv } from './c.ts';

export function init_daily(): void {
  G.population = 0;
  G.starving_population = 0;
  G.unemployed_population = 0;
  G.food_in_markets = 0;
  G.jobs_in_markets = 0;
  G.coal_in_markets = 0;
  G.goods_in_markets = 0;
  G.ore_in_markets = 0;
  G.steel_in_markets = 0;
}

export function init_monthly(): void {
  G.data_last_month = 0;
  G.tpopulation = 0;
  G.tstarving_population = 0;
  G.tfood_in_markets = 0;
  G.tjobs_in_markets = 0;
  G.tcoal_in_markets = 0;
  G.tgoods_in_markets = 0;
  G.tore_in_markets = 0;
  G.tsteel_in_markets = 0;
  G.tunemployed_population = 0;
  G.unnat_deaths = 0;
}

export function init_yearly(): void {
  G.income_tax = 0; G.coal_tax = 0; G.unemployment_cost = 0; G.transport_cost = 0; G.goods_tax = 0;
  G.export_tax = 0; G.import_cost = 0; G.windmill_cost = 0; G.university_cost = 0; G.recycle_cost = 0;
  G.deaths_cost = 0; G.health_cost = 0; G.rocket_pad_cost = 0; G.school_cost = 0; G.fire_cost = 0;
  G.cricket_cost = 0;
}

function init_lastyear(): void {
  G.ly_income_tax = 0; G.ly_coal_tax = 0; G.ly_goods_tax = 0; G.ly_export_tax = 0; G.ly_import_cost = 0;
  G.ly_other_cost = 0; G.ly_unemployment_cost = 0; G.ly_transport_cost = 0; G.ly_university_cost = 0;
  G.ly_recycle_cost = 0; G.ly_school_cost = 0; G.ly_deaths_cost = 0; G.ly_health_cost = 0;
  G.ly_rocket_pad_cost = 0; G.ly_interest = 0; G.ly_windmill_cost = 0; G.ly_cricket_cost = 0; G.ly_fire_cost = 0;
}

export function inventory(x: number, y: number): void {
  if (get_group_of_type(MT[P(x, y)]) === GROUP_MARKET) inventory_market(x, y);
  else console.log(`Default in inventory(${x},${y}): got ${get_group_of_type(MT[P(x, y)])}`);
}

export function init_inventory(): void {
  init_daily();
  init_monthly();
  init_yearly();
  init_lastyear();
}

function inventory_market(x: number, y: number): void {
  const b = IX(x, y);
  G.food_in_markets = (G.food_in_markets + MI[b + I1]) | 0;
  G.jobs_in_markets = (G.jobs_in_markets + MI[b + I2]) | 0;
  G.coal_in_markets = (G.coal_in_markets + MI[b + I3]) | 0;
  G.goods_in_markets = (G.goods_in_markets + MI[b + I4]) | 0;
  G.ore_in_markets = (G.ore_in_markets + MI[b + I5]) | 0;
  G.steel_in_markets = (G.steel_in_markets + MI[b + I6]) | 0;
  G.waste_in_markets = (G.waste_in_markets + MI[b + I7]) | 0;
}

export function add_daily_to_monthly(): void {
  G.data_last_month++;
  G.tpopulation = (G.tpopulation + G.population) | 0;
  G.tstarving_population = (G.tstarving_population + G.starving_population) | 0;
  G.tfood_in_markets = (G.tfood_in_markets + idiv(G.food_in_markets, 1000)) | 0;
  G.tjobs_in_markets = (G.tjobs_in_markets + idiv(G.jobs_in_markets, 1000)) | 0;
  G.tcoal_in_markets = (G.tcoal_in_markets + idiv(G.coal_in_markets, 250)) | 0;
  G.tgoods_in_markets = (G.tgoods_in_markets + idiv(G.goods_in_markets, 500)) | 0;
  G.tore_in_markets = (G.tore_in_markets + idiv(G.ore_in_markets, 500)) | 0;
  G.tsteel_in_markets = (G.tsteel_in_markets + idiv(G.steel_in_markets, 25)) | 0;
  G.twaste_in_markets = (G.twaste_in_markets + G.waste_in_markets) | 0;
  G.tunemployed_population = (G.tunemployed_population + G.unemployed_population) | 0;
}
