// The port's engine on its own: level files parse, levels load, Tux hits a bonus block from below,
// collects a coin, enters an end trigger and two local players coexist.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import './loader.ts';
import { parseLevel } from '../src/level.ts';
import { loadTileSet } from '../src/tileset.ts';
import { Sector } from '../src/sector.ts';
import { Controller } from '../src/entity.ts';
import { PlayerStatus } from '../src/player.ts';
import { silentSound } from '../src/resources.ts';

const root = new URL('../assets/', import.meta.url);
const levelDir = new URL('levels/world1/', root);

test('the Icy Island level files keep the original level names, authors, licences and tile counts', () => {
  const files = readdirSync(levelDir).filter((f) => f.endsWith('.stl'));
  assert.equal(files.length, 30, '30 .stl files, 27 of them playable');
  for (const f of files) {
    const level = parseLevel(f, readFileSync(new URL(f, levelDir), 'utf8'));
    assert.ok(level.name.length > 0, f);
    assert.ok(level.license.length > 0, f);
    for (const sector of level.sectors.values()) {
      for (const tm of sector.tilemaps) {
        assert.equal(tm.tiles.length, tm.width * tm.height, `${f}: tilemap size`);
      }
    }
  }
  const worldmap = parseLevel('worldmap.stwm', readFileSync(new URL('worldmap.stwm', levelDir), 'utf8'));
  const nodes = [...worldmap.sectors.values()][0].objects.filter((o) => o.type === 'level');
  assert.equal(nodes.length, 29, 'the worldmap has 29 level nodes');
});

test('every Icy Island level loads and simulates a second without errors', async () => {
  const tileset = await loadTileSet('images/tiles.strf');
  const names = ['welcome_antarctica.stl', 'journey_begins.stl', 'via_nostalgica.stl', 'fork_in_the_road.stl',
    'somewhat_smaller_bath.stl', 'frosted_fields.stl', 'more_snowballs.stl', 'stone_cold.stl', '23rd_airborne.stl',
    'above_arctic_skies.stl', 'night_chill.stl', 'into_stars.stl', 'entrance_cave.stl', 'between_glaciers.stl',
    'under_the_ice.stl', 'living_inside_fridge.stl', 'or_just_me.stl', 'ice_in_the_hole.stl', 'miyamoto_monument.stl',
    'end_of_tunnel.stl', 'path_in_the_clouds.stl', 'castle_of_nolok.stl', 'shattered_bridge.stl', 'frozen_bridge.stl',
    'icy_valley.stl', 'crystal_mine.stl', 'yeti_boss.stl'];
  for (const f of names) {
    const level = parseLevel(f, readFileSync(new URL(f, levelDir), 'utf8'));
    const sector = new Sector(level, 'main', tileset, {
      players: 1, controllers: [new Controller()], statuses: [new PlayerStatus()], sound: silentSound,
    });
    assert.ok(sector.players[0], f);
    for (let i = 0; i < 30; i++) sector.update(0.015);
    assert.ok(sector.time > 0.4, f);
  }
});

const TEST_LEVEL = `(supertux-level
  (version 3) (name (_ "Test")) (author "Test") (license "GPL 2+ / CC-by-sa 3.0")
  (sector (name "main")
    (ambient-light (color 1 1 1))
    (camera (name "Camera") (mode "normal"))
    (music (file "/music/antarctic/voc-daytime.music"))
    (bonusblock (count 3) (sprite "/images/objects/bonus_block/purpleblock.sprite") (x 160) (y 288))
    (coin (x 224) (y 352))
    (sequencetrigger (sequence "endsequence") (width 64) (height 100) (x 300) (y 300))
    (spawnpoint (name "main") (x 128) (y 320))
    (tilemap (solid #t) (z-pos 0) (width 20) (height 15) (tiles
      ${Array.from({ length: 15 }, (_, y) => Array.from({ length: 20 }, () => (y >= 12 ? 14 : 0)).join(' ')).join('\n      ')}
    ))
  ))`;

test('a bonus block gives a coin when hit from below, a coin is collected and the end trigger finishes', async () => {
  const tileset = await loadTileSet('images/tiles.strf');
  const level = parseLevel('test.stl', TEST_LEVEL);
  const controller = new Controller();
  const status = new PlayerStatus();
  const sector = new Sector(level, 'main', tileset, {
    players: 1, controllers: [controller], statuses: [status], sound: silentSound,
  });
  const p = sector.players[0];
  const startCoins = status.coins;
  controller.set('JUMP', false);
  // jump under the block at x=160..192
  p.setPos(166, 353.2);
  p.onGroundFlag = true;
  controller.set('JUMP', true);
  sector.update(0.015);
  controller.snapshot();
  for (let i = 0; i < 40; i++) sector.update(0.015);
  assert.ok(status.coins > startCoins, `coins ${startCoins} -> ${status.coins}`);
  controller.set('JUMP', false);

  // walk into the coin
  p.setPos(220, 353.2);
  p.onGroundFlag = true;
  const before = status.coins;
  for (let i = 0; i < 5; i++) sector.update(0.015);
  assert.ok(status.coins > before, 'the coin was collected');

  // the end trigger
  assert.equal(sector.finished, false);
  p.setPos(310, 353.2);
  p.onGroundFlag = true;
  sector.update(0.015);
  assert.equal(sector.finished, true);
});

test('a real level ends when Tux enters its end trigger', async () => {
  const tileset = await loadTileSet('images/tiles.strf');
  const level = parseLevel('journey_begins.stl', readFileSync(new URL('journey_begins.stl', levelDir), 'utf8'));
  const sector = new Sector(level, 'main', tileset, {
    players: 1, controllers: [new Controller()], statuses: [new PlayerStatus()], sound: silentSound,
  });
  const trigger = sector.objects.find((e) => e.constructor.name === 'Trigger' && (e as unknown as { sequence: string }).sequence.includes('endsequence'));
  assert.ok(trigger, 'journey_begins has an end sequence trigger');
  sector.players[0].setPos(trigger.bbox.left + 4, trigger.bbox.top + 4);
  sector.update(0.015);
  assert.equal(sector.finished, true);
});

test('Tux climbs a ladder', async () => {
  const tileset = await loadTileSet('images/tiles.strf');
  const level = parseLevel('ladder.stl', TEST_LEVEL.replace('(bonusblock', '(climbable (width 32) (height 128) (x 166) (y 250))\n    (bonusblock'));
  const controller = new Controller();
  const sector = new Sector(level, 'main', tileset, {
    players: 1, controllers: [controller], statuses: [new PlayerStatus()], sound: silentSound,
  });
  const p = sector.players[0];
  p.setPos(166, 280);
  controller.set('UP', true);
  const y0 = p.bbox.top;
  for (let i = 0; i < 15; i++) { sector.update(0.015); controller.snapshot(); }
  assert.ok(p.bbox.top < y0 - 10, `climbed ${y0} -> ${p.bbox.top}`);
});

test('two local players start in the same sector', async () => {
  const tileset = await loadTileSet('images/tiles.strf');
  const level = parseLevel('test.stl', TEST_LEVEL);
  const sector = new Sector(level, 'main', tileset, {
    players: 2, controllers: [new Controller(), new Controller()],
    statuses: [new PlayerStatus(), new PlayerStatus()], sound: silentSound,
  });
  assert.equal(sector.players.length, 2);
  assert.notEqual(sector.players[0].bbox.left, sector.players[1].bbox.left);
  for (let i = 0; i < 10; i++) sector.update(0.015);
});
