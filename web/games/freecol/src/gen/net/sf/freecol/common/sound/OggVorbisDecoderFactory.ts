// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/sound/OggVorbisDecoderFactory.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/**
 *  Copyright (C) 2002-2022   The FreeCol Team
 *
 *  This file is part of FreeCol.
 *
 *  FreeCol is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 2 of the License, or
 *  (at your option) any later version.
 *
 *  FreeCol is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with FreeCol.  If not, see <http://www.gnu.org/licenses/>.
 */
import { $J, AudioFormat, AudioInputStream, Block, Comment, DspState, Files, IOException, Info, InputStream, JObject, Packet, Page, StreamState, SyncState } from '../../../../../../jre/index.ts';

/**
 * Rewritten from the JCraft JOrbisPlayer example (GPLv2+), fixing a
 * bunch of bugs that prevent it from playing short files and recasting
 * into a read()-driven AudioInputStream form.
 *
 * FreeCol has a few short files.  We can notice when this fails.
 */
export class OggVorbisDecoderFactory extends JObject {
  /**
   * Trivial constructor.
   */
  _OggVorbisDecoderFactory(): this {
    return this;
  }
  /**
   * Gets a new audio input stream to decode Ogg/Vorbis Audio from
   * an input stream.
   *
   * @param file The {@code File} containing the content.
   * @return A new {@code AudioInputStream} to decode the input.
   * @exception IOException if unable to open the stream.
   */
  getOggStream(file: File): AudioInputStream {
    let fis = Files.newInputStream(file.toPath());
    return new OggVorbisDecoderFactory$OggVorbisAudioInputStream()._OggVorbisDecoderFactory$OggVorbisAudioInputStream(new OggVorbisDecoderFactory$OggStream()._OggVorbisDecoderFactory$OggStream(fis));
  }
}

/**
 * Core JOgg/JOrbis magic handled here.
 */
