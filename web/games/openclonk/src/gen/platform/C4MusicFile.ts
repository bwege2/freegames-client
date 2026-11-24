// @ts-nocheck
// OpenClonk 36de799: src/platform/C4MusicFile.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { al$alBufferData, al$alDeleteBuffers, al$alDeleteSources, al$alGenBuffers, al$alGenSources, al$alGetBufferi, al$alGetError, al$alGetSourcef, al$alGetSourcei, al$alSourcePlay, al$alSourceQueueBuffers, al$alSourceStop, al$alSourceUnqueueBuffers, al$alSourcef, al$alSourcei, al$ov_clear, al$ov_comment, al$ov_info, al$ov_open_callbacks, al$ov_raw_seek, al$ov_read, al$ov_time_seek, al$ov_time_total } from '../../rt/al.ts';
import { $u64n, ftoi32 } from '../../rt/int.ts';
import { c$memset, c$strlen } from '../../rt/libc.ts';
import { $padd, $view8, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $vpush, resize } from '../../rt/std.ts';

export class C4MusicFile {
  FileName = new Int8Array(256);
  pNext = null;
  LastPlayed = -1;
  NoPlay = false;
  loop = false;
  announced = false;
  SongExtracted = false;

  Init(szFile) {
    $.SCopy$pi8$pi8(szFile, P(this.FileName, 0));
    return true;
  }

  HasCategory(_szcat) {
    return false;
  }

  GetRemainingTime() {
    return 0;
  }

  HasResumePos() {
    return false;
  }

  ClearResumePos() {
  }

  GetLastInterruptionTime() {
    return new $.C4TimeMilliseconds();
  }

  GetDebugInfo() {
    return new $.StdStrBuf().init$pi8$b(P(this.FileName, 0));
  }

  IsLooping() {
    return this.loop;
  }

  HasBeenAnnounced() {
    return this.announced;
  }

  Announce() {
    $.LogF($.LoadResStr(S("IDS_PRC_PLAYMUSIC")), $.GetFilename$2(P(this.FileName, 0)));
    this.announced = true;
  }

  ExtractFile() {
    if (this.SongExtracted) {
      return true;
    }
    if (!$.C4Group_CopyItem(P(this.FileName, 0), $.Config.AtTempPath(S("~Music2.tmp")))) {
      return false;
    }
    this.SongExtracted = true;
    return true;
  }

  RemTempFile() {
    if (!this.SongExtracted) {
      return true;
    }
    $.EraseFile($.Config.AtTempPath(S("~Music2.tmp")));
    this.SongExtracted = false;
    return true;
  }

  $clone() { return new C4MusicFile().$assign(this); }
  $assign(o) {
    this.FileName = o.FileName.slice();
    this.pNext = o.pNext;
    this.LastPlayed = o.LastPlayed;
    this.NoPlay = o.NoPlay;
    this.loop = o.loop;
    this.announced = o.announced;
    this.SongExtracted = o.SongExtracted;
    return this;
  }
}

export class C4MusicFileOgg extends C4MusicFile {
  data = new $.VorbisLoader$CompressedData();
  ogg_info = new $.SoundInfo().init();
  ogg_file = {};
  is_loading_from_file = false;
  source_file = new $.CStdFile().init();
  last_source_file_pos = 0;
  playing = false;
  streaming_done = false;
  loaded = false;
  buffers = new Uint32Array(4);
  channel = 0;
  last_playback_pos_sec = 0;
  last_interruption_time = new $.C4TimeMilliseconds();
  current_section = 0;
  byte_pos_total = 0;
  volume = 1;
  categories = [];

