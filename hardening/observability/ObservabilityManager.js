'use strict';

class Logger {
  constructor(name) { this.name = name; this._level = 2; this._handlers = []; } // 0=debug 1=info 2=warn 3=error
  setLevel(l) { this._level = l; return this; }
  on(handler) { this._handlers.push(handler); return this; }
  _log(level, msg, ctx) { if (level < this._level) return; const e = { timestamp: new Date().toISOString(), level, logger: this.name, message: msg, context: ctx || {} }; this._handlers.forEach(h => h(e)); }
  debug(msg, ctx) { this._log(0, msg, ctx); }
  info(msg, ctx) { this._log(1, msg, ctx); }
  warn(msg, ctx) { this._log(2, msg, ctx); }
  error(msg, ctx) { this._log(3, msg, ctx); }
}

class Tracer {
  constructor() { this._spans = []; }
  start(name, ctx = {}) { const s = { id: `span_${Date.now()}_${Math.random().toString(36).slice(2,4)}`, name, context: ctx, start: Date.now() }; this._spans.push(s); return s; }
  end(spanId, metadata = {}) { const s = this._spans.find(s => s.id === spanId); if (s) { s.end = Date.now(); s.duration = s.end - s.start; Object.assign(s, metadata); } return s; }
  trace(name, fn, ctx) { const s = this.start(name, ctx); try { const r = fn(); this.end(s.id, { status: 'ok' }); return r; } catch (e) { this.end(s.id, { status: 'error', error: e.message }); throw e; } }
  async traceAsync(name, fn, ctx) { const s = this.start(name, ctx); try { const r = await fn(); this.end(s.id, { status: 'ok' }); return r; } catch (e) { this.end(s.id, { status: 'error', error: e.message }); throw e; } }
  get spans() { return [...this._spans]; }
  summary() { return { total: this._spans.length, errors: this._spans.filter(s => s.status === 'error').length, avgDuration: this._spans.length > 0 ? Math.round(this._spans.reduce((a, s) => a + (s.duration || 0), 0) / this._spans.length) : 0 }; }
}

class MetricsExporter {
  constructor() { this._metrics = new Map(); }
  increment(name, by = 1) { this._metrics.set(name, (this._metrics.get(name) || 0) + by); }
  gauge(name, value) { this._metrics.set(name, value); }
  get(name) { return this._metrics.get(name) || 0; }
  snapshot() { return Object.fromEntries(this._metrics); }
  exportPrometheus() {
    let out = '';
    for (const [k, v] of this._metrics) { out += `# HELP iacp_${k} IACP metric\n# TYPE iacp_${k} gauge\niacp_${k} ${v}\n`; }
    return out;
  }
  reset() { this._metrics.clear(); }
}

class ObservabilityManager {
  constructor() { this.logger = new Logger('iacp'); this.tracer = new Tracer(); this.metrics = new MetricsExporter(); }
}

module.exports = { ObservabilityManager, Logger, Tracer, MetricsExporter };
