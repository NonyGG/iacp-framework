'use strict';

class APIEntry {
  constructor(name, opts = {}) {
    this.name = name; this.module = opts.module || ''; this.description = opts.description || '';
    this.version = opts.version || '0.2.0'; this.status = opts.status || 'stable';
    this.examples = opts.examples || []; this.deprecated = opts.deprecated || false;
    this.deprecationMessage = opts.deprecationMessage || '';
  }
}

class APIRegistry {
  constructor() { this._apis = new Map(); }

  register(name, opts) { this._apis.set(name, new APIEntry(name, opts)); return this; }
  get(name) { return this._apis.get(name) || null; }
  has(name) { return this._apis.has(name); }
  list() { return Array.from(this._apis.values()); }
  count() { return this._apis.size; }

  byStatus(status) { return this.list().filter(a => a.status === status); }
  stable() { return this.byStatus('stable'); }
  deprecated() { return this.list().filter(a => a.deprecated); }
  experimental() { return this.byStatus('experimental'); }

  summary() {
    return { total: this.count(), stable: this.stable().length, experimental: this.experimental().length, deprecated: this.list().filter(a => a.deprecated).length };
  }
}

module.exports = { APIRegistry, APIEntry };
