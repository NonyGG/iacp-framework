'use strict';

function deepFreeze(obj) {
  Object.keys(obj).forEach(k => { if (obj[k] && typeof obj[k] === 'object') deepFreeze(obj[k]); });
  return Object.freeze(obj);
}

function isObject(v) { return v !== null && typeof v === 'object' && !Array.isArray(v); }
function isString(v) { return typeof v === 'string'; }
function isNumber(v) { return typeof v === 'number' && !isNaN(v); }
function isFunction(v) { return typeof v === 'function'; }
function isDefined(v) { return v !== null && v !== undefined; }

function validate(checks) {
  const errors = [];
  for (const [name, value, predicate, message] of checks) {
    if (!predicate(value)) errors.push({ field: name, message: message || `Validation failed for ${name}` });
  }
  return errors;
}

function formatTimestamp(ts) { return new Date(ts || Date.now()).toISOString(); }

function retry(asyncFn, options = {}) {
  const maxAttempts = options.maxAttempts || 3;
  const delay = options.delay || 100;
  const backoff = options.backoff || 2;
  let attempt = 0;
  const execute = async () => {
    try { return await asyncFn(); }
    catch (err) {
      attempt++;
      if (attempt >= maxAttempts) throw err;
      await new Promise(r => setTimeout(r, delay * Math.pow(backoff, attempt - 1)));
      return execute();
    }
  };
  return execute();
}

function debounce(fn, wait = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

function throttle(fn, limit = 300) {
  let inThrottle = false;
  return (...args) => {
    if (!inThrottle) { fn(...args); inThrottle = true; setTimeout(() => { inThrottle = false; }, limit); }
  };
}

module.exports = { deepFreeze, isObject, isString, isNumber, isFunction, isDefined, validate, formatTimestamp, retry, debounce, throttle };
