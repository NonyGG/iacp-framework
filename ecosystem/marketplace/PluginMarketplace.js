'use strict';

class PluginMetadata {
  constructor(data) {
    this.id = data.id; this.name = data.name; this.version = data.version;
    this.author = data.author || ''; this.description = data.description || '';
    this.tags = data.tags || []; this.homepage = data.homepage || '';
    this.license = data.license || 'Apache-2.0';
    this.dependencies = data.dependencies || {};
    this.iacpVersion = data.iacpVersion || '>=0.2.0';
    this.signature = data.signature || null;
    this.rating = data.rating || 0;
    this.downloads = data.downloads || 0;
    this.createdAt = data.createdAt || Date.now();
    this.updatedAt = data.updatedAt || Date.now();
  }
}

class PluginCatalog {
  constructor() { this._plugins = new Map(); }
  add(meta) { this._plugins.set(meta.id, meta); return this; }
  get(id) { return this._plugins.get(id) || null; }
  has(id) { return this._plugins.has(id); }
  remove(id) { this._plugins.delete(id); return this; }
  list() { return Array.from(this._plugins.values()); }
  count() { return this._plugins.size; }

  search(query) {
    const q = query.toLowerCase();
    return this.list().filter(p =>
      p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) ||
      p.tags.some(t => t.includes(q)) || p.author.toLowerCase().includes(q));
  }

  byTag(tag) { return this.list().filter(p => p.tags.includes(tag)); }
  byAuthor(author) { return this.list().filter(p => p.author === author); }
  topRated(limit = 10) { return this.list().sort((a, b) => b.rating - a.rating).slice(0, limit); }
  recentlyUpdated(limit = 10) { return this.list().sort((a, b) => b.updatedAt - a.updatedAt).slice(0, limit); }
}

class PluginValidator {
  validate(meta) {
    const errors = [];
    if (!meta.id) errors.push('id is required');
    if (!meta.name) errors.push('name is required');
    if (!meta.version) errors.push('version is required');
    if (!/^[a-z][a-z0-9_-]*$/.test(meta.id || '')) errors.push('id must be lowercase alphanumeric');
    if (!/^\d+\.\d+\.\d+/.test(meta.version || '')) errors.push('version must be semver');
    return { valid: errors.length === 0, errors };
  }

  checkCompatibility(meta, runtimeVersion) {
    if (!meta.iacpVersion) return true;
    const required = meta.iacpVersion.replace('>=', '');
    const parts = required.split('.').map(Number);
    const rt = runtimeVersion.split('.').map(Number);
    for (let i = 0; i < 3; i++) { if ((parts[i] || 0) > (rt[i] || 0)) return false; }
    return true;
  }
}

class PluginSigning {
  constructor() { this._keys = new Map(); }
  addKey(id, publicKey) { this._keys.set(id, publicKey); return this; }
  sign(meta, privateKey) { const crypto = require('crypto'); const s = crypto.createSign('sha256WithRSAEncryption'); s.update(JSON.stringify(meta)); s.end(); meta.signature = s.sign(privateKey, 'base64'); return meta; }
  verify(meta) { if (!meta.signature || !meta.author) return false; const key = this._keys.get(meta.author); if (!key) return false; const crypto = require('crypto'); const v = crypto.createVerify('sha256WithRSAEncryption'); v.update(JSON.stringify({ ...meta, signature: undefined })); v.end(); return v.verify(key, meta.signature, 'base64'); }
}

class PluginMarketplace {
  constructor() {
    this.catalog = new PluginCatalog();
    this.validator = new PluginValidator();
    this.signing = new PluginSigning();
    this._stats = { totalDownloads: 0, searches: 0 };
  }

  publish(meta) {
    const v = this.validator.validate(meta);
    if (!v.valid) throw new Error('Invalid plugin: ' + v.errors.join('; '));
    this.catalog.add(meta);
    return meta;
  }

  search(query) { this._stats.searches++; return this.catalog.search(query); }
  download(id) { const p = this.catalog.get(id); if (p) { p.downloads++; this._stats.totalDownloads++; } return p; }
  stats() { return { plugins: this.catalog.count(), downloads: this._stats.totalDownloads, searches: this._stats.searches }; }
}

module.exports = { PluginMarketplace, PluginCatalog, PluginMetadata, PluginValidator, PluginSigning };
