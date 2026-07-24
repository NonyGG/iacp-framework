'use strict';

class ConfigProfile {
  constructor(name, values = {}) { this.name = name; this._values = { ...values }; this._schema = {}; }
  get(key) { return this._values[key] !== undefined ? this._values[key] : null; }
  set(key, value) { this._values[key] = value; return this; }
  load(envPrefix = 'IACP_') {
    for (const [k, v] of Object.entries(process.env)) {
      if (k.startsWith(envPrefix)) { const configKey = k.slice(envPrefix.length).toLowerCase().replace(/_/g, '.'); this._values[configKey] = v; }
    }
    return this;
  }
  validate() {
    const errors = [];
    for (const [key, rules] of Object.entries(this._schema)) {
      const val = this._values[key];
      if (rules.required && (val === undefined || val === null)) errors.push(`${key} is required`);
      if (val !== undefined && rules.type && typeof val !== rules.type) errors.push(`${key} must be ${rules.type}`);
    }
    return { valid: errors.length === 0, errors };
  }
  schema(key, rules) { this._schema[key] = rules; return this; }
  toJSON() { return { ...this._values }; }
}

class ConfigManager {
  constructor() { this._profiles = new Map(); this._active = null; }
  addProfile(name, values) { this._profiles.set(name, new ConfigProfile(name, values)); return this; }
  activate(name) { const p = this._profiles.get(name); if (!p) throw new Error(`Unknown profile: ${name}`); this._active = p; return p; }
  get active() { return this._active; }
  get(key) { return this._active ? this._active.get(key) : null; }
  list() { return Array.from(this._profiles.keys()); }
}

module.exports = { ConfigManager, ConfigProfile };
