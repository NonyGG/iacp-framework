'use strict';

class TokenBucket {
  constructor(capacity, fillPerSecond) {
    this.capacity = capacity; this.tokens = capacity; this.fillRate = fillPerSecond; this.lastRefill = Date.now();
  }
  refill() {
    const now = Date.now(); const elapsed = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(this.capacity, this.tokens + elapsed * this.fillRate);
    this.lastRefill = now;
  }
  tryConsume(count = 1) { this.refill(); if (this.tokens >= count) { this.tokens -= count; return true; } return false; }
}

class SlidingWindow {
  constructor(limit, windowMs = 60000) { this.limit = limit; this.windowMs = windowMs; this._entries = []; }
  tryConsume() {
    const now = Date.now(); this._entries = this._entries.filter(t => now - t < this.windowMs);
    if (this._entries.length >= this.limit) return false;
    this._entries.push(now); return true;
  }
  get count() { const now = Date.now(); return this._entries.filter(t => now - t < this.windowMs).length; }
}

class RateLimiter {
  constructor() { this._buckets = new Map(); this._windows = new Map(); }

  createTokenBucket(key, capacity, fillRate) { this._buckets.set(key, new TokenBucket(capacity, fillRate)); return this; }
  createSlidingWindow(key, limit, windowMs) { this._windows.set(key, new SlidingWindow(limit, windowMs)); return this; }

  tryConsume(key, count = 1) {
    const bucket = this._buckets.get(key); const window = this._windows.get(key);
    if (bucket && !bucket.tryConsume(count)) return false;
    if (window && !window.tryConsume()) return false;
    return true;
  }

  check(key) {
    const bucket = this._buckets.get(key); const window = this._windows.get(key);
    return { allowed: bucket ? bucket.tokens > 0 : true, windowAllowed: window ? window.count < window.limit : true };
  }

  status(key) {
    const b = this._buckets.get(key); const w = this._windows.get(key);
    return { bucket: b ? { tokens: Math.round(b.tokens), capacity: b.capacity } : null, window: w ? { count: w.count, limit: w.limit } : null };
  }
}

module.exports = { RateLimiter, TokenBucket, SlidingWindow };
