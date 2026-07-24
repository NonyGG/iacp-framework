'use strict';

class PluginManifest {
  constructor(data) {
    this.name = data.name; this.version = data.version; this.author = data.author || '';
    this.description = data.description || ''; this.entry = data.entry || 'index.js';
    this.dependencies = data.dependencies || {}; this.capabilities = data.capabilities || [];
  }
}

class PluginRegistry {
  constructor() { this._plugins = new Map(); }
  register(manifest) { this._plugins.set(manifest.name, { manifest, loaded: false, instance: null, registeredAt: Date.now() }); return this; }
  get(name) { return this._plugins.get(name) || null; }
  has(name) { return this._plugins.has(name); }
  list() { return Array.from(this._plugins.values()).map(p => ({ name: p.manifest.name, version: p.manifest.version, loaded: p.loaded })); }
  count() { return this._plugins.size; }
  loaded() { return this.list().filter(p => p.loaded); }
}

class PluginLoader {
  constructor(registry) { this._registry = registry; }

  load(name, requireFn) {
    const entry = this._registry.get(name);
    if (!entry) throw new Error(`Plugin not found: ${name}`);
    if (typeof requireFn !== 'function') throw new Error('requireFn must be provided');
    try {
      const instance = requireFn(entry.manifest);
      entry.loaded = true; entry.instance = instance;
      return instance;
    } catch (e) { throw new Error(`Failed to load plugin ${name}: ${e.message}`); }
  }

  loadAll(requireFn) {
    const results = [];
    for (const [name] of this._registry._plugins) {
      try { results.push({ name, status: 'loaded', instance: this.load(name, requireFn) }); }
      catch (e) { results.push({ name, status: 'error', error: e.message }); }
    }
    return results;
  }
}

class PluginValidator {
  validate(manifest) {
    const errors = [];
    if (!manifest.name) errors.push('name is required');
    if (!manifest.version) errors.push('version is required');
    if (!manifest.entry) errors.push('entry point is required');
    if (manifest.name && !/^[a-z][a-z0-9_-]*$/.test(manifest.name)) errors.push('invalid plugin name format');
    if (manifest.version && !/^\d+\.\d+\.\d+/.test(manifest.version)) errors.push('invalid version format (semver required)');
    return { valid: errors.length === 0, errors };
  }
}

class PluginLifecycle {
  constructor() { this._states = new Map(); this._hooks = { init: [], start: [], stop: [], destroy: [] }; }

  state(name) { return this._states.get(name) || 'unregistered'; }
  transition(name, state) { this._states.set(name, state); return this; }

  on(event, handler) { if (this._hooks[event]) this._hooks[event].push(handler); return this; }

  async init(name, instance) {
    const handlers = this._hooks.init;
    for (const h of handlers) await h(name, instance);
    this._states.set(name, 'initialized');
  }

  async start(name, instance) {
    const handlers = this._hooks.start;
    for (const h of handlers) await h(name, instance);
    this._states.set(name, 'running');
  }

  async stop(name, instance) {
    const handlers = this._hooks.stop;
    for (const h of handlers) await h(name, instance);
    this._states.set(name, 'stopped');
  }
}

class PluginSystem {
  constructor() {
    this.registry = new PluginRegistry();
    this.loader = new PluginLoader(this.registry);
    this.validator = new PluginValidator();
    this.lifecycle = new PluginLifecycle();
  }

  install(manifest) {
    const validation = this.validator.validate(manifest);
    if (!validation.valid) throw new Error('Invalid plugin: ' + validation.errors.join('; '));
    this.registry.register(manifest);
    this.lifecycle.transition(manifest.name, 'installed');
    return this;
  }

  status() {
    return {
      total: this.registry.count(),
      loaded: this.registry.loaded().length,
      plugins: this.registry.list(),
      lifecycle: Object.fromEntries(this.lifecycle._states),
    };
  }
}

module.exports = { PluginManifest, PluginRegistry, PluginLoader, PluginValidator, PluginLifecycle, PluginSystem };
