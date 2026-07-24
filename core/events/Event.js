'use strict';

const { EventCategory, EventSeverity } = require('../common/types.js');
const { createId, traceId, hashContent } = require('../common/identifiers.js');

class EventHeader {
  constructor() {
    this.eventId = createId('evt', 10);
    this.eventType = 'generic';
    this.category = EventCategory.SYSTEM;
    this.severity = EventSeverity.INFO;
    this.version = '1.0.0';
    this.source = null;
    this.createdAt = Date.now();
  }

  toJSON() { return Object.assign({}, this); }
}

class EventMetadata {
  constructor() {
    this.traceId = null;
    this.correlationId = null;
    this.sessionId = null;
    this.originNode = null;
    this.tags = [];
    this.custom = {};
  }

  addTag(tag) { if (!this.tags.includes(tag)) this.tags.push(tag); return this; }
  set(key, value) { this.custom[key] = value; return this; }
  toJSON() { return Object.assign({}, this); }
}

class Event {
  constructor(type, category = EventCategory.SYSTEM) {
    this.header = new EventHeader();
    this.header.eventType = type;
    this.header.category = category;
    this.metadata = new EventMetadata();
    this.data = null;
  }

  get integrity() { return hashContent({ id: this.header.eventId, type: this.header.eventType, data: this.data }); }

  static system(type, data) {
    const e = new Event(type, EventCategory.SYSTEM);
    e.data = data;
    return e;
  }

  static application(type, data) {
    const e = new Event(type, EventCategory.APPLICATION);
    e.data = data;
    return e;
  }

  static security(type, data) {
    const e = new Event(type, EventCategory.SECURITY);
    e.data = data;
    e.header.severity = EventSeverity.WARNING;
    return e;
  }

  static audit(type, data) {
    const e = new Event(type, EventCategory.AUDIT);
    e.data = data;
    e.header.severity = EventSeverity.INFO;
    e.metadata.traceId = traceId();
    return e;
  }

  static lifecycle(type, data) {
    const e = new Event(type, EventCategory.LIFECYCLE);
    e.data = data;
    return e;
  }

  toJSON() { return { header: this.header.toJSON(), metadata: this.metadata.toJSON(), data: this.data, integrity: this.integrity }; }
}

module.exports = { Event, EventHeader, EventMetadata };
