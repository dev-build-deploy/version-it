<!-- 
SPDX-FileCopyrightText: 2023 Kevin de Jong <monkaii@hotmail.com>

SPDX-License-Identifier: GPL-3.0-or-later
-->

# VersionIt - Version Management Library

Lightweight Version Management library for managing [Semantic Versioning](#semantic-versioning) and [Calendar Versioning](#calendar-versioning)

## Features

* Simple to use
* Supports [Semantic Versioning](#semantic-versioning)
  * Extended with key-value pair support in the `BUILD` and `PRERELEASE` identifier (e.g. `0.1.0-rc.1 < 0.1.0-rc.2`, `0.2.3-rc.3+build.2 < 0.2.3-rc.3+build.3` )
* Supports [Calendar Versioning]
  * Extended with key-value pair support in the `MODIFIER` identifier (e.g. `2023.25.1-build.1`)


## Semantic Versioning

> :bulb: Please refer to the [SemVer 2.0.0] specification for information about Semantic Versioning.

```typescript
import { SemVer } from "@dev-build-deploy/version-it";

// Create from string
const currentVersion = new SemVer("0.1.2-alpha.4");

// Create from interface
const previousVersion = new SemVer({
  minor: 1,
  patch: 2,
  preRelease: "alpha.3"
});

// Increment the version
const newVersion = currentVersion.increment("PRERELEASE");
```

### Incrementing the version

The following increment types can be applied when using `.increment(...)`:

| Type | Description |
| --- | --- |
| `MAJOR` | Increments the `MAJOR` version core |
| `MINOR` | Increments the `MINOR` version core |
| `PATCH` | Increments the `PATCH` version core |
| `PRERELEASE` | Increments the `PRERELEASE` or adds `-rc.1` in case no `PRERELEASE` is present on the version to be incremented.<br><br>Requires a key-value pair (e.g. `-alpha.1`, `-rc.7`) |
| `BUILD` | Increments the `BUILD` or adds `+build.1` in case no `BUILD` is present on the version to be incremented.<br><br>Requires a key-value pair (e.g. `+build.1`, `+attempt.3`) |

## Calendar Versioning

> :bulb: Please refer to the [CalVer] specification for information about Calendar Versioning.

```ts
import { CalVer } from "@dev-build-deploy/version-it";

const calverFormat = "YYYY.0M.MICRO";

// Create from string
const currentVersion = new CalVer(calverFormat, "2023.01.12-alpha.2");

// Create from interface
const previousVersion = new CalVer(
  calverFormat, {
    major: 2023,
    minor: 1,
    micro: 12,
    modified: "alpha.1"
  }
);

// Update the calendar related version (e.g. YYYY, MM, WW, DD)
const newVersion = currentVersion.increment("CALENDAR");
```

### CalVer Formatting

> **NOTE**: Wwe only support CalVer formatting with 2 or 3 version cores.

Formatting is provided as a string, where each version core (`MAJOR`, `MINOR`, `MICRO`) can be assigned to a specific format:

| Format | Description |
| --- | --- |
| `YYYY` | Full year |
| `YY` | Last three digits of the year (e.g. 3, 23, 101)
| `0Y` | Zero padded last three digits of the year (e.g. 003, 023, 101)
| `MM` | Month number |
| `0M` | Zero padded month number |
| `WW` | Week number (according to ISO8601) |
| `0W` | Zero padded week number (according to ISO8601) |
| `DD` | Day of the month |
| `0D` | Zero padded day of the month |
| `MAJOR` | Incremental number |
| `MINOR` | Incremental number |
| `MICRO` | Incremental number |

### Incrementing the version

The following increment types can be applied when using `.increment(...)`:

| Type | Description |
| --- | --- |
| `CALENDAR` | Updates any version core associated with calendar-related formatting.<br><br>Adds the `build.1` modifier in case the exact version already exists |
| `MAJOR` | Increments (+1) the version associated with `MAJOR` formatting |
| `MINOR` | Increments (+1) the version associated with `MINOR` formatting |
| `MICRO` | Increments (+1) the version associated with `MICRO` formatting |
| `MODIFIER` | Increments the `MODIFIER` or adds `build.1` in case no `MODIFIER` is present on the version to be incremented.<br><br>Requires a key-value pair (e.g. `alpha.1`, `build.7`)|

## Comparing and sorting

Both [SemVer](#semantic-versioning) and [CalVer](#calendar-versioning) can be compared and/or sorted in the same manner:

```typescript
// Sort versions...
const unsortedVersions = [
  previousVersion,
  currentVersion,
  newVersion
]

const sortedVersions = unsortedVersions.sort((a, b) => a.compareTo(b));

// ...or use the comparator functions:
//   isEqualTo(..)
//   isGreaterThan(..)
//   isLessThan(..)
if (newVersion.isGreaterThan(previousVersion)) {
  // Hurray..!
}

```

## Contributing

If you have suggestions for how version-it could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

- [GPL-3.0-or-later AND CC0-1.0](LICENSE) © 2023 Kevin de Jong \<monkaii@hotmail.com\>

[SemVer 2.0.0]: https://semver.org
[CalVer]: https://calver.org