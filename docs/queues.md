# Queue System

Independent queue implementations for different delivery guarantees and ordering requirements.

## Queue Types

| Queue | Behavior | Use Case |
|-------|----------|----------|
| FIFOQueue | First-in-first-out, ordered delivery | Sequential processing |
| PriorityQueue | Items sorted by priority (highest first) | Urgent messages |
| DelayedQueue | Items available only after delay | Scheduled delivery |
| RetryQueue | Items retried up to max attempts, then failed | Fault tolerance |
| DeadLetterQueue | Stores permanently failed items | Error analysis |

## Usage

```javascript
const { FIFOQueue, PriorityQueue, DeadLetterQueue } = require('iacp-framework/communication');

const queue = new FIFOQueue('tasks');
queue.push({ id: 1 });
queue.push({ id: 2 });
const item = queue.pop(); // { id: 1 }

const dlq = new DeadLetterQueue('failures');
dlq.send({ msg: 'timeout' }, 'exceeded_ttl');
const failed = dlq.replay(10);
```
