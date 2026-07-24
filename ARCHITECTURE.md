# IACP Framework Architecture

## Overview

The IACP Framework is organized as a layered protocol stack. Each layer has a single responsibility and communicates with adjacent layers through well-defined interfaces.

## Layer Model

```
┌────────────────────────────────────────────┐
│              Application Layer             │
│  Agent logic, workflows, business rules    │
├────────────────────────────────────────────┤
│               Protocol Layer               │
│  Envelope, schema registry, routing        │
├────────────────────────────────────────────┤
│              Transport Layer               │
│  IPC, TCP, WebSocket, message queues       │
├────────────────────────────────────────────┤
│             Serialization Layer            │
│  JSON, CBOR, Protocol Buffers              │
└────────────────────────────────────────────┘
```

### Protocol Layer

The core of the framework. Defines:

- **Message Envelope** — Header fields (id, type, version, sender, timestamp), body payload (opaque), metadata (routing hints, correlation, tracing)
- **Schema Registry** — Stores and resolves message type definitions, enables version negotiation between sender and receiver
- **Router** — Matches incoming messages to handlers based on type, topic, or content predicates

### Transport Layer

Abstracts the underlying communication mechanism behind a uniform interface:

- `TransportAdapter` — Base interface that all transports implement
- `Connection` — Represents an active communication channel
- `Listener` — Accepts incoming connections on a transport

Transports are pluggable. The framework ships with IPC, TCP, and WebSocket implementations. Third-party transports implement the same interface.

### Serialization Layer

Handles encoding and decoding of messages between wire format and in-memory representation:

- `Serializer` — Converts between bytes and structured messages
- `Codec` — Specific format implementation (JSON, CBOR, Protocol Buffers)
- Schema-aware serialization uses the schema registry for validation

## Message Lifecycle

```
Created → Validated → Routed → Delivered → Acknowledged
                                               │
                                          (optionally)
                                               ↓
                                           Stored
```

Every message passes through these stages. The router decides delivery based on message type and subscription state. Acknowledgments confirm successful processing.

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| Envelope-based messaging | Separates routing concerns from payload |
| Schema registry | Enables cross-version compatibility |
| Transport adapters | No coupling to specific wire protocol |
| Observable by default | Every routed message produces an event |

## Future Modules

- **Context Engine** — Shared state with delta propagation
- **Workflow Runtime** — Multi-step process orchestration
- **Event Store** — Immutable message persistence with replay
- **Intelligence Bus** — Pattern detection and recommendation

---

*This architecture document describes the target design. Implementation proceeds incrementally per the roadmap.*
