# AST System

## Overview

The AST (Abstract Syntax Tree) System provides a structured representation of institutional concepts — missions, workflows, runtimes, contexts, and knowledge — as typed tree nodes.

## Components

### ASTNode
Base class for all AST nodes.

- `id` — Unique node identifier
- `type` — Node type (MISSION, WORKFLOW, RUNTIME, CONTEXT, KNOWLEDGE, CERTIFICATION)
- `data` — Node-specific payload
- `children[]` — Child nodes
- `parentId` — Reference to parent
- `hash` — Content hash

### Node Types

- **MissionAST** — Institutional mission definition
- **WorkflowAST** — Workflow step composition
- **RuntimeAST** — Runtime environment specification
- **ContextAST** — Context state representation
- **KnowledgeAST** — Learned patterns and evidence

### ASTBuilder
Factory for creating and linking AST nodes.

- `createMission(data)` — Create mission node
- `createWorkflow(data)` — Create workflow node
- `createRuntime(data)` — Create runtime node
- `createContext(data)` — Create context node
- `createKnowledge(data)` — Create knowledge node
- `link(parentId, childId)` — Link parent-child relationship

## Usage

```javascript
const { ASTBuilder } = require('iacp-framework/core');
const builder = new ASTBuilder();
const mission = builder.createMission({ id: 'M-001', name: 'Audit' });
const workflow = builder.createWorkflow({ id: 'WF-001', steps: ['analyze'] });
builder.link(mission.id, workflow.id);
```
