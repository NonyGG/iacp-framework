'use strict';

const { createId, hashContent } = require('../common/identifiers.js');

class ContextReference {
  constructor(missionId, type, data = {}) {
    this.id = createId('ctx_ref', 8);
    this.missionId = missionId;
    this.type = type;
    this.data = data;
    this.hash = hashContent(data);
    this.createdAt = Date.now();
  }

  toJSON() { return { id: this.id, missionId: this.missionId, type: this.type, hash: this.hash, createdAt: this.createdAt }; }
}

class ContextDelta {
  constructor(missionId) {
    this.id = createId('ctx_delta', 8);
    this.missionId = missionId;
    this.operations = [];
    this.timestamp = Date.now();
    this.baseHash = null;
  }

  addOperation(op, path, value) {
    this.operations.push({ op, path, value, ts: Date.now() });
    return this;
  }

  get size() { return this.operations.length; }
  get isEmpty() { return this.operations.length === 0; }
  toJSON() { return { id: this.id, missionId: this.missionId, operations: this.operations, timestamp: this.timestamp, baseHash: this.baseHash }; }
}

class ContextSnapshot {
  constructor(missionId) {
    this.id = createId('ctx_snap', 8);
    this.missionId = missionId;
    this.data = {};
    this.hash = null;
    this.timestamp = Date.now();
  }

  capture(data) {
    this.data = JSON.parse(JSON.stringify(data));
    this.hash = hashContent(this.data);
    return this;
  }

  toJSON() { return { id: this.id, missionId: this.missionId, hash: this.hash, timestamp: this.timestamp }; }
}

class ContextMetadata {
  constructor(missionId) {
    this.missionId = missionId;
    this.version = 1;
    this.parentId = null;
    this.tags = [];
    this.status = 'active';
    this.lastModified = Date.now();
  }

  increment() { this.version++; this.lastModified = Date.now(); return this; }
  addTag(tag) { if (!this.tags.includes(tag)) this.tags.push(tag); return this; }
  toJSON() { return { missionId: this.missionId, version: this.version, parentId: this.parentId, tags: this.tags, status: this.status, lastModified: this.lastModified }; }
}

module.exports = { ContextReference, ContextDelta, ContextSnapshot, ContextMetadata };
