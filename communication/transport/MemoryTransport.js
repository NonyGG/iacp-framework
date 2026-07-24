'use strict';

class TransportMessage {
  constructor(from, to, payload, opts = {}) {
    this.id = `tmsg_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
    this.from = from;
    this.to = to;
    this.payload = payload;
    this.timestamp = Date.now();
    this.ttl = opts.ttl || 30000;
    this.ackRequired = opts.ackRequired !== false;
    this.acked = false;
    this.failed = false;
  }
}

class MemoryTransport {
  constructor() {
    this._queues = new Map();
    this._handlers = new Map();
    this._ackCallbacks = new Map();
    this.stats = { sent: 0, delivered: 0, acked: 0, failed: 0, dropped: 0 };
  }

  send(from, to, payload, opts = {}) {
    const msg = new TransportMessage(from, to, payload, opts);
    this.stats.sent++;

    if (!this._queues.has(to)) this._queues.set(to, []);
    this._queues.get(to).push(msg);

    this._deliver(to);
    return msg;
  }

  _deliver(address) {
    const q = this._queues.get(address);
    const handler = this._handlers.get(address);
    if (!q || !handler) return;

    while (q.length > 0) {
      const msg = q[0];
      if (Date.now() - msg.timestamp > msg.ttl) { q.shift(); this.stats.dropped++; continue; }

      q.shift();
      try {
        handler(msg);
        this.stats.delivered++;
        if (msg.ackRequired) { msg.acked = true; this.stats.acked++; }
      } catch (e) {
        msg.failed = true;
        this.stats.failed++;
      }
    }
  }

  listen(address, handler) { this._handlers.set(address, handler); return this; }
  unlisten(address) { this._handlers.delete(address); return this; }

  sendAndWait(from, to, payload, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const msg = this.send(from, to, payload, { ackRequired: true });
      const timer = setTimeout(() => reject(new Error(`Timeout: ${to}`)), timeout);
      this._ackCallbacks.set(msg.id, { resolve, reject, timer, msg });
    });
  }

  ack(msgId) {
    const cb = this._ackCallbacks.get(msgId);
    if (cb) { clearTimeout(cb.timer); cb.resolve(cb.msg); this._ackCallbacks.delete(msgId); }
  }

  nack(msgId, error) {
    const cb = this._ackCallbacks.get(msgId);
    if (cb) { clearTimeout(cb.timer); cb.reject(error || new Error('nack')); this._ackCallbacks.delete(msgId); }
  }

  broadcast(from, payload, addresses) {
    return addresses.map(to => this.send(from, to, payload));
  }

  reset() { this._queues.clear(); this._handlers.clear(); this._ackCallbacks.clear(); this.stats = { sent: 0, delivered: 0, acked: 0, failed: 0, dropped: 0 }; }
}

module.exports = { MemoryTransport, TransportMessage };
