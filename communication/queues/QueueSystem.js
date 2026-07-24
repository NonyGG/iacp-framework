'use strict';

class FIFOQueue {
  constructor(name) {
    this.name = name;
    this._items = [];
    this._closed = false;
  }
  push(item) { if (!this._closed) { this._items.push({ item, ts: Date.now() }); return true; } return false; }
  pop() { const e = this._items.shift(); return e ? e.item : null; }
  peek() { return this._items.length > 0 ? this._items[0].item : null; }
  get length() { return this._items.length; }
  get closed() { return this._closed; }
  close() { this._closed = true; }
  drain() { const all = this._items.map(e => e.item); this._items = []; return all; }
}

class PriorityQueue {
  constructor(name) { this.name = name; this._items = []; }
  push(item, priority = 0) {
    this._items.push({ item, priority, ts: Date.now() });
    this._items.sort((a, b) => b.priority - a.priority || a.ts - b.ts);
    return true;
  }
  pop() { const e = this._items.shift(); return e ? e.item : null; }
  peek() { return this._items.length > 0 ? this._items[0].item : null; }
  get length() { return this._items.length; }
}

class DelayedQueue {
  constructor(name) { this.name = name; this._items = []; }
  push(item, delayMs = 1000) {
    this._items.push({ item, readyAt: Date.now() + delayMs });
    return true;
  }
  pop() {
    const now = Date.now();
    const idx = this._items.findIndex(e => e.readyAt <= now);
    if (idx === -1) return null;
    const e = this._items.splice(idx, 1)[0];
    return e.item;
  }
  get length() { return this._items.length; }
  pending() { return this._items.filter(e => e.readyAt > Date.now()).length; }
  ready() { return this._items.filter(e => e.readyAt <= Date.now()).length; }
}

class RetryQueue {
  constructor(name, maxRetries = 3) {
    this.name = name;
    this.maxRetries = maxRetries;
    this._items = [];
  }
  push(item) {
    // Support both raw items and pre-wrapped queue items (from re-push)
    if (item && typeof item.attempts === 'number') { this._items.push(item); }
    else { this._items.push({ item, attempts: 0, lastError: null }); }
    return true;
  }
  pop() {
    const now = Date.now();
    const idx = this._items.findIndex(e => e.attempts < this.maxRetries && (!e.nextRetry || e.nextRetry <= now));
    if (idx === -1) return null;
    return this._items.splice(idx, 1)[0];
  }
  retry(queueItem, error) {
    queueItem.attempts++;
    queueItem.lastError = error;
    queueItem.nextRetry = 0;
    if (queueItem.attempts >= this.maxRetries) { this._failed.push(queueItem); return false; }
    return true;
  }
  get length() { return this._items.length; }
  _failed = [];
  failed() { return this._failed; }
}

class DeadLetterQueue {
  constructor(name) { this.name = name; this._items = []; }
  send(item, reason = 'unspecified') { this._items.push({ item, reason, ts: Date.now() }); return true; }
  peek(count = 10) { return this._items.slice(-count); }
  replay(count = 10) {
    const batch = this._items.splice(0, count);
    return batch.map(e => e.item);
  }
  get length() { return this._items.length; }
  clear() { const c = this._items.length; this._items = []; return c; }
}

module.exports = { FIFOQueue, PriorityQueue, DelayedQueue, RetryQueue, DeadLetterQueue };
