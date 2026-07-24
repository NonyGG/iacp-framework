'use strict';

class Dispatcher {
  constructor(transport, router) {
    this._transport = transport;
    this._router = router;
    this._middleware = [];
    this.stats = { dispatched: 0, failed: 0, p2p: 0, broadcast: 0, multicast: 0 };
  }

  use(fn) { this._middleware.push(fn); return this; }

  send(from, to, payload, opts = {}) {
    this.stats.dispatched++;
    const address = this._router.destinations.resolve(to) || to;
    const msg = this._transport.send(from, address, payload, opts);
    this.stats.p2p++;
    return msg;
  }

  async sendAndWait(from, to, payload, timeout = 5000) {
    this.stats.dispatched++;
    const address = this._router.destinations.resolve(to) || to;
    this.stats.p2p++;
    return this._transport.sendAndWait(from, address, payload, timeout);
  }

  broadcast(from, payload, targets) {
    this.stats.dispatched++;
    this.stats.broadcast++;
    const resolved = targets.map(t => this._router.destinations.resolve(t) || t);
    return this._transport.broadcast(from, payload, resolved);
  }

  multicast(from, payload, groups, router) {
    this.stats.dispatched++;
    this.stats.multicast++;
    const members = new Set();
    groups.forEach(g => (router || this._router).broadcast.members(g).forEach(m => members.add(m)));
    const resolved = Array.from(members).map(m => this._router.destinations.resolve(m) || m);
    return this._transport.broadcast(from, payload, resolved);
  }

  routeByWorkflow(wfId, from, payload, router) {
    const target = (router || this._router).workflows.resolve(wfId);
    if (!target) { this.stats.failed++; throw new Error(`No target for workflow: ${wfId}`); }
    return this.send(from, target, payload);
  }

  routeByAgent(agentId, from, payload, router) {
    const agent = (router || this._router).agents.resolve(agentId);
    if (!agent) { this.stats.failed++; throw new Error(`Unknown agent: ${agentId}`); }
    return this.send(from, agentId, payload);
  }

  routeByRuntime(runtimeName, from, payload, router) {
    const rt = (router || this._router).runtimes.select();
    if (!rt) { this.stats.failed++; throw new Error(`No healthy runtime`); }
    return this.send(from, rt.name, payload);
  }
}

module.exports = { Dispatcher };
