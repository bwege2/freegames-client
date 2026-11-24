// Extracts the synchronized random calls (RCT_Random, C4RandomRecord.cpp) of an OpenClonk debug record:
// every chunk is {uint8 frameDiff, uint8 type, int32 type, uint8 size, data}; the random chunk's data is the
// C4RCRandom {int32 Cnt; uint32 Range; uint32 Val}. Prints the JSON array the random oracle test compares with.
//   node re/openclonk/tools/extract-rand.mjs ~/.clonk/openclonk/Records.ocf/001-AcidDrilling.ocs/CtrlRec.ocb
import fs from 'node:fs';

const b = fs.readFileSync(process.argv[2]);
const out = [];
for (let i = 1; i + 17 <= b.length; i++) {
  // the chunk head's type byte, then the payload's int32 type and the 12-byte C4RCRandom
  if (b[i - 1] !== 0x85 || b[i] !== 0x85 || b[i + 1] !== 0 || b[i + 2] !== 0 || b[i + 3] !== 0 || b[i + 4] !== 12) continue;
  out.push([b.readInt32LE(i + 5), b.readUInt32LE(i + 9), b.readUInt32LE(i + 13)]);
  i += 16;
}
process.stdout.write(JSON.stringify(out) + '\n');
