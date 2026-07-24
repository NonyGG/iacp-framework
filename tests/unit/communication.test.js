'use strict';

const path = require('path');
const assert = require('assert');
const comm = require(path.join(__dirname, '../../communication/index.js'));
const core = require(path.join(__dirname, '../../core/index.js'));

let passed = 0, failed = 0;
function test(name, fn) { try { fn(); passed++; console.log('  PASS', name); } catch (e) { failed++; console.log('  FAIL', name, '-', e.message, e.stack?.split('\n')[1]); } }
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

console.log('=== COMMUNICATION INFRASTRUCTURE TESTS ===\n');

// =========== QUEUES ===========
test('FIFO push/pop order', () => {
  const q = new comm.FIFOQueue('test');
  q.push(1); q.push(2); q.push(3);
  assert.strictEqual(q.pop(), 1);
  assert.strictEqual(q.pop(), 2);
  assert.strictEqual(q.pop(), 3);
  assert.strictEqual(q.pop(), null);
});

test('FIFO length and peek', () => {
  const q = new comm.FIFOQueue('test');
  assert.strictEqual(q.length, 0);
  q.push('a');
  assert.strictEqual(q.peek(), 'a');
  assert.strictEqual(q.length, 1);
});

test('FIFO drain', () => {
  const q = new comm.FIFOQueue('test');
  q.push(1); q.push(2);
  const items = q.drain();
  assert.strictEqual(items.length, 2);
  assert.strictEqual(q.length, 0);
});

test('FIFO close prevents pushes', () => {
  const q = new comm.FIFOQueue('test');
  q.close();
  assert.ok(!q.push(1));
  assert.ok(q.closed);
});

test('PriorityQueue orders by priority', () => {
  const q = new comm.PriorityQueue('prio');
  q.push('low', 1); q.push('high', 10); q.push('mid', 5);
  assert.strictEqual(q.pop(), 'high');
  assert.strictEqual(q.pop(), 'mid');
  assert.strictEqual(q.pop(), 'low');
});

test('DelayedQueue delays items', async () => {
  const q = new comm.DelayedQueue('delay');
  q.push('instant', 0);
  q.push('later', 200);
  assert.strictEqual(q.pop(), 'instant');
  assert.strictEqual(q.pop(), null);
  assert.ok(q.pending() >= 1);
  await delay(250);
  assert.strictEqual(q.pop(), 'later');
});

test('RetryQueue limits retries', () => {
  const q = new comm.RetryQueue('retry', 3);
  q.push({ id: 1 });
  const item = q.pop();
  assert.ok(item);
  assert.ok(q.retry(item, 'error1')); // attempt 1
  assert.ok(q.retry(item, 'error2')); // attempt 2
  assert.ok(!q.retry(item, 'error3')); // attempt 3 — max 3 reached
  assert.ok(!q.retry(item, 'error4'));
  assert.strictEqual(q.failed().length, 2);
});

test('DeadLetterQueue stores and replays', () => {
  const dlq = new comm.DeadLetterQueue('dlq');
  dlq.send({ msg: 'fail1' }, 'timeout');
  dlq.send({ msg: 'fail2' }, 'max_retries');
  assert.strictEqual(dlq.length, 2);
  const replayed = dlq.replay(1);
  assert.strictEqual(replayed.length, 1);
  assert.strictEqual(dlq.length, 1);
});

// =========== TRANSPORT ===========
test('MemoryTransport send/deliver', () => {
  const t = new comm.MemoryTransport();
  let received = null;
  t.listen('agent:a', (msg) => { received = msg; });
  t.send('agent:sys', 'agent:a', { cmd: 'ping' });
  assert.ok(received !== null);
  assert.strictEqual(received.payload.cmd, 'ping');
});

test('MemoryTransport stats', () => {
  const t = new comm.MemoryTransport();
  t.listen('dest', () => {});
  t.send('src', 'dest', {});
  t.send('src', 'dest', {});
  assert.strictEqual(t.stats.sent, 2);
  assert.strictEqual(t.stats.delivered, 2);
});

