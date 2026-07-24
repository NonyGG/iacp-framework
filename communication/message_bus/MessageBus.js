'use strict';

const { RetryQueue, DeadLetterQueue } = require('../queues/QueueSystem.js');

class MessageBus {
  constructor(transport, router, dispatcher) {
    this._transport = transport;
    this._router = router;
    this._dispatcher = dispatcher;
    this._retry = new RetryQueue('mb-retry', 3);
    this._dlq = new DeadLetterQueue('mb-dlq');
    this._subscriptions = new Map();
    this._correlations = new Map();
    this._timeouts = new Map();
    this.stats = { published: 0, delivered: 0, retried: 0, dlq: 0, timedOut: 0 };
  }

  publish(topic, payload, sender = 'system') {
    this.stats.published++;
    const subs = this._subscriptions.get(topic) || [];
    subs.forEach(({ to, handler }) => {
      try {
        this._transport.send(sender, to, { topic, payload, type: 'message' });
        handler(payload);
        this.stats.delivered++;
      } catch (e) {
        this._retry.push({ topic, payload, sender, to, error: e.message });
        this.stats.retried++;
      }
    });
  }

  subscribe(topic, to, handler) {
    if (!this._subscriptions.has(topic)) this._subscriptions.set(topic, []);
    this._subscriptions.get(topic).push({ to, handler });
    this._transport.listen(to, handler);
    return this;
  }

  unsubscribe(topic, to) {
    const subs = this._subscriptions.get(topic);
    if (!subs) return this;
    this._subscriptions.set(topic, subs.filter(s => s.to !== to));
    return this;
  }

  request(to, payload, from = 'system', timeout = 5000) {
    return this._dispatcher.sendAndWait(from, to, payload, timeout);
  }

  respond(to, payload, correlationId) { return this._dispatcher.send('system', to, { payload, correlationId }); }

  trackCorrelation(msgId, handler) { this._correlations.set(msgId, handler); return this; }
  resolveCorrelation(msgId, data) { const h = this._correlations.get(msgId); if (h) { h(data); this._correlations.delete(msgId); } }

  setTimeout(key, handler, ms) {
    const timer = setTimeout(() => { handler(); this._timeouts.delete(key); }, ms);
    this._timeouts.set(key, timer);
    return this;
  }
  clearTimeout(key) { const t = this._timeouts.get(key); if (t) { clearTimeout(t); this._timeouts.delete(key); } }

  processRetries() {
    let item; let processed = 0;
    while ((item = this._retry.pop()) !== null) {
      const retryable = this._retry.retry(item, item.error);
      if (retryable) { this._retry.push(item); } else { this._dlq.send(item, 'max_retries'); this.stats.dlq++; }
      processed++;
    }
    return processed;
  }

  get dlq() { return this._dlq; }
  get retry() { return this._retry; }
}

module.exports = { MessageBus };
