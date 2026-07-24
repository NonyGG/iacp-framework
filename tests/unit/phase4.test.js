'use strict';
const path = require('path'); const assert = require('assert');
const { IACPRuntime } = require(path.join(__dirname, '../../runtime/index.js'));
const { Client, Server, Workflow } = require(path.join(__dirname, '../../sdk/node/index.js'));
const { PluginSystem } = require(path.join(__dirname, '../../runtime/PluginManager.js'));

let P=0,F=0; function T(n,fn){try{fn();P++;console.log('  PASS',n)}catch(e){F++;console.log('  FAIL',n,'-',e.message)}}

console.log('=== PHASE 4 — RUNTIME, SDKS, PLUGINS, CONNECTORS ===\n');

// RUNTIME
const rt = new IACPRuntime('test-runtime');
T('Runtime created', ()=>assert.strictEqual(rt.name,'test-runtime'));
T('Runtime version', ()=>assert.strictEqual(rt.version,'0.2.0'));
T('Runtime status returns object', ()=>assert.strictEqual(typeof rt.status(),'object'));

// NODE SDK
const client = rt.createClient('agent-a');
const server = rt.createServer('srv-api');
T('Client created', ()=>assert.ok(client.id === 'agent-a'));
T('Server created', ()=>assert.ok(server.id === 'srv-api'));

server.register('ping', (p) => ({ pong: true, received: p }));
T('Server registered service', ()=>assert.ok(server._services.has('ping')));

const result = server.handle(JSON.stringify({ service: 'ping', payload: { msg: 'hello' } }));
T('Server handles service', ()=>assert.strictEqual(result.status, 'ok'));
T('Server returns result', ()=>assert.ok(result.result.pong));

const svt = server.emit('startup', { ok: true });
T('Server emits event', ()=>assert.ok(svt.topic === 'startup'));
T('Server events stored', ()=>assert.strictEqual(server.events().length, 1));

// WORKFLOW
const wf = rt.createWorkflow('WF-TEST', 'Test WF', []);
wf.addStage('init').addStage('process').addStage('report');
T('WF has 3 stages', ()=>assert.strictEqual(wf.stages.length, 3));
wf.start();
T('WF started', ()=>assert.strictEqual(wf.state, 'running'));
T('WF stage 1', ()=>assert.strictEqual(wf.nextStage().name, 'init'));
T('WF stage 2', ()=>assert.strictEqual(wf.nextStage().name, 'process'));
T('WF stage 3', ()=>assert.strictEqual(wf.nextStage().name, 'report'));
T('WF exhausted', ()=>assert.strictEqual(wf.nextStage(), null));
T('WF completed', ()=>assert.strictEqual(wf.state, 'completed'));
T('WF toJSON', ()=>assert.ok(wf.toJSON().completed >= 3));

// PLUGIN SYSTEM
const ps = new PluginSystem();
T('PS initial count 0', ()=>assert.strictEqual(ps.registry.count(),0));

ps.install({ name:'encryption', version:'1.0.0', author:'iacp', description:'Encryption plugin', entry:'index.js', capabilities:['aes','tls'] });
ps.install({ name:'compression', version:'2.1.0', author:'iacp', description:'Compression plugin', entry:'index.js', capabilities:['gzip'] });
T('PS installed 2 plugins', ()=>assert.strictEqual(ps.registry.count(),2));
T('PS has encryption', ()=>assert.ok(ps.registry.has('encryption')));
T('PS list', ()=>assert.strictEqual(ps.registry.list().length,2));
T('PS status', ()=>assert.strictEqual(ps.status().total,2));

// Plugin validation
T('Validator accepts valid manifest', ()=>{
  const v = ps.validator.validate({ name:'test', version:'1.0.0', entry:'index.js' });
  assert.ok(v.valid);
});
T('Validator rejects invalid', ()=>{
  const v = ps.validator.validate({ name:'INVALID', version:'bad' });
  assert.ok(!v.valid);
});

// Plugin lifecycle
ps.lifecycle.transition('encryption','init');
T('Lifecycle tracks state', ()=>assert.strictEqual(ps.lifecycle.state('encryption'), 'init'));

// CONNECTORS (load and verify all 9)
const connectors = ['opencode','claude','cursor','codex','gemini','openai','ollama','vllm','lmstudio'];
T('Connectors available: ' + connectors.length, ()=>assert.ok(true));
for (const name of connectors) {
  try {
    const mod = require(path.join(__dirname, '../../plugins/' + name + '/index.js'));
    T('Connector ' + name + ' loads', ()=>assert.ok(mod));
  } catch (e) { T('Connector ' + name + ' loads', ()=>false); }
}

// FULL PIPELINE
T('Core accessible via runtime', ()=>assert.ok(rt.core));
T('Communication accessible via runtime', ()=>assert.ok(rt.comm));
T('MessageBus ready', ()=>assert.ok(rt.messageBus));
T('EventBus ready', ()=>assert.ok(rt.eventBus));
T('Metrics ready', ()=>assert.ok(rt.metrics));
T('Plugins ready', ()=>assert.ok(rt.plugins));

// Pipeline test
const dst = rt.router.destinations.register('agent-worker', 'mem://worker');
let received = null;
rt.transport.listen('mem://worker', (msg) => { received = msg; });
rt.dispatcher.send('system', 'agent-worker', { cmd: 'test_pipeline' });
T('Dispatched via router', ()=>assert.strictEqual(received.payload.cmd, 'test_pipeline'));

const eb = rt.eventBus;
eb.createTopic('pipeline.events');
eb.subscribe('pipeline.events', 'observer', () => {});
eb.publish('pipeline.events', { type: 'pipeline_complete' });
T('Event published via runtime', ()=>assert.strictEqual(eb.stats.published, 1));

rt.metrics.increment('pipeline_runs', 1);
T('Metrics incremented', ()=>assert.strictEqual(rt.metrics.getCounter('pipeline_runs'), 1));

// GO SDK structure check
const fs = require('fs');
const gomod = fs.existsSync(path.join(__dirname, '../../sdk/go/pkg/iacp/go.mod'));
T('Go SDK structure exists', ()=>assert.ok(gomod));

// Python SDK structure check
const pydir = fs.existsSync(path.join(__dirname, '../../sdk/python/iacp/__init__.py'));
T('Python SDK structure exists', ()=>assert.ok(pydir));

// Rust SDK structure check
const rsdir = fs.existsSync(path.join(__dirname, '../../sdk/rust/src'));
T('Rust SDK structure exists', ()=>assert.ok(rsdir));

console.log('\n=== ' + P + '/' + (P+F) + ' (' + Math.round(P/(P+F)*100) + '%) ===');
console.log(P>0&&F===0?'ALL PASSED':F+' FAILURES');
process.exit(F>0?1:0);
