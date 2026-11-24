// A 0 A.D. scenario / skirmish map XML (`<Scenario version="7">`), as CMapReader::ReadXML reads it.
// The port uses the map's original terrain (a separate PMP file), its environment, its camera and
// its entity placements: templates, positions, orientations, owners and actor seeds.
//
// Coordinates are 0 A.D. world metres: x east, z south, y up. `Orientation/@y` is a yaw in radians
// around +Y. Entities without a `<Player>` are Gaia's (player 0).

import { child, childText, path, pathText, tokens, type XmlElement, parseXml } from './xml.ts';

export interface ScenarioEnvironment {
  skySet: string;
  sunColor: [number, number, number];
  sunElevation: number;
  sunRotation: number;
  ambientColor: [number, number, number];
  fog: { factor: number; thickness: number; color: [number, number, number] };
  water: {
    type: string;
    color: [number, number, number];
    tint: [number, number, number];
    height: number;
    waviness: number;
    murkiness: number;
    windAngle: number;
  } | null;
  postproc: { brightness: number; contrast: number; saturation: number; bloom: number; effect: string };
}

export interface ScenarioSettings {
  name: string;
  description: string;
  circularMap: boolean;
  keywords: string[];
  preview: string;
  victoryConditions: string[];
  playerData: unknown[];
  [key: string]: unknown;
}

export interface Placement {
  uid: number;
  template: string;
  player: number;
  x: number;
  z: number;
  /** yaw around +Y in radians */
  angle: number;
  /** the actor's variation seed from the map, or 0 */
  seed: number;
}

export interface ScenarioCamera {
  x: number;
  y: number;
  z: number;
  rotation: number;
  declination: number;
}

export interface Scenario {
  environment: ScenarioEnvironment;
  camera: ScenarioCamera;
  settings: ScenarioSettings;
  placements: Placement[];
}

function vec3(node: XmlElement | undefined, fallback = 0): [number, number, number] {
  if (!node) return [fallback, fallback, fallback];
  const get = (name: string): number => {
    const value = Number.parseFloat(node.attrs[name] ?? '');
    return Number.isFinite(value) ? value : fallback;
  };
  return [get('r'), get('g'), get('b')];
}

function num(node: XmlElement | undefined, fallback = 0): number {
  if (!node) return fallback;
  const value = Number.parseFloat(node.text || node.attrs.angle || node.attrs.value || '');
  return Number.isFinite(value) ? value : fallback;
}

function attr(node: XmlElement | undefined, name: string, fallback = 0): number {
  const value = Number.parseFloat(node?.attrs[name] ?? '');
  return Number.isFinite(value) ? value : fallback;
}

