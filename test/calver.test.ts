/*
 * SPDX-FileCopyrightText: 2023 Kevin de Jong <monkaii@hotmail.com>
 * SPDX-License-Identifier: MIT
 */

import * as calver from "../src/calver";

describe("CalVer Format", () => {
  test("Validate Regex", () => {
    expect(calver.formatFromString("YYYY.MINOR").regex).toStrictEqual(
      new RegExp("^(?<major>\\d{4}).(?<minor>\\d+)(-(?<modifier>[\\w._]+))?$")
    );
    expect(calver.formatFromString("YY.MINOR").regex).toStrictEqual(
      new RegExp("^(?<major>\\d{1,3}).(?<minor>\\d+)(-(?<modifier>[\\w._]+))?$")
    );
    expect(calver.formatFromString("0Y.MINOR").regex).toStrictEqual(
      new RegExp("^(?<major>\\d{3}).(?<minor>\\d+)(-(?<modifier>[\\w._]+))?$")
    );
    expect(calver.formatFromString("MM.MINOR").regex).toStrictEqual(
      new RegExp("^(?<major>\\d{1,2}).(?<minor>\\d+)(-(?<modifier>[\\w._]+))?$")
    );
    expect(calver.formatFromString("0M.MINOR").regex).toStrictEqual(
      new RegExp("^(?<major>\\d{2}).(?<minor>\\d+)(-(?<modifier>[\\w._]+))?$")
    );
    expect(calver.formatFromString("WW.MINOR").regex).toStrictEqual(
      new RegExp("^(?<major>\\d{1,2}).(?<minor>\\d+)(-(?<modifier>[\\w._]+))?$")
    );
    expect(calver.formatFromString("0W.MINOR").regex).toStrictEqual(
      new RegExp("^(?<major>\\d{2}).(?<minor>\\d+)(-(?<modifier>[\\w._]+))?$")
    );
    expect(calver.formatFromString("DD.MINOR").regex).toStrictEqual(
      new RegExp("^(?<major>\\d{1,2}).(?<minor>\\d+)(-(?<modifier>[\\w._]+))?$")
    );
    expect(calver.formatFromString("0D.MINOR").regex).toStrictEqual(
      new RegExp("^(?<major>\\d{2}).(?<minor>\\d+)(-(?<modifier>[\\w._]+))?$")
    );
    expect(calver.formatFromString("MAJOR.MINOR").regex).toStrictEqual(
      new RegExp("^(?<major>\\d+).(?<minor>\\d+)(-(?<modifier>[\\w._]+))?$")
    );
    expect(calver.formatFromString("MINOR.DD").regex).toStrictEqual(
      new RegExp("^(?<major>\\d+).(?<minor>\\d{1,2})(-(?<modifier>[\\w._]+))?$")
    );
    expect(calver.formatFromString("MICRO.MINOR").regex).toStrictEqual(
      new RegExp("^(?<major>\\d+).(?<minor>\\d+)(-(?<modifier>[\\w._]+))?$")
    );
    expect(calver.formatFromString("YYYY.MAJOR.MINOR").regex).toStrictEqual(
      new RegExp("^(?<major>\\d{4}).(?<minor>\\d+).(?<micro>\\d+)(-(?<modifier>[\\w._]+))?$")
    );
    expect(() => calver.formatFromString("YYYY.MAJOR.MINOR.MAJOR").regex).toThrow();
    expect(() => calver.formatFromString("DOES.NOT.EXIST").regex).toThrow();
    expect(() => calver.formatFromString("YYYY").regex).toThrow();
    expect(() => calver.formatFromString("YYYY.MM.DD.").regex).toThrow();
    expect(() => calver.formatFromString("MM.MM").regex).toThrow();
  });

  test("Validate elements", () => {
    const elements = ["YYYY", "YY", "0Y", "MM", "0M", "WW", "0W", "DD", "0D", "MAJOR", "MINOR", "MICRO"];

    for (const major of elements) {
      for (const minor of elements) {
        for (const micro of elements) {
          // Skip duplicate entries
          if (major === minor || major === micro || minor === micro) continue;

          const format = calver.formatFromString(`${major}.${minor}.${micro}`);
          expect(format.major).toBe(major);
          expect(format.minor).toBe(minor);
          expect(format.micro).toBe(micro);
        }
      }
    }
  });
});

