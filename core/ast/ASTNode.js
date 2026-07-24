'use strict';

const { AstNodeType } = require('../common/types.js');
const { createId, hashContent } = require('../common/identifiers.js');

class ASTNode {
  constructor(type, data = {}) {
    this.id = createId('ast', 8);
    this.type = type;
    this.data = data;
    this.children = [];
    this.parentId = null;
    this.createdAt = Date.now();
    this.hash = hashContent({ type, data });
  }

  addChild(child) { child.parentId = this.id; this.children.push(child); return this; }
  toJSON() { return { id: this.id, type: this.type, children: this.children.map(c => c.toJSON ? c.toJSON() : c), createdAt: this.createdAt, hash: this.hash }; }
}

class MissionAST extends ASTNode {
  constructor(data) { super(AstNodeType.MISSION, data); }
}

class WorkflowAST extends ASTNode {
  constructor(data) { super(AstNodeType.WORKFLOW, data); }
}

class RuntimeAST extends ASTNode {
  constructor(data) { super(AstNodeType.RUNTIME, data); }
}

class ContextAST extends ASTNode {
  constructor(data) { super(AstNodeType.CONTEXT, data); }
}

class KnowledgeAST extends ASTNode {
  constructor(data) { super(AstNodeType.KNOWLEDGE, data); }
}

class ASTBuilder {
  constructor() { this._trees = new Map(); }

  createMission(data) { const n = new MissionAST(data); this._trees.set(n.id, n); return n; }
  createWorkflow(data) { const n = new WorkflowAST(data); this._trees.set(n.id, n); return n; }
  createRuntime(data) { const n = new RuntimeAST(data); this._trees.set(n.id, n); return n; }
  createContext(data) { const n = new ContextAST(data); this._trees.set(n.id, n); return n; }
  createKnowledge(data) { const n = new KnowledgeAST(data); this._trees.set(n.id, n); return n; }

  get(id) { return this._trees.get(id); }
  list() { return Array.from(this._trees.values()); }
  count() { return this._trees.size; }

  link(parentId, childId) {
    const parent = this._trees.get(parentId);
    const child = this._trees.get(childId);
    if (parent && child) { parent.addChild(child); return true; }
    return false;
  }

  toJSON() { return { trees: this.list().map(t => t.toJSON()) }; }
}

module.exports = { ASTNode, MissionAST, WorkflowAST, RuntimeAST, ContextAST, KnowledgeAST, ASTBuilder };
