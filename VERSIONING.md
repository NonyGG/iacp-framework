# Versioning Policy

## Format

This project uses Semantic Versioning (SemVer): `MAJOR.MINOR.PATCH`

- **MAJOR** — Breaking changes to protocol or public API
- **MINOR** — Backward-compatible feature additions
- **PATCH** — Backward-compatible bug fixes

## Current Version

**0.2.0** — Pre-release. Protocol frozen but public API subject to change until 1.0.0.

## Compatibility Policy

| Change Type | Major | Minor | Patch |
|-------------|-------|-------|-------|
| Protocol breaking | +1 | — | — |
| New feature | — | +1 | — |
| Bug fix | — | — | +1 |
| Deprecation | Notice in CHANGELOG | Warning | — |

## Release Cadence

- Release candidates: as needed
- Stable releases: quarterly
- Patches: as needed
- Hotfixes: within 48 hours for critical issues

## Deprecation Policy

Deprecated features receive a MINOR version deprecation notice and are removed in the next MAJOR version. At minimum one release cycle of notice is provided before removal.
