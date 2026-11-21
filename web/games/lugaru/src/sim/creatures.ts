// PersonType::Load from Source/Objects/PersonType.cpp: the two creature kinds of Lugaru.
import { parseSkeleton, type SkeletonData } from '../data/skeleton.ts';
import { parseSolid, transformSolid, type SolidModel } from '../data/model.ts';
import { bakeCharacterModel, type BakedVertex } from '../data/skin.ts';
import { loadBinary } from '../load.ts';

export interface CreatureData {
  kind: 'rabbit' | 'wolf';
  skeleton: SkeletonData;
  model: SolidModel;
  baked: BakedVertex[];
  skins: string[];
  defaultScale: number;
  damageTolerance: number;
  power: number;
  maxRunSpeed: number;
  hasClaws: boolean;
  clothes: boolean;
}

export const CREATURE_RABBIT = 0;
export const CREATURE_WOLF = 1;

const RABBIT_SKINS = [
  'Textures/FurBrown.jpg', 'Textures/FurWhite.jpg', 'Textures/FurBlack.jpg',
  'Textures/FurLynx.jpg', 'Textures/FurOtter.jpg', 'Textures/FurOpal.jpg',
  'Textures/FurSable.jpg', 'Textures/FurChocolate.jpg', 'Textures/FurBlackWhite.jpg',
  'Textures/FurBrownWhite.jpg',
];
const WOLF_SKINS = ['Textures/FurWolfGrey.jpg', 'Textures/FurWolfDark.jpg', 'Textures/FurWolfSnow.jpg'];

async function loadCreature(
  kind: 'rabbit' | 'wolf',
  skeletonFile: string,
  modelFile: string,
  skins: string[],
  defaultScale: number,
  damageTolerance: number,
  power: number,
  maxRunSpeed: number,
  hasClaws: boolean,
  clothes: boolean,
): Promise<CreatureData> {
  const [skeleton, raw] = await Promise.all([
    loadBinary(`Skeleton/${skeletonFile}`).then((b) => parseSkeleton(b)),
    loadBinary(`Models/${modelFile}`).then((b) => parseSolid(b)),
  ]);
  const model = transformSolid(raw, [180, 0, 0], 0.04);
  const baked = bakeCharacterModel(model, skeleton);
  return { kind, skeleton, model, baked, skins, defaultScale, damageTolerance, power, maxRunSpeed, hasClaws, clothes };
}

export async function loadCreatures(): Promise<[CreatureData, CreatureData]> {
  const rabbit = await loadCreature('rabbit', 'BasicFigure', 'Body.solid', RABBIT_SKINS, 0.2, 200, 1, 55, false, true);
  const wolf = await loadCreature('wolf', 'BasicFigureWolf', 'Wolf.solid', WOLF_SKINS, 0.23, 300, 2.5, 75, true, false);
  return [rabbit, wolf];
}
