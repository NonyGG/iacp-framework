'use strict';

const { createId } = require('../../core/common/identifiers.js');

class TimelineEntry {
  constructor(type, label, data = {}) {
    this.id = createId('tl', 6);
    this.type = type;
    this.label = label;
    this.data = data;
    this.timestamp = Date.now();
  }
}

class Timeline {
  constructor(name) { this.name = name; this._entries = []; }
  add(type, label, data) { const e = new TimelineEntry(type, label, data); this._entries.push(e); return e; }
  get entries() { return this._entries; }
  byType(type) { return this._entries.filter(e => e.type === type); }
  duration() { return this._entries.length > 1 ? this._entries[this._entries.length - 1].timestamp - this._entries[0].timestamp : 0; }
  clear() { this._entries = []; }
}

class TraceCollector {
  constructor() { this._traces = new Map(); }

  start(traceId, source) {
    if (!this._traces.has(traceId)) this._traces.set(traceId, { id: traceId, source, spans: [], start: Date.now() });
    return traceId;
  }

  addSpan(traceId, span) {
    const t = this._traces.get(traceId);
    if (t) t.spans.push({ ...span, ts: Date.now() });
    return this;
  }

  complete(traceId) {
    const t = this._traces.get(traceId);
    if (t) t.end = Date.now();
    return this;
  }

  get(traceId) { return this._traces.get(traceId); }
  list() { return Array.from(this._traces.values()); }
}

class CorrelationTracker {
  constructor() { this._map = new Map(); }

  track(correlationId, data) {
    this._map.set(correlationId, { ...data, trackedAt: Date.now() });
    return correlationId;
  }

  resolve(correlationId) { const d = this._map.get(correlationId); if (d) this._map.delete(correlationId); return d || null; }
  get(correlationId) { return this._map.get(correlationId) || null; }
  count() { return this._map.size; }
  clear() { this._map.clear(); }
}

module.exports = { Timeline, TraceCollector, CorrelationTracker };
