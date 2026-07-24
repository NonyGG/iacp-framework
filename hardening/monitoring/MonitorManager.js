'use strict';

class RuntimeMonitor {
  constructor() { this._snapshots = []; this._interval = null; }
  start(intervalMs = 30000) { this._interval = setInterval(() => this.snapshot(), intervalMs); return this; }
  stop() { if (this._interval) clearInterval(this._interval); return this; }
  snapshot() {
    const s = { timestamp: Date.now(), memory: process.memoryUsage(), cpu: process.cpuUsage(), uptime: process.uptime(), pid: process.pid };
    this._snapshots.push(s); return s;
  }
  get history() { return this._snapshots; }
  latest() { return this._snapshots[this._snapshots.length - 1] || null; }
}

class QueueMonitor {
  constructor() { this._queues = new Map(); }
  track(name, getLength) { this._queues.set(name, { getLength, max: 0, total: 0 }); return this; }
  snapshot() {
    const data = {};
    for (const [name, q] of this._queues) {
      const len = q.getLength(); q.max = Math.max(q.max, len); q.total++;
      data[name] = { current: len, max: q.max };
    }
    return data;
  }
}

class HealthAggregator {
  constructor() { this._checks = new Map(); }
  register(name, checkFn) { this._checks.set(name, checkFn); return this; }
  async check() {
    const results = {};
    for (const [name, fn] of this._checks) { try { results[name] = await fn() ? 'healthy' : 'unhealthy'; } catch (e) { results[name] = 'error'; } }
    const total = Object.keys(results).length;
    const healthy = Object.values(results).filter(v => v === 'healthy').length;
    return { timestamp: Date.now(), results, healthy, total, status: healthy === total ? 'healthy' : 'degraded' };
  }
}

class MonitorManager {
  constructor() { this.runtime = new RuntimeMonitor(); this.queues = new QueueMonitor(); this.health = new HealthAggregator(); }
}

module.exports = { MonitorManager, RuntimeMonitor, QueueMonitor, HealthAggregator };
