'use strict'; module.exports = { connect(t) { return { name: "'codex'", send(p) { return t?t.deliver(JSON.stringify(p)):null; } }; } };
