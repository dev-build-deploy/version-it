/*
 * SPDX-FileCopyrightText: 2023 Kevin de Jong <monkaii@hotmail.com>
 * SPDX-License-Identifier: MIT
 */

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

export function compareNumbers(a: number, b: number): number {
  if (a > b) return 1;
  else if (a < b) return -1;

  return 0;
}
