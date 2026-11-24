// @ts-nocheck
// OpenClonk 36de799: src/platform/C4SoundLoaders.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { al$alGetBufferi, al$alutCreateBufferFromFileImage, al$ov_clear, al$ov_info, al$ov_open_callbacks, al$ov_read, al$ov_time_total } from '../../rt/al.ts';
import { $i64n, $u64n, ftou32 } from '../../rt/int.ts';
import { c$memcpy, c$memset } from '../../rt/libc.ts';
import { $padd, $view8, P } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete, $min, resize } from '../../rt/std.ts';

export class SoundInfo {
  sample_length = 0;
  sample_rate = 0;
  sound_data = [];
  format = 0;
  final_handle = 0;

  init() {
    this.sound_data = [];
    this.final_handle = 0;
    return this;
  }

  $clone() { return new SoundInfo().$assign(this); }
  $assign(o) {
    this.sample_length = o.sample_length;
    this.sample_rate = o.sample_rate;
    this.sound_data = o.sound_data.slice();
    this.format = o.format;
    this.final_handle = o.final_handle;
    return this;
  }
}

export class SoundLoader {
  static OPTION_Raw;
  static first_loader;
  next = null;

  init() {
    this.next = SoundLoader.first_loader;
    SoundLoader.first_loader = this;
    return this;
  }

  $clone() { return new SoundLoader().$assign(this); }
  $assign(o) {
    this.next = o.next;
    return this;
  }
}

export class VorbisLoader$CompressedData {
  data = null;
  data_length = 0;
  data_pos = 0;
  is_data_owned = false;

  init$pu8$u64(data, data_length) {
    this.data = data;
    this.data_length = data_length;
    this.data_pos = 0;
    this.is_data_owned = false;
    return this;
  }

  SetOwnedData(data, data_length) {
    this.clear();
    this.data = data;
    this.data_length = data_length;
    this.data_pos = 0;
    this.is_data_owned = true;
  }

  $dtor() {
    VorbisLoader$CompressedData.prototype.clear.call(this);
  }

  clear() {
    if (this.is_data_owned) {
      $delete(this.data);
    }
    this.data = null;
  }

  $clone() { return new VorbisLoader$CompressedData().$assign(this); }
  $assign(o) {
    this.data = o.data;
    this.data_length = o.data_length;
    this.data_pos = o.data_pos;
    this.is_data_owned = o.is_data_owned;
    return this;
  }
}

export class VorbisLoader extends SoundLoader {
  static singleton;

  static mem_read_func(ptr, byte_size, size_to_read, datasource) {
    let spaceToEOF = 0;
    let actualSizeToRead = 0;
    let data = datasource;
    spaceToEOF = data.data_length - data.data_pos;
    if (size_to_read * byte_size < spaceToEOF) {
      actualSizeToRead = size_to_read * byte_size;
    } else {
      actualSizeToRead = spaceToEOF;
    }
    if (actualSizeToRead !== 0) {
      c$memcpy(ptr, $padd($view8(data.data, true), data.data_pos), actualSizeToRead);
      data.data_pos = data.data_pos + actualSizeToRead;
    }
    return actualSizeToRead;
  }

  static mem_seek_func(datasource, offset, whence) {
    let data = datasource;
    switch (whence) {
      case 0:
        data.data_pos = $u64n(offset) < data.data_length ? $u64n(offset) : data.data_length;
        break;
      case 1:
        data.data_pos = data.data_pos + ($u64n(offset) < data.data_length - data.data_pos ? $u64n(offset) : data.data_length - data.data_pos);
        break;
      case 2:
        data.data_pos = data.data_length + 1;
        break;
    }
    return 0;
  }

  static mem_close_func(_datasource) {
    return 1;
  }

  static mem_tell_func(datasource) {
    return $i64n(datasource.data_pos);
  }

  static file_read_func(ptr, byte_size, size_to_read, datasource) {
    let ogg = datasource;
    let bytes_to_read = size_to_read * byte_size;
    const bytes_read = [0];
    ogg.source_file.Read$px$u64$pu64(ptr, bytes_to_read, P(bytes_read, 0));
    return Math.trunc(bytes_read[0] / byte_size);
  }

