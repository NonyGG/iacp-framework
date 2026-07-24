'use strict';

const crypto = require('crypto');
const os = require('os');

function createId(prefix = 'msg', entropy = 8) {
  const rand = crypto.randomBytes(entropy).toString('hex');
  const ts = Date.now().toString(36);
  return `${prefix}_${ts}_${rand}`;
}

function shortId() {
  return crypto.randomBytes(4).toString('hex');
}

function nodeId() {
  const host = os.hostname().split('.')[0] || 'unknown';
  const pid = process.pid || 0;
  return `${host}_${pid}`;
}

function traceId() {
  return createId('trace', 12);
}

function correlationId() {
  return createId('corr', 8);
}

function sessionId() {
  return createId('sess', 10);
}

function hashContent(data) {
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

module.exports = {
  createId,
  shortId,
  nodeId,
  traceId,
  correlationId,
  sessionId,
  hashContent,
};
