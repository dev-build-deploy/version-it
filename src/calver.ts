/*
SPDX-FileCopyrightText: 2023 Kevin de Jong <monkaii@hotmail.com>
SPDX-License-Identifier: MIT
*/

import { IVersion } from "./interfaces";
import { getISO8601WeekNumber, getKeyValuePair } from "./utils";

/**
 * CalVer formats
 * @type CalVerFormat
 * @member YYYY Year (e.g. 2022)
 * @member YY Year (e.g. 22)
 * @member 0Y Year (e.g. 22)
 * @member MM Month (e.g. 1)
 * @member 0M Month (e.g. 01)
 * @member WW Week (e.g. 1)
 * @member 0W Week (e.g. 01)
 * @member DD Day (e.g. 1)
 * @member 0D Day (e.g. 01)
 * @member MAJOR Major version
 * @member MINOR Minor version
 * @member MICRO Micro version
 */
type CalVerFormat = "YYYY" | "YY" | "0Y" | "MM" | "0M" | "WW" | "0W" | "DD" | "0D" | "MAJOR" | "MINOR" | "MICRO";

/**
 * CalVer increments
 * @type CalVerIncrement
 * @member calendar Increments the calendar (i.e. YYYY, MM, WW, DD)
 * @member major Increments the major version
 * @member minor Increments the minor version
 * @member micro Increments the micro version
 * @member modifier Increments the modifier
 */
export type CalVerIncrement = "CALENDAR" | "MAJOR" | "MINOR" | "MICRO" | "MODIFIER";

/**
 * CalVer format
 * @interface IFormat
 * @member regex Regex used to parse the CalVer
 * @member major Major version format
 * @member minor Minor version format
 * @member micro Micro version format
 */
export interface IFormat {
  regex: RegExp;
  major: CalVerFormat;
  minor: CalVerFormat;
  micro?: CalVerFormat;
}

/**
 * A simple CalVer implementation
 * @interface ICalVer
 * @member major Major version
 * @member minor Minor version
 * @member micro Micro version
 * @member modifier Modifier
 * @member prefix Prefix
 */
export interface ICalVer {
  prefix?: string;
  major: number;
  minor: number;
  micro?: number;
  modifier?: string;
}

/**
 * A simple CalVer implementation
 * @class CalVer
 * @member major Major version
 * @member minor Minor version
 * @member micro Micro version
 * @member modifier Modifier
 * @method toString Returns the CalVer as a string
 * @method increment Increments the CalVer by the provided type
 */
export class CalVer implements IVersion<CalVer, CalVerIncrement>, ICalVer {
  prefix?: string;
  major: number;
  minor: number;
  micro?: number;
  modifier?: string;
  format: IFormat;

  constructor(format: string | IFormat, version?: string | Partial<ICalVer>, prefix?: string) {
    this.format = typeof format === "string" ? formatFromString(format) : format;

    if (typeof version === "string") {
      if (prefix !== undefined) {
        if (!version.startsWith(prefix)) throw new Error("Incorrect CalVer, missing prefix");
        version = version.substring(prefix.length);
      }

      const groups = this.format.regex.exec(version)?.groups;
      if (groups === undefined) {
        throw new Error("Could not parse CalVer");
      }

      this.prefix = prefix;
      this.major = parseInt(groups.major);
      this.minor = parseInt(groups.minor);
      this.micro = parseInt(groups.micro);
      this.modifier = groups.modifier;
    } else {
      this.prefix = version?.prefix ?? prefix;
      this.major = version?.major ?? 0;
      this.minor = version?.minor ?? 0;
      this.micro = version?.micro ?? (this.format.micro ? 0 : undefined);
      this.modifier = version?.modifier ?? undefined;
    }
  }

  /**
   * Increments the modifier (in format "key.value") by 1.
   * If no modifier is available, it will return "build.1"
   * @returns Incremented modifier
   */
  private incrementModifier(): string | undefined {
    if (this.modifier === undefined) return "build.1";

    const keyValue = getKeyValuePair(this.modifier);
    if (keyValue === undefined) throw new Error("Cannot increment modifiers without a key/value pair");

    return `${keyValue.key}.${keyValue.value + 1}`;
  }

