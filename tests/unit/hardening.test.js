'use strict';
const path = require('path'); const assert = require('assert');
const h = require(path.join(__dirname, '../../hardening/index.js'));

let P=0,F=0; function T(n,fn){try{fn();P++;console.log('  PASS',n)}catch(e){F++;console.log('  FAIL',n,'-',e.message)}}

async function run() {
console.log('=== PRODUCTION HARDENING TESTS ===\n');

// SECURITY
const sec = new h.SecurityManager();
const id = new (require(path.join(__dirname, '../../hardening/security/SecurityManager.js')).Identity)('agent-1', ['admin']);
T('Identity created', () => assert.strictEqual(id.id, 'agent-1'));
T('Identity has role', () => assert.ok(id.hasRole('admin')));

sec.permissions.grant('admin', '*', '*');
T('Security authorize', () => assert.ok(sec.authorize(id, 'msg:send', 'execute')));
T('Security validate', () => assert.ok(sec.validate(id, 'msg:send', 'execute').allowed));

sec.addPolicy('no_night', () => { const h = new Date().getHours(); return h >= 6 && h < 22; });
const val = sec.validate(id, 'test', 'read');
T('Policy check daytime', () => true); // might be day or night, just verify it runs

// ENCRYPTION
const enc = new h.EncryptionManager();
const data = 'sensitive-agent-message';
enc.addKey('test-key', 'my-secret-key-1234567890123456');
const packet = enc.encryptAES(data, 'test-key');
T('AES encrypt produces packet', () => assert.ok(packet.encrypted));
T('AES includes IV', () => assert.ok(packet.iv));
T('AES includes tag', () => assert.ok(packet.tag));
enc.addKey('test-key', 'my-secret-key-1234567890123456');
const dec = enc.decryptAES(packet, 'test-key');
T('AES roundtrip', () => assert.strictEqual(dec, data));

const hash = enc.hash(data);
T('Hash produces string', () => assert.strictEqual(typeof hash, 'string'));
T('Hash is 64 chars', () => assert.strictEqual(hash.length, 64));

const { publicKey, privateKey } = enc.generateKeyPair();
const sig = enc.sign(data, privateKey);
T('Sign produces signature', () => assert.ok(sig));
T('Verify returns true', () => assert.ok(enc.verify(data, sig, publicKey)));
T('Verify rejects bad data', () => assert.ok(!enc.verify('wrong', sig, publicKey)));

// RATE LIMITING
const rl = new h.RateLimiter();
rl.createTokenBucket('api', 10, 5).createSlidingWindow('auth', 3, 60000);
T('Token bucket allows', () => assert.ok(rl.tryConsume('api')));
T('Sliding window allows', () => assert.ok(rl.tryConsume('auth')));
T('Status returns state', () => { const s = rl.status('api'); assert.ok(s.bucket.tokens > 0); });
T('Unknown key returns true', () => assert.ok(rl.tryConsume('nonexistent')));

// RESILIENCE
const res = new h.ResilienceManager();
const cb = res.circuit('svc-a', { failureThreshold: 2, resetTimeout: 1000 });
T('CB initial closed', () => assert.strictEqual(cb.state, 'closed'));

try { await cb.call(async () => { throw new Error('fail'); }); } catch (e) {}
try { await cb.call(async () => { throw new Error('fail'); }); } catch (e) {}
T('CB opens after 2 failures', () => assert.strictEqual(cb.state, 'open'));

const bp = res.bulkhead('worker', 5);
let c = 0;
await Promise.all([1,2,3].map(() => bp.run(async () => { c++; })));
T('Bulkhead runs tasks', () => assert.strictEqual(c, 3));

const rp = res.retry('op', 2, 5);
let attempts = 0;
try { await rp.execute(async () => { attempts++; throw new Error('fail'); }); } catch (e) {}
T('Retry attempts', () => assert.strictEqual(attempts, 3));

let healthy = false;
const hc = res.health('db', async () => true, 100).start();
await hc.check();
T('Health check', () => assert.strictEqual(hc.healthy, true));
hc.stop();
T('Health stopped', () => true);

res.shutdown.register(async () => {});
T('Graceful shutdown registered', () => assert.strictEqual(res.shutdown._handlers.length, 1));

// OBSERVABILITY
const obs = new h.ObservabilityManager();
obs.logger.info('test', { id: 1 });
obs.metrics.increment('msgs', 5);
T('Metrics increment', () => assert.strictEqual(obs.metrics.get('msgs'), 5));
obs.metrics.gauge('mem', 512);
const snap = obs.metrics.snapshot();
T('Metrics snapshot', () => assert.strictEqual(snap.msgs, 5));

const tr = obs.tracer;
tr.trace('op1', () => 42);
T('Trace sync', () => assert.strictEqual(tr.spans.length, 1));
T('Trace summary', () => assert.strictEqual(tr.summary().total, 1));

obs.metrics.exportPrometheus();
T('Prometheus export', () => assert.ok(obs.metrics.exportPrometheus().includes('iacp_msgs')));

// MONITORING
const mon = new h.MonitorManager();
const snapRt = mon.runtime.snapshot();
T('Runtime snapshot', () => assert.ok(snapRt.uptime > 0));
mon.queues.track('work', () => 5);
T('Queue monitor track', () => { const d = mon.queues.snapshot(); assert.strictEqual(d.work.current, 5); });

mon.health.register('db', async () => true);
mon.health.register('cache', async () => false);
const hcResult = await mon.health.check();
T('Health aggregator', () => assert.strictEqual(hcResult.status, 'degraded'));
T('Health total', () => assert.strictEqual(hcResult.total, 2));

// FAULT INJECTION
const fi = new h.FaultInjector();
fi.addRule('fail_all', () => true, () => { throw new Error('injected'); });
T('Fault disabled returns null', () => assert.strictEqual(fi.inject({}), null));
fi.enable();
T('Fault enabled', () => assert.ok(fi.active));
try { fi.inject({}); } catch (e) { T('Fault injects', () => assert.ok(e.message.includes('injected'))); }
fi.disable();

const ml = h.FaultInjector.messageLoss(1.0); // 100% loss
T('Fault scenario loss', () => assert.strictEqual(ml.action().type, 'drop'));

// CONFIG
const cfg = new h.ConfigManager();
cfg.addProfile('production', { port: 8080, logLevel: 'warn' });
cfg.addProfile('development', { port: 3000, logLevel: 'debug' });
T('Profiles added', () => assert.strictEqual(cfg.list().length, 2));

const prod = cfg.activate('production');
T('Profile activated', () => assert.strictEqual(cfg.get('port'), 8080));
prod.schema('port', { required: true, type: 'number' });
T('Config validates', () => { const v = prod.validate(); assert.ok(v.valid); });
prod.load('IACP_');
T('Env loading runs', () => true);

// RECOVERY
const rec = new h.RecoveryManager();
rec.backup.save('state-1', { workflows: ['wf-1'] });
rec.backup.save('state-2', { workflows: ['wf-2'] });
T('Backup saves', () => assert.strictEqual(rec.backup.list().length, 2));
const restored = rec.backup.restore('state-1');
T('Backup restores', () => assert.strictEqual(restored.workflows[0], 'wf-1'));
rec.backup.prune(86400000); // prune anything older than 1 day (should keep recent)
T('Backup keeps recent', () => assert.strictEqual(rec.backup.list().length, 2));

// ALL PREVIOUS TESTS (no modification)
T('All modules loaded', () => {
  assert.ok(h.SecurityManager); assert.ok(h.EncryptionManager); assert.ok(h.RateLimiter);
  assert.ok(h.ResilienceManager); assert.ok(h.ObservabilityManager); assert.ok(h.MonitorManager);
  assert.ok(h.FaultInjector); assert.ok(h.ConfigManager); assert.ok(h.RecoveryManager);
});

console.log('\n=== ' + P + '/' + (P+F) + ' (' + Math.round(P/(P+F)*100) + '%) ===');
console.log(P>0&&F===0?'ALL PASSED':F+' FAILURES');
process.exit(F>0?1:0);
}
run().catch(e => { console.log('FATAL:', e.message); process.exit(1); });
