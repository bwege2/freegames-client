// A deep copy that keeps class instances' prototypes: the C++ copy constructors the GUI uses on GameSave
// (`std::make_unique<GameSave>(*clip)`), which copy every member.

export function deepClone<T>(v: T): T {
  return clone(v, new Map()) as T;
}

function clone(v: unknown, seen: Map<unknown, unknown>): unknown {
  if (v === null || typeof v !== 'object') return v;
  if (seen.has(v)) return seen.get(v);
  if (ArrayBuffer.isView(v)) {
    const c = (v as unknown as { slice(): unknown }).slice();
    seen.set(v, c);
    return c;
  }
  if (Array.isArray(v)) {
    const c: unknown[] = [];
    seen.set(v, c);
    for (const x of v) c.push(clone(x, seen));
    return c;
  }
  if (v instanceof Map) {
    const c = new Map();
    seen.set(v, c);
    for (const [k, x] of v) c.set(k, clone(x, seen));
    return c;
  }
  if (v instanceof Set) {
    const c = new Set();
    seen.set(v, c);
    for (const x of v) c.add(clone(x, seen));
    return c;
  }
  const c = Object.create(Object.getPrototypeOf(v));
  seen.set(v, c);
  for (const k of Object.keys(v)) c[k] = clone((v as Record<string, unknown>)[k], seen);
  return c;
}
