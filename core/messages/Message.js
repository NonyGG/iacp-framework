'use strict';

const { MessageType, MessagePriority } = require('../common/types.js');
const { createId, traceId, correlationId, hashContent } = require('../common/identifiers.js');

class Header {
  constructor() {
    this.messageId = createId('msg', 10);
    this.messageType = MessageType.REQUEST;
    this.protocolVersion = '1.0.0';
    this.sender = null;
    this.destination = null;
    this.createdAt = Date.now();
    this.ttl = 30000;
    this.priority = MessagePriority.NORMAL;
  }

  set(key, value) { this[key] = value; return this; }
  toJSON() { return Object.assign({}, this); }
}

class Payload {
  constructor(content = null, contentType = 'application/json') {
    this.content = content;
    this.contentType = contentType;
    this.encoding = 'utf8';
    this.size = content ? Buffer.byteLength(JSON.stringify(content)) : 0;
  }

  toJSON() { return { content: this.content, contentType: this.contentType, encoding: this.encoding, size: this.size }; }
}

class Metadata {
  constructor() {
    this.correlationId = null;
    this.traceId = null;
    this.sessionId = null;
    this.sourceNode = null;
    this.routingHints = {};
    this.extensions = {};
    this.custom = {};
  }

  set(key, value) { this.custom[key] = value; return this; }
  get(key) { return this.custom[key]; }
  toJSON() { return Object.assign({}, this); }
}

class Envelope {
  constructor(header, payload, metadata) {
    this.header = header || new Header();
    this.payload = payload || new Payload();
    this.metadata = metadata || new Metadata();
    this._integrity = null;
  }

  get integrity() {
    if (!this._integrity) this._integrity = hashContent({ h: this.header, p: this.payload });
    return this._integrity;
  }

  toJSON() { return { header: this.header.toJSON(), payload: this.payload.toJSON(), metadata: this.metadata.toJSON(), integrity: this.integrity }; }
}

class Message {
  constructor(type = MessageType.REQUEST) {
    this.envelope = new Envelope();
    this.envelope.header.messageType = type;
  }

  static request(destination, content, opts = {}) {
    const m = new Message(MessageType.REQUEST);
    m.envelope.header.destination = destination;
    m.envelope.payload = new Payload(content);
    if (opts.correlationId) m.envelope.metadata.correlationId = opts.correlationId;
    if (opts.traceId) m.envelope.metadata.traceId = opts.traceId;
    if (opts.priority !== undefined) m.envelope.header.priority = opts.priority;
    if (opts.ttl) m.envelope.header.ttl = opts.ttl;
    return m;
  }

  static response(requestMsg, content) {
    const m = new Message(MessageType.RESPONSE);
    m.envelope.payload = new Payload(content);
    m.envelope.metadata.correlationId = requestMsg.envelope.header.messageId;
    m.envelope.metadata.traceId = requestMsg.envelope.metadata.traceId;
    m.envelope.header.destination = requestMsg.envelope.header.sender;
    return m;
  }

  static event(eventType, content) {
    const m = new Message(MessageType.EVENT);
    m.envelope.header.messageType = MessageType.EVENT;
    m.envelope.payload = new Payload(content);
    m.envelope.metadata.correlationId = correlationId();
    return m;
  }
}

module.exports = { Header, Payload, Metadata, Envelope, Message };
