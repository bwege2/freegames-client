// Port of src/engine/colour.h of GNU Chess 6.3.0 (Fruit 2.1 by Fabien Letouzey)

// constants
export const ColourNone = -1;
export const White = 0;
export const Black = 1;
export const ColourNb = 2;

export const WhiteFlag = 1 << White;
export const BlackFlag = 1 << Black;

// macros
export const COLOUR_IS_OK = (colour: number): boolean => (colour & ~1) === 0;
export const COLOUR_IS_WHITE = (colour: number): boolean => colour === White;
export const COLOUR_IS_BLACK = (colour: number): boolean => colour !== White;
export const COLOUR_IS = (piece: number, colour: number): boolean => (piece & (colour + 1)) !== 0;
export const FLAG_IS = (piece: number, flag: number): boolean => (piece & flag) !== 0;
export const COLOUR_OPP = (colour: number): number => colour ^ (White ^ Black);
export const COLOUR_FLAG = (colour: number): number => colour + 1;
