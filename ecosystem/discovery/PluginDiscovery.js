'use strict';

class PluginDiscovery {
  constructor(marketplace) { this._marketplace = marketplace; this._installed = new Map(); }

  install(pluginId) {
    const meta = this._marketplace.catalog.get(pluginId);
    if (!meta) throw new Error(`Plugin not found: ${pluginId}`);
    // Resolve dependencies
    for (const [dep, ver] of Object.entries(meta.dependencies || {})) {
      if (!this._installed.has(dep)) throw new Error(`Missing dependency: ${dep}@${ver}`);
    }
    if (this._installed.has(pluginId)) throw new Error(`Already installed: ${pluginId}`);
    this._installed.set(pluginId, { meta, installedAt: Date.now(), enabled: true });
    return meta;
  }

  uninstall(pluginId) {
    // Check if other installed plugins depend on this one
    for (const [id, entry] of this._installed) {
      if (id === pluginId) continue;
      if (entry.meta.dependencies && entry.meta.dependencies[pluginId]) throw new Error(`Cannot remove: ${pluginId} is required by ${id}`);
    }
    this._installed.delete(pluginId);
    return true;
  }

  update(pluginId) {
    const installed = this._installed.get(pluginId);
    if (!installed) throw new Error(`Not installed: ${pluginId}`);
    const latest = this._marketplace.catalog.get(pluginId);
    if (!latest) throw new Error(`No update available for: ${pluginId}`);
    installed.meta = latest; installed.updatedAt = Date.now();
    return latest;
  }

  enable(pluginId) { const p = this._installed.get(pluginId); if (p) p.enabled = true; return this; }
  disable(pluginId) { const p = this._installed.get(pluginId); if (p) p.enabled = false; return this; }

  getInstalled() { return Array.from(this._installed.values()).map(e => ({ id: e.meta.id, name: e.meta.name, version: e.meta.version, enabled: e.enabled, installedAt: e.installedAt })); }
  isInstalled(id) { return this._installed.has(id); }
  count() { return this._installed.size; }
  findAvailable(tag) { return tag ? this._marketplace.catalog.byTag(tag) : this._marketplace.catalog.list(); }
}

module.exports = { PluginDiscovery };
