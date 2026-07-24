'use strict';

class RFC {
  constructor(title, author, content) {
    this.id = `RFC-${Date.now()}-${Math.random().toString(36).slice(2,4)}`;
    this.title = title; this.author = author; this.content = content;
    this.status = 'draft'; this.comments = []; this.createdAt = Date.now();
  }
  submit() { this.status = 'review'; return this; }
  approve() { this.status = 'approved'; return this; }
  reject(reason) { this.status = 'rejected'; this.rejectionReason = reason; return this; }
  implement() { this.status = 'implemented'; return this; }
  comment(author, text) { this.comments.push({ author, text, timestamp: Date.now() }); return this; }
}

class GovernanceManager {
  constructor() { this._rfcs = new Map(); this._guidelines = []; this._members = []; }

  createRFC(title, author, content) { const r = new RFC(title, author, content); this._rfcs.set(r.id, r); return r; }
  getRFC(id) { return this._rfcs.get(id) || null; }
  listRFCs(status) { const all = Array.from(this._rfcs.values()); return status ? all.filter(r => r.status === status) : all; }

  addGuideline(name, text) { this._guidelines.push({ name, text, addedAt: Date.now() }); return this; }
  get guidelines() { return this._guidelines; }

  addMember(id, role) { this._members.push({ id, role, joinedAt: Date.now() }); return this; }
  get members() { return this._members; }

  summary() { return { rfcs: this._rfcs.size, guidelines: this._guidelines.length, members: this._members.length }; }
}

module.exports = { GovernanceManager, RFC };
