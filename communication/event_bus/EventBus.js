'use strict';

class TopicChannel {
  constructor(name) { this.name = name; this._subscribers = new Map(); this._history = []; this._maxHistory = 1000; }
  subscribe(id, handler) { this._subscribers.set(id, handler); return this; }
  unsubscribe(id) { this._subscribers.delete(id); return this; }
  publish(event) {
    this._history.push(event);
    if (this._history.length > this._maxHistory) this._history.shift();
    this._subscribers.forEach((handler, id) => { try { handler(event); } catch (e) { /* subscriber error */ } });
    return Array.from(this._subscribers.keys());
  }
  replay(since) { const t = since || 0; return this._history.filter(e => (e.header && e.header.createdAt ? e.header.createdAt : e.ts || e.timestamp || Date.now()) >= t); }
  get subscriberCount() { return this._subscribers.size; }
  get eventCount() { return this._history.length; }
}

class EventBus {
  constructor() { this._channels = new Map(); this._filters = []; this._globalHandlers = []; this.stats = { published: 0, delivered: 0, filtered: 0 }; }

  channel(name) {
    if (!this._channels.has(name)) this._channels.set(name, new TopicChannel(name));
    return this._channels.get(name);
  }

  createTopic(name) { this.channel(name); return this; }

  publish(topic, event) {
    this.stats.published++;
    const ch = this._channels.get(topic);
    if (!ch) { this.stats.filtered++; return []; }

    for (const filter of this._filters) { if (!filter(event)) { this.stats.filtered++; return []; } }

    const delivered = ch.publish(event);
    this.stats.delivered += delivered.length;
    this._globalHandlers.forEach(h => { try { h(event, topic); } catch (e) {} });
    return delivered;
  }

  subscribe(topic, id, handler) { this.channel(topic).subscribe(id, handler); return this; }
  unsubscribe(topic, id) { const ch = this._channels.get(topic); if (ch) ch.unsubscribe(id); return this; }

  replay(topic, since) { const ch = this._channels.get(topic); return ch ? ch.replay(since) : []; }

  addFilter(fn) { this._filters.push(fn); return this; }
  onGlobal(handler) { this._globalHandlers.push(handler); return this; }

  subscriberCount(topic) { const ch = this._channels.get(topic); return ch ? ch.subscriberCount : 0; }
  eventCount(topic) { const ch = this._channels.get(topic); return ch ? ch.eventCount : 0; }

  stream(topic, since, cb) {
    const events = this.replay(topic, since);
    events.forEach(e => cb(e));
    return this.subscribe(topic, `stream_${Date.now()}`, cb);
  }
}

module.exports = { EventBus, TopicChannel };
