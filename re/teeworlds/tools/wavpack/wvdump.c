/* Decodes .wv files with the WavPack 4.40 decoder Teeworlds 0.7.5 bundles (src/engine/external/wavpack),
   exactly as CSound::LoadWV (src/engine/client/sound.cpp) calls it, and prints one JSON line per file:
   name, channels, rate, bits, samples, the decoder's CRC error count, and the 16-bit samples
   (little endian, interleaved) that LoadWV keeps; the samples themselves go to OUTDIR/<name>.s16.
   Usage: wvdump OUTDIR FILE... (golden.sh adds the hashes) */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>
#include "wavpack.h"

static FILE *s_File;
static int32_t ReadData(void *pBuffer, int32_t Size) { return (int32_t)fread(pBuffer, 1, Size, s_File); }

int main(int argc, char **argv)
{
	for(int a = 2; a < argc; a++)
	{
		char aError[100];
		const char *pName = strrchr(argv[a], '/') ? strrchr(argv[a], '/') + 1 : argv[a];
		s_File = fopen(argv[a], "rb");
		if(!s_File) { fprintf(stderr, "cannot open %s\n", argv[a]); return 1; }
		WavpackContext *pContext = WavpackOpenFileInput(ReadData, aError);
		if(!pContext) { printf("{\"name\":\"%s\",\"error\":\"%s\"}\n", pName, aError); fclose(s_File); continue; }
		int Samples = WavpackGetNumSamples(pContext), Bits = WavpackGetBitsPerSample(pContext);
		unsigned Rate = WavpackGetSampleRate(pContext);
		int Channels = WavpackGetNumChannels(pContext);
		int32_t *pData = calloc((size_t)Samples * Channels + 32, 4);
		uint32_t Got = WavpackUnpackSamples(pContext, pData, Samples);
		char aOut[1024];
		snprintf(aOut, sizeof(aOut), "%s/%s.s16", argv[1], pName);
		FILE *pOut = fopen(aOut, "wb");
		if(!pOut) { fprintf(stderr, "cannot write %s\n", aOut); return 1; }
		for(int i = 0; i < Samples * Channels; i++)
		{
			short s = (short)pData[i];
			unsigned char b[2] = {(unsigned char)(s & 0xff), (unsigned char)((s >> 8) & 0xff)};
			fwrite(b, 1, 2, pOut);
		}
		fclose(pOut);
		printf("{\"name\":\"%s\",\"channels\":%d,\"rate\":%u,\"bits\":%d,\"samples\":%d,\"unpacked\":%u,\"crcErrors\":%d",
			pName, Channels, Rate, Bits, Samples, Got, WavpackGetNumErrors(pContext));
		printf(",\"first\":[");
		for(int i = 0; i < 16 && i < Samples * Channels; i++) printf(i ? ",%d" : "%d", (short)pData[i]);
		printf("]}\n");
		free(pData);
		fclose(s_File);
	}
	return 0;
}
