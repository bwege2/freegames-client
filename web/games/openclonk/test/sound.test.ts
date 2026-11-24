// The sound layer (src/rt/al.ts) in headless Chromium: the browser decodes the original's Ogg Vorbis files at their
// own sample rate into exactly as many samples as the file holds (its last granule position), VorbisLoader::ReadInfo's
// calls read them, and a source plays them through the OpenAL calls of C4SoundInstance (alGenSources, alSourcei
// AL_BUFFER, alSource3f AL_POSITION, alSourcef AL_GAIN, alSourcePlay) into an OfflineAudioContext, whose output is
// the sound. Chromium as web/scripts/e2e.mjs finds it, or $CHROME.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { planet } from './oracle.ts';
import { vorbisInfo } from '../src/rt/al.ts';

const here = path.dirname(fileURLToPath(import.meta.url));
const chrome = process.env.CHROME ?? ['/usr/bin/chromium-browser', '/usr/bin/chromium', '/usr/bin/google-chrome'].find((p) => fs.existsSync(p));
const skip = !fs.existsSync(planet) ? 'no reference source (re/openclonk/fetch.sh)' : !chrome ? 'no Chromium (set CHROME)' : false;

const FILES = ['Sound.ocg/Hits.ocg/Materials.ocg/Glass.ocg/GlassHit1.ogg', 'Sound.ocg/Environment.ocg/Waterfall.ogg', 'Sound.ocg/Animals.ocg/LavaCore.ocg/Fossilize.ogg'];

test('Chromium decodes the original\'s Ogg Vorbis files for vorbisfile, and OpenAL sources play them', { skip, timeout: 120_000 }, async () => {
  const files = FILES.filter((f) => fs.existsSync(path.join(planet, f)));
  assert.equal(files.length, FILES.length, `test files: ${files.join(', ')}`);
  const esbuild = await import('esbuild');
  const bundle = await esbuild.build({ entryPoints: [path.join(here, 'browser/al-entry.ts')], bundle: true, write: false, format: 'iife', platform: 'browser', target: 'es2022' });
  const puppeteer = (await import('puppeteer-core')).default;
  const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
  try {
    const page = await browser.newPage();
    await page.setContent('<p>sound</p>');
    await page.addScriptTag({ content: bundle.outputFiles[0].text });
    const data = files.map((f) => [...fs.readFileSync(path.join(planet, f))]);
    const out = await page.evaluate(async (list: number[][]) => {
      const a = (globalThis as any).ocal;
      const P = (x: any, i = 0) => new a.Ptr(x, i);
      const results = [];
      for (const raw of list) {
        const bytes = Uint8Array.from(raw);
        const ok = await a.decodeOggVorbis(bytes);
        // VorbisLoader::ReadInfo with mem_read_func
        let pos = 0;
        const callbacks = { read_func: (ptr: any, size: number, n: number) => { const want = Math.min(size * n, bytes.length - pos); ptr.a.set(new Int8Array(bytes.buffer, pos, want), ptr.o); pos += want; return want; } };
        const vf: any = {};
        const open = a.al$ov_open_callbacks(null, vf, null, 0, callbacks);
        const info = a.al$ov_info(vf, -1);
        const pcm = new Int8Array(64 << 20);
        let got = 0;
        for (;;) { const n = Number(a.al$ov_read(vf, P(pcm, got), pcm.length - got, 0, 2, 1, null)); if (n <= 0) break; got += n; }
        let peak = 0;
        const samples = new Int16Array(pcm.buffer, 0, got / 2);
        for (let i = 0; i < samples.length; i++) peak = Math.max(peak, Math.abs(samples[i]));
        results.push({ ok, open, channels: info?.channels, rate: Number(info?.rate ?? 0), bytes: got, peak });
        // play the first one through OpenAL into an offline context: C4SoundInstance's calls
        if (results.length === 1 && info) {
          const seconds = got / 2 / info.channels / Number(info.rate);
          const ctx = new OfflineAudioContext(2, Math.ceil(44100 * (seconds + 0.1)), 44100);
          a.alSetAudioContext(ctx);
          const ids = new Uint32Array(2);
          a.al$alGenBuffers(1, P(ids, 0));
          a.al$alBufferData(ids[0], info.channels === 1 ? 0x1101 : 0x1103, P(pcm, 0), got, Number(info.rate));
          a.al$alGenSources(1, P(ids, 1));
          a.al$alSourcei(ids[1], 0x1009, ids[0]);
          a.al$alSourcei(ids[1], 0x1007, 0);
          a.al$alSource3f(ids[1], 0x1004, 0.5, 0, -0.7);
          a.al$alSourcef(ids[1], 0x100a, 1);
          a.al$alSourcePlay(ids[1]);
          const state = new Int32Array(1);
          a.al$alGetSourcei(ids[1], 0x1010, P(state));
          const rendered = await ctx.startRendering();
          const l = rendered.getChannelData(0), r = rendered.getChannelData(1);
          let el = 0, er = 0;
          for (let i = 0; i < l.length; i++) { el += l[i] * l[i]; er += r[i] * r[i]; }
          (results[0] as any).play = { state: state[0], energyLeft: el, energyRight: er, err: a.al$alGetError() };
          a.alSetAudioContext(null);
        }
      }
      return results;
    }, data);
    files.forEach((f, i) => {
      const info = vorbisInfo(new Uint8Array(fs.readFileSync(path.join(planet, f))))!;
      const r = out[i];
      assert.ok(r.ok, `${f} decoded`);
      assert.equal(r.open, 0, `${f} opens`);
      assert.equal(r.channels, info.channels);
      assert.equal(r.rate, info.rate, `${f}: decoded at the file's own rate`);
      assert.equal(r.bytes, info.samples * info.channels * 2, `${f}: every sample of the file (${info.samples})`);
      assert.ok(r.peak > 1000, `${f} is not silent`);
    });
    const play = (out[0] as any).play;
    assert.equal(play.state, 0x1012, 'AL_PLAYING after alSourcePlay');
    assert.equal(play.err, 0);
    assert.ok(play.energyLeft > 0 && play.energyRight > 0, 'the sound comes out');
    assert.ok(play.energyRight > play.energyLeft, 'panned to the right (x = 0.5)');
  } finally {
    await browser.close();
  }
});