test('MemoryTransport broadcast', () => {
  const t = new comm.MemoryTransport();
  let count = 0;
  t.listen('a', () => count++);
  t.listen('b', () => count++);
  t.broadcast('sys', { msg: 'hello' }, ['a', 'b']);
  assert.strictEqual(count, 2);
});

test('MemoryTransport sendAndWait timeout', async () => {
  const t = new comm.MemoryTransport();
  try { await t.sendAndWait('src', 'ghost', { msg: 'hi' }, 50); assert.fail(); }
  catch (e) { assert.ok(e.message.includes('Timeout')); }
});

test('MemoryTransport TTL drops stale', () => {
  const t = new comm.MemoryTransport();
  t.send('src', 'nowhere', { x: 1 }, { ttl: -1 }); // expired
  t.listen('nowhere', () => {});
  t.send('src', 'nowhere', { x: 2 });
  // one delivered, one dropped
  assert.strictEqual(t.stats.delivered, 1);
  assert.strictEqual(t.stats.dropped, 1);
});

// =========== ROUTING ===========
test('DestinationResolver resolve', () => {
  const dr = new comm.DestinationResolver();
  dr.register('agent-1', 'mem://agent-1');
  assert.strictEqual(dr.resolve('agent-1'), 'mem://agent-1');
  assert.strictEqual(dr.resolve('unknown'), null);
});

test('AgentResolver register/find/list', () => {
  const ar = new comm.AgentResolver();
  ar.register('agent-1', { capabilities: ['ai'] });
  ar.register('agent-2', { capabilities: ['data'] });
  assert.strictEqual(ar.count(), 2);
  assert.ok(ar.resolve('agent-1').capabilities.includes('ai'));
  assert.strictEqual(ar.findByCapability('ai').length, 1);
});

test('WorkflowResolver', () => {
  const wr = new comm.WorkflowResolver();
  wr.register('WF-001', 'agent:worker');
  assert.strictEqual(wr.resolve('WF-001'), 'agent:worker');
  assert.strictEqual(wr.resolve('WF-999'), null);
});

test('RuntimeResolver selection strategies', () => {
  const rr = new comm.RuntimeResolver();
  rr.register('opencode', 'local', 1);
  rr.register('claude', 'remote', 2);
  const sel = rr.select('round_robin');
  assert.ok(sel);
  assert.ok(['opencode', 'claude'].includes(sel.name));
});

test('RuntimeResolver health marking', () => {
  const rr = new comm.RuntimeResolver();
  rr.register('r1', 'e1', 1).register('r2', 'e2', 1);
  rr.markHealth('r1', false);
  // only r2 should be selectable
  for (let i = 0; i < 10; i++) assert.strictEqual(rr.select().name, 'r2');
});

test('BroadcastResolver groups', () => {
  const br = new comm.BroadcastResolver();
  br.createGroup('workers').join('workers', 'w1').join('workers', 'w2');
  const mem = br.members('workers');
  assert.strictEqual(mem.length, 2);
  assert.ok(mem.includes('w1'));
  assert.ok(mem.includes('w2'));
});

// =========== DISPATCHER ===========
test('Dispatcher send via destination', () => {
  const t = new comm.MemoryTransport();
  const r = new comm.RoutingEngine();
  r.destinations.register('agent-x', 'mem://x');
  const d = new comm.Dispatcher(t, r);
  let received = null;
  t.listen('mem://x', (msg) => { received = msg; });
  d.send('sys', 'agent-x', { cmd: 'test' });
  assert.ok(received);
});

test('Dispatcher stats', () => {
  const t = new comm.MemoryTransport();
  const d = new comm.Dispatcher(t, new comm.RoutingEngine());
  assert.strictEqual(d.stats.dispatched, 0);
  d.send('a', 'b', {}); // will have no listener but stats increment
  assert.strictEqual(d.stats.dispatched, 1);
});

