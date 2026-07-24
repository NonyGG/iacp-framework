'use strict';
const net = require('net');
const path = require('path');
const os = require('os');
const { TransportInterface } = require('../../TransportInterface.js');

class IPCAdapter extends TransportInterface {
  constructor(config = {}) {
    super('ipc', config);
    this.pipeName = config.pipeName || `iacp-${Date.now()}.sock`;
    this.pipePath = config.pipePath || path.join(os.tmpdir(), this.pipeName);
    this._server = null;
    this._clients = new Set();
  }

  async start() {
    if (this._started) return this;
    return new Promise((resolve, reject) => {
      try { if (require('fs').existsSync(this.pipePath)) require('fs').unlinkSync(this.pipePath); } catch (e) {}
      this._server = net.createServer(socket => {
        this._clients.add(socket);
        let buf = '';
        socket.on('data', d => {
          buf += d.toString(); this.stats.bytesReceived += d.length;
          const idx = buf.indexOf('\n');
          if (idx !== -1) {
            const line = buf.slice(0, idx); buf = buf.slice(idx + 1);
            this.stats.received++;
            try { const packet = JSON.parse(line); this._emit('message', { from: 'ipc', packet }); } catch (e) { this.stats.errors++; }
          }
        });
        socket.on('close', () => this._clients.delete(socket));
      });
      this._server.listen(this.pipePath, () => { super.start(); resolve(this); });
      this._server.on('error', reject);
    });
  }

  async stop() {
    if (!this._started) return this;
    for (const c of this._clients) { try { c.end(); } catch (e) {} }
    this._clients.clear();
    return new Promise(resolve => { if (this._server) this._server.close(() => { try { require('fs').unlinkSync(this.pipePath); } catch (e) {} super.stop(); resolve(this); }); else resolve(this); });
  }

  async send(target, payload) {
    const body = JSON.stringify(payload) + '\n';
    const socket = new net.Socket();
    return new Promise((resolve, reject) => {
      socket.connect(target || this.pipePath, () => {
        socket.write(body);
        this.stats.sent++;
        this.stats.bytesSent += Buffer.byteLength(body);
      });
      let data = '';
      socket.on('data', d => data += d);
      socket.on('end', () => { try { socket.destroy(); resolve(JSON.parse(data)); } catch (e) { resolve(data); } });
      socket.on('error', e => { this.stats.errors++; reject(e); });
    });
  }

  broadcast(payload) {
    const body = JSON.stringify(payload) + '\n';
    for (const c of this._clients) { try { c.write(body); this.stats.sent++; } catch (e) {} }
  }

  async health() { const b = await super.health(); return { ...b, path: this.pipePath, clients: this._clients.size }; }

  get clientCount() { return this._clients.size; }
}

module.exports = { IPCAdapter };