  init() {
    this.data = new $.VorbisLoader$CompressedData();
    this.ogg_info = new $.SoundInfo().init();
    this.ogg_file = {};
    this.is_loading_from_file = false;
    this.source_file = new $.CStdFile().init();
    this.last_source_file_pos = 0;
    this.playing = false;
    this.streaming_done = false;
    this.loaded = false;
    this.channel = 0;
    this.last_playback_pos_sec = 0;
    this.last_interruption_time = new $.C4TimeMilliseconds();
    this.current_section = 0;
    this.byte_pos_total = 0;
    this.volume = 1;
    this.categories = [];
    let $t1;
    $t1 = this.buffers;
    for (let $i1 = 0; $i1 < $t1.length; $i1++) {
      const buffer = P($t1, $i1);
      buffer.a[buffer.o] = 0;
    }
    return this;
  }

  $dtor() {
    C4MusicFileOgg.prototype.Clear.call(this);
    C4MusicFileOgg.prototype.Stop.call(this);
  }

  Clear() {
    if (this.loaded) {
      al$ov_clear(this.ogg_file);
      this.loaded = false;
    }
    this.categories.length = 0;
    this.is_loading_from_file = false;
    this.source_file.Close$ppStdBuf();
    this.last_source_file_pos = 0;
    this.last_playback_pos_sec = 0;
    this.last_interruption_time.$assign(new $.C4TimeMilliseconds());
  }

  Init(strFile) {
    this.Clear();
    if (!C4MusicFile.prototype.Init.call(this, strFile)) {
      return false;
    }
    let info = null;
    c$memset(this.ogg_file, 0, 0);
    let callbacks = {};
    let is_loading_from_file = $.FileExists(strFile);
    let data_source = null;
    if (!is_loading_from_file) {
      const file_contents = [null];
      const file_size = [0];
      if (!$.C4Group_ReadFile(P(this.FileName, 0), P(file_contents, 0), P(file_size, 0))) {
        return false;
      }
      this.data.SetOwnedData($view8(file_contents[0], false), file_size[0]);
      callbacks.read_func = $.VorbisLoader.mem_read_func;
      callbacks.seek_func = $.VorbisLoader.mem_seek_func;
      callbacks.close_func = $.VorbisLoader.mem_close_func;
      callbacks.tell_func = $.VorbisLoader.mem_tell_func;
      data_source = this.data;
    } else {
      if (!this.source_file.Open(P(this.FileName, 0))) {
        return false;
      }
      callbacks.read_func = $.VorbisLoader.file_read_func;
      callbacks.seek_func = $.VorbisLoader.file_seek_func;
      callbacks.close_func = $.VorbisLoader.file_close_func;
      callbacks.tell_func = $.VorbisLoader.file_tell_func;
      data_source = this;
    }
    if (al$ov_open_callbacks(data_source, this.ogg_file, null, 0, ({ ...callbacks })) !== 0) {
      al$ov_clear(this.ogg_file);
      return false;
    }
    info = al$ov_info(this.ogg_file, -1);
    if (info.channels === 1) {
      this.ogg_info.format = 4353;
    } else {
      this.ogg_info.format = 4355;
    }
    this.ogg_info.sample_rate = info.rate >>> 0;
    this.ogg_info.sample_length = al$ov_time_total(this.ogg_file, -1) / 1000;
    let comment = al$ov_comment(this.ogg_file, -1);
    let comment_id = S("COMMENT=");
    let comment_id_len = c$strlen(comment_id) | 0;
    for (let i = 0; i < comment.comments; i = i + 1 | 0) {
      if (comment.comment_lengths.a[comment.comment_lengths.o + i] > comment_id_len) {
        if ($.SEqual2NoCase(comment.user_comments.a[comment.user_comments.o + i], comment_id, comment_id_len)) {
          let categories_string = $padd(comment.user_comments.a[comment.user_comments.o + i], comment_id_len);
          for (; ; ) {
            let delimeter = $.SCharPos(59, categories_string);
            let category = new $.StdCopyStrBuf();
            category.Copy$pi8$u64(categories_string, delimeter >= 0 ? $u64n(delimeter) : $.SLen(categories_string));
            $vpush(this.categories, category.$clone());
            if (delimeter < 0) {
              break;
            }
            categories_string = categories_string.add(delimeter + 1 | 0);
          }
        }
      }
    }
    this.UnprepareSourceFileReading();
    return this.loaded = true;
  }

