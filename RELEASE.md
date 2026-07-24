# Release Process

## Quality Gates

Before any release:

1. All 134+ tests pass (3 suites)
2. Python SDK import valid
3. No broken links in documentation
4. CHANGELOG updated
5. Version bumped in:
   - `VERSIONING.md`
   - `sdk/node/package.json`
   - `sdk/python/setup.py`
   - `sdk/rust/Cargo.toml`
   - `sdk/go/pkg/iacp/go.mod`

## Creating a Release

```bash
# 1. Tag the release
git tag -a v1.0.0 -m "Release v1.0.0"

# 2. Push tag
git push origin v1.0.0

# 3. GitHub Actions creates the release automatically
```

## Release Types

| Type | Tag | Branch | Trigger |
|------|-----|--------|---------|
| Release Candidate | vMAJOR.MINOR.PATCH-rc.N | main | Manual |
| Stable | vMAJOR.MINOR.PATCH | main | Manual |
| Patch | vMAJOR.MINOR.PATCH | main | Manual |
| Hotfix | vMAJOR.MINOR.PATCH | release/ | Urgent |
