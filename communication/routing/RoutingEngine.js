'use strict';

class DestinationResolver {
  constructor() { this._routes = new Map(); }
  register(name, address) { this._routes.set(name, address); return this; }
  resolve(name) { return this._routes.get(name) || null; }
  remove(name) { this._routes.delete(name); return this; }
  list() { return Array.from(this._routes.entries()).map(([k, v]) => ({ name: k, address: v })); }
}

class AgentResolver {
  constructor() { this._agents = new Map(); }
  register(id, metadata = {}) { this._agents.set(id, { id, ...metadata, registeredAt: Date.now() }); return this; }
  resolve(id) { return this._agents.get(id) || null; }
  findByCapability(cap) { return Array.from(this._agents.values()).filter(a => a.capabilities && a.capabilities.includes(cap)); }
  list() { return Array.from(this._agents.values()); }
  remove(id) { this._agents.delete(id); }
  count() { return this._agents.size; }
}

class WorkflowResolver {
  constructor() { this._workflows = new Map(); }
  register(id, target) { this._workflows.set(id, target); return this; }
  resolve(id) { return this._workflows.get(id) || null; }
  list() { return Array.from(this._workflows.entries()).map(([k, v]) => ({ id: k, target: v })); }
}

class RuntimeResolver {
  constructor() { this._runtimes = new Map(); }
  register(name, endpoint, weight = 1) {
    this._runtimes.set(name, { name, endpoint, weight, healthy: true, registeredAt: Date.now() });
    return this;
  }
  resolve(name) { return this._runtimes.get(name) || null; }
  select(strategy = 'round_robin') {
    const available = Array.from(this._runtimes.values()).filter(r => r.healthy);
    if (available.length === 0) return null;
    if (strategy === 'random') return available[Math.floor(Math.random() * available.length)];
    if (strategy === 'weighted') {
      const total = available.reduce((s, r) => s + r.weight, 0);
      let r = Math.random() * total;
      for (const rt of available) { r -= rt.weight; if (r <= 0) return rt; }
    }
    return available[0];
  }
  markHealth(name, healthy) { const r = this._runtimes.get(name); if (r) r.healthy = healthy; return this; }
  list() { return Array.from(this._runtimes.values()); }
}

class BroadcastResolver {
  constructor() { this._groups = new Map(); }
  createGroup(name) { if (!this._groups.has(name)) this._groups.set(name, new Set()); return this; }
  join(group, member) { this.createGroup(group); this._groups.get(group).add(member); return this; }
  leave(group, member) { const g = this._groups.get(group); if (g) g.delete(member); return this; }
  members(group) { const g = this._groups.get(group); return g ? Array.from(g) : []; }
  groups() { return Array.from(this._groups.keys()); }
}

class RoutingEngine {
  constructor() {
    this.destinations = new DestinationResolver();
    this.agents = new AgentResolver();
    this.workflows = new WorkflowResolver();
    this.runtimes = new RuntimeResolver();
    this.broadcast = new BroadcastResolver();
  }
}

module.exports = { RoutingEngine, DestinationResolver, AgentResolver, WorkflowResolver, RuntimeResolver, BroadcastResolver };
