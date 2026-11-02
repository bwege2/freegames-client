// The converted Tux Racer data: course parameters and event definitions, the three race
// conditions' lights/sky, and the original's binary bitmaps and textures. re/tuxracer/fetch.sh
// makes all of it; courses, music and sounds are downloaded only when they are needed.
import coursesJson from '../assets/courses.json';
import eventsJson from '../assets/events.json';
import lightsJson from '../assets/lights.json';
import { Course, decodeImage, type CourseConfig } from './course.ts';

export interface RaceInfo {
  course: string; name: string; description: string; parTime: number;
  herring: number[]; time: number[]; score: number[];
  mirrored: string; conditions: string; windy: string; snowing: string;
}
export interface CupInfo { name: string; icon: string; races: RaceInfo[] }
export interface EventInfo { name: string; icon: string; cups: CupInfo[] }
export interface EventData { courses: { course: string; name: string; description: string; parTime: number }[]; events: EventInfo[] }
export interface LightInfo {
  on: boolean; position: number[]; diffuse: number[]; specular: number[]; ambient: number[];
}
export interface ConditionInfo {
  lights: LightInfo[];
  fog: { on: boolean; mode: string; density: number; colour: number[]; start: number; end: number };
  particleColour: number[];
  sky: Record<string, string>;
}

export const COURSES = coursesJson as unknown as Record<string, CourseConfig>;
export const EVENTS = eventsJson as EventData;
export const CONDITIONS = lightsJson as Record<string, ConditionInfo>;

const urls = import.meta.glob('../assets/**/*', { query: '?url', import: 'default', eager: true }) as Record<string, string>;

/** The URL of a file in assets/, as Vite emits it (with a content hash). */
export function assetUrl(path: string): string {
  const url = urls[`../assets/${path}`];
  if (!url) throw new Error(`no asset ${path}`);
  return url;
}

/** Loads a course's three bitmaps and builds it. */
export async function loadCourse(id: string, random: () => number, signal?: AbortSignal, options?: { mirror?: boolean }): Promise<Course> {
  const cfg = COURSES[id];
  if (!cfg) throw new Error(`unknown course ${id}`);
  const fetchBin = async (file: string): Promise<ArrayBuffer> => {
    const r = await fetch(assetUrl(`courses/${id}/${file}`), { signal });
    if (!r.ok) throw new Error(`${id}/${file}: ${r.status}`);
    return r.arrayBuffer();
  };
  const [elev, terrain, trees] = await Promise.all([fetchBin('elev.bin'), fetchBin('terrain.bin'), fetchBin('trees.bin')]);
  return new Course(cfg, decodeImage(elev), decodeImage(terrain), decodeImage(trees), random, options);
}

/** The original's sky texture names (e.g. sunnyfront.rgb) to the converted common/ PNGs. */
export function skyFile(name: string): string {
  return `common/${name.replace(/\.rgb$/, '.png')}`;
}
