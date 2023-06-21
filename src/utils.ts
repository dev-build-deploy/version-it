/*
SPDX-FileCopyrightText: 2023 Kevin de Jong <monkaii@hotmail.com>

SPDX-License-Identifier: GPL-3.0-or-later
*/

/**
 * Returns a key-value pair from the provided identifier (e.g. alpha.1 => { key: "alpha.", value: 1 })
 * @param identifier Identifier to parse (e.g. alpha.1)
 * @returns Identifier value (e.g. 1)
 * @internal
 */
export function getKeyValuePair(value?: string): { key?: string; value?: number } | undefined {
  const kvpRegex = /^([a-zA-Z-]+)[.]([0-9]+)$/;
  const match = kvpRegex.exec(value ?? "");
  if (match === null) return;

  return { key: match[1], value: parseInt(match[2]) };
}
