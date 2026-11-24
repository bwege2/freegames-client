// The shipped actor data and the original files the renderer uses: the base kit of a hoplite,
// the tunic texture, the tree/berry visuals, the font files and the manifest's licence split.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { selectVisual, type ActorData } from '../src/render/actor.ts';

const ROOT = join(import.meta.dirname, '..', 'assets');
const actors = JSON.parse(readFileSync(join(ROOT, 'actors.json'), 'utf8')) as Record<string, ActorData>;
const manifest = JSON.parse(readFileSync(join(ROOT, 'MANIFEST.json'), 'utf8')) as {
  counts: { art: number; data: number };
  bytes: { art: number; data: number };
  files: { kind: string; source: string; dest: string; bytes: number; sha256: string }[];
};

test('the Athenian hoplite actor keeps the original body, four kit props and its animations', () => {
  const visual = selectVisual(actors['units/athen/infantry_spearman_b'], 1)!;
  assert.equal(visual.mesh, 'skeletal/new/m_tunic_short.pmd');
  assert.ok(visual.texture?.startsWith('skeletal/hele/tunic_'), visual.texture ?? '');
  assert.deepEqual(visual.props.map((p) => p.attachpoint).sort(), ['head', 'helmet', 'shield_arm', 'weapon_R']);
  assert.ok(visual.props.every((p) => p.mesh.endsWith('.pmd')));
  assert.ok(visual.clips.has('idle') && visual.clips.has('walk') && visual.clips.has('attack_melee'));
  assert.ok(visual.clips.has('gather_tree') && visual.clips.has('build'));
  // the body is the original PMD with 46 bones; the PSA clips were copied for it
  const clip = visual.clips.get('idle')![0].file;
  assert.ok(existsSync(join(ROOT, 'animations', clip)));
});

test('the Carthaginian archer and Civic Centre use the original Punic models and textures', () => {
  const archer = selectVisual(actors['units/cart/infantry_archer_b'], 1)!;
  assert.equal(archer.mesh, 'skeletal/new/m_tunic_short.pmd');
  assert.ok(archer.texture?.startsWith('skeletal/cart/tunic_'), archer.texture ?? '');
  assert.ok(archer.props.some((p) => p.attachpoint === 'weapon_R'));
  assert.ok(archer.clips.has('attack_ranged') && archer.clips.has('gather_tree') && archer.clips.has('build'));
  const spear = selectVisual(actors['units/cart/infantry_spearman_b'], 1)!;
  assert.ok(spear.texture?.startsWith('skeletal/cart/tunic_'), spear.texture ?? '');
  assert.ok(spear.props.some((p) => p.attachpoint === 'shield_arm'));
  const cc = selectVisual(actors['structures/cart/civil_centre'], 1)!;
  assert.equal(cc.mesh, 'structural/kart_civiccentre.pmd');
  assert.ok(cc.texture?.startsWith('structural/kart_struct'), cc.texture ?? '');
});

test('Athenian and Carthaginian soldiers keep their own portraits', () => {
  const icons = JSON.parse(readFileSync(join(ROOT, 'icons', 'icons.json'), 'utf8')) as Record<string, string>;
  for (const [unit, portrait] of [
    ['units/athen/infantry_spearman_b', 'units/athen/infantry_spearman.png'],
    ['units/cart/infantry_spearman_b', 'units/cart/infantry_spearman.png'],
    ['units/athen/support_civilian', 'units/athen/support_civilian.png'],
    ['units/cart/support_civilian', 'units/cart/support_civilian.png'],
  ] as const) {
    assert.equal(icons[unit], portrait, unit);
    assert.ok(existsSync(join(ROOT, 'icons', portrait)), portrait);
  }
  assert.notEqual(icons['units/athen/infantry_spearman_b'], icons['units/cart/infantry_spearman_b']);
  assert.notEqual(icons['units/athen/support_civilian'], icons['units/cart/support_civilian']);
});

test('the Gaia berry bush uses a separate mesh and texture group', () => {
  const visual = selectVisual(actors['gaia/fruit/berry_01'], 1)!;
  assert.ok(visual.mesh.startsWith('gaia/berry_bush_'));
  assert.ok(visual.texture?.startsWith('gaia/berry_bush_'), visual.texture ?? '');
});

test('the template subset covers every resource and every building the port places', () => {
  for (const f of manifest.files.filter((x) => x.kind === 'template')) {
    assert.ok(f.dest.startsWith('templates/'));
    assert.ok(f.source.startsWith('simulation/templates/'));
  }
  const names = new Set(manifest.files.filter((x) => x.kind === 'template').map((x) => x.dest.replace(/^templates\//, '').replace(/\.xml$/, '')));
  for (const n of ['units/athen/infantry_spearman_b', 'structures/athen/civil_centre', 'gaia/tree/temperate',
    'mixins/builder', 'mixins/hoplite', 'mixins/civ/athen']) assert.ok(names.has(n), n);
});

test('the manifest separates CC BY-SA art from GPL data and records a hash for every file', () => {
  assert.equal(manifest.counts.art + manifest.counts.data, manifest.files.length);
  assert.ok(manifest.counts.art > 300 && manifest.counts.data >= 53);
  assert.ok(manifest.bytes.art > 20_000_000, String(manifest.bytes.art));
  assert.ok(manifest.bytes.data < 2_000_000, String(manifest.bytes.data));
  assert.equal(new Set(manifest.files.map((f) => f.dest)).size, manifest.files.length, 'no two sources ship to the same file');
  for (const f of manifest.files) {
    assert.match(f.sha256, /^[0-9a-f]{64}$/, f.dest);
    const bytes = readFileSync(join(ROOT, f.dest));
    assert.equal(bytes.length, f.bytes, f.dest);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), f.sha256, f.dest);
  }
  // no audio, music, font other than the two HUD faces, and no locale data
  assert.equal(manifest.files.filter((f) => f.kind === 'font').length, 4); // FreeSans, Biolinum + two licences
  assert.ok(!manifest.files.some((f) => /music|\.ogg$|\.mp3$/i.test(f.dest)));
});

test('the HUD font files and the favicon source are present', () => {
  for (const f of ['fonts/FreeSans.ttf', 'fonts/FreeFont-LICENSE.txt', 'fonts/LinBiolinum_Rah.ttf',
    'fonts/LibBiolinum-LICENSE.txt', 'icon-source.png', 'icons/civic_centre.png', 'icons/food.png']) {
    assert.ok(existsSync(join(ROOT, f)), f);
  }
});
