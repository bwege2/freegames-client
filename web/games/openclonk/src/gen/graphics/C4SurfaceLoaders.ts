// @ts-nocheck
// OpenClonk 36de799: src/graphics/C4SurfaceLoaders.cpp, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $u64n } from '../../rt/int.ts';
import { c$longjmp } from '../../rt/libc.ts';
import { $oarr, $oat, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';

export class my_error_mgr {
  pub = {};
  setjmp_buffer = $oarr(1, () => ({}));

  None() {
    this.pub = {};
    this.setjmp_buffer = $oarr(1, () => ({}));
    return this;
  }

  $clone() { return new my_error_mgr().$assign(this); }
  $assign(o) {
    this.pub = ({ ...o.pub });
    this.setjmp_buffer = o.setjmp_buffer.slice();
    return this;
  }
}

function my_error_exit(cinfo) {
  let myerr = cinfo.err;
  cinfo.err.output_message(cinfo);
  c$longjmp($oat(myerr.setjmp_buffer, 0), 1);
}

function my_output_message(cinfo) {
  const buffer = new Int8Array(200);
  cinfo.err.format_message(cinfo, P(buffer, 0));
  $.LogF(S("libjpeg: %s"), P(buffer, 0));
}

function jpeg_noop(_cinfo) {
}


function fill_input_buffer(cinfo) {
  cinfo.src.next_input_byte = P($, "end_of_input");
  cinfo.src.bytes_in_buffer = 1;
  return 1;
}

function skip_input_data(cinfo, num_bytes) {
  cinfo.src.next_input_byte = cinfo.src.next_input_byte.add(num_bytes);
  cinfo.src.bytes_in_buffer = cinfo.src.bytes_in_buffer - $u64n(num_bytes);
  if (cinfo.src.bytes_in_buffer <= 0) {
    cinfo.src.next_input_byte = P($, "end_of_input");
    cinfo.src.bytes_in_buffer = 1;
  }
}

export function $init(): void {
  $.end_of_input$C4SurfaceLoaders = 217;
}

Object.assign($, { fill_input_buffer, jpeg_noop, my_error_exit, my_error_mgr, my_output_message, skip_input_data });
