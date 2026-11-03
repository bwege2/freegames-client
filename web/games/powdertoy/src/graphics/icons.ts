// graphics/Icons.h: icon names, see Graphics.draw_icon (raster.ts). The icons are glyphs of the font in the
// private use area (0xE000..); draw_icon lists which glyph and colour each one uses.

export const NoIcon = 0, IconOpen = 1, IconReload = 2, IconSave = 3, IconVoteUp = 4, IconVoteDown = 5, IconTag = 6,
  IconNew = 7, IconLogin = 8, IconRenderSettings = 9, IconSimulationSettings = 10, IconPause = 11,
  IconVoteSort = 12, IconDateSort = 13, IconMyOwn = 14, IconFavourite = 15, IconSearch = 16, IconDelete = 17,
  IconAdd = 18, IconReport = 19, IconUsername = 20, IconPassword = 21, IconClose = 22, IconEffect = 23,
  IconFire = 24, IconGlow = 25, IconBlur = 26, IconBlob = 27, IconBasic = 28, IconAltAir = 29, IconPressure = 30,
  IconVelocity = 31, IconWarp = 32, IconPersistant = 33, IconHeat = 34, IconLife = 35, IconGradient = 36,
  IconVort = 37;

export type Icon = number;
