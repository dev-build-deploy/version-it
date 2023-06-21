/*
SPDX-FileCopyrightText: 2023 Kevin de Jong <monkaii@hotmail.com>

SPDX-License-Identifier: GPL-3.0-or-later
*/

/**
 * Comparable interface
 * @interface IComparable
 * @member isEqualTo Checks if the current version is equal to the other version
 * @member isGreaterThan Checks if the current version is greater than the other version
 * @member isLessThan Checks if the current version is less than the other version
 * @member compareTo Compares the current version to the other version
 * @template T Version type
 * @internal
 */
export interface IComparable<T> {
  /**
   * Checks if the current version is equal to the other version
   * @param other Other version
   * @returns True if the versions are equal, false otherwise
   */
  isEqualTo(other: T): boolean;

  /**
   * Checks if the current version is greater than the other version
   * @param other Other version
   * @returns True if the current version is greater than the other version, false otherwise
   */
  isGreaterThan(other: T): boolean;

  /**
   * Checks if the current version is less than the other version
   * @param other Other version
   * @returns True if the current version is less than the other version, false otherwise
   */
  isLessThan(other: T): boolean;

  /**
   * Compares the current version to the other version
   * @param other Other version
   * @returns 1 if the current version is greater than the other version, -1 if the current version is less than the other version, 0 if the versions are equal
   */
  compareTo(other: T): number;
}

/**
 * Version interface
 * @interface IVersion
 * @member increment Increments the version by the provided type
 * @member toString Returns the version as a string
 * @extends IComparable
 * @template T Version type
 * @template Y Increment type
 * @internal
 */
export interface IVersion<T, Y> extends IComparable<T> {
  /**
   * Returns the version as a string
   * @returns Version as a string
   */
  toString(): string;

  /**
   * Increments the version by the provided type
   * @param type Type of increment
   */
  increment(type: Y): T;
}
