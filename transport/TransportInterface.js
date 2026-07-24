'use strict';

class TransportInterface {
  constructor(name, config = {}) {
    if (new.target === TransportInterface) throw new Error('TransportInterface is abstract');
    this.name = name;
    this.config = config;
    this._handlers = new Map();
    this._started = false;
    this.stats = { sent: 0, received: 0, errors: 0, bytesSent: 0, bytesReceived: 0 };
  }

  async start() { this._started = true; return this; }
  async stop() { this._started = false; return this; }
  get started() { return this._started; }

  on(event, handler) { this._handlers.set(event, handler); return this; }
  _emit(event, data) { const h = this._handlers.get(event); if (h) h(data); }

  async health() { return { name: this.name, started: this._started }; }
  resetStats() { this.stats = { sent: 0, received: 0, errors: 0, bytesSent: 0, bytesReceived: 0 }; }
}

module.exports = { TransportInterface };
