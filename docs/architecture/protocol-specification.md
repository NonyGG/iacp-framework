# Protocol Specification (Stub)

This document will define the IACP message envelope format, header fields, type identifiers, and wire format.

## Message Envelope

Every IACP message follows this structure:

```
┌──────────────────────────────┐
│        Header                │
│  protocol_version            │
│  message_id                  │
│  message_type                │
│  source                      │
│  destination (optional)      │
│  timestamp                   │
│  ttl                         │
│  correlation_id (optional)   │
│  content_type                │
├──────────────────────────────┤
│        Body                  │
│  (opaque byte sequence)      │
├──────────────────────────────┤
│     Metadata (optional)      │
│  routing_hints               │
│  trace_context               │
│  extensions                  │
└──────────────────────────────┘
```

The header is always in a fixed, self-describing format so that routers can inspect routing information without deserializing the body.

## Message Types

Message types are URI-formatted identifiers following the pattern `protocol:domain:name:version`. Examples:

- `iacp:core:ping:1`
- `iacp:core:ack:1`
- `iacp:agent:capabilities:1`

## Version Negotiation

The schema registry enables sender and receiver to agree on a mutually supported message version. If no common version exists, the sender receives a version-mismatch response.

*Detailed specification will be completed in Phase 2.*