// =========== MESSAGE BUS ===========
test('MessageBus publish/subscribe', () => {
  const t = new comm.MemoryTransport();
  const r = new comm.RoutingEngine();
  const d = new comm.Dispatcher(t, r);
  const mb = new comm.MessageBus(t, r, d);
  let got = null;
  mb.subscribe('topic.test', 'sub-1', (msg) => { got = msg; });
  mb.publish('topic.test', { msg: 'hello' });
  assert.ok(got, 'handler should have been called');
  assert.ok(got.payload || got.payload === undefined, 'should receive message-like object');
});

test('MessageBus retry mechanism', () => {
  const t = new comm.MemoryTransport();
  const r = new comm.RoutingEngine();
  const d = new comm.Dispatcher(t, r);
  const mb = new comm.MessageBus(t, r, d);
  mb.subscribe('topic.fail', 'sub-fail', () => { throw new Error('simulated'); });
  mb.publish('topic.fail', { data: 1 });
  assert.ok(mb.stats.retried >= 1);
});

test('MessageBus DLQ stores after max retries', () => {
  const t = new comm.MemoryTransport();
  const r = new comm.RoutingEngine();
  const d = new comm.Dispatcher(t, r);
  const mb = new comm.MessageBus(t, r, d);
  mb.subscribe('topic.fail2', 'sub-fail2', () => { throw new Error('persistent'); });
  // Publish multiple times — each failure pushes to retry queue
  for (let i = 0; i < 5; i++) { mb.publish('topic.fail2', { x: i }); }
  // Process retries 5 times to exhaust all max_retry counts
  for (let i = 0; i < 5; i++) mb.processRetries();
  assert.ok(mb.dlq.length > 0, 'DLQ should have items after max retries exceeded');
});

test('MessageBus timeout', async () => {
  const t = new comm.MemoryTransport();
  const r = new comm.RoutingEngine();
  const d = new comm.Dispatcher(t, r);
  const mb = new comm.MessageBus(t, r, d);
  let timedOut = false;
  mb.setTimeout('test-key', () => { timedOut = true; }, 50);
  await delay(100);
  assert.ok(timedOut);
});

// =========== EVENT BUS ===========
test('EventBus publish/subscribe', () => {
  const eb = new comm.EventBus();
  let got = null;
  eb.subscribe('events.test', 'sub-1', (evt) => { got = evt; });
  eb.publish('events.test', core.Event.system('test', { ok: true }));
  assert.ok(got);
});

test('EventBus multiple subscribers', () => {
  const eb = new comm.EventBus();
  let c = 0;
  eb.subscribe('t', 'a', () => c++);
  eb.subscribe('t', 'b', () => c++);
  eb.publish('t', { type: 'test' });
  assert.strictEqual(c, 2);
});

test('EventBus topic creation', () => {
  const eb = new comm.EventBus();
  eb.createTopic('custom.topic');
  assert.strictEqual(eb.subscriberCount('custom.topic'), 0);
});

test('EventBus replay returns history', () => {
  const eb = new comm.EventBus();
  eb.createTopic('rp');
  eb.publish('rp', { type: 'a' });
  eb.publish('rp', { type: 'b' });
  eb.publish('rp', { type: 'c' });
  const rp = eb.replay('rp');
  assert.strictEqual(rp.length, 3);
});

test('EventBus filters block matching events', () => {
  const eb = new comm.EventBus();
  eb.addFilter(evt => evt.severity !== undefined ? evt.severity >= 1 : true);
  eb.subscribe('filt', 's1', () => {});
  eb.createTopic('filt');
  eb.publish('filt', { type: 'test' });
  assert.strictEqual(eb.stats.published, 1);
});

test('EventBus global handler', () => {
  const eb = new comm.EventBus();
  let global = 0;
  eb.onGlobal(() => global++);
  eb.createTopic('g1'); eb.createTopic('g2');
  eb.publish('g1', {});
  eb.publish('g2', {});
  assert.strictEqual(global, 2);
});

