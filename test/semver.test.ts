/*
 * SPDX-FileCopyrightText: 2023 Kevin de Jong <monkaii@hotmail.com>
 * SPDX-License-Identifier: MIT
 */

import { SemVer } from "../src/semver";

describe("String to SemVer", () => {
  test("Versions", () => {
    const versions = [
      "0.0.1",
      "0.1.0",
      "0.1.1-rc.1",
      "0.1.1",
      "0.2.0",
      "1.0.0-rc.1",
      "1.0.0-rc.1+build.1",
      "1.0.0-rc.1+build.2",
      "1.0.0-rc.2",
      "1.0.0",
    ];
    versions.forEach(v => {
      expect(SemVer.fromString(v)?.toString()).toBe(v);
    });
  });

  test("Bad Versions", () => {
    const versions = ["0.0.1.1", "0.1.x", "0.1.1?rc.1", "v87", "2023-02-02"];
    versions.forEach(v => {
      expect(() => {
        SemVer.fromString(v);
      }).toThrow();
    });
  });
});

describe("Comparators", () => {
  test("isEqualTo", () => {
    expect(SemVer.fromString("1.0.0")?.isEqualTo(SemVer.fromString("1.0.0"))).toBe(true);
    expect(SemVer.fromString("1.0.0-rc.1")?.isEqualTo(SemVer.fromString("1.0.0-rc.1"))).toBe(true);
    expect(SemVer.fromString("1.0.0-rc.1")?.isEqualTo(SemVer.fromString("1.0.0"))).toBe(false);
    expect(SemVer.fromString("1.0.1")?.isEqualTo(SemVer.fromString("1.0.0"))).toBe(false);
    expect(SemVer.fromString("1.0.0-rc.1+build.1")?.isEqualTo(SemVer.fromString("1.0.0-rc.1"))).toBe(true);
  });

  test("isGreaterThan", () => {
    expect(SemVer.fromString("1.0.0")?.isGreaterThan(SemVer.fromString("1.0.0"))).toBe(false);
    expect(SemVer.fromString("1.0.0")?.isGreaterThan(SemVer.fromString("1.0.0-rc.1"))).toBe(true);
    expect(SemVer.fromString("1.0.0-rc.1")?.isGreaterThan(SemVer.fromString("1.0.0-rc.2"))).toBe(false);
    expect(SemVer.fromString("1.0.0-rc.1+build.1")?.isGreaterThan(SemVer.fromString("1.0.0-rc.1"))).toBe(false);
  });

  test("isLessThan", () => {
    expect(SemVer.fromString("1.0.0")?.isLessThan(SemVer.fromString("1.0.0"))).toBe(false);
    expect(SemVer.fromString("1.0.0")?.isLessThan(SemVer.fromString("1.0.0-rc.1"))).toBe(false);
    expect(SemVer.fromString("1.0.0-rc.1")?.isLessThan(SemVer.fromString("1.0.0-rc.2"))).toBe(true);
    expect(SemVer.fromString("1.0.0-rc.1+build.1")?.isLessThan(SemVer.fromString("1.0.0-rc.1"))).toBe(false);
  });

  test("Exhaustive compare", () => {
    const versions = [
      ["0.0.2", "0.0.1", 1],
      ["0.0.2", "0.0.2", 0],
      ["0.0.2", "0.0.3", -1],
      ["0.0.2", "0.0.2-rc.1", 1],
      ["0.0.2", "0.0.2-rc.2", 1],
      ["0.0.2", "0.0.2-rc.3", 1],
      ["0.0.2", "0.0.2+build.1", 0],
      ["0.0.2", "0.0.2+build.2", 0],
      ["0.0.2", "0.0.2+build.3", 0],
      ["0.0.2", "0.0.2-rc.1+build.1", 1],
      ["0.0.2", "0.0.2-rc.2+build.1", 1],
      ["0.0.2", "0.0.2-rc.3+build.1", 1],
      ["0.0.2", "0.0.2-rc.1+build.2", 1],
      ["0.0.2", "0.0.2-rc.2+build.2", 1],
      ["0.0.2", "0.0.2-rc.3+build.2", 1],
      ["0.0.2", "0.0.2-rc.1+build.3", 1],
      ["0.0.2", "0.0.2-rc.2+build.3", 1],
      ["0.0.2", "0.0.2-rc.3+build.3", 1],

      ["0.0.2-rc.2", "0.0.1", 1],
      ["0.0.2-rc.2", "0.0.2", -1],
      ["0.0.2-rc.2", "0.0.3", -1],
      ["0.0.2-rc.2", "0.0.2-rc.1", 1],
      ["0.0.2-rc.2", "0.0.2-rc.2", 0],
      ["0.0.2-rc.2", "0.0.2-rc.3", -1],
      ["0.0.2-rc.2", "0.0.2+build.1", -1],
      ["0.0.2-rc.2", "0.0.2+build.2", -1],
      ["0.0.2-rc.2", "0.0.2+build.3", -1],
      ["0.0.2-rc.2", "0.0.2-rc.1+build.1", 1],
      ["0.0.2-rc.2", "0.0.2-rc.2+build.1", 0],
      ["0.0.2-rc.2", "0.0.2-rc.3+build.1", -1],
      ["0.0.2-rc.2", "0.0.2-rc.1+build.2", 1],
      ["0.0.2-rc.2", "0.0.2-rc.2+build.2", 0],
      ["0.0.2-rc.2", "0.0.2-rc.3+build.2", -1],
      ["0.0.2-rc.2", "0.0.2-rc.1+build.3", 1],
      ["0.0.2-rc.2", "0.0.2-rc.2+build.3", 0],
      ["0.0.2-rc.2", "0.0.2-rc.3+build.3", -1],
      ["0.0.2-rc.2", "0.0.2-alpha.1", 1],
      ["0.0.2-rc.2", "0.0.2-zeta.1", -1],

      ["0.0.2+build.2", "0.0.1", 1],
      ["0.0.2+build.2", "0.0.3", -1],
      ["0.0.2+build.2", "0.0.2-rc.1", 1],
      ["0.0.2+build.2", "0.0.2-rc.2", 1],
      ["0.0.2+build.2", "0.0.2-rc.3", 1],
      ["0.0.2+build.2", "0.0.2+build.1", 0],
      ["0.0.2+build.2", "0.0.2+build.2", 0],
      ["0.0.2+build.2", "0.0.2+build.3", 0],
      ["0.0.2+build.2", "0.0.2+alpha.2", 0],
      ["0.0.2+build.2", "0.0.2+zeta.2", 0],
      ["0.0.2+build.2", "0.0.2-rc.1+build.1", 1],
      ["0.0.2+build.2", "0.0.2-rc.2+build.1", 1],
      ["0.0.2+build.2", "0.0.2-rc.3+build.1", 1],
      ["0.0.2+build.2", "0.0.2-rc.1+build.2", 1],
      ["0.0.2+build.2", "0.0.2-rc.2+build.2", 1],
      ["0.0.2+build.2", "0.0.2-rc.3+build.2", 1],
      ["0.0.2+build.2", "0.0.2-rc.1+build.3", 1],
      ["0.0.2+build.2", "0.0.2-rc.2+build.3", 1],
      ["0.0.2+build.2", "0.0.2-rc.3+build.3", 1],
      ["0.0.2+build.2", "0.0.2-rc.3+build.3", 1],

      ["0.0.2-rc.2+build.2", "0.0.1", 1],
      ["0.0.2-rc.2+build.2", "0.0.2", -1],
      ["0.0.2-rc.2+build.2", "0.0.3", -1],
      ["0.0.2-rc.2+build.2", "0.0.2-rc.1", 1],
      ["0.0.2-rc.2+build.2", "0.0.2-rc.2", 0],
      ["0.0.2-rc.2+build.2", "0.0.2-rc.3", -1],
      ["0.0.2-rc.2+build.2", "0.0.2+build.1", -1],
      ["0.0.2-rc.2+build.2", "0.0.2+build.2", -1],
      ["0.0.2-rc.2+build.2", "0.0.2+build.3", -1],
      ["0.0.2-rc.2+build.2", "0.0.2-rc.1+build.1", 1],
      ["0.0.2-rc.2+build.2", "0.0.2-rc.2+build.1", 0],
      ["0.0.2-rc.2+build.2", "0.0.2-rc.3+build.1", -1],
      ["0.0.2-rc.2+build.2", "0.0.2-rc.1+build.2", 1],
      ["0.0.2-rc.2+build.2", "0.0.2-rc.2+build.2", 0],
      ["0.0.2-rc.2+build.2", "0.0.2-alpha.2+build.2", 1],
      ["0.0.2-rc.2+build.2", "0.0.2-zeta.2+build.2", -1],
      ["0.0.2-rc.2+build.2", "0.0.2-rc.3+build.2", -1],
      ["0.0.2-rc.2+build.2", "0.0.2-rc.1+build.3", 1],
      ["0.0.2-rc.2+build.2", "0.0.2-rc.2+build.3", 0],
      ["0.0.2-rc.2+build.2", "0.0.2-rc.3+build.3", -1],
    ];
    versions.forEach(([a, b, expected]) => {
      const aSemVer = SemVer.fromString(a as string);
      const bSemVer = SemVer.fromString(b as string);
      const compareResult = aSemVer.compareTo(bSemVer);
      if (compareResult !== expected) {
        console.log(a, expected === 0 ? "=" : expected === -1 ? "<" : ">", b);
      }
      expect(compareResult).toBe(expected);
    });
  });
});

