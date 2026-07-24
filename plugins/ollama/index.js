'use strict'; module.exports = { connect(t) { return { name: "'ollama'", send(p) { return t?t.deliver(JSON.stringify(p)):null; } }; } };
