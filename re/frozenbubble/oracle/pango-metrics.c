/*
 * pango-metrics: text metrics of the fonts Frozen Bubble 2.2.0 uses, measured through SDL_Pango
 * exactly as the game sets them up (SDLPango_CreateContext_GivenFontDesc: pangoft2 font map at
 * 96 dpi, language from g_get_charset(), base direction LTR; SDLPango_SetMinimumSize(ctx, -1, 0)
 * and SDLPango_SetText as c_stuff's sdlpango_getsize does). Run it through metrics.sh (the
 * oracle's fontconfig and locale). Prints JSON on stdout:
 *
 *   { "fonts": [ { "desc": "sans 10",
 *       "lineHeight": <px of a one-line layout>, "lineHeightPango": <Pango units>,
 *       "emptyHeight": <px of the empty text>,
 *       "advance": { "<codepoint>": <logical width in Pango units of the one-char layout>, ... },
 *       "pairs": { "<cp a>,<cp b>": <w(ab) - w(a) - w(b) in Pango units, nonzero only>, ... },
 *       "check": { "strings": N, "mismatches": M, "examples": [ {"text", "predicted", "actual"} ] }
 *     }, ... ] }
 *
 * Characters: U+0020..U+007E and U+00A0..U+00FF. The check predicts the width of random printable
 * ASCII strings as PANGO_PIXELS(sum of advances + sum of pair adjustments of neighbours) and
 * compares it with SDLPango_GetLayoutWidth.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <SDL.h>
#include <SDL_Pango.h>
#include <pango/pango.h>
#include <ft2build.h>
#include FT_FREETYPE_H

typedef struct { Uint32 flags; int depth; Uint32 Rmask, Gmask, Bmask, Amask; } surfaceArgs;
struct _contextImpl {   /* SDL_Pango 0.1.2's contextImpl */
	PangoContext *context;
	PangoFontMap *font_map;
	PangoFontDescription *font_desc;
	PangoLayout *layout;
	surfaceArgs surface_args;
	FT_Bitmap *tmp_ftbitmap;
	SDLPango_Matrix color_matrix;
	int min_width;
	int min_height;
};

static const char *descs[] = { "sans 10", "sans italic 10", "sans 11", "sans 11 bold", "sans 14", "sans 8" };

static int utf8(int cp, char *out)
{
	if (cp < 0x80) { out[0] = (char)cp; out[1] = 0; return 1; }
	out[0] = (char)(0xC0 | (cp >> 6)); out[1] = (char)(0x80 | (cp & 0x3F)); out[2] = 0; return 2;
}

static void measure(SDLPango_Context *ctx, const char *text, int *w, int *h)
{
	PangoRectangle lr;
	SDLPango_SetMinimumSize(ctx, -1, 0);
	SDLPango_SetText(ctx, text, -1);
	pango_layout_get_extents(ctx->layout, NULL, &lr);
	*w = lr.width;
	if (h) *h = lr.height;
}

int main(void)
{
	int cps[192], ncp = 0, cp, d;
	static int adv[256], pair[256][256];
	unsigned int seed = 12345;
	SDLPango_Init();
	for (cp = 0x20; cp <= 0x7E; cp++) cps[ncp++] = cp;
	for (cp = 0xA0; cp <= 0xFF; cp++) cps[ncp++] = cp;
	printf("{ \"fonts\": [\n");
	for (d = 0; d < (int)(sizeof descs / sizeof descs[0]); d++) {
		SDLPango_Context *ctx = SDLPango_CreateContext_GivenFontDesc(descs[d]);
		int i, j, w, h, first = 1, mism = 0, nex = 0, n;
		char buf[64];
		SDLPango_SetDefaultColor(ctx, MATRIX_TRANSPARENT_BACK_WHITE_LETTER);
		printf("  { \"desc\": \"%s\",\n", descs[d]);
		measure(ctx, "x", &w, &h);
		printf("    \"lineHeight\": %d, \"lineHeightPango\": %d,\n", PANGO_PIXELS(h), h);
		measure(ctx, "", &w, &h);
		printf("    \"emptyHeight\": %d,\n", PANGO_PIXELS(h));
		printf("    \"advance\": {");
		for (i = 0; i < ncp; i++) {
			utf8(cps[i], buf);
			measure(ctx, buf, &adv[cps[i]], NULL);
			printf("%s\"%d\": %d", i ? ", " : " ", cps[i], adv[cps[i]]);
		}
		printf(" },\n    \"pairs\": {");
		for (i = 0; i < ncp; i++)
			for (j = 0; j < ncp; j++) {
				int la = utf8(cps[i], buf);
				utf8(cps[j], buf + la);
				measure(ctx, buf, &w, NULL);
				pair[cps[i]][cps[j]] = w - adv[cps[i]] - adv[cps[j]];
				if (pair[cps[i]][cps[j]]) {
					printf("%s\"%d,%d\": %d", first ? " " : ", ", cps[i], cps[j], pair[cps[i]][cps[j]]);
					first = 0;
				}
			}
		printf(" },\n    \"check\": { \"strings\": 400, ");
		for (n = 0; n < 400; n++) {
			char s[64];
			int len, k, pred = 0, actual;
			seed = seed * 1103515245u + 12345u;
			len = 1 + (int)((seed >> 16) % 40);
			for (k = 0; k < len; k++) {
				seed = seed * 1103515245u + 12345u;
				s[k] = (char)(0x20 + (seed >> 16) % 95);
			}
			s[len] = 0;
			for (k = 0; k < len; k++) {
				pred += adv[(unsigned char)s[k]];
				if (k) pred += pair[(unsigned char)s[k - 1]][(unsigned char)s[k]];
			}
			SDLPango_SetMinimumSize(ctx, -1, 0);
			SDLPango_SetText(ctx, s, -1);
			actual = SDLPango_GetLayoutWidth(ctx);
			if (PANGO_PIXELS(pred) != actual) {
				if (!mism) printf("\"examples\": [");
				if (nex < 10) {
					printf("%s{ \"text\": \"", nex ? ", " : " ");
					for (k = 0; k < len; k++) {
						if (s[k] == '"' || s[k] == '\\') putchar('\\');
						putchar(s[k]);
					}
					printf("\", \"predicted\": %d, \"actual\": %d }", PANGO_PIXELS(pred), actual);
					nex++;
				}
				mism++;
			}
		}
		if (mism) printf(" ], ");
		printf("\"mismatches\": %d } }%s\n", mism, d + 1 < (int)(sizeof descs / sizeof descs[0]) ? "," : "");
		SDLPango_FreeContext(ctx);
	}
	printf("] }\n");
	return 0;
}
