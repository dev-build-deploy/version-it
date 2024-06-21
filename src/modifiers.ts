/*
 * SPDX-FileCopyrightText: 2024 Kevin de Jong <monkaii@hotmail.com>
 * SPDX-License-Identifier: MIT
 */

/**
 * Pre-release modifier
 * @type Modifier
 * @member identifier Identifier of the modifier
 * @member value Value of the modifier
 * @member length Length of the value
 */
export type Modifier = { identifier?: string; value: number; length: number };

/**
 * Parses the provided string into a list of modifiers; i.e.:
 * - alpha.1 => [{ identifier: "alpha", value: 1, length: 1 }]
 * - beta.01 => [{ identifier: "beta", value: 1, length: 2 }]
 * - alpha.beta.2 => [{ identifier: "alpha", value: 0, length: 0 }, { identifier: "beta", value: 2, length: 1 }]
 * - 1.0.0 => []
 * @param value String containing zero or more modifiers
 * @returns List of modifiers
 * @internal
 */
export function getModifiers(value?: string): Modifier[] {
  const modifiers: Modifier[] = [];

  let nextModifier: Modifier | undefined = undefined;
  for (const element of value ? value.split(".") : []) {
    if (isNaN(Number(element))) {
      if (nextModifier) {
        modifiers.push(nextModifier);
      }
      nextModifier = { identifier: element, value: 0, length: 0 };
    } else {
      if (!nextModifier) {
        modifiers.push({ identifier: undefined, value: Number(element), length: element.length });
      } else {
        nextModifier.value = Number(element);
        nextModifier.length = element.length;
        modifiers.push(nextModifier);
        nextModifier = undefined;
      }
    }
  }

  if (nextModifier) modifiers.push(nextModifier);

  return modifiers;
}

/**
 * Increments the modifier with the provided identifier
 * @param modifiers list of modifiers
 * @param identifier identifier to increment
 * @returns List of modifiers with the incremented identifier
 * @internal
 */
export function incrementModifier(modifiers: Modifier[], identifier: string): Modifier[] {
  const modifiersCopy = [...modifiers];
  const element = modifiersCopy.findIndex(m => m.identifier === identifier);

  if (element === -1) {
    return [...modifiersCopy, { identifier, value: 1, length: 1 }];
  }

  const nextVersion = modifiersCopy[element].value + 1;

  modifiersCopy[element] = {
    ...modifiersCopy[element],
    value: nextVersion,
    length: nextVersion.toString().length,
  };

  return modifiersCopy;
}

/**
 * Compares to lists of Modifiers
 * @param a Left side of comparison
 * @param b Right side of comparison
 * @returns 1 if a is greater than b, -1 if a is less than b, 0 if a is equal to b
 */
export function compareModifiers(a: Modifier[], b: Modifier[]): number {
  if (a.length < b.length) return 1;
  if (a.length > b.length) return -1;

  // 1.0.0.alpha.1 < 1.0.0.alpha.2 < 1.0.0
  for (let idx = 0; idx < a.length; idx++) {
    const identifierComp = (a[idx].identifier ?? "").localeCompare(b[idx].identifier ?? "");

    if (identifierComp !== 0) return identifierComp;

    if (a[idx].value === b[idx].value) continue;
    return a[idx].value > b[idx].value ? 1 : -1;
  }

  return 0;
}

/**
 * Converts a list of modifiers to a string
 * @param modifiers List of modifiers
 * @returns String representation of the modifiers
 * @internal
 */
export function modifiersToString(modifiers: Modifier[]): string {
  const elements = modifiers.map(modifier =>
    modifier.identifier
      ? `${modifier.identifier}${modifier.length > 0 ? "." + modifier.value : ""}`
      : `${modifier.value}`
  );

  return modifiers.length > 0 ? "-" + elements.join(".") : "";
}
