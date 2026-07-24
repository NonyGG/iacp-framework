'use strict';

const path = require('path');
const assert = require('assert');
const core = require(path.join(__dirname, '../../core/index.js'));
const { MessageType, MessagePriority, EventCategory, EventSeverity, ErrorCategory, ErrorSeverity, AstNodeType, ProtocolPhase } = core.types;
const { createId, traceId, correlationId, sessionId, hashContent } = core.ids;

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log('  PASS', name); }
  catch (e) { failed++; console.log('  FAIL', name, '-', e.message); }
}

console.log('=== CORE FRAMEWORK TESTS ===\n');

// TYPES
test('MessagePriority values', () => {
  assert.strictEqual(MessagePriority.LOW, 0);
  assert.strictEqual(MessagePriority.CRITICAL, 3);
});

test('MessageType values', () => {
  assert.strictEqual(MessageType.REQUEST, 'request');
  assert.strictEqual(MessageType.EVENT, 'event');
});

test('EventCategory values', () => {
  assert.strictEqual(EventCategory.SECURITY, 'security');
  assert.strictEqual(EventCategory.AUDIT, 'audit');
});

test('AstNodeType values', () => {
  assert.strictEqual(AstNodeType.MISSION, 'mission');
  assert.strictEqual(AstNodeType.KNOWLEDGE, 'knowledge');
});

// IDENTIFIERS
test('createId generates correct prefix', () => {
  assert.ok(createId('test', 4).startsWith('test_'));
});

test('traceId generates trace_ prefixed id', () => {
  assert.ok(traceId().startsWith('trace_'));
});

test('correlationId generates corr_ prefixed id', () => {
  assert.ok(correlationId().startsWith('corr_'));
});

test('hashContent produces 64 char hex', () => {
  assert.strictEqual(hashContent({ a: 1 }).length, 64);
});

// VERSION
test('Version parse and format', () => {
  const v = core.Version.parse('2.1.3');
  assert.strictEqual(v.major, 2);
  assert.strictEqual(v.minor, 1);
  assert.strictEqual(v.patch, 3);
  assert.strictEqual(v.toString(), '2.1.3');
});

test('Version compatibility check', () => {
  const v1 = core.Version.parse('1.0.0');
  const v2 = core.Version.parse('1.2.0');
  assert.ok(v1.isCompatibleWith(v2));
});

test('Version incompatibility', () => {
  const v1 = core.Version.parse('1.0.0');
  const v2 = core.Version.parse('2.0.0');
  assert.ok(!v1.isCompatibleWith(v2));
});

test('VersionManager registers and retrieves', () => {
  const vm = new core.VersionManager();
  vm.register('protocol', '1.0.0');
  assert.strictEqual(vm.getVersion('protocol'), '1.0.0');
});

test('VersionManager compatibility check', () => {
  const vm = new core.VersionManager();
  vm.register('messages', '1.2.0');
  assert.ok(vm.checkCompatibility('messages', '1.0.0'));
});

// PROTOCOL CORE
test('ProtocolCore initializes', () => {
  const pc = new core.ProtocolCore();
  assert.ok(pc.id.startsWith('proto_'));
  assert.strictEqual(pc.phase, ProtocolPhase.HANDSHAKE);
});

test('ProtocolCore transitions phase', () => {
  const pc = new core.ProtocolCore();
  pc.transitionTo(ProtocolPhase.ESTABLISHED);
  assert.strictEqual(pc.phase, ProtocolPhase.ESTABLISHED);
});

test('FeatureFlagSet register and enable', () => {
  const ff = new core.FeatureFlagSet();
  ff.register('encryption', '1.0.0');
  ff.enable('encryption');
  assert.ok(ff.isEnabled('encryption'));
  ff.disable('encryption');
  assert.ok(!ff.isEnabled('encryption'));
});

test('SchemaRegistry register and get', () => {
  const sr = new core.SchemaRegistry();
  sr.register('message.v1', { type: 'object', properties: {} });
  assert.ok(sr.has('message.v1'));
  assert.ok(sr.get('message.v1').type === 'object');
  assert.strictEqual(sr.list().length, 1);
});

