'use strict';

class FaultInjector {
  constructor() { this._rules = []; this._enabled = false; }

  enable() { this._enabled = true; return this; }
  disable() { this._enabled = false; return this; }
  get active() { return this._enabled; }

  addRule(name, condition, action) { this._rules.push({ name, condition, action }); return this; }

  inject(context = {}) {
    if (!this._enabled) return null;
    for (const rule of this._rules) {
      if (rule.condition(context)) { return rule.action(context); }
    }
    return null;
  }

  clear() { this._rules = []; return this; }

  // Pre-built fault scenarios
  static messageLoss(probability = 0.1) {
    return { name: 'message_loss', condition: () => Math.random() < probability, action: () => ({ type: 'drop', reason: 'simulated_message_loss' }) };
  }

  static timeout(delayMs = 5000) {
    return { name: 'timeout', condition: () => true, action: async () => { await new Promise(r => setTimeout(r, delayMs)); throw new Error('simulated_timeout'); } };
  }

  static transportFailure(probability = 0.05) {
    return { name: 'transport_failure', condition: () => Math.random() < probability, action: () => { throw new Error('simulated_transport_failure'); } };
  }

  static errorRate(probability = 0.2, errorMsg = 'simulated_error') {
    return { name: 'error_rate', condition: () => Math.random() < probability, action: () => { throw new Error(errorMsg); } };
  }
}

module.exports = { FaultInjector };
