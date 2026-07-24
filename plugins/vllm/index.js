'use strict'; module.exports = { connect(t) { return { name: "'vllm'", send(p) { return t?t.deliver(JSON.stringify(p)):null; } }; } };