describe("String to CalVer", () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2023, 3, 12));
  });
  afterAll(() => {
    jest.useRealTimers();
  });

  test("Versions", () => {
    const versions = [
      ["2023.1", "YYYY.MINOR"],
      ["23.1", "YY.MINOR"],
      ["001.1", "0Y.MINOR"],
      ["3.1", "MM.MINOR"],
      ["03.1", "0M.MINOR"],
      ["12.1", "WW.MINOR"],
      ["07.1", "0W.MINOR"],
      ["9.1", "DD.MINOR"],
      ["09.1", "0D.MINOR"],
      ["500.1", "MAJOR.MINOR"],
      ["66666.1", "MINOR.MAJOR"],
      ["100000.1", "MICRO.MINOR"],
    ];

    for (const [version, format] of versions) {
      expect(calver.CalVer.fromString(format, version)?.toString()).toBe(version);
    }
  });

  test("Update Calendar", () => {
    const versions = [
      // New versions
      ["2022.1", "YYYY.MINOR", "2023.0"],
      ["22.1", "YY.MINOR", "23.0"],
      ["001.1", "0Y.MINOR", "023.0"],
      ["1.1", "MM.MINOR", "4.0"],
      ["01.1", "0M.MICRO", "04.0"],
      ["3.1", "WW.MINOR", "15.0"],
      ["03.1", "0W.MINOR", "15.0"],
      ["7.1", "DD.MINOR", "13.0"],
      ["07.1", "0D.MINOR", "13.0"],
      ["07.1.3", "0D.MAJOR.MINOR", "13.0.0"],
      // Equal versions
      ["2023.1", "YYYY.MINOR", "2023.1"],
      ["2023.1-build.1", "YYYY.MINOR", "2023.1-build.1"],
    ];

    for (const [version, format, expectations] of versions) {
      expect(calver.CalVer.fromString(format, version)?.increment("CALENDAR").toString()).toBe(expectations);
    }
  });

  test("Update Major", () => {
    const versions = [
      // New versions
      ["2022.1", "YYYY.MAJOR", "2022.2"],
      ["22.1", "YY.MAJOR", "22.2"],
      ["09.1.3", "0D.MAJOR.MINOR", "09.2.0"],
      // Increment pre-release modifier
      ["10.2.4-alpha.1", "DD.MAJOR.MINOR", "10.3.0"],
      // Incorrect increments
      ["2022.1", "YYYY.MINOR", ""],
      ["22.1", "YY.DD", ""],
      ["001.1", "0Y.MINOR", ""],
      ["1.1", "MM.MICRO", ""],
      ["01.1", "0M.WW", ""],
    ];

    for (const [version, format, expectations] of versions) {
      if (expectations !== "") {
        expect(calver.CalVer.fromString(format, version)?.increment("MAJOR").toString()).toBe(expectations);
      } else {
        expect(() => calver.CalVer.fromString(format, version)?.increment("MAJOR")).toThrow();
      }
    }
  });

  test("Update Minor", () => {
    const versions = [
      // New versions
      ["2022.1.2", "YYYY.MAJOR.MINOR", "2022.1.3"],
      ["22.1", "YY.MINOR", "22.2"],
      // Pre-release modifier
      ["22.1-alpha.1", "YY.MINOR", "22.2"],
      // Incorrect increments
      ["2022.1", "YYYY.MAJOR", ""],
      ["22.1", "YY.DD", ""],
      ["001.9", "0Y.MAJOR", ""],
      ["1.1", "MM.MICRO", ""],
      ["01.1", "0M.WW", ""],
    ];

    for (const [version, format, expectations] of versions) {
      if (expectations !== "") {
        expect(calver.CalVer.fromString(format, version)?.increment("MINOR").toString()).toBe(expectations);
      } else {
        expect(() => calver.CalVer.fromString(format, version)?.increment("MINOR")).toThrow();
      }
    }
  });

  test("Update Micro", () => {
    const versions = [
      // New versions
      ["2022.1.2", "YYYY.MINOR.MICRO", "2022.1.3"],
      ["22.1", "YY.MICRO", "22.2"],
      // Pre-release modifier
      ["22.1-alpha.1", "YY.MICRO", "22.2"],
      // Incorrect increments
      ["2022.1", "YYYY.MAJOR", ""],
      ["22.1", "YY.DD", ""],
      ["001.1", "0Y.MAJOR", ""],
      ["1.1", "MM.MINOR", ""],
      ["01.1", "0M.WW", ""],
    ];

    for (const [version, format, expectations] of versions) {
      if (expectations !== "") {
        expect(calver.CalVer.fromString(format, version)?.increment("MICRO").toString()).toBe(expectations);
      } else {
        expect(() => calver.CalVer.fromString(format, version)?.increment("MICRO")).toThrow();
      }
    }
  });

  test("Update Modifier", () => {
    const versions = [
      // New versions
      ["2022.1.2", "YYYY.MAJOR.MINOR", "2022.1.2-build.1"],
      ["22.1-build.3", "YY.MINOR", "22.1-build.4"],
      ["2022.1-alpha", "YYYY.MINOR", "2022.1-alpha.build.1"],
      ["22.1-alpha1", "YY.DD", "22.1-alpha1.build.1"],
    ];

    for (const [version, format, expectations] of versions) {
      expect(calver.CalVer.fromString(format, version)?.increment("MODIFIER", "build").toString()).toBe(expectations);
    }
  });
});

