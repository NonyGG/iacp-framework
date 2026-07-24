'use strict';

const { ErrorCategory, ErrorSeverity } = require('../common/types.js');
const { createId } = require('../common/identifiers.js');

class InstitutionalError extends Error {
  constructor(code, message, category = ErrorCategory.INTERNAL, severity = ErrorSeverity.MEDIUM) {
    super(message);
    this.name = 'InstitutionalError';
    this.errorId = createId('err', 8);
    this.code = code;
    this.category = category;
    this.severity = severity;
    this.timestamp = Date.now();
    this.context = {};
    this.cause = null;
  }

  withContext(key, value) { this.context[key] = value; return this; }
  withCause(cause) { this.cause = cause; return this; }

  toJSON() {
    return {
      errorId: this.errorId, code: this.code, message: this.message,
      category: this.category, severity: this.severity, timestamp: this.timestamp,
      context: this.context, cause: this.cause ? this.cause.message : null,
    };
  }
}

class ErrorTracker {
  constructor() { this._errors = []; }

  track(error) {
    const entry = { error: error.toJSON ? error.toJSON() : { message: error.message }, trackedAt: Date.now() };
    this._errors.push(entry);
    return entry;
  }

  recent(count = 10) { return this._errors.slice(-count); }
  byCategory(category) { return this._errors.filter(e => e.error.category === category); }
  bySeverity(severity) { return this._errors.filter(e => e.error.severity === severity); }
  count() { return this._errors.length; }
  clear() { this._errors = []; }

  summary() {
    const cats = {};
    const sevs = {};
    this._errors.forEach(e => {
      const cat = e.error.category || 'unknown'; cats[cat] = (cats[cat] || 0) + 1;
      const sev = e.error.severity; sevs[sev] = (sevs[sev] || 0) + 1;
    });
    return { total: this._errors.length, categories: cats, severities: sevs };
  }
}

class ErrorFactory {
  static validation(code, msg, ctx) { return new InstitutionalError(code, msg, ErrorCategory.VALIDATION, ErrorSeverity.LOW).withContext('domain', ctx); }
  static protocol(code, msg, ctx) { return new InstitutionalError(code, msg, ErrorCategory.PROTOCOL, ErrorSeverity.HIGH).withContext('domain', ctx); }
  static transport(code, msg, ctx) { return new InstitutionalError(code, msg, ErrorCategory.TRANSPORT, ErrorSeverity.HIGH).withContext('domain', ctx); }
  static routing(code, msg, ctx) { return new InstitutionalError(code, msg, ErrorCategory.ROUTING, ErrorSeverity.MEDIUM).withContext('domain', ctx); }
  static security(code, msg, ctx) { return new InstitutionalError(code, msg, ErrorCategory.SECURITY, ErrorSeverity.CRITICAL).withContext('domain', ctx); }
  static internal(code, msg, ctx) { return new InstitutionalError(code, msg, ErrorCategory.INTERNAL, ErrorSeverity.CRITICAL).withContext('domain', ctx); }
  static timeout(code, msg, ctx) { return new InstitutionalError(code, msg, ErrorCategory.TIMEOUT, ErrorSeverity.MEDIUM).withContext('domain', ctx); }
}

module.exports = { InstitutionalError, ErrorTracker, ErrorFactory };
