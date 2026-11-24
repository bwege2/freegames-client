/* The oracle of web/games/openclonk/src/rt/freetype.ts: the glyphs of the original's font as the original's FreeType
 * (the library its build links, oracle/build-full.sh) renders them with the calls of CStdFont::AddRenderedChar
 * (graphics/C4FontLoader.cpp): FT_New_Memory_Face, FT_Set_Pixel_Sizes(h, h), FT_Set_Transform (bold) and
 * FT_Load_Char(..., FT_LOAD_RENDER | FT_LOAD_NO_HINTING).
 *   ft-glyphs FONT.ttf > glyphs.txt
 * One line per size, weight and character: size weight char left top width rows advance.x advance.y pixels(hex) */
#include <stdio.h>
#include <stdlib.h>
#include <ft2build.h>
#include FT_FREETYPE_H

int main(int argc, char **argv)
{
	FILE *f = fopen(argv[1], "rb");
	if (!f) return 1;
	fseek(f, 0, SEEK_END); long n = ftell(f); fseek(f, 0, SEEK_SET);
	unsigned char *data = malloc(n);
	if (fread(data, 1, n, f) != (size_t)n) return 1;
	fclose(f);
	FT_Library library; FT_Face face;
	if (FT_Init_FreeType(&library)) return 2;
	if (FT_New_Memory_Face(library, data, n, 0, &face)) return 3;
	printf("face %d %d %d\n", face->units_per_EM, face->ascender, face->descender);
	static const int sizes[] = { 8, 10, 11, 12, 13, 14, 15, 16, 18, 20, 22, 24, 28, 31, 36, 44 };
	static const int weights[] = { 400, 700 };
	for (int s = 0; s < (int)(sizeof sizes / sizeof *sizes); ++s)
		for (int w = 0; w < 2; ++w)
		{
			FT_Set_Pixel_Sizes(face, sizes[s], sizes[s]);
			int boldness = weights[w] - 400;
			if (boldness)
			{
				boldness = (1 << 16) + (boldness << 16) / 400;
				FT_Matrix mat; mat.xx = boldness; mat.xy = mat.yx = 0; mat.yy = 1 << 16;
				FT_Set_Transform(face, &mat, NULL);
			}
			else FT_Set_Transform(face, NULL, NULL);
			for (unsigned long c = 32; c < 0x250; ++c)
			{
				if (FT_Load_Char(face, c, FT_LOAD_RENDER | FT_LOAD_NO_HINTING)) { printf("%d %d %lu error\n", sizes[s], weights[w], c); continue; }
				FT_GlyphSlot g = face->glyph;
				printf("%d %d %lu %d %d %u %u %ld %ld ", sizes[s], weights[w], c, g->bitmap_left, g->bitmap_top, g->bitmap.width, g->bitmap.rows, g->advance.x, g->advance.y);
				for (unsigned y = 0; y < g->bitmap.rows; ++y)
					for (unsigned x = 0; x < g->bitmap.width; ++x)
						printf("%02x", g->bitmap.buffer[y * g->bitmap.pitch + x]);
				printf("\n");
			}
		}
	return 0;
}
