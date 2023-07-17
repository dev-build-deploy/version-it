/*
SPDX-FileCopyrightText: 2023 Kevin de Jong <monkaii@hotmail.com>
SPDX-License-Identifier: MIT
*/

/**
 * Returns a key-value pair from the provided identifier (e.g. alpha.1 => { key: "alpha.", value: 1 })
 * @param identifier Identifier to parse (e.g. alpha.1)
 * @returns Identifier value (e.g. 1)
 * @internal
 */
export function getKeyValuePair(value?: string): { key: string; value: number } | undefined {
  const kvpRegex = /^([a-zA-Z-]+)[.]([0-9]+)$/;
  const match = kvpRegex.exec(value ?? "");
  if (match === null) return;

  return { key: match[1], value: parseInt(match[2]) };
}

/**
 * Returns the week number of the current date (ISO 8601)
 * @returns The week number of the current date
 * @internal
 */
export function getISO8601WeekNumber(): number {
  const date = new Date();
  const dayNumber = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - dayNumber + 3);
  const firstThursday = date.valueOf();
  date.setMonth(0, 1);
  if (date.getDay() !== 4) {
    date.setMonth(0, 1 + ((4 - date.getDay() + 7) % 7));
  }
  return 1 + Math.ceil((firstThursday - date.valueOf()) / 604800000);
}
