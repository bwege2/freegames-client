// PMD -> three.js geometry, unchanged vertex data. The static path is used for buildings,
// resources and props; the skinned path for units, whose bone matrices come from a PSA clip.
import { BufferGeometry, BufferAttribute, Matrix4, Quaternion, Vector3 } from 'three';
import { fetchBuffer, assetUrl } from '../assets.ts';
import { parsePmd, type PmdModel } from '../data/pmd.ts';

const cache = new Map<string, Promise<PmdModel>>();

export function loadPmd(path: string): Promise<PmdModel> {
  let p = cache.get(path);
  if (!p) {
    p = fetchBuffer(`meshes/${path}`).then((b) => parsePmd(b));
    cache.set(path, p);
  }
  return p;
}

export function buildGeometry(model: PmdModel, skinned: boolean): BufferGeometry {
  const g = new BufferGeometry();
  g.setAttribute('position', new BufferAttribute(model.positions, 3));
  g.setAttribute('normal', new BufferAttribute(model.normals, 3));
  g.setAttribute('uv', new BufferAttribute(model.uvs, 2));
  if (skinned) {
    g.setAttribute('skinIndex', new BufferAttribute(model.boneIndices, 4));
    g.setAttribute('skinWeight', new BufferAttribute(model.boneWeights, 4));
  }
  g.setIndex(new BufferAttribute(model.faces, 1));
  g.computeBoundingSphere();
  g.computeBoundingBox();
  return g;
}

export function inverseBindMatrices(model: PmdModel): Matrix4[] {
  return model.bones.map((bone) => {
    const m = new Matrix4().compose(
      new Vector3(bone.translation[0], bone.translation[1], bone.translation[2]),
      new Quaternion(bone.rotation[0], bone.rotation[1], bone.rotation[2], bone.rotation[3]),
      new Vector3(1, 1, 1),
    );
    return m.invert();
  });
}

export function uvUrl(texture: string): string {
  return assetUrl(`textures/${texture}`);
}