  /**
   * Updates versions associated with calendar items (i.e. YYYY, MM, WW, DD)
   * in the provided CalVer format.
   * @param format The CalVer format
   * @returns The updated version based on the current date.
   */
  private updateCalendar(format?: CalVerFormat): number | undefined {
    if (format === undefined || ["MAJOR", "MINOR", "MICRO"].includes(format)) return;

    if (format.includes("Y")) return new Date().getFullYear();
    if (format.includes("M")) return new Date().getMonth() + 1;
    if (format.includes("W")) return getISO8601WeekNumber();
    if (format.includes("D")) return new Date().getDate() + 1;

    return;
  }

  /**
   * Returns a string, where the value is formatted correctly based on the provided format.
   * @param value Value to format
   * @param format CalVer format to use
   * @returns Formatted value
   */
  private formatVersionCore(value: number, format: CalVerFormat) {
    if (["MAJOR", "MINOR", "MICRO"].includes(format)) return value.toString();
    if (format === "YYYY") return value.toString().padStart(4, "0");
    if (format === "0Y")
      return value
        .toString()
        .substring(value.toString().length - 3)
        .padStart(3, "0");
    if (format.includes("0"))
      return value
        .toString()
        .substring(value.toString().length - 2)
        .padStart(2, "0");

    return value.toString().substring(value.toString().length - 2);
  }

  /**
   * Returns the CalVer as a string
   * @returns CalVer as a string
   */
  toString(): string {
    let version = this.prefix ?? "";

    version += `${this.formatVersionCore(this.major, this.format.major)}.${this.formatVersionCore(
      this.minor,
      this.format.minor
    )}`;

    if (this.micro !== undefined && this.format.micro !== undefined)
      version += `.${this.formatVersionCore(this.micro, this.format.micro)}`;

    if (this.modifier !== undefined) version += `-${this.modifier}`;

    return version;
  }

  /**
   * Increments the CalVer by the provided type;
   *   - "calendar": Increments the calendar (i.e. YYYY, MM, WW, DD)
   *   - "major": Increments the major version
   *   - "minor": Increments the minor version
   *   - "micro": Increments the micro version
   *   - "modifier": Increments the modifier
   * @param type Type of increment
   * @returns Incremented CalVer
   */
  increment(type: CalVerIncrement): CalVer {
    switch (type) {
      case "CALENDAR": {
        // Increment the calendar only, this allows us to validate whether the calendar has changed
        const newVersion = new CalVer(this.format, {
          prefix: this.prefix,
          major: this.updateCalendar(this.format.major) ?? this.major,
          minor: this.updateCalendar(this.format.minor) ?? this.minor,
          micro: this.updateCalendar(this.format.micro) ?? this.micro,
          modifier: this.modifier,
        });

        // Increment the modifier if the calendar has not changed
        if (newVersion.isEqualTo(this)) return new CalVer(this.format, { ...this, modifier: this.incrementModifier() });

        // If the calendar items are updated, reset MAJOR, MINOR, MICRO...
        for (const subtype of ["major", "minor", "micro"] as (keyof ICalVer)[]) {
          const filter = Object.keys(this.format).filter(
            key => this.format[key as keyof IFormat] === subtype.toUpperCase()
          );
          if (filter.length !== 1) continue;

          newVersion[filter[0].toLowerCase() as "major" | "minor" | "micro"] = 0;
        }
        // ... and MODIFIER
        newVersion.modifier = undefined;

        return newVersion;
      }

      case "MAJOR":
      case "MINOR":
      case "MICRO": {
        const filter = Object.keys(this.format).filter(key => this.format[key as keyof IFormat] === type.toUpperCase());
        if (filter.length !== 1) throw new Error(`Unable to increment ${type} version as it is not part of the format`);

        const item = filter[0].toLowerCase() as "major" | "minor" | "micro";
        if (item === "major") return new CalVer(this.format, { major: this.major + 1, modifier: undefined });
        if (item === "minor")
          return new CalVer(this.format, { major: this.major, minor: this.minor + 1, modifier: undefined });
        if (item === "micro")
          return new CalVer(this.format, {
            major: this.major,
            minor: this.minor,
            micro: (this.micro ?? 0) + 1,
            modifier: undefined,
          });
        throw new Error("Unknown increment type.");
      }
      case "MODIFIER":
        return new CalVer(this.format, { ...this, modifier: this.incrementModifier() });
    }
  }

