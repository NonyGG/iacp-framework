# IACP Framework — Rust SDK

## Status

Pre-alpha. The library structure and minimum API surface are defined.
Full implementation is in progress.

## Integration

The Rust SDK will allow Rust applications to create IACP-compatible agents,
send and receive protocol messages, and participate in the institutional
communication infrastructure.

## Compatibility

- Rust 2021 edition
- Cross-platform (Linux, macOS, Windows)
- Zero non-std dependencies planned

## Usage (Planned)

```rust
use iacp_framework::Agent;

let agent = Agent::new("agent-1");
let msg = agent.send("agent-2", r#"{"cmd":"ping"}"#);
```
