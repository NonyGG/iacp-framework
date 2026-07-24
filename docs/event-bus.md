# Event Bus

The Event Bus provides topic-based event distribution with replay, streaming, and filtering capabilities.

## Features

- **Topics/Channels** — Named event channels
- **Pub/Sub** — Subscribe to topics with handlers
- **Replay** — Event history by topic and time range
- **Stream** — Continuous event subscription with history
- **Filters** — Pre-processing event filters
- **Global Handlers** — Catch-all observers

## Usage

```javascript
const { EventBus } = require('iacp-framework/communication');
const events = new EventBus();

events.subscribe('orders.created', 'audit-log', (event) => {
  console.log('Order created:', event);
});

events.publish('orders.created', { orderId: 123, total: 99.99 });
const history = events.replay('orders.created');
```
