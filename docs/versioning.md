# Versioning System

## Overview

The Versioning System defines how protocol versions are represented, compared, and negotiated between agents. It uses semantic versioning with compatibility rules.

## Components

### Version

Represents a semantic version (major.minor.patch).

- `compareTo(other)` — Numeric comparison
- `isCompatibleWith(other)` — True if major versions match and minor is within range
- `parse(str)` — Parse "1.2.3" or "1.2.3-alpha" strings
- `latest(versions)` — Return the highest version from an array
- `toString()` — Format as "MAJOR.MINOR.PATCH"

### VersionManager

Manages version registrations across multiple domains.

- `register(domain, versionStr)` — Register version for a domain
- `getVersion(domain)` — Get registered version
- `checkCompatibility(domain, versionStr)` — Check if version is compatible
- `findCommonVersion(versions)` — Find mutually compatible version

### Compatibility Rules

- Major version mismatch = incompatible
- Same major + minor equal or higher = compatible
- Patch differences are always compatible
- Pre-release labels are informational only

## Usage

```javascript
const { Version, VersionManager } = require('iacp-framework/core');
const vm = new VersionManager();
vm.register('protocol', '1.0.0');
vm.register('messages', '2.1.0');
vm.checkCompatibility('messages', '2.0.0'); // true
```
