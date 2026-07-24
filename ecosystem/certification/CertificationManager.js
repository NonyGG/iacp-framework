'use strict';

const LEVELS = ['certified', 'compatible', 'experimental', 'deprecated'];

class CertificationManager {
  constructor() { this._certifications = new Map(); }

  certify(componentId, level = 'certified', metadata = {}) {
    if (!LEVELS.includes(level)) throw new Error(`Invalid level: ${level}. Use: ${LEVELS.join(', ')}`);
    const cert = { componentId, level, metadata, certifiedAt: Date.now(), updatedAt: Date.now() };
    this._certifications.set(componentId, cert);
    return cert;
  }

  revoke(componentId) { this._certifications.delete(componentId); return this; }
  update(componentId, level) { const c = this._certifications.get(componentId); if (c) { c.level = level; c.updatedAt = Date.now(); } return this; }

  get(componentId) { return this._certifications.get(componentId) || null; }

  list(level) {
    const all = Array.from(this._certifications.values());
    return level ? all.filter(c => c.level === level) : all;
  }

  count(level) { return this.list(level).length; }
  summary() { const r = {}; for (const l of LEVELS) r[l] = this.count(l); return r; }
}

module.exports = { CertificationManager };
