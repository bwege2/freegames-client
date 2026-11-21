// Data/Maps/*.json, the open-source tree's JSON form of the original binary maps.
export interface MapClothes {
  path: string;
  tintr: number;
  tintg: number;
  tintb: number;
}

export interface MapPlayer {
  creature: number;
  whichskin: number;
  coords: [number, number, number];
  yaw: number;
  targetyaw?: number;
  scale?: number;
  power?: number;
  speedmult?: number;
  proportions?: [number, number, number, number];
  armor?: { head: number; high: number; low: number };
  protection?: { head: number; high: number; low: number };
  metal?: { head: boolean; high: boolean; low: boolean };
  clothes?: MapClothes[];
  howactive?: number;
  immobile?: boolean;
  weapons?: number[];
  waypoint?: number;
  waypoints?: { pos: [number, number, number]; type: number }[] | [number, number, number][];
}

/** [type, yaw, pitch, scale, [x, y, z]] (Object::Object(Json::Value, lastscale)) */
export type MapObject = [number, number, number, number, [number, number, number]];

export interface MapDialogParticipant {
  pos: [number, number, number];
  yaw: number;
}

export interface MapDialogScene {
  camera: { pos: [number, number, number]; yaw: number; pitch: number };
  color: [number, number, number];
  location: number;
  name: string;
  participantaction: number;
  participantfacing: [number, number, number][];
  participantfocus: number;
  sound: number;
  text: string;
}

export interface MapDialog {
  participant: MapDialogParticipant[];
  scenes: MapDialogScene[];
  type: number;
}

export interface MapHotspot {
  position: [number, number, number];
  size: number;
  text: string;
  type: number;
}

export interface MapPathPoint {
  pos: [number, number, number];
  connect: number[];
}

export interface MapData {
  version?: number;
  map: {
    center: [number, number, number];
    radius: number;
    type: number;
    hostile: number;
    environment: number;
    viewdistance: number;
    fadestart: number;
    skybox: { texture: boolean; r: number; g: number; b: number; lightr: number; lightg: number; lightb: number };
    dialogs?: MapDialog[] | null;
    objects: MapObject[];
    players: MapPlayer[];
    hotspots?: MapHotspot[] | null;
    pathpoints?: MapPathPoint[] | null;
  };
}

export function parseMap(json: unknown): MapData {
  const m = json as MapData;
  if (!m || typeof m !== 'object' || !m.map || !Array.isArray(m.map.players) || !Array.isArray(m.map.objects)) {
    throw new Error('not a Lugaru map');
  }
  return m;
}

export const OBJECT_TYPE = {
  box: 0,
  weird: 1,
  spike: 2,
  treeTrunk: 3,
  treeLeaves: 4,
  bush: 5,
  rock: 6,
  wall: 7,
  chimney: 8,
  platform: 9,
  tunnel: 11,
  cool: 12,
  fire: 13,
} as const;
