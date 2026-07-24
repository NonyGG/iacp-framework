# Message Bus

The Message Bus provides publish/subscribe messaging with retry, timeout, and dead letter queue support. It sits on top of the Transport and Routing layers.

## Features

- **Publish/Subscribe** — Topic-based pub/sub with automatic delivery
- **Request/Response** — Correlation-based request-response pattern
- **Retry** — Automatic retry with configurable max attempts
- **Dead Letter Queue** — Failed messages stored for analysis
- **Timeout** — Timer management with automatic cleanup

## Usage

```javascript
const { MessageBus } = require('iacp-framework/communication');
const bus = new MessageBus(transport, router, dispatcher);

bus.subscribe('tasks.process', 'worker-1', (msg) => {
  console.log('Received:', msg);
});

bus.publish('tasks.process', { cmd: 'analyze' });
bus.request('worker-2', { query: 'status' }, 'admin', 5000);
```
