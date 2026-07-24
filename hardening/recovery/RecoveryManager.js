'use strict';

class StateBackup {
  constructor() { this._snapshots = []; }
  save(key, data) { const s = { key, data: JSON.parse(JSON.stringify(data)), timestamp: Date.now() }; this._snapshots.push(s); return s; }
  restore(key) { const s = [...this._snapshots].reverse().find(s => s.key === key); return s ? JSON.parse(JSON.stringify(s.data)) : null; }
  list() { return this._snapshots.map(s => ({ key: s.key, timestamp: s.timestamp })); }
  prune(olderThanMs) { const cutoff = Date.now() - olderThanMs; this._snapshots = this._snapshots.filter(s => s.timestamp >= cutoff); return this; }
}

class RecoveryManager {
  constructor() { this._backup = new StateBackup(); this._recoveryHooks = []; }
  get backup() { return this._backup; }
  onRecover(fn) { this._recoveryHooks.push(fn); return this; }

  async recoverQueue(queue, items) {
    if (!items || items.length === 0) return 0;
    let restored = 0;
    for (const item of items) { try { queue.push(item); restored++; } catch (e) {} }
    return restored;
  }

  async recoverState(key, data) {
    this._backup.save(key, data);
    for (const hook of this._recoveryHooks) { try { await hook(key, data); } catch (e) {} }
    return key;
  }

  snapshot() {
    return { backups: this._backup.list().length, hooks: this._recoveryHooks.length };
  }
}

module.exports = { RecoveryManager, StateBackup };
