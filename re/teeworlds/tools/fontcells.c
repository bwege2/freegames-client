/* The glyph cell sizes CTextRender::InitIndex (src/engine/client/text.cpp) computes for each font size from all
   glyphs of the font (FreeType, FT_LOAD_DEFAULT): prints "size maxw maxh cellw cellh" per size. The port's
   text renderer (web/games/teeworlds/src/client/engine/text.ts) uses these cells, as the browser cannot list
   a font's glyphs. Usage: fontcells datasrc/fonts/DejaVuSans.ttf (fontcells.sh builds and runs it). */
#include <stdio.h>
#include <ft2build.h>
#include FT_FREETYPE_H

static int aFontSizes[] = {8,9,10,11,12,13,14,15,16,17,18,19,20,36,64};

int main(int argc, char **argv)
{
	FT_Library Lib;
	FT_Face Face;
	if(argc < 2 || FT_Init_FreeType(&Lib) || FT_New_Face(Lib, argv[1], 0, &Face))
		return 1;
	for(unsigned i = 0; i < sizeof(aFontSizes)/sizeof(int); i++)
	{
		int FontSize = aFontSizes[i];
		int OutlineThickness = FontSize > 36 ? 4 : FontSize >= 18 ? 2 : 1;
		FT_Set_Pixel_Sizes(Face, 0, FontSize);
		unsigned GlyphIndex;
		long MaxW = 0, MaxH = 0;
		FT_ULong Charcode = FT_Get_First_Char(Face, &GlyphIndex);
		while(GlyphIndex != 0)
		{
			FT_Load_Glyph(Face, GlyphIndex, FT_LOAD_DEFAULT);
			if(Face->glyph->metrics.width > MaxW) MaxW = Face->glyph->metrics.width;
			if(Face->glyph->metrics.height > MaxH) MaxH = Face->glyph->metrics.height;
			Charcode = FT_Get_Next_Char(Face, Charcode, &GlyphIndex);
		}
		int W = (int)(MaxW>>6)+2+OutlineThickness*2, H = (int)(MaxH>>6)+2+OutlineThickness*2;
		int CW, CH;
		for(CW = 1; CW < W; CW <<= 1);
		for(CH = 1; CH < H; CH <<= 1);
		printf("%d %d %d %d %d\n", FontSize, W, H, CW, CH);
	}
	return 0;
}
