'use strict';

class TransportRegistry {
  constructor() { this._adapters = new Map(); }
  register(name, adapterClass) { this._adapters.set(name, adapterClass); return this; }
  get(name) { const a = this._adapters.get(name); return a ? a : null; }
  has(name) { return this._adapters.has(name); }
  list() { return Array.from(this._adapters.keys()); }
  count() { return this._adapters.size; }
}

class TransportFactory {
  constructor(registry) { this._registry = registry; }

  create(name, config = {}) {
    const Cls = this._registry.get(name);
    if (!Cls) throw new Error(`Unknown transport: ${name}. Available: ${this._registry.list().join(', ')}`);
    return new Cls(config);
  }

  async startAll(configs = {}) {
    const started = [];
    for (const [name, cfg] of Object.entries(configs)) {
      const t = this.create(name, cfg);
      await t.start();
      started.push(t);
    }
    return started;
  }
}

module.exports = { TransportRegistry, TransportFactory };
