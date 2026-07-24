'use strict';

class Client {
  constructor(options = {}) {
    this.id = options.id || `node-${Math.random().toString(36).slice(2,8)}`;
    this._handlers = {};
    this._transport = options.transport || null;
  }

  send(to, payload) {
    const msg = { id: 'msg_' + Date.now(), from: this.id, to, payload, timestamp: Date.now(), type: 'request' };
    if (this._transport) this._transport.deliver(JSON.stringify(msg));
    return msg;
  }

  request(to, payload) { return this.send(to, payload); }

  subscribe(topic, handler) { this._handlers[topic] = handler; return this; }

  publish(topic, payload) {
    return this.send('events', { topic, payload });
  }

  onMessage(raw) {
    try {
      const msg = typeof raw === 'string' ? JSON.parse(raw) : raw;
      const topic = msg.topic || msg.type;
      if (topic && this._handlers[topic]) this._handlers[topic](msg);
    } catch (e) {}
  }
}

class Server {
  constructor(options = {}) {
    this.id = options.id || `node-srv-${Math.random().toString(36).slice(2,6)}`;
    this._services = new Map();
    this._events = [];
  }

  register(name, handler) { this._services.set(name, handler); return this; }

  handle(raw) {
    try {
      const msg = typeof raw === 'string' ? JSON.parse(raw) : raw;
      const svc = msg.service || msg.type;
      if (this._services.has(svc)) {
        return { status: 'ok', result: this._services.get(svc)(msg.payload) };
      }
      return { status: 'error', message: 'Unknown service: ' + svc };
    } catch (e) { return { status: 'error', message: e.message }; }
  }

  emit(topic, data) {
    const evt = { id: 'evt_' + Date.now(), topic, data, server: this.id, timestamp: Date.now() };
    this._events.push(evt);
    return evt;
  }

  events(since) { return since ? this._events.filter(e => e.timestamp >= since) : this._events; }
}

class Workflow {
  constructor(id, name, stages = []) {
    this.id = id; this.name = name; this.stages = stages; this.current = 0;
    this.state = 'created'; this.createdAt = Date.now();
  }

  addStage(name, handler) { this.stages.push({ name, handler }); return this; }
  start() { this.state = 'running'; return this; }

  nextStage() {
    if (this.current < this.stages.length) {
      const stage = this.stages[this.current++];
      return stage;
    }
    this.state = 'completed'; return null;
  }

  toJSON() { return { id: this.id, name: this.name, stages: this.stages.length, completed: this.current, state: this.state }; }
}

class Runtime {
  constructor(name) {
    this.name = name; this.version = '1.0.0';
    this._clients = new Map(); this._workflows = new Map(); this._events = [];
    this.startedAt = Date.now();
  }

  registerClient(id, meta) { this._clients.set(id, meta || {}); return this; }
  startWorkflow(wf) { this._workflows.set(wf.id, wf); return wf.start(); }
  getWorkflow(id) { return this._workflows.get(id); }
  listWorkflows() { return Array.from(this._workflows.values()); }

  emit(type, data) {
    const e = { type, data, timestamp: Date.now() }; this._events.push(e); return e;
  }

  status() { return { runtime: this.name, version: this.version, clients: this._clients.size, workflows: this._workflows.size, events: this._events.length, uptime: Date.now() - this.startedAt }; }
}

module.exports = { Client, Server, Workflow, Runtime };
