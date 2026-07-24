# Message System

## Overview

The Message System defines the structured communication unit between agents. Every interaction uses an envelope containing a header, payload, and metadata.

## Components

### Header
Fixed fields that routers can inspect without deserializing the body.

- `messageId` — Unique identifier
- `messageType` — request, response, command, event, query, ack, error, heartbeat
- `protocolVersion` — Protocol version used
- `sender` / `destination` — Agent identifiers
- `createdAt` — Timestamp
- `ttl` — Time-to-live in milliseconds
- `priority` — LOW (0), NORMAL (1), HIGH (2), CRITICAL (3)

### Payload
The message body with content type metadata.

- `content` — The actual data
- `contentType` — MIME type
- `encoding` — Character encoding
- `size` — Content size in bytes

### Metadata
Optional routing and tracing context.

- `correlationId` — Links request-response pairs
- `traceId` — Distributed tracing identifier
- `sessionId` — Session context
- `sourceNode` — Origin node identifier
- `routingHints` — Custom routing directives
- `extensions` — Protocol extension data
- `custom` — Application-specific fields

### Envelope
Wraps header + payload + metadata with integrity hash.

### Message
Factory methods for common message patterns.

- `Message.request(destination, content, opts)` — Create request
- `Message.response(requestMsg, content)` — Create response with correlation
- `Message.event(type, content)` — Create event message

## Usage

```javascript
const { Message } = require('iacp-framework/core');
const req = Message.request('agent:processor', { command: 'analyze' });
const res = Message.response(req, { result: 'ok' });
```
