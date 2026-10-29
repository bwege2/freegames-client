// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/i18n/Messages.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/**
 *  Copyright (C) 2002-2022   The FreeCol Team
 *
 *  This file is part of FreeCol.
 *
 *  FreeCol is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 2 of the License, or
 *  (at your option) any later version.
 *
 *  FreeCol is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with FreeCol.  If not, see <http://www.gnu.org/licenses/>.
 */
import { $J, BufferedReader, Files, HashMap, IOException, InputStreamReader, JObject, JString, Level, Locale, Logger, NullPointerException, StandardCharsets, StringBuilder, StringTokenizer, XMLStreamException } from '../../../../../../jre/index.ts';

let UIManager, NumberRules, FreeColDirectories, FreeColModFile, FreeColRules, Role, StringTemplate, StringTemplate$TemplateType, CollectionUtils, LogBuilder, StringUtils;

/**
 * Represents a collection of messages in a particular locale.
 *
 * The individual messages are read from property files in the
 * {@code data/strings} directory. The property files are called
 * "FreeColMessages[_LANGUAGE[_COUNTRY[_VARIANT]]].properties", where
 * LANGUAGE should be an ISO 639-2 or ISO 639-3 language code, COUNTRY
 * should be an ISO 3166-2 country code, and VARIANT is an arbitrary
 * string. The encoding of the property files is UTF-8. Since the Java
 * Properties class is unable to handle UTF-8 directly, this class
 * uses its own implementation.
 *
 * The individual messages may include variables, which must be
 * delimited by percent characters (e.g. "%nation%"), and will be
 * replaced when the message is formatted. Furthermore, the messages
 * may include choice formats consisting of a tag followed by a colon
 * (":"), a selector and one or several choices separated from the
 * selector and each other by pipe characters ("|"). The entire choice
 * format must be enclosed in double brackets ("{{" and "}}",
 * respectively).
 *
 * Each choice must consist of a key and a value separated by an
 * equals character ("="), unless it is a variable, in which case the
 * variable must resolve to another choice format. The selector may
 * also be a variable. If the selector is omitted, then one of the
 * choices should use the key "default". Choice formats may be
 * nested.
 *
 * <pre>
 *   key1=%colony% tuottaa tuotetta {{tag:acc|%goods%}}.
 *   key2={{plural:%amount%|one=ruoka|other=ruokaa|default={{tag:|acc=viljaa|default=Vilja}}}}
 *   key3={{tag:|acc=viljaa|default={{plural:%amount%|one=ruoka|other=ruokaa|default=Ruoka}}}}
 * </pre>
 *
 * This class is NOT thread-safe. (CO: I cannot find any place that
 * really has a problem)
 */
