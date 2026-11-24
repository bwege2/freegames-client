// The sound layer for the translated sound system (src/rt/al.ts), without a browser: every OpenAL, ALUT and
// vorbisfile function the original's Linux build calls is there, the list for the translator
// (re/openclonk/tools/al.txt) says the same, the original's WAV and Ogg files are read as ALUT and libvorbis read
// them, and VorbisLoader::ReadInfo's sequence gets the whole sound. (test/sound.test.ts decodes and plays in Chromium.)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { re, planet } from './oracle.ts';
import * as ALM from '../src/rt/al.ts';
import { AL, AL_FUNCTIONS, OV_ENOTVORBIS, parseWav, vorbisInfo, setDecodedVorbis, alSetAudioContext } from '../src/rt/al.ts';
import { Ptr } from '../src/rt/ptr.ts';

const src = path.join(re, 'orig/openclonk/src');
const noSource = fs.existsSync(planet) ? false : 'no reference source (re/openclonk/fetch.sh)';

test('al.txt lists the functions al.ts provides, each as al$<name>', () => {
  const listed = fs.readFileSync(path.join(re, 'tools/al.txt'), 'utf8').split('\n').filter((l) => l && !l.startsWith('#'));
  assert.deepEqual(listed, [...AL_FUNCTIONS]);
  for (const n of AL_FUNCTIONS) assert.equal(typeof (ALM as Record<string, unknown>)['al$' + n], 'function', `al$${n}`);
  assert.deepEqual(Object.keys(ALM).filter((k) => k.startsWith('al$')).map((k) => k.slice(3)).sort(), [...AL_FUNCTIONS].sort());
});

