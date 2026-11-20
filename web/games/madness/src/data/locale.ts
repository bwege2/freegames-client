// Madness Interactive Reloaded port (GPL-3.0). MIR's localisation files (`base/locale/*.json`) are
// LocalisationFile objects (Shared/Localisation/LocalisationFile.cs): a display name, a culture and a table of
// key → text. The game reads the table.
export interface LocaleFile { DisplayName?: string; Culture?: string; Table?: Record<string, string> }

/** the key → text table of a locale file, without its BOM */
export function localeTable(text: string): Record<string, string> {
  const file = JSON.parse(text.replace(/^\uFEFF/, '')) as LocaleFile;
  return file.Table ?? (file as unknown as Record<string, string>);
}
