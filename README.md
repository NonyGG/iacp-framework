# Institutional Agent Protocol (IACP) Framework

A language-agnostic communication protocol and runtime framework for multi-agent systems in institutional environments.

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

## Motivation

Existing agent frameworks couple communication logic to runtime specifics. IACP extracts the communication layer into a standalone concern so that:

- Agents written in different languages can interoperate
- Audit trails span organizational boundaries
- Communication policies evolve independently of agent logic
- New transport mechanisms can be adopted without rewriting agents

## High-Level Architecture

```
┌──────────────────────────────────────────────────┐
│                  Agent Layer                      │
│  (Your application logic, models, workflows)     │
├──────────────────────────────────────────────────┤
│            IACP Protocol Layer                    │
│  Message Envelope · Schema Registry · Routing    │
├──────────────────────────────────────────────────┤
│           Transport Abstraction Layer             │
│  IPC · TCP · MQ · WebSocket · Custom             │
├──────────────────────────────────────────────────┤
│              Observable Stream                    │
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

*Not yet available. The IACP framework is in Phase 1 foundation development.*

```bash
# Future install (npm)
npm install @iacp/framework

# Future install (pip)
pip install iacp-framework

# Future install (go)
go get github.com/iacp-framework/core
```

## Roadmap

| Phase | Focus | Status |
|-------|-------|--------|
| 1 | Foundation structure, documentation, schemas | **Active** |
| 2 | Core protocol: message envelope, schema registry | Planning |
| 3 | Transport adapters: IPC, TCP, WebSocket | Planning |
| 4 | Routing layer: topic-based, content-based | Planning |
| 5 | Observability: event stream, metrics | Planning |
| 6 | SDK: JavaScript, TypeScript, Python | Planning |
| 7 | Plugin system | Planning |
| 8 | Security: authentication, authorization | Planning |

## License

Apache 2.0 — See [LICENSE](LICENSE).

---

*Built for agents that need to talk to each other, not just to humans.*
