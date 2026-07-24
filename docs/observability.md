# Observability

Timelines, trace collectors, and correlation trackers for monitoring inter-agent communication.

## Components

| Component | Purpose |
|-----------|---------|
| Timeline | Ordered sequence of events with duration |
| TraceCollector | Multi-span distributed tracing |
| CorrelationTracker | Request-response correlation |

## Usage

```javascript
const { Timeline, TraceCollector } = require('iacp-framework/communication');

const tl = new Timeline('request');
tl.add('send', 'Message sent');
tl.add('receive', 'Response received');
console.log(tl.duration() + 'ms');

const traces = new TraceCollector();
traces.start('trace-1', 'service-a');
traces.addSpan('trace-1', { name: 'process' });
traces.complete('trace-1');
```