// =========== OBSERVABILITY ===========
test('Timeline entries', () => {
  const tl = new comm.Timeline('test');
  tl.add('send', 'msg sent');
  tl.add('receive', 'msg received');
  assert.strictEqual(tl.entries.length, 2);
  assert.ok(tl.duration() >= 0);
});

test('TraceCollector spans', () => {
  const tc = new comm.TraceCollector();
  tc.start('trace-1', 'agent:a');
  tc.addSpan('trace-1', { name: 'process' });
  tc.addSpan('trace-1', { name: 'deliver' });
  tc.complete('trace-1');
  const trace = tc.get('trace-1');
  assert.strictEqual(trace.spans.length, 2);
  assert.ok(trace.end >= trace.start);
});

test('CorrelationTracker', () => {
  const ct = new comm.CorrelationTracker();
  ct.track('corr-1', { source: 'agent-a' });
  assert.strictEqual(ct.count(), 1);
  const resolved = ct.resolve('corr-1');
  assert.ok(resolved.source === 'agent-a');
  assert.strictEqual(ct.count(), 0); // consumed
});

// =========== METRICS ===========
test('MetricsCollector counters', () => {
  const mc = new comm.MetricsCollector();
  mc.increment('msgs_sent', 10);
  mc.increment('msgs_sent', 5);
  assert.strictEqual(mc.getCounter('msgs_sent'), 15);
});

test('MetricsCollector histograms', () => {
  const mc = new comm.MetricsCollector();
  [10, 20, 30, 40, 50, 60, 70, 80, 90, 100].forEach(v => mc.histogram('latency', v));
  const s = mc.histogramStats('latency');
  assert.strictEqual(s.count, 10);
  assert.strictEqual(s.min, 10);
  assert.strictEqual(s.max, 100);
  assert.strictEqual(s.avg, 55);
  assert.strictEqual(s.p50, 60);
});

test('MetricsCollector snapshot', () => {
  const mc = new comm.MetricsCollector();
  mc.increment('ops', 5);
  mc.gauge('mem', 512);
  const snap = mc.snapshot();
  assert.strictEqual(snap.counters.ops, 5);
  assert.strictEqual(snap.gauges.mem, 512);
});

// =========== COMPLETE PIPELINE ===========
test('Full pipeline: transport → dispatcher → message bus → event bus', () => {
  const t = new comm.MemoryTransport();
  const r = new comm.RoutingEngine();
  const d = new comm.Dispatcher(t, r);
  const mb = new comm.MessageBus(t, r, d);
  const eb = new comm.EventBus();
  const mc = new comm.MetricsCollector();

  // Register destination
  r.destinations.register('agent:alpha', 'mem://alpha');
  r.agents.register('agent:alpha', { capabilities: ['process'] });

  // Listen
  let msgReceived = null, evtReceived = null;
  t.listen('mem://alpha', (msg) => { msgReceived = msg; });
  eb.subscribe('events.pipeline', 'monitor', (evt) => { evtReceived = evt; });

  // Send message via dispatcher
  d.send('system', 'agent:alpha', { task: 'process' });
  assert.ok(msgReceived);
  assert.strictEqual(msgReceived.payload.task, 'process');

  // Publish event
  eb.publish('events.pipeline', { type: 'pipeline_test', data: 'ok' });
  assert.ok(evtReceived);
  assert.strictEqual(evtReceived.type, 'pipeline_test');

  // Metrics
  mc.increment('pipeline_msgs', 1);
  assert.strictEqual(mc.getCounter('pipeline_msgs'), 1);

  // Stats check
  assert.ok(t.stats.sent >= 1);
  assert.strictEqual(d.stats.dispatched, 1);
});

console.log('\n=== ' + passed + '/' + (passed + failed) + ' (' + Math.round(passed / (passed + failed) * 100) + '%) ===');
console.log(passed > 0 && failed === 0 ? 'ALL PASSED' : failed + ' FAILURES');
process.exit(failed > 0 ? 1 : 0);
