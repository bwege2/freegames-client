// The theme (src/common/Theme.cpp reading bin/Themes/original.xml, "Classic", the default theme): which file
// each sprite, edge effect, sound and music name uses, with the sprites' sizes, centres and frame delays.
import { parseXml, children, attr } from './xml.ts';
import { atof } from './level.ts';

export interface Frame { file: string; centerX: number; centerY: number; width: number; height: number; delay: number }
export interface AnimSprite { name: string; frames: Frame[]; additive: boolean; order: number }
export interface EdgeSprite { name: string; file: string; scale: number; depth: number }

export class Theme {
  textures = new Map<string, string>();
  anims = new Map<string, AnimSprite>();
  edges = new Map<string, EdgeSprite>();
  biker = new Map<string, string>();
  effects = new Map<string, string>();
  misc = new Map<string, string>();
  ui = new Map<string, string>();
  sounds = new Map<string, string>();
  musics = new Map<string, string>();

  constructor(xml: string) {
    const root = children(parseXml(xml), 'xmoto_theme')[0];
    let order = 0;
    for (const s of children(root, 'sprite')) {
      const type = attr(s, 'type');
      const name = attr(s, 'name');
      const file = attr(s, 'file');
      const isAnim = attr(s, 'fileBase') !== '';
      if (!type || !name) continue;
      switch (type) {
        case 'BikerPart': this.biker.set(name, `Textures/Riders/${file}`); break;
        case 'Effect': this.effects.set(name, `Textures/Effects/${file}`); break;
        case 'Misc': this.misc.set(name, `Textures/Misc/${file}`); break;
        case 'UI': this.ui.set(name, `Textures/UI/${file}`); break;
        case 'Texture':
          if (isAnim) this.anims.set(name, readAnim(s, 'Textures/Textures', order++));
          else this.textures.set(name, `Textures/Textures/${file}`);
          break;
        case 'Entity':
          if (isAnim) this.anims.set(name, readAnim(s, 'Textures/Anims', order++));
          else this.anims.set(name, readDecoration(s, order++));
          break;
        case 'EdgeEffect':
          if (file && attr(s, 'scale') && attr(s, 'depth')) {
            this.edges.set(name, { name, file: `Textures/Effects/${file}`, scale: atof(attr(s, 'scale')), depth: atof(attr(s, 'depth')) });
          }
          break;
      }
    }
    for (const m of children(root, 'music')) this.musics.set(attr(m, 'name'), `Textures/Musics/${attr(m, 'file')}`);
    for (const m of children(root, 'sound')) this.sounds.set(attr(m, 'name'), `Textures/Sounds/${attr(m, 'file')}`);
  }

  /** a block texture by name (Block::loadToPlay: animated textures are not enabled, the first frame is used) */
  texture(name: string): string | undefined {
    const t = this.textures.get(name);
    if (t) return t;
    const a = this.anims.get(name);
    return a ? a.frames[0]?.file : undefined;
  }
}

function readAnim(s: ReturnType<typeof children>[number], dir: string, order: number): AnimSprite {
  const base = attr(s, 'fileBase'), ext = attr(s, 'fileExtension');
  const g = (n: string, d: number): number => (attr(s, n) !== '' ? atof(attr(s, n)) : d);
  const gcx = g('centerX', 0.5), gcy = g('centerY', 0.5), gw = g('width', 1.0), gh = g('height', 1.0), gd = g('delay', 0.1);
  const frames: Frame[] = [];
  children(s, 'frame').forEach((fr, n) => {
    if (n >= 100) return;
    const h = (k: string, d: number): number => (attr(fr, k) !== '' ? atof(attr(fr, k)) : d);
    frames.push({ file: `${dir}/${base}${String(n).padStart(2, '0')}.${ext}`, centerX: h('centerX', gcx), centerY: h('centerY', gcy), width: h('width', gw), height: h('height', gh), delay: h('delay', gd) });
  });
  return { name: attr(s, 'name'), frames, additive: attr(s, 'blendmode') === 'add', order };
}

function readDecoration(s: ReturnType<typeof children>[number], order: number): AnimSprite {
  const g = (n: string, d: number): number => (attr(s, n) !== '' ? atof(attr(s, n)) : d);
  return {
    name: attr(s, 'name'),
    frames: [{ file: `Textures/Anims/${attr(s, 'file')}`, centerX: g('centerX', 0.5), centerY: g('centerY', 0.5), width: g('width', 1.0), height: g('height', 1.0), delay: 0.1 }],
    additive: attr(s, 'blendmode') === 'add',
    order,
  };
}