  /**
   * Confirms that the provided format is identical to the current format
   * @param other Other format to compare against
   * @returns True if the formats are identical, false otherwise
   */
  private isFormatIdentical(other: IFormat): boolean {
    return this.format.major === other.major && this.format.minor === other.minor && this.format.micro === other.micro;
  }

  isEqualTo(other: CalVer): boolean {
    return this.compareTo(other) === 0;
  }
  isGreaterThan(other: CalVer): boolean {
    return this.compareTo(other) === 1;
  }
  isLessThan(other: CalVer): boolean {
    return this.compareTo(other) === -1;
  }

  /**
   * Returns 0 when current version is equal to the provided version,
   * 1 when current version is greater than the provided version,
   * and -1 when current version is less than the provided version.
   *
   * Resulting in the following ordering (taking `YYYY.0M.MICRO` as an example):
   *
   * 2022.03.1
   * 2022.03.2
   * 2022.11.1
   * 2022.11.1-alpha.1
   * 2022.11.1-alpha.2
   * 2022.11.1-beta.1
   * 2022.11.2
   * 2023.01.1
   *
   * @param other CalVer to compare to
   * @returns
   */
  compareTo(other: CalVer): number {
    if (!this.isFormatIdentical(other.format)) throw new Error("Unable to compare CalVer with different formats");

    if (this.major > other.major) return 1;
    if (this.major < other.major) return -1;

    if (this.minor > other.minor) return 1;
    if (this.minor < other.minor) return -1;

    if (this.micro !== undefined && other.micro !== undefined) {
      if (this.micro > other.micro) return 1;
      if (this.micro < other.micro) return -1;
    }

    if (this.modifier !== undefined && other.modifier === undefined) return 1;
    if (this.modifier === undefined && other.modifier !== undefined) return -1;

    if (this.modifier !== undefined && other.modifier !== undefined) {
      const aModifier = getKeyValuePair(this.modifier);
      const bModifier = getKeyValuePair(other.modifier);
      if (aModifier !== undefined && bModifier !== undefined) {
        if (aModifier.key !== bModifier.key) return aModifier.key.localeCompare(bModifier.key);
        if (aModifier.value > bModifier.value) return 1;
        if (aModifier.value < bModifier.value) return -1;
      } else {
        return this.modifier.localeCompare(other.modifier);
      }
    }

    return 0;
  }
}

/**
 * Generates a regex based on the provided CalVer format
 * @param format The CalVer format
 * @returns The regex
 * @internal
 */
export function formatFromString(format: string): IFormat {
  const elements = /^(?<major>[A-Z0]+)\.(?<minor>[A-Z0]+)(\.(?<micro>[A-Z0]+))?$/.exec(format)?.groups;
  if (elements === undefined) throw new Error(`Invalid CalVer format: ${format}`);

  const usedElements: string[] = [];
  const versions: string[] = [];
  for (const key of Object.keys(elements)) {
    if (elements[key] === undefined) continue;

    if (usedElements.includes(elements[key])) {
      throw new Error(`Duplicate CalVer format element: ${elements[key]}`);
    }

    if (["MAJOR", "MINOR", "MICRO"].includes(elements[key])) versions.push(`(?<${key}>\\d+)`);
    else if (elements[key] === "YYYY") versions.push(`(?<${key}>\\d{4})`);
    else if (elements[key] === "YY") versions.push(`(?<${key}>\\d{1,3})`);
    else if (elements[key] === "0Y") versions.push(`(?<${key}>\\d{3})`);
    else if (["0M", "0W", "0D"].includes(elements[key])) versions.push(`(?<${key}>\\d{2})`);
    else if (["MM", "WW", "DD"].includes(elements[key])) versions.push(`(?<${key}>\\d{1,2})`);
    else throw new Error(`Unknown CalVer format element: ${elements}, ${key}, ${elements[key]}`);

    usedElements.push(elements[key]);
  }

  return {
    regex: new RegExp(`^${versions.join(".")}(-(?<modifier>[\\w._]+))?$`),
    major: elements.major as CalVerFormat,
    minor: elements.minor as CalVerFormat,
    micro: elements.micro as CalVerFormat,
  };
}
