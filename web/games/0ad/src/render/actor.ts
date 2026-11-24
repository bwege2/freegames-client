// Actor selection, following 0 A.D.'s CObjectBase: one variant per group is chosen, weighted by
// frequency and by the entity's seed. The port keeps the original actor XML/variant data in
// assets/actors.json (built by re/0ad/tools/assets.py) and picks its base mesh, base texture,
// props and animation clips from it. Animation variants are all kept, because 0 A.D. rebuilds the
// variation for an animation state (gather_tree, build, …) and the port plays those clips directly.

export interface ActorProp {
  actor: string;
  mesh: string;
  textures: string[];
  material: string | null;
  attachpoint: string;
}

export interface ActorVariant {
  frequency: number;
  name: string;
  meshes: string[];
  textures: string[];
  props: ActorProp[];
  animations: { name: string; file: string; id: string; frequency: number; speed: number }[];
}

export interface ActorGroup { variants: ActorVariant[] }
export interface ActorData { actor: string; material: string | null; groups: ActorGroup[] }

export interface ActorVisual {
  mesh: string;
  texture: string | null;
  material: string | null;
  props: ActorProp[];
  clips: Map<string, { file: string; speed: number }[]>;
}

function pickVariant(group: ActorGroup, seed: number): ActorVariant {
  const total = group.variants.reduce((a, v) => a + Math.max(0, v.frequency), 0);
  if (total <= 0) return group.variants[Math.abs(seed) % group.variants.length];
  let r = Math.abs(seed) % total;
  for (const v of group.variants) {
    r -= Math.max(0, v.frequency);
    if (r < 0) return v;
  }
  return group.variants[group.variants.length - 1];
}

export function selectVisual(data: ActorData, seed: number): ActorVisual | null {
  let mesh: string | null = null;
  let texture: string | null = null;
  const chosen: { group: number; variant: ActorVariant }[] = [];
  data.groups.forEach((group, index) => {
    if (!group.variants.length) return;
    const variant = pickVariant(group, seed + index * 7919);
    chosen.push({ group: index, variant });
    if (!mesh && variant.meshes.length) mesh = variant.meshes[0];
    if (!texture && variant.textures.length) texture = variant.textures[0];
  });
  if (!mesh) return null;
  const propMap = new Map<string, ActorProp>();
  // The kit comes from the variant that defines the body mesh. 0 A.D. rebuilds the actor for a
  // carry/gather state and swaps the tool; the slice does not swap tools, so a carry variant's
  // metal block must not replace the spear (this happened with the generic pick over all groups).
  for (const { variant } of chosen) {
    if (!variant.meshes.length) continue;
    for (const p of variant.props) propMap.set(p.attachpoint, p);
    break;
  }
  const clips = new Map<string, { file: string; speed: number }[]>();
  for (const group of data.groups) {
    for (const v of group.variants) {
      for (const a of v.animations) {
        const list = clips.get(a.name) ?? [];
        list.push({ file: a.file, speed: a.speed });
        clips.set(a.name, list);
      }
    }
  }
  return { mesh, texture, material: data.material, props: [...propMap.values()], clips };
}
