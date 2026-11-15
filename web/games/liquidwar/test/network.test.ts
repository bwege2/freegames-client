// The network game's colours and starting parts (src/network.c) against the original: 2000 team tables
// were run through Liquid War 5.6.6's own network.c (re/liquidwar/tools/netcolors.sh) and the port must
// give the same colour and part for every team.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { lw_network_attribute_colors, lw_network_attribute_parts } from '../src/lw/network.ts';
import { G, NB_TEAMS } from '../src/lw/state.ts';

const here = dirname(new URL(import.meta.url).pathname);

test('lw_network_attribute_colors and _parts give what network.c gives', () => {
  const lines = readFileSync(join(here, 'network-colors.txt'), 'latin1').trim().split('\n');
  assert.equal(lines.length, 2000);
  for (const line of lines) {
    const [input, output] = line.split(' => ') as [string, string];
    input.split(' | ').forEach((t, i) => {
      const [color, active, network, serverId, prior] = t.split(' ').map(Number) as [number, number, number, number, number];
      G.CONFIG_TEAM_COLOR[i] = color;
      const ni = G.LW_NETWORK_INFO[i]!;
      ni.active = active;
      ni.network = network;
      ni.server_id = serverId;
      ni.color = prior;
      ni.part = 0;
    });
    lw_network_attribute_colors();
    lw_network_attribute_parts();
    const got: number[] = [];
    for (let i = 0; i < NB_TEAMS; i++) got.push(G.LW_NETWORK_INFO[i]!.color, G.LW_NETWORK_INFO[i]!.part);
    assert.equal(got.join(' '), output, line);
  }
});