describe("Comparators", () => {
  test("Exhaustive compare", () => {
    const versions = [
      // Two version cores
      ["YYYY.MAJOR", "2023.1", "2023.1", "0"],
      ["YYYY.MINOR", "2023.1", "2023.0", "1"],
      ["YYYY.MICRO", "2023.1", "2023.2", "-1"],
      ["YY.WW", "23.2", "23.1", "1"],
      ["YY.0D", "23.02", "23.03", "-1"],
      // Three version cores
      ["YYYY.MINOR.MICRO", "2023.1.1", "2023.1.1", "0"],
      ["YY.MINOR.MICRO", "23.1.2", "23.1.1", "1"],
      ["WW.MINOR.MICRO", "15.1.2", "15.1.3", "-1"],
      ["YYYY.0W.0D", "2023.02.02", "2023.01.03", "1"],
      ["MAJOR.MINOR.MICRO", "2023.2.2", "2023.2.1", "1"],
      ["MAJOR.MINOR.MICRO", "2023.2.2", "2023.2.3", "-1"],
      ["MAJOR.MINOR.MICRO", "2022.2.2", "2023.2.2", "-1"],
      ["MAJOR.MINOR.MICRO", "2024.1.1", "2023.2.2", "1"],
      // Modifiers
      ["YYYY.MINOR", "2023.1", "2023.1-build.1", "1"],
      ["YYYY.MINOR", "2023.2", "2023.1-build.1", "1"],
      ["YYYY.MINOR", "2023.1-build.1", "2023.1-build.1", "0"],
      ["YYYY.MINOR", "2023.1-build.2", "2023.1-build.1", "1"],
      ["YYYY.MINOR", "2023.1-build.200", "2023.1-build.199", "1"],
      ["YYYY.MINOR", "2023.1-build.199", "2023.1-build.200", "-1"],
      ["YYYY.MINOR", "2023.1-build.2", "2023.1-build.3", "-1"],
      ["YYYY.MINOR", "2023.2-build.1", "2023.1-build.3", "1"],
      ["YYYY.MINOR", "2023.1-build.5", "2023.2-build.3", "-1"],
      ["YYYY.MINOR", "2023.1-beta.1", "2023.1-alpha.1", "1"],
      ["YYYY.MINOR", "2023.1-beta.1", "2023.1-gamma.1", "-1"],
      ["YYYY.MINOR", "2023.1-beta", "2023.1-alpha.1", "1"],
      ["YYYY.MINOR", "2023.1-alpha", "2023.1-gamma.1", "-1"],
      ["YYYY.MINOR", "2023.1-alpha", "2023.1-gamma", "-1"],
      ["YYYY.MINOR", "2023.1-beta", "2023.1-alpha", "1"],
    ];

    for (const [format, a, b, expectations] of versions) {
      const aC = calver.CalVer.fromString(format, a);
      const bC = calver.CalVer.fromString(format, b);
      if (!aC || !bC) {
        throw new Error(`Invalid CalVer: ${a} or ${b} for format ${format}`);
      }

      expect(aC.compareTo(bC)).toBe(parseInt(expectations));
      expect(aC.isEqualTo(bC)).toBe(expectations === "0");
      expect(aC.isGreaterThan(bC)).toBe(expectations === "1");
      expect(aC.isLessThan(bC)).toBe(expectations === "-1");
    }
  });
});
