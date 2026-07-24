'use strict';
const { TransportInterface } = require('./TransportInterface.js');
const { TransportRegistry, TransportFactory } = require('./TransportRegistry.js');
const { AdapterManager } = require('./manager/AdapterManager.js');
const { RESTAdapter } = require('./adapters/rest/RESTAdapter.js');
const { WebSocketAdapter } = require('./adapters/websocket/WebSocketAdapter.js');
const { GRPCAdapter } = require('./adapters/grpc/GRPCAdapter.js');
const { IPCAdapter } = require('./adapters/ipc/IPCAdapter.js');
const { QueueAdapter } = require('./adapters/queue/QueueAdapter.js');

const registry = new TransportRegistry();
registry.register('rest', RESTAdapter);
registry.register('websocket', WebSocketAdapter);
registry.register('grpc', GRPCAdapter);
registry.register('ipc', IPCAdapter);
registry.register('queue', QueueAdapter);

const factory = new TransportFactory(registry);

module.exports = {
  TransportInterface, TransportRegistry, TransportFactory, AdapterManager,
  RESTAdapter, WebSocketAdapter, GRPCAdapter, IPCAdapter, QueueAdapter,
  registry, factory,
};
