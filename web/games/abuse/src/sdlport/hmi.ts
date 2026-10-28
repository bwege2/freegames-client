// sdlport/hmi.ts: translated statement by statement from sdlport/hmi.cpp of Abuse-SDL 0.8
// (re/abuse/orig/abuse-0.8/src/sdlport/hmi.cpp).
//
//  Abuse - dark 2D side-scrolling platform game
//  Copyright (c) 2001 Anthony Kruize, (c) 2005-2011 Sam Hocevar, (c) 2011 Jochen Schleu <jjs@jjs.at>
//
//  hmi.cpp itself is released by Jochen Schleu under the WTFPL, Version 2; as part of Abuse-SDL and
//  of this port, this translation is distributed under the GNU General Public License, version 2 or
//  (at your option) any later version. SPDX-License-Identifier: GPL-2.0-or-later
//
// Load Abuse HMI files and convert them to standard Midi format
//
// HMI files differ from Midi files in the following ways:
// - there is a header giving offsets to the tracks and various other
//   information (unknown)
// - note-on events include the duration of the note instead of dedicated
//   note-off events
// - additional 0xFE event with variable length, purpose unknown
//
// This converter does the bare minimum to get Abuse HMI files to convert.
// The bpm and header information is fixed and not read from the file (except
// the number of tracks). HMI files make use of running status notation, the
// converted files don't.
//
// Differences forced by the language (none change the output of a well-formed file):
// - the input is the file's bytes instead of a filename; the output grows as needed instead of a
//   malloc(buffersize * 10);
// - C reads past the end of the buffer (undefined behaviour) on truncated files; here such reads give
//   0, and a track also ends when its read pointer leaves the file (C would crash or read garbage);
// - qsort is not stable, so the order of note-off events with equal times is unspecified in C; here a
//   stable sort is used (as glibc's merge-sort qsort did). Free slots (time 0xFFFFFFFF) always sort to
//   the end either way, and equal times only swap note-offs that happen at the same tick.

const MAX_NOTE_OFF_EVENTS = 30;

interface NoteOffEvent {
  time: number; // uint32_t
  command: number; // uint8_t
  note: number; // uint8_t
}

const note_off_events: NoteOffEvent[] = [];
for (let i = 0; i < MAX_NOTE_OFF_EVENTS; i++) note_off_events.push({ time: 0xffffffff, command: 0xff, note: 0xff });

/** a byte pointer into a buffer (uint8_t*); reads past the end give 0 */
class Ptr {
  constructor(buf: Uint8Array, pos: number) {
    this.buf = buf;
    this.pos = pos;
  }
  buf: Uint8Array;
  pos: number;
  at(i: number): number {
    const p = this.pos + i;
    return p >= 0 && p < this.buf.length ? this.buf[p]! : 0;
  }
  next(): number {
    const v = this.at(0);
    this.pos++;
    return v;
  }
}

/** the growable output buffer (uint8_t* &output) */
class Out {
  buf = new Uint8Array(4096);
  pos = 0;
  put(v: number): void {
    if (this.pos >= this.buf.length) {
      const n = new Uint8Array(this.buf.length * 2);
      n.set(this.buf);
      this.buf = n;
    }
    this.buf[this.pos++] = v & 0xff;
  }
  set(at: number, v: number): void {
    this.buf[at] = v & 0xff;
  }
}

function get_int_from_buffer(buffer: Ptr): number {
  return ((buffer.at(3) << 24) + (buffer.at(2) << 16) + (buffer.at(1) << 8) + buffer.at(0)) >>> 0;
}

function write_big_endian_number(le: number, buffer: Out, at: number): void {
  buffer.set(at + 3, le & 0x000000ff);
  buffer.set(at + 2, (le & 0x0000ff00) >>> 8);
  buffer.set(at + 1, (le & 0x00ff0000) >>> 16);
  buffer.set(at + 0, (le & 0xff000000) >>> 24);
}

