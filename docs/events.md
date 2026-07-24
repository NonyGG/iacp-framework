# Event System

## Overview

The Event System provides structured event representation for observability, audit, and monitoring across the agent ecosystem.

## Components

### EventHeader
Core event identification and classification.

- `eventId` — Unique identifier
- `eventType` — Domain-specific event name
- `category` — SYSTEM, APPLICATION, SECURITY, AUDIT, METRIC, LIFECYCLE
- `severity` — DEBUG (0) through CRITICAL (4)
- `version` — Event schema version
- `source` — Originating component
- `createdAt` — Timestamp

### EventMetadata
Contextual information for event processing.

- `traceId` — Tracing context
- `correlationId` — Related operation
- `sessionId` — Session context
- `originNode` — Node identifier
- `tags` — Classification tags
- `custom` — Extended fields

### Event
Factory methods for common event types.

- `Event.system(type, data)` — System events
- `Event.application(type, data)` — Application-level events
- `Event.security(type, data)` — Security events (auto WARNING)
- `Event.audit(type, data)` — Audit events (includes traceId)
- `Event.lifecycle(type, data)` — Lifecycle events

## Usage

```javascript
const { Event } = require('iacp-framework/core');
Event.system('startup', { version: '1.0.0' });
Event.security('auth_failure', { user: 'unknown', ip: '10.0.0.1' });
Event.audit('config_change', { field: 'timeout', from: 30, to: 60 });
```
