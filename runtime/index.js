'use strict';
const { PluginSystem } = require('./PluginManager.js');

class IACPRuntime {
  constructor(name) {
    this.name = name; this.version = '0.2.0';
    this.core = require('../core/index.js');
    this.comm = require('../communication/index.js');
    this.plugins = new PluginSystem();
    this.transport = new this.comm.MemoryTransport();
    this.router = new this.comm.RoutingEngine();
    this.dispatcher = new this.comm.Dispatcher(this.transport, this.router);
    this.messageBus = new this.comm.MessageBus(this.transport, this.router, this.dispatcher);
    this.eventBus = new this.comm.EventBus();
    this.metrics = new this.comm.MetricsCollector();
    this.clients = new Map(); this.servers = new Map(); this.workflows = new Map();
  }

  createClient(id) { const c = new (require('../sdk/node/index.js').Client)({ id, transport: this.transport }); this.clients.set(id, c); return c; }
  createServer(id) { const s = new (require('../sdk/node/index.js').Server)({ id, transport: this.transport }); this.servers.set(id, s); return s; }
  createWorkflow(id, name, stages) { const w = new (require('../sdk/node/index.js').Workflow)(id, name, stages); this.workflows.set(id, w); return w; }

  status() {
    return { runtime: this.name, version: this.version, clients: this.clients.size, servers: this.servers.size,
      workflows: this.workflows.size, plugins: this.plugins.status(),
      transport: this.transport.stats, messages: this.messageBus.stats, events: this.eventBus.stats,
      metrics: this.metrics.summary() };
  }
}

module.exports = { IACPRuntime, PluginSystem };