  static file_seek_func(datasource, offset, whence) {
    let ogg = datasource;
    return ogg.source_file.Seek(offset, whence);
  }

  static file_close_func(datasource) {
    let ogg = datasource;
    ogg.source_file.Close$ppStdBuf();
    return 1;
  }

  static file_tell_func(datasource) {
    let ogg = datasource;
    return ogg.source_file.Tell();
  }

  ReadInfo(result, data, data_length, _3 = 0) {
    let compressed = new VorbisLoader$CompressedData().init$pu8$u64(data, data_length);
    let endian = 0;
    let info = null;
    let ogg_file = {};
    c$memset(ogg_file, 0, 0);
    let callbacks = {};
    callbacks.read_func = VorbisLoader.mem_read_func;
    callbacks.seek_func = VorbisLoader.mem_seek_func;
    callbacks.close_func = VorbisLoader.mem_close_func;
    callbacks.tell_func = VorbisLoader.mem_tell_func;
    if (al$ov_open_callbacks(compressed, ogg_file, null, 0, ({ ...callbacks })) !== 0) {
      al$ov_clear(ogg_file);
      return false;
    }
    info = al$ov_info(ogg_file, -1);
    if (info.channels === 1) {
      result.format = 4353;
    } else {
      result.format = 4355;
    }
    result.sample_rate = info.rate >>> 0;
    result.sample_length = al$ov_time_total(ogg_file, -1) / 1000;
    let total_size = ftou32(result.sample_rate * result.sample_length * 1000 * info.channels * 2 + 0.5);
    let extra_size = 8192;
    let buffer_size = 0;
    let bytes_read = 0;
    do {
      let chunk_size = total_size + 8192 - $min(total_size, buffer_size) | 0;
      const bitStream = [0];
      if (buffer_size + $u64n(chunk_size) > result.sound_data.length) {
        resize(result.sound_data, buffer_size + $u64n(chunk_size), () => 0);
      }
      bytes_read = al$ov_read(ogg_file, P(result.sound_data, buffer_size), $u64n(chunk_size) * 1 | 0, endian, 2, 1, P(bitStream, 0));
      buffer_size = buffer_size + $u64n(bytes_read);
    } while (bytes_read > 0);
    resize(result.sound_data, buffer_size, () => 0);
    al$ov_clear(ogg_file);
    return true;
  }

  None() {
    super.init();
    return this;
  }

  $clone() { return new VorbisLoader().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class WavLoader extends SoundLoader {
  static singleton;

  ReadInfo(result, data, data_length, _3 = 0) {
    $.Application.MusicSystem.SelectContext();
    let wav = al$alutCreateBufferFromFileImage(data, data_length | 0);
    if (wav === 0) {
      return false;
    }
    const freq = [0];
    const chans = [0];
    const bits = [0];
    const size = [0];
    al$alGetBufferi(wav, 8193, P(freq, 0));
    result.sample_rate = freq[0] >>> 0;
    al$alGetBufferi(wav, 8195, P(chans, 0));
    al$alGetBufferi(wav, 8194, P(bits, 0));
    al$alGetBufferi(wav, 8196, P(size, 0));
    if (chans[0] === 1) {
      if (bits[0] === 8) {
        result.format = 4352;
      } else {
        result.format = 4353;
      }
    } else if (bits[0] === 8) {
      result.format = 4354;
    } else {
      result.format = 4355;
    }
    result.sample_length = size[0] / (Math.imul(Math.imul(bits[0], chans[0]), freq[0]) / 8 | 0);
    result.final_handle = wav;
    return true;
  }

  None() {
    super.init();
    return this;
  }

  $clone() { return new WavLoader().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export function $init(): void {
  SoundLoader.OPTION_Raw = 1;
  SoundLoader.first_loader = null;
  VorbisLoader.singleton = new VorbisLoader().None();
  WavLoader.singleton = new WavLoader().None();
}

Object.assign($, { SoundInfo, SoundLoader, VorbisLoader, VorbisLoader$CompressedData, WavLoader });
