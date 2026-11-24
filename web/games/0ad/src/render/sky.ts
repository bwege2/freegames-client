import { CubeTextureLoader, Scene, SRGBColorSpace } from 'three';
import { assetUrl } from '../assets.ts';

export interface SkyData { name: string; faces: { front: string; back: string; top: string; right: string; left: string } }

/** The map's original sky cubemap. 0 A.D.'s face order is front, back, top, top, right, left;
 * a cube texture wants +X,-X,+Y,-Y,+Z,-Z, so right/left/top/front/back map directly and the
 * missing bottom face reuses the top. */
export function applySky(scene: Scene, sky: SkyData): void {
  const loader = new CubeTextureLoader();
  const cube = loader.load([
    assetUrl(sky.faces.right),
    assetUrl(sky.faces.left),
    assetUrl(sky.faces.top),
    assetUrl(sky.faces.top),
    assetUrl(sky.faces.front),
    assetUrl(sky.faces.back),
  ]);
  cube.colorSpace = SRGBColorSpace;
  scene.background = cube;
}
