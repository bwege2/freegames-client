// Port of src/adapter/colour.cpp of GNU Chess 6.3.0 (PolyGlot 1.4 by Fabien Letouzey)

// constants

export const BlackFlag = 1 << 0;
export const WhiteFlag = 1 << 1;

export const ColourNone = 0;
export const Black = BlackFlag;
export const White = WhiteFlag;
export const ColourNb = 3;

// functions

// colour_is_ok()

export function colour_is_ok(colour: number): boolean {
   return colour === Black || colour === White;
}

// colour_is_white()

export function colour_is_white(colour: number): boolean {
   return colour === White;
}

// colour_is_black()

export function colour_is_black(colour: number): boolean {
   return colour === Black;
}

// colour_equal()

export function colour_equal(colour_1: number, colour_2: number): boolean {
   return (colour_1 & colour_2) !== 0;
}

// colour_opp()

export function colour_opp(colour: number): number {
   return colour ^ (BlackFlag ^ WhiteFlag);
}
