# Protocol Core

## Overview

The Protocol Core provides the foundational infrastructure for agent communication. It defines versioning, feature negotiation, compatibility checks, schema management, and capability discovery.

## Components

### ProtocolCore
Central coordinator that manages protocol state and sub-components.

- `id` — Unique protocol instance identifier
- `versions` — VersionManager instance for all domains
- `features` — FeatureFlagSet for capability negotiation
- `compatibility` — CompatibilityManager for cross-version checks
- `schemas` — SchemaRegistry for message type definitions
- `capabilities` — CapabilityRegistry for agent capability discovery
- `phase` — Current protocol phase (handshake, established, etc.)

### FeatureFlagSet
Manages optional protocol features.

- `register(name, version)` — Declare a feature
- `enable(name)` / `disable(name)` — Toggle feature state
- `isEnabled(name)` — Query feature state

### SchemaRegistry
Stores and retrieves message type schemas.

- `register(name, schema)` — Register a schema
- `get(name)` / `has(name)` — Query schemas

### CapabilityRegistry
Tracks which agents support which capabilities.

- `declare(agentId, capabilities[])` — Register agent capabilities
- `has(agentId, capability)` — Check specific capability

## Usage

```javascript
const { ProtocolCore } = require('iacp-framework/core');
const protocol = new ProtocolCore();
protocol.features.register('encryption', '1.0.0').enable('encryption');
protocol.schemas.register('agent.v1', { /* schema */ });
protocol.capabilities.declare('agent-1', ['routing', 'encryption']);
```
