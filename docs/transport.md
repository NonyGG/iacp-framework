# Transport Layer

The Transport Layer provides abstract communication channels between agents. Only MemoryTransport is implemented in this phase.

## MemoryTransport

In-process message delivery with guaranteed ordering, TTL, and acknowledgment tracking.

### Features

- **Point-to-Point** — Direct message between sender and recipient
- **Broadcast** — Message to multiple recipients
- **Send-and-Wait** — Blocking request with timeout
- **TTL** — Time-to-live expiration
- **Ack/Nack** — Delivery confirmation
- **Stats** — Sent, delivered, acked, failed, dropped counters

### Interfaces (Future)

- RESTTransport — HTTP-based transport
- WebSocketTransport — Bidirectional streaming
- gRPCTransport — High-performance RPC

## Usage

```python
const { MemoryTransport } = require('iacp-framework/communication');
const transport = new MemoryTransport();

transport.listen('agent:worker', (msg) => {
  console.log('Got:', msg.payload);
});

transport.send('system', 'agent:worker', { cmd: 'start' });
transport.broadcast('system', { alert: 'all' }, ['agent:1', 'agent:2']);
```