describe("increment version", () => {
  test("increment major", () => {
    expect(SemVer.fromString("0.0.1")?.increment("MAJOR").toString()).toBe("1.0.0");
    expect(SemVer.fromString("0.1.0")?.increment("MAJOR").toString()).toBe("1.0.0");
    expect(SemVer.fromString("1.0.0")?.increment("MAJOR").toString()).toBe("2.0.0");
    expect(SemVer.fromString("1.0.0-rc.1")?.increment("MAJOR").toString()).toBe("2.0.0");
    expect(SemVer.fromString("1.0.0-rc.2+build.1")?.increment("MAJOR").toString()).toBe("2.0.0");
  });

  test("increment minor", () => {
    expect(SemVer.fromString("0.0.1")?.increment("MINOR").toString()).toBe("0.1.0");
    expect(SemVer.fromString("0.1.0")?.increment("MINOR").toString()).toBe("0.2.0");
    expect(SemVer.fromString("1.0.0")?.increment("MINOR").toString()).toBe("1.1.0");
    expect(SemVer.fromString("1.0.0-rc.1")?.increment("MINOR").toString()).toBe("1.1.0");
    expect(SemVer.fromString("1.0.0-rc.2+build.1")?.increment("MINOR").toString()).toBe("1.1.0");
  });

  test("increment patch", () => {
    expect(SemVer.fromString("0.0.1")?.increment("PATCH").toString()).toBe("0.0.2");
    expect(SemVer.fromString("0.1.0")?.increment("PATCH").toString()).toBe("0.1.1");
    expect(SemVer.fromString("1.0.0")?.increment("PATCH").toString()).toBe("1.0.1");
    expect(SemVer.fromString("1.0.0-rc.1")?.increment("PATCH").toString()).toBe("1.0.1");
    expect(SemVer.fromString("1.0.0-rc.2+build.1")?.increment("PATCH").toString()).toBe("1.0.1");
  });

  test("increment preRelease", () => {
    expect(SemVer.fromString("0.0.1")?.increment("PRERELEASE").toString()).toBe("0.0.1-rc.1");
    expect(SemVer.fromString("0.1.0-rc.1")?.increment("PRERELEASE").toString()).toBe("0.1.0-rc.2");
    expect(SemVer.fromString("1.0.0+build.3")?.increment("PRERELEASE").toString()).toBe("1.0.0-rc.1");
    expect(SemVer.fromString("1.0.0-rc.2+build.1")?.increment("PRERELEASE").toString()).toBe("1.0.0-rc.3");
  });

  test("Support prefix", () => {
    expect(
      SemVer.fromString("v0.0.0", "v")
        ?.increment("MAJOR")
        .increment("MINOR")
        .increment("PATCH")
        .increment("PRERELEASE")
        .toString()
    ).toBe("v1.1.1-rc.1");
    expect(
      SemVer.fromString("v0.0.0", "v")
        ?.increment("PRERELEASE")
        .increment("PATCH")
        .increment("MINOR")
        .increment("MAJOR")
        .toString()
    ).toBe("v1.0.0");
  });
});