  Play(loop = false, max_resume_time = 0) {
    if (!this.loaded) {
      return false;
    }
    if (this.playing) {
      if (max_resume_time > 0) {
        return true;
      }
      this.Stop();
    }
    this.PrepareSourceFileReading();
    al$alGenSources(1, P(this, "channel"));
    if (this.channel === 0) {
      return false;
    }
    this.playing = true;
    this.streaming_done = false;
    this.loop = loop;
    this.byte_pos_total = 0;
    if (max_resume_time > 0) {
      let time_remaining_sec = this.GetRemainingTime();
      if (time_remaining_sec < max_resume_time) {
        this.last_playback_pos_sec = 0;
      }
    } else {
      this.last_playback_pos_sec = 0;
    }
    this.SetVolume(ftoi32(Math.fround(Math.fround($.Config.Sound.MusicVolume) / 100)));
    resize(this.ogg_info.sound_data, 655360, () => 0);
    al$alGenBuffers(4, P(this.buffers, 0));
    al$ov_time_seek(this.ogg_file, this.last_playback_pos_sec);
    for (let i = 0; i < 4; i = i + 1) {
      if (!this.FillBuffer(i)) {
        break;
      }
    }
    do {
      al$alSourcePlay(this.channel);
      {
        let err = al$alGetError();
        if (err !== 0) {
          $.LogF(S("al error: %s (%x)"), S("alSourcePlay(channel)"), err);
        }
      }
    } while (false);
    return true;
  }

  Stop(_fadeout_ms = 0) {
    if (this.playing) {
      const playback_pos_in_buffer = [Math.fround(0)];
      do {
        al$alGetSourcef(this.channel, 4132, P(playback_pos_in_buffer, 0));
        {
          let err = al$alGetError();
          if (err !== 0) {
            $.LogF(S("al error: %s (%x)"), S("alGetSourcef(channel, AL_SEC_OFFSET, &playback_pos_in_buffer)"), err);
          }
        }
      } while (false);
      this.last_playback_pos_sec += playback_pos_in_buffer[0];
      this.last_interruption_time.$assign($.C4TimeMilliseconds.Now());
      al$alSourceStop(this.channel);
      const num_queued = [0];
      do {
        al$alGetSourcei(this.channel, 4117, P(num_queued, 0));
        {
          let err = al$alGetError();
          if (err !== 0) {
            $.LogF(S("al error: %s (%x)"), S("alGetSourcei(channel, AL_BUFFERS_QUEUED, &num_queued)"), err);
          }
        }
      } while (false);
      const buffer = [0];
      for (let i = 0; i < $u64n(num_queued[0]); i = i + 1) {
        do {
          al$alSourceUnqueueBuffers(this.channel, 1, P(buffer, 0));
          {
            let err = al$alGetError();
            if (err !== 0) {
              $.LogF(S("al error: %s (%x)"), S("alSourceUnqueueBuffers(channel, 1, &buffer)"), err);
            }
          }
        } while (false);
      }
    }
    if (this.channel !== 0) {
      al$alSourcei(this.channel, 4105, 0);
      al$alDeleteBuffers(4, P(this.buffers, 0));
      al$alDeleteSources(1, P(this, "channel"));
    }
    this.playing = false;
    this.channel = 0;
    this.UnprepareSourceFileReading();
  }

  CheckIfPlaying() {
    this.Execute();
    if (!this.playing) {
      $.Application.MusicSystem.NotifySuccess();
    }
  }

  SetVolume(iLevel) {
    this.volume = Math.fround(Math.fround(iLevel) / 100);
    if (this.channel !== 0) {
      al$alSourcef(this.channel, 4106, this.volume);
    }
  }

