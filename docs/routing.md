# Routing Engine

The Routing Engine provides destination resolution, agent lookup, workflow targeting, runtime selection, and broadcast group management.

## Components

| Component | Purpose |
|-----------|---------|
| DestinationResolver | Maps names to transport addresses |
| AgentResolver | Agent registry with capability lookup |
| WorkflowResolver | Workflow-to-agent mapping |
| RuntimeResolver | Runtime selection with health checks |
| BroadcastResolver | Group-based multicast management |

## Usage

```javascript
const { RoutingEngine } = require('iacp-framework/communication');
const router = new RoutingEngine();

router.destinations.register('db-writer', 'mem://db');
router.agents.register('agent:search', { capabilities: ['search'] });
router.workflows.register('WF-DATA', 'agent:etl');
router.runtimes.register('opencode', 'local://opencode');
router.broadcast.createGroup('workers').join('workers', 'w1');
```
