# IACP Framework — Roadmap

## Phase 1 — Foundation (Current)

- [x] Repository structure and directory layout
- [x] Original documentation (README, LICENSE, CONTRIBUTING, etc.)
- [x] Architecture specification
- [x] CI/CD scaffolding
- [ ] Schema definitions for core message types

## Phase 2 — Core Protocol

- [ ] Message envelope specification (header, body, metadata)
- [ ] Schema registry with version negotiation
- [ ] Message serialization (JSON, CBOR, Protocol Buffers)
- [ ] Message validation (structure, required fields, type checking)
- [ ] Message lifecycle (create, route, deliver, acknowledge)

## Phase 3 — Transport Layer

- [ ] Transport adapter interface definition
- [ ] IPC transport (Unix domain sockets, Windows named pipes)
- [ ] TCP transport with connection pooling
- [ ] WebSocket transport with reconnection
- [ ] Message queue adapters (RabbitMQ, NATS)

## Phase 4 — Routing

- [ ] Topic-based routing with wildcard support
- [ ] Content-based routing with predicate matching
- [ ] Point-to-point and publish-subscribe patterns
- [ ] Request-reply correlation
- [ ] Delivery guarantees (at-most-once, at-least-once, exactly-once)

## Phase 5 — Observability

- [ ] Structured event emission for all protocol operations
- [ ] Metrics collection (message throughput, latency, error rates)
- [ ] Distributed tracing context propagation
- [ ] Audit log formatting and export

## Phase 6 — SDKs

- [ ] JavaScript/TypeScript SDK
- [ ] Python SDK
- [ ] Go SDK
- [ ] Rust SDK
- [ ] SDK documentation and examples

## Phase 7 — Plugin System

- [ ] Plugin interface definition
- [ ] Authentication plugins
- [ ] Authorization plugins
- [ ] Message transformation plugins
- [ ] Custom transport plugins

## Phase 8 — Production Hardening

- [ ] End-to-end encryption
- [ ] Rate limiting and backpressure
- [ ] Circuit breaker patterns
- [ ] Performance benchmarks
- [ ] Security audit

---

*This roadmap is a living document and will evolve as the framework matures.*