function compare_times(ea: NoteOffEvent, eb: NoteOffEvent): number {
  return ea.time < eb.time ? -1 : ea.time === eb.time ? 0 : 1;
}

/** qsort(note_off_events, MAX_NOTE_OFF_EVENTS, sizeof(NoteOffEvent), compare_times) */
function sort_note_off_events(): void {
  note_off_events.sort(compare_times); // Array.prototype.sort is stable (ES2019)
}

// Variable length number code
// from: http://www.chriswareham.demon.co.uk/midifiles/variable_length.html
function read_time_value(buffer: Ptr): number {
  let value: number;
  let c: number;

  if ((value = buffer.next()) & 0x80) {
    value &= 0x7f;
    do {
      value = ((value << 7) + ((c = buffer.next()) & 0x7f)) >>> 0;
    } while (c & 0x80);
  }

  return value;
}

function write_time_value(time: number, buffer: Out): void {
  time >>>= 0;
  let value_buffer = time & 0x7f;

  while ((time >>>= 7)) {
    value_buffer = (value_buffer << 8) >>> 0;
    value_buffer = (value_buffer | ((time & 0x7f) | 0x80)) >>> 0;
  }

  while (true) {
    buffer.put(value_buffer);
    if (value_buffer & 0x80) value_buffer >>>= 8;
    else break;
  }
}

function remember_note_off_event(time: number, cmd: number, note: number): void {
  for (let i = 0; i < MAX_NOTE_OFF_EVENTS; i++) {
    const e = note_off_events[i]!;
    if (e.time === 0xffffffff) {
      e.time = time >>> 0;
      e.command = cmd & 0xff;
      e.note = note & 0xff;
      break;
    }
  }

  // Sort the note off array by the time
  sort_note_off_events();
}

interface Times {
  current_time: number;
  last_time: number;
}

function check_for_note_off_events(t: Times, buffer: Out): void {
  for (let i = 0; i < MAX_NOTE_OFF_EVENTS; i++) {
    const e = note_off_events[i]!;
    if (e.time === 0xffffffff) break;

    if (e.time < t.current_time) {
      // Add event
      write_time_value((e.time - t.last_time) >>> 0, buffer);
      t.last_time = e.time;

      buffer.put(e.command);
      buffer.put(e.note);
      buffer.put(0x00);

      // Remove event from queue
      e.time = 0xffffffff;
    }
  }

  // Sort the note off array by the time
  sort_note_off_events();
}

