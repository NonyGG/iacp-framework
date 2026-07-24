'use strict';

class AdapterManager {
  constructor() {
    this._adapters = new Map();
    this._priorities = new Map();
    this._fallback = new Map();
  }

  register(name, adapter, priority = 0) {
    this._adapters.set(name, adapter);
    this._priorities.set(name, priority);
    return this;
  }

  get(name) { return this._adapters.get(name) || null; }
  has(name) { return this._adapters.has(name); }
  list() { return Array.from(this._adapters.keys()); }

  setFallback(name, fallbackName) { this._fallback.set(name, fallbackName); return this; }

  async startAll() {
    const results = [];
    for (const [name, adapter] of this._adapters) {
      if (!adapter.started) { try { await adapter.start(); results.push({ name, status: 'started' }); } catch (e) { results.push({ name, status: 'error', error: e.message }); } }
    }
    return results;
  }

  async stopAll() {
    for (const adapter of this._adapters.values()) { if (adapter.started) await adapter.stop(); }
  }

  select(strategy = 'priority') {
    if (strategy === 'priority') {
      const sorted = Array.from(this._adapters.entries()).sort((a, b) => (this._priorities.get(b[0]) || 0) - (this._priorities.get(a[0]) || 0));
      for (const [name, adapter] of sorted) { if (adapter.started) return { name, adapter }; }
      return null;
    }
    if (strategy === 'round_robin') {
      for (const [name, adapter] of this._adapters) { if (adapter.started) return { name, adapter }; }
      return null;
    }
    return null;
  }

  async sendWithFallback(target, payload, primary) {
    const primaryAdapter = this._adapters.get(primary);
    if (primaryAdapter && primaryAdapter.started) {
      try { return await primaryAdapter.send(target, payload); }
      catch (e) { const fallbackName = this._fallback.get(primary); if (fallbackName) return this._fallbackSend(target, payload, fallbackName); throw e; }
    }
    const fallbackName = this._fallback.get(primary);
    if (fallbackName) return this._fallbackSend(target, payload, fallbackName);
    throw new Error(`No available adapter for: ${primary}`);
  }

  async _fallbackSend(target, payload, name) {
    const adapter = this._adapters.get(name);
    if (!adapter || !adapter.started) throw new Error(`Fallback ${name} unavailable`);
    return adapter.send(target, payload);
  }

  async broadcast(payload) {
    const results = [];
    for (const [name, adapter] of this._adapters) {
      if (adapter.started) { try { await adapter.send(null, payload); results.push({ name, status: 'sent' }); } catch (e) { results.push({ name, status: 'error' }); } }
    }
    return results;
  }

  async health() {
    const results = {};
    for (const [name, adapter] of this._adapters) { results[name] = await adapter.health(); }
    return results;
  }

  status() {
    return { adapters: this.list().length, started: Array.from(this._adapters.values()).filter(a => a.started).length, names: this.list() };
  }
}

module.exports = { AdapterManager };
