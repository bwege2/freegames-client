// Browser side of test/shaders.test.ts: src/rt/gl.ts and its pointers on the page (bundled by esbuild).
import * as GLM from '../../src/rt/gl.ts';
import { Ptr, S } from '../../src/rt/ptr.ts';

(globalThis as unknown as { ocgl: unknown }).ocgl = { ...GLM, Ptr, S };
