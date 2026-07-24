'use strict'; module.exports = { connect(t) { return { name: "'cursor'", send(p) { return t?t.deliver(JSON.stringify(p)):null; } }; } };
