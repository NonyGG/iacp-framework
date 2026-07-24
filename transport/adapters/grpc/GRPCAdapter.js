'use strict';
const http2 = require('http2');
const { TransportInterface } = require('../../TransportInterface.js');

class GRPCAdapter extends TransportInterface {
  constructor(config = {}) {
    super('grpc', config);
    this.port = config.port || 0;
    this.host = config.host || '127.0.0.1';
    this._server = null;
    this._baseUrl = config.baseUrl || `https://${this.host}:${this.port}`;
  }

  async start() {
    if (this._started) return this;
    return new Promise((resolve, reject) => {
      this._server = http2.createServer();
      this._server.on('stream', (stream, headers) => {
        let body = '';
        stream.on('data', c => { body += c; this.stats.bytesReceived += c.length; });
        stream.on('end', () => {
          this.stats.received++;
          try {
            const packet = JSON.parse(body);
            this._emit('message', { from: 'grpc', packet, stream });
            stream.respond({ ':status': 200, 'content-type': 'application/grpc+json' });
            stream.end(JSON.stringify({ status: 'ok', protocol: 'iacp' }));
          } catch (e) { this.stats.errors++; stream.respond({ ':status': 400 }); stream.end(JSON.stringify({ error: e.message })); }
        });
      });
      this._server.listen(this.port, this.host, () => { this.port = this._server.address().port; this._baseUrl = `https://${this.host}:${this.port}`; super.start(); resolve(this); });
      this._server.on('error', reject);
    });
  }

  async stop() {
    if (!this._started) return this;
    return new Promise(resolve => { if (this._server) this._server.close(() => { super.stop(); resolve(this); }); else resolve(this); });
  }

  async send(target, payload, opts = {}) {
    return new Promise((resolve, reject) => {
      const client = http2.connect(target.startsWith('http') ? target : this._baseUrl);
      const body = JSON.stringify(payload);
      const req = client.request({ ':method': 'POST', ':path': '/iacp', 'content-type': 'application/grpc+json' });
      req.on('response', (headers) => { this.stats.sent++; this.stats.bytesSent += Buffer.byteLength(body); });
      let data = '';
      req.on('data', c => data += c);
      req.on('end', () => { client.close(); try { resolve(JSON.parse(data)); } catch (e) { resolve(data); } });
      req.on('error', (e) => { this.stats.errors++; reject(e); });
      req.end(body);
      if (opts.timeout) setTimeout(() => { client.close(); reject(new Error('gRPC timeout')); }, opts.timeout);
    });
  }

  async health() { const b = await super.health(); return { ...b, port: this.port }; }
}

module.exports = { GRPCAdapter };
