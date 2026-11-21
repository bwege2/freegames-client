// The campaign definition and that every main-campaign map the port offers exists.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { ASSET_DIR, readJson } from './helpers.ts';
import { parseCampaign } from '../src/data/campaign.ts';
import { parseMap } from '../src/data/map.ts';

test('all 27 main-campaign levels have their map and the original links', () => {
  const c = parseCampaign(readJson<unknown>('campaign.json'));
  assert.equal(c.levels.length, 27);
  for (const level of c.levels) {
    assert.ok(existsSync(join(ASSET_DIR, 'Maps', `${level.name}.json`)), level.name);
    const map = parseMap(readJson<unknown>(`Maps/${level.name}.json`));
    assert.ok(map.map.players.length >= 1, level.name);
    assert.equal(map.map.type, 0, `${level.name} is a kill-everyone map`);
  }
  assert.equal(c.levels[0].nextLevel, 2);
  assert.equal(c.levels[26].nextLevel, 0);
});

test('the challenge and tutorial maps are shipped too', () => {
  assert.ok(existsSync(join(ASSET_DIR, 'Maps', 'tutorial.json')));
  for (let i = 1; i <= 14; i++) assert.ok(existsSync(join(ASSET_DIR, 'Maps', `map${i}.json`)), `map${i}`);
});
