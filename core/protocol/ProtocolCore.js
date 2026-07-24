'use strict';

const { VersionManager } = require('../version/VersionManager.js');
const { ProtocolPhase } = require('../common/types.js');
const { createId } = require('../common/identifiers.js');

class FeatureFlag {
  constructor(name, enabled = false, version = '1.0.0') {
    this.name = name;
    this.enabled = enabled;
    this.version = version;
  }
}

class FeatureFlagSet {
  constructor() { this._flags = new Map(); }

  register(name, version) {
    if (!this._flags.has(name)) this._flags.set(name, new FeatureFlag(name, false, version));
    return this;
  }

  enable(name) { const f = this._flags.get(name); if (f) f.enabled = true; return this; }
  disable(name) { const f = this._flags.get(name); if (f) f.enabled = false; return this; }
  isEnabled(name) { const f = this._flags.get(name); return f ? f.enabled : false; }
  list() { return Array.from(this._flags.values()).map(f => ({ name: f.name, enabled: f.enabled, version: f.version })); }
}

class CompatibilityManager {
  constructor() { this._rules = []; }

  addRule(domain, predicate) {
    this._rules.push({ domain, predicate });
    return this;
  }

  check(domain, version, context = {}) {
    const relevant = this._rules.filter(r => r.domain === domain || r.domain === '*');
    for (const rule of relevant) {
      if (!rule.predicate(version, context)) return false;
    }
    return true;
  }
}

class SchemaRegistry {
  constructor() { this._schemas = new Map(); }

  register(name, schema) {
    this._schemas.set(name, { schema, registeredAt: Date.now() });
    return this;
  }

  get(name) { const s = this._schemas.get(name); return s ? s.schema : null; }
  has(name) { return this._schemas.has(name); }
  list() { return Array.from(this._schemas.keys()); }
}

class CapabilityRegistry {
  constructor() { this._capabilities = new Map(); }

  declare(agentId, capabilities) {
    this._capabilities.set(agentId, { capabilities, declaredAt: Date.now() });
    return this;
  }

  get(agentId) { const c = this._capabilities.get(agentId); return c ? c.capabilities : []; }
  has(agentId, capability) {
    const caps = this.get(agentId);
    return caps.includes(capability);
  }
  list() { return Array.from(this._capabilities.entries()).map(([id, c]) => ({ id, capabilities: c.capabilities })); }
}

class ProtocolCore {
  constructor() {
    this.id = createId('proto', 6);
    this.versions = new VersionManager();
    this.features = new FeatureFlagSet();
    this.compatibility = new CompatibilityManager();
    this.schemas = new SchemaRegistry();
    this.capabilities = new CapabilityRegistry();
    this._phase = ProtocolPhase.HANDSHAKE;
  }

  get phase() { return this._phase; }
  transitionTo(newPhase) { this._phase = newPhase; return this; }
}

module.exports = { ProtocolCore, FeatureFlag, FeatureFlagSet, CompatibilityManager, SchemaRegistry, CapabilityRegistry };
