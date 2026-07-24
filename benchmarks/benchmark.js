'use strict';
const path = require('path');
const { MemoryTransport } = require(path.join(__dirname, '../communication/index.js'));
const { FIFOQueue, PriorityQueue } = require(path.join(__dirname, '../communication/index.js'));
const { EventBus, MessageBus, RoutingEngine, Dispatcher } = require(path.join(__dirname, '../communication/index.js'));
const { IACPRuntime } = require(path.join(__dirname, '../runtime/index.js'));

function bench(name, fn, iterations = 10000) {
  const start = Date.now();
  for (let i = 0; i < iterations; i++) fn(i);
  const elapsed = Date.now() - start;
  const ops = Math.round(iterations / (elapsed / 1000));
  return { name, iterations, elapsed_ms: elapsed, ops_per_sec: ops };
}

console.log('=== IACP Benchmarks ===\n');

// FIFOQueue
const q = new FIFOQueue('bench');
const r1 = bench('FIFOQueue push', (i) => q.push(i));
const r2 = bench('FIFOQueue pop', () => { const v = q.pop(); if (v === null) for (let j = 0; j < 10000; j++) q.push(j); });
console.log(`  ${r1.name}: ${r1.ops_per_sec.toLocaleString()} ops/sec (${r1.elapsed_ms}ms)`);
console.log(`  ${r2.name}: ${r2.ops_per_sec.toLocaleString()} ops/sec (${r2.elapsed_ms}ms)`);

// PriorityQueue
const pq = new PriorityQueue('bench');
const r3 = bench('PriorityQueue push', (i) => pq.push(i, i % 10));
console.log(`  ${r3.name}: ${r3.ops_per_sec.toLocaleString()} ops/sec (${r3.elapsed_ms}ms)`);

// MemoryTransport
const t = new MemoryTransport();
t.listen('bench', () => {});
const r4 = bench('MemoryTransport send', (i) => t.send('src', 'bench', { i }));
console.log(`  ${r4.name}: ${r4.ops_per_sec.toLocaleString()} ops/sec (${r4.elapsed_ms}ms)`);

// MemoryTransport broadcast
const r5 = bench('MemoryTransport broadcast x5', (i) => t.broadcast('src', { i }, ['a','b','c','d','e']));
console.log(`  ${r5.name}: ${r5.ops_per_sec.toLocaleString()} ops/sec (${r5.elapsed_ms}ms)`);

// EventBus
const eb = new EventBus(); eb.createTopic('bench');
eb.subscribe('bench', 's1', () => {});
const r6 = bench('EventBus publish', (i) => eb.publish('bench', { i }));
console.log(`  ${r6.name}: ${r6.ops_per_sec.toLocaleString()} ops/sec (${r6.elapsed_ms}ms)`);

// IACPRuntime
const rt = new IACPRuntime('bench');
const r7 = bench('IACPRuntime createClient', (i) => rt.createClient('c' + i));
console.log(`  ${r7.name}: ${r7.ops_per_sec.toLocaleString()} ops/sec (${r7.elapsed_ms}ms)`);

console.log('\n=== Benchmarks Complete ===');
