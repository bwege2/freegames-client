// gui/interface/TextWrapper.h / TextWrapper.cpp. Indices are UTF-16 code units (the original's String is UTF-32;
// the font only has BMP glyphs).
import { CharWidth } from '../../graphics/raster.ts';
import { FONT_H } from '../../graphics/font.ts';

export interface Index {
  raw_index: number;
  wrapped_index: number;
  clear_index: number;
}

interface ClickmapRegion {
  pos_x: number;
  pos_y: number;
  width: number;
  pos_line: number;
  index: Index;
}

interface WrapRecord {
  character: string;
  width: number;
  raw_index: number;
  clear_index: number;
  wraps: boolean;
  may_eat_space: boolean;
}

export class TextWrapper {
  private raw_text_size = 0;
  private clear_text_size = 0;
  private wrapped_text = '';
  private wrapped_lines = 0;
  private wrappedWidth = 0;
  private regions: ClickmapRegion[] = [];

  Update(text: string, do_wrapping: boolean, max_width: number): number {
    this.raw_text_size = text.length;
    let line_width = 0;
    let records: WrapRecord[] = [];
    let word_begins_at = -1;
    let word_width = 0;
    let lines = 0;
    let char_width = 0;
    let clear_count = 0;
    this.wrappedWidth = 0;
    const resetLine = () => {
      this.wrappedWidth = Math.max(this.wrappedWidth, line_width);
      line_width = 0;
      lines += 1;
    };
    const wrap_if_needed = (width_to_consider: number): boolean => {
      if (do_wrapping && width_to_consider + char_width > max_width) {
        records.push({ character: '\n', width: 0, raw_index: 0, clear_index: 0, wraps: true, may_eat_space: true });
        resetLine();
        return true;
      }
      return false;
    };
    for (let it = 0; it < text.length; ++it) {
      const ch = text[it];
      char_width = CharWidth(text.charCodeAt(it));
      let sequence_length = 0;
      switch (ch) {
        case '\b': sequence_length = 2; break;
        case '\x0e': sequence_length = 1; break;
        case '\x0f': sequence_length = 4; break;
      }
      switch (ch) {
        case ' ':
          wrap_if_needed(line_width);
          if (records.length && records[records.length - 1].may_eat_space) {
            records[records.length - 1].may_eat_space = false;
          } else {
            records.push({ character: ch, width: char_width, raw_index: it, clear_index: clear_count, wraps: false, may_eat_space: false });
            line_width += char_width;
          }
          word_begins_at = -1;
          ++clear_count;
          break;
        case '\n':
          records.push({ character: ch, width: max_width - line_width, raw_index: it, clear_index: clear_count, wraps: true, may_eat_space: false });
          resetLine();
          word_begins_at = -1;
          ++clear_count;
          break;
        default:
          if (sequence_length) {
            if (text.length - it < sequence_length) {
              it = text.length - 1;
              continue;
            }
            for (const skip = it + sequence_length; it !== skip; ++it) {
              records.push({ character: text[it], width: 0, raw_index: 0, clear_index: 0, wraps: false, may_eat_space: false });
            }
            --it;
          } else {
            if (word_begins_at === -1) {
              word_begins_at = records.length;
              word_width = 0;
            }
            if (wrap_if_needed(word_width)) {
              word_begins_at = records.length;
              word_width = 0;
            }
            if (wrap_if_needed(line_width)) {
              // std::rotate(records.begin() + word_begins_at, records.end() - 1, records.end())
              const last = records.pop()!;
              records.splice(word_begins_at, 0, last);
              word_begins_at += 1;
              line_width = word_width;
            }
            records.push({ character: ch, width: char_width, raw_index: it, clear_index: clear_count, wraps: false, may_eat_space: false });
            word_width += char_width;
            line_width += char_width;
            ++clear_count;
            switch (ch) {
              case '?': case ';': case ',': case ':': case '.': case '-': case '!':
                word_begins_at = -1;
                break;
            }
          }
          break;
      }
    }
    this.regions = [];
    const parts: string[] = [];
    let x = 0;
    let l = 0;
    let counter = 0;
    for (const record of records) {
      this.regions.push({ pos_x: x, pos_y: l * FONT_H, width: record.width, pos_line: l + 1, index: { raw_index: record.raw_index, wrapped_index: counter, clear_index: record.clear_index } });
      ++counter;
      x += record.width;
      if (record.wraps) {
        x = 0;
        l += 1;
      }
      parts.push(record.character);
    }
    records = [];
    this.wrapped_text = parts.join('');
    resetLine();
    this.clear_text_size = clear_count;
    this.wrapped_lines = lines;
    return lines;
  }

  WrappedText(): string { return this.wrapped_text; }
  WrappedLines(): number { return this.wrapped_lines; }
  WrappedWidth(): number { return this.wrappedWidth; }
  IndexBegin(): Index { return { raw_index: 0, wrapped_index: 0, clear_index: 0 }; }
  IndexEnd(): Index { return { raw_index: this.raw_text_size, wrapped_index: this.wrapped_text.length, clear_index: this.clear_text_size }; }

  Point2Index(x: number, y: number): Index {
    if (y < 0) return this.IndexBegin();
    const regions = this.regions;
    if (regions.length) {
      let curr = 0;
      const end = regions.length;
      const find_next_nonempty = (it: number) => {
        ++it;
        while (it !== end && !regions[it].width) ++it;
        return it;
      };
      while (true) {
        const c = regions[curr];
        if (c.pos_y + FONT_H > y) {
          if (c.pos_x + ((c.width / 2) | 0) > x) return { ...c.index };
        }
        const next = find_next_nonempty(curr);
        if (next === end) break;
        const n = regions[next];
        if (c.pos_y + FONT_H > y) {
          if (c.pos_x + ((c.width / 2) | 0) <= x && n.pos_x + ((n.width / 2) | 0) > x) return { ...n.index };
          if (c.pos_x + ((c.width / 2) | 0) <= x && n.pos_y > c.pos_y) return { ...n.index };
        }
        curr = next;
      }
    }
    return this.IndexEnd();
  }

  /** Index2Point(Index, int &x, int &y): returns [line, x, y] (line -1 if invalid; x and y then 0) */
  Index2Point(index: Index): [number, number, number] {
    const regions = this.regions;
    if (index.wrapped_index < 0 || index.wrapped_index > regions.length || !regions.length) return [-1, 0, 0];
    if (index.wrapped_index === regions.length) {
      const r = regions[index.wrapped_index - 1];
      return [r.pos_line, r.pos_x + r.width, r.pos_y];
    }
    const r = regions[index.wrapped_index];
    return [r.pos_line, r.pos_x, r.pos_y];
  }

  Clear2Index(clear_index: number): Index {
    if (clear_index < 0) return this.IndexBegin();
    for (const region of this.regions) {
      if (region.index.clear_index >= clear_index) return { ...region.index };
    }
    return this.IndexEnd();
  }
}
