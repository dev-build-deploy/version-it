<!-- 
SPDX-FileCopyrightText: 2023 Kevin de Jong <monkaii@hotmail.com>

SPDX-License-Identifier: GPL-3.0-or-later
-->

# VersionIt - Version Management Library

Lightweight Version Management library, currently only supporting [SemVer 2.0.0]

## Features

* Simple to use
* Supports the [SemVer 2.0.0] specification
  * Extended with key-value pair support in the `BUILD` and `PRERELEASE` identifier (e.g. `0.1.0-rc.1 < 0.1.0-rc.2`, `0.2.3-rc.3+build.2 < 0.2.3-rc.3+build.3` )
## Basic Usage

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
const newVersion = currentVersion.increment("preRelease");

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