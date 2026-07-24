'use strict'; module.exports = { connect(t) { return { name: "'openai'", send(p) { return t?t.deliver(JSON.stringify(p)):null; } }; } };
