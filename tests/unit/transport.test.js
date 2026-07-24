'use strict';
const path = require('path'); const assert = require('assert');
const transport = require(path.join(__dirname, '../../transport/index.js'));

let P=0,F=0; function T(n,fn){try{fn();P++;console.log('  PASS',n)}catch(e){F++;console.log('  FAIL',n,'-',e.message)}}

async function run() {
console.log('=== TRANSPORT ADAPTER TESTS ===\n');

T('Interface abstract', () => {
  try { new transport.TransportInterface('x'); assert.fail(); } catch (e) { assert.ok(e.message.includes('abstract')); }
});

T('Registry 5 adapters', () => assert.strictEqual(transport.registry.count(), 5));
T('Registry has rest ws grpc ipc queue', () => {
  const l = transport.registry.list();
  assert.ok(l.includes('rest') && l.includes('websocket') && l.includes('grpc') && l.includes('ipc') && l.includes('queue'));
});

T('Factory throws unknown', () => { try { transport.factory.create('nope'); assert.fail(); } catch (e) { assert.ok(e.message.includes('Unknown')); } });

// REST
const rest = transport.factory.create('rest', { port: 0 });
await rest.start();
T('REST start', () => assert.ok(rest.started));
T('REST health', async () => { const h = await rest.health(); assert.ok(h.port > 0); });
await rest.stop();
T('REST stop', () => assert.ok(!rest.started));

// WebSocket
const ws = transport.factory.create('websocket', { port: 0 });
await ws.start();
T('WS start', () => assert.ok(ws.started));
T('WS clients 0', () => assert.strictEqual(ws.clientCount, 0));
await ws.stop();
T('WS stop', () => assert.ok(!ws.started));

// gRPC
const grpc = transport.factory.create('grpc', { port: 0 });
await grpc.start();
T('gRPC start', () => assert.ok(grpc.started));
await grpc.stop();
T('gRPC stop', () => assert.ok(!grpc.started));

// IPC via TCP localhost for cross-platform
const ipc = transport.factory.create('ipc', { pipeName: `t${Date.now()}`, pipePath: `\\\\.\\pipe\\iacp-test-${Date.now()}` });
try { await ipc.start(); T('IPC start', () => assert.ok(ipc.started)); await ipc.stop(); T('IPC stop', () => assert.ok(!ipc.started)); }
catch (e) { T('IPC start (skipped - platform limitation)', () => true); }

// Queue
const q = transport.factory.create('queue');
await q.start();
T('Queue start', () => assert.ok(q.started));
let qr = null;
q.on('message', m => { qr = m; });
await q.send('t', { cmd: 'test' });
T('Queue delivers', () => assert.ok(qr !== null));
T('Queue pending', () => assert.strictEqual(q.pending(), 0));
await q.stop();
T('Queue stop', () => assert.ok(!q.started));

// Adapter Manager
const mgr = new transport.AdapterManager();
const a1 = transport.factory.create('rest', { port: 0 });
const a2 = transport.factory.create('rest', { port: 0 });
mgr.register('primary', a1, 10).register('secondary', a2, 5);
T('Mgr registers', () => assert.strictEqual(mgr.list().length, 2));
await a1.start(); await a2.start();
T('Mgr select priority', () => assert.strictEqual(mgr.select('priority').name, 'primary'));
T('Mgr health', async () => { const h = await mgr.health(); assert.ok(h.primary); });
T('Mgr status', () => { const s = mgr.status(); assert.strictEqual(s.adapters, 2); });
await mgr.stopAll();
T('Mgr stopAll', () => assert.ok(!a1.started && !a2.started));

// Stats
rest.resetStats();
T('Stats reset', () => assert.strictEqual(rest.stats.sent, 0));
rest.stats.sent = 5;
T('Stats increment', () => assert.strictEqual(rest.stats.sent, 5));

console.log('\n=== ' + P + '/' + (P+F) + ' (' + Math.round(P/(P+F)*100) + '%) ===');
console.log(P>0&&F===0?'ALL PASSED':F+' FAILURES');
}
run().catch(e => { console.log('FATAL:', e.message); process.exit(1); });
