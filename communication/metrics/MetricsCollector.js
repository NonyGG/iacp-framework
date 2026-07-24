'use strict';

class MetricsCollector {
  constructor() {
    this._counters = new Map();
    this._gauges = new Map();
    this._histograms = new Map();
    this._snapshots = [];
  }

  increment(counter, by = 1) { this._counters.set(counter, (this._counters.get(counter) || 0) + by); return this; }
  gauge(name, value) { this._gauges.set(name, value); return this; }
  histogram(name, value) {
    if (!this._histograms.has(name)) this._histograms.set(name, []);
    this._histograms.get(name).push(value);
    return this;
  }

  getCounter(name) { return this._counters.get(name) || 0; }
  getGauge(name) { return this._gauges.get(name); }

  histogramStats(name) {
    const values = this._histograms.get(name);
    if (!values || values.length === 0) return null;
    const sorted = [...values].sort((a, b) => a - b);
    const sum = sorted.reduce((s, v) => s + v, 0);
    return {
      count: sorted.length, min: sorted[0], max: sorted[sorted.length - 1],
      avg: sum / sorted.length, p50: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)], p99: sorted[Math.floor(sorted.length * 0.99)],
    };
  }

  snapshot() {
    const s = {
      timestamp: Date.now(),
      counters: Object.fromEntries(this._counters),
      gauges: Object.fromEntries(this._gauges),
      histograms: {},
    };
    for (const [k] of this._histograms) s.histograms[k] = this.histogramStats(k);
    this._snapshots.push(s);
    return s;
  }

  summary() {
    return {
      counters: Object.fromEntries(this._counters),
      gauges: Object.fromEntries(this._gauges),
      histogramCount: this._histograms.size,
      snapshots: this._snapshots.length,
    };
  }

  reset() { this._counters.clear(); this._gauges.clear(); this._histograms.clear(); this._snapshots = []; }
}

module.exports = { MetricsCollector };