export class Messages extends JObject {
  static logger: Logger = null;
  static readonly DESCRIPTION_SUFFIX: string = '.description';
  static readonly SHORT_DESCRIPTION_SUFFIX: string = '.shortDescription';
  static readonly NAME_SUFFIX: string = '.name';
  static readonly RULER_SUFFIX: string = '.ruler';
  static DESCRIPTION_KEYS: string[] = null;
  /**
   * Automatic language choice from default locale.
   */
  static readonly AUTOMATIC: string = 'automatic';
  /**
   * The mapping from language-independent key to localized message
   * for the established locale.
   */
  static messageBundle: JMap<string, string> = null;
  /**
   * A map with Selector values and the tag keys used in choice
   * formats.
   */
  static tagMap: JMap<string, Selector> = null;
  _Messages(): this {
    return this;
  }
  /**
   * Gets the Selector with the given tag.
   *
   * @param tag The tag to check.
   * @return A suitable {@code Selector}.
   */
  static getSelector(tag: string): Selector {
    return Messages.tagMap.get(StringUtils.downCase$String(tag));
  }
  /**
   * Set the grammatical number rule.
   *
   * @param number a {@code Number} value
   */
  static setGrammaticalNumber(number$: Number_): void {
    Messages.tagMap.put('plural', number$);
  }
  /**
   * Load the message bundle for the given locale
   *
   * Error messages have to go to System.err as this routine is called
   * before logging is enabled.
   *
   * @param locale The {@code Locale} to set resources for.
   */
  static loadMessageBundle(locale: Locale): void {
    Messages.messageBundle.clear();
    if (!NumberRules.isInitialized()) {
      let cldr = FreeColDirectories.getI18nPluralsFile();
      if (cldr.exists()) {
        {
          try {
            const in$ = Files.newInputStream(cldr.toPath());
            try {
              NumberRules.load(in$);
            } finally {
              if (in$ != null) in$.close();
            }
          } catch ($e0) {
            if ($J.isa($e0, IOException) || $J.isa($e0, XMLStreamException)) {
              let e = $J.exc($e0);
              $J.err.println('Failed to read CLDR rules: ' + e.getMessage());
            } else {
              throw $e0;
            }
          }
        }
      } else {
        $J.err.println('Could not find CLDR rules: ' + cldr.getPath());
      }
    }
    let loc = (JString.equalsIgnoreCase(Messages.AUTOMATIC, locale.getLanguage())) ? Locale.getDefault() : locale;
    Messages.setGrammaticalNumber(NumberRules.getNumberForLanguage(loc.getLanguage()));
    for (const $it1 = FreeColDirectories.getI18nMessageFileList(locale).iterator(); $it1.hasNext(); ) {
      let f = $it1.next();
      if (!f.canRead()) {
        continue;
      }
      try {
        Messages.loadMessages(Files.newInputStream(f.toPath()));
      } catch ($e2) {
        if ($J.isa($e2, IOException)) {
          let ioe = $J.exc($e2);
          $J.err.println('Failed to load messages from ' + f.getPath() + ': ' + ioe.getMessage());
        } else {
          throw $e2;
        }
      }
    }
    let filenames = FreeColDirectories.getMessageFileNameList(locale);
    for (const $it3 = FreeColRules.getRulesList().iterator(); $it3.hasNext(); ) {
      let fctf = $it3.next();
      for (const $it4 = filenames.iterator(); $it4.hasNext(); ) {
        let fn = $it4.next();
        let is$ = null;
        try {
          is$ = fctf.getInputStream(fn);
        } catch ($e5) {
          if ($J.isa($e5, IOException)) {
            let ioe = $J.exc($e5);
            continue;
          } else {
            throw $e5;
          }
        }
        try {
          Messages.loadMessages(is$);
        } catch ($e6) {
          if ($J.isa($e6, IOException)) {
            let ioe = $J.exc($e6);
            $J.err.println('Failed to load rules messages from ' + fn + ': ' + ioe.getMessage());
          } else {
            throw $e6;
          }
        } finally {
          try {
            is$.close();
          } catch ($e7) {
            if ($J.isa($e7, IOException)) {
              let x = $J.exc($e7);
            } else {
              throw $e7;
            }
          }
        }
      }
    }
  }
  /**
   * Loads messages from a resource file into the current message bundle.
   *
   * Public for the test suite.
   *
   * The {@code InputStream} gets closed in this method.
   *
   * @param is The {@code InputStream} to read from.
   * @throws IOException on failure to read from the stream.
   */
  static loadMessages(is$: InputStream): void {
    {
      const in$ = new BufferedReader(new InputStreamReader(is$, StandardCharsets.UTF_8));
      try {
        let line = null;
        while ((line = in$.readLine()) != null) {
          line = JString.trim(line);
          let index = line.indexOf(String.fromCharCode(35 /* '#' */));
          if (index === 0) {
            continue;
          }
          index = line.indexOf(String.fromCharCode(61 /* '=' */));
          if (index > 0) {
            let key = JString.trim(line.substring(0, index));
            let value = JString.replace(JString.replace(JString.trim(line.substring((index + 1) | 0)), '\\n', '\n'), '\\t', '\t');
            Messages.messageBundle.put(key, value);
            if (key.startsWith('FileChooser.')) {
              UIManager.put(key, value);
            }
          }
        }
      } finally {
        if (in$ != null) in$.close();
      }
    }
  }
  /**
   * Load localized messages for all mods.
   *
   * We can not initially load resources from mods because not all
   * mods can be loaded until the user mod directory is initialized,
   * which depends on the command line processing, which in turn
   * requires at least the basic localized message resources to be
   * loaded.  So this routine is called separately when the mods are
   * finally loaded.
   *
   * @param locale The {@code Locale} to load resources for.
   */
  static loadModMessageBundle(locale: Locale): void {
    let filenames = FreeColDirectories.getMessageFileNameList(locale);
    let lb = new LogBuilder()._LogBuilder(32);
    lb.add(['Failed to load mod messages:']);
    lb.mark();
    for (const $it8 = FreeColModFile.getModsList().iterator(); $it8.hasNext(); ) {
      let fcmf = $it8.next();
      for (const $it9 = filenames.iterator(); $it9.hasNext(); ) {
        let name = $it9.next();
        try {
          Messages.loadMessages(fcmf.getInputStream(name));
        } catch ($e10) {
          if ($J.isa($e10, IOException)) {
            let e = $J.exc($e10);
            lb.add([32 /* ' ' */, fcmf.getId(), 47 /* \u002f */, name]);
          } else {
            throw $e10;
          }
        }
      }
    }
    if (lb.grew([])) {
      lb.log(Messages.logger, Level.FINE);
    }
  }
  /**
   * Load messages specific to active mods.
   *
   * Called when the spec is updated with the selected mods.
   *
   * @param mods The list of {@code FreeColModFile} for the active mods.
   * @param locale The {@code Locale} to load resources for.
   */
  static loadActiveModMessageBundle(mods: List<FreeColModFile>, locale: Locale): void {
    let filenames = FreeColDirectories.getModMessageFileNames(locale);
    let lb = new LogBuilder()._LogBuilder(32);
    lb.add(['Failed to load active mod messages:']);
    lb.mark();
    for (const $it11 = mods.iterator(); $it11.hasNext(); ) {
      let fcmf = $it11.next();
      for (const $it12 = filenames.iterator(); $it12.hasNext(); ) {
        let name = $it12.next();
        try {
          Messages.loadMessages(fcmf.getInputStream(name));
        } catch ($e13) {
          if ($J.isa($e13, IOException)) {
            let e = $J.exc($e13);
            lb.add([32 /* ' ' */, fcmf.getId(), 47 /* \u002f */, name]);
          } else {
            throw $e13;
          }
        }
      }
    }
    if (lb.grew([])) {
      lb.log(Messages.logger, Level.FINE);
    }
  }
  /**
   * Get the {@code Locale} corresponding to a given language name.
   *
   * Public as this is needed for language option processing and the
   * initial locale setting.
   *
   * @param languageID An underscore separated language/country/variant tuple.
   * @return The {@code Locale} for the specified language.
   */
  static getLocale(languageID: string): Locale {
    let language: string;
    let country = '';
    let variant = '';
    let st = new StringTokenizer(languageID, '_', true);
    language = st.nextToken();
    if (st.hasMoreTokens()) {
      st.nextToken();
    }
    if (st.hasMoreTokens()) {
      let token = st.nextToken();
      if (!$J.equals('_', token)) {
        country = token;
      }
      if (st.hasMoreTokens()) {
        token = st.nextToken();
        if ($J.equals('_', token) && st.hasMoreTokens()) {
          token = st.nextToken();
        }
        if (!$J.equals('_', token)) {
          variant = token;
        }
      }
    }
    return new Locale(language, country, variant);
  }
  static nameKey$String(id: string): string {
    return id + Messages.NAME_SUFFIX;
  }
  static nameKey$ObjectWithId(object$: ObjectWithId): string {
    return Messages.nameKey$String(object$.getId());
  }
  static getName$String(id: string): string {
    return Messages.message$String(Messages.nameKey$String(id));
  }
  static getName$Named(named: Named): string {
    return Messages.message$String(named.getNameKey());
  }
  static descriptionKey$String(id: string): string {
    return id + Messages.DESCRIPTION_SUFFIX;
  }
  static descriptionKey$ObjectWithId(object$: ObjectWithId): string {
    return Messages.descriptionKey$String(object$.getId());
  }
  static getDescription$String(id: string): string {
    return Messages.message$String(Messages.descriptionKey$String(id));
  }
  static getDescription$ObjectWithId(object$: ObjectWithId): string {
    return Messages.message$String(Messages.descriptionKey$ObjectWithId(object$));
  }
  static shortDescriptionKey(id: string): string {
    return id + Messages.SHORT_DESCRIPTION_SUFFIX;
  }
  static getShortDescription$String(id: string): string {
    return Messages.message$String(Messages.shortDescriptionKey(id));
  }
  static getShortDescription$ObjectWithId(object$: ObjectWithId): string {
    return Messages.getShortDescription$String(object$.getId());
  }
  static rulerKey(id: string): string {
    return id + Messages.RULER_SUFFIX;
  }
  static getRulerName(id: string): string {
    return Messages.message$String(Messages.rulerKey(id));
  }
  /**
   * Does the message bundle contain the given key?
   *
   * @param key The key {@code String} to check.
   * @return True if there is a message present with the given key.
   */
  static containsKey(key: string): boolean {
    return Messages.messageBundle.get(key) != null;
  }
  /**
   * Returns the preferred key if it is contained in the message
   * bundle and the default key otherwise. This should be used to
   * select the most specific message key available.
   *
   * @param preferredKey a {@code String} value
   * @param defaultKey a {@code String} value
   * @return a {@code String} value
   */
  static getKey(preferredKey: string, defaultKey: string): string {
    if (Messages.containsKey(preferredKey)) {
      return preferredKey;
    } else {
      return defaultKey;
    }
  }
  static getBestDescription$ObjectWithId(object$: ObjectWithId): string {
    return Messages.getBestDescription$String(object$.getId());
  }
  static getBestDescription$String(id: string): string {
    let key = CollectionUtils.find$Stream$Predicate(CollectionUtils.map$ObjectArr$Function(Messages.DESCRIPTION_KEYS, (s) => id + s), (k) => Messages.containsKey(k));
    return (key == null) ? id : Messages.message$String(key);
  }
  /**
   * Get the name and best description for a given named object.
   *
   * Favour the .name form, but degrade gracefully if it is not present.
   * If .name is present, also look for a description.
   *
   * @param named The {@code Named} to look up.
   * @return A 2-member array of name and description found.
   */
  static getBestNameAndDescription$Named(named: Named): string[] {
    return Messages.getBestNameAndDescription$String(named.getNameKey());
  }
  /**
   * Get the name and best description for a given identifier.
   *
   * Favour the .name form, but degrade gracefully if it is not present.
   * If .name is present, also look for a description.
   *
   * @param id The identifier to look up.
   * @return A 2-member array of name and description found.
   */
  static getBestNameAndDescription$String(id: string): string[] {
    if (id != null && id.endsWith(Messages.NAME_SUFFIX)) {
      id = id.substring(0, (id.length - Messages.NAME_SUFFIX.length) | 0);
    }
    let name = (Messages.containsKey(Messages.nameKey$String(id))) ? Messages.getName$String(id) : null;
    let desc = null;
    if (name == null) {
      name = (Messages.containsKey(id)) ? Messages.message$String(id) : null;
      if (name == null) {
        name = id;
      }
    } else {
      desc = Messages.getBestDescription$String(id);
      if ($J.equals(id, desc)) {
        desc = null;
      }
    }
    return [name, desc];
  }
  /**
   * A predicate maker to match by message name.
   *
   * @param key The name of the message.
   * @return A suitable {@code Predicate}.
   */
  static matchesName(key: string): Predicate<string> {
    return CollectionUtils.matchKeyEquals$Object$Function(key, (k) => Messages.getName$String(k));
  }
  /**
   * A predicate maker to match named types.
   *
   * @param key The name of the type.
   * @return A suitable {@code Predicate}.
   */
  static matchesNamed(key: string): Predicate<Named> {
    return CollectionUtils.matchKeyEquals$Object$Function(key, (k) => Messages.getName$Named(k));
  }
  /**
   * Get a label for a collection of units given a name, type,
   * number, nation, role and extra annotation.
   *
   * @param name An optional unit name.
   * @param typeId The unit type identifier.
   * @param number The number of units.
   * @param nationId An optional nation identifier.
   * @param roleId The unit role identifier.
   * @param extra An optional extra annotation.
   * @return A {@code StringTemplate} to describe the given unit.
   */
  static getUnitLabel(name: string, typeId: string, number$: number, nationId: string, roleId: string, extra: StringTemplate): StringTemplate {
    let type$: StringTemplate;
    let roleKey: string;
    let baseKey = typeId + '.' + Role.getRoleIdSuffix(roleId);
    if (Messages.containsKey(baseKey)) {
      type$ = StringTemplate.template$String(baseKey).addAmount('%number%', number$);
      roleKey = null;
    } else {
      type$ = StringTemplate.template$String(Messages.nameKey$String(typeId)).addAmount('%number%', number$);
      roleKey = (Role.isDefaultRoleId(roleId)) ? null : roleId;
    }
    let ret: StringTemplate;
    if (name == null) {
      if (nationId == null) {
        if (roleKey == null) {
          if (extra == null) {
            ret = type$;
          } else {
            ret = StringTemplate.label('').addStringTemplate$StringTemplate(type$).addName$String(' (').addStringTemplate$StringTemplate(extra).addName$String(')');
          }
        } else {
          if (extra == null) {
            ret = StringTemplate.label('').add$String(Messages.nameKey$String(roleKey)).addName$String(' (').addStringTemplate$StringTemplate(type$).addName$String(')');
          } else {
            ret = StringTemplate.label('').add$String(Messages.nameKey$String(roleKey)).addName$String(' (').addStringTemplate$StringTemplate(type$).addName$String('/').addStringTemplate$StringTemplate(extra).addName$String(')');
          }
        }
      } else {
        if (roleKey == null) {
          if (extra == null) {
            ret = StringTemplate.label('').add$String(Messages.nameKey$String(nationId)).addName$String(' ').addStringTemplate$StringTemplate(type$);
          } else {
            ret = StringTemplate.label('').add$String(Messages.nameKey$String(nationId)).addName$String(' ').addStringTemplate$StringTemplate(type$).addName$String(' (').addStringTemplate$StringTemplate(extra).addName$String(')');
          }
        } else {
          if (extra == null) {
            ret = StringTemplate.label('').add$String(Messages.nameKey$String(nationId)).addName$String(' ').add$String(Messages.nameKey$String(roleKey)).addName$String(' (').addStringTemplate$StringTemplate(type$).addName$String(')');
          } else {
            ret = StringTemplate.label('').add$String(Messages.nameKey$String(nationId)).addName$String(' ').add$String(Messages.nameKey$String(roleKey)).addName$String(' (').addStringTemplate$StringTemplate(type$).addName$String('/').addStringTemplate$StringTemplate(extra).addName$String(')');
          }
        }
      }
    } else {
      if (nationId == null) {
        if (roleKey == null) {
          if (extra == null) {
            ret = StringTemplate.label('').addName$String(name).addName$String(' (').addStringTemplate$StringTemplate(type$).addName$String(')');
          } else {
            ret = StringTemplate.label('').addName$String(name).addName$String(' (').addStringTemplate$StringTemplate(type$).addName$String('/').addStringTemplate$StringTemplate(extra).addName$String(')');
          }
        } else {
          if (extra == null) {
            ret = StringTemplate.label('').addName$String(name).addName$String(' (').add$String(Messages.nameKey$String(roleKey)).addName$String('/').addStringTemplate$StringTemplate(type$).addName$String(')');
          } else {
            ret = StringTemplate.label('').addName$String(name).addName$String(' (').add$String(Messages.nameKey$String(roleKey)).addName$String('/').addStringTemplate$StringTemplate(type$).addName$String('/').addStringTemplate$StringTemplate(extra).addName$String(')');
          }
        }
      } else {
        if (roleKey == null) {
          if (extra == null) {
            ret = StringTemplate.label('').addName$String(name).addName$String(' (').add$String(Messages.nameKey$String(nationId)).addName$String(' ').addStringTemplate$StringTemplate(type$).addName$String(')');
          } else {
            ret = StringTemplate.label('').addName$String(name).addName$String(' (').add$String(Messages.nameKey$String(nationId)).addName$String(' ').addStringTemplate$StringTemplate(type$).addName$String('/').addStringTemplate$StringTemplate(extra).addName$String(')');
          }
        } else {
          if (extra == null) {
            ret = StringTemplate.label('').addName$String(name).addName$String(' (').add$String(Messages.nameKey$String(nationId)).addName$String(' ').add$String(Messages.nameKey$String(roleKey)).addName$String('/').addStringTemplate$StringTemplate(type$).addName$String(')');
          } else {
            ret = StringTemplate.label('').addName$String(name).addName$String(' (').add$String(Messages.nameKey$String(nationId)).addName$String(' ').add$String(Messages.nameKey$String(roleKey)).addName$String('/').addStringTemplate$StringTemplate(type$).addName$String('/').addStringTemplate$StringTemplate(extra).addName$String(')');
          }
        }
      }
    }
    return ret;
  }
  /**
   * Get the text mapping for a particular identifier in the
   * default locale message bundle.  Returns the key as the value if
   * there is no mapping found!
   *
   * @param messageId The key of the message to find.
   * @return String text mapping or the key
   */
  static message$String(messageId: string): string {
    if (messageId == null) {
      throw new NullPointerException('Message id must not be null!');
    }
    let message = Messages.messageBundle.get(messageId);
    if (message == null) {
      return messageId;
    }
    message = Messages.replaceChoices(message, null);
    return JString.trim(message);
  }
  /**
   * Localizes a StringTemplate.
   *
   * @param template The {@code StringTemplate} to localize.
   * @return The localized string.
   */
  static message$StringTemplate(template: StringTemplate): string {
    if (template == null) {
      return null;
    }
    let result = '';
    {
      let key: string;
      switch (template.getTemplateType()) {
        case StringTemplate$TemplateType.LABEL:
          if (template.isEmpty()) {
            result = Messages.message$String(template.getId());
          } else {
            let sb = new StringBuilder(64);
            for (const $it14 = template.entryList().iterator(); $it14.hasNext(); ) {
              let e = $it14.next();
              sb.append(template.getId()).append(Messages.message$StringTemplate(e.getValue()));
            }
            if (sb.length() >= template.getId().length) {
              result = sb.toString().substring(template.getId().length);
            } else {
              Messages.logger.warning('incorrect use of template ' + $J.str(template));
            }
          }
          break;
        case StringTemplate$TemplateType.TEMPLATE:
          if (Messages.containsKey(template.getId())) {
            result = Messages.messageBundle.get(template.getId());
          } else if (template.getDefaultId() != null) {
            result = Messages.messageBundle.get(template.getDefaultId());
          }
          result = Messages.replaceChoices(result, template);
          for (const $it15 = template.entryList().iterator(); $it15.hasNext(); ) {
            let e = $it15.next();
            if (e.getKey() != null) {
              result = JString.replace(result, e.getKey(), Messages.message$StringTemplate(e.getValue()));
            }
          }
          break;
        case StringTemplate$TemplateType.KEY:
          key = Messages.messageBundle.get(template.getId());
          result = (key == null) ? template.getId() : Messages.replaceChoices(key, null);
          break;
        case StringTemplate$TemplateType.NAME:
        default:
          result = template.getId();
          break;
      }
    }
    return result;
  }
  /**
   * Replace all choice formats in the given string, using keys and
   * replacement values from the given template, which may be null.
   *
   * A choice format is enclosed in double brackets and consists of
   * a tag, followed by a colon, followed by an optional selector,
   * followed by a pipe character, followed by one or several
   * choices separated by pipe characters. If there is only one
   * choice, it must be a message identifier or a
   * variable. Otherwise, each choice consists of a key and a value
   * separated by an assignment character. Example:
   * "{{tag:selector|key1=val1|key2=val2}}".
   *
   * @param input a {@code String} value
   * @param template a {@code StringTemplate} value
   * @return a {@code String} value
   */
  static replaceChoices(input: string, template: StringTemplate): string {
    let openChoice = 0;
    let closeChoice = 0;
    let highWaterMark = 0;
    let result = new StringBuilder();
    while ((openChoice = input.indexOf('{{', highWaterMark)) >= 0) {
      result.append(input.substring(highWaterMark, openChoice));
      closeChoice = Messages.findMatchingBracket(input, (openChoice + 2) | 0);
      if (closeChoice < 0) {
        Messages.logger.warning('Mismatched brackets: ' + input);
        return result.toString();
      }
      highWaterMark = (closeChoice + 2) | 0;
      let colonIndex = input.indexOf(String.fromCharCode(58 /* ':' */), (openChoice + 2) | 0);
      if (colonIndex < 0 || colonIndex > closeChoice) {
        Messages.logger.warning('No tag found: ' + input);
        continue;
      }
      let tag = input.substring((openChoice + 2) | 0, colonIndex);
      let pipeIndex = input.indexOf(String.fromCharCode(124 /* '|' */), (colonIndex + 1) | 0);
      if (pipeIndex < 0 || pipeIndex > closeChoice) {
        Messages.logger.warning('No choices found: ' + input);
        continue;
      }
      let selector = input.substring((colonIndex + 1) | 0, pipeIndex);
      if ((selector.length === 0)) {
        selector = 'default';
      } else if (selector.startsWith('%') && selector.endsWith('%')) {
        if (template == null) {
          selector = 'default';
        } else {
          let replacement = template.getReplacement(selector);
          if (replacement == null) {
            Messages.logger.warning('Failed to find replacement for ' + selector);
            continue;
          } else {
            selector = Messages.message$StringTemplate(replacement);
            let taggedSelector = Messages.getSelector(tag);
            if (taggedSelector != null) {
              selector = taggedSelector.getKey$String$String(selector, input);
            }
          }
        }
      } else {
        let taggedSelector = Messages.getSelector(tag);
        if (taggedSelector != null) {
          selector = taggedSelector.getKey$String$String(selector, input);
        }
      }
      let keyIndex = input.indexOf(selector, (pipeIndex + 1) | 0);
      if (keyIndex < 0 || keyIndex > closeChoice) {
        let otherKey = input.substring((pipeIndex + 1) | 0, closeChoice);
        if (template != null && otherKey.startsWith('%') && otherKey.endsWith('%')) {
          let replacement = template.getReplacement(otherKey);
          if (replacement == null) {
            Messages.logger.warning('Failed to find replacement for ' + selector + '/' + otherKey);
            continue;
          } else if (replacement.getTemplateType() === StringTemplate$TemplateType.KEY) {
            otherKey = Messages.messageBundle.get(replacement.getId());
            keyIndex = otherKey.indexOf('{{');
            if (keyIndex < 0) {
              result.append(otherKey);
            } else {
              keyIndex = otherKey.indexOf(selector, keyIndex);
              if (keyIndex < 0) {
                Messages.logger.warning('Failed to find key ' + selector + '/' + otherKey + ' in replacement ' + $J.str(replacement));
                continue;
              } else {
                result.append(Messages.getChoice(otherKey, selector));
              }
            }
          } else {
            Messages.logger.warning('Choice substitution for ' + selector + '/' + otherKey + ' attempted, but template was ' + $J.str(replacement) + ' for input ' + input);
            continue;
          }
        } else if (Messages.containsKey(otherKey)) {
          otherKey = Messages.getChoice(Messages.messageBundle.get(otherKey), selector);
          result.append(otherKey);
        } else {
          Messages.logger.warning('Unknown key or untagged choice: \'' + otherKey + '\', selector was \'' + selector + '\', trying \'default\' instead');
          let defaultStart = otherKey.indexOf('default=');
          if (defaultStart >= 0) {
            defaultStart = (defaultStart + 8) | 0;
            let defaultEnd = otherKey.indexOf(String.fromCharCode(124 /* '|' */), defaultStart);
            let defaultChoice: string;
            if (defaultEnd < 0) {
              defaultChoice = otherKey.substring(defaultStart);
            } else {
              defaultChoice = otherKey.substring(defaultStart, defaultEnd);
            }
            result.append(defaultChoice);
          } else {
            Messages.logger.warning('No default choice found.');
            continue;
          }
        }
      } else {
        let start = (keyIndex + selector.length + 1) | 0;
        let replacementIndex = input.indexOf(String.fromCharCode(124 /* '|' */), start);
        let nextOpenIndex = input.indexOf('{{', start);
        if (nextOpenIndex >= 0 && nextOpenIndex < replacementIndex) {
          replacementIndex = input.indexOf(String.fromCharCode(124 /* '|' */), ((Messages.findMatchingBracket(input, (nextOpenIndex + 2) | 0)) + 2) | 0);
        }
        let end = (replacementIndex < 0 || replacementIndex > closeChoice) ? closeChoice : replacementIndex;
        let replacement = input.substring(start, end);
        if (!replacement.includes('{{')) {
          result.append(replacement);
        } else {
          result.append(Messages.replaceChoices(replacement, template));
        }
      }
    }
    result.append(input.substring(highWaterMark));
    return result.toString();
  }
  /**
   * Return the choice tagged with the given key, or null, if the
   * given input string does not contain the key.
   *
   * @param input a {@code String} value
   * @param key a {@code String} value
   * @return a {@code String} value
   */
  static getChoice(input: string, key: string): string {
    let keyIndex = input.indexOf(key);
    if (keyIndex < 0) {
      return null;
    } else {
      let start = (keyIndex + key.length + 1) | 0;
      let end = input.indexOf(String.fromCharCode(124 /* '|' */), start);
      if (end < 0) {
        end = input.indexOf('}}', start);
        if (end < 0) {
          Messages.logger.warning('Failed to find end of choice for key ' + key + ' in input ' + input);
          return null;
        }
      }
      return input.substring(start, end);
    }
  }
  /**
   * Return the index of the matching pair of brackets, or -1 if
   * none is found.
   *
   * @param input a {@code String} value
   * @param start an {@code int} value
   * @return an {@code int} value
   */
  static findMatchingBracket(input: string, start: number): number {
    let last = 0;
    let level = 0;
    for (let index = start; index < input.length; index++) {
      switch (input.charCodeAt(index)) {
        case 123 /* '{' */:
          if (last === 123 /* '{' */) {
            last = 0;
            level++;
          } else {
            last = 123 /* '{' */;
          }
          break;
        case 125 /* '}' */:
          if (last === 125 /* '}' */) {
            if (level === 0) {
              return (index - 1) | 0;
            } else {
              last = 0;
              level--;
            }
          } else {
            last = 125 /* '}' */;
          }
          break;
        default:
          break;
      }
    }
    return -1;
  }
  static $clinit() {
    Messages.logger = Logger.getLogger($J.cls(Messages).getName());
    Messages.DESCRIPTION_KEYS = [Messages.DESCRIPTION_SUFFIX, Messages.SHORT_DESCRIPTION_SUFFIX, Messages.NAME_SUFFIX];
    Messages.messageBundle = new HashMap();
    Messages.tagMap = new HashMap();
  }
}

