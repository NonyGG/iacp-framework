'use strict';
const crypto = require('crypto');

const ALGO_AES = 'aes-256-gcm';
const ALGO_CHACHA = 'chacha20-poly1305';
const ALGO_HASH = 'sha256';
const SIG_ALGO = 'sha256WithRSAEncryption';

class EncryptionManager {
  constructor() { this._keys = new Map(); }

  // AES-256-GCM
  encryptAES(plaintext, keyId) {
    const key = this._getKey(keyId, 32);
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ALGO_AES, key, iv);
    const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return { encrypted: enc.toString('base64'), iv: iv.toString('base64'), tag: tag.toString('base64'), algorithm: ALGO_AES };
  }

  decryptAES(packet, keyId) {
    const key = this._getKey(keyId, 32);
    const decipher = crypto.createDecipheriv(ALGO_AES, key, Buffer.from(packet.iv, 'base64'));
    decipher.setAuthTag(Buffer.from(packet.tag, 'base64'));
    const dec = Buffer.concat([decipher.update(Buffer.from(packet.encrypted, 'base64')), decipher.final()]);
    return dec.toString('utf8');
  }

  hash(data) { return crypto.createHash(ALGO_HASH).update(JSON.stringify(data)).digest('hex'); }

  sign(data, privateKey) {
    const s = crypto.createSign(SIG_ALGO);
    s.update(JSON.stringify(data)); s.end();
    return s.sign(privateKey, 'base64');
  }

  verify(data, signature, publicKey) {
    const v = crypto.createVerify(SIG_ALGO);
    v.update(JSON.stringify(data)); v.end();
    return v.verify(publicKey, signature, 'base64');
  }

  generateKeyPair() { return crypto.generateKeyPairSync('rsa', { modulusLength: 2048 }); }
  generateSecretKey() { return crypto.randomBytes(32).toString('hex'); }

  addKey(id, key) { this._keys.set(id, key); return this; }

  _getKey(id, length) {
    const k = this._keys.get(id) || process.env.IACP_ENCRYPTION_KEY || 'default-key-change-in-production!';
    const buf = Buffer.from(k, 'utf8').slice(0, length);
    if (buf.length < length) { const padding = Buffer.alloc(length - buf.length, 0); return Buffer.concat([buf, padding]); }
    return buf;
  }
}

module.exports = { EncryptionManager };