  HasCategory(szcat) {
    if (szcat == null) {
      return false;
    }
    for (const category of this.categories) {
      if ($.WildcardMatch(szcat, category.getData())) {
        return true;
      }
    }
    return false;
  }

  GetRemainingTime() {
    return al$ov_time_total(this.ogg_file, -1) - this.last_playback_pos_sec;
  }

  HasResumePos() {
    return this.last_playback_pos_sec > 0;
  }

  ClearResumePos() {
    this.last_playback_pos_sec = 0;
    this.last_interruption_time.$assign(new $.C4TimeMilliseconds());
  }

  GetLastInterruptionTime() {
    return this.last_interruption_time.$clone();
  }

  GetDebugInfo() {
    let result = new $.StdStrBuf();
    result.Append$pi8(P(this.FileName, 0));
    result.AppendFormat(S("[%.0lf]"), this.last_playback_pos_sec);
    result.AppendChar(91);
    let sec = false;
    for (const category of this.categories) {
      if (sec) {
        result.AppendChar(44);
      }
      result.Append$pi8(category.getData());
      sec = true;
    }
    result.AppendChar(93);
    return result;
  }

  FillBuffer(idx) {
    let endian = 0;
    let bytes_read_total = 0;
    let bytes_read = 0;
    const uncompressed_data = new Int8Array(163840);
    do {
      bytes_read = al$ov_read(this.ogg_file, $padd(P(uncompressed_data, 0), bytes_read_total), $u64n(163840 - bytes_read_total) * 1 | 0, endian, 2, 1, P(this, "current_section"));
      bytes_read_total = bytes_read_total + bytes_read;
    } while (bytes_read > 0 && bytes_read_total < 163840);
    if (bytes_read_total !== 0) {
      this.byte_pos_total = this.byte_pos_total + $u64n(bytes_read_total);
      const buffer = [this.buffers[idx]];
      do {
        al$alBufferData(buffer[0], this.ogg_info.format, P(uncompressed_data, 0), bytes_read_total | 0, this.ogg_info.sample_rate | 0);
        {
          let err = al$alGetError();
          if (err !== 0) {
            $.LogF(S("al error: %s (%x)"), S("alBufferData(buffer, ogg_info.format, uncompressed_data, bytes_read_total, ogg_info.sample_rate)"), err);
          }
        }
      } while (false);
      do {
        al$alSourceQueueBuffers(this.channel, 1, P(buffer, 0));
        {
          let err = al$alGetError();
          if (err !== 0) {
            $.LogF(S("al error: %s (%x)"), S("alSourceQueueBuffers(channel, 1, &buffer)"), err);
          }
        }
      } while (false);
    }
    if (bytes_read_total < 163840) {
      if (this.loop) {
        al$ov_raw_seek(this.ogg_file, 0);
        let prev_bytes_total = this.byte_pos_total;
        this.byte_pos_total = 0;
        if (bytes_read_total === 0 && prev_bytes_total !== 0) {
          return this.FillBuffer(idx);
        }
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  }

  Execute() {
    let $t1;
    if (this.playing) {
      const num_processed = [0];
      do {
        al$alGetSourcei(this.channel, 4118, P(num_processed, 0));
        {
          let err = al$alGetError();
          if (err !== 0) {
            $.LogF(S("al error: %s (%x)"), S("alGetSourcei(channel, AL_BUFFERS_PROCESSED, &num_processed)"), err);
          }
        }
      } while (false);
      let done = false;
      while (($t1 = num_processed[0], num_processed[0] = num_processed[0] - 1 | 0, $t1) !== 0) {
        const buffer = [0];
        do {
          al$alSourceUnqueueBuffers(this.channel, 1, P(buffer, 0));
          {
            let err = al$alGetError();
            if (err !== 0) {
              $.LogF(S("al error: %s (%x)"), S("alSourceUnqueueBuffers(channel, 1, &buffer)"), err);
            }
          }
        } while (false);
        const buf_bits = [16];
        const buf_chans = [2];
        const buf_freq = [44100];
        do {
          al$alGetBufferi(buffer[0], 8194, P(buf_bits, 0));
          {
            let err = al$alGetError();
            if (err !== 0) {
              $.LogF(S("al error: %s (%x)"), S("alGetBufferi(buffer, AL_BITS, &buf_bits)"), err);
            }
          }
        } while (false);
        do {
          al$alGetBufferi(buffer[0], 8195, P(buf_chans, 0));
          {
            let err = al$alGetError();
            if (err !== 0) {
              $.LogF(S("al error: %s (%x)"), S("alGetBufferi(buffer, AL_CHANNELS, &buf_chans)"), err);
            }
          }
        } while (false);
        do {
          al$alGetBufferi(buffer[0], 8193, P(buf_freq, 0));
          {
            let err = al$alGetError();
            if (err !== 0) {
              $.LogF(S("al error: %s (%x)"), S("alGetBufferi(buffer, AL_FREQUENCY, &buf_freq)"), err);
            }
          }
        } while (false);
        let buffer_secs = 163840 /*buffer_size*/ / buf_bits[0] / buf_chans[0] / buf_freq[0] * 8;
        this.last_playback_pos_sec += buffer_secs;
        let buffer_idx = 0;
        for (buffer_idx = 0; buffer_idx < 4; buffer_idx = buffer_idx + 1) {
          if (this.buffers[buffer_idx] === buffer[0]) {
            break;
          }
        }
        if (!done) {
          done = !this.FillBuffer(buffer_idx);
        }
      }
      if (done) {
        this.streaming_done = true;
      }
      const state = [0];
      do {
        al$alGetSourcei(this.channel, 4112, P(state, 0));
        {
          let err = al$alGetError();
          if (err !== 0) {
            $.LogF(S("al error: %s (%x)"), S("alGetSourcei(channel, AL_SOURCE_STATE, &state)"), err);
          }
        }
      } while (false);
      if (state[0] !== 4114 && this.streaming_done) {
        this.Stop();
        this.last_playback_pos_sec = 0;
      } else if (state[0] === 4116) {
        do {
          al$alSourcePlay(this.channel);
          {
            let err = al$alGetError();
            if (err !== 0) {
              $.LogF(S("al error: %s (%x)"), S("alSourcePlay(channel)"), err);
            }
          }
        } while (false);
      }
    }
  }

  UnprepareSourceFileReading() {
    if (this.is_loading_from_file && this.source_file.IsOpen()) {
      this.last_source_file_pos = this.source_file.Tell();
      this.source_file.Close$ppStdBuf();
    }
  }

  PrepareSourceFileReading() {
    if (!this.is_loading_from_file) {
      return true;
    }
    if (!this.source_file.IsOpen()) {
      if (!this.source_file.Open(P(this.FileName, 0))) {
        return false;
      }
      if (this.last_source_file_pos !== 0) {
        if (this.source_file.Seek(this.last_source_file_pos, 0) < 0) {
          return false;
        }
      }
    }
    return true;
  }

  $clone() { return new C4MusicFileOgg().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.data.$assign(o.data);
    this.ogg_info.$assign(o.ogg_info);
    this.ogg_file = ({ ...o.ogg_file });
    this.is_loading_from_file = o.is_loading_from_file;
    this.source_file.$assign(o.source_file);
    this.last_source_file_pos = o.last_source_file_pos;
    this.playing = o.playing;
    this.streaming_done = o.streaming_done;
    this.loaded = o.loaded;
    this.buffers = o.buffers.slice();
    this.channel = o.channel;
    this.last_playback_pos_sec = o.last_playback_pos_sec;
    this.last_interruption_time.$assign(o.last_interruption_time);
    this.current_section = o.current_section;
    this.byte_pos_total = o.byte_pos_total;
    this.volume = o.volume;
    this.categories = o.categories.slice();
    return this;
  }
}

export function $init(): void {
}

Object.assign($, { C4MusicFile, C4MusicFileOgg });
