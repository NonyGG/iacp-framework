'use strict';

class AuthProvider {
  async authenticate(credentials) { throw new Error('implement authenticate'); }
}

class Identity {
  constructor(id, roles = []) { this.id = id; this.roles = roles; this.authenticatedAt = Date.now(); }
  hasRole(role) { return this.roles.includes(role); }
}

class PermissionManager {
  constructor() { this._policies = new Map(); }
  grant(role, resource, action) {
    if (!this._policies.has(role)) this._policies.set(role, []);
    this._policies.get(role).push({ resource, action }); return this;
  }
  check(identity, resource, action) {
    for (const role of identity.roles) {
      const policies = this._policies.get(role) || [];
      if (policies.some(p => this._match(p, resource, action))) return true;
    }
    return false;
  }
  _match(policy, resource, action) {
    const rMatch = policy.resource === '*' || policy.resource === resource;
    const aMatch = policy.action === '*' || policy.action === action;
    return rMatch && aMatch;
  }
}

class SecurityManager {
  constructor() { this._auth = new Map(); this._permissions = new PermissionManager(); this._policies = []; }
  registerProvider(name, provider) { this._auth.set(name, provider); return this; }
  get permissions() { return this._permissions; }
  async authenticate(providerName, credentials) {
    const provider = this._auth.get(providerName);
    if (!provider) throw new Error(`Unknown auth provider: ${providerName}`);
    return provider.authenticate(credentials);
  }
  authorize(identity, resource, action) { return this._permissions.check(identity, resource, action); }
  addPolicy(name, fn) { this._policies.push({ name, fn }); return this; }
  validate(identity, resource, action, context = {}) {
    if (!this.authorize(identity, resource, action)) return { allowed: false, reason: 'denied' };
    for (const p of this._policies) { if (!p.fn(identity, resource, action, context)) return { allowed: false, reason: `policy: ${p.name}` }; }
    return { allowed: true };
  }
}

module.exports = { SecurityManager, AuthProvider, Identity, PermissionManager };