function convert_hmi_track(input: Ptr, input_size: number, output: Out): void {
  let done = 0;
  let current_command = 0;
  let current_value = 0;
  const t: Times = { current_time: 0, last_time: 0 };
  const start_of_buffer = output.pos;
  const start_of_input = input.pos;

  // memset(note_off_events, 0xFF, ...)
  for (const e of note_off_events) {
    e.time = 0xffffffff;
    e.command = 0xff;
    e.note = 0xff;
  }

  // Midi data offset is at 0x57 from track start
  input.pos += input.at(0x57);

  // Write track header, leave length as zero for now
  const track_header = [0x4d, 0x54, 0x72, 0x6b, 0x00, 0x00, 0x00, 0x00, 0x00];
  for (let i = 0; i < 8; i++) output.put(track_header[i]!);

  while (!done) {
    // Read variable length time
    t.current_time = (t.current_time + read_time_value(input)) >>> 0;

    // Next comes either a command (>= 0x80) or data (running status)
    current_value = input.next();
    if (current_value >= 0x80) {
      // Is command, make current, increase data pointer
      current_command = current_value;
      current_value = input.next();
    }

    // Check if note off events have to be inserted here
    check_for_note_off_events(t, output);

    if (current_command !== 0xfe) {
      // Write variable length time to output
      write_time_value((t.current_time - t.last_time) >>> 0, output);
      t.last_time = t.current_time;
    }

    // Write command, no running status in output
    if (current_command !== 0xfe) output.put(current_command);

    switch (current_command & 0xf0) {
      // 1 data byte
      case 0xc0: // Program change
      case 0xd0: // Channel aftertouch
        output.put(current_value);
        break;

      // 2 data bytes
      case 0x80: // Note off, does not occur in HMI
      case 0xa0: // Aftertouch
      case 0xb0: // Controller
      case 0xe0: // Pitch bend
        output.put(current_value);
        output.put(input.next());
        break;

      // 3 data bytes
      case 0x90: // Note on, non-standard, HMI files specify the duration as a third param
        output.put(current_value);
        output.put(input.next());
        remember_note_off_event(t.current_time + read_time_value(input), current_command, current_value);
        break;

      case 0xf0: // Meta event
        if (current_command === 0xfe) {
          // HMI specific event, variable length depending on type
          switch (current_value) {
            case 0x10:
              input.pos += 2;
              input.pos += input.at(0);
              input.pos += 5;
              break;
            case 0x14:
              input.pos += 2;
              break;
            case 0x15:
              input.pos += 6;
              break;
          }
        } else {
          // Only process end marker
          output.put(current_value);
          output.put(input.next());
          done = 1;
        }
        break;

      default:
        // error?
        break;
    }

    if ((input.pos - start_of_input) >>> 0 >= input_size) break;
    // not in the C: a truncated or broken file would make C read outside the buffer
    if (input.pos >= input.buf.length) break;
  }

  // Write end marker if necessary
  if (done !== 1) {
    const end_marker = [0x00, 0xff, 0x2f, 0x00];
    for (let i = 0; i < 4; i++) output.put(end_marker[i]!);
  }

  // Update header with length of track
  write_big_endian_number((output.pos - start_of_buffer - 8) >>> 0, output, start_of_buffer + 4);
}

/**
 * load_hmi (hmi.cpp): converts an Abuse HMI file to a Standard MIDI File. Takes the file's bytes
 * instead of its name; returns null where the C returns NULL (here: input too short for the header).
 */
export function load_hmi(input_buffer: Uint8Array): Uint8Array | null {
  const buffersize = input_buffer.length;
  if (buffersize < 0xf8) return null;

  const output = new Out();

  // Offset to tracks is at 0x113
  const offset_tracks = get_int_from_buffer(new Ptr(input_buffer, 0xe8));
  const next_offset = get_int_from_buffer(new Ptr(input_buffer, 0xf4));

  const num_tracks = Math.floor(((next_offset - offset_tracks) >>> 0) / 4) & 0xff; // uint8_t

  // Write Midi file header
  const midi_header = [0x4d, 0x54, 0x68, 0x64, 0x00, 0x00, 0x00, 0x06, 0x00, 0x01, 0x00, (num_tracks + 1) & 0xff, 0x00, 0xc0];
  for (let i = 0; i < 14; i++) output.put(midi_header[i]!);

  // Write additional first track with bpm info
  const bpm_track = [
    0x4d, 0x54, 0x72, 0x6b, 0x00, 0x00, 0x00, 0x0b, 0x00, 0xff, 0x51, 0x03, 0x18, 0x7f, 0xff, 0x00, 0xff, 0x2f, 0x00,
  ];
  for (let i = 0; i < bpm_track.length; i++) output.put(bpm_track[i]!);

  for (let i = 0; i < num_tracks; i++) {
    const trackposition = get_int_from_buffer(new Ptr(input_buffer, offset_tracks + i * 4));
    let tracksize: number;
    if (i === num_tracks - 1) tracksize = (buffersize - trackposition) >>> 0;
    else tracksize = (get_int_from_buffer(new Ptr(input_buffer, offset_tracks + (i + 1) * 4)) - trackposition) >>> 0;

    convert_hmi_track(new Ptr(input_buffer, trackposition), tracksize, output);
  }

  return output.buf.slice(0, output.pos);
}
