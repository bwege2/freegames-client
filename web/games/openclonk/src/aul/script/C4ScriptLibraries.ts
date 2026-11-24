// @ts-nocheck
// OpenClonk 36de799: src/script/C4ScriptLibraries.cpp, src/script/C4ScriptLibraries.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { C4PropListStatic } from './C4PropList.ts';
import { $u64n } from '../../rt/int.ts';
import { blake2b } from '../../rt/native.ts';
import { $cs, $view8, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $throw, StdString } from '../../rt/std.ts';

export class C4ScriptLibrary extends C4PropListStatic {

  static InstantiateAllLibraries(engine) {
    const libraries = [new C4ScriptLibraryCrypto().init()];
    for (const library of libraries) {
      library.RegisterWithEngine(engine);
    }
  }

  init(name) {
    super.init(null, null, $.Strings.RegString$pi8(name));
    return this;
  }

  RegisterWithEngine(engine) {
    engine.RegisterGlobalConstant(this.ParentKeyName.op_arrow$v().GetCStr(), $.C4VPropList(this));
    this.CreateFunctions();
    this.Freeze();
  }

  $clone() { return new C4ScriptLibrary().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class C4ScriptLibraryCrypto extends C4ScriptLibrary {
  static LIBRARY_NAME;
  static FUNC_COMPUTE_HASH;

  static Hash_Dispatch(__this, input, output_length) {
    if (output_length < 1 || output_length > 80) {
      $throw(new $.C4AulExecError().init($.strprintf(S("outputLength must be between 1 and %d"), 80).c_str()));
    }
    if (input == null) {
      $throw(new $.C4AulExecError().init($.strprintf(S("call to \"%s\" parameter %d: passed %s, but expected %s"), C4ScriptLibraryCrypto.FUNC_COMPUTE_HASH, 1, $.GetC4VName(0 /*C4V_Nil*/), $.GetC4VName(4 /*C4V_String*/)).c_str()));
    }
    let raw_output_length = (Math.imul(output_length, 4) / 5 | 0) + (output_length % 5 !== 0 ? 1 : 0) | 0;
    let data = $view8(input.GetCStr(), false);
    let data_length = input.GetData().getLength() | 0;
    let hash_output = P(new Uint8Array($u64n(raw_output_length)), 0);
    if (blake2b(hash_output, $u64n(raw_output_length), data, $u64n(data_length), null, 0) !== 0) {
      $throw(new $.C4AulExecError().init(S("internal error: blake2b call failed")));
    }
    let encoded = b85_encode(hash_output, $u64n(raw_output_length));
    encoded.resize($u64n(output_length));
    return $.C4VString$StdStrBuf(new $.StdStrBuf().init$pi8$u64$b(encoded.c_str(), $u64n(output_length), false));
  }

  CreateFunctions() {
    $.AddFunc$5(this, C4ScriptLibraryCrypto.FUNC_COMPUTE_HASH, C4ScriptLibraryCrypto.Hash_Dispatch);
  }

  init() {
    super.init(C4ScriptLibraryCrypto.LIBRARY_NAME);
    return this;
  }

  $clone() { return new C4ScriptLibraryCrypto().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}



export function b85_encode(input, length) {
  let padding = (4 - length % 4) % 4;
  let output_length = Math.trunc((length + padding) * 5 / 4);
  let encoded = StdString.of(output_length, 0);
  let encode_cursor = 0;
  for (let i = 0; i < length; i = i + 4) {
    let value = 0;
    for (let j = 0; j < 4; j = j + 1 | 0) {
      value = Math.imul(value, 256) >>> 0;
      if (i + $u64n(j) < length) {
        value = value + input.a[input.o + (i + $u64n(j))] >>> 0;
      }
    }
    for (let j = 4; j >= 0; j = j - 1 | 0) {
      encoded.d[$u64n(encode_cursor + j | 0)] = $.encoder_table[value % 85];
      value = value / 85 >>> 0;
    }
    encode_cursor = encode_cursor + 5 | 0;
  }
  encoded.resize(output_length - padding);
  return encoded;
}

export function b85_decode(input) {
  let length = input.size();
  let padding = (5 - length % 5) % 5;
  let output_length = Math.trunc((length + padding) * 4 / 5);
  let decoded = StdString.of(output_length, 0);
  let decode_cursor = 0;
  for (let i = 0; i < length; i = i + 5) {
    let value = 0;
    for (let j = 0; j < 5; j = j + 1 | 0) {
      value = Math.imul(value, 85) >>> 0;
      if (i + $u64n(j) < length) {
        let byte = input.d[i + $u64n(j)] & 0xff;
        if (byte >= 32 && byte <= 127) {
          value = value + ($.decoder_table[byte - 32 | 0] >>> 0) >>> 0;
        }
      } else {
        value = value + 84 >>> 0;
      }
    }
    for (let j = 3; j >= 0; j = j - 1 | 0) {
      decoded.d[$u64n(decode_cursor + j | 0)] = ((value & 255) >>> 0) << 24 >> 24;
      value = value / 256 >>> 0;
    }
    decode_cursor = decode_cursor + 4 | 0;
  }
  decoded.resize(output_length - padding);
  return decoded;
}

export function $init(): void {
  C4ScriptLibraryCrypto.LIBRARY_NAME = S("_Crypto");
  C4ScriptLibraryCrypto.FUNC_COMPUTE_HASH = S("_ComputeHash");
  $.encoder_table = $cs(S("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.-:+=^!/*?&<>()[]{}@%$#"), 86);
  $.decoder_table = new Int8Array([
  0xffffffff, 68, 0xffffffff, 84, 83, 82, 72, 0xffffffff, 75, 76, 70, 65, 0xffffffff, 63, 62, 69,
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 64, 0xffffffff, 73, 66, 74, 71,
  81, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50,
  51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 77, 0xffffffff, 78, 67, 0xffffffff,
  0xffffffff, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
  25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 79, 0xffffffff, 80, 0xffffffff, 0xffffffff,
]);
}

Object.assign($, { C4ScriptLibrary, C4ScriptLibraryCrypto, b85_decode, b85_encode });
