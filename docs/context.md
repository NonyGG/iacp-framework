# Context System

## Overview

The Context System provides structured state representations for agent missions and workflows, enabling incremental updates, versioning, and snapshots.

## Components

### ContextReference
An immutable reference to a point-in-time context state.

- `id` — Unique reference identifier
- `missionId` — Associated mission
- `type` — Reference type (workflow, agent, etc.)
- `data` — Captured data
- `hash` — SHA-256 content hash

### ContextDelta
Records incremental changes to context without full state transmission.

- `id` — Unique delta identifier
- `missionId` — Associated mission
- `operations[]` — Sequence of add/update/remove operations
- `baseHash` — Hash of the state this delta applies to
- `size` — Number of operations

### ContextSnapshot
A capture of complete context state at a point in time.

- `id` — Unique snapshot identifier
- `missionId` — Associated mission
- `data` — Captured state
- `hash` — Content hash

### ContextMetadata
Tracks version and lifecycle of a context.

- `missionId` — Associated mission
- `version` — Monotonic version counter
- `parentId` — Reference to parent context
- `tags` — Classification tags
- `status` — active, archived, etc.

## Usage

```javascript
const { ContextDelta, ContextSnapshot } = require('iacp-framework/core');
const delta = new ContextDelta('mission-1');
delta.addOperation('add', '/config/timeout', 60);
const snapshot = new ContextSnapshot('mission-1');
snapshot.capture({ status: 'completed', result: 'ok' });
```
