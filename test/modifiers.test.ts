/*
 * SPDX-FileCopyrightText: 2024 Kevin de Jong <monkaii@hotmail.com>
 * SPDX-License-Identifier: MIT
 */

import { getModifiers, incrementModifier, modifiersToString } from "../src/modifiers";

describe("Determine Pre-Releases", () => {
  test("No Pre-Releases", () => {
    expect(getModifiers()).toStrictEqual([]);
    expect(getModifiers("")).toStrictEqual([]);
  });

  test("Multi Pre-Release", () => {
    expect(getModifiers("1")).toStrictEqual([{ identifier: undefined, value: 1, length: 1 }]);
    expect(getModifiers("alpha")).toStrictEqual([{ identifier: "alpha", value: 0, length: 0 }]);
    expect(getModifiers("alpha.1")).toStrictEqual([{ identifier: "alpha", value: 1, length: 1 }]);
    expect(getModifiers("alpha.001")).toStrictEqual([{ identifier: "alpha", value: 1, length: 3 }]);
    expect(getModifiers("alpha.101")).toStrictEqual([{ identifier: "alpha", value: 101, length: 3 }]);
    expect(getModifiers("alpha.beta.2")).toStrictEqual([
      { identifier: "alpha", value: 0, length: 0 },
      { identifier: "beta", value: 2, length: 1 },
    ]);
    expect(getModifiers("1.2.3")).toStrictEqual([
      { identifier: undefined, value: 1, length: 1 },
      { identifier: undefined, value: 2, length: 1 },
      { identifier: undefined, value: 3, length: 1 },
    ]);
  });

  test("Increment", () => {
    expect(incrementModifier([], "alpha")).toStrictEqual([{ identifier: "alpha", value: 1, length: 1 }]);
    expect(incrementModifier([{ identifier: "alpha", value: 1, length: 1 }], "alpha")).toStrictEqual([
      { identifier: "alpha", value: 2, length: 1 },
    ]);
    expect(incrementModifier([{ identifier: "alpha", value: 1, length: 1 }], "beta")).toStrictEqual([
      { identifier: "alpha", value: 1, length: 1 },
      { identifier: "beta", value: 1, length: 1 },
    ]);
  });

  test("toString", () => {
    expect(modifiersToString([{ identifier: "alpha", value: 1, length: 1 }])).toBe("-alpha.1");
    expect(
      modifiersToString([
        { identifier: "alpha", value: 1, length: 1 },
        { identifier: "beta", value: 1, length: 1 },
      ])
    ).toBe("-alpha.1.beta.1");
  });
});
