/*
SPDX-FileCopyrightText: 2023 Kevin de Jong <monkaii@hotmail.com>

SPDX-License-Identifier: GPL-3.0-or-later
*/

import assert from "assert";
import { IVersion } from "./interfaces";
import { getKeyValuePair } from "./utils";

const SEMVER_REGEX =
  /^(?<major>\d+)\.(?<minor>\d+)\.(?<patch>\d+)(-(?<preRelease>[a-zA-Z0-9.-]+))?(\+(?<build>[a-zA-Z0-9.-]+))?$/;

type SemVerIdentifier = "preRelease" | "build";
type SemVerVersionCore = "major" | "minor" | "patch";

/**
 * A simple SemVer implementation
 * @interface ISemVer
 * @member major Major version
 * @member minor Minor version
 * @member patch Patch version
 * @member preRelease Pre-release identifier
 * @member build Build identifier
 * @method toString Returns the SemVer as a string
 */
export interface ISemVer {
  prefix?: string;
  major: number;
  minor: number;
  patch: number;
  preRelease?: string;
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
 * @throws Error Unable to parse version
 */
export class SemVer implements IVersion<SemVer, keyof ISemVer>, ISemVer {
  prefix?: string;
  major: number;
  minor: number;
  patch: number;
  preRelease?: string;
  build?: string;

  constructor(version?: string | Partial<ISemVer>, prefix?: string) {
    if (typeof version === "string") {
      // Handle prefix
      if (prefix !== undefined) {
        if (!version.startsWith(prefix)) throw new Error("Incorrect SemVer, missing prefix");
        version = version.substring(prefix.length);
      }

      // SemVer regex
      const groups = SEMVER_REGEX.exec(version)?.groups;
      if (groups === undefined) throw new Error("Could not parse SemVer");

      this.prefix = prefix;
      this.major = parseInt(groups.major);
      this.minor = parseInt(groups.minor);
      this.patch = parseInt(groups.patch);
      this.preRelease = groups.preRelease;
      this.build = groups.build;
    } else {
      this.prefix = version?.prefix ?? prefix;
      this.major = version?.major ?? 0;
      this.minor = version?.minor ?? 0;
      this.patch = version?.patch ?? 0;
      this.preRelease = version?.preRelease;
      this.build = version?.build;
    }
  }

  /**
   * Increments the value of the SemVer identifier
   * @param identifier Identifier to increment
   * @returns Incremented identifier, undefined when identifier does not exist
   */
  private incrementIdentifier(identifier: SemVerIdentifier): string | undefined {
    if (this[identifier] === undefined) return;

    const keyValuePair = getKeyValuePair(this[identifier]);
    if (keyValuePair?.key === undefined || keyValuePair?.value === undefined)
      throw new Error(`Unable to bump ${identifier}`);

    return `${keyValuePair.key}.${keyValuePair.value + 1}`;
  }

  /**
   * Increments the SemVer based on the provided type:
   * - major: 1.0.0 => 2.0.0
   * - minor: 1.0.0 => 1.1.0
   * - patch: 1.0.0 => 1.0.1
   * - preRelease: 1.0.0 => 1.0.0-rc.1
   * - build: 1.0.0 => 1.0.0+build.1
   *
   * Incrementing a type will reset any lesser significant types (e.g. incrementing minor will reset patch, preRelease, and build).
   *   order of significance: major > minor > patch > preRelease > build
   *
   * @param type Type of increment
   * @returns Incremented SemVer
   */
  increment(type: keyof ISemVer): SemVer {
    switch (type) {
      case "preRelease":
        return new SemVer({ ...this, preRelease: this.incrementIdentifier(type) ?? "rc.1", build: undefined });
      case "build":
        return new SemVer({ ...this, preRelease: this.preRelease, build: this.incrementIdentifier(type) ?? "build.1" });
      case "major":
        return new SemVer({ prefix: this.prefix, major: this.major + 1 });
      case "minor":
        return new SemVer({ prefix: this.prefix, major: this.major, minor: this.minor + 1 });
      case "patch":
        return new SemVer({ prefix: this.prefix, major: this.major, minor: this.minor, patch: this.patch + 1 });
      case "prefix":
        throw new Error("Unable to increment prefix");
    }
  }

  compareIdentifier(a?: string, b?: string): number {
    if (a === b) return 0;
    if (!a) return -1;
    if (!b) return 1;

    const aId = getKeyValuePair(a);
    const bId = getKeyValuePair(b);

    if (!aId) return bId ? -1 : a.localeCompare(b);
    if (!bId) return 1;

    if (aId.key !== bId.key) return a.localeCompare(b);
    if (aId.value !== bId.value) {
      assert(aId.value !== undefined && bId.value !== undefined);
      return aId.value > bId.value ? 1 : -1;
    }

    return 0;
  }

  /**
   * Function which returns 0 when current version is equal to the provided version,
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

    for (const key of keys) {
      if (this[key] !== other[key]) {
        return this[key] > other[key] ? 1 : -1;
      }
    }

    // undefined, prerelease, build, prerelease + build
    // prerelease
    // build
    // prerelease + build
    const mapping = [
      [0, 1, -1, 1],
      [
        -1,
        this.compareIdentifier(this.preRelease, other.preRelease),
        -1,
        this.compareIdentifier(this.preRelease, other.preRelease) === 0
          ? this.compareIdentifier(this.build, other.build)
          : this.compareIdentifier(this.preRelease, other.preRelease),
      ],
      [1, 1, this.compareIdentifier(this.build, other.build), 1],
      [
        -1,
        this.compareIdentifier(this.preRelease, other.preRelease) === 0
          ? 1
          : this.compareIdentifier(this.preRelease, other.preRelease),
        -1,
        this.compareIdentifier(this.preRelease, other.preRelease) === 0
          ? this.compareIdentifier(this.build, other.build)
          : this.compareIdentifier(this.preRelease, other.preRelease),
      ],
    ];

    const getIndex = (item: ISemVer) =>
      !item.preRelease && !item.build ? 0 : item.preRelease && !item.build ? 1 : !item.preRelease && item.build ? 2 : 3;

    return mapping[getIndex(this)][getIndex(other)];
  }

  isEqualTo(other: ISemVer): boolean {
    return this.compareTo(other) === 0;
  }

  isGreaterThan(other: ISemVer): boolean {
    return this.compareTo(other) === 1;
  }

  isLessThan(other: ISemVer): boolean {
    return this.compareTo(other) === -1;
  }

  /**
   * Returns the SemVer as a string
   * @returns SemVer as a string
   */
  toString(): string {
    return `${this.prefix !== undefined ? this.prefix : ""}${this.major}.${this.minor}.${this.patch}${
      this.preRelease ? "-" + this.preRelease : ""
    }${this.build ? "+" + this.build : ""}`;
  }
}
