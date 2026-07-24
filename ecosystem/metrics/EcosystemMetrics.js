'use strict';

class EcosystemMetrics {
  constructor() { this._snapshots = []; }
  snapshot(marketplace, discovery, certification, apiRegistry) {
    const s = {
      timestamp: Date.now(),
      marketplace: marketplace ? { plugins: marketplace.catalog.count(), searches: marketplace._stats.searches, downloads: marketplace._stats.totalDownloads } : null,
      discovery: discovery ? { installed: discovery.count(), available: discovery.findAvailable().length } : null,
      certification: certification ? certification.summary() : null,
      api: apiRegistry ? apiRegistry.summary() : null,
    };
    this._snapshots.push(s);
    return s;
  }
  history() { return this._snapshots; }
  latest() { return this._snapshots[this._snapshots.length - 1] || null; }
}

module.exports = { EcosystemMetrics };
