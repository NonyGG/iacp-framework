'use strict';

class CircuitBreaker {
  constructor(name, options = {}) {
    this.name = name; this._failureThreshold = options.failureThreshold || 5;
    this._successThreshold = options.successThreshold || 3; this._timeout = options.resetTimeout || 30000;
    this._failures = 0; this._successes = 0; this._state = 'closed'; this._lastFailure = 0;
  }
  get state() { return this._state; }
  get failures() { return this._failures; }

  async call(fn) {
    if (this._state === 'open') {
      if (Date.now() - this._lastFailure > this._timeout) { this._state = 'half-open'; }
      else throw new Error(`Circuit ${this.name} is open`);
    }
    try { const r = await fn(); this._onSuccess(); return r; }
    catch (e) { this._onFailure(); throw e; }
  }

  _onSuccess() { this._successes++; this._failures = 0; if (this._state === 'half-open' && this._successes >= this._successThreshold) { this._state = 'closed'; this._successes = 0; } }
  _onFailure() { this._failures++; this._successes = 0; this._lastFailure = Date.now(); if (this._failures >= this._failureThreshold) this._state = 'open'; }
}

class Bulkhead {
  constructor(name, maxConcurrent = 10) { this.name = name; this.max = maxConcurrent; this._active = 0; this._queue = []; }
  get active() { return this._active; }
  get queued() { return this._queue.length; }

  async run(fn) {
    if (this._active >= this.max) { return new Promise(r => this._queue.push(r)).then(() => this.run(fn)); }
    this._active++;
    try { return await fn(); }
    finally { this._active--; if (this._queue.length > 0) { const next = this._queue.shift(); next(); } }
  }
}

class RetryPolicy {
  constructor(maxRetries = 3, baseDelay = 100) { this.maxRetries = maxRetries; this.baseDelay = baseDelay; }
  async execute(fn) {
    let lastError;
    for (let i = 0; i <= this.maxRetries; i++) {
      try { return await fn(); }
      catch (e) { lastError = e; if (i < this.maxRetries) await new Promise(r => setTimeout(r, this.baseDelay * Math.pow(2, i))); }
    }
    throw lastError;
  }
}

class HealthCheck {
  constructor(name, checkFn, interval = 30000) { this.name = name; this._check = checkFn; this._interval = interval; this._healthy = true; this._lastCheck = 0; this._timer = null; }
  get healthy() { return this._healthy; }
  async check() { try { this._healthy = await this._check(); } catch (e) { this._healthy = false; } this._lastCheck = Date.now(); return this._healthy; }
  start() { this._timer = setInterval(() => this.check(), this._interval); return this; }
  stop() { if (this._timer) clearInterval(this._timer); return this; }
}

class GracefulShutdown {
  constructor() { this._handlers = []; process.on('SIGINT', () => this.shutdown()); process.on('SIGTERM', () => this.shutdown()); }
  register(fn) { this._handlers.push(fn); return this; }
  async shutdown() {
    for (const h of this._handlers) { try { await h(); } catch (e) {} }
    process.exit(0);
  }
}

class ResilienceManager {
  constructor() { this._circuits = new Map(); this._bulkheads = new Map(); this._retries = new Map(); this._health = []; this._shutdown = new GracefulShutdown(); }
  circuit(name, opts) { const c = new CircuitBreaker(name, opts); this._circuits.set(name, c); return c; }
  bulkhead(name, max) { const b = new Bulkhead(name, max); this._bulkheads.set(name, b); return b; }
  retry(name, max, delay) { const r = new RetryPolicy(max, delay); this._retries.set(name, r); return r; }
  health(name, fn, interval) { const h = new HealthCheck(name, fn, interval); this._health.push(h); return h; }
  get shutdown() { return this._shutdown; }
}

module.exports = { ResilienceManager, CircuitBreaker, Bulkhead, RetryPolicy, HealthCheck, GracefulShutdown };