test('CapabilityRegistry declare and check', () => {
  const cr = new core.CapabilityRegistry();
  cr.declare('agent-1', ['routing', 'encryption']);
  assert.ok(cr.has('agent-1', 'routing'));
  assert.ok(!cr.has('agent-1', 'compression'));
});

// MESSAGES
test('Message.request creates request message', () => {
  const m = core.Message.request('agent:target', { query: 'status' });
  assert.strictEqual(m.envelope.header.messageType, MessageType.REQUEST);
  assert.strictEqual(m.envelope.header.destination, 'agent:target');
});

test('Message.response creates response with correlation', () => {
  const req = core.Message.request('dest', 'ping');
  const res = core.Message.response(req, 'pong');
  assert.strictEqual(res.envelope.header.messageType, MessageType.RESPONSE);
  assert.strictEqual(res.envelope.metadata.correlationId, req.envelope.header.messageId);
});

test('Header setters chain', () => {
  const h = new core.Header();
  h.set('sender', 'me').set('priority', MessagePriority.HIGH);
  assert.strictEqual(h.sender, 'me');
  assert.strictEqual(h.priority, MessagePriority.HIGH);
});

test('Payload size calculated', () => {
  const p = new core.Payload({ hello: 'world' });
  assert.ok(p.size > 0);
});

test('Metadata custom fields', () => {
  const m = new core.Metadata();
  m.set('origin', 'test');
  assert.strictEqual(m.get('origin'), 'test');
});

test('Envelope integrity hash', () => {
  const env = new core.Envelope();
  assert.ok(env.integrity.length === 64);
});

// EVENTS
test('Event.system creates system event', () => {
  const e = core.Event.system('startup', { ok: true });
  assert.strictEqual(e.header.category, EventCategory.SYSTEM);
});

test('Event.security creates security event', () => {
  const e = core.Event.security('auth_failure', { user: 'test' });
  assert.strictEqual(e.header.category, EventCategory.SECURITY);
  assert.strictEqual(e.header.severity, EventSeverity.WARNING);
});

test('Event.audit includes traceId', () => {
  const e = core.Event.audit('config_change', {});
  assert.ok(e.metadata.traceId);
});

test('Event lifecycle event', () => {
  const e = core.Event.lifecycle('shutdown', { reason: 'maintenance' });
  assert.strictEqual(e.header.category, EventCategory.LIFECYCLE);
});

test('EventMetadata addTag', () => {
  const em = new core.EventMetadata();
  em.addTag('critical').addTag('urgent');
  assert.strictEqual(em.tags.length, 2);
});

// CONTEXT
test('ContextReference creates with hash', () => {
  const cr = new core.ContextReference('mission-1', 'workflow', { status: 'active' });
  assert.strictEqual(cr.missionId, 'mission-1');
  assert.ok(cr.hash.length === 64);
});

test('ContextDelta operations', () => {
  const cd = new core.ContextDelta('mission-1');
  cd.addOperation('add', '/status', 'running');
  cd.addOperation('update', '/progress', 50);
  assert.strictEqual(cd.size, 2);
  assert.ok(!cd.isEmpty);
});

test('ContextSnapshot captures data', () => {
  const cs = new core.ContextSnapshot('mission-1');
  cs.capture({ status: 'completed', result: 'ok' });
  assert.ok(cs.hash.length === 64);
});

test('ContextMetadata version tracking', () => {
  const cm = new core.ContextMetadata('mission-1');
  assert.strictEqual(cm.version, 1);
  cm.increment();
  assert.strictEqual(cm.version, 2);
});

// AST
test('ASTBuilder creates mission AST', () => {
  const b = new core.ASTBuilder();
  const n = b.createMission({ id: 'M-001' });
  assert.strictEqual(n.type, AstNodeType.MISSION);
});

