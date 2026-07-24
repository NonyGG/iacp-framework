'use strict';
const http = require('http');
const crypto = require('crypto');
const { TransportInterface } = require('../../TransportInterface.js');

const MAGIC = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

function acceptKey(key) { return crypto.createHash('sha1').update(key + MAGIC).digest('base64'); }
function encodeFrame(data) { const b = Buffer.from(data); const len = b.length; const buf = Buffer.alloc(len + (len < 126 ? 2 : 4)); buf[0] = 0x81; if (len < 126) { buf[1] = len; b.copy(buf, 2); } else { buf[1] = 126; buf.writeUInt16BE(len, 2); b.copy(buf, 4); } return buf; }

class WebSocketAdapter extends TransportInterface {
  constructor(config = {}) {
    super('websocket', config);
    this.port = config.port || 0;
    this._server = null;
    this._clients = new Set();
    this._baseUrl = config.baseUrl || `ws://127.0.0.1:${this.port}`;
  }

  async start() {
    if (this._started) return this;
    return new Promise((resolve, reject) => {
      this._server = http.createServer((req, res) => {
        if (req.headers.upgrade !== 'websocket') { res.writeHead(426); res.end(); return; }
        const key = req.headers['sec-websocket-key'];
        res.writeHead(101, { 'Upgrade': 'websocket', 'Connection': 'Upgrade', 'Sec-WebSocket-Accept': acceptKey(key) });
        res.socket.setNoDelay(true);
        this._clients.add(res.socket);
        this._emit('connect', { socket: res.socket });
        let buf = '';
        res.socket.on('data', d => {
          buf += d.toString(); this.stats.bytesReceived += d.length;
          while (buf.length >= 2) {
            const opcode = buf.charCodeAt(0) & 0x0F;
            const masked = (buf.charCodeAt(1) & 0x80) !== 0;
            let len = buf.charCodeAt(1) & 0x7F;
            let offset = 2;
            if (len === 126) { if (buf.length < 4) break; len = buf.readUInt16BE(2); offset = 4; }
            const maskBytes = masked ? 4 : 0;
            const totalLen = offset + maskBytes + len;
            if (buf.length < totalLen) break;
            if (opcode === 0x01 || opcode === 0x02) {
              let decoded;
              if (masked) { const mask = Buffer.from(buf.slice(offset, offset + 4)); decoded = Buffer.alloc(len); for (let i = 0; i < len; i++) decoded[i] = buf.charCodeAt(offset + 4 + i) ^ mask[i % 4]; }
              else { decoded = Buffer.from(buf.slice(offset, offset + len)); }
              try { const pkt = JSON.parse(decoded.toString()); this.stats.received++; this._emit('message', { from: 'ws', packet: pkt }); } catch (e) { this.stats.errors++; }
            }
            buf = buf.slice(totalLen);
          }
        });
        res.socket.on('close', () => { this._clients.delete(res.socket); this._emit('disconnect', {}); });
        res.socket.write(encodeFrame(JSON.stringify({ type: 'iacp_hello', version: '1.0.0' })));
      });
      this._server.listen(this.port, () => { this.port = this._server.address().port; this._baseUrl = `ws://127.0.0.1:${this.port}`; super.start(); resolve(this); });
      this._server.on('error', reject);
    });
  }

  async stop() {
    if (!this._started) return this;
    for (const c of this._clients) { try { c.write(encodeFrame(JSON.stringify({ type: 'iacp_bye' }))); c.end(); } catch (e) {} }
    this._clients.clear();
    return new Promise(resolve => { if (this._server) this._server.close(() => { super.stop(); resolve(this); }); else resolve(this); });
  }

  async send(target, payload) {
    const body = JSON.stringify(payload);
    for (const c of this._clients) { try { c.write(encodeFrame(body)); this.stats.sent++; this.stats.bytesSent += Buffer.byteLength(body); } catch (e) { this.stats.errors++; } }
  }

  broadcast(payload) { return this.send(null, payload); }

  get clientCount() { return this._clients.size; }

  async health() { const b = await super.health(); return { ...b, port: this.port, clients: this.clientCount }; }
}

module.exports = { WebSocketAdapter };
