## Installation

> ⚠️ **Development Status**
>
> The Institutional Agent Communication Protocol (IACP) Framework is currently under active development.
> The repository already contains the project foundation, architecture, core protocol, communication
> infrastructure, SDKs, and plugin system. The official runtime packages have not been published yet.

### Current Status

| Component | Status |
|-----------|--------|
| Project Foundation & Documentation | ✅ Complete |
| Core Protocol (messages, events, context, AST, versioning, errors) | ✅ Complete |
| Communication Infrastructure (message bus, event bus, queues, transport, routing) | ✅ Complete |
| SDK (Python, Node.js, Go stub, Rust stub) | ✅ Complete |
| Plugin System (registry, loader, validator, lifecycle) | ✅ Complete |
| Connectors (9 harnesses) | ✅ Complete |
| Runtime Entrypoint | ✅ Complete |
| Tests (134/134) | ✅ Complete |
| First Stable Release (v0.3.0) | 🚧 Planned |

---

## Future Installation

### npm

```bash
npm install @iacp/framework
```

### Python

```bash
pip install iacp-framework
```

### Go

```bash
go get github.com/iacp-framework/core
```

### Rust

```bash
cargo add iacp-framework
```

---

## Build from Source

Until the first official release is published, clone the repository:

```bash
git clone https://github.com/iacp-framework/institutional-agent-protocol.git
cd institutional-agent-protocol
```

### Run Tests

```bash
# Core protocol tests (48 tests)
node tests/unit/core.test.js

# Communication infrastructure tests (38 tests)
node tests/unit/communication.test.js

# Runtime, SDK, and connector tests (48 tests)
node tests/unit/phase4.test.js
```

### Try the Python SDK

```python
import sys; sys.path.insert(0, 'sdk/python')
from iacp.client import Client
from iacp.server import Server

agent = Client("agent-1")
agent.send("agent-2", {"cmd": "ping"})
```
