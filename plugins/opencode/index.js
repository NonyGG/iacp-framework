'use strict';
class OpenCodeConnector {
  constructor(options = {}) { this.name = 'opencode'; this._transport = options.transport || null; this.ready = !!options.transport; }
  sendMessage(msg) { return this._transport ? this._transport.deliver(JSON.stringify(msg)) : null; }
  connect() { this.ready = true; return this; }
}
module.exports = { OpenCodeConnector };