test('every OpenAL, ALUT and vorbisfile call of the original\'s sound system is provided', { skip: noSource }, () => {
  const called = new Set<string>();
  for (const f of fs.readdirSync(path.join(src, 'platform'))) {
    if (!/^C4(Sound|Music)\w*\.(cpp|h)$/.test(f)) continue;
    const text = fs.readFileSync(path.join(src, 'platform', f), 'utf8')
      .replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '')
      // macOS only: AppleSoundLoader (AudioToolbox)
      .replace(/#if AUDIO_TK == AUDIO_TK_OPENAL && defined\(__APPLE__\)[\s\S]*?#endif/g, '');
    for (const m of text.matchAll(/\b(al[A-Z]\w*|alc[A-Z]\w*|alut[A-Z]\w*|ov_[a-z_]+)\s*\(/g)) called.add(m[1]);
  }
  // macros and function pointers of C4SoundModifiers (LOAD_ALPROC), the logging macro of C4MusicFile
  for (const n of ['alErrorCheck', 'alEffectiv', 'alEffectfv', 'alGetEffecti', 'alGetEffectiv', 'alGetEffectf', 'alGetEffectfv', 'alAuxiliaryEffectSlotiv',
    'alAuxiliaryEffectSlotf', 'alAuxiliaryEffectSlotfv', 'alGetAuxiliaryEffectSloti', 'alGetAuxiliaryEffectSlotiv', 'alGetAuxiliaryEffectSlotf',
    'alGetAuxiliaryEffectSlotfv']) called.delete(n);
  const missing = [...called].filter((n) => !AL_FUNCTIONS.includes(n)).sort();
  assert.deepEqual(missing, []);
  assert.ok(called.size >= 40, `${called.size} functions`);
});

/** a stand-in for WebAudio's AudioBuffer factory (only createBuffer is used by alBufferData) */
function fakeAudio(): BaseAudioContext {
  return {
    currentTime: 0,
    destination: {},
    createGain: () => ({ connect: (x: unknown) => x, gain: { value: 1 } }),
    createBuffer: (channels: number, length: number, rate: number) => {
      const data = Array.from({ length: channels }, () => new Float32Array(length));
      return { numberOfChannels: channels, length, sampleRate: rate, duration: length / rate, getChannelData: (c: number) => data[c] };
    },
  } as unknown as BaseAudioContext;
}

test('ALUT reads the original\'s WAV files (WavLoader::ReadInfo)', { skip: noSource }, () => {
  alSetAudioContext(fakeAudio());
  const file = new Uint8Array(fs.readFileSync(path.join(planet, 'Sound.ocg/UI.ocg/Click.wav')));
  const wav = parseWav(file)!;
  assert.ok(wav && wav.rate > 0 && (wav.channels === 1 || wav.channels === 2));
  const id = ALM.al$alutCreateBufferFromFileImage(new Ptr(file, 0), file.length);
  assert.ok(id > 0);
  const v = new Int32Array(4);
  ALM.al$alGetBufferi(id, AL.FREQUENCY, new Ptr(v, 0));
  ALM.al$alGetBufferi(id, AL.CHANNELS, new Ptr(v, 1));
  ALM.al$alGetBufferi(id, AL.BITS, new Ptr(v, 2));
  ALM.al$alGetBufferi(id, AL.SIZE, new Ptr(v, 3));
  assert.deepEqual([...v], [wav.rate, wav.channels, wav.bits, wav.data.length - (wav.data.length % (wav.channels * wav.bits / 8))]);
  // an Ogg file is no WAV: ALUT gives AL_NONE, as the original's loader chain expects
  const ogg = new Uint8Array(fs.readFileSync(path.join(planet, 'Sound.ocg/Hits.ocg/Materials.ocg/Glass.ocg/GlassHit1.ogg')));
  assert.equal(ALM.al$alutCreateBufferFromFileImage(new Ptr(ogg, 0), ogg.length), AL.NONE);
  alSetAudioContext(null);
});

test('vorbisfile on decoded samples: VorbisLoader::ReadInfo\'s calls, and the music\'s comments', { skip: noSource }, () => {
  const file = new Uint8Array(fs.readFileSync(path.join(planet, 'Sound.ocg/Hits.ocg/Materials.ocg/Glass.ocg/GlassHit1.ogg')));
  const info = vorbisInfo(file)!;
  assert.ok(info.channels >= 1 && info.rate >= 8000 && info.samples > 0, JSON.stringify(info));
  // the original's mem_read_func over CompressedData, as the translated code passes it (size_t as a number)
  const reader = (bytes: Uint8Array) => {
    let pos = 0;
    return {
      read_func: (ptr: Ptr, size: number, n: number, _ds: unknown): number => {
        const want = Math.min(size * n, bytes.length - pos);
        (ptr.a as Int8Array).set(new Int8Array(bytes.buffer, bytes.byteOffset + pos, want), ptr.o as number);
        pos += want;
        return want;
      },
    };
  };
  const vf: Record<string, unknown> = {};
  assert.equal(ALM.al$ov_open_callbacks(null, vf, null, 0, reader(file)), OV_ENOTVORBIS, 'not decoded yet: like a file that is no Ogg Vorbis');
  // samples as the browser's decoder would give them (a ramp), then the loader's sequence
  const pcm = new Int16Array(info.samples * info.channels).map((_, i) => (i % 2000) - 1000);
  setDecodedVorbis(file, pcm);
  assert.equal(ALM.al$ov_open_callbacks(null, vf, null, 0, reader(file)), 0);
  const vi = ALM.al$ov_info(vf, -1)!;
  assert.equal(vi.channels, info.channels);
  assert.equal(vi.rate, info.rate, "long rate: a number, as the translated code reads it (info->rate >>> 0)");
  const total = ALM.al$ov_time_total(vf, -1);
  assert.equal(total, info.samples / info.rate);
  // VorbisLoader::ReadInfo: total_size, then ov_read until 0
  const totalSize = Math.trunc(info.rate * (total / 1000) * 1000 * info.channels * 2 + 0.5);
  const out = new Int8Array(totalSize + 8192);
  let got = 0;
  for (;;) {
    const n = Number(ALM.al$ov_read(vf, new Ptr(out, got), out.length - got, 0, 2, 1, new Ptr(new Int32Array(1), 0)));
    if (n <= 0) break;
    got += n;
  }
  assert.equal(got, info.samples * info.channels * 2, 'every sample');
  assert.deepEqual([...new Int16Array(out.buffer, 0, 4)], [...pcm.subarray(0, 4)]);
  ALM.al$ov_clear(vf);
  // the music's categories (C4MusicFileOgg::Init reads COMMENT= from the comment header)
  const music = fs.readdirSync(path.join(planet, 'Music.ocg')).filter((f) => f.endsWith('.ogg'));
  const cats = music.map((f) => vorbisInfo(new Uint8Array(fs.readFileSync(path.join(planet, 'Music.ocg', f))))!.comments.find((c) => c.startsWith('COMMENT=')));
  assert.ok(cats.filter(Boolean).length >= 5, `music categories: ${cats.join(', ')}`);
});
