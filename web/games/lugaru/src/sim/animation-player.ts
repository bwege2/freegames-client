// A small animation player over the original's frame data. The original advances `target`
// (0..1 between frameCurrent and frameTarget) with `multiplier * frame.speed * speed * 2`;
// at 200 simulation ticks per second that is `dt * frame.speed * 2` in seconds, which is what
// this class uses. One-shot attacks hold their last frame and report `done`.
import type { AnimationData } from '../data/animation.ts';
import type { Joint, SkeletonData } from '../data/skeleton.ts';

export interface PlayOptions {
  loop?: boolean;
  speed?: number;
  restart?: boolean;
}

export class AnimationPlayer {
  readonly set: (id: string) => AnimationData;
  id = 'bounceidleanim';
  frame = 0;
  loop = true;
  speed = 1;
  done = false;
  private anim: AnimationData;

  constructor(set: (id: string) => AnimationData, id = 'bounceidleanim') {
    this.set = set;
    this.anim = set(id);
    this.id = id;
  }

  play(id: string, opts: PlayOptions = {}): void {
    const next = this.set(id);
    if (!opts.restart && id === this.id && !this.done) {
      this.loop = opts.loop ?? this.loop;
      this.speed = opts.speed ?? this.speed;
      return;
    }
    this.anim = next;
    this.id = id;
    this.frame = 0;
    this.loop = opts.loop ?? false;
    this.speed = opts.speed ?? 1;
    this.done = false;
  }

  update(dt: number): void {
    if (this.done) return;
    const frames = this.anim.frames;
    if (frames.length <= 1) {
      this.done = !this.loop;
      return;
    }
    const i = Math.min(frames.length - 1, Math.floor(this.frame));
    const frameSpeed = frames[i].speed || 1;
    this.frame += dt * frameSpeed * 2 * this.speed;
    if (this.frame >= frames.length - 1) {
      if (this.loop) this.frame %= frames.length - 1;
      else {
        this.frame = frames.length - 1;
        this.done = true;
      }
    }
  }

  get label(): number {
    const frames = this.anim.frames;
    if (!frames.length) return 0;
    return frames[Math.min(frames.length - 1, Math.floor(this.frame))].label;
  }

  get animation(): AnimationData {
    return this.anim;
  }

  /** Current joints, linearly interpolated between the two surrounding frames. */
  joints(skeleton: SkeletonData): Joint[] {
    const frames = this.anim.frames;
    if (!frames.length) return skeleton.joints;
    const a = Math.min(frames.length - 1, Math.floor(this.frame));
    const b = Math.min(frames.length - 1, a + 1);
    const t = Math.min(1, Math.max(0, this.frame - a));
    const fa = frames[a].joints;
    const fb = frames[b].joints;
    return skeleton.joints.map((joint, i) => {
      const pa = fa[i]?.position ?? joint.position;
      const pb = fb[i]?.position ?? pa;
      return {
        ...joint,
        position: {
          x: pa.x + (pb.x - pa.x) * t,
          y: pa.y + (pb.y - pa.y) * t,
          z: pa.z + (pb.z - pa.z) * t,
        },
      };
    });
  }
}
