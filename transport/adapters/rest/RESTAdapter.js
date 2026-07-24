'use strict';
const http = require('http');
const { TransportInterface } = require('../../TransportInterface.js');

class RESTAdapter extends TransportInterface {
  constructor(config = {}) {
    super('rest', config);
    this.port = config.port || 0;
    this.host = config.host || '127.0.0.1';
    this._server = null;
    this._baseUrl = config.baseUrl || `http://${this.host}:${this.port}`;
    this._timeout = config.timeout || 5000;
  }

  async start() {
    if (this._started) return this;
    return new Promise((resolve, reject) => {
      this._server = http.createServer((req, res) => {
        let body = '';
        req.on('data', c => body += c);
        req.on('end', () => {
          this.stats.received++;
          this.stats.bytesReceived += Buffer.byteLength(body);
          try {
            const packet = JSON.parse(body);
            this._emit('message', { from: req.socket.remoteAddress, packet, req, res });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'ok', protocol: 'iacp' }));
          } catch (e) {
            this.stats.errors++;
            res.writeHead(400);
            res.end(JSON.stringify({ status: 'error', message: e.message }));
          }
        });
      });
      this._server.listen(this.port, this.host, () => {
        this.port = this._server.address().port;
        this._baseUrl = `http://${this.host}:${this.port}`;
        super.start();
        resolve(this);
      });
      this._server.on('error', reject);
    });
  }

  async stop() {
    if (!this._started) return this;
    return new Promise(resolve => {
      if (this._server) this._server.close(() => { super.stop(); resolve(this); });
      else resolve(this);
    });
  }

  async send(target, payload, opts = {}) {
    const url = target.startsWith('http') ? target : `${this._baseUrl}${target}`;
    const body = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), opts.timeout || this._timeout);
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-IACP-Protocol': '1.0.0' }, body, signal: controller.signal });
      this.stats.sent++;
      this.stats.bytesSent += Buffer.byteLength(body);
      return { status: res.status, data: await res.json() };
    } catch (e) {
      this.stats.errors++;
      throw e;
    } finally { clearTimeout(timer); }
  }

  async health() {
    const base = await super.health();
    return { ...base, port: this.port, url: this._baseUrl };
  }
}

module.exports = { RESTAdapter };
