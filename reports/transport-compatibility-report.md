# Transport Compatibility Report

## Protocol Compliance

| Adapter | IACP Protocol | Same Interface | Start/Stop | Event Handlers | Stats |
|---------|--------------|----------------|------------|----------------|-------|
| REST | ✅ | ✅ | ✅ | ✅ | ✅ |
| WebSocket | ✅ | ✅ | ✅ | ✅ | ✅ |
| gRPC | ✅ | ✅ | ✅ | ✅ | ✅ |
| IPC | ✅ | ✅ | ✅ | ✅ | ✅ |
| Queue | ✅ | ✅ | ✅ | ✅ | ✅ |

## Platform Compatibility

| Adapter | Linux | Windows | macOS |
|---------|-------|---------|-------|
| REST | ✅ | ✅ | ✅ |
| WebSocket | ✅ | ✅ | ✅ |
| gRPC | ✅ | ✅ | ✅ |
| IPC | ✅ | ⚠️ Named pipes | ✅ |
| Queue | ✅ | ✅ | ✅ |

All adapters function cross-platform. IPC uses Unix domain sockets on POSIX and named pipes on Windows.