$J.define(Messages, 'net.sf.freecol.common.i18n.Messages', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_Messages' }, meths: { 'message(net.sf.freecol.common.model.StringTemplate)': 'message$StringTemplate', 'message(java.lang.String)': 'message$String', 'getBestNameAndDescription(java.lang.String)': 'getBestNameAndDescription$String', 'getBestNameAndDescription(net.sf.freecol.common.model.Named)': 'getBestNameAndDescription$Named', 'getBestDescription(java.lang.String)': 'getBestDescription$String', 'getBestDescription(net.sf.freecol.common.ObjectWithId)': 'getBestDescription$ObjectWithId', 'getShortDescription(net.sf.freecol.common.ObjectWithId)': 'getShortDescription$ObjectWithId', 'getShortDescription(java.lang.String)': 'getShortDescription$String', 'getDescription(net.sf.freecol.common.ObjectWithId)': 'getDescription$ObjectWithId', 'getDescription(java.lang.String)': 'getDescription$String', 'descriptionKey(net.sf.freecol.common.ObjectWithId)': 'descriptionKey$ObjectWithId', 'descriptionKey(java.lang.String)': 'descriptionKey$String', 'getName(net.sf.freecol.common.model.Named)': 'getName$Named', 'getName(java.lang.String)': 'getName$String', 'nameKey(net.sf.freecol.common.ObjectWithId)': 'nameKey$ObjectWithId', 'nameKey(java.lang.String)': 'nameKey$String' }, clinit: true, lazy: ['logger', 'DESCRIPTION_KEYS', 'messageBundle', 'tagMap'] });
$J.module(() => {
  UIManager = $J.load('javax.swing.UIManager');
  NumberRules = $J.load('net.sf.freecol.common.i18n.NumberRules');
  FreeColDirectories = $J.load('net.sf.freecol.common.io.FreeColDirectories');
  FreeColModFile = $J.load('net.sf.freecol.common.io.FreeColModFile');
  FreeColRules = $J.load('net.sf.freecol.common.io.FreeColRules');
  Role = $J.load('net.sf.freecol.common.model.Role');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  StringTemplate$TemplateType = $J.load('net.sf.freecol.common.model.StringTemplate$TemplateType');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  LogBuilder = $J.load('net.sf.freecol.common.util.LogBuilder');
  StringUtils = $J.load('net.sf.freecol.common.util.StringUtils');
});