export class OggVorbisDecoderFactory$OggStream extends InputStream {
  static readonly EOS: string = 'End-of-stream';
  static readonly BUFSIZ: number = 4096;
  oggPacket: Packet = null;
  oggPage: Page = null;
  oggStreamState: StreamState = null;
  oggSyncState: SyncState = null;
  orbisDspState: DspState = null;
  orbisBlock: Block = null;
  orbisComment: Comment = null;
  orbisInfo: Info = null;
  audioFormat: AudioFormat = null;
  convBuf: number[] = null;
  bufCount: number = 0;
  offset: number = 0;
  pcmi: number[] = null;
  pcmData: number[][][] = null;
  inputStream: InputStream = null;
  _OggVorbisDecoderFactory$OggStream(inputStream: InputStream): this {
    this._InputStream();
    this.oggPacket = new Packet();
    this.oggPage = new Page();
    this.oggStreamState = new StreamState();
    this.oggSyncState = new SyncState();
    this.orbisDspState = new DspState();
    this.orbisBlock = new Block(this.orbisDspState);
    this.orbisComment = new Comment();
    this.orbisInfo = new Info();
    this.convBuf = $J.newArray(OggVorbisDecoderFactory$OggStream.BUFSIZ, 0);
    this.bufCount = 0;
    this.offset = 0;
    this.inputStream = null;
    this.inputStream = inputStream;
    let err = this.getHeader();
    if (err != null) {
      throw new IOException(err);
    }
    this.audioFormat = new AudioFormat(Math.fround(this.orbisInfo.rate), 16, this.orbisInfo.channels, true, false);
    this.bufCount = 0;
    this.offset = 0;
    return this;
  }
  close(): void {
    this.oggSyncState.clear();
    this.oggStreamState.clear();
    this.orbisBlock.clear();
    this.orbisDspState.clear();
  }
  getFormat(): AudioFormat {
    return this.audioFormat;
  }
  /**
   * Gets the amount of data available to be read right now.
   *
   * @return A number of bytes to read.
   */
  available(): number {
    return this.bufCount;
  }
  read$(): number {
    let b = $J.newArray(1, 0);
    return (this.read(b) > 0) ? b[0] : -1;
  }
  read$byteArr(buf: number[]): number {
    return this.read$byteArr$int(buf, buf.length);
  }
  /**
   * Reads into the supplied buffer.
   *
   * @param buf The buffer to read to.
   * @param n The number of bytes to read.
   * @return Negative on error, zero on end of stream, otherwise the
   *     number of bytes added to the buffer.
   * @throws IOException if JOrbis loses.
   */
  read$byteArr$int(buf: number[], n: number): number {
    let wr = 0;
    let wrOffset = 0;
    while (n > 0) {
      if (this.bufCount <= 0) {
        let ret = this.getBody(this.inputStream);
        if (ret < 0) {
          throw new IOException('Ogg decoding error: ' + $J.str(this));
        }
        if (ret === 0) {
          break;
        }
        this.bufCount = ret;
        this.offset = 0;
      }
      let rd = (this.bufCount < n) ? this.bufCount : n;
      $J.system_arraycopy(this.convBuf, this.offset, buf, wrOffset, rd);
      this.bufCount = (this.bufCount - rd) | 0;
      this.offset = (this.offset + rd) | 0;
      wr = (wr + rd) | 0;
      wrOffset = (wrOffset + rd) | 0;
      n = (n - rd) | 0;
    }
    return (wr <= 0) ? -1 : wr;
  }
  /**
   * Skips a number of bytes.
   *
   * @param n The number of bytes to skip.
   * @return The actual number of bytes skipped.
   */
  skip(n: number): number {
    let wr = 0;
    while (n > 0) {
      if (this.bufCount <= 0) {
        let ret = this.getBody(this.inputStream);
        if (ret < 0) {
          throw new IOException('Ogg decoding error: ' + $J.str(this));
        }
        if (ret === 0) {
          break;
        }
        this.bufCount = ret;
        this.offset = 0;
      }
      let rd = (this.bufCount < n) ? this.bufCount : (n) | 0;
      this.bufCount = (this.bufCount - rd) | 0;
      this.offset = (this.offset + rd) | 0;
      wr += rd;
      n -= rd;
    }
    return wr;
  }
  reset(): void {
  }
  /**
   * Gets the OGG header (first three packets) which must contain vorbis
   * audio content.
   * This routine is public so it can be used as a check if the a file
   * really does contain vorbis.
   *
   * @return An error message if a page not is available, null on success.
   */
  getHeader(): string {
    let input: string;
    let packet = 0;
    this.oggSyncState.init();
    while (packet < 1) {
      switch (this.oggSyncState.pageout(this.oggPage)) {
        case 1:
          this.oggStreamState.init(this.oggPage.serialno());
          this.oggStreamState.reset();
          this.orbisInfo.init();
          this.orbisComment.init();
          if (this.oggStreamState.pagein(this.oggPage) === -1) {
            return 'Error on header page';
          }
          if (this.oggStreamState.packetout(this.oggPacket) !== 1) {
            return 'Error on first packet';
          }
          if (this.orbisInfo.synthesis_headerin(this.orbisComment, this.oggPacket) < 0) {
            return 'Non-vorbis data found';
          }
          packet = 1;
          break;
        case 0:
          if ((input = this.getInput()) != null) {
            return input;
          }
          break;
        default:
          return 'Error reading first page';
      }
    }
    while (packet < 3) {
      switch (this.oggStreamState.packetout(this.oggPacket)) {
        case 1:
          this.orbisInfo.synthesis_headerin(this.orbisComment, this.oggPacket);
          packet++;
          break;
        case 0:
          if ((input = this.getPage()) != null) {
            return input;
          }
          break;
        default:
          return 'Error in header packet ' + packet;
      }
    }
    this.orbisDspState.synthesis_init(this.orbisInfo);
    this.orbisBlock.init(this.orbisDspState);
    return null;
  }
  /**
   * Gets another chunk of input into the oggSyncState.
   *
   * @return An error message if input is not available, null on success.
   */
  getInput(): string {
    let count = -1;
    try {
      let idx = this.oggSyncState.buffer(OggVorbisDecoderFactory$OggStream.BUFSIZ);
      count = this.inputStream.read(this.oggSyncState.data, idx, OggVorbisDecoderFactory$OggStream.BUFSIZ);
    } catch ($e0) {
      if ($J.isa($e0, IOException)) {
        let e = $J.exc($e0);
        return e.getMessage();
      } else {
        throw $e0;
      }
    }
    if (count > 0) {
      this.oggSyncState.wrote(count);
    }
    return (count > 0) ? null : OggVorbisDecoderFactory$OggStream.EOS;
  }
  /**
   * Gets the next page from the oggSyncState into the oggStreamState.
   *
   * @return An error message if a page not is available, null on success.
   */
  getPage(): string {
    let input: string;
    for (; ; ) {
      switch (this.oggSyncState.pageout(this.oggPage)) {
        case 0:
          if ((input = this.getInput()) != null) {
            return input;
          }
          break;
        case 1:
          this.oggStreamState.pagein(this.oggPage);
          return null;
        default:
          return 'Bogus page';
      }
    }
  }
  /**
   * Refills the conversion buffer.
   *
   * @param is The {@code InputStream} to read from.
   * @return The number of bytes waiting in the convBuf.
   */
  getBody(is$: InputStream): number {
    let err: string;
    let packet = 3;
    this.pcmi = $J.newArray(this.orbisInfo.channels, 0);
    this.pcmData = $J.newArray(1, null);
    for (; ; ) {
      switch (this.oggStreamState.packetout(this.oggPacket)) {
        case 1:
          if (this.orbisBlock.synthesis(this.oggPacket) === 0) {
            this.orbisDspState.synthesis_blockin(this.orbisBlock);
          }
          for (; ; ) {
            let n = this.orbisDspState.synthesis_pcmout(this.pcmData, this.pcmi);
            if (n <= 0) {
              break;
            }
            this.orbisDspState.synthesis_read(n);
            return Math.imul(Math.imul(2, this.orbisInfo.channels), this.decodePacket(n));
          }
          packet++;
          break;
        case 0:
          if ((err = this.getPage()) != null) {
            return ($J.equals(OggVorbisDecoderFactory$OggStream.EOS, err)) ? 0 : -1;
          }
          break;
        default:
          return -1;
      }
    }
  }
  /**
   * Decode the PCM data.
   *
   * @param samples The number of samples to decode.
   * @return The number of bytes waiting in the conversion buffer to
   *     be written.
   */
  decodePacket(samples: number): number {
    let range = (samples < this.convBuf.length) ? samples : this.convBuf.length;
    for (let i = 0; i < this.orbisInfo.channels; i++) {
      let sampleIndex = Math.imul(i, 2);
      for (let j = 0; j < range; j++) {
        let value = $J.d2i((Math.fround((this.pcmData[0][i][(this.pcmi[i] + j) | 0]) * 32767)));
        if (value > 32767) {
          value = 32767;
        } else if (value < -32768) {
          value = -32768;
        }
        this.convBuf[sampleIndex] = (((value)) << 24) >> 24;
        (this.convBuf[(sampleIndex + 1) | 0]) = (((value >>> 8)) << 24) >> 24;
        sampleIndex = (sampleIndex + Math.imul(2, (this.orbisInfo.channels))) | 0;
      }
    }
    return range;
  }
  read(...a: any[]): any {
    if (a.length === 0) return this.read$(...a);
    if (a.length === 1 && (a[0] == null || Array.isArray(a[0]) || ArrayBuffer.isView(a[0]))) return this.read$byteArr(...a);
    return super.read(...a);
  }
}

