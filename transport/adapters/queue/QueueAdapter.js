'use strict';
const { TransportInterface } = require('../../TransportInterface.js');

class QueueAdapter extends TransportInterface {
  constructor(config = {}) {
    super('queue', config);
    this.queueType = config.queueType || 'memory';
    this._messages = [];
  }

  async start() { return super.start(); }

  async stop() { this._messages = []; return super.stop(); }

  async send(target, payload) {
    const msg = { target, payload, ts: Date.now(), id: `q_${Date.now()}_${Math.random().toString(36).slice(2,6)}` };
    this._messages.push(msg);
    this.stats.sent++;
    this.stats.bytesSent += Buffer.byteLength(JSON.stringify(payload));
    this._emit('message', { from: 'queue', packet: payload, msgId: msg.id });
    this._messages = this._messages.filter(m => m.id !== msg.id); // auto-consume
    return msg;
  }

  async consume(handler) {
    while (this._started) {
      const msg = this._messages.shift();
      if (msg) { this.stats.received++; await handler(msg); }
      else { await new Promise(r => setTimeout(r, 10)); }
    }
  }

  pending() { return this._messages.length; }

  async health() { const b = await super.health(); return { ...b, queueType: this.queueType, pending: this.pending() }; }
}

module.exports = { QueueAdapter };
