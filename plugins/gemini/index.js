'use strict'; module.exports = { connect(t) { return { name: "'gemini'", send(p) { return t?t.deliver(JSON.stringify(p)):null; } }; } };
