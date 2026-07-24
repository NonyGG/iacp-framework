# IACP Framework — Core Test Report

## Results

**48/48 tests PASSED (100%)**

## Test Coverage by Module

| Module | Tests | Status |
|--------|-------|--------|
| Types | 4 | ✅ |
| Identifiers | 4 | ✅ |
| Version/VersionManager | 5 | ✅ |
| ProtocolCore | 3 | ✅ |
| FeatureFlagSet | 1 | ✅ |
| SchemaRegistry | 1 | ✅ |
| CapabilityRegistry | 1 | ✅ |
| Message (Header/Payload/Metadata/Envelope) | 6 | ✅ |
| Message factories | 2 | ✅ |
| Event factories | 4 | ✅ |
| EventMetadata | 1 | ✅ |
| ContextReference | 1 | ✅ |
| ContextDelta | 1 | ✅ |
| ContextSnapshot | 1 | ✅ |
| ContextMetadata | 1 | ✅ |
| ASTBuilder (creation) | 2 | ✅ |
| ASTBuilder (linking) | 1 | ✅ |
| InstitutionalError | 1 | ✅ |
| ErrorFactory | 2 | ✅ |
| ErrorTracker | 1 | ✅ |
| Utils (retry, type checking) | 5 | ✅ |

## Edge Cases Covered

- Version parsing with pre-release labels
- Version incompatibility (major version mismatch)
- Empty context delta operations
- AST parent-child linking with invalid IDs
- Retry with eventual success
- Retry with persistent failure
- Non-object/non-string/non-number detection
- Error factory all 7 types

## Test Command

```bash
node tests/unit/core.test.js
```