export function parseScenario(source: string): Scenario {
  const root = parseXml(source);
  if (root.name !== 'Scenario') throw new Error(`not a 0 A.D. scenario: <${root.name}>`);
  const env = child(root, 'Environment');
  const waterBody = path(env, 'Water', 'WaterBody');
  const fog = child(env, 'Fog');
  const camera = child(root, 'Camera');
  const script = child(root, 'ScriptSettings');
  let settings: ScenarioSettings = {
    name: 'Skirmish', description: '', circularMap: true, keywords: [], preview: '', victoryConditions: ['conquest'], playerData: [],
  };
  if (script?.text) {
    try {
      // the map settings use the engine's capitalised keys (Name, Description, PlayerData, ...)
      const raw = JSON.parse(script.text) as Record<string, unknown>;
      settings = {
        ...settings,
        ...raw,
        name: typeof raw.Name === 'string' ? raw.Name : settings.name,
        description: typeof raw.Description === 'string' ? raw.Description : settings.description,
        circularMap: typeof raw.CircularMap === 'boolean' ? raw.CircularMap : settings.circularMap,
        keywords: Array.isArray(raw.Keywords) ? raw.Keywords.map(String) : settings.keywords,
        preview: typeof raw.Preview === 'string' ? raw.Preview : settings.preview,
        victoryConditions: Array.isArray(raw.VictoryConditions) ? raw.VictoryConditions.map(String) : settings.victoryConditions,
        playerData: Array.isArray(raw.PlayerData) ? raw.PlayerData : settings.playerData,
      };
    } catch (e) {
      throw new Error(`bad ScriptSettings JSON: ${(e as Error).message}`);
    }
  }

  const placements: Placement[] = [];
  for (const e of child(root, 'Entities')?.children ?? []) {
    if (e.name !== 'Entity') continue;
    const template = childText(e, 'Template');
    if (!template) continue;
    const pos = child(e, 'Position');
    const orientation = child(e, 'Orientation');
    const playerText = childText(e, 'Player');
    const uid = Number.parseInt(e.attrs.uid ?? '', 10);
    const seedText = child(e, 'Actor')?.attrs.seed;
    const x = Number.parseFloat(pos?.attrs.x ?? 'NaN');
    const z = Number.parseFloat(pos?.attrs.z ?? 'NaN');
    if (!Number.isFinite(x) || !Number.isFinite(z)) continue;
    placements.push({
      uid: Number.isFinite(uid) ? uid : placements.length + 1,
      template,
      player: playerText ? Number.parseInt(playerText, 10) : 0,
      x,
      z,
      angle: Number.parseFloat(orientation?.attrs.y ?? '0') || 0,
      seed: Number.parseInt(seedText || '0', 10) || 0,
    });
  }

  return {
    environment: {
      skySet: childText(env, 'SkySet') || 'default',
      sunColor: vec3(child(env, 'SunColor'), 1),
      sunElevation: num(child(env, 'SunElevation'), 0.785),
      sunRotation: num(child(env, 'SunRotation'), 0),
      ambientColor: vec3(child(env, 'AmbientColor'), 0.5),
      fog: {
        factor: num(child(fog, 'FogFactor'), 0),
        thickness: num(child(fog, 'FogThickness'), 0),
        color: vec3(child(fog, 'FogColor'), 0.5),
      },
      water: waterBody
        ? {
            type: childText(waterBody, 'Type') || 'ocean',
            color: vec3(child(waterBody, 'Color'), 0.2),
            tint: vec3(child(waterBody, 'Tint'), 0.2),
            height: num(child(waterBody, 'Height'), 0),
            waviness: num(child(waterBody, 'Waviness'), 0),
            murkiness: num(child(waterBody, 'Murkiness'), 0),
            windAngle: num(child(waterBody, 'WindAngle'), 0),
          }
        : null,
      postproc: {
        brightness: num(path(env, 'Postproc', 'Brightness'), 0),
        contrast: num(path(env, 'Postproc', 'Contrast'), 1),
        saturation: num(path(env, 'Postproc', 'Saturation'), 1),
        bloom: num(path(env, 'Postproc', 'Bloom'), 0),
        effect: pathText(env, 'Postproc', 'PostEffect') || 'default',
      },
    },
    camera: {
      x: attr(path(camera, 'Position'), 'x'),
      y: attr(path(camera, 'Position'), 'y'),
      z: attr(path(camera, 'Position'), 'z'),
      rotation: num(child(camera, 'Rotation'), 0),
      declination: num(child(camera, 'Declination'), 0.7),
    },
    settings,
    placements,
  };
}

/** The skirmish replacers a map uses; `{civ}` is substituted by the player's civilisation. */
export function skirmishReplacement(template: XmlElement, civ: string): string | null {
  const replacer = child(template, 'SkirmishReplacer');
  if (!replacer) return null;
  const general = childText(replacer, 'general');
  if (!general) return null;
  return general.replace(/\{civ\}/g, civ);
}

/** The tokens of a datatype="tokens" child at a path. */
export function pathTokens(node: XmlElement | undefined, ...names: string[]): string[] {
  return tokens(pathText(node, ...names));
}