/**
 * The AudioInputStream extension to handle decoding Ogg/Vorbis Audio
 * input.
 */
export class OggVorbisDecoderFactory$OggVorbisAudioInputStream extends AudioInputStream {
  os: OggVorbisDecoderFactory$OggStream = null;
  /**
   * Create a new player.
   *
   * @param os The {@code OggStream} to read from.
   * @exception IOException if unable to open the stream.
   */
  _OggVorbisDecoderFactory$OggVorbisAudioInputStream(os: OggVorbisDecoderFactory$OggStream): this {
    this._AudioInputStream(os, os.getFormat(), -1);
    this.os = null;
    this.os = os;
    return this;
  }
  getFormat(): AudioFormat {
    return this.os.getFormat();
  }
  available(): number {
    return this.os.available();
  }
  read$(): number {
    return this.os.read();
  }
  read$byteArr(buf: number[]): number {
    return this.os.read(buf);
  }
  read$byteArr$int(buf: number[], n: number): number {
    return this.os.read$byteArr$int(buf, n);
  }
  close(): void {
    this.os.close();
  }
  skip(n: number): number {
    return this.os.skip(n);
  }
  mark(readLimit: number): void {
    this.os.mark(readLimit);
  }
  markSupported(): boolean {
    return this.os.markSupported();
  }
  reset(): void {
    this.os.reset();
  }
  read(...a: any[]): any {
    if (a.length === 0) return this.read$(...a);
    if (a.length === 1 && (a[0] == null || Array.isArray(a[0]) || ArrayBuffer.isView(a[0]))) return this.read$byteArr(...a);
    return super.read(...a);
  }
}

$J.define(OggVorbisDecoderFactory, 'net.sf.freecol.common.sound.OggVorbisDecoderFactory', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_OggVorbisDecoderFactory' } });
$J.define(OggVorbisDecoderFactory$OggStream, 'net.sf.freecol.common.sound.OggVorbisDecoderFactory$OggStream', { kind: 'class', sup: 'java.io.InputStream', ctors: { 'java.io.InputStream': '_OggVorbisDecoderFactory$OggStream' }, returns: { 'getPage': 'java.lang.String', 'getInput': 'java.lang.String', 'getHeader': 'java.lang.String', 'getFormat': 'javax.sound.sampled.AudioFormat' }, meths: { 'read(byte[],int)': 'read$byteArr$int', 'read(byte[])': 'read$byteArr', 'read()': 'read$' } });
$J.define(OggVorbisDecoderFactory$OggVorbisAudioInputStream, 'net.sf.freecol.common.sound.OggVorbisDecoderFactory$OggVorbisAudioInputStream', { kind: 'class', sup: 'javax.sound.sampled.AudioInputStream', ctors: { 'net.sf.freecol.common.sound.OggVorbisDecoderFactory$OggStream': '_OggVorbisDecoderFactory$OggVorbisAudioInputStream' }, returns: { 'getFormat': 'javax.sound.sampled.AudioFormat' }, meths: { 'read(byte[],int)': 'read$byteArr$int', 'read(byte[])': 'read$byteArr', 'read()': 'read$' } });