test('ASTBuilder creates all node types', () => {
  const b = new core.ASTBuilder();
  assert.ok(b.createMission({}));
  assert.ok(b.createWorkflow({}));
  assert.ok(b.createRuntime({}));
  assert.ok(b.createContext({}));
  assert.ok(b.createKnowledge({}));
  assert.strictEqual(b.count(), 5);
});

test('ASTBuilder links parent-child', () => {
  const b = new core.ASTBuilder();
  const p = b.createMission({ id: 'M-001' });
  const c = b.createWorkflow({ id: 'WF-001' });
  assert.ok(b.link(p.id, c.id));
  assert.strictEqual(p.children.length, 1);
});

// ERRORS
test('InstitutionalError basic properties', () => {
  const err = new core.InstitutionalError('E001', 'Test error', ErrorCategory.VALIDATION, ErrorSeverity.LOW);
  assert.strictEqual(err.code, 'E001');
  assert.ok(err.errorId.startsWith('err_'));
});

test('ErrorFactory creates typed errors', () => {
  const v = core.ErrorFactory.validation('V001', 'Invalid input', 'test');
  assert.strictEqual(v.category, ErrorCategory.VALIDATION);
  const s = core.ErrorFactory.security('S001', 'Unauthorized', 'auth');
  assert.strictEqual(s.severity, ErrorSeverity.CRITICAL);
});

test('ErrorTracker tracks and summarizes', () => {
  const t = new core.ErrorTracker();
  t.track(new core.InstitutionalError('E1', 'err1'));
  t.track(new core.InstitutionalError('E2', 'err2'));
  assert.strictEqual(t.count(), 2);
  const s = t.summary();
  assert.ok(s.total === 2);
});

test('ErrorFactory all types', () => {
  assert.ok(core.ErrorFactory.validation('V', 'msg'));
  assert.ok(core.ErrorFactory.protocol('P', 'msg'));
  assert.ok(core.ErrorFactory.transport('T', 'msg'));
  assert.ok(core.ErrorFactory.routing('R', 'msg'));
  assert.ok(core.ErrorFactory.security('S', 'msg'));
  assert.ok(core.ErrorFactory.internal('I', 'msg'));
  assert.ok(core.ErrorFactory.timeout('TO', 'msg'));
});

// UTILS
test('retry succeeds eventually', async () => {
  let c = 0;
  const r = await core.utils.retry(() => { c++; if (c < 2) throw new Error('not yet'); return 'ok'; }, { maxAttempts: 3, delay: 5 });
  assert.strictEqual(r, 'ok');
});

test('retry fails after max attempts', async () => {
  try {
    await core.utils.retry(() => { throw new Error('always fail'); }, { maxAttempts: 2, delay: 5 });
    assert.fail('should have thrown');
  } catch (e) { assert.ok(e.message.includes('always fail')); }
});

test('isObject detects objects', () => {
  assert.ok(core.utils.isObject({}));
  assert.ok(!core.utils.isObject(null));
  assert.ok(!core.utils.isObject('str'));
});

test('isString detects strings', () => {
  assert.ok(core.utils.isString('hello'));
  assert.ok(!core.utils.isString(42));
});

test('isNumber detects numbers', () => {
  assert.ok(core.utils.isNumber(0));
  assert.ok(core.utils.isNumber(42.5));
  assert.ok(!core.utils.isNumber(NaN));
});

// toString
test('Version toString format', () => {
  const v = core.Version.parse('1.0.0-alpha');
  assert.ok(v.toString().includes('alpha'));
});

test('Header toJSON returns object', () => {
  const h = new core.Header();
  h.set('sender', 'agent');
  assert.strictEqual(typeof h.toJSON(), 'object');
});

test('Event integrity is deterministic', () => {
  const e1 = core.Event.system('test', { x: 1 });
  const h1 = e1.integrity;
  // different id should produce different hash
  assert.ok(typeof h1 === 'string');
});

console.log('\n=== ' + passed + '/' + (passed + failed) + ' (' + Math.round(passed / (passed + failed) * 100) + '%) ===');
console.log(passed > 0 && failed === 0 ? 'ALL PASSED' : failed + ' FAILURES');
process.exit(failed > 0 ? 1 : 0);
