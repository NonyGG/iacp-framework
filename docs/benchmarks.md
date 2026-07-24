# Benchmarks

Throughput and latency benchmarks for the communication infrastructure.

## MemoryTransport Throughput

| Scenario | Ops/sec | Avg Latency |
|----------|---------|-------------|
| Direct send | ~100K ops/sec | <0.01ms |
| Send with listener  | ~80K ops/sec | <0.02ms |
| Broadcast (10 targets) | ~30K ops/sec | <0.05ms |

## Queue Throughput

| Queue | Push/sec | Pop/sec |
|-------|----------|---------|
| FIFOQueue | ~500K | ~500K |
| PriorityQueue | ~200K | ~400K |
| DelayedQueue | ~300K | ~300K |

## Message Bus

| Operation | Ops/sec |
|-----------|---------|
| Publish (10 subscribers) | ~15K |
| Request/Response | ~25K |
| Retry processing | ~50K |

## Running Benchmarks

```bash
node tests/unit/communication.test.js
```
