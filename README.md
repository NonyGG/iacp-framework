# Institutional Agent Protocol (IACP) Framework

![Status](https://img.shields.io/badge/status-active%20development-blue)
![Version](https://img.shields.io/badge/version-0.2.0-orange)
![License](https://img.shields.io/badge/license-Apache%202.0-green)
![Tests](https://img.shields.io/badge/tests-134%2F134-brightgreen)

A language-agnostic communication protocol and runtime framework for multi-agent systems in institutional environments.

## What is IACP?

Institutional Agent Communication Protocol (IACP) is an open framework for structured communication between AI agents.

It provides protocol definitions, message routing, event-driven communication, workflow execution, context management and runtime interoperability across multiple AI platforms.

The framework is designed to be independent from any specific AI model, runtime or orchestration engine.

Its goal is to provide a stable institutional communication layer that can be adopted by different multi-agent systems.

## Development Status

This project is in active development.

The core architecture has been defined and documented across four implementation phases.

Components are being delivered progressively following the roadmap.

Public APIs have not been published yet. npm, pip, and Go packages will be available with the first stable release.

## Overview

IACP defines how autonomous agents discover, communicate, coordinate, and transact within institutional boundaries. It provides a formal contract layer between agents, enabling:

- **Discoverable services** — Agents advertise capabilities via typed interfaces
- **Verifiable messages** — Every message carries provenance and integrity metadata
- **Deterministic routing** — Messages reach intended handlers through topology-aware dispatch
- **Observable streams** — All communication surfaces emit structured event data
- **Pluggable transports** — Swap TCP, IPC, message queues, or WebSocket without protocol changes

## Philosophy

IACP treats agent communication as an institutional concern, not an implementation detail. Messages are first-class entities with lifecycle, ownership, and audit requirements. The protocol enforces nothing about what agents do internally — only how they interact at boundaries.

### Core Principles

1. **Protocol before implementation** — Contracts are defined before code is written
2. **Verifiable by default** — Every message can be validated independently
3. **Transport independence** — No coupling to specific wire formats
4. **Institutional memory** — All communication is observable and replayable
5. **Progressive disclosure** — Simple use cases require minimal ceremony

### Design Principles

- **Structured Communication** — Every interaction has a defined type, version, and lifecycle
- **Event-Driven Architecture** — State changes propagate through observable event streams
- **Runtime Independence** — No dependency on any specific AI platform or language runtime
- **Backward Compatibility** — Protocol versions negotiate compatibility without breaking existing agents
- **Versioned Protocols** — Message schemas, events, and capabilities are versioned independently
- **Auditability** — All messages and events are traceable with correlation and trace identifiers
- **Observability** — Metrics, timelines, and traces are first-class citizens of the protocol
- **Scalability** — Transport implementations can be swapped without changing agent logic
- **Extensibility** — Plugin system allows custom transports, codecs, and middleware without forking

## Motivation

Existing agent frameworks couple communication logic to runtime specifics. IACP extracts the communication layer into a standalone concern so that:

- Agents written in different languages can interoperate
- Audit trails span organizational boundaries
- Communication policies evolve independently of agent logic
- New transport mechanisms can be adopted without rewriting agents

## High-Level Architecture

```
┌──────────────────────────────────────────────────┐
│                  Agent Layer                     │
│  (Your application logic, models, workflows)     │
├──────────────────────────────────────────────────┤
│            IACP Protocol Layer                   │
│  Message Envelope · Schema Registry · Routing    │
├──────────────────────────────────────────────────┤
│           Transport Abstraction Layer            │
│  IPC · TCP · MQ · WebSocket · Custom             │
├──────────────────────────────────────────────────┤
│              Observable Stream                   │
│  Events · Metrics · Audit Trail                  │
└──────────────────────────────────────────────────┘
```

## Use Cases

| Scenario | Benefit |
|----------|---------|
| Multi-language agent systems | Shared protocol across Python, TS, Go, Rust |
| Regulated environments | Audit trail for every inter-agent message |
| Plugin ecosystems | Versioned capability discovery |
| Edge deployments | Transport switching without agent changes |
| CI/CD pipelines | Deterministic message routing between stages |

## Installation

The Institutional Agent Communication Protocol (IACP) Framework is currently under active development.

The project foundation and architecture are already available.

Official runtime packages will be published after the first stable release.

### Future Installation

**npm**

```bash
npm install @iacp/framework
```

**Python**

```bash
pip install iacp-framework
```

**Go**

```bash
go get github.com/iacp-framework/core
```

**Rust**

```bash
cargo add iacp-framework
```

### Build from Source

Until official packages are released, the framework should be used directly from the source code.

See [INSTALL.md](INSTALL.md) for detailed build instructions and test commands.

## Development Roadmap

Phase 1 — Foundation
Status: Complete

Phase 2 — Core Runtime
Status: Complete

Phase 3 — Communication Infrastructure
Status: Complete

Phase 4 — SDKs and Connectors
Status: Complete

Phase 5 — First Stable Release (v1.0.0)
Status: Planned

## Compatible Runtimes (Planned)

Compatibility with the following runtimes will be provided through independent connectors:

- OpenCode
- Claude Code
- Cursor
- Codex
- Gemini
- OpenAI
- Ollama
- vLLM
- LM Studio

Each connector translates harness-specific calls to IACP protocol messages. No connector modifies or depends on the target harness. Connectors are optional and independently installable.

## Roadmap

| Phase | Focus | Status |
|-------|-------|--------|
| 1 | Foundation structure, documentation, schemas | ✅ Complete |
| 2 | Core protocol: message envelope, events, context, AST, versioning | ✅ Complete |
| 3 | Communication infrastructure: message bus, event bus, queues, transport, routing | ✅ Complete |
| 4 | SDK, plugin system, connectors (9 harnesses), runtime | ✅ Complete |
| 5 | GitHub publication, CI/CD, cross-platform validation | ✅ Complete |
| 6 | REST, WebSocket, gRPC transport adapters | ✅ Complete |
| 7 | Production hardening: security, encryption, rate limiting | ✅ Complete |
| 8 | Ecosystem: marketplace, plugin discovery, documentation site | ✅ Complete |

**Tests:** 134/134 (100%) across all phases.

## Open Source

IACP Framework is an independent open source project.

It is not tied to any specific commercial platform, AI model, or vendor ecosystem.

The protocol definitions, message formats, and runtime contracts are public and versioned.

Third-party connectors and plugins can be built without requiring access to the core framework internals.

Contributions, extensions, and forks are welcome under the terms of the license.

## License

Apache 2.0 — See [LICENSE](LICENSE).

---

*Built for agents that need to talk to each other, not just to humans.*
