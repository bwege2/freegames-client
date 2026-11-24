// 0 A.D. saves are zip archives (`*.0adsave`) with `metadata.json` and `simulation.dat`
// (source/ps/SavedGame.cpp). The slice writes the same container and the same metadata fields;
// `simulation.dat` is this port's documented slice serializer (JSON of World.serialize()), because the
// original C++ component serializers are not all ported yet. The format version says so.
import { zipSync, unzipSync } from 'fflate';
import type { World } from '../sim/world.ts';
import type { RtsCamera } from '../render/camera.ts';
import type { WorldSnapshot } from '../sim/types.ts';

export const SAVE_FILE = 'savegame.0adsave';
const FORMAT = '0ad-browser-slice';

export interface SaveMetadata {
  engine_version: string;
  engine_serialization_version: string;
  time: number;
  playerID: number;
  mods: unknown[];
  initAttributes: {
    settings: { map: string; mapType: string; StartingResources: number; PlayerData: unknown[] };
    seed: number;
  };
  gui: {
    camera: { PosX: number; PosY: number; PosZ: number; RotX: number; RotY: number; Zoom: number };
    description: string;
  };
  description: string;
}

export interface SaveFile {
  metadata: SaveMetadata;
  snapshot: WorldSnapshot;
}

const text = new TextEncoder();
const decode = new TextDecoder();

export function createSave(world: World, camera: RtsCamera, description: string): Uint8Array {
  const snapshot = world.serialize();
  const metadata: SaveMetadata = {
    engine_version: '0.28.0',
    engine_serialization_version: '0.28.0',
    time: Date.now() / 1000,
    playerID: 1,
    mods: [],
    initAttributes: {
      settings: {
        map: 'farmland_2p',
        mapType: 'skirmish',
        StartingResources: 300,
        PlayerData: [
          {},
          { Name: world.players[1].name, Civ: world.players[1].civ, Color: { r: 21, g: 55, b: 149 } },
          { Name: world.players[2].name, Civ: world.players[2].civ, Color: { r: 150, g: 20, b: 20 } },
        ],
      },
      seed: 0x5ead,
    },
    gui: {
      camera: {
        PosX: camera.camera.position.x,
        PosY: camera.camera.position.y,
        PosZ: camera.camera.position.z,
        RotX: camera.camera.rotation.x,
        RotY: camera.camera.rotation.y,
        Zoom: camera.distance,
      },
      description,
    },
    description,
  };
  const simulation = text.encode(JSON.stringify({ format: FORMAT, version: 1, world: snapshot }));
  return zipSync({
    'metadata.json': text.encode(JSON.stringify(metadata, null, 1)),
    'simulation.dat': simulation,
  });
}

export function readSave(bytes: Uint8Array): SaveFile {
  const files = unzipSync(bytes);
  if (!files['metadata.json'] || !files['simulation.dat']) throw new Error('not a 0 A.D. save: missing metadata.json or simulation.dat');
  const metadata = JSON.parse(decode.decode(files['metadata.json'])) as SaveMetadata;
  if (metadata.engine_version !== '0.28.0') throw new Error(`save is from 0 A.D. ${metadata.engine_version}, this port follows 0.28.0`);
  const simulation = JSON.parse(decode.decode(files['simulation.dat'])) as { format: string; version: number; world: WorldSnapshot };
  if (simulation.format !== FORMAT || simulation.version !== 1) throw new Error('unknown simulation.dat format in this save');
  return { metadata, snapshot: simulation.world };
}
