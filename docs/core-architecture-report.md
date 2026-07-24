# IACP Framework — Core Architecture Report

## Module Dependency Graph

```
core/index.js
  ├── common/types.js       (enums, no deps)
  ├── common/identifiers.js (crypto, os)
  ├── version/VersionManager.js
  ├── protocol/ProtocolCore.js
  │     ├── version/VersionManager.js
  │     └── common/types.js
  ├── messages/Message.js
  │     ├── common/types.js
  │     └── common/identifiers.js
  ├── events/Event.js
  │     ├── common/types.js
  │     └── common/identifiers.js
  ├── context/Context.js
  │     └── common/identifiers.js
  ├── ast/ASTNode.js
  │     ├── common/types.js
  │     └── common/identifiers.js
  ├── errors/ErrorSystem.js
  │     ├── common/types.js
  │     └── common/identifiers.js
  └── utils/utils.js          (no deps)
```

## External Dependencies

**Zero.** The core framework uses only Node.js built-in modules (`crypto`, `os`).

## Data Flow

```
Message/Event created → Header assigned → Payload attached
  → Envelope wrapped → Integrity hashed → Ready for transport
```

```
ContextDelta operations captured → Snapshot for state freeze
  → Reference for immutable pointer → Metadata for version tracking
```

```
ASTNode created → Children linked → Tree assembled
  → Ready for analysis or compilation
```

## Metrics

| Metric | Value |
|--------|-------|
| Core modules | 11 files |
| Lines of code | ~900 |
| Enums defined | 9 |
| Error categories | 8 |
| AST node types | 6 |
| Event categories | 6 |
| External deps | 0 |
