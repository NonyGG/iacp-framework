'use strict';
const path = require('path'); const assert = require('assert');
const eco = require(path.join(__dirname, '../../ecosystem/index.js'));

let P=0,F=0; function T(n,fn){try{fn();P++;console.log('  PASS',n)}catch(e){F++;console.log('  FAIL',n,'-',e.message)}}

console.log('=== ECOSYSTEM TESTS ===\n');

// MARKETPLACE
const mp = new eco.PluginMarketplace();
const p1 = mp.publish({ id:'agent-router', name:'Agent Router', version:'1.0.0', author:'iacp', description:'Route messages between agents', tags:['routing','messaging'], iacpVersion:'>=0.2.0' });
T('Plugin published', () => assert.strictEqual(p1.name,'Agent Router'));
T('Catalog count', () => assert.strictEqual(mp.catalog.count(),1));

mp.publish({ id:'data-transformer', name:'Data Transformer', version:'0.5.0', author:'community', description:'Transform message payloads', tags:['data','transform'], iacpVersion:'>=0.1.0' });
mp.publish({ id:'logger-ext', name:'Logger Extension', version:'2.1.0', author:'iacp', description:'Extended logging', tags:['logging','observability'] });
T('3 plugins', () => assert.strictEqual(mp.catalog.count(),3));

// SEARCH
T('Search by name', () => assert.strictEqual(mp.search('router').length,1));
T('Search by tag', () => assert.strictEqual(mp.catalog.byTag('data').length,1));
T('Search by author', () => assert.strictEqual(mp.catalog.byAuthor('iacp').length,2));
T('Top rated', () => assert.ok(Array.isArray(mp.catalog.topRated(5))));
T('Recently updated', () => assert.ok(Array.isArray(mp.catalog.recentlyUpdated(5))));
T('Marketplace stats', () => { const s = mp.stats(); assert.strictEqual(s.plugins,3); });

// VALIDATION
T('Validator passes valid', () => assert.ok(mp.validator.validate({ id:'a', name:'A', version:'1.0.0' }).valid));
T('Validator fails invalid', () => { const v = mp.validator.validate({ id:'INVALID', version:'bad' }); assert.ok(!v.valid); assert.ok(v.errors.length >= 2); });
T('Compatibility check passes', () => assert.ok(mp.validator.checkCompatibility(p1,'0.2.0')));
T('Compatibility fails', () => { const p = { iacpVersion:'>=1.0.0' }; assert.ok(!mp.validator.checkCompatibility(p,'0.2.0')); });

// SIGNING
const keyPair = require('crypto').generateKeyPairSync('rsa', { modulusLength: 2048 });
mp.signing.addKey('iacp', keyPair.publicKey);
mp.signing.sign(p1, keyPair.privateKey);
T('Signing sets signature', () => assert.ok(p1.signature));
T('Signing verifies', () => assert.ok(mp.signing.verify(p1)));

// DISCOVERY
const disc = new eco.PluginDiscovery(mp);
disc.install('agent-router');
T('Discovery install', () => assert.ok(disc.isInstalled('agent-router')));
disc.install('logger-ext');
T('2 installed', () => assert.strictEqual(disc.count(),2));
T('List installed', () => { const l = disc.getInstalled(); assert.strictEqual(l.length,2); });
disc.disable('logger-ext');
T('Disable plugin', () => { const l = disc.getInstalled(); const le = l.find(p => p.id === 'logger-ext'); assert.ok(!le.enabled); });
disc.enable('logger-ext');
T('Re-enable', () => { const l = disc.getInstalled(); const le = l.find(p => p.id === 'logger-ext'); assert.ok(le.enabled); });
disc.uninstall('logger-ext');
T('Uninstall', () => assert.strictEqual(disc.count(),1));
T('Find available', () => assert.strictEqual(disc.findAvailable('routing').length,1));

// CERTIFICATION
const cert = new eco.CertificationManager();
cert.certify('agent-router', 'certified', { tested: true });
cert.certify('data-transformer', 'compatible');
cert.certify('logger-ext', 'experimental');
T('Cert count', () => assert.strictEqual(cert.count(),3));
T('Cert summary', () => { const s = cert.summary(); assert.strictEqual(s.certified,1); });
T('Cert get', () => { const c = cert.get('agent-router'); assert.strictEqual(c.level,'certified'); });
cert.update('logger-ext', 'deprecated');
T('Update cert', () => { const c = cert.get('logger-ext'); assert.strictEqual(c.level,'deprecated'); });
cert.revoke('logger-ext');
T('Revoke', () => assert.strictEqual(cert.count(),2));

// GOVERNANCE
const gov = new eco.GovernanceManager();
const rfc = gov.createRFC('Add encryption v2', 'maintainer', 'Proposal to add AES-256-GCM support');
T('RFC created', () => assert.ok(rfc.id));
rfc.submit(); T('RFC submitted', () => assert.strictEqual(rfc.status,'review'));
rfc.approve(); T('RFC approved', () => assert.strictEqual(rfc.status,'approved'));
rfc.comment('reviewer', 'LGTM');
T('RFC comments', () => assert.strictEqual(rfc.comments.length,1));
gov.addGuideline('Commit messages', 'Use conventional commits');
T('Guidelines', () => assert.strictEqual(gov.guidelines.length,1));
gov.addMember('alice', 'maintainer');
T('Governance summary', () => { const s = gov.summary(); assert.strictEqual(s.rfcs,1); });

// API REGISTRY
const api = new eco.APIRegistry();
api.register('MessageBus.publish', { module:'communication', description:'Publish a message to a topic', version:'0.2.0', status:'stable', examples:['bus.publish("topic",{})'] });
api.register('EventBus.subscribe', { module:'communication', description:'Subscribe to events', version:'0.2.0', status:'stable' });
api.register('Runtime.createAgent', { module:'runtime', description:'Create an agent', version:'0.2.0', status:'experimental' });
T('API count', () => assert.strictEqual(api.count(),3));
T('API stable', () => assert.strictEqual(api.stable().length,2));
T('API experimental', () => assert.strictEqual(api.experimental().length,1));
T('API summary', () => { const s = api.summary(); assert.strictEqual(s.stable,2); });

// METRICS
const met = new eco.EcosystemMetrics();
const snap = met.snapshot(mp, disc, cert, api);
T('Metrics snapshot', () => assert.strictEqual(snap.marketplace.plugins,3));
T('Metrics history', () => assert.strictEqual(met.history().length,1));
met.snapshot(mp, disc, cert, api);
T('2 snapshots', () => assert.strictEqual(met.history().length,2));
T('Latest', () => assert.ok(met.latest()));

// ALL MODULES
T('All modules loaded', () => {
  assert.ok(eco.PluginMarketplace); assert.ok(eco.PluginDiscovery);
  assert.ok(eco.CertificationManager); assert.ok(eco.GovernanceManager);
  assert.ok(eco.APIRegistry); assert.ok(eco.EcosystemMetrics);
});

console.log('\n=== ' + P + '/' + (P+F) + ' (' + Math.round(P/(P+F)*100) + '%) ===');
console.log(P>0&&F===0?'ALL PASSED':F+' FAILURES');
process.exit(F>0?1:0);
