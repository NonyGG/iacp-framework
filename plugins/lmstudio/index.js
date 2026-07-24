'use strict'; module.exports = { connect(t) { return { name: "'lmstudio'", send(p) { return t?t.deliver(JSON.stringify(p)):null; } }; } };
