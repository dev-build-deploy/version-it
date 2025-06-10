/*
 * SPDX-FileCopyrightText: 2023 Kevin de Jong <monkaii@hotmail.com>
 * SPDX-License-Identifier: MIT
 */

import { IVersion } from "./interfaces";
import { compareModifiers, getModifiers, incrementModifier, Modifier, modifiersToString } from "./modifiers";

const SEMVER_REGEX =
  /^(?<major>0|[1-9]\d*)\.(?<minor>0|[1-9]\d*)\.(?<patch>0|[1-9]\d*)(?:-(?<prerelease>(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+(?<buildmetadata>[0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

type SemVerVersionCore = "major" | "minor" | "patch";

/**
 * SemVer increment types
 * @type SemVerIncrement
 * @member major Major version
 * @member minor Minor version
 * @member patch Patch version
 * @member preRelease Pre-release identifier
 */
export type SemVerIncrement = "MAJOR" | "MINOR" | "PATCH" | "PRERELEASE";

/**
 * A simple SemVer implementation
 * @interface ISemVer
 * @member major Major version
 * @member minor Minor version
 * @member patch Patch version
 * @member preRelease Pre-release identifier
 * @member build Build identifier
 */
export interface ISemVer {
  prefix?: string;
  major: number;
  minor: number;
  patch: number;
  preReleases: Modifier[];
  build?: string;
}

/**
 * A simple SemVer implementation
 * @class SemVer
 * @implements ISemVer
 * @member major Major version
 * @member minor Minor version
 * @member patch Patch version
 * @member preRelease Pre-release identifier
 * @member build Build identifier
 * @method toString Returns the SemVer as a string
 */
export class SemVer implements IVersion<SemVer, SemVerIncrement>, ISemVer {
  prefix?: string;
  major: number;
  minor: number;
  patch: number;
  preReleases: Modifier[];
  build?: string;

  constructor(version?: Partial<ISemVer>) {
    this.prefix = version?.prefix;
    this.major = version?.major ?? 0;
    this.minor = version?.minor ?? 0;
    this.patch = version?.patch ?? 0;
    this.preReleases = version?.preReleases ?? [];
    this.build = version?.build;
  }

  /**
   * Creates a SemVer object from a string
   * @param version Version string
   * @param prefix Prefix associated with the version
   * @returns SemVer or null if the version string is invalid
   */
  static fromString(version: string, prefix?: string): SemVer | null {
    // Handle prefix
    if (prefix !== undefined) {
      if (!version.startsWith(prefix)) return null;
      version = version.substring(prefix.length);
    }

    // SemVer regex
    const groups = SEMVER_REGEX.exec(version)?.groups;
    if (groups === undefined) return null;

    const semver: ISemVer = {
      prefix,
      major: parseInt(groups.major),
      minor: parseInt(groups.minor),
      patch: parseInt(groups.patch),
      preReleases: getModifiers(groups.prerelease),
      build: groups.buildmetadata,
    };

    return new SemVer(semver);
  }

  /**
   * Increments the SemVer based on the provided type:
   * - major: 1.0.0 => 2.0.0
   * - minor: 1.0.0 => 1.1.0
   * - patch: 1.0.0 => 1.0.1
   * - preRelease: 1.0.0 => 1.0.0-rc.1
   *
   * Incrementing a type will reset any lesser significant types (e.g. incrementing minor will reset patch, preRelease).
   *   order of significance: major > minor > patch > preRelease
   *
   * @param type Type of increment
   * @param modifier Modifier to increment
   * @returns Incremented SemVer
   */
  increment(type: SemVerIncrement, modifier?: string): SemVer {
    switch (type) {
      case "PRERELEASE":
        return new SemVer({
          ...this,
          preReleases: incrementModifier(this.preReleases, modifier ?? "rc"),
          build: undefined,
        });
      case "MAJOR":
        return new SemVer({ prefix: this.prefix, major: this.major + 1 });
      case "MINOR":
        return new SemVer({ prefix: this.prefix, major: this.major, minor: this.minor + 1 });
      case "PATCH":
        return new SemVer({ prefix: this.prefix, major: this.major, minor: this.minor, patch: this.patch + 1 });
    }
  }

  /**
   * Returns 0 when current version is equal to the provided version,
   * 1 when current version is greater than the provided version,
   * and -1 when current version is less than the provided version.
   *
   * Resulting in the following ordering:
   *
   * 0.0.1
   * 0.0.2
   * 0.1.0
   * 0.2.0-rc.1
   * 0.2.0-rc.2
   * 0.2.0
   * 0.2.0+build.1
   * 0.2.0+build.2
   * 0.2.1-rc.1+build.1
   * 0.2.1-rc.1+build.2
   * 0.2.1-rc.2
   * 1.0.0
   *
   * @param other SemVer to compare to
   * @returns
   */
  compareTo(other: ISemVer): number {
    const keys: SemVerVersionCore[] = ["major", "minor", "patch"];

    // 0.0.1 < 0.1.0 < 1.0.0
    for (const key of keys) {
      if (this[key] !== other[key]) {
        return this[key] > other[key] ? 1 : -1;
      }
    }

    return compareModifiers(this.preReleases, other.preReleases);
  }

  /**
   * Compares to Semantic Versions and returns true if they are equal
   * @param other Other Semantic Version
   * @returns True if the versions are equal, false otherwise
   */
  isEqualTo(other: ISemVer): boolean {
    return this.compareTo(other) === 0;
  }

  /**
   * Compares to Semantic Versions and returns true if the current version is greater than the other version
   * @param other Other Semantic Version
   * @returns True if the current version is greater than the other version, false otherwise
   */
  isGreaterThan(other: ISemVer): boolean {
    return this.compareTo(other) === 1;
  }

  /**
   * Compares to Semantic Versions and returns true if the current version is less than the other version
   * @param other Other Semantic Version
   * @returns True if the current version is less than the other version, false otherwise
   */
  isLessThan(other: ISemVer): boolean {
    return this.compareTo(other) === -1;
  }

  /**
   * Returns the SemVer as a string
   * @returns SemVer as a string
   */
  toString(): string {
    const build = this.build ? "+" + this.build : "";
    const prereleases = modifiersToString(this.preReleases);

    return `${this.prefix ?? ""}${this.major}.${this.minor}.${this.patch}${prereleases}${build}`;
  }
}
